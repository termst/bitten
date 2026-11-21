// Freeze hunt: host + guest online with the bot for N seconds; every 2 s logs tick, state, queue and decider
// per tab, and fails on any stretch where a tab's game time stops for 6 s or more while it plays.
// Online shop and contract panels are personal (v14.2.1): the run must keep going while one apple chooses.
// Usage: NODE_PATH=$(npm root -g) node test/netfreeze.js [seconds=120] [style=split] [guests=1]
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
(async () => {
  const secs = +(process.argv[2] || 120), style = process.argv[3] || 'split', guests = +(process.argv[4] || 1);
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 700 } });
  const pages = [], errs = [];
  for (let i = 0; i <= guests; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    await p.evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`);
    pages.push(p);
  }
  const [H] = pages;
  await H.evaluate((st) => { const B = window.__bitten; B.Save.data.mode = 'arcade'; B.Save.data.gm14 = { style: st }; B.coop14.open(); B.coop14.setTab('online'); B.net14.host(); }, style);
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  for (const g of pages.slice(1)) await g.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction((n) => window.__bitten.net14.S.members.length === n, guests + 1, { timeout: 5000 });
  await H.evaluate(() => window.__bitten.net14.start());
  const log = [], last = pages.map(() => ({ tick: -1, gt: -1, since: 0 })), stuck = [];
  for (let t = 0; t < secs; t += 2) {
    await new Promise((r) => setTimeout(r, 2000));
    const row = [];
    for (let i = 0; i < pages.length; i++) {
      const s = await pages[i].evaluate(() => { const N = window.__bitten.net14.NET, G = window.__bitten.G; return { tick: N.tick, live: N.live, st: G.state, gt: Math.round(G.t * 10) / 10, q: N.queue.length, dec: N.decider, lvl: G.levelIdx, room: G.room && G.room.type, err: G.errors || 0, ghosts: G.players.map((P) => (P.ghost14 ? 1 : 0)).join(''), pn: G.panel14 ? G.panel14.k + G.panel14.slot : '' }; });
      row.push(s);
      const L = last[i];
      if (s.gt === L.gt && s.live && s.st === 'play') { L.since += 2; if (L.since === 6) stuck.push({ t, tab: i, s }); } else L.since = 0;
      L.tick = s.tick; L.gt = s.gt;
    }
    log.push([t, row.map((s) => `${s.st}/${s.room}/t${s.gt}/q${s.q}/d${s.dec}/g${s.ghosts}/e${s.err}${s.pn ? '/P:' + s.pn : ''}${s.live ? '' : '/OFF'}`).join('  ')]);
  }
  for (const l of log) console.log(l[0], l[1]);
  const panels = log.filter((l) => /P:/.test(l[1])).length;
  console.log(JSON.stringify({ stuck: stuck.slice(0, 10), panels, errs: errs.slice(0, 5) }));
  const ok = !stuck.length && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
