/* src/60-v1024-rotting.js: v10.24: Rotting. From v10.24. Lines 26949 to 27098 of the v13.7 script. */
/* ===== v10.24: Rotting. Seeds rot what they hit. Rot ticks, softens the snake, and spreads when it dies. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { console.error(e); return fb; } };
  const bossK = (sn) => (sn.isBoss ? 0.5 : 1);
  const MAXR = 4, ROT_T = 6;

  const NEW = {
    rotting: { name: 'Rotting', desc: '1 in 3 seeds adds rot, up to 4 stacks. Each stack: damage over time, 6% more damage taken. Rotten kills spread it and sometimes leave a mushroom. Bosses: half, no spread.', apply(p) { p.rot24 = true; } }
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = 3.5;


  const i0 = initPlayer9;
  initPlayer9 = function (P, C) { i0(P, C); Object.assign(P, { rot24: false, rotSpreadT24: 0, rotSpreadN24: 0, rotShroomT24: 0 }); };

  function addRot(sn, n, P) {
    if (!sn || !sn.alive || sn.dying > 0 || sn.burrowed) return;
    const had = sn.rot24 || 0;
    sn.rot24 = Math.min(MAXR, had + n);
    sn.rotT24 = ROT_T;
    if (!had) { sn.rotTick24 = 0.6; floatText(sn.x, sn.y - 20, 'ROT', '#9aa040'); safe(() => Sfx.hiss(0.8)); }
  }

  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    const P = G.player; if (!P || !P.rot24) return;
    safe(() => { if (sn.alive && Math.random() < 1 / 3) addRot(sn, 1, P); });
  };

  const h0 = hurtMod9;
  hurtMod9 = function (sn, amount, fx, fy, isPoison) {
    amount = h0(sn, amount, fx, fy, isPoison);
    const P = G.player; if (!P || !P.rot24 || !(sn.rot24 > 0)) return amount;
    return amount * (1 + 0.06 * sn.rot24 * bossK(sn));
  };

  const up0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) {
    up0(P, dt, room, sp);
    safe(() => {
      if (!room || !room.snakes) return;
      P.rotSpreadT24 = (P.rotSpreadT24 || 0) - dt; if (P.rotSpreadT24 <= 0) { P.rotSpreadT24 = 1; P.rotSpreadN24 = 0; }
      P.rotShroomT24 = Math.max(0, (P.rotShroomT24 || 0) - dt);
      for (const sn of room.snakes) {
        if (!(sn.rot24 > 0) || !sn.alive || sn.dying > 0) continue;
        sn.rotT24 -= dt * (sn.burn > 0 ? 3 : 1);
        if (sn.rotT24 <= 0) { sn.rot24 = 0; continue; }
        if (Math.random() < dt * 5 * sn.rot24) {
          const vis = sn.pts.filter((p) => !p.hid), p = vis.length ? pick(vis) : sn;
          addP({ kind: 'dot', x: p.x + rnd(-4, 4), y: p.y + rnd(-4, 4), vx: rnd(-8, 8), vy: rnd(-22, -8), r: rnd(1.3, 2.4), life: 0.7, col: Math.random() < 0.5 ? '#8a9a2a' : '#5a4a1e', drag: 1 });
        }
        sn.rotTick24 -= dt;
        if (sn.rotTick24 <= 0) {
          sn.rotTick24 = 0.6;
          sn.hurt(0.25 * sn.rot24 * bossK(sn), sn.x, sn.y, true);
        }
      }
    });
  };

  const ok0 = onKill9;
  onKill9 = function (sn, room, P) {
    ok0(sn, room, P);
    if (!P || !P.rot24 || !(sn.rot24 > 0)) return;
    safe(() => {
      if (!sn.isBoss && (P.rotSpreadN24 || 0) < 4) {
        let n = 0;
        for (const o of room.snakes) {
          if (n >= 3) break;
          if (o === sn || !o.alive || o.isBoss || o.dying > 0 || o.burrowed) continue;
          if (Math.hypot(o.x - sn.x, o.y - sn.y) > 120) continue;
          addRot(o, Math.max(1, sn.rot24 - 1), P); n++;
          addP({ kind: 'dot', x: o.x, y: o.y, vx: 0, vy: -14, r: 3, life: 0.5, col: '#9aa040', drag: 1 });
        }
        if (n) { P.rotSpreadN24++; safe(() => Sfx.hiss(1)); floatText(sn.x, sn.y - 24, 'BEDORVEN', '#9aa040'); }
      }
      if (P.rotShroomT24 <= 0 && Math.random() < 0.15) { P.rotShroomT24 = 6; dropHeart(room, sn.x, sn.y, 1); floatText(sn.x, sn.y - 34, 'ZWAM', '#d8c8a0'); }
    });
  };

  /* snake look: green brown mould spots and flies */
  const ds0 = drawSnake;
  drawSnake = function (c, sn, t) {
    ds0(c, sn, t);
    if (!(sn.rot24 > 0) || sn.burrowed || !sn.alive) return;
    safe(() => {
      const pts = sn.pts; c.save();
      c.fillStyle = `rgba(110,120,30,${0.14 + 0.06 * sn.rot24})`;
      for (const p of pts) if (!p.hid) circle(c, p.x, p.y, p.r);
      for (let k = 1; k < pts.length; k += 2) {
        const p = pts[k]; if (p.hid) continue;
        c.fillStyle = k % 4 === 1 ? 'rgba(70,90,20,0.75)' : 'rgba(60,40,15,0.7)';
        circle(c, p.x + Math.sin(k * 3.1) * p.r * 0.4, p.y + Math.cos(k * 2.3) * p.r * 0.4, p.r * 0.28);
      }
      c.fillStyle = '#15110c';
      for (let i = 0; i < Math.min(3, sn.rot24); i++) {
        const a = t * (5 + i) + i * 2.1, r = sn.headR * (1.4 + 0.3 * i);
        circle(c, sn.x + Math.cos(a) * r, sn.y - sn.headR * 0.4 + Math.sin(a * 1.3) * r * 0.6, 1.1);
      }
      c.restore();
    });
  };

  /* icon: a rotten apple with a bite, mould, a worm hole and two flies */
  {
    const di0 = drawItemIcon;
    drawItemIcon = function (c, id, S, t = 0) {
      if (id !== 'rotting') return di0.apply(this, arguments);
      const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      safe(() => {
        c.strokeStyle = '#2a1c0e'; c.lineWidth = Math.max(1, R * 0.07);
        c.fillStyle = '#7a5a2a';
        c.beginPath(); c.moveTo(0, -R * 0.55);
        c.bezierCurveTo(R * 0.55, -R * 0.85, R * 0.95, -R * 0.2, R * 0.78, R * 0.35);
        c.bezierCurveTo(R * 0.6, R * 0.85, R * 0.2, R * 0.85, 0, R * 0.7);
        c.bezierCurveTo(-R * 0.2, R * 0.85, -R * 0.6, R * 0.85, -R * 0.78, R * 0.35);
        c.bezierCurveTo(-R * 0.95, -R * 0.2, -R * 0.55, -R * 0.85, 0, -R * 0.55);
        c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#9a8a30'; ell(c, R * 0.3, R * 0.2, R * 0.3, R * 0.38, 0.5); c.fill();
        c.fillStyle = '#4a3a18'; ell(c, -R * 0.38, R * 0.1, R * 0.26, R * 0.22, 0); c.fill();
        c.fillStyle = '#e8e0c0'; circle(c, -R * 0.62, -R * 0.12, R * 0.2); circle(c, -R * 0.5, -R * 0.3, R * 0.17);
        c.fillStyle = '#6a8a2a';
        for (const [x, y, r] of [[R * 0.1, -R * 0.25, 0.14], [R * 0.45, -R * 0.1, 0.1], [-R * 0.1, R * 0.35, 0.12], [R * 0.4, R * 0.5, 0.09]]) circle(c, x, y, R * r);
        c.fillStyle = '#120c06'; circle(c, R * 0.05, R * 0.05, R * 0.1);
        c.strokeStyle = '#d8a0a0'; c.lineWidth = Math.max(1, R * 0.07);
        c.beginPath(); c.moveTo(R * 0.05, R * 0.05); c.quadraticCurveTo(R * 0.2, -R * 0.1, R * 0.12, -R * 0.2); c.stroke();
        c.strokeStyle = '#3a2810'; c.lineWidth = Math.max(1.2, R * 0.1);
        c.beginPath(); c.moveTo(0, -R * 0.55); c.quadraticCurveTo(R * 0.05, -R * 0.8, R * 0.25, -R * 0.9); c.stroke();
        c.fillStyle = '#6a8a2a'; ell(c, R * 0.38, -R * 0.78, R * 0.2, R * 0.1, -0.4); c.fill();
        c.fillStyle = '#6a5a3a'; c.fillRect(-R * 0.35, R * 0.72, R * 0.12, R * 0.2); c.fillRect(R * 0.2, R * 0.74, R * 0.1, R * 0.16);
        for (let i = 0; i < 2; i++) {
          const a = t * (4 + i * 2) + i * 3, fx = Math.cos(a) * R * 0.85, fy = -R * 0.55 + Math.sin(a * 1.4) * R * 0.3;
          c.fillStyle = '#15110c'; circle(c, fx, fy, R * 0.09);
          c.fillStyle = 'rgba(200,220,255,0.7)'; ell(c, fx, fy - R * 0.08, R * 0.1, R * 0.05, 0.5); c.fill();
        }
      });
      c.restore();
    };
  }

  for (const s of ['ROT', 'ZWAM', 'BEDORVEN']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  Object.assign(window.__bitten || (window.__bitten = {}), { NEW24: NEW });
  safe(() => UI.buildItemCards());
  safe(() => { if (UI.filterItems9) UI.filterItems9(); });
})();

