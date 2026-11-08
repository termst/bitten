/* Bitten service worker (T11). Cache first for every game file. The cache name carries the version:
   a new version gets a new cache and the old ones are deleted on activate.
   Install fetches with cache: 'reload', so a new cache never stores files the browser kept from the old version. */
const CACHE = 'bitten-v14.0-net2';
const CORE = [
  './', 'index.html', 'bitten.js', 'net.js', 'vendor/peerjs.min.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/barlow-condensed-latin-400-normal.woff2', 'fonts/barlow-condensed-latin-500-normal.woff2',
  'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/barlow-condensed-latin-700-normal.woff2',
  'fonts/grenze-gotisch-latin-600-normal.woff2', 'fonts/grenze-gotisch-latin-800-normal.woff2',
];
/* fetched when first used, then cached: the De Wals track (2.1 MB) and the latin-ext font files */
const LAZY = /\/(assets\/wals\.mp3|fonts\/[\w-]+\.woff2)$/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('bitten-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // the PeerJS broker and anything else go straight out
  if (url.search && !url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) return;
  const key = url.pathname.endsWith('/') || url.pathname.endsWith('.html') ? new Request(new URL('./', self.registration.scope)) : req;
  e.respondWith(caches.open(CACHE).then((c) => c.match(key, { ignoreSearch: true }).then((hit) => {
    if (hit) return hit;
    return fetch(req).then((res) => {
      if (res && res.ok && (CORE.some((u) => url.pathname.endsWith('/' + u.replace('./', ''))) || LAZY.test(url.pathname) || key !== req)) c.put(key, res.clone());
      return res;
    }).catch(() => hit || Response.error());
  })));
});
