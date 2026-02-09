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
import { LogoutButton } from "@/components/layout/LogoutButton";
import axios from "axios";

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

    useEffect(() => {
        if (isHydrated && resume.skills.length > 0) {
            fetchSuggestions();
        }
    }, [isHydrated]);

    if (!isHydrated) return null;

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
                        <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
                        <SidebarItem href="/resumes" icon={<FileText size={18} />} label="My Resumes" />
                        <SidebarItem href="/analysis" icon={<Target size={18} />} label="Job Analyzer" />
                        <SidebarItem href="/jobs" icon={<Compass size={18} />} label="Pathfinder" active />
                        <SidebarItem href="/recommendations" icon={<ShieldCheck size={18} />} label="Recommendations" />
                        <SidebarItem href="/profile" icon={<User size={18} />} label="Profile" />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

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
                    ) : error ? (
                        <div className="py-20 glass-dark border border-red-500/20 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                                <TrendingUp className="rotate-180" size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-red-400">Analysis Halted</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">{error}</p>
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
            `}</style>
        </div>
    );
}

const SidebarItem = ({ icon, label, active = false, href }: any) => (
    <Link href={href || "#"} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        {icon}
        {label}
    </Link>
);
