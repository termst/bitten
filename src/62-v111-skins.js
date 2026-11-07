/* src/62-v111-skins.js: v11.1 to v13.6: skins, wardrobe, Epic, Grotesque, Arcade (SKINS24). From v11.1, v12.2, v13.2, v13.4, v13.5, v13.6. Lines 27901 to 31013 of the v13.7 script. */
/* ===== v11.1: Skins. Every playable apple gets a second look in its own theme. Tap a character to open the wardrobe. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe62'); console.error(e); return fb; } };
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
  const rnd24 = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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


  /* ------------------------------------------------------------------ v11.6: a third look for everyone, and Lucifer */
  // The Apple: Kermisappel. Toffee shell, a stick, hagelslag on the bottom.
  function drawKermis26(c, R, st) {
    const t = st.t || 0;
    // the stick goes in where the stem was
    c.strokeStyle = '#4a2c12'; c.lineWidth = R * 0.24; c.beginPath(); c.moveTo(0, -R * 0.5); c.lineTo(-R * 0.06, -R * 1.62); c.stroke();
    c.strokeStyle = '#e8c98e'; c.lineWidth = R * 0.15; c.stroke();
    skinBody24(c, R, st, { g: ['#ff9a8a', '#d92a40', '#6e0b1d'], vein: 'rgba(255,190,120,0.12)', hl: 'rgba(255,255,255,0.0)', out: '#3a1204',
      inside(c, R) {
        // the toffee: glossy amber over the top two thirds, ragged where it stopped dripping
        c.fillStyle = 'rgba(200,96,18,0.82)';
        c.beginPath(); c.moveTo(-R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 1.3); c.lineTo(R * 1.3, R * 0.18);
        for (const [x, d] of [[0.9, 0.42], [0.62, 0.2], [0.36, 0.5], [0.08, 0.26], [-0.2, 0.56], [-0.5, 0.22], [-0.8, 0.44]]) {
          c.lineTo((x + 0.1) * R, R * 0.18); c.bezierCurveTo((x + 0.1) * R, (0.18 + d) * R, (x - 0.1) * R, (0.18 + d) * R, (x - 0.1) * R, R * 0.18);
        }
        c.lineTo(-R * 1.3, R * 0.18); c.closePath(); c.fill();
        // hagelslag stuck to the bottom
        const cols = ['#4a2a16', '#f2e6d0', '#e86a9a', '#6ac0f0', '#f2d24a', '#7ad06a'];
        c.lineWidth = Math.max(0.6, R * 0.06); c.lineCap = 'round';
        for (let i = 0; i < 34; i++) {
          const x = (rnd24(i * 3) - 0.5) * R * 1.9, y = R * (0.5 + rnd24(i * 3 + 1) * 0.5), a = rnd24(i * 3 + 2) * TAU;
          c.strokeStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * R * 0.1, y + Math.sin(a) * R * 0.1); c.stroke();
        }
      } });
    // the toffee shine: a long hard highlight, and a moving glint
    c.strokeStyle = 'rgba(255,240,200,0.75)'; c.lineWidth = R * 0.08; c.beginPath(); c.arc(0, 0, R * 0.76, -2.5, -1.7); c.stroke();
    sparkle(c, -R * 0.55 + Math.sin(t * 1.3) * R * 0.08, -R * 0.5, R * (0.16 + 0.05 * Math.sin(t * 6)), 'rgba(255,250,220,0.9)');
    if (st.face !== false) drawAppleFace(c, R, st);
    // a paper napkin twisted around the stick
    c.fillStyle = '#f4eee2'; c.strokeStyle = 'rgba(80,60,40,0.5)'; c.lineWidth = Math.max(0.4, R * 0.03);
    c.beginPath(); c.moveTo(-R * 0.22, -R * 1.02); c.lineTo(R * 0.12, -R * 1.06); c.lineTo(R * 0.06, -R * 1.3); c.lineTo(-R * 0.2, -R * 1.26); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#e83a50'; c.fillRect(-R * 0.18, -R * 1.18, R * 0.26, R * 0.04);
  }

  // Appelgameplay: Capybara. A capybara onesie, a yuzu on the head.
  function drawCapy26(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#e0a07a', '#a8603a', '#4a2412'], vein: 'rgba(255,220,180,0.1)', hl: 'rgba(255,255,255,0.0)', out: '#2a1406',
      inside(c, R) {
        // the onesie: brown fur all over, a pale belly patch
        c.fillStyle = 'rgba(150,100,62,0.95)'; c.fillRect(-R * 1.3, -R * 1.3, R * 2.6, R * 2.6);
        c.fillStyle = 'rgba(200,160,120,0.85)'; ell(c, 0, R * 0.78, R * 0.5, R * 0.3); c.fill();
        c.strokeStyle = 'rgba(70,40,20,0.35)'; c.lineWidth = Math.max(0.3, R * 0.025);
        for (let i = 0; i < 22; i++) { const x = (rnd24(i + 40) - 0.5) * R * 1.8, y = (rnd24(i + 80) - 0.5) * R * 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + R * 0.05, y + R * 0.1); c.stroke(); }
        // the face hole, where the apple shows
        ell(c, 0, R * 0.12, R * 0.74, R * 0.5); c.fillStyle = '#c8303c'; c.fill();
        c.strokeStyle = '#6a4426'; c.lineWidth = R * 0.09; c.stroke();
      } });
    if (st.face !== false) drawAppelFace(c, R, st);
    // the hood on top: a calm capybara head, looking the same way he does
    c.save(); c.translate(0, -R * 0.86);
    for (const s of [-1, 1]) { c.fillStyle = '#6a4426'; ell(c, s * R * 0.56, -R * 0.3, R * 0.14, R * 0.11); c.fill(); c.fillStyle = '#3a2412'; ell(c, s * R * 0.56, -R * 0.28, R * 0.07, R * 0.05); c.fill(); }
    rrect(c, -R * 0.72, -R * 0.38, R * 1.44, R * 0.62, R * 0.28); c.fillStyle = '#9a6a42'; c.fill(); c.strokeStyle = '#3a2412'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
    c.fillStyle = '#b4825a'; rrect(c, -R * 0.3, -R * 0.12, R * 0.6, R * 0.32, R * 0.14); c.fill();
    c.fillStyle = '#3a2412'; ell(c, -R * 0.1, R * 0.0, R * 0.045, R * 0.07); c.fill(); ell(c, R * 0.1, R * 0.0, R * 0.045, R * 0.07); c.fill();
    c.strokeStyle = '#3a2412'; c.lineWidth = Math.max(0.5, R * 0.04); c.beginPath(); c.moveTo(-R * 0.08, R * 0.13); c.quadraticCurveTo(0, R * 0.17, R * 0.08, R * 0.13); c.stroke();
    // half closed eyes: completely relaxed
    for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.44, -R * 0.12, R * 0.07, 0, Math.PI); c.fillStyle = '#1a0e06'; c.fill(); c.strokeStyle = '#1a0e06'; c.beginPath(); c.moveTo(s * R * 0.53, -R * 0.12); c.lineTo(s * R * 0.35, -R * 0.12); c.stroke(); }
    // the yuzu, balanced, with a leaf
    const bob = Math.sin(t * 2) * R * 0.03;
    c.fillStyle = '#ffb43a'; circle(c, R * 0.06, -R * 0.56 + bob, R * 0.22); c.strokeStyle = '#8a5010'; c.lineWidth = Math.max(0.5, R * 0.04); c.stroke();
    c.fillStyle = 'rgba(255,240,180,0.6)'; ell(c, -R * 0.02, -R * 0.64 + bob, R * 0.07, R * 0.04, -0.5); c.fill();
    leafShape(c, R * 0.1, -R * 0.76 + bob, R * 0.3, -0.6);
    c.restore();
    // little paws
    c.fillStyle = '#7a5032'; for (const s of [-1, 1]) { ell(c, s * R * 0.55, R * 0.9, R * 0.16, R * 0.1); c.fill(); }
  }

  // The Rotten Apple: Zonnebloem. Compost on the bottom, a sunflower on top.
  function drawSun26(c, R, st) {
    const t = st.t || 0;
    // the petals sit behind the head like a big collar
    c.save(); c.translate(0, -R * 0.1); c.rotate(Math.sin(t * 0.6) * 0.05);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      c.save(); c.rotate(a);
      c.beginPath(); c.moveTo(0, -R * 0.9); c.quadraticCurveTo(R * 0.2, -R * 1.25, 0, -R * 1.5); c.quadraticCurveTo(-R * 0.2, -R * 1.25, 0, -R * 0.9);
      c.fillStyle = i % 2 ? '#f2b81e' : '#ffd23a'; c.fill(); c.strokeStyle = '#8a5a08'; c.lineWidth = Math.max(0.4, R * 0.035); c.stroke();
      c.restore();
    }
    c.restore();
    skinBody24(c, R, st, { g: ['#9a8a4a', '#5e4a1e', '#24180a'], vein: 'rgba(220,200,120,0.12)', hl: 'rgba(255,240,180,0.3)', out: '#140c04',
      inside(c, R) {
        // seed pattern on the face side, like the middle of a sunflower
        c.fillStyle = 'rgba(40,24,8,0.45)';
        for (let i = 0; i < 60; i++) { const a = i * 2.39996, r = Math.sqrt(i) * R * 0.12; if (r > R * 0.95) break; circle(c, Math.cos(a) * r, Math.sin(a) * r - R * 0.05, R * 0.035); }
        // compost crumbs and a bit of eggshell at the bottom
        c.fillStyle = '#2a1a0a'; c.fillRect(-R * 1.3, R * 0.7, R * 2.6, R * 0.6);
        c.fillStyle = 'rgba(90,60,30,0.9)'; for (let i = 0; i < 18; i++) circle(c, (rnd24(i + 5) - 0.5) * R * 1.9, R * (0.66 + rnd24(i + 9) * 0.1), R * (0.05 + rnd24(i + 2) * 0.05));
        c.fillStyle = '#f2ead6'; c.beginPath(); c.moveTo(R * 0.3, R * 0.72); c.lineTo(R * 0.5, R * 0.66); c.lineTo(R * 0.46, R * 0.8); c.closePath(); c.fill();
        c.fillStyle = 'rgba(170,190,110,0.6)'; for (const [x, y, r] of [[-0.5, 0.3, 0.16], [0.45, -0.35, 0.12]]) circle(c, x * R, y * R, r * R);
      } });
    if (st.face !== false) drawRotFace(c, R, st);
    // a seedling where the stem was
    c.strokeStyle = '#3d6a1c'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, -R * 0.62); c.quadraticCurveTo(-R * 0.05, -R * 0.9, R * 0.04, -R * 1.1); c.stroke();
    leafShape(c, R * 0.02, -R * 0.92, R * 0.42, -0.4 + (st.leaf || 0) * 0.4); leafShape(c, R * 0.0, -R * 0.84, R * 0.38, Math.PI + 0.4);
    drawRotWorm(c, R, t);
  }

  // Krullenbol: Stroopkrul. A stroopwafel grid, syrup curls.
  function drawWafel26(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#f6d08a', '#d89a46', '#7a4a16'], vein: 'rgba(0,0,0,0)', hl: 'rgba(255,250,220,0.45)', out: '#3a1e06',
      inside(c, R) {
        // the waffle grid, pressed in diagonally
        c.strokeStyle = 'rgba(120,64,16,0.6)'; c.lineWidth = R * 0.07;
        for (let i = -8; i <= 8; i++) {
          c.beginPath(); c.moveTo(i * R * 0.26 - R * 1.4, -R * 1.4); c.lineTo(i * R * 0.26 + R * 1.4, R * 1.4); c.stroke();
          c.beginPath(); c.moveTo(i * R * 0.26 + R * 1.4, -R * 1.4); c.lineTo(i * R * 0.26 - R * 1.4, R * 1.4); c.stroke();
        }
        c.strokeStyle = 'rgba(255,230,170,0.25)'; c.lineWidth = R * 0.025;
        for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(i * R * 0.26 - R * 1.38, -R * 1.42); c.lineTo(i * R * 0.26 + R * 1.42, R * 1.38); c.stroke(); }
        // the syrup seam round the middle, dripping a little
        c.fillStyle = '#8a4a0e'; c.fillRect(-R * 1.3, R * 0.42, R * 2.6, R * 0.14);
        for (const [x, d] of [[-0.5, 0.18], [0.1, 0.28], [0.6, 0.14]]) { c.beginPath(); c.moveTo((x - 0.06) * R, R * 0.54); c.quadraticCurveTo(x * R, (0.56 + d * 2) * R, (x + 0.06) * R, R * 0.54); c.fill(); }
        c.fillStyle = 'rgba(255,200,120,0.4)'; c.fillRect(-R * 1.3, R * 0.44, R * 2.6, R * 0.03);
      } });
    if (st.face !== false) drawKrulFace(c, R, st);
    drawKrulGlasses(c, R);
    // the curls, poured in syrup
    const curls = [[-0.62, -0.98, 0.27], [-0.24, -1.06, 0.28], [0.14, -1.04, 0.28], [0.5, -0.94, 0.27], [-0.88, -0.74, 0.25], [-0.46, -0.8, 0.26], [-0.05, -0.84, 0.27], [0.34, -0.8, 0.26], [0.78, -0.72, 0.25], [-1.02, -0.44, 0.2], [1.0, -0.44, 0.2]];
    const fringe = [[-0.52, -0.56, 0.15], [-0.18, -0.6, 0.16], [0.18, -0.58, 0.15], [0.5, -0.54, 0.14]];
    const all = curls.concat(fringe);
    c.fillStyle = '#3a1a04'; for (const [x, y, r] of all) circle(c, x * R, y * R, (r + 0.06) * R);
    all.forEach(([x, y, r], i) => { c.fillStyle = i % 3 === 0 ? '#c0721e' : i % 3 === 1 ? '#a85e14' : '#d8892a'; circle(c, x * R, y * R, r * R); });
    c.strokeStyle = 'rgba(255,214,140,0.85)'; c.lineWidth = Math.max(0.5, R * 0.045);
    all.forEach(([x, y, r], i) => { const a0 = i * 1.7 + Math.sin(t) * 0.2; c.beginPath(); c.arc(x * R, y * R, r * R * 0.5, a0, a0 + 3.8); c.stroke(); });
    // a cup of tea steaming under the chin would be too much. A crumb then.
    c.fillStyle = '#d89a46'; circle(c, R * 0.62, R * 0.86, R * 0.06);
  }

  // Mikappols: Klokwerk. A pocket watch running a quarter slow.
  function drawClock26(c, R, st) {
    const t = st.t || 0;
    // the crown and the ring on top
    c.strokeStyle = '#6a4a12'; c.lineWidth = R * 0.12; c.beginPath(); c.arc(0, -R * 1.22, R * 0.2, 0, TAU); c.stroke();
    c.strokeStyle = '#e8c45a'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#c99a2a'; rrect(c, -R * 0.14, -R * 1.06, R * 0.28, R * 0.2, R * 0.04); c.fill(); c.strokeStyle = '#4a3008'; c.lineWidth = Math.max(0.5, R * 0.04); c.stroke();
    const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#fff0a8'); g.addColorStop(0.5, '#d4a432'); g.addColorStop(1, '#6a4a0e');
    mikaPath(c, R); c.fillStyle = g; c.fill();
    c.save(); mikaPath(c, R); c.clip();
    // the dial
    c.fillStyle = '#f6f2e8'; circle(c, 0, R * 0.02, R * 0.76);
    c.strokeStyle = '#1a1a22'; c.lineWidth = Math.max(0.4, R * 0.03);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.lineWidth = Math.max(0.4, R * (i % 3 ? 0.03 : 0.06)); c.beginPath(); c.moveTo(Math.cos(a) * R * 0.6, R * 0.02 + Math.sin(a) * R * 0.6); c.lineTo(Math.cos(a) * R * 0.7, R * 0.02 + Math.sin(a) * R * 0.7); c.stroke(); }
    c.strokeStyle = '#a07c1c'; c.lineWidth = Math.max(0.5, R * 0.05); c.beginPath(); c.arc(0, R * 0.02, R * 0.76, 0, TAU); c.stroke();
    // the hands go round, slow
    const a1 = t * 0.75 * 0.4 - Math.PI / 2, a2 = t * 0.75 * 0.4 / 12 - Math.PI / 3;
    c.strokeStyle = '#1a2fd8'; c.lineCap = 'round';
    c.lineWidth = Math.max(0.5, R * 0.05); c.beginPath(); c.moveTo(0, R * 0.02); c.lineTo(Math.cos(a1) * R * 0.55, R * 0.02 + Math.sin(a1) * R * 0.55); c.stroke();
    c.lineWidth = Math.max(0.6, R * 0.08); c.beginPath(); c.moveTo(0, R * 0.02); c.lineTo(Math.cos(a2) * R * 0.36, R * 0.02 + Math.sin(a2) * R * 0.36); c.stroke();
    c.fillStyle = '#1a1a22'; circle(c, 0, R * 0.02, R * 0.06);
    // glass shine
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-R * 0.3, -R * 0.35, R * 0.34, R * 0.14, -0.6, 0, TAU); c.fill();
    c.restore();
    if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(232,150,48,0.85)'; c.lineWidth = R * 0.12; rrect(c, -R * 1.06, -R * 0.98, R * 2.12, R * 2.02, R * 0.5); c.stroke(); }
    mikaPath(c, R); c.strokeStyle = '#3a2804'; c.lineWidth = Math.max(1, R * 0.09); c.stroke();
    if (st.bites && st.bites.length) {
      c.globalCompositeOperation = 'source-atop';
      for (const b of st.bites) { c.fillStyle = mixHex('#f6f2e8', '#8a7a5a', clamp((t - b.t) / 30, 0, 1)); biteShape(c, R * 1.08, b.a, 1.38); c.fill(); }
      c.globalCompositeOperation = 'destination-out';
      for (const b of st.bites) { biteShape(c, R * 1.08, b.a, 1); c.fill(); }
      c.globalCompositeOperation = 'source-over';
    }
    if (st.face !== false) {
      // the same face as always, printed on the dial
      c.fillStyle = '#1a2fd8';
      circle(c, -R * 0.34, R * 0.04, R * 0.1); circle(c, R * 0.3, -R * 0.1, R * 0.1);
      c.strokeStyle = '#1a2fd8'; c.lineWidth = R * 0.1; c.lineCap = 'round';
      c.beginPath(); c.moveTo(R * 0.02, R * 0.44); c.lineTo(R * 0.46, R * 0.44); c.stroke();
    }
  }

  // Peanapple: Rave Cavia. Shades, a light-up headband, glow sticks.
  function drawRave26(c, R, st) {
    const t = st.t || 0, hue = (t * 120) % 360;
    drawPean(c, R, st);
    // the headband, every LED a different color
    c.strokeStyle = '#16141c'; c.lineWidth = R * 0.14; c.beginPath(); c.arc(0, R * 0.25, R * 1.02, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.22 + i * 0.093), x = Math.cos(a) * R * 1.02, y = R * 0.25 + Math.sin(a) * R * 1.02, col = `hsl(${(hue + i * 50) % 360},100%,62%)`;
      glowDot(c, x, y, R * 0.18, '#ffffff', 0.25); c.fillStyle = col; circle(c, x, y, R * 0.06);
    }
    if (st.face !== false) {
      // big shades: nobody can see how scared he is
      c.fillStyle = '#0c0a14'; c.strokeStyle = '#ff3ad8'; c.lineWidth = Math.max(0.5, R * 0.04);
      for (const s of [-1, 1]) { rrect(c, s > 0 ? R * 0.06 : -R * 0.62, -R * 0.2, R * 0.56, R * 0.32, R * 0.08); c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(-R * 0.06, -R * 0.08); c.lineTo(R * 0.06, -R * 0.08); c.stroke();
      c.fillStyle = `hsla(${hue},100%,70%,0.55)`; for (const s of [-1, 1]) { c.fillRect(s > 0 ? R * 0.12 : -R * 0.56, -R * 0.15, R * 0.18, R * 0.05); }
    }
    // a glow necklace and a glow stick in each paw
    c.strokeStyle = `hsl(${(hue + 120) % 360},100%,60%)`; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, R * 0.22, R * 0.62, 0.35, Math.PI - 0.35); c.stroke();
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * R * 0.88, R * 0.6); c.rotate(s * (0.5 + Math.sin(t * 8) * 0.25));
      const col = s < 0 ? '#3aff6a' : '#ff3ad8';
      glowDot(c, 0, -R * 0.25, R * 0.45, col, 0.35);
      c.strokeStyle = col; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -R * 0.5); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = R * 0.04; c.stroke();
      c.restore();
    }
  }

  // Apploa Vogels: Feniks. Hair on fire, wings on fire, back from the ashes.
  function drawFenixWings26(c, R, flap, behind) {
    const t = performance.now() / 1000;
    for (const side of [-1, 1]) {
      c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.12 - flap);
      const L = R * 1.85;
      const wing = () => {
        c.beginPath(); c.moveTo(0, -R * 0.26);
        c.bezierCurveTo(L * 0.3, -R * 0.7, L * 0.75, -R * 0.66, L * 1.05, -R * 0.3);
        for (let i = 0; i < 5; i++) { const x0 = L * (1.05 - i * 0.2), x1 = x0 - L * 0.2; c.quadraticCurveTo((x0 + x1) / 2 + L * 0.04, R * (0.1 + i * 0.07) + Math.sin(t * 9 + i) * R * 0.05, x1, R * (0.0 + i * 0.05)); }
        c.quadraticCurveTo(L * 0.02, R * 0.3, 0, R * 0.24); c.closePath();
      };
      const inside = (fn) => () => { c.save(); wing(); c.clip(); fn(); c.restore(); };
      const ops = [
        () => { wing(); const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.45, '#ff8a1e'); g.addColorStop(1, '#c4121e'); c.fillStyle = g; c.fill(); },
        inside(() => { c.strokeStyle = 'rgba(255,240,180,0.55)'; c.lineWidth = R * 0.05; for (let i = 0; i < 6; i++) { const x = L * (0.15 + i * 0.15); c.beginPath(); c.moveTo(x, -R * 0.4); c.quadraticCurveTo(x + L * 0.05, 0, x - L * 0.02, R * 0.3); c.stroke(); } }),
        () => { wing(); c.strokeStyle = '#5a0a06'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke(); },
      ];
      if (behind) ops.reverse();
      for (const op of ops) op();
      c.restore();
    }
  }
  function drawFenix26(c, R, st) {
    const t = st.t || 0, fear = st.fear || 0;
    // the ponytail is a flame
    c.save(); c.translate(R * 0.55, -R * 0.6); c.rotate(0.5 + Math.sin(t * 5) * 0.12);
    flameShape(c, R * 0.25, R * 0.1, R * 0.34, R * 0.7); c.fillStyle = '#e8401a'; c.fill();
    flameShape(c, R * 0.25, R * 0.2, R * 0.2, R * 0.46); c.fillStyle = '#ffc04a'; c.fill();
    c.restore();
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
    g.addColorStop(0, '#b0744a'); g.addColorStop(0.45, '#7a4426'); g.addColorStop(1, '#341a0c');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    // embers glowing under the skin
    for (let i = 0; i < 7; i++) glowDot(c, (rnd24(i + 21) - 0.5) * R * 1.6, (rnd24(i + 31) - 0.3) * R * 1.2, R * 0.3, '#ff7a1a', 0.18 + 0.1 * Math.sin(t * 4 + i));
    c.restore();
    ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = 'rgba(255,220,180,0.32)'; c.fill();
    applePath(c, R); c.strokeStyle = '#1a0c04'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    // the fringe burns too
    c.save(); c.translate(0, -R * 0.6);
    for (const [x, h, w] of [[-0.7, 0.42, 0.24], [-0.35, 0.58, 0.26], [0, 0.66, 0.28], [0.35, 0.56, 0.26], [0.7, 0.4, 0.22]]) {
      const f = 1 + Math.sin(t * 12 + x * 9) * 0.1;
      flameShape(c, x * R, 0, w * R, h * R * f); c.fillStyle = '#e8401a'; c.fill();
      flameShape(c, x * R, R * 0.06, w * R * 0.55, h * R * 0.6 * f); c.fillStyle = '#ffd04a'; c.fill();
    }
    c.fillStyle = '#c42a10'; c.beginPath(); c.moveTo(-R * 0.98, R * 0.48); c.quadraticCurveTo(-R * 0.9, -R * 0.2, 0, -R * 0.24); c.quadraticCurveTo(R * 0.9, -R * 0.2, R * 0.98, R * 0.48);
    c.quadraticCurveTo(R * 0.6, R * 0.1, 0, R * 0.12); c.quadraticCurveTo(-R * 0.6, R * 0.1, -R * 0.98, R * 0.48); c.closePath(); c.fill();
    c.restore();
    if (st.face !== false) {
      const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
      for (const s of [-1, 1]) {
        const x = s * R * 0.33 + lx * R * 0.05, y = -R * 0.04 + ly * R * 0.04;
        ell(c, x, y, R * 0.2, R * 0.23 * open); c.fillStyle = '#fff4e0'; c.fill(); c.strokeStyle = '#1a0a04'; c.lineWidth = R * 0.055; c.stroke();
        if (open > 0.3) { const px = x + lx * R * 0.07, py = y + ly * R * 0.08 * open, pr = R * (0.12 - fear * 0.04); c.fillStyle = '#e86a1a'; circle(c, px, py, pr * 1.25); c.fillStyle = '#1a0604'; circle(c, px, py, pr * 0.6); c.fillStyle = '#fff'; circle(c, px - pr * 0.4, py - pr * 0.45, pr * 0.38); }
      }
      c.fillStyle = 'rgba(255,120,40,0.35)'; for (const s of [-1, 1]) { ell(c, s * R * 0.5, R * 0.2, R * 0.13, R * 0.08); c.fill(); }
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.12, R * 0.15); c.fillStyle = '#1a0406'; c.fill(); }
      else { c.strokeStyle = '#2a0e06'; c.lineWidth = R * 0.07; c.beginPath(); c.moveTo(-R * 0.18, R * 0.36); c.quadraticCurveTo(0, R * 0.52, R * 0.18, R * 0.34); c.stroke(); }
    }
    if (!('chomp' in st)) {
      c.globalCompositeOperation = 'destination-over';
      drawFenixWings26(c, R, Math.sin(t * 2) * 0.12, true);
      c.globalCompositeOperation = 'source-over';
    }
  }


  /* ------------------------------------------------------------------ v11.7: two more looks for everyone */
  const lw27 = (R, k) => Math.max(0.5, R * k);
  // a campaign rosette with two ribbons, for the four fictional parties
  function rosette27(c, x, y, R, col, t) {
    c.save(); c.translate(x, y);
    for (const s of [-1, 1]) { c.fillStyle = col; c.beginPath(); c.moveTo(s * R * 0.04, 0); c.lineTo(s * R * 0.2, R * 0.48); c.lineTo(s * R * 0.1, R * 0.42); c.lineTo(s * R * 0.02, R * 0.5); c.lineTo(-s * R * 0.08, 0); c.closePath(); c.fill(); }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + t * 0.3; c.fillStyle = i % 2 ? col : '#ffffff'; circle(c, Math.cos(a) * R * 0.17, Math.sin(a) * R * 0.17, R * 0.09); }
    c.fillStyle = col; circle(c, 0, 0, R * 0.14); c.strokeStyle = '#ffffff'; c.lineWidth = lw27(R, 0.025); c.stroke();
    c.fillStyle = '#ffffff'; circle(c, 0, 0, R * 0.05);
    c.restore();
  }
  function sash27(c, R, col, stripe) {
    c.save(); c.rotate(-0.55);
    c.fillStyle = col; c.fillRect(-R * 1.6, R * 0.2, R * 3.2, R * 0.26);
    c.fillStyle = stripe; c.fillRect(-R * 1.6, R * 0.25, R * 3.2, R * 0.04); c.fillRect(-R * 1.6, R * 0.37, R * 3.2, R * 0.04);
    c.restore();
  }
  function plainFace27(c, R, st, o = {}) {
    const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
    for (const s of [-1, 1]) {
      const x = s * R * 0.3 + lx * R * 0.05, y = -R * 0.05 + ly * R * 0.04;
      ell(c, x, y, R * 0.18, R * 0.21 * open); c.fillStyle = o.white || '#fff8ec'; c.fill(); c.strokeStyle = o.ink || '#1a0608'; c.lineWidth = lw27(R, 0.05); c.stroke();
      if (open > 0.3) { const px = x + lx * R * 0.06, py = y + ly * R * 0.07 * open; c.fillStyle = o.iris || '#1a0608'; circle(c, px, py, R * 0.09); c.fillStyle = o.ink || '#120406'; circle(c, px, py, R * 0.05); c.fillStyle = '#fff'; circle(c, px - R * 0.03, py - R * 0.035, R * 0.03); }
      c.strokeStyle = o.ink || '#1a0608'; c.lineWidth = lw27(R, 0.07);
      c.beginPath(); c.moveTo(s * R * 0.1, -R * 0.3 - (o.angry ? -R * 0.04 : 0)); c.lineTo(s * R * 0.48, -R * 0.36 + (o.angry ? -R * 0.08 : 0)); c.stroke();
    }
    c.strokeStyle = o.ink || '#1a0608'; c.lineWidth = lw27(R, 0.07);
    if (st.hurt > 0 || st.mouthOpen || o.shout) { ell(c, 0, R * 0.4, R * 0.15, R * 0.15); c.fillStyle = '#1a0406'; c.fill(); }
    else if (o.grin) { c.beginPath(); c.moveTo(-R * 0.26, R * 0.32); c.quadraticCurveTo(0, R * 0.56, R * 0.26, R * 0.32); c.closePath(); c.fillStyle = '#1a0406'; c.fill(); c.fillStyle = '#fffaf0'; c.fillRect(-R * 0.2, R * 0.33, R * 0.4, R * 0.06); }
    else { c.beginPath(); c.moveTo(-R * 0.16, R * 0.38); c.quadraticCurveTo(0, R * 0.46, R * 0.16, R * 0.36); c.stroke(); }
  }

  /* The Apple: Oranje Rups (a fictional party), Spiegelbol (Mirror Core) */
  function drawOranje27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#ffb070', '#f06a12', '#7a2a04'], vein: 'rgba(255,220,160,0.15)', hl: 'rgba(255,255,255,0.45)', out: '#3a1404',
      inside(c, R) { sash27(c, R, '#ffffff', '#f06a12'); } });
    if (st.face !== false) drawAppleFace(c, R, st);
    drawStem(c, R, st.leaf || 0, 0);
    rosette27(c, R * 0.55, R * 0.42, R, '#e8742a', t);
    // a tiny campaign flag in the stem
    c.strokeStyle = '#3a2410'; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.3, -R * 0.62); c.lineTo(-R * 0.36, -R * 1.4); c.stroke();
    c.fillStyle = '#e8742a'; c.beginPath(); c.moveTo(-R * 0.36, -R * 1.4); c.quadraticCurveTo(-R * 0.6, -R * 1.34 + Math.sin(t * 5) * R * 0.04, -R * 0.84, -R * 1.38); c.lineTo(-R * 0.82, -R * 1.12); c.quadraticCurveTo(-R * 0.6, -R * 1.1, -R * 0.35, -R * 1.14); c.closePath(); c.fill();
  }
  function drawMirror27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#f2f4f8', '#a8b0c0', '#3a4050'], vein: 'rgba(0,0,0,0)', hl: 'rgba(255,255,255,0.6)', out: '#1a1e28',
      inside(c, R) {
        const s = R * 0.22;
        for (let y = -R * 1.1; y < R * 1.1; y += s) for (let x = -R * 1.1; x < R * 1.1; x += s) {
          const k = 0.5 + 0.5 * Math.sin(t * 3 + x * 0.9 + y * 1.3);
          c.fillStyle = `hsla(${(200 + x * 9 + t * 40) % 360},${30 + k * 50}%,${55 + k * 35}%,0.85)`; c.fillRect(x + 0.4, y + 0.4, s - 0.8, s - 0.8);
        }
        c.strokeStyle = 'rgba(30,34,44,0.6)'; c.lineWidth = lw27(R, 0.02);
        for (let y = -R * 1.1; y < R * 1.1; y += s) { c.beginPath(); c.moveTo(-R * 1.2, y); c.lineTo(R * 1.2, y); c.stroke(); }
        for (let x = -R * 1.1; x < R * 1.1; x += s) { c.beginPath(); c.moveTo(x, -R * 1.2); c.lineTo(x, R * 1.2); c.stroke(); }
      } });
    sparkle(c, R * 0.5, -R * 0.5, R * (0.18 + 0.08 * Math.sin(t * 7)), '#ffffff');
    sparkle(c, -R * 0.6, R * 0.4, R * (0.12 + 0.06 * Math.sin(t * 5 + 1)), '#ffffff');
    if (st.face !== false) drawAppleFace(c, R, st);
    c.strokeStyle = '#8a8f9a'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(0, -R * 0.6); c.lineTo(0, -R * 1.5); c.stroke();
    c.fillStyle = '#c9ccd6'; rrect(c, -R * 0.12, -R * 0.72, R * 0.24, R * 0.14, R * 0.03); c.fill();
  }

  /* Appelgameplay: Paarse Pluis (a purple scribble fur ball), Blauw Boven (a fictional party) */
  function drawPluis27(c, R, st) {
    const t = st.t || 0;
    // the fur: hundreds of scribbled loops, dark on the outside, glowing in the middle
    c.save();
    const g = c.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.25);
    g.addColorStop(0, '#f6c8ff'); g.addColorStop(0.55, '#b060e8'); g.addColorStop(1, '#2a0a3a');
    c.fillStyle = g; circle(c, 0, 0, R * 1.12);
    c.lineWidth = lw27(R, 0.018);
    for (let i = 0; i < 140; i++) {
      const a = rnd24(i) * TAU, d = Math.sqrt(rnd24(i + 300)) * R * 1.05, x = Math.cos(a) * d, y = Math.sin(a) * d, r = R * (0.06 + rnd24(i + 600) * 0.14);
      const edge = d / (R * 1.05);
      c.strokeStyle = edge > 0.72 ? `rgba(20,6,30,${0.5 + rnd24(i + 9) * 0.4})` : `rgba(255,220,255,${0.25 + rnd24(i + 7) * 0.3})`;
      c.beginPath(); c.arc(x + Math.sin(t * 2 + i) * R * 0.01, y, r, rnd24(i + 2) * TAU, rnd24(i + 2) * TAU + 4); c.stroke();
    }
    // a few hot colored fringes around the rim
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU + 0.3; c.strokeStyle = ['#ff2ad8', '#2a3aff', '#ff3a3a'][i % 3]; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.arc(0, 0, R * 1.12, a, a + 0.18); c.stroke(); }
    c.restore();
    bites24(c, R, st);
    if (st.face !== false) {
      const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx = clamp(st.lookX || 0, -1, 1);
      for (const s of [-1, 1]) {
        const x = s * R * 0.32, y = -R * 0.12;
        glowDot(c, x, y, R * 0.42, '#ffffff', 0.55); c.fillStyle = '#ffffff'; ell(c, x, y, R * 0.22, R * 0.24 * open); c.fill();
        if (open > 0.3) { c.fillStyle = '#7a7088'; circle(c, x + lx * R * 0.06, y + R * 0.02, R * 0.07); }
      }
      c.fillStyle = '#12061a'; ell(c, 0, R * 0.38, R * (st.hurt > 0 || st.mouthOpen ? 0.32 : 0.28), R * (st.hurt > 0 || st.mouthOpen ? 0.2 : 0.11)); c.fill();
      c.strokeStyle = 'rgba(18,6,26,0.6)'; c.lineWidth = lw27(R, 0.02); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc((rnd24(i + 77) - 0.5) * R * 0.5, R * 0.38, R * 0.12, i, i + 3); c.stroke(); }
    }
  }
  function drawBlauw27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#7ab0ff', '#2a6ad8', '#0a1e5a'], vein: 'rgba(200,220,255,0.12)', hl: 'rgba(255,255,255,0.45)', out: '#06123a',
      inside(c, R) {
        // a navy suit with a white collar and a striped tie
        c.fillStyle = '#16204a'; c.beginPath(); c.moveTo(-R * 1.3, R * 0.72); c.lineTo(-R * 0.18, R * 0.66); c.lineTo(0, R * 1.3); c.lineTo(R * 0.18, R * 0.66); c.lineTo(R * 1.3, R * 0.72); c.lineTo(R * 1.3, R * 1.3); c.lineTo(-R * 1.3, R * 1.3); c.closePath(); c.fill();
        c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(-R * 0.18, R * 0.66); c.lineTo(0, R * 0.78); c.lineTo(R * 0.18, R * 0.66); c.lineTo(R * 0.08, R * 1.05); c.lineTo(-R * 0.08, R * 1.05); c.closePath(); c.fill();
        c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(-R * 0.05, R * 0.76); c.lineTo(R * 0.05, R * 0.76); c.lineTo(R * 0.08, R * 1.05); c.lineTo(0, R * 1.12); c.lineTo(-R * 0.08, R * 1.05); c.closePath(); c.fill();
      } });
    drawMullet(c, R);
    if (st.face !== false) drawAppelFace(c, R, st);
    drawAppelStem(c, R, st.leaf || 0, st.twin);
    rosette27(c, -R * 0.62, R * 0.62, R * 0.85, '#2a6ad8', t);
  }

  /* The Rotten Apple: Groen Grondje (a fictional party), Kortsluiting (Static Pips) */
  function drawGroen27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#a8e078', '#3aa84a', '#0e3a14'], vein: 'rgba(220,255,200,0.14)', hl: 'rgba(255,255,255,0.35)', out: '#06200a',
      inside(c, R) {
        c.fillStyle = 'rgba(90,60,30,0.85)'; c.beginPath(); c.moveTo(-R * 1.3, R * 0.7); for (let i = 0; i <= 10; i++) c.lineTo(-R * 1.3 + i * R * 0.26, R * (0.66 + Math.sin(i * 1.7) * 0.06)); c.lineTo(R * 1.3, R * 1.3); c.lineTo(-R * 1.3, R * 1.3); c.closePath(); c.fill();
        c.fillStyle = 'rgba(30,90,30,0.55)'; for (const [x, y, r] of [[-0.5, 0.25, 0.18], [0.45, -0.3, 0.14]]) circle(c, x * R, y * R, r * R);
      } });
    if (st.face !== false) drawRotFace(c, R, st);
    // sprouts coming up out of the soil line, and a party rosette
    for (const x of [-0.5, 0, 0.45]) { c.strokeStyle = '#2a7a1a'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(x * R, R * 0.7); c.lineTo(x * R, R * 0.48); c.stroke(); leafShape(c, x * R, R * 0.52, R * 0.2, -0.6 + Math.sin(t * 2 + x) * 0.2); }
    drawStem(c, R, st.leaf || 0, 0);
    drawRotWorm(c, R, t);
    rosette27(c, -R * 0.62, -R * 0.3, R * 0.8, '#3aa84a', t);
  }
  function drawStatic27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#c0e8ff', '#3a7ad0', '#0a1a3a'], vein: 'rgba(200,240,255,0.18)', hl: 'rgba(255,255,255,0.5)', out: '#04102a',
      inside(c, R) {
        c.strokeStyle = 'rgba(160,230,255,0.6)'; c.lineWidth = lw27(R, 0.03);
        for (let i = 0; i < 6; i++) { const ph = Math.floor(t * 8 + i); c.beginPath(); let x = (rnd24(ph) - 0.5) * R * 1.6, y = -R; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd24(ph + k * 7) - 0.5) * R * 0.4; y += R * 0.35; c.lineTo(x, y); } c.stroke(); }
      } });
    if (st.face !== false) { drawRotFace(c, R, st); }
    // hair standing straight up, crackling
    for (let i = 0; i < 9; i++) { const x = (i - 4) * R * 0.16, h = R * (0.35 + rnd24(i + Math.floor(t * 10)) * 0.2); c.strokeStyle = '#1a2a4a'; c.lineWidth = lw27(R, 0.07); c.beginPath(); c.moveTo(x, -R * 0.7); c.lineTo(x + (rnd24(i) - 0.5) * R * 0.1, -R * 0.7 - h); c.stroke(); }
    const bolt = (x, y, s) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.4, y + s * 0.5); c.lineTo(x + s * 0.1, y + s * 0.55); c.lineTo(x + s * 0.5, y + s * 1.1); };
    for (const [x, y] of [[-R * 1.15, -R * 0.4], [R * 0.95, R * 0.1]]) { if (Math.sin(t * 13 + x) < 0.2) continue; c.strokeStyle = '#1c3a5a'; c.lineWidth = lw27(R, 0.14); bolt(x, y, R * 0.5); c.stroke(); c.strokeStyle = '#bfe8ff'; c.lineWidth = lw27(R, 0.07); bolt(x, y, R * 0.5); c.stroke(); }
    drawRotWorm(c, R, t);
  }

  /* Krullenbol: Snoepjas (a candy shell), Kroket */
  function drawCandy27(c, R, st) {
    const t = st.t || 0, cols = [['#ff7a8a', '#e8203a', '#6a0814'], ['#7ab0ff', '#1a5ad8', '#061a5a'], ['#9ae86a', '#2aa83a', '#063a10'], ['#ffe07a', '#f2b81e', '#6a4a04']];
    const P = cols[Math.floor(t / 2.5) % cols.length];
    skinBody24(c, R, st, { g: P, vein: 'rgba(0,0,0,0)', hl: 'rgba(255,255,255,0.0)', out: '#1a0a06', cyan: false,
      inside(c, R) { c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, -R * 0.4, -R * 0.45, R * 0.42, R * 0.2, -0.5); c.fill(); c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, R * 0.5, R * 0.5, R * 0.2, R * 0.08, -0.5); c.fill(); } });
    if (st.face !== false) drawKrulFace(c, R, st);
    // hard candy curls in the same color
    const curls = [[-0.62, -0.98, 0.27], [-0.24, -1.06, 0.28], [0.14, -1.04, 0.28], [0.5, -0.94, 0.27], [-0.88, -0.74, 0.25], [-0.46, -0.8, 0.26], [-0.05, -0.84, 0.27], [0.34, -0.8, 0.26], [0.78, -0.72, 0.25]];
    c.fillStyle = '#1a0a06'; for (const [x, y, r] of curls) circle(c, x * R, y * R, (r + 0.05) * R);
    curls.forEach(([x, y, r], i) => { c.fillStyle = cols[i % 4][1]; circle(c, x * R, y * R, r * R); c.fillStyle = 'rgba(255,255,255,0.5)'; circle(c, (x - r * 0.35) * R, (y - r * 0.35) * R, r * R * 0.28); });
    drawKrulGlasses(c, R);
  }
  function drawKroket27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#f0b860', '#c47a22', '#5a2c06'], vein: 'rgba(0,0,0,0)', hl: 'rgba(255,240,200,0.3)', out: '#3a1a04',
      inside(c, R) {
        // the crumb crust
        for (let i = 0; i < 160; i++) { const x = (rnd24(i + 11) - 0.5) * R * 2.2, y = (rnd24(i + 211) - 0.5) * R * 2.2; c.fillStyle = i % 3 ? 'rgba(120,60,10,0.45)' : 'rgba(255,220,150,0.45)'; c.fillRect(x, y, R * 0.07, R * 0.05); }
        // a bite of ragout showing through, steaming
        c.fillStyle = '#d8b48a'; ell(c, R * 0.55, R * 0.55, R * 0.28, R * 0.2, -0.4); c.fill();
      } });
    for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i * 0.33) % 1; c.strokeStyle = `rgba(255,255,255,${0.4 * (1 - ph)})`; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(R * (0.5 + i * 0.1), R * 0.4 - ph * R * 0.9); c.quadraticCurveTo(R * (0.62 + i * 0.1), R * 0.2 - ph * R * 0.9, R * (0.5 + i * 0.1), -ph * R * 0.9); c.stroke(); }
    if (st.face !== false) drawKrulFace(c, R, st);
    drawKrulGlasses(c, R);
    drawKrulHair(c, R, st.leaf || 0);
    // a dab of mustard on the side
    c.fillStyle = '#f2c81e'; ell(c, -R * 0.75, R * 0.55, R * 0.16, R * 0.1, 0.3); c.fill(); c.strokeStyle = '#8a6a04'; c.lineWidth = lw27(R, 0.03); c.stroke();
  }

  /* Mikappols: IJsblok (Frost Pips), Wormen Eerst (a fictional party) */
  function mikaFace27(c, R, st, col) {
    if (st.face === false) return;
    c.fillStyle = col; circle(c, -R * 0.34, R * 0.04, R * 0.11); circle(c, R * 0.3, -R * 0.1, R * 0.11);
    c.strokeStyle = col; c.lineWidth = R * 0.11; c.lineCap = 'round'; c.beginPath(); c.moveTo(R * 0.02, R * 0.44); c.lineTo(R * 0.5, R * 0.44); c.stroke();
  }
  function mikaBody27(c, R, st, fill, out, inside) {
    mikaPath(c, R); c.fillStyle = fill; c.fill();
    c.save(); mikaPath(c, R); c.clip(); if (inside) inside(c, R); c.restore();
    mikaPath(c, R); c.strokeStyle = out; c.lineWidth = Math.max(1, R * 0.09); c.stroke();
    if (st.bites && st.bites.length) {
      c.globalCompositeOperation = 'source-atop'; for (const b of st.bites) { c.fillStyle = '#dfe8f8'; biteShape(c, R * 1.08, b.a, 1.38); c.fill(); }
      c.globalCompositeOperation = 'destination-out'; for (const b of st.bites) { biteShape(c, R * 1.08, b.a, 1); c.fill(); }
      c.globalCompositeOperation = 'source-over';
    }
  }
  function drawIce27(c, R, st) {
    const t = st.t || 0;
    const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, 'rgba(230,248,255,0.95)'); g.addColorStop(1, 'rgba(120,190,240,0.9)');
    mikaBody27(c, R, st, g, '#2a6a9a', (c, R) => {
      // the blue apple frozen inside the block
      c.fillStyle = 'rgba(26,60,220,0.45)'; rrect(c, -R * 0.66, -R * 0.6, R * 1.32, R * 1.24, R * 0.3); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = lw27(R, 0.03);
      for (const [x0, y0, x1, y1] of [[-0.9, -0.3, -0.4, 0.1], [-0.4, 0.1, -0.5, 0.5], [0.5, -0.9, 0.3, -0.4], [0.3, -0.4, 0.7, -0.2]]) { c.beginPath(); c.moveTo(x0 * R, y0 * R); c.lineTo(x1 * R, y1 * R); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.moveTo(-R * 0.9, -R * 0.85); c.lineTo(-R * 0.3, -R * 0.85); c.lineTo(-R * 0.9, -R * 0.2); c.closePath(); c.fill();
    });
    mikaFace27(c, R, st, '#ffffff');
    // icicles under the bottom edge, and frost breath
    c.fillStyle = 'rgba(220,245,255,0.9)'; for (const x of [-0.6, -0.2, 0.3, 0.65]) { c.beginPath(); c.moveTo((x - 0.08) * R, R * 0.92); c.lineTo((x + 0.08) * R, R * 0.92); c.lineTo(x * R, R * (1.15 + rnd24(x * 10 + 5) * 0.15)); c.closePath(); c.fill(); }
    sparkle(c, R * 0.7, -R * 0.75, R * (0.14 + 0.05 * Math.sin(t * 6)), '#ffffff');
  }
  function drawPaars27(c, R, st) {
    const t = st.t || 0;
    const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#b06aff'); g.addColorStop(1, '#4a1a8a');
    mikaBody27(c, R, st, g, '#1a0634', (c, R) => {
      c.fillStyle = 'rgba(255,255,255,0.18)'; ell(c, -R * 0.5, -R * 0.55, R * 0.5, R * 0.3, -0.4); c.fill();
      c.fillStyle = '#f2f0ea'; c.fillRect(-R * 1.1, R * 0.62, R * 2.2, R * 0.5);
      c.fillStyle = '#8a3ad8'; c.fillRect(-R * 1.1, R * 0.62, R * 2.2, R * 0.06);
    });
    mikaFace27(c, R, st, '#ffffff');
    // a worm with a party hat, waving a little purple flag
    c.save(); c.translate(R * 0.86, -R * 0.78);
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#e9899a' : '#f095a5'; circle(c, -i * R * 0.12, i * R * 0.1 + Math.sin(t * 4 + i) * R * 0.03, R * 0.1); }
    c.fillStyle = '#8a3ad8'; c.beginPath(); c.moveTo(-R * 0.1, -R * 0.06); c.lineTo(R * 0.1, -R * 0.06); c.lineTo(0, -R * 0.36); c.closePath(); c.fill();
    c.fillStyle = '#1a0a0e'; circle(c, R * 0.03, -R * 0.01, R * 0.025);
    c.restore();
    rosette27(c, -R * 0.62, -R * 0.6, R * 0.8, '#8a3ad8', t);
  }

  /* Peanapple: Woedeaanval (the rage curse), Klompen */
  function drawRage27(c, R, st) {
    const t = st.t || 0;
    drawPean(c, R, st);
    // flushed red all over, veins, steam out of both ears
    c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(220,30,20,0.45)'; c.fillRect(-R * 2, -R * 2, R * 4, R * 4); c.restore();
    c.strokeStyle = 'rgba(120,0,10,0.75)'; c.lineWidth = lw27(R, 0.04);
    for (const [x, y, s] of [[-0.55, -0.45, 1], [0.6, -0.4, -1]]) { c.beginPath(); c.moveTo(x * R, y * R); c.lineTo((x + s * 0.08) * R, (y + 0.08) * R); c.lineTo(x * R, (y + 0.12) * R); c.moveTo((x + s * 0.08) * R, (y + 0.08) * R); c.lineTo((x + s * 0.16) * R, (y + 0.06) * R); c.stroke(); }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const ph = (t * 1.6 + i * 0.33) % 1;
      c.fillStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; circle(c, s * R * (0.95 + ph * 0.4), -R * (0.75 + ph * 0.5), R * (0.1 + ph * 0.18));
    }
    // angry brows over the eyes
    if (st.face !== false) { c.strokeStyle = '#1a0606'; c.lineWidth = lw27(R, 0.1); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.12, -R * 0.2); c.lineTo(s * R * 0.5, -R * 0.36); c.stroke(); } }
    // a ripped shirt collar: it got too small
    c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(-R * 0.7, R * 0.72); for (let i = 0; i <= 8; i++) c.lineTo(-R * 0.7 + i * R * 0.175, R * (0.72 + (i % 2 ? 0.12 : 0))); c.lineTo(R * 0.7, R * 0.95); c.lineTo(-R * 0.7, R * 0.95); c.closePath(); c.fill();
  }
  function drawKlomp27(c, R, st) {
    const t = st.t || 0;
    drawPean(c, R, st);
    // a white lace cap with the wings folded up at the sides
    c.fillStyle = '#fbf8f2'; c.strokeStyle = '#8a8478'; c.lineWidth = lw27(R, 0.035);
    c.beginPath(); c.moveTo(-R * 0.8, -R * 0.45); c.quadraticCurveTo(-R * 0.8, -R * 1.25, 0, -R * 1.22); c.quadraticCurveTo(R * 0.8, -R * 1.25, R * 0.8, -R * 0.45); c.quadraticCurveTo(0, -R * 0.62, -R * 0.8, -R * 0.45); c.closePath(); c.fill(); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.72, -R * 0.5); c.quadraticCurveTo(s * R * 1.1, -R * 0.56, s * R * 1.32, -R * 0.82); c.quadraticCurveTo(s * R * 1.0, -R * 0.92, s * R * 0.62, -R * 0.82); c.closePath(); c.fill(); c.stroke(); }
    c.strokeStyle = 'rgba(140,130,115,0.6)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, -R * 0.9, R * (0.12 + i * 0.07), Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // a red coral necklace and a tulip
    for (let i = 0; i <= 9; i++) { const u = i / 9; c.fillStyle = '#c3243a'; circle(c, (u - 0.5) * R * 1.1, R * 0.62 + Math.sin(u * Math.PI) * R * 0.14, R * 0.06); }
    c.save(); c.translate(R * 0.82, R * 0.3); c.rotate(0.3 + Math.sin(t * 2) * 0.06);
    c.strokeStyle = '#3a8a3a'; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(0, R * 0.4); c.lineTo(0, -R * 0.1); c.stroke();
    c.fillStyle = '#e8203a'; c.beginPath(); c.moveTo(-R * 0.14, -R * 0.1); c.lineTo(-R * 0.14, -R * 0.32); c.lineTo(-R * 0.06, -R * 0.22); c.lineTo(0, -R * 0.36); c.lineTo(R * 0.06, -R * 0.22); c.lineTo(R * 0.14, -R * 0.32); c.lineTo(R * 0.14, -R * 0.1); c.quadraticCurveTo(0, R * 0.02, -R * 0.14, -R * 0.1); c.fill();
    c.restore();
    // two wooden shoes peeking out underneath
    for (const s of [-1, 1]) { c.fillStyle = '#f2d24a'; c.strokeStyle = '#6a4a10'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.ellipse(s * R * 0.42, R * 0.98, R * 0.3, R * 0.12, s * 0.2, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#3a8a3a'; circle(c, s * R * 0.42, R * 0.96, R * 0.04); }
  }

  /* Apploa Vogels: Sterinsigne (purple star, gold ring), Deltaplan */
  function wings27(fill, tip, out) {
    return function (c, R, flap, behind) {
      for (const side of [-1, 1]) {
        c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.12 - flap);
        const L = R * 1.85;
        const wing = () => { c.beginPath(); c.moveTo(0, -R * 0.26); c.bezierCurveTo(L * 0.3, -R * 0.62, L * 0.72, -R * 0.56, L, -R * 0.16); c.quadraticCurveTo(L * 0.9, R * 0.06, L * 0.78, R * 0.04); c.quadraticCurveTo(L * 0.6, R * 0.24, L * 0.42, R * 0.2); c.quadraticCurveTo(L * 0.2, R * 0.36, 0, R * 0.24); c.closePath(); };
        const ops = [
          () => { wing(); c.fillStyle = fill; c.fill(); },
          () => { c.save(); wing(); c.clip(); c.fillStyle = tip; c.beginPath(); c.moveTo(L * 0.66, -R); c.lineTo(L * 1.2, -R); c.lineTo(L * 1.2, R); c.lineTo(L * 0.74, R); c.closePath(); c.fill(); c.restore(); },
          () => { wing(); c.strokeStyle = out; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke(); },
        ];
        if (behind) ops.reverse();
        for (const op of ops) op();
        c.restore();
      }
    };
  }
  const wingsStar27 = wings27('#6a12a0', '#e2b04e', '#1a0428'), wingsDelta27 = wings27('#bfe4ff', '#1a5ad8', '#0a2a4a');
  function apploa27(c, R, st, P) {
    const t = st.t || 0, fear = st.fear || 0;
    c.save(); c.translate(R * 0.55, -R * 0.55); c.rotate(0.5 + Math.sin(t * 3) * 0.08);
    c.fillStyle = P.hair2; ell(c, R * 0.3, R * 0.2, R * 0.28, R * 0.55, 0.3); c.fill(); c.fillStyle = P.hair; ell(c, R * 0.28, R * 0.12, R * 0.2, R * 0.46, 0.3); c.fill();
    c.restore();
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
    g.addColorStop(0, '#b0744a'); g.addColorStop(0.45, '#7a4426'); g.addColorStop(1, '#341a0c');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip(); if (P.inside) P.inside(c, R, t); c.restore();
    applePath(c, R); c.strokeStyle = '#1a0c04'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    c.fillStyle = P.hair;
    c.beginPath(); c.moveTo(-R * 0.98, -R * 0.12); c.quadraticCurveTo(-R * 1.0, -R * 1.02, 0, -R * 0.86); c.quadraticCurveTo(R * 1.0, -R * 1.02, R * 0.98, -R * 0.12);
    c.quadraticCurveTo(R * 0.75, -R * 0.55, R * 0.4, -R * 0.5); c.quadraticCurveTo(R * 0.2, -R * 0.34, 0, -R * 0.48); c.quadraticCurveTo(-R * 0.35, -R * 0.3, -R * 0.55, -R * 0.52); c.quadraticCurveTo(-R * 0.8, -R * 0.45, -R * 0.98, -R * 0.12);
    c.closePath(); c.fill(); c.strokeStyle = P.hair2; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
    if (P.top) P.top(c, R, t);
    if (st.face !== false) plainFace27(c, R, st, { iris: P.iris });
    if (!('chomp' in st)) { c.globalCompositeOperation = 'destination-over'; P.wings(c, R, Math.sin(t * 2) * 0.12, true); c.globalCompositeOperation = 'source-over'; }
  }
  function drawStar27(c, R, st) {
    apploa27(c, R, st, { hair: '#8a2ad8', hair2: '#3a0a5a', iris: '#8a2ad8', wings: wingsStar27,
      top(c, R, t) {
        // a round badge pinned to the chest: gold ring, purple star, black field
        c.save(); c.translate(-R * 0.55, R * 0.55); c.rotate(Math.sin(t * 2) * 0.1);
        c.fillStyle = '#e2b04e'; circle(c, 0, 0, R * 0.3); c.fillStyle = '#6a12a0'; circle(c, 0, 0, R * 0.25); c.fillStyle = '#0c0810'; circle(c, 0, 0, R * 0.2);
        c.fillStyle = '#8a2ad8'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.08 : R * 0.19; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
        c.restore();
        sparkle(c, R * 0.15, -R * 1.05, R * (0.14 + 0.05 * Math.sin(t * 5)), '#e2b04e');
      } });
  }
  function drawDelta27(c, R, st) {
    apploa27(c, R, st, { hair: '#e8c870', hair2: '#7a5a20', iris: '#1a5ad8', wings: wingsDelta27,
      inside(c, R, t) {
        // the water line rises and falls inside her
        c.fillStyle = 'rgba(40,120,220,0.5)'; c.beginPath(); c.moveTo(-R * 1.3, R * 0.5); for (let i = 0; i <= 12; i++) c.lineTo(-R * 1.3 + i * R * 0.22, R * (0.45 + Math.sin(t * 3 + i) * 0.05)); c.lineTo(R * 1.3, R * 1.3); c.lineTo(-R * 1.3, R * 1.3); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 4; i++) circle(c, (rnd24(i + 3) - 0.5) * R * 1.4, R * (0.7 + ((t * 0.5 + rnd24(i)) % 1) * -0.25), R * 0.04);
      },
      top(c, R, t) {
        // diving goggles pushed up on the forehead
        c.strokeStyle = '#1a2a4a'; c.lineWidth = lw27(R, 0.08); c.beginPath(); c.moveTo(-R * 0.98, -R * 0.5); c.lineTo(R * 0.98, -R * 0.5); c.stroke();
        for (const s of [-1, 1]) { c.fillStyle = 'rgba(160,220,255,0.8)'; rrect(c, s > 0 ? R * 0.04 : -R * 0.5, -R * 0.66, R * 0.46, R * 0.3, R * 0.1); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = lw27(R, 0.05); c.stroke(); }
      } });
  }

  /* Lucifappel: Kort Lontje (Short Fuse), Afterparty (the Hellclub) */
  function drawBomb27(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#6a6a78', '#24242c', '#08080c'], vein: 'rgba(255,255,255,0.05)', hl: 'rgba(255,255,255,0.45)', out: '#000000',
      inside(c, R) { c.fillStyle = '#d5232f'; c.fillRect(-R * 1.3, R * 0.55, R * 2.6, R * 0.16); c.fillStyle = '#e2b04e'; c.fillRect(-R * 1.3, R * 0.58, R * 2.6, R * 0.03); } });
    // the cap and the fuse, burning down a little and starting over
    c.fillStyle = '#3a3a44'; rrect(c, -R * 0.2, -R * 0.82, R * 0.4, R * 0.22, R * 0.04); c.fill(); c.strokeStyle = '#000'; c.lineWidth = lw27(R, 0.05); c.stroke();
    const burn = (t * 0.25) % 1, L = 1 - burn * 0.5;
    c.strokeStyle = '#c8a070'; c.lineWidth = lw27(R, 0.07); c.beginPath(); c.moveTo(0, -R * 0.82);
    const ex = R * 0.35 * L, ey = -R * (0.82 + 0.6 * L); c.quadraticCurveTo(-R * 0.15, -R * (0.82 + 0.4 * L), ex, ey); c.stroke();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 9; c.strokeStyle = i % 2 ? '#ffd36a' : '#ff6a1a'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * R * 0.2, ey + Math.sin(a) * R * 0.2); c.stroke(); }
    glowDot(c, ex, ey, R * 0.35, '#ffb44a', 0.6);
    if (st.face !== false) plainFace27(c, R, st, { white: '#ffd23a', iris: '#d5232f', angry: true, grin: true });
  }
  function drawAfter27(c, R, st) {
    const t = st.t || 0, beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * (140 / 60) / 2)), 8);
    drawLucif26(c, R, st);
    // big headphones, neon under the box, a horn of light on every beat
    c.strokeStyle = '#0e0a08'; c.lineWidth = R * 0.18; c.beginPath(); c.arc(0, -R * 0.15, R * 1.08, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    c.strokeStyle = '#ff3a2a'; c.lineWidth = R * 0.05; c.stroke();
    for (const s of [-1, 1]) { c.fillStyle = '#16100c'; rrect(c, s * R * 1.08 - R * 0.17, -R * 0.4, R * 0.34, R * 0.5, R * 0.12); c.fill(); c.fillStyle = `rgba(255,58,42,${0.5 + beat * 0.5})`; circle(c, s * R * 1.08, -R * 0.15, R * 0.09); }
    glowDot(c, 0, R * 1.0, R * 1.0, '#ff3ad8', 0.25 + beat * 0.35);
    // dark shades over the label face
    if (st.face !== false) { c.fillStyle = '#0c0810'; for (const s of [-1, 1]) { rrect(c, s > 0 ? R * 0.06 : -R * 0.46, -R * 0.06, R * 0.4, R * 0.2, R * 0.06); c.fill(); } c.fillRect(-R * 0.08, -R * 0.02, R * 0.16, R * 0.04); c.fillStyle = 'rgba(255,58,216,0.7)'; c.fillRect(-R * 0.4, -R * 0.03, R * 0.14, R * 0.03); c.fillRect(R * 0.12, -R * 0.03, R * 0.14, R * 0.03); }
  }

  /* ------------------------------------------------------------------ the catalogue */
  const SKINS1 = {
    apple: { name: 'Granny Smith', line: 'Green, sour, and has seen worse. Knits between rooms.', draw: drawGranny24,
      bg: ['#24301a', '#0e140a'], motif: 'knit', acc: '#8cc63f' },
    appel: { name: 'Streamer Setup', line: 'Live at all hours. Headset on, mullet dyed, chat says hi.', draw: drawStreamer24,
      bg: ['#2a1240', '#0a0614'], motif: 'rgb', acc: '#ff5aa8' },
    rot: { name: 'Schimmelkoning', line: 'Further gone than ever. The mushrooms elected him.', draw: drawMould24,
      bg: ['#1e2214', '#090a06'], motif: 'spores', acc: '#c8d8e0' },
    krul: { name: 'Zomerkrul', line: 'Back from Texel with a shirt nobody asked for.', draw: drawZomer24,
      bg: ['#ff9a5a', '#3a1a40'], motif: 'beach', acc: '#ffcf4a' },
    mika: { name: 'Delfts Blauw', line: 'Hand painted, glazed twice. Do not drop him.', draw: (c, R, st) => drawMikaDelft24(c, R, st),
      bg: ['#e9edf5', '#b8c4dc'], motif: 'tiles', acc: '#1d3f9a', light: true },
    pean: { name: 'Driekleur', line: 'Abyssinian coat. Three colours, rosettes everywhere. Still scared.', draw: (c, R, st) => drawPeanTri24(c, R, st),
      bg: ['#3a3018', '#14100a'], motif: 'hay', acc: '#d9822e' },
    apploa: { name: 'Koningsdag', line: 'Orange hair, a flag on each cheek, wings dipped in paint. Back home by Tuesday.', draw: (c, R, st) => drawApploaOranje24(c, R, st),
      bg: ['#ff8a1e', '#5a1e06'], motif: 'bunting', acc: '#ff7a12', wings: drawGullWingsOranje24 },
  };
  // v11.6: every apple holds a list of skins; index 0 is the original look
  const SKINS = {};
  for (const id in SKINS1) SKINS[id] = [SKINS1[id]];
  const MORE26 = {
    apple: { name: 'Kermisappel', line: 'Dipped in toffee, rolled in hagelslag, stuck on a stick. The fair left years ago.', draw: drawKermis26,
      bg: ['#5a1418', '#1a0606'], motif: 'fair', acc: '#ff9a3a' },
    appel: { name: 'Capybara', line: 'A capybara onesie and a yuzu on top. Nothing bothers him. Not even this.', draw: drawCapy26,
      bg: ['#3a5a2a', '#101a0a'], motif: 'yuzu', acc: '#ffb43a' },
    rot: { name: 'Zonnebloem', line: 'Something grew out of the compost. Sunflower on the outside, rotten on the inside.', draw: drawSun26,
      bg: ['#3a4a6a', '#141a24'], motif: 'petals', acc: '#ffd23a' },
    krul: { name: 'Stroopkrul', line: 'Two thin waffles, syrup in the middle, curls on top. Best warm, on a cup of tea.', draw: drawWafel26,
      bg: ['#5a3010', '#1a0c04'], motif: 'waffle', acc: '#e8a040' },
    mika: { name: 'Klokwerk', line: 'A pocket watch that runs a quarter slow. Same face as always.', draw: drawClock26,
      bg: ['#1a1e2a', '#08090e'], motif: 'cogs', acc: '#e8c45a' },
    pean: { name: 'Rave Cavia', line: 'Shades, glow sticks, a headband that blinks. Still scared, now in neon.', draw: drawRave26,
      bg: ['#1a0a2a', '#05020a'], motif: 'lasers', acc: '#ff3ad8' },
    apploa: { name: 'Feniks', line: 'Hair on fire, wings on fire. Came back from the ashes once already.', draw: drawFenix26,
      bg: ['#5a1606', '#140402'], motif: 'embers', acc: '#ff6a1a', wings: drawFenixWings26 },
    lucif: { name: 'Lucifer', line: 'Swept gold horns, bat wings, a spade tail and a trident of three lit matches. He is printed on every box. Nobody ever asked him to leave.', draw: drawLucifer134,
      bg: ['#2a0606', '#0a0202'], motif: 'hellbox', acc: '#e2b04e' },
  };
  for (const id in MORE26) (SKINS[id] || (SKINS[id] = [])).push(MORE26[id]);
  const MORE27 = {
    apple: [
      { name: 'Oranje Rups', line: 'Campaigning for the orange party. Rosette, sash, a flag in the stem. Promises nothing, delivers less.', draw: drawOranje27, bg: ['#ff8a1e', '#5a1e06'], motif: 'confetti', mcol: ['#e8742a', '#ffffff', '#ffd23a'], acc: '#e8742a' },
      { name: 'Spiegelbol', line: 'Mirror Core, all over. Every tile throws the light back. Disco never died down here.', draw: drawMirror27, bg: ['#1a1030', '#06040c'], motif: 'lasers', acc: '#c9d4ff' },
    ],
    appel: [
      { name: 'Paarse Pluis', line: 'A ball of purple scribbles with two lights for eyes. Nobody knows what is under there. Neither does he.', draw: drawPluis27, bg: ['#1a0624', '#000000'], motif: 'fuzz', acc: '#d27bff' },
      { name: 'Blauw Boven', line: 'Navy suit, gold tie, blue rosette. The mullet stays. On the list, number two.', draw: drawBlauw27, bg: ['#2a6ad8', '#0a1a4a'], motif: 'confetti', mcol: ['#2a6ad8', '#ffffff', '#ffd23a'], acc: '#4a8aff' },
    ],
    rot: [
      { name: 'Groen Grondje', line: 'Runs for the green party. Sprouts in the soil, a rosette on the chest. Still rotten, now sustainably.', draw: drawGroen27, bg: ['#2a5a1a', '#0a1a06'], motif: 'confetti', mcol: ['#3aa84a', '#ffffff', '#a8e078'], acc: '#3aa84a' },
      { name: 'Kortsluiting', line: 'Static Pips went in, hair went up. Blue, crackling, slightly smoking.', draw: drawStatic27, bg: ['#0a1430', '#02040c'], motif: 'spark', acc: '#9fd8ff' },
    ],
    krul: [
      { name: 'Snoepjas', line: 'A hard candy shell that changes color every few seconds. Crunchy outside, laughing inside.', draw: drawCandy27, bg: ['#3a1040', '#10040e'], motif: 'confetti', mcol: ['#e8203a', '#1a5ad8', '#2aa83a', '#f2b81e'], acc: '#ff5a8a' },
      { name: 'Kroket', line: 'Breaded, deep fried, steaming, mustard on the side. From the wall, 2 euro 50.', draw: drawKroket27, bg: ['#5a3a10', '#1a0e04'], motif: 'crumbs', acc: '#e8a040' },
    ],
    mika: [
      { name: 'IJsblok', line: 'Frost Pips, taken too far. Frozen in a block with icicles. Same face, colder.', draw: drawIce27, bg: ['#cfe8f8', '#7aaed8'], motif: 'flakes', acc: '#2a6a9a', light: true },
      { name: 'Wormen Eerst', line: 'Purple, with a worm in a party hat on his shoulder. Worms first. He agreed without a face.', draw: drawPaars27, bg: ['#3a1060', '#0e0420'], motif: 'confetti', mcol: ['#8a3ad8', '#ffffff', '#e9899a'], acc: '#b06aff' },
    ],
    pean: [
      { name: 'Woedeaanval', line: 'The rage curse. Red all over, steam out of both ears, shirt torn. Still scared, now loudly.', draw: drawRage27, bg: ['#5a0806', '#140202'], motif: 'embers', acc: '#ff3a2a' },
      { name: 'Klompen', line: 'Lace cap, coral beads, a tulip and wooden shoes. Ready for the tourists. Hates the tourists.', draw: drawKlomp27, bg: ['#e9edf5', '#b8c4dc'], motif: 'tiles', acc: '#c3243a', light: true },
    ],
    apploa: [
      { name: 'Sterinsigne', line: 'Purple wings with gold tips, purple hair, a star badge on the chest. Ranked. Nobody said in what.', draw: drawStar27, bg: ['#2a0a40', '#08020e'], motif: 'stars', acc: '#e2b04e', wings: wingsStar27 },
      { name: 'Deltaplan', line: 'Goggles up, water inside, wings the color of a dike in the rain. Keeps her head above it.', draw: drawDelta27, bg: ['#1a4a7a', '#06142a'], motif: 'waves', acc: '#7ac8ff', wings: wingsDelta27 },
    ],
    lucif: [
      { name: 'Kort Lontje', line: 'Short Fuse in apple form. Black, round, a fuse that burns down and starts over. Does not take jokes.', draw: drawBomb27, bg: ['#2a1a10', '#080402'], motif: 'embers', acc: '#ffb44a' },
      { name: 'Afterparty', line: 'Back from the Hellclub. Headphones, shades, neon under the box. Still lit.', draw: drawAfter27, bg: ['#1a0420', '#05010a'], motif: 'lasers', acc: '#ff3ad8' },
    ],
  };
  for (const id in MORE27) for (const S of MORE27[id]) (SKINS[id] || (SKINS[id] = [])).push(S);
  /* ------------------------------------------------------------------ v12.2: epic skins, grotesque skins, Lucky
     The flat recolors are gone, every skin left gets an aura, light rays and its own particles,
     every apple gets one grotesque look, and Lucky gets two. Old saves keep the skin they wore. */
  const OLD122 = {};
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
    lucif: { name: 'Smeltkop', tier: 'Grotesque', line: 'Struck one time too many. The box went to wax and the wax keeps running. The match is still lit. Nobody told him.', draw: drawMelt134, bg: ['#2a0604', '#080100'], motif: 'hellbox', acc: '#ff5a1a' },
  };
  for (const id in NEW122) (SKINS[id] || (SKINS[id] = [])).push(NEW122[id]);
  SKINS.lucky = [
    { name: 'Jackpot', tier: 'Epic', line: 'A slot machine with a stem. Three sevens for eyes, the third one never stops. The house always wins. He is the house.', draw: drawJackpot122, bg: ['#3a2004', '#0e0802'], motif: 'fair', acc: '#ffd84a' },
    { name: 'Snake Eyes', tier: 'Grotesque', line: 'Two dice for eyes, both on one. Mouth sewn shut, cards in the skull, a chip in the cheek. Bad night.', draw: drawSnakeEyes122, bg: ['#1a0624', '#060208'], motif: 'lasers', acc: '#b06aff' },
  ];

  /* ------------------------------------------------------------------ v13.2: Grotesque II
     A second grotesque look for every apple, each one stolen from something in the game:
     a lamprey, the kapsalon, Ouroboros, the supermarket, De Tellie, the Block Worm, the lobby,
     the BP pump and the slot machine. */

  /* The Apple: Prikmond. The face is a lamprey mouth */
  function drawPrik132(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#f2b4b8', '#a83a50', '#2a0612'], vein: 'rgba(255,200,210,0.16)', hl: 'rgba(255,240,245,0.5)', out: '#1a0408',
      inside(c, R) {
        // gill slits down both sides, they open and close
        for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
          const y = -R * 0.34 + i * R * 0.14, o = 0.5 + 0.5 * Math.sin(t * 3 + i * 0.7);
          ell(c, s * R * 0.8, y, R * 0.05, R * (0.02 + 0.03 * o), s * 0.3); c.fillStyle = '#3a0612'; c.fill();
        }
        c.strokeStyle = 'rgba(255,230,240,0.3)'; c.lineWidth = lw27(R, 0.03);
        for (const x of [-0.4, 0.1, 0.5]) { c.beginPath(); c.moveTo(x * R, -R * 0.7); c.quadraticCurveTo(x * R + R * 0.1, -R * 0.2, x * R - R * 0.05, R * 0.2); c.stroke(); }
      } });
    if (st.face !== false) {
      const my = R * 0.2, open = st.hurt > 0 || st.mouthOpen ? 1.12 : 1 + Math.sin(t * 2.4) * 0.04;
      c.save(); c.translate(0, my); c.scale(open, open);
      c.fillStyle = '#c25a6a'; circle(c, 0, 0, R * 0.56);
      c.strokeStyle = '#3a0610'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.arc(0, 0, R * 0.56, 0, TAU); c.stroke();
      c.fillStyle = '#4a0814'; circle(c, 0, 0, R * 0.47);
      for (let k = 0; k < 3; k++) {
        const r = R * (0.45 - k * 0.12), n = 14 - k * 3, rot = t * (0.25 + k * 0.18) * (k % 2 ? -1 : 1), h = R * (0.11 - k * 0.02);
        c.fillStyle = k ? '#e8dcc0' : '#f6eedc'; c.strokeStyle = '#2a0608'; c.lineWidth = lw27(R, 0.015);
        for (let i = 0; i < n; i++) {
          const a = rot + (i / n) * TAU, w = 0.13;
          c.beginPath(); c.moveTo(Math.cos(a - w) * r, Math.sin(a - w) * r); c.lineTo(Math.cos(a) * (r - h), Math.sin(a) * (r - h)); c.lineTo(Math.cos(a + w) * r, Math.sin(a + w) * r); c.closePath(); c.fill(); c.stroke();
        }
      }
      c.fillStyle = '#0a0102'; circle(c, 0, 0, R * 0.1);
      c.restore();
      // two small milky eyes up top, no lids left
      for (const s of [-1, 1]) {
        const x = s * R * 0.3, y = -R * 0.5;
        ell(c, x, y, R * 0.1, R * 0.08); c.fillStyle = '#d6dce0'; c.fill(); c.strokeStyle = '#2a0608'; c.lineWidth = lw27(R, 0.025); c.stroke();
        c.fillStyle = 'rgba(120,130,140,0.6)'; circle(c, x + clamp(st.lookX || 0, -1, 1) * R * 0.03, y, R * 0.04);
      }
      const ph = (t * 0.6) % 1;
      c.fillStyle = `rgba(230,220,200,${0.7 * (1 - ph)})`; c.beginPath(); c.moveTo(R * 0.1, R * 0.7); c.quadraticCurveTo(R * 0.15, R * (0.8 + ph * 0.4), R * 0.1, R * (0.86 + ph * 0.45)); c.quadraticCurveTo(R * 0.05, R * (0.8 + ph * 0.4), R * 0.1, R * 0.7); c.fill();
    }
    drawStem(c, R, st.leaf || 0, 0);
  }

  /* Appelgameplay: Kappersfail. All four fails at once, the mullet stapled back on */
  function drawKapper132(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#ff9a8e', '#c8283c', '#5a0816'], vein: 'rgba(255,190,120,0.15)', hl: 'rgba(255,255,255,0.42)', out: '#2b070f',
      inside(c, R) {
        // the shaved scalp, grey stubble and razor nicks
        c.fillStyle = '#e8c2a8'; ell(c, 0, -R * 0.86, R * 0.95, R * 0.4); c.fill();
        c.fillStyle = 'rgba(90,60,40,0.35)'; for (let i = 0; i < 40; i++) circle(c, (rnd24(i + 5) - 0.5) * R * 1.6, -R * (0.62 + rnd24(i + 9) * 0.38), R * 0.012);
        for (const [x0, y0, x1, y1] of [[-0.5, -0.8, -0.2, -0.66], [0.1, -0.9, 0.4, -0.7], [-0.1, -0.62, 0.15, -0.58]]) {
          c.strokeStyle = '#8a0a14'; c.lineWidth = lw27(R, 0.035); c.beginPath(); c.moveTo(x0 * R, y0 * R); c.lineTo(x1 * R, y1 * R); c.stroke();
          const len = R * (0.12 + 0.05 * Math.sin(t * 1.5 + x0 * 7));
          c.fillStyle = '#9a0c18'; rrect(c, x1 * R - R * 0.02, y1 * R, R * 0.04, len, R * 0.02); c.fill();
        }
        // a stitched scar where the clippers slipped
        c.strokeStyle = '#4a0a10'; c.lineWidth = lw27(R, 0.03); c.beginPath(); c.moveTo(R * 0.55, -R * 0.62); c.quadraticCurveTo(R * 0.7, -R * 0.3, R * 0.62, R * 0.02); c.stroke();
        stitch122(c, R, [[0.55, -0.62], [0.68, -0.32], [0.62, 0.02]]);
      } });
    // what is left of the mullet, stapled back where it used to be
    for (const [x, y, r, a] of [[-1.02, 0.02, 0.27, 0.4], [-1.06, 0.42, 0.22, 0.2], [1.04, 0.32, 0.24, -0.3], [-0.55, -0.9, 0.2, 0.8]]) {
      c.save(); c.translate(x * R, y * R); c.rotate(a + Math.sin(t * 2 + x) * 0.04);
      c.fillStyle = '#2a170b'; circle(c, 0, 0, (r + 0.06) * R); c.fillStyle = '#6b4326'; circle(c, 0, 0, r * R);
      c.strokeStyle = 'rgba(176,120,70,0.75)'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.arc(0, 0, r * R * 0.6, 0.5, 2.6); c.stroke();
      c.strokeStyle = '#2a2a30'; c.lineWidth = lw27(R, 0.05);
      for (const k of [-1, 1]) { c.beginPath(); c.moveTo(-R * 0.08, k * R * 0.07); c.lineTo(-R * 0.08, k * R * 0.07 - R * 0.05); c.lineTo(R * 0.08, k * R * 0.07 - R * 0.05); c.lineTo(R * 0.08, k * R * 0.07); c.stroke(); }
      c.strokeStyle = '#c8ccd4'; c.lineWidth = lw27(R, 0.025); c.stroke();
      c.restore();
    }
    // a comb, stuck in for good
    c.save(); c.translate(R * 0.32, -R * 0.98); c.rotate(-0.5);
    c.fillStyle = '#1a1a20'; rrect(c, -R * 0.36, -R * 0.08, R * 0.72, R * 0.12, R * 0.03); c.fill();
    for (let i = 0; i < 9; i++) c.fillRect(-R * 0.33 + i * R * 0.08, R * 0.03, R * 0.035, R * 0.2);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-R * 0.34, -R * 0.06, R * 0.68, R * 0.025);
    c.restore();
    if (st.face !== false) drawAppelFace(c, R, st);
    drawAppelStem(c, R, st.leaf || 0, st.twin);
  }

  /* The Rotten Apple: Staartbijter. A small Ouroboros, out the eye and around */
  function drawOuro132(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#c4ad5a', '#8c6d2c', '#3c2a10'], vein: 'rgba(255,190,120,0.12)', hl: 'rgba(255,255,255,0.3)', out: '#1f1406',
      inside(c, R) {
        c.fillStyle = 'rgba(170,190,110,0.75)';
        for (const [x, y, r] of [[-0.5, 0.25, 0.22], [0.42, -0.3, 0.16], [0.35, 0.55, 0.2], [-0.15, 0.75, 0.12]]) circle(c, x * R, y * R, r * R);
        c.fillStyle = 'rgba(50,30,10,0.55)'; for (const [x, y, r] of [[0.05, 0.3, 0.1], [-0.35, -0.5, 0.07], [0.62, 0.15, 0.08]]) circle(c, x * R, y * R, r * R);
      } });
    if (st.face !== false) drawRotFace(c, R, st);
    // the left eye is a hole now, and something lives in it
    const ex = -R * 0.33, ey = -R * 0.04;
    ell(c, ex, ey, R * 0.21, R * 0.21); c.fillStyle = '#120802'; c.fill(); c.strokeStyle = '#4a0a10'; c.lineWidth = lw27(R, 0.04); c.stroke();
    const P = [], N = 40, a0 = Math.PI * 0.95, slide = t * 0.6;
    for (let i = 0; i <= N; i++) {
      const u = i / N, a = a0 + u * TAU * 0.93, ring = smooth(u / 0.16);
      const rx = Math.cos(a) * R * 1.22, ry = Math.sin(a) * R * 1.14 - R * 0.05;
      P.push([lerp(ex, rx, ring), lerp(ey, ry, ring), u]);
    }
    for (let i = 0; i < P.length - 2; i++) {
      const [x, y, u] = P[i], r = R * (0.05 + 0.11 * u);
      c.fillStyle = '#1a1210'; circle(c, x, y, r + R * 0.03);
    }
    for (let i = 0; i < P.length - 2; i++) {
      const [x, y, u] = P[i], r = R * (0.05 + 0.11 * u), band = Math.floor(u * 14 - slide) % 2 === 0;
      c.fillStyle = band ? '#eadec9' : '#ddd0b8'; circle(c, x, y, r);
      if (band && u > 0.2) { c.fillStyle = '#74202a'; ell(c, x, y, r * 0.5, r * 0.3); c.fill(); }
    }
    // the head comes all the way around and bites its own tail
    const [hx, hy] = P[P.length - 1], [px, py] = P[P.length - 4], ha = Math.atan2(hy - py, hx - px), bite = Math.sin(t * 3) * 0.08;
    c.save(); c.translate(hx, hy); c.rotate(ha);
    c.fillStyle = '#1a1210'; ell(c, 0, 0, R * 0.26, R * 0.2); c.fill();
    c.fillStyle = '#eadec9'; ell(c, 0, 0, R * 0.22, R * 0.16); c.fill();
    c.fillStyle = '#2a0d12'; c.beginPath(); c.moveTo(R * 0.24, 0); c.lineTo(R * 0.02, -R * (0.07 + bite)); c.lineTo(R * 0.02, R * (0.07 + bite)); c.closePath(); c.fill();
    c.fillStyle = '#f6eedc'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(R * 0.15, s * R * 0.05); c.lineTo(R * 0.12, s * R * 0.0); c.lineTo(R * 0.09, s * R * 0.05); c.fill(); }
    c.fillStyle = '#ffae42'; circle(c, -R * 0.04, -R * 0.09, R * 0.045); c.fillStyle = '#1a0a04'; ell(c, -R * 0.04, -R * 0.09, R * 0.012, R * 0.035); c.fill();
    c.restore();
    drawStem(c, R, (st.leaf || 0) * 0.4 - 0.5, 0);
  }

  /* Krullenbol: Kassabon. Everything must go, so it went */
  function sticker132(c, x, y, R, txt, col, rot) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = col; rrect(c, -R * 0.2, -R * 0.1, R * 0.4, R * 0.2, R * 0.03); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = lw27(R, 0.015); c.stroke();
    c.fillStyle = '#c4121e'; c.font = `700 ${Math.max(4, R * 0.13)}px "Barlow Condensed", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, R * 0.01);
    c.restore();
  }
  function drawBon132(c, R, st) {
    const t = st.t || 0;
    skinBody24(c, R, st, { g: ['#ff8a7e', '#d0283e', '#5e0a1a'], vein: 'rgba(255,190,120,0.14)', hl: 'rgba(255,255,255,0.42)', out: '#2b070f',
      inside(c, R) {
        drawKrulTee(c, R);
        // a barcode cut into the cheek, fresh
        c.fillStyle = '#4a0610';
        let x = R * 0.36;
        for (let i = 0; i < 11; i++) { const w = R * (0.012 + rnd24(i + 70) * 0.03); c.fillRect(x, R * 0.0, w, R * 0.3); x += w + R * 0.018; }
        c.fillStyle = 'rgba(160,10,20,0.6)'; for (let i = 0; i < 3; i++) { const yy = R * (0.3 + ((t * 0.4 + i * 0.33) % 1) * 0.15); circle(c, R * (0.42 + i * 0.1), yy, R * 0.025); }
        sticker132(c, -R * 0.62, R * 0.58, R, '€0,99', '#f2c200', -0.3);
        sticker132(c, R * 0.6, -R * 0.42, R, '-50%', '#ff7a1a', 0.35);
      } });
    if (st.face !== false) {
      drawKrulFace(c, R, st);
      // one eye on sale
      c.save(); c.translate(-R * 0.32, -R * 0.02); c.rotate(-0.2);
      c.fillStyle = '#f2c200'; circle(c, 0, 0, R * 0.2); c.strokeStyle = '#8a6a00'; c.lineWidth = lw27(R, 0.025); c.stroke();
      c.fillStyle = '#c4121e'; c.font = `800 ${Math.max(4, R * 0.15)}px "Barlow Condensed", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1+1', 0, R * 0.01);
      c.restore();
      // the tongue is a receipt, and it keeps printing
      const len = R * (0.95 + 0.12 * Math.sin(t * 1.3)), sw = Math.sin(t * 2) * 0.12;
      c.save(); c.translate(0, R * 0.36); c.rotate(sw);
      c.fillStyle = '#f7f3ea'; c.beginPath(); c.moveTo(-R * 0.13, 0); c.lineTo(R * 0.13, 0); c.quadraticCurveTo(R * 0.2, len * 0.5, R * 0.1, len);
      for (let i = 0; i <= 6; i++) c.lineTo(R * 0.1 - i * R * 0.04, len + (i % 2 ? R * 0.04 : 0));
      c.quadraticCurveTo(-R * 0.08, len * 0.5, -R * 0.13, 0); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(60,50,40,0.35)'; c.lineWidth = lw27(R, 0.015); c.stroke();
      c.fillStyle = 'rgba(40,40,50,0.55)'; for (let i = 0; i < 7; i++) { const y = R * 0.1 + i * len * 0.12, w = R * (0.06 + rnd24(i + 90) * 0.1); c.fillRect(-R * 0.08 + (i % 3) * R * 0.01, y, w, R * 0.025); }
      c.fillStyle = 'rgba(200,40,60,0.5)'; ell(c, 0, R * 0.02, R * 0.12, R * 0.05); c.fill();
      c.restore();
    }
    drawKrulGlasses(c, R);
    drawKrulHair(c, R, st.leaf || 0);
  }

  /* Mikappols: 8 Procent. Same face behind cracked glass, a charger in the skull */
  function drawTel132(c, R, st) {
    const t = st.t || 0, blink = Math.sin(t * 4) > 0;
    // the cable runs out of the top of his head and away
    c.strokeStyle = '#0a0a0e'; c.lineWidth = lw27(R, 0.11); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-R * 0.45, -R * 0.95); c.bezierCurveTo(-R * 0.6, -R * 1.5, -R * 1.4, -R * 1.2, -R * 1.5 + Math.sin(t) * R * 0.05, -R * 1.8); c.stroke();
    c.strokeStyle = '#f2f0ea'; c.lineWidth = lw27(R, 0.07); c.stroke();
    mikaBody27(c, R, st, '#2048b8', '#06102a', (c, R) => {
      const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.3)');
      c.fillStyle = g; c.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
      // the cable goes on under the skin, like veins
      c.strokeStyle = 'rgba(10,10,20,0.55)'; c.lineWidth = lw27(R, 0.045);
      for (const [x1, y1] of [[-0.8, 0.3], [-0.1, 0.6], [0.6, 0.1], [0.3, 0.85]]) { c.beginPath(); c.moveTo(-R * 0.45, -R * 0.85); c.quadraticCurveTo(x1 * R * 0.3, -R * 0.2, x1 * R, y1 * R); c.stroke(); }
      // dead pixels that flicker
      for (let i = 0; i < 9; i++) {
        if (Math.sin(t * 5 + i * 3.7) < -0.2) continue;
        const x = (rnd24(i + 30) - 0.5) * R * 1.7, y = (rnd24(i + 50) - 0.5) * R * 1.6, s = R * (0.06 + rnd24(i + 60) * 0.08);
        c.fillStyle = ['#ff2ad8', '#2aff6a', '#ffffff', '#000000'][i % 4]; c.fillRect(x, y, s, s * 0.6);
      }
    });
    mikaFace27(c, R, st, '#ffffff');
    // cracked glass over all of it
    c.save(); mikaPath(c, R); c.clip();
    const cx = R * 0.42, cy = -R * 0.4;
    c.strokeStyle = 'rgba(235,245,255,0.75)'; c.lineWidth = lw27(R, 0.02);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + rnd24(i) * 0.4; let x = cx, y = cy;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 1; k <= 4; k++) { x = cx + Math.cos(a + (rnd24(i * 7 + k) - 0.5) * 0.5) * R * 0.45 * k; y = cy + Math.sin(a + (rnd24(i * 5 + k) - 0.5) * 0.5) * R * 0.45 * k; c.lineTo(x, y); }
      c.stroke();
    }
    for (const r of [0.12, 0.3]) { c.beginPath(); for (let i = 0; i <= 9; i++) { const a = (i / 9) * TAU, k = r * (0.8 + rnd24(i + r * 10) * 0.4); c.lineTo(cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k); } c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; circle(c, cx, cy, R * 0.05);
    c.restore();
    // the plug, and the battery that is about to give up
    c.fillStyle = '#d8d8e0'; rrect(c, -R * 0.56, -R * 1.02, R * 0.22, R * 0.16, R * 0.03); c.fill(); c.strokeStyle = '#2a2a30'; c.lineWidth = lw27(R, 0.025); c.stroke();
    c.save(); c.translate(R * 0.3, -R * 1.18);
    c.strokeStyle = '#f2f0ea'; c.lineWidth = lw27(R, 0.04); rrect(c, -R * 0.24, -R * 0.1, R * 0.44, R * 0.2, R * 0.03); c.stroke(); c.fillStyle = '#f2f0ea'; c.fillRect(R * 0.2, -R * 0.05, R * 0.05, R * 0.1);
    if (blink) { c.fillStyle = '#ff2a3a'; c.fillRect(-R * 0.2, -R * 0.06, R * 0.05, R * 0.12); }
    c.fillStyle = '#ff2a3a'; c.font = `700 ${Math.max(4, R * 0.16)}px "Barlow Condensed", sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('8%', R * 0.32, 0);
    c.restore();
  }

  /* Peanapple: Blokrot. The pieces grew in */
  function block132(c, x, y, s, col) {
    c.fillStyle = col; c.fillRect(x, y, s, s);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, y, s, s * 0.18); c.fillRect(x, y, s * 0.18, s);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x, y + s * 0.82, s, s * 0.18); c.fillRect(x + s * 0.82, y, s * 0.18, s);
    c.strokeStyle = '#0b0f1c'; c.lineWidth = Math.max(0.5, s * 0.06); c.strokeRect(x, y, s, s);
  }
  function drawBlok132(c, R, st) {
    const t = st.t || 0, s = R * 0.24;
    // a T piece stuck in his back, wet where it went in
    c.save(); c.translate(R * 0.55, -R * 0.95); c.rotate(0.35);
    for (const [cx, cy] of TETROS.T) block132(c, (cx - 1.5) * s, cy * s - s, s, TETRO_COL.T);
    c.restore();
    drawPean(c, R, st);
    c.save(); c.globalCompositeOperation = 'source-atop';
    // the fur goes square in patches
    const q = R * 0.16;
    for (let i = 0; i < 26; i++) {
      const x = Math.floor((rnd24(i + 100) - 0.5) * 12) * q, y = Math.floor((rnd24(i + 140) - 0.5) * 12) * q;
      c.fillStyle = i % 3 ? 'rgba(40,70,120,0.28)' : 'rgba(120,20,40,0.3)'; c.fillRect(x, y, q, q);
    }
    c.fillStyle = 'rgba(30,60,90,0.18)'; c.fillRect(-R * 2.5, -R * 2.5, R * 5, R * 5);
    c.restore();
    // an L grows out of the left cheek, an O out of the belly
    for (const [px, py, k, rot] of [[-1.15, -0.1, 'L', -0.25], [0.55, 0.62, 'O', 0.15]]) {
      c.save(); c.translate(px * R, py * R); c.rotate(rot);
      c.fillStyle = '#5a0a14'; ell(c, s * 0.6, s * 0.9, s * 1.1, s * 0.4); c.fill();
      for (const [cx, cy] of TETROS[k]) block132(c, cx * s * 0.8 - s * 0.4, cy * s * 0.8, s * 0.8, TETRO_COL[k]);
      c.restore();
    }
    // the next one is already on its way down
    const ph = (t * 0.35) % 1, fy = -R * 2.2 + ph * R * 0.9;
    c.strokeStyle = 'rgba(63,198,216,0.6)'; c.lineWidth = lw27(R, 0.02); c.setLineDash([R * 0.06, R * 0.05]);
    c.strokeRect(-s * 2, -R * 1.28, s * 4, s); c.setLineDash([]);
    c.globalAlpha = 0.85 * Math.sin(ph * Math.PI);
    for (const [cx] of TETROS.I) block132(c, (cx - 2) * s, fy, s, TETRO_COL.I);
    c.globalAlpha = 1;
  }

  /* Apploa Vogels: Handjeklap. The wings are arms, and the arms want something */
  // the arms are drawn flat first, then laid in as one piece, so they stay whole behind the body
  let hwOff132 = null;
  function handWings132(c, R, flap) {
    if (c.globalCompositeOperation !== 'source-over' && c.canvas && typeof document !== 'undefined') {
      const W = c.canvas.width, H = c.canvas.height;
      if (!hwOff132) hwOff132 = document.createElement('canvas');
      if (hwOff132.width !== W || hwOff132.height !== H) { hwOff132.width = W; hwOff132.height = H; }
      const o = hwOff132.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); o.setTransform(c.getTransform());
      handArms132(o, R, flap);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(hwOff132, 0, 0); c.restore();
      return;
    }
    handArms132(c, R, flap);
  }
  function handArms132(c, R, flap) {
    for (const side of [-1, 1]) {
      c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.1 - flap);
      c.lineCap = 'round'; c.lineJoin = 'round';
      const sx = R * 0.7, sy = -R * 0.32, ex = R * 1.32, ey = -R * 0.62;
      // a suit sleeve to the elbow, a bare forearm after
      c.strokeStyle = '#0a0d14'; c.lineWidth = Math.max(1, R * 0.36); c.beginPath(); c.moveTo(0, 0); c.lineTo(sx, sy); c.stroke();
      c.strokeStyle = '#3e4a70'; c.lineWidth = Math.max(1, R * 0.28); c.stroke();
      c.strokeStyle = '#2a1a14'; c.lineWidth = Math.max(1, R * 0.22); c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = '#c8a088'; c.lineWidth = Math.max(0.8, R * 0.15); c.stroke();
      c.fillStyle = '#f2f0ea'; c.save(); c.translate(sx, sy); c.rotate(Math.atan2(ey - sy, ex - sx)); c.fillRect(-R * 0.04, -R * 0.13, R * 0.1, R * 0.26); c.restore();
      // an open hand with five long fingers, always reaching
      c.save(); c.translate(ex, ey); c.rotate(-0.4);
      c.fillStyle = '#2a1a14'; ell(c, 0, 0, R * 0.22, R * 0.18); c.fill(); c.fillStyle = '#d4ac92'; ell(c, 0, 0, R * 0.18, R * 0.14); c.fill();
      for (let k = 0; k < 5; k++) {
        const a = -1.3 + k * 0.55, L = R * (k === 0 ? 0.26 : 0.42 - Math.abs(k - 2.5) * 0.05), cu = flap * 1.5 + 0.1;
        const mx = Math.cos(a) * L * 0.55, my = Math.sin(a) * L * 0.55, tx = Math.cos(a + cu) * L, ty = Math.sin(a + cu) * L;
        c.strokeStyle = '#2a1a14'; c.lineWidth = Math.max(0.8, R * 0.1); c.beginPath(); c.moveTo(0, 0); c.lineTo(mx, my); c.lineTo(tx, ty); c.stroke();
        c.strokeStyle = '#d4ac92'; c.lineWidth = Math.max(0.5, R * 0.065); c.stroke();
        if (k === 3) { c.fillStyle = '#e3a54a'; circle(c, mx, my, R * 0.045); c.fillStyle = '#fff4c0'; circle(c, mx - R * 0.01, my - R * 0.015, R * 0.015); }
      }
      c.restore();
      c.restore();
    }
  }
  function drawHand132(c, R, st) {
    apploa27(c, R, st, { hair: '#24242a', hair2: '#08080c', iris: '#e3a54a', wings: handWings132,
      inside(c, R, t) {
        // collar and tie, and something pushing out from under the shirt
        c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(-R * 0.3, R * 0.3); c.lineTo(0, R * 0.48); c.lineTo(R * 0.3, R * 0.3); c.lineTo(R * 0.36, R * 1.2); c.lineTo(-R * 0.36, R * 1.2); c.closePath(); c.fill();
        c.fillStyle = '#c3243a'; c.beginPath(); c.moveTo(-R * 0.06, R * 0.44); c.lineTo(R * 0.06, R * 0.44); c.lineTo(R * 0.1, R * 0.95); c.lineTo(0, R * 1.05); c.lineTo(-R * 0.1, R * 0.95); c.closePath(); c.fill();
        const push = 0.5 + 0.5 * Math.sin(t * 2.5);
        c.strokeStyle = 'rgba(90,60,50,0.55)'; c.lineWidth = lw27(R, 0.05);
        for (let k = 0; k < 4; k++) { const x = -R * 0.6 + k * R * 0.08; c.beginPath(); c.moveTo(x, R * 0.9); c.lineTo(x - R * 0.02, R * (0.62 - push * 0.08)); c.stroke(); }
      },
      top(c, R, t) {
        // a gold ring through the brow, the first payment
        c.strokeStyle = '#e3a54a'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.arc(R * 0.5, -R * 0.3, R * 0.07, 0, TAU); c.stroke();
      } });
  }

  /* Lucifappel: Benzinekop. Someone filled him up and left the nozzle in */
  function drawPomp132(c, R, st) {
    const t = st.t || 0;
    // the hose goes off to a pump you cannot see
    c.strokeStyle = '#0a0a0a'; c.lineWidth = lw27(R, 0.16); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-R * 1.0, -R * 1.3); c.bezierCurveTo(-R * 1.5, -R * 1.2, -R * 1.6, -R * 0.2, -R * 1.9, R * 0.6); c.stroke();
    c.strokeStyle = '#2a2a2a'; c.lineWidth = lw27(R, 0.1); c.stroke();
    drawLucif26(c, R, st);
    c.save(); c.globalCompositeOperation = 'source-atop';
    const g = c.createLinearGradient(0, -R * 1.2, 0, R * 1.2); g.addColorStop(0, 'rgba(160,190,20,0.5)'); g.addColorStop(1, 'rgba(60,80,10,0.2)');
    c.fillStyle = g; c.fillRect(-R * 2, -R * 2, R * 4, R * 4);
    // fuel blisters on the box
    for (const [x, y, r] of [[-0.6, 0.5, 0.12], [0.55, 0.3, 0.09], [-0.2, 0.75, 0.08], [0.7, -0.2, 0.07], [-0.75, -0.2, 0.06]]) {
      c.fillStyle = 'rgba(230,240,140,0.6)'; circle(c, x * R, y * R, r * R); c.fillStyle = 'rgba(255,255,230,0.7)'; circle(c, x * R - r * R * 0.3, y * R - r * R * 0.3, r * R * 0.3);
    }
    if (st.face !== false) for (const s of [-1, 1]) {
      const x = s * R * 0.25, len = R * (0.32 + 0.08 * Math.sin(t * 2.2 + s));
      c.fillStyle = '#b8c81a'; rrect(c, x - R * 0.04, R * 0.12, R * 0.08, len, R * 0.04); c.fill(); circle(c, x, R * 0.12 + len, R * 0.06);
      c.fillStyle = 'rgba(255,255,220,0.6)'; c.fillRect(x - R * 0.015, R * 0.14, R * 0.02, len * 0.7);
    }
    c.restore();
    // the nozzle, jammed in the top of the box
    c.save(); c.translate(-R * 0.55, -R * 1.05); c.rotate(0.7);
    c.fillStyle = '#0e0e0e'; rrect(c, -R * 0.5, -R * 0.14, R * 0.5, R * 0.28, R * 0.06); c.fill();
    c.fillStyle = '#1a7a2a'; rrect(c, -R * 0.48, -R * 0.12, R * 0.46, R * 0.24, R * 0.05); c.fill();
    c.fillStyle = '#f2c230'; c.fillRect(-R * 0.36, -R * 0.12, R * 0.1, R * 0.24);
    c.strokeStyle = '#0e0e0e'; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.moveTo(-R * 0.3, R * 0.12); c.quadraticCurveTo(-R * 0.2, R * 0.32, -R * 0.05, R * 0.14); c.stroke();
    c.fillStyle = '#9a9aa4'; c.fillRect(-R * 0.02, -R * 0.05, R * 0.34, R * 0.1);
    c.restore();
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.5 + i * 0.33) % 1, x = (-0.4 + i * 0.4) * R;
      c.fillStyle = `rgba(184,200,26,${0.85 * (1 - ph)})`; c.beginPath(); c.moveTo(x, R * 0.85 + ph * R * 0.6); c.quadraticCurveTo(x + R * 0.07, R * 0.95 + ph * R * 0.6, x, R * 1.0 + ph * R * 0.6); c.quadraticCurveTo(x - R * 0.07, R * 0.95 + ph * R * 0.6, x, R * 0.85 + ph * R * 0.6); c.fill();
    }
    c.fillStyle = 'rgba(200,210,60,0.12)'; ell(c, 0, R * 1.05, R * 0.9, R * 0.12); c.fill();
  }

  /* ------------------------------------------------------------------ v13.4: Lucifappel, redrawn and three new looks */
  const INK134 = '#0e0a08';
  const eye134 = (st) => ({ o: clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx: clamp(st.lookX || 0, -1, 1), ly: clamp(st.lookY || 0, -1, 1) });
  const bz134 = (a, b, d, e, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * d[0] + u * u * u * e[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * d[1] + u * u * u * e[1]]; };
  const bzd134 = (a, b, d, e, u) => { const v = 1 - u; return [3 * v * v * (b[0] - a[0]) + 6 * v * u * (d[0] - b[0]) + 3 * u * u * (e[0] - d[0]), 3 * v * v * (b[1] - a[1]) + 6 * v * u * (d[1] - b[1]) + 3 * u * u * (e[1] - d[1])]; };
  // a curved horn that tapers to a point, mirrored by s. pts are four bezier points in R units.
  function horn134(c, R, s, pts, w, g0, g1, rings) {
    const P = pts.map((p) => [s * p[0] * R, p[1] * R]), N = 18, A = [], B = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = bz134(P[0], P[1], P[2], P[3], u), d = bzd134(P[0], P[1], P[2], P[3], u), l = Math.hypot(d[0], d[1]) || 1;
      const hw = R * w * Math.pow(1 - u, 0.8) + R * 0.012, nx = -d[1] / l, ny = d[0] / l;
      A.push([p[0] + nx * hw, p[1] + ny * hw]); B.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    c.beginPath(); c.moveTo(A[0][0], A[0][1]);
    for (let i = 1; i <= N; i++) c.lineTo(A[i][0], A[i][1]);
    for (let i = N; i >= 0; i--) c.lineTo(B[i][0], B[i][1]);
    c.closePath();
    const g = c.createLinearGradient(P[0][0], P[0][1], P[3][0], P[3][1]); g.addColorStop(0, g0); g.addColorStop(1, g1);
    c.fillStyle = g; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.07); c.stroke();
    if (rings) { c.strokeStyle = 'rgba(14,10,8,0.6)'; c.lineWidth = lw27(R, 0.04); for (let k = 1; k <= rings; k++) { const i = Math.round((k / (rings + 1)) * N * 0.85); c.beginPath(); c.moveTo(A[i][0], A[i][1]); c.lineTo(B[i][0], B[i][1]); c.stroke(); } }
    c.strokeStyle = 'rgba(255,240,200,0.4)'; c.lineWidth = lw27(R, 0.028); c.beginPath(); c.moveTo(A[2][0], A[2][1]); for (let i = 3; i < N - 3; i++) c.lineTo(A[i][0], A[i][1]); c.stroke();
  }
  // a bat wing: arm, three fingers, scalloped skin between them. s mirrors it.
  function wing134(c, R, s, t, col0, col1, bone) {
    const fl = Math.sin(t * 2.3 + (s > 0 ? 0 : 0.5)) * 0.06;
    const sh = [0.8, 0.12], wr = [1.5, -0.78 + fl], tp = [[1.92, -0.14 + fl * 1.6], [1.72, 0.34 + fl], [1.3, 0.68 + fl * 0.5]], rt = [0.88, 0.55], el = [1.08, -0.98 + fl];
    const X = (p) => p[0] * R, Y = (p) => p[1] * R;
    const sc = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return [m[0] + (sh[0] - m[0]) * 0.3, m[1] + (sh[1] - m[1]) * 0.3]; };
    c.save(); c.scale(s, 1);
    c.beginPath(); c.moveTo(X(sh), Y(sh)); c.quadraticCurveTo(X(el), Y(el), X(wr), Y(wr)); c.lineTo(X(tp[0]), Y(tp[0]));
    for (let i = 0; i < 2; i++) { const m = sc(tp[i], tp[i + 1]); c.quadraticCurveTo(X(m), Y(m), X(tp[i + 1]), Y(tp[i + 1])); }
    { const m = sc(tp[2], rt); c.quadraticCurveTo(X(m), Y(m), X(rt), Y(rt)); }
    c.closePath();
    const g = c.createLinearGradient(X(sh), 0, X(tp[0]), 0); g.addColorStop(0, col0); g.addColorStop(1, col1);
    c.fillStyle = g; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.07); c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = bone; c.lineWidth = lw27(R, 0.06); c.lineCap = 'round';
    for (const p of tp) { c.beginPath(); c.moveTo(X(wr), Y(wr)); c.lineTo(X(p), Y(p)); c.stroke(); }
    c.beginPath(); c.moveTo(X(sh), Y(sh)); c.quadraticCurveTo(X(el), Y(el), X(wr), Y(wr)); c.stroke();
    c.fillStyle = '#e2b04e'; c.beginPath(); c.moveTo(X(wr) - R * 0.05, Y(wr) + R * 0.02); c.lineTo(X(wr) + R * 0.12, Y(wr) - R * 0.22); c.lineTo(X(wr) + R * 0.12, Y(wr) + R * 0.06); c.closePath(); c.fill();
    c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.03); c.stroke();
    c.restore();
  }
  function pentagram134(c, x, y, r, col, lwid) {
    c.strokeStyle = col; c.lineWidth = lwid; c.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + ((i * 2) % 5) * (TAU / 5); const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.stroke(); c.beginPath(); c.arc(x, y, r * 1.18, 0, TAU); c.stroke();
  }
  function emberRise134(c, R, t, n, x0, y0, spread, rise, col) {
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.45 * (0.6 + rnd24(i + 5)) + rnd24(i)) % 1, a = Math.sin(ph * Math.PI);
      glowDot(c, x0 + (rnd24(i + 2) - 0.5) * spread * R + Math.sin(t * 2 + i) * R * 0.06, y0 - ph * rise * R, R * (0.07 + rnd24(i + 9) * 0.07), i % 3 ? col : '#ffe08a', 0.85 * a);
    }
  }

  /* Lucifappel: Lucifer, the devil on the match label. Horns, wings, a spade tail, a hellfire crown. */
  function drawLucifer134(c, R, st) {
    const t = st.t || 0, fear = st.fear || 0, e = eye134(st);
    glowDot(c, 0, R * 0.1, R * 2.1, '#ff2a10', 0.16);
    wing134(c, R, -1, t, '#a01220', '#3a050c', '#14080a'); wing134(c, R, 1, t, '#a01220', '#3a050c', '#14080a');
    // the tail ends in a spade
    const tx = R * 1.74, ty = R * 0.56 + Math.sin(t * 3) * R * 0.05;
    c.lineCap = 'round'; c.strokeStyle = INK134; c.lineWidth = R * 0.14; c.beginPath(); c.moveTo(R * 0.55, R * 0.82); c.bezierCurveTo(R * 0.95, R * 1.55, R * 1.95, R * 1.25, tx, ty); c.stroke();
    c.strokeStyle = '#6a0c14'; c.lineWidth = R * 0.07; c.stroke();
    c.save(); c.translate(tx, ty); c.rotate(-0.9 + Math.sin(t * 3) * 0.16);
    c.beginPath(); c.moveTo(0, -R * 0.36); c.bezierCurveTo(R * 0.34, -R * 0.1, R * 0.28, R * 0.14, 0, R * 0.04); c.bezierCurveTo(-R * 0.28, R * 0.14, -R * 0.34, -R * 0.1, 0, -R * 0.36); c.closePath();
    c.fillStyle = '#e8222c'; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.06); c.stroke(); c.restore();
    for (const s of [-1, 1]) horn134(c, R, s, [[0.34, -0.74], [1.02, -1.0], [1.52, -1.34], [1.02, -1.94]], 0.3, '#3a0a0c', '#ffe08a', 4);
    // the body: hot red, lit from below
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2);
    g.addColorStop(0, '#ff6a48'); g.addColorStop(0.4, '#d81c28'); g.addColorStop(0.78, '#8e0a16'); g.addColorStop(1, '#3a0408');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const gb = c.createLinearGradient(0, R * 0.1, 0, R); gb.addColorStop(0, 'rgba(255,120,30,0)'); gb.addColorStop(1, 'rgba(255,150,40,0.5)'); c.fillStyle = gb; c.fillRect(-R * 1.2, R * 0.1, R * 2.4, R * 1.0);
    c.fillStyle = 'rgba(90,4,12,0.35)';
    for (let y = -R; y < R; y += R * 0.14) for (let x = -R; x < R; x += R * 0.14) circle(c, x + ((y / (R * 0.14)) % 2 ? R * 0.07 : 0), y, R * 0.028 * (0.4 + (y + R) / (2 * R)));
    // black hair with a widow's peak
    c.fillStyle = '#16070a'; c.beginPath(); c.moveTo(-R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 0.36);
    c.quadraticCurveTo(R * 0.8, -R * 0.5, R * 0.42, -R * 0.5); c.quadraticCurveTo(R * 0.12, -R * 0.46, 0, -R * 0.3); c.quadraticCurveTo(-R * 0.12, -R * 0.46, -R * 0.42, -R * 0.5);
    c.quadraticCurveTo(-R * 0.8, -R * 0.5, -R * 1.3, -R * 0.36); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,170,150,0.22)'; c.lineWidth = lw27(R, 0.035);
    for (const x of [-0.7, -0.4, 0.4, 0.7]) { c.beginPath(); c.moveTo(x * R, -R * 0.95); c.quadraticCurveTo(x * R * 1.1, -R * 0.75, x * R * 0.9, -R * 0.55); c.stroke(); }
    c.fillStyle = 'rgba(255,215,190,0.28)'; ell(c, -R * 0.45, -R * 0.3, R * 0.3, R * 0.17, -0.6); c.fill();
    // the gold label frame
    c.save(); c.scale(0.86, 0.88); applePath(c, R); c.restore();
    c.strokeStyle = '#e2b04e'; c.lineWidth = Math.max(0.6, R * 0.055); c.stroke();
    c.restore();
    applePath(c, R); c.strokeStyle = INK134; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    lucifBanner26(c, R, R * 0.8, R * 0.84, R * 0.22, '#e2b04e', true);
    if (st.face !== false) {
      pentagram134(c, 0, -R * 0.52, R * 0.085, '#ffd36a', lw27(R, 0.03));
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = e.ly * R * 0.02, o = e.o;
        glowDot(c, ex, ey, R * 0.5, '#ffcc33', 0.28);
        c.beginPath(); c.moveTo(ex - s * R * 0.23, ey + R * 0.09); c.quadraticCurveTo(ex - s * R * 0.02, ey - R * 0.22 * o, ex + s * R * 0.26, ey - R * 0.12);
        c.quadraticCurveTo(ex, ey + R * 0.17 * o, ex - s * R * 0.23, ey + R * 0.09); c.closePath();
        const eg = c.createRadialGradient(ex, ey, 0, ex, ey, R * 0.27); eg.addColorStop(0, '#fffde0'); eg.addColorStop(1, '#ffb41e');
        c.fillStyle = eg; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.stroke();
        if (o > 0.3) { c.fillStyle = INK134; ell(c, ex + e.lx * R * 0.05, ey - R * 0.01, R * 0.03, R * 0.11 * o); c.fill(); }
        const by = -R * 0.17 - fear * R * 0.03;
        c.fillStyle = INK134; c.beginPath(); c.moveTo(s * R * 0.03, by + R * 0.05); c.lineTo(s * R * 0.6, by - R * 0.26); c.lineTo(s * R * 0.56, by - R * 0.1); c.lineTo(s * R * 0.12, by + R * 0.12); c.closePath(); c.fill();
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.075); c.beginPath(); c.moveTo(s * R * 0.05, R * 0.21); c.quadraticCurveTo(s * R * 0.3, R * 0.35, s * R * 0.5, R * 0.21); c.quadraticCurveTo(s * R * 0.58, R * 0.15, s * R * 0.53, R * 0.07); c.stroke();
      }
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.14, R * 0.16); c.fillStyle = '#2a0206'; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.stroke(); }
      else {
        c.beginPath(); c.moveTo(-R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.7, R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.39, -R * 0.34, R * 0.31); c.closePath();
        c.fillStyle = '#2a0206'; c.fill();
        c.fillStyle = '#fffaf0'; for (let i = 0; i < 6; i++) { const x = -R * 0.27 + i * R * 0.108, big = i === 1 || i === 4; c.beginPath(); c.moveTo(x, R * 0.335); c.lineTo(x + R * 0.08, R * 0.335); c.lineTo(x + R * 0.04, R * (big ? 0.5 : 0.43)); c.closePath(); c.fill(); }
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.7, R * 0.34, R * 0.31); c.stroke();
      }
      // a pointed goatee
      c.fillStyle = '#16070a'; c.beginPath(); c.moveTo(-R * 0.16, R * 0.56); c.quadraticCurveTo(0, R * 0.62, R * 0.16, R * 0.56); c.lineTo(0, R * 1.06); c.closePath(); c.fill();
      c.strokeStyle = '#e2b04e'; c.lineWidth = lw27(R, 0.03); c.stroke();
    }
    // the trident is three matches tied together, all lit
    c.save(); c.translate(-R * 1.08, R * 0.2); c.rotate(-0.18 + Math.sin(t * 2) * 0.04);
    c.strokeStyle = INK134; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(0, R * 0.9); c.lineTo(0, -R * 0.5); c.stroke();
    c.strokeStyle = '#8a5a2a'; c.lineWidth = R * 0.09; c.stroke();
    for (const k of [-1, 0, 1]) lucifMatch26(c, k * R * 0.08, -R * 0.4, k * R * 0.24, -R * 1.02 + Math.abs(k) * R * 0.1, R * 0.9, t + k, true);
    c.fillStyle = '#e2b04e'; c.fillRect(-R * 0.16, -R * 0.5, R * 0.32, R * 0.1);
    c.restore();
    // the stem is a lit match with a flame crown
    lucifMatch26(c, R * 0.02, -R * 0.64, R * 0.12, -R * 1.34, R, t, true);
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06, hx = R * 0.14, hy = -R * 1.5;
    glowDot(c, hx, hy - R * 0.15, R * 1.0, '#ff4a10', 0.35);
    for (const [dx, h, w] of [[-0.2, 0.46, 0.12], [0.2, 0.4, 0.11]]) { flameShape(c, hx + dx * R, hy, w * R * f, h * R * f); c.fillStyle = '#ff6a1a'; c.fill(); flameShape(c, hx + dx * R, hy + R * 0.05, w * R * f * 0.5, h * R * f * 0.55); c.fillStyle = '#ffd36a'; c.fill(); }
    emberRise134(c, R, t, 5, hx, hy, 1.2, 0.6, '#ff7a1a');
  }

  /* Lucifappel: Smeltkop. Struck one time too many: a box of red wax, running. */
  // a drip as plain subpaths (a wobbling tube and a round end), so a whole group can be outlined and filled as one shape
  function dripPath134(c, R, x, y0, len, w, ph) {
    const N = 12, A = [], B = [], sway = R * 0.03;
    for (let i = 0; i <= N; i++) {
      const u = i / N, y = y0 + len * u, cx = x + Math.sin(u * 3.2 + (ph || 0)) * sway * u, hw = w * (0.9 - 0.5 * Math.min(1, u / 0.7));
      A.push([cx - hw, y]); B.push([cx + hw, y]);
    }
    const br = w * 0.82, ex = (A[N][0] + B[N][0]) / 2, ey = y0 + len - br * 0.25;
    c.moveTo(A[0][0], A[0][1]);
    for (let i = 1; i <= N; i++) c.lineTo(A[i][0], A[i][1]);
    for (let i = N; i >= 0; i--) c.lineTo(B[i][0], B[i][1]);
    c.closePath(); c.moveTo(ex + br, ey); c.arc(ex, ey, br, 0, TAU, true); c.closePath();
    return { x: ex, y: ey, r: br };
  }
  function drawMelt134(c, R, st) {
    const t = st.t || 0, e = eye134(st), INKR = '#2a0406';
    glowDot(c, 0, R * 0.3, R * 1.9, '#ff4a10', 0.18);
    // the pool it stands in
    const pg = c.createRadialGradient(0, R * 1.04, 0, 0, R * 1.04, R * 1.5); pg.addColorStop(0, 'rgba(214,30,36,0.95)'); pg.addColorStop(0.65, 'rgba(120,10,16,0.9)'); pg.addColorStop(1, 'rgba(60,4,8,0)');
    c.fillStyle = pg; ell(c, 0, R * 1.06, R * 1.5, R * 0.27); c.fill();
    c.fillStyle = 'rgba(255,170,140,0.4)'; ell(c, -R * 0.4, R * 1.0, R * 0.42, R * 0.05); c.fill();
    for (const [x, ph] of [[-1.0, 0], [1.02, 0.5]]) { const k = (t * 0.6 + ph) % 1; c.strokeStyle = `rgba(255,150,120,${0.6 * (1 - k)})`; c.lineWidth = lw27(R, 0.03); ell(c, x * R, R * 1.14, R * (0.08 + k * 0.3), R * (0.03 + k * 0.07)); c.stroke(); }
    // the apple and the wax running off its sides are one shape: one outline, no seams
    const SIDE = [[-1.0, 1.12, 0.17], [-0.93, 0.8, 0.12], [0.96, 0.92, 0.13], [1.02, 1.12, 0.17]], ends = [];
    const sidePath = () => { applePath(c, R); SIDE.forEach(([x, endY, w], i) => { const y0 = -R * 0.05, d = dripPath134(c, R, x * R, y0, endY * R - y0 + Math.sin(t * 0.9 + i * 1.7) * R * 0.04, w * R, i); ends[i] = d; }); };
    sidePath(); c.lineJoin = 'round'; c.strokeStyle = INKR; c.lineWidth = Math.max(1.4, R * 0.2); c.stroke();
    sidePath(); c.fillStyle = '#b0121c'; c.fill();
    const g = c.createRadialGradient(-R * 0.34, -R * 0.4, R * 0.06, 0, 0, R * 1.2);
    g.addColorStop(0, '#ff9468'); g.addColorStop(0.35, '#e83a1c'); g.addColorStop(0.75, '#a60f18'); g.addColorStop(1, '#4a0608');
    applePath(c, R); c.fillStyle = g; c.fill();
    for (const d of ends) { c.fillStyle = 'rgba(255,170,150,0.7)'; ell(c, d.x - d.r * 0.3, d.y - d.r * 0.1, d.r * 0.2, d.r * 0.4); c.fill(); }
    c.save(); applePath(c, R); c.clip();
    glowDot(c, 0, R * 0.35, R * 1.0, '#ffb040', 0.4);
    // the black strip and its gold rules slid down and sag in the middle
    c.lineCap = 'butt'; c.strokeStyle = INK134; c.lineWidth = R * 0.34; c.beginPath(); c.moveTo(-R * 1.2, R * 0.58); c.quadraticCurveTo(0, R * 1.02, R * 1.2, R * 0.62); c.stroke();
    c.strokeStyle = '#e2b04e'; c.lineWidth = lw27(R, 0.04);
    for (const dy of [-0.11, 0.11]) { c.beginPath(); c.moveTo(-R * 1.2, R * (0.58 + dy)); c.quadraticCurveTo(0, R * (1.02 + dy), R * 1.2, R * (0.62 + dy)); c.stroke(); }
    // a thick layer of wax over the top, tongues running down the front
    const edge = (x) => { const a = Math.abs(x), u = Math.min(1, Math.max(0, (a - 0.45) / 0.55)); return -0.36 + 0.56 * u * u * (3 - 2 * u) + Math.max(0, a - 1) * 1.4 + Math.sin(x * 5.2 + 1.3) * 0.03; };
    const TONG = [];
    const capPath = () => {
      c.beginPath(); c.moveTo(-R * 1.6, -R * 1.6); c.lineTo(R * 1.6, -R * 1.6); for (let x = 1.6; x >= -1.6; x -= 0.08) c.lineTo(x * R, edge(x) * R); c.closePath();
      TONG.forEach(([x, endY, w], i) => { const y0 = edge(x) * R - R * 0.1; dripPath134(c, R, x * R, y0, endY * R - y0 + Math.sin(t * 0.8 + i * 2) * R * 0.04, w * R, i + 3); });
    };
    capPath(); c.strokeStyle = 'rgba(42,4,6,0.6)'; c.lineWidth = lw27(R, 0.07); c.lineJoin = 'round'; c.stroke();
    capPath(); const cg = c.createLinearGradient(0, -R, 0, R * 0.2); cg.addColorStop(0, '#4a0810'); cg.addColorStop(1, '#c4182a'); c.fillStyle = cg; c.fill();
    c.fillStyle = 'rgba(255,220,200,0.5)'; ell(c, -R * 0.5, -R * 0.64, R * 0.26, R * 0.07, -0.35); c.fill();
    const pul = 0.6 + 0.4 * Math.sin(t * 3); c.fillStyle = '#120606'; ell(c, R * 0.03, -R * 0.64, R * 0.3, R * 0.1); c.fill(); glowDot(c, R * 0.03, -R * 0.64, R * 0.3, '#ff7a1a', 0.7 * pul);
    c.fillStyle = 'rgba(255,230,210,0.45)'; ell(c, -R * 0.66, R * 0.12, R * 0.06, R * 0.24, 0.3); c.fill(); circle(c, -R * 0.58, R * 0.46, R * 0.035);
    c.restore();
    bites24(c, R, st);
    if (st.face !== false) {
      const E = [[-0.3, 0.1, 0.17, 0.19, -0.15], [0.3, -0.01, 0.14, 0.15, 0.05]];
      E.forEach(([x0, y0, rx, ry, lid], k) => {
        const ex = x0 * R + e.lx * R * 0.04, ey = y0 * R + e.ly * R * 0.03, o = e.o;
        c.fillStyle = 'rgba(60,4,8,0.5)'; ell(c, ex, ey + R * 0.02, rx * R * 1.35, ry * R * 1.3); c.fill();
        ell(c, ex, ey, rx * R, ry * R * o); c.fillStyle = '#fbe6c4'; c.fill();
        if (o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05 + R * 0.04; c.fillStyle = '#e8651a'; circle(c, px, py, R * 0.085); c.fillStyle = INK134; circle(c, px, py, R * 0.045); c.fillStyle = '#fff'; circle(c, px - R * 0.025, py - R * 0.03, R * 0.02); }
        c.save(); ell(c, ex, ey, rx * R, ry * R * o); c.clip(); c.fillStyle = '#7a0c14'; c.fillRect(ex - rx * R * 1.3, ey - ry * R * 1.3, rx * R * 2.6, ry * R * (1.3 + lid)); c.restore();
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.045); ell(c, ex, ey, rx * R, ry * R * o); c.stroke();
        c.beginPath(); c.moveTo(ex - rx * R, ey + lid * ry * R); c.lineTo(ex + rx * R, ey + lid * ry * R); c.stroke();
      });
      // a wax tear
      c.beginPath(); const td = dripPath134(c, R, -R * 0.3, R * 0.25, R * 0.4, R * 0.055, 2); c.strokeStyle = INKR; c.lineWidth = lw27(R, 0.06); c.stroke(); c.fillStyle = '#c0141f'; c.fill();
      c.fillStyle = 'rgba(255,200,180,0.8)'; ell(c, td.x - td.r * 0.3, td.y - td.r * 0.1, td.r * 0.2, td.r * 0.4); c.fill();
      if (st.hurt > 0 || st.mouthOpen) { ell(c, R * 0.02, R * 0.42, R * 0.13, R * 0.15); c.fillStyle = '#2a0206'; c.fill(); }
      else { c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(-R * 0.2, R * 0.42); c.quadraticCurveTo(-R * 0.05, R * 0.34, R * 0.08, R * 0.43); c.quadraticCurveTo(R * 0.2, R * 0.52, R * 0.27, R * 0.4); c.stroke(); }
    }
    // the match still burns, charred and dripping
    const hx = R * 0.2, hy = -R * 1.3, f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06;
    const sg = c.createLinearGradient(0, -R * 0.62, hx, hy); sg.addColorStop(0, '#e8cd90'); sg.addColorStop(0.45, '#c8a468'); sg.addColorStop(0.8, '#2a1a10'); sg.addColorStop(1, '#120a08');
    c.lineCap = 'round'; c.beginPath(); c.moveTo(R * 0.03, -R * 0.62); c.quadraticCurveTo(R * 0.0, -R * 1.0, hx, hy + R * 0.05);
    c.strokeStyle = INK134; c.lineWidth = R * 0.17; c.stroke(); c.strokeStyle = sg; c.lineWidth = R * 0.1; c.stroke();
    glowDot(c, hx, hy - R * 0.2, R * 0.9, '#ff6a1a', 0.5);
    c.beginPath(); const hd = dripPath134(c, R, hx + R * 0.1, hy, R * 0.5, R * 0.08, 1); c.strokeStyle = INKR; c.lineWidth = lw27(R, 0.06); c.stroke(); c.fillStyle = '#b00e18'; c.fill();
    c.fillStyle = '#b00e18'; ell(c, hx, hy, R * 0.22, R * 0.19); c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.045); c.stroke();
    c.fillStyle = 'rgba(255,200,170,0.5)'; ell(c, hx - R * 0.07, hy - R * 0.06, R * 0.07, R * 0.04, -0.5); c.fill();
    flameShape(c, hx, hy - R * 0.3, R * 0.3 * f, R * 0.54 * f); c.fillStyle = '#ff4a10'; c.fill();
    flameShape(c, hx, hy - R * 0.22, R * 0.16 * f, R * 0.33 * f); c.fillStyle = '#ffd36a'; c.fill();
    for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i * 0.33) % 1; c.fillStyle = `rgba(70,60,55,${0.4 * (1 - ph)})`; circle(c, hx + Math.sin(t + i * 2) * R * 0.2, hy - R * 0.8 - ph * R * 0.6, R * (0.1 + ph * 0.2)); }
  }

  /* Lucifappel: Suikerschedel. A sugar skull, a marigold crown and a candle for a stem. */
  function marigold134(c, x, y, r, t, i) {
    c.save(); c.translate(x, y); c.rotate(i + Math.sin(t + i) * 0.05);
    c.fillStyle = '#2f8a3a'; for (const s of [-1, 1]) { ell(c, s * r * 1.05, r * 0.5, r * 0.55, r * 0.22, s * 0.6); c.fill(); }
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.fillStyle = k % 2 ? '#ff9a1e' : '#ffb830'; ell(c, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.46, r * 0.26, a); c.fill(); c.strokeStyle = '#8a3a06'; c.lineWidth = Math.max(0.3, r * 0.08); c.stroke(); }
    c.fillStyle = '#c2410c'; circle(c, 0, 0, r * 0.32); c.fillStyle = '#ffd23a'; circle(c, 0, 0, r * 0.14);
    c.restore();
  }
  function drawSugar134(c, R, st) {
    const t = st.t || 0, e = eye134(st), PINK = '#ff4fa3', TEAL = '#1fc8b8', INKP = '#2a1230';
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#f7efdc'); g.addColorStop(1, '#bfae86');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU; c.fillStyle = i % 2 ? PINK : TEAL; circle(c, Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.86, R * 0.04); }
    const spiral = (cx, cy, r0, dir, col) => { c.strokeStyle = col; c.lineWidth = lw27(R, 0.04); c.beginPath(); for (let a = 0; a <= 3.2 * TAU; a += 0.2) { const r = (r0 * a) / (3.2 * TAU), x = cx + Math.cos(a * dir) * r, y = cy + Math.sin(a * dir) * r; if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); };
    for (const s of [-1, 1]) {
      spiral(s * R * 0.66, R * 0.3, R * 0.2, s, TEAL);
      for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + 0.4; c.fillStyle = PINK; circle(c, s * R * 0.66 + Math.cos(a) * R * 0.27, R * 0.3 + Math.sin(a) * R * 0.27, R * 0.03); }
      c.fillStyle = TEAL; for (let k = 0; k < 3; k++) circle(c, s * R * (0.78 - k * 0.07), -R * 0.28 + k * R * 0.08, R * 0.03);
    }
    c.fillStyle = TEAL; c.beginPath(); c.moveTo(0, -R * 0.44); c.lineTo(R * 0.07, -R * 0.36); c.lineTo(0, -R * 0.28); c.lineTo(-R * 0.07, -R * 0.36); c.closePath(); c.fill();
    c.fillStyle = PINK; circle(c, 0, -R * 0.36, R * 0.025);
    c.restore();
    applePath(c, R); c.strokeStyle = INKP; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    for (const [x, y, r, i] of [[-0.8, -0.52, 0.19, 0.3], [-0.46, -0.84, 0.19, 1.1], [0.46, -0.84, 0.19, 2.1], [0.8, -0.52, 0.19, 0.7]]) marigold134(c, x * R, y * R, r * R, t, i);
    lucifBanner26(c, R, R * 0.86, R * 0.64, R * 0.17, '#ffb02e', true);
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3, ey = -R * 0.04;
        for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; c.fillStyle = k % 2 ? PINK : TEAL; ell(c, ex + Math.cos(a) * R * 0.25, ey + Math.sin(a) * R * 0.25, R * 0.085, R * 0.05, a); c.fill(); c.strokeStyle = INKP; c.lineWidth = Math.max(0.3, R * 0.02); c.stroke(); }
        ell(c, ex, ey, R * 0.2, R * 0.2 * Math.max(e.o, 0.25)); c.fillStyle = '#1a0a1e'; c.fill(); c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.04); c.stroke();
        if (e.o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05; glowDot(c, px, py, R * 0.14, '#ffb02e', 0.9); c.fillStyle = '#fff4c0'; circle(c, px, py, R * 0.035); }
        c.strokeStyle = s > 0 ? PINK : TEAL; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.arc(ex, ey, R * 0.36, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      }
      c.fillStyle = INKP; c.beginPath(); c.moveTo(0, R * 0.14); c.bezierCurveTo(-R * 0.1, R * 0.2, -R * 0.08, R * 0.32, 0, R * 0.28); c.bezierCurveTo(R * 0.08, R * 0.32, R * 0.1, R * 0.2, 0, R * 0.14); c.fill();
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.5, R * 0.2, R * 0.14); c.fillStyle = '#1a0a1e'; c.fill(); c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.04); c.stroke(); }
      else {
        c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.5, R * 0.44); c.quadraticCurveTo(0, R * 0.62, R * 0.5, R * 0.44); c.stroke();
        c.lineWidth = lw27(R, 0.035);
        for (let i = 0; i < 9; i++) { const x = -R * 0.45 + i * R * 0.1125, u = (x + R * 0.5) / (R * 1.0), y = (1 - u) * (1 - u) * R * 0.44 + 2 * (1 - u) * u * R * 0.62 + u * u * R * 0.44; c.beginPath(); c.moveTo(x, y - R * 0.07); c.lineTo(x, y + R * 0.07); c.stroke(); }
      }
    }
    lucifMatch26(c, R * 0.02, -R * 0.68, R * 0.1, -R * 1.4, R, t, true);
  }

  /* Lucifappel: Koud Vuur. Left in the freezer overnight. */
  function drawIce134(c, R, st) {
    const t = st.t || 0, e = eye134(st);
    glowDot(c, 0, 0, R * 2.0, '#38c8ff', 0.14);
    const shard = (x, y, w, h, rot) => { c.save(); c.translate(x, y); c.rotate(rot); const g = c.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, '#6ac0e8'); g.addColorStop(1, '#f2fdff'); c.beginPath(); c.moveTo(-w, 0); c.lineTo(-w * 0.2, -h); c.lineTo(w * 0.2, -h * 0.9); c.lineTo(w, 0); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.05); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = lw27(R, 0.025); c.beginPath(); c.moveTo(-w * 0.3, -h * 0.1); c.lineTo(-w * 0.1, -h * 0.8); c.stroke(); c.restore(); };
    for (const [x, h, w, r] of [[-0.55, 0.5, 0.15, -0.5], [-0.28, 0.76, 0.13, -0.18], [0.3, 0.68, 0.13, 0.22], [0.56, 0.48, 0.15, 0.5]]) shard(x * R, -R * 0.72, w * R, h * R, r);
    for (const [x, h, w] of [[-0.62, 0.55, 0.14], [-0.26, 0.85, 0.13], [0.14, 0.6, 0.13], [0.5, 0.74, 0.14]]) { c.save(); c.translate(x * R, R * 0.8); c.scale(1, -1); shard(0, 0, w * R, h * R, 0); c.restore(); }
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2); g.addColorStop(0, '#f6feff'); g.addColorStop(0.35, '#a8e4f6'); g.addColorStop(0.75, '#4a9ad0'); g.addColorStop(1, '#173f78');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const FAC = [[[-1.1, -0.2], [-0.2, -1.0], [0.3, -0.1]], [[0.3, -0.1], [-0.2, -1.0], [1.1, -0.4]], [[-1.1, -0.2], [0.3, -0.1], [-0.3, 1.0]], [[0.3, -0.1], [1.1, -0.4], [1.0, 0.8]], [[-0.3, 1.0], [0.3, -0.1], [1.0, 0.8]]];
    FAC.forEach((tri, i) => { c.beginPath(); tri.forEach(([x, y], k) => (k ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.closePath(); c.fillStyle = i % 2 ? 'rgba(255,255,255,0.14)' : 'rgba(10,40,90,0.14)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = lw27(R, 0.025); c.stroke(); });
    for (let i = 0; i < 46; i++) { const a = rnd24(i) * TAU, r = 0.74 + rnd24(i + 40) * 0.26; c.fillStyle = `rgba(255,255,255,${0.35 + rnd24(i + 9) * 0.45})`; circle(c, Math.cos(a) * r * R, Math.sin(a) * r * R * 0.96, R * (0.012 + rnd24(i + 3) * 0.03)); }
    const sh = c.createLinearGradient(0, R * 0.2, 0, R); sh.addColorStop(0, 'rgba(10,40,90,0)'); sh.addColorStop(1, 'rgba(10,40,90,0.45)'); c.fillStyle = sh; c.fillRect(-R * 1.2, R * 0.2, R * 2.4, R * 0.9);
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, -R * 0.5, -R * 0.42, R * 0.2, R * 0.09, -0.65); c.fill(); ell(c, -R * 0.2, -R * 0.62, R * 0.08, R * 0.04, -0.4); c.fill();
    c.save(); c.scale(0.86, 0.88); applePath(c, R); c.restore(); c.strokeStyle = 'rgba(232,251,255,0.7)'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
    c.fillStyle = 'rgba(10,37,72,0.5)'; c.fillRect(-R * 1.2, R * 0.66, R * 2.4, R * 0.5); c.fillStyle = 'rgba(232,251,255,0.7)'; c.fillRect(-R * 1.2, R * 0.7, R * 2.4, R * 0.035); c.fillRect(-R * 1.2, R * 0.86, R * 2.4, R * 0.035);
    c.restore();
    applePath(c, R); c.strokeStyle = '#0a2548'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + 0.5, x = Math.cos(a) * R * 1.03, y = Math.sin(a) * R * 0.99 - R * 0.04, l = R * (0.05 + rnd24(i + 4) * 0.05); c.strokeStyle = 'rgba(235,252,255,0.85)'; c.lineWidth = lw27(R, 0.03); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    if (st.face !== false) {
      c.fillStyle = 'rgba(255,130,170,0.4)'; for (const s of [-1, 1]) { ell(c, s * R * 0.56, R * 0.24, R * 0.14, R * 0.08); c.fill(); }
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = -R * 0.02 + e.ly * R * 0.02, o = e.o;
        ell(c, ex, ey, R * 0.16, R * 0.19 * o); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.stroke();
        if (o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05; c.fillStyle = '#37b8f0'; circle(c, px, py, R * 0.095); c.fillStyle = '#06223a'; circle(c, px, py, R * 0.05); c.fillStyle = '#fff'; circle(c, px - R * 0.03, py - R * 0.035, R * 0.03); }
        c.save(); ell(c, ex, ey, R * 0.16, R * 0.19 * o); c.clip(); c.fillStyle = '#8fd0ee'; c.fillRect(ex - R * 0.2, ey - R * 0.25, R * 0.4, R * 0.25 * o + R * 0.02); c.restore();
        c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.beginPath(); c.moveTo(ex - R * 0.16, ey - R * 0.04 * o); c.lineTo(ex + R * 0.16, ey - R * 0.04 * o); c.stroke();
        c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(s * R * 0.12, -R * 0.26); c.lineTo(s * R * 0.46, -R * 0.3); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = lw27(R, 0.03); for (let k = 0; k < 3; k++) { const x = ex + (k - 1) * R * 0.1; c.beginPath(); c.moveTo(x, ey - R * 0.19 * o); c.lineTo(x + (k - 1) * R * 0.04, ey - R * 0.3 * o); c.stroke(); }
      }
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.4, R * 0.12, R * 0.14); c.fillStyle = '#06223a'; c.fill(); }
      else { c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(-R * 0.14, R * 0.4); c.quadraticCurveTo(0, R * 0.36, R * 0.14, R * 0.4); c.stroke(); }
      for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; c.fillStyle = `rgba(235,250,255,${0.55 * (1 - ph)})`; ell(c, R * (0.12 + ph * 0.5), R * (0.46 - ph * 0.14), R * (0.07 + ph * 0.1), R * (0.05 + ph * 0.07)); c.fill(); }
    }
    // a frozen match with a flame that is not warm
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06, hx = R * 0.12, hy = -R * 1.36;
    c.lineCap = 'round'; c.beginPath(); c.moveTo(R * 0.02, -R * 0.64); c.lineTo(hx, hy + R * 0.05); c.strokeStyle = '#0a2548'; c.lineWidth = R * 0.17; c.stroke(); c.strokeStyle = '#dff6ff'; c.lineWidth = R * 0.1; c.stroke();
    c.fillStyle = '#bfe8ff'; ell(c, hx, hy, R * 0.2, R * 0.17); c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.stroke();
    glowDot(c, hx, hy - R * 0.25, R * 1.0, '#38c8ff', 0.5);
    flameShape(c, hx, hy - R * 0.3, R * 0.26 * f, R * 0.52 * f); c.fillStyle = '#2ab4ff'; c.fill();
    flameShape(c, hx, hy - R * 0.22, R * 0.13 * f, R * 0.3 * f); c.fillStyle = '#eafcff'; c.fill();
    for (let i = 0; i < 4; i++) { const a = t * 0.8 + (i * TAU) / 4; sparkle(c, Math.cos(a) * R * 1.45, Math.sin(a) * R * 0.9 - R * 0.2, R * (0.07 + 0.03 * Math.sin(t * 5 + i)), '#ffffff'); }
  }

  /* Lucifappel: Vulkaan. Basalt with lava in the cracks, and the match is what erupts. */
  function drawVolcano134(c, R, st) {
    const t = st.t || 0, e = eye134(st), pul = 0.7 + 0.3 * Math.sin(t * 2.6);
    for (let i = 0; i < 5; i++) { const ph = (t * 0.22 + i / 5) % 1; c.fillStyle = `rgba(70,60,66,${0.5 * (1 - ph)})`; circle(c, R * (0.1 + Math.sin(t * 0.6 + i) * 0.22) + ph * R * 0.3, -R * 1.65 - ph * R * 0.3, R * (0.12 + ph * 0.14)); }
    glowDot(c, 0, -R * 0.2, R * 1.9, '#ff5a10', 0.2);
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2); g.addColorStop(0, '#8a7c78'); g.addColorStop(0.4, '#4a3e40'); g.addColorStop(1, '#120c0c');
    // the cone sits behind the apple and rises out of the stem notch; lava runs down both sides
    const cone = () => { c.beginPath(); c.moveTo(-R * 0.8, -R * 0.5); c.lineTo(-R * 0.22, -R * 1.34); c.lineTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.closePath(); };
    cone(); c.fillStyle = g; c.fill(); c.save(); cone(); c.clip();
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.moveTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.lineTo(R * 0.2, -R * 0.5); c.closePath(); c.fill();
    c.lineCap = 'round'; for (const [w, col, a] of [[0.12, '#ff5a10', 0.3], [0.055, '#ff8a1e', 0.95], [0.022, '#ffe08a', 1]]) { c.strokeStyle = rgba(col, a * pul); c.lineWidth = R * w; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.1, -R * 1.3); c.quadraticCurveTo(s * R * 0.3, -R * 1.05, s * R * (0.46 + 0.05 * Math.sin(t * 2 + s)), -R * 0.5); c.stroke(); } }
    c.restore(); c.beginPath(); c.moveTo(-R * 0.8, -R * 0.5); c.lineTo(-R * 0.22, -R * 1.34); c.lineTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.strokeStyle = '#050308'; c.lineWidth = Math.max(1, R * 0.09); c.lineJoin = 'round'; c.stroke();
    c.fillStyle = '#1a1214'; ell(c, R * 0.02, -R * 1.34, R * 0.28, R * 0.09); c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke();
    const cg = c.createRadialGradient(R * 0.02, -R * 1.34, 0, R * 0.02, -R * 1.34, R * 0.26); cg.addColorStop(0, '#ffe08a'); cg.addColorStop(1, '#ff5a10'); c.fillStyle = cg; ell(c, R * 0.02, -R * 1.35, R * 0.22, R * 0.06); c.fill();
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const ROCK = [[[-1.1, -0.3], [-0.4, -1.0], [-0.1, -0.2]], [[-0.1, -0.2], [-0.4, -1.0], [0.8, -0.8]], [[-1.1, -0.3], [-0.1, -0.2], [-0.6, 0.7]], [[0.8, -0.8], [-0.1, -0.2], [1.1, 0.2]], [[-0.6, 0.7], [-0.1, -0.2], [0.5, 1.0]], [[-0.1, -0.2], [1.1, 0.2], [0.5, 1.0]]];
    ROCK.forEach((tri, i) => { c.beginPath(); tri.forEach(([x, y], k) => (k ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.closePath(); c.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.22)'; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = lw27(R, 0.03); c.stroke(); });
    const VEIN = [[[-0.98, -0.15], [-0.72, -0.02], [-0.64, 0.28], [-0.84, 0.5], [-0.64, 0.8]], [[1.0, -0.3], [0.76, -0.12], [0.82, 0.2], [0.62, 0.42], [0.8, 0.7], [0.62, 0.92]], [[-0.3, 1.0], [-0.22, 0.78], [-0.36, 0.64]], [[0.3, 1.0], [0.22, 0.8], [0.36, 0.68]], [[-0.5, -0.5], [-0.36, -0.36], [-0.52, -0.24]], [[0.52, -0.52], [0.38, -0.38], [0.54, -0.26]]];
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [w, col, a] of [[0.15, '#ff5a10', 0.25], [0.065, '#ff8a1e', 0.95], [0.025, '#ffe08a', 1]]) { c.strokeStyle = rgba(col, a * pul); c.lineWidth = R * w; for (const pl of VEIN) { c.beginPath(); pl.forEach(([x, y], i) => (i ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.stroke(); } }
    c.restore();
    applePath(c, R); c.strokeStyle = '#050308'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = R * 0.04 + e.ly * R * 0.02, o = e.o;
        c.fillStyle = '#07050a'; ell(c, ex, ey, R * 0.21, R * 0.19 * o); c.fill();
        const lg = c.createRadialGradient(ex, ey, 0, ex, ey, R * 0.2); lg.addColorStop(0, '#fff0a0'); lg.addColorStop(0.5, '#ff9a1e'); lg.addColorStop(1, '#e8400a'); c.fillStyle = lg; ell(c, ex, ey, R * 0.16, R * 0.13 * o); c.fill();
        glowDot(c, ex, ey, R * 0.42, '#ff8a1e', 0.3 * pul);
        if (o > 0.3) { c.fillStyle = '#07050a'; ell(c, ex + e.lx * R * 0.04, ey, R * 0.03, R * 0.1 * o); c.fill(); }
        c.fillStyle = '#1c1416'; c.beginPath(); c.moveTo(s * R * 0.02, -R * 0.16); c.lineTo(s * R * 0.62, -R * 0.38); c.lineTo(s * R * 0.58, -R * 0.12); c.lineTo(s * R * 0.44, -R * 0.08); c.lineTo(s * R * 0.12, -R * 0.04); c.closePath(); c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.04); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = lw27(R, 0.025); c.beginPath(); c.moveTo(s * R * 0.06, -R * 0.15); c.lineTo(s * R * 0.56, -R * 0.35); c.stroke();
      }
      const mg = c.createLinearGradient(0, R * 0.32, 0, R * 0.64); mg.addColorStop(0, '#ffe08a'); mg.addColorStop(1, '#e8400a');
      c.beginPath(); c.moveTo(-R * 0.4, R * 0.34);
      if (st.hurt > 0 || st.mouthOpen) { c.quadraticCurveTo(0, R * 0.84, R * 0.4, R * 0.34); c.closePath(); c.fillStyle = mg; c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke(); }
      else {
        for (let i = 1; i <= 8; i++) c.lineTo(-R * 0.4 + i * R * 0.1, R * (i % 2 ? 0.58 : 0.46));
        c.lineTo(R * 0.4, R * 0.34); c.quadraticCurveTo(0, R * 0.28, -R * 0.4, R * 0.34); c.closePath(); c.fillStyle = mg; c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke();
        c.fillStyle = '#2a2024'; for (let i = 0; i < 4; i++) { const x = -R * 0.3 + i * R * 0.2; c.beginPath(); c.moveTo(x, R * 0.32); c.lineTo(x + R * 0.1, R * 0.32); c.lineTo(x + R * 0.05, R * 0.44); c.closePath(); c.fill(); }
      }
    }
    // the match is what erupts
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06;
    lucifMatch26(c, R * 0.02, -R * 1.32, R * 0.1, -R * 1.6, R, t, true);
    const hx = R * 0.1, hy = -R * 1.76;
    glowDot(c, hx, hy - R * 0.1, R * 1.0, '#ff4a10', 0.4);
    for (const [dx, h, w] of [[-0.2, 0.34, 0.1], [0.2, 0.3, 0.09]]) { flameShape(c, hx + dx * R, hy, w * R * f, h * R * f); c.fillStyle = '#ff6a1a'; c.fill(); }
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.7 + i / 9) % 1, dir = (i % 2 ? 1 : -1) * (0.25 + rnd24(i + 3) * 0.75), x = R * 0.02 + dir * ph * R * 0.95, y = -R * 1.38 - Math.sin(ph * Math.PI) * R * 0.6 + ph * ph * R * 0.9;
      glowDot(c, x, y, R * (0.08 + rnd24(i) * 0.06), i % 3 ? '#ff8a1e' : '#ffe08a', 0.9 * (1 - ph * 0.6));
    }
  }

  /* Lucky: Eenarmige Bandiet. The lever is an arm, the reels are eyes */
  function drawBandiet132(c, R, st) {
    const t = st.t || 0, pull = Math.max(0, Math.sin(t * 1.2)) * 0.45;
    // upper arm, elbow, forearm, a hand around the ball
    const sx = R * 0.9, sy = R * 0.15, el = [R * 1.3, -R * (0.15 - pull * 0.3)], hx = R * 1.22, hy = -R * (0.8 - pull);
    c.lineCap = 'round';
    for (const [w, col] of [[0.16, '#2a2018'], [0.09, '#efe6d2']]) {
      c.strokeStyle = col; c.lineWidth = lw27(R, w); c.beginPath(); c.moveTo(sx, sy); c.lineTo(el[0], el[1]); c.lineTo(hx, hy); c.stroke();
    }
    c.fillStyle = '#efe6d2'; c.strokeStyle = '#2a2018'; c.lineWidth = lw27(R, 0.03); circle(c, el[0], el[1], R * 0.08); c.stroke();
    c.fillStyle = '#d5232f'; circle(c, hx, hy - R * 0.08, R * 0.15); c.strokeStyle = '#3a0408'; c.lineWidth = lw27(R, 0.035); c.stroke();
    c.strokeStyle = '#efe6d2'; c.lineWidth = lw27(R, 0.045);
    for (let k = 0; k < 4; k++) { const a = -2.6 + k * 0.5; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + Math.cos(a) * R * 0.18, hy + Math.sin(a) * R * 0.18 - R * 0.05, hx + Math.cos(a + 0.9) * R * 0.17, hy - R * 0.08 + Math.sin(a + 0.9) * R * 0.17); c.stroke(); }
    skinBody24(c, R, st, { g: ['#e8d090', '#9a7428', '#2a1a04'], vein: 'rgba(255,240,200,0.12)', hl: 'rgba(255,255,255,0.4)', out: '#2a1a04',
      inside(c, R) {
        c.fillStyle = 'rgba(120,60,20,0.45)'; for (const [x, y, r] of [[-0.6, 0.5, 0.2], [0.5, 0.65, 0.16], [-0.7, -0.4, 0.12], [0.75, -0.3, 0.1]]) circle(c, x * R, y * R, r * R);
        c.fillStyle = '#1a0a04'; rrect(c, -R * 0.82, -R * 0.4, R * 1.64, R * 0.56, R * 0.08); c.fill();
        for (let i = 0; i < 3; i++) {
          const x = -R * 0.52 + i * R * 0.52, spin = i === 1 ? (t * 6) % 1 : i === 2 && st.hurt > 0 ? (t * 9) % 1 : 0;
          c.save(); rrect(c, x - R * 0.22, -R * 0.35, R * 0.44, R * 0.46, R * 0.05); c.fillStyle = '#f2e6d0'; c.fill(); c.clip();
          for (const dy of [-1, 0, 1]) {
            const y = -R * 0.12 + (dy + spin) * R * 0.46;
            ell(c, x, y, R * 0.17, R * 0.15); c.fillStyle = '#fbf6ea'; c.fill();
            c.strokeStyle = 'rgba(200,30,40,0.6)'; c.lineWidth = lw27(R, 0.012); for (let v = 0; v < 4; v++) { const a = v * 1.6 + i; c.beginPath(); c.moveTo(x + Math.cos(a) * R * 0.16, y + Math.sin(a) * R * 0.14); c.lineTo(x + Math.cos(a) * R * 0.08, y + Math.sin(a) * R * 0.07); c.stroke(); }
            const lx = clamp(st.lookX || 0, -1, 1) * R * 0.04;
            c.fillStyle = ['#3a6a2a', '#7a1a20', '#2a4a8a'][i]; circle(c, x + lx, y, R * 0.08); c.fillStyle = '#0a0204'; circle(c, x + lx, y, R * 0.04);
          }
          c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x - R * 0.22, -R * 0.35, R * 0.44, R * 0.09); c.fillRect(x - R * 0.22, R * 0.02, R * 0.44, R * 0.09);
          c.restore();
        }
      } });
    if (st.face !== false) {
      // a coin slot for a mouth, and coins for teeth
      c.fillStyle = '#7a0a14'; rrect(c, -R * 0.36, R * 0.26, R * 0.72, R * 0.22, R * 0.06); c.fill();
      c.fillStyle = '#0a0204'; rrect(c, -R * 0.28, R * 0.32, R * 0.56, R * 0.1, R * 0.03); c.fill();
      c.fillStyle = '#ffd84a'; c.strokeStyle = '#6a4008'; c.lineWidth = lw27(R, 0.02);
      for (let i = 0; i < 6; i++) { const x = -R * 0.25 + i * R * 0.1; ell(c, x, R * 0.3, R * 0.035, R * 0.06); c.fill(); c.stroke(); }
    }
    drawStem(c, R, st.leaf || 0, 0);
  }

  const NEW132 = {
    apple: { name: 'Prikmond', tier: 'Grotesque', line: 'The face is a lamprey mouth now. Three rings of teeth, all pointing in, all turning. It does not chew. It holds.', draw: drawPrik132, bg: ['#3a0a18', '#0e0206'], motif: 'embers', acc: '#ff6a8a' },
    appel: { name: 'Kappersfail', tier: 'Grotesque', line: 'One in four cuts is a fail. He got all four at once. The mullet is stapled back on. Nobody said anything.', draw: drawKapper132, bg: ['#2a1010', '#0a0404'], motif: 'crumbs', acc: '#e8c2a8' },
    rot: { name: 'Staartbijter', tier: 'Grotesque', line: 'A small Ouroboros moved in. Out the left eye, around the whole apple, back into its own tail. Rent free, forever.', draw: drawOuro132, bg: ['#1e1a0a', '#060502'], motif: 'spores', acc: '#ffae42' },
    krul: { name: 'Kassabon', tier: 'Grotesque', line: 'Everything must go, so it went. A receipt for a tongue, a barcode cut in the cheek, one eye on sale. Still laughing at the price.', draw: drawBon132, bg: ['#2a2404', '#0a0802'], motif: 'fair', acc: '#f2c200' },
    mika: { name: '8 Procent', tier: 'Grotesque', line: 'Same face, behind cracked glass. A charger in the skull, cable for veins, 8 percent left. Nothing gets to him. The battery might.', draw: drawTel132, bg: ['#0a1430', '#02040c'], motif: 'spark', acc: '#5a8aff' },
    pean: { name: 'Blokrot', tier: 'Grotesque', line: 'Hit by one Block Worm too many. The pieces grew in. A T in the back, an L in the cheek, the next one already falling.', draw: drawBlok132, bg: ['#0a1a2a', '#02060a'], motif: 'lasers', acc: '#3fc6d8' },
    apploa: { name: 'Handjeklap', tier: 'Grotesque', line: 'The wings are arms now, suit sleeves and all, and every hand wants something. Gold ring on each one. She votes with all of them.', draw: drawHand132, bg: ['#1a1a2a', '#06060c'], motif: 'stars', acc: '#e3a54a', wings: handWings132 },
    lucif: { name: 'Benzinekop', tier: 'Grotesque', line: 'Someone filled him up and left the nozzle in. Fuel runs out of both eyes and the match is still lit. Regular, unleaded.', draw: drawPomp132, bg: ['#1a2004', '#060800'], motif: 'hellbox', acc: '#b8e81a' },
    lucky: { name: 'Eenarmige Bandiet', tier: 'Grotesque', line: 'The lever is an arm now, bone and all, and it pulls itself. The reels are eyes. They spin. They never stop on anything nice.', draw: drawBandiet132, bg: ['#2a1a04', '#0a0602'], motif: 'fair', acc: '#ffd84a' },
  };
  for (const id in NEW132) if (SKINS[id]) SKINS[id].push(NEW132[id]);
  SKINS.lucif.push(
    { name: 'Suikerschedel', tier: 'Epic', line: 'Dead already, and doing better than most. Marigolds in the hair, a candle for a stem, sugar all the way down.', draw: drawSugar134, bg: ['#1a0e2e', '#07030f'], motif: 'petals', acc: '#ff7ab8' },
    { name: 'Koud Vuur', tier: 'Epic', line: 'Left in the freezer overnight. The box is ice, the match is ice, and the flame is blue and warms nothing. He does not mind.', draw: drawIce134, bg: ['#0e2a44', '#030a14'], motif: 'flakes', acc: '#7fdcff' },
    { name: 'Vulkaan', tier: 'Epic', line: 'Basalt outside, lava in every crack. Erupts on a schedule nobody has seen. The match is just what comes out first.', draw: drawVolcano134, bg: ['#2a1c24', '#0a0608'], motif: 'embers', acc: '#ff6a2a' },
  );

  /* ---- the epic layer: an aura, slow light rays and particles that belong to the skin ---- */
  const FX122 = {
    'Granny Smith': { mote: 'spark' }, Kermisappel: { mote: 'spark', col2: '#ffd36a' }, Spiegelbol: { mote: 'spark' },
    'Streamer Setup': { mote: 'pixel' }, Capybara: { mote: 'bubble' }, 'Paarse Pluis': { mote: 'spark' },
    Schimmelkoning: { mote: 'spore' }, Zonnebloem: { mote: 'petal' }, Kortsluiting: { mote: 'spark', col2: '#ffffff' },
    Zomerkrul: { mote: 'bubble' }, Stroopkrul: { mote: 'ember' }, Kroket: { mote: 'ember' },
    'Delfts Blauw': { mote: 'spark', col: '#6a8aff' }, Klokwerk: { mote: 'spark' }, IJsblok: { mote: 'spark', col: '#7ac8ff' },
    Driekleur: { mote: 'dot' }, 'Rave Cavia': { mote: 'pixel' }, Klompen: { mote: 'petal' },
    Koningsdag: { mote: 'pixel' }, Feniks: { mote: 'ember' }, Sterinsigne: { mote: 'spark' }, Deltaplan: { mote: 'bubble' },
    Lucifer: { mote: 'ember' }, 'Kort Lontje': { mote: 'ember' }, Afterparty: { mote: 'pixel' },
    Binnenstebuiten: { mote: 'drip' }, Madennest: { mote: 'fly' }, Vliegenkoning: { mote: 'fly', n: 9 }, Gebit: { mote: 'drip', dcol: '#c84a5a' },
    Lappendeken: { mote: 'spark', col2: '#bfe8ff' }, Ogenvacht: { mote: 'eye' }, Botvleugels: { mote: 'feather' }, Smeltkop: { mote: 'ember' },
    Jackpot: { mote: 'coin' }, 'Snake Eyes': { mote: 'drip' },
    Prikmond: { mote: 'drip', dcol: '#e8dcc0' }, Kappersfail: { mote: 'feather', n: 6 }, Staartbijter: { mote: 'spore' }, Kassabon: { mote: 'coin' },
    '8 Procent': { mote: 'pixel' }, Blokrot: { mote: 'pixel', col: '#3fc6d8' }, Handjeklap: { mote: 'coin', n: 5 }, Benzinekop: { mote: 'drip', dcol: '#b8c81a' }, 'Eenarmige Bandiet': { mote: 'eye' },
    Suikerschedel: { mote: 'petal', col: '#ff9a1e', col2: '#ffd36a' }, 'Koud Vuur': { mote: 'spark', col: '#7fdcff', col2: '#ffffff' }, Vulkaan: { mote: 'ember', col: '#ff6a2a' },
  };
  function mote122(c, R, fx, i, t) {
    const n = fx.n, r1 = rnd24(i + 11), r2 = rnd24(i + 23), m = fx.mote;
    if (m === 'ember' || m === 'bubble' || m === 'spore' || m === 'petal' || m === 'feather') {
      const ph = (t * 0.32 * (0.6 + r2) + r1) % 1, x = (r1 - 0.5) * R * 2.3 + Math.sin(t * 1.5 + i) * R * 0.12, y = R * 1.0 - ph * R * 2.5, a = Math.sin(ph * Math.PI);
      if (m === 'ember') glowDot(c, x, y, R * (0.14 + r2 * 0.1), i % 3 ? fx.col : '#ffd36a', 0.75 * a);
      else if (m === 'bubble') { c.strokeStyle = rgba(fx.col, 0.7 * a); c.lineWidth = lw27(R, 0.03); c.beginPath(); c.arc(x, y, R * (0.05 + r2 * 0.06), 0, TAU); c.stroke(); }
      else if (m === 'spore') { c.fillStyle = rgba(fx.col, 0.55 * a); circle(c, x, y, R * (0.025 + r2 * 0.03)); }
      else { c.save(); c.translate(x, y + ph * R * 0.6); c.rotate(t * 2 + i); c.fillStyle = m === 'feather' ? `rgba(22,18,26,${0.85 * a})` : rgba(fx.col, 0.75 * a); ell(c, 0, 0, R * 0.09, R * (m === 'feather' ? 0.03 : 0.04)); c.fill(); c.restore(); }
      return;
    }
    if (m === 'drip') {
      const ph = (t * 0.45 * (0.6 + r2) + r1) % 1, x = (r1 - 0.5) * R * 1.5, y = R * 0.7 + ph * R * 0.9;
      c.fillStyle = rgba(fx.dcol || '#8a0a14', 0.85 * (1 - ph));
      c.beginPath(); c.moveTo(x, y - R * 0.1); c.quadraticCurveTo(x + R * 0.06, y, x, y + R * 0.05); c.quadraticCurveTo(x - R * 0.06, y, x, y - R * 0.1); c.fill();
      return;
    }
    const a = t * (0.6 + r2 * 0.8) * (i % 2 ? 1 : -1) + (i / n) * TAU, rr = R * (1.18 + r1 * 0.32);
    let x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.62 - R * 0.08;
    if (m === 'fly') {
      x += Math.sin(t * 13 + i * 3) * R * 0.08; y += Math.cos(t * 11 + i) * R * 0.08;
      c.fillStyle = 'rgba(230,240,255,0.55)'; ell(c, x - R * 0.04, y - R * 0.04, R * 0.05, R * 0.025, Math.sin(t * 60 + i)); c.fill(); ell(c, x + R * 0.04, y - R * 0.04, R * 0.05, R * 0.025, -Math.sin(t * 60 + i)); c.fill();
      c.fillStyle = '#0a0a08'; circle(c, x, y, R * 0.045);
    } else if (m === 'pixel') { c.fillStyle = i % 2 ? fx.col : `hsl(${(t * 120 + i * 50) % 360},100%,62%)`; const s = R * 0.08; c.fillRect(x - s / 2, y - s / 2, s, s); }
    else if (m === 'coin') { const w = Math.abs(Math.cos(t * 4 + i)); ell(c, x, y, R * 0.09 * Math.max(0.15, w), R * 0.09); c.fillStyle = '#ffd84a'; c.fill(); c.strokeStyle = '#8a5a10'; c.lineWidth = lw27(R, 0.02); c.stroke(); }
    else if (m === 'eye') { const op = Math.sin(t * 1.4 + i * 2) > 0.9 ? 0.15 : 1; ell(c, x, y, R * 0.08, R * 0.07 * op); c.fillStyle = '#f6efe0'; c.fill(); if (op > 0.5) { c.fillStyle = '#7a1a20'; circle(c, x - Math.cos(a) * R * 0.025, y - Math.sin(a) * R * 0.02, R * 0.035); } }
    else if (m === 'dot') glowDot(c, x, y, R * 0.12, fx.col, 0.6);
    else sparkle(c, x, y, R * (0.08 + 0.05 * Math.sin(t * 6 + i)), i % 3 ? fx.col2 : fx.col);
  }
  function epic122(S) {
    if (S.fx122) return;
    const fx = S.fx122 = Object.assign({ col: S.acc, col2: '#ffffff', mote: 'spark', n: 7 }, FX122[S.name] || {});
    if (!S.tier) S.tier = 'Epic';
    const d0 = S.draw;
    S.draw = function (c, R, st) {
      d0(c, R, st);
      const t = st.t || 0, k = 0.78 + 0.22 * Math.sin(t * 2.2);
      // behind everything that is already drawn
      c.save(); c.globalCompositeOperation = 'destination-over';
      c.fillStyle = rgba(fx.col2, 0.08 * k);
      for (let i = 0; i < 8; i++) {
        const a = t * 0.45 + (i * TAU) / 8;
        c.beginPath(); c.moveTo(Math.cos(a - 0.1) * R * 0.9, Math.sin(a - 0.1) * R * 0.9); c.lineTo(Math.cos(a) * R * 2.05, Math.sin(a) * R * 2.05); c.lineTo(Math.cos(a + 0.1) * R * 0.9, Math.sin(a + 0.1) * R * 0.9); c.closePath(); c.fill();
      }
      const g = c.createRadialGradient(0, 0, R * 0.55, 0, 0, R * 2.05);
      g.addColorStop(0, rgba(fx.col, 0.5 * k)); g.addColorStop(0.45, rgba(fx.col, 0.16 * k)); g.addColorStop(1, rgba(fx.col, 0));
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 2.05, 0, TAU); c.fill();
      c.restore();
      // bites still go through, glow and all
      if (st.bites && st.bites.length) { c.save(); c.globalCompositeOperation = 'destination-out'; for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); } c.restore(); }
      c.save(); c.lineCap = 'round';
      for (let i = 0; i < fx.n; i++) mote122(c, R, fx, i, t);
      c.restore();
    };
  }
  /* ------------------------------------------------------------------ v13.5: Game Night
     Six arcade skins for every apple. Each one renders the original apple into a buffer and runs it
     through a look: 8-Bit, Game Boy, Neon Arcade, Glitch, Hologram, Cel Shade. Kills in a fight
     leave a burst in the same style. Looks only, nothing else changes. */
  const GN135 = (() => {
    const bufs = {};
    const buf = (k, w, h) => {
      let b = bufs[k];
      if (!b) { b = bufs[k] = document.createElement('canvas'); b.ctx = b.getContext('2d', { willReadFrequently: true }); }   /* P1 */
      /* S1 (v14.0): reset the transform BEFORE clearing. The old order cleared a quarter of the buffer only,
         so the previous apple (often another character) stayed behind as a round ghost. */
      b.ctx.setTransform(1, 0, 0, 1, 0, 0); b.ctx.globalCompositeOperation = 'source-over'; b.ctx.globalAlpha = 1; b.ctx.imageSmoothingEnabled = true;
      if (b.width !== w || b.height !== h) { b.width = w; b.height = h; } else b.ctx.clearRect(0, 0, w, h);
      return b;
    };
    // the original apple, rendered into a square buffer that covers -box/2 .. box/2
    function base(c, R, st) {
      const m = c.getTransform ? c.getTransform() : { a: 1, b: 0 };
      const s = clamp(Math.hypot(m.a, m.b) || 1, 0.5, 8), box = R * 5.2, px = clamp(Math.ceil(box * s), 24, 520);
      const b = buf('base', px, px), k = px / box;
      b.ctx.setTransform(k, 0, 0, k, px / 2, px / 2);
      GLOW14.cap = [];
      try { drawApple(b.ctx, R, Object.assign({}, st, { skin: 0 })); } finally { lastB = { cv: b, box, px, glows: GLOW14.cap }; GLOW14.cap = null; }
      return lastB;
    }
    /* P1 (v14.0): the filtered apple is cached. Key: character, look, scale (quarter steps) and R; inside it a
       pose bucket: blink, hurt, facing in 8 directions, the animation clock in 12 steps a second, bites and the
       powerup flags that change the drawing. A cache refreshes at most 15 times a second. */
    const CACHE14 = new Map();
    function cached14(th, c, R, st) {
      const m = c.getTransform(), s = Math.hypot(m.a, m.b) || 1, sq = Math.max(0.5, Math.round(s * 4) / 4);
      const lx = st.lookX || 0, ly = st.lookY || 0, face = Math.hypot(lx, ly) < 0.3 ? 8 : (Math.round(Math.atan2(ly, lx) / (TAU / 8)) + 8) % 8;
      const pose = `${st.blink != null && st.blink < 0.5 ? 1 : 0}${st.hurt > 0 ? 1 : 0}${face}${Math.floor((st.t || 0) * 12)}|${st.bites ? st.bites.length : 0}${st.mouthOpen ? 1 : 0}${st.chewing ? 1 : 0}${st.horns ? 1 : 0}${st.shellUp ? 1 : 0}${st.toffee ? 1 : 0}${st.cyanide ? 1 : 0}${st.twin ? 1 : 0}${st.leaf != null ? Math.round(st.leaf * 4) : 0}`;
      const key = `${st.char || 'apple'}|${th.name}|${sq}|${R}`;
      let e = CACHE14.get(key);
      if (!e) {
        if (CACHE14.size > 64) CACHE14.clear();
        e = { cv: document.createElement('canvas'), pose: null, at: -1e9 }; e.ctx = e.cv.getContext('2d', { willReadFrequently: true }); CACHE14.set(key, e);
      }
      const now = performance.now();
      if (e.pose !== pose && (e.pose === null || now - e.at >= 1000 / 15 || now < e.at)) {
        const half = R * 3.2, px = Math.max(8, Math.ceil(half * 2 * sq));
        e.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (e.cv.width !== px) { e.cv.width = px; e.cv.height = px; } else e.ctx.clearRect(0, 0, px, px);
        e.ctx.setTransform(sq, 0, 0, sq, px / 2, px / 2); e.ctx.lineJoin = 'round'; e.ctx.lineCap = 'round';
        lastB = null; th.draw(e.ctx, R, st); glowsOver(e.ctx, lastB);
        e.pose = pose; e.at = now;
      }
      const h = R * 3.2;
      c.drawImage(e.cv, -h, -h, h * 2, h * 2);
    }
    /* S1: glows (Lucifappel's flame) go on top of the filtered apple, unfiltered */
    let lastB = null;
    function glowsOver(c, B) {
      if (!B || !B.glows || !B.glows.length) return;
      const k = B.px / B.box;
      c.save();
      for (const g of B.glows) {
        const x = (g.x - B.px / 2) / k, y = (g.y - B.px / 2) / k, r = g.r / k;
        const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, g.c0); gr.addColorStop(1, g.c1);
        c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      }
      c.restore();
    }
    // a solid colour copy of the silhouette
    function tint(src, col, key) {
      const b = buf(key || 'tint', src.width, src.height);
      b.ctx.drawImage(src, 0, 0); b.ctx.globalCompositeOperation = 'source-in'; b.ctx.fillStyle = col; b.ctx.fillRect(0, 0, src.width, src.height);
      return b;
    }
    const put = (c, cv, box, dx = 0, dy = 0, sc = 1) => c.drawImage(cv, -box * sc / 2 + dx, -box * sc / 2 + dy, box * sc, box * sc);
    // low resolution copy with its colours run through fn(r,g,b) -> [r,g,b]
    function crunch(B, R, cells, fn) {
      const n = clamp(Math.round(B.box / (R * 2) * cells), 12, 96), sm = buf('small', n, n);
      sm.ctx.drawImage(B.cv, 0, 0, n, n);
      const img = sm.ctx.getImageData(0, 0, n, n), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
        const a = d[i + 3] / 255, o = fn(d[i] / a, d[i + 1] / a, d[i + 2] / a);
        d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
      }
      sm.ctx.putImageData(img, 0, 0);
      return sm;
    }
    const lw = (R, k) => Math.max(0.6, R * k);

    /* 8-Bit: 22 big pixels across, a 4 level palette per channel, a dark pixel rim */
    function draw8(c, R, st) {
      const B = base(c, R, st);
      const q = (v) => Math.min(255, Math.round(v / 85) * 85);
      const sm = crunch(B, R, 22, (r, g, b) => [q(r * 1.08), q(g), q(b * 0.95)]);
      c.save(); c.imageSmoothingEnabled = false;
      const n = sm.width, cell = B.box / n;
      const rim = tint(sm, '#120a14', 'rim');
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(c, rim, B.box, dx * cell, dy * cell);
      put(c, sm, B.box);
      c.restore();
      // a 1UP coin bobbing over the stem
      const t = st.t || 0, y = -R * 1.75 + Math.sin(t * 3) * R * 0.08, w = Math.abs(Math.cos(t * 2.4));
      c.fillStyle = '#120a14'; c.fillRect(-R * 0.2 * Math.max(0.2, w) - cell * 0.5, y - R * 0.22, R * 0.4 * Math.max(0.2, w) + cell, R * 0.44);
      c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.2 * Math.max(0.2, w), y - R * 0.2, R * 0.4 * Math.max(0.2, w), R * 0.4);
      c.fillStyle = '#fff6c0'; c.fillRect(-R * 0.12 * Math.max(0.2, w), y - R * 0.14, R * 0.06, R * 0.18);
    }

    /* Game Boy: four greens, a dot matrix grid, a little ghosting */
    const GB = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];
    function drawGB(c, R, st) {
      const B = base(c, R, st);
      const sm = crunch(B, R, 30, (r, g, b) => { const l = (r * 0.3 + g * 0.59 + b * 0.11) / 255; return GB[clamp(Math.floor(Math.pow(l, 0.8) * 4), 0, 3)]; });
      const n = sm.width, up = buf('gbup', n * 4, n * 4);
      up.ctx.imageSmoothingEnabled = false; up.ctx.drawImage(sm, 0, 0, n * 4, n * 4);
      up.ctx.globalCompositeOperation = 'source-atop'; up.ctx.fillStyle = 'rgba(15,56,15,0.32)';
      for (let i = 0; i <= n; i++) { up.ctx.fillRect(i * 4, 0, 1, n * 4); up.ctx.fillRect(0, i * 4, n * 4, 1); }
      c.save(); c.imageSmoothingEnabled = false;
      c.globalAlpha = 0.22; put(c, up, B.box, R * 0.06, R * 0.05);
      c.globalAlpha = 1; put(c, up, B.box);
      c.restore();
    }

    /* Neon Arcade: a dark body, magenta and cyan tubes around the edge, a scan line running up */
    function drawNeon(c, R, st) {
      const B = base(c, R, st), t = st.t || 0, pulse = 0.75 + 0.25 * Math.sin(t * 5);
      const mag = tint(B.cv, '#ff3ad8', 'neonA'), cy = tint(B.cv, '#3af0ff', 'neonB');
      c.save();
      c.globalAlpha = 0.35 * pulse; put(c, mag, B.box, 0, 0, 1.13);
      c.globalAlpha = 0.9; put(c, mag, B.box, -R * 0.02, 0, 1.065);
      c.globalAlpha = 0.85; put(c, cy, B.box, R * 0.03, R * 0.01, 1.035);
      c.restore();
      const o = buf('neonO', B.px, B.px);
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      o.ctx.fillStyle = 'rgba(14,4,30,0.62)'; o.ctx.fillRect(0, 0, B.px, B.px);
      const sy = (1 - ((t * 0.45) % 1)) * B.px;
      const g = o.ctx.createLinearGradient(0, sy - B.px * 0.08, 0, sy + B.px * 0.08);
      g.addColorStop(0, 'rgba(58,240,255,0)'); g.addColorStop(0.5, 'rgba(58,240,255,0.55)'); g.addColorStop(1, 'rgba(58,240,255,0)');
      o.ctx.fillStyle = g; o.ctx.fillRect(0, sy - B.px * 0.08, B.px, B.px * 0.16);
      o.ctx.globalCompositeOperation = 'lighter'; o.ctx.globalAlpha = 0.25; o.ctx.drawImage(B.cv, 0, 0);
      put(c, o, B.box);
    }

    /* Glitch: split channels, and every so often the slices skip sideways */
    function drawGlitch(c, R, st) {
      const B = base(c, R, st), t = st.t || 0, f = Math.floor(t * 14), rr = (i) => rnd24(f * 7 + i);
      const on = (t % 1.9) < 0.28 || (st.hurt > 0) || rr(99) < 0.04, sh = on ? R * 0.16 : R * 0.05;
      const red = tint(B.cv, '#ff2a4a', 'glR'), cy = tint(B.cv, '#2af0ff', 'glC');
      c.save();
      c.globalAlpha = 0.55; put(c, red, B.box, -sh, 0); put(c, cy, B.box, sh, on ? R * 0.04 : 0);
      c.globalAlpha = 1;
      if (!on) put(c, B.cv, B.box);
      else {
        const strips = 9, hs = B.px / strips, hb = B.box / strips;
        for (let i = 0; i < strips; i++) {
          const dx = rr(i) < 0.45 ? (rr(i + 20) - 0.5) * R * 0.7 : 0;
          c.drawImage(B.cv, 0, i * hs, B.px, hs, -B.box / 2 + dx, -B.box / 2 + i * hb, B.box, hb);
        }
        for (let i = 0; i < 6; i++) {
          c.fillStyle = ['#ff2a4a', '#2af0ff', '#ffffff', '#f2ff3a'][i % 4];
          c.fillRect((rr(i + 40) - 0.5) * R * 2.4, (rr(i + 60) - 0.5) * R * 2.2, R * (0.08 + rr(i + 80) * 0.3), R * 0.07);
        }
      }
      c.restore();
    }

    /* Hologram: cyan, see through, scan lines, a projector under the feet */
    function drawHolo(c, R, st) {
      const B = base(c, R, st), t = st.t || 0;
      const flick = st.hurt > 0 ? 0.35 + Math.random() * 0.5 : (Math.sin(t * 23) > 0.96 ? 0.45 : 0.8);
      const o = buf('holo', B.px, B.px);
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'color'; o.ctx.fillStyle = '#3ad8ff'; o.ctx.fillRect(0, 0, B.px, B.px);
      o.ctx.globalCompositeOperation = 'destination-in'; o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      const step = Math.max(2, Math.round(B.px / 70)), off = Math.floor(t * 30) % step;
      o.ctx.fillStyle = 'rgba(0,20,40,0.45)';
      for (let y = off; y < B.px; y += step * 2) o.ctx.fillRect(0, y, B.px, step);
      o.ctx.fillStyle = 'rgba(200,250,255,0.18)'; o.ctx.fillRect(0, 0, B.px, B.px);
      // projector cone and pad
      c.save();
      const cg = c.createLinearGradient(0, R * 1.25, 0, -R * 0.6);
      cg.addColorStop(0, 'rgba(90,230,255,0.35)'); cg.addColorStop(1, 'rgba(90,230,255,0)');
      c.fillStyle = cg; c.beginPath(); c.moveTo(-R * 0.28, R * 1.25); c.lineTo(R * 0.28, R * 1.25); c.lineTo(R * 1.15, -R * 0.6); c.lineTo(-R * 1.15, -R * 0.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(90,230,255,0.8)'; c.lineWidth = lw(R, 0.05); ell(c, 0, R * 1.25, R * 0.5, R * 0.12); c.stroke();
      c.strokeStyle = `rgba(90,230,255,${0.5 + 0.3 * Math.sin(t * 4)})`; ell(c, 0, R * 1.25, R * 0.75 + Math.sin(t * 2) * R * 0.05, R * 0.18); c.stroke();
      c.globalAlpha = flick; put(c, o, B.box, Math.sin(t * 31) > 0.97 ? R * 0.08 : 0, 0);
      c.restore();
    }

    /* Cel Shade: a thick ink line, flat light, halftone dots in the shadow, a speech burst on hits */
    function drawCel(c, R, st) {
      const B = base(c, R, st), t = st.t || 0;
      const ink = tint(B.cv, '#0a0608', 'ink'), w = R * 0.11;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; put(c, ink, B.box, Math.cos(a) * w, Math.sin(a) * w); }
      const o = buf('cel', B.px, B.px), k = B.px / B.box;
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      o.ctx.fillStyle = 'rgba(255,255,255,0.12)'; o.ctx.fillRect(0, 0, B.px, B.px);
      o.ctx.fillStyle = 'rgba(20,6,30,0.4)';
      const gap = R * 0.16 * k;
      for (let y = 0; y < B.px; y += gap) for (let x = 0; x < B.px; x += gap) {
        const ux = x / B.px - 0.5, uy = y / B.px - 0.5, sh = ux * 0.7 + uy * 0.9;
        if (sh < 0.02) continue;
        o.ctx.beginPath(); o.ctx.arc(x + ((y / gap) % 2 ? gap / 2 : 0), y, Math.min(gap * 0.45, sh * gap * 2.2), 0, TAU); o.ctx.fill();
      }
      put(c, o, B.box);
      c.fillStyle = '#ffffff'; ell(c, -R * 0.52, -R * 0.42, R * 0.13, R * 0.07, -0.7); c.fill();
      if (st.hurt > 0 || (t % 4) < 0.6) {
        const bx = R * 1.15, by = -R * 1.2, s = 1 + Math.sin(t * 20) * 0.05;
        c.save(); c.translate(bx, by); c.scale(s, s);
        c.beginPath();
        for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, r = i % 2 ? R * 0.42 : R * 0.62; c.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r); }
        c.closePath(); c.fillStyle = '#ffd23a'; c.fill(); c.strokeStyle = '#0a0608'; c.lineWidth = lw(R, 0.06); c.stroke();
        c.fillStyle = '#e8203a'; c.font = `900 ${R * 0.42}px Impact, 'Arial Black', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(st.hurt > 0 ? 'OUCH' : 'POW', 0, R * 0.02);
        c.restore();
      }
    }

    const THEMES = [
      { name: '8-Bit', draw: draw8, bg: ['#1a1a4a', '#06061a'], motif: 'pix135', acc: '#ffd23a', fx: { mote: 'pixel', col: '#ffd23a' }, kill: 'pixel', word: '+100',
        line: 'Downsampled to 22 pixels and four shades a channel. A 1UP coin follows him around. Blow on the cartridge if he freezes.' },
      { name: 'Game Boy', draw: drawGB, bg: ['#9bbc0f', '#306230'], motif: 'lcd135', acc: '#0f380f', light: true, fx: { mote: 'pixel', col: '#8bac0f' }, kill: 'gb', word: 'BEEP',
        line: 'Four shades of green and a screen you have to tilt toward the lamp. The batteries are always almost dead.' },
      { name: 'Neon Arcade', draw: drawNeon, bg: ['#2a0a4a', '#05010e'], motif: 'synth135', acc: '#ff3ad8', fx: { mote: 'spark', col: '#ff3ad8', col2: '#3af0ff' }, kill: 'neon', word: 'COMBO',
        line: 'Insert coin. Dark body, two neon tubes around the edge, a grid that runs to a sun that never sets. High score: nobody.' },
      { name: 'Glitch', draw: drawGlitch, bg: ['#0a0a12', '#000000'], motif: 'glitch135', acc: '#2af0ff', fx: { mote: 'pixel', col: '#ff2a4a' }, kill: 'glitch', word: 'ERR',
        line: 'Something broke in the save file and he kept going. Colours split, slices skip a frame. Do not report it.' },
      { name: 'Hologram', draw: drawHolo, bg: ['#04202e', '#01060c'], motif: 'holo135', acc: '#5ae6ff', fx: { mote: 'spark', col: '#5ae6ff', col2: '#e8fdff' }, kill: 'holo', word: 'SYNC',
        line: 'A projection of an apple. Cyan, see through, flickers when something bites. The real one is somewhere else.' },
      { name: 'Cel Shade', draw: drawCel, bg: ['#ffd23a', '#e8742a'], motif: 'comic135', acc: '#e8203a', light: true, fx: { mote: 'dot', col: '#ffd23a' }, kill: 'comic', word: null,
        line: 'Thick ink, flat light, dots in the shadows. Every hit gets a word in yellow. POW is the usual one.' },
    ];
    for (const id in SKINS) {
      if (!CHARS[id]) continue;
      for (const th of THEMES) SKINS[id].push({ name: th.name, tier: 'Arcade', line: th.line, draw: th.glow14 || (th.glow14 = function (c, R, st) { cached14(th, c, R, st); }), bg: th.bg, motif: th.motif, acc: th.acc, light: th.light, gn135: th });
    }
    for (const th of THEMES) FX122[th.name] = th.fx;

    /* kill bursts in the worn style, own little particle list so the old renderer stays untouched */
    const PX = [];
    let lastT = 0;
    const COMIC = ['POW', 'BAM', 'ZAP', 'WHAM', 'KRAK', 'SPLAT'];
    function onKill(sn, P) {
      if (!P || P !== G.player || !Save.data || Save.data.settings.fx === false) return;
      const S = curSkin(P.char), th = S && S.gn135;
      if (!th) return;
      const x = sn.x, y = sn.y, k = th.kill;
      const cols = k === 'pixel' ? ['#ffd23a', '#e8203a', '#3a8aff', '#ffffff'] : k === 'gb' ? ['#0f380f', '#306230', '#8bac0f'] : k === 'neon' ? ['#ff3ad8', '#3af0ff']
        : k === 'glitch' ? ['#ff2a4a', '#2af0ff', '#ffffff'] : k === 'holo' ? ['#5ae6ff', '#e8fdff'] : ['#ffd23a', '#e8203a', '#0a0608'];
      const n = PX.length > 220 ? 6 : 16;
      for (let i = 0; i < n; i++) {
        const a = rnd(TAU), sp = rnd(40, 150);
        PX.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: rnd(2, 4.5), t: 0, life: rnd(0.35, 0.7), col: cols[i % cols.length], glow: k === 'neon' || k === 'holo', sq: k !== 'comic' && k !== 'holo' });
      }
      if (k === 'neon' || k === 'holo') { addP({ kind: 'ring', x, y, vx: 0, vy: 0, r: 4, life: 0.45, col: cols[0], glow: true, drag: 0 }); addP({ kind: 'ring', x, y, vx: 0, vy: 0, r: 10, life: 0.6, col: cols[1], glow: true, drag: 0 }); }
      const word = th.word || COMIC[Math.floor(Math.random() * COMIC.length)];
      if (Math.random() < (k === 'comic' ? 0.8 : 0.45)) floatText(x, y - 10, word, k === 'gb' ? '#9bbc0f' : k === 'comic' ? '#ffd23a' : cols[0]);
    }
    safe(() => {
      const ok0 = onKill10;
      onKill10 = function (sn, room, P) { const r = ok0.apply(this, arguments); safe(() => onKill(sn, P)); return r; };
      const dp0 = drawParticles;
      drawParticles = function (c, glow) {
        dp0.apply(this, arguments);
        if (!PX.length) return;
        if (!glow) {
          const dt = clamp((G.t || 0) - lastT, 0, 0.05); lastT = G.t || 0;
          for (let i = PX.length - 1; i >= 0; i--) {
            const p = PX[i]; p.t += dt; if (p.t > p.life) { PX.splice(i, 1); continue; }
            const dr = Math.exp(-4 * dt); p.vx *= dr; p.vy *= dr; p.x += p.vx * dt; p.y += p.vy * dt;
          }
        }
        c.save(); if (glow) c.globalCompositeOperation = 'lighter';
        for (const p of PX) {
          if (!!p.glow !== !!glow) continue;
          const a = 1 - Math.pow(p.t / p.life, 2), s = p.s * (1 - (p.t / p.life) * 0.4);
          c.globalAlpha = a; c.fillStyle = p.col;
          if (p.sq) c.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); else circle(c, p.x, p.y, s * 0.6);
        }
        c.restore();
      };
      // a fresh room leaves the old sparks behind
      setInterval(() => { if (G.state !== 'play' && PX.length) PX.length = 0; }, 1500);
    });
    return { THEMES, PX };
  })();
  for (const id in SKINS) for (const S of SKINS[id]) epic122(S);

  /* old saves stored a position in the old list: find the same skin by name, or fall back to the original */
  function migrate122() {
    const st = Save.data && Save.data.settings;
    if (!st || st.skin122) return;
    for (const id in OLD122) {
      const key = 'skin_' + id, v = st[key];
      if (!v) continue;
      const n = v === true ? 1 : Math.round(+v) || 0, name = OLD122[id][n - 1], ni = name ? SKINS[id].findIndex((S) => S.name === name) : -1;
      st[key] = ni >= 0 ? ni + 1 : 0;
    }
    st.skin122 = true;
    safe(() => Save.store());
  }

  /* in a fight the worn skin leaves a few of its own sparks behind you */
  safe(() => {
    const dpo122 = drawPlayerOver9;
    drawPlayerOver9 = function (c, P, t) {
      dpo122(c, P, t);
      if (!P || P !== G.player || P.dying > 0 || G.state !== 'play' || !Save.data || Save.data.settings.fx === false) return;
      const L = SKINS[P.char], v = Save.data.settings['skin_' + P.char], n = v === true ? 1 : Math.round(+v) || 0, S = L && n > 0 ? L[n - 1] : null;
      if (!S || !S.fx122 || Math.hypot(P.vx || 0, P.vy || 0) < 40 || Math.random() > 0.35) return;
      addP({ kind: 'dot', x: P.x + rnd(-5, 5), y: P.y + P.R * 0.7, vx: rnd(-12, 12), vy: rnd(-28, -6), r: rnd(0.8, 1.8), life: rnd(0.3, 0.55), col: S.fx122.col, glow: true, drag: 1.5 });
    };
  });
  const skinKey = (id) => 'skin_' + id;
  // what is worn: 0 the original, 1 and up a skin. Old saves stored true for the first skin.
  function skinIdx(id) {
    migrate122();
    const L = SKINS[id], v = Save.data && Save.data.settings && Save.data.settings[skinKey(id)];
    if (!L || !v) return 0;
    const n = v === true ? 1 : Math.round(+v) || 0;
    return n >= 1 && n <= L.length ? n : 0;
  }
  const skinOn = (id) => skinIdx(id) > 0;
  const curSkin = (id) => { const n = skinIdx(id); return n ? SKINS[id][n - 1] : null; };
  function setSkin(id, n) { Save.data.settings[skinKey(id)] = typeof n === 'boolean' ? (n ? 1 : 0) : Math.max(0, Math.round(+n) || 0); safe(() => Save.store()); }
  const wantIdx = (id, sk) => (sk == null ? skinIdx(id) : sk === true ? 1 : sk === false ? 0 : Math.round(+sk) || 0);

  /* every apple drawing goes through here: the worn skin, or the one a preview asks for */
  let IN = 0;
  const da0 = drawApple;
  drawApple = function (c, R, st) {
    const id = st && st.char, L = id && SKINS[id];
    const n = L ? wantIdx(id, st.skin) : 0, S = n > 0 && n <= L.length ? L[n - 1] : null;
    IN++;
    try {
      if (!S) return da0.apply(this, arguments);
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      try { S.draw(c, R, st); } catch (e) { console.error(e); } finally { c.restore(); }
    } finally { IN--; }
  };
  const gw0 = drawGullWings10;
  drawGullWings10 = function (c, R, flap, behind) {
    const S = !IN && G.player && G.player.char === 'apploa' ? curSkin('apploa') : null;
    if (S && S.wings) return S.wings(c, R, flap, behind);
    return gw0(c, R, flap, behind);
  };

  /* ------------------------------------------------------------------ the wardrobe */
  function backdrop(c, W, H, t, S) {
    const g = c.createLinearGradient(0, 0, 0, H);
    if (!S) { g.addColorStop(0, '#221812'); g.addColorStop(1, '#0c0807'); }
    else { g.addColorStop(0, S.bg[0]); g.addColorStop(1, S.bg[1]); }
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const m = S && S.motif, u = Math.min(W, H) / 100;
    c.save();
    if (m === 'knit') {
      c.strokeStyle = 'rgba(200,230,150,0.08)'; c.lineWidth = 2 * u;
      for (let y = 0; y < H + 10 * u; y += 9 * u) for (let x = 0; x < W + 8 * u; x += 8 * u) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4 * u, y + 5 * u); c.lineTo(x + 8 * u, y); c.stroke(); }
    } else if (m === 'rgb') {
      for (let i = 0; i < 5; i++) { const y = H * (0.2 + i * 0.16); c.strokeStyle = `hsla(${(t * 60 + i * 50) % 360},100%,60%,0.16)`; c.lineWidth = 3 * u; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + Math.sin(t + i) * 6 * u); c.stroke(); }
    } else if (m === 'spores') {
      for (let i = 0; i < 40; i++) { const x = rnd24(i) * W, y = ((rnd24(i + 50) * H) - t * 8 * u * (0.5 + rnd24(i + 9))) % H; c.fillStyle = 'rgba(210,230,220,0.18)'; circle(c, x, y < 0 ? y + H : y, (0.6 + rnd24(i + 3)) * u); }
    } else if (m === 'beach') {
      const sg = c.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, 30 * u); sg.addColorStop(0, 'rgba(255,240,170,0.9)'); sg.addColorStop(1, 'rgba(255,240,170,0)');
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ffd68a'; circle(c, W * 0.5, H * 0.62, 12 * u);
      c.fillStyle = '#1a3a6a'; c.fillRect(0, H * 0.66, W, H * 0.34);
      c.strokeStyle = 'rgba(255,214,138,0.5)'; c.lineWidth = 1.2 * u; for (let i = 0; i < 5; i++) { const y = H * (0.7 + i * 0.05); c.beginPath(); c.moveTo(W * 0.5 - (8 + i * 6) * u, y); c.lineTo(W * 0.5 + (8 + i * 6) * u, y); c.stroke(); }
    } else if (m === 'tiles') {
      const s = 26 * u;
      for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
        c.strokeStyle = 'rgba(29,63,154,0.16)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, s, s);
        c.fillStyle = 'rgba(29,63,154,0.12)'; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, s * 0.22, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(29,63,154,0.2)'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.14, 0, TAU); c.stroke();
      }
    } else if (m === 'hay') {
      c.lineWidth = 1.4 * u;
      for (let i = 0; i < 60; i++) { const x = rnd24(i) * W, y = H * 0.68 + rnd24(i + 7) * H * 0.32, a = (rnd24(i + 3) - 0.5) * 1.2; c.strokeStyle = `rgba(${200 + rnd24(i) * 40},${170 + rnd24(i + 2) * 40},90,0.45)`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14 * u, y - Math.abs(Math.sin(a)) * 6 * u - 4 * u); c.stroke(); }
    } else if (m === 'confetti') {
      const cl = (S && S.mcol) || ['#ffffff'];
      for (let i = 0; i < 34; i++) { const x = rnd24(i + 2) * W, y = (rnd24(i + 12) * H + t * 14 * u * (0.5 + rnd24(i + 22))) % H; c.save(); c.translate(x, y); c.rotate(t * 2 + i); c.fillStyle = cl[i % cl.length]; c.globalAlpha = 0.35; c.fillRect(-1.6 * u, -0.8 * u, 3.2 * u, 1.6 * u); c.restore(); }
    } else if (m === 'fuzz') {
      c.lineWidth = 0.6 * u;
      for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(${150 + rnd24(i) * 100},${60 + rnd24(i + 1) * 60},255,0.12)`; c.beginPath(); c.arc(rnd24(i + 3) * W, rnd24(i + 4) * H, (4 + rnd24(i + 5) * 10) * u, t * 0.2 + i, t * 0.2 + i + 4); c.stroke(); }
    } else if (m === 'spark') {
      c.strokeStyle = 'rgba(160,220,255,0.25)'; c.lineWidth = u;
      for (let i = 0; i < 4; i++) { const ph = Math.floor(t * 6 + i * 3); let x = rnd24(ph) * W, y = 0; c.beginPath(); c.moveTo(x, y); while (y < H) { x += (rnd24(ph + y) - 0.5) * 14 * u; y += 10 * u; c.lineTo(x, y); } c.stroke(); }
    } else if (m === 'flakes') {
      c.strokeStyle = 'rgba(42,106,154,0.25)'; c.lineWidth = 0.8 * u;
      for (let i = 0; i < 18; i++) { const x = rnd24(i + 6) * W, y = (rnd24(i + 16) * H + t * 6 * u) % H, r = (2 + rnd24(i) * 3) * u; for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.stroke(); } }
    } else if (m === 'stars') {
      for (let i = 0; i < 26; i++) { const x = rnd24(i + 8) * W, y = rnd24(i + 18) * H, r = (0.8 + rnd24(i) * 2) * u; c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 3 + i); sparkle(c, x, y, r * 2, i % 4 ? '#c890ff' : '#e2b04e'); }
      c.globalAlpha = 1;
    } else if (m === 'waves') {
      c.strokeStyle = 'rgba(122,200,255,0.2)'; c.lineWidth = 1.5 * u;
      for (let r = 0; r < 7; r++) { const y = H * (0.55 + r * 0.07); c.beginPath(); for (let x = 0; x <= W; x += 4 * u) { const yy = y + Math.sin(x / (8 * u) + t * 2 + r) * 2 * u; if (x) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); }
    } else if (m === 'crumbs') {
      for (let i = 0; i < 70; i++) { c.fillStyle = i % 2 ? 'rgba(232,160,64,0.18)' : 'rgba(255,220,150,0.12)'; c.fillRect(rnd24(i + 9) * W, rnd24(i + 19) * H, 1.6 * u, 1.2 * u); }
    } else if (m === 'fair') {
      for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? 'rgba(255,240,220,0.08)' : 'rgba(255,60,60,0.1)'; c.beginPath(); c.moveTo(W / 2, -H * 0.1); c.lineTo((i / 10) * W * 1.6 - W * 0.3, H); c.lineTo(((i + 1) / 10) * W * 1.6 - W * 0.3, H); c.closePath(); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * 0.12); c.quadraticCurveTo(W / 2, H * 0.22, W, H * 0.12); c.stroke();
      for (let i = 0; i < 9; i++) { const x = (i + 0.5) * W / 9, y = H * 0.12 + Math.sin((x / W) * Math.PI) * H * 0.08; glowDot(c, x, y, 5 * u, i % 2 ? '#ffd36a' : '#ff6a6a', 0.5 + 0.4 * Math.sin(t * 3 + i)); }
    } else if (m === 'yuzu') {
      for (let i = 0; i < 9; i++) { const x = rnd24(i + 3) * W, y = (rnd24(i + 13) * H + t * 6 * u) % H; c.fillStyle = 'rgba(255,180,60,0.22)'; circle(c, x, y, (3 + rnd24(i) * 3) * u); }
    } else if (m === 'petals') {
      for (let i = 0; i < 14; i++) { const x = rnd24(i + 5) * W, y = (rnd24(i + 15) * H + t * 10 * u * (0.5 + rnd24(i))) % H; c.save(); c.translate(x, y); c.rotate(t + i); c.fillStyle = 'rgba(255,210,58,0.3)'; ell(c, 0, 0, 3 * u, 1.3 * u); c.fill(); c.restore(); }
    } else if (m === 'waffle') {
      c.strokeStyle = 'rgba(232,160,64,0.12)'; c.lineWidth = 2 * u;
      for (let i = -12; i < 24; i++) { c.beginPath(); c.moveTo(i * 9 * u, 0); c.lineTo(i * 9 * u + H, H); c.stroke(); c.beginPath(); c.moveTo(i * 9 * u, 0); c.lineTo(i * 9 * u - H, H); c.stroke(); }
    } else if (m === 'cogs') {
      for (const [cx, cy, r, sp] of [[0.18, 0.25, 16, 0.4], [0.82, 0.3, 11, -0.6], [0.8, 0.82, 18, 0.3], [0.15, 0.8, 10, -0.7]]) {
        c.save(); c.translate(cx * W, cy * H); c.rotate(t * sp); c.strokeStyle = 'rgba(232,196,90,0.16)'; c.lineWidth = 2 * u;
        c.beginPath(); c.arc(0, 0, r * u, 0, TAU); c.stroke();
        for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * r * u, Math.sin(a) * r * u); c.lineTo(Math.cos(a) * (r + 4) * u, Math.sin(a) * (r + 4) * u); c.stroke(); }
        c.restore();
      }
    } else if (m === 'lasers') {
      for (let i = 0; i < 6; i++) { const a = Math.sin(t * 0.8 + i) * 0.6 + (i - 2.5) * 0.25; c.strokeStyle = `hsla(${(i * 60 + t * 80) % 360},100%,60%,0.22)`; c.lineWidth = 1.5 * u; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2 + Math.sin(a) * H * 1.2, Math.cos(a) * H * 1.2); c.stroke(); }
    } else if (m === 'embers' || m === 'hellbox') {
      if (m === 'hellbox') {
        c.strokeStyle = 'rgba(226,176,78,0.35)'; c.lineWidth = 2 * u; c.strokeRect(5 * u, 5 * u, W - 10 * u, H - 10 * u);
        c.strokeStyle = 'rgba(213,35,47,0.4)'; c.lineWidth = u; c.strokeRect(8 * u, 8 * u, W - 16 * u, H - 16 * u);
        c.fillStyle = 'rgba(90,46,22,0.5)'; c.fillRect(0, 0, 4 * u, H); c.fillRect(W - 4 * u, 0, 4 * u, H);
      }
      for (let i = 0; i < 26; i++) { const x = rnd24(i + 7) * W, y = H - ((rnd24(i + 17) * H + t * 18 * u * (0.5 + rnd24(i + 4))) % H); glowDot(c, x, y, (1.5 + rnd24(i) * 2) * u, i % 3 ? '#ff7a1a' : '#ffd36a', 0.5); }
    } else if (m === 'bunting') {
      for (const row of [0.1, 0.24]) {
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * row); c.quadraticCurveTo(W / 2, H * row + 10 * u, W, H * row); c.stroke();
        for (let i = 0; i < 12; i++) {
          const x = (i + 0.5) * W / 12, y = H * row + Math.sin((x / W) * Math.PI) * 5 * u + Math.sin(t * 2 + i) * u;
          c.fillStyle = ['#c8102e', '#ffffff', '#21468b', '#ff7a12'][i % 4]; c.beginPath(); c.moveTo(x - 3.4 * u, y); c.lineTo(x + 3.4 * u, y); c.lineTo(x, y + 7 * u); c.closePath(); c.fill();
        }
      }
    } else if (m === 'pix135') {
      const cs = 6 * u;
      for (let i = 0; i < 46; i++) { const x = Math.floor(rnd24(i + 3) * W / cs) * cs, y = Math.floor(((rnd24(i + 33) * H + t * 10 * u * (0.4 + rnd24(i))) % H) / cs) * cs; c.fillStyle = ['rgba(255,210,58,0.5)', 'rgba(58,138,255,0.45)', 'rgba(255,255,255,0.35)', 'rgba(232,32,58,0.45)'][i % 4]; c.fillRect(x, y, cs * 0.6, cs * 0.6); }
      c.fillStyle = '#3a8a2a'; c.fillRect(0, H * 0.86, W, H * 0.14); c.fillStyle = '#5ac83a'; c.fillRect(0, H * 0.86, W, cs * 0.6);
      c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < W; x += cs * 2) c.fillRect(x, H * 0.9, cs, cs);
    } else if (m === 'lcd135') {
      c.fillStyle = 'rgba(15,56,15,0.12)'; const g = 3 * u;
      for (let y = 0; y < H; y += g) c.fillRect(0, y, W, Math.max(1, g * 0.25));
      for (let x = 0; x < W; x += g) c.fillRect(x, 0, Math.max(1, g * 0.25), H);
      c.strokeStyle = 'rgba(15,56,15,0.5)'; c.lineWidth = 2 * u; c.strokeRect(4 * u, 4 * u, W - 8 * u, H - 8 * u);
    } else if (m === 'synth135') {
      const hy = H * 0.6, sg = c.createLinearGradient(0, H * 0.18, 0, hy);
      sg.addColorStop(0, '#ffd23a'); sg.addColorStop(1, '#ff3ad8');
      c.save(); c.beginPath(); c.arc(W / 2, hy, Math.min(W, H) * 0.3, Math.PI, TAU); c.clip();
      c.fillStyle = sg; c.fillRect(0, 0, W, hy);
      c.fillStyle = 'rgba(42,10,74,0.9)'; for (let i = 0; i < 6; i++) { const y = hy - (i + 1) * Math.min(W, H) * 0.035; c.fillRect(0, y, W, (i + 1) * 0.5 * u + u); }
      c.restore();
      c.strokeStyle = 'rgba(58,240,255,0.55)'; c.lineWidth = 1.2 * u;
      for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(W / 2 + i * W * 0.02, hy); c.lineTo(W / 2 + i * W * 0.16, H); c.stroke(); }
      for (let i = 0; i < 9; i++) { const f = ((i + (t * 0.6) % 1) / 9), y = hy + (H - hy) * f * f; c.globalAlpha = 0.3 + f * 0.6; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.globalAlpha = 1;
    } else if (m === 'glitch135') {
      const f = Math.floor(t * 8);
      for (let i = 0; i < 14; i++) { const y = rnd24(f * 13 + i) * H, h = (1 + rnd24(f + i * 3) * 6) * u; c.fillStyle = ['rgba(255,42,74,0.25)', 'rgba(42,240,255,0.25)', 'rgba(255,255,255,0.12)'][i % 3]; c.fillRect((rnd24(f + i) - 0.3) * W, y, W * (0.3 + rnd24(i + f * 2)), h); }
      c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < H; y += 3 * u) c.fillRect(0, y, W, u);
    } else if (m === 'holo135') {
      c.strokeStyle = 'rgba(90,230,255,0.22)'; c.lineWidth = u;
      for (let i = 0; i < 12; i++) { const y = H * 0.62 + i * i * u * 0.9; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(W / 2 + i * W * 0.04, H * 0.62); c.lineTo(W / 2 + i * W * 0.2, H); c.stroke(); }
      for (let i = 0; i < 3; i++) { const r = ((t * 0.3 + i / 3) % 1) * Math.min(W, H) * 0.5; c.strokeStyle = `rgba(90,230,255,${0.4 * (1 - r / (Math.min(W, H) * 0.5))})`; c.beginPath(); c.arc(W / 2, H * 0.5, r, 0, TAU); c.stroke(); }
    } else if (m === 'comic135') {
      c.fillStyle = 'rgba(255,255,255,0.22)';
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.1; c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * W); c.lineTo(W / 2 + Math.cos(a + 0.18) * W, H / 2 + Math.sin(a + 0.18) * W); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(232,32,58,0.18)'; const g = 7 * u;
      for (let y = 0; y < H; y += g) for (let x = 0; x < W; x += g) { const d = Math.hypot(x - W / 2, y - H / 2) / Math.max(W, H); circle(c, x, y, g * 0.45 * d * 1.6); }
    }
    c.restore();
    if (S) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) { const a = t * 0.15 + (i * TAU) / 10, L = Math.max(W, H); c.fillStyle = rgba(S.acc, 0.05); c.beginPath(); c.moveTo(W / 2, H * 0.5); c.lineTo(W / 2 + Math.cos(a - 0.11) * L, H * 0.5 + Math.sin(a - 0.11) * L); c.lineTo(W / 2 + Math.cos(a + 0.11) * L, H * 0.5 + Math.sin(a + 0.11) * L); c.closePath(); c.fill(); }
      const rg = c.createRadialGradient(W / 2, H * 0.86, 0, W / 2, H * 0.86, Math.min(W, H) * 0.32); rg.addColorStop(0, rgba(S.acc, 0.35)); rg.addColorStop(1, rgba(S.acc, 0));
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
      c.restore();
    }
    const sp = c.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.55);
    sp.addColorStop(0, S && S.light ? 'rgba(255,255,255,0.35)' : 'rgba(255,230,190,0.16)'); sp.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = sp; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, W / 2, H * 0.86, Math.min(W, H) * 0.2, Math.min(W, H) * 0.045); c.fill();
  }
  function drawOn(cv, id, skin, t, o = {}) {
    const W = cv.width, H = cv.height, c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    const n = wantIdx(id, skin), S = n && SKINS[id] ? SKINS[id][n - 1] || null : null;
    backdrop(c, W, H, t, S);
    if (!drawOn.off) drawOn.off = document.createElement('canvas');
    const off = drawOn.off; off.width = W; off.height = H;
    const oc = off.getContext('2d');
    const k = Math.min(W, H) / (id === 'apploa' ? 92 : id === 'lucif' && n ? 76 : 64), hop = o.hop || 0;
    oc.setTransform(k, 0, 0, k, W / 2, H * 0.5 + 2 * k - hop * k * 6);
    const blink = (t % 3.4) > 3.28 ? 0.1 : 1;
    drawApple(oc, 14, { char: id, skin: n, t, lookX: o.lookX || Math.sin(t * 0.7) * 0.6, lookY: o.lookY != null ? o.lookY : 0.15, blink, fear: id === 'apple' ? 0.5 : 0, hurt: 0, mouthOpen: hop > 0.3, bites: [], leaf: Math.sin(t * 1.6) * 0.2 });
    c.drawImage(off, 0, 0);
  }

  /* ------------------------------------------------------------------ v13.6: the wardrobe, sorted
     Skins live in categories (Original, Epic, Grotesque, Arcade). The wardrobe shows them as a grid
     grouped per category with filter tabs, favourites, a shuffle button and a per apple
     "new look every run" switch. Tap previews, tap again or Wear puts it on. */
  const CATS136 = [
    { id: 'Original', label: 'Original', col: '#a69688', blurb: 'How the apple left the factory.' },
    { id: 'Epic', label: 'Epic', col: '#e3a54a', blurb: 'Full outfits with an aura, light rays and their own particles.' },
    { id: 'Grotesque', label: 'Grotesque', col: '#c84a5a', blurb: 'Something in the game got into the apple and stayed.' },
    { id: 'Arcade', label: 'Arcade', col: '#3af0ff', blurb: 'Run through a filter from an old console. Kills burst in the same style.' },
  ];
  const catOf = (o) => (o.skin ? (SKINS[V.id][o.skin - 1].tier || 'Epic') : 'Original');
  const catDef = (id) => CATS136.find((c) => c.id === id) || CATS136[1];
  const favs = (id) => { const d = Save.data; if (!d.skinFav || typeof d.skinFav !== 'object') d.skinFav = {}; if (!Array.isArray(d.skinFav[id])) d.skinFav[id] = []; return d.skinFav[id]; };
  const isFav = (id, name) => favs(id).includes(name);
  const shuffleKey = (id) => 'skinShuffle_' + id;

  const css = document.createElement('style');
  css.textContent = `
#skins24 { overflow-y: auto; justify-content: flex-start; gap: 0; z-index: 7; background: rgba(9, 6, 6, .96); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
#skins24 .sk-inner { width: 100%; max-width: 980px; display: flex; flex-direction: column; gap: 14px; text-align: left; padding-bottom: 20px; }
#skins24 .sk-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 3px solid var(--acc24, #d7263d); padding-bottom: 10px; }
#skins24 .sk-head .kick { color: var(--acc24, #d7263d); margin-bottom: 6px; }
#skins24 .sk-head h2 { font-size: clamp(32px, 9vw, 52px); }
#skins24 .sk-main { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 20px; align-items: start; }
#skins24 .sk-side { position: sticky; top: 0; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
#skins24 .sk-stage { position: relative; aspect-ratio: 1 / 1; max-width: 100%; border: 1px solid var(--line); border-radius: 2px; overflow: hidden; background: #0c0807; }
#skins24 .sk-big { width: 100%; height: 100%; display: block; cursor: pointer; }
#skins24 .sk-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 2px; border: 1px solid rgba(236,226,212,.3); background: rgba(11,8,7,.55); color: var(--ink); display: grid; place-items: center; cursor: pointer; }
#skins24 .sk-arrow:hover { border-color: rgba(236,226,212,.6); }
#skins24 .sk-arrow:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-arrow.prev { left: 8px; } #skins24 .sk-arrow.next { right: 8px; }
#skins24 .sk-arrow svg { width: 16px; height: 16px; }
#skins24 .sk-count { position: absolute; left: 10px; bottom: 9px; font: 600 11px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; color: rgba(236,226,212,.8); text-shadow: 0 1px 2px #000; }
#skins24 .sk-favbig { position: absolute; right: 8px; top: 8px; }
#skins24 .sk-sname { margin: 0; font: 800 30px/1 var(--display); color: var(--ink); }
#skins24 .sk-meta { display: flex; gap: 6px; flex-wrap: wrap; }
#skins24 .sk-tag { font: 700 11px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; padding: 5px 8px; border: 1px solid var(--tc, var(--acc24)); color: var(--tc, var(--acc24)); border-radius: 2px; }
#skins24 .sk-line { margin: 0; font: 500 15px/1.4 var(--ui); color: var(--muted); min-height: 4.2em; }
#skins24 .sk-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
#skins24 .sk-wear { padding: 0 16px; font-size: 17px; min-height: 48px; }
#skins24 .sk-wear[disabled] { opacity: .5; cursor: default; box-shadow: none; }
#skins24 .sk-rand { min-height: 48px; padding: 0 14px; font-size: 13px; }
#skins24 .sk-tog { all: unset; box-sizing: border-box; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; border: 1px solid var(--line); border-radius: 2px; padding: 8px 10px; }
#skins24 .sk-tog b { font: 700 14px/1.1 var(--ui); letter-spacing: .04em; color: var(--ink); }
#skins24 .sk-tog small { display: block; font: 500 12px/1.25 var(--ui); color: var(--faint); margin-top: 2px; }
#skins24 .sk-tog i { width: 38px; height: 20px; border-radius: 2px; background: rgba(236,226,212,.12); position: relative; }
#skins24 .sk-tog i::after { content: ""; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 1px; background: var(--muted); transition: transform .15s; }
#skins24 .sk-tog[aria-checked="true"] i { background: var(--acc24); }
#skins24 .sk-tog[aria-checked="true"] i::after { transform: translateX(18px); background: #fff4ec; }
#skins24 .sk-tog:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-hint { margin: 0; font: 500 12px/1.35 var(--ui); color: var(--faint); }
#skins24 .sk-hint kbd { font: 700 10px/1 var(--ui); border: 1px solid currentColor; border-radius: 2px; padding: 2px 4px; }
#skins24 .sk-browse { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
#skins24 .sk-tabs { display: flex; gap: 6px; flex-wrap: wrap; position: sticky; top: 0; z-index: 2; background: rgba(9,6,6,.97); padding-block: 4px 8px; }
#skins24 .sk-tabs button { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; font: 600 13px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: 8px 10px; min-height: 36px; border: 1px solid var(--line); border-radius: 2px; }
#skins24 .sk-tabs button i { width: 8px; height: 8px; border-radius: 1px; background: var(--tc); }
#skins24 .sk-tabs button em { font-style: normal; font-variant-numeric: tabular-nums; color: var(--faint); letter-spacing: .04em; }
#skins24 .sk-tabs button[aria-pressed="true"] { color: #fff4ec; border-color: var(--tc); background: rgba(255,255,255,.05); box-shadow: inset 0 -2px 0 var(--tc); }
#skins24 .sk-tabs button[aria-pressed="true"] em { color: var(--ink); }
#skins24 .sk-tabs button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-groups { display: flex; flex-direction: column; gap: 22px; }
#skins24 .sk-group { display: flex; flex-direction: column; gap: 8px; }
#skins24 .sk-group[hidden] { display: none; }
#skins24 .sk-ghead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
#skins24 .sk-ghead b { font: 700 13px/1 var(--ui); letter-spacing: .26em; text-transform: uppercase; color: var(--tc); }
#skins24 .sk-ghead span { font: 500 13px/1.3 var(--ui); color: var(--faint); }
#skins24 .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
#skins24 .sk-card { all: unset; box-sizing: border-box; cursor: pointer; position: relative; display: flex; flex-direction: column; gap: 5px; padding: 5px 5px 7px; border: 1px solid var(--line); border-top: 3px solid var(--tc); border-radius: 2px; background: rgba(255,255,255,.02); min-width: 0; transition: transform .12s, border-color .12s; }
#skins24 .sk-card:hover { transform: translateY(-2px); border-color: rgba(236,226,212,.4); border-top-color: var(--tc); }
#skins24 .sk-card canvas { width: 100%; aspect-ratio: 1 / 1; display: block; border-radius: 1px; }
#skins24 .sk-card b { font: 700 14px/1.1 var(--ui); letter-spacing: .03em; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#skins24 .sk-card[aria-checked="true"] { border-color: var(--tc); box-shadow: 0 0 0 1px var(--tc), 0 0 22px rgba(0,0,0,.5); }
#skins24 .sk-card .wb { position: absolute; left: 9px; top: 9px; font: 700 9px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; padding: 3px 5px; background: var(--tc); color: #0b0807; border-radius: 1px; }
#skins24 .sk-card:not(.worn) .wb { display: none; }
#skins24 .sk-star { all: unset; box-sizing: border-box; cursor: pointer; width: 28px; height: 28px; display: grid; place-items: center; color: rgba(236,226,212,.55); background: rgba(11,8,7,.6); border-radius: 2px; }
#skins24 .sk-card .sk-star { position: absolute; right: 8px; top: 8px; }
#skins24 .sk-star svg { width: 15px; height: 15px; }
#skins24 .sk-star[aria-pressed="true"] { color: #ffd23a; }
#skins24 .sk-star:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }
#skins24 .sk-empty { margin: 0; font: 500 15px/1.4 var(--ui); color: var(--faint); padding: 18px; border: 1px dashed var(--line); border-radius: 2px; }
.ccard .skchip24 { position: absolute; top: 8px; right: 8px; font: 700 10px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; padding: 4px 6px; border: 1px solid var(--tc, rgba(236,226,212,.35)); color: var(--ink); background: rgba(11,8,7,.75); border-radius: 2px; pointer-events: none; }
.ccard { position: relative; }
@media (max-width: 760px) {
  #skins24 .sk-main { grid-template-columns: minmax(0, 1fr); }
  #skins24 .sk-side { position: static; }
  #skins24 .sk-stage { max-width: 210px; width: 100%; align-self: center; }
  #skins24 .sk-sname { font-size: 26px; }
  #skins24 .sk-line { min-height: 0; font-size: 14px; }
  #skins24 .sk-tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: -2px; }
  #skins24 .sk-tabs::-webkit-scrollbar { display: none; }
  #skins24 .sk-tabs button { flex: none; }
  #skins24 .sk-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
  #skins24 .sk-tabs button { padding: 7px 8px; font-size: 12px; letter-spacing: .08em; }
}
@media (pointer: coarse) { #skins24 .sk-hint { display: none; } }
@media (prefers-reduced-motion: reduce) { #skins24 .sk-card { transition: none; } #skins24 .sk-card:hover { transform: none; } }
`;
  document.head.appendChild(css);
  const sec = document.createElement('section');
  sec.id = 'skins24'; sec.className = 'panel scrim'; sec.hidden = true; sec.setAttribute('aria-label', 'Skins');
  const chev = (d) => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg>`;
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="currentColor"/></svg>';
  sec.innerHTML = `<div class="sk-inner">
    <header class="sk-head"><div><p class="kick">Garderobe</p><h2 class="sk-cname"></h2></div><button type="button" class="btn sk-done">Done</button></header>
    <div class="sk-main">
      <div class="sk-side">
        <div class="sk-stage"><canvas class="sk-big" aria-hidden="true"></canvas>
          <button type="button" class="sk-arrow prev" aria-label="Previous skin">${chev('M13 3 L6 10 L13 17')}</button>
          <button type="button" class="sk-arrow next" aria-label="Next skin">${chev('M7 3 L14 10 L7 17')}</button>
          <button type="button" class="sk-star sk-favbig" aria-pressed="false" aria-label="Favourite">${STAR}</button>
          <span class="sk-count"></span></div>
        <p class="sk-sname"></p>
        <div class="sk-meta"><span class="sk-tag sk-cat"></span><span class="sk-tag sk-state"></span></div>
        <p class="sk-line"></p>
        <div class="sk-actions"><button type="button" class="btn primary sk-wear">Wear this</button><button type="button" class="btn sk-rand" title="Wear a random look">Shuffle</button></div>
        <button type="button" class="sk-tog" role="switch" aria-checked="false"><span><b>New look every run</b><small class="sk-togs">Picks a random look when a run starts.</small></span><i></i></button>
        <p class="sk-hint"><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> browse, <kbd>Enter</kbd> wear, <kbd>F</kbd> favourite, <kbd>1</kbd> to <kbd>6</kbd> category, <kbd>Esc</kbd> close.</p>
      </div>
      <div class="sk-browse"><div class="sk-tabs" role="group" aria-label="Category"></div><div class="sk-groups"></div></div>
    </div>
  </div>`;
  (document.getElementById('app') || document.body).appendChild(sec);
  const $ = (q) => sec.querySelector(q);
  const V = { id: 'apple', i: 0, raf: 0, t0: 0, hopT: -9, look: null, from: null, filter: 'all' };
  const opts = (id) => [{ skin: 0, name: 'Original', line: CHARS[id].desc }].concat(SKINS[id].map((S, i) => ({ skin: i + 1, name: S.name, line: S.line })));
  const FILTERS = () => [{ id: 'all', label: 'All', col: '#ece2d4' }].concat(CATS136.filter((c) => c.id === 'Original' || SKINS[V.id].some((S) => (S.tier || 'Epic') === c.id)), [{ id: 'fav', label: 'Favourites', col: '#ffd23a' }]);
  const visible = (o) => V.filter === 'all' || (V.filter === 'fav' ? isFav(V.id, o.name) : catOf(o) === V.filter);
  const visIdx = () => opts(V.id).map((o, i) => (visible(o) ? i : -1)).filter((i) => i >= 0);

  function paintTabs() {
    const list = opts(V.id), F = FILTERS();
    if (!F.some((f) => f.id === V.filter)) V.filter = 'all';
    $('.sk-tabs').innerHTML = F.map((f) => {
      const n = f.id === 'all' ? list.length : f.id === 'fav' ? list.filter((o) => isFav(V.id, o.name)).length : list.filter((o) => catOf(o) === f.id).length;
      return `<button type="button" data-f="${f.id}" aria-pressed="${V.filter === f.id}" style="--tc:${f.col}"><i></i>${f.label} <em>${n}</em></button>`;
    }).join('');
  }
  function paintGroups() {
    const list = opts(V.id), box = $('.sk-groups');
    const groups = CATS136.map((c) => ({ c, items: list.map((o, i) => ({ o, i })).filter((x) => catOf(x.o) === c.id) })).filter((g) => g.items.length);
    box.innerHTML = groups.map((g) => `<div class="sk-group" data-cat="${g.c.id}" style="--tc:${g.c.col}"><div class="sk-ghead"><b>${g.c.label}</b><span>${g.c.blurb}</span></div><div class="sk-grid" role="radiogroup" aria-label="${g.c.label} skins">${
      g.items.map(({ o, i }) => `<div class="sk-card" role="radio" tabindex="-1" data-i="${i}" style="--tc:${g.c.col}"><canvas aria-hidden="true"></canvas><span class="wb">Wearing</span><button type="button" class="sk-star" data-star="${i}" aria-pressed="false" aria-label="Favourite ${o.name}">${STAR}</button><b>${o.name}</b></div>`).join('')
    }</div></div>`).join('') + '<p class="sk-empty" hidden>No favourites yet. Tap the star on a look to keep it here.</p>';
    sizeCards();
  }
  function applyFilter() {
    const list = opts(V.id);
    sec.querySelectorAll('.sk-card').forEach((b) => { b.hidden = !visible(list[+b.dataset.i]); });
    sec.querySelectorAll('.sk-group').forEach((g) => { g.hidden = !g.querySelector('.sk-card:not([hidden])'); });
    $('.sk-empty').hidden = V.filter !== 'fav' || list.some((o) => isFav(V.id, o.name));
    sec.querySelectorAll('.sk-tabs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === V.filter ? 'true' : 'false'));
    const vi = visIdx(); if (vi.length && !vi.includes(V.i)) V.i = vi[0];
  }
  function paintInfo() {
    const id = V.id, list = opts(id), o = list[V.i], worn = skinIdx(id) === o.skin, cd = catDef(catOf(o));
    sec.style.setProperty('--acc24', o.skin ? SKINS[id][o.skin - 1].acc : cd.col);
    $('.sk-cname').textContent = CHARS[id].name;
    $('.sk-sname').textContent = o.name;
    const ct = $('.sk-cat'); ct.textContent = cd.label; ct.style.setProperty('--tc', cd.col);
    const sg = $('.sk-state'); sg.textContent = worn ? 'Wearing' : 'Preview'; sg.style.setProperty('--tc', worn ? '#7cff7a' : 'rgba(236,226,212,.5)');
    $('.sk-line').textContent = o.line;
    const vi = visIdx(), pos = vi.indexOf(V.i);
    $('.sk-count').textContent = pos >= 0 ? `${pos + 1} / ${vi.length}` : `${V.i + 1} / ${list.length}`;
    const w = $('.sk-wear'); w.disabled = worn; w.textContent = worn ? 'Wearing' : 'Wear this';
    $('.sk-favbig').setAttribute('aria-pressed', isFav(id, o.name) ? 'true' : 'false');
    const sh = !!Save.data.settings[shuffleKey(id)], nf = favs(id).length;
    const tg = $('.sk-tog'); tg.setAttribute('aria-checked', sh ? 'true' : 'false');
    $('.sk-togs').textContent = nf >= 2 ? `Picks one of your ${nf} favourites when a run starts.` : 'Picks a random look when a run starts. Star 2 or more to pick from those only.';
    sec.querySelectorAll('.sk-card').forEach((b) => {
      const i = +b.dataset.i, on = i === V.i;
      b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      b.classList.toggle('worn', skinIdx(id) === list[i].skin);
      b.querySelector('.sk-star').setAttribute('aria-pressed', isFav(id, list[i].name) ? 'true' : 'false');
    });
  }
  const paintAll = () => { paintTabs(); applyFilter(); paintInfo(); };
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function sizeCards() { const d = dpr(); sec.querySelectorAll('.sk-card canvas').forEach((cv) => { const q = cv.getBoundingClientRect(); cv.width = Math.max(32, Math.round((q.width || 100) * d)); cv.height = Math.max(32, Math.round((q.height || 100) * d)); }); }
  function pickCard(i) {
    if (i === V.i) { wear(); return; }
    V.i = i; V.hopT = (performance.now() - V.t0) / 1000; paintInfo(); safe(() => Sfx.blip());
  }
  function toggleFav(i) {
    const o = opts(V.id)[i], F = favs(V.id), k = F.indexOf(o.name);
    if (k >= 0) F.splice(k, 1); else F.push(o.name);
    safe(() => Save.store()); safe(() => Sfx.tone(k >= 0 ? 520 : 880, 0.08, { vol: 0.04 }));
    paintTabs(); applyFilter(); paintInfo();
  }
  function open(id) {
    if (!SKINS[id]) return;
    if (V.id !== id) V.filter = 'all';
    V.id = id; V.i = skinIdx(id); V.t0 = performance.now();
    sec.hidden = false; sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter');
    paintGroups(); paintAll();
    const big = $('.sk-big');
    const size = () => { const d = dpr(), r = big.getBoundingClientRect(); big.width = Math.max(64, Math.round(r.width * d)); big.height = Math.max(64, Math.round(r.height * d)); sizeCards(); };
    size(); V.size = size;
    Sched.cancel(V.raf);
    let last = 0, k = 0;
    const loop = (now) => {
      if (sec.hidden) return;
      const t = (now - V.t0) / 1000, h = t - V.hopT, hop = h >= 0 && h < 0.5 ? Math.sin((h / 0.5) * Math.PI) : 0;
      safe(() => drawOn(big, V.id, V.i, t, { hop, lookX: V.look ? V.look.x : undefined, lookY: V.look ? V.look.y : undefined }));
      // thumbnails: only the ones on screen, a few per frame so a long list stays smooth
      if (now - last > 50) {
        last = now;
        const cards = [...sec.querySelectorAll('.sk-card:not([hidden])')], H = window.innerHeight;
        for (let n = 0; n < 6 && cards.length; n++) {
          const b = cards[k++ % cards.length], r = b.getBoundingClientRect();
          if (r.bottom < 0 || r.top > H) continue;
          const i = +b.dataset.i; safe(() => drawOn(b.querySelector('canvas'), V.id, i, t + i * 0.7));
        }
      }
      V.raf = Sched.raf(loop);
    };
    // first paint of every thumbnail at once, so nothing sits empty
    sec.querySelectorAll('.sk-card').forEach((b) => { const i = +b.dataset.i; safe(() => drawOn(b.querySelector('canvas'), V.id, i, i * 0.7)); });
    V.raf = Sched.raf(loop);
    safe(() => Sfx.pickup());
    setTimeout(() => { const b = sec.querySelector('.sk-card[aria-checked="true"]'); if (b) { b.focus({ preventScroll: true }); b.scrollIntoView({ block: 'nearest' }); } }, 60);
  }
  function close() {
    if (sec.hidden) return;
    sec.hidden = true; Sched.cancel(V.raf);
    safe(() => UI.paintChars());
    const b = document.querySelector(`#charList .ccard[data-id="${V.id}"]`); if (b) b.focus({ preventScroll: true });
  }
  function step(d) {
    const vi = visIdx(); if (!vi.length) return;
    const p = vi.indexOf(V.i), n = vi.length;
    V.i = vi[((p < 0 ? 0 : p + d) % n + n) % n]; V.hopT = (performance.now() - V.t0) / 1000; paintInfo(); safe(() => Sfx.blip());
    const b = sec.querySelector(`.sk-card[data-i="${V.i}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  function wear() {
    const o = opts(V.id)[V.i]; if (skinIdx(V.id) === o.skin) return;
    setSkin(V.id, o.skin); V.hopT = (performance.now() - V.t0) / 1000; paintInfo();
    safe(() => { Sfx.pickup(); Sfx.tone(660, 0.12, { to: 880, vol: 0.05 }); });
  }
  // a random look: from the favourites when there are two or more, else from all; never the one on now
  function randomIdx(id) {
    const list = opts(id), F = favs(id), cur = skinIdx(id);
    let pool = list.filter((o) => F.length >= 2 ? F.includes(o.name) : true).map((o) => o.skin).filter((s) => s !== cur);
    if (!pool.length) pool = list.map((o) => o.skin).filter((s) => s !== cur);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : cur;
  }
  function shuffle() {
    const s = randomIdx(V.id);
    const vi = visIdx(); if (!vi.includes(s)) V.filter = 'all';
    V.i = s; setSkin(V.id, s); V.hopT = (performance.now() - V.t0) / 1000; paintAll();
    safe(() => { Sfx.slotTick(); Sfx.pickup(); });
    const b = sec.querySelector(`.sk-card[data-i="${s}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  $('.sk-done').addEventListener('click', (e) => { e.preventDefault(); close(); });
  $('.prev').addEventListener('click', (e) => { e.preventDefault(); step(-1); });
  $('.next').addEventListener('click', (e) => { e.preventDefault(); step(1); });
  $('.sk-wear').addEventListener('click', (e) => { e.preventDefault(); wear(); });
  $('.sk-rand').addEventListener('click', (e) => { e.preventDefault(); shuffle(); });
  $('.sk-favbig').addEventListener('click', (e) => { e.preventDefault(); toggleFav(V.i); });
  $('.sk-tog').addEventListener('click', (e) => { e.preventDefault(); const k = shuffleKey(V.id); Save.data.settings[k] = !Save.data.settings[k]; safe(() => Save.store()); paintInfo(); safe(() => Sfx.blip()); });
  $('.sk-tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-f]'); if (!b) return; e.preventDefault(); V.filter = b.dataset.f; applyFilter(); paintInfo(); sizeCards(); safe(() => Sfx.blip()); });
  $('.sk-groups').addEventListener('click', (e) => {
    const st = e.target.closest('.sk-star'); if (st) { e.preventDefault(); e.stopPropagation(); toggleFav(+st.dataset.star); return; }
    const b = e.target.closest('.sk-card'); if (b) { e.preventDefault(); pickCard(+b.dataset.i); }
  });
  const big = $('.sk-big');
  big.addEventListener('click', () => { V.hopT = (performance.now() - V.t0) / 1000; safe(() => Sfx.blip()); });
  big.addEventListener('pointermove', (e) => { const r = big.getBoundingClientRect(); V.look = { x: ((e.clientX - r.left) / r.width - 0.5) * 2.4, y: ((e.clientY - r.top) / r.height - 0.45) * 2.4 }; });
  big.addEventListener('pointerleave', () => { V.look = null; });
  window.addEventListener('resize', () => { if (!sec.hidden && V.size) V.size(); });
  window.addEventListener('keydown', (e) => {
    if (sec.hidden) return;
    const k = e.key, stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (k === 'Escape') { stop(); close(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { stop(); step(-1); }
    else if (k === 'ArrowRight' || k === 'ArrowDown') { stop(); step(1); }
    else if (k === 'f' || k === 'F') { stop(); toggleFav(V.i); }
    else if (k === 'r' || k === 'R') { stop(); shuffle(); }
    else if (/^[1-9]$/.test(k)) { const f = FILTERS()[+k - 1]; if (f) { stop(); V.filter = f.id; applyFilter(); paintInfo(); sizeCards(); } }
    else if ((k === 'Enter' || k === ' ') && !(e.target && e.target.closest && e.target.closest('.sk-done, .sk-arrow, .sk-star, .sk-tabs, .sk-tog, .sk-rand'))) { stop(); wear(); }
  }, true);

  /* a new look every run, for apples that have the switch on */
  safe(() => {
    Hooks.layer('Game.startRun', 'v13.6 random look', function (next) {
      safe(() => { const id = Save.data.char; if (SKINS[id] && Save.data.settings[shuffleKey(id)]) Save.data.settings[skinKey(id)] = randomIdx(id); });
      return next.apply(this, [].slice.call(arguments, 1));
    });
  });

  /* tap a character on the Characters screen: it is picked, and its wardrobe opens */
  safe(() => {
    const list = document.getElementById('charList'); if (!list) return;
    list.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('.ccard'); if (!b) return;
      const id = b.dataset.id; if (!(id === 'apple' || Save.data.unlocks[id])) return;
      setTimeout(() => open(id), 0);
    });
  });
  const pc0 = UI.paintChars;
  UI.paintChars = function () {
    const r = pc0.apply(this, arguments);
    safe(() => {
      for (const b of this.el.charList.children) {
        const id = b.dataset.id, open_ = id === 'apple' || !!Save.data.unlocks[id];
        let chip = b.querySelector('.skchip24');
        if (!SKINS[id] || !open_) { if (chip) chip.remove(); continue; }
        if (!chip) { chip = document.createElement('span'); chip.className = 'skchip24'; b.appendChild(chip); }
        chip.textContent = skinOn(id) ? curSkin(id).name : `${SKINS[id].length + 1} looks`;
        chip.style.setProperty('--tc', catDef(skinOn(id) ? curSkin(id).tier || 'Epic' : 'Original').col);
        if (Save.data.settings[shuffleKey(id)]) chip.textContent += ' · shuffle';
        const tg = b.querySelector('.tagl'); if (tg && Save.data.char === id) tg.textContent = 'Selected. Tap for skins';
      }
    });
    return r;
  };

  /* ------------------------------------------------------------------ texts and the guide */
  safe(() => {
    if (Array.isArray(TEXT_LIT9.messages)) for (const id in SKINS) for (const S of SKINS[id]) for (const s of [S.name, S.line]) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
  });
  safe(() => {
    const tab = document.getElementById('tab-chars'); if (!tab || tab.querySelector('.sk-guide')) return;
    const p = document.createElement('p'); p.className = 'intro9 sk-guide';
    p.textContent = `Every apple has more than one look, sorted in four categories: Original, Epic (full outfits with an aura), Grotesque (something in the game got in) and Arcade (old console filters, kill bursts in style). Tap a character on the Characters screen to open the wardrobe. Filter by category, star favourites, Shuffle for a random look, or switch on New look every run: ${Object.keys(SKINS).filter((id) => CHARS[id]).map((id) => `${CHARS[id].name} as ${SKINS[id].map((S) => S.name).join(' or ')}`).join(', ')}. Skins change the look, nothing else.`;
    tab.insertBefore(p, tab.firstChild);
  });

  Object.assign(window.__bitten || (window.__bitten = {}), { SKINS24: { SKINS, open, close, wear, step, skinOn, skinIdx, curSkin, setSkin, drawOn } });
})();


