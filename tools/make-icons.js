// One-time tool (T11): draws the app icons with the game's own drawApple() and saves 192 and 512 PNGs.
// Usage: node tools/make-icons.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForTimeout(500);
  for (const size of [192, 512]) {
    const data = await p.evaluate((S) => {
      const cv = document.createElement('canvas'); cv.width = cv.height = S;
      const c = cv.getContext('2d');
      const g = c.createRadialGradient(S / 2, S * 0.46, S * 0.05, S / 2, S / 2, S * 0.72);
      g.addColorStop(0, '#3a0d10'); g.addColorStop(0.6, '#160707'); g.addColorStop(1, '#0b0807');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      c.save(); c.translate(S / 2, S * 0.54);
      drawApple(c, S * 0.3, { char: 'apple', blink: 1, lookX: 0.15, lookY: 0.1, hurt: 0, bites: 0 });
      c.restore();
      return cv.toDataURL('image/png');
    }, size);
    fs.writeFileSync(path.resolve(__dirname, `../icons/icon-${size}.png`), Buffer.from(data.split(',')[1], 'base64'));
  }
  const errs = [];
  await b.close();
  console.log('icons written');
})();
