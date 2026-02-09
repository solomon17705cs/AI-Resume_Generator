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
    // New fields for enterprise intelligence
    commonCompanies: string[];
    companyTraits: string[];
    optimizationStrategy: {
        bulletStyle: string;
        keywordPlacement: string[];
        sectionPriority: string[];
        dateFormat: string;
        avoidances: string[];
    };
    targetScore: number;
}

export const ATS_PROFILES: Record<string, ATSProfile> = {
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
        description: 'Modern, tech-first ATS. Values structured hiring with impact-oriented bullets and semantic relevance.',
        rules: [
            'Use action-oriented bullets with XYZ formula (Accomplished [X] as measured by [Y], by doing [Z])',
            'Semantic keywords are valued as much as exact matches',
            'Prefers clear, modern typography and hierarchy',
            'Chronological structure is mandatory',
            'Quantified achievements are heavily weighted'
        ],
        commonCompanies: [
            'Google (some teams)', 'Airbnb', 'Stripe', 'Coinbase', 'Shopify',
            'HubSpot', 'Reddit', 'Slack', 'Squarespace', 'DoorDash', 'Robinhood',
            'Notion', 'Figma', 'Canva', 'Series A-D Startups'
        ],
        companyTraits: [
            'Product companies',
            'Engineering-heavy teams',
            'Structured interviews',
            'Metrics-driven hiring',
            'Tech-first culture'
        ],
        optimizationStrategy: {
            bulletStyle: 'Structured bullets with metrics (e.g., "Developed RESTful APIs using Node.js, reducing response latency by 28%")',
            keywordPlacement: ['Experience bullets', 'Summary', 'Projects'],
            sectionPriority: ['Experience', 'Projects', 'Skills', 'Education'],
            dateFormat: 'Month YYYY (e.g., Jan 2023)',
            avoidances: ['Tables', 'Icons', 'Multi-column layouts', 'Graphics', 'Vague bullets without metrics']
        },
        targetScore: 90
    },
    workday: {
        id: 'workday',
        name: 'Workday',
        weights: {
            keywords: 0.50, // Workday is notoriously keyword-heavy
            semantic: 0.15,
            structure: 0.25,
            formatting: 0.10
        },
        detectionPatterns: ['workday.com', 'myworkdayjobs.com', 'wd1.myworkdaysite.com', 'wd5.myworkdaysite.com'],
        description: 'Enterprise-grade ATS for Fortune 500. Extremely keyword-focused with strict parsing rules.',
        rules: [
            'Use EXACT standard headings (PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS)',
            'Absolute zero tolerance for tables, text boxes, or graphics',
            'High keyword density required in Summary and most recent role (3-5%)',
            'Prioritize exact phrase matches from Job Description',
            'Repeat critical skills across Summary, Experience, and Skills sections',
            'Use complete dates (MM/YYYY format)'
        ],
        commonCompanies: [
            'Amazon', 'IBM', 'Deloitte', 'Accenture', 'PwC', 'EY', 'KPMG',
            'Walmart', 'Cisco', 'Intel', 'JP Morgan', 'Bank of America',
            'Unilever', 'Procter & Gamble', 'General Electric', 'Boeing',
            'Lockheed Martin', 'Raytheon', 'Oracle', 'SAP'
        ],
        companyTraits: [
            'Large enterprises (10,000+ employees)',
            'Multi-country hiring',
            'Internal mobility programs',
            'Strong compliance & HR workflows',
            'Fortune 500 companies'
        ],
        optimizationStrategy: {
            bulletStyle: 'Formal language with exact job title matches (e.g., "Senior Software Engineer" not "Sr. SWE")',
            keywordPlacement: ['Summary (high density)', 'Experience (exact matches)', 'Skills (comprehensive list)'],
            sectionPriority: ['Summary', 'Experience', 'Skills', 'Education', 'Certifications'],
            dateFormat: 'MM/YYYY (e.g., 01/2023)',
            avoidances: ['Abbreviations', 'Informal language', 'Tables', 'Graphics', 'Non-standard section names']
        },
        targetScore: 92
    },
    zoho: {
        id: 'zoho',
        name: 'Zoho Recruit',
        weights: {
            keywords: 0.45,
            semantic: 0.25,
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: ['zoho.com/recruit', 'zohorecruit.com'],
        description: 'Flexible ATS for SMBs and staffing agencies. Keyword-heavy with tolerance for varied formatting.',
        rules: [
            'Expand skills section to 20-30 keywords',
            'Include tool & technology variants (e.g., JS, JavaScript, Node.js)',
            'Mild keyword repetition is safe and beneficial',
            'Slightly longer bullet points are acceptable',
            'Focus on breadth of skills over depth'
        ],
        commonCompanies: [
            'Small & mid-size companies (50-500 employees)',
            'Staffing agencies',
            'IT services firms',
            'Startups using Zoho ecosystem',
            'Regional businesses'
        ],
        companyTraits: [
            'Cost-sensitive hiring',
            'High hiring volume',
            'Flexible job descriptions',
            'Quick turnaround times',
            'Less structured processes'
        ],
        optimizationStrategy: {
            bulletStyle: 'Skills-heavy bullets with technology stacks (e.g., "Built full-stack apps using React, Node.js, PostgreSQL, AWS")',
            keywordPlacement: ['Skills (expanded)', 'Experience (tool-focused)', 'Summary (keyword-rich)'],
            sectionPriority: ['Skills', 'Experience', 'Education', 'Certifications'],
            dateFormat: 'Flexible (Month YYYY or MM/YYYY)',
            avoidances: ['Overly minimal resumes', 'Missing skills section', 'Vague technology mentions']
        },
        targetScore: 88
    },
    darwinbox: {
        id: 'darwinbox',
        name: 'Darwinbox',
        weights: {
            keywords: 0.40,
            semantic: 0.30,
            structure: 0.20,
            formatting: 0.10
        },
        detectionPatterns: ['darwinbox.com', 'darwinbox.io'],
        description: 'Asia-focused enterprise ATS. Values competency mapping, ownership language, and performance metrics.',
        rules: [
            'Use leadership verbs: "Owned", "Led", "Improved", "Drove", "Spearheaded"',
            'Map skills to outcomes (e.g., "Python → 30% faster data processing")',
            'Highlight performance metrics and growth trajectory',
            'Include team size and scope of responsibility',
            'Emphasize cross-functional collaboration'
        ],
        commonCompanies: [
            'Tata Group companies', 'Reliance subsidiaries', 'Infosys (some units)',
            'Swiggy', 'Zomato', 'Flipkart', 'Ola', 'Paytm', 'Asian conglomerates',
            'UAE enterprises', 'Southeast Asian companies', 'Indian MNCs'
        ],
        companyTraits: [
            'India / Asia-focused hiring',
            'Talent lifecycle management',
            'Performance & engagement tracking',
            'Large teams (1,000+ employees)',
            'Growth-oriented culture'
        ],
        optimizationStrategy: {
            bulletStyle: 'Ownership-focused with impact (e.g., "Owned backend architecture for 5M+ users, improving uptime from 95% to 99.9%")',
            keywordPlacement: ['Experience (ownership verbs)', 'Summary (leadership focus)', 'Projects (scale metrics)'],
            sectionPriority: ['Experience', 'Skills', 'Projects', 'Education'],
            dateFormat: 'Month YYYY (e.g., Jan 2023)',
            avoidances: ['Passive voice', 'Individual contributor framing only', 'Missing team/scope context']
        },
        targetScore: 89
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
        description: 'Next-gen platform focused on developer talent. High semantic focus with emphasis on clarity and brevity.',
        rules: [
            'Clarity and brevity are prioritized (max 25 words per bullet)',
            'Direct alignment with "Must Have" technical stack',
            'Values Project sections for technical roles',
            'Modern, clean formatting preferred',
            'GitHub/portfolio links are weighted'
        ],
        commonCompanies: [
            'Netflix', 'Uber', 'Lyft', 'Spotify', 'Twitch', 'Discord',
            'Atlassian', 'Dropbox', 'Asana', 'Zoom', 'Developer-focused startups'
        ],
        companyTraits: [
            'Developer-first companies',
            'Modern tech stacks',
            'Collaborative hiring',
            'Portfolio-driven evaluation',
            'Fast-paced environments'
        ],
        optimizationStrategy: {
            bulletStyle: 'Concise, technical bullets (e.g., "Built real-time chat using WebSockets, Redis pub/sub, handling 10K concurrent users")',
            keywordPlacement: ['Projects (technical depth)', 'Experience (concise)', 'Skills (must-haves only)'],
            sectionPriority: ['Projects', 'Experience', 'Skills', 'Education'],
            dateFormat: 'Month YYYY (e.g., Jan 2023)',
            avoidances: ['Verbose bullets', 'Non-technical fluff', 'Missing GitHub links', 'Outdated technologies']
        },
        targetScore: 91
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
        description: 'Standard ATS parsing logic. Balanced approach for general applications.',
        rules: [
            'Standard ATS-Safe structure (single column)',
            'Balanced keyword distribution across all sections',
            'Clear section headers',
            'Chronological format',
            'PDF-friendly formatting'
        ],
        commonCompanies: [
            'Companies without identifiable ATS',
            'Small businesses',
            'Custom career portals',
            'Direct applications'
        ],
        companyTraits: [
            'Varied company sizes',
            'Mixed industries',
            'Standard hiring processes'
        ],
        optimizationStrategy: {
            bulletStyle: 'Balanced bullets with action verbs and results (e.g., "Managed team of 5 engineers, delivering 3 major features on time")',
            keywordPlacement: ['All sections (balanced)', 'Summary', 'Experience', 'Skills'],
            sectionPriority: ['Experience', 'Skills', 'Education', 'Projects'],
            dateFormat: 'Month YYYY (e.g., Jan 2023)',
            avoidances: ['Tables', 'Graphics', 'Unusual fonts', 'Multi-column layouts']
        },
        targetScore: 85
    }
};

// Enhanced detection with multi-signal inference
export interface DetectionSignals {
    url?: string;
    companyName?: string;
    companySize?: number;
    region?: string;
    industry?: string;
}

export interface DetectionResult {
    profile: ATSProfile;
    confidence: 'High' | 'Medium' | 'Low';
    detectionMethod: string;
    reasoning: string;
}

export function detectATSWithConfidence(signals: DetectionSignals): DetectionResult {
    const { url, companyName, companySize, region, industry } = signals;

    // Signal 1: Direct URL pattern match (Highest confidence)
    if (url) {
        for (const profile of Object.values(ATS_PROFILES)) {
            if (profile.detectionPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
                return {
                    profile,
                    confidence: 'High',
                    detectionMethod: 'Job Portal URL',
                    reasoning: `Detected ${profile.name} from job posting URL pattern`
                };
            }
        }
    }

    // Signal 2: Company name match (High confidence)
    if (companyName) {
        for (const profile of Object.values(ATS_PROFILES)) {
            const companyMatch = profile.commonCompanies.some(company =>
                companyName.toLowerCase().includes(company.toLowerCase()) ||
                company.toLowerCase().includes(companyName.toLowerCase())
            );
            if (companyMatch) {
                return {
                    profile,
                    confidence: 'High',
                    detectionMethod: 'Company Database',
                    reasoning: `${companyName} is known to use ${profile.name} based on industry data`
                };
            }
        }
    }

    // Signal 3: Company size inference (Medium confidence)
    if (companySize !== undefined) {
        if (companySize >= 10000) {
            return {
                profile: ATS_PROFILES.workday,
                confidence: 'Medium',
                detectionMethod: 'Company Size Analysis',
                reasoning: `Large enterprises (${companySize.toLocaleString()}+ employees) typically use Workday`
            };
        } else if (companySize >= 1000 && region?.toLowerCase().includes('india')) {
            return {
                profile: ATS_PROFILES.darwinbox,
                confidence: 'Medium',
                detectionMethod: 'Regional Analysis',
                reasoning: `Indian companies with ${companySize.toLocaleString()}+ employees often use Darwinbox`
            };
        } else if (companySize >= 100 && companySize < 1000 && industry?.toLowerCase().includes('tech')) {
            return {
                profile: ATS_PROFILES.greenhouse,
                confidence: 'Medium',
                detectionMethod: 'Industry Analysis',
                reasoning: `Tech companies (${companySize} employees) commonly use Greenhouse`
            };
        } else if (companySize < 500) {
            return {
                profile: ATS_PROFILES.zoho,
                confidence: 'Medium',
                detectionMethod: 'Company Size Analysis',
                reasoning: `SMBs (${companySize} employees) often use cost-effective solutions like Zoho Recruit`
            };
        }
    }

    // Signal 4: Regional inference (Low-Medium confidence)
    if (region) {
        const regionLower = region.toLowerCase();
        if (regionLower.includes('india') || regionLower.includes('asia') || regionLower.includes('uae')) {
            return {
                profile: ATS_PROFILES.darwinbox,
                confidence: 'Low',
                detectionMethod: 'Regional Inference',
                reasoning: `Companies in ${region} increasingly adopt Darwinbox for talent management`
            };
        }
    }

    // Fallback: Generic ATS
    return {
        profile: ATS_PROFILES.generic,
        confidence: 'Low',
        detectionMethod: 'Default Fallback',
        reasoning: 'Unable to determine specific ATS. Using balanced optimization strategy.'
    };
}

// Legacy function for backward compatibility
export function detectATS(url: string): ATSProfile {
    return detectATSWithConfidence({ url }).profile;
}
