/* src/10-actors.js: actors: Player, seeds, venom, pickups, particles, decals. From v1 to v8. Lines 5660 to 6524 of the v13.7 script. */
/* =====================================================================
   Actors: the apple, seeds, venom, pickups, particles, decals
   ===================================================================== */
/* P3 (v14.0): particles live in a ring of at most 480. When it is full the oldest slot is overwritten
   (no splice, no shift). In multiplayer every player's own effects get at most 480 / n slots (PART14.share). */
const PART14 = { cap: 480, head: 0, pool: [], share: 0, own: null, count: new Map() };
function addP(o) {
  const ps = G.particles;
  o.t = 0;
  if (o.drag == null) o.drag = 4;
  if (o.rot == null) o.rot = 0;
  if (PART14.share && PART14.own) {
    o.own14 = PART14.own;
    const n = PART14.count.get(o.own14) || 0;
    if (n >= PART14.share) {                                 /* this player is over its share: replace its oldest */
      for (let i = 0; i < ps.length; i++) if (ps[i].own14 === o.own14) { recycleP(ps[i]); ps[i] = o; return; }
    }
    PART14.count.set(o.own14, n + 1);
  }
  if (ps.length < PART14.cap) { ps.push(o); return; }
  const i = PART14.head % ps.length; PART14.head = i + 1;
  if (ps[i].own14) PART14.count.set(ps[i].own14, Math.max(0, (PART14.count.get(ps[i].own14) || 1) - 1));
  recycleP(ps[i]); ps[i] = o;
}
function recycleP(p) { if (p && p.pool14 && PART14.pool.length < 600) PART14.pool.push(p); }
function poolP() { return PART14.pool.pop() || { pool14: 1 }; }
function burst(x, y, n, col, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = o.ang != null ? o.ang + vrnd(-(o.spread || 0.6), o.spread || 0.6) : vrnd(TAU);   /* T8: particles use the visual random */
    const sp = vrnd(o.min != null ? o.min : 30, o.max != null ? o.max : 120);
    const p = poolP();                                         /* P3: burst particles come from a pool, all fields set */
    p.kind = o.kind || 'dot'; p.x = x + vrnd(-1, 1); p.y = y + vrnd(-1, 1); p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
    p.r = vrnd(o.rmin != null ? o.rmin : 1.2, o.rmax != null ? o.rmax : 2.8); p.life = vrnd(o.lmin != null ? o.lmin : 0.25, o.lmax != null ? o.lmax : 0.6);
    p.drag = o.drag != null ? o.drag : 4; p.g = o.g || 0; p.col = col; p.col2 = o.col2; p.rot = vrnd(TAU); p.vr = vrnd(-9, 9); p.glow = !!o.glow; p.own14 = null;
    addP(p);
  }
}
function flashLight(x, y, r, i, life) { G.flashes.push({ x, y, r, i, life, t: 0 }); }
function addDecal(room, type, x, y, r, col) {
  const d = { type, x, y, r, col, seed: RAND14.real() };
  /* P3: a ring of 150, the oldest decal is overwritten */
  if (room.decals.length < 150) room.decals.push(d);
  else { const i = (room.decalHead14 || 0) % room.decals.length; room.decals[i] = d; room.decalHead14 = i + 1; }
  if (room.cacheCtx && !room.dirty) drawDecal(room.cacheCtx, d);
}

/* ------------------------------------------------------------------ the apple */
class Player {
  constructor(charId) {
    this.x = RW / 2; this.y = RH / 2; this.vx = 0; this.vy = 0; this.kbx = 0; this.kby = 0;
    this.r = 12.5; this.R = 14;
    this.maxHp = 6; this.hp = 6; this.bites = [];
    this.speed = 152; this.fireDelay = 0.36; this.shotSpeed = 320; this.range = 255; this.dmg = 1;
    this.cool = 0; this.inv = 0; this.hurtT = 0;
    this.items = [];
    this.twin = false; this.cyanide = false; this.toffee = false; this.shellUp = false; this.shellT = 0; this.worm = null; this.cider = false;
    this.lookX = 0; this.lookY = 0.3; this.aimX = 0; this.aimY = -1; this.aimHold = 0;
    this.blinkT = 2.5; this.blink = 1; this.fear = 0;
    this.hop = 0; this.hopH = 0; this.squash = 0; this.recoil = 0; this.leaf = 0;
    this.dying = 0; this.escaping = 0; this.god = false; this.bubbleT = 0;
    this.seedSize = 1; this.spread = false; this.pierce = false; this.bounce = 0;
    this.char = CHARS[charId] ? charId : 'apple';
    const C = CHARS[this.char];
    this.speed = C.speed; this.fireDelay = C.fireDelay; this.dmg = C.dmg; this.seedSize = C.seedSize; this.maxHp = C.maxHp; this.hp = C.maxHp;
    this.seeker = false; this.frost = false; this.fizzy = false; this.halo = null; this.split = false; this.hungry = false; this.hunger = 0;
    this.ember = false; this.boomer = false; this.lucky = false; this.zap = false; this.wiggle = false; this.sniper = false; this.heavy = false;
    this.spiky = false; this.glow = false; this.clover = false; this.juice = false; this.magnet = false; this.regrow = false;
    this.nova = false; this.cannon = false; this.buddy = null; this.phoenix = false; this.phoenixUsed = false; this.storm = false; this.stormT = 0;
    this.chrono = false; this.mirror = false; this.vamp = false; this.vampAcc = 0; this.shots = 0;
    this.eater = !!C.eater; this.growth = 0; this.chew = 0; this.chewO = null; this.chomp = 0;
    this.pump = false; this.pumpN = 0; this.capy = null; this.chill = false; this.chillOn = false; this.stillT = 0; this.brim = false;
    this.coaster = false; this.pick = false; this.fuse = false; this.pact = false; this.dropper = null;
    this.bonus = false; this.tag = false; this.gratis = false; this.hagel = false; this.klomp = false; this.stompT = 0;
    this.motie = false; this.motieN = 0; this.motieGo = 0; this.hamer = false; this.stroop = false; this.syrup = false;
    this.molen = false; this.molenT = 3; this.veto = false; this.vetoUsed = false; this.coalitie = null; this.delta = false; this.deltaT = 4;
    this.freezer = !!C.freeze;
    // version 8: curses, downgrades and the newest powerups
    this.curses = []; this.downs = []; this.mods = null; this.flags = {}; this.bitterAcc = 0; this.rootT = 0;
    this.compost = false; this.compostN = 0; this.graft = false; this.graftN = 0; this.bruised = false; this.sap = false; this.sapT = 0;
    this.seedbank = false; this.pollen = false; this.pollenT = 2; this.dash = false; this.dashCd = 0; this.dashT = 0; this.dashX = 0; this.dashY = 0;
    initPlayer9(this, C);
    if (C.cyanide) this.cyanide = true;
    for (const id of C.start || []) { ITEMS[id].apply(this); this.items.push(id); }
    recalcMods(this);
  }
  heal(n) {
    // Bitter Skin: every slice heals half as much
    if (this.flags.bitter && n > 0) { this.bitterAcc += n / 2; n = Math.floor(this.bitterAcc); this.bitterAcc -= n; }
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + n);
    const healed = this.hp - before;
    for (let i = 0; i < healed && this.bites.length; i++) this.bites.pop();
    if (healed > 0 && G.state === 'play') {
      Meta.add('heals');
      if (!Save.data.unlocks.krul) floatText(this.x, this.y - 26, `HEALS ${Math.min(20, Meta.value('heals'))}/20`, '#ffb0a8');
    }
    return healed;
  }
  hurt(n, sx, sy, src) {
    if (this.inv > 0 || this.dashT > 0 || this.dying > 0 || this.escaping > 0 || G.state !== 'play') return false;
    const ang = Math.atan2(this.y - sy, this.x - sx);
    const kb = (this.chillOn ? 0 : this.heavy ? 120 : 230) * this.mods.kb;
    this.kbx = Math.cos(ang) * kb; this.kby = Math.sin(ang) * kb;
    if ((this.spiky || this.flags.bitter) && src && src.canBeHit && src.canBeHit()) {
      src.hurt(4, this.x, this.y);
      burst(this.x, this.y, 10, '#b7c46a', { kind: 'shard', min: 60, max: 160, lmin: 0.25, lmax: 0.5 });
    }
    if (this.god) { this.inv = 0.5; return true; }
    if (this.clover && Math.random() < 0.2) {
      this.inv = 0.6; floatText(this.x, this.y - 24, 'MISS', '#9be37a');
      burst(this.x, this.y, 8, '#7fc85a', { min: 30, max: 90, lmin: 0.3, lmax: 0.5, glow: true });
      return true;
    }
    if (this.toffee && this.shellUp) {
      this.shellUp = false; this.shellT = 0; this.inv = 0.9; this.squash = 0.6;
      Sfx.shell(); G.shake = Math.max(G.shake, 4);
      burst(this.x, this.y, 14, '#e8a23c', { kind: 'shard', min: 60, max: 170, rmin: 1.5, rmax: 3.2, lmin: 0.4, lmax: 0.8, drag: 3 });
      return true;
    }
    if (this.syrup) {
      this.syrup = false; this.inv = 0.9; this.squash = 0.5;
      Sfx.shell(); floatText(this.x, this.y - 24, 'STROOP', '#e8a23c');
      burst(this.x, this.y, 12, '#d8902a', { min: 40, max: 120, rmin: 1.4, rmax: 2.8, lmin: 0.4, lmax: 0.8, drag: 3 });
      return true;
    }
    if (G.D && G.D.bite && src && src.K) n = Math.max(n, 2);
    if (this.flags.glass) n = Math.max(n, 2);
    n = Math.min(n, this.hp);
    n = curatorN9(this, n);
    if (this.phoenix && !this.phoenixUsed && this.hp - n <= 0) {
      this.phoenixUsed = true;
      this.hp = Math.min(this.maxHp, 4); this.bites.length = Math.min(this.bites.length, Math.max(0, this.maxHp - this.hp));
      this.inv = 2.6; this.squash = 1; G.shake = Math.max(G.shake, 10); G.whiteout = 0.4;
      Sfx.phoenix(); UI.banner('Phoenix Seed', 'You burst back to life.', 'legend');
      for (const col of ['#ff6a2a', '#ffb43a', '#fff0b0']) burst(this.x, this.y, 18, col, { min: 60, max: 220, rmin: 1.5, rmax: 3.5, lmin: 0.5, lmax: 1.1, glow: true });
      flashLight(this.x, this.y, 200, 1, 1.2);
      for (const sn of G.room.snakes) if (sn.canBeHit() && dist(sn.x, sn.y, this.x, this.y) < 120) sn.hurt(6, this.x, this.y);
      return true;
    }
    G.run.hits = (G.run.hits || 0) + 1;
    G.run.roomHits = (G.run.roomHits || 0) + 1;
    this.hp -= n;
    if (this.fuse && this.hp > 0) explode(G.room, this.x, this.y, 74, { hurtPlayer: false, snakeDmg: 8 });
    for (let i = 0; i < n; i++) { const idx = this.bites.length; this.bites.push({ a: BITE_ANGLES[idx % BITE_ANGLES.length] + rnd(-0.08, 0.08), t: G.t }); }
    this.inv = 1.05; this.hurtT = 0.4; this.squash = 1;
    G.shake = Math.max(G.shake, 7); G.hurtFlash = 0.35;
    Sfx.crunch();
    if (Math.random() < 0.4) Story.chat('hurt');
    burst(this.x, this.y, 10, '#f2dfb6', { kind: 'chunk', min: 50, max: 150, rmin: 1.6, rmax: 3, lmin: 0.4, lmax: 0.7, drag: 4 });
    burst(this.x, this.y, 8, '#e7ad4c', { min: 40, max: 140, rmin: 1, rmax: 2.2, lmin: 0.3, lmax: 0.6 });
    addDecal(G.room, 'juice', this.x + rnd(-4, 4), this.y + rnd(-4, 4), 6, '#d9a24a');
    try { if (navigator.vibrate && Save.data.settings.vibrate !== false) navigator.vibrate(50); } catch (e) { /* ignore */ }
    if (this.toffee) this.shellT = 0;
    if (this.hp <= 0) { this.dying = 0.0001; Game.onPlayerDeath(); return true; }
    // Mikappols: one face, always. When something bites, time stops.
    if (this.freezer) {
      G.freeze = 1.5; Meta.add('freezes'); Sfx.freeze();
      addP({ kind: 'ring', x: this.x, y: this.y, vx: 0, vy: 0, r: 12, life: 0.5, col: '#7fb0ff', drag: 0, glow: true });
    }
    if (this.veto && !this.vetoUsed && this.hp <= 2) { this.vetoUsed = true; vetoAll(this, G.room); }
    return true;
  }

  update(dt, room) {
    this.leaf = Math.sin(G.t * 2.2) * 0.12 + clamp(this.vx * 0.0015, -0.3, 0.3);
    this.blinkT -= dt;
    if (this.blinkT < -0.12) this.blinkT = rnd(2.2, 5);
    this.blink = this.blinkT < 0 ? 0.05 : Math.min(1, this.blink + dt * 12);
    this.squash = approach(this.squash, 0, dt * 4);
    this.recoil = approach(this.recoil, 0, dt * 7);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.inv = Math.max(0, this.inv - dt);
    if (this.dying > 0) { this.dying += dt; return; }
    if (this.escaping > 0) { this.escaping += dt; this.vx = this.vy = 0; return; }

    const IN14 = this.input14 || Input;                         /* M4: this apple's own input source */
    let mv = IN14.moveVec();
    // roots hold the apple in place for a moment
    if (this.rootT > 0) { this.rootT -= dt; mv = { x: 0, y: 0 }; }
    const spd = this.speed * this.mods.speed * speedK9(this, room);
    const tvx = mv.x * spd, tvy = mv.y * spd;
    const acc = room.ice || this.flags.slippery ? (mv.x || mv.y ? 430 : 170) : mv.x || mv.y ? 1500 : 1250;
    this.vx = approach(this.vx, tvx, acc * dt); this.vy = approach(this.vy, tvy, acc * dt);
    updateDash(this, dt, room, mv);
    this.kbx = approach(this.kbx, 0, 900 * dt); this.kby = approach(this.kby, 0, 900 * dt);

    if (!room.locked) {
      const near = DOOR_HW + 20, m = 150 * dt;
      if (room.doors.n && mv.y < -0.3 && this.y < this.r + 12 && Math.abs(this.x - RW / 2) < near) this.x = approach(this.x, RW / 2, m);
      if (room.doors.s && mv.y > 0.3 && this.y > RH - this.r - 12 && Math.abs(this.x - RW / 2) < near) this.x = approach(this.x, RW / 2, m);
      if (room.doors.w && mv.x < -0.3 && this.x < this.r + 12 && Math.abs(this.y - RH / 2) < near) this.y = approach(this.y, RH / 2, m);
      if (room.doors.e && mv.x > 0.3 && this.x > RW - this.r - 12 && Math.abs(this.y - RH / 2) < near) this.y = approach(this.y, RH / 2, m);
    }
    let nx = this.x + (this.vx + this.kbx) * dt, ny = this.y + (this.vy + this.kby) * dt;
    [nx, ny] = this.flyer ? resolveFly10(room, nx, ny, this.r) : resolveTiles(room, nx, ny, this.r);
    this.x = nx; this.y = ny;
    clampPlayer(this, room);
    if (this.eater) this.updateChew(dt, room, mv);
    this.chomp = Math.max(0, this.chomp - dt);

    const sp = Math.hypot(this.vx, this.vy);
    if (sp > 20) this.hop += sp * dt * 0.075;
    else this.hop = approach(this.hop, Math.ceil(this.hop / Math.PI - 0.001) * Math.PI, dt * 8);
    this.hopH = Math.abs(Math.sin(this.hop)) * Math.min(1, sp / 120) * 4;

    // eyes: aim direction, else the nearest threat, else where we are going
    let near = null, nd = 1e9;
    for (const sn of room.snakes) {
      if (!sn.alive || sn.state === 'spawn' && sn.delay > 0 || sn.burrowed) continue;
      const d = dist(sn.x, sn.y, this.x, this.y); if (d < nd) { nd = d; near = sn; }
    }
    this.fear = approach(this.fear, near ? clamp(1 - nd / 200, 0, 1) : 0, dt * 3);
    this.aimHold = Math.max(0, this.aimHold - dt);
    let lx, ly;
    if (this.aimHold > 0) { lx = this.aimX; ly = this.aimY; }
    else if (near && nd < 260) { lx = (near.x - this.x) / nd; ly = (near.y - this.y) / nd; }
    else if (sp > 30) { lx = this.vx / sp; ly = this.vy / sp; }
    else { lx = 0; ly = 0.25; }
    this.lookX = approach(this.lookX, lx, dt * 8); this.lookY = approach(this.lookY, ly, dt * 8);

    this.cool -= dt;
    const scr = View.toScreen(this.x, this.y);
    const aim = this.noShoot14 ? null : IN14.aimVec(scr[0], scr[1]);   /* M9: no shooting while a personal panel is open */
    if (aim) {
      let ax = aim.x, ay = aim.y;
      if (aim.touch && Save.data.assist) [ax, ay] = assistAim(room, this, ax, ay);
      this.aimX = ax; this.aimY = ay; this.aimHold = 0.45;
      if (this.cool <= 0) { this.fire(ax, ay); this.cool = effDelay(this); }
    }

    // standing still: Chill Vibes, and the Chill Guy achievement
    if (sp < 12 && IN14.moveVec().x === 0 && IN14.moveVec().y === 0) this.stillT += dt; else this.stillT = 0;
    this.chillOn = this.chill && this.stillT > 0.6;
    if (this.stillT >= 8 && !G.run.chilled && room.locked && room.snakes.some((s) => s.alive && s.state === 'active')) { G.run.chilled = true; Meta.add('chill'); }
    if (this.capy) {
      const cp = this.capy, tx = this.x + this.aimY * 26 - this.aimX * 10, ty = this.y - this.aimX * 22 - this.aimY * 10 + 6;
      const k = Math.min(1, dt * 3.5), ox = cp.x;
      cp.x += (tx - cp.x) * k; cp.y += (ty - cp.y) * k; cp.ph += Math.abs(cp.x - ox) * 0.3 + dt;
      cp.face = tx > cp.x + 1 ? 1 : tx < cp.x - 1 ? -1 : cp.face || 1;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.isBoss && dist(sn.x, sn.y, cp.x, cp.y) < 85) sn.slow = Math.max(sn.slow, 0.25);
      if (room.locked && room.snakes.some((s) => s.alive)) {
        cp.t += dt;
        if (cp.t >= 22) { cp.t = 0; dropHeart(room, cp.x, cp.y, 1); floatText(cp.x, cp.y - 20, 'YUZU', '#ffb43a'); Sfx.pickup(); }
      }
    }
    if (this.buddy) {
      const b = this.buddy, tx = this.x - this.aimX * 22 - this.aimY * 12, ty = this.y - this.aimY * 18 + this.aimX * 12 + 4;
      const k = Math.min(1, dt * 6); b.x += (tx - b.x) * k; b.y += (ty - b.y) * k;
    }
    if (this.storm) {
      this.stormT -= dt;
      if (this.stormT <= 0) {
        const tg = shuffle(room.snakes.filter((s) => s.canBeHit() && !s.burrowed));
        this.stormT = tg.length ? 2.4 : 0.5;
        for (const s of tg.slice(0, 3)) G.strikes.push({ x: s.x + rnd(-5, 5), y: s.y + rnd(-5, 5), t: 0, dmg: this.dmg * 1.6 });
      }
    }
    if (this.toffee && !this.shellUp) {
      this.shellT += dt;
      if (this.shellT >= 7) {
        this.shellUp = true; Sfx.shellBack();
        burst(this.x, this.y, 8, '#ffd27a', { min: 20, max: 60, lmin: 0.3, lmax: 0.6, glow: true });
      }
    }
    if (this.worm) {
      const w = this.worm;
      w.a += dt * 2.5; w.x = this.x + Math.cos(w.a) * 34; w.y = this.y + Math.sin(w.a) * 31;
      w.cd -= dt;
      if (w.cd <= 0) {
        for (const sn of room.snakes) {
          if (sn.canBeHit() && sn.hitTest(w.x, w.y, 7)) {
            sn.hurt(1.2, w.x, w.y); w.cd = 0.35;
            burst(w.x, w.y, 4, '#f095a5', { min: 20, max: 60, lmin: 0.2, lmax: 0.4 });
            break;
          }
        }
      }
    }
    if (this.halo) {
      const h = this.halo; h.a += dt * 3.2;
      for (let i = 0; i < 3; i++) {
        const a = h.a + (i * TAU) / 3, o = h.orbs[i];
        o.x = this.x + Math.cos(a) * 25; o.y = this.y + Math.sin(a) * 23;
        h.cd[i] -= dt;
        if (h.cd[i] > 0) continue;
        for (const sn of room.snakes) if (sn.canBeHit() && sn.hitTest(o.x, o.y, 5)) { sn.hurt(0.8, o.x, o.y); h.cd[i] = 0.3; break; }
      }
    }
    updatePlayerExtras(this, dt, room, sp);
    if (this.cider && sp > 40) {
      this.bubbleT -= dt;
      if (this.bubbleT <= 0) {
        this.bubbleT = 0.09;
        addP({ kind: 'bubble', x: this.x + rnd(-8, 8), y: this.y + rnd(-4, 8), vx: rnd(-8, 8), vy: rnd(-30, -15), r: rnd(1.5, 3), life: rnd(0.5, 0.9), col: '#ffe2a4', drag: 1 });
      }
    }

    if (!room.locked && !G.trans) {
      const k = this.r * 0.8;
      if (this.y < -k && room.doors.n) Game.goThrough('n');
      else if (this.y > RH + k && room.doors.s) Game.goThrough('s');
      else if (this.x < -k && room.doors.w) Game.goThrough('w');
      else if (this.x > RW + k && room.doors.e) Game.goThrough('e');
    }
  }

  // Krullenbol: push into a rock or eggs to eat them
  updateChew(dt, room, mv) {
    const mm = Math.hypot(mv.x, mv.y);
    let best = null, bd = 1e9;
    if (mm > 0.3) {
      const pc = Math.floor(this.x / T), pr = Math.floor(this.y / T);
      for (let r = pr - 1; r <= pr + 1; r++) for (let c = pc - 1; c <= pc + 1; c++) {
        if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
        const o = room.tiles[r][c];
        if (!o || !(o.type === 'rock' || o.type === 'egg' || o.type === 'block')) continue;
        const ins = tileInset(o);
        const nx = clamp(this.x, c * T + ins, (c + 1) * T - ins), ny = clamp(this.y, r * T + ins, (r + 1) * T - ins);
        const d = Math.hypot(this.x - nx, this.y - ny);
        if (d > this.r + 2.5) continue;
        const dx = o.x - this.x, dy = o.y - this.y, dl = Math.hypot(dx, dy) || 1;
        if ((dx * mv.x + dy * mv.y) / (dl * mm) < 0.45) continue;
        if (d < bd) { bd = d; best = o; }
      }
    }
    if (!best) { this.chew = Math.max(0, this.chew - dt * 2); if (this.chew === 0) this.chewO = null; return; }
    if (best !== this.chewO) { this.chewO = best; this.chew = 0; }
    const need = best.type === 'rock' ? 0.55 : 0.3;
    const before = this.chew;
    this.chew += dt;
    if (Math.floor(before / 0.14) !== Math.floor(this.chew / 0.14)) {
      this.chomp = 0.12; Sfx.chomp(); best.shake = 0.15;
      const col = best.type === 'rock' ? G.levelDef.rock : best.type === 'egg' ? '#e8dcc6' : best.col;
      const mx = (this.x + best.x) / 2, my = (this.y + best.y) / 2;
      burst(mx, my, 3, col, { kind: 'shard', min: 30, max: 90, rmin: 1, rmax: 2.2, lmin: 0.2, lmax: 0.45 });
    }
    if (this.chew >= need) { this.eatObstacle(room, best); this.chew = 0; this.chewO = null; }
  }
  eatObstacle(room, o) {
    room.removeObstacle(o); o.broken = true; o.dead = true;
    if (o.type === 'rock') room.dirty = true;
    const col = o.type === 'rock' ? G.levelDef.rock : o.type === 'egg' ? '#e8dcc6' : o.col;
    burst(o.x, o.y, 12, col, { kind: 'shard', min: 40, max: 140, rmin: 1.4, rmax: 3.2, lmin: 0.3, lmax: 0.7, drag: 4 });
    if (o.type === 'egg') burst(o.x, o.y, 6, '#e3c45a', { min: 20, max: 80, lmin: 0.3, lmax: 0.6 });
    Sfx.crunch(); this.squash = 0.7; G.shake = Math.max(G.shake, 2);
    Meta.add('eaten');
    if (this.growth < 16) {
      this.growth++; this.seedSize += 0.055; this.dmg += 0.07;
      floatText(this.x, this.y - 26, `GROW ${this.growth}/16`, '#ffd27a');
    } else floatText(this.x, this.y - 26, 'FULL', '#ffd27a');
    if (o.type === 'egg') this.heal(1);
    if (o.item) spawnItem(room, o.x, o.y);
  }

  fire(ax, ay) {
    let base = Math.atan2(ay, ax);
    // Butterfingers wobbles, a Hangover sways
    if (this.mods.wobble) base += rnd(-this.mods.wobble, this.mods.wobble);
    if (this.mods.sway) base += Math.sin(G.t * 2.3) * this.mods.sway + Math.sin(G.t * 5.1) * this.mods.sway * 0.3;
    base -= preFire9(this);
    const shots = this.twin ? [[-0.07, -4.5, 0.8], [0.07, 4.5, 0.8]] : [[0, 0, 1]];
    if (this.spread) shots.push([-0.36, 0, 0.7], [0.36, 0, 0.7]);
    if (this.mirror) shots.push([Math.PI, 0, 0.8]);
    this.shots++;
    for (const [da, off, mult] of shots) {
      const a = base + da;
      const px = -Math.sin(base) * off, py = Math.cos(base) * off;
      makeSeed(this, this.x + Math.cos(a) * 10 + px, this.y + Math.sin(a) * 10 + py - 2, a, { inherit: true, mult });
    }
    if (this.nova && this.shots % 5 === 0) {
      for (let i = 0; i < 10; i++) { const a = base + (i / 10) * TAU + 0.31; makeSeed(this, this.x + Math.cos(a) * 12, this.y + Math.sin(a) * 12 - 2, a, { mult: 0.7, size: 0.85 }); }
      flashLight(this.x, this.y, 70, 0.5, 0.3);
    }
    if (this.buddy) { const b = this.buddy; makeSeed(this, b.x, b.y - 3, Math.atan2(this.y + ay * 200 - b.y, this.x + ax * 200 - b.x), { mult: 0.6, size: 0.7 }); }
    if (this.hagel) {
      for (let i = 0; i < 3; i++) {
        const s = makeSeed(this, this.x + Math.cos(base) * 8, this.y + Math.sin(base) * 8 - 2, base + rnd(-0.5, 0.5), { mult: 0.3, size: 0.5, noCan: true });
        s.life *= rnd(0.45, 0.65); s.sprinkle = HAGEL_COLS[(this.shots + i) % HAGEL_COLS.length]; s.pierce = false; s.split = false; s.boom = false; s.fizzy = false;
      }
    }
    if (this.hamer && this.shots % 10 === 0 && G.room) gavelOrder(this, G.room);
    fire9(this, base);
    this.recoil = 1;
    Sfx.shoot();
  }
}
Hooks.install(Player.prototype, 'hurt', 'Player.hurt');      /* T1: layers in 32, 46, 52, 72, 73 */

const HAGEL_COLS = ['#4a2a16', '#f2e6d0', '#e86a9a', '#6ac0f0', '#f2d24a', '#4a2a16'];
function makeSeed(P, x, y, a, o = {}) {
  const crit9 = critNext9(P, o);
  const crit = (P.lucky && Math.random() < 0.2) || crit9;
  const ss = P.shotSpeed * P.mods.shot, rg = P.range * P.mods.range;
  const s = {
    x, y, vx: Math.cos(a) * ss + (o.inherit ? P.vx * 0.3 : 0), vy: Math.sin(a) * ss + (o.inherit ? P.vy * 0.3 : 0),
    life: rg / ss, t: 0, dmg: seedDmg(P) * (o.mult || 1) * (crit ? 3 : 1), cy: P.cyanide, rot: a,
    size: P.seedSize * P.mods.size * (o.size || 1) * (crit ? 1.25 : 1), pierce: P.pierce, bounce: P.bounce, hits: null,
    home: P.seeker, frost: P.frost, fizzy: P.fizzy, split: P.split, ember: P.ember, boom: P.boomer, zap: P.zap,
    wig: P.wiggle ? 0 : null, sniper: P.sniper, crit, cannon: P.cannon, glow: P.glow, pick: P.pick, hell: P.pact,
    loop: P.coaster ? 0 : null, looped: false, tag: P.tag, gavel: P.hamer,
  };
  if (P.coaster) s.life += 0.34;
  seed9(P, s, o);
  if (P.pump && !o.noCan && ++P.pumpN % 4 === 0) s.can = true;
  if (MP14.on) s.owner14 = P;                                /* M3: the seed knows whose it is */
  G.seeds.push(s);
  return s;
}

function clampPlayer(P, room) {
  const r = P.r;
  const open = (k) => !!room.doors[k] && !room.locked && !room.doors[k].sealed;
  const alignedX = Math.abs(P.x - RW / 2) <= DOOR_HW - r + 3;
  const alignedY = Math.abs(P.y - RH / 2) <= DOOR_HW - r + 3;
  const minY = open('n') && alignedX ? -WALL - 20 : r;
  const maxY = open('s') && alignedX ? RH + WALL + 20 : RH - r;
  const minX = open('w') && alignedY ? -WALL - 20 : r;
  const maxX = open('e') && alignedY ? RW + WALL + 20 : RW - r;
  P.y = clamp(P.y, minY, maxY); P.x = clamp(P.x, minX, maxX);
  if (P.y < r || P.y > RH - r) P.x = clamp(P.x, RW / 2 - DOOR_HW + r, RW / 2 + DOOR_HW - r);
  if (P.x < r || P.x > RW - r) P.y = clamp(P.y, RH / 2 - DOOR_HW + r, RH / 2 + DOOR_HW - r);
}

// Touch aim assist: bend the shot toward a snake close to where the thumb points.
function assistAim(room, P, ax, ay) {
  const base = Math.atan2(ay, ax);
  let best = null, bestDiff = 0.4;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    const dx = sn.x - P.x, dy = sn.y - P.y, d = Math.hypot(dx, dy);
    if (d > 320 || d < 1) continue;
    const a = Math.atan2(dy, dx), diff = Math.abs(angDiff(base, a));
    if (diff < bestDiff) { bestDiff = diff; best = a; }
  }
  if (best === null) return [ax, ay];
  return [Math.cos(best), Math.sin(best)];
}

/* ------------------------------------------------------------------ seeds and venom */
function updateSeeds(dt, room) {
  const seeds = G.seeds;
  for (let i = seeds.length - 1; i >= 0; i--) {
    const s = seeds[i];
    if (s.home) {
      s.ht = (s.ht || 0) - dt;
      if (s.ht <= 0) {
        s.ht = 0.12; s.tgt = null; let bd = 170 * 170;
        for (const sn of room.snakes) { if (!sn.canBeHit() || sn.burrowed || (s.hits && s.hits.has(sn))) continue; const d = dist2(sn.x, sn.y, s.x, s.y); if (d < bd) { bd = d; s.tgt = sn; } }
      }
      if (s.tgt && s.tgt.alive) {
        const sp = Math.hypot(s.vx, s.vy), a = Math.atan2(s.vy, s.vx);
        const na = turnToward(a, Math.atan2(s.tgt.y - s.y, s.tgt.x - s.x), 5 * dt);
        s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp; s.rot = na;
      }
    }
    if (s.loop != null && s.loop < TAU && s.t > 0.06 && !s.back) {
      const w = TAU / 0.34, da = Math.min(w * dt, TAU - s.loop), sp = Math.hypot(s.vx, s.vy), na = Math.atan2(s.vy, s.vx) + da;
      s.loop += da; s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp; s.rot = na;
      if (s.loop >= TAU) s.looped = true;
    }
    if (s.wig != null && !s.back) {
      const sp = Math.hypot(s.vx, s.vy), nw = Math.sin(s.t * 16) * 0.5, na = Math.atan2(s.vy, s.vx) - s.wig + nw;
      s.wig = nw; s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp; s.rot = na;
    }
    if (s.clr > 0) { s.clr -= dt; if (s.clr <= 0) s.hits = null; }
    if (s.back) {
      const P = G.player, sp = Math.hypot(s.vx, s.vy), na = turnToward(Math.atan2(s.vy, s.vx), Math.atan2(P.y - s.y, P.x - s.x), 9 * dt);
      s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp; s.rot = na;
      if (dist2(s.x, s.y, P.x, P.y) < (P.r + 4) * (P.r + 4)) { seeds.splice(i, 1); continue; }
    }
    s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
    let hit = null;
    const sr = 4 * (s.size || 1);
    if (s.t >= s.life && s.boom && !s.back && !s.child) { s.back = true; s.t = 0; s.life = 1.3; s.hits = null; s.vx = -s.vx; s.vy = -s.vy; }
    if (s.t >= s.life) hit = 'drop';
    else if (s.x < 2 || s.y < 2 || s.x > RW - 2 || s.y > RH - 2) {
      if (room.secretLink) hitSecretWall(room, s.x, s.y);
      if (room.hellLink) hitHellWall9(room, s.x, s.y);
      if (s.bounce > 0) {
        s.bounce--;
        if (s.x < 2 || s.x > RW - 2) s.vx = -s.vx; else s.vy = -s.vy;
        s.x = clamp(s.x, 3, RW - 3); s.y = clamp(s.y, 3, RH - 3); s.rot = Math.atan2(s.vy, s.vx); s.t = Math.min(s.t, s.life * 0.4);
        Sfx.splat();
      } else hit = 'wall';
    } else {
      const o = room.tileAt(s.x, s.y);
      if (o && o.shots && !(s.schengen33 && o.type !== 'wall')) {
        const ins = tileInset(o) + 2, lx = s.x - o.c * T, ly = s.y - o.r * T;
        if (lx > ins && lx < T - ins && ly > ins && ly < T - ins) {
          if (s.pick && (o.type === 'rock' || o.breakable)) {
            if (o.type === 'rock') { room.removeObstacle(o); room.dirty = true; o.broken = true; burst(o.x, o.y, 12, room.theme === 'craft' ? '#2b2140' : G.levelDef.rock, { kind: 'shard', min: 40, max: 150, rmin: 1.4, rmax: 3.2, lmin: 0.3, lmax: 0.7, drag: 4 }); Sfx.breakUrn(); }
            else breakObstacle(room, o);
          } else if (o.breakable) hitObstacle(room, o);
          if (s.bounce > 0 && !o.broken && room.tiles[o.r][o.c] === o) {
            s.bounce--;
            const dx = s.x - o.x, dy = s.y - o.y;
            if (Math.abs(dx) > Math.abs(dy)) { s.vx = Math.sign(dx || 1) * Math.abs(s.vx); s.x = o.x + Math.sign(dx || 1) * (T / 2 - ins + 1); }
            else { s.vy = Math.sign(dy || 1) * Math.abs(s.vy); s.y = o.y + Math.sign(dy || 1) * (T / 2 - ins + 1); }
            s.rot = Math.atan2(s.vy, s.vx); s.t = Math.min(s.t, s.life * 0.4);
          } else hit = 'obs';
        }
      }
    }
    if (!hit && room.rots.length) {
      for (const r of room.rots) {
        if (dist2(s.x, s.y, r.x, r.y) < (9 + sr) * (9 + sr)) { hitRot(room, r); hit = 'obs'; break; }
      }
    }
    if (!hit && room.spores.length && seedHitsSpore(room, s, sr)) hit = 'obs';
    if (!hit && room.skins.length && seedHitsSkin(room, s, sr)) hit = 'obs';
    if (!hit && room.balls.length && seedHitsBall(room, s, sr)) hit = 'ball';
    if (!hit && room.carts.length && seedHitsCart(room, s, sr)) hit = 'obs';
    if (!hit) {
      for (const sn of room.snakes) {
        if (!sn.canBeHit()) continue;
        if (s.hits && s.hits.has(sn)) continue;
        if (sn.hitTest(s.x, s.y, sr)) {
          let dmg = s.dmg;
          if (s.sniper && !s.back) dmg *= 1 + clamp(s.t / s.life, 0, 1) * 1.2;
          if (s.looped) dmg *= 1.5;
          if (sn.kind === 'fuel' && Math.random() < 0.07) lightFuse(sn);
          SEED10.s = s; sn.hurt(dmg, s.x, s.y); SEED10.s = null;
          if (s.cy) { sn.poison = 2.1; }
          if (s.frost) sn.slow = 1.6;
          if (s.ember) sn.burn = 2.4;
          if (s.tag) sn.tagT = 6;
          if (s.gavel) sn.stagger = Math.max(sn.stagger, 0.3);
          hit9(room, s, sn, dmg);
          if (s.crit) { burst(s.x, s.y, 8, '#ffd84a', { min: 40, max: 130, lmin: 0.25, lmax: 0.5, glow: true }); floatText(s.x, s.y - 10, 'CRIT', '#ffd84a'); }
          if (s.zap) zapChain(room, s, sn, dmg * 0.5);
          if (s.split && !s.child) splitSeed(s, sn);
          if (sn.kind === 'grub') sn.stagger = 0.16;
          if (s.pierce) { if (!s.hits) s.hits = new Set(); s.hits.add(sn); if (s.hits.size >= (s.cannon ? 99 : 4)) hit = 'snake'; }
          else if (s.boom && !s.back && !s.child) { s.hits = new Set([sn]); s.clr = 0.3; s.back = true; s.t = 0; s.life = 1.3; s.vx = -s.vx; s.vy = -s.vy; }
          else if (s.vinyl && !s.skipped && vinylSkip9(room, s, sn)) { /* on to the next one */ }
          else hit = 'snake';
          break;
        }
      }
    }
    if (hit) {
      if (s.olie) oliebolBurst9(room, s);
      if (s.can) explode(room, s.x, s.y, 40, { hurtPlayer: false, snakeDmg: G.player.dmg * 1.6 + 1 });
      if (s.fizzy && hit !== 'drop') fizzBurst(room, s);
      if (hit !== 'snake') { burst(s.x, s.y, hit === 'drop' ? 3 : 5, s.cy ? '#3d6a2c' : '#4a2c18', { min: 20, max: 70, rmin: 0.8, rmax: 1.8, lmin: 0.2, lmax: 0.4 }); if (hit !== 'drop') Sfx.splat(); }
      seeds.splice(i, 1);
    }
  }
}

function spawnVenom(x, y, ang, speed, col) {
  const v = { x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r: 6, t: 0, life: 3.4, col: col || '#d8c454', ph: rnd(10), kind: null };
  G.venom.push(v);
  return v;
}
function updateVenom(dt, room) {
  const P = G.player;
  for (let i = G.venom.length - 1; i >= 0; i--) {
    const v = G.venom[i];
    // a bite can clear the list under our feet (a veto, a boss dying in an explosion)
    if (!v) continue;
    v.t += dt; v.x += v.vx * dt; v.y += v.vy * dt;
    if (P.stok && !v.slowed && !v.friendly) lookout9(v, P);
    if (v.spin != null) v.spin += dt * (v.kind === 'tag' ? 14 : 6);
    if (v.kind === 'tag' && steerVenom(v, dt)) { G.venom.splice(i, 1); continue; }
    let dead = v.t > v.life;
    if (!dead && (v.x < 0 || v.y < 0 || v.x > RW || v.y > RH)) dead = true;
    if (!dead) { const o = room.tileAt(v.x, v.y); if (o && o.shots) dead = true; }
    if (!dead && P.halo) for (const o of P.halo.orbs) if (o.x != null && dist2(v.x, v.y, o.x, o.y) < 10 * 10) { dead = true; break; }
    if (!dead && room.carts.length) for (const k of room.carts) if (dist2(v.x, v.y, k.x, k.y) < (k.r + 2) * (k.r + 2)) { dead = true; break; }
    if (!dead && room.skins.length) for (const k of room.skins) if (skinCovers(k, v.x, v.y, v.r)) { dead = true; k.ripple = 0.4; break; }
    if (!dead && P.coalitie) for (const w of P.coalitie) if (w.x != null && dist2(v.x, v.y, w.x, w.y) < 12 * 12) { dead = true; break; }
    if (!dead && P.worm && dist2(v.x, v.y, P.worm.x, P.worm.y) < 13 * 13) {
      dead = true; burst(v.x, v.y, 6, '#f095a5', { min: 20, max: 70, lmin: 0.2, lmax: 0.4 });
    }
    if (!dead && v.friendly) dead = venomFriendly9(v, room);
    else if (!dead && P.dying <= 0 && dist2(v.x, v.y, P.x, P.y) < (v.r + P.r - 3) * (v.r + P.r - 3)) { const r9 = venomHit9(v, P); if (r9 === 1) dead = true; else if (r9 === 0 && P.hurt(1, v.x, v.y)) dead = true; }
    if (dead) {
      burst(v.x, v.y, 6, v.col, { min: 20, max: 80, rmin: 1, rmax: 2.2, lmin: 0.2, lmax: 0.45, glow: true });
      if (v.x > 0 && v.y > 0 && v.x < RW && v.y < RH) addDecal(room, 'venom', v.x, v.y, 5, v.col);
      const j = G.venom.indexOf(v);
      if (j >= 0) G.venom.splice(j, 1);
    }
  }
}

/* ------------------------------------------------------------------ obstacles and pickups */
function zapChain(room, s, from, dmg) {
  let best = null, bd = 125 * 125;
  for (const o of room.snakes) {
    if (o === from || !o.canBeHit() || o.burrowed) continue;
    const d = dist2(o.x, o.y, s.x, s.y); if (d < bd) { bd = d; best = o; }
  }
  if (!best) return;
  best.hurt(dmg, best.x, best.y);
  addP({ kind: 'zap', x: s.x, y: s.y, x2: best.x, y2: best.y, vx: 0, vy: 0, r: 1, life: 0.22, col: '#9fd8ff', glow: true, drag: 0, seed: Math.random() * 100 });
  flashLight(best.x, best.y, 40, 0.5, 0.2);
  Sfx.zap();
}
function splitSeed(s, sn) {
  const base = Math.atan2(s.vy, s.vx), sp = Math.hypot(s.vx, s.vy) * 0.75;
  for (const da of [-0.55, 0, 0.55]) {
    const a = base + da;
    G.seeds.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.34, t: 0, dmg: s.dmg * 0.5, cy: s.cy, rot: a,
      size: (s.size || 1) * 0.6, pierce: false, bounce: 0, hits: new Set([sn]), child: true, frost: s.frost });
  }
}
function fizzBurst(room, s) {
  const R = 38;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || (s.hits && s.hits.has(sn))) continue;
    if (sn.hitTest(s.x, s.y, R)) sn.hurt(s.dmg * 0.5, s.x, s.y);
  }
  addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: 4, life: 0.3, col: '#ffe2a4', drag: 0 });
  burst(s.x, s.y, 7, '#ffe2a4', { kind: 'bubble', min: 30, max: 90, rmin: 1, rmax: 2.4, lmin: 0.3, lmax: 0.5 });
  flashLight(s.x, s.y, 40, 0.4, 0.25);
}
function hitRot(room, r) {
  r.hp -= 1; r.shake = 0.3;
  Sfx.splat();
  if (r.hp <= 0) {
    room.rots.splice(room.rots.indexOf(r), 1);
    Sfx.squelch();
    burst(r.x, r.y, 12, '#5d4a1c', { kind: 'chunk', min: 40, max: 130, lmin: 0.3, lmax: 0.6 });
    burst(r.x, r.y, 8, '#8a8a2a', { min: 30, max: 100, lmin: 0.3, lmax: 0.6 });
    addDecal(room, 'splat', r.x, r.y, 9, '#4a3c16');
  }
}
function secretSpot(k) {
  return { n: [RW / 2, 0], s: [RW / 2, RH], w: [0, RH / 2], e: [RW, RH / 2] }[k];
}
function hitSecretWall(room, x, y) {
  const L = room.secretLink, [sx, sy] = secretSpot(L.k);
  if (Math.abs(x - sx) > DOOR_HW + 10 || Math.abs(y - sy) > DOOR_HW + 10) return;
  L.hp -= 1; room.dirty = true;
  G.shake = Math.max(G.shake, 2);
  burst(sx, sy, 6, G.levelDef.wallHi, { kind: 'shard', min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
  Sfx.thud();
  if (L.hp <= 0) {
    room.doors[L.k] = L.room; room.secretLink = null; room.dirty = true; room.ver++;
    G.shake = Math.max(G.shake, 7);
    burst(sx, sy, 24, G.levelDef.wallHi, { kind: 'shard', min: 50, max: 180, rmin: 1.5, rmax: 3.5, lmin: 0.4, lmax: 0.9 });
    flashLight(sx, sy, 90, 0.6, 0.8);
    Sfx.breakUrn(); Sfx.doorOpen();
    UI.banner('A hidden way', 'Something smells rotten in there.');
    Meta.add('secrets');
  }
}
function hitObstacle(room, o) {
  o.hp -= 1; o.shake = 0.3; o.wob = 0.6;
  if (o.hp <= 0) breakObstacle(room, o);
}
function breakObstacle(room, o) {
  if (o.type === 'block') { crumbleBlock(room, o); Sfx.breakUrn(); return; }
  room.removeObstacle(o); o.broken = true;
  const L = G.levelDef;
  if (o.type === 'urn' && L.urnStyle === 'papers') {
    Sfx.paper(); Sfx.breakEgg();
    for (let i = 0; i < 9; i++) addP({ kind: 'paper', x: o.x + rnd(-6, 6), y: o.y + rnd(-6, 6), vx: rnd(-90, 90), vy: rnd(-110, 40), r: rnd(3, 5), life: rnd(0.8, 1.4), col: '#f2f0ea', drag: 2, rot: rnd(TAU), vr: rnd(-8, 8) });
    addDecal(room, 'papers', o.x, o.y, 12, '#e8e2d0');
  } else if (o.type === 'gold') {
    Sfx.coin(); Sfx.breakUrn();
    burst(o.x, o.y, 14, '#f2c230', { kind: 'shard', min: 40, max: 150, rmin: 1.4, rmax: 3, lmin: 0.35, lmax: 0.7, glow: true });
    dropCoins(room, o.x, o.y, 2);
    return;
  } else if (o.type === 'urn') {
    Sfx.breakUrn();
    burst(o.x, o.y, 12, L.clay, { kind: 'shard', min: 40, max: 150, rmin: 1.6, rmax: 3.4, lmin: 0.35, lmax: 0.7, drag: 4 });
    addDecal(room, 'shards', o.x, o.y, 10, L.clay);
  } else {
    Sfx.breakEgg();
    burst(o.x, o.y, 10, '#e8dcc6', { kind: 'shard', min: 40, max: 130, rmin: 1.4, rmax: 3, lmin: 0.35, lmax: 0.7 });
    burst(o.x, o.y, 6, '#e3c45a', { min: 20, max: 80, lmin: 0.3, lmax: 0.6 });
    addDecal(room, 'shell', o.x, o.y, 10, '#d8cba8');
  }
  if (o.item) { spawnItem(room, o.x, o.y); return; }
  if (o.key) { dropKey(room, o.x, o.y); return; }
  if (o.rotten) { releaseSpore(room, o.x, o.y); return; }
  const r = Math.random(), hk = G.D ? G.D.hearts : 1;
  if (o.type === 'urn') { if (r < 0.3 * hk) dropHeart(room, o.x, o.y, 1); else if (r < 0.38 * hk) dropHeart(room, o.x, o.y, 2); else if (r > 0.86) dropCoins(room, o.x, o.y, 1); }
  else if (r < 0.36) hatchGrub(room, o.x, o.y);
  else if (r < 0.36 + 0.22 * hk) dropHeart(room, o.x, o.y, 1);
}
function dropHeart(room, x, y, amount, again) {
  const a = rnd(TAU);
  room.pickups.push({ kind: 'heart', amount, x, y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, t: 0, ph: rnd(10) });
  // 81 Weken: snakes drop twice the slices
  if (!again && G.player && G.player.flags && G.player.flags.weken && G.state === 'play') dropHeart(room, x, y, amount, true);
}
// the pool is weighted: the strongest damage and healing powerups show up less often
function weightedPick(ids) {
  let tot = 0;
  for (const id of ids) tot += ITEMS[id].w || 1;
  let x = Math.random() * tot;
  for (const id of ids) { x -= ITEMS[id].w || 1; if (x <= 0) return id; }
  return ids[ids.length - 1];
}
function nextItemId(legend = 0.05) {
  const P = G.player;
  if (P && P.flags && P.flags.blight) legend = Math.min(1, legend * 2);
  const free = ITEM_IDS.filter((id) => !P.items.includes(id) && !G.run.pending.has(id) && itemOk9(id, P));
  const rare = free.filter((id) => ITEMS[id].rare), norm = free.filter((id) => !ITEMS[id].rare);
  if (rare.length && (Math.random() < legend || !norm.length)) return weightedPick(rare);
  return norm.length ? weightedPick(norm) : 'golden';
}
function spawnItem(room, x, y, legend) {
  const id = nextItemId(legend);
  if (id !== 'golden') G.run.pending.add(id);
  room.pickups.push({ kind: 'item', id, x, y, t: 0 });
  flashLight(x, y, 110, 0.9, 0.9);
  burst(x, y, 14, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true });
}
function hatchGrub(room, x, y) {
  const sn = new Snake('grub', x, y, { emerge: false, spawnTime: 0.35, locks: !room.cleared });
  room.snakes.push(sn);
  Sfx.hiss(0.8);
  burst(x, y, 8, '#e3c45a', { min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
}
function collectItem(id) {
  const P = G.player;
  G.run.pending.delete(id);
  if (id !== 'golden' && P.items.includes(id)) id = 'golden';
  const it = ITEMS[id];
  it.apply(P);
  if (id !== 'golden') P.items.push(id);
  Meta.add('items');
  if (id !== 'golden') Meta.mark('found', id);
  Meta.max('mostItems', P.items.length);
  collect9(id, P);
  if (it.rare) {
    Meta.add('legend'); Sfx.legend(); UI.banner(it.name, it.desc, 'legend');
    for (const col of ['#ffb43a', '#d27bff']) burst(P.x, P.y, 16, col, { min: 50, max: 180, lmin: 0.5, lmax: 1, glow: true });
    G.shake = Math.max(G.shake, 4);
  } else { Sfx.item(); UI.banner(it.name, it.desc); }
  setTimeout(() => Story.chat('item'), 1800);
  burst(P.x, P.y, 18, '#ffd27a', { min: 40, max: 140, lmin: 0.4, lmax: 0.9, glow: true });
  flashLight(P.x, P.y, 140, 0.8, 0.8);
}
function updatePickups(dt, room) {
  const P = G.player;
  for (let i = room.pickups.length - 1; i >= 0; i--) {
    const p = room.pickups[i];
    p.t += dt;
    if (p.kind === 'coin') {
      p.vx = approach(p.vx, 0, 220 * dt); p.vy = approach(p.vy, 0, 220 * dt);
      const d = dist(p.x, p.y, P.x, P.y);
      // once a coin feels the apple it flies straight to it, over rocks and all
      const pull = p.t > 0.35 && P.dying <= 0 && (d < (P.mandje ? 150 : 80) || P.magnet || (room.cleared && p.t > 6));
      if (pull) { const k = P.magnet ? 270 : 210; p.vx = ((P.x - p.x) / (d || 1)) * k; p.vy = ((P.y - p.y) / (d || 1)) * k; }
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (!pull) [nx, ny] = resolveTiles(room, nx, ny, 5);
      p.x = clamp(nx, 6, RW - 6); p.y = clamp(ny, 6, RH - 6);
      if (p.t > 0.25 && P.dying <= 0 && d < P.r + 8) {
        G.run.coins++; G.run.coinsGot = (G.run.coinsGot || 0) + 1;
        Meta.add('coins'); Sfx.coin();
        burst(p.x, p.y, 5, '#ffd84a', { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
        room.pickups.splice(i, 1);
      }
      continue;
    }
    if (p.kind === 'key' || p.kind === 'cleanse' || p.kind === 'reroll') { updateRotPickup(p, i, dt, room, P); continue; }
    if (p.kind === 'bitterbal') { updateBitterbal9(p, i, dt, room, P); continue; }
    if (p.kind === 'heart' && p.cost) {
      if (P.dying <= 0 && dist2(p.x, p.y, P.x, P.y) < (P.r + 10) * (P.r + 10)) {
        const cost = priceOf(p);
        if (P.hp >= P.maxHp) { if (!p.deny) { p.deny = 2.5; UI.banner('You are full', 'Come back when something has bitten you.'); } }
        else if (curateleBlock9(p)) { /* your parents hold the money */ }
        else if (G.run.coins < cost) { if (!p.deny) { p.deny = 2.5; UI.banner('Not enough coins', `This costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); } }
        else {
          G.run.coins -= cost; Meta.add('spent', cost); Sfx.register();
          P.heal(p.amount * (P.juice ? 2 : 1)); room.pickups.splice(i, 1);
          burst(p.x, p.y, 8, '#ff6a6a', { min: 20, max: 70, lmin: 0.3, lmax: 0.5 });
          continue;
        }
      }
      p.deny = Math.max(0, (p.deny || 0) - dt);
      continue;
    }
    if (p.kind === 'heart') {
      p.vx = approach(p.vx, 0, 260 * dt); p.vy = approach(p.vy, 0, 260 * dt);
      if (P.magnet && p.t > 0.4 && P.hp < P.maxHp && P.dying <= 0) {
        const dx = P.x - p.x, dy = P.y - p.y, d = Math.hypot(dx, dy) || 1;
        p.vx = (dx / d) * 230; p.vy = (dy / d) * 230;
      }
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      [nx, ny] = resolveTiles(room, nx, ny, 7);
      p.x = clamp(nx, 8, RW - 8); p.y = clamp(ny, 8, RH - 8);
      // a slice that settled somewhere the apple cannot get to rolls back out
      if (p.ver !== room.ver && Math.abs(p.vx) + Math.abs(p.vy) < 4 && p.t > 0.5) {
        p.ver = room.ver;
        const c = clamp(Math.floor(p.x / T), 0, COLS - 1), r = clamp(Math.floor(p.y / T), 0, ROWS - 1);
        const dm = room.distMap(P.x, P.y);
        if (room.solid(c, r) || dm[r * COLS + c] < 0) { const f = nearestFreeCell(room, p.x, p.y, (cc, rr) => dm[rr * COLS + cc] < 0); p.x = f.x; p.y = f.y; }
      }
      if (p.t > 0.3 && P.dying <= 0 && P.hp < P.maxHp && dist2(p.x, p.y, P.x, P.y) < (P.r + 9) * (P.r + 9) && heartOk9(p, P, room)) {
        P.heal(p.amount * (P.juice ? 2 : 1)); Sfx.pickup();
        burst(p.x, p.y, 8, '#ff6a6a', { min: 20, max: 70, lmin: 0.3, lmax: 0.5 });
        room.pickups.splice(i, 1);
        if (P.gratis && !p.free) {
          const a = rnd(TAU);
          room.pickups.push({ kind: 'heart', amount: p.amount, x: p.x, y: p.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, t: 0, ph: rnd(10), free: true });
          floatText(p.x, p.y - 16, '1+1 GRATIS', '#ffd27a');
        }
      }
    } else if (p.kind === 'item') {
      p.deny = Math.max(0, (p.deny || 0) - dt);
      if (p.t > 0.7 && P.dying <= 0 && dist2(p.x, p.y - 10, P.x, P.y) < (P.r + 14) * (P.r + 14)) {
        if (clashHold10(p, P, room, dt)) continue;
        if (p.boss14 && bossLootHeld14(p, P)) continue;          /* B3: one boss powerup per apple */
        if (p.cost) {
          if (curateleBlock9(p)) continue;
          const cost = priceOf(p);
          if (G.run.coins < cost) {
            if (!p.deny) { p.deny = 3; UI.banner('Not enough coins', `This costs ${cost}. You have ${G.run.coins}.`); Sfx.thud(); }
            continue;
          }
          G.run.coins -= cost; Meta.add('spent', cost); Sfx.register();
          G.run.bought = (G.run.bought || 0) + 1;
          floatText(p.x, p.y - 30, `-${cost}`, '#ffd84a');
        }
        const grp = p.vote || p.grp;
        if (grp) {
          for (let j = room.pickups.length - 1; j >= 0; j--) {
            const q = room.pickups[j];
            if (q === p || (q.vote || q.grp) !== grp) continue;
            G.run.pending.delete(q.id);
            if (p.vote) {
              burst(q.x, q.y - 10, 14, '#e8e2d0', { kind: 'shard', min: 30, max: 110, lmin: 0.4, lmax: 0.8 });
              floatText(q.x, q.y - 30, 'VERWORPEN', '#c3243a');
            } else {
              burst(q.x, q.y - 10, 16, p.book ? '#b05aff' : '#ffd27a', { min: 30, max: 120, lmin: 0.4, lmax: 0.9, glow: true });
              if (p.book) addFire(room, q.x, q.y, 14, 1.4, false);
            }
            room.pickups.splice(j, 1);
            if (j < i) i--;
          }
          if (p.vote) { floatText(p.x, p.y - 34, 'AANGENOMEN', '#9be37a', true); Meta.add('votes'); Sfx.gavel(); }
        }
        if (p.price) {
          if (P.maxHp - p.price < 2) {
            if (!p.deny) { p.deny = 3; UI.banner('Not enough apples', 'You need more than one apple of health to pay.'); Sfx.thud(); }
            continue;
          }
          P.maxHp -= p.price; P.hp = Math.min(P.hp, P.maxHp);
          P.bites.length = Math.min(P.bites.length, Math.max(0, P.maxHp - P.hp));
          Sfx.crunch(); G.shake = Math.max(G.shake, 5); G.hurtFlash = 0.25;
          burst(P.x, P.y, 14, '#c3243a', { min: 40, max: 140, lmin: 0.4, lmax: 0.8 });
          Meta.add('offerings');
        }
        if (p.curseCost && room.type === 'offering') Meta.add('offerings');
        collectItem(p.id); room.pickups.splice(i, 1);
        afterTake10(p);
        if (p.curseCost) giveCurse(p.curseCost);
      } else if (Math.random() < dt * 4) {
        addP({ kind: 'dot', x: p.x + rnd(-10, 10), y: p.y - 6 + rnd(-8, 8), vx: 0, vy: rnd(-20, -8), r: rnd(0.8, 1.6), life: rnd(0.6, 1), col: '#ffd27a', glow: true, drag: 0.5 });
      }
    }
  }
}

function updateParticles(dt) {
  const ps = G.particles;
  let w = 0;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    p.t += dt;
    if (p.t >= p.life) { if (p.own14) PART14.count.set(p.own14, Math.max(0, (PART14.count.get(p.own14) || 1) - 1)); recycleP(p); continue; }
    const dr = Math.max(0, 1 - p.drag * dt);
    p.vx *= dr; p.vy *= dr; p.vy += (p.g || 0) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vr) p.rot += p.vr * dt * (1 - p.t / p.life);
    ps[w++] = p;
  }
  ps.length = w;
  for (let i = G.flashes.length - 1; i >= 0; i--) { const f = G.flashes[i]; f.t += dt; if (f.t >= f.life) G.flashes.splice(i, 1); }
}

function severPiece(sn, p, big) {
  addP({
    kind: 'sev', x: p.x, y: p.y, vx: rnd(-50, 50) * (big ? 1.6 : 1), vy: rnd(-50, 50) * (big ? 1.6 : 1),
    r: p.r, life: big ? rnd(0.9, 1.5) : 1.3, drag: 4, col: sn.K.body, col2: sn.K.outline, ph: rnd(10),
  });
  burst(p.x, p.y, big ? 2 : 4, sn.K.blood, { min: 30, max: 100, rmin: 1.2, rmax: 2.6, lmin: 0.3, lmax: 0.6 });
  if (!big || Math.random() < 0.35) addDecal(G.room, 'splat', p.x, p.y, p.r * 0.8, sn.K.blood);
}

