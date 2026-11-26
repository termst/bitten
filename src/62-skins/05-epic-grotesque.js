/* 62.js section 05: epic-grotesque. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { SKINS, apploa27, lw27, mikaBody27, mikaFace27, rnd24, skinBody24 } = S62;
  S62.stitch122 = stitch122;
  /* ------------------------------------------------------------------ v12.2: epic skins, grotesque skins, Lucky
     The flat recolors are gone, every skin left gets an aura, light rays and its own particles,
     every apple gets one grotesque look, and Lucky gets two. Old saves keep the skin they wore. */
  const OLD122 = {}; S62.OLD122 = OLD122;
  for (const id in SKINS) OLD122[id] = SKINS[id].map((S) => S.name);
  const CUT122 = ['Oranje Rups', 'Blauw Boven', 'Groen Grondje', 'Wormen Eerst', 'Woedeaanval', 'Snoepjas'];
  for (const id in SKINS) SKINS[id] = SKINS[id].filter((S) => !CUT122.includes(S.name));

  /* The Apple: Binnenstebuiten. Turned inside out, the core is a mouth */
  function drawInside122(c, R, st) {
    const t = st.t || 0, pulse = 1 + Math.sin(t * 3) * 0.04;
    skinBody24(c, R, st, { g: ['#fff4dc', '#ecd2a0', '#9a6a34'], vein: 'rgba(180,90,60,0.22)', hl: 'rgba(255,255,255,0.4)', out: '#4a1a0c',
      inside(c, R) {
        c.strokeStyle = 'rgba(200,30,50,0.5)'; c.lineWidth = lw27(R, 0.03);
        for (let i = 0; i < 9; i++) { const a = rnd24(i + 40) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * R * 1.1, Math.sin(a) * R * 1.1); c.quadraticCurveTo(Math.cos(a + 0.4) * R * 0.7, Math.sin(a + 0.4) * R * 0.7, Math.cos(a + 0.2) * R * 0.45, Math.sin(a + 0.2) * R * 0.45); c.stroke(); }
        c.save(); c.translate(0, R * 0.14); c.scale(pulse, 1);
        ell(c, 0, 0, R * 0.32, R * 0.6); c.fillStyle = '#6a121a'; c.fill();
        ell(c, 0, 0, R * 0.21, R * 0.5); c.fillStyle = '#1a0306'; c.fill();
        c.fillStyle = '#3a2010';
        for (let i = 0; i < 5; i++) { const y = -R * 0.36 + i * R * 0.18; seedShape(c, -R * 0.16, y, R * 0.09, Math.PI / 2); c.fill(); seedShape(c, R * 0.16, y + R * 0.08, R * 0.09, -Math.PI / 2); c.fill(); }
        c.restore();
      } });
    c.lineCap = 'round';
    for (const [a, l, ph] of [[-2.35, 0.55, 0], [-0.55, 0.45, 1.4], [2.55, 0.5, 2.7], [0.9, 0.35, 4]]) {
      const w = Math.sin(t * 2 + ph) * 0.15, x0 = Math.cos(a) * R * 0.92, y0 = Math.sin(a) * R * 0.88;
      const x1 = Math.cos(a + 0.4 + w) * R * (0.95 + l), y1 = Math.sin(a + 0.4 + w) * R * (0.9 + l);
      c.strokeStyle = '#4a0610'; c.lineWidth = lw27(R, 0.2);
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(Math.cos(a) * R * (1 + l), Math.sin(a) * R * (1 + l), x1, y1); c.stroke();
      c.strokeStyle = '#d92a40'; c.lineWidth = lw27(R, 0.12); c.stroke();
      c.fillStyle = '#f6e4c0'; circle(c, x1, y1, R * 0.06);
    }
    if (st.face !== false) for (const [x, y, ph] of [[-0.6, -0.28, 0], [-0.5, 0.3, 1.3], [0.56, -0.34, 2.1], [0.6, 0.22, 3.4]]) {
      const open = Math.sin(t * 1.7 + ph) > 0.93 ? 0.15 : 1;
      ell(c, x * R, y * R, R * 0.12, R * 0.13 * open); c.fillStyle = '#fffaf0'; c.fill(); c.strokeStyle = '#2a0608'; c.lineWidth = lw27(R, 0.03); c.stroke();
      if (open > 0.5) { c.fillStyle = '#120404'; circle(c, x * R + clamp(st.lookX || 0, -1, 1) * R * 0.04, y * R + R * 0.02, R * 0.055); }
    }
    drawStem(c, R, st.leaf || 0, 0);
  }

  /* Appelgameplay: Madennest. Holes everywhere, all of them occupied */
  function maggot122(c, x, y, R, a, t, ph) {
    const L = 0.2 + 0.12 * (0.5 + 0.5 * Math.sin(t * 3 + ph));
    c.save(); c.translate(x, y); c.rotate(a + Math.sin(t * 5 + ph) * 0.35);
    for (let i = 4; i >= 0; i--) { const u = i / 4; c.fillStyle = '#2a1a08'; circle(c, u * R * L, Math.sin(t * 6 + ph + i) * R * 0.02, R * (0.075 - u * 0.012)); c.fillStyle = i % 2 ? '#f2e6c8' : '#e2d0a4'; circle(c, u * R * L, Math.sin(t * 6 + ph + i) * R * 0.02, R * (0.06 - u * 0.012)); }
    c.fillStyle = '#3a2410'; circle(c, R * L + R * 0.02, 0, R * 0.03);
    c.restore();
  }
  function drawMaggot122(c, R, st) {
    const t = st.t || 0;
    const HOLES = [[-0.66, 0.5, 2.6], [0.64, 0.46, 0.5], [0.78, -0.18, -0.2], [-0.8, -0.06, 3.2], [0.08, 0.84, 1.6]];
    skinBody24(c, R, st, { g: ['#c8b45a', '#7a5a1e', '#241606'], vein: 'rgba(40,30,10,0.3)', hl: 'rgba(255,250,200,0.22)', out: '#1a1004',
      inside(c, R) {
        c.fillStyle = 'rgba(70,90,20,0.5)'; for (const [x, y, r] of [[-0.4, -0.2, 0.3], [0.45, 0.2, 0.26], [0, 0.6, 0.22]]) circle(c, x * R, y * R, r * R);
        c.fillStyle = 'rgba(20,12,4,0.35)'; for (let i = 0; i < 30; i++) circle(c, (rnd24(i + 90) - 0.5) * R * 2, (rnd24(i + 190) - 0.5) * R * 2, R * 0.025);
        for (const [x, y] of HOLES) { ell(c, x * R, y * R, R * 0.13, R * 0.1); c.fillStyle = '#5a3a14'; c.fill(); ell(c, x * R, y * R, R * 0.085, R * 0.06); c.fillStyle = '#0c0602'; c.fill(); }
      } });
    drawMullet(c, R);
    if (st.face !== false) drawAppelFace(c, R, st);
    HOLES.forEach(([x, y, a], i) => maggot122(c, x * R, y * R, R, a, t, i * 1.7));
    drawAppelStem(c, R, st.leaf || 0, st.twin);
  }

  /* The Rotten Apple: Vliegenkoning. Compound eyes, a sucking mouth, a bottle cap crown */
  function drawFly122(c, R, st) {
    const t = st.t || 0;
    for (const s of [-1, 1]) for (const k of [0, 1]) {
      c.save(); c.translate(s * R * 0.5, -R * 0.3); c.rotate(s * (0.75 + k * 0.5) + Math.sin(t * 55 + k * 2) * 0.1 * s);
      ell(c, 0, -R * 0.75, R * 0.3, R * 0.8); c.fillStyle = 'rgba(200,225,235,0.32)'; c.fill(); c.strokeStyle = 'rgba(20,30,30,0.75)'; c.lineWidth = lw27(R, 0.03); c.stroke();
      c.beginPath(); c.moveTo(0, -R * 0.05); c.lineTo(0, -R * 1.45); c.moveTo(0, -R * 0.6); c.lineTo(R * 0.18, -R * 1.15); c.moveTo(0, -R * 0.9); c.lineTo(-R * 0.15, -R * 1.3); c.stroke();
      c.restore();
    }
    skinBody24(c, R, st, { g: ['#6a8a3a', '#1e2e14', '#040804'], vein: 'rgba(0,0,0,0)', hl: 'rgba(200,255,220,0.35)', out: '#020402',
      inside(c, R) {
        for (let i = 0; i < 6; i++) { c.fillStyle = `hsla(${(110 + i * 40 + t * 30) % 360},70%,45%,0.16)`; c.save(); c.rotate(-0.6); c.fillRect(-R * 1.4, -R * 1.2 + i * R * 0.42, R * 2.8, R * 0.2); c.restore(); }
        c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = lw27(R, 0.02);
        for (let i = 0; i < 40; i++) { const a = rnd24(i + 333) * TAU, d = R * (0.8 + rnd24(i + 7) * 0.2); c.beginPath(); c.moveTo(Math.cos(a) * d, Math.sin(a) * d); c.lineTo(Math.cos(a) * (d + R * 0.12), Math.sin(a) * (d + R * 0.12)); c.stroke(); }
      } });
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        const x = s * R * 0.36, y = -R * 0.14;
        c.save(); ell(c, x, y, R * 0.32, R * 0.36, s * 0.3); c.fillStyle = '#5a0408'; c.fill(); c.clip();
        for (let i = 0; i < 7; i++) for (let k = 0; k < 7; k++) { const px = x + (i - 3) * R * 0.09 + (k % 2) * R * 0.045, py = y + (k - 3) * R * 0.09; c.fillStyle = (i + k) % 3 ? '#b81820' : '#e83a3a'; circle(c, px, py, R * 0.038); }
        c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, x - R * 0.1, y - R * 0.14, R * 0.12, R * 0.06, -0.5); c.fill();
        c.restore();
        ell(c, x, y, R * 0.32, R * 0.36, s * 0.3); c.strokeStyle = '#020402'; c.lineWidth = lw27(R, 0.05); c.stroke();
      }
      // the sucking mouth: a tube with a pad at the end, feeling around
      const sw = Math.sin(t * 2.5) * R * 0.08, open = st.hurt > 0 || st.mouthOpen;
      c.strokeStyle = '#020402'; c.lineWidth = lw27(R, 0.17); c.beginPath(); c.moveTo(0, R * 0.22); c.quadraticCurveTo(sw, R * 0.45, sw * 0.6, R * 0.68); c.stroke();
      c.strokeStyle = '#4a3a2a'; c.lineWidth = lw27(R, 0.1); c.stroke();
      ell(c, sw * 0.6, R * 0.72, R * (open ? 0.16 : 0.12), R * 0.07); c.fillStyle = '#7a5a3a'; c.fill(); c.strokeStyle = '#020402'; c.lineWidth = lw27(R, 0.03); c.stroke();
      for (const s of [-1, 1]) { c.strokeStyle = '#020402'; c.lineWidth = lw27(R, 0.045); c.beginPath(); c.moveTo(s * R * 0.1, R * 0.26); c.quadraticCurveTo(s * R * 0.24, R * 0.36, s * R * 0.16, R * 0.46); c.stroke(); }
    }
    // a bottle cap crown, crooked
    c.save(); c.translate(R * 0.05, -R * 0.78); c.rotate(-0.2);
    c.fillStyle = '#c8a040'; c.beginPath();
    for (let i = 0; i <= 12; i++) { const u = i / 12, x = (u - 0.5) * R * 0.62; c.lineTo(x, i % 2 ? -R * 0.12 : -R * 0.22); }
    c.lineTo(R * 0.31, R * 0.04); c.lineTo(-R * 0.31, R * 0.04); c.closePath(); c.fill(); c.strokeStyle = '#3a2a08'; c.lineWidth = lw27(R, 0.035); c.stroke();
    c.fillStyle = '#8a1a10'; c.fillRect(-R * 0.24, -R * 0.08, R * 0.48, R * 0.07);
    c.restore();
  }

  /* Krullenbol: Gebit. Curls of molars, a grin with too many teeth */
  function tooth122(c, x, y, s, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = '#efe6d0'; c.strokeStyle = '#3a2a20'; c.lineWidth = Math.max(0.4, s * 0.12);
    c.beginPath(); c.moveTo(-s * 0.7, -s * 0.6); c.quadraticCurveTo(-s * 0.78, s * 0.3, -s * 0.45, s * 0.5); c.lineTo(-s * 0.3, s * 1.05); c.lineTo(-s * 0.1, s * 0.48);
    c.lineTo(s * 0.1, s * 0.48); c.lineTo(s * 0.3, s * 1.05); c.lineTo(s * 0.45, s * 0.5); c.quadraticCurveTo(s * 0.78, s * 0.3, s * 0.7, -s * 0.6); c.quadraticCurveTo(0, -s * 0.9, -s * 0.7, -s * 0.6); c.closePath();
    c.fill(); c.stroke();
    c.fillStyle = 'rgba(160,110,60,0.5)'; c.fillRect(-s * 0.35, s * 0.6, s * 0.15, s * 0.3);
    c.fillStyle = 'rgba(255,255,255,0.65)'; ell(c, -s * 0.3, -s * 0.35, s * 0.16, s * 0.1); c.fill();
    c.restore();
  }
  function drawTeeth122(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#ffd0c8', '#e07a84', '#5a1420'], vein: 'rgba(120,20,30,0.3)', hl: 'rgba(255,255,255,0.4)', out: '#3a0810' });
    drawKrulGlasses(c, R);
    if (st.face !== false) {
      for (const s of [-1, 1]) { c.fillStyle = '#120406'; circle(c, s * R * 0.3, -R * 0.22, R * 0.06); c.fillStyle = '#ffffff'; circle(c, s * R * 0.3 - R * 0.02, -R * 0.24, R * 0.02); }
      const open = st.hurt > 0 || st.mouthOpen ? 1 : 0.6 + Math.sin(t * 2.5) * 0.08, ctl = 0.16 + 0.9 * open;
      const mouth = () => { c.beginPath(); c.moveTo(-R * 0.66, R * 0.12); c.quadraticCurveTo(0, R * ctl, R * 0.66, R * 0.12); c.quadraticCurveTo(0, -R * 0.04, -R * 0.66, R * 0.12); c.closePath(); };
      mouth(); c.fillStyle = '#2a0408'; c.fill();
      c.save(); mouth(); c.clip();
      c.fillStyle = '#e86a7a'; c.fillRect(-R * 0.7, -R * 0.06, R * 1.4, R * 0.16);
      for (let i = 0; i < 11; i++) { const x = -R * 0.6 + i * R * 0.11; c.fillStyle = '#f4ecd8'; c.fillRect(x, R * 0.08, R * 0.09, R * 0.13); c.strokeStyle = 'rgba(60,30,20,0.5)'; c.lineWidth = lw27(R, 0.012); c.strokeRect(x, R * 0.08, R * 0.09, R * 0.13); }
      for (let i = 0; i < 11; i++) { const u = (i - 5) / 5.5, x = u * R * 0.6, yb = R * (0.12 + (ctl - 0.12) * 0.5 * (1 - u * u)); c.fillStyle = '#e86a7a'; c.fillRect(x - R * 0.05, yb - R * 0.04, R * 0.11, R * 0.08); c.fillStyle = '#f4ecd8'; c.fillRect(x - R * 0.045, yb - R * 0.15, R * 0.09, R * 0.12); }
      c.restore();
      mouth(); c.strokeStyle = '#3a0810'; c.lineWidth = lw27(R, 0.05); c.stroke();
    }
    const curls = [[-0.62, -0.98, 0.27], [-0.24, -1.06, 0.28], [0.14, -1.04, 0.28], [0.5, -0.94, 0.27], [-0.88, -0.74, 0.25], [-0.46, -0.8, 0.26], [-0.05, -0.84, 0.27], [0.34, -0.8, 0.26], [0.78, -0.72, 0.25], [-1.02, -0.44, 0.2], [1.0, -0.44, 0.2]];
    c.fillStyle = '#c84a5a'; for (const [x, y, r] of curls) circle(c, x * R * 0.92, y * R * 0.92 + R * 0.04, r * R * 0.7);
    curls.forEach(([x, y, r], i) => tooth122(c, x * R, y * R, r * R * 0.62, Math.atan2(y, x) - Math.PI / 2 + Math.PI + Math.sin(t * 1.5 + i) * 0.05));
  }

  /* Mikappols: Lappendeken. Stitched from what was left, one button eye, two bolts */
  function stitch122(c, R, pts) {
    c.strokeStyle = '#1a1008'; c.lineWidth = lw27(R, 0.035);
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.stroke();
    c.strokeStyle = '#e8dcc0'; c.lineWidth = lw27(R, 0.025);
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 0.14)), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; c.beginPath(); c.moveTo((x - nx * 0.06) * R, (y - ny * 0.06) * R); c.lineTo((x + nx * 0.06) * R, (y + ny * 0.06) * R); c.stroke(); }
    }
  }
  function drawPatch122(c, R, st) {
    const t = st.t || 0;
    mikaBody27(c, R, st, '#2a5af0', '#0a1a40', (c, R) => {
      const poly = (pts, col) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.closePath(); c.fillStyle = col; c.fill(); };
      poly([[-1.4, -1.4], [0.42, -1.4], [0.42, -1.1], [0.18, -0.35], [-1.4, -0.16]], '#e8bea0');
      poly([[-1.4, 0.5], [-0.1, 0.22], [-0.3, 1.4], [-1.4, 1.4]], '#6a8a7a');
      c.fillStyle = '#b83a4a'; rrect(c, R * 0.42, R * 0.32, R * 0.52, R * 0.44, R * 0.04); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.15)'; ell(c, R * 0.5, -R * 0.55, R * 0.3, R * 0.16, -0.4); c.fill();
      c.fillStyle = 'rgba(120,20,30,0.35)'; for (const [x, y] of [[-0.6, -0.5], [-0.3, -0.7], [-0.75, 0.9]]) circle(c, x * R, y * R, R * 0.07);
      stitch122(c, R, [[0.42, -1.2], [0.42, -1.1], [0.18, -0.35], [-1.2, -0.17]]);
      stitch122(c, R, [[-1.2, 0.48], [-0.1, 0.22], [-0.28, 1.2]]);
      stitch122(c, R, [[0.42, 0.32], [0.94, 0.32], [0.94, 0.76], [0.42, 0.76], [0.42, 0.32]]);
    });
    mikaFace27(c, R, st, '#ffffff');
    if (st.face !== false) {
      // a button sewn over the left eye
      c.fillStyle = '#d8b860'; circle(c, -R * 0.34, R * 0.04, R * 0.16); c.strokeStyle = '#3a2a08'; c.lineWidth = lw27(R, 0.035); c.stroke();
      c.fillStyle = '#3a2a08'; for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) circle(c, -R * 0.34 + x * R * 0.05, R * 0.04 + y * R * 0.05, R * 0.022);
      c.strokeStyle = '#c8102e'; c.lineWidth = lw27(R, 0.02); c.beginPath(); c.moveTo(-R * 0.39, -R * 0.01); c.lineTo(-R * 0.29, R * 0.09); c.moveTo(-R * 0.29, -R * 0.01); c.lineTo(-R * 0.39, R * 0.09); c.stroke();
    }
    // a bolt in each side, and a spark between them now and then
    for (const s of [-1, 1]) { c.fillStyle = '#5a6068'; rrect(c, s > 0 ? R * 1.0 : -R * 1.28, R * 0.08, R * 0.28, R * 0.18, R * 0.04); c.fill(); c.strokeStyle = '#1a1e24'; c.lineWidth = lw27(R, 0.03); c.stroke(); c.fillStyle = '#c8ccd4'; c.fillRect(s > 0 ? R * 1.08 : -R * 1.2, R * 0.11, R * 0.12, R * 0.04); }
    if (Math.sin(t * 7) > 0.85) { c.strokeStyle = '#bfe8ff'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.moveTo(R * 1.28, R * 0.12); c.lineTo(R * 1.42, -R * 0.05); c.lineTo(R * 1.36, R * 0.0); c.lineTo(R * 1.5, -R * 0.2); c.stroke(); }
  }

  /* Peanapple: Ogenvacht. Eyes in the fur, all open, none of them his */
  function drawEyes122(c, R, st) {
    const t = st.t || 0;
    drawPean(c, R, st);
    c.save(); c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(70,10,24,0.28)'; c.fillRect(-R * 2.5, -R * 2.5, R * 5, R * 5);
    const E = [[-0.74, -0.52, 0.12], [0.66, -0.6, 0.11], [-0.9, 0.18, 0.09], [0.9, 0.14, 0.12], [-0.5, 0.66, 0.1], [0.46, 0.7, 0.09], [0.02, -0.88, 0.1], [-0.2, 0.86, 0.07], [0.8, 0.52, 0.07], [-0.66, -0.06, 0.06], [-0.3, -0.72, 0.06], [0.34, -0.8, 0.07]];
    E.forEach(([x, y, r], i) => {
      const blink = Math.sin(t * 1.3 + i * 2.1) > 0.93 ? 0.12 : 1;
      ell(c, x * R, y * R, r * R * 1.15, r * R * blink); c.fillStyle = '#f6efe0'; c.fill(); c.strokeStyle = '#3a0a10'; c.lineWidth = lw27(R, 0.025); c.stroke();
      if (blink > 0.5) {
        const lx = clamp((st.lookX || 0) + Math.sin(t * 0.9 + i) * 0.5, -1, 1);
        c.fillStyle = i % 3 ? '#7a1a20' : '#2a6a2a'; circle(c, x * R + lx * r * R * 0.4, y * R, r * R * 0.55);
        c.fillStyle = '#0a0204'; circle(c, x * R + lx * r * R * 0.4, y * R, r * R * 0.26);
      }
      c.strokeStyle = 'rgba(200,40,50,0.55)'; c.lineWidth = lw27(R, 0.015); c.beginPath(); c.moveTo((x - r) * R, y * R); c.lineTo((x - r * 1.7) * R, (y + r * 0.5) * R); c.stroke();
    });
    c.restore();
  }

  /* Apploa Vogels: Botvleugels. Bare bones for wings, ribs out front */
  function boneWings122(c, R, flap) {
    for (const side of [-1, 1]) {
      c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.12 - flap);
      const L = R * 1.85;
      c.lineCap = 'round';
      c.strokeStyle = '#2a2420'; c.lineWidth = Math.max(1, R * 0.16); c.beginPath(); c.moveTo(0, -R * 0.1); c.lineTo(L * 0.45, -R * 0.45); c.lineTo(L, -R * 0.2); c.stroke();
      c.strokeStyle = '#efe6d2'; c.lineWidth = Math.max(0.6, R * 0.09); c.stroke();
      for (let k = 0; k < 4; k++) {
        const bx = L * (0.48 + k * 0.17), by = -R * (0.42 - k * 0.07), ex = bx + R * 0.12, ey = by + R * (0.58 + k * 0.05);
        c.strokeStyle = '#2a2420'; c.lineWidth = Math.max(0.8, R * 0.09); c.beginPath(); c.moveTo(bx, by); c.lineTo(ex, ey); c.stroke();
        c.strokeStyle = '#e4dac4'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
        if (k % 2 === 0) { c.fillStyle = '#16121a'; c.beginPath(); c.moveTo(ex - R * 0.05, ey - R * 0.2); c.quadraticCurveTo(ex + R * 0.14, ey + R * 0.1, ex - R * 0.02, ey + R * 0.38); c.quadraticCurveTo(ex - R * 0.15, ey + R * 0.05, ex - R * 0.05, ey - R * 0.2); c.fill(); }
      }
      c.fillStyle = '#efe6d2'; c.strokeStyle = '#2a2420'; c.lineWidth = Math.max(0.5, R * 0.04);
      for (const [x, y] of [[L * 0.45, -R * 0.45], [L, -R * 0.2]]) { circle(c, x, y, R * 0.09); c.stroke(); }
      c.restore();
    }
  }
  function drawBones122(c, R, st) {
    apploa27(c, R, st, { hair: '#16121a', hair2: '#000000', iris: '#d8d4c8', wings: boneWings122,
      inside(c, R) {
        ell(c, 0, R * 0.5, R * 0.56, R * 0.42); c.fillStyle = '#1a0806'; c.fill();
        c.strokeStyle = '#efe6d2'; c.lineWidth = lw27(R, 0.07);
        for (let i = 0; i < 4; i++) { const y = R * (0.22 + i * 0.16), w = R * (0.5 - i * 0.05); c.beginPath(); c.moveTo(-w, y + R * 0.08); c.quadraticCurveTo(0, y - R * 0.12, w, y + R * 0.08); c.stroke(); }
        c.lineWidth = lw27(R, 0.09); c.beginPath(); c.moveTo(0, R * 0.12); c.lineTo(0, R * 0.8); c.stroke();
      },
      top(c, R, t) {
        // a crack across the forehead, still wet
        c.strokeStyle = '#120806'; c.lineWidth = lw27(R, 0.05);
        c.beginPath(); c.moveTo(-R * 0.62, -R * 0.42); c.lineTo(-R * 0.4, -R * 0.32); c.lineTo(-R * 0.3, -R * 0.4); c.lineTo(-R * 0.12, -R * 0.28); c.stroke();
        c.fillStyle = '#7a0a12'; c.beginPath(); c.moveTo(-R * 0.31, -R * 0.38); c.quadraticCurveTo(-R * 0.33, -R * 0.22, -R * 0.3, -R * 0.14); c.quadraticCurveTo(-R * 0.26, -R * 0.24, -R * 0.28, -R * 0.38); c.fill();
      } });
  }

  /* Lucifappel: Smeltkop. Struck one time too many */
  /* Lucky: Jackpot (a slot machine with a stem) and Snake Eyes */
  function seven122(c, x, y, R) {
    c.save(); c.translate(x, y);
    c.fillStyle = '#c4121e'; c.strokeStyle = '#3a0408'; c.lineWidth = lw27(R, 0.025);
    c.beginPath(); c.moveTo(-R * 0.12, -R * 0.13); c.lineTo(R * 0.13, -R * 0.13); c.lineTo(R * 0.13, -R * 0.08); c.lineTo(-R * 0.02, R * 0.15); c.lineTo(-R * 0.09, R * 0.15); c.lineTo(R * 0.04, -R * 0.07); c.lineTo(-R * 0.12, -R * 0.07); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  function drawJackpot122(c, R, st) {
    const t = st.t || 0, pull = Math.max(0, Math.sin(t * 1.5)) * 0.5;
    // the lever on his right side
    c.strokeStyle = '#3a2004'; c.lineWidth = lw27(R, 0.14); c.beginPath(); c.moveTo(R * 0.92, R * 0.1); c.lineTo(R * 1.28, -R * (0.75 - pull)); c.stroke();
    c.strokeStyle = '#d8d8e0'; c.lineWidth = lw27(R, 0.07); c.stroke();
    c.fillStyle = '#d5232f'; circle(c, R * 1.28, -R * (0.75 - pull), R * 0.15); c.strokeStyle = '#3a0408'; c.lineWidth = lw27(R, 0.035); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, R * 1.24, -R * (0.79 - pull), R * 0.05);
    skinBody24(c, R, st, { g: ['#fff4b0', '#e8b030', '#6a4008'], vein: 'rgba(255,255,220,0.18)', hl: 'rgba(255,255,255,0.6)', out: '#3a2004',
      inside(c, R) {
        c.fillStyle = '#c4121e'; c.fillRect(-R * 1.3, R * 0.5, R * 2.6, R * 0.12);
        c.fillStyle = '#1a0a04'; rrect(c, -R * 0.82, -R * 0.38, R * 1.64, R * 0.54, R * 0.08); c.fill();
        for (let i = 0; i < 3; i++) {
          const x = -R * 0.52 + i * R * 0.52, spin = i === 2 ? (t * 7) % 1 : i === 1 && st.hurt > 0 ? (t * 9) % 1 : 0;
          c.save(); rrect(c, x - R * 0.22, -R * 0.33, R * 0.44, R * 0.44, R * 0.05); c.fillStyle = '#fbf6e8'; c.fill(); c.clip();
          for (const dy of [-1, 0, 1]) seven122(c, x, -R * 0.11 + (dy + spin) * R * 0.44, R * 1.6);
          c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x - R * 0.22, -R * 0.33, R * 0.44, R * 0.08); c.fillRect(x - R * 0.22, R * 0.03, R * 0.44, R * 0.08);
          c.restore();
        }
      } });
    if (st.face !== false) {
      // the coin tray is the mouth
      c.fillStyle = '#1a0a04'; rrect(c, -R * 0.36, R * 0.24, R * 0.72, R * 0.2, R * 0.05); c.fill();
      c.fillStyle = '#ffd84a'; c.strokeStyle = '#6a4008'; c.lineWidth = lw27(R, 0.025);
      for (const [x, y] of [[-0.2, 0.36], [0.02, 0.38], [0.22, 0.35]]) { ell(c, x * R, y * R, R * 0.08, R * 0.04); c.fill(); c.stroke(); }
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU, x = Math.cos(a) * R * 0.86, y = Math.sin(a) * R * 0.8 + R * 0.05, on = (i + Math.floor(t * 8)) % 3 === 0;
      c.fillStyle = on ? '#fff6c0' : '#8a6a20'; circle(c, x, y, R * 0.045);
      if (on) glowDot(c, x, y, R * 0.16, '#ffd84a', 0.5);
    }
    drawStem(c, R, st.leaf || 0, 0);
  }
  function drawSnakeEyes122(c, R, st) {
    const t = st.t || 0;
    for (const [x, a, suit] of [[-0.34, -0.38, 0], [0.04, 0.05, 1], [0.4, 0.42, 2]]) {
      c.save(); c.translate(x * R, -R * 0.6); c.rotate(a);
      rrect(c, -R * 0.18, -R * 0.62, R * 0.36, R * 0.56, R * 0.04); c.fillStyle = '#fbf6ea'; c.fill(); c.strokeStyle = '#1a0a10'; c.lineWidth = lw27(R, 0.03); c.stroke();
      c.fillStyle = suit === 1 ? '#1a0a10' : '#c4121e';
      if (suit === 1) { c.beginPath(); c.moveTo(0, -R * 0.48); c.quadraticCurveTo(R * 0.14, -R * 0.36, 0, -R * 0.3); c.quadraticCurveTo(-R * 0.14, -R * 0.36, 0, -R * 0.48); c.fill(); c.fillRect(-R * 0.015, -R * 0.33, R * 0.03, R * 0.08); }
      else { circle(c, -R * 0.05, -R * 0.42, R * 0.055); circle(c, R * 0.05, -R * 0.42, R * 0.055); c.beginPath(); c.moveTo(-R * 0.1, -R * 0.4); c.lineTo(R * 0.1, -R * 0.4); c.lineTo(0, -R * 0.28); c.closePath(); c.fill(); }
      c.restore();
    }
    skinBody24(c, R, st, { g: ['#9a6ab0', '#4a1e5a', '#12040e'], vein: 'rgba(200,120,200,0.14)', hl: 'rgba(255,220,255,0.28)', out: '#0a0208',
      inside(c, R) {
        c.fillStyle = 'rgba(160,180,40,0.3)'; for (const [x, y, r] of [[-0.55, 0.35, 0.28], [0.3, -0.5, 0.2], [-0.2, 0.8, 0.18]]) circle(c, x * R, y * R, r * R);
        c.save(); c.translate(R * 0.6, R * 0.42); c.rotate(t * 0.2);
        c.fillStyle = '#c4121e'; circle(c, 0, 0, R * 0.26); c.fillStyle = '#fbf6ea'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; c.save(); c.rotate(a); c.fillRect(-R * 0.04, -R * 0.26, R * 0.08, R * 0.08); c.restore(); }
        c.fillStyle = '#8a0a14'; circle(c, 0, 0, R * 0.16); c.strokeStyle = '#fbf6ea'; c.lineWidth = lw27(R, 0.02); c.beginPath(); c.arc(0, 0, R * 0.12, 0, TAU); c.stroke();
        c.restore();
      } });
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        ell(c, s * R * 0.3, -R * 0.06, R * 0.22, R * 0.21); c.fillStyle = '#1a0406'; c.fill();
        luckyDie12(c, s * R * 0.3, -R * 0.06, R * 0.14, 1, s * 0.2 + Math.sin(t * 2 + s) * 0.08);
        const len = R * (0.26 + 0.05 * Math.sin(t * 1.5 + s * 2));
        c.fillStyle = '#8a0a14'; rrect(c, s * R * 0.3 - R * 0.03 + s * R * 0.06, R * 0.1, R * 0.06, len, R * 0.03); c.fill(); circle(c, s * R * 0.36, R * 0.1 + len, R * 0.045);
      }
      // the mouth is sewn shut
      c.strokeStyle = '#1a0406'; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.32, R * 0.44); c.quadraticCurveTo(0, R * 0.5, R * 0.32, R * 0.42); c.stroke();
      c.strokeStyle = '#e8dcc0'; c.lineWidth = lw27(R, 0.025);
      for (let i = 0; i < 5; i++) { const x = -R * 0.24 + i * R * 0.12, y = R * 0.46; c.beginPath(); c.moveTo(x - R * 0.04, y - R * 0.06); c.lineTo(x + R * 0.04, y + R * 0.06); c.moveTo(x + R * 0.04, y - R * 0.06); c.lineTo(x - R * 0.04, y + R * 0.06); c.stroke(); }
    }
  }

  const NEW122 = {
    apple: { name: 'Binnenstebuiten', tier: 'Grotesque', line: 'Turned inside out. The core is a mouth now and the seeds are teeth. Four eyes, none of them agree.', draw: drawInside122, bg: ['#3a0a10', '#0e0204'], motif: 'embers', acc: '#e8303a' },
    appel: { name: 'Madennest', tier: 'Grotesque', line: 'Something moved in and brought family. Holes everywhere, all of them occupied. The mullet survived.', draw: drawMaggot122, bg: ['#2a2410', '#0a0804'], motif: 'spores', acc: '#d8c870' },
    rot: { name: 'Vliegenkoning', tier: 'Grotesque', line: 'The flies made him king. Compound eyes, a mouth that sucks, a bottle cap for a crown. Long live whatever this is.', draw: drawFly122, bg: ['#142010', '#040604'], motif: 'spores', acc: '#8aff5a' },
    krul: { name: 'Gebit', tier: 'Grotesque', line: 'The curls are molars now, roots and all. The grin has more teeth than a mouth should. Still laughing.', draw: drawTeeth122, bg: ['#3a1018', '#100406'], motif: 'crumbs', acc: '#ff8a9a' },
    mika: { name: 'Lappendeken', tier: 'Grotesque', line: 'Stitched together from whatever was left. One button eye, two bolts, same face. It holds. Mostly.', draw: drawPatch122, bg: ['#141a2a', '#04060c'], motif: 'spark', acc: '#7aa0ff' },
    pean: { name: 'Ogenvacht', tier: 'Grotesque', line: 'Eyes all over the fur, all of them open, none of them his. Still scared. Now it can see why.', draw: drawEyes122, bg: ['#2a0810', '#0a0204'], motif: 'embers', acc: '#ff4a5a' },
    apploa: { name: 'Botvleugels', tier: 'Grotesque', line: 'Bare bones for wings, a few black feathers hanging on, ribs out front. She still flies. Nobody knows how.', draw: drawBones122, bg: ['#1a1a24', '#060608'], motif: 'stars', acc: '#c8d0e0', wings: boneWings122 },
    lucif: { name: 'Smeltkop', tier: 'Grotesque', line: 'Struck one time too many. The box went to wax and the wax keeps running. The match is still lit. Nobody told him.', draw: (function () { return S62.drawMelt134.apply(this, arguments); }), bg: ['#2a0604', '#080100'], motif: 'hellbox', acc: '#ff5a1a' },
  };
  for (const id in NEW122) (SKINS[id] || (SKINS[id] = [])).push(NEW122[id]);
  SKINS.lucky = [
    { name: 'Jackpot', tier: 'Epic', line: 'A slot machine with a stem. Three sevens for eyes, the third one never stops. The house always wins. He is the house.', draw: drawJackpot122, bg: ['#3a2004', '#0e0802'], motif: 'fair', acc: '#ffd84a' },
    { name: 'Snake Eyes', tier: 'Grotesque', line: 'Two dice for eyes, both on one. Mouth sewn shut, cards in the skull, a chip in the cheek. Bad night.', draw: drawSnakeEyes122, bg: ['#1a0624', '#060208'], motif: 'lasers', acc: '#b06aff' },
  ];

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
