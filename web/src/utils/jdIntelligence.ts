import { KEYWORD_DICTIONARY, INDUSTRY_CONTEXT } from '@/config/keywordDictionary';

export interface JDIntelligence {
    role: string;
    domain: string;
    stack: {
        languages: string[];
        frameworks: string[];
        databases: string[];
        cloud: string[];
        tools: string[];
        concepts: string[];
        soft_skills?: string[];
        action_verbs?: string[];
        qualifications?: string[];
        domain_keywords?: string[];
    };
    seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
    industry: string;
    expandedKeywords: string[];
}

export function performControlledExpansion(techStack: string[], domain: string): string[] {
    const expansions: string[] = [];
    const domainData = KEYWORD_DICTIONARY[domain as keyof typeof KEYWORD_DICTIONARY];

    if (!domainData) return techStack;

    techStack.forEach(tech => {
        const techMatch = Object.keys(domainData.semanticExpansion).find(k =>
            tech.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tech.toLowerCase())
        );

        if (techMatch) {
            expansions.push(...domainData.semanticExpansion[techMatch]);
        }
    });

    return Array.from(new Set([...techStack, ...expansions]));
}

export function getIndustryInjection(industry: string): string[] {
    return INDUSTRY_CONTEXT[industry] || [];
}

export function classifySeniority(text: string): JDIntelligence['seniority'] {
    const low = text.toLowerCase();
    if (low.includes('principal') || low.includes('architect')) return 'Principal';
    if (low.includes('lead') || low.includes('manager') || low.includes('staff')) return 'Lead';
    if (low.includes('senior') || low.includes('sr.') || low.includes('5+') || low.includes('8+')) return 'Senior';
    if (low.includes('junior') || low.includes('jr.') || low.includes('entry') || low.includes('grad')) return 'Junior';
    return 'Mid';
}
