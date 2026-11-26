/* 62.js section 00: prelude. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
/* src/62-v111-skins.js: v11.1 to v13.6: skins, wardrobe, Epic, Grotesque, Arcade (SKINS24). From v11.1, v12.2, v13.2, v13.4, v13.5, v13.6. Lines 27901 to 31013 of the v13.7 script. */
/* ===== v11.1: Skins. Every playable apple gets a second look in its own theme. Tap a character to open the wardrobe. ===== */
(function (S62) {
  'use strict';
  S62.bites24 = bites24; S62.skinBody24 = skinBody24;
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe62'); console.error(e); return fb; } }; S62.safe = safe;
  const DISPLAY = '"Grenze Gotisch", Georgia, serif';

  /* ------------------------------------------------------------------ shared pieces */
  function bites24(c, R, st) {
    if (!st.bites || !st.bites.length) return;
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor((st.t || 0) - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  function skinBody24(c, R, st, P) {
    if (st.horns) {
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(s * R * 0.35, -R * 0.7); c.quadraticCurveTo(s * R * 0.75, -R * 1.25, s * R * 0.62, -R * 1.62);
        c.quadraticCurveTo(s * R * 0.5, -R * 1.15, s * R * 0.12, -R * 0.82); c.closePath();
        c.fillStyle = '#8a0e14'; c.fill(); c.strokeStyle = '#2b0306'; c.lineWidth = Math.max(0.7, R * 0.07); c.stroke();
      }
    }
    const g = c.createRadialGradient(-R * 0.38, -R * 0.42, R * 0.08, 0, 0, R * 1.18);
    g.addColorStop(0, P.g[0]); g.addColorStop(0.42, P.g[1]); g.addColorStop(1, P.g[2]);
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    c.strokeStyle = P.vein; c.lineWidth = R * 0.05;
    for (const x of [-0.55, -0.2, 0.3, 0.62]) { c.beginPath(); c.moveTo(x * R, -R * 0.7); c.quadraticCurveTo(x * R * 1.15, 0, x * R * 0.8, R * 0.85); c.stroke(); }
    if (P.inside) P.inside(c, R, st);
    if (st.cyanide && P.cyan !== false) {
      c.fillStyle = 'rgba(38,74,30,0.6)';
      for (const [x, y, r] of [[-0.58, 0.36, 0.09], [0.52, 0.52, 0.07], [0.64, -0.22, 0.06], [-0.3, 0.72, 0.05], [0.12, 0.66, 0.045]]) circle(c, x * R, y * R, r * R);
    }
    c.restore();
    ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = P.hl; c.fill();
    if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(255,236,190,0.8)'; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.78, -1.15, -0.35); c.stroke(); }
    applePath(c, R); c.strokeStyle = P.out; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
  }
  const rnd24 = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }; S62.rnd24 = rnd24;

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
