import { ResumeData } from '../types/resume';

export type ExperienceLevel = 'FRESHER' | 'EXPERIENCED' | 'TRANSITIONING';

export const determineExperienceLevel = (resume: ResumeData): ExperienceLevel => {
    // 1. Check if user has real professional experience
    // Filter out dummy or empty experience entries
    const realExperience = resume.experience?.filter(exp =>
        exp.company && exp.company.trim() !== '' &&
        exp.role && exp.role.trim() !== '' &&
        !exp.company.toLowerCase().includes('demo') &&
        !exp.company.toLowerCase().includes('sample')
    ) || [];

    const hasExperience = realExperience.length > 0;

    // 2. Check if user is a student or recent grad
    const currentYear = new Date().getFullYear();
    const isStudentOrRecentGrad = resume.education?.some(ed => {
        const gradYear = parseInt(ed.graduationDate || '');
        // If graduation date is in the future or within the last 2 years
        return !gradYear || gradYear >= (currentYear - 2);
    });

    // 3. Check for technical projects
    const hasProjects = (resume.projects?.length || 0) > 0;

    // Level Detection Logic
    if (!hasExperience && (isStudentOrRecentGrad || hasProjects)) {
        return 'FRESHER';
    } else if (hasExperience && realExperience.length >= 3) {
        return 'EXPERIENCED';
    } else if (hasExperience && isStudentOrRecentGrad) {
        // Someone with 1-2 internships/jobs but still in school or just out
        return 'FRESHER';
    }

    // Default to experienced if they have some background, or transitioning if it's mixed
    return hasExperience ? 'EXPERIENCED' : 'FRESHER';
};

export const getFresherRules = () => ({
    summary: "Focus on academic foundation, technical aptitude, and project-based impact rather than multi-year professional tenure.",
    experience: "If professional experience is light, expand the Technical Projects section. Treat significant projects with the same rigor as job entries.",
    formatting: "Place Education and Technical Projects before Work Experience if the latter is minimal."
});
