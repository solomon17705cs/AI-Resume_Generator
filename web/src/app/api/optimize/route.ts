/**
 * optimize/route.ts - Single Bullet Optimization via OpenRouter
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { bullet, job_description } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({ 
                error: 'API not configured',
                message: 'Add OpenRouter API key to .env.local'
            }, { status: 500 });
        }

        const prompt = `
Rewrite this bullet for ATS optimization:
- Max 25 words
- Add metrics (%, $, time)
- Use action verbs
- Include JD keywords

Raw bullet: "${bullet}"
Job: "${job_description.substring(0, 1000)}"

Return: {"optimizedSlug":"rewritten bullet","explanation":["point"],"detectedDomain":"industry"}
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
                        temperature: 0.2
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

        const result = JSON.parse(response.data.choices[0].message.content);

        return NextResponse.json({
            optimizedSlug: result.optimizedSlug?.replace(/^"|"$/g, '') || bullet,
            explanation: result.explanation || [],
            domain: result.detectedDomain || 'Tech'
        });

    } catch (error: any) {
        console.error('Optimization Error:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}