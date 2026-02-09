"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info, Target, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { MatchBar } from "./MatchBar";
import { KeywordCloud } from "../editor/KeywordCloud";
import { WhyThisMatters } from "../editor/WhyThisMatters";

interface ReasoningPanelProps {
    reasoning: string;
    suggestions: {
        type: 'warning' | 'info' | 'critical';
        message: string;
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
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({
    reasoning,
    suggestions,
    forensics,
    keywords
}) => {
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

            <div className="space-y-3">
                {suggestions.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-2xl border flex gap-3 ${s.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                                s.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                    'bg-blue-500/5 border-blue-500/20'
                            }`}
                    >
                        {s.type === 'critical' ? <AlertTriangle size={16} className="text-red-500 shrink-0" /> :
                            s.type === 'warning' ? <Lightbulb size={16} className="text-yellow-500 shrink-0" /> :
                                <Info size={16} className="text-blue-500 shrink-0" />}
                        <span className="text-[11px] leading-relaxed text-slate-300">{s.message}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
