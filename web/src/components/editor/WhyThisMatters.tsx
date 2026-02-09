"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WhyThisMattersProps {
    title: string;
    explanation: string;
}

export const WhyThisMatters: React.FC<WhyThisMattersProps> = ({ title, explanation }) => {
    return (
        <div className="group relative">
            <div className="flex items-center gap-2 cursor-help">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
                <HelpCircle size={12} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>

            <motion.div
                className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none"
            >
                <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                    {explanation}
                </p>
            </motion.div>
        </div>
    );
};
