import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';

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

        // 3. Strategic Intelligence from Llama (Contextual Reasoning)
        let aiReasoning = pyResponse.data.reasoning;
        let aiSuggestions = pyResponse.data.suggestions.map((s: string) => ({ type: 'info', message: s }));

        if (API_KEY && API_KEY !== 'your_key_here') {
            try {
                const aiPrompt = `
                    You are an expert Recruitment Strategist and ATS Specialist.
                    
                    TASK: Analyze the alignment between this resume and the job description.
                    
                    CONTEXT:
                    - ATS System: ${atsProfile.name}
                    - Statistical Match Score: ${pyResponse.data.score}%
                    - Missing Keywords: ${pyResponse.data.missing_keywords.join(', ')}
                    
                    JOB DESCRIPTION:
                    "${job_description.substring(0, 3000)}"
                    
                    RESUME TEXT:
                    "${resume_text.substring(0, 3000)}"
                    
                    OUTPUT REQUIREMENTS (JSON):
                    1. "reasoning": Provide a 2-sentence strategic insight. Mention the specific job role and the company/industry context. Explain WHY the current match score is what it is from a recruiter's perspective.
                    2. "suggestions": A list of 3-4 specific, actionable improvements. Each suggestion must have a "type" (critical, warning, info) and a "message". Focus on bridging the gap between the candidate's current bullets and the JD's specific high-priority requirements.
                    
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
                aiSuggestions = intelligence.suggestions;
            } catch (aiErr) {
                console.error("AI Strategic layer failed, falling back to statistical reasoning:", aiErr);
            }
        }

        return NextResponse.json({
            ...pyResponse.data,
            reasoning: aiReasoning,
            suggestions: aiSuggestions,
            ats_type: atsProfile.name,
            ats_profile: atsProfile
        });

    } catch (error: any) {
        console.error('Analysis Engine Error:', error.message);
        return NextResponse.json({ error: 'Deep Analysis Engine offline' }, { status: 503 });
    }
}
