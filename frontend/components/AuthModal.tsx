"use client";

// ─── ShadowDrive AI — Auth Modal (Refactored Phase 2) ───
// This component now acts strictly as a visual presentation wrapper (Dialog).
// All complex state, API fetching, and OAuth interactions are offloaded
// to the atomic child components below.

import { useTranslations } from "next-intl";
import GoogleSignInButton from "./auth/GoogleSignInButton";
import EmailAuthForm from "./auth/EmailAuthForm";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    redirectAfterLogin?: string;
}

export default function AuthModal({ isOpen, onClose, redirectAfterLogin }: AuthModalProps) {
    const t = useTranslations('auth');

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Bottom sheet */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6
                            border-t border-border shadow-2xl animate-[slide-up_0.3s_ease-out]
                            max-w-lg mx-auto max-h-[90dvh] overflow-y-auto"
            >
                {/* Handle bar */}
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />

                <h2 className="text-xl font-bold text-foreground text-center mb-1">{t('modalTitle')}</h2>
                <p className="text-foreground-muted text-sm text-center mb-6">{t('modalSubtitle')}</p>

                {/* Extracted Google Button */}
                <GoogleSignInButton redirectAfterLogin={redirectAfterLogin} />

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-foreground-faint text-xs">{t('or')}</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Extracted Email Form with Forgot Password logic built-in */}
                <EmailAuthForm redirectAfterLogin={redirectAfterLogin} onSuccess={onClose} />

                {/* Guest mode note */}
                <p className="text-foreground-faint text-xs text-center mt-6">{t('guestNote')}</p>
            </div>
        </>
    );
}
