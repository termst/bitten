// Smoke test for SIX SEVEN (src/90-v14-zz67.js). Puts the 67 stage next to the start on floor 2, plays the fight in god mode:
// intro, beats, slams, pads (hype), SIX SEVEN MODE, all three stages, the win and the loot. Fails on any page error.
// Screenshots go to test/out/six67-*.png. Usage: NODE_PATH=$(npm root -g) node test/six67.js [--shots dir]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const ai = process.argv.indexOf('--shots');
const OUT = ai > 0 ? path.resolve(process.argv[ai + 1]) : path.join(ROOT, 'test', 'out');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.type() + ': ' + m.text()); if (m.type() === 'warning' && /v14 67/.test(m.text()) && !global.w67) { global.w67 = 1; m.args()[1] && m.args()[1].evaluate((e) => e.stack).then((s) => console.log('WARN', s)); } });
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(() => {
    const B = window.__bitten;
    window.__tick14 = async (ms) => {
      for (let t = 0; t < ms; t += 50) {
        await window.__advance(Math.min(50, ms - t));
        if (B.G.state === 'contract' && B.CT24) B.CT24.decline();
      }
    };
    return window.__advance(300);
  });
  const shot = async (name) => page.screenshot({ path: path.join(OUT, `six67-${name}.png`) });
  const step = (fn, arg) => page.evaluate(fn, arg);
  const res = {};
  res.start = await step(async () => {
    const B = window.__bitten, G = B.G;
    B.H67.CFG.next = true;
    B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__tick14(500);
    B.Game.loadLevel(1);
    await window.__tick14(1500);
    const r = G.map.rooms.find((q) => q.type === 'hype67');
    return { found: !!r, speakers: r ? r.obs.filter((o) => o.type === 'spk67').length : 0 };
  });
  res.intro = await step(async () => {
    const B = window.__bitten, G = B.G, P = G.player;
    P.god = true;
    const room = G.map.rooms.find((q) => q.type === 'hype67');
    B.Game.enterRoom(room, Object.keys(room.doors)[0]);
    await window.__tick14(1100);
    return { boss: G.boss && G.boss.kind, locked: room.locked, intro: room.h67 && +room.h67.intro.toFixed(2) };
  });
  await shot('intro');
  res.stage1 = await step(async () => {
    const B = window.__bitten, G = B.G, room = G.room, H = room.h67, P = G.player;
    let slams = 0, glyphs = 0, pads = 0;
    for (let i = 0; i < 40; i++) {
      await window.__tick14(150);
      slams = Math.max(slams, H.slams.length); pads = Math.max(pads, H.pads.length);
      glyphs = Math.max(glyphs, G.venom.filter((v) => v.kind === 'g67').length);
    }
    // stand on a pad over a beat
    const hype0 = H.hype;
    const p = H.pads[0];
    if (p) { P.x = p.x; P.y = p.y; P.vx = 0; P.vy = 0; await window.__tick14(700); }
    return { beat: Math.floor(H.beat), bpm: H.bpm, slams, pads, glyphs, hypeUp: +(H.hype - hype0).toFixed(3) };
  });
  await shot('stage1');
  res.mode = await step(async () => {
    const B = window.__bitten, G = B.G, room = G.room, H = room.h67, sn = H.sn;
    H.hype = 1;
    await window.__tick14(900);
    const on = H.mode67 > 0, dance = sn.mode;
    const hp0 = sn.hp; sn.hurt(4, sn.x, sn.y); const d = hp0 - sn.hp;
    return { on, dance, dmg4: +d.toFixed(2), left: +H.mode67.toFixed(2) };
  });
  await shot('mode');
  res.modeEnd = await step(async () => {
    const B = window.__bitten, G = B.G, H = G.room.h67, sn = H.sn;
    await window.__tick14(6500);
    const hp0 = sn.hp; sn.hurt(4, sn.x, sn.y);
    return { off: H.mode67 <= 0, mode: sn.mode, dmg4: +(hp0 - sn.hp).toFixed(2), modes: H.modes };
  });
  res.stage2 = await step(async () => {
    const B = window.__bitten, G = B.G, H = G.room.h67, sn = H.sn;
    for (let i = 0; i < 80 && (sn.stage14 || 1) < 2; i++) { sn.hurt(sn.maxHp * 0.05, sn.x, sn.y); await window.__tick14(120); }
    await window.__tick14(3000);
    let lines = 0;
    for (let i = 0; i < 30; i++) { await window.__tick14(150); lines = Math.max(lines, H.lines.length); }
    return { stage: sn.stage14, bpm: H.bpm, lines };
  });
  await shot('stage2');
  res.stage3 = await step(async () => {
    const B = window.__bitten, G = B.G, H = G.room.h67, sn = H.sn;
    for (let i = 0; i < 120 && (sn.stage14 || 1) < 3; i++) { sn.hurt(sn.maxHp * 0.05, sn.x, sn.y); await window.__tick14(120); }
    await window.__tick14(2500);
    let rocks = 0, lines = 0;
    for (let i = 0; i < 30; i++) { await window.__tick14(150); rocks = Math.max(rocks, H.rocks.length); lines = Math.max(lines, H.lines.length); }
    return { stage: sn.stage14, bpm: H.bpm, rocks, lines };
  });
  await shot('stage3');
  res.mode3 = await step(async () => { const H = window.__bitten.G.room.h67; H.hype = 1; await window.__tick14(1500); return { on: H.mode67 > 0 }; });
  await shot('mode3');
  res.win = await step(async () => {
    const B = window.__bitten, G = B.G, room = G.room, H = room.h67, sn = H.sn;
    for (let i = 0; i < 200 && sn.alive && sn.dying <= 0; i++) { sn.hurt(sn.maxHp * 0.06, sn.x, sn.y); await window.__tick14(100); }
    await window.__tick14(6000);
    return { dead: !sn.alive, done: H.done, cleared: room.cleared, items: room.pickups.filter((q) => q.kind === 'item').length, coins: room.pickups.filter((q) => q.kind === 'coin').length, state: G.state, errs: B.H67.err().n, log: B.H67.err().log.slice(0, 5) };
  });
  await shot('won');
  console.log(JSON.stringify(res, null, 1));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length || res.win.errs ? 1 : 0);
})();
