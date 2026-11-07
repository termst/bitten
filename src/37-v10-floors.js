/* src/37-v10-floors.js: v10 floors: Megastore, Arena, Rookruimte, Metro. From v10. Lines 19283 to 19523 of the v13.7 script. */
/* =====================================================================
   Version 10 floors: De Megastore, De Arena, De Rookruimte, De Metro
   and De Afgrond, each with its own boss, and rarer floors that turn up
   in Arcade, Endless, the Daily Run, Chaos and the Boss Rush.
   New tiles.  _ a chasm   = a hospital bed   [ a med cart   @ a beanbag (floor)
               & a wall of screens   * a bush (floor)   - rails (floor)   / a vending machine   4 a station lamp
   New snakes. C clown   t stekker   m mutant   ; peukworm   , bosje
   ===================================================================== */
const TILE10_CH = '_=[@&*-/4';
Object.assign(INSET9, { bed: 3, cart10: 7, tvwall: 2, vending: 3, lamp10: 11 });
{
  const b0 = Room.prototype.build;
  Room.prototype.build = function (tpl, def, opt) {
    this.bushes10 = []; this.rails10 = []; this.beanbags10 = []; this.lamps10 = [];
    return b0.call(this, tpl, def, opt);
  };
}
function tile10(room, ch, c, r) {
  const x = (c + 0.5) * T, y = (r + 0.5) * T;
  if (ch === '_') { room.chasm10 = true; return { type: 'pit', solid: true, shots: false, chasm10: true }; }
  if (ch === '=') return { type: 'bed', solid: true, shots: true, clown: Math.random() < 0.4 };
  if (ch === '[') return { type: 'cart10', solid: true, shots: true };
  if (ch === '@') { room.beanbags10.push({ x, y, c, r, used: false, rest: 0, seed: Math.random() }); return null; }
  if (ch === '&') return { type: 'tvwall', solid: true, shots: true };
  if (ch === '*') { room.bushes10.push({ x, y, c, r, seed: Math.random(), rustle: 0 }); return null; }
  if (ch === '-') { room.rails10.push({ c, r }); return null; }
  if (ch === '/') return { type: 'vending', solid: true, shots: true, hue: Math.floor(Math.random() * 3) };
  if (ch === '4') { const o = { type: 'lamp10', solid: true, shots: true }; room.lamps10.push(o); return o; }
  return null;
}

/* ------------------------------------------------------------------ the five new floors */
const FLOOR10 = {
  mega: {
    name: 'De Megastore', sub: 'Every screen is on. Every screen is watching.', rooms: 10, tier: 2, set: 'mega', boss: 'tvboss',
    dark: 0.5, darkClear: 0.26, venomSpeed: 160, hpMult: 1.4, light: 214,
    floor: '#3e434c', floor2: '#363a42', grout: '#1c1f24', wall: '#1e2a3a', wallHi: '#34506e', wallLo: '#0c121a', void: '#05070a', checker: true,
    rock: '#5a606c', rockHi: '#868e9c', rockLo: '#2a2e36', clay: '#d8dce4', clayLo: '#7a808c', deco: 'mega', decoCol: '#3a8aff', dirt: '#2e3238',
    rockStyle: 'shelf10', urnStyle: 'box10', tubes: true,
  },
  arena: {
    name: 'De Arena', sub: 'Three minutes on the clock. The gas is coming.', rooms: 10, tier: 2, set: 'arena', boss: 'kampioen',
    dark: 0.42, darkClear: 0.2, venomSpeed: 164, hpMult: 1.45, light: 220,
    floor: '#5a7a3a', floor2: '#527234', grout: '#2a3a1a', wall: '#3a4a6a', wallHi: '#5a72a0', wallLo: '#1a2234', void: '#080a10',
    rock: '#c89a5a', rockHi: '#e8c080', rockLo: '#6a4a2a', clay: '#c8a24a', clayLo: '#7a5a1a', deco: 'arena', decoCol: '#ffd23a', dirt: '#4a5a2a',
    rockStyle: 'arena10', urnStyle: 'cube10',
  },
  rook: {
    name: 'De Rookruimte', sub: 'Roken is dodelijk. Down here it is also very loud.', rooms: 9, tier: 1, set: 'rook', boss: 'peuk',
    dark: 0.74, darkClear: 0.44, venomSpeed: 154, hpMult: 1.25, light: 196,
    floor: '#3a302a', floor2: '#342a24', grout: '#1a1410', wall: '#4a3a2e', wallHi: '#6a5644', wallLo: '#20180f', void: '#090706',
    rock: '#5a5a60', rockHi: '#84848c', rockLo: '#2a2a30', clay: '#c8c0b0', clayLo: '#6a6458', deco: 'rook', decoCol: '#a89a88', dirt: '#3a3230',
    rockStyle: 'ashtray10', urnStyle: 'bin10',
  },
  metro: {
    name: 'De Metro', sub: 'The last station. The lights went out years ago.', rooms: 11, tier: 3, set: 'metro', boss: 'tunnel', hard: true,
    dark: 0.86, darkClear: 0.56, venomSpeed: 178, hpMult: 1.8, light: 186,
    floor: '#2a2c2a', floor2: '#262826', grout: '#121312', wall: '#30342e', wallHi: '#4e5448', wallLo: '#141612', void: '#050605',
    rock: '#6a5a3a', rockHi: '#8a7a54', rockLo: '#3a301c', clay: '#7a6a4a', clayLo: '#4a3e28', deco: 'metro', decoCol: '#b8a070', dirt: '#3a3a30',
    rockStyle: 'sandbag10', urnStyle: 'crate10',
  },
  afgrond: {
    name: 'De Afgrond', sub: 'The floor ends here. Something lives under it.', rooms: 11, tier: 4, set: 'afgrond', boss: 'leegte', hard: true,
    dark: 0.88, darkClear: 0.56, venomSpeed: 188, hpMult: 2.05, light: 188,
    floor: '#1e1a2a', floor2: '#221d30', grout: '#0c0a12', wall: '#221a34', wallHi: '#3e2e5a', wallLo: '#0a0812', void: '#020104',
    rock: '#3a3250', rockHi: '#5a4e78', rockLo: '#1a1626', clay: '#6a5a9a', clayLo: '#3a2e5a', deco: 'afgrond', decoCol: '#9a7aff', dirt: '#2a2438',
    rockStyle: 'void10', urnStyle: 'voidurn10',
  },
};
// the floors of the second story, renamed for when they turn up outside it
const RARE_NAMES10 = {
  bus: { name: 'Het Busstation', sub: 'The last bus left hours ago. Something else is coming.' },
  rave: { name: 'De Nachtclub', sub: 'The bass never stops down here.' },
  court: { name: 'Het Gerechtshof', sub: 'All rise. The worms are in session.' },
};
const RARE_STORY10 = {
  bus: () => Object.assign({}, STORY_BUS, RARE_NAMES10.bus),
  rave: () => Object.assign({}, STORY_RAVE, RARE_NAMES10.rave),
  court: () => Object.assign({}, STORY_COURT, RARE_NAMES10.court),
};
function floorDef10(set) { return FLOOR10[set] ? FLOOR10[set] : RARE_STORY10[set] ? RARE_STORY10[set]() : null; }

/* ------------------------------------------------------------------ their rooms */
const MEGA_FIGHT = [
  ['...........', '.##.....##.', '...t...t...', '...........', '..W..&..W..', '...........', '...N...D...', '.##.....##.', '...........'],
  ['u.........u', '..&&...&&..', '...........', '..t..#..t..', '.....#.....', '..W..#..S..', '...........', '..&&...&&..', 'u.........u'],
  ['...........', '.#.#...#.#.', '...........', '..t.N.N.t..', '...........', '..&.....&..', '...W...W...', '.#.#...#.#.', '...........'],
  ['e.........e', './/.....//.', '...........', '..t.....t..', '.....j.....', '..W.....W..', '...........', './/.....//.', 'e.........e'],
  ['...........', '.###...###.', '...........', '..&&.K.&&..', '..t.....t..', '..&&.N.&&..', '.....W.....', '.###...###.', '...........'],
  ['u.u.....u.u', '...........', '..t..&..t..', '.....&.....', '..D.....N..', '.....&.....', '..W..&..W..', '...........', 'u.u.....u.u'],
  ['...........', '..//...//..', '.t..#.#..t.', '...........', '.....S.....', '...........', '.W..#.#..W.', '..//...//..', '...........'],
  ['...........', '.&.......&.', '...t.N.t...', '..#.....#..', '.....D.....', '..#.....#..', '...W.j.W...', '.&.......&.', '...........'],
];
const ARENA_FIGHT = [
  ['...........', '.**.....**.', '...,...,...', '...........', '..#..u..#..', '...........', '...W...S...', '.**.....**.', '...........'],
  ['u.........u', '..**...**..', '...........', '..,..#..,..', '....###....', '..S..#..W..', '...........', '..**...**..', 'u.........u'],
  ['...........', '.#.*...*.#.', '...........', '..,.***.,..', '.....*.....', '..W.***.W..', '...........', '.#.*...*.#.', '...........'],
  ['**.......**', '*..,...,..*', '...........', '...#...#...', '.....Z.....', '...#...#...', '...........', '*..W...S..*', '**.......**'],
  ['...........', '.##.....##.', '.*..,.,..*.', '.*.......*.', '....u.u....', '.*.......*.', '.*..W.S..*.', '.##.....##.', '...........'],
  ['u.u.....u.u', '...........', '..**.,.**..', '..*.....*..', '..W..#..W..', '..*.....*..', '..**.S.**..', '...........', 'u.u.....u.u'],
  ['...........', '..#.*.*.#..', '..#.....#..', '....,.,....', '.**.....**.', '....W.W....', '..#.....#..', '..#.*.*.#..', '...........'],
  ['...........', '.*.......*.', '...#.Z.#...', '...#...#...', '..,.....,..', '...#...#...', '...#.V.#...', '.*.......*.', '...........'],
];
const ROOK_FIGHT = [
  ['...........', '.#.......#.', '...;...;...', '...........', '..W..u..W..', '...........', '...S...F...', '.#.......#.', '...........'],
  ['u.........u', '..#.....#..', '...........', '..;..#..;..', '...........', '..W..#..S..', '...........', '..#.....#..', 'u.........u'],
  ['...........', '.##.....##.', '....;.;....', '..u.....u..', '...........', '..u..F..u..', '....W......', '.##.....##.', '...........'],
  ['e.........e', '...#...#...', '..;.....;..', '...........', '.....L.....', '...........', '..W.....W..', '...#...#...', 'e.........e'],
  ['...........', '.#.#...#.#.', '...........', '..;.W.W.;..', '...........', '..#.....#..', '....S.F....', '.#.#...#.#.', '...........'],
  ['u.u.....u.u', '...........', '..;..#..;..', '.....#.....', '..W.....M..', '.....#.....', '..S..#..W..', '...........', 'u.u.....u.u'],
  ['...........', '..##...##..', '..;.....;..', '...........', '....F.L....', '...........', '..W.....W..', '..##...##..', '...........'],
  ['...........', '.#.......#.', '...;.u.;...', '..#.....#..', '.....S.....', '..#.....#..', '...W.u.W...', '.#.......#.', '...........'],
];
const METRO_FIGHT = [
  ['...........', '.##.....##.', '...m...m...', '-----------', '..S..4..m..', '-----------', '...m...Z...', '.##.....##.', '...........'],
  ['u.........u', '..4.....4..', '...........', '..m..#..m..', '-----------', '..S..#..B..', '...........', '..4.....4..', 'u.........u'],
  ['...........', '.#.#...#.#.', '-----------', '..m.....m..', '.....4.....', '..S.....Z..', '-----------', '.#.#...#.#.', '...........'],
  ['...........', '..##...##..', '..m.....m..', '...........', '-----------', '...........', '..B..G..S..', '..##...##..', '...........'],
  ['e.........e', '...4...4...', '-----------', '..m.....m..', '.....z.....', '..S.....m..', '-----------', '...4...4...', 'e.........e'],
  ['...........', '.##.....##.', '...m.m.m...', '...#...#...', '-----------', '...#...#...', '..S.....Z..', '.##.....##.', '...........'],
  ['u.u.....u.u', '...........', '..m..4..m..', '-----------', '...........', '-----------', '..B..4..S..', '...........', 'u.u.....u.u'],
  ['...........', '.4.......4.', '...m...m...', '..##...##..', '-----------', '..##...##..', '...S.Z.m...', '.4.......4.', '...........'],
];
const AFGROND_FIGHT = [
  ['...........', '..__...__..', '...v...B...', '...........', '..S.._..W..', '...........', '...y...P...', '..__...__..', '...........'],
  ['_........._', '...........', '..B..#..v..', '....___....', '..S.....W..', '....___....', '..P..#..y..', '...........', '_........._'],
  ['...........', '.__.....__.', '.__..G..__.', '...........', '..B..#..S..', '...........', '.__..v..__.', '.__.....__.', '...........'],
  ['...........', '...#...#...', '..y.._..B..', '.._...._...', '.....z.....', '.._...._...', '..W.._..S..', '...#...#...', '...........'],
  ['u.........u', '..__...__..', '...........', '..v.....B..', '....___....', '..P.....y..', '...........', '..__...__..', 'u.........u'],
  ['...........', '.#._..._#..', '...B...v...', '...........', '..__.S.__..', '...........', '...y...W...', '.#._..._#..', '...........'],
  ['u.u.....u.u', '...........', '..z.._..B..', '....___....', '..S.._..W..', '...........', '..P.....v..', '...........', 'u.u.....u.u'],
  ['...........', '.__.....__.', '...G...y...', '..#.....#..', '.....B.....', '..#.....#..', '...S...z...', '.__.....__.', '...........'],
];
Object.assign(FIGHT_SETS, { mega: MEGA_FIGHT, arena: ARENA_FIGHT, rook: ROOK_FIGHT, metro: METRO_FIGHT, afgrond: AFGROND_FIGHT });
Object.assign(SHAPE_SPAWN, { mega: 'tN', arena: ',S', rook: ';F', metro: 'mZ', afgrond: 'Bz' });
for (const set of ['mega', 'arena', 'rook', 'metro', 'afgrond']) for (const tpl of SHAPED) FIGHT_SETS[set].push(tpl.map((row) => row.replace(/1/g, SHAPE_SPAWN[set][0]).replace(/2/g, SHAPE_SPAWN[set][1])));
Object.assign(START_SETS, {
  mega: ['...........', '.&&.....&&.', '...........', '...........', '...........', '...........', '...........', '.&&.....&&.', '...........'],
  arena: ['...........', '.**.....**.', '...........', '...........', '...........', '...........', '...........', '.**.....**.', '...........'],
  rook: ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
  metro: ['...........', '.4.......4.', '...........', '-----------', '...........', '-----------', '...........', '.4.......4.', '...........'],
  afgrond: ['...........', '.__.....__.', '...........', '...........', '...........', '...........', '...........', '.__.....__.', '...........'],
});
Object.assign(SWAP_POOL, { mega: 'WWtN', arena: 'WW,S', rook: 'WW;S', metro: 'WmmS', afgrond: 'WBBS' });
Object.assign(NEW_WORMS, { mega: 'tNDj', arena: ',ZVB', rook: ';FLk', metro: 'mZzB', afgrond: 'yzvGP' });
Object.assign(MINI_POOL, { mega: ['discount', 'bonus', 'rocket', 'tetra'], arena: ['sniper', 'rocket', 'lamprey', 'long'], rook: ['fuel', 'hood', 'splitter', 'stok'], metro: ['sniper', 'lamprey', 'sloper', 'long'], afgrond: ['driekop', 'sloper', 'lamprey', 'long', 'splitter'] });
Object.assign(EXTRA_POOL, { mega: ['grub', 'stekker', 'bonus', 'hood'], arena: ['grub', 'bosje', 'bosje', 'hood', 'sniper'], rook: ['grub', 'peukworm', 'peukworm', 'hood', 'fuel'], metro: ['mutant', 'mutant', 'mutant', 'hood', 'sniper'], afgrond: ['grub', 'lamprey', 'kameleon', 'splitter', 'driekop'] });
Object.assign(WAVE_POOL, { mega: ['grub', 'stekker', 'stekker', 'bonus', 'discount', 'hood'], arena: ['grub', 'bosje', 'bosje', 'hood', 'sniper', 'rocket'], rook: ['grub', 'grub', 'peukworm', 'peukworm', 'hood', 'fuel'], metro: ['mutant', 'mutant', 'mutant', 'grub', 'hood', 'sniper', 'lamprey'], afgrond: ['grub', 'lamprey', 'lamprey', 'kameleon', 'splitter', 'driekop', 'sloper'] });
Object.assign(HAZARDS, { mega: ['sparks', 0.3], arena: ['gas', 0.3], rook: ['smog', 0.35], metro: ['rails', 0.35], afgrond: ['collapse', 0.4] });
Object.assign(MOD_NAMES, { sparks: 'Short circuit', gas: 'The gas closes in', smog: 'Thick smoke', rails: 'The rails are live' });
Object.assign(DRONE_ROOT, { mega: 51.91, arena: 55, rook: 46.25, metro: 41.2, afgrond: 38.89 });
Object.assign(CHAOS_LOOKS9, { mega: () => FLOOR10.mega, arena: () => FLOOR10.arena, rook: () => FLOOR10.rook, metro: () => FLOOR10.metro, afgrond: () => FLOOR10.afgrond });
CHAOS_POOL9.push('clown', 'stekker', 'bosje', 'peukworm', 'mutant', 'rage1');
CHAOS_MODS9.push('sparks', 'gas', 'smog', 'rails');
// the new worms turn up in the older floors too, now and then
NEW_WORMS.market += 't'; NEW_WORMS.kamer += ';'; NEW_WORMS.garden += 'm'; NEW_WORMS.halls += ',';
EXTRA_POOL.market.push('stekker'); WAVE_POOL.halls.push('bosje'); WAVE_POOL.garden.push('mutant');

/* ------------------------------------------------------------------ which floors a run gets */
// slot 1 is always the Root Cellar; every later slot can be a rare floor, more often the deeper you go
const RARE_POOLS10 = [null, ['bus', 'rook', 'mega', 'arena'], ['rave', 'mega', 'arena', 'rook', 'court', 'metro'], ['court', 'metro', 'arena', 'mega', 'afgrond', 'rave'], ['afgrond', 'metro', 'court', 'arena']];
const RARE_ODDS10 = [0, 0.38, 0.42, 0.46, 0.5];
const RARE_MAX10 = 3;
function planFloors10(rng) {
  const used = new Set(), out = [];
  let n = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    let s = null;
    if (RARE_POOLS10[i] && n < RARE_MAX10 && rng() < RARE_ODDS10[i]) {
      const pool = RARE_POOLS10[i].filter((x) => !used.has(x));
      if (pool.length) s = pool[Math.floor(rng() * pool.length)];
    }
    if (s) { used.add(s); n++; }
    out.push(s);
  }
  return out;
}
// a rare floor takes the place of a normal one: its looks, worms and boss, and the slot's strength
function rareLevel10(slot, set) {
  const base = floorDef10(set), hard = base.hard ? 1.12 : 1;
  return Object.assign({}, base, {
    tier: slot.tier, hpMult: slot.hpMult * hard, venomSpeed: Math.max(slot.venomSpeed, base.venomSpeed * 0.96),
    rooms: slot.rooms, portal: !!slot.portal, rare10: true,
  });
}
{
  const lb0 = Game.levelBase;
  Game.levelBase = function (i) {
    const run = G.run;
    if (G.mode === 'rush') {
      const boss = RUSH_ORDER[i], set = RUSH_SET[boss];
      if (FLOOR10[set]) return Object.assign({}, FLOOR10[set], { boss, rush: true, rooms: 2, portal: false, name: BOSS_INFO[boss].title, sub: 'Pick a powerup, then go through the door.', tier: Math.min(4, i) });
      return lb0.call(this, i);
    }
    if ((G.mode === 'arcade' || G.mode === 'daily') && run) {
      if (!run.floors10) run.floors10 = planFloors10(G.mode === 'daily' ? mulberry32((run.seed ^ 0x5bd1e995) >>> 0) : Math.random);
      const set = run.floors10[i];
      if (set && LEVELS[i]) return rareLevel10(LEVELS[i], set);
      return lb0.call(this, i);
    }
    if (G.mode === 'endless' && run) {
      const L = lb0.call(this, i);
      if (!run.floors10) run.floors10 = [];
      if (run.floors10[i] === undefined) {
        const k = i % LEVELS.length, loop = L.loop || 0;
        const odds = Math.min(0.75, (RARE_ODDS10[k] || 0) + loop * 0.12);
        const pool = (RARE_POOLS10[k] || (loop >= 1 ? RARE_POOLS10[1] : [])).concat(loop >= 1 ? ['metro', 'afgrond', 'rook'] : []);
        const fresh = pool.filter((s) => run.floors10.slice(Math.max(0, i - 4), i).indexOf(s) < 0);
        run.floors10[i] = fresh.length && Math.random() < odds ? pick(fresh) : null;
      }
      const set = run.floors10[i];
      if (!set) return L;
      const base = floorDef10(set);
      return Object.assign({}, base, {
        endless: true, loop: L.loop, rooms: L.rooms, portal: L.portal, tier: L.tier, rare10: true,
        hpMult: L.hpMult * (base.hard ? 1.12 : 1), venomSpeed: Math.max(L.venomSpeed, base.venomSpeed * 0.96),
        name: L.loop ? `${base.name} ${ROMAN[Math.min(L.loop, ROMAN.length - 1)] || L.loop + 1}` : base.name,
        sub: L.loop ? 'You have been here before. It got worse.' : base.sub,
      });
    }
    return lb0.call(this, i);
  };
  Hooks.layer('Game.loadLevel', 'v10 floors', function (next, i) {
    next.call(this, i);
    const L = G.levelDef;
    if (L && L.set) Meta.mark('floorsSeen', L.set);
    if (L && L.rare10) { Meta.add('rareFloors'); G.run.rareSeen10 = (G.run.rareSeen10 || 0) + 1; }
  });
}

/* ------------------------------------------------------------------ boss rooms bring their own furniture */
{
  const gr0 = generateRushLevel;
  generateRushLevel = function (def) {
    const map = gr0(def);
    prepBossRoom10(map.boss, def.boss, def);
    return map;
  };
}

