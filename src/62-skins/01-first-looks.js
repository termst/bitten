/* 62.js section 01: first-looks. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { rnd24, skinBody24 } = S62;
  S62.drawGranny24 = drawGranny24; S62.drawStreamer24 = drawStreamer24; S62.drawMould24 = drawMould24; S62.drawZomer24 = drawZomer24; S62.drawMikaDelft24 = drawMikaDelft24; S62.drawPeanTri24 = drawPeanTri24; S62.drawApploaOranje24 = drawApploaOranje24; S62.drawGullWingsOranje24 = drawGullWingsOranje24;
  /* ------------------------------------------------------------------ The Apple: Granny Smith */
  function drawGranny24(c, R, st) {
    const t = st.t || 0;
    // the bun sits behind the top of the apple
    c.save(); c.translate(0, -R * 1.04);
    const bg = c.createRadialGradient(-R * 0.1, -R * 0.12, R * 0.04, 0, 0, R * 0.42);
    bg.addColorStop(0, '#f4f2ee'); bg.addColorStop(1, '#9c978e');
    c.fillStyle = bg; circle(c, 0, 0, R * 0.38); c.strokeStyle = '#4a4640'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
    c.strokeStyle = 'rgba(90,86,80,0.6)'; c.lineWidth = Math.max(0.5, R * 0.035);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, R * (0.12 + i * 0.08), 0.4 + i, 3.6 + i); c.stroke(); }
    // two knitting needles through the bun, and a bit of pink yarn
    for (const [a, col] of [[-0.55, '#c9a24a'], [0.6, '#b88a3a']]) {
      c.save(); c.rotate(a);
      c.strokeStyle = '#3a2a10'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.5); c.lineTo(0, -R * 0.62); c.stroke();
      c.strokeStyle = col; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(0, R * 0.5); c.lineTo(0, -R * 0.62); c.stroke();
      c.fillStyle = col; circle(c, 0, -R * 0.66, R * 0.08); c.strokeStyle = '#3a2a10'; c.lineWidth = Math.max(0.5, R * 0.03); c.stroke();
      c.restore();
    }
    c.strokeStyle = '#ff8ab0'; c.lineWidth = Math.max(0.6, R * 0.05);
    c.beginPath(); c.moveTo(R * 0.3, R * 0.1); c.bezierCurveTo(R * 0.6, R * 0.2, R * 0.5, R * 0.5, R * 0.75, R * 0.55 + Math.sin(t * 2) * R * 0.04); c.stroke();
    c.restore();
    skinBody24(c, R, st, { g: ['#e8f8a8', '#8cc63f', '#2f5a12'], vein: 'rgba(240,255,200,0.18)', hl: 'rgba(255,255,255,0.45)', out: '#1d3a0a',
      inside(c, R) {
        // grey hair combed back over the crown
        c.fillStyle = '#c9c6bf'; c.beginPath(); c.ellipse(0, -R * 0.92, R * 0.95, R * 0.42, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(110,104,96,0.6)'; c.lineWidth = R * 0.035;
        for (const x of [-0.6, -0.3, 0, 0.3, 0.6]) { c.beginPath(); c.moveTo(x * R, -R * 0.52); c.quadraticCurveTo(x * R * 0.6, -R * 0.8, 0, -R * 1.1); c.stroke(); }
      } });
    if (st.face !== false) {
      drawAppleFace(c, R, st);
      c.fillStyle = 'rgba(255,120,150,0.35)'; for (const s of [-1, 1]) { ell(c, s * R * 0.58, R * 0.2, R * 0.13, R * 0.08); c.fill(); }
      // half moon reading glasses, low on the face, on a chain
      c.strokeStyle = '#b8902e'; c.lineWidth = Math.max(0.6, R * 0.045);
      for (const s of [-1, 1]) {
        c.fillStyle = 'rgba(220,240,255,0.25)';
        c.beginPath(); c.moveTo(s * R * 0.53, R * 0.02); c.lineTo(s * R * 0.13, R * 0.02); c.arc(s * R * 0.33, R * 0.02, R * 0.2, Math.PI, 0, true); c.closePath(); c.fill(); c.stroke();
      }
      c.beginPath(); c.moveTo(-R * 0.13, R * 0.02); c.quadraticCurveTo(0, -R * 0.04, R * 0.13, R * 0.02); c.stroke();
      c.strokeStyle = 'rgba(200,160,60,0.7)'; c.lineWidth = Math.max(0.4, R * 0.025); c.setLineDash([R * 0.05, R * 0.04]);
      c.beginPath(); c.moveTo(-R * 0.53, R * 0.02); c.quadraticCurveTo(-R * 0.9, R * 0.5, -R * 0.6, R * 0.68); c.moveTo(R * 0.53, R * 0.02); c.quadraticCurveTo(R * 0.9, R * 0.5, R * 0.6, R * 0.68); c.stroke();
      c.setLineDash([]);
    }
    // a string of pearls
    for (let i = 0; i <= 10; i++) {
      const u = i / 10, x = (u - 0.5) * R * 1.3, y = R * 0.66 + Math.sin(u * Math.PI) * R * 0.14;
      const pg = c.createRadialGradient(x - R * 0.02, y - R * 0.03, 0, x, y, R * 0.075);
      pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#cfc6d8');
      c.fillStyle = pg; circle(c, x, y, R * 0.068); c.strokeStyle = 'rgba(80,70,90,0.5)'; c.lineWidth = Math.max(0.3, R * 0.02); c.stroke();
    }
  }

  /* ------------------------------------------------------------------ Appelgameplay: Streamer Setup */
  function drawStreamer24(c, R, st) {
    const t = st.t || 0, hue = (t * 90) % 360, a = `hsl(${hue},100%,62%)`, b = `hsl(${(hue + 140) % 360},100%,62%)`;
    skinBody24(c, R, st, { g: ['#ff86a8', '#d0144a', '#4a0420'], vein: 'rgba(255,170,200,0.15)', hl: 'rgba(255,255,255,0.45)', out: '#2b0612' });
    drawMulletStream24(c, R);
    if (st.face !== false) drawAppelFace(c, R, st);
    drawAppelStem(c, R, st.leaf || 0, st.twin);
    // headset band over the mullet
    c.strokeStyle = '#0e0e14'; c.lineWidth = R * 0.2; c.beginPath(); c.ellipse(0, -R * 0.12, R * 1.12, R * 1.1, 0, Math.PI * 1.06, Math.PI * 1.94); c.stroke();
    c.strokeStyle = '#2e2e3a'; c.lineWidth = R * 0.07; c.beginPath(); c.ellipse(0, -R * 0.12, R * 1.12, R * 1.1, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    for (const s of [-1, 1]) {
      const x = s * R * 1.12;
      rrect(c, x - R * 0.22, -R * 0.46, R * 0.44, R * 0.66, R * 0.16); c.fillStyle = '#1a1a22'; c.fill(); c.strokeStyle = '#06060a'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
      c.strokeStyle = s < 0 ? a : b; c.lineWidth = R * 0.07; c.shadowColor = s < 0 ? a : b; c.shadowBlur = R * 0.4;
      rrect(c, x - R * 0.14, -R * 0.37, R * 0.28, R * 0.48, R * 0.1); c.stroke();
      c.shadowBlur = 0;
    }
    // mic boom to the grin, with a live light
    c.strokeStyle = '#0e0e14'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 1.1, R * 0.12); c.quadraticCurveTo(-R * 1.0, R * 0.62, -R * 0.42, R * 0.6); c.stroke();
    c.fillStyle = '#26262e'; ell(c, -R * 0.36, R * 0.6, R * 0.12, R * 0.09); c.fill(); c.strokeStyle = '#06060a'; c.lineWidth = Math.max(0.5, R * 0.03); c.stroke();
    if (Math.sin(t * 4) > -0.2) { c.fillStyle = '#ff2a3a'; c.shadowColor = '#ff2a3a'; c.shadowBlur = R * 0.3; circle(c, -R * 1.12, R * 0.12, R * 0.06); c.shadowBlur = 0; }
  }

  /* ------------------------------------------------------------------ The Rotten Apple: Schimmelkoning */
  function drawMould24(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#bcc292', '#6a6a34', '#22220e'], vein: 'rgba(220,230,180,0.12)', hl: 'rgba(240,255,230,0.25)', out: '#161406', cyan: false,
      inside(c, R) {
        c.fillStyle = 'rgba(50,30,10,0.55)';
        for (const [x, y, r] of [[0.05, 0.3, 0.1], [-0.35, -0.5, 0.07], [0.62, 0.15, 0.08], [-0.65, 0.05, 0.06]]) circle(c, x * R, y * R, r * R);
        // blue white mould, in fuzzy colonies
        for (const [cx, cy, cr] of [[-0.5, 0.42, 0.3], [0.48, -0.36, 0.24], [0.42, 0.62, 0.22], [-0.72, -0.3, 0.16], [0.0, 0.82, 0.16]]) {
          const g = c.createRadialGradient(cx * R, cy * R, 0, cx * R, cy * R, cr * R);
          g.addColorStop(0, 'rgba(220,236,240,0.85)'); g.addColorStop(0.6, 'rgba(160,200,210,0.5)'); g.addColorStop(1, 'rgba(160,200,210,0)');
          c.fillStyle = g; circle(c, cx * R, cy * R, cr * R);
          c.fillStyle = 'rgba(245,250,255,0.85)';
          for (let i = 0; i < 12; i++) { const a = rnd24(cx * 31 + i) * TAU, d = rnd24(cy * 17 + i) * cr * R; circle(c, cx * R + Math.cos(a) * d, cy * R + Math.sin(a) * d, R * 0.022); }
          c.fillStyle = 'rgba(70,110,140,0.6)'; circle(c, cx * R, cy * R, R * 0.035);
        }
      } });
    if (st.face !== false) drawRotFace(c, R, st);
    // a crown of fly agarics
    for (const [x, y, s] of [[-0.42, -0.74, 0.8], [0.02, -0.92, 1.05], [0.42, -0.76, 0.82]]) {
      c.save(); c.translate(x * R, y * R); c.scale(s, s); c.rotate(x * 0.4);
      c.fillStyle = '#efe6cc'; rrect(c, -R * 0.07, -R * 0.06, R * 0.14, R * 0.28, R * 0.04); c.fill(); c.strokeStyle = '#3a2a10'; c.lineWidth = Math.max(0.5, R * 0.04); c.stroke();
      c.beginPath(); c.ellipse(0, -R * 0.06, R * 0.26, R * 0.2, 0, Math.PI, TAU); c.closePath();
      const cg = c.createLinearGradient(0, -R * 0.26, 0, 0); cg.addColorStop(0, '#e83a3a'); cg.addColorStop(1, '#9a1418');
      c.fillStyle = cg; c.fill(); c.strokeStyle = '#3a0808'; c.lineWidth = Math.max(0.6, R * 0.05); c.stroke();
      c.fillStyle = '#fff6e6'; for (const [dx, dy, r] of [[-0.12, -0.12, 0.04], [0.04, -0.2, 0.035], [0.14, -0.1, 0.03], [-0.02, -0.08, 0.025]]) circle(c, dx * R, dy * R, r * R);
      c.restore();
    }
    drawRotWorm(c, R, t);
    // fruit flies doing laps
    for (let i = 0; i < 3; i++) {
      const a = t * (2.2 + i * 0.7) + i * 2.1, fx = Math.cos(a) * R * (1.25 + i * 0.12), fy = -R * 0.2 + Math.sin(a * 1.6) * R * 0.55;
      c.fillStyle = 'rgba(210,230,255,0.6)'; ell(c, fx - R * 0.05, fy - R * 0.06, R * 0.07, R * 0.035, 0.6); c.fill(); ell(c, fx + R * 0.05, fy - R * 0.06, R * 0.07, R * 0.035, -0.6); c.fill();
      c.fillStyle = '#1a140a'; circle(c, fx, fy, R * 0.055); c.fillStyle = '#c83a2a'; circle(c, fx + R * 0.03, fy - R * 0.01, R * 0.02);
    }
  }

  /* ------------------------------------------------------------------ Krullenbol: Zomerkrul */
  function hawaiian24(c, R) {
    const y0 = R * 0.46;
    const shirt = () => { c.beginPath(); c.moveTo(-R * 1.3, y0); c.lineTo(-R * 0.34, y0); c.quadraticCurveTo(0, R * 0.8, R * 0.34, y0); c.lineTo(R * 1.3, y0); c.lineTo(R * 1.3, R * 1.4); c.lineTo(-R * 1.3, R * 1.4); c.closePath(); };
    shirt(); c.fillStyle = '#0f8a86'; c.fill();
    c.save(); shirt(); c.clip();
    c.fillStyle = '#0a5a4a';
    for (const [x, y, a] of [[-0.75, 0.72, 0.6], [0.6, 0.95, -0.8], [0.1, 1.05, 2.4]]) leafShape(c, x * R, y * R, R * 0.42, a);
    for (const [x, y, s, col] of [[-0.45, 0.62, 0.17, '#ff5a6a'], [0.75, 0.62, 0.15, '#ffcf4a'], [0.25, 0.86, 0.13, '#ff8ad0'], [-0.9, 0.95, 0.14, '#ffcf4a']]) {
      c.fillStyle = col;
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ell(c, x * R + Math.cos(a) * s * R * 0.55, y * R + Math.sin(a) * s * R * 0.55, s * R * 0.48, s * R * 0.3, a); c.fill(); }
      c.fillStyle = '#fff2a0'; circle(c, x * R, y * R, s * R * 0.25);
    }
    c.restore();
    // collar flaps and buttons
    c.fillStyle = '#16a6a0'; c.strokeStyle = 'rgba(0,40,40,0.6)'; c.lineWidth = Math.max(0.5, R * 0.04);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.34, y0); c.lineTo(s * R * 0.62, y0 + R * 0.02); c.lineTo(s * R * 0.12, y0 + R * 0.28); c.closePath(); c.fill(); c.stroke(); }
    c.fillStyle = '#f4ead0'; for (const y of [0.88, 1.08]) circle(c, 0, y * R, R * 0.04);
    c.beginPath(); c.moveTo(-R * 1.3, y0); c.lineTo(-R * 0.34, y0); c.quadraticCurveTo(0, R * 0.8, R * 0.34, y0); c.lineTo(R * 1.3, y0); c.strokeStyle = 'rgba(0,40,40,0.6)'; c.stroke();
  }
  function drawZomer24(c, R, st) {
    skinBody24(c, R, st, { g: ['#ffa070', '#e0482e', '#6e160c'], vein: 'rgba(255,200,150,0.15)', hl: 'rgba(255,255,255,0.42)', out: '#2b070f', inside: hawaiian24 });
    if (st.face !== false) {
      drawKrulFace(c, R, st);
      // neon sunglasses, on the eyes this time
      for (const s of [-1, 1]) {
        rrect(c, s * R * 0.32 - R * 0.21, -R * 0.2, R * 0.42, R * 0.28, R * 0.1);
        const lg = c.createLinearGradient(0, -R * 0.2, 0, R * 0.08); lg.addColorStop(0, '#2a1a3a'); lg.addColorStop(1, '#0a0a12');
        c.fillStyle = lg; c.fill(); c.strokeStyle = '#ff3a9a'; c.lineWidth = Math.max(0.7, R * 0.06); c.stroke();
        c.strokeStyle = 'rgba(255,170,90,0.7)'; c.lineWidth = Math.max(0.5, R * 0.035); c.beginPath(); c.moveTo(s * R * 0.32 - R * 0.12, -R * 0.12); c.lineTo(s * R * 0.32 + R * 0.02, -R * 0.12); c.stroke();
      }
      c.strokeStyle = '#ff3a9a'; c.lineWidth = Math.max(0.7, R * 0.06);
      c.beginPath(); c.moveTo(-R * 0.11, -R * 0.1); c.quadraticCurveTo(0, -R * 0.16, R * 0.11, -R * 0.1); c.moveTo(-R * 0.53, -R * 0.1); c.lineTo(-R * 0.9, -R * 0.16); c.moveTo(R * 0.53, -R * 0.1); c.lineTo(R * 0.9, -R * 0.16); c.stroke();
    }
    drawKrulHairSun24(c, R, st.leaf || 0);
    // a hibiscus behind the ear
    c.save(); c.translate(R * 0.92, -R * 0.42); c.rotate(0.3);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; c.fillStyle = i % 2 ? '#ff4a5a' : '#ff6a78'; ell(c, Math.cos(a) * R * 0.13, Math.sin(a) * R * 0.13, R * 0.15, R * 0.1, a); c.fill(); }
    c.fillStyle = '#ffd24a'; circle(c, 0, 0, R * 0.06); c.strokeStyle = '#ffd24a'; c.lineWidth = Math.max(0.4, R * 0.03); c.beginPath(); c.moveTo(0, 0); c.lineTo(-R * 0.16, -R * 0.12); c.stroke();
    c.restore();
  }

  /* ------------------------------------------------------------------ Mikappols: Delfts Blauw */
  function delftPaint24(c, R, t) {
    const B = '#1d3f9a', L = 'rgba(58,98,192,0.55)';
    // a painted band with scallops under the stem
    c.strokeStyle = B; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R, -R * 0.5); c.lineTo(R, -R * 0.5); c.stroke();
    c.lineWidth = R * 0.03; c.beginPath(); c.moveTo(-R, -R * 0.42); c.lineTo(R, -R * 0.42); c.stroke();
    c.fillStyle = L; for (let i = -5; i <= 5; i++) { c.beginPath(); c.arc(i * R * 0.2, -R * 0.5, R * 0.08, Math.PI, TAU); c.fill(); }
    // a windmill bottom left, sails turning slowly
    c.save(); c.translate(-R * 0.52, R * 0.5);
    c.fillStyle = L; c.beginPath(); c.moveTo(-R * 0.12, R * 0.4); c.lineTo(-R * 0.06, -R * 0.02); c.lineTo(R * 0.06, -R * 0.02); c.lineTo(R * 0.12, R * 0.4); c.closePath(); c.fill();
    c.strokeStyle = B; c.lineWidth = Math.max(0.6, R * 0.03); c.stroke();
    c.fillStyle = B; c.fillRect(-R * 0.03, R * 0.24, R * 0.06, R * 0.16);
    c.save(); c.translate(0, -R * 0.02); c.rotate(t * 0.5);
    for (let i = 0; i < 4; i++) {
      c.rotate(Math.PI / 2);
      c.strokeStyle = B; c.lineWidth = Math.max(0.5, R * 0.025); c.strokeRect(R * 0.03, -R * 0.035, R * 0.24, R * 0.07);
      c.beginPath(); for (let k = 1; k < 4; k++) { c.moveTo(R * (0.03 + k * 0.06), -R * 0.035); c.lineTo(R * (0.03 + k * 0.06), R * 0.035); } c.stroke();
    }
    c.restore();
    c.strokeStyle = B; c.lineWidth = Math.max(0.5, R * 0.03); c.beginPath(); c.moveTo(-R * 0.45, R * 0.4); c.quadraticCurveTo(-R * 0.2, R * 0.33, 0, R * 0.4); c.quadraticCurveTo(R * 0.2, R * 0.47, R * 0.45, R * 0.4); c.stroke();
    c.restore();
    // a tulip bottom right with a curl
    c.save(); c.translate(R * 0.66, R * 0.62);
    c.strokeStyle = B; c.lineWidth = Math.max(0.5, R * 0.03);
    c.beginPath(); c.moveTo(0, R * 0.25); c.quadraticCurveTo(-R * 0.04, R * 0.08, 0, -R * 0.02); c.stroke();
    c.beginPath(); c.moveTo(0, R * 0.16); c.quadraticCurveTo(-R * 0.18, R * 0.12, -R * 0.2, -R * 0.02); c.stroke();
    c.fillStyle = L; c.beginPath(); c.moveTo(-R * 0.1, -R * 0.02); c.quadraticCurveTo(-R * 0.12, -R * 0.2, -R * 0.06, -R * 0.24); c.lineTo(0, -R * 0.14); c.lineTo(R * 0.06, -R * 0.24);
    c.quadraticCurveTo(R * 0.12, -R * 0.2, R * 0.1, -R * 0.02); c.closePath(); c.fill(); c.stroke();
    c.restore();
    // dotted border round the edge
    c.fillStyle = B; for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU; circle(c, Math.cos(a) * R * 0.84, Math.sin(a) * R * 0.8 + R * 0.04, R * 0.022); }
  }

  /* ------------------------------------------------------------------ Peanapple: Driekleur */
  function peanPatches24(c, R) {
    c.fillStyle = '#231d1a'; c.beginPath(); c.ellipse(-R * 0.5, -R * 0.42, R * 0.62, R * 0.5, -0.35, 0, TAU); c.fill();
    c.fillStyle = '#d9822e'; c.beginPath(); c.ellipse(R * 0.58, -R * 0.2, R * 0.56, R * 0.6, 0.2, 0, TAU); c.fill();
    c.fillStyle = '#c86e22'; c.beginPath(); c.ellipse(-R * 0.82, R * 0.55, R * 0.3, R * 0.26, 0.5, 0, TAU); c.fill();
    // rosettes: the fur grows in whorls
    for (const [x, y, col] of [[-0.55, -0.45, 'rgba(255,255,255,0.18)'], [0.55, -0.15, 'rgba(120,50,10,0.5)'], [0.1, 0.05, 'rgba(160,140,120,0.45)']]) {
      c.strokeStyle = col; c.lineWidth = R * 0.035;
      for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; c.beginPath(); c.moveTo(x * R, y * R); c.quadraticCurveTo(x * R + Math.cos(a + 0.6) * R * 0.18, y * R + Math.sin(a + 0.6) * R * 0.18, x * R + Math.cos(a) * R * 0.3, y * R + Math.sin(a) * R * 0.3); c.stroke(); }
    }
  }

  /* ------------------------------------------------------------------ Apploa Vogels: Koningsdag */
  function flagPaint24(c, R) {
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * R * 0.52, R * 0.17); c.rotate(-s * 0.18);
      const w = R * 0.26, h = R * 0.055;
      c.fillStyle = '#c8102e'; c.fillRect(-w / 2, -h * 1.5, w, h);
      c.fillStyle = '#ffffff'; c.fillRect(-w / 2, -h * 0.5, w, h);
      c.fillStyle = '#21468b'; c.fillRect(-w / 2, h * 0.5, w, h);
      c.restore();
    }
  }
  function paperCrown24(c, R, t) {
    c.save(); c.translate(0, -R * 0.98); c.rotate(-0.12 + Math.sin(t * 2) * 0.03);
    const w = R * 0.95, h = R * 0.36;
    c.beginPath(); c.moveTo(-w / 2, 0);
    for (let i = 0; i <= 4; i++) { const x = -w / 2 + (i / 4) * w; c.lineTo(x, -h); if (i < 4) c.lineTo(x + w / 8, -h * 0.45); }
    c.lineTo(w / 2, 0); c.closePath();
    const g = c.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, '#ffb04a'); g.addColorStop(1, '#ff7a12');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#8a3008'; c.lineWidth = Math.max(0.6, R * 0.05); c.stroke();
    c.fillStyle = '#ffe24a'; for (let i = 0; i <= 4; i++) circle(c, -w / 2 + (i / 4) * w, -h, R * 0.045);
    c.fillStyle = '#21468b'; circle(c, 0, -h * 0.3, R * 0.05);
    c.restore();
  }

function drawMulletStream24(c, R) {
  const blobs = [
    [-0.84, -0.55, 0.33], [-0.52, -0.8, 0.33], [-0.15, -0.9, 0.34], [0.22, -0.89, 0.34], [0.58, -0.77, 0.33], [0.88, -0.5, 0.31],
    [-1.03, -0.12, 0.3], [1.03, -0.14, 0.3], [-1.08, 0.3, 0.26], [1.07, 0.28, 0.26], [-0.99, 0.6, 0.2], [1.0, 0.58, 0.2],
  ];
  const fringe = [[-0.58, -0.5, 0.17], [-0.3, -0.46, 0.18], [-0.02, -0.5, 0.17], [0.27, -0.45, 0.18], [0.55, -0.49, 0.16]];
  c.fillStyle = '#0c1a3a';
  for (const [x, y, r] of blobs.concat(fringe)) circle(c, x * R, y * R, (r + 0.07) * R);
  c.fillStyle = '#2a5cff';
  for (const [x, y, r] of blobs) circle(c, x * R, y * R, r * R);
  c.fillStyle = '#3a86ff';
  for (const [x, y, r] of fringe) circle(c, x * R, y * R, r * R);
  c.strokeStyle = 'rgba(255,120,220,0.9)'; c.lineWidth = Math.max(0.6, R * 0.045); c.lineCap = 'round';
  for (const [x0, y0, x1, y1, cx, cy] of [[-0.7, -0.75, -0.2, -1.1, -0.55, -1.05], [0.05, -1.15, 0.55, -0.9, 0.35, -1.15], [-1.1, -0.2, -1.05, 0.4, -1.25, 0.1], [1.1, -0.2, 1.05, 0.4, 1.25, 0.1], [-0.4, -0.62, -0.2, -0.38, -0.25, -0.55]]) {
    c.beginPath(); c.moveTo(x0 * R, y0 * R); c.quadraticCurveTo(cx * R, cy * R, x1 * R, y1 * R); c.stroke();
  }
}
function drawKrulHairSun24(c, R, leaf) {
  const curls = [
    [-0.62, -0.98, 0.27], [-0.24, -1.06, 0.28], [0.14, -1.04, 0.28], [0.5, -0.94, 0.27],
    [-0.88, -0.74, 0.25], [-0.46, -0.8, 0.26], [-0.05, -0.84, 0.27], [0.34, -0.8, 0.26], [0.78, -0.72, 0.25],
    [-1.02, -0.44, 0.2], [1.0, -0.44, 0.2], [-1.06, -0.18, 0.15], [1.04, -0.2, 0.15],
  ];
  const fringe = [[-0.52, -0.56, 0.15], [-0.18, -0.6, 0.16], [0.18, -0.58, 0.15], [0.5, -0.54, 0.14]];
  c.fillStyle = '#6a4614';
  for (const [x, y, r] of curls.concat(fringe)) circle(c, x * R, y * R, (r + 0.06) * R);
  curls.concat(fringe).forEach(([x, y, r], i) => { c.fillStyle = i % 3 === 0 ? '#e8bc62' : i % 3 === 1 ? '#d0a04a' : '#f4d080'; circle(c, x * R, y * R, r * R); });
  c.strokeStyle = 'rgba(255,246,210,0.9)'; c.lineWidth = Math.max(0.5, R * 0.04); c.lineCap = 'round';
  curls.concat(fringe).forEach(([x, y, r], i) => { const a0 = i * 1.7; c.beginPath(); c.arc(x * R, y * R, r * R * 0.5, a0, a0 + 3.8); c.stroke(); });
  c.strokeStyle = 'rgba(120,80,20,0.6)'; c.lineWidth = Math.max(0.4, R * 0.03);
  for (const [x, y, r] of fringe) { c.beginPath(); c.arc(x * R, y * R + r * R * 0.2, r * R * 0.75, 0.3, 2.8); c.stroke(); }
  c.save(); c.translate(R * 0.06, -R * 0.42); drawStem(c, R * 0.95, leaf, 0); c.restore();
}
function drawMikaDelft24(c, R, st) {
  if (st.horns) {
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * R * 0.4, -R * 0.82); c.quadraticCurveTo(s * R * 0.8, -R * 1.3, s * R * 0.66, -R * 1.66);
      c.quadraticCurveTo(s * R * 0.52, -R * 1.2, s * R * 0.14, -R * 0.9); c.closePath();
      c.fillStyle = '#8a0e14'; c.fill(); c.strokeStyle = '#2b0306'; c.lineWidth = Math.max(0.7, R * 0.07); c.stroke();
    }
  }
  c.strokeStyle = '#2a1a0c'; c.lineWidth = R * 0.14; c.lineCap = 'round';
  c.beginPath(); c.moveTo(R * 0.02, -R * 0.84); c.quadraticCurveTo(R * 0.06, -R * 1.15, R * 0.22, -R * 1.32); c.stroke();
  leafShape(c, R * 0.14, -R * 1.18, R * 0.62, -0.5 + (st.leaf || 0) * 0.6);
  const g = c.createLinearGradient(-R, -R, R, R);
  g.addColorStop(0, '#fdfcf7'); g.addColorStop(1, '#d6deee');
  mikaPath(c, R); c.fillStyle = g; c.fill();
  c.save(); mikaPath(c, R); c.clip();
  const sh = c.createRadialGradient(-R * 0.5, -R * 0.55, R * 0.05, -R * 0.5, -R * 0.55, R * 1.1);
  sh.addColorStop(0, 'rgba(255,255,255,0.8)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sh; c.fillRect(-R, -R, R * 2, R * 2); delftPaint24(c, R, st.t || 0);
  if (st.cyanide) { c.fillStyle = 'rgba(38,120,60,0.5)'; for (const [x, y, r] of [[-0.6, 0.5, 0.09], [0.55, 0.6, 0.07], [0.7, -0.3, 0.06]]) circle(c, x * R, y * R, r * R); }
  c.restore();
  if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(232,150,48,0.85)'; c.lineWidth = R * 0.12; rrect(c, -R * 1.06, -R * 0.98, R * 2.12, R * 2.02, R * 0.5); c.stroke(); }
  mikaPath(c, R); c.strokeStyle = '#1d3f9a'; c.lineWidth = Math.max(1, R * 0.09); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = mixHex('#f4f1ea', '#a8b4cc', clamp((st.t - b.t) / 30, 0, 1)); biteShape(c, R * 1.08, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R * 1.08, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  if (st.face !== false) {
    c.fillStyle = '#1d3f9a';
    circle(c, -R * 0.34, R * 0.04, R * 0.11);
    circle(c, R * 0.3, -R * 0.1, R * 0.11);
    c.strokeStyle = '#1d3f9a'; c.lineWidth = R * 0.11; c.lineCap = 'round';
    c.beginPath(); c.moveTo(R * 0.02, R * 0.44); c.lineTo(R * 0.5, R * 0.44); c.stroke();
  }
}
function drawPeanTri24(c, R, st) {
  const fear = st.fear || 0, t = st.t || 0;
  const shiver = fear > 0.45 ? Math.sin(t * 55) * R * 0.02 * fear : 0;
  const hop = st.pop > 0 ? Math.abs(Math.sin((st.pop / 0.9) * Math.PI * 3)) * R * 0.45 : 0;
  c.translate(shiver, -hop);
  // the ears, round and pink inside
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * R * 0.68, -R * 0.55); c.rotate(s * 0.5);
    ell(c, 0, 0, R * 0.3, R * 0.24); c.fillStyle = s < 0 ? '#231d1a' : '#d9822e'; c.fill(); c.strokeStyle = '#3a220e'; c.lineWidth = Math.max(0.8, R * 0.07); c.stroke();
    ell(c, 0, R * 0.03, R * 0.17, R * 0.12); c.fillStyle = '#e8a0a0'; c.fill();
    c.restore();
  }
  const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#efe6d8'); g.addColorStop(1, '#9a8a78');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  // a cream patch and a bit of fur
  peanPatches24(c, R);
  ell(c, 0, R * 0.42, R * 0.52, R * 0.48); c.fillStyle = 'rgba(255,252,246,0.9)'; c.fill();
  c.strokeStyle = 'rgba(80,60,40,0.4)'; c.lineWidth = R * 0.05;
  for (let i = 0; i < 9; i++) { const a = -2.6 + i * 0.32, x = Math.cos(a) * R * 0.86, y = Math.sin(a) * R * 0.82; c.beginPath(); c.moveTo(x, y); c.lineTo(x * 1.12, y * 1.12 + R * 0.04); c.stroke(); }
  // the apple half: a blush of red skin up top
  const rg = c.createRadialGradient(R * 0.4, -R * 0.55, R * 0.05, R * 0.4, -R * 0.55, R * 0.7);
  rg.addColorStop(0, 'rgba(210,50,60,0.55)'); rg.addColorStop(1, 'rgba(210,50,60,0)');
  c.fillStyle = rg; c.fillRect(-R, -R * 1.2, R * 2.2, R * 1.4);
  c.restore();
  ell(c, -R * 0.48, -R * 0.38, R * 0.18, R * 0.1, -0.7); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fill();
  applePath(c, R); c.strokeStyle = '#3a220e'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  // the fur swirl on top, next to the stem
  c.strokeStyle = '#3a2c22'; c.lineWidth = R * 0.06;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-R * 0.22, -R * 0.62, R * (0.08 + i * 0.06), -0.5 + i, 1.6 + i); c.stroke(); }
  drawStem(c, R, st.leaf || 0, 0);
  if (st.face === false) return;
  const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1);
  const lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
  for (const s of [-1, 1]) {
    const x = s * R * 0.32 + lx * R * 0.05, y = -R * 0.1 + ly * R * 0.04;
    ell(c, x, y, R * 0.21, R * 0.24 * open); c.fillStyle = '#2a0608'; c.fill();
    if (open > 0.3) {
      ell(c, x + lx * R * 0.04, y + ly * R * 0.04, R * 0.16, R * 0.19 * open); c.fillStyle = '#c81f2a'; c.fill();
      c.fillStyle = '#ffffff'; circle(c, x - R * 0.07, y - R * 0.08, R * 0.07); circle(c, x + R * 0.06, y + R * 0.06, R * 0.03);
    }
  }
  // worried brows
  c.strokeStyle = '#5a3418'; c.lineWidth = R * 0.06; c.lineCap = 'round';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.48, -R * 0.36 + fear * R * 0.02); c.lineTo(s * R * 0.18, -R * 0.44 - fear * R * 0.06); c.stroke(); }
  // the nose, the buck teeth, the whiskers
  c.fillStyle = '#e88a9a'; c.beginPath(); c.moveTo(-R * 0.08, R * 0.12); c.lineTo(R * 0.08, R * 0.12); c.lineTo(0, R * 0.22); c.closePath(); c.fill();
  c.strokeStyle = '#5a3418'; c.lineWidth = R * 0.04;
  c.beginPath(); c.moveTo(0, R * 0.22); c.lineTo(0, R * 0.3); c.moveTo(0, R * 0.3); c.quadraticCurveTo(-R * 0.08, R * 0.36, -R * 0.14, R * 0.31); c.moveTo(0, R * 0.3); c.quadraticCurveTo(R * 0.08, R * 0.36, R * 0.14, R * 0.31); c.stroke();
  if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.1, R * 0.12); c.fillStyle = '#2a0509'; c.fill(); }
  else { c.fillStyle = '#ffffff'; c.fillRect(-R * 0.07, R * 0.31, R * 0.065, R * 0.1); c.fillRect(R * 0.005, R * 0.31, R * 0.065, R * 0.1); }
  c.strokeStyle = 'rgba(60,30,10,0.6)'; c.lineWidth = Math.max(0.5, R * 0.025);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * R * 0.2, R * 0.22 + i * R * 0.05); c.lineTo(s * R * (0.7 + i * 0.04), R * 0.12 + i * R * 0.1); c.stroke(); }
  c.fillStyle = 'rgba(232,120,130,0.35)'; for (const s of [-1, 1]) { ell(c, s * R * 0.48, R * 0.2, R * 0.12, R * 0.07); c.fill(); }
  // tiny pink paws
  c.fillStyle = '#f0b0b0'; for (const s of [-1, 1]) { ell(c, s * R * 0.28, R * 0.9, R * 0.12, R * 0.08); c.fill(); }
}
function drawApploaOranje24(c, R, st) {
  const t = st.t || 0, fear = st.fear || 0;
  // a blonde ponytail behind the apple
  c.save(); c.translate(R * 0.55, -R * 0.55); c.rotate(0.5 + Math.sin(t * 3) * 0.08);
  c.fillStyle = '#b8440e'; ell(c, R * 0.3, R * 0.2, R * 0.28, R * 0.55, 0.3); c.fill();
  c.fillStyle = '#ff8a1e'; ell(c, R * 0.28, R * 0.12, R * 0.2, R * 0.46, 0.3); c.fill();
  c.restore();
  const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#b0744a'); g.addColorStop(0.45, '#7a4426'); g.addColorStop(1, '#341a0c');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  c.strokeStyle = 'rgba(255,200,150,0.12)'; c.lineWidth = R * 0.05;
  for (const x of [-0.55, -0.2, 0.3, 0.62]) { c.beginPath(); c.moveTo(x * R, -R * 0.7); c.quadraticCurveTo(x * R * 1.15, 0, x * R * 0.8, R * 0.85); c.stroke(); }
  c.restore();
  ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = 'rgba(255,230,200,0.32)'; c.fill();
  applePath(c, R); c.strokeStyle = '#1a0c04'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  // the blonde fringe on top
  c.fillStyle = '#ff7a14';
  c.beginPath(); c.moveTo(-R * 0.98, -R * 0.12); c.quadraticCurveTo(-R * 1.0, -R * 1.02, 0, -R * 0.86); c.quadraticCurveTo(R * 1.0, -R * 1.02, R * 0.98, -R * 0.12);
  c.quadraticCurveTo(R * 0.75, -R * 0.55, R * 0.4, -R * 0.5); c.quadraticCurveTo(R * 0.2, -R * 0.34, 0, -R * 0.48); c.quadraticCurveTo(-R * 0.35, -R * 0.3, -R * 0.55, -R * 0.52); c.quadraticCurveTo(-R * 0.8, -R * 0.45, -R * 0.98, -R * 0.12);
  c.closePath(); c.fill();
  c.strokeStyle = '#8a3008'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
  c.strokeStyle = '#ffc890'; c.lineWidth = R * 0.05;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-R * (0.7 - i * 0.4), -R * 0.82); c.quadraticCurveTo(-R * (0.62 - i * 0.4), -R * 0.66, -R * (0.5 - i * 0.4), -R * 0.56); c.stroke(); }
  paperCrown24(c, R, t);
  drawStem(c, R, st.leaf || 0, 0);
  if (st.face !== false) {
    const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1);
    const lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
    for (const s of [-1, 1]) {
      const x = s * R * 0.33 + lx * R * 0.05, y = -R * 0.06 + ly * R * 0.04;
      ell(c, x, y, R * 0.2, R * 0.24 * open); c.fillStyle = '#fff8ec'; c.fill();
      c.strokeStyle = '#1a0a04'; c.lineWidth = R * 0.055; c.stroke();
      if (open > 0.3) {
        const pr = R * (0.12 - fear * 0.04), px = x + lx * R * 0.075, py = y + ly * R * 0.09 * open;
        c.fillStyle = '#3a2210'; circle(c, px, py, pr * 1.25); c.fillStyle = '#0c0604'; circle(c, px, py, pr * 0.7);
        c.fillStyle = '#ffffff'; circle(c, px - pr * 0.4, py - pr * 0.45, pr * 0.4);
      }
      // lashes
      c.strokeStyle = '#1a0a04'; c.lineWidth = R * 0.04;
      c.beginPath(); c.moveTo(x + s * R * 0.16, y - R * 0.14 * open); c.lineTo(x + s * R * 0.26, y - R * 0.22 * open); c.stroke();
    }
    c.strokeStyle = '#e0600c'; c.lineWidth = R * 0.07; c.lineCap = 'round';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.5, -R * 0.33 + fear * R * 0.02); c.lineTo(s * R * 0.18, -R * 0.42 - fear * R * 0.05); c.stroke(); }
    c.fillStyle = 'rgba(220,110,90,0.28)'; for (const s of [-1, 1]) { ell(c, s * R * 0.5, R * 0.18, R * 0.13, R * 0.08); c.fill(); }
    flagPaint24(c, R);
    if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.12, R * 0.15); c.fillStyle = '#1a0406'; c.fill(); }
    else {
      c.strokeStyle = '#2a0e06'; c.lineWidth = R * 0.07;
      c.beginPath(); c.moveTo(-R * 0.17, R * 0.36); c.quadraticCurveTo(0, R * 0.5, R * 0.17, R * 0.36); c.stroke();
    }
  }
  // the seagull wings: in the game they flap on their own, everywhere else they sit behind her
  if (!('chomp' in st)) {
    c.globalCompositeOperation = 'destination-over';
    drawGullWingsOranje24(c, R, Math.sin(t * 2) * 0.12, true);
    c.globalCompositeOperation = 'source-over';
  }
}
function drawGullWingsOranje24(c, R, flap, behind) {
  // a herring gull from above: long pale grey wings, black tips with white spots, a white trailing edge.
  // behind: drawn under what is already there, so the steps go in the other order
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.12 - flap);
    const L = R * 1.85;
    const wing = () => {
      c.beginPath();
      c.moveTo(0, -R * 0.26);
      c.bezierCurveTo(L * 0.3, -R * 0.62, L * 0.72, -R * 0.56, L, -R * 0.16);
      c.quadraticCurveTo(L * 0.92, R * 0.06, L * 0.8, R * 0.04);
      c.quadraticCurveTo(L * 0.72, R * 0.2, L * 0.6, R * 0.14);
      c.quadraticCurveTo(L * 0.5, R * 0.3, L * 0.38, R * 0.24);
      c.quadraticCurveTo(L * 0.24, R * 0.38, L * 0.1, R * 0.3);
      c.quadraticCurveTo(L * 0.04, R * 0.32, 0, R * 0.24);
      c.closePath();
    };
    const inside = (fn) => () => { c.save(); wing(); c.clip(); fn(); c.restore(); };
    const ops = [
      () => { wing(); c.fillStyle = '#c8ced6'; c.fill(); },
      inside(() => { c.fillStyle = '#aab2bc'; c.fillRect(L * 0.2, -R * 0.7, L * 0.5, R * 0.42); }),
      inside(() => { c.fillStyle = '#ff7a12'; c.beginPath(); c.moveTo(L * 0.66, -R); c.lineTo(L * 1.2, -R); c.lineTo(L * 1.2, R); c.lineTo(L * 0.74, R); c.closePath(); c.fill(); }),
      inside(() => { c.fillStyle = '#ffffff'; circle(c, L * 0.9, -R * 0.2, R * 0.075); circle(c, L * 0.8, -R * 0.08, R * 0.06); }),
      inside(() => { c.strokeStyle = '#f6f8fa'; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(L * 0.04, R * 0.3); c.quadraticCurveTo(L * 0.24, R * 0.38, L * 0.38, R * 0.24); c.quadraticCurveTo(L * 0.5, R * 0.3, L * 0.6, R * 0.14); c.stroke(); }),
      inside(() => { c.strokeStyle = 'rgba(80,88,100,0.45)'; c.lineWidth = R * 0.035; for (let i = 0; i < 5; i++) { const x = L * (0.18 + i * 0.13); c.beginPath(); c.moveTo(x, -R * 0.32 + i * R * 0.02); c.lineTo(x + L * 0.05, R * 0.2 - i * R * 0.03); c.stroke(); } }),
      () => { wing(); c.strokeStyle = '#2e333b'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke(); },
    ];
    if (behind) ops.reverse();
    for (const op of ops) op();
    c.restore();
  }
}


})(window.__bitten.S62 || (window.__bitten.S62 = {}));
