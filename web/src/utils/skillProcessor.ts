import { LANGUAGE_TO_SKILL_MAP } from './skillMapping';

export interface SkillCategory {
    name: string;
    skills: {
        name: string;
        percentage: number;
        color?: string;
        normalizedPercentage?: number;
    }[];
    totalPercentage: number;
}

export const processGithubLanguages = (githubLanguages: { name: string; percentage: number; color?: string }[]) => {
    // 1. Group by skill category
    const skillCategories: Record<string, SkillCategory> = {};

    githubLanguages.forEach(lang => {
        const category = LANGUAGE_TO_SKILL_MAP[lang.name] || "General";

        if (!skillCategories[category]) {
            skillCategories[category] = {
                name: category,
                skills: [],
                totalPercentage: 0
            };
        }

        // Check if skill already exists in category to avoid duplicates
        const existingSkill = skillCategories[category].skills.find(s => s.name === lang.name);
        if (!existingSkill) {
            skillCategories[category].skills.push({
                name: lang.name,
                percentage: lang.percentage,
                color: lang.color
            });
        } else {
            // Average the percentage or add? Let's add and then normalize later
            existingSkill.percentage += lang.percentage;
        }

        skillCategories[category].totalPercentage += lang.percentage;
    });

    // 2. Normalize percentages within each category and overall
    Object.values(skillCategories).forEach(category => {
        const total = category.skills.reduce((sum, s) => sum + s.percentage, 0);

        category.skills = category.skills.map(skill => ({
            ...skill,
            normalizedPercentage: total > 0 ? (skill.percentage / total) * 100 : 0
        }));

        // Sort skills by percentage
        category.skills.sort((a, b) => (b.normalizedPercentage || 0) - (a.normalizedPercentage || 0));
    });

    return skillCategories;
};
