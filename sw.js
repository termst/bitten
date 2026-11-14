/* Bitten service worker (T11). Offline copy of the game, never a stale one.
   Code (page, scripts, manifest): network first, revalidated with the server on every load, the cache only
   answers when the network fails or takes over 6 s. A push is live on the next load, nothing to bump by hand.
   Fonts, icons and the De Wals track: cache first, they do not change.
   BUILD is written by build.mjs (hash of the game files), so each build installs a fresh offline copy. */
const BUILD = 'f16cba9453';
const CACHE = 'bitten-nf-' + BUILD;
const CORE = [
  './', 'bitten.js', 'net.js', 'vendor/peerjs.min.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/barlow-condensed-latin-400-normal.woff2', 'fonts/barlow-condensed-latin-500-normal.woff2',
  'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/barlow-condensed-latin-700-normal.woff2',
  'fonts/grenze-gotisch-latin-600-normal.woff2', 'fonts/grenze-gotisch-latin-800-normal.woff2',
];
/* cache first: files that never change under the same name */
const STATIC = /\/(assets\/wals\.mp3|fonts\/[\w-]+\.woff2|icons\/[\w-]+\.png|vendor\/[\w.-]+)$/;
const TIMEOUT = 6000;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const old = (await caches.keys()).filter((k) => k.startsWith('bitten-') && k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    await self.clients.claim();
    /* one time: pages opened under the old cache first worker (cache names bitten-v...) hold stale files, reload them */
    if (old.some((k) => !k.startsWith('bitten-nf-'))) {
      const wins = await self.clients.matchAll({ type: 'window' });
      for (const w of wins) w.navigate(w.url).catch(() => null);   // not awaited: the reload waits for this activate to finish
    }
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // the PeerJS broker and anything else go straight out
  const page = url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (url.search && !page) return;
  if (req.headers.has('range')) return;
  const key = page ? new Request(new URL('./', self.registration.scope)) : req;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(key, { ignoreSearch: true });
    if (hit && STATIC.test(url.pathname)) return hit;
    const net = fetch(page ? req : new Request(url.href, { cache: 'no-cache' })).then((res) => {
      if (res && res.status === 200) c.put(key, res.clone());
      return res;
    });
    if (!hit) return net;
    net.catch(() => null);
    return Promise.race([
      net.then((res) => (res && (res.ok || res.status === 304) ? res : hit), () => hit),
      new Promise((r) => setTimeout(() => r(hit), TIMEOUT)),
    ]);
  })());
});
