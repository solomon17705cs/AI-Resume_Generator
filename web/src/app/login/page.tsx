"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Github,
    Zap,
    ShieldCheck,
    Sparkles,
    Mail,
    Lock,
    UserPlus,
    LogIn
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [view, setView] = useState<"login" | "register">("login");

    const handleOAuth = (provider: string) => {
        window.location.href = `/api/auth/${provider}`;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;

        try {
            const res = await fetch('/api/auth/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = `/dashboard?github_linked=true&username=${data.username}&avatar=${encodeURIComponent(data.avatar)}`;
            }
        } catch (err) {
            alert("Email auth failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-dark border border-white/5 rounded-[48px] overflow-hidden shadow-2xl relative"
            >
                {/* Auth Tabs */}
                <div className="flex bg-white/5 border-b border-white/5">
                    <button
                        onClick={() => setView("login")}
                        className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'login' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setView("register")}
                        className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'register' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Register
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap className="text-white fill-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black font-display tracking-tight text-white">
                            {view === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {view === 'login' ? 'Access your engineering workspace.' : 'Start engineering your professional future.'}
                        </p>
                    </div>

                    {/* OAuth Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <OAuthButton onClick={() => handleOAuth('github')} icon={<Github size={20} />} label="GitHub" />
                        <OAuthButton onClick={() => handleOAuth('google')} icon={<img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />} label="Google" />
                        <OAuthButton onClick={() => handleOAuth('linkedin')} icon={<LinkedinIcon size={20} />} label="LinkedIn" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-600 bg-[#0a0f1d] px-4">Or use email</div>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-4" onSubmit={handleEmailAuth}>
                        <div className="space-y-4">
                            <InputField name="email" icon={<Mail size={16} />} placeholder="Email Address" required />
                            <InputField name="password" icon={<Lock size={16} />} placeholder="Password" type="password" required />
                        </div>
                        <button className="w-full py-5 bg-white text-slate-950 rounded-[20px] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                            {view === 'login' ? <><LogIn size={18} /> Enter Workspace</> : <><UserPlus size={18} /> Create Identifier</>}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2 text-blue-400">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Sync</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/" className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">
                            ← Return to System Core
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const OAuthButton = ({ onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        type="button"
        className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 group"
    >
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-tight text-slate-500">{label}</span>
    </button>
);

const InputField = ({ icon, ...props }: any) => (
    <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
            {icon}
        </div>
        <input
            {...props}
            className="w-full bg-slate-900 border border-white/5 rounded-[20px] py-5 pl-14 pr-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all font-medium"
        />
    </div>
);

const LinkedinIcon = ({ size }: { size: number }) => (
    <svg
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className="text-[#0077b5]"
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);
