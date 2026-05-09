// ===== FOLIO SERVICE WORKER =====
// Version bump this string whenever you change any cached file.
// The old cache is deleted automatically on activate.
const CACHE = 'folio-v3';

// Every file the app needs to run fully offline.
// The lib/ files are downloaded by the GitHub Actions build step —
// they do not exist in the repo source, only in the deployed artifact.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  // Third-party libraries (bundled at build time into lib/)
  './lib/jszip.min.js',
  './lib/pdf.min.js',
  './lib/pdf.worker.min.js',
  './lib/mammoth.min.js',

  // Fonts (downloaded at build time, CSS rewritten to local woff2 paths)
  './lib/nastaliq.css',
  './lib/naskh.css',
  './lib/NotoNastaliqUrdu.woff2',
  './lib/NotoNaskhArabic.woff2',
];

// ── Install: pre-cache every asset ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      // cache.addAll() fails atomically if any single request fails.
      // Font files are optional — some Google Fonts requests may return 0 bytes
      // if the language subset is empty, so we add them individually and ignore
      // failures so the SW still installs successfully.
      const required = ASSETS.filter(a => !a.endsWith('.woff2') && !a.endsWith('.css') || a === './index.html');
      const optional = ASSETS.filter(a => a.endsWith('.woff2') || (a.endsWith('.css') && a !== './index.html'));

      return cache.addAll(required).then(() =>
        Promise.allSettled(optional.map(url => cache.add(url)))
      );
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// ── Activate: delete stale caches ───────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: cache-first for local assets, network-only for external ───────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Let Google Drive API calls always go to the network
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('accounts.google.com')) {
    return; // fall through to browser default (network)
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and store for next time
      return fetch(event.request).then(response => {
        // Only cache successful same-origin or CDN responses
        if (response.ok && (
          url.origin === self.location.origin ||
          url.hostname.endsWith('cdnjs.cloudflare.com') ||
          url.hostname.endsWith('fonts.gstatic.com')
        )) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline and not cached — return a minimal offline page for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
