"use client";

import { useState } from "react";
import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface EmailAuthFormProps {
    redirectAfterLogin?: string;
    onSuccess?: () => void;
}

type AuthMode = "signin" | "register" | "forgot-password";

export default function EmailAuthForm({ redirectAfterLogin, onSuccess }: EmailAuthFormProps) {
    const router = useRouter();
    const t = useTranslations('auth');
    const [mode, setMode] = useState<AuthMode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        if (mode === "forgot-password") {
            try {
                const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || t('resetFail'));
                } else {
                    setSuccessMsg(data.message || t('resetSuccess'));
                }
            } catch {
                setError(t('connectionError'));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === "register") {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || t('registerFail'));
                setLoading(false);
                return;
            }
            // Logic flows through to sign in automatically
        }

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError(mode === "register" ? t('registerSuccessLoginFail') : t('loginFail'));
            setLoading(false);
        } else {
            if (onSuccess) onSuccess();
            if (redirectAfterLogin) {
                router.replace(redirectAfterLogin);
            }
        }
    }

    return (
        <React.Fragment>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                {mode === "register" && (
                    <input
                        type="text"
                        placeholder={t('name')}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl bg-card-hover border border-border
                                   text-foreground placeholder:text-foreground-faint
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                    />
                )}

                <input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 rounded-2xl bg-card-hover border border-border
                               text-foreground placeholder:text-foreground-faint
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                />

                {mode !== "forgot-password" && (
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('password')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-4 pr-12 rounded-2xl bg-card-hover border border-border
                                       text-foreground placeholder:text-foreground-faint
                                       focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted
                                       hover:text-foreground transition-colors"
                            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}

                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                {successMsg && <p className="text-emerald-500 text-sm text-center font-medium bg-emerald-500/10 py-2 rounded-lg">{successMsg}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base
                               hover:bg-emerald-400 active:scale-[0.98] transition-all duration-300
                               disabled:opacity-50 mt-1 shadow-lg shadow-emerald-500/20"
                >
                    {loading
                        ? t('pleaseWait')
                        : mode === "signin"
                            ? t('signIn')
                            : mode === "register"
                                ? t('register')
                                : t('resetLink')}
                </button>
            </form>

            {/* Toggle Actions */}
            <div className="flex flex-col gap-2 mt-4 text-center">
                {mode === "signin" ? (
                    <>
                        <button
                            onClick={() => {
                                setMode("forgot-password");
                                setError("");
                                setSuccessMsg("");
                            }}
                            className="text-foreground-secondary text-sm hover:text-foreground transition-colors duration-200"
                        >
                            {t('forgotPassword')}
                        </button>
                        <button
                            onClick={() => {
                                setMode("register");
                                setError("");
                                setSuccessMsg("");
                            }}
                            className="text-foreground-secondary text-sm hover:text-foreground transition-colors duration-200 mt-2"
                        >
                            {t('noAccount')} <span className="text-emerald-500 font-semibold">{t('signUp')}</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setMode("signin");
                            setError("");
                            setSuccessMsg("");
                        }}
                        className="text-foreground-secondary text-sm hover:text-foreground transition-colors duration-200"
                    >
                        {t('hasAccount')} <span className="text-emerald-500 font-semibold">{t('logIn')}</span>
                    </button>
                )}
            </div>
        </React.Fragment>
    );
}
