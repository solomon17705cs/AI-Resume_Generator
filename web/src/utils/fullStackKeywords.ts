export const FULL_STACK_KEYWORDS: Record<string, string[]> = {
    // Role / Title
    roles: [
        'software engineer', 'backend developer', 'frontend developer', 'full stack engineer',
        'data analyst', 'data scientist', 'ai engineer', 'machine learning engineer',
        'product manager', 'project manager', 'systems engineer', 'mechanical engineer',
        'devops engineer', 'cloud architect', 'cybersecurity specialist', 'embedded systems developer'
    ],

    // Technologies & Tools
    tools: [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
        'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring boot',
        'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
        'git', 'github', 'gitlab', 'jira', 'confluence', 'figma'
    ],

    // Methods & Practices
    methods: [
        'agile', 'scrum', 'kanban', 'ci/cd', 'test-driven development', 'tdd', 'unit testing',
        'microservices', 'serverless', 'rest api', 'graphql', 'system design', 'architecture',
        'scalability', 'performance optimization', 'code review', 'pair programming'
    ],

    // Domain / Industry Phrases
    domains: [
        'unmanned systems', 'autonomous systems', 'underwater robotics', 'naval applications',
        'fintech', 'healthcare systems', 'e-commerce', 'enterprise software', 'robotics',
        'sensor integration', 'computer vision', 'signal processing', 'real-time systems',
        'non-destructive evaluation', 'ndt', 'embedded control'
    ],

    // High-Impact Action Fragments
    actions: [
        'designed and implemented', 'developed scalable', 'optimized performance',
        'reduced latency', 'integrated sensors', 'deployed systems', 'automated workflow',
        'led technical', 'architected solution', 'managed lifecycle', 'collaborated with'
    ]
};

export const extractFullStackKeywords = (jobDescription: string) => {
    const normalized = jobDescription.toLowerCase();
    const foundKeywords: { keyword: string; category: string; confidence: number; context: string }[] = [];

    Object.keys(FULL_STACK_KEYWORDS).forEach(category => {
        FULL_STACK_KEYWORDS[category].forEach(keyword => {
            // Use word boundaries but handle special characters like .js or #
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

            if (regex.test(normalized)) {
                foundKeywords.push({
                    keyword,
                    category,
                    confidence: 0.9,
                    context: extractContext(normalized, keyword)
                });
            }
        });
    });

    // Strategy: Ensure we have a mix of categories
    return foundKeywords.sort((a, b) => b.confidence - a.confidence);
};

function extractContext(text: string, keyword: string) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + keyword.length + 40);

    return '...' + text.substring(start, end).replace(/\n/g, ' ').trim() + '...';
}
