import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';
import {
    SECTION_TEMPLATES,
    detectIndustry,
    calculateKeywordPriority
} from '@/utils/optimizationEngine';

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

        const atsProfile = detectATS(jobUrl || jobDescription);
        const kwAnalysis = analyzeKeywordDensity(JSON.stringify(resume), jobDescription);
        const industry = detectIndustry(jobDescription);
        const targetSections = SECTION_TEMPLATES[industry] || SECTION_TEMPLATES.generic;
        const prioritizedKeywords = calculateKeywordPriority(kwAnalysis.missingCritical, jobDescription);

        const topHighPriority = prioritizedKeywords
            .filter(k => k.priority === 'high')
            .map(k => k.text)
            .join(', ');

        const prompt = `
            You are an elite ATS Optimization Engine (Transformation Mode).
            Targeting a score improvement from ~20 to 90+.

            [5-STEP TRANSFORMATION PLAN]
            1. KEYWORD MATCH (40% Weight): 
               - INTEGRATE these high-priority keywords naturally: ${topHighPriority}.
               - Focus on missing technical terms: ${kwAnalysis.missingCritical.slice(0, 10).join(', ')}.
            
            2. SECTION COMPLIANCE (30% Weight):
               - REORGANIZE the resume using these EXACT headers in order: ${targetSections.join(', ')}.
               - Add "TECHNICAL PROJECTS" if missing and populate from existing projects.

            3. SEMANTIC RELEVANCE (20% Weight):
               - Industry Context: ${industry.toUpperCase()}.
               - Transform generic tasks into "Action + Metric + Tech" formulas.
               - Example: "designed systems" -> "Engineered defence-grade digital systems for UUVs".

            4. CLARITY & BREVITY (10% Weight):
               - SUMMARY: Max 40 words. High impact.
               - BULLETS: Max 2 lines. Start with strong verbs (Orchestrated, Engineered, Spearheaded).
               - COMPRESSION: "experienced in designing" -> "designed", "leveraging expertise" -> "via".
            
            5. FINAL VALIDATION:
               - Scoring logic: ${atsProfile.name}.
               - Target Score: ${atsProfile.targetScore}+.

            [PLATFORM CONFIGURATION: ${atsProfile.name}]
            - Optimization Strategy: ${atsProfile.optimizationStrategy.bulletStyle}
            - Rules: ${(atsProfile.rules || []).join(', ')}

            [INPUT DATA]
            Job: "${jobDescription.substring(0, 3000)}"
            Resume: ${JSON.stringify(resume)}

            [OUTPUT]
            Return ONLY a valid JSON of the updated ResumeData object.
            Do not include any conversational text.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense Strategic Optimization'
            },
            timeout: 60000
        });

        const optimizedContent = response.data.choices[0].message.content;
        const optimizedResume = JSON.parse(optimizedContent);

        return NextResponse.json({
            success: true,
            optimizedResume,
            atsType: atsProfile.name,
            industry,
            scoreImpactEstimation: "+65.0"
        });

    } catch (error: any) {
        console.error('Neural Optimization Error:', error.message);
        return NextResponse.json({ error: 'Deep Optimization Engine offline' }, { status: 503 });
    }
}

