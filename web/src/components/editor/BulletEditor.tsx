"use client";

import React, { useState } from "react";
import { Wand2, Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface BulletEditorProps {
    value: string;
    onChange: (v: string) => void;
    jobDescription?: string;
    onRemove?: () => void;
}

export const BulletEditor: React.FC<BulletEditorProps> = ({ value, onChange, jobDescription, onRemove }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const handleOptimize = async () => {
        if (!jobDescription) return;
        setIsOptimizing(true);
        try {
            const response = await axios.post('/api/optimize', {
                bullet: value,
                job_description: jobDescription
            });
            setSuggestion(response.data.optimizedSlug);
        } catch (error) {
            console.error(error);
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="relative group/bullet space-y-2">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Accomplished [X] as measured by [Y], by doing [Z]"
                    className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 min-h-[80px] transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover/bullet:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing || !value || !jobDescription}
                        className={`p-2 rounded-xl transition-all ${isOptimizing
                                ? 'bg-blue-600/20 text-blue-400 rotate-180 animate-spin'
                                : 'bg-blue-600 text-white hover:scale-110 shadow-lg shadow-blue-600/20 opacity-0 group-hover/bullet:opacity-100'
                            } disabled:opacity-0`}
                    >
                        <Wand2 size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {suggestion && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={12} /> AI Recommendation
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSuggestion(null)}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                ><X size={14} /></button>
                                <button
                                    onClick={() => { onChange(suggestion); setSuggestion(null); }}
                                    className="p-1 text-slate-500 hover:text-green-400"
                                ><Check size={14} /></button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">"{suggestion}"</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
