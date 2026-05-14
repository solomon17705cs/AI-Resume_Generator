"use client";

import React, { useState } from 'react';
import { ResumeData } from '@/types/resume';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

interface PreviewProps {
    data: ResumeData;
    scale?: number;
    jobDescription?: string;
    isInteractive?: boolean;
    onUpdate?: (updates: Partial<ResumeData>) => void;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1, jobDescription, isInteractive = false, onUpdate }) => {
    const [optimizingId, setOptimizingId] = useState<string | null>(null);

    if (!data) return null;
    const { personalInfo, summary, experience, projects, skills, education } = data;

    const handleOptimizeSummary = async () => {
        if (!jobDescription || !onUpdate) return;
        setOptimizingId('summary');
        try {
            const res = await axios.post('/api/optimize-summary', {
                summary: summary,
                job_description: jobDescription
            });
            if (confirm(`AI suggests this optimized summary:\n\n"${res.data.optimizedSummary}"\n\nApply to preview?`)) {
                onUpdate({ summary: res.data.optimizedSummary });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setOptimizingId(null);
        }
    };

    const handleOptimizeBullet = async (section: 'experience' | 'projects', entryId: string, bulletIdx: number) => {
        if (!jobDescription || !onUpdate) return;
        const id = `${section}-${entryId}-${bulletIdx}`;
        setOptimizingId(id);

        try {
            const bulletText = section === 'experience'
                ? experience.find(e => e.id === entryId)?.bullets[bulletIdx]
                : projects.find(p => p.id === entryId)?.bullets[bulletIdx];

            if (!bulletText) return;

            const res = await axios.post('/api/optimize', {
                bullet: bulletText,
                job_description: jobDescription
            });

            if (confirm(`AI optimized statement:\n\n"${res.data.optimizedSlug}"\n\nApply to preview?`)) {
                if (section === 'experience') {
                    const newExp = experience.map(e => {
                        if (e.id === entryId) {
                            const newBullets = [...e.bullets];
                            newBullets[bulletIdx] = res.data.optimizedSlug;
                            return { ...e, bullets: newBullets };
                        }
                        return e;
                    });
                    onUpdate({ experience: newExp });
                } else {
                    const newProj = projects.map(p => {
                        if (p.id === entryId) {
                            const newBullets = [...p.bullets];
                            newBullets[bulletIdx] = res.data.optimizedSlug;
                            return { ...p, bullets: newBullets };
                        }
                        return p;
                    });
                    onUpdate({ projects: newProj });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setOptimizingId(null);
        }
    };

    return (
        <div
            className="text-slate-900 bg-white rounded-lg shadow-xl"
            style={{
                width: '210mm',
                minHeight: '297mm',
                fontFamily: 'Inter, Helvetica, Arial, sans-serif'
            }}
            id="resume-content-to-export"
        >
            <div className="p-12 space-y-8">
                {/* Modern Header */}
                <header className="text-center space-y-3">
                    <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-slate-950">
                        {personalInfo.fullName || 'YOUR NAME'}
                    </h1>
                    <div className="text-[10pt] flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-600 font-bold tracking-widest">
                        {personalInfo.email && <span className="lowercase font-medium">{personalInfo.email}</span>}
                        {personalInfo.phone && <span className="uppercase">{personalInfo.phone}</span>}
                        {personalInfo.location && <span className="uppercase">{personalInfo.location}</span>}
                    </div>
                    <div className="text-[9pt] flex flex-wrap justify-center gap-x-4 text-blue-700 font-bold underline">
                        {personalInfo.linkedin && <a href={personalInfo.linkedin}>LinkedIn</a>}
                        {personalInfo.github && <a href={personalInfo.github}>GitHub</a>}
                        {personalInfo.website && <a href={personalInfo.website}>Portfolio</a>}
                    </div>
                </header>

                {/* Content Sections - Order and styling depends on experience level */}
                {(() => {
                    const hasProjects = projects.length > 0 && projects.some(p => p.name.trim() && !p.name.includes('['));
                    const hasExperience = experience.length > 0 && experience.some(e => e.company.trim() && !e.company.includes('['));
                    const isFresher = !hasProjects;
                    const isEntryLevel = !hasExperience;

                    const summarySection = (
                        <section key="summary" className={isEntryLevel ? 'py-4' : ''}>
                            <SectionTitle title="Executive Summary" />
                            <p className={`${isEntryLevel ? 'text-[11pt] leading-[1.8]' : 'text-[10pt] leading-[1.6]'} text-justify font-medium ${!summary ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                {summary || (isEntryLevel
                                    ? '[As a dedicated entry-level professional, I offer a strong foundation in core technical domains and a passionate drive for innovative problem-solving. Driven by a commitment to technical excellence, I leverage my academic training and project experience to build high-quality, scalable applications that solve real-world challenges. My academic background and hands-on projects have equipped me with high-demand skills, which I am eager to apply towards achieving shared organizational goals. I am a fast learner, committed to continuous professional growth and delivering measurable impact in a collaborative team environment.]'
                                    : '[Write a brief high-impact summary here. Highlight your years of experience, core technical stack, and your most significant achievement or specialization.]'
                                )}
                            </p>
                        </section>
                    );

                    const educationSection = (
                        <section key="education">
                            <SectionTitle title="Education" />
                            <div className="space-y-3">
                                {education.length > 0 ? education.map((edu, i) => (
                                    <div key={edu.id || i} className="flex justify-between items-baseline">
                                        <div className="text-[10pt]">
                                            <span className={`font-extrabold ${edu.institution.startsWith('[') ? 'text-slate-400' : 'text-slate-900'}`}>{edu.institution}</span>
                                            <span className="mx-2 text-slate-400">|</span>
                                            <span className={`font-bold italic ${edu.degree.startsWith('[') ? 'text-slate-400' : 'text-slate-700'}`}>{edu.degree}</span>
                                        </div>
                                        <span className="text-[9pt] font-black text-slate-500 uppercase tracking-widest">{edu.graduationDate}</span>
                                    </div>
                                )) : isInteractive && (
                                    <p className="text-[9pt] italic text-slate-400">Add education details in the editor.</p>
                                )}
                            </div>
                        </section>
                    );

                    const experienceSection = (
                        <section key="experience" className="space-y-4">
                            <SectionTitle title={isFresher ? "Academic & Professional Experience" : "Professional Experience"} />
                            <div className="space-y-6">
                                {experience.length > 0 ? experience.map((exp, i) => (
                                    <div key={exp.id || i} className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-extrabold text-[11pt] text-slate-900 tracking-tight">{exp.company || '[Company Name]'}</h3>
                                            <span className="text-[9pt] font-black text-slate-500 uppercase tracking-widest">{exp.location || '[Location]'}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-[10pt] text-blue-700 italic">{exp.role || '[Job Title]'}</span>
                                            <span className="text-[9pt] font-bold text-slate-700">{exp.startDate || '[Start Date]'} – {exp.endDate || '[End Date]'}</span>
                                        </div>
                                        <ul className="list-disc list-outside ml-4 text-[9.5pt] space-y-1.5 text-slate-800">
                                            {(exp.bullets ?? []).length > 0 && (exp.bullets ?? []).some(b => b?.trim()) ? (exp.bullets ?? []).map((bullet, idx) => (
                                                bullet && <li key={idx} className="pl-2 leading-[1.4] font-medium">{bullet}</li>
                                            )) : (
                                                <li className="pl-2 leading-[1.4] font-medium text-slate-400 italic">[Add your key accomplishments and impact here using metrics if possible]</li>
                                            )}
                                        </ul>
                                    </div>
                                )) : (
                                    <p className="text-[10pt] text-slate-400 italic font-medium">[No professional experience added yet. Add your work history in the editor.]</p>
                                )}
                            </div>
                        </section>
                    );

                    const projectsSection = (hasProjects || isInteractive) && (
                        <section key="projects" className="space-y-4">
                            <SectionTitle title="Technical Projects" />
                            <div className="space-y-4">
                                {projects.length > 0 ? projects.map((proj, i) => (
                                    <div key={proj.id || i} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-extrabold text-[10pt] text-slate-900 uppercase tracking-tight">{proj.name || '[Project Name]'}</h3>
                                            {proj.link && <span className="text-[8pt] font-bold text-blue-700 underline italic lowercase">{proj.link}</span>}
                                        </div>
                                        <ul className="list-disc list-outside ml-4 text-[9.5pt] space-y-1 text-slate-700">
                                            {(proj.bullets ?? []).length > 0 && (proj.bullets ?? []).some(b => b?.trim()) ? (proj.bullets ?? []).map((bullet, idx) => (
                                                bullet && <li key={idx} className="pl-2 leading-[1.3] font-medium">{bullet}</li>
                                            )) : (
                                                <li className="pl-2 leading-[1.3] font-medium text-slate-400 italic">[Describe your technical contribution and the technologies used]</li>
                                            )}
                                        </ul>
                                    </div>
                                )) : (
                                    <p className="text-[9pt] text-slate-400 italic font-medium">[Add technical projects to showcase your skills outside of work history]</p>
                                )}
                            </div>
                        </section>
                    );

                    const skillsSection = skills && (skills.length > 0 || isInteractive) && (
                        <section key="skills">
                            <SectionTitle title="Technical Matrix" />
                            <div className="space-y-2">
                                {skills.length > 0 ? skills.map((cat) => (
                                    <div key={cat.id} className="text-[9.5pt]">
                                        <span className={`font-extrabold uppercase tracking-wider mr-2 ${cat.name.startsWith('[') || cat.name.includes('New Domain') ? 'text-slate-400' : 'text-slate-900'}`}>{cat.name}:</span>
                                        <span className={`font-medium ${(cat.skills ?? []).length === 0 ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                                            {(cat.skills ?? []).length > 0 ? (cat.skills ?? []).filter(s => s?.trim()).join(', ') : (isInteractive ? '[Add skills...]' : '')}
                                        </span>
                                    </div>
                                )) : isInteractive && (
                                    <p className="text-[9pt] italic text-slate-400">Add skill categories in the editor.</p>
                                )}
                            </div>
                        </section>
                    );

                    // Order building logic
                    const sections: React.ReactElement[] = [summarySection];

                    if (isEntryLevel) {
                        // Entry-Level Order: Summary -> Education -> Projects -> Skills
                        sections.push(educationSection);
                        if ((hasProjects || isInteractive) && projectsSection) sections.push(projectsSection);
                        if (skillsSection) sections.push(skillsSection);
                    } else if (isFresher) {
                        // Fresher (Pro but no projects) Order: Summary -> Education -> Experience -> Skills
                        sections.push(educationSection);
                        sections.push(experienceSection);
                        if (skillsSection) sections.push(skillsSection);
                    } else {
                        // Professional Order: Summary -> Experience -> Projects -> Skills -> Education
                        sections.push(experienceSection);
                        if ((hasProjects || isInteractive) && projectsSection) sections.push(projectsSection);
                        if (skillsSection) sections.push(skillsSection);
                        sections.push(educationSection);
                    }

                    return sections;
                })()}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-export {
                        display: none !important;
                    }
                }
                @media screen {
                    .no-export {
                        display: flex !important;
                    }
                }
            `}} />
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[11pt] font-black uppercase tracking-[0.2em] text-slate-950 whitespace-nowrap">{title}</h2>
        <div className="h-[1.5pt] flex-1 bg-slate-200" />
    </div>
);
