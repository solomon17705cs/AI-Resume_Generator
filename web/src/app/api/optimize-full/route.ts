import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription, jobUrl } = await req.json();

        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'OpenRouter API Key not configured. Please add it to your .env.local'
            }, { status: 500 });
        }

        const atsProfile = detectATS(jobUrl || jobDescription);

        const prompt = `
            You are an advanced ATS Optimization Engine.
            
            ATS Platform: ${atsProfile.name}
            Strategic Rules:
            ${atsProfile.rules.map(r => `- ${r}`).join('\n')}
            
            Target Job Description:
            "${jobDescription}"
            
            Current Resume Data (JSON):
            ${JSON.stringify(resume, null, 2)}
            
            TASK: 
            Optimize the resume to maximize ATS compatibility for the given job description WITHOUT fabricating experience.
            
            1. Rewrite the "summary" to be highly relevant to the role.
            2. Optimize "experience" bullet points using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
            3. Ensure high keyword density specifically for the ${atsProfile.name} platform.
            4. Keep all other data (personal info, IDs, structure) identical.
            
            OUTPUT:
            Return ONLY a valid JSON object matching the input ResumeData structure. No explanation, no markdown blocks.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3.5-sonnet',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense AI Optimization'
            }
        });

        const optimizedContent = response.data.choices[0].message.content;
        const optimizedResume = JSON.parse(optimizedContent);

        return NextResponse.json({
            success: true,
            optimizedResume,
            atsType: atsProfile.name
        });

    } catch (error: any) {
        console.error('Neural Optimization Error:', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Optimization Failed',
            details: error.message
        }, { status: 500 });
    }
}
