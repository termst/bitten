// Online Game Maker (v14.2): the host's settings reach the guests in the lobby and in the run, max apples
// turns a third apple away, a fixed seed gives the same first floor twice, lockstep holds with the bot.
// Usage: NODE_PATH=$(npm root -g) node test/netgm.js [seconds=15] [style=split]
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
(async () => {
  const secs = +(process.argv[2] || 15), style = process.argv[3] || 'split';
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 700 } });
  const pages = [], errs = [];
  for (let i = 0; i < 3; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    if (i < 2) await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`);
    pages.push(p);
  }
  const [H, Gs, X] = pages;
  await H.evaluate((st) => { const B = window.__bitten; B.Save.data.mode = 'arcade'; B.Save.data.gm14 = { style: st, p: { dmg: 1.5, coins: 30 }, co: { revive: 1.5, door: 6 }, max: 2, seed: 'appeltaart' };
    B.coop14.open(); B.coop14.setTab('online'); B.net14.host(); }, style);
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  await Gs.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 5000 });
  await Gs.waitForFunction(() => window.__bitten.net14.S.gm, null, { timeout: 5000 });
  const lobby = await Gs.evaluate(() => { const S = window.__bitten.net14.S; return { gm: S.gm, ro: !!document.querySelector('#coop14 .gm14.ro'), btns: document.querySelectorAll('#coop14 .gm14.ro button:not([disabled])').length }; });
  await X.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await X.waitForFunction(() => /full/.test(window.__bitten.net14.S.err || ''), null, { timeout: 8000 }).catch(() => null);
  const third = await X.evaluate(() => window.__bitten.net14.S.err);
  const runOnce = async () => {
    await H.evaluate(() => window.__bitten.net14.start());
    for (const p of [H, Gs]) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 5000 });
    return Promise.all([H, Gs].map((p) => p.evaluate(() => { const G = window.__bitten.G; return { seed: G.run.seed, style: G.run.coop14, co: Object.assign({}, CO14), dmg: G.players.map((P) => P.dmg), coins: G.players.map((P) => withPlayer(P, () => G.run.coins)) }; })));
  };
  const r1 = await runOnce();
  await new Promise((r) => setTimeout(r, secs * 1000));
  const st = [];
  for (const p of [H, Gs]) st.push(await p.evaluate(() => { const N = window.__bitten.net14.NET; return { tick: N.tick, desync: N.desync, repairs: N.repairs, hist: [...(N.hist || new Map())], errors: window.__bitten.G.errors || 0, log: (window.__bitten.G.errorLog || []).slice(-4) }; }));
  const hm = new Map(st[0].hist); let same = 0, diff = 0;
  for (const [n, h] of st[1].hist) if (hm.has(n)) { if (hm.get(n) === h) same++; else diff++; }
  const r2 = await runOnce();
  const out = { lobby, third, run1: r1, run2seed: r2.map((x) => x.seed), ticks: st.map((s) => s.tick), errors: st.map((s) => s.errors), log: st[0].log, checkpoints: { same, diff }, errs: errs.slice(0, 5) };
  console.log(JSON.stringify(out, null, 1));
  const [h, g] = r1;
  const ok = lobby.gm && lobby.gm.style === style && lobby.ro && lobby.btns === 0 && /full/.test(third || '')
    && h.style === style && g.style === style && g.co.revive === 1.5 && g.co.door === 6 && JSON.stringify(h) === JSON.stringify(g) && h.dmg[1] === h.dmg[0]
    && r2[0].seed === h.seed && r2[1].seed === h.seed && same > 3 && diff === 0 && !errs.length && st.every((s) => !s.errors);
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
