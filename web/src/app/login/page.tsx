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
    LogIn,
    User,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const { setUserRole } = useResumeStore();
    const [loginType, setLoginType] = useState<"user" | "admin">("user");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleOAuth = (provider: string) => {
        // OAuth currently only for users
        setUserRole('user');
        window.location.href = `/api/auth/${provider}`;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mock Auth Logic
        if (loginType === 'admin') {
            if (email === 'admin@atsense.ai' && password === 'admin123') {
                setUserRole('admin');
                router.push("/recommendations");
            } else {
                alert("Invalid Admin Credentials (demo: admin@atsense.ai / admin123)");
            }
        } else {
            // Simulated User Login
            setUserRole('user');
            // Redirect to a mocked callback state
            window.location.href = `/dashboard?github_linked=true&username=solomon&avatar=${encodeURIComponent('https://avatars.githubusercontent.com/u/1?v=4')}`;
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
                {/* Login Type Tabs */}
                <div className="flex bg-white/5 border-b border-white/5">
                    <button
                        onClick={() => setLoginType("user")}
                        className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginType === 'user' ? 'text-white border-b-2 border-blue-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <User size={14} /> User Login
                    </button>
                    <button
                        onClick={() => setLoginType("admin")}
                        className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginType === 'admin' ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ShieldAlert size={14} /> Admin Access
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${loginType === 'admin' ? 'bg-red-600 shadow-red-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                                <Zap className="text-white fill-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black font-display tracking-tight text-white">
                            {loginType === 'admin' ? 'System Control' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {loginType === 'admin' ? 'Strategic oversight & recommendation desk.' : 'Access your engineering workspace.'}
                        </p>
                    </div>

                    {loginType === 'user' && (
                        <>
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
                        </>
                    )}

                    {/* Email Form */}
                    <form className="space-y-4" onSubmit={handleEmailAuth}>
                        <div className="space-y-4">
                            <InputField
                                name="email"
                                icon={<Mail size={16} />}
                                placeholder={loginType === 'admin' ? "Admin Handle" : "Email Address"}
                                required
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                            <InputField
                                name="password"
                                icon={<Lock size={16} />}
                                placeholder="Security Key"
                                type="password"
                                required
                                value={password}
                                onChange={(e: any) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className={`w-full py-5 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${loginType === 'admin' ? 'bg-red-600 text-white shadow-red-500/10' : 'bg-white text-slate-950 shadow-white/5'
                            }`}>
                            <LogIn size={18} /> {loginType === 'admin' ? 'Initialize Admin Session' : 'Enter Workspace'}
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

                    {loginType === 'user' && (
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors ml-1">
                                    Register Now
                                </Link>
                            </p>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <Link href="/" className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors text-center w-full block">
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
