'use client';

// ─── ShadowDrive AI — Auth Modal ───
// Bottom-sheet modal with Google Sign-In + Email/Password form.
// Driving-safe: large touch targets, minimal distractions.

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectAfterLogin?: string;
}

type AuthMode = 'signin' | 'register';

export default function AuthModal({ isOpen, onClose, redirectAfterLogin }: AuthModalProps) {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    async function handleGoogleSignIn() {
        setLoading(true);
        setError('');
        await signIn('google', { callbackUrl: redirectAfterLogin ?? '/' });
    }

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'register') {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Kayıt başarısız.');
                setLoading(false);
                return;
            }
            // Auto sign-in after registration
        }

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('E-posta veya şifre hatalı.');
            setLoading(false);
        } else if (redirectAfterLogin) {
            router.push(redirectAfterLogin);
        } else {
            onClose();
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Bottom sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6
                            border-t border-border shadow-2xl animate-fade-in
                            max-w-lg mx-auto">

                {/* Handle bar */}
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />

                <h2 className="text-xl font-bold text-foreground text-center mb-1">
                    {mode === 'signin' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </h2>
                <p className="text-foreground-muted text-sm text-center mb-6">
                    İlerlemeni kaydet, istediğin yerden devam et
                </p>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                               bg-card-hover border border-border hover:border-border-hover
                               text-foreground font-medium transition-all duration-300
                               active:scale-[0.98] disabled:opacity-50 mb-4"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google ile Giriş Yap
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-foreground-faint text-xs">veya</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email form */}
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Adın"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl bg-card-hover border border-border
                                       text-foreground placeholder:text-foreground-faint
                                       focus:outline-none focus:ring-2 focus:ring-ring text-base"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-4 rounded-2xl bg-card-hover border border-border
                                   text-foreground placeholder:text-foreground-faint
                                   focus:outline-none focus:ring-2 focus:ring-ring text-base"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Şifre (en az 8 karakter)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-4 pr-12 rounded-2xl bg-card-hover border border-border
                                       text-foreground placeholder:text-foreground-faint
                                       focus:outline-none focus:ring-2 focus:ring-ring text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted
                                       hover:text-foreground transition-colors"
                            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        >
                            {showPassword ? (
                                /* Eye-off icon */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                /* Eye icon */
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base
                                   hover:bg-emerald-400 active:scale-[0.98] transition-all duration-300
                                   disabled:opacity-50 mt-1"
                    >
                        {loading ? 'Lütfen bekleyin...' : mode === 'signin' ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </button>
                </form>

                {/* Toggle mode */}
                <button
                    onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setError(''); }}
                    className="w-full text-center text-foreground-secondary text-sm mt-4
                               hover:text-foreground transition-colors duration-200"
                >
                    {mode === 'signin'
                        ? 'Hesabın yok mu? Kaydol'
                        : 'Zaten hesabın var mı? Giriş yap'}
                </button>

                {/* Guest mode note */}
                <p className="text-foreground-faint text-xs text-center mt-4">
                    Giriş yapmadan da kullanabilirsin — ilerleme kaydedilmez
                </p>
            </div>
        </>
    );
}
