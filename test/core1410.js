// v14.10 core feel: charged shot, overheat, knockback weight, perfect dash, auto aim skips faded snakes, damage numbers
// (off by default), touch auto fire (off by default), hit stop, seed type row, death replay on game over.
// Usage: NODE_PATH=$(npm root -g) node test/core1410.js [shot.png]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch(); const page = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.waitForFunction(() => window.__bitten && window.__bitten.Game);
  await page.evaluate(() => window.__advance(300));
  const r = await page.evaluate(async () => {
    const B = window.__bitten, G = B.G, C = B.CORE1410, out = {};
    out.dmgDefault = B.UI.setting('dmgnum14'); out.autoDefault = B.UI.setting('autofire14');
    B.Save.data.unlocks.apple = true; B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__advance(1500);
    const P = G.player, room = G.room;
    // keep the snakes away from the apple while we test
    for (const s of room.snakes) { s.alive = false; }
    // charged shot: fire without a gap for more than 0.6 s
    P.cool = 0; const seenC = new Set();
    const I = B.Input; const keepAim = I.aimVec; I.aimVec = () => ({ x: 1, y: 0, touch: false });
    for (let i = 0; i < 60; i++) { await window.__advance(16); for (const s of G.seeds) if (s.charged14) seenC.add(s); }
    I.aimVec = keepAim;
    out.charged = seenC.size; out.seedsFired = P.shots;
    // overheat: a very fast build
    P.fireDelay = 0.05; P.heat14 = 0; P.lock14 = 0;
    I.aimVec = () => ({ x: 1, y: 0, touch: false });
    let locked = false; for (let i = 0; i < 400 && !locked; i++) { await window.__advance(16); if (P.lock14 > 0) locked = true; }
    I.aimVec = keepAim; P.fireDelay = 0.36; P.lock14 = 0; P.heat14 = 0;
    out.overheat = locked;
    // knockback weight: a grub moves more than a boss
    out.kb = { grub: C.kbW({ headR: 8 }), big: C.kbW({ headR: 18 }), boss: C.kbW({ isBoss: true, headR: 20 }) };
    // perfect dash: venom right on the apple, dash now
    P.dash = true; P.dashCd = 0; P.inv = 0;
    G.venom.push({ x: P.x, y: P.y, vx: 0, vy: 0, r: 5, t: 0, life: 5, col: '#7ad84a', kind: 'blob' });
    I.dashReq = true; await window.__advance(50);
    out.perfect = { dashCd: P.dashCd, slow: G.slow14 > 0 || P.pd14 === true };
    G.venom.length = 0;
    // auto aim: a cloaked Pluto or Kameleon is not a target
    const A = B.autoaim133;
    out.vis = [A.visOf({ cloak: 0.3 }), A.visOf({ fade: 0.35 }), A.visOf({ cloak: 0.9, fade: 1 })];
    // damage numbers: off by default, on with the setting
    const sn = new Snake('grub', P.x + 120, P.y, {}); sn.delay = 0; sn.canBeHit = () => true; room.snakes.push(sn);
    sn.hurt(1, sn.x, sn.y); out.dnOff = C.DN.length;
    B.Save.data.settings.dmgnum14 = true; sn.hp = 50; sn.hurt(2, sn.x, sn.y); out.dnOn = C.DN.length;
    // touch auto fire: last touch aim kept while snakes live
    B.Save.data.settings.autofire14 = true; I.touchMode = true;
    I.sticks.aim = { id: 9, ox: 900, oy: 400, x: 960, y: 400 }; const a1 = I.aimVec(600, 400); I.sticks.aim = null;
    const a2 = I.aimVec(600, 400);
    out.autofire = { held: !!a1, kept: !!(a2 && a2.auto14) };
    B.Save.data.settings.autofire14 = false; const a3 = I.aimVec(600, 400); out.autofireOff = !a3;
    I.touchMode = false;
    // seed types
    out.ammo = C.ammo(P);
    // death replay: let the run go on a little, then die
    await window.__advance(1500);
    out.frames = C.RP.buf.length;
    B.Game.gameOver();
    await window.__advance(2500);
    const fig = document.querySelector('#over .replay14');
    out.replay = !!(fig && !fig.hidden && fig.querySelector('canvas').width > 0);
    out.errors = G.errors;
    return out;
  });
  if (process.argv[2]) await page.screenshot({ path: process.argv[2] });
  const res = [];
  const ok = (n, c, i = '') => { res.push(`${c ? 'PASS' : 'FAIL'} ${n}${i ? ': ' + i : ''}`); if (!c) process.exitCode = 1; };
  ok('damage numbers and touch auto fire start off', r.dmgDefault === false && r.autoDefault === false);
  ok('charged shot after 0.6 s of fire', r.charged >= 1, `charged ${r.charged}, shots ${r.seedsFired}`);
  ok('overheat on a very fast build', r.overheat);
  ok('knockback weight: grub > big > boss', r.kb.grub > r.kb.big && r.kb.big > r.kb.boss && r.kb.boss < 0.15, JSON.stringify(r.kb));
  ok('perfect dash gives the dash back and slows time', r.perfect.dashCd === 0 && r.perfect.slow, JSON.stringify(r.perfect));
  ok('auto aim: faded and cloaked snakes are skipped', r.vis[0] < 0.4 && r.vis[1] < 0.4 && r.vis[2] >= 0.4, r.vis.join(' '));
  ok('damage numbers only with the setting', r.dnOff === 0 && r.dnOn >= 1, `${r.dnOff} / ${r.dnOn}`);
  ok('touch auto fire keeps the last aim', r.autofire.held && r.autofire.kept && r.autofireOff, JSON.stringify(r.autofire));
  ok('seed type row', r.ammo && r.ammo.normal === 1, JSON.stringify(r.ammo));
  ok('replay frames recorded and shown on game over', r.frames > 30 && r.replay, `frames ${r.frames}`);
  ok('no game errors', !r.errors && !errs.length, errs.slice(0, 2).join(' | '));
  console.log(res.join('\n'));
  await b.close();
})();
