export const FULL_STACK_KEYWORDS: Record<string, string[]> = {
    // Frontend
    frontend: [
        'html', 'css', 'javascript', 'typescript', 'react', 'angular', 'vue', 'svelte',
        'jquery', 'bootstrap', 'tailwind', 'sass', 'scss', 'less', 'webpack', 'vite', 'figma',
        'next.js', 'remix', 'redux', 'context api', 'framer motion'
    ],

    // Backend
    backend: [
        'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'c#', 'asp.net',
        'ruby', 'rails', 'php', 'laravel', 'go', 'rust', 'graphql', 'rest', 'api', 'microservices',
        'serverless', 'fastapi', 'prisma', 'sequelize'
    ],

    // Databases
    databases: [
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'dynamodb', 'oracle', 'sqlite',
        'nosql', 'elasticsearch', 'cassandra'
    ],

    // DevOps & Tools
    devops: [
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'git', 'github', 'gitlab',
        'terraform', 'ansible', 'nginx', 'linux', 'shell', 'bash', 'prometheus', 'grafana', 'datadog'
    ],

    // Strategic & Soft Skills
    strategic: [
        'agile', 'scrum', 'jira', 'trello', 'project management', 'communication', 'collaboration',
        'problem solving', 'system design', 'architecture', 'scalability', 'performance'
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

    return foundKeywords.sort((a, b) => b.confidence - a.confidence);
};

function extractContext(text: string, keyword: string) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return '';

    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + keyword.length + 40);

    return '...' + text.substring(start, end).replace(/\n/g, ' ').trim() + '...';
}
