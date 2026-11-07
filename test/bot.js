// Single player regression bot (section 4 of the v14 prompt).
// Runs N seeded runs per character on normal in one or two builds and compares floor, kills, damage taken and time.
// Everything is deterministic: an in-page fake clock (test/fakeclock.js) drives every rAF and timer at 60 Hz, Math.random is a
// seeded mulberry32 (reseeded right before the run starts), render is switched off.
// Usage: node test/bot.js [--runs 20] [--chars apple,lucky] [--a ref/Bitten_v13.7.html] [--b index.html]
//        [--mode arcade] [--cap 600] [--par 3] [--out test/out/bot.json]
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const RENDER = arg('render', '0') === '1', HZ = +arg('hz', 60);
const RUNS = +arg('runs', 20), CAP = +arg('cap', 600), PAR = +arg('par', 3), MODE = arg('mode', 'arcade');
const CHARS = arg('chars', 'apple,appel,rot,krul,mika,pean,apploa,lucif,lucky').split(',');
const BUILDS = [arg('a', 'ref/Bitten_v13.7.html'), arg('b', 'index.html')].filter((x) => x !== 'none');

// in-page bot. Only uses names that exist in v13.7 and v14 alike.
function botInstall(seed, opt = {}) {
  const mul = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  Math.random = mul(seed);
  if (!opt.render) window.render = function () {};
  const B = window.__bitten, St = { dmg: 0, lastHp: null, goal: null, goalT: 0, bestD: 1e9, black: new Set(), lastRoom: null, roomT: 0, strafe: 1, mv: { x: 0, y: 0 }, aim: null, tick: -1, modalT: 0, modals: 0 };
  window.__bot = St;
  const blocked = (room, c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || !!room.tiles[r][c];
  function path(room, x0, y0, x1, y1) {                       // BFS over tiles, returns the next waypoint
    const c0 = Math.floor(x0 / T), r0 = Math.floor(y0 / T);
    const c1 = Math.max(0, Math.min(COLS - 1, Math.floor(x1 / T))), r1 = Math.max(0, Math.min(ROWS - 1, Math.floor(y1 / T)));
    if (c0 === c1 && r0 === r1) return [x1, y1];
    const prev = new Map(), q = [[c1, r1]], key = (c, r) => r * 100 + c;
    prev.set(key(c1, r1), null);
    while (q.length) {
      const [c, r] = q.shift();
      if (c === c0 && r === r0) break;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, k = key(nc, nr);
        if (prev.has(k) || (blocked(room, nc, nr) && !(nc === c0 && nr === r0))) continue;
        prev.set(k, [c, r]); q.push([nc, nr]);
      }
    }
    const nx = prev.get(key(c0, r0));
    if (!nx) return [x1, y1];
    return [(nx[0] + 0.5) * T, (nx[1] + 0.5) * T];
  }
  const norm = (x, y) => { const l = Math.hypot(x, y); return l > 1e-6 ? { x: x / l, y: y / l } : { x: 0, y: 0 }; };
  function nextDoor(room) {                                   // BFS over the floor map: nearest unvisited room, then the boss
    const seen = new Map([[room, null]]), q = [room];
    let found = null;
    const want = (r) => !r.visited || (r.type === 'boss' && !r.cleared);
    while (q.length) {
      const r = q.shift();
      if (r !== room && want(r) && !St.black.has(r)) { found = r; break; }
      for (const d in r.doors) { const n = r.doors[d]; if (n && !seen.has(n)) { seen.set(n, [r, d]); q.push(n); } }
    }
    if (!found) return null;
    let r = found, dir = null;
    while (seen.get(r)) { const [pr, d] = seen.get(r); dir = d; if (pr === room) break; r = pr; }
    return { dir, to: found };
  }
  function decide() {
    const G = B.G, P = G.player, room = G.room;
    St.mv = { x: 0, y: 0 }; St.aim = null;
    if (!P || !room || G.state !== 'play') return;
    if (St.lastHp != null && P.hp < St.lastHp) St.dmg += St.lastHp - P.hp;
    St.lastHp = P.hp;
    if (St.lastRoom !== room) { St.lastRoom = room; St.roomT = 0; St.goal = null; }
    St.roomT += 1 / 60;
    const foes = room.snakes.filter((s) => s.alive && s.state === 'active' && !s.burrowed);
    if (foes.length) {
      let t = foes[0], td = 1e9;
      for (const s of foes) { const d = Math.hypot(s.x - P.x, s.y - P.y); if (d < td) { td = d; t = s; } }
      St.aim = norm(t.x - P.x, t.y - P.y);
      if (Math.floor(G.t / 2) % 2 === 0) St.strafe = 1; else St.strafe = -1;
      if (td < 150) {
        let best = null, bs = -1e9;
        for (let a = 0; a < 16; a++) {
          const dx = Math.cos(a * Math.PI / 8), dy = Math.sin(a * Math.PI / 8), x = P.x + dx * 40, y = P.y + dy * 40;
          if (x < 20 || y < 20 || x > RW - 20 || y > RH - 20 || blocked(room, Math.floor(x / T), Math.floor(y / T))) continue;
          let m = 1e9; for (const s of foes) m = Math.min(m, Math.hypot(s.x - x, s.y - y));
          if (m > bs) { bs = m; best = { x: dx, y: dy }; }
        }
        St.mv = best || { x: 0, y: 0 };
      } else if (td > 240) {
        const [wx, wy] = path(room, P.x, P.y, t.x, t.y); St.mv = norm(wx - P.x, wy - P.y);
      } else {
        St.mv = { x: -St.aim.y * St.strafe, y: St.aim.x * St.strafe };
      }
      return;
    }
    if (room.locked) {                                        // locked with nothing visible: wander to the middle
      const [wx, wy] = path(room, P.x, P.y, RW / 2, RH / 2); St.mv = norm(wx - P.x, wy - P.y); return;
    }
    // out of combat: free pickups, the chest, the exit, the next room
    let goal = null;
    for (const p of room.pickups) {
      if (St.black.has(p) || p.price > 0 || p.curseCost || room.type === 'shop' || (p.t != null && p.t < 0.5)) continue;
      goal = { obj: p, x: p.x, y: p.y }; break;
    }
    if (!goal && room.chest && !room.chest.open && !room.chest.woke && !St.black.has(room.chest)) goal = { obj: room.chest, x: room.chest.x, y: room.chest.y };
    if (!goal && room.exit && room.exit.t > 1) goal = { obj: room.exit, x: room.exit.x, y: room.exit.y };
    if (!goal) {
      const nd = nextDoor(room);
      if (nd) {
        const v = DOORV[nd.dir];
        goal = { obj: nd.to, x: RW / 2 + v[0] * (RW / 2 + 60), y: RH / 2 + v[1] * (RH / 2 + 60), door: nd.dir, ix: RW / 2 + v[0] * (RW / 2 - 30), iy: RH / 2 + v[1] * (RH / 2 - 30) };
      }
    }
    if (!goal) return;
    if (!St.goal || St.goal.obj !== goal.obj) { St.goal = goal; St.goalT = 0; St.bestD = 1e9; }
    St.goalT += 1 / 60;
    const d = Math.hypot(goal.x - P.x, goal.y - P.y);
    if (d < St.bestD - 4) { St.bestD = d; St.goalT = 0; }
    if (St.goalT > 5) { St.black.add(goal.obj); St.goal = null; return; }  // no progress for 5 s
    let tx = goal.x, ty = goal.y;
    if (goal.door) {
      if (!St.goal.commit && Math.hypot(goal.ix - P.x, goal.iy - P.y) < 26) St.goal.commit = true;
      if (!St.goal.commit) { const [wx, wy] = path(room, P.x, P.y, goal.ix, goal.iy); St.mv = norm(wx - P.x, wy - P.y); return; }
    }
    const [wx, wy] = goal.door ? [tx, ty] : path(room, P.x, P.y, tx, ty);
    St.mv = norm(wx - P.x, wy - P.y);
  }
  const step = () => { const t = B.G.t; if (t !== St.tick) { St.tick = t; try { decide(); } catch (e) { St.err = String(e); } } };
  B.Input.moveVec = function () { step(); return { x: St.mv.x, y: St.mv.y }; };
  B.Input.aimVec = function () { step(); return St.aim ? { x: St.aim.x, y: St.aim.y, touch: false } : null; };
  // modal screens: close or skip them
  setInterval(() => {
    const G = B.G;
    if (G.state === 'play' || G.state === 'over' || G.state === 'win' || G.state === 'menu') { St.modalT = 0; return; }
    St.modalT++; St.modals++;
    try {
      if (G.state === 'pause') { B.Game.resume(); return; }
      if (G.state === 'sell') { B.UI.closeSell(); return; }
      const vis = [...document.querySelectorAll('button')].filter((b) => b.offsetParent && !b.disabled);
      const skip = vis.find((b) => /skip|walk away|no thanks|leave|not now|later|decline|close|done|continue|back|nee/i.test(b.textContent));
      if (skip) { skip.click(); return; }
      if (St.modalT > 3 && vis.length) vis[0].click();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', key: 'Escape' }));
    } catch (e) { St.err = String(e); }
  }, 300);
}

module.exports = { botInstall };
async function oneRun(browser, file, char, seed) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, file));
  await page.evaluate(() => window.__advance(300));
  if (!(await page.evaluate(() => !!(window.__bitten && window.__bitten.Game)))) throw new Error('game did not boot');
  await page.evaluate(([fn, seed, id, mode, opt]) => {
    eval('(' + fn + ')')(seed, opt);
    const B = window.__bitten; const { Save, Game } = B;
    Save.data.unlocks[id] = true; Save.data.char = id; Save.data.diff = 'normal';
    if (B.SKINS24) B.SKINS24.setSkin(id, 0);
    Game.toMenu();
    Math.random = ((a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })(seed * 7 + 1);
    Game.startRun(false, mode);
  }, [botInstall.toString(), seed, char, MODE, { render: RENDER }]).catch((e) => errors.push('start: ' + e.message));
  let res = null;
  const t0 = Date.now();
  for (let k = 0; k < CAP / 10 + 5; k++) {
    await page.evaluate((hz) => window.__advance(10000, hz), HZ);
    res = await page.evaluate(() => { const G = window.__bitten.G, S = window.__bot; return { state: G.state, floor: G.levelIdx, kills: G.run ? G.run.kills : 0, rooms: G.run ? G.run.rooms : 0, time: G.run ? +G.run.time.toFixed(2) : 0, dmg: S.dmg, hp: G.player ? G.player.hp : 0, items: G.player ? G.player.items.length : 0, coins: G.run ? G.run.coins : 0, modals: S.modals, err: S.err || null }; });
    if (res.state === 'over' || res.state === 'win' || res.state === 'menu' || res.time >= CAP) break;
  }
  res.wall = ((Date.now() - t0) / 1000).toFixed(1);
  res.errors = errors.length; res.firstErr = errors[0] || null;
  await ctx.close();
  return res;
}

if (require.main === module) (async () => {
  const browser = await launch();
  const all = {};
  for (const file of BUILDS) {
    all[file] = {};
    const jobs = [];
    for (const ch of CHARS) for (let i = 0; i < RUNS; i++) jobs.push([ch, 1000 + i]);
    const results = [];
    let next = 0;
    async function worker() {
      while (next < jobs.length) {
        const [ch, seed] = jobs[next++];
        const r = await oneRun(browser, file, ch, seed);
        r.char = ch; r.seed = seed; results.push(r);
        process.stderr.write(`${path.basename(file)} ${ch} ${seed}: ${r.state} floor ${r.floor} kills ${r.kills} dmg ${r.dmg} t ${r.time} rooms ${r.rooms} (${r.wall}s)${r.err ? " BOT " + r.err : ""}${r.errors ? " ERR " + r.firstErr : ""}\n`);
      }
    }
    await Promise.all(Array.from({ length: PAR }, worker));
    for (const r of results) (all[file][r.char] = all[file][r.char] || []).push(r);
  }
  await browser.close();
  // summary per character: mean floor, kills, damage, time; and exact matches when both builds ran
  const mean = (a, k) => a.reduce((s, r) => s + r[k], 0) / (a.length || 1);
  const lines = [];
  for (const ch of CHARS) {
    const row = [ch.padEnd(7)];
    for (const f of BUILDS) { const a = all[f][ch] || []; row.push(`${path.basename(f).slice(0, 14).padEnd(14)} floor ${mean(a, 'floor').toFixed(2)} kills ${mean(a, 'kills').toFixed(1)} dmg ${mean(a, 'dmg').toFixed(1)} time ${mean(a, 'time').toFixed(0)}`); }
    if (BUILDS.length === 2) {
      const A = all[BUILDS[0]][ch] || [], Bb = all[BUILDS[1]][ch] || [];
      let same = 0; for (const r of A) { const o = Bb.find((x) => x.seed === r.seed); if (o && o.floor === r.floor && o.kills === r.kills && o.dmg === r.dmg && Math.abs(o.time - r.time) < 0.02) same++; }
      row.push(`identical ${same}/${A.length}`);
    }
    lines.push(row.join(' | '));
  }
  console.log(lines.join('\n'));
  const out = arg('out', path.join(ROOT, 'test/out/bot.json'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(all, null, 1));
})();
