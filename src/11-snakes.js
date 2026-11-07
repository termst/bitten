/* src/11-snakes.js: class Snake: movement helpers and behaviours. From v1 to v8. Lines 6525 to 7164 of the v13.7 script. */
/* =====================================================================
   Snakes. The body follows the trail of the head; length is health.
   ===================================================================== */
const STEER_OFFS = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.7, -1.7, 2.3, -2.3, Math.PI];

class Snake {
  constructor(kind, x, y, o = {}) {
    let K = kind === 'rotter' || o.champ ? Object.assign({}, KINDS[kind]) : KINDS[kind];
    if (o.champ) {
      K.headR *= 1.18; K.r0 *= 1.18; K.r1 *= 1.18; K.hp *= 2; if (K.speed) K.speed *= 1.1;
      K.body = mixHex(KINDS[kind].body, '#d9a636', 0.38); K.body2 = mixHex(KINDS[kind].body2, '#b8862a', 0.38);
    }
    this.K = K; this.kind = kind; this.isBoss = !!K.boss;
    this.x = x; this.y = y;
    this.ang = o.ang != null ? o.ang : rnd(TAU);
    this.drawAng = this.ang; this.moveAng = this.ang;
    const mult = this.isBoss ? 1 : (G.levelDef ? G.levelDef.hpMult : 1);
    this.maxHp = K.hp * mult * (this.isBoss ? 1 : enemyPowerK(G.player) * mpSnakeHpK14());   /* B1 */ this.hp = this.maxHp; this.champ = !!o.champ; this.slow = 0;
    this.headR = K.headR; this.spacing = K.spacing; this.maxLen = K.maxLen; this.minLen = K.minLen;
    this.len = this.maxLen;
    this.trail = [{ x, y, s: 0 }]; this.odo = 0;
    const emerge = o.emerge !== false;
    this.under = emerge ? [[-1e9, 0]] : [];
    this.holes = emerge ? [{ x, y, s: 0, a: 0, r: K.r0 }] : [];
    this.pts = [];
    this.state = 'spawn'; this.st = 0;
    this.spawnTime = o.spawnTime != null ? o.spawnTime : (this.isBoss ? 1.6 : 0.8);
    this.delay = o.delay || 0; this.eyeOpen = 0;
    this.flash = 0; this.poison = 0; this.ptick = 0; this.stagger = 0;
    this.alive = true; this.locks = o.locks !== false; this.dying = 0;
    this.burrowed = false;
    this.mode = (kind === 'lamprey' || kind === 'queen') ? 'surface' : kind === 'rotter' ? 'feed' : kind === 'rocket' ? 'drive' : 'move'; this.mt = 0;
    this.burn = 0; this.btick = 0; this.boostCd = rnd(1.4, 2.4); this.demoCd = rnd(5, 7); this.dropCd = rnd(2.2, 3.2); this.ghost = null;
    this.tpCd = 5; this.pearlCd = 2; this.creepCd = 3; this.buildCd = 5; this.fade = 1; this.fuse = 0; this.throwCd = null; this.blown = false;
    this.eaten = 0; this.tagT = 0; this.shieldT = 0; this.stun = 0; this.enraged = false;
    this.trait = o.trait || null; this.daze = 0; this.lastHit = -9; this.clank = 0;
    this.wig = rnd(TAU); this.cd = rnd(1.2, 2.4); this.lunge = 0; this.lungeCd = rnd(0.6, 1.4);
    this.strafe = Math.random() < 0.5 ? 1 : -1; this.hood = 0; this.mouth = 0; this.swell = 0;
    this.blinkSeed = rnd(100); this.blinkT = 0; this.blinkCd = rnd(2, 6);
    this.tc = null; this.cell = null; this.dir = null;
    this.surfaceT = rnd(2, 3); this.underT = rnd(1.6, 2.3);
    this.charge = null; this.spitCd = 2.2; this.eyeCd = 1.6; this.birthCd = 3.5; this.chargeCd = 4.5;
    initSnake9(this, o);
    this.computeBody();
  }

  lenFor() {
    const f = clamp(this.hp / this.maxHp, 0, 1.5);
    return Math.max(this.minLen, Math.round(this.minLen + (this.maxLen - this.minLen) * f));
  }
  isUnder(s) {
    const u = this.under;
    for (let i = 0; i < u.length; i++) if (s >= u[i][0] && s < u[i][1]) return true;
    return false;
  }
  moveTo(nx, ny) {
    const d = Math.hypot(nx - this.x, ny - this.y);
    if (d < 1e-6) return;
    this.x = nx; this.y = ny; this.odo += d;
    const l = this.trail[0];
    if (Math.hypot(nx - l.x, ny - l.y) >= 2) this.trail.unshift({ x: nx, y: ny, s: this.odo });
    const need = this.odo - (this.maxLen * 1.6 + 4) * this.spacing;
    while (this.trail.length > 2 && this.trail[this.trail.length - 1].s < need) this.trail.pop();
    while (this.under.length && this.under[0][1] < need) this.under.shift();
  }
  computeBody() {
    const pts = this.pts, n = this.len, tr = this.trail, K = this.K;
    let i = 0, ax = this.x, ay = this.y, as = this.odo;
    for (let k = 1; k <= n; k++) {
      const s = this.odo - k * this.spacing;
      while (i < tr.length && tr[i].s > s) { ax = tr[i].x; ay = tr[i].y; as = tr[i].s; i++; }
      let px, py;
      if (i >= tr.length) { px = ax; py = ay; }
      else {
        const b = tr[i], span = as - b.s, f = span > 1e-6 ? (as - s) / span : 0;
        px = ax + (b.x - ax) * f; py = ay + (b.y - ay) * f;
      }
      const u = n > 1 ? (k - 1) / (n - 1) : 0;
      let p = pts[k - 1];
      if (!p) p = pts[k - 1] = { x: 0, y: 0, r: 0, s: 0, hid: false };
      p.x = px; p.y = py; p.s = s; p.r = lerp(K.r0, K.r1, Math.pow(u, 1.35)); p.hid = this.isUnder(s);
    }
    pts.length = n;
  }
  canBeHit() { return this.alive && this.state === 'active' && this.dying <= 0; }
  hitTest(x, y, r) {
    if (this.heads && hitHeads9(this, x, y, r)) return true;
    if (!this.burrowed) { const rr = this.headR + r; if (dist2(x, y, this.x, this.y) < rr * rr) return true; }
    for (let k = 0; k < this.pts.length; k++) {
      const p = this.pts[k]; if (p.hid) continue;
      const rr = p.r + r; if (dist2(x, y, p.x, p.y) < rr * rr) return true;
    }
    return false;
  }
  hurt(amount, fx, fy, isPoison) {
    if (!this.canBeHit()) return false;
    if (this.tagT > 0) amount *= 1.4;
    if (this.stickyT > 0) amount *= 1.15;
    amount = hurtMod9(this, amount, fx, fy, isPoison);
    if (this.shieldT > 0) amount *= 0.45;
    // an armored head shrugs off what hits it from the front
    if (this.trait === 'armor' && !isPoison && fx != null) {
      const d2 = dist2(fx, fy, this.x, this.y);
      if (d2 > 4 && d2 < (this.headR * 1.7) * (this.headR * 1.7) && Math.abs(angDiff(this.drawAng, Math.atan2(fy - this.y, fx - this.x))) < 1.25) {
        amount *= 0.25;
        if (this.clank <= 0) { this.clank = 0.18; Sfx.clank(); burst(fx, fy, 4, '#dfe6ee', { kind: 'shard', min: 40, max: 110, lmin: 0.15, lmax: 0.3 }); }
      }
    }
    this.lastHit = G.t;
    this.hp -= amount;
    const P = G.player;
    if (P && P.vamp && P.dying <= 0) {
      P.vampAcc = (P.vampAcc || 0) + amount;
      if (P.vampAcc >= 25) { P.vampAcc -= 25; if (P.heal(1)) { Sfx.pickup(); floatText(P.x, P.y - 22, '+1', '#ff6a6a'); burst(P.x, P.y, 8, '#e0402a', { min: 20, max: 70, lmin: 0.3, lmax: 0.5 }); } }
    }
    if (!isPoison) {
      this.flash = 0.06; Sfx.hit();
      burst(fx, fy, 5, this.K.blood, { min: 30, max: 110, rmin: 1, rmax: 2.4, lmin: 0.25, lmax: 0.5 });
      if (Math.random() < 0.5) addDecal(G.room, 'splat', fx, fy, 3 + Math.random() * 3, this.K.blood);
    }
    const nl = this.lenFor();
    if (nl < this.len) {
      for (let k = this.len; k > nl; k--) { const p = this.pts[k - 1]; if (p && !p.hid) severPiece(this, p, false); }
      this.len = nl; this.pts.length = Math.min(this.pts.length, nl);
    }
    if (this.hp <= 0) this.kill(false);
    return true;
  }
  kill(eaten) {
    if (!this.alive) return;
    if (this.isBoss && !eaten) {
      if (this.dying <= 0) {
        this.dying = 0.0001; this.hp = 0;
        if (this.burrowed) this.surfaceNow();
        Game.onBossDying(this);
      }
      return;
    }
    this.alive = false;
    G.run.kills++;
    const K = this.K;
    if (!eaten && this.trait === 'spite') spiteBurst(this);
    if (!eaten) Game.onSnakeKilled(this);
    if (eaten) { burst(this.x, this.y, 8, K.blood, { min: 30, max: 90, lmin: 0.3, lmax: 0.5 }); return; }
    Sfx.squelch();
    for (const p of this.pts) if (!p.hid) severPiece(this, p, true);
    if (!this.burrowed) addP({ kind: 'sev', x: this.x, y: this.y, vx: rnd(-40, 40), vy: rnd(-40, 40), r: this.headR * 0.95, life: 1.5, col: K.body, col2: K.outline, ph: rnd(10), drag: 4 });
    burst(this.x, this.y, 12, K.blood, { min: 40, max: 160, rmin: 1.4, rmax: 3, lmin: 0.35, lmax: 0.7 });
    addDecal(G.room, 'splat', this.x, this.y, this.headR * 1.3, K.blood);
  }
  dive() {
    this.burrowed = true;
    this.under.push([this.odo, 1e12]);
    this.holes.push({ x: this.x, y: this.y, s: this.odo, a: 0, r: this.K.r0 });
    Sfx.dig();
    burst(this.x, this.y, 10, G.levelDef.dirt, { min: 30, max: 100, rmin: 1.5, rmax: 3, lmin: 0.3, lmax: 0.6, drag: 5 });
  }
  surfaceNow() {
    this.burrowed = false;
    const iv = this.under[this.under.length - 1];
    if (iv && iv[1] > 1e11) iv[1] = this.odo;
    this.holes.push({ x: this.x, y: this.y, s: this.odo, a: 1, r: this.K.r0 });
  }
  erupt(room) {
    if (!freeAt(room, this.x, this.y, this.headR * 0.7)) {
      const c = nearestFreeCell(room, this.x, this.y);
      this.moveTo(c.x, c.y);
    }
    this.surfaceNow();
    const P = G.player;
    this.ang = Math.atan2(P.y - this.y, P.x - this.x); this.drawAng = this.ang; this.mouth = 1;
    G.shake = Math.max(G.shake, this.isBoss ? 9 : 5);
    Sfx.erupt();
    burst(this.x, this.y, this.isBoss ? 22 : 14, G.levelDef.dirt, { min: 50, max: 180, rmin: 1.5, rmax: 3.5, lmin: 0.4, lmax: 0.8, drag: 4 });
    addDecal(room, 'crack', this.x, this.y, this.headR * 1.8, '#000000');
    flashLight(this.x, this.y, 70, 0.5, 0.4);
    if (P.dying <= 0 && dist(P.x, P.y, this.x, this.y) < this.headR + P.r + 12) P.hurt(this.K.eruptDmg || 2, this.x, this.y, this); mpRest14((Q) => { if (Q.dying <= 0 && dist(Q.x, Q.y, this.x, this.y) < this.headR + Q.r + 12) Q.hurt(this.K.eruptDmg || 2, this.x, this.y, this); });   /* M3: every apple in reach */
    const tier = G.levelDef.tier || 0;
    let ring = 0, col = this.isBoss ? '#e2604e' : '#d8c454';
    if (this.kind === 'lamprey') ring = tier === 0 ? 0 : tier === 1 ? 6 : 8;
    else if (this.kind === 'queen') ring = this.hp < this.maxHp * 0.5 ? 14 : 10;
    else if (this.kind === 'party') { ring = 8; col = '#6ad86a'; }
    else if (this.kind === 'coalition') { ring = 12; col = '#6ad86a'; }
    const off = rnd(TAU);
    for (let i = 0; i < ring; i++) spawnVenom(this.x, this.y, off + (i / ring) * TAU, G.levelDef.venomSpeed * (this.isBoss ? 0.95 : 0.9), col);
  }

  update(dt, room) {
    if (this.delay > 0) { this.delay -= dt; return; }
    this.flash = Math.max(0, this.flash - dt);
    for (let i = this.holes.length - 1; i >= 0; i--) {
      const h = this.holes[i];
      const needed = this.odo - h.s < this.len * this.spacing + this.spacing * 1.5;
      if (needed) h.a = Math.min(1, h.a + dt * 5);
      else { h.a -= dt * 1.4; if (h.a <= 0) this.holes.splice(i, 1); }
    }
    if (this.state === 'spawn') {
      this.st += dt; this.eyeOpen = smooth(this.st / this.spawnTime);
      if (this.st >= this.spawnTime) { this.state = 'active'; this.st = 0; this.eyeOpen = 1; }
      this.computeBody();
      return;
    }
    if (this.dying > 0) { this.updateDying(dt, room); return; }
    if (this.poison > 0) {
      this.poison -= dt; this.ptick -= dt;
      if (this.ptick <= 0) {
        this.ptick = 0.5;
        const vis = this.pts.filter((p) => !p.hid);
        const p = vis.length ? pick(vis) : this;
        addP({ kind: 'bubble', x: p.x, y: p.y, vx: rnd(-10, 10), vy: rnd(-26, -12), r: rnd(1.5, 3), life: 0.6, col: '#9fd36a', drag: 1 });
        this.hurt(0.5, this.x, this.y, true);
        if (!this.alive || this.dying > 0) return;
      }
    }
    if (this.burn > 0) {
      this.burn -= dt; this.btick -= dt;
      if (Math.random() < dt * 14) {
        const vis = this.pts.filter((p) => !p.hid); const p = vis.length ? pick(vis) : this;
        addP({ kind: 'dot', x: p.x + rnd(-4, 4), y: p.y + rnd(-4, 4), vx: rnd(-10, 10), vy: rnd(-50, -25), r: rnd(1.2, 2.4), life: 0.45, col: Math.random() < 0.5 ? '#ff8a2a' : '#ffd36a', glow: true, drag: 1 });
      }
      if (this.btick <= 0) {
        this.btick = 0.35;
        this.hurt(0.55, this.x, this.y, true);
        if (!this.alive || this.dying > 0) return;
      }
    }
    this.blinkCd -= dt;
    if (this.blinkCd <= 0) { this.blinkT = 0.13; this.blinkCd = rnd(2.5, 6); }
    if (this.blinkT > 0) this.blinkT -= dt;
    this.stagger = Math.max(0, this.stagger - dt);
    this.slow = Math.max(0, this.slow - dt);
    if (this.tagT > 0) this.tagT -= dt;
    if (this.shieldT > 0) this.shieldT -= dt;
    if (this.daze > 0) this.daze -= dt;
    if (this.clank > 0) this.clank -= dt;
    snakeTick9(this, dt);
    if (this.trait === 'regen' && G.t - this.lastHit > 2.2 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.08 * dt);
      const nl = this.lenFor(); if (nl > this.len) this.len = nl;
      if (Math.random() < dt * 4) addP({ kind: 'dot', x: this.x + rnd(-this.headR, this.headR), y: this.y + rnd(-this.headR, this.headR), vx: 0, vy: rnd(-30, -15), r: rnd(1, 1.8), life: 0.6, col: '#8fe07a', drag: 1, glow: true });
    }
    if (this.stun > 0) {
      // stunned by a gavel or a veto: it just lies there, but touching it still hurts
      this.stun -= dt; this.mouth = Math.max(0, this.mouth - dt * 2);
      this.computeBody(); this.contactPlayer(room);
      return;
    }
    const P = G.player;
    const sk = (this.isBoss ? (G.bossSpeedK || 1) : (G.speedK || 1)) * (this.trait === 'swift' ? 1.3 : 1) * (P && P.flags.stampede && !this.isBoss ? 1.15 : 1) * snakeSpeed9(this, P);
    AI[this.kind](this, room, dt * sk * (this.slow > 0 ? 0.55 : 1) * (P && P.chrono && !this.isBoss ? 0.75 : P && P.chrono ? 0.85 : 1));
    this.mouth = Math.max(0, this.mouth - dt * 2);
    this.computeBody();
    this.contactPlayer(room);
  }

  updateDying(dt, room) {
    this.dying += dt;
    this.flash = (Math.floor(this.dying * 18) % 2) ? 0.05 : 0;
    this.drawAng = this.ang + Math.sin(this.dying * 28) * 0.35;
    this.mouth = 1;
    if (Math.random() < dt * 16) {
      const vis = this.pts.filter((p) => !p.hid);
      const p = vis.length ? pick(vis) : this;
      burst(p.x, p.y, 4, this.K.blood, { min: 40, max: 140, lmin: 0.3, lmax: 0.6 });
      if (Math.random() < 0.4) addDecal(room, 'splat', p.x, p.y, 4 + Math.random() * 5, this.K.blood);
    }
    G.shake = Math.max(G.shake, 3);
    if (this.dying > 1.8) {
      this.alive = false; G.run.kills++;
      for (const p of this.pts) if (!p.hid) severPiece(this, p, true);
      addP({ kind: 'sev', x: this.x, y: this.y, vx: 0, vy: 0, r: this.headR, life: 2, col: this.K.body, col2: this.K.outline, ph: 0, drag: 4 });
      burst(this.x, this.y, 30, this.K.blood, { min: 60, max: 220, rmin: 1.5, rmax: 4, lmin: 0.5, lmax: 1 });
      addDecal(room, 'splat', this.x, this.y, this.headR * 1.8, this.K.blood);
      G.shake = 12;
      Sfx.bossDie();
      Game.onBossDead(this);
    }
    this.computeBody();
  }

  contactPlayer(room) {
    const P = G.player;
    if (P.dying > 0 || P.escaping > 0 || this.air9 > 0) return;
    let dmg = 0, px = 0, py = 0;
    const pr = P.r - 1.5;
    if (!this.burrowed) {
      const rr = this.headR + pr;
      if (dist2(P.x, P.y, this.x, this.y) < rr * rr) { dmg = this.K.bite || 1; px = this.x; py = this.y; }
    }
    const solid = this.K.r0 >= 14;
    for (let k = 0; k < this.pts.length; k++) {
      const p = this.pts[k]; if (p.hid) continue;
      const rr = p.r + pr, d2 = dist2(P.x, P.y, p.x, p.y);
      if (d2 < rr * rr) {
        if (!dmg) { dmg = 1; px = p.x; py = p.y; }
        if (solid && k > 1) {
          const d = Math.sqrt(d2) || 1;
          P.x = p.x + ((P.x - p.x) / d) * rr; P.y = p.y + ((P.y - p.y) / d) * rr;
        }
      }
    }
    // a snake sneezing in pollen cannot bite
    if (dmg && this.kind === 'handel' && !(this.daze > 0) && handelTouch9(this)) return;
    if (dmg && !(this.daze > 0) && P.hurt(dmg, px, py, this) && this.kind === 'fuel' && Math.random() < 0.5) lightFuse(this);
  }
}

/* ------------------------------------------------------------------ movement helpers */
function steerMove(sn, room, desired, speed, turn, dt) {
  // wedged into a gap between two rocks: swing wide for a moment
  if (sn.detourT > 0) { sn.detourT -= dt; desired += sn.detour; }
  const look = sn.headR + 16, pr = sn.headR * 0.7;
  let best = desired;
  for (const o of STEER_OFFS) {
    const a = desired + o;
    if (freeAt(room, sn.x + Math.cos(a) * look, sn.y + Math.sin(a) * look, pr)) { best = a; break; }
  }
  sn.ang = turnToward(sn.ang, best, turn * dt);
  const sp = speed * (sn.stagger > 0 ? 0.2 : 1);
  let nx = sn.x + Math.cos(sn.ang) * sp * dt, ny = sn.y + Math.sin(sn.ang) * sp * dt;
  const m = sn.headR * 0.8;
  [nx, ny] = resolveTiles(room, nx, ny, m);
  nx = clamp(nx, m, RW - m); ny = clamp(ny, m, RH - m);
  const ox = sn.x, oy = sn.y, want = sp * dt;
  sn.moveTo(nx, ny);
  sn.drawAng = sn.ang;
  if (want > 0.05 && Math.hypot(sn.x - ox, sn.y - oy) < want * 0.25) {
    sn.blockT = (sn.blockT || 0) + dt;
    if (sn.blockT > 0.3) { sn.blockT = 0; sn.detour = (Math.random() < 0.5 ? 1 : -1) * rnd(1.3, 2.2); sn.detourT = rnd(0.5, 0.9); }
  } else if (sn.blockT) sn.blockT = Math.max(0, sn.blockT - dt);
}

function bodyCells(sn) {
  const set = new Set();
  for (let k = 1; k < sn.pts.length; k++) {
    const p = sn.pts[k]; if (p.hid) continue;
    set.add(clamp(Math.floor(p.y / T), 0, ROWS - 1) * COLS + clamp(Math.floor(p.x / T), 0, COLS - 1));
  }
  return set;
}
function chooseCell(sn, room) {
  const c = sn.cell.c, r = sn.cell.r;
  const P = G.player;
  const dm = room.distMap(P.x, P.y);
  const occ = bodyCells(sn);
  const opts = [];
  for (const d of DIR4) {
    if (sn.dir && d[0] === -sn.dir[0] && d[1] === -sn.dir[1]) continue;
    const nc = c + d[0], nr = r + d[1];
    if (room.solid(nc, nr)) continue;
    opts.push({ c: nc, r: nr });
  }
  if (!opts.length && sn.dir) {
    const nc = c - sn.dir[0], nr = r - sn.dir[1];
    if (!room.solid(nc, nr)) opts.push({ c: nc, r: nr });
  }
  if (!opts.length) return null;
  if (Math.random() < 0.12) return pick(opts);
  let best = null, bs = Infinity;
  for (const o of opts) {
    let sc = dm[o.r * COLS + o.c]; if (sc < 0) sc = 60;
    if (occ.has(o.r * COLS + o.c)) sc += 7;
    sc += Math.random() * 0.8;
    if (sc < bs) { bs = sc; best = o; }
  }
  return best;
}
function gridMove(sn, room, speed, dt) {
  let rem = speed * dt * (sn.stagger > 0 ? 0.3 : 1), guard = 0;
  while (rem > 0.001 && guard++ < 5) {
    if (!sn.tc) {
      const f = nearestFreeCell(room, sn.x, sn.y);
      sn.tc = { c: f.c, r: f.r }; sn.cell = null; sn.dir = null;
    }
    const tx = (sn.tc.c + 0.5) * T, ty = (sn.tc.r + 0.5) * T;
    const dx = tx - sn.x, dy = ty - sn.y, d = Math.hypot(dx, dy);
    if (d > 0.01) sn.moveAng = Math.atan2(dy, dx);
    if (d <= rem) {
      sn.moveTo(tx, ty); rem -= d;
      if (sn.cell) sn.dir = [sn.tc.c - sn.cell.c, sn.tc.r - sn.cell.r];
      sn.cell = sn.tc;
      const nxt = chooseCell(sn, room);
      if (!nxt) { sn.tc = sn.cell; break; }
      sn.tc = nxt;
    } else {
      sn.moveTo(sn.x + (dx / d) * rem, sn.y + (dy / d) * rem); rem = 0;
    }
  }
  sn.ang = sn.moveAng;
  sn.drawAng = turnToward(sn.drawAng, sn.ang, 11 * dt);
}

function fanAt(sn, n, spread, speed, col) {
  const P = G.player;
  const base = Math.atan2(P.y - sn.y, P.x - sn.x);
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * spread;
    spawnVenom(sn.x + Math.cos(a) * sn.headR, sn.y + Math.sin(a) * sn.headR, a, speed, col);
  }
  sn.mouth = 1;
  Sfx.spit();
}
function countKind(room, kind) { let n = 0; for (const s of room.snakes) if (s.alive && s.kind === kind) n++; return n; }

/* ------------------------------------------------------------------ behaviours */
const AI = {
  grub(sn, room, dt) {
    const P = G.player;
    const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1;
    sn.wig += dt * 8;
    let ax = dx / d, ay = dy / d;
    for (const o of room.snakes) {
      if (o === sn || !o.alive || o.burrowed) continue;
      const ex = sn.x - o.x, ey = sn.y - o.y, e2 = ex * ex + ey * ey, rr = sn.headR + o.headR + 8;
      if (e2 < rr * rr && e2 > 0.01) { const e = Math.sqrt(e2); ax += (ex / e) * 0.9; ay += (ey / e) * 0.9; }
    }
    let desired = Math.atan2(ay, ax);
    let speed = sn.K.speed;
    sn.lungeCd -= dt;
    if (P.dying > 0 || P.escaping > 0) desired = sn.ang + Math.sin(sn.wig) * 0.6;
    else if (sn.lunge > 0) { sn.lunge -= dt; speed *= 2.3; }
    else {
      desired += Math.sin(sn.wig) * 0.7;
      if (d < 100 && sn.lungeCd <= 0) { sn.lunge = 0.32; sn.lungeCd = rnd(1.6, 2.4); sn.ang = Math.atan2(dy, dx); Sfx.hiss(0.5); }
    }
    steerMove(sn, room, desired, speed, sn.lunge > 0 ? 7 : 4.5, dt);
  },

  hood(sn, room, dt) {
    const P = G.player;
    const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
    sn.mt += dt;
    if (sn.mode === 'move') {
      sn.hood = Math.max(0, sn.hood - dt * 2);
      let desired;
      if (d < 120) desired = toP + Math.PI + sn.strafe * 0.5;
      else if (d > 230) desired = toP + sn.strafe * 0.35;
      else desired = toP + sn.strafe * (Math.PI / 2);
      if (Math.random() < dt * 0.25) sn.strafe *= -1;
      sn.wig += dt * 3;
      desired += Math.sin(sn.wig) * 0.3;
      steerMove(sn, room, desired, sn.K.speed, sn.K.turn, dt);
      sn.cd -= dt;
      if (sn.cd <= 0 && P.dying <= 0 && d < 330 && (clearLine(room, sn.x, sn.y, P.x, P.y) || sn.cd < -2.5)) { sn.mode = 'rear'; sn.mt = 0; Sfx.hiss(0.9); }
    } else if (sn.mode === 'rear') {
      sn.hood = Math.min(1, sn.mt / 0.5);
      sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang;
      if (sn.mt >= 0.62) {
        fanAt(sn, (G.levelDef.tier || 0) === 0 ? 1 : 3, 0.26, G.levelDef.venomSpeed, '#d8c454');
        sn.mode = 'recover'; sn.mt = 0;
      }
    } else {
      if (sn.mt >= 0.45) { sn.mode = 'move'; sn.cd = rnd(1.9, 3.1); }
    }
  },

  lamprey(sn, room, dt) {
    const P = G.player;
    const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
    sn.mt += dt;
    if (sn.mode === 'surface') {
      sn.wig += dt * 4;
      steerMove(sn, room, toP + Math.sin(sn.wig) * 0.5, sn.K.speed, sn.K.turn, dt);
      if (sn.mt > sn.surfaceT) { sn.mode = 'under'; sn.mt = 0; sn.underT = rnd(1.5, 2.3); sn.dive(); }
    } else if (sn.mode === 'under') {
      sn.ang = turnToward(sn.ang, toP, 3 * dt); sn.drawAng = sn.ang;
      const sp = sn.K.underSpeed;
      const nx = clamp(sn.x + Math.cos(sn.ang) * sp * dt, 22, RW - 22), ny = clamp(sn.y + Math.sin(sn.ang) * sp * dt, 22, RH - 22);
      sn.moveTo(nx, ny);
      if (Math.random() < dt * 18) burst(sn.x, sn.y, 1, G.levelDef.dirt, { min: 10, max: 40, lmin: 0.3, lmax: 0.5 });
      if (sn.mt > sn.underT || (d < 16 && sn.mt > 0.8)) { sn.mode = 'warn'; sn.mt = 0; Sfx.rumble(); }
    } else if (sn.mode === 'warn') {
      if (sn.mt > 0.6) { sn.erupt(room); sn.mode = 'surface'; sn.mt = 0; sn.surfaceT = rnd(2.2, 3.2); }
    }
  },

  rotter(sn, room, dt) {
    const P = G.player;
    sn.wig += dt * 5;
    if (Math.random() < dt * 6) addP({ kind: 'dot', x: sn.x + rnd(-14, 14), y: sn.y + rnd(-14, 14), vx: rnd(-40, 40), vy: rnd(-40, 40), r: 0.9, life: 0.5, col: '#0d0b06', drag: 1 });
    if (sn.mode === 'feed') {
      if (!room.rots.length) {
        sn.mode = 'hunt'; sn.mt = 0; sn.K.bite = 2;
        Sfx.roar(); G.shake = Math.max(G.shake, 8);
        UI.card('Nothing left to eat', 'It wants you now', '', 'boss', 2);
        Story.chat('rotHunt', true);
        return;
      }
      let best = null, bd = 1e9;
      for (const r of room.rots) { const d = dist(r.x, r.y, sn.x, sn.y); if (d < bd) { bd = d; best = r; } }
      steerMove(sn, room, Math.atan2(best.y - sn.y, best.x - sn.x) + Math.sin(sn.wig) * 0.35, sn.K.speed + sn.eaten * 4, sn.K.turn, dt);
      if (bd < sn.headR + 9) {
        room.rots.splice(room.rots.indexOf(best), 1);
        sn.eaten++;
        sn.maxHp += 8; sn.hp += 8; sn.maxLen += 3; sn.headR += 1.2; sn.spacing += 0.35;
        sn.K.r0 += 1.1; sn.K.r1 += 0.35;
        sn.len = sn.lenFor(); sn.mouth = 1;
        Sfx.crunch(); G.shake = Math.max(G.shake, 3);
        burst(best.x, best.y, 10, '#5d4a1c', { min: 30, max: 100, lmin: 0.3, lmax: 0.6 });
      }
    } else {
      sn.mt += dt;
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
      const fast = sn.mt % 3 > 2.4;
      steerMove(sn, room, toP + Math.sin(sn.wig) * 0.25, (88 + sn.eaten * 3) * (fast ? 1.8 : 1), fast ? 5 : 3.2, dt);
      if (fast) sn.mouth = 1;
    }
  },

  long(sn, room, dt) {
    const speed = (sn.K.cells + (1 - clamp(sn.hp / sn.maxHp, 0, 1)) * 1.3) * T;
    gridMove(sn, room, speed, dt);
    for (const o of room.snakes) {
      if (o === sn || !o.alive || o.kind !== 'grub' || o.state !== 'active') continue;
      const rr = sn.headR + o.headR;
      if (dist2(o.x, o.y, sn.x, sn.y) < rr * rr) {
        o.kill(true);
        sn.hp = Math.min(sn.maxHp * 1.4, sn.hp + 4);
        sn.len = sn.lenFor();
        sn.mouth = 1; Sfx.crunch();
      }
    }
  },

  mother(sn, room, dt) {
    const P = G.player;
    const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
    const ph2 = sn.hp < sn.maxHp * 0.5;
    sn.mt += dt; sn.birthCd -= dt; sn.chargeCd -= dt; sn.wig += dt * 3;
    if (sn.mode === 'move') {
      steerMove(sn, room, toP + Math.sin(sn.wig) * 0.4, ph2 ? 62 : 50, 2.2, dt);
      if (sn.birthCd <= 0 && countKind(room, 'grub') < (ph2 ? 5 : 3)) { sn.mode = 'birth'; sn.mt = 0; Sfx.hiss(1.2); }
      else if (sn.chargeCd <= 0 && d > 90) { sn.mode = 'rear'; sn.mt = 0; Sfx.hiss(1.4); }
    } else if (sn.mode === 'birth') {
      sn.swell = Math.min(1, sn.mt / 0.9);
      if (sn.mt >= 0.9) {
        const vis = sn.pts.filter((p, k) => !p.hid && k % 3 === 1);
        const n = ph2 ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const p = vis.length ? vis[(i * 2) % vis.length] : sn;
          const f = freeAt(room, p.x, p.y, 8) ? { x: p.x, y: p.y } : nearestFreeCell(room, p.x, p.y);
          const g = new Snake('grub', f.x, f.y, { emerge: false, spawnTime: 0.25, locks: true });
          room.snakes.push(g);
          burst(f.x, f.y, 8, sn.K.sac, { min: 30, max: 100, lmin: 0.3, lmax: 0.6 });
        }
        Sfx.squelch();
        sn.swell = 0; sn.mode = 'move'; sn.birthCd = ph2 ? 4.2 : 5.6;
      }
    } else if (sn.mode === 'rear') {
      sn.ang = turnToward(sn.ang, toP, 4 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.06;
      if (sn.mt >= 0.75) { sn.mode = 'charge'; sn.mt = 0; sn.chargeAng = sn.ang; Sfx.roar(); }
    } else if (sn.mode === 'charge') {
      const sp = ph2 ? 300 : 260;
      const ox = sn.x, oy = sn.y, m = sn.headR * 0.8;
      let nx = sn.x + Math.cos(sn.chargeAng) * sp * dt, ny = sn.y + Math.sin(sn.chargeAng) * sp * dt;
      [nx, ny] = resolveTiles(room, nx, ny, m);
      nx = clamp(nx, m, RW - m); ny = clamp(ny, m, RH - m);
      const blocked = Math.hypot(nx - ox, ny - oy) < sp * dt * 0.5;
      sn.moveTo(nx, ny); sn.drawAng = sn.ang;
      if (blocked || sn.mt > 1.3) {
        sn.mode = 'stun'; sn.mt = 0;
        if (blocked) { G.shake = Math.max(G.shake, 9); Sfx.thud(); burst(sn.x + Math.cos(sn.chargeAng) * sn.headR, sn.y + Math.sin(sn.chargeAng) * sn.headR, 12, G.levelDef.rock, { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.7 }); }
      }
    } else if (sn.mode === 'stun') {
      if (sn.mt > (ph2 ? 0.6 : 0.9)) { sn.mode = 'move'; sn.chargeCd = ph2 ? 3.6 : 5.2; }
    }
  },

  queen(sn, room, dt) {
    const P = G.player;
    const dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1, toP = Math.atan2(dy, dx);
    const ph2 = sn.hp < sn.maxHp * 0.5;
    sn.mt += dt;
    if (sn.mode === 'surface') {
      sn.wig += dt * 2.5;
      steerMove(sn, room, toP + Math.sin(sn.wig) * 0.6, ph2 ? 58 : 46, 2.2, dt);
      sn.spitCd -= dt;
      if (sn.spitCd <= 0 && P.dying <= 0) { fanAt(sn, 3, 0.24, G.levelDef.venomSpeed, '#e2604e'); sn.spitCd = ph2 ? 0.7 : 0.95; }
      if (sn.mt > (ph2 ? 2.8 : 3.4)) { sn.mode = 'under'; sn.mt = 0; sn.dive(); }
    } else if (sn.mode === 'under') {
      sn.ang = turnToward(sn.ang, toP, 3 * dt); sn.drawAng = sn.ang;
      const sp = ph2 ? 175 : 150;
      const nx = clamp(sn.x + Math.cos(sn.ang) * sp * dt, 30, RW - 30), ny = clamp(sn.y + Math.sin(sn.ang) * sp * dt, 30, RH - 30);
      sn.moveTo(nx, ny);
      if (Math.random() < dt * 22) burst(sn.x, sn.y, 1, G.levelDef.dirt, { min: 10, max: 50, lmin: 0.3, lmax: 0.5 });
      if (sn.mt > 2.0 || (d < 18 && sn.mt > 0.9)) { sn.mode = 'warn'; sn.mt = 0; Sfx.rumble(); }
    } else if (sn.mode === 'warn') {
      if (sn.mt > 0.72) { sn.erupt(room); sn.mode = 'surface'; sn.mt = 0; sn.spitCd = 0.8; }
    }
  },

  ouro(sn, room, dt) {
    const P = G.player;
    const ph2 = sn.hp < sn.maxHp * 0.5;
    sn.mt += dt;
    if (sn.charge) {
      sn.charge.t += dt;
      const p = sn.pts[sn.charge.k];
      if (!p || p.hid) sn.charge = null;
      else if (sn.charge.t >= 0.45) {
        spawnVenom(p.x, p.y, Math.atan2(P.y - p.y, P.x - p.x), G.levelDef.venomSpeed * 0.9, '#ff7a3c');
        Sfx.spit(); sn.charge = null;
      }
    }
    const fireEye = (cd) => {
      sn.eyeCd -= dt;
      if (sn.eyeCd <= 0 && !sn.charge && P.dying <= 0) {
        const every = sn.K.bodyEyeEvery, opts = [];
        for (let k = every - 2; k < sn.pts.length; k += every) if (k > 0 && !sn.pts[k].hid) opts.push(k);
        if (opts.length) sn.charge = { k: pick(opts), t: 0 };
        sn.eyeCd = cd;
      }
    };
    if (sn.mode === 'move') { sn.mode = 'ring'; }
    if (sn.mode === 'ring' && !(sn.ringR > 0)) { sn.ringR = 90; sn.theta = 0; sn.spin = sn.spin || 1; sn.cx = clamp(sn.x - 90, 116, RW - 116); sn.cy = clamp(sn.y, 116, RH - 116); }
    if (sn.mode === 'ring') {
      const Rt = clamp((sn.len * sn.spacing) / TAU * 1.02, 60, 150);
      sn.ringR = lerp(sn.ringR, Rt, Math.min(1, dt * 1.2));
      const R = sn.ringR, m = R + 26;
      const tx = m < RW - m ? clamp(P.x, m, RW - m) : RW / 2, ty = m < RH - m ? clamp(P.y, m, RH - m) : RH / 2;
      sn.cx = approach(sn.cx, tx, 16 * dt); sn.cy = approach(sn.cy, ty, 16 * dt);
      sn.theta += (sn.K.ringSpeed / R) * dt * sn.spin;
      sn.moveTo(sn.cx + Math.cos(sn.theta) * R, sn.cy + Math.sin(sn.theta) * R);
      sn.ang = sn.theta + sn.spin * Math.PI / 2; sn.drawAng = sn.ang;
      sn.spitCd -= dt;
      if (sn.spitCd <= 0 && P.dying <= 0) { fanAt(sn, 3, 0.3, G.levelDef.venomSpeed, '#e2604e'); sn.spitCd = 2.4; }
      fireEye(1.25);
      if (ph2) { sn.mode = 'release'; sn.mt = 0; Sfx.roar(); G.shake = Math.max(G.shake, 10); sn.charge = null; UI.card('It lets go', 'Ouroboros', '', 'boss', 1.6); }
    } else if (sn.mode === 'release') {
      sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.2; sn.mouth = 1;
      if (sn.mt > 1.1) { sn.mode = 'chase'; sn.tc = null; sn.cell = null; sn.dir = null; sn.spitCd = 1.6; }
    } else if (sn.mode === 'chase') {
      gridMove(sn, room, (2.8 + (sn.hp < sn.maxHp * 0.25 ? 0.5 : 0)) * T, dt);
      sn.spitCd -= dt;
      if (sn.spitCd <= 0 && P.dying <= 0) { fanAt(sn, sn.hp < sn.maxHp * 0.25 ? 5 : 3, 0.28, G.levelDef.venomSpeed, '#e2604e'); sn.spitCd = 2.6; }
      fireEye(1.6);
    }
  },
};

