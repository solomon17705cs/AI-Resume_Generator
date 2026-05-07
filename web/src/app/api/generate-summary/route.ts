/**
 * generate-summary/route.ts - AI Summary Generation via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({ 
                error: 'API not configured',
                message: 'Add Requesty API key to .env.local'
            }, { status: 500 });
        }

        const prompt = `
Write a 2-3 sentence professional summary for a resume.
- Include target role and years experience
- Add relevant keywords from JD
- Professional tone

Candidate: ${resume.personalInfo?.fullName || 'Professional'}
Target JD: "${jobDescription?.substring(0, 1000) || 'Not provided'}"

Return: {"summary":"the summary text"}
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
                        headers: getOpenRouterHeaders(API_KEY),
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

        const summary = response.data.choices[0].message.content.trim();

        return NextResponse.json({
            success: true,
            summary
        });

    } catch (error: any) {
        console.error('Summary Error:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}