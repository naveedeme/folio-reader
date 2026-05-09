// ===== FOLIO SERVICE WORKER =====
const CACHE = 'folio-v4';

const ASSETS = [
  '/folio-reader/',
  '/folio-reader/index.html',
  '/folio-reader/manifest.json',
  '/folio-reader/icon-192.png',
  '/folio-reader/icon-512.png',
  '/folio-reader/lib/jszip.min.js',
  '/folio-reader/lib/pdf.min.js',
  '/folio-reader/lib/pdf.worker.min.js',
  '/folio-reader/lib/mammoth.min.js',
  '/folio-reader/lib/nastaliq.css',
  '/folio-reader/lib/naskh.css',
  '/folio-reader/lib/NotoNastaliqUrdu.woff2',
  '/folio-reader/lib/NotoNaskhArabic.woff2',
];

// ── Install: pre-cache every asset ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      // Required assets — fail the install if any are missing
      const required = ASSETS.filter(a => !a.endsWith('.woff2') && !a.endsWith('.css'));
      // Optional assets — font files; missing ones don't block install
      const optional = ASSETS.filter(a => a.endsWith('.woff2') || a.endsWith('.css'));

      return cache.addAll(required).then(() =>
        Promise.allSettled(optional.map(url => cache.add(url)))
      );
    })
  );
  self.skipWaiting();
});

// ── Activate: delete stale caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for local assets, network-only for external ───────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Pass Google API calls straight to network
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('accounts.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/folio-reader/index.html');
        }
      });
    })
  );
});
