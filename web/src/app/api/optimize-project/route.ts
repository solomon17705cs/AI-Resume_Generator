/**
 * optimize-project/route.ts - GitHub Project Optimization via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { repoName, description, language, stars } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'API not configured'
            }, { status: 500 });
        }

        const prompt = `
Convert this GitHub repo into 3 high-impact resume bullet points using XYZ formula.
Repo Name: ${repoName}
Description: ${description || 'A software project focusing on ' + language}
Primary Language: ${language || 'General Technologies'}
Stars: ${stars || 0}

Return ONLY a JSON array: ["Bullet 1", "Bullet 2", "Bullet 3"]
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
                        temperature: 0.3
                    },
                    {
                        headers: getOpenRouterHeaders(API_KEY)
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

        const content = response.data.choices[0].message.content || '[]';
        let bullets = [];

        try {
            const parsed = JSON.parse(content);
            bullets = Array.isArray(parsed) ? parsed : (parsed.bullets || []);
        } catch (e) {
            bullets = content.split('\n').filter((l: string) => l.trim()).slice(0, 3);
        }

        if (bullets.length === 0) {
            return NextResponse.json({
                bullets: [
                    'Developed ' + repoName + ' application',
                    'Implemented features using ' + language,
                    'Contributed to open source community'
                ]
            });
        }

        return NextResponse.json({ bullets });

    } catch (error: any) {
        console.error('Project Optimization Error:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}