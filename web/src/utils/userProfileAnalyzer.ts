import { ResumeData } from '../types/resume';

export type ExperienceLevel = 'FRESHER' | 'EXPERIENCED' | 'TRANSITIONING';

export const calculateExperienceYears = (resume: ResumeData): number => {
    if (!resume.experience || resume.experience.length === 0) return 0;

    let totalMonths = 0;
    resume.experience.forEach(exp => {
        if (!exp.startDate) return;

        const start = new Date(exp.startDate);
        const end = exp.endDate === 'Present' || !exp.endDate ? new Date() : new Date(exp.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
    });

    return Math.round((totalMonths / 12) * 10) / 10;
};

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
    const totalYears = calculateExperienceYears(resume);

    if (totalYears < 1.0 && (isStudentOrRecentGrad || hasProjects)) {
        return 'FRESHER';
    } else if (totalYears >= 3.0) {
        return 'EXPERIENCED';
    } else if (hasExperience && (isStudentOrRecentGrad || totalYears < 2.0)) {
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
