// Contact sheet: every character in every look (and, after S4, every filter). Writes test/out/contact-<tag>.png.
// Usage: node test/contact.js [tag] [file]   (file defaults to index.html)
const { launch, open, ROOT } = require('./lib');
const path = require('path');
const fs = require('fs');
(async () => {
  const tag = process.argv[2] || 'now', file = process.argv[3] || 'index.html';
  const b = await launch();
  const { page } = await open(b, 'file://' + path.resolve(ROOT, file), { ctx: { viewport: { width: 1400, height: 900 } } });
  const data = await page.evaluate(() => {
    const B = window.__bitten, K = B.SKINS24, ids = Object.keys(K.SKINS).filter((id) => K.SKINS[id].length);
    const filters = B.FILTERS14 ? B.FILTERS14.list : [null];
    const cols = Math.max(...ids.map((id) => K.SKINS[id].length + 1)) , C = 84;
    const rows = []; for (const id of ids) for (const f of filters) rows.push([id, f]);
    const cv = document.createElement('canvas'); cv.width = cols * C; cv.height = rows.length * C;
    const c = cv.getContext('2d'); c.fillStyle = '#222'; c.fillRect(0, 0, cv.width, cv.height);
    const one = document.createElement('canvas'); one.width = one.height = C - 4;
    rows.forEach(([id, f], r) => {
      for (let n = 0; n <= K.SKINS[id].length; n++) {
        if (B.FILTERS14) B.FILTERS14.preview = f;
        K.drawOn(one, id, n, 1.3, {});
        c.drawImage(one, n * C + 2, r * C + 2);
        c.fillStyle = '#fff'; c.font = '9px sans-serif'; c.fillText((n ? K.SKINS[id][n - 1].name : 'Original').slice(0, 14) + (f ? ' ' + f : ''), n * C + 4, r * C + 12);
      }
    });
    if (B.FILTERS14) B.FILTERS14.preview = undefined;
    return cv.toDataURL('image/png');
  });
  fs.mkdirSync(path.join(ROOT, 'test/out'), { recursive: true });
  const out = path.join(ROOT, `test/out/contact-${tag}.png`);
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  console.log(out);
  await b.close();
})();
