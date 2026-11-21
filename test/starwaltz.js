// Rotten Waltz (Starlight Remix): plays every stage of the live boss track on a real AudioContext and measures the level,
// then checks the stage changes, the riser, the impact and the finale run without errors.
// Usage: NODE_PATH=$(npm root -g) node test/starwaltz.js
const { launch, ROOT } = require('./lib');
const path = require('path');
(async () => {
  const b = await launch();
  const page = await (await b.newContext()).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  const res = await page.evaluate(async () => {
    const ctx = new AudioContext(); await ctx.resume();
    const an = ctx.createAnalyser(); an.fftSize = 2048; an.connect(ctx.destination);
    const I = StarWaltz.create(ctx, an, 0.6), buf = new Float32Array(an.fftSize), out = [];
    const run = async (ms) => { const end = performance.now() + ms; let peak = 0, sum = 0, n = 0; while (performance.now() < end) { I.tick(); an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) { s += v * v; peak = Math.max(peak, Math.abs(v)); } sum += Math.sqrt(s / buf.length); n++; await new Promise((r) => setTimeout(r, 50)); } return { rms: +(sum / n).toFixed(4), peak: +peak.toFixed(3) }; };
    for (const st of [1, 2, 3, 4]) { I.setStage(st); const m = await run(3500); out.push({ st, now: I.stage, ...m }); }
    I.riser(1.5); await run(1600); I.impact(); I.setDim(0.6); await run(800); I.setDim(0);
    I.finale(); const fin = await run(1500);
    return { out, fin };
  });
  console.log(JSON.stringify(res));
  const ok = !errs.length && res.out.every((o, i) => o.now === i + 1 && o.rms > 0.01 && o.peak <= 1.01);
  console.log(errs.length ? errs : '', ok ? 'STARWALTZ OK' : 'STARWALTZ FAILED');
  await b.close(); process.exit(ok ? 0 : 1);
})();
