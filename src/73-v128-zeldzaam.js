/* src/73-v128-zeldzaam.js: v12.8: Zeldzame Vijf. From v12.8. Lines 34079 to 34365 of the v13.7 script. */
/* ===== v12.8: Zeldzame Vijf. Five very rare legendaries: Genadeslag, Dubbelganger, Lijn 34, Grote Hap and Airbag.
   Rare weight 0.2, so they show up far less often than the other legendaries. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe73'); if (window.console) console.warn('v12.8', e); return fb; } };
  const bossK = (sn) => (sn && sn.isBoss ? 0.5 : 1); // room-wide and proc damage is halved on bosses
  const ECHO_DELAY = 2.5, ECHO_MAX = 12, BUS_EVERY = 18, BUS_WARN = 1.2, BUS_RUN = 0.8, HAP_EVERY = 20;

  /* ------------------------------------------------------------------ powerups */
  const NEW = {
    genadeslag: { rare: true, w: 0.2, name: 'Genadeslag', desc: 'Seeds finish off any snake below 15% of its length. Bosses below 5%. Mercy, technically.', apply(p) { p.genade34 = true; } },
    dubbelganger: { rare: true, w: 0.2, name: 'Dubbelganger', desc: 'A shadow repeats what you did 2.5 seconds ago: it walks your path and fires your shots at 50% damage. At most 12 shots waiting. Same moves, worse timing.', apply(p) { p.dub34 = true; } },
    lijn34: { rare: true, w: 0.2, name: 'Lijn 34', desc: 'Every 18 seconds in a fight a bus drives through the room along a marked lane. Snakes in it take 3x your damage and are stunned. Bosses take half. It ignores you. Late, as usual.', apply(p) { p.lijn34 = true; } },
    grotehap: { rare: true, w: 0.2, name: 'Grote Hap', desc: 'Every 20 kills, a huge bite takes half the length of the biggest snake in the room. Bosses lose 10% and count as 3 kills. Takes what it wants.', apply(p) { p.hap34 = true; p.hapN34 = 0; } },
    airbag: { rare: true, w: 0.2, name: 'Airbag', desc: 'Once per room, a bite pops an airbag instead: no damage, and every snake within 150 is shoved back and stunned for 1 second. Bosses are stunned 0.3 seconds. Smells like a new car.', apply(p) { p.bag34 = true; p.bagUsed34 = false; } },
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = 14;
  for (const id in NEW) ITEM_THREAT[id] = 5;

  /* clash tags for these powerups live in CLASH_TAGS13 */

  /* ------------------------------------------------------------------ defaults */
  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      Object.assign(P, { genade34: false, dub34: false, dubS34: null, lijn34: false, lijnS34: null, hap34: false, hapN34: 0, bag34: false, bagUsed34: false });
    };
    for (const k of ['dubS34', 'lijnS34', 'hapN34', 'bagUsed34']) SELL_SKIP.add(k);
    const en0 = enter9;
    enter9 = function (P) {
      en0(P);
      P.bagUsed34 = false; P.dubS34 = null; P.lijnS34 = null;
    };
  }

  /* ------------------------------------------------------------------ Genadeslag: the seed finishes what is left */
  {
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = G.player; if (!P || !P.genade34 || !sn) return;
      safe(() => {
        if (!sn.alive || !(sn.hp > 0) || !(sn.maxHp > 0)) return;
        if (sn.hp / sn.maxHp >= (sn.isBoss ? 0.05 : 0.15)) return;
        floatText(sn.x, sn.y - 24, 'GENADESLAG', '#ff5a3a', true);
        burst(sn.x, sn.y, 10, '#ff5a3a', { min: 30, max: 120, lmin: 0.25, lmax: 0.5, glow: true });
        sn.hp = 0; sn.kill(false);
      });
    };
  }

  /* ------------------------------------------------------------------ Dubbelganger: your own shots, 2.5 seconds late */
  {
    const fr0 = fire9;
    fire9 = function (P, base) {
      fr0(P, base);
      if (!P.dub34 || !G.room || !fighting10(G.room)) return;
      safe(() => {
        const D = P.dubS34; if (!D) return;
        D.q.push({ at: D.t + ECHO_DELAY, a: base });
        if (D.q.length > ECHO_MAX) D.q.shift();
      });
    };
  }

  /* ------------------------------------------------------------------ the frame: shadow and bus */
  function laneHit(room, P, S, bx, by, along) {
    // the bus is about 76 long and 34 wide; check three points along it
    for (const off of [-26, 0, 26]) {
      const x = S.axis === 'h' ? bx + off : bx, y = S.axis === 'h' ? by : by + off;
      for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed || S.hit.has(sn) || !sn.hitTest(x, y, 22)) continue;
        S.hit.add(sn);
        sn.hurt(seedDmg(P) * 3 * bossK(sn), x, y);
        sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.2 : 0.8);
        burst(sn.x, sn.y, 8, '#9fd0ff', { kind: 'shard', min: 60, max: 180, lmin: 0.2, lmax: 0.45 });
        floatText(sn.x, sn.y - 22, 'LIJN 34', '#9fd0ff', true);
        G.shake = Math.max(G.shake, 3);
      }
    }
  }
  function step34(P, dt, room) {
    if (!room) return;
    const fight = fighting10(room);
    if (P.dub34) {
      const D = P.dubS34 || (P.dubS34 = { t: 0, buf: [], q: [], x: P.x, y: P.y });
      D.t += dt;
      D.buf.push({ t: D.t, x: P.x, y: P.y });
      while (D.buf.length > 2 && D.buf[1].t < D.t - ECHO_DELAY) D.buf.shift();
      D.x = D.buf[0].x; D.y = D.buf[0].y;
      while (D.q.length && D.q[0].at <= D.t) {
        const sh = D.q.shift();
        if (!fight) continue;
        const n = makeSeed(P, D.x, D.y, sh.a, { mult: 0.5, size: 0.9, noCan: true });
        n.child = true; n.glow = true; n.look9 = ['#1a3a5a', '#d8f0ff', '#8cc8ff'];
      }
    }
    if (P.lijn34) {
      const S = P.lijnS34 || (P.lijnS34 = { phase: 0, cd: 8, t: 0, axis: 'h', v: 0, dir: 1, hit: new Set() });
      if (!fight) { S.phase = 0; return; }
      if (S.phase === 0) {
        S.cd -= dt;
        if (S.cd <= 0) {
          const tg = shuffle(room.snakes.filter((o) => o.canBeHit() && !o.burrowed))[0];
          if (tg) {
            S.axis = Math.random() < 0.5 ? 'h' : 'v';
            S.v = clamp(S.axis === 'h' ? tg.y : tg.x, 30, (S.axis === 'h' ? RH : RW) - 30);
            S.dir = Math.random() < 0.5 ? 1 : -1; S.phase = 1; S.t = 0;
            safe(() => Sfx.dingdong());
            floatText(P.x, P.y - 34, 'LIJN 34', '#9fd0ff', true);
          } else S.cd = 1;
        }
      } else if (S.phase === 1) {
        S.t += dt;
        if (S.t >= BUS_WARN) { S.phase = 2; S.t = 0; S.hit = new Set(); safe(() => Sfx.boost()); }
      } else {
        S.t += dt;
        const u = clamp(S.t / BUS_RUN, 0, 1), len = (S.axis === 'h' ? RW : RH) + 160, pos = -80 + (S.dir > 0 ? u : 1 - u) * len;
        const bx = S.axis === 'h' ? pos : S.v, by = S.axis === 'h' ? S.v : pos;
        S.bx = bx; S.by = by;
        laneHit(room, P, S, bx, by);
        if (S.t >= BUS_RUN) { S.phase = 0; S.cd = BUS_EVERY; }
      }
    }
  }
  {
    const pu0 = Player.prototype.update;
    Player.prototype.update = function (dt, room) {
      pu0.call(this, dt, room);
      if (this !== G.player || !G.run || G.state !== 'play') return;
      safe(() => step34(this, dt, room));
    };
  }

  /* ------------------------------------------------------------------ Grote Hap: the counter */
  {
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0.apply(this, arguments);
      if (!P || !P.hap34 || !room) return;
      safe(() => {
        P.hapN34 += sn && sn.isBoss ? 3 : 1;
        if (P.hapN34 < HAP_EVERY) return;
        const tg = room.snakes.filter((o) => o !== sn && o.canBeHit() && !o.burrowed).sort((a, b) => b.hp - a.hp)[0];
        if (!tg) return; // keeps the charge for the next fight
        P.hapN34 -= HAP_EVERY;
        const cut = tg.isBoss ? tg.maxHp * 0.1 : tg.hp * 0.5;
        tg.hurt(Math.min(cut, tg.hp * 0.99), tg.x, tg.y);
        floatText(tg.x, tg.y - 30, 'GROTE HAP', '#ff3a3a', true);
        burst(tg.x, tg.y, 18, '#ff3a3a', { min: 40, max: 160, lmin: 0.3, lmax: 0.7 });
        addP({ kind: 'ring', x: tg.x, y: tg.y, vx: 0, vy: 0, r: 10, life: 0.5, col: '#ffffff', drag: 0 });
        G.shake = Math.max(G.shake, 4); Sfx.crunch();
      });
    };
  }

  /* ------------------------------------------------------------------ Airbag: the bite that does not count */
  {
    Hooks.layer('Player.hurt', 'v12.8 airbag', function (next, n, sx, sy, src) {
      if (this === G.player && n > 0 && this.bag34 && !this.bagUsed34 && G.room && !(this.inv > 0) && !(this.dashT > 0) && !(this.dying > 0) && !(this.escaping > 0) && !this.god && G.state === 'play') {
        this.bagUsed34 = true; this.inv = Math.max(this.inv || 0, 0.9);
        safe(() => {
          const room = G.room;
          for (const sn of room.snakes) {
            if (!sn.canBeHit() || sn.burrowed || dist(sn.x, sn.y, this.x, this.y) > 150 + sn.headR) continue;
            if (!sn.isBoss) {
              const a = Math.atan2(sn.y - this.y, sn.x - this.x), nx = sn.x + Math.cos(a) * 70, ny = sn.y + Math.sin(a) * 70;
              if (freeAt(room, nx, ny, sn.headR * 0.7)) sn.moveTo(nx, ny);
            }
            sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.3 : 1);
          }
          floatText(this.x, this.y - 32, 'AIRBAG', '#f2f4f8', true);
          burst(this.x, this.y, 14, '#f2f4f8', { min: 40, max: 150, lmin: 0.3, lmax: 0.6 });
          addP({ kind: 'ring', x: this.x, y: this.y, vx: 0, vy: 0, r: 10, life: 0.4, col: '#f2f4f8', drag: 0 });
          G.shake = Math.max(G.shake, 3); Sfx.boom(false);
        });
        return true;
      }
      return next.apply(this, [].slice.call(arguments, 1));
    });
  }

  /* ------------------------------------------------------------------ drawing: the shadow, the lane and the bus */
  {
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const P = G.player, room = G.room; if (!P || !room) return;
      safe(() => {
        const D = P.dubS34;
        if (P.dub34 && D) {
          c.save(); c.translate(D.x, D.y);
          c.globalAlpha = 0.34 + 0.06 * Math.sin(t * 6);
          applePath(c, 13); c.fillStyle = '#9fd0ff'; c.fill(); c.strokeStyle = 'rgba(220,240,255,0.85)'; c.lineWidth = 1.5; c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.9)'; circle(c, -4.5, -1, 2); circle(c, 4.5, -1, 2);
          c.restore();
        }
        const S = P.lijnS34;
        if (P.lijn34 && S && S.phase > 0) {
          const h = S.axis === 'h', W = h ? RW : RH;
          c.save();
          if (S.phase === 1) {
            const blink = S.t > BUS_WARN * 0.6 ? 0.5 + 0.5 * Math.sin(S.t * 28) : 0.5;
            c.fillStyle = `rgba(255,210,60,${0.1 + 0.12 * blink})`;
            if (h) c.fillRect(0, S.v - 24, W, 48); else c.fillRect(S.v - 24, 0, 48, W);
            c.strokeStyle = `rgba(255,220,90,${0.45 + 0.4 * blink})`; c.lineWidth = 2; c.setLineDash([12, 10]);
            c.beginPath();
            if (h) { c.moveTo(0, S.v - 24); c.lineTo(W, S.v - 24); c.moveTo(0, S.v + 24); c.lineTo(W, S.v + 24); } else { c.moveTo(S.v - 24, 0); c.lineTo(S.v - 24, W); c.moveTo(S.v + 24, 0); c.lineTo(S.v + 24, W); }
            c.stroke(); c.setLineDash([]);
          } else if (S.bx != null) {
            c.translate(S.bx, S.by); c.rotate((h ? 0 : Math.PI / 2) + (S.dir < 0 ? Math.PI : 0));
            rrect(c, -38, -17, 76, 34, 5); c.fillStyle = '#f2f4f8'; c.fill(); c.strokeStyle = '#10263f'; c.lineWidth = 2; c.stroke();
            c.fillStyle = '#1d6fd1'; c.fillRect(-36, 4, 72, 6);
            c.fillStyle = '#2a3a4a'; for (let i = 0; i < 5; i++) c.fillRect(-32 + i * 13, -12, 9, 9);
            c.fillStyle = '#ffd84a'; circle(c, 36, -8, 2.4); circle(c, 36, 8, 2.4);
            c.fillStyle = '#10263f'; circle(c, -22, 18, 5); circle(c, 22, 18, 5); circle(c, -22, -18, 5); circle(c, 22, -18, 5);
          }
          c.restore();
        }
      });
    };
  }

  /* ------------------------------------------------------------------ icons */
  const OL = '#1a1210';
  function txt34(c, s, size, col, x, y) {
    c.font = `900 ${Math.round(size)}px "Barlow Condensed", "Arial Narrow", Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = Math.max(1, size * 0.16); c.strokeStyle = OL; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
  }
  function icon34(c, id, R, t) {
    c.fillStyle = 'rgba(255,200,90,0.16)'; circle(c, 0, 0, R * 0.98);
    if (id === 'genadeslag') {
      rrect(c, -R * 0.78, -R * 0.2, R * 1.56, R * 0.4, R * 0.08); c.fillStyle = '#2a1a1a'; c.fill(); c.strokeStyle = OL; c.lineWidth = R * 0.06; c.stroke();
      rrect(c, -R * 0.74, -R * 0.16, R * 0.22, R * 0.32, R * 0.05); c.fillStyle = '#e8323c'; c.fill();
      c.strokeStyle = OL; c.lineWidth = R * 0.3; c.beginPath(); c.moveTo(-R * 0.62, R * 0.7); c.lineTo(R * 0.62, -R * 0.7); c.stroke();
      c.strokeStyle = '#ffd84a'; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(-R * 0.62, R * 0.7); c.lineTo(R * 0.62, -R * 0.7); c.stroke();
      sparkle(c, R * 0.6, -R * 0.62, R * (0.2 + 0.05 * Math.sin(t * 5)), '#fff6c8');
    } else if (id === 'dubbelganger') {
      c.globalAlpha = 0.45; applePath(c, R * 0.62); c.save(); c.translate(R * 0.24 + Math.sin(t * 3) * R * 0.03, R * 0.1);
      applePath(c, R * 0.62); c.fillStyle = '#9fd0ff'; c.fill(); c.strokeStyle = '#e6f5ff'; c.lineWidth = R * 0.07; c.stroke(); c.restore(); c.globalAlpha = 1;
      miniApple(c, -R * 0.2, R * 0.05, R * 0.62, '#c92139');
      c.fillStyle = '#fff'; circle(c, -R * 0.34, R * 0.0, R * 0.07); circle(c, -R * 0.06, R * 0.0, R * 0.07);
    } else if (id === 'lijn34') {
      rrect(c, -R * 0.86, -R * 0.42, R * 1.72, R * 0.8, R * 0.1); c.fillStyle = '#f2f4f8'; c.fill(); c.strokeStyle = OL; c.lineWidth = R * 0.07; c.stroke();
      c.fillStyle = '#1d6fd1'; c.fillRect(-R * 0.84, R * 0.12, R * 1.68, R * 0.14);
      c.fillStyle = '#2a3a4a'; for (let i = 0; i < 4; i++) c.fillRect(-R * 0.72 + i * R * 0.34, -R * 0.3, R * 0.24, R * 0.26);
      c.fillStyle = OL; circle(c, -R * 0.5, R * 0.42, R * 0.16); circle(c, R * 0.5, R * 0.42, R * 0.16);
      txt34(c, '34', R * 0.5, '#ffd84a', R * 0.0, -R * 0.62);
    } else if (id === 'grotehap') {
      miniApple(c, R * 0.05, R * 0.1, R * 0.7, '#c92139');
      c.fillStyle = '#f6f0e0'; c.strokeStyle = OL; c.lineWidth = R * 0.05;
      for (let i = 0; i < 5; i++) { const x = -R * 0.8 + i * R * 0.4; c.beginPath(); c.moveTo(x, -R * 0.9); c.lineTo(x + R * 0.2, -R * 0.3 - Math.sin(t * 4 + i) * R * 0.03); c.lineTo(x + R * 0.4, -R * 0.9); c.closePath(); c.fill(); c.stroke(); }
      for (let i = 0; i < 5; i++) { const x = -R * 0.8 + i * R * 0.4; c.beginPath(); c.moveTo(x, R * 0.95); c.lineTo(x + R * 0.2, R * 0.5 + Math.sin(t * 4 + i) * R * 0.03); c.lineTo(x + R * 0.4, R * 0.95); c.closePath(); c.fill(); c.stroke(); }
    } else if (id === 'airbag') {
      for (const [x, y, r] of [[-0.42, 0.1, 0.42], [0.42, 0.1, 0.42], [0, -0.3, 0.5], [0, 0.35, 0.46]]) { c.fillStyle = '#f2f4f8'; circle(c, x * R, y * R, r * R); }
      c.strokeStyle = 'rgba(40,50,70,0.55)'; c.lineWidth = R * 0.05;
      for (const [x, y, r] of [[-0.42, 0.1, 0.42], [0.42, 0.1, 0.42], [0, -0.3, 0.5]]) { c.beginPath(); c.arc(x * R, y * R, r * R, 0, TAU); c.stroke(); }
      miniApple(c, 0, R * 0.08, R * 0.34, '#c92139');
    }
  }
  const ICONS = new Set(Object.keys(NEW));
  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (!ICONS.has(id)) return di0.apply(this, arguments);
    const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    safe(() => icon34(c, id, R, t));
    c.restore();
  };

  /* ------------------------------------------------------------------ texts, the Clear lines, the guide */
  for (const s of ['GENADESLAG', 'LIJN 34', 'GROTE HAP', 'AIRBAG']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const V = window.__bitten.V12; if (!V || !V.CLEAR12) return;
    const L = V.CLEAR12;
    Object.assign(L.items, {
      genadeslag: 'Seeds finish snakes that are almost dead.', dubbelganger: 'A shadow repeats your shots 2.5 seconds later.', lijn34: 'A bus runs through the room every 18 seconds.',
      grotehap: 'Every 20 kills, a huge bite out of the biggest snake.', airbag: 'Once per room, a bite is blocked and snakes are shoved back.',
    });
    V.install(NEW, L.items);
  });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  Object.assign(window.__bitten || (window.__bitten = {}), { RARE34: { NEW } });
})();

