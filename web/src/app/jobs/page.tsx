"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Briefcase,
    Target,
    BarChart3,
    Sparkles,
    LayoutDashboard,
    FileText,
    ShieldCheck,
    User,
    Search,
    Compass,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import axios from "axios";
import { Github } from "lucide-react";

const POPULAR_ROLES = [
    { title: "AI Engineering Manager", salary: "$160k - $220k", demand: "Extremely High", icon: <Sparkles size={20} className="text-purple-400" /> },
    { title: "Cloud Solutions Architect", salary: "$140k - $190k", demand: "High", icon: <Target size={20} className="text-blue-400" /> },
    { title: "Full Stack Developer", salary: "$110k - $160k", demand: "High", icon: <CheckCircle2 size={20} className="text-emerald-400" /> },
    { title: "DevOps Engineer", salary: "$120k - $175k", demand: "Very High", icon: <Zap size={20} className="text-yellow-400" /> },
];

const LinkedinIcon = ({ size }: { size: number }) => (
    <svg
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className="text-[#0077b5]"
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

interface JobSuggestion {
    role: string;
    marketDemand: string;
    matchScore: number;
    reason: string;
    topSkillsToHighlight: string[];
    estimatedSalary: string;
}

export default function JobSuggestionsPage() {
    const router = useRouter();
    const { resume, githubLinked, userRole } = useResumeStore();
    const [isHydrated, setIsHydrated] = useState(false);
    const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/suggest-jobs', { resume });
            setSuggestions(res.data.suggestions);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to analyze career paths. Please check your AI keys.");
        } finally {
            setIsLoading(false);
        }
    };

    const hasSkills = resume.skills.some(cat => cat.skills.length > 0);
    const isResumeEmpty = !resume.experience.length && !resume.projects.length && !hasSkills && !resume.summary;

    useEffect(() => {
        if (isHydrated && !isResumeEmpty) {
            fetchSuggestions();
        }
    }, [isHydrated, isResumeEmpty]);

    if (!isHydrated) return null;

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* SaaS Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <header className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black font-display tracking-tight flex items-center gap-4">
                                Career Pathfinder
                                <span className="px-3 py-1 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] uppercase tracking-widest">
                                    AI-Driven
                                </span>
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                Discovery of optimal job roles based on your verified technical matrix and market logic.
                            </p>
                        </div>

                        <button
                            onClick={fetchSuggestions}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? "Recalculating..." : "Refresh Analysis"} <Sparkles size={18} />
                        </button>
                    </header>

                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center space-y-8">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold">Mapping your Career DNA</h3>
                                <p className="text-slate-500 text-sm animate-pulse">Running forensic match analysis against market demand...</p>
                            </div>
                        </div>
                    ) : isResumeEmpty ? (
                        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {/* Empty State / Connection Prompt */}
                            <div className="p-16 glass-dark border border-white/5 rounded-[60px] text-center space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] -z-10 rounded-full" />

                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-blue-500 mb-6">
                                        <Compass size={40} className="animate-spin-slow" />
                                    </div>
                                    <h3 className="text-4xl font-black font-display tracking-tight">Connect Your Technical DNA</h3>
                                    <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                                        Our AI engine requires your technical background to map your career trajectory.
                                        Sync your profiles to unlock deep-layer role analysis.
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-6">
                                    <button
                                        onClick={() => window.location.href = '/api/auth/github'}
                                        className="flex items-center gap-3 px-10 py-5 bg-[#24292e] text-white rounded-[24px] font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 border border-white/5"
                                    >
                                        <Github size={20} /> Sync GitHub Repos
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/api/auth/linkedin'}
                                        className="flex items-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-[24px] font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95"
                                    >
                                        <LinkedinIcon size={20} /> Import LinkedIn Profile
                                    </button>
                                </div>
                            </div>

                            {/* Popular Jobs Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <TrendingUp className="text-blue-500" />
                                    <h3 className="text-2xl font-black font-display tracking-tight">Market Demand Snapshot</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {POPULAR_ROLES.map((role, i) => (
                                        <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6 hover:bg-white/[0.07] transition-all group">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                                {role.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-lg leading-tight uppercase group-hover:text-blue-400 transition-colors">{role.title}</h4>
                                                <p className="text-emerald-400 font-bold text-xs">{role.salary}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{role.demand} Demand</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {suggestions.map((job, idx) => (
                                    <motion.div
                                        key={job.role}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-8 bg-slate-900 border border-white/5 rounded-[40px] hover:border-blue-500/40 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                            <Briefcase size={120} />
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    Match: {job.matchScore}%
                                                </div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                    {job.marketDemand} Demand
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black font-display tracking-tight text-white group-hover:text-blue-400 transition-colors uppercase">
                                                {job.role}
                                            </h3>

                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                                {job.reason}
                                            </p>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Growth Matrix</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.topSkillsToHighlight.map((skill) => (
                                                        <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Est. Comp</p>
                                                    <p className="text-sm font-bold text-emerald-400">{job.estimatedSalary}</p>
                                                </div>
                                                <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Meta Advice */}
                    {!isLoading && suggestions.length > 0 && (
                        <div className="mt-12 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-white">
                                    <Target size={40} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-2xl font-black text-white">Targeted Engineering</h3>
                                    <p className="text-blue-100 font-medium opacity-80 max-w-2xl">
                                        These suggestions are weighted based on your GitHub repository complexity and the languages found in your professional experience.
                                    </p>
                                </div>
                                <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                    Export Strategy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}

