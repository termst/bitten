/* 74.js section 17: pro-tools. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { $, CATS, CH_COLS, ENTS, ENT_PARAMS, FIXED, F_, GH, GRID_OK, GW, IC, LIMITS, MK, Maker, P_, ROOM_FIELDS, R_, SNAKES, SOLID_TILE, SVG, TOOLS, cellFrom, changed, clampN, cleanEnt, entAt, entDefaults, flipEnt, lineCells, mouthAt, pickOpt, pushUndo, safe, strN, syncUndo, tileAtlas, toast } = M74;
  M74.newEv = newEv; M74.evDefaults = evDefaults; M74.shapeCells = shapeCells; M74.grabArea = grabArea; M74.placeClip = placeClip; M74.flipClip = flipClip; M74.rotClip = rotClip; M74.areaCopy = areaCopy; M74.areaDelete = areaDelete; M74.areaFill = areaFill; M74.areaTransform = areaTransform; M74.areaMove = areaMove; M74.startStamp = startStamp; M74.putStamp = putStamp; M74.saveStamp = saveStamp; M74.deleteStamp = deleteStamp; M74.paintClip = paintClip; M74.cycleSize = cycleSize;
  /* ================================================================== 14. v14.9: Map Maker Pro
     Editor: line, outline and circle shapes, brush size 1 to 3, an area tool (select, copy, cut, move, flip, rotate,
     delete, fill), stamps (paste mode, a stamp library in this browser, built in stamps).
     Rooms: snake waves (a snake piece's Wave), room events (when X happens, do Y), room rules (darkness, snake health,
     beat the clock). Floors: a floor generator and Fill empty rooms. Map: an overview and test settings.
     Everything new travels in the share code (compact / cleanRoom wrappers) and so in coop maps. */
  const PRO = MK.PRO = { size: 1, area: null, clip: null, lastCopy: '', stamp: null, test: { god: 0, coins: 0, keys: 0 } }; M74.PRO = PRO;
  const PSTORE = 'bitten.mkStamps14', TSTORE = 'bitten.mkTest14'; M74.TSTORE = TSTORE;
  const lsGet = (k, d) => safe(() => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }, d);
  const lsSet = (k, v) => safe(() => { localStorage.setItem(k, JSON.stringify(v)); return true; }, false); M74.lsSet = lsSet;
  Object.assign(PRO.test, lsGet(TSTORE, {}));

  /* ---- the data: new fields in rooms and snake pieces */
  ENT_PARAMS.sn.push(P_('wv', 'Wave', 'seg', [[1, 'First'], [2, 'Second'], [3, 'Third']], 1));
  const EV_MAX = 6; M74.EV_MAX = EV_MAX;
  const EV_WHEN = [['enter', 'You walk in'], ['clear', 'The room is clear'], ['time', 'Seconds in the room'], ['kills', 'Snakes killed'], ['wave', 'A wave starts'], ['hurt', 'You drop to half health'], ['flip', 'Gates of a color flip']]; M74.EV_WHEN = EV_WHEN;
  const EV_N = { time: [[3, '3 s'], [5, '5 s'], [10, '10 s'], [20, '20 s'], [30, '30 s'], [60, '60 s']], kills: [[1, '1'], [2, '2'], [3, '3'], [5, '5'], [8, '8'], [12, '12']], wave: [[2, 'Second'], [3, 'Third']] }; M74.EV_N = EV_N;
  const EV_DO = [['shout', 'Shout a line'], ['gates', 'Flip gates'], ['snakes', 'Let snakes out'], ['heal', 'Heal'], ['coins', 'Give coins'], ['item', 'Drop a powerup'], ['key', 'Drop a key'], ['lights', 'Set the lights'], ['open', 'Unlock locked rooms'], ['boom', 'Explosion']]; M74.EV_DO = EV_DO;
  const EV_A = {
    heal: [[1, 'Half apple'], [2, 'One apple'], [4, 'Two apples']],
    coins: [[5, '5'], [10, '10'], [25, '25'], [50, '50']],
    item: [['rand', 'Random'], ['rare', 'Legendary']],
    lights: [[0, 'Bright'], [1, 'Dim'], [2, 'Dark'], [3, 'Pitch black']],
    snakes: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [6, '6']],
  }; M74.EV_A = EV_A;
  const RDARK = [[-1, 'Floor'], [0, 'Bright'], [1, 'Dim'], [2, 'Dark'], [3, 'Pitch']]; M74.RDARK = RDARK;
  const RSH = [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.5, '150%'], [2, '200%'], [3, '300%']]; M74.RSH = RSH;
  const RTB = [[0, 'Off'], [15, '15 s'], [20, '20 s'], [30, '30 s'], [45, '45 s'], [60, '60 s']]; M74.RTB = RTB;
  function newEv() { return { w: 'enter', n: 0, d: 'shout', a: 0, k: 'grub', txt: 'Here they come' }; }
  function cleanEv(e) {
    if (!e || typeof e !== 'object') return null;
    const o = newEv();
    o.w = pickOpt(e.w, EV_WHEN, 'enter');
    o.d = pickOpt(e.d, EV_DO, 'shout');
    o.n = o.w === 'flip' ? clampN(e.n, 0, 3, 0) | 0 : EV_N[o.w] ? pickOpt(e.n, EV_N[o.w], EV_N[o.w][0][0]) : 0;
    o.a = o.d === 'gates' ? clampN(e.a, 0, 3, 0) | 0 : EV_A[o.d] ? pickOpt(e.a, EV_A[o.d], EV_A[o.d][0][0]) : 0;
    o.k = SNAKES.includes(e.k) ? e.k : 'grub';
    o.txt = strN(e.txt, 40);
    return o;
  }
  function evDefaults(o) {
    if (EV_N[o.w] && !EV_N[o.w].some((x) => x[0] === o.n)) o.n = EV_N[o.w][0][0];
    if (o.w === 'flip') o.n = clampN(o.n, 0, 3, 0) | 0;
    if (EV_A[o.d] && !EV_A[o.d].some((x) => x[0] === o.a)) o.a = EV_A[o.d][o.d === 'heal' || o.d === 'coins' ? 1 : 0][0];
    if (o.d === 'gates') o.a = clampN(o.a, 0, 3, 0) | 0;
    return o;
  }
  safe(() => {
    ROOM_FIELDS.push(
      { k: 'ev', init: () => [], clean: (R) => (Array.isArray(R.ev) ? R.ev : []).slice(0, EV_MAX).map(cleanEv).filter(Boolean), out: (v) => (v && v.length ? v.map((e) => Object.assign({}, e)) : undefined) },
      { k: 'dk', init: () => -1, clean: (R) => clampN(R.dk, -1, 3, -1) | 0, out: (v) => (v != null && v !== -1 ? v : undefined) },
      { k: 'sh', init: () => 1, clean: (R) => pickOpt(R.sh, RSH, 1), out: (v) => (v && v !== 1 ? v : undefined) },
      { k: 'tb', init: () => 0, clean: (R) => pickOpt(R.tb, RTB, 0), out: (v) => (v ? v : undefined) });
  });
  const evOf = (R) => (R.ev || (R.ev = [])); M74.evOf = evOf;

  /* ---- cells for shapes */
  function rectCells(a, hollow) {
    const c0 = Math.min(a.c0, a.c1), c1 = Math.max(a.c0, a.c1), r0 = Math.min(a.r0, a.r1), r1 = Math.max(a.r0, a.r1), out = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (!hollow || r === r0 || r === r1 || c === c0 || c === c1) out.push([c, r]);
    return out;
  }
  function ovalCells(a, filled) {
    const c0 = Math.min(a.c0, a.c1), c1 = Math.max(a.c0, a.c1), r0 = Math.min(a.r0, a.r1), r1 = Math.max(a.r0, a.r1);
    const cx = (c0 + c1 + 1) / 2, cy = (r0 + r1 + 1) / 2, rx = (c1 - c0 + 1) / 2, ry = (r1 - r0 + 1) / 2;
    const ins = (c, r) => c >= c0 && c <= c1 && r >= r0 && r <= r1 && ((c + 0.5 - cx) / rx) ** 2 + ((r + 0.5 - cy) / ry) ** 2 <= 1.0001;
    const out = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (!ins(c, r)) continue;
      if (filled || !ins(c - 1, r) || !ins(c + 1, r) || !ins(c, r - 1) || !ins(c, r + 1)) out.push([c, r]);
    }
    return out.length ? out : [[c0, r0]];
  }
  function shapeCells(st) {
    const s = st.shape;
    if (st.tool === 'line') return lineCells(s.c0, s.r0, s.c1, s.r1);
    if (st.tool === 'ring') return rectCells(s, true);
    return ovalCells(s, !!st.filled);
  }
  const SHAPES = { line: 1, ring: 1, oval: 1 }; M74.SHAPES = SHAPES;

  /* ---- brush size: a square of cells around the one under the pointer */
  safe(() => {
    const ap = M74.applyAt;
    M74.applyAt = function (c, r, tool) {
      const st = Maker.stroke, n = PRO.size | 0;
      if (n <= 1 || PRO.inFill || !st || st.box || st.tool === 'move') return ap.apply(this, arguments);
      const o = n === 2 ? 0 : -1;
      for (let dr = 0; dr < n; dr++) for (let dc = 0; dc < n; dc++) ap.call(this, c + o + dc, r + o + dr, tool);
    };
    const fa = M74.fillAt;
    M74.fillAt = function () { PRO.inFill = true; try { return fa.apply(this, arguments); } finally { PRO.inFill = false; } };
  });

  /* ---- the clipboard: a block of cells with their pieces */
  function grabArea(R, a) {
    const c0 = Math.min(a.c0, a.c1), c1 = Math.max(a.c0, a.c1), r0 = Math.min(a.r0, a.r1), r1 = Math.max(a.r0, a.r1);
    const w = c1 - c0 + 1, h = r1 - r0 + 1;
    let g = '';
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) g += R.g[r * GW + c];
    const e = R.e.filter((x) => x.c >= c0 && x.c <= c1 && x.r >= r0 && x.r <= r1).map((x) => Object.assign({}, x, { c: x.c - c0, r: x.r - r0 }));
    return { w, h, g, e };
  }
  function clearCells(R, cells) {
    const set = new Set(cells.map(([c, r]) => r * GW + c));
    let any = false;
    for (const k of set) if (R.g[k] !== '.') { R.g = R.g.slice(0, k) + '.' + R.g.slice(k + 1); any = true; }
    const n = R.e.length; R.e = R.e.filter((x) => !set.has(x.r * GW + x.c));
    return any || R.e.length !== n;
  }
  // put a clip into the room with its top left on (c, r). Opaque: empty cells of the clip rub out what is there.
  function placeClip(R, F, clip, c, r, opaque) {
    let n = 0, blocked = 0;
    for (let y = 0; y < clip.h; y++) for (let x = 0; x < clip.w; x++) {
      const cc = c + x, rr = r + y;
      if (cc < 0 || rr < 0 || cc >= GW || rr >= GH) continue;
      const ch = clip.g[y * clip.w + x] || '.', e = clip.e.find((q) => q.c === x && q.r === y);
      if (!opaque && ch === '.' && !e) continue;
      const solid = SOLID_TILE(ch) || (e && ENTS[e.t] && ENTS[e.t].solid && e.t !== 'gt');
      if (solid && mouthAt(F, R, cc, rr)) { blocked++; continue; }
      const k = rr * GW + cc, old = entAt(R, cc, rr);
      if (old) R.e.splice(R.e.indexOf(old), 1);
      if (R.g[k] !== ch) R.g = R.g.slice(0, k) + (GRID_OK.includes(ch) ? ch : '.') + R.g.slice(k + 1);
      if (e && R.e.length < LIMITS.ents) {
        const ne = cleanEnt(Object.assign({}, e, { c: cc, r: rr }));
        if (ne) { R.e.push(ne); if (R.g[k] !== '.') R.g = R.g.slice(0, k) + '.' + R.g.slice(k + 1); }
      }
      n++;
    }
    if (blocked) toast('Kept the doorway clear.');
    return n;
  }
  function flipClip(clip, x) {
    const g = [], e = [];
    for (let r = 0; r < clip.h; r++) for (let c = 0; c < clip.w; c++) {
      const sc = x ? clip.w - 1 - c : c, sr = x ? r : clip.h - 1 - r;
      let ch = clip.g[sr * clip.w + sc];
      if (x && ch === '>') ch = '<'; else if (x && ch === '<') ch = '>';
      g.push(ch);
    }
    for (const q of clip.e) {
      // flipEnt mirrors in a full room: shift back into the clip
      const f = flipEnt(q, x);
      if (x) f.c = clip.w - 1 - q.c; else f.r = clip.h - 1 - q.r;
      e.push(f);
    }
    return { w: clip.w, h: clip.h, g: g.join(''), e, n: clip.n };
  }
  const ROT8 = (d) => (d + 2) % 8;
  function rotClip(clip) {
    const w = clip.h, h = clip.w, g = [];
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      // new (c, r) comes from old (r, h_old - 1 - c)
      let ch = clip.g[(clip.h - 1 - c) * clip.w + r];
      if (ch === '>' || ch === '<') ch = '.';
      g.push(ch);
    }
    const e = clip.e.map((q) => {
      const n = Object.assign({}, q, { c: clip.h - 1 - q.r, r: q.c });
      if ((q.t === 'jp' || q.t === 'sp') && q.d != null) n.d = ROT8(q.d);
      if (q.t === 'tt' && q.d != null && q.d < 8) n.d = ROT8(q.d);
      if (q.t === 'fb') n.a = ROT8(q.a || 0);
      if (q.t === 'sw') n.ax = q.ax === 'v' ? 'h' : 'v';
      return n;
    });
    return { w, h, g: g.join(''), e, n: clip.n };
  }
  const areaNorm = (a) => ({ c0: Math.min(a.c0, a.c1), c1: Math.max(a.c0, a.c1), r0: Math.min(a.r0, a.r1), r1: Math.max(a.r0, a.r1) }); M74.areaNorm = areaNorm;
  function areaCopy(cut) {
    const R = R_(), a = PRO.area; if (!a) return;
    PRO.clip = grabArea(R, a); PRO.lastCopy = 'area';
    if (cut) { if (FIXED[R.t]) { toast('This room has a fixed layout.'); return; } pushUndo(); clearCells(R, rectCells(a)); changed(); }
    toast(cut ? 'Cut. Ctrl V or Paste to put it down.' : 'Copied. Ctrl V or Paste to put it down.');
    M74.renderInspector();
  }
  function areaDelete() {
    const R = R_(), a = PRO.area; if (!a || FIXED[R.t]) return;
    pushUndo(); if (clearCells(R, rectCells(a))) changed(); else { Maker.undo.pop(); syncUndo(); }
  }
  function areaFill() {
    const R = R_(), a = PRO.area; if (!a || FIXED[R.t]) return;
    Maker.stroke = { tool: 'brush', saved: false, changed: false, box: true };
    for (const [c, r] of rectCells(a)) M74.applyAt(c, r, 'brush');
    const st = Maker.stroke; Maker.stroke = null;
    if (st.changed || st.saved) changed();
  }
  function areaTransform(fn) {
    const R = R_(), F = F_(), a = PRO.area; if (!a || FIXED[R.t]) return;
    const clip = fn(grabArea(R, a));
    pushUndo();
    clearCells(R, rectCells(a));
    placeClip(R, F, clip, a.c0, a.r0, true);
    PRO.area = { c0: a.c0, r0: a.r0, c1: Math.min(GW - 1, a.c0 + clip.w - 1), r1: Math.min(GH - 1, a.r0 + clip.h - 1) };
    changed();
  }
  function areaMove(dc, dr) {
    const a = PRO.area; if (!a) return;
    if (a.c0 + dc < 0 || a.r0 + dr < 0 || a.c1 + dc >= GW || a.r1 + dr >= GH) return;
    const R = R_(), F = F_(); if (FIXED[R.t]) return;
    const clip = grabArea(R, a);
    pushUndo();
    clearCells(R, rectCells(a));
    placeClip(R, F, clip, a.c0 + dc, a.r0 + dr, true);
    PRO.area = { c0: a.c0 + dc, r0: a.r0 + dr, c1: a.c1 + dc, r1: a.r1 + dr };
    changed();
  }
  function startStamp(clip) {
    if (!clip) return;
    PRO.stamp = JSON.parse(JSON.stringify(clip));
    PRO.area = null;
    Maker.tool = 'stamp'; Maker.sel = null;
    M74.syncTools(); M74.renderInspector();
    toast('Stamp: click to put it down. Esc to stop.');
  }
  const stampAnchor = (c, r) => ({ c: c - Math.floor((PRO.stamp.w - 1) / 2), r: r - Math.floor((PRO.stamp.h - 1) / 2) }); M74.stampAnchor = stampAnchor;
  function putStamp(c, r) {
    const R = R_(), F = F_(), S = PRO.stamp; if (!S) return;
    if (FIXED[R.t]) { toast('This room has a fixed layout.'); return; }
    const a = stampAnchor(c, r);
    pushUndo();
    const n = placeClip(R, F, S, a.c, a.r, false);
    if (!n) { Maker.undo.pop(); syncUndo(); return; }
    changed();
  }

  /* ---- the stamp library: built in ones and your own, kept in this browser */
  const ST_IN = [
    { n: 'Pillar ring', rows: ['.###.', '#...#', '#...#', '#...#', '.###.'] },
    { n: 'Treasure nook', rows: ['###', '#X#', '#.#'] },
    { n: 'Lever and gates', rows: ['..', '..', '..'], e: [{ t: 'lv', c: 0, r: 1, ch: 0 }, { t: 'gt', c: 1, r: 0, ch: 0 }, { t: 'gt', c: 1, r: 1, ch: 0 }, { t: 'gt', c: 1, r: 2, ch: 0 }] },
    { n: 'Fire bar post', rows: ['#.#', '...', '#.#'], e: [{ t: 'fb', c: 1, r: 1, n: 4, s: 2, w: 1, a: 0 }] },
    { n: 'Spike hall', rows: ['.....', '.....', '.....'], e: [0, 1, 2, 3, 4].flatMap((c) => [0, 1, 2].map((r) => ({ t: 'sk', c, r, g: (c + r) % 2 }))) },
    { n: 'Saw lane', rows: ['#.....#'], e: [{ t: 'sw', c: 3, r: 0, ax: 'h', s: 2 }] },
    { n: 'Nest den', rows: ['o.o', '...', 'o.o'], e: [{ t: 'ns', c: 1, r: 1, k: 'grub', n: 3, s: 2 }] },
    { n: 'Teleport pair', rows: ['.....'], e: [{ t: 'tp', c: 0, r: 0, ch: 1 }, { t: 'tp', c: 4, r: 0, ch: 1 }] },
    { n: 'Keg corner', rows: ['##', '#.'], e: [{ t: 'bx', c: 1, r: 1 }] },
    { n: 'Acid pool', rows: ['.....', '.....', '.....'], e: [[1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2]].map(([c, r]) => ({ t: 'ac', c, r })) },
  ].map((s) => ({ n: s.n, w: s.rows[0].length, h: s.rows.length, g: s.rows.join(''), e: (s.e || []).map((q) => Object.assign(entDefaults(q.t), q)), builtin: 1 })); M74.ST_IN = ST_IN;
  function cleanClip(s) {
    if (!s || typeof s !== 'object') return null;
    const w = clampN(s.w, 1, GW, 0) | 0, h = clampN(s.h, 1, GH, 0) | 0; if (!w || !h) return null;
    let g = ''; for (let i = 0; i < w * h; i++) { const ch = String(s.g || '')[i] || '.'; g += GRID_OK.includes(ch) ? ch : '.'; }
    const e = (Array.isArray(s.e) ? s.e : []).map((q) => { const c = clampN(q && q.c, 0, w - 1, -1) | 0, r = clampN(q && q.r, 0, h - 1, -1) | 0; if (c < 0 || r < 0) return null; const x = cleanEnt(Object.assign({}, q, { c: 0, r: 0 })); return x ? Object.assign(x, { c, r }) : null; }).filter(Boolean);
    return { n: strN(s.n, 24) || 'Stamp', w, h, g, e };
  }
  const myStamps = () => (lsGet(PSTORE, []) || []).map(cleanClip).filter(Boolean).slice(0, 30); M74.myStamps = myStamps;
  function saveStamp(clip, name) {
    const list = myStamps();
    if (list.length >= 30) { toast('Thirty stamps is the most. Delete one first.'); return false; }
    list.unshift(Object.assign({}, cleanClip(clip), { n: strN(name, 24) || 'Stamp ' + (list.length + 1) }));
    if (!lsSet(PSTORE, list)) { toast('Could not save: storage full.'); return false; }
    toast('Saved to your stamps'); return true;
  }
  function deleteStamp(i) { const list = myStamps(); list.splice(i, 1); lsSet(PSTORE, list); }
  function paintClip(c, s, clip, set) {
    c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s);
    const cw = Math.min((s - 4) / clip.w, (s - 4) / clip.h), ox = (s - cw * clip.w) / 2, oy = (s - cw * clip.h) / 2;
    const at = safe(() => tileAtlas(set), null);
    for (let i = 0; i < clip.w * clip.h; i++) {
      const ch = clip.g[i], x = ox + (i % clip.w) * cw, y = oy + Math.floor(i / clip.w) * cw;
      c.fillStyle = 'rgba(236,226,212,.06)'; c.fillRect(x + 0.3, y + 0.3, cw - 0.6, cw - 0.6);
      if (ch === '.') continue;
      if (at && at[ch]) c.drawImage(at[ch], x - cw * 0.1, y - cw * 0.2, cw * 1.2, cw * 1.2);
      else { c.fillStyle = SOLID_TILE(ch) ? 'rgba(236,226,212,.6)' : 'rgba(236,226,212,.25)'; c.fillRect(x, y, cw, cw); }
    }
    for (const q of clip.e) {
      const x = ox + (q.c + 0.5) * cw, y = oy + (q.r + 0.5) * cw;
      c.fillStyle = q.t === 'sn' ? '#ff4a5a' : ENTS[q.t].cat === 'traps' ? '#ff9a2a' : ENTS[q.t].cat === 'loot' ? '#ffd84a' : q.ch != null ? CH_COLS[q.ch] : '#7cc4ff';
      c.beginPath(); c.arc(x, y, Math.max(1.5, cw * 0.3), 0, TAU); c.fill();
    }
  }

  /* ---- tools on the canvas */
  IC.line = SVG('<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/><circle cx="19" cy="5" r="1.6" fill="currentColor"/>');
  IC.ring = SVG('<rect x="4.5" y="5.5" width="15" height="13" rx="1"/>');
  IC.oval = SVG('<ellipse cx="12" cy="12" rx="8" ry="6.5"/>');
  IC.area = SVG('<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" /><path d="M9 12h6M12 9v6" stroke-dasharray="1.5 2"/>');
  IC.stamp = SVG('<path d="M9 4h6v5l3 3v3H6v-3l3-3z"/><path d="M5 19h14"/>');
  IC.size = SVG('<rect x="4" y="13" width="5" height="5"/><rect x="11" y="6" width="9" height="12"/>');
  IC.gen = SVG('<path d="M4 20l6-6M14 4l1.2 2.8L18 8l-2.8 1.2L14 12l-1.2-2.8L10 8l2.8-1.2zM18 14l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/>');
  IC.bolt = SVG('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>');
  IC.gear = SVG('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>');
  IC.rot = SVG('<path d="M19 12a7 7 0 1 1-2-5"/><path d="M17 3v4h-4"/>');
  TOOLS.splice(4, 0, ['line', 'Line', 'L'], ['ring', 'Outline', 'O'], ['oval', 'Circle', 'C']);
  TOOLS.splice(TOOLS.findIndex((t) => t[0] === 'move'), 0, ['area', 'Area', 'M']);
  CATS.push(['stamps', 'Stamps']);

  safe(() => {
    const od = M74.onDown;
    M74.onDown = function (e) {
      if (!Maker.M) return od.apply(this, arguments);
      const tool = e.button === 2 ? 'erase' : Maker.tool;
      const isMine = SHAPES[Maker.tool] || Maker.tool === 'area' || Maker.tool === 'stamp';
      if (!isMine) return od.apply(this, arguments);
      const p = cellFrom(e);
      if (!p.inside) return od.apply(this, arguments);
      e.preventDefault && e.preventDefault();
      try { Maker.cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const R = R_();
      if (Maker.tool === 'stamp') {
        if (e.button === 2) { PRO.stamp = null; M74.setTool('brush'); return; }
        putStamp(p.c, p.r); return;
      }
      if (Maker.tool === 'area') {
        const a = PRO.area;
        if (a && p.c >= a.c0 && p.c <= a.c1 && p.r >= a.r0 && p.r <= a.r1 && !FIXED[R.t]) { Maker.stroke = { tool: 'area', drag: { c: p.c, r: p.r }, saved: false, changed: false }; return; }
        PRO.area = null;
        Maker.stroke = { tool: 'area', mark: { c0: p.c, r0: p.r, c1: p.c, r1: p.r }, saved: false, changed: false };
        M74.renderInspector();
        return;
      }
      if (FIXED[R.t]) { toast('This room has a fixed layout.'); return; }
      Maker.stroke = { tool: Maker.tool, shape: { c0: p.c, r0: p.r, c1: p.c, r1: p.r }, erase: tool === 'erase', filled: !!e.shiftKey, saved: false, changed: false };
    };
    const om = M74.onMove;
    M74.onMove = function (e) {
      const st = Maker.stroke;
      if (!st || !(st.shape || st.mark || st.drag)) return om.apply(this, arguments);
      const p = cellFrom(e);
      const hv = p.inside ? { c: p.c, r: p.r } : null;
      if (!Maker.hover || !hv || hv.c !== Maker.hover.c || hv.r !== Maker.hover.r) { Maker.hover = hv; M74.renderCrumb(); }
      const c = clamp(p.c, 0, GW - 1), r = clamp(p.r, 0, GH - 1);
      if (st.shape) { st.shape.c1 = c; st.shape.r1 = r; st.filled = !!e.shiftKey; }
      else if (st.mark) { st.mark.c1 = c; st.mark.r1 = r; }
      else if (st.drag && (c !== st.drag.c || r !== st.drag.r)) {
        const dc = c - st.drag.c, dr = r - st.drag.r, a = PRO.area;
        if (a.c0 + dc >= 0 && a.r0 + dr >= 0 && a.c1 + dc < GW && a.r1 + dr < GH) { areaMove(dc, dr); st.drag = { c, r }; }
      }
    };
    const ou = M74.onUp;
    M74.onUp = function () {
      const st = Maker.stroke;
      if (!st || !(st.shape || st.mark || st.drag)) return ou.apply(this, arguments);
      Maker.stroke = null;
      if (st.mark) { PRO.area = areaNorm(st.mark); M74.renderInspector(); return; }
      if (st.drag) { M74.renderInspector(); return; }
      const cells = shapeCells(st);
      Maker.stroke = { tool: st.erase ? 'erase' : 'brush', saved: false, changed: false };
      for (const [c, r] of cells) M74.applyAt(c, r, st.erase ? 'erase' : 'brush');
      const s2 = Maker.stroke; Maker.stroke = null;
      if (s2.changed || s2.saved) changed();
    };
    const stl = M74.setTool;
    M74.setTool = function (id) {
      if (id !== 'area') PRO.area = null;
      if (id !== 'stamp') PRO.stamp = null;
      return stl.apply(this, arguments);
    };
    const sy = M74.syncTools;
    M74.syncTools = function () {
      const r = sy.apply(this, arguments);
      safe(() => {
        const sb = $('mkTools') && $('mkTools').querySelector('[data-size]');
        if (sb) { sb.querySelector('.tl').textContent = 'Size ' + PRO.size; sb.classList.toggle('on', PRO.size > 1); }
        if (Maker.cv && (Maker.tool === 'area' || Maker.tool === 'stamp')) Maker.cv.style.cursor = Maker.tool === 'area' ? 'cell' : 'copy';
      });
      return r;
    };
    const pb = M74.pickBrush;
    M74.pickBrush = function (b) {
      if (b && b.k === 'stamp') { startStamp(b.clip); return; }
      const keep = Maker.tool;
      const r = pb.apply(this, arguments);
      if (SHAPES[keep]) { Maker.tool = keep; M74.syncTools(); }
      return r;
    };
  });
  safe(() => { const ed = M74.edit; M74.edit = function () { PRO.area = null; PRO.stamp = null; if (Maker.tool === 'stamp') Maker.tool = 'brush'; return ed.apply(this, arguments); }; MK.edit = M74.edit; Maker.edit = M74.edit; });
  function cycleSize() { PRO.size = PRO.size >= 3 ? 1 : PRO.size + 1; M74.syncTools(); toast(`Brush size ${PRO.size}`); }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
