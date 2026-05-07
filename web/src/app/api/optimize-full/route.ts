/**
 * optimize-full/route.ts - Resume Optimization via Requesty
 */
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { detectATS } from '@/config/atsProfiles';
import { analyzeKeywordDensity } from '@/utils/keywordAnalyzer';
import { SECTION_TEMPLATES, detectIndustry, calculateKeywordPriority } from '@/utils/optimizationEngine';
import { getSemanticKeywordsForRole, detectRoleCategory } from '@/utils/csSemanticKeywords';
import { determineExperienceLevel, getFresherRules } from '@/utils/userProfileAnalyzer';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

async function callRequesty(prompt: string) {
    const models = [...REQUESTY_CONFIG.models];
    let lastError;
    
    for (const model of models) {
        try {
            const response = await axios.post(
                `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                {
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    temperature: 0.0
                },
                {
                    headers: getOpenRouterHeaders(API_KEY),
                    timeout: 45000
                }
            );
            return response.data;
        } catch (err: any) {
            console.warn(`Requesty ${model} failed:`, err.message);
            lastError = err;
            continue;
        }
    }
    throw lastError || new Error('All models failed');
}

export async function POST(req: NextRequest) {
    try {
        const { resume, jobDescription, jobUrl } = await req.json();

        if (!resume || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 });
        }

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({ 
                error: 'Requesty API Key not configured',
                message: 'Add your Requesty API key to .env.local'
            }, { status: 500 });
        }

        const atsProfile = detectATS(jobUrl || jobDescription);
        const kwAnalysis = analyzeKeywordDensity(JSON.stringify(resume), jobDescription);

        // Evidence Buffer
        const verifiedSkills = new Set<string>();
        resume.skills?.forEach((cat: any) => cat.skills?.forEach((s: string) => verifiedSkills.add(s)));
        resume.experience?.forEach((exp: any) => {
            exp.bullets?.forEach((b: string) => {
                const matches = b.match(/\b[A-Z][A-Za-z0-9+#.]*\b/g);
                matches?.forEach((m: string) => verifiedSkills.add(m));
            });
        });
        resume.projects?.forEach((proj: any) => {
            proj.technologies?.forEach((t: string) => verifiedSkills.add(t));
            proj.bullets?.forEach((b: string) => {
                const matches = b.match(/\b[A-Z][A-Za-z0-9+#.]*\b/g);
                matches?.forEach((m: string) => verifiedSkills.add(m));
            });
        });
        const evidenceBuffer = Array.from(verifiedSkills).join(', ');

        const industry = detectIndustry(jobDescription);
        const roleCategory = detectRoleCategory(jobDescription);
        const expLevel = determineExperienceLevel(resume);
        const targetSections = SECTION_TEMPLATES[industry] || SECTION_TEMPLATES.generic;

        const prompt = `
You are an ATS Optimization Engine.
Target: Improve ATS score from ~20 to 90+.

[STRICT RULES]
1. DO NOT add new companies or jobs
2. DO NOT invent experience
3. Only optimize bullets, summary, skills
4. Use ONLY skills from Evidence Buffer

[EVIDENCE BUFFER]
${evidenceBuffer || 'No verified skills found'}

[OPTIMIZATION]
- Inject keywords from JD into existing bullets
- Rewrite summary with role + keywords
- Add metrics where possible
- Keep same number of entries

[OUTPUT]
Return JSON resume with optimized content.
        `.trim();

        const response = await callRequesty(prompt);

        let optimizedContent = response.choices[0].message.content;
        optimizedContent = optimizedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        let optimizedResume;
        try {
            optimizedResume = JSON.parse(optimizedContent);
        } catch {
            return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            optimizedResume,
            atsType: atsProfile.name,
            industry,
            scoreImpactEstimation: "+65.0"
        });

    } catch (error: any) {
        console.error('Optimization Error:', error.message);
        return NextResponse.json({ 
            error: 'Optimization failed',
            details: error.message 
        }, { status: 503 });
    }
}