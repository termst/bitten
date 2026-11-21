/* src/87-v14-looks.js: L1 (v14.4) snake looks. One parametric layer gives every snake kind its own body
   segment shape, pattern, side parts (spikes, legs, fins), tail, head parts (horns, antennae, frill, crown...)
   and glow, read from the LOOK table. Add or change a kind by editing its LOOK row only.
   Visual only: no Math.random, no writes to game state, so seeded runs and online lockstep stay identical.
   Colours: '#rrggbb', or '$key' for a colour of the kind (K.outline, K.body2, ...). Sizes are in segment radii
   (body) or head radii (head parts). */
const LOOK14 = {
  grub:      { seg: 'flat', legs: { every: 2, len: 0.45, col: '$outline' } },
  hood:      { seg: 'oval', pat: { type: 'chevron', col: '#a898c0', every: 2, w: 0.2 }, tail: { type: 'whip' } },
  lamprey:   { seg: 'oval', fins: { col: '#7a2a3a', w: 0.55 }, tail: { type: 'fan', col: '#7a2a3a' } },
  long:      { seg: 'oval', spikes: { every: 2, len: 0.35, col: '#8a6a50' }, tail: { type: 'fork', col: '$saddle' }, head: { whiskers: { col: '#1d1513' } } },
  rotter:    { seg: 'bead', pat: { type: 'warts', col: '#5a5a24' }, legs: { every: 1, len: 0.3, col: '#2a280e' } },
  rocket:    { seg: 'plate', tail: { type: 'flame' }, pat: { type: 'bolts', col: '#2a2a33' }, glow: { tail: '#ffa040' } },
  fuel:      { seg: 'plate', pat: { type: 'bolts', col: '#0e4a1e' }, tail: { type: 'hose', col: '#1a1a1a' } },
  bonus:     { seg: 'bead', pat: { type: 'stars', col: '#ffffff', every: 2 }, tail: { type: 'tag', col: '#ffe066' }, glow: { col: '#a8e4ff', every: 3, a: 0.25 } },
  discount:  { seg: 'hex', pat: { type: 'barcode', col: '#1a1500', every: 2 }, tail: { type: 'tag', col: '#e83a2a' } },
  kamerlid:  { seg: 'plate', pat: { type: 'buttons', col: '#e8e0c0', every: 2 }, tail: { type: 'fork', col: '#a8222a' } },
  lobby:     { seg: 'oval', pat: { type: 'pinstripe', col: '#8a8e96' }, head: { mohawk: { col: '#2a2c30', n: 3 } } },
  splitter:  { seg: 'bead', pat: { type: 'cell', col: '#2e5a52' }, tail: { type: 'fork', col: '#3e6f66' } },
  splitling: { seg: 'bead', pat: { type: 'cell', col: '#2e5a52' }, tail: { type: 'fork', col: '#3e6f66', s: 0.8 } },
  sniper:    { seg: 'flat', pat: { type: 'camo', col: '#5a6a34', col2: '#262e18' }, head: { antennae: { col: '#1a2210', len: 0.4, tip: '#ff3a2a' } }, glow: { tips: '#ff3a2a' } },
  pwblue:    { seg: 'oval', fins: { col: '#0a5a8a', w: 0.45 }, tail: { type: 'fan', col: '#ffffff' }, head: { frill: { col: '#1590cc', col2: '#ffffff', n: 9 } }, glow: { col: '#7ad8ff', every: 3, a: 0.3 } },
  pwyellow:  { seg: 'hex', tail: { type: 'stinger', col: '#1a1500' }, head: { antennae: { col: '#1a1500', len: 0.7 } }, wings: { col: 'rgba(230,245,255,0.35)' } },
  coalition: { seg: 'hex', spikes: { every: 3, len: 0.45, col: '#c8a040' }, tail: { type: 'fan', col: '#e8c050' }, head: { frill: { col: '#c8a040', col2: '#3a4258', n: 11 } } },
  party:     { seg: 'bead', pat: { type: 'confetti' }, tail: { type: 'balloon', col: '#e83a6a' }, head: { crown: { col: '#ffd23a', party: 1 } } },
  mother:    { seg: 'flat', legs: { every: 1, len: 0.32, col: '$outline' }, head: { antennae: { col: '$outline', len: 0.5 } } },
  queen:     { seg: 'oval', fins: { col: '#5a1a2e', w: 0.5 }, tail: { type: 'fan', col: '#5a1a2e' }, head: { crown: { col: '#ffcf40' } } },
  ouro:      { seg: 'diamond', spikes: { every: 2, len: 0.32, col: '#c8a040' }, tail: { type: 'stinger', col: '#8a2020' }, head: { horns: { col: '#e8dcc0', len: 0.7 } } },
  stok:      { pat: { type: 'fur', col: '#8a6a3a' }, head: { ears: { col: '#a8824e' } }, tail: { type: 'whip', col: '#3a2810' } },
  stroopw:   { seg: 'flat' },
  bril:      { seg: 'oval', pat: { type: 'argyle', col: '#c8b040', col2: '#4a2a36' } },
  handel:    { seg: 'oval', pat: { type: 'coins', col: '#ffd23a', every: 2 }, tail: { type: 'tag', col: '#ffd23a' } },
  pantser:   { seg: 'plate', pat: { type: 'bolts', col: '#4a4e58' }, spikes: { every: 1, len: 0.3, col: '#c8ccd4' }, tail: { type: 'club', col: '#5a5e68' } },
  driekop:   { seg: 'star', spikes: { every: 2, len: 0.5, col: '#a8d050' }, tail: { type: 'spade', col: '#1c4a30' } },
  sloper:    { seg: 'plate', tail: { type: 'club', col: '#3a3a3a' }, pat: { type: 'bolts', col: '#1a1400' } },
  kameleon:  { seg: 'oval', pat: { type: 'spots', col: '#e8d040', col2: '#3a8ad8' }, tail: { type: 'curl' } },
  raver:     { seg: 'bead', pat: { type: 'neon', col: '#3affd8', col2: '#ff3ad8' }, head: { antennae: { col: '#1a0a2a', len: 0.6, tip: '#3affd8' } }, glow: { col: '#d88aff', every: 2, a: 0.35, tips: '#3affd8' } },
  manu:      { seg: 'plate', pat: { type: 'speaker', col: '#3a1414' }, tail: { type: 'plug', col: '#1a1a1a' } },
  manudevil: { seg: 'plate', pat: { type: 'cracks', col: '#ffb030' }, spikes: { every: 2, len: 0.35, col: '#1a0204' }, tail: { type: 'spade', col: '#1a0204' }, head: { horns: { col: '#2a0a0a', len: 0.9 } }, glow: { cracks: '#ff8a20' } },
  rechter:   { seg: 'oval', fins: { col: '#0a0a10', w: 0.6 }, head: { frill: { col: '#f4f0e6', col2: '#d8d2c4', n: 12 } }, tail: { type: 'fan', col: '#0a0a10' } },
  clown:     { seg: 'bead', head: { frill: { col: '#ff4a6a', col2: '#4ad8ff', n: 10 } }, tail: { type: 'pompom', col: '#ff3a3a' } },
  killerclown: { seg: 'star', spikes: { every: 2, len: 0.3, col: '#c8c0b0' }, head: { frill: { col: '#7a1020', col2: '#1a0a10', n: 10 } }, tail: { type: 'pompom', col: '#8a1020' } },
  rage1:     { seg: 'flat', pat: { type: 'cracks', col: '#ffb060' }, glow: { cracks: '#ff7a30' } },
  rage2:     { seg: 'flat', pat: { type: 'cracks', col: '#ffc060' }, spikes: { every: 2, len: 0.3, col: '#3a0a04' }, glow: { cracks: '#ff6a20' } },
  rage3:     { seg: 'star', pat: { type: 'cracks', col: '#ffd070' }, spikes: { every: 1, len: 0.4, col: '#2a0402' }, head: { horns: { col: '#2a0806', len: 0.8 } }, tail: { type: 'club', col: '#2a0402' }, glow: { cracks: '#ff5a10' } },
  stekker:   { seg: 'bead', pat: { type: 'spine', col: '#5a5e68', w: 0.25 }, glow: { col: '#8ad8ff', every: 4, a: 0.3 } },
  bosje:     { spikes: { every: 1, len: 0.3, col: '#1e5a1e' }, tail: { type: 'leaf', col: '#4aa83a' } },
  peukworm:  { tail: { type: 'smoke' } },
  mutant:    { seg: 'bead', pat: { type: 'eyes', every: 3 }, legs: { every: 2, len: 0.7, col: '#8a6a70', wave: 1 } },
  rotling:   { seg: 'bead', pat: { type: 'warts', col: '#5a4e24' } },
  kampioen:  { seg: 'oval', pat: { type: 'stars', col: '#ffd23a', every: 2 }, tail: { type: 'fan', col: '#ffd23a' }, head: { crown: { col: '#ffd23a' } } },
  peuk:      { tail: { type: 'smoke' } },
  tunnel:    { seg: 'plate', pat: { type: 'bolts', col: '#1a1c16' }, legs: { every: 2, len: 0.45, col: '#1a1c16' }, glow: { col: '#ffd060', every: 4, a: 0.35 } },
  leegte:    { fins: { col: 'rgba(140,90,255,0.35)', w: 0.8 }, tail: { type: 'wisp', col: '#8a5aff' }, glow: { col: '#b08aff', every: 3, a: 0.3 } },
  spook:     { seg: 'bead', fins: { col: 'rgba(220,230,255,0.35)', w: 0.7 }, tail: { type: 'wisp', col: '#e8ecf4' } },
  noodle:    { seg: 'oval' },
  wals:      { seg: 'oval', pat: { type: 'stripe', col: '#c8a040', every: 3, w: 0.18 }, head: { frill: { col: '#5a3a70', col2: '#c8a040', n: 9 } }, tail: { type: 'fork', col: '#1a0e24' } },
  aarde:     { seg: 'bead' },
  mars:      { seg: 'bead', pat: { type: 'craters', col: '#8a3418' } },
  neptunus:  { seg: 'oval', fins: { col: 'rgba(90,150,255,0.5)', w: 0.55 }, tail: { type: 'fan', col: '#1a3090' } },
  pluto:     { seg: 'hex', spikes: { every: 2, len: 0.5, col: '#e8f0ff' } },
  saturnus:  { seg: 'flat', pat: { type: 'stripe', col: '#a8844a', every: 1, w: 0.16 } },
  galaxy:    { fins: { col: 'rgba(160,90,255,0.3)', w: 0.7 }, head: { frill: { col: '#3a1a80', col2: '#8a5aff', n: 12 } }, tail: { type: 'wisp', col: '#a87aff' }, glow: { col: '#c8a0ff', every: 2, a: 0.25 } },
  lucha14:   { seg: 'oval', pat: { type: 'chevron', col: '#ffd23a', every: 2, w: 0.16 }, fins: { col: '#ffd23a', w: 0.35 } },
  hagel14:   { seg: 'hex', pat: { type: 'stars', col: '#e8f4ff', every: 2 }, spikes: { every: 2, len: 0.3, col: '#c8e4ff' } },
  kogel14:   { seg: 'oval', pat: { type: 'belt', col: '#5a3a1a', col2: '#e8c050' }, tail: { type: 'fork', col: '#081a3a' } },
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
  oval: (c, p, r) => ell(c, p.x, p.y, r * 1.16, r * 0.9, Math.atan2(lk14y, lk14x)),
  flat: (c, p, r) => ell(c, p.x, p.y, r * 0.8, r * 1.08, Math.atan2(lk14y, lk14x)),
  bead: (c, p, r) => { c.beginPath(); c.arc(p.x, p.y, r * 0.86, 0, TAU); },
  plate: (c, p, r) => lk14poly(c, p, [r * 0.86, -r * 0.6, r * 0.86, r * 0.6, r * 0.6, r * 1.02, -r * 0.6, r * 1.02, -r * 0.86, r * 0.6, -r * 0.86, -r * 0.6, -r * 0.6, -r * 1.02, r * 0.6, -r * 1.02]),
  hex: (c, p, r) => lk14poly(c, p, [r * 1.08, 0, r * 0.54, r * 0.96, -r * 0.54, r * 0.96, -r * 1.08, 0, -r * 0.54, -r * 0.96, r * 0.54, -r * 0.96]),
  diamond: (c, p, r) => lk14poly(c, p, [r * 1.32, 0, 0, r * 0.98, -r * 1.32, 0, 0, -r * 0.98]),
  star: (c, p, r) => { const a = []; for (let i = 0; i < 12; i++) { const q = i * TAU / 12, m = r * (i & 1 ? 0.84 : 1.12); a.push(Math.cos(q) * m, Math.sin(q) * m); } lk14poly(c, p, a); },
};
function seg14(c, sn, k, p, r) {
  const L = sn.K.look14, f = L && SEG14[L.seg];
  if (!f) { circle(c, p.x, p.y, r); return; }
  lk14frame(sn, k); f(c, p, r); c.fill();
}

(() => {
  const col = (v, K, d) => (v ? (v[0] === '$' ? K[v.slice(1)] || d || '#000' : v) : d || K.outline);
  const hsh = (k, s) => { const x = Math.sin(k * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const X = (p, a, b) => p.x + lk14x * a - lk14y * b, Y = (p, a, b) => p.y + lk14y * a + lk14x * b;
  const line = (c, p, a, b, a2, b2) => { c.beginPath(); c.moveTo(X(p, a, b), Y(p, a, b)); c.lineTo(X(p, a2, b2), Y(p, a2, b2)); c.stroke(); };
  const dot = (c, p, a, b, r) => circle(c, X(p, a, b), Y(p, a, b), r);
  const vis = (sn) => sn.pts.filter((p) => !p.hid);
  const CONF = ['#ff4a6a', '#4ad8ff', '#ffd23a', '#7aff6a', '#c87aff'];

  /* patterns, drawn on top of the body before the kind's own decorations */
  const PAT = {
    stripe(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = r * (P.w || 0.2); c.beginPath(); c.moveTo(X(p, -r * 0.15, r * 0.86), Y(p, -r * 0.15, r * 0.86)); c.quadraticCurveTo(X(p, r * 0.25, 0), Y(p, r * 0.25, 0), X(p, -r * 0.15, -r * 0.86), Y(p, -r * 0.15, -r * 0.86)); c.stroke(); },
    chevron(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = r * (P.w || 0.16); c.beginPath(); c.moveTo(X(p, -r * 0.4, r * 0.72), Y(p, -r * 0.4, r * 0.72)); c.lineTo(X(p, r * 0.3, 0), Y(p, r * 0.3, 0)); c.lineTo(X(p, -r * 0.4, -r * 0.72), Y(p, -r * 0.4, -r * 0.72)); c.stroke(); },
    spots(c, p, r, k, P, K) { c.fillStyle = k % 3 ? P.col : P.col2 || P.col; dot(c, p, (hsh(k, 1) - 0.5) * r * 0.6, (hsh(k, 2) - 0.5) * r * 1.1, r * 0.26); },
    camo(c, p, r, k, P) { c.fillStyle = P.col; ell(c, X(p, 0, (hsh(k, 3) - 0.5) * r), Y(p, 0, (hsh(k, 3) - 0.5) * r), r * 0.5, r * 0.3, Math.atan2(lk14y, lk14x) + hsh(k, 4)); c.fill(); c.fillStyle = P.col2; dot(c, p, r * 0.2, (hsh(k, 5) - 0.5) * r, r * 0.22); },
    warts(c, p, r, k, P) { c.fillStyle = P.col; dot(c, p, 0, (hsh(k, 6) - 0.5) * r, r * 0.2); if (k & 1) dot(c, p, -r * 0.3, (hsh(k, 7) - 0.5) * r * 1.2, r * 0.14); },
    argyle(c, p, r, k, P) { c.fillStyle = k & 1 ? P.col : P.col2; lk14poly(c, p, [r * 0.6, 0, 0, r * 0.45, -r * 0.6, 0, 0, -r * 0.45]); c.fill(); },
    bolts(c, p, r, k, P) { c.fillStyle = P.col; for (const s of [-1, 1]) dot(c, p, 0, s * r * 0.62, Math.max(0.8, r * 0.12)); },
    barcode(c, p, r, k, P) { if (k % (P.every || 2)) return; c.lineWidth = Math.max(0.7, r * 0.08); for (const a of [-0.3, -0.12, 0.02, 0.28]) line(c, p, r * a, -r * 0.55, r * a, r * 0.55); },
    buttons(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = P.col; dot(c, p, 0, 0, Math.max(0.8, r * 0.16)); },
    pinstripe(c, p, r, k, P) { c.lineWidth = Math.max(0.6, r * 0.07); for (const s of [-0.45, 0, 0.45]) line(c, p, -r * 0.6, r * s, r * 0.6, r * s); },
    cell(c, p, r, k, P) { c.lineWidth = Math.max(0.8, r * 0.1); line(c, p, 0, -r * 0.7, 0, r * 0.7); c.fillStyle = P.col; dot(c, p, r * 0.35, 0, r * 0.16); },
    stars(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = P.col; const s = r * 0.34; lk14poly(c, p, [s, 0, s * 0.25, s * 0.25, 0, s, -s * 0.25, s * 0.25, -s, 0, -s * 0.25, -s * 0.25, 0, -s, s * 0.25, -s * 0.25]); c.fill(); },
    confetti(c, p, r, k) { for (let j = 0; j < 2; j++) { c.fillStyle = CONF[(k * 2 + j) % CONF.length]; dot(c, p, (hsh(k, j) - 0.5) * r, (hsh(k, j + 9) - 0.5) * r * 1.3, r * 0.15); } },
    neon(c, p, r, k, P) { c.lineWidth = r * 0.22; c.strokeStyle = k & 1 ? P.col : P.col2; line(c, p, 0, -r * 0.8, 0, r * 0.8); },
    speaker(c, p, r, k, P) { if (k & 1) return; c.lineWidth = r * 0.12; c.beginPath(); c.arc(p.x, p.y, r * 0.55, 0, TAU); c.stroke(); c.fillStyle = P.col; circle(c, p.x, p.y, r * 0.22); },
    cracks(c, p, r, k, P) { c.lineWidth = Math.max(0.8, r * 0.1); c.beginPath(); const s = k & 1 ? 1 : -1; c.moveTo(X(p, r * 0.5, -r * 0.6 * s), Y(p, r * 0.5, -r * 0.6 * s)); c.lineTo(X(p, 0, -r * 0.1 * s), Y(p, 0, -r * 0.1 * s)); c.lineTo(X(p, r * 0.1, r * 0.3 * s), Y(p, r * 0.1, r * 0.3 * s)); c.lineTo(X(p, -r * 0.5, r * 0.65 * s), Y(p, -r * 0.5, r * 0.65 * s)); c.stroke(); },
    fur(c, p, r, k, P) { c.lineWidth = Math.max(0.6, r * 0.08); for (const s of [-0.6, -0.2, 0.2, 0.6]) line(c, p, r * 0.2, r * s, -r * 0.3, r * s * 1.15); },
    coins(c, p, r, k, P) { if (k % (P.every || 2)) return; c.fillStyle = P.col; dot(c, p, 0, 0, r * 0.34); c.lineWidth = Math.max(0.6, r * 0.07); c.strokeStyle = '#8a6a10'; c.beginPath(); c.arc(p.x, p.y, r * 0.22, 0, TAU); c.stroke(); },
    eyes(c, p, r, k, P, K, sn, t) { if (k % (P.every || 3) !== 1) return; const s = (k & 2 ? 1 : -1) * r * 0.35, x = X(p, 0, s), y = Y(p, 0, s); c.fillStyle = '#f4ecd8'; circle(c, x, y, r * 0.34); c.fillStyle = '#1a0808'; circle(c, x + Math.cos(t + k) * r * 0.1, y + Math.sin(t * 0.7 + k) * r * 0.1, r * 0.16); },
    craters(c, p, r, k, P) { if (k % 2) return; c.fillStyle = P.col; dot(c, p, (hsh(k, 1) - 0.5) * r * 0.5, (hsh(k, 2) - 0.5) * r * 0.8, r * 0.26); },
    belt(c, p, r, k, P) { c.lineWidth = r * 0.34; line(c, p, r * 0.3, -r * 0.8, -r * 0.3, r * 0.8); c.fillStyle = P.col2; dot(c, p, 0, 0, r * 0.13); },
    spine() {},
  };
  function pattern(c, sn, t) {
    const L = sn.K.look14, P = L && L.pat; if (!P || !PAT[P.type]) return;
    const K = sn.K, pts = sn.pts;
    c.save(); c.strokeStyle = col(P.col, K); c.lineCap = 'round';
    if (P.type === 'spine') {
      c.lineWidth = Math.max(1, K.r0 * (P.w || 0.25)); c.beginPath(); c.moveTo(sn.x, sn.y);
      for (const p of pts) if (!p.hid) c.lineTo(p.x, p.y); c.stroke();
    } else {
      for (let k = 0; k < pts.length; k++) { const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); PAT[P.type](c, p, p.r, k, P, K, sn, t); c.strokeStyle = col(P.col, K); }
    }
    c.restore();
  }

  /* tails, drawn under the last segment, local x points forward (towards the head) */
  const TAIL = {
    whip(c, q, u, T, K) { c.strokeStyle = col(T.col, K, K.body2); c.lineWidth = u * 0.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.quadraticCurveTo(X(q, -u * 1.6, u * 0.5), Y(q, -u * 1.6, u * 0.5), X(q, -u * 2.6, -u * 0.2), Y(q, -u * 2.6, -u * 0.2)); c.stroke(); },
    fork(c, q, u) { lk14poly(c, q, [0, -u * 0.5, -u * 2.4, -u * 1.2, -u * 1.4, 0, -u * 2.4, u * 1.2, 0, u * 0.5]); },
    fan(c, q, u) { lk14poly(c, q, [0, -u * 0.4, -u * 2.3, -u * 1.5, -u * 1.8, 0, -u * 2.3, u * 1.5, 0, u * 0.4]); },
    stinger(c, q, u) { lk14poly(c, q, [0, -u * 0.6, -u * 1.6, -u * 0.4, -u * 2.7, u * 0.5, -u * 1.7, u * 0.15, 0, u * 0.6]); },
    spade(c, q, u) { lk14poly(c, q, [0, -u * 0.22, -u * 1.3, -u * 0.22, -u * 1.2, -u * 0.95, -u * 2.7, 0, -u * 1.2, u * 0.95, -u * 1.3, u * 0.22, 0, u * 0.22]); },
    club(c, q, u) { const a = []; for (let i = 0; i < 16; i++) { const g = i * TAU / 16, m = u * (i & 1 ? 0.8 : 1.25); a.push(-u * 1.7 + Math.cos(g) * m, Math.sin(g) * m); } lk14poly(c, q, a); },
    tag(c, q, u) { lk14poly(c, q, [0, -u * 0.25, -u * 0.8, -u * 0.8, -u * 2.6, -u * 0.8, -u * 2.6, u * 0.8, -u * 0.8, u * 0.8, 0, u * 0.25]); },
    plug(c, q, u) { lk14poly(c, q, [0, -u * 0.3, -u * 1.2, -u * 0.3, -u * 1.2, -u * 0.8, -u * 2.2, -u * 0.8, -u * 2.2, u * 0.8, -u * 1.2, u * 0.8, -u * 1.2, u * 0.3, 0, u * 0.3]); },
    hose(c, q, u, T, K, t) { c.strokeStyle = col(T.col, K); c.lineWidth = u * 0.55; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.bezierCurveTo(X(q, -u * 2, u * 1.4), Y(q, -u * 2, u * 1.4), X(q, -u * 2.4, -u * 1.4), Y(q, -u * 2.4, -u * 1.4), X(q, -u * 3.4, 0), Y(q, -u * 3.4, 0)); c.stroke(); return true; },
    curl(c, q, u, T, K) { c.strokeStyle = K.outline; c.lineWidth = u * 0.95; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); for (let i = 1; i <= 14; i++) { const g = i * 0.5, m = u * (1.6 - i * 0.085); c.lineTo(X(q, -u * 1.6 - Math.sin(g) * m, u * 1.6 - Math.cos(g) * m), Y(q, -u * 1.6 - Math.sin(g) * m, u * 1.6 - Math.cos(g) * m)); } c.stroke(); c.strokeStyle = K.body2; c.lineWidth = u * 0.6; c.stroke(); return true; },
    balloon(c, q, u, T, K) { c.strokeStyle = K.outline; c.lineWidth = 1; line(c, q, 0, 0, -u * 2, u * 0.3); c.fillStyle = K.outline; dot(c, q, -u * 3, u * 0.3, u * 1.15); c.fillStyle = col(T.col, K); dot(c, q, -u * 3, u * 0.3, u * 1); c.fillStyle = 'rgba(255,255,255,0.5)'; dot(c, q, -u * 2.7, -u * 0.05, u * 0.3); return true; },
    pompom(c, q, u, T, K) { c.fillStyle = K.outline; dot(c, q, -u * 1.2, 0, u * 1.05); for (let i = 0; i < 7; i++) { c.fillStyle = i & 1 ? col(T.col, K) : mixHex(col(T.col, K), '#ffffff', 0.3); dot(c, q, -u * 1.2 + Math.cos(i) * u * 0.45, Math.sin(i * 1.7) * u * 0.45, u * 0.5); } return true; },
    leaf(c, q, u, T, K) { c.beginPath(); c.moveTo(X(q, 0, 0), Y(q, 0, 0)); c.quadraticCurveTo(X(q, -u * 1.4, u * 1.2), Y(q, -u * 1.4, u * 1.2), X(q, -u * 2.8, 0), Y(q, -u * 2.8, 0)); c.quadraticCurveTo(X(q, -u * 1.4, -u * 1.2), Y(q, -u * 1.4, -u * 1.2), X(q, 0, 0), Y(q, 0, 0)); },
    flame(c, q, u, T, K, t) { const f = 1 + 0.25 * Math.sin(t * 30 + q.x); c.fillStyle = '#ff7a20'; lk14poly(c, q, [0, -u * 0.6, -u * 2.4 * f, 0, 0, u * 0.6]); c.fill(); c.fillStyle = '#ffe070'; lk14poly(c, q, [0, -u * 0.3, -u * 1.4 * f, 0, 0, u * 0.3]); c.fill(); return true; },
    smoke(c, q, u, T, K, t) { for (let i = 0; i < 4; i++) { const f = (t * 0.7 + i / 4) % 1; c.fillStyle = `rgba(200,200,205,${0.35 * (1 - f)})`; dot(c, q, -u * (1 + f * 5), Math.sin(f * 6 + i) * u * 1.2, u * (0.5 + f * 1.1)); } return true; },
    wisp(c, q, u, T, K, t) { for (let i = 1; i <= 4; i++) { c.globalAlpha *= 0.75; c.fillStyle = col(T.col, K); dot(c, q, -u * i * 0.9, Math.sin(t * 4 + i) * u * 0.4 * i, u * (1.1 - i * 0.2)); } return true; },
  };
  function tail(c, sn, t) {
    const L = sn.K.look14, T = L && L.tail, pts = sn.pts, n = pts.length; if (!T || !n || !TAIL[T.type]) return;
    const q = pts[n - 1]; if (q.hid) return;
    const K = sn.K, u = Math.max(q.r, sn.headR * 0.32) * (T.s || 1);
    lk14frame(sn, n - 1); c.save();
    if (!TAIL[T.type](c, q, u, T, K, t)) { c.fillStyle = col(T.col, K, K.body2); c.fill(); c.strokeStyle = K.outline; c.lineWidth = 1.4; c.stroke(); }
    c.restore();
  }

  /* side parts under the body: spikes, legs, fins, wings */
  function sides(c, sn, t) {
    const L = sn.K.look14, K = sn.K, pts = sn.pts, n = pts.length; if (!n) return;
    if (L.fins) {
      c.fillStyle = col(L.fins.col, K);
      for (const s of [-1, 1]) {
        c.beginPath(); let first = true;
        for (let k = 0; k < n; k++) { const p = pts[k]; lk14frame(sn, k); const w = p.r * (1 + L.fins.w * (0.7 + 0.3 * Math.sin(t * 6 - k * 0.8))); const x = X(p, 0, s * w), y = Y(p, 0, s * w); if (first) c.moveTo(x, y); else c.lineTo(x, y); first = false; }
        for (let k = n - 1; k >= 0; k--) { const p = pts[k]; lk14frame(sn, k); c.lineTo(X(p, 0, s * p.r * 0.5), Y(p, 0, s * p.r * 0.5)); }
        c.fill();
      }
    }
    if (L.wings) {
      const p = pts[Math.min(1, n - 1)]; lk14frame(sn, 1); const fl = 0.75 + 0.25 * Math.sin(t * 40), r = sn.headR;
      c.fillStyle = col(L.wings.col, K); c.strokeStyle = 'rgba(40,40,60,0.6)'; c.lineWidth = 1;
      for (const s of [-1, 1]) { ell(c, X(p, -r * 0.6, s * r * 1.1 * fl), Y(p, -r * 0.6, s * r * 1.1 * fl), r * 0.5, r * 0.85 * fl, Math.atan2(lk14y, lk14x) + s * 0.5); c.fill(); c.stroke(); }
    }
    if (L.legs) {
      const G = L.legs; c.strokeStyle = col(G.col, K); c.lineCap = 'round';
      for (let k = 0; k < n; k += G.every || 1) {
        const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); c.lineWidth = Math.max(1, p.r * 0.22);
        const sw = Math.sin(t * 14 + k * 1.3) * p.r * 0.45;
        for (const s of [-1, 1]) {
          if (G.wave) { c.beginPath(); c.moveTo(X(p, 0, s * p.r * 0.6), Y(p, 0, s * p.r * 0.6)); c.quadraticCurveTo(X(p, sw, s * p.r * (1.2 + G.len * 0.5)), Y(p, sw, s * p.r * (1.2 + G.len * 0.5)), X(p, -sw - p.r * 0.4, s * p.r * (1 + G.len * 1.4)), Y(p, -sw - p.r * 0.4, s * p.r * (1 + G.len * 1.4))); c.stroke(); }
          else line(c, p, 0, s * p.r * 0.6, sw * s - p.r * 0.2, s * (p.r * (1 + G.len) + 2.5));
        }
      }
    }
    if (L.spikes) {
      const S = L.spikes; c.fillStyle = col(S.col, K); c.strokeStyle = K.outline; c.lineWidth = 1.1;
      for (let k = 0; k < n; k += S.every || 1) {
        const p = pts[k]; if (p.hid) continue; lk14frame(sn, k); const r = p.r;
        for (const s of [-1, 1]) { lk14poly(c, p, [r * 0.35, s * r * 0.7, -r * 0.45 - r * S.len * 0.6, s * (r * (1 + S.len) + 2.5), -r * 0.35, s * r * 0.7]); c.fill(); c.stroke(); }
      }
    }
  }

  /* head parts: under (behind the head) and over */
  function headUnder(c, sn, H, K, D, t) {
    c.strokeStyle = K.outline; c.lineWidth = 1.4; c.lineJoin = 'round';
    if (D.frill) {
      const F = D.frill, m = F.n || 10;
      for (let i = 0; i < m; i++) {
        const a = Math.PI + (i / (m - 1) - 0.5) * 3.6;
        ell(c, -H * 0.15 + Math.cos(a) * H * 0.95, Math.sin(a) * H * 0.95, H * 0.55, H * 0.32, a); c.fillStyle = col(i & 1 ? F.col2 : F.col, K); c.fill(); c.stroke();
      }
    }
    if (D.horns) for (const s of [-1, 1]) {
      const l = D.horns.len || 0.7; c.beginPath(); c.moveTo(H * 0.15, s * H * 0.5);
      c.quadraticCurveTo(-H * 0.1, s * H * (1.25 + l * 0.3), -H * (0.55 + l), s * H * (1.05 + l * 0.45));
      c.quadraticCurveTo(-H * 0.35, s * H * 0.85, -H * 0.45, s * H * 0.4); c.closePath();
      c.fillStyle = col(D.horns.col, K); c.fill(); c.stroke();
    }
    if (D.ears) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-H * 0.05, s * H * 0.6); c.quadraticCurveTo(-H * 0.4, s * H * 1.45, -H * 0.75, s * H * 0.55); c.closePath(); c.fillStyle = col(D.ears.col, K); c.fill(); c.stroke(); }
    if (D.antennae) for (const s of [-1, 1]) {
      const A = D.antennae, l = A.len || 0.5, w = Math.sin(t * 5 + s) * H * 0.12, tx = H * (1.05 + l), ty = s * H * (0.95 + l * 0.4) + w;
      c.strokeStyle = col(A.col, K); c.lineWidth = Math.max(1.2, H * 0.1); c.lineCap = 'round';
      c.beginPath(); c.moveTo(H * 0.3, s * H * 0.4); c.quadraticCurveTo(H * 0.9, s * H * 0.45, tx, ty); c.stroke();
      if (A.tip) { c.fillStyle = A.tip; circle(c, tx, ty, H * 0.15); }
    }
    if (D.whiskers) { c.strokeStyle = col(D.whiskers.col, K); c.lineWidth = Math.max(0.8, H * 0.05); for (const s of [-1, 1]) for (const a of [0.25, 0.5, 0.8]) { c.beginPath(); c.moveTo(H * 0.75, s * H * 0.3); c.quadraticCurveTo(H * 1.3, s * H * (0.3 + a * 0.5), H * 1.6, s * H * (0.2 + a)); c.stroke(); } }
  }
  function headOver(c, sn, H, K, D, t) {
    c.strokeStyle = K.outline; c.lineWidth = 1.4; c.lineJoin = 'round';
    if (D.crown) {
      const a = []; for (let i = 0; i < 10; i++) { const g = i * TAU / 10, m = H * (i & 1 ? 0.26 : 0.46); a.push(-H * 0.62 + Math.cos(g) * m, Math.sin(g) * m); }
      c.beginPath(); for (let i = 0; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); c.closePath();
      c.fillStyle = D.crown.party ? CONF[Math.floor(t * 4) % CONF.length] : col(D.crown.col, K); c.fill(); c.stroke();
      c.fillStyle = D.crown.party ? '#ffffff' : '#e83a4a'; circle(c, -H * 0.62, 0, H * 0.1);
    }
    if (D.mohawk) { c.fillStyle = col(D.mohawk.col, K); const m = D.mohawk.n || 3; for (let i = 0; i < m; i++) { const x = -H * 0.2 - i * H * 0.3; c.beginPath(); c.moveTo(x + H * 0.2, -H * 0.12); c.lineTo(x - H * 0.25, 0); c.lineTo(x + H * 0.2, H * 0.12); c.closePath(); c.fill(); c.stroke(); } }
  }

  /* hook into the draw chain (assigning the global function names, like the rot and mud layers do) */
  for (const k in LOOK14) if (KINDS[k]) KINDS[k].look14 = LOOK14[k];
  const ds0 = drawSnake;
  drawSnake = function (c, sn, t) {
    const L = sn.K.look14;
    if (L && !V9_BODY[sn.kind] && !(sn.cloak != null && sn.cloak < 0.05)) {
      try {
        c.save(); if (sn.cloak != null && sn.cloak < 0.999) c.globalAlpha *= Math.max(0.05, sn.cloak);
        if (sn.fade < 1) c.globalAlpha *= Math.max(0.05, sn.fade);
        sides(c, sn, t); tail(c, sn, t);
      } catch (e) { errNote14(e, 'look14'); }
      c.restore();
    }
    return ds0(c, sn, t);
  };
  const dec0 = decorateSnake;
  decorateSnake = function (c, sn, t) {
    if (sn.K.look14) { try { pattern(c, sn, t); } catch (e) { errNote14(e, 'look14 pat'); } }
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
    if (G.tips) { const H = sn.headR, l = (L.head.antennae.len || 0.5); for (const s of [-1, 1]) { const a = sn.drawAng, lx = H * (1.05 + l), ly = s * H * (0.95 + l * 0.4); glowDot(c, sn.x + Math.cos(a) * lx - Math.sin(a) * ly, sn.y + Math.sin(a) * lx + Math.cos(a) * ly, H * 0.6, G.tips, 0.5); } }
    c.restore();
    return r;
  };
  Object.assign(window.__bitten || (window.__bitten = {}), { LOOK14 });
})();
