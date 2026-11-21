/* src/86-v14-knokpit.js: v14.4: De Knokpit. A rare hidden arena room, hung off a fight room like Clini-Clown HQ.
   Three snake brawlers, each with an attack, a super and a trait:
     Senor Slam (lucha14): luchador tank. Punch combo up close, charges, super Vliegende Plons (leaps onto you).
       Trait Taai: below half health he takes 30% less damage.
     Hagel Hannie (hagel14): shotgun. Five pellet blasts at short range, super Hagelbui (twelve pellets, knockback).
       Trait Rolletje: rolls sideways when your seeds come close.
     Kid Kogel (kogel14): gunslinger. Six shot bursts from two revolvers at long range, super Kogelregen.
       Trait Scherpschutter: aims where you are going.
   Room: bright arena, bushes (in a bush you are hidden from the brawlers), loot boxes to break, three power pads
   (speed, power, shield), drops with a rarity when a brawler goes down, and a Mega Box when the arena is won.
   Seeded runs: whether a floor gets a Knokpit is decided by a generator of its own (run seed and floor), so a
   floor without one draws exactly the same Math.random calls as before. Everything in a tick uses Math.random
   (G.rng online), drawing uses no random at all, so online lockstep stays in step.
   Test hook: window.__bitten.KNOK14. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe86'); if (window.console) console.warn('v14 knokpit', e); return fb; } };
  const TYPE = 'brawl';
  const KNOK = { force: false, odds: 0.2, chaosOdds: 0.35, next: false }; // next: tests only, a fight room next to the start becomes the Knokpit
  const BRAWLERS = ['lucha14', 'hagel14', 'kogel14'];
  const IS = { lucha14: 1, hagel14: 1, kogel14: 1 };
  const isKnok = (room) => !!room && room.type === TYPE;

  /* ================================================================== the brawlers */
  Object.assign(KINDS, {
    lucha14: {
      name: 'Senor Slam', hp: 58, headR: 15, r0: 15, r1: 8, spacing: 9.5, maxLen: 11, minLen: 4, speed: 62, turn: 3.0, bite: 1, noMound: true,
      body: '#e8402a', body2: '#d0361f', outline: '#2a0804', hi: 'rgba(255,220,180,0.3)', blood: '#7a1a0a', eye: '#ffffff',
      mask: '#16b8d8', mask2: '#ffd23a', supT: 11, tag: '#ff6a4a',
    },
    hagel14: {
      name: 'Hagel Hannie', hp: 30, headR: 12, r0: 11.5, r1: 6, spacing: 7.5, maxLen: 11, minLen: 4, speed: 86, turn: 3.6, bite: 1, noMound: true,
      body: '#9a5ae8', body2: '#8a4ad8', outline: '#1a0a2a', hi: 'rgba(240,220,255,0.3)', blood: '#4a1a6a', eye: '#3ae8a0',
      band: '#ff8a1a', supT: 10, tag: '#c88aff',
    },
    kogel14: {
      name: 'Kid Kogel', hp: 26, headR: 11.5, r0: 11, r1: 5.5, spacing: 7.5, maxLen: 12, minLen: 4, speed: 80, turn: 3.4, bite: 1, noMound: true,
      body: '#3a7ae8', body2: '#326cd4', outline: '#081a3a', hi: 'rgba(220,235,255,0.3)', blood: '#1a3a7a', eye: '#ffe14a',
      hat: '#8a5a2a', supT: 12, tag: '#6ab4ff',
    },
  });
  const TRAIT = {
    lucha14: ['TAAI', 'Super: Vliegende Plons'],
    hagel14: ['ROLLETJE', 'Super: Hagelbui'],
    kogel14: ['SCHERPSCHUTTER', 'Super: Kogelregen'],
  };

  {
    const in0 = initSnake9;
    initSnake9 = function (sn, o) {
      in0(sn, o);
      if (!IS[sn.kind]) return;
      sn.K = Object.assign({}, sn.K);
      sn.mode = 'move'; sn.mt = 0; sn.sup14 = rnd(0.1, 0.35); sn.cd = rnd(0.9, 1.6); sn.seen14 = null;
      if (sn.kind === 'lucha14') { sn.chargeCd = rnd(2, 3.5); sn.punch14 = 0; }
      if (sn.kind === 'hagel14') sn.rollCd14 = 0;
      if (sn.kind === 'kogel14') sn.burst14 = 0;
    };
  }
  // the super meter fills a little on every hit taken; Taai: Senor Slam below half health
  for (const k of BRAWLERS) {
    HURT10[k] = (sn, amount) => {
      sn.sup14 = Math.min(1, (sn.sup14 || 0) + 0.035);
      if (k === 'lucha14' && sn.hp < sn.maxHp * 0.5) return amount * 0.7;
      return amount;
    };
  }

  function fx(room) { if (!room.fx86) room.fx86 = { warns: [], lines: [] }; return room.fx86; }
  // where the brawler thinks you are: in a bush you are hidden unless it is right next to you
  function sight(sn) {
    const P = G.player, room = G.room;
    let hid = false;
    if (room && room.bushes10) for (const b of room.bushes10) if (dist(P.x, P.y, b.x, b.y) < 22) { hid = true; break; }
    if (hid && dist(P.x, P.y, sn.x, sn.y) < 70) hid = false;
    if (!hid || !sn.seen14) sn.seen14 = { x: P.x, y: P.y };
    const tx = sn.seen14.x, ty = sn.seen14.y;
    return { tx, ty, d: dist(tx, ty, sn.x, sn.y) || 1, a: Math.atan2(ty - sn.y, tx - sn.x), hid };
  }
  function superUp(sn, dt) {
    if (sn.sup14 < 1) { sn.sup14 = Math.min(1, sn.sup14 + dt / sn.K.supT); if (sn.sup14 >= 1) floatText(sn.x, sn.y - sn.headR - 22, 'SUPER KLAAR', '#ffd23a'); }
  }
  function shoot(sn, ang, sp, kind, r, life, col) {
    const v = spawnVenom(sn.x + Math.cos(ang) * sn.headR, sn.y + Math.sin(ang) * sn.headR, ang, sp, col);
    v.kind = kind; v.r = r; v.life = life; v.spin = ang;
    return v;
  }
  function hitAll(x, y, r, n, kb, src) {
    const one = (Q) => {
      if (Q.dying > 0 || dist(Q.x, Q.y, x, y) > r + Q.r) return;
      if (Q.hurt(n, x, y, src)) { const a = Math.atan2(Q.y - y, Q.x - x); Q.kbx += Math.cos(a) * kb; Q.kby += Math.sin(a) * kb; }
    };
    one(G.player); mpRest14(one);
  }

  /* ------------------------------------------------------------------ Senor Slam */
  AI.lucha14 = function (sn, room, dt) {
    const P = G.player, S = sight(sn);
    sn.mt += dt;
    if (sn.mode === 'jump') {
      // in the air: a shadow and a ring on the floor where he lands
      if (sn.mt > 0.85) {
        const f = nearestFreeCell(room, sn.land14.x, sn.land14.y);
        teleport10(sn, f.x, f.y); show9(sn);
        sn.mode = 'land'; sn.mt = 0;
        hitAll(f.x, f.y, 62, 1, 300, sn);
        smash10(room, f.x, f.y, 56, 1);
        ring10(f.x, f.y, 20, '#ffd23a', 0.5, true);
        burst(f.x, f.y, 18, '#ffd23a', { min: 60, max: 190, lmin: 0.3, lmax: 0.7, glow: true });
        G.shake = Math.max(G.shake, 9); Sfx.thud(); Sfx.collapse();
        floatText(f.x, f.y - 30, 'PLONS', '#ffd23a', true);
      }
      return;
    }
    if (sn.mode === 'land') { if (sn.mt > 0.55) { sn.mode = 'move'; sn.mt = 0; } return; }
    if (sn.mode === 'punch') {
      // three quick jabs, the last one sends you flying
      sn.ang = turnToward(sn.ang, S.a, 6 * dt); sn.drawAng = sn.ang;
      const step = Math.floor(sn.mt / 0.22);
      if (step > sn.punch14 && sn.punch14 < 3) {
        sn.punch14++; sn.jab14 = 0.12;
        const last = sn.punch14 === 3, reach = sn.headR + 30;
        const fxp = sn.x + Math.cos(sn.ang) * (sn.headR + 14), fyp = sn.y + Math.sin(sn.ang) * (sn.headR + 14);
        const one = (Q) => {
          if (Q.dying > 0) return;
          const tq = Math.atan2(Q.y - sn.y, Q.x - sn.x);
          if (dist(Q.x, Q.y, sn.x, sn.y) < reach + Q.r && Math.abs(angDiff(sn.ang, tq)) < 1.1 && Q.hurt(1, sn.x, sn.y, sn)) {
            Q.kbx += Math.cos(tq) * (last ? 340 : 120); Q.kby += Math.sin(tq) * (last ? 340 : 120);
          }
        };
        one(P); mpRest14(one);
        smash10(room, fxp, fyp, 18, 1);
        burst(fxp, fyp, 5, '#ffffff', { min: 40, max: 100, lmin: 0.15, lmax: 0.3 });
        Sfx.thud(); if (last) G.shake = Math.max(G.shake, 4);
      }
      if (sn.mt > 0.85) { sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.1, 1.6); sn.punch14 = 0; }
      return;
    }
    superUp(sn, dt);
    if (sn.mode === 'move' && sn.sup14 >= 1 && S.d > 70 && S.d < 320 && P.dying <= 0) {
      sn.sup14 = 0; sn.mode = 'jump'; sn.mt = 0;
      sn.land14 = { x: clamp(S.tx, 30, RW - 30), y: clamp(S.ty, 30, RH - 30) };
      fx(room).warns.push({ x: sn.land14.x, y: sn.land14.y, r: 62, t: 0, dur: 0.85, col: '#ffd23a' });
      hide9(sn); Sfx.boost(); floatText(sn.x, sn.y - 30, 'VLIEGENDE PLONS', '#ffd23a', true);
      return;
    }
    sn.cd -= dt;
    if ((sn.mode === 'move') && sn.cd <= 0 && S.d < sn.headR + 34 && P.dying <= 0 && !S.hid) { sn.mode = 'punch'; sn.mt = 0; sn.punch14 = 0; return; }
    // otherwise he walks you down and charges like a bull
    chargeAI(sn, room, dt, { rearT: 0.45, chargeSpeed: 300, chargeT: 1.0, stunT: 0.6, cd: [3, 4.5], speed: sn.K.speed * (sn.hp < sn.maxHp * 0.5 ? 1.2 : 1), range: 300 });
  };

  /* ------------------------------------------------------------------ Hagel Hannie */
  AI.hagel14 = function (sn, room, dt) {
    const P = G.player, S = sight(sn);
    sn.mt += dt;
    if (sn.mode === 'roll') {
      const m = sn.headR * 0.8;
      let nx = sn.x + Math.cos(sn.rollA14) * 260 * dt, ny = sn.y + Math.sin(sn.rollA14) * 260 * dt;
      [nx, ny] = resolveTiles(room, nx, ny, m);
      sn.moveTo(clamp(nx, m, RW - m), clamp(ny, m, RH - m));
      if (sn.mt > 0.28) { sn.mode = 'move'; sn.mt = 0; }
      return;
    }
    if (sn.mode === 'aim') {
      sn.ang = turnToward(sn.ang, S.a, 7 * dt); sn.drawAng = sn.ang;
      if (sn.mt > (sn.big14 ? 0.55 : 0.32)) {
        const big = sn.big14, n = big ? 12 : 5, spread = big ? 0.62 : 0.36, sp = G.levelDef.venomSpeed * (big ? 1.5 : 1.3);
        for (let i = 0; i < n; i++) {
          const a = sn.ang + (n === 1 ? 0 : (i / (n - 1) - 0.5) * 2 * spread) + rnd(-0.04, 0.04);
          const v = shoot(sn, a, sp * rnd(0.92, 1.08), 'pellet14', big ? 4.5 : 3.8, big ? 0.62 : 0.5, '#ff9a3a');
          if (big) v.kb14 = 1;
        }
        if (big) { G.shake = Math.max(G.shake, 6); floatText(sn.x, sn.y - 30, 'HAGELBUI', '#ff9a3a', true); smash10(room, sn.x + Math.cos(sn.ang) * 40, sn.y + Math.sin(sn.ang) * 40, 30, 1); }
        Sfx.boom(); Sfx.spit();
        sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.2, 1.7); sn.big14 = false;
      }
      return;
    }
    // Rolletje: a seed coming close makes her roll sideways
    sn.rollCd14 -= dt;
    if (sn.rollCd14 <= 0 && G.seeds) for (const s of G.seeds) {
      if (dist2(s.x, s.y, sn.x, sn.y) > 55 * 55) continue;
      const side = Math.random() < 0.5 ? 1 : -1, sa = Math.atan2(s.vy || 0, s.vx || 1);
      sn.rollA14 = sa + side * Math.PI / 2; sn.mode = 'roll'; sn.mt = 0; sn.rollCd14 = rnd(2.6, 3.6);
      floatText(sn.x, sn.y - 24, 'ROL', '#c88aff'); Sfx.whoosh10 && Sfx.whoosh10();
      return;
    }
    superUp(sn, dt);
    keepAway(sn, room, dt, 80, 150, sn.K.speed);
    sn.cd -= dt;
    if (P.dying > 0) return;
    if (sn.sup14 >= 1 && S.d < 200 && clearLine(room, sn.x, sn.y, S.tx, S.ty)) { sn.sup14 = 0; sn.big14 = true; sn.mode = 'aim'; sn.mt = 0; Sfx.charge && Sfx.charge(); return; }
    if (sn.cd <= 0 && S.d < 210 && clearLine(room, sn.x, sn.y, S.tx, S.ty)) { sn.mode = 'aim'; sn.mt = 0; sn.big14 = false; }
  };

  /* ------------------------------------------------------------------ Kid Kogel */
  AI.kogel14 = function (sn, room, dt) {
    const P = G.player, S = sight(sn);
    sn.mt += dt;
    // Scherpschutter: he leads his shots, unless he lost you in a bush
    const lead = S.hid ? 0 : Math.min(0.5, S.d / 420);
    const ax = clamp(S.tx + (S.hid ? 0 : P.vx * lead), 10, RW - 10), ay = clamp(S.ty + (S.hid ? 0 : P.vy * lead), 10, RH - 10);
    const aim = Math.atan2(ay - sn.y, ax - sn.x);
    if (sn.mode === 'aim') {
      sn.ang = turnToward(sn.ang, aim, 6 * dt); sn.drawAng = sn.ang;
      if (sn.big14 && !sn.line14) { sn.line14 = true; const [ex, ey] = lineEnd10(room, sn.x, sn.y, sn.x + Math.cos(sn.ang) * 600, sn.y + Math.sin(sn.ang) * 600); fx(room).lines.push({ sn, x1: ex, y1: ey, t: 0, dur: 0.6 }); }
      if (sn.mt > (sn.big14 ? 0.6 : 0.35)) { sn.mode = 'fire'; sn.mt = 0; sn.burst14 = 0; sn.fireA14 = sn.ang; }
      return;
    }
    if (sn.mode === 'fire') {
      const n = sn.big14 ? 14 : 6, gap = sn.big14 ? 0.055 : 0.1;
      if (!sn.big14) sn.fireA14 = turnToward(sn.fireA14, aim, 1.2 * dt);
      sn.ang = sn.drawAng = sn.fireA14;
      while (sn.burst14 < n && sn.mt >= sn.burst14 * gap) {
        const side = sn.burst14 % 2 ? 1 : -1, a = sn.fireA14 + (sn.big14 ? side * 0.03 : rnd(-0.03, 0.03));
        const v = shoot(sn, a, G.levelDef.venomSpeed * (sn.big14 ? 2.1 : 1.75), 'bullet14', sn.big14 ? 4 : 3.4, 2.2, '#ffe14a');
        v.x += Math.cos(a + Math.PI / 2) * side * 6; v.y += Math.sin(a + Math.PI / 2) * side * 6;
        sn.burst14++; sn.gun14 = side; sn.flash14 = 0.06;
        if (sn.burst14 % 2 === 1) Sfx.spit();
      }
      if (sn.burst14 >= n) {
        if (sn.big14) {
          // the rain of bullets tears through loot boxes on its way
          for (let d = 30; d < 600; d += 20) {
            const x = sn.x + Math.cos(sn.fireA14) * d, y = sn.y + Math.sin(sn.fireA14) * d;
            if (x < 0 || y < 0 || x > RW || y > RH) break;
            const o = room.tileAt(x, y);
            if (o && o.breakable) { breakObstacle(room, o); continue; }
            if (o && o.shots) break;
          }
          floatText(sn.x, sn.y - 30, 'KOGELREGEN', '#ffe14a', true);
        }
        sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.3, 1.9); sn.big14 = false; sn.line14 = false;
      }
      return;
    }
    superUp(sn, dt);
    keepAway(sn, room, dt, 170, 270, sn.K.speed);
    sn.cd -= dt;
    if (P.dying > 0) return;
    const see = clearLine(room, sn.x, sn.y, S.tx, S.ty);
    if (sn.sup14 >= 1 && see) { sn.sup14 = 0; sn.big14 = true; sn.mode = 'aim'; sn.mt = 0; Sfx.charge && Sfx.charge(); return; }
    if (sn.cd <= 0 && see && S.d < 420) { sn.mode = 'aim'; sn.mt = 0; sn.big14 = false; }
  };

  // Schild: the next bite is blocked
  {
    Hooks.layer('Player.hurt', 'v14 knokpit', function (next, n, sx, sy, src) {
      if (this === G.player && n > 0 && this.bshield14 && G.state === 'play' && !(this.inv > 0) && !(this.dashT > 0) && !(this.dying > 0) && !this.god) {
        this.bshield14 = false; this.inv = Math.max(this.inv || 0, 0.8);
        floatText(this.x, this.y - 30, 'SCHILD', '#ffd23a', true); Sfx.clang && Sfx.clang();
        ring10(this.x, this.y, 22, '#ffd23a', 0.4, true);
        return false;
      }
      return next.apply(this, [].slice.call(arguments, 1));
    });
  }

  /* ================================================================== the room */
  // B barrier block   L loot box   * bush   . floor (doors in the middle of each side stay free)
  const TPLS = [
    ['...........', '.*B.....B*.', '...........', '.L..*.*..L.', '..B.....B..', '.L..*.*..L.', '...........', '.*B.....B*.', '...........'],
    ['...........', '..*.....*..', '.B..L.L..B.', '.B.......B.', '...*...*...', '.B.......B.', '.B..L.L..B.', '..*.....*..', '...........'],
    ['*.........*', '.L.B...B.L.', '...........', '..*.....*..', '....B.B....', '..*.....*..', '...........', '.L.B...B.L.', '*.........*'],
    ['...........', '.L*.....*L.', '..B.....B..', '...........', '.*..L.L..*.', '...........', '..B.....B..', '.L*.....*L.', '...........'],
  ];
  const POSTERS = ['3 TEGEN 1', 'BREEK DE BOXEN', 'SUPER KLAAR', 'KNOKPIT', 'PAK DE DROPS', 'GG', 'NOG EEN POTJE'];
  function put(room, c, r, o) {
    o.c = c; o.r = r; o.x = (c + 0.5) * T; o.y = (r + 0.5) * T; o.shake = 0; o.wob = 0; o.seed = ((c * 7 + r * 13) % 17) / 17;
    room.tiles[r][c] = o; room.obs.push(o); room.ver++; room.dirty = true;
    return o;
  }
  function lootbox() { return { type: 'lootbox14', solid: true, shots: true, hp: 3, max: 3, breakable: true }; }
  function buildKnok(room, def, rng) {
    let tpl = TPLS[Math.floor(rng() * TPLS.length)].slice();
    if (rng() < 0.5) tpl = tpl.reverse();
    if (rng() < 0.5) tpl = tpl.map((s) => s.split('').reverse().join(''));
    room.build(tpl.map((s) => s.replace(/[BL]/g, '.')), def);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const ch = tpl[r][c];
      if (ch === 'B') put(room, c, r, { type: 'barrier14', solid: true, shots: true, hue: (c + r) % 2 });
      else if (ch === 'L') put(room, c, r, lootbox());
    }
    room.sconces = []; room.tubes = null; room.cleared = false;
    room.knok14 = { posters: [], ban: Math.floor(rng() * 3) };
    const spots = [['n', 0.2], ['n', 0.8], ['s', 0.2], ['s', 0.8], ['w', 0.25], ['e', 0.75]];
    for (let i = 0; i < spots.length; i++) if (rng() < 0.7) room.knok14.posters.push({ side: spots[i][0], u: spots[i][1], txt: POSTERS[Math.floor(rng() * POSTERS.length)], hue: Math.floor(rng() * 3) });
  }
  {
    const pe0 = placeExtras9;
    placeExtras9 = function (rooms, grid, key, rng, def, tier) {
      pe0(rooms, grid, key, rng, def, tier);
      if (def.rush || G.mode === 'story') return;
      const fl = G.levelIdx || 0, run = G.run;
      if (fl < 1 && !KNOK.force) return;
      // a generator of its own: a floor without a Knokpit draws nothing extra from the floor generator
      const seed = run && run.seed != null ? run.seed >>> 0 : 0;
      const r = mulberry32((((seed ^ 0x6b6e6f6b) >>> 0) + fl * 0x9e3779b1) >>> 0);
      if (KNOK.next) { const nx = rooms.find((q) => q.type === 'fight' && q.dist === 1); if (nx) { resetRoom9(nx); nx.type = TYPE; buildKnok(nx, def, r); return; } }
      if (!KNOK.force && r() >= (def.chaos ? KNOK.chaosOdds : KNOK.odds)) return;
      hang10(rooms, grid, key, r, TYPE, (nr) => buildKnok(nr, def, r));
    };
    const cr0 = chaosRoom9;
    chaosRoom9 = function (rm, t, def, rng) {
      if (t === TYPE) { resetRoom9(rm); rm.type = TYPE; buildKnok(rm, def, rng); return; }
      return cr0(rm, t, def, rng);
    };
    CHAOS_ROOMS9.push(TYPE);
  }
  Object.assign(NOBONES9, { [TYPE]: 1 });

  /* ------------------------------------------------------------------ entering: lock, brawlers, power pads */
  {
    const er0 = enterRoom9;
    enterRoom9 = function (room, entry) {
      er0(room, entry);
      if (isKnok(room) && !room.cleared && !room.fought) { room.fought = true; safe(() => startKnok(room, entry)); }
    };
  }
  function startKnok(room, entry) {
    const P = G.player;
    room.locked = true; room.doorCl = 0; Sfx.doorShut();
    const v = DOORV[entry || 's'] || [0, 1], used = new Set();
    const order = shuffle(BRAWLERS.slice());
    order.forEach((k, i) => {
      const u = (i + 0.5) / order.length;
      let x, y;
      if (v[1] !== 0) { x = 40 + u * (RW - 80); y = v[1] > 0 ? T * 1.2 : RH - T * 1.2; }
      else { y = 40 + u * (RH - 80); x = v[0] > 0 ? T * 1.2 : RW - T * 1.2; }
      const f = nearestFreeCell(room, x, y, (c, r) => used.has(r * COLS + c));
      used.add(f.r * COLS + f.c);
      room.snakes.push(new Snake(k, f.x, f.y, { delay: 0.9 + i * 0.25, ang: Math.atan2(P.y - f.y, P.x - f.x), emerge: false, spawnTime: 0.5 }));
      floatText(f.x, f.y - 34, KINDS[k].name.toUpperCase(), KINDS[k].tag, true);
    });
    // three power pads on free cells away from the doors
    const kinds = ['snel', 'kracht', 'schild'], taken = new Set();
    const cells = [];
    for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) if (!room.solid(c, r) && !(room.bushes10 || []).some((b) => b.c === c && b.r === r)) cells.push([c, r]);
    for (const k of kinds) {
      let best = null;
      for (let tries = 0; tries < 12 && cells.length; tries++) {
        const cell = cells[Math.floor(Math.random() * cells.length)], key = cell[1] * COLS + cell[0];
        if (taken.has(key)) continue;
        if (Math.abs(cell[0] - 5) + Math.abs(cell[1] - 4) < 2) continue;
        best = cell; taken.add(key); break;
      }
      if (best) room.pickups.push({ kind: 'bpow14', pow: k, x: (best[0] + 0.5) * T, y: (best[1] + 0.5) * T, vx: 0, vy: 0, t: 0, ph: best[0] + best[1] });
    }
    UI.card('A hidden arena', 'De Knokpit', 'Three brawlers, one apple. Break the boxes, grab the drops. Hide in the bushes.', 'boss', 3.4);
    Sfx.horn10 && Sfx.horn10();
  }

  /* ------------------------------------------------------------------ drops, power pads, the Mega Box */
  const RAR = [
    { id: 'gewoon', name: 'GEWOON', col: '#8ad0ff', p: 0.42 },
    { id: 'zeldzaam', name: 'ZELDZAAM', col: '#5ae85a', p: 0.30 },
    { id: 'episch', name: 'EPISCH', col: '#c45aff', p: 0.16 },
    { id: 'mythisch', name: 'MYTHISCH', col: '#ff3a5a', p: 0.08 },
    { id: 'legendarisch', name: 'LEGENDARISCH', col: '#ffd23a', p: 0.04 },
  ];
  function rollRar(bonus) {
    let x = Math.random(), i = 0;
    for (; i < RAR.length - 1; i++) { if (x < RAR[i].p) break; x -= RAR[i].p; }
    return Math.min(RAR.length - 1, i + (bonus || 0));
  }
  function addDrop(room, x, y, bonus) {
    const f = nearestFreeCell(room, x, y);
    room.pickups.push({ kind: 'kdrop14', rar: rollRar(bonus), x: f.x, y: f.y, vx: 0, vy: 0, t: 0, fall: 0.7, ph: f.c + f.r });
  }
  function giveBuff(P, k) {
    const B = P.bpw14 || (P.bpw14 = { snel: 0, kracht: 0 });
    if (k === 'snel') { if (!(B.snel > 0)) P.speed *= 1.3; B.snel = 9; floatText(P.x, P.y - 30, 'SNEL', '#5ad8ff', true); }
    else if (k === 'kracht') { if (!(B.kracht > 0)) P.dmg *= 1.35; B.kracht = 9; floatText(P.x, P.y - 30, 'KRACHT', '#ff5a3a', true); }
    else { P.bshield14 = true; floatText(P.x, P.y - 30, 'SCHILD', '#ffd23a', true); }
    Sfx.ping();
  }
  function openDrop(room, p, P) {
    const R = RAR[p.rar];
    floatText(p.x, p.y - 30, R.name, R.col, true);
    burst(p.x, p.y, 10 + p.rar * 4, R.col, { min: 40, max: 160, lmin: 0.3, lmax: 0.8, glow: true });
    flashLight(p.x, p.y, 90 + p.rar * 20, 0.8, 0.5);
    if (p.rar === 0) dropCoins(room, p.x, p.y, 2);
    else if (p.rar === 1) dropCoins(room, p.x, p.y, 4);
    else if (p.rar === 2) { dropCoins(room, p.x, p.y, 2); dropHeart(room, p.x, p.y, 2); }
    else if (p.rar === 3) { dropCoins(room, p.x, p.y, 5); dropHeart(room, p.x, p.y, 2); giveBuff(P, Math.random() < 0.5 ? 'kracht' : 'snel'); }
    else { spawnItem(room, p.x, p.y - 6, 0.25); Sfx.legend && Sfx.legend(); }
    Sfx.chest && Sfx.chest(); Meta.add('knokDrops');
  }
  function updateKnok(dt, room) {
    const P = G.player, F = room.fx86;
    if (F && dt > 0) {
      for (let i = F.warns.length - 1; i >= 0; i--) { const w = F.warns[i]; w.t += dt; if (w.t > w.dur) F.warns.splice(i, 1); }
      for (let i = F.lines.length - 1; i >= 0; i--) { const l = F.lines[i]; l.t += dt; if (l.t > l.dur) F.lines.splice(i, 1); }
    }
    for (const sn of room.snakes) { if (sn.jab14 > 0) sn.jab14 -= dt; if (sn.flash14 > 0) sn.flash14 -= dt; }
    for (let i = room.pickups.length - 1; i >= 0; i--) {
      const p = room.pickups[i];
      if (p.kind !== 'bpow14' && p.kind !== 'kdrop14') continue;
      if (p.fall > 0) { p.fall -= dt; if (p.fall <= 0) { Sfx.thud(); burst(p.x, p.y, 8, RAR[p.rar].col, { min: 30, max: 90, lmin: 0.2, lmax: 0.4 }); } continue; }
      if (!P || P.dying > 0 || P.ghost14 || p.t < 0.4 || dist2(p.x, p.y, P.x, P.y) > (P.r + 10) * (P.r + 10)) continue;
      room.pickups.splice(i, 1);
      if (p.kind === 'bpow14') { giveBuff(P, p.pow); burst(p.x, p.y, 10, p.pow === 'snel' ? '#5ad8ff' : p.pow === 'kracht' ? '#ff5a3a' : '#ffd23a', { min: 30, max: 100, lmin: 0.3, lmax: 0.5, glow: true }); }
      else openDrop(room, p, P);
    }
  }
  {
    const ur0 = updateRoom9;
    updateRoom9 = function (dt, room, frozen) {
      ur0(dt, room, frozen);
      if (room && (isKnok(room) || room.fx86)) safe(() => updateKnok(dt, room));
    };
    // buff timers run per apple
    const pu0 = Player.prototype.update;
    Player.prototype.update = function (dt, room) {
      pu0.call(this, dt, room);
      const B = this.bpw14;
      if (!B || !(dt > 0)) return;
      if (B.snel > 0) { B.snel -= dt; if (B.snel <= 0) this.speed /= 1.3; }
      if (B.kracht > 0) { B.kracht -= dt; if (B.kracht <= 0) this.dmg /= 1.35; }
      if ((B.snel > 0 || B.kracht > 0) && Math.random() < dt * 14) addP({ kind: 'dot', x: this.x + rnd(-8, 8), y: this.y + rnd(-8, 8), vx: 0, vy: rnd(-40, -20), r: rnd(1, 2), life: 0.4, col: B.kracht > 0 ? '#ff5a3a' : '#5ad8ff', glow: true, drag: 1 });
    };
  }
  // loot boxes and the Mega Box break on their own terms
  {
    const bo0 = breakObstacle;
    breakObstacle = function (room, o) {
      if (o.type !== 'lootbox14' && o.type !== 'megabox14') return bo0(room, o);
      room.removeObstacle(o); o.broken = true;
      Sfx.breakUrn(); Sfx.coin();
      burst(o.x, o.y, 16, '#ffd23a', { kind: 'shard', min: 50, max: 180, rmin: 1.6, rmax: 3.6, lmin: 0.35, lmax: 0.8, glow: true });
      burst(o.x, o.y, 10, '#7a3ae8', { kind: 'shard', min: 40, max: 140, rmin: 1.6, rmax: 3.4, lmin: 0.35, lmax: 0.7 });
      if (o.type === 'lootbox14') {
        const r = Math.random();
        dropCoins(room, o.x, o.y, 1 + (r < 0.4 ? 1 : 0));
        if (r < 0.22) dropHeart(room, o.x, o.y, 1);
        else if (r > 0.82) addDrop(room, o.x, o.y, 0);
        else if (r > 0.7) { const k = pick(['snel', 'kracht', 'schild']); room.pickups.push({ kind: 'bpow14', pow: k, x: o.x, y: o.y, vx: 0, vy: 0, t: 0, ph: o.c + o.r }); }
        Meta.add('knokBoxes');
        return;
      }
      // the Mega Box: one powerup per apple, coins and a drop
      G.shake = Math.max(G.shake, 6); flashLight(o.x, o.y, 180, 1, 0.8);
      floatText(o.x, o.y - 34, 'MEGA BOX', '#ffd23a', true);
      const n = coopLoot14();
      for (let i = 0; i < n; i++) spawnItem(room, clamp(o.x + (i - (n - 1) / 2) * 46, 30, RW - 30), o.y - 8, 0.15);
      dropCoins(room, o.x, o.y + 10, 5);
      addDrop(room, o.x + 40, o.y + 30, 1);
      Sfx.legend && Sfx.legend();
    };
  }
  // the brawlers drop coins and a drop when they go down
  {
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0(sn, room, P);
      if (!IS[sn.kind]) return;
      safe(() => {
        dropCoins(room, sn.x, sn.y, 2);
        addDrop(room, sn.x, sn.y, sn.kind === 'lucha14' ? 1 : 0);
        floatText(sn.x, sn.y - 30, 'K.O.', '#ffffff', true);
        Meta.add('knokKOs');
      });
    };
  }
  {
    const c0 = clearRoom9;
    clearRoom9 = function (room) {
      c0(room);
      if (!isKnok(room)) return;
      safe(() => {
        Meta.add('knokWins');
        if (room.fx86) { room.fx86.warns.length = 0; room.fx86.lines.length = 0; }
        let c = 5, r = 4;
        if (room.solid(c, r)) { const f = nearestFreeCell(room, RW / 2, RH / 2); c = f.c; r = f.r; }
        room.pickups = room.pickups.filter((p) => !(p.kind === 'bpow14' && Math.floor(p.x / T) === c && Math.floor(p.y / T) === r));
        const o = put(room, c, r, { type: 'megabox14', solid: true, shots: true, hp: 6, max: 6, breakable: true });
        // an apple standing on that cell gets pushed off it
        for (const Q of players14()) if (Math.floor(Q.x / T) === c && Math.floor(Q.y / T) === r) { const f = nearestFreeCell(room, Q.x, Q.y + T); Q.x = f.x; Q.y = f.y; }
        burst(o.x, o.y, 20, '#ffd23a', { min: 40, max: 160, lmin: 0.4, lmax: 0.9, glow: true });
        UI.banner('GEWONNEN', 'The arena is yours. Break the Mega Box.', 'legend');
      });
    };
  }

  /* ------------------------------------------------------------------ light, chip, minimap, info */
  {
    const dk0 = darkTarget9;
    darkTarget9 = function (room, L) { if (isKnok(room)) return room.cleared ? 0.06 : 0.12; return dk0(room, L); };
    const xl0 = extraLights;
    extraLights = function (room, light) {
      xl0(room, light);
      if (!isKnok(room)) return;
      for (const o of room.obs) if (o.type === 'megabox14') light(o.x, o.y, 120, 0.8);
      for (const p of room.pickups) if (p.kind === 'kdrop14' || p.kind === 'bpow14') light(p.x, p.y, 40, 0.5);
    };
    const rc0 = roomChip;
    roomChip = function (room) {
      if (isKnok(room)) return room.cleared ? ['KNOKPIT', '#ffd23a'] : ['3 TEGEN 1', '#ff5a3a'];
      return rc0(room);
    };
    const i0 = info9;
    info9 = function (room, P) {
      if (isKnok(room)) for (const p of room.pickups) {
        if (p.kind !== 'bpow14' || dist(P.x, P.y, p.x, p.y) > 60) continue;
        const D = { snel: ['Snel', '30% faster for 9 seconds.'], kracht: ['Kracht', 'Seeds hit 35% harder for 9 seconds.'], schild: ['Schild', 'The next bite is blocked.'] }[p.pow];
        return { key: p, x: p.x, y: p.y - 16, title: D[0], tag: 'POWER', tagCol: '#ffd23a', body: D[1], notes: [['Walk over it.', '#b7a89a']] };
      }
      return i0(room, P);
    };
  }
  MINI9[TYPE] = (c, mx, my, cur) => {
    const r = G.map && G.map.rooms.find((q) => q.type === TYPE);
    if (r && !r.visited) return;
    c.fillStyle = cur ? '#8a6a10' : '#ffd23a'; circle(c, mx, my, 2.6);
    c.fillStyle = cur ? '#ece2d4' : '#2a1a4a'; c.fillRect(mx - 1.4, my - 0.6, 2.8, 1.2);
  };
  STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['knokWins', 'Knokpits won'], ['knokKOs', 'Brawlers knocked out'], ['knokBoxes', 'Loot boxes broken'], ['knokDrops', 'Drops opened']);

  /* ================================================================== drawing */
  // floor: bright arena turf with a lane, a centre ring and corner marks
  function knokFloor(c, room) {
    c.fillStyle = '#2a7a3a'; c.fillRect(0, 0, RW, RH);
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const x = col * T, y = r * T;
      c.fillStyle = (r + col) % 2 ? '#4cc05a' : '#44b452'; c.fillRect(x + 1, y + 1, T - 2, T - 2);
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 1, y + 1, T - 2, 3);
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(x + 1, y + T - 4, T - 2, 3);
    }
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3;
    c.beginPath(); c.arc(RW / 2, RH / 2, 52, 0, TAU); c.stroke();
    c.setLineDash([10, 8]); c.beginPath(); c.moveTo(RW / 2, 6); c.lineTo(RW / 2, RH / 2 - 52); c.moveTo(RW / 2, RH / 2 + 52); c.lineTo(RW / 2, RH - 6); c.stroke(); c.setLineDash([]);
    for (const [x, y] of [[14, 14], [RW - 14, 14], [14, RH - 14], [RW - 14, RH - 14]]) { c.fillStyle = 'rgba(255,210,58,0.6)'; circle(c, x, y, 5); }
  }
  function knokDeco(c, room) {
    // the arena logo in the ring: a fist on a star, our own
    c.save(); c.translate(RW / 2, RH / 2);
    c.fillStyle = 'rgba(255,210,58,0.35)';
    c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 18 : 40; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
    c.fillStyle = 'rgba(42,26,74,0.35)'; rrect(c, -11, -8, 22, 16, 5); c.fill();
    for (let i = 0; i < 4; i++) { rrect(c, -10 + i * 5.2, -13, 4.6, 7, 2); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `900 13px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(sayF9('KNOKPIT'), 0, 58);
    c.restore();
    // tyre marks and a few flowers on the turf
    for (let i = 0; i < 14; i++) { const x = ((i * 97) % (RW - 40)) + 20, y = ((i * 61) % (RH - 40)) + 20; c.fillStyle = ['#ffffff', '#ffd23a', '#ff8ab0'][i % 3]; circle(c, x, y, 1.6); circle(c, x + 3, y + 1, 1.2); }
  }
  function knokWalls(c, room) {
    const K = room.knok14; if (!K) return;
    if (!room.doors.n) wallText9(c, 'KNOKPIT ARENA', RW / 2, -WALL / 2, 12, '#ffd23a');
    else wallText9(c, 'KNOKPIT', RW * 0.22, -WALL / 2, 10, '#ffd23a');
    const cols = [['#ff3a8a', '#ffd23a'], ['#3ab4ff', '#ffffff'], ['#ffd23a', '#2a1a4a']];
    for (const p of K.posters) {
      c.save();
      if (p.side === 'n') c.translate(RW * p.u, -WALL / 2);
      else if (p.side === 's') c.translate(RW * p.u, RH + WALL / 2);
      else if (p.side === 'w') { c.translate(-WALL / 2, RH * p.u); c.rotate(-Math.PI / 2); }
      else { c.translate(RW + WALL / 2, RH * p.u); c.rotate(Math.PI / 2); }
      const [bg, fg] = cols[p.hue];
      c.fillStyle = '#120a20'; rrect(c, -27, -10, 54, 20, 4); c.fill();
      c.fillStyle = bg; rrect(c, -25.5, -8.5, 51, 17, 3); c.fill();
      c.fillStyle = fg; c.font = `900 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sayF9(p.txt), 0, 0.5);
      c.restore();
    }
  }
  {
    const ft0 = floorTiles9;
    floorTiles9 = function (c, room, L, rng) { if (isKnok(room)) { knokFloor(c, room); return true; } return ft0(c, room, L, rng); };
    const fd0 = floorDeco9;
    floorDeco9 = function (c, room, L, rng) { if (isKnok(room)) { knokDeco(c, room); return true; } return fd0(c, room, L, rng); };
    const wc0 = wallCol9;
    wallCol9 = function (room, L) { if (isKnok(room)) return '#3a2a8a'; return wc0(room, L); };
    const dw0 = drawWalls9;
    drawWalls9 = function (c, room, L, rng) { dw0(c, room, L, rng); if (isKnok(room)) knokWalls(c, room); };
  }
  STATIC9.barrier14 = (c, o) => {
    const x = o.x - 17, y = o.y - 17;
    c.fillStyle = 'rgba(0,0,0,0.4)'; rrect(c, x + 3, y + 5, 34, 33, 5); c.fill();
    bevel9(c, x, y, 34, 34, '#1a1030', o.hue ? '#3ab4ff' : '#ff8a2a', 5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; rrect(c, x + 3, y + 3, 28, 6, 3); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)'; rrect(c, x + 3, y + 24, 28, 7, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; circle(c, x + 17, y + 17, 4);
  };
  function boxBody(c, o, t, W, H, top, side, trim) {
    const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x - W / 2 + sh, y = o.y - H / 2;
    c.fillStyle = 'rgba(0,0,0,0.4)'; rrect(c, x + 2, y + 6, W, H, 4); c.fill();
    bevel9(c, x, y, W, H, '#120a20', side, 4);
    c.fillStyle = top; rrect(c, x + 2, y + 2, W - 4, H * 0.38, 3); c.fill();
    c.fillStyle = trim; c.fillRect(x + 2, y + H * 0.38, W - 4, 3); c.fillRect(x + W / 2 - 2, y + 2, 4, H - 4);
    // cracks as it takes hits
    const dmg = 1 - o.hp / o.max;
    if (dmg > 0) { c.strokeStyle = 'rgba(20,10,30,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 5, y + 6); c.lineTo(x + 11, y + 12); c.lineTo(x + 8, y + 18); if (dmg > 0.5) { c.moveTo(x + W - 5, y + H - 5); c.lineTo(x + W - 11, y + H - 11); } c.stroke(); }
    return { x, y };
  }
  DYN9.lootbox14 = (c, o, room, t) => {
    const { x, y } = boxBody(c, o, t, 26, 24, '#9a5aff', '#6a2ad8', '#ffd23a');
    // a lightning fist on the lock
    c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(x + 14, y + 10); c.lineTo(x + 10, y + 16); c.lineTo(x + 13, y + 16); c.lineTo(x + 11, y + 21); c.lineTo(x + 17, y + 14); c.lineTo(x + 14, y + 14); c.closePath(); c.fill();
  };
  DYN9.megabox14 = (c, o, room, t) => {
    glowDot(c, o.x, o.y, 34, '#ffd23a', 0.3 + 0.12 * Math.sin(t * 4));
    const { x, y } = boxBody(c, o, t, 34, 32, '#ffd23a', '#e89a1a', '#ff3a8a');
    c.fillStyle = '#2a1a4a'; c.font = `900 8px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MEGA', x + 17, y + 23);
    for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1; c.fillStyle = 'rgba(255,240,180,0.8)'; circle(c, o.x + Math.cos(a) * 24, o.y - 6 + Math.sin(a) * 10, 1.4); }
  };
  const POWCOL = { snel: '#5ad8ff', kracht: '#ff5a3a', schild: '#ffd23a' };
  DRAWPICK9.bpow14 = (c, p, t) => {
    const bob = Math.sin(t * 4 + p.ph) * 2, col = POWCOL[p.pow];
    c.save(); c.translate(p.x, p.y);
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 1, 9, 9, 3); c.fill();
    c.strokeStyle = rgba(col, 0.5 + 0.3 * Math.sin(t * 5 + p.ph)); c.lineWidth = 2; c.beginPath(); c.arc(0, 4, 13, 0, TAU); c.stroke();
    c.translate(0, -4 + bob);
    c.fillStyle = '#120a20'; c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Math.PI / 6; c.lineTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5); } c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Math.PI / 6; c.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); } c.closePath(); c.fill();
    c.fillStyle = '#120a20';
    if (p.pow === 'snel') { c.beginPath(); c.moveTo(-4, -4); c.lineTo(1, 0); c.lineTo(-4, 4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, -4); c.lineTo(5, 0); c.lineTo(0, 4); c.closePath(); c.fill(); }
    else if (p.pow === 'kracht') { rrect(c, -4.5, -2, 9, 6, 2); c.fill(); for (let i = 0; i < 3; i++) { rrect(c, -4.5 + i * 3.2, -5, 2.8, 4, 1); c.fill(); } }
    else { c.beginPath(); c.moveTo(0, -5); c.lineTo(4.5, -3); c.lineTo(3.5, 2); c.lineTo(0, 5); c.lineTo(-3.5, 2); c.lineTo(-4.5, -3); c.closePath(); c.fill(); }
    c.restore();
  };
  DRAWPICK9.kdrop14 = (c, p, t) => {
    const R = RAR[p.rar], fall = Math.max(0, p.fall || 0), lift = fall * 260;
    c.save(); c.translate(p.x, p.y);
    c.fillStyle = `rgba(0,0,0,${0.35 - fall * 0.3})`; ell(c, 1, 9, 9 - fall * 6, 3); c.fill();
    c.translate(0, -6 - lift + Math.sin(t * 3 + p.ph) * (fall > 0 ? 0 : 1.5));
    c.rotate(Math.sin(t * 2.5 + p.ph) * 0.15);
    // a candy shaped drop with a star window
    c.fillStyle = '#120a20'; c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(12, -2, 9, 6); c.quadraticCurveTo(0, 13, -9, 6); c.quadraticCurveTo(-12, -2, 0, -14); c.fill();
    c.fillStyle = R.col; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(10, -2, 7.5, 5); c.quadraticCurveTo(0, 11, -7.5, 5); c.quadraticCurveTo(-10, -2, 0, -12); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -3, -3, 2.2, 4); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? 1.6 : 3.8; c.lineTo(Math.cos(a) * r, 2 + Math.sin(a) * r); } c.closePath(); c.fill();
    c.restore();
  };
  VENOM9.pellet14 = (c, v) => {
    c.fillStyle = '#3a1a04'; circle(c, v.x, v.y, v.r + 1);
    c.fillStyle = v.kb14 ? '#ffd23a' : '#ff9a3a'; circle(c, v.x, v.y, v.r);
    c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, v.x - v.r * 0.3, v.y - v.r * 0.3, v.r * 0.35);
  };
  VENOM9.bullet14 = (c, v) => {
    c.save(); c.translate(v.x, v.y); c.rotate(v.spin || 0);
    c.fillStyle = 'rgba(255,225,74,0.35)'; ell(c, -7, 0, 9, v.r * 0.8); c.fill();
    c.fillStyle = '#2a1a04'; ell(c, 0, 0, v.r * 1.9, v.r * 1.05); c.fill();
    c.fillStyle = '#ffe14a'; ell(c, 0, 0, v.r * 1.6, v.r * 0.8); c.fill();
    c.restore();
  };
  // super pellets knock you back: a light shove on contact, done where they hit
  {
    const uv0 = updateVenom;
    updateVenom = function (dt, room) {
      const P = G.player, kb = [];
      if (P && isKnok(room)) for (const v of G.venom) if (v.kb14) kb.push(v);
      uv0(dt, room);
      if (!kb.length || !P) return;
      for (const v of kb) if (!G.venom.includes(v) && dist(v.x, v.y, P.x, P.y) < P.r + 16) { const a = Math.atan2(v.vy, v.vx); P.kbx += Math.cos(a) * 90; P.kby += Math.sin(a) * 90; }
    };
  }
  // telegraphs: the landing ring, the bullet line
  {
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const room = G.room, F = room && room.fx86; if (!F) return;
      for (const w of F.warns) {
        const u = w.t / w.dur;
        c.strokeStyle = rgba(w.col, 0.4 + 0.5 * u); c.lineWidth = 2.5; c.beginPath(); c.arc(w.x, w.y, w.r, 0, TAU); c.stroke();
        c.fillStyle = rgba(w.col, 0.12 + 0.2 * u); c.beginPath(); c.arc(w.x, w.y, w.r * u, 0, TAU); c.fill();
      }
      for (const l of F.lines) {
        const sn = l.sn; if (!sn || !sn.alive) continue;
        c.strokeStyle = `rgba(255,225,74,${0.25 + 0.4 * (l.t / l.dur)})`; c.lineWidth = 6; c.setLineDash([8, 6]);
        c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(l.x1, l.y1); c.stroke(); c.setLineDash([]);
      }
    };
  }
  // bodies, then a name tag, a health bar and the super meter above every brawler
  {
    const dec0 = decorateSnake9;
    decorateSnake9 = function (c, sn, t) {
      dec0(c, sn, t);
      if (!IS[sn.kind]) return;
      const K = sn.K;
      if (sn.kind === 'lucha14') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        if (k % 2 === 0) { c.fillStyle = 'rgba(255,210,58,0.75)'; ell(c, p.x, p.y, p.r * 0.3, p.r * 0.9, Math.atan2(dy, dx)); c.fill(); }
        if (k === 1) { c.fillStyle = K.mask; ell(c, p.x, p.y, p.r * 1.05, p.r * 0.5, Math.atan2(dy, dx) + Math.PI / 2); c.fill(); }
      });
      else if (sn.kind === 'hagel14') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        if (k % 3 === 1) { c.fillStyle = 'rgba(255,138,26,0.8)'; circle(c, p.x + nx * p.r * 0.45, p.y + ny * p.r * 0.45, p.r * 0.22); circle(c, p.x - nx * p.r * 0.45, p.y - ny * p.r * 0.45, p.r * 0.22); }
        if (k === 1) { c.strokeStyle = '#4a2a10'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(p.x + nx * p.r, p.y + ny * p.r); c.lineTo(p.x - nx * p.r, p.y - ny * p.r); c.stroke(); }
      });
      else segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        if (k % 2 === 1) { c.fillStyle = 'rgba(255,255,255,0.22)'; ell(c, p.x, p.y, p.r * 0.25, p.r * 0.95, Math.atan2(dy, dx)); c.fill(); }
        if (k === 1) { c.fillStyle = '#c8303a'; ell(c, p.x, p.y, p.r * 1.0, p.r * 0.45, Math.atan2(dy, dx) + Math.PI / 2); c.fill(); }
      });
      if (!G.room || !G.room.snakes.includes(sn) || !sn.alive || sn.burrowed) return;
      const y = sn.y - sn.headR - 16, w = 34;
      c.save();
      c.font = `800 7.5px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba(10,6,20,0.75)'; c.fillText(K.name.toUpperCase(), sn.x + 0.7, y - 7.3);
      c.fillStyle = K.tag; c.fillText(K.name.toUpperCase(), sn.x, y - 8);
      c.fillStyle = '#120a20'; rrect(c, sn.x - w / 2 - 1, y - 2, w + 2, 6, 2); c.fill();
      c.fillStyle = '#ff3a5a'; rrect(c, sn.x - w / 2, y - 1, w * clamp(sn.hp / sn.maxHp, 0, 1), 4, 1.5); c.fill();
      c.fillStyle = '#ffd23a'; c.fillRect(sn.x - w / 2, y + 3.4, w * clamp(sn.sup14 || 0, 0, 1), 1.6);
      if ((sn.sup14 || 0) >= 1) { c.strokeStyle = `rgba(255,210,58,${0.5 + 0.4 * Math.sin(t * 10)})`; c.lineWidth = 2; c.beginPath(); c.arc(sn.x, sn.y, sn.headR + 6, 0, TAU); c.stroke(); }
      c.restore();
    };
  }
  // heads (forward is +x)
  V9_HEADS.lucha14 = (c, sn, H, out, fill, t) => {
    const K = sn.K, jab = sn.jab14 > 0 ? 1 : 0;
    // wrestling mask with gold flames round the eyes
    oval9(c, 0, 0, H * 1.08, H * 1.02, out, K.mask, 2.4);
    c.fillStyle = K.mask2;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(H * 0.75, s * H * 0.12); c.quadraticCurveTo(H * 0.2, s * H * 0.95, -H * 0.55, s * H * 0.55); c.quadraticCurveTo(H * 0.05, s * H * 0.5, H * 0.75, s * H * 0.12); c.fill(); }
    c.fillStyle = '#ffffff'; for (const s of [-1, 1]) { ell(c, H * 0.42, s * H * 0.4, H * 0.24, H * 0.16, s * 0.4); c.fill(); }
    c.fillStyle = '#120a20'; for (const s of [-1, 1]) circle(c, H * 0.5, s * H * 0.4, H * 0.08);
    c.fillStyle = '#3a0a0a'; ell(c, H * 0.82, 0, H * 0.14, H * 0.3); c.fill();
    // a fist out front when he jabs
    if (jab || sn.mode === 'punch') { const r = H * 0.42, x = H * (1.15 + jab * 0.5); c.fillStyle = out; circle(c, x, H * 0.55, r + 1.4); c.fillStyle = '#ffd23a'; circle(c, x, H * 0.55, r); }
  };
  V9_HEADS.hagel14 = (c, sn, H, out, fill, t) => {
    const K = sn.K;
    // the shotgun out front
    c.fillStyle = '#2a1a10'; rrect(c, H * 0.4, -H * 0.32, H * 1.2, H * 0.28, 2); c.fill(); rrect(c, H * 0.4, H * 0.04, H * 1.2, H * 0.28, 2); c.fill();
    c.fillStyle = '#7a4a1a'; rrect(c, H * 0.2, -H * 0.42, H * 0.5, H * 0.84, 3); c.fill();
    if (sn.mode === 'aim') { c.fillStyle = `rgba(255,154,58,${0.5 + 0.5 * Math.sin(t * 40)})`; circle(c, H * 1.65, 0, H * 0.25); }
    oval9(c, 0, 0, H * 1.0, H * 0.95, out, fill);
    // a bandana tied at the back, goggles up on the forehead
    c.fillStyle = K.band; rrect(c, -H * 0.85, -H * 0.9, H * 0.7, H * 1.8, H * 0.3); c.fill();
    for (const s of [-1, 1]) { c.save(); c.translate(-H * 0.95, s * H * 0.25); c.rotate(s * (0.5 + Math.sin(t * 6) * 0.15)); c.fillStyle = K.band; ell(c, -H * 0.3, 0, H * 0.35, H * 0.14); c.fill(); c.restore(); }
    c.fillStyle = '#2a2a3a'; c.fillRect(-H * 0.1, -H * 0.8, H * 0.18, H * 1.6);
    for (const s of [-1, 1]) { c.fillStyle = '#5ad8ff'; circle(c, 0, s * H * 0.42, H * 0.22); c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, -H * 0.05, s * H * 0.42 - H * 0.07, H * 0.07); }
    c.fillStyle = K.eye; for (const s of [-1, 1]) circle(c, H * 0.55, s * H * 0.38, H * 0.13);
  };
  V9_HEADS.kogel14 = (c, sn, H, out, fill, t) => {
    const K = sn.K;
    // two revolvers, one on each side
    for (const s of [-1, 1]) {
      const kick = sn.flash14 > 0 && sn.gun14 === s ? -H * 0.15 : 0;
      c.fillStyle = '#3a3a44'; rrect(c, H * 0.5 + kick, s * H * 0.85 - H * 0.12, H * 0.95, H * 0.24, 1.5); c.fill();
      c.fillStyle = '#6a4a2a'; rrect(c, H * 0.3 + kick, s * H * 0.85 - H * 0.2, H * 0.35, H * 0.4, 2); c.fill();
      if (sn.flash14 > 0 && sn.gun14 === s) { c.fillStyle = '#fff3a0'; circle(c, H * 1.55, s * H * 0.85, H * 0.28); }
    }
    oval9(c, 0, 0, H * 1.0, H * 0.95, out, fill);
    // the wide hat seen from above, with a star badge
    c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, -H * 0.12, H * 0.08, H * 1.25, H * 1.1); c.fill();
    c.fillStyle = K.hat; ell(c, -H * 0.15, 0, H * 1.2, H * 1.05); c.fill();
    c.fillStyle = mixHex(K.hat, '#000000', 0.25); ell(c, -H * 0.2, 0, H * 0.65, H * 0.55); c.fill();
    c.fillStyle = '#c8303a'; c.fillRect(-H * 0.25, -H * 0.58, H * 0.12, H * 1.16);
    c.fillStyle = '#ffd23a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU, r = i % 2 ? H * 0.12 : H * 0.28; c.lineTo(H * 0.42 + Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
    c.fillStyle = K.eye; for (const s of [-1, 1]) circle(c, H * 0.75, s * H * 0.35, H * 0.12);
  };

  Object.assign(window.__bitten || (window.__bitten = {}), { KNOK14: { KNOK, TPLS, BRAWLERS, RAR, buildKnok, startKnok, addDrop, rollRar, brk: (room, o) => breakObstacle(room, o), err: () => ERR14 } });
})();
