"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Code2, Database, Globe, Layers, Terminal, Zap } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { processGithubLanguages } from '@/utils/skillProcessor';

export const SkillIntelligence: React.FC = () => {
    const { githubRepos, githubLinked } = useResumeStore();

    const skillCategories = useMemo(() => {
        if (!githubLinked || githubRepos.length === 0) return null;

        const allLanguages: { name: string; percentage: number; color?: string }[] = [];
        githubRepos.forEach((repo) => {
            if (repo.languages && Array.isArray(repo.languages)) {
                repo.languages.forEach((lang: any) => {
                    allLanguages.push({
                        name: lang.name,
                        percentage: lang.percentage || 1,
                        color: lang.color
                    });
                });
            }
        });

        return processGithubLanguages(allLanguages);
    }, [githubRepos, githubLinked]);

    // Wait state - show pending message
    if (!githubLinked) {
        return (
            <div className="p-8 glass-dark border border-white/5 rounded-[40px] text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                    <Code2 size={24} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Engineering Inventory</h3>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Link GitHub to derive technical proficiency from actual repository metadata.
                    </p>
                </div>
            </div>
        );
    }

    // Linked but no repos
    if (githubLinked && githubRepos.length === 0) {
        return (
            <div className="p-8 glass-dark border border-white/5 rounded-[40px] text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                    <Code2 size={24} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Engineering Inventory</h3>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        No repositories found. Add GitHub repos to see skill analysis.
                    </p>
                </div>
            </div>
        );
    }

    const getIconForCategory = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('frontend')) return <Globe size={14} />;
        if (n.includes('backend')) return <Terminal size={14} />;
        if (n.includes('database')) return <Database size={14} />;
        if (n.includes('devops')) return <Layers size={14} />;
        return <Code2 size={14} />;
    };

// Safe number helper
    const safePercent = (val: number | undefined | null): number => {
        if (val === undefined || val === null) return 0;
        const num = Number(val);
        if (isNaN(num)) return 0;
        return Math.min(100, Math.max(0, Math.round(num)));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Brain size={16} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Engineering Inventory</h3>
                </div>
                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded-full">
                    Live GitHub Data
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(skillCategories ? Object.values(skillCategories) : []).map((category, idx) => (
                    <motion.div
                        key={`cat-${category.name || idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 glass-dark border border-white/5 rounded-[32px] space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-300">
                                {getIconForCategory(category.name)}
                                <h4 className="text-xs font-black uppercase tracking-widest">{category.name}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                                {safePercent(category.totalPercentage)}% Impact
                            </span>
                        </div>

                        <div className="space-y-3">
                            {category.skills.map((skill, sIdx) => (
                                <div key={`skill-${skill.name || sIdx}`} className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500 px-1">
                                        <span>{skill.name}</span>
                                        <span className="text-slate-400">{safePercent(skill.normalizedPercentage)}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${safePercent(skill.normalizedPercentage)}%` }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: skill.color || '#3b82f6' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
