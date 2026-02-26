'use client';

// ─── ShadowDrive AI — Toast Notification ───
// Subtle, auto-dismissing notification for non-blocking feedback.
// Used for cache hits, offline fallbacks, and API status messages.

import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning';

interface ToastData {
    message: string;
    type: ToastType;
    id: number;
}

const TOAST_COLORS: Record<ToastType, string> = {
    info: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    warning: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
};

const TOAST_ICONS: Record<ToastType, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚡',
};

/**
 * Custom hook for managing toast notifications.
 * Returns [toasts, showToast, ToastContainer]
 */
export function useToast() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { message, type, id }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return { toasts, showToast };
}

/**
 * Toast container component — renders all active toasts.
 */
export function ToastContainer({ toasts }: { toasts: ToastData[] }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

function ToastItem({ toast }: { toast: ToastData }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setVisible(true));

        // Trigger exit animation before removal
        const exitTimer = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(exitTimer);
    }, []);

    return (
        <div
            className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm
        transition-all duration-500 ease-out
        ${TOAST_COLORS[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
        >
            <span className="text-lg flex-shrink-0">{TOAST_ICONS[toast.type]}</span>
            <p className="text-sm font-medium">{toast.message}</p>
        </div>
    );
}
