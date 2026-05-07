/**
 * keywordAnalyzer.ts
 *
 * FIXED:
 * - Removed dependency on fullStackKeywords.ts (hardcoded static list that ignores actual JD)
 * - `customKeywords` (from LLaMA extraction in route.ts) is now the PRIMARY source
 * - Falls back to simple regex extraction from the raw JD only if LLaMA gives nothing
 * - Priority calculation now based on actual JD term frequency, not hardcoded weights
 * - Score/found/missing all come from the SAME keyword list (no split-brain)
 */

import { normalizeJobDescription } from './textNormalization';

export interface KeywordMetric {
    text: string;
    found: boolean;
    count_in_resume: number;
    count_in_jd: number;
    priority: 'high' | 'medium' | 'low';
    context: string;
    recommended_bullet?: string;
}

export interface KeywordAnalysisResult {
    density: number;
    metrics: KeywordMetric[];
    found: string[];
    missing: string[];
    keywordCounts: Record<string, number>;
    totalWords: number;
    missingCritical: string[];
    recommendations: ReturnType<typeof generateRecommendations>;
}

/**
 * Core analysis function.
 *
 * @param resumeText    - Raw resume text
 * @param jobDescription - Raw JD text
 * @param jdKeywords    - Keywords extracted by LLaMA from route.ts (PRIMARY source)
 *                        If empty/undefined, falls back to regex extraction from JD
 */
export const analyzeKeywordDensity = (
    resumeText: string,
    jobDescription: string,
    jdKeywords?: string[]
): KeywordAnalysisResult => {

    // 1. Normalize JD (clean noise, preserve all content)
    const normalizedJD = normalizeJobDescription(jobDescription);
    const resumeLower = resumeText.toLowerCase();
    const jdLower = normalizedJD.toLowerCase();

    // 2. Determine keyword list
    //    Priority: LLaMA-extracted → fallback regex
    let keywordsToAnalyze: string[];

    if (jdKeywords && jdKeywords.length > 5) {
        // Use LLaMA keywords directly — these are already JD-specific
        keywordsToAnalyze = deduplicateKeywords(jdKeywords);
    } else {
        // Fallback: extract from JD using regex (no static dictionary)
        keywordsToAnalyze = extractKeywordsFromJD(normalizedJD);
    }

    // 3. Match each keyword against the resume
    const resumeWords = resumeText.toLowerCase().match(/\b\w+\b/g)?.filter(w => w.length > 2) || [];
    const totalResumeWords = resumeWords.length;

    let totalKeywordOccurrences = 0;

    const metrics: KeywordMetric[] = keywordsToAnalyze.map(keyword => {
        const countInResume = countOccurrences(keyword, resumeLower);
        const countInJD = countOccurrences(keyword, jdLower);

        totalKeywordOccurrences += countInResume;

        // Priority based on how often the JD actually uses this term
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (countInJD >= 3) priority = 'high';
        else if (countInJD >= 2) priority = 'medium';

        // Pull context sentence from JD
        const context = getContextSentence(normalizedJD, keyword);

        return {
            text: keyword,
            found: countInResume > 0,
            count_in_resume: countInResume,
            count_in_jd: countInJD,
            priority,
            context: context || `Appears ${countInJD}x in job description`,
            recommended_bullet: countInResume === 0
                ? `Developed and deployed solutions using ${keyword}, improving system efficiency by 20%`
                : undefined,
        };
    });

    // 4. Density calculation
    const density = totalResumeWords > 0
        ? Math.min((totalKeywordOccurrences / totalResumeWords) * 100, 100)
        : 0;

    const found = metrics.filter(m => m.found).map(m => m.text);
    const missing = metrics.filter(m => !m.found).map(m => m.text);

    // Critical = high priority AND missing
    const missingCritical = metrics
        .filter(m => !m.found && m.priority === 'high')
        .map(m => m.text)
        .slice(0, 10);

    return {
        density,
        metrics,
        found,
        missing,
        keywordCounts: Object.fromEntries(metrics.map(m => [m.text, m.count_in_resume])),
        totalWords: totalResumeWords,
        missingCritical,
        recommendations: generateRecommendations(density, missingCritical, totalResumeWords),
    };
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Count how many times a keyword appears in text.
 * Handles multi-word phrases and special characters (C++, Node.js, etc.)
 */
function countOccurrences(keyword: string, text: string): number {
    try {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Only add word boundaries where the keyword starts/ends with a word character
        const startBound = /^\w/.test(keyword) ? '\\b' : '';
        const endBound = /\w$/.test(keyword) ? '\\b' : '';
        const regex = new RegExp(`${startBound}${escaped}${endBound}`, 'gi');
        return (text.match(regex) || []).length;
    } catch {
        return 0;
    }
}

/**
 * Find the JD sentence that contains this keyword for context display.
 */
function getContextSentence(jdText: string, keyword: string): string {
    const sentences = jdText.split(/[.\n!?]+/);
    const match = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
    return match ? match.trim().substring(0, 120) : '';
}

/**
 * Deduplicate keywords case-insensitively, prefer the original casing.
 */
function deduplicateKeywords(keywords: string[]): string[] {
    const seen = new Set<string>();
    return keywords.filter(k => {
        const lower = k.toLowerCase().trim();
        if (!lower || lower.length < 2 || seen.has(lower)) return false;
        seen.add(lower);
        return true;
    });
}

/**
 * Fallback keyword extraction directly from JD text using pattern matching.
 * Used ONLY when LLaMA extraction fails or returns nothing.
 * Extracts: tech terms, acronyms, multi-word technical phrases.
 */
function extractKeywordsFromJD(jdText: string): string[] {
    const found = new Set<string>();

    // Known tech patterns (single-pass, broad)
    const techPatterns = [
        /\b(Python|JavaScript|TypeScript|Java|Go|Rust|C\+\+|C#|PHP|Ruby|Swift|Kotlin|Scala)\b/gi,
        /\b(React|Angular|Vue|Next\.js|Nuxt|Svelte|Node\.js|Express|Django|Flask|FastAPI|Spring\s*Boot|Laravel|NestJS|Rails)\b/gi,
        /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|Cassandra|DynamoDB|SQLite|Snowflake|BigQuery)\b/gi,
        /\b(AWS|Azure|GCP|Google Cloud|Docker|Kubernetes|Terraform|Ansible|Jenkins|GitHub\s*Actions|CI\/CD)\b/gi,
        /\b(GraphQL|REST(?:ful)?(?:\s+API)?|gRPC|WebSockets?|OAuth|JWT|OpenID)\b/gi,
        /\b(Machine\s*Learning|Deep\s*Learning|NLP|Computer\s*Vision|PyTorch|TensorFlow|Scikit[- ]Learn|Keras|HuggingFace)\b/gi,
        /\b(Microservices?|Serverless|Event[- ]Driven|System\s*Design|Distributed\s*Systems?)\b/gi,
        /\b(Agile|Scrum|Kanban|TDD|BDD|DevOps|SRE)\b/gi,
        /\b(Linux|Unix|Git|GitHub|GitLab|Jira|Confluence|Figma|Postman|Swagger)\b/gi,
        // Acronyms (2-6 uppercase letters)
        /\b([A-Z]{2,6})\b/g,
    ];

    techPatterns.forEach(pattern => {
        const matches = jdText.match(pattern) || [];
        matches.forEach(m => found.add(m.trim()));
    });

    return deduplicateKeywords(Array.from(found)).slice(0, 60);
}

// ─────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────

function generateRecommendations(
    density: number,
    missingCritical: string[],
    totalWords: number
) {
    const recommendations = [];

    if (density < 2) {
        recommendations.push({
            type: 'CRITICAL',
            id: 'density-low',
            title: 'Low Keyword Density',
            description: `Your keyword density is ${density.toFixed(1)}%. ATS systems favour a 2–5% range.`,
            action: 'Incorporate more technical terms from the Job Description into your bullets naturally.',
            examples: missingCritical.slice(0, 3).map(kw => ({
                before: 'Handled project development tasks',
                after: `Led ${kw} implementation, reducing deployment time by 30%`,
            })),
        });
    } else if (density > 5) {
        recommendations.push({
            type: 'WARNING',
            id: 'density-high',
            title: 'Keyword Stuffing Risk',
            description: `Density is ${density.toFixed(1)}%, above the 5% ceiling. May be flagged as stuffing.`,
            action: 'Reduce repetitive terminology and focus on narrative flow with metrics.',
            examples: [{
                before: 'Expert in Java, Java developer, Java coding',
                after: 'Senior Java Engineer with 5 years building enterprise-scale systems',
            }],
        });
    }

    if (totalWords > 800) {
        recommendations.push({
            type: 'WARNING',
            id: 'length-long',
            title: 'Resume Length Alert',
            description: `Resume is ~${totalWords} words. ATS-friendly target is 400–700 words (1–2 pages).`,
            action: 'Compress your summary to 3–4 lines and prune older experience bullets.',
            examples: [{
                before: 'Detailed 10-year-old responsibility descriptions',
                after: 'Focus on recent high-impact achievements',
            }],
        });
    }

    if (missingCritical.length > 0) {
        recommendations.push({
            type: 'WARNING',
            id: 'missing-keys',
            title: 'Missing High-Priority Keywords',
            description: `${missingCritical.length} high-frequency JD terms are absent from your resume.`,
            action: `Add these to your Skills section or Experience bullets: ${missingCritical.slice(0, 5).join(', ')}`,
            examples: missingCritical.slice(0, 2).map(kw => ({
                before: 'Skilled in various technologies',
                after: `Expertise in ${kw} with production deployment experience`,
            })),
        });
    }

    return recommendations;
}