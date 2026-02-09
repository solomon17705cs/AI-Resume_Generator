"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Target, AlertTriangle, Lightbulb, BarChart3, Zap } from "lucide-react";
import { MatchBar } from "./MatchBar";
import { KeywordCloud } from "../editor/KeywordCloud";
import { WhyThisMatters } from "../editor/WhyThisMatters";

interface ReasoningPanelProps {
    reasoning: string;
    suggestions: {
        id?: string;
        type: 'warning' | 'info' | 'critical' | 'WARNING' | 'INFO' | 'CRITICAL';
        message?: string;
        title?: string;
        description?: string;
        action?: string;
        examples?: { before: string; after: string }[];
    }[];
    forensics?: {
        semantic_overlap: number;
        keyword_density: number;
        structural_integrity: number;
    };
    keywords?: {
        text: string;
        found: boolean;
    }[];
    onRefreshSuggestion?: (id: string) => void;
    onApplySuggestion?: (example: { before: string; after: string }) => void;
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({
    reasoning,
    suggestions,
    forensics,
    keywords,
    onRefreshSuggestion,
    onApplySuggestion
}) => {
    const [refreshingId, setRefreshingId] = React.useState<string | null>(null);

    const handleRefresh = (id: string) => {
        if (onRefreshSuggestion) {
            setRefreshingId(id);
            onRefreshSuggestion(id);
            setTimeout(() => setRefreshingId(null), 1000);
        }
    };

    return (
        <div className="space-y-8">
            {/* Forensics Stats */}
            {forensics && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-500">
                        <BarChart3 size={16} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Match Forensics</h3>
                    </div>
                    <div className="space-y-4 bg-slate-950/40 p-5 rounded-3xl border border-white/5">
                        <MatchBar label="Semantic Overlap" value={forensics.semantic_overlap} />
                        <MatchBar label="Keyword Density" value={forensics.keyword_density} color="bg-cyan-500" />
                        <MatchBar label="Structural Integrity" value={forensics.structural_integrity} color="bg-emerald-500" />
                    </div>
                </div>
            )}

            {/* Keywords Cloud */}
            {keywords && keywords.length > 0 && (
                <KeywordCloud keywords={keywords} />
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Target size={18} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Insight</h3>
                    </div>
                    <WhyThisMatters
                        title="Reasoning Logic"
                        explanation="Our engine uses vector embeddings to compare the semantic 'fingerprint' of your resume against the job description. We highlight gaps in skills and structural signals that recruiters prioritize."
                    />
                </div>

                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
                    <p className="text-[11px] leading-relaxed text-slate-300 italic font-medium">
                        "{reasoning}"
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {suggestions.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            borderColor: refreshingId === s.id ? 'rgba(16, 185, 129, 0.5)' : undefined,
                        }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-[24px] border space-y-4 group transition-all hover:border-white/10 relative overflow-hidden ${s.type === 'critical' || s.type === 'CRITICAL' ? 'bg-red-500/5 border-red-500/10' :
                            s.type === 'warning' || s.type === 'WARNING' ? 'bg-yellow-500/5 border-yellow-500/10' :
                                'bg-blue-500/5 border-blue-500/10'
                            }`}
                    >
                        <AnimatePresence>
                            {refreshingId === s.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-4 right-14 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 z-20"
                                >
                                    AI Optimized
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                {s.type === 'critical' || s.type === 'CRITICAL' ? <AlertTriangle size={18} className="text-red-500 shrink-0" /> :
                                    s.type === 'warning' || s.type === 'WARNING' ? <Lightbulb size={18} className="text-yellow-500 shrink-0" /> :
                                        <Info size={18} className="text-blue-400 shrink-0" />}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-white">{s.title || (s.type === 'critical' || s.type === 'CRITICAL' ? 'Critical' : 'Insight')}</h4>
                                    <p className="text-[11px] leading-relaxed text-slate-300">
                                        {s.description || s.message}
                                    </p>
                                </div>
                            </div>

                            {onRefreshSuggestion && s.id && (
                                <button
                                    onClick={() => handleRefresh(s.id!)}
                                    className={`p-2 rounded-xl transition-all ${refreshingId === s.id ? 'bg-emerald-500 text-white' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}
                                    title="Try another variation"
                                >
                                    <Zap size={14} className={refreshingId === s.id ? 'animate-spin' : 'group-hover:animate-pulse'} />
                                </button>
                            )}
                        </div>

                        {s.action && (
                            <div className="pl-7 space-y-3">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Action: {s.action}</div>
                                {s.examples && s.examples.length > 0 && (
                                    <div className="space-y-3">
                                        {s.examples.map((ex, j) => (
                                            <div key={j} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                                                    <div className="text-[8px] font-black text-red-500 uppercase">Current</div>
                                                    <div className="text-[10px] text-slate-400 line-through decoration-red-500/50">{ex.before}</div>
                                                </div>
                                                <button
                                                    onClick={() => onApplySuggestion?.(ex)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-500 space-y-1 group/opt ${refreshingId === s.id ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10'}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-[8px] font-black text-emerald-500 uppercase">Optimized</div>
                                                        <div className="text-[8px] font-black text-emerald-500 uppercase opacity-0 group-hover/opt:opacity-100 transition-opacity flex items-center gap-1">
                                                            Apply to Resume <Target size={8} />
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-emerald-100 font-medium italic">{ex.after}</div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
