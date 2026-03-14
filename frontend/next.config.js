const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */

// ─── Backend API Proxy ───────────────────────────────────────────────────────
// When BACKEND_URL is set (e.g. in Dokploy), Next.js rewrites proxy all app API
// routes to the Express backend transparently — client code never changes.
// When BACKEND_URL is NOT set, Next.js falls back to own route files in app/api/.
//
//  Local dev:   BACKEND_URL=http://localhost:4000 in .env.local
//  Production:  BACKEND_URL=<internal-docker-url> in Dokploy env panel
// ─────────────────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL ?? "";

// Routes to proxy to Express backend (auth routes are NEVER proxied — they stay Next.js)
// NOTE: /api/generate is NOT proxied — it uses Next.js route.ts with OpenRouter → Gemini fallback
const PROXY_ROUTES = ["/api/courses", "/api/progress", "/api/ai-lessons", "/api/custom-lessons"];

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },

    // ─── Standalone output for Docker/Dokploy ───
    output: "standalone",

    // ─── Service Worker headers ───
    async headers() {
        return [
            {
                source: "/sw.js",
                headers: [{ key: "Service-Worker-Allowed", value: "/" }],
            },
            {
                source: '/((?!api/auth).*)',
                headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }],
            },
        ];
    },

    // ─── API Gateway via rewrites ───
    // beforeFiles rewrites run BEFORE Next.js filesystem routes.
    // If BACKEND_URL is set → Express handles the request.
    // If not set → Next.js own route.ts files handle it (classic fallback).
    async rewrites() {
        if (!BACKEND_URL) return { beforeFiles: [] };

        const beforeFiles = PROXY_ROUTES.flatMap(route => [
            // Exact match: /api/courses
            { source: route, destination: `${BACKEND_URL}${route}` },
            // Wildcard: /api/courses/:id, /api/ai-lessons/:id etc.
            { source: `${route}/:path*`, destination: `${BACKEND_URL}${route}/:path*` },
        ]);

        return { beforeFiles };
    },
};

module.exports = withNextIntl(nextConfig);
