"use client";

// ─── ShadowDrive AI — Backend Fetch Helper ───────────────────────────────────
//
// Architecture: Client always calls same-origin Next.js URLs (/api/courses, etc.)
// Routing is handled transparently at the infrastructure level via next.config.js rewrites:
//
//   BACKEND_URL set in env  →  Next.js rewrites proxy to Express backend
//   BACKEND_URL not set     →  Next.js own route.ts files handle the request
//
// This file ONLY handles:
//   1. Automatic JWT token attachment for authenticated endpoints
//   2. Consistent error handling
// ─────────────────────────────────────────────────────────────────────────────

// ─── Token Cache ───
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getBackendToken(): Promise<string | null> {
    // Return cached token if still valid (with 5-min buffer)
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
 * Fetch wrapper for ShadowDrive API calls.
 *
 * Always calls same-origin Next.js URLs. Infrastructure (next.config.js rewrites)
 * transparently routes to Express backend when BACKEND_URL is configured.
 *
 * @param path       - API path, e.g. "/api/courses"
 * @param options    - Standard fetch options
 * @param requireAuth - If true, attaches Bearer JWT token automatically
 */
export async function backendFetch(path: string, options: RequestInit = {}, requireAuth = false): Promise<Response> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    // Attach JWT token for authenticated endpoints
    if (requireAuth) {
        const token = await getBackendToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return fetch(path, {
        ...options,
        headers,
    });
}

/**
 * Typed convenience: fetch JSON from the API.
 */
export async function backendJson<T>(path: string, options: RequestInit = {}, requireAuth = false): Promise<T> {
    const res = await backendFetch(path, options, requireAuth);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
}
