// Update path: a phone that holds an old release (cache first worker) must get the new one without clearing data,
// a later push must be live on the next load, and the game must still open offline.
// Usage: node test/update.js [old git ref, default 4055838]
const { serve, launch, ROOT } = require('./lib');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const ok = (name, cond, info = '') => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ': ' + info : ''}`); if (!cond) process.exitCode = 1; };
const FILES = ['index.html', 'bitten.js', 'net.js', 'sw.js', 'manifest.webmanifest', 'vendor', 'fonts', 'icons'];

(async () => {
  const ref = process.argv[2] || '4055838';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bitten-upd-'));
  const oldDir = path.join(tmp, 'old'), newDir = path.join(tmp, 'new');
  fs.mkdirSync(oldDir); fs.mkdirSync(newDir);
  execFileSync('sh', ['-c', `git -C "${ROOT}" archive ${ref} | tar -x -C "${oldDir}"`]);
  for (const f of FILES) fs.cpSync(path.join(ROOT, f), path.join(newDir, f), { recursive: true });

  let srv = await serve(0, oldDir);
  const port = srv.address().port, base = `http://127.0.0.1:${port}/`;
  const swap = async (dir) => { await new Promise((r) => { srv.closeAllConnections(); srv.close(r); }); if (dir) srv = await serve(port, dir); };
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const ready = () => page.waitForFunction(() => window.__bitten && window.__bitten.Game && document.getElementById('btnCoop14'), null, { timeout: 20000 });
  const state = () => page.evaluate(async () => ({ net: !!(window.__bitten.net14 && window.__bitten.net14.paintLobby), mark: window.__mark || '', caches: await caches.keys() }));

  await page.goto(base); await ready();
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(1500);
  await page.reload(); await ready();
  let s = await state();
  ok('old release loaded from its cache first worker', s.caches.some((k) => !k.startsWith('bitten-nf-')), s.caches.join(' '));

  // the new release goes live: one visit, no manual reload, no cleared data
  await swap(newDir);
  await page.goto(base);
  /* Chromium runs its own update check only once the old worker is idle (up to 30 s); ask for it now */
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update())).catch(() => null);
  await page.waitForFunction(() => window.__bitten && window.__bitten.net14 && window.__bitten.net14.paintLobby, null, { timeout: 30000 }).catch(() => null);
  await ready(); s = await state();
  ok('new release after one visit', s.net, s.caches.join(' '));
  ok('old caches removed', s.caches.length === 1 && s.caches[0].startsWith('bitten-nf-'), s.caches.join(' '));
  await page.evaluate(() => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); });
  const pane = await page.evaluate(() => document.querySelector('#coop14 [data-pane="online"]').children.length);
  ok('online pane has content', pane > 0);

  // a push that forgets the build step for sw.js: still live on the next load
  fs.appendFileSync(path.join(newDir, 'net.js'), '\nwindow.__mark = "push2";\n');
  await page.reload(); await ready(); s = await state();
  ok('later push live on next load', s.mark === 'push2', s.mark);

  // offline: the last loaded version opens from the cache
  await swap(null);
  await page.reload().catch(() => null);
  const off = await ready().then(() => state(), () => null);
  ok('opens offline', !!off && off.net && off.mark === 'push2');

  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
