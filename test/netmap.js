// v14.6 online: share a level in the lobby (More, Share level), save it, play a Map Maker map together.
// A guest shares a map, the host gets a card and picks it for the team (Play together), the host shares one back and the
// guest saves it to its maps. The online Map run starts on both peers with the same map; a Choice on the start tile freezes
// both peers until the apple that found it answers (a click by the other apple does nothing), then the bots play on and
// the lockstep hashes must match. Usage: NODE_PATH=$(npm root -g) node test/netmap.js [seconds=12] [shotdir]
const { launch, serve } = require('./lib');
const { botInstall } = require('./bot');
(async () => {
  const secs = +(process.argv[2] || 12), shots = process.argv[3] || '';
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: shots ? 2 : 1 });
  const errs = [], pages = [];
  for (let i = 0; i < 2; i++) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`));
    await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14);
    pages.push(p);
  }
  const [H, Gs] = pages;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await H.evaluate(() => { const B = window.__bitten; B.Save.data.mode = 'arcade'; B.Save.data.gm14 = { style: 'plus', max: 2 }; B.coop14.open(); B.coop14.setTab('online'); B.net14.host(); });
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  await Gs.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 2, null, { timeout: 5000 });

  // the guest builds a map with a Choice on the start tile and shares it through the More menu
  await Gs.evaluate(() => {
    const MK = window.__bitten.MK123;
    const M = MK.cleanMapNow({ name: 'Keuze voor twee', author: 'Gast', floors: [{ set: 'draken', rooms: [
      { x: 4, y: 4, t: 'start', e: [{ t: 'cq', c: 5, r: 4, ti: 'Samen', txt: 'Wie kiest er?', a: 'Munten', ae: 'coins', b: 'Niks', be: 'none' }] },
      { x: 5, y: 4, t: 'fight', e: [{ t: 'sn', c: 7, r: 4, k: 'munt14' }, { t: 'sn', c: 8, r: 2, k: 'aarde' }] },
      { x: 6, y: 4, t: 'boss' }] }] });
    MK.Store.put(M);
  });
  await Gs.click('#coop14 [data-a="more"]');
  await Gs.click('#coop14 [data-a="sharelv"]');
  if (shots) await Gs.screenshot({ path: `${shots}/netmap-share.png` });
  await Gs.click('#coop14 [data-share]');
  await H.waitForFunction(() => (window.__bitten.net14.S.inbox || []).length === 1, null, { timeout: 5000 });
  if (shots) await H.screenshot({ path: `${shots}/netmap-inbox.png` });
  await H.click('#coop14 [data-play]');
  await Gs.waitForFunction(() => window.__bitten.net14.S.gm && window.__bitten.net14.S.gm.map === 'Keuze voor twee', null, { timeout: 5000 });
  // the host shares one of the examples back; the guest saves it
  await H.evaluate(() => { const B = window.__bitten; B.net14.shareMap(B.MK123.EXAMPLES()[0]); });
  await Gs.waitForFunction(() => (window.__bitten.net14.S.inbox || []).length === 1, null, { timeout: 5000 });
  const saved = await Gs.evaluate(() => { const B = window.__bitten, it = B.net14.S.inbox[0]; const n0 = B.MK123.Store.list.length; B.net14.saveShared(it); return { name: it.name, before: n0, after: B.MK123.Store.list.length, saved: it.saved }; });
  const lobby = await Gs.evaluate(() => ({ mode: window.__bitten.net14.S.mode, gmMap: window.__bitten.net14.S.gm.map }));
  if (shots) await Gs.screenshot({ path: `${shots}/netmap-lobby.png` });

  // the run
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of pages) await p.waitForFunction(() => window.__bitten.net14.NET.live, null, { timeout: 5000 });
  const run = await Promise.all(pages.map((p) => p.evaluate(() => { const B = window.__bitten, G = B.G; return { mode: G.mode, map: B.MK123.RTM.cur && B.MK123.RTM.cur.name, set: G.levelDef.set, players: G.players.length }; })));
  // the Choice opens on both peers; only its owner can answer
  for (const p of pages) await p.waitForFunction(() => window.__bitten.MK123.Pop.on, null, { timeout: 8000 });
  const owner = await H.evaluate(() => window.__bitten.MK123.Pop.cur.slot | 0);
  const [O, X] = owner === 0 ? [H, Gs] : [Gs, H];
  await wait(600);
  if (shots) await X.screenshot({ path: `${shots}/netmap-choice.png` });
  await X.click('#mkPop .mkp-op').catch(() => null);
  await wait(500);
  const stillOn = await Promise.all(pages.map((p) => p.evaluate(() => window.__bitten.MK123.Pop.on)));
  await O.click('#mkPop .mkp-op');
  for (const p of pages) await p.waitForFunction(() => !window.__bitten.MK123.Pop.on, null, { timeout: 5000 });
  const coins = await Promise.all(pages.map((p) => p.evaluate(() => window.__bitten.G.run.coins)));
  for (let i = 0; i < 2; i++) await pages[i].evaluate(`(${botInstall.toString()})(${i + 1}, { render: true, net: true })`);
  await wait(secs * 1000);
  if (shots) await H.screenshot({ path: `${shots}/netmap-run.png` });
  const st = [];
  for (const p of pages) st.push(await p.evaluate(() => { const N = window.__bitten.net14.NET; return { tick: N.tick, desync: N.desync, repairs: N.repairs, hist: [...(N.hist || new Map())], errors: window.__bitten.G.errors || 0, log: ERR14.log.slice(-4) }; }));
  const hm = new Map(st[0].hist); let same = 0, diff = 0;
  for (const [n, h] of st[1].hist) if (hm.has(n)) { if (hm.get(n) === h) same++; else diff++; }
  const out = { saved, lobby, run, owner, stillOn, coins, ticks: st.map((s) => s.tick), desync: st.map((s) => s.desync), errors: st.map((s) => s.errors), log: st.map((s) => s.log), checkpoints: { same, diff }, errs: errs.slice(0, 5) };
  console.log(JSON.stringify(out, null, 1));
  const ok = saved.saved && saved.after === saved.before + 1 && lobby.mode === 'map' && lobby.gmMap === 'Keuze voor twee'
    && run.every((r) => r.mode === 'map' && r.map === 'Keuze voor twee' && r.set === 'draken' && r.players === 2)
    && stillOn.every(Boolean) && coins[0] === coins[1] && coins[0] >= 10
    && same > 3 && diff === 0 && !errs.length && st.every((s) => !s.errors);
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(ok ? 0 : 1);
})();
