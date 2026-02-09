"use client";

import React from "react";
import { motion } from "framer-motion";

interface ATSScoreGaugeProps {
    score: number;
}

export const ATSScoreGauge: React.FC<ATSScoreGaugeProps> = ({ score }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 60) return "text-yellow-500";
        return "text-blue-500";
    };

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg className="w-48 h-48 -rotate-90">
                <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="96"
                    cy="96"
                />
                <motion.circle
                    className={getColor(score)}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-5xl font-black font-display ${getColor(score)}`}
                >
                    {score}
                </motion.span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Match Potential</span>
            </div>
        </div>
    );
};
