/* src/94-v1410-core.js: v14.10 core feel.
   Sim (every peer runs it the same, no Math.random, no local settings):
     charged shot   keep firing 0.6 s: the next seed pierces, hits 1.5x and is bigger; then 2.4 s before the next charge
     perfect dash   a dash that meets venom in its first 80 ms gives the dash back and slows time to 45% for 0.2 s
     knockback      every seed hit nudges the snake by its weight: small worms fly, bosses barely move
     overheat       fire builds at 0.16 s per shot or faster heat up; full heat locks the seeds for 1 s
   Screen only (local settings are fine here):
     death replay (last 3 s), damage numbers (setting, off), hit stop (2 to 4 frames, off with reduced motion or shake off),
     interact rings (pedestals, till, pumps), the seed type row (normal, pierce, split, bounce, with how many powerups stack),
     heat and charge arcs over the apple, touch auto fire (setting, off) with a tap on the aim side to dash. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe94'); return fb; } };
  const B = window.__bitten;
  const calm = () => REDUCED || (Save.data.settings && Save.data.settings.shake === false);
  const CFG = { chargeT: 0.6, chargeCd: 2.4, chargeDmg: 1.5, chargeSize: 1.5, pdWin: 0.08, slowT: 0.2, slowK: 0.45, kb: 2.4,
    heatAt: 0.16, heatShot: 0.05, coolFire: 0.16, coolIdle: 0.6, lockT: 1, replayS: 3 };

  /* ---------------------------------------------------------------- settings that start off */
  const OFF = { dmgnum14: 1, autofire14: 1 };
  safe(() => {
    for (const k in OFF) SETTING_KEYS[k] = 1;
    const st0 = UI.setting;
    UI.setting = function (k) { if (OFF[k]) return !!(Save.data.settings && Save.data.settings[k] === true); return st0.apply(this, arguments); };
    const b = document.querySelector('#toggles .tog[data-set="dmgnum14"]'); if (b) b.dataset.t12 = 'screen';
    safe(() => UI.paintSettings());
  });
  const on = (k) => !!(Save.data.settings && Save.data.settings[k] === true);

  /* ---------------------------------------------------------------- charged shot and overheat (fire) */
  const fire0 = Player.prototype.fire;
  Player.prototype.fire = function (ax, ay) {
    const now = G.t || 0, P = this;
    // charge: time spent firing without a gap
    const gap = now - (P.lastShot14 == null ? -9 : P.lastShot14);
    const eff = safe(() => effDelay(P), 0.36);
    if (gap > eff + 0.12) P.charge14 = 0; else P.charge14 = (P.charge14 || 0) + gap;
    P.lastShot14 = now;
    if (P.chargeCd14 > 0) P.charge14 = 0;
    const charged = P.charge14 >= CFG.chargeT && !(P.chargeCd14 > 0);
    const n0 = G.seeds.length;
    const r = fire0.apply(this, arguments);
    if (charged && G.seeds.length > n0) {
      const s = G.seeds[n0];
      s.charged14 = true; s.pierce = true; s.dmg *= CFG.chargeDmg; s.size = (s.size || 1) * CFG.chargeSize;
      P.charge14 = 0; P.chargeCd14 = CFG.chargeCd;
    }
    // heat: only for very fast fire
    if (eff <= CFG.heatAt) {
      P.heat14 = Math.min(1, (P.heat14 || 0) + CFG.heatShot * Math.sqrt(CFG.heatAt / Math.max(0.05, eff)));
      if (P.heat14 >= 1) { P.heat14 = 0.45; P.lock14 = CFG.lockT; P.cool = Math.max(P.cool, CFG.lockT); floatText(P.x, P.y - 30, 'OVERHEAT', '#ff7a3a'); }
    }
    return r;
  };

  /* ---------------------------------------------------------------- knockback by weight */
  const kbW = (sn) => (sn.isBoss ? 0.08 : clamp(9 / Math.max(4, sn.headR || 9), 0.3, 1.6) * (sn.K && sn.K.boss ? 0.2 : 1));
  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    if (!s || !sn || !sn.alive || sn.burrowed || s.melon27 || !room || typeof sn.moveTo !== 'function') return;
    const d = CFG.kb * kbW(sn) * Math.min(2, s.size || 1) * (s.charged14 ? 2.2 : 1);
    if (d < 0.35) return;
    const sp = Math.hypot(s.vx, s.vy) || 1, nx = sn.x + (s.vx / sp) * d, ny = sn.y + (s.vy / sp) * d;
    if (freeAt(room, nx, ny, sn.headR * 0.7)) sn.moveTo(nx, ny);
  };

  /* ---------------------------------------------------------------- the update: slow time, perfect dash, heat, replay */
  const HS = { n: 0 };                                      // hit stop frames (screen only)
  const RP = { buf: [], k: 0 };                             // the replay ring
  Hooks.layer('Game.update', 'v14.10 core feel', function (next, dt) {
    if (G.slow14 > 0 && G.state === 'play') { G.slow14 -= dt; dt *= CFG.slowK; }
    const bossStage = G.room ? G.room.snakes.reduce((a, s) => a + (s.isBoss && s.alive ? s.stage14 || 0 : 0), 0) : 0;
    const r = next.call(this, dt);
    if (G.state !== 'play' || !G.run) return r;
    for (const P of players14()) {
      if (P.chargeCd14 > 0) P.chargeCd14 = Math.max(0, P.chargeCd14 - dt);
      if (P.lock14 > 0) P.lock14 = Math.max(0, P.lock14 - dt);
      if (P.heat14 > 0) P.heat14 = Math.max(0, P.heat14 - dt * ((G.t - (P.lastShot14 || -9)) < 0.3 ? CFG.coolFire : CFG.coolIdle));
      // perfect dash: venom touches the apple in the first 80 ms of a dash
      if (P.dashT > (P.dashPrev14 || 0)) { P.dashAt14 = G.t; P.pd14 = false; }
      P.dashPrev14 = P.dashT;
      if (P.dashT > 0 && !P.pd14 && G.t - (P.dashAt14 || -9) <= CFG.pdWin + 1e-6) {
        for (const v of G.venom) {
          if (!v || v.friendly) continue;
          if (dist2(v.x, v.y, P.x, P.y) < (v.r + P.r) * (v.r + P.r)) {
            P.pd14 = true; P.dashCd = 0; G.slow14 = CFG.slowT;
            floatText(P.x, P.y - 34, 'PERFECT', '#9fe8ff', true);
            safe(() => Sfx.blip()); Meta.add('perfectDash');
            break;
          }
        }
      }
    }
    // hit stop on a boss stage line
    if (G.room) { const st = G.room.snakes.reduce((a, s) => a + (s.isBoss && s.alive ? s.stage14 || 0 : 0), 0); if (st > bossStage && !calm()) HS.n = Math.max(HS.n, 3); }
    // the replay: every second update, the things the room draws from
    if ((RP.k = (RP.k + 1) % 2) === 0 && G.room) safe(() => record());
    return r;
  });
  Hooks.layer('Game.startRun', 'v14.10 core feel reset', function (next) {
    G.slow14 = 0; RP.buf.length = 0; HS.n = 0;
    return next.apply(this, [].slice.call(arguments, 1));
  });

  /* ---------------------------------------------------------------- hit stop (screen only) */
  safe(() => {
    const ok0 = Game.onSnakeKilled;
    Game.onSnakeKilled = function (sn) {
      const r = ok0.apply(this, arguments);
      if (sn && !calm() && (sn.isBoss || sn.champ || (sn.maxHp || 0) >= 12)) HS.n = Math.max(HS.n, sn.isBoss ? 4 : 2);
      return r;
    };
    const rd0 = render;
    render = function (dt) {
      if (HS.n > 0 && G.state === 'play') { HS.n--; return; }   // keep the last frame on screen
      return rd0.apply(this, arguments);
    };
  });

  /* ---------------------------------------------------------------- damage numbers (screen only) */
  const DN = [];
  Hooks.layer('Snake.hurt', 'v14.10 damage numbers', function (next, amount, fx, fy, isPoison) {
    const hp0 = this.hp, r = next.call(this, amount, fx, fy, isPoison);
    if (on('dmgnum14')) {
      const n = Math.max(0, hp0 - Math.max(0, this.hp));
      if (n > 0) {
        const last = DN.find((d) => d.sn === this && d.t < 0.12);
        if (last) { last.n += n; last.x = this.x; last.y = this.y; } else if (DN.length < 40) DN.push({ sn: this, x: this.x, y: this.y, n, t: 0, ox: (DN.length % 5) * 3 - 6 });
      }
    }
    return r;
  });

  /* ---------------------------------------------------------------- seed types: which ones, and how many powerups stack on each */
  const TYPES = [['normal', 'NORMAL', '#ece2d4'], ['pierce', 'PIERCE', '#9fe8ff'], ['split', 'SPLIT', '#ffd27a'], ['bounce', 'BOUNCE', '#b8f08a']];
  const itemTypes = new Map();
  function typesOf(id) {
    let t = itemTypes.get(id);
    if (t) return t;
    t = [];
    const src = safe(() => String(ITEMS[id] && ITEMS[id].apply), '');
    if (/\.(pierce|pick|cannon)\s*=\s*(true|!0)/.test(src)) t.push('pierce');
    if (/\.split\s*=\s*(true|!0)/.test(src)) t.push('split');
    if (/\.(bounce|coaster)\s*=\s*(true|!0)/.test(src)) t.push('bounce');
    itemTypes.set(id, t);
    return t;
  }
  function ammo(P) {
    const n = { normal: 1, pierce: 0, split: 0, bounce: 0 };
    for (const id of P.items || []) for (const k of typesOf(id)) n[k]++;
    if (P.pierce || P.pick || P.cannon) n.pierce = Math.max(1, n.pierce);
    if (P.split) n.split = Math.max(1, n.split);
    if (P.bounce || P.coaster) n.bounce = Math.max(1, n.bounce);
    return n;
  }

  /* ---------------------------------------------------------------- drawing in the room */
  let lastNow = 0;
  const ds0 = drawSeeds;
  drawSeeds = function (c) {
    const r = ds0.apply(this, arguments);
    safe(() => {
      // seed type marks: a long glint for pierce, two ticks for split, a ring for bounce, a halo for a charged seed
      for (const s of G.seeds) {
        if (s.can || s.melon27) continue;
        const R = 5 * (s.size || 1), a = s.rot || 0;
        if (s.charged14) { c.strokeStyle = 'rgba(255,240,180,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.arc(s.x, s.y - 3, R + 3.5, 0, TAU); c.stroke(); }
        if (s.pierce) { c.strokeStyle = 'rgba(159,232,255,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(s.x - Math.cos(a) * (R + 7), s.y - 3 - Math.sin(a) * (R + 7)); c.lineTo(s.x - Math.cos(a) * R, s.y - 3 - Math.sin(a) * R); c.stroke(); }
        if (s.split) { c.fillStyle = 'rgba(255,210,122,0.85)'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(s.x + Math.cos(a + sd * 1.9) * (R + 1.5), s.y - 3 + Math.sin(a + sd * 1.9) * (R + 1.5), 1.1, 0, TAU); c.fill(); } }
        if (s.bounce) { c.strokeStyle = 'rgba(184,240,138,0.7)'; c.lineWidth = 1; c.beginPath(); c.arc(s.x, s.y - 3, R + 1.8, 0, TAU); c.stroke(); }
      }
      // damage numbers
      const now = performance.now(), dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0; lastNow = now;
      if (DN.length) {
        c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = DN.length - 1; i >= 0; i--) {
          const d = DN[i]; d.t += dt;
          if (d.t > 0.8 || !on('dmgnum14')) { DN.splice(i, 1); continue; }
          const u = d.t / 0.8, big = d.n >= 3;
          c.globalAlpha = 1 - u * u;
          c.font = `700 ${big ? 11 : 9}px "Barlow Condensed", "Arial Narrow", sans-serif`;
          const txt = d.n >= 10 ? String(Math.round(d.n)) : String(Math.round(d.n * 10) / 10);
          const x = d.x + d.ox, y = d.y - 16 - u * 14;
          c.lineWidth = 2.6; c.strokeStyle = 'rgba(16,10,8,0.85)'; c.strokeText(txt, x, y);
          c.fillStyle = big ? '#ffd36a' : '#f2e6d0'; c.fillText(txt, x, y);
        }
        c.restore();
      }
    });
    return r;
  };

  // rings: how close you have to be to use a pedestal, the till or a pump
  function ring(c, x, y, R, P, col) {
    const d = dist(P.x, P.y, x, y);
    if (d > R * 2.4) return;
    const inside = d < R, k = clamp(1 - (d - R) / (R * 1.4), 0, 1);
    c.save();
    c.globalAlpha = inside ? 0.75 : 0.18 + 0.4 * k;
    c.strokeStyle = col; c.lineWidth = inside ? 1.8 : 1.2;
    if (!inside) c.setLineDash([4, 5]);
    c.beginPath(); c.ellipse(x, y, R, R * 0.72, 0, 0, TAU); c.stroke();
    c.restore();
  }
  const df0 = drawFloorThings;
  drawFloorThings = function (c, room, t) {
    const r = df0.apply(this, arguments);
    safe(() => {
      if (!room || G.state !== 'play') return;
      for (const P of livePlayers14()) {
        if (!P || P.dying > 0) continue;
        for (const p of room.pickups) if (p.kind === 'item' && p.t > 0.7) ring(c, p.x, p.y - 10, P.r + 14, P, p.cost ? '#ffd84a' : '#ece2d4');
        if (room.till9) ring(c, room.till9.x + T * 0.5, room.till9.y + 4, P.r + 34, P, '#ffd84a');
        if (room.pumps9) for (const o of room.pumps9) if (o.offer && !o.used) ring(c, o.x, o.y, P.r + 24, P, '#3ad86a');
      }
    });
    return r;
  };
  // heat and charge over the apple
  const po0 = drawPlayerOver;
  drawPlayerOver = function (c, P, t) {
    const r = po0.apply(this, arguments);
    safe(() => {
      if (!P || P.dying > 0) return;
      const R = (P.R || P.r || 12) + 7;
      if (P.heat14 > 0.02 || P.lock14 > 0) {
        const h = P.lock14 > 0 ? 1 : P.heat14;
        c.lineWidth = 2.4; c.strokeStyle = 'rgba(0,0,0,0.35)';
        c.beginPath(); c.arc(P.x, P.y - 2, R, Math.PI * 0.8, Math.PI * 2.2); c.stroke();
        c.strokeStyle = P.lock14 > 0 ? `rgba(255,80,40,${0.6 + 0.4 * Math.sin(t * 20)})` : h > 0.75 ? '#ff7a3a' : '#ffb43a';
        c.beginPath(); c.arc(P.x, P.y - 2, R, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * h)); c.stroke();
      }
      const ch = P.chargeCd14 > 0 ? 0 : clamp((P.charge14 || 0) / CFG.chargeT, 0, 1);
      if (ch > 0.15 && G.t - (P.lastShot14 || -9) < 0.5) {
        c.strokeStyle = ch >= 1 ? '#fff0b4' : 'rgba(255,240,180,0.55)'; c.lineWidth = ch >= 1 ? 2.2 : 1.4;
        c.beginPath(); c.arc(P.x, P.y - 2, R + 4, -Math.PI / 2, -Math.PI / 2 + TAU * ch); c.stroke();
      }
    });
    return r;
  };

  /* ---------------------------------------------------------------- the seed type row in the HUD */
  const hud0 = renderHUD;
  renderHUD = function (c, L) {
    const r = hud0.apply(this, arguments);
    safe(() => {
      if (G.state !== 'play' || !G.player || !G.run) return;
      const n = ammo(G.player);
      c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      const x0 = 12, y0 = View.H - (Input.touchMode ? 150 : 20);
      c.font = '700 11px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textBaseline = 'middle';
      let x = x0;
      for (const [k, label, col] of TYPES) {
        const lit = n[k] > 0, txt = label + (n[k] > 1 ? ' ' + n[k] : '');
        const w = c.measureText(txt).width + 12;
        c.globalAlpha = lit ? 0.92 : 0.28;
        c.fillStyle = 'rgba(12,8,7,0.75)'; rrect(c, x, y0 - 8, w, 16, 4); c.fill();
        c.strokeStyle = col; c.lineWidth = 1; rrect(c, x + 0.5, y0 - 7.5, w - 1, 15, 4); c.stroke();
        c.fillStyle = col; c.fillText(txt, x + 6, y0 + 0.5);
        x += w + 4;
      }
      c.restore();
    });
    return r;
  };

  /* ---------------------------------------------------------------- touch: auto fire, a tap on the aim side dashes */
  const TA = { last: null, down: 0, ox: 0, oy: 0 };
  safe(() => {
    const av0 = Input.aimVec;
    Input.aimVec = function (px, py) {
      const v = av0.apply(this, arguments);
      if (v && v.touch) { TA.last = { x: v.x, y: v.y }; return v; }
      if (v || !on('autofire14') || !this.touchMode || G.state !== 'play' || !TA.last) return v;
      const room = G.room, P = G.player;
      if (!room || !P || P.dying > 0 || !room.snakes.some((s) => s.alive && s.canBeHit())) return v;
      let ax = TA.last.x, ay = TA.last.y;
      if (Save.data.assist) safe(() => { [ax, ay] = assistAim(room, P, ax, ay); });
      return { x: ax, y: ay, touch: true, auto14: true };
    };
    const dn0 = Input.down, up0 = Input.up;
    Input.down = function (e) {
      const r = dn0.apply(this, arguments);
      safe(() => { const s = this.sticks.aim; if (s && s.id === e.pointerId && e.pointerType !== 'mouse') { TA.down = performance.now(); TA.ox = s.ox; TA.oy = s.oy; } });
      return r;
    };
    Input.up = function (e) {
      const s = this.sticks.aim, mine = s && s.id === e.pointerId && e.pointerType !== 'mouse';
      const quick = mine && performance.now() - TA.down < 200 && Math.hypot(s.x - TA.ox, s.y - TA.oy) < 14;
      const r = up0.apply(this, arguments);
      if (quick && on('autofire14') && G.state === 'play') this.dashReq = true;
      return r;
    };
  });

  /* ---------------------------------------------------------------- death replay: the last 3 seconds */
  function record() {
    const room = G.room;
    const f = {
      room, t: G.t,
      pl: players14().map((P) => ({ P, x: P.x, y: P.y, hp: P.hp, dying: P.dying, aimX: P.aimX, aimY: P.aimY, lookX: P.lookX, lookY: P.lookY, hop: P.hop, hopH: P.hopH, vx: P.vx, vy: P.vy, squash: P.squash, recoil: P.recoil, dashT: P.dashT, inv: P.inv })),
      sn: room.snakes.map((s) => ({ s, x: s.x, y: s.y, alive: s.alive, hp: s.hp, ang: s.ang, drawAng: s.drawAng, mouth: s.mouth, cloak: s.cloak, delay: s.delay, burrowed: s.burrowed, state: s.state, pts: s.pts ? s.pts.map((p) => (p ? [p.x, p.y] : null)) : null })),
      seeds: G.seeds.map((s) => Object.assign({}, s)),
      venom: G.venom.map((v) => Object.assign({}, v)),
    };
    RP.buf.push(f);
    const max = Math.round(CFG.replayS * 30);
    if (RP.buf.length > max) RP.buf.splice(0, RP.buf.length - max);
  }
  const PL_KEYS = ['x', 'y', 'hp', 'dying', 'aimX', 'aimY', 'lookX', 'lookY', 'hop', 'hopH', 'vx', 'vy', 'squash', 'recoil', 'dashT', 'inv'];
  const SN_KEYS = ['x', 'y', 'alive', 'hp', 'ang', 'drawAng', 'mouth', 'cloak', 'delay', 'burrowed', 'state'];
  let replayOn = false;
  // draw frame f with the game's own room renderer: put the recorded values in, draw, put everything back
  function drawFrame(cv, f) {
    const room = G.room; if (!room || f.room !== room) return false;
    const keepPl = f.pl.map((q) => { const o = {}; for (const k of PL_KEYS) o[k] = q.P[k]; return o; });
    const keepSn = room.snakes, keepSeeds = G.seeds, keepVenom = G.venom;
    const keepS = f.sn.map((q) => { const o = {}; for (const k of SN_KEYS) o[k] = q.s[k]; o.pts = q.s.pts ? q.s.pts.map((p) => (p ? [p.x, p.y] : null)) : null; return o; });
    const keepState = G.state, keepShake = G.shake;
    try {
      f.pl.forEach((q) => { for (const k of PL_KEYS) q.P[k] = q[k]; });
      f.sn.forEach((q) => { for (const k of SN_KEYS) q.s[k] = q[k]; if (q.pts && q.s.pts) q.s.pts.forEach((p, i) => { if (p && q.pts[i]) { p.x = q.pts[i][0]; p.y = q.pts[i][1]; } }); });
      room.snakes = f.sn.map((q) => q.s); G.seeds = f.seeds; G.venom = f.venom; G.state = 'play'; G.shake = 0;
      replayOn = true;
      const c = cv.getContext('2d');
      c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      c.fillStyle = (G.levelDef || LEVELS[0]).void; c.fillRect(0, 0, View.W, View.H);
      renderRoom(c, G.levelDef || LEVELS[0]);
      return true;
    } finally {
      replayOn = false;
      f.pl.forEach((q, i) => { for (const k of PL_KEYS) q.P[k] = keepPl[i][k]; });
      f.sn.forEach((q, i) => { const o = keepS[i]; for (const k of SN_KEYS) q.s[k] = o[k]; if (o.pts && q.s.pts) q.s.pts.forEach((p, j) => { if (p && o.pts[j]) { p.x = o.pts[j][0]; p.y = o.pts[j][1]; } }); });
      room.snakes = keepSn; G.seeds = keepSeeds; G.venom = keepVenom; G.state = keepState; G.shake = keepShake;
    }
  }
  // particles and floating words belong to the moment of death: leave them out of the replay
  safe(() => {
    const dp0 = drawParticles; drawParticles = function () { if (replayOn) return; return dp0.apply(this, arguments); };
    const dt0 = drawTexts; drawTexts = function () { if (replayOn) return; return dt0.apply(this, arguments); };
  });
  const RV = { raf: 0, i: 0, off: null, frames: null };
  function stopReplay() { if (RV.raf) cancelAnimationFrame(RV.raf); RV.raf = 0; RV.frames = null; }
  function showReplay() {
    stopReplay();
    const over = document.getElementById('over'); if (!over) return;
    let box = over.querySelector('.replay14');
    const frames = RP.buf.filter((f) => f.room === G.room);
    if (frames.length < 10) { if (box) box.hidden = true; return; }
    if (!box) {
      box = document.createElement('figure'); box.className = 'replay14';
      box.innerHTML = '<canvas aria-label="The last seconds before you were eaten"></canvas><figcaption>Last 3 seconds</figcaption>';
      const stack = over.querySelector('.stack'); if (stack) stack.insertAdjacentElement('afterend', box); else over.prepend(box);
    }
    box.hidden = false;
    const cv = box.querySelector('canvas');
    const W = Math.min(420, Math.round(window.innerWidth * 0.8)), H = Math.round(W * View.H / View.W);
    cv.width = Math.round(W * View.dpr); cv.height = Math.round(H * View.dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const off = RV.off || (RV.off = document.createElement('canvas'));
    off.width = Math.round(View.W * View.dpr); off.height = Math.round(View.H * View.dpr);
    RV.frames = frames; RV.i = 0;
    const c = cv.getContext('2d');
    let acc = 0, last = performance.now();
    const step = (now) => {
      if (!RV.frames || G.state !== 'over' || over.hidden) { stopReplay(); return; }
      acc += (now - last) / 1000; last = now;
      // 30 recorded frames a second, played at 60%, a short hold on the last frame
      if (acc >= 1 / 18 || RV.i === 0) {
        acc = 0;
        const f = RV.frames[Math.min(RV.i, RV.frames.length - 1)];
        if (safe(() => drawFrame(off, f), false)) { c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0, cv.width, cv.height); }
        RV.i++; if (RV.i > RV.frames.length + 12) RV.i = 0;
      }
      RV.raf = requestAnimationFrame(step);
    };
    RV.raf = requestAnimationFrame(step);
  }
  safe(() => {
    const go0 = Game.gameOver;
    Game.gameOver = function () { const r = go0.apply(this, arguments); if (G.state === 'over') safe(showReplay); return r; };
    const tm0 = Game.toMenu;
    Game.toMenu = function () { stopReplay(); return tm0.apply(this, arguments); };
  });

  /* ---------------------------------------------------------------- styles, test hooks */
  safe(() => {
    const st = document.createElement('style'); st.id = 'core1410css';
    st.textContent = `#over .replay14{margin:6px auto 8px;display:flex;flex-direction:column;align-items:center;gap:3px}
#over .replay14 canvas{border:2px solid rgba(236,226,212,.25);border-radius:8px;background:#0b0807;max-width:80vw}
#over .replay14 figcaption{font:600 13px "Barlow Condensed",sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.65}`;
    document.head.appendChild(st);
  });
  Object.assign(B, { CORE1410: { CFG, HS, RP, DN, ammo, typesOf, kbW, showReplay, drawFrame } });
})();
