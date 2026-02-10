"use client";

import React from "react";
import { Lightbulb, Info } from "lucide-react";

export const ImpactHint = () => {
    return (
        <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[32px] space-y-4 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center gap-2 text-blue-400">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Lightbulb size={16} className="fill-blue-400/20" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Impact Engineering Tip</h4>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed px-1">
                Use the <span className="text-white font-black underline decoration-blue-500/40 underline-offset-4">XYZ Formula</span>: "Accomplished <span className="text-blue-400 font-bold">[X]</span> as measured by <span className="text-blue-400 font-bold">[Y]</span>, by doing <span className="text-blue-400 font-bold">[Z]</span>".
                <span className="block mt-2 text-slate-500 italic">Quantifiable metrics increase your ATS alignment score by up to 40%.</span>
            </p>
        </div>
    );
};
