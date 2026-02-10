import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATSWithConfidence } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';
import { performControlledExpansion, getIndustryInjection } from '@/utils/jdIntelligence';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';
const API_KEY = (process.env.OPENROUTER_API_KEY || process.env.LLAMA_API_KEY || '').trim();

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

        // 4. Structured JD Intelligence Layer (Role-First Architecture)
        let jdIntelligence = {
            role: "Software Engineer",
            domain: "Full Stack Engineer",
            stack: { languages: [], frameworks: [], databases: [], cloud: [], tools: [], concepts: [] },
            seniority: "Mid",
            industry: industry || "Tech"
        };

        if (API_KEY && API_KEY !== 'your_key_here') {
            try {
                const extractionPrompt = `
                    Extract the primary technical elements from this job description.
                    Ignore general phrases, soft skills, and marketing fluff.

                    [TARGET DOMAINS]: Frontend Engineer, Backend Engineer, Full Stack Engineer, DevOps Engineer, ML Engineer, Data Engineer.

                    JOB DESCRIPTION:
                    "${job_description.substring(0, 2000)}"

                    OUTPUT JSON SCHEMA:
                    {
                      "role": "Specific Job Title",
                      "domain": "One of the [TARGET DOMAINS]",
                      "languages": [],
                      "frameworks": [],
                      "databases": [],
                      "cloud_platform": [],
                      "tools": [],
                      "concepts": ["Strictly technical like 'Microservices', 'REST APIs'"],
                      "seniority": "Junior/Mid/Senior/Lead"
                    }
                `;

                const extractionRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'meta-llama/llama-3.3-70b-instruct',
                    messages: [{ role: 'user', content: extractionPrompt }],
                    response_format: { type: 'json_object' }
                }, {
                    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
                });

                const rawIntel = JSON.parse(extractionRes.data.choices[0].message.content);
                jdIntelligence = {
                    role: rawIntel.role || "Software Engineer",
                    domain: rawIntel.domain || "Full Stack Engineer",
                    stack: {
                        languages: rawIntel.languages || [],
                        frameworks: rawIntel.frameworks || [],
                        databases: rawIntel.databases || [],
                        cloud: rawIntel.cloud_platform || [],
                        tools: rawIntel.tools || [],
                        concepts: rawIntel.concepts || []
                    },
                    seniority: rawIntel.seniority || "Mid",
                    industry: industry || "Tech"
                };
            } catch (err) {
                console.error("Structured Extraction failed:", err);
            }
        }

        // 5. Controlled Semantic Expansion
        const allStackElements = [
            ...jdIntelligence.stack.languages,
            ...jdIntelligence.stack.frameworks,
            ...jdIntelligence.stack.databases,
            ...jdIntelligence.stack.cloud,
            ...jdIntelligence.stack.tools,
            ...jdIntelligence.stack.concepts
        ];

        const expandedKeywords = performControlledExpansion(allStackElements, jdIntelligence.domain);
        const industryKeywords = getIndustryInjection(jdIntelligence.industry);

        // 5. Final Accurate Keyword Density Analysis (Using Expanded Intelligence)
        const kwAnalysis = analyzeKeywordDensity(resume_text, job_description, expandedKeywords);

        // 6. Strategic Intelligence from Llama (Contextual Reasoning)
        let aiReasoning = pyResponse.data.reasoning;
        let aiSuggestions = kwAnalysis.recommendations;

        if (API_KEY && API_KEY !== 'your_key_here') {
            try {
                const aiPrompt = `
                    You are an expert Recruitment Strategist specializing in ${jdIntelligence.domain}.
                    
                    TASK: Analyze resume alignment for a ${jdIntelligence.seniority} level ${jdIntelligence.role} in the ${jdIntelligence.industry} industry.
                    
                    [STRUCTURED TECH STACK]
                    - Languages: ${jdIntelligence.stack.languages.join(', ')}
                    - Frameworks: ${jdIntelligence.stack.frameworks.join(', ')}
                    - Cloud/Platform: ${jdIntelligence.stack.cloud.join(', ')}
                    - Concepts/Architecture: ${jdIntelligence.stack.concepts.join(', ')}
                    
                    [SEMANTIC EXPANSION]
                    ${expandedKeywords.join(', ')}
                    
                    [INDUSTRY CONTEXT]
                    ${industryKeywords.join(', ')}

                    [STRICT RULES]
                    1. NO HALLUCINATION: Only suggest words linked to the structured stack or expansion.
                    2. SENIORITY ALIGNMENT: Suggest ${jdIntelligence.seniority === 'Senior' || jdIntelligence.seniority === 'Lead' ? '"Architected" or "Led"' : '"Developed" or "Implemented"'} style bullets.
                    3. INDUSTRY AWARENESS: Inject ${jdIntelligence.industry}-specific relevance.

                    ATS System: ${atsProfile.name}
                    
                    JOB DESCRIPTION:
            "${job_description.substring(0, 2000)}"
                    
                    RESUME TEXT:
            "${resume_text.substring(0, 2000)}"
                    
                    OUTPUT REQUIREMENTS(JSON):
            1. "reasoning": Provide a strategic insight based on these keywords.
                    2. "additionalSuggestions": Provide 4 high - impact ATS - specific suggestions.
                    
                    Return ONLY a valid JSON object.
                `;

                const aiRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'meta-llama/llama-3.3-70b-instruct',
                    messages: [{ role: 'user', content: aiPrompt }],
                    response_format: { type: 'json_object' }
                }, {
                    headers: {
                        'Authorization': `Bearer ${API_KEY} `,
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
            jd_intelligence: jdIntelligence, // Pass back to frontend
            ats_type: atsProfile.name,
            ats_profile: {
                id: atsProfile.id,
                name: atsProfile.name,
                description: atsProfile.description,
                rules: atsProfile.rules,
                targetScore: atsProfile.targetScore,
                commonCompanies: atsProfile.commonCompanies.slice(0, 8),
                companyTraits: atsProfile.companyTraits,
                optimizationStrategy: atsProfile.optimizationStrategy
            },
            ats_detection: {
                confidence: atsDetection.confidence,
                method: atsDetection.detectionMethod,
                reasoning: atsDetection.reasoning
            },
            keyword_metrics: pyResponse.data.keyword_metrics,
            match_forensics: {
                ...pyResponse.data.match_forensics,
                keyword_density: kwAnalysis.density
            }
        });

    } catch (error: any) {
        console.error('Analysis Engine Error:', error.message);
        return NextResponse.json({ error: 'Deep Analysis Engine offline' }, { status: 503 });
    }
}

