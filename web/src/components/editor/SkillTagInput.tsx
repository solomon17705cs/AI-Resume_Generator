"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SkillTagInputProps {
    skills: string[];
    onChange: (skills: string[]) => void;
    label: string;
}

export const SkillTagInput: React.FC<SkillTagInputProps> = ({ skills, onChange, label }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!skills.includes(inputValue.trim())) {
                onChange([...skills, inputValue.trim()]);
            }
            setInputValue("");
        } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
            onChange(skills.slice(0, -1));
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                <Hash size={14} className="text-blue-500" />
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</label>
            </div>

            <div className="flex flex-wrap gap-2 p-6 bg-slate-900/50 border border-white/5 rounded-[32px] min-h-[120px] transition-all focus-within:border-blue-500/30">
                <AnimatePresence>
                    {skills.map((skill) => (
                        <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] font-bold text-blue-400 group"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and hit Enter..."
                    className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-sm text-slate-300 placeholder:text-slate-700"
                />
            </div>
        </div>
    );
};
