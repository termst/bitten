/* src/81-v14-coop.js: v14.0 phase 2, more than one apple in a run. Input sources (M4) and gamepads (T12),
   couch coop slots (M15) with a look per slot (T9), snake targeting (B9), seeds per owner (M3), the shared
   room and its doors (M7), the klokhuis ghost and revive (M8), colours and name tags (S7), HUD rows (M12),
   balance (B1 to B8) and the bookkeeping for the run recap (F9). With one apple none of this runs. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'coop'); return fb; } };
  const B = window.__bitten = window.__bitten || {};
  const COL = ['#e8403a', '#3a8ee8', '#e8c83a', '#4ac85a'];
  const NAMES = ['P1', 'P2', 'P3', 'P4'];
  const T = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s);
  const LINES = ['Coop', 'Couch', 'Online', 'Keyboard and mouse', 'Gamepad', 'Press A on a gamepad to join', 'Keyboard and mouse is one apple. Every gamepad is one more. Up to four, one screen, one room.',
    'Start', 'Back', 'Remove', 'Character', 'Look', 'Name', 'Nobody pressed A yet. You can still play alone.', 'KLOKHUIS', 'BACK IN', 'One per apple', 'You already took one. Leave it for the others.',
    'The door waits for everyone', 'Everyone in?', 'Play with friends: on this screen or online.', 'Host paused'];
  safe(() => { for (const s of LINES) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s); });

  /* ================================================================ input sources (M4) */
  class KeyboardMouseSource {
    constructor() { this.kind = 'kbm'; this.intQ = false; }
    moveVec() { return Input.moveVec(); }
    aimVec(px, py) { return Input.aimVec(px, py); }
    dash() { const w = Input.dashReq; Input.dashReq = false; return w; }
    interact() { const w = this.intQ; this.intQ = false; return w; }
  }
  const DZ_MOVE = 0.15, DZ_AIM = 0.22;
  const stick = (x, y, dz) => { const m = Math.hypot(x, y); if (m < dz) return null; const k = Math.min(1, (m - dz) / (1 - dz)) / m; return { x: x * k, y: y * k, m }; };
  class GamepadSource {
    constructor(index) { this.kind = 'pad'; this.index = index; this.gp = null; this.prev = []; this.dashQ = false; this.intQ = false; this.startQ = false; }
    poll(gp) {
      this.gp = gp; if (!gp) return;
      const b = gp.buttons.map((x) => !!(x && (x.pressed || x.value > 0.5)));
      const edge = (i) => b[i] && !this.prev[i];
      if (edge(0) || edge(5)) this.dashQ = true;            // A or RB dashes
      if (edge(2)) this.intQ = true;                        // X interacts (a ghost pings)
      if (edge(9)) this.startQ = true;                      // Start pauses
      this.prev = b;
    }
    moveVec() {
      const gp = this.gp; if (!gp) return { x: 0, y: 0 };
      const s = stick(gp.axes[0] || 0, gp.axes[1] || 0, DZ_MOVE);
      if (s) return { x: s.x, y: s.y };
      const bt = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      let x = (bt(15) ? 1 : 0) - (bt(14) ? 1 : 0), y = (bt(13) ? 1 : 0) - (bt(12) ? 1 : 0);
      if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l }; }
      return { x: 0, y: 0 };
    }
    aimVec() {
      const gp = this.gp;
      const s = gp ? stick(gp.axes[2] || 0, gp.axes[3] || 0, DZ_AIM) : null;
      if (s) { const l = Math.hypot(s.x, s.y) || 1; return { x: s.x / l, y: s.y / l, touch: false }; }
      // auto aim (v13.3) works per source: the same picker, for this apple
      const A = B.autoaim133;
      if (A && A.isOn && A.isOn()) {
        const P = G.player, b = safe(() => A.pick());
        if (b && P) { const dx = b.x - P.x, dy = b.y - P.y, l = Math.hypot(dx, dy) || 1; return { x: dx / l, y: dy / l, touch: false, auto: true }; }
      }
      return null;
    }
    dash() { const w = this.dashQ; this.dashQ = false; return w; }
    interact() { const w = this.intQ; this.intQ = false; return w; }
    rumble(ms, strong) {
      const gp = this.gp, a = gp && gp.vibrationActuator;
      if (!a || Save.data.settings.vibrate === false) return;
      safe(() => a.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: Math.min(1, strong + 0.2) }));
    }
  }
  const Pads = { src: new Map(), any: [] };
  const padFor = (i) => { let s = Pads.src.get(i); if (!s) { s = new GamepadSource(i); Pads.src.set(i, s); } return s; };
  Object.assign(B, { input14: { KeyboardMouseSource, GamepadSource, padFor, Pads } });

  /* the one 'input' phase task: poll every pad; drive single player and the menus with them (T12) */
  const NAV = { prev: {} };
  function connectedPads() { const out = []; const L = safe(() => (navigator.getGamepads ? navigator.getGamepads() : []), []) || []; for (const gp of L) if (gp && gp.connected !== false) out.push(gp); return out; }
  Sched.every('input', 'v14 gamepads', () => {
    const L = connectedPads(); Pads.any = L;
    for (const gp of L) padFor(gp.index).poll(gp);
    const solo = !MP14.on;
    for (const gp of L) {
      const s = padFor(gp.index);
      if (G.state === 'play') {
        if (solo) { if (s.dashQ) { Input.dashReq = true; s.dashQ = false; } }
        if (s.startQ) { s.startQ = false; const owner = MP14.on ? G.players.find((P) => P.input14 === s) : G.player; if (!MP14.on || (owner && owner.slot14 === 0)) safe(() => Game.pause()); else safe(() => UI.banner(T('Host paused'), '')); }
      } else { s.startQ = false; s.dashQ = false; menuNav(gp); }
    }
  });
  /* single player: a gamepad steers the apple too, keyboard and mouse still win when used */
  safe(() => {
    const mv0 = Input.moveVec, av0 = Input.aimVec;
    Input.moveVec = function () {
      const v = mv0.apply(this, arguments);
      if (MP14.on || v.x || v.y || !Pads.any.length) return v;
      for (const gp of Pads.any) { const m = padFor(gp.index).moveVec(); if (m.x || m.y) return m; }
      return v;
    };
    Input.aimVec = function (px, py) {
      if (!MP14.on && Pads.any.length) for (const gp of Pads.any) { const s = gp && stick(gp.axes[2] || 0, gp.axes[3] || 0, DZ_AIM); if (s) { const l = Math.hypot(s.x, s.y) || 1; return { x: s.x / l, y: s.y / l, touch: false }; } }
      return av0.apply(this, arguments);
    };
  });
  /* menus with the d-pad: move focus to the nearest visible control in that direction, A clicks, B goes back */
  function menuNav(gp) {
    const p = NAV.prev[gp.index] || [], b = gp.buttons.map((x) => !!(x && x.pressed));
    const edge = (i) => b[i] && !p[i];
    NAV.prev[gp.index] = b;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, sx = Math.abs(ax) > 0.6 ? Math.sign(ax) : 0, sy = Math.abs(ay) > 0.6 ? Math.sign(ay) : 0;
    const sk = NAV['s' + gp.index] || 0, sd = sx || sy ? (sx ? 'x' + sx : 'y' + sy) : 0; NAV['s' + gp.index] = sd;
    let dir = edge(12) ? [0, -1] : edge(13) ? [0, 1] : edge(14) ? [-1, 0] : edge(15) ? [1, 0] : null;
    if (!dir && sd && sd !== sk) dir = sx ? [sx, 0] : [0, sy];
    if (edge(0)) { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); }
    if (edge(1)) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', key: 'Escape', bubbles: true })); }
    if (!dir) return;
    const vis = [...document.querySelectorAll('button, [tabindex="0"], input, select, a[href]')].filter((e) => !e.disabled && e.offsetParent && e.getBoundingClientRect().width > 0);
    if (!vis.length) return;
    const cur = document.activeElement && vis.includes(document.activeElement) ? document.activeElement : null;
    if (!cur) { vis[0].focus({ preventScroll: false }); return; }
    const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    let best = null, bs = 1e9;
    for (const e of vis) {
      if (e === cur) continue;
      const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
      const along = dx * dir[0] + dy * dir[1]; if (along <= 4) continue;
      const side = Math.abs(dx * dir[1] - dy * dir[0]), sc = along + side * 2.2;
      if (sc < bs) { bs = sc; best = e; }
    }
    if (best) { best.focus({ preventScroll: false }); safe(() => best.scrollIntoView({ block: 'nearest' })); }
  }

  /* ================================================================ snakes pick a target (B9) */
  function pickTarget(sn, L) {
    const now = G.t || 0;
    if (sn.isBoss) {
      /* a boss picks a new target at the start of each attack cycle (5 s here): random, weighted to the apple
         that hurt it most in the last 10 s */
      if (!sn.tgt14 || !L.includes(sn.tgt14) || now >= (sn.tgtT14 || 0)) {
        let tot = 0; const w = L.map((P) => { const d = recentDmg(sn, P, now); const x = 1 + d; tot += x; return x; });
        let r = G.rng ? G.rng() * tot : Math.random() * tot, i = 0;
        while (i < L.length - 1 && r > w[i]) { r -= w[i]; i++; }
        sn.tgt14 = L[i]; sn.tgtT14 = now + 5;
      }
      return sn.tgt14;
    }
    let near = L[0], nd = 1e18;
    for (const P of L) { const d = (P.x - sn.x) ** 2 + (P.y - sn.y) ** 2; if (d < nd) { nd = d; near = P; } }
    const h = sn.lastHit14;
    if (h && h.P !== near && L.includes(h.P) && now - h.t < 2) {
      const d = (h.P.x - sn.x) ** 2 + (h.P.y - sn.y) ** 2;
      if (d <= nd * 2.25) return h.P;                       // 1.5 x the distance, squared
    }
    return near;
  }
  function recentDmg(sn, P, now) { const L = sn.hits14; if (!L) return 0; let s = 0; for (const h of L) if (h.P === P && now - h.t < 10) s += h.n; return s; }
  window.snakeStep14 = function (sn, dt, room) {
    const L = livePlayers14();
    if (!L.length) { sn.update(dt, room); return; }
    const tgt = pickTarget(sn, L);
    withPlayer(tgt, () => sn.update(dt, room));
    if (!sn.alive || L.length < 2) return;
    for (const Q of L) if (Q !== tgt) withPlayer(Q, () => sn.contactPlayer(room));   /* the body still bites whoever touches it */
  };

  /* ================================================================ seeds run in their owner's context (M3) */
  window.seedsByOwner14 = function (dt, room) {
    const all = G.seeds, groups = new Map(), first = G.players[0];
    for (const s of all) { const o = s.owner14 || first; let g = groups.get(o); if (!g) { g = []; groups.set(o, g); } g.push(s); }
    if (groups.size <= 1) { withPlayer(groups.size ? groups.keys().next().value : first, () => updateSeeds(dt, room)); return; }
    const out = [];
    for (const [o, arr] of groups) {
      G.seeds = arr;
      withPlayer(o, () => updateSeeds(dt, room));
      for (const s of G.seeds) out.push(s);
    }
    G.seeds = out;
  };

  /* ================================================================ damage bookkeeping: B9 and the recap (F9) */
  Hooks.install(Snake.prototype, 'hurt', 'Snake.hurt');
  const RUN = { stats: new Map() };
  const statOf = (P) => { let s = RUN.stats.get(P); if (!s) { s = { dealt: {}, kills: 0, taken: 0, killer: '', name: '', col: '', items: [] }; RUN.stats.set(P, s); } return s; };
  window.DMG14 = { src: null };                                /* where damage comes from; set by the systems below */
  Hooks.layer('Snake.hurt', 'v14 damage by source', function (next, amount, fx, fy, isPoison) {
    const hp0 = this.hp, P = G.player;
    const r = next.call(this, amount, fx, fy, isPoison);
    const n = Math.max(0, hp0 - (this.hp > 0 ? this.hp : 0));
    if (n > 0 && P && G.run) {
      const src = isPoison ? 'Poison and rot' : (DMG14.src || 'Seeds');
      const st = statOf(P); st.dealt[src] = (st.dealt[src] || 0) + n;
      this.lastHit14 = { P, t: G.t };
      if (MP14.on) { (this.hits14 || (this.hits14 = [])).push({ P, t: G.t, n }); if (this.hits14.length > 40) this.hits14.splice(0, 20); }
    }
    return r;
  });
  const sk0 = Game.onSnakeKilled;
  Game.onSnakeKilled = function (sn) { const r = sk0.apply(this, arguments); safe(() => { const h = sn && sn.lastHit14; const P = h ? h.P : G.player; if (P && G.run) statOf(P).kills++; }); return r; };
  const tag = (fnName, label) => safe(() => {
    const f0 = window[fnName]; if (typeof f0 !== 'function') return;
    window[fnName] = function () { const k = DMG14.src; DMG14.src = label; try { return f0.apply(this, arguments); } finally { DMG14.src = k; } };
  });
  tag('updateStrikes', 'Seed Storm'); tag('explode', 'Explosions'); tag('updateFires', 'Fire'); tag('updateBalls', 'Balls and carts');
  const pu0 = Player.prototype.update;
  Player.prototype.update = function () { const k = DMG14.src; DMG14.src = 'Orbits and buddies'; try { return pu0.apply(this, arguments); } finally { DMG14.src = k; } };
  const us0 = updateSeeds;
  updateSeeds = function () { const k = DMG14.src; DMG14.src = 'Seeds'; try { return us0.apply(this, arguments); } finally { DMG14.src = k; } };
  /* damage taken, what bit last, a rumble on the pad */
  Hooks.layer('Player.hurt', 'v14 player context and recap', function (next, n, sx, sy, src) {
    return withPlayer(this, () => {
      const hp0 = this.hp, r = next.call(this, n, sx, sy, src);
      if (this.hp < hp0 && G.run) {
        const st = statOf(this); st.taken += hp0 - this.hp;
        st.killer = src && src.K ? src.K.name : src && src.kind && KINDS[src.kind] ? KINDS[src.kind].name : 'Something in the room';
        const pad = this.input14 && this.input14.rumble ? this.input14 : !MP14.on && Pads.any.length ? padFor(Pads.any[0].index) : null;
        if (pad) pad.rumble(this.hp <= 0 ? 260 : 120, this.hp <= 0 ? 1 : 0.6);
      }
      return r;
    });
  });

  /* ================================================================ friendly fire off (B5) */
  safe(() => {
    const ex0 = explode;
    explode = function (room, x, y, r, o = {}) {
      if (!MP14.on || o.hurtPlayer === false) return ex0.apply(this, arguments);
      /* an enemy blast (fuel cans, Kruipers, bombs) hurts every apple in reach */
      const L = livePlayers14(), rest = L.filter((P) => P !== G.player);
      const out = ex0.apply(this, arguments);
      for (const P of rest) if (dist(P.x, P.y, x, y) < r + P.r * 0.4) P.hurt(o.dmg || 1, x, y);
      return out;
    };
  });
  /* the rest of the enemy attacks that were written for one apple: every apple in reach gets the check */
  window.mpRest14 = function (fn) { if (!MP14.on) return; const me = G.player; for (const P of livePlayers14()) if (P !== me) withPlayer(P, () => fn(P)); };

  /* ================================================================ time freeze: one team cooldown (B7) */
  safe(() => {
    let fz = G.freeze || 0, cd = 0;
    Object.defineProperty(G, 'freeze', {
      configurable: true, enumerable: true,
      get() { return fz; },
      set(v) {
        v = +v || 0;
        if (MP14.on && v > fz && fz <= 0 && cd > 0) return;  /* the team waits 10 s after a freeze ends */
        if (MP14.on && fz > 0 && v <= 0) cd = 10;
        fz = v;
      },
    });
    Sched.every('step', 'v14 freeze cooldown', (now, dt) => { if (cd > 0 && fz <= 0) cd = Math.max(0, cd - dt); });
    B.freezeCd14 = () => cd;
  });

  /* ================================================================ dying: the klokhuis ghost (M8) */
  const GHOST_K = 0.6;
  window.mpDeaths14 = function (game) {
    let anyAlive = false;
    for (const P of G.players) {
      if (!P.ghost14 && P.dying > 2.4) {
        P.ghost14 = true; P.dying = 1.6; P.hp = 0; P.inv = 0; P.rev14 = 0;
        floatText(P.x, P.y - 30, T('KLOKHUIS'), P.color14 || '#fff', true);
        safe(() => Sfx.tone(220, 0.6, { to: 110, type: 'triangle', vol: 0.05, verb: true }));
      }
      if (!P.ghost14 && !P.away14) anyAlive = true;
    }
    if (!anyAlive && G.state === 'play') game.gameOver();
  };
  window.ghostStep14 = function (P, dt, room) {
    const src = P.input14 || Input, mv = src.moveVec(), sp = P.speed * GHOST_K;
    P.vx = mv.x * sp; P.vy = mv.y * sp;
    P.x = clamp(P.x + P.vx * dt, 8, RW - 8); P.y = clamp(P.y + P.vy * dt, 8, RH - 8);
    P.blinkT -= dt; P.hop += dt * 2;
    if (src.interact && src.interact()) {                    /* a ping: a short marker where the ghost points */
      addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r: 16, life: 0.7, col: P.color14 || '#fff', drag: 0, glow: true });
      floatText(P.x, P.y - 24, '!', P.color14 || '#fff', true);
      safe(() => Sfx.tone(1200, 0.08, { type: 'square', vol: 0.03 }));
    }
    if (src.dash) src.dash();                                 /* swallow dashes */
  };
  /* revive: after the room is clear, a living apple stands 3 s next to the core */
  Sched.every('step', 'v14 revive', (now, dt) => {
    if (!MP14.on || G.state !== 'play' || !G.room) return;
    const room = G.room, L = livePlayers14();
    for (const P of G.players) {
      if (!P.ghost14) continue;
      const near = !room.locked && room.cleared !== false && L.some((Q) => dist(Q.x, Q.y, P.x, P.y) < 40);
      P.rev14 = near ? (P.rev14 || 0) + dt : Math.max(0, (P.rev14 || 0) - dt * 2);
      if (P.rev14 >= 3) {
        P.ghost14 = false; P.dying = 0; P.rev14 = 0; P.hp = Math.min(P.maxHp, 2); P.inv = 2; P.hurtT = 0;
        P.bites.length = Math.max(0, P.maxHp - P.hp);
        floatText(P.x, P.y - 30, T('BACK IN'), P.color14 || '#fff', true);
        burst(P.x, P.y, 16, P.color14 || '#fff', { min: 40, max: 140, lmin: 0.4, lmax: 0.8, glow: true });
        safe(() => Sfx.pickup());
      }
    }
  });
  /* one apple down is not the end: no music stop, no hidden pause button while others still play */
  const pd0 = Game.onPlayerDeath;
  Game.onPlayerDeath = function () {
    if (MP14.on && livePlayers14().length > 0) { safe(() => { Meta.add('deaths'); Save.store(); }); return; }
    return pd0.apply(this, arguments);
  };

  /* ================================================================ the shared room and its doors (M7) */
  const DOOR = { dir: null, t: 0, touch: 0 };
  const doorPt = (dir) => { const v = DOORV[dir]; return [RW / 2 + v[0] * RW / 2, RH / 2 + v[1] * RH / 2]; };
  const gt0 = Game.goThrough;
  Game.goThrough = function (dir) {
    if (!MP14.on || G.trans) return gt0.apply(this, arguments);
    const P = G.player, [dx, dy] = doorPt(dir), L = livePlayers14();
    if (DOOR.dir !== dir) { DOOR.dir = dir; DOOR.t = 0; }
    DOOR.touch = G.t;
    const all = L.every((Q) => Q === P || dist(Q.x, Q.y, dx, dy) < 70);
    if (all || DOOR.t >= 3) { DOOR.dir = null; DOOR.t = 0; return gt0.apply(this, arguments); }
    /* hold this apple in the doorway until the others come (or 3 s pass) */
    const k = P.r * 0.8 - 1, v = DOORV[dir];
    if (v[1] < 0) P.y = Math.max(P.y, -k); if (v[1] > 0) P.y = Math.min(P.y, RH + k); if (v[0] < 0) P.x = Math.max(P.x, -k); if (v[0] > 0) P.x = Math.min(P.x, RW + k);
  };
  Sched.every('step', 'v14 door countdown', (now, dt) => {
    if (!DOOR.dir) return;
    if (!MP14.on || G.trans || G.t - DOOR.touch > 0.4) { DOOR.dir = null; DOOR.t = 0; return; }
    DOOR.t += dt;
  });
  B.door14 = DOOR;
  /* everyone comes in together, spread in a small arc at the entry */
  Hooks.layer('Game.enterRoom', 'v14 everyone enters', function (next, room, entry) {
    const r = next.apply(this, [].slice.call(arguments, 1));
    if (!MP14.on) return r;
    safe(() => {
      const P0 = G.player, v = entry ? DOORV[entry] : [0, 1], px = -v[1], py = v[0];
      let k = 0;
      for (const Q of G.players) {
        if (Q === P0) continue;
        k++;
        const side = k % 2 ? 1 : -1, step = Math.ceil(k / 2);
        Q.x = clamp(P0.x + px * 26 * side * step - v[0] * 16 * step, 16, RW - 16);
        Q.y = clamp(P0.y + py * 26 * side * step - v[1] * 16 * step, 16, RH - 16);
        Q.kbx = 0; Q.kby = 0; Q.vx = 0; Q.vy = 0;
        Q.syrup = !!Q.stroop; Q.vetoUsed = false;
        if (!freeAt(room, Q.x, Q.y, Q.r)) { const c = nearestFreeCell(room, Q.x, Q.y); Q.x = c.x; Q.y = c.y; }
      }
      /* treasure rooms give 1 + (n - 1) powerups (B3) */
      if (room.type === 'treasure' && !room.mp14) {
        room.mp14 = true;
        for (let i = 1; i < mpCount14(); i++) spawnItem(room, RW / 2 + (i % 2 ? 1 : -1) * 46 * Math.ceil(i / 2), RH / 2 + 40);
      }
    });
    return r;
  });

  /* ================================================================ loot for n apples (B3) */
  const ci0 = Game.chestItems;
  Game.chestItems = function (room, ch) {
    const r = ci0.apply(this, arguments);
    if (!MP14.on) return r;
    for (let k = 1; k < mpCount14(); k++) {
      const before = room.pickups.length;
      ci0.call(this, room, Object.assign({}, ch, { y: ch.y + 48 * k }));
      for (let i = before; i < room.pickups.length; i++) if (room.pickups[i].grp) room.pickups[i].grp += '_p' + k;
    }
    return r;
  };
  /* bosses leave one powerup per apple; each apple can take one */
  Hooks.layer('Game.clearRoom', 'v14 boss loot per apple', function (next, room) {
    const was = room.cleared, r = next.apply(this, [].slice.call(arguments, 1));
    if (!MP14.on || was || !room || !(room.type === 'boss' || room.type === 'portal' || room.type === 'miniboss')) return r;
    safe(() => {
      const n = mpCount14(), have = room.type === 'boss' ? 0 : 1, grp = 'boss14_' + G.levelIdx + '_' + room.id;
      for (const p of room.pickups) if (p.kind === 'item' && !p.boss14) p.boss14 = grp;
      for (let i = have; i < n; i++) { spawnItem(room, RW / 2 + (i - (n - 1) / 2) * 52, RH / 2 - 60); room.pickups[room.pickups.length - 1].boss14 = grp; }
    });
    return r;
  });
  /* the item pickup itself: a second boss item for the same apple is blocked (called from updatePickups) */
  window.bossLootHeld14 = function (p, P) {
    if (!MP14.on) return false;
    P.bossLoot14 = P.bossLoot14 || {};
    if (P.bossLoot14[p.boss14]) { if (!p.deny14 || G.t > p.deny14) { p.deny14 = G.t + 2.5; UI.banner(T('One per apple'), T('You already took one. Leave it for the others.')); safe(() => Sfx.thud()); } return true; }
    P.bossLoot14[p.boss14] = true;
    return false;
  };

  /* ================================================================ drawing: colours, rings, tags, ghosts (S7) */
  safe(() => {
    const dp0 = drawPlayer;
    drawPlayer = function (c) {
      if (!MP14.on) return dp0.apply(this, arguments);
      const L = G.players.slice().sort((a, b) => a.y - b.y);
      for (const P of L) withPlayer(P, () => {
        c.save();
        // the ring under the feet, under every look
        c.strokeStyle = P.color14; c.globalAlpha = P.ghost14 ? 0.35 : 0.9; c.lineWidth = 2;
        ell(c, P.x + 1, P.y + 12, 13, 5); c.stroke();
        c.restore();
        c.save();
        if (P.ghost14) c.globalAlpha = 0.55;
        dp0.call(this, c);
        c.restore();
        // a name tag when more than one apple plays
        c.save();
        c.font = '700 8px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
        const name = P.name14 || NAMES[P.slot14 || 0], w = c.measureText(name).width + 8;
        c.fillStyle = 'rgba(10,6,6,0.75)'; c.fillRect(P.x - w / 2, P.y - 33, w, 10);
        c.fillStyle = P.color14; c.fillRect(P.x - w / 2, P.y - 33, 2, 10);
        c.fillStyle = '#fff4ec'; c.fillText(name, P.x + 1, P.y - 23.5);
        // the revive ring
        if (P.ghost14 && P.rev14 > 0) { c.strokeStyle = P.color14; c.lineWidth = 2.5; c.beginPath(); c.arc(P.x, P.y, 20, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, P.rev14 / 3)); c.stroke(); }
        c.restore();
      });
      // the door countdown
      if (DOOR.dir && DOOR.t > 0) {
        const [dx, dy] = doorPt(DOOR.dir), v = DOORV[DOOR.dir];
        c.save(); c.font = '800 14px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#fff4ec'; c.fillText(String(Math.max(1, Math.ceil(3 - DOOR.t))), dx - v[0] * 24, dy - v[1] * 24);
        c.restore();
      }
    };
    const ds0 = drawSeeds;
    drawSeeds = function (c) {
      const r = ds0.apply(this, arguments);
      if (!MP14.on) return r;
      c.save(); c.lineWidth = 0.9; c.globalAlpha = 0.85;     /* a thin outline in the owner's colour */
      for (const s of G.seeds) if (s.owner14 && s.owner14.color14) { c.strokeStyle = s.owner14.color14; c.beginPath(); c.arc(s.x, s.y, (s.r || 3) + 1.4, 0, TAU); c.stroke(); }
      c.restore();
      return r;
    };
  });

  /* ================================================================ HUD rows (M12) */
  safe(() => {
    const r0 = render;
    render = function (dt) {
      const r = r0.apply(this, arguments);
      if (MP14.on && G.state !== 'menu' && G.players.length > 1) safe(() => hudRows());
      return r;
    };
  });
  function hudRows() {
    const c = View.ctx; c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    const k = View.portrait ? 1 : Math.min(1.4, Math.max(1, View.H / 700));
    const x0 = 10 * k, y0 = (View.portrait ? 82 : 96) * k, h = 22 * k, w = 168 * k;
    c.font = `700 ${12 * k}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textBaseline = 'middle';
    G.players.forEach((P, i) => {
      const y = y0 + i * (h + 4 * k);
      c.fillStyle = 'rgba(12,8,8,0.78)'; c.fillRect(x0, y, w, h);
      c.fillStyle = P.color14; c.fillRect(x0, y, 6 * k, h);
      c.fillStyle = P.ghost14 ? '#8a7f78' : '#fff4ec'; c.textAlign = 'left';
      c.fillText((P.name14 || NAMES[i]).slice(0, 10), x0 + 11 * k, y + h / 2 + 1);
      // hearts: one small square per half apple, filled or empty
      const hx = x0 + 70 * k, n = Math.max(P.maxHp, 0);
      for (let j = 0; j < n; j++) {
        c.fillStyle = j < P.hp ? '#d7263d' : 'rgba(255,255,255,0.14)';
        c.fillRect(hx + j * 5.2 * k, y + h / 2 - 4 * k + (j % 2 ? 1 * k : 0), 4.2 * k, 7 * k);
      }
      // active effects: powerups, curses, downgrades
      c.textAlign = 'right'; c.fillStyle = '#c8b8a8';
      const fx = (P.items ? P.items.length : 0) + (P.curses ? P.curses.length : 0) + (P.downs ? P.downs.length : 0);
      c.fillText(String(fx), x0 + w - 6 * k, y + h / 2 + 1);
    });
    c.restore();
  }

  /* ================================================================ starting a coop run (M15, T9) */
  const Coop = { slots: [], pending: null };
  B.coop14 = Coop;
  function newPlayer(slot, i) {
    const P = i === 0 ? G.player : new Player(slot.char);
    P.slot14 = i; P.color14 = COL[i]; P.name14 = slot.name || NAMES[i];
    P.input14 = slot.src; P.look14 = slot.look;
    if (i > 0) {
      const D = G.D, tw = G.run.twist ? G.run.twist.id : null;
      if (D.startHp) { P.maxHp = Math.min(16, P.maxHp + D.startHp); P.hp = P.maxHp; }
      if (tw === 'glass') { P.maxHp = 4; P.hp = 4; P.dmg *= 2; }
      if (tw === 'fast') { P.speed *= 1.12; P.fireDelay *= 0.9; }
    }
    return P;
  }
  Hooks.layer('Game.startRun', 'v14 coop players', function (next) {
    const q = Coop.pending; Coop.pending = null;
    MP14.on = false; G.players = [];
    PART14.share = 0;
    if (q && q.length) { Save.data.char = q[0].char; }
    const r = next.apply(this, [].slice.call(arguments, 1));
    RUN.stats = new Map();
    if (!q || q.length < 2 || G.mode === 'story') { G.players = [G.player]; return r; }
    safe(() => {
      const P0 = G.player;
      G.players = q.map((s, i) => newPlayer(s, i));
      MP14.on = true;
      PART14.share = Math.floor(PART14.cap / G.players.length);
      const n = G.players.length;
      G.D = Object.assign({}, G.D, { hearts: (G.D.hearts || 1) * MPB14.drop[n] });   /* B1: heart and slice drops */
      G.bossSpeedK = (G.bossSpeedK || 1) * MPB14.cycle[n];                              /* B1: boss attack cycle */
      withPlayer(P0, () => Game.enterRoom(G.room, null));
    });
    return r;
  });
  safe(() => {
    const tm0 = Game.toMenu;
    Game.toMenu = function () { const r = tm0.apply(this, arguments); MP14.on = false; G.players = G.player ? [G.player] : []; PART14.share = 0; return r; };
  });
  /* T9: the look comes from the slot, not from the save, so two players can wear the same apple differently */
  safe(() => {
    const da = drawApple;
    drawApple = function (c, R, st) {
      const P = G.player;
      if (MP14.on && st && P && P.look14 != null && st.char === P.char && st.skin == null && G.state !== 'menu') st = Object.assign({}, st, { skin: P.look14 });
      return da.call(this, c, R, st);
    };
  });

  /* ================================================================ the Coop panel and the menu entry (M15) */
  const CSS = `
#coop14 .co14-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;max-width:640px;margin:0 0 12px}
#coop14 .co14-tabs button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:10px 4px 9px;border:1px solid var(--line);border-radius:3px;font:700 12px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
#coop14 .co14-tabs button[aria-selected="true"]{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
#coop14 .co14-tabs button:focus-visible,#coop14 .co14-slot button:focus-visible,#coop14 .co14-slot input:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
#coop14 .co14-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;max-width:880px}
#coop14 .co14-slot{border:1px solid var(--line);border-radius:4px;background:rgba(255,255,255,.02);padding:10px;display:grid;grid-template-columns:64px 1fr;gap:8px 10px;align-items:center;position:relative}
#coop14 .co14-slot::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--pc)}
#coop14 .co14-slot canvas{width:64px;height:64px;grid-row:span 3;border-radius:2px}
#coop14 .co14-slot.empty{opacity:.55;grid-template-columns:1fr;min-height:84px;place-items:center;text-align:center;font:600 13px/1.3 var(--ui);color:var(--muted)}
#coop14 .co14-slot input{all:unset;box-sizing:border-box;width:100%;padding:5px 7px;border:1px solid var(--line);border-radius:2px;font:700 15px/1.1 var(--ui);color:#fff4ec}
#coop14 .co14-row{display:grid;grid-template-columns:28px 1fr 28px;gap:4px;align-items:center}
#coop14 .co14-row button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;height:26px;border:1px solid var(--line);border-radius:2px;font:700 14px/24px var(--ui);color:var(--ink)}
#coop14 .co14-row span{font:600 13px/1.15 var(--ui);color:var(--muted);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#coop14 .co14-src{grid-column:1/-1;font:600 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint);display:flex;justify-content:space-between;align-items:center}
#coop14 .co14-src button{all:unset;cursor:pointer;color:var(--faint);font:700 11px/1 var(--ui);letter-spacing:.12em;padding:3px 6px;border:1px solid var(--line);border-radius:2px}
#coop14 .co14-pane[hidden]{display:none!important}
#coop14 .co14-note{font:500 14px/1.35 var(--ui);color:var(--muted);max-width:640px;margin:0 0 10px}
`;
  const $ = (id) => document.getElementById(id);
  const charsOpen = () => CHAR_IDS.filter((id) => id === 'apple' || Save.data.unlocks[id]);
  const looksOf = (id) => (B.SKINS24 && B.SKINS24.SKINS[id] ? B.SKINS24.SKINS[id].length : 0);
  const lookName = (id, n) => (n ? B.SKINS24.SKINS[id][n - 1].name : 'Original');
  const UIc = { sec: null, tab: 'couch' };
  function slotsDefault() {
    const s0 = Coop.slots[0] || {};
    Coop.slots = [{ src: new KeyboardMouseSource(), kind: 'kbm', char: s0.char || Save.data.char || 'apple', look: s0.look != null ? s0.look : (B.SKINS24 ? B.SKINS24.skinIdx(Save.data.char || 'apple') : 0), name: (Save.data.settings.coopNames14 || [])[0] || 'P1' }]
      .concat(Coop.slots.slice(1).filter((s) => s.kind === 'pad'));
  }
  function addPad(index) {
    if (Coop.slots.some((s) => s.kind === 'pad' && s.index === index) || Coop.slots.length >= 4) return;
    const i = Coop.slots.length, open = charsOpen();
    Coop.slots.push({ src: padFor(index), kind: 'pad', index, char: open[i % open.length], look: 0, name: (Save.data.settings.coopNames14 || [])[i] || NAMES[i] });
    safe(() => Sfx.pickup()); paintCoop();
  }
  function paintCoop() {
    const box = UIc.sec && UIc.sec.querySelector('.co14-slots'); if (!box) return;
    box.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const s = Coop.slots[i], d = document.createElement('div');
      if (!s) { d.className = 'co14-slot empty'; d.textContent = T('Press A on a gamepad to join'); box.appendChild(d); continue; }
      d.className = 'co14-slot'; d.style.setProperty('--pc', COL[i]);
      d.innerHTML = `<canvas width="128" height="128" aria-hidden="true"></canvas>
        <input type="text" maxlength="12" aria-label="${T('Name')}" value="${String(s.name).replace(/[<>&"]/g, '')}">
        <div class="co14-row"><button type="button" data-d="-1" data-k="char" aria-label="${T('Character')}">&lsaquo;</button><span>${CHARS[s.char] ? CHARS[s.char].name : s.char}</span><button type="button" data-d="1" data-k="char" aria-label="${T('Character')}">&rsaquo;</button></div>
        <div class="co14-row"><button type="button" data-d="-1" data-k="look" aria-label="${T('Look')}">&lsaquo;</button><span>${lookName(s.char, s.look)}</span><button type="button" data-d="1" data-k="look" aria-label="${T('Look')}">&rsaquo;</button></div>
        <div class="co14-src"><span>${s.kind === 'kbm' ? T('Keyboard and mouse') : T('Gamepad') + ' ' + (s.index + 1)}</span>${i > 0 ? `<button type="button" data-rm="1">${T('Remove')}</button>` : ''}</div>`;
      d.querySelector('input').addEventListener('change', (e) => { s.name = e.target.value.trim().slice(0, 12) || NAMES[i]; const L = Save.data.settings.coopNames14 = (Save.data.settings.coopNames14 || []).slice(); L[i] = s.name; Save.store(); });
      for (const b of d.querySelectorAll('[data-k]')) b.addEventListener('click', (e) => {
        e.preventDefault(); const dd = +b.dataset.d;
        if (b.dataset.k === 'char') { const L = charsOpen(); s.char = L[(L.indexOf(s.char) + dd + L.length) % L.length]; s.look = 0; }
        else { const n = looksOf(s.char) + 1; s.look = ((s.look || 0) + dd + n) % n; }
        safe(() => Sfx.blip()); paintCoop();
        const f = box.children[i] && box.children[i].querySelector(`[data-k="${b.dataset.k}"][data-d="${b.dataset.d}"]`); if (f) f.focus();
      });
      const rm = d.querySelector('[data-rm]'); if (rm) rm.addEventListener('click', (e) => { e.preventDefault(); Coop.slots.splice(i, 1); paintCoop(); });
      box.appendChild(d);
      safe(() => B.SKINS24.drawOn(d.querySelector('canvas'), s.char, s.look, 1.2, {}));
    }
  }
  function openCoop() {
    if (!UIc.sec) buildCoop();
    slotsDefault();
    UI.hidePanels(); UIc.sec.hidden = false; UIc.sec.classList.remove('enter'); void UIc.sec.offsetWidth; UIc.sec.classList.add('enter');
    setTab(UIc.tab); paintCoop();
    setTimeout(() => { const b = UIc.sec.querySelector('[data-a="go"]'); if (b) b.focus({ preventScroll: true }); }, 60);
  }
  function closeCoop() { if (!UIc.sec || UIc.sec.hidden) return; UIc.sec.hidden = true; UI.show('menu'); safe(() => UI.refresh()); }
  function setTab(t) {
    UIc.tab = t;
    for (const b of UIc.sec.querySelectorAll('.co14-tabs button')) b.setAttribute('aria-selected', b.dataset.tab === t ? 'true' : 'false');
    for (const p of UIc.sec.querySelectorAll('[data-pane]')) p.hidden = p.dataset.pane !== t;
    if (t === 'online' && B.net14 && B.net14.paintLobby) safe(() => B.net14.paintLobby());
  }
  function buildCoop() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const sec = document.createElement('section'); sec.id = 'coop14'; sec.className = 'panel sheet'; sec.hidden = true; sec.setAttribute('aria-label', T('Coop'));
    sec.innerHTML = `<div class="sheet-inner">
      <div class="sheet-head"><h2>${T('Coop')}</h2><button class="btn" type="button" data-a="back">${T('Back')}</button></div>
      <div class="co14-tabs" role="tablist"><button type="button" role="tab" data-tab="couch">${T('Couch')}</button><button type="button" role="tab" data-tab="online">${T('Online')}</button></div>
      <div class="co14-pane" data-pane="couch">
        <p class="co14-note">${T('Keyboard and mouse is one apple. Every gamepad is one more. Up to four, one screen, one room.')}</p>
        <div class="co14-slots"></div>
        <div class="playfoot"><span class="co14-mode ddesc"></span><button class="btn primary" type="button" data-a="go">${T('Start')}</button></div>
      </div>
      <div class="co14-pane" data-pane="online" hidden></div>
    </div>`;
    document.getElementById('app').appendChild(sec);
    UIc.sec = sec;
    sec.querySelector('[data-a="back"]').addEventListener('click', (e) => { e.preventDefault(); closeCoop(); });
    for (const b of sec.querySelectorAll('.co14-tabs button')) b.addEventListener('click', (e) => { e.preventDefault(); setTab(b.dataset.tab); safe(() => Sfx.blip()); });
    sec.querySelector('[data-a="go"]').addEventListener('click', (e) => { e.preventDefault(); startCouch(); });
    window.addEventListener('keydown', (e) => { if (!sec.hidden && e.code === 'Escape') { e.preventDefault(); closeCoop(); } });
    /* a gamepad joins with A while the Couch tab is open */
    Sched.every('ui', 'v14 coop join', () => {
      for (const gp of Pads.any) { const b = gp.buttons[0] && gp.buttons[0].pressed; const s = padFor(gp.index); if (b && !s.joinHeld) addPad(gp.index); s.joinHeld = b; }
    }, () => !sec.hidden && UIc.tab === 'couch');
    UIc.modeEl = sec.querySelector('.co14-mode');
    B.coopSec14 = sec;
  }
  function startCouch() {
    safe(() => Sfx.init());
    if (Coop.slots.length < 2) safe(() => UI.banner(T('Coop'), T('Nobody pressed A yet. You can still play alone.')));
    Coop.pending = Coop.slots.map((s) => ({ src: s.src, char: s.char, look: s.look, name: s.name }));
    UIc.sec.hidden = true;
    const mode = Save.data.mode && MODES[Save.data.mode] && Save.data.mode !== 'story' ? Save.data.mode : 'arcade';
    Game.startRun(false, mode);
  }
  /* the menu entry, next to the Map Maker */
  safe(() => {
    const nav = document.querySelector('#menu .menu-list'), set = $('btnSet');
    if (!nav) return;
    /* the menu tile, same build as the Map Maker tile: title, subtitle, one dot per apple colour */
    const tc = document.createElement('style');
    tc.textContent = `#menu.m19 .mi.co14{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:center;min-height:58px;padding:9px 12px;border-radius:3px;
  background:linear-gradient(100deg,rgba(44,14,18,.92),rgba(14,9,8,.94) 60%);border:1px solid rgba(215,38,61,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
#menu.m19 .mi.co14 .ml{grid-column:1;grid-row:1;font:800 clamp(21px,5.8vw,25px)/.95 var(--display);color:var(--ink);transform:none}
#menu.m19 .mi.co14 small{grid-column:1;grid-row:2;margin:0;font:600 10px/1.15 var(--ui);letter-spacing:.13em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#menu.m19 .mi.co14 .cot{grid-column:2;grid-row:1/3;display:grid;grid-template-columns:repeat(2,10px);gap:4px}
#menu.m19 .mi.co14 .cot i{width:10px;height:10px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c);opacity:.85}
#menu.m19 .mi.co14:hover,#menu.m19 .mi.co14:focus-visible{border-color:var(--apple);transform:translateY(-1px)}
@media (min-aspect-ratio:20/21) and (max-height:560px){#menu.m19 .mi.co14{min-height:34px;padding:4px 10px}#menu.m19 .mi.co14 small,#menu.m19 .mi.co14 .cot{display:none}#menu.m19 .mi.co14 .ml{font-size:17px}}
@media (max-height:700px) and (max-aspect-ratio:20/21){#menu.m19 .mi.co14{min-height:46px}}`;
    document.head.appendChild(tc);
    const b = document.createElement('button'); b.className = 'mi co14'; b.id = 'btnCoop14'; b.type = 'button';
    b.innerHTML = `<i class="eye" aria-hidden="true"></i><span class="ml">${T('Coop')}</span><small id="coopNow14">${T('Play with friends: on this screen or online.')}</small><span class="cot" aria-hidden="true">${COL.map((c) => `<i style="--c:${c}"></i>`).join('')}</span>`;
    if (set && set.parentNode === nav) nav.insertBefore(b, set); else nav.appendChild(b);
    b.addEventListener('click', (e) => { e.preventDefault(); safe(() => Sfx.init()); openCoop(); });
  });
  Object.assign(Coop, { open: openCoop, close: closeCoop, setTab, paint: paintCoop, addPad, startCouch, stats: () => RUN.stats, statOf, COL, NAMES });
})();
