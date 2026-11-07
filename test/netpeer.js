// Online coop over the real transport: PeerJS + WebRTC data channels, with a local PeerJS broker instead of
// 0.peerjs.com (needs the `peer` package: npm i peer). Host and guest in two pages, bot driven, 40 s.
// Usage: NODE_PATH=$(npm root -g):/path/to/node_modules node test/netpeer.js
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
const { ExpressPeerServer } = require('peer');
const http = require('http');
(async () => {
  const express = require('express'); const app = express(); const hs = http.createServer(app);
  app.use('/', ExpressPeerServer(hs, { path: '/' }));
  await new Promise((r) => hs.listen(9123, '127.0.0.1', r));
  const ps = { close: () => hs.close() };
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  await ctx.addInitScript(() => { window.BITTEN_NET_CONFIG = { host: '127.0.0.1', port: 9123, path: '/', secure: false, config: { iceServers: [] } }; });
  const errs = [], pages = [];
  for (let i = 0; i < 2; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`); pages.push(p);
  }
  const [H, Gp] = pages;
  await H.evaluate(() => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.host(); });
  await H.waitForFunction(() => /Waiting/.test(window.__bitten.net14.S.status) || window.__bitten.net14.S.err, null, { timeout: 15000 });
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  await Gp.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 20000 });
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of pages) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 40000));
  const st = [];
  for (const p of pages) st.push(await p.evaluate(() => { const N = window.__bitten.net14.NET; return { tick: N.tick, q: N.queue.length, desync: N.desync, ping: window.__bitten.net14.S.ping, hist: [...N.hist] }; }));
  const m = new Map(st[0].hist); let same = 0, diff = 0;
  for (const [n, h] of st[1].hist) if (m.has(n)) { if (m.get(n) === h) same++; else diff++; }
  for (const s of st) delete s.hist;
  console.log(JSON.stringify({ code, st, same, diff, errs: errs.slice(0, 5) }));
  const ok = same > 20 && diff === 0 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); ps.close && ps.close(); process.exit(ok ? 0 : 1);
})();
