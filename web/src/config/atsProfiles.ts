export interface ATSProfile {
    id: string;
    name: string;
    weights: {
        keywords: number;
        semantic: number;
        structure: number;
        formatting: number;
    };
    detectionPatterns: string[];
    description: string;
    rules: string[];
}

export const ATS_PROFILES: Record<string, ATSProfile> = {
    workday: {
        id: 'workday',
        name: 'Workday',
        weights: {
            keywords: 0.50,
            semantic: 0.20,
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: ['workday.com', 'myworkdayjobs.com'],
        description: 'Traditional, keyword-heavy system. Favors strict section headers and explicit skill mentions.',
        rules: [
            'Use standard headings (Experience, Education, Skills)',
            'Avoid multi-column layouts',
            'Maximize keyword density for top 10 JD skills',
            'No tables or complex graphics'
        ]
    },
    greenhouse: {
        id: 'greenhouse',
        name: 'Greenhouse',
        weights: {
            keywords: 0.35,
            semantic: 0.40,
            structure: 0.15,
            formatting: 0.10
        },
        detectionPatterns: ['greenhouse.io', 'boards.greenhouse.io'],
        description: 'Modern, balanced system. Better at semantic understanding but still relies on structured experience data.',
        rules: [
            'Focus on impact-driven metrics (XYZ formula)',
            'Clean, readable typography',
            'Semantic relevance is more important than raw density'
        ]
    },
    lever: {
        id: 'lever',
        name: 'Lever',
        weights: {
            keywords: 0.30,
            semantic: 0.45,
            structure: 0.15,
            formatting: 0.10
        },
        detectionPatterns: ['lever.co', 'jobs.lever.co'],
        description: 'Next-gen ATS with high semantic focus. Values clarity and direct alignment with role responsibilities.',
        rules: [
            'Avoid filler words',
            'Direct alignment with "Must Have" skills',
            'Simple formatting works best for their parser'
        ]
    },
    generic: {
        id: 'generic',
        name: 'Generic ATS',
        weights: {
            keywords: 0.40,
            semantic: 0.30,
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: [],
        description: 'Standard parsing logic used by smaller platforms. Balanced approach.',
        rules: [
            'Standard PDF structure',
            'Keyword-balanced content'
        ]
    }
};

export function detectATS(url: string): ATSProfile {
    if (!url) return ATS_PROFILES.generic;

    for (const profile of Object.values(ATS_PROFILES)) {
        if (profile.detectionPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
            return profile;
        }
    }

    return ATS_PROFILES.generic;
}
