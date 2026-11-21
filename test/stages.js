// Boss stages (src/85-v14-stages.js): every boss with stages, spawned in a fight room with god mode on.
// Heavy fire (half the boss per frame) must still take every stage in order, with a shield between, and no errors.
// Usage: NODE_PATH=$(npm root -g) node test/stages.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  const res = await page.evaluate(async () => {
    const B = window.__bitten, G = B.G, out = {};
    const tick = async (ms) => { for (let t = 0; t < ms; t += 100) { await window.__advance(100); if (G.state === 'contract' && B.CT24) B.CT24.decline(); } };
    await window.__advance(300);
    B.Save.data.char = 'apple'; B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await tick(800);
    G.player.god = true;
    for (const kind of Object.keys(B.STAGE14.DEF)) {
      const room = G.map.rooms.find((r) => r.type === 'fight');
      room.cleared = false; room.mod = null; B.Game.enterRoom(room, 's');
      await tick(300);
      for (const s of room.snakes) s.alive = false;
      room.snakes.length = 0; room.locked = true;
      const sn = new B.Snake(kind, 400, 260, { emerge: false, spawnTime: 0.2 });
      sn.maxHp = sn.hp = sn.K.hp * 2; room.snakes.push(sn); G.boss = sn;
      const D = B.STAGE14.DEF[kind], seen = [], e0 = G.errors || 0;
      let t = 0, moved = 0; const x0 = sn.x, y0 = sn.y;
      await tick(2000);
      moved = Math.round(Math.hypot(sn.x - x0, sn.y - y0));
      while (sn.alive && sn.dying <= 0 && t < 30000) {
        if (sn.canBeHit()) sn.hurt(sn.maxHp * 0.5, sn.x, sn.y);
        if (seen[seen.length - 1] !== sn.stage14) seen.push(sn.stage14);
        await tick(100); t += 100;
      }
      out[kind] = { stages: seen.join(''), want: D.at.length + 1, killMs: t, moved2s: moved, errors: (G.errors || 0) - e0, log: (G.errorLog || []).slice(-1) };
      sn.alive = false; room.snakes.length = 0; G.boss = null;
      for (let i = G.venom.length - 1; i >= 0; i--) G.venom.splice(i, 1);
    }
    return out;
  });
  let ok = !errs.length;
  for (const k in res) { const r = res[k]; const good = r.stages === Array.from({ length: r.want }, (_, i) => i + 1).join('') && !r.errors; if (!good) ok = false; console.log(k.padEnd(10), JSON.stringify(r), good ? '' : '<-- FAIL'); }
  console.log(errs.slice(0, 5), ok ? 'STAGES OK' : 'STAGES FAILED');
  await b.close(); process.exit(ok ? 0 : 1);
})();
