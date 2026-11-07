/* src/36-v10-draw-bosses.js: v10: drawing the bosses. From v10. Lines 19032 to 19282 of the v13.7 script. */
/* =====================================================================
   Drawing the bosses
   ===================================================================== */
V9_BODY.tvboss = (c, sn, t) => {
  const pts = sn.pts, flash = sn.flash > 0, a0 = sn.cloak == null ? 1 : sn.cloak;
  c.save(); c.globalAlpha *= Math.max(0.05, a0);
  const screen = (x, y, a, w, h, k, head) => {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
    rrect(c, -w / 2 - 1.5, -h / 2 - 1.5, w + 3, h + 3, 3); c.fillStyle = '#050608'; c.fill();
    rrect(c, -w / 2, -h / 2, w, h, 2.5); c.fillStyle = flash ? '#ffffff' : '#16181e'; c.fill();
    const hue = (k * 47 + Math.floor(t * 2) * 13) % 360;
    c.fillStyle = sn.mode === 'zapOut' || sn.mode === 'zapIn' ? `hsl(${(t * 900) % 360},20%,${40 + Math.random() * 30}%)` : `hsl(${hue},55%,${head ? 30 : 38}%)`;
    c.fillRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5);
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, (h - 5) * 0.35);
    if (!head) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = `800 ${Math.round(h * 0.28)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(['4K', 'HD', 'OLED', 'SALE', '8K'][k % 5], 0, 0); }
    c.restore();
  };
  for (let k = pts.length - 1; k >= 0; k--) {
    const p = pts[k]; if (p.hid) continue;
    const [dx, dy] = bodyDir(sn, k);
    screen(p.x, p.y, Math.atan2(dy, dx) + Math.PI / 2, p.r * 2.6, p.r * 1.7, k, false);
  }
  if (!sn.burrowed) {
    const H = sn.headR;
    screen(sn.x, sn.y, sn.drawAng + Math.PI / 2, H * 2.6, H * 1.8, 0, true);
    // the face on the screen
    c.save(); c.translate(sn.x, sn.y); c.rotate(sn.drawAng + Math.PI / 2);
    c.fillStyle = '#e8f4ff';
    const blink = sn.blinkT > 0 ? 0.2 : 1;
    for (const s of [-1, 1]) c.fillRect(s * H * 0.45 - 3, -H * 0.25, 6, 6 * blink);
    c.fillRect(-H * 0.45, H * 0.2, H * 0.9, 3);
    if (sn.sale) { c.fillStyle = '#ff3a3a'; c.font = `800 ${Math.round(H * 0.38)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('-70%', 0, -H * 0.62); }
    c.restore();
  }
  c.restore();
};
V9_HEADS.tvboss = () => {};
V9_GLOW.tvboss = (c, sn, t) => { if (!sn.burrowed) glowDot(c, sn.x, sn.y, sn.headR * 2.4, '#7ad0ff', 0.18 * (sn.cloak == null ? 1 : sn.cloak)); };

V9_HEADS.kampioen = (c, sn, H, out, fill, t) => {
  const s = 1 + (sn.air9 || 0) * 0.35; c.scale(s, s);
  oval9(c, 0, 0, H * 1.08, H * 1.0, out, fill, 2.4);
  c.fillStyle = sn.K.hi; ell(c, -H * 0.3, -H * 0.4, H * 0.5, H * 0.2); c.fill();
  // the gold helmet with a crest
  c.fillStyle = sn.K.gold; rrect(c, -H * 0.85, -H * 0.9, H * 0.7, H * 1.8, H * 0.3); c.fill(); c.strokeStyle = '#6a4a00'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#e83a3a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-H * 0.9 - i * 2, -H * 0.5 + i * H * 0.25); c.lineTo(-H * 1.3, -H * 0.42 + i * H * 0.25); c.lineTo(-H * 0.9, -H * 0.3 + i * H * 0.25); c.closePath(); c.fill(); }
  // a big grin
  c.fillStyle = '#0a1430'; c.beginPath(); c.arc(H * 0.45, 0, H * 0.45, -1.1, 1.1); c.closePath(); c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(H * 0.55, -H * 0.3, H * 0.26, H * 0.6);
  if (sn.hyper) { c.strokeStyle = `rgba(200,106,255,${0.5 + 0.4 * Math.sin(t * 10)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, H * 1.35, 0, TAU); c.stroke(); }
};
V9_GLOW.kampioen = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.15, k * H * 0.42); glowDot(c, x, y, H * 0.7, sn.hyper ? '#c86aff' : '#7ad0ff', 0.4 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.15, k * H * 0.42); eyeball(c, x, y, H * 0.17, open, lookAt(x, y), '#1a3aa8', false); }
  // the super meter over his head
  const w = 46, x = sn.x - w / 2, y = sn.y - H * 2 - 6, f = clamp(sn.superM || 0, 0, 1);
  c.fillStyle = 'rgba(10,10,20,0.75)'; rrect(c, x - 2, y - 2, w + 4, 8, 3); c.fill();
  c.fillStyle = f >= 1 ? (Math.sin(t * 20) > 0 ? '#fff2a0' : '#ffd23a') : '#ffd23a'; rrect(c, x, y, w * f, 4, 2); c.fill();
  txt10(c, 'SUPER', sn.x, y - 6, 7, '#ffd23a');
};
decorate10Boss();
function decorate10Boss() {
  const dec0 = decorateSnake9;
  decorateSnake9 = function (c, sn, t) {
    dec0(c, sn, t);
    const K = sn.K, kind = sn.kind;
    if (kind === 'kampioen') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      if (k % 2 === 0) { c.strokeStyle = K.gold; c.lineWidth = p.r * 0.25; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.9, p.y + ny * p.r * 0.9); c.quadraticCurveTo(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.x - nx * p.r * 0.9, p.y - ny * p.r * 0.9); c.stroke(); }
      if (k === 2) { c.fillStyle = '#ffffff'; c.font = `800 ${Math.round(p.r * 0.9)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', p.x, p.y + 1); }
    });
    else if (kind === 'peuk') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      const n = sn.pts.length;
      if (k >= n - 3) { c.fillStyle = K.filter; circle(c, p.x, p.y, p.r * 0.98); c.fillStyle = 'rgba(120,60,20,0.5)'; for (let i = 0; i < 6; i++) circle(c, p.x + Math.cos(i * 1.7 + k) * p.r * 0.55, p.y + Math.sin(i * 2.3 + k) * p.r * 0.55, 1.1); }
      else if (k === 3) { c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx) + Math.PI / 2); txt10(c, 'ROKEN', 0, -2.5, 5.5, '#1a1a1a'); txt10(c, 'IS DODELIJK', 0, 3.5, 4.2, '#1a1a1a'); c.restore(); }
      else { c.strokeStyle = 'rgba(160,150,140,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.9, p.y + ny * p.r * 0.9); c.lineTo(p.x - nx * p.r * 0.9, p.y - ny * p.r * 0.9); c.stroke(); }
    });
    else if (kind === 'tunnel') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      if (k % 3 === 0) { c.strokeStyle = K.strap; c.lineWidth = p.r * 0.3; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.95, p.y + ny * p.r * 0.95); c.lineTo(p.x - nx * p.r * 0.95, p.y - ny * p.r * 0.95); c.stroke(); c.fillStyle = '#a89060'; c.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
      if (k % 3 === 1) { c.fillStyle = '#4a4a3a'; rrect(c, p.x - nx * p.r * 0.6 - 3, p.y - ny * p.r * 0.6 - 3, 6, 6, 1.5); c.fill(); }
    });
    else if (kind === 'leegte') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      c.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 3; i++) { const h = hash9(k, i, 7); circle(c, p.x + (h - 0.5) * p.r * 1.4, p.y + (hash9(i, k, 3) - 0.5) * p.r * 1.4, 0.6 + h * 0.6); }
      if (k % 3 === 1) { const e = 0.5 + 0.5 * Math.sin(t * 2 + k); c.fillStyle = '#f2f0ff'; ell(c, p.x + nx * p.r * 0.4, p.y + ny * p.r * 0.4, p.r * 0.22, p.r * 0.22 * e); c.fill(); c.fillStyle = '#5a3aff'; circle(c, p.x + nx * p.r * 0.4, p.y + ny * p.r * 0.4, p.r * 0.09 * e); }
    });
    else if (kind === 'spook') segPaint9(sn, (p, k) => {
      if (k === 1) { c.strokeStyle = '#6a6a72'; c.lineWidth = 1.6; c.setLineDash([2.5, 1.5]); c.beginPath(); c.arc(p.x, p.y, p.r * 0.9, 0, TAU); c.stroke(); c.setLineDash([]); }
    });
  };
}
V9_HEADS.peuk = (c, sn, H, out, fill, t) => V9_HEADS.peukworm(c, sn, H, out, fill, t);
V9_GLOW.peuk = (c, sn, t) => { const x = sn.x + Math.cos(sn.drawAng) * sn.headR * 0.8, y = sn.y + Math.sin(sn.drawAng) * sn.headR * 0.8; glowDot(c, x, y, sn.headR * 2.4, '#ff6a2a', 0.4 + 0.15 * Math.sin(t * 7)); };
V9_HEADS.tunnel = (c, sn, H, out, fill, t) => {
  // the rifle, along the right side of the head
  c.fillStyle = '#1a1a16'; c.fillRect(H * 0.2, H * 0.32, H * 1.25, H * 0.22); c.fillStyle = '#5a4a2a'; c.fillRect(-H * 0.2, H * 0.28, H * 0.55, H * 0.3);
  c.fillStyle = '#8a8a7a'; circle(c, H * 0.1, H * 0.62, H * 0.2);
  // the hood and the mask
  oval9(c, -H * 0.1, 0, H * 1.0, H * 0.96, out, '#2a2c26', 2.4);
  oval9(c, H * 0.25, 0, H * 0.72, H * 0.78, out, '#4a4c44', 1.6);
  // the filter can at the front
  c.fillStyle = '#1a1a16'; rrect(c, H * 0.75, -H * 0.3, H * 0.45, H * 0.6, H * 0.12); c.fill();
  c.fillStyle = '#6a6a5a'; for (let i = 0; i < 3; i++) c.fillRect(H * 0.8, -H * 0.22 + i * H * 0.18, H * 0.35, H * 0.06);
  // the headlamp on top
  c.fillStyle = '#5a5a4a'; rrect(c, -H * 0.55, -H * 0.18, H * 0.32, H * 0.36, H * 0.08); c.fill();
  c.fillStyle = '#fff6d8'; circle(c, -H * 0.36, 0, H * 0.11);
  c.strokeStyle = '#3a3020'; c.lineWidth = 1.4; c.beginPath(); c.arc(-H * 0.1, 0, H * 0.9, 2.2, 4.1); c.stroke();
};
V9_GLOW.tunnel = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  // the goggles reflect, the headlamp throws a cone
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.42, k * H * 0.34); glowDot(c, x, y, H * 0.6, '#d8f0ff', 0.25); }
  const [lx, ly] = loc(-H * 0.36, 0), a = sn.drawAng;
  const g = c.createRadialGradient(lx, ly, 4, lx, ly, 230);
  g.addColorStop(0, 'rgba(255,246,216,0.32)'); g.addColorStop(1, 'rgba(255,246,216,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(lx, ly); c.arc(lx, ly, 230, a - 0.32, a + 0.32); c.closePath(); c.fill();
  glowDot(c, lx, ly, 14, '#fff6d8', 0.6);
  c.globalCompositeOperation = 'source-over';
  for (const k of [-1, 1]) {
    const [x, y] = loc(H * 0.42, k * H * 0.34);
    c.fillStyle = '#0c0e0a'; circle(c, x, y, H * 0.26); c.fillStyle = 'rgba(160,200,220,0.75)'; circle(c, x, y, H * 0.2);
    c.fillStyle = 'rgba(255,255,255,0.7)'; circle(c, x - H * 0.06, y - H * 0.06, H * 0.06);
  }
  if (sn.mode === 'aim') { const u = clamp(sn.mt / 0.4, 0, 1), mx = sn.x + Math.cos(a) * (H + 14), my = sn.y + Math.sin(a) * (H + 14); c.strokeStyle = `rgba(255,80,60,${0.2 + 0.4 * u})`; c.lineWidth = 1; c.setLineDash([3, 6]); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + Math.cos(a) * 300, my + Math.sin(a) * 300); c.stroke(); c.setLineDash([]); }
};
V9_HEADS.leegte = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.1, H * 1.05, out, fill, 2.6);
  // a ring of small teeth around the eye
  c.fillStyle = '#d8d0f0';
  for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * H * 0.95, Math.sin(a) * H * 0.95); c.lineTo(Math.cos(a + 0.12) * H * 0.75, Math.sin(a + 0.12) * H * 0.75); c.lineTo(Math.cos(a + 0.24) * H * 0.95, Math.sin(a + 0.24) * H * 0.95); c.closePath(); c.fill(); }
  if (sn.lift > 0) { c.strokeStyle = 'rgba(154,122,255,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, H * (1.4 + sn.lift * 0.5), 0, TAU); c.stroke(); }
};
V9_GLOW.leegte = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  glowDot(c, sn.x, sn.y, H * 2.2, '#7a5aff', 0.25 + (sn.mode === 'pull' ? 0.2 : 0));
  c.globalCompositeOperation = 'source-over';
  eyeball(c, sn.x, sn.y, H * 0.62, open, lookAt(sn.x, sn.y), '#5a3aff', true);
};
V9_HEADS.spook = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.05, H * 1.0, out, fill, 1.4);
  c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -H * 0.3, -H * 0.35, H * 0.4, H * 0.2); c.fill();
  c.fillStyle = '#1a2a4a'; ell(c, H * 0.62, 0, H * 0.18, H * (0.22 + (sn.mode === 'boo' ? 0.2 : 0))); c.fill();
};
V9_GLOW.spook = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, vis = sn.cloak == null ? 1 : sn.cloak;
  glowDot(c, sn.x, sn.y, H * 2.6, '#a8c8ff', 0.2 * vis);
  c.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = Math.max(0.1, vis);
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.2, k * H * 0.4); c.fillStyle = '#0a1020'; ell(c, x, y, H * 0.22, H * 0.3, sn.drawAng); c.fill(); }
  c.restore();
};

/* ------------------------------------------------------------------ Jaude: an apple, blond and ginger hair, glasses */
function drawJaude10(c, x, y, R, o = {}) {
  const t = G.t || 0, mad = o.mad == null ? 1 : o.mad, look = o.look || 0;
  c.save(); c.translate(x, y);
  if (o.scale) c.scale(o.scale, o.scale);
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 0, R * 0.95, R * 0.8, R * 0.25); c.fill();
  // the hair at the back: long, half blond and half ginger
  for (let i = 0; i < 9; i++) {
    const s = i < 4 ? -1 : i > 4 ? 1 : 0, u = (i % 5) / 4;
    c.fillStyle = i % 2 ? '#f2d27a' : '#d8742a';
    ell(c, (i - 4) * R * 0.22, R * 0.15 + Math.abs(i - 4) * R * 0.06, R * 0.28, R * 0.75 + u * R * 0.1, s * 0.15); c.fill();
  }
  // the apple
  const g = c.createRadialGradient(-R * 0.38, -R * 0.42, R * 0.08, 0, 0, R * 1.18);
  g.addColorStop(0, '#ff8a7e'); g.addColorStop(0.42, '#e0304a'); g.addColorStop(1, '#7a0f22');
  applePath(c, R); c.fillStyle = o.flash ? '#ffffff' : g; c.fill();
  applePath(c, R); c.strokeStyle = '#2b070f'; c.lineWidth = Math.max(1, R * 0.08); c.stroke();
  ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = 'rgba(255,255,255,0.42)'; c.fill();
  // the fringe: blond on one side, ginger on the other, messy from bed
  c.fillStyle = '#f2d27a'; c.beginPath(); c.moveTo(-R * 0.95, -R * 0.1); c.quadraticCurveTo(-R * 0.9, -R * 1.05, 0, -R * 0.78); c.quadraticCurveTo(-R * 0.35, -R * 0.45, -R * 0.95, -R * 0.1); c.fill();
  c.fillStyle = '#d8742a'; c.beginPath(); c.moveTo(R * 0.95, -R * 0.1); c.quadraticCurveTo(R * 0.9, -R * 1.05, 0, -R * 0.78); c.quadraticCurveTo(R * 0.35, -R * 0.45, R * 0.95, -R * 0.1); c.fill();
  c.strokeStyle = '#f8e4a0'; c.lineWidth = R * 0.05; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-R * (0.2 + i * 0.22), -R * 0.8); c.lineTo(-R * (0.3 + i * 0.2), -R * 1.05 - Math.sin(t * 3 + i) * R * 0.04); c.stroke(); }
  // glasses, eyes and a cross face
  const ex = R * 0.33, ey = -R * 0.04;
  for (const s of [-1, 1]) {
    c.fillStyle = '#fff8ec'; ell(c, s * ex, ey, R * 0.16, R * (o.sleepy ? 0.05 : 0.18)); c.fill();
    if (!o.sleepy) { c.fillStyle = '#3a2a1a'; circle(c, s * ex + look * R * 0.05, ey + R * 0.03, R * 0.07); }
    c.strokeStyle = '#2a1a10'; c.lineWidth = R * 0.07; c.beginPath(); c.arc(s * ex, ey, R * 0.24, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(200,235,255,0.2)'; circle(c, s * ex, ey, R * 0.22);
  }
  c.strokeStyle = '#2a1a10'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(-R * 0.09, ey - R * 0.02); c.lineTo(R * 0.09, ey - R * 0.02); c.stroke();
  c.strokeStyle = '#3e0912'; c.lineWidth = R * 0.08; c.lineCap = 'round';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.52, -R * 0.36 - mad * R * 0.08); c.lineTo(s * R * 0.16, -R * 0.3 + mad * R * 0.06); c.stroke(); }
  if (o.yell) { c.fillStyle = '#2a0509'; ell(c, 0, R * 0.42, R * 0.16, R * 0.14 + Math.abs(Math.sin(t * 14)) * R * 0.06); c.fill(); }
  else { c.beginPath(); c.moveTo(-R * 0.16, R * 0.45); c.quadraticCurveTo(0, R * (0.36 - mad * 0.06), R * 0.16, R * 0.45); c.stroke(); }
  // a stem with a sleep mask hanging off it
  c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(0, -R * 0.62); c.lineTo(R * 0.1, -R * 1.05); c.stroke();
  c.fillStyle = '#7a5ab8'; rrect(c, R * 0.12, -R * 1.12, R * 0.5, R * 0.2, R * 0.08); c.fill();
  c.restore();
}
V9_BODY.jaude = (c, sn, t) => {
  if (sn.burrowed) return;
  const lift = (sn.air9 || 0) * 18, R = 15;
  const dying = sn.dying > 0;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, sn.x, sn.y + 12, 12 * (1 - (sn.air9 || 0) * 0.3), 4); c.fill();
  drawJaude10(c, sn.x, sn.y - lift - 2, R, { mad: dying ? -0.4 : 1, yell: !dying && (sn.mode === 'stomp' || sn.mouth > 0.5), flash: sn.flash > 0, look: Math.cos(sn.drawAng), sleepy: dying, scale: dying ? 1 - Math.min(0.15, sn.dying * 0.1) : 1 });
  if (dying) for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; c.globalAlpha = 1 - ph; txt10(c, 'z', sn.x + 14 + ph * 12, sn.y - 24 - ph * 24, 9 + i * 2, '#e8e2f0'); c.globalAlpha = 1; }
};
V9_HEADS.jaude = () => {};
V9_GLOW.jaude = () => {};

/* ------------------------------------------------------------------ projectiles */
VENOM9.pixel10 = (c, v, t) => { c.fillStyle = '#050608'; c.fillRect(v.x - 5, v.y - 5, 10, 10); c.fillStyle = `hsl(${(v.ph * 60 + t * 300) % 360},80%,60%)`; c.fillRect(v.x - 4, v.y - 4, 8, 8); };
VENOM9.coupon10 = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate(Math.sin(v.t * 6) * 0.3);
  c.fillStyle = '#1a1a1a'; c.fillRect(-9, -5.5, 18, 11); c.fillStyle = '#ffd23a'; c.fillRect(-8, -4.5, 16, 9);
  c.fillStyle = '#e83a3a'; c.font = `800 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('-50%', 0, 0.5);
  c.restore();
};
VENOM9.shell10 = (c, v, t) => { const a = Math.atan2(v.vy, v.vx); c.save(); c.translate(v.x, v.y); c.rotate(a); c.fillStyle = '#6a4a00'; rrect(c, -6, -3.5, 12, 7, 3); c.fill(); c.fillStyle = '#ffd23a'; rrect(c, -5, -2.5, 10, 5, 2.5); c.fill(); c.restore(); };
VENOM9.rocket10 = (c, v, t) => {
  const a = Math.atan2(v.vy, v.vx);
  c.save(); c.translate(v.x, v.y); c.rotate(a);
  c.fillStyle = '#ff8a2a'; flameShape(c, -9, 0, 3, 4 + Math.sin(t * 40) * 1.5); c.fill();
  c.fillStyle = '#e8e2d0'; rrect(c, -7, -3, 12, 6, 2.5); c.fill(); c.fillStyle = '#e83a3a'; c.beginPath(); c.moveTo(5, -3); c.lineTo(9, 0); c.lineTo(5, 3); c.closePath(); c.fill();
  c.restore();
};
VENOM9.bearing10 = (c, v, t) => { c.fillStyle = '#3a3a34'; circle(c, v.x, v.y, 4); c.fillStyle = '#d8d0b8'; circle(c, v.x - 1, v.y - 1, 2.2); };
VENOM9.void10 = (c, v, t) => { c.fillStyle = '#0a0614'; circle(c, v.x, v.y, v.r + 1); c.fillStyle = '#5a3aff'; circle(c, v.x, v.y, v.r * 0.7); c.fillStyle = '#f2f0ff'; circle(c, v.x + Math.cos(t * 9) * 1.5, v.y + Math.sin(t * 9) * 1.5, 1.4); };
VENOM9.ecto10 = (c, v, t) => { const w = 1 + Math.sin(t * 15 + v.ph) * 0.15; c.fillStyle = 'rgba(168,200,255,0.85)'; ell(c, v.x, v.y, v.r * w, v.r / w); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; circle(c, v.x - 1.5, v.y - 1.5, 1.6); };
VENOM9.pot10 = (c, v, t) => {
  const lift = v.rise10 ? 10 : 0;
  c.save(); c.translate(v.x, v.y - lift); c.rotate(v.t > 0 ? v.t * 9 + (v.spin || 0) : Math.sin(t * 20) * 0.2);
  c.fillStyle = '#3a2416'; ell(c, 0, 0, 9, 10); c.fill(); c.fillStyle = G.levelDef.clay || '#9a5c3b'; ell(c, 0, 0, 8, 9); c.fill();
  c.fillStyle = 'rgba(168,200,255,0.5)'; c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.fill();
  c.restore();
};
VENOM9.pillow10 = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate((v.spin || 0) + v.t * 5);
  rrect(c, -10, -7, 20, 14, 5); c.fillStyle = '#f2f0ea'; c.fill(); c.strokeStyle = '#8a8aa0'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#c8c0e8'; c.fillRect(-10, -1, 20, 2);
  c.restore();
};
VENOM9.feather10 = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate((v.spin || 0) + Math.sin(v.t * 8) * 0.5);
  c.fillStyle = '#f2f0ea'; ell(c, 0, 0, 7, 2.6); c.fill(); c.strokeStyle = '#a8a0b0'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.stroke();
  c.restore();
};
// pots rise first, then fly
{
  const uv0 = updateVenom;
  updateVenom = function (dt, room) {
    for (const v of G.venom) if (v && v.rise10 && v.t + dt >= 0) { v.rise10 = false; v.vx = v.vx0; v.vy = v.vy0; }
    uv0(dt, room);
  };
}

