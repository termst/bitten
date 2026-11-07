// Frame timing: median render() ms in the start room and in a fight room with 6 snakes, original look vs
// the 6 Arcade looks (or, after S4, the 6 filters). Usage: node test/perf.js [file] [chars]
const { launch, open, startRun, ROOT } = require('./lib');
const path = require('path');
(async () => {
  const file = process.argv[2] || 'index.html', chars = (process.argv[3] || 'apple,mika,lucif,pean').split(',');
  const b = await launch();
  const { page } = await open(b, 'file://' + path.resolve(ROOT, file));
  const rows = [];
  for (const ch of chars) {
    for (const scene of ['start', 'fight']) {
      const res = await page.evaluate(async ([ch, scene]) => {
        const B = window.__bitten, { G, Game, Save, KINDS, Snake } = B, K = B.SKINS24;
        const L = K.SKINS[ch], first = L.findIndex((S) => S.tier === 'Arcade');
        const looks = [0].concat(first >= 0 ? [1, 2, 3, 4, 5, 6].map((i) => first + i) : []);
        const out = {};
        for (const n of looks) {
          Save.data.unlocks[ch] = true; Save.data.char = ch; K.setSkin(ch, n);
          if (B.FILTERS14 && n) { K.setSkin(ch, 0); B.FILTERS14.set(ch, B.FILTERS14.list[n]); } else if (B.FILTERS14) B.FILTERS14.set(ch, null);
          Game.toMenu(); Game.startRun(false, 'arcade');
          G.trans = null; G.fade = 0;
          if (scene === 'fight') {
            const kinds = Object.keys(KINDS).filter((k) => !KINDS[k].boss).slice(0, 6), room = G.room;
            kinds.forEach((k, i) => { const sn = new Snake(k, 80 + i * 60, 90 + (i % 2) * 120); sn.state = 'active'; room.snakes.push(sn); });
          }
          for (let i = 0; i < 20; i++) B.render(1 / 60);
          const ts = [];
          for (let i = 0; i < 90; i++) { G.t += 1 / 60; G.player.lookX = Math.cos(i * 0.2); G.player.lookY = Math.sin(i * 0.2); const t0 = performance.now(); B.render(1 / 60); ts.push(performance.now() - t0); }
          ts.sort((a, b) => a - b);
          out[n ? (L[n - 1] ? L[n - 1].name : 'f' + n) : 'Original'] = +ts[45].toFixed(2);
        }
        return out;
      }, [ch, scene]);
      rows.push([ch, scene, res]);
      const o = res.Original, arc = Object.entries(res).filter(([k]) => k !== 'Original').map(([, v]) => v);
      const avg = arc.reduce((s, v) => s + v, 0) / (arc.length || 1);
      console.log(`${ch.padEnd(6)} ${scene.padEnd(5)} original ${o.toFixed(2)} ms, arcade avg ${avg.toFixed(2)} ms (x${(avg / o).toFixed(2)})  ${JSON.stringify(res)}`);
    }
  }
  await b.close();
})();
