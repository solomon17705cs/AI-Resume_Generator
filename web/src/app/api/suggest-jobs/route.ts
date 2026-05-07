/**
 * suggest-jobs/route.ts - AI Job Suggestions via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { resume } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'API not configured',
                message: 'Add Requesty API key'
            }, { status: 500 });
        }

        const prompt = `
You are a Career Strategist AI. Based on the resume, suggest 5 relevant job roles.

Candidate Data:
${JSON.stringify(resume, null, 2)}

Return JSON:
{
  "suggestions": [
    {
      "role": "Job Title",
      "marketDemand": "High/Medium/Extremely High",
      "matchScore": 95,
      "reason": "Why this fits",
      "topSkillsToHighlight": ["Skill 1"],
      "estimatedSalary": "$120k - $160k"
    }
  ]
}
        `.trim();

        const models = [...REQUESTY_CONFIG.models];
        let response;
        
        for (const model of models) {
            try {
                response = await axios.post(
                    `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                    {
                        model: model,
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' },
                        temperature: 0.7
                    },
                    {
                        headers: {
                            ...getOpenRouterHeaders(API_KEY),
                            'HTTP-Referer': 'https://atsense.ai',
                            'X-Title': 'ATSense Job Suggestor'
                        }
                    }
                );
                break;
            } catch {
                continue;
            }
        }

        if (!response) {
            return NextResponse.json({ error: 'All models failed' }, { status: 503 });
        }

        const suggestions = JSON.parse(response.data.choices[0].message.content);
        return NextResponse.json(suggestions);

    } catch (error: any) {
        console.error('Job Suggestion Error:', error.message);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}