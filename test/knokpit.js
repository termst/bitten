// Smoke test for De Knokpit (src/86-v14-knokpit.js). Forces the room on floor 2, plays the fight with god mode,
// breaks loot boxes, picks up power pads and drops, wins, breaks the Mega Box. Fails on any page error.
// Screenshots go to test/out/knokpit-*.png. Usage: NODE_PATH=$(npm root -g) node test/knokpit.js
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
    window.__tick14 = async (ms) => {
      for (let t = 0; t < ms; t += 100) {
        await window.__advance(Math.min(100, ms - t));
        if (B.G.state === 'contract' && B.CT24) B.CT24.decline();
      }
    };
    return window.__advance(300);
  });
  const shot = async (name) => page.screenshot({ path: path.join(OUT, `knokpit-${name}.png`) });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const res = {};
  res.start = await step(async () => {
    const B = window.__bitten, G = B.G;
    B.KNOK14.KNOK.force = true;
    B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__tick14(500);
    B.Game.loadLevel(1);
    await window.__tick14(1500);
    const r = G.map.rooms.find((q) => q.type === 'brawl');
    return { found: !!r, boxes: r ? r.obs.filter((o) => o.type === 'lootbox14').length : 0, bushes: r ? r.bushes10.length : 0 };
  });
  res.fight = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player;
    P.god = true;
    const room = G.map.rooms.find((q) => q.type === 'brawl');
    B.Game.enterRoom(room, Object.keys(room.doors)[0]);
    await window.__tick14(2500);
    const kinds = room.snakes.map((s) => s.kind), pads = room.pickups.filter((p) => p.kind === 'bpow14').length;
    let supers = 0, shots = 0;
    for (let i = 0; i < 60; i++) {
      await window.__tick14(200);
      for (const s of room.snakes) if (s.mode === 'jump' || s.big14) supers++;
      shots = Math.max(shots, G.venom.filter((v) => v.kind === 'pellet14' || v.kind === 'bullet14').length);
    }
    return { kinds, pads, supers, shots, locked: room.locked, state: G.state };
  });
  await shot('fight');
  res.loot = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player, room = G.room;
    for (const o of room.obs.filter((q) => q.type === 'lootbox14')) B.KNOK14.brk(room, o);
    for (const p of room.pickups.filter((q) => q.kind === 'bpow14')) { P.x = p.x; P.y = p.y; await window.__tick14(200); }
    const buffs = JSON.stringify(P.bpw14 || null), shield = !!P.bshield14;
    for (const s of room.snakes) if (s.alive) s.hurt(9999, s.x, s.y);
    await window.__tick14(1500);
    const drops = room.pickups.filter((q) => q.kind === 'kdrop14').length;
    for (const p of room.pickups.filter((q) => q.kind === 'kdrop14')) { P.x = p.x; P.y = p.y; await window.__tick14(300); }
    await window.__tick14(1500);
    const mega = room.obs.find((q) => q.type === 'megabox14');
    return { buffs, shield, drops, dropsLeft: room.pickups.filter((q) => q.kind === 'kdrop14').length, cleared: room.cleared, mega: !!mega, boxesLeft: room.obs.filter((q) => q.type === 'lootbox14').length };
  });
  await shot('won');
  res.mega = await step(async () => {
    const B = window.__bitten, G = B.G, room = G.room;
    const mega = room.obs.find((q) => q.type === 'megabox14');
    if (mega) for (let i = 0; i < 6; i++) { mega.hp -= 1; if (mega.hp <= 0) B.KNOK14.brk(room, mega); }
    await window.__tick14(800);
    return { items: room.pickups.filter((q) => q.kind === 'item').length, megaLeft: room.obs.some((q) => q.type === 'megabox14'), state: G.state, errs: B.KNOK14.err().n, log: B.KNOK14.err().log.slice(0, 5) };
  });
  await shot('mega');
  console.log(JSON.stringify(res, null, 1));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length ? 1 : 0);
})();
