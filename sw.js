
// sw.js - Network First Strategy
// This allows the PWA to be installed while ensuring users always get the latest content if they are online.

const CACHE_NAME = 'nawaya-pwa-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache the offline page and essential assets
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/vite.svg'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network First Strategy:
  // 1. Try to fetch from the network.
  // 2. If successful, put it in the cache and return it.
  // 3. If network fails (offline), try to return from cache.
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // For assets, try cache first, then network (Stale-While-Revalidate could be better but sticking to simple)
    // Actually, stick to Network First for everything to avoid "I updated the site but don't see it" issues for now.
    event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
             // Optional: Cache assets dynamically
             return networkResponse;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
  }
});
