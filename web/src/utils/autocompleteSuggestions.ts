// Common job titles for autocomplete
export const JOB_TITLES = [
    'Software Engineer',
    'Senior Software Engineer',
    'Lead Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Product Manager',
    'Project Manager',
    'Systems Architect',
    'Technical Lead',
    'Solutions Architect',
    'QA Engineer',
    'Cloud Architect',
    'Database Administrator',
    'Network Engineer',
    'Security Engineer',
    'Site Reliability Engineer',
];

// Common companies for autocomplete
export const COMPANIES = [
    'Google',
    'Microsoft',
    'Amazon',
    'Meta',
    'Apple',
    'Netflix',
    'Tesla',
    'Uber',
    'Airbnb',
    'Salesforce',
    'Adobe',
    'Stripe',
    'Figma',
    'Notion',
    'Discord',
    'Slack',
    'Zoom',
    'Dropbox',
    'Spotify',
    'LinkedIn',
    'Twitter',
    'GitHub',
    'GitLab',
    'Atlassian',
    'HashiCorp',
    'JetBrains',
    'Datadog',
    'PagerDuty',
    'Sentry',
];

// Common programming skills
export const PROGRAMMING_SKILLS = [
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'C#',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'R',
    'SQL',
    'HTML',
    'CSS',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express.js',
    'Django',
    'Flask',
    'FastAPI',
    'Spring Boot',
    'ASP.NET',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Elasticsearch',
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'Git',
    'CI/CD',
];

// Common achievement verbs
export const ACHIEVEMENT_VERBS = [
    'Accomplished',
    'Achieved',
    'Accelerated',
    'Automated',
    'Built',
    'Calculated',
    'Completed',
    'Decreased',
    'Designed',
    'Detected',
    'Developed',
    'Diagnosed',
    'Discovered',
    'Documented',
    'Doubled',
    'Enabled',
    'Enhanced',
    'Established',
    'Executed',
    'Expanded',
    'Facilitated',
    'Generated',
    'Implemented',
    'Improved',
    'Increased',
    'Integrated',
    'Investigated',
    'Launched',
    'Led',
    'Optimized',
    'Orchestrated',
    'Pioneered',
    'Produced',
    'Reduced',
    'Refactored',
    'Redesigned',
    'Restored',
    'Scaled',
    'Simplified',
    'Solved',
    'Streamlined',
    'Strengthened',
    'Tripled',
];

// Metrics/measurements for bullets
export const METRICS = [
    'performance',
    'latency',
    'response time',
    'throughput',
    'availability',
    'uptime',
    'efficiency',
    'load time',
    'memory usage',
    'CPU usage',
    'conversion rate',
    'user engagement',
    'retention rate',
    'revenue',
    'cost',
    'processing time',
    'accuracy',
    'precision',
    'recall',
    'F1 score',
];

export const getAutocompleteSuggestions = (
    input: string,
    category: 'jobTitle' | 'company' | 'skill' | 'verb' | 'metric' | 'all' = 'all'
): string[] => {
    const normalizedInput = input.toLowerCase().trim();
    if (normalizedInput.length === 0) return [];

    let suggestions: string[] = [];

    if (category === 'jobTitle' || category === 'all') {
        suggestions = [
            ...suggestions,
            ...JOB_TITLES.filter(title =>
                title.toLowerCase().includes(normalizedInput)
            ),
        ];
    }

    if (category === 'company' || category === 'all') {
        suggestions = [
            ...suggestions,
            ...COMPANIES.filter(company =>
                company.toLowerCase().includes(normalizedInput)
            ),
        ];
    }

    if (category === 'skill' || category === 'all') {
        suggestions = [
            ...suggestions,
            ...PROGRAMMING_SKILLS.filter(skill =>
                skill.toLowerCase().includes(normalizedInput)
            ),
        ];
    }

    if (category === 'verb' || category === 'all') {
        suggestions = [
            ...suggestions,
            ...ACHIEVEMENT_VERBS.filter(verb =>
                verb.toLowerCase().includes(normalizedInput)
            ),
        ];
    }

    if (category === 'metric' || category === 'all') {
        suggestions = [
            ...suggestions,
            ...METRICS.filter(metric =>
                metric.toLowerCase().includes(normalizedInput)
            ),
        ];
    }

    // Remove duplicates and return only first 8 suggestions
    return Array.from(new Set(suggestions)).slice(0, 8);
};
