// Smoke test for De Drakenhemel (src/88, 89, 90). Forces the dragon floor on floor 2 of an Arcade run, climbs the ladder
// from floor 1, plays a fight with every dragon, a storm room, all dragon powerups, the boss in its three stages and the fall
// to floor 3. Fails on any page error or error counter. Screenshots go to test/out/draken-*.png.
// Usage: NODE_PATH=$(npm root -g) node test/draken.js [only]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const OUT = path.join(ROOT, 'test', 'out');
const only = process.argv[2] || '';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /draken|draak|reis/i.test(m.text()))) errs.push(m.type() + ': ' + m.text()); });
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
  const shot = async (name) => page.screenshot({ path: path.join(OUT, `draken-${name}.png`) });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const res = {};

  // 1. an arcade run with the dragon floor on floor 2: beat the floor 1 boss, the exit is a ladder, climb it
  res.start = await step(async () => {
    const B = window.__bitten, G = B.G;
    B.DRAAK14.force = true;
    B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__tick14(500);
    G.player.god = true;
    const room = G.map.boss;
    B.Game.enterRoom(room, 's');
    await window.__tick14(1500);
    for (let k = 0; k < 6; k++) { for (const s of room.snakes) if (s.alive && s.dying <= 0) { s.stage14 = 9; s.stagePend14 = false; s.stageT14 = 0; s.hp = 0.01; s.hurt(5, s.x, s.y); } await window.__tick14(300); }
    await window.__tick14(1000);
    if (!G.room.cleared) B.Game.clearRoom(G.room);
    await window.__tick14(3000);
    return { plan: G.run.floors10, exit: G.room.exit, same: G.room === room, state: G.state };
  });
  await shot('ladder');
  res.climb = await step(() => {
    const G = window.__bitten.G, P = G.player, ex = G.room.exit;
    if (!ex) return { noExit: true };
    P.x = ex.x; P.y = ex.y + 4;
    return { ok: true };
  });
  {
    const seen = [];
    for (let i = 0; i < 60; i++) {
      const k = await step(async () => { await window.__tick14(100); const tr = window.__bitten.G.trans; return tr ? tr.kind + ':' + tr.phase : ''; });
      if (k) seen.push(k);
      if ([8, 14, 22, 30, 38, 44].includes(i)) await shot('climb-' + i);
    }
    res.climb.seen = [...new Set(seen)];
    res.climb.after = await step(() => { const G = window.__bitten.G; return { set: G.levelDef.set, room: G.room.type, trans: !!G.trans }; });
  }
  await shot('arrive');
  if (only === 'climb') { console.log(JSON.stringify(res, null, 1)); await b.close(); process.exit(errs.length ? 1 : 0); }

  // 2. a fight with every dragon
  res.fight = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player;
    P.god = true;
    const room = G.map.rooms.find((r) => r.type === 'fight');
    room.mod = null;
    room.build(B.DRAAK14.FIGHTS[0], G.levelDef, {});
    B.Game.enterRoom(room, 's');
    await window.__tick14(3000);
    const kinds = room.snakes.map((s) => s.kind);
    const seen = { lobs: 0, patches: 0, pearls: 0, fly: 0, hot: 0 };
    for (let i = 0; i < 60; i++) {
      await window.__tick14(100);
      const F = room.dk14 || {};
      if ((F.lobs || []).length) seen.lobs++;
      if ((F.patches || []).length) seen.patches++;
      if ((F.pearls || []).length) seen.pearls++;
      if ((F.hot || []).length) seen.hot++;
      if (room.snakes.some((s) => s.fly14 > 0.5)) seen.fly++;
    }
    return { kinds, seen, alive: room.snakes.filter((s) => s.alive).length, state: G.state };
  });
  await shot('fight');

  // 3. a storm room
  res.storm = await step(async () => {
    const B = window.__bitten, G = B.G;
    const room = G.map.rooms.filter((r) => r.type === 'fight')[1];
    room.cleared = false; room.mod = 'storm14';
    room.build(B.DRAAK14.FIGHTS[3], G.levelDef, {});
    B.Game.enterRoom(room, 'n');
    let gusts = 0;
    for (let i = 0; i < 50; i++) { await window.__tick14(200); if (room.dk14 && room.dk14.gust) gusts++; if (gusts === 3) await window.__tick14(1); }
    return { gusts, state: G.state };
  });
  await shot('storm');

  // 4. every dragon powerup
  res.items = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player, D = B.DRAAK14;
    const ids = D.ITEMS ? Object.keys(D.ITEMS) : [];
    for (const id of ids) if (!P.items.includes(id)) B.collectItem(id);
    const room = G.map.rooms.filter((r) => r.type === 'fight')[2];
    room.cleared = false; room.mod = null;
    room.build(D.FIGHTS[4], G.levelDef, {});
    B.Game.enterRoom(room, 'w');
    for (let i = 0; i < 40; i++) await window.__tick14(200);
    P.god = false; P.hp = 6; P.inv = 0; P.dashT = 0;
    P.hurt(1, P.x + 10, P.y);
    P.god = true; P.hp = P.maxHp;
    return { n: ids.length, have: P.items.filter((id) => ids.includes(id)).length, alive: room.snakes.filter((s) => s.alive).length, state: G.state };
  });
  await shot('items');

  // 5. the boss, all three stages
  res.boss = await step(async () => {
    const B = window.__bitten, G = B.G;
    const room = G.map.boss;
    B.Game.enterRoom(room, 's');
    await window.__tick14(4000);
    const boss = G.boss;
    const out = { kind: boss && boss.kind, state: G.state, st: [] };
    if (!boss) return out;
    for (const f of [0.9, 0.6, 0.3]) {
      boss.hp = boss.maxHp * f;
      const seen = { fly: 0, beam: 0, lobs: 0, breath: 0 };
      for (let i = 0; i < 50; i++) {
        await window.__tick14(200);
        const F = room.dk14 || {};
        if (boss.fly14 > 0.5) seen.fly++;
        if (F.beam) seen.beam++;
        if ((F.lobs || []).length) seen.lobs++;
        if (boss.mode === 'breath') seen.breath++;
      }
      out.st.push({ f, st: boss.stage14, seen, eclipse: room.dk14 && room.dk14.eclipse, kids: room.snakes.filter((s) => s !== boss && s.alive).length });
    }
    return out;
  });
  await shot('boss');
  res.beam = await step(async () => {
    const B = window.__bitten, G = B.G, boss = G.boss;
    if (!boss) return null;
    boss.beamCd = 0; boss.mode = 'move';
    for (let i = 0; i < 30; i++) { await window.__tick14(100); const F = G.room.dk14; if (F && F.beam && F.beam.t > F.beam.warn + 0.3) break; }
    return { mode: boss.mode, beam: !!(G.room.dk14 && G.room.dk14.beam) };
  });
  await shot('boss-beam');

  // 6. kill the boss: a hole, and the fall to floor 3
  res.fall = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player, room = G.room, boss = G.boss;
    if (boss) { boss.stage14 = 3; boss.hp = 0.01; boss.hurt(5, boss.x, boss.y); }
    for (const s of room.snakes) if (s.alive) { s.hp = 0.01; s.hurt(5, s.x, s.y); }
    await window.__tick14(2500);
    if (!room.cleared) B.Game.clearRoom(room);
    await window.__tick14(2500);
    const ex = room.exit;
    if (!ex) return { noExit: true, state: G.state };
    P.x = ex.x; P.y = ex.y + 4;
    return { exit: ex.kind, sky: !!ex.sky14 };
  });
  {
    const seen = [];
    for (let i = 0; i < 60; i++) {
      const k = await step(async () => { await window.__tick14(100); const tr = window.__bitten.G.trans; return tr ? tr.kind + ':' + tr.phase : ''; });
      if (k) seen.push(k);
      if ([6, 12, 18, 24, 30, 36].includes(i)) await shot('fall-' + i);
    }
    res.fall.seen = [...new Set(seen)];
    res.fall.after = await step(() => { const G = window.__bitten.G; return { set: G.levelDef.set, idx: G.levelIdx, trans: !!G.trans }; });
  }
  await shot('landed');

  res.errors = await step(() => (window.__bitten.errHost14 ? window.__bitten.errHost14.count || 0 : 0));
  console.log(JSON.stringify(res, null, 1));
  if (errs.length) { console.log('ERRORS', errs.slice(0, 12)); }
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
