/* src/86-v14-exitfx.js: v14.4 floor exits with their own animation.
   The hole: every apple crouches, hops in an arc into the hole and drops spinning into the dark while an iris
   closes on the hole. The next floor opens with an iris on the apples, who fall in from above and land with a squash
   and a puff of dust. The light: the beam widens, rays turn around each rising apple, motes spiral up with it.
   Online: the timing and the apple positions move only inside the simulation (G.trans ticks on every peer, no
   random draws), everything else is drawn from tick time, so peers stay in lockstep and nobody is held up:
   every apple goes down together, as before. */
(function () {
  'use strict';
  const safe = (f) => { try { return f(); } catch (e) { errNote14(e, 'exitfx86'); console.error(e); } };
  const OUT = 1.3, IN = 1.05, STAG = 0.08;
  const CROUCH = 0.12, HOP = 0.45, DROP = 0.4, FALL = 0.45, LAND = 0.35, FALL_H = 92;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const calm = (P) => { P.sink = 0; P.hopH = 0; P.squash = 0; };

  /* ================================================================ simulation */
  const d0 = Game.descend;
  Game.descend = function () {
    if (G.trans) return;
    const ex = G.room && G.room.exit;
    if (!ex) return d0.apply(this, arguments);
    const js = players14().map((Q, k) => ({ P: Q, x0: Q.x, y0: Q.y, d: k * STAG, hop: false, drop: false }));
    G.trans = { kind: 'descend', phase: 'out', t: 0, x0: G.player.x, y0: G.player.y, fx14: { ex: { x: ex.x, y: ex.y }, js } };
  };
  const arrive = () => ({ kind: 'descend', phase: 'in', t: 0, fx14: { land: players14().map((Q, k) => ({ P: Q, d: k * STAG, hit: false })) } });

  const ut0 = Game.updateTrans;
  Game.updateTrans = function (dt) {
    const tr = G.trans;
    if (!tr || tr.kind !== 'descend' || !tr.fx14) return ut0.apply(this, arguments);
    tr.t += dt;
    const F = tr.fx14;
    G.fade = 0;
    if (tr.phase === 'out') {
      const ex = F.ex;
      for (const j of F.js) {
        const P = j.P, s = tr.t - j.d;
        if (s <= 0) continue;
        if (s < CROUCH) { P.squash = 0.7 * Math.sin(Math.PI * s / CROUCH); P.hopH = 0; continue; }
        const u = clamp01((s - CROUCH) / HOP), e = smooth(u);
        if (!j.hop) { j.hop = true; safe(() => Sfx.tone(300, 0.14, { to: 560, vol: 0.05, type: 'triangle' })); }
        P.x = lerp(j.x0, ex.x, e); P.y = lerp(j.y0, ex.y, e);
        const far = Math.min(40, Math.hypot(j.x0 - ex.x, j.y0 - ex.y) * 0.15);
        P.hopH = Math.sin(Math.PI * u) * (14 + far);
        P.squash = -0.45 * (1 - u);
        if (u >= 1) {
          const v = clamp01((s - CROUCH - HOP) / DROP);
          if (!j.drop) { j.drop = true; if (j === F.js[0]) safe(() => Sfx.descend()); }
          P.hopH = 0; P.sink = smooth(v); P.squash = -0.5 * v;
        }
      }
      if (tr.t >= OUT) {
        for (const j of F.js) calm(j.P);
        if (G.mode === 'story') {
          G.trans = null;
          const next = G.levelIdx + 1;
          Story.play('end' + G.levelIdx, () => {
            G.state = 'play'; UI.el.btnPause.hidden = false;
            this.loadLevel(next);
            G.fade = 0; G.trans = arrive();
          });
          return;
        }
        this.loadLevel(G.levelIdx + 1);
        G.fade = 0;
        G.trans = arrive();
      }
    } else {
      let shook = false;
      for (const l of F.land) {
        const P = l.P, s = tr.t - l.d, v = clamp01(s / FALL);
        if (s < FALL) { P.hopH = FALL_H * (1 - v * v); P.squash = -0.35 * v; continue; }
        const w = clamp01((s - FALL) / LAND);
        if (!l.hit) { l.hit = true; if (!shook) { shook = true; G.shake = Math.max(G.shake, 4); safe(() => Sfx.thud()); } }
        P.hopH = Math.abs(Math.sin(w * Math.PI)) * 3 * (1 - w);
        P.squash = 0.9 * (1 - w) * Math.cos(w * Math.PI * 1.5);
      }
      if (tr.t >= IN) { for (const l of F.land) calm(l.P); G.trans = null; G.fade = 0; }
    }
    updateParticles(dt);
  };

  /* ================================================================ drawing (no sim state changes, no random) */
  const toScreen = (x, y) => [View.ox + (WALL + x) * View.s, View.oy + (WALL + y) * View.s];
  /* the iris: black everywhere except a circle on the hole (out) or on the apples (in) */
  const rr0 = renderRoom;
  renderRoom = function (c, L) {
    rr0.apply(this, arguments);
    const tr = G.trans;
    if (!tr || tr.kind !== 'descend' || !tr.fx14) return;
    safe(() => {
      let x, y, u;
      if (tr.phase === 'out') { x = tr.fx14.ex.x; y = tr.fx14.ex.y; u = 1 - smooth(clamp01((tr.t - 0.45) / (OUT - 0.45))); }
      else {
        const L2 = tr.fx14.land; x = 0; y = 0;
        for (const l of L2) { x += l.P.x; y += l.P.y; }
        x /= Math.max(1, L2.length); y /= Math.max(1, L2.length);
        u = smooth(clamp01(tr.t / 0.6));
      }
      const [cx, cy] = toScreen(x, y), W = View.W, H = View.H;
      const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 20, r = Math.max(0, R * u);
      c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      c.fillStyle = '#000';
      c.beginPath(); c.rect(0, 0, W, H);
      if (r > 0.5) c.arc(cx, cy, r, 0, TAU, true);
      c.fill('evenodd');
      if (r > 0.5 && u < 1) {
        const g = c.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
      }
      c.restore();
    });
  };

  /* dust: a rim puff when an apple drops in, a ground puff when it lands (room coordinates, under the apples) */
  const puff = (c, x, y, w, col, big) => {
    const a = (1 - w) * 0.7;
    if (a <= 0) return;
    c.fillStyle = rgba(col, a);
    for (let i = 0; i < 9; i++) {
      const an = i / 9 * TAU + i * 0.37, rr = (big ? 30 : 14) + w * (big ? 16 : 22);
      circle(c, x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.6 - w * 6, (2.6 + (i % 3)) * (1 - w * 0.6));
    }
  };
  const ft0 = drawFloorThings;
  drawFloorThings = function (c, room, t) {
    ft0.apply(this, arguments);
    const tr = G.trans;
    if (!tr || tr.kind !== 'descend' || !tr.fx14) return;
    safe(() => {
      const L = G.levelDef || LEVELS[0], col = L.decoCol || '#8a7a66';
      if (tr.phase === 'out') {
        const ex = tr.fx14.ex;
        for (const j of tr.fx14.js) {
          const w = (tr.t - j.d - CROUCH - HOP) / 0.5;
          if (w > 0 && w < 1) puff(c, ex.x, ex.y + 2, w, col, true);
        }
        /* the hole breathes in as it swallows */
        const k = clamp01((tr.t - CROUCH - HOP) / 0.6);
        if (k > 0) { c.fillStyle = `rgba(0,0,0,${0.5 * Math.sin(Math.PI * k)})`; ell(c, ex.x, ex.y, 30 + 6 * k, 22 + 4 * k); c.fill(); }
      } else {
        for (const l of tr.fx14.land) {
          const s = tr.t - l.d, P = l.P;
          if (s < FALL) {   /* a shadow that grows as the apple comes down */
            const v = clamp01(s / FALL);
            c.fillStyle = `rgba(0,0,0,${0.12 + 0.22 * v})`; ell(c, P.x + 1, P.y + 12, 4 + 8 * v, 1.5 + 3 * v); c.fill();
          } else puff(c, P.x, P.y + 11, clamp01((s - FALL) / 0.55), col, false);
        }
      }
    });
  };

  /* the light: wider beam, turning rays and spiralling motes around every apple that goes up */
  const ls0 = drawLightShaft;
  drawLightShaft = function (c, ex, t) {
    ls0.apply(this, arguments);
    let E = 0;
    const up = [];
    for (const Q of players14()) if (Q.escaping > 0) { up.push(Q); E = Math.max(E, Q.escaping); }
    if (!up.length) return;
    safe(() => {
      const k = smooth(clamp01(E / 1.6));
      c.save();
      c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(ex.x, ex.y - 240, ex.x, ex.y + 20);
      g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.6, `rgba(255,236,190,${0.32 * k})`); g.addColorStop(1, `rgba(255,236,190,${0.12 * k})`);
      c.fillStyle = g;
      const wt = 18 + 70 * k, wb = 34 + 80 * k;
      c.beginPath(); c.moveTo(ex.x - wt, ex.y - 240); c.lineTo(ex.x + wt, ex.y - 240); c.lineTo(ex.x + wb, ex.y + 14); c.lineTo(ex.x - wb, ex.y + 14); c.closePath(); c.fill();
      /* a ring of light on the floor at the moment of lift off */
      if (E < 0.9) { const w = E / 0.9; c.strokeStyle = `rgba(255,236,190,${0.7 * (1 - w)})`; c.lineWidth = 3 * (1 - w) + 0.5; ell(c, ex.x, ex.y + 6, 12 + w * 90, 5 + w * 34); c.stroke(); }
      for (const Q of up) {
        const qx = Q.x, qy = Q.y - Q.escaping * 30, q = smooth(clamp01(Q.escaping / 1.4));
        /* rays */
        c.fillStyle = `rgba(255,244,210,${0.1 * q})`;
        const n = 8, len = 40 + 110 * q, rot = t * 0.6 + Q.escaping * 0.8;
        for (let i = 0; i < n; i++) {
          const a = rot + i / n * TAU, h = 0.055;
          c.beginPath(); c.moveTo(qx, qy);
          c.lineTo(qx + Math.cos(a - h) * len, qy + Math.sin(a - h) * len);
          c.lineTo(qx + Math.cos(a + h) * len, qy + Math.sin(a + h) * len);
          c.closePath(); c.fill();
        }
        glowDot(c, qx, qy, 18 + 32 * q, '#fff2c8', 0.25 + 0.4 * q);
        /* motes spiral up with the apple */
        c.fillStyle = `rgba(255,250,232,${0.4 + 0.5 * q})`;
        for (let i = 0; i < 12; i++) {
          const ph = (Q.escaping * 0.9 + i / 12) % 1, a = i / 12 * TAU + Q.escaping * 4;
          const rad = 20 * (1 - ph * 0.5);
          circle(c, qx + Math.cos(a) * rad, qy + 18 - ph * 70 + Math.sin(a) * rad * 0.35, (1 + (i % 3) * 0.4) * (1 - ph * 0.6));
        }
      }
      c.restore();
    });
  };
})();
