import { ResumeData, Experience } from '../types/resume';
import { detectRoleCategory, CS_SEMANTIC_KEYWORDS } from './csSemanticKeywords';

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

    // First check for specialized industries
    if (jd.includes('defence') || jd.includes('naval') || jd.includes('military') || jd.includes('unmanned')) return 'defence';
    if (jd.includes('finance') || jd.includes('trading') || jd.includes('quant') || jd.includes('banking')) return 'finance';

    // Then check for role-based categories
    const role = detectRoleCategory(jobDescription);
    if (role !== 'generic') return role;

    if (jd.includes('software') || jd.includes('developer') || jd.includes('engineer') || jd.includes('tech')) return 'tech';
    return 'generic';
};

// 3. Semantic Relevance Fixer (Rule-based)
export const applySemanticRules = (text: string, industry: string): string => {
    const rules: Record<string, [RegExp, string][]> = {
        defence: [
            [/designing and developing/gi, 'engineering defence-grade systems for'],
            [/digital systems/gi, 'unmanned systems and UUVs'],
            [/worked on/gi, 'spearheaded development of'],
            [/responsible for/gi, 'orchestrated mission-critical']
        ],
        tech: [
            [/worked on/gi, 'architected and deployed'],
            [/handled/gi, 'engineered scalable solutions for'],
            [/fast/gi, 'performant and low-latency']
        ],
        frontend: [
            [/worked on UI/gi, 'Engineered component-based UI architectures'],
            [/made it responsive/gi, 'Optimized for cross-platform responsive design'],
            [/fixed bugs/gi, 'Refactored codebase to improve frontend performance']
        ],
        backend: [
            [/wrote APIs/gi, 'Engineered high-throughput RESTful APIs'],
            [/managed database/gi, 'Optimized database design and query performance'],
            [/handled security/gi, 'Implemented robust authentication and authorization']
        ],
        ml: [
            [/trained models/gi, 'Optimized model training and hyperparameter tuning'],
            [/cleaned data/gi, 'Performed extensive data preprocessing for neural networks'],
            [/used AI/gi, 'Architected deep learning solutions for complex problem solving']
        ]
    };

    const industryRules = rules[industry] || rules.tech;
    let optimizedText = text;
    industryRules.forEach(([regex, replacement]) => {
        optimizedText = optimizedText.replace(regex, replacement);
    });
    return optimizedText;
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
