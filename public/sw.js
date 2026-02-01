// MINIMAL SERVICE WORKER - NO CACHING, NO INTERCEPTION
// Only registers the service worker, does not cache anything

const CACHE_VERSION = 'bico-brasil-minimal-v1';

// Install: skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      // Delete ALL old caches
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Listen for explicit skip waiting requests from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: PASS THROUGH - no caching, no interception
self.addEventListener('fetch', (event) => {
  // Let all requests go directly to network
  // No caching, no offline support, 100% real-time
  return;
});
