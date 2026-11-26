// v14.10 coop items: F9 recap on game over, B6 team cap on room wide effects, B8 team curses, M9 couch owner chip,
// the Multiplayer tab, coop achievements, guest progress merge (net14.keepProgress), T14/T15 renames and old texts files.
// Usage: NODE_PATH=$(npm root -g) node test/coop1410.js
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
(async () => {
  const b = await launch(); const page = await (await b.newContext()).newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.waitForFunction(() => window.__bitten && window.__bitten.Game);
  await page.evaluate(() => window.__advance(300));
  const r = await page.evaluate(async () => {
    const B = window.__bitten, C = B.coop14, G = B.G, out = {};
    const mk = (a) => ({ moveVec: () => ({ x: Math.cos(a), y: Math.sin(a) }), aimVec: () => ({ x: 1, y: 0 }), dash: () => false, interact: () => false });
    C.pending = [{ src: mk(0), char: 'apple', look: 0, name: 'Ann' }, { src: mk(2), char: 'apple', look: 3, name: 'Bob' }];
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    await window.__advance(4000);
    out.players = G.players.length;
    // B8: a darkness curse on apple 2 darkens the room for the team; gone when that apple is a ghost
    const [P1, P2] = G.players;
    P2.flags.nacht = true;
    out.teamDark = B.COOP1410.teamFlag('nacht');
    P2.ghost14 = true; out.ghostDark = B.COOP1410.teamFlag('nacht'); P2.ghost14 = false; P2.flags.nacht = false;
    // B6: two carriers of a room wide blast item: each blast hits at 0.75
    const blastId = Object.keys(CLASH_TAGS13).find((id) => /\bblast\b/.test(CLASH_TAGS13[id]) && ITEMS[id]);
    P1.items.push(blastId); P2.items.push(blastId);
    out.carriers = B.COOP1410.carriers();
    const sn = G.room.snakes.find((x) => x.alive && !x.isBoss) || new Snake('grub', 300, 300, { delay: 0 }); sn.delay = 0; sn.hp = 100; sn.maxHp = 100; sn.inv = 0; sn.canBeHit = () => true; sn.trait = null; sn.shieldT = 0; sn.tagT = 0; sn.stickyT = 0;
    B.COOP1410.RW.on = 1; B.COOP1410.RW.k = out.carriers; sn.hurt(10, 0, 0); B.COOP1410.RW.on = 0;
    out.capped = +(100 - sn.hp).toFixed(2);
    sn.hp = 100; sn.inv = 0; sn.hurt(10, 0, 0); out.plain = +(100 - sn.hp).toFixed(2);
    // F9: game over shows a recap card per apple
    for (const P of G.players) { const s = C.statOf(P); s.kills += 3; s.dealt.Seeds = (s.dealt.Seeds || 0) + 40; s.taken += 2; s.killer = 'Grub'; }
    B.Game.gameOver();
    await window.__advance(300);
    const rc = document.querySelector('#over .recap14');
    out.recapCards = rc ? rc.querySelectorAll('.rc14').length : 0;
    out.recapText = rc ? rc.textContent.replace(/\s+/g, ' ').slice(0, 120) : '';
    // the Multiplayer tab
    out.mpTab = !!document.getElementById('t-mp14') && !!document.getElementById('tab-mp14') && HOW_TABS9.includes('mp14');
    out.achs = ['coopwin', 'cooprevive', 'onlinefloor'].every((id) => ACHS.some((a) => a.id === id));
    // guest progress merge
    const mine = { stats: { kills: 10 }, found: { a: true }, seen: {}, ach: {}, winChars: {}, unlocks: {}, best: { kills: 5 } };
    const base = { stats: { kills: 100, rooms: 7 }, found: { a: true, h: true }, seen: {}, ach: { x: true }, winChars: {}, unlocks: {}, best: { kills: 50 } };
    const run = { stats: { kills: 130, rooms: 9 }, found: { a: true, h: true, n: true }, seen: { s: 1 }, ach: { x: true, y: true }, winChars: {}, unlocks: { appel: true }, best: { kills: 60 } };
    B.net14.keepProgress(mine, base, run);
    out.merge = JSON.stringify(mine);
    // T15 renames and an old texts file
    out.names = [KINDS.creeper && KINDS.creeper.name, BOSS_INFO.ender && BOSS_INFO.ender.title];
    return out;
  });
  const res = [];
  const ok = (n, c, i = '') => { res.push(`${c ? 'PASS' : 'FAIL'} ${n}${i ? ': ' + i : ''}`); if (!c) process.exitCode = 1; };
  ok('two apples', r.players === 2);
  ok('B8 darkness counts for the team', r.teamDark === true);
  ok('B8 not while the carrier is a ghost', r.ghostDark === false);
  ok('B6 two carriers', r.carriers === 2);
  ok('B6 each room wide hit at 1.5 / 2', Math.abs(r.capped - 7.5) < 0.01 && Math.abs(r.plain - 10) < 0.01, `capped ${r.capped}, plain ${r.plain}`);
  ok('F9 recap on game over, one card per apple', r.recapCards === 2, r.recapText);
  ok('Multiplayer tab in How to play', r.mpTab);
  ok('coop achievements', r.achs);
  const m = JSON.parse(r.merge);
  ok('guest progress: stats added from the run', m.stats.kills === 40 && m.stats.rooms === 2, JSON.stringify(m.stats));
  ok('guest progress: found, seen, achievements, unlocks, best', m.found.n && !m.found.h && m.seen.s && m.ach.y && !m.ach.x && m.unlocks.appel && m.best.kills === 60, r.merge);
  ok('T15 names', r.names[0] === 'Knaller' && r.names[1] === 'The Rift Wyrm', r.names.join(', '));
  ok('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  console.log(res.join('\n'));
  await b.close();
})();
