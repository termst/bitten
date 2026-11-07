// T3/T4 check: run at 60 Hz and at 120 Hz with the in-page fake clock. Text typing (Choice dialog, caption)
// and gameplay speed (walk for 1 s, game clock) must match. Usage: node test/hz.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch();
  const out = {};
  for (const hz of [60, 120]) {
    const page = await (await b.newContext()).newPage();
    await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
    await page.addInitScript(fakeClockInit);
    await page.goto('file://' + path.resolve(ROOT, 'index.html'));
    await page.evaluate((hz) => window.__advance(300, hz), hz);
    out[hz] = await page.evaluate(async (hz) => {
      const B = window.__bitten, { G, Game, Save, Input } = B;
      Save.data.char = 'apple'; Game.toMenu(); Game.startRun(false, 'arcade');
      await window.__advance(1500, hz);                       // the fade in
      const x0 = G.player.x, t0 = G.t;
      Input.keys.add('KeyD'); await window.__advance(500, hz); Input.keys.delete('KeyD');
      const walk = +(G.player.x - x0).toFixed(1), gt = +(G.t - t0).toFixed(3);
      const text = 'x'.repeat(400);
      B.pop14.popShow({ look: 'choice', kick: 'A choice', title: 'Test', text });
      await window.__advance(1000, hz);
      const popTyped = Math.floor(B.pop14.Pop.typed);
      B.pop14.Pop.on = false; if (B.pop14.Pop.el) B.pop14.Pop.el.hidden = true;
      B.pop14.capShow(text);
      await window.__advance(1000, hz);
      return { walk, gameClock: gt, popCharsPerSec: popTyped, capCharsPerSec: Math.floor(B.pop14.Cap.typed) };
    }, hz);
  }
  await b.close();
  console.log(JSON.stringify(out));
  const a = out[60], c = out[120];
  const near = (x, y, tol) => Math.abs(x - y) <= tol;
  console.log(near(a.walk, c.walk, 2) && near(a.gameClock, c.gameClock, 0.02) && near(a.popCharsPerSec, c.popCharsPerSec, 3) && near(a.capCharsPerSec, c.capCharsPerSec, 3) ? 'PASS 60 Hz equals 120 Hz' : 'FAIL');
})();
