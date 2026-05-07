"use client";

import React from "react";
import { motion } from "framer-motion";

interface MatchBarProps {
    label: string;
    value: number | undefined | null;
    color?: string;
}

export const MatchBar: React.FC<MatchBarProps> = ({ label, value, color = "bg-blue-500" }) => {
    const safeValue = value === undefined || value === null || isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
    
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className="text-white">{safeValue}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeValue}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
};
