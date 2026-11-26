// v14.8 content sync: every floor, boss, snake, room type and modifier reaches every feature, from one source.
// 1. B.SYNC14.audit() is empty: Admin (room types, fight modifiers, boss picker, spawn list), Map Maker (floors,
//    snakes, bosses, modifiers, rooms), Custom Run (floors, bosses, a rule per hidden room), the guide (cards, rooms).
// 2. New content registered at run time (a snake, a modifier, a room) shows up after a sync without other edits.
// 3. Admin builds every room type in a run without errors (secret, Kelderspook, portal, club, Knokpit, SIX SEVEN ...).
// 4. A Map Maker map with every extra room type plays without errors.
// 5. Custom Run: SIX SEVEN per stage and as a rule, Knokpit rule Never; Game Maker shows the hidden room rules.
// 6. Admin "Unlock everything" opens every floor (dragon sky included).
// Usage: NODE_PATH=$(npm root -g) node test/sync.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.waitForFunction(() => window.__bitten && window.__bitten.Game);
  await page.evaluate(() => window.__bitten.CHUNKS14 && window.__bitten.CHUNKS14.loadAll());   // v14.10: the Map Maker is a lazy chunk
  await page.evaluate(() => {
    const B = window.__bitten;
    window.__tick14 = async (ms) => { for (let t = 0; t < ms; t += 100) { await window.__advance(Math.min(100, ms - t)); if (B.G.state === 'contract' && B.CT24) B.CT24.decline(); } };
    return window.__advance(300);
  });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const res = {};

  // 1. nothing missing anywhere
  res.audit = await step(() => window.__bitten.SYNC14.audit());

  // 2. new content flows in by itself
  res.fresh = await step(() => {
    const B = window.__bitten;
    KINDS.test99 = Object.assign({}, KINDS.grub, { name: 'Test Worm', guide14: ['Test', 'A test snake.'] });
    MOD_NAMES.test99 = 'Test mod';
    B.ROOMINFO14.test99 = { name: 'Test Room', code: 'TST', col: '#ffffff', desc: 'A test room.', hung: 1 };
    const before = Object.keys(B.SYNC14.audit());
    B.SYNC14.sync();
    const after = B.SYNC14.audit();
    delete KINDS.test99; delete MOD_NAMES.test99; delete B.ROOMINFO14.test99;
    return { before, after };
  });
  await page.reload();
  await page.waitForFunction(() => window.__bitten && window.__bitten.Game);
  await page.evaluate(() => window.__bitten.CHUNKS14 && window.__bitten.CHUNKS14.loadAll());
  await page.evaluate(() => window.__advance(300));
  await page.evaluate(() => {
    const B = window.__bitten;
    window.__tick14 = async (ms) => { for (let t = 0; t < ms; t += 100) { await window.__advance(Math.min(100, ms - t)); if (B.G.state === 'contract' && B.CT24) B.CT24.decline(); } };
  });

  // 3. Admin builds every room type
  res.admin = await step(async () => {
    const B = window.__bitten, G = B.G, A = B.V119;
    B.admin23.A.on = true;
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__tick14(600);
    if (!G.map) return { failed: ['no run: ' + G.state + ' ' + G.mode], errors: 0, log: ERR14.log.slice(-4) };
    G.player.god = true;
    const e0 = ERR14.n, out = { built: [], failed: [] };
    for (const [t] of A.TYPES) {
      const free = [];
      for (const r of G.map.rooms) for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = r.gx + d[0], y = r.gy + d[1];
        if (!A.roomAt(x, y) && !['club', 'hellclub', 'portal', 'secret', 'vault'].includes(r.type) && !r.sealed) free.push([x, y]);
      }
      A.sel.type = t; A.sel.go = true;
      const msg = A.place(null, free[0][0], free[0][1]);
      await window.__tick14(900);
      const room = A.roomAt(free[0][0], free[0][1]);
      (room && /Added/.test(msg) ? out.built : out.failed).push(t + (room ? ':' + room.type : '') + (room && G.room !== room ? '(not entered)' : ''));
      B.Game.enterRoom(G.map.start, null); await window.__tick14(300);
    }
    out.errors = ERR14.n - e0; out.log = ERR14.log.slice(-4);
    out.mods = A.MODS.map((m) => m[0]);
    return out;
  });

  // 4. a map with every extra room type
  res.map = await step(async () => {
    const B = window.__bitten, MK = B.MK123, G = B.G;
    B.Game.toMenu(); await window.__tick14(200);
    const extra = Object.keys(MK.EXTRA14);
    const rooms = [{ x: 0, y: 0, t: 'start', e: [] }];
    extra.forEach((t, i) => rooms.push({ x: (i % 4) * 2 + 1, y: Math.floor(i / 4) * 2, t, e: [] }));
    for (let y = 0; y < 6; y++) rooms.push({ x: 0, y: y + 1, t: 'hall', e: [] });
    for (let y = 0; y < 4; y += 2) for (let x = 1; x < 8; x += 2) if (!rooms.some((r) => r.x === x + 1 && r.y === y)) rooms.push({ x: x + 1, y, t: 'hall', e: [] });
    rooms.push({ x: 1, y: 6, t: 'boss', e: [] });
    const M = MK.cleanMapNow({ name: 'Every room', floors: [{ set: 'cellar', rooms }] });
    const e0 = ERR14.n;
    MK.Maker.reopen(); await window.__tick14(200);
    MK.playMap(M, 'hub'); await window.__tick14(600);
    if (!G.map) return { extra, seen: {}, errors: 1, log: ERR14.log.slice(-4), state: G.state, rooms: M.floors[0].rooms.map((r) => r.t) };
    G.player.god = true;
    const seen = {};
    for (const room of G.map.rooms) {
      if (room === G.map.start) continue;
      B.Game.enterRoom(room, 'w'); await window.__tick14(1200);
      seen[room.mkR ? room.mkR.t : room.type] = room.type + (room.spook10 ? '+spook' : '');
    }
    return { extra, seen, errors: ERR14.n - e0, log: ERR14.log.slice(-4) };
  });

  // 5. Custom Run and Game Maker
  res.cust = await step(async () => {
    const B = window.__bitten, G = B.G, D = B.Save.data;
    B.Game.toMenu(); await window.__tick14(200);
    D.mode = 'custom';
    D.cust = { stages: [{ set: 'halls', boss: 'auto', arena: false, h67: 1 }, { set: 'cellar', boss: 'auto', arena: false }], p: { knok: -1, h67: 0 }, items: [] };
    B.UI.show && B.UI.show('play'); B.UI.paintPlay(); await window.__tick14(200);
    const ui = { h67Btn: !!document.querySelector('#cust10 .hr[data-h="h67"][aria-pressed="true"]'), knBtn: !!document.querySelector('#cust10 .kn[data-h="kn"]'),
      h67Rule: !!document.querySelector('#cust10 [data-k="h67"]'), knokRule: !!document.querySelector('#cust10 [data-k="knok"]') };
    B.KNOK14.KNOK.force = true;   // the Never rule must win over the code
    B.Game.toMenu(); B.Game.startRun(false, 'custom'); await window.__tick14(500);
    const types = G.map.rooms.map((r) => r.type);
    const run = { set: G.levelDef.set, hype: types.includes('hype67'), brawl: types.includes('brawl'), knokForceAfter: B.KNOK14.KNOK.force };
    B.KNOK14.KNOK.force = false;
    B.Game.toMenu(); await window.__tick14(200);
    const gm = [...(B.cust10.PG.find((g) => g[0] === 'Run')[1])].map((r) => r[0]);
    return { ui, run, gmRows: gm };
  });

  // 6. Unlock everything opens every floor
  res.unlock = await step(() => {
    const B = window.__bitten, D = B.Save.data;
    B.admin23.unlockAll();
    const r = B.CAT14.floors().filter((f) => !D.seen['f:' + f]);
    B.admin23.undoUnlock();
    return r;
  });

  console.log(JSON.stringify(res, null, 1));
  if (errs.length) console.log('page errors:', errs.slice(0, 6));
  const fails = [];
  if (Object.keys(res.audit).length) fails.push('audit: ' + JSON.stringify(res.audit));
  if (!res.fresh.before.length || Object.keys(res.fresh.after).length) fails.push('fresh content: ' + JSON.stringify(res.fresh));
  if (res.admin.failed.length || res.admin.errors) fails.push('admin rooms: ' + JSON.stringify(res.admin.failed) + ' errors ' + res.admin.errors);
  if (res.map.errors || Object.keys(res.map.seen).length < res.map.extra.length) fails.push('map rooms: ' + JSON.stringify(res.map));
  const c = res.cust;
  if (!c.ui.h67Btn || !c.ui.knBtn || !c.ui.h67Rule || !c.ui.knokRule) fails.push('custom ui: ' + JSON.stringify(c.ui));
  if (!c.run.hype || c.run.brawl || !c.run.knokForceAfter) fails.push('custom run: ' + JSON.stringify(c.run));
  if (res.unlock.length) fails.push('unlock floors: ' + res.unlock);
  if (errs.length) fails.push('page errors');
  await b.close();
  if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
  console.log('PASS');
})();
