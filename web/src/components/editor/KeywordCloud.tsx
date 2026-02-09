"use client";

import React from "react";
import { motion } from "framer-motion";

interface Keyword {
    text: string;
    found: boolean;
}

interface KeywordCloudProps {
    keywords: Keyword[];
}

export const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
    if (!keywords || keywords.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Semantic Keywords</h3>
                <span className="text-[10px] font-bold text-blue-500 uppercase">{keywords.filter(k => k.found).length}/{keywords.length} Found</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                    <motion.span
                        key={kw.text}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${kw.found
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : "bg-red-500/5 border-red-500/10 text-red-400 opacity-50 hover:opacity-100"
                            }`}
                    >
                        {kw.text}
                    </motion.span>
                ))}
            </div>
        </div>
    );
};
