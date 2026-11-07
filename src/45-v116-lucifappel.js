/* src/45-v116-lucifappel.js: v11.6: Lucifappel. From v11.6. Lines 21683 to 21908 of the v13.7 script. */
/* =====================================================================
   Version 11.6: Lucifappel. A matchbox with a stem and a lit match on top.
   Every fourth seed is a burning match, walking charges the striker, and a
   full striker throws a fan of five matches. Fire on the floor does nothing to him.
   ===================================================================== */
CHAR_IDS.push('lucif');
CHARS.lucif = {
  name: 'Lucifappel', desc: 'A box of matches with a stem. Gold, red and black, smells of sulphur. Strikes on anything.',
  speed: 154, fireDelay: 0.36, dmg: 0.95, seedSize: 1, maxHp: 6, lucif: true,
  perk: 'Every fourth seed is a lit match that sets snakes on fire. Walking in a fight charges the striker: full, the next shot throws five matches. Fire on the floor does nothing to him.',
  unlock: 'Burn 150 snakes.', ach: 'lucif26',
};
ACHS.push({ id: 'lucif26', reward: 'ember', name: 'Strijkhout', desc: 'Burn 150 snakes.', stat: 'burnKills', goal: 150, unlocks: 'lucif' });
CHAR_CLASH10.lucif = ['ember'];
const LUCIF26 = { fanN: 5, fanSpread: 0.22, fanMult: 0.7, every: 4, heatPer: 650 };

/* ------------------------------------------------------------------ what he does */
{
  const i0 = initPlayer9;
  initPlayer9 = function (P, C) { i0(P, C); P.lucif26 = !!(C && C.lucif); P.match26 = 0; P.heat26 = 0; P.lit26 = false; P.fan26 = false; };

  const s0 = seed9;
  seed9 = function (P, s, o) {
    s0(P, s, o);
    if (!P || !P.lucif26 || !s) return;
    let m = false;
    if (P.fan26) m = true;
    else if (o && o.inherit && ++P.match26 % LUCIF26.every === 0) m = true;
    if (!m) return;
    s.ember = true; s.match26 = true;
    if (!s.draw9) s.draw9 = 'match26';
  };

  const f0 = fire9;
  fire9 = function (P, base) {
    f0(P, base);
    const room = G.room;
    if (!P || !P.lucif26 || !room || P.heat26 < 1 || !room.locked) return;
    P.heat26 = 0; P.lit26 = false; P.fan26 = true;
    try {
      const n = LUCIF26.fanN;
      for (let i = 0; i < n; i++) makeSeed(P, P.x, P.y - 2, base + (i - (n - 1) / 2) * LUCIF26.fanSpread, { mult: LUCIF26.fanMult, noCan: true });
    } finally { P.fan26 = false; }
    burst(P.x + Math.cos(base) * 12, P.y + Math.sin(base) * 12, 12, '#ff9a3a', { min: 40, max: 120, lmin: 0.2, lmax: 0.45, glow: true });
    flashLight(P.x, P.y, 120, 0.7, 0.25);
    floatText(P.x, P.y - 26, 'FWOOSH', '#ffb44a');
    Sfx.noise(0.35, { filter: 'bandpass', f: 900, fTo: 2600, q: 0.8, vol: 0.12 }); Sfx.tone(220, 0.25, { to: 520, type: 'sawtooth', vol: 0.04, lp: 1400 });
  };

  const u0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) {
    u0(P, dt, room, sp);
    if (!P.lucif26 || !room) return;
    const fight = room.locked && room.snakes && room.snakes.some((s) => s.alive);
    if (!fight) { P.heat26 = Math.max(0, P.heat26 - dt * 0.15); if (P.heat26 < 1) P.lit26 = false; return; }
    if (P.heat26 < 1) {
      P.heat26 = Math.min(1, P.heat26 + Math.hypot(P.vx || 0, P.vy || 0) * dt / LUCIF26.heatPer);
      if (P.heat26 >= 1 && !P.lit26) {
        P.lit26 = true;
        floatText(P.x, P.y - 24, 'LIT', '#ffd36a');
        burst(P.x, P.y - P.R - 6, 6, '#ffd36a', { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
        Sfx.noise(0.12, { filter: 'highpass', f: 2800, vol: 0.08 }); Sfx.tone(1200, 0.08, { type: 'triangle', vol: 0.03 });
      }
    }
  };

  // fire on the floor: he was made to burn
  const uf0 = updateFires;
  updateFires = function (dt, room) {
    const P = G.player;
    if (!P || !P.lucif26 || !room.fires || !room.fires.length) return uf0(dt, room);
    const hot = room.fires.filter((f) => f.hostile);
    for (const f of hot) f.hostile = false;
    try { uf0(dt, room); } finally { for (const f of hot) f.hostile = true; }
  };

  // a match in flight: a pale stick, a red head, a flame that trails behind
  const ds0 = drawSeed9;
  drawSeed9 = function (c, s, z) {
    if (s.draw9 !== 'match26') return ds0(c, s, z);
    const y = s.y - z + 2, k = Math.max(0.8, s.size || 1), a = Math.atan2(s.vy, s.vx), L = 9 * k;
    c.save(); c.translate(s.x, y); c.rotate(a);
    c.strokeStyle = '#3a2410'; c.lineWidth = 2.6 * k; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-L, 0); c.lineTo(L * 0.4, 0); c.stroke();
    c.strokeStyle = '#efd29a'; c.lineWidth = 1.6 * k; c.stroke();
    c.fillStyle = '#2a0608'; ell(c, L * 0.55, 0, 3 * k, 2.4 * k); c.fill();
    c.fillStyle = '#c4121e'; ell(c, L * 0.5, -0.3 * k, 2.4 * k, 1.8 * k); c.fill();
    const fl = 1 + Math.sin((s.t + s.x * 0.01) * 40) * 0.15;
    c.fillStyle = 'rgba(255,120,30,0.85)'; ell(c, L * 0.2, 0, 6 * k * fl, 2.8 * k); c.fill();
    c.fillStyle = 'rgba(255,220,120,0.9)'; ell(c, L * 0.38, 0, 3.4 * k * fl, 1.6 * k); c.fill();
    c.restore();
    if (Math.random() < 0.35) addP({ kind: 'dot', x: s.x - Math.cos(a) * 4, y: y - Math.sin(a) * 4, vx: rnd(-10, 10), vy: rnd(-30, -10), r: rnd(0.8, 1.6), life: 0.3, col: Math.random() < 0.5 ? '#ff8a2a' : '#ffd36a', glow: true, drag: 1 });
    return true;
  };

  // the striker meter: a strip of sandpaper under him that fills up
  const dpo0 = drawPlayerOver9;
  drawPlayerOver9 = function (c, P, t) {
    dpo0(c, P, t);
    if (!P.lucif26 || P.dying > 0 || !G.room || !G.room.locked) return;
    const w = 22, x = P.x - w / 2, y = P.y + P.R + 5;
    c.fillStyle = 'rgba(20,10,6,0.75)'; c.fillRect(x - 1, y - 1, w + 2, 4.4);
    c.fillStyle = '#6a3a1e'; c.fillRect(x, y, w, 2.4);
    c.fillStyle = P.lit26 ? `rgba(255,${180 + Math.round(60 * Math.sin(t * 12))},80,1)` : '#e8a040';
    c.fillRect(x, y, w * clamp(P.heat26 || 0, 0, 1), 2.4);
  };
}

/* ------------------------------------------------------------------ how he looks */
function lucifMatch26(c, x0, y0, x1, y1, R, t, lit) {
  c.strokeStyle = '#3a2410'; c.lineWidth = R * 0.17; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = '#f0d49a'; c.lineWidth = R * 0.1; c.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.translate(x1, y1); c.rotate(a);
  c.fillStyle = '#2a0608'; ell(c, R * 0.06, 0, R * 0.2, R * 0.15); c.fill();
  c.fillStyle = '#c4121e'; ell(c, R * 0.03, -R * 0.02, R * 0.15, R * 0.1); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, -R * 0.02, -R * 0.06, R * 0.06, R * 0.03); c.fill();
  c.restore();
  if (!lit) return;
  const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06, hx = x1 + Math.cos(a) * R * 0.1, hy = y1 + Math.sin(a) * R * 0.1;
  const g = c.createRadialGradient(hx, hy - R * 0.2, 0, hx, hy - R * 0.2, R * 0.7);
  g.addColorStop(0, 'rgba(255,190,80,0.45)'); g.addColorStop(1, 'rgba(255,120,30,0)');
  c.fillStyle = g; circle(c, hx, hy - R * 0.2, R * 0.7);
  flameShape(c, hx, hy - R * 0.28, R * 0.2 * f, R * 0.42 * f); c.fillStyle = '#ff6a1a'; c.fill();
  flameShape(c, hx, hy - R * 0.2, R * 0.11 * f, R * 0.26 * f); c.fillStyle = '#ffe08a'; c.fill();
}
function lucifBanner26(c, R, y, w, h, col, dots) {
  // a ribbon with curled ends, the kind every old label has
  c.fillStyle = '#0e0a08';
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * w * 0.86, y - h * 0.3); c.lineTo(s * w * 1.08, y - h * 0.15); c.lineTo(s * w * 0.98, y + h * 0.2); c.lineTo(s * w * 1.1, y + h * 0.55); c.lineTo(s * w * 0.86, y + h * 0.6); c.closePath(); c.fill();
    c.fillStyle = '#3a2a18'; c.beginPath(); c.moveTo(s * w * 0.86, y + h * 0.6); c.lineTo(s * w * 0.78, y + h * 0.45); c.lineTo(s * w * 0.86, y + h * 0.3); c.closePath(); c.fill();
    c.fillStyle = '#0e0a08';
  }
  c.beginPath(); c.moveTo(-w * 0.86, y - h * 0.5); c.quadraticCurveTo(0, y - h * 0.9, w * 0.86, y - h * 0.5);
  c.lineTo(w * 0.86, y + h * 0.5); c.quadraticCurveTo(0, y + h * 0.1, -w * 0.86, y + h * 0.5); c.closePath(); c.fill();
  c.strokeStyle = col; c.lineWidth = Math.max(0.4, R * 0.035); c.stroke();
  if (dots) {
    c.fillStyle = col;
    for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9, x = (u - 0.5) * w * 1.4, yy = y - h * 0.2 - Math.sin(u * Math.PI) * h * 0.22; c.fillRect(x - R * 0.04, yy - R * 0.05, R * 0.08, R * 0.11); }
  }
}
function lucifStriker26(c, R) {
  c.fillStyle = '#5a2e16';
  for (const s of [-1, 1]) c.fillRect(s < 0 ? -R * 1.2 : R * 0.86, -R, R * 0.34, R * 2);
  c.fillStyle = 'rgba(20,8,4,0.55)';
  for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1, x = s * (R * 0.9 + ((i * 0.37) % 1) * R * 0.18), y = -R * 0.9 + ((i * 0.61) % 1) * R * 1.8; circle(c, x, y, R * 0.025); }
}
function drawLucif26(c, R, st) {
  const t = st.t || 0, fear = st.fear || 0;
  // the gold box
  const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#fff0b0'); g.addColorStop(0.45, '#e2b04e'); g.addColorStop(1, '#7a4e12');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  lucifStriker26(c, R);
  // the red label, framed in a thin cream line
  c.save(); c.scale(0.8, 0.82); applePath(c, R); c.restore();
  c.fillStyle = '#d5232f'; c.fill();
  c.save(); c.scale(0.8, 0.82); applePath(c, R); c.restore();
  c.strokeStyle = '#f6e6b8'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
  // engraved lines in the red, like cheap old printing
  c.strokeStyle = 'rgba(120,8,16,0.5)'; c.lineWidth = Math.max(0.3, R * 0.025);
  for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * R * 0.13 - R * 0.3, -R); c.lineTo(i * R * 0.13 + R * 0.3, R); c.stroke(); }
  // the cream cartouche where the face lives
  ell(c, 0, R * 0.08, R * 0.6, R * 0.47); c.fillStyle = '#f6e6b8'; c.fill();
  c.strokeStyle = '#0e0a08'; c.lineWidth = Math.max(0.5, R * 0.045); c.stroke();
  ell(c, 0, R * 0.08, R * 0.53, R * 0.4); c.strokeStyle = 'rgba(213,35,47,0.7)'; c.lineWidth = Math.max(0.3, R * 0.025); c.stroke();
  // the black bar at the bottom with two gold rules
  c.fillStyle = '#0e0a08'; c.fillRect(-R * 1.2, R * 0.66, R * 2.4, R * 0.5);
  c.fillStyle = '#e2b04e'; c.fillRect(-R * 1.2, R * 0.7, R * 2.4, R * 0.035); c.fillRect(-R * 1.2, R * 0.86, R * 2.4, R * 0.035);
  if (st.cyanide) { c.fillStyle = 'rgba(38,74,30,0.6)'; for (const [x, y, r] of [[-0.58, 0.36, 0.09], [0.52, 0.52, 0.07], [0.64, -0.22, 0.06]]) circle(c, x * R, y * R, r * R); }
  c.restore();
  ell(c, -R * 0.52, -R * 0.42, R * 0.17, R * 0.09, -0.7); c.fillStyle = 'rgba(255,255,240,0.55)'; c.fill();
  if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(255,236,190,0.8)'; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.78, -1.15, -0.35); c.stroke(); }
  applePath(c, R); c.strokeStyle = '#2a1404'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  lucifBanner26(c, R, -R * 0.5, R, R * 0.26, '#e2b04e', true);
  // a small flourish under the ribbon
  c.strokeStyle = '#0e0a08'; c.lineWidth = Math.max(0.4, R * 0.035);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, -R * 0.3); c.bezierCurveTo(s * R * 0.12, -R * 0.38, s * R * 0.2, -R * 0.24, s * R * 0.1, -R * 0.24); c.stroke(); }
  if (st.face !== false) {
    const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
    for (const s of [-1, 1]) {
      const x = s * R * 0.25 + lx * R * 0.04, y = R * 0.04 + ly * R * 0.03;
      ell(c, x, y, R * 0.14, R * 0.15 * open); c.fillStyle = '#fffaf0'; c.fill();
      c.strokeStyle = '#1a0606'; c.lineWidth = Math.max(0.5, R * 0.045); c.stroke();
      if (open > 0.3) {
        const px = x + lx * R * 0.05, py = y + ly * R * 0.05 * open;
        c.fillStyle = '#c4121e'; circle(c, px, py, R * 0.075); c.fillStyle = '#120404'; circle(c, px, py, R * 0.04);
        c.fillStyle = '#ffffff'; circle(c, px - R * 0.03, py - R * 0.03, R * 0.022);
      }
      // a heavy lid: he is never fully awake, never fully worried
      c.fillStyle = '#e2b04e'; c.beginPath(); c.ellipse(x, y, R * 0.155, R * 0.16 * open, 0, Math.PI * 1.02, Math.PI * 1.98); c.fill();
      c.strokeStyle = '#1a0606'; c.lineWidth = Math.max(0.5, R * 0.045); c.beginPath(); c.moveTo(x - R * 0.15, y - R * 0.02); c.lineTo(x + R * 0.15, y - R * 0.02 + s * R * 0.0); c.stroke();
      // sharp brows that go up at the outside
      c.lineWidth = Math.max(0.6, R * 0.06); c.beginPath(); c.moveTo(s * R * 0.1, -R * 0.13 - fear * R * 0.03); c.lineTo(s * R * 0.42, -R * 0.24 - fear * R * 0.06); c.stroke();
    }
    if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.34, R * 0.1, R * 0.11); c.fillStyle = '#2a0408'; c.fill(); }
    else {
      // a smirk to one side, one tooth showing
      c.beginPath(); c.moveTo(-R * 0.2, R * 0.31); c.quadraticCurveTo(R * 0.02, R * 0.42, R * 0.26, R * 0.24);
      c.quadraticCurveTo(R * 0.06, R * 0.36, -R * 0.2, R * 0.31); c.fillStyle = '#2a0408'; c.fill();
      c.strokeStyle = '#1a0606'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
      c.fillStyle = '#fffaf0'; c.fillRect(R * 0.08, R * 0.3, R * 0.06, R * 0.05);
    }
  }
  // the stem is a match, and it is lit
  lucifMatch26(c, R * 0.02, -R * 0.62, R * 0.14, -R * 1.42, R, t, true);
  leafShape(c, R * 0.06, -R * 0.88, R * 0.5, -0.4 + (st.leaf || 0));
}
{
  const da0 = drawApple;
  drawApple = function (c, R, st) {
    if (st && st.char === 'lucif') { c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; try { drawLucif26(c, R, st); } finally { c.restore(); } return; }
    return da0.apply(this, arguments);
  };
}

