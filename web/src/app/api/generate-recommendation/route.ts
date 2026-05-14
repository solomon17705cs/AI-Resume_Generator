/**
 * api/generate-recommendation/route.ts
 *
 * Generates professional recommendation letters tailored to:
 * - The specific company and role being applied for
 * - The relationship type (professor, manager, colleague, mentor)
 * - The candidate's actual resume content and achievements
 * - The tone required (academic, corporate, startup, research)
 *
 * Output: A ready-to-send letter the recommender only needs to review and sign.
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
                    temperature: 0.4, // Slightly higher for natural writing variation
                },
                {
                    headers: getOpenRouterHeaders(API_KEY),
                    timeout: 45000,
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

// ─── Relationship-specific tone guides ────────────────────────────────────────

const RELATIONSHIP_CONTEXT: Record<string, {
    salutation: string;
    writerTitle: string;
    knowledgeFrame: string;
    closingTitle: string;
    toneNotes: string;
}> = {
    professor: {
        salutation: 'Dear Hiring Committee',
        writerTitle: 'Professor / Faculty Advisor',
        knowledgeFrame: 'as their course instructor and academic advisor',
        closingTitle: 'Professor, Department of [Department]',
        toneNotes: 'Academic, formal. Emphasize intellectual ability, research potential, coursework performance, and work ethic. Reference specific assignments or projects where the student excelled.',
    },
    manager: {
        salutation: 'Dear Hiring Manager',
        writerTitle: 'Direct Manager / Engineering Manager',
        knowledgeFrame: 'as their direct manager over [X] years',
        closingTitle: 'Engineering Manager, [Company]',
        toneNotes: 'Professional, results-oriented. Emphasize business impact, ownership, reliability, and teamwork. Include specific metrics and deliverables where possible.',
    },
    colleague: {
        salutation: 'Dear Hiring Manager',
        writerTitle: 'Senior Engineer / Technical Lead',
        knowledgeFrame: 'as a colleague and collaborator on multiple projects',
        closingTitle: 'Senior Software Engineer, [Company]',
        toneNotes: 'Warm but professional. Emphasize collaboration, technical skills observed first-hand, problem-solving approach, and team contribution.',
    },
    mentor: {
        salutation: 'Dear Hiring Committee',
        writerTitle: 'Industry Mentor / Senior Advisor',
        knowledgeFrame: 'as their industry mentor over the past [X] months',
        closingTitle: 'Principal Engineer / Senior Advisor',
        toneNotes: 'Thoughtful and endorsing. Emphasize growth mindset, initiative, coachability, and long-term potential. Share specific mentoring conversations or breakthrough moments.',
    },
    internship_supervisor: {
        salutation: 'Dear Hiring Manager',
        writerTitle: 'Internship Supervisor / Team Lead',
        knowledgeFrame: 'as their supervisor during their internship at [Company]',
        closingTitle: 'Team Lead, [Company]',
        toneNotes: 'Enthusiastic and specific. Emphasize how quickly they ramped up, what they shipped, and how they compared to other interns. Mention if you would hire them full-time.',
    },
};

// ─── Letter templates by purpose ─────────────────────────────────────────────

const PURPOSE_FOCUS: Record<string, string> = {
    fulltime: 'full-time software engineering role at a technology company',
    internship: 'software engineering internship at a technology company',
    masters: "Master's degree program in Computer Science or related field",
    phd: 'PhD program in Computer Science or related research field',
    scholarship: 'competitive scholarship or fellowship program',
    promotion: 'internal promotion or senior role advancement',
};

export async function POST(req: NextRequest) {
    try {
        const {
            // Who is being recommended
            candidateName,
            candidateEmail,

            // Who is writing the letter
            recommenderName,
            recommenderTitle,
            recommenderOrg,
            recommenderEmail,

            // Relationship context
            relationshipType,          // 'professor' | 'manager' | 'colleague' | 'mentor' | 'internship_supervisor'
            relationshipDuration,      // e.g. "2 years", "1 semester"
            howTheyKnow,               // Free text: "supervised during final year project"

            // Target application
            targetCompany,
            targetRole,
            purpose,                   // 'fulltime' | 'internship' | 'masters' | 'phd' | 'scholarship'

            // Resume content (to extract real achievements)
            resumeData,
            jobDescription,

            // Optional specifics
            specificAchievements,      // string[] — recommender's personal observations
            personalityTraits,         // string[] — e.g. ["curious", "self-motivated"]
            tone,                      // 'formal' | 'warm' | 'concise'
        } = await req.json();

        if (!candidateName || !targetRole) {
            return NextResponse.json({
                error: 'candidateName and targetRole are required'
            }, { status: 400 });
        }

        if (!API_KEY || !API_KEY.startsWith('sk-or-v1-')) {
            return NextResponse.json({
                error: 'API Key not configured',
                message: 'Add OPENROUTER_API_KEY to .env.local'
            }, { status: 500 });
        }

        const relContext = RELATIONSHIP_CONTEXT[relationshipType] || RELATIONSHIP_CONTEXT.manager;
        const purposeText = PURPOSE_FOCUS[purpose] || PURPOSE_FOCUS.fulltime;

        // Extract candidate highlights from resume
        const resumeHighlights = extractResumeHighlights(resumeData);

        // Extract JD keywords to align letter with what the company wants
        const jdKeywords = jobDescription
            ? extractJDKeywords(jobDescription)
            : [];

        const prompt = `You are a professional letter writer helping a ${relContext.writerTitle} write a compelling recommendation letter.

═══ CONTEXT ═══
Recommender: ${recommenderName || '[Recommender Name]'}, ${recommenderTitle || relContext.writerTitle} at ${recommenderOrg || '[Organization]'}
Candidate: ${candidateName}
Relationship: Known ${relContext.knowledgeFrame} for ${relationshipDuration || '[duration]'}
Specific context: ${howTheyKnow || 'Worked together on multiple technical projects'}

Target: ${candidateName} is applying for a ${purposeText} — specifically the ${targetRole} role at ${targetCompany || 'the company'}.

═══ CANDIDATE'S REAL ACHIEVEMENTS (from resume) ═══
${resumeHighlights}

${specificAchievements?.length > 0 ? `
═══ RECOMMENDER'S PERSONAL OBSERVATIONS ═══
${specificAchievements.join('\n')}
` : ''}

${jdKeywords.length > 0 ? `
═══ JOB REQUIREMENTS TO ADDRESS ═══
The role requires: ${jdKeywords.join(', ')}
The letter should naturally demonstrate how ${candidateName} meets these requirements.
` : ''}

${personalityTraits?.length > 0 ? `
═══ CHARACTER TRAITS TO HIGHLIGHT ═══
${personalityTraits.join(', ')}
` : ''}

═══ LETTER REQUIREMENTS ═══

STRUCTURE (4 paragraphs):

Paragraph 1 — OPENING (3-4 sentences):
- Who you are and your role/authority
- How you know ${candidateName} and for how long
- Your overall strong endorsement (don't bury the lead — open with enthusiasm)
- Example: "It is my distinct pleasure to recommend [Name], whom I have supervised for 2 years as their Engineering Manager at [Company]. In my 15 years leading engineering teams, [Name] stands out as one of the most capable and growth-oriented engineers I have mentored."

Paragraph 2 — TECHNICAL EXCELLENCE (4-5 sentences):
- Specific technical projects or work they did
- Concrete outcomes and impact (numbers preferred)
- Comparison to peers ("top 10% of engineers I've worked with")
- Reference actual technologies/skills relevant to the target role: ${jdKeywords.slice(0, 5).join(', ')}

Paragraph 3 — CHARACTER & COLLABORATION (3-4 sentences):
- Soft skills demonstrated in real situations
- How they handle challenges, failure, pressure
- Team dynamics and leadership potential
- Growth and learning velocity

Paragraph 4 — CLOSING ENDORSEMENT (2-3 sentences):
- Unequivocal recommendation
- Specific claim about fit for THIS role at THIS company
- Offer to discuss further (include recommender email: ${recommenderEmail || '[email]'})

TONE: ${tone === 'formal' ? 'Formal and authoritative — written by a senior professional with gravitas' :
         tone === 'warm' ? 'Warm and personal — genuine enthusiasm with specific anecdotes' :
         'Professional but personable — credible and sincere'}

LENGTH: 350-450 words. Long enough to be taken seriously, short enough to be read fully.

CRITICAL RULES:
1. Write in first person as the recommender (use "I", "my", "we")
2. Be specific — generic praise ("hardworking", "passionate") without evidence is ignored by hiring committees
3. Use ${candidateName}'s name 3-4 times, not more
4. Do NOT fabricate achievements not present in the resume data above
5. Do NOT include salary or compensation mentions
6. Write as if YOU experienced these things — not as a list of facts

═══ OUTPUT FORMAT ═══
Return this exact JSON:
{
  "subject": "Recommendation Letter for ${candidateName} — ${targetRole} at ${targetCompany || 'Your Company'}",
  "letter": "Full letter text with proper paragraph breaks using \\n\\n",
  "opening": "${relContext.salutation},",
  "closing": "Sincerely,\\n\\n${recommenderName || '[Recommender Name]'}\\n${recommenderTitle || relContext.closingTitle}\\n${recommenderOrg || '[Organization]'}\\n${recommenderEmail || '[email]'}",
  "keyStrengthsHighlighted": ["strength1", "strength2", "strength3"],
  "jdAlignmentPoints": ["how letter addresses JD requirement 1", "requirement 2"],
  "wordCount": 380
}`;

        const response = await callWithFallback(prompt);
        const raw = response.choices[0].message.content || '{}';
        const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        let result;
        try {
            result = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ error: 'AI returned invalid format. Please try again.' }, { status: 502 });
        }

        // Assemble the full printable letter
        const fullLetter = assembleFullLetter({
            recommenderName: recommenderName || '[Recommender Name]',
            recommenderTitle: recommenderTitle || relContext.writerTitle,
            recommenderOrg: recommenderOrg || '[Organization]',
            recommenderEmail: recommenderEmail || '',
            salutation: result.opening || `${relContext.salutation},`,
            body: result.letter || '',
            closing: result.closing || '',
            targetCompany: targetCompany || '',
            targetRole,
            candidateName,
        });

        return NextResponse.json({
            success: true,
            subject: result.subject,
            letter: result.letter,
            fullLetter,                              // Ready to copy-paste or export as PDF
            opening: result.opening,
            closing: result.closing,
            keyStrengthsHighlighted: result.keyStrengthsHighlighted || [],
            jdAlignmentPoints: result.jdAlignmentPoints || [],
            wordCount: result.wordCount || 0,
            metadata: {
                candidateName,
                targetRole,
                targetCompany: targetCompany || '',
                recommenderName: recommenderName || '',
                relationshipType,
                purpose,
                generatedAt: new Date().toISOString(),
            },
        });

    } catch (error: any) {
        console.error('Recommendation Generation Error:', error.message);
        return NextResponse.json({
            error: 'Generation failed',
            details: error.message
        }, { status: 503 });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractResumeHighlights(resumeData: any): string {
    if (!resumeData) return 'No resume data provided.';

    const lines: string[] = [];

    if (resumeData.summary) {
        lines.push(`Summary: ${resumeData.summary}`);
    }

    resumeData.experience?.slice(0, 3).forEach((exp: any) => {
        lines.push(`\nRole: ${exp.role} at ${exp.company} (${exp.dates})`);
        exp.bullets?.slice(0, 3).forEach((b: string) => lines.push(`  • ${b}`));
    });

    resumeData.projects?.slice(0, 3).forEach((proj: any) => {
        lines.push(`\nProject: ${proj.name} | ${proj.technologies?.join(', ')}`);
        if (proj.description) lines.push(`  ${proj.description}`);
        proj.bullets?.slice(0, 2).forEach((b: string) => lines.push(`  • ${b}`));
    });

    resumeData.skills?.forEach((cat: any) => {
        lines.push(`${cat.name}: ${cat.skills?.join(', ')}`);
    });

    resumeData.education?.forEach((edu: any) => {
        lines.push(`Education: ${edu.degree} — ${edu.institution} (${edu.graduationDate})`);
    });

    return lines.join('\n');
}

function extractJDKeywords(jd: string): string[] {
    const techPattern = /\b(React|Angular|Vue|Node\.js|Python|Java|TypeScript|JavaScript|Go|AWS|Docker|Kubernetes|PostgreSQL|MongoDB|GraphQL|REST|CI\/CD|Git|Agile|Machine Learning|Deep Learning|TensorFlow|PyTorch|System Design|Microservices|Distributed Systems|Leadership|Communication|Problem.Solving)\b/gi;
    const matches = jd.match(techPattern) || [];
    return [...new Set(matches.map(m => m.trim()))].slice(0, 15);
}

function assembleFullLetter(params: {
    recommenderName: string;
    recommenderTitle: string;
    recommenderOrg: string;
    recommenderEmail: string;
    salutation: string;
    body: string;
    closing: string;
    targetCompany: string;
    targetRole: string;
    candidateName: string;
}): string {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return `${params.recommenderName}
${params.recommenderTitle}
${params.recommenderOrg}
${params.recommenderEmail}

${date}

${params.targetCompany ? `${params.targetCompany} Hiring Team` : 'Hiring Committee'}
${params.targetRole} Position

${params.salutation}

${params.body}

${params.closing}`;
}