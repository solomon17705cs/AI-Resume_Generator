/**
 * optimize-summary/route.ts - Executive Summary Optimization via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { summary, job_description } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const prompt = `
You are an expert Recruitment Strategist and Professional Resume Writer.
Your task is to transform a candidate's rough professional summary into a high-impact, ATS-optimized Executive Summary.

[STRICT RULES]
1. LENGTH: Exactly 50-60 words. No more, no less.
2. PERSON: Third-person only (no "I am", "I achieved").
3. KEYWORDS: Naturally inject at least 5 critical technical keywords from the job description.
4. STRUCTURE:
   - Sentence 1: Years of experience + Current high-level role + Target role.
   - Sentence 2: Top 3 technical core competencies.
   - Sentence 3: Major quantifiable achievement or business impact.
5. TONE: Professional, results-oriented, and authoritative.

CONTEXT:
Target Job Description: "${job_description.substring(0, 1500)}"
Candidate's Current Summary: "${summary}"

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "optimizedSummary": "The rewritten summary (50-60 words)",
  "keywordsAdded": ["kw1", "kw2", ...],
  "impactSnippet": "The achievement part rewritten for impact"
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
                        temperature: 0.3
                    },
                    {
                        headers: {
                            ...getOpenRouterHeaders(API_KEY),
                            'HTTP-Referer': 'https://atsense.ai',
                            'X-Title': 'ATSense Executive Summary Optimizer'
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

        const result = JSON.parse(response.data.choices[0].message.content);

        return NextResponse.json({
            optimizedSummary: result.optimizedSummary,
            keywords: result.keywordsAdded,
            impact: result.impactSnippet
        });

    } catch (error: any) {
        console.error('Summary Optimization Error:', error.message);
        return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
    }
}