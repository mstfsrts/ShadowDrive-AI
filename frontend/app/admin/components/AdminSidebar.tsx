"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Activity, Settings, LogOut } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Activity", href: "/admin/activity", icon: Activity },
        { name: "System Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f18]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 -translate-x-full">
            {/* Logo area */}
            <div className="flex h-16 items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold text-lg">S</span>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        ShadowDrive
                    </span>
                </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col gap-1.5">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                            >
                                <Icon
                                    size={18}
                                    className={isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"}
                                />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                    <LogOut size={18} className="text-slate-500" />
                    Back to App
                </Link>
            </div>
        </aside>
    );
}
