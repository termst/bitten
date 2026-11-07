/* src/25-v9-powerups.js: v9: what the new powerups, curses and downgrades do. From v9. Lines 14258 to 14694 of the v13.7 script. */
/* =====================================================================
   Version 9: what the new powerups, curses and downgrades do
   ===================================================================== */
const PUMP_BY_ID = {}; for (const p of PUMPS) PUMP_BY_ID[p.id] = p;
const CUT_BY_ID = {}; for (const p of CUTS) CUT_BY_ID[p.id] = p;
const V9_RAVE = [['#3a0a4a', '#ff7af0', '#ff3ad8'], ['#0a2a4a', '#7af0ff', '#3ad8ff'], ['#2a4a0a', '#d8ff7a', '#b4ff3a'], ['#4a2a0a', '#ffd27a', '#ffb43a']];
const V9_CHARGED = ['#1a3a5a', '#bfe8ff', '#7cd0ff'];

Object.assign(Sfx, {
  squeak() { this.tone(1500, 0.12, { to: 2300, type: 'triangle', vol: 0.07 }); this.tone(2100, 0.1, { to: 1600, type: 'triangle', vol: 0.05, delay: 0.1 }); },
  bassWave() { this.tone(70, 0.3, { to: 36, vol: 0.3 }); this.noise(0.12, { f: 400, vol: 0.08 }); },
  horn() { [0, 4, 7].forEach((st) => this.tone(233 * Math.pow(2, st / 12), 0.55, { type: 'sawtooth', vol: 0.05, lp: 1800, attack: 0.02 })); },
  scratch() { this.noise(0.12, { filter: 'bandpass', f: 1400, fTo: 3800, q: 2, vol: 0.06 }); },
  popcorn() { [0, 0.08, 0.15].forEach((d, i) => this.tone(900 + i * 220, 0.06, { type: 'triangle', vol: 0.04, delay: d })); },
  bell() { this.tone(2093, 0.4, { type: 'triangle', vol: 0.05, verb: true }); this.tone(2637, 0.3, { type: 'triangle', vol: 0.04, delay: 0.09 }); },
  drop() { this.tone(55, 1.1, { to: 30, vol: 0.4 }); this.noise(0.9, { f: 2200, fTo: 120, vol: 0.2 }); this.tone(880, 0.3, { to: 110, type: 'sawtooth', vol: 0.05, lp: 1600 }); },
  buzz() { this.tone(170, 0.25, { type: 'square', vol: 0.03, lp: 600 }); this.tone(175, 0.25, { type: 'square', vol: 0.03, lp: 600, delay: 0.3 }); },
  ping() { this.tone(1568, 0.12, { type: 'sine', vol: 0.05 }); this.tone(2093, 0.18, { type: 'sine', vol: 0.04, delay: 0.08 }); },
  busHorn() { this.tone(196, 0.6, { type: 'sawtooth', vol: 0.07, lp: 900 }); this.tone(247, 0.6, { type: 'sawtooth', vol: 0.06, lp: 900 }); },
  pump() { this.noise(0.5, { filter: 'bandpass', f: 600, fTo: 1400, q: 1.2, vol: 0.08, attack: 0.05 }); this.tone(330, 0.2, { type: 'square', vol: 0.02, lp: 1200, delay: 0.4 }); },
  snip() { this.noise(0.05, { filter: 'highpass', f: 4200, vol: 0.08 }); this.noise(0.05, { filter: 'highpass', f: 4200, vol: 0.08, delay: 0.09 }); },
});

function initPlayer9(P, C) {
  P.tunes = []; P.cuts = [];
  P.bass = false; P.bassN = 0; P.rave = false; P.vinyl = false; P.bank = false; P.bankT = 4; P.bankN = 0; P.ov = false; P.schaar = false;
  P.stok = false; P.wheek = !!C.wheek; P.wheekCd = 0; P.perfect = false; P.perfectN = 0; P.stickySeeds = false; P.nitro = false; P.nitroT = 0;
  P.horn = false; P.hornT = 3; P.bril = false; P.brilN = 0; P.bezwaar = false; P.bezwaarUsed = false; P.mandje = false; P.haring = false;
  P.bitterbal = false; P.pinda = false; P.oliebol = false; P.olieN = 0; P.olieShot = false; P.verzoek = false; P.fiets = false; P.fietsN = 0; P.zonnebril = false;
  P.disco = null; P.drop = false; P.dropT = 6; P.speaker = null; P.remix = false; P.remixK = null; P.wheel = null; P.wheelShot = false;
  P.curator = false; P.curatorUsed = false;
  P.fightT = 0; P.floorT = 0; P.syrupT = 0; P.popT = 0; P.verdictT = 0;
}

/* ------------------------------------------------------------------ numbers that change with what you carry */
function speedK9(P, room) {
  let k = 1;
  if (P.nitroT > 0) k *= 1.7;
  if (P.flags.cold && room.locked && P.fightT < 3) k *= 0.75;
  if (P.syrupT > 0) k *= 0.6;
  return k;
}
function rateK9(P) {
  let k = 1;
  if (P.flags && P.flags.lowbat) k *= 1 + Math.min(0.25, (P.fightT || 0) * 0.006);
  return k;
}
function dmgK9(P) {
  let k = 1;
  if (P.perfectN) k *= 1 + 0.03 * P.perfectN;
  if (P.flags && P.flags.curatele && G.run) k *= 1 + Math.min(0.6, (G.run.coins || 0) * 0.015);
  if (P.verdictT > 0) k *= 0.5;
  return k;
}
function snakeSpeed9(sn, P) {
  let k = 1;
  if (P && P.flags.idool) k *= sn.isBoss ? 1.08 : 1.15;
  if (sn.alarmT > 0 && !sn.isBoss) k *= 1.25;
  if (sn.danceT > 0) k *= 0.3;
  return k;
}
function itemOk9(id, P) { return itemUnlocked(id) && !(id === 'wheek' && P.char === 'pean'); }
// Onder Curatele: your parents hold the money, so nothing can be bought
function curateleBlock9(p) {
  const P = G.player;
  if (!P || !P.flags.curatele) return false;
  if (p) { if (!p.deny) { p.deny = 3; UI.banner('Onder curatele', 'Your parents hold your money. You cannot buy anything.', 'curse'); Sfx.thud(); } }
  else { UI.banner('Onder curatele', 'Your parents hold your money. You cannot buy anything.', 'curse'); Sfx.thud(); }
  return true;
}

/* ------------------------------------------------------------------ the frame update for the apple */
function updatePlayer9(P, dt, room, sp) {
  const fight = room.locked && room.snakes.some((s) => s.alive && s.state === 'active');
  if (room.locked) P.fightT += dt;
  P.floorT += dt;
  if (P.nitroT > 0) {
    P.nitroT -= dt;
    if (sp > 40 && Math.random() < dt * 40) addP({ kind: 'dot', x: P.x + rnd(-5, 5), y: P.y + rnd(4, 10), vx: -P.vx * 0.2, vy: -P.vy * 0.2, r: rnd(1.4, 2.6), life: 0.3, col: Math.random() < 0.5 ? '#7cd0ff' : '#ffffff', glow: true, drag: 3 });
  }
  if (P.syrupT > 0) P.syrupT -= dt;
  if (P.verdictT > 0) P.verdictT -= dt;
  if (P.wheekCd > 0) P.wheekCd -= dt;
  if (P.popT > 0) P.popT -= dt;
  if (P.wheek && P.wheekCd <= 0 && fight && P.dying <= 0) {
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed) continue;
      if (dist(sn.x, sn.y, P.x, P.y) < sn.headR + 40) { wheek9(P, room); break; }
    }
  }
  if (P.bank && fight) { P.bankT -= dt; if (P.bankT <= 0) { P.bankT = 9; P.bankN = 5; floatText(P.x, P.y - 28, 'GELADEN', '#7cd0ff'); Sfx.ping(); } }
  if (P.horn && fight) { P.hornT -= dt; if (P.hornT <= 0) { P.hornT = 8; airHorn9(P, room); } }
  if (P.drop && fight) { P.dropT -= dt; if (P.dropT <= 0) { P.dropT = 16; theDrop9(P, room); } }
  if (P.disco) updateDisco9(P, dt, room, fight);
  if (P.speaker) updateSpeaker9(P, dt, room, fight);
  if (P.wheel != null && P.wheel < 1) {
    P.wheel = Math.min(1, P.wheel + (sp * dt) / 1500);
    if (P.wheel >= 1) { floatText(P.x, P.y - 30, 'WIEL VOL', '#ffd27a', true); Sfx.ping(); }
  }
  if (room.syrup9 && room.syrup9.length) for (const s of room.syrup9) if (dist2(P.x, P.y, s.x, s.y) < (s.r + 4) * (s.r + 4) && s.t < s.life) { P.syrupT = 0.15; break; }
}
function wheek9(P, room) {
  P.wheekCd = P.char === 'pean' && P.wheek ? 4.5 : 5;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    const d = dist(sn.x, sn.y, P.x, P.y);
    if (d > 92) continue;
    sn.stagger = Math.max(sn.stagger, 0.6); sn.daze = Math.max(sn.daze || 0, sn.isBoss ? 0.5 : 1.3);
    sn.hurt(1 + P.dmg * 0.3, sn.x, sn.y);
    if (!sn.isBoss) {
      const a = Math.atan2(sn.y - P.y, sn.x - P.x);
      for (let i = 0; i < 6; i++) { const nx = sn.x + Math.cos(a) * 4, ny = sn.y + Math.sin(a) * 4; if (!freeAt(G.room, nx, ny, sn.headR * 0.7)) break; sn.moveTo(nx, ny); }
    }
  }
  floatText(P.x, P.y - 32, 'WHEEK!', '#ffe0ea', true);
  addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r: 10, life: 0.4, col: '#ffd0dc', drag: 0, glow: true });
  addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r: 4, life: 0.3, col: '#ffffff', drag: 0 });
  Sfx.squeak(); P.squash = 0.8;
}
function bassWave9(P, room, k) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    if (!sn.hitTest(P.x, P.y, 78)) continue;
    sn.hurt(seedDmg(P) * 0.9 * k, sn.x, sn.y); sn.stagger = Math.max(sn.stagger, 0.3);
  }
  for (const r of [8, 16]) addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r, life: 0.35, col: '#c48af0', drag: 0, glow: true });
  Sfx.bassWave(); G.shake = Math.max(G.shake, 2);
}
function airHorn9(P, room) {
  for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(P.x, P.y, 110)) sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.4 : 1);
  floatText(P.x, P.y - 32, 'TOETER', '#ffd27a', true);
  addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r: 14, life: 0.45, col: '#ffd27a', drag: 0, glow: true });
  Sfx.horn(); G.shake = Math.max(G.shake, 3);
}
function theDrop9(P, room) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit()) continue;
    sn.hurt(seedDmg(P) * 4, sn.x, sn.y); sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.4 : 1);
    burst(sn.x, sn.y, 8, '#ff3ad8', { min: 40, max: 140, lmin: 0.3, lmax: 0.6, glow: true });
  }
  for (const r of [10, 22, 34]) addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r, life: 0.6, col: r === 22 ? '#3ad8ff' : '#ff3ad8', drag: 0, glow: true });
  floatText(P.x, P.y - 36, 'THE DROP', '#ff7af0', true);
  flashLight(P.x, P.y, 260, 0.9, 0.6);
  Sfx.drop(); G.shake = Math.max(G.shake, 8);
}
function updateDisco9(P, dt, room, fight) {
  const d = P.disco;
  d.a += dt * 2; d.x = P.x + Math.cos(d.a * 0.7) * 6; d.y = P.y - 34 + Math.sin(d.a) * 2;
  if (!fight) return;
  d.t -= dt;
  if (d.t > 0) return;
  let best = null, bd = 260 * 260;
  for (const sn of room.snakes) { if (!sn.canBeHit() || sn.burrowed) continue; const e = dist2(sn.x, sn.y, d.x, d.y); if (e < bd) { bd = e; best = sn; } }
  d.t = best ? 0.7 : 0.25;
  if (!best) return;
  best.hurt(seedDmg(P) * 0.7, best.x, best.y);
  const col = V9_RAVE[Math.floor(Math.random() * V9_RAVE.length)][2];
  addP({ kind: 'zap', x: d.x, y: d.y, x2: best.x, y2: best.y, vx: 0, vy: 0, r: 1, life: 0.2, col, glow: true, drag: 0, seed: rnd(100) });
}
function updateSpeaker9(P, dt, room, fight) {
  const s = P.speaker;
  const tx = P.x + P.aimY * 24 + 14, ty = P.y - P.aimX * 20 + 14;
  const k = Math.min(1, dt * 4); s.x += (tx - s.x) * k; s.y += (ty - s.y) * k;
  s.t += dt; s.pulse = Math.max(0, (s.pulse || 0) - dt * 3);
  if (s.t < 0.47) return;
  s.t = 0; s.pulse = 1;
  if (!fight) return;
  for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(s.x, s.y, 58)) sn.hurt(seedDmg(P) * 0.45 + 0.3, sn.x, sn.y);
  addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: 6, life: 0.3, col: '#c48af0', drag: 0 });
  Sfx.tone(62, 0.12, { to: 40, vol: 0.12 });
}

/* ------------------------------------------------------------------ shooting */
function preFire9(P) {
  P.remixK = P.remix ? pick(['ember', 'frost', 'cy', 'zap', 'split', 'bounce']) : null;
  P.wheelShot = P.wheel != null && P.wheel >= 1;
  if (P.oliebol) { P.olieN++; P.olieShot = P.olieN % 6 === 0; }
  return P.mods.crooked || 0;
}
function seed9(P, s, o) {
  if (P.rave) { s.rave = true; s.look9 = V9_RAVE[(P.shots + G.seeds.length) % V9_RAVE.length]; }
  if (P.vinyl) { s.vinyl = true; s.draw9 = 'vinyl'; }
  if (P.stickySeeds) s.sticky = true;
  if (P.pinda) s.pinda = true;
  if (P.schaar) s.schaar = true;
  if (P.flags.nacht) s.glow = true;
  if (!o.inherit) return;
  if (P.bankN > 0) { s.dmg *= 1.6; s.size *= 1.35; s.charged = true; s.look9 = V9_CHARGED; }
  if (P.remixK) { if (P.remixK === 'bounce') s.bounce = (s.bounce || 0) + 1; else s[P.remixK] = true; }
  if (P.wheelShot) {
    P.wheelShot = false; P.wheel = 0;
    s.wheel9 = true; s.draw9 = 'wheel'; s.size *= 2.6; s.dmg *= 3; s.pierce = true; s.cannon = true; s.pick = true;
    s.vx *= 0.75; s.vy *= 0.75; s.life *= 1.7; s.split = false; s.boom = false;
    Sfx.boost();
  } else if (P.olieShot) { P.olieShot = false; s.olie = true; s.draw9 = 'olie'; s.size *= 1.8; s.dmg *= 1.3; s.split = false; }
}
function fire9(P, base) {
  if (P.bankN > 0) P.bankN--;
  const room = G.room; if (!room) return;
  P.bassN++;
  if ((P.bass || P.flags.loud) && P.bassN % 4 === 0) bassWave9(P, room, P.bass && P.flags.loud ? 1.6 : P.flags.loud ? 1.2 : 1);
  if (P.fiets && ++P.fietsN % 7 === 0) bikeBell9(P, room, base);
}
function bikeBell9(P, room, base) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    const d = dist(sn.x, sn.y, P.x, P.y);
    if (d < 170 && Math.abs(angDiff(base, Math.atan2(sn.y - P.y, sn.x - P.x))) < 0.65) sn.stagger = Math.max(sn.stagger, 0.5);
  }
  for (let i = G.venom.length - 1; i >= 0; i--) {
    const v = G.venom[i]; if (v.friendly) continue;
    const d = dist(v.x, v.y, P.x, P.y);
    if (d < 170 && Math.abs(angDiff(base, Math.atan2(v.y - P.y, v.x - P.x))) < 0.65) { burst(v.x, v.y, 3, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true }); G.venom.splice(i, 1); }
  }
  floatText(P.x + Math.cos(base) * 24, P.y + Math.sin(base) * 24 - 10, 'TRING', '#e8f0ff');
  addP({ kind: 'ring', x: P.x + Math.cos(base) * 30, y: P.y + Math.sin(base) * 30, vx: Math.cos(base) * 120, vy: Math.sin(base) * 120, r: 8, life: 0.35, col: '#e8f0ff', drag: 0 });
  Sfx.bell();
}
function critNext9(P, o) {
  if (!P.bril || !o.inherit) return false;
  P.brilN++;
  return P.brilN % 5 === 0;
}

/* ------------------------------------------------------------------ seeds that hit */
function hit9(room, s, sn, dmg) {
  if (s.rave && Math.random() < 0.25) { sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.2 : 0.5); sn.danceT = 0.6; }
  if (s.sticky) { sn.stickyT = 3; sn.slow = Math.max(sn.slow, 1.2); }
  if (s.pinda) { sn.pindaT = 1; sn.pindaD = (sn.pindaD || 0) + dmg * 0.6; }
  if (s.schaar && Math.random() < 0.2 && sn.canBeHit()) { sn.hurt(3, s.x, s.y); floatText(s.x, s.y - 12, 'KNIP', '#f2e6d0'); Sfx.snip(); }
}
function vinylSkip9(room, s, from) {
  let best = null, bd = 170 * 170;
  for (const o of room.snakes) { if (o === from || !o.canBeHit() || o.burrowed) continue; const d = dist2(o.x, o.y, s.x, s.y); if (d < bd) { bd = d; best = o; } }
  if (!best) return false;
  s.skipped = true; s.hits = new Set([from]); s.clr = 0;
  const sp = Math.hypot(s.vx, s.vy), a = Math.atan2(best.y - s.y, best.x - s.x);
  s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; s.rot = a; s.t = Math.min(s.t, s.life * 0.5);
  Sfx.scratch();
  return true;
}
function oliebolBurst9(room, s) {
  room.clouds.push({ x: s.x, y: s.y, t: 0, life: 2.6, r: 10, hit: new Set(), seed: rnd(10), sugar: true });
  burst(s.x, s.y, 14, '#f6f0e4', { min: 30, max: 120, rmin: 1.2, rmax: 2.6, lmin: 0.4, lmax: 0.8 });
  Sfx.puff();
}
function snakeTick9(sn, dt) {
  if (sn.stickyT > 0) sn.stickyT -= dt;
  if (sn.danceT > 0) { sn.danceT -= dt; sn.drawAng += Math.sin(G.t * 30) * 0.08; }
  if (sn.alarmT > 0) sn.alarmT -= dt;
  if (sn.cloakHit > 0) sn.cloakHit -= dt;
  if (sn.pindaT > 0) {
    sn.pindaT -= dt;
    if (sn.pindaT <= 0) {
      const d = sn.pindaD || 0; sn.pindaD = 0;
      if (d > 0 && sn.canBeHit()) {
        sn.hurt(d, sn.x, sn.y);
        burst(sn.x, sn.y, 9, '#c8913a', { min: 30, max: 110, rmin: 1.2, rmax: 2.6, lmin: 0.3, lmax: 0.6 });
        floatText(sn.x, sn.y - 18, 'PINDA', '#e8b060');
        Sfx.splat();
      }
    }
  }
}

/* ------------------------------------------------------------------ venom */
function lookout9(v, P) {
  if (dist2(v.x, v.y, P.x, P.y) > 78 * 78) return;
  v.slowed = true; v.vx *= 0.55; v.vy *= 0.55; v.life += 0.6;
  burst(v.x, v.y, 3, '#ffe7a0', { min: 10, max: 40, lmin: 0.2, lmax: 0.35, glow: true });
}
// 0: nothing special, 1: it is gone, 2: it flew back
function venomHit9(v, P) {
  if (P.inv > 0 || P.dashT > 0 || P.dying > 0 || P.escaping > 0) return 0;
  if (P.bezwaar && !P.bezwaarUsed) {
    P.bezwaarUsed = true;
    let best = null, bd = 1e12;
    for (const sn of G.room.snakes) { if (!sn.canBeHit() || sn.burrowed) continue; const d = dist2(sn.x, sn.y, v.x, v.y); if (d < bd) { bd = d; best = sn; } }
    const sp = Math.hypot(v.vx, v.vy) * 1.25 + 40;
    const a = best ? Math.atan2(best.y - v.y, best.x - v.x) : Math.atan2(-v.vy, -v.vx);
    v.vx = Math.cos(a) * sp; v.vy = Math.sin(a) * sp; v.friendly = true; v.t = 0; v.life = 2.4; v.col = '#ffd27a'; v.kind = v.kind === 'tag' ? null : v.kind; v.home = null;
    floatText(P.x, P.y - 30, 'BEZWAAR!', '#ffd27a', true); Sfx.gavel();
    return 2;
  }
  if (P.zonnebril && Math.random() < 0.25) {
    floatText(P.x, P.y - 24, 'GLANCE', '#ffe7a0');
    burst(v.x, v.y, 5, '#ffe7a0', { min: 30, max: 90, lmin: 0.2, lmax: 0.4, glow: true });
    return 1;
  }
  return 0;
}
function venomFriendly9(v, room) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || !sn.hitTest(v.x, v.y, v.r)) continue;
    sn.hurt(4 + G.player.dmg * 2, v.x, v.y);
    burst(v.x, v.y, 8, '#ffd27a', { min: 30, max: 100, lmin: 0.3, lmax: 0.5, glow: true });
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ kills, rooms, pickups */
function onKill9(sn, room, P) {
  if (!P) return;
  if (P.nitro) P.nitroT = 1.5;
  if (P.verzoek && Math.random() < 1 / 3) { dropCoins(room, sn.x, sn.y, 1); floatText(sn.x, sn.y - 22, 'BETAALD', '#ffd84a'); }
  if (P.bitterbal && Math.random() < 0.25) {
    const a = rnd(TAU);
    room.pickups.push({ kind: 'bitterbal', x: sn.x, y: sn.y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, t: 0, life: 12, ph: rnd(10) });
  }
  if (sn.stole) { dropCoins(room, sn.x, sn.y, sn.stole + 2); Meta.add('thieves'); floatText(sn.x, sn.y - 26, 'TERUG', '#ffd84a', true); }
  if (sn.kind === 'stroopw') {
    if (!room.syrup9) room.syrup9 = [];
    room.syrup9.push({ x: sn.x, y: sn.y, r: 26, t: 0, life: 7, seed: rnd(10) });
    if (Math.random() < 0.5) dropCoins(room, sn.x, sn.y, 1);
  }
}
function collect9(id, P) {
  if (P.haring && P.heal(1)) { floatText(P.x, P.y - 40, 'HARING', '#bfe4ff'); }
}
function heartOk9(p, P, room) {
  if (P.flags.weken && P.floorT < 81) {
    if (!p.wekenT || G.t - p.wekenT > 2) { p.wekenT = G.t; floatText(p.x, p.y - 14, `NOG ${Math.ceil(81 - P.floorT)}s`, '#c48af0'); }
    return false;
  }
  if (P.flags.ghosted && !p.ghostRoll) {
    p.ghostRoll = true;
    if (Math.random() < 0.2) {
      burst(p.x, p.y, 10, '#e8e2f0', { kind: 'bubble', min: 20, max: 70, lmin: 0.3, lmax: 0.6 });
      floatText(p.x, p.y - 16, 'GHOSTED', '#c8c0d8');
      const i = room.pickups.indexOf(p); if (i >= 0) room.pickups.splice(i, 1);
      return false;
    }
  }
  return true;
}
function updateBitterbal9(p, i, dt, room, P) {
  p.vx = approach(p.vx, 0, 200 * dt); p.vy = approach(p.vy, 0, 200 * dt);
  let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
  [nx, ny] = resolveTiles(room, nx, ny, 6);
  p.x = clamp(nx, 8, RW - 8); p.y = clamp(ny, 8, RH - 8);
  if (p.t > p.life) { burst(p.x, p.y, 5, '#8a5a2a', { min: 20, max: 60, lmin: 0.2, lmax: 0.4 }); room.pickups.splice(i, 1); return; }
  if (p.t > 0.3) {
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed || !sn.hitTest(p.x, p.y, 6)) continue;
      room.pickups.splice(i, 1);
      explode(room, p.x, p.y, 34, { hurtPlayer: false, snakeDmg: 4 + P.dmg });
      floatText(p.x, p.y - 18, 'HEET', '#ff9a3a');
      return;
    }
  }
  if (p.t > 0.3 && P.dying <= 0 && dist2(p.x, p.y, P.x, P.y) < (P.r + 7) * (P.r + 7)) {
    room.pickups.splice(i, 1);
    if (P.heal(1)) floatText(P.x, P.y - 26, 'BITTERBAL', '#e8a050'); else floatText(P.x, P.y - 26, 'LEKKER', '#e8a050');
    Sfx.chomp(); burst(p.x, p.y, 6, '#e8a050', { min: 20, max: 60, lmin: 0.2, lmax: 0.4 });
  }
}
function combat9(room) {
  const P = G.player, L = G.levelDef;
  chaosCombat9(room);
  if (P.flags.loud) {
    const pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar;
    const cell = Game.farCell(room, P, new Set());
    room.snakes.push(new Snake(pick(pool), cell.x, cell.y, { delay: 0.9, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
  }
  for (const sn of room.snakes) {
    if (P.ov) sn.delay += 1;
    if (P.flags.witharen) { sn.delay *= 0.35; sn.spawnTime *= 0.6; }
  }
}
function clearRoom9(room) {
  const P = G.player, run = G.run;
  const clean = !run.roomHits;
  run.streak = clean ? (run.streak || 0) + 1 : 0;
  Meta.max('streak', run.streak);
  if (P.perfect && clean && P.perfectN < 15) { P.perfectN++; floatText(P.x, P.y - 40, `PERFECT ${P.perfectN * 3}%`, '#ffe7a0', true); }
  if (P.char === 'pean' && !P.dying) { P.popT = 0.9; Sfx.popcorn(); floatText(P.x, P.y - 30, 'POPCORN', '#ffe0ea'); }
  clubCleared9(room);
  chaosCleared9(room);
}
function floor9(P) { P.curatorUsed = false; P.floorT = 0; }
// the Curator: once per floor your parents catch the bite that would finish you
function curatorN9(P, n) {
  if (!P.curator || P.curatorUsed || P.hp - n > 0) return n;
  P.curatorUsed = true;
  UI.banner('Curator', 'Your parents stepped in. Half an apple left.', 'legend');
  burst(P.x, P.y, 16, '#ffd27a', { min: 40, max: 140, lmin: 0.4, lmax: 0.8, glow: true });
  return Math.max(0, P.hp - 1);
}
function enter9(P) { P.bezwaarUsed = false; P.fightT = 0; P.syrupT = 0; P.bankT = Math.min(P.bankT, 4); }

/* ------------------------------------------------------------------ selling: take a powerup off the apple, numbers and all */
const SELL_ADD = { maxHp: 1, dmg: 1, seedSize: 1 };
const SELL_MUL = { speed: 1, fireDelay: 1, shotSpeed: 1, range: 1 };
const SELL_SKIP = new Set(['x', 'y', 'vx', 'vy', 'kbx', 'kby', 'r', 'R', 'hp', 'bites', 'cool', 'inv', 'hurtT', 'items', 'lookX', 'lookY', 'aimX', 'aimY', 'aimHold',
  'blinkT', 'blink', 'fear', 'hop', 'hopH', 'squash', 'recoil', 'leaf', 'dying', 'escaping', 'god', 'bubbleT', 'char', 'growth', 'chew', 'chewO', 'chomp',
  'stillT', 'chillOn', 'stompT', 'motieN', 'motieGo', 'molenT', 'molenA', 'deltaT', 'curses', 'downs', 'mods', 'flags', 'bitterAcc', 'rootT', 'compostN', 'graftN',
  'sapT', 'pollenT', 'dashCd', 'dashT', 'dashX', 'dashY', 'shots', 'hunger', 'vampAcc', 'pumpN', 'phoenixUsed', 'vetoUsed', 'syrup', 'shellUp', 'shellT',
  'tunes', 'cuts', 'bassN', 'bankT', 'bankN', 'wheekCd', 'perfectN', 'nitroT', 'hornT', 'brilN', 'bezwaarUsed', 'olieN', 'olieShot', 'fietsN', 'dropT', 'remixK',
  'wheelShot', 'curatorUsed', 'fightT', 'floorT', 'syrupT', 'popT', 'verdictT', 'sink']);
function canSell9(P, id) {
  const C = CHARS[P.char];
  if (C.start && C.start.includes(id)) return false;
  return P.items.includes(id);
}
// builds a fresh apple of the same kind with these powerups, without touching the save or the stats
function ghostPlayer9(char, ids) {
  const st = G.state; G.state = 'rebuild';
  let Q;
  try {
    Q = new Player(char);
    for (const id of ids) if (!Q.items.includes(id)) { ITEMS[id].apply(Q); Q.items.push(id); }
  } finally { G.state = st; }
  return Q;
}
function sellItem9(P, id) {
  if (!canSell9(P, id)) return false;
  const others = P.items.filter((x) => x !== id);
  const A = ghostPlayer9(P.char, P.items), B = ghostPlayer9(P.char, others);
  const keys = new Set(Object.keys(A).concat(Object.keys(B)));
  for (const k of keys) {
    if (SELL_SKIP.has(k)) continue;
    const a = A[k], b = B[k];
    if (SELL_ADD[k]) { P[k] += (b || 0) - (a || 0); continue; }
    if (SELL_MUL[k]) { if (a > 0 && b > 0) P[k] *= b / a; continue; }
    if (a === b) continue;
    if (typeof a === 'object' && a && typeof b === 'object' && b) continue;
    P[k] = b === undefined ? null : b;
  }
  P.items = P.items.filter((x) => x !== id);
  if (!P.stroop) P.syrup = false;
  if (!P.toffee) P.shellUp = false;
  P.maxHp = clamp(Math.round(P.maxHp), 2, 16); P.hp = Math.min(P.hp, P.maxHp); fixBites(P);
  P.dmg = Math.max(0.2, P.dmg); P.seedSize = Math.max(0.4, P.seedSize);
  return true;
}

