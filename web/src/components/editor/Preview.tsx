"use client";

import React from 'react';
import { ResumeData } from '@/types/resume';

interface PreviewProps {
    data: ResumeData;
    scale?: number;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
    if (!data) return null;
    const { personalInfo, summary, experience, projects, skills, education } = data;

    return (
        <div
            className="bg-white text-slate-900 shadow-2xl origin-top-left"
            style={{
                width: '210mm',
                minHeight: '297mm',
                transform: `scale(${scale})`,
                fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}
            id="resume-content-to-export"
        >
            <div className="p-12 h-full space-y-8">
                {/* Modern Header */}
                <header className="text-center space-y-3">
                    <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-slate-950">
                        {personalInfo.fullName || 'YOUR NAME'}
                    </h1>
                    <div className="text-[10pt] flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-600 font-bold uppercase tracking-widest">
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                    </div>
                    <div className="text-[9pt] flex flex-wrap justify-center gap-x-4 text-blue-700 font-bold underline">
                        {personalInfo.linkedin && <a href={personalInfo.linkedin}>LinkedIn</a>}
                        {personalInfo.github && <a href={personalInfo.github}>GitHub</a>}
                        {personalInfo.website && <a href={personalInfo.website}>Portfolio</a>}
                    </div>
                </header>

                {/* Executive Summary */}
                {summary && (
                    <section>
                        <SectionTitle title="Executive Summary" />
                        <p className="text-[10pt] leading-[1.6] text-slate-800 text-justify font-medium">{summary}</p>
                    </section>
                )}

                {/* Experience - The Core Section */}
                {experience.length > 0 && (
                    <section>
                        <SectionTitle title="Professional Experience" />
                        <div className="space-y-6">
                            {experience.map((exp) => (
                                <div key={exp.id} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-extrabold text-[11pt] text-slate-900 tracking-tight">{exp.company}</h3>
                                        <span className="text-[9pt] font-black text-slate-500 uppercase tracking-widest">{exp.location}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[10pt] text-blue-700 italic">{exp.role}</span>
                                        <span className="text-[9pt] font-bold text-slate-700">{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 text-[9.5pt] space-y-1.5 text-slate-800">
                                        {exp.bullets.map((bullet, idx) => (
                                            bullet && <li key={idx} className="pl-2 leading-[1.4] font-medium">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {projects.length > 0 && (
                    <section>
                        <SectionTitle title="Technical Projects" />
                        <div className="space-y-4">
                            {projects.map((proj) => (
                                <div key={proj.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-extrabold text-[10pt] text-slate-900 uppercase tracking-tight">{proj.name}</h3>
                                        {proj.link && <span className="text-[8pt] font-bold text-blue-700 underline italic lowercase">{proj.link}</span>}
                                    </div>
                                    <ul className="list-disc list-outside ml-4 text-[9pt] space-y-1 text-slate-700">
                                        {proj.bullets.map((bullet, idx) => (
                                            bullet && <li key={idx} className="pl-2 leading-[1.3] font-medium">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills - Matrix View */}
                {skills && skills.length > 0 && (
                    <section>
                        <SectionTitle title="Technical Matrix" />
                        <div className="space-y-2">
                            {skills.map((cat) => (
                                <div key={cat.id} className="text-[9.5pt]">
                                    <span className="font-extrabold text-slate-900 uppercase tracking-wider mr-2">{cat.name}:</span>
                                    <span className="text-slate-800 font-medium">{cat.skills.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section>
                        <SectionTitle title="Education" />
                        <div className="space-y-3">
                            {education.map((edu) => (
                                <div key={edu.id} className="flex justify-between items-baseline">
                                    <div className="text-[10pt]">
                                        <span className="font-extrabold text-slate-900">{edu.institution}</span>
                                        <span className="mx-2 text-slate-400">|</span>
                                        <span className="font-bold text-slate-700 italic">{edu.degree}</span>
                                    </div>
                                    <span className="text-[9pt] font-black text-slate-500 uppercase tracking-widest">{edu.graduationDate}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[11pt] font-black uppercase tracking-[0.2em] text-slate-950 whitespace-nowrap">{title}</h2>
        <div className="h-[1.5pt] flex-1 bg-slate-200" />
    </div>
);
