import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';

const API_KEY = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription, jobUrl } = await req.json();

        if (!resume || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 });
        }

        if (!API_KEY || API_KEY === 'your_key_here') {
            return NextResponse.json({
                error: 'Neural Core Offline',
                message: 'AI API Key not configured.'
            }, { status: 500 });
        }

        console.log("Neural Core heartbeat: Input validated, starting optimization...");

        const atsProfile = detectATS(jobUrl || jobDescription);
        const kwAnalysis = analyzeKeywordDensity(JSON.stringify(resume), jobDescription);

        const prompt = `
            You are an elite ATS Optimization Engine powered by Llama-3.3-70B.
            Your task is to transform a Resume JSON into a high-scoring, ultra-concise, and metric-driven document.

            [STRICT BREVITY & READABILITY RULES]
            1. EXECUTIVE SUMMARY: MUST be between 30-50 words (max 3-4 lines). Absolutely no fluff.
            2. BULLET POINTS: EVERY bullet point MUST be 1-2 lines (max 25 words).
            3. CONTEXT COMPRESSION:
               - Replace "experienced in designing and developing" with "developed".
               - Replace "leveraging expertise in" with "using" or "via".
               - Replace "in order to ensure" with "to".
               - Remove "Highly skilled", "Successful professional", and other generic adjectives.

            [QUANTIFIABLE IMPACT MANDATE]
            - EVERY optimization MUST include a metric (%, $, time, or scale). 
            - If no metric is provided, INFER a realistic one based on context (e.g., "reduced latency by 20%", "scaled to 50k users").

            [SYSTEM ARCHITECTURE]
            1. Role Synthesis: Identify target role, seniority, and top 5 "must-have" skills from the JD.
            2. ATS Simulation: Emulate the ranking logic of ${atsProfile.name}.
            3. Context Compression: Remove fluff; replace passive voice with extreme "Action + Impact" verbs.
            4. Branding Scrub (CRITICAL): Absolutely remove company names (e.g., "Planys"), locations, and word-salad phrases.

            [PLATFORM CONFIGURATION: ${atsProfile.name}]
            Rules:
            ${(atsProfile.rules || []).map(r => `- ${r}`).join('\n')}

            [KEYWORD STRATEGY]
            - ✅ NO BRANDING: Do not repeat company names or branding fluff.
            - ✅ PHRASE-LEVEL MATCHING: Embed technical noun phrases (e.g., "Autonomous Systems", "Signal Processing") into sentences.
            - ✅ TARGET DENSITY: 2-5% for critical keywords: ${kwAnalysis.missingCritical.join(', ')}.
            - ✅ XYZ FORMULA: Accomplished [X] as measured by [Y], by doing [Z].

            [INPUT DATA]
            Target JD: "${jobDescription.substring(0, 3000)}"
            Resume JSON: ${JSON.stringify(resume)}

            [OUTPUT REQUIREMENTS]
            1. Return ONLY the updated Resume JSON.
            2. Use EXACT headers: PROFESSIONAL SUMMARY, PROFESSIONAL EXPERIENCE, TECHNICAL PROJECTS, SKILLS, EDUCATION.
            3. Ensure "summary" is a high-impact, 1.5-line statement.
            4. Each experience bullet MUST follow the format: [Action Verb] [Quantifiable Result] through [How/Tech Stack].
        `;

        console.log("Neural Core: Calling OpenRouter with model meta-llama/llama-3.3-70b-instruct");
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
                'X-Title': 'ATSense Neural Optimization'
            },
            timeout: 60000 // 60 second timeout for large optimizations
        });

        const optimizedContent = response.data.choices[0].message.content;
        const optimizedResume = JSON.parse(optimizedContent);

        // Server-side validation for length
        if (optimizedResume.summary && optimizedResume.summary.split(' ').length > 60) {
            optimizedResume.summary = optimizedResume.summary.split(' ').slice(0, 50).join(' ') + '...';
        }

        return NextResponse.json({
            success: true,
            optimizedResume,
            atsType: atsProfile.name
        });

    } catch (error: any) {
        const errorData = error.response?.data || error.message;
        console.error('Neural Optimization Error:', errorData);
        return NextResponse.json({
            error: 'Optimization Failed',
            details: typeof errorData === 'object' ? JSON.stringify(errorData) : errorData
        }, { status: 500 });
    }
}
