"use client";

// ─── ShadowDrive AI — Backend Fetch Helper ───
// Wraps fetch calls to Express backend with automatic JWT management.
// When NEXT_PUBLIC_API_URL is set, calls go to Express.
// When not set, calls fall back to Next.js API routes (same origin).

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ─── Token Cache ───
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getBackendToken(): Promise<string | null> {
    // Return cached token if still valid (with 5min buffer)
    if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
        return cachedToken;
    }

    try {
        const res = await fetch("/api/auth/backend-token");
        if (!res.ok) return null;

        const { token } = await res.json();
        cachedToken = token;
        // JWT is valid for 24h, cache for 23h
        tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
        return token;
    } catch {
        return null;
    }
}

/**
 * Clears the cached backend token (call on logout).
 */
export function clearBackendToken(): void {
    cachedToken = null;
    tokenExpiresAt = 0;
}

/**
 * Fetch wrapper that sends requests to Express backend when configured,
 * or falls back to Next.js API routes (same origin).
 *
 * - For authenticated endpoints: includes Bearer token automatically
 * - For public endpoints: no token needed
 */
export async function backendFetch<T = unknown>(path: string, options: RequestInit = {}, requireAuth = false): Promise<Response> {
    const baseUrl = BACKEND_URL;
    const url = `${baseUrl}${path}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    // Add auth token for authenticated requests to Express backend
    if (requireAuth && baseUrl) {
        const token = await getBackendToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Typed convenience: fetch JSON from backend.
 */
export async function backendJson<T>(path: string, options: RequestInit = {}, requireAuth = false): Promise<T> {
    const res = await backendFetch(path, options, requireAuth);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
}
