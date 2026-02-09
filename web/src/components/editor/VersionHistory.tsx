"use client";

import React from "react";
import { Clock, ChevronRight, RotateCcw, ShieldCheck, Calendar } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { motion } from "framer-motion";

export const VersionHistory = () => {
    const { history, restoreFromHistory } = useResumeStore();

    if (history.length === 0) {
        return (
            <div className="p-12 text-center space-y-4 glass-dark border border-white/5 rounded-[40px]">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                    <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-400">No versions yet</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Snapshots are automatically created when you perform deep AI optimizations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="text-blue-500" size={18} />
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Snapshot Timeline</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{history.length} Saved States</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {history.map((v, i) => (
                    <motion.div
                        key={v.id + i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-dark border border-white/5 p-6 rounded-3xl hover:border-blue-500/30 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Calendar size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">{v.title}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{new Date(v.lastModified).toLocaleString()}</span>
                                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500" /> ATS Ready</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {v.metadata?.atsScore && (
                                <div className="text-right mr-4">
                                    <div className="text-lg font-black text-blue-500">{v.metadata.atsScore}%</div>
                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Saved Score</div>
                                </div>
                            )}
                            <button
                                onClick={() => restoreFromHistory(v.id)}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all"
                            >
                                <RotateCcw size={14} /> Restore
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const History = Clock; // Re-using icon for clarity
