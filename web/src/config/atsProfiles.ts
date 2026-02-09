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
            keywords: 0.50, // Workday is notoriously keyword-heavy
            semantic: 0.15,
            structure: 0.25,
            formatting: 0.10
        },
        detectionPatterns: ['workday.com', 'myworkdayjobs.com'],
        description: 'Legacy, high-volume system. Extremely picky with section headers and keyword placement.',
        rules: [
            'Use standard headings (PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS)',
            'Absolute zero tolerance for tables or text boxes',
            'High keyword density required in the Summary and most recent role',
            'Prioritize exact phrase matches from the Job Description'
        ]
    },
    greenhouse: {
        id: 'greenhouse',
        name: 'Greenhouse',
        weights: {
            keywords: 0.35,
            semantic: 0.35, // More modern, better at synonyms
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: ['greenhouse.io', 'boards.greenhouse.io'],
        description: 'Modern, balanced system. Values impact-oriented bullets and semantic relevance.',
        rules: [
            'Use action-oriented Bullets (XYZ formula is highly effective)',
            'Semantic keywords are valued as much as exact matches',
            'Prefers clear, modern typography and hierarchy'
        ]
    },
    lever: {
        id: 'lever',
        name: 'Lever',
        weights: {
            keywords: 0.30,
            semantic: 0.40,
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: ['lever.co', 'jobs.lever.co'],
        description: 'Next-gen platform focused on developer talent. High semantic focus.',
        rules: [
            'Clarity and brevity are prioritized',
            'Direct alignment with "Must Have" technical stack',
            'Values Project sections for technical roles'
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
        description: 'Standard parsing logic. Balanced approach for general applications.',
        rules: [
            'Standard ATS-Safe structure (single column)',
            'Balanced keyword distribution across all sections'
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
