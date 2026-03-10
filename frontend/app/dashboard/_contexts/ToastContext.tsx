'use client';

// ─── ShadowDrive AI — Toast Context ───
// Wraps the useToast hook into a React Context so any dashboard page
// can show toasts without prop drilling.

import { createContext, useContext, type ReactNode } from 'react';
import { useToast, ToastContainer, type ToastType } from '@/components/Toast';

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const { toasts, showToast } = useToast();

    return (
        <ToastCtx.Provider value={{ showToast }}>
            <ToastContainer toasts={toasts} />
            {children}
        </ToastCtx.Provider>
    );
}

export function useToastContext(): ToastContextValue {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error('useToastContext must be used within <ToastProvider>');
    return ctx;
}
