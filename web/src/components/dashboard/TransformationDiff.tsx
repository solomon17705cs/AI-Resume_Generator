import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface TransformationDiffProps {
    before: string;
    after: string;
    stepName: string;
}

const TransformationDiff: React.FC<TransformationDiffProps> = ({ before, after, stepName }) => {
    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">{stepName}</h4>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 size={12} /> Optimization Applied
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-6">
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Original Trace</span>
                    <div className="p-4 bg-black/20 rounded-2xl text-[11px] text-slate-400 font-medium leading-relaxed italic border border-white/5">
                        "{before}"
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-center gap-2 opacity-20">
                    <ArrowRight size={20} className="text-blue-500" />
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">Neural Output</span>
                    <div className="p-4 bg-blue-600/10 rounded-2xl text-[11px] text-blue-100 font-bold leading-relaxed border border-blue-500/20 shadow-lg shadow-blue-500/5">
                        "{after}"
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransformationDiff;
