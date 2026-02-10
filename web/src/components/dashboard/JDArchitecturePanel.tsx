import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Cpu, ShieldCheck, Zap, Server, Globe } from 'lucide-react';

export const JDArchitecturePanel = ({ intelligence }: { intelligence: any }) => {
    if (!intelligence) return null;

    const stackCategories = [
        { label: 'Languages', items: intelligence.stack.languages, icon: <Cpu size={14} />, color: 'blue' },
        { label: 'Frameworks', items: intelligence.stack.frameworks, icon: <Layers size={14} />, color: 'purple' },
        { label: 'Cloud/Platforms', items: intelligence.stack.cloud, icon: <Globe size={14} />, color: 'emerald' },
        { label: 'Architecture', items: intelligence.stack.concepts, icon: <Server size={14} />, color: 'orange' },
    ];

    return (
        <div className="p-8 glass-dark border border-white/5 rounded-[40px] space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <h3 className="text-xl font-bold font-display tracking-tight">Structured Job Architecture</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validated by Llama 3.3</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Target Domain</p>
                    <p className="text-sm font-bold text-white tracking-tight">{intelligence.domain}</p>
                </div>
                <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 mb-1">Target Seniority</p>
                    <p className="text-sm font-bold text-white tracking-tight">{intelligence.seniority}</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Detected Industry</p>
                    <p className="text-sm font-bold text-white tracking-tight">{intelligence.industry}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {stackCategories.map((cat, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex items-center gap-2 opacity-50">
                            {cat.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {cat.items.length > 0 ? cat.items.map((item: string, j: number) => (
                                <span key={j} className={`px-2 py-1 bg-${cat.color}-500/10 border border-${cat.color}-500/20 rounded-lg text-[10px] font-bold text-${cat.color}-400`}>
                                    {item}
                                </span>
                            )) : (
                                <span className="text-[10px] font-bold text-slate-600 italic">None detected</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed italic">
                    * This architecture guides the AI's semantic expansion and density targeting logic.
                </p>
            </div>
        </div>
    );
};
