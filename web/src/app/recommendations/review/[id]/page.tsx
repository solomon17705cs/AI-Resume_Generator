"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";
import {
    Github,
    Linkedin,
    Mail,
    Globe,
    ChevronLeft,
    ExternalLink,
    Briefcase,
    GraduationCap,
    Code2,
    ShieldCheck,
    Calendar,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StudentReviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { recommendationRequests, userRole } = useResumeStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Auth Guard & Role Check
    useEffect(() => {
        if (isHydrated) {
            if (!userRole) {
                router.push("/login");
            } else if (userRole !== 'admin') {
                router.push("/dashboard");
            }
        }
    }, [isHydrated, userRole, router]);

    if (!isHydrated) return null;

    const request = recommendationRequests.find(r => r.id === id);
    const profile = request?.studentProfile;

    if (!request || !profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">System Error</div>
                <h1 className="text-white text-3xl font-black">Request Not Found</h1>
                <Link href="/recommendations" className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-sm">
                    Back to Review Desk
                </Link>
            </div>
        );
    }

    const info = profile.personalInfo;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
            {/* Header / Navigation */}
            <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 py-4 px-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft size={18} /> Back to Desk
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-red-600/10 border border-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Admin Verification Mode
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto mt-12 px-6 space-y-12">
                {/* Profile Brief */}
                <section className="relative p-10 glass-dark border border-white/5 rounded-[48px] overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <ShieldCheck size={160} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                        <div className="w-32 h-32 bg-slate-900 border-4 border-white/5 rounded-[32px] flex items-center justify-center text-blue-500 shadow-2xl">
                            <span className="text-4xl font-black">{info.fullName?.[0]}</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-5xl font-black font-display tracking-tight text-white">{info.fullName}</h1>
                                <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs mt-2">{profile.metadata?.targetRole || "Senior Candidate"}</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <SocialLink icon={<Github size={16} />} label="GitHub" href={info.github} />
                                <SocialLink icon={<Linkedin size={16} />} label="LinkedIn" href={info.linkedin} />
                                <SocialLink icon={<Mail size={16} />} label="Email" href={`mailto:${info.email}`} />
                                {info.website && <SocialLink icon={<Globe size={16} />} label="Portfolio" href={info.website} />}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Experience Timeline */}
                    <section className="space-y-6">
                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                            <Briefcase size={16} /> Professional History
                        </h3>
                        <div className="space-y-4">
                            {profile.experience.map((exp) => (
                                <div key={exp.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white uppercase text-xs tracking-wider">{exp.role}</h4>
                                            <p className="text-[10px] font-black text-blue-500 uppercase">{exp.company}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                            <Calendar size={12} /> {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                                        </div>
                                    </div>
                                    <ul className="space-y-1 pt-2">
                                        {exp.bullets.map((b, i) => (
                                            <li key={i} className="text-[10px] text-slate-400 leading-relaxed">• {b}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills & Education */}
                    <div className="space-y-8">
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                                <Code2 size={16} /> Technical Assets
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((cat) => (
                                    cat.skills.map((s, i) => (
                                        <span key={`${cat.id}-${i}`} className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none">
                                            {s}
                                        </span>
                                    ))
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">
                                <GraduationCap size={18} /> Education
                            </h3>
                            {profile.education.map((edu) => (
                                <div key={edu.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-1">
                                    <h4 className="font-bold text-white text-xs">{edu.institution}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{edu.degree}</p>
                                    <div className="pt-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">{edu.graduationDate}</div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>

                {/* Final Action CTA */}
                <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-xl font-black">Ready to verify?</h4>
                        <p className="text-sm text-slate-500">You have reviewed all technical data for this candidate.</p>
                    </div>
                    <Link
                        href="/recommendations"
                        className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-blue-500/20"
                    >
                        Back to Approval <ArrowRight size={18} />
                    </Link>
                </div>
            </main>
        </div>
    );
}

const SocialLink = ({ icon, label, href }: any) => (
    <a
        href={href?.startsWith('http') ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
    >
        {icon}
        {label}
        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
    </a>
);
