// Host in a background tab (v14.2.1): rAF stops and document.hidden is true on the host; the worker clock must
// keep the ticks going, so the guest's game time keeps moving and lockstep holds.
// Usage: NODE_PATH=$(npm root -g) node test/nethidden.js [seconds=10]
const { launch, serve } = require('./lib');
(async () => {
  const secs = +(process.argv[2] || 10);
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 650 } });
  const [H, Gs] = [await ctx.newPage(), await ctx.newPage()], errs = [];
  for (const p of [H, Gs]) { p.on('pageerror', (e) => errs.push(e.message)); await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14); }
  await H.evaluate(() => { const B = window.__bitten; B.Save.data.mode = 'arcade'; B.coop14.open(); B.coop14.setTab('online'); B.net14.host(); });
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  await Gs.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 5000 });
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of [H, Gs]) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 1500));
  /* the host tab goes to the background */
  await H.evaluate(() => { window.requestAnimationFrame = () => 0; Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); });
  const g0 = await Gs.evaluate(() => window.__bitten.G.t);
  await new Promise((r) => setTimeout(r, secs * 1000));
  const g1 = await Gs.evaluate(() => window.__bitten.G.t), h1 = await H.evaluate(() => window.__bitten.G.t);
  const hist = await Promise.all([H, Gs].map((p) => p.evaluate(() => [...window.__bitten.net14.NET.hist])));
  const hm = new Map(hist[0]); let same = 0, diff = 0;
  for (const [n, h] of hist[1]) if (hm.has(n)) { if (hm.get(n) === h) same++; else diff++; }
  const out = { guestGameSeconds: +(g1 - g0).toFixed(2), wall: secs, hostT: +h1.toFixed(2), same, diff, errs };
  console.log(JSON.stringify(out));
  const ok = g1 - g0 > secs * 0.7 && same > 3 && !diff && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
