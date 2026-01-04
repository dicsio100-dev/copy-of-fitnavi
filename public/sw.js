// FitNavi AI - Basic Service Worker
// Satisfies PWA 'installable' criteria

const CACHE_NAME = 'fitnavi-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic network-first strategy
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
