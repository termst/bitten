/* src/14-supermarket.js: supermarket and Second Chamber: coins, carts, belts, spikes, worms, two bosses. From v7. Lines 7668 to 8274 of the v13.7 script. */
/* =====================================================================
   The supermarket and the Second Chamber: coins and shops, carts,
   conveyor belts, spike traps, the new worms, the Price War,
   The Coalition, and what the new powerups do
   ===================================================================== */

/* ------------------------------------------------------------------ coins */
function dropCoins(room, x, y, n) {
  const P = G.player;
  let k = n;
  if (P && P.bonus) k = Math.floor(n * 1.5 + Math.random());
  if (G.run && G.run.twist && G.run.twist.id === 'gold') k *= 2;
  if (P && P.flags && P.flags.greedy) k *= 2;
  for (let i = 0; i < k; i++) {
    const a = rnd(TAU), sp = rnd(50, 115);
    room.pickups.push({ kind: 'coin', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, ph: rnd(10) });
  }
}
// powerups get pricier with every one you buy in a run
function priceOf(p) {
  const P = G.player;
  let c = p.cost;
  if (p.kind === 'item' && G.run) c += Math.min(10, 2 * (G.run.bought || 0));
  if (P && P.bonus) c *= 0.67;
  if (P && P.flags && P.flags.greedy) c *= 1.5;
  return Math.max(1, Math.ceil(c));
}

/* ------------------------------------------------------------------ shopping carts */
function updateCarts(dt, room) {
  const P = G.player, C = room.carts;
  for (let i = C.length - 1; i >= 0; i--) {
    const k = C[i];
    if (k.temp != null) {
      k.temp -= dt;
      if (k.temp <= 0) { burst(k.x, k.y, 10, '#cfd6de', { kind: 'shard', min: 30, max: 100, lmin: 0.3, lmax: 0.6 }); C.splice(i, 1); continue; }
    }
    k.hitCd = Math.max(0, k.hitCd - dt);
    const sp0 = Math.hypot(k.vx, k.vy);
    // the apple shoves carts it walks into; carts a worm sent flying hurt
    if (P.dying <= 0 && P.escaping <= 0) {
      const dx = k.x - P.x, dy = k.y - P.y, d = Math.hypot(dx, dy), rr = k.r + P.r - 1;
      if (d < rr && d > 0.01) {
        const nx = dx / d, ny = dy / d, push = rr - d;
        if (k.last === 'worm' && sp0 > 150 && k.hitCd <= 0) { P.hurt(1, k.x, k.y); k.hitCd = 0.6; k.vx *= 0.3; k.vy *= 0.3; }
        k.x += nx * push * 0.75; k.y += ny * push * 0.75; P.x -= nx * push * 0.25; P.y -= ny * push * 0.25;
        const pv = P.vx * nx + P.vy * ny;
        if (pv > 30) {
          const imp = Math.max(pv * 2.1, 190);
          k.vx = nx * imp; k.vy = ny * imp; k.last = 'player';
          if (k.hitCd <= 0) { Sfx.cart(); k.hitCd = 0.2; }
        }
      }
    }
    for (const sn of room.snakes) {
      if (!sn.alive || sn.burrowed || sn.state !== 'active' || sn.dying > 0) continue;
      const ex = k.x - sn.x, ey = k.y - sn.y, e = Math.hypot(ex, ey), er = k.r + sn.headR;
      if (e >= er || e < 0.01) continue;
      const sp = Math.hypot(k.vx, k.vy);
      if (sp > 130 && k.last === 'player' && k.hitCd <= 0) {
        sn.hurt(2.5 + sp / 80, k.x, k.y); sn.stagger = Math.max(sn.stagger, 0.6);
        k.hitCd = 0.3; k.vx *= -0.3; k.vy *= -0.3;
        Meta.add('cartHits'); Sfx.clang(); G.shake = Math.max(G.shake, 4);
        burst(k.x, k.y, 8, '#cfd6de', { kind: 'shard', min: 40, max: 120, lmin: 0.2, lmax: 0.4 });
      } else {
        const nx = ex / e, ny = ey / e;
        k.x += nx * (er - e) * 0.6; k.y += ny * (er - e) * 0.6;
        k.vx += nx * 40; k.vy += ny * 40;
      }
    }
  }
  // carts knock into each other
  for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
    const a = C[i], b = C[j];
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), rr = a.r + b.r;
    if (d >= rr || d < 0.01) continue;
    const nx = dx / d, ny = dy / d, o = (rr - d) / 2;
    a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
    const va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny;
    if (va - vb > 0) {
      const dv = (va - vb) * 0.9;
      a.vx -= nx * dv; a.vy -= ny * dv; b.vx += nx * dv; b.vy += ny * dv;
      if (a.last === 'player' || b.last === 'player') a.last = b.last = 'player';
      if (dv > 80) Sfx.cart();
    }
  }
  for (const k of C) {
    const damp = Math.max(0, 1 - (room.ice ? 0.55 : 1.8) * dt);
    k.vx *= damp; k.vy *= damp;
    let sp = Math.hypot(k.vx, k.vy);
    if (sp < 6) { k.vx = 0; k.vy = 0; sp = 0; if (k.last === 'worm') k.last = null; }
    let nx = k.x + k.vx * dt, ny = k.y + k.vy * dt;
    const m = k.r;
    if (nx < m) { nx = m; k.vx = Math.abs(k.vx) * 0.5; } else if (nx > RW - m) { nx = RW - m; k.vx = -Math.abs(k.vx) * 0.5; }
    if (ny < m) { ny = m; k.vy = Math.abs(k.vy) * 0.5; } else if (ny > RH - m) { ny = RH - m; k.vy = -Math.abs(k.vy) * 0.5; }
    const [rx, ry] = resolveTiles(room, nx, ny, m);
    const bx = Math.abs(rx - nx) > 0.05, by = Math.abs(ry - ny) > 0.05;
    if (bx) k.vx = -k.vx * 0.5;
    if (by) k.vy = -k.vy * 0.5;
    if ((bx || by) && sp > 120) { Sfx.cart(); G.shake = Math.max(G.shake, 1.5); }
    k.x = rx; k.y = ry;
    if (sp > 25) k.ang = turnToward(k.ang, Math.atan2(k.vy, k.vx), dt * 5);
    k.spin += sp * dt;
  }
}
// a seed or a lob hits a cart: it rolls away
function seedHitsCart(room, s, sr) {
  for (const k of room.carts) {
    if (dist2(s.x, s.y, k.x, k.y) < (k.r + sr) * (k.r + sr)) {
      k.vx += s.vx * 0.5; k.vy += s.vy * 0.5; k.last = 'player';
      if (k.hitCd <= 0) { Sfx.cart(); k.hitCd = 0.12; }
      return true;
    }
  }
  return false;
}
function cartsIn(room, n) {
  const P = G.player;
  for (let i = 0; i < n; i++) {
    const side = rndi(0, 3);
    let x, y;
    if (side === 0) { x = rnd(40, RW - 40); y = 16; } else if (side === 1) { x = rnd(40, RW - 40); y = RH - 16; }
    else if (side === 2) { x = 16; y = rnd(40, RH - 40); } else { x = RW - 16; y = rnd(40, RH - 40); }
    const f = freeAt(room, x, y, 13) ? { x, y } : nearestFreeCell(room, x, y);
    const a = Math.atan2(P.y - f.y, P.x - f.x) + rnd(-0.15, 0.15);
    room.carts.push({ x: f.x, y: f.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, r: 13, ang: a, last: 'worm', hitCd: 0, spin: 0, temp: 9 });
  }
  while (room.carts.filter((k) => k.temp != null).length > 6) room.carts.splice(room.carts.findIndex((k) => k.temp != null), 1);
  Sfx.cart();
}

/* ------------------------------------------------------------------ conveyor belts */
function beltAt(room, x, y) {
  const c = Math.floor(x / T), r = Math.floor(y / T);
  return c >= 0 && r >= 0 && c < COLS && r < ROWS ? room.beltMap[r * COLS + c] : 0;
}
function updateBelts(dt, room) {
  const sp = 78, P = G.player;
  room.beltPh = (room.beltPh || 0) + dt * sp;
  if (P.dying <= 0 && P.escaping <= 0) {
    const d = beltAt(room, P.x, P.y);
    if (d) { const [nx, ny] = resolveTiles(room, P.x + d * sp * dt, P.y, P.r); P.x = clamp(nx, P.r, RW - P.r); P.y = ny; }
  }
  for (const sn of room.snakes) {
    if (!sn.alive || sn.burrowed || sn.state !== 'active' || sn.isBoss || sn.dying > 0) continue;
    const d = beltAt(room, sn.x, sn.y);
    if (d && freeAt(room, sn.x + d * sp * 0.6 * dt, sn.y, sn.headR * 0.7)) sn.moveTo(sn.x + d * sp * 0.6 * dt, sn.y);
  }
  for (const k of room.carts) { const d = beltAt(room, k.x, k.y); if (d) k.vx += d * 150 * dt; }
  for (const p of room.pickups) {
    if ((p.kind !== 'heart' && p.kind !== 'coin') || p.cost) continue;
    const d = beltAt(room, p.x, p.y);
    if (d) p.x = clamp(p.x + d * sp * dt, 8, RW - 8);
  }
}

/* ------------------------------------------------------------------ spike traps */
const SPIKE_CYCLE = 2.6;
function updateSpikes(dt, room) {
  if (room.cleared) { for (const s of room.spikes) s.h = approach(s.h || 0, 0, dt * 4); return; }
  room.spikeT = (room.spikeT || 0) + dt;
  const P = G.player;
  let rose = false;
  for (const s of room.spikes) {
    const u = (room.spikeT - (s.g ? SPIKE_CYCLE / 2 : 0) + SPIKE_CYCLE * 4) % SPIKE_CYCLE;
    const up = u < 0.95, warn = u > SPIKE_CYCLE - 0.45;
    if (up && !s.up) rose = true;
    s.up = up; s.warn = warn;
    s.h = approach(s.h || 0, up ? 1 : warn ? 0.28 : 0, dt * (up ? 14 : 5));
    if (s.h < 0.7) continue;
    const x = (s.c + 0.5) * T, y = (s.r + 0.5) * T;
    if (P.dying <= 0 && P.escaping <= 0 && Math.abs(P.x - x) < T / 2 - 3 && Math.abs(P.y - y) < T / 2 - 3) P.hurt(1, P.x - P.vx * 0.05, P.y - P.vy * 0.05 + 1);
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed || sn.isBoss || (sn.spikeCd || 0) > G.t) continue;
      if (Math.abs(sn.x - x) < T / 2 && Math.abs(sn.y - y) < T / 2) { sn.hurt(1.2, sn.x, sn.y); sn.spikeCd = G.t + 0.6; }
    }
  }
  if (rose && G.room === room) Sfx.spikes();
}

/* ------------------------------------------------------------------ powerups from the chamber and the store */
function updatePlayerExtras(P, dt, room, sp) {
  if (P.klomp) {
    if (sp > 60) { P.stompT -= dt; if (P.stompT <= 0) { P.stompT = 0.42; stomp(P, room); } }
    else P.stompT = Math.min(P.stompT, 0.15);
  }
  if (P.molen) {
    P.molenA = (P.molenA || 0) + dt * (2 + (P.molenT < 0.8 ? 12 : 0));
    if (room.locked && room.snakes.some((s) => s.alive)) { P.molenT -= dt; if (P.molenT <= 0) { P.molenT = 7; gust(P, room); } }
  }
  if (P.delta && room.locked && room.snakes.some((s) => s.alive && s.state === 'active')) {
    P.deltaT -= dt;
    if (P.deltaT <= 0 && !G.flood) { P.deltaT = 10; G.flood = { t: 0, dir: P.x < RW / 2 ? 1 : -1, hit: new Set(), x: -50 }; Sfx.splash(); }
  }
  if (G.flood) updateFlood(dt, room);
  if (P.coalitie) {
    for (const w of P.coalitie) {
      w.a += dt * 2.1; w.x = P.x + Math.cos(w.a) * 38; w.y = P.y + Math.sin(w.a) * 33;
      w.cd -= dt;
      if (w.cd > 0) continue;
      for (const sn of room.snakes) {
        if (sn.canBeHit() && sn.hitTest(w.x, w.y, 8)) {
          sn.hurt(1.4 + P.dmg * 0.3, w.x, w.y); w.cd = 0.4;
          burst(w.x, w.y, 4, w.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4 });
          break;
        }
      }
    }
  }
  if (P.motieGo > 0) { P.motieGo -= dt; if (P.motieGo <= 0) passMotion(P, room); }
  updatePlayerExtras3(P, dt, room, sp);
  updatePlayer9(P, dt, room, sp);
}
function stomp(P, room) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit()) continue;
    if (sn.burrowed) { if (dist(sn.x, sn.y, P.x, P.y) < 90) popUp(sn, room); continue; }
    if (sn.hitTest(P.x, P.y + 4, 26)) { sn.hurt(0.7 + P.dmg * 0.35, P.x, P.y); sn.stagger = Math.max(sn.stagger, 0.25); }
  }
  addP({ kind: 'ring', x: P.x, y: P.y + 10, vx: 0, vy: 0, r: 6, life: 0.3, col: '#e6c27a', drag: 0 });
  burst(P.x, P.y + 10, 4, G.levelDef.dirt, { min: 20, max: 60, lmin: 0.2, lmax: 0.4 });
  Sfx.tone(95, 0.09, { to: 55, vol: 0.07 });
}
// force a digging snake up out of the floor, without the bite
function popUp(sn, room) {
  if (!sn.burrowed) return;
  sn.surfaceNow();
  sn.mode = sn.kind === 'coalition' ? 'move' : 'surface'; sn.mt = 0; sn.stagger = 0.7; sn.surfaceT = rnd(1.6, 2.4);
  burst(sn.x, sn.y, 10, G.levelDef.dirt, { min: 40, max: 120, lmin: 0.3, lmax: 0.6 });
  floatText(sn.x, sn.y - 18, 'UP', '#e6c27a');
}
function gust(P, room) {
  for (const v of G.venom) burst(v.x, v.y, 3, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
  G.venom.length = 0;
  for (const sn of room.snakes) if (sn.canBeHit()) sn.slow = Math.max(sn.slow, 1.6);
  const a = rnd(TAU);
  for (let i = 0; i < 22; i++) {
    const sp = rnd(380, 560);
    addP({ kind: 'wind', x: rnd(-40, RW + 40), y: rnd(-20, RH + 20), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(10, 22), life: rnd(0.35, 0.6), col: '#dcebff', drag: 0 });
  }
  Sfx.gust();
  floatText(P.x, P.y - 28, 'WIND', '#dcebff');
}
function updateFlood(dt, room) {
  const f = G.flood; f.t += dt;
  const dur = 1.3, u = f.t / dur;
  const fx = f.dir > 0 ? -40 + u * (RW + 80) : RW + 40 - u * (RW + 80);
  f.x = fx;
  const P = G.player;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || f.hit.has(sn)) continue;
    if (Math.abs(sn.x - fx) < 26) {
      f.hit.add(sn);
      if (sn.burrowed) popUp(sn, room);
      sn.hurt(3 + P.dmg, sn.x, sn.y); sn.slow = Math.max(sn.slow, 1);
      burst(sn.x, sn.y, 8, '#9ad0ff', { min: 30, max: 110, lmin: 0.3, lmax: 0.6 });
    }
  }
  if (room.fires) for (const fi of room.fires) if (Math.abs(fi.x - fx) < 30) fi.t = Math.max(fi.t, fi.life - 0.2);
  for (let i = G.venom.length - 1; i >= 0; i--) if (Math.abs(G.venom[i].x - fx) < 20) G.venom.splice(i, 1);
  if (Math.random() < dt * 40) addP({ kind: 'dot', x: fx + rnd(-10, 10), y: rnd(0, RH), vx: f.dir * rnd(60, 160), vy: rnd(-60, 60), r: rnd(1.2, 2.6), life: rnd(0.3, 0.6), col: '#bfe4ff', drag: 3 });
  if (f.t >= dur) G.flood = null;
}
function passMotion(P, room) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit()) continue;
    sn.hurt(sn.isBoss ? 3 + P.dmg : 4 + P.dmg * 2, sn.x, sn.y);
    burst(sn.x, sn.y, 5, '#f2f0ea', { kind: 'shard', min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
  }
  floatText(P.x, P.y - 34, 'MOTIE AANGENOMEN', '#f2f0ea', true);
  Sfx.gavel(); G.shake = Math.max(G.shake, 5); flashLight(P.x, P.y, 160, 0.7, 0.5);
  for (let i = 0; i < 16; i++) addP({ kind: 'paper', x: rnd(0, RW), y: rnd(-20, RH * 0.5), vx: rnd(-30, 30), vy: rnd(30, 80), r: rnd(3, 5), life: rnd(1, 1.8), col: '#f2f0ea', drag: 0.5, rot: rnd(TAU), vr: rnd(-4, 4) });
}
function vetoAll(P, room) {
  for (const sn of room.snakes) if (sn.alive && sn.dying <= 0) sn.stun = Math.max(sn.stun || 0, 3);
  for (const v of G.venom) burst(v.x, v.y, 3, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
  G.venom.length = 0;
  UI.banner('VETO', 'Everything stops. Get out of there.');
  Sfx.gavel(); G.whiteout = Math.max(G.whiteout, 0.25); flashLight(P.x, P.y, 220, 1, 0.8);
  P.inv = Math.max(P.inv, 1.5);
}
function gavelOrder(P, room) {
  for (const sn of room.snakes) if (sn.canBeHit()) sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.6 : 1.1);
  floatText(P.x, P.y - 30, 'ORDER', '#ffd27a', true); Sfx.gavel(); G.shake = Math.max(G.shake, 4);
  addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r: 10, life: 0.45, col: '#ffd27a', drag: 0 });
}

/* ------------------------------------------------------------------ thrown things */
function throwTag(sn, ang, speed) {
  const v = spawnVenom(sn.x + Math.cos(ang) * sn.headR, sn.y + Math.sin(ang) * sn.headR, ang, speed || G.levelDef.venomSpeed * 1.05, '#eef6fb');
  v.kind = 'tag'; v.home = sn; v.out = 0.75; v.life = 3.2; v.r = 6.5; v.spin = 0;
  sn.mouth = 1; Sfx.paper();
  return v;
}
function steerVenom(v, dt) {
  if (v.kind !== 'tag' || v.t < v.out) return false;
  const o = v.home;
  if (!o || !o.alive || o.dying > 0) return false;
  const sp = Math.hypot(v.vx, v.vy), a = Math.atan2(v.vy, v.vx);
  const na = turnToward(a, Math.atan2(o.y - v.y, o.x - v.x), 5.5 * dt);
  v.vx = Math.cos(na) * sp; v.vy = Math.sin(na) * sp;
  return dist2(v.x, v.y, o.x, o.y) < (o.headR + 6) * (o.headR + 6);
}

/* ------------------------------------------------------------------ charging, shared by several worms */
function chargeStep(sn, room, dt, sp, maxT) {
  const m = sn.headR * 0.8, ox = sn.x, oy = sn.y;
  let nx = sn.x + Math.cos(sn.chargeAng) * sp * dt, ny = sn.y + Math.sin(sn.chargeAng) * sp * dt;
  [nx, ny] = resolveTiles(room, nx, ny, m);
  nx = clamp(nx, m, RW - m); ny = clamp(ny, m, RH - m);
  const blocked = Math.hypot(nx - ox, ny - oy) < sp * dt * 0.5;
  sn.moveTo(nx, ny); sn.drawAng = sn.ang; sn.mouth = 1;
  for (const k of room.carts) {
    if (k.hitCd <= 0 && dist(k.x, k.y, sn.x, sn.y) < k.r + sn.headR + 2) {
      k.vx = Math.cos(sn.chargeAng) * 340; k.vy = Math.sin(sn.chargeAng) * 340; k.last = 'worm'; k.hitCd = 0.15; Sfx.clang();
    }
  }
  if (blocked) {
    G.shake = Math.max(G.shake, sn.isBoss ? 9 : 5); Sfx.thud();
    burst(sn.x + Math.cos(sn.chargeAng) * sn.headR, sn.y + Math.sin(sn.chargeAng) * sn.headR, 10, G.levelDef.rock, { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.7 });
    return 'crash';
  }
  return sn.mt > maxT ? 'end' : null;
}
// approach, rear up, charge in a straight line, crash into whatever is in the way
function chargeAI(sn, room, dt, o) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.mt += dt; sn.wig += dt * 3;
  if (sn.mode === 'rear') {
    sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.07; sn.mouth = 1;
    if (sn.mt >= o.rearT) { sn.mode = 'charge'; sn.mt = 0; sn.chargeAng = sn.ang; if (sn.isBoss) Sfx.roar(); else Sfx.boost(); }
  } else if (sn.mode === 'charge') {
    const r = chargeStep(sn, room, dt, o.chargeSpeed, o.chargeT || 1.2);
    if (r) { sn.mode = 'stun'; sn.mt = 0; if (r === 'crash' && o.crash) o.crash(sn, room); }
  } else if (sn.mode === 'stun') {
    sn.drawAng = sn.ang + Math.sin(sn.mt * 18) * 0.15;
    if (sn.mt > o.stunT) { sn.mode = 'move'; sn.chargeCd = rnd(o.cd[0], o.cd[1]); }
  } else {
    sn.mode = 'move';
    steerMove(sn, room, toP + Math.sin(sn.wig) * 0.4, o.speed, sn.K.turn || 2.6, dt);
    sn.chargeCd -= dt;
    if (o.extra && o.extra(sn, room, dt, d)) return;
    if (sn.chargeCd <= 0 && d > 80 && d < (o.range || 340) && P.dying <= 0 && clearLine(room, sn.x, sn.y, P.x, P.y)) { sn.mode = 'rear'; sn.mt = 0; Sfx.hiss(1.1); }
  }
}
// hang back at a distance and circle, like the hoods do
function keepAway(sn, room, dt, near, far, speed, avoid) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  let desired;
  if (d < near) desired = toP + Math.PI + sn.strafe * 0.5;
  else if (d > far) desired = toP + sn.strafe * 0.3;
  else desired = toP + sn.strafe * (Math.PI / 2);
  // do not pile up on a partner
  if (avoid && avoid.alive && !avoid.burrowed && dist(avoid.x, avoid.y, sn.x, sn.y) < 90) {
    const away = Math.atan2(sn.y - avoid.y, sn.x - avoid.x);
    desired = away + angDiff(away, desired) * 0.35;
  }
  if (Math.random() < dt * 0.3) sn.strafe *= -1;
  sn.wig += dt * 3;
  steerMove(sn, room, desired + Math.sin(sn.wig) * 0.3, speed, sn.K.turn || 3, dt);
  return { d, toP };
}

/* ------------------------------------------------------------------ the supermarket worms */
AI.bonus = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  if (sn.mode === 'wind') {
    const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
    sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang;
    if (sn.mt > 0.4) { throwTag(sn, toP); sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.3, 3.1); }
    return;
  }
  const { d } = keepAway(sn, room, dt, 130, 250, sn.K.speed);
  sn.cd -= dt;
  if (sn.cd <= 0 && P.dying <= 0 && d < 340 && !G.venom.some((v) => v.home === sn)) { sn.mode = 'wind'; sn.mt = 0; Sfx.hiss(0.5); }
};
AI.discount = function (sn, room, dt) {
  chargeAI(sn, room, dt, {
    speed: sn.K.speed, rearT: 0.6, chargeSpeed: 290, chargeT: 1.15, stunT: 1.0, cd: [2.4, 3.4],
    crash: (s, r) => { dropCoins(r, s.x, s.y, 1); floatText(s.x, s.y - 20, 'KORTING', '#f2c200'); },
  });
};

/* ------------------------------------------------------------------ the Second Chamber */
AI.kamerlid = function (sn, room, dt) {
  const P = G.player;
  // the first kamerlid in the room keeps the voting clock for all of them
  let lead = room.kmLead;
  if (!lead || !lead.alive || lead.dying > 0) lead = room.kmLead = sn;
  if (lead === sn) {
    room.voteCd = (room.voteCd == null ? 2.6 : room.voteCd) - dt;
    if (room.voteCd <= 0) { room.voteCd = rnd(3.2, 3.9); room.voteAt = G.t + 0.6; Sfx.paper(); }
  }
  if (sn.voted === undefined) sn.voted = room.voteAt || 0;
  const raising = room.voteAt && G.t < room.voteAt;
  sn.raise = raising ? Math.min(1, (sn.raise || 0) + dt * 5) : Math.max(0, (sn.raise || 0) - dt * 4);
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  if (room.voteAt && G.t >= room.voteAt && sn.voted !== room.voteAt) {
    sn.voted = room.voteAt;
    if (P.dying <= 0 && d < 420) {
      const v = spawnVenom(sn.x + Math.cos(toP) * sn.headR, sn.y + Math.sin(toP) * sn.headR, toP, G.levelDef.venomSpeed * 0.92, '#f2f0ea');
      v.kind = 'paper'; v.spin = rnd(TAU); sn.mouth = 1;
    }
  }
  sn.wig += dt * 4;
  let desired;
  if (d < 110) desired = toP + Math.PI + sn.strafe * 0.6;
  else if (d > 220) desired = toP + Math.sin(sn.wig * 0.5) * 0.5;
  else desired = toP + sn.strafe * 1.3;
  if (Math.random() < dt * 0.35) sn.strafe *= -1;
  steerMove(sn, room, desired + Math.sin(sn.wig) * 0.35, sn.K.speed * (raising ? 0.3 : 1), sn.K.turn, dt);
};
AI.lobby = function (sn, room, dt) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.wig += dt * 3; sn.mt += dt;
  // hide behind the others
  let ally = null, ad = 1e9;
  for (const o of room.snakes) {
    if (o === sn || !o.alive || o.dying > 0 || o.burrowed || o.kind === 'lobby') continue;
    const e = dist(o.x, o.y, sn.x, sn.y); if (e < ad) { ad = e; ally = o; }
  }
  let desired;
  if (ally && d > 120) {
    const ap = dist(P.x, P.y, ally.x, ally.y) || 1;
    const ax = ally.x - ((P.x - ally.x) / ap) * 60, ay = ally.y - ((P.y - ally.y) / ap) * 60;
    desired = Math.atan2(ay - sn.y, ax - sn.x);
  } else desired = d < 200 ? toP + Math.PI + sn.strafe * 0.7 : toP + sn.strafe * 1.4;
  if (Math.random() < dt * 0.3) sn.strafe *= -1;
  steerMove(sn, room, desired + Math.sin(sn.wig) * 0.3, sn.K.speed, sn.K.turn, dt);
  sn.cd -= dt;
  if (sn.cd > 0) return;
  // a deal: shield and patch up an ally
  let tgt = null, td = 280;
  for (const o of room.snakes) {
    if (o === sn || !o.canBeHit() || o.burrowed || o.isBoss || o.kind === 'lobby' || (o.shieldT || 0) > 0) continue;
    const e = dist(o.x, o.y, sn.x, sn.y); if (e < td) { td = e; tgt = o; }
  }
  if (tgt) {
    tgt.shieldT = 4.5;
    const heal = Math.min(3, tgt.maxHp - tgt.hp);
    if (heal > 0) { tgt.hp += heal; tgt.len = tgt.lenFor(); }
    addP({ kind: 'zap', x: sn.x, y: sn.y, x2: tgt.x, y2: tgt.y, vx: 0, vy: 0, r: 1, life: 0.3, col: '#ffd27a', glow: true, drag: 0, seed: rnd(100) });
    floatText(tgt.x, tgt.y - 22, 'DEAL', '#e3a54a');
    Sfx.coin(); sn.cd = rnd(3.4, 4.4); sn.mouth = 1;
  } else if (P.dying <= 0 && d < 360) {
    // nobody left to buy: throw money at the problem
    const v = spawnVenom(sn.x + Math.cos(toP) * sn.headR, sn.y + Math.sin(toP) * sn.headR, toP, G.levelDef.venomSpeed, '#ffd27a');
    v.kind = 'coin'; v.r = 5.5;
    sn.cd = rnd(1.6, 2.2); sn.mouth = 1; Sfx.coin();
  } else sn.cd = 0.5;
};

/* ------------------------------------------------------------------ boss: the Price War */
AI.pwblue = function (sn, room, dt) {
  const P = G.player, rage = sn.enraged ? 1.35 : 1;
  sn.mt += dt;
  if (sn.mode === 'wind') {
    const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
    sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang; sn.mouth = 1;
    if (sn.mt > 0.45 / rage) {
      const n = sn.enraged ? 5 : 3;
      for (let i = 0; i < n; i++) throwTag(sn, toP + (i - (n - 1) / 2) * 0.32, G.levelDef.venomSpeed * 1.05);
      sn.mode = 'move'; sn.mt = 0; sn.spitCd = rnd(2.2, 2.8) / rage;
    }
    return;
  }
  sn.mode = 'move';
  keepAway(sn, room, dt, 150, 260, sn.K.speed * rage, G.bossGroup && G.bossGroup.list.find((s) => s !== sn));
  sn.spitCd -= dt; sn.birthCd -= dt;
  if (sn.spitCd <= 0 && P.dying <= 0) { sn.mode = 'wind'; sn.mt = 0; Sfx.hiss(0.8); }
  else if (sn.birthCd <= 0) {
    sn.birthCd = rnd(6.5, 8) / rage;
    if (countKind(room, 'bonus') < (sn.enraged ? 3 : 2)) {
      const f = nearestFreeCell(room, sn.x - Math.cos(sn.ang) * 30, sn.y - Math.sin(sn.ang) * 30);
      room.snakes.push(new Snake('bonus', f.x, f.y, { spawnTime: 0.5 }));
      floatText(sn.x, sn.y - 30, 'BONUS', '#7cc8ff', true); Sfx.dingdong();
    }
  }
};
AI.pwyellow = function (sn, room, dt) {
  const rage = sn.enraged ? 1.3 : 1;
  sn.birthCd -= dt;
  chargeAI(sn, room, dt, {
    speed: sn.K.speed * rage, rearT: 0.7 / rage, chargeSpeed: 300 * rage, chargeT: 1.3, stunT: 0.9 / rage, cd: [3.6 / rage, 4.8 / rage],
    crash: (s, r) => { dropCoins(r, s.x, s.y, 2); floatText(s.x, s.y - 26, 'KORTING', '#f2c200', true); },
    extra: (s, r) => {
      if (s.birthCd > 0) return false;
      s.birthCd = rnd(6, 7.5) / rage;
      cartsIn(r, s.enraged ? 3 : 2); floatText(s.x, s.y - 30, 'OP = OP', '#f2c200', true);
      return true;
    },
  });
};

/* ------------------------------------------------------------------ boss: The Coalition */
const COALITION_ROLES = ['charge', 'spit', 'dig', 'summon'];
AI.coalition = function (sn, room, dt) {
  const P = G.player;
  if (!sn.split && sn.hp <= sn.maxHp * 0.5) { splitCoalition(sn, room); return; }
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.mt += dt; sn.wig += dt * 2;
  if (sn.roleCd == null) { sn.roleCd = 2.2; sn.roleI = 0; }
  const back = (cd) => { sn.mode = 'move'; sn.act = null; sn.mt = 0; sn.roleCd = cd; };
  if (sn.mode === 'move') {
    steerMove(sn, room, toP + Math.sin(sn.wig) * 0.45, sn.K.speed, sn.K.turn, dt);
    sn.roleCd -= dt;
    if (sn.roleCd <= 0 && P.dying <= 0) {
      const r = COALITION_ROLES[sn.roleI % 4]; sn.roleI++;
      sn.act = r; sn.mt = 0;
      if (r === 'charge') { sn.mode = 'rear'; Sfx.hiss(1.4); }
      else if (r === 'spit') { sn.mode = 'wind'; Sfx.hiss(0.9); }
      else if (r === 'dig') { sn.mode = 'under'; sn.dive(); }
      else { sn.mode = 'call'; Sfx.gavel(); }
    }
  } else if (sn.mode === 'rear') {
    sn.ang = turnToward(sn.ang, toP, 4 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.06; sn.mouth = 1;
    if (sn.mt >= 0.75) { sn.mode = 'charge'; sn.mt = 0; sn.chargeAng = sn.ang; Sfx.roar(); }
  } else if (sn.mode === 'charge') {
    if (chargeStep(sn, room, dt, 270, 1.3)) { sn.mode = 'stun'; sn.mt = 0; }
  } else if (sn.mode === 'stun') {
    if (sn.mt > 0.8) back(1.6);
  } else if (sn.mode === 'wind') {
    sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang; sn.mouth = 1;
    if (sn.mt > 0.5 && !sn.spat) { sn.spat = 1; fanAt(sn, 5, 0.22, G.levelDef.venomSpeed, '#6a98ee'); }
    if (sn.mt > 0.95) { sn.spat = 0; fanAt(sn, 4, 0.26, G.levelDef.venomSpeed * 0.9, '#6a98ee'); back(1.8); }
  } else if (sn.mode === 'under') {
    sn.ang = turnToward(sn.ang, toP, 3 * dt); sn.drawAng = sn.ang;
    sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * 150 * dt, 30, RW - 30), clamp(sn.y + Math.sin(sn.ang) * 150 * dt, 30, RH - 30));
    if (Math.random() < dt * 22) burst(sn.x, sn.y, 1, G.levelDef.dirt, { min: 10, max: 50, lmin: 0.3, lmax: 0.5 });
    if (sn.mt > 1.8 || (d < 18 && sn.mt > 0.8)) { sn.mode = 'warn'; sn.mt = 0; Sfx.rumble(); }
  } else if (sn.mode === 'warn') {
    if (!sn.burrowed) back(1.6);
    else if (sn.mt > 0.7) { sn.erupt(room); back(1.8); }
  } else if (sn.mode === 'call') {
    sn.mouth = 1; sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.05;
    if (sn.mt > 0.8) {
      const n = Math.max(0, Math.min(2, 4 - countKind(room, 'kamerlid')));
      for (let i = 0; i < n; i++) {
        const p = sn.pts[Math.min(sn.pts.length - 1, 4 + i * 6)] || sn;
        const f = freeAt(room, p.x, p.y, 9) ? p : nearestFreeCell(room, p.x, p.y);
        room.snakes.push(new Snake('kamerlid', f.x, f.y, { emerge: false, spawnTime: 0.35 }));
      }
      if (n) floatText(sn.x, sn.y - 30, 'QUORUM', '#e8e2d0', true);
      back(2.2);
    }
  } else back(1);
};
function splitCoalition(sn, room) {
  sn.split = true;
  if (sn.burrowed) sn.surfaceNow();
  const parts = [];
  PARTIES.forEach((pt, i) => {
    const p = sn.pts[Math.min(sn.pts.length - 1, Math.floor(((i + 0.5) / PARTIES.length) * sn.pts.length))] || sn;
    const f = freeAt(room, p.x, p.y, 12) ? { x: p.x, y: p.y } : nearestFreeCell(room, p.x, p.y);
    const s = new Snake('party', f.x, f.y, { emerge: false, spawnTime: 0.5, ang: rnd(TAU) });
    s.K = Object.assign({}, s.K, { body: pt.col, body2: mixHex(pt.col, '#000000', 0.15), blood: mixHex(pt.col, '#000000', 0.55), name: pt.name });
    s.role = pt.role; s.party = pt; s.displayName = pt.name;
    s.maxHp = s.hp = KINDS.party.hp * bossHpK();
    s.mode = pt.role === 'dig' ? 'surface' : 'move';
    s.delay = 0.12 * i;
    parts.push(s); room.snakes.push(s);
  });
  sn.alive = false;
  for (const p of sn.pts) if (!p.hid) severPiece(sn, p, true);
  burst(sn.x, sn.y, 24, sn.K.blood, { min: 60, max: 200, lmin: 0.5, lmax: 1 });
  for (let i = 0; i < 20; i++) addP({ kind: 'paper', x: sn.x + rnd(-40, 40), y: sn.y + rnd(-40, 40), vx: rnd(-90, 90), vy: rnd(-90, 60), r: rnd(3, 5), life: rnd(1, 1.8), col: '#f2f0ea', drag: 1.2, rot: rnd(TAU), vr: rnd(-6, 6) });
  G.shake = 12; Sfx.roar(); Sfx.gavel();
  UI.card('Coalition collapse', 'Four parties', 'Every party for itself now.', 'boss', 2.4);
  G.bossGroup = { kind: 'coalition', name: 'THE COALITION', list: parts, scale: 0.5 };
  G.boss = parts[0];
}
// the four parties, each with its own way of fighting
AI.party = function (sn, room, dt) {
  const left = G.bossGroup ? G.bossGroup.list.filter((s) => s.alive && s.dying <= 0).length : 4;
  const k = 1 + 0.12 * (4 - left);
  const role = sn.role || 'charge';
  if (role === 'dig') { AI.lamprey(sn, room, dt * k); return; }
  if (role === 'charge') {
    chargeAI(sn, room, dt, { speed: sn.K.speed * k, rearT: 0.6, chargeSpeed: 310 * k, chargeT: 1.1, stunT: 0.8, cd: [2.2 / k, 3.2 / k] });
    return;
  }
  const P = G.player;
  sn.mt += dt;
  if (role === 'spit') {
    keepAway(sn, room, dt, 140, 250, sn.K.speed * k);
    sn.spitCd -= dt;
    if (sn.spitCd <= 0 && P.dying <= 0) { fanAt(sn, 3, 0.26, G.levelDef.venomSpeed, '#6a98ee'); sn.spitCd = rnd(1.4, 1.9) / k; }
  } else {
    keepAway(sn, room, dt, 160, 280, sn.K.speed * k);
    sn.birthCd -= dt;
    if (sn.birthCd <= 0) {
      sn.birthCd = rnd(4.2, 5.2) / k;
      const n = Math.max(0, Math.min(2, 5 - countKind(room, 'grub')));
      for (let i = 0; i < n; i++) {
        const p = sn.pts[Math.min(sn.pts.length - 1, 2 + i * 3)] || sn;
        const f = freeAt(room, p.x, p.y, 8) ? p : nearestFreeCell(room, p.x, p.y);
        room.snakes.push(new Snake('grub', f.x, f.y, { emerge: false, spawnTime: 0.3 }));
      }
      if (n) { floatText(sn.x, sn.y - 26, 'WORMEN EERST', '#c48af0'); Sfx.squelch(); }
    }
  }
};

