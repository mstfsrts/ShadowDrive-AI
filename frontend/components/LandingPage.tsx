"use client";

// ─── ShadowDrive AI — Landing Page (Refactored Phase 2 UX) ───
// UX Overhaul: The Authentication inputs (Google/Email) have been brought
// "Above the fold" directly under the Hero area so mobile users do not
// have to scroll down to register or log in.
// Restored the exact visual CTA stack requested by the user.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthModal from "@/components/AuthModal";
import { LanguagePopup, LanguageSwitcher } from "@/components/LanguageSelector";

export default function LandingPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const t = useTranslations('landing');
    const tc = useTranslations('common');

    return (
        <div className="min-h-dvh flex flex-col max-w-lg mx-auto px-4 pb-10">
            {/* ── Header ─────────────────────────────────────── */}
            <header
                className="flex items-center justify-between py-4 sticky top-0 z-10
                               bg-background/80 backdrop-blur-md border-b border-border/20"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🚗</span>
                    <span className="font-black text-lg tracking-tight leading-none">
                        <span className="text-gradient">Shadow</span>
                        <span className="text-foreground">Drive</span>
                        <span className="text-foreground-muted font-light text-sm ml-1">AI</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </header>

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="flex flex-col items-center text-center pt-8 pb-6">
                <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 wave-ring" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 wave-ring-2" />
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 wave-ring-3" />
                    <div className="absolute inset-6 rounded-full bg-emerald-500/5" />
                    <span className="text-7xl relative z-10 select-none" aria-hidden>
                        🚗
                    </span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                    <span className="text-gradient">Shadow</span>
                    <span className="text-foreground">Drive</span>
                    <span className="text-foreground-muted font-light text-3xl sm:text-4xl ml-2">AI</span>
                </h1>

                <p className="text-foreground-secondary text-base leading-relaxed max-w-[280px]">{t('tagline')}</p>
            </section>

            {/* ── [UX Fix] Above The Fold Auth (Stack Design) ── */}
            <section className="flex flex-col gap-3 mb-10 mt-2">
                {/* Google — Primary */}
                <GoogleSignInButton redirectAfterLogin="/dashboard" label={t('googleSignIn')} />

                {/* Email — Secondary (Triggers AuthModal) */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                               bg-card-hover border border-border hover:border-border-hover
                               text-foreground font-semibold text-base
                               active:scale-[0.98] transition-all duration-300 shadow-sm"
                >
                    {t('emailSignIn')}
                </button>

                {/* Guest — Ghost */}
                <div className="flex flex-col items-center gap-1.5 mt-3">
                    <button
                        onClick={() => router.replace("/dashboard")}
                        className="py-3 text-foreground-secondary hover:text-foreground text-sm
                                   transition-colors duration-200"
                    >
                        {t('guestContinue')}
                    </button>
                    <p className="text-foreground-faint text-xs">{t('guestWarning')}</p>
                </div>
            </section>

            {/* ── Features ───────────────────────────────────── */}
            <section className="mb-10">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: "🎧", title: t('feature1Title'), desc: t('feature1Desc') },
                        { icon: "🤖", title: t('feature2Title'), desc: t('feature2Desc') },
                        { icon: "📚", title: t('feature3Title'), desc: t('feature3Desc') },
                    ].map(f => (
                        <div key={f.title} className="bg-card border border-border/50 rounded-2xl p-3.5 flex flex-col gap-1.5">
                            <span className="text-2xl">{f.icon}</span>
                            <p className="text-foreground font-semibold text-xs leading-tight">{f.title}</p>
                            <p className="text-foreground-muted text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────── */}
            <section className="mb-10">
                <h2
                    className="font-bold text-sm uppercase tracking-wider mb-4 text-center
                               text-foreground-muted"
                >
                    {t('howItWorks')}
                </h2>
                <div className="flex flex-col gap-2.5">
                    {[
                        { n: "1", text: t('step1') },
                        { n: "2", text: t('step2') },
                        { n: "3", text: t('step3') },
                    ].map((step, idx, arr) => (
                        <div key={step.n}>
                            <div
                                className="flex items-center gap-3.5 bg-card border border-border/50
                                            rounded-2xl px-4 py-3.5"
                            >
                                <div
                                    className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25
                                               flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0"
                                >
                                    {step.n}
                                </div>
                                <p className="text-foreground-secondary text-sm">{step.text}</p>
                            </div>
                            {idx < arr.length - 1 && (
                                <div className="flex justify-center my-1">
                                    <span className="text-foreground-faint text-xs">↓</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-border/20 text-center">
                <p className="text-foreground-faint text-xs">{t('footer')}</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                    {[tc('free'), tc('adFree'), tc('noDataStored')].map(tag => (
                        <span key={tag} className="text-foreground-faint text-xs flex items-center gap-1">
                            <span className="text-emerald-500/60">✓</span> {tag}
                        </span>
                    ))}
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} redirectAfterLogin="/dashboard" />

            {/* First-visit language selection popup */}
            <LanguagePopup />
        </div>
    );
}
