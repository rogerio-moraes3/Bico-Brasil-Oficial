// SERVICE WORKER - Bico Brasil
// Caching strategy: Cache-first for assets, Network-first for API calls

const CACHE_VERSION = 'bico-brasil-v1';
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Assets to cache on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: cache critical assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch(() => {
        console.log('⚠️ Some assets could not be cached during install');
      });
    }).then(() => {
      self.skipWaiting();
      console.log('✅ Service Worker installed');
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (!key.startsWith(CACHE_VERSION)) {
          console.log('🗑️ Deleting old cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      console.log('✅ Service Worker activated');
    })
  );
});

// Listen for skip waiting messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip browser extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // API calls: network-first
  if (url.pathname.startsWith('/api') || url.hostname !== url.hostname) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            if (cached) return cached;
            // Return a basic offline response
            return new Response('Offline - cached data not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  // Static assets: cache-first
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(ASSET_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          return new Response('Asset offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Documents: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          return cached || new Response('Offline - page not cached', { status: 503 });
        });
      })
  );
});
