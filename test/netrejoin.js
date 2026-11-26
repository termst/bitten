// v14.10: a guest drops out of a running online run and comes back. The host sends the start and every bundle since
// tick 0, the guest replays them and is live again: same state hash as the host at every checkpoint after the return,
// its apple is not frozen (away14) any more, no page errors.
// Usage: NODE_PATH=$(npm root -g) node test/netrejoin.js [secs before the drop = 12] [secs away = 8] [secs after = 10]
const { launch, serve } = require('./lib');
(async () => {
  const [s1, s2, s3] = [+(process.argv[2] || 12), +(process.argv[3] || 8), +(process.argv[4] || 10)];
  const srv = await serve(0); const port = srv.address().port;
  const url = `http://127.0.0.1:${port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 650 } });
  const errs = [];
  const tab = async (i) => {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    await p.evaluate((k) => {
      const I = window.__bitten.Input; const t0 = performance.now();
      I.moveVec = () => { const t = (performance.now() - t0) / 1000; return { x: Math.cos(t * (0.7 + k * 0.3) + k), y: Math.sin(t * (0.9 + k * 0.2)) }; };
      I.aimVec = () => { const t = (performance.now() - t0) / 1000; return { x: Math.cos(t * 2 + k), y: Math.sin(t * 2 + k), touch: false }; };
    }, i);
    return p;
  };
  const H = await tab(0); let Gp = await tab(1);
  await H.evaluate(() => { const B = window.__bitten; B.Save.data.mode = 'arcade'; B.coop14.open(); B.coop14.setTab('online'); B.net14.host(); });
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  const join = (p) => p.evaluate((c) => { const B = window.__bitten; B.Save.data.settings.coopNames14 = ['Gast']; B.coop14.open(); B.coop14.setTab('online'); B.net14.join(c); }, code);
  await join(Gp);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 5000 });
  await H.evaluate(() => window.__bitten.net14.start());
  await Gp.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 5000 });
  await new Promise((r) => setTimeout(r, s1 * 1000));
  // the guest's tab closes (a phone that lost the page)
  await Gp.close();
  await new Promise((r) => setTimeout(r, s2 * 1000));
  const awayNow = await H.evaluate(() => window.__bitten.G.players[1].away14 === true);
  // a fresh tab joins the same room again
  Gp = await tab(1);
  await join(Gp);
  await Gp.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 8000 }).catch(() => null);
  await Gp.waitForFunction(() => { const N = window.__bitten.net14.NET; return N.live && !N.catchup; }, null, { timeout: 60000 }).catch(() => null);
  const tBack = await Gp.evaluate(() => window.__bitten.net14.NET.tick);
  await new Promise((r) => setTimeout(r, s3 * 1000));
  const st = [];
  for (const p of [H, Gp]) st.push(await p.evaluate(() => {
    const N = window.__bitten.net14.NET, G = window.__bitten.G;
    return { live: N.live, tick: N.tick, q: N.queue.length, desync: N.desync, repairs: N.repairs, state: G.state, away: G.players.map((P) => !!P.away14), hist: [...(N.hist || new Map())], errors: G.errors || 0 };
  }));
  const hm = new Map(st[0].hist); let same = 0, diff = 0;
  for (const [n, h] of st[1].hist) if (n > tBack && hm.has(n)) { if (hm.get(n) === h) same++; else diff++; }
  for (const s of st) delete s.hist;
  const out = [];
  const ok = (n, c, i = '') => { out.push(`${c ? 'PASS' : 'FAIL'} ${n}${i ? ': ' + i : ''}`); if (!c) process.exitCode = 1; };
  ok('host marks the dropped apple away', awayNow);
  ok('guest is live again after the return', st[1].live, JSON.stringify(st[1]));
  ok('nobody is away after the return', !st[0].away.some(Boolean) && !st[1].away.some(Boolean), JSON.stringify(st.map((s) => s.away)));
  ok('lockstep after the return', same >= 3 && diff === 0, `same ${same}, diff ${diff}, ticks ${st[0].tick} / ${st[1].tick}`);
  ok('no repairs, no desync', !st[1].desync && !st[1].repairs, `desync ${st[1].desync}, repairs ${st[1].repairs}`);
  ok('no page errors', !errs.length && !st[0].errors && !st[1].errors, errs.slice(0, 3).join(' | '));
  console.log(out.join('\n'));
  await b.close(); srv.close(); process.exit(process.exitCode || 0);
})();
