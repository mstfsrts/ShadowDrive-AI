'use client';

// ─── ShadowDrive AI — Theme System ───
// CSS-variable-driven theme with localStorage persistence.
// Default: dark (matches existing design). Toggle adds/removes `.dark` class on <html>.

import { createContext, useContext, useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

// Default value prevents "must be used within ThemeProvider" errors
// during SSR, HMR, or edge-case rendering outside the provider tree.
const defaultValue: ThemeContextValue = {
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme: () => {},
    toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

const STORAGE_KEY = 'shadowdrive-theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
    const root = document.documentElement;
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    // Initialize from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const initial = stored || 'dark';
        setThemeState(initial);

        const resolved = initial === 'system' ? getSystemTheme() : initial;
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    // Listen for system theme changes when theme === 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const newResolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(newResolved);
            applyTheme(newResolved);
        };

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);

        const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
