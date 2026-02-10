"use client";

import React from "react";
import {
    LayoutDashboard,
    FileText,
    Target,
    Compass,
    ShieldCheck,
    User,
    Settings as SettingsIcon,
    Zap,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
    isAdmin?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active: boolean }) => (
    <Link
        href={href}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active
                ? 'bg-blue-600/10 text-blue-400'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`}
    >
        {icon}
        {label}
    </Link>
);

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
    const pathname = usePathname();

    const isPageActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        if (href !== '/dashboard' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col glass-dark shrink-0 h-full">
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-12">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${isAdmin ? 'bg-red-600 shadow-red-500/20' : 'bg-blue-600 shadow-blue-500/20'
                        }`}>
                        <Zap className="text-white fill-white" size={16} />
                    </div>
                    <span className="text-xl font-black font-display tracking-tighter text-white">ATSense</span>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                    {!isAdmin ? (
                        <>
                            <SidebarItem
                                href="/dashboard"
                                icon={<LayoutDashboard size={18} />}
                                label="Overview"
                                active={isPageActive('/dashboard')}
                            />
                            <SidebarItem
                                href="/resumes"
                                icon={<FileText size={18} />}
                                label="My Resumes"
                                active={isPageActive('/resumes')}
                            />
                            <SidebarItem
                                href="/analysis"
                                icon={<Target size={18} />}
                                label="Job Analyzer"
                                active={isPageActive('/analysis')}
                            />
                            <SidebarItem
                                href="/jobs"
                                icon={<Compass size={18} />}
                                label="Pathfinder"
                                active={isPageActive('/jobs')}
                            />
                            <SidebarItem
                                href="/recommendations"
                                icon={<ShieldCheck size={18} />}
                                label="Recommendations"
                                active={isPageActive('/recommendations')}
                            />
                        </>
                    ) : (
                        <>
                            <SidebarItem
                                href="/recommendations"
                                icon={<ShieldAlert size={18} />}
                                label="Review Desk"
                                active={isPageActive('/recommendations')}
                            />
                            <div className="p-6 mt-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2">Admin Mode</p>
                                <p className="text-[9px] text-slate-500 leading-relaxed">
                                    You have authority to approve or reject recommendation letters.
                                </p>
                            </div>
                        </>
                    )}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-2 shrink-0">
                    <SidebarItem
                        href="/settings"
                        icon={<SettingsIcon size={18} />}
                        label="Settings"
                        active={isPageActive('/settings')}
                    />
                    <SidebarItem
                        href="/profile"
                        icon={<User size={18} />}
                        label="Profile"
                        active={isPageActive('/profile')}
                    />
                    <LogoutButton />
                </div>
            </div>
        </aside>
    );
};
