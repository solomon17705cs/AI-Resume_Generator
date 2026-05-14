"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    FileText,
    LayoutDashboard,
    User,
    Settings,
    Briefcase,
    Target,
    Send,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    ShieldCheck,
    Sparkles,
    ChevronRight,
    Search,
    ShieldAlert,
    Wand2,
    ExternalLink,
    Compass,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { RecommendationRequest } from "@/types/resume";
import axios from "axios";
import { generateLetterHTML } from "@/utils/letterTemplate";

export default function RecommendationPage() {
    const router = useRouter();
    const {
        recommendationRequests,
        requestRecommendation,
        updateRecommendationStatus,
        userRole,
        resume
    } = useResumeStore();

    const [isHydrated, setIsHydrated] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [purpose, setPurpose] = useState<'Internship' | 'Job'>('Internship');
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExportPDF = async (req: RecommendationRequest) => {
        if (!req.letterContent) return;

        setIsExporting(req.id);
        try {
            const html = generateLetterHTML(
                req.letterContent,
                req.studentName,
                req.company,
                new Date(req.createdAt).toLocaleDateString()
            );

            const res = await axios.post('/api/export-pdf', { html }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Recommendation_${req.studentName}_${req.company}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsExporting(null);
        }
    };

    // Admin Review States
    const [reviewingReq, setReviewingReq] = useState<RecommendationRequest | null>(null);
    const [adminLetter, setAdminLetter] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Generation Parameters
    const [genParams, setGenParams] = useState({
        recommenderName: '',
        recommenderTitle: '',
        recommenderOrg: '',
        recommenderEmail: '',
        relationshipType: 'manager',
        relationshipDuration: '',
        howTheyKnow: '',
        targetRole: '',
        jobDescription: '',
        personalityTraits: [] as string[],
        purpose: 'fulltime' as 'fulltime' | 'internship' | 'masters' | 'phd' | 'scholarship' | 'promotion',
        tone: 'professional' as 'formal' | 'warm' | 'professional',
        specificAchievements: [] as string[]
    });

    const [achievementInput, setAchievementInput] = useState("");
    const [traitInput, setTraitInput] = useState("");

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Redirect if not logged in
    useEffect(() => {
        if (isHydrated && !userRole) {
            router.push("/login");
        }
    }, [isHydrated, userRole, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        requestRecommendation({
            purpose,
            company,
            message
        });

        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setShowForm(false);
                setCompany('');
                setMessage('');
            }, 2000);
        }, 1500);
    };

    const handleGenerateAI = async () => {
        if (!reviewingReq) return;
        setIsGenerating(true);
        try {
            const res = await axios.post('/api/generate-recommendation', {
                candidateName: reviewingReq.studentName,
                candidateEmail: reviewingReq.studentEmail,
                recommenderName: genParams.recommenderName,
                recommenderTitle: genParams.recommenderTitle,
                recommenderOrg: genParams.recommenderOrg,
                recommenderEmail: genParams.recommenderEmail,
                relationshipType: genParams.relationshipType,
                relationshipDuration: genParams.relationshipDuration,
                howTheyKnow: genParams.howTheyKnow,
                targetCompany: reviewingReq.company,
                targetRole: genParams.targetRole || (reviewingReq.purpose === 'Internship' ? 'Software Engineering Intern' : 'Software Engineer'),
                purpose: genParams.purpose || reviewingReq.purpose.toLowerCase(),
                resumeData: resume,
                jobDescription: genParams.jobDescription,
                specificAchievements: genParams.specificAchievements,
                personalityTraits: genParams.personalityTraits,
                tone: genParams.tone
            });
            if (res.data.success) {
                setAdminLetter(res.data.letter);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data?.details || "AI Generation failed. Check your API keys and server connection.";
            alert(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveFinal = () => {
        if (!reviewingReq || !adminLetter) {
            alert("Please provide the recommendation letter content.");
            return;
        }
        updateRecommendationStatus(reviewingReq.id, 'Approved', adminLetter);
        setReviewingReq(null);
        setAdminLetter("");
        setGenParams({
            recommenderName: '',
            recommenderTitle: '',
            recommenderOrg: '',
            recommenderEmail: '',
            relationshipType: 'manager',
            relationshipDuration: '',
            howTheyKnow: '',
            targetRole: '',
            personalityTraits: [],
            tone: 'professional',
            specificAchievements: []
        });
    };

    const isAdmin = userRole === 'admin';

    if (!isHydrated) return null;

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            {/* SaaS Sidebar */}
            <Sidebar isAdmin={isAdmin} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <header className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black font-display tracking-tight flex items-center gap-4">
                                {isAdmin ? 'Review Desk' : 'Recommendation Cloud'}
                                <span className={`px-3 py-1 border rounded-full text-[10px] uppercase tracking-widest ${isAdmin ? 'bg-red-600/10 border-red-500/20 text-red-400' : 'bg-blue-600/10 border-blue-500/20 text-blue-400'}`}>
                                    {isAdmin ? 'System Admin' : 'Human-Verified'}
                                </span>
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                {isAdmin ? 'Authorize high-credibility referrals for waiting students.' : 'Request high-credibility referrals for internship and job opportunities.'}
                            </p>
                        </div>

                        {!isAdmin && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-8 py-3.5 bg-white text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95"
                            >
                                <Send size={18} /> Request Recommendation
                            </button>
                        )}
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Information Panel */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="glass-dark border border-white/5 rounded-[40px] p-8 space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{isAdmin ? 'Review Workflow' : 'How it works'}</h3>
                                <div className="space-y-6">
                                    <ProcessStep
                                        num="01"
                                        title={isAdmin ? "Incoming Requests" : "Submit Intent"}
                                        desc={isAdmin ? "Monitor new intents from potential candidates." : "Enter the company and why you need the recommendation."}
                                        done={recommendationRequests.length > 0}
                                    />
                                    <ProcessStep
                                        num="02"
                                        title="Letter Generation"
                                        desc={isAdmin ? "Craft a verified letter manually or with AI assistance." : "Our team verifies your profile and resume alignment."}
                                    />
                                    <ProcessStep
                                        num="03"
                                        title="Status Assignment"
                                        desc="Mark as 'Approved' to unlock AI generation."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Request Management/History (Right Panel) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                                    {isAdmin ? 'Active Queue' : 'Your Request History'}
                                </h2>
                                <span className="text-[10px] font-bold text-slate-600">{recommendationRequests.length} Total</span>
                            </div>

                            {recommendationRequests.length === 0 ? (
                                <div className="py-32 glass-dark border border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600">
                                        <Search size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">No {isAdmin ? 'pending tasks' : 'requests'} found</h3>
                                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                            {isAdmin ? 'The queue is currently empty. Great job!' : "You haven't requested any recommendations yet."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recommendationRequests.map((req) => (
                                        <div key={req.id} className="p-6 bg-slate-900 border border-white/5 rounded-[32px] group hover:border-slate-700 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {req.status === 'Approved' ? <CheckCircle2 size={24} /> :
                                                            req.status === 'Rejected' ? <XCircle size={24} /> :
                                                                <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {isAdmin ? (
                                                                <Link
                                                                    href={`/recommendations/review/${req.id}`}
                                                                    className="font-bold text-lg text-white hover:text-blue-500 transition-colors flex items-center gap-2 group"
                                                                >
                                                                    {req.studentName}
                                                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                                </Link>
                                                            ) : (
                                                                <h3 className="font-bold text-lg text-white">{req.company}</h3>
                                                            )}
                                                            {req.isJobReferred && (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black uppercase text-emerald-500">
                                                                    Job Referred ✔
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium capitalize">
                                                            {req.purpose} @ {req.company} • {new Date(req.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={req.status} />
                                                </div>
                                            </div>

                                            {isAdmin && req.status === 'Pending' && (
                                                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                                                    <button
                                                        onClick={() => setReviewingReq(req)}
                                                        className="flex-1 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                                                    >
                                                        Review & Approve <ArrowRight size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateRecommendationStatus(req.id, 'Rejected')}
                                                        className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {req.status === 'Approved' && req.letterContent && (
                                                <div className="mt-6 p-6 bg-slate-950/50 rounded-2xl border border-white/5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Letter Data</span>
                                                        <button
                                                            disabled={isExporting === req.id}
                                                            onClick={() => handleExportPDF(req)}
                                                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 disabled:opacity-50"
                                                        >
                                                            {isExporting === req.id ? 'Generating...' : 'Download PDF'}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-400 italic leading-relaxed whitespace-pre-wrap">
                                                        {req.letterContent}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendation Request Modal (Student View) */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowForm(false)}
                                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
                            >
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black font-display tracking-tight">Request Recommendation</h2>
                                            <p className="text-xs text-slate-500 font-medium">Step 2: Confirm Intent & Purpose</p>
                                        </div>
                                        <button onClick={() => setShowForm(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <XCircle size={24} />
                                        </button>
                                    </div>

                                    {!isSuccess ? (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Purpose</label>
                                                    <div className="flex gap-2">
                                                        {(['Internship', 'Job'] as const).map((p) => (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => setPurpose(p)}
                                                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${purpose === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 text-slate-500 border border-white/5'
                                                                    }`}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Company</label>
                                                    <div className="relative">
                                                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={company}
                                                            onChange={(e) => setCompany(e.target.value)}
                                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
                                                            placeholder="Google, Tesla..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Message to Admin (Optional)</label>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    className="w-full h-32 bg-slate-950 border border-white/5 rounded-3xl p-5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all resize-none leading-relaxed"
                                                    placeholder="Briefly explain why you're a good fit for this referral..."
                                                />
                                            </div>

                                            <button
                                                disabled={isSubmitting || !company}
                                                className="w-full py-5 bg-white text-slate-950 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? "Submitting Intent..." : "Submit Recommendation Request"}
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="w-20 h-20 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black">Request Submitted!</h3>
                                                <p className="text-sm text-slate-500 max-w-xs mx-auto">Admin notification sent to gmail. You'll be notified once your status changes to 'Job Referred'.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Admin Review Modal */}
                <AnimatePresence>
                    {reviewingReq && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setReviewingReq(null)}
                                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black font-display tracking-tight flex items-center gap-3">
                                                Reviewing: <span className="text-blue-500">{reviewingReq.studentName}</span>
                                            </h2>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Target: {reviewingReq.company} ({reviewingReq.purpose})</p>
                                        </div>
                                        <button onClick={() => setReviewingReq(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <XCircle size={32} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* AI Assistance Panel */}
                                        <div className="space-y-6">
                                            <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[32px] space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                                                <div className="flex items-center gap-3">
                                                    <Wand2 className="text-blue-500" size={20} />
                                                    <h3 className="text-sm font-black uppercase tracking-widest">AI Letter Agent</h3>
                                                </div>
                                                
                                                {/* Recommender Info Section */}
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recommender Identity</h4>
                                                        <select 
                                                            value={genParams.purpose}
                                                            onChange={(e) => setGenParams({...genParams, purpose: e.target.value as any})}
                                                            className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[9px] font-black uppercase text-emerald-400"
                                                        >
                                                            <option value="fulltime">Full-Time Job</option>
                                                            <option value="internship">Internship</option>
                                                            <option value="masters">Masters Program</option>
                                                            <option value="phd">PhD Program</option>
                                                            <option value="scholarship">Scholarship</option>
                                                            <option value="promotion">Promotion</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Full Name"
                                                            value={genParams.recommenderName}
                                                            onChange={(e) => setGenParams({...genParams, recommenderName: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Current Title"
                                                            value={genParams.recommenderTitle}
                                                            onChange={(e) => setGenParams({...genParams, recommenderTitle: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Organization"
                                                            value={genParams.recommenderOrg}
                                                            onChange={(e) => setGenParams({...genParams, recommenderOrg: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                        <input 
                                                            type="email" 
                                                            placeholder="Email (Optional)"
                                                            value={genParams.recommenderEmail}
                                                            onChange={(e) => setGenParams({...genParams, recommenderEmail: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Target Details Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Role & Requirements</h4>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Exact Target Role (e.g. Senior Backend Engineer)"
                                                        value={genParams.targetRole}
                                                        onChange={(e) => setGenParams({...genParams, targetRole: e.target.value})}
                                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                    />
                                                    <textarea
                                                        value={genParams.jobDescription}
                                                        onChange={(e) => setGenParams({...genParams, jobDescription: e.target.value})}
                                                        className="w-full h-32 bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none leading-relaxed"
                                                        placeholder="Paste Job Description / Program Details here (Optional - for keyword alignment)"
                                                    />
                                                </div>

                                                {/* Context Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Relationship Context</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <select 
                                                            value={genParams.relationshipType}
                                                            onChange={(e) => setGenParams({...genParams, relationshipType: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        >
                                                            <option value="manager">Manager</option>
                                                            <option value="professor">Professor</option>
                                                            <option value="colleague">Colleague</option>
                                                            <option value="mentor">Mentor</option>
                                                            <option value="internship_supervisor">Internship Supervisor</option>
                                                        </select>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Duration (e.g. 2 years)"
                                                            value={genParams.relationshipDuration}
                                                            onChange={(e) => setGenParams({...genParams, relationshipDuration: e.target.value})}
                                                            className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={genParams.howTheyKnow}
                                                        onChange={(e) => setGenParams({...genParams, howTheyKnow: e.target.value})}
                                                        className="w-full h-20 bg-slate-950 border border-white/5 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none leading-relaxed"
                                                        placeholder="Specific context (e.g. 'supervised during final year project')"
                                                    />
                                                </div>



                                                {/* Achievements Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Key Achievements / Observations</h4>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. Delivered 20% performance boost in Q3"
                                                            value={achievementInput}
                                                            onChange={(e) => setAchievementInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && achievementInput) {
                                                                    setGenParams({...genParams, specificAchievements: [...genParams.specificAchievements, achievementInput]});
                                                                    setAchievementInput("");
                                                                }
                                                            }}
                                                            className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        {genParams.specificAchievements.map((a, idx) => (
                                                            <div key={idx} className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 border border-white/10 flex justify-between items-center group">
                                                                <span className="leading-relaxed">{a}</span>
                                                                <button onClick={() => setGenParams({...genParams, specificAchievements: genParams.specificAchievements.filter((_, i) => i !== idx)})} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Personality & Traits */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Traits & Tone</h4>
                                                        <select 
                                                            value={genParams.tone}
                                                            onChange={(e) => setGenParams({...genParams, tone: e.target.value as any})}
                                                            className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[9px] font-black uppercase text-blue-400"
                                                        >
                                                            <option value="formal">Formal</option>
                                                            <option value="professional">Professional</option>
                                                            <option value="warm">Warm</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Add trait (e.g. Curiosity)"
                                                            value={traitInput}
                                                            onChange={(e) => setTraitInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && traitInput) {
                                                                    setGenParams({...genParams, personalityTraits: [...genParams.personalityTraits, traitInput]});
                                                                    setTraitInput("");
                                                                }
                                                            }}
                                                            className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {genParams.personalityTraits.map((t, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-white/5 rounded-lg text-[9px] text-slate-400 border border-white/10 flex items-center gap-2">
                                                                {t} <button onClick={() => setGenParams({...genParams, personalityTraits: genParams.personalityTraits.filter((_, i) => i !== idx)})} className="hover:text-red-500">×</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleGenerateAI}
                                                    disabled={isGenerating || !genParams.recommenderName}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-blue-500 transition-all disabled:opacity-50"
                                                >
                                                    {isGenerating ? "Consulting AI..." : "Generate Neural Letter"}
                                                    <Sparkles size={16} />
                                                </button>
                                            </div>

                                            <div className="p-8 bg-slate-950/50 border border-white/5 rounded-[32px] space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student's Message</h4>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                    "{reviewingReq.message || "No specific message provided by the student."}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Final Letter Output */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                                    <FileText size={18} /> Recommendation Letter
                                                </h3>
                                                <div className="text-[9px] font-black text-slate-600 uppercase">Verification Level: 100%</div>
                                            </div>
                                            <textarea
                                                value={adminLetter}
                                                onChange={(e) => setAdminLetter(e.target.value)}
                                                className="w-full h-[600px] bg-slate-950 border border-white/5 rounded-[32px] p-8 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed font-sans custom-scrollbar"
                                                placeholder="Finalize your recommendation letter here..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 border-t border-white/5 bg-slate-950/50 flex justify-end gap-6">
                                    <button
                                        onClick={() => setReviewingReq(null)}
                                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white"
                                    >
                                        Cancel Review
                                    </button>
                                    <button
                                        onClick={handleApproveFinal}
                                        disabled={!adminLetter}
                                        className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:grayscale"
                                    >
                                        Authorized & Approve
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}


const ProcessStep = ({ num, title, desc, done = false }: any) => (
    <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-all ${done ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
            {done ? <CheckCircle2 size={16} /> : num}
        </div>
        <div>
            <h4 className={`text-sm font-bold mb-0.5 ${done ? 'text-white' : 'text-slate-300'}`}>{title}</h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Approved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[status]}`}>
            {status}
        </span>
    );
}
