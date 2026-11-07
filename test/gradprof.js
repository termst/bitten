// P2 profiling: counts createRadialGradient / createLinearGradient calls per source line during render()
// in a fight room with 6 snakes. Usage: node test/gradprof.js [file]
const { launch, open, ROOT } = require('./lib');
const path = require('path');
(async () => {
  const b = await launch();
  const { page } = await open(b, 'file://' + path.resolve(ROOT, process.argv[2] || 'index.html'));
  const res = await page.evaluate(() => {
    const B = window.__bitten, { G, Game, Save, KINDS, Snake } = B;
    Save.data.char = 'apple'; Game.toMenu(); Game.startRun(false, 'arcade'); G.trans = null; G.fade = 0;
    const room = G.room; Object.keys(KINDS).filter((k) => !KINDS[k].boss).slice(0, 6).forEach((k, i) => { const sn = new Snake(k, 80 + i * 60, 90 + (i % 2) * 120); sn.state = 'active'; room.snakes.push(sn); });
    for (let i = 0; i < 10; i++) { B.G.t += 1 / 60; B.render(1 / 60); }
    const P = CanvasRenderingContext2D.prototype, cnt = {};
    for (const k of ['createRadialGradient', 'createLinearGradient']) {
      const f = P[k];
      P[k] = function () { const st = new Error().stack.split('\n')[2] || ''; const m = st.match(/bitten\.js:(\d+)/); const key = k.slice(6, 12) + ' ' + (m ? m[1] : st.trim().slice(0, 60)); cnt[key] = (cnt[key] || 0) + 1; return f.apply(this, arguments); };
    }
    for (let i = 0; i < 60; i++) { G.t += 1 / 60; B.render(1 / 60); }
    return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => [k, +(v / 60).toFixed(1)]);
  });
  let tot = 0; for (const [, v] of res) tot += v;
  console.log('per frame, top 30 (total of these: ' + tot.toFixed(0) + ')');
  for (const [k, v] of res) console.log(String(v).padStart(6), k);
  await b.close();
})();
