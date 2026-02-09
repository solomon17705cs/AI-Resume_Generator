import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { bullet, job_description } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({ error: 'AI Optimizer Key not configured' }, { status: 500 });
        }

        const prompt = `
            You are a Neural Precision & Brevity Optimizer powered by Llama-3.3-70B.
            Your task is to transform a raw bullet point into an ultra-concise, metric-heavy, and high-impact industry statement.

            [STRICT READABILITY & BREVITY RULES]
            1. LENGTH: Max 25 words or 1.5 lines.
            2. CONTEXT COMPRESSION (MANDATORY):
               - Replace "designing and developing" with "developing".
               - Replace "leveraging expertise in" with "using".
               - Replace "experienced in" with "engineered" or "delivered".
               - Replace "in order to ensure" with "to".
               - Remove all fluff like "highly skilled", "dedicated", "proficient".

            [QUANTIFIABLE IMPACT]
            - MANDATORY: Include at least one metric (%, $, time, or scale).
            - Format: Accomplished [X] as measured by [Y], by doing [Z].

            [INDUSTRY CONTEXT]
            - Identify the domain from the JD (e.g., Defense, FinTech, EdTech).
            - For Defense: Use terms like "UUVs", "NDT", "Naval Applications", "Strategic Infrastructure".
            - For FinTech: Use terms like "Latency", "Order Matching", "Transactions".

            CONTEXT:
            Target JD: "${job_description.substring(0, 1500)}"
            Candidate's Raw Bullet: "${bullet}"

            OUTPUT FORMAT:
            Return ONLY a JSON object:
            {
              "optimizedSlug": "The rewritten bullet point (MAX 25 WORDS)",
              "explanation": ["Point about metric inclusion", "Point about context compression applied", "Point about domain terms used"],
              "detectedDomain": "The identified industry"
            }
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense Precision & Brevity Optimizer'
            }
        });

        const result = JSON.parse(response.data.choices[0].message.content);

        return NextResponse.json({
            optimizedSlug: result.optimizedSlug.replace(/^"|"$/g, ''),
            explanation: result.explanation,
            domain: result.detectedDomain
        });
    } catch (error: any) {
        console.error('Bullet Optimization Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'AI Optimization service unavailable',
            details: error.response?.data?.error?.message || error.message
        }, { status: 500 });
    }
}
