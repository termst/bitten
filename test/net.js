// Online coop over the local transport (?net=local, BroadcastChannel): a host tab and a guest tab in one
// browser, real clocks, scripted input. Checks: the lobby forms, the run starts on both, both simulations
// give the same state hash at every checkpoint (lockstep), no repairs needed, no page errors.
// Usage: NODE_PATH=$(npm root -g) node test/net.js [seconds=30] [guests=1] [--bot]
//        --bot: every tab plays with the regression bot (test/bot.js): fights, loot, doors, panels
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
const BOT = process.argv.includes('--bot');
(async () => {
  const secs = +(process.argv[2] || 30), guests = +(process.argv[3] || 1);
  const srv = await serve(0); const port = srv.address().port;
  const url = `http://127.0.0.1:${port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 700 } });
  const pages = [], errs = [];
  for (let i = 0; i <= guests; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    if (BOT) { await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`); pages.push(p); continue; }
    /* scripted input: each tab walks its own circle and shoots ahead, dashes now and then */
    await p.evaluate((k) => {
      const I = window.__bitten.Input; let t0 = performance.now();
      I.moveVec = () => { const t = (performance.now() - t0) / 1000; return { x: Math.cos(t * (0.7 + k * 0.3) + k), y: Math.sin(t * (0.9 + k * 0.2)) }; };
      I.aimVec = () => { const t = (performance.now() - t0) / 1000; return { x: Math.cos(t * 2 + k), y: Math.sin(t * 2 + k), touch: false }; };
      setInterval(() => { I.dashReq = true; }, 1700 + k * 300);
    }, i);
    pages.push(p);
  }
  const [H] = pages;
  await H.evaluate(() => { window.__bitten.Save.data.mode = 'arcade'; window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.host(); });
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  for (const g of pages.slice(1)) await g.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction((n) => window.__bitten.net14.S.members.length === n, guests + 1, { timeout: 5000 });
  const lobby = await pages[1].evaluate(() => ({ me: window.__bitten.net14.S.me, n: window.__bitten.net14.S.members.length }));
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of pages) await p.waitForFunction(() => window.__bitten.NET14 ? true : window.__bitten.net14.NET.live, null, { timeout: 5000 });
  await new Promise((r) => setTimeout(r, secs * 1000));
  const st = [];
  for (const p of pages) st.push(await p.evaluate(() => {
    const N = window.__bitten.net14.NET, G = window.__bitten.G;
    return { live: N.live, tick: N.tick, q: N.queue.length, desync: N.desync, repairs: N.repairs, state: G.state, n: G.players.length, room: G.room && G.room.id, lvl: G.levelIdx,
      hp: G.players.map((P) => P.hp), kills: G.run && G.run.kills, hist: [...(N.hist || new Map())], errors: window.__bitten.G.errors || 0 };
  }));
  const hm = new Map(st[0].hist); let same = 0, diff = 0, firstDiff = null;
  for (const s of st.slice(1)) for (const [n, h] of s.hist) if (hm.has(n)) { if (hm.get(n) === h) same++; else { diff++; if (firstDiff == null) firstDiff = n; } }
  for (const s of st) delete s.hist;
  console.log(JSON.stringify({ code, lobby, st, checkpoints: { same, diff, firstDiff }, errs: errs.slice(0, 5) }, null, 1));
  const ok = st.every((s) => s.live || s.state === 'over') && same > 5 && diff === 0 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
