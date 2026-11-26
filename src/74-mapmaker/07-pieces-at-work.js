/* 74.js section 07: pieces-at-work. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { ART, BUMP, CH_COLS, DIRS, FB_SPD, FONT, GH, GW, MK, RTM, bossSprite, buildFloor, fbBall, gateOpen, label, mustFight, openExit, pullLever, safe, snakeSprite } = M74;
  M74.wrapText = wrapText;
  /* ================================================================== 7. the new pieces at work */
  const TT_RATE = [0, 3.2, 2.2, 1.4], NEST_RATE = [0, 6, 4, 2.6], JP_V = [0, 430, 600, 780];
  const inCell = (P, k, pad) => Math.abs(P.x - k.x) < T / 2 - pad && Math.abs(P.y - k.y) < T / 2 - pad; M74.inCell = inCell;

  function teleport(room, k) {
    const pads = G.map.mkPads.filter((p) => (p.e.ch || 0) === (k.ch || 0));
    const P = G.player, col = CH_COLS[k.ch || 0];
    if (pads.length < 2) {
      if (!(k.fizz > G.t)) { k.fizz = G.t + 1.6; floatText(k.x, k.y - 22, 'NO PARTNER', '#b8a8a0'); Sfx.zap(); }
      return;
    }
    const i = pads.findIndex((p) => p.e === k), to = pads[(i + 1) % pads.length];
    Sfx.warp();
    burst(P.x, P.y, 14, col, { min: 30, max: 110, lmin: 0.3, lmax: 0.6, glow: true });
    P.mkTpLock = true;
    if (to.room === room) {
      P.x = to.e.x; P.y = to.e.y; P.kbx = 0; P.kby = 0;
      burst(P.x, P.y, 14, col, { min: 30, max: 110, lmin: 0.3, lmax: 0.6, glow: true });
      flashLight(P.x, P.y, 80, 0.8, 0.5);
    } else {
      RTM.tpTo = to;
      G.trans = { kind: 'door', phase: 'out', t: 0, to: to.room, dir: null };
    }
  }
  function sawRange(room, k) {
    let lo = k.ax === 'v' ? k.r : k.c, hi = lo;
    if (k.ax === 'v') { while (lo > 0 && !room.solid(k.c, lo - 1)) lo--; while (hi < GH - 1 && !room.solid(k.c, hi + 1)) hi++; }
    else { while (lo > 0 && !room.solid(lo - 1, k.r)) lo--; while (hi < GW - 1 && !room.solid(hi + 1, k.r)) hi++; }
    k.lo = (lo + 0.5) * T; k.hi = (hi + 0.5) * T; k.ver = room.ver;
  }
  function hurtSnakesAt(room, x, y, r, dmg, tag, cd, burn) {
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed || (sn[tag] || 0) > G.t) continue;
      if (!sn.hitTest(x, y, r)) continue;
      sn.hurt(sn.isBoss ? dmg * 0.5 : dmg, x, y);
      if (burn && !sn.K.fireproof) sn.burn = Math.max(sn.burn || 0, 1);
      sn[tag] = G.t + cd;
    }
  }
  function reflect(o, k, R) {
    const dx = o.x - k.x, dy = o.y - k.y, d = Math.hypot(dx, dy);
    if (d >= R || d < 0.01) return false;
    const nx = dx / d, ny = dy / d, vn = o.vx * nx + o.vy * ny;
    if (vn >= 0) return false;
    o.vx -= 2 * vn * nx; o.vy -= 2 * vn * ny;
    const sp = Math.hypot(o.vx, o.vy), want = Math.min(900, sp * 1.12);
    o.vx *= want / (sp || 1); o.vy *= want / (sp || 1);
    o.x = k.x + nx * (R + 1); o.y = k.y + ny * (R + 1);
    return true;
  }
  function killOb(room, k, col, kind) {
    const o = k.ob; if (!o || o.broken) return;
    room.removeObstacle(o); o.broken = true; k.dead = true;
    burst(o.x, o.y, 14, col, { kind: kind || 'shard', min: 40, max: 150, rmin: 1.5, rmax: 3.4, lmin: 0.35, lmax: 0.8, drag: 4 });
  }
  function blowKeg(room, k) {
    if (k.dead) return;
    killOb(room, k, '#7a4a22');
    explode(room, k.x, k.y, 66, { dmg: 1, snakeDmg: 7 });
  }

  function mkUpdate(dt, room, frozen) {
    const P = G.player, alive = P.dying <= 0 && P.escaping <= 0 && !G.trans;
    if (P.mkTpLock && !room.mkE.some((k) => k.t === 'tp' && dist(P.x, P.y, k.x, k.y) < 24)) P.mkTpLock = false;
    for (const k of room.mkE) {
      if (k.dead) continue;
      switch (k.t) {
        case 'tp':
          k.on = !room.locked;
          if (alive && k.on && !P.mkTpLock && dist(P.x, P.y, k.x, k.y) < 12) teleport(room, k);
          break;
        case 'jp': {
          k.cd = Math.max(0, k.cd - dt); k.k = Math.max(0, k.k - dt * 4);
          const d = DIRS[k.d || 0], v = JP_V[k.f || 2];
          if (alive && k.cd <= 0 && dist(P.x, P.y, k.x, k.y) < 14) {
            P.kbx = d[0] * v; P.kby = d[1] * v; P.vx *= 0.3; P.vy *= 0.3; P.squash = 0.7;
            k.cd = 0.5; k.k = 1;
            Sfx.boost(); Sfx.tone(320, 0.16, { to: 760, type: 'triangle', vol: 0.06 });
            burst(k.x, k.y, 10, '#ffd23a', { min: 30, max: 110, lmin: 0.25, lmax: 0.5 });
          }
          for (const ct of room.carts) if (dist(ct.x, ct.y, k.x, k.y) < 15 && !(ct.mkJp > G.t)) { ct.vx = d[0] * v * 0.8; ct.vy = d[1] * v * 0.8; ct.mkJp = G.t + 0.5; k.k = 1; }
          break;
        }
        case 'sp': {
          const d = DIRS[k.d || 0];
          if (alive && inCell(P, k, 2)) { P.kbx = approach(P.kbx, d[0] * 330, 2600 * dt); P.kby = approach(P.kby, d[1] * 330, 2600 * dt); }
          for (const ct of room.carts) if (inCell(ct, k, 0)) { ct.vx = approach(ct.vx, d[0] * 300, 1600 * dt); ct.vy = approach(ct.vy, d[1] * 300, 1600 * dt); }
          for (const p of room.pickups) if ((p.kind === 'coin' || p.kind === 'heart') && p.vx != null && inCell(p, k, 0)) { p.x += d[0] * 120 * dt; p.y += d[1] * 120 * dt; }
          break;
        }
        case 'bm': {
          k.cd -= dt; k.k = Math.max(0, k.k - dt * 5);
          if (alive && k.cd <= 0 && dist(P.x, P.y, k.x, k.y) < P.r + 16) {
            const a = Math.atan2(P.y - k.y, P.x - k.x);
            P.kbx = Math.cos(a) * 470; P.kby = Math.sin(a) * 470;
            k.cd = 0.18; k.k = 1;
            Sfx.tone(880, 0.12, { type: 'square', vol: 0.05, lp: 2600 }); Sfx.tone(1320, 0.1, { type: 'triangle', vol: 0.04, delay: 0.04 });
            flashLight(k.x, k.y, 70, 0.7, 0.3);
          }
          let bounced = false;
          for (const s of G.seeds) if (reflect(s, k, 13 + 4 * (s.size || 1))) { s.rot = Math.atan2(s.vy, s.vx); s.t = Math.min(s.t, s.life * 0.5); s.hits = null; bounced = true; }
          for (const v of G.venom) if (reflect(v, k, 19)) bounced = true;
          if (bounced) { k.k = Math.max(k.k, 0.6); if (!(k.snd > G.t)) { k.snd = G.t + 0.08; Sfx.tone(1100, 0.06, { type: 'square', vol: 0.03, lp: 3000 }); } }
          break;
        }
        case 'lv': {
          k.cd -= dt; k.swing = approach(k.swing, 0, dt * 4);
          const d = dist(P.x, P.y, k.x, k.y);
          if (alive && d < P.r + 18 && !k.touch) { k.touch = true; pullLever(room, k); }
          else if (d > P.r + 28) k.touch = false;
          break;
        }
        case 'gt': k.lift = approach(k.lift, gateOpen(G.map, k) ? 1 : 0, dt * 5); break;
        case 'fb': {
          if (!frozen) k.ang += dt * (k.w || 1) * FB_SPD[k.s || 2];
          k.hitT -= dt;
          const n = k.n || 4;
          for (let i = 0; i < n; i++) {
            const bx = k.x + Math.cos(k.ang) * (12 + i * 12), by = k.y + Math.sin(k.ang) * (12 + i * 12);
            if (alive && dist(P.x, P.y, bx, by) < P.r * 0.55 + 5.5) P.hurt(1, bx, by);
            hurtSnakesAt(room, bx, by, 5.5, 1.6, 'mkFbT', 0.45, true);
          }
          if (Math.random() < dt * 8) { const i = Math.floor(Math.random() * n); addP({ kind: 'dot', x: k.x + Math.cos(k.ang) * (12 + i * 12), y: k.y + Math.sin(k.ang) * (12 + i * 12), vx: rnd(-10, 10), vy: rnd(-40, -15), r: rnd(0.8, 1.8), life: 0.4, col: '#ffb43a', glow: true, drag: 2 }); }
          break;
        }
        case 'sw': {
          if (k.ver !== room.ver || k.lo == null) sawRange(room, k);
          if (!frozen) {
            k.spin += dt * 16 * k.dir;
            if (k.ax === 'v') { k.y += k.dir * k.v * dt; if (k.y >= k.hi) { k.y = k.hi; k.dir = -1; } else if (k.y <= k.lo) { k.y = k.lo; k.dir = 1; } }
            else { k.x += k.dir * k.v * dt; if (k.x >= k.hi) { k.x = k.hi; k.dir = -1; } else if (k.x <= k.lo) { k.x = k.lo; k.dir = 1; } }
          }
          if (alive && dist(P.x, P.y, k.x, k.y) < P.r * 0.6 + 11) P.hurt(1, k.x, k.y);
          hurtSnakesAt(room, k.x, k.y, 11, 2, 'mkSawT', 0.5, false);
          if (Math.random() < dt * 10) addP({ kind: 'dot', x: k.x + rnd(-6, 6), y: k.y + rnd(-6, 6), vx: rnd(-60, 60), vy: rnd(-60, 20), r: rnd(0.6, 1.2), life: 0.25, col: '#ffe8a0', glow: true, drag: 3 });
          break;
        }
        case 'tt': {
          if (frozen || !alive) break;
          const active = k.on === 'a' || (room.locked && !room.cleared);
          if (!active) { k.charge = Math.max(0, k.charge - dt * 2); break; }
          const aimA = Math.atan2(P.y - k.y, P.x - k.x);
          k.aimA = k.aimA == null ? aimA : turnToward(k.aimA, aimA, dt * 3);
          k.cd -= dt; k.charge = clamp(1 - k.cd / 0.6, 0, 1);
          if (k.cd <= 0) {
            const a = k.d === 8 ? k.aimA : Math.atan2(DIRS[k.d || 0][1], DIRS[k.d || 0][0]);
            spawnVenom(k.x + Math.cos(a) * 16, k.y + Math.sin(a) * 16, a, (G.levelDef.venomSpeed || 150) * 0.85, '#b6e04a');
            Sfx.spit();
            k.cd = TT_RATE[k.s || 2];
          }
          break;
        }
        case 'bx':
          if (k.fuse > 0) { k.fuse -= dt; if (Math.random() < dt * 30) addP({ kind: 'dot', x: k.x + 4, y: k.y - 20, vx: rnd(-30, 30), vy: rnd(-60, -20), r: rnd(0.6, 1.4), life: 0.3, col: '#ffd24a', glow: true, drag: 2 }); if (k.fuse <= 0) blowKeg(room, k); }
          break;
        case 'ns': {
          if (frozen || !room.locked || room.cleared || !alive) break;
          k.cd -= dt;
          const out = room.snakes.filter((s) => s.alive && s.mkNest === k).length;
          if (k.cd <= 0 && out < (k.n || 3)) {
            k.cd = NEST_RATE[k.s || 2];
            const cell = nearestFreeCell(room, k.x, k.y + 6, (c, r) => c === k.c && r === k.r);
            const sn = safe(() => new Snake(k.k || 'grub', cell.x, cell.y, { delay: 0, spawnTime: 0.6, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
            if (sn) { sn.mkNest = k; room.snakes.push(sn); Sfx.hiss(0.7); burst(k.x, k.y, 8, '#5a4030', { kind: 'chunk', min: 20, max: 80, lmin: 0.3, lmax: 0.6, drag: 3 }); if (k.ob) k.ob.shake = 0.3; }
          }
          break;
        }
        case 'ac': {
          if (alive && inCell(P, k, 5)) {
            const hit = P.hurt(1, P.x - P.vx * 0.05, P.y - P.vy * 0.05 + 1);
            if (hit) { Sfx.tone(420, 0.25, { to: 160, type: 'sawtooth', vol: 0.05, lp: 1200 }); floatText(P.x, P.y - 24, 'ACID', '#9be37a'); }
            if (Math.random() < dt * 20) addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y + rnd(-4, 6), vx: rnd(-10, 10), vy: rnd(-50, -20), r: rnd(0.8, 1.6), life: 0.4, col: '#b8ff4a', glow: true, drag: 2 });
          }
          for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && !sn.isBoss && inCell(sn, k, 4) && !(sn.mkAcT > G.t)) { sn.hurt(0.8, sn.x, sn.y, true); sn.mkAcT = G.t + 0.5; }
          break;
        }
        case 'wk':
          if (k.state === 0 && alive && inCell(P, k, 4)) { k.state = 1; k.tm = 0; Sfx.crumble(); }
          else if (k.state === 1) {
            k.tm += dt;
            if (Math.random() < dt * 16) addP({ kind: 'dot', x: k.x + rnd(-16, 16), y: k.y + rnd(-16, 16), vx: rnd(-10, 10), vy: rnd(-30, -10), r: rnd(0.8, 1.8), life: 0.5, col: G.levelDef.dirt || '#5a4332', drag: 2 });
            if (k.tm > 0.65) { const onIt = Math.abs(P.x - k.x) < T / 2 + P.r - 6 && Math.abs(P.y - k.y) < T / 2 + P.r - 6; collapseCell(room, k, onIt && P.dying <= 0); k.state = 2; }
          }
          break;
        default: break;
      }
    }
    if (room.type === 'survival' && room.surv && room.surv.on && room.mkSn && room.mkSn.length && !room.mkSnDone) { room.mkSnDone = true; M74.spawnMapSnakes(room); }
    if (room.mkExit && !room.exit && !room.locked && !mustFight(room)) openExit(room);
  }

  /* ---- the hooks into the game's own update and drawing */
  safe(() => {
    const ure0 = updateRoomExtras;
    updateRoomExtras = function (dt, room, frozen) {
      ure0.apply(this, arguments);
      if (room && room.mkE && G.map && G.state === 'play') safe(() => mkUpdate(dt, room, frozen));
    };
    const ho0 = hitObstacle;
    hitObstacle = function (room, o) { if (o && o.mk) { mkHit(room, o, 1); return; } return ho0.apply(this, arguments); };
    const bo0 = breakObstacle;
    breakObstacle = function (room, o) { if (o && o.mk) { mkHit(room, o, 4); return; } return bo0.apply(this, arguments); };
  });
  function mkHit(room, o, n) {
    const k = o.mk; if (!k || k.dead) return;
    o.shake = 0.3;
    if (o.type === 'mkLever') { pullLever(room, k); return; }
    if (o.type === 'mkKeg') {
      if (k.fuse > 0) return;
      if (n >= 4) { k.fuse = 0.15; Sfx.fuse(); return; }
      o.hp -= 1; Sfx.clank();
      if (o.hp <= 0) { k.fuse = 0.28; Sfx.fuse(); }
      return;
    }
    if (o.type === 'mkTotem') {
      if (!o.breakable) return;
      o.hp -= n >= 4 ? 3 : 1; Sfx.thud();
      if (o.hp <= 0) { killOb(room, k, '#6a625a'); Sfx.breakUrn(); addDecal(room, 'crack', k.x, k.y, 14, '#000000'); }
      return;
    }
    if (o.type === 'mkNest') {
      o.hp -= n >= 4 ? 3 : 1;
      if (o.hp <= 0) {
        killOb(room, k, '#4a3624', 'chunk'); Sfx.squelch();
        addDecal(room, 'splat', k.x, k.y, 14, '#2a1a10');
        floatText(k.x, k.y - 24, 'NEST DOWN', '#ffd27a', true);
      } else if (Math.random() < 0.4) Sfx.splat();
    }
  }

  function drawMkFloor(c, room, t) {
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'ac') ART.ac(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'wk' && k.state < 2) ART.wk(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'sp') ART.sp(c, k.x, k.y, k, t, 'game');
    }
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'jp') ART.jp(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'tp') ART.tp(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'ex' && !room.exit) ART.ex(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'pd') ART.pd(c, k.x, k.y + 4, k, t, 'game');
      else if (k.t === 'sw') ART.swGroove(c, k);
    }
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'sw') ART.swBlade(c, k.x, k.y, k.spin);
      else if (k.t === 'sg') ART.sg(c, k.x, k.y, k, t, 'game');
    }
  }
  function drawMkHigh(c, room, t) {
    for (const k of room.mkE) {
      if (k.dead || k.t !== 'fb') continue;
      for (let i = 0; i < (k.n || 4); i++) fbBall(c, k.x + Math.cos(k.ang) * (12 + i * 12), k.y + Math.sin(k.ang) * (12 + i * 12), 5.5, t, i);
    }
  }
  function wrapText(c, s, maxW) {
    const words = String(s).split(/\s+/).filter(Boolean), lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (c.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 6);
  }
  function drawSignBubble(c, k, room, a) {
    c.save(); c.globalAlpha = a;
    c.font = `600 9.5px ${FONT}`;
    const lines = wrapText(c, k.txt || '', 128);
    if (!lines.length) { c.restore(); return; }
    const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 14, h = lines.length * 11.5 + 9;
    let x = clamp(k.x - w / 2, 4, RW - w - 4), y = k.y - 22 - h;
    if (y < 4) y = k.y + 24;
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 3, w, h);
    c.fillStyle = '#efe2c4'; c.fillRect(x, y, w, h);
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.2; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (y < k.y) { c.fillStyle = '#efe2c4'; c.beginPath(); c.moveTo(k.x - 5, y + h - 0.5); c.lineTo(k.x, y + h + 5); c.lineTo(k.x + 5, y + h - 0.5); c.fill(); }
    c.fillStyle = '#2a1a0c'; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach((l, i) => c.fillText(l, x + 7, y + 5 + i * 11.5));
    c.restore();
  }
  safe(() => {
    const df0 = drawFloorThings;
    drawFloorThings = function (c, room, t) { df0.apply(this, arguments); if (room && room.mkE && room.mkE.length) safe(() => drawMkFloor(c, room, t)); };
    const vb0 = drawVenomBodies;
    drawVenomBodies = function (c, t) { vb0.apply(this, arguments); const room = G.room; if (room && room.mkE && room.mkE.length) safe(() => drawMkHigh(c, room, t)); };
    const gl0 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      gl0.apply(this, arguments);
      if (!room || !room.mkE || !room.mkE.length) return;
      safe(() => {
        const P = G.player;
        c.globalCompositeOperation = 'lighter';
        for (const k of room.mkE) {
          if (k.dead) continue;
          if (k.t === 'tp') glowDot(c, k.x, k.y, k.on ? 30 : 18, CH_COLS[k.ch || 0], k.on ? 0.26 + 0.06 * Math.sin(t * 3 + k.t0) : 0.08);
          else if (k.t === 'fb') for (let i = 0; i < (k.n || 4); i++) glowDot(c, k.x + Math.cos(k.ang) * (12 + i * 12), k.y + Math.sin(k.ang) * (12 + i * 12), 15, '#ff7a2a', 0.32);
          else if (k.t === 'ac') glowDot(c, k.x, k.y, 26, '#7aff3a', 0.12 + 0.04 * Math.sin(t * 2 + k.t0));
          else if (k.t === 'lv') glowDot(c, k.x, k.y + 8, 12, CH_COLS[k.ch || 0], k.on ? 0.4 : 0.12);
          else if (k.t === 'bm' && k.k > 0) glowDot(c, k.x, k.y, 30, BUMP[k.st || 0][0], 0.5 * k.k);
          else if (k.t === 'tt' && k.charge > 0.05) glowDot(c, k.x, k.y, 18, '#c8ff4a', 0.35 * k.charge);
          else if (k.t === 'bx' && k.fuse > 0) glowDot(c, k.x, k.y, 34, '#ff6a1a', 0.3 + 0.2 * Math.sin(t * 40));
          else if (k.t === 'sw') glowDot(c, k.x, k.y, 16, '#ffe8a0', 0.08);
        }
        c.globalCompositeOperation = 'source-over';
        for (const k of room.mkE) {
          if (k.t !== 'sg' || k.dead) continue;
          const near = P && P.dying <= 0 && dist(P.x, P.y, k.x, k.y) < 52;
          k.show = approach(k.show || 0, near ? 1 : 0, 0.12);
          if (k.show > 0.02) drawSignBubble(c, k, room, k.show);
        }
      });
    };
    const xl0 = extraLights;
    extraLights = function (room, light) {
      xl0.apply(this, arguments);
      if (!room || !room.mkE) return;
      for (const k of room.mkE) {
        if (k.dead) continue;
        if (k.t === 'tp') light(k.x, k.y, k.on ? 48 : 26, k.on ? 0.6 : 0.3);
        else if (k.t === 'fb') { const n = k.n || 4; light(k.x + Math.cos(k.ang) * (6 + n * 6), k.y + Math.sin(k.ang) * (6 + n * 6), 20 + n * 9, 0.55); }
        else if (k.t === 'ac') light(k.x, k.y, 40, 0.42);
        else if (k.t === 'lv') light(k.x, k.y, 30, 0.3);
        else if (k.t === 'sg') light(k.x, k.y - 8, 30, 0.3);
        else if (k.t === 'bx' && k.fuse > 0) light(k.x, k.y, 70, 0.8);
      }
    };
    DYN9.mkBump = (c, o, room, t) => ART.bm(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkLever = (c, o, room, t) => ART.lv(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkGate = (c, o, room, t) => ART.gt(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkPivot = (c, o) => ART.fbPivot(c, o.x, o.y);
    DYN9.mkTotem = (c, o, room, t) => ART.tt(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    DYN9.mkKeg = (c, o, room, t) => ART.bx(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    DYN9.mkNest = (c, o, room, t) => ART.ns(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    if (typeof MINI9 === 'object') MINI9.hall = (c, mx, my, cur) => { c.fillStyle = cur ? '#5a4a3a' : '#8a7a6a'; c.fillRect(mx - 2, my - 0.8, 4, 1.6); };
  });

  Object.assign(MK, { ART, snakeSprite, bossSprite, buildFloor, label, fbBall, FB_SPD, BUMP });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
