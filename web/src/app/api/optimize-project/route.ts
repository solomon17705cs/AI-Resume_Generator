import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { repoName, description, language, stars } = await req.json();

        const prompt = `
            Convert this GitHub repository into 3 high-impact, professional resume bullet points using the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
            Repo Name: ${repoName}
            Description: ${description || 'A software project focusing on ' + language}
            Primary Language: ${language || 'General Technologies'}
            Stars: ${stars || 0}
            Focus on engineering excellence, scalability, and technical complexity.
            Return ONLY a JSON array of 3 strings. Example: ["Developed X...", "Optimized Y...", "Implemented Z..."]
        `;

        const completion = await openai.chat.completions.create({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content || '[]';
        let bullets = [];

        try {
            const parsed = JSON.parse(content);
            bullets = Array.isArray(parsed) ? parsed : (parsed.bullets || []);
        } catch (e) {
            // Fallback parsing for non-JSON responses
            bullets = content.split('\n').filter(l => l.trim()).slice(0, 3);
        }

        if (bullets.length === 0) {
            bullets = [
                `Developed ${repoName} using ${language || 'modern technologies'} to solve technical challenges.`,
                `Architected core features in ${repoName} focusing on performance and code maintainability.`,
                `Leveraged ${language || 'software engineering'} best practices to build and deploy a scalable project.`
            ];
        }

        return NextResponse.json({ bullets });
    } catch (error: any) {
        console.error('AI Optimization Error:', error);
        return NextResponse.json({
            bullets: [
                "Engineered a technical solution using core software principles.",
                "Optimized system performance using industry-standard tools.",
                "Collaborated on technical design and implementation details."
            ]
        });
    }
}
