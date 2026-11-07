/* src/51-v107-wals.js: v10.7: noodles, De Wals (and its MP3 track), big screen HUD, settings. From v10.7. Lines 22488 to 23183 of the v13.7 script. */
/* ===== v10.7: noodles, De Wals, big-screen HUD, more settings and run tweaks ===== */
(function () {
  'use strict';
  const safe = (f) => { try { return f(); } catch (e) { errNote14(e, 'safe51'); console.error(e); } };

  /* ---------------- settings that live next to the save (the save only keeps on/off switches) */
  const OPT_KEY = 'bitten-v107-opts';
  const OPT_DEF = { hud: 'auto', bossVol: 0.75, fps: 0 };
  const OPTS = Object.assign({}, OPT_DEF);
  try { const o = JSON.parse(localStorage.getItem(OPT_KEY) || '{}'); for (const k in OPT_DEF) if (o[k] != null && typeof o[k] === typeof OPT_DEF[k]) OPTS[k] = o[k]; } catch (e) { /* private window */ }
  const storeOpts = () => { try { localStorage.setItem(OPT_KEY, JSON.stringify(Object.assign({}, OLD || {}, OPTS))); } catch (e) { /* ignore */ } };

  /* ================================================================ the noodles */
  KINDS.noodle = {
    name: 'Noodle', hp: 1.5, headR: 3.6, r0: 2.9, r1: 1.4, spacing: 3, maxLen: 6, minLen: 3, speed: 180, turn: 7.5, bite: 1,
    body: '#ecdcaa', body2: '#e0cd94', outline: '#3a2a12', hi: 'rgba(255,250,230,0.45)', blood: '#e8d48a', eye: '#ff3b3b',
  };
  V9_HEADS.noodle = (c, sn, H, out, fill) => {
    c.fillStyle = out; ell(c, 0, 0, H * 1.3 + 1, H + 1); c.fill();
    c.fillStyle = fill; ell(c, 0, 0, H * 1.3, H); c.fill();
    c.fillStyle = sn.K.eye; circle(c, H * 0.55, -H * 0.45, 1.1); circle(c, H * 0.55, H * 0.45, 1.1);
  };
  AI.noodle = function (sn, room, dt) {
    const P = G.player, dx = P.x - sn.x, dy = P.y - sn.y, d = Math.hypot(dx, dy) || 1;
    sn.wig += dt * 15;
    if (sn.nipCd > 0) sn.nipCd -= dt;
    let desired = Math.atan2(dy, dx) + Math.sin(sn.wig) * 0.55, sp = sn.K.speed * (sn.maxLen > 20 ? 0.88 : 1);
    if (P.dying > 0 || P.escaping > 0) desired = sn.ang + Math.sin(sn.wig);
    sn.lungeCd -= dt;
    if (sn.lunge > 0) { sn.lunge -= dt; sp *= 1.75; }
    else if (d < 130 && sn.lungeCd <= 0) { sn.lunge = 0.22; sn.lungeCd = rnd(1.1, 1.9); sn.ang = Math.atan2(dy, dx); }
    steerMove(sn, room, desired, sp, sn.lunge > 0 ? 9 : sn.K.turn, dt);
  };
  /* pops out of nowhere: tiny, medium or absurdly long */
  /* a noodle only gets one bite in, then it needs 2.5 seconds before it can bite again */
  const cp0 = Snake.prototype.contactPlayer;
  Snake.prototype.contactPlayer = function (room) {
    if (this.kind !== 'noodle') return cp0.apply(this, arguments);
    if (this.nipCd > 0) return;
    const P = G.player, hp = P.hp, inv = P.inv;
    const r = cp0.apply(this, arguments);
    if (P.hp < hp || P.inv > inv) this.nipCd = 2.5;
    return r;
  };
  function spawnNoodles(room, n, near) {
    const P = G.player; if (!P || !room) return;
    const used = new Set();
    for (let i = 0; i < n; i++) {
      const cell = near ? nearestFreeCell(room, clamp(near.x + rnd(-60, 60), 30, RW - 30), clamp(near.y + rnd(-60, 60), 30, RH - 30)) : Game.farCell(room, P, used);
      if (cell.r != null) used.add(cell.r * COLS + cell.c);
      const sn = new Snake('noodle', cell.x, cell.y, { emerge: false, spawnTime: 0.12, delay: i * 0.12, ang: Math.atan2(P.y - cell.y, P.x - cell.x) });
      const r = Math.random(), L = r < 0.55 ? rndi(4, 7) : r < 0.82 ? rndi(12, 18) : rndi(32, 48);
      sn.maxLen = L; sn.minLen = Math.max(3, Math.round(L * 0.4)); sn.len = L;
      room.snakes.push(sn);
      burst(cell.x, cell.y, 8, '#ecdcaa', { speed: 90 });
    }
    Sfx.hiss(0.35);
    if (!G.run.noodleSeen) { G.run.noodleSeen = true; floatText(P.x, P.y - 34, 'NOODLES', '#ecdcaa', true); }
  }

  /* ================================================================ De Wals */
  KINDS.wals = {
    boss: true, name: 'De Wals', hp: 165, headR: 17, r0: 15, r1: 4, spacing: 8, maxLen: 18, minLen: 8, bite: 1, speed: 74, turn: 3.4, noMound: true,
    body: '#3b2a4a', body2: '#33243f', outline: '#0d0612', hi: 'rgba(220,180,255,0.22)', blood: '#ff5ab4', eye: '#ffd23a',
  };
  BOSS_INFO.wals = { title: 'De Wals', sub: 'One, two, three. One, two, three. It never misses a step.' };
  CUSTOM_BOSS9.wals = 1;
  CHAOS_BOSSES9.push('wals');
  RUSH_ORDER.splice(RUSH_ORDER.indexOf('ender') >= 0 ? RUSH_ORDER.indexOf('ender') : RUSH_ORDER.length, 0, 'wals');
  RUSH_SET.wals = 'halls';
  BOSS_ORDER10.push('wals');
  window.__extraBoss = ['wals'];

  BOSS9_INIT.wals = (sn) => { sn.mode = 'waltz'; sn.beat = 2; sn.bt = 0; sn.bars = 0; sn.spinA = 0; sn.dir = 1; sn.callCd = 6; sn.mt = 0; };
  const NOTE = '#ff5ab4';
  function note(sn, a, sp, r) { const v = spawnVenom(sn.x, sn.y, a, sp, NOTE); v.r = r || 5; return v; }
  AI.wals = function (sn, room, dt) {
    const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5, vs = G.levelDef.venomSpeed, B = ph2 ? 0.33 : 0.41;
    sn.mt += dt; sn.wig = (sn.wig || 0) + dt * 3;
    if (sn.mode === 'pirouette') {
      sn.drawAng += dt * 14; sn.spinT = (sn.spinT || 0) - dt;
      if (sn.spinT <= 0) { sn.spinT = ph2 ? 0.07 : 0.09; sn.spinA += 0.42 * sn.dir; for (let k = 0; k < 2; k++) note(sn, sn.spinA + k * Math.PI, vs * 0.62, 4.5); }
      if (sn.mt > (ph2 ? 1.6 : 1.3)) { sn.mode = 'waltz'; sn.mt = 0; sn.bt = 0; sn.beat = 2; sn.dir *= -1; }
      return;
    }
    if (sn.mode === 'dash') {
      steerMove(sn, room, sn.ang, ph2 ? 440 : 380, 0.6, dt);
      if (sn.mt > 0.24) {
        sn.mode = 'waltz';
        const n = ph2 ? 14 : 10, off = rnd(TAU);
        for (let i = 0; i < n; i++) note(sn, off + (i / n) * TAU, vs * 0.68);
        G.shake = Math.max(G.shake, 4);
      }
    } else {
      /* the waltz: it circles you, close and far, in time */
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x), d = dist(sn.x, sn.y, P.x, P.y);
      const desired = toP + (d < 140 ? 1.9 : d > 240 ? 0.35 : 1.2) * sn.dir;
      steerMove(sn, room, desired, sn.K.speed * (ph2 ? 1.3 : 1), sn.K.turn, dt);
    }
    sn.bt += dt;
    if (sn.bt < B) return;
    sn.bt -= B; sn.beat = (sn.beat + 1) % 3;
    if (P.dying > 0) return;
    if (sn.beat === 0) {
      sn.bars++;
      if (sn.bars % 4 === 0) { sn.mode = 'pirouette'; sn.mt = 0; floatText(sn.x, sn.y - 30, 'PIROUETTE', NOTE, true); Sfx.whoosh10 && Sfx.whoosh10(); return; }
      /* ONE: a step, straight at you */
      sn.mode = 'dash'; sn.mt = 0; sn.mouth = 1;
      sn.ang = Math.atan2(P.y + (P.vy || 0) * 0.2 - sn.y, P.x + (P.vx || 0) * 0.2 - sn.x);
      Sfx.hiss(0.6);
    } else {
      /* two, three: a turning arm of notes */
      sn.spinA += 0.55 * sn.dir;
      const arms = ph2 ? 4 : 3;
      for (let k = 0; k < arms; k++) note(sn, sn.spinA + (k / arms) * TAU, vs * 0.8);
      if (ph2 && sn.beat === 2) note(sn, Math.atan2(P.y - sn.y, P.x - sn.x), vs * 1.05, 6);
    }
    if (ph2) {
      sn.callCd -= B;
      if (sn.callCd <= 0) { sn.callCd = 12; if (room.snakes.filter((s) => s.kind === 'noodle' && s.alive).length < 3) spawnNoodles(room, 2, sn); }
      if (!sn.ph2Said) { sn.ph2Said = true; UI.banner('Faster', 'The second half of the waltz. It brought the noodles.', 'curse'); }
    }
  };
  V9_HEADS.wals = (c, sn, H, out, fill, t, flash) => {
    c.fillStyle = out; ell(c, 0, 0, H * 1.22 + 2, H + 2); c.fill();
    c.fillStyle = fill; ell(c, 0, 0, H * 1.22, H); c.fill();
    /* a little crown of notes and two gold eyes */
    c.fillStyle = flash ? '#fff' : '#ffd23a';
    for (const s of [-1, 1]) { circle(c, H * 0.35, s * H * 0.45, H * 0.2); }
    c.fillStyle = '#1a0d00'; for (const s of [-1, 1]) circle(c, H * 0.42, s * H * 0.45, H * 0.08);
    c.strokeStyle = NOTE; c.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(-H * 0.5, i * H * 0.5, H * 0.16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(-H * 0.34, i * H * 0.5); c.lineTo(-H * 0.34, i * H * 0.5 - H * 0.55); c.stroke(); }
  };

  /* ---------------- its own track: the ultra hard Rotten Waltz remix, bass already taken down */
  const WALS_MP3 = 'assets/wals.mp3';            /* T7: was 2.86 MB of base64, now a file fetched on demand */
  const M = { buf: null, loading: false, src: null, g: null, owned: false };
  /* T7: the bytes are fetched once (no AudioContext needed), decoded once, both cached. If the fetch
     fails (file:// in some browsers, offline without cache) it stays failed and the synthesized drone plays. */
  let walsBytes = null;
  function fetchTrack() {
    if (walsBytes) return walsBytes;
    walsBytes = (typeof fetch === 'function' && location.protocol !== 'file:' ? fetch(WALS_MP3) : Promise.reject(new Error('no fetch')))
      .then((r) => { if (!r.ok) throw new Error('wals ' + r.status); return r.arrayBuffer(); });
    walsBytes.catch(() => { M.failed = true; });
    return walsBytes;
  }
  function loadTrack() {
    const c = Sfx.ctx; if (!c || M.buf || M.loading || M.failed) return;
    M.loading = true;
    const bad = () => { M.loading = false; M.failed = true; };
    fetchTrack().then((ab) => {
      const ok = (b) => { M.buf = b; M.loading = false; };
      try { const p = c.decodeAudioData(ab, ok, bad); if (p && p.catch) p.catch(bad); } catch (e) { bad(); }
    }, bad);
  }
  function playTrack() {
    const c = Sfx.ctx; if (!c || !M.buf || M.src) return;
    try {
      const src = c.createBufferSource(); src.buffer = M.buf; src.loop = true;
      const lo = c.createBiquadFilter(); lo.type = 'lowshelf'; lo.frequency.value = 120; lo.gain.value = -3;
      const g = c.createGain(); const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.62 * OPTS.bossVol), t + 0.6);
      src.connect(lo); lo.connect(g); g.connect(Sfx.master); src.start(t + 0.02);
      M.src = src; M.g = g;
      if (!window.__jukebox) { window.__jukebox = true; M.owned = true; }
      Sfx.stopDrone && Sfx.stopDrone();
    } catch (e) { M.src = null; }
  }
  function stopTrack(fade) {
    const c = Sfx.ctx, src = M.src, g = M.g; M.src = null; M.g = null;
    if (M.owned) { window.__jukebox = false; M.owned = false; }
    if (c && src && g) {
      try { const t = c.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.exponentialRampToValueAtTime(0.0001, t + fade); src.stop(t + fade + 0.05); } catch (e) { /* ignore */ }
    }
    if (G.state === 'play' && G.levelDef && !DJ.on) setTimeout(() => { if (!M.src && !DJ.on && G.state === 'play' && !Sfx.drone && G.levelDef) safe(() => Sfx.startDrone(G.levelDef.set)); }, fade * 1000 + 100);
  }
  function musicTick() {
    const b = G.boss;
    const want = !!(b && b.kind === 'wals' && b.alive && b.hp > 0 && (G.state === 'play' || G.state === 'pause') && Sfx.on && Save.data.settings.music !== false && OPTS.bossVol > 0);
    /* T7: start early on a floor whose boss is De Wals, so the track is ready when the fight starts */
    if (!want && !M.buf && !M.failed && G.levelDef && G.levelDef.boss === 'wals' && (G.state === 'play' || G.state === 'pause')) { if (Sfx.ctx) loadTrack(); else fetchTrack(); }
    if (want) { if (!M.buf) loadTrack(); else if (!M.src) playTrack(); else if (M.g && Sfx.ctx) M.g.gain.setTargetAtTime(0.62 * OPTS.bossVol, Sfx.ctx.currentTime, 0.2); }
    else if (M.src) stopTrack(G.state === 'play' ? 1.4 : 0.4);
  }

  /* ---------------- where De Wals turns up */
  const sd0 = Game.scaleDef;
  Game.scaleDef = function (base, i) {
    let d = sd0.apply(this, arguments);
    if (d && d.boss && G.mode !== 'story' && G.mode !== 'rush' && G.mode !== 'daily' && G.mode !== 'custom') {
      const last = G.mode === 'arcade' ? i === LEVELS.length - 1 : G.mode === 'endless' ? i % 5 === 4 : false;
      const w = RP('wals');
      if (w === 'every' || (w === 'final' && last) || (w === 'rare' && last && Math.random() < 0.25)) d = Object.assign({}, d, { boss: 'wals' });
    }
    return d;
  };
  if (typeof bossHpK === 'function') { const bh0 = bossHpK; bossHpK = function () { return bh0() * RP('bossHp'); }; }

  /* ---------------- every frame */
  Hooks.layer('Game.update', 'v10.7 noodles', function (next, dt) {
    next.call(this, dt);
    safe(() => {
      const room = G.room, P = G.player;
      if (G.state !== 'play' || !room || !P || !G.run) return;
      const lvl = RP('noodles');
      if (!lvl || G.boss || room.locked === false) return;
      const fight = room.snakes.some((s) => s.alive && s.kind !== 'noodle' && !s.isBoss);
      if (!fight) return;
      G.run.noodleT = (G.run.noodleT == null ? 8 : G.run.noodleT) - dt * (lvl === 2 ? 2.4 : 1);
      if (G.run.noodleT > 0) return;
      G.run.noodleT = rnd(14, 22);
      if (Math.random() < (lvl === 2 ? 0.7 : 0.3) && room.snakes.length < 14) spawnNoodles(room, lvl === 2 ? rndi(1, 3) : rndi(1, 2));
    });
  });

  /* ================================================================ big screens: a bigger HUD and room for it */
  function hudK() {
    const v = OPTS.hud;
    if (v !== 'auto') return +v || 1;
    if (View.portrait) return 1;
    return clamp(Math.min(View.W / 1300, View.H / 780), 1, 1.9);
  }
  function scaled(fn) {
    return function () {
      const k = hudK();
      if (k === 1) return fn.apply(this, arguments);
      const V = View, sv = [V.W, V.H, V.ox, V.oy, V.s, V.dpr];
      V.W /= k; V.H /= k; V.ox /= k; V.oy /= k; V.s /= k; V.dpr *= k;
      try { return fn.apply(this, arguments); } finally { V.W = sv[0]; V.H = sv[1]; V.ox = sv[2]; V.oy = sv[3]; V.s = sv[4]; V.dpr = sv[5]; }
    };
  }
  renderHUD = scaled(renderHUD);
  renderInfoCard = scaled(renderInfoCard);
  const lay0 = View.layout;
  View.layout = function () {
    lay0.call(this);
    if (this.portrait) return;
    const k = hudK(); if (k <= 1) return;
    const W = this.W, H = this.H, side = Math.min(178 * k, W * 0.22);
    const s = Math.max(0.3, Math.min((W - side * 2) / VIEW_W, (H - 20) / VIEW_H));
    if (s >= this.s) return;
    this.s = s; this.ox = (W - VIEW_W * s) / 2; this.oy = (H - VIEW_H * s) / 2;
    this.darkK = Math.min(s * this.dpr, 1.6);
    this.dark.width = Math.max(1, Math.ceil(VIEW_W * this.darkK)); this.dark.height = Math.max(1, Math.ceil(VIEW_H * this.darkK));
    const kk = s * this.dpr; if (kk !== this.heartsK) { this.buildHearts(); this.heartsK = kk; }
    UI.place();
  };

  /* fps counter */
  let fpsN = 0, fpsT = performance.now(), fps = 0;
  const rd0 = render;
  render = function (dt) {
    rd0(dt);
    if (!OPTS.fps) return;
    fpsN++; const now = performance.now(); if (now - fpsT > 500) { fps = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; }
    const c = View.ctx; c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    c.font = '700 12px ' + HUD_FONT; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(View.W / 2 - 26, 2, 52, 16);
    c.fillStyle = fps >= 50 ? '#8fe07a' : fps >= 30 ? '#ffd23a' : '#ff5a5a'; c.fillText(fps + ' FPS', View.W / 2, 4);
  };

  /* ================================================================ Custom Run: your own floors, bosses and rules */
  const MAX_STAGES = 20, MAX_START = 3;
  const BASICS = ['cellar', 'halls', 'market', 'kamer', 'garden'];
  const RARE_SETS = ['bus', 'rook', 'mega', 'arena', 'rave', 'court', 'metro', 'afgrond'];
  const NO_PICK = {};
  const PD = { apples: 0, coins: 0, hearts: 1, dmg: 1, fire: 1, pspeed: 1, speed: 1, bossHp: 1, noodles: 1, rooms: 0, loop: 0 };
  const PG = [
    ['Rules', [
      ['apples', 'Extra apples', [[0, 'None'], [1, '+1'], [2, '+2'], [3, '+3'], [4, '+4']]],
      ['coins', 'Starting coins', [[0, '0'], [15, '15'], [30, '30'], [50, '50'], [100, '100']]],
      ['hearts', 'Heart drops', [[0.5, 'Half'], [1, 'Normal'], [1.5, 'More'], [2, 'Double']]],
      ['dmg', 'Seed damage', [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.5, '150%'], [2, '200%']]],
      ['fire', 'Fire rate', [[0.75, '75%'], [1, '100%'], [1.25, '125%'], [1.5, '150%']]],
      ['pspeed', 'Your speed', [[0.9, '90%'], [1, '100%'], [1.15, '115%'], [1.3, '130%']]],
    ]],
    ['Enemies', [
      ['speed', 'Snake speed', [[0.7, '70%'], [0.85, '85%'], [1, '100%'], [1.15, '115%'], [1.3, '130%'], [1.5, '150%']]],
      ['bossHp', 'Boss health', [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.25, '125%'], [1.5, '150%'], [2, '200%']]],
      ['noodles', 'Noodles', [[0, 'Off'], [1, 'Normal'], [2, 'Storm']]],
    ]],
    ['Run', [
      ['rooms', 'Rooms per floor', [[0, 'Floor default'], [5, '5'], [7, '7'], [9, '9'], [12, '12'], [14, '14']]],
      ['loop', 'After the last stage', [[0, 'Escape'], [1, 'Go on, harder each lap']]],
    ]],
  ];
  const PRESETS = [['classic', 'Classic floors'], ['all', 'Every floor'], ['boss', 'Boss gauntlet'], ['reset', 'Reset all']];

  /* what you have met decides what you can pick */
  const floorBase = (set) => (SET_LEVEL[set] != null ? LEVELS[SET_LEVEL[set]] : floorDef10(set));
  const floorName = (set) => { const b = floorBase(set); return b ? b.name : set; };
  function floorOpen(set) {
    if (!floorBase(set)) return false;
    if (set === 'cellar') return true;
    const D = Save.data, B = D.best || {};
    if ((D.floorsSeen && D.floorsSeen[set]) || D.seen['f:' + set]) return true;
    const k = BASICS.indexOf(set);
    return k > 0 && Math.max(B.level || 0, B.endless || 0) > k;
  }
  const floorList = () => BASICS.concat(RARE_SETS).filter(floorBase);
  const bossList = () => BOSS_ORDER10.filter((k) => BOSS_INFO[k] && !NO_PICK[k]);
  function bossOpen(k) {
    const D = Save.data, B = D.best || {};
    if (D.seen['b:' + k] || (D.stats['boss_' + k] || 0) > 0 || (k === 'pricewar' && (D.stats.boss_pwblue || D.stats.boss_pwyellow))) return true;
    const li = LEVELS.findIndex((L) => L.boss === k);
    if (li >= 0 && Math.max(B.level || 0, B.endless || 0) > li + 1) return true;
    const ri = RUSH_ORDER.indexOf(k);
    return ri >= 0 && (B.rush || 0) > ri;
  }
  const bossName = (k) => (BOSS_INFO[k] && BOSS_INFO[k].title) || (KINDS[k] && KINDS[k].name) || k;
  function bossHome(kind) {
    for (const L of LEVELS) if (L.boss === kind) return L.set;
    for (const s of RARE_SETS) { const d = floorBase(s); if (d && d.boss === kind) return s; }
    return RUSH_SET[kind] || 'cellar';
  }
  const itemOpen = (id) => !!(ITEMS[id] && id !== 'golden' && Save.data.found && Save.data.found[id]);

  /* the saved recipe, always cleaned up before it is used */
  let OLD = null;
  try { OLD = JSON.parse(localStorage.getItem(OPT_KEY) || 'null'); } catch (e) { /* ignore */ }
  function norm() {
    let c = Save.data.cust;
    if (!c || typeof c !== 'object') {
      c = Save.data.cust = { stages: null, p: {}, items: [] };
      if (OLD && typeof OLD === 'object') for (const k in PD) if (typeof OLD[k] === 'number') c.p[k] = OLD[k];
    }
    if (!c.p || typeof c.p !== 'object') c.p = {};
    for (const [, rows] of PG) for (const [k, , opts] of rows) { const v = c.p[k]; c.p[k] = opts.some((o) => o[0] === v) ? v : PD[k]; }
    let st = Array.isArray(c.stages) ? c.stages : null;
    if (!st) st = BASICS.filter(floorOpen).map((set) => ({ set, boss: 'auto', arena: false }));
    const bosses = bossList();
    c.stages = st.slice(0, MAX_STAGES).map((s) => {
      s = s && typeof s === 'object' ? s : {};
      const set = floorBase(s.set) && floorOpen(s.set) ? s.set : 'cellar';
      const boss = s.boss !== 'auto' && bosses.indexOf(s.boss) >= 0 && bossOpen(s.boss) ? s.boss : 'auto';
      return { set, boss, arena: !!s.arena };
    });
    if (!c.stages.length) c.stages = [{ set: 'cellar', boss: 'auto', arena: false }];
    c.items = (Array.isArray(c.items) ? c.items : []).filter((id, i, a) => typeof id === 'string' && itemOpen(id) && a.indexOf(id) === i).slice(0, MAX_START);
    return c;
  }
  function ensureCust() {
    if (!G.run) return null;
    if (!G.run.cust) {
      const c = norm();
      G.run.cust = { stages: c.stages.map((s) => Object.assign({}, s)), n: c.stages.length, loop: !!c.p.loop, p: Object.assign({}, c.p), items: c.items.slice() };
    }
    return G.run.cust;
  }
  /* a run option: the Custom Run recipe in a custom run, the default everywhere else */
  const RP = (k) => { const c = G.mode === 'custom' && G.run && G.run.cust; return c ? c.p[k] : (k === 'wals' ? 'rare' : PD[k]); };

  window.customSummary10 = () => {
    const c = norm(), arenas = c.stages.filter((s) => s.arena).length, n = c.stages.length;
    return `<em>${n}</em> stage${n === 1 ? '' : 's'}${arenas ? `, ${arenas} boss only` : ''}${c.p.loop ? ', no end' : ''}`;
  };

  /* the floors of the run */
  const lb1 = Game.levelBase;
  Game.levelBase = function (i) {
    if (G.mode !== 'custom') return lb1.call(this, i);
    const c = ensureCust(), k = i % c.n, loop = c.loop ? Math.floor(i / c.n) : 0, st = c.stages[k];
    const base = floorBase(st.set) || LEVELS[0];
    const boss = st.boss === 'auto' ? base.boss : st.boss;
    const def = Object.assign({}, base, { boss, set: base.set || st.set, cust10: true });
    if (st.arena) Object.assign(def, { rush: true, rooms: 2, portal: false, name: bossName(boss), sub: 'Pick a powerup, then go through the door.' });
    else if (c.p.rooms) def.rooms = c.p.rooms;
    if (loop) {
      const R = typeof ROMAN !== 'undefined' ? ROMAN : [];
      def.loop = loop; def.tier = Math.min(4, (base.tier || 0) + loop);
      if (!st.arena) def.rooms = def.rooms + Math.min(3, loop);
      def.name = `${def.name} ${R[Math.min(loop, R.length - 1)] || loop + 1}`;
      if (!st.arena) def.sub = 'You have been here before. It got worse.';
    }
    return def;
  };

  /* which bosses you have met */
  const sb0 = Game.startBoss;
  Game.startBoss = function () {
    const k = G.levelDef && G.levelDef.boss;
    const r = sb0.apply(this, arguments);
    safe(() => { if (k && BOSS_INFO[k]) Meta.mark('seen', 'b:' + k); });
    return r;
  };

  /* custom run tweaks at the start of the run */
  Hooks.layer('Game.startRun', 'v10.7 run tweaks', function (next) {
    const r = next.apply(this, [].slice.call(arguments, 1));
    safe(() => {
      if (!G.run) return;
      G.run.noodleT = rnd(10, 16);
      if (G.mode !== 'custom' || !G.player) return;
      const c = ensureCust(), p = c.p, P = G.player;
      if (p.dmg !== 1) P.dmg *= p.dmg;
      if (p.pspeed !== 1) P.speed *= p.pspeed;
      if (p.fire !== 1) P.fireDelay /= p.fire;
      if (p.apples) { P.maxHp = Math.min(20, P.maxHp + p.apples * 2); P.hp = P.maxHp; }
      if (p.coins) G.run.coins = (G.run.coins || 0) + p.coins;
      if (p.hearts !== 1) G.D = Object.assign({}, G.D, { hearts: (G.D.hearts || 1) * p.hearts });
      G.speedK = (G.speedK || 1) * p.speed; G.bossSpeedK = (G.bossSpeedK || 1) * (0.5 + p.speed * 0.5);
      const start = G.map && G.map.start;
      if (start && c.items.length) c.items.forEach((id, k) => {
        G.run.pending.add(id);
        start.pickups.push({ kind: 'item', id, x: RW / 2 + (k - (c.items.length - 1) / 2) * 56, y: RH / 2 - 50, t: 0, gift: 'custom' });
      });
    });
    return r;
  });

  /* ================================================================ Play menu: the builder (v10.18: tighter) */
  safe(() => {
    const st = document.createElement('style');
    st.textContent = `
#play .sheet-inner{max-width:1080px;width:100%;gap:18px}
#play .sheet-head h2{letter-spacing:.02em}
#play h3,.opt10 h3{font:700 12px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin:0 0 10px}
#play .modes{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
#play .mcard{border-radius:3px;padding:14px}
#play .mcard b{font-size:22px}#play .mcard p{font-size:14px}
#play .seg{border-radius:3px}
.opt10 .cgt{font:700 11px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--apple-hi);margin:18px 0 8px}
.opt10 .chip{all:unset;box-sizing:border-box;cursor:pointer;padding:7px 11px;border:1px solid var(--line);border-radius:3px;font:600 13px/1 var(--ui);letter-spacing:.05em;color:var(--muted);transition:background .12s,border-color .12s,color .12s}
.opt10 .chip:hover{border-color:rgba(236,226,212,.4);color:var(--ink)}
.opt10 .chip.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.opt10 .chip:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.opt10 .cr{display:flex;flex-direction:column;gap:6px;padding:8px 0;border-top:1px solid rgba(236,226,212,.07)}
.opt10 .cr>b{font:600 14px/1 var(--ui);letter-spacing:.04em}
.opt10 .chips{display:flex;flex-wrap:wrap;gap:6px}
.opt10{max-width:640px;margin:18px 0 0;text-align:left}

.cust10{container-type:inline-size;border:1px solid var(--line);border-radius:3px;background:rgba(255,255,255,.02);text-align:left;padding:14px;display:flex;flex-direction:column;gap:14px}
.cust10[hidden]{display:none}
.cust10 h3{margin:0!important}
.cust10 button{all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}
.cust10 button:focus-visible,.cust10 select:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.cust10 button[disabled]{opacity:.3;cursor:default}
.c10hd{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 10px}.c10hd h3{white-space:nowrap}
.c10hd small{font:600 11px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.c10stat{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:0}
.c10stat div{border:1px solid var(--line);border-radius:2px;padding:7px 8px;display:flex;flex-direction:column;gap:4px;min-width:0}
.c10stat dd{margin:0;font:700 19px/1 var(--ui);font-variant-numeric:tabular-nums;color:var(--ink);white-space:nowrap}
.c10stat dd small{font-size:12px;color:var(--faint);font-weight:600}
.c10stat dt{font:600 10px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c10stat div.hot dd{color:var(--toffee)}
.c10pre{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:2px;overflow:hidden}
.c10pre button{background:#0e0a09;padding:10px 2px;text-align:center;font:600 12px/1.1 var(--ui);letter-spacing:.04em;white-space:nowrap;text-transform:uppercase;color:var(--muted)}
.c10pre button:hover{color:var(--ink);background:#161110}
.c10sec{display:flex;flex-direction:column;gap:6px}
.c10sec>.c10t{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font:700 11px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--apple-hi);margin:2px 0 2px}
.c10sec>.c10t small{font:600 11px/1 var(--ui);letter-spacing:.08em;text-transform:none;color:var(--faint)}
.c10sec>.c10t button{font:600 11px/1 var(--ui);letter-spacing:.12em;color:var(--faint);padding:4px 0}
.c10sec>.c10t button:hover{color:var(--ink)}
.cust10 ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.cust10 li.c10s{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:6px 8px;align-items:center;padding:7px 8px;border:1px solid rgba(236,226,212,.1);border-left:3px solid var(--sc,#6f6157);border-radius:2px;background:rgba(0,0,0,.18)}
.cust10 li.c10s.arena{border-color:rgba(215,38,61,.45);border-left-color:var(--apple);background:rgba(215,38,61,.06)}
.cust10 li.c10s .n{font:700 16px/1 var(--ui);font-variant-numeric:tabular-nums;color:var(--faint);text-align:center}
.cust10 li.c10s .bs{grid-column:2}
.cust10 li.c10s .ar{grid-column:3}
.cust10 .ic{display:flex;gap:4px}
.cust10 .ic button,.cust10 .ar{height:32px;border:1px solid var(--line);border-radius:2px;display:grid;place-items:center;color:var(--muted)}
.cust10 .ic button{width:30px}
.cust10 .ic button:hover:not([disabled]),.cust10 .ar:hover{border-color:rgba(236,226,212,.4);color:var(--ink)}
.cust10 .ic button.rm:hover:not([disabled]){border-color:var(--apple);color:var(--apple-hi)}
.cust10 .ic svg{width:14px;height:14px}
.cust10 .ar{padding:0 6px;font:600 11px/1 var(--ui);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;width:84px}
.cust10 .ar[aria-pressed="true"]{background:rgba(215,38,61,.22);border-color:var(--apple);color:#fff4ec}
.cust10 select{box-sizing:border-box;width:100%;min-width:0;height:32px;background:rgba(255,255,255,.04);color:var(--ink);border:1px solid var(--line);border-radius:2px;padding:0 6px;font:600 13px/1 var(--ui);text-overflow:ellipsis}
.cust10 option{background:#1a1511;color:#ece2d4}
.cust10 .c10add{height:34px;border:1px dashed var(--line);border-radius:2px;text-align:center;font:600 12px/34px var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.cust10 .c10add:hover:not([disabled]){border-color:rgba(236,226,212,.45);color:var(--ink)}
.cust10 .cr{display:grid;grid-template-columns:minmax(0,1fr);gap:5px;padding:7px 0;border-top:1px solid rgba(236,226,212,.07)}
.cust10 .cr>b{font:600 13px/1 var(--ui);letter-spacing:.04em;color:var(--muted);display:flex;align-items:center;gap:6px}
.cust10 .cr.ch>b{color:var(--toffee)}
.cust10 .cr.ch>b::after{content:"";width:5px;height:5px;border-radius:1px;background:var(--toffee)}
.cust10 .sg{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:2px;overflow:hidden}
.cust10 .sg button{background:#0e0a09;padding:8px 2px;text-align:center;font:600 12px/1 var(--ui);letter-spacing:.03em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.cust10 .sg button:hover{color:var(--ink);background:#161110}
.cust10 .sg button[aria-checked="true"]{background:rgba(215,38,61,.28);color:#fff4ec}
.cust10 .sg button.def:not([aria-checked="true"]){color:var(--ink)}
.cust10 .c10items{display:grid;grid-template-columns:minmax(0,1fr);gap:6px}
.cust10 .c10it{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px;align-items:center}
.cust10 .c10it canvas{width:32px;height:32px;border:1px solid var(--line);border-radius:2px;background:rgba(227,165,74,.06)}
.cust10 .c10it.empty canvas{border-style:dashed;background:none}
.cust10 .c10it small{grid-column:2;font-size:12px;line-height:1.3;color:var(--faint);margin-top:-2px}
.cust10 .c10it small.cl{color:#ff9a7a}
.cust10 .cn{margin:0;font-size:12px;line-height:1.35;color:var(--faint)}
@container (min-width:640px){
 .cust10 li.c10s{grid-template-columns:22px minmax(0,1.1fr) minmax(0,1fr) auto auto}
 .cust10 li.c10s .n{order:0}.cust10 li.c10s .fl{order:1}.cust10 li.c10s .bs{order:2;grid-column:auto}.cust10 li.c10s .ar{order:3;grid-column:auto;width:auto}.cust10 li.c10s .ic{order:4}
}
@container (min-width:500px){.cust10 .cr{grid-template-columns:132px minmax(0,1fr);align-items:center;padding:5px 0}}
@container (max-width:300px){.c10pre{grid-template-columns:repeat(2,minmax(0,1fr))}.c10stat{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1100px){#play.cust-on .sheet-inner{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-content:start;column-gap:28px;row-gap:18px}#play.cust-on .sheet-head{grid-column:1/-1;grid-row:1}#play.cust-on .sheet-inner>.cust10{grid-column:2;grid-row:2/5;align-self:start}#play.cust-on .sheet-inner>div:nth-of-type(2){grid-column:1;grid-row:2}#play.cust-on .sheet-inner>div:nth-of-type(3){grid-column:1;grid-row:3}#play.cust-on .playfoot{grid-column:1;grid-row:4;align-self:start}}
#settings .toggles{max-width:640px}
@media (min-width:1500px) and (min-height:850px){#pauseBtn,#btnPause{transform:scale(1.25);transform-origin:top right}}`;
    document.head.appendChild(st);

    const ICON = {
      up: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 9l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
      dn: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
      rm: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    };
    const play = document.getElementById('play'), inner = play.querySelector('.sheet-inner'), foot = inner.querySelector('.playfoot');
    const box = document.createElement('section'); box.className = 'cust10'; box.id = 'cust10'; box.hidden = true;
    box.setAttribute('aria-label', 'Custom Run builder');
    box.innerHTML = '<div class="c10hd"><h3>Your run</h3><small id="c10open"></small></div>'
      + '<dl class="c10stat" id="c10stat"></dl>'
      + '<div class="c10pre" id="c10pre" role="group" aria-label="Quick setups"></div>'
      + '<div class="c10sec"><div class="c10t">Stages<small id="c10cnt"></small></div><ol id="c10st"></ol><button type="button" class="c10add" id="c10add">Add stage</button></div>'
      + '<div id="c10g"></div>'
      + '<div class="c10sec"><div class="c10t">Start powerups<small id="c10icnt"></small></div><div class="c10items" id="c10items"></div></div>'
      + '<p class="cn" id="c10note"></p>';
    inner.insertBefore(box, foot);
    const $ = (id) => box.querySelector('#' + id);
    const commit = () => { Save.store(); };
    const opt = (v, t, sel, dis) => { const o = document.createElement('option'); o.value = v; o.textContent = t; if (sel) o.selected = true; if (dis) o.disabled = true; return o; };
    const changedRules = (c) => { let n = 0; for (const [, rows] of PG) for (const [k] of rows) if (c.p[k] !== PD[k]) n++; return n; };
    const floorCol = (set) => { const b = floorBase(set); return (b && (b.wallHi || b.floor2)) || '#6f6157'; };

    function summary() {
      const c = norm(), floors = floorList(), bosses = bossList();
      const arenas = c.stages.filter((s) => s.arena).length, rules = changedRules(c);
      $('c10stat').innerHTML = `<div><dt>Stages</dt><dd>${c.stages.length}${c.p.loop ? ' <small>loop</small>' : ''}</dd></div>`
        + `<div><dt>Arenas</dt><dd>${arenas}</dd></div>`
        + `<div class="${rules ? 'hot' : ''}"><dt>Rules</dt><dd>${rules}</dd></div>`
        + `<div class="${c.items.length ? 'hot' : ''}"><dt>Gifts</dt><dd>${c.items.length}<small>/${MAX_START}</small></dd></div>`;
      $('c10open').textContent = `Unlocked: ${floors.filter(floorOpen).length}/${floors.length} floors, ${bosses.filter(bossOpen).length}/${bosses.length} bosses`;
      $('c10cnt').textContent = `${c.stages.length} of ${MAX_STAGES}`;
      $('c10icnt').textContent = `${ITEM_IDS.filter(itemOpen).length} found`;
    }
    function paintStages() {
      const c = norm(), ol = $('c10st'); ol.innerHTML = '';
      const floors = floorList().filter(floorOpen), bosses = bossList().filter(bossOpen);
      c.stages.forEach((s, i) => {
        const li = document.createElement('li'); li.className = 'c10s' + (s.arena ? ' arena' : '');
        li.style.setProperty('--sc', floorCol(s.set));
        li.innerHTML = `<span class="n">${i + 1}</span><select class="fl" aria-label="Stage ${i + 1} floor"></select>`
          + `<div class="ic"><button type="button" class="up" aria-label="Move stage ${i + 1} up">${ICON.up}</button><button type="button" class="dn" aria-label="Move stage ${i + 1} down">${ICON.dn}</button><button type="button" class="rm" aria-label="Remove stage ${i + 1}">${ICON.rm}</button></div>`
          + `<select class="bs" aria-label="Stage ${i + 1} boss"></select><button type="button" class="ar" aria-pressed="${s.arena}">${s.arena ? 'Boss only' : 'Full floor'}</button>`;
        const fl = li.querySelector('.fl'), bs = li.querySelector('.bs'), ar = li.querySelector('.ar');
        for (const f of floors) fl.appendChild(opt(f, floorName(f), f === s.set));
        const home = floorBase(s.set) && floorBase(s.set).boss;
        bs.appendChild(opt('auto', home ? `Boss: ${bossName(home)}` : 'The floor boss', s.boss === 'auto'));
        for (const b of bosses) if (b !== home || s.boss === b) bs.appendChild(opt(b, bossName(b), b === s.boss));
        ar.title = s.arena ? 'Only the boss fight, after a powerup vote' : 'All rooms of the floor, then the boss';
        /* norm() rebuilds the stage objects, so always edit the live one */
        const cur = () => norm().stages[i];
        fl.addEventListener('change', () => { cur().set = fl.value; commit(); paint(); Sfx.blip(); });
        bs.addEventListener('change', () => { cur().boss = bs.value; commit(); summary(); Sfx.blip(); });
        ar.addEventListener('click', () => { const t = cur(); t.arena = !t.arena; commit(); paint(); Sfx.blip(); });
        const up = li.querySelector('.up'), dn = li.querySelector('.dn'), rm = li.querySelector('.rm');
        up.disabled = i === 0; dn.disabled = i === c.stages.length - 1; rm.disabled = c.stages.length <= 1;
        up.addEventListener('click', () => { c.stages.splice(i - 1, 0, c.stages.splice(i, 1)[0]); commit(); paint(); });
        dn.addEventListener('click', () => { c.stages.splice(i + 1, 0, c.stages.splice(i, 1)[0]); commit(); paint(); });
        rm.addEventListener('click', () => { c.stages.splice(i, 1); commit(); paint(); });
        ol.appendChild(li);
      });
      const add = $('c10add'); add.disabled = c.stages.length >= MAX_STAGES;
      add.textContent = add.disabled ? `Full, ${MAX_STAGES} stages` : 'Add stage';
    }
    function paintRules() {
      const c = norm();
      for (const b of box.querySelectorAll('.sg button')) b.setAttribute('aria-checked', String(String(c.p[b.dataset.k]) === b.dataset.v));
      for (const r of box.querySelectorAll('.cr[data-k]')) r.classList.toggle('ch', c.p[r.dataset.k] !== PD[r.dataset.k]);
      for (const g of box.querySelectorAll('.c10sec[data-g]')) {
        const rows = PG.find((x) => x[0] === g.dataset.g)[1], n = rows.filter(([k]) => c.p[k] !== PD[k]).length;
        const rs = g.querySelector('.rs'); rs.hidden = !n; rs.textContent = `Reset ${n}`;
      }
    }
    function iconTo(cv, id) {
      const k = 2, c2 = cv.getContext('2d'); cv.width = 32 * k; cv.height = 32 * k;
      c2.setTransform(k, 0, 0, k, 0, 0); c2.clearRect(0, 0, 32, 32);
      if (id) safe(() => { c2.translate(16, 16); drawItemIcon(c2, id, 24, 0); });
    }
    function paintItems() {
      const c = norm(), wrap = $('c10items'); wrap.innerHTML = '';
      const ids = ITEM_IDS.filter(itemOpen).sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
      const ch = Save.data.char || 'apple';
      for (let k = 0; k < MAX_START; k++) {
        const cur = c.items[k] || '', others = c.items.filter((x, j) => j !== k);
        const row = document.createElement('div'); row.className = 'c10it' + (cur ? '' : ' empty');
        const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); iconTo(cv, cur);
        const sel = document.createElement('select'); sel.setAttribute('aria-label', `Start powerup ${k + 1}`);
        sel.appendChild(opt('', ids.length ? (k > c.items.length ? `Slot ${k + 1}` : 'None') : 'Find powerups first', !cur));
        for (const id of ids) {
          let bad = others.includes(id);
          if (!bad && typeof clashOf10 === 'function') safe(() => { bad = !!clashOf10(id, { char: ch, items: others }); });
          sel.appendChild(opt(id, ITEMS[id].name + (ITEMS[id].rare ? ' ★' : '') + (bad && id !== cur ? ' (clash)' : ''), cur === id, bad && id !== cur));
        }
        sel.disabled = !ids.length || k > c.items.length;
        sel.addEventListener('change', () => {
          const next = c.items.slice(); if (sel.value) next[k] = sel.value; else next.splice(k, 1);
          c.items = next.filter((x, i, a) => x && a.indexOf(x) === i).slice(0, MAX_START); commit(); paintItems(); summary(); Sfx.blip();
        });
        row.append(cv, sel);
        if (cur && ITEMS[cur]) {
          const d = document.createElement('small'); d.textContent = ITEMS[cur].desc; row.appendChild(d);
          let cl = null; if (typeof clashOf10 === 'function') safe(() => { cl = clashOf10(cur, { char: ch, items: others }); });
          if (cl) { d.className = 'cl'; d.textContent = `Clashes with this pick: ${cl.why}`; }
        }
        wrap.appendChild(row);
      }
    }
    function preset(id) {
      const c = norm();
      const mk = (set, boss, arena) => ({ set, boss: boss || 'auto', arena: !!arena });
      if (id === 'classic') c.stages = BASICS.filter(floorOpen).map((s) => mk(s));
      else if (id === 'all') c.stages = floorList().filter(floorOpen).slice(0, MAX_STAGES).map((s) => mk(s));
      else if (id === 'boss') c.stages = bossList().filter(bossOpen).slice(0, MAX_STAGES).map((b) => { const h = bossHome(b); return mk(floorOpen(h) ? h : 'cellar', b, true); });
      else if (id === 'reset') { c.stages = null; c.p = {}; c.items = []; }
      norm(); commit(); paint(); Sfx.blip();
    }
    function build() {
      const pre = $('c10pre');
      const PLAB = { classic: 'Classic', all: 'All floors', boss: 'Gauntlet', reset: 'Reset all' };
      for (const [id, lab] of PRESETS) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = PLAB[id] || lab; b.title = lab;
        b.addEventListener('click', () => preset(id)); pre.appendChild(b);
      }
      $('c10add').addEventListener('click', () => {
        const c = norm(); if (c.stages.length >= MAX_STAGES) return;
        const last = c.stages[c.stages.length - 1];
        c.stages.push({ set: last ? last.set : 'cellar', boss: 'auto', arena: false }); commit(); paint(); Sfx.blip();
      });
      const SHORT = { 'Floor default': 'Auto', 'Go on, harder each lap': 'Loop, harder each lap' };
      const g = $('c10g'); g.className = 'c10rules'; g.style.cssText = 'display:flex;flex-direction:column;gap:14px';
      for (const [title, rows] of PG) {
        const sec = document.createElement('div'); sec.className = 'c10sec'; sec.dataset.g = title;
        sec.innerHTML = `<div class="c10t">${title}<button type="button" class="rs" hidden></button></div>`;
        sec.querySelector('.rs').addEventListener('click', () => { const c = norm(); for (const [k] of rows) c.p[k] = PD[k]; commit(); paintRules(); summary(); Sfx.blip(); });
        for (const [k, name, opts] of rows) {
          const r = document.createElement('div'); r.className = 'cr'; r.dataset.k = k;
          r.innerHTML = `<b>${name === 'After the last stage' ? 'After last stage' : name}</b><div class="sg" role="radiogroup" aria-label="${name}"></div>`;
          const sg = r.querySelector('.sg');
          for (const [v, lab] of opts) {
            const b = document.createElement('button'); b.type = 'button'; b.textContent = SHORT[lab] || lab; b.dataset.k = k; b.dataset.v = String(v);
            b.setAttribute('role', 'radio'); if (v === PD[k]) b.classList.add('def');
            b.addEventListener('click', (e) => { e.preventDefault(); norm().p[k] = v; commit(); paintRules(); summary(); Sfx.blip(); });
            sg.appendChild(b);
          }
          sec.appendChild(r);
        }
        g.appendChild(sec);
      }
      $('c10note').textContent = 'Floors, bosses and powerups open up as you meet them. Wins here do not count as escapes or character wins. Kills, bosses and powerups still count.';
    }
    function paint() { summary(); paintStages(); paintRules(); paintItems(); }
    build();

    const pp0 = UI.paintPlay;
    UI.paintPlay = function () {
      pp0.apply(this, arguments);
      safe(() => { const on = Save.data.mode === 'custom'; box.hidden = !on; play.classList.toggle('cust-on', on); if (on) paint(); });
    };

    /* screen and sound live in Settings */
    const GROUPS7 = [
      ['hud', 'HUD size', [['auto', 'Auto'], ['1', '100%'], ['1.25', '125%'], ['1.5', '150%'], ['2', '200%']]],
      ['bossVol', 'De Wals track', [[0, 'Off'], [0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']]],
      ['fps', 'FPS counter', [[0, 'Off'], [1, 'On']]],
    ];
    const sec = document.createElement('div'); sec.className = 'opt10';
    sec.innerHTML = '<h3>Screen and sound</h3>';
    const paintOpts = () => { for (const b of sec.querySelectorAll('.chip')) b.classList.toggle('on', String(OPTS[b.dataset.k]) === b.dataset.v); };
    for (const [k, name, opts] of GROUPS7) {
      const r = document.createElement('div'); r.className = 'cr'; r.innerHTML = `<b>${name}</b><div class="chips" role="radiogroup" aria-label="${name}"></div>`;
      const ch = r.querySelector('.chips');
      for (const [v, lab] of opts) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = lab; b.dataset.k = k; b.dataset.v = String(v);
        b.setAttribute('role', 'radio');
        b.addEventListener('click', (e) => { e.preventDefault(); OPTS[k] = typeof OPT_DEF[k] === 'number' ? +v : String(v); storeOpts(); paintOpts(); if (G.state !== 'pause') Sfx.blip(); if (k === 'hud') safe(() => View.layout()); });
        ch.appendChild(b);
      }
      sec.appendChild(r);
    }
    const tg = document.getElementById('toggles');
    if (tg) tg.after(sec);
    paintOpts();
  });

  /* the remix is opt-in: one time switch to the old music box, until Music is turned on again */
  safe(() => {
    if (localStorage.getItem('bitten-v108-remix-off')) return;
    localStorage.setItem('bitten-v108-remix-off', '1');
    Save.data.settings.music = false; Save.store(); UI.paintSettings && UI.paintSettings();
  });

  /* ================================================================ the guide */
  safe(() => {
    const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
    const deck = decks[decks.length - 1];
    const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${name}</b><span class="size">${size}</span><span>${txt}</span></figcaption></figure>`;
    if (deck) deck.insertAdjacentHTML('beforeend', fig('noodle', 'Noodle', 'Tiny to absurdly long', 'Thin as a noodle and a bit faster than you. One bite, then it needs a moment. Pops out of nowhere in the middle of a fight. One or two seeds and it is gone. Brief.')
      + fig('wals', 'De Wals', 'Boss Rush, Chaos, sometimes the last lair', 'Moves in threes. ONE: it steps straight at you and leaves a ring of notes. Two, three: a turning arm of notes. Every fourth bar: a pirouette. Past half it speeds up and calls noodles.'));
  });

  /* music runs on its own clock so it also stops on the menu */
  Sched.every('audio', 'v10.7 wals track', () => safe(musicTick));   /* T3 */
  Object.assign(window.__bitten || (window.__bitten = {}), { spawnNoodles, OPTS7: OPTS, cust10: { norm, ensureCust, floorList, bossList, floorOpen, bossOpen, itemOpen, floorBase, NO_PICK, RP }, walsTrack: M, walsLoad: () => { if (!Sfx.ctx) Sfx.init(); loadTrack(); }, walsFetch: fetchTrack });
})();


