// v14.9 Map Maker Pro: shapes, brush size, area tool, stamps, waves, events, room rules, generator, overview, test settings.
// 1. Editor: the new tools paint the right cells (line, outline, circle, size 3), the area tool copies, moves and flips,
//    a pasted stamp lands, a saved stamp is in the library.
// 2. Share code keeps waves, events and room rules.
// 3. A run: wave 2 comes after wave 1, events fire (enter shout, kills flip gates, lights, clear drops a powerup),
//    room snake health scales, beat the clock pays, test settings (can not die, coins, keys) only in editor tests.
// 4. Generator: every shape and size gives a valid floor; a generated floor plays without errors.
// Screenshots: test/out/mm2-*.png. Usage: NODE_PATH=$(npm root -g) node test/mapmaker2.js [shotdir]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'test', 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 2 })).newPage();
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
    try { localStorage.removeItem('bitten.mkStamps14'); localStorage.removeItem('bitten.mkTest14'); } catch (e) { /* none */ }
    return window.__advance(300);
  });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const shot = (n) => page.screenshot({ path: path.join(OUT, `mm2-${n}.png`) });
  const res = {}, fails = [];
  const check = (name, ok, info) => { if (!ok) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
  // a mouse drag on the editor canvas, from cell to cell
  async function drag(c0, r0, c1, r1, opt = {}) {
    const p = await step(([c0, r0, c1, r1]) => {
      const MK = window.__bitten.MK123, cv = document.getElementById('mkCv'), rc = cv.getBoundingClientRect(), s = MK.Maker.s;
      const at = (c, r) => ({ x: rc.left + (WALL + (c + 0.5) * T) * s, y: rc.top + (WALL + (r + 0.5) * T) * s });
      return [at(c0, r0), at(c1, r1)];
    }, [c0, r0, c1, r1]);
    if (opt.shift) await page.keyboard.down('Shift');
    await page.mouse.move(p[0].x, p[0].y);
    await page.mouse.down({ button: opt.right ? 'right' : 'left' });
    for (let i = 1; i <= 4; i++) await page.mouse.move(p[0].x + (p[1].x - p[0].x) * i / 4, p[0].y + (p[1].y - p[0].y) * i / 4);
    await page.mouse.up({ button: opt.right ? 'right' : 'left' });
    if (opt.shift) await page.keyboard.up('Shift');
    await step(() => window.__tick14(100));
  }
  const key = async (k) => { await page.keyboard.press(k); await step(() => window.__tick14(60)); };

  // 1. the editor
  await step(async () => {
    const B = window.__bitten, MK = B.MK123;
    const M = MK.cleanMapNow({ name: 'Pro tools', floors: [{ set: 'cellar', rooms: [{ x: 4, y: 3, t: 'start' }, { x: 5, y: 3, t: 'fight' }, { x: 6, y: 3, t: 'boss' }] }] });
    B.Save.data.seen.mkHelp = 1; MK.Store.put(M); MK.Maker.reopen(); await window.__tick14(200);
    MK.edit(M); await window.__tick14(300);
    MK.selectRoom(5, 3); MK.pickBrush({ k: 'tile', ch: '#' }); await window.__tick14(100);
  });
  res.ui = await step(() => ({
    tools: [...document.querySelectorAll('#mkTools [data-tool]')].map((b) => b.dataset.tool),
    size: !!document.querySelector('#mkTools [data-size]'), gear: !!document.getElementById('mkTestSet'),
    cats: [...document.querySelectorAll('#mkPanePaint .mk-cats button')].map((b) => b.textContent),
  }));
  check('tools', ['line', 'ring', 'oval', 'area'].every((t) => res.ui.tools.includes(t)) && res.ui.size && res.ui.gear && res.ui.cats.includes('Stamps'), res.ui);
  const grid = () => step(() => { const MK = window.__bitten.MK123, F = MK.Maker.M.floors[0]; return F.rooms.find((r) => r.x === 5 && r.y === 3).g; });
  const rocks = (g) => [...g].map((ch, i) => (ch === '#' ? i : -1)).filter((i) => i >= 0);
  await key('l'); await drag(1, 1, 5, 1);
  const g1 = await grid();
  check('line', rocks(g1).join() === [12, 13, 14, 15, 16].join(), rocks(g1));
  await key('o'); await drag(1, 3, 4, 6);
  const g2 = await grid(); const ring = rocks(g2).filter((i) => i >= 33);
  check('outline', ring.length === 12 && !ring.includes(4 * 11 + 2), ring);
  await key('c'); await drag(6, 3, 9, 7, { shift: true });
  const g3 = await grid(); const ov = rocks(g3).filter((i) => i % 11 >= 6);
  check('circle filled', ov.length >= 12 && ov.includes(5 * 11 + 7), ov.length);
  await key('Control+z'); await key('Control+z'); await key('Control+z');
  check('undo shapes', rocks(await grid()).length === 0);
  await key('b'); await key('s'); await key('s');
  await drag(5, 4, 5, 4);
  const g4 = await grid();
  check('size 3', rocks(g4).length === 9, rocks(g4).length);
  await key('s'); // back to 1
  // area: select the 3x3 block, flip, move, copy, stamp it twice, save as stamp
  await key('m'); await drag(4, 3, 6, 5);
  res.area = await step(() => window.__bitten.MK123.PRO.area);
  check('area select', res.area && res.area.c0 === 4 && res.area.c1 === 6 && res.area.r0 === 3 && res.area.r1 === 5, res.area);
  await key('ArrowLeft'); await key('ArrowLeft');
  const g5 = await grid();
  check('area move', rocks(g5).join() === [35, 36, 37, 46, 47, 48, 57, 58, 59].join(), rocks(g5));
  await key('Control+c'); await key('Control+v');
  res.stampTool = await step(() => window.__bitten.MK123.Maker.tool);
  await key('r');
  await drag(8, 2, 8, 2);
  const g6 = await grid();
  check('stamp', res.stampTool === 'stamp' && rocks(g6).length === 18, { tool: res.stampTool, n: rocks(g6).length });
  await shot('editor-stamp');
  await key('Escape');
  res.lib = await step(() => {
    const MK = window.__bitten.MK123, R = MK.Maker.M.floors[0].rooms.find((r) => r.x === 5 && r.y === 3);
    MK.saveStamp(MK.grabArea(R, { c0: 2, r0: 3, c1: 4, r1: 5 }), 'Block');
    return MK.myStamps().map((s) => s.n + ':' + s.w + 'x' + s.h);
  });
  check('stamp library', res.lib.join() === 'Block:3x3', res.lib);
  // rotate and flip a clip with pieces
  res.rot = await step(() => {
    const MK = window.__bitten.MK123, s = MK.ST_IN.find((x) => x.n === 'Saw lane');
    const r = MK.rotClip(s), f = MK.flipClip(MK.ST_IN.find((x) => x.n === 'Lever and gates'), true);
    return { w: r.w, h: r.h, ax: r.e[0].ax, sawAt: [r.e[0].c, r.e[0].r], lever: [f.e[0].c, f.e[0].r] };
  });
  check('rotate and flip clips', res.rot.w === 1 && res.rot.h === 7 && res.rot.ax === 'v' && res.rot.sawAt.join() === '0,3' && res.rot.lever.join() === '1,1', res.rot);
  // the stamps palette, area card
  await step(async () => {
    const MK = window.__bitten.MK123;
    MK.Maker.cat = 'stamps'; MK.setTool('area'); MK.PRO.area = { c0: 0, r0: 2, c1: 5, r1: 6 };
    document.querySelector('#mkTabs [data-p="paint"]').click();
    const cat = [...document.querySelectorAll('#mkPanePaint .mk-cats button')].find((b) => b.textContent === 'Stamps'); cat.click();
    MK.setTool('area'); MK.PRO.area = { c0: 0, r0: 2, c1: 5, r1: 6 }; window.__bitten.MK123.Maker.hover = null;
    await window.__tick14(200);
  });
  res.pal = await step(() => document.querySelectorAll('#mkPal .mk-stb').length);
  check('stamp palette', res.pal >= 12, res.pal);
  await shot('editor-area');

  // 2. waves, events and rules in the map and the share code
  res.code = await step(async () => {
    const MK = window.__bitten.MK123;
    const raw = { name: 'Waves and events', floors: [{ set: 'cellar', rooms: [
      { x: 4, y: 3, t: 'start' },
      { x: 5, y: 3, t: 'fight', dk: 2, sh: 2, tb: 30, e: [{ t: 'sn', c: 8, r: 2, k: 'grub' }, { t: 'sn', c: 8, r: 6, k: 'grub' }, { t: 'sn', c: 9, r: 4, k: 'hood', wv: 2 }, { t: 'gt', c: 10, r: 4, ch: 1 }],
        ev: [{ w: 'enter', d: 'shout', txt: 'Two waves' }, { w: 'kills', n: 2, d: 'gates', a: 1 }, { w: 'wave', n: 2, d: 'lights', a: 0 }, { w: 'clear', d: 'item', a: 'rare' }, { w: 'time', n: 3, d: 'coins', a: 25 }] },
      { x: 6, y: 3, t: 'boss' }] }] };
    const M = MK.cleanMapNow(JSON.parse(JSON.stringify(raw)));
    const code = await MK.encodeMap(M), back = await MK.decodeMap(code);
    const R = back.floors[0].rooms[1];
    window.__mm2 = back;
    return { ev: R.ev.map((e) => e.w + '>' + e.d), dk: R.dk, sh: R.sh, tb: R.tb, wv: R.e.map((e) => e.wv || 0), probs: MK.validate(back).map((p) => p.msg) };
  });
  check('share code keeps it', res.code.ev.length === 5 && res.code.dk === 2 && res.code.sh === 2 && res.code.tb === 30 && res.code.wv.join() === '1,1,2,0', res.code);

  // 3. the run
  await step(async () => {
    const MK = window.__bitten.MK123;
    MK.edit(window.__mm2); await window.__tick14(200);
    const ts = MK.PRO.test; ts.god = 1; ts.coins = 50; ts.keys = 3;
    MK.selectRoom(5, 3);
    document.querySelector('#mkTabs [data-p="room"]').click();
    await window.__tick14(200);
    const h = [...document.querySelectorAll('#mkPaneRoom .mk-h')].find((x) => /Room rules/.test(x.textContent));
    const pane = document.getElementById('mkPaneRoom'); if (h) pane.scrollTop = h.offsetTop - pane.offsetTop - 8;
    await window.__tick14(100);
  });
  await shot('room-events');
  res.run = await step(async () => {
    const B = window.__bitten, MK = B.MK123, G = B.G;
    MK.Maker.play(MK.cleanMapNow(JSON.parse(JSON.stringify(window.__mm2))), 'editor');
    await window.__tick14(800);
    const out = { god: !!G.player.god, coins: G.run.coins, keys: G.run.keys };
    const room = G.map.rooms.find((r) => r.mkR && r.mkR.x === 5);
    const dark0 = darkTarget(G.map.start, G.levelDef);
    B.Game.enterRoom(room, 'w');
    await window.__tick14(1500);
    out.locked = room.locked; out.first = room.snakes.filter((s) => s.alive).map((s) => s.kind);
    out.hpScaled = room.snakes.every((s) => s.maxHp >= (KINDS[s.kind].hp || 1) * 1.9);
    out.dark = darkTarget(room, G.levelDef); out.darkStart = dark0;
    out.clock = !!room.mkTb;
    await window.__tick14(2500);
    out.coinsAfter = G.run.coins;
    const gate0 = G.map.mkCh[1];
    for (const s of room.snakes) if (s.alive) s.hurt(99999, s.x, s.y);
    await window.__tick14(2500);
    out.gateFlipped = G.map.mkCh[1] !== gate0;
    out.second = room.snakes.filter((s) => s.alive).map((s) => s.kind);
    out.wave = room.mkWave; out.stillLocked = room.locked;
    out.lightsOn = darkTarget(room, G.levelDef);
    return out;
  });
  await shot('run-wave2');
  res.run2 = await step(async () => {
    const B = window.__bitten, G = B.G, room = G.room;
    const items0 = room.pickups.filter((p) => p.kind === 'item').length;
    for (const s of room.snakes) if (s.alive) s.hurt(99999, s.x, s.y);
    await window.__tick14(2500);
    return { cleared: room.cleared, items: room.pickups.filter((p) => p.kind === 'item').length - items0, evDone: room.mkEv.map((e) => e.done), errors: ERR14.n, log: ERR14.log.slice(-4) };
  });
  const r = res.run, r2 = res.run2;
  check('test settings', r.god && r.coins >= 50 && r.keys >= 3, r);
  check('wave 1 only', r.locked && r.first.length === 2 && r.first.every((k) => k === 'grub'), r.first);
  check('room snake health x2', r.hpScaled);
  check('room darkness', r.dark > 0.7 && r.clock, { dark: r.dark, clock: r.clock });
  check('time event coins', r.coinsAfter >= r.coins + 25, [r.coins, r.coinsAfter]);
  check('kills event flips gates', r.gateFlipped);
  check('wave 2', r.wave === 2 && r.second.join() === 'hood' && r.stillLocked, r);
  check('wave event lights', r.lightsOn < 0.4, r.lightsOn);
  check('clear: rare drop and clock prize', r2.cleared && r2.items >= 2 && r2.evDone.every(Boolean), r2);
  // test settings stay out of normal plays
  res.hub = await step(async () => {
    const B = window.__bitten, MK = B.MK123, G = B.G;
    B.Game.toMenu(); await window.__tick14(300);
    MK.playMap(MK.cleanMapNow(JSON.parse(JSON.stringify(window.__mm2))), 'hub');
    await window.__tick14(600);
    const o = { god: !!G.player.god, keys: G.run.keys || 0 };
    B.Game.toMenu(); await window.__tick14(300);
    return o;
  });
  check('no test settings from the hub', !res.hub.god && !res.hub.keys, res.hub);

  // 4. the generator
  res.gen = await step(async () => {
    const MK = window.__bitten.MK123, out = [];
    for (const set of ['cellar', 'market', 'ruimte', 'draken']) for (const shape of ['branch', 'loop', 'line']) for (const rooms of [6, 12, 20]) {
      const F = { set, rooms: [] };
      for (let seed = 1; seed <= 3; seed++) {
        Object.assign(MK.GEN, { rooms, shape, seed: seed * 7919 + rooms, snakes: 1, extras: { chest: 1, shop: 1, miniboss: 1, vault: 1, challenge: 1, spring: 1, pantry: 1, secret: 1 } });
        const R = MK.genFloor(F, MK.GEN);
        const M = MK.cleanMapNow({ name: 'gen', floors: [{ set, rooms: R }] });
        const errs = MK.validate(M).filter((p) => p.err || /reached|blocked/.test(p.msg)).map((p) => p.msg);
        out.push({ set, shape, rooms, n: M.floors[0].rooms.length, lair: M.floors[0].rooms.some((r) => r.t === 'boss'), errs });
      }
    }
    return out;
  });
  const bad = res.gen.filter((g) => g.errs.length || !g.lair || g.n < Math.min(g.rooms, 6));
  check('generator floors valid', !bad.length, bad.slice(0, 4));
  await step(async () => {
    const MK = window.__bitten.MK123;
    MK.Maker.reopen(); await window.__tick14(200);
    MK.edit(window.__mm2); await window.__tick14(200);
    MK.setPane && 0;
    document.querySelector('#mkTabs [data-p="floor"]').click();
    Object.assign(MK.GEN, { rooms: 12, shape: 'branch', snakes: 1, extras: { chest: 1, shop: 1, miniboss: 1, vault: 1, challenge: 0, spring: 0, pantry: 0, secret: 1 } });
    MK.openGenerator(); await window.__tick14(200);
  });
  await shot('generator');
  res.genPlay = await step(async () => {
    const B = window.__bitten, MK = B.MK123, G = B.G;
    [...document.querySelectorAll('#mkDlg .mk-btn')].find((b) => /Use this floor/.test(b.textContent)).click();
    await window.__tick14(200);
    const M = MK.Maker.M, n = M.floors[0].rooms.length;
    document.querySelector('#mkTabs [data-p="map"]').click();
    await window.__tick14(200);
    const ov = document.querySelectorAll('#mkPaneMap table.mk-ov tbody tr').length;
    const e0 = ERR14.n;
    MK.Maker.play(MK.cleanMapNow(JSON.parse(JSON.stringify(M))), 'editor');
    await window.__tick14(800);
    G.player.god = true;
    for (const room of G.map.rooms) {
      if (room === G.map.start) continue;
      B.Game.enterRoom(room, 'w'); await window.__tick14(900);
      for (const s of room.snakes) if (s.alive && !s.isBoss) s.hurt(99999, s.x, s.y);
      await window.__tick14(1600);
    }
    return { n, ov, errors: ERR14.n - e0, log: ERR14.log.slice(-4) };
  });
  check('generated floor plays', res.genPlay.n >= 12 && res.genPlay.ov === 1 && res.genPlay.errors === 0, res.genPlay);
  await step(async () => { const B = window.__bitten; B.Game.toMenu(); await window.__tick14(400); document.querySelector('#mkTabs [data-p="map"]').click(); await window.__tick14(200); });
  await shot('overview');

  check('page errors', !errs.length, errs.slice(0, 5));
  console.log(JSON.stringify({ ui: res.ui, run: res.run, run2: res.run2, genPlay: res.genPlay, gens: res.gen.length }, null, 1));
  console.log(fails.length ? 'FAIL\n  ' + fails.join('\n  ') : 'PASS: all Map Maker Pro checks');
  await b.close();
  process.exit(fails.length ? 1 : 0);
})();
