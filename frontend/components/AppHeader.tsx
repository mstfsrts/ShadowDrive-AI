'use client';

// ─── ShadowDrive AI — Global App Header ───
// Fixed header visible on ALL pages.
// Left: User avatar (→ profile) or login button
// Center: Logo (→ dashboard)
// Right: Language switcher + Theme toggle

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSelector';

function UserAvatar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations('profile');
    const tAuth = useTranslations('auth');
    const [showDropdown, setShowDropdown] = useState(false);

    if (status === 'loading') {
        return <div className="w-9 h-9 rounded-full bg-card-hover animate-pulse" />;
    }

    if (session?.user) {
        const user = session.user;
        const initials = user.name
            ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            : user.email?.[0]?.toUpperCase() ?? '?';

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-9 h-9 rounded-full
                               transition-all duration-200 active:scale-95 overflow-hidden border-0 p-0"
                    title={user.name ?? user.email ?? 'Profil'}
                    aria-label="Profil menüsü"
                >
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.image}
                            alt=""
                            className="w-full h-full object-cover rounded-full border border-border"
                        />
                    ) : (
                        <span className="w-full h-full rounded-full bg-emerald-500/20 border border-emerald-500/40
                                        flex items-center justify-center text-emerald-600 dark:text-emerald-400
                                        text-xs font-bold">
                            {initials}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute left-0 top-11 z-20 bg-card border border-border
                                        rounded-2xl shadow-2xl p-3 min-w-[180px] animate-fade-in">
                            <p className="text-foreground text-sm font-medium px-2 py-1 truncate max-w-[160px]">
                                {user.name || user.email}
                            </p>
                            <div className="h-px bg-border my-2" />
                            <button
                                onClick={() => { router.push('/dashboard/profile'); setShowDropdown(false); }}
                                className="w-full text-left px-2 py-2 text-sm text-foreground
                                           hover:bg-card-hover rounded-xl transition-colors duration-200 flex items-center gap-2"
                            >
                                <span>👤</span>
                                <span>{t('title')}</span>
                            </button>
                            <button
                                onClick={() => { signOut({ callbackUrl: '/' }); setShowDropdown(false); }}
                                className="w-full text-left px-2 py-2 text-sm text-red-500 dark:text-red-400
                                           hover:bg-card-hover rounded-xl transition-colors duration-200 flex items-center gap-2"
                            >
                                <span>🚪</span>
                                <span>{tAuth('signOut')}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <Link
            href="/"
            className="flex items-center justify-center px-3 h-9 rounded-full
                       bg-emerald-500/10 border border-emerald-500/20
                       text-emerald-600 dark:text-emerald-400
                       text-xs font-semibold
                       hover:bg-emerald-500/15 transition-colors active:scale-95"
        >
            {tAuth('signIn')}
        </Link>
    );
}

export default function AppHeader() {
    const pathname = usePathname();

    // Hide header on landing page and admin dashboard (has its own header)
    if (pathname === '/' || pathname?.startsWith('/admin')) return null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40
                               h-14 bg-card/80 backdrop-blur-lg">
                <div className="h-full flex items-center justify-between px-4 max-w-lg mx-auto">
                    {/* Left: User avatar */}
                    <div className="flex items-center min-w-[44px]">
                        <UserAvatar />
                    </div>

                    {/* Center: Logo */}
                    <Link
                        href="/dashboard/courses"
                        className="flex items-center gap-1.5 transition-opacity hover:opacity-80 active:scale-95"
                    >
                        <span className="text-lg">🚗</span>
                        <span className="text-base font-black tracking-tight">
                            <span className="text-gradient">Shadow</span>
                            <span className="text-foreground">Drive</span>
                        </span>
                    </Link>

                    {/* Right: Language + Theme */}
                    <div className="flex items-center gap-1.5">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            {/* Spacer to offset fixed header */}
            <div className="h-14" />
        </>
    );
}
