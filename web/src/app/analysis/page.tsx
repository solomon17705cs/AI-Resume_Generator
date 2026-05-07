"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransformationDiff from '@/components/dashboard/TransformationDiff';
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
    Brain,
    Github,
    LinkedinIcon,
    Eye,
    Sparkles,
    Loader2,
    Wand2,
    ArrowRight,
    BarChart4,
    Compass,
    Type,
    Layout,
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ATSScoreGauge } from "@/components/dashboard/ATSScoreGauge";
import { ReasoningPanel } from "@/components/dashboard/ReasoningPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkillIntelligence } from "@/components/dashboard/SkillIntelligence";
import NeuralProgressOverlay from '@/components/dashboard/NeuralProgressOverlay';
import MagicFixPanel from '@/components/dashboard/MagicFixPanel';
import { JDArchitecturePanel } from '@/components/dashboard/JDArchitecturePanel';

const NEURAL_STEPS = [
    { name: "Keyword Injection", icon: <Cpu size={20} />, description: "Aligning technical tokens with JD semantic clusters." },
    { name: "Section Reordering", icon: <Layout size={20} />, description: "Optimizing structure for industry-standard ATS parsing." },
    { name: "Content Transformation", icon: <TrendingUp size={20} />, description: "Converting tasks into high-impact XYZ formulas." },
    { name: "Clarity Optimization", icon: <Type size={20} />, description: "Reducing verbosity and improving Flesch readability." },
    { name: "ATS Validation", icon: <ShieldCheck size={20} />, description: "Final integrity check against the target platform rules." }
];

import { Preview } from '@/components/editor/Preview';

export default function AnalysisPage() {
    const router = useRouter();
    const {
        githubLinked, analysis, resume, jobDescription, jobUrl,
        updateResume, setAnalysis, userRole
    } = useResumeStore();

    const [isFixing, setIsFixing] = useState(false);
    const [fixingStep, setFixingStep] = useState(0);
    const [transformationLog, setTransformationLog] = useState<{ before: string, after: string, step: string }[] | null>(null);
    const [isAnalyzingSuggestion, setIsAnalyzingSuggestion] = useState(false);
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

    const handleFixAll = async () => {
        if (!jobDescription || !analysis) return;

        const beforeScore = analysis.overallScore;
        const beforeSummary = resume.summary;

        setIsFixing(true);
        setFixingStep(0);
        setTransformationLog(null);

        try {
            // STEP 1-3 Simulation
            for (let i = 1; i <= 3; i++) {
                await new Promise(r => setTimeout(r, 800));
                setFixingStep(i);
            }

            // Actual Optimization Trigger with client-side timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

            const optRes = await axios.post('/api/optimize-full', {
                resume,
                jobDescription,
                jobUrl
            }, { signal: controller.signal });

            clearTimeout(timeoutId);

            if (optRes.data.success) {
                setFixingStep(4);
                const optimizedResume = optRes.data.optimizedResume;
                updateResume(optimizedResume);

                // Capture a representative change for the log
                const log = [
                    {
                        step: "Content Transformation",
                        before: beforeSummary.slice(0, 150) + "...",
                        after: optimizedResume.summary.slice(0, 150) + "..."
                    }
                ];

                if (optimizedResume.experience?.[0]?.bullets?.[0] && resume.experience?.[0]?.bullets?.[0]) {
                    log.push({
                        step: "XYZ Formula Injection",
                        before: resume.experience[0].bullets[0],
                        after: optimizedResume.experience[0].bullets[0]
                    });
                }

                setTransformationLog(log);

                await new Promise(r => setTimeout(r, 1000));
                setFixingStep(5);

                // 2. Re-Analyze
                const analysisRes = await axios.post('/api/analyze', {
                    resume_text: JSON.stringify(optimizedResume),
                    job_description: jobDescription,
                    jd_url: jobUrl
                });

                if (analysisRes.data) {
                    const afterScore = analysisRes.data.score;
                    setAnalysis({
                        overallScore: afterScore,
                        atsType: analysisRes.data.ats_type,
                        atsProfile: analysisRes.data.ats_profile,
                        sectionScores: analysisRes.data.section_scores || { experience: afterScore, skills: afterScore, impact: afterScore },
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

                    // Final wait for cinematic effect
                    await new Promise(r => setTimeout(r, 800));
                }
            }
        } catch (error: any) {
            console.error("Fix All failed", error);
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                alert("Optimization timed out. The model might be overloaded. Please try again.");
            } else {
                alert(`Optimization engine error: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setIsFixing(false);
            setFixingStep(0);
        }
    };

    const hasSkills = resume.skills.some(cat => cat.skills.length > 0);
    const isResumeEmpty = !resume.experience.length && !resume.projects.length && !hasSkills && !resume.summary;
    const currentAnalysis = analysis;

    if (!isHydrated) return null;

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            <NeuralProgressOverlay
                isVisible={isFixing}
                currentStep={fixingStep}
                steps={NEURAL_STEPS}
            />
            {/* Sidebar */}
            <Sidebar />

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

                    {isResumeEmpty ? (
                        <div className="p-20 glass-dark border border-white/5 rounded-[60px] text-center space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] -z-10 rounded-full" />
                            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-blue-500">
                                <Brain size={48} className="animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black font-display tracking-tight">Intelligence Core: Offline</h3>
                                <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                                    We cannot perform forensic matching without your technical data.
                                    Import your profile to begin the optimization process.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6">
                                <button
                                    onClick={() => window.location.href = '/api/auth/github'}
                                    className="flex items-center gap-3 px-10 py-5 bg-[#24292e] text-white rounded-[24px] font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95 border border-white/5"
                                >
                                    <Github size={20} /> Sync GitHub
                                </button>
                                <button
                                    onClick={() => window.location.href = '/api/auth/linkedin'}
                                    className="flex items-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-[24px] font-black text-sm hover:scale-105 transition-all shadow-xl active:scale-95"
                                >
                                    <LinkedinIcon size={20} /> Sync LinkedIn
                                </button>
                            </div>
                        </div>
                    ) : !currentAnalysis ? (
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
                            {/* Resume Preview */}
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <details className="group">
                                    <summary className="flex items-center gap-3 cursor-pointer list-none p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all">
                                        <Eye className="text-blue-400" size={20} />
                                        <span className="text-lg font-bold">Resume Preview</span>
                                        <span className="text-sm text-slate-500">(Click to expand)</span>
                                    </summary>
                                    <div className="mt-4 p-6 bg-slate-950/50 border border-white/5 rounded-[32px]">
                                        <Preview 
                                            data={resume} 
                                            scale={0.6} 
                                            jobDescription={jobDescription}
                                            isInteractive={false}
                                        />
                                    </div>
                                </details>
                            </div>

                            <MagicFixPanel
                                currentScore={currentAnalysis.overallScore}
                                isFixing={isFixing}
                                onFix={handleFixAll}
                                matchForensics={currentAnalysis.forensics}
                            />

                            <AnimatePresence>
                                {transformationLog && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="text-blue-500" />
                                            <h3 className="text-2xl font-bold">Transformation Intelligence</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {transformationLog.map((log, i) => (
                                                <TransformationDiff
                                                    key={i}
                                                    before={log.before}
                                                    after={log.after}
                                                    stepName={log.step}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Score Overview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 p-10 glass-dark border border-white/5 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                                    <div className="space-y-6 relative z-10 w-full md:w-auto">
                                        <div className="flex flex-wrap gap-3">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                <Zap size={12} /> Neural Match Active
                                            </div>
                                            {currentAnalysis.atsType && (
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    <ShieldCheck size={12} /> {currentAnalysis.atsType} Profile Detected
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black font-display tracking-tight mb-2">System Alignment</h3>
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                                                {currentAnalysis.atsProfile?.description || "Your resume has been measured against standard Big Tech hiring logic."}
                                            </p>
                                        </div>

                                        {currentAnalysis.atsProfile?.rules && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Rules</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentAnalysis.atsProfile.rules.map((rule: string, i: number) => (
                                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400">
                                                                {rule}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-48 h-48 scale-110 shrink-0 relative">
                                        <ATSScoreGauge score={currentAnalysis.overallScore} />
                                        {(isAnalyzingSuggestion || isFixing) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 rounded-full animate-pulse">
                                                <div className="text-[8px] font-black text-white uppercase tracking-[0.3em] bg-blue-600 px-2 py-1 rounded shadow-lg">Recalculating</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] text-white space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 text-center">Hybrid Match Breakdown</h4>
                                    <div className="space-y-5">
                                        <ForensicStat
                                            label="Keyword Match (40%)"
                                            value={currentAnalysis.forensics?.keyword_match ? (currentAnalysis.forensics.keyword_match * 0.4) : (currentAnalysis.overallScore * 0.4)}
                                        />
                                        <ForensicStat
                                            label="Section Compliance (30%)"
                                            value={currentAnalysis.forensics?.section_compliance ? (currentAnalysis.forensics.section_compliance * 0.3) : (currentAnalysis.overallScore * 0.3)}
                                        />
                                        <ForensicStat
                                            label="Semantic Relevance (20%)"
                                            value={currentAnalysis.forensics?.semantic_relevance ? (currentAnalysis.forensics.semantic_relevance * 0.2) : (currentAnalysis.overallScore * 0.2)}
                                        />
                                        <ForensicStat
                                            label="Clarity & Recency (10%)"
                                            value={currentAnalysis.forensics?.clarity_recency ? (currentAnalysis.forensics.clarity_recency * 0.1) : (currentAnalysis.overallScore * 0.1)}
                                        />
                                    </div>
                                    <p className="text-[9px] font-medium opacity-70 text-center leading-relaxed mt-4">
                                        Your score is calculated using our Multi-Layer Hybrid Algorithm, simulating modern ATS ranking logic.
                                    </p>
                                </div>
                            </div>

                            {/* Section breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard label="Experience Impact" score={currentAnalysis.sectionScores?.experience || 0} icon={<Cpu size={24} />} color="blue" />
                                <MetricCard label="Skill Alignment" score={currentAnalysis.sectionScores?.skills || 0} icon={<BarChart4 size={24} />} color="emerald" />
                                <MetricCard label="XYZ Formatting" score={currentAnalysis.sectionScores?.impact || 0} icon={<Settings size={24} />} color="indigo" />
                            </div>

                            {/* Role-First Intelligence Architecture */}
                            {currentAnalysis.jd_intelligence && (
                                <div className="animate-in fade-in slide-in-from-bottom-4">
                                    <JDArchitecturePanel intelligence={currentAnalysis.jd_intelligence} />
                                </div>
                            )}

                            {/* Strategic Intelligence & Engineering Inventory */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8 h-full">
                                    <div className="flex items-center gap-3">
                                        <Brain className="text-purple-500" />
                                        <h3 className="text-2xl font-bold font-display tracking-tight">Strategic Intelligence Report</h3>
                                    </div>
                                    <ReasoningPanel
                                        reasoning={currentAnalysis.reasoning}
                                        suggestions={currentAnalysis.suggestions}
                                        forensics={currentAnalysis.forensics}
                                        onRefreshSuggestion={(id) => {
                                            if (id === 'missing-keys' && (currentAnalysis.keywords?.missing?.length || 0) > 0) {
                                                const allMissing = currentAnalysis.keywords!.missing;
                                                const shuffled = [...allMissing].sort(() => 0.5 - Math.random());
                                                const newKeywords = shuffled.slice(0, 2);

                                                setAnalysis({
                                                    ...currentAnalysis,
                                                    suggestions: currentAnalysis.suggestions.map(s =>
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
                                            } else if (id === 'density-low' && (currentAnalysis.keywords?.missing?.length || 0) > 0) {
                                                const allMissing = currentAnalysis.keywords!.missing;
                                                const shuffled = [...allMissing].sort(() => 0.5 - Math.random());
                                                const newKeywords = shuffled.slice(0, 3);
                                                setAnalysis({
                                                    ...currentAnalysis,
                                                    suggestions: currentAnalysis.suggestions.map(s =>
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
                                                    ...currentAnalysis,
                                                    suggestions: [...currentAnalysis.suggestions].sort(() => 0.5 - Math.random())
                                                });
                                            }
                                        }}
                                        onApplySuggestion={async (ex) => {
                                            const { resume, updateResume } = useResumeStore.getState();
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

                                            setIsAnalyzingSuggestion(true);
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
                                                        sectionScores: response.data.section_scores || { experience: response.data.score, skills: response.data.score, impact: response.data.score },
                                                        keywords: {
                                                            found: response.data.found_keywords,
                                                            missing: response.data.missing_keywords
                                                        },
                                                        keywordMetrics: response.data.keyword_metrics,
                                                        reasoning: response.data.reasoning,
                                                        suggestions: (response.data.suggestions || []).map((s: any, i: number) => ({
                                                            ...s,
                                                            id: s.id || i.toString(),
                                                            type: s.type || 'info',
                                                        })),
                                                        forensics: response.data.match_forensics
                                                    });
                                                }
                                            } catch (err) { console.error(err); } finally { setIsAnalyzingSuggestion(false); }
                                        }}
                                    />
                                </div>

                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8 h-full">
                                    <SkillIntelligence />
                                </div>
                            </div>

                            {/* Keywords & Foundational Gaps */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold flex items-center gap-3">
                                            <AlertCircle className="text-yellow-500" />
                                            Keyword Gaps
                                        </h3>
                                        <div className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase rounded-full border border-red-500/20">
                                            Priority Optimization
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {currentAnalysis.keywordMetrics && currentAnalysis.keywordMetrics.filter(kw => !kw.found).length > 0 ? (
                                            currentAnalysis.keywordMetrics
                                                .filter(kw => !kw.found)
                                                .sort((a, b: any) => {
                                                    const order: any = { high: 0, medium: 1, low: 2 };
                                                    return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
                                                })
                                                .slice(0, 6)
                                                .map((kw, i) => (
                                                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-3 group hover:border-blue-500/30 transition-all">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${kw.priority === 'high' ? 'bg-red-500' : kw.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                                                <span className="text-xs font-black uppercase tracking-wider text-slate-200">{kw.text}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (kw.recommended_bullet) {
                                                                        const { resume, updateResume } = useResumeStore.getState();
                                                                        updateResume({
                                                                            experience: resume.experience.map((exp, idx) => idx === 0 ? { ...exp, bullets: [kw.recommended_bullet!, ...exp.bullets] } : exp)
                                                                        });
                                                                        // Real-time re-analysis
                                                                        setIsAnalyzingSuggestion(true);
                                                                        axios.post('/api/analyze', {
                                                                            resume_text: JSON.stringify(useResumeStore.getState().resume),
                                                                            job_description: jobDescription,
                                                                            jd_url: jobUrl
                                                                        }).then(res => res.data && setAnalysis({
                                                                            ...res.data,
                                                                            keywordMetrics: res.data.keyword_metrics,
                                                                            forensics: {
                                                                                ...res.data.match_forensics,
                                                                                keyword_density: res.data.match_forensics?.keyword_match // Placeholder mapping
                                                                            },
                                                                            atsType: res.data.ats_type,
                                                                            atsProfile: res.data.ats_profile,
                                                                            sectionScores: res.data.section_scores || { experience: res.data.score, skills: res.data.score, impact: res.data.score }
                                                                        })).finally(() => setIsAnalyzingSuggestion(false));
                                                                    }
                                                                }}
                                                                className="text-[8px] font-black uppercase tracking-[0.1em] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                                            >
                                                                Add to Resume <Wand2 size={10} />
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                                            "{kw.context}"
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-red-500/40" style={{ width: '0%' }} />
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-600 uppercase">0% Density</span>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-10 opacity-50">
                                                <CheckCircle2 className="mx-auto mb-2 text-emerald-500" />
                                                <p className="text-xs font-bold uppercase tracking-widest leading-loose">No critical gaps detected.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-10 glass-dark border border-white/5 rounded-[48px] space-y-8">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-500" />
                                            Verified Keywords
                                        </h3>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">
                                            Matching Signals
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {currentAnalysis.keywordMetrics && currentAnalysis.keywordMetrics.filter(kw => kw.found).length > 0 ? (
                                            currentAnalysis.keywordMetrics
                                                .filter(kw => kw.found)
                                                .sort((a, b) => b.count_in_resume - a.count_in_resume)
                                                .slice(0, 6)
                                                .map((kw, i) => (
                                                    <div key={i} className="p-5 bg-white/5 border border-emerald-500/5 rounded-3xl space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                <span className="text-xs font-black uppercase tracking-wider text-slate-200">{kw.text}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{kw.count_in_resume}x Detected</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${kw.count_in_resume >= 2 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                                                    style={{ width: `${Math.min(kw.count_in_resume * 33, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase">
                                                                {kw.count_in_resume >= 2 ? 'Optimal' : 'Low Density'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-10 opacity-50">
                                                <Target className="mx-auto mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-widest leading-loose">Search results empty.</p>
                                            </div>
                                        )}
                                    </div>
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


const ForensicStat = ({ label, value }: any) => {
    const clampedValue = Math.min(value, 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span>{label}</span>
                <span>{clampedValue.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedValue}%` }}
                    className="h-full bg-white rounded-full"
                />
            </div>
        </div>
    );
};

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
