/* src/05-world.js: world: rooms, level layout, collision helpers. From v1 to v8. Lines 1360 to 1823 of the v13.7 script. */
/* =====================================================================
   World: rooms, level layout, collision helpers
   ===================================================================== */
class Room {
  constructor(gx, gy, id) {
    this.gx = gx; this.gy = gy; this.id = id;
    this.doors = {}; this.type = 'fight';
    this.visited = false; this.cleared = false; this.locked = false; this.doorCl = 0;
    this.tiles = []; this.obs = []; this.spawns = [];
    this.snakes = []; this.pickups = []; this.decals = [];
    this.sconces = []; this.chest = null; this.exit = null; this.tutorial = false; this.balls = []; this.rots = []; this.fires = [];
    this.carts = []; this.belts = []; this.beltMap = null; this.lecterns = []; this.shopSpots = []; this.spikes = []; this.coinsOut = 0;
    this.skins = []; this.roots = []; this.cracks = []; this.turrets = []; this.sap = []; this.clouds = []; this.spores = [];
    this.books = []; this.slot = null; this.spring = null; this.sealed = false;
    this.pumps9 = []; this.till9 = null; this.chair9 = null; this.plates9 = []; this.syrup9 = []; this.lasers9 = null;
    this.cache = null; this.cacheCtx = null; this.cacheK = 0; this.dirty = true;
    this.seed = Math.floor(Math.random() * 1e9);
    this.ver = 0; this._dm = null; this._dmKey = -1; this._dmVer = -1;
  }

  build(tpl, def, opt = {}) {
    this.tiles = []; this.obs = []; this.spawns = []; this.chest = null; this.rots = []; this.altar = null; this.balls = []; this.fires = [];
    this.carts = []; this.belts = []; this.beltMap = null; this.lecterns = []; this.shopSpots = []; this.books = []; this.slot = null; this.spring = null;
    this.pumps9 = []; this.till9 = null; this.chair9 = null; this.plates9 = []; this.syrup9 = []; this.lasers9 = null;
    const map = Object.assign({ W: 'grub', S: 'hood', B: 'lamprey', G: 'long', R: 'rotter', Q: 'tetra', V: 'rocket', F: 'fuel', N: 'bonus', D: 'discount', M: 'kamerlid', L: 'lobby', P: 'splitter', Z: 'sniper' }, V9_SPAWN);
    const grid = shapeTemplate(tpl, def, opt);
    for (let r = 0; r < ROWS; r++) {
      const line = new Array(COLS).fill(null);
      this.tiles.push(line);
      const row = grid[r];
      for (let c = 0; c < COLS; c++) {
        const ch = row[c] || '.';
        let o = null;
        if (ch === '#') o = { type: 'rock', solid: true, shots: true };
        else if (ch === 'u') o = { type: 'urn', solid: true, shots: true, hp: 3, max: 3, breakable: true };
        else if (ch === 'e') o = { type: 'egg', solid: true, shots: true, hp: 2, max: 2, breakable: true };
        else if (ch === 'c') o = { type: 'candle', solid: true, shots: false };
        else if (ch === 'X') o = { type: 'chest', solid: true, shots: true, open: false, t: 0 };
        else if (ch === 'A') o = { type: 'altar', solid: true, shots: true, kind: 'challenge' };
        else if (ch === 'O') o = { type: 'altar', solid: true, shots: true, kind: 'offering' };
        else if (ch === 'h') this.pickups.push({ kind: 'heart', amount: Math.random() < 0.4 ? 2 : 1, x: (c + 0.5) * T, y: (r + 0.5) * T, vx: 0, vy: 0, t: 0.5, ph: Math.random() * 10 });
        else if (ch === 'r') this.rots.push({ x: (c + 0.5) * T, y: (r + 0.5) * T, hp: 2, ph: Math.random() * 10, shake: 0 });
        else if (ch === 'Y') o = { type: 'lectern', solid: true, shots: true };
        else if (ch === 'T') o = { type: 'counter', solid: true, shots: true };
        else if (ch === 'H') o = { type: 'wall', solid: true, shots: true };
        else if (ch === 'J') o = { type: 'slot', solid: true, shots: true, pulls: 0, items: 0, spin: 0, reels: [0, 1, 2], show: null, cd: 0, broken: false };
        else if (ch === 'I') o = { type: 'book', solid: true, shots: true };
        else if (ch === 'U') o = { type: 'altar', solid: true, shots: true, kind: 'survival' };
        else if (ch === 'g') o = { type: 'gold', solid: true, shots: true, hp: 4, max: 4, breakable: true };
        else if (ch === '~') this.spring = { x: (c + 0.5) * T, y: (r + 0.5) * T, used: false, t: 0 };
        else if (ch === 'K') this.carts.push({ x: (c + 0.5) * T, y: (r + 0.5) * T, vx: 0, vy: 0, r: 13, ang: Math.random() < 0.5 ? 0 : Math.PI / 2, last: null, hitCd: 0, spin: 0 });
        else if (ch === '>' || ch === '<') {
          if (!this.beltMap) this.beltMap = new Int8Array(COLS * ROWS);
          this.beltMap[r * COLS + c] = ch === '>' ? 1 : -1; this.belts.push({ c, r, dir: ch === '>' ? 1 : -1 });
        } else if ('$+%!q'.includes(ch)) this.shopSpots.push({ x: (c + 0.5) * T, y: (r + 0.5) * T, ch });
        else if ('567893nobxlfps'.includes(ch)) o = tile9(this, ch, c, r);
        else if (TILE10_CH.includes(ch)) o = tile10(this, ch, c, r);
        else if (map[ch]) this.spawns.push({ kind: map[ch], c, r });
        if (o) {
          o.c = c; o.r = r; o.x = (c + 0.5) * T; o.y = (r + 0.5) * T;
          o.shake = 0; o.seed = Math.random(); o.wob = 0;
          line[c] = o; this.obs.push(o);
          if (o.type === 'chest') this.chest = o;
          if (o.type === 'altar') this.altar = o;
          if (o.type === 'lectern') this.lecterns.push(o);
          if (o.type === 'book') this.books.push(o);
          if (o.type === 'slot') this.slot = o;
          if (o.type === 'candle' && def && def.candleStyle === 'sign') { o.flames = []; o.sign = true; }
          else if (o.type === 'candle') {
            const n = 2 + Math.floor(Math.random() * 2);
            o.flames = [];
            for (let i = 0; i < n; i++) {
              const a = (i / n) * TAU + Math.random();
              const h = 9 + Math.random() * 8;
              o.flames.push({ dx: Math.cos(a) * 6, dy: Math.sin(a) * 4 + 3, h, ph: Math.random() * 10 });
            }
          }
        }
      }
    }
    // wall sconces: a few flickering lights set into the walls
    const spots = [
      { side: 'n', x: T * 2.5 }, { side: 'n', x: T * 8.5 }, { side: 's', x: T * 2.5 }, { side: 's', x: T * 8.5 },
      { side: 'w', y: T * 1.6 }, { side: 'w', y: T * 7.4 }, { side: 'e', y: T * 1.6 }, { side: 'e', y: T * 7.4 },
    ];
    shuffle(spots);
    const n = this.type === 'boss' ? 4 : 2 + Math.floor(Math.random() * 2);
    this.sconces = spots.slice(0, n).map((s) => {
      if (s.side === 'n') return { x: s.x, y: -WALL * 0.45, lx: s.x, ly: 4, side: 'n', ph: Math.random() * 10 };
      if (s.side === 's') return { x: s.x, y: RH + WALL * 0.45, lx: s.x, ly: RH - 4, side: 's', ph: Math.random() * 10 };
      if (s.side === 'w') return { x: -WALL * 0.45, y: s.y, lx: 4, ly: s.y, side: 'w', ph: Math.random() * 10 };
      return { x: RW + WALL * 0.45, y: s.y, lx: RW - 4, ly: s.y, side: 'e', ph: Math.random() * 10 };
    });
    // the supermarket has buzzing tube lights instead of torches, and so does every shop
    this.tubes = null;
    if ((def && def.tubes) || this.type === 'shop' || this.type === 'tank' || this.type === 'kapper') {
      this.sconces = [];
      this.tubes = [{ x: RW / 2, y: RH * 0.27, w: 150, ph: Math.random() * 10, broken: Math.random() < 0.4 }, { x: RW / 2, y: RH * 0.73, w: 150, ph: Math.random() * 10, broken: Math.random() < 0.2 }];
    }
    this.dirty = true;
  }

  solid(c, r) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
    const o = this.tiles[r][c];
    return !!(o && o.solid);
  }
  tileAt(x, y) {
    const c = Math.floor(x / T), r = Math.floor(y / T);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return null;
    return this.tiles[r][c];
  }
  removeObstacle(o) {
    if (this.tiles[o.r][o.c] === o) this.tiles[o.r][o.c] = null;
    const i = this.obs.indexOf(o);
    if (i >= 0) this.obs.splice(i, 1);
    this.ver++;
  }
  // BFS distance (in tiles) from the cell containing px,py, cached per cell
  distMap(px, py) {
    const pc = clamp(Math.floor(px / T), 0, COLS - 1), pr = clamp(Math.floor(py / T), 0, ROWS - 1);
    const key = pr * COLS + pc;
    if (this._dm && this._dmKey === key && this._dmVer === this.ver) return this._dm;
    const dm = this._dm || (this._dm = new Int16Array(COLS * ROWS));
    dm.fill(-1);
    const q = [key]; dm[key] = 0; let h = 0;
    while (h < q.length) {
      const k = q[h++]; const c = k % COLS, r = (k - c) / COLS;
      for (const d of DIR4) {
        const nc = c + d[0], nr = r + d[1];
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        const nk = nr * COLS + nc;
        if (dm[nk] >= 0 || this.solid(nc, nr)) continue;
        dm[nk] = dm[k] + 1; q.push(nk);
      }
    }
    this._dmKey = key; this._dmVer = this.ver;
    return dm;
  }
}

/* Turns a template into a room layout: mirrored, and for fight rooms shuffled a little. */
const SWAP_POOL = { cellar: 'WWWS', halls: 'WWSB', market: 'WWNS', kamer: 'WMMS', garden: 'WSBB' };
const NEW_WORMS = { cellar: 'VFP', halls: 'QVFZP', market: 'NDFVZ', kamer: 'MLQZ', garden: 'QVFPZ' };
const isDoorZone = (r, c) => (c >= 4 && c <= 6 && (r <= 1 || r >= 7)) || (r >= 3 && r <= 5 && (c <= 1 || c >= 9));
const SOLID_CH = '#uecXAOYTHJIUg567893nobxlf_=[&/4';
function tplConnected(g) {
  const seen = new Set(['0,5']); const q = [[0, 5]];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of DIR4) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || SOLID_CH.includes(g[nr][nc])) continue;
      const k = nr + ',' + nc; if (seen.has(k)) continue; seen.add(k); q.push([nr, nc]);
    }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!SOLID_CH.includes(g[r][c]) && !seen.has(r + ',' + c)) return false;
  return true;
}
function shapeTemplate(tpl, def, opt) {
  const rng = opt.rng || Math.random;
  const set = (def && def.set) || 'cellar', tier = (def && def.tier) || 0;
  let rows = tpl.map((r) => (r + '...........').slice(0, COLS));
  if (opt.fy) rows = rows.slice().reverse();
  if (opt.fx) rows = rows.map((r) => r.split('').reverse().map((ch) => (ch === '>' ? '<' : ch === '<' ? '>' : ch)).join(''));
  const g = rows.map((r) => r.split(''));
  if (!opt.shuffle) return g;
  const pool = SWAP_POOL[set] || SWAP_POOL.cellar;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if ('WSB'.includes(g[r][c]) && rng() < 0.25) g[r][c] = pool[Math.floor(rng() * pool.length)];
  }
  const free = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (g[r][c] === '.' && !isDoorZone(r, c)) free.push([r, c]);
  shuffle(free, rng);
  const extra = rng() < 0.45 ? 1 : rng() < 0.6 ? 2 : 0;
  let placed = 0;
  for (const [r, c] of free) {
    if (placed >= extra) break;
    g[r][c] = rng() < 0.6 ? 'u' : 'e';
    if (tplConnected(g)) placed++; else g[r][c] = '.';
  }
  // newer worms sneak into some rooms, more often deeper down
  const nw = [0.24, 0.4, 0.5, 0.5, 0.46][Math.min(4, tier)];
  if (rng() < nw) {
    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if ('WSB'.includes(g[r][c])) cells.push([r, c]);
    if (cells.length) {
      const [r, c] = cells[Math.floor(rng() * cells.length)];
      const wp = NEW_WORMS[set] || 'VF';
      g[r][c] = wp[Math.floor(rng() * wp.length)];
    }
  }
  if (opt.mod === 'swarm') {
    let add = 2;
    for (const [r, c] of free) { if (!add) break; if (g[r][c] === '.') { g[r][c] = 'W'; add--; } }
  }
  return g;
}

function tileInset(o) { if (INSET9[o.type] != null) return INSET9[o.type]; return o.type === 'candle' ? 9 : o.type === 'wall' ? 0 : o.type === 'chest' || o.type === 'altar' || o.type === 'lectern' || o.type === 'slot' || o.type === 'book' ? 5 : 3; }

// Push a circle out of solid tiles. Room bounds are handled by the caller.
function resolveTiles(room, x, y, r) {
  for (let pass = 0; pass < 2; pass++) {
    const c0 = Math.floor((x - r) / T), c1 = Math.floor((x + r) / T);
    const r0 = Math.floor((y - r) / T), r1 = Math.floor((y + r) / T);
    for (let rr = r0; rr <= r1; rr++) {
      if (rr < 0 || rr >= ROWS) continue;
      for (let cc = c0; cc <= c1; cc++) {
        if (cc < 0 || cc >= COLS) continue;
        const o = room.tiles[rr][cc];
        if (!o || !o.solid) continue;
        const ins = tileInset(o);
        const minX = cc * T + ins, maxX = (cc + 1) * T - ins, minY = rr * T + ins, maxY = (rr + 1) * T - ins;
        const nx = clamp(x, minX, maxX), ny = clamp(y, minY, maxY);
        const dx = x - nx, dy = y - ny, d2 = dx * dx + dy * dy;
        if (d2 >= r * r) continue;
        if (d2 > 1e-6) { const d = Math.sqrt(d2); x = nx + (dx / d) * r; y = ny + (dy / d) * r; }
        else {
          const l = x - minX, rt = maxX - x, tp = y - minY, bt = maxY - y;
          const m = Math.min(l, rt, tp, bt);
          if (m === l) x = minX - r; else if (m === rt) x = maxX + r; else if (m === tp) y = minY - r; else y = maxY + r;
        }
      }
    }
  }
  return [x, y];
}

// Is a circle free of walls and solid tiles?
function freeAt(room, x, y, r) {
  if (x < r || y < r || x > RW - r || y > RH - r) return false;
  const c0 = Math.floor((x - r) / T), c1 = Math.floor((x + r) / T);
  const r0 = Math.floor((y - r) / T), r1 = Math.floor((y + r) / T);
  for (let rr = r0; rr <= r1; rr++) {
    for (let cc = c0; cc <= c1; cc++) {
      if (cc < 0 || rr < 0 || cc >= COLS || rr >= ROWS) return false;
      const o = room.tiles[rr][cc];
      if (!o || !o.solid) continue;
      const ins = tileInset(o);
      const nx = clamp(x, cc * T + ins, (cc + 1) * T - ins), ny = clamp(y, rr * T + ins, (rr + 1) * T - ins);
      if (dist2(x, y, nx, ny) < r * r) return false;
    }
  }
  return true;
}

// Does a shot travel cleanly between two points?
function clearLine(room, x0, y0, x1, y1) {
  const d = dist(x0, y0, x1, y1); const n = Math.ceil(d / 12);
  for (let i = 1; i < n; i++) {
    const t = i / n; const o = room.tileAt(lerp(x0, x1, t), lerp(y0, y1, t));
    if (o && o.shots) return false;
  }
  return true;
}

function nearestFreeCell(room, x, y, avoid) {
  const c0 = clamp(Math.floor(x / T), 0, COLS - 1), r0 = clamp(Math.floor(y / T), 0, ROWS - 1);
  let best = null, bd = Infinity;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (room.solid(c, r)) continue;
      if (avoid && avoid(c, r)) continue;
      const d = (c - c0) * (c - c0) + (r - r0) * (r - r0);
      if (d < bd) { bd = d; best = { c, r, x: (c + 0.5) * T, y: (r + 0.5) * T }; }
    }
  }
  return best || { c: 5, r: 4, x: RW / 2, y: RH / 2 };
}

function generateLevel(def, rng) {
  const N = def.rooms, set = def.set || 'cellar', tier = def.tier || 0;
  const key = (x, y) => x + ',' + y;
  for (let attempt = 0; attempt < 600; attempt++) {
    const grid = new Map(); const rooms = [];
    const add = (x, y) => { const r = new Room(x, y, rooms.length); rooms.push(r); grid.set(key(x, y), r); return r; };
    add(0, 0);
    let guard = 0;
    while (rooms.length < N && guard++ < 500) {
      const base = rooms[Math.floor(rng() * rooms.length)];
      const d = DIR4[Math.floor(rng() * 4)];
      const nx = base.gx + d[0], ny = base.gy + d[1];
      if (grid.has(key(nx, ny))) continue;
      let nb = 0;
      for (const e of DIR4) if (grid.has(key(nx + e[0], ny + e[1]))) nb++;
      if (nb !== 1) continue;
      add(nx, ny);
    }
    if (rooms.length < N) continue;
    for (const r of rooms) {
      for (const k in DOORV) { const v = DOORV[k]; const o = grid.get(key(r.gx + v[0], r.gy + v[1])); if (o) r.doors[k] = o; }
    }
    const start = rooms[0]; start.dist = 0;
    const q = [start]; const seen = new Set([start]);
    while (q.length) {
      const r = q.shift();
      for (const k in r.doors) { const o = r.doors[k]; if (!seen.has(o)) { seen.add(o); o.dist = r.dist + 1; q.push(o); } }
    }
    const dead = rooms.filter((r) => r !== start && Object.keys(r.doors).length === 1).sort((a, b) => b.dist - a.dist);
    if (dead.length < 3 || dead[0].dist < 2) continue;
    const boss = dead[0];
    // special rooms: dead ends first, then quiet rooms in the middle
    const wants = ['chest', 'shop'], extra = [];
    const roll = (w) => { let x = rng(); for (const [t, p] of w) { if (x < p) return t; x -= p; } return w[w.length - 1][0]; };
    if (rng() < 0.7) extra.push('challenge');
    if (rng() < 0.7) extra.push(roll(set === 'kamer' ? [['vote', 0.5], ['offering', 0.25], ['pantry', 0.25]] : set === 'market' ? [['pantry', 0.45], ['offering', 0.3], ['vote', 0.25]] : [['offering', 0.4], ['pantry', 0.35], ['vote', 0.25]]));
    if (rng() < 0.8) extra.push(roll(set === 'market' ? [['gamble', 0.4], ['survival', 0.2], ['miniboss', 0.2], ['spring', 0.1], ['library', 0.1]]
      : set === 'kamer' ? [['library', 0.3], ['miniboss', 0.25], ['survival', 0.2], ['gamble', 0.15], ['spring', 0.1]]
        : tier === 0 ? [['gamble', 0.3], ['spring', 0.25], ['survival', 0.25], ['library', 0.2]]
          : [['miniboss', 0.26], ['survival', 0.24], ['gamble', 0.18], ['spring', 0.17], ['library', 0.15]]));
    extra9(extra, set, tier, rng, def);
    wants.push(...shuffle(extra, rng));
    const slots = shuffle(dead.slice(1), rng);
    const mids = shuffle(rooms.filter((r) => r !== start && r !== boss && !dead.includes(r) && r.dist >= 2 && Object.keys(r.doors).length <= 2), rng);
    const special = new Map();
    for (const t of wants) {
      const r = slots.shift() || mids.shift();
      if (!r) break;
      if (rooms.length - 2 - special.size - 1 < (tier === 0 ? 3 : 4) && t !== 'chest' && t !== 'shop') break;
      special.set(r, t);
    }
    if ([...special.values()].filter((t) => t === 'chest' || t === 'shop').length < 2) continue;
    const fights = shuffle((FIGHT_SETS[set] || FIGHT_SETS.cellar).slice(), rng);
    let fi = 0;
    for (const r of rooms) {
      const flip = { rng, fx: rng() < 0.5, fy: rng() < 0.5 };
      if (set === 'market') r.store = rng() < 0.5 ? 'blue' : 'yellow';
      const t = special.get(r);
      if (r === start) { r.type = 'start'; r.build(START_SETS[set] || START_SETS.cellar, def); r.cleared = true; r.tutorial = !!def.first; }
      else if (r === boss) { r.type = 'boss'; r.build(TPL.boss, def); }
      else if (t === 'chest') { r.type = 'chest'; r.build(TPL.chest, def, flip); r.cleared = true; if (r.chest && tier >= 1 && rng() < 0.22) r.chest.mimic = true; }
      else if (t === 'shop') { r.type = 'shop'; r.build(TPL.shop, def, flip); r.cleared = true; if (!r.store) r.store = rng() < 0.5 ? 'blue' : 'yellow'; }
      else if (t === 'challenge') { r.type = 'challenge'; r.build(TPL.challenge, def, flip); r.cleared = false; r.wave = 0; }
      else if (t === 'vote') { r.type = 'vote'; r.voteRoom = true; r.build(TPL.vote, def); r.cleared = true; }
      else if (t === 'miniboss') { r.type = 'miniboss'; r.build(TPL.miniboss, def, flip); r.cleared = false; const mp = MINI_POOL[set] || MINI_POOL.cellar; r.mini = mp[Math.floor(rng() * mp.length)]; }
      else if (t === 'survival') { r.type = 'survival'; r.build(TPL.survival, def, flip); r.cleared = false; r.surv = { on: false, t: 0, spawnT: 0, len: tier === 0 ? 20 : 25 }; }
      else if (t === 'library' || t === 'gamble' || t === 'spring') { r.type = t; r.build(TPL[t], def, t === 'library' ? { rng } : flip); r.cleared = true; }
      else if (t) { r.type = t; r.build(TPL[t], def, flip); r.cleared = true; }
      else {
        r.type = 'fight';
        const m = rng();
        const eliteP = 0.05 * (tier + 1);
        r.mod = m < 0.11 ? 'dark' : m < 0.22 ? 'swarm' : m < 0.22 + eliteP ? 'elite' : (tier >= 1 && m < 0.33 + eliteP) ? 'spikes' : null;
        const hz = HAZARDS[set];
        if (!r.mod && hz && rng() < hz[1]) r.mod = hz[0];
        r.build(fights[fi++ % fights.length], def, Object.assign(flip, { shuffle: true, mod: r.mod }));
        if (r.mod === 'freezer' || r.mod === 'blackice') r.ice = true;
        if (r.mod === 'spikes') placeSpikes(r, rng);
        if (r.mod === 'collapse') placeCracks(r, rng);
      }
    }
    // one secret room per floor, hidden behind a cracked wall
    const hosts = shuffle(rooms.filter((r) => r.type === 'fight' || r.type === 'start'), rng);
    for (const h of hosts) {
      const sides = shuffle(Object.keys(DOORV).filter((k) => !h.doors[k] && !grid.has(key(h.gx + DOORV[k][0], h.gy + DOORV[k][1]))), rng);
      if (!sides.length) continue;
      const k = sides[0];
      const sr = new Room(h.gx + DOORV[k][0], h.gy + DOORV[k][1], rooms.length);
      sr.type = 'secret'; sr.doors[OPP[k]] = h; sr.build(TPL.secret, def);
      rooms.push(sr); grid.set(key(sr.gx, sr.gy), sr);
      h.secretLink = { k, room: sr, hp: 3 };
      break;
    }
    // some floors have a portal room hanging off a fight room: the Ender Wyrm lives there
    if (def.portal) {
      const ph = shuffle(rooms.filter((r) => r.type === 'fight' && r.dist >= 1), rng);
      for (const h of ph) {
        const sides = shuffle(Object.keys(DOORV).filter((k) => !h.doors[k] && !grid.has(key(h.gx + DOORV[k][0], h.gy + DOORV[k][1]))), rng);
        if (!sides.length) continue;
        const k = sides[0];
        const portal = new Room(h.gx + DOORV[k][0], h.gy + DOORV[k][1], rooms.length);
        portal.type = 'portal'; portal.theme = 'craft'; portal.dist = h.dist + 1;
        portal.doors[OPP[k]] = h; h.doors[k] = portal;
        portal.build(TPL.portal, def);
        rooms.push(portal); grid.set(key(portal.gx, portal.gy), portal);
        break;
      }
    }
    // a barred vault hangs off a fight room from the second floor on; its key hides in a pot
    if (tier >= 1 && !def.rush && rng() < 0.5) {
      const vh = shuffle(rooms.filter((r) => r.type === 'fight' && r.dist >= 1), rng);
      for (const h of vh) {
        const sides = shuffle(Object.keys(DOORV).filter((k) => !h.doors[k] && !grid.has(key(h.gx + DOORV[k][0], h.gy + DOORV[k][1])) && !(h.secretLink && h.secretLink.k === k)), rng);
        if (!sides.length) continue;
        const k = sides[0];
        const vault = new Room(h.gx + DOORV[k][0], h.gy + DOORV[k][1], rooms.length);
        vault.type = 'vault'; vault.sealed = true; vault.dist = h.dist + 1; vault.cleared = true;
        vault.doors[OPP[k]] = h; h.doors[k] = vault;
        vault.build(TPL.vault, def);
        rooms.push(vault); grid.set(key(vault.gx, vault.gy), vault);
        break;
      }
    }
    placeExtras9(rooms, grid, key, rng, def, tier);
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const r of rooms) { minX = Math.min(minX, r.gx); maxX = Math.max(maxX, r.gx); minY = Math.min(minY, r.gy); maxY = Math.max(maxY, r.gy); }
    if (G.mode === 'story') for (const r of rooms) r.story = true;
    return { rooms, start, boss, chest: rooms.find((r) => r.type === 'chest') || null, bounds: { minX, maxX, minY, maxY }, chestExtra: false };
  }
  throw new Error('Could not lay out the level');
}

// Boss Rush: a small room to pick a powerup, then the boss
function generateRushLevel(def) {
  const start = new Room(0, 0, 0), boss = new Room(0, -1, 1);
  start.doors.n = boss; boss.doors.s = start; start.dist = 0; boss.dist = 1;
  start.type = 'start'; start.voteRoom = true; start.build(TPL.vote, def); start.cleared = true;
  boss.type = 'boss'; boss.build(TPL.boss, def);
  if (def.boss === 'ender') boss.theme = 'craft';
  if (def.set === 'market') { start.store = 'blue'; boss.store = 'yellow'; }
  return { rooms: [start, boss], start, boss, chest: null, bounds: { minX: 0, maxX: 0, minY: -1, maxY: 0 }, chestExtra: false };
}

/* Floor hazards per theme: the cellar floor caves in, the halls drift with shed skin, roots break up through the garden */
const HAZARDS = { cellar: ['collapse', 0.24], halls: ['skins', 0.28], market: ['freezer', 0.3], kamer: ['collapse', 0.14], garden: ['roots', 0.3] };
// cracked cells that give way during the fight; the room always stays in one piece
function placeCracks(room, rng) {
  const cells = [];
  const taken = new Set(room.spawns.map((s) => s.r * COLS + s.c));
  for (let r = 1; r < ROWS - 1; r++) for (let c = 1; c < COLS - 1; c++) {
    if (room.solid(c, r) || isDoorZone(r, c) || taken.has(r * COLS + c)) continue;
    if (Math.abs(c - 5) <= 1 && Math.abs(r - 4) <= 1) continue;
    cells.push({ c, r });
  }
  shuffle(cells, rng);
  const blocked = new Set();
  const connected = () => {
    let start = -1, total = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!room.solid(c, r) && !blocked.has(r * COLS + c)) { total++; if (start < 0) start = r * COLS + c; }
    const seen = new Set([start]), q = [start];
    while (q.length) {
      const k = q.pop(), c = k % COLS, r = (k - c) / COLS;
      for (const d of DIR4) {
        const nc = c + d[0], nr = r + d[1], nk = nr * COLS + nc;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen.has(nk) || room.solid(nc, nr) || blocked.has(nk)) continue;
        seen.add(nk); q.push(nk);
      }
    }
    return seen.size === total;
  };
  room.cracks = [];
  const want = 6 + Math.floor(rng() * 4);
  for (const s of cells) {
    if (room.cracks.length >= want) break;
    blocked.add(s.r * COLS + s.c);
    if (!connected()) { blocked.delete(s.r * COLS + s.c); continue; }
    room.cracks.push({ c: s.c, r: s.r, x: (s.c + 0.5) * T, y: (s.r + 0.5) * T, at: 0, state: 0, seed: rng() });
  }
  room.cracks.forEach((k, i) => { k.at = 3.2 + i * 2.1 + rng() * 0.8; });
}

// Spike traps: two groups of floor cells that take turns
function placeSpikes(room, rng) {
  const cells = [];
  const taken = new Set(room.spawns.map((s) => s.r * COLS + s.c));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (room.solid(c, r) || isDoorZone(r, c) || taken.has(r * COLS + c) || (room.beltMap && room.beltMap[r * COLS + c])) continue;
    cells.push({ c, r });
  }
  shuffle(cells, rng);
  room.spikes = cells.slice(0, 8 + Math.floor(rng() * 4)).map((s, i) => ({ c: s.c, r: s.r, g: i % 2 }));
}

