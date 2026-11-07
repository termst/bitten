/* src/39-v10-rooms.js: v10 rooms: Clini-Clown HQ, quiet room, Kelderspook. From v10. Lines 19848 to 20464 of the v13.7 script. */
/* =====================================================================
   Version 10 rooms: Clini-Clown HQ, the quiet room, Het Kelderspook
   behind the cracked wall, Jaude, and the floor hazards
   ===================================================================== */
const TPL10 = {
  clownhq: [
    ['...........', '.==.....==.', '...........', '..[.....[..', '...........', '..[.....[..', '...........', '.==.....==.', '...........'],
    ['=.=.....=.=', '...........', '...........', '...=...=...', '...........', '...=...=...', '...........', '...........', '=.=.....=.='],
    ['...........', '.=.=...=.=.', '...........', '...........', '....[.[....', '...........', '...........', '.=.=...=.=.', '...........'],
    ['[.........[', '..==...==..', '...........', '...........', '...........', '...........', '...........', '..==...==..', '[.........['],
  ],
  quiet: ['...........', '...........', '...........', '...........', '.....@.....', '...........', '...........', '...........', '...........'],
  spook: ['u.........u', '...u...u...', '..#.....#..', '..u.....u..', '...........', '..u.....u..', '..#.....#..', '...u...u...', 'u.........u'],
};
const HQ_POSTERS10 = ['OBEY THE HONK', 'LACHEN IS VERPLICHT', 'ER IS GEEN ONTSNAPPING', 'SMILE OR ELSE', 'VOLG DE NEUS', 'WIJ ZIJN DE ZORG NU', 'DE DOKTER IS EEN CLOWN', 'HONK IF YOU ARE SCARED', 'HAHAHAHAHA', 'NIEMAND GAAT NAAR HUIS'];
const JAUDE10 = { p: 0.009 };

/* ------------------------------------------------------------------ making a floor: the new rooms */
function hang10(rooms, grid, key, rng, type, cb) {
  const hs = shuffle(rooms.filter((r) => r.type === 'fight' && r.dist >= 1), rng);
  for (const h of hs) {
    const sides = shuffle(Object.keys(DOORV).filter((k) => !h.doors[k] && !grid.has(key(h.gx + DOORV[k][0], h.gy + DOORV[k][1])) && !(h.secretLink && h.secretLink.k === k) && !(h.hellLink && h.hellLink.k === k)), rng);
    if (!sides.length) continue;
    const k = sides[0];
    const nr = new Room(h.gx + DOORV[k][0], h.gy + DOORV[k][1], rooms.length);
    nr.type = type; nr.dist = h.dist + 1;
    nr.doors[OPP[k]] = h; h.doors[k] = nr;
    cb(nr, h, k);
    rooms.push(nr); grid.set(key(nr.gx, nr.gy), nr);
    return nr;
  }
  return null;
}
function setupHQ10(r, rng) {
  r.sconces = [];
  r.tubes = [{ x: RW / 2, y: RH * 0.27, w: 150, ph: rng() * 10, broken: rng() < 0.6 }, { x: RW / 2, y: RH * 0.73, w: 150, ph: rng() * 10, broken: rng() < 0.4 }];
  r.hq10 = { tint: Math.floor(rng() * 3), posters: [], n: [4, 6, 8][Math.floor(rng() * 3)] };
  const spots = shuffle([['n', 0.18], ['n', 0.82], ['s', 0.2], ['s', 0.8], ['w', 0.22], ['w', 0.78], ['e', 0.22], ['e', 0.78]], rng);
  const np = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < np; i++) r.hq10.posters.push({ side: spots[i][0], u: spots[i][1], txt: HQ_POSTERS10[Math.floor(rng() * HQ_POSTERS10.length)], seed: rng() });
}
function setupQuiet10(r) { r.sconces = []; r.tubes = null; r.cleared = true; }
{
  const pe0 = placeExtras9;
  placeExtras9 = function (rooms, grid, key, rng, def, tier) {
    pe0(rooms, grid, key, rng, def, tier);
    for (const r of rooms) if (r.type === 'boss' && BOSS_TPL10[def.boss]) prepBossRoom10(r, def.boss, def);
    if (def.rush || G.mode === 'story') return;
    const fl = G.levelIdx || 0;
    // behind some cracked walls lives something other than the Rot Eater
    const sec = rooms.find((r) => r.type === 'secret');
    if (sec && rng() < (fl >= 1 ? 0.38 : 0.2)) { sec.spook10 = true; sec.build(TPL10.spook, def); }
    if (fl >= 1 && rng() < (def.chaos ? 0.6 : 0.35)) hang10(rooms, grid, key, rng, 'clownhq', (nr) => {
      nr.build(TPL10.clownhq[Math.floor(rng() * TPL10.clownhq.length)], def, { rng, fx: rng() < 0.5, fy: rng() < 0.5 });
      nr.cleared = false; setupHQ10(nr, rng);
    });
    if (rng() < (def.chaos ? 0.4 : 0.25)) hang10(rooms, grid, key, rng, 'quiet', (nr) => { nr.build(TPL10.quiet, def); setupQuiet10(nr); });
  };
  const cr9 = chaosRoom9;
  chaosRoom9 = function (r, t, def, rng) {
    if (t === 'clownhq') { resetRoom9(r); r.type = 'clownhq'; r.build(pick(TPL10.clownhq), def, { rng, fx: rng() < 0.5, fy: rng() < 0.5 }); r.cleared = false; setupHQ10(r, rng); return; }
    if (t === 'quiet') { resetRoom9(r); r.type = 'quiet'; r.build(TPL10.quiet, def); setupQuiet10(r); return; }
    return cr9(r, t, def, rng);
  };
  CHAOS_ROOMS9.push('clownhq', 'clownhq', 'quiet');
}
function secretStart10(room, entry) {
  if (room.spook10) { spawnBoss10(room, 'spook', entry, 'A secret room'); return; }
  Game.startCombat(room);
  const sn = room.snakes.find((s) => s.kind === 'rotter'), rv = sn ? sn.rv || 0 : 0;
  const sub = ['Shoot the rotten apples before it eats them.', 'Bloated. Seeds bounce off it while it eats. Shoot the rotten apples first.',
    'A hive. Every rotten apple it eats hatches more of them.', 'Ancient. It travels under the floor and heals while it eats.'][rv];
  UI.card('A secret room', sn ? sn.displayName || 'The Rot Eater' : 'The Rot Eater', sub, 'boss', 3);
  setTimeout(() => Story.chat('secret', true), 3200);
}

/* ------------------------------------------------------------------ Clini-Clown HQ */
{
  const er9 = enterRoom9;
  enterRoom9 = function (room, entry) {
    er9(room, entry);
    if (room.type === 'clownhq' && !room.cleared && !room.fought) { room.fought = true; startHQ10(room, entry); }
    else if (room.type === 'quiet' && !room.seen) { room.seen = true; UI.card('', 'De Prikkelarme Kamer', 'A quiet room. Lie still on the beanbag for a moment: it heals, and it washes one downgrade off.', '', 3.2); }
  };
}
function startHQ10(room, entry) {
  const P = G.player;
  room.locked = true; room.doorCl = 0; Sfx.doorShut();
  const n = room.hq10 ? room.hq10.n : 6, killers = n === 8 ? 1 : n === 6 ? 2 : 3;
  const kinds = [];
  for (let i = 0; i < n; i++) kinds.push('clown');
  for (let i = 0; i < killers; i++) kinds.splice(Math.round(((i + 1) * kinds.length) / (killers + 1)), 0, 'killerclown');
  const v = DOORV[entry || 's'] || [0, 1], used = new Set();
  kinds.forEach((k, i) => {
    const u = (i + 0.5) / kinds.length;
    let x, y;
    if (v[1] !== 0) { x = 26 + u * (RW - 52); y = v[1] > 0 ? T * 1.1 : RH - T * 1.1; }
    else { y = 26 + u * (RH - 52); x = v[0] > 0 ? T * 1.1 : RW - T * 1.1; }
    const f = nearestFreeCell(room, x, y, (c, r) => used.has(r * COLS + c));
    used.add(f.r * COLS + f.c);
    room.snakes.push(new Snake(k, f.x, f.y, { delay: 0.7 + i * 0.12, ang: Math.atan2(P.y - f.y, P.x - f.x), emerge: false, spawnTime: 0.5 }));
  });
  room.hqT10 = 0; room.hqSpawn10 = 1.5;
  UI.card('A hidden room', 'Clini-Clown HQ', 'The clowns took over the hospital. They want you to smile.', 'boss', 3.2);
  Sfx.horn10(); setTimeout(() => { if (G.room === room) Sfx.giggle10(); }, 700);
}
function updateHQ10(dt, room, frozen) {
  if (!room.locked || room.cleared || frozen) return;
  room.hqT10 += dt;
  const rate = Math.min(1.6, 0.35 + room.hqT10 * 0.03);
  room.hqSpawn10 -= dt * rate;
  const F = fx10(room);
  if (room.hqSpawn10 <= 0 && F.balloons.length < 28) {
    room.hqSpawn10 = rnd(0.7, 1.3);
    const side = rndi(0, 3);
    const x = side < 2 ? rnd(30, RW - 30) : side === 2 ? 8 : RW - 8, y = side >= 2 ? rnd(30, RH - 30) : side === 0 ? 8 : RH - 8;
    const a = Math.atan2(RH / 2 - y, RW / 2 - x) + rnd(-0.5, 0.5), sp = rnd(90, 150);
    F.balloons.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, life: rnd(6, 8), r: 8, col: pick(BALLOON_COLS10), seed: rnd(10), hostile: true });
  }
}
function hqReward10(room) {
  const P = G.player, good = Math.random() < 0.5;
  room.hqFlip10 = { t: 0, good, x: RW / 2, y: RH / 2 - 10 };
  Meta.add('clownHQ');
  setTimeout(() => {
    if (!G.player || G.player !== P || G.state === 'menu') return;
    if (good) {
      spawnItem(room, RW / 2, RH / 2 - 10, 0.12);
      UI.banner('TADA', 'The clowns left you a present. No strings attached. Probably.', 'legend');
      Sfx.horn10();
    } else {
      P.maxHp = Math.max(2, P.maxHp - 1); P.hp = Math.min(P.hp, P.maxHp); fixBites(P);
      UI.banner('HAHA', 'The joke is on you: half an apple of health, gone for good.', 'curse');
      Sfx.giggle10(); G.hurtFlash = 0.3;
      if (G.room === room) floatText(P.x, P.y - 30, '-1/2', '#ff5a7a', true);
    }
  }, 1500);
}

/* ------------------------------------------------------------------ the quiet room */
function updateQuiet10(dt, room) {
  const P = G.player;
  for (const b of room.beanbags10 || []) {
    if (b.used) continue;
    const on = P.dying <= 0 && dist(P.x, P.y, b.x, b.y) < 18;
    if (on && P.stillT > 0.2) b.rest += dt; else b.rest = Math.max(0, b.rest - dt * 2);
    if (b.rest >= 2) {
      b.used = true;
      P.heal(2); Meta.add('rests');
      if (P.downs.length) { const id = P.downs[0]; removeThing(P, id, 'down'); UI.banner(`Washed off: ${DOWNS[id].name}`, 'A quiet moment. Everything is a little lighter.', 'clean'); Sfx.cleanse(); }
      else UI.banner('Rested', 'A quiet moment. That helped.', 'clean');
      floatText(b.x, b.y - 26, 'RUST', '#c8b8ff', true);
      burst(b.x, b.y, 14, '#c8b8ff', { kind: 'bubble', min: 20, max: 70, lmin: 0.5, lmax: 1 });
    }
  }
}

/* ------------------------------------------------------------------ Jaude */
function jaudeChance10(room) {
  if (room.type !== 'fight' || G.mode === 'story' || rushy() || !G.run || G.run.jaude10) return false;
  if ((G.levelIdx || 0) < 1) return false;
  return Math.random() < JAUDE10.p;
}
function startJaude10(room) {
  const P = G.player;
  room.locked = true; room.doorCl = 0; Sfx.doorShut(); G.shake = Math.max(G.shake, 5);
  const ks = Object.keys(room.doors), k = ks.length ? pick(ks) : 'n', v = DOORV[k];
  const x0 = RW / 2 + v[0] * (RW / 2 + 12), y0 = RH / 2 + v[1] * (RH / 2 + 12);
  const f = nearestFreeCell(room, lerp(RW / 2, P.x, 0.4) + v[0] * 40, lerp(RH / 2, P.y, 0.4) + v[1] * 30);
  room.jaude10 = { phase: 'enter', t: 0, x: x0, y: y0, tx: f.x, ty: f.y, door: k, say: 'SSST.', sayT: 3, plates: null, slams: 0, lost: 0, loseMax: rndi(1, 2), len: rnd(5, 10), mad: 1, armed: false };
  Meta.add('jaudeMet');
  UI.card('', 'Jaude', 'Your sister. Blond and ginger, glasses on. You woke her up.', 'boss', 2.8);
}
function jaudeSay10(J, txt, dur = 2.6) { J.say = txt; J.sayT = dur; }
function updateJaude10(dt, room) {
  const J = room.jaude10, P = G.player;
  if (!J || J.phase === 'done') return;
  J.t += dt; if (J.sayT > 0) J.sayT -= dt;
  if (J.phase === 'enter') {
    const d = dist(J.x, J.y, J.tx, J.ty), sp = 110 * dt;
    if (d > sp) { J.x += ((J.tx - J.x) / d) * sp; J.y += ((J.ty - J.y) / d) * sp; J.step = (J.step || 0) + dt * 10; }
    else {
      J.x = J.tx; J.y = J.ty; J.phase = 'talk'; J.t = 0;
      jaudeSay10(J, 'Some of us are trying to SLEEP.', 3.4);
      const away = (x, y, o) => (c, r) => { const cx = (c + 0.5) * T, cy = (r + 0.5) * T; return dist(cx, cy, J.x, J.y) < 44 || dist(cx, cy, P.x, P.y) < 30 || (o && dist(cx, cy, o.x, o.y) < 60); };
      const a = nearestFreeCell(room, RW / 2 - 80, RH / 2 + 60, away()), b = nearestFreeCell(room, RW / 2 + 80, RH / 2 + 60, away(0, 0, a));
      J.plates = [{ x: a.x, y: a.y, kind: 'fight' }, { x: b.x, y: b.y, kind: 'sorry' }];
      J.armed = !J.plates.some((p) => dist(P.x, P.y, p.x, p.y) < 20);
      setTimeout(() => { if (G.room === room && J.phase === 'talk') UI.banner('Jaude is awake', 'Fight her: every bite stays for good. Say sorry: she yells, you lose a bite or two.'); }, 1200);
    }
    return;
  }
  if (J.phase === 'talk') {
    if (!J.plates || P.dying > 0) return;
    const on = J.plates.find((p) => dist(P.x, P.y, p.x, p.y) < 17);
    if (!on) { J.armed = true; return; }
    if (!J.armed || J.t < 0.8) return;
    J.plates = null;
    if (on.kind === 'fight') {
      J.phase = 'fight'; jaudeSay10(J, 'OKAY. You asked for it.', 2.4);
      const sn = new Snake('jaude', J.x, J.y, { emerge: false, spawnTime: 0.45, ang: Math.atan2(P.y - J.y, P.x - J.x) });
      sn.maxHp = sn.hp = KINDS.jaude.hp * (G.levelDef.bossMult || 1) * (1 + 0.12 * (G.levelIdx || 0)) * enemyPowerK(G.player);
      sn.delay = 0.3;
      room.snakes.push(sn); G.boss = sn; G.run.bossHits0 = G.run.hits || 0; J.boss = sn;
      Sfx.stinger(); UI.card('A small boss', 'Jaude', 'Every bite she gets in stays for good.', 'boss', 2.4);
    } else {
      J.phase = 'sorry'; J.t = 0; J.slamT = 0.6;
      jaudeSay10(J, 'SORRY is not ENOUGH.', 2.4);
      Meta.add('jaudeSorry');
    }
    return;
  }
  if (J.phase === 'fight') {
    const sn = J.boss;
    if (sn && sn.alive) { J.x = sn.x; J.y = sn.y; }
    return;
  }
  if (J.phase === 'sorry') {
    J.slamT -= dt; J.step = (J.step || 0) + dt * 18;
    if (J.slamT <= 0 && J.t < J.len) {
      J.slamT = rnd(0.6, 0.95); J.slams++;
      G.shake = Math.max(G.shake, REDUCED ? 3 : 8); Sfx.thud(); if (J.slams % 2) Sfx.doorShut();
      const side = rndi(0, 3), x = side < 2 ? rnd(20, RW - 20) : side === 2 ? 4 : RW - 4, y = side >= 2 ? rnd(20, RH - 20) : side === 0 ? 4 : RH - 4;
      floatText(x, y, pick(['BAM', 'BONK', 'SLAM', 'STIL!']), '#ff8ab0', true);
      burst(x, y, 10, G.levelDef.wallHi || '#8a7a6a', { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.6 });
      if (J.lost < J.loseMax && (J.slams === 2 || J.slams === 5 || J.t > J.len - 1.2)) {
        if (P.hp > 1) {
          P.hp -= 1; P.bites.push({ a: BITE_ANGLES[P.bites.length % BITE_ANGLES.length], t: G.t });
          P.hurtT = 0.4; P.squash = 1; G.hurtFlash = 0.3; Sfx.crunch();
          floatText(P.x, P.y - 28, 'AU', '#ff8ab0');
        }
        J.lost++;
      }
      if (Math.random() < 0.5) jaudeSay10(J, pick(['STIL!', 'IK SLAAP!', 'GA WEG!', 'WAAROM?!', 'ZACHTJES!']), 0.9);
    }
    if (J.t >= J.len) { J.phase = 'leave'; J.t = 0; jaudeSay10(J, '...fine. Goodnight.', 2.6); J.tx = RW / 2 + DOORV[J.door][0] * (RW / 2 + 16); J.ty = RH / 2 + DOORV[J.door][1] * (RH / 2 + 16); }
    return;
  }
  if (J.phase === 'leave') {
    const d = dist(J.x, J.y, J.tx, J.ty), sp = 90 * dt;
    if (J.t > 1.2) { if (d > sp) { J.x += ((J.tx - J.x) / d) * sp; J.y += ((J.ty - J.y) / d) * sp; J.step = (J.step || 0) + dt * 10; } else J.out = true; }
    if (J.out || J.t > 8) {
      J.phase = 'done'; room.locked = false; Sfx.doorOpen();
      UI.card('', 'She went back to bed', 'Quietly, this time.', '', 2);
    }
  }
}
function jaudeWon10(room) {
  const J = room.jaude10;
  J.phase = 'done';
  room.locked = false; Sfx.doorOpen();
  spawnItem(room, RW / 2, RH / 2 - 10, 0.3);
  dropHeart(room, RW / 2 - 46, RH / 2 + 26, 1);
  UI.card('', 'Stand up for yourself', 'She stomped back to bed. You did not back down.', 'legend', 2.6);
}
// bites from Jaude stay for good
function jaudeBite10(P, lost) {
  const room = G.room, J = room && room.jaude10;
  if (!J || J.phase !== 'fight' || lost <= 0 || P.hp <= 0) return;
  P.maxHp = Math.max(2, P.maxHp - lost); P.hp = Math.min(P.hp, P.maxHp); fixBites(P);
  floatText(P.x, P.y - 40, 'GONE FOR GOOD', '#ff8ab0', true);
}

/* ------------------------------------------------------------------ rooms clearing */
{
  const cr0 = Game.clearRoom;
  Game.clearRoom = function (room) {
    const J = room.jaude10;
    if (J && J.phase !== 'done') { if (J.phase === 'fight') jaudeWon10(room); return; }
    return cr0.call(this, room);
  };
  const c9 = clearRoom9;
  clearRoom9 = function (room) {
    c9(room);
    const P = G.player, clean = !G.run.roomHits;
    if (room.type === 'clownhq') hqReward10(room);
    if (room.mod === 'collapse' || room.chasm10) Meta.add('gapRooms');
    if (room.spook10 && room.type === 'secret') { dropCoins(room, RW / 2 + 40, RH / 2 + 20, 4); dropHeart(room, RW / 2 - 40, RH / 2 + 20, 2); }
    if (P.deken && room.type !== 'boss' && clean) { P.dekenN++; if (P.dekenN % 2 === 0 && P.heal(1)) floatText(P.x, P.y - 30, 'DEKEN +1', '#c8b8ff'); }
    room.gas10 = null; room.smog10 = false; room.scareAt10 = 0;
    if (room.fx10) { room.fx10.balloons.length = 0; room.fx10.ads.length = 0; room.fx10.zones = room.fx10.zones.filter((z) => z.kind === 'smoke'); room.fx10.carts.length = 0; room.fx10.warns.length = 0; }
    if (jaudeChance10(room)) {
      G.run.jaude10 = true;
      setTimeout(() => { if (G.room === room && G.state === 'play' && !G.trans && !room.jaude10) startJaude10(room); else if (G.run) G.run.jaude10 = false; }, 1500);
    }
  };
}

/* ------------------------------------------------------------------ fights starting: hazards, rage, a clown behind you */
{
  const cb0 = combat9;
  combat9 = function (room) {
    cb0(room);
    const P = G.player;
    room.fightT10 = 0; room.shots10 = 0;
    if (room.type !== 'fight') return;
    if (room.mod === 'rails' && !(room.rails10 && room.rails10.length)) addRails10(room);
    if (room.mod === 'gas') room.gas10 = { t: 0, ix: 0, iy: 0, tick: 0 };
    if (room.mod === 'smog') room.smog10 = true;
    if (room.mod === 'sparks') room.sparkT10 = 2.2;
    if (room.mod === 'rails') room.railT10 = rnd(2.5, 4);
    rageCheck10(room);
    const pScare = P.flags.clownbait ? 0.12 : 0.015;
    if (Math.random() < pScare) room.scareAt10 = G.t + rnd(3, 12);
  };
}
function addRails10(room) {
  const rows = [2, 6, 4, 1, 7, 3, 5];
  for (const r of rows) {
    let free = true;
    for (let c = 0; c < COLS; c++) if (room.solid(c, r)) { free = false; break; }
    if (!free) continue;
    for (let c = 0; c < COLS; c++) room.rails10.push({ c, r });
    room.dirty = true;
    return true;
  }
  room.mod = null;
  return false;
}
function rageCheck10(room) {
  const P = G.player, run = G.run, f = G.levelIdx || 0;
  if (room.rageDone10 || G.mode === 'story') return;
  const k = P.flags.rage ? 3 : 1;
  let kind = null, why = 'GRRR';
  if ((run.rageKills || 0) >= 4 && !run.reus10 && Math.random() < 0.3) { kind = 'rage3'; run.reus10 = true; why = 'DE REUS'; }
  else if (P.curses.length >= 3 && Math.random() < 0.1 * k) { kind = 'rage3'; why = 'DE REUS'; }
  else if (f >= 2 && Math.random() < 0.015 * k) kind = 'rage2';
  else if (f >= 1 && Math.random() < 0.03 * k) kind = 'rage1';
  else if (Math.random() < 0.008 * k) kind = 'rage1';
  if (kind) spawnRage10(room, kind, why);
}

/* ------------------------------------------------------------------ every frame */
{
  const ur9 = updateRoom9;
  updateRoom9 = function (dt, room, frozen) { ur9(dt, room, frozen); updateRoom10(dt, room, frozen); };
}
function updateRoom10(dt, room, frozen) {
  const P = G.player, F = room.fx10;
  const fight = fighting10(room);
  if (F) {
    if (!frozen) { updateBalloons10(dt, room); updateWarns10(dt, room); updateLobs10(dt, room); updateAds10(dt, room); updateCarts10(dt, room); }
    updateZones10(dt, room);
  }
  if (room.type === 'clownhq') updateHQ10(dt, room, frozen);
  if (room.type === 'quiet') updateQuiet10(dt, room);
  if (room.jaude10) updateJaude10(dt, room);
  if (room.hqFlip10) { room.hqFlip10.t += dt; if (room.hqFlip10.t > 3) room.hqFlip10 = null; }
  updatePick10(dt, room);
  if (fight && !frozen) {
    room.fightT10 = (room.fightT10 || 0) + dt;
    if (room.mod === 'sparks') sparks10(dt, room);
    if (room.gas10) gasRing10(dt, room);
    if (room.mod === 'rails' && room.rails10.length) { room.railT10 -= dt; if (room.railT10 <= 0) { room.railT10 = rnd(6.5, 9); draisine10(room); } }
    if (room.smog10 && Math.random() < dt * 5) addP({ kind: 'dot', x: rnd(RW), y: rnd(RH), vx: rnd(-8, 8), vy: rnd(-6, 6), r: rnd(10, 22), life: rnd(2, 3.4), col: 'rgba(150,146,140,0.05)', drag: 0 });
    if (room.scareAt10 && G.t >= room.scareAt10 && P.dying <= 0) { room.scareAt10 = 0; jumpScare10(room); }
    if (room.type === 'fight' && !room.rageDone10 && G.mode !== 'story') {
      if (room.fightT10 > 50) spawnRage10(room, (G.levelIdx || 0) >= 2 ? 'rage2' : 'rage1', 'TOO SLOW');
      else if ((room.shots10 || 0) > 220) spawnRage10(room, 'rage1', 'TOO LOUD');
    }
  }
  if (G.scare10) { G.scare10.t += dt; if (G.scare10.t > G.scare10.dur) G.scare10 = null; }
  craters10(dt, room);
  for (const b of room.bushes10 || []) if (b.rustle > 0) b.rustle -= dt;
}
function craters10(dt, room) {
  for (const o of room.obs.slice()) {
    if (!o.crater10) continue;
    o.crater10 -= dt;
    if (o.crater10 > 0) continue;
    room.removeObstacle(o); room.dirty = true;
    burst(o.x, o.y, 10, G.levelDef.dirt || '#3a3028', { min: 20, max: 70, lmin: 0.3, lmax: 0.6 });
  }
}
function updateWarns10(dt, room) {
  const W = room.fx10.warns, P = G.player;
  for (let i = W.length - 1; i >= 0; i--) {
    const w = W[i]; w.t += dt;
    if (w.beam) {
      if (w.t < w.warn) continue;
      if (!w.fired) { w.fired = true; Sfx.zap(); G.shake = Math.max(G.shake, 4); }
      const c0 = (w.pos + 0.5) * T, half = T * 0.5 * (w.w || 1);
      const inside = w.horiz ? Math.abs(P.y - c0) < half + P.r * 0.4 : Math.abs(P.x - c0) < half + P.r * 0.4;
      if (inside && P.dying <= 0 && !w.hit && P.hurt(1, w.horiz ? P.x : c0, w.horiz ? c0 : P.y)) w.hit = true;
      if (w.t >= w.warn + w.on) W.splice(i, 1);
      continue;
    }
    if (w.t >= w.warn) { W.splice(i, 1); if (w.fire) w.fire(w); }
  }
}
function updateLobs10(dt, room) {
  const Ls = room.fx10.lobs;
  for (let i = Ls.length - 1; i >= 0; i--) { const l = Ls[i]; l.t += dt; l.rot += dt * 8; if (l.t >= l.dur) { Ls.splice(i, 1); if (l.land) l.land(l); } }
}
function updateZones10(dt, room) {
  const Z = room.fx10.zones, P = G.player;
  for (let i = Z.length - 1; i >= 0; i--) {
    const z = Z[i]; z.t += dt;
    if (z.t > z.life) { Z.splice(i, 1); continue; }
    z.r = Math.min(z.rMax || 60, z.r + dt * 70);
    if (z.vx) { z.x = clamp(z.x + z.vx * dt, 20, RW - 20); z.y = clamp(z.y + z.vy * dt, 20, RH - 20); }
    if (z.kind === 'gas') {
      z.tick = (z.tick || 0) - dt;
      if (z.tick <= 0 && P.dying <= 0 && !P.gasmask && dist(P.x, P.y, z.x, z.y) < z.r * 0.85) { z.tick = 1.1; P.hurt(1, z.x, z.y); }
    } else if (z.kind === 'smoke') {
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && !sn.isBoss && dist2(sn.x, sn.y, z.x, z.y) < z.r * z.r) sn.daze = Math.max(sn.daze, 0.5);
    }
  }
}
function updateAds10(dt, room) {
  const A = room.fx10.ads, P = G.player;
  for (let i = A.length - 1; i >= 0; i--) {
    const a = A[i]; a.t += dt;
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2;
    if (a.t > a.life) { A.splice(i, 1); burst(cx, cy, 8, a.col, { kind: 'shard', min: 30, max: 90, lmin: 0.3, lmax: 0.5 }); continue; }
    for (let j = G.seeds.length - 1; j >= 0 && a.hp > 0; j--) {
      const s = G.seeds[j];
      if (s.x < a.x || s.x > a.x + a.w || s.y < a.y || s.y > a.y + a.h) continue;
      if (!s.pierce) G.seeds.splice(j, 1);
      a.hp -= 1; a.flash = 0.08;
    }
    if (a.hp <= 0) {
      A.splice(i, 1);
      burst(cx, cy, 14, a.col, { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.6 });
      floatText(cx, cy - 10, 'WEGGEKLIKT', '#e8f2ff'); Sfx.clank(); Meta.add('adsClosed');
      if (Math.random() < 0.3) dropCoins(room, cx, cy, 1);
      continue;
    }
    if (a.flash > 0) a.flash -= dt;
    a.shotT -= dt;
    if (a.shotT <= 0 && a.t > 0.6 && P.dying <= 0) {
      a.shotT = rnd(1.5, 2.1);
      const v = spawnVenom(cx, cy, Math.atan2(P.y - cy, P.x - cx), G.levelDef.venomSpeed * 0.8, '#ffd23a'); v.kind = 'coupon10'; v.r = 6;
    }
  }
}
function updateCarts10(dt, room) {
  const C = room.fx10.carts, P = G.player;
  for (let i = C.length - 1; i >= 0; i--) {
    const k = C[i]; k.t += dt;
    if (k.t < k.warn) continue;
    if (k.x == null) { k.x = k.dir > 0 ? -40 : RW + 40; Sfx.tone(80, 0.9, { to: 60, type: 'sawtooth', vol: 0.08, lp: 400 }); Sfx.noise(0.9, { f: 800, fTo: 300, vol: 0.06 }); }
    k.x += k.dir * 520 * dt;
    const y = (k.row + 0.5) * T;
    if (P.dying <= 0 && !k.hitP && Math.abs(P.y - y) < 14 + P.r * 0.6 && Math.abs(P.x - k.x) < 26 + P.r * 0.5) {
      if (P.hurt(G.levelDef.hard ? 2 : 1, k.x - k.dir * 30, y)) { k.hitP = true; P.kby += (P.y < y ? -1 : 1) * 260; floatText(P.x, P.y - 30, 'TOET', '#e8e2d0', true); }
    }
    for (const sn of room.snakes) if (sn.canBeHit() && !sn.isBoss && !k.hit.has(sn) && sn.hitTest(k.x, y, 18)) { k.hit.add(sn); sn.hurt(4, k.x, y); sn.stagger = Math.max(sn.stagger, 0.5); }
    if (Math.random() < dt * 40) addP({ kind: 'dot', x: k.x - k.dir * 18, y: y + rnd(-10, 10), vx: -k.dir * rnd(40, 120), vy: rnd(-60, -10), r: rnd(0.8, 1.6), life: 0.3, col: '#ffd27a', glow: true, drag: 2 });
    if ((k.dir > 0 && k.x > RW + 70) || (k.dir < 0 && k.x < -70)) C.splice(i, 1);
  }
}
function sparks10(dt, room) {
  room.sparkT10 = (room.sparkT10 == null ? 2 : room.sparkT10) - dt;
  if (room.sparkT10 > 0) return;
  room.sparkT10 = rnd(2, 2.8);
  const P = G.player, n = 2 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    let c = 0, r = 0;
    for (let k = 0; k < 12; k++) { c = clamp(Math.floor(P.x / T) + rndi(-2, 2), 0, COLS - 1); r = clamp(Math.floor(P.y / T) + rndi(-2, 2), 0, ROWS - 1); if (!room.solid(c, r)) break; }
    if (room.solid(c, r)) continue;
    warn10(room, (c + 0.5) * T, (r + 0.5) * T, T * 0.5, 0.95 + i * 0.1, (w) => {
      const Q = G.player;
      if (Q.dying <= 0 && Math.abs(Q.x - w.x) < T / 2 + Q.r * 0.3 && Math.abs(Q.y - w.y) < T / 2 + Q.r * 0.3) Q.hurt(1, w.x, w.y);
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.isBoss && sn.hitTest(w.x, w.y, T * 0.4)) sn.hurt(2, w.x, w.y);
      for (let j = 0; j < 4; j++) addP({ kind: 'zap', x: w.x + rnd(-14, 14), y: w.y + rnd(-14, 14), x2: w.x + rnd(-18, 18), y2: w.y + rnd(-18, 18), vx: 0, vy: 0, r: 1, life: 0.22, col: '#7ad0ff', glow: true, drag: 0, seed: rnd(100) });
      flashLight(w.x, w.y, 50, 0.6, 0.2); Sfx.zap();
    }, '#7ad0ff', { square: true });
  }
}
function gasRing10(dt, room) {
  const g = room.gas10, P = G.player;
  g.t += dt;
  const u = clamp((g.t - 9) / 39, 0, 1);
  g.ix = u * (RW / 2 - T * 2.6); g.iy = u * (RH / 2 - T * 1.8);
  if (u > 0 && !g.said) { g.said = true; UI.banner('The gas is coming', 'It closes in from the walls. Stay in the middle.', 'curse'); }
  g.tick -= dt;
  const out = P.x < g.ix || P.x > RW - g.ix || P.y < g.iy || P.y > RH - g.iy;
  if (out && g.tick <= 0 && P.dying <= 0 && !P.gasmask) { g.tick = 1.2; P.hurt(1, P.x + (P.x - RW / 2) * 0.3, P.y + (P.y - RH / 2) * 0.3); }
}
function updatePick10(dt, room) {
  const P = G.player;
  for (let i = room.pickups.length - 1; i >= 0; i--) {
    const p = room.pickups[i];
    if (p.kind !== 'tulip10' && p.kind !== 'cube10') continue;
    if (p.vx || p.vy) {
      p.vx = approach(p.vx, 0, 200 * dt); p.vy = approach(p.vy, 0, 200 * dt);
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      [nx, ny] = resolveTiles(room, nx, ny, 6);
      p.x = clamp(nx, 8, RW - 8); p.y = clamp(ny, 8, RH - 8);
    }
    if (p.life && p.t > p.life) { room.pickups.splice(i, 1); burst(p.x, p.y, 6, p.kind === 'cube10' ? '#5ae85a' : p.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4 }); continue; }
    if (p.t < 0.4 || P.dying > 0 || dist2(p.x, p.y, P.x, P.y) > (P.r + 8) * (P.r + 8)) continue;
    if (p.kind === 'tulip10') {
      if (P.hp >= P.maxHp) continue;
      P.heal(1); Sfx.pickup(); floatText(P.x, P.y - 26, 'TULP', p.col);
    } else {
      P.cubeN = (P.cubeN || 0) + 1; Meta.add('cubes');
      floatText(P.x, P.y - 30, `POWER CUBE ${P.cubeN}`, '#5ae85a', true); Sfx.ping();
    }
    room.pickups.splice(i, 1);
    burst(p.x, p.y, 8, p.kind === 'cube10' ? '#5ae85a' : p.col, { min: 20, max: 70, lmin: 0.3, lmax: 0.5, glow: true });
  }
}
// power cube crates on the arena floor
{
  const bo0 = breakObstacle;
  breakObstacle = function (room, o) {
    bo0(room, o);
    if (o.type === 'urn' && G.levelDef && G.levelDef.urnStyle === 'cube10' && Math.random() < 0.45) {
      const a = rnd(TAU);
      room.pickups.push({ kind: 'cube10', x: o.x, y: o.y, vx: Math.cos(a) * 50, vy: Math.sin(a) * 50, t: 0, life: 16, ph: rnd(10) });
    }
  };
}
// leaving a room: what was flying around stays behind
{
  const en0 = Game.enterRoom;
  Game.enterRoom = function (room, entry) {
    const prev = G.room;
    en0.call(this, room, entry);
    if (prev && prev !== room) {
      const F = prev.fx10;
      if (F) { F.balloons.length = 0; F.pballs.length = 0; F.lobs.length = 0; F.warns.length = 0; F.zones.length = 0; F.ads.length = 0; F.carts.length = 0; }
      prev.noise10 = null;
      if (prev.jaude10 && prev.jaude10.phase !== 'done') prev.jaude10.phase = 'done';
    }
    G.scare10 = null;
  };
}
// a flying apple does not fall when the floor goes
{
  const cc0 = collapseCell;
  collapseCell = function (room, k, onIt) { const P = G.player; return cc0(room, k, onIt && !(P && P.flyer)); };
}

/* ------------------------------------------------------------------ the dark, the lights, and what a room is called */
{
  const dk0 = darkTarget9;
  darkTarget9 = function (room, L) {
    if (room.type === 'clownhq') return room.cleared ? 0.22 : 0.36;
    if (room.type === 'quiet') return 0.52;
    if (room.lightsOut10 && G.boss && G.boss.alive) return 0.97;
    let d = dk0(room, L);
    const base = () => (room.cleared ? L.darkClear : room.mod === 'dark' ? Math.min(0.94, L.dark + 0.1) : L.dark);
    if (G.boss && G.boss.kind === 'peuk' && G.boss.alive && G.boss.hp < G.boss.maxHp * 0.4) d = Math.min(0.95, (d == null ? base() : d) + 0.14);
    if (room.smog10 && !room.cleared) d = Math.min(0.94, (d == null ? base() : d) + 0.08);
    return d;
  };
  const xl0 = extraLights;
  extraLights = function (room, light) {
    xl0(room, light);
    const t = G.t;
    if (!room.lightsOut10) for (const o of room.lamps10 || []) light(o.x, o.y - 14, 110, 0.75 + 0.05 * Math.sin(t * 17 + o.c));
    for (const sn of room.snakes) {
      if (!sn.alive || sn.burrowed) continue;
      if (sn.kind === 'tunnel') { for (let k = 1; k <= 4; k++) light(sn.x + Math.cos(sn.drawAng) * k * 45, sn.y + Math.sin(sn.drawAng) * k * 45, 30 + k * 12, 0.5); }
      else if (sn.kind === 'tvboss') light(sn.x, sn.y, 90, 0.6 * (sn.cloak == null ? 1 : sn.cloak));
      else if (sn.kind === 'leegte' && sn.mode === 'pull') light(sn.x, sn.y, 70, 0.4);
      else if (sn.kind === 'peukworm' || sn.kind === 'peuk') light(sn.x + Math.cos(sn.drawAng) * sn.headR, sn.y + Math.sin(sn.drawAng) * sn.headR, 46, 0.45);
    }
    const F = room.fx10;
    if (F) {
      for (const a of F.ads) light(a.x + a.w / 2, a.y + a.h / 2, 60, 0.5);
      for (const k of F.carts) if (k.x != null) light(k.x, (k.row + 0.5) * T, 70, 0.6);
      for (const l of F.lobs) { const u = l.t / l.dur; light(lerp(l.x0, l.x1, u), lerp(l.y0, l.y1, u), 30, 0.4); }
      for (const w of F.warns) if (!w.beam && w.col === '#7ad0ff') light(w.x, w.y, 30, 0.3 * (w.t / w.warn));
    }
    if (room.type === 'quiet') for (const b of room.beanbags10 || []) light(b.x, b.y, 120, 0.45);
    if (room.type === 'clownhq' && !room.cleared) light(RW / 2 + Math.sin(t * 1.3) * 120, RH / 2 + Math.cos(t * 0.9) * 80, 90, 0.4);
    const J = room.jaude10;
    if (J && J.phase !== 'done') light(J.x, J.y, 60, 0.5);
    if (room.hqFlip10) light(room.hqFlip10.x, room.hqFlip10.y, 90, 0.7);
    for (const p of room.pickups) if (p.kind === 'cube10' || p.kind === 'tulip10') light(p.x, p.y, 34, 0.45);
  };
  const rc0 = roomChip;
  roomChip = function (room) {
    if (!room) return null;
    const J = room.jaude10;
    if (J && J.phase !== 'done') return J.phase === 'fight' ? ['JAUDE', '#ff8ab0'] : J.phase === 'sorry' ? ['TANTRUM', '#ff8ab0'] : ['SHHH', '#ff8ab0'];
    if (room.type === 'clownhq') return room.cleared ? ['CLINI-CLOWN HQ', '#ff8ab0'] : ['HONK', '#ff3a5a'];
    if (room.type === 'quiet') return ['PRIKKELARM', '#c8b8ff'];
    if (room.type === 'secret' && room.spook10 && !room.cleared) return ['KELDERSPOOK', '#a8c8ff'];
    if (room.mod && !room.cleared && { sparks: 1, gas: 1, smog: 1, rails: 1 }[room.mod]) return [{ sparks: 'SHORT CIRCUIT', gas: 'GAS', smog: 'THICK SMOKE', rails: 'RAILS' }[room.mod], room.mod === 'gas' ? '#9ae86a' : room.mod === 'sparks' ? '#7ad0ff' : '#b7a89a'];
    return rc0(room);
  };
  const i9 = info9;
  info9 = function (room, P) {
    const J = room.jaude10;
    if (J && J.plates) for (const pl of J.plates) {
      if (dist(P.x, P.y, pl.x, pl.y) > 64) continue;
      return pl.kind === 'fight'
        ? { key: pl, x: pl.x, y: pl.y - 16, title: 'Fight her', tag: 'JAUDE', tagCol: '#ff8ab0', body: 'A small boss fight. Every bite she gets in stays: it takes half an apple of health away for good.', notes: [['Step onto the plate.', '#b7a89a']] }
        : { key: pl, x: pl.x, y: pl.y - 16, title: 'Say sorry', tag: 'JAUDE', tagCol: '#ff8ab0', body: 'She throws a tantrum for a while. You lose a bite or two, but she will never finish you off.', notes: [['Step onto the plate.', '#b7a89a']] };
    }
    for (const b of room.beanbags10 || []) {
      if (b.used || dist(P.x, P.y, b.x, b.y) > 64) continue;
      return { key: b, x: b.x, y: b.y - 18, title: 'The beanbag', tag: 'REST', tagCol: '#c8b8ff', body: 'Lie still on it for two seconds: it heals one apple and washes off your oldest downgrade. Once.', notes: [] };
    }
    return i9(room, P);
  };
  const dd0 = drawDoorway;
  drawDoorway = function (c, k, target, room, L) {
    dd0(c, k, target, room, L);
    if (target.type !== 'quiet' && room.type !== 'quiet') return;
    c.save(); doorTransform(c, k);
    for (const s of [-1, 1]) { const x = s > 0 ? DOOR_HW : -DOOR_HW - 7; rrect(c, x + 0.5, -WALL, 6, WALL + 2, 1.5); c.fillStyle = '#b8a8e8'; c.fill(); }
    c.restore();
  };
}
MINI9.clownhq = (c, mx, my, cur) => {
  const r = G.map && G.map.rooms.find((q) => q.type === 'clownhq');
  if (r && !r.visited) return;
  c.fillStyle = cur ? '#8a1a3a' : '#ff3a5a'; circle(c, mx, my, 2.6); c.fillStyle = cur ? '#ece2d4' : '#ffffff'; circle(c, mx - 1, my - 0.8, 0.7); circle(c, mx + 1, my - 0.8, 0.7);
};
MINI9.quiet = (c, mx, my, cur) => { c.fillStyle = cur ? '#4a3a7a' : '#c8b8ff'; ell(c, mx, my + 0.6, 3, 2.2); c.fill(); };

