// Smoke test for De Ruimte (src/82-v14-ruimte.js). Forces the space floor, then plays a fight room, a supernova room,
// the boss in all three phases and all eight space powerups with god mode on. Fails on any page error or error counter.
// Screenshots go to test/out/ruimte-*.png. Usage: NODE_PATH=$(npm root -g) node test/ruimte.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const OUT = path.join(ROOT, 'test', 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(() => {
    const B = window.__bitten;
    if (B.admin23) B.admin23.A.t.aim = true;
    window.__tick14 = async (ms) => {
      for (let t = 0; t < ms; t += 100) {
        await window.__advance(Math.min(100, ms - t));
        if (B.G.state === 'contract' && B.CT24) B.CT24.decline();
      }
    };
    return window.__advance(300);
  });
  const shot = async (name) => page.screenshot({ path: path.join(OUT, `ruimte-${name}.png`) });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const res = {};

  // 1. a forced arcade run: floor 2 is De Ruimte
  res.start = await step(async () => {
    const B = window.__bitten, G = B.G;
    B.SPACE14.force = true;
    B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__tick14(500);
    B.Game.loadLevel(1);
    await window.__tick14(1500);
    const types = {};
    for (const r of G.map.rooms) types[r.type] = (types[r.type] || 0) + 1;
    return { set: G.levelDef.set, name: G.levelDef.name, boss: G.levelDef.boss, plan: G.run.floors10, rooms: G.map.rooms.length, types };
  });
  await shot('start');

  // 2. a fight room with every planet worm
  res.fight = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player;
    P.god = true;
    const room = G.map.rooms.find((r) => r.type === 'fight');
    room.mod = null;
    room.build(B.SPACE14.FIGHTS[0], G.levelDef, {});
    B.Game.enterRoom(room, 's');
    await window.__tick14(2500);
    const kinds = room.snakes.map((s) => s.kind);
    await window.__tick14(6000);
    return { kinds, alive: room.snakes.filter((s) => s.alive).length, rings: room.fx14 ? room.fx14.rings.length : 0, state: G.state };
  });
  await shot('fight');

  // 3. a supernova room: the star grows and blows
  res.nova = await step(async () => {
    const B = window.__bitten, G = B.G;
    const room = G.map.rooms.filter((r) => r.type === 'fight')[1];
    room.cleared = false; room.mod = 'supernova';
    room.build(B.SPACE14.FIGHTS[2], G.levelDef, {});
    B.Game.enterRoom(room, 'n');
    let seen = 0, shocks = 0;
    for (let i = 0; i < 40; i++) {
      await window.__tick14(400);
      const F = room.fx14;
      if (F && F.nova) seen = Math.max(seen, F.nova.t);
      if (F && F.shocks.length) shocks++;
    }
    return { starSeen: seen > 0, shocksFrames: shocks, mod: room.mod, state: G.state };
  });
  await shot('nova');

  // 4. every space powerup, in a fresh fight
  res.items = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player;
    for (const id of Object.keys(B.SPACE14.NEW)) if (!P.items.includes(id)) B.collectItem(id);
    const room = G.map.rooms.filter((r) => r.type === 'fight')[2];
    room.cleared = false; room.mod = null;
    room.build(B.SPACE14.FIGHTS[4], G.levelDef, {});
    B.Game.enterRoom(room, 'w');
    const seen = { rings: 0, meteors: 0, holes: 0 };
    const n0 = room.snakes.length;
    for (let i = 0; i < 300; i++) {
      await window.__tick14(50);
      const F = room.fx14 || {};
      seen.rings = Math.max(seen.rings, (F.rings || []).filter((g) => g.friendly).length);
      seen.meteors = Math.max(seen.meteors, (F.meteors || []).filter((m) => !m.hostile).length);
      seen.holes = Math.max(seen.holes, (F.holes || []).filter((h) => !h.hostile).length);
    }
    // the supernova powerup: a real bite that leaves 2 apples
    P.god = false; P.hp = 6; P.inv = 0; P.dashT = 0;
    const bit = P.hurt(2, P.x + 10, P.y);
    const nova = { bit, hp: P.hp, used: P.novaUsed14, shocks: (room.fx14.shocks || []).length };
    P.god = true; P.hp = P.maxHp;
    return { items: P.items.filter((id) => B.SPACE14.NEW[id]), moon: P.moon14, spawned: n0, alive: room.snakes.filter((s) => s.alive).length, seen, nova, state: G.state };
  });
  await shot('items');

  // 5. the boss, all three phases
  res.boss = await step(async () => {
    const B = window.__bitten, G = B.G;
    const room = G.map.boss;
    B.Game.enterRoom(room, 's');
    await window.__tick14(4000);
    const boss = G.boss;
    const out = { kind: boss && boss.kind, state: G.state, phases: [] };
    if (!boss) return out;
    for (const f of [0.9, 0.5, 0.2]) {
      boss.hp = boss.maxHp * f;
      await window.__tick14(9000);
      const F = room.fx14 || {};
      out.phases.push({ f, ph: boss.ph14, mode: boss.mode, venom: G.venom.length, holes: (F.holes || []).length, meteors: (F.meteors || []).length, shocks: (F.shocks || []).length, kids: room.snakes.filter((s) => s !== boss && s.alive).length });
    }
    return out;
  });
  await shot('boss');
  res.bossNova = await step(async () => {
    const B = window.__bitten, G = B.G, boss = G.boss;
    if (!boss) return null;
    boss.novaCd = 0; boss.mode = 'move';
    for (let i = 0; i < 30; i++) { await window.__tick14(100); if (boss.mode === 'nova' && boss.charge14 > 0.7) break; }
    return { mode: boss.mode, charge: boss.charge14 };
  });
  await shot('boss-nova');

  // 6. the guide pictures and the icons
  res.guide = await step(() => {
    const B = window.__bitten;
    const cv = document.createElement('canvas'); cv.width = 8 * 72; cv.height = 72; cv.id = 'icons14';
    cv.style.cssText = 'position:fixed;left:10px;top:10px;z-index:99999;background:#222';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    Object.keys(B.SPACE14.NEW).forEach((id, i) => { c.save(); c.translate(36 + i * 72, 36); drawItemIcon(c, id, 56, 1); c.restore(); });
    const box = document.createElement('div'); box.id = 'snakes14';
    box.style.cssText = 'position:fixed;left:10px;top:100px;z-index:99999;display:grid;grid-template-columns:repeat(3,200px);gap:6px;background:#111';
    box.innerHTML = ['aarde', 'mars', 'neptunus', 'pluto', 'saturnus', 'galaxy'].map((k) => `<canvas data-snake="${k}" style="width:200px;height:110px"></canvas>`).join('');
    document.body.appendChild(box);
    paintBestiary(box);
    return { figures: document.querySelectorAll('#tab-snakes canvas[data-snake="galaxy"]').length };
  });
  await page.locator('#icons14').screenshot({ path: path.join(OUT, 'ruimte-icons.png') });
  await page.locator('#snakes14').screenshot({ path: path.join(OUT, 'ruimte-snakes.png') });

  res.errors = await step(() => ({ n: window.__bitten.G.errors || 0, log: (window.__bitten.G.errorLog || []).slice(-5) }));
  res.page = errs.slice(0, 8);
  console.log(JSON.stringify(res, null, 1));
  const ok = res.start.set === 'ruimte' && !res.page.length && !res.errors.n;
  console.log(ok ? 'RUIMTE OK' : 'RUIMTE FAILED');
  await b.close();
  process.exit(ok ? 0 : 1);
})();
