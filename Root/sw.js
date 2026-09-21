/**
 * VIJAY CONSTRUCTION - PWA Service Worker
 * Version: vc-hub-cache-v5.1
 * Strategy: Network-First for HTML/App Shell, Cache-Bypass for Supabase, Stale-While-Revalidate for Assets
 */

const CACHE_NAME = 'vc-hub-cache-v5.1';

// Pre-cached App Shell Assets
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/labour.html',
  '/data.js',
  '/manifest.json'
];

// 1. INSTALL EVENT: Pre-cache core app shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Pre-caching Core App Shell...');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT: Delete old cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ [SW] Removing Stale Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT: Intelligent Traffic Routing
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. Non-GET requests (POST, PUT, DELETE, PATCH): Direct Network Pass
  if (request.method !== 'GET') {
    return;
  }

  // B. Database & Auth Requests (Supabase): NEVER CACHE, Always Network
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/auth/v1') ||
    url.pathname.includes('/rest/v1') ||
    url.pathname.includes('/storage/v1') ||
    url.pathname.includes('/api/')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network offline. Request queued locally.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // C. HTML Navigation Requests (App Shell): Network-First with Offline Fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Fallback to offline index shell
            if (url.pathname.includes('labour')) {
              return caches.match('/labour.html');
            }
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // D. Static Assets (Scripts, Styles, Fonts, CDN Libraries): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});