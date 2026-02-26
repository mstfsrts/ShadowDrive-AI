// ShadowDrive AI — Service Worker (Cache-first for static, network-first for API)
const CACHE_NAME = 'shadowdrive-v1';
const STATIC_ASSETS = ['/', '/play', '/manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Network-first for API routes
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for everything else
    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});
