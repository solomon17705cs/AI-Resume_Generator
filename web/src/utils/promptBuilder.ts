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
  };
  atsType: ATSType;
  targetRole?: string;
}

/**
 * Builds a strict, schema-enforcing prompt for AI resume generation
 */
export function buildSchemaPrompt(context: PromptContext): string {
  const { jobDescription, userData, atsType, targetRole } = context;
  const atsRules = ATSGenerationRules[atsType] || ATSGenerationRules.generic;

  return `You are an ATS Optimization Engine specialized in ${atsType.toUpperCase()} systems.

CRITICAL MISSION: Generate a resume in STRICT JSON format that maximizes ATS compatibility.

═══════════════════════════════════════════════════════════════
📋 CONTEXT
═══════════════════════════════════════════════════════════════

Target ATS: ${atsType.toUpperCase()}
Target Role: ${targetRole || 'Software Engineer'}
Candidate: ${userData.name}
${userData.currentRole ? `Current Role: ${userData.currentRole}` : ''}
${userData.yearsExperience ? `Experience: ${userData.yearsExperience} years` : ''}

Job Description:
"""
${jobDescription.substring(0, 2000)}
"""

═══════════════════════════════════════════════════════════════
🎯 ATS-SPECIFIC RULES FOR ${atsType.toUpperCase()}
═══════════════════════════════════════════════════════════════

Bullet Style: ${atsRules.bulletStyle}
Keyword Density Target: ${atsRules.keywordDensity}
Max Words Per Bullet: ${atsRules.maxBulletWords}
Metrics Required: ${atsRules.requireMetrics ? 'YES - Every bullet must have a metric' : 'NO - Metrics optional'}
Section Order: ${atsRules.sectionOrder.join(' → ')}
Date Format: ${atsRules.dateFormat}

═══════════════════════════════════════════════════════════════
⚠️ STRICT CONSTRAINTS (MUST FOLLOW)
═══════════════════════════════════════════════════════════════

1. BULLET POINTS:
   - Start with action verb (Led, Developed, Architected, Optimized, etc.)
   - Maximum ${atsRules.maxBulletWords} words
   - ${atsRules.requireMetrics ? 'MUST include metric (%, $, time, scale)' : 'Include metrics when possible'}
   - Use technologies from job description
   - No vague language ("various", "multiple", "several")
   - No invented skills or technologies

2. PROFESSIONAL SUMMARY:
   - Maximum 60 words
   - Third person (no "I am" or "I'm")
   - Include: years of experience, top 3 skills, target role
   - Match job description keywords naturally

3. SKILLS:
   - Extract ONLY from job description
   - Group by category (Languages, Frameworks, Tools, etc.)
   - Minimum 3 skills per category
   - Include variants (e.g., JS, JavaScript, Node.js)

4. PROJECTS:
   - Maximum 30 words per description
   - List 2-4 technologies used
   - Include GitHub link if available
   - 1-3 bullet points per project

5. KEYWORD STRATEGY:
   - Target density: ${atsRules.keywordDensity}
   - Repeat critical skills across sections
   - Use exact phrases from job description
   - Natural integration (no keyword stuffing)

═══════════════════════════════════════════════════════════════
📐 REQUIRED JSON SCHEMA
═══════════════════════════════════════════════════════════════

{
  "summary": "string (max 60 words, third person, keyword-rich)",
  "experience": [
    {
      "title": "string (exact job title from JD if possible)",
      "company": "string",
      "location": "string (optional)",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or 'Present'",
      "bullets": [
        "string (action verb + tech + metric, max ${atsRules.maxBulletWords} words)"
      ]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (max 30 words)",
      "technologies": ["string", "string", ...],
      "link": "string (URL or empty)",
      "bullets": ["string (max ${atsRules.maxBulletWords} words)"]
    }
  ],
  "skills": [
    {
      "name": "string (category name)",
      "skills": ["string", "string", ...] (min 3)
    }
  ]
}

═══════════════════════════════════════════════════════════════
${userData.existingExperience && userData.existingExperience.length > 0 ? `
📝 EXISTING EXPERIENCE (Use as base, enhance with keywords)
═══════════════════════════════════════════════════════════════

${JSON.stringify(userData.existingExperience, null, 2)}
` : ''}
${userData.existingProjects && userData.existingProjects.length > 0 ? `
🚀 EXISTING PROJECTS (Use as base, enhance with keywords)
═══════════════════════════════════════════════════════════════

${JSON.stringify(userData.existingProjects, null, 2)}
` : ''}
${userData.existingSkills && userData.existingSkills.length > 0 ? `
🛠️ EXISTING SKILLS (Merge with JD keywords)
═══════════════════════════════════════════════════════════════

${JSON.stringify(userData.existingSkills, null, 2)}
` : ''}
═══════════════════════════════════════════════════════════════
✅ QUALITY CHECKLIST (Verify before returning)
═══════════════════════════════════════════════════════════════

- [ ] All bullets start with action verbs
- [ ] All bullets ≤ ${atsRules.maxBulletWords} words
- [ ] ${atsRules.requireMetrics ? 'Every bullet has a metric' : 'Metrics included where possible'}
- [ ] Summary is ≤ 60 words and third person
- [ ] Skills extracted from job description only
- [ ] No invented technologies or skills
- [ ] Keywords naturally integrated (density: ${atsRules.keywordDensity})
- [ ] Valid JSON format (no syntax errors)

═══════════════════════════════════════════════════════════════
🎯 OUTPUT INSTRUCTIONS
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON matching the schema above.
Do NOT include any explanation, markdown, or additional text.
The response must be parseable by JSON.parse().

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

ATS-Specific Rules for ${atsType.toUpperCase()}:
- Bullet Style: ${atsRules.bulletStyle}
- Max Words: ${atsRules.maxBulletWords}
- Metrics Required: ${atsRules.requireMetrics ? 'YES' : 'NO'}

Constraints:
1. Start with strong action verb
2. Maximum ${atsRules.maxBulletWords} words
3. ${atsRules.requireMetrics ? 'MUST include metric (%, $, time, scale)' : 'Include metric if possible'}
4. Use keywords from job description
5. Be specific (no "various", "multiple", "several")
6. Do NOT invent skills or technologies

Output Format (JSON):
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

TASK: Generate a compelling professional summary (max 60 words).

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
2. Third person (no "I am" or "I'm")
3. Include: years of experience, top 3 skills, target role
4. Match job description keywords naturally
5. Keyword density: ${atsRules.keywordDensity}

Output Format (JSON):
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
1. Extract ONLY skills explicitly mentioned in the job description
2. Categorize into: Languages, Frameworks, Tools, Methods, Domains
3. Include variants (e.g., JS, JavaScript, Node.js)
4. Minimum 3 skills per category
5. No generic terms ("good communication", "team player")

Output Format (JSON):
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
