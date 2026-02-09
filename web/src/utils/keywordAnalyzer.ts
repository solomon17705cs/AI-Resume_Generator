import { normalizeJobDescription } from './textNormalization';
import { extractFullStackKeywords } from './fullStackKeywords';

export const analyzeKeywordDensity = (resumeText: string, jobDescription: string) => {
    // 1. Normalize JD to remove noise and fix artifacts
    const normalizedJD = normalizeJobDescription(jobDescription);
    const resumeTextNormalized = resumeText.toLowerCase();

    // 2. Perform Context-Aware Extraction
    const extracted = extractFullStackKeywords(normalizedJD);
    const sortedKeywords = Array.from(new Set(extracted.map(e => e.keyword)));

    // 3. Count occurrences in resume
    const keywordCounts: Record<string, number> = {};
    let totalKeywordOccurrences = 0;

    sortedKeywords.forEach(keyword => {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        const count = (resumeTextNormalized.match(regex) || []).length;
        keywordCounts[keyword] = count;
        totalKeywordOccurrences += count;
    });

    const getWords = (text: string) => text.toLowerCase().match(/\b(\w+)\b/g) || [];
    const resumeWords = getWords(resumeText).filter(w => w.length > 2);
    const totalResumeWords = resumeWords.length;

    const density = totalResumeWords > 0 ? (totalKeywordOccurrences / totalResumeWords) * 100 : 0;

    // 4. Critical Missing Keywords
    const missingCritical = sortedKeywords.filter(kw => keywordCounts[kw] === 0).slice(0, 10);

    return {
        density: Math.min(density, 100),
        keywordCounts,
        totalWords: totalResumeWords,
        missingCritical,
        extractedMetadata: extracted,
        recommendations: generateRecommendations(density, missingCritical)
    };
};

function generateRecommendations(density: number, missingCritical: string[]) {
    const recommendations = [];

    if (density < 2) {
        recommendations.push({
            type: "CRITICAL",
            title: "Low Keyword Density",
            description: "Your resume lacks essential keywords from the job description. ATS filters often discard low-density resumes.",
            action: "Incorporate these missing technical terms naturally into your bullet points.",
            examples: missingCritical.slice(0, 3).map(kw => ({
                before: "Handled project development",
                after: `Led ${kw} implementation and maintenance, increasing efficiency by 15%`
            }))
        });
    }

    if (missingCritical.length > 0) {
        recommendations.push({
            type: "WARNING",
            title: "Missing Strategic Keywords",
            description: "Some high-relevance terms found in the job description are missing from your profile.",
            action: "Add these specific skills to your Skills section or Experience bullets:",
            examples: missingCritical.slice(0, 2).map(kw => ({
                before: "Skilled in various technologies",
                after: `Expertise in ${kw} and modular system design`
            }))
        });
    }

    if (density > 5) {
        recommendations.push({
            type: "WARNING",
            title: "Keyword Stuffing Risk",
            description: "Your keyword density is unusually high, which might be flagged as 'stuffing' by modern parsers.",
            action: "Try to make the content more natural by reducing repetitive phrasing.",
            examples: [{
                before: "Expert in Java, Java developer, Java coding",
                after: "Senior Java Developer with 5 years of experience in enterprise systems"
            }]
        });
    }

    return recommendations;
}
