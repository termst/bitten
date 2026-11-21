/* src/87-v14-looks.js: L1 (v14.4) snake looks. One parametric layer gives every snake kind its own body
   segment shape, one pattern, at most one or two parts (spine ridge, side leaves, legs, wings, collar, horns...),
   a tail and colour variants, read from the LOOK14 table. A new look is one table row.
   Design rules: one clear idea per kind, every part outlined with the kind's outline colour, part colours come
   from the kind's own palette ('$dark', '$light', '$body2', '$outline'...) unless the theme needs a fixed colour.
   Variants (`v`: hue shift in degrees, `l`: lightness shift) pick from the snake's blinkSeed at spawn, so no new
   random draws. Visual only: no Math.random, no writes to game rules, seeded runs and online lockstep stay identical. */
const LOOK14 = {
  grub:      { seg: 'flat', legs: { every: 2, len: 0.4 }, vars: [{ v: 0 }, { v: -15, l: -0.06 }, { v: 25, l: 0.02 }] },
  hood:      { seg: 'oval', pat: { type: 'bands', col: '$light', every: 3 }, tail: { type: 'whip' }, keys: ['hoodCol', 'scale', 'hoodRim'], vars: [{ v: 0 }, { v: 70, l: -0.04 }, { v: -40, l: 0.04 }] },
  lamprey:   { seg: 'oval', pat: { type: 'spine', col: '$dark', w: 0.22 }, tail: { type: 'fan', col: '$dark' }, vars: [{ v: 0 }, { v: 190, l: -0.08 }, { v: 25, l: -0.1 }] },
  long:      { seg: 'oval', tail: { type: 'whip', col: '$saddle' }, vars: [{ v: 0 }, { v: 30, l: -0.08 }] },
  rotter:    { seg: 'bead', pat: { type: 'warts', col: '$dark' }, vars: [{ v: 0 }, { v: -25, l: -0.06 }] },
  rocket:    { seg: 'plate', tail: { type: 'flame' }, glow: { tail: '#ffa040' }, keys: ['stripe'], vars: [{ v: 0 }, { v: -25 }, { v: 170, l: -0.05 }] },
  fuel:      { seg: 'plate', tail: { type: 'hose', col: '#1a1a1a' }, vars: [{ v: 0 }, { v: -130 }, { v: 90, l: -0.04 }] },
  bonus:     { seg: 'bead', pat: { type: 'stars', col: '#ffffff', every: 2 }, tail: { type: 'tag', col: '#ffe066' } },
  discount:  { seg: 'hex', pat: { type: 'barcode', every: 2 }, tail: { type: 'tag', col: '#e83a2a' } },
  kamerlid:  { seg: 'plate', pat: { type: 'buttons', col: '#e8e0c0', every: 2 }, vars: [{ v: 0 }, { v: 0, l: -0.08, s: 0.2 }, { v: 125, l: -0.02 }] },
  lobby:     { seg: 'oval', pat: { type: 'pinstripe', col: '$light' }, vars: [{ v: 0 }, { v: 0, l: -0.14 }, { v: 0, l: 0.14 }] },
  splitter:  { seg: 'bead', pat: { type: 'cell', col: '$dark' }, tail: { type: 'fork', col: '$dark' }, vars: [{ v: 0 }, { v: 40 }, { v: -60 }] },
  splitling: { seg: 'bead', pat: { type: 'cell', col: '$dark' }, tail: { type: 'fork', col: '$dark', s: 0.8 }, vars: [{ v: 0 }, { v: 40 }, { v: -60 }] },
  sniper:    { seg: 'flat', pat: { type: 'camo' }, tail: { type: 'whip' }, vars: [{ v: 0 }, { v: -45, l: 0.12 }, { v: 0, l: 0.4, s: 0.15 }] },
  pwblue:    { seg: 'oval', tail: { type: 'fan', col: '#ffffff' } },
  pwyellow:  { seg: 'hex', tail: { type: 'stinger', col: '#1a1500' }, head: { antennae: { col: '#1a1500', len: 0.6 } }, wings: 1 },
  coalition: { seg: 'hex', tail: { type: 'fan', col: '#e8c050' } },
  party:     { seg: 'bead', pat: { type: 'confetti' }, tail: { type: 'balloon', col: '#e83a6a' } },
  mother:    { seg: 'flat', legs: { every: 1, len: 0.3 } },
  queen:     { seg: 'oval', pat: { type: 'spine', col: '$dark', w: 0.2 }, tail: { type: 'fan', col: '$dark' }, head: { crown: { col: '#ffcf40' } } },
  ouro:      { seg: 'diamond', ridge: { every: 2, col: '#c8a040' }, tail: { type: 'whip', col: '#8a2020' } },
  stok:      { pat: { type: 'bands', col: '$dark', every: 2 }, head: { ears: { col: '$body2' } }, tail: { type: 'whip', col: '#3a2810' }, vars: [{ v: 0 }, { v: -10, l: -0.1 }, { v: 15, l: 0.08 }] },
  stroopw:   { seg: 'flat' },
  bril:      { seg: 'oval', pat: { type: 'argyle', col: '#c8b040', col2: '$dark' }, vars: [{ v: 0 }, { v: 150 }, { v: 220 }] },
  handel:    { seg: 'oval', pat: { type: 'coins', col: '#ffd23a', every: 2 }, tail: { type: 'tag', col: '#ffd23a' }, vars: [{ v: 0 }, { v: 100 }, { v: -70 }] },
  pantser:   { seg: 'plate', pat: { type: 'bolts', col: '$dark' }, tail: { type: 'club', col: '$dark' }, vars: [{ v: 0 }, { v: 0, l: -0.14 }, { v: 0, l: 0.12 }] },
  driekop:   { seg: 'oval', ridge: { every: 1, col: '#a8d050' }, tail: { type: 'spade', col: '$dark' }, vars: [{ v: 0 }, { v: 120 }, { v: -150, l: 0.04 }] },
  sloper:    { seg: 'plate', tail: { type: 'club', col: '#3a3a3a' } },
  kameleon:  { seg: 'oval', pat: { type: 'spots', col: '$light' }, tail: { type: 'curl' }, vars: [{ v: 0 }, { v: -80 }, { v: 70 }, { v: 170 }] },
  raver:     { seg: 'bead', pat: { type: 'neon', col: '#3affd8', col2: '#ff3ad8' }, head: { antennae: { col: '#1a0a2a', len: 0.6, tip: '#3affd8' } }, glow: { tips: '#3affd8' } },
  manu:      { seg: 'plate', pat: { type: 'speaker', col: '$outline' }, tail: { type: 'plug', col: '#1a1a1a' } },
  manudevil: { seg: 'plate', pat: { type: 'cracks', col: '#ffb030' }, tail: { type: 'spade', col: '#1a0204' }, head: { horns: { col: '#2a0a0a', len: 0.9 } }, glow: { cracks: '#ff8a20' } },
  rechter:   { seg: 'oval', head: { collar: { col: '#f4f0e6', col2: '#d8d2c4' } } },
  clown:     { seg: 'bead', head: { collar: { col: '#ff4a6a', col2: '#ffffff' } }, tail: { type: 'pompom', col: '#ff3a3a' } },
  killerclown: { seg: 'bead', head: { collar: { col: '#7a1020', col2: '#1a0a10' } }, tail: { type: 'pompom', col: '#8a1020' } },
  rage1:     { seg: 'flat', pat: { type: 'cracks', col: '#ffb060' }, glow: { cracks: '#ff7a30' } },
  rage2:     { seg: 'flat', pat: { type: 'cracks', col: '#ffc060' }, head: { horns: { col: '$outline', len: 0.5 } }, glow: { cracks: '#ff6a20' } },
  rage3:     { seg: 'flat', pat: { type: 'cracks', col: '#ffd070' }, ridge: { every: 1, col: '$outline' }, head: { horns: { col: '$outline', len: 0.8 } }, tail: { type: 'club', col: '$outline' }, glow: { cracks: '#ff5a10' } },
  stekker:   { seg: 'bead', pat: { type: 'spine', col: '$light', w: 0.2 }, vars: [{ v: 0 }, { v: 0, l: 0.55, s: 0 }] },
  bosje:     { leaves: { every: 2, col: '#4aa83a' }, tail: { type: 'leaf', col: '#4aa83a' } },
  peukworm:  { tail: { type: 'smoke' } },
  mutant:    { seg: 'bead', pat: { type: 'eyes', every: 3 }, legs: { every: 3, len: 0.7, wave: 1, col: '$dark' }, vars: [{ v: 0 }, { v: 90, s: 2 }, { v: -60, s: 2 }] },
  rotling:   { seg: 'bead', pat: { type: 'warts', col: '$dark' }, vars: [{ v: 0 }, { v: -20, l: -0.05 }] },
  kampioen:  { seg: 'oval', pat: { type: 'stars', col: '#ffd23a', every: 2 }, tail: { type: 'fan', col: '#ffd23a' } },
  peuk:      { tail: { type: 'smoke' } },
  tunnel:    { seg: 'plate', legs: { every: 2, len: 0.4 }, glow: { col: '#ffd060', every: 4, a: 0.35 } },
  leegte:    { tail: { type: 'wisp', col: '#8a5aff' }, glow: { col: '#b08aff', every: 3, a: 0.3 } },
  spook:     { seg: 'bead', tail: { type: 'wisp', col: '#e8ecf4' } },
  noodle:    { seg: 'oval' },
  wals:      { seg: 'oval', pat: { type: 'stripe', col: '#c8a040', every: 3, w: 0.18 }, tail: { type: 'fork', col: '$outline' } },
  aarde:     { seg: 'bead' },
  mars:      { seg: 'bead', pat: { type: 'craters', col: '$dark' } },
  neptunus:  { seg: 'oval', tail: { type: 'fan', col: '$dark' } },
  pluto:     { seg: 'hex', pat: { type: 'craters', col: '$light' } },
  saturnus:  { seg: 'flat', pat: { type: 'stripe', col: '$dark', every: 1, w: 0.14 } },
  galaxy:    { tail: { type: 'wisp', col: '#a87aff' }, glow: { col: '#c8a0ff', every: 2, a: 0.25 } },
  lucha14:   { seg: 'oval', pat: { type: 'chevron', col: '#ffd23a', every: 2, w: 0.16 } },
  hagel14:   { seg: 'hex', pat: { type: 'stars', col: '#e8f4ff', every: 2 } },
  kogel14:   { seg: 'oval', pat: { type: 'belt', col: '#5a3a1a', col2: '#e8c050' }, tail: { type: 'fork', col: '$outline' } },
};

/* body segment shape, used by drawSnake for the outline, fill, tint and flash passes */
let lk14x = 1, lk14y = 0;
function lk14frame(sn, k) { const d = bodyDir(sn, k); lk14x = d[0]; lk14y = d[1]; }
function lk14poly(c, p, a) {
  c.beginPath();
  for (let i = 0; i < a.length; i += 2) {
    const x = p.x + lk14x * a[i] - lk14y * a[i + 1], y = p.y + lk14y * a[i] + lk14x * a[i + 1];
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }
  c.closePath();
}
const SEG14 = {
  oval: (c, p, r) => ell(c, p.x, p.y, r * 1.14, r * 0.92, Math.atan2(lk14y, lk14x)),
  flat: (c, p, r) => ell(c, p.x, p.y, r * 0.82, r * 1.06, Math.atan2(lk14y, lk14x)),
  bead: (c, p, r) => { c.beginPath(); c.arc(p.x, p.y, r * 0.9, 0, TAU); },
  plate: (c, p, r) => { const a = Math.atan2(lk14y, lk14x); c.save(); c.translate(p.x, p.y); c.rotate(a); rrect(c, -r * 0.86, -r * 1.0, r * 1.72, r * 2.0, r * 0.42); c.restore(); },
  hex: (c, p, r) => lk14poly(c, p, [r * 1.06, 0, r * 0.53, r * 0.95, -r * 0.53, r * 0.95, -r * 1.06, 0, -r * 0.53, -r * 0.95, r * 0.53, -r * 0.95]),
  diamond: (c, p, r) => lk14poly(c, p, [r * 1.25, 0, 0, r * 0.98, -r * 1.25, 0, 0, -r * 0.98]),
};
function seg14(c, sn, k, p, r) {
  const L = sn.K.look14, f = L && SEG14[L.seg];
  if (!f) { circle(c, p.x, p.y, r); return; }
  lk14frame(sn, k); f(c, p, r); c.fill();
}

(() => {
  /* colour helpers: hex <-> hsl, palette tokens */
  const toHsl = (h) => {
    const n = parseInt(h.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const H = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [H * 60, s, l];
  };
  const toHex = (H, s, l) => {
    const C = (1 - Math.abs(2 * l - 1)) * s, X2 = C * (1 - Math.abs((H / 60) % 2 - 1)), m = l - C / 2;
    const [r, g, b] = H < 60 ? [C, X2, 0] : H < 120 ? [X2, C, 0] : H < 180 ? [0, C, X2] : H < 240 ? [0, X2, C] : H < 300 ? [X2, 0, C] : [C, 0, X2];
    return '#' + [r, g, b].map((v) => Math.round(clamp(v + m, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
  };
  const shift = (h, V) => {
    if (typeof h !== 'string' || !/^#[0-9a-f]{6}$/i.test(h)) return h;
    const [H, s, l] = toHsl(h);
    return toHex(((H + (V.v || 0)) % 360 + 360) % 360, clamp(s * (V.s != null ? V.s : 1), 0, 1), clamp(l + (V.l || 0), 0, 1));
  };
  const col = (v, K, d) => {
    if (!v) return d || K.outline;
    if (v[0] !== '$') return v;
    if (v === '$dark') return mixHex(K.body, K.outline, 0.42);
    if (v === '$light') return mixHex(K.body, '#ffffff', 0.38);
    return K[v.slice(1)] || d || K.outline;
  };
  const hsh = (k, s) => { const x = Math.sin(k * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const X = (p, a, b) => p.x + lk14x * a - lk14y * b, Y = (p, a, b) => p.y + lk14y * a + lk14x * b;
  const line = (c, p, a, b, a2, b2) => { c.beginPath(); c.moveTo(X(p, a, b), Y(p, a, b)); c.lineTo(X(p, a2, b2), Y(p, a2, b2)); c.stroke(); };
  const dot = (c, p, a, b, r) => circle(c, X(p, a, b), Y(p, a, b), r);
  const ink = (c, K, f, w) => { c.fillStyle = f; c.fill(); c.strokeStyle = K.outline; c.lineWidth = w || 1.4; c.stroke(); };
  const CONF = ['#ff4a6a', '#4ad8ff', '#ffd23a', '#7aff6a', '#c87aff'];

  /* patterns: regular, centred on the spine, drawn before the kind's own decorations */
  const PAT = {
    stripe(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = r * (P.w || 0.2); c.beginPath(); c.moveTo(X(p, -r * 0.1, r * 0.84), Y(p, -r * 0.1, r * 0.84)); c.quadraticCurveTo(X(p, r * 0.22, 0), Y(p, r * 0.22, 0), X(p, -r * 0.1, -r * 0.84), Y(p, -r * 0.1, -r * 0.84)); c.stroke(); },
    bands(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = c.strokeStyle; lk14poly(c, p, [r * 0.2, -r * 0.8, r * 0.2, r * 0.8, -r * 0.2, r * 0.8, -r * 0.2, -r * 0.8]); c.fill(); },
    chevron(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = r * (P.w || 0.16); c.lineJoin = 'round'; c.beginPath(); c.moveTo(X(p, -r * 0.35, r * 0.66), Y(p, -r * 0.35, r * 0.66)); c.lineTo(X(p, r * 0.25, 0), Y(p, r * 0.25, 0)); c.lineTo(X(p, -r * 0.35, -r * 0.66), Y(p, -r * 0.35, -r * 0.66)); c.stroke(); },
    spots(c, p, r, k, P) { if (k % 2) return; c.fillStyle = c.strokeStyle; const s = (k & 2 ? 1 : -1) * r * 0.38; dot(c, p, 0, s, r * 0.24); dot(c, p, -r * 0.1, -s * 0.6, r * 0.13); },
    camo(c, p, r, k, P, K) { c.fillStyle = mixHex(K.body, '#ffffff', 0.18); ell(c, X(p, 0, (hsh(k, 3) - 0.5) * r * 0.8), Y(p, 0, (hsh(k, 3) - 0.5) * r * 0.8), r * 0.46, r * 0.28, Math.atan2(lk14y, lk14x) + hsh(k, 4) - 0.5); c.fill(); if (k % 2) { c.fillStyle = mixHex(K.body, K.outline, 0.45); dot(c, p, r * 0.15, (hsh(k, 5) - 0.5) * r, r * 0.2); } },
    warts(c, p, r, k, P) { c.fillStyle = c.strokeStyle; dot(c, p, 0, (k & 1 ? 1 : -1) * r * 0.35, r * 0.18); },
    argyle(c, p, r, k, P, K) { c.fillStyle = k & 1 ? col(P.col, K) : col(P.col2, K); lk14poly(c, p, [r * 0.6, 0, 0, r * 0.45, -r * 0.6, 0, 0, -r * 0.45]); c.fill(); },
    bolts(c, p, r, k, P) { c.fillStyle = c.strokeStyle; for (const s of [-1, 1]) dot(c, p, 0, s * r * 0.6, Math.max(0.8, r * 0.11)); },
    barcode(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = Math.max(0.7, r * 0.08); for (const a of [-0.3, -0.12, 0.02, 0.28]) line(c, p, r * a, -r * 0.5, r * a, r * 0.5); },
    buttons(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = c.strokeStyle; dot(c, p, 0, 0, Math.max(0.8, r * 0.15)); },
    pinstripe(c, p, r) { c.lineWidth = Math.max(0.6, r * 0.06); for (const s of [-0.45, 0, 0.45]) line(c, p, -r * 0.55, r * s, r * 0.55, r * s); },
    cell(c, p, r, k) { c.lineWidth = Math.max(0.8, r * 0.09); if (k % 2 === 0) line(c, p, 0, -r * 0.65, 0, r * 0.65); },
    stars(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = c.strokeStyle; const s = r * 0.36; lk14poly(c, p, [s, 0, s * 0.25, s * 0.25, 0, s, -s * 0.25, s * 0.25, -s, 0, -s * 0.25, -s * 0.25, 0, -s, s * 0.25, -s * 0.25]); c.fill(); },
    confetti(c, p, r, k) { c.fillStyle = CONF[k % CONF.length]; dot(c, p, 0, (k & 1 ? 1 : -1) * r * 0.3, r * 0.17); },
    neon(c, p, r, k, P) { c.lineWidth = r * 0.2; c.strokeStyle = k & 1 ? P.col : P.col2; line(c, p, 0, -r * 0.78, 0, r * 0.78); },
    speaker(c, p, r, k) { if (k & 1) return; c.lineWidth = r * 0.12; c.beginPath(); c.arc(p.x, p.y, r * 0.55, 0, TAU); c.stroke(); c.fillStyle = c.strokeStyle; circle(c, p.x, p.y, r * 0.22); },
    cracks(c, p, r, k) { c.lineWidth = Math.max(0.8, r * 0.09); c.lineJoin = 'round'; c.beginPath(); const s = k & 1 ? 1 : -1; c.moveTo(X(p, r * 0.35, -r * 0.6 * s), Y(p, r * 0.35, -r * 0.6 * s)); c.lineTo(X(p, 0, -r * 0.05 * s), Y(p, 0, -r * 0.05 * s)); c.lineTo(X(p, -r * 0.35, r * 0.6 * s), Y(p, -r * 0.35, r * 0.6 * s)); c.stroke(); },
    coins(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = c.strokeStyle; dot(c, p, 0, 0, r * 0.32); c.lineWidth = Math.max(0.6, r * 0.07); c.strokeStyle = '#8a6a10'; c.beginPath(); c.arc(p.x, p.y, r * 0.2, 0, TAU); c.stroke(); },
    eyes(c, p, r, k, P, K, sn, t) { if (k % (P.every || 3) !== 1) return; const x = p.x, y = p.y; c.fillStyle = K.outline; circle(c, x, y, r * 0.42); c.fillStyle = '#f4ecd8'; circle(c, x, y, r * 0.34); c.fillStyle = '#1a0808'; circle(c, x + Math.cos(t + k) * r * 0.1, y + Math.sin(t * 0.7 + k) * r * 0.1, r * 0.15); },
    craters(c, p, r, k) { if (k % 2) return; c.fillStyle = c.strokeStyle; dot(c, p, 0, (k & 2 ? 1 : -1) * r * 0.3, r * 0.24); },
    belt(c, p, r, k, P, K) { if (k % 3) return; c.lineWidth = r * 0.3; line(c, p, r * 0.25, -r * 0.8, -r * 0.25, r * 0.8); c.fillStyle = col(P.col2, K); for (const s of [-0.4, 0, 0.4]) dot(c, p, -r * s * 0.3, r * s, r * 0.1); },
  };
  function pattern(c, sn, t) {
    const L = sn.K.look14, P = L && L.pat; if (!P) return;
    const K = sn.K, pts = sn.pts, C = col(P.col, K);
    c.save(); c.strokeStyle = C; c.lineCap = 'round';
    if (P.type === 'spine') {
      c.lineWidth = Math.max(1, K.r0 * (P.w || 0.25)); c.beginPath(); c.moveTo(sn.x, sn.y);
      for (const p of pts) if (!p.hid) c.lineTo(p.x, p.y); c.stroke();
    } else if (PAT[P.type]) {
      for (let k = 0; k < pts.length; k++) { const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); c.strokeStyle = C; PAT[P.type](c, p, p.r, k, P, K, sn, t); }
    }
    c.restore();
  }

  /* tails, drawn under the last segment, local x points forward (towards the head) */
  const TAIL = {
    whip(c, q, u, T, K) { const w = (g, cl) => { c.strokeStyle = cl; c.lineWidth = u * 0.5 + g; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.quadraticCurveTo(X(q, -u * 1.5, u * 0.45), Y(q, -u * 1.5, u * 0.45), X(q, -u * 2.5, -u * 0.15), Y(q, -u * 2.5, -u * 0.15)); c.stroke(); }; w(2.6, K.outline); w(0, col(T.col, K, K.body2)); return true; },
    fork(c, q, u) { lk14poly(c, q, [0, -u * 0.5, -u * 2.3, -u * 1.1, -u * 1.5, 0, -u * 2.3, u * 1.1, 0, u * 0.5]); },
    fan(c, q, u) { c.beginPath(); c.moveTo(X(q, 0, -u * 0.4), Y(q, 0, -u * 0.4)); c.quadraticCurveTo(X(q, -u * 1.4, -u * 0.6), Y(q, -u * 1.4, -u * 0.6), X(q, -u * 2.3, -u * 1.4), Y(q, -u * 2.3, -u * 1.4)); c.quadraticCurveTo(X(q, -u * 1.7, 0), Y(q, -u * 1.7, 0), X(q, -u * 2.3, u * 1.4), Y(q, -u * 2.3, u * 1.4)); c.quadraticCurveTo(X(q, -u * 1.4, u * 0.6), Y(q, -u * 1.4, u * 0.6), X(q, 0, u * 0.4), Y(q, 0, u * 0.4)); c.closePath(); },
    stinger(c, q, u) { lk14poly(c, q, [0, -u * 0.6, -u * 1.5, -u * 0.35, -u * 2.6, 0, -u * 1.5, u * 0.35, 0, u * 0.6]); },
    spade(c, q, u) { lk14poly(c, q, [0, -u * 0.22, -u * 1.3, -u * 0.22, -u * 1.15, -u * 0.9, -u * 2.6, 0, -u * 1.15, u * 0.9, -u * 1.3, u * 0.22, 0, u * 0.22]); },
    club(c, q, u) { const a = []; for (let i = 0; i < 16; i++) { const g = i * TAU / 16, m = u * (i & 1 ? 0.85 : 1.15); a.push(-u * 1.6 + Math.cos(g) * m, Math.sin(g) * m); } lk14poly(c, q, a); },
    tag(c, q, u, T, K) { lk14poly(c, q, [0, -u * 0.25, -u * 0.8, -u * 0.8, -u * 2.5, -u * 0.8, -u * 2.5, u * 0.8, -u * 0.8, u * 0.8, 0, u * 0.25]); ink(c, K, col(T.col, K)); c.fillStyle = K.outline; dot(c, q, -u * 0.9, 0, u * 0.18); return true; },
    plug(c, q, u) { lk14poly(c, q, [0, -u * 0.3, -u * 1.1, -u * 0.3, -u * 1.1, -u * 0.8, -u * 2.1, -u * 0.8, -u * 2.1, u * 0.8, -u * 1.1, u * 0.8, -u * 1.1, u * 0.3, 0, u * 0.3]); },
    hose(c, q, u, T, K) { c.strokeStyle = col(T.col, K); c.lineWidth = u * 0.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.bezierCurveTo(X(q, -u * 2, u * 1.3), Y(q, -u * 2, u * 1.3), X(q, -u * 2.4, -u * 1.3), Y(q, -u * 2.4, -u * 1.3), X(q, -u * 3.3, 0), Y(q, -u * 3.3, 0)); c.stroke(); return true; },
    curl(c, q, u, T, K) { c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); for (let i = 1; i <= 14; i++) { const g = i * 0.5, m = u * (1.5 - i * 0.08); c.lineTo(X(q, -u * 1.5 - Math.sin(g) * m, u * 1.5 - Math.cos(g) * m), Y(q, -u * 1.5 - Math.sin(g) * m, u * 1.5 - Math.cos(g) * m)); } c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = K.outline; c.lineWidth = u * 0.9 + 2.6; c.stroke(); c.strokeStyle = K.body2; c.lineWidth = u * 0.9; c.stroke(); return true; },
    balloon(c, q, u, T, K) { c.strokeStyle = K.outline; c.lineWidth = 1; line(c, q, 0, 0, -u * 2, u * 0.3); c.beginPath(); c.arc(X(q, -u * 3, u * 0.3), Y(q, -u * 3, u * 0.3), u, 0, TAU); ink(c, K, col(T.col, K)); c.fillStyle = 'rgba(255,255,255,0.5)'; dot(c, q, -u * 2.7, 0, u * 0.28); return true; },
    pompom(c, q, u, T, K) { c.beginPath(); c.arc(X(q, -u * 1.2, 0), Y(q, -u * 1.2, 0), u, 0, TAU); ink(c, K, col(T.col, K)); c.fillStyle = 'rgba(255,255,255,0.4)'; dot(c, q, -u * 1, -u * 0.3, u * 0.35); return true; },
    leaf(c, q, u) { c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.quadraticCurveTo(X(q, -u * 1.4, u * 1.1), Y(q, -u * 1.4, u * 1.1), X(q, -u * 2.8, 0), Y(q, -u * 2.8, 0)); c.quadraticCurveTo(X(q, -u * 1.4, -u * 1.1), Y(q, -u * 1.4, -u * 1.1), X(q, 0, 0), Y(q, 0, 0)); },
    flame(c, q, u, T, K, t) { const f = 1 + 0.25 * Math.sin(t * 30 + q.x); c.fillStyle = '#ff7a20'; lk14poly(c, q, [0, -u * 0.6, -u * 2.3 * f, 0, 0, u * 0.6]); c.fill(); c.fillStyle = '#ffe070'; lk14poly(c, q, [0, -u * 0.3, -u * 1.3 * f, 0, 0, u * 0.3]); c.fill(); return true; },
    smoke(c, q, u, T, K, t) { for (let i = 0; i < 3; i++) { const f = (t * 0.6 + i / 3) % 1; c.fillStyle = `rgba(210,210,215,${0.3 * (1 - f)})`; dot(c, q, -u * (1 + f * 4.5), Math.sin(f * 5 + i) * u, u * (0.5 + f)); } return true; },
    wisp(c, q, u, T, K, t) { for (let i = 1; i <= 3; i++) { c.globalAlpha *= 0.7; c.fillStyle = col(T.col, K); dot(c, q, -u * i, Math.sin(t * 4 + i) * u * 0.35 * i, u * (1 - i * 0.22)); } return true; },
  };
  function tail(c, sn, t) {
    const L = sn.K.look14, T = L && L.tail, pts = sn.pts, n = pts.length; if (!T || !n || !TAIL[T.type]) return;
    const q = pts[n - 1]; if (q.hid) return;
    const K = sn.K, u = Math.max(q.r, sn.headR * 0.32) * (T.s || 1);
    lk14frame(sn, n - 1); c.save(); c.lineJoin = 'round';
    if (!TAIL[T.type](c, q, u, T, K, t)) ink(c, K, col(T.col, K, K.body2), 1.6);
    c.restore();
  }

  /* parts under the body: spine ridge, leaves, legs, wings */
  function parts(c, sn, t) {
    const L = sn.K.look14, K = sn.K, pts = sn.pts, n = pts.length; if (!n) return;
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (L.wings) {
      const p = pts[Math.min(1, n - 1)], r = sn.headR, fl = 0.8 + 0.2 * Math.sin(t * 40); lk14frame(sn, Math.min(1, n - 1));
      for (const [ox, sz] of [[0.1, 1], [-0.7, 0.75]]) for (const s of [-1, 1]) {
        ell(c, X(p, r * ox - r * 0.3, s * r * 1.05 * fl), Y(p, r * ox - r * 0.3, s * r * 1.05 * fl), r * 0.42 * sz, r * 0.9 * sz * fl, Math.atan2(lk14y, lk14x) + s * 0.45);
        c.fillStyle = 'rgba(235,245,255,0.6)'; c.fill(); c.strokeStyle = 'rgba(30,30,40,0.8)'; c.lineWidth = 1.2; c.stroke();
      }
    }
    if (L.legs) {
      const G = L.legs; c.strokeStyle = col(G.col, K);
      for (let k = 0; k < n; k += G.every || 1) {
        const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); c.lineWidth = Math.max(1.2, p.r * 0.24);
        const sw = Math.sin(t * 14 + k * 1.3) * p.r * 0.35;
        for (const s of [-1, 1]) {
          if (G.wave) { c.beginPath(); c.moveTo(X(p, 0, s * p.r * 0.6), Y(p, 0, s * p.r * 0.6)); c.quadraticCurveTo(X(p, sw, s * p.r * (1.2 + G.len * 0.5)), Y(p, sw, s * p.r * (1.2 + G.len * 0.5)), X(p, -sw - p.r * 0.4, s * p.r * (1 + G.len * 1.4)), Y(p, -sw - p.r * 0.4, s * p.r * (1 + G.len * 1.4))); c.stroke(); }
          else line(c, p, 0, s * p.r * 0.6, sw * s - p.r * 0.25, s * (p.r * (1 + G.len) + 2.5));
        }
      }
    }
    if (L.leaves) {
      const F = L.leaves;
      for (let k = 1; k < n; k += F.every || 2) {
        const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); const r = p.r, s = (k / (F.every || 2)) & 1 ? 1 : -1;
        c.beginPath(); c.moveTo(X(p, 0, s * r * 0.5), Y(p, 0, s * r * 0.5));
        c.quadraticCurveTo(X(p, r * 0.6, s * r * 1.3), Y(p, r * 0.6, s * r * 1.3), X(p, -r * 0.5, s * (r * 1.7 + 2)), Y(p, -r * 0.5, s * (r * 1.7 + 2)));
        c.quadraticCurveTo(X(p, -r * 0.6, s * r * 0.9), Y(p, -r * 0.6, s * r * 0.9), X(p, 0, s * r * 0.5), Y(p, 0, s * r * 0.5));
        ink(c, K, col(F.col, K), 1.2);
      }
    }
  }
  /* a ridge of plates along the spine, over the body */
  function ridge(c, sn) {
    const L = sn.K.look14, R = L && L.ridge; if (!R) return;
    const K = sn.K, pts = sn.pts; c.save(); c.lineJoin = 'round';
    for (let k = pts.length - 1; k >= 0; k -= 1) {
      if (k % (R.every || 1)) continue;
      const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); const r = p.r;
      lk14poly(c, p, [r * 0.45, -r * 0.3, -r * 0.65, 0, r * 0.45, r * 0.3]); ink(c, K, col(R.col, K), 1.1);
    }
    c.restore();
  }

  /* head parts: under (behind the head) and over */
  function headUnder(c, sn, H, K, D, t) {
    c.lineJoin = 'round';
    if (D.collar) {
      const m = 14, R = H * 1.32;
      for (const [rr, cl] of [[R, D.collar.col], [R * 0.82, D.collar.col2]]) {
        c.beginPath();
        for (let i = 0; i <= m; i++) { const a = Math.PI * 0.35 + (i / m) * Math.PI * 1.3, a2 = a + (Math.PI * 1.3 / m) / 2; const x = -H * 0.25; if (!i) c.moveTo(x + Math.cos(a) * rr * 0.6, Math.sin(a) * rr * 0.6); c.lineTo(x + Math.cos(a) * rr, Math.sin(a) * rr); if (i < m) c.lineTo(x + Math.cos(a2) * rr * 0.86, Math.sin(a2) * rr * 0.86); }
        c.lineTo(-H * 0.25 + Math.cos(Math.PI * 1.65) * rr * 0.6, Math.sin(Math.PI * 1.65) * rr * 0.6); c.closePath();
        ink(c, K, col(cl, K), 1.3);
      }
    }
    if (D.horns) for (const s of [-1, 1]) {
      const l = D.horns.len || 0.7; c.beginPath(); c.moveTo(H * 0.15, s * H * 0.5);
      c.quadraticCurveTo(-H * 0.1, s * H * (1.2 + l * 0.3), -H * (0.5 + l), s * H * (1.0 + l * 0.45));
      c.quadraticCurveTo(-H * 0.35, s * H * 0.8, -H * 0.45, s * H * 0.4); c.closePath();
      ink(c, K, col(D.horns.col, K));
    }
    if (D.ears) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-H * 0.05, s * H * 0.6); c.quadraticCurveTo(-H * 0.35, s * H * 1.35, -H * 0.7, s * H * 0.55); c.closePath(); ink(c, K, col(D.ears.col, K)); }
    if (D.antennae) for (const s of [-1, 1]) {
      const A = D.antennae, l = A.len || 0.5, w = Math.sin(t * 5 + s) * H * 0.1, tx = H * (1.05 + l), ty = s * H * (0.95 + l * 0.4) + w;
      c.strokeStyle = col(A.col, K); c.lineWidth = Math.max(1.2, H * 0.09); c.lineCap = 'round';
      c.beginPath(); c.moveTo(H * 0.3, s * H * 0.4); c.quadraticCurveTo(H * 0.9, s * H * 0.45, tx, ty); c.stroke();
      c.beginPath(); c.arc(tx, ty, H * 0.13, 0, TAU); ink(c, K, A.tip || col(A.col, K), 1);
    }
  }
  function headOver(c, sn, H, K, D) {
    if (D.crown) {
      c.lineJoin = 'round'; c.beginPath();
      for (let i = 0; i < 10; i++) { const g = i * TAU / 10, m = H * (i & 1 ? 0.24 : 0.42); c.lineTo(-H * 0.62 + Math.cos(g) * m, Math.sin(g) * m); }
      c.closePath(); ink(c, K, col(D.crown.col, K), 1.2);
      c.fillStyle = '#e83a4a'; circle(c, -H * 0.62, 0, H * 0.09);
    }
  }

  /* colour variants, picked once at spawn from the snake's blinkSeed */
  for (const k in LOOK14) if (KINDS[k]) KINDS[k].look14 = LOOK14[k];
  const variant = (sn, i) => {
    const L = sn.K.look14, V = L.vars[i];
    sn.look14v = i;
    if (!(V.v || V.l || V.s != null)) { if (sn.look14K) sn.K = sn.look14K; }
    else {
      const B = sn.look14K || (sn.look14K = sn.K), K = Object.assign({}, B);
      for (const key of ['body', 'body2', 'hi', 'ring', 'spot', 'saddle', 'blood'].concat(L.keys || [])) K[key] = shift(B[key], V);
      sn.K = K;
    }
  };
  const init0 = initSnake9;
  initSnake9 = function (sn, o) {
    const r = init0(sn, o), L = sn.K.look14;
    if (L && L.vars && !sn.champ && sn.kind !== 'raver') variant(sn, Math.floor((sn.blinkSeed || 0) * 7.31) % L.vars.length);
    return r;
  };

  /* hook into the draw chain (assigning the global function names, like the rot and mud layers do) */
  const ds0 = drawSnake;
  drawSnake = function (c, sn, t) {
    const L = sn.K.look14;
    if (L && !V9_BODY[sn.kind] && !(sn.cloak != null && sn.cloak < 0.05)) {
      c.save();
      try {
        if (sn.cloak != null && sn.cloak < 0.999) c.globalAlpha *= Math.max(0.05, sn.cloak);
        if (sn.fade < 1) c.globalAlpha *= Math.max(0.05, sn.fade);
        parts(c, sn, t); tail(c, sn, t);
      } catch (e) { errNote14(e, 'look14'); }
      c.restore();
    }
    return ds0(c, sn, t);
  };
  const dec0 = decorateSnake;
  decorateSnake = function (c, sn, t) {
    if (sn.K.look14) { try { pattern(c, sn, t); ridge(c, sn); } catch (e) { errNote14(e, 'look14 pat'); } }
    return dec0(c, sn, t);
  };
  const dh0 = drawSnakeHead;
  drawSnakeHead = function (c, sn, t, flash) {
    const L = sn.K.look14, D = L && L.head;
    if (!D) return dh0(c, sn, t, flash);
    const go = (f) => { c.save(); c.translate(sn.x, sn.y); c.rotate(sn.drawAng); try { f(c, sn, sn.headR, sn.K, D, t); } catch (e) { errNote14(e, 'look14 head'); } c.restore(); };
    go(headUnder); const r = dh0(c, sn, t, flash); go(headOver); return r;
  };
  const dg0 = drawSnakeGlow;
  drawSnakeGlow = function (c, sn, t, P) {
    const r = dg0(c, sn, t, P), L = sn.K.look14, G = L && L.glow;
    if (!G || !sn.alive || sn.burrowed || (sn.cloak != null && sn.cloak < 0.5)) return r;
    const pts = sn.pts, n = pts.length;
    c.save(); c.globalCompositeOperation = 'lighter';
    if (G.col) for (let k = 1; k < n; k += G.every || 3) { const p = pts[k]; if (!p.hid) glowDot(c, p.x, p.y, p.r * 2.2, G.col, (G.a || 0.3) * (0.75 + 0.25 * Math.sin(t * 4 + k))); }
    if (G.cracks) for (let k = 0; k < n; k += 2) { const p = pts[k]; if (!p.hid) glowDot(c, p.x, p.y, p.r * 1.6, G.cracks, 0.22 + 0.1 * Math.sin(t * 6 + k)); }
    if (G.tail && n && !pts[n - 1].hid) { const q = pts[n - 1]; lk14frame(sn, n - 1); glowDot(c, X(q, -q.r * 2, 0), Y(q, -q.r * 2, 0), sn.headR * 1.4, G.tail, 0.45); }
    if (G.tips && L.head && L.head.antennae) { const H = sn.headR, l = L.head.antennae.len || 0.5; for (const s of [-1, 1]) { const a = sn.drawAng, lx = H * (1.05 + l), ly = s * H * (0.95 + l * 0.4); glowDot(c, sn.x + Math.cos(a) * lx - Math.sin(a) * ly, sn.y + Math.sin(a) * lx + Math.cos(a) * ly, H * 0.6, G.tips, 0.5); } }
    c.restore();
    return r;
  };
  Object.assign(window.__bitten || (window.__bitten = {}), { LOOK14, lookVariant14: variant });
})();
