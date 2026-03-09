// ShadowDrive AI — Service Worker
// Strategy: ONLY cache static subresources (JS, CSS, images, fonts).
// NEVER intercept page navigations or auth routes — they redirect and break the browser.
const CACHE_NAME = "shadowdrive-v3";

self.addEventListener("install", event => {
    // Nothing to pre-cache. Skip waiting so new SW takes over immediately.
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    // Clean up old caches
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);

    // ── NEVER intercept these — let browser handle natively ──
    // 1. Page navigations (may redirect to login, OAuth callbacks, etc.)
    if (request.mode === "navigate") return;
    // 2. NextAuth auth routes (/api/auth/*)
    if (url.pathname.startsWith("/api/auth/")) return;
    // 3. Cross-origin requests (backend API on port 4000, Google, etc.)
    if (url.origin !== location.origin) return;

    // ── Network-first for same-origin API routes ──
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(fetch(request).catch(() => new Response("", { status: 503 })));
        return;
    }

    // ── Cache-first for static assets (JS, CSS, images, fonts) ──
    // Only cache successful responses to avoid caching error pages
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request)
                .then(response => {
                    if (response.ok && response.type === "basic") {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => new Response("", { status: 503 }));
        }),
    );
});
