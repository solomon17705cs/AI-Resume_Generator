/**
 * generate-recommendation/route.ts - AI Recommendation Letter via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

export async function POST(req: NextRequest) {
    try {
        const { adminSummary, studentData, company, purpose } = await req.json();
        const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

        console.log('🤖 Recommendation Generation triggered for:', studentData?.fullName);

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'API not configured',
                message: 'Add Requesty API key to .env.local'
            }, { status: 500 });
        }

        if (!studentData?.fullName) {
            return NextResponse.json({
                error: 'Missing student data',
                message: 'Student profile data is incomplete'
            }, { status: 400 });
        }

        const prompt = `
You are a Career Admin at ATSense. Write a professional recommendation letter for a student.

Student Name: ${studentData.fullName}
Target Company: ${company}
Purpose: ${purpose}

Admin's Context:
"${adminSummary || 'The student is a high-performer with strong technical skills.'}"

Student Resume Highlights:
${JSON.stringify(studentData, null, 2)}

Guidelines:
- Formal business tone
- Under 250 words
- Output ONLY the letter body (no closing)
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
                        temperature: 0.7
                    },
                    {
                        headers: {
                            ...getOpenRouterHeaders(API_KEY),
                            'HTTP-Referer': 'https://atsense.ai',
                            'X-Title': 'ATSense Recommendation Writer'
                        },
                        timeout: 30000
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

        return NextResponse.json({
            success: true,
            letter: response.data.choices[0].message.content.trim()
        });

    } catch (error: any) {
        console.error('Recommendation Error:', error.message);
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}