/* src/15-v8-rules.js: v8: downgrades, curses, keys, vault, slot machine, spring, hazards, traits, threat. From v8. Lines 8275 to 9046 of the v13.7 script. */
/* =====================================================================
   Version 8: downgrades and curses, the newest powerups, the new rooms
   (slot machine, spring, cursed books, mini boss, survival, vault),
   floor hazards, the Splitter, the Sharpshooter and snake traits
   ===================================================================== */

/* ------------------------------------------------------------------ the apple's real numbers */
// curses and downgrades never touch the base numbers: they sit on top as multipliers
function recalcMods(P) {
  const m = { dmg: 1, rate: 1, shot: 1, range: 1, speed: 1, light: 1, kb: 1, wobble: 0, sway: 0, crooked: 0, size: 1 };
  const f = {};
  const add = (X) => {
    if (!X) return;
    if (X.mod) for (const k in X.mod) { if (k === 'wobble' || k === 'sway' || k === 'crooked') m[k] += X.mod[k]; else m[k] *= X.mod[k]; }
    if (X.flag) f[X.flag] = true;
  };
  for (const id of P.curses || []) add(CURSES[id]);
  for (const id of P.downs || []) add(DOWNS[id]);
  for (const id of P.tunes || []) add(PUMP_BY_ID[id]);
  for (const id of P.cuts || []) add(CUT_BY_ID[id]);
  P.mods = m; P.flags = f;
}
function missingApples(P) { return Math.max(0, (P.maxHp - P.hp) / 2); }
function seedDmg(P) {
  let d = P.dmg * P.mods.dmg;
  if (P.bruised) d *= 1 + 0.15 * missingApples(P);
  if (P.seedbank && G.run) d *= 1 + Math.min(0.4, (G.run.coins || 0) * 0.01);
  d *= dmgK9(P);
  return d;
}
// no amount of powerups shoots faster than this
const FIRE_FLOOR = 0.12;
function effDelay(P, noChill) { return Math.max(FIRE_FLOOR, P.fireDelay * P.mods.rate * rateK9(P) * (P.chillOn && !noChill ? 0.62 : 1)); }
function fixBites(P) { P.bites.length = Math.min(P.bites.length, Math.max(0, P.maxHp - P.hp)); }

/* ------------------------------------------------------------------ downgrades */
const DOWN_CAP = 6;
function pickDown() {
  const P = G.player;
  const fresh = DOWN_IDS.filter((id) => !P || !P.downs.includes(id));
  return pick(fresh.length ? fresh : DOWN_IDS);
}
function giveDown(id) {
  const P = G.player;
  if (!P || P.dying > 0 || P.escaping > 0) return false;
  id = DOWNS[id] ? id : pickDown();
  const D = DOWNS[id];
  P.downs.push(id);
  if (D.maxHp) { P.maxHp = Math.max(2, P.maxHp + D.maxHp); P.hp = Math.min(P.hp, P.maxHp); fixBites(P); }
  recalcMods(P);
  Meta.add('downs');
  Sfx.down();
  UI.banner(`Downgrade: ${D.name}`, D.desc, 'down');
  burst(P.x, P.y, 16, '#7a4a8a', { min: 40, max: 130, lmin: 0.4, lmax: 0.8 });
  burst(P.x, P.y, 10, '#9fbf5a', { kind: 'bubble', min: 20, max: 80, lmin: 0.5, lmax: 0.9 });
  G.shake = Math.max(G.shake, 3);
  floatText(P.x, P.y - 30, 'DOWNGRADE', '#c08ad8', true);
  return true;
}
// get bitten in a room, and the rot may follow you out of it
function rollDown(room) {
  const P = G.player;
  if (!G.run || !G.run.roomHits || rushy() || !P || P.downs.length >= DOWN_CAP) return;
  // the first floor goes easy on you
  const k = (G.D && G.D.rot != null ? G.D.rot : 1) * (G.mode === 'story' ? 0.7 : 1) * ((G.levelDef.tier || 0) === 0 ? 0.6 : 1);
  const p = Math.min(0.32, (0.05 + 0.045 * G.run.roomHits) * k);
  if (Math.random() >= p) return;
  const from = G.run.lastKill && G.run.lastKill.room === room ? G.run.lastKill : { x: RW / 2, y: RH / 2 };
  room.spores.push({ kind: 'core', x: from.x, y: from.y, vx: rnd(-30, 30), vy: -70, t: 0, id: pickDown(), ph: rnd(10) });
  Sfx.rotRise();
  floatText(from.x, from.y - 24, 'THE ROT STAYS', '#c08ad8');
}
// rotten pots hold a spore: it drifts after the apple, and one seed pops it
function releaseSpore(room, x, y) {
  room.spores.push({ kind: 'spore', x, y, vx: rnd(-30, 30), vy: -40, t: 0, id: null, ph: rnd(10) });
  burst(x, y, 14, '#7a4a8a', { min: 30, max: 110, lmin: 0.4, lmax: 0.8 });
  burst(x, y, 8, '#9fbf5a', { kind: 'bubble', min: 20, max: 70, lmin: 0.5, lmax: 0.9 });
  floatText(x, y - 20, 'ROT', '#c08ad8');
  Sfx.rotRise();
}
function updateSpores(dt, room) {
  const P = G.player;
  for (let i = room.spores.length - 1; i >= 0; i--) {
    const s = room.spores[i];
    s.t += dt;
    const dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy) || 1;
    if (s.kind === 'core') {
      // rises out of the room for a moment, then dives into the apple; nothing stops it
      if (s.t < 0.75) { s.vy = approach(s.vy, -8, 90 * dt); s.vx *= 1 - 2 * dt; }
      else { const sp = 140 + (s.t - 0.75) * 320; s.vx = (dx / d) * sp; s.vy = (dy / d) * sp; }
    } else {
      const sp = Math.min(96, 46 + s.t * 7);
      const a = Math.atan2(s.vy, s.vx), na = turnToward(a, Math.atan2(dy, dx), 2.1 * dt);
      s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp;
      if (s.t > 15) { burst(s.x, s.y, 8, '#7a4a8a', { min: 20, max: 60, lmin: 0.3, lmax: 0.6 }); room.spores.splice(i, 1); continue; }
    }
    s.x = clamp(s.x + s.vx * dt, 6, RW - 6); s.y = clamp(s.y + s.vy * dt, 6, RH - 6);
    if (Math.random() < dt * 14) addP({ kind: 'dot', x: s.x + rnd(-3, 3), y: s.y + rnd(-3, 3), vx: rnd(-10, 10), vy: rnd(-25, -5), r: rnd(0.8, 1.8), life: rnd(0.4, 0.8), col: Math.random() < 0.5 ? '#b07ad0' : '#9fbf5a', drag: 1, glow: true });
    if (P.dying > 0 || P.escaping > 0 || d > P.r + 7) continue;
    if (s.kind === 'core' ? s.t > 0.75 : P.inv <= 0 && P.dashT <= 0) {
      room.spores.splice(i, 1);
      if (s.kind === 'core' || P.downs.length < DOWN_CAP) giveDown(s.id);
      else floatText(P.x, P.y - 26, 'NO ROOM FOR MORE ROT', '#c08ad8');
    }
  }
}
function seedHitsSpore(room, s, sr) {
  for (let i = 0; i < room.spores.length; i++) {
    const q = room.spores[i];
    if (q.kind !== 'spore' || dist2(s.x, s.y, q.x, q.y) > (9 + sr) * (9 + sr)) continue;
    room.spores.splice(i, 1);
    burst(q.x, q.y, 12, '#b07ad0', { min: 30, max: 100, lmin: 0.3, lmax: 0.6, glow: true });
    floatText(q.x, q.y - 14, 'POP', '#c08ad8');
    Sfx.splat();
    return true;
  }
  return false;
}
// leaving a room: whatever rot was on its way catches up with you
function flushSpores(room) {
  for (const s of room.spores) if (s.kind === 'core') giveDown(s.id);
  room.spores.length = 0;
}

/* ------------------------------------------------------------------ curses */
function pickCurse(exclude) {
  const P = G.player;
  const free = CURSE_IDS.filter((c) => !(P && P.curses.includes(c)) && !(exclude && exclude.has(c)));
  return free.length ? pick(free) : null;
}
function giveCurse(id) {
  const P = G.player;
  if (!P) return;
  if (!CURSES[id] || P.curses.includes(id)) { id = pickCurse(); if (!id) return; }
  const C = CURSES[id];
  P.curses.push(id);
  if (C.maxHp) { P.maxHp = Math.max(2, P.maxHp + C.maxHp); P.hp = Math.min(P.hp, P.maxHp); fixBites(P); }
  recalcMods(P);
  Meta.add('curses'); Meta.max('mostCurses', P.curses.length);
  Sfx.curse();
  // the powerup's own banner shows first
  const run = G.run;
  setTimeout(() => { if (G.state === 'play' && G.run === run) UI.banner(`Curse: ${C.name}`, C.desc, 'curse'); }, 2400);
  burst(P.x, P.y, 20, '#b05aff', { min: 40, max: 160, lmin: 0.5, lmax: 1, glow: true });
  G.shake = Math.max(G.shake, 4);
  floatText(P.x, P.y - 40, 'CURSED', '#c48af0', true);
}
function removeThing(P, id, kind) {
  const list = kind === 'curse' ? P.curses : P.downs;
  const i = list.indexOf(id);
  if (i < 0) return false;
  list.splice(i, 1);
  const X = kind === 'curse' ? CURSES[id] : DOWNS[id];
  if (X.maxHp) P.maxHp = Math.min(16, P.maxHp - X.maxHp);
  recalcMods(P);
  Meta.add('cleansed');
  return true;
}
// downgrades first, oldest first; with no downgrades left, the newest curse
function cleanseOne(P, why) {
  let id = null, kind = null;
  if (P.downs.length) { id = P.downs[0]; kind = 'down'; }
  else if (P.curses.length) { id = P.curses[P.curses.length - 1]; kind = 'curse'; }
  if (!id) return null;
  removeThing(P, id, kind);
  UI.banner(`Washed off: ${thingInfo(id).name}`, why || 'You feel fresher already.', 'clean');
  Sfx.cleanse();
  burst(P.x, P.y, 18, '#9fe8ff', { min: 40, max: 140, lmin: 0.4, lmax: 0.9, glow: true });
  return id;
}
function cleanseDowns(P) {
  let n = 0;
  while (P.downs.length) { removeThing(P, P.downs[0], 'down'); n++; }
  return n;
}

/* ------------------------------------------------------------------ keys, the vault door, the shop machines */
function dropKey(room, x, y) {
  const a = rnd(TAU);
  room.pickups.push({ kind: 'key', x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, t: 0, ph: rnd(10) });
  flashLight(x, y, 100, 0.9, 0.9); Sfx.key();
  burst(x, y, 14, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true });
  floatText(x, y - 22, 'A KEY', '#ffd27a', true);
}
function vaultOnFloor() { return !!(G.map && G.map.rooms.some((r) => r.type === 'vault' && r.sealed)); }
function updateRotPickup(p, i, dt, room, P) {
  if (p.kind === 'key') {
    p.vx = approach(p.vx, 0, 200 * dt); p.vy = approach(p.vy, 0, 200 * dt);
    let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
    [nx, ny] = resolveTiles(room, nx, ny, 7);
    p.x = clamp(nx, 10, RW - 10); p.y = clamp(ny, 10, RH - 10);
    if (p.t > 0.4 && P.dying <= 0 && dist2(p.x, p.y, P.x, P.y) < (P.r + 10) * (P.r + 10)) {
      G.run.keys = (G.run.keys || 0) + 1;
      room.pickups.splice(i, 1);
      Sfx.key(); Sfx.pickup();
      UI.banner('A vault key', vaultOnFloor() ? 'Somewhere on this floor a vault is barred shut. Walk up to its door.' : 'Keep it. The next vault you find opens with it.');
      burst(P.x, P.y, 12, '#ffd27a', { min: 30, max: 100, lmin: 0.3, lmax: 0.7, glow: true });
    }
    return;
  }
  p.deny = Math.max(0, (p.deny || 0) - dt);
  if (p.spin > 0) p.spin = Math.max(0, p.spin - dt);
  const near = P.dying <= 0 && dist2(p.x, p.y, P.x, P.y) < (P.r + 13) * (P.r + 13);
  if (p.kind === 'cleanse') {
    if (!near || p.deny) return;
    const cost = priceOf(p);
    if (!P.downs.length && !P.curses.length) { p.deny = 2.5; UI.banner('Nothing to wash off', 'Come back when the rot gets to you.'); return; }
    if (curateleBlock9(p)) return;
    if (G.run.coins < cost) { p.deny = 2.5; UI.banner('Not enough coins', `This costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); return; }
    G.run.coins -= cost; Meta.add('spent', cost); Sfx.register();
    floatText(p.x, p.y - 30, `-${cost}`, '#ffd84a');
    room.pickups.splice(i, 1);
    cleanseOne(P, 'Scrubbed clean, for a price.');
    return;
  }
  // the reroll machine: step off it before you pull it again
  if (!near) { p.armed = true; return; }
  if (!p.armed || p.deny) return;
  p.armed = false;
  const cost = priceOf(p);
  if (!room.pickups.some((q) => q.goods)) { p.deny = 1.5; UI.banner('Sold out', 'Nothing left on the shelves to swap.'); return; }
  if (curateleBlock9(p)) return;
  if (G.run.coins < cost) { p.deny = 1.5; UI.banner('Not enough coins', `A reroll costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); return; }
  G.run.coins -= cost; Meta.add('spent', cost); Sfx.register();
  floatText(p.x, p.y - 30, `-${cost}`, '#ffd84a');
  p.cost += 3; p.spin = 0.6;
  rerollShop(room);
}
function rerollShop(room) {
  for (const q of room.pickups) {
    if (q.kind !== 'item' || !q.goods) continue;
    G.run.pending.delete(q.id);
    const id = nextItemId(q.rareSlot ? 0.3 : 0.04);
    if (id !== 'golden') G.run.pending.add(id);
    q.id = id; q.cost = ITEMS[id].rare ? 35 : 15; q.t = 0;
    burst(q.x, q.y - 10, 12, '#7cc4ff', { min: 30, max: 100, lmin: 0.3, lmax: 0.7, glow: true });
  }
  floatText(RW / 2, RH * 0.38, 'REROLL', '#7cc4ff', true);
  Sfx.slotTick(); Sfx.dingdong();
}
// walk up to a barred vault door: a key opens it
function updateVaultDoors(room) {
  const P = G.player;
  if (P.dying > 0) return;
  for (const k in room.doors) {
    const v = room.doors[k];
    if (!v.sealed) continue;
    const dv = DOORV[k], x = RW / 2 + dv[0] * RW / 2, y = RH / 2 + dv[1] * RH / 2;
    if (dist(P.x, P.y, x, y) > 46) continue;
    if ((G.run.keys || 0) > 0) {
      G.run.keys--; v.sealed = false; room.dirty = true; v.dirty = true; room.ver++;
      Sfx.unlock(); G.shake = Math.max(G.shake, 3);
      burst(x, y, 20, '#ffd27a', { kind: 'shard', min: 40, max: 140, lmin: 0.4, lmax: 0.8 });
      flashLight(x, y, 110, 0.9, 0.8);
      UI.banner('The vault opens', 'The key turns. Something glitters in there.');
      Meta.add('vaults');
    } else if (!(room.vaultNag > G.t)) {
      room.vaultNag = G.t + 6;
      UI.banner('Barred shut', G.map && G.map.keyDrop ? 'A vault. Its key drops in the next fight you win on this floor.' : 'A vault. Its key hides in something breakable on this floor.');
      Sfx.thud();
    }
  }
}

/* ------------------------------------------------------------------ the newest powerups */
function updateDash(P, dt, room, mv) {
  const IS = P.input14, want = IS ? IS.dash() : Input.dashReq; if (!IS) Input.dashReq = false;   /* M4 */
  if (P.dashCd > 0) P.dashCd = Math.max(0, P.dashCd - dt);
  if (P.dashT > 0) {
    P.dashT -= dt;
    const sp = P.speed * P.mods.speed * 3.1;
    P.vx = P.dashX * sp; P.vy = P.dashY * sp; P.kbx = 0; P.kby = 0;
    if (Math.random() < dt * 60) addP({ kind: 'dot', x: P.x + rnd(-6, 6), y: P.y + rnd(-4, 8), vx: -P.dashX * 50, vy: -P.dashY * 50, r: rnd(1.6, 3.2), life: 0.35, col: '#ffe2a4', drag: 3 });
    if (P.dashT <= 0) { P.vx *= 0.35; P.vy *= 0.35; }
    return;
  }
  if (!want || !P.dash || P.dashCd > 0 || P.dying > 0 || P.escaping > 0 || P.rootT > 0) return;
  let dx = mv.x, dy = mv.y;
  if (Math.hypot(dx, dy) < 0.2) {
    const v = Math.hypot(P.vx, P.vy);
    if (v > 20) { dx = P.vx / v; dy = P.vy / v; } else { dx = P.aimX; dy = P.aimY; }
  }
  const l = Math.hypot(dx, dy) || 1;
  P.dashX = dx / l; P.dashY = dy / l; P.dashT = 0.17; P.dashCd = 1.5; P.squash = 0.6;
  Sfx.dash();
  burst(P.x, P.y, 10, '#ffe2a4', { kind: 'bubble', min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
}
function updatePlayerExtras3(P, dt, room, sp) {
  // Sap Trail: sticky drops behind a moving apple
  if (P.sap && sp > 40) {
    P.sapT -= dt;
    if (P.sapT <= 0) { P.sapT = 0.11; room.sap.push({ x: P.x + rnd(-3, 3), y: P.y + 8 + rnd(-2, 2), t: 0, r: rnd(9, 12), seed: rnd(10) }); if (room.sap.length > 46) room.sap.shift(); }
  }
  // Pollen Puff: a cloud every few seconds while something hunts you
  if (P.pollen && room.locked && room.snakes.some((s) => s.alive && s.state === 'active')) {
    P.pollenT -= dt;
    if (P.pollenT <= 0) { P.pollenT = 5.5; room.clouds.push({ x: P.x, y: P.y, t: 0, life: 3.4, r: 10, hit: new Set(), seed: rnd(10) }); Sfx.puff(); }
  }
}
function plantSunflower(room, x, y) {
  if (room.turrets.length >= 3) room.turrets.shift();
  const f = freeAt(room, x, y, 8) ? { x, y } : nearestFreeCell(room, x, y);
  room.turrets.push({ x: f.x, y: f.y, t: 0, life: 10, cd: 0.6, ang: -Math.PI / 2 });
  burst(f.x, f.y, 10, '#8fc24a', { min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
  floatText(f.x, f.y - 22, 'SPROUT', '#ffd84a');
  Sfx.pickup();
}
function updateTurrets(dt, room) {
  const P = G.player;
  for (let i = room.turrets.length - 1; i >= 0; i--) {
    const u = room.turrets[i];
    u.t += dt; u.cd -= dt;
    if (u.t > u.life) { burst(u.x, u.y - 8, 10, '#e8c43a', { min: 20, max: 70, lmin: 0.3, lmax: 0.6 }); room.turrets.splice(i, 1); continue; }
    let best = null, bd = 280 * 280;
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed) continue;
      const d = dist2(sn.x, sn.y, u.x, u.y); if (d < bd) { bd = d; best = sn; }
    }
    if (!best) continue;
    const a = Math.atan2(best.y - (u.y - 10), best.x - u.x);
    u.ang = turnToward(u.ang, a, 8 * dt);
    if (u.cd <= 0 && Math.abs(angDiff(u.ang, a)) < 0.3) {
      u.cd = 0.85;
      const s = makeSeed(P, u.x + Math.cos(a) * 8, u.y - 10 + Math.sin(a) * 8, a, { mult: 0.5, size: 0.75, noCan: true });
      s.boom = false; s.split = false;
    }
  }
}
function updateSap(dt, room) {
  for (let i = room.sap.length - 1; i >= 0; i--) { const s = room.sap[i]; s.t += dt; if (s.t > 3.2) room.sap.splice(i, 1); }
  if (!room.sap.length) return;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    for (const s of room.sap) if (dist2(sn.x, sn.y, s.x, s.y) < (s.r + sn.headR * 0.6) * (s.r + sn.headR * 0.6)) { sn.slow = Math.max(sn.slow, 0.3); break; }
  }
}
function updateClouds(dt, room) {
  for (let i = room.clouds.length - 1; i >= 0; i--) {
    const k = room.clouds[i];
    k.t += dt; k.r = Math.min(70, 16 + k.t * 120);
    if (k.t > k.life) { room.clouds.splice(i, 1); continue; }
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed || sn.isBoss) continue;
      if (dist2(sn.x, sn.y, k.x, k.y) > k.r * k.r) continue;
      sn.daze = Math.max(sn.daze, 0.6);
      if (!k.hit.has(sn)) { k.hit.add(sn); if (Math.random() < 0.6) floatText(sn.x, sn.y - 18, k.sugar ? 'POEDER' : 'ACHOO', k.sugar ? '#f6f0e4' : '#f2e27a'); }
    }
  }
}

/* ------------------------------------------------------------------ the slot machine */
// faces: 0 a slice, 1 a coin, 2 a gift, 3 a worm, 4 a skull, 5 a star
function rollSlot(o) {
  const r = Math.random();
  let res;
  if (r < 0.03 && !o.jack) res = 'jackpot';
  else if (r < 0.16 && o.items < 2) res = 'item';
  else if (r < 0.4) res = 'coins';
  else if (r < 0.57) res = 'heart';
  else if (r < 0.73) res = 'snakes';
  else if (r < 0.78) res = 'down';
  else res = 'nothing';
  const same = { jackpot: 5, item: 2, coins: 1, heart: 0, snakes: 3, down: 4 }[res];
  if (same != null) o.target = [same, same, same];
  else { const a = rndi(0, 5); let b = rndi(0, 5); if (b === a) b = (b + 2) % 6; o.target = [a, b, rndi(0, 5)]; }
  return res;
}
function updateSlot(dt, room) {
  const o = room.slot, P = G.player;
  if (!o) return;
  o.cd = Math.max(0, o.cd - dt);
  if (o.show) o.show.t += dt;
  if (o.spin > 0) {
    o.spin -= dt; o.tick = (o.tick || 0) - dt;
    if (o.tick <= 0) {
      o.tick = 0.06; Sfx.slotTick();
      for (let i = 0; i < 3; i++) if (o.spin > 0.75 - i * 0.3) o.reels[i] = (o.reels[i] + 1) % 6;
    }
    for (let i = 0; i < 3; i++) if (o.spin <= 0.75 - i * 0.3) o.reels[i] = o.target[i];
    if (o.spin <= 0) slotResult(room, o);
    return;
  }
  const near = P.dying <= 0 && dist(P.x, P.y, o.x, o.y) < 37;
  if (!near) { o.armed = true; return; }
  if (!o.armed || o.cd > 0) return;
  o.armed = false;
  if (room.locked) return;
  if (o.broken) { UI.banner('Out of order', 'It already paid out everything it had.'); o.cd = 1; return; }
  if (curateleBlock9(null)) { o.cd = 1; return; }
  const cost = 3;
  if (G.run.coins < cost) { UI.banner('Not enough coins', `A pull costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); o.cd = 1; return; }
  G.run.coins -= cost; Meta.add('spent', cost); o.pulls++;
  floatText(o.x, o.y - 36, `-${cost}`, '#ffd84a');
  o.spin = 1.15; o.tick = 0; o.show = null; o.shake = 0.3;
  o.result = rollSlot(o);
  Sfx.coin();
}
function slotResult(room, o) {
  const res = o.result, x = o.x, y = o.y + 36;
  o.show = { res, t: 0 }; o.cd = 0.5;
  if (res === 'jackpot') {
    o.jack = true; o.items++;
    spawnItem(room, x, y, 1); dropCoins(room, x, y, 6);
    Meta.add('jackpots'); Sfx.legend(); G.shake = Math.max(G.shake, 6);
    floatText(o.x, o.y - 42, 'JACKPOT', '#ffd84a', true);
    flashLight(o.x, o.y, 200, 1, 1.2);
  } else if (res === 'item') { o.items++; spawnItem(room, x, y, 0.05); Sfx.item(); floatText(o.x, o.y - 42, 'PRIZE', '#ffd27a', true); }
  else if (res === 'coins') { dropCoins(room, x, y, 6); Sfx.register(); floatText(o.x, o.y - 42, 'PAYOUT', '#ffd84a', true); }
  else if (res === 'heart') { dropHeart(room, x, y, 2); Sfx.pickup(); floatText(o.x, o.y - 42, 'SNACK', '#ff8a8a', true); }
  else if (res === 'snakes') { slotSnakes(room); floatText(o.x, o.y - 42, 'BUST', '#e83a50', true); }
  else if (res === 'down') {
    room.spores.push({ kind: 'core', x: o.x, y: o.y - 20, vx: 0, vy: -70, t: 0, id: pickDown(), ph: rnd(10) });
    Sfx.rotRise(); floatText(o.x, o.y - 42, 'ROTTEN LUCK', '#c08ad8', true);
  } else { Sfx.thud(); floatText(o.x, o.y - 42, 'NOTHING', '#b7a89a'); }
  if (o.items >= 2 || o.jack) o.broken = true;
}
function slotSnakes(room) {
  const L = G.levelDef, P = G.player, used = new Set();
  const pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar;
  room.locked = true; room.doorCl = 0; Sfx.doorShut(); Sfx.hiss(1.1);
  const n = 2 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c);
    room.snakes.push(new Snake(pick(pool), cell.x, cell.y, { delay: 0.3 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
  }
}

/* ------------------------------------------------------------------ the spring, survival rooms, mini bosses */
function updateSpring(room) {
  const s = room.spring, P = G.player;
  if (!s || s.used || P.dying > 0) return;
  if (dist(P.x, P.y, s.x, s.y) > 26) return;
  s.used = true; s.useT = G.t;
  const healed = P.heal(4);
  const n = cleanseDowns(P);
  Sfx.splash(); Sfx.cleanse();
  burst(s.x, s.y, 24, '#9fe8ff', { min: 40, max: 150, lmin: 0.5, lmax: 1, glow: true });
  addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: 12, life: 0.6, col: '#9fe8ff', drag: 0, glow: true });
  const msg = n ? `${n === 1 ? 'A downgrade' : `${n} downgrades`} washed off.${healed ? ' Healed too.' : ''}` : healed ? 'Fresh water. You feel whole again.' : 'Cold, clear water. Nothing to wash off.';
  UI.banner('The spring', msg, 'clean');
}
function startSurvival(room) {
  const S = room.surv;
  S.on = true; S.t = 0; S.spawnT = 0.5;
  room.locked = true; room.doorCl = 0;
  Sfx.doorShut(); Sfx.stinger();
  UI.card('Survive', `${S.len} seconds`, 'They keep coming. Stay alive until the time runs out.', 'boss', 2.4);
}
function updateSurvival(dt, room) {
  const S = room.surv, P = G.player;
  if (!S || room.cleared) return;
  if (!S.on) {
    if (room.altar && P.dying <= 0 && dist(P.x, P.y, room.altar.x, room.altar.y) < P.r + 26) startSurvival(room);
    return;
  }
  if (P.dying > 0) return;
  S.t += dt; S.spawnT -= dt;
  const L = G.levelDef, tier = L.tier || 0;
  const alive = room.snakes.filter((s) => s.alive && s.dying <= 0).length;
  const cap = 3 + Math.min(3, tier) + (L.extra || 0);
  if (S.spawnT <= 0 && alive < cap && S.t < S.len - 2) {
    S.spawnT = Math.max(1.1, (tier === 0 ? 2.8 : 2.3) - S.t * 0.045);
    const pool = WAVE_POOL[L.set] || WAVE_POOL.cellar;
    let kind = pick(pool);
    if (kind === 'long' && countKind(room, 'long')) kind = 'hood';
    const cell = Game.farCell(room, P, new Set());
    room.snakes.push(new Snake(kind, cell.x, cell.y, { delay: 0, ang: Math.atan2(P.y - cell.y, P.x - cell.x), champ: S.t > S.len * 0.6 && Math.random() < 0.2 }));
  }
  if (S.t >= S.len) {
    // the time is up: everything left in the room rots away
    for (const sn of room.snakes) {
      if (!sn.alive) continue;
      sn.alive = false;
      burst(sn.x, sn.y, 14, sn.K.blood, { min: 40, max: 140, lmin: 0.4, lmax: 0.8 });
      for (const p of sn.pts) if (!p.hid && Math.random() < 0.4) severPiece(sn, p, true);
    }
    room.snakes = [];
    G.venom.length = 0;
    Sfx.roar();
    Meta.add('survived');
    Game.clearRoom(room);
  }
}
function startMini(room) {
  room.locked = true; room.doorCl = 0;
  Sfx.doorShut();
  const P = G.player, L = G.levelDef, kind = room.mini || 'hood';
  const cell = Game.farCell(room, P, new Set());
  const sn = new Snake(kind, cell.x, cell.y, { champ: true, delay: 0.7, ang: Math.atan2(P.y - cell.y, P.x - cell.x) });
  const k2 = 1.22;
  sn.K = Object.assign({}, sn.K, { headR: sn.K.headR * k2, r0: sn.K.r0 * k2, r1: sn.K.r1 * k2 });
  sn.headR = sn.K.headR; sn.spacing *= 1.15; sn.maxLen += 2; sn.len = sn.maxLen;
  sn.maxHp = sn.hp = sn.maxHp * 1.4;
  sn.mini = true; sn.displayName = `A big ${sn.K.name}`;
  if (L.traits) sn.trait = pick(sn.K.blocky ? ['spite', 'regen'] : TRAIT_IDS);
  room.snakes.push(sn);
  G.boss = sn;
  Sfx.stinger(); setTimeout(() => { if (G.room === room && G.state === 'play') Sfx.roar(); }, 800);
  UI.card('Something big', `A big ${sn.K.name}`, 'Gold, angry and twice the size. It guards a good powerup.', 'boss', 2.6);
}

/* ------------------------------------------------------------------ floor hazards */
// the cellar floor gives way, one cracked tile at a time
function updateCracks(dt, room) {
  if (!room.cracks.length || room.cleared || !room.locked) return;
  room.crackT = (room.crackT || 0) + dt;
  const P = G.player;
  for (const k of room.cracks) {
    if (k.state === 2) continue;
    const left = k.at - room.crackT;
    if (left < 1.3 && k.state === 0) { k.state = 1; Sfx.crumble(); }
    if (k.state === 1 && Math.random() < dt * 14) addP({ kind: 'dot', x: k.x + rnd(-16, 16), y: k.y + rnd(-16, 16), vx: rnd(-10, 10), vy: rnd(-30, -10), r: rnd(0.8, 1.8), life: 0.5, col: G.levelDef.dirt, drag: 2 });
    if (left > 0) continue;
    const onIt = Math.abs(P.x - k.x) < T / 2 + P.r - 5 && Math.abs(P.y - k.y) < T / 2 + P.r - 5;
    // never pull the floor out from under the apple right away: it gets a moment to step off
    if (onIt && left > -2.4) continue;
    collapseCell(room, k, onIt);
  }
}
function collapseCell(room, k, onIt) {
  k.state = 2;
  if (room.tiles[k.r][k.c]) return;
  const o = { type: 'pit', solid: true, shots: false, c: k.c, r: k.r, x: k.x, y: k.y, shake: 0, seed: k.seed, wob: 0 };
  room.tiles[k.r][k.c] = o; room.obs.push(o); room.ver++; room.dirty = true;
  burst(k.x, k.y, 18, G.levelDef.dirt, { kind: 'shard', min: 30, max: 120, rmin: 1.4, rmax: 3, lmin: 0.4, lmax: 0.8, drag: 4 });
  G.shake = Math.max(G.shake, 4);
  Sfx.collapse();
  if (onIt) {
    const P = G.player;
    P.hurt(1, k.x, k.y);
    const f = nearestFreeCell(room, P.x, P.y);
    P.x = f.x; P.y = f.y;
  }
}
// the halls: shed skins drift through the room and soak up seeds and venom alike
function placeSkins(room) {
  room.skins = [];
  const n = 2 + (Math.random() < 0.5 ? 1 : 0), P = G.player;
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0;
    for (let tries = 0; tries < 12; tries++) { x = rnd(80, RW - 80); y = rnd(70, RH - 70); if (dist(x, y, P.x, P.y) > 120) break; }
    const a = rnd(TAU), sp = rnd(15, 25);
    room.skins.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rx: rnd(27, 34), ry: rnd(15, 19), rot: rnd(TAU), vr: rnd(-0.25, 0.25), hp: 10, ripple: 0, seed: rnd(100), a: 0 });
  }
}
function skinCovers(k, x, y, r) {
  const dx = x - k.x, dy = y - k.y, c = Math.cos(-k.rot), s = Math.sin(-k.rot);
  const lx = dx * c - dy * s, ly = dx * s + dy * c;
  return (lx * lx) / ((k.rx + r) * (k.rx + r)) + (ly * ly) / ((k.ry + r) * (k.ry + r)) < 1;
}
function seedHitsSkin(room, s, sr) {
  for (const k of room.skins) {
    if (k.hp <= 0 || !skinCovers(k, s.x, s.y, sr)) continue;
    k.hp -= s.dmg; k.ripple = 0.35;
    burst(s.x, s.y, 4, '#e1dac4', { kind: 'shard', min: 20, max: 70, lmin: 0.2, lmax: 0.4 });
    return true;
  }
  return false;
}
function updateSkins(dt, room) {
  for (let i = room.skins.length - 1; i >= 0; i--) {
    const k = room.skins[i];
    k.a = Math.min(1, k.a + dt * 1.5);
    if (room.cleared) k.hp -= dt * 4;
    k.x += k.vx * dt; k.y += k.vy * dt; k.rot += k.vr * dt; k.ripple = Math.max(0, k.ripple - dt);
    if (k.x < k.rx || k.x > RW - k.rx) { k.vx = -k.vx; k.x = clamp(k.x, k.rx, RW - k.rx); }
    if (k.y < k.ry || k.y > RH - k.ry) { k.vy = -k.vy; k.y = clamp(k.y, k.ry, RH - k.ry); }
    if (k.hp <= 0) {
      for (let j = 0; j < 8; j++) addP({ kind: 'paper', x: k.x + rnd(-k.rx, k.rx) * 0.7, y: k.y + rnd(-k.ry, k.ry) * 0.7, vx: rnd(-60, 60), vy: rnd(-60, 30), r: rnd(3, 6), life: rnd(0.6, 1.1), col: '#d8d0b8', drag: 2, rot: rnd(TAU), vr: rnd(-6, 6) });
      if (!room.cleared) Sfx.paper();
      room.skins.splice(i, 1);
    }
  }
}
// the garden: roots break up through the floor where you stand
function updateRoots(dt, room) {
  const P = G.player;
  if (room.mod === 'roots' && room.locked && !room.cleared && P.dying <= 0) {
    room.rootT = (room.rootT == null ? 2.6 : room.rootT) - dt;
    if (room.rootT <= 0) {
      room.rootT = rnd(3.1, 4.1);
      const spots = [{ x: P.x + P.vx * 0.45, y: P.y + P.vy * 0.45 }];
      for (let i = 0; i < 2; i++) { const a = rnd(TAU), d = rnd(60, 130); spots.push({ x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d }); }
      for (const s of spots) {
        const x = clamp(s.x, 22, RW - 22), y = clamp(s.y, 22, RH - 22);
        const o = room.tileAt(x, y); if (o && o.solid) continue;
        room.roots.push({ x, y, t: 0, warn: 0.95, r: 24, done: false, seed: rnd(100) });
      }
      Sfx.rumble();
    }
  }
  for (let i = room.roots.length - 1; i >= 0; i--) {
    const k = room.roots[i];
    k.t += dt;
    if (!k.done && k.t >= k.warn) {
      k.done = true; Sfx.roots();
      burst(k.x, k.y, 14, G.levelDef.dirt, { kind: 'shard', min: 40, max: 130, lmin: 0.3, lmax: 0.6 });
      G.shake = Math.max(G.shake, 3);
      if (P.dying <= 0 && dist(P.x, P.y, k.x, k.y) < k.r + P.r * 0.6 && P.hurt(1, k.x, k.y)) P.rootT = 0.6;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && dist(sn.x, sn.y, k.x, k.y) < k.r + sn.headR * 0.5) { sn.hurt(2, k.x, k.y); sn.stagger = Math.max(sn.stagger, 0.6); }
    }
    if (k.t > k.warn + 0.8) room.roots.splice(i, 1);
  }
}

/* ------------------------------------------------------------------ snake traits */
const TRAIT_IDS = ['armor', 'swift', 'spite', 'regen'];
const TRAIT_NAMES = { armor: 'ARMORED', swift: 'SWIFT', spite: 'SPITEFUL', regen: 'REGROWS' };
const TRAIT_COLS = { armor: '#dfe6ee', swift: '#ffe26a', spite: '#ff6a4a', regen: '#8fe07a' };
function giveTraits(room, n) {
  if (!n) return;
  const cands = shuffle(room.snakes.filter((s) => !s.isBoss && s.alive && !s.trait && !s.mini));
  for (const sn of cands.slice(0, n)) {
    sn.trait = pick(sn.K.blocky || sn.kind === 'long' ? ['spite', 'regen', 'swift'] : TRAIT_IDS);
    const wait = ((sn.delay || 0) + (sn.spawnTime || 0.8)) * 1000 + 150;
    setTimeout(() => { if (sn.alive && G.room === room && G.state === 'play') floatText(sn.x, sn.y - sn.headR - 14, TRAIT_NAMES[sn.trait], TRAIT_COLS[sn.trait]); }, wait);
  }
}
function spiteBurst(sn) {
  if (!G.room || !G.levelDef) return;
  const n = 8, off = rnd(TAU), sp = (G.levelDef.venomSpeed || 150) * 0.8;
  for (let i = 0; i < n; i++) spawnVenom(sn.x, sn.y, off + (i / n) * TAU, sp, '#e2604e');
  flashLight(sn.x, sn.y, 60, 0.6, 0.3); Sfx.spit();
}

/* ------------------------------------------------------------------ the Splitter and the Sharpshooter */
AI.splitter = function (sn, room, dt) { AI.grub(sn, room, dt); };
AI.splitling = function (sn, room, dt) { AI.grub(sn, room, dt); };
function splitWorm(sn, room) {
  if (sn.kind !== 'splitter') return;
  for (const s of [-1, 1]) {
    const a = sn.ang + s * Math.PI / 2;
    let x = sn.x + Math.cos(a) * 12, y = sn.y + Math.sin(a) * 12;
    if (!freeAt(room, x, y, 7)) { const f = nearestFreeCell(room, x, y); x = f.x; y = f.y; }
    room.snakes.push(new Snake('splitling', x, y, { emerge: false, spawnTime: 0.25, ang: a, trait: sn.trait === 'swift' ? 'swift' : null }));
  }
  floatText(sn.x, sn.y - 22, 'SPLIT', '#8fd8c8');
  Sfx.squelch();
}
// keeps its distance, draws a red line on you, then fires down it
AI.sniper = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  if (sn.mode === 'aim') {
    const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
    if (sn.mt < 0.5) sn.aimA = turnToward(sn.aimA, toP, 2.6 * dt);
    sn.ang = sn.aimA; sn.drawAng = sn.ang; sn.mouth = Math.min(1, sn.mt * 1.5);
    if (sn.mt >= 0.95) {
      const v = spawnVenom(sn.x + Math.cos(sn.aimA) * sn.headR, sn.y + Math.sin(sn.aimA) * sn.headR, sn.aimA, (G.levelDef.venomSpeed || 150) * 2.3, '#ff4a3a');
      v.kind = 'bolt'; v.r = 4.5; v.life = 2.2;
      Sfx.bolt(); sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.6, 3.4);
    }
    return;
  }
  sn.mode = 'move';
  const { d } = keepAway(sn, room, dt, 170, 300, sn.K.speed);
  sn.cd -= dt;
  if (sn.cd <= 0 && P.dying <= 0 && d < 430 && clearLine(room, sn.x, sn.y, P.x, P.y)) {
    sn.mode = 'aim'; sn.mt = 0; sn.aimA = Math.atan2(P.y - sn.y, P.x - sn.x); Sfx.charge();
  }
};
// where a Sharpshooter's line ends: the first wall, rock or pillar
function sniperLineEnd(room, sn) {
  const ca = Math.cos(sn.aimA), sa = Math.sin(sn.aimA);
  let x = sn.x, y = sn.y;
  for (let i = 0; i < 70; i++) {
    x += ca * 8; y += sa * 8;
    if (x < 0 || y < 0 || x > RW || y > RH) break;
    const o = room.tileAt(x, y); if (o && o.shots) break;
  }
  return [x, y];
}

/* ------------------------------------------------------------------ everything above that lives in a room */
function updateRoomExtras(dt, room, frozen) {
  updateRoom9(dt, room, frozen);
  if (room.turrets.length) updateTurrets(dt, room);
  if (room.sap.length) updateSap(dt, room);
  if (room.clouds.length) updateClouds(dt, room);
  if (!frozen) {
    if (room.spores.length) updateSpores(dt, room);
    if (room.cracks.length) updateCracks(dt, room);
    if (room.skins.length) updateSkins(dt, room);
    if (room.mod === 'roots' || room.roots.length) updateRoots(dt, room);
  }
  if (room.slot) updateSlot(dt, room);
  if (room.spring) updateSpring(room);
  for (const k in room.doors) if (room.doors[k].sealed) { updateVaultDoors(room); break; }
}

/* ------------------------------------------------------------------ the world pushes back: every powerup makes snakes a bit tougher
   Values are percent extra snake HP per powerup, by how strong it makes you (0.5 to 8). */
const ITEM_THREAT = {
  // classic
  twin: 5, cyanide: 3, toffee: 2.5, worm: 3, cider: 3, big: 3.5, sling: 2, spread: 5, thorn: 3.5, rubber: 1.5, rain: 3, seeker: 3,
  frost: 3, fizzy: 3.5, halo: 4, split: 5, hungry: 2, ember: 4, boomer: 3.5, lucky: 3.5, static: 3.5, wiggle: 1.5, quick: 3, sharp: 3,
  sniper: 2.5, peel: 2.5, sprout: 2, spiky: 3, glow: 0.5, clover: 2, juice: 1.5, magnet: 0.5, regrow: 1.5, nova: 4, cannon: 8, buddy: 4.5,
  phoenix: 4, storm: 5, crown: 7, chrono: 4, mirror: 4.5, vamp: 3, pump: 1, capy: 4, chill: 2, brim: 5, coaster: 2.5, pick: 0.5, fuse: 3,
  pact: 5, dropper: 4, bonus: 0.5, tag: 3.5, gratis: 1, hagel: 2.5, kroket: 2, klomp: 3, motie: 4.5, hamer: 4.5, stroop: 3, molen: 3.5,
  veto: 3.5, coalitie: 5, deltaplan: 6.5, golden: 2.5, compost: 3, graft: 3, bruised: 3, sap: 1.5, seedbank: 2, pollen: 3, dash: 3,
  // v9
  bass: 3.5, rave: 1.5, vinyl: 3, kaas: 2, bank: 3.5, ov: 2, schaar: 2.5, stok: 1.5, wheek: 2.5, perfect: 3.5, sticky: 3, nitro: 3, horn: 3,
  bril: 2, bezwaar: 2.5, mandje: 0.5, haring: 2, bitterbal: 1.5, pinda: 3, oliebol: 3, verzoek: 0.5, fiets: 2.5, zonnebril: 1.5, koffie: 3,
  disco: 6, drop: 7, speaker: 5, remix: 5, wheel: 4.5, curator: 3,
  // v10
  assseed: 3, skyrain: 3.5, flap: 1.5, vitamine: 1, puntje: 1.5, elastiek: 1.5, verrekijker: 1, dikkepit: 1.5, gympies: 1, vliegenmepper: 3,
  kaasschaaf: 4, rodestip: 2, knoflook: 2.5, tulp: 1, paraplu: 2, helm: 2, nicotine: 1.5, peuk: 3, rookgordijn: 2.5, koptelefoon: 1.5,
  hyperfocus: 4, special: 2.5, patroon: 2.5, fidget: 3.5, deken: 1.5, drone: 5, stofzuiger: 1.5, garantie: 1.5, supermeter: 5, powercube: 4,
  bosje: 2, pepernoot: 3, clownneus: 3, ballon: 3.5, hypercharge: 6, magnetron: 5, inzone: 4, gasmasker: 1, meeuw: 5.5, beker: 5,
  reuzenkracht: 6,
};
const THREAT_SOFT = 40, THREAT_HARD = 60; // percent: full rate up to 40, half rate after that, never above 60
function itemThreat(id) {
  if (ITEM_THREAT[id] != null) return ITEM_THREAT[id];
  const it = (typeof ITEMS !== 'undefined' && ITEMS[id]) || null;
  return it && it.w != null && it.w < 1 ? 6 : 2; // a powerup that is not in the table: 2 normal, 6 rare
}
function threatSum14(P) {
  const start = (CHARS[P.char] && CHARS[P.char].start) || [];
  let sum = 0;
  for (const id of P.items) { if (start.indexOf(id) >= 0) continue; sum += itemThreat(id); }
  return sum;
}
function enemyPowerPct(P) {
  P = P || G.player; if (!P || !P.items) return 0;
  let sum = 0;
  if (MP14.on) { const L = livePlayers14().filter((Q) => Q.items); for (const Q of L) sum += threatSum14(Q); sum = L.length ? sum / L.length : threatSum14(P); }   /* B2: the living apples' average */
  else sum = threatSum14(P);
  if (sum > THREAT_SOFT) sum = THREAT_SOFT + (sum - THREAT_SOFT) * 0.5;
  return Math.min(sum, THREAT_HARD);
}
function enemyPowerK(P) { return 1 + enemyPowerPct(P) / 100; }

/* ------------------------------------------------------------------ bosses scale a little with what you carry */
function bossHpK() {
  const L = G.levelDef, P = G.player;
  return (L.bossMult || 1) * enemyPowerK(P) * mpBossHpK14();      /* B1: boss and mini boss HP for n apples */
}

/* ------------------------------------------------------------------ what the info card shows */
function infoFor(p) {
  const P = G.player;
  if (p.kind === 'item') {
    const it = ITEMS[p.id];
    const out = { x: p.x, y: p.y - 12, title: it.name, tag: it.rare ? 'LEGENDARY' : 'POWERUP', tagCol: it.rare ? '#ffb43a' : '#e3a54a', body: it.desc, notes: [] };
    if (p.cost) { const c = priceOf(p); out.notes.push([`${c} coins. You have ${G.run.coins}.`, G.run.coins >= c ? '#ffe7a0' : '#ff8a7a']); }
    if (p.price) out.notes.push(['Costs one apple of health, for good.', '#ff8a7a']);
    if (p.curseCost) { const C = CURSES[p.curseCost]; out.notes.push([`Comes with a curse: ${C.name}. ${C.desc}`, '#c48af0']); }
    if (p.vote) out.notes.push(['A vote. Take one motion and the other one fails.', '#e8a26a']);
    else if (p.grp) out.notes.push([p.book ? 'Take one book. The others burn.' : 'Pick one. The other one vanishes.', '#b7a89a']);
    if (p.gift) out.notes.push([p.gift === 'saved' ? 'Saved for you from your last run.' : p.gift === 'custom' ? 'Your start powerup.' : `Reward for ${p.gift}.`, '#9be37a']);
    return out;
  }
  if (p.kind === 'cleanse') return { x: p.x, y: p.y - 6, title: 'Apple Wash', tag: 'SHOP', tagCol: '#7cd8ff', body: 'Washes off your oldest downgrade. With no downgrades, it washes off your newest curse.', notes: [[`${priceOf(p)} coins. You have ${G.run.coins}.`, G.run.coins >= priceOf(p) ? '#ffe7a0' : '#ff8a7a']] };
  if (p.kind === 'reroll') return { x: p.x, y: p.y - 6, title: 'Reroll machine', tag: 'SHOP', tagCol: '#7cd8ff', body: 'Swaps the three powerups on the counter for new ones. Every pull costs more.', notes: [[`${priceOf(p)} coins. You have ${G.run.coins}.`, G.run.coins >= priceOf(p) ? '#ffe7a0' : '#ff8a7a']] };
  if (p.kind === 'key') return { x: p.x, y: p.y - 6, title: 'Vault key', tag: 'KEY', tagCol: '#ffd27a', body: 'Opens one barred vault door. Keys keep from floor to floor.', notes: [] };
  if (p.kind === 'heart') return { x: p.x, y: p.y - 6, title: 'Two apple slices', tag: 'SHOP', tagCol: '#7cd8ff', body: 'Heals one whole apple.', notes: [[`${priceOf(p)} coins. You have ${G.run.coins}.`, G.run.coins >= priceOf(p) ? '#ffe7a0' : '#ff8a7a']] };
  void P;
  return null;
}
function infoTarget() {
  const P = G.player, room = G.room;
  if (!P || !room || P.dying > 0 || P.escaping > 0 || G.trans || G.state !== 'play') return null;
  let best = null, bd = 68 * 68;
  for (const p of room.pickups) {
    if (!(p.kind === 'item' || p.kind === 'cleanse' || p.kind === 'reroll' || p.kind === 'key' || (p.kind === 'heart' && p.cost))) continue;
    if (p.kind === 'item' && p.t < 0.5) continue;
    const d = dist2(P.x, P.y, p.x, p.y - 8);
    if (d < bd) { bd = d; best = p; }
  }
  if (best) { const o = infoFor(best); if (o) o.key = best; return o; }
  const o = room.slot;
  if (o && dist(P.x, P.y, o.x, o.y) < 74) return { key: o, x: o.x, y: o.y - 18, title: 'Slot machine', tag: 'GAMBLE', tagCol: '#f2c230', body: o.broken ? 'Out of order. It paid out everything it had.' : 'Walk into it to pull. Snacks, coins, powerups or the jackpot. Sometimes snakes. Sometimes rot.', notes: o.broken ? [] : [[`3 coins a pull. You have ${G.run.coins}.`, G.run.coins >= 3 ? '#ffe7a0' : '#ff8a7a']] };
  const s = room.spring;
  if (s && !s.used && dist(P.x, P.y, s.x, s.y) < 74) return { key: s, x: s.x, y: s.y - 14, title: 'The spring', tag: 'REST', tagCol: '#7ce0d0', body: 'Step in once: it heals two apples and washes off every downgrade you carry.', notes: [] };
  return info9(room, P);
}

