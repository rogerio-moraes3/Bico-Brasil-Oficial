// Service worker with robust error handling and safe fallbacks
const CACHE_VERSION = 'bico-brasil-v28-' + new Date().getTime();
console.debug('🔧 Service Worker v28 iniciado');
const CACHE_NAMES = {
  static: CACHE_VERSION + '-static',
  dynamic: CACHE_VERSION + '-dynamic',
};

// Static assets to cache initially
const STATIC_ASSETS = [
  '/',
  '/logo.png',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('❌ Install failed:', err))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => !Object.values(CACHE_NAMES).includes(key))
          .map(key => {
            console.debug('🗑️ Removendo cache antigo:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.debug('✅ Service Worker v28 ativado - cache limpo!');
      return self.clients.claim();
    })
  );
});

// Helper: Create offline fallback response
function createOfflineFallback(message = 'Offline - recurso não disponível') {
  return new Response(message, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' })
  });
}

// Helper: Safe cache match with fallback
function safeCacheMatch(request) {
  return caches.match(request).then(cached => {
    if (cached) {
      console.debug('✅ Cache hit:', request.url);
      return cached;
    }
    console.debug('⚠️ Cache miss:', request.url);
    return null;
  }).catch(err => {
    console.error('❌ Cache match error:', err);
    return null;
  });
}

// Helper: Safe fetch with error handling
function safeFetch(request) {
  return fetch(request).then(response => {
    // Only cache successful responses
    if (response.ok || response.status === 304) {
      return response;
    }
    console.warn('⚠️ Non-OK response:', response.status, request.url);
    return response;
  }).catch(err => {
    console.error('❌ Fetch failed:', request.url, err);
    throw err;
  });
}

// Fetch: hybrid strategy with robust error handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request).catch(() => createOfflineFallback('POST/PUT request failed')));
    return;
  }

  // Network only for Supabase APIs (never cache)
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request).catch(err => {
        console.error('❌ Supabase fetch failed:', err);
        return createOfflineFallback('Database connection failed');
      })
    );
    return;
  }

  // Skip analytics endpoints (let them fail silently)
  if (url.pathname.includes('/~api/analytics') || url.pathname.includes('/analytics')) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 204 }))
    );
    return;
  }

  // Network First for HTML (always fetch latest)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      safeFetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.dynamic)
              .then(cache => cache.put(request, clone))
              .catch(err => console.error('❌ Cache put error:', err));
          }
          return response;
        })
        .catch(() => {
          return safeCacheMatch(request).then(cached => {
            if (cached) return cached;
            return createOfflineFallback('<!DOCTYPE html><html><body><h1>Offline</h1><p>Sem conexão com a internet</p></body></html>');
          });
        })
    );
    return;
  }

  // Network First for JavaScript (Vite chunks must be fresh)
  if (url.origin === location.origin && (request.destination === 'script' || url.pathname.includes('.js'))) {
    event.respondWith(
      safeFetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.dynamic)
              .then(cache => cache.put(request, clone))
              .catch(err => console.error('❌ Cache put error:', err));
          }
          return response;
        })
        .catch(() => {
          return safeCacheMatch(request).then(cached => {
            if (cached) return cached;
            return createOfflineFallback('// Script offline');
          });
        })
    );
    return;
  }

  // Cache First for CSS
  if (url.origin === location.origin && (request.destination === 'style' || url.pathname.includes('.css'))) {
    event.respondWith(
      safeCacheMatch(request).then(cached => {
        if (cached) return cached;
        return safeFetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.static)
              .then(cache => cache.put(request, clone))
              .catch(err => console.error('❌ Cache put error:', err));
          }
          return response;
        }).catch(() => createOfflineFallback('/* CSS offline */'));
      })
    );
    return;
  }

  // Cache First for images and fonts
  if (url.origin === location.origin && (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  )) {
    event.respondWith(
      safeCacheMatch(request).then(cached => {
        if (cached) return cached;
        return safeFetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.static)
              .then(cache => cache.put(request, clone))
              .catch(err => console.error('❌ Cache put error:', err));
          }
          return response;
        }).catch(() => {
          // Return transparent 1x1 pixel for images
          if (request.destination === 'image') {
            return new Response(
              new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x00, 0x3B]),
              { headers: { 'Content-Type': 'image/gif' } }
            );
          }
          return createOfflineFallback('Resource offline');
        });
      })
    );
    return;
  }

  // Default: Network first, fallback to cache, then offline response
  event.respondWith(
    safeFetch(request)
      .catch(() => {
        return safeCacheMatch(request).then(cached => {
          if (cached) return cached;
          return createOfflineFallback();
        });
      })
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Bico Brasil';
  const options = {
    body: data.message || data.body || 'Nova notificação disponível',
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: data.link || data.url || '/',
      notification_id: data.notification_id
    },
    tag: data.tag || 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, focar nela e navegar
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          }
        }
        // Se não tem janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handler for updates
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
