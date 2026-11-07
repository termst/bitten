/* src/22-v9-snake-ai.js: v9: how the new snakes behave. From v9. Lines 13122 to 13429 of the v13.7 script. */
/* =====================================================================
   Version 9: how the new snakes behave
   ===================================================================== */
const RAVER_COLS = [['#ff7af0', '#f060e0', '#ffffff'], ['#7af0ff', '#5ad8f0', '#ffffff'], ['#d8ff7a', '#c0f060', '#2a0a3a'], ['#ffd27a', '#f0b860', '#2a0a3a'], ['#c48aff', '#b070f8', '#ffffff']];
const BOSS9_INIT = {};
const BOSS9_HURT = {};
const DEMOLISH = { rock: 1, urn: 1, egg: 1, wall: 1, crate: 1, bread: 1, bench: 1, bottles: 1, gold: 1, checkout: 1 };

function initSnake9(sn, o) {
  const k = sn.kind;
  if (k === 'raver') { const c = pick(RAVER_COLS); sn.K = Object.assign({}, sn.K, { body: c[0], body2: c[1], eye: c[2], blood: c[0] }); }
  else if (k === 'kameleon') sn.cloak = 1;
  else if (k === 'bril') sn.glassHp = 3;
  else if (k === 'driekop') sn.heads = [{ s: -1, hp: 6, alive: true }, { s: 1, hp: 6, alive: true }];
  else if (k === 'pantser') sn.cd = rnd(2, 3);
  else if (k === 'handel') { sn.cd = rnd(1.5, 2.5); sn.stealCd = 0; }
  else if (k === 'stok') sn.lookIn = rnd(1.4, 2.6);
  if (BOSS9_INIT[k] && !(o && o.preview)) BOSS9_INIT[k](sn, o || {});
}

/* the second and third head of a Driekop sit beside the first one */
function sideHeadPos9(sn, h) {
  const a = sn.drawAng, nx = -Math.sin(a), ny = Math.cos(a);
  const back = sn.headR * 0.55, side = sn.headR * 1.2;
  return { x: sn.x - Math.cos(a) * back + nx * side * h.s, y: sn.y - Math.sin(a) * back + ny * side * h.s };
}
function hitHeads9(sn, x, y, r) {
  if (sn.burrowed) return false;
  for (const h of sn.heads) {
    if (!h.alive) continue;
    const p = sideHeadPos9(sn, h), rr = sn.headR * 0.72 + r;
    if (dist2(x, y, p.x, p.y) < rr * rr) return true;
  }
  return false;
}

function hurtMod9(sn, amount, fx, fy, isPoison) {
  const k = sn.kind;
  if (k === 'kameleon') sn.cloakHit = 1.6;
  else if (k === 'pantser' && sn.shell && !isPoison) {
    if (sn.clank <= 0) { sn.clank = 0.15; Sfx.clank(); if (fx != null) burst(fx, fy, 4, '#dfe6ee', { kind: 'shard', min: 40, max: 120, lmin: 0.15, lmax: 0.3 }); }
    return amount * 0.15;
  } else if (k === 'bril' && sn.glassHp > 0 && !isPoison && fx != null && dist2(fx, fy, sn.x, sn.y) < (sn.headR * 1.6) * (sn.headR * 1.6)) {
    sn.glassHp--;
    burst(fx, fy, 5, '#cfefff', { kind: 'shard', min: 40, max: 120, lmin: 0.2, lmax: 0.4, glow: true });
    if (sn.glassHp <= 0) { Meta.add('glasses'); floatText(sn.x, sn.y - 22, 'BRIL KAPOT', '#cfefff', true); Sfx.clank(); sn.cd = Math.min(sn.cd, 0.6); }
    return amount * 0.5;
  } else if (k === 'driekop' && sn.heads && !isPoison && fx != null) {
    for (const h of sn.heads) {
      if (!h.alive) continue;
      const p = sideHeadPos9(sn, h);
      if (dist2(fx, fy, p.x, p.y) > (sn.headR * 0.85) * (sn.headR * 0.85)) continue;
      h.hp -= amount;
      if (h.hp <= 0) {
        h.alive = false; Meta.add('heads');
        burst(p.x, p.y, 14, sn.K.blood, { min: 40, max: 150, rmin: 1.4, rmax: 3, lmin: 0.35, lmax: 0.7 });
        addP({ kind: 'sev', x: p.x, y: p.y, vx: rnd(-50, 50), vy: rnd(-50, 50), r: sn.headR * 0.7, life: 1.4, col: sn.K.body, col2: sn.K.outline, ph: rnd(10), drag: 4 });
        floatText(p.x, p.y - 18, 'KOP ERAF', '#9fe36a', true); Sfx.squelch();
      }
      return amount * 0.6;
    }
  }
  if (BOSS9_HURT[k]) return BOSS9_HURT[k](sn, amount, fx, fy, isPoison);
  return amount;
}

/* ------------------------------------------------------------------ the Meerkat Worm: stands up, looks, raises the alarm, digs */
AI.stok = function (sn, room, dt) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.mt += dt;
  if (sn.mode === 'look') {
    sn.stand = Math.min(1, sn.mt / 0.25);
    sn.ang = turnToward(sn.ang, toP, 4 * dt); sn.drawAng = sn.ang;
    if (sn.mt > 1.05) {
      sn.stand = 0;
      if (P.dying <= 0 && d < 330 && clearLine(room, sn.x, sn.y, P.x, P.y)) {
        let n = 0;
        for (const o of room.snakes) if (o !== sn && o.alive && !o.isBoss && o.dying <= 0) { o.alarmT = 3; n++; }
        floatText(sn.x, sn.y - 26, n ? 'ALARM' : '!', '#ffb84a', true);
        Sfx.tone(1900, 0.08, { type: 'square', vol: 0.03, lp: 3000 }); Sfx.tone(1900, 0.08, { type: 'square', vol: 0.03, lp: 3000, delay: 0.14 });
        sn.mouth = 1;
      }
      sn.mode = 'dig'; sn.mt = 0; sn.dive();
      const a = rnd(TAU), r = rnd(80, 120);
      sn.digTo = { x: clamp(P.x + Math.cos(a) * r, 30, RW - 30), y: clamp(P.y + Math.sin(a) * r, 30, RH - 30) };
    }
  } else if (sn.mode === 'dig') {
    const a = Math.atan2(sn.digTo.y - sn.y, sn.digTo.x - sn.x);
    sn.ang = turnToward(sn.ang, a, 5 * dt); sn.drawAng = sn.ang;
    const sp = sn.K.underSpeed;
    sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * sp * dt, 22, RW - 22), clamp(sn.y + Math.sin(sn.ang) * sp * dt, 22, RH - 22));
    if (Math.random() < dt * 14) burst(sn.x, sn.y, 1, G.levelDef.dirt, { min: 10, max: 40, lmin: 0.3, lmax: 0.5 });
    if (dist(sn.x, sn.y, sn.digTo.x, sn.digTo.y) < 14 || sn.mt > 2.2) { sn.mode = 'warn'; sn.mt = 0; Sfx.rumble(); }
  } else if (sn.mode === 'warn') {
    if (sn.mt > 0.5) { sn.erupt(room); sn.mode = 'move'; sn.mt = 0; sn.lookIn = rnd(1.8, 3); }
  } else {
    sn.mode = 'move';
    keepAway(sn, room, dt, 110, 210, sn.K.speed);
    if (sn.mt > sn.lookIn) { sn.mode = 'look'; sn.mt = 0; }
  }
};

/* ------------------------------------------------------------------ the Stroopwafel Worm: rolls at you and leaves syrup */
AI.stroopw = function (sn, room, dt) {
  chargeAI(sn, room, dt, { speed: sn.K.speed, rearT: 0.7, chargeSpeed: 240, chargeT: 1.1, stunT: 0.8, cd: [2.6, 3.6], range: 300 });
  if (sn.mode === 'charge') {
    sn.syrT = (sn.syrT || 0) - dt;
    if (sn.syrT <= 0) {
      sn.syrT = 0.16;
      if (!room.syrup9) room.syrup9 = [];
      room.syrup9.push({ x: sn.x, y: sn.y, r: 15, t: 0, life: 4.5, seed: rnd(10) });
      if (room.syrup9.length > 40) room.syrup9.shift();
    }
  }
};

/* ------------------------------------------------------------------ the Brillenworm: does the maths, shoots where you will be */
AI.bril = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt;
  const blind = sn.glassHp <= 0;
  const vs = G.levelDef.venomSpeed;
  if (sn.mode === 'aim') {
    const d = dist(P.x, P.y, sn.x, sn.y), tt = d / vs;
    const tx = P.x + P.vx * tt * 0.9, ty = P.y + P.vy * tt * 0.9;
    sn.aimA = Math.atan2(ty - sn.y, tx - sn.x);
    sn.ang = turnToward(sn.ang, sn.aimA, 6 * dt); sn.drawAng = sn.ang;
    if (sn.mt > 0.75) {
      for (const da of [-0.05, 0.05]) spawnVenom(sn.x + Math.cos(sn.aimA) * sn.headR, sn.y + Math.sin(sn.aimA) * sn.headR, sn.aimA + da, vs * 1.05, '#7ad0ff');
      sn.mouth = 1; Sfx.spit();
      sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.2, 3);
    }
    return;
  }
  sn.mode = 'move';
  const { d } = keepAway(sn, room, dt, blind ? 60 : 150, blind ? 150 : 270, sn.K.speed * (blind ? 1.25 : 1));
  if (blind) { sn.ang += Math.sin(G.t * 3.1 + sn.blinkSeed) * 0.06; sn.drawAng = sn.ang; }
  sn.cd -= dt;
  if (sn.cd > 0 || P.dying > 0 || d > 380) return;
  if (blind) {
    for (let i = 0; i < 3; i++) spawnVenom(sn.x, sn.y, rnd(TAU), vs * 0.85, '#7ad0ff');
    sn.cd = rnd(1.6, 2.4); sn.mouth = 1; Sfx.spit();
  } else if (clearLine(room, sn.x, sn.y, P.x, P.y)) { sn.mode = 'aim'; sn.mt = 0; Sfx.hiss(0.6); }
  else sn.cd = 0.4;
};

/* ------------------------------------------------------------------ the Haggler: steals your coins and runs */
AI.handel = function (sn, room, dt) {
  const P = G.player;
  sn.mt += dt; sn.wig += dt * 4;
  if (sn.stealCd > 0) sn.stealCd -= dt;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  if (sn.mode === 'flee') {
    steerMove(sn, room, toP + Math.PI + Math.sin(sn.wig) * 0.5, sn.K.speed * 1.35, sn.K.turn, dt);
    if (sn.mt > 4) { sn.mode = 'move'; sn.mt = 0; }
    return;
  }
  sn.mode = 'move';
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.5, sn.K.speed, sn.K.turn, dt);
  sn.cd -= dt;
  if (sn.cd <= 0 && d > 130 && d < 340 && P.dying <= 0) {
    const v = spawnVenom(sn.x + Math.cos(toP) * sn.headR, sn.y + Math.sin(toP) * sn.headR, toP, G.levelDef.venomSpeed * 0.9, '#ffd27a');
    v.kind = 'coin'; v.r = 5.5; sn.cd = rnd(2.4, 3.2); sn.mouth = 1; Sfx.coin();
  }
};
function handelTouch9(sn) {
  const P = G.player;
  if (sn.stealCd > 0 || !G.run || (G.run.coins || 0) <= 0 || P.inv > 0 || P.dashT > 0 || P.dying > 0) return false;
  const n = Math.min(3, G.run.coins);
  G.run.coins -= n; sn.stole = (sn.stole || 0) + n; sn.stealCd = 6;
  P.inv = 0.6;
  floatText(P.x, P.y - 28, `-${n}`, '#ffd84a', true);
  floatText(sn.x, sn.y - 24, 'HEHE', '#e8d0ff');
  Sfx.coin(); burst(P.x, P.y, 8, '#ffd84a', { min: 30, max: 90, lmin: 0.2, lmax: 0.4, glow: true });
  sn.mode = 'flee'; sn.mt = 0;
  return true;
}

/* ------------------------------------------------------------------ the Pantserworm: curls up and pinballs around */
AI.pantser = function (sn, room, dt) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.mt += dt; sn.wig += dt * 3;
  if (sn.mode === 'curl') {
    sn.shell = true; sn.curl = Math.min(1, sn.mt / 0.5);
    sn.ang = turnToward(sn.ang, toP, 4 * dt); sn.drawAng = sn.ang;
    if (sn.mt > 0.5) { sn.mode = 'roll'; sn.mt = 0; sn.rvx = Math.cos(sn.ang) * 240; sn.rvy = Math.sin(sn.ang) * 240; sn.bounces = 0; Sfx.boost(); }
  } else if (sn.mode === 'roll') {
    const m = sn.headR * 0.8;
    let nx = sn.x + sn.rvx * dt, ny = sn.y + sn.rvy * dt, hitW = false;
    if (nx < m || nx > RW - m) { sn.rvx = -sn.rvx; nx = clamp(nx, m, RW - m); hitW = true; }
    if (ny < m || ny > RH - m) { sn.rvy = -sn.rvy; ny = clamp(ny, m, RH - m); hitW = true; }
    const [rx, ry] = resolveTiles(room, nx, ny, m);
    if (Math.abs(rx - nx) > 0.01) { sn.rvx = -sn.rvx; hitW = true; }
    if (Math.abs(ry - ny) > 0.01) { sn.rvy = -sn.rvy; hitW = true; }
    sn.moveTo(rx, ry); sn.ang = Math.atan2(sn.rvy, sn.rvx); sn.drawAng = sn.ang;
    if (hitW) { Sfx.clank(); G.shake = Math.max(G.shake, 2); sn.bounces++; }
    for (const k of room.carts) if (k.hitCd <= 0 && dist(k.x, k.y, sn.x, sn.y) < k.r + sn.headR) { k.vx = sn.rvx * 1.3; k.vy = sn.rvy * 1.3; k.last = 'worm'; k.hitCd = 0.15; Sfx.clang(); }
    if (sn.mt > 3 || sn.bounces > 6) { sn.mode = 'uncurl'; sn.mt = 0; }
  } else if (sn.mode === 'uncurl') {
    sn.curl = Math.max(0, 1 - sn.mt / 0.6);
    if (sn.mt > 0.6) { sn.shell = false; sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.6, 3.6); }
  } else {
    sn.mode = 'move'; sn.shell = false; sn.curl = 0;
    steerMove(sn, room, toP + Math.sin(sn.wig) * 0.4, sn.K.speed, sn.K.turn, dt);
    sn.cd -= dt;
    if (sn.cd <= 0 && d < 330 && P.dying <= 0) { sn.mode = 'curl'; sn.mt = 0; Sfx.clank(); }
  }
};

/* ------------------------------------------------------------------ the Driekop: three heads, three streams of spit */
AI.driekop = function (sn, room, dt) {
  const P = G.player;
  const angry = sn.hp < sn.maxHp * 0.5;
  const { d } = keepAway(sn, room, dt, 120, 230, sn.K.speed * (angry ? 1.25 : 1));
  sn.cd -= dt;
  if (sn.cd > 0 || P.dying > 0 || d > 380) return;
  const from = [{ x: sn.x + Math.cos(sn.drawAng) * sn.headR * 0.8, y: sn.y + Math.sin(sn.drawAng) * sn.headR * 0.8 }];
  for (const h of sn.heads || []) if (h.alive) from.push(sideHeadPos9(sn, h));
  for (const h of from) spawnVenom(h.x, h.y, Math.atan2(P.y - h.y, P.x - h.x) + rnd(-0.07, 0.07), G.levelDef.venomSpeed * 0.92, '#9fe36a');
  sn.mouth = 1; Sfx.spit();
  sn.cd = rnd(1.8, 2.4) * (angry ? 0.75 : 1);
};

/* ------------------------------------------------------------------ De Sloper: charges, slams, knocks the room down */
AI.sloper = function (sn, room, dt) {
  const P = G.player;
  if (sn.slamCd == null) sn.slamCd = rnd(3, 4);
  sn.slamCd -= dt;
  if (sn.mode === 'slam') {
    sn.mt += dt; sn.lift = Math.min(1, sn.mt / 0.7); sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.05;
    if (sn.mt > 0.7) {
      sn.lift = 0; sn.mode = 'move'; sn.mt = 0;
      G.shake = Math.max(G.shake, 8); Sfx.thud(); Sfx.collapse();
      const off = rnd(TAU);
      for (let i = 0; i < 10; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / 10) * TAU, G.levelDef.venomSpeed * 0.8, '#d8b030'); v.kind = 'debris'; v.spin = rnd(TAU); v.r = 6.5; }
      addP({ kind: 'ring', x: sn.x, y: sn.y, vx: 0, vy: 0, r: 16, life: 0.45, col: '#e8b820', drag: 0 });
      if (P.dying <= 0 && dist(P.x, P.y, sn.x, sn.y) < sn.headR + 46) P.hurt(1, sn.x, sn.y, sn);
      burst(sn.x, sn.y, 16, G.levelDef.dirt, { min: 50, max: 160, rmin: 1.5, rmax: 3.4, lmin: 0.4, lmax: 0.8 });
    }
    return;
  }
  chargeAI(sn, room, dt, {
    speed: sn.K.speed, rearT: 0.9, chargeSpeed: 250, chargeT: 1.4, stunT: 1.1, cd: [3.2, 4.4], range: 420,
    crash: (s, r) => demolish9(r, s),
    extra: (s, r, dt2, d) => {
      if (s.slamCd > 0 || d > 240) return false;
      s.slamCd = rnd(5, 6.5); s.mode = 'slam'; s.mt = 0; Sfx.hiss(1.2);
      return true;
    },
  });
};
function demolish9(room, sn) {
  const fx = sn.x + Math.cos(sn.chargeAng) * sn.headR * 1.6, fy = sn.y + Math.sin(sn.chargeAng) * sn.headR * 1.6;
  let n = 0;
  for (const o of room.obs.slice()) {
    if (!DEMOLISH[o.type] || dist(o.x, o.y, fx, fy) > 46) continue;
    n++;
    if (o.breakable || o.type === 'urn' || o.type === 'egg') { breakObstacle(room, o); continue; }
    room.removeObstacle(o); o.broken = true; room.dirty = true;
    burst(o.x, o.y, 14, o.type === 'wall' ? G.levelDef.wallHi : G.levelDef.rock, { kind: 'shard', min: 40, max: 160, rmin: 1.4, rmax: 3.4, lmin: 0.35, lmax: 0.8, drag: 4 });
  }
  if (n) {
    Sfx.breakUrn(); G.shake = Math.max(G.shake, 7);
    floatText(fx, fy - 20, 'SLOOP', '#e8b820', true);
    for (let i = 0; i < 4; i++) { const v = spawnVenom(fx, fy, sn.chargeAng + Math.PI + rnd(-1.1, 1.1), G.levelDef.venomSpeed * 0.7, '#a89070'); v.kind = 'debris'; v.spin = rnd(TAU); v.life = 1.2; }
  }
}

/* ------------------------------------------------------------------ the Kameleon: you only see it when it strikes */
AI.kameleon = function (sn, room, dt) {
  const P = G.player;
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.mt += dt;
  const show = sn.mode === 'lash' || sn.mode === 'tongue' || sn.cloakHit > 0;
  sn.cloak = approach(sn.cloak == null ? 1 : sn.cloak, show ? 1 : 0.12, dt * (show ? 6 : 0.8));
  if (sn.mode === 'lash') {
    sn.ang = turnToward(sn.ang, toP, 6 * dt); sn.drawAng = sn.ang; sn.mouth = 1;
    if (sn.mt > 0.38) { sn.mode = 'tongue'; sn.mt = 0; sn.tongueA = sn.ang; sn.tongueHit = false; Sfx.spit(); }
    return;
  }
  if (sn.mode === 'tongue') {
    const u = Math.min(1, sn.mt / 0.42);
    sn.tongue = 125 * Math.sin(u * Math.PI);
    const hx = sn.x + Math.cos(sn.tongueA) * sn.headR, hy = sn.y + Math.sin(sn.tongueA) * sn.headR;
    const tx = hx + Math.cos(sn.tongueA) * sn.tongue, ty = hy + Math.sin(sn.tongueA) * sn.tongue;
    if (!sn.tongueHit && P.dying <= 0) {
      const vx = tx - hx, vy = ty - hy, l2 = vx * vx + vy * vy || 1;
      const k = clamp(((P.x - hx) * vx + (P.y - hy) * vy) / l2, 0, 1);
      if (dist(P.x, P.y, hx + vx * k, hy + vy * k) < P.r + 3) { sn.tongueHit = true; P.hurt(1, tx, ty, sn); }
    }
    if (sn.mt > 0.42) { sn.mode = 'move'; sn.mt = 0; sn.tongue = 0; sn.cd = rnd(1.8, 2.8); }
    return;
  }
  sn.mode = 'move';
  sn.wig += dt * 3;
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.6 + (d < 80 ? Math.PI * 0.6 * sn.strafe : 0), sn.K.speed, sn.K.turn, dt);
  sn.cd -= dt;
  if (sn.cd <= 0 && d < 128 && d > 36 && P.dying <= 0) { sn.mode = 'lash'; sn.mt = 0; }
};

/* ------------------------------------------------------------------ the Raver: tiny, fast, dances to the beat */
AI.raver = function (sn, room, dt) {
  const beat = DJ.on ? DJ.pulse : (Math.sin(G.t * (TAU * BittenRemix.BPM / 60)) > 0.55 ? 1 : 0);
  AI.grub(sn, room, dt * (0.65 + beat * 0.9));
};

