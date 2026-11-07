/* src/20-v9-draw-snakes.js: v9 drawing: new snakes and bosses, Peanapple, icons. From v9. Lines 11810 to 12476 of the v13.7 script. */
/* =====================================================================
   Version 9 drawing: the new snakes and bosses, Peanapple, and the
   icons for every new powerup, curse and downgrade
   ===================================================================== */
const V9_HEADS = {};
const V9_GLOW = {};
const V9_BODY = {};

function oval9(c, x, y, rx, ry, out, fill, g = 1.8) {
  ell(c, x, y, rx + g, ry + g); c.fillStyle = out; c.fill();
  ell(c, x, y, rx, ry); c.fillStyle = fill; c.fill();
}
function segPaint9(sn, fn) {
  const pts = sn.pts;
  for (let k = 0; k < pts.length; k++) {
    const p = pts[k]; if (p.hid) continue;
    const [dx, dy] = bodyDir(sn, k);
    fn(p, k, dx, dy, -dy, dx);
  }
}

/* ------------------------------------------------------------------ body patterns */
function decorateSnake9(c, sn, t) {
  const K = sn.K, kind = sn.kind;
  if (kind === 'stok') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    if (k % 2) return;
    c.strokeStyle = K.stripe; c.lineWidth = p.r * 0.35;
    c.beginPath(); c.moveTo(p.x + nx * p.r * 0.7, p.y + ny * p.r * 0.7); c.quadraticCurveTo(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.x - nx * p.r * 0.7, p.y - ny * p.r * 0.7); c.stroke();
  });
  else if (kind === 'stroopw') segPaint9(sn, (p, k, dx, dy) => {
    c.save(); c.beginPath(); c.arc(p.x, p.y, p.r * 0.92, 0, TAU); c.clip();
    c.strokeStyle = K.grid; c.lineWidth = 1.1;
    const a = Math.atan2(dy, dx) + Math.PI / 4;
    for (let i = -3; i <= 3; i++) for (const s of [0, Math.PI / 2]) {
      const ca = Math.cos(a + s), sa = Math.sin(a + s), o = i * p.r * 0.32;
      c.beginPath(); c.moveTo(p.x - sa * o - ca * p.r, p.y + ca * o - sa * p.r); c.lineTo(p.x - sa * o + ca * p.r, p.y + ca * o + sa * p.r); c.stroke();
    }
    c.restore();
    c.strokeStyle = 'rgba(184,102,26,0.8)'; c.lineWidth = 1.6; c.beginPath(); c.arc(p.x, p.y, p.r * 0.92, 0, TAU); c.stroke();
  });
  else if (kind === 'bril') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    if (k === 0 || k > 3) return;
    c.fillStyle = K.vest; ell(c, p.x, p.y, p.r * 0.75, p.r * 0.5, Math.atan2(dy, dx)); c.fill();
    if (k === 1) { c.fillStyle = '#3a6ab0'; c.fillRect(p.x + nx * p.r * 0.3 - 1.5, p.y + ny * p.r * 0.3 - 3, 3, 6); }
  });
  else if (kind === 'handel') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    if (k % 3 === 1) { c.strokeStyle = K.gold; c.lineWidth = p.r * 0.3; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.9, p.y + ny * p.r * 0.9); c.quadraticCurveTo(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.x - nx * p.r * 0.9, p.y - ny * p.r * 0.9); c.stroke(); }
    if (k === 2) { c.fillStyle = '#7a4a1a'; circle(c, p.x + nx * p.r * 0.7, p.y + ny * p.r * 0.7, p.r * 0.55); c.fillStyle = K.gold; circle(c, p.x + nx * p.r * 0.7, p.y + ny * p.r * 0.7 - 1, p.r * 0.22); }
  });
  else if (kind === 'pantser') segPaint9(sn, (p, k, dx, dy) => {
    c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx));
    rrect(c, -p.r * 0.55, -p.r * 0.95, p.r * 1.1, p.r * 1.9, p.r * 0.35); c.fillStyle = sn.shell ? '#a8b0bc' : K.plate; c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (const s of [-1, 1]) circle(c, 0, s * p.r * 0.6, 1.2);
    c.restore();
  });
  else if (kind === 'driekop') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    c.fillStyle = K.scale;
    for (const s of [-1, 1]) { ell(c, p.x + nx * p.r * 0.45 * s, p.y + ny * p.r * 0.45 * s, p.r * 0.28, p.r * 0.18, Math.atan2(dy, dx)); c.fill(); }
  });
  else if (kind === 'sloper') segPaint9(sn, (p, k, dx, dy) => {
    c.save(); c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.clip();
    c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx) + 0.7);
    c.fillStyle = K.band; for (let i = -3; i <= 3; i++) c.fillRect(i * p.r * 0.55 - p.r * 0.14, -p.r * 1.4, p.r * 0.28, p.r * 2.8);
    c.restore();
  });
  else if (kind === 'kameleon') {
    const hue = (t * 40 + sn.blinkSeed * 30) % 360;
    segPaint9(sn, (p, k) => { if (k % 2) return; c.fillStyle = `hsla(${(hue + k * 25) % 360},70%,55%,0.35)`; circle(c, p.x, p.y, p.r * 0.7); });
    const tl = sn.pts[sn.pts.length - 1];
    if (tl && !tl.hid) { c.strokeStyle = K.body; c.lineWidth = tl.r * 0.9; c.beginPath(); c.arc(tl.x, tl.y, tl.r * 1.6, 0, Math.PI * 1.5); c.stroke(); }
  } else if (kind === 'raver') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    if (k % 2) return;
    c.strokeStyle = ['#ff3ad8', '#3ad8ff', '#d8ff3a'][k % 3]; c.lineWidth = p.r * 0.45;
    c.beginPath(); c.moveTo(p.x + nx * p.r * 0.8, p.y + ny * p.r * 0.8); c.lineTo(p.x - nx * p.r * 0.8, p.y - ny * p.r * 0.8); c.stroke();
  });
  else if (kind === 'manu' || kind === 'manudevil') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    c.strokeStyle = K.crease; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(p.x + nx * p.r * 0.85 - dx * p.r * 0.2, p.y + ny * p.r * 0.85 - dy * p.r * 0.2); c.quadraticCurveTo(p.x + dx * p.r * 0.35, p.y + dy * p.r * 0.35, p.x - nx * p.r * 0.85 - dx * p.r * 0.2, p.y - ny * p.r * 0.85 - dy * p.r * 0.2); c.stroke();
    if (k === 0) { c.strokeStyle = '#f2c230'; c.lineWidth = 3.4; c.beginPath(); c.arc(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.r * 0.75, Math.atan2(dy, dx) - 1.2, Math.atan2(dy, dx) + 1.2); c.stroke(); }
    if (kind === 'manudevil' && k === sn.pts.length - 1) {
      c.fillStyle = '#2a0004'; c.beginPath(); const bx = p.x - dx * p.r, by = p.y - dy * p.r;
      c.moveTo(bx + nx * 5, by + ny * 5); c.lineTo(bx - dx * 16, by - dy * 16); c.lineTo(bx - nx * 5, by - ny * 5); c.closePath(); c.fill();
    }
  });
  else if (kind === 'rechter') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
    if (k === 0) { c.fillStyle = K.bef; c.beginPath(); c.moveTo(p.x + dx * p.r * 0.6 + nx * 4, p.y + dy * p.r * 0.6 + ny * 4); c.lineTo(p.x - dx * p.r * 0.6 + nx * 5, p.y - dy * p.r * 0.6 + ny * 5); c.lineTo(p.x - dx * p.r * 0.6 - nx * 5, p.y - dy * p.r * 0.6 - ny * 5); c.lineTo(p.x + dx * p.r * 0.6 - nx * 4, p.y + dy * p.r * 0.6 - ny * 4); c.closePath(); c.fill(); }
    else if (k % 2) { c.strokeStyle = 'rgba(80,80,100,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p.x + nx * p.r * 0.8, p.y + ny * p.r * 0.8); c.lineTo(p.x - nx * p.r * 0.8, p.y - ny * p.r * 0.8); c.stroke(); }
  });
}

/* ------------------------------------------------------------------ heads (local frame: forward is +x) */
V9_HEADS.stok = (c, sn, H, out, fill, t) => {
  const s = 1 + (sn.stand || 0) * 0.22;
  c.scale(s, s);
  for (const k of [-1, 1]) oval9(c, -H * 0.35, k * H * 0.72, H * 0.24, H * 0.2, out, '#8a6a40');
  c.beginPath(); c.moveTo(H * 1.3, 0); c.quadraticCurveTo(H * 0.9, -H * 0.85, -H * 0.6, -H * 0.7); c.quadraticCurveTo(-H * 1.05, 0, -H * 0.6, H * 0.7); c.quadraticCurveTo(H * 0.9, H * 0.85, H * 1.3, 0); c.closePath();
  c.lineWidth = 3.6; c.strokeStyle = out; c.stroke(); c.fillStyle = fill; c.fill();
  c.fillStyle = sn.K.hi; ell(c, -H * 0.1, -H * 0.35, H * 0.5, H * 0.18); c.fill();
  c.fillStyle = sn.K.mask; for (const k of [-1, 1]) { ell(c, H * 0.25, k * H * 0.38, H * 0.3, H * 0.22, k * 0.3); c.fill(); }
  c.fillStyle = '#1a120a'; ell(c, H * 1.22, 0, H * 0.13, H * 0.18); c.fill();
};
V9_HEADS.stroopw = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.1, H * 1.1, out, fill, 2.2);
  c.save(); c.beginPath(); c.arc(0, 0, H * 1.02, 0, TAU); c.clip();
  c.strokeStyle = sn.K.grid; c.lineWidth = 1.3;
  for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * H * 0.3 - H, -H * 1.1); c.lineTo(i * H * 0.3 + H, H * 1.1); c.stroke(); c.beginPath(); c.moveTo(i * H * 0.3 + H, -H * 1.1); c.lineTo(i * H * 0.3 - H, H * 1.1); c.stroke(); }
  c.restore();
  c.strokeStyle = sn.K.syrup; c.lineWidth = H * 0.18; c.beginPath(); c.arc(0, 0, H * 0.82, 0.4, 2.2); c.stroke();
  const o = sn.mouth || 0;
  c.fillStyle = '#3a1a06'; ell(c, H * 0.62, 0, H * 0.16, H * (0.32 + o * 0.2)); c.fill();
  c.fillStyle = sn.K.syrup; ell(c, H * 0.72, H * 0.35, H * 0.08, H * 0.18 + ((t * 0.8) % 1) * H * 0.2); c.fill();
};
V9_HEADS.bril = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.05, H * 0.95, out, fill);
  c.fillStyle = sn.K.hi; ell(c, -H * 0.3, -H * 0.35, H * 0.45, H * 0.2); c.fill();
  c.fillStyle = '#2a1018'; ell(c, H * 0.9, 0, H * 0.12, H * 0.3 + (sn.mouth || 0) * H * 0.15); c.fill();
  c.fillStyle = '#4a2a14'; c.beginPath(); c.moveTo(-H * 0.6, -H * 0.5); c.quadraticCurveTo(-H * 0.2, -H * 1.1, H * 0.2, -H * 0.55); c.quadraticCurveTo(-H * 0.2, -H * 0.7, -H * 0.6, -H * 0.5); c.fill();
};
V9_HEADS.handel = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.05, H * 0.95, out, fill);
  // the felt hat with a feather
  oval9(c, -H * 0.35, 0, H * 0.75, H * 0.95, out, '#3a1a4a', 1.4);
  c.fillStyle = sn.K.gold; c.fillRect(-H * 0.35, -H * 0.9, H * 0.18, H * 1.8);
  c.strokeStyle = '#e83a50'; c.lineWidth = H * 0.14; c.beginPath(); c.moveTo(-H * 0.6, -H * 0.6); c.quadraticCurveTo(-H * 1.3, -H * 1.1, -H * 1.5, -H * 0.4); c.stroke();
  // the curly mustache
  c.strokeStyle = '#2a1a10'; c.lineWidth = H * 0.12;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(H * 0.82, 0); c.quadraticCurveTo(H * 0.7, s * H * 0.5, H * 0.95, s * H * 0.62); c.stroke(); }
};
V9_HEADS.pantser = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.1, H * 0.95, out, fill);
  rrect(c, -H * 0.9, -H * 0.85, H * 1.3, H * 1.7, H * 0.45); c.fillStyle = sn.shell ? '#b8c0cc' : sn.K.plate; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#16181c'; c.fillRect(H * 0.35, -H * 0.55, H * 0.2, H * 1.1);
  c.fillStyle = '#ff6a3a'; c.fillRect(H * 0.37, -H * 0.4, H * 0.12, H * 0.2); c.fillRect(H * 0.37, H * 0.2, H * 0.12, H * 0.2);
};
V9_HEADS.driekop = (c, sn, H, out, fill, t) => {
  const head = (x, y, s, alive) => {
    if (!alive) { c.fillStyle = sn.K.blood; ell(c, x, y, H * 0.3 * s, H * 0.3 * s); c.fill(); return; }
    c.save(); c.translate(x, y); c.scale(s, s);
    headLong(c, sn, H * 0.62, out, fill, t);
    c.restore();
  };
  for (const h of sn.heads || []) head(-H * 0.55, h.s * H * 1.2, 0.85, h.alive);
  head(0, 0, 1.25, true);
};
V9_HEADS.sloper = (c, sn, H, out, fill, t) => {
  oval9(c, -H * 0.1, 0, H * 0.95, H * 0.95, out, fill);
  // the blade
  c.fillStyle = out; rrect(c, H * 0.55, -H * 1.15, H * 0.55, H * 2.3, H * 0.15); c.fill();
  c.fillStyle = '#c89a10'; rrect(c, H * 0.6, -H * 1.1, H * 0.42, H * 2.2, H * 0.12); c.fill();
  c.fillStyle = '#e8e2d0'; for (let i = 0; i < 5; i++) { const y = -H * 0.95 + i * H * 0.46; c.beginPath(); c.moveTo(H * 1.02, y); c.lineTo(H * 1.25, y + H * 0.12); c.lineTo(H * 1.02, y + H * 0.24); c.closePath(); c.fill(); }
  // the hard hat with a beacon
  oval9(c, -H * 0.3, 0, H * 0.55, H * 0.62, out, '#f2c230', 1.4);
  c.fillStyle = Math.sin(t * 10) > 0 ? '#ff7a2a' : '#7a3a10'; circle(c, -H * 0.3, 0, H * 0.18);
  if (sn.lift > 0) { c.strokeStyle = 'rgba(255,200,60,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, H * (1.4 + sn.lift * 0.5), 0, TAU); c.stroke(); }
};
V9_HEADS.kameleon = (c, sn, H, out, fill, t) => {
  if (sn.tongue > 0) {
    c.strokeStyle = '#e86a8a'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(H * 0.8, 0); c.lineTo(H * 0.8 + sn.tongue, 0); c.stroke();
    c.fillStyle = '#ff8aa8'; circle(c, H * 0.8 + sn.tongue, 0, 5);
  }
  oval9(c, 0, 0, H * 1.15, H * 0.85, out, fill);
  c.fillStyle = mixHex(sn.K.body, '#1a4a10', 0.4);
  c.beginPath(); c.moveTo(-H * 0.9, 0); c.quadraticCurveTo(-H * 0.4, -H * 0.2, H * 0.4, -H * 0.05); c.quadraticCurveTo(-H * 0.4, H * 0.2, -H * 0.9, 0); c.fill();
  c.strokeStyle = '#1a3a10'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(H * 0.6, -H * 0.3); c.quadraticCurveTo(H * 1.1, 0, H * 0.6, H * 0.3); c.stroke();
};
V9_HEADS.raver = (c, sn, H, out, fill, t) => {
  oval9(c, 0, 0, H * 1.05, H * 0.95, out, fill);
  c.fillStyle = '#16141c'; rrect(c, H * 0.1, -H * 0.85, H * 0.45, H * 1.7, H * 0.2); c.fill();
  c.fillStyle = 'rgba(255,58,216,0.55)'; c.fillRect(H * 0.16, -H * 0.75, H * 0.32, H * 0.6); c.fillStyle = 'rgba(58,216,255,0.55)'; c.fillRect(H * 0.16, H * 0.15, H * 0.32, H * 0.6);
  c.strokeStyle = sn.K.body; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-H * 0.4, 0); c.quadraticCurveTo(-H * 1.2, -H * 0.6, -H * 1.5, -H * 1.1); c.stroke();
};
function djHead9(c, sn, H, out, fill, t, devil) {
  const s = 1 + (sn.air9 || 0) * 0.3;
  c.scale(s, s);
  // a double chin and a big round head
  oval9(c, H * 0.35, 0, H * 0.8, H * 0.95, out, fill, 2.4);
  oval9(c, 0, 0, H * 1.08, H * 1.02, out, fill, 2.6);
  c.fillStyle = sn.K.hi; ell(c, -H * 0.35, -H * 0.4, H * 0.5, H * 0.22); c.fill();
  // stubble
  c.fillStyle = 'rgba(60,20,20,0.3)'; for (let i = 0; i < 14; i++) circle(c, H * (0.45 + (i % 4) * 0.12), (i - 7) * H * 0.09, 0.9);
  // headphones over the top
  c.strokeStyle = devil ? '#2a0004' : '#16141c'; c.lineWidth = H * 0.22;
  c.beginPath(); c.arc(-H * 0.05, 0, H * 1.0, Math.PI * 0.62, Math.PI * 1.38); c.stroke();
  for (const k of [-1, 1]) {
    oval9(c, -H * 0.05, k * H * 0.98, H * 0.36, H * 0.3, out, devil ? '#3a0408' : '#22202a', 1.6);
    c.fillStyle = devil ? '#ff6a1a' : '#ff3ad8'; ell(c, -H * 0.05, k * H * 1.0, H * 0.18, H * 0.1); c.fill();
  }
  if (devil) {
    for (const k of [-1, 1]) {
      c.beginPath(); c.moveTo(-H * 0.4, k * H * 0.5); c.quadraticCurveTo(-H * 1.3, k * H * 0.9, -H * 1.5, k * H * 0.35); c.quadraticCurveTo(-H * 1.0, k * H * 0.55, -H * 0.55, k * H * 0.25); c.closePath();
      c.fillStyle = '#1a0204'; c.fill(); c.strokeStyle = '#ff6a3a'; c.lineWidth = 1.4; c.stroke();
    }
  } else {
    // a cap, backwards
    oval9(c, -H * 0.45, 0, H * 0.55, H * 0.7, out, '#2a1a3a', 1.4);
    c.fillStyle = '#2a1a3a'; rrect(c, -H * 1.25, -H * 0.35, H * 0.5, H * 0.7, H * 0.15); c.fill();
  }
  const o = sn.mouth || 0;
  c.fillStyle = '#3a0810'; ell(c, H * 0.82, 0, H * (0.12 + o * 0.1), H * (0.32 + o * 0.12)); c.fill();
  if (devil) { c.fillStyle = '#f4ecdc'; for (let i = 0; i < 4; i++) { const y = -H * 0.28 + i * H * 0.19; c.beginPath(); c.moveTo(H * 0.82, y); c.lineTo(H * 0.94, y + H * 0.06); c.lineTo(H * 0.82, y + H * 0.12); c.closePath(); c.fill(); } }
}
V9_HEADS.manu = (c, sn, H, out, fill, t) => djHead9(c, sn, H, out, fill, t, false);
V9_HEADS.manudevil = (c, sn, H, out, fill, t) => djHead9(c, sn, H, out, fill, t, true);
V9_HEADS.rechter = (c, sn, H, out, fill, t) => {
  const K = sn.K;
  oval9(c, 0, 0, H * 1.0, H * 0.92, out, K.skin, 2.2);
  c.fillStyle = '#d8d4cc'; for (const k of [-1, 1]) { ell(c, -H * 0.45, k * H * 0.72, H * 0.35, H * 0.25); c.fill(); }
  c.fillStyle = '#c0bab0'; ell(c, -H * 0.55, 0, H * 0.35, H * 0.6); c.fill();
  c.strokeStyle = '#2a2a30'; c.lineWidth = 1.6; for (const k of [-1, 1]) { c.beginPath(); c.arc(H * 0.42, k * H * 0.32, H * 0.2, 0, TAU); c.stroke(); }
  c.fillStyle = '#3a1a1a'; c.fillRect(H * 0.75, -H * 0.22, H * 0.1, H * 0.44);
  // the gavel
  const up = sn.mode === 'verdict' ? Math.min(1, sn.mt / 0.4) : sn.slam ? Math.min(1, sn.slam.t / sn.slam.warn) : 0;
  c.save(); c.translate(H * 0.3, H * 1.25); c.rotate(-0.4 - up * 1.1);
  c.fillStyle = '#5a3a20'; c.fillRect(-1.6, -H * 1.1, 3.2, H * 1.1);
  rrect(c, -H * 0.35, -H * 1.35, H * 0.7, H * 0.32, H * 0.08); c.fillStyle = '#7a5434'; c.fill(); c.strokeStyle = out; c.lineWidth = 1.2; c.stroke();
  c.restore();
};
V9_HEADS.bus = () => {};
V9_HEADS.tellie = () => {};

/* ------------------------------------------------------------------ the bus and the phone have their own bodies */
V9_BODY.bus = (c, sn, t) => {
  const K = sn.K, pts = sn.pts, flash = sn.flash > 0;
  const seg = (x, y, a, len, front, k) => {
    c.save(); c.translate(x, y); c.rotate(a);
    const w = sn.headR;
    rrect(c, -len / 2 - 1.5, -w - 1.5, len + 3, w * 2 + 3, 5); c.fillStyle = K.outline; c.fill();
    rrect(c, -len / 2, -w, len, w * 2, 4); c.fillStyle = flash ? '#ffffff' : K.body; c.fill();
    c.fillStyle = K.stripe; c.fillRect(-len / 2, -w * 0.18, len, w * 0.36);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) c.fillRect(-len / 2 + 2 + i * (len / 3), s > 0 ? w * 0.95 : -w * 1.15, len / 3 - 4, w * 0.2);
    if (!front) {
      c.fillStyle = K.window;
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) c.fillRect(-len / 2 + 3 + i * (len / 2), s * w * 0.62 - w * 0.17, len / 2 - 6, w * 0.34);
      if (sn.doors > 0 && k % 2 === 1) { c.fillStyle = '#ffd84a'; for (const s of [-1, 1]) c.fillRect(-4 - sn.doors * 6, s * w - 1.5 * s, 8 + sn.doors * 12, 3 * s); }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(-len / 2 + 2, -w + 2, len - 4, 3);
    } else {
      c.fillStyle = K.window; rrect(c, len / 2 - 10, -w * 0.82, 8, w * 1.64, 3); c.fill();
      c.fillStyle = 'rgba(160,210,255,0.3)'; c.fillRect(len / 2 - 9, -w * 0.7, 3, w * 0.7);
      rrect(c, -len / 2 + 4, -w * 0.5, 16, w, 2); c.fillStyle = '#16181c'; c.fill();
      c.save(); c.rotate(Math.PI / 2); c.fillStyle = '#ffb43a'; c.font = `700 10px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(sn.num || 34), 0, len / 2 - 12 - 0); c.restore();
      c.fillStyle = K.eye; for (const s of [-1, 1]) { rrect(c, len / 2 - 3, s * w * 0.72 - 3, 4, 6, 1.5); c.fill(); }
    }
    c.restore();
  };
  for (let k = pts.length - 1; k >= 0; k--) {
    const p = pts[k]; if (p.hid) continue;
    const [dx, dy] = bodyDir(sn, k);
    seg(p.x, p.y, Math.atan2(dy, dx), sn.spacing + 6, false, k);
  }
  if (!sn.burrowed) seg(sn.x, sn.y, sn.drawAng, sn.spacing + 8, true, -1);
};
V9_BODY.tellie = (c, sn, t) => {
  const K = sn.K, pts = sn.pts;
  // the charging cable
  c.lineCap = 'round'; c.lineJoin = 'round';
  const path = () => { c.beginPath(); let started = false; if (!sn.burrowed) { c.moveTo(sn.x, sn.y); started = true; } for (const p of pts) { if (p.hid) { started = false; continue; } if (!started) { c.moveTo(p.x, p.y); started = true; } else c.lineTo(p.x, p.y); } };
  path(); c.strokeStyle = K.outline; c.lineWidth = 9; c.stroke();
  path(); c.strokeStyle = sn.flash > 0 ? '#ffffff' : K.body; c.lineWidth = 6; c.stroke();
  path(); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.5; c.stroke();
  const tl = pts[pts.length - 1];
  if (tl && !tl.hid) {
    const [dx, dy] = bodyDir(sn, pts.length - 1);
    c.save(); c.translate(tl.x, tl.y); c.rotate(Math.atan2(dy, dx) + Math.PI);
    rrect(c, -2, -6, 16, 12, 3); c.fillStyle = K.outline; c.fill(); rrect(c, -1, -5, 14, 10, 2.5); c.fillStyle = '#e2e2e6'; c.fill();
    c.fillStyle = '#9a9aa2'; c.fillRect(12, -3, 7, 6);
    c.restore();
  }
  if (sn.burrowed) return;
  // the phone
  const H = sn.headR, flash = sn.flash > 0;
  c.save(); c.translate(sn.x, sn.y); c.rotate(sn.drawAng + Math.PI / 2);
  rrect(c, -H * 0.62 - 2, -H * 1.05 - 2, H * 1.24 + 4, H * 2.1 + 4, H * 0.24); c.fillStyle = K.outline; c.fill();
  rrect(c, -H * 0.62, -H * 1.05, H * 1.24, H * 2.1, H * 0.22); c.fillStyle = flash ? '#ffffff' : '#2a2a30'; c.fill();
  const bat = tellieBattery9(sn), dead = bat <= 0 || sn.dying > 0.9;
  rrect(c, -H * 0.52, -H * 0.9, H * 1.04, H * 1.8, H * 0.12); c.fillStyle = dead ? '#050506' : sn.mode === 'plugged' ? '#0c2a1a' : '#0c1a3a'; c.fill();
  if (!dead) {
    c.strokeStyle = bat <= 2 ? '#ff4a3a' : '#e8e8ee'; c.lineWidth = 1.6; c.strokeRect(-H * 0.3, -H * 0.66, H * 0.5, H * 0.26); c.fillRect(H * 0.2, -H * 0.58, H * 0.06, H * 0.1);
    c.fillStyle = bat <= 2 ? '#ff4a3a' : '#7cffb0'; c.fillRect(-H * 0.27, -H * 0.63, H * 0.44 * (bat / 8), H * 0.2);
    c.fillStyle = '#ffffff'; c.font = `700 ${Math.round(H * 0.5)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(`${bat}%`, 0, H * 0.62);
  }
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(H * 0.2, -H * 0.9); c.lineTo(H * 0.05, -H * 0.55); c.lineTo(H * 0.3, -H * 0.3); c.stroke();
  c.fillStyle = '#16161a'; rrect(c, -H * 0.16, -H * 1.0, H * 0.32, H * 0.08, H * 0.04); c.fill();
  c.restore();
};

/* ------------------------------------------------------------------ eyes in the dark */
V9_GLOW.stok = (c, sn, t, P, loc, lookAt, open) => {
  const s = 1 + (sn.stand || 0) * 0.22, H = sn.headR;
  const pts = [-1, 1].map((k) => loc(H * 0.3 * s, k * H * 0.38 * s));
  for (const [x, y] of pts) glowDot(c, x, y, H * 0.9, sn.K.eye, 0.35 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of pts) eyeball(c, x, y, H * 0.2 * s, open, lookAt(x, y), '#3a2410', false);
  if (sn.mode === 'look') { c.fillStyle = '#ffb84a'; c.font = `800 14px ${UIF}`; c.textAlign = 'center'; c.fillText('?', sn.x, sn.y - H * 2); }
};
V9_GLOW.stroopw = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, pts = [-1, 1].map((k) => loc(H * 0.25, k * H * 0.38));
  for (const [x, y] of pts) glowDot(c, x, y, H, sn.K.eye, 0.3 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of pts) eyeball(c, x, y, H * 0.24, open, lookAt(x, y), '#6a3a10', false);
};
V9_GLOW.bril = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, pts = [-1, 1].map((k) => loc(H * 0.3, k * H * 0.42));
  const glass = sn.glassHp > 0;
  for (const [x, y] of pts) glowDot(c, x, y, H, sn.K.eye, 0.3 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of pts) eyeball(c, x, y, H * (glass ? 0.3 : 0.18), glass ? open : open * 0.4, lookAt(x, y), '#3a6ab0', false);
  const [mx, my] = loc(H * 0.3, 0);
  c.strokeStyle = '#1a1a20'; c.lineWidth = 2;
  if (glass) {
    for (const [x, y] of pts) { c.beginPath(); c.arc(x, y, H * 0.36, 0, TAU); c.stroke(); c.fillStyle = 'rgba(200,235,255,0.18)'; circle(c, x, y, H * 0.34); }
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(mx, my); c.lineTo(pts[1][0], pts[1][1]); c.stroke();
    if (sn.glassHp < 3) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(pts[0][0] - 3, pts[0][1] - 3); c.lineTo(pts[0][0] + 2, pts[0][1] + 1); c.lineTo(pts[0][0] - 1, pts[0][1] + 4); c.stroke(); }
  } else { c.beginPath(); c.moveTo(pts[0][0], pts[0][1] + 3); c.lineTo(pts[1][0], pts[1][1] - 3); c.stroke(); }
  if (sn.mode === 'aim') {
    const a = sn.aimA, u = clamp(sn.mt / 0.75, 0, 1);
    c.strokeStyle = `rgba(122,208,255,${0.15 + 0.4 * u})`; c.lineWidth = 1.2; c.setLineDash([3, 5]);
    c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(sn.x + Math.cos(a) * 260, sn.y + Math.sin(a) * 260); c.stroke(); c.setLineDash([]);
  }
};
V9_GLOW.handel = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, pts = [-1, 1].map((k) => loc(H * 0.45, k * H * 0.36));
  for (const [x, y] of pts) glowDot(c, x, y, H * 0.9, sn.K.eye, 0.3 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of pts) eyeball(c, x, y, H * 0.2, open, lookAt(x, y), '#6a3a8a', false);
  const [mx, my] = pts[1];
  c.strokeStyle = sn.K.gold; c.lineWidth = 1.6; c.beginPath(); c.arc(mx, my, H * 0.28, 0, TAU); c.stroke();
  if (sn.stole) { c.fillStyle = '#ffd84a'; c.font = `700 9px ${UIF}`; c.textAlign = 'center'; c.fillText(`+${sn.stole}`, sn.x, sn.y - H * 1.8); }
};
V9_GLOW.pantser = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.43, k * H * 0.3); glowDot(c, x, y, H * 0.8, sn.K.eye, 0.4 * open); }
};
V9_GLOW.driekop = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  const eyes = [loc(H * 0.3 * 1.25, -H * 0.48 * 0.77), loc(H * 0.3 * 1.25, H * 0.48 * 0.77)];
  for (const h of sn.heads || []) if (h.alive) { eyes.push(loc(-H * 0.55 + H * 0.3 * 0.53, h.s * H * 1.2 - H * 0.3 * 0.53)); eyes.push(loc(-H * 0.55 + H * 0.3 * 0.53, h.s * H * 1.2 + H * 0.3 * 0.53)); }
  for (const [x, y] of eyes) glowDot(c, x, y, H * 0.6, sn.K.eye, 0.4 * open);
  c.globalCompositeOperation = 'source-over';
  for (const [x, y] of eyes) { c.fillStyle = sn.K.eye; ell(c, x, y, H * 0.1, H * 0.08 * open, sn.drawAng); c.fill(); }
};
V9_GLOW.sloper = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  const [bx, by] = loc(-H * 0.3, 0);
  if (Math.sin(t * 10) > 0) glowDot(c, bx, by, H * 2.2, '#ff7a2a', 0.35);
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.2, k * H * 0.55); glowDot(c, x, y, H * 0.7, sn.K.eye, 0.4 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.2, k * H * 0.55); c.fillStyle = sn.K.eye; circle(c, x, y, H * 0.11 * open + 0.5); }
};
V9_GLOW.kameleon = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, vis = Math.max(0.35, sn.cloak == null ? 1 : sn.cloak);
  const pts = [-1, 1].map((k) => loc(H * 0.2, k * H * 0.62));
  for (const [x, y] of pts) glowDot(c, x, y, H * 0.8, sn.K.eye, 0.35 * vis);
  c.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha = vis;
  for (const [x, y] of pts) { c.fillStyle = mixHex(sn.K.body, '#000000', 0.3); circle(c, x, y, H * 0.3); eyeball(c, x, y, H * 0.2, open, lookAt(x, y) + Math.sin(t * 3 + x) * 0.6, '#c8a020', false); }
  c.restore();
};
V9_GLOW.raver = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR, [x, y] = loc(H * 0.3, 0);
  glowDot(c, x, y, H * 2, sn.K.body, 0.35 + beatPulse9() * 0.2);
  const [ax, ay] = loc(-H * 1.5, -H * 1.1);
  glowDot(c, ax, ay, 8, sn.K.body, 0.6);
};
function djGlow9(c, sn, t, P, loc, lookAt, open, devil) {
  const H = sn.headR * (1 + (sn.air9 || 0) * 0.3);
  const pts = [-1, 1].map((k) => loc(H * 0.42, k * H * 0.36));
  if (devil) {
    for (const [x, y] of pts) glowDot(c, x, y, H * 1.4, '#ffd23a', 0.6 * open);
    c.globalCompositeOperation = 'source-over';
    for (const [x, y] of pts) { c.fillStyle = '#ffe86a'; ell(c, x, y, H * 0.16, H * 0.1 * open, sn.drawAng); c.fill(); c.fillStyle = '#2a0004'; ell(c, x, y, H * 0.04, H * 0.09 * open, sn.drawAng); c.fill(); }
  } else {
    for (const [x, y] of pts) glowDot(c, x, y, H * 0.9, '#ff3ad8', 0.3 + beatPulse9() * 0.25);
    c.globalCompositeOperation = 'source-over';
    const [cx, cy] = loc(H * 0.42, 0);
    c.save(); c.translate(cx, cy); c.rotate(sn.drawAng);
    rrect(c, -H * 0.16, -H * 0.62, H * 0.32, H * 1.24, H * 0.12); c.fillStyle = '#0c0c10'; c.fill();
    c.fillStyle = `rgba(255,58,216,${0.5 + beatPulse9() * 0.4})`; c.fillRect(-H * 0.1, -H * 0.55, H * 0.2, H * 0.42); c.fillRect(-H * 0.1, H * 0.13, H * 0.2, H * 0.42);
    c.restore();
  }
}
V9_GLOW.manu = (c, sn, t, P, loc, lookAt, open) => djGlow9(c, sn, t, P, loc, lookAt, open, false);
V9_GLOW.manudevil = (c, sn, t, P, loc, lookAt, open) => djGlow9(c, sn, t, P, loc, lookAt, open, true);
V9_GLOW.bus = (c, sn, t) => {
  if (sn.burrowed) return;
  const H = sn.headR, a = sn.drawAng, len = sn.spacing + 8;
  for (const s of [-1, 1]) {
    const x = sn.x + Math.cos(a) * len / 2 - Math.sin(a) * s * H * 0.72, y = sn.y + Math.sin(a) * len / 2 + Math.cos(a) * s * H * 0.72;
    glowDot(c, x, y, 16, '#fff2c4', 0.55);
    const g = c.createRadialGradient(x, y, 2, x, y, 120);
    g.addColorStop(0, 'rgba(255,240,200,0.2)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.arc(x, y, 120, a - 0.3, a + 0.3); c.closePath(); c.fill();
  }
};
V9_GLOW.tellie = (c, sn, t) => {
  if (sn.burrowed) return;
  const bat = tellieBattery9(sn);
  if (bat > 0) glowDot(c, sn.x, sn.y, sn.headR * 2.2, sn.mode === 'plugged' ? '#7cffb0' : '#5a8aff', 0.3 + (sn.mode === 'buzz' ? 0.2 : 0));
};
V9_GLOW.rechter = (c, sn, t, P, loc, lookAt, open) => {
  const H = sn.headR;
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.42, k * H * 0.32); glowDot(c, x, y, H * 0.6, sn.K.eye, 0.35 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const k of [-1, 1]) { const [x, y] = loc(H * 0.42, k * H * 0.32); eyeball(c, x, y, H * 0.13, open, lookAt(x, y), '#2a2a30', false); }
};

/* ------------------------------------------------------------------ Peanapple: half apple, half guinea pig, all nerves */
function drawPean(c, R, st) {
  const fear = st.fear || 0, t = st.t || 0;
  const shiver = fear > 0.45 ? Math.sin(t * 55) * R * 0.02 * fear : 0;
  const hop = st.pop > 0 ? Math.abs(Math.sin((st.pop / 0.9) * Math.PI * 3)) * R * 0.45 : 0;
  c.translate(shiver, -hop);
  // the ears, round and pink inside
  for (const s of [-1, 1]) {
    c.save(); c.translate(s * R * 0.68, -R * 0.55); c.rotate(s * 0.5);
    ell(c, 0, 0, R * 0.3, R * 0.24); c.fillStyle = '#a8743e'; c.fill(); c.strokeStyle = '#3a220e'; c.lineWidth = Math.max(0.8, R * 0.07); c.stroke();
    ell(c, 0, R * 0.03, R * 0.17, R * 0.12); c.fillStyle = '#e8a0a0'; c.fill();
    c.restore();
  }
  const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#f2cf98'); g.addColorStop(0.45, '#d4a066'); g.addColorStop(1, '#8a5a2e');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  // a cream patch and a bit of fur
  ell(c, 0, R * 0.42, R * 0.52, R * 0.48); c.fillStyle = 'rgba(250,236,210,0.85)'; c.fill();
  c.strokeStyle = 'rgba(120,70,30,0.45)'; c.lineWidth = R * 0.05;
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
  c.strokeStyle = '#8a5a2e'; c.lineWidth = R * 0.06;
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

/* ------------------------------------------------------------------ icons for the new powerups */
function drawItemIcon9(c, id, R, t) {
  c.lineJoin = 'round'; c.lineCap = 'round';
  const O = '#1a1210';
  if (id === 'bass' || id === 'speaker') {
    rrect(c, -R * 0.55, -R * 0.75, R * 1.1, R * 1.5, R * 0.14); c.fillStyle = '#2a2a32'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.08; c.stroke();
    const p = 1 + Math.max(0, Math.sin(t * 8)) * 0.08;
    c.fillStyle = '#0c0c10'; circle(c, 0, R * 0.18, R * 0.36 * p); c.fillStyle = id === 'bass' ? '#c48af0' : '#ff3ad8'; circle(c, 0, R * 0.18, R * 0.13); c.fillStyle = '#0c0c10'; circle(c, 0, -R * 0.45, R * 0.14);
    if (id === 'bass') { c.strokeStyle = '#c48af0'; c.lineWidth = R * 0.07; for (const r of [0.75, 0.95]) { c.beginPath(); c.arc(0, R * 0.18, R * r, -0.6, 0.6); c.stroke(); } }
  } else if (id === 'rave') {
    seedIcon(c, 0, 0, R * 0.7, 0.4, '#ff3ad8', '#ffd0f4');
    c.fillStyle = '#3ad8ff'; for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; sparkle(c, Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75, R * 0.12, ['#3ad8ff', '#d8ff3a', '#ffb43a', '#ff3ad8'][i]); }
  } else if (id === 'vinyl' || id === 'remix') {
    c.save(); c.rotate(t * 2);
    c.fillStyle = '#16141a'; circle(c, 0, 0, R * 0.85); c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; for (const r of [0.4, 0.55, 0.7]) { c.beginPath(); c.arc(0, 0, R * r, 0, TAU); c.stroke(); }
    if (id === 'remix') { for (let i = 0; i < 6; i++) { c.fillStyle = ['#ff3ad8', '#3ad8ff', '#d8ff3a', '#ffb43a', '#ff6a3a', '#b05aff'][i]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * 0.3, (i / 6) * TAU, ((i + 1) / 6) * TAU); c.fill(); } }
    else { c.fillStyle = '#e83a50'; circle(c, 0, 0, R * 0.28); }
    c.fillStyle = '#16141a'; circle(c, 0, 0, R * 0.06);
    c.restore();
  } else if (id === 'kaas') {
    c.fillStyle = '#d89a4a'; c.beginPath(); c.ellipse(0, -R * 0.15, R * 0.75, R * 0.45, 0, Math.PI, TAU); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(-R * 0.78, -R * 0.12); c.lineTo(R * 0.78, -R * 0.12); c.lineTo(R * 0.5, R * 0.12); c.lineTo(R * 0.2, -R * 0.02); c.lineTo(-R * 0.3, R * 0.12); c.closePath(); c.fill();
    rrect(c, -R * 0.74, R * 0.02, R * 1.48, R * 0.3, R * 0.12); c.fillStyle = '#5a2a14'; c.fill();
    rrect(c, -R * 0.72, R * 0.32, R * 1.44, R * 0.3, R * 0.14); c.fillStyle = '#d89a4a'; c.fill(); c.strokeStyle = O; c.stroke();
    c.fillStyle = '#f4ecdc'; for (const [x, y] of [[-0.3, -0.42], [0.1, -0.5], [0.4, -0.35]]) ell(c, x * R, y * R, R * 0.05, R * 0.03), c.fill();
  } else if (id === 'bank') {
    rrect(c, -R * 0.4, -R * 0.8, R * 0.8, R * 1.6, R * 0.16); c.fillStyle = '#2a3a4a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.08; c.stroke();
    c.fillStyle = '#7cd0ff'; c.beginPath(); c.moveTo(R * 0.08, -R * 0.55); c.lineTo(-R * 0.2, R * 0.05); c.lineTo(R * 0.02, R * 0.05); c.lineTo(-R * 0.08, R * 0.55); c.lineTo(R * 0.22, -R * 0.08); c.lineTo(0, -R * 0.08); c.closePath(); c.fill();
  } else if (id === 'ov') {
    c.save(); c.rotate(-0.2); rrect(c, -R * 0.85, -R * 0.55, R * 1.7, R * 1.1, R * 0.14); c.fillStyle = '#e8e2d0'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#1a6ab0'; c.fillRect(-R * 0.85, -R * 0.2, R * 1.7, R * 0.25);
    rrect(c, -R * 0.65, -R * 0.45, R * 0.35, R * 0.22, R * 0.04); c.fillStyle = '#d8b030'; c.fill();
    c.fillStyle = '#16181c'; c.font = `800 ${Math.round(R * 0.45)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OV', R * 0.4, R * 0.3); c.restore();
  } else if (id === 'schaar') {
    c.strokeStyle = '#c8ccd4'; c.lineWidth = R * 0.14;
    const o = 0.25 + Math.abs(Math.sin(t * 4)) * 0.2;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(-Math.PI / 2 + s * o) * R * 0.95, Math.sin(-Math.PI / 2 + s * o) * R * 0.95); c.stroke(); }
    c.strokeStyle = '#e83a50'; c.lineWidth = R * 0.12; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.3, R * 0.45, R * 0.2, 0, TAU); c.stroke(); }
    c.fillStyle = '#5a5e66'; circle(c, 0, 0, R * 0.08);
  } else if (id === 'stok') {
    ell(c, 0, R * 0.5, R * 0.4, R * 0.5); c.fillStyle = '#c9a26b'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    ell(c, 0, -R * 0.2, R * 0.4, R * 0.45); c.fill(); c.stroke();
    c.fillStyle = '#2a1c0c'; for (const s of [-1, 1]) { ell(c, s * R * 0.16, -R * 0.25, R * 0.12, R * 0.1); c.fill(); }
    c.fillStyle = '#ffb84a'; for (const s of [-1, 1]) circle(c, s * R * 0.16, -R * 0.25, R * 0.05);
    c.fillStyle = '#1a120a'; circle(c, 0, -R * 0.02, R * 0.06);
  } else if (id === 'wheek') {
    c.save(); drawPean(c, R * 0.62, { t, fear: 0.9, blink: 1, lookX: 0, lookY: 0.1, mouthOpen: true, bites: [] }); c.restore();
    c.strokeStyle = '#ffd0dc'; c.lineWidth = R * 0.07; for (const s of [-1, 1]) for (const r of [0.85, 1.0]) { c.beginPath(); c.arc(0, 0, R * r, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); c.stroke(); }
  } else if (id === 'perfect') {
    miniApple(c, 0, R * 0.1, R * 0.7, '#e83a50');
    sparkle(c, R * 0.55, -R * 0.55, R * 0.22 + Math.sin(t * 5) * R * 0.04, '#fff0b0');
    c.fillStyle = '#ffd84a'; c.font = `800 ${Math.round(R * 0.38)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('100', 0, R * 0.2);
  } else if (id === 'sticky') {
    seedIcon(c, 0, -R * 0.1, R * 0.7, 0.3);
    c.fillStyle = '#d8902a'; ell(c, R * 0.1, -R * 0.35, R * 0.45, R * 0.2); c.fill();
    const d = (t * 0.7) % 1; ell(c, R * 0.28, -R * 0.1 + d * R * 0.6, R * 0.08, R * 0.12); c.fill();
  } else if (id === 'nitro') {
    rrect(c, -R * 0.3, -R * 0.5, R * 0.6, R * 1.25, R * 0.2); c.fillStyle = '#3a6ab0'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#c8ccd4'; c.fillRect(-R * 0.12, -R * 0.8, R * 0.24, R * 0.3);
    c.fillStyle = '#ffffff'; c.font = `800 ${Math.round(R * 0.3)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N2O', 0, R * 0.1);
    flameShape(c, 0, R * 0.95, R * 0.25, R * (0.35 + Math.sin(t * 20) * 0.05)); c.fillStyle = '#7cd0ff'; c.fill();
  } else if (id === 'horn') {
    rrect(c, -R * 0.6, -R * 0.15, R * 0.5, R * 0.75, R * 0.1); c.fillStyle = '#c3243a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#e8e2d0'; c.beginPath(); c.moveTo(-R * 0.1, -R * 0.05); c.lineTo(R * 0.75, -R * 0.55); c.lineTo(R * 0.75, R * 0.45); c.lineTo(-R * 0.1, R * 0.35); c.closePath(); c.fill(); c.stroke();
  } else if (id === 'bril' || id === 'zonnebril') {
    c.strokeStyle = id === 'bril' ? '#3a2a1a' : '#16141a'; c.lineWidth = R * 0.12;
    for (const s of [-1, 1]) {
      if (id === 'bril') { c.beginPath(); c.arc(s * R * 0.42, 0, R * 0.32, 0, TAU); c.stroke(); c.fillStyle = 'rgba(200,235,255,0.35)'; circle(c, s * R * 0.42, 0, R * 0.28); }
      else { rrect(c, s * R * 0.42 - R * 0.34, -R * 0.24, R * 0.68, R * 0.46, R * 0.16); c.fillStyle = '#16141a'; c.fill(); c.fillStyle = 'rgba(255,58,216,0.4)'; c.fillRect(s * R * 0.42 - R * 0.24, -R * 0.15, R * 0.2, R * 0.1); }
    }
    c.beginPath(); c.moveTo(-R * 0.12, -R * 0.04); c.quadraticCurveTo(0, -R * 0.14, R * 0.12, -R * 0.04); c.stroke();
  } else if (id === 'bezwaar') {
    c.save(); c.rotate(-0.15); rrect(c, -R * 0.5, -R * 0.75, R * 1.0, R * 1.4, R * 0.08); c.fillStyle = '#f2f0ea'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#c3243a'; c.font = `800 ${Math.round(R * 1.0)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 0, R * 0.02); c.restore();
  } else if (id === 'mandje') {
    c.strokeStyle = '#1a6ab0'; c.lineWidth = R * 0.1; c.beginPath(); c.arc(0, -R * 0.05, R * 0.55, Math.PI, TAU); c.stroke();
    c.fillStyle = '#1a6ab0'; c.beginPath(); c.moveTo(-R * 0.8, -R * 0.05); c.lineTo(R * 0.8, -R * 0.05); c.lineTo(R * 0.6, R * 0.7); c.lineTo(-R * 0.6, R * 0.7); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = R * 0.05; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-R * 0.45 + i * R * 0.3, R * 0.05); c.lineTo(-R * 0.4 + i * R * 0.28, R * 0.6); c.stroke(); }
    miniApple(c, -R * 0.2, -R * 0.2, R * 0.3, '#e83a50');
  } else if (id === 'haring') {
    c.save(); c.rotate(-0.9);
    c.fillStyle = '#b8c4d0'; c.beginPath(); c.ellipse(0, 0, R * 0.9, R * 0.28, 0, 0, TAU); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = '#6a7a8a'; c.beginPath(); c.moveTo(R * 0.8, 0); c.lineTo(R * 1.1, -R * 0.25); c.lineTo(R * 1.1, R * 0.25); c.closePath(); c.fill();
    c.fillStyle = '#e8e2d0'; c.fillRect(-R * 0.6, -R * 0.06, R * 1.1, R * 0.12); c.restore();
  } else if (id === 'bitterbal') {
    const g = c.createRadialGradient(-R * 0.2, -R * 0.2, R * 0.05, 0, 0, R * 0.7); g.addColorStop(0, '#d89050'); g.addColorStop(1, '#6a3a14');
    c.fillStyle = g; circle(c, 0, 0, R * 0.62); c.strokeStyle = O; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.stroke();
    c.fillStyle = '#e8c030'; ell(c, R * 0.55, R * 0.45, R * 0.22, R * 0.14); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i * 0.33) % 1; circle(c, -R * 0.2 + i * R * 0.2, -R * 0.7 - ph * R * 0.3, R * 0.05 * (1 - ph)); }
  } else if (id === 'pinda') {
    rrect(c, -R * 0.55, -R * 0.45, R * 1.1, R * 1.1, R * 0.2); c.fillStyle = '#c8913a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    rrect(c, -R * 0.6, -R * 0.75, R * 1.2, R * 0.32, R * 0.08); c.fillStyle = '#c3243a'; c.fill(); c.stroke();
    c.fillStyle = '#f2e6d0'; rrect(c, -R * 0.4, -R * 0.15, R * 0.8, R * 0.5, R * 0.06); c.fill();
    c.fillStyle = '#8a5a2a'; ell(c, 0, R * 0.1, R * 0.22, R * 0.12); c.fill();
  } else if (id === 'oliebol') {
    c.fillStyle = '#5a3414'; circle(c, 0, R * 0.05, R * 0.66);
    c.fillStyle = '#3a2008'; for (const [x, y] of [[-0.3, 0.2], [0.25, 0.3], [0.1, -0.1]]) circle(c, x * R, y * R, R * 0.08);
    c.fillStyle = 'rgba(250,246,236,0.95)'; c.beginPath(); c.ellipse(0, -R * 0.25, R * 0.55, R * 0.3, 0, Math.PI, TAU); c.fill();
    for (let i = 0; i < 6; i++) circle(c, Math.cos(i * 1.7) * R * 0.5, -R * 0.1 + Math.sin(i * 2.3) * R * 0.3, R * 0.05);
  } else if (id === 'verzoek') {
    rrect(c, -R * 0.42, -R * 0.82, R * 0.84, R * 1.64, R * 0.14); c.fillStyle = '#16181c'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    rrect(c, -R * 0.34, -R * 0.68, R * 0.68, R * 1.3, R * 0.06); c.fillStyle = '#3aa84a'; c.fill();
    c.fillStyle = '#ffffff'; c.font = `800 ${Math.round(R * 0.7)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('€', 0, -R * 0.02);
  } else if (id === 'fiets') {
    c.fillStyle = '#c8ccd4'; c.beginPath(); c.arc(0, R * 0.1, R * 0.62, Math.PI, TAU); c.lineTo(R * 0.7, R * 0.25); c.lineTo(-R * 0.7, R * 0.25); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#8a8e96'; circle(c, 0, -R * 0.6, R * 0.12); c.fillRect(-R * 0.08, R * 0.25, R * 0.16, R * 0.4);
    c.strokeStyle = '#ffd27a'; c.lineWidth = R * 0.06; const w = Math.sin(t * 12) * 0.1; for (const s of [-1, 1]) { c.beginPath(); c.arc(0, 0, R * 0.95, s > 0 ? -0.9 + w : Math.PI + 0.9 - w, s > 0 ? -0.4 + w : Math.PI + 0.4 - w, s < 0); c.stroke(); }
  } else if (id === 'koffie') {
    rrect(c, -R * 0.45, -R * 0.2, R * 0.9, R * 0.85, R * 0.12); c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#3aa84a'; c.fillRect(-R * 0.45, R * 0.15, R * 0.9, R * 0.18);
    c.fillStyle = '#5a3414'; ell(c, 0, -R * 0.2, R * 0.42, R * 0.1); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = R * 0.06; for (let i = 0; i < 2; i++) { const ph = (t * 0.8 + i * 0.5) % 1; c.beginPath(); c.moveTo(-R * 0.1 + i * R * 0.2, -R * 0.35 - ph * R * 0.4); c.quadraticCurveTo(R * 0.05 + i * R * 0.2, -R * 0.55 - ph * R * 0.4, -R * 0.1 + i * R * 0.2, -R * 0.7 - ph * R * 0.4); c.stroke(); }
  } else if (id === 'disco') {
    c.strokeStyle = '#8a8e96'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(0, -R); c.lineTo(0, -R * 0.62); c.stroke();
    c.save(); c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.clip();
    for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) { const v = Math.sin(i * 1.7 + j * 2.3 + t * 4); c.fillStyle = v > 0.6 ? '#ffffff' : v > 0 ? '#c8ccd4' : '#7a7e86'; c.fillRect(i * R * 0.14, j * R * 0.14, R * 0.12, R * 0.12); }
    c.restore();
    c.strokeStyle = O; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.stroke();
  } else if (id === 'drop') {
    for (let i = 0; i < 7; i++) { const h = R * (0.2 + Math.abs(Math.sin(t * 6 + i * 0.9)) * 0.7); c.fillStyle = ['#ff3ad8', '#3ad8ff', '#d8ff3a'][i % 3]; c.fillRect(-R * 0.85 + i * R * 0.25, R * 0.6 - h, R * 0.18, h); }
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-R * 0.25, -R * 0.85); c.lineTo(R * 0.25, -R * 0.85); c.lineTo(R * 0.25, -R * 0.4); c.lineTo(R * 0.45, -R * 0.4); c.lineTo(0, 0); c.lineTo(-R * 0.45, -R * 0.4); c.lineTo(-R * 0.25, -R * 0.4); c.closePath(); c.fill();
  } else if (id === 'wheel') {
    c.save(); c.rotate(t * 1.5);
    c.strokeStyle = '#c8a050'; c.lineWidth = R * 0.12; c.beginPath(); c.arc(0, 0, R * 0.75, 0, TAU); c.stroke();
    c.lineWidth = R * 0.05; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75); c.lineTo(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6); c.stroke(); }
    c.restore();
    c.fillStyle = '#5a3a20'; c.fillRect(-R * 0.06, 0, R * 0.12, R * 0.95);
    c.save(); drawPean(c, R * 0.3, { t, fear: 0.2, blink: 1, lookX: 0.5, lookY: 0, bites: [] }); c.restore();
  } else if (id === 'curator') {
    miniApple(c, 0, -R * 0.15, R * 0.42, '#e83a50');
    c.fillStyle = '#e2b28c'; c.strokeStyle = O; c.lineWidth = R * 0.06;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.85, R * 0.75); c.quadraticCurveTo(s * R * 0.9, R * 0.1, s * R * 0.35, R * 0.15); c.quadraticCurveTo(s * R * 0.2, R * 0.45, s * R * 0.25, R * 0.75); c.closePath(); c.fill(); c.stroke(); }
    sparkle(c, R * 0.6, -R * 0.6, R * 0.16, '#ffb43a');
  } else {
    seedIcon(c, 0, 0, R * 0.6, 0.3);
  }
}
function drawCurseIcon9(c, id, R, t) {
  const O = '#1a1210';
  if (id === 'curatele') {
    rrect(c, -R * 0.6, -R * 0.3, R * 1.2, R * 0.85, R * 0.14); c.fillStyle = '#5a3a20'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.strokeStyle = '#c8ccd4'; c.lineWidth = R * 0.12; c.beginPath(); c.arc(0, -R * 0.3, R * 0.3, Math.PI, TAU); c.stroke();
    c.fillStyle = '#f2c230'; circle(c, 0, R * 0.12, R * 0.14);
  } else if (id === 'idool') {
    c.fillStyle = '#ffd84a'; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? R * 0.32 : R * 0.75; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = '#1a6ab0'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(-R * 0.4, R * 0.1); c.quadraticCurveTo(-R * 0.1, -R * 0.2, 0, R * 0.05); c.quadraticCurveTo(R * 0.1, R * 0.25, R * 0.4, -R * 0.05); c.stroke();
  } else if (id === 'busje') {
    rrect(c, -R * 0.6, -R * 0.7, R * 1.2, R * 1.35, R * 0.18); c.fillStyle = '#d8262e'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#1c2a3a'; rrect(c, -R * 0.48, -R * 0.45, R * 0.96, R * 0.55, R * 0.08); c.fill();
    c.fillStyle = '#ffb43a'; c.font = `800 ${Math.round(R * 0.32)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('34', 0, -R * 0.56);
    c.fillStyle = '#fff2c4'; for (const s of [-1, 1]) circle(c, s * R * 0.35, R * 0.38, R * 0.1);
  } else if (id === 'nacht') {
    c.fillStyle = '#f0ead6'; circle(c, 0, 0, R * 0.55); c.fillStyle = '#2a1a3a'; circle(c, R * 0.25, -R * 0.15, R * 0.48);
    sparkle(c, -R * 0.5, -R * 0.55, R * 0.12, '#fff0b0'); sparkle(c, R * 0.55, R * 0.45, R * 0.1, '#fff0b0');
  } else if (id === 'weken') {
    rrect(c, -R * 0.6, -R * 0.6, R * 1.2, R * 1.2, R * 0.1); c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = '#c3243a'; c.fillRect(-R * 0.6, -R * 0.6, R * 1.2, R * 0.3);
    c.fillStyle = '#2a2a30'; c.font = `800 ${Math.round(R * 0.6)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('81', 0, R * 0.12);
  } else if (id === 'loud') {
    drawItemIcon9(c, 'bass', R * 0.9, t);
    c.strokeStyle = '#ff4a3a'; c.lineWidth = R * 0.08; for (const r of [0.85, 1.0]) { c.beginPath(); c.arc(0, R * 0.16, R * r, Math.PI - 0.6, Math.PI + 0.6); c.stroke(); }
  }
}
function drawDownIcon9(c, id, R, t) {
  const O = '#1a1210';
  if (id === 'lowbat') {
    rrect(c, -R * 0.7, -R * 0.35, R * 1.3, R * 0.7, R * 0.1); c.strokeStyle = '#e8e2d0'; c.lineWidth = R * 0.1; c.stroke();
    c.fillStyle = '#e8e2d0'; c.fillRect(R * 0.62, -R * 0.15, R * 0.12, R * 0.3);
    c.fillStyle = Math.sin(t * 6) > 0 ? '#ff4a3a' : '#7a1a14'; c.fillRect(-R * 0.6, -R * 0.25, R * 0.16, R * 0.5);
    c.fillStyle = '#ff8a7a'; c.font = `800 ${Math.round(R * 0.36)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8%', 0, R * 0.65);
  } else if (id === 'crooked') {
    c.save(); c.rotate(0.35); c.fillStyle = '#efece4'; c.fillRect(-R * 0.55, -R * 0.6, R * 1.1, R * 1.2); c.strokeStyle = O; c.lineWidth = R * 0.06; c.strokeRect(-R * 0.55, -R * 0.6, R * 1.1, R * 1.2);
    c.fillStyle = '#5a4a6a'; c.fillRect(-R * 0.45, -R * 0.5, R * 0.9, R * 0.8); c.fillStyle = '#f2ecd8'; ell(c, 0, -R * 0.25, R * 0.2, R * 0.12); c.fill(); c.restore();
  } else if (id === 'cold') {
    c.strokeStyle = '#bfe4ff'; c.lineWidth = R * 0.1;
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75); c.lineTo(-Math.cos(a) * R * 0.75, -Math.sin(a) * R * 0.75); c.stroke(); }
    c.fillStyle = '#e6f5ff'; circle(c, 0, 0, R * 0.14);
  } else if (id === 'kfail') {
    c.fillStyle = '#e2b28c'; circle(c, 0, R * 0.2, R * 0.55); c.strokeStyle = O; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, R * 0.2, R * 0.55, 0, TAU); c.stroke();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(-R * 0.55, R * 0.05); c.lineTo(-R * 0.3, -R * 0.55); c.lineTo(-R * 0.05, -R * 0.15); c.lineTo(R * 0.2, -R * 0.7); c.lineTo(R * 0.55, 0); c.quadraticCurveTo(0, -R * 0.2, -R * 0.55, R * 0.05); c.fill();
  } else if (id === 'ghosted') {
    c.fillStyle = 'rgba(232,226,240,0.9)'; c.beginPath(); c.moveTo(-R * 0.5, R * 0.6); c.lineTo(-R * 0.5, -R * 0.1); c.arc(0, -R * 0.1, R * 0.5, Math.PI, TAU); c.lineTo(R * 0.5, R * 0.6);
    for (let i = 0; i < 4; i++) c.lineTo(R * 0.5 - (i + 0.5) * R * 0.25, R * (i % 2 ? 0.6 : 0.42)); c.closePath(); c.fill();
    c.fillStyle = '#2a2a30'; circle(c, -R * 0.17, -R * 0.12, R * 0.08); circle(c, R * 0.17, -R * 0.12, R * 0.08);
  } else if (id === 'witharen') {
    c.fillStyle = '#e2b28c'; circle(c, 0, R * 0.3, R * 0.5);
    c.fillStyle = '#f4f2ec'; c.beginPath(); c.moveTo(-R * 0.45, R * 0.05); c.quadraticCurveTo(-R * 0.4, -R * 0.75, R * 0.1, -R * 0.6); c.quadraticCurveTo(R * 0.6, -R * 0.55, R * 0.45, R * 0.05); c.quadraticCurveTo(0, -R * 0.25, -R * 0.45, R * 0.05); c.fill();
    c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
  }
}

