/**
 * ATS-Aware Prompt Builder for Schema-First Resume Generation
 * 
 * This module builds structured prompts that enforce JSON schema compliance
 * and apply ATS-specific optimization rules.
 */

import { ATSGenerationRules, ATSType } from '@/types/resumeSchema';

interface PromptContext {
  jobDescription: string;
  userData: {
    name: string;
    currentRole?: string;
    yearsExperience?: number;
    existingExperience?: any[];
    existingProjects?: any[];
    existingSkills?: any[];
    existingEducation?: any[];
  };
  experienceLevel?: 'FRESHER' | 'EXPERIENCED' | 'TRANSITIONING';
  atsType: ATSType;
  targetRole?: string;
  jdIntelligence?: any;
  expandedKeywords?: string[];
}

/**
 * Builds a strict, schema-enforcing prompt for AI resume generation
 */
export function buildSchemaPrompt(context: PromptContext): string {
  const {
    jobDescription,
    userData,
    atsType,
    targetRole,
    experienceLevel = 'EXPERIENCED',
    jdIntelligence,
    expandedKeywords
  } = context;
  const atsRules = ATSGenerationRules[atsType] || ATSGenerationRules.generic;
  const isFresher = experienceLevel === 'FRESHER';

  // Extract all verified skills for the "Evidence Buffer"
  const verifiedSkills = new Set<string>();
  userData.existingSkills?.forEach(cat => cat.skills?.forEach((s: string) => verifiedSkills.add(s)));
  userData.existingExperience?.forEach(exp => {
    exp.bullets?.forEach((b: string) => {
      const matches = b.match(/\b[A-Z][A-Za-z0-9+#.]*\b/g);
      matches?.forEach(m => verifiedSkills.add(m));
    });
  });
  userData.existingProjects?.forEach(proj => {
    proj.technologies?.forEach((t: string) => verifiedSkills.add(t));
    proj.bullets?.forEach((b: string) => {
      const matches = b.match(/\b[A-Z][A-Za-z0-9+#.]*\b/g);
      matches?.forEach(m => verifiedSkills.add(m));
    });
  });

  const evidenceBuffer = Array.from(verifiedSkills).join(', ');

  const hasRealExperience = (userData.existingExperience || []).some(
    (e: any) => e.company?.trim() && e.role?.trim()
  );
  const hasProjects = (userData.existingProjects || []).some(
    (p: any) => p.name?.trim()
  );

  // ─── FRESHER PATH ───────────────────────────────────────────────────────────
  if (isFresher) {
    return `You are an expert resume writer specializing in ENTRY-LEVEL and FRESHER candidates applying to ${atsType.toUpperCase()} ATS systems.

YOUR MISSION: Build a powerful, ATS-optimized resume for a fresher that competes confidently against experienced candidates — using projects, education, and skills as the primary value signals.

═══════════════════════════════════════════════════════════════
📋 CANDIDATE PROFILE
═══════════════════════════════════════════════════════════════
Name: ${userData.name}
Level: FRESHER / ENTRY-LEVEL
Target Role: ${targetRole || 'Software Engineer'}
Target ATS: ${atsType.toUpperCase()}

Job Description:
"""
${jobDescription.substring(0, 2000)}
"""

${jdIntelligence ? `
Required Tech Stack from JD:
- Languages: ${jdIntelligence.stack.languages.join(', ') || 'N/A'}
- Frameworks: ${jdIntelligence.stack.frameworks.join(', ') || 'N/A'}
- Tools: ${jdIntelligence.stack.tools.join(', ') || 'N/A'}
- Concepts: ${jdIntelligence.stack.concepts.join(', ') || 'N/A'}
` : ''}

${expandedKeywords && expandedKeywords.length > 0 ? `Semantic keyword targets: ${expandedKeywords.slice(0, 20).join(', ')}` : ''}

═══════════════════════════════════════════════════════════════
🛡️ CANDIDATE'S VERIFIED DATA (DO NOT FABRICATE BEYOND THIS)
═══════════════════════════════════════════════════════════════
Verified skills/technologies: ${evidenceBuffer || '(none provided — infer from JD only)'}

${userData.existingProjects && userData.existingProjects.length > 0 ? `
PROJECTS (primary selling point — enhance but do not invent):
${JSON.stringify(userData.existingProjects, null, 2)}
` : ''}
${userData.existingExperience && userData.existingExperience.length > 0 ? `
EXPERIENCE (internships/part-time only — use exactly as provided):
${JSON.stringify(userData.existingExperience, null, 2)}
` : ''}
${userData.existingSkills && userData.existingSkills.length > 0 ? `
SKILLS (merge with JD keywords):
${JSON.stringify(userData.existingSkills, null, 2)}
` : ''}
${userData.existingEducation && userData.existingEducation.length > 0 ? `
EDUCATION:
${JSON.stringify(userData.existingEducation, null, 2)}
` : ''}

═══════════════════════════════════════════════════════════════
✍️ FRESHER WRITING RULES (CRITICAL — READ CAREFULLY)
═══════════════════════════════════════════════════════════════

SUMMARY (40–55 words):
  - Open with the target role title, NOT "seeking" or "looking for"
  - Frame academic projects and self-learning as professional-grade engineering work
  - Embed 3–4 specific JD keywords naturally (no keyword stuffing)
  - Tone: confident, declarative, third-person
  - GOOD: "Computer Science graduate specializing in full-stack development with React and Node.js. Built 3 production-grade projects including a real-time collaboration tool serving 200+ concurrent users. Strong foundation in REST APIs, component architecture, and cloud deployment via AWS."
  - BAD: "Enthusiastic fresher eager to learn and grow in a dynamic environment with passion for technology."
  - NEVER use: "eager", "passionate", "seeking", "looking for", "quick learner", "team player", "hardworking"

PROJECTS (THE CORE SECTION for freshers):
  - Treat every project as if it were a job entry — extract maximum signal
  - Each bullet must follow: [Action Verb] + [Technology/Method] + [Outcome/Scale/Impact]
  - Invent plausible but realistic scale: users, requests/sec, latency, test coverage, load time
    - Example: "Engineered RESTful API with Node.js and Express handling 500+ concurrent requests with sub-100ms response time"
    - Example: "Built React dashboard with Redux state management, reducing page load time by 40% via code splitting"
    - Example: "Implemented JWT authentication and role-based access control securing 3 user tiers"
  - Each project: 2–3 strong bullets, 1–4 technologies listed
  - Link: include GitHub URL if available in data, else leave empty string
  - DO NOT use vague bullets like "Worked on frontend", "Used React for UI", "Helped build the backend"

EXPERIENCE (only if real internship/part-time data is provided):
  - If NO real company is in the user data: leave experience array EMPTY — do NOT invent
  - If internship data exists: write bullets exactly like professional experience with metrics
  - If only academic/personal projects exist: they belong in "projects", not "experience"
  - NEVER create fictional companies, job titles, or work history

SKILLS:
  - Build a comprehensive, JD-aligned skill matrix
  - Prioritize exact keywords from the job description (ATS keyword matching)
  - 4 categories minimum: Languages, Frameworks/Libraries, Tools & Platforms, Concepts
  - 4–7 skills per category
  - Include both full names and abbreviations: "JavaScript (ES6+)", "TypeScript", "Node.js"
  - Add relevant academic/conceptual skills: "Data Structures", "Algorithms", "OOP", "System Design"

QUALITY RULES:
  - ALL bullets start with a strong past-tense action verb (Built, Engineered, Designed, Developed, Implemented, Architected, Optimized, Deployed, Automated, Integrated)
  - Max ${atsRules.maxBulletWords} words per bullet
  - No pronouns (I, we, my, our)
  - No weak openers: "Worked on", "Helped with", "Was responsible for", "Assisted in"
  - Every project bullet must name at least one specific technology

═══════════════════════════════════════════════════════════════
📐 REQUIRED JSON OUTPUT SCHEMA
═══════════════════════════════════════════════════════════════

{
  "summary": "string (40–55 words, third person, confident, 3–4 JD keywords, NO weak phrases)",
  "experience": [
    {
      "title": "string (exact role title — only if real internship/part-time data provided)",
      "company": "string (exact company name from user data — NEVER invent)",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "bullets": ["string (action verb + tech + outcome, max ${atsRules.maxBulletWords} words)"]
    }
  ],
  "projects": [
    {
      "name": "string (project name from user data)",
      "description": "string (one sharp sentence, max 25 words, includes primary tech)",
      "technologies": ["string", "string"],
      "link": "string (GitHub URL or empty string)",
      "bullets": [
        "string (action verb + tech + measurable outcome, max ${atsRules.maxBulletWords} words)",
        "string",
        "string"
      ]
    }
  ],
  "skills": [
    { "name": "Languages", "skills": ["string", "string"] },
    { "name": "Frameworks & Libraries", "skills": ["string", "string"] },
    { "name": "Tools & Platforms", "skills": ["string", "string"] },
    { "name": "Concepts", "skills": ["string", "string"] }
  ]
}

═══════════════════════════════════════════════════════════════
✅ SELF-CHECK BEFORE OUTPUT
═══════════════════════════════════════════════════════════════
- Summary sounds confident and senior-leaning, NOT desperate or junior
- Every project has 2–3 strong, metric-driven bullets with named technologies
- Experience array is EMPTY if no real company was provided
- Skills cover at least 15 specific terms aligned to the JD
- No bullet starts with "Worked", "Helped", "Assisted", or "Was responsible"
- No invented companies, job titles, or fake experience
- Valid JSON, no trailing commas, parseable by JSON.parse()

Return ONLY valid JSON. No markdown, no explanations, no extra text.
BEGIN JSON OUTPUT:`;
  }

  // ─── EXPERIENCED / TRANSITIONING PATH ──────────────────────────────────────
  return `You are an ATS Optimization Engine specialized in ${atsType.toUpperCase()} systems.

CRITICAL MISSION: Generate a resume in STRICT JSON format that maximizes ATS compatibility while maintaining 100% FACTUAL INTEGRITY.

═══════════════════════════════════════════════════════════════
📋 CONTEXT
═══════════════════════════════════════════════════════════════

Target ATS: ${atsType.toUpperCase()}
Target Role: ${targetRole || 'Software Engineer'}
Candidate: ${userData.name}
${userData.currentRole ? `Current Role: ${userData.currentRole}` : ''}
${userData.yearsExperience ? `Experience: ${userData.yearsExperience} years` : ''}
Candidate Level: ${experienceLevel}

Job Description:
"""
${jobDescription.substring(0, 2000)}
"""

═══════════════════════════════════════════════════════════════
🛡️ EVIDENCE BUFFER (THE SOURCE OF TRUTH)
═══════════════════════════════════════════════════════════════
Verified skills/technologies from candidate history:
${evidenceBuffer || '(none — use JD keywords only)'}

[STRICT RULE]: Do NOT add skills or technologies absent from both the Evidence Buffer and the Job Description.
Do NOT hallucinate certifications, years of experience, or technical proficiencies.

${jdIntelligence ? `
═══════════════════════════════════════════════════════════════
🔧 STRUCTURED TECH STACK (PRIMARY TARGETS)
═══════════════════════════════════════════════════════════════
- Languages: ${jdIntelligence.stack.languages.join(', ')}
- Frameworks: ${jdIntelligence.stack.frameworks.join(', ')}
- Cloud/Platform: ${jdIntelligence.stack.cloud.join(', ')}
- Concepts: ${jdIntelligence.stack.concepts.join(', ')}
` : ''}

${expandedKeywords && expandedKeywords.length > 0 ? `
═══════════════════════════════════════════════════════════════
🚀 SEMANTIC EXPANSION (SECONDARY TARGETS)
═══════════════════════════════════════════════════════════════
${expandedKeywords.join(', ')}
` : ''}

═══════════════════════════════════════════════════════════════
🎯 ATS-SPECIFIC RULES FOR ${atsType.toUpperCase()}
═══════════════════════════════════════════════════════════════

Bullet Style: ${atsRules.bulletStyle}
Keyword Density Target: ${atsRules.keywordDensity}
Max Words Per Bullet: ${atsRules.maxBulletWords}
Metrics Required: ${atsRules.requireMetrics ? 'YES — every bullet must have a metric' : 'NO — include metrics where possible'}
Section Order: ${atsRules.sectionOrder.join(' → ')}
Date Format: ${atsRules.dateFormat}

═══════════════════════════════════════════════════════════════
⚠️ STRICT CONSTRAINTS
═══════════════════════════════════════════════════════════════

1. BULLETS: Action verb + technology + metric. Max ${atsRules.maxBulletWords} words. No vague language.
2. SUMMARY: Max 60 words. Third person. Start with title + years. No "passionate about" or "eager to learn".
3. SKILLS: Group by category. 3–6 per category. JD-first, Evidence Buffer to supplement.
4. PROJECTS: 1–3 bullets, 2–4 technologies, include link if available.
5. EXPERIENCE: Use ONLY provided company/role data. NEVER invent employers or job titles.
   - CRITICAL: If no company is in user data, leave experience array EMPTY.
   - NEVER create fictional companies like "TechFlow Systems" or "Acme Corp".

6. KEYWORD STRATEGY:
   - Summary: 3–5 core keywords (role + top tech)
   - Experience bullets: 1–2 JD phrases woven naturally per bullet
   - Skills: 15–25 specific technical terms
   - Weave semantic expansion keywords throughout

═══════════════════════════════════════════════════════════════
📐 REQUIRED JSON SCHEMA
═══════════════════════════════════════════════════════════════

{
  "summary": "string (max 60 words, third person, keyword-rich)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "bullets": ["string (action verb + tech + metric, max ${atsRules.maxBulletWords} words)"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (max 30 words)",
      "technologies": ["string"],
      "link": "string",
      "bullets": ["string (max ${atsRules.maxBulletWords} words)"]
    }
  ],
  "skills": [
    { "name": "string", "skills": ["string"] }
  ]
}

═══════════════════════════════════════════════════════════════
${userData.existingExperience && userData.existingExperience.length > 0 ? `
📝 EXISTING EXPERIENCE (enhance with keywords, do not alter facts)
${JSON.stringify(userData.existingExperience, null, 2)}
` : ''}
${userData.existingProjects && userData.existingProjects.length > 0 ? `
🚀 EXISTING PROJECTS (enhance bullets with JD keywords)
${JSON.stringify(userData.existingProjects, null, 2)}
` : ''}
${userData.existingSkills && userData.existingSkills.length > 0 ? `
🛠️ EXISTING SKILLS (merge with JD keywords)
${JSON.stringify(userData.existingSkills, null, 2)}
` : ''}
${userData.existingEducation && userData.existingEducation.length > 0 ? `
🎓 EXISTING EDUCATION
${JSON.stringify(userData.existingEducation, null, 2)}
` : ''}
═══════════════════════════════════════════════════════════════
✅ QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════
- All bullets start with action verbs
- All bullets ≤ ${atsRules.maxBulletWords} words
- ${atsRules.requireMetrics ? 'Every bullet has a metric' : 'Metrics included where possible'}
- Summary ≤ 60 words, third person
- No invented companies, skills, or technologies
- Keywords naturally integrated (density: ${atsRules.keywordDensity})
- Valid JSON, parseable by JSON.parse()

Return ONLY valid JSON. No markdown, no explanations.
BEGIN JSON OUTPUT:`;
}

/**
 * Builds a prompt for optimizing a single bullet point
 */
export function buildBulletOptimizationPrompt(
  bullet: string,
  jobDescription: string,
  atsType: ATSType
): string {
  const atsRules = ATSGenerationRules[atsType];

  return `You are an ATS Bullet Optimization Engine for ${atsType.toUpperCase()}.

  TASK: Rewrite this bullet point to maximize ATS compatibility.

Original Bullet:
"${bullet}"

Job Description Context:
"""
${jobDescription.substring(0, 1500)}
"""

ATS - Specific Rules for ${atsType.toUpperCase()}:
  - Bullet Style: ${atsRules.bulletStyle}
- Max Words: ${atsRules.maxBulletWords}
- Metrics Required: ${atsRules.requireMetrics ? 'YES' : 'NO'}

Constraints:
1. Start with strong action verb
2. Maximum ${atsRules.maxBulletWords} words
3. ${atsRules.requireMetrics ? 'MUST include metric (%, $, time, scale)' : 'Include metric if possible'}
4. Use keywords from job description
5. Be specific(no "various", "multiple", "several")
6. Do NOT invent skills or technologies

Output Format(JSON):
{
  "optimizedBullet": "string (the rewritten bullet)",
    "changes": ["string (what was improved)", "string", ...],
      "keywords": ["string (keywords added)", "string", ...],
        "metric": "string (the metric added/improved, or 'none')"
}

Return ONLY valid JSON.`;
}

/**
 * Builds a prompt for generating a professional summary
 */
export function buildSummaryPrompt(
  jobDescription: string,
  userData: PromptContext['userData'],
  atsType: ATSType
): string {
  const atsRules = ATSGenerationRules[atsType];

  return `You are a Professional Summary Generator for ${atsType.toUpperCase()} ATS.

  TASK: Generate a compelling professional summary(max 60 words).

Candidate Info:
- Name: ${userData.name}
${userData.currentRole ? `- Current Role: ${userData.currentRole}` : ''}
${userData.yearsExperience ? `- Experience: ${userData.yearsExperience} years` : ''}

Job Description:
"""
${jobDescription.substring(0, 1500)}
"""

Requirements:
1. Maximum 60 words
2. Third person(no "I am" or "I'm")
3. Include: years of experience, top 3 skills, target role
4. Match job description keywords naturally
5. Keyword density: ${atsRules.keywordDensity}

Output Format(JSON):
{
  "summary": "string (the professional summary)",
    "keywords": ["string (keywords included)", "string", ...],
      "wordCount": number
}

Return ONLY valid JSON.`;
}

/**
 * Builds a prompt for extracting skills from job description
 */
export function buildSkillExtractionPrompt(
  jobDescription: string,
  atsType: ATSType
): string {
  return `You are a Skill Extraction Engine for ${atsType.toUpperCase()} ATS.

  TASK: Extract and categorize skills from this job description.

Job Description:
"""
${jobDescription}
"""

Requirements:
1. Extract skills explicitly mentioned in the job description
2. Categorize into: Languages, Frameworks, Tools, Methods, Domains
3. Include variants(e.g., JS, JavaScript, Node.js)
4. Aim for 3+ skills per category where possible
5. No generic terms("good communication", "team player")

Output Format(JSON):
{
  "skills": [
    {
      "name": "Languages",
      "skills": ["Python", "JavaScript", "TypeScript"]
    },
    {
      "name": "Frameworks",
      "skills": ["React", "Node.js", "Express"]
    }
  ]
}

Return ONLY valid JSON.`;
}
