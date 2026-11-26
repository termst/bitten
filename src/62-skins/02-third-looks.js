/* 62.js section 02: third-looks. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { bites24, rnd24, skinBody24 } = S62;
  S62.drawKermis26 = drawKermis26; S62.drawCapy26 = drawCapy26; S62.drawSun26 = drawSun26; S62.drawWafel26 = drawWafel26; S62.drawClock26 = drawClock26; S62.drawRave26 = drawRave26; S62.drawFenixWings26 = drawFenixWings26; S62.drawFenix26 = drawFenix26;
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


})(window.__bitten.S62 || (window.__bitten.S62 = {}));
