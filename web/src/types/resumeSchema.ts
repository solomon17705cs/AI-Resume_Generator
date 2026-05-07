/**
 * Strict JSON Schema for AI Resume Generation
 * 
 * This schema enforces structure and quality constraints on AI-generated content.
 * AI should ONLY generate content that fits this schema - never free-form text.
 */

import { z } from 'zod';

// Validation rules for AI-generated content
const BULLET_MAX_WORDS = 25;
const SUMMARY_MAX_WORDS = 60;
const PROJECT_DESC_MAX_WORDS = 30;

// Helper to count words
const wordCount = (text: string) => text.trim().split(/\s+/).length;

// Experience Bullet Schema
export const ExperienceBulletSchema = z.string()
    .min(5, "Bullet too short")
    .max(500, "Bullet too long")
    .refine(
        (text) => wordCount(text) <= 50,
        "Bullet must be ≤ 50 words"
    )
    .refine(
        (text) => /^[A-Z]/.test(text),
        "Bullet must start with capital letter (action verb)"
    )
    .refine(
        (text) => !text.includes('...'),
        "No ellipsis allowed - be specific"
    );

// Experience Entry Schema
export const ExperienceEntrySchema = z.object({
    title: z.string().min(3, "Job title required"),
    company: z.string().min(2, "Company name required"),
    location: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM").optional(),
    endDate: z.string().regex(/^(\d{4}-\d{2}|Present)$/, "Format: YYYY-MM or 'Present'").optional(),
    bullets: z.array(ExperienceBulletSchema)
        .min(1, "At least 1 bullet required")
        .max(10, "Maximum 10 bullets per role")
});

// Project Schema
export const ProjectSchema = z.object({
    name: z.string().min(3, "Project name required"),
    description: z.string()
        .min(20, "Description too short")
        .refine(
            (text) => wordCount(text) <= PROJECT_DESC_MAX_WORDS,
            `Description must be ≤ ${PROJECT_DESC_MAX_WORDS} words`
        ),
    technologies: z.array(z.string()).min(2, "At least 2 technologies required"),
    link: z.string().url().optional().or(z.literal('')),
    bullets: z.array(ExperienceBulletSchema).min(1).max(3)
});

// Skills Schema
export const SkillCategorySchema = z.object({
    name: z.string().min(3, "Category name required"),
    skills: z.array(z.string().min(2)).min(3, "At least 3 skills per category")
});

// Professional Summary Schema
export const SummarySchema = z.string()
    .min(20, "Summary too short")
    .max(1000, "Summary too long")
    .refine(
        (text) => wordCount(text) <= 150,
        "Summary must be ≤ 150 words"
    )
    .refine(
        (text) => !text.toLowerCase().includes('i am') && !text.toLowerCase().includes("i'm"),
        "Use third person - avoid 'I am' or 'I'm'"
    );

// Full AI-Generated Resume Schema
export const AIGeneratedResumeSchema = z.object({
    summary: SummarySchema,
    experience: z.array(ExperienceEntrySchema).min(0).max(5),
    projects: z.array(ProjectSchema).min(0).max(5),
    skills: z.array(SkillCategorySchema).min(1).max(6)
});

// Type exports
export type ExperienceBullet = z.infer<typeof ExperienceBulletSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type AIGeneratedResume = z.infer<typeof AIGeneratedResumeSchema>;

// Validation helper
export function validateAIResume(data: unknown): { success: true; data: AIGeneratedResume } | { success: false; errors: string[] } {
    const result = AIGeneratedResumeSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return {
            success: false,
            errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
        };
    }
}

// ATS-Specific Generation Rules
export const ATSGenerationRules = {
    greenhouse: {
        bulletStyle: "action verb + technology + metric",
        keywordDensity: "3-4%",
        maxBulletWords: 25,
        requireMetrics: true,
        sectionOrder: ["summary", "experience", "projects", "skills"],
        dateFormat: "Month YYYY"
    },
    workday: {
        bulletStyle: "formal language + exact matches",
        keywordDensity: "4-5%",
        maxBulletWords: 30,
        requireMetrics: false,
        sectionOrder: ["summary", "experience", "skills", "projects"],
        dateFormat: "MM/YYYY"
    },
    zoho: {
        bulletStyle: "technology-heavy + comprehensive",
        keywordDensity: "5-6%",
        maxBulletWords: 35,
        requireMetrics: false,
        sectionOrder: ["skills", "experience", "projects"],
        dateFormat: "Month YYYY"
    },
    darwinbox: {
        bulletStyle: "ownership verbs + team size + impact",
        keywordDensity: "3-4%",
        maxBulletWords: 28,
        requireMetrics: true,
        sectionOrder: ["summary", "experience", "skills", "projects"],
        dateFormat: "Month YYYY"
    },
    lever: {
        bulletStyle: "concise technical + GitHub links",
        keywordDensity: "2-3%",
        maxBulletWords: 20,
        requireMetrics: true,
        sectionOrder: ["projects", "experience", "skills"],
        dateFormat: "Month YYYY"
    },
    generic: {
        bulletStyle: "balanced action verbs + results",
        keywordDensity: "3-4%",
        maxBulletWords: 25,
        requireMetrics: true,
        sectionOrder: ["summary", "experience", "skills", "projects"],
        dateFormat: "Month YYYY"
    }
} as const;

export type ATSType = keyof typeof ATSGenerationRules;
