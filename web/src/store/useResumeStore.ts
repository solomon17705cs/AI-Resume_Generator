import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeData, ATSAnalysis } from '@/types/resume';

interface ResumeState {
    resume: ResumeData;
    analysis: ATSAnalysis | null;
    history: ResumeData[];

    // Actions
    updateResume: (updates: Partial<ResumeData>) => void;
    setAnalysis: (analysis: ATSAnalysis) => void;
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
        { id: '1', name: 'Languages', skills: ['TypeScript', 'Python', 'Go', 'Rust'] },
        { id: '2', name: 'AI/ML', skills: ['PyTorch', 'Transformers', 'spaCy', 'LangChain'] }
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

            updateResume: (updates) => set((state) => ({
                resume: { ...state.resume, ...updates, lastModified: new Date().toISOString() }
            })),

            setAnalysis: (analysis) => set({ analysis }),

            saveToHistory: () => set((state) => ({
                history: [state.resume, ...state.history].slice(0, 10)
            })),

            restoreFromHistory: (id) => set((state) => {
                const historical = state.history.find(r => r.id === id);
                return historical ? { resume: historical } : state;
            }),

            updatePersonalInfo: (info) => set((state) => ({
                resume: {
                    ...state.resume,
                    personalInfo: { ...state.resume.personalInfo, ...info }
                }
            })),

            updateExperience: (id, updates) => set((state) => ({
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

            removeExperience: (id) => set((state) => ({
                resume: {
                    ...state.resume,
                    experience: state.resume.experience.filter(exp => exp.id !== id)
                }
            })),

            setGitHubStatus: (status) => set({
                githubLinked: status.linked,
                githubUsername: status.username,
                githubAvatar: status.avatar || ''
            }),

            setGitHubRepos: (repos) => set({
                githubRepos: repos
            }),

            syncLanguagesFromGitHub: () => set((state) => {
                // Extract all unique languages from all repos
                const languageMap = new Map<string, number>();

                state.githubRepos.forEach((repo) => {
                    if (repo.languages && Array.isArray(repo.languages)) {
                        repo.languages.forEach((lang: { name: string; percentage: number }) => {
                            const currentCount = languageMap.get(lang.name) || 0;
                            languageMap.set(lang.name, currentCount + 1);
                        });
                    }
                });

                // Sort languages by frequency (most used first)
                const sortedLanguages = Array.from(languageMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([name]) => name);

                console.log('🔧 Extracted languages from GitHub:', sortedLanguages);

                // Find or create the "Languages" skill category
                const existingSkills = state.resume.skills;
                const languagesCategoryIndex = existingSkills.findIndex(
                    cat => cat.name.toLowerCase() === 'languages'
                );

                let updatedSkills;
                if (languagesCategoryIndex >= 0) {
                    // Merge with existing languages, avoiding duplicates
                    const existingLangs = existingSkills[languagesCategoryIndex].skills;
                    const mergedLangs = Array.from(new Set([...sortedLanguages, ...existingLangs]));

                    updatedSkills = existingSkills.map((cat, idx) =>
                        idx === languagesCategoryIndex
                            ? { ...cat, skills: mergedLangs }
                            : cat
                    );
                } else {
                    // Create new "Languages" category
                    updatedSkills = [
                        { id: `skill-${Date.now()}`, name: 'Languages', skills: sortedLanguages },
                        ...existingSkills
                    ];
                }

                return {
                    resume: {
                        ...state.resume,
                        skills: updatedSkills,
                        lastModified: new Date().toISOString()
                    }
                };
            }),
        }),
        {
            name: 'atsense-resume-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
