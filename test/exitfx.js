// Frames of the v14.4 exit animations (hole and light) in a 2 apple couch run, plus a check that no errors fire.
// Usage: node test/exitfx.js [outdir]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path'), fs = require('fs');
(async () => {
  const out = process.argv[2] || path.join(ROOT, 'test/out/exitfx'); fs.mkdirSync(out, { recursive: true });
  const b = await launch(); const page = await (await b.newContext({ viewport: { width: 960, height: 600 } })).newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(() => window.__advance(300));
  const still = () => ({ moveVec: () => ({ x: 0, y: 0 }), aimVec: () => ({ x: 1, y: 0 }), dash: () => false, interact: () => false });
  await page.evaluate(async (s) => {
    const B = window.__bitten, C = B.coop14, mk = eval(s);
    C.pending = [{ src: mk(), char: 'apple', look: 0, name: 'A' }, { src: mk(), char: 'apple', look: 3, name: 'B' }];
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__advance(1500);
    const { G } = B; G.players[0].x = 120; G.players[0].y = 300; G.players[1].x = 520; G.players[1].y = 120;
    G.room.exit = { x: 320, y: 220, t: 2, kind: 'hole' };
    B.Game.descend();
  }, '(' + still.toString() + ')');
  const shots = [];
  let ms = 0;
  for (const at of [100, 350, 550, 750, 1000, 1250, 1450, 1650, 1900, 2300]) { await page.evaluate((d) => window.__advance(d), at - ms); ms = at; const f = path.join(out, `hole-${at}.png`); await page.screenshot({ path: f }); shots.push(f); }
  const lv = await page.evaluate(() => window.__bitten.G.levelIdx);
  await page.evaluate(async () => {
    const B = window.__bitten, { G } = B; await window.__advance(1000);
    G.room.exit = { x: 320, y: 220, t: 2, kind: 'light' }; G.players[0].x = 300; G.players[0].y = 220; G.players[1].x = 340; G.players[1].y = 224;
    for (const Q of G.players) B.withPlayer ? B.withPlayer(Q, () => B.Game.escape()) : (G.player = Q, B.Game.escape());
  });
  ms = 0;
  for (const at of [200, 600, 1000, 1400, 1800]) { await page.evaluate((d) => window.__advance(d), at - ms); ms = at; const f = path.join(out, `light-${at}.png`); await page.screenshot({ path: f }); shots.push(f); }
  const st = await page.evaluate(() => ({ errors: window.__bitten.G.errors, log: window.__bitten.G.errorLog.slice(-3), state: window.__bitten.G.state }));
  console.log(JSON.stringify({ level: lv, ...st }), errs.slice(0, 3));
  await b.close();
})();
