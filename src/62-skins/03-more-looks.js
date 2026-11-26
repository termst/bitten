/* 62.js section 03: more-looks. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { bites24, rnd24, skinBody24 } = S62;
  S62.drawOranje27 = drawOranje27; S62.drawMirror27 = drawMirror27; S62.drawPluis27 = drawPluis27; S62.drawBlauw27 = drawBlauw27; S62.drawGroen27 = drawGroen27; S62.drawStatic27 = drawStatic27; S62.drawCandy27 = drawCandy27; S62.drawKroket27 = drawKroket27; S62.mikaFace27 = mikaFace27; S62.mikaBody27 = mikaBody27; S62.drawIce27 = drawIce27; S62.drawPaars27 = drawPaars27; S62.drawRage27 = drawRage27; S62.drawKlomp27 = drawKlomp27; S62.apploa27 = apploa27; S62.drawStar27 = drawStar27; S62.drawDelta27 = drawDelta27; S62.drawBomb27 = drawBomb27; S62.drawAfter27 = drawAfter27;
  /* ------------------------------------------------------------------ v11.7: two more looks for everyone */
  const lw27 = (R, k) => Math.max(0.5, R * k); S62.lw27 = lw27;
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
  const wingsStar27 = wings27('#6a12a0', '#e2b04e', '#1a0428'), wingsDelta27 = wings27('#bfe4ff', '#1a5ad8', '#0a2a4a'); S62.wingsDelta27 = wingsDelta27; S62.wingsStar27 = wingsStar27;
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

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
