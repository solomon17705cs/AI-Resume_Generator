import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATSWithConfidence } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';
const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume_text, job_description, jd_url, company_name, company_size, region, industry } = await req.json();

        // 1. Enhanced ATS Detection with Multi-Signal Inference
        const atsDetection = detectATSWithConfidence({
            url: jd_url,
            companyName: company_name,
            companySize: company_size,
            region: region,
            industry: industry
        });

        const atsProfile = atsDetection.profile;

        // 2. Statistical Analysis from Python Engine
        const pyResponse = await axios.post(`${PYTHON_API_URL}/analyze`, {
            resume_text,
            job_description,
            ats_profile: atsProfile
        });

        // 3. New Robust Keyword Density Analysis
        const kwAnalysis = analyzeKeywordDensity(resume_text, job_description);

        // 4. Strategic Intelligence from Llama (Contextual Reasoning)
        let aiReasoning = pyResponse.data.reasoning;
        let aiSuggestions = kwAnalysis.recommendations; // Start with robust rule-based suggestions

        if (API_KEY && API_KEY !== 'your_key_here') {
            try {
                const aiPrompt = `
                    You are an expert Recruitment Strategist and ATS Specialist.
                    
                    TASK: Analyze the alignment between this resume and the job description.
                    
                    [STRICT SEMANTIC RULES]
                    1. NO BRANDING: Remove all company names (e.g., "Planys"), locations, and marketing fluff from keyword lists.
                    2. QUALITY PHRASES: Focus on Skill, System, or Responsibility-based noun phrases (e.g., "unmanned systems" NOT "planys integrates").
                    3. CLEANLINESS: Discard broken or non-professional word salad (e.g., "brief planys").

                    CONTEXT:
                    - ATS System: ${atsProfile.name} (Confidence: ${atsDetection.confidence})
                    - Detection Method: ${atsDetection.detectionMethod}
                    - Target Score: ${atsProfile.targetScore}%
                    - Current Score: ${pyResponse.data.score}%
                    - Detected Keywords: ${pyResponse.data.found_keywords.join(', ')}
                    - Current Keyword Density: ${kwAnalysis.density.toFixed(2)}%
                    - ATS Optimization Strategy: ${atsProfile.optimizationStrategy.bulletStyle}
                    
                    JOB DESCRIPTION:
                    "${job_description.substring(0, 3000)}"
                    
                    RESUME TEXT:
                    "${resume_text.substring(0, 3000)}"
                    
                    OUTPUT REQUIREMENTS (JSON):
                    1. "reasoning": Provide a 2-sentence strategic insight. Explain WHY the current match score is what it is and how it relates to ${atsProfile.name}'s parsing behavior.
                    2. "additionalSuggestions": Provide 2 ATS-specific suggestions. MUST have "type" (critical, warning, info) and "message". Focus on ${atsProfile.name}-specific optimizations.
                    
                    Return ONLY a valid JSON object.
                `;

                const aiRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'meta-llama/llama-3.3-70b-instruct',
                    messages: [{ role: 'user', content: aiPrompt }],
                    response_format: { type: 'json_object' }
                }, {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://atsense.ai',
                        'X-Title': 'ATSense Strategic Analysis'
                    }
                });

                const intelligence = JSON.parse(aiRes.data.choices[0].message.content);
                aiReasoning = intelligence.reasoning;
                if (intelligence.additionalSuggestions) {
                    aiSuggestions = [...aiSuggestions, ...intelligence.additionalSuggestions];
                }
            } catch (aiErr) {
                console.error("AI Strategic layer failed:", aiErr);
            }
        }

        return NextResponse.json({
            ...pyResponse.data,
            reasoning: aiReasoning,
            suggestions: aiSuggestions,
            ats_type: atsProfile.name,
            ats_profile: {
                id: atsProfile.id,
                name: atsProfile.name,
                description: atsProfile.description,
                rules: atsProfile.rules,
                targetScore: atsProfile.targetScore,
                commonCompanies: atsProfile.commonCompanies.slice(0, 8), // Show top 8 companies
                companyTraits: atsProfile.companyTraits,
                optimizationStrategy: atsProfile.optimizationStrategy
            },
            ats_detection: {
                confidence: atsDetection.confidence,
                method: atsDetection.detectionMethod,
                reasoning: atsDetection.reasoning
            },
            keyword_metadata: kwAnalysis.extractedMetadata,
            match_forensics: {
                ...pyResponse.data.match_forensics,
                keyword_density: kwAnalysis.density // Use our more accurate density
            }
        });

    } catch (error: any) {
        console.error('Analysis Engine Error:', error.message);
        return NextResponse.json({ error: 'Deep Analysis Engine offline' }, { status: 503 });
    }
}

