/* src/88-v14-draken.js: v14.5 De Drakenhemel. A rare floor high above all the others, reached by a ladder instead of a hole
   (src/89-v14-draken-reis.js). Every room is an open sky terrace: a marble plaza with a dragon mosaic, a red balustrade,
   a sea of clouds all around, cloud shadows and the odd dragon flying over. Four dragons and a hatchling live here,
   the boss is De Zonnekeizer, and fights can get a storm that blows you across the terrace.
   Dragons (spawn characters):  ) Muntdraak   { Neondraak   } Pareldraak   | Toorndraak   : Drakenjong
   Seeded runs: the floor is placed with its own generator from the run seed, so runs that never reach it play as before.
   Test hook: window.__bitten.DRAAK14. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'draken88'); if (window.console) console.warn('v14 draken', e); return fb; } };
  const SET = 'draken';
  const DRAGONS = ['munt14', 'neon14', 'parel14', 'toorn14', 'jong14'];
  const DRAGON = { munt14: 1, neon14: 1, parel14: 1, toorn14: 1, jong14: 1, keizer14: 1 };
  const DRAAK = { force: false, odds: 0.35, endlessOdds: 0.18, itemOdds: 0.07 };
  const inSky = () => !!(G.levelDef && G.levelDef.set === SET);
  const skyRoom = (room) => !!room && !SPECIAL9[room.type] && !clubRoom9(room) && room.type !== 'clownhq' && room.type !== 'quiet' && room.type !== 'brawl';
  const hash = (x) => { const s = Math.sin(x * 12.9898 + 4.1414) * 43758.5453; return s - Math.floor(s); };
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  function fx(room) { if (!room.dk14) room.dk14 = { lobs: [], hot: [], patches: [], pearls: [], beam: null, gust: null, gustT: null, eclipse: 0 }; return room.dk14; }
  const vs = () => G.levelDef.venomSpeed;
  function hurtEach(test, n, x, y) { for (const Q of livePlayers14()) if (!(Q.dying > 0) && test(Q)) withPlayer(Q, () => Q.hurt(n, x, y)); }

  /* ================================================================== the floor */
  FLOOR10[SET] = {
    name: 'De Drakenhemel', sub: 'Above every floor, above the clouds. Dragons nest up here.', rooms: 10, tier: 3, set: SET, boss: 'keizer14', hard: true,
    dark: 0.16, darkClear: 0.06, venomSpeed: 176, hpMult: 1.75, light: 260, noGrain: true, sky14: true,
    floor: '#e9e0cb', floor2: '#ded3bb', grout: '#c8b996', wall: '#9cc8f2', wallHi: '#c8262e', wallLo: '#5a7ab0', void: '#bfe0ff',
    rock: '#b3262a', rockHi: '#e85a4a', rockLo: '#5a0c10', clay: '#e8c86a', clayLo: '#8a6420', deco: SET, decoCol: '#d8a838', dirt: '#cfc2a4',
    rockStyle: 'zuil14', urnStyle: 'drakei14',
  };
  //  # pillar or hoard   u dragon egg   ) Muntdraak   { Neondraak   } Pareldraak   | Toorndraak   : Drakenjong
  const FIGHTS = [
    ['...........', '.#.......#.', '...)...{...', '...........', '..:..#..:..', '...........', '...}...|...', '.#.......#.', '...........'],
    ['u.........u', '..#.....#..', '....).)....', '...........', '.....|.....', '...........', '....:.:....', '..#.....#..', 'u.........u'],
    ['...........', '.##.....##.', '...........', '..{..}..{..', '...........', '..:.....:..', '.....).....', '.##.....##.', '...........'],
    ['...........', '...#...#...', '..|.....|..', '...........', '.#...}...#.', '...........', '..:..{..:..', '...#...#...', '...........'],
    ['u.u.....u.u', '...........', '..:..#..:..', '.....#.....', '..).....)..', '.....{.....', '..:..#..:..', '...........', 'u.u.....u.u'],
    ['...........', '..#.....#..', '.#..}.}..#.', '...........', '....|.)....', '...........', '.#..{.:..#.', '..#.....#..', '...........'],
    ['u.........u', '..##...##..', '...........', '..)..:..)..', '.....#.....', '..{..:..}..', '...........', '..##...##..', 'u.........u'],
    ['...........', '.#.......#.', '...|.}.|...', '..#.....#..', '.....:.....', '..#.....#..', '...).{.)...', '.#.......#.', '...........'],
  ];
  FIGHT_SETS[SET] = FIGHTS.slice();
  SHAPE_SPAWN[SET] = '):';
  for (const tpl of SHAPED) FIGHT_SETS[SET].push(tpl.map((row) => row.replace(/1/g, ')').replace(/2/g, ':')));
  START_SETS[SET] = ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'];
  SWAP_POOL[SET] = '):{}|';
  NEW_WORMS[SET] = '){}|:';
  MINI_POOL[SET] = ['toorn14', 'parel14', 'neon14'];
  EXTRA_POOL[SET] = ['jong14', 'jong14', 'munt14', 'neon14'];
  WAVE_POOL[SET] = ['jong14', 'jong14', 'munt14', 'neon14', 'parel14', 'toorn14'];
  HAZARDS[SET] = ['storm14', 0.3];
  MOD_NAMES.storm14 = 'A storm over the terrace';
  DRONE_ROOT[SET] = 41.2;
  CHAOS_LOOKS9[SET] = () => FLOOR10[SET];
  CHAOS_POOL9.push('munt14', 'neon14', 'parel14', 'toorn14');
  CHAOS_MODS9.push('storm14');
  Object.assign(V9_SPAWN, { ')': 'munt14', '{': 'neon14', '}': 'parel14', '|': 'toorn14', ':': 'jong14' });

  const REMAP = { grub: 'jong14', hood: 'neon14', lamprey: 'parel14' };
  {
    const b0 = Room.prototype.build;
    Room.prototype.build = function (tpl, def, opt) {
      const r = b0.call(this, tpl, def, opt);
      if (def && def.set === SET) {
        for (const s of this.spawns) if (REMAP[s.kind]) s.kind = REMAP[s.kind];
        if (skyRoom(this)) this.sconces = [];
      }
      return r;
    };
    const hg0 = hatchGrub;
    hatchGrub = function (room, x, y) {
      if (!inSky()) return hg0.apply(this, arguments);
      room.snakes.push(new Snake('jong14', x, y, { emerge: false, spawnTime: 0.35, locks: !room.cleared }));
      Sfx.squeak && Sfx.squeak();
      burst(x, y, 10, '#f2e2b8', { kind: 'shard', min: 30, max: 100, lmin: 0.3, lmax: 0.6 });
    };
  }

  /* ------------------------------------------------------------------ which runs go up */
  // Arcade and Daily: after the normal plan (and De Ruimte), a generator of its own puts De Drakenhemel on floor 2, 3 or 4,
  // never on the last floor and never where De Ruimte already is. Endless: from floor 2 on, not twice in a row of four.
  {
    const pf0 = planFloors10;
    planFloors10 = function (rng) {
      const out = pf0(rng);
      safe(() => {
        if (DRAAK.force && (G.mode === 'arcade' || G.mode === 'daily') && LEVELS[1] && !NET14.live && !NET14.starting) { DRAAK.force = false; out[1] = SET; return; }
        const run = G.run, seed = run && run.seed != null ? run.seed >>> 0 : 0;
        const r = mulberry32((seed ^ 0x6d7a4b13) >>> 0);
        if (r() >= DRAAK.odds) return;
        const slots = [1, 2, 3].filter((i) => LEVELS[i] && i < LEVELS.length - 1 && out[i] !== 'ruimte');
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
      if (!fresh || i < 1 || !run.floors10 || run.floors10[i] === 'ruimte') return L;
      const recent = run.floors10.slice(Math.max(0, i - 4), i).indexOf(SET) >= 0;
      const r = mulberry32((((run.seed >>> 0) ^ 0x0d7a6e55) + i * 0x85ebca6b) >>> 0);
      if (recent || r() >= DRAAK.endlessOdds) return L;
      run.floors10[i] = SET;
      return lb1.call(this, i);
    };
  }

  /* ================================================================== the dragons */
  Object.assign(KINDS, {
    munt14: {
      name: 'Muntdraak', hp: 14, headR: 12, r0: 10.5, r1: 5, spacing: 7.5, maxLen: 11, minLen: 4, speed: 60, turn: 3.2, bite: 1, noMound: true,
      body: '#c4cad4', body2: '#aeb5c2', outline: '#1c2130', hi: 'rgba(255,255,255,0.35)', blood: '#ffd23a', eye: '#ffd23a',
      dk: { spine: '#e8b830', scale: '#7a8294', wing: '#d8dee8', wingIn: 'rgba(240,210,120,0.55)', rib: '#c89a28', horn: '#e8b830', claw: '#e8b830', tail: 'blade', wings: 1, legs: 1, horns: 'blade', glow: '#ffd23a' },
    },
    neon14: {
      name: 'Neondraak', hp: 16, headR: 12.5, r0: 11, r1: 5, spacing: 7.5, maxLen: 11, minLen: 4, speed: 54, turn: 3, bite: 1, noMound: true,
      body: '#3a1468', body2: '#33115c', outline: '#0c0418', hi: 'rgba(220,160,255,0.22)', blood: '#d84aff', eye: '#f2a8ff',
      dk: { spine: '#e05aff', scale: '#b43aff', wing: '#2a0c4a', wingIn: 'rgba(200,80,255,0.35)', rib: '#e86aff', horn: '#1a0830', claw: '#e05aff', tail: 'spade', wings: 1, legs: 1, horns: 'blade', glow: '#d84aff', neon: 1 },
    },
    parel14: {
      name: 'Pareldraak', hp: 18, headR: 12.5, r0: 10, r1: 5, spacing: 7, maxLen: 14, minLen: 5, speed: 58, turn: 3.4, bite: 1, noMound: true,
      body: '#d8402e', body2: '#c83828', outline: '#3a0a06', hi: 'rgba(255,230,190,0.3)', blood: '#ffcf6a', eye: '#3a1a08',
      dk: { spine: '#ffcf4a', scale: '#f2a83a', mane: '#ffcf4a', mane2: '#f28a2a', horn: '#f2c86a', claw: '#ffcf4a', tail: 'tuft', wings: 0, legs: 2, horns: 'antler', whisk: '#ffcf4a', glow: '#ffe8a8', smile: 1 },
    },
    toorn14: {
      name: 'Toorndraak', hp: 20, headR: 13.5, r0: 11.5, r1: 5.5, spacing: 8, maxLen: 11, minLen: 4, speed: 62, turn: 3.2, bite: 1, noMound: true,
      body: '#a8141c', body2: '#94121a', outline: '#250306', hi: 'rgba(255,160,120,0.25)', blood: '#ff6a2a', eye: '#ffcf3a',
      dk: { spine: '#3a0608', scale: '#6a0a10', wing: '#7a0c14', wingIn: 'rgba(255,110,40,0.4)', rib: '#d8a050', horn: '#c89a5a', claw: '#f2d8a0', tail: 'spade', wings: 1, legs: 1, horns: 'antler', whisk: '#e8a050', glow: '#ff7a2a' },
    },
    jong14: {
      name: 'Drakenjong', hp: 5, headR: 8.5, r0: 7, r1: 3.5, spacing: 5.5, maxLen: 6, minLen: 3, speed: 104, turn: 4.6, bite: 1, noMound: true,
      body: '#3aa86a', body2: '#34985e', outline: '#08240f', hi: 'rgba(230,255,200,0.3)', blood: '#9ae86a', eye: '#2a1a08',
      dk: { spine: '#f2d24a', scale: '#2a7a4a', wing: '#8ae0a0', wingIn: 'rgba(255,240,160,0.4)', rib: '#2a7a4a', horn: '#f2e2b8', claw: '#f2e2b8', tail: 'tuft', wings: 1, legs: 0, horns: 'nub', glow: '#c8ff8a', baby: 1 },
    },
    keizer14: {
      boss: true, name: 'De Zonnekeizer', hp: 380, headR: 23, r0: 20, r1: 9, spacing: 12.5, maxLen: 20, minLen: 8, bite: 2, speed: 58, turn: 2.6, noMound: true,
      body: '#f4ead2', body2: '#e8dcc0', outline: '#3a2408', hi: 'rgba(255,255,240,0.45)', blood: '#ffcf3a', eye: '#ff8a1a',
      dk: { spine: '#e8a420', scale: '#d8b468', wing: '#f8f0dc', wingIn: 'rgba(255,200,90,0.45)', rib: '#d89a28', horn: '#e8a420', claw: '#e8a420', tail: 'tuft', wings: 1, legs: 2, horns: 'antler', whisk: '#ffcf4a', glow: '#ffcf3a', mane: '#ff6a2a', mane2: '#ffcf3a', sun: 1 },
    },
  });

  {
    const in0 = initSnake9;
    initSnake9 = function (sn, o) {
      in0(sn, o);
      const k = sn.kind;
      if (!DRAGON[k]) return;
      sn.fly14 = 0;
      if (k === 'munt14') { sn.mode = 'move'; sn.cd = rnd(1.6, 2.6); }
      else if (k === 'neon14') { sn.mode = 'move'; sn.cd = rnd(1.8, 2.8); }
      else if (k === 'parel14') { sn.mode = 'move'; sn.cd = rnd(1.8, 2.8); sn.pearl14 = true; sn.healCd14 = rnd(2.5, 4); }
      else if (k === 'toorn14') { sn.mode = 'move'; sn.cd = rnd(1.4, 2.4); sn.flyCd14 = rnd(3, 5); }
    };
  }
  // in the air a dragon cannot be hit and does not bite
  {
    const cbh = Snake.prototype.canBeHit;
    Snake.prototype.canBeHit = function () { if (this.fly14 > 0.35) return false; return cbh.call(this); };
  }

  // Muntdraak: the hoard is its weapon. It lobs a rain of hot coins on where you stand. Coins that miss cool down on the
  // floor, and a quarter of them stay as real coins: what misses, you may keep.
  function lob(room, x0, y0, x1, y1, o) {
    fx(room).lobs.push(Object.assign({ x0, y0, x1: clamp(x1, 14, RW - 14), y1: clamp(y1, 14, RH - 14), t: 0, dur: 0.8, h: 46, hostile: true, r: 15, spin: rnd(TAU), keep: 0.25 }, o));
  }
  function coinRain(room, sn, n, spread, o) {
    const P = G.player;
    for (let i = 0; i < n; i++) {
      const a = rnd(TAU), r = i === 0 ? 0 : rnd(18, spread);
      lob(room, sn.x + Math.cos(sn.ang) * sn.headR, sn.y + Math.sin(sn.ang) * sn.headR, P.x + Math.cos(a) * r, P.y + Math.sin(a) * r, Object.assign({ dur: 0.7 + i * 0.06 }, o));
    }
    sn.mouth = 1; Sfx.coin();
  }
  AI.munt14 = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    if (sn.mode === 'wind') {
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
      sn.ang = turnToward(sn.ang, toP, 6 * dt); sn.drawAng = sn.ang;
      sn.charge14 = clamp01(sn.mt / 0.5);
      if (sn.mt > 0.5) { coinRain(room, sn, 6, 70); sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.4, 3.4); sn.charge14 = 0; }
      return;
    }
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 120, 230, sn.K.speed);
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 360) { sn.mode = 'wind'; sn.mt = 0; Sfx.register ? Sfx.register() : Sfx.coin(); }
  };

  // Neondraak: breathes a stream of neon purple fire. Where the stream ends the fire keeps burning on the floor.
  function neonPatch(room, x, y, o) { fx(room).patches.push(Object.assign({ x: clamp(x, 10, RW - 10), y: clamp(y, 10, RH - 10), r: 20, t: 0, life: 2.6, hostile: true, col: '#d84aff', dmg: 1 }, o)); }
  AI.neon14 = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    if (sn.mode === 'inhale') {
      const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
      sn.ang = turnToward(sn.ang, toP, 5 * dt); sn.drawAng = sn.ang;
      sn.charge14 = clamp01(sn.mt / 0.45);
      if (sn.mt > 0.45) { sn.mode = 'breath'; sn.mt = 0; sn.breathA14 = sn.ang; sn.sweep14 = Math.random() < 0.5 ? 1 : -1; sn.tick14 = 0; Sfx.charge && Sfx.charge(); }
      return;
    }
    if (sn.mode === 'breath') {
      const a = sn.breathA14 + sn.sweep14 * (sn.mt / 0.9 - 0.5) * 0.7;
      sn.drawAng = a; sn.ang = a; sn.mouth = 1; sn.charge14 = 1;
      sn.tick14 -= dt;
      while (sn.tick14 <= 0) {
        sn.tick14 += 0.045;
        const v = spawnVenom(sn.x + Math.cos(a) * sn.headR * 1.3, sn.y + Math.sin(a) * sn.headR * 1.3, a + rnd(-0.08, 0.08), vs() * 1.15, '#d84aff');
        v.kind = 'neon14'; v.r = 5; v.life = 0.62;
      }
      if (sn.mt > 0.9) {
        for (const k of [70, 120, 170]) neonPatch(room, sn.x + Math.cos(a) * k, sn.y + Math.sin(a) * k);
        sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(2.6, 3.4); sn.charge14 = 0;
      }
      return;
    }
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 100, 200, sn.K.speed);
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 260 && clearLine(room, sn.x, sn.y, P.x, P.y)) { sn.mode = 'inhale'; sn.mt = 0; Sfx.hiss(0.9); }
  };

  // Pareldraak: friendly face, mean pearl. Rolls its pearl round the room; with the pearl in its claws it heals the
  // dragons around it. Shoot it first.
  AI.parel14 = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    const { d, toP } = keepAway(sn, room, dt, 130, 240, sn.K.speed);
    if (!sn.pearl14) return;
    sn.healCd14 -= dt;
    if (sn.healCd14 <= 0) {
      sn.healCd14 = 4;
      let n = 0;
      for (const o of room.snakes) {
        if (o === sn || !o.alive || o.dying > 0 || !DRAGON[o.kind] || o.hp >= o.maxHp || dist(o.x, o.y, sn.x, sn.y) > 170) continue;
        o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (o.isBoss ? 0.03 : 0.2)); n++;
        burst(o.x, o.y, 8, '#ffe8a8', { min: 20, max: 70, lmin: 0.3, lmax: 0.6, glow: true });
      }
      if (n) { sn.heal14 = 0.7; floatText(sn.x, sn.y - 24, 'PARELLICHT', '#ffe8a8'); Sfx.cleanse && Sfx.cleanse(); }
    }
    if (sn.heal14 > 0) sn.heal14 -= dt;
    sn.cd -= dt;
    if (sn.cd <= 0 && P.dying <= 0 && d < 360) {
      const sp = 240;
      fx(room).pearls.push({ x: sn.x + Math.cos(toP) * sn.headR, y: sn.y + Math.sin(toP) * sn.headR, vx: Math.cos(toP) * sp, vy: Math.sin(toP) * sp, owner: sn, t: 0, bounce: 3, back: false, r: 7, hitP: new Set(), hostile: true });
      sn.pearl14 = false; sn.cd = rnd(3, 4); Sfx.whoosh10();
    }
  };

  // Toorndraak: the wrath of the sky. Spits fire on the ground; every few seconds it takes off, out of reach, follows
  // you as a shadow and dives down where you stand. Watch the shadow.
  function fireRing(sn, n, k, col = '#ff7a2a') { for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, (i / n) * TAU + rnd(0.3), vs() * k, col); v.kind = 'fire14'; v.r = 5.5; } }
  function flight(sn, room, dt, o) {
    // returns true while the flight is on
    const P = G.player;
    if (sn.mode === 'rise') {
      sn.fly14 = clamp01(sn.mt / o.rise); sn.air9 = 1;
      steerMove(sn, room, sn.ang, sn.K.speed * 0.6, 2, dt);
      if (sn.mt >= o.rise) { sn.mode = 'soar'; sn.mt = 0; }
      return true;
    }
    if (sn.mode === 'soar') {
      sn.fly14 = 1; sn.air9 = 1;
      const a = Math.atan2(P.y - sn.y, P.x - sn.x), dd = dist(P.x, P.y, sn.x, sn.y);
      const sp = Math.min(o.soarSpeed, dd / Math.max(0.05, dt));
      const nx = clamp(sn.x + Math.cos(a) * sp * dt, 20, RW - 20), ny = clamp(sn.y + Math.sin(a) * sp * dt, 20, RH - 20);
      sn.ang = turnToward(sn.ang, a, 5 * dt); sn.moveTo(nx, ny); sn.drawAng = sn.ang;
      if (sn.mt >= o.soar) { sn.mode = 'dive'; sn.mt = 0; sn.dive14 = { x: sn.x, y: sn.y }; Sfx.whoosh10(); }
      return true;
    }
    if (sn.mode === 'dive') {
      sn.fly14 = 1 - clamp01(sn.mt / o.dive); sn.air9 = sn.fly14 > 0.2 ? 1 : 0;
      if (sn.mt >= o.dive) {
        sn.fly14 = 0; sn.air9 = 0; sn.mode = 'move'; sn.mt = 0;
        const [fx0, fy0] = resolveTiles(room, sn.x, sn.y, sn.headR * 0.8);
        sn.moveTo(fx0, fy0);
        hurtEach((Q) => dist(Q.x, Q.y, sn.x, sn.y) < o.slam + Q.r, 1, sn.x, sn.y);
        fireRing(sn, o.ring, 0.7, o.col);
        burst(sn.x, sn.y, 26, o.col, { min: 60, max: 240, rmin: 1.4, rmax: 3.2, lmin: 0.4, lmax: 0.8, glow: true });
        addP({ kind: 'ring', x: sn.x, y: sn.y, vx: 0, vy: 0, r: o.slam, life: 0.45, col: o.col, drag: 0 });
        G.shake = Math.max(G.shake || 0, o.shake); Sfx.thud(); Sfx.boom();
        flashLight(sn.x, sn.y, 160, 0.8, 0.4);
        if (o.done) o.done(sn, room);
      }
      return true;
    }
    return false;
  }
  const TOORN_FLY = { rise: 0.5, soar: 1.3, soarSpeed: 230, dive: 0.42, slam: 34, ring: 10, col: '#ff7a2a', shake: 8 };
  AI.toorn14 = function (sn, room, dt) {
    const P = G.player;
    sn.mt += dt;
    if (flight(sn, room, dt, TOORN_FLY)) { if (sn.mode === 'move') sn.flyCd14 = rnd(5, 7); return; }
    sn.fly14 = 0; sn.air9 = 0;
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 70, 170, sn.K.speed);
    sn.cd -= dt; sn.flyCd14 -= dt;
    if (sn.flyCd14 <= 0 && P.dying <= 0) { sn.mode = 'rise'; sn.mt = 0; Sfx.roar(); floatText(sn.x, sn.y - 26, 'HIJ VLIEGT', '#ffb07a'); return; }
    if (sn.cd <= 0 && P.dying <= 0 && d < 300) {
      fanAt(sn, 3, 0.26, vs() * 0.95, '#ff7a2a');
      for (let i = G.venom.length - 3; i < G.venom.length; i++) if (G.venom[i]) { G.venom[i].kind = 'fire14'; G.venom[i].r = 6; }
      sn.cd = rnd(2, 2.8);
    }
  };
  // Drakenjong: just hatched, hungry, fast. Comes in flocks.
  AI.jong14 = function (sn, room, dt) {
    AI.grub(sn, room, dt);
    sn.wingT14 = (sn.wingT14 || 0) + dt;
  };

  /* ================================================================== De Zonnekeizer */
  BOSS_INFO.keizer14 = { title: 'De Zonnekeizer', sub: 'The oldest dragon in the sky. Its halo is the sun itself.' };
  BOSS_TPL10.keizer14 = ['...........', '.#.......#.', '...........', '...#...#...', '...........', '...#...#...', '...........', '.#.......#.', '...........'];
  CUSTOM_BOSS9.keizer14 = 1;
  CHAOS_BOSSES9.push('keizer14');
  BOSS_ORDER10.push('keizer14');
  BOSS9_INIT.keizer14 = (sn) => {
    sn.mode = 'move'; sn.fly14 = 0; sn.cd = 1.6; sn.rainCd = 4; sn.callCd = 7; sn.diveCd = 99; sn.breathCd = 99; sn.beamCd = 99; sn.ringCd = 99;
    sn.halo14 = 0; sn.charge14 = 0;
  };
  const KEIZER_FLY = { rise: 0.55, soar: 1.5, soarSpeed: 250, dive: 0.5, slam: 46, ring: 16, col: '#ffb03a', shake: 12 };
  function call14(room, sn) {
    const alive = room.snakes.filter((s) => s !== sn && s.alive && DRAGON[s.kind]).length;
    if (alive >= 2) return;
    const kinds = ['munt14', 'neon14', 'parel14'];
    for (let i = 0; i < 2; i++) {
      const a = rnd(TAU), f = nearestFreeCell(room, sn.x + Math.cos(a) * 80, sn.y + Math.sin(a) * 80);
      room.snakes.push(new Snake(pick(kinds), f.x, f.y, { emerge: false, spawnTime: 0.5, delay: i * 0.3, ang: a }));
      burst(f.x, f.y, 14, '#ffcf3a', { min: 30, max: 120, lmin: 0.3, lmax: 0.7, glow: true });
    }
    floatText(sn.x, sn.y - 44, 'MIJN HOF', '#ffe8a8', true); Sfx.horn10 ? Sfx.horn10() : Sfx.roar();
  }
  function sunFan(sn, n, spread, k) {
    const P = G.player, base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * spread, v = spawnVenom(sn.x + Math.cos(a) * sn.headR, sn.y + Math.sin(a) * sn.headR, a, vs() * k, '#ffcf3a'); v.kind = 'sun14'; v.r = 6.5; }
    sn.mouth = 1; Sfx.spit();
  }
  AI.keizer14 = function (sn, room, dt) {
    const P = G.player, st = sn.stage14 || 1, F = fx(room);
    sn.mt += dt; sn.halo14 += dt * (st >= 3 ? 1.6 : 1);
    F.eclipse = approach(F.eclipse || 0, st >= 3 ? 1 : 0, dt * 0.6);
    if (flight(sn, room, dt, KEIZER_FLY)) { if (sn.mode === 'move') sn.diveCd = rnd(7, 9); return; }
    sn.fly14 = 0; sn.air9 = 0;
    if (sn.mode === 'breath') {
      const a = sn.breathA14 + sn.sweep14 * (sn.mt / 1.2 - 0.5) * 1.3;
      sn.drawAng = a; sn.ang = a; sn.mouth = 1;
      sn.tick14 -= dt;
      while (sn.tick14 <= 0) {
        sn.tick14 += 0.04;
        const v = spawnVenom(sn.x + Math.cos(a) * sn.headR * 1.2, sn.y + Math.sin(a) * sn.headR * 1.2, a + rnd(-0.1, 0.1), vs() * 1.2, '#d84aff');
        v.kind = 'neon14'; v.r = 6; v.life = 0.8;
      }
      if (sn.mt > 1.2) { for (const k of [90, 150, 210]) neonPatch(room, sn.x + Math.cos(a) * k, sn.y + Math.sin(a) * k, { r: 24 }); sn.mode = 'move'; sn.mt = 0; }
      return;
    }
    if (sn.mode === 'beam') {
      const B = F.beam;
      if (!B) { sn.mode = 'move'; sn.mt = 0; return; }
      sn.drawAng = B.a; sn.ang = B.a; sn.mouth = B.t > B.warn ? 1 : 0.4;
      return;
    }
    sn.mode = 'move';
    const { d } = keepAway(sn, room, dt, 150, 260, sn.K.speed);
    sn.cd -= dt; sn.rainCd -= dt; sn.callCd -= dt; sn.diveCd -= dt; sn.breathCd -= dt; sn.beamCd -= dt; sn.ringCd -= dt;
    if (P.dying > 0) return;
    if (st >= 3 && sn.beamCd <= 0) {
      // Eclips: a beam of the dark sun sweeps the terrace. A pillar keeps it off you.
      const a = Math.atan2(P.y - sn.y, P.x - sn.x) - 0.9 * (Math.random() < 0.5 ? 1 : -1);
      F.beam = { sn, a, dir: angDiff(a, Math.atan2(P.y - sn.y, P.x - sn.x)) > 0 ? 1 : -1, t: 0, warn: 0.8, dur: 2.2, hitT: new Map(), len: 0 };
      sn.mode = 'beam'; sn.mt = 0; sn.beamCd = rnd(7, 8.5);
      floatText(sn.x, sn.y - 40, 'ZONNESTRAAL', '#fff0c8', true); Sfx.charge && Sfx.charge();
      return;
    }
    if (st >= 2 && sn.diveCd <= 0) { sn.mode = 'rise'; sn.mt = 0; Sfx.roar(); floatText(sn.x, sn.y - 40, 'HOOG IN DE LUCHT', '#ffe8a8', true); return; }
    if (st >= 2 && sn.breathCd <= 0 && d < 300) { sn.mode = 'breath'; sn.mt = 0; sn.breathA14 = Math.atan2(P.y - sn.y, P.x - sn.x); sn.sweep14 = Math.random() < 0.5 ? 1 : -1; sn.tick14 = 0; sn.breathCd = rnd(6, 7.5); Sfx.hiss(1.1); return; }
    if (st >= 3 && sn.ringCd <= 0) {
      // five colours: one ring for each dragon of the court
      const cols = ['#ffcf3a', '#d84aff', '#ff7a2a', '#c4cad4', '#3aa86a'];
      for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) { const v = spawnVenom(sn.x, sn.y, (i / 6) * TAU + j * 0.21, vs() * (0.5 + j * 0.07), cols[j]); v.kind = 'sun14'; v.r = 5; }
      sn.ringCd = rnd(3.5, 4.5); Sfx.boom();
    }
    if (sn.rainCd <= 0) { coinRain(room, sn, st >= 2 ? 10 : 8, 110, { dur: 0.85 }); sn.rainCd = rnd(5.5, 7); }
    if (sn.callCd <= 0) { call14(room, sn); sn.callCd = rnd(11, 13); }
    if (sn.cd <= 0) { sunFan(sn, st >= 2 ? 7 : 5, 0.2, 0.85); sn.cd = st >= 3 ? 1.6 : 2; }
  };
  function keizerStage(sn, room, st) {
    if (st === 2) { sn.diveCd = 1.5; sn.breathCd = 4; }
    if (st === 3) { sn.beamCd = 1.5; sn.ringCd = 3; sn.diveCd = 6; UI.banner('Eclips', 'The sun goes dark. Hide behind a pillar from the beam.', 'curse'); }
  }
  {
    const S = window.__bitten.STAGE14;
    if (S && S.DEF && !S.DEF.keizer14) {
      S.DEF.keizer14 = { sting: ['roar', 'boom'], at: [0.66, 0.33], col: '#ffcf3a', speed: [1, 1.1, 1.18],
        names: [['Middagzon', 'It takes to the sky and dives. Neon fire from its court.', 'Look up. I am the sun.'], ['Eclips', 'The sun goes dark. A beam sweeps the terrace: stand behind a pillar.', 'Even the sun has a dark side.']],
        enter(sn, room, st) { keizerStage(sn, room, st); } };
      // the stage system wraps AI functions when it loads; this boss came later, so wrap it here the same way
      const a0 = AI.keizer14, D = S.DEF.keizer14;
      AI.keizer14 = function (sn, room, dt) {
        if (!sn.isBoss) return a0.call(this, sn, room, dt);
        if (!sn.stage14) { sn.stage14 = 1; sn.stageT14 = 0; sn.win14 = 0; sn.wt14 = G.t; sn.sc14 = sn.sc14 || {}; }
        const ln = D.at[sn.stage14 - 1];
        if ((sn.stagePend14 || (ln != null && sn.hp < sn.maxHp * ln)) && dt > 0 && sn.dying <= 0) stageUp14(sn, room, D);
        if (sn.stageT14 > 0) sn.stageT14 -= dt;
        const sp = D.speed[Math.min(D.speed.length, sn.stage14) - 1];
        return a0.call(this, sn, room, dt * sp);
      };
    }
  }
  // the same stage change as src/85 (shield, clear venom, card), kept small: 85 keeps its own stageUp private
  function stageUp14(sn, room, D) {
    sn.stage14++; sn.stagePend14 = false; sn.stageT14 = 1.1;
    const nm = D.names[sn.stage14 - 2], total = D.at.length + 1;
    if (nm) {
      const pips = Array.from({ length: total }, (_, i) => (i < sn.stage14 ? '◆' : '◇')).join(' ');
      UI.card(`${sn.K.name}  ${pips}`, nm[0], '“' + nm[2] + '”', 'boss stage14', 2.6);
      if (UI.el && UI.el.card) UI.el.card.style.setProperty('--sc', D.col);
      UI.banner(`Stage ${sn.stage14} of ${total}`, nm[1], 'curse');
      floatText(sn.x, sn.y - sn.headR - 26, nm[0].toUpperCase(), D.col, true);
    }
    for (let j = G.venom.length - 1; j >= 0; j--) if (!G.venom[j].friendly) G.venom.splice(j, 1);
    const F = fx(room); F.lobs = F.lobs.filter((l) => !l.hostile); F.beam = null;
    if (room.st14) room.st14.length = 0;
    sn.fly14 = 0; sn.air9 = 0; sn.mode = 'move'; sn.mt = 0;
    burst(sn.x, sn.y, 34, D.col, { min: 80, max: 300, rmin: 1.4, rmax: 3.2, lmin: 0.4, lmax: 0.9, glow: true });
    addP({ kind: 'ring', x: sn.x, y: sn.y, vx: 0, vy: 0, r: sn.headR * 2, life: 0.5, col: D.col, drag: 0 });
    G.shake = Math.max(G.shake || 0, 10); flashLight(sn.x, sn.y, 240, 1, 0.4);
    Sfx.roar(); Sfx.boom();
    D.enter(sn, room, sn.stage14);
    if (G.run) G.run.stages14 = (G.run.stages14 || 0) + 1;
  }

  /* ================================================================== room effects: coins, fire, pearls, beam, storm */
  function update14(dt, room) {
    const F = room.dk14; if (!F) return;
    const fight = fighting10(room);
    if (!fight) { F.lobs = F.lobs.filter((l) => !l.hostile); F.patches = F.patches.filter((p) => !p.hostile); F.pearls = F.pearls.filter((p) => !p.hostile); F.beam = null; F.gust = null; }
    // coins in the air: land, hurt, cool down, sometimes stay
    for (let i = F.lobs.length - 1; i >= 0; i--) {
      const l = F.lobs[i]; l.t += dt; l.spin += dt * 9;
      if (l.t < l.dur) continue;
      F.lobs.splice(i, 1);
      if (l.hostile) hurtEach((Q) => dist(Q.x, Q.y, l.x1, l.y1) < l.r + Q.r - 4, 1, l.x1, l.y1);
      else if (l.dmg) for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(l.x1, l.y1, l.r)) sn.hurt(l.dmg, l.x1, l.y1);
      burst(l.x1, l.y1, 6, '#ffd23a', { min: 30, max: 90, rmin: 1, rmax: 2.2, lmin: 0.2, lmax: 0.45, glow: true });
      const tile = room.tileAt(l.x1, l.y1);
      if (!tile) F.hot.push({ x: l.x1, y: l.y1, t: 0, life: 1.8, keep: l.keep > 0 && rnd(1) < l.keep, ph: l.spin });
    }
    for (let i = F.hot.length - 1; i >= 0; i--) {
      const h = F.hot[i]; h.t += dt;
      if (h.t < h.life) continue;
      F.hot.splice(i, 1);
      if (h.keep) room.pickups.push({ kind: 'coin', x: h.x, y: h.y, vx: 0, vy: 0, t: 0.3, ph: h.ph });
    }
    // fire on the floor
    for (let i = F.patches.length - 1; i >= 0; i--) {
      const p = F.patches[i]; p.t += dt;
      if (p.t >= p.life) { F.patches.splice(i, 1); continue; }
      if (p.hostile) {
        for (const Q of livePlayers14()) {
          if (Q.dying > 0 || Q.dashT > 0 || dist(Q.x, Q.y, p.x, p.y) > p.r + Q.r * 0.5) continue;
          if ((Q.neonT14 || 0) > G.t) continue;
          Q.neonT14 = G.t + 0.75;
          withPlayer(Q, () => Q.hurt(p.dmg, p.x, p.y));
        }
      } else {
        p.tick = (p.tick || 0) - dt;
        if (p.tick <= 0) {
          p.tick = 0.5;
          for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(p.x, p.y, p.r)) { sn.hurt(p.dmg, p.x, p.y); sn.burn = Math.max(sn.burn || 0, 0.6); }
        }
      }
    }
    // pearls: bounce off walls and pillars, then roll home
    for (let i = F.pearls.length - 1; i >= 0; i--) {
      const g = F.pearls[i]; g.t += dt;
      const o = g.owner;
      if (!o || !o.alive || o.dying > 0) { F.pearls.splice(i, 1); continue; }
      if (g.back || g.t > 2.6) {
        g.back = true;
        const a = Math.atan2(o.y - g.y, o.x - g.x), sp = 300;
        g.vx = Math.cos(a) * sp; g.vy = Math.sin(a) * sp;
        if (dist(g.x, g.y, o.x, o.y) < o.headR + 4) { F.pearls.splice(i, 1); o.pearl14 = true; o.healCd14 = Math.min(o.healCd14, 0.6); continue; }
        g.x += g.vx * dt; g.y += g.vy * dt;
      } else {
        let nx = g.x + g.vx * dt, ny = g.y + g.vy * dt, hit = false;
        if (nx < g.r || nx > RW - g.r) { g.vx = -g.vx; nx = clamp(nx, g.r, RW - g.r); hit = true; }
        if (ny < g.r || ny > RH - g.r) { g.vy = -g.vy; ny = clamp(ny, g.r, RH - g.r); hit = true; }
        const tl = room.tileAt(nx, ny);
        if (tl && tl.solid) {
          if (room.tileAt(nx, g.y) && room.tileAt(nx, g.y).solid) g.vx = -g.vx; else g.vy = -g.vy;
          nx = g.x; ny = g.y; hit = true;
        }
        g.x = nx; g.y = ny;
        if (hit) { g.bounce--; Sfx.ballBounce && Sfx.ballBounce(); burst(g.x, g.y, 4, '#fff6e0', { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true }); if (g.bounce < 0) g.back = true; }
      }
      for (const Q of livePlayers14()) {
        if (Q.dying > 0 || g.hitP.has(Q) || dist(Q.x, Q.y, g.x, g.y) > g.r + Q.r - 3) continue;
        g.hitP.add(Q); withPlayer(Q, () => Q.hurt(1, g.x, g.y));
      }
    }
    // the dark sun beam: a ray from the boss that stops at the first pillar
    if (F.beam) {
      const B = F.beam, sn = B.sn; B.t += dt;
      if (!sn || !sn.alive || sn.dying > 0 || B.t >= B.warn + B.dur) { F.beam = null; if (sn) { sn.mode = 'move'; sn.mt = 0; } }
      else {
        if (B.t > B.warn) B.a += B.dir * 0.85 * dt;
        const ca = Math.cos(B.a), sa = Math.sin(B.a);
        let len = sn.headR;
        while (len < 560) { const x = sn.x + ca * len, y = sn.y + sa * len; if (x < 0 || y < 0 || x > RW || y > RH) break; const tl = room.tileAt(x, y); if (tl && tl.shots) break; len += 6; }
        B.len = len;
        if (B.t > B.warn) for (const Q of livePlayers14()) {
          if (Q.dying > 0 || Q.dashT > 0) continue;
          const u = (Q.x - sn.x) * ca + (Q.y - sn.y) * sa;
          if (u < 0 || u > len) continue;
          const off = Math.abs(-(Q.x - sn.x) * sa + (Q.y - sn.y) * ca);
          if (off > 11 + Q.r * 0.6) continue;
          if ((B.hitT.get(Q) || 0) > B.t) continue;
          B.hitT.set(Q, B.t + 0.6);
          withPlayer(Q, () => Q.hurt(1, Q.x, Q.y));
        }
      }
    }
    // storm: gusts push the apples and bend the venom
    if (room.mod === 'storm14' && fight) {
      if (F.gustT == null) F.gustT = rnd(2, 3.5);
      if (F.gust) {
        const g = F.gust; g.t += dt;
        const k = Math.sin(Math.PI * clamp01(g.t / g.dur));
        for (const Q of livePlayers14()) {
          if (Q.dying > 0) continue;
          let nx = Q.x + Math.cos(g.a) * 95 * k * dt, ny = Q.y + Math.sin(g.a) * 95 * k * dt;
          [nx, ny] = Q.flyer ? resolveFly10(room, nx, ny, Q.r) : resolveTiles(room, nx, ny, Q.r);
          Q.x = clamp(nx, Q.r, RW - Q.r); Q.y = clamp(ny, Q.r, RH - Q.r);
        }
        for (const v of G.venom) if (!v.friendly) { v.vx += Math.cos(g.a) * 120 * k * dt; v.vy += Math.sin(g.a) * 120 * k * dt; }
        if (g.t >= g.dur) { F.gust = null; F.gustT = rnd(4, 6); }
      } else {
        F.gustT -= dt;
        if (F.gustT <= 0) {
          const a = Math.floor(rnd(4)) * (Math.PI / 2) + rnd(-0.3, 0.3);
          F.gust = { a, t: 0, dur: 1.8 };
          floatText(RW / 2, 40, 'WINDSTOOT', '#e8f4ff', true); Sfx.gust ? Sfx.gust() : Sfx.whoosh10();
        }
      }
    }
  }
  {
    const cb0 = combat9;
    combat9 = function (room) {
      cb0(room);
      if (room.mod === 'storm14') { const F = fx(room); F.gust = null; F.gustT = null; }
    };
    const ur0 = updateRoom9;
    updateRoom9 = function (dt, room, frozen) {
      ur0(dt, room, frozen);
      if (room.dk14 && !frozen && dt > 0) safe(() => update14(dt, room));
    };
    Hooks.layer('Game.enterRoom', 'v14 draken', function (next, room, entry) {
      const r = next.call(this, room, entry);
      if (room && (room.mod === 'storm14' || inSky())) fx(room);
      return r;
    });
  }

  /* ================================================================== drawing: the terrace */
  const CLOUD = '#ffffff', CLOUD_SH = 'rgba(150,170,215,0.55)';
  function puff(c, x, y, r, a) {
    c.fillStyle = `rgba(150,170,215,${(0.45 * a).toFixed(3)})`; circle(c, x + r * 0.12, y + r * 0.22, r);
    c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; circle(c, x, y, r);
    c.fillStyle = `rgba(255,255,255,${(0.6 * a).toFixed(3)})`; circle(c, x - r * 0.3, y - r * 0.32, r * 0.5);
  }
  function cloudBank(c, x, y, w, rng, a = 1, big = 1) {
    const n = 3 + Math.floor(w / 14);
    for (let i = 0; i < n; i++) { const u = i / Math.max(1, n - 1); puff(c, x + (u - 0.5) * w, y + (rng() - 0.5) * 8 * big, (8 + rng() * 9) * big * (1 - Math.abs(u - 0.5) * 0.7), a); }
  }
  // a ruyi cloud: the curled cloud of old dragon art
  function ruyi(c, x, y, s, rot, col) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, 5, Math.PI * 0.2, Math.PI * 1.9); c.stroke();
    c.beginPath(); c.arc(-7, 2, 3.5, Math.PI * 1.1, Math.PI * 2.6); c.stroke();
    c.beginPath(); c.arc(7, 2, 3.5, Math.PI * 0.4, Math.PI * 1.9, true); c.stroke();
    c.beginPath(); c.moveTo(-10, 5); c.quadraticCurveTo(0, 10, 12, 5); c.stroke();
    c.restore();
  }
  // the mosaic: a red dragon coiled round a pearl, in a ring of red lacquer and gold
  function mosaic(c, x, y, R, rng) {
    c.save();
    c.fillStyle = 'rgba(60,30,10,0.12)'; circle(c, x + 2, y + 3, R + 4);
    c.fillStyle = '#b3262a'; circle(c, x, y, R + 3);
    c.strokeStyle = '#e8b840'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R + 1, 0, TAU); c.stroke();
    const g = c.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R * 0.86);
    g.addColorStop(0, '#8ad8c0'); g.addColorStop(1, '#3a9a88');
    c.fillStyle = g; circle(c, x, y, R * 0.86);
    c.strokeStyle = '#e8b840'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, R * 0.86, 0, TAU); c.stroke();
    // gold studs on the red ring
    c.fillStyle = '#f2cf5a';
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; circle(c, x + Math.cos(a) * (R * 0.93), y + Math.sin(a) * (R * 0.93), 1.3); }
    for (let i = 0; i < 6; i++) ruyi(c, x + Math.cos(i / 6 * TAU) * R * 0.6, y + Math.sin(i / 6 * TAU) * R * 0.6, R / 90, i / 6 * TAU + Math.PI / 2, 'rgba(230,255,245,0.5)');
    // the dragon: a chain of scales on a spiral, head chasing the pearl in the middle
    const turns = 1.25, n = 46, rot = rng() * TAU;
    const at = (u) => { const a = rot + u * turns * TAU, r = R * (0.72 - u * 0.48); return [x + Math.cos(a) * r, y + Math.sin(a) * r]; };
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), [px, py] = at(u), r = R * (0.05 + 0.05 * Math.sin(Math.PI * Math.min(1, u * 1.3)));
      c.fillStyle = '#5a0c10'; circle(c, px, py, r + 1.2);
      c.fillStyle = i % 2 ? '#d8402e' : '#c83828'; circle(c, px, py, r);
      if (i % 3 === 0) { c.fillStyle = '#f2cf5a'; circle(c, px, py, r * 0.35); }
    }
    const [hx, hy] = at(1), [bx, by] = at(0.96), ha = Math.atan2(hy - by, hx - bx);
    c.save(); c.translate(hx, hy); c.rotate(ha);
    c.fillStyle = '#5a0c10'; ell(c, R * 0.04, 0, R * 0.14, R * 0.09); c.fill();
    c.fillStyle = '#d8402e'; ell(c, R * 0.04, 0, R * 0.12, R * 0.075); c.fill();
    c.strokeStyle = '#f2cf5a'; c.lineWidth = 1;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-R * 0.04, s * R * 0.05); c.quadraticCurveTo(-R * 0.14, s * R * 0.14, -R * 0.2, s * R * 0.1); c.stroke(); }
    c.restore();
    // the tail ends in a gold tuft, the pearl glows
    const [tx, ty] = at(0);
    c.fillStyle = '#f2cf5a'; for (let i = 0; i < 4; i++) { const a = rot - 0.6 + i * 0.25; ell(c, tx + Math.cos(a) * 5, ty + Math.sin(a) * 5, 4, 1.6, a); c.fill(); }
    const pg = c.createRadialGradient(x - 2, y - 2, 1, x, y, R * 0.13);
    pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#e8d8c0');
    c.fillStyle = 'rgba(255,250,220,0.35)'; circle(c, x, y, R * 0.2);
    c.fillStyle = pg; circle(c, x, y, R * 0.12);
    c.restore();
  }
  function skyFloor14(c, room, L, rng) {
    const g = c.createLinearGradient(0, 0, RW, RH);
    g.addColorStop(0, '#f2ead6'); g.addColorStop(1, '#ddd0b4');
    c.fillStyle = g; c.fillRect(0, 0, RW, RH);
    // marble flagstones with gold seams
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const x = col * T, y = r * T, v = rng();
      c.fillStyle = v < 0.33 ? '#efe6d2' : v < 0.66 ? '#e8dec8' : '#e2d6be';
      rrect(c, x + 1, y + 1, T - 2, T - 2, 2); c.fill();
      c.strokeStyle = 'rgba(150,130,100,0.18)'; c.lineWidth = 0.7;
      if (rng() < 0.6) { c.beginPath(); let px = x + rng() * T, py = y + 3; c.moveTo(px, py); for (let i = 0; i < 4; i++) { px += (rng() - 0.5) * 12; py += 8 + rng() * 4; c.lineTo(clamp(px, x + 2, x + T - 2), Math.min(py, y + T - 2)); } c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + 2, y + 2, T - 4, 1.2);
    }
    c.strokeStyle = 'rgba(201,162,74,0.55)'; c.lineWidth = 1;
    for (let col = 1; col < COLS; col++) { c.beginPath(); c.moveTo(col * T, 0); c.lineTo(col * T, RH); c.stroke(); }
    for (let r = 1; r < ROWS; r++) { c.beginPath(); c.moveTo(0, r * T); c.lineTo(RW, r * T); c.stroke(); }
    // the middle: the dragon mosaic, or a compass of clouds
    const kind = rng();
    if (room.type === 'boss' || kind < 0.65) mosaic(c, RW / 2, RH / 2, room.type === 'boss' ? 118 : 96, rng);
    else {
      c.strokeStyle = 'rgba(58,154,136,0.45)'; c.lineWidth = 2;
      c.beginPath(); c.arc(RW / 2, RH / 2, 70, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i++) ruyi(c, RW / 2 + Math.cos(i / 8 * TAU) * 70, RH / 2 + Math.sin(i / 8 * TAU) * 70, 1.3, i / 8 * TAU + Math.PI / 2, 'rgba(58,154,136,0.6)');
      c.fillStyle = 'rgba(179,38,42,0.6)'; circle(c, RW / 2, RH / 2, 10);
    }
    // jade clouds in the corners
    for (const [x, y, a] of [[34, 30, 0.6], [RW - 34, 30, 2.5], [34, RH - 30, -0.6], [RW - 34, RH - 30, -2.5]]) ruyi(c, x, y, 1.5, a, 'rgba(58,154,136,0.45)');
    // blossom petals
    for (let i = 0; i < 26; i++) {
      const x = rng() * RW, y = rng() * RH, a = rng() * TAU;
      c.fillStyle = rng() < 0.5 ? 'rgba(255,170,190,0.75)' : 'rgba(255,214,224,0.8)';
      ell(c, x, y, 2.2, 1.2, a); c.fill();
    }
    // the terrace ends in clouds: banks spill over the edges
    for (let x = 10; x < RW; x += 34 + rng() * 22) { cloudBank(c, x, -2 + rng() * 4, 30 + rng() * 20, rng, 0.95, 0.8); cloudBank(c, x + 14, RH + 2 - rng() * 4, 30 + rng() * 20, rng, 0.95, 0.8); }
    for (let y = 20; y < RH; y += 40 + rng() * 26) { puff(c, -2 + rng() * 4, y, 9 + rng() * 6, 0.92); puff(c, RW + 2 - rng() * 4, y + 12, 9 + rng() * 6, 0.92); }
  }
  // what the walls were: open sky, a sea of clouds far below, and a red balustrade round the terrace
  const PILLAR = { boss: '#f2cf5a', portal: '#8a4aff', chest: '#d8a838', challenge: '#e85a3a', offering: '#7a1428', pantry: '#6f9a3a', shop: '#1aa0e0', vote: '#e8742a', vault: '#c9a000',
    miniboss: '#e8763a', survival: '#e89030', library: '#7a3aaa', spring: '#3aa89a', gamble: '#f2c230', tank: '#2f9a4a', kapper: '#e8e2d0', gym: '#b4f03c', courtroom: '#8a6a3a' };
  function specialOf(room, target) {
    for (const k of ['boss', 'portal', 'vault', 'miniboss', 'chest', 'challenge', 'survival', 'offering', 'library', 'tank', 'gym', 'kapper', 'courtroom', 'pantry', 'spring', 'shop', 'gamble', 'vote']) if (target.type === k || room.type === k) return k;
    if (target.type === 'chaosboss' || room.type === 'chaosboss') return 'boss';
    return null;
  }
  function lantern(c, x, y, s, col) {
    c.strokeStyle = '#3a1a08'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y - s * 1.6); c.lineTo(x, y - s * 0.9); c.stroke();
    c.fillStyle = '#3a1a08'; ell(c, x, y, s * 0.95, s * 1.05); c.fill();
    c.fillStyle = col; ell(c, x, y, s * 0.8, s * 0.9); c.fill();
    c.fillStyle = 'rgba(255,230,150,0.55)'; ell(c, x - s * 0.2, y - s * 0.15, s * 0.3, s * 0.5); c.fill();
    c.fillStyle = '#e8b840'; c.fillRect(x - s * 0.5, y - s * 1.0, s, s * 0.22); c.fillRect(x - s * 0.5, y + s * 0.8, s, s * 0.22);
    c.strokeStyle = '#e8b840'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y + s); c.lineTo(x, y + s * 1.6); c.stroke();
  }
  function skyWalls14(c, room, L, rng) {
    c.save();
    // the sky band, with gaps where doors are kept for the bridges drawn after
    c.beginPath(); c.rect(-WALL, -WALL, VIEW_W, VIEW_H); c.rect(0, 0, RW, RH); c.clip('evenodd');
    const g = c.createRadialGradient(RW / 2, RH / 2, Math.min(RW, RH) * 0.5, RW / 2, RH / 2, Math.max(RW, RH) * 0.75);
    g.addColorStop(0, '#d8ecff'); g.addColorStop(1, '#8ebfee');
    c.fillStyle = g; c.fillRect(-WALL, -WALL, VIEW_W, VIEW_H);
    // the cloud sea below
    for (let i = 0; i < 70; i++) {
      const side = Math.floor(rng() * 4), u = rng(), w = rng() * WALL;
      const x = side < 2 ? -WALL + u * VIEW_W : side === 2 ? -w : RW + w;
      const y = side === 0 ? -w : side === 1 ? RH + w : -WALL + u * VIEW_H;
      puff(c, x, y, 5 + rng() * 9, 0.5 + rng() * 0.45);
    }
    c.restore();
    // the balustrade: a red rail with gold, posts every tile, gaps at the doors
    const gap = (k) => (room.doors[k] ? DOOR_HW + 8 : 0);
    const rail = (x0, y0, x1, y1) => { if (Math.hypot(x1 - x0, y1 - y0) < 2) return; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    const rails = (o) => {
      rail(-3, -3, RW / 2 - gap('n'), -3); rail(RW / 2 + gap('n'), -3, RW + 3, -3);
      rail(-3, RH + 3, RW / 2 - gap('s'), RH + 3); rail(RW / 2 + gap('s'), RH + 3, RW + 3, RH + 3);
      rail(-3, -3, -3, RH / 2 - gap('w')); rail(-3, RH / 2 + gap('w'), -3, RH + 3);
      rail(RW + 3, -3, RW + 3, RH / 2 - gap('e')); rail(RW + 3, RH / 2 + gap('e'), RW + 3, RH + 3);
      void o;
    };
    c.lineCap = 'butt';
    c.strokeStyle = 'rgba(40,50,90,0.3)'; c.lineWidth = 7; c.save(); c.translate(1.5, 3); rails(); c.restore();
    c.strokeStyle = '#3a0608'; c.lineWidth = 6.4; rails();
    c.strokeStyle = '#b3262a'; c.lineWidth = 4.4; rails();
    c.strokeStyle = '#f2cf5a'; c.lineWidth = 1.1; rails();
    const post = (x, y) => {
      c.fillStyle = 'rgba(40,50,90,0.3)'; rrect(c, x - 4, y - 2, 9, 9, 1.5); c.fill();
      c.fillStyle = '#3a0608'; rrect(c, x - 5, y - 5, 10, 10, 2); c.fill();
      c.fillStyle = '#c8302e'; rrect(c, x - 3.8, y - 3.8, 7.6, 7.6, 1.5); c.fill();
      c.fillStyle = '#f2cf5a'; circle(c, x, y, 2.3); c.fillStyle = '#fff2b0'; circle(c, x - 0.6, y - 0.6, 0.9);
    };
    const near = (k, v, mid) => room.doors[k] && Math.abs(v - mid) < DOOR_HW + 8;
    for (let x = 0; x <= RW; x += T) { if (!near('n', x, RW / 2)) post(x, -3); if (!near('s', x, RW / 2)) post(x, RH + 3); }
    for (let y = T; y < RH; y += T) { if (!near('w', y, RH / 2)) post(-3, y); if (!near('e', y, RH / 2)) post(RW + 3, y); }
    // corner towers with a lantern each
    for (const [x, y] of [[-WALL / 2, -WALL / 2], [RW + WALL / 2, -WALL / 2], [-WALL / 2, RH + WALL / 2], [RW + WALL / 2, RH + WALL / 2]]) {
      c.fillStyle = 'rgba(40,50,90,0.35)'; circle(c, x + 2, y + 4, 11);
      c.fillStyle = '#3a0608'; circle(c, x, y, 11);
      c.fillStyle = '#1e6a5a'; circle(c, x, y, 9.5);
      c.strokeStyle = '#f2cf5a'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, 9.5, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.stroke(); }
      c.fillStyle = '#f2cf5a'; circle(c, x, y, 2.6);
    }
    // the doors: a stone bridge into the clouds between two lantern posts
    for (const k in room.doors) {
      const target = room.doors[k];
      if (target.sealed) continue;
      const sp = specialOf(room, target), col = (sp && PILLAR[sp]) || '#c8302e';
      c.save(); doorTransform(c, k);
      const bg = c.createLinearGradient(0, -WALL - 2, 0, 0);
      bg.addColorStop(0, 'rgba(255,255,255,0.95)'); bg.addColorStop(0.45, '#e2d6be'); bg.addColorStop(1, '#d8ccb0');
      c.fillStyle = bg; c.fillRect(-DOOR_HW + 3, -WALL - 2, DOOR_HW * 2 - 6, WALL + 3);
      c.strokeStyle = 'rgba(120,100,70,0.35)'; c.lineWidth = 0.8;
      for (let y = -WALL * 0.45; y < 0; y += 5) { c.beginPath(); c.moveTo(-DOOR_HW + 3, y); c.lineTo(DOOR_HW - 3, y); c.stroke(); }
      c.strokeStyle = '#b3262a'; c.lineWidth = 2.4;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (DOOR_HW - 2), 0); c.lineTo(s * (DOOR_HW - 2), -WALL * 0.6); c.stroke(); }
      puff(c, -DOOR_HW + 6, -WALL - 1, 9, 0.9); puff(c, DOOR_HW - 6, -WALL, 8, 0.9); puff(c, 0, -WALL - 4, 10, 0.95);
      for (const s of [-1, 1]) {
        const x = s * (DOOR_HW + 4);
        c.fillStyle = '#3a0608'; rrect(c, x - 4.5, -WALL + 2, 9, WALL, 2); c.fill();
        c.fillStyle = col; rrect(c, x - 3.2, -WALL + 3.2, 6.4, WALL - 2.4, 1.5); c.fill();
        c.fillStyle = '#f2cf5a'; c.fillRect(x - 3.2, -WALL * 0.62, 6.4, 1.6);
        lantern(c, x, -WALL * 0.3, 3.6, sp === 'boss' ? '#ffcf3a' : '#e8402e');
      }
      if (sp === 'boss') {
        // a gold dragon head over the boss door
        c.fillStyle = '#3a2408'; ell(c, 0, -WALL * 0.78, 8, 5); c.fill();
        c.fillStyle = '#f2cf5a'; ell(c, 0, -WALL * 0.78, 6.6, 3.8); c.fill();
        c.fillStyle = '#b3262a'; circle(c, -2.4, -WALL * 0.8, 1); circle(c, 2.4, -WALL * 0.8, 1);
      }
      c.restore();
    }
  }
  {
    let noBones = false;
    const ft0 = floorTiles9;
    floorTiles9 = function (c, room, L, rng) {
      noBones = L.deco === SET && skyRoom(room);
      if (noBones) { skyFloor14(c, room, L, rng); return true; }
      return ft0(c, room, L, rng);
    };
    const db0 = drawBone;
    drawBone = function () { if (!noBones) return db0.apply(this, arguments); };
    const dfe0 = drawFloorExtras;
    drawFloorExtras = function () { noBones = false; return dfe0.apply(this, arguments); };
    const fd0 = floorDeco9;
    floorDeco9 = function (c, room, L, rng) { if (L.deco === SET && skyRoom(room)) return true; return fd0(c, room, L, rng); };
    const dw0 = drawWalls9;
    drawWalls9 = function (c, room, L, rng) {
      dw0(c, room, L, rng);
      if (L.deco === SET && skyRoom(room)) safe(() => skyWalls14(c, room, L, rng));
    };
  }
  // the rocks: a red lacquer column with a gold dragon wound round it, a hoard of gold, or a jade dragon statue
  ROCK9.zuil14 = (c, o, rng, L) => {
    const x = o.x, y = o.y, k = Math.floor((o.seed || rng()) * 10);
    c.fillStyle = 'rgba(40,30,60,0.28)'; ell(c, x + 4, y + 10, 17, 7); c.fill();
    if (k < 5) {
      // column, seen from above: a round cap with a gold dragon coiled on it
      c.fillStyle = '#3a0608'; circle(c, x, y, 16);
      const g = c.createRadialGradient(x - 5, y - 6, 2, x, y, 16);
      g.addColorStop(0, '#e85a4a'); g.addColorStop(0.6, '#b3262a'); g.addColorStop(1, '#6a0c10');
      c.fillStyle = g; circle(c, x, y, 14.8);
      c.strokeStyle = '#f2cf5a'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.stroke();
      for (let i = 0; i < 22; i++) {
        const u = i / 21, a = u * TAU * 1.15 + k, r = 10.5 - u * 6;
        c.fillStyle = '#6a4a10'; circle(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 2.3 - u * 0.8);
        c.fillStyle = i % 2 ? '#f2cf5a' : '#e8b840'; circle(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 1.8 - u * 0.7);
      }
      const ha = TAU * 1.15 + k; c.fillStyle = '#f2cf5a'; ell(c, x + Math.cos(ha) * 4.5, y + Math.sin(ha) * 4.5, 3, 2, ha); c.fill();
      c.fillStyle = '#fffbe8'; circle(c, x, y, 1.8);
    } else if (k < 8) {
      // a hoard: a heap of coins with a goblet and a gem
      for (let i = 0; i < 26; i++) {
        const a = rng() * TAU, r = Math.sqrt(rng()) * 14, cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r * 0.85;
        c.fillStyle = '#6a4a10'; ell(c, cx, cy + 0.6, 3.6, 2.6); c.fill();
        c.fillStyle = rng() < 0.5 ? '#f2cf5a' : '#e8b030'; ell(c, cx, cy, 3.3, 2.3); c.fill();
        c.fillStyle = 'rgba(255,250,200,0.7)'; ell(c, cx - 0.8, cy - 0.6, 1.2, 0.7); c.fill();
      }
      c.fillStyle = '#6a4a10'; circle(c, x + 4, y - 3, 5.5); c.fillStyle = '#f2cf5a'; circle(c, x + 4, y - 3, 4.4); c.fillStyle = '#8a6420'; circle(c, x + 4, y - 3, 2.6);
      c.fillStyle = '#2a0c40'; circle(c, x - 6, y + 2, 3.2); c.fillStyle = k === 6 ? '#3ad88a' : '#d84aff'; circle(c, x - 6, y + 2, 2.4); c.fillStyle = '#ffffff'; circle(c, x - 6.8, y + 1.2, 0.8);
    } else {
      // a jade dragon statue on a plinth, head turned
      c.fillStyle = '#4a4436'; rrect(c, x - 15, y - 15, 30, 30, 4); c.fill();
      c.fillStyle = '#d8ccb0'; rrect(c, x - 13.5, y - 13.5, 27, 27, 3); c.fill();
      c.strokeStyle = 'rgba(120,100,70,0.4)'; c.lineWidth = 0.8; c.strokeRect(x - 10, y - 10, 20, 20);
      for (let i = 0; i < 9; i++) { const u = i / 8, a = -2.2 + u * 3.6, r = 7; c.fillStyle = '#0e3a2a'; circle(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 3.4 - u); c.fillStyle = i % 2 ? '#3aa88a' : '#2a8a6a'; circle(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 2.7 - u); }
      c.fillStyle = '#0e3a2a'; ell(c, x - 6, y - 5, 5.5, 4, -0.7); c.fill();
      c.fillStyle = '#4ac89a'; ell(c, x - 6, y - 5, 4.4, 3, -0.7); c.fill();
      c.fillStyle = '#f2cf5a'; circle(c, x - 7.5, y - 6.5, 0.9);
    }
  };
  // dragon eggs in a nest of gold straw: they crack as you hit them
  const EGG = [['#d8402e', '#f2a83a'], ['#3a1468', '#d84aff'], ['#c4cad4', '#ffd23a'], ['#2a8a5a', '#c8ff8a']];
  URN9.drakei14 = (c, o, L, t) => {
    const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x + sh, y = o.y;
    const [a, b] = EGG[Math.floor((o.seed || 0) * 4) % 4];
    c.fillStyle = 'rgba(40,30,60,0.3)'; ell(c, x + 2, y + 10, 13, 5); c.fill();
    c.strokeStyle = '#a8842a'; c.lineWidth = 1.4;
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; c.beginPath(); c.moveTo(x + Math.cos(an) * 8, y + 5 + Math.sin(an) * 4); c.lineTo(x + Math.cos(an + 0.5) * 14, y + 5 + Math.sin(an + 0.5) * 6); c.stroke(); }
    c.fillStyle = '#1a0a08'; ell(c, x, y - 1, 9.8, 12.8); c.fill();
    const g = c.createRadialGradient(x - 3, y - 6, 1, x, y, 13);
    g.addColorStop(0, b); g.addColorStop(0.5, a); g.addColorStop(1, '#1a0a08');
    c.fillStyle = g; ell(c, x, y - 1, 8.6, 11.6); c.fill();
    c.fillStyle = rgba(b, 0.7);
    for (let i = 0; i < 6; i++) { const sx = x + ((i % 3) - 1) * 4.5, sy = y - 6 + Math.floor(i / 3) * 6 + (i % 2) * 2; c.beginPath(); c.arc(sx, sy, 2.2, 0, Math.PI); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, x - 3, y - 6, 2, 3.5, -0.3); c.fill();
    if (o.hp < o.max) {
      c.strokeStyle = '#1a0a08'; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(x - 6, y - 2); c.lineTo(x - 2, y + 1); c.lineTo(x + 1, y - 3); c.lineTo(x + 5, y); if (o.hp < o.max - 1) { c.moveTo(x + 1, y - 3); c.lineTo(x + 2, y - 8); } c.stroke();
      c.fillStyle = rgba(b, 0.6); circle(c, x - 1, y - 1, 2);
    }
  };

  /* ------------------------------------------------------------------ drawing: the live sky */
  // cloud shadows sail over the terrace, a big dragon flies over now and then, the wind writes lines, petals blow past
  function dragonShadow(c, x, y, a, s, t, alpha) {
    c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
    c.fillStyle = `rgba(30,40,80,${alpha.toFixed(3)})`;
    for (let i = 0; i < 14; i++) { const u = i / 13; circle(c, -u * 120, Math.sin(t * 3 - u * 5) * 10 * u, 10 - u * 7); }
    ell(c, 14, 0, 14, 9); c.fill();
    const f = Math.sin(t * 5) * 0.4;
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(-14, sd * 6);
      c.quadraticCurveTo(-30, sd * (60 + f * 30), -62, sd * (70 + f * 34)); c.quadraticCurveTo(-52, sd * 40, -44, sd * 6); c.closePath(); c.fill();
    }
    c.restore();
  }
  function liveSky(c, room, t) {
    const s0 = room.gx * 31.7 + room.gy * 17.3;
    // cloud shadows
    for (let i = 0; i < 3; i++) {
      const sp = 9 + hash(s0 + i) * 8, w = RW + 360;
      const x = ((hash(s0 + i * 3.1) * w + t * sp) % w) - 180, y = hash(s0 + i * 5.7) * RH;
      const r = 70 + hash(s0 + i * 7.7) * 60;
      const g = c.createRadialGradient(x, y, r * 0.2, x, y, r);
      g.addColorStop(0, 'rgba(60,80,140,0.11)'); g.addColorStop(1, 'rgba(60,80,140,0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // a dragon flies over
    const per = 15 + hash(s0 + 9) * 6, ph = (t + hash(s0 + 11) * per) % per;
    if (ph < 4) {
      const k = Math.floor((t + hash(s0 + 11) * per) / per), u = ph / 4, a = (hash(s0 + k * 2.3) - 0.5) * 1.2 + (hash(s0 + k) < 0.5 ? 0 : Math.PI);
      const x0 = RW / 2 - Math.cos(a) * 480, y0 = RH / 2 - Math.sin(a) * 300 + (hash(s0 + k * 4.1) - 0.5) * 120;
      dragonShadow(c, x0 + Math.cos(a) * 960 * u, y0 + Math.sin(a) * 600 * u, a, 0.9, t, 0.12);
    }
    // wind lines
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const per2 = 3 + hash(s0 + i * 1.7) * 2, u = ((t + hash(s0 + i * 9.1) * per2) % per2) / per2;
      const x = -40 + u * (RW + 80), y = hash(s0 + i * 2.9 + Math.floor((t + hash(s0 + i * 9.1) * per2) / per2)) * RH;
      const al = Math.sin(Math.PI * u) * 0.35;
      c.strokeStyle = `rgba(255,255,255,${al.toFixed(3)})`; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(x - 30, y); c.quadraticCurveTo(x - 10, y - 3, x, y + Math.sin(t * 2 + i) * 2); c.stroke();
    }
    // petals
    for (let i = 0; i < 9; i++) {
      const per3 = 6 + hash(s0 + i * 3.3) * 4, u = ((t + hash(s0 + i * 6.1) * per3) % per3) / per3;
      const x = -10 + u * (RW + 20), y = hash(s0 + i * 4.4) * RH + Math.sin(t * 1.5 + i) * 14;
      c.fillStyle = i % 2 ? 'rgba(255,170,190,0.85)' : 'rgba(255,220,230,0.9)';
      ell(c, x, y, 2.4, 1.2, t * 3 + i); c.fill();
    }
    // the cloud sea moves along the balustrade
    for (let i = 0; i < 10; i++) {
      const w = VIEW_W + 40, u = ((hash(s0 + i * 1.9) * w + t * (6 + i % 3 * 2)) % w) - WALL - 20;
      const top = i % 2 === 0, y = top ? -WALL + 6 + hash(s0 + i) * 8 : RH + WALL - 6 - hash(s0 + i) * 8;
      puff(c, u, y, 7 + hash(s0 + i * 2) * 5, 0.55);
    }
  }
  /* ------------------------------------------------------------------ drawing: the dragons */
  const dkOf = (sn) => sn.K.dk;
  // wings and legs go under the body
  function under(c, sn, t) {
    const D = dkOf(sn), pts = sn.pts, n = pts.length; if (!n) return;
    const O = sn.K.outline, fl = sn.fly14 || 0;
    if (D.legs) {
      const at = D.legs === 2 ? [1, Math.floor(n * 0.4), Math.floor(n * 0.7)] : [1, Math.floor(n * 0.55)];
      for (const k of at) {
        const p = pts[Math.min(n - 1, k)]; if (!p || p.hid) continue;
        const [dx, dy] = bodyDir(sn, Math.min(n - 1, k)), nx = -dy, ny = dx;
        for (const s of [-1, 1]) {
          const st = Math.sin(t * 9 + k + (s > 0 ? Math.PI : 0)) * 0.4 * (sn.mode === 'move' ? 1 : 0.3);
          const L1 = p.r * 1.05, ex = p.x + nx * s * (p.r + L1) + dx * (L1 * st), ey = p.y + ny * s * (p.r + L1) + dy * (L1 * st);
          c.strokeStyle = O; c.lineWidth = p.r * 0.62; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(ex, ey); c.stroke();
          c.strokeStyle = sn.K.body2; c.lineWidth = p.r * 0.38; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(ex, ey); c.stroke();
          c.strokeStyle = D.claw; c.lineWidth = Math.max(0.9, p.r * 0.14);
          for (let j = -1; j <= 1; j++) { const ca = Math.atan2(ey - p.y, ex - p.x) + j * 0.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(ca) * p.r * 0.45, ey + Math.sin(ca) * p.r * 0.45); c.stroke(); }
        }
      }
    }
    if (D.wings) {
      const k = Math.min(n - 1, D.baby ? 0 : 1), p = pts[k]; if (!p || p.hid) return;
      const [dx, dy] = bodyDir(sn, k), nx = -dy, ny = dx;
      const span = sn.headR * (D.baby ? 1.7 : sn.isBoss ? 3.4 : 2.7) * (1 + fl * 0.35);
      const flap = Math.sin(t * (fl > 0 ? 11 : D.baby ? 14 : 4) + (sn.blinkSeed || 0)) * (fl > 0 ? 0.5 : 0.18);
      for (const s of [-1, 1]) {
        const w = span * (1 + flap * 0.4);
        const rx = p.x + nx * s * p.r * 0.5, ry = p.y + ny * s * p.r * 0.5;
        const tip = [rx + nx * s * w - dx * w * 0.35, ry + ny * s * w - dy * w * 0.35];
        const f1 = [rx + nx * s * w * 0.72 - dx * w * 0.8, ry + ny * s * w * 0.72 - dy * w * 0.8];
        const f2 = [rx + nx * s * w * 0.32 - dx * w * 0.95, ry + ny * s * w * 0.32 - dy * w * 0.95];
        const back = [rx - dx * p.r * 2.6, ry - dy * p.r * 2.6];
        const elbow = [rx + nx * s * w * 0.55 + dx * w * 0.12, ry + ny * s * w * 0.55 + dy * w * 0.12];
        const mem = () => {
          c.beginPath(); c.moveTo(rx, ry); c.lineTo(elbow[0], elbow[1]); c.lineTo(tip[0], tip[1]);
          c.quadraticCurveTo((tip[0] + f1[0]) / 2 - dx * 4, (tip[1] + f1[1]) / 2 - dy * 4, f1[0], f1[1]);
          c.quadraticCurveTo((f1[0] + f2[0]) / 2 - dx * 3, (f1[1] + f2[1]) / 2 - dy * 3, f2[0], f2[1]);
          c.quadraticCurveTo((f2[0] + back[0]) / 2 - dx * 3, (f2[1] + back[1]) / 2 - dy * 3, back[0], back[1]); c.closePath();
        };
        mem(); c.fillStyle = O; c.lineWidth = 3; c.strokeStyle = O; c.stroke();
        mem(); c.fillStyle = D.wing; c.fill();
        mem(); c.fillStyle = D.wingIn; c.save(); c.clip(); c.beginPath(); c.moveTo(back[0], back[1]); c.lineTo(f2[0], f2[1]); c.lineTo(f1[0], f1[1]); c.lineTo(elbow[0], elbow[1]); c.closePath(); c.fill(); c.restore();
        c.strokeStyle = D.rib; c.lineWidth = Math.max(1, sn.headR * 0.12);
        c.beginPath(); c.moveTo(rx, ry); c.lineTo(elbow[0], elbow[1]); c.lineTo(tip[0], tip[1]); c.moveTo(elbow[0], elbow[1]); c.lineTo(f1[0], f1[1]); c.moveTo(elbow[0], elbow[1]); c.lineTo(f2[0], f2[1]); c.stroke();
        c.fillStyle = D.claw; circle(c, elbow[0], elbow[1], Math.max(1.2, sn.headR * 0.12));
        if (D.neon) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(224,90,255,0.55)'; c.lineWidth = 1.2; mem(); c.stroke(); c.restore(); }
      }
    }
  }
  // scales, spine plates and the tail tip go over the body
  function over(c, sn, t) {
    const D = dkOf(sn), K = sn.K, n = sn.pts.length;
    segPaint9(sn, (p, k, dx, dy, nx, ny) => {
      // scales: small arcs facing back
      c.strokeStyle = D.scale; c.lineWidth = Math.max(0.7, p.r * 0.11);
      for (const s of [-0.5, 0.5]) { const cx = p.x + nx * p.r * s - dx * p.r * 0.1, cy = p.y + ny * p.r * s - dy * p.r * 0.1; c.beginPath(); c.arc(cx, cy, p.r * 0.32, Math.atan2(dy, dx) + Math.PI * 0.5, Math.atan2(dy, dx) + Math.PI * 1.5); c.stroke(); }
      if (D.neon) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.strokeStyle = `rgba(216,74,255,${(0.5 + 0.35 * Math.sin(t * 5 - k * 0.7)).toFixed(3)})`; c.lineWidth = Math.max(0.8, p.r * 0.13);
        const s = k % 2 ? 1 : -1;
        c.beginPath(); c.moveTo(p.x + nx * p.r * 0.75 * s, p.y + ny * p.r * 0.75 * s); c.lineTo(p.x + nx * p.r * 0.3 * s + dx * p.r * 0.4, p.y + ny * p.r * 0.3 * s + dy * p.r * 0.4); c.lineTo(p.x + dx * p.r * 0.4, p.y + dy * p.r * 0.4); c.stroke();
        c.fillStyle = 'rgba(255,190,255,0.9)'; circle(c, p.x + nx * p.r * 0.75 * s, p.y + ny * p.r * 0.75 * s, p.r * 0.1);
        c.restore();
      }
      if (sn.kind === 'munt14' && k % 2 === 0) { c.fillStyle = '#e8b830'; for (const s of [-1, 1]) circle(c, p.x + nx * p.r * 0.62 * s, p.y + ny * p.r * 0.62 * s, p.r * 0.11); }
      if (sn.kind === 'parel14' && k % 3 === 1) { c.fillStyle = 'rgba(255,224,150,0.8)'; circle(c, p.x + nx * p.r * 0.3, p.y + ny * p.r * 0.3, p.r * 0.12); circle(c, p.x - nx * p.r * 0.3, p.y - ny * p.r * 0.3, p.r * 0.12); }
      // spine plates
      if (k < n - 1) {
        const r = p.r * (D.baby ? 0.35 : 0.5);
        c.fillStyle = K.outline;
        c.beginPath(); c.moveTo(p.x + dx * r * 1.1, p.y + dy * r * 1.1); c.lineTo(p.x + nx * r * 0.55, p.y + ny * r * 0.55); c.lineTo(p.x - dx * r * 0.9, p.y - dy * r * 0.9); c.lineTo(p.x - nx * r * 0.55, p.y - ny * r * 0.55); c.closePath(); c.fill();
        c.fillStyle = D.spine;
        c.beginPath(); c.moveTo(p.x + dx * r * 0.8, p.y + dy * r * 0.8); c.lineTo(p.x + nx * r * 0.36, p.y + ny * r * 0.36); c.lineTo(p.x - dx * r * 0.6, p.y - dy * r * 0.6); c.lineTo(p.x - nx * r * 0.36, p.y - ny * r * 0.36); c.closePath(); c.fill();
      }
    });
    // the tail tip
    const last = sn.pts[n - 1]; if (!last || last.hid) return;
    const [dx, dy] = bodyDir(sn, n - 1), nx = -dy, ny = dx, x = last.x - dx * last.r * 0.6, y = last.y - dy * last.r * 0.6, r = Math.max(4, last.r * 1.4);
    c.save(); c.translate(x, y); c.rotate(Math.atan2(-dy, -dx));
    if (D.tail === 'tuft' || D.tail === 'flame') {
      for (let i = -2; i <= 2; i++) {
        const w = Math.sin(t * 6 + i) * 0.15, a = i * 0.32 + w;
        c.fillStyle = K.outline; ell(c, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.75, r * 0.26, a); c.fill();
        c.fillStyle = i % 2 ? (D.mane2 || D.spine) : (D.mane || D.spine); ell(c, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.64, r * 0.18, a); c.fill();
      }
    } else {
      c.fillStyle = K.outline;
      c.beginPath(); c.moveTo(r * 1.5, 0); c.lineTo(r * 0.2, r * 0.75); c.lineTo(r * 0.45, 0); c.lineTo(r * 0.2, -r * 0.75); c.closePath(); c.fill();
      c.fillStyle = D.tail === 'blade' ? '#e8b830' : D.spine;
      c.beginPath(); c.moveTo(r * 1.25, 0); c.lineTo(r * 0.35, r * 0.5); c.lineTo(r * 0.55, 0); c.lineTo(r * 0.35, -r * 0.5); c.closePath(); c.fill();
    }
    c.restore();
    void nx; void ny;
  }
  // the head, seen from above, nose along +x
  function dragonHead(c, sn, H, out, fill, t, flash) {
    const D = dkOf(sn), K = sn.K, O = out, open = Math.min(1, sn.mouth || 0) + (sn.charge14 || 0) * 0.3;
    // the boss wears the sun: a disc of rays behind the head. In the eclipse it turns black with a corona.
    if (D.sun) {
      const ec = (G.room && G.room.dk14 && G.room.dk14.eclipse) || 0, rot = sn.halo14 || 0;
      c.save(); c.rotate(-sn.drawAng + rot * 0.3);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU, L1 = H * (i % 2 ? 1.9 : 2.4);
        c.fillStyle = ec > 0.5 ? `rgba(255,${200 - ec * 80},120,0.8)` : '#ffcf3a';
        c.beginPath(); c.moveTo(Math.cos(a - 0.1) * H * 1.3, Math.sin(a - 0.1) * H * 1.3); c.lineTo(Math.cos(a) * L1, Math.sin(a) * L1); c.lineTo(Math.cos(a + 0.1) * H * 1.3, Math.sin(a + 0.1) * H * 1.3); c.closePath(); c.fill();
      }
      c.fillStyle = O; circle(c, 0, 0, H * 1.45);
      const g = c.createRadialGradient(0, 0, H * 0.4, 0, 0, H * 1.4);
      g.addColorStop(0, ec > 0.5 ? '#100818' : '#fff6d0'); g.addColorStop(1, ec > 0.5 ? '#2a1030' : '#ffb030');
      c.fillStyle = g; circle(c, 0, 0, H * 1.38);
      if (ec > 0.2) { c.strokeStyle = `rgba(255,236,190,${(0.8 * ec).toFixed(3)})`; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, H * 1.42, 0, TAU); c.stroke(); }
      c.restore();
    }
    // mane: tufts round the back of the skull
    if (D.mane) {
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * 0.55 + (i / 8) * Math.PI * 0.9, w = Math.sin(t * 5 + i) * 0.1;
        const r = H * (sn.isBoss ? 1.15 : 1.05), col = sn.isBoss ? ['#ff5a2a', '#ffcf3a', '#d84aff', '#c4cad4', '#3aa86a'][i % 5] : (i % 2 ? D.mane2 : D.mane);
        c.fillStyle = O; ell(c, Math.cos(a + w) * r, Math.sin(a + w) * r, H * 0.62, H * 0.24, a + w); c.fill();
        c.fillStyle = col; ell(c, Math.cos(a + w) * r, Math.sin(a + w) * r, H * 0.52, H * 0.16, a + w); c.fill();
      }
    }
    // horns
    c.lineCap = 'round';
    for (const s of [-1, 1]) {
      if (D.horns === 'antler') {
        c.strokeStyle = O; c.lineWidth = H * 0.26;
        const path = () => { c.beginPath(); c.moveTo(-H * 0.2, s * H * 0.45); c.quadraticCurveTo(-H * 0.9, s * H * 1.0, -H * 1.55, s * H * 0.85); c.moveTo(-H * 0.75, s * H * 0.85); c.lineTo(-H * 0.95, s * H * 1.3); c.moveTo(-H * 1.15, s * H * 0.95); c.lineTo(-H * 1.45, s * H * 1.3); c.stroke(); };
        path(); c.strokeStyle = D.horn; c.lineWidth = H * 0.14; path();
      } else if (D.horns === 'blade') {
        c.fillStyle = O;
        c.beginPath(); c.moveTo(-H * 0.05, s * H * 0.35); c.lineTo(-H * 1.6, s * H * 0.75); c.lineTo(-H * 0.4, s * H * 0.72); c.closePath(); c.fill();
        c.fillStyle = D.horn;
        c.beginPath(); c.moveTo(-H * 0.12, s * H * 0.42); c.lineTo(-H * 1.4, s * H * 0.72); c.lineTo(-H * 0.42, s * H * 0.64); c.closePath(); c.fill();
      } else if (D.horns === 'nub') {
        c.fillStyle = O; circle(c, -H * 0.35, s * H * 0.62, H * 0.28); c.fillStyle = D.horn; circle(c, -H * 0.35, s * H * 0.62, H * 0.19);
      }
    }
    // skull and snout
    c.fillStyle = O; ell(c, -H * 0.05, 0, H * 0.98, H * 0.86); c.fill();
    ell(c, H * 0.72, 0, H * 0.75, H * 0.52); c.fill();
    c.fillStyle = fill; ell(c, -H * 0.05, 0, H * 0.86, H * 0.74); c.fill();
    ell(c, H * 0.72, 0, H * 0.63, H * 0.41); c.fill();
    c.fillStyle = K.body2; ell(c, H * 0.2, 0, H * 0.32, H * 0.22); c.fill();
    c.fillStyle = K.hi; ell(c, -H * 0.25, -H * 0.3, H * 0.4, H * 0.2); c.fill();
    // brow ridges and the crest down the middle
    c.fillStyle = D.spine; ell(c, -H * 0.4, 0, H * 0.34, H * 0.1); c.fill();
    if (sn.kind === 'munt14') { c.strokeStyle = '#7a8294'; c.lineWidth = 1; c.beginPath(); c.moveTo(-H * 0.6, -H * 0.5); c.lineTo(H * 0.9, -H * 0.2); c.moveTo(-H * 0.6, H * 0.5); c.lineTo(H * 0.9, H * 0.2); c.stroke(); }
    if (D.neon) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(224,90,255,0.75)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-H * 0.7, 0); c.lineTo(-H * 0.1, 0); c.lineTo(H * 0.25, -H * 0.3); c.moveTo(-H * 0.1, 0); c.lineTo(H * 0.25, H * 0.3); c.stroke(); c.restore(); }
    // nostrils, and fire in them while it charges
    const ch = sn.charge14 || 0;
    for (const s of [-1, 1]) {
      c.fillStyle = '#140808'; ell(c, H * 1.18, s * H * 0.2, H * 0.1, H * 0.07); c.fill();
      if (ch > 0) { c.fillStyle = rgba(D.glow, 0.5 + 0.5 * ch); circle(c, H * 1.2, s * H * 0.2, H * 0.08 * (1 + ch)); }
    }
    // jaw: teeth show when it opens
    if (open > 0.3) {
      c.fillStyle = '#1a0606'; ell(c, H * 1.25, 0, H * 0.2 * open, H * 0.32); c.fill();
      c.fillStyle = '#fff8e8'; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(H * (1.05 + i * 0.16), s * H * 0.36); c.lineTo(H * (1.12 + i * 0.16), s * H * 0.24); c.lineTo(H * (1.19 + i * 0.16), s * H * 0.36); c.fill(); }
    }
    // whiskers: long and slow, like the old paintings
    if (D.whisk) {
      c.strokeStyle = D.whisk; c.lineWidth = Math.max(1, H * 0.08);
      for (const s of [-1, 1]) {
        const w = Math.sin(t * 2.2 + s) * 0.35;
        c.beginPath(); c.moveTo(H * 1.15, s * H * 0.32);
        c.bezierCurveTo(H * 1.6, s * H * (0.9 + w), H * 0.6, s * H * (1.4 - w), H * 0.9 + Math.sin(t * 1.7) * H * 0.2, s * H * (2.0 + w * 0.5)); c.stroke();
      }
    }
    // the Pareldraak holds its pearl in front of its nose
    if (sn.kind === 'parel14' && sn.pearl14) {
      const px = H * 1.75, py = Math.sin(t * 3) * H * 0.12;
      c.fillStyle = O; circle(c, px, py, H * 0.36);
      const g = c.createRadialGradient(px - H * 0.1, py - H * 0.1, 0.5, px, py, H * 0.32);
      g.addColorStop(0, '#ffffff'); g.addColorStop(1, sn.heal14 > 0 ? '#ffe8a8' : '#e8dcc8');
      c.fillStyle = g; circle(c, px, py, H * 0.3);
      c.strokeStyle = D.claw; c.lineWidth = 1.2; for (const s of [-1, 1]) { c.beginPath(); c.arc(px, py, H * 0.34, s * 0.6 - 0.25, s * 0.6 + 0.25); c.stroke(); }
    }
    if (D.smile) {
      // a friendly smile on a dangerous face
      c.strokeStyle = O; c.lineWidth = 1.1;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(H * 0.55, s * H * 0.36); c.quadraticCurveTo(H * 0.8, s * H * 0.46, H * 1.0, s * H * 0.34); c.stroke(); }
    }
    if (flash) { c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, H * 0.3, 0, H * 1.2, H * 0.8); c.fill(); }
  }
  for (const k of Object.keys(DRAGON)) {
    V9_HEADS[k] = (c, sn, H, out, fill, t, flash) => dragonHead(c, sn, H, out, fill, t, flash);
    V9_GLOW[k] = (c, sn, t, P, loc, lookAt, open) => {
      const H = sn.headR, D = sn.K.dk, R = H * (D.baby ? 0.24 : 0.2);
      c.save(); if (sn.fly14) c.globalAlpha *= 1 - sn.fly14 * 0.55;
      for (const s of [-1, 1]) { const [x, y] = loc(H * 0.3, s * H * 0.46); glowDot(c, x, y, R * 3.4, D.glow, 0.35 * open); }
      c.globalCompositeOperation = 'source-over';
      for (const s of [-1, 1]) { const [x, y] = loc(H * 0.3, s * H * 0.46); eyeball(c, x, y, R, open, lookAt(x, y), sn.K.eye, false); }
      c.restore();
    };
  }
  {
    // under-body parts and lift for flying dragons
    const ds0 = drawSnake;
    drawSnake = function (c, sn, t) {
      if (!DRAGON[sn.kind] || !sn.K.dk) return ds0.apply(this, arguments);
      const fl = sn.fly14 || 0;
      c.save();
      if (fl > 0) {
        const s = 1 + fl * 0.3;
        c.translate(sn.x, sn.y - fl * 44); c.scale(s, s); c.translate(-sn.x, -sn.y);
        c.globalAlpha *= 1 - fl * 0.4;
      }
      safe(() => under(c, sn, t));
      ds0.call(this, c, sn, t);
      c.restore();
    };
    const dec0 = decorateSnake9;
    decorateSnake9 = function (c, sn, t) {
      dec0(c, sn, t);
      if (DRAGON[sn.kind] && sn.K.dk) safe(() => over(c, sn, t));
    };
    // a dragon in the air leaves a bigger, softer shadow
    const sh0 = drawSnakeShadow;
    drawSnakeShadow = function (c, sn) {
      if (!(sn.fly14 > 0)) return sh0.apply(this, arguments);
      const f = sn.fly14, fs = c.fillStyle;
      c.fillStyle = `rgba(20,20,50,${(0.3 - f * 0.08).toFixed(3)})`;
      for (const p of sn.pts) if (!p.hid) circle(c, p.x + 2, p.y + 4, p.r * (1 + f * 0.3));
      circle(c, sn.x + 2, sn.y + 4, sn.headR * (1.1 + f * 0.4));
      if (sn.K.dk && sn.K.dk.wings) { const a = sn.drawAng; for (const s of [-1, 1]) { ell(c, sn.x - Math.cos(a) * sn.headR * 1.5 - Math.sin(a) * s * sn.headR * 2.4, sn.y - Math.sin(a) * sn.headR * 1.5 + Math.cos(a) * s * sn.headR * 2.4, sn.headR * 2, sn.headR * 0.8, a + s * 0.5); c.fill(); } }
      c.fillStyle = fs;
    };
  }
  LOOK14.munt14 = { seg: 'plate' };
  LOOK14.neon14 = { seg: 'diamond' };
  LOOK14.parel14 = { seg: 'oval', vars: [{ v: 0 }, { v: 25, l: 0.04 }, { v: -12, l: -0.04 }] };
  LOOK14.toorn14 = { seg: 'diamond', vars: [{ v: 0 }, { v: 0, l: -0.08 }] };
  LOOK14.jong14 = { seg: 'oval', vars: [{ v: 0 }, { v: -120, l: 0.02 }, { v: 150 }, { v: 40, l: 0.06 }] };
  LOOK14.keizer14 = { seg: 'plate' };

  /* ------------------------------------------------------------------ drawing: projectiles and room effects */
  VENOM9.neon14 = (c, v, t) => {
    const u = v.t / v.life, r = v.r * (1 + u * 1.4);
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = `rgba(180,40,255,${(0.35 * (1 - u)).toFixed(3)})`; circle(c, v.x, v.y, r * 1.8);
    c.fillStyle = `rgba(230,120,255,${(0.75 * (1 - u * 0.6)).toFixed(3)})`; circle(c, v.x, v.y, r);
    c.fillStyle = `rgba(255,230,255,${(0.9 * (1 - u)).toFixed(3)})`; circle(c, v.x, v.y, r * 0.4);
    c.restore();
  };
  VENOM9.fire14 = (c, v, t) => {
    const a = Math.atan2(v.vy, v.vx);
    c.save(); c.translate(v.x, v.y); c.rotate(a);
    c.fillStyle = 'rgba(255,90,20,0.5)'; ell(c, -v.r * 0.9, 0, v.r * 2, v.r * 0.9); c.fill();
    c.fillStyle = '#ff8a2a'; ell(c, 0, 0, v.r * 1.2, v.r * 0.85); c.fill();
    c.fillStyle = '#fff0a0'; circle(c, v.r * 0.2, 0, v.r * 0.45);
    c.restore();
  };
  VENOM9.sun14 = (c, v, t) => {
    c.save(); c.translate(v.x, v.y); c.rotate(t * 4 + v.ph);
    c.fillStyle = rgba(v.col, 0.35); circle(c, 0, 0, v.r * 1.6);
    c.fillStyle = v.col; c.beginPath();
    for (let i = 0; i < 12; i++) { const r = i % 2 ? v.r * 0.55 : v.r * 1.1, a = (i / 12) * TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill();
    c.fillStyle = '#fffbe8'; circle(c, 0, 0, v.r * 0.35);
    c.restore();
  };
  function coin(c, x, y, r, spin, a = 1) {
    const w = Math.abs(Math.cos(spin));
    c.save(); c.globalAlpha *= a;
    c.fillStyle = '#5a3a08'; ell(c, x, y, r * Math.max(0.25, w) + 1, r + 1); c.fill();
    c.fillStyle = Math.cos(spin) > 0 ? '#f2cf5a' : '#d8a030'; ell(c, x, y, r * Math.max(0.2, w), r); c.fill();
    if (w > 0.5) { c.fillStyle = '#b8861a'; ell(c, x, y, r * 0.5 * w, r * 0.5); c.fill(); }
    c.fillStyle = 'rgba(255,255,230,0.8)'; ell(c, x - r * 0.3 * w, y - r * 0.35, r * 0.2 * w + 0.3, r * 0.25); c.fill();
    c.restore();
  }
  function drawLob(c, l, t) {
    const u = clamp01(l.t / l.dur), x = lerp(l.x0, l.x1, u), y = lerp(l.y0, l.y1, u), z = 4 * l.h * u * (1 - u);
    // where it lands
    c.strokeStyle = l.hostile ? `rgba(255,200,60,${(0.3 + 0.5 * u).toFixed(3)})` : `rgba(255,240,180,${(0.3 + 0.4 * u).toFixed(3)})`; c.lineWidth = 1.4;
    c.beginPath(); c.arc(l.x1, l.y1, l.r * (1.2 - 0.3 * u), 0, TAU); c.stroke();
    c.fillStyle = `rgba(40,30,60,${(0.15 + 0.2 * u).toFixed(3)})`; ell(c, x, y + 3, 4, 2); c.fill();
    if (l.look === 'egg') { c.fillStyle = '#1a0a08'; ell(c, x, y - z, 4.6, 5.8); c.fill(); c.fillStyle = '#ff8a2a'; ell(c, x, y - z, 3.6, 4.8); c.fill(); }
    else coin(c, x, y - z, 4.2, l.spin);
  }
  function drawPatch(c, p, t) {
    const u = p.t / p.life, k = Math.min(1, p.t / 0.2) * (u > 0.8 ? (1 - u) / 0.2 : 1);
    const col = p.col;
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r * 1.3);
    g.addColorStop(0, rgba(col, 0.5 * k)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; circle(c, p.x, p.y, p.r * 1.3);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + p.x, ph = (t * 1.8 + i / 7) % 1, rr = p.r * 0.6 * hash(i + p.y);
      const fx0 = p.x + Math.cos(a) * rr, fy0 = p.y + Math.sin(a) * rr - ph * 14;
      c.fillStyle = rgba(i % 2 ? '#ffd8ff' : col, 0.7 * k * (1 - ph)); ell(c, fx0, fy0, 2.4 * (1 - ph * 0.5), 4.5 * (1 - ph * 0.5)); c.fill();
    }
    c.restore();
    c.strokeStyle = rgba(col, 0.5 * k); c.lineWidth = 1; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.stroke();
  }
  function drawPearl(c, g, t) {
    c.fillStyle = 'rgba(255,250,220,0.3)'; circle(c, g.x, g.y, g.r * 1.9);
    c.fillStyle = '#3a0a06'; circle(c, g.x, g.y, g.r + 1.2);
    const gr = c.createRadialGradient(g.x - 2, g.y - 2, 0.5, g.x, g.y, g.r);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e8d8c0');
    c.fillStyle = gr; circle(c, g.x, g.y, g.r);
  }
  function drawBeam(c, B, t) {
    const sn = B.sn; if (!sn) return;
    const ca = Math.cos(B.a), sa = Math.sin(B.a), x1 = sn.x + ca * B.len, y1 = sn.y + sa * B.len;
    if (B.t < B.warn) {
      c.strokeStyle = `rgba(255,236,190,${(0.3 + 0.5 * (B.t / B.warn)).toFixed(3)})`; c.lineWidth = 2; c.setLineDash([8, 6]);
      c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]);
      return;
    }
    c.save(); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(255,150,60,0.35)'; c.lineWidth = 26; c.beginPath(); c.moveTo(sn.x, sn.y); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = 'rgba(255,220,150,0.7)'; c.lineWidth = 12; c.stroke();
    c.strokeStyle = 'rgba(255,255,240,0.95)'; c.lineWidth = 4; c.stroke();
    glowDot(c, x1, y1, 26, '#ffcf8a', 0.6);
    c.restore();
  }
  function drawHot(c, h, t) {
    const u = h.t / h.life;
    coin(c, h.x, h.y, 4, h.ph + h.t * 2, 1);
    if (u < 0.6) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, h.x, h.y, 9, '#ff8a2a', 0.4 * (1 - u / 0.6)); c.restore(); }
    else if (h.keep) { c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, h.x, h.y, 8, '#fff2b0', 0.3); c.restore(); }
  }
  function drawGust(c, g, t) {
    const k = Math.sin(Math.PI * clamp01(g.t / g.dur)), ca = Math.cos(g.a), sa = Math.sin(g.a);
    c.strokeStyle = `rgba(235,245,255,${(0.55 * k).toFixed(3)})`; c.lineWidth = 1.5; c.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const off = (hash(i * 3.3) - 0.5) * 600, ph = (g.t * 1.6 + hash(i * 7.1)) % 1, along = (ph - 0.5) * 700;
      const x = RW / 2 + ca * along - sa * off, y = RH / 2 + sa * along + ca * off, L1 = 26 + hash(i) * 30;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - ca * L1, y - sa * L1); c.stroke();
    }
  }
  {
    const dft0 = drawFloorThings;
    drawFloorThings = function (c, room, t) {
      dft0(c, room, t);
      const L = G.levelDef;
      if (L && L.deco === SET && skyRoom(room)) safe(() => liveSky(c, room, t));
      const F = room.dk14;
      if (F) safe(() => { for (const p of F.patches) drawPatch(c, p, t); for (const h of F.hot) drawHot(c, h, t); });
    };
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const room = G.room; if (!room || !room.dk14) return;
      safe(() => {
        const F = room.dk14;
        for (const g of F.pearls) drawPearl(c, g, t);
        for (const l of F.lobs) drawLob(c, l, t);
        if (F.beam) drawBeam(c, F.beam, t);
        if (F.gust) drawGust(c, F.gust, t);
      });
    };
    const dg0 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      dg0(c, room, t);
      safe(() => {
        c.globalCompositeOperation = 'lighter';
        for (const sn of room.snakes) {
          if (!DRAGON[sn.kind] || !sn.alive) continue;
          if (sn.charge14 > 0) glowDot(c, sn.x + Math.cos(sn.drawAng) * sn.headR, sn.y + Math.sin(sn.drawAng) * sn.headR, 20 + 30 * sn.charge14, sn.K.dk.glow, 0.25 + 0.35 * sn.charge14);
          if (sn.heal14 > 0) glowDot(c, sn.x, sn.y, 90, '#ffe8a8', 0.35 * sn.heal14);
          if (sn.kind === 'keizer14' && !(room.dk14 && room.dk14.eclipse > 0.5)) glowDot(c, sn.x, sn.y - (sn.fly14 || 0) * 44, sn.headR * 4, '#ffcf3a', 0.22);
        }
        if (G.levelDef && G.levelDef.deco === SET && skyRoom(room)) for (const [x, y] of [[-WALL / 2, -WALL / 2], [RW + WALL / 2, -WALL / 2], [-WALL / 2, RH + WALL / 2], [RW + WALL / 2, RH + WALL / 2]]) glowDot(c, x, y, 26, '#ffcf6a', 0.25 + 0.06 * Math.sin(t * 3 + x));
        c.globalCompositeOperation = 'source-over';
      });
    };
    // the eclipse darkens the whole terrace
    const rr0 = renderRoom;
    renderRoom = function (c, L) {
      rr0.apply(this, arguments);
      const F = G.room && G.room.dk14;
      if (!F || !(F.eclipse > 0.01)) return;
      safe(() => { c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0); c.fillStyle = `rgba(16,8,40,${(0.38 * F.eclipse).toFixed(3)})`; c.fillRect(0, 0, View.W, View.H); c.restore(); });
    };
  }

  /* ================================================================== achievements, texts, the guide */
  {
    const ok0 = onKill9;
    onKill9 = function (sn) { ok0.apply(this, arguments); if (sn && DRAGON[sn.kind]) safe(() => Meta.add('dragons14')); };
  }
  ACHS.push(
    { id: 'keizer14', name: 'Zonsondergang', desc: 'Beat De Zonnekeizer.', stat: 'boss_keizer14', goal: 1 },
    { id: 'dragons14', name: 'Drakendoder', desc: 'Kill 40 dragons.', stat: 'dragons14', goal: 40 },
  );
  for (const s of ['HIJ VLIEGT', 'PARELLICHT', 'MIJN HOF', 'HOOG IN DE LUCHT', 'ZONNESTRAAL', 'WINDSTOOT']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${name}</b><span class="size">${size}</span><span>${txt}</span></figcaption></figure>`;
    const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
    if (decks[0]) decks[0].insertAdjacentHTML('beforeend', [
      fig('munt14', 'Muntdraak', 'Medium, De Drakenhemel', 'Silver and gold. Spits a rain of hot coins on where you stand: step out of the rings. Trait: what misses cools down, and some of it stays as real coins.'),
      fig('neon14', 'Neondraak', 'Medium, De Drakenhemel', 'Breathes a stream of neon purple fire that sweeps sideways. Trait: where the stream ends, the fire keeps burning on the floor for a few seconds.'),
      fig('parel14', 'Pareldraak', 'Long, De Drakenhemel', 'Smiles, then rolls its pearl round the room off every wall. Trait: with the pearl in its claws it heals every dragon near it. Shoot it first.'),
      fig('toorn14', 'Toorndraak', 'Big, De Drakenhemel', 'Antlers and wings. Spits fire, then takes off: out of reach, only its shadow follows you. Trait: it dives down where you stand with a ring of fire.'),
      fig('jong14', 'Drakenjong', 'Tiny, fast, De Drakenhemel', 'Just hatched and very hungry. Comes in flocks, and out of the dragon eggs on the terrace.'),
    ].join(''));
    if (decks[1]) decks[1].insertAdjacentHTML('beforeend', fig('keizer14', 'De Zonnekeizer', 'Drakenhemel boss', 'Three stages, a new original dragon with the sun as its halo. Dageraad: sun fans, coin rain, and it calls its court. Middagzon (66%): it flies up and dives, and breathes neon fire. Eclips (33%): the sun goes dark, a beam sweeps the terrace (stand behind a pillar) and five coloured rings.'));
    const rules = document.querySelector('#tab-rooms ul.rules');
    if (rules) rules.insertAdjacentHTML('beforeend', '<li>In De Drakenhemel some fights have a storm: gusts blow you and the venom across the terrace for a moment. Watch the wind lines.</li>');
    const modes = document.querySelector('#tab-modes ul.rooms9');
    if (modes) modes.insertAdjacentHTML('beforeend', '<li><i style="background:#ffcf3a" aria-hidden="true"></i><b>De Drakenhemel</b><span>The rare floor above all the others: you climb a ladder up through every floor you passed, fight on sky terraces among dragons, then fall back down through all of them. The boss is De Zonnekeizer. Dragon powerups turn up often here.</span></li>');
  });
  Object.assign(window.__bitten || (window.__bitten = {}), { DRAAK14: Object.assign(DRAAK, { SET, DRAGONS, DRAGON, FIGHTS, fx, lob, neonPatch, coin, puff, cloudBank, mosaic, ruyi, lantern, dragonShadow, inSky, keizerStage }) });
})();
