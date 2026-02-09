"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Clock,
    Zap,
    LayoutDashboard,
    Settings,
    User,
    ChevronRight,
    Search,
    Target,
    Briefcase,
    Plus,
    Trash2,
    Calendar,
    ArrowRight,
    ShieldCheck,
    Compass
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default function MyResumesPage() {
    const router = useRouter();
    const {
        githubLinked, githubUsername, history,
        restoreFromHistory, resume, userRole
    } = useResumeStore();

    const [isHydrated, setIsHydrated] = useState(false);

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

    if (!isHydrated) return null;

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* Sidebar */}
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
                        <SidebarItem href="/resumes" icon={<FileText size={18} />} label="My Resumes" active />
                        <SidebarItem href="/analysis" icon={<Target size={18} />} label="Job Analyzer" />
                        <SidebarItem href="/jobs" icon={<Compass size={18} />} label="Pathfinder" />
                        <SidebarItem href="/recommendations" icon={<ShieldCheck size={18} />} label="Recommendations" />
                        <SidebarItem href="/profile" icon={<User size={18} />} label="Profile" />
                        <div className="h-px bg-white/5 my-4" />
                        <SidebarItem href="#" icon={<Settings size={18} />} label="Settings" />
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
                        <div>
                            <h1 className="text-4xl font-black font-display tracking-tight mb-2">My Resumes</h1>
                            <p className="text-slate-500 text-sm font-medium">Manage and optimize your professional variants.</p>
                        </div>
                        <Link href="/editor" className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95">
                            <Plus size={18} strokeWidth={3} /> New Variant
                        </Link>
                    </header>

                    {/* Active Resume */}
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Current Draft</h2>
                        <div className="p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-[40px] flex items-center justify-between group">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-24 bg-white rounded-xl shadow-2xl flex flex-col p-3 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-full h-2 bg-slate-100 rounded-sm mb-2" />
                                    <div className="w-2/3 h-1 bg-slate-50 rounded-sm mb-1" />
                                    <div className="w-full h-1 bg-slate-50 rounded-sm mb-4" />
                                    <div className="w-full h-1 bg-slate-50 rounded-sm mb-1" />
                                    <div className="w-full h-1 bg-slate-50 rounded-sm mb-1" />
                                    <div className="w-3/4 h-1 bg-slate-50 rounded-sm" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">{resume.title || "Untitled Resume"}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Last edited {new Date().toLocaleDateString()}</span>
                                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                        <span className="flex items-center gap-1.5 text-blue-400"><Target size={14} /> {resume.metadata.atsScore || 0}% Match Score</span>
                                    </div>
                                </div>
                            </div>
                            <Link href="/editor" className="px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all">
                                Continue Engineering <ArrowRight size={18} />
                            </Link>
                        </div>
                    </section>

                    {/* History */}
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Version History</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {history.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-white/5 rounded-[40px] text-center space-y-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                                        <Clock size={24} />
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No previous versions found.</p>
                                </div>
                            ) : (
                                history.map((hist, idx) => (
                                    <div key={idx} className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-slate-900 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{hist.title || "Resume Snapshot"}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{new Date(hist.lastModified).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => restoreFromHistory(hist.id)}
                                                className="px-5 py-2.5 bg-white/5 text-slate-300 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                                            >
                                                Restore
                                            </button>
                                            <button className="p-2.5 text-slate-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
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

const SidebarItem = ({ icon, label, active = false, href }: any) => (
    <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
        {icon}
        {label}
    </Link>
);
