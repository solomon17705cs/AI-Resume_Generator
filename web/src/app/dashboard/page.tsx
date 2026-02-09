"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    FileText,
    Clock,
    Target,
    Zap,
    LayoutDashboard,
    Settings,
    User,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Briefcase,
    Github,
    RefreshCcw,
    Sparkles,
    Check,
    Compass
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default function DashboardPage() {
    const router = useRouter();
    const {
        githubLinked, githubUsername, githubRepos,
        setGitHubStatus, setGitHubRepos, updateResume, resume,
        syncLanguagesFromGitHub, recommendationRequests, userRole
    } = useResumeStore();

    const [isSyncing, setIsSyncing] = useState(false);
    const [importingId, setImportingId] = useState<number | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [languagesSynced, setLanguagesSynced] = useState(false);

    const isJobReferred = recommendationRequests.some(r => r.status === 'Approved');

    // Handle Hydration for Persisted Store
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Auth Guard
    useEffect(() => {
        if (isHydrated) {
            if (!githubLinked && !userRole) {
                router.push("/login");
            } else if (userRole === 'admin') {
                router.push("/recommendations");
            }
        }
    }, [isHydrated, githubLinked, userRole, router]);

    // Capture GitHub callback status from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const linked = params.get('github_linked');
        const username = params.get('username');
        const avatar = params.get('avatar');

        if (linked === 'true' && username) {
            setGitHubStatus({ linked: true, username, avatar: avatar || undefined });
            // Clean up the URL
            window.history.replaceState({}, document.title, "/dashboard");
        }
    }, [setGitHubStatus]);

    // Initial fetch of repos if linked
    useEffect(() => {
        if (githubLinked && githubRepos.length === 0) {
            fetchRepos();
        }
    }, [githubLinked]);

    // Don't render until hydrated to avoid flashing wrong state
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const fetchRepos = async () => {
        setIsSyncing(true);
        try {
            const res = await axios.get('/api/github/repos');
            setGitHubRepos(res.data);

            // Automatically sync languages to resume skills
            console.log('🎯 Auto-syncing languages to resume...');
            setTimeout(() => {
                syncLanguagesFromGitHub();
                setLanguagesSynced(true);
                console.log('✅ Languages synced to resume!');

                // Hide notification after 3 seconds
                setTimeout(() => setLanguagesSynced(false), 3000);
            }, 500); // Small delay to ensure repos are set in state
        } catch (err) {
            console.error("Failed to fetch GitHub repos");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImportRepo = async (repo: any) => {
        setImportingId(repo.id);
        try {
            // AI Enhancement - Generate high-impact bullets from repo data
            const aiRes = await axios.post('/api/optimize-project', {
                repoName: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stars
            });

            const newProject = {
                id: Math.random().toString(36).substr(2, 9),
                name: repo.name,
                description: repo.description || "Project imported from GitHub",
                technologies: repo.language ? [repo.language] : [],
                link: repo.url,
                bullets: aiRes.data.bullets
            };

            updateResume({ projects: [...resume.projects, newProject] });
        } catch (err) {
            console.error("AI import failed, using fallback");
        } finally {
            setImportingId(null);
        }
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* SaaS Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col glass-dark shrink-0 h-full">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="text-white fill-white" size={16} />
                        </div>
                        <span className="text-xl font-black font-display tracking-tighter">ATSense</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" active={true} />
                        <SidebarItem href="/resumes" icon={<FileText size={18} />} label="My Resumes" />
                        <SidebarItem href="/analysis" icon={<Target size={18} />} label="Job Analyzer" />
                        <SidebarItem href="/jobs" icon={<Compass size={18} />} label="Pathfinder" />
                        <SidebarItem href="/recommendations" icon={<ShieldCheck size={18} />} label="Recommendations" />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                        <SidebarItem href="/profile" icon={<User size={18} />} label="Profile" />
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <header className="flex justify-between items-end">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black font-display tracking-tight">
                                    Workspace {githubUsername && <span className="text-blue-500">/ {githubUsername}</span>}
                                </h1>
                                {isJobReferred && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-500"
                                    >
                                        <ShieldCheck size={12} />
                                        Job Referred ✔
                                    </motion.div>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Engineer your career trajectory with precision AI.</p>
                        </div>
                        <Link href="/editor" className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95">
                            <Plus size={18} strokeWidth={3} /> Launch Editor
                        </Link>
                    </header>

                    {/* GitHub Integration Section */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Github size={24} className="text-white" />
                                <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Engineering Inventory</h2>
                            </div>
                            {githubLinked && (
                                <button
                                    onClick={fetchRepos}
                                    disabled={isSyncing}
                                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:text-blue-400 transition-all disabled:opacity-50"
                                >
                                    <RefreshCcw size={12} className={isSyncing ? "animate-spin" : ""} />
                                    {isSyncing ? "Syncing..." : "Sync GitHub"}
                                </button>
                            )}
                        </div>

                        {githubLinked && (
                            <PermissionDiagnostic />
                        )}

                        {languagesSynced && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                            >
                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500">
                                    <Check size={18} />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-green-500">Languages Synced!</h5>
                                    <p className="text-[10px] text-slate-400 font-medium">All programming languages from your repos have been added to your resume skills.</p>
                                </div>
                            </motion.div>
                        )}

                        {!githubLinked ? (
                            <div className="p-16 glass-dark border border-white/5 rounded-[40px] text-center space-y-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all" />
                                <div className="relative z-10 space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-400 shadow-2xl">
                                        <Github size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">No GitHub account linked</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                                        Connect your GitHub to pull real projects, stars, and languages directly into your engineered resume.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = "/api/auth/github"}
                                        className="px-10 py-4 bg-white text-slate-950 rounded-[24px] font-black text-sm hover:scale-105 transition-all shadow-2xl shadow-white/10 active:scale-95"
                                    >
                                        Connect GitHub Account
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {githubRepos.length === 0 && !isSyncing ? (
                                    <div className="col-span-full py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                                        No repositories found.
                                    </div>
                                ) : (
                                    githubRepos.slice(0, 6).map((repo, i) => (
                                        <motion.div
                                            key={repo.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-8 bg-slate-950 border border-white/5 rounded-[32px] flex flex-col justify-between group hover:border-blue-500/30 transition-all shadow-xl"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <TrendingUp size={10} className="text-blue-500" /> {repo.stars}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">{repo.name}</h4>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-8">
                                                        {repo.description || "Experimental engineering project."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                                                <div className="flex-1">
                                                    <LanguageBar languages={repo.languages} />
                                                </div>
                                                <a
                                                    href={repo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-600 hover:text-white transition-colors flex shrink-0"
                                                >
                                                    <ChevronRight size={14} />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    {/* Resume Snapshot Section */}
                    {resume.projects.length > 0 && (
                        <section className="space-y-6 pt-12 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <Sparkles size={24} className="text-blue-500" />
                                <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Project Workspace</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {resume.projects.map((proj) => (
                                    <div key={proj.id} className="p-6 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{proj.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium">{proj.technologies.join(' • ')}</p>
                                            </div>
                                        </div>
                                        <Link href="/editor" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}

const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
        "TypeScript": "#3178c6",
        "JavaScript": "#f1e05a",
        "Python": "#3572a5",
        "Java": "#b07219",
        "C#": "#178600",
        "C++": "#f34b7d",
        "HTML": "#e34c26",
        "CSS": "#563d7c",
        "SCSS": "#c6538c",
        "Go": "#00add8",
        "Ruby": "#701516",
        "PHP": "#4f5d95",
        "Swift": "#ffac45",
        "Kotlin": "#7f52ff",
        "Rust": "#dea584",
        "Scala": "#c22d40",
        "Dart": "#00b4ab",
        "Shell": "#89e051",
        "SQL": "#e38c00",
        "JSON": "#292929",
        "Markdown": "#083fa1",
        "YAML": "#cb171e",
        "XML": "#006688",
        "Default": "#444"
    };
    return colors[language] || colors["Default"];
};

const SidebarItem = ({ icon, label, active = false, href }: any) => (
    <Link href={href || "#"} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        {icon}
        {label}
    </Link>
);

const PermissionDiagnostic = () => {
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await axios.get('/api/debug/token-scopes');
                console.log('🔍 Token Scope Diagnostic:', res.data);
                setStatus(res.data);

                if (!res.data.isFullyAuthorized) {
                    console.warn('⚠️ MISSING SCOPES:', res.data.missingScopes);
                    console.log('✅ Current Scopes:', res.data.grantedScopes);
                } else {
                    console.log('✅ All required scopes granted!');
                }
            } catch (e) {
                console.error("❌ Diagnostic failed:", e);
            }
        };
        check();
    }, []);

    if (!status || status.isFullyAuthorized) return null;

    return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500">
                    <ShieldCheck size={18} />
                </div>
                <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Limited Permissions Detected</h5>
                    <p className="text-[10px] text-slate-400 font-medium">To see repository languages, we need "Repo" access. Your current token only has: {status.grantedScopes.join(', ')}</p>
                </div>
            </div>
            <button
                onClick={() => window.location.href = "/api/auth/github"}
                className="px-4 py-2 bg-yellow-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-yellow-500/10"
            >
                Grant Full Access
            </button>
        </div>
    );
};

const LanguageBar = ({ languages }: { languages: any[] }) => {
    if (!languages || languages.length === 0) {
        return (
            <div className="flex items-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">No languages detected</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5 shadow-inner">
                {languages.slice(0, 5).map((lang, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: getLanguageColor(lang.name)
                        }}
                        className="h-full transition-all duration-500 ease-out"
                    />
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {languages.slice(0, 4).map((lang, i) => (
                    <div key={i} className="flex items-center gap-1.5 group/langitem">
                        <div
                            className="w-2 h-2 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                            style={{ backgroundColor: getLanguageColor(lang.name) }}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover/langitem:text-slate-200 transition-colors">
                            {lang.name} <span className="text-slate-600 ml-0.5">{lang.percentage.toFixed(1)}%</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
