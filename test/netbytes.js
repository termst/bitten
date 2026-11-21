// Online bandwidth over the local transport: host + guests play with the bot, every BroadcastChannel message
// is counted. Prints characters and messages per second, host to guests and guests to host, and the size of
// the start message. Also checks lockstep (same hashes, no errors) like test/net.js.
// Usage: NODE_PATH=$(npm root -g) node test/netbytes.js [seconds=20] [guests=1]
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
(async () => {
  const secs = +(process.argv[2] || 20), guests = +(process.argv[3] || 1);
  const srv = await serve(0); const port = srv.address().port;
  const url = `http://127.0.0.1:${port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 700 } });
  await ctx.addInitScript(() => {
    const C = window.__netBytes = { up: 0, upN: 0, down: 0, downN: 0, start: 0 };
    const pm = BroadcastChannel.prototype.postMessage;
    BroadcastChannel.prototype.postMessage = function (m) {
      if (m && m.k === 'd' && typeof m.d === 'string') {
        const n = m.d.length;
        if (m.to === 'host') { C.up += n; C.upN++; } else { C.down += n; C.downN++; if (/"t":"start"/.test(m.d.slice(0, 40)) || (m.d[0] === '+' && !C.start)) C.start += n; }
      }
      return pm.apply(this, arguments);
    };
  });
  const pages = [], errs = [];
  for (let i = 0; i <= guests; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`);
    pages.push(p);
  }
  const [H] = pages;
  await H.evaluate(() => { window.__bitten.Save.data.mode = 'arcade'; window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.host(); });
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  for (const g of pages.slice(1)) await g.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction((n) => window.__bitten.net14.S.members.length === n, guests + 1, { timeout: 5000 });
  const before = await H.evaluate(() => Object.assign({}, window.__netBytes));
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of pages) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 5000 });
  const t0 = await H.evaluate(() => Object.assign({}, window.__netBytes));
  const g0 = await pages[1].evaluate(() => Object.assign({}, window.__netBytes));
  await new Promise((r) => setTimeout(r, secs * 1000));
  const t1 = await H.evaluate(() => Object.assign({}, window.__netBytes));
  const g1 = await pages[1].evaluate(() => Object.assign({}, window.__netBytes));
  const st = [];
  for (const p of pages) st.push(await p.evaluate(() => { const N = window.__bitten.net14.NET; return { live: N.live, tick: N.tick, desync: N.desync, repairs: N.repairs, hist: [...(N.hist || new Map())] }; }));
  const hm = new Map(st[0].hist); let same = 0, diff = 0;
  for (const s of st.slice(1)) for (const [n, h] of s.hist) if (hm.has(n)) { if (hm.get(n) === h) same++; else diff++; }
  const out = {
    startChars: t0.down - before.down,
    downCharsPerSecPerGuest: Math.round((t1.down - t0.down) / secs / guests), downMsgsPerSecPerGuest: +((t1.downN - t0.downN) / secs / guests).toFixed(1),
    upCharsPerSec: Math.round((g1.up - g0.up) / secs), upMsgsPerSec: +((g1.upN - g0.upN) / secs).toFixed(1),
    ticks: st.map((s) => s.tick), desync: st.map((s) => s.desync), repairs: st.map((s) => s.repairs), checkpoints: { same, diff }, errs: errs.slice(0, 5),
  };
  console.log(JSON.stringify(out, null, 1));
  const ok = same > 5 && diff === 0 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
