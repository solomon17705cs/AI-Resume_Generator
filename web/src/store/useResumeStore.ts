import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeData, ATSAnalysis, Experience, Project } from '@/types/resume';

interface ResumeState {
    resume: ResumeData;
    analysis: ATSAnalysis | null;
    history: ResumeData[];
    jobDescription: string;
    jobUrl: string;

    // Actions
    updateResume: (updates: Partial<ResumeData>) => void;
    setAnalysis: (analysis: ATSAnalysis) => void;
    setJobContext: (description: string, url: string) => void;
    saveToHistory: () => void;
    restoreFromHistory: (id: string) => void;

    // Specific nested updates
    updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
    updateExperience: (id: string, updates: Partial<ResumeData['experience'][0]>) => void;
    addExperience: () => void;
    removeExperience: (id: string) => void;

    // GitHub Integration
    githubLinked: boolean;
    githubUsername: string;
    githubAvatar: string;
    githubRepos: any[];
    setGitHubStatus: (status: { linked: boolean; username: string; avatar?: string }) => void;
    setGitHubRepos: (repos: any[]) => void;
    syncLanguagesFromGitHub: () => void;
    addSkillCategory: () => void;
    updateSkillCategoryName: (id: string, newName: string) => void;
    removeSkillCategory: (id: string) => void;
}

const DEFAULT_RESUME: ResumeData = {
    id: 'draft-1',
    title: 'My Professional Resume',
    lastModified: new Date().toISOString(),
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
    },
    summary: 'Senior Software Engineer with 8+ years of experience in distributed systems and AI orchestration.',
    experience: [
        {
            id: 'exp-1',
            company: 'Tech Corp',
            role: 'Lead Architect',
            location: 'San Francisco, CA',
            startDate: '2020-01',
            endDate: 'Present',
            isCurrent: true,
            bullets: ['Led development of a high-frequency trading platform handling $1B+ daily volume.']
        }
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'ATSense AI',
            description: 'AI-powered resume optimization engine.',
            technologies: ['Next.js', 'FastAPI', 'spaCy'],
            link: 'github.com/solomon/atsense',
            bullets: ['Engineered a vector-similarity match engine reducing candidate screening time by 70%.']
        }
    ],
    skills: [
        { id: '1', name: 'Languages', skills: [] }
    ],
    education: [
        {
            id: 'edu-1',
            institution: 'Stanford University',
            degree: 'M.S. in Computer Science',
            location: 'Stanford, CA',
            graduationDate: '2019'
        }
    ],
    metadata: {}
};

export const useResumeStore = create<ResumeState>()(
    persist(
        (set) => ({
            resume: DEFAULT_RESUME,
            analysis: null,
            history: [],
            githubLinked: false,
            githubUsername: '',
            githubAvatar: '',
            githubRepos: [],
            jobDescription: '',
            jobUrl: '',

            updateResume: (updates: Partial<ResumeData>) => set((state) => ({
                resume: { ...state.resume, ...updates, lastModified: new Date().toISOString() }
            })),

            setAnalysis: (analysis: ATSAnalysis) => set({ analysis }),

            setJobContext: (description: string, url: string) => set({
                jobDescription: description,
                jobUrl: url
            }),

            saveToHistory: () => set((state) => ({
                history: [state.resume, ...state.history].slice(0, 10)
            })),

            restoreFromHistory: (id: string) => set((state) => {
                const historical = state.history.find(r => r.id === id);
                return historical ? { resume: historical } : state;
            }),

            updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => set((state) => ({
                resume: {
                    ...state.resume,
                    personalInfo: { ...state.resume.personalInfo, ...info }
                }
            })),

            updateExperience: (id: string, updates: Partial<Experience>) => set((state) => ({
                resume: {
                    ...state.resume,
                    experience: state.resume.experience.map(exp =>
                        exp.id === id ? { ...exp, ...updates } : exp
                    )
                }
            })),

            addExperience: () => set((state) => ({
                resume: {
                    ...state.resume,
                    experience: [
                        ...state.resume.experience,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            company: '',
                            role: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            isCurrent: false,
                            bullets: ['']
                        }
                    ]
                }
            })),

            removeExperience: (id: string) => set((state) => ({
                resume: {
                    ...state.resume,
                    experience: state.resume.experience.filter(exp => exp.id !== id)
                }
            })),

            setGitHubStatus: (status: { linked: boolean; username: string; avatar?: string }) => set({
                githubLinked: status.linked,
                githubUsername: status.username,
                githubAvatar: status.avatar || ''
            }),

            setGitHubRepos: (repos: any[]) => set({
                githubRepos: repos
            }),

            syncLanguagesFromGitHub: () => set((state) => {
                const { processGithubLanguages } = require('@/utils/skillProcessor');

                const allLanguages: { name: string; percentage: number; color?: string }[] = [];
                state.githubRepos.forEach((repo) => {
                    if (repo.languages && Array.isArray(repo.languages)) {
                        repo.languages.forEach((lang: any) => {
                            allLanguages.push({
                                name: lang.name,
                                percentage: lang.percentage || 1,
                                color: lang.color
                            });
                        });
                    }
                });

                if (allLanguages.length === 0) return state;

                const categories = processGithubLanguages(allLanguages);
                const existingSkills = [...state.resume.skills];

                Object.values(categories).forEach((cat: any) => {
                    const existingCatIndex = existingSkills.findIndex(
                        s => s.name.toLowerCase() === cat.name.toLowerCase()
                    );

                    const newSkills = cat.skills.map((s: any) => s.name);

                    if (existingCatIndex >= 0) {
                        const mergedSkills = Array.from(new Set([...existingSkills[existingCatIndex].skills, ...newSkills]));
                        existingSkills[existingCatIndex] = {
                            ...existingSkills[existingCatIndex],
                            skills: mergedSkills
                        };
                    } else {
                        existingSkills.push({
                            id: `skill-${Math.random().toString(36).substr(2, 9)}`,
                            name: cat.name,
                            skills: newSkills
                        });
                    }
                });

                return {
                    resume: {
                        ...state.resume,
                        skills: existingSkills,
                        lastModified: new Date().toISOString()
                    }
                };
            }),

            addSkillCategory: () => set((state) => ({
                resume: {
                    ...state.resume,
                    skills: [
                        ...state.resume.skills,
                        { id: `skill-${Math.random().toString(36).substr(2, 9)}`, name: 'New Domain', skills: [] }
                    ]
                }
            })),

            updateSkillCategoryName: (id: string, newName: string) => set((state) => ({
                resume: {
                    ...state.resume,
                    skills: state.resume.skills.map(cat =>
                        cat.id === id ? { ...cat, name: newName } : cat
                    )
                }
            })),

            removeSkillCategory: (id: string) => set((state) => ({
                resume: {
                    ...state.resume,
                    skills: state.resume.skills.filter(cat => cat.id !== id)
                }
            })),
        }),
        {
            name: 'atsense-resume-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
