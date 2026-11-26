/* 62.js section 06: grotesque2. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { apploa27, lw27, mikaBody27, mikaFace27, rnd24, skinBody24, stitch122 } = S62;
  S62.drawPrik132 = drawPrik132; S62.drawKapper132 = drawKapper132; S62.drawOuro132 = drawOuro132; S62.drawBon132 = drawBon132; S62.drawTel132 = drawTel132; S62.drawBlok132 = drawBlok132; S62.handWings132 = handWings132; S62.drawHand132 = drawHand132; S62.drawPomp132 = drawPomp132;
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

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
