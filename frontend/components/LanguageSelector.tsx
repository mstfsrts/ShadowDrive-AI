"use client";

// ─── ShadowDrive AI — Language Selector ───
// First-visit popup + reusable dropdown for settings.
// Sets NEXT_LOCALE cookie and reloads page.

import { useState, useEffect } from "react";
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS, COOKIE_NAME, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match?.[1];
}

function setCookie(name: string, value: string, days: number = 365) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get the current locale from cookie, or default.
 */
export function getCurrentLocale(): Locale {
    const cookie = getCookie(COOKIE_NAME);
    if (cookie && SUPPORTED_LOCALES.includes(cookie as Locale)) {
        return cookie as Locale;
    }
    return DEFAULT_LOCALE;
}

/**
 * Change locale: set cookie and reload page.
 */
export function changeLocale(locale: Locale) {
    setCookie(COOKIE_NAME, locale);
    // Mark that user has chosen a language
    setCookie("LOCALE_CHOSEN", "1");
    window.location.reload();
}

// ─── First-Visit Popup ───────────────────────────────────────────────────────

export function LanguagePopup() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show popup only if user hasn't chosen a language yet
        const chosen = getCookie("LOCALE_CHOSEN");
        if (!chosen) {
            // Small delay so the page renders first
            const timer = setTimeout(() => setShow(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-6">
                    <span className="text-4xl block mb-3">🌍</span>
                    <h2 className="text-foreground font-bold text-xl">Choose Language</h2>
                    <p className="text-foreground-muted text-sm mt-1">Select your preferred app language</p>
                </div>

                <div className="flex flex-col gap-2">
                    {SUPPORTED_LOCALES.map(locale => (
                        <button
                            key={locale}
                            onClick={() => {
                                changeLocale(locale);
                                setShow(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                                       bg-card-hover border border-border hover:border-emerald-500/50
                                       text-foreground font-medium text-base
                                       active:scale-[0.98] transition-all duration-200"
                        >
                            <span className="text-2xl">{LOCALE_FLAGS[locale]}</span>
                            <span>{LOCALE_LABELS[locale]}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Inline Language Switcher (for header/settings) ──────────────────────────

export function LanguageSwitcher() {
    const [current, setCurrent] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        setCurrent(getCurrentLocale());
    }, []);

    return (
        <button
            onClick={() => {
                // Cycle to next locale
                const idx = SUPPORTED_LOCALES.indexOf(current);
                const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
                changeLocale(next);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                       bg-card-hover border border-border hover:border-border-hover
                       text-foreground-secondary text-sm font-medium
                       transition-all duration-200"
            aria-label="Change language"
        >
            <span>{LOCALE_FLAGS[current]}</span>
            <span>{LOCALE_LABELS[current]}</span>
        </button>
    );
}
