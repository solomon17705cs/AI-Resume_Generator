import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeData, ATSAnalysis, RecommendationRequest, Experience, Project } from '@/types/resume';

interface ResumeState {
    resume: ResumeData;
    analysis: ATSAnalysis | null;
    history: ResumeData[];
    jobDescription: string;
    jobUrl: string;
    recommendationRequests: RecommendationRequest[];
    userRole: 'user' | 'admin' | null;

    // Actions
    setUserRole: (role: 'user' | 'admin' | null) => void;
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
    removeProject: (id: string) => void;
    removeEducation: (id: string) => void;

    // GitHub Integration
    githubLinked: boolean;
    githubUsername: string;
    githubAvatar: string;
    githubRepos: any[];
    setGitHubStatus: (status: { linked: boolean; username: string; avatar?: string }) => void;
    setGitHubRepos: (repos: any[]) => void;
    syncLanguagesFromGitHub: () => void;
    syncProjectsFromGitHub: () => void;
    addSkillCategory: () => void;
    updateSkillCategoryName: (id: string, newName: string) => void;
    removeSkillCategory: (id: string) => void;

    // Recommendation Flow
    requestRecommendation: (details: Pick<RecommendationRequest, 'purpose' | 'company' | 'message'>) => void;
    updateRecommendationStatus: (id: string, status: 'Approved' | 'Rejected', letter?: string) => void;
    resetResume: () => void;
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
    summary: '',
    experience: [
        {
            id: 'exp-1',
            company: '',
            role: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            bullets: ['']
        }
    ],
    projects: [
        {
            id: 'proj-1',
            name: '',
            description: '',
            technologies: [],
            link: '',
            bullets: ['']
        }
    ],
    skills: [
        { id: '1', name: 'Languages', skills: [] },
        { id: '2', name: 'Frameworks', skills: [] }
    ],
    education: [
        {
            id: 'edu-1',
            institution: '',
            degree: '',
            location: '',
            graduationDate: ''
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
            recommendationRequests: [],
            userRole: null,

            setUserRole: (role) => set({ userRole: role }),

            updateResume: (updates: Partial<ResumeData>) => set((state) => {
                const newResume = { ...state.resume, ...updates, lastModified: new Date().toISOString() };
                return { resume: newResume };
            }),
            resetResume: () => set(() => ({ resume: DEFAULT_RESUME })),

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

            removeProject: (id: string) => set((state) => ({
                resume: {
                    ...state.resume,
                    projects: state.resume.projects.filter(proj => proj.id !== id)
                }
            })),

            removeEducation: (id: string) => set((state) => ({
                resume: {
                    ...state.resume,
                    education: state.resume.education.filter(edu => edu.id !== id)
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

            syncProjectsFromGitHub: () => set((state: any) => {
                if (!state.githubRepos || state.githubRepos.length === 0) return state;

                const currentProjects = [...state.resume.projects];
                let hasChanges = false;

                state.githubRepos.forEach((repo: any) => {
                    const existingProjIndex = currentProjects.findIndex(
                        p => p.name.toLowerCase() === repo.name.toLowerCase()
                    );

                    if (existingProjIndex >= 0) {
                        // If project exists, add description to bullets if not already present
                        if (repo.description && !currentProjects[existingProjIndex].bullets.includes(repo.description)) {
                            currentProjects[existingProjIndex] = {
                                ...currentProjects[existingProjIndex],
                                bullets: [...currentProjects[existingProjIndex].bullets, repo.description],
                                link: currentProjects[existingProjIndex].link || repo.html_url || ''
                            };
                            hasChanges = true;
                        }
                    } else {
                        // Create new project
                        currentProjects.push({
                            id: `proj-${Math.random().toString(36).substr(2, 9)}`,
                            name: repo.name,
                            description: '',
                            technologies: repo.languages?.slice(0, 5).map((l: any) => l.name) || [],
                            link: repo.html_url || '',
                            bullets: repo.description ? [repo.description] : []
                        });
                        hasChanges = true;
                    }
                });

                if (!hasChanges) return state;

                return {
                    resume: {
                        ...state.resume,
                        projects: currentProjects,
                        lastModified: new Date().toISOString()
                    }
                };
            }),

            addSkillCategory: () => set((state: any) => ({
                resume: {
                    ...state.resume,
                    skills: [
                        ...state.resume.skills,
                        { id: `skill-${Math.random().toString(36).substr(2, 9)}`, name: 'New Domain', skills: [] }
                    ]
                }
            })),

            updateSkillCategoryName: (id: string, newName: string) => set((state: any) => ({
                resume: {
                    ...state.resume,
                    skills: state.resume.skills.map((cat: any) =>
                        cat.id === id ? { ...cat, name: newName } : cat
                    )
                }
            })),

            removeSkillCategory: (id: string) => set((state: any) => ({
                resume: {
                    ...state.resume,
                    skills: state.resume.skills.filter((cat: any) => cat.id !== id)
                }
            })),

            requestRecommendation: (details: any) => set((state: any) => {
                const newRequest: RecommendationRequest = {
                    id: Math.random().toString(36).substr(2, 9),
                    studentName: state.resume.personalInfo.fullName || 'Student',
                    studentEmail: state.resume.personalInfo.email || 'student@atsense.ai',
                    purpose: details.purpose,
                    company: details.company,
                    message: details.message,
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                    isJobReferred: false,
                    studentProfile: state.resume
                };

                // Simulation of Step 4: Admin Notification
                console.log("SIMULATION: Email sent to admin@gmail.com with request:", newRequest);

                return {
                    recommendationRequests: [...state.recommendationRequests, newRequest]
                };
            }),

            updateRecommendationStatus: (id: string, status: any, letter?: string) => set((state: any) => ({
                recommendationRequests: state.recommendationRequests.map((req: any) =>
                    req.id === id
                        ? {
                            ...req,
                            status,
                            letterContent: letter || req.letterContent,
                            isJobReferred: status === 'Approved'
                        }
                        : req
                )
            })),
        }),
        {
            name: 'atsense-resume-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
