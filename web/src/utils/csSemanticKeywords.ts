
export const CS_SEMANTIC_KEYWORDS = {
    roles: {
        frontend: [
            'JavaScript Developer', 'Frontend Engineer', 'React Developer', 'UI/UX Engineer',
            'JavaScript ES6+', 'React', 'TypeScript', 'Redux', 'HTML5', 'CSS3',
            'Component-based architecture', 'State management', 'Responsive Design',
            'Cross-browser compatibility', 'Performance optimization',
            'Designed and implemented', 'Developed responsive UI', 'Optimized application performance'
        ],
        backend: [
            'Node.js Developer', 'Backend Engineer', 'API Developer', 'System Architect',
            'JavaScript ES6+', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis',
            'Microservices architecture', 'RESTful APIs', 'Database optimization',
            'Authentication and Authorization', 'Scalable systems',
            'Architected backend services', 'Integrated API endpoints', 'Optimized query performance'
        ],
        fullstack: [
            'Full Stack Developer', 'Software Engineer', 'Full Stack Engineer',
            'JavaScript ES6+', 'React', 'Node.js', 'SQL', 'NoSQL', 'TypeScript',
            'End-to-end applications', 'Full stack development', 'System design',
            'Scalable systems', 'Database design', 'API integration',
            'Built full-stack solutions', 'Deployed scalable applications', 'Implemented secure architectures'
        ],
        ml: [
            'ML Engineer', 'AI Developer', 'Data Scientist', 'Natural Language Processing Engineer',
            'Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy',
            'Neural networks', 'Model training', 'Data preprocessing',
            'Model evaluation', 'Computer vision', 'NLP',
            'Engineered ML models', 'Optimized model performance', 'Processed large-scale datasets'
        ],
        generic: [
            'Software Engineer', 'Systems Programmer', 'Software Architect',
            'Data structures', 'Algorithms', 'Object-oriented programming',
            'System design', 'Code optimization', 'Problem-solving',
            'Distributed systems', 'Concurrency', 'Multithreading',
            'Engineered robust solutions', 'Implemented optimized algorithms', 'Collaborated on system design'
        ]
    },
    core: [
        'Data structures', 'Algorithms', 'System design', 'Software engineering',
        'Object-oriented programming', 'Distributed systems', 'Concurrency', 'Multithreading'
    ],
    actionPhrases: [
        'Designed and implemented',
        'Developed responsive UI',
        'Optimized application performance',
        'Collaborated with cross-functional teams',
        'Integrated API endpoints',
        'Architected scalable solutions',
        'Spearheaded technical initiatives',
        'Refactored legacy codebase'
    ],
    languages: [
        'JavaScript ES6+', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'SQL'
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
