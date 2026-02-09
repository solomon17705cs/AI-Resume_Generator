"use client";

import React from "react";
import { Lightbulb, Info } from "lucide-react";

export const ImpactHint = () => {
    return (
        <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
                <Lightbulb size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Impact Engineering Tip</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
                Use the <span className="text-white font-bold">XYZ Formula</span>: "Accomplished <span className="text-blue-400">[X]</span> as measured by <span className="text-blue-400">[Y]</span>, by doing <span className="text-blue-400">[Z]</span>".
                Quantifiable metrics increase your ATS alignment score by up to 40%.
            </p>
        </div>
    );
};
