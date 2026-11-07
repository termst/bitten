/* src/24-v9-rooms.js: v9 rooms: tankstation, kapsalon, courtroom, second story floors. From v9. Lines 13950 to 14257 of the v13.7 script. */
/* =====================================================================
   Version 9 rooms: the BP Tankstation, the kapsalon, the courtroom,
   the club and the hellclub, and the floors of the second story
   ===================================================================== */
const INSET9 = { booth: 2, speaker: 6, pump: 9, till: 4, chair: 10, judge: 2, bench: 5, crate: 4, bread: 5, checkout: 4, bottles: 6, freezer: 3 };
const SPECIAL9 = { tank: 1, kapper: 1, courtroom: 1 };

function tile9(room, ch, c, r) {
  const x = (c + 0.5) * T, y = (r + 0.5) * T;
  if (ch === 'p') { room.plates9.push({ x, y, side: c < COLS / 2 ? 'eiser' : 'gedaagde' }); return null; }
  if (ch === 's') { room.shopSpots.push({ x, y, ch: 's' }); return null; }
  const type = { 5: 'booth', 6: 'speaker', 7: 'pump', 8: 'till', 9: 'chair', 3: 'judge', n: 'bench', o: 'crate', b: 'bread', x: 'checkout', l: 'bottles', f: 'freezer' }[ch];
  if (!type) return null;
  const o = { type, solid: true, shots: type !== 'booth' && type !== 'chair' };
  if (type === 'pump') room.pumps9.push(o);
  else if (type === 'till') { if (!room.till9) { room.till9 = o; o.main = true; } }
  else if (type === 'chair') room.chair9 = o;
  return o;
}

/* ------------------------------------------------------------------ the floors of the second story */
const BUS_FIGHT = [
  ['...........', '.##.....##.', '...W...W...', '...........', '....u.u....', '...........', '...k...k...', '.##.....##.', '...........'],
  ['u.........u', '...........', '..###.###..', '...W...W...', '...........', '....k.S....', '..###.###..', '...........', 'u.........u'],
  ['...........', '.#.#...#.#.', '...........', '..W..j..W..', '...........', '..i.....k..', '...........', '.#.#...#.#.', '...........'],
  ['e.........e', '..##...##..', '...........', '.k.......k.', '.....w.....', '.W.......W.', '...........', '..##...##..', 'e.........e'],
  ['...........', '.###...###.', '...........', '..S.....S..', '.....u.....', '..W.....W..', '...........', '.###...###.', '...........'],
  ['u.u.....u.u', '...........', '..k..#..k..', '.....#.....', '..i.....i..', '.....#.....', '..W..#..W..', '...........', 'u.u.....u.u'],
  ['...........', '..#.....#..', '.W..#.#..W.', '...........', '....j.w....', '...........', '.k..#.#..k.', '..#.....#..', '...........'],
  ['e.........e', '...#...#...', '..W.....W..', '...#.S.#...', '...........', '...#...#...', '..k.....i..', '...#...#...', 'e.........e'],
];
const RAVE_FIGHT = [
  ['...........', '.#.......#.', '...d...d...', '...........', '..W..u..W..', '...........', '...d...d...', '.#.......#.', '...........'],
  ['u.........u', '..#.....#..', '...........', '..v..d..v..', '...........', '..d.....d..', '...........', '..#.....#..', 'u.........u'],
  ['...........', '.##.....##.', '....d.d....', '.S.......S.', '.....a.....', '...........', '....W.W....', '.##.....##.', '...........'],
  ['e.........e', '...........', '..#.d.d.#..', '...........', '..i.....v..', '...........', '..#.W.W.#..', '...........', 'e.........e'],
  ['...........', '.#.#...#.#.', '...........', '..d.....d..', '.....y.....', '..d.....d..', '...........', '.#.#...#.#.', '...........'],
  ['u.u.....u.u', '...........', '..S..#..S..', '...........', '..d..u..d..', '...........', '..v..#..a..', '...........', 'u.u.....u.u'],
  ['...........', '..##...##..', '..d.....d..', '...........', '....z......', '...........', '..d.....d..', '..##...##..', '...........'],
  ['...........', '.#.......#.', '..d..v..d..', '...#...#...', '...........', '...#...#...', '..W..i..W..', '.#.......#.', '...........'],
];
const COURT_FIGHT = [
  ['...........', '.###...###.', '...i...i...', '...........', '..M..u..M..', '...........', '...W...W...', '.###...###.', '...........'],
  ['u.........u', '..##...##..', '...........', '..i..L..i..', '...........', '..a.....W..', '...........', '..##...##..', 'u.........u'],
  ['...........', '.#.#...#.#.', '...........', '.M..y....M.', '...........', '...........', '..i.....i..', '.#.#...#.#.', '...........'],
  ['e.........e', '...........', '..###.###..', '...........', '..S..z..S..', '...........', '..###.###..', '...........', 'e.........e'],
  ['...........', '.###...###.', '...........', '..a.....a..', '.....u.....', '..i.....M..', '...........', '.###...###.', '...........'],
  ['u.u.....u.u', '...........', '..M..#..M..', '.....#.....', '..i.....L..', '.....#.....', '..W..#..y..', '...........', 'u.u.....u.u'],
  ['...........', '..#.....#..', '.i..#.#..i.', '...........', '....M.z....', '...........', '.W..#.#..W.', '..#.....#..', '...........'],
  ['...........', '.##.....##.', '...M...M...', '...........', '.....a.....', '...........', '...i.L.i...', '.##.....##.', '...........'],
];
Object.assign(FIGHT_SETS, { bus: BUS_FIGHT, rave: RAVE_FIGHT, court: COURT_FIGHT });
Object.assign(SHAPE_SPAWN, { bus: 'Wk', rave: 'dv', court: 'iM' });
for (const set of ['bus', 'rave', 'court']) for (const tpl of SHAPED) FIGHT_SETS[set].push(tpl.map((row) => row.replace(/1/g, SHAPE_SPAWN[set][0]).replace(/2/g, SHAPE_SPAWN[set][1])));
Object.assign(START_SETS, {
  bus: ['...........', '.##.....##.', '...........', '...........', '...........', '...........', '...........', '.##.....##.', '...........'],
  rave: ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
  court: ['...........', '.###...###.', '...........', '...........', '...........', '...........', '...........', '.###...###.', '...........'],
});
Object.assign(SWAP_POOL, { bus: 'WWkS', rave: 'ddWS', court: 'WMiS' });
Object.assign(NEW_WORMS, { bus: 'kjiw', rave: 'vadz', court: 'iayzL' });
Object.assign(MINI_POOL, { bus: ['stok', 'stroopw', 'hood'], rave: ['kameleon', 'pantser', 'driekop'], court: ['driekop', 'sloper', 'bril'] });
Object.assign(EXTRA_POOL, { bus: ['grub', 'grub', 'stok', 'hood'], rave: ['raver', 'raver', 'grub', 'kameleon'], court: ['grub', 'bril', 'kamerlid', 'pantser'] });
Object.assign(WAVE_POOL, { bus: ['grub', 'grub', 'stok', 'hood', 'stroopw'], rave: ['raver', 'raver', 'raver', 'kameleon', 'hood'], court: ['grub', 'bril', 'kamerlid', 'lobby', 'pantser'] });
Object.assign(MOD_NAMES, { lasers: 'A laser show', blackice: 'Black ice' });
// the new snakes show up in the old rooms' waves too
EXTRA_POOL.market.push('stroopw'); EXTRA_POOL.kamer.push('bril'); EXTRA_POOL.garden.push('kameleon');
WAVE_POOL.halls.push('stok'); WAVE_POOL.kamer.push('bril', 'pantser'); WAVE_POOL.garden.push('driekop', 'kameleon');

/* ------------------------------------------------------------------ making a floor: the new special rooms */
function extra9(extra, set, tier, rng, def) {
  if (def.rush || (G.mode === 'story' && curStory().id === 'lockdown')) return;
  if (rng() < 0.5) extra.push('tank');
  if (rng() < 0.34) extra.push(rng() < 0.5 ? 'kapper' : 'courtroom');
}
function placeExtras9(rooms, grid, key, rng, def, tier) {
  if (def.rush || G.mode === 'story') return;
  const hang = (type, cb) => {
    const hs = shuffle(rooms.filter((r) => r.type === 'fight' && r.dist >= 1), rng);
    for (const h of hs) {
      const sides = shuffle(Object.keys(DOORV).filter((k) => !h.doors[k] && !grid.has(key(h.gx + DOORV[k][0], h.gy + DOORV[k][1])) && !(h.secretLink && h.secretLink.k === k) && !(h.hellLink && h.hellLink.k === k)), rng);
      if (!sides.length) continue;
      const k = sides[0];
      const nr = new Room(h.gx + DOORV[k][0], h.gy + DOORV[k][1], rooms.length);
      nr.type = type; nr.dist = h.dist + 1;
      nr.doors[OPP[k]] = h;
      cb(nr, h, k);
      rooms.push(nr); grid.set(key(nr.gx, nr.gy), nr);
      return nr;
    }
    return null;
  };
  // DJ Manu-Beau plays in a club behind a neon door, from the second floor on
  const chaos = !!def.chaos;
  if (tier >= 1 && rng() < (chaos ? 0.7 : 0.32)) hang('club', (nr, h, k) => { h.doors[k] = nr; nr.theme = 'club'; nr.clubDoor = OPP[k]; nr.build(clubTemplate(OPP[k]), def); nr.sconces = []; nr.tubes = null; nr.cleared = false; });
  // on Hard and Nightmare the devil plays a hidden hellclub: the wall in front of it thumps
  const hard = G.diff === 'hard' || G.diff === 'nightmare';
  if ((hard || chaos) && tier >= 2 && rng() < (chaos ? 0.55 : 0.34)) hang('hellclub', (nr, h, k) => { h.hellLink = { k, room: nr, hp: 4 }; nr.theme = 'hell'; nr.clubDoor = OPP[k]; nr.build(clubTemplate(OPP[k]), def); nr.sconces = []; nr.tubes = null; nr.cleared = false; });
}
function hitHellWall9(room, x, y) {
  const L = room.hellLink, [sx, sy] = secretSpot(L.k);
  if (Math.abs(x - sx) > DOOR_HW + 10 || Math.abs(y - sy) > DOOR_HW + 10) return;
  L.hp -= 1; room.dirty = true;
  G.shake = Math.max(G.shake, 2);
  burst(sx, sy, 6, '#ff3a5a', { kind: 'shard', min: 30, max: 90, lmin: 0.3, lmax: 0.6, glow: true });
  Sfx.thud();
  if (L.hp <= 0) {
    room.doors[L.k] = L.room; room.hellLink = null; room.dirty = true; room.ver++;
    G.shake = Math.max(G.shake, 8);
    burst(sx, sy, 26, '#ff3a5a', { kind: 'shard', min: 50, max: 180, rmin: 1.5, rmax: 3.5, lmin: 0.4, lmax: 0.9, glow: true });
    flashLight(sx, sy, 120, 0.9, 0.8);
    Sfx.breakUrn(); Sfx.doorOpen(); Sfx.drop();
    UI.banner('VIP only', 'The bass behind the wall is wrong. Very wrong.', 'curse');
  }
}
function hellThump9(dt, room) {
  const P = G.player, [sx, sy] = secretSpot(room.hellLink.k);
  const d = dist(P.x, P.y, sx, sy);
  room.thumpT = (room.thumpT || 0) - dt;
  if (room.thumpT > 0) return;
  room.thumpT = 0.47;
  if (d < 190) Sfx.tone(52, 0.14, { to: 40, vol: 0.1 * (1 - d / 190) });
  if (Math.random() < 0.6) addP({ kind: 'dot', x: sx + rnd(-16, 16) * (sy === 0 || sy === RH ? 1 : 0.2), y: sy + rnd(-16, 16) * (sx === 0 || sx === RW ? 1 : 0.2), vx: (RW / 2 - sx) * 0.1, vy: (RH / 2 - sy) * 0.1, r: rnd(0.8, 1.6), life: 0.8, col: '#ff3a5a', glow: true, drag: 2 });
}

/* ------------------------------------------------------------------ stocking and entering */
function pumpCost9(o) {
  const P = G.player;
  let c = o.cost;
  if (P && P.bonus) c *= 0.67;
  if (P && P.flags && P.flags.greedy) c *= 1.5;
  return Math.max(1, Math.ceil(c));
}
function cutCost9() {
  const P = G.player;
  let c = 8;
  if (P && P.bonus) c *= 0.67;
  if (P && P.flags && P.flags.greedy) c *= 1.5;
  return Math.max(1, Math.ceil(c));
}
function stock9(map) {
  for (const r of map.rooms) {
    if ((SPECIAL9[r.type] || r.type === 'chaosboss') && r.store) { r.store = null; r.dirty = true; }
    if (r.type !== 'tank') continue;
    const offers = shuffle(PUMPS.slice());
    r.pumps9.forEach((o, i) => { const p = offers[i % offers.length]; o.offer = p.id; o.cost = clamp(p.cost + rndi(-2, 2), 20, 40); o.used = false; o.armed = true; o.arm14 = null; });
    for (const s of r.shopSpots) if (s.ch === 's') r.pickups.push({ kind: 'heart', amount: 2, x: s.x, y: s.y, vx: 0, vy: 0, t: 0.5, ph: rnd(10), cost: 5, snack: true });
  }
}
function enterRoom9(room, entry) {
  const P = G.player;
  enter9(P);
  if (room.type === 'tank' && !room.seen) { room.seen = true; UI.card('', 'BP Tankstation', 'Tank at a pump to tune your apple. Sell powerups at the till.', '', 2.8); Sfx.dingdong(); }
  else if (room.type === 'kapper' && !room.seen) { room.seen = true; UI.card('', 'De kapsalon', `Sit in the chair. ${cutCost9()} coins. Nobody will say anything.`, '', 2.6); Sfx.snip(); }
  else if (room.type === 'courtroom' && !room.seen) { room.seen = true; UI.card('Rechtbank', 'Pick a side', 'Eiser: a big win or a big loss. Gedaagde: plays it safe.', 'boss', 3); Sfx.gavel(); }
  if (room.type === 'chaosboss' && !room.cleared && !room.fought) { room.fought = true; chaosBossFight9(room, entry); }
  if ((room.type === 'club' || room.type === 'hellclub') && !room.cleared && !room.fought) {
    room.fought = true;
    bossFight9(room, room.type === 'hellclub' ? 'manudevil' : 'manu', entry || room.clubDoor, room.type === 'hellclub' ? 'hell' : 'club');
  }
  if (room.type === 'shop' && P.mandje && !room.mandje9) {
    room.mandje9 = true;
    const f = nearestFreeCell(room, RW / 2, RH * 0.82, (c, r) => room.pickups.some((q) => Math.abs(q.x - (c + 0.5) * T) < 30 && Math.abs(q.y - (r + 0.5) * T) < 30));
    const id = nextItemId(0.06);
    if (id !== 'golden') G.run.pending.add(id);
    room.pickups.push({ kind: 'item', id, x: f.x, y: f.y, t: 0, cost: ITEMS[id].rare ? 35 : 15, goods: true });
  }
}
function clubCleared9(room) {
  if (room.type === 'club') {
    spawnItem(room, RW / 2, RH / 2 - 20, 1);
    dropHeart(room, RW / 2 - 50, RH / 2 + 24, 2); dropCoins(room, RW / 2 + 44, RH / 2 + 24, 4);
    UI.card('', 'The party is over', 'Take what he was spinning.', '', 2.2);
  } else if (room.type === 'hellclub') {
    spawnItem(room, RW / 2 - 44, RH / 2 - 20, 1); spawnItem(room, RW / 2 + 44, RH / 2 - 20, 0.5);
    dropHeart(room, RW / 2, RH / 2 + 34, 2); dropHeart(room, RW / 2 - 54, RH / 2 + 34, 2); dropCoins(room, RW / 2 + 54, RH / 2 + 30, 8);
    UI.card('', 'The devil is down', 'For tonight.', 'boss', 2.4);
  }
  if (room.taak) { room.taak = false; spawnItem(room, RW / 2, RH / 2, 0.15); UI.banner('Taakstraf voldaan', 'Community service done. The court pays up.', 'clean'); }
}
function darkTarget9(room, L) {
  if (room.theme === 'club') return room.cleared ? 0.42 : 0.84;
  if (room.theme === 'hell') return room.cleared ? 0.5 : 0.9;
  if (room.type === 'tank') return 0.22;
  if (room.type === 'kapper') return 0.28;
  if (room.type === 'courtroom') return 0.36;
  const P = G.player;
  let d = null;
  if (P && P.flags && P.flags.nacht) d = Math.min(0.95, (room.cleared ? L.darkClear : room.mod === 'dark' ? Math.min(0.94, L.dark + 0.1) : L.dark) + 0.1);
  if (G.boss && G.boss.kind === 'tellie' && G.boss.alive && G.boss.hp < G.boss.maxHp * 0.25) d = Math.min(0.95, (d == null ? L.dark : d) + 0.12);
  return d;
}

/* ------------------------------------------------------------------ the rooms at work */
function updateRoom9(dt, room, frozen) {
  if (room.type === 'tank') updateTank9(dt, room);
  else if (room.type === 'kapper') updateKapper9(dt, room);
  else if (room.type === 'courtroom') updateCourt9(dt, room);
  if (room.syrup9 && room.syrup9.length) for (let i = room.syrup9.length - 1; i >= 0; i--) { const s = room.syrup9[i]; s.t += dt; if (s.t > s.life) room.syrup9.splice(i, 1); }
  if (!frozen) { updateLasers9(dt, room); updateDJ9(dt, room); updateJudge9(dt, room); }
  if (room.hellLink) hellThump9(dt, room);
  for (const o of room.obs) if (o.pulse9 > 0) o.pulse9 = Math.max(0, o.pulse9 - dt * 4);
  if (room.chair9 && room.chair9.snipT > 0) room.chair9.snipT -= dt;
}
function updateTank9(dt, room) {
  const P = G.player;
  for (const o of room.pumps9) {
    if (o.fillT > 0) o.fillT = Math.max(0, o.fillT - dt);
    if (!o.offer) continue;
    const near = P.dying <= 0 && dist(P.x, P.y, o.x, o.y) < P.r + 24;
    if (!near) { setArmed14(o, true); continue; }
    if (!armed14(o)) continue;
    setArmed14(o, false);
    if (o.used) { UI.banner('Leeg', 'This pump is empty. Try another one.'); continue; }
    if (curateleBlock9(null)) continue;
    const pmp = PUMP_BY_ID[o.offer], cost = pumpCost9(o);
    if (G.run.coins < cost) { UI.banner('Not enough coins', `${pmp.name} costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); continue; }
    if (pmp.maxHp && pmp.maxHp < 0 && P.maxHp + pmp.maxHp < 2) { UI.banner('Too thin for that', 'You need more health to spare for this tune.'); Sfx.thud(); continue; }
    G.run.coins -= cost; Meta.add('spent', cost); Meta.add('tunes');
    o.used = true; o.fillT = 1.2;
    P.tunes.push(pmp.id);
    if (pmp.maxHp) { P.maxHp = clamp(P.maxHp + pmp.maxHp, 2, 16); if (pmp.maxHp > 0) P.heal(pmp.maxHp); P.hp = Math.min(P.hp, P.maxHp); fixBites(P); }
    if (pmp.cleanse) { const n = cleanseDowns(P); if (n) floatText(P.x, P.y - 40, 'SCHOON', '#9fe8ff', true); }
    recalcMods(P);
    UI.banner(`Getankt: ${pmp.name}`, pmp.desc);
    Sfx.pump(); Sfx.register();
    floatText(o.x, o.y - 30, `-${cost}`, '#ffd84a');
    burst(o.x, o.y - 10, 12, '#3aa84a', { min: 30, max: 100, lmin: 0.3, lmax: 0.7, glow: true });
  }
  const till = room.till9;
  if (till) {
    const near = P.dying <= 0 && dist(P.x, P.y, till.x + T * 0.5, till.y + 4) < P.r + 34;
    if (!near) setArmed14(till, true);
    else if (armed14(till) && !G.trans) { setArmed14(till, false); UI.openSell(); }
  }
}
function updateKapper9(dt, room) {
  const o = room.chair9, P = G.player;
  if (!o) return;
  const near = P.dying <= 0 && dist(P.x, P.y, o.x, o.y) < P.r + 22;
  if (!near) { setArmed14(o, true); return; }
  if (!armed14(o)) return;
  setArmed14(o, false);
  if (o.done) { UI.banner('Klaar', 'One cut per visit. It looks great. Really.'); return; }
  if (curateleBlock9(null)) return;
  const cost = cutCost9();
  if (G.run.coins < cost) { UI.banner('Not enough coins', `A cut costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); return; }
  G.run.coins -= cost; Meta.add('spent', cost); Meta.add('haircuts');
  o.done = true; o.snipT = 1.2;
  floatText(o.x, o.y - 30, `-${cost}`, '#ffd84a');
  Sfx.snip(); setTimeout(() => Sfx.snip(), 260);
  for (let i = 0; i < 14; i++) addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y - 12 + rnd(-4, 4), vx: rnd(-40, 40), vy: rnd(-30, 10), r: rnd(0.8, 1.6), life: rnd(0.6, 1), col: P.char === 'pean' ? '#c89a64' : '#4a2a14', drag: 2, g: 60 });
  if (Math.random() < 0.25 && !P.downs.includes('kfail') && P.downs.length < DOWN_CAP) {
    giveDown('kfail');
    setTimeout(() => { if (G.room === room) floatText(P.x, P.y - 44, 'NIEMAND ZAG IETS', '#c8c0d8', true); }, 900);
  } else {
    const free = CUTS.filter((c) => !P.cuts.includes(c.id));
    const cut = free.length ? pick(free) : pick(CUTS);
    P.cuts.push(cut.id); recalcMods(P);
    UI.banner(`Fresh cut: ${cut.name}`, cut.desc, 'clean');
  }
}
function updateCourt9(dt, room) {
  const P = G.player;
  if (room.verdictDone || room.locked || P.dying > 0) return;
  for (const pl of room.plates9) if (dist(P.x, P.y, pl.x, pl.y) < 17) { courtVerdict9(room, pl); break; }
}
function courtVerdict9(room, pl) {
  room.verdictDone = true; pl.used = true;
  Meta.add('verdicts'); Sfx.gavel();
  const P = G.player, r = Math.random();
  floatText(pl.x, pl.y - 30, pl.side === 'eiser' ? 'EISER' : 'GEDAAGDE', '#ffd27a', true);
  const bx = RW / 2, by = RH * 0.42 + 30;
  if (pl.side === 'eiser') {
    if (r < 0.4) { spawnItem(room, bx, by, 0.35); UI.banner('Toegewezen', 'The court rules in your favour. Take what you are owed.', 'legend'); }
    else if (r < 0.75) { dropCoins(room, pl.x, pl.y - 24, 10); UI.banner('Schadevergoeding', 'Ten coins in damages.'); Sfx.register(); }
    else { giveCurse(pickCurse()); UI.banner('Afgewezen', 'The claim is denied. And it costs you.', 'curse'); }
  } else {
    if (r < 0.5) { if (!cleanseOne(P, 'Vrijspraak. Not guilty of anything.')) { P.heal(2); UI.banner('Vrijspraak', 'Not guilty. You feel lighter.', 'clean'); } }
    else if (r < 0.8) { P.heal(2); dropCoins(room, pl.x, pl.y - 24, 4); UI.banner('Schikking', 'A settlement: a snack and four coins.'); }
    else {
      room.taak = true;
      const L = G.levelDef, pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar, used = new Set();
      room.locked = true; room.doorCl = 0; Sfx.doorShut();
      for (let i = 0; i < 3; i++) { const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c); room.snakes.push(new Snake(pick(pool), cell.x, cell.y, { delay: 0.4 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) })); }
      UI.banner('Taakstraf', 'Community service. Clean up these three.', 'curse');
    }
  }
}
function info9(room, P) {
  const money = (c) => [`${c} coins. You have ${G.run.coins}.`, G.run.coins >= c ? '#ffe7a0' : '#ff8a7a'];
  for (const o of room.pumps9 || []) {
    if (!o.offer || dist(P.x, P.y, o.x, o.y) > 70) continue;
    const p = PUMP_BY_ID[o.offer];
    return { key: o, x: o.x, y: o.y - 22, title: p.name, tag: 'PUMP', tagCol: '#4ac05a', body: o.used ? 'This pump is empty.' : p.desc, notes: o.used ? [] : [money(pumpCost9(o)), ['Walk into the pump to tank. It stays for the whole run.', '#b7a89a']] };
  }
  const till = room.till9;
  if (till && dist(P.x, P.y, till.x + T * 0.5, till.y) < 80) return { key: till, x: till.x + T * 0.5, y: till.y - 18, title: 'De kassa', tag: 'SELL', tagCol: '#ffd27a', body: 'Walk up to the till to sell powerups for coins. Fair prices, not generous ones.', notes: [] };
  const ch = room.chair9;
  if (ch && dist(P.x, P.y, ch.x, ch.y) < 76) return { key: ch, x: ch.x, y: ch.y - 22, title: 'De kappersstoel', tag: 'KAPPER', tagCol: '#e8e2d0', body: ch.done ? 'You had your cut. It looks great. Really.' : 'A fresh cut makes you a little better, for good. One in four is a kappersfail.', notes: ch.done ? [] : [money(cutCost9())] };
  if (!room.verdictDone) for (const pl of room.plates9 || []) {
    if (dist(P.x, P.y, pl.x, pl.y) > 64) continue;
    const e = pl.side === 'eiser';
    return { key: pl, x: pl.x, y: pl.y - 16, title: e ? 'Eiser' : 'Gedaagde', tag: 'RECHTBANK', tagCol: '#d8b46a', body: e ? 'Sue for it. 40 percent a good powerup, 35 percent ten coins, 25 percent a curse.' : 'Defend yourself. 50 percent you walk free and wash something off, 30 percent a settlement, 20 percent community service.', notes: [['Step onto the plate. The other side closes.', '#b7a89a']] };
  }
  return null;
}

