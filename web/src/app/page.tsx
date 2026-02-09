"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  ShieldCheck,
  ArrowRight,
  Cpu,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  BarChart4,
  FileText
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden font-sans">
      {/* SaaS Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl py-5 px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <span className="text-2xl font-black font-display tracking-tighter">ATSense</span>
          </div>

          <div className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white">Login</Link>
            <Link href="/editor" className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-xs transition-all shadow-xl shadow-white/5 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-40">
        {/* Dynamic Hero Section */}
        <section className="px-10 text-center relative max-w-6xl mx-auto">
          {/* Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[150px] -z-10 rounded-full" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20">
              <Sparkles size={14} /> New: GPT-4o Powered Analysis
            </div>

            <h1 className="text-7xl md:text-[110px] font-black font-display tracking-tight leading-[0.85] text-white">
              Resume <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">Intelligence.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
              Don't just build a resume. Engineer it to match the specific hiring logic of top-tier companies. Verified alignment for Big Tech systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/editor" className="group px-12 py-6 bg-white text-slate-950 rounded-[32px] font-black text-xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95">
                Launch Intelligence Core
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </Link>
              <Link href="/dashboard" className="px-12 py-6 bg-slate-900 border border-white/5 text-white rounded-[32px] font-black text-xl flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95">
                <LayoutDashboard size={24} />
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid: SaaS Narrative */}
        <section id="features" className="mt-40 px-10 py-32 bg-slate-900/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-4">
              <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Engine Architecture</h2>
              <h3 className="text-4xl font-black font-display tracking-tight">How we beat the machines.</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card
                icon={<Target className="text-blue-500" />}
                title="JD Mirror Sync"
                desc="Our NLP layer extracts company-specific skill matrices and rewrites your content to reflect their exact needs."
              />
              <Card
                icon={<Cpu className="text-cyan-500" />}
                title="Reasoning Portal"
                desc="Understand the 'why' behind your score. We provide recruiter-style feedback on your project impact."
              />
              <Card
                icon={<BarChart4 className="text-emerald-500" />}
                title="Match Forensics"
                desc="Get a verified percentage score of how likely you are to pass specific company filters."
              />
            </div>
          </div>
        </section>

        {/* The XYZ Magic Section */}
        <section className="py-40 px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24">
            <div className="flex-1 space-y-10">
              <div className="w-16 h-1 bg-blue-600 rounded-full" />
              <h2 className="text-5xl font-black font-display tracking-tight leading-tight text-white">
                From passive text to <br />
                <span className="text-blue-500">engineered impact.</span>
              </h2>
              <div className="space-y-6">
                <FeatureItem title="XYZ Formula Rewriting" desc="Automated conversion of bullet points using the Google-standard impact framework." />
                <FeatureItem title="Section Priority Mapping" desc="Dynamic adjustment of resume hierarchy based on role requirements." />
                <FeatureItem title="Keyword Density Control" desc="Verified protection against both keyword stuffing and missing signals." />
              </div>
            </div>

            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full group-hover:bg-blue-500/30 transition-all duration-1000" />
              <div className="relative glass-dark border border-white/10 rounded-[60px] p-12 aspect-square flex flex-col justify-center">
                <div className="text-8xl font-black font-display tracking-tighter text-blue-500 text-center mb-4">97%</div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] text-center">Alignment Capability</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-40 px-10 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[50px] p-20 space-y-10 shadow-2xl shadow-blue-500/20">
            <h2 className="text-5xl md:text-7xl font-black font-display tracking-tight text-white leading-none">
              Ready to meet <br /> your future?
            </h2>
            <p className="text-white/80 font-medium text-lg">Join 12,000+ engineers landing roles at Tier-1 tech companies.</p>
            <Link href="/editor" className="inline-flex px-12 py-6 bg-white text-slate-950 rounded-[32px] font-black text-xl hover:scale-105 transition-all shadow-xl active:scale-95">
              Launch Intelligence Core
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 text-center mt-20">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-500" size={24} />
            <span className="text-2xl font-black font-display tracking-tighter uppercase">ATSense</span>
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Built for the high-frequency career market. V1.4.0</p>
        </div>
      </footer>
    </div>
  );
}

const Card = ({ icon, title, desc }: any) => (
  <div className="p-10 glass-dark border border-white/5 rounded-[40px] hover:border-blue-500/40 hover:bg-slate-900 transition-all group">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-2xl font-bold mb-4">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const FeatureItem = ({ title, desc }: any) => (
  <div className="flex gap-5">
    <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={24} />
    <div>
      <h5 className="font-bold text-lg mb-1">{title}</h5>
      <p className="text-slate-500 text-sm font-medium">{desc}</p>
    </div>
  </div>
);
