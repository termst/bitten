/* src/23-v9-bosses.js: v9 bosses: DJ Manu-Beau, Lijn 34, De Tellie, De Kantonrechter. From v9. Lines 13430 to 13949 of the v13.7 script. */
/* =====================================================================
   Version 9 bosses: DJ Manu-Beau (and the devil he becomes after dark),
   Lijn 34, De Tellie and De Kantonrechter. The DJ fights to the remix:
   every attack lands on the beat of the song.
   ===================================================================== */
const CUSTOM_BOSS9 = { manu: 1, manudevil: 1, bus: 1, tellie: 1, rechter: 1 };
const DJ_KINDS = { manu: 1, manudevil: 1 };

function hide9(sn) { sn.burrowed = true; sn.under.push([sn.odo, 1e12]); }
function show9(sn) { sn.burrowed = false; const iv = sn.under[sn.under.length - 1]; if (iv && iv[1] > 1e11) iv[1] = sn.odo; }
function beatPulse9() {
  if (DJ.on) return DJ.pulse;
  const ph = (G.t * BittenRemix.BPM / 60) % 1;
  return Math.max(0, 1 - ph * 4);
}

/* ------------------------------------------------------------------ the song clock */
const DJ = {
  on: false, devil: false, boss: null, buf: null, prep: null, src: null, out: null, nodes: [],
  rate: 1, t0: 0, off0: 0, pos: 0, step: -1, sec: 'build', bar: 0, beatInBar: 0, pulse: 0, barPulse: 0, secT: 0,
  BAR: BittenRemix.BAR, LEAD: 0.05,
  get START() { return this.LEAD + 12 * this.BAR; },
  get LOOP0() { return this.LEAD + 16 * this.BAR; },
  get LOOP1() { return this.LEAD + 56 * this.BAR; },
  // render the song while the floor loads, so it is ready when the DJ is
  prepare() {
    Sfx.init();
    if (!Sfx.ctx || this.prep || this.buf) return;
    try {
      this.prep = BittenRemix.render(Sfx.ctx.sampleRate).then((b) => { this.buf = b; }).catch(() => { this.prep = null; });
    } catch (e) { this.prep = null; }
  },
  start(devil, boss) {
    this.stop(0, true);
    this.on = true; this.devil = !!devil; this.boss = boss; this.rate = devil ? 1.12 : 1;
    this.pos = this.START; this.step = Math.floor((this.pos - this.LEAD) / (this.BAR / 16)) - 1;
    this.sec = 'build'; this.secT = 0; this.pulse = 0; this.barPulse = 0;
    Sfx.stopDrone();
    this.prepare();
    this.play();
  },
  play() {
    const c = Sfx.ctx;
    if (!c || !this.buf || this.src || !this.on) return;
    try {
      const src = c.createBufferSource(); src.buffer = this.buf;
      src.loop = true; src.loopStart = this.LOOP0; src.loopEnd = this.LOOP1; src.playbackRate.value = this.rate;
      const out = c.createGain(); out.gain.value = 0.0001;
      let node = src;
      const nodes = [src, out];
      if (this.devil) {
        // the devil's mix: overdriven and a little hotter
        const sh = c.createWaveShaper(), n = 1024, curve = new Float32Array(n);
        for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * 2.6) / Math.tanh(2.6); }
        sh.curve = curve; sh.oversample = '2x';
        const lp = c.createBiquadFilter(); lp.type = 'lowshelf'; lp.frequency.value = 140; lp.gain.value = 5;
        node.connect(sh); sh.connect(lp); node = lp; nodes.push(sh, lp);
      }
      node.connect(out); out.connect(Sfx.master);
      const t = c.currentTime + 0.03;
      out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(this.devil ? 0.62 : 0.55, t + 0.5);
      src.start(t, this.pos);
      this.src = src; this.out = out; this.nodes = nodes; this.t0 = t; this.off0 = this.pos;
    } catch (e) { this.src = null; }
  },
  wrap(p) { return p >= this.LOOP1 ? this.LOOP0 + ((p - this.LOOP0) % (this.LOOP1 - this.LOOP0)) : p; },
  update(dt) {
    if (!this.on) return;
    if (!this.src && this.buf) this.play();
    const c = Sfx.ctx;
    if (this.src && c) this.pos = this.wrap(this.off0 + Math.max(0, c.currentTime - this.t0) * this.rate);
    else this.pos = this.wrap(this.pos + dt * this.rate);
    this.pulse = Math.max(0, this.pulse - dt * 4.5);
    this.barPulse = Math.max(0, this.barPulse - dt * 1.6);
    this.secT += dt;
    const STEP = this.BAR / 16;
    const now = Math.floor((this.pos - this.LEAD) / STEP);
    if (now < this.step - 8) this.step = now - 1; // the loop jumped back
    let guard = 0;
    while (this.step < now && guard++ < 8) {
      this.step++;
      const st = this.step, bar = Math.floor(st / 16), inBar = st % 16;
      if (inBar % 4 !== 0) continue;
      const beat = inBar / 4;
      this.bar = bar; this.beatInBar = beat; this.pulse = 1;
      if (beat === 0) this.barPulse = 1;
      const sec = bar < 8 ? 'intro' : bar < 16 ? 'build' : bar < 32 ? 'drop' : bar < 40 ? 'break' : bar < 56 ? 'drop2' : 'outro';
      const changed = sec !== this.sec;
      if (changed) { this.sec = sec; this.secT = 0; }
      const b = this.boss;
      if (b && b.alive && b.dying <= 0 && b.state === 'active' && G.freeze <= 0 && G.room) djBeat9(b, G.room, bar, beat, changed);
    }
  },
  stop(fade = 1, quiet) {
    const was = this.on;
    this.on = false; this.boss = null;
    const c = Sfx.ctx, src = this.src, out = this.out;
    this.src = null; this.out = null; this.nodes = [];
    if (c && src && out) {
      try {
        const t = c.currentTime;
        out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.05, fade));
        src.stop(t + Math.max(0.05, fade) + 0.05);
      } catch (e) { /* ignore */ }
    }
    if (was && !quiet && G.state === 'play' && G.levelDef) setTimeout(() => { if (!DJ.on && G.state === 'play' && !Sfx.drone) Sfx.startDrone(G.levelDef.set); }, Math.max(100, fade * 1000));
  },
};

/* ------------------------------------------------------------------ starting a custom boss fight */
function startBoss9(room, entry) {
  const kind = G.levelDef.boss;
  if (!CUSTOM_BOSS9[kind]) return false;
  bossFight9(room, kind, entry, null);
  return true;
}
// where: null for the floor's lair, 'club' or 'hell' for a club room
function bossFight9(room, kind, entry, where) {
  const P = G.player, L = G.levelDef;
  room.locked = true; room.doorCl = 0;
  Sfx.doorShut();
  const door = entry || 's';
  const v = DOORV[door] || [0, 1];
  const dj = !!DJ_KINDS[kind];
  if (dj && room.theme !== 'club' && room.theme !== 'hell') {
    room.build(clubTemplate(door), L);
    room.theme = kind === 'manudevil' ? 'hell' : 'club'; room.dirty = true; room.clubDoor = door; room.sconces = []; room.tubes = null;
  }
  let x = RW / 2 - v[0] * RW * 0.28, y = RH / 2 - v[1] * RH * 0.24;
  if (dj) { const b = boothSpot(room.clubDoor || door); x = b.x; y = b.y; }
  else if (kind !== 'bus') { const f = nearestFreeCell(room, x, y); x = f.x; y = f.y; }
  const boss = new Snake(kind, x, y, { ang: Math.atan2(P.y - y, P.x - x), emerge: !dj && kind !== 'bus', door: room.clubDoor || door });
  boss.maxHp = boss.hp = boss.K.hp * bossHpK();
  boss.delay = 0.7 + (P.ov ? 0.5 : 0);
  room.snakes.push(boss);
  G.boss = boss;
  G.run.bossHits0 = G.run.hits || 0;
  const SB = G.mode === 'story' ? curStory().boss[kind] : null;
  const info = SB || BOSS_INFO[kind];
  if (SB) { boss.displayName = SB.name; setTimeout(() => { if (G.boss === boss) Story.chat('boss', true); }, 3400); }
  Sfx.stinger();
  setTimeout(() => { if (G.boss === boss && G.state === 'play') { if (kind === 'bus') Sfx.busHorn(); else if (kind === 'tellie') Sfx.buzz(); else Sfx.roar(); } }, 900);
  UI.card(where === 'hell' ? 'The hellclub' : where === 'club' ? 'The club' : 'The lair', info.title, info.sub, 'boss', 2.8);
  if (kind === 'tellie') room.sockets9 = [{ x: T * 2.5, y: 24 }, { x: RW - T * 2.5, y: RH - 24 }, { x: 24, y: T * 1.5 }, { x: RW - 24, y: RH - T * 1.5 }];
  if (dj) DJ.start(kind === 'manudevil', boss);
  return boss;
}

/* ------------------------------------------------------------------ DJ Manu-Beau */
BOSS9_INIT.manu = (sn, o) => { sn.door = o.door || 's'; sn.mode = 'booth'; sn.booth = boothSpot(sn.door); sn.ravers = 0; };
BOSS9_INIT.manudevil = BOSS9_INIT.manu;
AI.manu = function (sn, room, dt) { djAI9(sn, room, dt, false); };
AI.manudevil = function (sn, room, dt) { djAI9(sn, room, dt, true); };

function djLeap9(sn, to, x, y) {
  sn.mode = 'leap'; sn.mt = 0; sn.leap = { x0: sn.x, y0: sn.y, x1: x, y1: y, to, dur: 0.62 };
  sn.mouth = 1; Sfx.hiss(1);
}
function djAI9(sn, room, dt, devil) {
  const P = G.player;
  sn.mt += dt; sn.wig += dt * 3;
  const sec = DJ.on ? DJ.sec : 'drop';
  const wantBooth = sec === 'intro' || sec === 'build' || sec === 'break';
  const b = sn.booth;
  if (sn.mode === 'leap') {
    const L = sn.leap, u = Math.min(1, sn.mt / L.dur);
    sn.air9 = Math.sin(u * Math.PI);
    sn.moveTo(lerp(L.x0, L.x1, u), lerp(L.y0, L.y1, u));
    sn.ang = Math.atan2(L.y1 - L.y0, L.x1 - L.x0); sn.drawAng = sn.ang;
    if (u >= 1) {
      sn.air9 = 0;
      djShock9(sn, room, devil ? 12 : 8, 0.85);
      if (L.to === 'booth') { sn.mode = 'booth'; sn.mt = 0; } else { sn.mode = 'dance'; sn.mt = 0; }
    }
    return;
  }
  if (sn.mode === 'booth') {
    const span = b.ay ? T * 1.8 : T * 2.1, w = Math.sin(sn.mt * 0.85);
    const tx = b.x + b.ax * w * span, ty = b.y + b.ay * w * span;
    const dx = tx - sn.x, dy = ty - sn.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { const s = Math.min(d, 110 * dt); sn.moveTo(sn.x + (dx / d) * s, sn.y + (dy / d) * s); }
    const face = Math.atan2(RH / 2 - b.y, RW / 2 - b.x);
    sn.ang = face + Math.sin(G.t * 7) * 0.12 * (0.4 + DJ.pulse); sn.drawAng = sn.ang;
    if (!wantBooth && sn.mt > 0.4) {
      const tx2 = clamp(lerp(RW / 2, P.x, 0.5), 60, RW - 60), ty2 = clamp(lerp(RH / 2, P.y, 0.5), 60, RH - 60);
      const f = nearestFreeCell(room, tx2, ty2);
      djLeap9(sn, 'floor', f.x, f.y);
    }
    return;
  }
  if (sn.mode === 'rear') {
    const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
    sn.ang = turnToward(sn.ang, toP, 6 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.08; sn.mouth = 1;
    if (sn.mt > DJ.BAR / (4 * DJ.rate) || sn.goNow) { sn.goNow = false; sn.mode = 'charge'; sn.mt = 0; sn.chargeAng = sn.ang; Sfx.roar(); }
    return;
  }
  if (sn.mode === 'charge') {
    const r = chargeStep(sn, room, dt, devil ? 370 : 310, 0.85);
    if (r) { djShock9(sn, room, devil ? 10 : 6, 0.8); sn.mode = 'dance'; sn.mt = 0; G.shake = Math.max(G.shake, 6); }
    return;
  }
  // dancing on the floor
  sn.mode = 'dance';
  if (wantBooth) { djLeap9(sn, 'booth', b.x, b.y); return; }
  const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
  const sp = (devil ? 92 : 70) * (1 + DJ.pulse * 0.7) * (sn.hp < sn.maxHp * 0.5 ? 1.15 : 1);
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.55, sp, devil ? 3 : 2.5, dt);
  sn.drawAng += Math.sin(G.t * 9) * 0.05 * DJ.pulse;
}
// a ring of notes around him, from a landing or a stomp
function djShock9(sn, room, n, k) {
  const off = rnd(TAU), vs = G.levelDef.venomSpeed * k;
  for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, vs, pick(['#ff7af0', '#7af0ff', '#d8ff7a', '#ffd27a'])); v.kind = 'note'; v.r = 6.5; v.spin = 0; }
  addP({ kind: 'ring', x: sn.x, y: sn.y, vx: 0, vy: 0, r: 18, life: 0.4, col: '#ff7af0', drag: 0, glow: true });
  Sfx.thud();
}
function djFan9(sn, n, spread, k, kind) {
  const P = G.player, base = Math.atan2(P.y - sn.y, P.x - sn.x), vs = G.levelDef.venomSpeed * k;
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * spread;
    const v = spawnVenom(sn.x + Math.cos(a) * sn.headR, sn.y + Math.sin(a) * sn.headR, a, vs, kind === 'vinylv' ? '#2a2a32' : '#ff7af0');
    v.kind = kind; v.r = kind === 'vinylv' ? 7.5 : 6.5; v.spin = 0;
  }
  sn.mouth = 1; Sfx.spit();
}
function djRavers9(sn, room, n, cap) {
  const alive = countKind(room, 'raver');
  const P = G.player;
  for (let i = 0; i < Math.min(n, cap - alive); i++) {
    const cell = Game.farCell(room, P, new Set());
    room.snakes.push(new Snake('raver', cell.x, cell.y, { emerge: false, spawnTime: 0.4, delay: i * 0.12, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
    burst(cell.x, cell.y, 8, '#ff7af0', { min: 30, max: 90, lmin: 0.3, lmax: 0.6, glow: true });
  }
}
function djSpeakers9(room) { return room.obs.filter((o) => o.type === 'speaker'); }
function djBeat9(sn, room, bar, beat, changed) {
  const P = G.player, devil = sn.kind === 'manudevil', ph2 = sn.hp < sn.maxHp * 0.5, ph3 = sn.hp < sn.maxHp * 0.33;
  const sec = DJ.sec;
  if (P.dying > 0) return;
  if (changed && (sec === 'drop' || sec === 'drop2')) {
    floatText(sn.x, sn.y - 40, sec === 'drop' ? 'DROP' : 'DROP II', '#ff7af0', true);
    djShock9(sn, room, devil ? 18 : 12, 0.9);
    G.shake = Math.max(G.shake, devil ? 9 : 6);
    flashLight(RW / 2, RH / 2, 320, 0.7, 0.5);
    if (devil) djLasers9(room, sn, ph3 ? 3 : 2);
  }
  if (changed && sec === 'break') { UI.banner(devil ? 'The devil breathes' : 'Break', devil ? 'It gets very dark. Watch his eyes.' : 'He goes back to the decks. Shoot him there.', devil ? 'curse' : ''); djRavers9(sn, room, devil ? 4 : 2, devil ? 6 : 4); }
  if (sec === 'build') {
    if (beat === 0) djFan9(sn, devil ? 5 : 3, 0.22, 0.7, 'note');
    if (beat === 0 && bar % 2 === 0) djRavers9(sn, room, 1, devil ? 5 : 3);
    return;
  }
  if (sec === 'break') {
    if (bar === 36 && beat === 0) { sn.micDrop = { x: P.x, y: P.y, t: 0, warn: DJ.BAR / (2 * DJ.rate) }; floatText(P.x, P.y - 30, 'MIC DROP', '#ffd27a', true); }
    if (devil && beat === 2 && bar % 2 === 1) djFan9(sn, 5, 0.25, 0.75, 'note');
    return;
  }
  // the drops
  const spk = djSpeakers9(room);
  if (beat === 0) {
    if (sn.mode === 'rear') sn.goNow = true;
    else if (sn.mode === 'dance') djShock9(sn, room, devil ? (ph3 ? 14 : 12) : ph2 ? 10 : 8, 0.78);
  }
  if (beat === 3 && (sec === 'drop2' || devil) && bar % 2 === 1 && sn.mode === 'dance') { sn.mode = 'rear'; sn.mt = 0; Sfx.hiss(1.2); }
  if (beat === 2 && (bar % 2 === 1 || devil || ph2)) djFan9(sn, devil ? 5 : 3, 0.3, devil ? 1 : 0.9, 'vinylv');
  if ((beat === 1 || beat === 3) && spk.length && (devil || ph2 || bar % 2 === 0)) {
    const o = spk[(bar * 2 + (beat === 3 ? 1 : 0)) % spk.length];
    const a = Math.atan2(P.y - o.y, P.x - o.x);
    for (const da of devil ? [-0.18, 0, 0.18] : [0]) { const v = spawnVenom(o.x + Math.cos(a) * 14, o.y + Math.sin(a) * 14, a + da, G.levelDef.venomSpeed * 0.85, '#7af0ff'); v.kind = 'note'; v.r = 6; v.spin = 0; }
    o.pulse9 = 1;
  }
  if (devil && sn.mode === 'dance') addFire(room, sn.x - Math.cos(sn.drawAng) * sn.headR, sn.y - Math.sin(sn.drawAng) * sn.headR, 16, 2.4, true);
  if (devil && changed === false && beat === 0 && bar % 8 === 4 && !room.lasers9) djLasers9(room, sn, ph3 ? 3 : 2);
}
// the devil's light show: beams that sweep the floor
function djLasers9(room, sn, n) {
  const b = sn.booth;
  room.lasers9 = [];
  const base = Math.atan2(RH / 2 - b.y, RW / 2 - b.x);
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * 0.9;
    room.lasers9.push({ x: b.x, y: b.y, a, w: (i % 2 ? 1 : -1) * 0.55, len: 620, t: 0, warn: 0.8, on: DJ.BAR * 2.2, col: i % 2 ? '#3ad8ff' : '#ff3ad8' });
  }
}
function updateDJ9(dt, room) {
  for (const sn of room.snakes) {
    if (!DJ_KINDS[sn.kind] || !sn.micDrop) continue;
    const m = sn.micDrop; m.t += dt;
    if (m.t >= m.warn) {
      sn.micDrop = null;
      const P = G.player;
      if (P.dying <= 0 && dist(P.x, P.y, m.x, m.y) < 52) P.hurt(1, m.x, m.y, sn);
      const off = rnd(TAU);
      for (let i = 0; i < 8; i++) { const v = spawnVenom(m.x, m.y, off + (i / 8) * TAU, G.levelDef.venomSpeed * 0.75, '#ffd27a'); v.kind = 'note'; v.r = 6; v.spin = 0; }
      G.shake = Math.max(G.shake, 7); Sfx.thud(); Sfx.boom(false);
      burst(m.x, m.y, 16, '#ffd27a', { min: 40, max: 150, lmin: 0.3, lmax: 0.7, glow: true });
    }
  }
}

/* ------------------------------------------------------------------ lasers: the devil's, and the rave floor's */
function updateLasers9(dt, room) {
  const P = G.player;
  if (room.mod === 'lasers' && room.locked && !room.cleared) {
    room.laserT = (room.laserT == null ? 2 : room.laserT) - dt;
    if (room.laserT <= 0 && (!room.lasers9 || !room.lasers9.length)) {
      room.laserT = rnd(4.5, 6);
      const corners = shuffle([[6, 6], [RW - 6, 6], [6, RH - 6], [RW - 6, RH - 6]]).slice(0, 2);
      room.lasers9 = corners.map(([x, y], i) => ({ x, y, a: Math.atan2(RH / 2 - y, RW / 2 - x) + rnd(-0.5, 0.5), w: (i ? 1 : -1) * rnd(0.35, 0.55), len: 620, t: 0, warn: 0.75, on: 2.2, col: i ? '#3ad8ff' : '#ff3ad8' }));
    }
  } else if (room.mod === 'lasers' && room.cleared) room.lasers9 = null;
  const L = room.lasers9;
  if (!L || !L.length) return;
  for (let i = L.length - 1; i >= 0; i--) {
    const z = L[i];
    z.t += dt; z.a += z.w * dt;
    if (z.t > z.warn + z.on) { L.splice(i, 1); continue; }
    if (z.t < z.warn || P.dying > 0) continue;
    const ex = z.x + Math.cos(z.a) * z.len, ey = z.y + Math.sin(z.a) * z.len;
    const vx = ex - z.x, vy = ey - z.y, l2 = vx * vx + vy * vy;
    const k = clamp(((P.x - z.x) * vx + (P.y - z.y) * vy) / l2, 0, 1);
    if (dist(P.x, P.y, z.x + vx * k, z.y + vy * k) < P.r - 2) P.hurt(1, z.x + vx * k, z.y + vy * k);
  }
  if (!L.length) room.lasers9 = null;
}

/* ------------------------------------------------------------------ Lijn 34: a bus that is also a worm, and late */
BOSS9_INIT.bus = (sn) => { hide9(sn); sn.holes.length = 0; sn.mode = 'wait'; sn.mt = 0; sn.num = 34; sn.stage = 0; sn.horiz = Math.random() < 0.5; sn.doors = 0; };
AI.bus = function (sn, room, dt) {
  const P = G.player, f = sn.hp / sn.maxHp;
  const stage = f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  if (stage !== sn.stage) {
    sn.stage = stage; sn.num = stage === 1 ? 36 : 31;
    UI.banner(stage === 1 ? 'Bus gaat 36' : '31 pas bus', stage === 1 ? 'Zelfs.' : 'Hoezo duurt zo lang.', 'curse'); Sfx.busHorn();
  }
  const sp = [190, 232, 276][stage];
  sn.mt += dt;
  sn.doors = approach(sn.doors, sn.mode === 'halte' ? 1 : 0, dt * 4);
  if (sn.mode === 'wait') {
    if (!room.busLane9) planLane9(sn, room, P, stage);
    room.busLane9.t += dt;
    if (room.busLane9.t >= room.busLane9.warn) enterLane9(sn, room);
    return;
  }
  const Ln = sn.lane;
  if (sn.mode === 'halte') {
    if (sn.mt > 0.45 && !Ln.spawned) {
      Ln.spawned = true;
      const n = stage === 0 ? 2 : 3;
      if (countKind(room, 'grub') < 6) {
        for (let i = 0; i < n; i++) {
          const p = sn.pts[1 + i] || sn;
          const side = i % 2 ? 1 : -1, nx = -Ln.dy * side, ny = Ln.dx * side;
          const f2 = nearestFreeCell(room, p.x + nx * 40, p.y + ny * 40);
          room.snakes.push(new Snake('grub', f2.x, f2.y, { emerge: false, spawnTime: 0.3, delay: i * 0.15, ang: Math.atan2(P.y - f2.y, P.x - f2.x) }));
        }
        floatText(sn.x, sn.y - 30, 'INSTAPPEN', '#fff2c4', true);
      }
    }
    if (sn.mt > 1.7) { sn.mode = 'drive'; sn.mt = 0; Sfx.busHorn(); }
    return;
  }
  if (sn.mode === 'drive') {
    const mid = Ln.horiz ? (Ln.dx > 0 ? sn.x > RW / 2 + 40 : sn.x < RW / 2 - 40) : (Ln.dy > 0 ? sn.y > RH / 2 + 30 : sn.y < RH / 2 - 30);
    if (Ln.halte && !Ln.stopped && mid) { Ln.stopped = true; sn.mode = 'halte'; sn.mt = 0; Sfx.busHorn(); return; }
    sn.moveTo(sn.x + Ln.dx * sp * dt, sn.y + Ln.dy * sp * dt);
    sn.ang = sn.drawAng = Math.atan2(Ln.dy, Ln.dx);
    if (stage >= 1) {
      sn.exT = (sn.exT || 0) - dt;
      const tl = sn.pts[sn.pts.length - 1];
      if (sn.exT <= 0 && tl && !tl.hid) { sn.exT = 0.42; const v = spawnVenom(tl.x - Ln.dx * 18, tl.y - Ln.dy * 18, Math.atan2(-Ln.dy, -Ln.dx) + rnd(-0.5, 0.5), 30, '#8a8a8a'); v.kind = 'smoke'; v.r = 7; v.life = 1.6; }
    }
    const out = sn.x < -36 || sn.x > RW + 36 || sn.y < -36 || sn.y > RH + 36;
    if (out) { hide9(sn); sn.mode = 'exit'; sn.mt = 0; }
    return;
  }
  if (sn.mode === 'exit') {
    sn.moveTo(sn.x + Ln.dx * sp * dt, sn.y + Ln.dy * sp * dt);
    if (sn.mt * sp > sn.maxLen * sn.spacing + 30) { sn.mode = 'wait'; sn.mt = 0; }
  }
};
function planLane9(sn, room, P, stage) {
  sn.horiz = !sn.horiz;
  const pos = sn.horiz ? clamp(Math.floor(P.y / T), 0, ROWS - 1) : clamp(Math.floor(P.x / T), 0, COLS - 1);
  room.busLane9 = { horiz: sn.horiz, pos, dir: Math.random() < 0.5 ? 1 : -1, t: 0, warn: [1.15, 0.95, 0.8][stage], halte: Math.random() < (stage ? 0.55 : 0.35) };
  Sfx.tone(880, 0.12, { type: 'square', vol: 0.03, lp: 2000 }); Sfx.tone(880, 0.12, { type: 'square', vol: 0.03, lp: 2000, delay: 0.25 });
}
function enterLane9(sn, room) {
  const L = room.busLane9; room.busLane9 = null;
  const c = (L.pos + 0.5) * T;
  const dx = L.horiz ? L.dir : 0, dy = L.horiz ? 0 : L.dir;
  const sx = L.horiz ? (L.dir > 0 ? -34 : RW + 34) : c, sy = L.horiz ? c : (L.dir > 0 ? -34 : RH + 34);
  const back = sn.maxLen * sn.spacing + 60;
  sn.moveTo(sx - dx * back, sy - dy * back);
  for (let i = 1; i <= 16; i++) sn.moveTo(sx - dx * back * (1 - i / 16), sy - dy * back * (1 - i / 16));
  show9(sn);
  sn.lane = { dx, dy, halte: L.halte, stopped: false, horiz: L.horiz, spawned: false };
  sn.mode = 'drive'; sn.mt = 0;
  sn.ang = sn.drawAng = Math.atan2(dy, dx);
  Sfx.busHorn();
}

/* ------------------------------------------------------------------ De Tellie: 8 percent and furious */
const TELLIE_MSGS = ['?', 'Huh', 'Wat zei je', 'Kommop', 'Ben je er', 'Wakker?', 'Broo', 'Hoezo', '8%', 'Dom', 'Tering', 'Wattan'];
BOSS9_INIT.tellie = (sn) => { sn.mode = 'move'; sn.cd = 1.6; sn.plugCd = 7; };
AI.tellie = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5;
  const dx = P.x - sn.x, dy = P.y - sn.y, toP = Math.atan2(dy, dx);
  sn.mt += dt; sn.wig += dt * 3;
  if (sn.plugCd > 0) sn.plugCd -= dt;
  const vs = G.levelDef.venomSpeed;
  const msg = (a, k) => { const v = spawnVenom(sn.x + Math.cos(a) * sn.headR, sn.y + Math.sin(a) * sn.headR, a, vs * k, '#3a8aff'); v.kind = 'msg'; v.r = 7.5; v.txt = pick(TELLIE_MSGS); return v; };
  if (sn.mode === 'buzz') {
    sn.drawAng = sn.ang + Math.sin(sn.mt * 60) * 0.09;
    if (sn.mt > 0.45) {
      const n = ph2 ? 5 : 4;
      for (let i = 0; i < n; i++) msg(toP + (i - (n - 1) / 2) * 0.26, 0.85);
      Sfx.ping(); sn.mode = 'move'; sn.mt = 0; sn.cd = ph2 ? rnd(1.5, 2.1) : rnd(2.1, 2.7);
    }
    return;
  }
  if (sn.mode === 'ring') {
    sn.drawAng = sn.ang + Math.sin(sn.mt * 70) * 0.12; G.shake = Math.max(G.shake, 1.5);
    if (sn.mt > 0.6) { const off = rnd(TAU); for (let i = 0; i < 11; i++) msg(off + (i / 11) * TAU, 0.75); Sfx.buzz(); sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.8, 2.4); }
    return;
  }
  if (sn.mode === 'seek') {
    const s = sn.socket;
    steerMove(sn, room, Math.atan2(s.y - sn.y, s.x - sn.x), sn.K.speed * 1.4, 3.2, dt);
    if (dist(sn.x, sn.y, s.x, s.y) < 22 || sn.mt > 4) { sn.mode = 'plugged'; sn.mt = 0; sn.plugDmg = 0; floatText(sn.x, sn.y - 34, 'OPLADEN', '#7cffb0', true); Sfx.ping(); }
    return;
  }
  if (sn.mode === 'plugged') {
    if (sn.hp < sn.maxHp * 0.7) { sn.hp = Math.min(sn.maxHp * 0.7, sn.hp + sn.maxHp * 0.025 * dt); const nl = sn.lenFor(); if (nl > sn.len) sn.len = nl; }
    if (Math.random() < dt * 6) addP({ kind: 'dot', x: sn.x + rnd(-8, 8), y: sn.y + rnd(-8, 8), vx: 0, vy: rnd(-30, -15), r: rnd(1, 2), life: 0.5, col: '#7cffb0', glow: true, drag: 1 });
    if ((sn.plugDmg || 0) >= 14) { sn.mode = 'move'; sn.mt = 0; sn.stun = 1.6; sn.plugCd = 12; floatText(sn.x, sn.y - 34, 'UITGETROKKEN', '#ff8a7a', true); Sfx.clank(); G.shake = Math.max(G.shake, 5); }
    else if (sn.mt > 6) { sn.mode = 'move'; sn.mt = 0; sn.plugCd = 12; }
    return;
  }
  sn.mode = 'move';
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.5, sn.K.speed * (ph2 ? 1.18 : 1), sn.K.turn, dt);
  sn.cd -= dt;
  if (ph2 && sn.plugCd <= 0 && sn.hp < sn.maxHp * 0.6 && room.sockets9) {
    let best = null, bd = 1e12;
    for (const s of room.sockets9) { const d = dist2(s.x, s.y, sn.x, sn.y); if (d < bd) { bd = d; best = s; } }
    sn.socket = best; sn.mode = 'seek'; sn.mt = 0; floatText(sn.x, sn.y - 34, 'BIJNA LEEG', '#ff8a7a', true);
  } else if (sn.cd <= 0 && P.dying <= 0) { sn.mode = ph2 && Math.random() < 0.4 ? 'ring' : 'buzz'; sn.mt = 0; Sfx.buzz(); }
};
BOSS9_HURT.tellie = (sn, amount) => { if (sn.mode === 'plugged') { amount *= 1.5; sn.plugDmg = (sn.plugDmg || 0) + amount; } return amount; };
function tellieBattery9(sn) { return Math.max(0, Math.ceil((8 * Math.max(0, sn.hp)) / sn.maxHp)); }

/* ------------------------------------------------------------------ De Kantonrechter */
const VERDICTS9 = ['weken', 'curatele', 'laat', 'boete', 'orde'];
BOSS9_INIT.rechter = (sn) => { sn.mode = 'move'; sn.cd = 2.2; sn.verdictCd = 6; sn.lastVerdict = null; };
AI.rechter = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5;
  if (ph2 && !sn.appeal) { sn.appeal = true; UI.banner('Hoger beroep', 'He is not done with you. Faster now.', 'curse'); Sfx.gavel(); }
  sn.mt += dt;
  sn.verdictCd -= dt; sn.cd -= dt;
  if (sn.mode === 'verdict') {
    sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.04; sn.mouth = 1;
    if (sn.mt > 0.8) { verdict9(sn, room); sn.mode = 'move'; sn.mt = 0; }
    return;
  }
  sn.mode = 'move';
  keepAway(sn, room, dt, 130, 240, sn.K.speed * (ph2 ? 1.3 : 1));
  if (sn.cd <= 0 && !sn.slam && P.dying <= 0) {
    sn.slam = { x: P.x, y: P.y, t: 0, warn: ph2 ? 0.72 : 0.9, r: 52 };
    sn.cd = ph2 ? rnd(1.6, 2.1) : rnd(2.4, 3); sn.mouth = 1;
  }
  if (sn.verdictCd <= 0 && P.dying <= 0) { sn.mode = 'verdict'; sn.mt = 0; sn.verdictCd = ph2 ? rnd(6, 7.5) : rnd(8, 9.5); Sfx.gavel(); }
};
function updateJudge9(dt, room) {
  const P = G.player;
  for (const sn of room.snakes) {
    if (sn.kind !== 'rechter' || !sn.slam) continue;
    const s = sn.slam; s.t += dt;
    if (s.t < s.warn) continue;
    sn.slam = null;
    if (!sn.alive || sn.dying > 0) continue;
    if (P.dying <= 0 && dist(P.x, P.y, s.x, s.y) < s.r) P.hurt(1, s.x, s.y, sn);
    const off = rnd(TAU), n = sn.appeal ? 10 : 8;
    for (let i = 0; i < n; i++) { const v = spawnVenom(s.x, s.y, off + (i / n) * TAU, G.levelDef.venomSpeed * 0.7, '#f2f0ea'); v.kind = 'paper'; v.spin = rnd(TAU); }
    floatText(s.x, s.y - 26, 'ORDE', '#f2f0ea', true);
    Sfx.gavel(); G.shake = Math.max(G.shake, 6);
    burst(s.x, s.y, 14, '#d8d2c2', { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.7 });
    addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: 20, life: 0.4, col: '#ffd27a', drag: 0 });
  }
}
function verdict9(sn, room) {
  const P = G.player, vs = G.levelDef.venomSpeed;
  const opts = VERDICTS9.filter((v) => v !== sn.lastVerdict);
  const v = pick(opts); sn.lastVerdict = v;
  if (v === 'weken') {
    UI.banner('81 weken', 'Ik wil jou voor 81 weken niet meer spreken.', 'curse');
    const gaps = new Set([rndi(0, 9), rndi(0, 9)]);
    for (let i = 0; i < 11; i++) { if (gaps.has(i)) continue; const p = spawnVenom((i + 0.5) * (RW / 11), 6, Math.PI / 2 + rnd(-0.06, 0.06), vs * 0.62, '#f2f0ea'); p.kind = 'paper'; p.spin = rnd(TAU); p.life = 4; }
  } else if (v === 'curatele') {
    UI.banner('Onder curatele', 'Your parents hold your seeds. Half damage for 5 seconds.', 'curse');
    P.verdictT = 5;
  } else if (v === 'laat') {
    UI.banner('Te laat', 'Is te laat om terug te krabbelen nu.', 'curse');
    if (countKind(room, 'bril') < 3) for (let i = 0; i < 2; i++) { const c = Game.farCell(room, P, new Set()); room.snakes.push(new Snake('bril', c.x, c.y, { emerge: false, spawnTime: 0.5, delay: i * 0.2, ang: Math.atan2(P.y - c.y, P.x - c.x) })); }
  } else if (v === 'boete' && (G.run.coins || 0) >= 3) {
    G.run.coins -= 3; UI.banner('Boete', 'Three coins. Payable at once.', 'curse');
    floatText(P.x, P.y - 28, '-3', '#ffd84a', true); Sfx.register();
  } else {
    UI.banner('Orde in de zaal', 'Paper everywhere.', 'curse');
    const off = rnd(TAU);
    for (let i = 0; i < 12; i++) { const p = spawnVenom(sn.x, sn.y, off + (i / 12) * TAU, vs * 0.75, '#f2f0ea'); p.kind = 'paper'; p.spin = rnd(TAU); }
  }
}

/* ------------------------------------------------------------------ boss fights end */
function bossDead9(b) {
  if (DJ_KINDS[b.kind]) { DJ.stop(1.6); if (G.room) G.room.lasers9 = null; }
  if (b.kind === 'tellie' && G.room) G.room.sockets9 = null;
}

