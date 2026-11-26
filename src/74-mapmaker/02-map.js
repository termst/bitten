/* 74.js section 02: map. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { BOSSES, EMPTY, ENTS, ENT_PARAMS, GH, GN, GRID_OK, GW, MINIS, MODS, RT, SETS, SNAKES, SOLID_TILE, SPAWN_CH } = M74;
  M74.newRoom = newRoom; M74.newFloor = newFloor; M74.newMap = newMap; M74.cleanEnt = cleanEnt; M74.cleanRoom = cleanRoom; M74.cleanFloor = cleanFloor; M74.cleanMap = cleanMap; M74.setCh = setCh; M74.neighbor = neighbor; M74.edgeOf = edgeOf; M74.setEdge = setEdge; M74.syncEdges = syncEdges; M74.doorsOf = doorsOf;
  /* ================================================================== 2. the map itself */
  const RULES = [
    ['ap', 'Extra apples', [[0, 'None'], [1, '+1'], [2, '+2'], [3, '+3'], [4, '+4']], 0],
    ['co', 'Starting coins', [[0, '0'], [15, '15'], [30, '30'], [50, '50'], [100, '100']], 0],
    ['dm', 'Seed damage', [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.5, '150%'], [2, '200%']], 1],
    ['fr', 'Fire rate', [[0.75, '75%'], [1, '100%'], [1.25, '125%'], [1.5, '150%']], 1],
    ['ps', 'Your speed', [[0.9, '90%'], [1, '100%'], [1.15, '115%'], [1.3, '130%']], 1],
    ['ss', 'Snake speed', [[0.7, '70%'], [0.85, '85%'], [1, '100%'], [1.15, '115%'], [1.3, '130%']], 1],
    ['bh', 'Boss health', [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.5, '150%'], [2, '200%']], 1],
    ['hd', 'Slice drops', [[0, 'None'], [0.5, 'Half'], [1, 'Normal'], [2, 'Double']], 1],
    ['ex', 'Extra snakes on hard', [[1, 'On'], [0, 'Off']], 1],
    ['gw', 'Random gold worms', [[1, 'On'], [0, 'Off']], 1],
    ['gf', 'Hidden gift per floor', [[1, 'On'], [0, 'Off']], 1],
    ['dg', 'Downgrades', [[1, 'On'], [0, 'Off']], 1],
    ['nd', 'Noodle ambushes', [[0, 'Off'], [1, 'On']], 0],
    ['ct', 'Contracts', [[0, 'Off'], [1, 'On']], 0],
  ]; M74.RULES = RULES;
  const RULE_DEF = {}; M74.RULE_DEF = RULE_DEF;
  for (const [k, , , d] of RULES) RULE_DEF[k] = d;
  const DARK = [[-1, 'Floor default'], [0, 'Bright'], [1, 'Dim'], [2, 'Dark'], [3, 'Pitch']]; M74.DARK = DARK;
  const DARK_V = [0.32, 0.55, 0.76, 0.9]; M74.DARK_V = DARK_V;
  const DIFF_OPTS = [['', 'Player picks'], ['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['nightmare', 'Nightmare']]; M74.DIFF_OPTS = DIFF_OPTS;
  const LIMITS = { floors: 8, rooms: 40, ents: 120, items: 5, name: 40, author: 30, desc: 160, sign: 90, fname: 40, fsub: 70, intro: 300, win: 160, fintro: 240, rtext: 120 }; M74.LIMITS = LIMITS;
  const FW = 9, FH = 7; M74.FH = FH; M74.FW = FW;

  const uid = () => 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); M74.uid = uid;
  /* v14.10 ROOM_FIELDS: a room field added after v12.3 is declared once here (pushed by the section that owns it).
     newRoom, cleanRoom and compact all read this table, so a field can not be forgotten in one of them.
     { k, init() -> default, clean(R) -> value from untrusted R, out(v) -> value for the share code or undefined to leave it out } */
  const ROOM_FIELDS = []; M74.ROOM_FIELDS = ROOM_FIELDS;
  function newRoom(x, y, t) {
    const o = { x, y, t: t || 'fight', g: EMPTY, e: [], m: '', b: '', n: 25, st: '', mim: 0, lk: 0, ta: 1, d: {}, ie: '', ic: '' };
    for (const f of ROOM_FIELDS) o[f.k] = f.init();
    return o;
  }
  function newFloor(i, set) {
    const s = set || 'cellar';
    const st = newRoom(4, 4, 'start');
    st.g = cleanGrid((START_SETS[s] || START_SETS.cellar).join(''));
    return { name: '', sub: '', set: s, boss: 'auto', dark: -1, it: '', rooms: [st] };
  }
  function newMap() {
    return { v: 1, id: uid(), name: 'Untitled map', author: '', desc: '', char: '', diff: '', it: '', ot: '', rules: Object.assign({}, RULE_DEF), items: [], floors: [M74.newFloor(0, 'cellar')], made: Date.now() };
  }
  function cleanGrid(g) {
    g = String(g || '');
    let out = '';
    for (let i = 0; i < GN; i++) { const ch = g[i] || '.'; out += GRID_OK.includes(ch) ? ch : '.'; }
    return out;
  }
  const clampN = (v, lo, hi, d) => { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; }; M74.clampN = clampN;
  const strN = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n); M74.strN = strN;
  const pickOpt = (v, opts, d) => (opts.some((o) => o[0] === v) ? v : d); M74.pickOpt = pickOpt;

  function cleanEnt(e) {
    if (!e || typeof e !== 'object' || !ENTS[e.t]) return null;
    const c = clampN(e.c, 0, GW - 1, -1) | 0, r = clampN(e.r, 0, GH - 1, -1) | 0;
    if (c < 0 || r < 0) return null;
    const o = { t: e.t, c, r };
    for (const p of ENT_PARAMS[e.t]) {
      let v = e[p.k];
      if (p.kind === 'seg') v = pickOpt(v, p.opts, p.def);
      else if (p.kind === 'col') v = clampN(v, 0, 3, p.def) | 0;
      else if (p.kind === 'dir8') v = clampN(v, 0, 7, p.def) | 0;
      else if (p.kind === 'dir8a') v = clampN(v, 0, 8, p.def) | 0;
      else if (p.kind === 'dir4') { v = clampN(v, 0, 7, p.def) | 0; v -= v % 2; }
      else if (p.kind === 'snake') v = SNAKES.includes(v) ? v : p.def;
      else if (p.kind === 'item') v = v === 'rand' || v === 'rare' || (typeof v === 'string' && ITEMS[v]) ? v : p.def;
      else if (p.kind === 'text') v = strN(v, p.opts);
      else if (p.kind === 'sel') v = pickOpt(v, p.opts, p.def);
      o[p.k] = v;
    }
    return o;
  }
  function cleanRoom(R) {
    if (!R || typeof R !== 'object') return null;
    const x = clampN(R.x, 0, FW - 1, -1) | 0, y = clampN(R.y, 0, FH - 1, -1) | 0;
    if (x < 0 || y < 0) return null;
    const o = newRoom(x, y, RT[R.t] ? R.t : 'fight');
    let g = String(R.g || EMPTY);
    const ents = [];
    // characters from the game's own templates that mean a snake become snake pieces
    let gg = '';
    for (let i = 0; i < GN; i++) {
      const ch = g[i] || '.';
      if (SPAWN_CH[ch] && SNAKES.includes(SPAWN_CH[ch])) { ents.push({ t: 'sn', c: i % GW, r: Math.floor(i / GW), k: SPAWN_CH[ch], g: 0, tr: '' }); gg += '.'; }
      else gg += ch;
    }
    o.g = cleanGrid(gg);
    const taken = new Set();
    for (const e of (Array.isArray(R.e) ? R.e : []).concat(ents)) {
      if (o.e.length >= LIMITS.ents) break;
      const ce = cleanEnt(e); if (!ce) continue;
      const k = ce.r * GW + ce.c; if (taken.has(k)) continue;
      taken.add(k);
      if (SOLID_TILE(o.g[k])) o.g = o.g.slice(0, k) + '.' + o.g.slice(k + 1);
      o.e.push(ce);
    }
    o.m = MODS.some((m) => m[0] === R.m) ? R.m : '';
    o.b = typeof R.b === 'string' && (BOSSES.includes(R.b) || MINIS.includes(R.b)) ? R.b : '';
    o.n = clampN(R.n, 10, 90, 25) | 0;
    o.st = R.st === 'blue' || R.st === 'yellow' ? R.st : '';
    o.mim = R.mim ? 1 : 0; o.lk = R.lk ? 1 : 0; o.ta = R.ta === 0 ? 0 : 1;
    o.ie = strN(R.ie, LIMITS.rtext); o.ic = strN(R.ic, LIMITS.rtext);
    o.d = {};
    if (R.d && typeof R.d === 'object') for (const k of ['n', 's', 'w', 'e']) if (R.d[k] === 'w' || R.d[k] === 'c') o.d[k] = R.d[k];
    for (const f of ROOM_FIELDS) o[f.k] = f.clean(R);
    return o;
  }
  function cleanFloor(F, i) {
    if (!F || typeof F !== 'object') return null;
    const o = { name: strN(F.name, LIMITS.fname), sub: strN(F.sub, LIMITS.fsub), set: SETS.includes(F.set) ? F.set : 'cellar', boss: F.boss === 'auto' || !BOSSES.includes(F.boss) ? 'auto' : F.boss, dark: clampN(F.dark, -1, 3, -1) | 0, it: strN(F.it, LIMITS.fintro), rooms: [] };
    const at = new Set();
    for (const R of Array.isArray(F.rooms) ? F.rooms : []) {
      if (o.rooms.length >= LIMITS.rooms) break;
      const r = cleanRoom(R); if (!r) continue;
      const k = r.x + ',' + r.y; if (at.has(k)) continue;
      at.add(k); o.rooms.push(r);
    }
    if (!o.rooms.length) return M74.newFloor(i, o.set);
    syncEdges(o);
    return o;
  }
  function cleanMap(M) {
    if (!M || typeof M !== 'object') throw new Error('not a map');
    const o = M74.newMap();
    if (typeof M.id === 'string' && /^[a-z0-9]{4,24}$/i.test(M.id)) o.id = M.id;
    o.name = strN(M.name, LIMITS.name).trim() || 'Untitled map';
    o.author = strN(M.author, LIMITS.author).trim();
    o.desc = strN(M.desc, LIMITS.desc);
    o.it = strN(M.it, LIMITS.intro); o.ot = strN(M.ot, LIMITS.win);
    o.char = typeof M.char === 'string' && CHARS[M.char] ? M.char : '';
    o.diff = DIFF_OPTS.some((d) => d[0] === M.diff) ? M.diff : '';
    o.rules = Object.assign({}, RULE_DEF);
    if (M.rules && typeof M.rules === 'object') for (const [k, , opts, d] of RULES) o.rules[k] = pickOpt(M.rules[k], opts, d);
    o.items = (Array.isArray(M.items) ? M.items : []).filter((id, i, a) => typeof id === 'string' && ITEMS[id] && a.indexOf(id) === i).slice(0, LIMITS.items);
    const fl = (Array.isArray(M.floors) ? M.floors : []).slice(0, LIMITS.floors).map(M74.cleanFloor).filter(Boolean);
    o.floors = fl.length ? fl : [M74.newFloor(0)];
    o.made = clampN(M.made, 0, 1e14, Date.now());
    return o;
  }
  const cloneMap = (M) => JSON.parse(JSON.stringify(M)); M74.cloneMap = cloneMap;

  /* ---- grid and room helpers */
  const roomAt = (F, x, y) => F.rooms.find((r) => r.x === x && r.y === y) || null; M74.roomAt = roomAt;
  const entAt = (R, c, r) => R.e.find((e) => e.c === c && e.r === r) || null; M74.entAt = entAt;
  const cellCh = (R, c, r) => R.g[r * GW + c]; M74.cellCh = cellCh;
  function setCh(R, c, r, ch) { const k = r * GW + c; if (R.g[k] === ch) return false; R.g = R.g.slice(0, k) + ch + R.g.slice(k + 1); return true; }
  const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }; M74.SIDES = SIDES;
  const OPPS = { n: 's', s: 'n', w: 'e', e: 'w' }; M74.OPPS = OPPS;
  // the floor cell in front of each door
  const MOUTH = { n: [5, 0], s: [5, 8], w: [0, 4], e: [10, 4] }; M74.MOUTH = MOUTH;
  function neighbor(F, R, side) { const v = SIDES[side]; return roomAt(F, R.x + v[0], R.y + v[1]); }
  // what joins two rooms: open, wall or crack. Both sides always agree.
  function edgeOf(F, R, side) {
    const o = neighbor(F, R, side); if (!o) return null;
    return R.d[side] || o.d[OPPS[side]] || 'o';
  }
  function setEdge(F, R, side, v) {
    const o = neighbor(F, R, side); if (!o) return;
    if (v === 'o') { delete R.d[side]; delete o.d[OPPS[side]]; } else { R.d[side] = v; o.d[OPPS[side]] = v; }
  }
  function syncEdges(F) {
    for (const R of F.rooms) for (const s in SIDES) {
      const o = neighbor(F, R, s);
      if (!o) { delete R.d[s]; continue; }
      const v = R.d[s] || o.d[OPPS[s]];
      if (v) { R.d[s] = v; o.d[OPPS[s]] = v; }
    }
  }
  function doorsOf(F, R) { const out = []; for (const s in SIDES) { const e = edgeOf(F, R, s); if (e && e !== 'w') out.push(s); } return out; }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
