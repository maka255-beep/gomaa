// sw.js

// On install, force the new service worker to activate immediately.
self.addEventListener('install', event => {
  console.log('Service Worker installing and skipping wait.');
  self.skipWaiting();
});

// On activate, take control of all clients and clear any old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients.');
      return self.clients.claim();
    })
  );
});