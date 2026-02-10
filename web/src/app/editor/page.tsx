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
    ShieldCheck,
    Wand2,
    ArrowLeft,
    Maximize2,
    Minimize2,
    X,
    GripVertical,
    Check,
    Github,
    Layers,
    ChevronDown,
    Trash2
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { SkillTagInput } from "@/components/editor/SkillTagInput";
import { ImpactHint } from "@/components/editor/ImpactHint";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default function EditorPage() {
    const router = useRouter();
    const {
        resume, analysis, setAnalysis, updatePersonalInfo,
        updateExperience, addExperience, removeExperience, removeProject, removeEducation, updateResume,
        githubLinked, jobDescription, jobUrl, setJobContext,
        syncLanguagesFromGitHub, syncProjectsFromGitHub, addSkillCategory, updateSkillCategoryName,
        removeSkillCategory, githubRepos
    } = useResumeStore();

    const [activeTab, setActiveTab] = useState("personal");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.5);
    const [previewWidth, setPreviewWidth] = useState(600);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Save Status Logic
    useEffect(() => {
        if (!isHydrated) return;
        setIsSaving(true);
        const timer = setTimeout(() => setIsSaving(false), 2000);
        return () => clearTimeout(timer);
    }, [resume, isHydrated]);

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
                keywordMetrics: response.data.keyword_metrics,
                reasoning: response.data.reasoning,
                suggestions: response.data.suggestions.map((s: any, i: number) => ({
                    ...s,
                    id: s.id || i.toString(),
                    type: s.type || (i === 0 ? 'critical' : 'warning'),
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

        const beforeScore = analysis?.overallScore || 0;
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
                const optimizedResume = response.data.optimizedResume;
                updateResume(optimizedResume);

                // Immediately trigger re-analysis to show improvement
                const resumeText = JSON.stringify(optimizedResume);
                const analysisRes = await axios.post('/api/analyze', {
                    resume_text: resumeText,
                    job_description: jobDescription,
                    jd_url: jobUrl
                });

                if (analysisRes.data) {
                    const afterScore = analysisRes.data.score;
                    setAnalysis({
                        overallScore: afterScore,
                        atsType: analysisRes.data.ats_type,
                        atsProfile: analysisRes.data.ats_profile,
                        sectionScores: { experience: 85, skills: 80, impact: 95 },
                        keywords: {
                            found: analysisRes.data.found_keywords,
                            missing: analysisRes.data.missing_keywords
                        },
                        keywordMetrics: analysisRes.data.keyword_metrics,
                        reasoning: analysisRes.data.reasoning,
                        suggestions: (analysisRes.data.suggestions || []).map((s: any, i: number) => ({
                            ...s,
                            id: s.id || i.toString(),
                            type: s.type || 'info',
                        })),
                        forensics: analysisRes.data.match_forensics
                    });

                    const improvement = (afterScore - beforeScore).toFixed(1);
                    alert(`🚀 Magic Fix Applied! \n\nScore improved from ${beforeScore}% to ${afterScore}% (+${improvement}% increase). \nYour resume is now optimized for ${response.data.atsType} systems.`);
                }
            }
        } catch (error: any) {
            console.error(error);
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
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-lg border border-white/5 group">
                        <span>Draft:</span>
                        <input
                            type="text"
                            value={resume.title}
                            onChange={(e) => updateResume({ title: e.target.value })}
                            className="bg-transparent border-none text-blue-400 focus:outline-none focus:ring-0 p-0 w-auto min-w-[50px] cursor-text"
                            onBlur={(e) => {
                                if (!e.target.value.trim()) {
                                    updateResume({ title: 'Untitled Resume' });
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${isSaving ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500 opacity-60'}`}>
                        {isSaving ? (
                            <>
                                <Save size={12} className="animate-pulse" />
                                <span>Auto-saving...</span>
                            </>
                        ) : (
                            <>
                                <Check size={12} className="text-emerald-500" />
                                <span>Saved</span>
                            </>
                        )}
                    </div>
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
                <aside className="w-[320px] shrink-0 border-r border-white/5 flex flex-col glass-dark h-full">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 flex flex-col">
                        {/* ATS Score Gauge */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ATS Alignment</h3>
                                <ShieldCheck className="text-blue-500" size={16} />
                            </div>
                            <div className="bg-blue-500/5 rounded-3xl border border-blue-500/10 p-2 relative overflow-hidden">
                                <ATSScoreGauge score={analysis?.overallScore || 0} />
                                {(isAnalyzing || isOptimizing) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] animate-pulse">
                                        <div className="text-[7px] font-black text-white uppercase tracking-[0.3em] bg-blue-600 px-2 py-1 rounded shadow-lg">Recalculating</div>
                                    </div>
                                )}
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
                                    onChange={(e) => setJobContext(jobDescription, e.target.value)}
                                    placeholder="Job URL (Detects ATS Profile)..."
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-3 text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
                                />
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobContext(e.target.value, jobUrl)}
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
                                className="w-full py-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl font-black text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 uppercase tracking-widest group shadow-lg shadow-indigo-500/5"
                            >
                                {isOptimizing ? "Engineering Magic..." : "Magic Optimization"}
                                <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                            </button>

                            <p className="text-[9px] text-slate-500 italic text-center px-4 leading-relaxed">
                                "We selectively apply AI to high-impact sections like summaries, experience bullets, and skills—ensuring ATS optimization without compromising factual integrity."
                            </p>
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
                                onRefreshSuggestion={(id) => {
                                    if (id === 'missing-keys' && (analysis.keywords?.missing?.length || 0) > 0) {
                                        const allMissing = analysis.keywords.missing;
                                        const shuffled = [...allMissing].sort(() => 0.5 - Math.random());
                                        const newKeywords = shuffled.slice(0, 2);

                                        setAnalysis({
                                            ...analysis,
                                            suggestions: analysis.suggestions.map(s =>
                                                s.id === 'missing-keys'
                                                    ? {
                                                        ...s,
                                                        examples: newKeywords.map(kw => ({
                                                            before: "Skilled in various technologies",
                                                            after: `Expertise in ${kw} and modular system design`
                                                        }))
                                                    }
                                                    : s
                                            )
                                        });
                                    } else if (id === 'density-low' && (analysis.keywords?.missing?.length || 0) > 0) {
                                        const allMissing = analysis.keywords.missing;
                                        const shuffled = [...allMissing].sort(() => 0.5 - Math.random());
                                        const newKeywords = shuffled.slice(0, 3);
                                        setAnalysis({
                                            ...analysis,
                                            suggestions: analysis.suggestions.map(s =>
                                                s.id === 'density-low'
                                                    ? {
                                                        ...s,
                                                        examples: newKeywords.map(kw => ({
                                                            before: "Handled project development",
                                                            after: `Led ${kw} implementation and maintenance, increasing efficiency by 15%`
                                                        }))
                                                    }
                                                    : s
                                            )
                                        });
                                    } else if (!isNaN(Number(id))) {
                                        setAnalysis({
                                            ...analysis,
                                            suggestions: [...analysis.suggestions].sort(() => 0.5 - Math.random())
                                        });
                                    }
                                }}
                                onApplySuggestion={async (ex) => {
                                    let newSummary = resume.summary;
                                    let newExperience = [...resume.experience];
                                    let newProjects = [...resume.projects];

                                    if (resume.summary.includes(ex.before)) {
                                        newSummary = resume.summary.replace(ex.before, ex.after);
                                    } else {
                                        newExperience = resume.experience.map(exp => ({
                                            ...exp,
                                            bullets: exp.bullets.map(b => b.includes(ex.before) ? b.replace(ex.before, ex.after) : b)
                                        }));
                                        newProjects = resume.projects.map(proj => ({
                                            ...proj,
                                            bullets: proj.bullets.map(b => b.includes(ex.before) ? b.replace(ex.before, ex.after) : b)
                                        }));
                                    }
                                    updateResume({ summary: newSummary, experience: newExperience, projects: newProjects });

                                    setIsAnalyzing(true);
                                    try {
                                        const response = await axios.post('/api/analyze', {
                                            resume_text: JSON.stringify({ ...resume, summary: newSummary, experience: newExperience, projects: newProjects }),
                                            job_description: jobDescription,
                                            jd_url: jobUrl
                                        });

                                        if (response.data) {
                                            setAnalysis({
                                                overallScore: response.data.score,
                                                atsType: response.data.ats_type,
                                                atsProfile: response.data.ats_profile,
                                                sectionScores: { experience: 80, skills: 70, impact: 90 },
                                                keywords: {
                                                    found: response.data.found_keywords,
                                                    missing: response.data.missing_keywords
                                                },
                                                keywordMetrics: response.data.keyword_metrics,
                                                reasoning: response.data.reasoning,
                                                suggestions: response.data.suggestions.map((s: any, i: number) => ({
                                                    ...s,
                                                    id: s.id || i.toString(),
                                                    type: s.type || (i === 0 ? 'critical' : 'warning'),
                                                })),
                                                forensics: response.data.match_forensics
                                            });
                                        }
                                    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
                                }}
                            />
                        )}
                    </div>

                    <div className="p-6 border-t border-white/5 bg-slate-950/20">
                        <LogoutButton />
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

                                    {/* AI Auto-Generation Section */}
                                    <div className="mt-12 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                                            <h3 className="text-2xl font-black font-display tracking-tight text-white">AI Auto-Generation</h3>
                                        </div>

                                        <div className="glass-dark border border-purple-500/20 rounded-[32px] p-8 space-y-6 bg-gradient-to-br from-purple-900/10 to-indigo-900/10">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                                                    <Sparkles className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="text-lg font-bold text-white">Build Full Resume Automatically</h4>
                                                    <p className="text-sm text-slate-400 leading-relaxed">
                                                        Generate a complete, ATS-optimized resume (80%+ score) using your GitHub projects, LinkedIn profile, and the job description. Powered by multi-signal ATS detection and schema-first AI generation.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    <span>GitHub Projects & Tech Stack</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span>LinkedIn Experience & Skills</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                    <span>Job Description Keywords</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                    <span>ATS-Specific Optimization</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    if (!jobDescription) {
                                                        alert("Please paste a Job Description first in the sidebar.");
                                                        return;
                                                    }

                                                    if (!resume.personalInfo.fullName) {
                                                        alert("Please enter your full name first.");
                                                        return;
                                                    }

                                                    setIsOptimizing(true);

                                                    try {
                                                        // Step 1: Detect ATS
                                                        const atsDetection = await axios.post('/api/ats-detect', {
                                                            url: jobUrl,
                                                            companyName: resume.experience[0]?.company,
                                                            region: resume.personalInfo.location
                                                        });

                                                        const atsType = atsDetection.data.ats.id;

                                                        // Step 2: Generate full resume with schema
                                                        const userProjects = Array.isArray(resume.projects) ? resume.projects : [];
                                                        const projectContext = (userProjects.length > 0 && userProjects.some(p => p.name?.trim() && p.description?.trim()))
                                                            ? userProjects
                                                            : (githubLinked && Array.isArray(githubRepos) && githubRepos.length > 0
                                                                ? githubRepos.slice(0, 5).map((repo: any) => ({
                                                                    name: repo.name || 'Technical Project',
                                                                    description: repo.description || 'Professional software development repository',
                                                                    technologies: Array.isArray(repo.languages) ? repo.languages.map((l: any) => l.name) : [],
                                                                    link: repo.html_url || '',
                                                                    bullets: []
                                                                }))
                                                                : userProjects);

                                                        console.log('🎯 [Build] Context built:', { projects: projectContext.length });

                                                        const response = await axios.post('/api/generate-resume', {
                                                            job_description: jobDescription,
                                                            user_data: {
                                                                name: resume.personalInfo.fullName,
                                                                current_role: resume.experience[0]?.role,
                                                                years_experience: resume.experience.length,
                                                                existing_experience: resume.experience,
                                                                existing_projects: projectContext,
                                                                existing_skills: resume.skills
                                                            },
                                                            ats_type: atsType || 'generic',
                                                            target_role: jobDescription.match(/(?:looking for|seeking|hiring)\s+(?:a\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)?.[1] || 'Software Engineer'
                                                        });

                                                        if (response.data.success) {
                                                            const generated = response.data.resume;

                                                            // Save current version to history
                                                            useResumeStore.getState().saveToHistory();

                                                            // Update resume with generated content
                                                            updateResume({
                                                                summary: generated.summary,
                                                                experience: generated.experience.map((exp: any, idx: number) => ({
                                                                    id: resume.experience[idx]?.id || Math.random().toString(36).substr(2, 9),
                                                                    company: exp.company,
                                                                    role: exp.title,
                                                                    startDate: exp.startDate,
                                                                    endDate: exp.endDate,
                                                                    bullets: exp.bullets
                                                                })),
                                                                projects: generated.projects.map((proj: any) => ({
                                                                    id: Math.random().toString(36).substr(2, 9),
                                                                    name: proj.name,
                                                                    description: proj.description,
                                                                    technologies: proj.technologies,
                                                                    link: proj.link,
                                                                    bullets: proj.bullets
                                                                })),
                                                                skills: generated.skills.map((cat: any) => ({
                                                                    id: Math.random().toString(36).substr(2, 9),
                                                                    name: cat.name,
                                                                    skills: cat.skills
                                                                }))
                                                            });

                                                            // Trigger analysis
                                                            const analysisRes = await axios.post('/api/analyze', {
                                                                resume_text: JSON.stringify(response.data.resume),
                                                                job_description: jobDescription,
                                                                jd_url: jobUrl
                                                            });

                                                            if (analysisRes.data) {
                                                                setAnalysis({
                                                                    overallScore: analysisRes.data.score,
                                                                    atsType: analysisRes.data.ats_type,
                                                                    atsProfile: analysisRes.data.ats_profile,
                                                                    sectionScores: { experience: 85, skills: 80, impact: 95 },
                                                                    keywords: {
                                                                        found: analysisRes.data.found_keywords,
                                                                        missing: analysisRes.data.missing_keywords
                                                                    },
                                                                    reasoning: analysisRes.data.reasoning,
                                                                    suggestions: analysisRes.data.suggestions.map((s: any, i: number) => ({
                                                                        ...s,
                                                                        id: s.id || i.toString(),
                                                                        type: s.type || 'info',
                                                                    })),
                                                                    forensics: analysisRes.data.match_forensics
                                                                });
                                                            }

                                                            const metrics = response.data.metadata.quality_metrics;
                                                            alert(`🚀 Full Resume Generated!

ATS Type: ${(atsType || 'generic').toUpperCase()}
Score: ${analysisRes.data.score}%
Quality Metrics:
- ${metrics.total_bullets} bullets (${metrics.bullets_with_metrics} with metrics)
- Avg bullet length: ${metrics.avg_bullet_length} words
- ${metrics.total_skills} skills extracted

Your resume is now optimized for ${atsType || 'generic'} systems!`);
                                                        }
                                                    } catch (error: any) {
                                                        console.error(error);
                                                        const detail = error.response?.data?.details || error.response?.data?.error || error.message;
                                                        alert(`Resume Transformation failed: ${detail}`);
                                                    } finally {
                                                        setIsOptimizing(false);
                                                    }
                                                }}
                                                disabled={isOptimizing || !jobDescription}
                                                className="w-full py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30 shadow-2xl shadow-purple-900/40 uppercase tracking-wider group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                                {isOptimizing ? "Building Your Resume..." : "🚀 Build Full Resume with AI"}
                                                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                            </button>

                                            <div className="text-[10px] text-slate-500 text-center space-y-1">
                                                <p className="font-medium">
                                                    ✅ No fake experience • ✅ Real data from GitHub & LinkedIn • ✅ Job-specific keywords • ✅ ATS-specific rules
                                                </p>
                                                <p className="italic">
                                                    "High ATS compatibility based on industry-standard parsing behavior"
                                                </p>
                                            </div>
                                        </div>
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
                                                <button
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove Experience"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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
                                                            onRemove={() => {
                                                                const newBullets = exp.bullets.filter((_, i) => i !== bIdx);
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
                                    <SectionHeader
                                        title="Technical Projects"
                                        onAdd={() => updateResume({ projects: [...resume.projects, { id: Math.random().toString(36).substr(2, 9), name: '', description: '', technologies: [], link: '', bullets: [''] }] })}
                                    >
                                        {githubLinked && (
                                            <button
                                                onClick={syncProjectsFromGitHub}
                                                className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500/50 transition-all group shadow-xl"
                                            >
                                                <Github size={16} className="group-hover:scale-110 transition-transform" />
                                                GitHub sync
                                            </button>
                                        )}
                                    </SectionHeader>
                                    <ImpactHint />
                                    <div className="space-y-10">
                                        {resume.projects.map((proj) => (
                                            <div key={proj.id} className="glass-dark border border-white/5 rounded-[32px] p-8 space-y-6 relative group">
                                                <button
                                                    onClick={() => removeProject(proj.id)}
                                                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove Project"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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
                                                            onRemove={() => {
                                                                const newBullets = proj.bullets.filter((_, i) => i !== bIdx);
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
                                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between">
                                            <SectionHeader title="Skill Inventory" />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={addSkillCategory}
                                                    className="flex items-center gap-3 px-6 py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest group shadow-lg shadow-blue-900/5"
                                                >
                                                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                                    Add Skill Category
                                                </button>
                                                {githubLinked && (
                                                    <button
                                                        onClick={syncLanguagesFromGitHub}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500/50 transition-all group"
                                                    >
                                                        <Github size={14} className="group-hover:scale-110 transition-transform" />
                                                        Sync from GitHub
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium max-w-md leading-relaxed px-2">
                                            Manage your technical stack and proficiencies. Pull your GitHub metadata or manually categorize your expertise.
                                        </p>

                                        <div className="grid grid-cols-1 gap-12">
                                            {resume.skills.map((category) => (
                                                <SkillTagInput
                                                    key={category.id}
                                                    label={category.name}
                                                    skills={category.skills}
                                                    onLabelChange={(newName) => updateSkillCategoryName(category.id, newName)}
                                                    onDelete={() => removeSkillCategory(category.id)}
                                                    onChange={(newSkills) => {
                                                        const updated = resume.skills.map(c =>
                                                            c.id === category.id ? { ...c, skills: newSkills } : c
                                                        );
                                                        updateResume({ skills: updated });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "education" && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                    <SectionHeader title="Academic Foundation" />
                                    {resume.education.map((edu) => (
                                        <div key={edu.id} className="glass-dark border border-white/5 rounded-[32px] p-8 grid grid-cols-2 gap-6 relative group">
                                            <button
                                                onClick={() => removeEducation(edu.id)}
                                                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Remove Education"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
                            className="drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] mb-40 rounded-lg border border-white/5 bg-white transition-all duration-200"
                            style={{
                                width: '210mm',
                                minWidth: '210mm',
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
                                className="drop-shadow-[0_40px_120px_rgba(0,0,0,0.9)] rounded-lg border border-white/10 bg-white"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
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

            <style dangerouslySetInnerHTML={{
                __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `
            }} />
        </div>
    );
}

const SectionHeader = ({ title, onAdd, children }: { title: string, onAdd?: () => void, children?: React.ReactNode }) => (
    <div className="flex justify-between items-end gap-8 group mb-2 w-full">
        <div className="space-y-1">
            <h2 className="text-4xl font-black font-display tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">{title}</h2>
            <div className="h-1 w-12 bg-blue-600 rounded-full group-hover:w-24 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
        </div>
        <div className="flex items-center gap-4">
            {children}
            {onAdd && (
                <button
                    onClick={onAdd}
                    className="px-6 py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group shadow-lg shadow-blue-900/10 whitespace-nowrap"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add New Entry
                </button>
            )}
        </div>
    </div>
);

const InputField = ({ label, value, onChange }: any) => (
    <div className="space-y-3 group/input">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 group-focus-within/input:text-blue-400 transition-colors">{label}</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all font-medium shadow-inner shadow-black/20"
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within/input:border-blue-500/20 group-focus-within/input:shadow-[0_0_20px_rgba(37,99,235,0.05)]" />
        </div>
    </div>
);
