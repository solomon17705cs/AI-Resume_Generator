"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus, Hash, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAutocompleteSuggestions } from "@/utils/autocompleteSuggestions";

interface SkillTagInputProps {
    skills: string[];
    onChange: (skills: string[]) => void;
    label: string;
    onLabelChange?: (newLabel: string) => void;
    onDelete?: () => void;
}

export const SkillTagInput: React.FC<SkillTagInputProps> = ({ skills, onChange, label, onLabelChange, onDelete }) => {
    const [inputValue, setInputValue] = useState("");
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [tempLabel, setTempLabel] = useState(label);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (value.trim().length > 0) {
            const newSuggestions = getAutocompleteSuggestions(value, 'skill');
            setSuggestions(newSuggestions.filter(s => !skills.includes(s)));
            setSelectedSuggestionIndex(-1);
        } else {
            setSuggestions([]);
        }
    };

    const addSkill = (skillToAdd: string) => {
        if (!skills.includes(skillToAdd.trim())) {
            onChange([...skills, skillToAdd.trim()]);
        }
        setInputValue("");
        setSuggestions([]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                addSkill(suggestions[selectedSuggestionIndex]);
            } else {
                addSkill(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
            onChange(skills.slice(0, -1));
        } else if (e.key === 'Escape') {
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
        }
    };

    const handleLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onLabelChange?.(tempLabel);
            setIsEditingLabel(false);
        } else if (e.key === 'Escape') {
            setTempLabel(label);
            setIsEditingLabel(false);
        }
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 group/label">
                <Hash size={14} className="text-blue-500" />
                {isEditingLabel ? (
                    <input
                        autoFocus
                        type="text"
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onKeyDown={handleLabelKeyDown}
                        onBlur={() => {
                            onLabelChange?.(tempLabel);
                            setIsEditingLabel(false);
                        }}
                        className="bg-slate-900 border border-blue-500/50 rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none"
                    />
                ) : (
                    <div className="flex items-center gap-2 flex-1">
                        <label
                            onClick={() => setIsEditingLabel(true)}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            {label}
                            <span className="opacity-0 group-hover/label:opacity-100 text-[8px] font-medium lowercase tracking-normal text-slate-600">(click to rename)</span>
                        </label>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="opacity-0 group-hover/label:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-600 rounded-lg transition-all ml-auto"
                                title="Delete domain"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 p-6 bg-slate-900/50 border border-white/5 rounded-[32px] min-h-[120px] transition-all focus-within:border-blue-500/30 relative">
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

                <div className="flex-1 min-w-[150px] relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type and hit Enter... (or Arrow Down for suggestions)"
                        className="w-full bg-transparent border-none outline-none text-sm text-slate-300 placeholder:text-slate-700"
                        autoComplete="off"
                    />

                    {/* Type-ahead Suggestions */}
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 max-h-48 overflow-y-auto"
                            >
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={suggestion}
                                        onMouseDown={() => addSkill(suggestion)}
                                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                        className={`w-full px-4 py-2.5 text-sm text-left transition-all flex items-center justify-between group ${
                                            index === selectedSuggestionIndex
                                                ? 'bg-blue-600/20 border-l-2 border-blue-500 text-blue-400'
                                                : 'hover:bg-white/5 text-slate-300 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <span className="font-medium">{suggestion}</span>
                                        {index === selectedSuggestionIndex && (
                                            <Plus size={14} className="text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
