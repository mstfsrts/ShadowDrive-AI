'use client';

// ─── Google OAuth Popup Starter ───
// Opened inside a popup window. Immediately triggers the Google OAuth flow
// via NextAuth's signIn(), which handles CSRF tokens automatically.
// After Google auth completes, NextAuth redirects to /auth/google-callback.

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function GoogleStartPage() {
    useEffect(() => {
        signIn('google', { callbackUrl: '/auth/google-callback' });
    }, []);

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground-secondary text-sm">Google&apos;a yönlendiriliyorsunuz...</p>
        </div>
    );
}
