"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Zap,
    LayoutDashboard,
    FileText,
    Settings,
    User,
    Briefcase,
    Search,
    AlertCircle,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    Cpu,
    BarChart4,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";
import { ATSScoreGauge } from "@/components/dashboard/ATSScoreGauge";

export default function AnalysisPage() {
    const router = useRouter();
    const {
        githubLinked, analysis, resume
    } = useResumeStore();

    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Auth Guard
    useEffect(() => {
        if (isHydrated && !githubLinked) {
            router.push("/login");
        }
    }, [isHydrated, githubLinked, router]);

    if (!isHydrated) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col p-6 glass-dark shrink-0">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white fill-white" size={16} />
                    </div>
                    <span className="text-xl font-black font-display tracking-tighter">ATSense</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
                    <SidebarItem href="/resumes" icon={<FileText size={18} />} label="My Resumes" />
                    <SidebarItem href="/analysis" icon={<Target size={18} />} label="Job Analyzer" active />
                    <SidebarItem href="/profile" icon={<User size={18} />} label="Profile" />
                </nav>

                <div className="pt-6 border-t border-white/5 space-y-2">
                    <SidebarItem href="#" icon={<Settings size={18} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <header className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black font-display tracking-tight mb-2">Job Intelligence</h1>
                            <p className="text-slate-500 text-sm font-medium">Deep-layer matching forensics for your target role.</p>
                        </div>
                        <Link href="/editor" className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                            Update Job Description <ArrowRight size={18} />
                        </Link>
                    </header>

                    {!analysis ? (
                        <div className="p-20 border-2 border-dashed border-white/5 rounded-[60px] text-center space-y-8">
                            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-slate-700">
                                <Search size={48} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black">No Active Analysis</h3>
                                <p className="text-slate-500 max-w-md mx-auto font-medium">
                                    Paste a Job Description in the editor to trigger our AI forensic engine and see your match metrics.
                                </p>
                            </div>
                            <Link href="/editor" className="inline-block px-10 py-5 bg-white text-slate-950 rounded-[28px] font-black text-sm hover:scale-105 transition-all active:scale-95">
                                Go to Intelligence Core
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Score Overview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 p-10 glass-dark border border-white/5 rounded-[48px] flex items-center justify-between gap-12">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            <Zap size={12} /> Neural Match Active
                                        </div>
                                        <h3 className="text-4xl font-black font-display tracking-tight">System Alignment</h3>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                                            Your resume has been measured against the Big Tech hiring logic. Here is your verified probability.
                                        </p>
                                    </div>
                                    <div className="w-48 h-48 scale-110">
                                        <ATSScoreGauge score={analysis.overallScore} />
                                    </div>
                                </div>

                                <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] text-white space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-center">Quick Forensics</h4>
                                    <div className="space-y-5">
                                        <ForensicStat label="Keyword Density" value={analysis.forensics?.keyword_density || 0} />
                                        <ForensicStat label="Semantic Overlap" value={analysis.forensics?.semantic_overlap || 0} />
                                        <ForensicStat label="Structural Integrity" value={analysis.forensics?.structural_integrity || 0} />
                                    </div>
                                </div>
                            </div>

                            {/* Section breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard label="Experience Impact" score={analysis.sectionScores.experience} icon={<Cpu size={24} />} color="blue" />
                                <MetricCard label="Skill Alignment" score={analysis.sectionScores.skills} icon={<BarChart4 size={24} />} color="emerald" />
                                <MetricCard label="XYZ Formatting" score={analysis.sectionScores.impact} icon={<Settings size={24} />} color="indigo" />
                            </div>

                            {/* Keywords & Logic */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <AlertCircle className="text-yellow-500" />
                                        Foundational Gaps
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.keywords.missing.map((word, i) => (
                                            <span key={i} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium italic border-l-2 border-white/5 pl-4">
                                        Detecting missing signals for your target role. Optimization recommended.
                                    </p>
                                </div>

                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8">
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <CheckCircle2 className="text-emerald-500" />
                                        Verified Signals
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.keywords.found.map((word, i) => (
                                            <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium italic border-l-2 border-white/5 pl-4">
                                        Strong alignment detected in these technical domains.
                                    </p>
                                </div>
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
    <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        {icon}
        {label}
    </Link>
);

const ForensicStat = ({ label, value }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
            <span>{label}</span>
            <span>{(value * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                className="h-full bg-white rounded-full"
            />
        </div>
    </div>
);

const MetricCard = ({ label, score, icon, color }: any) => (
    <div className="p-8 glass-dark border border-white/5 rounded-[40px] space-y-6">
        <div className={`w-12 h-12 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-500`}>
            {icon}
        </div>
        <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none">{label}</h4>
            <div className={`text-4xl font-black font-display text-${color}-500 animate-pulse`}>
                {score}%
            </div>
        </div>
    </div>
);
