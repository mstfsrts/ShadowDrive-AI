'use client';

// ─── ShadowDrive AI — Landing Page ───
// Onboarding screen shown to unauthenticated visitors.
// After sign-in → redirects to /dashboard.
// Guest mode → navigates to /dashboard directly.

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import AuthModal from '@/components/AuthModal';

export default function LandingPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    }

    return (
        <div className="min-h-dvh flex flex-col max-w-lg mx-auto px-4 pb-10">

            {/* ── Header ─────────────────────────────────────── */}
            <header className="flex items-center justify-between py-4 sticky top-0 z-10
                               bg-background/80 backdrop-blur-md border-b border-border/20">
                <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🚗</span>
                    <span className="font-black text-lg tracking-tight leading-none">
                        <span className="text-gradient">Shadow</span>
                        <span className="text-foreground">Drive</span>
                        <span className="text-foreground-muted font-light text-sm ml-1">AI</span>
                    </span>
                </div>
                <ThemeToggle />
            </header>

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="flex flex-col items-center text-center pt-12 pb-10">
                {/* Animated car with radial wave rings */}
                <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 wave-ring" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 wave-ring-2" />
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 wave-ring-3" />
                    <div className="absolute inset-6 rounded-full bg-emerald-500/5" />
                    <span className="text-7xl relative z-10 select-none" aria-hidden>🚗</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                    <span className="text-gradient">Sürüşte</span>
                    <br />
                    <span className="text-foreground">Hollandaca Öğren</span>
                </h1>

                <p className="text-foreground-secondary text-base leading-relaxed max-w-[280px]">
                    Trafikte geçen saatleri dil öğrenmeye dönüştür.
                    AI destekli sesli dersler, sıfır ekran.
                </p>
            </section>

            {/* ── Features ───────────────────────────────────── */}
            <section className="mb-10">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: '🎧', title: 'Eller Serbest', desc: 'Ekrana bakmana gerek yok' },
                        { icon: '🤖', title: 'AI Destekli', desc: 'Her konuda diyalog üretir' },
                        { icon: '📚', title: 'Müfredat', desc: 'Delftse Methode temelli' },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="bg-card border border-border/50 rounded-2xl p-3.5 flex flex-col gap-1.5"
                        >
                            <span className="text-2xl">{f.icon}</span>
                            <p className="text-foreground font-semibold text-xs leading-tight">{f.title}</p>
                            <p className="text-foreground-muted text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ───────────────────────────────── */}
            <section className="mb-10">
                <h2 className="text-foreground font-bold text-sm uppercase tracking-wider mb-4 text-center
                               text-foreground-muted">
                    Nasıl Çalışır?
                </h2>
                <div className="flex flex-col gap-2.5">
                    {[
                        { n: '1', text: 'Kurs veya konu seç' },
                        { n: '2', text: 'Hollandacayı dinle, tekrar et' },
                        { n: '3', text: 'Türkçe çeviri otomatik gelir' },
                    ].map((step, idx, arr) => (
                        <div key={step.n}>
                            <div className="flex items-center gap-3.5 bg-card border border-border/50
                                            rounded-2xl px-4 py-3.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25
                                               flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
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

            {/* ── CTA ────────────────────────────────────────── */}
            <section className="flex flex-col gap-3 mb-5">
                {/* Google — Primary */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                               bg-white hover:bg-gray-50 text-[#3c4043] font-semibold text-base
                               border border-[#dadce0] hover:border-[#c6c6c6]
                               active:scale-[0.98] transition-all duration-200 disabled:opacity-60
                               shadow-sm"
                >
                    {isGoogleLoading ? (
                        <div className="w-5 h-5 border-2 border-[#dadce0] border-t-[#4285f4] rounded-full animate-spin" />
                    ) : (
                        /* Google logo — official full-color G */
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    Google ile Başla
                </button>

                {/* Email — Secondary */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-4 rounded-2xl bg-card border border-border hover:border-border-hover
                               text-foreground font-semibold text-base
                               active:scale-[0.98] transition-all duration-300"
                >
                    E-posta ile Giriş / Kayıt
                </button>

                {/* Guest — Ghost */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 text-foreground-secondary hover:text-foreground text-sm
                               transition-colors duration-200"
                >
                    Giriş yapmadan devam et →
                </button>
            </section>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {['Ücretsiz', 'Reklamsız', 'Veri saklanmaz'].map((tag) => (
                    <span key={tag} className="text-foreground-faint text-xs flex items-center gap-1">
                        <span className="text-emerald-500/60">✓</span> {tag}
                    </span>
                ))}
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-6 border-t border-border/20 text-center">
                <p className="text-foreground-faint text-xs">
                    © 2026 ShadowDrive AI · Türk profesyoneller için
                </p>
            </footer>

            {/* Auth modal (email/password) */}
            <AuthModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                redirectAfterLogin="/dashboard"
            />
        </div>
    );
}
