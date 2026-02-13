import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';
import {
    SECTION_TEMPLATES,
    detectIndustry,
    calculateKeywordPriority
} from '@/utils/optimizationEngine';
import { getSemanticKeywordsForRole, detectRoleCategory } from '@/utils/csSemanticKeywords';
import { determineExperienceLevel, getFresherRules } from '@/utils/userProfileAnalyzer';

const API_KEY = (process.env.OPENROUTER_API_KEY || process.env.LLAMA_API_KEY || '').trim();

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

        // Flatten user skills for filtering
        const userSkills = resume.skills?.flatMap((cat: any) => cat.skills) || [];

        const industry = detectIndustry(jobDescription);
        const roleCategory = detectRoleCategory(jobDescription);
        const semanticKeywords = getSemanticKeywordsForRole(roleCategory, userSkills);
        const expLevel = determineExperienceLevel(resume);
        const fresherRules = getFresherRules();

        const targetSections = SECTION_TEMPLATES[industry] || SECTION_TEMPLATES.generic;
        const prioritizedKeywords = calculateKeywordPriority(kwAnalysis.missingCritical, jobDescription);

        const topHighPriority = prioritizedKeywords
            .filter(k => k.priority === 'high')
            .map(k => k.text)
            .concat(semanticKeywords.slice(0, 5)) // Inject top semantic keywords
            .join(', ');

        const prompt = `
            You are an elite ATS Optimization Engine (Transformation Mode).
            Targeting a score improvement from ~20 to 90+.

            [STRICT NO-HALLUCINATION POLICY]
            1. DO NOT ADD ANY NEW COMPANIES, JOBS, OR PROJECTS.
            2. DO NOT ADD ANY NEW EXPERIENCE ENTRIES.
            3. The number of entries in the "experience" and "projects" arrays MUST remain EXACTLY the same as the input.
            4. DO NOT invent professional work experience or job titles.
            5. ONLY optimize the 'bullets', 'summary', and 'skills' of the provided resume.

            [DYNAMIC KEYWORD-ADAPTATION PIPELINE]
            1. JD KEYWORD EXTRACTION:
               - From the Job Description, extract hard skills and concepts.
            
            2. SEMANTIC INJECTION (MANDATORY):
               - Integrate these specific semantic keywords: ${topHighPriority}.
               - Apply ATS Weighting: Role (35%), Core Tech (25%), Concepts (20%), Action Phrases (15%).
               - Use "ES6+" style notation (e.g., JavaScript ES6+).
               - AVOID filler words: "Proficiency in", "Experienced with", "Helpful for".
               - Focus on "weaving" these into existing bullet points naturally.

            3. STRATEGIC INJECTION (ATS-SAFE):
               - SUMMARY: Place the Role Title and 3-4 top matched keywords. Max 60 words.
               - EXPERIENCE: Inject JD-specific keywords into EXISTING bullets using the action-verb style.
               - PROJECTS: Expand EXISTING project bullets using technical keywords from the JD.

            4. FINAL VALIDATION:
               - Section headers must be standard: ${targetSections.join(', ')}.
               - CANDIDATE LEVEL: ${expLevel}.
               ${expLevel === 'FRESHER' ? `
               - FRESHER RULES:
                 1. Focus on academic achievements and potential.
                 2. Rename experience to "Academic & Professional Experience" if needed, but do not invent work history.
               ` : ''}

            [INPUT DATA]
            Job: "${jobDescription.substring(0, 2500)}"
            Resume: ${JSON.stringify(resume)}

            [OUTPUT]
            Return ONLY a valid JSON of the updated ResumeData object.
            Ensure the structure matches exactly.
        `;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.0 // Set to 0.0 for maximum consistency and deterministic output
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://atsense.ai',
                'X-Title': 'ATSense Strategic Optimization'
            },
            timeout: 60000
        });

        let optimizedContent = response.data.choices[0].message.content;

        // Remove potential markdown code blocks
        optimizedContent = optimizedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        let optimizedResume;
        try {
            optimizedResume = JSON.parse(optimizedContent);
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', optimizedContent);
            return NextResponse.json({
                error: 'Optimization output format error',
                message: 'The AI returned an invalid response format.'
            }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            optimizedResume,
            atsType: atsProfile.name,
            industry,
            scoreImpactEstimation: "+65.0"
        });

    } catch (error: any) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error('Neural Optimization Error:', errorMsg);
        return NextResponse.json({
            error: 'Deep Optimization Engine offline',
            details: errorMsg
        }, { status: 503 });
    }
}

