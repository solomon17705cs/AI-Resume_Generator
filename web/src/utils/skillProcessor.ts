import { LANGUAGE_TO_SKILL_MAP } from './skillMapping';

export interface SkillCategory {
    name: string;
    skills: {
        name: string;
        percentage: number;
        count?: number;
        color?: string;
        normalizedPercentage?: number;
    }[];
    totalPercentage: number;
}

export const processGithubLanguages = (githubLanguages: { name: string; percentage: number; color?: string }[]) => {
    // 1. Group by skill category - FIXED: Average percentages instead of summing
    const skillCategories: Record<string, SkillCategory> = {};
    const skillCounts: Record<string, number> = {};

    githubLanguages.forEach(lang => {
        const category = LANGUAGE_TO_SKILL_MAP[lang.name] || "General";

        if (!skillCategories[category]) {
            skillCategories[category] = {
                name: category,
                skills: [],
                totalPercentage: 0
            };
            skillCounts[category] = 0;
        }

        // Check if skill already exists in category
        const existingSkill = skillCategories[category].skills.find(s => s.name === lang.name);
        if (!existingSkill) {
            skillCategories[category].skills.push({
                name: lang.name,
                percentage: lang.percentage,
                count: 1,
                color: lang.color
            });
        } else {
            // Accumulate and count for averaging later
            existingSkill.percentage += lang.percentage;
            existingSkill.count = (existingSkill.count || 1) + 1;
        }

        skillCounts[category]++;
    });

    // 2. Normalize: Calculate averages and normalize within category
    Object.values(skillCategories).forEach(category => {
        // Average each skill's percentage across repos where it appears
        const total = category.skills.reduce((sum, s) => sum + s.percentage, 0);
        
        // Calculate average percentage for each skill
        category.skills = category.skills.map(skill => ({
            ...skill,
            percentage: skill.count ? skill.percentage / skill.count : skill.percentage,
            normalizedPercentage: 0 // Will be calculated below
        }));

        // Calculate total category percentage (sum of averages / number of skills, capped at 100%)
        const avgTotal = category.skills.reduce((sum, s) => sum + s.percentage, 0);
        category.totalPercentage = Math.min(100, avgTotal);

        // Normalize individual skills within category
        const skillSum = category.skills.reduce((sum, s) => sum + s.percentage, 0);
        category.skills = category.skills.map(skill => ({
            ...skill,
            normalizedPercentage: skillSum > 0 ? (skill.percentage / skillSum) * 100 : 0
        }));

        // Sort skills by percentage
        category.skills.sort((a, b) => (b.normalizedPercentage || 0) - (a.normalizedPercentage || 0));
    });

    return skillCategories;
};
