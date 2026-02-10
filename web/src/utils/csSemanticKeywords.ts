
export const CS_SEMANTIC_KEYWORDS = {
    roles: {
        frontend: [
            'React',
            'JavaScript',
            'TypeScript',
            'UI components',
            'state management',
            'performance optimization',
            'web accessibility',
            'responsive design',
            'component-based architecture',
            'frontend performance'
        ],
        backend: [
            'REST APIs',
            'microservices',
            'database optimization',
            'authentication',
            'server-side logic',
            'distributed systems',
            'SQL',
            'NoSQL',
            'API integration',
            'backend development',
            'database design',
            'scalable systems'
        ],
        fullstack: [
            'full stack development',
            'end-to-end applications',
            'RESTful APIs',
            'database design',
            'frontend performance',
            'system design',
            'scalable systems',
            'authentication and authorization'
        ],
        ml: [
            'machine learning',
            'deep learning',
            'model training',
            'data preprocessing',
            'neural networks',
            'model evaluation',
            'AI engineering',
            'computer vision',
            'natural language processing'
        ],
        generic: [
            'software engineering',
            'data structures',
            'algorithms',
            'object-oriented programming',
            'system design',
            'problem-solving',
            'code optimization',
            'scalable systems',
            'API design',
            'database management',
            'distributed systems',
            'concurrency',
            'multithreading'
        ]
    },
    core: [
        'data structures',
        'algorithms',
        'object-oriented programming',
        'time and space complexity',
        'problem solving',
        'software engineering',
        'system design',
        'distributed systems',
        'concurrency',
        'multithreading'
    ],
    verbs: [
        'designed',
        'implemented',
        'optimized',
        'developed',
        'refactored',
        'debugged',
        'integrated',
        'deployed'
    ],
    languages: [
        'Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'SQL'
    ]
};

export const detectRoleCategory = (jobDescription: string): keyof typeof CS_SEMANTIC_KEYWORDS.roles => {
    const jd = jobDescription.toLowerCase();

    // Weighted scoring for better classification
    const weights = {
        frontend: (jd.match(/frontend|react|angular|vue|css|html|ui|ux|web|accessibility|responsive/g) || []).length * 1.5,
        backend: (jd.match(/backend|node|express|django|flask|spring|sql|api|database|server|microservices|distributed/g) || []).length * 1.5,
        ml: (jd.match(/ml|ai|machine learning|deep learning|neural|data science|pytorch|tensorflow|computer vision|nlp/g) || []).length * 2.0,
        fullstack: (jd.match(/full stack|fullstack/g) || []).length * 3.0
    };

    const maxScore = Math.max(weights.frontend, weights.backend, weights.ml, weights.fullstack);

    if (maxScore === 0) return 'generic';
    if (weights.fullstack === maxScore || (weights.frontend > 2 && weights.backend > 2)) return 'fullstack';
    if (weights.ml === maxScore) return 'ml';
    if (weights.frontend === maxScore) return 'frontend';
    if (weights.backend === maxScore) return 'backend';

    return 'generic';
};

export const getSemanticKeywordsForRole = (role: keyof typeof CS_SEMANTIC_KEYWORDS.roles, userSkills: string[] = []) => {
    const roleKeywords = CS_SEMANTIC_KEYWORDS.roles[role];
    const coreKeywords = CS_SEMANTIC_KEYWORDS.core;
    const languages = CS_SEMANTIC_KEYWORDS.languages;

    const userSkillsLower = userSkills.map(s => s.toLowerCase());

    // Filter Logic (Step 4 of Blueprint): 
    // Final keywords = JD keywords ∩ User skills ∪ Closely related terms
    // We only include semantic keywords that have SOME thematic overlap with user's real skills.

    const validatedKeywords = roleKeywords.filter(kw => {
        const kwLower = kw.toLowerCase();
        // Check if keyword or any word in it is in user skills
        return userSkillsLower.some(skill =>
            kwLower.includes(skill) || skill.includes(kwLower) ||
            // Handle common associations
            (kwLower.includes('api') && (skill.includes('node') || skill.includes('python') || skill.includes('java'))) ||
            (kwLower.includes('react') && skill.includes('javascript')) ||
            (kwLower.includes('database') && (skill.includes('sql') || skill.includes('mongo') || skill.includes('postgres')))
        );
    });

    // Languages: Only include if in userSkills
    const validatedLanguages = languages.filter(lang =>
        userSkillsLower.some(skill => skill.includes(lang.toLowerCase()))
    );

    // Core CS concepts are generally safe to include for any CS role if they have engineering skills
    const coreCount = userSkills.length > 5 ? 4 : 2;
    const validatedCore = coreKeywords.slice(0, coreCount);

    const combined = [...validatedKeywords, ...validatedLanguages, ...validatedCore];

    // Fallback to generic CS if no overlap found (to ensure some keywords)
    if (combined.length < 5) {
        return [...CS_SEMANTIC_KEYWORDS.roles.generic.slice(0, 5), ...validatedLanguages];
    }

    return Array.from(new Set(combined)).slice(0, 15);
};
