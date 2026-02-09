"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Plus,
    FileText,
    Clock,
    Target,
    Zap,
    LayoutDashboard,
    Search,
    Settings,
    User,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const recentResumes = [
        { name: "Frontend Engineer - Google", score: 92, lastEdited: "2 hours ago", role: "Software Engineer" },
        { name: "Fullstack Dev - Vercel", score: 87, lastEdited: "1 day ago", role: "Product Engineer" },
        { name: "AI Researcher - OpenAI", score: 74, lastEdited: "3 days ago", role: "AI Engineer" },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* SaaS Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col p-6 glass-dark shrink-0">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white fill-white" size={16} />
                    </div>
                    <span className="text-xl font-black font-display tracking-tighter">ATSense</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active />
                    <SidebarItem icon={<FileText size={18} />} label="My Resumes" />
                    <SidebarItem icon={<Target size={18} />} label="Job Analyzer" />
                    <SidebarItem icon={<Briefcase size={18} />} label="Applications" />
                    <SidebarItem icon={<Search size={18} />} label="Market Trends" />
                </nav>

                <div className="pt-6 border-t border-white/5 space-y-2">
                    <SidebarItem icon={<Settings size={18} />} label="Settings" />
                    <SidebarItem icon={<User size={18} />} label="Profile" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <header className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black font-display tracking-tight mb-2">Workspace</h1>
                            <p className="text-slate-500 text-sm font-medium">Engineer your career trajectory with precision AI.</p>
                        </div>
                        <Link href="/editor" className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95">
                            <Plus size={18} strokeWidth={3} /> Create New Resume
                        </Link>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Resumes" value="12" delta="+2 this month" />
                        <StatCard label="Avg. Match Score" value="84%" delta="+5% increase" positive />
                        <StatCard label="Interview Rate" value="32%" delta="+12% vs last pool" positive />
                    </div>

                    {/* Recent Resumes List */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Recent Projects</h2>
                            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">View Archives</button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {recentResumes.map((resume, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group flex items-center justify-between p-6 bg-slate-900/50 border border-white/5 rounded-3xl hover:bg-slate-900 hover:border-blue-500/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{resume.name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium lowercase">
                                                <span className="flex items-center gap-1 uppercase tracking-widest text-[10px]"><Clock size={12} /> {resume.lastEdited}</span>
                                                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                <span className="flex items-center gap-1 uppercase tracking-widest text-[10px]"><ShieldCheck size={12} className="text-green-500" /> {resume.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <div className={`text-2xl font-black font-display ${resume.score > 90 ? 'text-green-500' : 'text-yellow-500'}`}>{resume.score}%</div>
                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Match Score</div>
                                        </div>
                                        <Link href="/editor" className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                                            <ChevronRight size={20} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Insights */}
                    <section className="p-8 bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/20 rounded-[40px] flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-400">
                                <TrendingUp size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Market Intelligence</span>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">Software Engineer roles are up 15%.</h3>
                            <p className="text-sm text-slate-400 max-w-md leading-relaxed">Your "Backend - OpenAI" resume is perfectly positioned. Recommended action: Update 'LLM Orchestration' bullet.</p>
                        </div>
                        <button className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                            Update Skills
                        </button>
                    </section>
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

const SidebarItem = ({ icon, label, active = false }: any) => (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        {icon}
        {label}
    </button>
);

const StatCard = ({ label, value, delta, positive = false }: any) => (
    <div className="p-8 glass-dark border border-white/5 rounded-[32px] space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
        <div className="text-4xl font-black font-display tracking-tight text-white">{value}</div>
        <div className={`text-xs font-bold uppercase tracking-widest ${positive ? 'text-green-500' : 'text-slate-600'}`}>
            {delta}
        </div>
    </div>
);
