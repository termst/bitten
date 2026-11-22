// Preview shots of De Drakenhemel for the PR: a fight, the boss, the climb, the fall, the dragons and the powerup icons.
// Usage: NODE_PATH=$(npm root -g) node test/draken-preview.js  (writes test/out/dkp-*.png)
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const OUT = path.join(ROOT, 'test', 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })).newPage();
  page.on('pageerror', (e) => console.log('ERR', e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  const step = (fn, arg) => page.evaluate(fn, arg);
  const shot = (n) => page.screenshot({ path: path.join(OUT, `dkp-${n}.png`) });
  const tick = (ms) => step((m) => window.__advance(m), ms);
  await tick(300);
  // floor 1 boss beaten, the ladder
  await step(async () => {
    const B = window.__bitten, G = B.G;
    B.DRAAK14.force = true; B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__advance(500);
    G.player.god = true;
    B.Game.enterRoom(G.map.boss, 's');
    await window.__advance(1200);
    for (const s of G.room.snakes) s.alive = false;
    B.Game.clearRoom(G.room);
    await window.__advance(4500);
    const ex = G.room.exit; G.player.x = ex.x + 60; G.player.y = ex.y + 50;
  });
  await shot('ladder');
  await step(() => { const G = window.__bitten.G, ex = G.room.exit; G.player.x = ex.x; G.player.y = ex.y + 4; });
  for (let i = 0; i < 26; i++) await tick(100);
  await shot('climb');
  for (let i = 0; i < 30; i++) await tick(100);
  // a fight with the four dragons and a hatchling
  await step(async () => {
    const B = window.__bitten, G = B.G;
    const room = G.map.rooms.find((r) => r.type === 'fight');
    room.mod = null;
    room.build(['...........', '.#.......#.', '...........', '..)..#..{..', '...........', '..}.....|..', '.....:.....', '.#.......#.', '...........'], G.levelDef, {});
    B.Game.enterRoom(room, 's');
    await window.__advance(2600);
    G.player.x = 220; G.player.y = 300;
  });
  for (let i = 0; i < 12; i++) await tick(100);
  await shot('fight');
  // the boss, stage 2 and the eclipse
  await step(async () => {
    const B = window.__bitten, G = B.G;
    B.Game.enterRoom(G.map.boss, 's');
    await window.__advance(3200);
    G.boss.hp = G.boss.maxHp * 0.6;
    await window.__advance(2600);
  });
  await shot('boss');
  await step(async () => {
    const G = window.__bitten.G, boss = G.boss;
    boss.hp = boss.maxHp * 0.3;
    await window.__advance(2200);
    boss.beamCd = 0; boss.mode = 'move';
    for (let i = 0; i < 30; i++) { await window.__advance(100); const F = G.room.dk14; if (F && F.beam && F.beam.t > F.beam.warn + 0.4) break; }
  });
  await shot('eclipse');
  // beaten: the hole in the sky, then the fall
  await step(async () => {
    const B = window.__bitten, G = B.G;
    for (const s of G.room.snakes) s.alive = false;
    G.boss = null; G.venom.length = 0;
    B.Game.clearRoom(G.room);
    await window.__advance(3000);
    G.player.x = G.room.exit.x + 50; G.player.y = G.room.exit.y + 40;
  });
  await shot('hole');
  await step(() => { const G = window.__bitten.G, ex = G.room.exit; G.player.x = ex.x; G.player.y = ex.y + 4; });
  for (let i = 0; i < 28; i++) await tick(100);
  await shot('fall');
  // the dragons, big, and every powerup icon
  await step(() => {
    const B = window.__bitten, D = B.DRAAK14;
    const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 800; cv.id = 'dkSheet';
    cv.style.cssText = 'position:fixed;left:0;top:0;width:1280px;height:800px;z-index:99999;background:#cfe6ff';
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 800); g.addColorStop(0, '#8ec5f8'); g.addColorStop(1, '#eaf4ff');
    c.fillStyle = g; c.fillRect(0, 0, 1280, 800);
    c.font = '900 30px "Barlow Condensed", "Arial Narrow", sans-serif'; c.fillStyle = '#3a1a08'; c.textAlign = 'left';
    c.fillText('21 DRAGON POWERUPS', 40, 450);
    const ids = D.ITEM_IDS;
    ids.forEach((id, k) => {
      const x = 40 + (k % 11) * 112, y = 480 + Math.floor(k / 11) * 150;
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.roundRect(x, y, 100, 132, 12); c.fill();
      c.save(); c.translate(x + 50, y + 50); window.drawItemIcon ? window.drawItemIcon(c, id, 72, 1.2) : B.render && 0; c.restore();
      c.fillStyle = '#3a1a08'; c.font = '800 13px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center';
      const nm = B.ITEMS[id].name.split(' ');
      nm.forEach((w, i) => c.fillText(w, x + 50, y + 104 + i * 14));
      c.textAlign = 'left';
    });
  });
  await shot('sheet');
  console.log('ok');
  await b.close();
})();
