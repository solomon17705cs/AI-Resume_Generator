import { normalizeJobDescription } from './textNormalization';
import { extractFullStackKeywords } from './fullStackKeywords';

export const analyzeKeywordDensity = (resumeText: string, jobDescription: string, customKeywords?: string[]) => {
    // 1. Normalize JD to remove noise and fix artifacts
    const normalizedJD = normalizeJobDescription(jobDescription);
    const resumeTextNormalized = resumeText.toLowerCase();

    // 2. Perform Context-Aware Extraction
    const extracted = customKeywords
        ? customKeywords.map(k => ({ keyword: k, category: 'technical', confidence: 1, context: '' }))
        : extractFullStackKeywords(normalizedJD);
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
        recommendations: generateRecommendations(density, missingCritical, totalResumeWords)
    };
};

function generateRecommendations(density: number, missingCritical: string[], totalWords: number) {
    const recommendations = [];

    // Density Optimization (Target: 2-5%)
    if (density < 2) {
        recommendations.push({
            type: "CRITICAL",
            id: "density-low",
            title: "Low Keyword Density",
            description: `Your keyword density is ${density.toFixed(1)}%. ATS algorithms typically favor a 2-5% range for relevance.`,
            action: "Incorporate more technical terms from the Job Description into your bullets naturally.",
            examples: missingCritical.slice(0, 3).map(kw => ({
                before: "Handled project development",
                after: `Led ${kw} implementation and maintenance, increasing efficiency by 15%`
            }))
        });
    } else if (density > 5) {
        recommendations.push({
            type: "WARNING",
            id: "density-high",
            title: "Keyword Stuffing Risk",
            description: `Your density is ${density.toFixed(1)}%, which exceeds the 5% optimization ceiling. This may be flagged as stuffing.`,
            action: "Reduce repetitive terminology and focus on narrative flow with metrics.",
            examples: [{
                before: "Expert in Java, Java developer, Java coding",
                after: "Senior Java Developer with 5 years of experience in enterprise systems"
            }]
        });
    }

    // Length Optimization
    if (totalWords > 800) {
        recommendations.push({
            type: "WARNING",
            id: "length-long",
            title: "Resume Length Alert",
            description: `Your resume is approximately ${totalWords} words. Most modern ATS environments prefer 1-2 pages (400-700 words).`,
            action: "Compress your executive summary to 3-4 lines and prune older experience bullets.",
            examples: [{
                before: "Detailed description of responsibilities from 10 years ago...",
                after: "Focus on high-level achievements and recent impact."
            }]
        });
    }

    // Missing Strategic Keywords
    if (missingCritical.length > 0) {
        recommendations.push({
            type: "WARNING",
            id: "missing-keys",
            title: "Missing Strategic Keywords",
            description: "Some high-relevance terms found in the job description are missing from your profile.",
            action: "Add these specific skills to your Skills section or Experience bullets:",
            examples: missingCritical.slice(0, 2).map(kw => ({
                before: "Skilled in various technologies",
                after: `Expertise in ${kw} and modular system design`
            }))
        });
    }

    return recommendations;
}
