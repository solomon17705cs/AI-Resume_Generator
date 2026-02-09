import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';

// Check for both LLAMA_API_KEY and OPENROUTER_API_KEY
const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription, jobUrl } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured. Please add LLAMA_API_KEY or OPENROUTER_API_KEY to your .env.local'
            }, { status: 500 });
        }

        const atsProfile = detectATS(jobUrl || jobDescription);

        const prompt = `
            You are an elite ATS (Applicant Tracking System) Optimization Engine. 
            Your goal is to transform the provided resume into a job-specific, high-ranking document for the target platform.
            
            ATS Platform: ${atsProfile.name}
            Platform Rules:
            ${atsProfile.rules.map(r => `- ${r}`).join('\n')}
            
            Target Job Description (JD):
            "${jobDescription}"
            
            Current Resume Data (JSON):
            ${JSON.stringify(resume, null, 2)}
            
            TASK: 
            Perform a professional, strategic optimization strictly according to these rules:

            1. KEYWORD DENSITY ARCHITECTURE (Anti-Penalty Strategy):
               - 🎯 Spread high-value keywords across sections (Experience > Summary > Projects > Skills).
               - ✅ Use keyword variants & synonyms (e.g., if JD says "REST APIs", also use "API development" or "backend endpoints").
               - ✅ Embed keywords naturally into "Action + Impact" bullets. Never list them as a raw list.
               - ✅ Target 80-95% JD keyword coverage. DO NOT aim for 100% (suspicious to modern ATS).
               - ❌ NO keyword stuffing. Avoid repeating the same buzzword more than 3 times total.

            2. HEADER & EDUCATION (Identity/Factual):
               - ❌ DO NOT change names, phone numbers, emails, locations, or degree facts.
               - Keep these exactly as they are in the input.

            3. PROFESSIONAL SUMMARY (High-Weight Hook):
               - ✅ GENERATE a powerful 2-3 sentence summary.
               - MUST include: Target role title, years of experience, and 3-5 high-priority JD keywords.
               - Link your background directly to the company's specific needs.

            4. EXPERIENCE (Core Optimization - ⭐⭐⭐⭐⭐ Weight):
               - ✅ REWRITE bullet points using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
               - Inject 1-2 role-specific keywords into EACH bullet point.
               - ❌ DO NOT change Job Titles or Company Names.

            5. PROJECTS (⭐⭐⭐⭐ Weight):
               - ✅ Optimize descriptions to highlight technical keywords that match the JD's stack.

            6. OUTPUT FORMAT:
               - Return ONLY a valid JSON object matching the input ResumeData structure.
               - Ensure all IDs and metadata are preserved.
               - Do not include markdown blocks, explanations, or any text outside the JSON.
        `;

        // We use OpenRouter as the gateway for Llama models
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3 // Lower temperature for factual consistency
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
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
