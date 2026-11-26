/* 74.js section 06: map-run. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { BOSSES, CH_COLS, CH_NAMES, DARK_V, EMPTY, FIXED, GH, GN, GW, MINIS, MK, NEEDS, OPPS, S9, SIDES, TILE, edgeOf, entAt, fbAngle, safe, setDef, typeTemplate } = M74;
  M74.putOb = putOb; M74.buildFloor = buildFloor; M74.buildRoom = buildRoom; M74.setupEnt = setupEnt; M74.gateOpen = gateOpen; M74.applyGates = applyGates; M74.pullLever = pullLever; M74.mustFight = mustFight; M74.openExit = openExit; M74.spawnMapSnakes = spawnMapSnakes; M74.mapButtons = mapButtons;
  /* ================================================================== 6. playing a map: the run */
  const RTM = MK.RTM = { cur: null, back: 'hub', fromFloor: 0, startRoom: null, tpTo: null, test: false, label: '' }; M74.RTM = RTM;
  MODES.map = { name: 'Map', desc: 'A map from the Map Maker.', floors: 1 };
  const inMap = () => G.mode === 'map' && !!RTM.cur && !!G.run; M74.inMap = inMap;
  MK.inMap = inMap;

  safe(() => {
    const lb0 = Game.levelBase;
    Game.levelBase = function (i) {
      if (G.mode !== 'map' || !RTM.cur) return lb0.apply(this, arguments);
      const M = RTM.cur, fi = Math.min(Math.max(0, i | 0), M.floors.length - 1), F = M.floors[fi];
      const base = setDef(F.set);
      const def = Object.assign({}, base, { set: base.set || F.set, name: F.name || base.name, sub: F.sub || base.sub || '', rooms: F.rooms.length, portal: false, mapF: fi, rare10: false, rush: false, endless: false, loop: 0 });
      def.boss = F.boss !== 'auto' && BOSSES.includes(F.boss) ? F.boss : base.boss;
      if (F.dark >= 0) { def.dark = DARK_V[F.dark]; def.darkClear = Math.max(0.14, DARK_V[F.dark] * 0.58); }
      return def;
    };
    const sd0 = Game.scaleDef;
    Game.scaleDef = function (base, i) {
      const d = sd0.apply(this, arguments);
      if (G.mode === 'map' && RTM.cur && d) {
        const ru = RTM.cur.rules;
        if (!ru.ex) { d.extra = 0; d.traits = 0; }
        if (!ru.gw) d.champ = 0;
        d.bossMult = (d.bossMult || 1) * ru.bh;
        d.first = false;
        if (base && base.boss) d.boss = base.boss;
      }
      return d;
    };
    const il0 = Game.isLast;
    Game.isLast = function (i = G.levelIdx) { if (G.mode === 'map' && RTM.cur) return i >= RTM.cur.floors.length - 1; return il0.apply(this, arguments); };
    const fl0 = floorLabel;
    floorLabel = function (i) { if (G.mode === 'map' && RTM.cur) return RTM.cur.floors.length > 1 ? `Floor ${i + 1} of ${RTM.cur.floors.length}` : RTM.cur.name; return fl0.apply(this, arguments); };
    const gl0 = generateLevel;
    generateLevel = function (def, rng) {
      if (G.mode === 'map' && RTM.cur && def && def.mapF != null) return buildFloor(RTM.cur, def.mapF, def);
      return gl0.apply(this, arguments);
    };
  });

  /* ---- a floor out of the editor's rooms */
  function ensurePieces(g, type, R) {
    const need = NEEDS[type]; if (!need) return g;
    if ([...need].some((ch) => g.includes(ch))) return g;
    const tpl = typeTemplate(type); if (!tpl) return g;
    let out = g;
    for (let i = 0; i < GN; i++) {
      const ch = tpl[i];
      if (ch === '.' || !TILE[ch] || (TILE[ch].cat !== 'pieces' && !need.includes(ch))) continue;
      const c = i % GW, r = Math.floor(i / GW);
      if (entAt(R, c, r)) continue;
      out = out.slice(0, i) + ch + out.slice(i + 1);
    }
    return out;
  }
  const rowsOf = (g) => { const out = []; for (let r = 0; r < GH; r++) out.push(g.slice(r * GW, r * GW + GW)); return out; }; M74.rowsOf = rowsOf;
  function putOb(room, type, c, r, extra) {
    const old = room.tiles[r][c];
    if (old) { const i = room.obs.indexOf(old); if (i >= 0) room.obs.splice(i, 1); }
    const o = Object.assign({ type, solid: true, shots: true, c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, shake: 0, seed: Math.random(), wob: 0 }, extra || {});
    room.tiles[r][c] = o; room.obs.push(o);
    return o;
  }
  Object.assign(INSET9, { mkLever: 9, mkGate: 1, mkKeg: 8, mkNest: 5, mkTotem: 6, mkPivot: 10, mkBump: 7 });

  function buildFloor(M, fi, def) {
    const F = M.floors[fi];
    const rooms = [], at = new Map();
    F.rooms.forEach((R, i) => { const r = new Room(R.x, R.y, i); r.mkR = R; rooms.push(r); at.set(R.x + ',' + R.y, r); });
    const map = { rooms, start: null, boss: null, chest: null, bounds: null, chestExtra: false, mkPads: [], mkGates: [], mkCh: [0, 0, 0, 0], mkKeys: 0, mkF: fi };
    // start room: the editor's start, or a room the tester picked
    let start = rooms.find((r) => r.mkR.t === 'start') || rooms[0];
    if (RTM.startRoom && fi === 0) { const s = at.get(RTM.startRoom.x + ',' + RTM.startRoom.y); if (s) start = s; }
    // doors, cracked walls after the distances are known
    const cracks = [];
    for (const r of rooms) for (const s in SIDES) {
      const e = edgeOf(F, r.mkR, s); if (!e || e === 'w') continue;
      const o = at.get((r.gx + SIDES[s][0]) + ',' + (r.gy + SIDES[s][1])); if (!o) continue;
      if (e === 'o') r.doors[s] = o; else cracks.push([r, s, o]);
    }
    start.dist = 0;
    const q = [start], seen = new Set([start]);
    while (q.length) {
      const r = q.shift();
      const nb = Object.values(r.doors).concat(cracks.filter((k) => k[0] === r).map((k) => k[2]));
      for (const o of nb) if (!seen.has(o)) { seen.add(o); o.dist = r.dist + 1; q.push(o); }
    }
    for (const r of rooms) if (r.dist == null) r.dist = 99;
    for (const [a, s, b] of cracks) {
      if (a.dist > b.dist || (a.dist === b.dist && a.id > b.id)) continue;
      if (a.secretLink) { a.doors[s] = b; b.doors[OPPS[s]] = a; continue; }
      a.secretLink = { k: s, room: b, hp: 3 };
      b.doors[OPPS[s]] = a;
    }
    for (const r of rooms) safe(() => M74.buildRoom(r, r.mkR, def, map, r === start));
    map.start = start;
    map.boss = rooms.find((r) => r.type === 'boss') || null;
    map.chest = rooms.find((r) => r.type === 'chest') || null;
    let minX = 99, maxX = -99, minY = 99, maxY = -99;
    for (const r of rooms) { minX = Math.min(minX, r.gx); maxX = Math.max(maxX, r.gx); minY = Math.min(minY, r.gy); maxY = Math.max(maxY, r.gy); }
    map.bounds = { minX, maxX, minY, maxY };
    applyGates(map, false);
    return map;
  }

  function buildRoom(room, R, def, map, isStart) {
    let type = R.t;
    const sn = R.e.filter((e) => e.t === 'sn'), nests = R.e.filter((e) => e.t === 'ns');
    const combat = sn.length > 0 || nests.length > 0;
    if (type === 'fight' && !combat) type = 'hall';
    else if (type === 'hall' && combat) type = 'fight';
    if (isStart && type !== 'start' && RTM.startRoom) { /* testing from this room: it keeps its own type */ }
    let g = R.g;
    if (FIXED[type]) g = typeTemplate(type) || g;
    else if (NEEDS[type]) g = ensurePieces(g, type, R);
    room.type = type === 'arena' ? 'chaosboss' : type;
    let rows = rowsOf(g);
    if (type === 'boss' && g === EMPTY && typeof BOSS_TPL10 !== 'undefined' && BOSS_TPL10[def.boss]) rows = BOSS_TPL10[def.boss];
    if (def.set === 'market') room.store = R.st || (Math.random() < 0.5 ? 'blue' : 'yellow');
    room.build(rows, def, {});
    if (type === 'boss' && def.boss === 'tunnel') room.theme10 = 'station';
    room.cleared = true;
    room.mod = null;
    switch (type) {
      case 'fight':
        room.cleared = false; room.mod = R.m || null;
        if (room.mod === 'freezer' || room.mod === 'blackice') room.ice = true;
        if (room.mod === 'collapse') safe(() => placeCracks(room, Math.random));
        break;
      case 'boss': room.cleared = false; break;
      case 'arena': room.cleared = false; room.chaosBoss = BOSSES.includes(R.b) ? R.b : 'mother'; break;
      case 'miniboss': room.cleared = false; room.mini = MINIS.includes(R.b) ? R.b : ((MINI_POOL[def.set] || MINI_POOL.cellar)[0]); break;
      case 'challenge': room.cleared = false; room.wave = 0; break;
      case 'survival': room.cleared = false; room.surv = { on: false, t: 0, spawnT: 0, len: R.n || 25 }; break;
      case 'chest': if (room.chest && R.mim) room.chest.mimic = true; break;
      case 'shop': room.store = R.st || room.store || (Math.random() < 0.5 ? 'blue' : 'yellow'); break;
      case 'vault': room.sealed = true; break;
      case 'vote': room.voteRoom = true; break;
      case 'quiet': safe(() => setupQuiet10(room)); break;
      default: break;
    }
    if (R.lk && !isStart) room.sealed = true;
    // snakes in a room that does not fight by itself: it fights once you walk in
    room.mkSn = sn.map((e) => ({ k: e.k, c: e.c, r: e.r, g: e.g, tr: e.tr, say: e.say || '', die: e.die || '', vr: e.vr | 0, hp: e.hp || 1 }));
    room.mkR = R;
    room.spawns = [];
    if (combat && !['fight', 'boss', 'arena', 'miniboss', 'challenge', 'survival'].includes(type)) { room.mkGuard = true; room.cleared = false; }
    room.mkAlways = R.ta !== 0;
    // the new pieces
    room.mkE = [];
    for (const e of R.e) if (e.t !== 'sn') safe(() => M74.setupEnt(room, e, def, map));
    room.dirty = true; room.ver++;
  }

  function setupEnt(room, e, def, map) {
    const x = (e.c + 0.5) * T, y = (e.r + 0.5) * T;
    const k = Object.assign({}, e, { x, y, t0: Math.random() * 10 });
    const P = G.player;
    switch (e.t) {
      case 'tp': k.on = true; map.mkPads.push({ room, e: k }); break;
      case 'jp': k.cd = 0; k.k = 0; break;
      case 'bm': k.cd = 0; k.k = 0; k.ob = putOb(room, 'mkBump', e.c, e.r, { shots: false, mk: k }); break;
      case 'lv': k.on = false; k.cd = 0; k.swing = 0; k.ob = putOb(room, 'mkLever', e.c, e.r, { breakable: true, hp: 99, max: 99, mk: k }); break;
      case 'gt': k.lift = e.o ? 1 : 0; k.ob = putOb(room, 'mkGate', e.c, e.r, { mk: k }); map.mkGates.push({ room, e: k }); break;
      case 'fb': k.ang = fbAngle(e); k.ob = putOb(room, 'mkPivot', e.c, e.r, { mk: k }); k.hitT = 0; break;
      case 'sw': {
        k.spin = 0; k.v = [0, 60, 95, 140][e.s || 2];
        // the slot runs until something solid: the saw turns around there
        let lo = e.ax === 'v' ? e.r : e.c, hi = lo;
        const solid = (cc, rr) => room.solid(cc, rr);
        if (e.ax === 'v') { while (lo > 0 && !solid(e.c, lo - 1)) lo--; while (hi < GH - 1 && !solid(e.c, hi + 1)) hi++; k.lo = (lo + 0.5) * T; k.hi = (hi + 0.5) * T; }
        else { while (lo > 0 && !solid(lo - 1, e.r)) lo--; while (hi < GW - 1 && !solid(hi + 1, e.r)) hi++; k.lo = (lo + 0.5) * T; k.hi = (hi + 0.5) * T; }
        k.dir = 1;
        break;
      }
      case 'tt': k.cd = 1 + Math.random(); k.charge = 0; k.ob = putOb(room, 'mkTotem', e.c, e.r, { breakable: !!e.b, hp: 6, max: 6, mk: k }); break;
      case 'bx': k.fuse = 0; k.ob = putOb(room, 'mkKeg', e.c, e.r, { breakable: true, hp: 2, max: 2, mk: k }); break;
      case 'ns': { const hp = 9 + 2 * (def.tier || 0); k.cd = 1.1; k.ob = putOb(room, 'mkNest', e.c, e.r, { breakable: true, hp, max: hp, mk: k }); break; }
      case 'ac': k.tick = 0; break;
      case 'wk': k.state = 0; k.tm = 0; k.seed = Math.random(); break;
      case 'sk': room.spikes.push({ c: e.c, r: e.r, g: e.g ? 1 : 0 }); return;
      case 'ex': room.mkExit = { x, y }; break;
      case 'pd': {
        let id = e.id;
        if (id === 'rand' || id === 'rare' || !ITEMS[id] || (P && P.items.includes(id)) || (G.run && G.run.pending.has(id))) id = P && G.run ? nextItemId(e.id === 'rare' ? 1 : 0.04) : 'golden';
        if (id !== 'golden' && G.run) G.run.pending.add(id);
        const pk = { kind: 'item', id, x, y: y - 6, t: 0, mkPed: true };
        if (e.c) pk.cost = e.c;
        room.pickups.push(pk);
        break;
      }
      case 'ky': room.pickups.push({ kind: 'key', x, y, vx: 0, vy: 0, t: 0.5, ph: Math.random() * 10 }); map.mkKeys++; return;
      case 'cn': {
        const n = e.n || 3;
        for (let i = 0; i < n; i++) { const a = (i / n) * TAU + Math.random() * 0.4, rr = n > 1 ? 4 + (i % 3) * 3 : 0; room.pickups.push({ kind: 'coin', x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr, vx: 0, vy: 0, t: 0.3, ph: Math.random() * 10 }); }
        return;
      }
      default: break;
    }
    room.mkE.push(k);
  }

  /* ---- gates follow their color's lever, on the whole floor */
  function gateOpen(map, k) { return !!(k.o ^ (map.mkCh[k.ch || 0] & 1)); }
  function applyGates(map, live) {
    for (const { room, e } of map.mkGates) {
      const open = gateOpen(map, e), o = e.ob;
      if (!o) continue;
      if (o.solid === !open) continue;
      o.solid = !open; o.shots = !open; room.ver++;
      if (!live) e.lift = open ? 1 : 0;
      if (live && room === G.room && !open) {
        const P = G.player;
        if (Math.abs(P.x - o.x) < T / 2 + P.r - 2 && Math.abs(P.y - o.y) < T / 2 + P.r - 2) { const f = nearestFreeCell(room, P.x, P.y); P.x = f.x; P.y = f.y; }
        burst(o.x, o.y, 8, '#8a8480', { kind: 'shard', min: 20, max: 70, lmin: 0.2, lmax: 0.5 });
      }
    }
    for (const r of map.rooms) for (const k of r.mkE || []) if (k.t === 'lv') k.on = !!(map.mkCh[k.ch || 0] & 1);
  }
  function pullLever(room, k) {
    if (k.cd > 0 || !G.map) return;
    k.cd = 0.45; k.swing = k.on ? 0.6 : -0.6;
    G.map.mkCh[k.ch || 0] ^= 1;
    applyGates(G.map, true);
    Sfx.clank(); Sfx.tone(180, 0.18, { to: 120, vol: 0.12, type: 'square', lp: 900 });
    const n = G.map.mkGates.filter((g) => (g.e.ch || 0) === (k.ch || 0)).length;
    floatText(k.x, k.y - 26, n ? `${CH_NAMES[k.ch || 0].toUpperCase()} GATES` : 'CLICK', CH_COLS[k.ch || 0], !!n);
    if (n && G.map.mkGates.some((g) => g.room !== room && (g.e.ch || 0) === (k.ch || 0))) UI.banner('Something moved', 'Gates shifted somewhere else on this floor.');
  }

  /* ---- the run itself */
  function applyRules(M) {
    const ru = M.rules, P = G.player;
    if (!P || !G.run) return;
    if (ru.dm !== 1) P.dmg *= ru.dm;
    if (ru.ps !== 1) P.speed *= ru.ps;
    if (ru.fr !== 1) P.fireDelay /= ru.fr;
    if (ru.ap) { P.maxHp = Math.min(20, P.maxHp + ru.ap * 2); P.hp = P.maxHp; }
    if (ru.co) G.run.coins = (G.run.coins || 0) + ru.co;
    G.D = Object.assign({}, G.D, { hearts: (G.D.hearts || 1) * ru.hd, rot: ru.dg ? G.D.rot : 0 });
    G.speedK = (G.speedK || 1) * ru.ss; G.bossSpeedK = (G.bossSpeedK || 1) * (0.5 + ru.ss * 0.5);
    G.run.noodleT = ru.nd ? 12 : 1e12;
    if (!ru.ct) G.run.ctFloorN24 = 99;
    G.run.mapName = M.name;
    const start = G.map && G.map.start;
    if (start && M.items.length) M.items.forEach((id, k) => {
      if (!ITEMS[id]) return;
      if (id !== 'golden') G.run.pending.add(id);
      start.pickups.push({ kind: 'item', id, x: RW / 2 + (k - (M.items.length - 1) / 2) * 50, y: RH / 2 - 52, t: 0, gift: 'custom' });
    });
  }
  safe(() => {
    Hooks.layer('Game.startRun', 'v12.3 map runs', function (next, story, mode) {
      if (mode !== 'map' || !RTM.cur) return next.apply(this, [].slice.call(arguments, 1));
      const M = RTM.cur, D = Save.data, keepDiff = D.diff, keepChar = D.char;
      if (M.diff) D.diff = M.diff === 'nightmare' && !D.unlocks.nightmare ? 'hard' : M.diff;
      if (M.char && (M.char === 'apple' || D.unlocks[M.char])) D.char = M.char;
      let r;
      try { r = next.call(this, false, 'map'); } finally { D.diff = keepDiff; D.char = keepChar; }
      safe(() => applyRules(M));
      safe(() => M74.mapButtons(true));
      return r;
    });
    Hooks.layer('Game.loadLevel', 'v12.3 map floors', function (next, i) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (!inMap()) return r;
      safe(() => {
        const M = RTM.cur, map = G.map;
        if (!M.rules.gf) { for (const rm of map.rooms) for (const o of rm.obs) o.item = false; map.chestExtra = false; }
        // keys: what the maker placed, plus hidden ones for locked rooms that would stay shut
        for (const rm of map.rooms) for (const o of rm.obs) o.key = false;
        map.keyDrop = false;
        let missing = map.rooms.filter((rm) => rm.sealed).length - map.mkKeys;
        if (missing > 0) {
          const cands = shuffle(map.rooms.filter((rm) => !rm.sealed).flatMap((rm) => rm.obs.filter((o) => o.breakable && !o.item && !o.mk)));
          while (missing > 0 && cands.length) { cands.pop().key = true; missing--; }
          if (missing > 0) map.keyDrop = true;
        }
        if (!M.rules.ct) G.run.ctFloorN24 = 99;
        if (map.rooms.some((rm) => rm.chaosBoss === 'manu' || rm.chaosBoss === 'manudevil') && typeof DJ !== 'undefined') DJ.prepare();
      });
      return r;
    });
  });

  /* ---- entering rooms: teleports land on their pad, guarded rooms close */
  safe(() => {
    Hooks.layer('Game.enterRoom', 'v12.3 map rooms', function (next, room, entry) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (!inMap()) return r;
      safe(() => {
        const P = G.player;
        if (RTM.tpTo && RTM.tpTo.room === room) {
          const k = RTM.tpTo.e; RTM.tpTo = null;
          P.x = k.x; P.y = k.y; P.kbx = 0; P.kby = 0; P.mkTpLock = true;
          burst(k.x, k.y, 16, CH_COLS[k.ch || 0], { min: 30, max: 120, lmin: 0.3, lmax: 0.7, glow: true });
          flashLight(k.x, k.y, 90, 0.9, 0.6);
        }
        if (room.mkGuard && !room.cleared && !room.mkFought) {
          room.mkFought = true;
          Game.startCombat(room);
          if (room.type !== 'start') UI.card('', 'Guarded', 'Something lives here. The doors shut.', 'boss', 1.8);
        }
        if (['boss', 'chaosboss', 'miniboss'].includes(room.type) && room.mkSn && room.mkSn.length && !room.mkSnDone && room.locked) { room.mkSnDone = true; M74.spawnMapSnakes(room); }
        if (room.mkExit && !room.locked && !room.exit && !mustFight(room)) openExit(room);
      });
      return r;
    });
    const sc0 = Game.startCombat;
    Game.startCombat = function (room) {
      if (!inMap() || !room.mkSn) return sc0.apply(this, arguments);
      const keep = room.spawns; room.spawns = [];
      try { sc0.apply(this, arguments); } finally { room.spawns = keep; }
      if (!room.mkSnDone) { room.mkSnDone = true; M74.spawnMapSnakes(room); }
    };
    const sw0 = Game.spawnWave;
    Game.spawnWave = function (room) {
      const r = sw0.apply(this, arguments);
      if (inMap() && room.mkSn && room.mkSn.length && !room.mkSnDone) { room.mkSnDone = true; safe(() => M74.spawnMapSnakes(room)); }
      return r;
    };
    Hooks.layer('Game.clearRoom', 'v12.3 map rooms', function (next, room) {
      if (inMap() && room.mkE && room.mkE.some((k) => k.t === 'ns' && k.ob && !k.ob.broken)) return;
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => { if (room.mkExit) openExit(room); });
      return r;
    });
  });
  function mustFight(room) { return !room.cleared && (room.type === 'fight' || room.mkGuard || ['boss', 'chaosboss', 'miniboss', 'challenge', 'survival'].includes(room.type)); }
  function openExit(room) {
    if (!room.mkExit) return;
    const last = Game.isLast();
    if (room.exit) { room.exit.x = room.mkExit.x; room.exit.y = room.mkExit.y; return; }
    room.exit = { x: room.mkExit.x, y: room.mkExit.y, t: 0, kind: last ? 'light' : 'hole' };
    if (G.room === room) {
      flashLight(room.exit.x, room.exit.y, 120, 0.8, 0.8);
      setTimeout(() => { if (G.room === room && G.state === 'play') UI.card(last ? 'Daylight' : 'A way down', last ? 'Walk into the light' : 'The hatch is open', '', '', 2.2); }, 600);
    }
  }
  function spawnMapSnakes(room) {
    const list = room.mkSn; if (!list || !list.length) return;
    const P = G.player, L = G.levelDef, tier = L.tier || 0, ru = RTM.cur.rules;
    const eliteI = room.mod === 'elite' ? Math.floor(Math.random() * list.length) : -1;
    const champP = ru.gw ? 0.04 * (tier + 1) * (L.champ || 1) : 0;
    const used = new Set();
    list.forEach((s, i) => {
      if (!KINDS[s.k]) return;
      let x = (s.c + 0.5) * T, y = (s.r + 0.5) * T;
      if (dist(x, y, P.x, P.y) < 2.2 * T || used.has(s.r * COLS + s.c)) { const cell = Game.farCell(room, P, used); x = cell.x; y = cell.y; used.add(cell.r * COLS + cell.c); }
      else used.add(s.r * COLS + s.c);
      const champ = !!s.g || i === eliteI || (s.k !== 'rotter' && Math.random() < champP);
      const sn = safe(() => new Snake(s.k, x, y, { delay: 0.3 + i * 0.16, ang: Math.atan2(P.y - y, P.x - x), champ, trait: s.tr || null }));
      if (!sn) return;
      /* v14.6: a colour of the kind (the PR 15 variants) and a health scale, both set by the maker */
      if (s.vr && sn.K && sn.K.look14 && sn.K.look14.vars && sn.K.look14.vars.length > 1 && window.__bitten.lookVariant14) safe(() => window.__bitten.lookVariant14(sn, (s.vr - 1) % sn.K.look14.vars.length));
      if (s.hp && s.hp !== 1) { sn.maxHp = Math.max(1, Math.round(sn.maxHp * s.hp)); sn.hp = sn.maxHp; }
      room.snakes.push(sn);
      if (s.say || s.die) { sn.mkSay = s.say; sn.mkDie = s.die; sn.mkSayAt = G.t + (sn.delay || 0) + (sn.spawnTime || 0.8) + 0.2; (room.mkTalk || (room.mkTalk = [])).push(sn); }
      if (s.tr && TRAIT_NAMES[s.tr]) {
        const wait = ((sn.delay || 0) + (sn.spawnTime || 0.8)) * 1000 + 150;
        setTimeout(() => { if (sn.alive && G.room === room && G.state === 'play') floatText(sn.x, sn.y - sn.headR - 14, TRAIT_NAMES[sn.trait], TRAIT_COLS[sn.trait]); }, wait);
      }
    });
    const need = (L.traits || 0) - room.snakes.filter((s) => s.trait).length;
    if (need > 0) safe(() => giveTraits(room, need));
  }

  /* ---- the end of a map run */
  function mapButtons(on) {
    const lbl = on && RTM.back === 'editor' ? 'Editor' : on ? 'Maps' : 'Menu';
    for (const id of ['btnQuit', 'btnOverMenu', 'btnWinMenu']) { const b = UI.el[id]; if (b) b.textContent = S9(lbl); }
  }
  safe(() => {
    const w0 = Game.win;
    Game.win = function () {
      if (!inMap()) return w0.apply(this, arguments);
      const M = RTM.cur;
      G.state = 'win';
      safe(() => DJ.stop(0.5, true));
      const rooms = M.floors.reduce((n, F) => n + F.rooms.length, 0);
      if (rooms >= 3) Meta.add('mapWins');
      this.stashRewards();
      UI.el.winTitle.textContent = S9('Map cleared');
      UI.el.winLead.textContent = `${M.name}${M.author ? ' by ' + M.author : ''}. ${M.floors.length > 1 ? M.floors.length + ' floors' : rooms + ' rooms'}, ${fmtTime(G.run.time)}.`;
      UI.el.btnAgain.textContent = S9('Play again');
      this.saveBest();
      UI.el.winStats.innerHTML = this.statsHTML();
      UI.hideOverlays(); G.whiteout = 0;
      safe(() => paintPanelArt('winArt', 'apple'));
      UI.show('win');
      Sfx.startMusic();
      this.releaseWake();
      setTimeout(() => UI.el.btnAgain.focus({ preventScroll: true }), 60);
    };
    const go0 = Game.gameOver;
    Game.gameOver = function () {
      const r = go0.apply(this, arguments);
      if (inMap()) safe(() => {
        const M = RTM.cur, i = G.levelIdx;
        UI.el.overWhere.textContent = `Eaten in ${M.name}${M.floors.length > 1 ? ', floor ' + (i + 1) + ' of ' + M.floors.length : ''}${M.author ? ', a map by ' + M.author : ''}.`;
        UI.el.btnRetry.textContent = S9('Try again');
      });
      return r;
    };
    const tm0 = Game.toMenu;
    Game.toMenu = function () {
      const wasMap = G.mode === 'map' && RTM.cur;
      const r = tm0.apply(this, arguments);
      M74.mapButtons(false);
      if (wasMap) {
        G.mode = 'arcade';
        RTM.tpTo = null; RTM.startRoom = null;
        safe(() => M74.Maker.reopen());
      }
      return r;
    };
    // no collection progress from maps: a pedestal can hold anything
    const mk0 = Meta.mark;
    Meta.mark = function (map, key) { if (map === 'found' && G.mode === 'map' && G.state !== 'menu') return; return mk0.apply(this, arguments); };
    // a hidden way in a map was put there on purpose
    const hs0 = hitSecretWall;
    hitSecretWall = function (room) {
      const had = !!room.secretLink;
      const r = hs0.apply(this, arguments);
      if (inMap() && had && !room.secretLink) UI.banner('A hidden way', 'The wall gave in. Somebody built it like that.');
      return r;
    };
    // a locked map room talks about its key, not about a vault
    const vd0 = updateVaultDoors;
    updateVaultDoors = function (room) {
      if (inMap() && !(G.run.keys > 0) && !(room.vaultNag > G.t)) {
        const P = G.player;
        for (const k in room.doors) {
          const v = room.doors[k]; if (!v.sealed) continue;
          const dv = DOORV[k];
          if (dist(P.x, P.y, RW / 2 + dv[0] * RW / 2, RH / 2 + dv[1] * RH / 2) > 46) continue;
          room.vaultNag = G.t + 6;
          UI.banner('Locked', G.map && G.map.keyDrop ? 'Its key drops in the next fight you win on this floor.' : 'A key opens it. One is somewhere on this floor.');
          Sfx.thud();
          break;
        }
      }
      return vd0.apply(this, arguments);
    };
    // traps keep working after the snakes are dead, when the maker wants that
    const us0 = updateSpikes;
    updateSpikes = function (dt, room) {
      if (inMap() && room.mkAlways && room.cleared) { room.cleared = false; try { return us0.apply(this, arguments); } finally { room.cleared = true; } }
      return us0.apply(this, arguments);
    };
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
