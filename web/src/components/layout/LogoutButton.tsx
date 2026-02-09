"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";

export const LogoutButton = () => {
    const router = useRouter();
    const { setGitHubStatus } = useResumeStore();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout');
            document.cookie = "github_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setGitHubStatus({ linked: false, username: '', avatar: '' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all group mt-2"
        >
            <div className="p-1.5 bg-red-500/10 group-hover:bg-red-500/20 rounded-lg transition-colors">
                <LogOut size={16} className="text-red-500" />
            </div>
            <span>Log Out</span>
        </button>
    );
};
