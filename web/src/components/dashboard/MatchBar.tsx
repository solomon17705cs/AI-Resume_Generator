"use client";

import React from "react";
import { motion } from "framer-motion";

interface MatchBarProps {
    label: string;
    value: number;
    color?: string;
}

export const MatchBar: React.FC<MatchBarProps> = ({ label, value, color = "bg-blue-500" }) => {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">{label}</span>
                <span className="text-white">{Math.round(value)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
};
