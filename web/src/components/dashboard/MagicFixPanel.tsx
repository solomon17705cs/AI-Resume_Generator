import React from 'react';
import { Sparkles, Wand2, ShieldAlert, CheckCircle2, TrendingUp, Cpu, Layout, Type, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MagicFixPanelProps {
    currentScore: number;
    isFixing: boolean;
    onFix: () => void;
    matchForensics?: {
        keyword_match?: number;
        semantic_relevance?: number;
        structural_integrity?: number;
        keyword_density?: number;
        section_compliance?: number;
        clarity_recency?: number;
    };
}

const MagicFixPanel: React.FC<MagicFixPanelProps> = ({ currentScore = 0, isFixing, onFix, matchForensics }) => {
    if (currentScore >= 90) return null;

    const steps = [
        {
            icon: <Cpu size={16} className="text-blue-400" />,
            label: "Keyword Match",
            weight: "40%",
            current: matchForensics?.keyword_match || 9,
            target: "90%",
            color: "blue"
        },
        {
            icon: <Layout size={16} className="text-emerald-400" />,
            label: "Section Compliance",
            weight: "30%",
            current: matchForensics?.section_compliance || matchForensics?.structural_integrity || 7,
            target: "95%",
            color: "emerald"
        },
        {
            icon: <TrendingUp size={16} className="text-purple-400" />,
            label: "Semantic Relevance",
            weight: "20%",
            current: matchForensics?.semantic_relevance || 4,
            target: "85%",
            color: "purple"
        },
        {
            icon: <Type size={16} className="text-yellow-400" />,
            label: "Clarity & Recency",
            weight: "10%",
            current: matchForensics?.clarity_recency || 2,
            target: "90%",
            color: "yellow"
        }
    ];

    return (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900/50 border border-indigo-500/20 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/10">
                <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                    {/* Left: Info & Table */}
                    <div className="flex-1 space-y-8">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-red-500/20">
                                <ShieldAlert size={12} /> Optimization Required
                            </div>
                            <h2 className="text-3xl font-black font-display tracking-tight text-white">
                                Fix Low ATS Scores <span className="text-indigo-400">({currentScore.toFixed(1)}% → 90+)</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                                Your current draft lacks the specific signals required for this job profile.
                                Our Strategic Optimization Engine will re-engineer your resume across 5 neural layers.
                            </p>
                        </div>

                        {/* Transformation Table */}
                        <div className="overflow-hidden bg-black/20 rounded-3xl border border-white/5">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Component</th>
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center">Current</th>
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center">Target</th>
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {steps.map((step, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {step.icon}
                                                    <span className="font-bold text-slate-200">{step.label}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">({step.weight})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-red-400">{step.current}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-emerald-400">{step.target}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] text-slate-500 font-medium italic">
                                                    {i === 0 ? "Injecting missing tokens" : i === 1 ? "Reordering segments" : i === 2 ? "Context transformation" : "Brevity compression"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="lg:w-80 flex flex-col justify-center items-center p-8 bg-indigo-600/10 border-l border-indigo-500/10 rounded-r-[40px] text-center space-y-6">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-[32px] flex items-center justify-center relative">
                            <Sparkles className="text-indigo-400 animate-pulse" size={40} />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-[32px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold">Neural Optimization</h4>
                            <p className="text-xs text-slate-400 font-medium">Click to apply the full 5-step optimization plan.</p>
                        </div>
                        <button
                            onClick={onFix}
                            disabled={isFixing}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isFixing ? (
                                <>
                                    <Cpu size={18} className="animate-spin" />
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    Transform Resume
                                </>
                            )}
                        </button>
                        <div className="flex items-center gap-2 opacity-50">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Targeting 90%+ ATS Match</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MagicFixPanel;
