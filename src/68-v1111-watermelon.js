/* src/68-v1111-watermelon.js: v11.11: Watermelon. From v11.11. Lines 32640 to 32821 of the v13.7 script. */
/* ===== v11.11: Watermelon. Seeds become big round melons. They burst, stick to the floor, and shove snakes back a little. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe68'); console.error(e); return fb; } };
  const MAX_LIVE = 5, MAX_PUDDLES = 10, PUDDLE_T = 6, KB_STEPS = 2, KB_STEP = 4;

  const NEW = {
    melon: { name: 'Watermelon', desc: 'Seeds are big round melons: 25% more damage, 1.3x slower shots. They burst on impact, shove snakes back a bit and leave a sticky puddle for 6 seconds. Max 5 melons in flight. Bosses: a third of the shove.', apply(p) { p.melon27 = true; p.fireDelay *= 1.3; p.seedSize *= 1.0; } }
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = 3.5;


  const i0 = initPlayer9;
  initPlayer9 = function (P, C) { i0(P, C); P.melon27 = false; };

  const liveMelons = () => { let n = 0; for (const s of G.seeds) if (s.melon27) n++; return n; };

  const sd0 = seed9;
  seed9 = function (P, s, o) {
    sd0(P, s, o);
    if (!P || !P.melon27 || !s || s.draw9 || (o && o.noMelon) || liveMelons() >= MAX_LIVE) return;
    s.melon27 = true; s.draw9 = 'melon';
    s.size *= 2.1; s.dmg *= 1.25; s.vx *= 0.88; s.vy *= 0.88;
    s.pierce = false; s.split = false; s.boom = false; s.fizzy = false; s.cannon = false;
    s.mrot27 = Math.random() * TAU;
  };

  /* knock back, tiny */
  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    if (!s || !s.melon27 || !sn || !sn.alive) return;
    safe(() => {
      const a = Math.atan2(s.vy, s.vx), steps = sn.isBoss ? 1 : KB_STEPS;
      for (let i = 0; i < steps; i++) {
        const nx = sn.x + Math.cos(a) * KB_STEP, ny = sn.y + Math.sin(a) * KB_STEP;
        if (!freeAt(room, nx, ny, sn.headR * 0.7)) break;
        sn.moveTo(nx, ny);
      }
      sn.slow = Math.max(sn.slow || 0, 0.4);
    });
  };

  /* the burst: runs for every melon that left G.seeds this frame, hit or miss */
  function splat(room, s) {
    const x = s.x, y = s.y, R = 5 * (s.size || 1);
    safe(() => {
      burst(x, y, 16, '#ff4a5e', { min: 40, max: 170, rmin: 1.6, rmax: 3.4, lmin: 0.35, lmax: 0.8, drag: 3.5, col2: '#c81e3a' });
      burst(x, y, 8, '#2f8a34', { min: 50, max: 150, rmin: 1.8, rmax: 3.2, lmin: 0.4, lmax: 0.8, drag: 3 });
      burst(x, y, 6, '#140a0a', { min: 60, max: 190, rmin: 1.0, rmax: 1.8, lmin: 0.5, lmax: 0.9, drag: 2.5 });
      ring10(x, y, R * 1.8, '#ff6a7a', 0.3, false);
      Sfx.splat();
    });
    safe(() => addDecal(room, 'splat', x, y, R * 1.1, '#d8283c'));
    safe(() => {
      if (!room.mel27) room.mel27 = [];
      const a = Math.random() * TAU;
      room.mel27.push({
        x, y, t: 0, life: PUDDLE_T, r: R * 1.9, seed: Math.random() * 10,
        h: [{ dx: Math.cos(a) * R * 0.7, dy: Math.sin(a) * R * 0.35, a: a, s: R * 0.95 }, { dx: -Math.cos(a) * R * 0.7, dy: -Math.sin(a) * R * 0.35, a: a + 2.6, s: R * 0.8 }],
        pips: [0, 1, 2, 3, 4, 5].map(() => ({ a: Math.random() * TAU, d: Math.random() * R * 1.3 }))
      });
      if (room.mel27.length > MAX_PUDDLES) room.mel27.shift();
    });
  }
  const us0 = updateSeeds;
  updateSeeds = function (dt, room) {
    const before = G.seeds.filter((s) => s.melon27);
    us0.apply(this, arguments);
    if (!before.length) return;
    safe(() => { if (G.room !== room) return; for (const s of before) if (!G.seeds.includes(s)) splat(room, s); });
  };

  /* the floor: puddles slow snakes, halves lie around */
  const up0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) {
    up0(P, dt, room, sp);
    safe(() => {
      if (!room || !room.mel27 || !room.mel27.length) return;
      for (let i = room.mel27.length - 1; i >= 0; i--) { const m = room.mel27[i]; m.t += dt; if (m.t > m.life) room.mel27.splice(i, 1); }
      for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed) continue;
        for (const m of room.mel27) { const rr = m.r + sn.headR * 0.6; if (dist2(sn.x, sn.y, m.x, m.y) < rr * rr) { sn.slow = Math.max(sn.slow || 0, 0.3); break; } }
      }
    });
  };
  function drawHalf(c, x, y, a, s, al) {
    c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = al;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(1, 2, s, s * 0.62, 0, 0, TAU); c.fill();
    c.fillStyle = '#1f6a2a'; c.beginPath(); c.ellipse(0, 0, s, s * 0.62, 0, 0, TAU); c.fill();
    c.fillStyle = '#e6f2c0'; c.beginPath(); c.ellipse(0, 0, s * 0.9, s * 0.54, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(-s * 0.2, -s * 0.15, 1, 0, 0, s * 0.8);
    g.addColorStop(0, '#ff7a86'); g.addColorStop(0.6, '#e8334a'); g.addColorStop(1, '#b81c34');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, s * 0.78, s * 0.45, 0, 0, TAU); c.fill();
    c.fillStyle = '#140a0a';
    for (let i = 0; i < 5; i++) { const px = (i - 2) * s * 0.28, py = ((i * 7) % 3 - 1) * s * 0.14; c.beginPath(); c.ellipse(px, py, s * 0.05, s * 0.09, 0.5, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-s * 0.3, -s * 0.18, s * 0.22, s * 0.08, -0.3, 0, TAU); c.fill();
    c.restore();
  }
  const df0 = drawFloorThings;
  drawFloorThings = function (c, room, t) {
    df0.apply(this, arguments);
    if (!room.mel27 || !room.mel27.length) return;
    for (const m of room.mel27) {
      const al = m.t < 0.15 ? m.t / 0.15 : m.t > m.life - 1.2 ? Math.max(0, (m.life - m.t) / 1.2) : 1;
      const sq = Math.min(1, 0.55 + m.t * 3);
      c.save(); c.globalAlpha = al;
      const g = c.createRadialGradient(m.x, m.y, 1, m.x, m.y, m.r);
      g.addColorStop(0, 'rgba(255,90,110,0.55)'); g.addColorStop(0.7, 'rgba(210,40,66,0.4)'); g.addColorStop(1, 'rgba(180,30,56,0)');
      c.fillStyle = g; c.beginPath(); c.ellipse(m.x, m.y, m.r * sq, m.r * 0.7 * sq, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,200,205,0.35)'; c.beginPath(); c.ellipse(m.x - m.r * 0.25, m.y - m.r * 0.2, m.r * 0.3, m.r * 0.14, 0, 0, TAU); c.fill();
      c.fillStyle = '#140a0a';
      for (const p of m.pips) { c.beginPath(); c.ellipse(m.x + Math.cos(p.a) * p.d * sq, m.y + Math.sin(p.a) * p.d * 0.6 * sq, 1.1, 1.8, p.a, 0, TAU); c.fill(); }
      c.restore();
      for (const h of m.h) drawHalf(c, m.x + h.dx, m.y + h.dy, h.a, h.s, al);
    }
  };

  /* shaded sphere: one routine for the seed and the icon */
  function melonBall(c, R, rot) {
    c.save();
    c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
    const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.05);
    g.addColorStop(0, '#9be06a'); g.addColorStop(0.45, '#3f9a3a'); g.addColorStop(1, '#0f4a22');
    c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2);
    c.strokeStyle = 'rgba(10,54,26,0.7)'; c.lineWidth = R * 0.26; c.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const f = rot + k * Math.PI / 5, cx = Math.cos(f);
      if (Math.abs(cx) < 0.12) continue;
      c.beginPath(); c.ellipse(0, 0, Math.abs(cx) * R, R, 0, -Math.PI / 2, Math.PI / 2, cx < 0); c.stroke();
    }
    const sh = c.createRadialGradient(-R * 0.4, -R * 0.45, R * 0.2, 0, 0, R * 1.1);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.75, 'rgba(0,20,10,0.05)'); sh.addColorStop(1, 'rgba(0,20,10,0.55)');
    c.fillStyle = sh; c.fillRect(-R, -R, R * 2, R * 2);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(-R * 0.38, -R * 0.45, R * 0.28, R * 0.15, -0.7, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.arc(-R * 0.12, -R * 0.62, R * 0.07, 0, TAU); c.fill();
  }
  const ds0 = drawSeed9;
  drawSeed9 = function (c, s, z) {
    if (s.draw9 !== 'melon') return ds0.apply(this, arguments);
    const R = 5 * (s.size || 1), y = s.y - z + 2;
    c.save(); c.translate(s.x, y);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(1, R * 0.55 + z * 0.3, R * 0.9, R * 0.38, 0, 0, TAU); c.fill();
    melonBall(c, R, (s.mrot27 || 0) + s.t * 7);
    c.restore();
    return true;
  };

  /* the icon: a melon with a cut wedge, lit from the top left */
  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (id !== 'melon') return di0.apply(this, arguments);
    const R = S * 0.4;
    c.save(); c.translate(0, S * 0.02);
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(R * 0.1, R * 1.02, R * 0.95, R * 0.24, 0, 0, TAU); c.fill();
    melonBall(c, R, 0.5);
    /* wedge cut out of the front */
    c.save();
    c.beginPath(); c.moveTo(R * 0.05, R * 0.1); c.lineTo(R * 0.98, R * 0.42); c.arc(0, 0, R, 0.4, 1.25); c.closePath(); c.clip();
    c.fillStyle = '#e6f2c0'; c.fillRect(-R, -R, R * 2, R * 2);
    c.restore();
    c.save();
    c.beginPath(); c.moveTo(R * 0.05, R * 0.1); c.lineTo(R * 0.9, R * 0.4); c.arc(0, 0, R * 0.9, 0.42, 1.22); c.closePath(); c.clip();
    const g = c.createLinearGradient(0, 0, R * 0.5, R);
    g.addColorStop(0, '#ff7a86'); g.addColorStop(0.55, '#e8334a'); g.addColorStop(1, '#b81c34');
    c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2);
    c.fillStyle = '#140a0a';
    for (const [px, py] of [[0.4, 0.38], [0.52, 0.62], [0.28, 0.6], [0.66, 0.5], [0.4, 0.8]]) { c.beginPath(); c.ellipse(R * px, R * py, R * 0.05, R * 0.09, 0.6, 0, TAU); c.fill(); }
    c.restore();
    /* stem */
    c.strokeStyle = '#5a7a24'; c.lineWidth = Math.max(1.5, S * 0.05); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-R * 0.1, -R * 0.98); c.quadraticCurveTo(-R * 0.05, -R * 1.2, R * 0.2, -R * 1.22); c.stroke();
    c.restore();
  };

  Object.assign(window.__bitten || (window.__bitten = {}), { MELON27: { NEW, splat, melonBall } });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
})();

