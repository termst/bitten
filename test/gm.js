// Game Maker and coop styles (v14.2), a 2 apple couch run on a fake clock:
// split: own purse per apple, own contract slot, per apple pump/gym flags, more coins drop, rules for every apple;
// plus: one purse, a powerup taken by one apple goes to both, one powerup per chest; team rules land in CO14;
// the panel mounts in the Coop screen. Usage: NODE_PATH=$(npm root -g) node test/gm.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch(); const page = await (await b.newContext()).newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(() => window.__advance(300));
  const r = await page.evaluate(async () => {
    const B = window.__bitten, C = B.coop14, out = {};
    const mk = (a) => ({ moveVec: () => ({ x: Math.cos(a) * 0.2, y: Math.sin(a) * 0.2 }), aimVec: () => ({ x: 1, y: 0 }), dash: () => false, interact: () => false });
    const start = (gm) => {
      B.Save.data.gm14 = gm; B.Save.data.mode = 'arcade'; B.Save.data.diff = 'normal';
      C.pending = [{ src: mk(0), char: 'apple', look: 0, name: 'A' }, { src: mk(2), char: 'apple', look: 0, name: 'B' }];
      B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    };
    /* ---- split, with rules */
    start({ style: 'split', p: { dmg: 2, coins: 15 }, co: { revive: 6, door: 0, scale: 0.5 } });
    const G = B.G, [P0, P1] = G.players;
    out.split = { style: coopStyle14(), co: Object.assign({}, CO14), dmg: [P0.dmg, P1.dmg], start: [P0.coins14, P1.coins14] };
    withPlayer(P1, () => { G.run.coins += 7; });
    out.split.purse = [withPlayer(P0, () => G.run.coins), withPlayer(P1, () => G.run.coins)];
    const o = { used: false }; perApple14(o, 'used'); withPlayer(P0, () => { o.used = true; });
    out.split.pump = [withPlayer(P0, () => o.used), withPlayer(P1, () => o.used)];
    const room = G.room, n0 = room.pickups.filter((p) => p.kind === 'coin').length;
    for (let i = 0; i < 40; i++) dropCoins(room, 200, 200, 2);
    out.split.coinsDropped = room.pickups.filter((p) => p.kind === 'coin').length - n0;   /* 80 base, x1.5 auto for 2 */
    room.pickups = room.pickups.filter((p) => p.kind !== 'coin');
    withPlayer(P1, () => { G.run.roomHits = 2; }); out.split.hits = [withPlayer(P0, () => G.run.roomHits), withPlayer(P1, () => G.run.roomHits)];
    G.run.roomHits = 0; out.split.hitsReset = withPlayer(P1, () => G.run.roomHits);
    await window.__advance(6000);
    /* ---- plus */
    start({ style: 'plus' });
    const [Q0, Q1] = G.players, id = ITEM_IDS.find((k) => !ITEMS[k].rare && k !== 'golden');
    withPlayer(Q0, () => collectItem(id));
    out.plus = { style: coopStyle14(), loot: coopLoot14(), items: [Q0.items.includes(id), Q1.items.includes(id)], co: Object.assign({}, CO14) };
    withPlayer(Q1, () => { G.run.coins = 33; }); out.plus.purse = withPlayer(Q0, () => G.run.coins);
    await window.__advance(6000);
    /* ---- the panel */
    C.open(); C.setTab('couch');
    const box = document.querySelector('#coop14 .gm14-couch');
    out.panel = { rows: box.querySelectorAll('.cr').length, styles: box.querySelectorAll('.gm14-sty button').length };
    box.querySelector('[data-g="style"][data-v="split"]').click();
    box.querySelector('[data-g="co.revive"][data-v="0"]').click();
    out.panel.saved = B.Save.data.gm14.co.revive === 0 && B.Save.data.gm14.style === 'split';
    box.querySelector('[data-g="mode"][data-v="custom"]').click();
    out.panel.builder = !!box.querySelector('#cust10');
    out.errors = G.errors; out.log = G.errorLog.slice(-3);
    return out;
  });
  console.log(JSON.stringify(r, null, 1), errs.slice(0, 3));
  const S = r.split, P = r.plus;
  const ok = S.style === 'split' && S.co.revive === 6 && S.co.door === 0 && S.co.scale === 0.5 && S.dmg[1] === S.dmg[0] && S.dmg[0] > 1
    && S.start[0] === S.start[1] && S.start[0] >= 15 && S.purse[1] === S.purse[0] + 7 && S.pump[0] === true && S.pump[1] === false
    && S.coinsDropped > 100 && S.hits[0] === 0 && S.hits[1] === 2 && S.hitsReset === 0
    && P.style === 'plus' && P.loot === 1 && P.items[0] && P.items[1] && P.purse === 33 && P.co.revive === 3
    && r.panel.rows > 10 && r.panel.styles === 2 && r.panel.saved && r.panel.builder && !r.errors && !errs.length;
  console.log(ok ? 'PASS' : 'FAIL');
  await b.close(); process.exit(ok ? 0 : 1);
})();
