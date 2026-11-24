/* src/90-v14-zz67.js: v14.7: SIX SEVEN. A hidden rhythm boss stage, the most over the top fight in the game.
   The room: a neon dance floor that changes colour on every beat, four speaker stacks, a crowd of tiny hands on the
   walls doing the six seven wobble. The boss is SIX SEVEN (six67): a loud orange and purple snake with a 67 chain
   and two giant floating hands, a 6 and a 7, that wobble up and down like the meme.
   A new kind of fight, on a beat clock that lives in the simulation (room.h67.beat):
     * every attack lands ON a beat: hand slams, laser lines over a row or a column, falling 67 meteors, digit fans;
     * gold beat pads light up on the floor. Stand on one when the beat hits: ON BEAT, the HYPE meter fills;
     * the boss vibes: outside SIX SEVEN MODE it takes 60% damage. Hits fill a little hype too;
     * full hype: SIX SEVEN MODE for 6.7 s. The boss is stuck dancing, takes 2.2x, the screen loses its mind
       (zoom on the beat, the camera rocks left and right with the hands, rainbow, confetti, giant 67s), seeds turn into 6s and 7s.
   Stages (85 rules: lines hold, shield, caps): DOOT DOOT (140 BPM), HANDS UP (66%, 150 BPM, lasers, digit rings),
   SIX SEVEEEN (33%, 164 BPM: both hands, meteors, beat dashes, the camera rocks the whole time).
   Music: Doot67, a live trap track on Web Audio scheduled from the beat clock, with a robot voice that says six and seven.
   Placement: a rare hidden room hung off a fight room from floor 2 (its own generator from the run seed, so floors
   without it draw nothing extra). Codes 67 and SIXSEVEN force it on every floor. Also a boss in Custom Run and the Map Maker.
   Determinism: everything in a tick uses Math.random (G.rng online). Drawing and audio use no game random.
   Test hook: window.__bitten.H67. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe67'); if (window.console) console.warn('v14 67', e); return fb; } };
  const TYPE = 'hype67', KIND = 'six67';
  const CFG = { force: false, odds: 0.14, chaosOdds: 0.3, endlessOdds: 0.1, next: false };
  const BPM = [0, 140, 150, 164];
  const MODE_T = 6.7, MODE_DMG = 2.2, VIBE_DMG = 0.6;
  const COL6 = '#ff8a1a', COL7 = '#a24aff', GOLD = '#ffd23a';
  const NEON = ['#ff3a8a', '#ffb02a', '#3ae8ff', '#a24aff', '#5aff7a', '#ff5a3a'];
  const vs = () => G.levelDef.venomSpeed;
  const is67 = (room) => !!room && room.type === TYPE;
  const hurtEach = (test, n, x, y) => { for (const Q of livePlayers14()) if (!(Q.dying > 0) && test(Q)) withPlayer(Q, () => Q.hurt(n, x, y)); };

  /* ================================================================== the boss */
  KINDS[KIND] = {
    boss: true, name: 'SIX SEVEN', hp: 240, headR: 21, r0: 18, r1: 8, spacing: 11.5, maxLen: 18, minLen: 8, bite: 2, speed: 74, turn: 3.2, noMound: true,
    body: COL6, body2: '#f07a10', outline: '#1a0630', hi: 'rgba(255,240,200,0.35)', blood: GOLD, eye: '#ffffff',
  };
  if (typeof LOOK14 === 'object') LOOK14[KIND] = { seg: 'bead', glow: GOLD };
  BOSS_INFO[KIND] = { title: 'SIX SEVEN', sub: 'Six. Seven. Six. Seven. It never stops.' };
  BOSS_TPL10[KIND] = ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'];
  CUSTOM_BOSS9[KIND] = 1;
  CHAOS_BOSSES9.push(KIND);
  BOSS_ORDER10.push(KIND);
  BOSS9_INIT[KIND] = (sn) => { sn.mode = 'move'; sn.mt = 0; sn.dash67 = 0; sn.dance67 = 0; sn.strafe = sn.strafe || 1; };
  // no hits while it makes its entrance
  {
    const cbh = Snake.prototype.canBeHit;
    Snake.prototype.canBeHit = function () { if (this.kind === KIND && G.room && G.room.h67 && G.room.h67.intro > 0) return false; return cbh.call(this); };
  }
  // it vibes: 60% damage, 2.2x in SIX SEVEN MODE. Every hit fills a little hype.
  HURT10[KIND] = (sn, amount, fx, fy, isPoison) => {
    const H = G.room && G.room.h67;
    if (!H) return amount;
    if (!isPoison && H.mode67 <= 0 && H.intro <= 0 && amount > 0) H.hype = Math.min(1, H.hype + 0.0065);
    if (H.mode67 > 0) { H.hitPop = 1; return amount * MODE_DMG; }
    return amount * VIBE_DMG;
  };

  /* ------------------------------------------------------------------ the fight state */
  function makeH(room, sn) {
    const H = room.h67 = {
      sn, beat: -1, n: -1, bpm: BPM[1], stage: 1, hype: 0, mode67: 0, modes: 0, intro: 2.7, introT: 0, done: false, outro: 0,
      pads: [], slams: [], lines: [], rocks: [], flash: 0, flashCol: GOLD, hitPop: 0, combo: 0, said: [],
      hands: [0, 1].map((i) => ({ i, g: i ? '7' : '6', col: i ? COL7 : COL6, x: RW / 2 + (i ? 70 : -70), y: RH / 2 - 60, h: 1, s: null, kick: 0 })),
    };
    return H;
  }
  function stageOf(H) { return H.sn ? (H.sn.stage14 || 1) : 1; }
  function glyphVenom(x, y, a, sp, g) {
    const v = spawnVenom(x, y, a, sp, g === '6' ? COL6 : COL7);
    v.kind = 'g67'; v.g = g; v.r = 7.5; v.spin = 0; v.life = 2.6;
    return v;
  }
  function ringOf(x, y, g, n, sp, off) { for (let i = 0; i < n; i++) glyphVenom(x, y, off + (i / n) * TAU, sp, i % 2 ? (g === '6' ? '7' : '6') : g); }
  function target() { const P = nearestLive14(RW / 2, RH / 2) || G.player; return P; }
  function lead(Q, k) { return { x: clamp(Q.x + (Q.vx || 0) * k, 24, RW - 24), y: clamp(Q.y + (Q.vy || 0) * k, 24, RH - 24) }; }

  // a hand flies to a spot, rises, and comes down on the beat `at`
  function slam(H, hand, x, y, at, r, ring) {
    const Hd = H.hands[hand];
    Hd.s = { x0: Hd.x, y0: Hd.y, x: clamp(x, 20, RW - 20), y: clamp(y, 20, RH - 20), t0: H.beat, at, r, ring };
    H.slams.push(Hd.s);
  }
  function addPad(H, room) {
    const P = target(), cells = [];
    for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) {
      if (room.solid(c, r)) continue;
      const x = (c + 0.5) * T, y = (r + 0.5) * T;
      if (P && dist(x, y, P.x, P.y) < 70) continue;
      if (H.pads.some((p) => p.c === c && p.r === r)) continue;
      cells.push([c, r]);
    }
    if (!cells.length) return;
    const [c, r] = cells[Math.floor(Math.random() * cells.length)];
    H.pads.push({ c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, born: H.beat, life: 8, g: H.pads.length % 2 ? '7' : '6' });
  }
  function shout(x, y, txt, col) { floatText(x, y, txt, col, true); }

  /* ------------------------------------------------------------------ on every beat */
  function onBeat(H, room, n) {
    const sn = H.sn, st = H.stage, P = target();
    H.flash = 1; H.flashCol = n % 2 ? COL7 : COL6;
    if (!sn || !sn.alive || sn.dying > 0 || !P) return;
    // the pads: whoever stands on one when the beat hits gets the hype
    for (let i = H.pads.length - 1; i >= 0; i--) {
      const p = H.pads[i];
      if (H.beat - p.born > p.life) { H.pads.splice(i, 1); continue; }
      if (H.mode67 > 0) continue;
      let got = null;
      for (const Q of livePlayers14()) if (!(Q.dying > 0) && Math.abs(Q.x - p.x) < T * 0.5 && Math.abs(Q.y - p.y) < T * 0.5) { got = Q; break; }
      if (!got) continue;
      H.pads.splice(i, 1);
      H.combo++;
      H.hype = Math.min(1, H.hype + (st >= 3 ? 0.2 : 0.17) + Math.min(0.06, H.combo * 0.01));
      shout(p.x, p.y - 26, H.combo > 2 ? `ON BEAT x${H.combo}` : 'ON BEAT', GOLD);
      burst(p.x, p.y, 22, GOLD, { min: 60, max: 220, rmin: 1.4, rmax: 3, lmin: 0.3, lmax: 0.8, glow: true });
      addP({ kind: 'ring', x: p.x, y: p.y, vx: 0, vy: 0, r: 26, life: 0.4, col: GOLD, drag: 0, glow: true });
      flashLight(p.x, p.y, 120, 0.9, 0.35);
      Sfx.ping && Sfx.ping(); Meta.add('beat67');
    }
    if (H.mode67 > 0) {
      // the boss is stuck dancing: the crowd goes wild
      const g = n % 2 ? 'SEVEN' : 'SIX';
      shout(clamp(sn.x + (n % 2 ? 60 : -60), 40, RW - 40), sn.y - 50 - (n % 4) * 8, g, n % 2 ? COL7 : COL6);
      for (let k = 0; k < 2; k++) burst(rnd(30, RW - 30), rnd(30, RH - 30), 10, pick(NEON), { min: 40, max: 200, rmin: 1.4, rmax: 3, lmin: 0.5, lmax: 1.1, glow: true });
      G.shake = Math.max(G.shake, 3);
      return;
    }
    // pads: two per bar, three in the last stage
    if (n % 4 === 0) { const want = st >= 3 ? 3 : 2; while (H.pads.length < want) { const k = H.pads.length; addPad(H, room); if (H.pads.length === k) break; } }
    // the hands: one slam every two beats in stage 1, one every beat after that, both together in stage 3 every 8th
    const warn = st >= 3 ? 2 : 2;
    const every = st >= 2 ? 1 : 2;
    if (n % every === 0) {
      const hand = (n / every) % 2 ? 1 : 0;
      if (!H.hands[hand].s) {
        const Q = pick(livePlayers14().filter((q) => !(q.dying > 0))) || P;
        const at = lead(Q, (warn * 60) / H.bpm * 0.6);
        slam(H, hand, at.x, at.y, n + warn, st >= 3 ? 50 : 44, st >= 2 && hand === 1 ? (st >= 3 ? 6 : 5) : 0);
      }
    }
    if (st >= 3 && n % 8 === 4) {
      const o = H.hands[0].s ? 1 : 0;
      if (!H.hands[o].s) { const a = rnd(TAU); slam(H, o, P.x + Math.cos(a) * 70, P.y + Math.sin(a) * 70, n + 2, 50, 6); }
    }
    // laser lines over a row or a column, through where you stand
    if (st >= 2 && n % 4 === 0) {
      const c = clamp(Math.floor(P.x / T), 0, COLS - 1), r = clamp(Math.floor(P.y / T), 0, ROWS - 1);
      const ax = (n / 4) % 2 ? 'c' : 'r';
      H.lines.push({ ax, i: ax === 'r' ? r : c, at: n + 4, end: n + 5, g: ax === 'r' ? '6' : '7' });
      if (st >= 3) { const ax2 = ax === 'r' ? 'c' : 'r'; H.lines.push({ ax: ax2, i: ax2 === 'r' ? r : c, at: n + 4, end: n + 5, g: ax2 === 'r' ? '6' : '7' }); }
    }
    // 67 meteors from the sky
    if (st >= 3 && n % 2 === 1) {
      const a = rnd(TAU), d = rnd(10, 80);
      H.rocks.push({ x: clamp(P.x + Math.cos(a) * d, 30, RW - 30), y: clamp(P.y + Math.sin(a) * d, 30, RH - 30), at: n + 3, t0: H.beat, r: 34 });
    }
    // the snake itself: digit fans on the off beats, a ring in the last stage, a dash on the bar
    if (st === 1 && n % 4 === 2) { digitFan(sn, 3, 0.28, 0.95); }
    if (st === 2 && n % 4 === 2) { digitFan(sn, 5, 0.22, 1); }
    if (st >= 3 && n % 4 === 2) { ringOf(sn.x, sn.y, n % 8 === 2 ? '6' : '7', 10, vs() * 0.6, n * 0.37); Sfx.spit(); }
    if (st >= 3 && n % 8 === 0) { sn.dash67 = (60 / H.bpm) * 1.2; sn.dashA67 = Math.atan2(P.y - sn.y, P.x - sn.x); shout(sn.x, sn.y - 40, 'DOOT DOOT', GOLD); }
    // the crowd shouts along in the last stage
    if (st >= 3 && n % 2 === 0) shout(rnd(60, RW - 60), rnd(30, 60), n % 4 ? 'SEVEN' : 'SIX', n % 4 ? COL7 : COL6);
  }
  function digitFan(sn, n, spread, k) {
    const P = G.player, base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * spread; glyphVenom(sn.x + Math.cos(a) * sn.headR, sn.y + Math.sin(a) * sn.headR, a, vs() * k, i % 2 ? '7' : '6'); }
    sn.mouth = 1; Sfx.spit();
  }

  /* ------------------------------------------------------------------ SIX SEVEN MODE */
  function startMode(H) {
    H.mode67 = MODE_T; H.hype = 1; H.modes++; H.combo = 0; H.pads.length = 0; H.slams.length = 0; H.lines.length = 0; H.rocks.length = 0;
    for (const Hd of H.hands) Hd.s = null;
    for (let j = G.venom.length - 1; j >= 0; j--) if (!G.venom[j].friendly) G.venom.splice(j, 1);
    const sn = H.sn;
    if (sn) { sn.mode = 'dance'; sn.mt = 0; sn.dash67 = 0; }
    UI.banner('SIX SEVEN MODE', 'It is stuck dancing. 2.2x damage. GO.', 'legend');
    shout(RW / 2, RH / 2 - 40, 'SIX SEVEN MODE', GOLD);
    G.shake = Math.max(G.shake, 14); H.flash = 1.6; H.flashCol = '#ffffff';
    for (let k = 0; k < 6; k++) burst(rnd(20, RW - 20), rnd(20, RH - 20), 16, NEON[k % NEON.length], { min: 80, max: 300, rmin: 1.4, rmax: 3.2, lmin: 0.6, lmax: 1.3, glow: true });
    Sfx.boom(); Sfx.legend && Sfx.legend();
    Meta.add('mode67');
    if (G.run) G.run.modes67 = (G.run.modes67 || 0) + 1;
  }
  function endMode(H) {
    H.mode67 = 0; H.hype = 0;
    const sn = H.sn;
    if (sn && sn.alive && sn.dying <= 0) {
      sn.mode = 'move'; sn.mt = 0;
      shout(sn.x, sn.y - 44, 'NOT FUNNY', '#ff5a5a');
      ringOf(sn.x, sn.y, '6', 12, vs() * 0.55, 0);
    }
  }

  /* ------------------------------------------------------------------ the beat clock and everything on it */
  function update67(dt, room) {
    const H = room.h67; if (!H || !(dt > 0)) return;
    const sn = H.sn;
    if (H.flash > 0) H.flash = Math.max(0, H.flash - dt * 3);
    if (H.hitPop > 0) H.hitPop = Math.max(0, H.hitPop - dt * 6);
    const alive = sn && sn.alive && sn.dying <= 0;
    if (!alive) {
      if (!H.done) { H.done = true; H.outro = 3; H.pads.length = 0; H.slams.length = 0; H.lines.length = 0; H.rocks.length = 0; H.mode67 = 0; for (const Hd of H.hands) Hd.s = null; }
      H.outro = Math.max(0, H.outro - dt);
      H.beat += dt * H.bpm / 60;
      for (const Hd of H.hands) { Hd.y -= dt * 160; Hd.h = Math.min(3, Hd.h + dt); }
      return;
    }
    if (G.player && G.player.dying > 0 && !livePlayers14().some((q) => !(q.dying > 0))) return;
    if (H.intro > 0) {
      const i0 = H.introT;
      H.introT += dt; H.intro -= dt;
      if (i0 < 0.05 && H.introT >= 0.05) { G.shake = Math.max(G.shake, 8); Sfx.thud(); }
      if (i0 < 0.95 && H.introT >= 0.95) { G.shake = Math.max(G.shake, 10); Sfx.thud(); }
      if (i0 < 1.85 && H.introT >= 1.85) { G.shake = Math.max(G.shake, 16); Sfx.boom(); burst(sn.x, sn.y, 40, GOLD, { min: 80, max: 320, rmin: 1.4, rmax: 3.2, lmin: 0.5, lmax: 1.1, glow: true }); }
      handsIdle(H, dt);
      return;
    }
    H.stage = stageOf(H);
    H.bpm = BPM[Math.min(3, H.stage)];
    H.beat += dt * H.bpm / 60;
    const n = Math.floor(H.beat);
    if (n !== H.n) { H.n = n; safe(() => onBeat(H, room, n)); }
    if (H.mode67 > 0) { H.mode67 -= dt; if (H.mode67 <= 0) endMode(H); }
    else if (H.hype >= 1) startMode(H);
    // slams land
    for (let i = H.slams.length - 1; i >= 0; i--) {
      const s = H.slams[i];
      if (H.beat < s.at) continue;
      H.slams.splice(i, 1);
      const Hd = H.hands.find((h) => h.s === s); if (Hd) { Hd.s = null; Hd.x = s.x; Hd.y = s.y; Hd.h = 0; Hd.kick = 1; }
      hurtEach((Q) => dist(Q.x, Q.y, s.x, s.y) < s.r + Q.r * 0.5, 1, s.x, s.y);
      if (s.ring) ringOf(s.x, s.y, Hd ? Hd.g : '7', s.ring, vs() * 0.5, H.beat);
      burst(s.x, s.y, 18, Hd ? Hd.col : GOLD, { min: 60, max: 220, rmin: 1.4, rmax: 3, lmin: 0.3, lmax: 0.7, glow: true });
      addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: s.r * 0.7, life: 0.35, col: Hd ? Hd.col : GOLD, drag: 0, glow: true });
      G.shake = Math.max(G.shake, 7); Sfx.thud();
      if (Hd) shout(s.x, s.y - 30, Hd.g, Hd.col);
    }
    // laser lines
    for (let i = H.lines.length - 1; i >= 0; i--) {
      const l = H.lines[i];
      if (H.beat >= l.end) { H.lines.splice(i, 1); continue; }
      if (H.beat < l.at) continue;
      if (!l.fired) { l.fired = true; G.shake = Math.max(G.shake, 5); Sfx.zap ? Sfx.zap() : Sfx.thud(); }
      hurtEach((Q) => (l.ax === 'r' ? Math.abs(Q.y - (l.i + 0.5) * T) < T * 0.42 : Math.abs(Q.x - (l.i + 0.5) * T) < T * 0.42), 1, Q0x(l), Q0y(l));
    }
    // meteors
    for (let i = H.rocks.length - 1; i >= 0; i--) {
      const m = H.rocks[i];
      if (H.beat < m.at) continue;
      H.rocks.splice(i, 1);
      hurtEach((Q) => dist(Q.x, Q.y, m.x, m.y) < m.r + Q.r * 0.5, 1, m.x, m.y);
      burst(m.x, m.y, 26, pick(NEON), { min: 70, max: 260, rmin: 1.4, rmax: 3.2, lmin: 0.35, lmax: 0.8, glow: true });
      addP({ kind: 'ring', x: m.x, y: m.y, vx: 0, vy: 0, r: m.r, life: 0.4, col: GOLD, drag: 0, glow: true });
      G.shake = Math.max(G.shake, 9); Sfx.boom();
    }
    handsIdle(H, dt);
  }
  const Q0x = (l) => (l.ax === 'c' ? (l.i + 0.5) * T : RW / 2), Q0y = (l) => (l.ax === 'r' ? (l.i + 0.5) * T : RH / 2);
  // between slams the hands float beside the boss and do the gesture: one up, one down, swapping every beat
  function handsIdle(H, dt) {
    const sn = H.sn; if (!sn) return;
    const wob = H.mode67 > 0 ? 2 : 1;
    for (const Hd of H.hands) {
      if (Hd.kick > 0) Hd.kick = Math.max(0, Hd.kick - dt * 4);
      if (Hd.s) {
        const s = Hd.s, u = clamp((H.beat - s.t0) / Math.max(0.01, s.at - s.t0), 0, 1);
        const e = 1 - Math.pow(1 - Math.min(1, u * 1.6), 3);
        Hd.x = s.x0 + (s.x - s.x0) * e; Hd.y = s.y0 + (s.y - s.y0) * e;
        Hd.h = u < 0.75 ? 0.4 + u * 1.2 : Math.max(0, 1.3 * (1 - (u - 0.75) / 0.25));
        continue;
      }
      const side = Hd.i ? 1 : -1, ph = Math.sin(H.beat * Math.PI * wob) * side;
      const tx = clamp(sn.x + side * 62, 20, RW - 20), ty = clamp(sn.y - 34 + ph * 16, 16, RH - 16);
      const k = Math.min(1, dt * 7);
      Hd.x += (tx - Hd.x) * k; Hd.y += (ty - Hd.y) * k;
      Hd.h += (0.7 + ph * 0.35 - Hd.h) * k;
    }
  }

  /* ------------------------------------------------------------------ the snake */
  AI[KIND] = function (sn, room, dt) {
    if (!room.h67) makeH(room, sn);
    const H = room.h67; H.sn = sn;
    sn.mt += dt;
    if (H.intro > 0) { sn.drawAng = turnToward(sn.drawAng, Math.atan2(G.player.y - sn.y, G.player.x - sn.x), 4 * dt); return; }
    if (sn.mode === 'dance') {
      // stuck in the bit: it bobs its head to the beat and does not move
      sn.drawAng = -Math.PI / 2 + Math.sin(H.beat * Math.PI) * 0.6; sn.ang = sn.drawAng; sn.mouth = 0.6 + 0.4 * Math.sin(H.beat * TAU);
      return;
    }
    if (sn.dash67 > 0) {
      sn.dash67 -= dt;
      steerMove(sn, room, sn.dashA67, sn.K.speed * 3.4, 9, dt);
      if (Math.random() < dt * 30) burst(sn.x, sn.y, 2, pick([COL6, COL7, GOLD]), { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
      return;
    }
    keepAway(sn, room, dt, 110, 230, sn.K.speed);
  };
  // stages: the 85 rules (lines hold, 1.1 s shield, caps), its own names. 85 wraps AI functions when it loads, so wrap here.
  {
    const S = window.__bitten && window.__bitten.STAGE14;
    if (S && S.DEF && !S.DEF[KIND]) {
      const D = S.DEF[KIND] = {
        sting: ['boom'], at: [0.66, 0.33], col: COL6, speed: [1, 1.08, 1.16],
        names: [['HANDS UP', 'Laser lines on the beat. Every slam throws a ring of digits.', 'Six. SEVEN.'],
          ['SIX SEVEEEN', 'Double time. 67s fall from the sky. Keep hitting the gold pads.', 'SIIIX SEVEEEEEN']],
        enter(sn, room, st) {
          const H = room.h67; if (!H) return;
          H.slams.length = 0; H.lines.length = 0; H.rocks.length = 0; for (const Hd of H.hands) Hd.s = null;
          H.flash = 1.4; H.flashCol = st >= 3 ? COL7 : COL6;
          H.hype = Math.min(1, H.hype + 0.25);
          shout(RW / 2, RH / 2, st >= 3 ? 'DOUBLE TIME' : 'HANDS UP', GOLD);
        },
      };
      const a0 = AI[KIND];
      AI[KIND] = function (sn, room, dt) {
        if (!sn.isBoss) return a0.call(this, sn, room, dt);
        if (!sn.stage14) { sn.stage14 = 1; sn.stageT14 = 0; sn.win14 = 0; sn.wt14 = G.t; sn.sc14 = sn.sc14 || {}; }
        const ln = D.at[sn.stage14 - 1];
        if ((sn.stagePend14 || (ln != null && sn.hp < sn.maxHp * ln)) && dt > 0 && sn.dying <= 0) stageUp(sn, room, D);
        if (sn.stageT14 > 0) sn.stageT14 -= dt;
        return a0.call(this, sn, room, dt * D.speed[Math.min(D.speed.length, sn.stage14) - 1]);
      };
    }
  }
  function stageUp(sn, room, D) {
    sn.stage14++; sn.stagePend14 = false; sn.stageT14 = 1.1;
    const nm = D.names[sn.stage14 - 2], total = D.at.length + 1;
    if (nm) {
      const pips = Array.from({ length: total }, (_, i) => (i < sn.stage14 ? '◆' : '◇')).join(' ');
      UI.card(`${sn.K.name}  ${pips}`, nm[0], '“' + nm[2] + '”', 'boss stage14', 2.6);
      if (UI.el && UI.el.card) UI.el.card.style.setProperty('--sc', sn.stage14 >= 3 ? COL7 : COL6);
      UI.banner(`Stage ${sn.stage14} of ${total}`, nm[1], 'curse');
    }
    for (let j = G.venom.length - 1; j >= 0; j--) if (!G.venom[j].friendly) G.venom.splice(j, 1);
    if (room.st14) room.st14.length = 0;
    sn.mode = sn.mode === 'dance' ? 'dance' : 'move'; sn.mt = 0; sn.dash67 = 0;
    burst(sn.x, sn.y, 40, GOLD, { min: 80, max: 320, rmin: 1.4, rmax: 3.2, lmin: 0.4, lmax: 0.9, glow: true });
    G.shake = Math.max(G.shake || 0, 12); flashLight(sn.x, sn.y, 260, 1, 0.4);
    Sfx.roar(); Sfx.boom();
    D.enter(sn, room, sn.stage14);
    if (G.run) G.run.stages14 = (G.run.stages14 || 0) + 1;
  }
  {
    const ur0 = updateRoom9;
    updateRoom9 = function (dt, room, frozen) {
      ur0(dt, room, frozen);
      if (room && room.h67 && !frozen) safe(() => update67(dt, room));
    };
  }

  /* ================================================================== the hidden room */
  function put(room, c, r, o) {
    o.c = c; o.r = r; o.x = (c + 0.5) * T; o.y = (r + 0.5) * T; o.shake = 0; o.wob = 0; o.seed = ((c * 7 + r * 13) % 17) / 17;
    room.tiles[r][c] = o; room.obs.push(o); room.ver++; room.dirty = true;
    return o;
  }
  const TPL = ['...........', '.S.......S.', '...........', '...........', '...........', '...........', '...........', '.S.......S.', '...........'];
  function build67(room, def) {
    room.build(TPL.map((s) => s.replace(/S/g, '.')), def);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (TPL[r][c] === 'S') put(room, c, r, { type: 'spk67', solid: true, shots: true, ph: c + r });
    room.sconces = []; room.tubes = null; room.cleared = false; room.stage67 = true;
  }
  {
    const pe0 = placeExtras9;
    placeExtras9 = function (rooms, grid, key, rng, def, tier) {
      pe0(rooms, grid, key, rng, def, tier);
      if (def.rush || G.mode === 'story') return;
      const fl = G.levelIdx || 0, run = G.run;
      if (fl < 1 && !CFG.force) return;
      // a generator of its own: a floor without the stage draws nothing extra from the floor generator
      const seed = run && run.seed != null ? run.seed >>> 0 : 0;
      const r = mulberry32((((seed ^ 0x36377a7a) >>> 0) + fl * 0x9e3779b1) >>> 0);
      if (CFG.next) { const nx = rooms.find((q) => q.type === 'fight' && q.dist === 1); if (nx) { resetRoom9(nx); nx.type = TYPE; build67(nx, def); return; } }
      const odds = def.chaos ? CFG.chaosOdds : G.mode === 'endless' ? CFG.endlessOdds : CFG.odds;
      if (!CFG.force && r() >= odds) return;
      hang10(rooms, grid, key, r, TYPE, (nr) => build67(nr, def));
    };
    const cr0 = chaosRoom9;
    chaosRoom9 = function (rm, t, def, rng) {
      if (t === TYPE) { resetRoom9(rm); rm.type = TYPE; build67(rm, def); return; }
      return cr0(rm, t, def, rng);
    };
    CHAOS_ROOMS9.push(TYPE);
  }
  Object.assign(NOBONES9, { [TYPE]: 1 });
  {
    const er0 = enterRoom9;
    enterRoom9 = function (room, entry) {
      er0(room, entry);
      if (is67(room) && !room.cleared && !room.fought) { room.fought = true; safe(() => start67(room, entry)); }
    };
  }
  function start67(room, entry) {
    const P = G.player;
    room.locked = true; room.doorCl = 0; Sfx.doorShut();
    const v = DOORV[entry || 's'] || [0, 1];
    const f = nearestFreeCell(room, RW / 2 - v[0] * RW * 0.26, RH / 2 - v[1] * RH * 0.22);
    const boss = new Snake(KIND, f.x, f.y, { ang: Math.atan2(P.y - f.y, P.x - f.x), emerge: false, spawnTime: 0.4 });
    boss.maxHp = boss.hp = boss.K.hp * bossHpK(); boss.delay = 0.2;
    room.snakes.push(boss); G.boss = boss;
    if (G.run) G.run.bossHits0 = G.run.hits || 0;
    makeH(room, boss);
    UI.card('A hidden stage', 'SIX SEVEN', 'Stand on the gold pads ON the beat. Fill the hype. Then it is your turn.', 'boss', 3.2);
    Sfx.stinger && Sfx.stinger();
  }
  {
    const c0 = clearRoom9;
    clearRoom9 = function (room) {
      c0(room);
      if (!is67(room)) return;
      safe(() => {
        Meta.add('wins67');
        const cx = RW / 2, cy = RH / 2;
        const n = coopLoot14() + 1;
        for (let i = 0; i < n; i++) spawnItem(room, clamp(cx + (i - (n - 1) / 2) * 48, 30, RW - 30), cy - 10, i === 0 ? 0.35 : 0.12);
        dropCoins(room, cx - 40, cy + 40, 6); dropCoins(room, cx + 40, cy + 40, 7);
        dropHeart(room, cx, cy + 50, 2);
        for (let k = 0; k < 8; k++) burst(rnd(20, RW - 20), rnd(20, RH - 20), 14, NEON[k % NEON.length], { min: 60, max: 260, rmin: 1.4, rmax: 3, lmin: 0.6, lmax: 1.4, glow: true });
        UI.banner('SIX SEVEN IS DOWN', 'The beat stops. Take the loot.', 'legend');
      });
    };
  }
  {
    const dk0 = darkTarget9;
    darkTarget9 = function (room, L) { if (is67(room) || room.h67) return 0.04; return dk0(room, L); };
    const xl0 = extraLights;
    extraLights = function (room, light) {
      xl0(room, light);
      const H = room.h67; if (!H) return;
      for (const p of H.pads) light(p.x, p.y, 50, 0.7);
      for (const o of room.obs) if (o.type === 'spk67') light(o.x, o.y, 70, 0.6);
    };
    const rc0 = roomChip;
    roomChip = function (room) {
      if (is67(room)) return room.cleared ? ['67', GOLD] : ['SIX SEVEN', COL6];
      return rc0(room);
    };
  }
  MINI9[TYPE] = (c, mx, my, cur) => {
    const r = G.map && G.map.rooms.find((q) => q.type === TYPE);
    if (r && !r.visited) return;
    c.fillStyle = cur ? '#5a2a08' : COL6; c.fillRect(mx - 3, my - 2.4, 6, 4.8);
    c.fillStyle = cur ? '#ece2d4' : '#1a0630'; c.font = '700 4px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('67', mx, my + 0.2);
  };
  STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['beat67', 'Beat pads hit on the beat'], ['mode67', 'SIX SEVEN MODEs'], ['wins67', 'SIX SEVEN stages won']);
  ACHS.push(
    { id: 'boss67', name: 'Six Seven', desc: 'Beat SIX SEVEN.', stat: 'boss_' + KIND, goal: 1 },
    { id: 'beat67', name: 'On beat', desc: 'Hit 67 gold beat pads on the beat.', stat: 'beat67', goal: 67 },
  );
  for (const s of ['ON BEAT', 'SIX', 'SEVEN', 'SIX SEVEN MODE', 'DOOT DOOT', 'HANDS UP', 'DOUBLE TIME', 'NOT FUNNY', '6', '7', 'SIX SEVEN', '67']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  for (const s of ['SIX SEVEN MODE', 'It is stuck dancing. 2.2x damage. GO.', 'A hidden stage', 'SIX SEVEN', 'Stand on the gold pads ON the beat. Fill the hype. Then it is your turn.', 'SIX SEVEN IS DOWN', 'The beat stops. Take the loot.']) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);

  /* ================================================================== drawing */
  const beatOf = (H) => (H.intro > 0 ? H.introT * 2 : H.beat);
  const frac = (x) => x - Math.floor(x);
  const nc = (i) => NEON[((Math.floor(i) % NEON.length) + NEON.length) % NEON.length];
  function glyph(c, g, x, y, size, col, rot) {
    c.save(); c.translate(x, y); if (rot) c.rotate(rot);
    c.font = `900 ${size}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = Math.max(2, size * 0.18); c.strokeStyle = '#140420'; c.strokeText(g, 0, size * 0.04);
    c.fillStyle = col; c.fillText(g, 0, size * 0.04);
    c.restore();
  }
  // a palm, seen from above, fingers up (-y), as in the gesture
  function palm(c, x, y, s, col, out) {
    c.fillStyle = out;
    ell(c, x, y, s * 1.12, s * 1.02); c.fill();
    for (let f = 0; f < 4; f++) { const fx = x + (f - 1.5) * s * 0.5; rrect(c, fx - s * 0.24, y - s * 2.05, s * 0.48, s * 1.35, s * 0.24); c.fill(); }
    rrect(c, x + s * 0.75, y - s * 0.9, s * 0.95, s * 0.44, s * 0.2); c.fill();
    c.fillStyle = col;
    ell(c, x, y, s, s * 0.9); c.fill();
    for (let f = 0; f < 4; f++) { const fx = x + (f - 1.5) * s * 0.5; rrect(c, fx - s * 0.17, y - s * 1.95, s * 0.34, s * 1.25, s * 0.17); c.fill(); }
    rrect(c, x + s * 0.8, y - s * 0.84, s * 0.85, s * 0.32, s * 0.16); c.fill();
  }
  function drawFloor67(c, room, t) {
    const H = room.h67; if (!H) return;
    const b = beatOf(H), n = Math.floor(b), f = frac(b), hot = H.mode67 > 0;
    // the dance floor
    for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
      if (room.solid(cc, r)) continue;
      const k = cc + r + n, on = ((cc + r + n) & 1) === 0;
      const a = H.done ? 0.06 * (H.outro / 3) : (on ? 0.14 : 0.05) + (on ? 0.16 * (1 - f) : 0) + (hot ? 0.12 : 0);
      if (a <= 0.005) continue;
      c.fillStyle = rgba(hot ? nc(k + t * 8) : nc(k), a);
      c.fillRect(cc * T + 1.5, r * T + 1.5, T - 3, T - 3);
    }
    // the pads: gold, pulsing to the beat, the digit on top
    for (const p of H.pads) {
      const age = H.beat - p.born, life = 1 - age / p.life, pulse = 1 - f;
      c.fillStyle = rgba(GOLD, 0.28 + 0.4 * pulse); c.fillRect(p.c * T + 2, p.r * T + 2, T - 4, T - 4);
      c.strokeStyle = rgba('#fff6c8', 0.6 + 0.4 * pulse); c.lineWidth = 2.5; c.strokeRect(p.c * T + 3 + pulse * 3, p.r * T + 3 + pulse * 3, T - 6 - pulse * 6, T - 6 - pulse * 6);
      glyph(c, p.g, p.x, p.y, 20 + pulse * 6, '#fff6c8');
      if (life < 0.3 && Math.floor(t * 10) % 2) { c.fillStyle = 'rgba(20,4,32,0.35)'; c.fillRect(p.c * T + 2, p.r * T + 2, T - 4, T - 4); }
    }
    // line warnings
    for (const l of H.lines) {
      const warn = H.beat < l.at, u = warn ? clamp(1 - (l.at - H.beat) / 4, 0, 1) : 1;
      const x = l.ax === 'c' ? l.i * T : 0, y = l.ax === 'r' ? l.i * T : 0, w = l.ax === 'c' ? T : RW, h = l.ax === 'r' ? T : RH;
      if (warn) {
        c.fillStyle = rgba(l.g === '6' ? COL6 : COL7, 0.12 + 0.22 * u * (0.6 + 0.4 * Math.sin(t * 30)));
        c.fillRect(x, y, w, h);
        c.setLineDash([6, 6]); c.strokeStyle = rgba('#ffffff', 0.35 + 0.4 * u); c.lineWidth = 1.5; c.strokeRect(x + 2, y + 2, w - 4, h - 4); c.setLineDash([]);
        const cnt = Math.ceil(l.at - H.beat);
        if (cnt <= 3) glyph(c, String(cnt), l.ax === 'c' ? x + T / 2 : 22, l.ax === 'r' ? y + T / 2 : 22, 16, '#ffffff');
      }
    }
    // slam shadows and meteor shadows
    for (const Hd of H.hands) {
      const s = Hd.s; if (!s) continue;
      const u = clamp((H.beat - s.t0) / Math.max(0.01, s.at - s.t0), 0, 1);
      c.fillStyle = rgba('#000000', 0.18 + 0.3 * u); ell(c, s.x, s.y, s.r * (0.4 + 0.6 * u), s.r * (0.32 + 0.48 * u)); c.fill();
      c.strokeStyle = rgba(Hd.col, 0.5 + 0.5 * u); c.lineWidth = 2.5; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.stroke();
      c.fillStyle = rgba(Hd.col, 0.1 + 0.25 * u); c.beginPath(); c.arc(s.x, s.y, s.r * u, 0, TAU); c.fill();
    }
    for (const m of H.rocks) {
      const u = clamp(1 - (m.at - H.beat) / 3, 0, 1);
      c.fillStyle = rgba('#000000', 0.15 + 0.35 * u); ell(c, m.x, m.y, m.r * (0.3 + 0.7 * u), m.r * (0.25 + 0.55 * u)); c.fill();
      c.strokeStyle = rgba(GOLD, 0.4 + 0.6 * u); c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.arc(m.x, m.y, m.r, 0, TAU); c.stroke(); c.setLineDash([]);
    }
  }
  function drawAbove67(c, room, t) {
    const H = room.h67; if (!H) return;
    const b = beatOf(H), f = frac(b), hot = H.mode67 > 0;
    // active laser lines
    for (const l of H.lines) {
      if (H.beat < l.at) continue;
      const x = l.ax === 'c' ? l.i * T : 0, y = l.ax === 'r' ? l.i * T : 0, w = l.ax === 'c' ? T : RW, h = l.ax === 'r' ? T : RH;
      const col = l.g === '6' ? COL6 : COL7;
      c.fillStyle = rgba(col, 0.55); c.fillRect(x, y, w, h);
      c.fillStyle = 'rgba(255,255,255,0.75)';
      if (l.ax === 'r') c.fillRect(0, y + T * 0.38, RW, T * 0.24); else c.fillRect(x + T * 0.38, 0, T * 0.24, RH);
      for (let k = 0; k < 8; k++) glyph(c, l.g, l.ax === 'r' ? ((k + 0.5) / 8) * RW + Math.sin(t * 20 + k) * 6 : x + T / 2, l.ax === 'c' ? ((k + 0.5) / 8) * RH + Math.sin(t * 20 + k) * 6 : y + T / 2, 14, '#ffffff');
    }
    // meteors falling: a big 67 dropping out of the sky
    for (const m of H.rocks) {
      const u = clamp(1 - (m.at - H.beat) / 3, 0, 1), hgt = (1 - u * u) * 220;
      glyph(c, '67', m.x, m.y - hgt, 22 + u * 14, u > 0.8 ? '#ffffff' : GOLD, Math.sin(t * 9 + m.x) * 0.3);
    }
    // the two hands
    for (const Hd of H.hands) {
      const lift = (Hd.h || 0) * 30, s = 13.5 + Hd.h * 1.8 + (Hd.kick > 0 ? Hd.kick * 3 : 0);
      if (H.done && H.outro <= 0) continue;
      c.globalAlpha = H.done ? clamp(H.outro / 3, 0, 1) : 1;
      c.fillStyle = 'rgba(0,0,0,0.22)'; ell(c, Hd.x, Hd.y + 4, s * 1.4, s * 0.7); c.fill();
      const y = Hd.y - lift;
      palm(c, Hd.x, y, s, Hd.i ? '#c89aff' : '#ffb870', '#1a0630');
      glyph(c, Hd.g, Hd.x, y - 0.5, s * 1.5, Hd.col);
      if (hot) { c.globalCompositeOperation = 'lighter'; glowDot(c, Hd.x, y, s * 4, nc(b + Hd.i * 3), 0.35); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = 1;
    }
    // the crowd on the walls: two rows of tiny hands doing the wobble
    const crowdA = H.done ? 0.5 : 1;
    c.globalAlpha = crowdA;
    for (const [yy, flip] of [[-WALL * 0.45, 0], [RH + WALL * 0.62, 1]]) for (let i = 0; i < 16; i++) {
      const x = ((i + 0.5) / 16) * RW, ph = (i % 2 ? 1 : -1) * Math.sin(b * Math.PI * (hot ? 2 : 1) + i * 0.4);
      const sk = ['#f2c8a0', '#c8905a', '#8a5a3a', '#ffd8b8'][i % 4];
      palm(c, x - 5, yy + ph * 3.5 + (flip ? 2 : 0), 2.4, sk, '#1a0630');
      palm(c, x + 5, yy - ph * 3.5 + (flip ? 2 : 0), 2.4, sk, '#1a0630');
    }
    c.globalAlpha = 1;
    // seeds become 6s and 7s in SIX SEVEN MODE
    if (hot) for (let i = 0; i < G.seeds.length; i++) { const s = G.seeds[i]; glyph(c, i % 2 ? '7' : '6', s.x, s.y - 3, 13 * (s.size || 1), i % 2 ? '#e0c0ff' : '#ffd0a0', s.rot); }
    // the boss name pulses over its head
    const sn = H.sn;
    if (sn && sn.alive && !sn.burrowed && sn.delay <= 0) {
      const pop = 1 + 0.25 * Math.pow(1 - f, 3);
      glyph(c, '67', sn.x, sn.y - sn.headR - 18, 15 * pop, Math.floor(b) % 2 ? COL7 : COL6, Math.sin(b * Math.PI) * 0.2);
    }
  }
  function drawGlow67(c, room, t) {
    const H = room.h67; if (!H) return;
    const f = frac(beatOf(H)), hot = H.mode67 > 0;
    c.globalCompositeOperation = 'lighter';
    for (const p of H.pads) glowDot(c, p.x, p.y, 40 + 16 * (1 - f), GOLD, 0.3 + 0.25 * (1 - f));
    for (const o of room.obs) if (o.type === 'spk67') glowDot(c, o.x, o.y, 46 + 30 * (1 - f), nc(o.ph + beatOf(H)), 0.22 + 0.25 * (1 - f));
    const sn = H.sn;
    if (sn && sn.alive) glowDot(c, sn.x, sn.y, sn.headR * (3.2 + (hot ? 2 : 0)), hot ? NEON[Math.floor(t * 10) % NEON.length] : GOLD, 0.2 + 0.15 * (1 - f));
    c.globalCompositeOperation = 'source-over';
  }
  // speaker stacks: the cone kicks out on every beat
  DYN9.spk67 = (c, o, room, t) => {
    const H = room.h67, f = H ? frac(beatOf(H)) : 0.5, k = Math.pow(1 - f, 2);
    const x = o.x, y = o.y;
    c.fillStyle = 'rgba(0,0,0,0.3)'; rrect(c, x - 17, y - 12, 36, 34, 4); c.fill();
    c.fillStyle = '#1a1424'; rrect(c, x - 18, y - 19, 36, 36, 4); c.fill();
    c.strokeStyle = '#3a2a4a'; c.lineWidth = 1.5; rrect(c, x - 16.5, y - 17.5, 33, 33, 3); c.stroke();
    c.fillStyle = '#0c0812'; c.beginPath(); c.arc(x, y + 2, 11 + k * 1.6, 0, TAU); c.fill();
    c.fillStyle = '#2a2236'; c.beginPath(); c.arc(x, y + 2, 7 + k * 2, 0, TAU); c.fill();
    c.fillStyle = nc((o.ph || 0) + (H ? beatOf(H) : 0)); c.beginPath(); c.arc(x, y + 2, 2.6 + k * 1.4, 0, TAU); c.fill();
    c.fillStyle = '#2a2236'; c.beginPath(); c.arc(x, y - 12, 3.5, 0, TAU); c.fill();
  };
  // glyph venom
  VENOM9.g67 = (c, v) => { glyph(c, v.g, v.x, v.y, 16, v.col, Math.sin((v.spin || 0) * 0.6) * 0.5); };
  // the snake: every segment a 6 or a 7 on alternating orange and purple
  {
    const dec0 = decorateSnake9;
    decorateSnake9 = function (c, sn, t) {
      dec0(c, sn, t);
      if (sn.kind !== KIND) return;
      const H = G.room && G.room.h67, b = H ? beatOf(H) : t * 2, n = Math.floor(b);
      segPaint9(sn, (p, k, dx, dy) => {
        if (k === 0) return;
        const odd = ((k + n) & 1) === 1;
        c.fillStyle = odd ? COL7 : COL6; c.beginPath(); c.arc(p.x, p.y, p.r * 0.86, 0, TAU); c.fill();
        if (p.r > 6) glyph(c, k % 2 ? '7' : '6', p.x, p.y, p.r * 1.25, '#fff6e0', Math.atan2(dy, dx) + Math.PI / 2);
      });
    };
  }
  V9_HEADS[KIND] = (c, sn, H, out, fill, t) => {
    const R = G.room && G.room.h67, b = R ? beatOf(R) : t * 2, f = frac(b);
    // a gold chain round the neck with a 67 medallion
    c.strokeStyle = GOLD; c.lineWidth = 2.6; c.setLineDash([3, 2]);
    c.beginPath(); c.arc(-H * 0.55, 0, H * 0.95, Math.PI * 0.55, Math.PI * 1.45); c.stroke(); c.setLineDash([]);
    c.fillStyle = GOLD; c.beginPath(); c.arc(-H * 1.35, 0, H * 0.38, 0, TAU); c.fill();
    c.save(); c.translate(-H * 1.35, 0); c.rotate(Math.PI / 2); c.font = `900 ${H * 0.42}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a2a00'; c.fillText('67', 0, 1); c.restore();
    oval9(c, 0, 0, H * 1.06, H * 1.0, out, fill, 2.4);
    // a purple flat cap seen from above, brim forward
    c.fillStyle = COL7; ell(c, -H * 0.42, 0, H * 0.58, H * 0.7); c.fill();
    c.fillStyle = '#7a2ad8'; ell(c, H * 0.08, 0, H * 0.24, H * 0.6); c.fill();
    c.fillStyle = GOLD; circle(c, -H * 0.45, 0, H * 0.1);
    // shutter shades that flash on the beat
    const fl = Math.pow(1 - f, 3);
    for (const s of [-1, 1]) {
      c.fillStyle = '#140420'; rrect(c, H * 0.48, s * H * 0.42 - H * 0.2, H * 0.36, H * 0.4, 2); c.fill();
      c.fillStyle = rgba(s < 0 ? COL6 : COL7, 0.5 + 0.5 * fl);
      for (let i = 0; i < 3; i++) c.fillRect(H * 0.5, s * H * 0.42 - H * 0.16 + i * H * 0.13, H * 0.32, H * 0.06);
    }
    // a wide grin
    c.strokeStyle = '#140420'; c.lineWidth = 2; c.beginPath(); c.arc(H * 0.55, 0, H * 0.34, -0.9, 0.9); c.stroke();
  };
  {
    const dft0 = drawFloorThings;
    drawFloorThings = function (c, room, t) { dft0(c, room, t); if (room.h67) safe(() => drawFloor67(c, room, t)); };
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) { dv0(c, t); const room = G.room; if (room && room.h67) safe(() => drawAbove67(c, room, t)); };
    const dg0 = drawGlow3;
    drawGlow3 = function (c, room, t) { dg0(c, room, t); if (room.h67) safe(() => drawGlow67(c, room, t)); };
  }

  /* ------------------------------------------------------------------ the screen: zoom on the beat, the camera rocks, rainbow, the HUD */
  let tmp = null;
  function post(c, H) {
    const calm = REDUCED || (Save.data.settings && Save.data.settings.shake === false);
    const b = beatOf(H), f = frac(b), hot = H.mode67 > 0, st = H.stage;
    if (!calm && !H.done && H.intro <= 0) {
      const z = (hot ? 0.055 : st >= 3 ? 0.03 : 0.016) * Math.pow(1 - f, 3) + (hot ? 0.06 : st >= 3 ? 0.05 : 0) + H.hitPop * 0.01;
      const a = (hot ? 0.05 : st >= 3 ? 0.03 : 0) * Math.sin(b * Math.PI);
      if (z > 0.002 || Math.abs(a) > 0.001) {
        const cv = c.canvas, w = cv.width, h = cv.height;
        if (!tmp) tmp = document.createElement('canvas');
        if (tmp.width !== w || tmp.height !== h) { tmp.width = w; tmp.height = h; }
        const x = tmp.getContext('2d');
        x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.drawImage(cv, 0, 0);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = (G.levelDef && G.levelDef.void) || '#000'; c.fillRect(0, 0, w, h);
        c.translate(w / 2, h / 2); c.rotate(a); c.scale(1 + z, 1 + z); c.drawImage(tmp, -w / 2, -h / 2);
        c.restore();
      }
    }
    c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    const W = View.W, Hh = View.H;
    // beat flash on the edges
    if (H.flash > 0 && !H.done) {
      const g = c.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.3, W / 2, Hh / 2, Math.max(W, Hh) * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(H.flashCol, Math.min(0.5, 0.22 * H.flash * (hot ? 1.8 : 1))));
      c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    }
    if (hot) {
      // rainbow wash and giant 67s behind everything
      c.globalCompositeOperation = 'overlay';
      const sh = (G.t * 260) % (W * 2);
      const lg = c.createLinearGradient(-W + sh, 0, sh, Hh);
      NEON.forEach((col, i) => lg.addColorStop(i / (NEON.length - 1), rgba(col, 0.32)));
      c.fillStyle = lg; c.fillRect(0, 0, W, Hh);
      c.globalCompositeOperation = 'source-over';
      const big = Math.min(W, Hh) * 0.42 * (1 + 0.1 * Math.pow(1 - f, 3));
      c.globalAlpha = 0.16; glyph(c, '67', W / 2, Hh / 2, big, '#ffffff', Math.sin(b * Math.PI) * 0.12); c.globalAlpha = 1;
      // the timer
      c.font = `900 ${Math.round(Math.min(W, Hh) * 0.05)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillStyle = '#140420'; c.fillText('SIX SEVEN MODE  ' + H.mode67.toFixed(1), W / 2 + 2, 62);
      c.fillStyle = NEON[Math.floor(G.t * 12) % NEON.length]; c.fillText('SIX SEVEN MODE  ' + H.mode67.toFixed(1), W / 2, 60);
    }
    // the intro: 6, 7, SIX SEVEN
    if (H.intro > 0) {
      const it = H.introT, m = Math.min(W, Hh);
      c.fillStyle = `rgba(10,2,20,${0.55 * Math.min(1, H.intro / 0.4)})`; c.fillRect(0, 0, W, Hh);
      const show = (txt, t0, col, size) => {
        const u = it - t0; if (u < 0 || u > 0.95) return;
        const s = u < 0.12 ? 2.2 - u * 10 : 1 + (u - 0.12) * 0.12;
        c.globalAlpha = u > 0.75 ? 1 - (u - 0.75) / 0.2 : 1;
        glyph(c, txt, W / 2 + (txt === '6' ? -m * 0.12 : txt === '7' ? m * 0.12 : 0), Hh / 2, size * s, col, txt === '6' ? -0.12 : txt === '7' ? 0.12 : 0);
        c.globalAlpha = 1;
      };
      show('6', 0.05, COL6, m * 0.4); show('7', 0.95, COL7, m * 0.4);
      if (it > 1.85) { show('SIX SEVEN', 1.85, GOLD, m * 0.16); }
    }
    // the hype meter and the beat
    if (!H.done && H.intro <= 0) hud(c, H, W, Hh, f, b);
    c.restore();
  }
  function hud(c, H, W, Hh, f, b) {
    const w = Math.min(340, W * 0.6), x = (W - w) / 2, y = Hh - 86, hot = H.mode67 > 0;
    c.fillStyle = 'rgba(12,4,20,0.78)'; rrect(c, x - 10, y - 22, w + 20, 46, 8); c.fill();
    c.strokeStyle = rgba(hot ? NEON[Math.floor(G.t * 12) % NEON.length] : GOLD, 0.6); c.lineWidth = 1.5; rrect(c, x - 9.5, y - 21.5, w + 19, 45, 8); c.stroke();
    c.font = `800 12px ${UIF}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = GOLD; c.fillText(hot ? 'SIX SEVEN MODE' : 'HYPE', x, y - 10);
    c.textAlign = 'right'; c.fillStyle = 'rgba(236,226,212,0.75)';
    c.fillText(hot ? '2.2x DAMAGE' : `${Math.round(H.bpm)} BPM   STAND ON GOLD ON THE BEAT`, x + w, y - 10);
    const v = hot ? H.mode67 / MODE_T : H.hype;
    c.fillStyle = '#20102c'; rrect(c, x, y, w, 10, 5); c.fill();
    const g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, COL6); g.addColorStop(0.5, GOLD); g.addColorStop(1, COL7);
    c.fillStyle = g; rrect(c, x, y, Math.max(6, w * v), 10, 5); c.fill();
    for (let i = 1; i < 6; i++) { c.fillStyle = 'rgba(12,4,20,0.6)'; c.fillRect(x + (w * i) / 6, y, 1.2, 10); }
    // four beat lights: the lit one is now
    const n = ((Math.floor(b) % 4) + 4) % 4;
    for (let i = 0; i < 4; i++) {
      const cx = W / 2 + (i - 1.5) * 22, on = i === n, r = on ? 4.5 + 2.5 * Math.pow(1 - f, 2) : 3.5;
      c.fillStyle = on ? (i % 2 ? COL7 : COL6) : 'rgba(236,226,212,0.25)'; c.beginPath(); c.arc(cx, y + 18, r, 0, TAU); c.fill();
    }
  }
  {
    const rr0 = renderRoom;
    renderRoom = function (c, L) {
      rr0.apply(this, arguments);
      const H = G.room && G.room.h67;
      if (H && (!H.done || H.outro > 0)) safe(() => post(c, H));
    };
  }

  /* ================================================================== Doot67: the live track */
  const Doot67 = (() => {
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    // an original trap hook in F minor: four bars of sixteen steps
    const LEAD = [
      { 0: 77, 3: 77, 6: 73, 8: 75, 10: 72 },
      { 0: 77, 3: 77, 6: 73, 8: 75, 12: 80 },
      { 0: 77, 3: 77, 6: 73, 8: 75, 10: 72, 12: 70 },
      { 0: 68, 2: 68, 4: 70, 6: 72, 8: 73, 10: 72, 12: 70, 14: 68 },
    ];
    const ROOT = [29, 25, 27, 24];
    function create(ctx, dest) {
      const sr = ctx.sampleRate;
      const gain = (v, to) => { const g = ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; };
      const out = gain(0.0001, dest);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.15; comp.connect(out);
      const mix = gain(0.8, comp);
      const nbuf = ctx.createBuffer(1, sr, sr);
      { const d = nbuf.getChannelData(0); let a = 0x67676767; for (let i = 0; i < d.length; i++) { a = (a * 1664525 + 1013904223) >>> 0; d[i] = a / 2147483648 - 1; } }
      const dist = ctx.createWaveShaper(); { const cv = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; cv[i] = Math.tanh(3 * x); } dist.curve = cv; }
      const bassBus = gain(0.9, mix); dist.connect(bassBus);
      let last = null, dead = false;
      function env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
      function osc(type, f, t, dur, v, to, f2) {
        const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.6);
        const g = ctx.createGain(); env(g, t, 0.004, dur, v); o.connect(g); g.connect(to || mix); o.start(t); o.stop(t + dur + 0.05);
        return o;
      }
      function noise(t, dur, v, type, f, q, to) {
        const s = ctx.createBufferSource(); s.buffer = nbuf;
        const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7;
        const g = ctx.createGain(); env(g, t, 0.002, dur, v); s.connect(fl); fl.connect(g); g.connect(to || mix); s.start(t, (t * 7.3) % 0.8); s.stop(t + dur + 0.05);
      }
      const kick = (t, v) => { osc('sine', 160, t, 0.32, 0.9 * v, mix, 42); noise(t, 0.02, 0.25 * v, 'highpass', 3000); };
      const clap = (t, v) => { for (let i = 0; i < 3; i++) noise(t + i * 0.011, i < 2 ? 0.02 : 0.16, 0.45 * v, 'bandpass', 1500, 1.2); };
      const hat = (t, v, open) => noise(t, open ? 0.14 : 0.03, 0.18 * v, 'highpass', 8000, 0.8);
      const bass = (t, m, dur, slide) => { const o = osc('sine', mtof(m), t, dur, 0.85, dist); if (slide) o.frequency.exponentialRampToValueAtTime(mtof(m + slide), t + dur * 0.5); };
      const lead = (t, m, dur, v) => { osc('square', mtof(m), t, dur, 0.07 * v, mix); osc('triangle', mtof(m + 12), t, dur * 0.8, 0.09 * v, mix); };
      // a robot voice: s, a vowel through two formants, and for seven a v and an n
      function vowel(t, dur, f0, F1, F2, v) {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 0.9, t + dur);
        const g = ctx.createGain(); env(g, t, 0.01, dur, v);
        for (const [F, q, k] of [[F1, 6, 1], [F2, 9, 0.6]]) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = F; b.Q.value = q; o.connect(b); b.connect(gain(k, g)); }
        g.connect(mix); o.start(t); o.stop(t + dur + 0.05);
      }
      function say(t, w, v) {
        noise(t, 0.07, 0.35 * v, 'highpass', 5200, 0.8);
        if (w === 6) { vowel(t + 0.06, 0.11, 230, 390, 2100, 1.6 * v); noise(t + 0.17, 0.03, 0.3 * v, 'bandpass', 2500, 2); noise(t + 0.2, 0.08, 0.3 * v, 'highpass', 5200, 0.8); }
        else { vowel(t + 0.06, 0.12, 215, 600, 1850, 1.6 * v); vowel(t + 0.19, 0.04, 140, 300, 1200, 0.8 * v); vowel(t + 0.24, 0.14, 180, 480, 1600, 1.3 * v); }
      }
      function step(i, t, spb, st, hot) {
        const s = i % 16, bar = Math.floor(i / 16) % 4, d16 = spb / 4;
        // drums
        const K = st >= 3 || hot ? [0, 3, 6, 8, 10, 12] : st === 2 ? [0, 3, 6, 10] : [0, 10];
        if (K.includes(s)) kick(t, s === 0 ? 1 : 0.85);
        if ((st >= 3 || hot) ? (s === 4 || s === 12) : s === 8) clap(t, 1);
        const roll = (st >= 2 || hot) && ((bar === 3 && s >= 12) || (st >= 3 && s === 14));
        if (roll) { for (let k = 0; k < 3; k++) hat(t + (k * d16) / 3, 0.7); }
        else if (st >= 2 || hot || s % 2 === 0) hat(t, s % 4 === 2 ? 1 : 0.6, s === 14 && bar % 2 === 1);
        // 808
        if (s === 0 || s === 7 || s === 10 || ((st >= 3 || hot) && s === 14)) bass(t, ROOT[bar] + (s === 14 ? 12 : 0), d16 * (s === 0 ? 6 : 3), s === 10 && bar === 3 ? -5 : 0);
        // the hook
        const m = LEAD[bar][s];
        if (m) { lead(t, m, d16 * 1.6, st >= 2 || hot ? 1 : 0.75); if (st >= 3 || hot) lead(t, m + 12, d16 * 1.2, 0.5); }
        // the voice: six on the one, seven on the three in the last stage and in the mode, every bar
        if ((hot || st >= 3) && (s === 0 || s === 8)) say(t, s === 0 ? 6 : 7, hot ? 1 : 0.8);
        else if (st === 2 && bar % 2 === 1 && (s === 0 || s === 8)) say(t, s === 0 ? 6 : 7, 0.7);
      }
      return {
        tick(beat, bpm, st, hot) {
          if (dead) return;
          const spb = 60 / bpm, cur = beat * 4, ahead = cur + (0.12 / spb) * 4;
          if (last == null || cur < last - 8) last = Math.floor(cur) - 1;
          while (last + 1 <= ahead) {
            last++;
            const t = ctx.currentTime + Math.max(0, ((last - cur) / 4) * spb);
            if (last >= 0) step(last, t, spb, st, hot);
          }
        },
        count(t, w) { say(ctx.currentTime + (t || 0), w, 1.1); kick(ctx.currentTime + (t || 0), 1); },
        setVol(v) { out.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, 0.2); },
        finale() {
          const t = ctx.currentTime + 0.05;
          say(t, 6, 1.2); say(t + 0.45, 7, 1.2); kick(t, 1); kick(t + 0.45, 1); bass(t + 0.45, 29, 2, -12);
          noise(t + 0.45, 2.2, 0.4, 'highpass', 3000, 0.5);
          this.stop(3.5);
        },
        stop(fade) { if (dead) return; dead = true; out.gain.setTargetAtTime(0.0001, ctx.currentTime, Math.max(0.05, fade / 4)); setTimeout(() => { try { out.disconnect(); } catch (e) { /* gone */ } }, fade * 1000 + 400); },
      };
    }
    return { create };
  })();
  // drives the track from the fight; local audio only, it never touches the simulation
  const M = { inst: null, owned: false, room: null, intro: 0 };
  const vol = () => { const O = window.__bitten && window.__bitten.OPTS7; return 0.7 * (O && O.bossVol != null ? O.bossVol : 0.75); };
  function release(fade, win) {
    const I = M.inst; M.inst = null;
    if (I) { if (win) I.finale(); else I.stop(fade); }
    if (M.owned) { window.__jukebox = false; M.owned = false; }
    if (G.state === 'play' && G.levelDef && !DJ.on) setTimeout(() => { if (!M.inst && !DJ.on && G.state === 'play' && !Sfx.drone && G.levelDef && !window.__jukebox) safe(() => Sfx.startDrone(G.levelDef.set)); }, (win ? 4 : fade) * 1000 + 200);
  }
  function tick() {
    const room = G.room, H = room && room.h67, c = Sfx.ctx;
    const live = !!(H && !H.done && H.sn && H.sn.alive);
    const want = live && (G.state === 'play' || G.state === 'pause') && Sfx.on && c && Save.data.settings.music !== false && vol() > 0 && !(window.__jukebox && !M.owned);
    if (!want) {
      if (M.inst) release(G.state === 'play' ? 1 : 0.4, !!(M.room && M.room.h67 && M.room.h67.done && G.state === 'play' && G.room === M.room));
      M.room = null;
      return;
    }
    if (!M.inst) {
      M.inst = Doot67.create(c, Sfx.master); M.room = room; M.intro = 0;
      if (!window.__jukebox) { window.__jukebox = true; M.owned = true; }
      Sfx.stopDrone && Sfx.stopDrone();
    }
    const I = M.inst;
    I.setVol(vol() * (G.state === 'pause' ? 0.35 : 1));
    if (H.intro > 0) {
      // the count in: six at the first slam, seven at the second
      if (M.intro < 1 && H.introT >= 0.02) { M.intro = 1; I.count(0.03, 6); }
      if (M.intro < 2 && H.introT >= 0.92) { M.intro = 2; I.count(0.03, 7); }
      return;
    }
    if (G.state === 'play') I.tick(H.beat, H.bpm, H.stage, H.mode67 > 0);
  }
  Sched.every('audio', 'v14.7 six seven track', () => safe(tick));

  /* ================================================================== codes, guide */
  safe(() => {
    const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${name}</b><span class="size">${size}</span><span>${txt}</span></figcaption></figure>`;
    const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
    if (decks[1]) decks[1].insertAdjacentHTML('beforeend', fig(KIND, 'SIX SEVEN', 'Hidden stage boss', 'A rhythm fight. Everything lands on the beat: two giant hands, a 6 and a 7, slam where you stand, then laser lines and falling 67s. It vibes, so it takes 60% damage. Stand on the gold pads ON the beat to fill the hype. Full hype: SIX SEVEN MODE, 6.7 seconds of 2.2x damage while it is stuck dancing.'));
    const modes = document.querySelector('#tab-modes ul.rooms9');
    if (modes) modes.insertAdjacentHTML('beforeend', `<li><i style="background:${COL6}" aria-hidden="true"></i><b>SIX SEVEN</b><span>A rare hidden stage off a fight room from floor 2. Neon floor, speakers, a crowd of hands, and a boss that fights on the beat. Code 67 puts one on every floor.</span></li>`);
  });
  Object.assign(window.__bitten || (window.__bitten = {}), { H67: { CFG, TYPE, KIND, BPM, makeH, startMode, start67, build67, Doot67, track: M, err: () => ERR14 } });
})();
