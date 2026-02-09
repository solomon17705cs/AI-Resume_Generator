"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { ATSScoreGauge } from "@/components/dashboard/ATSScoreGauge";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { BulletEditor } from "@/components/editor/BulletEditor";
import { Preview } from "@/components/editor/Preview";
import {
    Zap,
    Download,
    Save,
    BrainCircuit,
    Target,
    Search,
    Sparkles,
    Plus,
    History,
    LayoutDashboard,
    Settings as SettingsIcon,
    ChevronRight,
    ShieldCheck,
    Wand2,
    ArrowLeft,
    Maximize2,
    Minimize2,
    X,
    GripVertical
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { SkillTagInput } from "@/components/editor/SkillTagInput";
import { ImpactHint } from "@/components/editor/ImpactHint";

export default function EditorPage() {
    const router = useRouter();
    const {
        resume, analysis, setAnalysis, updatePersonalInfo,
        updateExperience, addExperience, removeExperience, updateResume,
        githubLinked
    } = useResumeStore();

    const [activeTab, setActiveTab] = useState("personal");
    const [jobDescription, setJobDescription] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.5);
    const [previewWidth, setPreviewWidth] = useState(600);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydration check
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Auth Guard
    useEffect(() => {
        if (isHydrated && !githubLinked) {
            router.push("/login");
        }
    }, [isHydrated, githubLinked, router]);

    // Resizing Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            setPreviewWidth(Math.max(400, Math.min(newWidth, 1200))); // Min 400px, Max 1200px
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (!isHydrated) return null;

    const handleAnalyze = async () => {
        if (!jobDescription) return;
        setIsAnalyzing(true);
        try {
            // Create a plain text version for NLP
            const resumeText = JSON.stringify(resume);
            const response = await axios.post('/api/analyze', {
                resume_text: resumeText,
                job_description: jobDescription,
                jd_url: jobUrl
            });

            setAnalysis({
                overallScore: response.data.score,
                atsType: response.data.ats_type,
                atsProfile: response.data.ats_profile,
                sectionScores: { experience: 80, skills: 70, impact: 90 },
                keywords: {
                    found: response.data.found_keywords,
                    missing: response.data.missing_keywords
                },
                reasoning: response.data.reasoning,
                suggestions: response.data.suggestions.map((s: string, i: number) => ({
                    id: i.toString(),
                    type: i === 0 ? 'critical' : 'warning',
                    message: s
                })),
                forensics: response.data.match_forensics
            });
            router.push('/analysis');
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNeuralOptimize = async () => {
        if (!jobDescription) {
            alert("Please paste a Job Description first.");
            return;
        }

        setIsOptimizing(true);
        try {
            // Save current version to history first
            useResumeStore.getState().saveToHistory();

            const response = await axios.post('/api/optimize-full', {
                resume,
                jobDescription,
                jobUrl
            });

            if (response.data.success) {
                updateResume(response.data.optimizedResume);
                alert(`Engine Success: Resume optimized for ${response.data.atsType} profile.`);
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Neural Engine timed out.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const html = document.getElementById('resume-content-to-export')?.outerHTML;
            if (!html) return;
            const response = await axios.post('/api/export-pdf', { html }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resume.personalInfo.fullName.replace(" ", "_")}_Resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Export failed.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
            {/* SaaS Header */}
            <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-8 glass-dark z-50">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-all">
                            <Zap className="text-white fill-white" size={16} />
                        </div>
                        <span className="text-xl font-black font-display tracking-tighter">ATSense</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        Draft: <span className="text-blue-400">{resume.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-400 transition-all">
                        <Save size={14} /> Auto-saving...
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-black text-xs transition-all shadow-xl shadow-white/10"
                    >
                        <Download size={14} /> Export Document
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Intelligence Sidebar */}
                <aside className="w-[320px] shrink-0 border-r border-white/5 flex flex-col glass-dark overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-10">
                        {/* ATS Score Gauge */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ATS Alignment</h3>
                                <ShieldCheck className="text-blue-500" size={16} />
                            </div>
                            <div className="bg-blue-500/5 rounded-3xl border border-blue-500/10 p-2">
                                <ATSScoreGauge score={analysis?.overallScore || 0} />
                            </div>
                        </div>

                        {/* Sync Engine Terminal */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <BrainCircuit size={16} className="text-cyan-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Job Sync</h3>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    placeholder="Job URL (Detects ATS Profile)..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3 text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
                                />
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste Job Description here to sync insights..."
                                    className="w-full h-40 bg-slate-950 border border-white/5 rounded-3xl p-5 text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !jobDescription}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-blue-900/40 uppercase tracking-widest"
                            >
                                {isAnalyzing ? "Processing NLP..." : "Launch Analysis"}
                                <Search size={16} />
                            </button>
                            <button
                                onClick={handleNeuralOptimize}
                                disabled={isOptimizing || !jobDescription}
                                className="w-full py-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl font-black text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 uppercase tracking-widest"
                            >
                                {isOptimizing ? "Optimizing..." : "Neural Fix"}
                                <Wand2 size={16} />
                            </button>
                        </div>

                        {/* Reasoning Portal */}
                        {analysis && (
                            <ReasoningPanel
                                reasoning={analysis.reasoning}
                                suggestions={analysis.suggestions}
                                forensics={analysis.forensics as any}
                                keywords={[
                                    ...(analysis.keywords?.found || []).map(k => ({ text: k, found: true })),
                                    ...(analysis.keywords?.missing || []).map(k => ({ text: k, found: false }))
                                ]}
                            />
                        )}
                    </div>
                </aside>

                {/* Global Editor Form */}
                <main className="flex-1 flex flex-col bg-slate-900/20 relative">
                    <div className="flex px-8 h-12 items-center bg-slate-950/50 border-b border-white/5 shrink-0 gap-8 overflow-x-auto no-scrollbar">
                        {["personal", "summary", "experience", "projects", "skills", "education", "history"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[9px] font-black uppercase tracking-[0.2em] h-full border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600 hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="max-w-2xl mx-auto space-y-12 pb-40">
                            {activeTab === "personal" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Identify & Contact" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <InputField label="Full Name" value={resume.personalInfo.fullName} onChange={(v: string) => updatePersonalInfo({ fullName: v })} />
                                        <InputField label="Email Address" value={resume.personalInfo.email} onChange={(v: string) => updatePersonalInfo({ email: v.toLowerCase() })} />
                                        <InputField label="Phone" value={resume.personalInfo.phone} onChange={(v: string) => updatePersonalInfo({ phone: v })} />
                                        <InputField label="Location" value={resume.personalInfo.location} onChange={(v: string) => updatePersonalInfo({ location: v })} />
                                        <InputField label="LinkedIn" value={resume.personalInfo.linkedin} onChange={(v: string) => updatePersonalInfo({ linkedin: v })} />
                                        <InputField label="GitHub" value={resume.personalInfo.github} onChange={(v: string) => updatePersonalInfo({ github: v })} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "experience" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Professional History" onAdd={addExperience} />
                                    <ImpactHint />
                                    <div className="space-y-10">
                                        {resume.experience.map((exp) => (
                                            <div key={exp.id} className="glass-dark border border-white/5 rounded-[32px] p-8 space-y-6 relative group">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <InputField label="Organization" value={exp.company} onChange={(v: string) => updateExperience(exp.id, { company: v })} />
                                                    <InputField label="Role Title" value={exp.role} onChange={(v: string) => updateExperience(exp.id, { role: v })} />
                                                    <InputField label="Start Date" value={exp.startDate} onChange={(v: string) => updateExperience(exp.id, { startDate: v })} />
                                                    <InputField label="End Date" value={exp.endDate} onChange={(v: string) => updateExperience(exp.id, { endDate: v })} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                                        <span>Impact Statements</span>
                                                        {jobDescription && <span className="text-blue-500 flex items-center gap-1"><Sparkles size={10} /> AI Ready</span>}
                                                    </div>
                                                    {exp.bullets.map((bullet, bIdx) => (
                                                        <BulletEditor
                                                            key={bIdx}
                                                            value={bullet}
                                                            onChange={(v) => {
                                                                const newBullets = [...exp.bullets];
                                                                newBullets[bIdx] = v;
                                                                updateExperience(exp.id, { bullets: newBullets });
                                                            }}
                                                            jobDescription={jobDescription}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() => updateExperience(exp.id, { bullets: [...exp.bullets, ""] })}
                                                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 hover:text-blue-400"
                                                    >
                                                        + Add accomplishment
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "projects" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Technical Projects" onAdd={() => updateResume({ projects: [...resume.projects, { id: Math.random().toString(36).substr(2, 9), name: '', description: '', technologies: [], link: '', bullets: [''] }] })} />
                                    <ImpactHint />
                                    <div className="space-y-10">
                                        {resume.projects.map((proj) => (
                                            <div key={proj.id} className="glass-dark border border-white/5 rounded-[32px] p-8 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <InputField label="Project Name" value={proj.name} onChange={(v: string) => {
                                                        const updated = resume.projects.map(p => p.id === proj.id ? { ...p, name: v } : p);
                                                        updateResume({ projects: updated });
                                                    }} />
                                                    <InputField label="Live Link / Repo" value={proj.link} onChange={(v: string) => {
                                                        const updated = resume.projects.map(p => p.id === proj.id ? { ...p, link: v } : p);
                                                        updateResume({ projects: updated });
                                                    }} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Key Contributions</div>
                                                    {proj.bullets.map((bullet, bIdx) => (
                                                        <BulletEditor
                                                            key={bIdx}
                                                            value={bullet}
                                                            onChange={(v) => {
                                                                const newBullets = [...proj.bullets];
                                                                newBullets[bIdx] = v;
                                                                const updated = resume.projects.map(p => p.id === proj.id ? { ...p, bullets: newBullets } : p);
                                                                updateResume({ projects: updated });
                                                            }}
                                                            jobDescription={jobDescription}
                                                        />
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newBullets = [...proj.bullets, ""];
                                                            const updated = resume.projects.map(p => p.id === proj.id ? { ...p, bullets: newBullets } : p);
                                                            updateResume({ projects: updated });
                                                        }}
                                                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 hover:text-blue-400"
                                                    >
                                                        + Add impact bullet
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "summary" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Executive Summary" />
                                    <textarea
                                        value={resume.summary}
                                        onChange={(e) => updateResume({ summary: e.target.value })}
                                        className="w-full h-64 bg-slate-900 border border-white/5 rounded-[32px] p-8 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all font-medium leading-relaxed"
                                        placeholder="Tell your professional story..."
                                    />
                                </div>
                            )}

                            {activeTab === "skills" && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Skill Inventory" />
                                    {resume.skills.map((category) => (
                                        <SkillTagInput
                                            key={category.id}
                                            label={category.name}
                                            skills={category.skills}
                                            onChange={(newSkills) => {
                                                const updated = resume.skills.map(c =>
                                                    c.id === category.id ? { ...c, skills: newSkills } : c
                                                );
                                                updateResume({ skills: updated });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {activeTab === "education" && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Academic Foundation" />
                                    {resume.education.map((edu) => (
                                        <div key={edu.id} className="glass-dark border border-white/5 rounded-[32px] p-8 grid grid-cols-2 gap-6">
                                            <InputField label="Institution" value={edu.institution} onChange={(v: string) => {
                                                const updated = resume.education.map(e => e.id === edu.id ? { ...e, institution: v } : e);
                                                updateResume({ education: updated });
                                            }} />
                                            <InputField label="Degree / Field" value={edu.degree} onChange={(v: string) => {
                                                const updated = resume.education.map(e => e.id === edu.id ? { ...e, degree: v } : e);
                                                updateResume({ education: updated });
                                            }} />
                                            <InputField label="Location" value={edu.location} onChange={(v: string) => {
                                                const updated = resume.education.map(e => e.id === edu.id ? { ...e, location: v } : e);
                                                updateResume({ education: updated });
                                            }} />
                                            <InputField label="Graduation Date" value={edu.graduationDate} onChange={(v: string) => {
                                                const updated = resume.education.map(e => e.id === edu.id ? { ...e, graduationDate: v } : e);
                                                updateResume({ education: updated });
                                            }} />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => updateResume({ education: [...resume.education, { id: Math.random().toString(36).substr(2, 9), institution: '', degree: '', location: '', graduationDate: '' }] })}
                                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2"
                                    >
                                        + Add academic record
                                    </button>
                                </div>
                            )}

                            {activeTab === "history" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Version History" />
                                    <VersionHistory />
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Resizer Handle */}
                <div
                    className="w-1 hover:w-2 hover:bg-blue-600/50 bg-white/5 cursor-col-resize transition-all z-30 flex items-center justify-center group"
                    onMouseDown={() => setIsResizing(true)}
                >
                    <div className="h-8 w-1 bg-slate-600 rounded-full group-hover:bg-white transition-colors" />
                </div>

                {/* Live HD Preview Sidebar */}
                <aside
                    className="shrink-0 bg-[#020617] border-l border-white/5 flex flex-col relative transition-all duration-75"
                    style={{ width: `${previewWidth}px` }}
                >
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/80 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">HD Render Preview</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2">
                                <button onClick={() => setPreviewScale(Math.max(0.3, previewScale - 0.1))} className="w-8 h-8 text-slate-500 hover:text-white flex items-center justify-center">-</button>
                                <span className="text-[10px] font-mono text-slate-500 w-8 text-center">{Math.round(previewScale * 100)}%</span>
                                <button onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} className="w-8 h-8 text-slate-500 hover:text-white flex items-center justify-center">+</button>
                            </div>
                            <button
                                onClick={() => setIsFullScreen(true)}
                                className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Enter Full Screen"
                            >
                                <Maximize2 size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-12 bg-[#020617] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] flex justify-center custom-scrollbar">
                        <div
                            className="drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] h-fit mb-40 rounded-lg overflow-hidden border border-white/5 bg-white transition-all duration-200"
                            style={{
                                width: '210mm',
                                minWidth: '210mm',
                                height: '297mm',
                                minHeight: '297mm',
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top center'
                            }}
                        >
                            <Preview data={resume as any} scale={1} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Full-Screen Overlay Modal */}
            <AnimatePresence>
                {isFullScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                        onClick={() => setIsFullScreen(false)}
                    >
                        {/* Control Bar */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-slate-950/80 border-b border-white/5 flex items-center justify-between px-8 z-10">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Immersive Preview</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2">
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewScale(Math.max(0.3, previewScale - 0.1)); }} className="w-8 h-8 text-slate-500 hover:text-white flex items-center justify-center">-</button>
                                    <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{Math.round(previewScale * 100)}%</span>
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewScale(Math.min(1.5, previewScale + 0.1)); }} className="w-8 h-8 text-slate-500 hover:text-white flex items-center justify-center">+</button>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsFullScreen(false); }}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <X size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div
                            className="overflow-auto max-h-[calc(100vh-80px)] mt-16 p-12 custom-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="drop-shadow-[0_40px_120px_rgba(0,0,0,0.9)] rounded-lg overflow-hidden border border-white/10 bg-white"
                                style={{
                                    width: '210mm',
                                    height: '297mm',
                                    transform: `scale(${previewScale})`,
                                    transformOrigin: 'center center'
                                }}
                            >
                                <Preview data={resume as any} scale={1} />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
}

const SectionHeader = ({ title, onAdd }: { title: string, onAdd?: () => void }) => (
    <div className="flex justify-between items-center group">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-3xl font-black font-display tracking-tight text-white">{title}</h2>
        </div>
        {onAdd && (
            <button
                onClick={onAdd}
                className="px-5 py-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
                <Plus size={14} /> Add New Entry
            </button>
        )}
    </div>
);

const InputField = ({ label, value, onChange }: any) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-all font-medium"
        />
    </div>
);
