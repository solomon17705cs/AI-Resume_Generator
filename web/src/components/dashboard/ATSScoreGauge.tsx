"use client";

import React from "react";
import { motion } from "framer-motion";

interface ATSScoreGaugeProps {
    score: number;
    isFresher?: boolean;
}

export const ATSScoreGauge: React.FC<ATSScoreGaugeProps> = ({ score = 0, isFresher }) => {
    const clampedScore = Math.min(score, 100);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedScore / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 60) return "text-yellow-500";
        return "text-blue-500";
    };

    return (
        <div className="flex flex-col items-center">
            {isFresher && (
                <div className="absolute -top-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Fresher Mode</span>
                </div>
            )}
            <div className="relative flex items-center justify-center">
                <svg
                    className="w-48 h-48 -rotate-90 overflow-visible"
                    viewBox="0 0 192 192"
                >
                    {/* Track Circle */}
                    <circle
                        className="text-white/10"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="96"
                        cy="96"
                    />
                    {/* Progress Arc */}
                    <motion.circle
                        className={getColor(clampedScore)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="96"
                        cy="96"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-5xl font-black font-display tracking-tight ${getColor(clampedScore)}`}
                    >
                        {clampedScore}
                    </motion.span>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-4">Match Potential</span>
        </div>
    );
};
