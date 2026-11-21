// Snake sheet: every snake kind drawn in an S curve, labelled. Writes test/out/snakes-<tag>.png.
// Usage: node test/snakes.js [tag] [file] [filter]   (filter: comma list of kinds)
const { launch, open, startRun, ROOT } = require('./lib');
const path = require('path');
const fs = require('fs');
(async () => {
  const tag = process.argv[2] || 'now', file = process.argv[3] || 'index.html', only = process.argv[4] ? process.argv[4].split(',') : null;
  const b = await launch();
  const { page, log } = await open(b, 'file://' + path.resolve(ROOT, file), { ctx: { viewport: { width: 1400, height: 900 } } });
  await startRun(page);
  const res = await page.evaluate((only) => {
    const ids = []; for (const k of Object.keys(KINDS).filter((k) => !only || only.includes(k))) { const L = KINDS[k].look14, n = L && L.vars ? L.vars.length : 1; for (let v = 0; v < n; v++) ids.push([k, v]); }
    const C = 200, R = 150, cols = 10, rows = Math.ceil(ids.length / cols);
    const cv = document.createElement('canvas'); cv.width = cols * C; cv.height = rows * R;
    const c = cv.getContext('2d'); c.fillStyle = '#3a3f36'; c.fillRect(0, 0, cv.width, cv.height);
    const errs = [];
    ids.forEach(([id, vi], i) => {
      const ox = (i % cols) * C, oy = Math.floor(i / cols) * R;
      c.save(); c.beginPath(); c.rect(ox, oy, C, R); c.clip();
      c.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#3a3f36' : '#343a31'; c.fillRect(ox, oy, C, R);
      try {
        const K = KINDS[id], sc = Math.min(2.4, 150 / ((K.maxLen + 2) * K.spacing + K.headR * 2), 34 / K.headR);
        const sn = new Snake(id, 0, 0, { emerge: false, ang: 0 });
        if (vi || (KINDS[id].look14 && KINDS[id].look14.vars)) window.__bitten.lookVariant14(sn, vi); sn.state = 'active'; sn.eyeOpen = 1; sn.spawnTime = 0; sn.under = []; sn.holes = [];
        const len = (sn.maxLen + 2) * sn.spacing, tr = [];
        for (let s = 0; s <= len; s += 2) tr.push({ x: -s, y: Math.sin(s / 28) * 14, s: len - s });
        sn.odo = len; sn.x = 0; sn.y = 0; sn.trail = tr; sn.drawAng = sn.ang = Math.atan2(Math.cos(0) * 14 / 28, 1) + Math.PI;
        sn.drawAng = sn.ang = Math.atan2(-14 / 28, -1) + Math.PI;
        sn.len = sn.maxLen; sn.computeBody();
        c.translate(ox + C * 0.8, oy + R * 0.55); c.scale(sc, sc);
        c.fillStyle = 'rgba(0,0,0,0.3)'; drawSnakeShadow(c, sn);
        drawSnake(c, sn, 1.3);
      } catch (e) { errs.push(id + ': ' + e.message); }
      c.restore();
      c.fillStyle = '#fff'; c.font = '11px sans-serif'; c.fillText(id + (vi ? ' v' + (vi + 1) : '') + (KINDS[id].boss ? ' (boss)' : ''), ox + 4, oy + 13);
    });
    return { url: cv.toDataURL('image/png'), errs, n: ids.length };
  }, only);
  fs.mkdirSync(path.join(ROOT, 'test/out'), { recursive: true });
  const out = path.join(ROOT, `test/out/snakes-${tag}.png`);
  fs.writeFileSync(out, Buffer.from(res.url.split(',')[1], 'base64'));
  console.log(out, res.n, 'kinds'); if (res.errs.length) console.log('draw errors:', res.errs.join('\n'));
  if (log.errors.length) console.log('page errors:', log.errors.slice(0, 5).join('\n'));
  await b.close();
})();
