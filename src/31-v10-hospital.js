/* src/31-v10-hospital.js: v10: the clown hospital, rage worms. From v10. Lines 16934 to 17019 of the v13.7 script. */
/* =====================================================================
   Version 10: the clowns took over a hospital, the rage worms, the
   Tunnelwacht and four new floors, Jaude, Apploa Vogels, forty one new
   powerups, new downgrades and curses, and the clash rules
   ===================================================================== */

/* ------------------------------------------------------------------ the renamed powerups: same effects, new names */
const V10_RENAMES = {
  twin: '2 Apples, 2 Seeds', big: 'Big load', spread: 'Wide Spread', thorn: 'Pierced', rubber: 'Still In The Rubber', rain: 'Shot-Seedgun',
  seeker: 'Rigged Seed', split: 'Strong Seed', boomer: 'Return Of The Seed', lucky: 'Golden Seed', wiggle: 'Wavy Seed', quick: 'Vluggertje',
  sharp: 'Sharp Seed', sniper: 'Sniper Kirk', coaster: 'Circular Seed', pick: 'Diamanten Pikhouweel', bril: 'Glasses From Kees vd Specsavers',
  koffie: 'Oploskoffie', cyanide: 'Cyclion-P', frost: 'Freezedried', fizzy: 'Splash', storm: 'Zaadstorm', fuse: 'Kort Lontje', veto: 'VETO',
  dash: 'DASH!', drop: 'Beat Drop', pinda: 'Pindacheese With Stukjes', verzoek: 'Tikkie', speaker: 'JBL Box',
};
// the names they had before, so an older texts file does not quietly undo the new ones
const V10_OLD_NAMES = {};
const V10_OLD_TXT = { dash: ITEMS.dash.desc, rot: CHARS.rot.perk };
for (const id in V10_RENAMES) { V10_OLD_NAMES[id] = ITEMS[id].name; ITEMS[id].name = V10_RENAMES[id]; }
ITEMS.dash.desc = 'Dash with Space, Shift, right click or a double tap. Untouchable mid dash.';
CHARS.rot.perk = 'Starts with Cyclion-P and The Worm.';

/* ------------------------------------------------------------------ small shared helpers */
const SEED10 = { s: null };          // the seed that is hitting a snake right now
const SWAP_HOLD10 = 1.2;             // how long you stand on a clashing powerup to swap it
function fx10(room) {
  if (!room.fx10) room.fx10 = { balloons: [], lobs: [], warns: [], zones: [], ads: [], sparks: [], pballs: [], carts: [], rest: null };
  return room.fx10;
}
function fighting10(room) { return !!(room && room.locked && room.snakes.some((s) => s.alive && s.state === 'active')); }
function nearSnake10(room, x, y, maxD, skipBurrowed = true) {
  let best = null, bd = maxD * maxD;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || (skipBurrowed && sn.burrowed)) continue;
    const d = dist2(sn.x, sn.y, x, y); if (d < bd) { bd = d; best = sn; }
  }
  return best;
}
function ring10(x, y, r, col, life = 0.4, glow = true) { addP({ kind: 'ring', x, y, vx: 0, vy: 0, r, life, col, drag: 0, glow }); }
function txt10(c, s, x, y, size, col, weight = 800, align = 'center') {
  c.font = `${weight} ${size}px ${UIF}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(sayF9(s), x, y);
}
// a warning circle on the floor that goes off after a moment
function warn10(room, x, y, r, t, onFire, col = '#ff6a4a', o = {}) {
  const w = Object.assign({ x, y, r, t: 0, warn: t, fire: onFire, col }, o);
  fx10(room).warns.push(w);
  return w;
}
// something thrown in a high arc that lands after a moment
function lob10(room, x0, y0, x1, y1, dur, kind, onLand, o = {}) {
  const l = Object.assign({ x0, y0, x1, y1, t: 0, dur, kind, land: onLand, rot: rnd(TAU), r: o.r || 40 }, o);
  fx10(room).lobs.push(l);
  return l;
}
// a hole in the floor for a while: the floor fills back in when it is done
function crater10(room, x, y, life = 6) {
  const c = clamp(Math.floor(x / T), 0, COLS - 1), r = clamp(Math.floor(y / T), 0, ROWS - 1);
  if (room.tiles[r][c] || isDoorZone(r, c)) return null;
  const o = { type: 'pit', solid: true, shots: false, c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, shake: 0, seed: Math.random(), wob: 0, crater10: life };
  // never cut the room in two, and never shut a snake or the apple in
  room.tiles[r][c] = o;
  if (!roomOk10(room)) { room.tiles[r][c] = null; return null; }
  room.obs.push(o); room.ver++; room.dirty = true;
  const P = G.player;
  if (P && Math.abs(P.x - o.x) < T / 2 + P.r - 4 && Math.abs(P.y - o.y) < T / 2 + P.r - 4 && !P.flyer) {
    const f = nearestFreeCell(room, P.x, P.y); P.x = f.x; P.y = f.y;
  }
  burst(o.x, o.y, 14, G.levelDef.dirt || '#3a3028', { kind: 'shard', min: 30, max: 120, rmin: 1.4, rmax: 3, lmin: 0.4, lmax: 0.8, drag: 4 });
  return o;
}
// is every open cell still connected to every other one
function roomOk10(room) {
  let start = -1, total = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!room.solid(c, r)) { total++; if (start < 0) start = r * COLS + c; }
  if (start < 0) return false;
  const seen = new Set([start]), q = [start];
  while (q.length) {
    const k = q.pop(), c = k % COLS, r = (k - c) / COLS;
    for (const d of DIR4) {
      const nc = c + d[0], nr = r + d[1], nk = nr * COLS + nc;
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen.has(nk) || room.solid(nc, nr)) continue;
      seen.add(nk); q.push(nk);
    }
  }
  return seen.size === total;
}

