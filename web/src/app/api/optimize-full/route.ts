import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';

// Check for both LLAMA_API_KEY and OPENROUTER_API_KEY
const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription, jobUrl } = await req.json();

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured.'
            }, { status: 500 });
        }

        const atsProfile = detectATS(jobUrl || jobDescription);
        const kwAnalysis = analyzeKeywordDensity(JSON.stringify(resume), jobDescription);

        const prompt = `
            You are an elite ATS (Applicant Tracking System) Optimization Engine. 
            Your goal is to transform the provided resume into a job-specific, high-ranking document for the target platform.
            
            ATS Platform: ${atsProfile.name}
            Platform Rules:
            ${atsProfile.rules.map(r => `- ${r}`).join('\n')}

            CRITICAL DEFICIENCY DETECTED:
            The following high-priority keywords are missing or have 0% density:
            ${kwAnalysis.missingCritical.join(', ')}
            
            Target Job Description (JD):
            "${jobDescription}"
            
            Current Resume Data (JSON):
            ${JSON.stringify(resume, null, 2)}
            
            TASK: 
            Perform a professional, strategic optimization strictly according to these rules:

            1. KEYWORD DENSITY ARCHITECTURE (Priority #1):
               - ✅ INTEGRATE all detected missing keywords: ${kwAnalysis.missingCritical.join(', ')}.
               - ✅ Embed keywords naturally into "Action + Impact" bullets using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
               - ✅ Target 80-95% JD keyword coverage. DO NOT aim for 100%.

            2. HEADER & EDUCATION:
               - ❌ DO NOT change name, contact info, or degree facts.

            3. PROFESSIONAL SUMMARY:
               - ✅ GENERATE a powerful 2-3 sentence summary including the target role title and 3-5 high-priority JD keywords.

            4. EXPERIENCE (⭐⭐⭐⭐⭐ Weight):
               - ✅ REWRITE bullet points to include the missing keywords while maintaining factual truth about the candidate's journey.
               - ❌ DO NOT change Job Titles or Company Names.

            5. OUTPUT FORMAT:
               - Return ONLY a valid JSON object matching the input ResumeData structure.
               - Ensure all IDs and metadata are preserved.
               - Do not include markdown blocks or extra text.
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
