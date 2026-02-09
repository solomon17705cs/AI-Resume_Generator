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
            You are an elite ATS (Applicant Tracking System) Specialist and Executive Career Coach.
            TASK: Transform the raw bullet point into a high-impact, DOMAIN-SPECIFIC industry statement that is HIGHLY READABLE.

            STRICT READABILITY & BREVITY RULES:
            1. LENGTH: Max 45 words or 2 lines. 1.5 lines is the "Goldilocks" zone.
            2. CONTEXT COMPRESSION: Absolutely remove fluff. 
               - Replace "by designing and implementing" with "through".
               - Replace "utilizing strong computer science fundamentals" with "using".
               - Replace "in order to ensure" with "to".
            3. NO KEYWORD DILUTION: Keep the focus on 1 main achievement + 1-2 primary tech stack items.

            CRITICAL DOMAIN RULES:
            1. INDUSTRY INTELLIGENCE: Identify industry (FinTech, EdTech, etc) and use specialized terms (e.g., "order matching engines" for FinTech).
            2. PROJECT SCALE: Infer and add scale indicators (e.g., "serving 500k+ users", "handling $10M+ daily transactions").
            3. METRIC CONTEXT: Every percentage MUST include a "from X to Y" context.
            4. FORMAT: Strictly follow the XYZ Formula (Accomplished [X] as measured by [Y], by doing [Z]).

            CONTEXT:
            Target Job Description (JD): "${job_description.substring(0, 1500)}"
            Candidate's Raw Bullet: "${bullet}"

            OUTPUT FORMAT:
            Return ONLY a JSON object:
            {
              "optimizedSlug": "The rewritten bullet point (MAX 45 WORDS)",
              "explanation": ["Point 1 about metric context", "Point 2 about domain terms", "Point 3 about Readability & Brevity optimization"],
              "detectedDomain": "The identified industry"
            }
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
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
