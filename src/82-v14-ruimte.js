/* src/82-v14-ruimte.js: v14.2: De Ruimte. A space floor. Every room is open space with stars under your feet,
   every worm is a planet (Aarde, Mars, Neptunus, Pluto, Saturnus), the boss is De Galaxyworm, dying stars go
   supernova in some fights, and eight space powerups that only turn up out here.
   Seeded runs: the floor plan, the item pool and every other floor draw exactly the same Math.random calls as
   before. De Ruimte is placed with its own generator from the run seed, and space powerups are only in the pool
   on this floor, so a run that never reaches De Ruimte plays exactly as it did in v14.1.
   Spawn characters: E Aarde, ^ Mars, 0 Neptunus, ? Pluto, ( Saturnus. Test hook: window.__bitten.SPACE14. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe82'); if (window.console) console.warn('v14 ruimte', e); return fb; } };
  const SET = 'ruimte';
  const PLANETS = ['aarde', 'mars', 'neptunus', 'pluto', 'saturnus'];
  const PLANET = { aarde: 1, mars: 1, neptunus: 1, pluto: 1, saturnus: 1 };
  const SPACE = { force: false, odds: 0.35, endlessOdds: 0.2 };
  const inSpace = () => !!(G.levelDef && G.levelDef.set === SET);
  const spaceRoom = (room) => !!room && !SPECIAL9[room.type] && !clubRoom9(room) && room.type !== 'clownhq' && room.type !== 'quiet';
  const hash = (x) => { const s = Math.sin(x * 12.9898 + 4.1414) * 43758.5453; return s - Math.floor(s); };
  function fx14(room) { if (!room.fx14) room.fx14 = { shocks: [], holes: [], meteors: [], rings: [], cons: [], horizon: null, nova: null, novaT: null }; return room.fx14; }

  /* ================================================================== the floor */
  FLOOR10[SET] = {
    name: 'De Ruimte', sub: 'No floor, no ceiling. Every worm out here is the size of a planet.', rooms: 11, tier: 4, set: SET, boss: 'galaxy', hard: true,
    dark: 0.5, darkClear: 0.24, venomSpeed: 182, hpMult: 1.95, light: 205, noGrain: true,
    floor: '#0a0c1e', floor2: '#0d1026', grout: '#05060f', wall: '#121634', wallHi: '#2a346a', wallLo: '#060812', void: '#010104',
    rock: '#6a6470', rockHi: '#a49eaa', rockLo: '#2a2630', clay: '#bfe6ff', clayLo: '#5a8ab0', deco: SET, decoCol: '#9ab8ff', dirt: '#2a2a40',
    rockStyle: 'asteroid14', urnStyle: 'comet14',
  };
  // # asteroid   u comet ice   E Aarde   ^ Mars   0 Neptunus   ? Pluto   ( Saturnus
  const FIGHTS = [
    ['...........', '.##.....##.', '...E...^...', '...........', '..?..#..?..', '...........', '...0...(...', '.##.....##.', '...........'],
    ['u.........u', '..#.....#..', '....^.^....', '..#.....#..', '.....E.....', '..#.....#..', '....?.?....', '..#.....#..', 'u.........u'],
    ['...........', '.#.#...#.#.', '...........', '..(..E..0..', '...........', '..?.....?..', '.....^.....', '.#.#...#.#.', '...........'],
    ['...........', '...##.##...', '..E.....E..', '...........', '.#...(...#.', '...........', '..?..^..?..', '...##.##...', '...........'],
    ['u.u.....u.u', '...........', '..?..#..?..', '.....#.....', '..?.....?..', '.....0.....', '..?..#..?..', '...........', 'u.u.....u.u'],
    ['...........', '..#.....#..', '.#..(.(..#.', '...........', '....^.^....', '...........', '.#..E.0..#.', '..#.....#..', '...........'],
    ['u.........u', '..##...##..', '...........', '..^..?..^..', '.....#.....', '..0..?..(..', '...........', '..##...##..', 'u.........u'],
    ['...........', '.#.......#.', '...E.(.E...', '..#.....#..', '.....?.....', '..#.....#..', '...^.0.^...', '.#.......#.', '...........'],
  ];
  FIGHT_SETS[SET] = FIGHTS.slice();
  SHAPE_SPAWN[SET] = 'E?';
  for (const tpl of SHAPED) FIGHT_SETS[SET].push(tpl.map((row) => row.replace(/1/g, 'E').replace(/2/g, '?')));
  START_SETS[SET] = ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'];
  SWAP_POOL[SET] = 'E^0?(';
  NEW_WORMS[SET] = 'E^0?(';
  MINI_POOL[SET] = ['saturnus', 'aarde', 'neptunus'];
  EXTRA_POOL[SET] = ['pluto', 'pluto', 'mars', 'aarde'];
  WAVE_POOL[SET] = ['pluto', 'pluto', 'mars', 'aarde', 'neptunus', 'saturnus'];
  HAZARDS[SET] = ['supernova', 0.32];
  MOD_NAMES.supernova = 'A star is dying';
  DRONE_ROOT[SET] = 36.71;
  CHAOS_LOOKS9[SET] = () => FLOOR10[SET];
  CHAOS_POOL9.push('aarde', 'mars', 'neptunus', 'pluto', 'saturnus');
  CHAOS_MODS9.push('supernova');
  Object.assign(V9_SPAWN, { E: 'aarde', '^': 'mars', 0: 'neptunus', '?': 'pluto', '(': 'saturnus' });

  // whatever the shared rules put in a space room (a swarm, a swap) comes out as a planet
  const REMAP = { grub: 'pluto', hood: 'neptunus', lamprey: 'saturnus' };
  {
    const b0 = Room.prototype.build;
    Room.prototype.build = function (tpl, def, opt) {
      const r = b0.call(this, tpl, def, opt);
      if (def && def.set === SET) {
        for (const s of this.spawns) if (REMAP[s.kind]) s.kind = REMAP[s.kind];
        if (spaceRoom(this)) this.sconces = [];   // no torches in space
      }
      return r;
    };
    const hg0 = hatchGrub;
    hatchGrub = function (room, x, y) {
      if (!inSpace()) return hg0.apply(this, arguments);
      room.snakes.push(new Snake('pluto', x, y, { emerge: false, spawnTime: 0.35, locks: !room.cleared }));
      Sfx.hiss(0.8);
      burst(x, y, 8, '#d8c8b8', { min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
    };
  }

  /* ------------------------------------------------------------------ which runs go to space */
  // Arcade and Daily: after the normal plan, a generator of its own (from the run seed) may put De Ruimte on floor 3, 4 or 5.
  {
    const pf0 = planFloors10;
    planFloors10 = function (rng) {
      const out = pf0(rng);
      safe(() => {
        // the RUIMTE code is a local switch: online every peer plans the floors itself, so it only counts offline
        if (SPACE.force && G.mode === 'arcade' && LEVELS[1] && !NET14.live && !NET14.starting) { SPACE.force = false; out[1] = SET; return; }
        const run = G.run, seed = run && run.seed != null ? run.seed >>> 0 : 0;
        const r = mulberry32((seed ^ 0x2a5f1e07) >>> 0);
        if (r() >= SPACE.odds) return;
        const slots = [2, 3, 4].filter((i) => LEVELS[i]);
        if (slots.length) out[slots[Math.floor(r() * slots.length)]] = SET;
      });
      return out;
    };
    const lb1 = Game.levelBase;
    Game.levelBase = function (i) {
      const run = G.run;
      if (G.mode !== 'endless' || !run) return lb1.call(this, i);
      const fresh = !run.floors10 || run.floors10[i] === undefined;
      const L = lb1.call(this, i);
      if (!fresh || i < 2 || !run.floors10) return L;
      const recent = run.floors10.slice(Math.max(0, i - 4), i).indexOf(SET) >= 0;
      const r = mulberry32((((run.seed >>> 0) ^ 0x51ace000) + i * 0x9e3779b1) >>> 0);
      if (recent || r() >= SPACE.endlessOdds) return L;
      run.floors10[i] = SET;
      return lb1.call(this, i);
    };
  }

  /* ================================================================== the planet worms */
  Object.assign(KINDS, {
    aarde: {
      name: 'Aardworm', hp: 16, headR: 13, r0: 11, r1: 6, spacing: 8, maxLen: 11, minLen: 4, speed: 58, turn: 3.2, bite: 1, noMound: true,
      body: '#2a6ad8', body2: '#245ec4', outline: '#06142e', hi: 'rgba(220,240,255,0.25)', land: '#3aa04a', blood: '#3a8aff', eye: '#bfe8ff',
    },
    mars: {
      name: 'Marsworm', hp: 12, headR: 11.5, r0: 10, r1: 5, spacing: 7, maxLen: 10, minLen: 3, speed: 64, turn: 3.6, bite: 1, noMound: true,
      body: '#c4502a', body2: '#b04624', outline: '#2a0a04', hi: 'rgba(255,210,180,0.25)', crater: '#7a2810', blood: '#8a2e14', eye: '#ffd23a',
    },
    neptunus: {
      name: 'Neptunusworm', hp: 18, headR: 13, r0: 12, r1: 6, spacing: 8.5, maxLen: 11, minLen: 4, speed: 44, turn: 2.6, bite: 1, noMound: true,
      body: '#2a48b8', body2: '#2440a6', outline: '#050c2a', hi: 'rgba(200,230,255,0.3)', band: '#4a7ae8', blood: '#9ad8ff', eye: '#bff0ff',
    },
    pluto: {
      name: 'Plutoworm', hp: 5, headR: 8.5, r0: 7.5, r1: 3.5, spacing: 5.5, maxLen: 7, minLen: 3, speed: 102, turn: 4.6, bite: 1, noMound: true,
      body: '#cbb8a4', body2: '#bfaa96', outline: '#2a1e16', hi: 'rgba(255,250,240,0.3)', heart: '#f2e8dc', blood: '#a8988a', eye: '#e8dccc',
    },
    saturnus: {
      name: 'Saturnusworm', hp: 20, headR: 13.5, r0: 12, r1: 6.5, spacing: 8.5, maxLen: 12, minLen: 4, speed: 50, turn: 2.8, bite: 1, noMound: true,
      body: '#d8b46a', body2: '#c8a45a', outline: '#2a1e08', hi: 'rgba(255,245,210,0.3)', band: '#b0843e', ring: '#ecdcaa', blood: '#c8a45a', eye: '#ffe8a0',
    },
    galaxy: {
      boss: true, name: 'De Galaxyworm', hp: 400, headR: 24, r0: 21, r1: 9, spacing: 13, maxLen: 20, minLen: 7, bite: 2, speed: 56, turn: 2.4, noMound: true,
      body: '#1c1240', body2: '#22164c', outline: '#04020c', hi: 'rgba(200,170,255,0.16)', neb: '#c45aff', blood: '#c45aff', eye: '#fff6d8',
    },
  });

  {
    const in0 = initSnake9;
    initSnake9 = function (sn, o) {
      in0(sn, o);
      const k = sn.kind;
      if (k === 'aarde') sn.moon14 = { a: rnd(TAU), hp: 3 };
      else if (k === 'mars') { sn.mode = 'move'; sn.cd = rnd(1.6, 2.6); }
      else if (k === 'neptunus') { sn.mode = 'move'; sn.cd = rnd(1.6, 2.6); }
      else if (k === 'pluto') { sn.cloak = 1; sn.quipCd = rnd(4, 9); }
      else if (k === 'saturnus') { sn.cd = rnd(1.8, 2.8); sn.ringOut14 = false; }
    };
  }
  const MOON_R = 6.5;
  const moonPos14 = (sn) => { const r = sn.headR + 17; return [sn.x + Math.cos(sn.moon14.a) * r, sn.y + Math.sin(sn.moon14.a) * r]; };
  function hurtEach14(test, n, x, y) {
    for (const Q of livePlayers14()) if (!(Q.dying > 0) && test(Q)) withPlayer(Q, () => Q.hurt(n, x, y));
  }

  // Aarde: keeps you close, and its moon swings round into you. Shoot the moon off first.
  AI.aarde = function (sn, room, dt) {
    const M = sn.moon14, moon = M && M.hp > 0;
    sn.mt += dt;
    keepAway(sn, room, dt, 60, 140, sn.K.speed * (moon ? 1 : 1.3));
    if (!moon) return;
    M.a += dt * 2.8;
    const [mx, my] = moonPos14(sn);
    for (let i = G.seeds.length - 1; i >= 0; i--) {
      const s = G.seeds[i], sr = 4 * (s.size || 1);
      if (s.moonHit14 || dist2(s.x, s.y, mx, my) > (MOON_R + sr) * (MOON_R + sr)) continue;
      if (s.pierce) s.moonHit14 = true; else G.seeds.splice(i, 1);
      M.hp--;
      burst(mx, my, 5, '#c8c8d0', { min: 20, max: 70, lmin: 0.2, lmax: 0.4 });
      if (M.hp <= 0) {
        burst(mx, my, 14, '#d8d8e0', { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.7 });
        floatText(mx, my - 14, 'MAAN KAPOT', '#d8d8e0'); Sfx.crunch();
        return;
      }
    }
    hurtEach14((Q) => dist2(Q.x, Q.y, mx, my) < (MOON_R + Q.r - 2) * (MOON_R + Q.r - 2), 1, mx, my);
  };

  // Mars: the god of war. Kicks up red dust, then charges in a straight line.
  AI.mars = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    if (sn.mode === 'wind') {
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
      sn.ang = turnToward(sn.ang, toP, 6 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.05;
      if (Math.random() < dt * 30) addP({ kind: 'dot', x: sn.x + rnd(-8, 8), y: sn.y + rnd(-8, 8), vx: rnd(-40, 40), vy: rnd(-40, 10), r: rnd(1.5, 3), life: rnd(0.4, 0.7), col: 'rgba(200,90,50,0.5)', drag: 2 });
      if (sn.mt > 0.55) { sn.mode = 'rush'; sn.mt = 0; sn.rushA = sn.ang; Sfx.whoosh10(); }
      return;
    }
    if (sn.mode === 'rush') {
      steerMove(sn, room, sn.rushA, 300, 1.1, dt);
      if (Math.random() < dt * 40) addP({ kind: 'dot', x: sn.x, y: sn.y, vx: rnd(-20, 20), vy: rnd(-20, 20), r: rnd(1.5, 3.2), life: rnd(0.4, 0.8), col: 'rgba(196,80,42,0.45)', drag: 2 });
      if (sn.mt > 0.7 || sn.blockT > 0.1) { sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.8, 2.8); }
      return;
    }
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 110, 210, sn.K.speed);
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 300) { sn.mode = 'wind'; sn.mt = 0; Sfx.hiss(0.7); }
  };

  // Neptunus: far and cold. Blows a fan of ice that slows you down.
  AI.neptunus = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    if (sn.mode === 'blow') {
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
      sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang;
      if (sn.mt > 0.45) {
        const vs = G.levelDef.venomSpeed * 0.9;
        for (let i = -1; i <= 1; i++) { const v = spawnVenom(sn.x + Math.cos(toP) * sn.headR, sn.y + Math.sin(toP) * sn.headR, toP + i * 0.24, vs, '#9ad8ff'); v.kind = 'ice14'; v.r = 5; }
        sn.mouth = 1; sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.2, 3.2); Sfx.spit();
      }
      return;
    }
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 150, 260, sn.K.speed);
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 380 && clearLine(room, sn.x, sn.y, P.x, P.y)) { sn.mode = 'blow'; sn.mt = 0; Sfx.hiss(0.6); }
  };

  // Pluto: small, fast, and hard to see from far away. Still a planet, it says.
  AI.pluto = function (sn, room, dt) {
    const P = G.player, d = dist(sn.x, sn.y, P.x, P.y);
    sn.cloak = approach(sn.cloak == null ? 1 : sn.cloak, d < 140 ? 1 : 0.3, dt * 2);
    AI.grub(sn, room, dt);
    sn.quipCd -= dt;
    if (sn.quipCd <= 0) { sn.quipCd = rnd(8, 14); if (Math.random() < 0.5) floatText(sn.x, sn.y - 18, 'WEL EEN PLANEET', '#e8dccc'); }
  };

  // Saturnus: throws its ring like a boomerang. Without the ring it waits for it to come back.
  AI.saturnus = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    const { d, toP } = keepAway(sn, room, dt, 140, 250, sn.K.speed);
    if (sn.ringOut14) return;
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 340) {
      const F = fx14(room), r = sn.headR + 8;
      F.rings.push({ x: sn.x + Math.cos(toP) * r, y: sn.y + Math.sin(toP) * r, vx: Math.cos(toP) * 270, vy: Math.sin(toP) * 270, t: 0, out: 0.85, spin: 0, r: 12, owner: sn, friendly: false, back: false, hitP: new Set() });
      sn.ringOut14 = true; sn.cd = rnd(2.4, 3.4); Sfx.whoosh10();
    }
  };

  // its ice slows you down
  {
    const vh0 = venomHit9;
    venomHit9 = function (v, P) {
      const r = vh0(v, P);
      if (r === 0 && v.kind === 'ice14' && !(P.inv > 0) && !(P.dashT > 0)) { P.syrupT = Math.max(P.syrupT || 0, 1.4); P.ice14T = 1.4; floatText(P.x, P.y - 24, 'KOUD', '#bfe8ff'); }
      return r;
    };
  }

  /* ================================================================== De Galaxyworm */
  BOSS_INFO.galaxy = { title: 'De Galaxyworm', sub: 'A hundred billion stars in one worm. It ate every star you ever wished on.' };
  BOSS_TPL10.galaxy = ['...........', '.#.......#.', '...#...#...', '...........', '...........', '...........', '...#...#...', '.#.......#.', '...........'];
  CUSTOM_BOSS9.galaxy = 1;
  CHAOS_BOSSES9.push('galaxy');
  BOSS_ORDER10.push('galaxy');
  RUSH_ORDER.splice(Math.max(0, RUSH_ORDER.indexOf('ender')), 0, 'galaxy');
  RUSH_SET.galaxy = SET;

  BOSS9_INIT.galaxy = (sn) => {
    sn.mode = 'move'; sn.cd = 2.2; sn.spiralCd = 3; sn.birthCd = 6; sn.holeCd = 7; sn.meteorCd = 5; sn.novaCd = 2;
    sn.spin14 = 0; sn.charge14 = 0; sn.armA = 0; sn.armT = 0; sn.armDir = 1;
    sn.conCd = 4; sn.cometCd = 99; sn.pulsarCd = 99; sn.beamA14 = 0; sn.beamN14 = 0;
  };
  function birth14(room, sn, n, kinds) {
    let made = 0;
    for (let i = 0; i < n; i++) {
      if (room.snakes.filter((s) => s.alive && PLANET[s.kind]).length >= 5) break;
      const a = rnd(TAU), f = nearestFreeCell(room, sn.x + Math.cos(a) * 64, sn.y + Math.sin(a) * 64);
      room.snakes.push(new Snake(pick(kinds), f.x, f.y, { emerge: false, spawnTime: 0.5, delay: i * 0.25, ang: a }));
      burst(f.x, f.y, 12, '#c45aff', { min: 30, max: 110, lmin: 0.3, lmax: 0.6, glow: true });
      made++;
    }
    if (made) { floatText(sn.x, sn.y - 44, 'NIEUWE PLANETEN', '#e8d8ff', true); Sfx.warp(); }
  }
  // stage changes come from the shared boss stage system (src/85-v14-stages.js: DEF.galaxy sets sn.stage14)
  // a constellation: stars around you, then lines between them burn. Stand still inside, or dash out early.
  function constellation14(room, sn, P, ph) {
    const n = 3 + ph, a0 = rnd(TAU), pts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + rnd(-0.2, 0.2), r = rnd(80, 140);
      pts.push({ x: clamp(P.x + Math.cos(a) * r, 20, RW - 20), y: clamp(P.y + Math.sin(a) * r, 20, RH - 20) });
    }
    fx14(room).cons.push({ pts, t: 0, warn: ph >= 4 ? 1.05 : 1.3, on: 0.55, ring: ph >= 2, hitP: new Set() });
    floatText(P.x, P.y - 40, 'STERRENBEELD', '#bfe0ff', true); Sfx.zap();
  }
  AI.galaxy = function (sn, room, dt) {
    const P = G.player, vs = G.levelDef.venomSpeed, ph = sn.stage14 || 1, F = fx14(room);
    sn.mt += dt; sn.spin14 += dt * (ph >= 3 ? 1.7 : 1);
    if (sn.mode === 'spiral') {
      sn.drawAng = sn.ang + Math.sin(sn.mt * 6) * 0.05;
      sn.armT -= dt;
      if (sn.armT <= 0) {
        sn.armT = ph === 1 ? 0.17 : ph === 4 ? 0.11 : 0.13;
        const arms = ph === 1 ? 3 : ph === 4 ? 5 : 4;
        // from stage 3 the arms turn back half way: the spiral folds
        if (ph >= 3 && Math.abs(sn.mt - 1.3) < 0.07) sn.armDir = -sn.armDir;
        sn.armA += 0.3 * sn.armDir;
        for (let i = 0; i < arms; i++) { const v = spawnVenom(sn.x, sn.y, sn.armA + (i * TAU) / arms, vs * 0.6, '#fff2b0'); v.kind = 'star14'; v.r = 5; v.life = 3.4; }
      }
      if (sn.mt > (ph === 1 ? 2.2 : 2.6)) { sn.mode = 'move'; sn.mt = 0; }
      return;
    }
    if (sn.mode === 'nova') {
      sn.charge14 = Math.min(1, sn.mt / 2.2);
      sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.05 * sn.charge14;
      if (Math.random() < dt * 40) { const a = rnd(TAU), r = rnd(70, 150); addP({ kind: 'dot', x: sn.x + Math.cos(a) * r, y: sn.y + Math.sin(a) * r, vx: -Math.cos(a) * 140, vy: -Math.sin(a) * 140, r: rnd(1, 2.2), life: 0.6, col: '#fff6d8', glow: true, drag: 0 }); }
      if (sn.mt >= 2.2) {
        shock14(room, sn.x, sn.y, { hostile: true, dmg: 2, speed: 300, max: 640, col: '#fff6d8' });
        sn.charge14 = 0; sn.mode = 'move'; sn.mt = 0; sn.novaCd = ph >= 4 ? rnd(10, 12) : rnd(12, 15);
      }
      return;
    }
    // Komeet: winds up, then streaks across the room and leaves a tail of ice that drifts apart
    if (sn.mode === 'cometWind') {
      sn.ang = turnToward(sn.ang, Math.atan2(P.y - sn.y, P.x - sn.x), 7 * dt); sn.drawAng = sn.ang + Math.sin(sn.mt * 45) * 0.06; sn.mouth = 1;
      if (sn.mt > 0.6) { sn.mode = 'comet'; sn.mt = 0; sn.cometA = sn.ang; sn.tailT = 0; sn.tailS = 1; Sfx.whoosh10(); }
      return;
    }
    if (sn.mode === 'comet') {
      steerMove(sn, room, sn.cometA, ph >= 4 ? 470 : 420, 0.9, dt);
      sn.tailT -= dt;
      if (sn.tailT <= 0) {
        sn.tailT = 0.055; sn.tailS = -sn.tailS;
        const v = spawnVenom(sn.x, sn.y, sn.cometA + sn.tailS * Math.PI / 2, vs * 0.32, '#9ad8ff'); v.kind = 'ice14'; v.r = 4.5; v.life = 2.6;
      }
      if (sn.mt > 0.8 || sn.blockT > 0.1) { sn.mode = 'move'; sn.mt = 0; G.shake = Math.max(G.shake || 0, 5); }
      return;
    }
    // Pulsar: it stops and two (stage 4: three) beams sweep the room. A rock between you and the worm blocks them.
    if (sn.mode === 'pulsar') {
      sn.drawAng = sn.ang + Math.sin(sn.mt * 20) * 0.03;
      const warm = 0.9, dur = 2.6;
      sn.beamA14 += dt * (sn.mt < warm ? 0.25 : 1.05) * sn.armDir;
      if (sn.mt >= warm) for (const Q of livePlayers14()) {
        if (Q.dying > 0 || Q.dashT > 0) continue;
        const qa = Math.atan2(Q.y - sn.y, Q.x - sn.x), d = dist(Q.x, Q.y, sn.x, sn.y);
        for (let i = 0; i < sn.beamN14; i++) {
          const off = Math.abs(angDiff(sn.beamA14 + (i * TAU) / sn.beamN14, qa)) * d;
          if (d > sn.headR && off < Q.r + 6 && clearLine(room, sn.x, sn.y, Q.x, Q.y)) { withPlayer(Q, () => Q.hurt(1, sn.x, sn.y)); break; }
        }
      }
      if (sn.mt >= warm + dur) { sn.mode = 'move'; sn.mt = 0; sn.beamN14 = 0; }
      return;
    }
    sn.mode = 'move';
    keepAway(sn, room, dt, 150, 270, sn.K.speed * (ph >= 4 ? 1.25 : ph === 3 ? 1.15 : 1));
    sn.cd -= dt; sn.spiralCd -= dt; sn.birthCd -= dt; sn.holeCd -= dt; sn.meteorCd -= dt; sn.novaCd -= dt;
    sn.conCd -= dt; sn.cometCd -= dt; sn.pulsarCd -= dt;
    if (P.dying > 0) return;
    if (ph >= 3 && sn.novaCd <= 0) { sn.mode = 'nova'; sn.mt = 0; sn.charge14 = 0; Sfx.charge(); floatText(sn.x, sn.y - 44, 'SUPERNOVA', '#fff6d8', true); return; }
    if (ph >= 3 && sn.pulsarCd <= 0) {
      sn.pulsarCd = rnd(11, 13); sn.mode = 'pulsar'; sn.mt = 0; sn.beamN14 = ph >= 4 ? 3 : 2;
      sn.beamA14 = Math.atan2(P.y - sn.y, P.x - sn.x) + Math.PI / sn.beamN14; sn.armDir = Math.random() < 0.5 ? 1 : -1;
      floatText(sn.x, sn.y - 44, 'PULSAR', '#bfe0ff', true); Sfx.charge();
      return;
    }
    if (sn.conCd <= 0 && !F.cons.length) { sn.conCd = ph >= 3 ? rnd(7, 9) : rnd(9, 11); constellation14(room, sn, P, ph); return; }
    if (ph >= 2 && sn.cometCd <= 0) { sn.cometCd = rnd(7, 9); sn.mode = 'cometWind'; sn.mt = 0; Sfx.hiss(0.9); floatText(sn.x, sn.y - 44, 'KOMEET', '#9ad8ff', true); return; }
    if (sn.spiralCd <= 0) { sn.spiralCd = rnd(6.5, 8); sn.mode = 'spiral'; sn.mt = 0; sn.armT = 0; sn.armA = rnd(TAU); sn.armDir = Math.random() < 0.5 ? 1 : -1; Sfx.zap(); return; }
    if (sn.birthCd <= 0) { sn.birthCd = rnd(9, 11); birth14(room, sn, 2, ph === 1 ? ['pluto', 'pluto', 'mars', 'aarde'] : ['pluto', 'mars', 'aarde', 'saturnus', 'neptunus']); return; }
    if (ph >= 2 && sn.holeCd <= 0) {
      sn.holeCd = rnd(10, 12);
      const a = rnd(TAU), c2 = nearestFreeCell(room, clamp(P.x + Math.cos(a) * 110, 50, RW - 50), clamp(P.y + Math.sin(a) * 110, 50, RH - 50));
      hole14(room, c2.x, c2.y, { hostile: true, life: 4.5, r: 24 });
      return;
    }
    if (ph >= 2 && sn.meteorCd <= 0) {
      sn.meteorCd = rnd(6, 8);
      const n = ph >= 3 ? 6 : 4;
      for (let i = 0; i < n; i++) meteor14(room, clamp(P.x + (i ? rnd(-120, 120) : 0), 24, RW - 24), clamp(P.y + (i ? rnd(-100, 100) : 0), 24, RH - 24), { hostile: true, warn: 1.1 + i * 0.18, r: 30 });
      Sfx.whoosh10();
      return;
    }
    if (sn.cd <= 0) {
      sn.cd = ph >= 4 ? rnd(1.0, 1.4) : rnd(1.3, 1.9);
      const base = Math.atan2(P.y - sn.y, P.x - sn.x);
      for (let i = -2; i <= 2; i++) { const v = spawnVenom(sn.x, sn.y, base + i * 0.2, vs, '#fff2b0'); v.kind = 'star14'; v.r = 5; }
      sn.mouth = 1; Sfx.spit();
    }
  };
  // what each new stage starts with (called by the stage system)
  function galaxyStage14(sn, room, ph) {
    if (ph === 2) { sn.holeCd = 1.2; sn.meteorCd = 3; sn.cometCd = 4.5; }
    if (ph === 3) { sn.novaCd = 1.2; sn.pulsarCd = 6; }
    if (ph === 4) {
      // Singulariteit: the event horizon. Outside the ring space itself hurts, and the ring keeps closing.
      const F = fx14(room);
      F.horizon = { x: RW / 2, y: RH / 2, R: Math.hypot(RW, RH) / 2, max: Math.hypot(RW, RH) / 2, t: 0 };
      sn.novaCd = Math.max(sn.novaCd, 4); sn.pulsarCd = 2.5;
    }
  }

  /* ================================================================== shockwaves, black holes, meteors, rings */
  // a ring that grows out from x, y. Hostile waves hurt the apples they reach, unless a rock is in the way.
  function shock14(room, x, y, o) {
    const s = Object.assign({ x, y, R: 0, speed: 320, max: 620, t: 0, hostile: false, snakes: false, dmg: 1, snDmg: null, clearVenom: false, col: '#fff6d8', hitP: new Set(), hitS: new Set() }, o);
    fx14(room).shocks.push(s);
    G.shake = Math.max(G.shake || 0, s.hostile ? 9 : 12);
    flashLight(x, y, 260, 1, 0.5);
    burst(x, y, 30, s.col, { min: 80, max: 320, rmin: 1.4, rmax: 3, lmin: 0.4, lmax: 0.9, glow: true });
    Sfx.boom();
    return s;
  }
  function hole14(room, x, y, o) {
    const h = Object.assign({ x, y, t: 0, life: 3, r: 22, hostile: false, dmg: 1, owner: null, spin: rnd(TAU) }, o);
    fx14(room).holes.push(h);
    Sfx.warp();
    return h;
  }
  function meteor14(room, x, y, o) {
    const m = Object.assign({ x, y, t: 0, warn: 1, r: 30, hostile: false, dmg: 1, from: rnd(-0.6, -0.2) }, o);
    fx14(room).meteors.push(m);
    return m;
  }
  function update14(dt, room) {
    const F = room.fx14; if (!F) return;
    const fight = fighting10(room);
    if (!fight) {
      F.nova = null;
      F.holes = F.holes.filter((h) => !h.hostile);
      F.meteors = F.meteors.filter((m) => !m.hostile);
      F.cons = []; F.horizon = null;
    }
    if (!F.cons) F.cons = [];
    // constellations: the lines burn for a moment, then (stage 2 on) every star throws a small ring
    for (let i = F.cons.length - 1; i >= 0; i--) {
      const K = F.cons[i]; K.t += dt;
      if (K.t >= K.warn && !K.fired) {
        K.fired = true; Sfx.zap(); G.shake = Math.max(G.shake || 0, 4);
        if (K.ring) for (const q of K.pts) for (let j = 0; j < 4; j++) { const v = spawnVenom(q.x, q.y, j * TAU / 4 + K.t, G.levelDef.venomSpeed * 0.45, '#bfe0ff'); v.kind = 'star14'; v.r = 4; v.life = 2; }
      }
      if (K.t >= K.warn) for (const Q of livePlayers14()) {
        if (Q.dying > 0 || Q.dashT > 0 || K.hitP.has(Q)) continue;
        for (let j = 0; j < K.pts.length; j++) {
          const a = K.pts[j], b = K.pts[(j + 1) % K.pts.length];
          if (segDist14(Q.x, Q.y, a.x, a.y, b.x, b.y) < Q.r + 3) { K.hitP.add(Q); withPlayer(Q, () => Q.hurt(1, Q.x, Q.y)); break; }
        }
      }
      if (K.t >= K.warn + K.on) F.cons.splice(i, 1);
    }
    // the event horizon (Galaxyworm stage 4): closes to 165 px over 6 s, holds 3 s, opens over 2 s, rests 2 s
    if (F.horizon) {
      const Hz = F.horizon; Hz.t = (Hz.t + dt) % 13;
      const u = Hz.t < 6 ? Hz.t / 6 : Hz.t < 9 ? 1 : Hz.t < 11 ? 1 - (Hz.t - 9) / 2 : 0;
      Hz.R = lerp(Hz.max, 165, u * u * (3 - 2 * u));
      for (const Q of livePlayers14()) {
        if (Q.dying > 0) continue;
        const d = dist(Q.x, Q.y, Hz.x, Hz.y);
        if (d < Hz.R - Q.r) { Q.hor14 = 0; continue; }
        const a = Math.atan2(Hz.y - Q.y, Hz.x - Q.x);
        let nx = Q.x + Math.cos(a) * 55 * dt, ny = Q.y + Math.sin(a) * 55 * dt;
        [nx, ny] = Q.flyer ? resolveFly10(room, nx, ny, Q.r) : resolveTiles(room, nx, ny, Q.r);
        Q.x = clamp(nx, Q.r, RW - Q.r); Q.y = clamp(ny, Q.r, RH - Q.r);
        Q.hor14 = (Q.hor14 || 0) + dt;
        if (Q.hor14 >= 0.8) { Q.hor14 = 0; withPlayer(Q, () => Q.hurt(1, Hz.x, Hz.y)); }
      }
    }
    // the dying star of a supernova room
    if (F.nova) {
      const N = F.nova; N.t += dt;
      if (!N.warned && N.t >= N.fuse - 2) { N.warned = true; floatText(N.x, N.y - 28, 'SUPERNOVA', '#fff6d8', true); Sfx.charge(); }
      const sr = starR14(N);
      hurtEach14((Q) => dist2(Q.x, Q.y, N.x, N.y) < (sr + Q.r - 3) * (sr + Q.r - 3), 1, N.x, N.y);
      if (N.t >= N.fuse) {
        F.nova = null; F.novaT = rnd(4.5, 7);
        shock14(room, N.x, N.y, { hostile: true, snakes: true, dmg: 1, speed: 320, max: 640, snDmg: (sn) => 6 + sn.maxHp * 0.35 });
      }
    } else if (fight && room.mod === 'supernova') {
      if (F.novaT == null) F.novaT = rnd(2.5, 4);
      F.novaT -= dt;
      if (F.novaT <= 0) {
        const P = G.player;
        let at = null;
        for (let i = 0; i < 14 && !at; i++) {
          const c2 = nearestFreeCell(room, rnd(70, RW - 70), rnd(60, RH - 60));
          if (livePlayers14().every((Q) => dist(Q.x, Q.y, c2.x, c2.y) > 150)) at = c2;
        }
        at = at || nearestFreeCell(room, RW - P.x, RH - P.y);
        F.nova = { x: at.x, y: at.y, t: 0, fuse: rnd(6.5, 8), warned: false, seed: rnd(10) };
        Sfx.stinger();
      }
    }
    // shockwaves
    for (let i = F.shocks.length - 1; i >= 0; i--) {
      const s = F.shocks[i];
      s.t += dt; s.R += s.speed * dt;
      if (s.hostile) for (const Q of livePlayers14()) {
        if (Q.dying > 0 || s.hitP.has(Q) || dist(Q.x, Q.y, s.x, s.y) > s.R + Q.r) continue;
        s.hitP.add(Q);
        if (clearLine(room, s.x, s.y, Q.x, Q.y)) withPlayer(Q, () => Q.hurt(s.dmg, s.x, s.y));
        else floatText(Q.x, Q.y - 26, 'GEDEKT', '#9ad8ff');
      }
      if (s.snakes) for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed || s.hitS.has(sn) || dist(sn.x, sn.y, s.x, s.y) > s.R + sn.headR) continue;
        s.hitS.add(sn);
        if (s.hostile && !clearLine(room, s.x, s.y, sn.x, sn.y)) continue;
        sn.hurt(s.snDmg ? s.snDmg(sn) : 4, sn.x, sn.y);
        sn.stagger = Math.max(sn.stagger || 0, 0.4);
      }
      if (s.clearVenom) for (let j = G.venom.length - 1; j >= 0; j--) { const v = G.venom[j]; if (!v.friendly && dist(v.x, v.y, s.x, s.y) < s.R) { burst(v.x, v.y, 3, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true }); G.venom.splice(j, 1); } }
      if (s.R >= s.max) F.shocks.splice(i, 1);
    }
    // black holes: hostile ones pull the apples, yours pull the snakes and chew on them
    for (let i = F.holes.length - 1; i >= 0; i--) {
      const h = F.holes[i];
      h.t += dt; h.spin += dt * 3;
      const k = Math.min(1, h.t / 0.4) * Math.min(1, Math.max(0, h.life - h.t) / 0.4);
      if (h.hostile) {
        for (const Q of livePlayers14()) {
          if (Q.dying > 0 || Q.dashT > 0) continue;
          const d = dist(Q.x, Q.y, h.x, h.y);
          if (d > 260 || d < 1) continue;
          const a = Math.atan2(h.y - Q.y, h.x - Q.x), str = (35 + 85 * (1 - d / 260)) * k;
          let nx = Q.x + Math.cos(a) * str * dt, ny = Q.y + Math.sin(a) * str * dt;
          [nx, ny] = Q.flyer ? resolveFly10(room, nx, ny, Q.r) : resolveTiles(room, nx, ny, Q.r);
          Q.x = clamp(nx, Q.r, RW - Q.r); Q.y = clamp(ny, Q.r, RH - Q.r);
        }
        hurtEach14((Q) => dist(Q.x, Q.y, h.x, h.y) < h.r * 0.55 + Q.r, 1, h.x, h.y);
      } else {
        for (const sn of room.snakes) {
          if (!sn.canBeHit() || sn.burrowed) continue;
          const d = dist(sn.x, sn.y, h.x, h.y);
          if (d > 210) continue;
          if (!sn.isBoss && d > 4) {
            const a = Math.atan2(h.y - sn.y, h.x - sn.x), str = 150 * (1 - d / 210) * k;
            let nx = sn.x + Math.cos(a) * str * dt, ny = sn.y + Math.sin(a) * str * dt;
            [nx, ny] = resolveTiles(room, nx, ny, sn.headR * 0.8);
            sn.moveTo(clamp(nx, 12, RW - 12), clamp(ny, 12, RH - 12));
          }
          sn.chew14 = (sn.chew14 || 0) - dt;
          if (d < 64 && sn.chew14 <= 0) { sn.chew14 = 0.25; sn.hurt(h.dmg * (sn.isBoss ? 0.5 : 1), h.x, h.y, true); }
        }
        if (h.t < h.life) for (let j = G.venom.length - 1; j >= 0; j--) { const v = G.venom[j]; if (!v.friendly && dist2(v.x, v.y, h.x, h.y) < 40 * 40) G.venom.splice(j, 1); }
      }
      if (h.t >= h.life) F.holes.splice(i, 1);
    }
    // meteors: a red circle first, then the rock
    for (let i = F.meteors.length - 1; i >= 0; i--) {
      const m = F.meteors[i]; m.t += dt;
      if (m.t < m.warn) continue;
      F.meteors.splice(i, 1);
      burst(m.x, m.y, 18, '#ff9a4a', { min: 50, max: 180, rmin: 1.2, rmax: 2.8, lmin: 0.3, lmax: 0.7, glow: true });
      burst(m.x, m.y, 10, '#6a5a50', { kind: 'shard', min: 40, max: 140, lmin: 0.3, lmax: 0.6 });
      addP({ kind: 'ring', x: m.x, y: m.y, vx: 0, vy: 0, r: m.r * 0.6, life: 0.35, col: '#ffb46a', drag: 0 });
      G.shake = Math.max(G.shake || 0, 5); Sfx.thud();
      if (m.hostile) hurtEach14((Q) => dist(Q.x, Q.y, m.x, m.y) < m.r + Q.r - 4, 1, m.x, m.y);
      else for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(m.x, m.y, m.r)) { sn.hurt(m.dmg * (sn.isBoss ? 0.7 : 1), m.x, m.y); sn.stagger = Math.max(sn.stagger || 0, 0.3); }
    }
    // Saturn rings, the worms' and yours: out, then back to whoever threw it
    for (let i = F.rings.length - 1; i >= 0; i--) {
      const g = F.rings[i], o = g.owner;
      g.t += dt; g.spin += dt * 9;
      const gone = g.friendly ? !(o && o.dying <= 0 && !o.ghost14) : !(o && o.alive && o.state === 'active');
      if (gone || g.t > 4) {
        burst(g.x, g.y, 8, g.friendly ? '#ffe08a' : '#ecdcaa', { min: 20, max: 80, lmin: 0.2, lmax: 0.5, glow: true });
        if (!g.friendly && o) o.ringOut14 = false;
        F.rings.splice(i, 1); continue;
      }
      if (!g.back && g.t >= g.out) { g.back = true; if (g.hitP) g.hitP = new Set(); }
      if (g.back) {
        const a = Math.atan2(o.y - g.y, o.x - g.x), sp = g.friendly ? 420 : 300;
        g.vx = lerp(g.vx, Math.cos(a) * sp, Math.min(1, dt * 6)); g.vy = lerp(g.vy, Math.sin(a) * sp, Math.min(1, dt * 6));
      }
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (!g.back) { const t0 = room.tileAt(g.x, g.y); if ((t0 && t0.shots) || g.x < 8 || g.y < 8 || g.x > RW - 8 || g.y > RH - 8) g.back = true; }
      g.x = clamp(g.x, 6, RW - 6); g.y = clamp(g.y, 6, RH - 6);
      if (g.back && dist(g.x, g.y, o.x, o.y) < (g.friendly ? 16 : o.headR + 6)) { if (!g.friendly) o.ringOut14 = false; F.rings.splice(i, 1); continue; }
      if (!g.friendly) {
        for (const Q of livePlayers14()) {
          if (Q.dying > 0 || g.hitP.has(Q) || dist(Q.x, Q.y, g.x, g.y) > g.r + Q.r - 3) continue;
          g.hitP.add(Q); withPlayer(Q, () => Q.hurt(1, g.x, g.y));
        }
      } else {
        const hit = g.back ? g.hitB : g.hitO;
        for (const sn of room.snakes) {
          if (!sn.canBeHit() || sn.burrowed || hit.has(sn) || !sn.hitTest(g.x, g.y, g.r)) continue;
          hit.add(sn); sn.hurt(g.dmg, g.x, g.y);
          burst(g.x, g.y, 5, '#ffe08a', { min: 20, max: 80, lmin: 0.2, lmax: 0.4, glow: true });
        }
      }
    }
  }
  function segDist14(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, u = clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1);
    return Math.hypot(px - ax - dx * u, py - ay - dy * u);
  }
  const starR14 = (N) => 7 + 10 * Math.min(1, N.t / N.fuse);
  {
    const cb0 = combat9;
    combat9 = function (room) {
      cb0(room);
      if (room.mod === 'supernova') { const F = fx14(room); F.nova = null; F.novaT = null; }
    };
    const ur0 = updateRoom9;
    updateRoom9 = function (dt, room, frozen) {
      ur0(dt, room, frozen);
      // once per frame, not once per apple: every apple is checked inside
      if (room.fx14 && !frozen && dt > 0) safe(() => update14(dt, room));
    };
    // a supernova room gets its state ready before the first frame
    Hooks.layer('Game.enterRoom', 'v14 ruimte', function (next, room, entry) {
      const r = next.call(this, room, entry);
      if (room && room.mod === 'supernova') fx14(room);
      return r;
    });
  }

  /* ================================================================== eight space powerups, only out here */
  const NEW = {
    maan14: { w: 0.9, name: 'De Maan', desc: 'A small moon circles you. It stops venom and bumps snakes for 70% seed damage. Found in De Ruimte.', apply(p) { p.moon14 = true; } },
    ringen14: { w: 0.8, name: 'Ringen van Saturnus', desc: 'Every 6th shot also throws a ring. It flies through every snake, turns and comes back to you: 120% damage both ways. Found in De Ruimte.', apply(p) { p.ring14 = true; p.ringN14 = 0; } },
    rodeplaneet14: { w: 0.8, name: 'Rode Planeet', desc: 'Mars is the god of war. Every kill starts 3 seconds of war: 30% faster shots and 10% harder seeds. Found in De Ruimte.', apply(p) { p.mars14 = true; } },
    neptunus14: { w: 0.8, name: 'Neptunusijs', desc: 'Seeds are ice from Neptune. Every hit slows the snake, every 4th hit on the same snake freezes it for a moment. Found in De Ruimte.', apply(p) { p.nepIce14 = true; } },
    dwerg14: { w: 0.8, name: 'Dwergplaneet', desc: 'You shrink like Pluto: 20% smaller, so venom misses more, and 8% faster. Seeds 10% smaller. Still a planet. Found in De Ruimte.', apply(p) { p.r *= 0.8; p.speed *= 1.08; p.seedSize *= 0.9; p.dwarf14 = true; } },
    meteoor14: { w: 0.7, name: 'Meteorenregen', desc: 'Every 6 seconds in a fight a meteor drops on the healthiest snake: 3x seed damage where it lands. Found in De Ruimte.', apply(p) { p.meteor14 = true; p.meteorT14 = 4; } },
    zwartgat14: { rare: true, name: 'Zwart Gat', desc: 'Every 12 kills a black hole opens where the last snake died. For 3 seconds it pulls every snake in and chews on them. Bosses only get chewed. Found in De Ruimte.', apply(p) { p.hole14 = true; p.holeN14 = 0; } },
    supernova14: { rare: true, name: 'Supernova', desc: 'A bite that leaves you on 2 apples or less makes you go supernova: a shockwave hits every snake for 8x seed damage (bosses 3x) and wipes out all venom. Once per floor. Found in De Ruimte.', apply(p) { p.nova14 = true; p.novaUsed14 = false; } },
  };
  const SPACE_IDS = Object.keys(NEW);
  for (const id of SPACE_IDS) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); SELL[id] = NEW[id].rare ? 12 : 5; ITEM_THREAT[id] = NEW[id].rare ? 4.5 : 3; }
  const TAGS = { maan14: 'helper', ringen14: 'counted', rodeplaneet14: '', neptunus14: 'ice', dwerg14: 'tiny', meteoor14: 'sky', zwartgat14: 'counter', supernova14: 'lowhp' };
  for (const id in TAGS) tagClash13(id, TAGS[id]);

  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      Object.assign(P, { moon14: false, moonA14: 0, ring14: false, ringN14: 0, mars14: false, warT14: 0, nepIce14: false, dwarf14: false,
        meteor14: false, meteorT14: 4, hole14: false, holeN14: 0, nova14: false, novaUsed14: false, novaT14: 0, ice14T: 0 });
    };
    for (const k of ['moonA14', 'ringN14', 'warT14', 'meteorT14', 'holeN14', 'novaUsed14', 'novaT14', 'ice14T']) SELL_SKIP.add(k);
    const sl0 = sellItem9;
    sellItem9 = function (P, id) { const ok = sl0(P, id); if (ok && id === 'dwerg14') P.r /= 0.8; return ok; };
  }
  // the pool: space powerups only drop in De Ruimte, and there they turn up often
  {
    const io0 = itemOk9;
    itemOk9 = function (id, P) { if (NEW[id] && !inSpace()) return false; return io0(id, P); };
    const ni0 = nextItemId;
    nextItemId = function (legend = 0.05) {
      const P = G.player;
      if (inSpace() && P && G.run) {
        const free = SPACE_IDS.filter((id) => !P.items.includes(id) && !G.run.pending.has(id) && itemOk9(id, P));
        if (free.length && Math.random() < 0.45) {
          const rare = free.filter((id) => NEW[id].rare), norm = free.filter((id) => !NEW[id].rare);
          if (rare.length && (Math.random() < legend * 3 || !norm.length)) return weightedPick(rare);
          if (norm.length) return weightedPick(norm);
        }
      }
      return ni0.call(this, legend);
    };
  }
  // numbers
  {
    const rk0 = rateK9;
    rateK9 = function (P) { let k = rk0(P); if (P && P.warT14 > 0) k *= 0.77; return k; };
    const dk0 = dmgK9;
    dmgK9 = function (P) { let k = dk0(P); if (P && P.warT14 > 0) k *= 1.1; return k; };
    const f0 = floor9;
    floor9 = function (P) { f0(P); P.novaUsed14 = false; };
  }
  const ICE_LOOK = ['#1a3a8a', '#d8f0ff', '#7ac8ff'];
  {
    const fr0 = fire9;
    fire9 = function (P, base) {
      fr0(P, base);
      if (!P.ring14 || ++P.ringN14 % 6 !== 0) return;
      safe(() => {
        const room = G.room; if (!room) return;
        fx14(room).rings.push({ friendly: true, owner: P, x: P.x + Math.cos(base) * 14, y: P.y + Math.sin(base) * 14, vx: Math.cos(base) * 360, vy: Math.sin(base) * 360,
          t: 0, out: 0.6, spin: 0, r: 13, back: false, hitO: new Set(), hitB: new Set(), dmg: seedDmg(P) * 1.2 });
        Sfx.whoosh10();
      });
    };
    const sd0 = seed9;
    seed9 = function (P, s, o) {
      sd0(P, s, o);
      if (P.nepIce14 && !s.look9) s.look9 = ICE_LOOK;
    };
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = G.player; if (!P || !sn || !P.nepIce14) return;
      safe(() => {
        sn.slow = Math.max(sn.slow || 0, 1.2);
        sn.ice14 = (sn.ice14 || 0) + 1;
        if (sn.ice14 % 4 === 0 && sn.alive) {
          sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.2 : 0.8);
          floatText(sn.x, sn.y - 22, 'BEVROREN', '#bfe8ff');
          burst(sn.x, sn.y, 8, '#bfe8ff', { kind: 'shard', min: 30, max: 90, lmin: 0.3, lmax: 0.6 });
        }
      });
    };
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0.apply(this, arguments);
      safe(() => {
        if (sn && PLANET[sn.kind]) Meta.add('planets14');
        if (!P || !room || !sn) return;
        if (P.mars14) { if (!(P.warT14 > 0)) floatText(P.x, P.y - 30, 'OORLOG', '#ff5a3a'); P.warT14 = 3; }
        if (P.hole14) {
          P.holeN14 += sn.isBoss ? 4 : 1;
          if (P.holeN14 >= 12) {
            P.holeN14 = 0;
            hole14(room, sn.x, sn.y, { life: 3, r: 22, dmg: seedDmg(P) * 1.1, owner: P });
            floatText(sn.x, sn.y - 30, 'ZWART GAT', '#c49aff', true);
          }
        }
      });
    };
    Hooks.layer('Player.hurt', 'v14 ruimte supernova', function (next, n, sx, sy, src) {
      const hp0 = this.hp;
      const r = next.call(this, n, sx, sy, src);
      const P = this;
      if (r && P.nova14 && !P.novaUsed14 && P.hp < hp0 && P.hp > 0 && P.hp <= 4 && G.room) safe(() => {
        P.novaUsed14 = true; P.inv = Math.max(P.inv || 0, 2); P.novaT14 = 2;
        shock14(G.room, P.x, P.y, { snakes: true, clearVenom: true, speed: 420, max: 640, snDmg: (sn) => seedDmg(P) * (sn.isBoss ? 3 : 8) });
        UI.banner('Supernova', 'You blew up like a dying star. Once per floor.', 'legend');
      });
      return r;
    });
  }
  // every frame, per apple
  {
    const up0 = updatePlayer9;
    updatePlayer9 = function (P, dt, room, sp) {
      up0(P, dt, room, sp);
      safe(() => tick14(P, dt, room));
    };
  }
  const moonOf = (P) => [P.x + Math.cos(P.moonA14) * 28, P.y + Math.sin(P.moonA14) * 28];
  function tick14(P, dt, room) {
    if (P.warT14 > 0) { P.warT14 -= dt; if (Math.random() < dt * 14) addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-50, -20), r: rnd(1, 2), life: 0.4, col: '#ff5a3a', glow: true, drag: 1 }); }
    if (P.ice14T > 0) P.ice14T -= dt;
    if (P.novaT14 > 0) P.novaT14 -= dt;
    if (P.dying > 0) return;
    const fight = fighting10(room);
    if (P.moon14) {
      P.moonA14 += dt * 3.4;
      const [mx, my] = moonOf(P);
      for (let i = G.venom.length - 1; i >= 0; i--) {
        const v = G.venom[i];
        if (v.friendly || dist2(v.x, v.y, mx, my) > (8 + v.r) * (8 + v.r)) continue;
        burst(v.x, v.y, 4, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true });
        G.venom.splice(i, 1);
      }
      if (fight) for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed || (sn.moonHit14 || 0) > G.t || !sn.hitTest(mx, my, 7)) continue;
        sn.moonHit14 = G.t + 0.45;
        sn.hurt(seedDmg(P) * 0.7, mx, my);
        burst(mx, my, 5, '#d8d8e0', { min: 20, max: 70, lmin: 0.2, lmax: 0.4 });
      }
    }
    if (P.meteor14 && fight) {
      P.meteorT14 -= dt;
      if (P.meteorT14 <= 0) {
        P.meteorT14 = 6;
        let best = null;
        for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && (!best || sn.hp > best.hp)) best = sn;
        if (best) { meteor14(room, best.x, best.y, { warn: 0.7, r: 36, dmg: seedDmg(P) * 3 }); Sfx.whoosh10(); }
      }
    }
  }

  /* ================================================================== drawing: the floor */
  const NEB = ['#7a3aff', '#3a6aff', '#ff3a9a', '#2ac8d8', '#c45aff'];
  const STAR_COLS = ['#ffffff', '#e8eeff', '#fff2d8', '#d8e4ff', '#ffe0c8'];
  function spaceFloor14(c, room, L, rng) {
    const g = c.createLinearGradient(0, 0, RW, RH);
    g.addColorStop(0, '#070818'); g.addColorStop(0.5, '#0b0c24'); g.addColorStop(1, '#08061a');
    c.fillStyle = g; c.fillRect(0, 0, RW, RH);
    const n = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      const x = rng() * RW, y = rng() * RH, r = 90 + rng() * 150, col = NEB[Math.floor(rng() * NEB.length)];
      const ng = c.createRadialGradient(x, y, 0, x, y, r);
      ng.addColorStop(0, rgba(col, 0.16 + rng() * 0.08)); ng.addColorStop(0.55, rgba(col, 0.06)); ng.addColorStop(1, rgba(col, 0));
      c.fillStyle = ng; c.fillRect(0, 0, RW, RH);
    }
    // a strip of the Milky Way
    const a = rng() * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    for (let i = 0; i < 280; i++) {
      const u = (rng() - 0.5) * 720, w = (rng() + rng() + rng() - 1.5) * 42;
      const x = RW / 2 + ca * u - sa * w, y = RH / 2 + sa * u + ca * w;
      if (x < 0 || y < 0 || x > RW || y > RH) continue;
      c.fillStyle = `rgba(220,215,255,${(0.08 + rng() * 0.22).toFixed(3)})`; circle(c, x, y, 0.4 + rng() * 0.7);
    }
    for (let i = 0; i < 150; i++) {
      c.fillStyle = STAR_COLS[Math.floor(rng() * STAR_COLS.length)];
      c.globalAlpha = 0.45 + rng() * 0.55;
      circle(c, rng() * RW, rng() * RH, 0.35 + rng() * rng() * 1.4);
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 8; i++) sparkle14(c, rng() * RW, rng() * RH, 2.5 + rng() * 3, 0.55 + rng() * 0.4, STAR_COLS[Math.floor(rng() * STAR_COLS.length)]);
    // sometimes a planet far away
    if (rng() < 0.45) {
      const side = rng() < 0.5, r = 34 + rng() * 40, x = side ? -r * 0.35 + rng() * 40 : RW + r * 0.35 - rng() * 40, y = 40 + rng() * (RH - 80);
      const hues = [['#3a6ad8', '#0a1438'], ['#c4602a', '#2a0c04'], ['#d8b46a', '#2a1e08'], ['#7ac8d8', '#0a2a38']][Math.floor(rng() * 4)];
      c.save(); c.globalAlpha = 0.38;
      const pg = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
      pg.addColorStop(0, hues[0]); pg.addColorStop(1, hues[1]);
      c.fillStyle = pg; circle(c, x, y, r);
      c.restore();
    }
  }
  function sparkle14(c, x, y, r, a, col) {
    c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke();
    c.fillStyle = col; circle(c, x, y, Math.max(0.7, r * 0.28));
    c.restore();
  }
  function spaceWalls14(c, room, rng) {
    for (let i = 0; i < 70; i++) {
      const side = Math.floor(rng() * 4), u = rng(), w = rng() * (WALL - 4) + 2;
      const x = side === 0 || side === 1 ? -WALL + u * (RW + WALL * 2) : side === 2 ? -w : RW + w;
      const y = side === 0 ? -w : side === 1 ? RH + w : -WALL + u * (RH + WALL * 2);
      c.fillStyle = `rgba(230,232,255,${(0.25 + rng() * 0.55).toFixed(3)})`; circle(c, x, y, 0.4 + rng() * 0.8);
    }
    // a thin force field where the room ends, with gaps for the doors
    c.strokeStyle = 'rgba(120,160,255,0.4)'; c.lineWidth = 1.5;
    const gap = (k) => (room.doors[k] ? 36 : 0);
    c.beginPath();
    c.moveTo(-2, -2); c.lineTo(RW / 2 - gap('n'), -2); c.moveTo(RW / 2 + gap('n'), -2); c.lineTo(RW + 2, -2);
    c.moveTo(-2, RH + 2); c.lineTo(RW / 2 - gap('s'), RH + 2); c.moveTo(RW / 2 + gap('s'), RH + 2); c.lineTo(RW + 2, RH + 2);
    c.moveTo(-2, -2); c.lineTo(-2, RH / 2 - gap('w')); c.moveTo(-2, RH / 2 + gap('w')); c.lineTo(-2, RH + 2);
    c.moveTo(RW + 2, -2); c.lineTo(RW + 2, RH / 2 - gap('e')); c.moveTo(RW + 2, RH / 2 + gap('e')); c.lineTo(RW + 2, RH + 2);
    c.stroke();
  }
  {
    // no bones floating in space: drawFloor draws them between the floor and drawFloorExtras
    let noBones = false;
    const ft0 = floorTiles9;
    floorTiles9 = function (c, room, L, rng) {
      noBones = L.deco === SET && spaceRoom(room);
      if (noBones) { spaceFloor14(c, room, L, rng); return true; }
      return ft0(c, room, L, rng);
    };
    const db0 = drawBone;
    drawBone = function () { if (!noBones) return db0.apply(this, arguments); };
    const dfe0 = drawFloorExtras;
    drawFloorExtras = function () { noBones = false; return dfe0.apply(this, arguments); };
    const fd0 = floorDeco9;
    floorDeco9 = function (c, room, L, rng) {
      if (L.deco === SET && spaceRoom(room)) return true;
      return fd0(c, room, L, rng);
    };
    const dw0 = drawWalls9;
    drawWalls9 = function (c, room, L, rng) {
      dw0(c, room, L, rng);
      if (L.deco === SET && spaceRoom(room)) safe(() => spaceWalls14(c, room, rng));
    };
  }
  // asteroids and comet ice
  ROCK9.asteroid14 = (c, o, rng, L) => {
    const x = o.x, y = o.y, n = 9, R = 15 + rng() * 3, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU, r = R * (0.78 + rng() * 0.3); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.92]); }
    c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 3, y + 9, R * 1.05, R * 0.45); c.fill();
    const g = c.createRadialGradient(x - R * 0.4, y - R * 0.45, 2, x, y, R * 1.2);
    g.addColorStop(0, L.rockHi); g.addColorStop(0.55, L.rock); g.addColorStop(1, L.rockLo);
    c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath();
    c.fillStyle = g; c.fill(); c.strokeStyle = '#141018'; c.lineWidth = 1.4; c.stroke();
    for (let i = 0; i < 3; i++) {
      const cx = x + (rng() - 0.5) * R, cy = y + (rng() - 0.5) * R * 0.9, cr = 2 + rng() * 3.5;
      c.fillStyle = 'rgba(20,16,26,0.55)'; circle(c, cx, cy, cr);
      c.strokeStyle = 'rgba(220,214,230,0.3)'; c.lineWidth = 0.8; c.beginPath(); c.arc(cx, cy, cr, Math.PI * 0.9, Math.PI * 1.8); c.stroke();
    }
    c.strokeStyle = 'rgba(150,180,255,0.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, R * 0.92, Math.PI * 1.05, Math.PI * 1.55); c.stroke();
  };
  URN9.comet14 = (c, o, L, t) => {
    const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x + sh, y = o.y;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 11, 12, 4.5); c.fill();
    const pts = [[0, -13], [8, -7], [11, 3], [5, 11], [-6, 10], [-11, 2], [-8, -8]];
    c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(x + px, y + py) : c.moveTo(x + px, y + py))); c.closePath();
    const g = c.createLinearGradient(x - 10, y - 12, x + 10, y + 12);
    g.addColorStop(0, '#f2fbff'); g.addColorStop(0.5, L.clay); g.addColorStop(1, L.clayLo);
    c.fillStyle = g; c.fill(); c.strokeStyle = '#1a3048'; c.lineWidth = 1.3; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, y - 8); c.lineTo(x - 1, y + 2); c.lineTo(x + 5, y + 5); c.stroke();
    if (o.hp < o.max) { c.strokeStyle = 'rgba(10,30,50,0.9)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x + 2, y - 10); c.lineTo(x + 5, y - 2); c.lineTo(x + 1, y + 4); if (o.hp < o.max - 1) { c.lineTo(x - 5, y + 8); } c.stroke(); }
  };

  /* ================================================================== drawing: the worms */
  function globe14(c, r, base, dark, hi) {
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
    g.addColorStop(0, hi); g.addColorStop(0.45, base); g.addColorStop(1, dark);
    c.fillStyle = g; circle(c, 0, 0, r);
  }
  function night14(c, r) {
    const g = c.createRadialGradient(-r * 0.45, -r * 0.5, r * 0.55, -r * 0.2, -r * 0.2, r * 1.7);
    g.addColorStop(0, 'rgba(0,0,12,0)'); g.addColorStop(1, 'rgba(0,0,12,0.6)');
    c.fillStyle = g; circle(c, 0, 0, r);
  }
  function ringHalf14(c, H, back, col) {
    c.save(); c.rotate(-0.35);
    c.strokeStyle = col; c.lineWidth = H * 0.3;
    c.beginPath(); c.ellipse(0, 0, H * 1.85, H * 0.5, 0, back ? Math.PI : 0, back ? TAU : Math.PI); c.stroke();
    c.strokeStyle = 'rgba(60,40,10,0.45)'; c.lineWidth = H * 0.06;
    c.beginPath(); c.ellipse(0, 0, H * 1.72, H * 0.45, 0, back ? Math.PI : 0, back ? TAU : Math.PI); c.stroke();
    c.restore();
  }
  // drawn the right way up, whatever way the worm faces: planets do not turn their head
  function planetFace14(c, kind, H, t, seed, flash) {
    const K = KINDS[kind];
    if (flash) { c.fillStyle = '#ffffff'; circle(c, 0, 0, H); return; }
    c.save(); c.beginPath(); c.arc(0, 0, H, 0, TAU); c.clip();
    if (kind === 'aarde') {
      globe14(c, H, K.body, '#0a2a6a', '#7ab8ff');
      const spin = t * 0.25 + seed;
      c.fillStyle = K.land;
      for (let j = 0; j < 4; j++) {
        const a = spin + j * 1.7, x = Math.cos(a) * H * 0.62;
        if (Math.sin(a) < -0.2) continue;
        ell(c, x, (j % 2 ? -0.28 : 0.22) * H, H * (0.3 + 0.08 * (j % 3)) * (0.5 + 0.5 * Math.sin(a)), H * 0.22, 0.4 * (j % 2 ? 1 : -1)); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, 0, -H * 0.92, H * 0.45, H * 0.16); c.fill(); ell(c, 0, H * 0.94, H * 0.4, H * 0.14); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = H * 0.08;
      c.beginPath(); c.arc(-H * 0.1, -H * 0.1, H * 0.6, 3.6 + Math.sin(t * 0.3) * 0.2, 4.4); c.stroke();
    } else if (kind === 'mars') {
      globe14(c, H, K.body, '#4a1406', '#f08a5a');
      c.fillStyle = 'rgba(110,30,10,0.45)'; ell(c, H * 0.2, H * 0.15, H * 0.42, H * 0.2, 0.5); c.fill(); ell(c, -H * 0.35, -H * 0.15, H * 0.25, H * 0.14, -0.3); c.fill();
      for (const [x, y, r] of [[0.35, -0.35, 0.12], [-0.25, 0.4, 0.1], [0.5, 0.35, 0.08]]) { c.fillStyle = K.crater; circle(c, x * H, y * H, r * H); c.fillStyle = 'rgba(255,200,170,0.25)'; circle(c, (x - 0.03) * H, (y - 0.04) * H, r * H * 0.55); }
      c.fillStyle = 'rgba(255,248,240,0.9)'; ell(c, 0, -H * 0.9, H * 0.42, H * 0.2); c.fill();
    } else if (kind === 'neptunus') {
      globe14(c, H, K.body, '#060e3a', '#7aa8ff');
      c.fillStyle = 'rgba(120,170,255,0.3)';
      for (const y of [-0.5, -0.1, 0.35]) { ell(c, 0, y * H, H * 1.1, H * 0.09); c.fill(); }
      c.fillStyle = '#101a5a'; ell(c, H * 0.28, H * 0.12, H * 0.24, H * 0.13, 0.15); c.fill();
      c.fillStyle = 'rgba(240,250,255,0.75)'; ell(c, H * 0.32, H * -0.02, H * 0.16, H * 0.04); c.fill();
    } else if (kind === 'pluto') {
      globe14(c, H, K.body, '#4a3a2e', '#fff4e8');
      c.fillStyle = 'rgba(80,50,36,0.45)'; ell(c, -H * 0.45, H * 0.25, H * 0.42, H * 0.22, 0.3); c.fill();
      c.fillStyle = K.heart; c.save(); c.translate(H * 0.2, H * 0.12); c.scale(H / 10, H / 10);
      c.beginPath(); c.moveTo(0, 3.5); c.bezierCurveTo(-5, 0, -3.5, -4.5, 0, -2); c.bezierCurveTo(3.5, -4.5, 5, 0, 0, 3.5); c.fill(); c.restore();
    } else if (kind === 'saturnus') {
      globe14(c, H, K.body, '#4a3410', '#fff0c0');
      c.fillStyle = 'rgba(150,100,40,0.35)';
      for (const y of [-0.55, -0.2, 0.15, 0.5]) { ell(c, 0, y * H, H * 1.1, H * 0.08); c.fill(); }
    }
    night14(c, H);
    c.restore();
  }
  for (const k of PLANETS) {
    V9_HEADS[k] = (c, sn, H, out, fill, t, flash) => {
      c.rotate(-sn.drawAng);
      const ring = k === 'saturnus' && !sn.ringOut14;
      if (ring) ringHalf14(c, H, true, sn.K.ring);
      c.fillStyle = out; circle(c, 0, 0, H + 1.8);
      planetFace14(c, k, H, t, sn.blinkSeed || 0, flash);
      if (ring) ringHalf14(c, H, false, sn.K.ring);
    };
  }
  function eyes14(c, sn, loc, lookAt, open, iris, a) {
    const H = sn.headR, R = H * 0.24;
    for (const s of [-1, 1]) { const [x, y] = loc(H * 0.38, s * H * 0.36); glowDot(c, x, y, R * 3.2, sn.K.eye, 0.3 * open * a); }
    c.globalCompositeOperation = 'source-over';
    c.save(); c.globalAlpha *= a;
    for (const s of [-1, 1]) { const [x, y] = loc(H * 0.38, s * H * 0.36); eyeball(c, x, y, R, open, lookAt(x, y), iris, false); }
    c.restore();
  }
  const IRIS = { aarde: '#1a6a3a', mars: '#c8800a', neptunus: '#1a3a9a', pluto: '#6a4a3a', saturnus: '#8a5a1a', galaxy: '#8a3aff' };
  for (const k of PLANETS) V9_GLOW[k] = (c, sn, t, P, loc, lookAt, open) => eyes14(c, sn, loc, lookAt, open, IRIS[k], k === 'pluto' ? Math.max(0.35, sn.cloak == null ? 1 : sn.cloak) : 1);
  // the galaxy: a spiral with a white heart that swells before it blows
  V9_HEADS.galaxy = (c, sn, H, out, fill, t, flash) => {
    c.rotate(-sn.drawAng);
    const ch = sn.charge14 || 0, spin = (sn.spin14 || t) * 0.9;
    c.fillStyle = out; circle(c, 0, 0, H + 2.6);
    const g = c.createRadialGradient(0, 0, 1, 0, 0, H);
    g.addColorStop(0, flash ? '#ffffff' : '#fff6d8'); g.addColorStop(0.25 + ch * 0.3, '#e8a8ff'); g.addColorStop(0.6, '#5a2aa8'); g.addColorStop(1, '#1c1240');
    c.fillStyle = g; circle(c, 0, 0, H);
    for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 16; i++) {
      const u = i / 15, a = spin + (arm * TAU) / 3 + u * 3.4, rr = H * (0.18 + u * 0.8);
      c.fillStyle = `rgba(255,${Math.round(236 - u * 60)},${Math.round(220 + u * 30)},${(0.85 - u * 0.55).toFixed(3)})`;
      circle(c, Math.cos(a) * rr, Math.sin(a) * rr * 0.9, H * (0.09 - u * 0.05));
    }
    c.fillStyle = `rgba(255,252,240,${(0.7 + 0.3 * ch).toFixed(3)})`; circle(c, 0, 0, H * (0.2 + 0.45 * ch));
    if (ch > 0) { c.strokeStyle = `rgba(255,246,216,${(0.4 + 0.5 * Math.sin(t * 30) * ch).toFixed(3)})`; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, H * (1.2 + ch * 0.6), 0, TAU); c.stroke(); }
  };
  V9_GLOW.galaxy = (c, sn, t, P, loc, lookAt, open) => {
    const ch = sn.charge14 || 0;
    glowDot(c, sn.x, sn.y, sn.headR * (2.6 + 3 * ch), '#e8c8ff', 0.22 + 0.45 * ch);
    eyes14(c, sn, loc, lookAt, open, IRIS.galaxy, 1);
  };
  {
    const dec0 = decorateSnake9;
    decorateSnake9 = function (c, sn, t) {
      dec0(c, sn, t);
      const K = sn.K, kind = sn.kind;
      if (kind === 'aarde') {
        segPaint9(sn, (p, k, dx, dy, nx, ny) => {
          if (k % 2) { c.fillStyle = K.land; ell(c, p.x + nx * p.r * 0.3, p.y + ny * p.r * 0.3, p.r * 0.45, p.r * 0.3, Math.atan2(dy, dx) + k); c.fill(); }
          if (k % 3 === 0) { c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = p.r * 0.14; c.beginPath(); c.arc(p.x - nx * p.r * 0.2, p.y - ny * p.r * 0.2, p.r * 0.5, 0, 1.6); c.stroke(); }
        });
        const M = sn.moon14;
        if (M && M.hp > 0) {
          const [mx, my] = moonPos14(sn);
          c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, mx + 1, my + 5, MOON_R, MOON_R * 0.45); c.fill();
          c.fillStyle = '#20202a'; circle(c, mx, my, MOON_R + 1.3);
          c.save(); c.translate(mx, my); globe14(c, MOON_R, '#b8b8c4', '#4a4a56', '#f4f4fa');
          c.fillStyle = 'rgba(60,60,72,0.45)'; circle(c, MOON_R * 0.3, -MOON_R * 0.2, MOON_R * 0.24); circle(c, -MOON_R * 0.35, MOON_R * 0.3, MOON_R * 0.18);
          if (M.hp < 3) { c.strokeStyle = '#2a2a34'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-MOON_R * 0.6, -MOON_R * 0.3); c.lineTo(0, 0); c.lineTo(MOON_R * 0.3, MOON_R * 0.6); c.stroke(); }
          c.restore();
        }
      } else if (kind === 'mars') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        c.fillStyle = K.crater; circle(c, p.x + nx * p.r * 0.35 * (k % 2 ? 1 : -1), p.y + ny * p.r * 0.35 * (k % 2 ? 1 : -1), p.r * 0.22);
      });
      else if (kind === 'neptunus') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        if (k % 2) return;
        c.strokeStyle = 'rgba(110,160,255,0.45)'; c.lineWidth = p.r * 0.22;
        c.beginPath(); c.moveTo(p.x + nx * p.r * 0.8, p.y + ny * p.r * 0.8); c.quadraticCurveTo(p.x + dx * p.r * 0.3, p.y + dy * p.r * 0.3, p.x - nx * p.r * 0.8, p.y - ny * p.r * 0.8); c.stroke();
      });
      else if (kind === 'pluto') segPaint9(sn, (p, k, dx, dy, nx, ny) => { if (k % 2) { c.fillStyle = 'rgba(90,60,44,0.35)'; circle(c, p.x - nx * p.r * 0.3, p.y - ny * p.r * 0.3, p.r * 0.3); } });
      else if (kind === 'saturnus') segPaint9(sn, (p, k, dx, dy, nx, ny) => {
        c.strokeStyle = K.band; c.lineWidth = p.r * 0.2;
        c.beginPath(); c.moveTo(p.x + nx * p.r * 0.9, p.y + ny * p.r * 0.9); c.quadraticCurveTo(p.x + dx * p.r * 0.25, p.y + dy * p.r * 0.25, p.x - nx * p.r * 0.9, p.y - ny * p.r * 0.9); c.stroke();
      });
      else if (kind === 'galaxy') segPaint9(sn, (p, k) => {
        c.fillStyle = rgba(K.neb, 0.16 + 0.1 * Math.sin(t * 2 + k));
        circle(c, p.x + (hash(k * 7.1) - 0.5) * p.r * 0.6, p.y + (hash(k * 3.3 + 1) - 0.5) * p.r * 0.6, p.r * 0.62);
        for (let j = 0; j < 3; j++) {
          const a = hash(k * 13 + j) * TAU, rr = hash(k * 17 + j) * p.r * 0.8, tw = 0.5 + 0.5 * Math.sin(t * 4 + k + j * 2);
          c.fillStyle = `rgba(255,246,216,${(0.35 + 0.6 * tw).toFixed(3)})`;
          circle(c, p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 0.6 + hash(k * 5 + j) * 1.1);
        }
      });
    };
  }

  /* ================================================================== drawing: projectiles and room effects */
  VENOM9.ice14 = (c, v, t) => {
    const a = Math.atan2(v.vy, v.vx);
    c.save(); c.translate(v.x, v.y); c.rotate(a);
    c.fillStyle = '#e8f8ff'; c.strokeStyle = '#2a5a9a'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(v.r * 1.8, 0); c.lineTo(0, v.r * 0.6); c.lineTo(-v.r * 1.2, 0); c.lineTo(0, -v.r * 0.6); c.closePath(); c.fill(); c.stroke();
    c.restore();
  };
  VENOM9.star14 = (c, v, t) => {
    c.save(); c.translate(v.x, v.y); c.rotate(t * 5 + v.ph);
    c.fillStyle = '#fff2b0';
    c.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? v.r * 0.4 : v.r * 1.15, a = (i / 8) * TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill();
    c.fillStyle = '#ffffff'; circle(c, 0, 0, v.r * 0.35);
    c.restore();
  };
  function drawRing14(c, g, t) {
    c.save(); c.translate(g.x, g.y); c.rotate(g.spin);
    c.strokeStyle = g.friendly ? '#ffe08a' : '#ecdcaa'; c.lineWidth = 3.2;
    c.beginPath(); c.ellipse(0, 0, g.r, g.r * 0.42, 0, 0, TAU); c.stroke();
    c.strokeStyle = g.friendly ? 'rgba(255,255,255,0.7)' : 'rgba(80,56,20,0.6)'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(0, 0, g.r * 0.78, g.r * 0.32, 0, 0, TAU); c.stroke();
    c.restore();
  }
  function drawNova14(c, N, t) {
    const u = Math.min(1, N.t / N.fuse), r = starR14(N), late = N.fuse - N.t < 2;
    const pulse = 1 + Math.sin(t * (late ? 22 : 6) + N.seed) * (late ? 0.12 : 0.05);
    const col = late && Math.sin(t * 22) > 0 ? '#ffffff' : u < 0.5 ? '#ff7a3a' : u < 0.8 ? '#ffc86a' : '#fff6d8';
    // how long is left: the blast itself crosses the whole room
    c.strokeStyle = 'rgba(255,240,200,0.75)'; c.lineWidth = 2.5;
    c.beginPath(); c.arc(N.x, N.y, r + 9, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - u)); c.stroke();
    c.fillStyle = col; circle(c, N.x, N.y, r * pulse);
    c.fillStyle = 'rgba(255,255,255,0.8)'; circle(c, N.x - r * 0.25, N.y - r * 0.25, r * 0.35);
    c.strokeStyle = rgba('#fff6d8', 0.55); c.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 0.6, l = r * (1.6 + 0.4 * Math.sin(t * 4 + i)); c.beginPath(); c.moveTo(N.x + Math.cos(a) * r, N.y + Math.sin(a) * r); c.lineTo(N.x + Math.cos(a) * l, N.y + Math.sin(a) * l); c.stroke(); }
  }
  function drawHole14(c, h, t) {
    const k = Math.min(1, h.t / 0.4) * Math.min(1, Math.max(0, h.life - h.t) / 0.4), r = h.r * k;
    if (r < 0.5) return;
    c.save(); c.translate(h.x, h.y);
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = h.hostile ? `rgba(196,90,255,${(0.3 - i * 0.08).toFixed(3)})` : `rgba(255,170,90,${(0.35 - i * 0.09).toFixed(3)})`; c.lineWidth = 2;
      c.beginPath(); c.arc(0, 0, r * (2.6 - i * 0.5), h.spin + i, h.spin + i + 2.2); c.stroke();
    }
    c.save(); c.rotate(h.spin * 0.6); c.strokeStyle = h.hostile ? '#c45aff' : '#ffaa5a'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 0, r * 1.5, r * 0.5, 0, 0, TAU); c.stroke(); c.restore();
    c.fillStyle = '#000000'; circle(c, 0, 0, r);
    c.strokeStyle = h.hostile ? 'rgba(232,200,255,0.8)' : 'rgba(255,230,190,0.8)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    c.restore();
  }
  function drawMeteor14(c, m, t) {
    const u = clamp(m.t / m.warn, 0, 1);
    c.strokeStyle = m.hostile ? `rgba(255,80,60,${(0.4 + 0.4 * u).toFixed(3)})` : `rgba(255,210,120,${(0.4 + 0.4 * u).toFixed(3)})`; c.lineWidth = 1.6;
    c.setLineDash([5, 4]); c.beginPath(); c.arc(m.x, m.y, m.r * (1.25 - u * 0.25), 0, TAU); c.stroke(); c.setLineDash([]);
    const d = (1 - u) * 260, mx = m.x + Math.cos(m.from) * d * 0.6 + d * 0.5, my = m.y - d;
    if (u > 0.05) {
      const g = c.createLinearGradient(mx, my, mx + 30, my - 50);
      g.addColorStop(0, 'rgba(255,200,120,0.8)'); g.addColorStop(1, 'rgba(255,120,60,0)');
      c.strokeStyle = g; c.lineWidth = 6; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + 30, my - 50); c.stroke();
      c.fillStyle = '#5a4a44'; circle(c, mx, my, 6); c.fillStyle = '#ffb46a'; circle(c, mx - 1.5, my + 1.5, 3);
    }
  }
  function drawCons14(c, K, t) {
    const live = K.t >= K.warn, u = Math.min(1, K.t / K.warn);
    c.save();
    c.strokeStyle = live ? 'rgba(220,240,255,0.95)' : `rgba(170,210,255,${(0.2 + 0.35 * u).toFixed(3)})`;
    c.lineWidth = live ? 5 : 1.2; if (!live) c.setLineDash([4, 6]);
    c.beginPath();
    K.pts.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.closePath(); c.stroke();
    c.setLineDash([]);
    for (const q of K.pts) {
      const r = 3 + 2 * u + Math.sin(t * 9 + q.x) * 0.8;
      c.fillStyle = '#ffffff'; c.beginPath();
      for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, rr = k % 2 ? r * 0.4 : r * 1.4; c.lineTo(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); }
      c.fill();
    }
    c.restore();
  }
  function drawHorizon14(c, Hz, t) {
    c.save();
    c.fillStyle = 'rgba(10,0,24,0.5)';
    c.beginPath(); c.rect(0, 0, RW, RH); c.arc(Hz.x, Hz.y, Hz.R, 0, TAU, true); c.fill();
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = `rgba(196,90,255,${(0.75 - i * 0.22).toFixed(3)})`; c.lineWidth = 4 - i;
      c.beginPath(); c.arc(Hz.x, Hz.y, Hz.R + i * 5, t * (0.6 + i * 0.3), t * (0.6 + i * 0.3) + TAU * 0.82); c.stroke();
    }
    c.restore();
  }
  function drawPulsar14(c, sn, t) {
    const live = sn.mt >= 0.9;
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < sn.beamN14; i++) {
      const a = sn.beamA14 + (i * TAU) / sn.beamN14, x1 = sn.x + Math.cos(a) * 900, y1 = sn.y + Math.sin(a) * 900;
      c.strokeStyle = live ? 'rgba(190,225,255,0.35)' : 'rgba(190,225,255,0.25)'; c.lineWidth = live ? 18 : 2;
      c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(x1, y1); c.stroke();
      if (live) { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 5 + Math.sin(t * 40) * 1.5; c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(x1, y1); c.stroke(); }
    }
    c.restore();
  }
  function drawShock14(c, s) {
    const a = Math.max(0, 1 - s.R / s.max);
    c.strokeStyle = rgba(s.col, 0.85 * a); c.lineWidth = 10 * a + 2;
    c.beginPath(); c.arc(s.x, s.y, s.R, 0, TAU); c.stroke();
    c.strokeStyle = rgba('#ffffff', 0.6 * a); c.lineWidth = 2;
    c.beginPath(); c.arc(s.x, s.y, Math.max(0, s.R - 6), 0, TAU); c.stroke();
  }
  function drawMoon14(c, P) {
    const [mx, my] = moonOf(P);
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, mx + 1, my + 6, 6, 2.6); c.fill();
    c.fillStyle = '#20202a'; circle(c, mx, my, 7.3);
    c.save(); c.translate(mx, my); globe14(c, 6, '#c8c8d4', '#4a4a56', '#ffffff');
    c.fillStyle = 'rgba(60,60,72,0.45)'; circle(c, 1.8, -1.2, 1.5); circle(c, -2, 1.8, 1.1);
    c.restore();
  }
  // the twinkle and the odd shooting star, drawn live over the baked floor
  function twinkle14(c, room, t) {
    const s0 = room.gx * 31.7 + room.gy * 17.3;
    for (let i = 0; i < 16; i++) {
      const x = hash(s0 + i * 1.31) * RW, y = hash(s0 + i * 2.77 + 9) * RH, tw = Math.sin(t * (1.4 + hash(s0 + i) * 2.4) + i * 2.1);
      if (tw < 0.2) continue;
      sparkle14(c, x, y, 1.5 + 2.2 * tw, 0.25 + 0.6 * tw, '#ffffff');
    }
    const per = 6 + hash(s0 + 3) * 4, ph = (t + hash(s0 + 5) * per) % per;
    if (ph < 0.6) {
      const k = Math.floor((t + hash(s0 + 5) * per) / per), x0 = hash(s0 + k * 3.7) * RW, y0 = hash(s0 + k * 5.3) * RH * 0.5, u = ph / 0.6;
      const x = x0 + u * 160, y = y0 + u * 70;
      const g = c.createLinearGradient(x, y, x - 50, y - 22);
      g.addColorStop(0, `rgba(255,255,255,${(0.8 * (1 - u)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 50, y - 22); c.stroke();
    }
  }
  {
    const dft0 = drawFloorThings;
    drawFloorThings = function (c, room, t) {
      dft0(c, room, t);
      const L = G.levelDef;
      if (L && L.deco === SET && spaceRoom(room)) safe(() => twinkle14(c, room, t));
      const F = room.fx14;
      if (F) safe(() => { for (const h of F.holes) drawHole14(c, h, t); });
    };
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const room = G.room; if (!room) return;
      safe(() => {
        const F = room.fx14;
        if (F) {
          if (F.nova) drawNova14(c, F.nova, t);
          for (const g of F.rings) drawRing14(c, g, t);
          for (const m of F.meteors) drawMeteor14(c, m, t);
          for (const s of F.shocks) drawShock14(c, s);
          for (const K of F.cons || []) drawCons14(c, K, t);
          if (F.horizon) drawHorizon14(c, F.horizon, t);
        }
        for (const sn of room.snakes) if (sn.kind === 'galaxy' && sn.mode === 'pulsar' && sn.beamN14) drawPulsar14(c, sn, t);
        for (const P of players14()) {
          if (P.moon14 && !(P.dying > 0)) drawMoon14(c, P);
          if (P.ice14T > 0) { c.strokeStyle = `rgba(190,232,255,${(0.5 * Math.min(1, P.ice14T)).toFixed(3)})`; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y, P.r + 5, 0, TAU); c.stroke(); }
        }
      });
    };
    const dg0 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      dg0(c, room, t);
      const F = room.fx14;
      safe(() => {
        c.globalCompositeOperation = 'lighter';
        if (F) {
          if (F.nova) { const u = Math.min(1, F.nova.t / F.nova.fuse); glowDot(c, F.nova.x, F.nova.y, 50 + 70 * u, u < 0.5 ? '#ff8a4a' : '#fff0c8', 0.4 + 0.3 * u); }
          for (const s of F.shocks) glowDot(c, s.x, s.y, Math.max(20, s.R * 0.5), s.col, 0.3 * Math.max(0, 1 - s.R / s.max));
          for (const h of F.holes) glowDot(c, h.x, h.y, h.r * 3, h.hostile ? '#c45aff' : '#ffaa5a', 0.25);
          for (const g of F.rings) glowDot(c, g.x, g.y, 18, g.friendly ? '#ffe08a' : '#ecdcaa', 0.25);
        }
        for (const P of players14()) {
          if (P.novaT14 > 0) glowDot(c, P.x, P.y, 60, '#fff6d8', 0.5 * Math.min(1, P.novaT14));
          if (P.warT14 > 0) glowDot(c, P.x, P.y, 30, '#ff5a3a', 0.2);
        }
        c.globalCompositeOperation = 'source-over';
      });
    };
  }

  /* ================================================================== icons */
  const O = '#1a1210';
  function icon14(c, id, R, t) {
    if (id === 'maan14') {
      c.strokeStyle = 'rgba(200,210,255,0.5)'; c.lineWidth = R * 0.05; c.setLineDash([R * 0.1, R * 0.08]);
      c.beginPath(); c.ellipse(0, 0, R * 0.85, R * 0.4, -0.3, 0, TAU); c.stroke(); c.setLineDash([]);
      c.fillStyle = O; circle(c, 0, 0, R * 0.52);
      globe14(c, R * 0.46, '#c8c8d4', '#4a4a56', '#ffffff');
      c.fillStyle = 'rgba(60,60,72,0.45)'; circle(c, R * 0.15, -R * 0.12, R * 0.11); circle(c, -R * 0.17, R * 0.16, R * 0.08); circle(c, R * 0.2, R * 0.2, R * 0.05);
      const a = t * 2; c.fillStyle = '#e83a3a'; circle(c, Math.cos(a) * R * 0.85 * 0.96, Math.sin(a) * R * 0.4, R * 0.1);
    } else if (id === 'ringen14') {
      ringHalf14(c, R * 0.42, true, '#ecdcaa');
      c.fillStyle = O; circle(c, 0, 0, R * 0.47);
      c.save(); c.beginPath(); c.arc(0, 0, R * 0.42, 0, TAU); c.clip(); globe14(c, R * 0.42, '#d8b46a', '#4a3410', '#fff0c0');
      c.fillStyle = 'rgba(150,100,40,0.35)'; for (const y of [-0.5, 0, 0.45]) { ell(c, 0, y * R * 0.42, R * 0.5, R * 0.04); c.fill(); } c.restore();
      ringHalf14(c, R * 0.42, false, '#ecdcaa');
    } else if (id === 'rodeplaneet14') {
      glowDot(c, 0, 0, R * 0.9, '#ff5a3a', 0.3);
      c.fillStyle = O; circle(c, 0, 0, R * 0.56);
      c.save(); c.beginPath(); c.arc(0, 0, R * 0.5, 0, TAU); c.clip(); globe14(c, R * 0.5, '#c4502a', '#4a1406', '#f08a5a');
      c.fillStyle = 'rgba(110,30,10,0.5)'; ell(c, R * 0.1, R * 0.08, R * 0.22, R * 0.1, 0.5); c.fill();
      c.fillStyle = '#fff8f0'; ell(c, 0, -R * 0.45, R * 0.2, R * 0.09); c.fill(); c.restore();
      c.strokeStyle = '#e8e8f0'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(R * 0.35, R * 0.7); c.lineTo(R * 0.85, R * 0.2); c.stroke();
      c.strokeStyle = '#8a5a2a'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(R * 0.28, R * 0.48); c.lineTo(R * 0.55, R * 0.75); c.stroke();
    } else if (id === 'neptunus14') {
      c.fillStyle = O; circle(c, -R * 0.12, R * 0.05, R * 0.56);
      c.save(); c.translate(-R * 0.12, R * 0.05); c.beginPath(); c.arc(0, 0, R * 0.5, 0, TAU); c.clip(); globe14(c, R * 0.5, '#2a48b8', '#060e3a', '#7aa8ff');
      c.fillStyle = 'rgba(120,170,255,0.35)'; for (const y of [-0.25, 0.1]) { ell(c, 0, y * R, R * 0.55, R * 0.05); c.fill(); } c.restore();
      c.save(); c.translate(R * 0.45, -R * 0.42); c.rotate(t * 0.5); c.strokeStyle = '#e8f8ff'; c.lineWidth = R * 0.07;
      for (let i = 0; i < 3; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(-R * 0.3, 0); c.lineTo(R * 0.3, 0); c.stroke(); }
      c.restore();
    } else if (id === 'dwerg14') {
      c.fillStyle = O; circle(c, 0, R * 0.08, R * 0.44);
      c.save(); c.translate(0, R * 0.08); c.beginPath(); c.arc(0, 0, R * 0.38, 0, TAU); c.clip(); globe14(c, R * 0.38, '#cbb8a4', '#4a3a2e', '#fff4e8');
      c.fillStyle = '#f2e8dc'; c.save(); c.translate(R * 0.08, R * 0.04); c.scale(R / 26, R / 26);
      c.beginPath(); c.moveTo(0, 3.5); c.bezierCurveTo(-5, 0, -3.5, -4.5, 0, -2); c.bezierCurveTo(3.5, -4.5, 5, 0, 0, 3.5); c.fill(); c.restore(); c.restore();
      c.strokeStyle = '#ffd23a'; c.lineWidth = R * 0.07;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.8, -R * 0.65); c.lineTo(s * R * 0.55, -R * 0.4); c.moveTo(s * R * 0.55, -R * 0.4); c.lineTo(s * R * 0.55, -R * 0.62); c.moveTo(s * R * 0.55, -R * 0.4); c.lineTo(s * R * 0.77, -R * 0.4); c.stroke(); }
    } else if (id === 'meteoor14') {
      const g = c.createLinearGradient(-R * 0.1, R * 0.1, R * 0.8, -R * 0.8);
      g.addColorStop(0, 'rgba(255,200,120,0.95)'); g.addColorStop(1, 'rgba(255,90,40,0)');
      c.strokeStyle = g; c.lineWidth = R * 0.32; c.beginPath(); c.moveTo(-R * 0.15, R * 0.15); c.lineTo(R * 0.8, -R * 0.8); c.stroke();
      c.fillStyle = O; circle(c, -R * 0.25, R * 0.25, R * 0.36);
      c.save(); c.translate(-R * 0.25, R * 0.25); globe14(c, R * 0.31, '#7a6a60', '#2a2220', '#b8a89a'); c.fillStyle = 'rgba(30,24,22,0.5)'; circle(c, R * 0.08, R * 0.05, R * 0.08); c.restore();
      c.strokeStyle = '#ff5a3a'; c.lineWidth = R * 0.05; c.setLineDash([R * 0.1, R * 0.08]); c.beginPath(); c.ellipse(-R * 0.25, R * 0.62, R * 0.45, R * 0.14, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    } else if (id === 'zwartgat14') {
      glowDot(c, 0, 0, R * 1, '#c45aff', 0.3);
      c.save(); c.rotate(-0.35 + t * 0.2); c.strokeStyle = '#ffaa5a'; c.lineWidth = R * 0.14; c.beginPath(); c.ellipse(0, 0, R * 0.85, R * 0.28, 0, Math.PI, TAU); c.stroke(); c.restore();
      c.fillStyle = '#000000'; circle(c, 0, 0, R * 0.4); c.strokeStyle = '#ffe0b0'; c.lineWidth = R * 0.05; c.beginPath(); c.arc(0, 0, R * 0.42, 0, TAU); c.stroke();
      c.save(); c.rotate(-0.35 + t * 0.2); c.strokeStyle = '#ffcf8a'; c.lineWidth = R * 0.14; c.beginPath(); c.ellipse(0, 0, R * 0.85, R * 0.28, 0, 0, Math.PI); c.stroke(); c.restore();
    } else if (id === 'supernova14') {
      const p = 0.5 + 0.5 * Math.sin(t * 4);
      glowDot(c, 0, 0, R * 1.1, '#fff0c8', 0.35 + 0.2 * p);
      c.strokeStyle = `rgba(255,246,216,${(0.4 + 0.4 * p).toFixed(3)})`; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, 0, R * (0.62 + 0.18 * p), 0, TAU); c.stroke();
      c.fillStyle = '#fff2b0';
      c.beginPath(); for (let i = 0; i < 16; i++) { const r = i % 2 ? R * 0.2 : R * (i % 4 ? 0.48 : 0.7), a = (i / 16) * TAU + t * 0.3; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
      c.strokeStyle = O; c.lineWidth = R * 0.04; c.stroke();
      c.fillStyle = '#ffffff'; circle(c, 0, 0, R * 0.16);
    }
  }
  {
    const ICONS = new Set(SPACE_IDS);
    const di0 = drawItemIcon;
    drawItemIcon = function (c, id, S, t = 0) {
      if (!ICONS.has(id)) return di0.apply(this, arguments);
      const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      safe(() => icon14(c, id, R, t));
      c.restore();
    };
  }

  /* ================================================================== achievements, texts, the guide */
  ACHS.push(
    { id: 'galaxy14', name: 'Melkweg Leeg', desc: 'Beat De Galaxyworm.', stat: 'boss_galaxy', goal: 1 },
    { id: 'planets14', name: 'Planetenjager', desc: 'Kill 40 planet worms.', stat: 'planets14', goal: 40 },
  );
  for (const s of ['WEL EEN PLANEET', 'MAAN KAPOT', 'KOUD', 'BEVROREN', 'OORLOG', 'ZWART GAT', 'SUPERNOVA', 'GEDEKT', 'NIEUWE PLANETEN']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const V = window.__bitten.V12; if (!V || !V.CLEAR12) return;
    const L = V.CLEAR12;
    Object.assign(L.items, {
      maan14: 'A moon circles you, stops venom, bumps snakes.', ringen14: 'Every 6th shot throws a ring that comes back.', rodeplaneet14: 'Kills start 3 seconds of faster, harder shots.',
      neptunus14: 'Seeds slow snakes, every 4th hit freezes.', dwerg14: 'Smaller and faster, smaller seeds.', meteoor14: 'A meteor every 6 seconds on the healthiest snake.',
      zwartgat14: 'Every 12 kills a black hole pulls snakes in.', supernova14: 'Low on health? A bite sets off a room wide blast.',
    });
    V.install(NEW, L.items);
  });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  safe(() => {
    const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${name}</b><span class="size">${size}</span><span>${txt}</span></figcaption></figure>`;
    const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
    if (decks[0]) decks[0].insertAdjacentHTML('beforeend', [
      fig('aarde', 'Aardworm', 'Medium, De Ruimte', 'Keeps you close so its moon swings into you. The moon stops seeds: three hits and it breaks off. Then the worm gets faster.'),
      fig('mars', 'Marsworm', 'Small, De Ruimte', 'The god of war. Kicks up red dust for half a second, then charges in a straight line. Step aside when the dust comes up.'),
      fig('neptunus', 'Neptunusworm', 'Medium, slow, De Ruimte', 'Stays far away and blows a fan of ice. Ice that hits slows you down for a moment. Cold, blue and far.'),
      fig('pluto', 'Plutoworm', 'Tiny, fast, De Ruimte', 'Hard to see from far away, it fades into the dark. Comes in groups. Still a planet, it says.'),
      fig('saturnus', 'Saturnusworm', 'Big, De Ruimte', 'Throws its ring like a boomerang. The ring comes back: dodge it twice. Without its ring it waits.'),
    ].join(''));
    if (decks[1]) decks[1].insertAdjacentHTML('beforeend', fig('galaxy', 'De Galaxyworm', 'Ruimte boss', 'Four stages, and its own song follows them. Nevel: star spirals, planet births and constellations that burn their lines. Zwart Gat (70%): black holes, meteors and a comet dash. Supernova (40%): the nova and a sweeping pulsar; hide behind an asteroid. Singulariteit (15%): the event horizon closes in, stay inside the ring.'));
    const rules = document.querySelector('#tab-rooms ul.rules');
    if (rules) rules.insertAdjacentHTML('beforeend', '<li>In De Ruimte some fights have a dying star. It grows for a few seconds, then goes supernova: a shockwave across the room. Put an asteroid between you and the star. Snakes in the open get hit too.</li>');
    const modes = document.querySelector('#tab-modes ul.rooms9');
    if (modes) modes.insertAdjacentHTML('beforeend', '<li><i style="background:#7a5aff" aria-hidden="true"></i><b>De Ruimte</b><span>The deepest rare floor. Every room is open space, every worm a planet, and the boss is De Galaxyworm. The eight space powerups only drop here.</span></li>');
  });
  Object.assign(window.__bitten || (window.__bitten = {}), { SPACE14: Object.assign(SPACE, { NEW, PLANETS, FIGHTS, shock14, hole14, meteor14, fx14, galaxyStage14 }) });
})();
