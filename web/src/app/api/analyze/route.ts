/**
 * analyze/route.ts - HYBRID: Python (KeyBERT + Semantic) + Requesty (AI)
 * 
 * Uses Python for: Keyword extraction + Semantic similarity
 * Uses Requesty for: Strategic reasoning + Suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATSWithConfidence } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();  // This will be Requesty key
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

async function callRequesty(prompt: string, purpose: 'analysis' | 'optimization' | 'extraction' = 'analysis') {
    const models = REQUESTY_CONFIG.modelPriorities[purpose] || REQUESTY_CONFIG.models;
    let lastError;
    
    for (const model of models) {
        try {
            const response = await axios.post(
                `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    temperature: 0.3
                },
                {
                    headers: getOpenRouterHeaders(API_KEY),
                    timeout: 30000
                }
            );
            return response.data;
        } catch (err: any) {
            console.warn(`Requesty model ${model} failed:`, err.message);
            lastError = err;
            continue;
        }
    }
    throw lastError || new Error('All Requesty models failed');
}

function buildDefaultIntelligence(industry: string) {
    return {
        role: "Software Engineer",
        domain: "Full Stack Engineer",
        stack: { 
            languages: [], frameworks: [], databases: [], cloud: [], 
            tools: [], concepts: [], soft_skills: [], action_verbs: [],
            qualifications: [], domain_keywords: []
        },
        seniority: "Mid",
        industry: industry || "Tech"
    };
}

export async function POST(req: NextRequest) {
    try {
        const {
            resume_text,
            job_description,
            jd_url,
            company_name,
            company_size,
            region,
            industry,
        } = await req.json();

        // Step 1: ATS Detection
        const atsDetection = detectATSWithConfidence({
            url: jd_url, companyName: company_name,
            companySize: company_size, region: region, industry: industry,
        });
        const atsProfile = atsDetection.profile;

        // Step 2: Python NLP (KeyBERT + Semantic)
        let pyResponse;
        let usePython = false;
        
        try {
            pyResponse = await axios.post(`${PYTHON_API_URL}/analyze`, {
                resume_text,
                job_description,
                ats_profile: atsProfile,
            }, { timeout: 15000 });
            usePython = true;
        } catch (pyErr: unknown) {
            const err = pyErr as Error;
            console.warn('Python unavailable:', err?.message || pyErr);
        }

        // Step 3: Get JD intelligence from Requesty
        let jdIntelligence = buildDefaultIntelligence(industry);
        
        if (API_KEY && API_KEY.startsWith('sk-or-v1-')) {
            try {
                const intelRes = await callRequesty(`
Extract keywords from this job:
Job: "${job_description.substring(0, 2000)}"
Return: {"role":"","domain":"seniority","languages":[],"frameworks":[],"databases":[],"cloud_platform":[],"tools":[],"concepts":[]}
                `, 'extraction');
                
                const raw = JSON.parse(intelRes.choices[0].message.content);
                jdIntelligence = {
                    role: raw.role || 'Software Engineer',
                    domain: raw.domain || 'Full Stack',
                    stack: {
                        languages: raw.languages || [],
                        frameworks: raw.frameworks || [],
                        databases: raw.databases || [],
                        cloud: raw.cloud_platform || [],
                        tools: raw.tools || [],
                        concepts: raw.concepts || [],
                        soft_skills: raw.soft_skills || [],
                        action_verbs: raw.action_verbs || [],
                        qualifications: raw.qualifications || [],
                        domain_keywords: raw.domain_keywords || []
                    },
                    seniority: raw.seniority || 'Mid',
                    industry: industry || 'Tech'
                };
            } catch (llmErr: unknown) {
                const err = llmErr as Error;
                console.warn('Requesty extraction failed:', err?.message || llmErr);
            }
        }

        // Build keyword list
        const allKeywords = [
            ...jdIntelligence.stack.languages,
            ...jdIntelligence.stack.frameworks,
            ...jdIntelligence.stack.databases,
            ...jdIntelligence.stack.cloud,
            ...jdIntelligence.stack.tools,
            ...jdIntelligence.stack.concepts,
        ];
        const uniqueKeywords = [...new Set(allKeywords)];

        // Step 4: Keyword Analysis (TypeScript)
        const kwAnalysis = analyzeKeywordDensity(resume_text, job_description, uniqueKeywords);

        // Step 5: AI Reasoning via Requesty
        let aiReasoning = pyResponse?.data?.reasoning || "Analysis complete.";
        let aiSuggestions = kwAnalysis.recommendations;

        if (API_KEY && API_KEY.startsWith('sk-or-v1-')) {
            try {
                const aiRes = await callRequesty(`
Analyze resume-job alignment:
Resume: "${resume_text.substring(0, 1000)}"
Job: "${job_description.substring(0, 1000)}"
Found: ${kwAnalysis.found.join(', ')}
Missing: ${kwAnalysis.missing.join(', ')}
Return: {"reasoning":"","suggestions":[{"title":"","description":""}]}
                `, 'analysis');

                const intel = JSON.parse(aiRes.choices[0].message.content);
                if (intel.reasoning) aiReasoning = intel.reasoning;
                if (intel.suggestions) {
                    aiSuggestions = [...aiSuggestions, ...intel.suggestions];
                }
            } catch (aiErr: unknown) {
                const err = aiErr as Error;
                console.warn('AI reasoning failed:', err?.message || aiErr);
            }
        }

        // Calculate scores - FIXED: More accurate scoring for empty/minimal resumes
        const foundCount = kwAnalysis.found.length;
        const totalCount = kwAnalysis.metrics.length;
        
        // Keyword score: Base on actual matching, not just presence
        let keywordScore = 0;
        if (totalCount > 0) {
            keywordScore = (foundCount / totalCount) * 100;
        } else if (kwAnalysis.found.length > 0) {
            keywordScore = 50; // Has keywords but no JD to compare
        } else {
            keywordScore = 10; // No keywords found at all
        }
        
        // Section compliance: Check for actual structured content, not just keywords
        const resumeLower = resume_text.toLowerCase();
        
        const yearExp = /\d[\s]*years?[\s]*(of[\s]+)?(experience|exp)/i;
        const roleMatch = /(software|fullstack|backend|frontend|developer|engineer)/i;
        const hasExperience = yearExp.test(resumeLower) || roleMatch.test(resumeLower);
        
        const hasEducation = /(university|college|bachelor|master|degree|phd|bs|ms)/i.test(resumeLower);
        const hasSkills = /(skills|technologies|proficient|involved|using|built|developed)/i.test(resumeLower);
        const hasSummary = /(summary|objective|profile|professional)/i.test(resumeLower);
        
        // Only count as present if there's actual content, not just the keyword
        const sectionChecks = [
            hasExperience && resume_text.length > 50,  // Need actual content beyond just mentioning "experience"
            hasEducation && resume_text.length > 30,
            hasSkills && resume_text.length > 30,
            hasSummary && resume_text.length > 20
        ];
        const foundSections = sectionChecks.filter(Boolean).length;
        const sectionScore = (foundSections / sectionChecks.length) * 100;
        
        // Only give high section score if there's real content
        const actualContentLength = resume_text.replace(/[^a-zA-Z0-9]/g, '').length;
        const finalSectionScore = actualContentLength < 100 ? Math.min(sectionScore, 25) : sectionScore;
        
        // Semantic score: Require actual content to have语义 relevance
        let semanticScore = pyResponse?.data?.match_forensics?.semantic_relevance || 30;
        if (actualContentLength < 100) {
            semanticScore = Math.min(semanticScore, 20);
        }
        
        // Fixed overall score calculation
        let overallScore;
        if (actualContentLength < 50) {
            overallScore = 15; // Near empty resume
        } else if (actualContentLength < 200) {
            overallScore = 25; // Minimal resume
        } else {
            overallScore = Math.min(95, Math.max(25, 
                (keywordScore * atsProfile.weights.keywords * 0.4) +
                (finalSectionScore * atsProfile.weights.structure * 0.3) +
                (semanticScore * atsProfile.weights.semantic * 0.3)
            ));
        }

        return NextResponse.json({
            score: Math.round(overallScore),
            found_keywords: kwAnalysis.found,
            missing_keywords: kwAnalysis.missing,
            reasoning: aiReasoning,
            suggestions: aiSuggestions,
            match_forensics: {
                semantic_overlap: Math.min(100, Math.max(0, Math.round(semanticScore * 0.8))),
                keyword_density: Math.min(100, Math.max(0, Math.round(keywordScore))),
                structural_integrity: Math.min(100, Math.max(0, Math.round(finalSectionScore))),
                keyword_match: Math.round(keywordScore),
                section_compliance: Math.round(finalSectionScore),
                semantic_relevance: Math.round(semanticScore),
                clarity_recency: pyResponse?.data?.match_forensics?.clarity_recency || (actualContentLength > 100 ? 70 : 30)
            },
            section_scores: {
                experience: Math.round(finalSectionScore),
                skills: Math.round(keywordScore),
                impact: actualContentLength > 50 ? Math.round(overallScore * 0.6) : 10
            },
            keyword_metrics: kwAnalysis.metrics.slice(0, 20).map((m: any) => ({
                text: m.text, found: m.found, priority: m.priority,
                count_in_jd: m.count_in_jd, count_in_resume: m.count_in_resume,
                context: m.context, recommended_bullet: m.recommended_bullet
            })),
            ats_type: atsProfile.name,
            ats_profile: {
                id: atsProfile.id, name: atsProfile.name,
                description: atsProfile.description, rules: atsProfile.rules,
                targetScore: atsProfile.targetScore,
                commonCompanies: atsProfile.commonCompanies?.slice(0, 8) || [],
                companyTraits: atsProfile.companyTraits || [],
                optimizationStrategy: atsProfile.optimizationStrategy
            },
            ats_detection: {
                confidence: atsDetection.confidence,
                method: atsDetection.detectionMethod,
                reasoning: atsDetection.reasoning
            },
            analysis_source: usePython ? 'hybrid' : 'requesty_only'
        });

    } catch (error: any) {
        console.error('Analysis Error:', error.message);
        return NextResponse.json({ error: 'Analysis failed', details: error.message }, { status: 503 });
    }
}