// Screenshot of a fight room (6 snakes, a few pickups), for eyeballing render changes.
// Usage: node test/shot.js out.png [file] [char] [w] [h]
const { launch, open, ROOT } = require('./lib');
const path = require('path');
(async () => {
  const [out, file = 'index.html', ch = 'apple', w = 1280, h = 800] = process.argv.slice(2);
  const b = await launch();
  const { page, log } = await open(b, 'file://' + path.resolve(ROOT, file), { ctx: { viewport: { width: +w, height: +h } } });
  await page.evaluate((ch) => {
    const B = window.__bitten, { G, Game, Save, KINDS, Snake } = B;
    Save.data.unlocks[ch] = true; Save.data.char = ch; Game.toMenu(); Game.startRun(false, 'arcade'); G.trans = null; G.fade = 0;
    const room = G.room; Object.keys(KINDS).filter((k) => !KINDS[k].boss).slice(0, 6).forEach((k, i) => { const sn = new Snake(k, 80 + i * 60, 90 + (i % 2) * 120); sn.state = 'active'; room.snakes.push(sn); });
    room.pickups.push({ kind: 'item', id: B.ITEM_IDS[3], x: 300, y: 260, t: 0 });
    G.darkA = 0.75;
  }, ch);
  await page.waitForTimeout(600);
  await page.screenshot({ path: out });
  if (log.errors.length) console.log(log.errors.join('\n'));
  await b.close();
})();
