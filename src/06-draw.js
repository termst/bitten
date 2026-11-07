/* src/06-draw.js: drawing: the apple, icons, snakes, obstacles, room cache, decals. From v1 to v8. Lines 1824 to 3972 of the v13.7 script. */
/* =====================================================================
   Drawing: the apple, snakes, objects, floors. Everything is vector.
   ===================================================================== */
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); c.fill(); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
function rrect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function glowDot(c, x, y, r, col, a) {
  if (!(isFinite(x) && isFinite(y) && r > 0 && isFinite(r))) return;
  /* P2: a cached sprite at full strength, the strength goes through globalAlpha */
  if (!(a > 0)) return;
  const m = c.getTransform(), px = SPR14.bucket(r * Math.hypot(m.a, m.b));
  const spr = SPR14.get('g|' + col + '|' + px, px, (sc, p) => {
    const g = sc.createRadialGradient(p, p, 0, p, p, p); g.addColorStop(0, rgba(col, 1)); g.addColorStop(1, rgba(col, 0));
    sc.fillStyle = g; sc.fillRect(0, 0, p * 2, p * 2);
  });
  const ga = c.globalAlpha; c.globalAlpha = ga * Math.min(1, a);
  c.drawImage(spr, x - r, y - r, r * 2, r * 2);
  c.globalAlpha = ga;
}

/* ------------------------------------------------------------------ apple */
const BITE_ANGLES = [0.25, 2.9, 1.05, 2.1, -0.45, 3.62, 0.62, 2.5, 1.58, -0.12, 3.28, 1.3, 0.0, 2.7, 1.8, 3.45];

function applePath(c, R) {
  c.beginPath();
  c.moveTo(0, -R * 0.62);
  c.bezierCurveTo(R * 0.38, -R * 1.06, R * 1.12, -R * 0.84, R * 1.03, -R * 0.06);
  c.bezierCurveTo(R * 0.97, R * 0.66, R * 0.56, R * 1.02, R * 0.2, R * 0.96);
  c.bezierCurveTo(R * 0.09, R * 0.93, -R * 0.09, R * 0.93, -R * 0.2, R * 0.96);
  c.bezierCurveTo(-R * 0.56, R * 1.02, -R * 0.97, R * 0.66, -R * 1.03, -R * 0.06);
  c.bezierCurveTo(-R * 1.12, -R * 0.84, -R * 0.38, -R * 1.06, 0, -R * 0.62);
  c.closePath();
}
function biteShape(c, R, a, k) {
  c.beginPath();
  const d = R * 1.02, br = R * 0.36 * k;
  c.moveTo(Math.cos(a) * d + br, Math.sin(a) * d);
  c.arc(Math.cos(a) * d, Math.sin(a) * d, br, 0, TAU);
  for (const o of [-0.4, 0.4]) {
    const aa = a + o, dd = R * 1.1, rr = R * 0.2 * k;
    c.moveTo(Math.cos(aa) * dd + rr, Math.sin(aa) * dd);
    c.arc(Math.cos(aa) * dd, Math.sin(aa) * dd, rr, 0, TAU);
  }
}
// fresh apple flesh browns as it oxidizes
function biteColor(age) { return mixHex('#f6e9cb', '#b07f45', clamp(age / 30, 0, 1)); }

function drawStem(c, R, leaf, side) {
  c.save();
  c.translate(side * R * 0.16, 0);
  c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.12; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -R * 0.58); c.quadraticCurveTo(R * 0.04 * (side || 1), -R * 0.9, R * (side < 0 ? -0.12 : 0.16), -R * 1.12); c.stroke();
  c.translate(R * (side < 0 ? -0.08 : 0.1), -R * 0.95);
  c.rotate(side < 0 ? Math.PI + 0.25 - leaf : -0.25 + leaf);
  if (side < 0) c.scale(1, -1);
  const s = side ? 0.8 : 1;
  c.beginPath(); c.moveTo(0, 0);
  c.quadraticCurveTo(R * 0.34 * s, -R * 0.38 * s, R * 0.8 * s, -R * 0.08 * s);
  c.quadraticCurveTo(R * 0.4 * s, R * 0.2 * s, 0, 0); c.closePath();
  c.fillStyle = '#72a03c'; c.fill();
  c.strokeStyle = '#22370e'; c.lineWidth = R * 0.05; c.stroke();
  c.beginPath(); c.moveTo(R * 0.05 * s, -R * 0.01 * s); c.quadraticCurveTo(R * 0.4 * s, -R * 0.12 * s, R * 0.72 * s, -R * 0.08 * s);
  c.strokeStyle = 'rgba(30,50,10,0.5)'; c.lineWidth = R * 0.03; c.stroke();
  c.restore();
}

function drawAppleFace(c, R, st) {
  const open = clamp(st.blink, 0.07, 1);
  const lx = clamp(st.lookX, -1, 1), ly = clamp(st.lookY, -1, 1);
  const ex = R * 0.33, ey = -R * 0.06;
  for (const s of [-1, 1]) {
    const x = s * ex + lx * R * 0.05, y = ey + ly * R * 0.04;
    ell(c, x, y, R * 0.2, R * 0.25 * open); c.fillStyle = '#fff8ec'; c.fill();
    c.strokeStyle = '#3a0811'; c.lineWidth = R * 0.055; c.stroke();
    if (open > 0.3) {
      const pr = R * (0.115 - st.fear * 0.045);
      const px = x + lx * R * 0.075, py = y + ly * R * 0.09 * open;
      c.fillStyle = '#16070b'; circle(c, px, py, pr);
      c.fillStyle = '#ffffff'; circle(c, px - pr * 0.35, py - pr * 0.4, pr * 0.38);
    }
  }
  c.strokeStyle = '#3e0912'; c.lineWidth = R * 0.075; c.lineCap = 'round';
  const lift = st.fear * R * 0.06;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.5, -R * 0.34 + lift * 0.4); c.lineTo(s * R * 0.17, -R * 0.44 - lift); c.stroke(); }
  if (st.hurt > 0 || st.mouthOpen) {
    ell(c, 0, R * 0.42, R * 0.12, R * 0.16); c.fillStyle = '#2a0509'; c.fill();
  } else {
    const w = Math.sin(st.t * 9) * R * 0.03 * st.fear;
    c.lineWidth = R * 0.07;
    c.beginPath(); c.moveTo(-R * 0.15, R * 0.4);
    c.quadraticCurveTo(-R * 0.05, R * 0.34 + w, 0, R * 0.38);
    c.quadraticCurveTo(R * 0.07, R * 0.43 - w, R * 0.15, R * 0.37); c.stroke();
  }
}

// Draws the apple centered at the origin. Must target an offscreen canvas (it cuts bites out).
function drawApple(c, R, st) {
  c.save();
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (st.char === 'mika') { drawMika(c, R, st); c.restore(); return; }
  if (st.char === 'pean') { drawPean(c, R, st); c.restore(); return; }
  if (st.toffee) {
    c.strokeStyle = '#2a1a0c'; c.lineWidth = R * 0.24;
    c.beginPath(); c.moveTo(-R * 0.04, -R * 0.5); c.lineTo(-R * 0.14, -R * 1.55); c.stroke();
    c.strokeStyle = '#d2ad78'; c.lineWidth = R * 0.14;
    c.beginPath(); c.moveTo(-R * 0.04, -R * 0.5); c.lineTo(-R * 0.14, -R * 1.55); c.stroke();
  }
  if (st.horns) {
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * R * 0.35, -R * 0.7); c.quadraticCurveTo(s * R * 0.75, -R * 1.25, s * R * 0.62, -R * 1.62);
      c.quadraticCurveTo(s * R * 0.5, -R * 1.15, s * R * 0.12, -R * 0.82); c.closePath();
      c.fillStyle = '#8a0e14'; c.fill(); c.strokeStyle = '#2b0306'; c.lineWidth = Math.max(0.7, R * 0.07); c.stroke();
    }
  }
  const gold = !!st.gold, rot = st.char === 'rot';
  const g = c.createRadialGradient(-R * 0.38, -R * 0.42, R * 0.08, 0, 0, R * 1.18);
  g.addColorStop(0, gold ? '#fff0b0' : rot ? '#c4ad5a' : '#ff7a6e');
  g.addColorStop(0.42, gold ? '#e5b440' : rot ? '#8c6d2c' : '#d92a40');
  g.addColorStop(1, gold ? '#7e5410' : rot ? '#3c2a10' : '#6e0b1d');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  c.strokeStyle = gold ? 'rgba(255,240,180,0.2)' : 'rgba(255,190,120,0.15)'; c.lineWidth = R * 0.05;
  for (const x of [-0.55, -0.2, 0.3, 0.62]) {
    c.beginPath(); c.moveTo(x * R, -R * 0.7); c.quadraticCurveTo(x * R * 1.15, 0, x * R * 0.8, R * 0.85); c.stroke();
  }
  if (rot) {
    c.fillStyle = 'rgba(170,190,110,0.75)';
    for (const [x, y, r] of [[-0.5, 0.25, 0.22], [0.42, -0.3, 0.16], [0.35, 0.55, 0.2], [-0.15, 0.75, 0.12], [-0.7, -0.25, 0.1]]) circle(c, x * R, y * R, r * R);
    c.fillStyle = 'rgba(50,30,10,0.55)';
    for (const [x, y, r] of [[0.05, 0.3, 0.1], [-0.35, -0.5, 0.07], [0.62, 0.15, 0.08]]) circle(c, x * R, y * R, r * R);
  }
  if (st.char === 'krul') drawKrulTee(c, R);
  if (st.cyanide && !rot) {
    c.fillStyle = 'rgba(38,74,30,0.6)';
    for (const [x, y, r] of [[-0.58, 0.36, 0.09], [0.52, 0.52, 0.07], [0.64, -0.22, 0.06], [-0.3, 0.72, 0.05], [0.12, 0.66, 0.045]]) circle(c, x * R, y * R, r * R);
  }
  if (st.toffee && st.shellUp) {
    const base = -0.05;
    c.fillStyle = 'rgba(232,150,48,0.55)';
    c.beginPath(); c.moveTo(-R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 1.3); c.lineTo(R * 1.3, base * R);
    for (const [tx, ty] of [[0.8, 0.4], [0.34, 0.52], [-0.2, 0.36], [-0.66, 0.46]]) {
      const w = 0.13;
      c.lineTo((tx + w) * R, base * R);
      c.bezierCurveTo((tx + w) * R, ty * R, (tx - w) * R, ty * R, (tx - w) * R, base * R);
    }
    c.lineTo(-R * 1.3, base * R); c.closePath(); c.fill();
  }
  c.restore();
  ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = 'rgba(255,255,255,0.42)'; c.fill();
  if (st.toffee && st.shellUp) {
    c.strokeStyle = 'rgba(255,236,190,0.8)'; c.lineWidth = R * 0.07;
    c.beginPath(); c.arc(0, 0, R * 0.78, -1.15, -0.35); c.stroke();
  }
  applePath(c, R); c.strokeStyle = gold ? '#4a3006' : rot ? '#1f1406' : '#2b070f'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(st.t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  if (rot) {
    if (st.face !== false) drawRotFace(c, R, st);
    drawStem(c, R, (st.leaf || 0) * 0.4 - 0.5, 0);
    drawRotWorm(c, R, st.t || 0);
  } else if (st.char === 'krul') {
    if (st.face !== false) drawKrulFace(c, R, st);
    drawKrulGlasses(c, R);
    drawKrulHair(c, R, st.leaf || 0);
  } else if (st.char === 'appel') {
    drawMullet(c, R);
    if (st.face !== false) drawAppelFace(c, R, st);
    drawAppelStem(c, R, st.leaf || 0, st.twin);
  } else {
    if (st.face !== false) drawAppleFace(c, R, st);
    if (st.twin) drawStem(c, R, st.leaf || 0, -1);
    drawStem(c, R, st.leaf || 0, 0);
  }
  c.restore();
}

/* The Rotten Apple: droopy eyes, a crooked grin, a worm poking out */
function drawRotFace(c, R, st) {
  const lx = clamp(st.lookX, -1, 1), ly = clamp(st.lookY, -1, 1);
  const open = clamp(st.blink, 0.07, 1);
  for (const s of [-1, 1]) {
    const x = s * R * 0.33, y = -R * 0.04;
    ell(c, x, y, R * 0.19, R * 0.2 * open); c.fillStyle = '#efe6c4'; c.fill();
    c.strokeStyle = '#1f1406'; c.lineWidth = R * 0.05; c.stroke();
    if (open > 0.3) { c.fillStyle = '#1a1204'; circle(c, x + lx * R * 0.06, y + R * 0.05 + ly * R * 0.03, R * 0.09); }
    c.fillStyle = '#7a5e22';
    c.beginPath(); c.ellipse(x, y, R * 0.21, R * 0.21 * open, 0, Math.PI, TAU); c.fill();
    c.strokeStyle = '#1f1406'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(x - R * 0.2, y); c.lineTo(x + R * 0.2, y + s * R * 0.02); c.stroke();
  }
  c.strokeStyle = '#1f1406'; c.lineWidth = R * 0.07; c.lineCap = 'round';
  if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.12, R * 0.14); c.fillStyle = '#1a0c04'; c.fill(); }
  else {
    c.beginPath(); c.moveTo(-R * 0.22, R * 0.36); c.quadraticCurveTo(0, R * 0.52, R * 0.24, R * 0.3); c.stroke();
    c.fillStyle = '#efe6c4'; c.fillRect(-R * 0.02, R * 0.41, R * 0.09, R * 0.09);
  }
}
function drawRotWorm(c, R, t) {
  const hx = R * 0.6, hy = -R * 0.32;
  ell(c, hx, hy, R * 0.16, R * 0.12); c.fillStyle = '#140a02'; c.fill();
  const w = Math.sin(t * 4) * 0.25;
  const pts = [];
  for (let i = 0; i < 4; i++) { const u = i / 3; pts.push([hx + u * R * 0.35 + Math.sin(u * 3 + t * 4) * R * 0.05, hy - u * R * 0.42 + w * u * R * 0.2]); }
  c.fillStyle = '#5a1f2b'; for (const [x, y] of pts) circle(c, x, y, R * 0.12);
  pts.forEach(([x, y], i) => { c.fillStyle = i % 2 ? '#e9899a' : '#f39cac'; circle(c, x, y, R * 0.085); });
  const [ex, ey] = pts[3];
  c.fillStyle = '#1a0a0e'; circle(c, ex - R * 0.03, ey - R * 0.02, R * 0.022); circle(c, ex + R * 0.04, ey - R * 0.01, R * 0.022);
  c.fillStyle = '#0d0b06';
  for (let i = 0; i < 2; i++) { const a = t * (6 + i * 2) + i * 2; circle(c, Math.cos(a) * R * 1.15, -R * 0.9 + Math.sin(a * 1.4) * R * 0.25, Math.max(0.6, R * 0.05)); }
}

function drawCapybara(c, cp, t) {
  const bob = Math.abs(Math.sin(cp.ph * 0.35)) * 1.2;
  c.fillStyle = 'rgba(0,0,0,0.32)'; ell(c, cp.x, cp.y + 7, 11, 3.5); c.fill();
  c.save(); c.translate(cp.x, cp.y - bob); c.scale(cp.face || 1, 1);
  c.fillStyle = '#4a2e1a';
  for (const lx of [-6, -2, 3, 7]) c.fillRect(lx - 1, 2, 2.4, 5 + (lx % 2 ? Math.sin(cp.ph * 0.7) : -Math.sin(cp.ph * 0.7)) * 0.8);
  ell(c, 0, 0, 11, 6.5); c.fillStyle = '#9a6a42'; c.fill(); c.strokeStyle = '#3a2412'; c.lineWidth = 1.2; c.stroke();
  rrect(c, 5, -7, 9, 8, 3.5); c.fillStyle = '#a8764c'; c.fill(); c.stroke();
  c.fillStyle = '#3a2412'; ell(c, 13, -3, 1.6, 2.2); c.fill();
  c.fillStyle = '#1a0e06'; circle(c, 9.5, -4.4, 0.9);
  c.fillStyle = '#7a5232'; circle(c, 6.5, -7.2, 1.6);
  c.fillStyle = '#ffb43a'; circle(c, 9, -9.5, 2.6); c.strokeStyle = '#8a5010'; c.lineWidth = 0.8; c.stroke();
  c.fillStyle = '#5a8a2a'; ell(c, 9.6, -12, 1.3, 0.7, -0.5); c.fill();
  c.restore();
}

/* Krullenbol: a mop of brown curls, a laughing squint, a white tee with sunglasses hooked in the collar */
function drawKrulTee(c, R) {
  const y0 = R * 0.46;
  c.beginPath(); c.moveTo(-R * 1.3, y0); c.lineTo(-R * 0.34, y0);
  c.quadraticCurveTo(0, R * 0.8, R * 0.34, y0); c.lineTo(R * 1.3, y0); c.lineTo(R * 1.3, R * 1.4); c.lineTo(-R * 1.3, R * 1.4); c.closePath();
  const g = c.createLinearGradient(0, y0, 0, R * 1.1); g.addColorStop(0, '#fbf8f0'); g.addColorStop(1, '#d6cfbf');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(60,50,45,0.55)'; c.lineWidth = Math.max(0.6, R * 0.05);
  c.beginPath(); c.moveTo(-R * 1.3, y0); c.lineTo(-R * 0.34, y0); c.quadraticCurveTo(0, R * 0.8, R * 0.34, y0); c.lineTo(R * 1.3, y0); c.stroke();
  c.strokeStyle = 'rgba(120,110,95,0.4)'; c.lineWidth = Math.max(0.5, R * 0.04);
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.74, y0 + R * 0.04); c.quadraticCurveTo(s * R * 0.8, R * 0.72, s * R * 0.7, R * 0.98); c.stroke(); }
  c.strokeStyle = 'rgba(70,70,80,0.6)'; c.lineWidth = Math.max(0.4, R * 0.035);
  c.beginPath(); c.moveTo(R * 0.3, R * 0.9); c.bezierCurveTo(R * 0.36, R * 0.78, R * 0.42, R * 0.98, R * 0.48, R * 0.86); c.bezierCurveTo(R * 0.54, R * 0.78, R * 0.58, R * 0.96, R * 0.66, R * 0.84); c.stroke();
}
function drawKrulFace(c, R, st) {
  const hurt = st.hurt > 0 || st.mouthOpen;
  const scared = st.fear > 0.75;
  c.fillStyle = 'rgba(255,140,140,0.32)';
  ell(c, -R * 0.58, R * 0.1, R * 0.15, R * 0.09); c.fill(); ell(c, R * 0.58, R * 0.1, R * 0.15, R * 0.09); c.fill();
  c.lineCap = 'round';
  for (const s of [-1, 1]) {
    const x = s * R * 0.32, y = -R * 0.04;
    if (hurt || scared) {
      ell(c, x, y, R * 0.14, R * 0.15); c.fillStyle = '#fff8ec'; c.fill();
      c.fillStyle = '#2a1608'; circle(c, x + clamp(st.lookX, -1, 1) * R * 0.04, y + R * 0.02, R * 0.07);
    } else {
      c.strokeStyle = '#2b070f'; c.lineWidth = Math.max(0.8, R * 0.08);
      c.beginPath(); c.arc(x, y + R * 0.07, R * 0.13, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
    }
    c.strokeStyle = '#3a1d10'; c.lineWidth = Math.max(0.7, R * 0.065);
    c.beginPath(); c.moveTo(x - s * R * 0.14, -R * 0.25); c.quadraticCurveTo(x, -R * 0.36, x + s * R * 0.15, -R * 0.27); c.stroke();
  }
  // a huge laughing grin, chomping while he eats
  let open = 1;
  if (st.chewing) open = st.chomp > 0.06 ? 0.85 : 0.2;
  c.beginPath();
  if (hurt) c.ellipse(0, R * 0.28, R * 0.15, R * 0.15, 0, 0, TAU);
  else {
    c.moveTo(-R * 0.44, R * 0.1); c.quadraticCurveTo(0, R * 0.2, R * 0.44, R * 0.1);
    c.quadraticCurveTo(0, R * (0.12 + 0.62 * open), -R * 0.44, R * 0.1);
  }
  c.fillStyle = '#3a0a10'; c.fill();
  if (!hurt) {
    c.save(); c.clip();
    c.fillStyle = '#fbf6ea'; c.fillRect(-R * 0.46, R * 0.08, R * 0.92, R * 0.13);
    c.strokeStyle = 'rgba(150,130,110,0.6)'; c.lineWidth = Math.max(0.3, R * 0.02);
    for (const x of [-0.24, -0.08, 0.08, 0.24]) { c.beginPath(); c.moveTo(x * R, R * 0.1); c.lineTo(x * R, R * 0.21); c.stroke(); }
    if (open > 0.5) { c.fillStyle = '#d4566a'; ell(c, 0, R * 0.42, R * 0.2, R * 0.09); c.fill(); }
    c.restore();
  }
  c.strokeStyle = '#3e0912'; c.lineWidth = Math.max(0.7, R * 0.05); c.stroke();
  // light stubble
  c.fillStyle = 'rgba(70,35,20,0.35)';
  for (let i = 0; i < 9; i++) { const a = 0.35 + (i / 8) * (Math.PI - 0.7); circle(c, Math.cos(a) * R * 0.5, R * 0.16 + Math.sin(a) * R * 0.26, Math.max(0.35, R * 0.025)); }
}
function drawKrulGlasses(c, R) {
  c.save(); c.translate(R * 0.02, R * 0.74); c.rotate(-0.12);
  c.strokeStyle = '#15151c'; c.lineWidth = Math.max(0.6, R * 0.05);
  c.beginPath(); c.moveTo(-R * 0.3, -R * 0.06); c.lineTo(-R * 0.18, -R * 0.2); c.stroke();
  for (const s of [-1, 1]) {
    ell(c, s * R * 0.17, 0, R * 0.15, R * 0.11, s * 0.1); c.fillStyle = '#1e2433'; c.fill(); c.stroke();
    c.fillStyle = 'rgba(160,190,255,0.45)'; ell(c, s * R * 0.17 - R * 0.05, -R * 0.03, R * 0.05, R * 0.025, -0.4); c.fill();
  }
  c.beginPath(); c.moveTo(-R * 0.03, -R * 0.02); c.quadraticCurveTo(0, -R * 0.07, R * 0.03, -R * 0.02); c.stroke();
  c.restore();
}
function drawKrulHair(c, R, leaf) {
  const curls = [
    [-0.62, -0.98, 0.27], [-0.24, -1.06, 0.28], [0.14, -1.04, 0.28], [0.5, -0.94, 0.27],
    [-0.88, -0.74, 0.25], [-0.46, -0.8, 0.26], [-0.05, -0.84, 0.27], [0.34, -0.8, 0.26], [0.78, -0.72, 0.25],
    [-1.02, -0.44, 0.2], [1.0, -0.44, 0.2], [-1.06, -0.18, 0.15], [1.04, -0.2, 0.15],
  ];
  const fringe = [[-0.52, -0.56, 0.15], [-0.18, -0.6, 0.16], [0.18, -0.58, 0.15], [0.5, -0.54, 0.14]];
  c.fillStyle = '#24140a';
  for (const [x, y, r] of curls.concat(fringe)) circle(c, x * R, y * R, (r + 0.06) * R);
  curls.concat(fringe).forEach(([x, y, r], i) => { c.fillStyle = i % 3 === 0 ? '#6d4127' : i % 3 === 1 ? '#5a3520' : '#7a4a2c'; circle(c, x * R, y * R, r * R); });
  c.strokeStyle = 'rgba(176,122,72,0.85)'; c.lineWidth = Math.max(0.5, R * 0.04); c.lineCap = 'round';
  curls.concat(fringe).forEach(([x, y, r], i) => { const a0 = i * 1.7; c.beginPath(); c.arc(x * R, y * R, r * R * 0.5, a0, a0 + 3.8); c.stroke(); });
  c.strokeStyle = 'rgba(40,22,12,0.7)'; c.lineWidth = Math.max(0.4, R * 0.03);
  for (const [x, y, r] of fringe) { c.beginPath(); c.arc(x * R, y * R + r * R * 0.2, r * R * 0.75, 0.3, 2.8); c.stroke(); }
  c.save(); c.translate(R * 0.06, -R * 0.42); drawStem(c, R * 0.95, leaf, 0); c.restore();
}

/* Appelgameplay: brown mullet, round wire glasses, a cross earring, a big grin */
function drawMullet(c, R) {
  const blobs = [
    [-0.84, -0.55, 0.33], [-0.52, -0.8, 0.33], [-0.15, -0.9, 0.34], [0.22, -0.89, 0.34], [0.58, -0.77, 0.33], [0.88, -0.5, 0.31],
    [-1.03, -0.12, 0.3], [1.03, -0.14, 0.3], [-1.08, 0.3, 0.26], [1.07, 0.28, 0.26], [-0.99, 0.6, 0.2], [1.0, 0.58, 0.2],
  ];
  const fringe = [[-0.58, -0.5, 0.17], [-0.3, -0.46, 0.18], [-0.02, -0.5, 0.17], [0.27, -0.45, 0.18], [0.55, -0.49, 0.16]];
  c.fillStyle = '#2a170b';
  for (const [x, y, r] of blobs.concat(fringe)) circle(c, x * R, y * R, (r + 0.07) * R);
  c.fillStyle = '#6b4326';
  for (const [x, y, r] of blobs) circle(c, x * R, y * R, r * R);
  c.fillStyle = '#7a4e2c';
  for (const [x, y, r] of fringe) circle(c, x * R, y * R, r * R);
  c.strokeStyle = 'rgba(176,120,70,0.75)'; c.lineWidth = Math.max(0.6, R * 0.045); c.lineCap = 'round';
  for (const [x0, y0, x1, y1, cx, cy] of [[-0.7, -0.75, -0.2, -1.1, -0.55, -1.05], [0.05, -1.15, 0.55, -0.9, 0.35, -1.15], [-1.1, -0.2, -1.05, 0.4, -1.25, 0.1], [1.1, -0.2, 1.05, 0.4, 1.25, 0.1], [-0.4, -0.62, -0.2, -0.38, -0.25, -0.55]]) {
    c.beginPath(); c.moveTo(x0 * R, y0 * R); c.quadraticCurveTo(cx * R, cy * R, x1 * R, y1 * R); c.stroke();
  }
}
function drawAppelFace(c, R, st) {
  const lx = clamp(st.lookX, -1, 1), ly = clamp(st.lookY, -1, 1);
  const open = clamp(st.blink, 0.07, 1);
  for (const s of [-1, 1]) {
    const x = s * R * 0.34, y = -R * 0.05;
    ell(c, x, y, R * 0.15, R * 0.12 * open); c.fillStyle = '#fff8ec'; c.fill();
    if (open > 0.3) { c.fillStyle = '#2a1608'; circle(c, x + lx * R * 0.05, y + ly * R * 0.03, R * 0.075); }
    c.strokeStyle = '#3e0912'; c.lineWidth = R * 0.05;
    c.beginPath(); c.ellipse(x, y + R * 0.02, R * 0.17, R * 0.12, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  }
  // round wire glasses
  c.strokeStyle = '#2b2a2e'; c.lineWidth = Math.max(0.7, R * 0.055);
  c.beginPath(); c.moveTo(-R * 0.6, -R * 0.1); c.lineTo(-R * 1.0, -R * 0.16); c.moveTo(R * 0.6, -R * 0.1); c.lineTo(R * 1.0, -R * 0.16); c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.34, -R * 0.06, R * 0.27, 0, TAU); c.stroke(); }
  c.beginPath(); c.moveTo(-R * 0.08, -R * 0.1); c.quadraticCurveTo(0, -R * 0.2, R * 0.08, -R * 0.1); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = Math.max(0.5, R * 0.035);
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.34, -R * 0.06, R * 0.2, -2.4, -1.7); c.stroke(); }
  // big grin with teeth
  const hurt = st.hurt > 0 || st.mouthOpen;
  c.beginPath();
  if (hurt) { c.ellipse(0, R * 0.44, R * 0.16, R * 0.2, 0, 0, TAU); }
  else { c.moveTo(-R * 0.36, R * 0.28); c.quadraticCurveTo(0, R * 0.82, R * 0.36, R * 0.28); c.quadraticCurveTo(0, R * 0.4, -R * 0.36, R * 0.28); }
  c.fillStyle = '#3a0a10'; c.fill();
  if (!hurt) {
    c.save(); c.clip();
    c.fillStyle = '#fbf6ea'; c.fillRect(-R * 0.4, R * 0.28, R * 0.8, R * 0.17);
    c.fillStyle = '#c94a5a'; ell(c, 0, R * 0.62, R * 0.17, R * 0.09); c.fill();
    c.restore();
  }
  c.strokeStyle = '#3e0912'; c.lineWidth = R * 0.05; c.stroke();
  // cross earring, hanging under the left side lock
  const ex = -R * 1.0, ey = R * 0.5;
  c.strokeStyle = '#c9c9d2'; c.lineWidth = Math.max(0.6, R * 0.04);
  c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex, ey + R * 0.14); c.stroke();
  c.strokeStyle = '#1b1b20'; c.lineWidth = Math.max(1.3, R * 0.11);
  c.beginPath(); c.moveTo(ex, ey + R * 0.14); c.lineTo(ex, ey + R * 0.5); c.moveTo(ex - R * 0.1, ey + R * 0.26); c.lineTo(ex + R * 0.1, ey + R * 0.26); c.stroke();
  c.strokeStyle = '#e4e4ec'; c.lineWidth = Math.max(0.8, R * 0.06);
  c.beginPath(); c.moveTo(ex, ey + R * 0.14); c.lineTo(ex, ey + R * 0.5); c.moveTo(ex - R * 0.1, ey + R * 0.26); c.lineTo(ex + R * 0.1, ey + R * 0.26); c.stroke();
}
function drawAppelStem(c, R, leaf, twin) {
  c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.12; c.lineCap = 'round';
  c.beginPath(); c.moveTo(R * 0.02, -R * 1.25); c.quadraticCurveTo(R * 0.05, -R * 1.45, R * 0.18, -R * 1.6); c.stroke();
  leafShape(c, R * 0.12, -R * 1.5, R * 0.6, -0.35 + leaf);
  if (twin) {
    c.beginPath(); c.moveTo(-R * 0.15, -R * 1.25); c.quadraticCurveTo(-R * 0.2, -R * 1.42, -R * 0.32, -R * 1.55); c.stroke();
    leafShape(c, -R * 0.28, -R * 1.48, R * 0.5, Math.PI + 0.35 - leaf);
  }
}

function corePath(c, R) {
  c.beginPath();
  c.moveTo(-R * 0.66, -R * 0.6);
  c.bezierCurveTo(-R * 0.7, -R * 1.0, R * 0.7, -R * 1.0, R * 0.66, -R * 0.6);
  c.bezierCurveTo(R * 0.2, -R * 0.42, R * 0.18, -R * 0.15, R * 0.24, R * 0.05);
  c.bezierCurveTo(R * 0.3, R * 0.3, R * 0.2, R * 0.5, R * 0.62, R * 0.7);
  c.bezierCurveTo(R * 0.6, R * 1.02, -R * 0.6, R * 1.02, -R * 0.62, R * 0.7);
  c.bezierCurveTo(-R * 0.2, R * 0.5, -R * 0.3, R * 0.3, -R * 0.24, R * 0.05);
  c.bezierCurveTo(-R * 0.18, -R * 0.15, -R * 0.2, -R * 0.42, -R * 0.66, -R * 0.6);
  c.closePath();
}
function drawCore(c, R, brown) {
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.12;
  c.beginPath(); c.moveTo(0, -R * 0.82); c.quadraticCurveTo(R * 0.05, -R * 1.05, R * 0.18, -R * 1.22); c.stroke();
  corePath(c, R); c.fillStyle = brown ? '#c99d62' : '#f1dfba'; c.fill();
  c.save(); corePath(c, R); c.clip();
  c.fillStyle = '#c3243a';
  ell(c, 0, -R * 0.86, R * 0.9, R * 0.3); c.fill();
  ell(c, 0, R * 0.92, R * 0.9, R * 0.26); c.fill();
  c.fillStyle = 'rgba(160,110,50,0.35)';
  ell(c, -R * 0.3, R * 0.05, R * 0.12, R * 0.5); c.fill();
  ell(c, R * 0.3, R * 0.05, R * 0.12, R * 0.5); c.fill();
  c.restore();
  c.fillStyle = '#3a2214';
  for (const s of [-1, 1]) { ell(c, s * R * 0.08, R * 0.04, R * 0.06, R * 0.12, s * 0.3); c.fill(); }
  corePath(c, R); c.strokeStyle = '#2b1a10'; c.lineWidth = Math.max(1, R * 0.08); c.stroke();
  c.restore();
}

/* ------------------------------------------------------------------ icons */
function leafShape(c, x, y, len, ang) {
  c.save(); c.translate(x, y); c.rotate(ang);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.45, -len * 0.42, len, 0); c.quadraticCurveTo(len * 0.45, len * 0.42, 0, 0); c.closePath();
  c.fillStyle = '#72a03c'; c.fill(); c.strokeStyle = '#22370e'; c.lineWidth = len * 0.07; c.stroke();
  c.restore();
}
function seedShape(c, x, y, R, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, -R); c.bezierCurveTo(R * 0.68, -R * 0.25, R * 0.62, R * 0.92, 0, R * 0.92);
  c.bezierCurveTo(-R * 0.62, R * 0.92, -R * 0.68, -R * 0.25, 0, -R); c.closePath();
  c.restore();
}
// Item icons fit a box of size S centered on the origin; safe on the main canvas.
function drawItemIcon(c, id, S, t = 0) {
  const R = S / 2;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  if (id === 'twin') {
    c.fillStyle = '#c3243a'; c.beginPath(); c.ellipse(0, R * 0.78, R * 0.62, R * 0.3, 0, Math.PI, TAU); c.fill();
    c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.16;
    c.beginPath(); c.moveTo(-R * 0.08, R * 0.55); c.quadraticCurveTo(-R * 0.15, R * 0.0, -R * 0.42, -R * 0.42); c.stroke();
    c.beginPath(); c.moveTo(R * 0.08, R * 0.55); c.quadraticCurveTo(R * 0.15, R * 0.0, R * 0.42, -R * 0.42); c.stroke();
    leafShape(c, -R * 0.4, -R * 0.4, R * 0.62, -2.3 + Math.sin(t * 2) * 0.08);
    leafShape(c, R * 0.4, -R * 0.4, R * 0.62, -0.84 - Math.sin(t * 2) * 0.08);
  } else if (id === 'cyanide') {
    c.fillStyle = 'rgba(150,200,90,0.25)'; circle(c, 0, 0, R * 0.95);
    seedShape(c, -R * 0.05, R * 0.05, R * 0.78, 0.35);
    const g = c.createLinearGradient(-R * 0.5, -R * 0.6, R * 0.5, R * 0.7); g.addColorStop(0, '#6a4528'); g.addColorStop(1, '#22130a');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#100703'; c.lineWidth = R * 0.08; c.stroke();
    c.fillStyle = 'rgba(255,240,210,0.45)'; ell(c, -R * 0.22, -R * 0.2, R * 0.08, R * 0.2, 0.35); c.fill();
    c.fillStyle = '#a9d36a';
    for (const [x, y, r] of [[0.55, -0.5, 0.13], [0.7, -0.1, 0.09], [0.48, 0.32, 0.07]]) circle(c, x * R, y * R + Math.sin(t * 3 + x * 5) * R * 0.04, r * R);
  } else if (id === 'toffee') {
    c.strokeStyle = '#2a1a0c'; c.lineWidth = R * 0.2; c.beginPath(); c.moveTo(0, -R * 0.1); c.lineTo(-R * 0.08, -R * 0.98); c.stroke();
    c.strokeStyle = '#d2ad78'; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(0, -R * 0.1); c.lineTo(-R * 0.08, -R * 0.98); c.stroke();
    c.save(); c.translate(0, R * 0.28);
    applePath(c, R * 0.66); c.fillStyle = '#c92139'; c.fill();
    c.save(); applePath(c, R * 0.66); c.clip();
    c.fillStyle = '#e0952f';
    c.beginPath(); c.moveTo(-R, -R); c.lineTo(R, -R); c.lineTo(R, 0);
    for (const [tx, ty] of [[0.4, 0.38], [0.05, 0.22], [-0.32, 0.42]]) { c.lineTo((tx + 0.1) * R, 0); c.bezierCurveTo((tx + 0.1) * R, ty * R, (tx - 0.1) * R, ty * R, (tx - 0.1) * R, 0); }
    c.lineTo(-R, 0); c.closePath(); c.fill();
    c.restore();
    applePath(c, R * 0.66); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.08; c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.8)'; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.45, -1.1, -0.4); c.stroke();
    c.restore();
  } else if (id === 'worm') {
    const n = 7; const pts = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1); pts.push([lerp(-R * 0.7, R * 0.55, u), Math.sin(u * 4.2 + t * 4) * R * 0.22 + R * 0.12]); }
    for (let i = 0; i < n; i++) { const [x, y] = pts[i]; c.fillStyle = '#5a1f2b'; circle(c, x, y, R * (0.16 + i * 0.012) + R * 0.07); }
    for (let i = 0; i < n; i++) { const [x, y] = pts[i]; c.fillStyle = i % 2 ? '#e9899a' : '#f095a5'; circle(c, x, y, R * (0.16 + i * 0.012)); }
    const [hx, hy] = pts[n - 1];
    c.fillStyle = '#1a0a0e'; circle(c, hx - R * 0.07, hy - R * 0.08, R * 0.045); circle(c, hx + R * 0.09, hy - R * 0.06, R * 0.045);
    c.strokeStyle = '#1a0a0e'; c.lineWidth = R * 0.05; c.beginPath(); c.arc(hx + R * 0.02, hy + R * 0.02, R * 0.08, 0.3, 2.6); c.stroke();
  } else if (id === 'cider') {
    c.fillStyle = '#9a6a3c'; rrect(c, -R * 0.13, -R * 0.98, R * 0.26, R * 0.22, R * 0.05); c.fill();
    c.fillStyle = 'rgba(214,150,48,0.9)'; rrect(c, -R * 0.15, -R * 0.78, R * 0.3, R * 0.5, R * 0.06); c.fill();
    rrect(c, -R * 0.45, -R * 0.36, R * 0.9, R * 1.25, R * 0.2); c.fill();
    c.strokeStyle = '#3a2008'; c.lineWidth = R * 0.07;
    rrect(c, -R * 0.45, -R * 0.36, R * 0.9, R * 1.25, R * 0.2); c.stroke();
    c.fillStyle = '#efe0bf'; c.fillRect(-R * 0.45, R * 0.05, R * 0.9, R * 0.36);
    c.fillStyle = '#c3243a'; circle(c, 0, R * 0.23, R * 0.11);
    c.fillStyle = 'rgba(255,245,215,0.7)';
    for (let i = 0; i < 4; i++) { const ph = (t * 0.7 + i * 0.27) % 1; circle(c, Math.sin(i * 2.1) * R * 0.22, R * 0.75 - ph * R * 1.0, R * 0.05 + i * 0.006 * R); }
  } else if (id === 'big') {
    seedShape(c, -R * 0.12, R * 0.05, R * 0.82, 0.3);
    c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.08; c.stroke();
    seedShape(c, R * 0.68, R * 0.55, R * 0.26, 0.3);
    c.fillStyle = '#5a3820'; c.fill(); c.lineWidth = R * 0.05; c.stroke();
  } else if (id === 'sling') {
    c.strokeStyle = '#2a1a0c'; c.lineWidth = R * 0.26;
    c.beginPath(); c.moveTo(0, R * 0.95); c.lineTo(0, R * 0.15); c.lineTo(-R * 0.55, -R * 0.6); c.moveTo(0, R * 0.15); c.lineTo(R * 0.55, -R * 0.6); c.stroke();
    c.strokeStyle = '#b98a52'; c.lineWidth = R * 0.15;
    c.beginPath(); c.moveTo(0, R * 0.95); c.lineTo(0, R * 0.15); c.lineTo(-R * 0.55, -R * 0.6); c.moveTo(0, R * 0.15); c.lineTo(R * 0.55, -R * 0.6); c.stroke();
    c.strokeStyle = '#c3243a'; c.lineWidth = R * 0.08;
    c.beginPath(); c.moveTo(-R * 0.55, -R * 0.6); c.quadraticCurveTo(0, R * 0.05, R * 0.55, -R * 0.6); c.stroke();
    seedShape(c, 0, -R * 0.2, R * 0.2, 0); c.fillStyle = '#5a3820'; c.fill();
  } else if (id === 'spread') {
    for (const a of [-0.55, 0, 0.55]) {
      c.save(); c.rotate(a);
      c.strokeStyle = 'rgba(239,217,173,0.45)'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(0, R * 0.85); c.lineTo(0, R * 0.05); c.stroke();
      seedShape(c, 0, -R * 0.5, R * 0.42, 0); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.07; c.stroke();
      c.restore();
    }
  } else if (id === 'thorn') {
    c.fillStyle = '#a7b46a';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      c.beginPath(); c.moveTo(Math.cos(a - 0.2) * R * 0.45, Math.sin(a - 0.2) * R * 0.5); c.lineTo(Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95); c.lineTo(Math.cos(a + 0.2) * R * 0.45, Math.sin(a + 0.2) * R * 0.5); c.closePath(); c.fill();
    }
    seedShape(c, 0, R * 0.04, R * 0.55, 0); c.fillStyle = '#4a2c18'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.06; c.stroke();
  } else if (id === 'rubber') {
    c.strokeStyle = 'rgba(239,217,173,0.6)'; c.lineWidth = R * 0.07; c.setLineDash([R * 0.14, R * 0.12]);
    c.beginPath(); c.moveTo(-R * 0.85, -R * 0.6); c.lineTo(-R * 0.1, R * 0.75); c.lineTo(R * 0.55, -R * 0.4); c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#4a4e5c'; c.fillRect(-R, R * 0.75, R * 2, R * 0.16);
    c.fillStyle = '#e06a4a'; circle(c, R * 0.62, -R * 0.55, R * 0.3);
    c.strokeStyle = '#3a1208'; c.lineWidth = R * 0.06; c.stroke();
  } else if (id === 'rain') {
    for (let i = 0; i < 9; i++) {
      const x = ((i * 0.37) % 1) * R * 1.6 - R * 0.8, ph = (t * 0.8 + i * 0.29) % 1, y = -R * 0.9 + ph * R * 1.8;
      seedShape(c, x, y, R * 0.24, 0.5); c.fillStyle = '#6a4228'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.04; c.stroke();
    }
  } else if (id === 'seeker') {
    c.strokeStyle = 'rgba(239,217,173,0.7)'; c.lineWidth = R * 0.08; c.setLineDash([R * 0.12, R * 0.1]);
    c.beginPath(); c.moveTo(-R * 0.85, R * 0.6); c.quadraticCurveTo(-R * 0.6, -R * 0.6, R * 0.25, -R * 0.35); c.stroke(); c.setLineDash([]);
    seedShape(c, R * 0.35, -R * 0.3, R * 0.34, 1.9); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = '#e83a50'; c.lineWidth = R * 0.08; c.beginPath(); c.arc(R * 0.62, R * 0.45, R * 0.28, 0, TAU); c.stroke();
    c.fillStyle = '#e83a50'; circle(c, R * 0.62, R * 0.45, R * 0.08);
  } else if (id === 'frost') {
    c.strokeStyle = '#bfe4ff'; c.lineWidth = R * 0.07;
    for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9); c.lineTo(-Math.cos(a) * R * 0.9, -Math.sin(a) * R * 0.9); c.stroke(); }
    seedShape(c, 0, R * 0.04, R * 0.45, 0); c.fillStyle = '#2f5f86'; c.fill(); c.strokeStyle = '#e6f5ff'; c.lineWidth = R * 0.07; c.stroke();
  } else if (id === 'fizzy') {
    c.fillStyle = 'rgba(255,226,164,0.35)'; circle(c, 0, 0, R * 0.9);
    c.strokeStyle = '#ffe2a4'; c.lineWidth = R * 0.06;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5); c.lineTo(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85); c.stroke(); }
    seedShape(c, 0, R * 0.04, R * 0.4, 0); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = 'rgba(255,240,210,0.8)'; c.lineWidth = R * 0.04;
    for (const [bx, by, br] of [[-0.6, -0.55, 0.1], [0.55, -0.62, 0.08], [0.65, 0.5, 0.09]]) { c.beginPath(); c.arc(bx * R, by * R, br * R, 0, TAU); c.stroke(); }
  } else if (id === 'halo') {
    c.strokeStyle = 'rgba(255,217,160,0.5)'; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.stroke();
    c.fillStyle = '#c3243a'; applePath(c, R * 0.3); c.fill();
    for (let i = 0; i < 3; i++) { const a = t * 2 + (i * TAU) / 3; seedShape(c, Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62, R * 0.22, a + Math.PI); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.04; c.stroke(); }
  } else if (id === 'split') {
    seedShape(c, -R * 0.45, R * 0.35, R * 0.34, 0.8); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = R * 0.06; c.stroke();
    for (const a of [-0.7, 0, 0.7]) {
      const x = -R * 0.1 + Math.cos(a - 0.8) * R * 0.75, y = R * 0.0 + Math.sin(a - 0.8) * R * 0.75;
      seedShape(c, x, y, R * 0.18, a + 0.8); c.fillStyle = '#6a4228'; c.fill(); c.lineWidth = R * 0.04; c.stroke();
    }
  } else if (id === 'hungry') {
    corePath(c, R * 0.62); c.fillStyle = '#f1dfba'; c.fill(); c.strokeStyle = '#2b1a10'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#c3243a';
    c.beginPath(); c.moveTo(R * 0.55, -R * 0.1); c.bezierCurveTo(R * 0.95, -R * 0.45, R * 1.0, R * 0.05, R * 0.55, R * 0.35); c.bezierCurveTo(R * 0.1, R * 0.05, R * 0.15, -R * 0.45, R * 0.55, -R * 0.1); c.fill();
  } else if (id === 'golden') {
    const g = c.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.05, 0, 0, R * 0.9);
    g.addColorStop(0, '#fff3b8'); g.addColorStop(0.5, '#e5b440'); g.addColorStop(1, '#7e5410');
    c.save(); c.translate(0, R * 0.12);
    applePath(c, R * 0.72); c.fillStyle = g; c.fill(); c.strokeStyle = '#4a3006'; c.lineWidth = R * 0.08; c.stroke();
    c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, -R * 0.42); c.quadraticCurveTo(R * 0.05, -R * 0.68, R * 0.14, -R * 0.82); c.stroke();
    leafShape(c, R * 0.08, -R * 0.66, R * 0.45, -0.35);
    c.restore();
    const tw = 0.5 + 0.5 * Math.sin(t * 5);
    c.fillStyle = `rgba(255,250,220,${0.5 + tw * 0.5})`;
    c.beginPath(); const sx = R * 0.62, sy = -R * 0.6, sr = R * (0.18 + tw * 0.06);
    c.moveTo(sx, sy - sr); c.lineTo(sx + sr * 0.25, sy); c.lineTo(sx, sy + sr); c.lineTo(sx - sr * 0.25, sy); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(sx - sr, sy); c.lineTo(sx, sy + sr * 0.25); c.lineTo(sx + sr, sy); c.lineTo(sx, sy - sr * 0.25); c.closePath(); c.fill();
  } else drawItemIcon2(c, id, R, t);
  c.restore();
}
function seedIcon(c, x, y, r, rot, fill, stroke) {
  seedShape(c, x, y, r, rot); c.fillStyle = fill || '#5a3820'; c.fill();
  c.strokeStyle = stroke || '#efd9ad'; c.lineWidth = Math.max(0.6, r * 0.16); c.stroke();
}
function sparkle(c, x, y, r, col) {
  c.fillStyle = col;
  c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * 0.25, y); c.lineTo(x, y + r); c.lineTo(x - r * 0.25, y); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x - r, y); c.lineTo(x, y + r * 0.25); c.lineTo(x + r, y); c.lineTo(x, y - r * 0.25); c.closePath(); c.fill();
}
function miniApple(c, x, y, r, col) {
  c.save(); c.translate(x, y);
  applePath(c, r); c.fillStyle = col || '#c92139'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = Math.max(0.6, r * 0.12); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.45)'; ell(c, -r * 0.42, -r * 0.35, r * 0.2, r * 0.12, -0.7); c.fill();
  c.strokeStyle = '#3d2414'; c.lineWidth = Math.max(0.6, r * 0.14); c.beginPath(); c.moveTo(0, -r * 0.6); c.lineTo(r * 0.12, -r * 1.05); c.stroke();
  c.restore();
}
function flameShape(c, x, y, w, h) {
  c.beginPath(); c.moveTo(x, y - h);
  c.bezierCurveTo(x + w * 0.8, y - h * 0.35, x + w, y + h * 0.35, x, y + h * 0.5);
  c.bezierCurveTo(x - w, y + h * 0.35, x - w * 0.8, y - h * 0.35, x, y - h); c.closePath();
}
function drawItemIcon2(c, id, R, t) {
  if (id === 'ember') {
    flameShape(c, 0, R * 0.05, R * 0.6, R * 0.95); c.fillStyle = '#ff6a1a'; c.fill();
    flameShape(c, 0, R * 0.25, R * 0.36, R * 0.6); c.fillStyle = '#ffd36a'; c.fill();
    seedIcon(c, 0, R * 0.4, R * 0.3, 0, '#5a2a10', '#ffcf8a');
  } else if (id === 'boomer') {
    c.strokeStyle = 'rgba(239,217,173,0.6)'; c.lineWidth = R * 0.07; c.setLineDash([R * 0.13, R * 0.1]);
    c.beginPath(); c.arc(0, R * 0.15, R * 0.82, -2.7, -0.45); c.stroke(); c.setLineDash([]);
    c.strokeStyle = '#2a1608'; c.lineWidth = R * 0.36;
    c.beginPath(); c.moveTo(-R * 0.72, -R * 0.25); c.quadraticCurveTo(0, R * 0.8, R * 0.72, -R * 0.25); c.stroke();
    c.strokeStyle = '#c98b4a'; c.lineWidth = R * 0.24;
    c.beginPath(); c.moveTo(-R * 0.72, -R * 0.25); c.quadraticCurveTo(0, R * 0.8, R * 0.72, -R * 0.25); c.stroke();
    c.strokeStyle = '#e83a50'; c.lineWidth = R * 0.06;
    c.beginPath(); c.moveTo(-R * 0.4, R * 0.12); c.quadraticCurveTo(0, R * 0.55, R * 0.4, R * 0.12); c.stroke();
  } else if (id === 'lucky') {
    c.fillStyle = 'rgba(255,215,80,0.22)'; circle(c, 0, 0, R * 0.9);
    seedIcon(c, -R * 0.08, R * 0.08, R * 0.68, 0.3, '#d9a23a', '#fff0a0');
    c.fillStyle = 'rgba(255,255,230,0.6)'; ell(c, -R * 0.25, -R * 0.15, R * 0.08, R * 0.2, 0.3); c.fill();
    sparkle(c, R * 0.58, -R * 0.55, R * (0.24 + 0.06 * Math.sin(t * 5)), '#fff6c8');
  } else if (id === 'static') {
    seedIcon(c, -R * 0.35, R * 0.2, R * 0.42, -0.4, '#2a4a70', '#bfe8ff');
    const bolt = () => { c.beginPath(); c.moveTo(R * 0.15, -R * 0.95); c.lineTo(R * 0.58, -R * 0.2); c.lineTo(R * 0.22, -R * 0.14); c.lineTo(R * 0.62, R * 0.72); };
    c.strokeStyle = '#1c3a5a'; c.lineWidth = R * 0.24; bolt(); c.stroke();
    c.strokeStyle = '#9fd8ff'; c.lineWidth = R * 0.12; bolt(); c.stroke();
  } else if (id === 'wiggle') {
    c.strokeStyle = 'rgba(239,217,173,0.65)'; c.lineWidth = R * 0.08; c.setLineDash([R * 0.12, R * 0.09]);
    c.beginPath(); for (let i = 0; i <= 20; i++) { const x = -R * 0.95 + (i / 20) * R * 1.35, y = Math.sin(i * 0.75 + t * 4) * R * 0.3; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
    seedIcon(c, R * 0.55, Math.sin(15 + t * 4) * R * 0.3, R * 0.34, Math.PI / 2, '#5a3820');
  } else if (id === 'quick') {
    c.strokeStyle = 'rgba(239,217,173,0.75)'; c.lineWidth = R * 0.09;
    for (const [y, l] of [[-0.35, 0.55], [0, 0.8], [0.35, 0.45]]) { c.beginPath(); c.moveTo(-R * 0.95, y * R); c.lineTo(-R * (0.95 - l), y * R); c.stroke(); }
    seedIcon(c, R * 0.35, 0, R * 0.48, Math.PI / 2);
  } else if (id === 'sharp') {
    seedIcon(c, 0, R * 0.08, R * 0.82, 0.55, '#3a2414', '#ffffff');
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = R * 0.06;
    c.beginPath(); c.moveTo(R * 0.12, -R * 0.42); c.lineTo(R * 0.32, -R * 0.02); c.stroke();
    sparkle(c, R * 0.52, -R * 0.68, R * 0.22, '#ffffff');
  } else if (id === 'sniper') {
    c.strokeStyle = '#e6e0d0'; c.lineWidth = R * 0.08;
    c.beginPath(); c.arc(0, 0, R * 0.68, 0, TAU); c.stroke();
    for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.38, Math.sin(a) * R * 0.38); c.lineTo(Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95); c.stroke(); }
    seedIcon(c, 0, R * 0.02, R * 0.26, 0);
    c.fillStyle = '#e83a50'; circle(c, R * 0.42, -R * 0.42, R * 0.08);
  } else if (id === 'peel') {
    c.save(); c.translate(0, R * 0.12);
    applePath(c, R * 0.74); c.fillStyle = '#f4e4c0'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.07; c.stroke();
    applePath(c, R * 0.56); c.fillStyle = '#c92139'; c.fill(); c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = '#c92139'; c.lineWidth = R * 0.1;
    c.beginPath(); c.arc(0, 0, R * 0.66, 0.6, 1.5); c.stroke();
    c.restore();
  } else if (id === 'sprout') {
    c.strokeStyle = '#3d6a1c'; c.lineWidth = R * 0.12;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.16, R * 0.2); c.quadraticCurveTo(s * R * 0.3, R * 0.55, s * R * 0.42, R * 0.88); c.stroke(); leafShape(c, s * R * 0.42, R * 0.86, R * 0.3, s > 0 ? 0 : Math.PI); }
    seedIcon(c, 0, -R * 0.05, R * 0.46, 0);
    c.strokeStyle = '#3d6a1c'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(0, -R * 0.45); c.lineTo(R * 0.05, -R * 0.75); c.stroke();
    leafShape(c, R * 0.05, -R * 0.72, R * 0.36, -0.6 + Math.sin(t * 3) * 0.15);
  } else if (id === 'spiky') {
    c.fillStyle = '#9aa86a';
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; c.beginPath(); c.moveTo(Math.cos(a - 0.22) * R * 0.5, Math.sin(a - 0.22) * R * 0.5); c.lineTo(Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98); c.lineTo(Math.cos(a + 0.22) * R * 0.5, Math.sin(a + 0.22) * R * 0.5); c.closePath(); c.fill(); }
    miniApple(c, 0, R * 0.08, R * 0.52);
  } else if (id === 'glow') {
    const g = c.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
    g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,220,120,0)');
    c.fillStyle = g; circle(c, 0, 0, R);
    miniApple(c, 0, R * 0.1, R * 0.46, '#ff5a5a');
  } else if (id === 'clover') {
    c.strokeStyle = '#2f5a1c'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.1); c.quadraticCurveTo(R * 0.1, R * 0.6, R * 0.35, R * 0.92); c.stroke();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4 + Math.sin(t * 2) * 0.05;
      const x = Math.cos(a) * R * 0.36, y = Math.sin(a) * R * 0.36 - R * 0.05;
      c.fillStyle = '#1f4012'; circle(c, x, y, R * 0.34); c.fillStyle = i % 2 ? '#5cbf4a' : '#6ed05a'; circle(c, x, y, R * 0.28);
    }
    c.fillStyle = '#d8f5b0'; circle(c, 0, -R * 0.05, R * 0.08);
  } else if (id === 'juice') {
    c.beginPath(); c.moveTo(-R * 0.5, -R * 0.5); c.lineTo(R * 0.5, -R * 0.5); c.lineTo(R * 0.38, R * 0.9); c.lineTo(-R * 0.38, R * 0.9); c.closePath();
    c.fillStyle = 'rgba(230,240,255,0.18)'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#e8a33a'; c.fillRect(-R, -R * 0.15 + Math.sin(t * 3) * R * 0.03, R * 2, R * 1.2); c.restore();
    c.strokeStyle = '#efe6d6'; c.lineWidth = R * 0.07; c.stroke();
    c.strokeStyle = '#e83a50'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(R * 0.1, R * 0.3); c.lineTo(R * 0.45, -R * 0.95); c.stroke();
    miniApple(c, -R * 0.45, -R * 0.52, R * 0.26);
  } else if (id === 'magnet') {
    c.lineCap = 'butt';
    c.strokeStyle = '#2a0c0c'; c.lineWidth = R * 0.46; c.beginPath(); c.arc(0, -R * 0.12, R * 0.48, Math.PI, 0); c.moveTo(-R * 0.48, -R * 0.12); c.lineTo(-R * 0.48, R * 0.4); c.moveTo(R * 0.48, -R * 0.12); c.lineTo(R * 0.48, R * 0.4); c.stroke();
    c.strokeStyle = '#d23a3a'; c.lineWidth = R * 0.32; c.beginPath(); c.arc(0, -R * 0.12, R * 0.48, Math.PI, 0); c.moveTo(-R * 0.48, -R * 0.12); c.lineTo(-R * 0.48, R * 0.3); c.moveTo(R * 0.48, -R * 0.12); c.lineTo(R * 0.48, R * 0.3); c.stroke();
    c.strokeStyle = '#d8dde6'; c.beginPath(); c.moveTo(-R * 0.48, R * 0.3); c.lineTo(-R * 0.48, R * 0.5); c.moveTo(R * 0.48, R * 0.3); c.lineTo(R * 0.48, R * 0.5); c.stroke();
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(239,217,173,0.6)'; c.lineWidth = R * 0.05;
    for (const y of [0.62, 0.78]) { c.beginPath(); c.moveTo(-R * 0.2, y * R); c.lineTo(R * 0.2, y * R); c.stroke(); }
  } else if (id === 'regrow') {
    c.fillStyle = '#4a3020'; ell(c, 0, R * 0.78, R * 0.7, R * 0.22); c.fill();
    c.strokeStyle = '#3d6a1c'; c.lineWidth = R * 0.11; c.beginPath(); c.moveTo(0, R * 0.7); c.quadraticCurveTo(-R * 0.1, R * 0.1, R * 0.05, -R * 0.4); c.stroke();
    leafShape(c, 0, R * 0.15, R * 0.5, -2.6 + Math.sin(t * 2) * 0.1);
    leafShape(c, R * 0.03, -R * 0.2, R * 0.55, -0.5 - Math.sin(t * 2) * 0.1);
    c.strokeStyle = '#9be37a'; c.lineWidth = R * 0.12;
    c.beginPath(); c.moveTo(R * 0.62, -R * 0.75); c.lineTo(R * 0.62, -R * 0.35); c.moveTo(R * 0.42, -R * 0.55); c.lineTo(R * 0.82, -R * 0.55); c.stroke();
  } else if (id === 'nova') {
    c.strokeStyle = 'rgba(255,200,90,0.5)'; c.lineWidth = R * 0.05; c.beginPath(); c.arc(0, 0, R * 0.6, 0, TAU); c.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + t * 0.6; seedIcon(c, Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72, R * 0.17, a + Math.PI / 2, '#5a3820', '#ffd36a'); }
    miniApple(c, 0, R * 0.06, R * 0.32);
  } else if (id === 'cannon') {
    c.save(); c.rotate(-0.6);
    rrect(c, -R * 0.75, -R * 0.32, R * 1.25, R * 0.64, R * 0.2); c.fillStyle = '#2a2a33'; c.fill(); c.strokeStyle = '#0c0c10'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#d9a23a'; c.fillRect(-R * 0.35, -R * 0.33, R * 0.14, R * 0.66); c.fillRect(R * 0.3, -R * 0.36, R * 0.16, R * 0.72);
    c.restore();
    seedIcon(c, R * 0.55, -R * 0.5, R * 0.42, 0.95, '#5a3820', '#ffd36a');
    c.fillStyle = 'rgba(230,220,200,0.5)'; circle(c, R * 0.15, -R * 0.15, R * 0.12); circle(c, R * 0.3, -R * 0.02, R * 0.08);
  } else if (id === 'buddy') {
    miniApple(c, -R * 0.25, R * 0.15, R * 0.55);
    miniApple(c, R * 0.55, R * 0.35 + Math.sin(t * 4) * R * 0.05, R * 0.3);
    c.fillStyle = '#1a0a0a';
    for (const [x, y, r] of [[-0.42, 0.12, 0.07], [-0.1, 0.12, 0.07], [0.48, 0.34, 0.045], [0.64, 0.34, 0.045]]) circle(c, x * R, y * R + (x > 0 ? Math.sin(t * 4) * R * 0.05 : 0), r * R);
  } else if (id === 'phoenix') {
    for (const s of [-1, 1]) {
      c.fillStyle = s < 0 ? '#ff6a1a' : '#ff8a2a';
      c.beginPath(); c.moveTo(0, R * 0.05);
      c.quadraticCurveTo(s * R * 0.55, -R * 0.95, s * R * 1.0, -R * 0.55 + Math.sin(t * 6) * R * 0.08);
      c.quadraticCurveTo(s * R * 0.7, -R * 0.15, s * R * 0.95, R * 0.05);
      c.quadraticCurveTo(s * R * 0.5, R * 0.15, 0, R * 0.35); c.closePath(); c.fill();
    }
    flameShape(c, 0, R * 0.55, R * 0.25, R * 0.5); c.fillStyle = '#ffd36a'; c.fill();
    seedIcon(c, 0, 0, R * 0.36, 0, '#7a2a10', '#fff0b0');
  } else if (id === 'storm') {
    c.fillStyle = '#4a4458';
    for (const [x, y, r] of [[-0.4, -0.45, 0.3], [0, -0.6, 0.38], [0.42, -0.42, 0.3], [0.05, -0.32, 0.32]]) circle(c, x * R, y * R, r * R);
    c.fillStyle = '#6a6280'; for (const [x, y, r] of [[-0.1, -0.68, 0.18], [0.3, -0.55, 0.12]]) circle(c, x * R, y * R, r * R);
    for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i * 0.33) % 1; seedIcon(c, (-0.4 + i * 0.4) * R, (-0.05 + ph * 0.9) * R, R * 0.2, 0.3 + Math.PI, '#5a3820', '#ffd36a'); }
  } else if (id === 'crown') {
    c.beginPath(); c.moveTo(-R * 0.8, R * 0.45); c.lineTo(-R * 0.85, -R * 0.45); c.lineTo(-R * 0.42, -R * 0.05); c.lineTo(0, -R * 0.7); c.lineTo(R * 0.42, -R * 0.05); c.lineTo(R * 0.85, -R * 0.45); c.lineTo(R * 0.8, R * 0.45); c.closePath();
    const g = c.createLinearGradient(0, -R * 0.7, 0, R * 0.45); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#c08a20');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#4a3006'; c.lineWidth = R * 0.08; c.stroke();
    c.fillStyle = '#a8761a'; c.fillRect(-R * 0.8, R * 0.25, R * 1.6, R * 0.2);
    c.fillStyle = '#e83a50'; circle(c, 0, R * 0.08, R * 0.12); c.fillStyle = '#3a9bff'; circle(c, -R * 0.45, R * 0.15, R * 0.08); circle(c, R * 0.45, R * 0.15, R * 0.08);
    sparkle(c, R * 0.62, -R * 0.75, R * (0.15 + 0.05 * Math.sin(t * 5)), '#fffbe0');
  } else if (id === 'chrono') {
    c.fillStyle = '#4a5a2a'; circle(c, 0, 0, R * 0.88);
    c.fillStyle = '#e8e2c8'; circle(c, 0, 0, R * 0.7);
    c.fillStyle = 'rgba(110,140,60,0.55)'; circle(c, -R * 0.3, R * 0.35, R * 0.16); circle(c, R * 0.4, -R * 0.3, R * 0.1);
    c.strokeStyle = '#2a1a10'; c.lineWidth = R * 0.08;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t * 0.5 - 1.6) * R * 0.5, Math.sin(t * 0.5 - 1.6) * R * 0.5); c.moveTo(0, 0); c.lineTo(R * 0.32, R * 0.1); c.stroke();
    c.fillStyle = '#2a1a10'; circle(c, 0, 0, R * 0.07);
  } else if (id === 'mirror') {
    const g = c.createLinearGradient(-R * 0.12, 0, R * 0.12, 0); g.addColorStop(0, '#8a93a3'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#8a93a3');
    c.fillStyle = g; c.fillRect(-R * 0.1, -R * 0.9, R * 0.2, R * 1.8);
    seedIcon(c, -R * 0.55, 0, R * 0.32, -Math.PI / 2);
    seedIcon(c, R * 0.55, 0, R * 0.32, Math.PI / 2, '#5a3820', '#cfe4ff');
  } else if (id === 'pump') {
    drawJerrycan(c, -R * 0.15, R * 0.12, R * 0.1, -0.25);
    c.fillStyle = '#ff8a2a'; flameShape(c, R * 0.55, -R * 0.45, R * 0.22, R * 0.38); c.fill();
    c.fillStyle = '#ffe08a'; flameShape(c, R * 0.55, -R * 0.35, R * 0.11, R * 0.2); c.fill();
  } else if (id === 'capy') {
    c.save(); c.scale(R / 14, R / 14); drawCapybara(c, { x: -2, y: 4, ph: t * 4, face: 1 }, t); c.restore();
  } else if (id === 'chill') {
    c.strokeStyle = 'rgba(150,210,255,0.55)'; c.lineWidth = R * 0.06;
    for (const rr of [0.55, 0.78]) { c.beginPath(); c.ellipse(0, R * 0.5, R * rr, R * rr * 0.35, 0, 0, TAU); c.stroke(); }
    miniApple(c, 0, R * 0.05, R * 0.42);
    c.fillStyle = '#15151c'; for (const s of [-1, 1]) { ell(c, s * R * 0.16, -R * 0.02, R * 0.13, R * 0.09); c.fill(); }
    c.fillRect(-R * 0.04, -R * 0.04, R * 0.08, R * 0.03);
    c.strokeStyle = 'rgba(230,240,255,0.6)'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 3; i++) { const x = -R * 0.4 + i * R * 0.4, ph = (t + i * 0.3) % 1; c.beginPath(); c.moveTo(x, -R * 0.45 - ph * R * 0.4); c.quadraticCurveTo(x + R * 0.1, -R * 0.6 - ph * R * 0.4, x, -R * 0.75 - ph * R * 0.4); c.stroke(); }
  } else if (id === 'brim') {
    c.fillStyle = '#2a0806'; ell(c, 0, R * 0.55, R * 0.8, R * 0.3); c.fill();
    for (const [x, h] of [[-0.45, 0.7], [0, 1.05], [0.45, 0.75]]) { c.fillStyle = '#e8341a'; flameShape(c, x * R, R * 0.35, R * 0.26, R * h); c.fill(); c.fillStyle = '#ff9a4a'; flameShape(c, x * R, R * 0.45, R * 0.13, R * h * 0.5); c.fill(); }
  } else if (id === 'coaster') {
    c.strokeStyle = '#d8dde6'; c.lineWidth = R * 0.12;
    c.beginPath(); c.moveTo(-R * 0.95, R * 0.7); c.lineTo(-R * 0.1, R * 0.7); c.arc(-R * 0.1, R * 0.15, R * 0.55, Math.PI / 2, Math.PI / 2 + TAU * 0.97, false); c.lineTo(R * 0.95, R * 0.7); c.stroke();
    c.strokeStyle = '#e83a50'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 6; i++) { const x = -R * 0.9 + i * R * 0.14; c.beginPath(); c.moveTo(x, R * 0.7); c.lineTo(x, R * 0.95); c.stroke(); }
    const a = Math.PI / 2 + ((t * 0.8) % 1) * TAU;
    seedIcon(c, -R * 0.1 + Math.cos(a) * R * 0.55, R * 0.15 + Math.sin(a) * R * 0.55, R * 0.22, a + Math.PI, '#5a3820', '#ffd36a');
  } else if (id === 'pick') {
    c.save(); c.rotate(-0.75);
    c.fillStyle = '#6b4a2e'; c.fillRect(-R * 0.08, -R * 0.4, R * 0.16, R * 1.3);
    c.fillStyle = '#3a2614'; c.fillRect(-R * 0.08, -R * 0.4, R * 0.05, R * 1.3);
    const px = R * 0.14, head = [[-5, 0], [-4, -1], [-3, -1], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -1], [4, -1], [5, 0]];
    for (const [i, j] of head) { c.fillStyle = '#5fe0d8'; c.fillRect(i * px - px / 2, -R * 0.42 + j * px, px, px); c.fillStyle = '#2aa8a0'; c.fillRect(i * px - px / 2, -R * 0.42 + j * px + px * 0.6, px, px * 0.4); }
    c.restore();
    sparkle(c, R * 0.6, -R * 0.6, R * 0.18, '#e8fffd');
  } else if (id === 'fuse') {
    c.fillStyle = '#1c1c22'; circle(c, -R * 0.1, R * 0.15, R * 0.62);
    c.fillStyle = 'rgba(255,255,255,0.25)'; ell(c, -R * 0.32, -R * 0.08, R * 0.16, R * 0.1, -0.6); c.fill();
    c.fillStyle = '#3a3a44'; c.fillRect(R * 0.12, -R * 0.55, R * 0.26, R * 0.22);
    c.strokeStyle = '#c9a36a'; c.lineWidth = R * 0.07; c.beginPath(); c.moveTo(R * 0.25, -R * 0.55); c.quadraticCurveTo(R * 0.4, -R * 0.85, R * 0.65, -R * 0.75); c.stroke();
    sparkle(c, R * 0.68, -R * 0.78, R * (0.2 + 0.08 * Math.sin(t * 14)), '#ffd36a');
  } else if (id === 'pact') {
    c.fillStyle = '#e8dcc0'; rrect(c, -R * 0.55, -R * 0.65, R * 1.1, R * 1.35, R * 0.08); c.fill();
    c.strokeStyle = 'rgba(80,60,40,0.6)'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-R * 0.38, -R * 0.4 + i * R * 0.22); c.lineTo(R * 0.38, -R * 0.4 + i * R * 0.22); c.stroke(); }
    c.fillStyle = '#b0121e'; circle(c, R * 0.25, R * 0.5, R * 0.16);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.25, -R * 0.62); c.quadraticCurveTo(s * R * 0.62, -R * 0.95, s * R * 0.48, -R * 1.0); c.quadraticCurveTo(s * R * 0.42, -R * 0.8, s * R * 0.08, -R * 0.65); c.closePath(); c.fillStyle = '#c3141e'; c.fill(); }
  } else if (id === 'dropper') {
    c.fillStyle = '#5a6070'; c.fillRect(-R * 0.55, -R * 0.95, R * 1.1, R * 0.5);
    c.fillStyle = '#2a2e38'; c.fillRect(-R * 0.18, -R * 0.45, R * 0.36, R * 0.18);
    c.fillStyle = '#f2c230'; c.fillRect(-R * 0.4, -R * 0.85, R * 0.8, R * 0.12);
    const ph = (t * 1.2) % 1;
    c.fillStyle = '#3a9bff'; c.fillRect(-R * 0.13, -R * 0.2 + ph * R * 0.6, R * 0.26, R * 0.26);
    c.fillStyle = '#3a3e48'; c.fillRect(-R * 0.95, R * 0.62, R * 1.9, R * 0.2);
    c.fillStyle = '#7c8292'; for (let i = 0; i < 6; i++) circle(c, -R * 0.8 + i * R * 0.32, R * 0.72, R * 0.06);
    c.fillStyle = '#e8483c'; c.fillRect(R * 0.35 - ((t * 0.8) % 1) * R * 0.2, R * 0.38, R * 0.24, R * 0.24);
  } else if (id === 'vamp') {
    c.fillStyle = '#ff8a2a'; circle(c, 0, 0, R * 0.82);
    c.fillStyle = '#f8e0b0'; circle(c, 0, 0, R * 0.68);
    c.fillStyle = '#b0182a'; circle(c, 0, 0, R * 0.62);
    c.strokeStyle = 'rgba(255,200,180,0.7)'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R * 0.6, Math.sin(a) * R * 0.6); c.stroke(); }
    c.fillStyle = '#8a0e1e'; const d = (t * 0.8) % 1; ell(c, R * 0.25, R * 0.85 + d * R * 0.2, R * 0.08, R * 0.12); c.fill();
  } else drawItemIcon3(c, id, R, t);
}

function drawHeartPickup(c, p, t) {
  const bob = Math.sin(t * 3 + p.ph) * 1.4;
  const a = p.t < 0.15 ? p.t / 0.15 : 1;
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, p.x + 1, p.y + 8, 8, 3); c.fill();
  c.translate(p.x, p.y - 2 + bob);
  if (p.amount >= 2) {
    const R = 8;
    const g = c.createRadialGradient(-R * 0.35, -R * 0.4, 1, 0, 0, R * 1.2);
    g.addColorStop(0, '#ff7a6e'); g.addColorStop(0.45, '#d92a40'); g.addColorStop(1, '#6e0b1d');
    applePath(c, R); c.fillStyle = g; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = 1.3; c.stroke();
    ell(c, -R * 0.45, -R * 0.35, R * 0.22, R * 0.13, -0.7); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
    c.strokeStyle = '#3d2414'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -R * 0.6); c.quadraticCurveTo(R * 0.05, -R * 0.9, R * 0.18, -R * 1.1); c.stroke();
    leafShape(c, R * 0.1, -R * 0.92, R * 0.7, -0.4);
  } else {
    const R = 8.5;
    c.rotate(-0.25);
    applePath(c, R); c.fillStyle = '#c9233a'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = 1.3; c.stroke();
    c.save(); c.scale(0.82, 0.8); applePath(c, R); c.fillStyle = '#f4e4c0'; c.fill(); c.restore();
    c.fillStyle = '#e3c98e'; ell(c, 0, R * 0.05, R * 0.26, R * 0.38); c.fill();
    c.fillStyle = '#3a2214';
    for (const s of [-1, 1]) { ell(c, s * R * 0.1, R * 0.06, R * 0.07, R * 0.14, s * 0.35); c.fill(); }
    c.strokeStyle = '#3d2414'; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -R * 0.55); c.lineTo(R * 0.1, -R * 0.95); c.stroke();
  }
  c.restore();
}

function drawItemPickup(c, p, t) {
  const rise = smooth(Math.min(1, p.t / 0.6));
  const y = p.y - 12 * rise + Math.sin(t * 2.4) * 2;
  c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, p.x, p.y + 10, 12, 4); c.fill();
  const rare = ITEMS[p.id] && ITEMS[p.id].rare;
  if (rare) {
    c.save(); c.translate(p.x, y); c.rotate(t * 0.5);
    for (let i = 0; i < 10; i++) {
      c.rotate(TAU / 10);
      c.fillStyle = i % 2 ? `rgba(210,123,255,${0.12 * rise})` : `rgba(255,190,80,${0.16 * rise})`;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-5, -34); c.lineTo(5, -34); c.closePath(); c.fill();
    }
    c.restore();
  }
  if (p.curseCost) {
    // a cursed offer: purple wisps curl up around it
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.5 + i / 3) % 1, a = i * 2.1 + t;
      c.fillStyle = `rgba(176,90,255,${0.35 * (1 - ph)})`; circle(c, p.x + Math.cos(a) * 12, p.y + 6 - ph * 30, 3 * (1 - ph) + 1);
    }
  }
  c.strokeStyle = p.curseCost ? `rgba(196,138,240,${0.5 + 0.3 * Math.sin(t * 4)})` : rare ? `rgba(255,170,60,${0.5 + 0.3 * Math.sin(t * 4)})` : `rgba(227,165,74,${0.25 + 0.2 * Math.sin(t * 4)})`; c.lineWidth = rare || p.curseCost ? 1.8 : 1.2;
  ell(c, p.x, p.y + 10, 17, 6); c.stroke();
  c.save(); c.translate(p.x, y); c.scale(0.4 + 0.6 * rise, 0.4 + 0.6 * rise); drawItemIcon(c, p.id, 26, t); c.restore();
}

/* ------------------------------------------------------------------ snakes */
function bodyDir(sn, k) {
  const pts = sn.pts; const a = k > 0 ? pts[k - 1] : sn; const b = pts[k];
  const dx = a.x - b.x, dy = a.y - b.y; const d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d];
}

function drawSnakeShadow(c, sn) {
  if (sn.cloak != null && sn.cloak < 0.5) return;
  const pts = sn.pts;
  if (sn.K.blocky) {
    for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) c.fillRect(p.x - p.r * 0.85 + 3, p.y - p.r * 0.85 + 4, p.r * 1.7, p.r * 1.7); }
    c.fillRect(sn.x - sn.headR + 3, sn.y - sn.headR + 4, sn.headR * 2, sn.headR * 2);
    return;
  }
  for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x + 2.5, p.y + 4.5, p.r); }
  if (!sn.burrowed) circle(c, sn.x + 2.5, sn.y + 4.5, sn.headR);
}

function blockSq(c, x, y, s, col, out) {
  const h = s / 2, b = s * 0.17;
  c.fillStyle = out; c.fillRect(x - h - 1.4, y - h - 1.4, s + 2.8, s + 2.8);
  c.fillStyle = col; c.fillRect(x - h, y - h, s, s);
  c.fillStyle = 'rgba(255,255,255,0.38)';
  c.beginPath(); c.moveTo(x - h, y - h); c.lineTo(x + h, y - h); c.lineTo(x + h - b, y - h + b); c.lineTo(x - h + b, y - h + b); c.lineTo(x - h + b, y + h - b); c.lineTo(x - h, y + h); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath(); c.moveTo(x + h, y + h); c.lineTo(x - h, y + h); c.lineTo(x - h + b, y + h - b); c.lineTo(x + h - b, y + h - b); c.lineTo(x + h - b, y - h + b); c.lineTo(x + h, y - h); c.closePath(); c.fill();
}
function drawBlockWorm(c, sn, t) {
  const pts = sn.pts, n = pts.length, K = sn.K;
  const fusing = sn.kind === 'creeper' && sn.mode === 'fuse';
  const flash = sn.flash > 0 || (fusing && Math.floor(sn.mt * (6 + sn.mt * 10)) % 2 === 0);
  const sw = fusing ? 1 + sn.swell * 0.28 : 1;
  c.save();
  if (sn.fade < 1) c.globalAlpha = Math.max(0.05, sn.fade);
  for (let k = n - 1; k >= 0; k--) {
    const p = pts[k]; if (p.hid) continue;
    const col = sn.champ ? (k % 2 ? '#e0b040' : '#f2cd5a') : K.palette ? K.palette[k % K.palette.length] : TETRO_COL[TETRO_ORDER[Math.floor(k / 4) % 7]];
    blockSq(c, p.x, p.y, p.r * 1.72 * sw, flash ? '#ffffff' : col, K.outline);
    if (sn.kind === 'ender' && k % 3 === 1) { c.fillStyle = 'rgba(180,90,255,0.35)'; c.fillRect(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.25, p.r * 0.25); }
  }
  const tint = sn.slow > 0 ? 'rgba(150,210,255,0.3)' : sn.burn > 0 ? 'rgba(255,120,40,0.22)' : sn.poison > 0 ? 'rgba(120,200,80,0.18)' : null;
  if (tint) { c.fillStyle = tint; for (const p of pts) if (!p.hid) c.fillRect(p.x - p.r * 0.86, p.y - p.r * 0.86, p.r * 1.72, p.r * 1.72); }
  if (sn.burrowed) { c.restore(); return; }
  const H = sn.headR * sw, a = Math.round(sn.drawAng / (Math.PI / 2)) * (Math.PI / 2);
  c.translate(sn.x, sn.y); c.rotate(a);
  blockSq(c, 0, 0, H * 1.9, flash ? '#ffffff' : sn.champ ? '#ffd84a' : K.headCol || '#a7afc2', K.outline);
  if (sn.kind === 'creeper') {
    // the famous sad face, seen from above, facing forward
    c.fillStyle = '#0d1a08'; const u = H * 0.19;
    c.fillRect(H * 0.05, -u * 2.2, u * 1.6, u * 1.6); c.fillRect(H * 0.05, u * 0.6, u * 1.6, u * 1.6);
    c.fillRect(H * 0.55, -u * 0.8, u * 1.4, u * 1.6); c.fillRect(H * 0.75, -u * 1.6, u * 1.1, u * 3.2);
  } else if (sn.kind === 'ender') {
    const o = 0.3 + (sn.mouth || 0) * 0.3;
    c.fillStyle = '#05040a'; c.fillRect(H * 0.5, -H * o * 1.4, H * 0.45, H * o * 2.8);
    c.fillStyle = '#d9c8ff';
    for (let i = 0; i < 4; i++) c.fillRect(H * 0.5, -H * o * 1.4 + i * H * o * 0.7, H * 0.14, H * o * 0.35);
  } else {
    // a pixel jaw full of square teeth
    const o = 0.35 + (sn.mouth || 0) * 0.3;
    c.fillStyle = '#0b0f1c'; c.fillRect(H * 0.42, -H * o * 1.5, H * 0.52, H * o * 3);
    c.fillStyle = '#f4f1e6';
    for (let i = 0; i < 3; i++) { c.fillRect(H * 0.42, -H * o * 1.5 + i * H * o, H * 0.18, H * o * 0.6); c.fillRect(H * 0.76, -H * o * 1.5 + i * H * o + H * o * 0.4, H * 0.18, H * o * 0.6); }
  }
  c.restore();
}

function drawSnake(c, sn, t) {
  if (V9_BODY[sn.kind]) { V9_BODY[sn.kind](c, sn, t); drawSnakeExtras(c, sn, t); return; }
  if (sn.K.blocky) { drawBlockWorm(c, sn, t); drawSnakeExtras(c, sn, t); return; }
  const fade9 = sn.cloak != null && sn.cloak < 0.999;
  if (fade9) { c.save(); c.globalAlpha *= Math.max(0.05, sn.cloak); }
  const K = sn.K, pts = sn.pts, n = pts.length;
  const flash = sn.flash > 0;
  const ow = sn.isBoss ? 2.6 : 1.8;
  c.fillStyle = K.outline;
  for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x, p.y, p.r + ow); }
  for (let k = n - 1; k >= 0; k--) {
    const p = pts[k]; if (p.hid) continue;
    c.fillStyle = k & 1 ? K.body2 : K.body;
    circle(c, p.x, p.y, p.r);
  }
  c.fillStyle = K.hi;
  for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x - p.r * 0.22, p.y - p.r * 0.32, p.r * 0.48); }
  decorateSnake(c, sn, t);
  if (sn.slow > 0) {
    c.fillStyle = 'rgba(150,210,255,0.24)';
    for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x, p.y, p.r); }
  }
  if (sn.burn > 0) {
    c.fillStyle = 'rgba(255,120,40,0.16)';
    for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x, p.y, p.r); }
  }
  if (sn.poison > 0) {
    c.fillStyle = 'rgba(120,200,80,0.08)';
    for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x, p.y, p.r); }
  }
  if (flash) {
    c.fillStyle = 'rgba(255,245,235,0.55)';
    for (let k = n - 1; k >= 0; k--) { const p = pts[k]; if (!p.hid) circle(c, p.x, p.y, p.r); }
  }
  if (!sn.burrowed) {
    drawSnakeHead(c, sn, t, false);
    if (flash) { c.fillStyle = 'rgba(255,245,235,0.55)'; circle(c, sn.x, sn.y, sn.headR * 1.02); }
  }
  drawSnakeExtras(c, sn, t);
  if (fade9) c.restore();
}

function decorateSnake(c, sn, t) {
  const K = sn.K, pts = sn.pts, n = pts.length, kind = sn.kind;
  if (kind === 'grub' || kind === 'mother' || kind === 'lamprey' || kind === 'queen') {
    c.strokeStyle = K.ring; c.lineWidth = sn.isBoss ? 2 : 1.2;
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx; const r = p.r * 0.86;
      c.beginPath();
      c.moveTo(p.x + nx * r - dx * r * 0.2, p.y + ny * r - dy * r * 0.2);
      c.quadraticCurveTo(p.x + dx * r * 0.25, p.y + dy * r * 0.25, p.x - nx * r - dx * r * 0.2, p.y - ny * r - dy * r * 0.2);
      c.stroke();
    }
  }
  if (kind === 'lamprey' || kind === 'queen') {
    c.fillStyle = K.gill;
    const counts = [3, 2, 2];
    for (let k = 0; k < Math.min(3, n); k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx;
      for (let j = 0; j < counts[k]; j++) {
        const off = (j - (counts[k] - 1) / 2) * p.r * 0.42;
        for (const s of [-1, 1]) circle(c, p.x + nx * p.r * 0.6 * s + dx * off, p.y + ny * p.r * 0.6 * s + dy * off, p.r * 0.1);
      }
    }
  }
  if (kind === 'hood') {
    c.fillStyle = K.scale;
    for (let k = 1; k < n; k += 2) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k);
      c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx));
      c.beginPath(); c.moveTo(p.r * 0.55, 0); c.lineTo(0, p.r * 0.34); c.lineTo(-p.r * 0.55, 0); c.lineTo(0, -p.r * 0.34); c.closePath(); c.fill();
      c.restore();
    }
  }
  if (kind === 'long' || kind === 'ouro') {
    const every = K.bodyEyeEvery;
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k);
      if (k % 2 === 0) {
        c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx));
        c.fillStyle = K.saddle;
        c.beginPath(); c.moveTo(p.r * 0.72, 0); c.quadraticCurveTo(0, p.r * 0.62, -p.r * 0.72, 0); c.quadraticCurveTo(0, -p.r * 0.62, p.r * 0.72, 0); c.fill();
        c.restore();
      }
      if (k % every === every - 2 && k > 0) {
        const nx = -dy, ny = dx; const side = (Math.floor(k / every) % 2) ? 1 : -1;
        const ex = p.x + nx * p.r * 0.42 * side, ey = p.y + ny * p.r * 0.42 * side;
        c.fillStyle = '#140c0a';
        c.save(); c.translate(ex, ey); c.rotate(Math.atan2(dy, dx));
        c.beginPath(); c.moveTo(p.r * 0.36, 0); c.quadraticCurveTo(0, p.r * 0.26, -p.r * 0.36, 0); c.quadraticCurveTo(0, -p.r * 0.26, p.r * 0.36, 0); c.fill();
        c.restore();
      }
    }
  }
  if (kind === 'fuel') {
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx; const r = p.r * 0.92;
      if (k % 2 === 0) {
        c.strokeStyle = K.band; c.lineWidth = p.r * 0.42;
        c.beginPath(); c.moveTo(p.x + nx * r, p.y + ny * r); c.quadraticCurveTo(p.x + dx * r * 0.3, p.y + dy * r * 0.3, p.x - nx * r, p.y - ny * r); c.stroke();
      }
      if (k === n - 1) { c.fillStyle = '#1a1a1a'; circle(c, p.x - dx * p.r * 0.5, p.y - dy * p.r * 0.5, p.r * 0.5); }
    }
  }
  if (kind === 'rocket') {
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx;
      c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(dy, dx));
      if (k % 2 === 0) {
        c.fillStyle = K.stripe;
        for (const s of [-1, 1]) { rrect(c, -p.r * 0.45, s * p.r * 1.02 - p.r * 0.2, p.r * 0.9, p.r * 0.4, p.r * 0.15); c.fill(); }
      }
      c.fillStyle = 'rgba(29,29,36,0.75)'; c.fillRect(-p.r * 0.55, -p.r * 0.13, p.r * 1.1, p.r * 0.26);
      c.restore();
      if (k === n - 1) { c.fillStyle = '#2a2a33'; circle(c, p.x - dx * p.r * 0.6, p.y - dy * p.r * 0.6, p.r * 0.55); c.fillStyle = sn.mode === 'boost' ? '#ffcf5a' : '#5a3a20'; circle(c, p.x - dx * p.r * 0.6, p.y - dy * p.r * 0.6, p.r * 0.32); }
      void nx; void ny;
    }
  }
  if (kind === 'rotter') {
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx;
      c.fillStyle = K.spot;
      circle(c, p.x + nx * p.r * 0.35 * (k % 2 ? 1 : -1), p.y + ny * p.r * 0.35 * (k % 2 ? 1 : -1), p.r * 0.3);
      if (k % 3 === 1) { c.fillStyle = 'rgba(230,220,180,0.7)'; ell(c, p.x - nx * p.r * 0.4, p.y - ny * p.r * 0.4, p.r * 0.16, p.r * 0.09, Math.atan2(dy, dx)); c.fill(); }
    }
  }
  if (kind === 'mother') {
    for (let k = 1; k < n; k += 3) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx; const side = (k % 2) ? 1 : -1;
      const sw = (sn.swell || 0);
      const r = p.r * (0.48 + sw * 0.28 + 0.05 * Math.sin(t * 3 + k));
      const x = p.x + nx * p.r * 0.55 * side, y = p.y + ny * p.r * 0.55 * side;
      c.fillStyle = K.outline; circle(c, x, y, r + 1.6);
      c.fillStyle = K.sac; circle(c, x, y, r);
      c.fillStyle = 'rgba(255,255,230,0.45)'; circle(c, x - r * 0.3, y - r * 0.35, r * 0.32);
      c.strokeStyle = 'rgba(120,70,40,0.5)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - r * 0.6, y + r * 0.1); c.quadraticCurveTo(x, y + r * 0.4, x + r * 0.5, y - r * 0.2); c.stroke();
      if (sw > 0.2) { c.fillStyle = `rgba(40,20,10,${sw * 0.6})`; circle(c, x + r * 0.15, y + r * 0.1, r * 0.25 * sw); }
    }
  }
  decorateSnake2(c, sn, t);
  decorateSnake3(c, sn, t);
  decorateSnake9(c, sn, t);
}

function drawSnakeHead(c, sn, t, flash) {
  const K = sn.K, H = sn.headR;
  const out = flash ? '#ffffff' : K.outline, fill = flash ? '#ffffff' : K.body;
  c.save(); c.translate(sn.x, sn.y); c.rotate(sn.drawAng);
  if (sn.kind === 'grub' || sn.kind === 'mother' || sn.kind === 'splitter' || sn.kind === 'splitling') headGrub(c, sn, H, out, fill, t);
  else if (sn.kind === 'sniper') headSniper(c, sn, H, out, fill, t);
  else if (sn.kind === 'hood') headHood(c, sn, H, out, fill, t, flash);
  else if (sn.kind === 'lamprey' || sn.kind === 'queen') headLamprey(c, sn, H, out, fill, t);
  else if (sn.kind === 'rotter') headRotter(c, sn, H, out, fill, t);
  else if (sn.kind === 'rocket') headRocket(c, sn, H, out, fill, t);
  else if (sn.kind === 'fuel') headFuel(c, sn, H, out, fill, t);
  else if (SHOP_HEAD[sn.kind]) headShop(c, sn, H, out, fill, t);
  else if (SUIT_HEAD[sn.kind]) headSuit(c, sn, H, out, fill, t);
  else if (V9_HEADS[sn.kind]) V9_HEADS[sn.kind](c, sn, H, out, fill, t, flash);
  else headLong(c, sn, H, out, fill, t);
  c.restore();
}

function headGrub(c, sn, H, out, fill, t) {
  const open = 0.35 + 0.3 * Math.sin(t * 10 + sn.blinkSeed) + (sn.lunge > 0 || sn.mode === 'charge' ? 0.6 : 0);
  c.strokeStyle = out; c.lineWidth = H * 0.24; c.lineCap = 'round';
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(H * 0.55, s * H * 0.35);
    c.quadraticCurveTo(H * 1.3, s * H * (0.55 + open * 0.3), H * 1.38, s * H * (0.08 + open * 0.16)); c.stroke();
  }
  c.strokeStyle = '#8a6c58'; c.lineWidth = H * 0.1;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(H * 0.6, s * H * 0.35);
    c.quadraticCurveTo(H * 1.28, s * H * (0.55 + open * 0.3), H * 1.35, s * H * (0.1 + open * 0.16)); c.stroke();
  }
  ell(c, 0, 0, H * 1.08 + 1.8, H * 0.96 + 1.8); c.fillStyle = out; c.fill();
  ell(c, 0, 0, H * 1.08, H * 0.96); c.fillStyle = fill; c.fill();
  ell(c, -H * 0.3, -H * 0.35, H * 0.5, H * 0.3); c.fillStyle = sn.K.hi; c.fill();
  ell(c, H * 0.05, 0, H * 0.66, H * 0.66); c.fillStyle = '#1a0e0c'; c.fill();
  c.fillStyle = '#1a0e0c'; ell(c, H * 0.95, 0, H * 0.18, H * 0.28); c.fill();
}

// the Fuel Worm's head is a pump nozzle with teeth
function headFuel(c, sn, H, out, fill, t) {
  const K = sn.K, hot = sn.fuse > 0;
  rrect(c, -H * 1.05 - 1.8, -H * 0.85 - 1.8, H * 1.75 + 3.6, H * 1.7 + 3.6, H * 0.45); c.fillStyle = out; c.fill();
  rrect(c, -H * 1.05, -H * 0.85, H * 1.75, H * 1.7, H * 0.4); c.fillStyle = hot ? '#c8402a' : fill; c.fill();
  c.fillStyle = K.band; c.fillRect(-H * 0.5, -H * 0.85, H * 0.35, H * 1.7);
  c.fillStyle = K.hi; rrect(c, -H * 0.95, -H * 0.72, H * 0.9, H * 0.3, H * 0.12); c.fill();
  // spout
  const o = 0.2 + (sn.mouth || 0) * 0.25;
  rrect(c, H * 0.6, -H * 0.36 - 1.5, H * 0.95 + 1.5, H * 0.72 + 3, H * 0.15); c.fillStyle = out; c.fill();
  rrect(c, H * 0.6, -H * 0.36, H * 0.95, H * 0.72, H * 0.12); c.fillStyle = '#2a2a30'; c.fill();
  c.fillStyle = '#0c0606'; ell(c, H * 1.48, 0, H * 0.12, H * 0.3); c.fill();
  c.fillStyle = '#f4ead8';
  for (let i = 0; i < 3; i++) { const y = -H * 0.28 + i * H * 0.2; c.beginPath(); c.moveTo(H * 1.55, y); c.lineTo(H * (1.55 - o), y + H * 0.07); c.lineTo(H * 1.55, y + H * 0.14); c.closePath(); c.fill(); }
  // trigger guard
  c.strokeStyle = K.band; c.lineWidth = H * 0.16;
  c.beginPath(); c.moveTo(H * 0.2, H * 0.85); c.quadraticCurveTo(H * 0.55, H * 1.25, H * 0.75, H * 0.4); c.stroke();
}

// the Boost Worm's head is a little car with a mouth in the grille
function headRocket(c, sn, H, out, fill, t) {
  const K = sn.K;
  c.fillStyle = '#16161c';
  for (const sx of [-0.62, 0.62]) for (const sy of [-1, 1]) { rrect(c, sx * H - H * 0.3, sy * H * 0.88 - H * 0.2, H * 0.6, H * 0.4, H * 0.12); c.fill(); }
  rrect(c, -H * 1.1 - 1.8, -H * 0.86 - 1.8, H * 2.25 + 3.6, H * 1.72 + 3.6, H * 0.5); c.fillStyle = out; c.fill();
  rrect(c, -H * 1.1, -H * 0.86, H * 2.25, H * 1.72, H * 0.45); c.fillStyle = fill; c.fill();
  c.fillStyle = K.hi; rrect(c, -H * 0.9, -H * 0.7, H * 1.2, H * 0.35, H * 0.15); c.fill();
  c.fillStyle = '#1c2430';
  c.beginPath(); c.moveTo(H * 0.05, -H * 0.62); c.lineTo(H * 0.42, -H * 0.5); c.lineTo(H * 0.42, H * 0.5); c.lineTo(H * 0.05, H * 0.62); c.closePath(); c.fill();
  c.fillStyle = 'rgba(160,200,255,0.35)'; c.fillRect(H * 0.12, -H * 0.42, H * 0.07, H * 0.5);
  c.fillStyle = K.stripe; c.fillRect(-H * 1.05, -H * 0.12, H * 1.05, H * 0.24);
  c.fillStyle = '#2a2a33'; rrect(c, -H * 1.22, -H * 0.82, H * 0.22, H * 1.64, H * 0.08); c.fill();
  const o = 0.25 + (sn.mouth || 0) * 0.35;
  c.fillStyle = '#120806'; rrect(c, H * 0.72, -H * 0.5, H * 0.38, H, H * 0.12); c.fill();
  c.fillStyle = '#f4ead8';
  for (let i = 0; i < 4; i++) { const y = -H * 0.42 + i * H * 0.28; c.beginPath(); c.moveTo(H * 1.08, y); c.lineTo(H * (1.08 - o), y + H * 0.1); c.lineTo(H * 1.08, y + H * 0.2); c.closePath(); c.fill(); }
}

function headRotter(c, sn, H, out, fill, t) {
  const K = sn.K, o = sn.mouth || 0;
  ell(c, 0, 0, H * 1.12 + 2, H * 1.0 + 2); c.fillStyle = out; c.fill();
  ell(c, 0, 0, H * 1.12, H * 1.0); c.fillStyle = fill; c.fill();
  c.fillStyle = K.hi; ell(c, -H * 0.3, -H * 0.4, H * 0.5, H * 0.25); c.fill();
  c.fillStyle = K.spot;
  for (const [x, y, r] of [[-0.45, 0.35, 0.18], [-0.1, -0.55, 0.13], [0.2, 0.55, 0.11]]) circle(c, x * H, y * H, r * H);
  const mw = H * (0.55 + o * 0.15), mh = H * (0.22 + o * 0.35);
  ell(c, H * 0.62, 0, mh + 1.5, mw + 1.5); c.fillStyle = out; c.fill();
  ell(c, H * 0.62, 0, mh, mw); c.fillStyle = '#240c08'; c.fill();
  c.fillStyle = '#d9cf9a';
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4, x = H * 0.62 + Math.cos(a) * mh, y = Math.sin(a) * mw;
    c.beginPath(); c.moveTo(x, y - 1.6); c.lineTo(x - mh * 0.45, y); c.lineTo(x, y + 1.6); c.closePath(); c.fill();
  }
  const drip = (t * 0.8 + sn.blinkSeed) % 1;
  c.fillStyle = 'rgba(190,200,90,0.7)'; ell(c, H * 0.95, H * 0.2, 1.4, 2 + drip * 3); c.fill();
}
function hoodEyes(sn) {
  const H = sn.headR, f = sn.hood || 0;
  const hx = -H * 0.5, rx = H * (0.75 + 0.2 * f), ry = H * (1.2 + 0.85 * f);
  const res = [];
  for (let i = 0; i < 6; i++) {
    const a = lerp(-1.15, 1.15, i / 5);
    res.push({ x: hx - Math.cos(a) * rx * 0.3, y: Math.sin(a) * ry * 0.66, r: H * (i === 2 || i === 3 ? 0.17 : 0.13) });
  }
  return res;
}
function headHood(c, sn, H, out, fill, t, flash) {
  const K = sn.K, f = sn.hood || 0;
  const hx = -H * 0.5, rx = H * (0.75 + 0.2 * f), ry = H * (1.2 + 0.85 * f);
  ell(c, hx, 0, rx + 2, ry + 2); c.fillStyle = out; c.fill();
  ell(c, hx, 0, rx, ry); c.fillStyle = flash ? '#ffffff' : K.hoodCol; c.fill();
  if (!flash) {
    c.strokeStyle = K.hoodRim; c.lineWidth = 1.4; ell(c, hx, 0, rx * 0.84, ry * 0.86); c.stroke();
    c.fillStyle = '#120b16';
    for (const e of hoodEyes(sn)) { circle(c, e.x, e.y, e.r * 1.35); }
  }
  const tri = (g) => {
    c.beginPath(); c.moveTo(H * 1.25 + g, 0);
    c.quadraticCurveTo(H * 0.6, -H * 0.86 - g, -H * 0.3, -H * 0.62 - g);
    c.quadraticCurveTo(-H * 0.62 - g, 0, -H * 0.3, H * 0.62 + g);
    c.quadraticCurveTo(H * 0.6, H * 0.86 + g, H * 1.25 + g, 0); c.closePath();
  };
  tri(2); c.fillStyle = out; c.fill();
  tri(0); c.fillStyle = fill; c.fill();
  if (!flash) {
    c.fillStyle = K.scale; c.beginPath(); c.moveTo(H * 0.55, 0); c.lineTo(0, H * 0.26); c.lineTo(-H * 0.3, 0); c.lineTo(0, -H * 0.26); c.closePath(); c.fill();
  }
  if (sn.mouth > 0.1 || f > 0.6) {
    c.fillStyle = '#20060c'; c.beginPath(); c.moveTo(H * 1.2, 0); c.lineTo(H * 0.75, -H * 0.22); c.lineTo(H * 0.75, H * 0.22); c.closePath(); c.fill();
    c.fillStyle = '#efe6d6';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(H * 0.86, s * H * 0.22); c.lineTo(H * 1.3, s * H * 0.1); c.lineTo(H * 0.92, s * H * 0.06); c.closePath(); c.fill(); }
  }
}

function headLamprey(c, sn, H, out, fill, t) {
  const K = sn.K;
  c.fillStyle = out; circle(c, 0, 0, H + 2);
  c.fillStyle = fill; circle(c, 0, 0, H);
  c.fillStyle = K.hi; ell(c, -H * 0.3, -H * 0.35, H * 0.45, H * 0.28); c.fill();
  c.strokeStyle = K.ring; c.lineWidth = sn.isBoss ? 2 : 1.2;
  for (const r of [0.55, 0.8]) { c.beginPath(); c.arc(-H * 0.2, 0, H * r, 1.9, 4.4); c.stroke(); }
  const o = sn.mouth || 0;
  const mx = H * 0.52, mrx = H * (0.42 + o * 0.1), mry = H * (0.8 + o * 0.14);
  ell(c, mx, 0, mrx + 1.6, mry + 1.6); c.fillStyle = out; c.fill();
  ell(c, mx, 0, mrx, mry); c.fillStyle = '#4a0d18'; c.fill();
  ell(c, mx + mrx * 0.15, 0, mrx * 0.42, mry * 0.42); c.fillStyle = '#12030a'; c.fill();
  c.fillStyle = '#efe0c6';
  const teeth = (rx, ry, inner, nT) => {
    for (let i = 0; i < nT; i++) {
      const a = (i / nT) * TAU;
      c.beginPath();
      c.moveTo(mx + Math.cos(a - 0.15) * rx, Math.sin(a - 0.15) * ry);
      c.lineTo(mx + Math.cos(a) * rx * inner, Math.sin(a) * ry * inner);
      c.lineTo(mx + Math.cos(a + 0.15) * rx, Math.sin(a + 0.15) * ry);
      c.closePath(); c.fill();
    }
  };
  teeth(mrx, mry, 0.6, 12);
  teeth(mrx * 0.62, mry * 0.62, 0.62, 9);
}

function grinPoint(H, u, o) {
  const x0 = H * 0.35, y0 = -H * 0.82, x1 = H * 1.2 + o * H * 0.12, y1 = 0, x2 = H * 0.35, y2 = H * 0.82;
  const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
  return [a * x0 + b * x1 + d * x2, a * y0 + b * y1 + d * y2];
}
function headLong(c, sn, H, out, fill, t) {
  const K = sn.K;
  const path = (g) => {
    c.beginPath(); c.moveTo(H * 1.22 + g, 0);
    c.bezierCurveTo(H * 1.16 + g, -H * 0.86 - g, H * 0.1, -H * 1.06 - g, -H * 0.72 - g, -H * 0.6 - g * 0.5);
    c.quadraticCurveTo(-H * 1.02 - g, 0, -H * 0.72 - g, H * 0.6 + g * 0.5);
    c.bezierCurveTo(H * 0.1, H * 1.06 + g, H * 1.16 + g, H * 0.86 + g, H * 1.22 + g, 0);
    c.closePath();
  };
  path(2.2); c.fillStyle = out; c.fill();
  path(0); c.fillStyle = fill; c.fill();
  if (fill !== '#ffffff') {
    c.fillStyle = K.hi; ell(c, -H * 0.2, -H * 0.42, H * 0.55, H * 0.25, 0.1); c.fill();
    c.fillStyle = K.saddle;
    c.beginPath(); c.moveTo(H * 0.18, 0); c.quadraticCurveTo(-H * 0.3, -H * 0.42, -H * 0.8, 0); c.quadraticCurveTo(-H * 0.3, H * 0.42, H * 0.18, 0); c.fill();
  }
  const o = sn.mouth || 0;
  c.strokeStyle = '#120a09'; c.lineWidth = H * (0.11 + o * 0.08); c.lineCap = 'round';
  c.beginPath(); const p0 = grinPoint(H, 0, o); c.moveTo(p0[0], p0[1]);
  for (let i = 1; i <= 12; i++) { const p = grinPoint(H, i / 12, o); c.lineTo(p[0], p[1]); }
  c.stroke();
  c.fillStyle = '#fbf6ea';
  for (let i = 1; i < 12; i++) {
    const u = i / 12; const [x, y] = grinPoint(H, u, o);
    const [x2, y2] = grinPoint(H, Math.min(1, u + 0.02), o);
    const tx = x2 - x, ty = y2 - y, tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl, ny = tx / tl;
    const len = H * (0.16 + 0.06 * Math.sin(i * 1.7));
    c.beginPath(); c.moveTo(x - tx / tl * H * 0.06, y - ty / tl * H * 0.06);
    c.lineTo(x - nx * len, y - ny * len); c.lineTo(x + tx / tl * H * 0.06, y + ty / tl * H * 0.06); c.closePath(); c.fill();
  }
  c.fillStyle = '#2a1a16'; circle(c, H * 0.98, -H * 0.17, H * 0.055); circle(c, H * 0.98, H * 0.17, H * 0.055);
  c.fillStyle = '#140c0a';
  for (const s of [-1, 1]) { ell(c, H * 0.3, s * H * 0.48, H * 0.2, H * 0.14, s * 0.3); c.fill(); }
}

function eyeball(c, x, y, R, open, lookAng, iris, slit) {
  if (open <= 0.03) return;
  c.save(); c.translate(x, y);
  ell(c, 0, 0, R + 1.1, (R + 1.1) * open); c.fillStyle = '#120808'; c.fill();
  ell(c, 0, 0, R, R * open); c.fillStyle = '#ece4d6'; c.fill();
  c.save(); ell(c, 0, 0, R, R * open); c.clip();
  const ox = Math.cos(lookAng) * R * 0.3, oy = Math.sin(lookAng) * R * 0.3;
  c.fillStyle = iris; circle(c, ox, oy, R * 0.58);
  c.fillStyle = '#080404';
  if (slit) { ell(c, ox, oy, R * 0.13, R * 0.5); c.fill(); } else circle(c, ox, oy, R * 0.26);
  c.fillStyle = 'rgba(255,255,255,0.85)'; circle(c, ox - R * 0.22, oy - R * 0.24, R * 0.13);
  c.restore();
  c.restore();
}

// Eyes and other things that shine through the dark. Drawn after the lighting pass.
function drawSnakeGlow(c, sn, t, P) {
  if (sn.champ && !sn.burrowed && sn.alive) {
    c.globalCompositeOperation = 'lighter';
    glowDot(c, sn.x, sn.y, sn.headR * 2.6, '#ffc14a', 0.22 + 0.08 * Math.sin(t * 5));
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = `rgba(255,200,90,${0.5 + 0.3 * Math.sin(t * 5)})`; c.lineWidth = 1.5;
    c.beginPath(); c.arc(sn.x, sn.y, sn.headR + 6, 0, TAU); c.stroke();
  }
  if (sn.burrowed) {
    if (sn.mode === 'warn') {
      const k = clamp(sn.mt / 0.6, 0, 1);
      c.strokeStyle = `rgba(255,90,60,${0.25 + 0.5 * k})`; c.lineWidth = 1.5 + k;
      c.setLineDash([5, 4]); c.beginPath(); c.arc(sn.x, sn.y, sn.headR + 18 + (1 - k) * 8, 0, TAU); c.stroke(); c.setLineDash([]);
    }
    return;
  }
  const K = sn.K, H = sn.headR;
  const open = sn.eyeOpen * (sn.blinkT > 0 ? 0.08 : 1);
  const cs = Math.cos(sn.drawAng), sns = Math.sin(sn.drawAng);
  const loc = (lx, ly) => [sn.x + lx * cs - ly * sns, sn.y + lx * sns + ly * cs];
  const lookAt = (x, y) => (P ? Math.atan2(P.y - y, P.x - x) : sn.drawAng);
  c.globalCompositeOperation = 'lighter';
  if (sn.kind === 'grub' || sn.kind === 'mother') {
    const [x, y] = loc(H * 0.05, 0);
    glowDot(c, x, y, H * 2.2, K.eye, 0.35 * open);
    c.globalCompositeOperation = 'source-over';
    eyeball(c, x, y, H * 0.6, open, lookAt(x, y), '#c81f2a', false);
  } else if (sn.kind === 'hood') {
    const f = sn.hood || 0;
    const br = 0.55 + 0.45 * f;
    const eyes = hoodEyes(sn);
    for (const e of eyes) { const [x, y] = loc(e.x, e.y); glowDot(c, x, y, e.r * 4.5, K.eye, 0.32 * br * open); }
    c.globalCompositeOperation = 'source-over';
    for (const e of eyes) {
      const [x, y] = loc(e.x, e.y);
      c.fillStyle = rgba(K.eye, 0.55 + 0.45 * br); circle(c, x, y, e.r * open);
      c.fillStyle = '#1a0d00'; ell(c, x, y, e.r * 0.25, e.r * 0.7 * open, sn.drawAng); c.fill();
    }
  } else if (sn.kind === 'long' || sn.kind === 'ouro') {
    for (const s of [-1, 1]) { const [x, y] = loc(H * 0.3, s * H * 0.48); glowDot(c, x, y, H * 0.9, '#ff2a2a', 0.45 * open); }
    const every = K.bodyEyeEvery;
    const eyes = [];
    for (let k = every - 2; k < sn.pts.length; k += every) {
      if (k <= 0) continue;
      const p = sn.pts[k]; if (!p || p.hid) continue;
      const ph = Math.sin(t * 0.8 + k * 1.9 + sn.blinkSeed);
      let eo = smooth((ph + 0.2) / 0.5) * sn.eyeOpen;
      const charging = sn.charge && sn.charge.k === k;
      if (charging) eo = 1;
      if (eo < 0.05) continue;
      const [dx, dy] = bodyDir(sn, k); const nx = -dy, ny = dx; const side = (Math.floor(k / every) % 2) ? 1 : -1;
      const ex = p.x + nx * p.r * 0.42 * side, ey = p.y + ny * p.r * 0.42 * side;
      const er = p.r * 0.34 * (charging ? 1 + sn.charge.t * 0.9 : 1);
      glowDot(c, ex, ey, er * (charging ? 5 : 3.2), charging ? '#ff5a2a' : K.eye, (charging ? 0.6 : 0.3) * eo);
      eyes.push([ex, ey, er, eo]);
    }
    c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) {
      const [x, y] = loc(H * 0.3, s * H * 0.48);
      c.fillStyle = '#ff3b30'; ell(c, x, y, H * 0.15, H * 0.11 * open, sn.drawAng + s * 0.3); c.fill();
      c.fillStyle = '#100404'; ell(c, x, y, H * 0.035, H * 0.1 * open, sn.drawAng); c.fill();
    }
    for (const [ex, ey, er, eo] of eyes) eyeball(c, ex, ey, er, eo, lookAt(ex, ey), K.eye, true);
  } else if (sn.kind === 'rotter') {
    for (const s of [-1, 1]) { const [x, y] = loc(H * 0.15, s * H * 0.55); glowDot(c, x, y, H * 1.1, K.eye, 0.35 * open); }
    c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) {
      const [x, y] = loc(H * 0.15, s * H * 0.55);
      c.fillStyle = '#100c02'; circle(c, x, y, H * 0.24);
      c.fillStyle = K.eye; ell(c, x, y, H * 0.19, H * 0.19 * open); c.fill();
      c.fillStyle = '#100c02'; ell(c, x, y, H * 0.05, H * 0.15 * open, sn.drawAng); c.fill();
    }
  } else if (sn.kind === 'ender') {
    const a = Math.round(sn.drawAng / (Math.PI / 2)) * (Math.PI / 2), ca = Math.cos(a), sa = Math.sin(a);
    const at = (lx, ly) => [sn.x + lx * ca - ly * sa, sn.y + lx * sa + ly * ca];
    for (const s of [-1, 1]) { const [x, y] = at(H * 0.05, s * H * 0.48); glowDot(c, x, y, H * 1.4, '#c86bff', 0.55 * sn.fade * open); }
    c.globalCompositeOperation = 'source-over';
    c.save(); c.globalAlpha = Math.max(0.05, sn.fade);
    for (const s of [-1, 1]) {
      const [x, y] = at(H * 0.05, s * H * 0.48);
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = '#e0a8ff'; c.fillRect(-H * 0.32, -H * 0.1 * open, H * 0.64, H * 0.2 * open);
      c.fillStyle = '#b44dff'; c.fillRect(-H * 0.12, -H * 0.1 * open, H * 0.24, H * 0.2 * open);
      c.restore();
    }
    c.restore();
  } else if (sn.kind === 'fuel') {
    for (const s of [-1, 1]) { const [x, y] = loc(H * 0.1, s * H * 0.55); glowDot(c, x, y, H * 1.1, sn.fuse > 0 ? '#ff4a2a' : K.eye, 0.45 * open); }
    if (sn.fuse > 0) glowDot(c, sn.x, sn.y, H * 4, '#ff6a2a', 0.25 + 0.25 * Math.sin(sn.fuse * 40));
    c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) {
      const [x, y] = loc(H * 0.1, s * H * 0.55);
      c.fillStyle = '#100c02'; circle(c, x, y, H * 0.22);
      c.fillStyle = sn.fuse > 0 ? '#ff5a3a' : K.eye; ell(c, x, y, H * 0.17, H * 0.17 * open); c.fill();
      c.fillStyle = '#100c02'; ell(c, x, y, H * 0.05, H * 0.13 * open, sn.drawAng); c.fill();
    }
  } else if (sn.kind === 'tetra') {
    const a = Math.round(sn.drawAng / (Math.PI / 2)) * (Math.PI / 2), ca = Math.cos(a), sa = Math.sin(a);
    const at = (lx, ly) => [sn.x + lx * ca - ly * sa, sn.y + lx * sa + ly * ca];
    c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) {
      const [x, y] = at(-H * 0.15, s * H * 0.42), e = H * 0.42 * Math.max(0.15, open);
      c.fillStyle = '#0b0f1c'; c.fillRect(x - H * 0.25, y - e / 2 - 1, H * 0.5, e + 2);
      c.fillStyle = '#ffffff'; c.fillRect(x - H * 0.21, y - e / 2, H * 0.42, e);
      const la = P ? Math.atan2(P.y - y, P.x - x) : a;
      c.fillStyle = '#e8483c'; c.fillRect(x + Math.cos(la) * H * 0.09 - H * 0.09, y + Math.sin(la) * H * 0.09 * open - H * 0.09 * open, H * 0.18, H * 0.18 * open);
    }
  } else if (sn.kind === 'rocket') {
    for (const s of [-1, 1]) {
      const [x, y] = loc(H * 1.0, s * H * 0.55);
      glowDot(c, x, y, H * 1.1, K.eye, 0.55);
      const g = c.createRadialGradient(x, y, 2, x, y, H * 5);
      g.addColorStop(0, 'rgba(255,240,200,0.18)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x, y);
      c.arc(x, y, H * 5, sn.drawAng - 0.32, sn.drawAng + 0.32); c.closePath(); c.fill();
    }
    if (sn.mode === 'boost') { const tl = sn.pts[sn.pts.length - 1]; if (tl && !tl.hid) glowDot(c, tl.x, tl.y, 26, '#ff9a3a', 0.5); }
    c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) { const [x, y] = loc(H * 1.0, s * H * 0.55); c.fillStyle = '#fffbe8'; ell(c, x, y, H * 0.13, H * 0.2, sn.drawAng); c.fill(); }
  } else if (SHOP_HEAD[sn.kind] || SUIT_HEAD[sn.kind]) {
    glowEyes2(c, sn, t, P, loc, lookAt, open);
  } else if (sn.kind === 'splitter' || sn.kind === 'splitling' || sn.kind === 'sniper') {
    glowEyes3(c, sn, t, P, loc, lookAt, open);
  } else if (V9_GLOW[sn.kind]) {
    V9_GLOW[sn.kind](c, sn, t, P, loc, lookAt, open);
  } else if (sn.kind === 'queen' && sn.mouth > 0.05) {
    const [x, y] = loc(H * 0.55, 0);
    glowDot(c, x, y, H * 1.6, '#ff3a3a', 0.3 * sn.mouth);
  }
  c.globalCompositeOperation = 'source-over';
}

function drawMound(c, sn, L, t) {
  const H = sn.headR;
  const warn = sn.mode === 'warn' ? clamp(sn.mt / 0.6, 0, 1) : 0;
  const sh = warn ? (Math.random() - 0.5) * 3 * warn : 0;
  c.save(); c.translate(sn.x + sh, sn.y);
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, 2, 5, H * 1.4, H * 0.95); c.fill();
  const g = c.createRadialGradient(-H * 0.3, -H * 0.45, 1, 0, 0, H * 1.35);
  g.addColorStop(0, L.rockHi); g.addColorStop(1, L.rockLo);
  ell(c, 0, 0, H * 1.25 * (1 + warn * 0.15), H * 0.9 * (1 + warn * 0.15)); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2;
  const n = 6, len = H * (0.9 + warn * 1.1);
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + sn.blinkSeed;
    c.moveTo(Math.cos(a) * H * 0.3, Math.sin(a) * H * 0.22);
    c.lineTo(Math.cos(a + 0.2) * len * 0.6, Math.sin(a + 0.2) * len * 0.45);
    c.lineTo(Math.cos(a - 0.1) * len, Math.sin(a - 0.1) * len * 0.75);
  }
  c.stroke();
  c.fillStyle = L.rock;
  for (let i = 0; i < 4; i++) { const a = i * 1.7 + t * 2 + sn.blinkSeed; circle(c, Math.cos(a) * H * 0.7, Math.sin(a) * H * 0.5 - 2, 1.8); }
  c.restore();
}

function drawHole(c, h, L) {
  if (h.a <= 0.01) return;
  c.save(); c.globalAlpha = h.a;
  ell(c, h.x, h.y + 1, h.r * 1.3, h.r * 1.0); c.fillStyle = L.rockLo; c.fill();
  ell(c, h.x, h.y, h.r * 1.08, h.r * 0.8); c.fillStyle = '#040202'; c.fill();
  c.fillStyle = L.dirt;
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + h.x * 0.1; circle(c, h.x + Math.cos(a) * h.r * 1.35, h.y + Math.sin(a) * h.r * 1.05, 1.6 + (i % 3)); }
  c.restore();
}
function drawHoleLip(c, h, L) {
  if (h.a <= 0.01) return;
  c.save(); c.globalAlpha = h.a;
  c.strokeStyle = L.dirt; c.lineWidth = Math.max(3, h.r * 0.28); c.lineCap = 'round';
  c.beginPath(); c.ellipse(h.x, h.y + 1, h.r * 1.12, h.r * 0.85, 0, 0.2, Math.PI - 0.2); c.stroke();
  c.restore();
}

/* ------------------------------------------------------------------ obstacles */
function drawRot(c, r, t) {
  const sh = r.shake > 0 ? Math.sin(t * 60) * r.shake * 6 : 0;
  c.save(); c.translate(r.x + sh, r.y);
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, 1, 9, 10, 3.5); c.fill();
  c.fillStyle = 'rgba(70,60,20,0.35)'; ell(c, 2, 8, 13, 5); c.fill();
  c.rotate(0.25 + Math.sin(r.ph) * 0.3);
  c.scale(1.05, 0.88);
  const R = 9;
  const g = c.createRadialGradient(-R * 0.3, -R * 0.4, 1, 0, 0, R * 1.2);
  g.addColorStop(0, '#8a6a32'); g.addColorStop(0.5, '#5e4320'); g.addColorStop(1, '#2c1d0c');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  c.fillStyle = 'rgba(150,160,90,0.75)';
  for (const [x, y, s] of [[-0.5, 0.2, 0.28], [0.35, -0.35, 0.2], [0.45, 0.5, 0.24], [-0.15, 0.7, 0.15]]) circle(c, x * R, y * R, s * R);
  c.fillStyle = 'rgba(30,18,6,0.8)';
  for (const [x, y, s] of [[0.1, 0.1, 0.12], [-0.55, -0.35, 0.09]]) circle(c, x * R, y * R, s * R);
  c.restore();
  applePath(c, R); c.strokeStyle = '#150c04'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = '#2a1a0c'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, -R * 0.6); c.quadraticCurveTo(-R * 0.3, -R * 0.9, -R * 0.1, -R * 1.15); c.stroke();
  c.restore();
  c.fillStyle = '#0d0b06';
  for (let i = 0; i < 2; i++) {
    const a = t * (5 + i * 2) + r.ph * (i + 1);
    circle(c, r.x + Math.cos(a) * (12 + i * 3), r.y - 6 + Math.sin(a * 1.3) * (6 + i * 2), 0.9);
  }
}
function drawUrn(c, o, L, t) {
  if (URN9[L.urnStyle]) return URN9[L.urnStyle](c, o, L, t);
  if (L.urnStyle === 'box') return drawBox(c, o, L, t);
  if (L.urnStyle === 'papers') return drawPapers(c, o, L, t);
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  c.save(); c.translate(o.x + sh, o.y + 2);
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, 2, 13, 15, 5.5); c.fill();
  const path = () => {
    c.beginPath(); c.moveTo(-6, -15); c.lineTo(6, -15); c.quadraticCurveTo(5, -10, 7, -8);
    c.bezierCurveTo(17, -5, 16, 10, 8, 13); c.lineTo(-8, 13); c.bezierCurveTo(-16, 10, -17, -5, -7, -8);
    c.quadraticCurveTo(-5, -10, -6, -15); c.closePath();
  };
  path(); c.strokeStyle = '#120a06'; c.lineWidth = 3.2; c.lineJoin = 'round'; c.stroke();
  const g = c.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, L.clayLo); g.addColorStop(0.35, L.clay); g.addColorStop(1, L.clayLo);
  path(); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(20,10,5,0.55)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-13, 1); for (let i = 1; i <= 9; i++) c.lineTo(-13 + i * 2.9, 1 + (i % 2 ? -3 : 0)); c.stroke();
  ell(c, 0, -15, 6.5, 2.3); c.fillStyle = '#120a06'; c.fill();
  c.strokeStyle = L.clay; c.lineWidth = 1.2; c.stroke();
  ell(c, -6, -1, 2.4, 6, 0.1); c.fillStyle = 'rgba(255,230,200,0.16)'; c.fill();
  if (o.hp < o.max) {
    c.strokeStyle = 'rgba(15,8,4,0.9)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(3, -7); c.lineTo(6, -1); c.lineTo(3, 3); c.lineTo(7, 9);
    if (o.hp < o.max - 1) { c.moveTo(-4, -8); c.lineTo(-8, -1); c.lineTo(-4, 5); c.lineTo(-6, 10); }
    c.stroke();
  }
  c.restore();
}
function drawEggs(c, o, L, t) {
  if (L.eggStyle === 'carton') return drawCarton(c, o, L, t);
  const sh = o.shake > 0 ? Math.sin(t * 60) * o.shake * 6 : 0;
  const tw = o.wob > 0 ? Math.sin(t * 38) * o.wob * 0.25 : 0;
  c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, o.x + 2, o.y + 12, 16, 5); c.fill();
  const eggs = [[0, -5, 1], [-7, 4, 0.9], [7, 5, 0.85]];
  eggs.forEach(([ex, ey, s], i) => {
    c.save(); c.translate(o.x + sh + ex, o.y + ey); c.rotate(tw * (i % 2 ? 1 : -1) + (i - 1) * 0.22);
    ell(c, 0, 0, 8 * s + 1.5, 10 * s + 1.5); c.fillStyle = '#1f1712'; c.fill();
    const g = c.createRadialGradient(-3 * s, -4 * s, 1, 0, 0, 11 * s);
    g.addColorStop(0, '#f4ecdc'); g.addColorStop(1, '#bfae93');
    ell(c, 0, 0, 8 * s, 10 * s); c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(110,90,70,0.45)';
    for (let k = 0; k < 4; k++) circle(c, Math.sin(k * 2.3 + o.seed * 9) * 4 * s, Math.cos(k * 1.7 + o.seed * 7) * 6 * s, 0.9 + (k % 2) * 0.5);
    if (o.hp < o.max && i === 0) {
      c.strokeStyle = 'rgba(30,20,10,0.9)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-6, -2); c.lineTo(-2, 1); c.lineTo(1, -3); c.lineTo(5, 0); c.stroke();
    }
    c.restore();
  });
}
function drawAltar(c, o, room, t) {
  if (o.kind === 'survival') { drawSurvivalAltar(c, o, room, t); return; }
  const x = o.x, y = o.y + 2;
  const off = o.kind === 'offering';
  if (!off) {
    // a rune circle on the floor; it pulses until you touch the altar
    const live = room.wave > 0 && !room.cleared, done = room.cleared;
    const a = done ? 0.12 : live ? 0.55 + 0.15 * Math.sin(t * 9) : 0.4 + 0.25 * Math.sin(t * 3);
    c.save(); c.translate(x, y + 2); c.scale(1, 0.62);
    c.strokeStyle = `rgba(255,80,50,${a})`; c.lineWidth = 2;
    c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.stroke();
    c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 33, 0, TAU); c.stroke();
    c.rotate(live ? t * 0.8 : t * 0.15);
    for (let i = 0; i < 8; i++) {
      const q = (i / 8) * TAU;
      c.save(); c.rotate(q); c.beginPath(); c.moveTo(34.5, -2.5); c.lineTo(38.5, 0); c.lineTo(34.5, 2.5); c.stroke(); c.restore();
    }
    if (!done) {
      const g = c.createRadialGradient(0, 0, 4, 0, 0, 44);
      g.addColorStop(0, `rgba(255,70,40,${a * 0.35})`); g.addColorStop(1, 'rgba(255,70,40,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 44, 0, TAU); c.fill();
    }
    c.restore();
  }
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 13, 20, 6); c.fill();
  rrect(c, x - 17, y - 8, 34, 20, 3); c.fillStyle = '#100808'; c.fill();
  rrect(c, x - 15.5, y - 6.5, 31, 17, 2); c.fillStyle = off ? '#4a1a1c' : '#5a5148'; c.fill();
  rrect(c, x - 19, y - 14, 38, 9, 2); c.fillStyle = '#100808'; c.fill();
  rrect(c, x - 17.5, y - 12.5, 35, 6, 1.5); c.fillStyle = off ? '#6e2228' : '#7a6f62'; c.fill();
  if (off) {
    c.fillStyle = '#8e1426';
    for (const dx of [-11, -2, 8]) { rrect(c, x + dx, y - 7, 2.4, 5 + (dx & 3) * 2, 1); c.fill(); }
  } else {
    const live = room.wave > 0 && !room.cleared, done = room.cleared;
    const glow = done ? 0.15 : live ? 0.9 : 0.45 + 0.3 * Math.sin(t * 3);
    c.strokeStyle = `rgba(255,90,60,${glow * 0.35})`; c.lineWidth = 4;
    c.beginPath(); c.moveTo(x - 7, y + 6); c.lineTo(x + 7, y - 4); c.moveTo(x + 7, y + 6); c.lineTo(x - 7, y - 4); c.stroke();
    c.strokeStyle = `rgba(255,120,80,${glow})`; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x - 7, y + 6); c.lineTo(x + 7, y - 4); c.moveTo(x + 7, y + 6); c.lineTo(x - 7, y - 4); c.stroke();
  }
}
function drawBlock(c, o, t) {
  const sh = o.shake > 0 ? Math.sin(t * 90) * o.shake * 6 : 0;
  const land = Math.min(1, o.born / 0.12), s = (T - 5) * (1 + (1 - land) * 0.35);
  let a = 1;
  if (o.ttl < 1.6) a = 0.55 + 0.45 * (Math.floor(o.ttl * 10) % 2);
  c.globalAlpha = a * land;
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(o.x - s / 2 + 3, o.y - s / 2 + 4, s, s);
  blockSq(c, o.x + sh, o.y, s, o.col, '#0b0f1c');
  if (o.hp < o.max) {
    c.strokeStyle = 'rgba(10,12,20,0.7)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(o.x - 8 + sh, o.y - 10); c.lineTo(o.x - 2 + sh, o.y - 2); c.lineTo(o.x - 7 + sh, o.y + 5);
    if (o.hp < 2) { c.moveTo(o.x + 9 + sh, o.y - 6); c.lineTo(o.x + 2 + sh, o.y + 1); c.lineTo(o.x + 6 + sh, o.y + 9); }
    c.stroke();
  }
  c.globalAlpha = 1;
}
function drawGhost(c, g, t) {
  const k = clamp(g.t / 0.95, 0, 1);
  for (const [cc, rr] of g.cells) {
    const x = cc * T + 3, y = rr * T + 3, s = T - 6;
    c.fillStyle = rgba(g.col, 0.1 + 0.3 * k); c.fillRect(x, y, s, s);
    c.strokeStyle = rgba(g.col, 0.5 + 0.5 * k); c.lineWidth = 2;
    c.setLineDash([5, 4]); c.lineDashOffset = -t * 30; c.strokeRect(x + 1, y + 1, s - 2, s - 2); c.setLineDash([]);
    const fall = (1 - k) * 60;
    c.globalAlpha = 0.35 + 0.4 * k;
    blockSq(c, x + s / 2, y + s / 2 - fall, s * (0.6 + 0.4 * k), g.col, '#0b0f1c');
    c.globalAlpha = 1;
  }
}
function ballTeam(b) { return b.last === 'player' ? '#3a9bff' : b.last === 'worm' ? '#ff8a2a' : '#e8ecf2'; }
function drawBall(c, b) {
  if (b.hide > 0) return;
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, b.x + 3, b.y + b.r * 0.8, b.r * 0.95, b.r * 0.42); c.fill();
  c.save(); c.translate(b.x, b.y);
  const g = c.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.1, 0, 0, b.r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c9d0db'); g.addColorStop(1, '#5d6676');
  c.beginPath(); c.arc(0, 0, b.r, 0, TAU); c.fillStyle = g; c.fill();
  c.save(); c.clip(); c.rotate(b.rot);
  const hex = (x, y, s) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; if (i) c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); else c.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s); } c.closePath(); };
  c.strokeStyle = 'rgba(50,56,70,0.6)'; c.lineWidth = 1;
  hex(0, 0, b.r * 0.4); c.fillStyle = 'rgba(60,68,86,0.45)'; c.fill(); c.stroke();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Math.PI / 6; hex(Math.cos(a) * b.r * 0.76, Math.sin(a) * b.r * 0.76, b.r * 0.4); c.stroke(); }
  c.restore();
  c.strokeStyle = ballTeam(b); c.lineWidth = 1.8; c.beginPath(); c.arc(0, 0, b.r - 0.9, 0, TAU); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -b.r * 0.38, -b.r * 0.42, b.r * 0.22, b.r * 0.12, -0.6); c.fill();
  c.restore();
}

function drawChest(c, o, t) {
  if (o.mimic && o.woke && !o.open) { drawMimic(c, o, t); return; }
  const breathe = o.mimic && !o.woke ? 1 + Math.sin(t * 2.2) * 0.025 : 1;
  if (breathe !== 1) { c.save(); c.translate(o.x, o.y + 13); c.scale(breathe, 2 - breathe); c.translate(-o.x, -o.y - 13); }
  drawChestBody(c, o, t);
  if (breathe !== 1) c.restore();
  drawMimicTell(c, o, t);
}
function drawChestBody(c, o, t) {
  const x = o.x, y = o.y + 3;
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 13, 21, 6); c.fill();
  c.save(); c.translate(x, y); c.lineJoin = 'round';
  if (o.open) {
    rrect(c, -18, -27, 36, 12, 3); c.fillStyle = '#120a06'; c.fill();
    rrect(c, -16.5, -25.5, 33, 9, 2); c.fillStyle = '#3c2416'; c.fill();
  }
  rrect(c, -19, -8, 38, 21, 3); c.fillStyle = '#120a06'; c.fill();
  const g = c.createLinearGradient(0, -8, 0, 13); g.addColorStop(0, '#6a432a'); g.addColorStop(1, '#3a2316');
  rrect(c, -17.5, -6.5, 35, 18, 2); c.fillStyle = g; c.fill();
  c.fillStyle = '#2a2420'; c.fillRect(-12, -6.5, 4, 18); c.fillRect(8, -6.5, 4, 18);
  if (!o.open) {
    rrect(c, -19, -17, 38, 12, 4); c.fillStyle = '#120a06'; c.fill();
    rrect(c, -17.5, -15.5, 35, 9, 3); c.fillStyle = '#7a4e31'; c.fill();
    c.fillStyle = '#2a2420'; c.fillRect(-12, -15.5, 4, 9); c.fillRect(8, -15.5, 4, 9);
    const pulse = 0.4 + 0.3 * Math.sin(t * 3);
    c.fillStyle = `rgba(255,190,90,${pulse})`; c.fillRect(-17, -6.8, 34, 1.4);
    rrect(c, -4, -9, 8, 9, 1.5); c.fillStyle = '#d6a74a'; c.fill();
    c.fillStyle = '#2a1a08'; circle(c, 0, -5.5, 1.5); c.fillRect(-0.6, -5.5, 1.2, 3);
  } else {
    ell(c, 0, -7, 15, 3.5); c.fillStyle = '#f7c46f'; c.fill();
  }
  c.restore();
}
function drawFlame(c, x, y, s, t, ph) {
  const fl = 1 + Math.sin(t * 13 + ph) * 0.12 + Math.sin(t * 23 + ph * 2) * 0.08;
  const h = 6.5 * s * fl, w = 2.5 * s;
  c.globalCompositeOperation = 'lighter';
  glowDot(c, x, y - h * 0.4, 13 * s, '#ff9a3c', 0.32);
  c.globalCompositeOperation = 'source-over';
  const sway = Math.sin(t * 7 + ph) * 0.8 * s;
  c.fillStyle = '#ffa63d';
  c.beginPath(); c.moveTo(x + sway, y - h); c.quadraticCurveTo(x + w, y - h * 0.3, x, y); c.quadraticCurveTo(x - w, y - h * 0.3, x + sway, y - h); c.fill();
  c.fillStyle = '#fff1c6';
  c.beginPath(); c.moveTo(x + sway * 0.6, y - h * 0.6); c.quadraticCurveTo(x + w * 0.45, y - h * 0.15, x, y - 0.2); c.quadraticCurveTo(x - w * 0.45, y - h * 0.15, x + sway * 0.6, y - h * 0.6); c.fill();
}

/* ------------------------------------------------------------------ room cache */
function doorTransform(c, k) {
  if (k === 'n') c.translate(RW / 2, 0);
  else if (k === 's') { c.translate(RW / 2, RH); c.rotate(Math.PI); }
  else if (k === 'w') { c.translate(0, RH / 2); c.rotate(-Math.PI / 2); }
  else { c.translate(RW, RH / 2); c.rotate(Math.PI / 2); }
}

function buildRoomCache(room, L, k) {
  const w = Math.max(1, Math.ceil(VIEW_W * k)), h = Math.max(1, Math.ceil(VIEW_H * k));
  const cv = room.cache || (room.cache = document.createElement('canvas'));
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  c.setTransform(k, 0, 0, k, WALL * k, WALL * k);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const rng = mulberry32(room.seed);
  drawFloor(c, room, L, rng);
  drawWalls(c, room, L, rng);
  for (const d of room.decals) drawDecal(c, d);
  room.cacheCtx = c; room.cacheK = k; room.dirty = false;
}

function drawFloor(c, room, L, rng) {
  if (room.theme === 'craft') { drawCraftFloor(c, room, L, rng); return; }
  c.fillStyle = L.void; c.fillRect(-WALL - 2, -WALL - 2, VIEW_W + 4, VIEW_H + 4);
  c.fillStyle = L.grout; c.fillRect(0, 0, RW, RH);
  if (floorTiles9(c, room, L, rng)) { /* drawn by version 9 */ }
  else if (L.deco === 'chamber') drawCarpet(c, room, L, rng);
  else for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * T, y = r * T;
      const rv = rng(); c.fillStyle = L.checker ? ((r + col) % 2 ? L.floor : L.floor2) : rv < 0.5 ? L.floor : L.floor2;
      rrect(c, x + 1.3, y + 1.3, T - 2.6, T - 2.6, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(x + 2, y + 2, T - 4, 2);
      if (rng() < 0.45) { c.fillStyle = 'rgba(0,0,0,0.14)'; circle(c, x + 4 + rng() * (T - 8), y + 4 + rng() * (T - 8), 1 + rng() * 2.5); }
      if (rng() < 0.18) {
        c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.8;
        c.beginPath(); let px = x + 4 + rng() * 10, py = y + 4 + rng() * 10; c.moveTo(px, py);
        for (let i = 0; i < 4; i++) { px += 4 + rng() * 6; py += (rng() - 0.3) * 8; c.lineTo(Math.min(px, x + T - 3), clamp(py, y + 3, y + T - 3)); }
        c.stroke();
      }
    }
  }
  if (floorDeco9(c, room, L, rng)) { /* drawn by version 9 */ }
  else if (L.deco === 'roots') drawRootsDeco(c, rng, L);
  else if (L.deco === 'skins') drawSkinsDeco(c, rng, L);
  else if (L.deco === 'kitchen') drawKitchenDeco(c, rng, L);
  else if (L.deco === 'cables') drawCablesDeco(c, rng, L);
  else if (L.deco === 'garden') drawGardenDeco(c, rng, L);
  else if (L.deco === 'market') drawMarketDeco(c, rng, L, room);
  else if (L.deco === 'chamber') drawChamberDeco(c, rng, L, room);
  else drawVeinsDeco(c, rng, L);
  if (room.story) drawStoryFloor(c, room, L, rng);
  if (!room.tutorial && !NOBONES9[room.type] && !NOBONES9[room.theme]) { const nb = 1 + Math.floor(rng() * 3); for (let i = 0; i < nb; i++) drawBone(c, 30 + rng() * (RW - 60), 30 + rng() * (RH - 60), rng() * TAU, 0.8 + rng() * 0.4); }
  if (room.tutorial) drawChalk(c);
  drawFloorExtras(c, room, L, rng);
  // inner shadow along the walls
  const sh = 34;
  const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
  edge(0, 0, 0, sh, 0, 0, RW, sh); edge(0, RH, 0, RH - sh, 0, RH - sh, RW, sh);
  edge(0, 0, sh, 0, 0, 0, sh, RH); edge(RW, 0, RW - sh, 0, RW - sh, 0, sh, RH);
  room.tillDone = false;
  for (const o of room.obs) {
    if (o.type === 'rock') drawRock(c, o, L, rng);
    else if (o.type === 'candle') drawCandleBase(c, o);
    else if (o.type === 'counter') drawCounter(c, o, room, L);
    else if (o.type === 'lectern') drawLectern(c, o, L);
    else if (o.type === 'wall') drawWallBlock(c, o, room, L);
    else if (o.type === 'pit') drawPit(c, o, L);
    else if (STATIC9[o.type]) STATIC9[o.type](c, o, room, L, rng);
  }
}

function drawRootsDeco(c, rng, L) {
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    const side = Math.floor(rng() * 4);
    let x, y, a;
    if (side === 0) { x = rng() * RW; y = 0; a = Math.PI / 2; }
    else if (side === 1) { x = rng() * RW; y = RH; a = -Math.PI / 2; }
    else if (side === 2) { x = 0; y = rng() * RH; a = 0; }
    else { x = RW; y = rng() * RH; a = Math.PI; }
    if (Math.abs(x - RW / 2) < 40 && (side < 2)) x += 80;
    if (Math.abs(y - RH / 2) < 40 && (side >= 2)) y += 70;
    let w = 5 + rng() * 3;
    const len = 50 + rng() * 80;
    const seg = 10;
    for (let s = 0; s < seg; s++) {
      a += (rng() - 0.5) * 0.7;
      const nx = x + Math.cos(a) * len / seg, ny = y + Math.sin(a) * len / seg;
      c.strokeStyle = L.decoCol; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      c.strokeStyle = 'rgba(255,220,180,0.06)'; c.lineWidth = w * 0.3; c.beginPath(); c.moveTo(x - 1, y - 1); c.lineTo(nx - 1, ny - 1); c.stroke();
      if (rng() < 0.3) {
        const ba = a + (rng() < 0.5 ? 1 : -1) * (0.6 + rng() * 0.5); const bl = 8 + rng() * 14;
        c.strokeStyle = L.decoCol; c.lineWidth = Math.max(1, w * 0.45);
        c.beginPath(); c.moveTo(nx, ny); c.quadraticCurveTo(nx + Math.cos(ba) * bl * 0.6, ny + Math.sin(ba) * bl * 0.6 + 3, nx + Math.cos(ba) * bl, ny + Math.sin(ba) * bl); c.stroke();
      }
      x = nx; y = ny; w *= 0.88;
    }
  }
}
function drawSkinsDeco(c, rng, L) {
  const n = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    let x = 40 + rng() * (RW - 80), y = 40 + rng() * (RH - 80), a = rng() * TAU;
    const pts = [];
    for (let s = 0; s < 12; s++) { pts.push([x, y]); a += Math.sin(s * 0.9 + i) * 0.45; x += Math.cos(a) * 9; y += Math.sin(a) * 9; }
    for (let s = 0; s < pts.length; s++) {
      const [px, py] = pts[s]; const r = 7 * (1 - s / pts.length * 0.6);
      c.fillStyle = rgba(L.decoCol, 0.07); circle(c, px, py, r);
      c.strokeStyle = rgba(L.decoCol, 0.1); c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(px - r * 0.6, py - r * 0.4); c.lineTo(px, py + r * 0.4); c.lineTo(px + r * 0.6, py - r * 0.4); c.stroke();
    }
  }
  for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(0,0,0,0.18)'; ell(c, rng() * RW, rng() * RH, 6 + rng() * 10, 3 + rng() * 5, rng() * 3); c.fill(); }
}
function drawVeinsDeco(c, rng, L) {
  const grow = (x, y, a, w, depth) => {
    const len = 14 + rng() * 18;
    const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
    c.strokeStyle = L.decoCol; c.lineWidth = w;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + nx) / 2 + (rng() - 0.5) * 8, (y + ny) / 2 + (rng() - 0.5) * 8, nx, ny); c.stroke();
    if (depth > 0) { grow(nx, ny, a + 0.5 + rng() * 0.3, w * 0.7, depth - 1); if (rng() < 0.7) grow(nx, ny, a - 0.5 - rng() * 0.3, w * 0.65, depth - 1); }
    else if (rng() < 0.4) { c.fillStyle = L.decoCol; circle(c, nx, ny, 2 + rng() * 2); }
  };
  const n = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const side = Math.floor(rng() * 4);
    let x = rng() * RW, y = rng() * RH, a;
    if (side === 0) { y = 0; a = Math.PI / 2; } else if (side === 1) { y = RH; a = -Math.PI / 2; } else if (side === 2) { x = 0; a = 0; } else { x = RW; a = Math.PI; }
    grow(x, y, a + (rng() - 0.5) * 0.6, 3.2, 3);
  }
  for (let i = 0; i < 4; i++) {
    const x = 20 + rng() * (RW - 40), y = 20 + rng() * (RH - 40);
    c.fillStyle = 'rgba(20,4,6,0.6)';
    for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; ell(c, x + Math.cos(a) * 3, y + Math.sin(a) * 3, 3, 1.6, a); c.fill(); }
    c.fillStyle = 'rgba(120,40,40,0.5)'; circle(c, x, y, 1.4);
  }
}
function drawBone(c, x, y, a, s) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = 'rgba(214,202,180,0.22)';
  c.fillRect(-7, -1.4, 14, 2.8);
  for (const sx of [-7, 7]) { circle(c, sx, -1.8, 2.2); circle(c, sx, 1.8, 2.2); }
  c.restore();
}
function drawChalk(c) {
  c.save();
  c.fillStyle = 'rgba(236,226,212,0.2)'; c.strokeStyle = 'rgba(236,226,212,0.2)';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const big = '600 15px "Barlow Condensed", "Arial Narrow", sans-serif';
  const small = '500 11px "Barlow Condensed", "Arial Narrow", sans-serif';
  const lx = RW * 0.25, rx = RW * 0.75, y = RH * 0.76;
  c.font = big; c.fillText('MOVE', lx, y); c.fillText('SHOOT', rx, y);
  c.font = small;
  c.fillText(COARSE ? 'LEFT THUMB' : 'W A S D', lx, y + 16);
  c.fillText(COARSE ? 'RIGHT THUMB' : 'ARROW KEYS OR MOUSE', rx, y + 16);
  c.lineWidth = 1.4;
  for (const [cx, cy] of [[lx, y - 26], [rx, y - 26]]) {
    c.beginPath(); c.arc(cx, cy, 10, 0, TAU); c.stroke();
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); c.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); c.stroke();
    }
  }
  c.font = small; c.fillText('CLEAR EVERY ROOM', RW / 2, RH * 0.2);
  c.restore();
}

function drawRock(c, o, L, rng) {
  if (ROCK9[L.rockStyle]) return ROCK9[L.rockStyle](c, o, rng, L);
  if (L.rockStyle === 'tp') return drawTPRock(c, o, rng);
  if (L.rockStyle === 'monitor') return drawMonitorRock(c, o, rng);
  if (L.rockStyle === 'shelf') return drawShelf(c, o, rng);
  if (L.rockStyle === 'desk') return drawDesk(c, o, rng);
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 10, 19, 7); c.fill();
  const n = 9; const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const r = 15.5 + rng() * 3.5; pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.86]); }
  const poly = (dx, dy, sc) => {
    c.beginPath();
    pts.forEach(([px, py], i) => { const X = x + dx + px * sc, Y = y + dy + py * sc; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); });
    c.closePath();
  };
  poly(0, 3, 1); c.fillStyle = L.rockLo; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 2; c.stroke();
  poly(0, -1, 0.9);
  const g = c.createLinearGradient(x - 12, y - 14, x + 10, y + 12); g.addColorStop(0, L.rockHi); g.addColorStop(1, L.rock);
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x - 7, y - 8); c.lineTo(x + 1, y - 1); c.lineTo(x + 9, y - 6); c.moveTo(x + 1, y - 1); c.lineTo(x - 1, y + 7); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.08)'; ell(c, x - 5, y - 8, 5, 2.5, -0.4); c.fill();
  if (L.deco === 'roots' && rng() < 0.6) {
    c.strokeStyle = L.decoCol; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - 14, y + 4); c.quadraticCurveTo(x - 4, y - 2, x + 2, y + 10); c.stroke();
  } else if (L.deco === 'veins') {
    c.strokeStyle = 'rgba(140,30,40,0.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x - 10, y - 2); c.lineTo(x - 3, y + 1); c.lineTo(x + 2, y - 4); c.lineTo(x + 8, y + 2); c.stroke();
  }
}
function drawCandleBase(c, o) {
  if (o.sign) return drawWetSign(c, o);
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, o.x + 1, o.y + 10, 14, 5); c.fill();
  ell(c, o.x, o.y + 7, 13, 4.6); c.fillStyle = '#2a211c'; c.fill();
  ell(c, o.x, o.y + 6, 12, 4); c.fillStyle = '#3b2f28'; c.fill();
  const fl = o.flames.slice().sort((a, b) => a.dy - b.dy);
  for (const f of fl) {
    const x = o.x + f.dx, y = o.y + f.dy; const h = f.h;
    rrect(c, x - 3.2, y - h, 6.4, h, 2); c.fillStyle = '#e8dcc2'; c.fill();
    c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 1, y - h + 1, 2.2, h - 1);
    ell(c, x, y - h, 3.2, 1.4); c.fillStyle = '#f5ecd8'; c.fill();
    rrect(c, x - 3.8, y - h + 1.5, 2, 4 + (f.ph % 3), 1); c.fillStyle = '#efe4cc'; c.fill();
    c.strokeStyle = '#1a120c'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x, y - h - 2); c.stroke();
  }
}

function drawWalls(c, room, L, rng) {
  c.save();
  c.beginPath(); c.rect(-WALL, -WALL, VIEW_W, VIEW_H); c.rect(0, 0, RW, RH);
  c.fillStyle = wallCol9(room, L) || L.wall; c.fill('evenodd');
  c.strokeStyle = L.wallLo; c.lineWidth = 1.2;
  const bh = WALL / 2;
  for (let row = 0; row < 2; row++) {
    const y = -WALL + row * bh;
    c.beginPath(); c.moveTo(-WALL, y + bh); c.lineTo(RW + WALL, y + bh); c.stroke();
    for (let x = -WALL + (row ? 11 : 0); x < RW + WALL; x += 22) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + bh); c.stroke(); }
    const y2 = RH + row * bh;
    c.beginPath(); c.moveTo(-WALL, y2 + bh); c.lineTo(RW + WALL, y2 + bh); c.stroke();
    for (let x = -WALL + (row ? 0 : 11); x < RW + WALL; x += 22) { c.beginPath(); c.moveTo(x, y2); c.lineTo(x, y2 + bh); c.stroke(); }
    const x3 = -WALL + row * bh;
    c.beginPath(); c.moveTo(x3 + bh, 0); c.lineTo(x3 + bh, RH); c.stroke();
    for (let y = (row ? 11 : 0); y < RH; y += 22) { c.beginPath(); c.moveTo(x3, y); c.lineTo(x3 + bh, y); c.stroke(); }
    const x4 = RW + row * bh;
    c.beginPath(); c.moveTo(x4 + bh, 0); c.lineTo(x4 + bh, RH); c.stroke();
    for (let y = (row ? 0 : 11); y < RH; y += 22) { c.beginPath(); c.moveTo(x4, y); c.lineTo(x4 + bh, y); c.stroke(); }
  }
  for (let i = 0; i < 40; i++) {
    const side = Math.floor(rng() * 4);
    let x, y;
    if (side === 0) { x = -WALL + rng() * VIEW_W; y = -WALL + rng() * WALL; }
    else if (side === 1) { x = -WALL + rng() * VIEW_W; y = RH + rng() * WALL; }
    else if (side === 2) { x = -WALL + rng() * WALL; y = rng() * RH; }
    else { x = RW + rng() * WALL; y = rng() * RH; }
    c.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.04)';
    c.fillRect(x, y, 3 + rng() * 6, 2 + rng() * 3);
  }
  c.strokeStyle = L.wallHi; c.lineWidth = 2.2; c.strokeRect(-1.1, -1.1, RW + 2.2, RH + 2.2);
  c.strokeStyle = L.wallLo; c.lineWidth = 4; c.strokeRect(-WALL + 2, -WALL + 2, VIEW_W - 4, VIEW_H - 4);
  c.fillStyle = L.wallLo;
  for (const [x, y] of [[-WALL, -WALL], [RW, -WALL], [-WALL, RH], [RW, RH]]) c.fillRect(x + 3, y + 3, WALL - 6, WALL - 6);
  c.fillStyle = L.wallHi;
  for (const [x, y] of [[-WALL, -WALL], [RW, -WALL], [-WALL, RH], [RW, RH]]) c.fillRect(x + 7, y + 7, WALL - 14, WALL - 14);
  for (const k in room.doors) drawDoorway(c, k, room.doors[k], room, L);
  for (const s of room.sconces) drawSconce(c, s);
  if (room.store) drawStoreWalls(c, room, L, rng);
  else if (L.deco === 'chamber') drawChamberWalls(c, room, L, rng);
  if (room.story) drawStoryWalls(c, room, L);
  if (room.secretLink) drawCrackedWall(c, room.secretLink, L);
  if (room.hellLink) drawHellWall9(c, room.hellLink, L);
  drawWalls9(c, room, L, rng);
  c.restore();
}
function drawCrackedWall(c, link, L) {
  c.save(); doorTransform(c, link.k);
  const dmg = 3 - link.hp;
  c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(-4, -WALL + 2); c.lineTo(-1, -WALL * 0.6); c.lineTo(-6, -WALL * 0.35); c.lineTo(-2, -1);
  c.moveTo(-1, -WALL * 0.6); c.lineTo(6, -WALL * 0.5); c.lineTo(9, -WALL * 0.2);
  if (dmg >= 1) { c.moveTo(-6, -WALL * 0.35); c.lineTo(-14, -WALL * 0.3); c.lineTo(-18, -WALL * 0.6); c.moveTo(6, -WALL * 0.5); c.lineTo(14, -WALL * 0.75); }
  if (dmg >= 2) { c.moveTo(9, -WALL * 0.2); c.lineTo(16, -2); c.moveTo(-14, -WALL * 0.3); c.lineTo(-12, -2); }
  c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.55)';
  if (dmg >= 1) { c.fillRect(-3, -WALL * 0.62, 5, 4); }
  if (dmg >= 2) { c.fillRect(4, -WALL * 0.5, 6, 5); c.fillRect(-12, -WALL * 0.4, 5, 5); }
  c.restore();
}
function drawSconce(c, s) {
  c.save(); c.translate(s.x, s.y);
  const rot = { n: 0, s: Math.PI, w: -Math.PI / 2, e: Math.PI / 2 }[s.side];
  c.rotate(rot);
  rrect(c, -5, -7, 10, 11, 2); c.fillStyle = '#17110e'; c.fill();
  c.fillStyle = '#3a2e26'; c.fillRect(-1.5, 2, 3, 5);
  ell(c, 0, 7, 5, 2.2); c.fillStyle = '#2a211c'; c.fill();
  c.restore();
}
function drawDoorway(c, k, target, room, L) {
  c.save(); doorTransform(c, k);
  const g = c.createLinearGradient(0, -WALL, 0, 0); g.addColorStop(0, '#000000'); g.addColorStop(1, '#0b0706');
  c.fillStyle = g; c.fillRect(-DOOR_HW, -WALL - 2, DOOR_HW * 2, WALL + 2.5);
  const sp = (ty) => target.type === ty || room.type === ty;
  const special = sp('boss') ? 'boss' : sp('portal') ? 'portal' : sp('vault') ? 'vault' : sp('miniboss') ? 'miniboss' : sp('chest') ? 'chest' : sp('challenge') ? 'challenge' : sp('survival') ? 'survival' : sp('offering') ? 'offering' : sp('library') ? 'library'
    : sp('chaosboss') ? 'boss' : sp('club') ? 'club' : sp('hellclub') ? 'hellclub' : sp('tank') ? 'tank' : sp('gym') ? 'gym' : sp('kapper') ? 'kapper' : sp('courtroom') ? 'courtroom'
    : sp('pantry') ? 'pantry' : sp('spring') ? 'spring' : sp('shop') ? 'shop' : sp('gamble') ? 'gamble' : sp('vote') ? 'vote' : null;
  const pillar = { boss: '#d8ccb6', portal: '#2b2140', chest: '#b8913f', challenge: '#b0402e', offering: '#5e1420', pantry: '#6f9a3a', shop: '#1aa0e0', vote: '#e8742a',
    vault: '#c9a000', miniboss: '#d06a3a', survival: '#c87830', library: '#6a2a9a', spring: '#3aa89a', gamble: '#f2c230',
    club: '#ff3ad8', hellclub: '#c8262e', tank: '#2f9a4a', kapper: '#e8e2d0', gym: '#b4f03c', courtroom: '#8a6a3a' }[special] || L.wallHi;
  if (special === 'portal') { c.fillStyle = 'rgba(160,70,255,0.55)'; c.fillRect(-DOOR_HW, -WALL - 2, DOOR_HW * 2, WALL + 2.5); c.fillStyle = 'rgba(220,160,255,0.35)'; for (let i = 0; i < 6; i++) c.fillRect(-DOOR_HW + 4 + i * 6, -WALL + (i * 7) % (WALL - 4), 3, 3); }
  for (const s of [-1, 1]) {
    const x = s > 0 ? DOOR_HW : -DOOR_HW - 7;
    rrect(c, x - 0.5, -WALL - 1, 8, WALL + 4, 2); c.fillStyle = '#0c0807'; c.fill();
    rrect(c, x + 0.5, -WALL, 6, WALL + 2, 1.5); c.fillStyle = pillar; c.fill();
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 0.5, -WALL * 0.55, 6, 1.2); c.fillRect(x + 0.5, -WALL * 0.15, 6, 1.2);
  }
  if (special === 'boss') {
    c.fillStyle = '#ece3d0';
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * DOOR_HW, -WALL * 0.85); c.quadraticCurveTo(s * (DOOR_HW - 10), -WALL * 0.55, s * (DOOR_HW - 6), -WALL * 0.15); c.lineTo(s * DOOR_HW, -WALL * 0.45); c.closePath(); c.fill();
    }
    drawSkullEmblem(c, -DOOR_HW - 20, -WALL * 0.5, 7);
    drawSkullEmblem(c, DOOR_HW + 20, -WALL * 0.5, 7);
  } else if (special === 'chest') {
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * (DOOR_HW + 19), -WALL * 0.5);
      applePath(c, 5.5); c.fillStyle = '#d6a74a'; c.fill(); c.strokeStyle = '#3a2808'; c.lineWidth = 1; c.stroke();
      c.restore();
    }
  }
  // a barred vault: iron bars and a lock across the doorway
  if (target.sealed) {
    c.fillStyle = '#16120c'; c.fillRect(-DOOR_HW, -WALL * 0.62, DOOR_HW * 2, 3.4); c.fillRect(-DOOR_HW, -WALL * 0.22, DOOR_HW * 2, 3.4);
    for (let i = 0; i < 6; i++) {
      const bx = -DOOR_HW + 4 + i * ((DOOR_HW * 2 - 8) / 5);
      c.fillStyle = '#16120c'; c.fillRect(bx - 2.2, -WALL - 1, 4.4, WALL + 2);
      c.fillStyle = '#6a6458'; c.fillRect(bx - 1.3, -WALL, 2.6, WALL);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(bx - 1.3, -WALL, 0.9, WALL);
    }
    c.fillStyle = '#6a6458'; c.fillRect(-DOOR_HW, -WALL * 0.6, DOOR_HW * 2, 2); c.fillRect(-DOOR_HW, -WALL * 0.2, DOOR_HW * 2, 2);
    rrect(c, -6, -WALL * 0.48, 12, 10, 2); c.fillStyle = '#c9a000'; c.fill(); c.strokeStyle = '#3a2808'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#2a1a08'; circle(c, 0, -WALL * 0.48 + 4, 1.6); c.fillRect(-0.7, -WALL * 0.48 + 4, 1.4, 4);
  }
  c.restore();
}
function drawSkullEmblem(c, x, y, s) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#d8ccb6';
  c.beginPath(); c.moveTo(-s, -s * 0.6); c.quadraticCurveTo(0, -s * 1.3, s, -s * 0.6); c.quadraticCurveTo(s * 1.1, s * 0.3, s * 0.35, s * 1.05); c.lineTo(-s * 0.35, s * 1.05); c.quadraticCurveTo(-s * 1.1, s * 0.3, -s, -s * 0.6); c.closePath(); c.fill();
  c.fillStyle = '#120a08';
  ell(c, -s * 0.42, -s * 0.15, s * 0.28, s * 0.22, 0.4); c.fill();
  ell(c, s * 0.42, -s * 0.15, s * 0.28, s * 0.22, -0.4); c.fill();
  c.fillStyle = '#ece3d0';
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * s * 0.3, s * 1.0); c.lineTo(sx * s * 0.18, s * 1.6); c.lineTo(sx * s * 0.08, s * 1.0); c.closePath(); c.fill(); }
  c.restore();
}

function drawDoorJaws(c, room) {
  const cl = room.doorCl; if (cl <= 0.01) return;
  for (const k in room.doors) {
    const target = room.doors[k];
    c.save(); doorTransform(c, k);
    const boss = target.type === 'boss' || room.type === 'boss';
    const gum = boss ? '#4a1018' : '#3a1a1c', tooth = boss ? '#efe4cf' : '#ddd0bb';
    const w = DOOR_HW * cl;
    for (const s of [-1, 1]) {
      const x0 = s * DOOR_HW, x1 = s * (DOOR_HW - w);
      c.fillStyle = '#0c0506'; c.fillRect(Math.min(x0, x1) - 1, -WALL - 1, Math.abs(x1 - x0) + 2, WALL + 2);
      c.fillStyle = gum; c.fillRect(Math.min(x0, x1), -WALL, Math.abs(x1 - x0), WALL);
      c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(Math.min(x0, x1), -WALL, Math.abs(x1 - x0), 2);
    }
    c.fillStyle = tooth; c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.8;
    const nT = 4, th = WALL / nT, len = (boss ? 9 : 7) * cl;
    for (const s of [-1, 1]) {
      const x1 = s * (DOOR_HW - w);
      for (let i = 0; i < nT; i++) {
        const y0 = -WALL + i * th + (s > 0 ? th / 2 : 0);
        if (y0 + th > 0.5) continue;
        c.beginPath(); c.moveTo(x1, y0 + 0.8); c.lineTo(x1 - s * len, y0 + th / 2); c.lineTo(x1, y0 + th - 0.8); c.closePath(); c.fill(); c.stroke();
      }
    }
    c.restore();
  }
}

/* v10.6: the Minecraft portal door. Obsidian frame, swirling purple pixels, sparks, and a glow on the floor. */
function isPortalDoor10(room, d) { return d.type === 'portal' || room.type === 'portal'; }
function drawPortalDoors10(c, room, t) {
  for (const k in room.doors) {
    if (!isPortalDoor10(room, room.doors[k])) continue;
    c.save(); doorTransform(c, k);
    const W2 = DOOR_HW * 2, px = 4, cols = Math.ceil(W2 / px), rows = Math.ceil((WALL + 2) / px);
    c.beginPath(); c.rect(-DOOR_HW, -WALL - 2, W2, WALL + 2.5); c.clip();
    c.fillStyle = '#12061f'; c.fillRect(-DOOR_HW, -WALL - 2, W2, WALL + 3);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const n = Math.sin(i * 0.85 + t * 2.1) + Math.sin(j * 1.25 - t * 1.7) + Math.sin((i + j) * 0.55 + t * 1.2) + Math.sin(i * 0.3 - j * 0.7 + t * 2.6);
      const v = clamp((n + 4) / 8, 0, 1);
      c.fillStyle = mixHex('#2a0a5c', '#c58bff', v * v);
      c.fillRect(-DOOR_HW + i * px, -WALL - 2 + j * px, px, px);
      if (v > 0.9) { c.fillStyle = 'rgba(255,225,255,0.55)'; c.fillRect(-DOOR_HW + i * px + 1, -WALL - 2 + j * px + 1, 2, 2); }
    }
    // the edges breathe
    const pu = 0.5 + 0.5 * Math.sin(t * 3);
    const eg = c.createLinearGradient(-DOOR_HW, 0, DOOR_HW, 0);
    eg.addColorStop(0, `rgba(210,120,255,${0.35 + pu * 0.25})`); eg.addColorStop(0.14, 'rgba(210,120,255,0)');
    eg.addColorStop(0.86, 'rgba(210,120,255,0)'); eg.addColorStop(1, `rgba(210,120,255,${0.35 + pu * 0.25})`);
    c.fillStyle = eg; c.fillRect(-DOOR_HW, -WALL - 2, W2, WALL + 3);
    c.restore();
    // obsidian frame blocks, with magenta veins
    c.save(); doorTransform(c, k);
    for (const s of [-1, 1]) {
      const x0 = s > 0 ? DOOR_HW : -DOOR_HW - 8;
      for (let j = 0; j < 7; j++) {
        const y = -WALL + j * 4;
        c.fillStyle = (j + (s > 0 ? 1 : 0)) % 2 ? '#1a0b2e' : '#241040'; c.fillRect(x0, y, 8, 4.2);
        if ((j * 7 + (s > 0 ? 3 : 0)) % 4 === 0) { c.fillStyle = `rgba(190,90,255,${0.5 + 0.4 * Math.sin(t * 2 + j)})`; c.fillRect(x0 + 2 + (j % 3), y + 1, 2, 2); }
      }
    }
    c.fillStyle = '#0d0618'; c.fillRect(-DOOR_HW - 8, -WALL - 1.5, DOOR_HW * 2 + 16, 3);
    // sparks drifting out into the room
    for (let i = 0; i < 16; i++) {
      const ph = (t * 0.45 + i * 0.173) % 1;
      const sx = Math.sin(i * 7.31) * (DOOR_HW - 4), sy = -WALL * 0.45 + ph * (WALL * 1.7);
      c.fillStyle = `rgba(${i % 3 ? 220 : 255},${i % 3 ? 150 : 210},255,${(1 - ph) * 0.9})`;
      const sz = i % 4 === 0 ? 3 : 2; c.fillRect(sx + Math.sin(ph * 6 + i) * 3, sy, sz, sz);
    }
    c.restore();
  }
}

function drawExit(c, ex, L, t) {
  const a = smooth(Math.min(1, ex.t / 0.9));
  if (a <= 0) return;
  c.save(); c.translate(ex.x, ex.y);
  if (ex.kind === 'hole') {
    c.scale(a, a);
    ell(c, 0, 3, 36, 27); c.fillStyle = L.rockLo; c.fill();
    ell(c, 0, 2, 33, 24); c.fillStyle = L.dirt; c.fill();
    const g = c.createRadialGradient(0, 4, 2, 0, 0, 28); g.addColorStop(0, '#000000'); g.addColorStop(1, '#120b08');
    ell(c, 0, 0, 28, 20); c.fillStyle = g; c.fill();
    c.strokeStyle = L.decoCol; c.lineWidth = 2.4;
    for (let i = 0; i < 7; i++) {
      const an = i / 7 * TAU + 0.3;
      c.beginPath(); c.moveTo(Math.cos(an) * 32, Math.sin(an) * 23);
      c.quadraticCurveTo(Math.cos(an + 0.4) * 20, Math.sin(an + 0.4) * 14, Math.cos(an + 0.2) * 12, Math.sin(an + 0.2) * 8); c.stroke();
    }
    c.fillStyle = 'rgba(236,226,212,0.5)';
    for (let i = 0; i < 5; i++) { const ph = (t * 0.6 + i * 0.2) % 1; const an = i * 2.4; circle(c, Math.cos(an) * 30 * (1 - ph), Math.sin(an) * 21 * (1 - ph), 1.2 * (1 - ph)); }
  } else {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 46);
    g.addColorStop(0, `rgba(255,236,190,${0.55 * a})`); g.addColorStop(1, 'rgba(255,236,190,0)');
    c.fillStyle = g; ell(c, 0, 0, 46, 34); c.fill();
  }
  c.restore();
}

/* ------------------------------------------------------------------ decals */
function drawDecal(c, d) {
  const rng = mulberry32(Math.floor(d.seed * 1e9) | 0);
  c.save();
  if (d.type === 'splat' || d.type === 'juice' || d.type === 'venom') {
    const al = d.type === 'venom' ? 0.3 : d.type === 'juice' ? 0.38 : 0.5;
    c.fillStyle = rgba(d.col, al);
    c.beginPath(); c.moveTo(d.x + d.r, d.y); c.arc(d.x, d.y, d.r, 0, TAU);
    const n = d.type === 'venom' ? 4 : 7;
    for (let i = 0; i < n; i++) {
      const a = rng() * TAU, rr = d.r * (0.7 + rng() * 1.0), sr = d.r * (0.12 + rng() * 0.3);
      const x = d.x + Math.cos(a) * rr, y = d.y + Math.sin(a) * rr;
      c.moveTo(x + sr, y); c.arc(x, y, sr, 0, TAU);
    }
    c.fill();
  } else if (d.type === 'shards') {
    for (let i = 0; i < 7; i++) {
      const a = rng() * TAU, rr = 4 + rng() * 13, x = d.x + Math.cos(a) * rr, y = d.y + Math.sin(a) * rr;
      c.fillStyle = i % 2 ? d.col : '#1a0f0a';
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3 + rng() * 3, y + rng() * 2); c.lineTo(x + rng() * 2, y + 3 + rng() * 2); c.closePath(); c.fill();
    }
  } else if (d.type === 'shell') {
    c.strokeStyle = 'rgba(225,214,192,0.55)'; c.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const a = rng() * TAU, rr = 3 + rng() * 10, x = d.x + Math.cos(a) * rr, y = d.y + Math.sin(a) * rr;
      c.beginPath(); c.arc(x, y, 3 + rng() * 2, rng() * TAU, rng() * TAU + 1.8); c.stroke();
    }
    c.fillStyle = 'rgba(220,200,120,0.25)'; ell(c, d.x, d.y + 2, 10, 6); c.fill();
  } else if (d.type === 'papers') {
    for (let i = 0; i < 6; i++) {
      c.save(); c.translate(d.x + (rng() - 0.5) * d.r * 2.4, d.y + (rng() - 0.5) * d.r * 2); c.rotate(rng() * TAU);
      c.fillStyle = 'rgba(232,226,208,0.55)'; c.fillRect(-4, -5, 8, 10); c.restore();
    }
  } else if (d.type === 'crack') {
    c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + rng(); let x = d.x, y = d.y; c.beginPath(); c.moveTo(x, y);
      for (let s = 0; s < 3; s++) { x += Math.cos(a + (rng() - 0.5) * 0.8) * d.r * 0.35; y += Math.sin(a + (rng() - 0.5) * 0.8) * d.r * 0.35; c.lineTo(x, y); }
      c.stroke();
    }
    c.fillStyle = 'rgba(0,0,0,0.25)'; circle(c, d.x, d.y, d.r * 0.4);
  }
  c.restore();
}

