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

            [DYNAMIC KEYWORD-ADAPTATION PIPELINE]
            1. JD KEYWORD EXTRACTION:
               - From the Job Description, extract: Hard Skills (Languages, Frameworks, Tools), Concepts/Responsibilities, and Role Level.
               - DO NOT use a fixed list; extract what is actually in the JD.

            2. ROLE CLASSIFICATION:
               - Identify if this is primarily ${roleCategory.toUpperCase()} (Backend, Frontend, Full Stack, or AI/ML).

            3. USER SKILL VALIDATION & CROSS-MATCHING:
               - Compare extracted JD skills with candidate skills: ${userSkills.join(', ')}.
               - RULE: Only include keywords if the candidate has the underlying skill or it's a legitimate semantic expansion.
               - SEMANTIC EXPANSION: You may expand "Node.js" to "server-side JavaScript environments" or "SQL" to "relational database architecture" if it helps ATS matching.

            4. STRATEGIC INJECTION (ATS-SAFE):
               - SUMMARY (20%): Place the Role Title and 3-4 top matched keywords. Max 40 words.
               - EXPERIENCE (60%): Inject 1-2 JD-specific keywords per bullet using the XYZ formula:
                 "Action (Strong Verb) + Plausible Metric + Technology (extracted from JD)".
               - SKILLS (20%): Ensure a clean, categorized list (Languages, Tools, Frameworks).

            5. FINAL VALIDATION:
               - Section headers must be: ${targetSections.join(', ')}.
               - No Hallucination: Do not add tools the user hasn't listed or that aren't closely related concepts.
               - CANDIDATE LEVEL: ${expLevel}. 
               ${expLevel === 'FRESHER' ? `
               - FRESHER RULES:
                 1. Do NOT invent professional work experience or job titles (like "Senior Architect").
                 2. Focus the summary on academic achievements and potential.
                 3. If the user has no work history, expand the "TECHNICAL PROJECTS" section using the provided projects.
                 4. Treat academic projects as the primary source of technical proof.
               ` : `
               - EXPERIENCED RULES:
                 1. Focus on industry impact, leadership, and multi-year tenure.
                 2. Use metrics that reflect business value (revenue, user growth, latency).
               `}
               - Tone: Professional Software Engineering.

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

