// Difficulty curve report (v14.4): seeded bot runs (same bot as test/bot.js), numbers per floor.
// Per floor: seconds on the floor, apples of damage taken, powerups held on arrival, the power meter (DPS14),
// the boss: its HP, how many seconds the fight took and how many stages it showed.
// Usage: node test/curve.js [--runs 6] [--chars apple,lucif,lucky] [--diffs easy,normal,hard] [--b index.html] [--cap 900] [--par 3]
//        [--out test/out/curve.json] [--cfg '{"on":false}'] (CURVE14.CFG overrides)
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const { botInstall } = require('./bot');
const path = require('path');
const fs = require('fs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = +arg('runs', 6), CAP = +arg('cap', 900), PAR = +arg('par', 3), FILE = arg('b', 'index.html');
const CHARS = arg('chars', 'apple,lucif,lucky').split(','), DIFFS = arg('diffs', 'easy,normal,hard').split(',');
const OUT = arg('out', 'test/out/curve.json'), CFGJ = arg('cfg', '');

// in page: per floor bookkeeping, read from G every tick
function tracker() {
  const B = window.__bitten, St = window.__bot, F = [];
  window.__curve = F;
  let cur = null, boss = null;
  const mv0 = B.Input.moveVec;
  B.Input.moveVec = function () {
    const r = mv0.apply(this, arguments), G = B.G;
    if (G.state !== 'play' || !G.run || !G.player) return r;
    if (!cur || cur.floor !== G.levelIdx) {
      cur = { floor: G.levelIdx, t0: G.run.time, dmg0: St.dmg, items: G.player.items.length, kills0: G.run.kills, t: 0, dmg: 0, kills: 0, boss: null };
      F.push(cur); boss = null;
    }
    cur.t = +(G.run.time - cur.t0).toFixed(1); cur.dmg = (St.dmg - cur.dmg0) / 2; cur.kills = G.run.kills - cur.kills0;
    cur.itemsNow = G.player.items.length;
    const C = B.CURVE14 && B.CURVE14.state();
    if (C && C.dps != null) { cur.dps = +C.dps.toFixed(1); cur.R = +C.R.toFixed(2); cur.sk = +C.snakeK.toFixed(2); }
    const bs = G.room && G.room.snakes ? G.room.snakes.filter((s) => s.isBoss && s.maxHp > 0) : [];
    if (bs.length && !boss) { boss = { kind: bs.map((s) => s.kind).join('+'), hp: Math.round(bs.reduce((a, s) => a + s.maxHp, 0)), t0: G.run.time, st0: G.run.stages14 || 0, dmg0: St.dmg }; cur.boss = boss; }
    if (boss && boss.end == null) {
      boss.t = +(G.run.time - boss.t0).toFixed(1); boss.stages = (G.run.stages14 || 0) - boss.st0; boss.dmg = (St.dmg - boss.dmg0) / 2; boss.dpsAt = boss.dpsAt == null && cur.dps != null ? cur.dps : boss.dpsAt;
      if (!bs.some((s) => s.alive && s.dying <= 0) && G.room.cleared) boss.end = true;
    }
    return r;
  };
}

async function oneRun(browser, char, diff, seed) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e).slice(0, 160)));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, FILE));
  await page.evaluate(() => window.__advance(300));
  await page.evaluate(([fn, tr, seed, id, diff, cfg]) => {
    if (cfg && window.__bitten.CURVE14) Object.assign(window.__bitten.CURVE14.CFG, JSON.parse(cfg));
    eval('(' + fn + ')')(seed, {});
    eval('(' + tr + ')')();
    const B = window.__bitten; const { Save, Game } = B;
    Save.data.unlocks[id] = true; Save.data.unlocks.nightmare = true; Save.data.char = id; Save.data.diff = diff;
    if (B.SKINS24) B.SKINS24.setSkin(id, 0);
    Game.toMenu();
    Math.random = ((a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })(seed * 7 + 1);
    Game.startRun(false, 'arcade');
  }, [botInstall.toString(), tracker.toString(), seed, char, diff, CFGJ]);
  let res = null;
  for (let k = 0; k < CAP / 10 + 5; k++) {
    await page.evaluate(() => window.__advance(10000, 60));
    res = await page.evaluate(() => { const G = window.__bitten.G; return { state: G.state, floor: G.levelIdx, time: G.run ? +G.run.time.toFixed(1) : 0, floors: window.__curve }; });
    if (res.state === 'over' || res.state === 'win' || res.state === 'menu' || res.time >= CAP) break;
  }
  res.errors = errors.length; res.firstErr = errors[0] || null;
  await ctx.close();
  return Object.assign({ char, diff, seed }, res);
}

(async () => {
  const browser = await launch();
  const jobs = [];
  for (const d of DIFFS) for (const c of CHARS) for (let i = 0; i < RUNS; i++) jobs.push([c, d, 1000 + i]);
  const out = []; let next = 0;
  async function worker() { while (next < jobs.length) { const j = jobs[next++]; out.push(await oneRun(browser, ...j)); process.stdout.write('.'); } }
  await Promise.all(Array.from({ length: PAR }, worker));
  await browser.close();
  console.log('');
  fs.mkdirSync(path.dirname(path.resolve(ROOT, OUT)), { recursive: true });
  fs.writeFileSync(path.resolve(ROOT, OUT), JSON.stringify(out, null, 1));
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN), f1 = (x) => (isNaN(x) ? '  -  ' : x.toFixed(1).padStart(5));
  for (const d of DIFFS) {
    const R = out.filter((r) => r.diff === d);
    const won = R.filter((r) => r.state === 'win').length, errs = R.reduce((a, r) => a + r.errors, 0);
    console.log(`\n${d}: ${R.length} runs, escaped ${won}, mean deepest floor ${(mean(R.map((r) => r.floor + 1))).toFixed(2)}, page errors ${errs}`);
    console.log('floor  reach  secs  dmg   items  dps     R    snakeK  boss_hp  boss_s  stages  boss_dmg  boss_hp/s/dps');
    for (let f = 0; f < 6; f++) {
      const L = R.map((r) => (r.floors || []).find((x) => x.floor === f)).filter(Boolean);
      if (!L.length) continue;
      const Bo = L.map((x) => x.boss).filter((b) => b && b.end);
      console.log(`${String(f + 1).padStart(5)}  ${String(L.length).padStart(5)} ${f1(mean(L.map((x) => x.t)))} ${f1(mean(L.map((x) => x.dmg)))}  ${f1(mean(L.map((x) => x.items)))} ${f1(mean(L.filter((x) => x.dps != null).map((x) => x.dps)))} ${f1(mean(L.filter((x) => x.R != null).map((x) => x.R)))} ${f1(mean(L.filter((x) => x.sk != null).map((x) => x.sk)))}   ${f1(mean(Bo.map((b) => b.hp)))}   ${f1(mean(Bo.map((b) => b.t)))}  ${f1(mean(Bo.map((b) => b.stages)))}   ${f1(mean(Bo.map((b) => b.dmg)))}     ${(mean(Bo.filter((b) => b.dpsAt).map((b) => b.hp / b.t / b.dpsAt))).toFixed(2)}`);
    }
  }
})();
