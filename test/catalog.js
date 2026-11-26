// v14.6 catalog: everything the game has reaches Custom Run and the Map Maker, and the new settings work.
// 1. Custom Run lists every floor and boss (locked ones disabled), plays a dragon sky stage with a Knokpit and a boss reward.
// 2. Map Maker: every floor, snake, boss, modifier and room type is in its catalog; a map with every snake (colour, health),
//    the Knokpit, the Clini-Clown HQ, the dragon sky and space floors plays without errors; the share code keeps the new
//    fields; a room powerup list rolls only its powerups (also dragon ones on a cellar floor); the floor boss reward drops.
// Screenshots: test/out/catalog-*.png. Usage: NODE_PATH=$(npm root -g) node test/catalog.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const OUT = path.join(ROOT, 'test', 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
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
  const shot = (n) => page.screenshot({ path: path.join(OUT, `catalog-${n}.png`) });
  const res = {};

  // 1. Custom Run
  res.cust = await step(async () => {
    const B = window.__bitten, G = B.G, D = B.Save.data;
    for (const id of ITEM_IDS) D.found[id] = true;
    D.seen['f:draken'] = true; D.seen['b:keizer14'] = true;
    D.mode = 'custom';
    D.cust = { stages: [{ set: 'draken', boss: 'auto', arena: false, rw: 'goud_dk' in ITEMS ? 'goud_dk' : 'rare', kn: 1 }, { set: 'cellar', boss: 'keizer14', arena: true }], p: { knok: 0 }, items: [] };
    B.UI.paintPlay && B.UI.show && B.UI.show('play');
    B.UI.paintPlay();
    await window.__advance(200);
    const fl = [...document.querySelectorAll('#cust10 .dd19.fl select, #cust10 select.fl')][0];
    const opts = fl ? [...fl.options].map((o) => o.value + (o.disabled ? '!' : '')) : [];
    const bs = [...document.querySelectorAll('#cust10 .dd19.bs select, #cust10 select.bs')][1];
    const bopts = bs ? [...bs.options].map((o) => o.value) : [];
    const rw = document.querySelector('#cust10 select.rw');
    return { floors: opts, bosses: bopts.length, hasKeizer: bopts.includes('keizer14'), rwOpts: rw ? rw.options.length : 0, kn: !!document.querySelector('#cust10 .kn[aria-pressed="true"]'), knokRule: !!document.querySelector('#cust10 [data-k="knok"]') };
  });
  await shot('custom');
  res.custRun = await step(async () => {
    const B = window.__bitten, G = B.G;
    B.Game.toMenu(); B.Game.startRun(false, 'custom');
    await window.__tick14(500);
    G.player.god = true;
    const set = G.levelDef.set, brawl = G.map.rooms.some((r) => r.type === 'brawl');
    const room = G.map.boss, before = room.pickups.filter((p) => p.kind === 'item').length;
    B.Game.enterRoom(room, 's');
    await window.__tick14(800);
    B.Game.clearRoom(room);
    await window.__tick14(300);
    const after = room.pickups.filter((p) => p.kind === 'item').map((p) => p.id);
    return { set, brawl, before, after, rw14: !!room.rw14 };
  });

  // 2. Map Maker catalog
  res.catalog = await step(() => {
    const B = window.__bitten, MK = B.MK123, C = B.CAT14;
    const missing = (have, want) => want.filter((k) => !have.includes(k));
    return {
      count: C.count(),
      floors: missing(MK.SETS, C.floors()),
      snakes: missing(MK.SNAKES, C.snakes().filter((k) => k !== 'noodle')),
      bosses: missing(MK.BOSSES, C.bosses().filter((k) => k !== 'jaude')),
      mods: missing(MK.MODS.map((m) => m[0]), C.mods().filter((k) => k !== 'swarm')),
      rooms: ['brawl', 'clownhq'].filter((t) => !MK.RT[t]),
    };
  });

  // a map with everything
  res.map = await step(async () => {
    const B = window.__bitten, MK = B.MK123, G = B.G;
    const sn = MK.SNAKES.slice(), mods = MK.MODS.map((m) => m[0]).filter(Boolean);
    const dk = ITEM_IDS.filter((id) => /_dk$/.test(id));
    const floors = [];
    const mkFloor = (set, list, extra) => {
      const rooms = [{ x: 0, y: 0, t: 'start', e: [] }];
      let i = 0, x = 1, y = 0;
      while (i < list.length) {
        const e = [];
        for (let k = 0; k < 3 && i < list.length; k++, i++) e.push({ t: 'sn', c: 2 + k * 3, r: 4, k: list[i], vr: (i % 4) + 1, hp: [1, 1.5, 2, 3][i % 4] });
        rooms.push({ x, y, t: 'fight', m: mods[rooms.length % mods.length], e });
        x++; if (x > 8) { x = 0; y++; }
      }
      for (const t of extra) { rooms.push({ x, y, t, e: [] }); x++; if (x > 8) { x = 0; y++; } }
      return { set, rooms };
    };
    floors.push(mkFloor('cellar', sn.slice(0, 27), ['brawl', 'clownhq', 'boss']));
    floors[0].brw = ['rare', dk[0], 'rand'];
    floors[0].rooms[1].pl = { m: 'only', ids: dk.slice(0, 3) };
    floors.push(mkFloor('draken', sn.slice(27), ['boss']));
    floors.push(mkFloor('ruimte', [], ['boss']));
    const raw = { name: 'Everything', floors };
    const M = MK.cleanMapNow(JSON.parse(JSON.stringify(raw)));
    // the share code keeps the new fields
    const code = await MK.encodeMap(M);
    const back = await MK.decodeMap(code);
    const F0 = back.floors[0];
    const keep = { brw: F0.brw, pl: F0.rooms[1].pl, vr: F0.rooms[1].e[1].vr, hp: F0.rooms[1].e[1].hp, types: F0.rooms.map((r) => r.t).slice(-3), sets: back.floors.map((F) => F.set) };
    MK.Maker.reopen(); await window.__tick14(200);
    MK.playMap(M, 'hub');
    await window.__tick14(600);
    G.player.god = true;
    const out = { keep, floors: [], pool: null };
    for (let fi = 0; fi < M.floors.length; fi++) {
      if (fi > 0) { B.Game.loadLevel(fi); await window.__tick14(600); G.player.god = true; }
      const f = { set: G.levelDef.set, types: {}, snakes: 0, scaled: 0, coloured: 0 };
      for (const room of G.map.rooms) {
        f.types[room.type] = (f.types[room.type] || 0) + 1;
        if (room === G.map.start) continue;
        B.Game.enterRoom(room, 'w');
        await window.__tick14(1500);
        f.snakes += room.snakes.length;
        f.scaled += room.snakes.filter((s) => s.maxHp > (KINDS[s.kind].hp || 0) * 1.4).length;
        f.coloured += room.snakes.filter((s) => s.look14v > 0).length;
        if (fi === 0 && room.mkR === M.floors[0].rooms[1] || (fi === 0 && room.mkR && room.mkR.pl && room.mkR.pl.m)) {
          const got = []; for (let k = 0; k < 6; k++) got.push(nextItemId(0.05));
          out.pool = { got, ok: got.every((id) => dk.slice(0, 3).includes(id) || id === 'golden') };
        }
        if (room.type === 'boss') {
          const n0 = room.pickups.filter((p) => p.kind === 'item').length;
          B.Game.clearRoom(room); await window.__tick14(200);
          f.bossDrops = room.pickups.filter((p) => p.kind === 'item').length - n0;
        }
      }
      out.floors.push(f);
    }
    out.errors = ERR14.n; out.log = ERR14.log.slice(-5);
    return out;
  });
  await shot('map-run');

  // the editor shows the new things
  res.editor = await step(async () => {
    const B = window.__bitten, MK = B.MK123;
    B.Game.toMenu();
    await window.__tick14(300);
    const M = MK.cleanMapNow({ name: 'Editor look', floors: [{ set: 'draken', rooms: [{ x: 4, y: 4, t: 'start' }, { x: 5, y: 4, t: 'brawl' }, { x: 3, y: 4, t: 'fight', e: [{ t: 'sn', c: 5, r: 4, k: 'toorn14', vr: 2, hp: 2 }], pl: { m: 'only', ids: ITEM_IDS.filter((id) => /_dk$/.test(id)).slice(0, 4) } }], brw: ['rare'] }] });
    MK.Store.put(M);
    MK.edit(M);
    await window.__tick14(400);
    MK.selectRoom(3, 4);
    await window.__tick14(300);
    const txt = (id) => (document.getElementById(id) || {}).textContent || '';
    return { roomPool: /Powerups in this room/.test(txt('mkPaneRoom')), bossRw: /Boss reward/.test(txt('mkPaneFloor')), types: [...document.querySelectorAll('#mkPaneRoom .mk-types button')].length };
  });
  await shot('editor');

  console.log(JSON.stringify(res, null, 1));
  if (errs.length) console.log('page errors:', errs.slice(0, 6));
  const C = res.cust, R = res.custRun, K = res.catalog, Mp = res.map, E = res.editor;
  const ok = C.floors.includes('draken') && C.floors.length >= 15 && C.hasKeizer && C.rwOpts > 3 && C.kn && C.knokRule
    && R.set === 'draken' && R.brawl && R.rw14 && R.after.length > R.before
    && !K.floors.length && !K.snakes.length && !K.bosses.length && !K.mods.length && !K.rooms.length
    && Mp.keep.brw.length === 3 && Mp.keep.pl.m === 'only' && Mp.keep.vr === 2 && Mp.keep.hp === 1.5 && Mp.keep.sets.join() === 'cellar,draken,ruimte'
    && Mp.floors[0].types.brawl === 1 && Mp.floors[0].types.clownhq === 1 && Mp.floors[0].bossDrops >= 3 && Mp.pool && Mp.pool.ok
    && Mp.floors[0].snakes + Mp.floors[1].snakes >= 40 && Mp.floors[0].coloured > 0 && Mp.floors[0].scaled > 0
    && Mp.floors[1].set === 'draken' && Mp.floors[2].set === 'ruimte' && !Mp.errors
    && E.roomPool && E.bossRw && E.types >= 24 && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); process.exit(ok ? 0 : 1);
})();
