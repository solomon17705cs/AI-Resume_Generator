/**
 * optimize-summary/route.ts — Professional Summary Optimization
 *
 * FIXED:
 * 1. Removed "Third-person only" instruction — this was causing the AI to write
 *    "Solomon K is a Frontend Engineer..." which is a recommendation letter, not
 *    a resume summary. Resume summaries use implied first-person (no pronoun).
 * 2. Fixed structural template — no more "Sentence 1: name + role" pattern.
 * 3. Summary now reads as the candidate's own professional voice.
 * 4. Enforced resume summary conventions used at Google/FAANG level.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { REQUESTY_CONFIG, getOpenRouterHeaders } from '@/config/requesty';

const API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();

async function callWithFallback(prompt: string): Promise<any> {
    const models = REQUESTY_CONFIG.modelPriorities['generation'] || REQUESTY_CONFIG.models;
    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const response = await axios.post(
                `${REQUESTY_CONFIG.baseURL}/chat/completions`,
                {
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    temperature: 0.3,
                },
                {
                    headers: getOpenRouterHeaders(API_KEY),
                    timeout: 30000,
                }
            );
            return response.data;
        } catch (err: any) {
            console.warn(`Model ${model} failed:`, err?.message);
            lastError = err;
        }
    }
    throw lastError || new Error('All models failed');
}

export async function POST(req: NextRequest) {
    try {
        const { summary, job_description, candidate_name } = await req.json();

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        if (!job_description) {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        const prompt = `You are a professional resume writer who specializes in writing executive summaries for software engineers targeting top-tier companies like Google, Meta, and Amazon.

Your task: Rewrite the candidate's professional summary into a polished, ATS-optimized resume summary.

═══ CRITICAL RULES ═══

VOICE (most important):
- Write in IMPLIED FIRST PERSON — no pronouns at all ("I", "he", "she", "they", their name)
- WRONG: "Solomon is a Frontend Engineer who builds..."
- WRONG: "I am a Frontend Engineer with 3 years..."  
- CORRECT: "Frontend Engineer with 3 years of experience building..."
- CORRECT: "Results-driven Software Engineer specializing in..."
- Think of it as a headline + pitch, not a sentence about a person

LENGTH: 50–65 words exactly. Recruiters read summaries in under 10 seconds.

STRUCTURE (3 sentences):
1. Role title + years of experience + primary specialization
2. 2–3 core technical strengths pulled directly from the job description
3. One quantifiable achievement or business impact (use numbers if available in the current summary; if none, use strong qualitative impact)

KEYWORDS: Naturally weave in at least 5 technical keywords from the job description. Do not stuff — they must read naturally.

TONE: Confident, results-oriented. No filler words like "passionate", "dedicated", "hardworking", "detail-oriented".

═══ INPUT ═══
Job Description (extract keywords from this):
"""
${job_description.substring(0, 2000)}
"""

Candidate's Current Summary (extract facts from this — do NOT invent experience):
"""
${summary || 'No existing summary provided. Write based on the job description requirements only.'}
"""

═══ OUTPUT ═══
Return ONLY this JSON:
{
  "optimizedSummary": "The rewritten summary (50-65 words, implied first-person, no name, no pronouns)",
  "keywordsInjected": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "wordCount": 55,
  "impactStatement": "The specific achievement/impact sentence used"
}`;

        const response = await callWithFallback(prompt);
        const raw = response.choices[0].message.content;

        let result;
        try {
            const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            result = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
        }

        // Validate: if the summary still contains the candidate's name or pronouns, strip them
        let finalSummary: string = result.optimizedSummary || '';

        if (candidate_name) {
            // Remove name variants (first name, last name, full name)
            const nameParts = candidate_name.trim().split(/\s+/);
            nameParts.forEach((part: string) => {
                if (part.length > 2) {
                    finalSummary = finalSummary.replace(new RegExp(`\\b${part}\\b`, 'gi'), '').trim();
                }
            });
        }

        // Remove leading pronouns that AI might still slip in
        finalSummary = finalSummary
            .replace(/^(He|She|They|I|We)\s+/i, '')
            .replace(/^(is a|is an|are a)\s+/i, '')
            .trim();

        // Capitalise first letter after cleanup
        if (finalSummary.length > 0) {
            finalSummary = finalSummary.charAt(0).toUpperCase() + finalSummary.slice(1);
        }

        return NextResponse.json({
            optimizedSummary: finalSummary,
            keywords: result.keywordsInjected || [],
            wordCount: result.wordCount || finalSummary.split(/\s+/).length,
            impact: result.impactStatement || '',
        });

    } catch (error: any) {
        console.error('Summary Optimization Error:', error.message);
        return NextResponse.json({ error: 'Optimization failed', details: error.message }, { status: 500 });
    }
}
