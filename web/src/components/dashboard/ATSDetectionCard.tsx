"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Building2, MapPin, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ATSDetectionCardProps {
    atsProfile: {
        id: string;
        name: string;
        description: string;
        targetScore: number;
        commonCompanies: string[];
        companyTraits: string[];
        optimizationStrategy: {
            bulletStyle: string;
            keywordPlacement: string[];
            sectionPriority: string[];
            dateFormat: string;
            avoidances: string[];
        };
        rules: string[];
    };
    detection: {
        confidence: 'High' | 'Medium' | 'Low';
        method: string;
        reasoning: string;
    };
    currentScore: number;
}

const confidenceColors = {
    High: 'from-green-500 to-emerald-600',
    Medium: 'from-yellow-500 to-orange-500',
    Low: 'from-gray-400 to-gray-500'
};

const confidenceIcons = {
    High: CheckCircle2,
    Medium: AlertCircle,
    Low: Info
};

export function ATSDetectionCard({ atsProfile, detection, currentScore }: ATSDetectionCardProps) {
    const ConfidenceIcon = confidenceIcons[detection.confidence];
    const scoreGap = atsProfile.targetScore - currentScore;
    const isAboveTarget = currentScore >= atsProfile.targetScore;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-6 h-6 text-white" />
                            <h3 className="text-2xl font-bold text-white">ATS Detection Results</h3>
                        </div>
                        <p className="text-indigo-100 text-sm">Multi-signal inference analysis</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${confidenceColors[detection.confidence]} text-white font-semibold flex items-center gap-2`}>
                        <ConfidenceIcon className="w-4 h-4" />
                        {detection.confidence} Confidence
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-6">
                {/* Detected ATS */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-white">{atsProfile.name}</h4>
                            <p className="text-slate-400 text-sm">{detection.method}</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {detection.reasoning}
                    </p>
                </div>

                {/* Score Comparison */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Current Score</p>
                        <p className="text-3xl font-bold text-white">{currentScore}%</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1">Target Score</p>
                        <p className="text-3xl font-bold text-emerald-400">{atsProfile.targetScore}%</p>
                    </div>
                    <div className={`bg-slate-800/50 rounded-xl p-4 border ${isAboveTarget ? 'border-emerald-500' : 'border-orange-500'}`}>
                        <p className="text-slate-400 text-xs mb-1">Gap</p>
                        <p className={`text-3xl font-bold ${isAboveTarget ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {isAboveTarget ? '+' : ''}{scoreGap.toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* Common Companies */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                        <h5 className="text-sm font-semibold text-white">Common Companies Using {atsProfile.name}</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {atsProfile.commonCompanies.map((company, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700"
                            >
                                {company}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Company Traits */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        <h5 className="text-sm font-semibold text-white">Company Characteristics</h5>
                    </div>
                    <ul className="space-y-2">
                        {atsProfile.companyTraits.map((trait, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
                                {trait}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Optimization Strategy */}
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-5 border border-indigo-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        <h5 className="text-sm font-semibold text-white">Optimization Strategy for {atsProfile.name}</h5>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Bullet Style</p>
                            <p className="text-sm text-slate-200 leading-relaxed">{atsProfile.optimizationStrategy.bulletStyle}</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-2">Keyword Placement Priority</p>
                            <div className="flex flex-wrap gap-2">
                                {atsProfile.optimizationStrategy.keywordPlacement.map((placement, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 bg-indigo-800/50 rounded-md text-xs text-indigo-200 border border-indigo-600/50"
                                    >
                                        {idx + 1}. {placement}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-2">Section Priority</p>
                            <div className="flex flex-wrap gap-2">
                                {atsProfile.optimizationStrategy.sectionPriority.map((section, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 bg-purple-800/50 rounded-md text-xs text-purple-200 border border-purple-600/50"
                                    >
                                        {idx + 1}. {section}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-1">Date Format</p>
                            <p className="text-sm text-slate-200 font-mono">{atsProfile.optimizationStrategy.dateFormat}</p>
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 mb-2">⚠️ Avoid</p>
                            <div className="flex flex-wrap gap-2">
                                {atsProfile.optimizationStrategy.avoidances.map((avoid, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 bg-red-900/30 rounded-md text-xs text-red-300 border border-red-700/50"
                                    >
                                        {avoid}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ATS Rules */}
                <div>
                    <h5 className="text-sm font-semibold text-white mb-3">Key Rules for {atsProfile.name}</h5>
                    <ul className="space-y-2">
                        {atsProfile.rules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-white">{idx + 1}</span>
                                </div>
                                {rule}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Call to Action */}
                {!isAboveTarget && (
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-center"
                    >
                        <p className="text-white font-semibold mb-2">
                            🎯 You're {Math.abs(scoreGap).toFixed(0)}% away from the target score
                        </p>
                        <p className="text-indigo-100 text-sm">
                            Use the AI optimizer to apply {atsProfile.name}-specific improvements
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
