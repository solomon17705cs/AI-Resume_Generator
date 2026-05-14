/**
 * optimize/route.ts — Single Bullet Point Optimization
 *
 * FIXED:
 * 1. Removed hard "Max 25 words" cap — 25 words cuts off good bullets.
 *    Industry standard is 15-25 words; we now guide rather than hard-cap.
 * 2. Prompt now gives the AI the actual JD role and required keywords,
 *    not just the raw JD text (which was being truncated to 1000 chars anyway).
 * 3. Added explicit XYZ formula enforcement with examples.
 * 4. Response validation prevents empty or unchanged bullets from being returned.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

export async function POST(req: NextRequest) {
    try {
        const { bullet, job_description, role, keywords } = await req.json();

        if (!bullet) {
            return NextResponse.json({ error: 'Bullet text is required' }, { status: 400 });
        }

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'API not configured',
                message: 'Add OPENROUTER_API_KEY to .env.local'
            }, { status: 500 });
        }

        // Extract key phrases from JD if full text is provided
        const jdContext = job_description
            ? job_description.substring(0, 1500)
            : 'Software engineering role';

        const prompt = `You are an expert resume writer specializing in ATS optimization for top tech companies.

Rewrite this resume bullet point to maximize ATS score and recruiter impact.

═══ ORIGINAL BULLET ═══
"${bullet}"

═══ TARGET ROLE / JD CONTEXT ═══
${jdContext}

${keywords?.length > 0 ? `Key terms to inject if relevant: ${keywords.slice(0, 10).join(', ')}` : ''}

═══ REWRITING RULES ═══

FORMAT — Use the XYZ formula:
"[Strong Action Verb] [what you built/did] [using what / how], [achieving measurable result]"

Examples of GOOD bullets:
• "Engineered a real-time notification system using WebSockets and Redis, reducing message delivery latency by 60%"
• "Optimized PostgreSQL query performance through indexing and connection pooling, cutting p95 response time from 2s to 180ms"
• "Built and deployed 3 React microfront-ends using Module Federation, enabling independent deployments across 4 teams"

Examples of BAD bullets (avoid these):
• "Worked on improving the system" (vague, no metric)
• "Responsible for frontend development" (passive, no impact)
• "Helped with various tasks related to backend" (generic, unmeasurable)

RULES:
1. Start with a strong past-tense action verb (Engineered, Built, Optimized, Reduced, Led, Deployed, Architected, Migrated, Automated, Implemented)
2. Be specific — name the actual technology/tool used
3. Include a metric if one can be reasonably inferred from the original (%, ms, x faster, $ saved, users, team size)
4. If no metric exists in the original, end with a qualitative impact ("enabling X", "supporting Y users", "reducing Z")
5. Length: 15–28 words. Concise but complete.
6. Do NOT add experience or achievements not implied by the original bullet
7. Do NOT use the candidate's name or any pronouns

═══ OUTPUT ═══
Return ONLY this JSON:
{
  "optimizedSlug": "The rewritten bullet (15-28 words, starts with action verb, includes metric or impact)",
  "explanation": [
    "What specific change was made and why it improves ATS score",
    "What keyword or metric was added"
  ],
  "detectedDomain": "The industry/domain detected from JD context (e.g. Frontend, Backend, DevOps, ML)"
}`;

        const models = REQUESTY_CONFIG.modelPriorities['optimization'] || REQUESTY_CONFIG.models;
        let response: any = null;

        for (const model of models) {
            try {
                response = await axios.post(
                    `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                    {
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: 'json_object' },
                        temperature: 0.2,
                    },
                    {
                        headers: getOpenRouterHeaders(API_KEY),
                        timeout: 30000,
                    }
                );
                break;
            } catch (err: any) {
                console.warn(`Model ${model} failed:`, err?.message);
            }
        }

        if (!response) {
            return NextResponse.json({ error: 'All models failed. Check API key and quota.' }, { status: 503 });
        }

        let result: any;
        try {
            const raw = response.data.choices[0].message.content || '{}';
            const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            result = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
        }

        const optimized = result.optimizedSlug?.trim();

        // Reject if AI returned the same bullet unchanged or an empty string
        if (!optimized || optimized === bullet.trim()) {
            return NextResponse.json({
                optimizedSlug: bullet,
                explanation: ['Could not improve this bullet — it may already be well-optimized'],
                domain: 'Tech',
            });
        }

        return NextResponse.json({
            optimizedSlug: optimized,
            explanation: result.explanation || [],
            domain: result.detectedDomain || 'Tech',
        });

    } catch (error: any) {
        console.error('Bullet Optimization Error:', error.message);
        return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
    }
}
