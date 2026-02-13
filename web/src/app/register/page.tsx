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
    User,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const { setUserRole } = useResumeStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const handleOAuth = (provider: string) => {
        setUserRole('user');
        window.location.href = `/api/auth/${provider}`;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulated Registration
        setUserRole('user');
        window.location.href = `/dashboard?github_linked=true&username=${fullName.split(' ')[0]}&avatar=${encodeURIComponent('https://avatars.githubusercontent.com/u/1?v=4')}`;
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
                <div className="p-10 space-y-10">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <UserPlus className="text-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black font-display tracking-tight text-white">
                            Create Account
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Join the engine room of modern engineering.
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
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-600 bg-[#0a0f1d] px-4">Or sign up with email</div>
                    </div>

                    {/* Registration Form */}
                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div className="space-y-4">
                            <InputField
                                name="fullName"
                                icon={<User size={16} />}
                                placeholder="Full Name"
                                required
                                value={fullName}
                                onChange={(e: any) => setFullName(e.target.value)}
                            />
                            <InputField
                                name="email"
                                icon={<Mail size={16} />}
                                placeholder="Email Address"
                                type="email"
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
                        <button className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                            <ArrowRight size={18} /> Get Started
                        </button>
                    </form>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors ml-1">
                                Login Here
                            </Link>
                        </p>
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
