import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured.'
            }, { status: 500 });
        }

        const prompt = `
            You are a Career Strategist AI. Based on the candidate's resume and technical profile, suggest 5 highly relevant job roles or career paths.
            
            Candidate Data:
            ${JSON.stringify(resume, null, 2)}
            
            Return the response in a strict JSON format:
            {
                "suggestions": [
                    {
                        "role": "Job Title",
                        "marketDemand": "High/Medium/Extremely High",
                        "matchScore": 95,
                        "reason": "Brief reason why this fits their profile",
                        "topSkillsToHighlight": ["Skill 1", "Skill 2"],
                        "estimatedSalary": "$120k - $160k"
                    }
                ]
            }
            
            Rules:
            1. Analyze their GitHub projects, skills, and experience for deep alignment.
            2. Be specific (e.g., "Distributed Systems Engineer" instead of "Software Engineer").
            3. Ensure the output is valid JSON.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense Job Suggestor'
            }
        });

        const suggestionsStr = response.data.choices[0].message.content;
        const suggestions = JSON.parse(suggestionsStr);

        return NextResponse.json(suggestions);

    } catch (error: any) {
        console.error('Job Suggestion Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
