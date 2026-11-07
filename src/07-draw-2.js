/* src/07-draw-2.js: drawing part two: Mikappols, the new worms, supermarket and chamber rooms, icons. From v7. Lines 3973 to 4695 of the v13.7 script. */
/* =====================================================================
   Drawing, part two: Mikappols, the supermarket, the Second Chamber,
   the new worms, coins, carts, traps and the new powerup icons
   ===================================================================== */

/* ------------------------------------------------------------------ Mikappols */
// a blue rounded square with a stem: one face, always
function mikaPath(c, R) { rrect(c, -R * 0.98, -R * 0.9, R * 1.96, R * 1.86, R * 0.44); }
function drawMika(c, R, st) {
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
  g.addColorStop(0, '#1a2fd8'); g.addColorStop(1, '#0050ff');
  mikaPath(c, R); c.fillStyle = g; c.fill();
  c.save(); mikaPath(c, R); c.clip();
  const sh = c.createRadialGradient(-R * 0.5, -R * 0.55, R * 0.05, -R * 0.5, -R * 0.55, R * 1.1);
  sh.addColorStop(0, 'rgba(170,200,255,0.32)'); sh.addColorStop(1, 'rgba(170,200,255,0)');
  c.fillStyle = sh; c.fillRect(-R, -R, R * 2, R * 2);
  if (st.cyanide) { c.fillStyle = 'rgba(38,120,60,0.5)'; for (const [x, y, r] of [[-0.6, 0.5, 0.09], [0.55, 0.6, 0.07], [0.7, -0.3, 0.06]]) circle(c, x * R, y * R, r * R); }
  c.restore();
  if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(232,150,48,0.85)'; c.lineWidth = R * 0.12; rrect(c, -R * 1.06, -R * 0.98, R * 2.12, R * 2.02, R * 0.5); c.stroke(); }
  mikaPath(c, R); c.strokeStyle = '#06104a'; c.lineWidth = Math.max(1, R * 0.09); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = mixHex('#d6e4ff', '#5a6aa8', clamp((st.t - b.t) / 30, 0, 1)); biteShape(c, R * 1.08, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R * 1.08, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  if (st.face !== false) {
    c.fillStyle = '#ffffff';
    circle(c, -R * 0.34, R * 0.04, R * 0.11);
    circle(c, R * 0.3, -R * 0.1, R * 0.11);
    c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.11; c.lineCap = 'round';
    c.beginPath(); c.moveTo(R * 0.02, R * 0.44); c.lineTo(R * 0.5, R * 0.44); c.stroke();
  }
}

/* ------------------------------------------------------------------ the new worms */
const SHOP_HEAD = { bonus: 1, discount: 1, pwblue: 1, pwyellow: 1 };
const SUIT_HEAD = { kamerlid: 1, lobby: 1, coalition: 1, party: 1 };
const EYE2 = {
  bonus: ['#9fd8ff', '#1a6ab0'], pwblue: ['#9fd8ff', '#1a6ab0'], discount: ['#ffd23a', '#1a1a1a'], pwyellow: ['#ffd23a', '#1a1a1a'],
  kamerlid: ['#ffd166', '#3a2010'], lobby: ['#e3a54a', '#6a4a10'], coalition: ['#ffd166', '#3a2010'], party: ['#ffd166', '#3a2010'],
};
function drawPriceTag(c, x, y, s, rot, col, ink, txt) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-9, -5); c.lineTo(5, -5); c.lineTo(10, 0); c.lineTo(5, 5); c.lineTo(-9, 5); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.5)'; circle(c, 5.5, 0, 1.3);
  if (txt) { c.fillStyle = ink; c.font = '700 7px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, -2, 0.5); }
  c.restore();
}
function bandAt(c, p, dx, dy, w, col) {
  const nx = -dy, ny = dx, r = p.r * 0.92;
  c.strokeStyle = col; c.lineWidth = p.r * w;
  c.beginPath(); c.moveTo(p.x + nx * r, p.y + ny * r); c.quadraticCurveTo(p.x + dx * r * 0.3, p.y + dy * r * 0.3, p.x - nx * r, p.y - ny * r); c.stroke();
}
function decorateSnake2(c, sn, t) {
  const K = sn.K, pts = sn.pts, n = pts.length, kind = sn.kind;
  if (SHOP_HEAD[kind]) {
    for (let k = 0; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k);
      if (k % 2 === 1) bandAt(c, p, dx, dy, 0.42, K.band);
      if ((kind === 'discount' || kind === 'pwyellow') && k % 2 === 0) { c.fillStyle = 'rgba(20,20,20,0.5)'; circle(c, p.x - dy * p.r * 0.35, p.y + dx * p.r * 0.35, p.r * 0.16); }
    }
    return;
  }
  if (!SUIT_HEAD[kind]) return;
  // a suit: a white collar, a tie, buttons; the coalition wears all four party colours
  for (let k = 0; k < n; k++) {
    const p = pts[k]; if (p.hid) continue;
    const [dx, dy] = bodyDir(sn, k);
    if (kind === 'coalition') bandAt(c, p, dx, dy, 0.3, K.parties[k % K.parties.length]);
    if (kind === 'coalition' && sn.act && k % 4 === COALITION_ROLES.indexOf(sn.act)) { c.fillStyle = 'rgba(255,255,255,0.18)'; circle(c, p.x, p.y, p.r * 0.9); }
    if ((k === 3 || k === 5) && kind !== 'coalition') { c.fillStyle = 'rgba(0,0,0,0.45)'; circle(c, p.x, p.y, Math.max(1, p.r * 0.14)); }
  }
  const p0 = pts[0], p1 = pts[1], p2 = pts[2];
  if (p0 && !p0.hid) {
    const [dx, dy] = bodyDir(sn, 0), nx = -dy, ny = dx, r = p0.r;
    c.fillStyle = K.collar;
    c.beginPath(); c.moveTo(p0.x + nx * r * 0.95 + dx * r * 0.35, p0.y + ny * r * 0.95 + dy * r * 0.35);
    c.quadraticCurveTo(p0.x + dx * r * 0.9, p0.y + dy * r * 0.9, p0.x - nx * r * 0.95 + dx * r * 0.35, p0.y - ny * r * 0.95 + dy * r * 0.35);
    c.lineTo(p0.x - nx * r * 0.5 + dx * r * 0.1, p0.y - ny * r * 0.5 + dy * r * 0.1); c.lineTo(p0.x + dx * r * 0.42, p0.y + dy * r * 0.42);
    c.lineTo(p0.x + nx * r * 0.5 + dx * r * 0.1, p0.y + ny * r * 0.5 + dy * r * 0.1); c.closePath(); c.fill();
    if (p1 && p2 && !p1.hid) {
      // the tie runs back along the body from the collar
      c.fillStyle = K.tie;
      const ex = p2.hid ? p1.x : (p1.x + p2.x) / 2, ey = p2.hid ? p1.y : (p1.y + p2.y) / 2, w = p0.r * 0.26;
      c.beginPath(); c.moveTo(p0.x + dx * r * 0.36, p0.y + dy * r * 0.36);
      c.lineTo(p0.x + nx * w, p0.y + ny * w); c.lineTo(ex + nx * w * 1.3, ey + ny * w * 1.3); c.lineTo(ex - dx * r * 0.4, ey - dy * r * 0.4);
      c.lineTo(ex - nx * w * 1.3, ey - ny * w * 1.3); c.lineTo(p0.x - nx * w, p0.y - ny * w); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.moveTo(ex + nx * w * 1.3, ey + ny * w * 1.3); c.lineTo(ex - dx * r * 0.4, ey - dy * r * 0.4); c.lineTo(ex, ey); c.closePath(); c.fill();
    }
  }
  if (kind === 'lobby' && p2 && !p2.hid) {
    // a briefcase, held at the side
    const [dx, dy] = bodyDir(sn, 2), nx = -dy, ny = dx, x = p2.x + nx * p2.r * 1.4, y = p2.y + ny * p2.r * 1.4;
    c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx));
    c.fillStyle = '#1c120a'; rrect(c, -6.5, -4.6, 13, 9.2, 1.6); c.fill();
    c.fillStyle = '#6a4424'; rrect(c, -5.6, -3.7, 11.2, 7.4, 1.2); c.fill();
    c.fillStyle = '#d6a74a'; c.fillRect(-1.2, -3.7, 2.4, 1.6);
    c.restore();
  }
}
function headShop(c, sn, H, out, fill, t) {
  const K = sn.K, o = sn.mouth || 0, boss = sn.isBoss;
  ell(c, 0, 0, H * 1.1 + 2, H * 0.98 + 2); c.fillStyle = out; c.fill();
  ell(c, 0, 0, H * 1.1, H * 0.98); c.fillStyle = fill; c.fill();
  c.fillStyle = K.hi; ell(c, -H * 0.3, -H * 0.4, H * 0.5, H * 0.26); c.fill();
  c.fillStyle = K.band; c.fillRect(-H * 0.72, -H * 0.86, H * 0.3, H * 1.72);
  // a scanner slot of a mouth full of teeth
  const mw = H * (0.5 + o * 0.2), mx = H * 0.72;
  rrect(c, mx - H * 0.18, -mw, H * 0.42, mw * 2, H * 0.14); c.fillStyle = '#100808'; c.fill();
  c.fillStyle = '#f4ead8';
  const nT = boss ? 6 : 4;
  for (let i = 0; i < nT; i++) {
    const y = -mw + (i + 0.5) * (mw * 2) / nT;
    c.beginPath(); c.moveTo(mx + H * 0.24, y - H * 0.08); c.lineTo(mx + H * 0.04 - o * H * 0.06, y); c.lineTo(mx + H * 0.24, y + H * 0.08); c.closePath(); c.fill();
  }
  if (sn.kind === 'bonus' || sn.kind === 'pwblue') {
    const sw = Math.sin(t * 3 + sn.blinkSeed) * 0.3;
    c.strokeStyle = 'rgba(240,240,240,0.7)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-H * 0.6, -H * 0.7); c.lineTo(-H * 1.05, -H * (1.05 + sw * 0.2)); c.stroke();
    drawPriceTag(c, -H * 1.2, -H * (1.12 + sw * 0.2), boss ? 1.3 : 0.9, 2.6 + sw, '#ffffff', '#1a6ab0', '%');
  } else {
    c.fillStyle = '#151515'; rrect(c, -H * 0.3, -H * 0.42, H * 0.62, H * 0.84, H * 0.14); c.fill();
    c.fillStyle = '#f2c200'; c.font = `800 ${Math.round(H * 0.7)}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.save(); c.translate(H * 0.01, 0); c.rotate(Math.PI / 2); c.fillText('%', 0, H * 0.04); c.restore();
  }
}
function headSuit(c, sn, H, out, fill, t) {
  const K = sn.K, o = sn.mouth || 0;
  const skin = K.skin || '#d8a594';
  ell(c, 0, 0, H * 1.08 + 1.8, H * 0.96 + 1.8); c.fillStyle = out; c.fill();
  ell(c, 0, 0, H * 1.08, H * 0.96); c.fillStyle = fill === '#ffffff' ? fill : skin; c.fill();
  c.fillStyle = 'rgba(255,240,230,0.3)'; ell(c, -H * 0.2, -H * 0.4, H * 0.5, H * 0.24); c.fill();
  // a neat haircut on the back of the head
  const hair = sn.kind === 'lobby' ? '#8a8a90' : sn.kind === 'kamerlid' ? '#3a2416' : null;
  if (hair) {
    c.fillStyle = hair;
    c.beginPath(); c.moveTo(-H * 1.06, -H * 0.2); c.quadraticCurveTo(-H * 0.9, -H * 0.98, -H * 0.1, -H * 0.92); c.quadraticCurveTo(-H * 0.45, -H * 0.4, -H * 0.2, H * 0.92);
    c.quadraticCurveTo(-H * 0.95, H * 0.85, -H * 1.06, -H * 0.2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-H * 0.85, -H * 0.55); c.quadraticCurveTo(-H * 0.5, -H * 0.3, -H * 0.42, H * 0.3); c.stroke();
  } else if (sn.kind === 'coalition') {
    for (let i = 0; i < 4; i++) { c.fillStyle = K.parties[i]; c.beginPath(); c.moveTo(-H * 0.45, 0); c.arc(-H * 0.45, 0, H * 0.34, i * Math.PI / 2, (i + 1) * Math.PI / 2); c.closePath(); c.fill(); }
    c.fillStyle = '#f2f0ea'; circle(c, -H * 0.45, 0, H * 0.1);
  } else {
    c.fillStyle = K.body; ell(c, -H * 0.55, 0, H * 0.36, H * 0.74); c.fill();
  }
  // the smile of someone who will get back to you on that
  c.strokeStyle = '#2a0e0a'; c.lineWidth = H * (0.1 + o * 0.08); c.lineCap = 'round';
  c.beginPath(); c.arc(H * 0.55, 0, H * 0.42, -0.95 - o * 0.2, 0.95 + o * 0.2); c.stroke();
  if (o > 0.3) { c.fillStyle = '#2a0e0a'; ell(c, H * 0.86, 0, H * 0.1 * o, H * 0.3 * o); c.fill(); }
}
// tags, shields, stars and raised papers, on top of any worm
function drawSnakeExtras(c, sn, t) {
  if (sn.burrowed || !sn.alive) return;
  const H = sn.headR;
  if (sn.shieldT > 0) {
    const a = 0.45 + 0.25 * Math.sin(t * 8);
    c.strokeStyle = `rgba(255,205,90,${a})`; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.lineDashOffset = -t * 20;
    c.beginPath(); c.arc(sn.x, sn.y, H + 6, 0, TAU); c.stroke(); c.setLineDash([]);
    c.fillStyle = `rgba(255,205,90,${a * 0.6})`;
    for (let k = 1; k < sn.pts.length; k += 2) { const p = sn.pts[k]; if (!p.hid) circle(c, p.x, p.y, 1.4); }
  }
  if (sn.tagT > 0) {
    const sw = Math.sin(t * 4 + sn.blinkSeed) * 0.4;
    const bx = sn.x - Math.cos(sn.drawAng) * H * 0.6, by = sn.y - Math.sin(sn.drawAng) * H * 0.6;
    c.strokeStyle = 'rgba(30,20,10,0.7)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 4, by + 9); c.stroke();
    drawPriceTag(c, bx + 6, by + 13, 0.8, 1.2 + sw, '#ffd84a', '#3a2808', '-40');
  }
  if (sn.stun > 0) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i * TAU) / 3;
      sparkle(c, sn.x + Math.cos(a) * (H + 4), sn.y - H - 5 + Math.sin(a) * 3, 3.2, '#ffe28a');
    }
  }
  if (sn.raise > 0.05) {
    const r = sn.raise, x = sn.x + 5, y = sn.y - H - 6 - r * 8;
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 9 + sn.blinkSeed) * 0.15);
    c.globalAlpha = Math.min(1, r * 1.5);
    c.fillStyle = '#f2f0ea'; c.fillRect(-5, -7, 10, 13);
    c.strokeStyle = 'rgba(40,40,60,0.55)'; c.lineWidth = 0.7;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-3.5, -4.5 + i * 3); c.lineTo(3.5, -4.5 + i * 3); c.stroke(); }
    c.restore(); c.globalAlpha = 1;
  }
  if (sn.daze > 0 && !sn.isBoss) {
    c.fillStyle = 'rgba(255,236,140,0.85)';
    for (let i = 0; i < 3; i++) { const a = t * 6 + (i * TAU) / 3; circle(c, sn.x + Math.cos(a) * (H + 3), sn.y - H - 3 + Math.sin(a) * 2.5, 1.5); }
  }
  drawTrait(c, sn, t);
}
function glowEyes2(c, sn, t, P, loc, lookAt, open) {
  const H = sn.headR, ec = EYE2[sn.kind] || ['#ffd166', '#3a2010'];
  const ex = SUIT_HEAD[sn.kind] ? H * 0.28 : H * 0.18, ey = H * 0.44, er = H * (sn.isBoss ? 0.24 : 0.26);
  for (const s of [-1, 1]) { const [x, y] = loc(ex, s * ey); glowDot(c, x, y, H * 1.1, ec[0], 0.38 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const s of [-1, 1]) { const [x, y] = loc(ex, s * ey); eyeball(c, x, y, er, open, lookAt(x, y), ec[1], false); }
  if (sn.kind === 'coalition' && sn.act) {
    const col = { charge: '#e8742a', spit: '#2a6ad8', dig: '#3aa84a', summon: '#8a3ad8' }[sn.act];
    c.globalCompositeOperation = 'lighter'; glowDot(c, sn.x, sn.y, H * 3, col, 0.3 + 0.15 * Math.sin(t * 12)); c.globalCompositeOperation = 'source-over';
  }
  if (sn.enraged) { c.globalCompositeOperation = 'lighter'; glowDot(c, sn.x, sn.y, H * 2.6, '#ff3a2a', 0.18 + 0.1 * Math.sin(t * 10)); c.globalCompositeOperation = 'source-over'; }
}

/* ------------------------------------------------------------------ supermarket and chamber rooms */
const PRODUCT_COLS = ['#d8342c', '#f2c200', '#1aa0e0', '#3aa84a', '#f08a2c', '#e8e2d0', '#8a3ad8', '#c0c8d0', '#5a3a20', '#e86a9a'];
const PROMOS = ['BONUS', '1+1 GRATIS', '2e HALVE PRIJS', 'OP=OP', 'KORTING', '3 VOOR 2', 'AANBIEDING'];
function drawShelf(c, o, rng) {
  const x = o.x - T / 2 + 2, y = o.y - T / 2 + 3, w = T - 4, h = T - 6;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 5, w, h);
  c.fillStyle = '#2a2e34'; rrect(c, x, y, w, h, 2); c.fill();
  c.fillStyle = '#6a707a'; rrect(c, x + 1.5, y + 1.5, w - 3, h - 3, 1.5); c.fill();
  // two rows of products seen from above
  for (let row = 0; row < 2; row++) {
    const ry = y + 3 + row * (h - 6) / 2;
    let cx = x + 3;
    while (cx < x + w - 5) {
      const pw = 4 + Math.floor(rng() * 4), col = PRODUCT_COLS[Math.floor(rng() * PRODUCT_COLS.length)];
      if (cx + pw > x + w - 3) break;
      const round = rng() < 0.35;
      c.fillStyle = col;
      if (round) circle(c, cx + pw / 2, ry + (h - 6) / 4, pw / 2);
      else c.fillRect(cx, ry + 1, pw, (h - 6) / 2 - 2);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(cx, ry + 1, pw, 1.2);
      cx += pw + 1;
    }
  }
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 1.5, o.y - 0.6, w - 3, 1.2);
  if (rng() < 0.4) { c.fillStyle = '#f2f0ea'; c.fillRect(x + 4 + rng() * (w - 14), y + h - 4, 7, 3); c.fillStyle = '#d8342c'; c.fillRect(x + 5 + rng() * (w - 14), y + h - 3.6, 2, 2); }
}
function drawDesk(c, o, rng) {
  const x = o.x - T / 2 + 2, y = o.y - T / 2 + 4, w = T - 4, h = T - 9;
  c.fillStyle = 'rgba(0,0,0,0.45)'; rrect(c, x + 3, y + 5, w, h, 3); c.fill();
  c.fillStyle = '#2a170a'; rrect(c, x, y, w, h, 3); c.fill();
  const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#6e4628');
  rrect(c, x + 1.5, y + 1.5, w - 3, h - 3, 2.4); c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(40,20,8,0.35)'; c.lineWidth = 0.7;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x + 2, y + i * h / 4); c.lineTo(x + w - 2, y + i * h / 4 + (rng() - 0.5) * 2); c.stroke(); }
  // papers, a microphone and a little name plate
  c.save(); c.translate(x + 9 + rng() * 6, y + h / 2); c.rotate((rng() - 0.5) * 0.5);
  c.fillStyle = '#e8e2d0'; c.fillRect(-5, -6, 10, 12); c.fillStyle = '#f6f2e6'; c.fillRect(-4, -7, 10, 12);
  c.restore();
  c.strokeStyle = '#141414'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(x + w - 9, y + h - 6); c.quadraticCurveTo(x + w - 4, y + h / 2, x + w - 8, y + 6); c.stroke();
  c.fillStyle = '#1a1a1a'; circle(c, x + w - 8, y + 5.5, 2.4);
  c.fillStyle = '#d0c7b4'; c.fillRect(x + w / 2 - 5, y + h - 5, 10, 3.4);
}
function drawWetSign(c, o) {
  const x = o.x, y = o.y + 2;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 10, 13, 5); c.fill();
  c.fillStyle = '#1a1600';
  c.beginPath(); c.moveTo(x, y - 13); c.lineTo(x + 12, y + 9); c.lineTo(x - 12, y + 9); c.closePath(); c.fill();
  c.fillStyle = '#f2c200';
  c.beginPath(); c.moveTo(x, y - 10.5); c.lineTo(x + 9.6, y + 7.4); c.lineTo(x - 9.6, y + 7.4); c.closePath(); c.fill();
  c.fillStyle = '#1a1600'; c.fillRect(x - 1.2, y - 4, 2.4, 6.5); circle(c, x, y + 4.8, 1.3);
}
function drawCounter(c, o, room, L) {
  const x = o.x - T / 2, y = o.y - T / 2 + 6, w = T, h = T - 12;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 5, w, h);
  c.fillStyle = '#20232a'; c.fillRect(x, y, w, h);
  c.fillStyle = room.store === 'yellow' ? '#c9a000' : room.store === 'blue' ? '#167fb4' : '#6a4a2a'; c.fillRect(x, y + h - 5, w, 5);
  c.fillStyle = '#d8dce2'; c.fillRect(x, y, w, h - 6);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, y + h - 9, w, 2);
  // the first counter has the till
  if (!room.tillDone) {
    room.tillDone = true;
    c.fillStyle = '#2a2e36'; rrect(c, o.x - 9, y + 2, 18, 13, 2); c.fill();
    c.fillStyle = '#5fd06a'; c.fillRect(o.x - 6, y + 4, 12, 4);
    c.fillStyle = '#9aa2ae'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c.fillRect(o.x - 6 + i * 4.4, y + 9.5 + j * 2.6, 3, 1.8);
  } else if ((o.c + o.r) % 2) {
    c.fillStyle = PRODUCT_COLS[(o.c * 3 + o.r) % PRODUCT_COLS.length]; c.fillRect(o.x - 6, y + 4, 9, 7);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(o.x - 6, y + 4, 9, 1.5);
  }
}
function drawLectern(c, o, L) {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 14, 18, 6); c.fill();
  c.fillStyle = '#1e1208';
  c.beginPath(); c.moveTo(x - 15, y - 10); c.lineTo(x + 15, y - 10); c.lineTo(x + 12, y + 13); c.lineTo(x - 12, y + 13); c.closePath(); c.fill();
  const g = c.createLinearGradient(x, y - 10, x, y + 13); g.addColorStop(0, '#a87442'); g.addColorStop(1, '#6a4424');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(x - 13.5, y - 8.5); c.lineTo(x + 13.5, y - 8.5); c.lineTo(x + 10.8, y + 11.5); c.lineTo(x - 10.8, y + 11.5); c.closePath(); c.fill();
  c.fillStyle = '#2a63c9'; c.fillRect(x - 10, y + 2, 20, 4);
  c.fillStyle = '#f2f0ea'; c.fillRect(x - 6, y - 7, 12, 8);
  c.strokeStyle = '#121212'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(x + 6, y - 9); c.quadraticCurveTo(x + 9, y - 16, x + 3, y - 19); c.stroke();
  c.fillStyle = '#121212'; circle(c, x + 3, y - 19, 2.2);
}
function drawBox(c, o, L, t) {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  const x = o.x + sh, y = o.y + 1, s = 14;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - s + 3, y - s + 5, s * 2, s * 2);
  c.fillStyle = '#3a2610'; c.fillRect(x - s - 1, y - s - 1, s * 2 + 2, s * 2 + 2);
  c.fillStyle = L.clay; c.fillRect(x - s, y - s, s * 2, s * 2);
  c.fillStyle = L.clayLo; c.fillRect(x - s, y + s - 4, s * 2, 4);
  c.fillStyle = 'rgba(255,240,210,0.18)'; c.fillRect(x - s, y - s, s * 2, 2);
  c.fillStyle = '#c9b48a'; c.fillRect(x - 2.5, y - s, 5, s * 2);
  c.strokeStyle = 'rgba(40,24,8,0.6)'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(x - 9, y + 6); c.lineTo(x - 9, y + 1); c.moveTo(x - 11, y + 3); c.lineTo(x - 9, y + 1); c.lineTo(x - 7, y + 3); c.stroke();
  if (o.hp < o.max) {
    c.strokeStyle = 'rgba(30,16,6,0.85)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(x + 4, y - 9); c.lineTo(x + 8, y - 2); c.lineTo(x + 5, y + 4);
    if (o.hp < o.max - 1) { c.moveTo(x - 6, y - 10); c.lineTo(x - 10, y - 4); c.lineTo(x - 6, y + 1); }
    c.stroke();
  }
}
function drawPapers(c, o, L, t) {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  const x = o.x + sh, y = o.y + 2;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 12, 15, 5); c.fill();
  const n = 2 + o.hp;
  for (let i = 0; i < n; i++) {
    c.save(); c.translate(x + Math.sin(i * 2.1 + o.seed * 9) * 2, y + 6 - i * 3); c.rotate(Math.sin(i * 1.7 + o.seed * 5) * 0.18);
    c.fillStyle = '#1a1612'; c.fillRect(-12, -9, 24, 17);
    c.fillStyle = i === n - 1 ? '#f6f2e6' : '#e2dccb'; c.fillRect(-11, -8, 22, 15);
    if (i === n - 1) {
      c.strokeStyle = 'rgba(40,40,60,0.5)'; c.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-8, -5 + k * 3.2); c.lineTo(8 - (k === 3 ? 6 : 0), -5 + k * 3.2); c.stroke(); }
      c.fillStyle = '#c3243a'; circle(c, 6, 4, 2.2);
    }
    c.restore();
  }
  c.fillStyle = '#2a2a30'; c.fillRect(x - 3, y - 6 - n * 3, 6, 4);
}
function drawCarton(c, o, L, t) {
  const sh = o.shake > 0 ? Math.sin(t * 60) * o.shake * 6 : 0;
  const tw = o.wob > 0 ? Math.sin(t * 38) * o.wob * 2 : 0;
  const x = o.x + sh, y = o.y + 2;
  c.fillStyle = 'rgba(0,0,0,0.38)'; c.fillRect(x - 15, y - 9, 32, 22);
  c.fillStyle = '#5a5246'; rrect(c, x - 16, y - 11, 32, 22, 3); c.fill();
  c.fillStyle = '#a89e8a'; rrect(c, x - 15, y - 10, 30, 20, 2.5); c.fill();
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const ex = x - 10 + i * 10, ey = y - 5 + j * 10;
    if (o.hp < o.max && i === 2 && j === 0) { c.fillStyle = '#6e6656'; circle(c, ex, ey, 3.5); continue; }
    c.fillStyle = '#7a7262'; circle(c, ex, ey, 4.6);
    const g = c.createRadialGradient(ex - 1.5, ey - 1.5, 0.5, ex, ey, 4.5);
    g.addColorStop(0, '#fbf4e4'); g.addColorStop(1, '#d6c6a6');
    c.fillStyle = g; circle(c, ex + (i === 1 ? tw : 0), ey, 3.9);
  }
}
function drawMarketDeco(c, rng, L, room) {
  // painted aisle lines, a spilled carton of milk, crushed grapes, receipts
  c.strokeStyle = 'rgba(242,194,0,0.22)'; c.lineWidth = 3; c.setLineDash([12, 9]);
  c.beginPath(); c.moveTo(RW / 2, 12); c.lineTo(RW / 2, RH - 12); c.stroke(); c.setLineDash([]);
  if (rng() < 0.6) {
    const x = 50 + rng() * (RW - 100), y = 50 + rng() * (RH - 100);
    c.fillStyle = 'rgba(240,238,228,0.5)';
    c.beginPath(); c.moveTo(x + 16, y); c.arc(x, y, 16, 0, TAU);
    for (let i = 0; i < 6; i++) { const a = rng() * TAU, rr = 12 + rng() * 14; c.moveTo(x + Math.cos(a) * rr + 6, y + Math.sin(a) * rr); c.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 4 + rng() * 5, 0, TAU); }
    c.fill();
    c.save(); c.translate(x + 14, y - 8); c.rotate(rng() * TAU);
    c.fillStyle = '#e8e8e8'; c.fillRect(-5, -8, 10, 16); c.fillStyle = '#1aa0e0'; c.fillRect(-5, -2, 10, 5);
    c.restore();
  }
  for (let i = 0; i < 4; i++) {
    c.save(); c.translate(30 + rng() * (RW - 60), 30 + rng() * (RH - 60)); c.rotate(rng() * TAU);
    c.fillStyle = 'rgba(236,232,220,0.4)'; c.fillRect(-4, -7, 8, 14);
    c.fillStyle = 'rgba(60,60,60,0.35)'; for (let k = 0; k < 4; k++) c.fillRect(-3, -5 + k * 3, 4 + (k % 2) * 2, 0.8);
    c.restore();
  }
  for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(90,30,60,0.45)'; circle(c, 30 + rng() * (RW - 60), 30 + rng() * (RH - 60), 2.5 + rng() * 2); }
}
function drawCarpet(c, room, L, rng) {
  c.fillStyle = L.floor; c.fillRect(0, 0, RW, RH);
  // a woven diamond pattern
  c.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < RH; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < RW; x += 16) { c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 3, y); c.lineTo(x, y + 3); c.lineTo(x - 3, y); c.closePath(); c.fill(); }
  // the aisle runner from door to door, with a gold edge
  const rw = 70;
  c.fillStyle = '#16294f'; c.fillRect(RW / 2 - rw / 2, 0, rw, RH);
  c.strokeStyle = 'rgba(214,170,80,0.5)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(RW / 2 - rw / 2 + 3, 0); c.lineTo(RW / 2 - rw / 2 + 3, RH); c.moveTo(RW / 2 + rw / 2 - 3, 0); c.lineTo(RW / 2 + rw / 2 - 3, RH); c.stroke();
  for (let i = 0; i < 60; i++) { c.fillStyle = rng() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.03)'; ell(c, rng() * RW, rng() * RH, 3 + rng() * 9, 2 + rng() * 5, rng() * 3); c.fill(); }
}
function drawChamberDeco(c, rng, L) {
  for (let i = 0; i < 6; i++) {
    c.save(); c.translate(30 + rng() * (RW - 60), 30 + rng() * (RH - 60)); c.rotate(rng() * TAU);
    c.fillStyle = 'rgba(232,226,208,0.32)'; c.fillRect(-6, -8, 12, 16);
    c.fillStyle = 'rgba(40,40,60,0.25)'; for (let k = 0; k < 4; k++) c.fillRect(-4, -5 + k * 3, 8 - (k === 3 ? 4 : 0), 0.8);
    c.restore();
  }
  c.fillStyle = 'rgba(90,10,20,0.35)';
  for (let i = 0; i < 3; i++) circle(c, 40 + rng() * (RW - 80), 40 + rng() * (RH - 80), 2 + rng() * 3);
}
// posters along the store walls, in the colours of the store
function drawStoreWalls(c, room, L, rng) {
  const blue = room.store === 'blue', base = blue ? '#167fb4' : '#d8ac00', ink = blue ? '#ffffff' : '#151515';
  c.fillStyle = base; c.fillRect(-WALL, -WALL * 0.32, VIEW_W, 4); c.fillRect(-WALL, RH + WALL * 0.32 - 4, VIEW_W, 4);
  const spots = [[118, -WALL / 2], [RW - 118, -WALL / 2], [118, RH + WALL / 2], [RW - 118, RH + WALL / 2]];
  c.font = '700 9px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const [x, y] of spots) {
    if (rng() < 0.2) continue;
    const txt = PROMOS[Math.floor(rng() * PROMOS.length)], w = Math.min(66, Math.max(40, c.measureText(txt).width + 12));
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(x - w / 2 + 1.5, y - 8 + 1.5, w, 16);
    c.fillStyle = blue ? '#ffffff' : '#f2c200'; c.fillRect(x - w / 2, y - 8, w, 16);
    c.fillStyle = blue ? base : '#151515'; c.fillRect(x - w / 2, y + 4, w, 4);
    c.fillStyle = blue ? base : ink; c.fillText(txt, x, y - 1.5);
    if (!blue) { c.fillStyle = '#151515'; for (let k = 0; k < 4; k++) c.fillRect(x - w / 2 + 2 + k * (w / 4), y + 5, w / 8, 2); }
  }
}
function drawChamberWalls(c, room, L, rng) {
  c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
  for (let x = -WALL + 18; x < RW + WALL; x += 36) { c.beginPath(); c.moveTo(x, -WALL + 3); c.lineTo(x, -3); c.moveTo(x, RH + 3); c.lineTo(x, RH + WALL - 3); c.stroke(); }
  c.strokeStyle = 'rgba(214,170,80,0.35)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-WALL + 4, -WALL * 0.5); c.lineTo(RW + WALL - 4, -WALL * 0.5); c.moveTo(-WALL + 4, RH + WALL * 0.5); c.lineTo(RW + WALL - 4, RH + WALL * 0.5); c.stroke();
  // a big clock above the north door that never gets to the end of the debate
  const x = RW * 0.32, y = -WALL / 2;
  c.fillStyle = '#1a1208'; circle(c, x, y, 9.5); c.fillStyle = '#e8e2d0'; circle(c, x, y, 8);
  c.strokeStyle = '#1a1208'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 6); c.moveTo(x, y); c.lineTo(x + 4.5, y + 1.5); c.stroke();
}
// belts, spike plates, frost: painted once into the room cache
function drawFloorExtras(c, room, L, rng) {
  if (room.ice) {
    c.fillStyle = 'rgba(170,215,255,0.16)'; c.fillRect(0, 0, RW, RH);
    c.strokeStyle = 'rgba(220,240,255,0.25)'; c.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const side = Math.floor(rng() * 4); let x = rng() * RW, y = rng() * RH;
      if (side === 0) y = rng() * 30; else if (side === 1) y = RH - rng() * 30; else if (side === 2) x = rng() * 30; else x = RW - rng() * 30;
      const a = rng() * TAU, l = 6 + rng() * 12;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.moveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5); c.lineTo(x + Math.cos(a + 0.8) * l * 0.8, y + Math.sin(a + 0.8) * l * 0.8); c.stroke();
    }
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(230,245,255,0.14)'; ell(c, 40 + rng() * (RW - 80), 40 + rng() * (RH - 80), 18 + rng() * 26, 8 + rng() * 12, rng() * 3); c.fill(); }
  }
  for (const b of room.belts) {
    const x = b.c * T, y = b.r * T;
    c.fillStyle = '#121418'; c.fillRect(x, y + 3, T, T - 6);
    c.fillStyle = '#23262c'; c.fillRect(x, y + 6, T, T - 12);
    c.fillStyle = '#5a5f68'; c.fillRect(x, y + 3, T, 2); c.fillRect(x, y + T - 5, T, 2);
    c.fillStyle = '#3a3e46'; for (let k = 0; k < 4; k++) circle(c, x + 5 + k * 10, y + 4, 1);
  }
  for (const s of room.spikes) {
    const x = s.c * T + 4, y = s.r * T + 4, w = T - 8;
    c.fillStyle = 'rgba(0,0,0,0.35)'; rrect(c, x + 1.5, y + 2, w, w, 3); c.fill();
    c.fillStyle = '#3a3c42'; rrect(c, x, y, w, w, 3); c.fill();
    c.fillStyle = '#4c4f57'; rrect(c, x + 1.5, y + 1.5, w - 3, w - 3, 2); c.fill();
    c.fillStyle = '#16171a';
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) circle(c, x + w * (0.22 + i * 0.28), y + w * (0.22 + j * 0.28), 2);
  }
  if (room.type === 'shop') {
    c.fillStyle = 'rgba(20,24,30,0.35)'; rrect(c, T * 1.5, T * 3.4, T * 8, T * 3.9, 6); c.fill();
    c.strokeStyle = room.store === 'yellow' ? 'rgba(242,194,0,0.35)' : 'rgba(26,160,224,0.35)'; c.lineWidth = 2; rrect(c, T * 1.5, T * 3.4, T * 8, T * 3.9, 6); c.stroke();
  }
}
// moving parts drawn every frame
function drawBelts(c, room, t) {
  const ph = (room.beltPh || 0) % 14;
  c.strokeStyle = 'rgba(160,168,180,0.5)'; c.lineWidth = 1.6;
  for (const b of room.belts) {
    const x = b.c * T, y = b.r * T;
    c.save(); c.beginPath(); c.rect(x, y + 6, T, T - 12); c.clip();
    for (let k = -1; k < 4; k++) {
      const cx = x + k * 14 + (b.dir > 0 ? ph : 14 - ph);
      c.beginPath(); c.moveTo(cx - 3 * b.dir, y + 11); c.lineTo(cx + 3 * b.dir, y + T / 2); c.lineTo(cx - 3 * b.dir, y + T - 11); c.stroke();
    }
    c.restore();
  }
}
function drawSpikes(c, room, t) {
  for (const s of room.spikes) {
    const h = s.h || 0;
    if (h < 0.03) continue;
    const x = s.c * T + 4, y = s.r * T + 4, w = T - 8;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const sx = x + w * (0.22 + i * 0.28), sy = y + w * (0.22 + j * 0.28), hh = 9 * h;
      c.fillStyle = '#1a1b1e'; c.beginPath(); c.moveTo(sx - 2.6, sy + 1); c.lineTo(sx, sy - hh); c.lineTo(sx + 2.6, sy + 1); c.closePath(); c.fill();
      c.fillStyle = h > 0.7 ? '#c8ccd4' : '#8a8e96'; c.beginPath(); c.moveTo(sx - 1.6, sy + 0.5); c.lineTo(sx, sy - hh + 1); c.lineTo(sx + 1, sy + 0.5); c.closePath(); c.fill();
    }
    if (s.warn && !s.up) { c.strokeStyle = `rgba(255,90,60,${0.3 + 0.3 * Math.sin(t * 30)})`; c.lineWidth = 1.2; rrect(c, x - 1, y - 1, w + 2, w + 2, 3); c.stroke(); }
  }
}
function drawCart(c, k, room) {
  const sp = Math.hypot(k.vx, k.vy);
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, k.x + 3, k.y + 5, 15, 10, k.ang); c.fill();
  c.save(); c.translate(k.x, k.y); c.rotate(k.ang);
  if (k.temp != null && k.temp < 1.2) c.globalAlpha = Math.max(0, k.temp / 1.2);
  const jig = sp > 60 ? Math.sin(k.spin * 0.6) * 0.6 : 0;
  c.fillStyle = '#16181c';
  for (const [wx, wy] of [[-9, -9], [-9, 9], [9, -8], [9, 8]]) circle(c, wx, wy + jig * (wx > 0 ? 1 : -1), 2.4);
  c.fillStyle = '#2a2e34'; rrect(c, -11.5, -9.5, 22, 19, 3); c.fill();
  c.fillStyle = 'rgba(180,190,200,0.22)'; rrect(c, -10, -8, 19, 16, 2); c.fill();
  c.strokeStyle = '#b8c0c8'; c.lineWidth = 1.1;
  rrect(c, -10, -8, 19, 16, 2); c.stroke();
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-10 + i * 4.75, -8); c.lineTo(-10 + i * 4.75, 8); c.stroke(); }
  for (let j = 1; j < 3; j++) { c.beginPath(); c.moveTo(-10, -8 + j * 5.3); c.lineTo(9, -8 + j * 5.3); c.stroke(); }
  // the handle is at the back
  const hc = room.store === 'yellow' ? '#f2c200' : room.store === 'blue' ? '#1aa0e0' : '#c3243a';
  c.fillStyle = '#16181c'; c.fillRect(-15, -9, 4, 18);
  c.fillStyle = hc; c.fillRect(-14.4, -8.4, 2.8, 16.8);
  if (k.last === 'worm' && sp > 120) { c.strokeStyle = 'rgba(255,90,60,0.7)'; c.lineWidth = 1.4; rrect(c, -13, -11, 26, 22, 4); c.stroke(); }
  c.restore(); c.globalAlpha = 1;
}
function drawCoin(c, p, t) {
  const bob = Math.sin(t * 4 + p.ph) * 1.2, sx = Math.max(0.18, Math.abs(Math.cos(t * 4.5 + p.ph)));
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, p.x + 1, p.y + 5, 4.5, 1.8); c.fill();
  c.save(); c.translate(p.x, p.y - 2 + bob); c.scale(sx, 1);
  c.fillStyle = '#7a5208'; circle(c, 0, 0, 5.2);
  c.fillStyle = '#f2c230'; circle(c, 0, 0, 4.4);
  c.fillStyle = '#c99a1a'; circle(c, 0, 0, 2.8);
  c.fillStyle = 'rgba(255,250,210,0.8)'; circle(c, -1.4, -1.6, 1.1);
  c.restore();
}
function coinIcon(c, x, y, r) {
  c.fillStyle = '#7a5208'; circle(c, x, y, r + 0.9);
  c.fillStyle = '#f2c230'; circle(c, x, y, r);
  c.fillStyle = '#c99a1a'; circle(c, x, y, r * 0.6);
  c.fillStyle = 'rgba(255,250,210,0.8)'; circle(c, x - r * 0.3, y - r * 0.35, r * 0.25);
}
function drawPriceLabel(c, x, y, cost, can) {
  c.save(); c.translate(x, y);
  c.font = '700 9px "Barlow Condensed", "Arial Narrow", sans-serif';
  const txt = String(cost), w = c.measureText(txt).width + 18;
  c.fillStyle = 'rgba(10,8,6,0.85)'; rrect(c, -w / 2, -6.5, w, 13, 6.5); c.fill();
  c.strokeStyle = can ? 'rgba(242,194,48,0.85)' : 'rgba(200,80,80,0.7)'; c.lineWidth = 1; rrect(c, -w / 2 + 0.5, -6, w - 1, 12, 6); c.stroke();
  coinIcon(c, -w / 2 + 6.5, 0, 3.2);
  c.fillStyle = can ? '#ffe7a0' : '#ff9a8a'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(txt, -w / 2 + 12, 0.5);
  c.restore();
}
// venom that is not a blob: price tags, papers and coins
function drawVenomThing(c, v, t) {
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, v.x + 1, v.y + 6, v.r * 0.9, v.r * 0.4); c.fill();
  if (v.kind === 'tag') drawPriceTag(c, v.x, v.y, 1.1, v.spin || 0, '#ffffff', '#1a6ab0', '%');
  else if (v.kind === 'paper') {
    c.save(); c.translate(v.x, v.y); c.rotate(v.spin || 0);
    c.fillStyle = '#1a1612'; c.fillRect(-6, -7.5, 12, 15); c.fillStyle = '#f6f2e6'; c.fillRect(-5, -6.5, 10, 13);
    c.fillStyle = 'rgba(40,40,60,0.5)'; for (let k = 0; k < 3; k++) c.fillRect(-3.5, -3.5 + k * 3, 7, 0.9);
    c.restore();
  } else if (v.kind === 'coin') { c.save(); c.translate(v.x, v.y); c.scale(Math.max(0.25, Math.abs(Math.cos(v.t * 12))), 1); coinIcon(c, 0, 0, 4.6); c.restore(); }
  else if (v.kind === 'bolt') drawBolt(c, v, t);
  else if (VENOM9[v.kind]) VENOM9[v.kind](c, v, t);
}
// the tubes hang from the ceiling, so they are only a faint pale streak over the room
function drawTubeLights(c, room, t) {
  if (!room.tubes) return;
  c.globalCompositeOperation = 'lighter';
  for (const s of room.tubes) {
    const lv = tubeLevel(s, t);
    c.fillStyle = `rgba(200,220,255,${0.05 + 0.1 * lv})`;
    rrect(c, s.x - s.w / 2, s.y - 1.5, s.w, 3, 1.5); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
}
function tubeLevel(s, t) {
  if (!s.broken) return 0.85 + 0.05 * Math.sin(t * 90 + s.ph);
  const k = Math.sin(t * 7.3 + s.ph) + Math.sin(t * 17.1 + s.ph * 2) + Math.sin(t * 41 + s.ph * 3);
  return k > 1.2 ? 0.06 : k > 0.6 ? 0.45 : 0.8;
}
function drawShopNeon(c, room, t) {
  if (room.type !== 'shop') return;
  const on = Math.sin(t * 13) + Math.sin(t * 5.1) > -1.4;
  const x = RW / 2, y = 18;
  c.font = '700 13px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (on) { c.globalCompositeOperation = 'lighter'; glowDot(c, x, y, 40, '#ff3a5a', 0.25); c.globalCompositeOperation = 'source-over'; }
  c.fillStyle = on ? '#ff8a9a' : '#5a2a30'; c.fillText('OPEN 24/7', x, y);
}
function drawFlood(c, t) {
  const f = G.flood; if (!f) return;
  const x = f.x, w = 46;
  const g = c.createLinearGradient(x - w * f.dir, 0, x + w * 0.4 * f.dir, 0);
  g.addColorStop(0, 'rgba(60,140,220,0)'); g.addColorStop(0.75, 'rgba(70,150,230,0.42)'); g.addColorStop(1, 'rgba(220,240,255,0.75)');
  c.fillStyle = g; c.fillRect(Math.min(x - w * f.dir, x + w * 0.4 * f.dir), 0, w * 1.4, RH);
  c.strokeStyle = 'rgba(240,250,255,0.85)'; c.lineWidth = 2;
  c.beginPath();
  for (let y = 0; y <= RH; y += 10) { const xx = x + f.dir * (2 + Math.sin(y * 0.15 + t * 14) * 3); if (y) c.lineTo(xx, y); else c.moveTo(xx, y); }
  c.stroke();
}
// the apple's Dutch extras: clogs, syrup, a windmill and two party worms
function drawPlayerUnder(c, P, t) {
  if (P.klomp) {
    const step = Math.sin(P.hop) * 2;
    for (const s of [-1, 1]) {
      c.save(); c.translate(P.x + s * 6.5, P.y + 11 + (s > 0 ? step : -step) * 0.5); c.rotate(-0.15 * s);
      c.fillStyle = '#3a2a08'; ell(c, 0, 0, 4.4, 6.6); c.fill();
      c.fillStyle = '#f2c230'; ell(c, 0, -0.3, 3.6, 5.8); c.fill();
      c.fillStyle = '#c99a1a'; ell(c, 0, -2.4, 2.2, 2.4); c.fill();
      c.restore();
    }
  }
  if (P.coalitie) for (const w of P.coalitie) drawPartyBuddy(c, w, t);
}
function drawPlayerOver(c, P, t) {
  drawPlayerOver9(c, P, t);
  if (P.syrup) {
    c.strokeStyle = `rgba(216,144,42,${0.55 + 0.2 * Math.sin(t * 5)})`; c.lineWidth = 2.2;
    c.beginPath(); c.arc(P.x, P.y - 1, P.R + 4, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(216,144,42,0.7)'; ell(c, P.x + 9, P.y + 12, 1.6, 2.6); c.fill();
  }
  if (P.molen) {
    const x = P.x + 20, y = P.y - 24 + Math.sin(t * 2) * 1.5;
    c.fillStyle = '#5a3a20'; c.beginPath(); c.moveTo(x - 4, y + 9); c.lineTo(x + 4, y + 9); c.lineTo(x + 2.4, y - 2); c.lineTo(x - 2.4, y - 2); c.closePath(); c.fill();
    c.save(); c.translate(x, y - 2); c.rotate(P.molenA || 0);
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.fillStyle = '#f2f0ea'; c.fillRect(-1, 0, 2.6, 9); c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 0.5; c.strokeRect(-1, 0, 2.6, 9); }
    c.restore();
    c.fillStyle = '#2a1a0c'; circle(c, x, y - 2, 1.2);
  }
}
function drawPartyBuddy(c, w, t) {
  if (w.x == null) return;
  const n = 5, dirA = w.a + Math.PI / 2, pts = [];
  for (let i = 0; i < n; i++) pts.push([w.x - Math.cos(dirA) * i * 3.6 + Math.sin(t * 9 + i) * 0.7, w.y - Math.sin(dirA) * i * 3.6 + Math.cos(t * 9 + i) * 0.7]);
  c.fillStyle = mixHex(w.col, '#000000', 0.5); for (let i = n - 1; i >= 0; i--) circle(c, pts[i][0], pts[i][1], 4.6 - i * 0.35);
  for (let i = n - 1; i >= 0; i--) { c.fillStyle = i % 2 ? mixHex(w.col, '#ffffff', 0.15) : w.col; circle(c, pts[i][0], pts[i][1], 3.4 - i * 0.3); }
  c.fillStyle = '#f2f0ea'; circle(c, pts[1][0], pts[1][1], 1.3);
  const [hx, hy] = pts[0];
  c.fillStyle = '#1a0a0e';
  circle(c, hx + Math.cos(dirA + 0.6) * 1.6, hy + Math.sin(dirA + 0.6) * 1.6, 0.7);
  circle(c, hx + Math.cos(dirA - 0.6) * 1.6, hy + Math.sin(dirA - 0.6) * 1.6, 0.7);
}

/* ------------------------------------------------------------------ the new powerup icons */
function drawItemIcon3(c, id, R, t) {
  if (id === 'bonus') {
    c.save(); c.rotate(-0.15);
    rrect(c, -R * 0.85, -R * 0.55, R * 1.7, R * 1.1, R * 0.14); c.fillStyle = '#1aa0e0'; c.fill();
    c.strokeStyle = '#06263a'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(-R * 0.85, -R * 0.2, R * 1.7, R * 0.22);
    c.fillStyle = '#eef6fb'; rrect(c, -R * 0.62, R * 0.12, R * 0.5, R * 0.26, R * 0.05); c.fill();
    c.fillStyle = '#f2c230'; circle(c, R * 0.45, R * 0.24, R * 0.16);
    c.restore();
  } else if (id === 'tag') {
    drawPriceTag(c, 0, 0, R / 10, -0.5, '#ffd84a', '#3a2808', '-40%');
    seedIcon(c, R * 0.5, R * 0.55, R * 0.24, 0.6);
  } else if (id === 'gratis') {
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * R * 0.32, R * 0.12); c.rotate(s * 0.3);
      applePath(c, R * 0.42); c.fillStyle = '#c9233a'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.06; c.stroke();
      c.save(); c.scale(0.8, 0.78); applePath(c, R * 0.42); c.fillStyle = '#f4e4c0'; c.fill(); c.restore();
      c.restore();
    }
    c.fillStyle = '#ffd84a'; c.font = `800 ${Math.round(R * 0.62)}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('1+1', 0, -R * 0.58);
  } else if (id === 'hagel') {
    rrect(c, -R * 0.8, -R * 0.62, R * 1.6, R * 1.3, R * 0.3); c.fillStyle = '#c99a5a'; c.fill();
    rrect(c, -R * 0.68, -R * 0.5, R * 1.36, R * 1.08, R * 0.22); c.fillStyle = '#f0dcae'; c.fill();
    for (let i = 0; i < 26; i++) {
      const x = (Math.sin(i * 12.9) * 0.5) * R * 1.2, y = (Math.cos(i * 7.7) * 0.42) * R * 1.0;
      c.save(); c.translate(x, y); c.rotate(i * 1.3);
      c.fillStyle = i % 5 === 0 ? '#e86a9a' : i % 7 === 0 ? '#6ac0f0' : '#4a2a16'; c.fillRect(-R * 0.08, -R * 0.025, R * 0.16, R * 0.05);
      c.restore();
    }
  } else if (id === 'kroket') {
    c.save(); c.rotate(-0.35);
    rrect(c, -R * 0.85, -R * 0.36, R * 1.7, R * 0.72, R * 0.36); c.fillStyle = '#7a4214'; c.fill();
    rrect(c, -R * 0.8, -R * 0.31, R * 1.6, R * 0.62, R * 0.31); c.fillStyle = '#c87a2a'; c.fill();
    c.fillStyle = '#9a5a1a'; for (let i = 0; i < 14; i++) circle(c, -R * 0.65 + (i % 7) * R * 0.22, (i < 7 ? -1 : 1) * R * 0.12, R * 0.05);
    c.fillStyle = 'rgba(255,230,180,0.4)'; rrect(c, -R * 0.6, -R * 0.26, R * 1.0, R * 0.12, R * 0.06); c.fill();
    c.restore();
    c.fillStyle = '#e8c22a'; ell(c, R * 0.55, R * 0.6, R * 0.28, R * 0.12); c.fill();
  } else if (id === 'klomp') {
    c.save(); c.rotate(-0.4);
    c.beginPath(); c.moveTo(-R * 0.9, R * 0.1); c.quadraticCurveTo(-R * 0.95, -R * 0.45, -R * 0.45, -R * 0.4); c.lineTo(R * 0.55, -R * 0.3);
    c.quadraticCurveTo(R * 1.0, -R * 0.2, R * 0.95, R * 0.15); c.quadraticCurveTo(R * 0.7, R * 0.45, R * 0.1, R * 0.42); c.lineTo(-R * 0.6, R * 0.45); c.closePath();
    c.fillStyle = '#f2c230'; c.fill(); c.strokeStyle = '#5a3a08'; c.lineWidth = R * 0.07; c.stroke();
    ell(c, -R * 0.42, -R * 0.08, R * 0.3, R * 0.2); c.fillStyle = '#3a2408'; c.fill();
    c.strokeStyle = '#c3243a'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(R * 0.15, -R * 0.2); c.quadraticCurveTo(R * 0.45, -R * 0.05, R * 0.15, R * 0.15); c.stroke();
    c.restore();
  } else if (id === 'motie') {
    c.fillStyle = '#f6f2e6'; rrect(c, -R * 0.6, -R * 0.82, R * 1.2, R * 1.6, R * 0.06); c.fill();
    c.strokeStyle = 'rgba(40,40,60,0.55)'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-R * 0.42, -R * 0.55 + i * R * 0.24); c.lineTo(R * 0.42, -R * 0.55 + i * R * 0.24); c.stroke(); }
    c.strokeStyle = '#3aa84a'; c.lineWidth = R * 0.16;
    c.beginPath(); c.moveTo(-R * 0.3, R * 0.42); c.lineTo(-R * 0.05, R * 0.65); c.lineTo(R * 0.45, R * 0.12); c.stroke();
  } else if (id === 'hamer') {
    c.save(); c.rotate(-0.7);
    c.fillStyle = '#5a3418'; c.fillRect(-R * 0.08, -R * 0.2, R * 0.16, R * 1.1);
    rrect(c, -R * 0.55, -R * 0.62, R * 1.1, R * 0.46, R * 0.1); c.fillStyle = '#8a5a2a'; c.fill();
    c.fillStyle = '#d6a74a'; c.fillRect(-R * 0.36, -R * 0.62, R * 0.1, R * 0.46); c.fillRect(R * 0.26, -R * 0.62, R * 0.1, R * 0.46);
    c.restore();
    c.fillStyle = '#6a4424'; ell(c, R * 0.35, R * 0.72, R * 0.5, R * 0.16); c.fill();
  } else if (id === 'stroop') {
    c.fillStyle = '#9a5a1a'; circle(c, 0, 0, R * 0.86);
    c.fillStyle = '#d89a4a'; circle(c, 0, 0, R * 0.78);
    c.save(); c.beginPath(); c.arc(0, 0, R * 0.78, 0, TAU); c.clip();
    c.strokeStyle = '#9a5a1a'; c.lineWidth = R * 0.07;
    for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * R * 0.22 - R, -R); c.lineTo(i * R * 0.22 + R, R); c.stroke(); c.beginPath(); c.moveTo(i * R * 0.22 + R, -R); c.lineTo(i * R * 0.22 - R, R); c.stroke(); }
    c.restore();
    c.fillStyle = 'rgba(160,80,10,0.7)'; ell(c, R * 0.25, R * 0.75 + Math.sin(t * 2) * R * 0.04, R * 0.12, R * 0.2); c.fill();
  } else if (id === 'molen') {
    c.fillStyle = '#5a3a20'; c.beginPath(); c.moveTo(-R * 0.35, R * 0.9); c.lineTo(R * 0.35, R * 0.9); c.lineTo(R * 0.2, -R * 0.15); c.lineTo(-R * 0.2, -R * 0.15); c.closePath(); c.fill();
    c.fillStyle = '#2a1a0c'; c.fillRect(-R * 0.08, R * 0.55, R * 0.16, R * 0.35);
    c.save(); c.translate(0, -R * 0.15); c.rotate(t * 1.5);
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.fillStyle = '#f2f0ea'; c.fillRect(-R * 0.08, 0, R * 0.2, R * 0.78); c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = R * 0.03; c.strokeRect(-R * 0.08, 0, R * 0.2, R * 0.78); }
    c.restore();
    c.fillStyle = '#2a1a0c'; circle(c, 0, -R * 0.15, R * 0.08);
  } else if (id === 'veto') {
    c.strokeStyle = '#c3243a'; c.lineWidth = R * 0.18;
    c.beginPath(); c.arc(0, 0, R * 0.72, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(-R * 0.5, R * 0.5); c.lineTo(R * 0.5, -R * 0.5); c.stroke();
    c.fillStyle = '#f2f0ea'; c.font = `800 ${Math.round(R * 0.5)}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('VETO', 0, R * 0.05);
  } else if (id === 'coalitie') {
    const draw = (col, ph, sgn) => {
      for (let i = 0; i < 6; i++) {
        const u = i / 5, x = lerp(-R * 0.75, R * 0.75, u), y = sgn * (Math.sin(u * 3.2 + ph + t * 3) * R * 0.18 + R * 0.24);
        c.fillStyle = mixHex(col, '#000000', 0.4); circle(c, x, y, R * 0.2); c.fillStyle = col; circle(c, x, y, R * 0.15);
      }
    };
    draw('#e8742a', 0, -1); draw('#2a6ad8', 1.4, 1);
    c.fillStyle = '#f2f0ea'; circle(c, R * 0.75, -R * 0.24, R * 0.06); circle(c, R * 0.75, R * 0.24, R * 0.06);
  } else if (id === 'deltaplan') {
    c.fillStyle = '#5a6070'; c.fillRect(-R * 0.95, R * 0.2, R * 0.4, R * 0.7); c.fillRect(R * 0.55, R * 0.2, R * 0.4, R * 0.7);
    c.fillStyle = '#3a4050'; c.fillRect(-R * 0.55, R * 0.42, R * 1.1, R * 0.48);
    c.fillStyle = '#2a6ad8';
    c.beginPath(); c.moveTo(-R * 0.95, R * 0.2);
    for (let i = 0; i <= 8; i++) c.lineTo(-R * 0.95 + i * R * 0.2375, -R * 0.15 + Math.sin(i * 1.2 + t * 4) * R * 0.15);
    c.lineTo(R * 0.95, R * 0.2); c.closePath(); c.fill();
    c.strokeStyle = '#dfeaff'; c.lineWidth = R * 0.06;
    c.beginPath(); for (let i = 0; i <= 8; i++) { const x = -R * 0.95 + i * R * 0.2375, y = -R * 0.15 + Math.sin(i * 1.2 + t * 4) * R * 0.15; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
  } else drawItemIcon4(c, id, R, t);
}

