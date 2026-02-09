import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layout, TrendingUp, Type, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface NeuralProgressOverlayProps {
    isVisible: boolean;
    currentStep: number;
    steps: { name: string; icon: React.ReactNode; description: string }[];
}

const NeuralProgressOverlay: React.FC<NeuralProgressOverlayProps> = ({ isVisible, currentStep, steps }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
                >
                    <div className="max-w-xl w-full p-12 bg-slate-900 border border-white/10 rounded-[60px] shadow-2xl relative overflow-hidden">
                        {/* Background Pulse */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />

                        <div className="relative z-10 space-y-12">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40">
                                    <Sparkles className="text-white animate-pulse" size={40} />
                                </div>
                                <h2 className="text-3xl font-black font-display tracking-tight">Neural Core Optimization</h2>
                                <p className="text-slate-400 font-medium">Re-engineering your profile for 90+ ATS compliance...</p>
                            </div>

                            <div className="space-y-6">
                                {steps.map((step, idx) => {
                                    const isCompleted = idx < currentStep;
                                    const isActive = idx === currentStep;
                                    const isPending = idx > currentStep;

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`flex items-start gap-5 p-4 rounded-3xl transition-all duration-500 ${isActive ? 'bg-white/5 border border-white/10' : ''}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-600'}`}>
                                                {isCompleted ? <CheckCircle2 size={24} /> : isActive ? <Loader2 size={24} className="animate-spin" /> : step.icon}
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                <h4 className={`text-sm font-black transition-colors ${isPending ? 'text-slate-600' : 'text-slate-200'}`}>
                                                    {step.name}
                                                </h4>
                                                <p className={`text-xs font-medium transition-colors ${isPending ? 'text-slate-700' : 'text-slate-500'}`}>
                                                    {step.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Optimization Progress</span>
                                    <span>{Math.round((currentStep / steps.length) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NeuralProgressOverlay;
