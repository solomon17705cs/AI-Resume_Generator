"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Github,
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Briefcase,
    Zap,
    LayoutDashboard,
    FileText,
    Target,
    Settings,
    ShieldCheck,
    Cpu,
    Calendar,
    Edit3
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const {
        githubLinked, githubUsername, githubAvatar, resume,
        updatePersonalInfo
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

    const info = resume.personalInfo;

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
                    <SidebarItem href="/analysis" icon={<Target size={18} />} label="Job Analyzer" />
                    <SidebarItem href="/profile" icon={<User size={18} />} label="Profile" active />
                </nav>

                <div className="pt-6 border-t border-white/5 space-y-2">
                    <SidebarItem href="#" icon={<Settings size={18} />} label="Settings" />
                    <SidebarItem href="#" icon={<User size={18} />} label="Profile" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <div className="absolute -bottom-12 left-12 flex items-end gap-6">
                            <div className="w-32 h-32 bg-slate-900 border-4 border-slate-950 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
                                {githubAvatar ? (
                                    <img src={githubAvatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-blue-500" />
                                )}
                            </div>
                            <div className="mb-14 space-y-1">
                                <h1 className="text-4xl font-black font-display tracking-tight text-white">{info.fullName || "Engineer Name"}</h1>
                                <p className="text-blue-200 font-bold text-sm tracking-widest uppercase">{resume.experience[0]?.role || "Software Engineer"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                        {/* Left Column: Essential Data */}
                        <div className="md:col-span-1 space-y-8">
                            <section className="p-8 glass-dark border border-white/5 rounded-[32px] space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-4">Connection Core</h3>
                                <div className="space-y-4">
                                    <ProfileMeta icon={<Mail size={16} />} label="Email" value={info.email} />
                                    <ProfileMeta icon={<Phone size={16} />} label="Phone" value={info.phone} />
                                    <ProfileMeta icon={<MapPin size={16} />} label="Location" value={info.location} />
                                    <ProfileMeta icon={<Github size={16} />} label="GitHub" value={githubUsername || info.github} highlight />
                                    <ProfileMeta icon={<Linkedin size={16} />} label="LinkedIn" value={info.linkedin} />
                                    <ProfileMeta icon={<Globe size={16} />} label="Portfolio" value={info.website} />
                                </div>
                            </section>

                            <section className="p-8 glass-dark border border-white/5 rounded-[32px] space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-4">Account Metadata</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Status</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Verified</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Age</span>
                                        <span className="text-xs font-bold text-slate-300">24 Years</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Education</span>
                                        <span className="text-[10px] font-bold text-slate-300 text-right">B.S. Computer Science</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase">Tier</span>
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Pro Engineer</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Professional Matrix */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Summary Matrix */}
                            <section className="p-10 glass-dark border border-white/5 rounded-[40px] space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={120} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-widest text-blue-500">Executive Summary</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">
                                    {resume.summary || "No profile summary defined. Update your resume to synchronize your executive profile."}
                                </p>
                            </section>

                            {/* Skills Graph */}
                            <section className="p-10 glass-dark border border-white/5 rounded-[40px] space-y-8">
                                <h3 className="text-lg font-black uppercase tracking-widest text-emerald-500">Technical Matrix</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {resume.skills.map((cat) => (
                                        <div key={cat.id} className="space-y-3">
                                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{cat.name}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-slate-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Career Timeline */}
                            <section className="p-10 glass-dark border border-white/5 rounded-[40px] space-y-8">
                                <h3 className="text-lg font-black uppercase tracking-widest text-indigo-500">Career Timeline</h3>
                                <div className="space-y-8">
                                    {resume.experience.map((exp) => (
                                        <div key={exp.id} className="relative pl-8 border-l border-white/5 space-y-2">
                                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white">{exp.role}</h4>
                                                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{exp.company}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <Calendar size={12} /> {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium">{exp.location}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
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

const ProfileMeta = ({ icon, label, value, highlight = false }: any) => (
    <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-wider">
            {icon}
            {label}
        </div>
        <div className={`text-sm font-bold truncate ${highlight ? 'text-blue-400' : 'text-slate-300'}`}>
            {value || "Not specified"}
        </div>
    </div>
);
