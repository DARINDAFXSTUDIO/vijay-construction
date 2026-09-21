/**
 * VIJAY CONSTRUCTION - PWA Service Worker
 * Version: vc-hub-cache-v5.2 (Auto-Update & Instant Takeover Engine)
 */

const CACHE_NAME = 'vc-hub-cache-v5.2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/labour.html',
  '/data.js',
  '/manifest.json'
];

// 1. INSTALL: Purane worker ka wait kiye bina turant activate ho
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW v5.2] Pre-caching core shell...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// 2. ACTIVATE: Purana v5.1 cache turant delete karein aur browser ko instantly control karein
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ [SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Strict Network-First for HTML/Code, Cache-Bypass for Supabase
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Non-GET requests direct network
  if (req.method !== 'GET') return;

  // Supabase, Auth aur APIs: KABHI CACHE NA KAREIN (Always Fresh Live Network)
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/auth/v1') ||
    url.pathname.includes('/rest/v1') ||
    url.pathname.includes('/storage/v1') ||
    url.pathname.includes('/api/')
  ) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network offline. Action queued.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // HTML Pages & Core Code (index.html, labour.html, data.js): NETWORK-FIRST
  // Pehle hamesha Vercel se taaza code mangega, sirf tabhi cache use karega jab net band ho
  if (
    req.mode === 'navigate' ||
    req.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('data.js')
  ) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cachedRes) => {
            if (cachedRes) return cachedRes;
            if (url.pathname.includes('labour')) {
              return caches.match('/labour.html');
            }
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static Assets (Images, Icons, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const netFetch = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => null);

      return cached || netFetch;
    })
  );
});
