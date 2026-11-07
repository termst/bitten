// Phase 0 checks: http and file://, phone and desktop, offline, fonts, downloads, paste code, the Wals track.
const { serve, launch, open, startRun, ROOT } = require('./lib');
const path = require('path');
const fs = require('fs');
const out = [];
const ok = (name, cond, info = '') => { out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ': ' + info : ''}`); if (!cond) process.exitCode = 1; };

(async () => {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await launch();
  for (const [label, url, vp] of [['http desktop', base, { width: 1280, height: 800 }], ['http phone', base, { width: 390, height: 844 }], ['file desktop', 'file://' + path.join(ROOT, 'index.html'), { width: 1280, height: 800 }]]) {
    const { ctx, page, log } = await open(b, url, { ctx: { viewport: vp, hasTouch: label.includes('phone'), isMobile: label.includes('phone') } });
    await page.waitForTimeout(800);
    const fonts = await page.evaluate(async () => { await document.fonts.ready; return ['500 16px "Barlow Condensed"', '800 30px "Grenze Gotisch"'].map((f) => document.fonts.check(f)); });
    ok(`${label}: fonts local`, fonts.every(Boolean), JSON.stringify(fonts));
    ok(`${label}: no outside requests`, log.aborted.length === 0, log.aborted.slice(0, 3).join(' '));
    if (label === 'http desktop') {
      const bytes = log.requests.filter(([u]) => !u.endsWith('.mp3')).reduce((s, [, n]) => s + n, 0);
      ok('first load under 3 MB', bytes < 3 * 1024 * 1024, (bytes / 1048576).toFixed(2) + ' MB, ' + log.requests.length + ' files');
      const sw = await page.evaluate(() => navigator.serviceWorker.ready.then((r) => !!r.active).catch(() => false));
      ok('service worker active', sw);
    }
    // a run in each mode for a few seconds
    for (const mode of ['arcade', 'endless', 'chaos']) {
      await startRun(page, 'apple', mode);
      await page.waitForTimeout(1500);
      const st = await page.evaluate(() => window.__bitten.G.state);
      ok(`${label}: ${mode} runs`, st === 'play', st);
    }
    // the De Wals track
    const wals = await page.evaluate(() => new Promise((res) => {
      const B = window.__bitten; B.walsLoad(); let n = 0;
      const t = setInterval(() => { const M = B.walsTrack; if (M.buf || M.failed || ++n > 100) { clearInterval(t); res(M.buf ? 'decoded ' + M.buf.duration.toFixed(1) + ' s' : M.failed ? 'failed' : 'timeout'); } }, 100);
    }));
    ok(`${label}: wals track`, label.startsWith('file') ? wals !== 'timeout' : wals.startsWith('decoded'), wals);
    if (label === 'http desktop') {
      await page.evaluate(() => { const { Game } = window.__bitten; Game.toMenu(); });
      const [d1] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.evaluate(() => window.__bitten.UI.downloadSave())]);
      const saveTxt = d1 ? fs.readFileSync(await d1.path(), 'utf8') : '';
      ok('save download', d1 && /"game":\s*"Bitten"/.test(saveTxt), d1 ? d1.suggestedFilename() : 'no download');
      const [d2] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.evaluate(() => window.__bitten.UI.downloadTexts())]);
      ok('texts download', d2 && (await d2.suggestedFilename()) === 'bitten-texts.json');
      const msg = await page.evaluate(() => { const { UI, Save } = window.__bitten; const code = Save.exportCode(); UI.el.saveCode.value = code; UI.loadText(code, 'code'); return UI.el.saveMsg.textContent; });
      ok('paste code import', /loaded/.test(msg), msg);
    }
    ok(`${label}: no page errors`, log.errors.length === 0, log.errors.slice(0, 2).join(' | '));
    const cons = log.console.filter((s) => !/AudioContext|autoplay/i.test(s));
    ok(`${label}: console clean`, cons.length === 0, cons.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(out.join('\n'));
})();
