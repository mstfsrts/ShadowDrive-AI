'use client';

// ─── Google OAuth Popup Callback ───
// After Google sign-in completes in the popup, this page signals
// the opener tab via localStorage (reliable across cross-origin redirects)
// and attempts to close itself.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'shadowdrive_google_auth_done';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const [showManualClose, setShowManualClose] = useState(false);

    useEffect(() => {
        // Signal the opener tab via localStorage event
        localStorage.setItem(STORAGE_KEY, Date.now().toString());

        // Try postMessage (works if opener is preserved)
        try {
            if (window.opener) {
                window.opener.postMessage({ type: 'google-auth-success' }, window.location.origin);
            }
        } catch {
            // Cross-origin — ignore
        }

        // Try to close the popup
        window.close();

        // If window.close() didn't work (browser restriction), show manual close message
        const timer = setTimeout(() => setShowManualClose(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // If still open, redirect to dashboard as fallback
    if (showManualClose) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4">
                <div className="text-emerald-500 text-5xl">✓</div>
                <p className="text-foreground text-lg font-semibold text-center">Giriş başarılı!</p>
                <p className="text-foreground-secondary text-sm text-center">
                    Bu pencereyi kapatabilirsiniz.
                </p>
                <button
                    onClick={() => router.replace('/dashboard')}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold
                               hover:bg-emerald-400 transition-colors active:scale-95 min-h-[44px]"
                >
                    Dashboard&apos;a Git
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground-secondary text-sm">Giriş tamamlanıyor...</p>
        </div>
    );
}
