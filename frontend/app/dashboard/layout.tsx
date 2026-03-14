'use client';

// ─── ShadowDrive AI — Dashboard Layout ───
// Wraps all /dashboard/* pages with:
// - ToastProvider + CoursesProvider (shared state)
// - Tab bar (URL-based: Kurslar | AI | Metnim) — shown only on main tab pages
// Global header (AppHeader) is rendered in root layout.

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ToastProvider } from './_contexts/ToastContext';
import { CoursesProvider } from './_contexts/CoursesContext';
import { DASHBOARD_TABS } from './_constants';

// ─── Tab Switcher (URL-based) ───

function TabSwitcher({ activeTab }: { activeTab: string }) {
    const t = useTranslations('dashboard');
    return (
        <div className="tab-switcher flex rounded-2xl bg-card border border-border/50 p-1.5 mb-8">
            {DASHBOARD_TABS.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    id={`tab-${tab.key}`}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 text-center ${
                         activeTab === tab.key
                             ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                             : 'text-foreground-secondary hover:text-foreground'
                     }`}
                >
                    {tab.icon} {t(tab.key as 'courses' | 'ai' | 'custom')}
                </Link>
            ))}
        </div>
    );
}

// ─── Main tab page paths (show tabs only here) ───
const TAB_PATHS = DASHBOARD_TABS.map(t => t.href);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isTabPage = TAB_PATHS.some(p => pathname === p);
    const activeTab = DASHBOARD_TABS.find(t => pathname.startsWith(t.href))?.key ?? 'courses';

    return (
        <ToastProvider>
            <CoursesProvider>
                {isTabPage ? (
                    <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
                        <TabSwitcher activeTab={activeTab} />
                        {children}
                    </main>
                ) : (
                    children
                )}
            </CoursesProvider>
        </ToastProvider>
    );
}
