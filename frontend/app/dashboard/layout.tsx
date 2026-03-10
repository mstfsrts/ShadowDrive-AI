'use client';

// ─── ShadowDrive AI — Dashboard Layout ───
// Wraps all /dashboard/* pages with:
// - ToastProvider + CoursesProvider (shared state)
// - Header (AuthButton + ThemeToggle + branding)
// - Tab bar (URL-based: Kurslar | AI | Metnim)
// Header + tabs are shown only on main tab pages; drill-down pages render their own navigation.

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import ThemeToggle from '@/components/ThemeToggle';
import { ToastProvider } from './_contexts/ToastContext';
import { CoursesProvider } from './_contexts/CoursesContext';
import { DASHBOARD_TABS } from './_constants';

// ─── Dashboard Header ───

function DashboardHeader() {
    return (
        <>
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex-shrink-0 min-w-[44px]">
                    <AuthButton />
                </div>
                <ThemeToggle />
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="mb-3 text-5xl">🚗</div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    <span className="text-gradient">Shadow</span>
                    <span className="text-foreground">Drive</span>
                    <span className="text-foreground-muted font-light ml-2 text-xl align-middle">AI</span>
                </h1>
                <p className="text-foreground-secondary text-center text-base max-w-xs leading-relaxed">
                    Araba kullanırken Hollandaca öğren
                </p>
                <div className="mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 opacity-60" />
            </div>
        </>
    );
}

// ─── Tab Switcher (URL-based) ───

function TabSwitcher({ activeTab }: { activeTab: string }) {
    return (
        <div className="tab-switcher flex rounded-2xl bg-card border border-border/50 p-1.5 mb-8">
            {DASHBOARD_TABS.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    replace
                    id={`tab-${tab.key}`}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 text-center ${
                         activeTab === tab.key
                             ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                             : 'text-foreground-secondary hover:text-foreground'
                     }`}
                >
                    {tab.icon} {tab.label}
                </Link>
            ))}
        </div>
    );
}

// ─── Main tab page paths (show header + tabs only here) ───
const TAB_PATHS = DASHBOARD_TABS.map(t => t.href);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isTabPage = TAB_PATHS.some(p => pathname === p);
    const activeTab = DASHBOARD_TABS.find(t => pathname.startsWith(t.href))?.key ?? 'courses';

    return (
        <ToastProvider>
            <CoursesProvider>
                {isTabPage ? (
                    <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                        <DashboardHeader />
                        <TabSwitcher activeTab={activeTab} />
                        {children}
                    </main>
                ) : (
                    // Drill-down pages (category, course-detail, etc.) render their own layout
                    children
                )}
            </CoursesProvider>
        </ToastProvider>
    );
}
