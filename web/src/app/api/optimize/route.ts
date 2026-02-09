import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { bullet, job_description } = await req.json();

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'AI Optimizer Key not configured' }, { status: 500 });
        }

        const prompt = `
      As an expert ATS Resume Engineer, rewrite the following bullet point to perfectly align with this Job Description.
      
      Job Description: "${job_description}"
      Original Bullet: "${bullet}"
      
      Requirements:
      1. Use the XYZ Formula (Accomplished [X] as measured by [Y], by doing [Z]).
      2. Integrate relevant keywords from the JD naturally.
      3. Focus on quantifiable impact.
      
      Output ONLY the rewritten bullet point string. No preamble.
    `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3.5-sonnet',
            messages: [{ role: 'user', content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        const optimized = response.data.choices[0].message.content;

        return NextResponse.json({ optimizedSlug: optimized });
    } catch (error: any) {
        console.error('AI Fix Error:', error.message);
        return NextResponse.json({ error: 'AI Optimization service unavailable' }, { status: 500 });
    }
}
