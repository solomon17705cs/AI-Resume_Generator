"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAutocompleteSuggestions } from "@/utils/autocompleteSuggestions";
import { Check } from "lucide-react";

interface AutocompleteInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    category?: 'jobTitle' | 'company' | 'skill' | 'verb' | 'metric' | 'all';
    showSuggestions?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Type here...",
    category = 'all',
    showSuggestions = true,
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get suggestions when input changes
    useEffect(() => {
        if (showSuggestions && value.length > 0) {
            const newSuggestions = getAutocompleteSuggestions(value, category);
            setSuggestions(newSuggestions);
            setIsOpen(newSuggestions.length > 0);
            setSelectedIndex(-1);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [value, category, showSuggestions]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setIsOpen(false);
        setSuggestions([]);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            {label && (
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    autoComplete="off"
                />

                {/* Autocomplete Suggestions Dropdown */}
                <AnimatePresence>
                    {isOpen && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                        >
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={suggestion}
                                    onMouseDown={() =>
                                        handleSuggestionClick(suggestion)
                                    }
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full px-4 py-2.5 text-sm text-left transition-all flex items-center justify-between group ${
                                        index === selectedIndex
                                            ? 'bg-blue-600/20 border-l-2 border-blue-500 text-blue-400'
                                            : 'hover:bg-white/5 text-slate-300'
                                    }`}
                                >
                                    <span className="font-medium">{suggestion}</span>
                                    {index === selectedIndex && (
                                        <Check size={14} className="text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
