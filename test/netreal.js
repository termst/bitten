// Online coop over the real transports, with what broke online play in v14.0: a big save (the start message
// carries the host's save) and repairs (they carry the room state). Both go far over the 16 KB a data channel
// takes in one message. Local PeerJS broker and local MQTT websocket broker, no internet needed.
// Needs: npm i peer express aedes@0.51 ws (NODE_PATH must reach them and playwright)
// Usage: node test/netreal.js [peer|relay|fallback] [secs=30]
//   peer: WebRTC data channel. relay: MQTT websocket relay (?net=relay). fallback: the guest cannot reach the
//   PeerJS broker, so the default transport has to fall back to the relay by itself.
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
const http = require('http');
const MODE = process.argv[2] || 'peer', SECS = +(process.argv[3] || 30);
(async () => {
  const express = require('express'), { ExpressPeerServer } = require('peer');
  const app = express(), hs = http.createServer(app); app.use('/', ExpressPeerServer(hs, { path: '/' }));
  await new Promise((r) => hs.listen(9123, '127.0.0.1', r));
  const aedes = require('aedes')(), { WebSocketServer, createWebSocketStream } = require('ws');
  const ms = http.createServer(), wss = new WebSocketServer({ server: ms });
  wss.on('connection', (ws) => aedes.handle(createWebSocketStream(ws)));
  await new Promise((r) => ms.listen(9124, '127.0.0.1', r));
  const srv = await serve(0), base = `http://127.0.0.1:${srv.address().port}/index.html${MODE === 'relay' ? '?net=relay' : ''}`;
  const b = await launch(), errs = [], pages = [];
  for (let i = 0; i < 2; i++) {
    const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
    const brokerPort = MODE === 'fallback' && i === 1 ? 9 : 9123;   // fallback: the guest's PeerJS broker is unreachable
    await ctx.addInitScript((pp) => { window.BITTEN_NET_CONFIG = { host: '127.0.0.1', port: pp, path: '/', secure: false, config: { iceServers: [] }, relays: ['ws://127.0.0.1:9124'] }; }, brokerPort);
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(base); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`); pages.push(p);
  }
  const [H, Gp] = pages;
  /* a played save: 60 KB of history in the host's save */
  await H.evaluate(() => { Save.data.stats = Object.assign({}, Save.data.stats, { pad14test: 'x'.repeat(60000) }); });
  await H.evaluate(() => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.host(); });
  await H.waitForFunction(() => /Waiting/.test(window.__bitten.net14.S.status) || window.__bitten.net14.S.err, null, { timeout: 20000 });
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  await Gp.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 40000 });
  const via = await Gp.evaluate(() => window.__bitten.net14.S.via);
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of pages) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 15000 });
  const big = await Gp.evaluate(() => (Save.data.stats.pad14test || '').length);
  /* force repairs: nudge the guest's apple half a pixel every 4 s for the first half (drift, as between two browser engines) */
  const t0 = Date.now();
  while (Date.now() - t0 < SECS * 500) { await Gp.evaluate(() => { if (G.player) G.player.x += 0.5; }); await new Promise((r) => setTimeout(r, 4000)); }
  const mark = await H.evaluate(() => window.__bitten.net14.NET.tick);
  await new Promise((r) => setTimeout(r, SECS * 500));
  const st = [];
  for (const p of pages) st.push(await p.evaluate(() => { const N = window.__bitten.net14.NET, S = window.__bitten.net14.S; return { tick: N.tick, repairs: N.repairs, desync: N.desync, open: S.role === 'host' ? S.members.filter((m) => m.link && m.link.open).length : !!(S.link && S.link.open), live: N.live, hist: [...N.hist] }; }));
  const m = new Map(st[0].hist); let same = 0, diff = 0;
  for (const [n, h] of st[1].hist) if (n > mark + 120 && m.has(n)) { if (m.get(n) === h) same++; else diff++; }
  for (const s of st) delete s.hist;
  console.log(JSON.stringify({ MODE, code, via, bigSaveOnGuest: big, st, same, diff, errs: errs.slice(0, 5) }));
  const ok = big === 60000 && st[1].repairs > 0 && st[0].live && st[1].live && st[1].open && same >= 3 && diff === 0 && !errs.length && (MODE !== 'fallback' || via === 'relay');
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); hs.close(); ms.close(); aedes.close(); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
