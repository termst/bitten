/* src/33-v10-snakes.js: v10 snakes: clowns and others. From v10. Lines 17765 to 18325 of the v13.7 script. */
/* =====================================================================
   Version 10 snakes: the Clownsnake and the Killer-Clownsnake, the three
   rage worms, the new floors' worms, and four kinds of Rot Eater
   ===================================================================== */
const BALLOON_COLS10 = ['#ff3a5a', '#3a9aff', '#ffd23a', '#4ac84a', '#c45aff', '#ff8a2a', '#ff6ac0'];
Object.assign(KINDS, {
  clown: {
    name: 'Clownsnake', hp: 9, headR: 11, r0: 10, r1: 5, spacing: 7, maxLen: 11, minLen: 3, speed: 48, turn: 2.8, bite: 1,
    body: '#f4f0ea', body2: '#e8e0d4', outline: '#2a1a2a', hi: 'rgba(255,255,255,0.45)', blood: '#e83a6a', eye: '#3a8aff', nose: '#e8203a',
  },
  killerclown: {
    name: 'Killer-Clownsnake', hp: 26, headR: 14, r0: 13.5, r1: 7, spacing: 9, maxLen: 13, minLen: 4, speed: 106, turn: 3.9, bite: 1, noMound: true,
    body: '#4a2a3a', body2: '#3e2232', outline: '#0c0408', hi: 'rgba(255,200,220,0.16)', blood: '#7a0a1a', eye: '#ffe14a', nose: '#c8102a', face: '#d8d0c4',
  },
  rage1: {
    name: 'Boze Worm', hp: 24, headR: 11, r0: 11, r1: 6, spacing: 7.5, maxLen: 10, minLen: 4, speed: 72, turn: 3.2, bite: 1,
    body: '#d8643a', body2: '#c85a32', outline: '#2a0a04', hi: 'rgba(255,220,190,0.3)', vein: '#8a1a10', blood: '#7a1a0a', eye: '#ffe14a',
  },
  rage2: {
    name: 'Woedeworm', hp: 52, headR: 14, r0: 14.5, r1: 8, spacing: 9.5, maxLen: 12, minLen: 4, speed: 64, turn: 2.8, bite: 2,
    body: '#c4422a', body2: '#b23a24', outline: '#200602', hi: 'rgba(255,210,180,0.28)', vein: '#6a0a06', blood: '#6a1206', eye: '#ffd23a',
  },
  rage3: {
    name: 'De Razende Reus', hp: 150, headR: 19, r0: 20, r1: 11, spacing: 13, maxLen: 14, minLen: 5, speed: 58, turn: 2.4, bite: 2,
    body: '#a8301e', body2: '#962a1a', outline: '#180402', hi: 'rgba(255,200,170,0.25)', vein: '#4a0604', blood: '#5a0a04', eye: '#ffb43a',
  },
  stekker: {
    name: 'Stekkerworm', hp: 9, headR: 10, r0: 7, r1: 5.5, spacing: 6, maxLen: 13, minLen: 4, speed: 64, turn: 3.2, bite: 1,
    body: '#2a2c32', body2: '#24262c', outline: '#08090c', hi: 'rgba(220,230,255,0.18)', blood: '#3a8aff', eye: '#7ad0ff',
  },
  bosje: {
    name: 'Bosjesworm', hp: 8, headR: 10, r0: 9, r1: 4.5, spacing: 6.5, maxLen: 10, minLen: 3, speed: 92, turn: 4.2, bite: 1,
    body: '#3a8a3a', body2: '#327a32', outline: '#0a200a', hi: 'rgba(220,255,200,0.25)', leaf: '#5ab84a', blood: '#2a5a1a', eye: '#ffe14a',
  },
  peukworm: {
    name: 'Peukworm', hp: 11, headR: 10, r0: 9, r1: 8, spacing: 7, maxLen: 10, minLen: 3, speed: 54, turn: 2.8, bite: 1, fireproof: true,
    body: '#f2f0ea', body2: '#e6e2da', outline: '#2a2420', hi: 'rgba(255,255,255,0.4)', filter: '#d88a3a', blood: '#8a8a8a', eye: '#ff6a2a',
  },
  mutant: {
    name: 'Tunnelmutant', hp: 7, headR: 9.5, r0: 8.5, r1: 4, spacing: 6, maxLen: 9, minLen: 3, speed: 112, turn: 4.6, bite: 1,
    body: '#b8a8a4', body2: '#aa9a96', outline: '#1a1012', hi: 'rgba(255,240,240,0.25)', vein: '#7a4a52', blood: '#5a2a32', eye: '#e8e0d8',
  },
  rotling: {
    name: 'Rotling', hp: 3, headR: 8, r0: 7, r1: 3.5, spacing: 5.5, maxLen: 7, minLen: 3, speed: 94, turn: 4.4, bite: 1,
    body: '#8a7a3e', body2: '#7e6e36', outline: '#1c1a0a', hi: 'rgba(240,235,170,0.2)', ring: 'rgba(60,50,20,0.4)', blood: '#5a5420', eye: '#e6ff5a',
  },
});
const RAGE10 = { rage1: 1, rage2: 2, rage3: 3 };
const NEWBIE10 = { clown: 1, killerclown: 1, stekker: 1, bosje: 1, peukworm: 1, mutant: 1 };
Object.assign(NEWBIE9, NEWBIE10);
Object.assign(V9_SPAWN, { C: 'clown', t: 'stekker', m: 'mutant', ';': 'peukworm', ',': 'bosje' });

/* ------------------------------------------------------------------ setting snakes up */
{
  const in0 = initSnake9;
  initSnake9 = function (sn, o) {
    in0(sn, o);
    const k = sn.kind;
    if (RAGE10[k] || k === 'killerclown') sn.K = Object.assign({}, sn.K);
    if (k === 'clown') { sn.cd = rnd(0.8, 1.6); sn.dots10 = [0, 1, 2, 3, 4, 5, 6].map(() => pick(BALLOON_COLS10)); }
    else if (k === 'killerclown') { sn.cd = rnd(0.4, 0.8); sn.vanishCd = rnd(6, 9); sn.mode = 'chase'; }
    else if (RAGE10[k]) { sn.rage10 = 0; sn.slamCd = rnd(3, 4.5); sn.throwCd = rnd(3, 5); sn.mode = 'move'; }
    else if (k === 'stekker') sn.cd = rnd(1.4, 2.4);
    else if (k === 'bosje') sn.mode = 'move';
    else if (k === 'peukworm') { sn.cd = rnd(2, 3); sn.ashT = 0.5; }
    else if (k === 'mutant') { sn.rush = 0; sn.mode = 'move'; }
    else if (k === 'rotter' && !(o && o.preview)) rotVariant10(sn, o && o.rv);
  };
  const tk0 = snakeTick9;
  snakeTick9 = function (sn, dt) {
    tk0(sn, dt);
    // the Magnetron: it cooks for two seconds
    if (sn.cook10 > 0) {
      const step = Math.min(dt, sn.cook10); sn.cook10 -= dt;
      if (sn.canBeHit()) sn.hurt((sn.cookD10 || 0) * step / 2, sn.x, sn.y, true);
      if (Math.random() < dt * 20) addP({ kind: 'dot', x: sn.x + rnd(-sn.headR, sn.headR), y: sn.y + rnd(-sn.headR, sn.headR), vx: 0, vy: rnd(-40, -20), r: rnd(1, 2), life: 0.4, col: '#ffe7a0', glow: true, drag: 1 });
      if (sn.cook10 <= 0 && sn.alive) { floatText(sn.x, sn.y - 24, 'POP', '#ffe7a0'); Sfx.splat(); }
    }
  };
}
function teleport10(sn, x, y) {
  sn.x = x; sn.y = y; sn.trail = [{ x, y, s: sn.odo }];
  sn.tc = null; sn.cell = null; sn.dir = null;
  sn.computeBody();
}
// where a straight shot from a to b stops: the first rock, pillar or wall
function lineEnd10(room, x0, y0, x1, y1) {
  const d = dist(x0, y0, x1, y1), n = Math.max(1, Math.ceil(d / 8));
  let x = x0, y = y0;
  for (let i = 1; i <= n; i++) {
    const nx = lerp(x0, x1, i / n), ny = lerp(y0, y1, i / n);
    if (nx < 0 || ny < 0 || nx > RW || ny > RH) break;
    const o = room.tileAt(nx, ny); if (o && o.shots) break;
    x = nx; y = ny;
  }
  return [x, y];
}
function segDist10(px, py, x0, y0, x1, y1) {
  const vx = x1 - x0, vy = y1 - y0, l2 = vx * vx + vy * vy || 1;
  const k = clamp(((px - x0) * vx + (py - y0) * vy) / l2, 0, 1);
  return dist(px, py, x0 + vx * k, y0 + vy * k);
}

/* ------------------------------------------------------------------ the Clownsnake: happy, slow, and full of balloons */
AI.clown = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  if (sn.mode === 'blow') {
    sn.blow = Math.min(1, sn.mt / 0.3);
    const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
    sn.ang = turnToward(sn.ang, toP, 6 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.04;
    if (sn.mt >= 0.3) {
      throwBalloon10(room, sn, toP + rnd(-0.08, 0.08));
      sn.blow = 0; sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.1, 1.8);
      if (Math.random() < 0.2) floatText(sn.x, sn.y - 22, pick(['HIHI', 'HAHA', 'TADA']), pick(BALLOON_COLS10));
    }
    return;
  }
  sn.mode = 'move';
  const { d } = keepAway(sn, room, dt, 110, 230, sn.K.speed);
  sn.drawAng = sn.ang + Math.sin(G.t * 5 + sn.blinkSeed) * 0.12;
  sn.cd -= dt;
  if (sn.cd <= 0 && P.dying <= 0 && d < 380) { sn.mode = 'blow'; sn.mt = 0; Sfx.blow10(); }
};
function throwBalloon10(room, sn, ang) {
  const sp = rnd(240, 290), r = sn.headR + 6;
  fx10(room).balloons.push({ x: sn.x + Math.cos(ang) * r, y: sn.y + Math.sin(ang) * r, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, t: 0, life: rnd(4.6, 6), r: 8, col: pick(BALLOON_COLS10), seed: rnd(10), hostile: true });
  sn.mouth = 1;
}
// balloons: light, so they fly fast, then float, drift after you and bob up and down
function updateBalloons10(dt, room) {
  const F = fx10(room), B = F.balloons, P = G.player;
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i];
    b.t += dt;
    const dr = Math.max(0, 1 - 2.4 * dt); b.vx *= dr; b.vy *= dr;
    if (b.hostile && P.dying <= 0) {
      const a = Math.atan2(P.y - b.y, P.x - b.x);
      b.vx += Math.cos(a) * 34 * dt; b.vy += Math.sin(a) * 34 * dt;
    }
    b.vx += Math.sin(G.t * 1.7 + b.seed) * 12 * dt; b.vy += Math.cos(G.t * 2.1 + b.seed) * 10 * dt - 6 * dt;
    let nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
    if (nx < b.r || nx > RW - b.r) { b.vx = -b.vx * 0.6; nx = clamp(nx, b.r, RW - b.r); }
    if (ny < b.r || ny > RH - b.r) { b.vy = -b.vy * 0.6; ny = clamp(ny, b.r, RH - b.r); }
    const [rx, ry] = resolveTiles(room, nx, ny, b.r * 0.8);
    if (rx !== nx || ry !== ny) { b.vx *= 0.5; b.vy *= 0.5; }
    b.x = rx; b.y = ry;
    let pop = b.t > b.life ? 'old' : null;
    if (!pop && b.hostile && P.dying <= 0 && dist2(b.x, b.y, P.x, P.y) < (b.r + P.r - 3) * (b.r + P.r - 3)) { pop = 'player'; P.hurt(1, b.x, b.y); }
    if (!pop) {
      for (let j = G.seeds.length - 1; j >= 0; j--) {
        const s = G.seeds[j], sr = 4 * (s.size || 1);
        if (dist2(s.x, s.y, b.x, b.y) > (b.r + sr) * (b.r + sr)) continue;
        pop = 'seed'; if (!s.pierce) G.seeds.splice(j, 1);
        break;
      }
    }
    if (!pop && P.halo) for (const o of P.halo.orbs) if (o.x != null && dist2(o.x, o.y, b.x, b.y) < (b.r + 5) * (b.r + 5)) { pop = 'seed'; break; }
    if (!pop && P.ass10 && dist2(P.ass10.x, P.ass10.y, b.x, b.y) < (b.r + 6) * (b.r + 6)) pop = 'seed';
    if (!pop && P.fidget && dist2(P.fidget.x, P.fidget.y, b.x, b.y) < (b.r + 6) * (b.r + 6)) pop = 'seed';
    if (pop) { popBalloon10(b, pop !== 'old'); B.splice(i, 1); if (pop === 'seed') Meta.add('balloons'); }
  }
  // your own balloons: they float forward and pop into confetti
  for (let i = F.pballs.length - 1; i >= 0; i--) {
    const b = F.pballs[i];
    b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt - 8 * dt; b.vx *= 1 - dt * 0.4; b.vy *= 1 - dt * 0.4;
    let hit = b.t > b.life || b.x < 8 || b.y < 8 || b.x > RW - 8 || b.y > RH - 8;
    if (!hit) { const o = room.tileAt(b.x, b.y); if (o && o.shots) hit = true; }
    if (!hit) for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(b.x, b.y, 10)) { hit = true; break; }
    if (!hit) continue;
    F.pballs.splice(i, 1);
    for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(b.x, b.y, 54)) { sn.hurt(seedDmg(P) * 1.6 + 1, b.x, b.y); sn.daze = Math.max(sn.daze || 0, sn.isBoss ? 0.4 : 1.2); }
    popBalloon10(b, true, true);
  }
}
function popBalloon10(b, loud, big) {
  const n = big ? 26 : 12;
  for (let i = 0; i < n; i++) {
    const a = rnd(TAU), sp = rnd(40, big ? 200 : 120);
    addP({ kind: 'paper', x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, r: rnd(1.5, 3), life: rnd(0.6, 1.2), col: pick(BALLOON_COLS10), drag: 2.5, rot: rnd(TAU), vr: rnd(-10, 10), g: 60 });
  }
  burst(b.x, b.y, 4, b.col, { min: 30, max: 90, lmin: 0.15, lmax: 0.3, glow: true });
  if (loud) Sfx.pop10(); else Sfx.tone(700, 0.05, { type: 'triangle', vol: 0.02 });
}
function drawBalloon10(c, b, t, mine) {
  const bob = Math.sin(t * 3 + b.seed) * 1.5, x = b.x, y = b.y + bob - (mine ? 2 : 4);
  const life = mine ? 1 : Math.min(1, (b.life - b.t) / 0.6);
  c.save(); c.globalAlpha = Math.max(0.2, life);
  c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, b.x + 2, b.y + 10, b.r * 0.6, b.r * 0.25); c.fill();
  c.strokeStyle = 'rgba(240,240,240,0.6)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(x, y + b.r); c.quadraticCurveTo(x + Math.sin(t * 4 + b.seed) * 4, y + b.r + 6, x - 1, y + b.r + 12); c.stroke();
  ell(c, x, y, b.r * 0.86, b.r); c.fillStyle = b.col; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = b.col; c.beginPath(); c.moveTo(x - 2, y + b.r + 2.5); c.lineTo(x + 2, y + b.r + 2.5); c.lineTo(x, y + b.r - 0.5); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, x - b.r * 0.32, y - b.r * 0.38, b.r * 0.2, b.r * 0.32, -0.4); c.fill();
  if (mine) { c.strokeStyle = 'rgba(255,240,180,0.8)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, b.r + 3, 0, TAU); c.stroke(); }
  c.restore();
}

/* ------------------------------------------------------------------ the Killer-Clownsnake: big, fast, a spiked bat, and it pops up out of nowhere */
AI.killerclown = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  if (sn.mode === 'vanish') {
    sn.cloak = Math.max(0.02, 1 - sn.mt / 0.35);
    if (sn.mt > 0.35 && !sn.burrowed) hide9(sn);
    if (sn.mt > 1.1) {
      const back = Math.atan2(-P.aimY, -P.aimX) + rnd(-0.7, 0.7), r = rnd(80, 110);
      const f = nearestFreeCell(room, clamp(P.x + Math.cos(back) * r, 30, RW - 30), clamp(P.y + Math.sin(back) * r, 30, RH - 30));
      teleport10(sn, f.x, f.y); show9(sn);
      sn.ang = sn.drawAng = Math.atan2(P.y - f.y, P.x - f.x);
      sn.mode = 'appear'; sn.mt = 0; Sfx.giggle10(); floatText(f.x, f.y - 26, 'BOO', '#ffe14a', true);
      burst(f.x, f.y, 14, '#c8102a', { min: 40, max: 140, lmin: 0.3, lmax: 0.6 });
    }
    return;
  }
  if (sn.mode === 'appear') {
    sn.cloak = Math.min(1, sn.mt / 0.2);
    if (sn.mt > 0.32) { sn.mode = 'chase'; sn.mt = 0; sn.cloak = 1; sn.cd = Math.min(sn.cd, 0.2); }
    return;
  }
  if (sn.mode === 'wind') {
    sn.bat = Math.min(1, sn.mt / 0.36);
    sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang;
    if (sn.mt >= 0.36) { sn.mode = 'swing'; sn.mt = 0; sn.swingA = sn.ang; sn.hitDone = false; Sfx.swing10(); }
    return;
  }
  if (sn.mode === 'swing') {
    const u = Math.min(1, sn.mt / 0.16);
    sn.bat = 1 - 2 * u;
    if (!sn.hitDone && u > 0.45) {
      sn.hitDone = true;
      const reach = sn.headR + 38;
      if (P.dying <= 0 && d < reach + P.r && Math.abs(angDiff(sn.swingA, toP)) < 1.25 && P.hurt(1, sn.x, sn.y, sn)) { P.kbx += Math.cos(toP) * 260; P.kby += Math.sin(toP) * 260; floatText(P.x, P.y - 28, 'BONK', '#ffe14a', true); }
      const fx = sn.x + Math.cos(sn.swingA) * (sn.headR + 18), fy = sn.y + Math.sin(sn.swingA) * (sn.headR + 18);
      smash10(room, fx, fy, 30, 1);
      G.shake = Math.max(G.shake, 4); Sfx.thud();
    }
    if (sn.mt > 0.3) { sn.mode = 'chase'; sn.mt = 0; sn.cd = rnd(0.7, 1.1); sn.bat = 0; }
    return;
  }
  sn.mode = 'chase';
  steerMove(sn, room, toP + Math.sin(sn.mt * 3) * 0.18, sn.K.speed, sn.K.turn, dt);
  sn.cd -= dt; sn.vanishCd -= dt;
  if (sn.cd <= 0 && d < sn.headR + 50 && P.dying <= 0) { sn.mode = 'wind'; sn.mt = 0; }
  else if (sn.vanishCd <= 0 && d > 100 && P.dying <= 0) { sn.vanishCd = rnd(7, 10); sn.mode = 'vanish'; sn.mt = 0; Sfx.giggle10(); }
};
// break what is in reach: lvl 1 pots and rocks, lvl 2 furniture too, lvl 3 even the walls
function smash10(room, x, y, r, lvl) {
  let n = 0;
  for (const o of room.obs.slice()) {
    if (dist(o.x, o.y, x, y) > r + 14) continue;
    if (o.type === 'pit' || o.type === 'chest' || o.type === 'altar' || o.type === 'slot' || o.type === 'book' || o.type === 'lectern' || o.type === 'candle') continue;
    const breakAll = lvl >= 3 || (lvl >= 2 && (DEMOLISH[o.type] || SMASH10[o.type]));
    if (o.breakable || o.type === 'urn' || o.type === 'egg') { breakObstacle(room, o); n++; continue; }
    if (o.type === 'rock' || breakAll) {
      room.removeObstacle(o); o.broken = true; room.dirty = true; n++;
      burst(o.x, o.y, 12, o.type === 'wall' ? G.levelDef.wallHi : G.levelDef.rock, { kind: 'shard', min: 40, max: 160, rmin: 1.4, rmax: 3.4, lmin: 0.35, lmax: 0.8, drag: 4 });
    }
  }
  if (n) { Sfx.breakUrn(); Meta.add('smashed', n); }
  return n;
}
const SMASH10 = { bed: 1, cart10: 1, tvwall: 1, sandbag: 1, vending: 1, lamp10: 1 };
// the jump scare: one turns up right behind you, any room, any floor
function jumpScare10(room) {
  const P = G.player;
  const back = Math.atan2(-P.aimY, -P.aimX) + rnd(-0.8, 0.8), r = rnd(78, 104);
  const f = nearestFreeCell(room, clamp(P.x + Math.cos(back) * r, 30, RW - 30), clamp(P.y + Math.sin(back) * r, 30, RH - 30));
  const sn = new Snake('killerclown', f.x, f.y, { emerge: false, spawnTime: 0.12, ang: Math.atan2(P.y - f.y, P.x - f.x) });
  sn.mode = 'appear'; sn.cloak = 0; sn.cd = 0.5;
  room.snakes.push(sn);
  G.scare10 = { t: 0, dur: REDUCED ? 0.3 : 0.62 };
  G.shake = Math.max(G.shake, REDUCED ? 3 : 11);
  flashLight(f.x, f.y, 160, 1, 0.5);
  Sfx.scare10();
  floatText(f.x, f.y - 30, 'HONK HONK', '#ff3a5a', true);
  G.run.scares = (G.run.scares || 0) + 1;
  return sn;
}

/* ------------------------------------------------------------------ the rage worms: the angrier they get, the bigger they get */
AI.rage1 = function (sn, room, dt) { rageAI10(sn, room, dt, 1); };
AI.rage2 = function (sn, room, dt) { rageAI10(sn, room, dt, 2); };
AI.rage3 = function (sn, room, dt) { rageAI10(sn, room, dt, 3); };
function rageAI10(sn, room, dt, lvl) {
  const P = G.player;
  if (lvl < 3) {
    sn.rage10 += dt * (sn.hp < sn.maxHp * 0.5 ? 1.4 : 1);
    if (sn.rage10 >= (lvl === 1 ? 14 : 20)) { growRage10(sn, room); return; }
  }
  if (Math.random() < dt * (2 + lvl * 2)) addP({ kind: 'dot', x: sn.x + rnd(-6, 6), y: sn.y - sn.headR * 0.4, vx: rnd(-14, 14), vy: rnd(-50, -30), r: rnd(1.4, 2.8), life: 0.6, col: 'rgba(240,240,240,0.7)', drag: 1.5 });
  if (sn.mode === 'slam') {
    sn.mt += dt; sn.lift = Math.min(1, sn.mt / 0.65); sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.05;
    if (sn.mt > 0.65) {
      sn.lift = 0; sn.mode = 'move'; sn.mt = 0;
      const R = 40 + lvl * 12;
      G.shake = Math.max(G.shake, 5 + lvl * 2); Sfx.thud(); Sfx.collapse();
      if (P.dying <= 0 && dist(P.x, P.y, sn.x, sn.y) < sn.headR + R) P.hurt(lvl >= 3 ? 2 : 1, sn.x, sn.y, sn);
      const n = 6 + lvl * 2, off = rnd(TAU);
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, G.levelDef.venomSpeed * 0.75, '#c8643a'); v.kind = 'debris'; v.spin = rnd(TAU); v.r = 6.5; }
      ring10(sn.x, sn.y, 16, '#ff8a4a', 0.45, false);
      smash10(room, sn.x, sn.y, R * 0.8, lvl);
      if (lvl >= 3) for (let i = 0; i < 2; i++) { const a = rnd(TAU); crater10(room, sn.x + Math.cos(a) * rnd(50, 80), sn.y + Math.sin(a) * rnd(50, 80), 6); }
      burst(sn.x, sn.y, 16, G.levelDef.dirt || '#4a3a2a', { min: 50, max: 160, rmin: 1.5, rmax: 3.4, lmin: 0.4, lmax: 0.8 });
    }
    return;
  }
  if (sn.mode === 'throw') {
    sn.mt += dt; sn.lift = Math.min(1, sn.mt / 0.55);
    if (sn.mt > 0.55) {
      sn.lift = 0; sn.mode = 'move'; sn.mt = 0;
      const tx = clamp(P.x + P.vx * 0.6, 20, RW - 20), ty = clamp(P.y + P.vy * 0.6, 20, RH - 20);
      lob10(room, sn.x, sn.y, tx, ty, 0.95, 'boulder', (l) => {
        if (P.dying <= 0 && dist(P.x, P.y, l.x1, l.y1) < 34 + P.r * 0.4) P.hurt(1, l.x1, l.y1);
        for (const s of room.snakes) if (s !== sn && s.canBeHit() && s.hitTest(l.x1, l.y1, 24)) s.hurt(4, l.x1, l.y1);
        crater10(room, l.x1, l.y1, 7);
        G.shake = Math.max(G.shake, 7); Sfx.thud(); Sfx.collapse();
        burst(l.x1, l.y1, 16, G.levelDef.rock || '#6a5a4a', { kind: 'shard', min: 40, max: 150, rmin: 1.5, rmax: 3.5, lmin: 0.4, lmax: 0.8 });
      }, { r: 36 });
      Sfx.hiss(1);
    }
    return;
  }
  if (sn.slamCd != null) sn.slamCd -= dt;
  if (sn.throwCd != null) sn.throwCd -= dt;
  chargeAI(sn, room, dt, {
    speed: sn.K.speed, rearT: [0, 0.6, 0.7, 0.75][lvl], chargeSpeed: [0, 235, 265, 300][lvl], chargeT: 1.1 + lvl * 0.15, stunT: [0, 0.95, 0.8, 0.55][lvl], cd: lvl >= 3 ? [1.8, 2.6] : [2.4, 3.4], range: 400,
    crash: (s, r) => {
      const fx = s.x + Math.cos(s.chargeAng) * s.headR * 1.5, fy = s.y + Math.sin(s.chargeAng) * s.headR * 1.5;
      const n = smash10(r, fx, fy, 26 + lvl * 8, lvl);
      if (n) { floatText(fx, fy - 18, 'SMASH', '#ff8a4a', true); G.shake = Math.max(G.shake, 4 + lvl * 2); }
      // the biggest one does not stop for anything
      if (n && lvl >= 3) { s.mode = 'charge'; s.mt = 0.3; }
    },
    extra: (s, r, dt2, d) => {
      if (lvl >= 2 && s.slamCd <= 0 && d < 150) { s.slamCd = rnd(4.5, 6) - lvl * 0.5; s.mode = 'slam'; s.mt = 0; Sfx.hiss(1.2); return true; }
      if (lvl >= 3 && s.throwCd <= 0 && d > 140) { s.throwCd = rnd(3.5, 5); s.mode = 'throw'; s.mt = 0; return true; }
      return false;
    },
  });
  if (sn.mode === 'charge' && Math.random() < dt * 8) smash10(room, sn.x + Math.cos(sn.chargeAng) * sn.headR, sn.y + Math.sin(sn.chargeAng) * sn.headR, sn.headR * 0.8, Math.min(lvl, 2));
}
function growRage10(sn, room) {
  const next = sn.kind === 'rage1' ? 'rage2' : 'rage3';
  const f = Math.max(0.55, sn.hp / sn.maxHp);
  const nw = new Snake(next, sn.x, sn.y, { emerge: false, spawnTime: 0.35, ang: sn.ang, locks: sn.locks });
  nw.hp = nw.maxHp * f; nw.len = nw.lenFor(); nw.rage10 = 0; nw.trait = sn.trait;
  nw.trail = sn.trail.slice(); nw.odo = sn.odo;
  sn.alive = false;
  room.snakes.push(nw);
  if (G.boss === sn || (next === 'rage3' && !G.boss)) { G.boss = nw; nw.displayName = KINDS[next].name; }
  floatText(sn.x, sn.y - 30, 'IT GREW', '#ff6a3a', true);
  G.shake = Math.max(G.shake, 9); Sfx.roar(); flashLight(sn.x, sn.y, 140, 0.9, 0.5);
  burst(sn.x, sn.y, 24, sn.K.blood, { min: 50, max: 180, lmin: 0.4, lmax: 0.8 });
  Meta.add('rageGrow');
}
// rage worms show up when you make too much noise, take too long, or go looking for trouble
function spawnRage10(room, kind, why) {
  const P = G.player;
  const cell = Game.farCell(room, P, new Set());
  const sn = new Snake(kind, cell.x, cell.y, { delay: 0.3, spawnTime: 0.6, ang: Math.atan2(P.y - cell.y, P.x - cell.x) });
  room.snakes.push(sn);
  if (kind === 'rage3' && (!G.boss || !G.boss.alive)) { G.boss = sn; sn.displayName = KINDS.rage3.name; }
  if (why) setTimeout(() => { if (G.room === room && sn.alive) floatText(sn.x, sn.y - 30, why, '#ff6a3a', true); }, 700);
  Sfx.roar(); G.shake = Math.max(G.shake, 6);
  room.rageDone10 = true;
  return sn;
}

/* ------------------------------------------------------------------ the Stekkerworm: charges up, then a bolt down the line */
AI.stekker = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  if (sn.mode === 'zap') {
    if (sn.mt < 0.55) { sn.zx = P.x; sn.zy = P.y; }
    sn.ang = turnToward(sn.ang, Math.atan2(sn.zy - sn.y, sn.zx - sn.x), 5 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 50) * 0.05;
    if (sn.mt >= 0.85) {
      const hx = sn.x + Math.cos(sn.ang) * sn.headR, hy = sn.y + Math.sin(sn.ang) * sn.headR;
      const far = { x: hx + (sn.zx - hx) * 2.2, y: hy + (sn.zy - hy) * 2.2 };
      const [ex, ey] = lineEnd10(room, hx, hy, far.x, far.y);
      if (P.dying <= 0 && segDist10(P.x, P.y, hx, hy, ex, ey) < P.r + 3) P.hurt(1, ex, ey, sn);
      addP({ kind: 'zap', x: hx, y: hy, x2: ex, y2: ey, vx: 0, vy: 0, r: 1, life: 0.25, col: '#7ad0ff', glow: true, drag: 0, seed: rnd(100) });
      flashLight(ex, ey, 60, 0.6, 0.2); Sfx.zap();
      sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.4, 3.2);
    }
    return;
  }
  sn.mode = 'move';
  const { d } = keepAway(sn, room, dt, 120, 250, sn.K.speed);
  sn.cd -= dt;
  if (sn.cd <= 0 && d < 320 && P.dying <= 0 && clearLine(room, sn.x, sn.y, P.x, P.y)) { sn.mode = 'zap'; sn.mt = 0; Sfx.charge(); }
};

/* ------------------------------------------------------------------ the Bosjesworm: hides in a bush and jumps out */
AI.bosje = function (sn, room, dt) {
  const P = G.player, bushes = room.bushes10 || [];
  sn.mt += dt;
  const d = dist(P.x, P.y, sn.x, sn.y);
  if (sn.mode === 'hide') {
    sn.cloak = approach(sn.cloak == null ? 1 : sn.cloak, 0.1, dt * 2.5);
    sn.drawAng += Math.sin(G.t * 9 + sn.blinkSeed) * 0.01;
    if ((d < 115 || sn.mt > 7 || sn.cloakHit > 0) && P.dying <= 0) { sn.mode = 'move'; sn.mt = 0; sn.lunge = 0.45; sn.lungeCd = 2; sn.ang = Math.atan2(P.y - sn.y, P.x - sn.x); floatText(sn.x, sn.y - 18, '!', '#9be37a', true); Sfx.hiss(0.8); }
    return;
  }
  sn.cloak = approach(sn.cloak == null ? 1 : sn.cloak, 1, dt * 4);
  if (sn.mode === 'seek' && sn.bush10) {
    const b = sn.bush10;
    steerMove(sn, room, Math.atan2(b.y - sn.y, b.x - sn.x), sn.K.speed * 1.1, sn.K.turn, dt);
    if (dist(sn.x, sn.y, b.x, b.y) < 10 || sn.mt > 3.5) { sn.mode = 'hide'; sn.mt = 0; }
    return;
  }
  sn.mode = 'move';
  AI.grub(sn, room, dt);
  if (bushes.length && sn.mt > 3.2 && d > 90) {
    let best = null, bd = 1e12;
    for (const b of bushes) { if (dist(b.x, b.y, P.x, P.y) < 110) continue; const e = dist2(b.x, b.y, sn.x, sn.y); if (e < bd) { bd = e; best = b; } }
    if (best) { sn.bush10 = best; sn.mode = 'seek'; sn.mt = 0; }
  }
};
HURT10.bosje = (sn, amount) => { if (sn.mode === 'hide') { sn.cloakHit = 1; } return amount; };

/* ------------------------------------------------------------------ the Peukworm: leaves hot ash and blows smoke rings */
AI.peukworm = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt; sn.wig += dt * 2.5;
  const toP = Math.atan2(P.y - sn.y, P.x - sn.x), d = dist(P.x, P.y, sn.x, sn.y);
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.6, sn.K.speed, sn.K.turn, dt);
  sn.ashT -= dt;
  if (sn.ashT <= 0) { sn.ashT = 0.75; addFire(room, sn.x, sn.y, 10, 2.4, true); }
  sn.cd -= dt;
  if (sn.cd <= 0 && d < 320 && P.dying <= 0) {
    sn.cd = rnd(2.6, 3.6);
    const n = 8, off = rnd(TAU);
    for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, G.levelDef.venomSpeed * 0.5, '#8a8a92'); v.kind = 'smoke'; v.r = 7; v.life = 2.4; }
    sn.mouth = 1; Sfx.puff();
  }
};

/* ------------------------------------------------------------------ the Tunnelmutant: blind, and it hears every shot */
AI.mutant = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt; sn.wig += dt * 5;
  const nz = room.noise10;
  if (nz && G.t - nz.t < 0.6 && dist(nz.x, nz.y, sn.x, sn.y) < 340 && sn.rush <= 0) { sn.tx = nz.x + rnd(-20, 20); sn.ty = nz.y + rnd(-20, 20); sn.rush = 1.2; if (Math.random() < 0.3) floatText(sn.x, sn.y - 18, '!', '#e8e0d8'); }
  const d = dist(P.x, P.y, sn.x, sn.y);
  if (d < 70 && P.dying <= 0) { sn.tx = P.x; sn.ty = P.y; sn.rush = Math.max(sn.rush, 0.4); }
  if (sn.rush > 0) {
    sn.rush -= dt;
    steerMove(sn, room, Math.atan2(sn.ty - sn.y, sn.tx - sn.x) + Math.sin(sn.wig) * 0.15, sn.K.speed * 1.5, 6, dt);
    if (dist(sn.x, sn.y, sn.tx, sn.ty) < 12) sn.rush = 0;
  } else steerMove(sn, room, sn.ang + Math.sin(sn.wig * 0.4) * 1.1, sn.K.speed * 0.45, 3, dt);
  sn.mouth = sn.rush > 0 ? 1 : sn.mouth;
};
AI.rotling = function (sn, room, dt) { AI.grub(sn, room, dt); };

/* ------------------------------------------------------------------ four kinds of Rot Eater */
const ROT_KINDS10 = [
  { name: 'Rot Eater', hp: 30, speed: 82, maxLen: 7, body: '#7d7a3e', body2: '#716d36', spot: '#3f3518', eye: '#e6ff5a' },
  { name: 'Bloated Rot Eater', hp: 44, speed: 70, maxLen: 9, body: '#6a7a34', body2: '#5e6e2e', spot: '#2a3a10', eye: '#c8ff3a', headR: 12, r0: 11.5, r1: 5.5 },
  { name: 'Rot Eater Hive', hp: 38, speed: 82, maxLen: 8, body: '#8a6a3a', body2: '#7e5e32', spot: '#2a1a08', eye: '#ffd23a' },
  { name: 'Ancient Rot Eater', hp: 66, speed: 76, maxLen: 10, body: '#3a3220', body2: '#322a1a', spot: '#7aff5a', eye: '#7aff5a', headR: 12.5, r0: 12, r1: 6, underSpeed: 170, eruptDmg: 1 },
];
function rotVariant10(sn, forced) {
  const tier = (G.levelDef && G.levelDef.tier) || 0;
  const hard = G.diff === 'hard' || G.diff === 'nightmare';
  const top = Math.min(3, tier + (hard ? 1 : 0));
  const rv = forced != null ? forced : clamp(top - (Math.random() < 0.4 ? 1 : 0), 0, 3);
  const V = ROT_KINDS10[rv];
  sn.rv = rv;
  Object.assign(sn.K, { name: V.name, hp: V.hp, speed: V.speed, body: V.body, body2: V.body2, spot: V.spot, eye: V.eye });
  if (V.headR) { sn.K.headR = V.headR; sn.K.r0 = V.r0; sn.K.r1 = V.r1; sn.headR = V.headR; }
  if (V.underSpeed) { sn.K.underSpeed = V.underSpeed; sn.K.eruptDmg = V.eruptDmg; }
  if (V.maxLen) { sn.maxLen = sn.K.maxLen = V.maxLen; sn.len = sn.maxLen; }
  const mult = G.levelDef ? G.levelDef.hpMult : 1;
  sn.maxHp = sn.hp = V.hp * mult * enemyPowerK(G.player);
  sn.displayName = V.name;
  sn.spitCd10 = 2; sn.hiveN10 = 0;
}
{
  const rot0 = AI.rotter;
  AI.rotter = function (sn, room, dt) {
    const P = G.player, rv = sn.rv || 0;
    // the Ancient one travels under the floor between meals
    if (rv === 3 && sn.mode === 'under10') {
      sn.mt += dt;
      const tg = sn.dig10;
      sn.ang = turnToward(sn.ang, Math.atan2(tg.y - sn.y, tg.x - sn.x), 4 * dt); sn.drawAng = sn.ang;
      sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * sn.K.underSpeed * dt, 22, RW - 22), clamp(sn.y + Math.sin(sn.ang) * sn.K.underSpeed * dt, 22, RH - 22));
      if (Math.random() < dt * 14) burst(sn.x, sn.y, 1, G.levelDef.dirt, { min: 10, max: 40, lmin: 0.3, lmax: 0.5 });
      if (dist(sn.x, sn.y, tg.x, tg.y) < 14 || sn.mt > 2.4) { sn.mode = 'warn10'; sn.mt = 0; Sfx.rumble(); }
      return;
    }
    if (rv === 3 && sn.mode === 'warn10') {
      sn.mt += dt;
      if (sn.mt > 0.55) {
        sn.erupt(room);
        const off = rnd(TAU);
        for (let i = 0; i < 10; i++) spawnVenom(sn.x, sn.y, off + (i / 10) * TAU, G.levelDef.venomSpeed * 0.8, '#9aaa3a');
        sn.mode = sn.huntNext10 ? 'hunt' : 'feed'; sn.mt = 0;
      }
      return;
    }
    const feeding = sn.mode === 'feed';
    const eaten0 = sn.eaten;
    rot0(sn, room, dt);
    if (sn.eaten > eaten0) {
      if (rv === 2) {
        for (let i = 0; i < 2 && countKind(room, 'rotling') < 6; i++) {
          const a = rnd(TAU), f = nearestFreeCell(room, sn.x + Math.cos(a) * 24, sn.y + Math.sin(a) * 24);
          room.snakes.push(new Snake('rotling', f.x, f.y, { emerge: false, spawnTime: 0.3, ang: a }));
        }
        floatText(sn.x, sn.y - 22, 'HATCH', '#ffd23a');
      }
      if (rv === 3 && room.rots.length) {
        let far = null, fd = -1;
        for (const r of room.rots) { const e = dist2(r.x, r.y, sn.x, sn.y); if (e > fd) { fd = e; far = r; } }
        sn.dig10 = { x: far.x, y: far.y }; sn.dive(); sn.mode = 'under10'; sn.mt = 0; sn.huntNext10 = false;
      }
    }
    if (feeding && rv === 3 && sn.hp < sn.maxHp) { sn.hp = Math.min(sn.maxHp, sn.hp + sn.maxHp * 0.02 * dt); const nl = sn.lenFor(); if (nl > sn.len) sn.len = nl; }
    if (sn.mode === 'hunt') {
      sn.spitCd10 -= dt;
      if (rv >= 1 && sn.spitCd10 <= 0 && P.dying <= 0) {
        sn.spitCd10 = rv === 1 ? 2.2 : 2.8;
        fanAt(sn, rv === 1 ? 3 : 2, 0.3, G.levelDef.venomSpeed * 0.9, '#9aaa3a');
      }
      if (rv === 3) {
        sn.digCd10 = (sn.digCd10 == null ? 4 : sn.digCd10) - dt;
        if (sn.digCd10 <= 0) { sn.digCd10 = rnd(4.5, 6); sn.dig10 = { x: P.x, y: P.y }; sn.dive(); sn.mode = 'under10'; sn.mt = 0; sn.huntNext10 = true; }
      }
    }
  };
}
HURT10.rotter = (sn, amount, fx, fy, isPoison) => {
  if (sn.rv === 1 && sn.mode === 'feed' && !isPoison) { if (sn.clank <= 0) { sn.clank = 0.2; floatText(sn.x, sn.y - 20, 'BLOATED', '#c8ff3a'); } return amount * 0.45; }
  if (sn.rv === 3 && sn.mode === 'feed') return amount * 0.7;
  return amount;
};

/* ------------------------------------------------------------------ kills */
function onKill10(sn, room, P) {
  const k = sn.kind;
  if (RAGE10[k]) {
    Meta.add('rageKills'); G.run.rageKills = (G.run.rageKills || 0) + 1;
    if (k === 'rage3') { dropCoins(room, sn.x, sn.y, 6); dropHeart(room, sn.x, sn.y, 2); if (Math.random() < 0.4) spawnItem(room, sn.x, sn.y, 0.2); }
    else if (k === 'rage2') dropCoins(room, sn.x, sn.y, 2);
  }
  if (k === 'killerclown') { dropCoins(room, sn.x, sn.y, 2); if (Math.random() < 0.3) dropHeart(room, sn.x, sn.y, 1); }
  if (k === 'rotter') {
    Meta.mark('rotKinds', 'rv' + (sn.rv || 0));
    if (sn.rv === 3) Meta.add('rotAncient');
    if (sn.rv === 2) for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU, f = nearestFreeCell(room, sn.x + Math.cos(a) * 20, sn.y + Math.sin(a) * 20);
      room.snakes.push(new Snake('rotling', f.x, f.y, { emerge: false, spawnTime: 0.25, ang: a }));
    }
    if ((sn.rv || 0) >= 1) dropCoins(room, sn.x, sn.y, 2 + sn.rv);
  }
}

