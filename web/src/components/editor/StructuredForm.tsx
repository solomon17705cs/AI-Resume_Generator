"use client";

import React, { useState } from "react";
import {
    Plus,
    Trash2,
    Wand2,
    Sparkles,
    ChevronRight,
    ChevronDown
} from "lucide-react";
import { ResumeData, Experience, Project, Education } from "@/types/resume";
import axios from "axios";

interface StructuredFormProps {
    data: ResumeData;
    setData: React.Dispatch<React.SetStateAction<ResumeData>>;
    activeTab: string;
    jobDescription: string;
}

export const StructuredForm: React.FC<StructuredFormProps> = ({
    data,
    setData,
    activeTab,
    jobDescription
}) => {
    const [optimizingId, setOptimizingId] = useState<string | null>(null);

    const updatePersonalInfo = (field: string, value: string) => {
        setData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const handleAIIdentify = async (section: 'experience' | 'projects', parentId: string, bulletIndex: number) => {
        if (!jobDescription) {
            alert("Please paste a Job Description first to use AI Optimization.");
            return;
        }

        const list = section === 'experience' ? data.experience : data.projects;
        const parent = list.find(item => item.id === parentId);
        if (!parent) return;

        const originalBullet = parent.bullets[bulletIndex];
        setOptimizingId(`${parentId}-${bulletIndex}`);

        try {
            const response = await axios.post('/api/optimize', {
                bullet: originalBullet,
                job_description: jobDescription
            });

            const optimized = response.data.optimizedSlug;

            setData(prev => {
                const newList = (prev[section] as any[]).map((item: any) => {
                    if (item.id === parentId) {
                        const newBullets = [...item.bullets];
                        newBullets[bulletIndex] = optimized;
                        return { ...item, bullets: newBullets };
                    }
                    return item;
                });
                return { ...prev, [section]: newList };
            });
        } catch (error) {
            console.error("AI Fix failed", error);
        } finally {
            setOptimizingId(null);
        }
    };

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: "",
            role: "",
            location: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            bullets: [""]
        };
        setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "personal" && (
                <section className="space-y-8">
                    <SectionHeader title="Identify & Contact" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" value={data.personalInfo.fullName} onChange={(v: string) => updatePersonalInfo('fullName', v)} />
                        <InputField label="Email Address" value={data.personalInfo.email} onChange={(v: string) => updatePersonalInfo('email', v.toLowerCase())} />
                        <InputField label="Phone Number" value={data.personalInfo.phone} onChange={(v: string) => updatePersonalInfo('phone', v)} />
                        <InputField label="Location" value={data.personalInfo.location} onChange={(v: string) => updatePersonalInfo('location', v)} />
                        <InputField label="LinkedIn URL" value={data.personalInfo.linkedin} onChange={(v: string) => updatePersonalInfo('linkedin', v)} />
                        <InputField label="GitHub URL" value={data.personalInfo.github} onChange={(v: string) => updatePersonalInfo('github', v)} />
                    </div>
                </section>
            )}

            {activeTab === "experience" && (
                <section className="space-y-8">
                    <SectionHeader title="Professional Experience" onAdd={addExperience} />
                    <div className="space-y-6">
                        {data.experience.map((exp, idx) => (
                            <div key={exp.id} className="glass-dark border border-white/5 rounded-3xl p-8 relative group">
                                <button
                                    onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))}
                                    className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={20} />
                                </button>

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <InputField label="Company" value={exp.company} onChange={(v: string) => {
                                        const newList = [...data.experience];
                                        newList[idx].company = v;
                                        setData(prev => ({ ...prev, experience: newList }));
                                    }} />
                                    <InputField label="Job Title" value={exp.role} onChange={(v: string) => {
                                        const newList = [...data.experience];
                                        newList[idx].role = v;
                                        setData(prev => ({ ...prev, experience: newList }));
                                    }} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            Impact Bullets
                                            <Sparkles size={12} className="text-blue-500" />
                                        </label>
                                    </div>
                                    {exp.bullets.map((bullet, bIdx) => (
                                        <div key={bIdx} className="relative group/bullet">
                                            <textarea
                                                value={bullet}
                                                onChange={(e) => {
                                                    const newList = [...data.experience];
                                                    newList[idx].bullets[bIdx] = e.target.value;
                                                    setData(prev => ({ ...prev, experience: newList }));
                                                }}
                                                placeholder="Describe your impact..."
                                                className="w-full bg-slate-950/50 border border-white/5 hover:border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 min-h-[100px] transition-all"
                                            />
                                            <button
                                                onClick={() => handleAIIdentify('experience', exp.id, bIdx)}
                                                disabled={optimizingId === `${exp.id}-${bIdx}`}
                                                className={`absolute bottom-4 right-4 p-2.5 rounded-xl transition-all shadow-xl ${optimizingId === `${exp.id}-${bIdx}`
                                                    ? 'bg-blue-600/20 text-blue-400 rotate-180 animate-spin'
                                                    : 'bg-blue-600 text-white hover:scale-110 shadow-blue-600/20 opacity-0 group-hover/bullet:opacity-100'
                                                    }`}
                                                title="AI Fix - Rewrite with XYZ Formula"
                                            >
                                                <Wand2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newList = [...data.experience];
                                            newList[idx].bullets.push("");
                                            setData(prev => ({ ...prev, experience: newList }));
                                        }}
                                        className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:text-blue-400 transition-all px-2"
                                    >
                                        <Plus size={14} /> Add Bullet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === "summary" && (
                <section className="space-y-8">
                    <SectionHeader title="Professional Summary" />
                    <textarea
                        value={data.summary}
                        onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
                        className="w-full bg-slate-900 border border-white/10 rounded-3xl p-6 text-slate-200 focus:outline-none focus:border-blue-500 min-h-[200px]"
                        placeholder="Introduce yourself to the candidate pool..."
                    />
                </section>
            )}

            {activeTab === "skills" && (
                <section className="space-y-8">
                    <SectionHeader title="Key Skills" />
                    <div className="space-y-6">
                        {data.skills.map((category, catIdx) => (
                            <SkillInput
                                key={category.id}
                                label={category.name}
                                values={category.skills}
                                onChange={(v: string[]) => {
                                    const newSkills = [...data.skills];
                                    newSkills[catIdx].skills = v;
                                    setData(prev => ({ ...prev, skills: newSkills }));
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

const SectionHeader = ({ title, onAdd }: { title: string, onAdd?: () => void }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black font-display tracking-tight text-white">{title}</h2>
        </div>
        {onAdd && (
            <button
                onClick={onAdd}
                className="px-5 py-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-sm flex items-center gap-2"
            >
                <Plus size={18} /> Add Entry
            </button>
        )}
    </div>
);

const InputField = ({ label, value, onChange }: any) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-all font-medium"
        />
    </div>
);

const SkillInput = ({ label, values, onChange }: any) => {
    const [val, setVal] = useState("");
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
            <div className="flex flex-wrap gap-2 mb-4">
                {values.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold flex items-center gap-2 group">
                        {s}
                        <Trash2
                            size={12}
                            className="cursor-pointer text-slate-600 hover:text-red-500 transition-colors"
                            onClick={() => onChange(values.filter((_: any, idx: number) => idx !== i))}
                        />
                    </span>
                ))}
            </div>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && val) {
                            onChange([...values, val]);
                            setVal("");
                        }
                    }}
                    placeholder="Type skill and press enter..."
                    className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
            </div>
        </div>
    );
};
