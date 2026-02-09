export interface ResumeData {
    id: string;
    title: string;
    lastModified: string;
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    projects: Project[];
    skills: SkillCategory[];
    education: Education[];
    metadata: {
        targetRole?: string;
        atsScore?: number;
    };
}

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link: string;
    bullets: string[];
}

export interface SkillCategory {
    id: string;
    name: string;
    skills: string[];
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    location: string;
    graduationDate: string;
}

export interface ATSAnalysis {
    overallScore: number;
    sectionScores: {
        experience: number;
        skills: number;
        impact: number;
    };
    keywords: {
        found: string[];
        missing: string[];
    };
    reasoning: string;
    atsType?: string;
    atsProfile?: any;
    keywordMetadata?: {
        keyword: string;
        category: string;
        confidence: number;
        context: string;
    }[];
    suggestions: {
        id: string;
        type: 'warning' | 'info' | 'critical' | 'WARNING' | 'INFO' | 'CRITICAL';
        message?: string;
        title?: string;
        description?: string;
        action?: string;
        examples?: { before: string; after: string }[];
        fix?: string;
    }[];
    forensics?: {
        semantic_overlap: number;
        keyword_density: number;
        structural_integrity: number;
        keyword_match?: number;
        semantic_relevance?: number;
        section_compliance?: number;
        clarity_recency?: number;
    };
}
export interface RecommendationRequest {
    id: string;
    studentName: string;
    studentEmail: string;
    purpose: 'Internship' | 'Job';
    company: string;
    message?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    letterContent?: string;
    isJobReferred: boolean;
    studentProfile?: ResumeData;
}
