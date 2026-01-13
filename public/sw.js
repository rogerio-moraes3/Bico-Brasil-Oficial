// Service worker with intelligent caching strategy
const CACHE_VERSION = 'bico-brasil-v26-' + new Date().getTime();
console.debug('🔧 Service Worker v26 iniciado');
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
      console.debug('✅ Service Worker v21 ativado - cache limpo!');
      return self.clients.claim();
    })
  );
});

// Fetch: hybrid strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network First for HTML (always fetch latest)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAMES.dynamic).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network First for JavaScript (Vite chunks must be fresh)
  if (url.origin === location.origin && request.destination === 'script') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAMES.dynamic).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache First for images, fonts, and styles
  if (url.origin === location.origin && (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style'
  )) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAMES.static).then(cache => cache.put(request, clone));
          return response;
        }))
    );
    return;
  }

  // Network only for Supabase APIs
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
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
