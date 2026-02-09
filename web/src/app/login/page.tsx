"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Zap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const handleGitHubLogin = () => {
        window.location.href = "/api/auth/github";
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-dark border border-white/5 rounded-[48px] p-12 text-center space-y-10 shadow-2xl relative"
            >
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                            <Zap className="text-white fill-white" size={32} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black font-display tracking-tight text-white">ATSense AI</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Engineer your professional trajectory with precision AI. Connect your identity to begin.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGitHubLogin}
                        className="w-full flex items-center justify-center gap-4 py-5 bg-white text-slate-950 rounded-[24px] font-black text-lg hover:scale-[1.02] transition-all shadow-xl active:scale-95 group"
                    >
                        <Github size={24} />
                        Continue with GitHub
                        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>

                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Standard AES-256 Encryption Secured
                    </p>
                </div>

                <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-blue-400">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Big Tech Standards</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Core</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Gemini 2.0 Powered</p>
                    </div>
                </div>

                <Link href="/" className="inline-block text-[11px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
                    Back to Landing Page
                </Link>
            </motion.div>
        </div>
    );
}
