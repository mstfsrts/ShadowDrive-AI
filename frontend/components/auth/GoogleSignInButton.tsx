import { useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { clearBackendToken } from "@/lib/backendFetch";

const STORAGE_KEY = 'shadowdrive_google_auth_done';

interface GoogleSignInButtonProps {
    redirectAfterLogin?: string;
    label?: string;
}

export default function GoogleSignInButton({ redirectAfterLogin = "/dashboard", label = "Google ile Başla" }: GoogleSignInButtonProps) {
    const router = useRouter();
    const { update: updateSession } = useSession();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Listen for auth completion via localStorage event (works across tabs reliably)
    const handleStorageChange = useCallback(
        async (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                setIsGoogleLoading(false);
                localStorage.removeItem(STORAGE_KEY);
                clearBackendToken();
                // Explicitly refetch session so useSession() returns fresh data
                await updateSession();
                router.replace(redirectAfterLogin);
            }
        },
        [router, redirectAfterLogin, updateSession],
    );

    // Also listen for postMessage (works when opener is preserved)
    const handleMessage = useCallback(
        async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'google-auth-success') {
                setIsGoogleLoading(false);
                localStorage.removeItem(STORAGE_KEY);
                clearBackendToken();
                await updateSession();
                router.replace(redirectAfterLogin);
            }
        },
        [router, redirectAfterLogin, updateSession],
    );

    useEffect(() => {
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('message', handleMessage);
        };
    }, [handleStorageChange, handleMessage]);

    function handleGoogleSignIn() {
        setIsGoogleLoading(true);

        // Clean up any stale flag
        localStorage.removeItem(STORAGE_KEY);

        // Open popup centered on screen
        const w = 500;
        const h = 600;
        const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
        const top = Math.round(window.screenY + (window.outerHeight - h) / 2);

        const popup = window.open(
            '/auth/google-start',
            'google-signin',
            `width=${w},height=${h},left=${left},top=${top},popup=yes`,
        );

        // If popup was blocked by browser, fall back to full-page redirect
        if (!popup) {
            signIn("google", { callbackUrl: redirectAfterLogin });
            return;
        }

        // Reset loading state if user closes popup without completing auth
        // Wrapped in try-catch: COOP policy may block popup.closed access
        const pollTimer = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(pollTimer);
                    setIsGoogleLoading(false);
                }
            } catch {
                clearInterval(pollTimer);
                setIsGoogleLoading(false);
            }
        }, 500);
    }

    return (
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
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            )}
            {label}
        </button>
    );
}
