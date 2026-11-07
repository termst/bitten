/* src/34-v10-draw-snakes.js: v10: drawing the new snakes. From v10. Lines 18326 to 18519 of the v13.7 script. */
/* =====================================================================
   Drawing the new snakes
   ===================================================================== */
{
  const dec0 = decorateSnake9;
  decorateSnake9 = function (c, sn, t) {
    dec0(c, sn, t);
    const K = sn.K, kind = sn.kind;
    if (kind === 'clown') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      c.fillStyle = sn.dots10 ? sn.dots10[k % sn.dots10.length] : '#ff3a5a';
      circle(c, p.x + nx * p.r * 0.35 * (k % 2 ? 1 : -1), p.y + ny * p.r * 0.35 * (k % 2 ? 1 : -1), p.r * 0.32);
      if (k === 0) {
        // the ruff collar
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + Math.atan2(dy, dx); c.fillStyle = i % 2 ? '#ffffff' : '#ffd23a'; circle(c, p.x + Math.cos(a) * p.r * 0.95, p.y + Math.sin(a) * p.r * 0.95, p.r * 0.36); }
      }
      if (k === sn.pts.length - 1) { c.fillStyle = '#ff3a5a'; circle(c, p.x - dx * p.r * 0.9, p.y - dy * p.r * 0.9, p.r * 0.55); }
    });
    else if (kind === 'killerclown') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      c.save(); c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.clip();
      c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx));
      c.fillStyle = k % 2 ? 'rgba(200,16,42,0.55)' : 'rgba(30,10,20,0.4)'; c.fillRect(-p.r * 0.35, -p.r, p.r * 0.7, p.r * 2);
      c.restore();
      if (k % 3 === 1) { c.fillStyle = 'rgba(232,200,60,0.5)'; circle(c, p.x + nx * p.r * 0.4, p.y + ny * p.r * 0.4, p.r * 0.2); }
      if (k === 0) for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + Math.atan2(dy, dx); c.fillStyle = i % 2 ? '#8a7a70' : '#5a1a2a'; circle(c, p.x + Math.cos(a) * p.r * 0.95, p.y + Math.sin(a) * p.r * 0.95, p.r * 0.32); }
    });
    else if (RAGE10[kind]) segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      // bulging muscle bands and veins
      c.fillStyle = 'rgba(255,170,120,0.22)'; ell(c, p.x + nx * p.r * 0.3, p.y + ny * p.r * 0.3, p.r * 0.5, p.r * 0.35, Math.atan2(dy, dx)); c.fill();
      c.strokeStyle = K.vein; c.lineWidth = Math.max(0.8, p.r * 0.1);
      c.beginPath(); c.moveTo(p.x - nx * p.r * 0.6, p.y - ny * p.r * 0.6); c.quadraticCurveTo(p.x + dx * p.r * 0.4, p.y + dy * p.r * 0.4, p.x + nx * p.r * 0.1 - dx * p.r * 0.3, p.y + ny * p.r * 0.1 - dy * p.r * 0.3); c.stroke();
      if (kind === 'rage3' && k % 2 === 0) { c.fillStyle = '#2a0602'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(p.x + nx * p.r * 0.8 * s, p.y + ny * p.r * 0.8 * s); c.lineTo(p.x + nx * p.r * 1.25 * s - dx * 3, p.y + ny * p.r * 1.25 * s - dy * 3); c.lineTo(p.x + nx * p.r * 0.8 * s - dx * 6, p.y + ny * p.r * 0.8 * s - dy * 6); c.closePath(); c.fill(); } }
    });
    else if (kind === 'stekker') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(p.x + nx * p.r * 0.85, p.y + ny * p.r * 0.85); c.lineTo(p.x - nx * p.r * 0.85, p.y - ny * p.r * 0.85); c.stroke();
      if (k === sn.pts.length - 1) { c.fillStyle = '#e8e8ee'; rrect(c, p.x - dx * p.r - 5, p.y - dy * p.r - 5, 10, 10, 2); c.fill(); }
    });
    else if (kind === 'bosje') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      for (const s of [-1, 1]) leafShape(c, p.x + nx * p.r * 0.5 * s, p.y + ny * p.r * 0.5 * s, p.r * 0.9, Math.atan2(ny * s, nx * s) + Math.sin(t * 3 + k) * 0.2);
    });
    else if (kind === 'peukworm') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      const n = sn.pts.length;
      if (k >= n - 2) { c.fillStyle = K.filter; circle(c, p.x, p.y, p.r * 0.98); c.fillStyle = 'rgba(120,60,20,0.5)'; for (let i = 0; i < 4; i++) circle(c, p.x + Math.cos(i * 1.7 + k) * p.r * 0.5, p.y + Math.sin(i * 2.3 + k) * p.r * 0.5, 0.9); }
      else { c.strokeStyle = 'rgba(160,150,140,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.9, p.y + ny * p.r * 0.9); c.lineTo(p.x - nx * p.r * 0.9, p.y - ny * p.r * 0.9); c.stroke(); }
      if (k === n - 3) { c.strokeStyle = '#c8a050'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.95 - dx * p.r * 0.5, p.y + ny * p.r * 0.95 - dy * p.r * 0.5); c.lineTo(p.x - nx * p.r * 0.95 - dx * p.r * 0.5, p.y - ny * p.r * 0.95 - dy * p.r * 0.5); c.stroke(); }
    });
    else if (kind === 'mutant') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      c.strokeStyle = K.vein; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(p.x + nx * p.r * 0.7, p.y + ny * p.r * 0.7); c.quadraticCurveTo(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.x - nx * p.r * 0.4, p.y - ny * p.r * 0.4); c.stroke();
      if (k % 2) { c.fillStyle = 'rgba(90,40,50,0.35)'; circle(c, p.x - nx * p.r * 0.4, p.y - ny * p.r * 0.4, p.r * 0.25); }
    });
    else if (kind === 'rotter' && sn.rv) segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      if (sn.rv === 1 && k % 2 === 0) { c.fillStyle = '#9aaa3a'; circle(c, p.x - nx * p.r * 0.45, p.y - ny * p.r * 0.45, p.r * 0.3); c.fillStyle = 'rgba(230,255,170,0.6)'; circle(c, p.x - nx * p.r * 0.5, p.y - ny * p.r * 0.5, p.r * 0.1); }
      if (sn.rv === 2) { c.fillStyle = '#1a1006'; circle(c, p.x + nx * p.r * 0.3, p.y + ny * p.r * 0.3, p.r * 0.16); circle(c, p.x - nx * p.r * 0.25 + dx * 2, p.y - ny * p.r * 0.25 + dy * 2, p.r * 0.12); }
      if (sn.rv === 3) { c.strokeStyle = `rgba(122,255,90,${0.45 + 0.25 * Math.sin(t * 3 + k)})`; c.lineWidth = 1.1; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.7, p.y + ny * p.r * 0.7); c.lineTo(p.x + dx * p.r * 0.2, p.y + dy * p.r * 0.2); c.lineTo(p.x - nx * p.r * 0.6, p.y - ny * p.r * 0.6); c.stroke(); }
    });
    else if (kind === 'rotling') segPaint9(sn, (p) => { c.fillStyle = K.ring; circle(c, p.x, p.y, p.r * 0.3); });
  };
}

/* ------------------------------------------------------------------ heads (forward is +x) */
V9_HEADS.clown = (c, sn, H, out, fill, t) => {
  // rainbow hair on both sides of the head
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.fillStyle = ['#ff3a5a', '#ffd23a', '#3a9aff'][i]; circle(c, -H * 0.45 + i * H * 0.12, s * (H * 0.82 + i * H * 0.06), H * 0.34); }
  oval9(c, 0, 0, H * 1.05, H * 0.98, out, '#fbf8f2');
  c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -H * 0.3, -H * 0.35, H * 0.45, H * 0.2); c.fill();
  // the smile and the nose
  c.strokeStyle = '#e8203a'; c.lineWidth = H * 0.16;
  c.beginPath(); c.arc(H * 0.35, 0, H * 0.48, -1.05, 1.05); c.stroke();
  const nb = 1 + (sn.blow || 0) * 0.15;
  c.fillStyle = sn.K.nose; circle(c, H * 1.0, 0, H * 0.3 * nb); c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, H * 0.95, -H * 0.1, H * 0.09);
  // a little party hat
  c.save(); c.translate(-H * 0.55, 0); c.rotate(Math.sin(t * 4 + sn.blinkSeed) * 0.15);
  c.fillStyle = '#3a9aff'; c.beginPath(); c.moveTo(0, -H * 0.4); c.lineTo(-H * 0.75, 0); c.lineTo(0, H * 0.4); c.closePath(); c.fill();
  c.fillStyle = '#ffd23a'; circle(c, -H * 0.78, 0, H * 0.14);
  c.restore();
  // a balloon getting blown up
  if (sn.blow > 0) { const r = H * (0.25 + sn.blow * 0.55); c.fillStyle = 'rgba(255,90,120,0.9)'; ell(c, H * 1.25 + r * 0.8, 0, r * 0.9, r); c.fill(); }
};
V9_HEADS.killerclown = (c, sn, H, out, fill, t) => killerClownHead10(c, sn, H, out, t);
function killerClownHead10(c, sn, H, out, t) {
  // messy red hair
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#a8102a' : '#e8203a'; circle(c, -H * 0.55 + i * H * 0.1, s * (H * 0.78 + Math.sin(t * 6 + i) * H * 0.05), H * 0.32); }
  oval9(c, 0, 0, H * 1.05, H * 1.0, out, sn.K.face || '#d8d0c4');
  c.fillStyle = 'rgba(80,60,60,0.25)'; ell(c, H * 0.1, H * 0.35, H * 0.5, H * 0.3); c.fill();
  // the grin full of teeth
  c.fillStyle = '#3a040a'; c.beginPath(); c.arc(H * 0.32, 0, H * 0.58, -1.15, 1.15); c.lineTo(H * 0.32 + Math.cos(-1.15) * H * 0.3, Math.sin(-1.15) * H * 0.3); c.closePath(); c.fill();
  c.fillStyle = '#f2ecd8';
  for (let i = 0; i < 6; i++) { const a = -1.0 + i * 0.4, x = H * 0.32 + Math.cos(a) * H * 0.55, y = Math.sin(a) * H * 0.55; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * H * 0.2 + 1, y - Math.sin(a) * H * 0.2); c.lineTo(x - 1.5, y + 1); c.closePath(); c.fill(); }
  c.fillStyle = sn.K.nose; circle(c, H * 1.0, 0, H * 0.28);
  // the spiked bat
  const sw = sn.bat || 0;
  c.save(); c.translate(H * 0.2, H * 0.9); c.rotate(-0.6 - sw * 1.3);
  c.fillStyle = '#6a3a1a'; rrect(c, -2.2, 0, 4.4, H * 1.6, 2); c.fill(); c.strokeStyle = '#1a0a04'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#8a5a2a'; rrect(c, -3.6, H * 0.9, 7.2, H * 0.9, 3); c.fill(); c.stroke();
  c.fillStyle = '#c8ccd4'; for (let i = 0; i < 5; i++) { const y = H * 1.0 + i * H * 0.17, s = i % 2 ? 1 : -1; c.beginPath(); c.moveTo(s * 3.4, y); c.lineTo(s * 6.5, y + 1); c.lineTo(s * 3.4, y + 2.2); c.closePath(); c.fill(); }
  c.restore();
}
function rageHead10(c, sn, H, out, fill, t, lvl) {
  oval9(c, -H * 0.05, 0, H * 1.08, H * 1.02, out, fill, 2.4);
  c.fillStyle = sn.K.hi; ell(c, -H * 0.3, -H * 0.4, H * 0.5, H * 0.2); c.fill();
  // the heavy brow and the clenched jaw
  c.fillStyle = mixHex(sn.K.body, '#000000', 0.35); rrect(c, H * 0.05, -H * 0.85, H * 0.4, H * 1.7, H * 0.18); c.fill();
  c.fillStyle = '#2a0a04'; rrect(c, H * 0.62, -H * 0.55, H * 0.42, H * 1.1, H * 0.12); c.fill();
  c.fillStyle = '#f2ecd8'; for (let i = 0; i < 5; i++) c.fillRect(H * 0.66, -H * 0.5 + i * H * 0.21, H * 0.32, H * 0.13);
  c.strokeStyle = '#2a0a04'; c.lineWidth = 1; c.beginPath(); c.moveTo(H * 0.66, 0); c.lineTo(H * 0.98, 0); c.stroke();
  // veins on the head, and torn cloth around the neck for the biggest
  c.strokeStyle = sn.K.vein; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-H * 0.6, -H * 0.2); c.lineTo(-H * 0.3, -H * 0.4); c.lineTo(-H * 0.1, -H * 0.25); c.stroke();
  if (lvl >= 3) { c.fillStyle = '#3a2a1a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-H * 0.85, -H + i * H * 0.45); c.lineTo(-H * 1.2, -H * 0.85 + i * H * 0.45); c.lineTo(-H * 0.9, -H * 0.7 + i * H * 0.45); c.closePath(); c.fill(); } }
  if (sn.lift > 0) { c.strokeStyle = 'rgba(255,140,80,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, H * (1.4 + sn.lift * 0.5), 0, TAU); c.stroke(); }
}
V9_HEADS.rage1 = (c, sn, H, out, fill, t) => rageHead10(c, sn, H, out, fill, t, 1);
V9_HEADS.rage2 = (c, sn, H, out, fill, t) => rageHead10(c, sn, H, out, fill, t, 2);
V9_HEADS.rage3 = (c, sn, H, out, fill, t) => rageHead10(c, sn, H, out, fill, t, 3);
V9_HEADS.stekker = (c, sn, H, out, fill, t) => {
  rrect(c, -H * 0.8, -H * 0.85, H * 1.6, H * 1.7, H * 0.35); c.fillStyle = out; c.fill();
  rrect(c, -H * 0.72, -H * 0.77, H * 1.44, H * 1.54, H * 0.3); c.fillStyle = '#e8e8ee'; c.fill();
  c.fillStyle = '#c8c8d0'; c.fillRect(-H * 0.72, -H * 0.1, H * 1.44, H * 0.2);
  c.fillStyle = '#b8bcc4'; for (const s of [-1, 1]) rrect(c, H * 0.7, s * H * 0.35 - H * 0.12, H * 0.62, H * 0.24, H * 0.08), c.fill();
  if (sn.mode === 'zap') { c.strokeStyle = `rgba(122,208,255,${0.5 + 0.5 * Math.sin(t * 60)})`; c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(H * 1.3, 0); c.lineTo(H * 1.5 + rnd(4), rnd(-H, H)); c.stroke(); } }
};
V9_HEADS.bosje = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.0, H * 0.92, out, fill);
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + t * 0.5; leafShape(c, Math.cos(a) * H * 0.5, Math.sin(a) * H * 0.5, H * 0.8, a); }
  c.fillStyle = '#1a3a10'; ell(c, H * 0.85, 0, H * 0.12, H * 0.3 + (sn.mouth || 0) * H * 0.15); c.fill();
};
V9_HEADS.peukworm = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.0, H * 0.92, out, '#f2f0ea');
  c.fillStyle = '#8a8a92'; ell(c, H * 0.55, 0, H * 0.42, H * 0.8); c.fill();
  const g = c.createRadialGradient(H * 0.8, 0, 1, H * 0.8, 0, H * 0.7);
  g.addColorStop(0, '#fff2a0'); g.addColorStop(0.4, '#ff6a2a'); g.addColorStop(1, 'rgba(160,30,10,0.9)');
  c.fillStyle = g; ell(c, H * 0.8, 0, H * 0.32, H * 0.72); c.fill();
  for (let i = 0; i < 2; i++) { const ph = (t * 0.7 + i * 0.5) % 1; c.fillStyle = `rgba(170,170,180,${0.5 * (1 - ph)})`; circle(c, H * (1.1 + ph * 0.8), Math.sin(t * 2 + i) * H * 0.4, H * (0.2 + ph * 0.4)); }
};
V9_HEADS.mutant = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.1, H * 0.9, out, fill);
  const o = 0.5 + (sn.mouth || 0) * 0.4;
  c.fillStyle = '#2a0a10'; ell(c, H * 0.6, 0, H * 0.45, H * 0.55 * o); c.fill();
  c.fillStyle = '#e8e0c8'; for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; c.beginPath(); c.moveTo(H * 0.6 + Math.cos(a) * H * 0.45, Math.sin(a) * H * 0.55 * o); c.lineTo(H * 0.6 + Math.cos(a) * H * 0.22, Math.sin(a) * H * 0.3 * o); c.lineTo(H * 0.6 + Math.cos(a + 0.4) * H * 0.42, Math.sin(a + 0.4) * H * 0.5 * o); c.closePath(); c.fill(); }
  c.strokeStyle = sn.K.vein; c.lineWidth = 1; c.beginPath(); c.moveTo(-H * 0.6, -H * 0.3); c.lineTo(-H * 0.1, -H * 0.5); c.moveTo(-H * 0.6, H * 0.3); c.lineTo(-H * 0.1, H * 0.5); c.stroke();
};
V9_HEADS.rotling = (c, sn, H, out, fill, t) => headGrub(c, sn, H, out, fill, t);

/* ------------------------------------------------------------------ eyes in the dark */
V9_GLOW.clown = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, pts = [-1, 1].map((k) => loc(H * 0.45, k * H * 0.38));
  for (const [x, y] of pts) glowDot(c, x, y, H * 0.8, sn.K.eye, 0.25 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of pts) {
    c.fillStyle = '#3a9aff'; c.save(); c.translate(x, y); c.rotate(sn.drawAng); c.beginPath(); c.moveTo(0, -H * 0.32); c.lineTo(H * 0.14, 0); c.lineTo(0, H * 0.32); c.lineTo(-H * 0.14, 0); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = '#1a1020'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, H * 0.13, sn.drawAng - 2.4, sn.drawAng - 0.7); c.stroke();
  }
};
V9_GLOW.killerclown = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, vis = sn.cloak == null ? 1 : sn.cloak, pts = [-1, 1].map((k) => loc(H * 0.42, k * H * 0.36));
  for (const [x, y] of pts) glowDot(c, x, y, H * 1.1, '#ffe14a', 0.5 * vis);
  c.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = Math.max(0.05, vis);
  for (const [x, y] of pts) { c.fillStyle = '#1a0408'; ell(c, x, y, H * 0.22, H * 0.18, sn.drawAng); c.fill(); c.fillStyle = '#ffe14a'; circle(c, x, y, H * 0.1); }
  c.strokeStyle = '#1a0408'; c.lineWidth = 2;
  for (const s of [-1, 1]) { const [x, y] = loc(H * 0.2, s * H * 0.35), [x2, y2] = loc(H * 0.55, s * H * 0.15); c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); }
  c.restore();
};
function rageGlow10(c, sn, t, P, loc, lookAt, open) {
  const H = sn.headR;
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.32, k * H * 0.42); glowDot(c, x, y, H * 0.8, sn.K.eye, 0.45 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.32, k * H * 0.42); c.fillStyle = sn.K.eye; ell(c, x, y, H * 0.13, H * 0.07 * open + 0.4, sn.drawAng); c.fill(); }
}
V9_GLOW.rage1 = rageGlow10; V9_GLOW.rage2 = rageGlow10; V9_GLOW.rage3 = rageGlow10;
V9_GLOW.stekker = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.1, k * H * 0.4); glowDot(c, x, y, H * 0.7, sn.K.eye, 0.5 * open); c.fillStyle = sn.K.eye; circle(c, x, y, 1.4); }
  if (sn.mode === 'zap' && sn.zx != null) {
    const u = clamp(sn.mt / 0.85, 0, 1), hx = sn.x + Math.cos(sn.ang) * sn.headR, hy = sn.y + Math.sin(sn.ang) * sn.headR;
    const [ex, ey] = lineEnd10(G.room, hx, hy, hx + (sn.zx - hx) * 2.2, hy + (sn.zy - hy) * 2.2);
    c.strokeStyle = `rgba(122,208,255,${0.15 + 0.55 * u})`; c.lineWidth = 1 + u * 2; c.setLineDash(u < 0.65 ? [5, 5] : []);
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
  }
};
V9_GLOW.bosje = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, vis = Math.max(0.3, sn.cloak == null ? 1 : sn.cloak);
  const pts = [-1, 1].map((k) => loc(H * 0.35, k * H * 0.36));
  for (const [x, y] of pts) glowDot(c, x, y, H * 0.8, sn.K.eye, 0.35 * vis);
  c.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = vis;
  for (const [x, y] of pts) eyeball(c, x, y, H * 0.2, open, lookAt(x, y), '#3a6a10', false);
  c.restore();
};
V9_GLOW.peukworm = (c, sn, t) => { const [x, y] = [sn.x + Math.cos(sn.drawAng) * sn.headR * 0.8, sn.y + Math.sin(sn.drawAng) * sn.headR * 0.8]; glowDot(c, x, y, sn.headR * 1.8, '#ff6a2a', 0.35 + 0.15 * Math.sin(t * 7)); };
V9_GLOW.mutant = (c, sn, t) => { if (sn.rush > 0) glowDot(c, sn.x, sn.y, sn.headR * 1.6, '#e8e0d8', 0.12); };
V9_GLOW.rotling = (c, sn, t, P, loc, lookAt, open) => { const H = sn.headR, [x, y] = loc(H * 0.05, 0); glowDot(c, x, y, H * 2, sn.K.eye, 0.3 * open); c.globalCompositeOperation = 'source-over'; eyeball(c, x, y, H * 0.5, open, lookAt(x, y), '#9aaa1a', false); };

