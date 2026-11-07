/* src/69-v1112-mud.js: v11.12: Mud. From v11.12. Lines 32822 to 32954 of the v13.7 script. */
/* ===== v11.12: Mud. Seeds are clumps of mud. Hits stack up to 3 layers on a snake: more damage taken, slowed, and at 3 layers it cakes and staggers. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe69'); console.error(e); return fb; } };
  const MAXL = 3, LIFE = 4, CAKE_CD = 2.5, BOSS_CAKE_CD = 4, DMG_L = 0.05;
  const bossK = (sn) => (sn.isBoss ? 0.5 : 1);
  const NEW = {
    mud: {
      name: 'Mud',
      desc: 'Seeds are mud clumps, 15% less damage. Hits add mud, up to 3 layers for 4 seconds: 5% more damage taken per layer, slowed from 2 layers. At 3 layers it cakes: 0.35 second stagger, then back to 1 layer. Bosses: half the bonus, 0.15 second stagger. Dirty, but it works.',
      apply(p) { p.mud28 = true; }
    }
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = 3.5;


  const i0 = initPlayer9; initPlayer9 = function (P, C) { i0(P, C); P.mud28 = false; };

  const sd0 = seed9;
  seed9 = function (P, s, o) {
    sd0(P, s, o);
    if (!P || !P.mud28 || !s || s.draw9) return;
    s.mud28 = true; s.draw9 = 'mud'; s.dmg *= 0.85; s.mrot28 = Math.random() * TAU;
  };

  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    if (!s || !s.mud28 || !sn || !sn.alive) return;
    safe(() => {
      const first = !(sn.mud28 > 0);
      sn.mud28 = Math.min(MAXL, (sn.mud28 || 0) + 1);
      sn.mudT28 = LIFE;
      if (first) { try { floatText(sn.x, sn.y - sn.headR - 6, 'MODDER', '#8a6238'); } catch (e) {} }
      burst(sn.x, sn.y, 4, '#5a3d22');
    });
  };

  const hm0 = hurtMod9;
  hurtMod9 = function (sn, amount, fx, fy, isPoison) {
    let a = hm0(sn, amount, fx, fy, isPoison);
    if (sn && sn.mud28 > 0 && typeof a === 'number') a *= 1 + DMG_L * sn.mud28 * bossK(sn);
    return a;
  };

  const st0 = snakeTick9;
  snakeTick9 = function (sn, dt) {
    st0(sn, dt);
    if (!(sn.mud28 > 0)) return;
    safe(() => {
      sn.mudT28 -= dt;
      sn.mudCd28 = Math.max(0, (sn.mudCd28 || 0) - dt);
      if (sn.mudT28 <= 0) { sn.mud28 = 0; return; }
      if (sn.mud28 >= 2) sn.slow = Math.max(sn.slow || 0, 0.3);
      if (sn.mud28 >= MAXL && sn.mudCd28 <= 0) {
        sn.stagger = Math.max(sn.stagger || 0, sn.isBoss ? 0.15 : 0.35);
        sn.mud28 = 1; sn.mudCd28 = sn.isBoss ? BOSS_CAKE_CD : CAKE_CD; sn.mudT28 = LIFE;
        try { floatText(sn.x, sn.y - sn.headR - 6, 'KLEI', '#c8a070', true); } catch (e) {}
        burst(sn.x, sn.y, 10, '#7a5230');
      }
    });
  };

  function mudBall(c, R, rot) {
    c.save();
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
    const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.05);
    g.addColorStop(0, '#9a7448'); g.addColorStop(0.5, '#5e4126'); g.addColorStop(1, '#2a1b0e');
    c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2);
    c.fillStyle = 'rgba(30,18,8,0.5)';
    for (let k = 0; k < 4; k++) { const a = rot + k * 1.7; circle(c, Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, R * 0.2); }
    c.restore();
    c.fillStyle = 'rgba(230,200,150,0.4)'; ell(c, -R * 0.36, -R * 0.42, R * 0.26, R * 0.13, -0.7); c.fill();
  }
  const ds0 = drawSeed9;
  drawSeed9 = function (c, s, z) {
    if (s.draw9 !== 'mud') return ds0.apply(this, arguments);
    const R = 3.6 * (s.size || 1), y = s.y - z + 2;
    c.save(); c.translate(s.x, y);
    c.fillStyle = 'rgba(0,0,0,0.22)'; ell(c, 1, R * 0.55 + z * 0.3, R * 0.9, R * 0.38); c.fill();
    mudBall(c, R, (s.mrot28 || 0) + (s.t || 0) * 6);
    c.restore();
    return true;
  };

  const dn0 = drawSnake;
  drawSnake = function (c, sn, t) {
    dn0(c, sn, t);
    if (!(sn.mud28 > 0) || sn.burrowed || !sn.alive) return;
    safe(() => {
      const L = sn.mud28; c.save();
      c.fillStyle = `rgba(90,60,32,${0.2 + 0.14 * L})`;
      for (let k = 0; k < sn.pts.length; k++) {
        const p = sn.pts[k]; if (p.hid) continue;
        if (k % 3 < L) circle(c, p.x + Math.sin(k * 2.7) * p.r * 0.3, p.y + Math.cos(k * 1.9) * p.r * 0.3, p.r * (0.55 + 0.1 * L));
      }
      if (L >= MAXL) {
        c.strokeStyle = 'rgba(200,170,120,0.7)'; c.lineWidth = 1;
        for (let k = 1; k < sn.pts.length; k += 2) {
          const p = sn.pts[k]; if (p.hid) continue;
          c.beginPath(); c.moveTo(p.x - p.r * 0.5, p.y - p.r * 0.2); c.lineTo(p.x, p.y + p.r * 0.1); c.lineTo(p.x + p.r * 0.5, p.y - p.r * 0.1); c.stroke();
        }
      }
      c.restore();
      if (Math.random() < 0.05 * L) burst(sn.x, sn.y, 1, '#5a3d22');
    });
  };

  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (id !== 'mud') return di0.apply(this, arguments);
    const R = S * 0.42; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    safe(() => {
      c.fillStyle = 'rgba(0,0,0,0.28)'; ell(c, 0, R * 0.8, R * 1.0, R * 0.22); c.fill();
      c.fillStyle = '#4a3320'; ell(c, 0, R * 0.55, R * 0.95, R * 0.35); c.fill();
      c.save(); c.translate(0, -R * 0.05);
      mudBall(c, R * 0.72, 0.6);
      c.restore();
      c.fillStyle = '#3a2614';
      for (const [x, w] of [[-0.5, 0.12], [0.1, 0.1], [0.55, 0.12]]) { ell(c, R * x, R * 0.62 + Math.sin(t * 2 + x * 5) * R * 0.04, R * w, R * 0.2); c.fill(); }
      c.fillStyle = '#d99aa0'; ell(c, R * 0.78, R * 0.42, R * 0.2, R * 0.06, -0.4); c.fill();
    });
    c.restore();
  };

  for (const s of ['MODDER', 'KLEI']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  Object.assign(window.__bitten || (window.__bitten = {}), { MUD28: { NEW } });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
})();


