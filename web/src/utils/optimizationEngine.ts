import { ResumeData, Experience } from '../types/resume';

// 1. Keyword Gap Analysis & Prioritization
export const calculateKeywordPriority = (missing: string[], jobDescription: string) => {
    const jdLower = jobDescription.toLowerCase();
    return missing.map(kw => {
        const count = (jdLower.match(new RegExp(`\\b${kw.toLowerCase()}\\b`, 'g')) || []).length;
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (count >= 12) priority = 'high';
        else if (count >= 5) priority = 'medium';
        return { text: kw, priority, frequency: count };
    });
};

// 2. Section Compliance Templates
export const SECTION_TEMPLATES: Record<string, string[]> = {
    defence: [
        'PROFESSIONAL SUMMARY',
        'TECHNICAL SKILLS',
        'PROFESSIONAL EXPERIENCE',
        'TECHNICAL PROJECTS',
        'EDUCATION'
    ],
    tech: [
        'PROFESSIONAL SUMMARY',
        'TECHNICAL SKILLS',
        'PROFESSIONAL EXPERIENCE',
        'TECHNICAL PROJECTS',
        'EDUCATION'
    ],
    finance: [
        'PROFESSIONAL SUMMARY',
        'PROFESSIONAL EXPERIENCE',
        'TECHNICAL SKILLS',
        'PROJECTS',
        'EDUCATION'
    ],
    generic: [
        'PROFESSIONAL SUMMARY',
        'PROFESSIONAL EXPERIENCE',
        'SKILLS',
        'EDUCATION'
    ]
};

export const detectIndustry = (jobDescription: string): string => {
    const jd = jobDescription.toLowerCase();
    if (jd.includes('defence') || jd.includes('naval') || jd.includes('military') || jd.includes('unmanned')) return 'defence';
    if (jd.includes('finance') || jd.includes('trading') || jd.includes('quant') || jd.includes('banking')) return 'finance';
    if (jd.includes('software') || jd.includes('developer') || jd.includes('engineer') || jd.includes('tech')) return 'tech';
    return 'generic';
};

// 3. Semantic Relevance Fixer (Rule-based)
export const applySemanticRules = (text: string, industry: string): string => {
    if (industry === 'defence') {
        return text
            .replace(/designing and developing/gi, 'engineering defence-grade systems for')
            .replace(/digital systems/gi, 'unmanned systems and UUVs')
            .replace(/worked on/gi, 'spearheaded development of')
            .replace(/responsible for/gi, 'orchestrated mission-critical');
    }
    if (industry === 'tech') {
        return text
            .replace(/worked on/gi, 'architected and deployed')
            .replace(/handled/gi, 'engineered scalable solutions for')
            .replace(/fast/gi, 'performant and low-latency');
    }
    return text;
};

// 4. Content Compression Engine
export const compressContent = (text: string): string => {
    return text
        .replace(/\bdesigning and developing\b/gi, 'developing')
        .replace(/\bexperienced in\b/gi, '')
        .replace(/\bleveraging expertise in\b/gi, 'using')
        .replace(/\bserving as a\b/gi, 'as a')
        .replace(/\bwith a strong focus on\b/gi, 'focusing on')
        .replace(/\bin order to\b/gi, 'to')
        .replace(/\baided in the development of\b/gi, 'developed')
        .replace(/\bhighly skilled in\b/gi, 'expert in');
};

// 5. Readability Optimizer (Simplification)
export const calculateFleschScore = (text: string): number => {
    const words = text.split(/\s+/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const syllables = countSyllablesInText(text);

    if (words === 0) return 0;

    // Flesch Reading Ease Formula
    // 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
};

function countSyllablesInText(text: string): number {
    return text.split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0);
}

function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
}

export const simplifySentences = (text: string): string => {
    // Basic simplification rules
    return text
        .replace(/utilize|utilizing/gi, 'use')
        .replace(/facilitate|facilitating/gi, 'help')
        .replace(/implement|implementing/gi, 'build')
        .replace(/subsequent to/gi, 'after')
        .replace(/commence/gi, 'start');
};
