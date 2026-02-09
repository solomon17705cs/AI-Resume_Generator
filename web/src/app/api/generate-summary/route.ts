import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured. Please add LLAMA_API_KEY or OPENROUTER_API_KEY to your .env.local'
            }, { status: 500 });
        }

        const prompt = `
            You are an expert resume writer. Write a high-impact, 2-3 sentence Executive Summary for a candidate's resume.
            
            Target Job Description:
            "${jobDescription || 'Not provided'}"
            
            Current Candidate Data (JSON):
            ${JSON.stringify(resume, null, 2)}
            
            Rules:
            1. Use a professional, confident tone.
            2. High-density of keywords from the Job Description.
            3. Include the target role title and years of experience (if found in data).
            4. Focus on accomplishments and career intent.
            5. Output ONLY the summary text. No quotes, no preamble.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense AI Summary Writer'
            }
        });

        const summary = response.data.choices[0].message.content.trim();

        return NextResponse.json({
            success: true,
            summary
        });

    } catch (error: any) {
        console.error('Summary Generation Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Generation Failed',
            details: error.message
        }, { status: 500 });
    }
}
