import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = (process.env.OPENROUTER_API_KEY || process.env.LLAMA_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { summary, job_description } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({ error: 'AI Optimizer Key not configured' }, { status: 500 });
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
                'X-Title': 'ATSense Executive Summary Optimizer'
            }
        });

        const result = JSON.parse(response.data.choices[0].message.content);

        return NextResponse.json({
            optimizedSummary: result.optimizedSummary,
            keywords: result.keywordsAdded,
            impact: result.impactSnippet
        });
    } catch (error: any) {
        console.error('Summary Optimization Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'AI Optimization service unavailable',
            details: error.response?.data?.error?.message || error.message
        }, { status: 500 });
    }
}
