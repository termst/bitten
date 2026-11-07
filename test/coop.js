// Smoke test: a 3 apple couch run (dummy sources) runs 20 s of game time without page errors.
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch(); const page = await (await b.newContext()).newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(() => window.__advance(300));
  const r = await page.evaluate(async () => {
    const B = window.__bitten, C = B.coop14, mk = (a) => ({ moveVec: () => ({ x: Math.cos(a), y: Math.sin(a) }), aimVec: () => ({ x: 1, y: 0 }), dash: () => false, interact: () => false });
    C.pending = [{ src: mk(0), char: 'apple', look: 0, name: 'A' }, { src: mk(2), char: 'apple', look: 3, name: 'B' }, { src: mk(4), char: 'apple', look: 0, name: 'C' }];
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__advance(20000);
    return { state: B.G.state, n: B.G.players.length, mp: true, errors: B.G.errors, log: B.G.errorLog.slice(-3) };
  });
  console.log(JSON.stringify(r), errs.slice(0, 3));
  await b.close();
})();
