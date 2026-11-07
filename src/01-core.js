/* src/01-core.js: core helpers, constants, settings, world geometry, per viewer progress. From v1 to v8. Lines 408 to 585 of the v13.7 script. */
/* =====================================================================
   BITTEN  ·  core helpers, constants, settings
   ===================================================================== */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
const turnToward = (a, b, max) => a + clamp(angDiff(a, b), -max, max);
const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const rndi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
function shuffle(arr, r = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
  return arr;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _rgbCache = new Map();
function hexRgb(h) {
  let v = _rgbCache.get(h);
  if (!v) { const n = parseInt(h.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; _rgbCache.set(h, v); }
  return v;
}
function mixHex(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}
function rgba(h, a) { const c = hexRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

/* ---- world geometry ---- */
const T = 40;                 // one floor tile, in world units
const COLS = 11, ROWS = 9;    // room interior in tiles
const RW = COLS * T, RH = ROWS * T;
const WALL = 26;              // wall thickness
const VIEW_W = RW + WALL * 2, VIEW_H = RH + WALL * 2;
const DOOR_HW = 24;           // half width of a doorway
const DIR4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DOORV = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
const OPP = { n: 's', s: 'n', w: 'e', e: 'w' };

const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
const REDUCED = mq('(prefers-reduced-motion: reduce)');
const COARSE = mq('(pointer: coarse)') || ('ontouchstart' in window);

/* ---- per-viewer progress (best effort, never required) ---- */
const GAME_VERSION = '14.0', SAVE_FORMAT = 3, SAVE_KEY = 'bitten.v1', OPTS_KEY = 'bitten-v107-opts';
const Save = {
  defaults() {
    return {
      sound: true, assist: true, char: 'apple', diff: 'normal', mode: 'arcade', settings: { music: true, shake: true, vibrate: true, numbers: true, info: true },
      unlocked: false, unlocks: { appel: false, rot: false, krul: false, mika: false, nightmare: false }, seen: {}, stats: {}, ach: {}, found: {}, winChars: {},
      best: { level: 0, wins: 0, kills: 0, rooms: 0, endless: 0, rush: 0 }, daily: { day: '', best: 0, won: false },
    };
  },
  data: null,
  load() {
    this.data = this.defaults();
    try {
      let raw = localStorage.getItem(SAVE_KEY), ok = false;
      if (raw) { try { this.applyData(JSON.parse(raw), true); ok = true; } catch (e) { ok = false; } }
      // the main slot is missing or broken: fall back to the copy of the last good save
      if (!ok) { const bak = localStorage.getItem(SAVE_KEY + '.bak'); if (bak) { try { this.applyData(JSON.parse(bak), true); } catch (e) { /* both broken */ } } }
    } catch (e) { /* storage unavailable */ }
  },
  // Merges a save into the current progress. Nothing is ever lost: numbers keep the
  // higher value, unlocks and achievements are added together. Old formats migrate here.
  applyData(d, settings) {
    if (!d || typeof d !== 'object') throw new Error('not a save');
    const D = this.data;
    const num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);
    if (settings) {
      if (typeof d.sound === 'boolean') D.sound = d.sound;
      if (typeof d.assist === 'boolean') D.assist = d.assist;
      if (typeof d.diff === 'string' && DIFFS[d.diff]) D.diff = d.diff;
      if (typeof d.mode === 'string' && MODES[d.mode]) D.mode = d.mode;
      if (d.settings && typeof d.settings === 'object') for (const k in d.settings) if (typeof d.settings[k] === 'boolean' || (k.startsWith('skin_') && typeof d.settings[k] === 'number' && isFinite(d.settings[k]))) D.settings[k] = d.settings[k];
    }
    if (d.daily && typeof d.daily === 'object' && typeof d.daily.day === 'string') {
      if (d.daily.day > D.daily.day) D.daily = { day: d.daily.day, best: num(d.daily.best), won: !!d.daily.won };
      else if (d.daily.day === D.daily.day) { D.daily.best = Math.max(D.daily.best, num(d.daily.best)); D.daily.won = D.daily.won || !!d.daily.won; }
    }
    if (d.unlocks && typeof d.unlocks === 'object') for (const k in d.unlocks) if (d.unlocks[k] === true) D.unlocks[k] = true;
    if (d.unlocked === true) D.unlocks.appel = true;
    for (const k of ['seen', 'ach', 'found', 'winChars']) {
      const m = d[k];
      if (m && typeof m === 'object') for (const id in m) if (m[id]) D[k][id] = D[k][id] || m[id];
    }
    if (d.stats && typeof d.stats === 'object') for (const k in d.stats) D.stats[k] = Math.max(num(D.stats[k]), num(d.stats[k]));
    if (d.best && typeof d.best === 'object') for (const k in d.best) D.best[k] = Math.max(num(D.best[k]), num(d.best[k]));
    D.unlocked = !!D.unlocks.appel;
    // a reward still waiting for the next run
    if (typeof d.gift === 'string' && d.gift && !D.gift) D.gift = d.gift;
    // anything this version does not know yet is kept as it is, so nothing gets dropped
    for (const k in d) if (!(k in D) && d[k] !== undefined && typeof d[k] !== 'function') { try { D[k] = JSON.parse(JSON.stringify(d[k])); } catch (e) { /* skip */ } }
    if (settings && typeof d.char === 'string' && (d.char === 'apple' || D.unlocks[d.char])) D.char = d.char;
    // older saves: carry unlocks and best numbers into the lifetime stats
    const S = D.stats, A = D.ach;
    if (D.unlocks.appel && !A.mother) { A.mother = 1; S.boss_mother = Math.max(S.boss_mother || 0, 1); }
    if (D.unlocks.rot && !A.rot) { A.rot = 1; S.k_rotter = Math.max(S.k_rotter || 0, 1); }
    if (D.unlocks.krul && !A.medic) { A.medic = 1; S.heals = Math.max(S.heals || 0, 20); }
    if (D.diff === 'nightmare' && !D.unlocks.nightmare) D.diff = 'hard';
    S.kills = Math.max(S.kills || 0, D.best.kills || 0);
    S.wins = Math.max(S.wins || 0, D.best.wins || 0);
  },
  store() {
    if (!this.data) return false;
    if (typeof Meta !== 'undefined' && Meta._t) { clearTimeout(Meta._t); Meta._t = null; }
    let json;
    try { json = JSON.stringify(this.data); } catch (e) { return false; }
    try {
      localStorage.setItem(SAVE_KEY, json);
      // read it back: only a save that landed becomes the backup
      if (localStorage.getItem(SAVE_KEY) === json) localStorage.setItem(SAVE_KEY + '.bak', json);
      return true;
    } catch (e) {
      // storage full: free the backup slot and try once more
      try { localStorage.removeItem(SAVE_KEY + '.bak'); localStorage.setItem(SAVE_KEY, json); return true; } catch (e2) { return false; }
    }
  },
  // the game options next to the save (speed, damage, HUD size and so on)
  readOpts() { try { const o = JSON.parse(localStorage.getItem(OPTS_KEY) || 'null'); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } },
  applyOpts(o) {
    if (!o || typeof o !== 'object') return;
    const live = window.__bitten && window.__bitten.OPTS7, cur = this.readOpts() || {};
    for (const k in o) {
      const v = o[k]; if (typeof v !== 'number' && typeof v !== 'string') continue;
      if (live && k in live && typeof live[k] !== typeof v) continue;
      cur[k] = v; if (live) live[k] = v;
    }
    try { localStorage.setItem(OPTS_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ }
  },
  // The save file: the progress plus metadata about where it came from.
  exportObject() {
    const D = this.data, S = D.stats;
    return {
      game: 'Bitten', format: SAVE_FORMAT, gameVersion: GAME_VERSION, saved: new Date().toISOString(),
      summary: {
        achievements: `${ACHS.filter((a) => D.ach[a.id]).length}/${ACHS.length}`,
        characters: CHAR_IDS.filter((id) => id === 'apple' || D.unlocks[id]).map((id) => CHARS[id].name),
        snakesKilled: S.kills || 0, escapes: S.wins || 0, powerupsFound: Object.keys(D.found).length, timePlayed: fmtTime(S.time),
      },
      data: D,
      opts: this.readOpts(),
    };
  },
  exportText() { return JSON.stringify(this.exportObject(), null, 1); },
  exportCode() {
    const json = JSON.stringify({ game: 'Bitten', format: SAVE_FORMAT, gameVersion: GAME_VERSION, data: this.data, opts: this.readOpts() });
    return 'BITTEN-' + btoa(unescape(encodeURIComponent(json)));
  },
  // Accepts a save file, a save code, or a bare progress object. Throws on anything else.
  importText(txt) {
    txt = String(txt || '').trim();
    if (!txt) throw new Error('empty');
    let obj;
    if (/^BITTEN-/i.test(txt)) obj = JSON.parse(decodeURIComponent(escape(atob(txt.slice(7).replace(/\s+/g, '')))));
    else obj = JSON.parse(txt);
    if (!obj || typeof obj !== 'object') throw new Error('not a save');
    const d = obj.data && typeof obj.data === 'object' ? obj.data : obj;
    if (obj.game && obj.game !== 'Bitten') throw new Error('not a Bitten save');
    if (!d.stats && !d.unlocks && !d.best && !d.ach) throw new Error('no progress in it');
    this.applyData(d, false);
    if (obj.opts) this.applyOpts(obj.opts);
    this.store();
    return obj;
  },
};

/* T10 (v14.0): a normal download: Blob, object URL, a temporary <a download>. The claude.ai artifact
   helper (window.claude.use('downloads')) is only an optional first try. Resolves 'saved', 'declined' or 'failed'. */
async function saveFile14(name, txt, dlP) {
  let dl = null;
  try { dl = dlP ? await dlP : null; } catch (e) { dl = null; }
  if (dl && typeof dl.save === 'function') {
    try { await dl.save({ filename: name, data: txt }); return 'saved'; }
    catch (e) { if (e && e.code === 'declined') return 'declined'; }
  }
  try {
    const url = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return 'saved';
  } catch (e) { return 'failed'; }
}

/* T1 (v14.0): explicit, ordered hook lists for the hot functions (Game.update, Game.startRun, Game.loadLevel,
   Game.enterRoom, Game.clearRoom, Player.prototype.hurt). Each function is installed once with Hooks.install
   next to its core body. Every later version adds a named layer with Hooks.layer instead of wrapping the
   function again. A layer gets next() as its first argument and runs around every layer added before it,
   so the order is the old load order: the last layer added runs first. Hooks.order(name) lists them.
   (Snake.prototype.hurt and Snake.prototype.update were never wrapped in v13.7: nothing to flatten there.) */
const Hooks = {
  lists: Object.create(null),
  cores: Object.create(null),
  install(obj, key, name) {
    const core = obj[key];
    this.cores[name] = core;
    if (!this.lists[name]) this.lists[name] = [];
    const H = this;
    obj[key] = function () { return H.call(name, this, arguments); };
    obj[key].hookName = name;
  },
  layer(name, label, fn) {
    if (!this.lists[name]) this.lists[name] = [];
    this.lists[name].push({ label, fn });
  },
  call(name, self, args) {
    const L = this.lists[name], core = this.cores[name];
    if (!L.length) return core.apply(self, args);
    const step = (i) => (i < 0 ? core : function () {
      const a = [step(i - 1)]; for (let k = 0; k < arguments.length; k++) a.push(arguments[k]);
      return L[i].fn.apply(this, a);
    });
    return step(L.length - 1).apply(self, args);
  },
  order(name) { return (this.lists[name] || []).map((h) => h.label).reverse(); },
};

/* T2 (v14.0): the safety nets stay, but every error they catch is counted. G.errors is the count, G.errorLog
   the last 20 messages. A red counter shows in the corner with the Debug setting or ?debug in the URL. */
const ERR14 = { n: 0, log: [], g: null };
function errNote14(e, where) {
  ERR14.n++;
  const msg = (where ? where + ': ' : '') + String(e && (e.message || e) || e).slice(0, 200);
  ERR14.log.push(msg); if (ERR14.log.length > 20) ERR14.log.shift();
  if (ERR14.g) ERR14.g.errors = ERR14.n;
}

/* T3 (v14.0): one scheduler. frame() is the only requestAnimationFrame loop in the game. It runs, in order:
   'input', the game substeps (Game.update, then the 'step' systems with the same dt), 'audio', 'ui', the
   one-shot Sched.raf callbacks (screens that draw while they are open), then render. A task with a `when`
   test only runs while that test is true, so UI work stops while its screen is hidden. */
const Sched = {
  phases: { input: [], step: [], audio: [], ui: [] },
  queue: [], nextId: 1,
  every(phase, name, fn, when) { this.phases[phase].push({ name, fn, when }); },
  raf(fn) { const id = this.nextId++; this.queue.push({ id, fn }); return id; },
  cancel(id) { for (let i = 0; i < this.queue.length; i++) if (this.queue[i].id === id) { this.queue.splice(i, 1); return; } },
  run(phase, now, dt) {
    const L = this.phases[phase];
    for (let i = 0; i < L.length; i++) {
      const t = L[i];
      try { if (!t.when || t.when()) t.fn(now, dt); } catch (e) { errNote14(e, t.name); }
    }
  },
  flush(now) {
    if (!this.queue.length) return;
    const q = this.queue; this.queue = [];
    for (const o of q) { try { o.fn(now); } catch (e) { errNote14(e, 'raf'); } }
  },
};

/* T8 (v14.0): gameplay randomness. G.rng is a mulberry32 stream seeded from the run seed (Game.startRun).
   While the simulation runs (the substeps in frame()), Math.random IS G.rng, so every drop, crit, roll,
   spawn, AI choice, Lucky's die and contract roll in the game code draws from it without touching the
   ~1000 call sites. Render, audio, UI and the particle internals (burst, decal seeds) use the browser's
   random (RAND14.real / vrnd). Same seed and same inputs at a fixed step give the same run. */
const RAND14 = { real: Math.random, out: null, on: false };
function gameRandOn() {
  if (RAND14.on || typeof G === 'undefined' || !G.rng) return;
  RAND14.on = true; RAND14.out = Math.random; Math.random = G.rng;
}
function gameRandOff() { if (!RAND14.on) return; RAND14.on = false; Math.random = RAND14.out; }
const vrnd = (a = 1, b) => (b === undefined ? RAND14.real() * a : a + RAND14.real() * (b - a));

/* P4 (v14.0): Render quality scales the canvas backing store (1, 0.75 or 0.5 of the screen pixels) */
function renderQ14() {
  const v = typeof Save === 'object' && Save.data && Save.data.settings ? +Save.data.settings.rq14 : 1;
  return v === 0.75 || v === 0.5 ? v : 1;
}

/* S1 (v14.0): while an Arcade look renders the apple into its buffer, soft glows are captured here instead of
   drawn, so the filter does not turn them into solid discs. The look draws them on top afterwards. */
const GLOW14 = { cap: null };

/* P2 (v14.0): the hottest gradient sites are drawn from pre-rendered sprites instead of a new gradient each
   frame: glowDot (133 call sites: glows, lights, halos), the light holes in the dark layer and the vignette.
   Sprites are keyed by colour, strength and a radius bucket in device pixels. */
const SPR14 = {
  m: new Map(),
  get(key, px, paint) {
    let s = this.m.get(key);
    if (!s) {
      if (this.m.size > 400) this.m.clear();
      s = document.createElement('canvas'); s.width = s.height = px * 2;
      paint(s.getContext('2d'), px); this.m.set(key, s);
    }
    return s;
  },
  bucket(r) { return r <= 4 ? 4 : r <= 8 ? 8 : r <= 16 ? 16 : r <= 32 ? 32 : r <= 64 ? 64 : r <= 128 ? 128 : 256; },
};

/* M3 (v14.0): more than one apple. G.players holds every apple in the run (max 4); G.player stays the
   context pointer: withPlayer(P, fn) points it at P while fn runs. With one apple nothing changes. */
const MP14 = { on: false, max: 4, live: [], liveT: -1 };
/* phase 3: online play lives in net.js; NET14.live is true while an online run runs (frame() hands it the ticks) */
const NET14 = { live: false, pump() {} };
function withPlayer(P, fn) {
  if (!P || G.player === P) return fn();
  const keep = G.player; G.player = P;
  try { return fn(); } finally { G.player = keep; }
}
function players14() { return G.players && G.players.length ? G.players : G.player ? [G.player] : []; }
/* the apples that can still be bitten and act: not dead, not a klokhuis ghost, not frozen by a disconnect */
function livePlayers14() {
  const L = players14();
  if (!MP14.on) return L;
  const out = [];
  for (const P of L) if (!P.ghost14 && !(P.dying > 0) && !P.away14) out.push(P);
  return out;
}
/* a pad, till or plate that waits until you step off it: one flag per apple, or a second apple standing
   elsewhere re-arms it every tick (single player: the plain field, as before) */
function armed14(o) { if (!MP14.on || !G.player) return o.armed; const m = o.arm14; return m && m.has(G.player) ? m.get(G.player) : o.armed; }
function setArmed14(o, v) { if (!MP14.on || !G.player) { o.armed = v; return; } (o.arm14 || (o.arm14 = new Map())).set(G.player, v); }
function mpCount14() { return MP14.on && G.players ? G.players.length : 1; }
/* run fn(P) for every apple that can be bitten (single player: just G.player, as before) */
function forLive14(fn) {
  if (!MP14.on) { if (G.player) fn(G.player); return; }
  for (const P of livePlayers14()) withPlayer(P, () => fn(P));
}
/* a hazard update that moves things AND checks the apple: once with dt for the first apple, then with dt 0
   for every other living apple, so things move once and every apple gets its hit check */
function mpPasses14(fn, dt, room, extra) {
  if (!MP14.on) return fn(dt, room, extra);
  const L = livePlayers14();
  if (!L.length) return fn(dt, room, extra);
  let r;
  for (let i = 0; i < L.length; i++) r = withPlayer(L[i], () => fn(i === 0 ? dt : 0, room, extra));
  return r;
}
/* the living apple nearest to a point (single player: G.player) */
function nearestLive14(x, y) {
  if (!MP14.on) return G.player;
  let best = null, bd = 1e18;
  for (const P of livePlayers14()) { const d = (P.x - x) * (P.x - x) + (P.y - y) * (P.y - y); if (d < bd) { bd = d; best = P; } }
  return best || G.player;
}
/* B1 (v14.0): balance for n apples. n = 1 keeps every number as it was. */
const MPB14 = { hp: [1, 1, 1.35, 1.65, 1.9], boss: [1, 1, 1.6, 2.1, 2.6], cycle: [1, 1, 1, 1.05, 1.1], drop: [1, 1, 1.5, 2, 2.5] };
function mpSnakeHpK14() { return MP14.on ? MPB14.hp[Math.min(4, mpCount14())] : 1; }
function mpBossHpK14() { return MP14.on ? MPB14.boss[Math.min(4, mpCount14())] : 1; }
function mpExtra14() { return MP14.on ? Math.min(3, mpCount14() - 1) : 0; }
