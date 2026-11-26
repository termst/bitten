/* 74.js section 05: piece-art. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { CH_COLS, CH_NAMES, DIRS, FONT, bossArt, safe } = M74;
  M74.label = label; M74.snakeSprite = snakeSprite; M74.bossSprite = bossSprite;
  /* ================================================================== 5. the art for the new pieces
     Every piece is drawn around its own centre, in world units (one tile is 40). mode: 'game', 'edit' or 'icon'. */
  const ART = {}; M74.ART = ART;
  const lineC = (c, x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }; M74.lineC = lineC;
  function chevron(c, x, y, a, s) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(-s * 0.55, -s); c.lineTo(s * 0.45, 0); c.lineTo(-s * 0.55, s); c.stroke();
    c.restore();
  }
  ART.tp = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], on = mode !== 'game' || e.on !== false;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 2, 17, 15); c.fill();
    c.fillStyle = '#16110f'; circle(c, x, y, 16);
    c.strokeStyle = '#4a3e36'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 15, 0, TAU); c.stroke();
    c.save(); c.translate(x, y); c.rotate(t * 0.9);
    c.strokeStyle = rgba(col, on ? 0.95 : 0.35); c.lineWidth = 2.4; c.setLineDash([5, 3.6]);
    c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.stroke(); c.setLineDash([]);
    c.restore();
    c.save(); c.translate(x, y); c.rotate(-t * 1.6);
    c.fillStyle = rgba(col, on ? 0.9 : 0.3);
    for (let i = 0; i < 4; i++) { c.rotate(TAU / 4); c.fillRect(-1.2, -15.5, 2.4, 3.5); }
    c.restore();
    const g = c.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, rgba('#ffffff', on ? 0.95 : 0.3)); g.addColorStop(0.35, rgba(col, on ? 0.85 : 0.25)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; circle(c, x, y, 9);
    if (mode === 'edit') label(c, x, y + 1, CH_NAMES[e.ch || 0][0], '#fff4ec');
  };
  ART.jp = (c, x, y, e, t, mode) => {
    const k = e.k || 0, a = Math.atan2(DIRS[e.d || 0][1], DIRS[e.d || 0][0]), sc = 1 + k * 0.12;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = 'rgba(0,0,0,0.35)'; rrect(c, -15, -13, 30, 30, 4); c.fill();
    c.fillStyle = '#5a4c40'; rrect(c, -15, -15, 30, 30, 4); c.fill();
    c.fillStyle = '#2a221c'; rrect(c, -12.5, -12.5, 25, 25, 3); c.fill();
    c.strokeStyle = '#8a7a66'; c.lineWidth = 1;
    for (const [px, py] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) { c.fillStyle = '#a89a86'; circle(c, px * 0.92, py * 0.92, 1.3); }
    c.strokeStyle = k > 0.2 ? '#ffffff' : '#ffd23a'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
    const off = mode === 'game' ? ((t * 1.6) % 1) * 5 : 0;
    chevron(c, Math.cos(a) * (-3 + off), Math.sin(a) * (-3 + off), a, 5);
    c.strokeStyle = rgba(k > 0.2 ? '#ffffff' : '#ffd23a', 0.55);
    chevron(c, Math.cos(a) * (5 + off), Math.sin(a) * (5 + off), a, 5);
    c.restore();
    if (mode === 'edit' && e.f && e.f !== 2) label(c, x + 11, y - 11, e.f === 1 ? 'S' : 'F', '#ffd23a', 7);
  };
  ART.sp = (c, x, y, e, t, mode) => {
    const d = DIRS[e.d || 0], a = Math.atan2(d[1], d[0]);
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = '#191615'; c.fillRect(-19, -17, 38, 34);
    c.fillStyle = '#ff9a2a'; c.fillRect(-19, -17, 38, 2.5); c.fillRect(-19, 14.5, 38, 2.5);
    c.beginPath(); c.rect(-19, -14, 38, 28); c.clip();
    c.strokeStyle = '#ff9a2a'; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
    const off = mode === 'game' ? ((t * 2.2) % 1) * 13 : 4;
    for (let i = -2; i <= 2; i++) { c.globalAlpha = 0.85; chevron(c, i * 13 + off, 0, 0, 7); }
    c.globalAlpha = 1;
    c.restore();
  };
  const BUMP = [['#ff4a5a', '#8a0e1c'], ['#ffd23a', '#9a6a08'], ['#3aa0ff', '#0e3a8a']]; M74.BUMP = BUMP;
  ART.bm = (c, x, y, e, t, mode) => {
    const k = e.k || 0, [hi, lo] = BUMP[e.st || 0], R = 13 * (1 + k * 0.18);
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x, y + 4, 16, 13); c.fill();
    c.fillStyle = '#2a2424'; circle(c, x, y, 16);
    c.strokeStyle = '#6a5e58'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, 15.5, 0, TAU); c.stroke();
    const g = c.createRadialGradient(x - R * 0.35, y - R * 0.4, 1, x, y, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, hi); g.addColorStop(1, lo);
    c.fillStyle = g; circle(c, x, y, R);
    c.strokeStyle = k > 0.1 ? '#ffffff' : rgba('#ffffff', 0.7); c.lineWidth = 1.6;
    c.beginPath(); for (let i = 0; i < 5; i++) { const aa = -Math.PI / 2 + i * TAU / 5 * 2; const px = x + Math.cos(aa) * R * 0.45, py = y + Math.sin(aa) * R * 0.45; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); c.stroke();
    if (k > 0.05) { c.strokeStyle = rgba('#ffffff', k); c.lineWidth = 2; c.beginPath(); c.arc(x, y, R + 4 + (1 - k) * 8, 0, TAU); c.stroke(); }
  };
  ART.lv = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], st = e.on ? 1 : 0, sw = e.swing || 0;
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x, y + 10, 14, 6); c.fill();
    c.fillStyle = '#3a322c'; rrect(c, x - 12, y + 1, 24, 13, 2); c.fill();
    c.fillStyle = '#5a4e44'; rrect(c, x - 12, y + 1, 24, 4, 2); c.fill();
    const a = (st ? 0.7 : -0.7) + sw;
    c.strokeStyle = '#1a1512'; c.lineWidth = 4.4; c.lineCap = 'round';
    lineC(c, x, y + 4, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17);
    c.strokeStyle = '#9a8e84'; c.lineWidth = 2.6;
    lineC(c, x, y + 4, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17);
    c.fillStyle = col; circle(c, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17, 4.2);
    c.fillStyle = 'rgba(255,255,255,0.5)'; circle(c, x + Math.sin(a) * 17 - 1.2, y + 4 - Math.cos(a) * 17 - 1.4, 1.4);
    c.fillStyle = '#1a1512'; circle(c, x, y + 4, 2.6);
    c.fillStyle = rgba(col, st ? 1 : 0.35); circle(c, x + (st ? 7 : -7), y + 10, 2);
    if (mode === 'edit') label(c, x - 9, y - 11, CH_NAMES[e.ch || 0][0], col, 8);
  };
  ART.gt = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0];
    const open = mode === 'game' ? e.lift || 0 : e.o ? 1 : 0;
    if (open < 1) {
      const h = 1 - open;
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 19, y + 10, 38, 8);
      c.fillStyle = '#1a1716'; c.fillRect(x - 20, y - 17 * h - 2, 5, 34 * h + 6); c.fillRect(x + 15, y - 17 * h - 2, 5, 34 * h + 6);
      for (let i = 0; i < 4; i++) {
        const bx = x - 11 + i * 7.3;
        c.fillStyle = '#2a2624'; c.fillRect(bx - 1.9, y - 18 * h, 3.8, 35 * h);
        c.fillStyle = '#8a8480'; c.fillRect(bx - 1.1, y - 18 * h, 1.4, 35 * h);
        c.fillStyle = '#5a5450'; c.beginPath(); c.moveTo(bx - 2.4, y - 18 * h); c.lineTo(bx, y - 23 * h); c.lineTo(bx + 2.4, y - 18 * h); c.fill();
      }
      c.fillStyle = col; c.fillRect(x - 16, y - 3, 32, 4);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 16, y - 3, 32, 1.2);
    }
    if (open > 0) {
      c.globalAlpha = open;
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x - 17, y - 3, 34, 6);
      c.strokeStyle = rgba(col, 0.75); c.lineWidth = 1.4; c.strokeRect(x - 17, y - 3, 34, 6);
      c.fillStyle = '#0c0a09'; for (let i = 0; i < 4; i++) c.fillRect(x - 12 + i * 7.3, y - 1.6, 2.6, 3.2);
      c.globalAlpha = 1;
    }
    if (mode === 'edit') label(c, x + 12, y - 13, CH_NAMES[e.ch || 0][0], col, 8);
  };
  ART.sg = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x + 2, y + 14, 9, 3.5); c.fill();
    c.fillStyle = '#3a2614'; c.fillRect(x - 1.8, y - 4, 3.6, 18);
    c.fillStyle = '#7a5530'; rrect(c, x - 14, y - 16, 28, 15, 1.5); c.fill();
    c.strokeStyle = '#2a1a0c'; c.lineWidth = 1.2; rrect(c, x - 14, y - 16, 28, 15, 1.5); c.stroke();
    c.strokeStyle = 'rgba(30,18,8,0.7)'; c.lineWidth = 1.1;
    lineC(c, x - 10, y - 12, x + 9, y - 12); lineC(c, x - 10, y - 8.5, x + 6, y - 8.5); lineC(c, x - 10, y - 5, x + 8, y - 5);
  };
  ART.ex = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 15, y - 13, 32, 32);
    c.fillStyle = '#4a4440'; c.fillRect(x - 16, y - 16, 32, 32);
    c.fillStyle = '#2e2a28'; c.fillRect(x - 13, y - 13, 26, 26);
    c.strokeStyle = '#6a625c'; c.lineWidth = 1; for (let i = -1; i <= 1; i++) lineC(c, x - 13, y + i * 7, x + 13, y + i * 7);
    c.fillStyle = '#8a827a'; for (const [px, py] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) circle(c, x + px, y + py, 1.3);
    c.strokeStyle = mode === 'game' ? 'rgba(255,200,120,0.55)' : '#ffc870'; c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x - 6, y - 2); c.lineTo(x, y + 5); c.lineTo(x + 6, y - 2); c.stroke(); lineC(c, x, y - 8, x, y + 4);
  };
  ART.fbPivot = (c, x, y) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 10, y - 8, 22, 22);
    c.fillStyle = '#3a3634'; c.fillRect(x - 11, y - 11, 22, 22);
    c.fillStyle = '#5a5450'; c.fillRect(x - 11, y - 11, 22, 4);
    c.fillStyle = '#1a1716'; circle(c, x, y, 5);
    c.fillStyle = '#ff8a3a'; circle(c, x, y, 2.4);
  };
  const fbBall = (c, x, y, r, t, i) => {
    const f = 1 + Math.sin(t * 22 + i * 1.7) * 0.12;
    const g = c.createRadialGradient(x, y, 0, x, y, r * 1.5 * f);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(0.35, '#ffd24a'); g.addColorStop(0.7, '#ff6a1a'); g.addColorStop(1, 'rgba(255,60,10,0)');
    c.fillStyle = g; circle(c, x, y, r * 1.5 * f);
  }; M74.fbBall = fbBall;
  const fbAngle = (e) => (e.a || 0) / 2 * (Math.PI / 2); M74.fbAngle = fbAngle;
  const FB_SPD = [0, 1.05, 1.7, 2.5]; M74.FB_SPD = FB_SPD;
  ART.fb = (c, x, y, e, t, mode) => {
    ART.fbPivot(c, x, y);
    const n = e.n || 4;
    const a = mode === 'game' ? e.ang : fbAngle(e) + (mode === 'icon' ? t * (e.w || 1) * 1.3 : 0);
    if (mode === 'edit') {
      c.strokeStyle = 'rgba(255,140,60,0.4)'; c.lineWidth = 1; c.setLineDash([4, 4]);
      c.beginPath(); c.arc(x, y, 12 + (n - 1) * 12, 0, TAU); c.stroke(); c.setLineDash([]);
      const aa = a + (e.w || 1) * 0.5;
      c.strokeStyle = 'rgba(255,170,90,0.7)'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(x, y, 12 + (n - 1) * 12 + 5, a, aa, (e.w || 1) < 0); c.stroke();
    }
    if (mode !== 'game') for (let i = 0; i < n; i++) fbBall(c, x + Math.cos(a) * (12 + i * 12), y + Math.sin(a) * (12 + i * 12), mode === 'icon' ? 5 : 5.5, t, i);
  };
  ART.swGroove = (c, e) => {
    if (e.lo == null) return;
    c.fillStyle = 'rgba(0,0,0,0.55)';
    if (e.ax === 'v') c.fillRect(e.x - 3, e.lo - 6, 6, e.hi - e.lo + 12); else c.fillRect(e.lo - 6, e.y - 3, e.hi - e.lo + 12, 6);
    c.fillStyle = 'rgba(255,255,255,0.06)';
    if (e.ax === 'v') c.fillRect(e.x - 3, e.lo - 6, 1.5, e.hi - e.lo + 12); else c.fillRect(e.lo - 6, e.y - 3, e.hi - e.lo + 12, 1.5);
  };
  ART.swBlade = (c, x, y, spin) => {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x + 1, y + 3, 13, 11); c.fill();
    c.save(); c.translate(x, y); c.rotate(spin);
    c.fillStyle = '#8a9098';
    c.beginPath();
    for (let i = 0; i < 12; i++) { const a0 = (i / 12) * TAU, a1 = a0 + TAU / 24; c.lineTo(Math.cos(a0) * 10, Math.sin(a0) * 10); c.lineTo(Math.cos(a1) * 14, Math.sin(a1) * 14); }
    c.closePath(); c.fill();
    const g = c.createRadialGradient(-3, -3, 1, 0, 0, 11); g.addColorStop(0, '#f2f4f8'); g.addColorStop(1, '#6a7078');
    c.fillStyle = g; circle(c, 0, 0, 10.5);
    c.strokeStyle = 'rgba(40,44,50,0.6)'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.rotate(TAU / 3); lineC(c, 3, 0, 9, 0); }
    c.fillStyle = '#2a2c30'; circle(c, 0, 0, 3);
    c.restore();
  };
  ART.sw = (c, x, y, e, t, mode) => {
    if (mode === 'edit' && e.lo != null) ART.swGroove(c, e);
    else if (mode !== 'game') { c.fillStyle = 'rgba(0,0,0,0.5)'; if (e.ax === 'v') c.fillRect(x - 3, y - 19, 6, 38); else c.fillRect(x - 19, y - 3, 38, 6); }
    ART.swBlade(c, x, y, mode === 'game' ? e.spin : t * 6);
  };
  ART.tt = (c, x, y, e, t, mode) => {
    const aim = (e.d === 8);
    const a = aim ? (mode === 'game' && e.aimA != null ? e.aimA : Math.PI / 2) : Math.atan2(DIRS[e.d || 0][1], DIRS[e.d || 0][0]);
    const ch = mode === 'game' ? clamp(e.charge || 0, 0, 1) : 0.4;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 5, 15, 12); c.fill();
    c.fillStyle = '#4a443c'; rrect(c, x - 14, y - 14, 28, 28, 5); c.fill();
    c.fillStyle = '#625a50'; rrect(c, x - 14, y - 14, 28, 9, 5); c.fill();
    c.strokeStyle = '#2a2620'; c.lineWidth = 1.2; rrect(c, x - 14, y - 14, 28, 28, 5); c.stroke();
    c.save(); c.translate(x, y); c.rotate(a);
    // a carved snake head looking the way it spits
    c.fillStyle = '#7a7266'; c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(12, -9, 14, 0); c.quadraticCurveTo(12, 9, -8, 8); c.closePath(); c.fill();
    c.strokeStyle = '#2a2620'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#1a1612'; c.beginPath(); c.moveTo(6, -2.5); c.lineTo(14, 0); c.lineTo(6, 2.5); c.closePath(); c.fill();
    c.fillStyle = mixHex('#2a3a1a', '#d8ff5a', ch); circle(c, 1, -4.5, 2); circle(c, 1, 4.5, 2);
    c.restore();
    if (mode === 'edit') {
      c.strokeStyle = 'rgba(200,230,90,0.55)'; c.lineWidth = 1.4; c.setLineDash([3, 3]);
      if (aim) { c.beginPath(); c.arc(x, y, 18, 0, TAU); c.stroke(); }
      else lineC(c, x + Math.cos(a) * 16, y + Math.sin(a) * 16, x + Math.cos(a) * 34, y + Math.sin(a) * 34);
      c.setLineDash([]);
      if (!e.b) label(c, x + 10, y - 11, '∞', '#d8d0c4', 9);
    }
  };
  ART.bx = (c, x, y, e, t, mode) => {
    const fl = mode === 'game' && e.fuse > 0 && Math.sin(t * 40) > 0;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 13, 13, 5); c.fill();
    c.fillStyle = fl ? '#ffe0c0' : '#7a4a22'; rrect(c, x - 12, y - 10, 24, 24, 6); c.fill();
    c.fillStyle = fl ? '#ffffff' : '#9a6230'; for (let i = -1; i <= 1; i++) c.fillRect(x + i * 7 - 1.5, y - 9, 3, 22);
    c.fillStyle = '#2e2e34'; c.fillRect(x - 12.5, y - 5, 25, 3); c.fillRect(x - 12.5, y + 7, 25, 3);
    c.fillStyle = fl ? '#fff4d8' : '#a8723a'; ell(c, x, y - 10, 12, 4.5); c.fill();
    c.strokeStyle = '#3a2210'; c.lineWidth = 1; ell(c, x, y - 10, 12, 4.5); c.stroke();
    c.fillStyle = '#c3243a'; circle(c, x, y + 2, 4.2);
    c.fillStyle = '#fff4ec'; c.font = `900 7px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', x, y + 2.4);
    c.strokeStyle = '#2a2020'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 3, y - 11); c.quadraticCurveTo(x + 7, y - 17, x + 4, y - 20); c.stroke();
    if (mode === 'game' && e.fuse > 0) { c.globalCompositeOperation = 'lighter'; glowDot(c, x + 4, y - 20, 8, '#ffd24a', 0.9); c.globalCompositeOperation = 'source-over'; }
  };
  ART.ns = (c, x, y, e, t, mode) => {
    const hp = mode === 'game' && e.ob ? clamp(e.ob.hp / e.ob.max, 0, 1) : 1, pulse = 1 + Math.sin(t * 3) * 0.04;
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x + 1, y + 5, 18, 14); c.fill();
    const g = c.createRadialGradient(x - 4, y - 5, 2, x, y, 18 * pulse);
    g.addColorStop(0, '#6a4e34'); g.addColorStop(1, '#2a1c10');
    c.fillStyle = g; ell(c, x, y, 18 * pulse, 15 * pulse); c.fill();
    c.fillStyle = 'rgba(255,220,180,0.08)'; for (let i = 0; i < 5; i++) circle(c, x - 10 + i * 5, y - 8 + (i % 2) * 4, 1.6);
    c.fillStyle = '#0a0605'; ell(c, x, y + 1, 7.5, 6); c.fill();
    const kk = KINDS[e.k || 'grub'] || KINDS.grub;
    c.strokeStyle = kk.body || '#d9c8b3'; c.lineWidth = 2.6; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + Math.sin(t * 4 + i) * 0.4, l = 6 + Math.sin(t * 5 + i * 2) * 2;
      c.beginPath(); c.moveTo(x + Math.cos(a) * 3, y + 1 + Math.sin(a) * 2.5);
      c.quadraticCurveTo(x + Math.cos(a + 0.6) * (l + 2), y + Math.sin(a + 0.6) * (l + 2), x + Math.cos(a) * (l + 4), y + Math.sin(a) * (l + 3)); c.stroke();
    }
    if (hp < 1) {
      c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2;
      const n = Math.ceil((1 - hp) * 6);
      for (let i = 0; i < n; i++) { const a = i * 1.9; lineC(c, x + Math.cos(a) * 9, y + Math.sin(a) * 8, x + Math.cos(a + 0.3) * 16, y + Math.sin(a + 0.3) * 13); }
    }
    if (mode === 'edit') label(c, x + 12, y - 12, String(e.n || 3), '#ffd27a', 8);
  };
  ART.ac = (c, x, y, e, t, mode) => {
    c.save();
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU, r = 17 + Math.sin(a * 3 + (e.c || 0)) * 1.6 + Math.sin(a * 5 + (e.r || 0)) * 1.1; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.92; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.closePath();
    const g = c.createRadialGradient(x, y, 2, x, y, 18);
    g.addColorStop(0, '#b8ff4a'); g.addColorStop(0.6, '#4ac01a'); g.addColorStop(1, '#1a5a0a');
    c.fillStyle = g; c.fill();
    c.strokeStyle = '#123a06'; c.lineWidth = 1.6; c.stroke();
    c.clip();
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.8 + i * 0.37 + (e.c || 0) * 0.13) % 1;
      const bx = x + Math.sin(i * 2.4 + (e.r || 0)) * 10, by = y + Math.cos(i * 1.7) * 9;
      c.strokeStyle = `rgba(230,255,180,${0.7 * (1 - ph)})`; c.lineWidth = 1;
      c.beginPath(); c.arc(bx, by, 1 + ph * 3.2, 0, TAU); c.stroke();
    }
    c.restore();
  };
  ART.wk = (c, x, y, e, t, mode) => {
    const s = mode === 'game' && e.state === 1 ? (Math.random() - 0.5) * 2.2 : 0;
    c.save(); c.translate(x + s, y);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(-18, -18, 36, 36);
    c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 1.3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-16, -6); c.lineTo(-6, -2); c.lineTo(-2, -12); c.lineTo(6, -6); c.lineTo(16, -10);
    c.moveTo(-6, -2); c.lineTo(-4, 8); c.lineTo(-14, 14); c.moveTo(-4, 8); c.lineTo(8, 6); c.lineTo(14, 15); c.moveTo(8, 6); c.lineTo(6, -6); c.stroke();
    c.strokeStyle = 'rgba(255,240,220,0.1)'; c.lineWidth = 1; c.translate(0.8, 0.8);
    c.beginPath(); c.moveTo(-16, -6); c.lineTo(-6, -2); c.lineTo(-2, -12); c.lineTo(6, -6); c.lineTo(16, -10); c.stroke();
    c.restore();
  };
  ART.sk = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 17, y - 17, 34, 34);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const px = x - 10 + i * 10, py = y - 10 + j * 10;
      c.fillStyle = '#1a1716'; circle(c, px, py, 3.4);
      c.fillStyle = '#b8b2aa'; c.beginPath(); c.moveTo(px - 2.6, py + 1.6); c.lineTo(px, py - 4); c.lineTo(px + 2.6, py + 1.6); c.closePath(); c.fill();
    }
    label(c, x + 12, y - 12, e.g ? 'B' : 'A', e.g ? '#7cc4ff' : '#ff9a7a', 8);
  };
  ART.pd = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 14, 14, 5); c.fill();
    c.fillStyle = '#6a625a'; c.fillRect(x - 10, y + 1, 20, 13);
    c.fillStyle = '#4a443e'; c.fillRect(x - 10, y + 10, 20, 4);
    c.fillStyle = '#8a8278'; ell(c, x, y + 1, 13, 5.5); c.fill();
    c.strokeStyle = '#3a342e'; c.lineWidth = 1; ell(c, x, y + 1, 13, 5.5); c.stroke();
    if (mode !== 'game') {
      const id = e.id || 'rand';
      if (id === 'rand' || id === 'rare') {
        c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 15px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y - 7);
      } else safe(() => { c.save(); c.translate(x, y - 8); drawItemIcon(c, id, 17, t); c.restore(); });
      if (e.c) label(c, x, y + 16, String(e.c), '#ffd84a', 7);
    }
  };
  ART.ky = (c, x, y, e, t) => {
    c.save(); c.translate(x, y + Math.sin(t * 3) * 1.2); c.rotate(-0.6);
    c.strokeStyle = '#6a4a08'; c.lineWidth = 4.6; c.lineCap = 'round';
    c.beginPath(); c.arc(-6, 0, 4.6, 0, TAU); c.stroke(); lineC(c, -1.5, 0, 10, 0); lineC(c, 7, 0, 7, 4); lineC(c, 10, 0, 10, 4);
    c.strokeStyle = '#ffd27a'; c.lineWidth = 2.4;
    c.beginPath(); c.arc(-6, 0, 4.6, 0, TAU); c.stroke(); lineC(c, -1.5, 0, 10, 0); lineC(c, 7, 0, 7, 4); lineC(c, 10, 0, 10, 4);
    c.restore();
  };
  ART.cn = (c, x, y, e) => {
    const n = Math.min(4, Math.ceil((e.n || 3) / 2.5));
    for (let i = 0; i < n; i++) {
      const px = x + [-5, 5, 0, -2][i], py = y + [3, 4, -3, -9][i];
      c.fillStyle = '#7a5a08'; ell(c, px, py + 1.4, 6, 3.4); c.fill();
      c.fillStyle = '#ffd84a'; ell(c, px, py, 6, 3.4); c.fill();
      c.fillStyle = '#fff2a8'; ell(c, px - 1.4, py - 0.8, 2.4, 1.1); c.fill();
    }
  };
  function label(c, x, y, s, col, size = 9) {
    c.font = `800 ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(10,6,5,0.9)'; c.strokeText(s, x, y);
    c.fillStyle = col; c.fillText(s, x, y);
  }

  // snake pictures for the editor and the palette, made once per kind
  const SPR = {};
  function snakeSprite(kind, champ) {
    const key = kind + (champ ? '*' : '');
    if (SPR[key]) return SPR[key];
    const S = 96, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const c = cv.getContext('2d');
    safe(() => {
      const keepL = G.levelDef; if (!G.levelDef) G.levelDef = LEVELS[0];
      const sn = new Snake(kind, 0, 0, { emerge: false, ang: 0, preview: true, champ: !!champ });
      G.levelDef = keepL;
      sn.state = 'active'; sn.eyeOpen = 1;
      const total = sn.len * sn.spacing, K = KINDS[kind];
      if (K.blocky) {
        const path = [[0, 0], [2, 0], [2, 1], [0, 1], [0, 2], [3, 2]];
        for (let j = 1; j < path.length; j++) { const [ax, ay] = path[j - 1], [bx, by] = path[j]; for (let i = 1; i <= 10; i++) { const u = i / 10; sn.moveTo((ax + (bx - ax) * u) * 20, (ay + (by - ay) * u) * 20); } }
      } else {
        // a loose S coil so long snakes still fit a square
        const N = 80, R0 = Math.max(10, total / 9);
        for (let i = 0; i <= N; i++) { const u = i / N, a = u * Math.PI * 2.6; sn.moveTo(Math.cos(a) * R0 * (0.5 + u * 0.7) + u * R0 * 0.8, Math.sin(a) * R0 * (0.5 + u * 0.7)); }
      }
      sn.ang = sn.drawAng = Math.atan2(sn.y - sn.trail[2].y, sn.x - sn.trail[2].x);
      if (kind === 'hood') sn.hood = 0.75;
      sn.computeBody();
      let x0 = sn.x - sn.headR * 1.5, x1 = sn.x + sn.headR * 1.5, y0 = sn.y - sn.headR * 1.5, y1 = sn.y + sn.headR * 1.5;
      for (const p of sn.pts) { x0 = Math.min(x0, p.x - p.r - 2); x1 = Math.max(x1, p.x + p.r + 2); y0 = Math.min(y0, p.y - p.r - 2); y1 = Math.max(y1, p.y + p.r + 2); }
      const sc = Math.min((S - 8) / (x1 - x0), (S - 8) / (y1 - y0));
      c.translate(S / 2, S / 2); c.scale(sc, sc); c.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.fillStyle = 'rgba(0,0,0,0.35)'; drawSnakeShadow(c, sn);
      drawSnake(c, sn, 1.3);
    });
    SPR[key] = cv;
    return cv;
  }
  function bossSprite(kind) {
    const key = 'boss:' + kind;
    if (SPR[key]) return SPR[key];
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 92; cv.style.width = '160px'; cv.style.height = '92px';
    cv.dataset.snake = bossArt(kind);
    const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:-9999px;top:0;width:160px;height:92px'; box.appendChild(cv); document.body.appendChild(box);
    safe(() => paintBestiary(box));
    box.remove();
    SPR[key] = cv;
    return cv;
  }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
