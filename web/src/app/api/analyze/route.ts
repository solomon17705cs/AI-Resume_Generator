import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';
const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume_text, job_description, jd_url } = await req.json();

        // 1. Detect ATS Profile
        const atsProfile = detectATS(jd_url || job_description);

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
                    
                    CONTEXT:
                    - ATS System: ${atsProfile.name}
                    - Statistical Match Score: ${pyResponse.data.score}%
                    - Missing Keywords: ${kwAnalysis.missingCritical.join(', ')}
                    - Current Keyword Density: ${kwAnalysis.density.toFixed(2)}%
                    
                    JOB DESCRIPTION:
                    "${job_description.substring(0, 3000)}"
                    
                    RESUME TEXT:
                    "${resume_text.substring(0, 3000)}"
                    
                    OUTPUT REQUIREMENTS (JSON):
                    1. "reasoning": Provide a 2-sentence strategic insight. Explain WHY the current match score is what it is.
                    2. "additionalSuggestions": Provide 2 more expert suggestions not already covered by basic keyword matching. Each MUST have "type" (critical, warning, info) and "message".
                    
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
            ats_profile: atsProfile,
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
