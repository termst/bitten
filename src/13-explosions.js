/* src/13-explosions.js: explosions, fire, fuel cans, Fuel Worm, creepers, Ender Wyrm. From v7. Lines 7424 to 7667 of the v13.7 script. */
/* =====================================================================
   Explosions, fire, thrown fuel cans, the Fuel Worm,
   and the Minecraft style portal boss: the Ender Wyrm and its creepers
   ===================================================================== */
function explode(room, x, y, r, o = {}) {
  const P = G.player;
  if (o.hurtPlayer !== false && P.dying <= 0 && dist(P.x, P.y, x, y) < r + P.r * 0.4) P.hurt(o.dmg || 1, x, y);
  for (const sn of room.snakes) {
    if (sn === o.src || !sn.canBeHit()) continue;
    if (sn.hitTest(x, y, r * 0.65)) { sn.hurt(o.snakeDmg != null ? o.snakeDmg : 5, x, y); if (sn.alive && sn.kind === 'fuel' && !sn.fuse && Math.random() < 0.5) sn.fuse = 0.0001; }
  }
  // the room itself takes the hit: rocks crumble, pots and eggs and blocks break
  let broke = 0;
  for (const ob of room.obs.slice()) {
    if (dist(ob.x, ob.y, x, y) > r + 10) continue;
    if (ob.type === 'rock') {
      room.removeObstacle(ob); room.dirty = true; broke++;
      burst(ob.x, ob.y, 12, room.theme === 'craft' ? '#2b2140' : G.levelDef.rock, { kind: 'shard', min: 50, max: 170, rmin: 1.6, rmax: 3.6, lmin: 0.4, lmax: 0.8, drag: 4 });
      addDecal(room, 'crack', ob.x, ob.y, 16, '#000000');
    } else if (ob.breakable) { breakObstacle(room, ob); broke++; }
  }
  for (const rt of room.rots.slice()) if (dist(rt.x, rt.y, x, y) < r) { rt.hp = 1; hitRot(room, rt); }
  for (const b of room.balls) {
    const d = dist(b.x, b.y, x, y);
    if (d < r * 1.6 && d > 0.01) { b.vx += ((b.x - x) / d) * 380; b.vy += ((b.y - y) / d) * 380; }
  }
  if (broke) Meta.add('boomed', broke);
  // looks and sound
  G.shake = Math.max(G.shake, Math.min(14, 4 + r * 0.12));
  flashLight(x, y, r * 2.4, 1, 0.55);
  burst(x, y, 16, '#ff7a1a', { min: 60, max: 60 + r * 4, rmin: 2, rmax: 4.5, lmin: 0.3, lmax: 0.7, glow: true });
  burst(x, y, 10, '#ffe08a', { min: 40, max: 40 + r * 3, rmin: 1.5, rmax: 3, lmin: 0.2, lmax: 0.5, glow: true });
  burst(x, y, 10, '#2a2420', { kind: 'chunk', min: 20, max: 120, rmin: 2, rmax: 4, lmin: 0.6, lmax: 1.2, drag: 3 });
  addP({ kind: 'ring', x, y, vx: 0, vy: 0, r: r * 0.4, life: 0.35, col: '#ffcf7a', drag: 0, glow: true });
  addDecal(room, 'splat', x, y, r * 0.45, '#120c08');
  Sfx.boom(r > 50);
}

/* ------------------------------------------------------------------ fire on the floor */
function addFire(room, x, y, r, life, hostile) {
  if (!room.fires) room.fires = [];
  if (room.fires.length > 18) room.fires.shift();
  room.fires.push({ x, y, r, life, t: 0, hostile, tick: 0, ph: Math.random() * 10 });
}
function updateFires(dt, room) {
  const P = G.player, F = room.fires;
  if (!F || !F.length) return;
  for (let i = F.length - 1; i >= 0; i--) {
    const f = F[i];
    f.t += dt; f.tick -= dt;
    if (f.t >= f.life) { F.splice(i, 1); continue; }
    if (f.tick <= 0) {
      f.tick = 0.25;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.K.fireproof && !sn.burrowed && dist(sn.x, sn.y, f.x, f.y) < f.r + sn.headR * 0.5) sn.burn = Math.max(sn.burn, 1.2);
    }
    if (f.hostile && P.dying <= 0 && P.escaping <= 0 && dist(P.x, P.y, f.x, f.y) < f.r * 0.85 + P.r * 0.4) P.hurt(1, f.x, f.y);
    if (Math.random() < dt * 10) addP({ kind: 'dot', x: f.x + rnd(-f.r, f.r) * 0.7, y: f.y + rnd(-f.r, f.r) * 0.5, vx: rnd(-8, 8), vy: rnd(-55, -30), r: rnd(1.2, 2.6), life: rnd(0.3, 0.6), col: f.hostile ? (Math.random() < 0.5 ? '#ff8a2a' : '#ffd36a') : (Math.random() < 0.5 ? '#ff3a2a' : '#ff9a4a'), glow: true, drag: 1 });
  }
}
function drawFires(c, room, t) {
  const F = room.fires; if (!F || !F.length) return;
  for (const f of F) {
    const k = Math.min(1, f.t / 0.15) * Math.min(1, (f.life - f.t) / 0.5);
    c.fillStyle = `rgba(20,8,4,${0.45 * k})`; ell(c, f.x, f.y, f.r, f.r * 0.6); c.fill();
    const n = Math.max(4, Math.round(f.r / 5));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + f.ph, rr = f.r * (0.25 + 0.55 * ((i * 0.37) % 1));
      const x = f.x + Math.cos(a) * rr, y = f.y + Math.sin(a) * rr * 0.55;
      const h = (6 + 5 * Math.sin(t * 11 + i * 2.1 + f.ph)) * k;
      c.fillStyle = f.hostile ? '#ff7a1a' : '#e8341a';
      flameShape(c, x, y - h * 0.4, h * 0.42, h); c.fill();
      c.fillStyle = f.hostile ? '#ffd36a' : '#ff9a4a';
      flameShape(c, x, y - h * 0.2, h * 0.22, h * 0.55); c.fill();
    }
  }
}

/* ------------------------------------------------------------------ thrown fuel cans */
function throwCan(sn, P) {
  const tx = clamp(P.x + P.vx * 0.5 + rnd(-18, 18), 12, RW - 12), ty = clamp(P.y + P.vy * 0.5 + rnd(-18, 18), 12, RH - 12);
  G.lobs.push({ x0: sn.x, y0: sn.y, x1: tx, y1: ty, t: 0, dur: 0.95, rot: rnd(TAU), src: sn });
  sn.mouth = 1; Sfx.spit();
}
function updateLobs(dt, room) {
  for (let i = G.lobs.length - 1; i >= 0; i--) {
    const l = G.lobs[i];
    l.t += dt; l.rot += dt * 9;
    if (l.t >= l.dur) {
      G.lobs.splice(i, 1);
      explode(room, l.x1, l.y1, 42, { dmg: 1, snakeDmg: 3, src: l.src });
      addFire(room, l.x1, l.y1, 24, 2.6, true);
    }
  }
}
function drawJerrycan(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -6, -7.5, 12, 15, 2.2); c.fillStyle = '#1f8a3a'; c.fill(); c.strokeStyle = '#06200d'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#ffd60a'; c.fillRect(-6, -1, 12, 3);
  c.fillStyle = '#06200d'; rrect(c, -3, -5.5, 4, 2.2, 1); c.fill();
  c.fillStyle = '#ffd60a'; rrect(c, 2.5, -10, 3, 3.5, 1); c.fill();
  c.restore();
}
function drawLobs(c) {
  for (const l of G.lobs) {
    const u = l.t / l.dur, x = lerp(l.x0, l.x1, u), y = lerp(l.y0, l.y1, u), h = Math.sin(Math.PI * u) * 60;
    c.fillStyle = `rgba(0,0,0,${0.2 + 0.25 * u})`; ell(c, x, y + 4, 5 + 3 * u, 2.5 + 1.5 * u); c.fill();
    c.strokeStyle = `rgba(255,120,40,${0.2 + 0.5 * u})`; c.lineWidth = 1.2; c.setLineDash([4, 3]);
    c.beginPath(); c.arc(l.x1, l.y1, 42 * (1.1 - 0.2 * u), 0, TAU); c.stroke(); c.setLineDash([]);
    drawJerrycan(c, x, y - h, 1, l.rot);
  }
}

/* ------------------------------------------------------------------ the Fuel Worm */
AI.fuel = function (sn, room, dt) {
  const P = G.player;
  if (sn.fuse > 0) {
    sn.fuse += dt; sn.mouth = 1; sn.flash = Math.floor(sn.fuse * 14) % 2 ? 0.05 : 0;
    if (Math.random() < dt * 30) addP({ kind: 'dot', x: sn.x + rnd(-8, 8), y: sn.y + rnd(-8, 8), vx: rnd(-80, 80), vy: rnd(-80, 80), r: rnd(1, 2), life: 0.25, col: '#ffe08a', glow: true, drag: 2 });
    if (sn.fuse >= 0.85) {
      sn.blown = true;
      explode(room, sn.x, sn.y, 74, { dmg: 2, src: sn, snakeDmg: 9 });
      addFire(room, sn.x, sn.y, 36, 3.4, true);
      Meta.add('fuelPop');
      floatText(sn.x, sn.y - 24, 'KABOOM', '#ffb43a', true);
      sn.kill(false);
    }
    return;
  }
  const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
  sn.wig += dt * 2;
  const desired = d > 175 ? toP : d < 95 ? toP + Math.PI : toP + (Math.PI / 2) * sn.strafe;
  if (Math.random() < dt * 0.2) sn.strafe *= -1;
  steerMove(sn, room, desired + Math.sin(sn.wig) * 0.3, sn.K.speed * (sn.stagger > 0 ? 0.3 : 1), sn.K.turn, dt);
  sn.throwCd = (sn.throwCd == null ? rnd(1.6, 2.6) : sn.throwCd) - dt;
  if (sn.throwCd <= 0 && P.dying <= 0 && d < 360) { throwCan(sn, P); sn.throwCd = rnd(2.8, 3.8) * ((G.levelDef.tier || 0) >= 2 ? 0.85 : 1); }
  if (Math.random() < dt * 0.9) {
    const tail = sn.pts[sn.pts.length - 1] || sn;
    addP({ kind: 'dot', x: tail.x, y: tail.y, vx: rnd(-30, 30), vy: rnd(-40, -10), r: 1.2, life: 0.3, col: '#ffe08a', glow: true, drag: 2 });
  }
};
function lightFuse(sn) {
  if (sn.kind !== 'fuel' || sn.fuse || !sn.alive) return;
  sn.fuse = 0.0001; Sfx.fuse(); floatText(sn.x, sn.y - 20, '!!', '#ff5a3a');
}

/* ------------------------------------------------------------------ creepers */
AI.creeper = function (sn, room, dt) {
  const P = G.player, d = dist(sn.x, sn.y, P.x, P.y);
  if (sn.mode === 'fuse') {
    sn.mt += dt; sn.swell = Math.min(1, sn.mt);
    if (sn.mt >= 1.0) { sn.blown = true; explode(room, sn.x, sn.y, 58, { dmg: 2, src: sn, snakeDmg: 4 }); sn.kill(false); }
    return;
  }
  steerMove(sn, room, Math.atan2(P.y - sn.y, P.x - sn.x), sn.K.speed * (sn.stagger > 0 ? 0.3 : 1), sn.K.turn, dt);
  if (d < 54 && P.dying <= 0) { sn.mode = 'fuse'; sn.mt = 0; Sfx.fuse(); }
};

/* ------------------------------------------------------------------ the Ender Wyrm */
function enderCell(room, P) {
  const opts = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (room.solid(c, r) || isDoorZone(r, c)) continue;
    const x = (c + 0.5) * T, y = (r + 0.5) * T, d = dist(x, y, P.x, P.y);
    if (d > 2.4 * T && d < 4.6 * T) opts.push({ x, y, c, r });
  }
  return opts.length ? pick(opts) : nearestFreeCell(room, RW - P.x, RH - P.y);
}
AI.ender = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5;
  sn.mt += dt;
  if (sn.mode === 'tpOut') {
    sn.fade = Math.max(0, 1 - sn.mt / 0.45);
    if (Math.random() < dt * 40) addP({ kind: 'dot', x: sn.x + rnd(-14, 14), y: sn.y + rnd(-14, 14), vx: rnd(-30, 30), vy: rnd(-60, -20), r: rnd(1, 2.4), life: 0.5, col: '#c86bff', glow: true, drag: 1 });
    if (sn.mt >= 0.45) {
      const f = enderCell(room, P);
      sn.x = f.x; sn.y = f.y; sn.trail = [{ x: f.x, y: f.y, s: sn.odo }];
      sn.tc = null; sn.cell = null; sn.dir = null;
      sn.ang = sn.drawAng = Math.atan2(P.y - f.y, P.x - f.x);
      sn.mode = 'tpIn'; sn.mt = 0; Sfx.warp();
      for (let i = 0; i < 16; i++) addP({ kind: 'dot', x: f.x + rnd(-18, 18), y: f.y + rnd(-18, 18), vx: rnd(-50, 50), vy: rnd(-50, 50), r: rnd(1, 2.4), life: 0.6, col: '#d26bff', glow: true, drag: 2 });
    }
    return;
  }
  if (sn.mode === 'tpIn') {
    sn.fade = Math.min(1, sn.mt / 0.35);
    if (sn.mt >= 0.35) { sn.mode = 'move'; sn.fade = 1; }
    return;
  }
  gridMove(sn, room, (ph2 ? 3.1 : 2.4) * T, dt);
  if (Math.random() < dt * 6) addP({ kind: 'dot', x: sn.x + rnd(-20, 20), y: sn.y + rnd(-20, 20), vx: 0, vy: rnd(-30, -10), r: rnd(0.8, 1.6), life: 0.7, col: '#b05aff', glow: true, drag: 1 });
  sn.tpCd -= dt; sn.pearlCd -= dt; sn.creepCd -= dt; sn.buildCd -= dt;
  if (sn.pearlCd <= 0 && P.dying <= 0) { fanAt(sn, ph2 ? 5 : 3, 0.27, G.levelDef.venomSpeed * 0.95, '#c86bff'); sn.pearlCd = ph2 ? 1.9 : 2.7; }
  if (sn.creepCd <= 0) {
    sn.creepCd = ph2 ? 6 : 8.5;
    const n = Math.min(ph2 ? 3 : 2, 4 - countKind(room, 'creeper'));
    for (let i = 0; i < n; i++) {
      const vis = sn.pts.filter((p) => !p.hid);
      const p = vis.length ? vis[Math.floor(((i + 1) / (n + 1)) * vis.length)] : sn;
      const f = freeAt(room, p.x, p.y, 9) ? { x: p.x, y: p.y } : nearestFreeCell(room, p.x, p.y);
      room.snakes.push(new Snake('creeper', f.x, f.y, { emerge: false, spawnTime: 0.4, locks: true }));
      burst(f.x, f.y, 8, '#5aa83a', { min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
    }
    if (n > 0) Sfx.hiss(1);
  }
  if (sn.buildCd <= 0 && !sn.ghost && P.dying <= 0) {
    const g = planPiece(room, P, sn);
    if (g) { g.col = '#2b2140'; sn.ghost = g; Sfx.blockWarn(); }
    sn.buildCd = ph2 ? 6 : 8;
  }
  if (sn.ghost) { sn.ghost.t += dt; if (sn.ghost.t >= 0.95) { slamPiece(room, sn, sn.ghost); sn.ghost = null; } }
  if (sn.tpCd <= 0 && !sn.ghost) { sn.mode = 'tpOut'; sn.mt = 0; sn.tpCd = ph2 ? 4.5 : 6.5; Sfx.warp(); }
};

/* the portal room floor: chunky grass, dirt and stone blocks */
function drawCraftFloor(c, room, L, rng) {
  c.fillStyle = '#0a0710'; c.fillRect(-WALL - 2, -WALL - 2, VIEW_W + 4, VIEW_H + 4);
  const px = T / 8;
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const v = rng(), kind = v < 0.62 ? 'grass' : v < 0.85 ? 'dirt' : 'stone';
    const base = kind === 'grass' ? ['#4f7d2c', '#5b8c34', '#45702a', '#66993a'] : kind === 'dirt' ? ['#6b4a2e', '#5e4027', '#7a5636', '#4f3520'] : ['#6a6a6e', '#5c5c62', '#77777c', '#4e4e54'];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      c.fillStyle = base[Math.floor(rng() * base.length)];
      c.fillRect(col * T + x * px, r * T + y * px, px + 0.3, px + 0.3);
    }
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(col * T, r * T + T - 1.2, T, 1.2); c.fillRect(col * T + T - 1.2, r * T, 1.2, T);
  }
  c.fillStyle = 'rgba(20,0,40,0.28)'; c.fillRect(0, 0, RW, RH);
  const sh = 34;
  const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
  edge(0, 0, 0, sh, 0, 0, RW, sh); edge(0, RH, 0, RH - sh, 0, RH - sh, RW, sh);
  edge(0, 0, sh, 0, 0, 0, sh, RH); edge(RW, 0, RW - sh, 0, RW - sh, 0, sh, RH);
  for (const o of room.obs) if (o.type === 'rock') drawObsidian(c, o, rng);
}
function drawObsidian(c, o, rng) {
  const x = o.x - T / 2 + 2, y = o.y - T / 2 + 2, s = T - 4, px = s / 8;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 5, s, s);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const v = rng();
    c.fillStyle = v < 0.12 ? '#4a2a78' : v < 0.3 ? '#241a36' : v < 0.7 ? '#150f22' : '#1c1530';
    c.fillRect(x + i * px, y + j * px, px + 0.3, px + 0.3);
  }
  c.strokeStyle = '#05030a'; c.lineWidth = 1.2; c.strokeRect(x, y, s, s);
}

