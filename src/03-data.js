/* src/03-data.js: data: levels, room templates, snakes, powerups. From v1 to v8. Lines 807 to 1235 of the v13.7 script. */
/* =====================================================================
   Data: levels, room templates, snakes, powerups
   ===================================================================== */
const LEVELS = [
  {
    name: 'The Root Cellar', sub: 'Something is moving in the soil.', rooms: 8, tier: 0, set: 'cellar',
    boss: 'mother', dark: 0.74, darkClear: 0.44, venomSpeed: 140, hpMult: 1, light: 205,
    floor: '#2c221b', floor2: '#30261e', grout: '#17110d', wall: '#3a2c22', wallHi: '#5a4431', wallLo: '#1b130e', void: '#0b0807',
    rock: '#5d4b3c', rockHi: '#7f6955', rockLo: '#2d231b', clay: '#9a5c3b', clayLo: '#5e321f', deco: 'roots', decoCol: '#4b3524', dirt: '#5a4332',
  },
  {
    name: 'The Molting Halls', sub: 'The walls are covered in old skin.', rooms: 10, tier: 1, set: 'halls', portal: true,
    boss: 'queen', dark: 0.8, darkClear: 0.48, venomSpeed: 152, hpMult: 1.2, light: 198,
    floor: '#282a31', floor2: '#2c2f37', grout: '#111216', wall: '#2f313a', wallHi: '#4b4e5c', wallLo: '#15161b', void: '#08090b',
    rock: '#50535f', rockHi: '#6f7383', rockLo: '#262832', clay: '#6f6a74', clayLo: '#3d3a44', deco: 'skins', decoCol: '#e1dac4', dirt: '#4a4a52',
  },
  {
    name: 'The Supermarket', sub: 'Open late. Very late. Everything must go.', rooms: 10, tier: 2, set: 'market',
    boss: 'pricewar', dark: 0.6, darkClear: 0.3, venomSpeed: 162, hpMult: 1.4, light: 212,
    floor: '#4a4d53', floor2: '#3c3f45', grout: '#202226', wall: '#2a3a46', wallHi: '#3f5666', wallLo: '#11181e', void: '#06080b', checker: true,
    rock: '#6a6e78', rockHi: '#8e939e', rockLo: '#33363d', clay: '#b08a56', clayLo: '#6e5230', deco: 'market', decoCol: '#8a9099', dirt: '#3a3d42',
    rockStyle: 'shelf', urnStyle: 'box', eggStyle: 'carton', candleStyle: 'sign', tubes: true,
  },
  {
    name: 'The Second Chamber', sub: 'Order. ORDER. The motion to eat you is carried.', rooms: 11, tier: 3, set: 'kamer', portal: true,
    boss: 'coalition', dark: 0.72, darkClear: 0.4, venomSpeed: 170, hpMult: 1.65, light: 202,
    floor: '#1d3463', floor2: '#213a6e', grout: '#101d3b', wall: '#4a2f1e', wallHi: '#6e4a30', wallLo: '#22150c', void: '#07080d',
    rock: '#5a3b24', rockHi: '#7d5634', rockLo: '#2a1a0e', clay: '#d8d2c2', clayLo: '#8a8475', deco: 'chamber', decoCol: '#e8e2d0', dirt: '#2a3550',
    rockStyle: 'desk', urnStyle: 'papers',
  },
  {
    name: 'The Garden Below', sub: 'Nothing grows here anymore.', rooms: 11, tier: 4, set: 'garden',
    boss: 'ouro', dark: 0.84, darkClear: 0.5, venomSpeed: 180, hpMult: 1.9, light: 192,
    floor: '#301b1d', floor2: '#352022', grout: '#150a0b', wall: '#3b1d20', wallHi: '#5d2d31', wallLo: '#1a0b0c', void: '#0b0405',
    rock: '#57302f', rockHi: '#784441', rockLo: '#2b1515', clay: '#7d3b35', clayLo: '#45201c', deco: 'veins', decoCol: '#5c1a21', dirt: '#4b2a26',
  },
];
const SET_LEVEL = { cellar: 0, halls: 1, market: 2, kamer: 3, garden: 4 };

/* How hard a run is. Applied on top of each floor. */
const DIFF_IDS = ['easy', 'normal', 'hard', 'nightmare'];
const DIFFS = {
  easy: { name: 'Easy', desc: 'Softer, slower snakes and more apple slices. One extra apple. Downgrades are rare.', hp: 0.75, speed: 0.9, bossSpeed: 0.92, venom: 0.88, extra: 0, traits: 0, rot: 0.5, champ: 0.5, hearts: 1.4, bossHp: 0.8, startHp: 2, bite: 0, skulls: 1 },
  normal: { name: 'Normal', desc: 'The way it was meant to bite.', hp: 1, speed: 1, bossSpeed: 1, venom: 1, extra: 0, traits: 0, rot: 1, champ: 1, hearts: 1, bossHp: 1, startHp: 0, bite: 0, skulls: 2 },
  hard: { name: 'Hard', desc: 'Tougher, faster snakes and more gold worms. Two snakes in every fight carry a nasty trait: armor, speed, spite or regrowth.', hp: 1.2, speed: 1.06, bossSpeed: 1.05, venom: 1.1, extra: 0, traits: 2, rot: 1.2, champ: 1.7, hearts: 0.85, bossHp: 1.25, startHp: 0, bite: 0, skulls: 3 },
  nightmare: { name: 'Nightmare', desc: 'One more snake in every fight, three with nasty traits, and every bite takes a whole apple.', hp: 1.4, speed: 1.12, bossSpeed: 1.1, venom: 1.18, extra: 1, traits: 3, rot: 1.4, champ: 2.6, hearts: 0.7, bossHp: 1.5, startHp: 0, bite: 1, skulls: 4, unlock: 'Escape on Hard to unlock.' },
};

/* Ways to play. Story mode has its own three chapters. */
const MODE_IDS = ['arcade', 'endless', 'rush', 'daily'];
const MODES = {
  arcade: { name: 'Arcade', desc: 'Five floors, one life. Find the light at the bottom.', floors: 5 },
  endless: { name: 'Endless', desc: 'The floors never end. Every lap down gets nastier. How deep can an apple go?', floors: Infinity },
  rush: { name: 'Boss Rush', desc: 'Every boss, back to back. Pick a powerup before each fight.', floors: 6 },
  daily: { name: 'Daily Run', desc: 'Same dungeon for everyone today, with a twist. Normal difficulty.', floors: 5 },
};
const RUSH_ORDER = ['mother', 'queen', 'pricewar', 'coalition', 'ouro', 'ender'];
const RUSH_SET = { mother: 'cellar', queen: 'halls', pricewar: 'market', coalition: 'kamer', ouro: 'garden', ender: 'halls' };
const DAILY_TWISTS = [
  { id: 'gold', name: 'Gold Rush', desc: 'Twice the gold worms, twice the coins.' },
  { id: 'dark', name: 'Lights Out', desc: 'Every fight room is dark.' },
  { id: 'swarm', name: 'Swarm Day', desc: 'Two extra grubs in every fight.' },
  { id: 'glass', name: 'Glass Apple', desc: 'Two apples only, but every seed hits twice as hard.' },
  { id: 'rich', name: 'Payday', desc: 'Start with 40 coins. The shops are open.' },
  { id: 'fast', name: 'Rush Hour', desc: 'Everything moves faster, you too.' },
  { id: 'cursed', name: 'Cursed Day', desc: 'You start with a random curse, and a vault key in your pocket.' },
];

/* Room templates: 11 x 9 tiles.
   . floor   # stone   u urn   e eggs   c candles   X chest   A challenge altar   O offering altar   h heart
   W grub    S hood    B lamprey   G the long one   Q block worm   V boost worm   F fuel worm
   Door cells (top/bottom middle, left/right middle) always stay clear. */
const TPL = {
  fight: [
    [ // level 1
      ['...........', '.#.......#.', '...W...W...', '...........', '....u.u....', '...........', '...W...W...', '.#.......#.', '...........'],
      ['e.........e', '..#.....#..', '...........', '...W.W.W...', '...........', '....e.e....', '..u.....u..', '..#.....#..', '...........'],
      ['u.........u', '...#...#...', '...#.S.#...', '..W........', '...........', '........W..', '..c.....c..', '...........', 'u.........u'],
      ['...........', '.##.....##.', '....W.W....', '..u.....u..', '...........', '..u..S..u..', '....W......', '.##.....##.', '...........'],
      ['c.........c', '...........', '..W..#..W..', '....#.#....', '...........', '....#.#....', '..W..#..W..', '....u......', 'c.........c'],
      ['...........', '.#.#...#.#.', '...........', '.#..W.W..#.', '...........', '.#..W.W..#.', '...........', '.#.#...#.#.', '...........'],
      ['u.u.....u.u', '...........', '..W.....W..', '...........', '.....S.....', '...........', '...u...u...', '...........', 'u.u.....u.u'],
      ['...........', '..e.e.e.e..', '...........', '.W..eee..W.', '...........', '.....W.....', '...........', '..e.....e..', '...........'],
      ['##.......##', '#..W...W..#', '...........', '...........', '.....u.....', '...........', '...........', '#..W...W..#', '##.......##'],
      ['...........', '.S.......S.', '...##.##...', '...........', '..W.....W..', '...........', '...##.##...', '...........', '....u.u....'],
    ],
    [ // level 2
      ['...........', '..S.....S..', '...#...#...', '...........', '....eWe....', '...........', '...#...#...', '..u.W...u..', '...........'],
      ['e.........e', '...........', '..#..S..#..', '...........', '..B.....B..', '...........', '..#.....#..', '...........', 'e.........e'],
      ['...........', '.S.......S.', '..#.....#..', '..#..u..#..', '...........', '..#..u..#..', '..#..S..#..', '...........', '...........'],
      ['u.........u', '...e...e...', '..W.....W..', '...........', '.....B.....', '...........', '..W.....W..', '...e...e...', 'u.........u'],
      ['...........', '...#...#...', '.S.#...#.S.', '...........', '.....B.....', '...........', '...#.W.#...', '...#...#...', '...u...u...'],
      ['...........', '.#.#...#.#.', '...........', '..S.....S..', '.....B.....', '..W.....W..', '...........', '.#.#...#.#.', '...........'],
      ['e.........e', '...........', '..B.....B..', '...........', '...........', '.....B.....', '...........', '...u...u...', 'e.........e'],
      ['u.........u', '..##...##..', '..S.....S..', '...........', '...W.W.W...', '...........', '..##...##..', '...........', 'u.........u'],
      ['...........', '...#...#...', '.W.......W.', '..#.....#..', '.....B.....', '..#.....#..', '.S.......S.', '...#...#...', '...........'],
      ['...........', '.e.e...e.e.', '...........', '..B.....B..', '....eee....', '...........', '..W.....W..', '.e.e...e.e.', '...........'],
    ],
    [ // level 3
      ['...........', '..#.....#..', '...........', '...W...W...', '.....G.....', '...........', '...........', '..#.....#..', 'u.........u'],
      ['e.........e', '..S.....S..', '...........', '...#...#...', '..B.....B..', '...#...#...', '...........', '..c.....c..', 'e.........e'],
      ['u.........u', '....S......', '..e.....e..', '....#.#....', '.....G.....', '....#.#....', '..e.....e..', '...........', 'u.........u'],
      ['c.........c', '..W.....W..', '....#.#....', '..W.....W..', '.....B.....', '..W.....W..', '....#.#....', '...........', 'c.........c'],
      ['...........', '.#.......#.', '..S....u...', '...........', '....G......', '...........', '........B..', '.#.......#.', '...........'],
      ['...........', '.##.....##.', '...........', '..S.....S..', '.....G.....', '...........', '...........', '.##.....##.', '...........'],
      ['c.........c', '..W.....W..', '...........', '..B..#..B..', '.....#.....', '.....#.....', '..W.....W..', '...........', 'c.........c'],
      ['e.........e', '...........', '..#######..', '...........', '.W...G...W.', '...........', '..#######..', '...........', 'e.........e'],
      ['u.........u', '.S.......S.', '...........', '...#...#...', '..B..S..B..', '...#...#...', '...........', '...........', 'u.........u'],
      ['...........', '.#..W.W..#.', '...........', '.S.......B.', '...........', '.....G.....', '...........', '.#.......#.', '...........'],
    ],
  ],
  start: [
    ['...........', '.c.......c.', '...........', '...........', '...........', '...........', '...........', '.c.......c.', '...........'],
    ['u.........u', '..#.....#..', '...........', '...........', '...........', '...........', '...........', '..#.....#..', 'u.........u'],
    ['e.........e', '.c.......c.', '...........', '...#...#...', '...........', '...#...#...', '...........', '.c.......c.', 'e.........e'],
  ],
  secret: ['r.........r', '...........', '..r.....r..', '...........', '.....R.....', '...........', '..r.....r..', '...........', '...........'],
  challenge: ['...........', '.#.......#.', '...........', '...........', '.....A.....', '...........', '...........', '.#.......#.', '...........'],
  offering: ['c.........c', '...........', '...........', '...c...c...', '.....O.....', '...........', '...........', '...........', 'c.........c'],
  pantry: ['u.........u', '...........', '..u.....u..', '...........', '....h.h....', '.....h.....', '..u.....u..', '...........', 'u.........u'],
  chest: ['u.........u', '...........', '...c...c...', '...........', '.....X.....', '...........', '...c...c...', '...........', 'u.........u'],
  portal: ['...........', '.#.......#.', '...........', '...#...#...', '...........', '...#...#...', '...........', '.#.......#.', '...........'],
  boss: ['...........', '...........', '...........', '...........', '...........', '...........', '...........', '...........', '...........'],
};

/* Supermarket rooms.  # shelves   u boxes   e egg cartons   c wet floor signs   K shopping cart   > < conveyor belt
   N bonus worm   D discount worm */
const MARKET_FIGHT = [
  ['...........', '.###...###.', '...........', '.###.N.###.', '..W.....W..', '.###...###.', '...........', '.###.K.###.', '...........'],
  ['...........', '.>>>>.<<<<.', '.#.......#.', '...W...W...', '.....D.....', '...........', '.#.......#.', '.>>>>.<<<<.', '...........'],
  ['u.........u', '..##...##..', '..##.N.##..', '...........', '..W..K..W..', '...........', '..##...##..', '..##.S.##..', 'u.........u'],
  ['...........', '..K.....K..', '....###....', '.W.......W.', '.....D.....', '.W.......W.', '....###....', '..K.....K..', '...........'],
  ['uu.......uu', 'u..#...#..u', '...#.N.#...', '...........', '..W.....W..', '...........', '...#...#...', 'u..#.S.#..u', 'uu.......uu'],
  ['...........', '.#.#...#.#.', '.#.#.N.#.#.', '.#.#...#.#.', '..D.....W..', '.#.#...#.#.', '.#.#.W.#.#.', '.#.#...#.#.', '...........'],
  ['e.........e', '...c...c...', '..W.....W..', '....eNe....', '...........', '....e.e....', '..W.....D..', '...c...c...', 'e.........e'],
  ['...........', '.####.####.', '.....N.....', '.##.....##.', '..W..D..W..', '.##.....##.', '...........', '.####.####.', '...........'],
  ['u.........u', '.##.....##.', '.....F.....', '.#.......#.', '..W..K..W..', '.#.......#.', '.....N.....', '.##.....##.', 'u.........u'],
  ['...........', '.<<<<.<<<<.', '...u...u...', '..N.....D..', '...........', '..W.....W..', '...u...u...', '.>>>>.>>>>.', '...........'],
];
/* Second Chamber rooms.  # desks   u stacks of motions   M kamerlid   L lobbyist */
const KAMER_FIGHT = [
  ['...........', '.###...###.', '...........', '.#M#...#M#.', '...........', '.###.L.###.', '.....#.....', '..W.....W..', '...........'],
  ['...........', '..###.###..', '.#.......#.', '.#..MMM..#.', '...........', '....L.L....', '...........', '..W.....W..', '...........'],
  ['...........', '.##.....##.', '.##..M..##.', '...........', '..M..#..M..', '...........', '.##..S..##.', '.##.....##.', '...........'],
  ['u.........u', '..#.....#..', '..#..L..#..', '..#.....#..', '...M...M...', '..#.....#..', '..#..W..#..', '..#.....#..', 'u.........u'],
  ['...........', '...#...#...', '.M.#...#.M.', '...#.L.#...', '...........', '...#.S.#...', '.W.#...#.W.', '...#...#...', '...........'],
  ['...........', '.###...###.', '...........', '.###.#.###.', '.M.......M.', '.###.#.###.', '.....W.....', '.###...###.', '...........'],
  ['u.u.....u.u', '...........', '..M..L..M..', '...........', '....u.u....', '...........', '..W.....W..', '...........', 'u.u.....u.u'],
  ['e.........e', '..#.....#..', '...M...M...', '....e.e....', '.....S.....', '....e.e....', '...M...M...', '..#.....#..', 'e.........e'],
  ['c.........c', '...........', '..##...##..', '..#..L..#..', '.....M.....', '..#..M..#..', '..##...##..', '...........', 'c.........c'],
  ['...........', '.##.....##.', '....M.M....', '.#.......#.', '.....Q.....', '.#.......#.', '....W.W....', '.##.....##.', '...........'],
];
const FIGHT_SETS = { cellar: TPL.fight[0], halls: TPL.fight[1], garden: TPL.fight[2], market: MARKET_FIGHT, kamer: KAMER_FIGHT };
const START_SETS = {
  cellar: TPL.start[0], halls: TPL.start[1], garden: TPL.start[2],
  market: ['...........', '.##.....##.', '...........', '...c...c...', '...........', '...........', '...........', '.##.....##.', '...........'],
  kamer: ['...........', '..###.###..', '...........', '...........', '...........', '...........', '...........', '..###.###..', '...........'],
};
/* Special rooms added later: T shelves and a counter, $ a spot for something to buy, Y a lectern to vote at */
/* Shop: $ a powerup   + two slices   % cursed goods at half price   ! a cleanser   q the reroll machine */
TPL.shop = ['...........', '.TTT...TTT.', '.........q.', '...........', '..$..$..$..', '...........', '..%..+..!..', '...........', '...........'];
/* The newer rooms.  J slot machine   ~ a spring   I a book stand   U survival altar   g a stack of gold */
TPL.gamble = ['c.........c', '...........', '...........', '...........', '.....J.....', '...........', '...........', '...........', 'c.........c'];
TPL.spring = ['u.........u', '..#.....#..', '...........', '...........', '.....~.....', '...........', '...........', '..#.....#..', 'u.........u'];
TPL.library = ['c.........c', '...........', '...........', '..I..I..I..', '...........', '...........', '...........', '...........', 'c.........c'];
TPL.survival = ['...........', '.#.......#.', '...........', '...........', '.....U.....', '...........', '...........', '.#.......#.', '...........'];
TPL.miniboss = ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'];
TPL.vault = ['g.........g', '.g.......g.', '...........', '...........', '...........', '...........', '...........', '.g.......g.', 'g.........g'];
/* Rooms with walls inside them.  H wall   1 a common snake of the floor   2 a tougher one */
const SHAPED = [
  ['HHH.....HHH', 'HHH.....HHH', 'HHH..1..HHH', '...........', '..2.....2..', '...........', 'HHH..1..HHH', 'HHH.....HHH', 'HHH.....HHH'],
  ['.......HHHH', '..1....HHHH', '.......HHHH', '...........', '.....2.....', '...........', 'HHHH.......', 'HHHH....1..', 'HHHH.......'],
  ['...........', '..1.....1..', '...........', '....HHH....', '..2.HHH.2..', '....HHH....', '...........', '..1........', '...........'],
  ['...........', '.1.......1.', 'HHHH...HHHH', '...........', '....2.2....', '...........', 'HHHH...HHHH', '.1.......1.', '...........'],
];
const SHAPE_SPAWN = { cellar: 'WS', halls: 'WB', market: 'ND', kamer: 'ML', garden: 'SB' };
for (const set in FIGHT_SETS) for (const tpl of SHAPED) FIGHT_SETS[set].push(tpl.map((row) => row.replace(/1/g, SHAPE_SPAWN[set][0]).replace(/2/g, SHAPE_SPAWN[set][1])));
/* A mini boss is one big gold version of something that lives on the floor */
const MINI_POOL = { cellar: ['hood', 'long', 'splitter'], halls: ['lamprey', 'hood', 'sniper'], market: ['discount', 'bonus', 'rocket'], kamer: ['lobby', 'kamerlid', 'fuel'], garden: ['long', 'lamprey', 'sniper', 'splitter'] };
TPL.vote = ['...........', '...........', '...........', '...Y...Y...', '...........', '...........', '...........', '...........', '...........'];

/* Snakes. Length is health: every snake gets shorter as it is hurt. */
const KINDS = {
  grub: {
    name: 'Grub', hp: 3, headR: 9, r0: 7.5, r1: 3.5, spacing: 5, maxLen: 9, minLen: 3, speed: 92, turn: 4.5, bite: 1,
    body: '#d9c8b3', body2: '#cdb9a3', outline: '#2b1d17', hi: 'rgba(255,250,240,0.38)', ring: 'rgba(92,62,48,0.42)',
    blood: '#cbb37a', eye: '#ff3b3b',
  },
  hood: {
    name: 'Hood', hp: 6, headR: 10, r0: 9, r1: 3.5, spacing: 6, maxLen: 14, minLen: 4, speed: 64, turn: 3.2, bite: 1,
    body: '#4e455a', body2: '#453d51', outline: '#120e16', hi: 'rgba(210,200,235,0.2)', scale: '#7a6a8f',
    hoodCol: '#3b3347', hoodRim: '#8a779e', blood: '#62306f', eye: '#ffd166',
  },
  lamprey: {
    name: 'Lamprey', hp: 8, headR: 12, r0: 11, r1: 4.5, spacing: 7, maxLen: 12, minLen: 4, speed: 72, turn: 3, underSpeed: 135, bite: 1,
    body: '#b65e6d', body2: '#ab5464', outline: '#2a0d14', hi: 'rgba(255,215,220,0.28)', ring: 'rgba(90,22,38,0.42)',
    gill: '#3c0e18', blood: '#82172a', eruptDmg: 2,
  },
  long: {
    name: 'The Long One', hp: 20, headR: 16, r0: 15, r1: 6, spacing: 9, maxLen: 24, minLen: 5, cells: 2.3, bite: 2,
    body: '#e4dacb', body2: '#d8ccba', outline: '#1d1513', hi: 'rgba(255,255,255,0.35)', saddle: '#4f403a',
    blood: '#2a1a1f', eye: '#ffae42', bodyEyeEvery: 4,
  },
  rotter: {
    name: 'Rot Eater', hp: 14, headR: 10, r0: 9, r1: 4, spacing: 6.5, maxLen: 6, minLen: 3, speed: 70, turn: 3.4, bite: 1,
    body: '#7d7a3e', body2: '#716d36', outline: '#1c1a0a', hi: 'rgba(240,235,170,0.2)', spot: '#3f3518',
    blood: '#5a5420', eye: '#e6ff5a',
  },
  tetra: {
    name: 'Block Worm', hp: 18, headR: 13, r0: 12, r1: 10.5, spacing: 10, maxLen: 14, minLen: 4, cells: 2.3, bite: 1, blocky: true,
    body: '#3fc6d8', body2: '#36b2c2', outline: '#0b0f1c', hi: 'rgba(255,255,255,0.3)', blood: '#3a4a7a', eye: '#ffffff',
  },
  rocket: {
    name: 'Boost Worm', hp: 16, headR: 12, r0: 11, r1: 6.5, spacing: 7.5, maxLen: 11, minLen: 3, speed: 98, turn: 3.6, bite: 1,
    body: '#ef7a2a', body2: '#dd6a1c', outline: '#1a0c05', hi: 'rgba(255,232,200,0.32)', blood: '#2a2420', eye: '#fff2c4', stripe: '#1d1d24',
  },
  fuel: {
    name: 'Fuel Worm', hp: 14, headR: 12, r0: 11, r1: 7, spacing: 8, maxLen: 9, minLen: 3, speed: 44, turn: 2.4, bite: 1, fireproof: true,
    body: '#1f8a3a', body2: '#197a31', outline: '#06200d', hi: 'rgba(220,255,200,0.25)', blood: '#2a2a1a', eye: '#ffe14a', band: '#ffd60a',
  },
  creeper: {
    name: 'Creeper', hp: 4, headR: 10, r0: 9, r1: 8, spacing: 9, maxLen: 3, minLen: 2, speed: 74, turn: 4, bite: 1, blocky: true,
    palette: ['#5aa83a', '#4c9a30', '#6cbc48'], headCol: '#62b040',
    body: '#5aa83a', body2: '#4c9a30', outline: '#0e2208', hi: 'rgba(255,255,255,0.25)', blood: '#3c6a24', eye: '#000000',
  },
  ender: {
    boss: true, name: 'The Ender Wyrm', hp: 140, headR: 18, r0: 16, r1: 13, spacing: 13, maxLen: 16, minLen: 6, bite: 2, blocky: true,
    palette: ['#1c1a22', '#26222f', '#1f1c27', '#2c2638'], headCol: '#16141b',
    body: '#1c1a22', body2: '#26222f', outline: '#050407', hi: 'rgba(255,255,255,0.15)', blood: '#7a2fa8', eye: '#d26bff',
  },
  bonus: {
    name: 'Bonus Worm', hp: 9, headR: 11, r0: 10, r1: 5, spacing: 7, maxLen: 11, minLen: 3, speed: 60, turn: 3.2, bite: 1,
    body: '#1aa0e0', body2: '#1590cc', outline: '#06263a', hi: 'rgba(220,245,255,0.35)', blood: '#0a3a5a', eye: '#ffffff', band: '#eef6fb',
  },
  discount: {
    name: 'Discount Worm', hp: 12, headR: 12, r0: 11, r1: 6, spacing: 7.5, maxLen: 10, minLen: 3, speed: 56, turn: 2.6, bite: 1,
    body: '#f2c200', body2: '#deb000', outline: '#1a1500', hi: 'rgba(255,250,200,0.35)', blood: '#3a3000', eye: '#111111', band: '#151515',
  },
  kamerlid: {
    name: 'Kamerlid', hp: 5, headR: 9, r0: 8, r1: 4, spacing: 6, maxLen: 9, minLen: 3, speed: 66, turn: 3.4, bite: 1,
    body: '#2c3550', body2: '#262e46', outline: '#0a0d14', hi: 'rgba(200,210,240,0.2)', blood: '#5a1a2a', eye: '#ffd166', tie: '#c3243a', collar: '#f2f0ea',
  },
  lobby: {
    name: 'Lobbyist', hp: 8, headR: 10, r0: 9, r1: 4.5, spacing: 6.5, maxLen: 9, minLen: 3, speed: 60, turn: 3, bite: 1,
    body: '#5c6068', body2: '#51555d', outline: '#14161a', hi: 'rgba(230,230,240,0.22)', blood: '#3a2a10', eye: '#e3a54a', tie: '#e3a54a', collar: '#f2f0ea',
  },
  splitter: {
    name: 'Splitter', hp: 8, headR: 11, r0: 10, r1: 5, spacing: 7, maxLen: 10, minLen: 3, speed: 66, turn: 3.6, bite: 1,
    body: '#5e8f86', body2: '#527f77', outline: '#0d1a18', hi: 'rgba(220,255,245,0.25)', seam: '#16302b', blood: '#2f5a50', eye: '#ff7a3a',
  },
  splitling: {
    name: 'Splitling', hp: 3, headR: 8, r0: 7, r1: 3.5, spacing: 5.5, maxLen: 7, minLen: 3, speed: 90, turn: 4.4, bite: 1,
    body: '#6fa096', body2: '#628f86', outline: '#0d1a18', hi: 'rgba(220,255,245,0.25)', seam: '#16302b', blood: '#2f5a50', eye: '#ff7a3a',
  },
  sniper: {
    name: 'Sharpshooter', hp: 6, headR: 10, r0: 8, r1: 3.5, spacing: 7, maxLen: 13, minLen: 4, speed: 58, turn: 3, bite: 1,
    body: '#3d4a2c', body2: '#344026', outline: '#0b1006', hi: 'rgba(220,240,180,0.2)', blood: '#3a4a1a', eye: '#ff2a2a',
  },
  pwblue: {
    boss: true, name: 'Blue', hp: 85, headR: 19, r0: 17, r1: 8, spacing: 11, maxLen: 15, minLen: 5, bite: 2, speed: 62, turn: 2.6,
    body: '#1aa0e0', body2: '#1590cc', outline: '#06263a', hi: 'rgba(220,245,255,0.35)', blood: '#0a3a5a', eye: '#ffffff', band: '#eef6fb',
  },
  pwyellow: {
    boss: true, name: 'Yellow', hp: 95, headR: 20, r0: 18, r1: 9, spacing: 11, maxLen: 14, minLen: 5, bite: 2, speed: 56, turn: 2.4,
    body: '#f2c200', body2: '#deb000', outline: '#1a1500', hi: 'rgba(255,250,200,0.35)', blood: '#3a3000', eye: '#111111', band: '#151515',
  },
  coalition: {
    boss: true, name: 'The Coalition', hp: 220, headR: 22, r0: 20, r1: 12, spacing: 12, maxLen: 26, minLen: 8, bite: 2, speed: 50, turn: 2.2,
    body: '#3a4258', body2: '#343b50', outline: '#0a0d14', hi: 'rgba(220,225,245,0.25)', blood: '#5a1a2a', eye: '#ffd166', tie: '#c3243a', collar: '#f2f0ea',
    parties: ['#e8742a', '#2a6ad8', '#3aa84a', '#8a3ad8'],
  },
  party: {
    boss: true, name: 'Party', hp: 40, headR: 15, r0: 13, r1: 7, spacing: 9, maxLen: 11, minLen: 4, bite: 2, speed: 70, turn: 3, underSpeed: 150,
    body: '#e8742a', body2: '#d8641e', outline: '#0a0d14', hi: 'rgba(255,240,220,0.3)', blood: '#5a1a2a', eye: '#ffd166', eruptDmg: 2, tie: '#f2f0ea', collar: '#f2f0ea',
  },
  mother: {
    boss: true, name: 'The Grub Mother', hp: 64, headR: 24, r0: 22, r1: 9, spacing: 11, maxLen: 17, minLen: 6, bite: 2,
    body: '#dfcabe', body2: '#d4bdb0', outline: '#2a1a17', hi: 'rgba(255,248,240,0.35)', ring: 'rgba(98,60,50,0.4)',
    sac: '#e9d38c', blood: '#cbb37a', eye: '#ff3030',
  },
  queen: {
    boss: true, name: 'The Lamprey Queen', hp: 130, headR: 24, r0: 22, r1: 8, spacing: 12, maxLen: 16, minLen: 6, bite: 2, underSpeed: 150,
    body: '#93405a', body2: '#86384f', outline: '#1d080e', hi: 'rgba(255,200,215,0.24)', ring: 'rgba(60,10,24,0.48)',
    gill: '#2a0710', blood: '#6a0f1d', eruptDmg: 2,
  },
  ouro: {
    boss: true, name: 'Ouroboros', hp: 250, headR: 22, r0: 20, r1: 11, spacing: 12, maxLen: 60, minLen: 16, bite: 2, ringSpeed: 125,
    body: '#eadec9', body2: '#ddd0b8', outline: '#1a1210', hi: 'rgba(255,255,255,0.32)', saddle: '#74202a',
    blood: '#2a0d12', eye: '#ffae42', bodyEyeEvery: 3,
  },
};

const BOSS_INFO = {
  mother: { title: 'The Grub Mother', sub: 'Every grub down here is hers.' },
  queen: { title: 'The Lamprey Queen', sub: 'She hears you through the floor.' },
  ouro: { title: 'Ouroboros', sub: 'The snake that eats itself.' },
  pricewar: { title: 'The Price War', sub: 'Two supermarkets. One apple. Everything must go.' },
  coalition: { title: 'The Coalition', sub: 'Four parties, one worm. For now.' },
  ender: { title: 'The Ender Wyrm', sub: 'It builds, it teleports, and it brought creepers.' },
};
/* The four fictional parties The Coalition falls apart into */
const PARTIES = [
  { name: 'ORANJE RUPS', col: '#e8742a', role: 'charge' },
  { name: 'BLAUW BOVEN', col: '#2a6ad8', role: 'spit' },
  { name: 'GROEN GRONDJE', col: '#3aa84a', role: 'dig' },
  { name: 'WORMEN EERST', col: '#8a3ad8', role: 'summon' },
];

/* Playable characters. The last two have to be unlocked. */
const CHAR_IDS = ['apple', 'appel', 'rot', 'krul', 'mika'];
const CHARS = {
  apple: { name: 'The Apple', desc: 'Balanced, and scared of everything.', speed: 152, fireDelay: 0.36, dmg: 1, seedSize: 1, maxHp: 6, perk: 'Starts with nothing. Survives anyway.' },
  appel: { name: 'Appelgameplay', desc: 'Faster feet and bigger seeds, one apple less.', speed: 168, fireDelay: 0.34, dmg: 1.1, seedSize: 1.25, maxHp: 4, perk: 'Big seeds from the start.', unlock: 'Beat the Grub Mother.', ach: 'mother' },
  rot: { name: 'The Rotten Apple', desc: 'Slow and tough. Poison seeds, and a worm already lives inside.', speed: 138, fireDelay: 0.4, dmg: 1.25, seedSize: 1.1, maxHp: 8, cyanide: true, start: ['worm'], perk: 'Starts with Cyanide Pips and The Worm.', unlock: 'Kill a Rot Eater in a secret room.', ach: 'rot' },
  krul: { name: 'Krullenbol', desc: 'Curly, always laughing, eats anything. Rocks and eggs make his seeds grow.', speed: 150, fireDelay: 0.37, dmg: 0.85, seedSize: 0.9, maxHp: 6, eater: true, perk: 'Walk into rocks and eggs to eat them. Every bite grows his seeds.', unlock: 'Heal 20 times.', ach: 'medic' },
  mika: { name: 'Mikappols', desc: 'A blue apple with one face, always. Nothing gets to him, and time stops when something tries.', speed: 156, fireDelay: 0.33, dmg: 1, seedSize: 0.95, maxHp: 6, freeze: true, perk: 'Every bite freezes the whole room for a second and a half.', unlock: 'Beat The Coalition.', ach: 'coalition' },
};

/* Powerups. Permanent for the rest of the run. */
const ITEM_IDS = ['twin', 'cyanide', 'toffee', 'worm', 'cider', 'big', 'sling', 'spread', 'thorn', 'rubber', 'rain', 'seeker', 'frost', 'fizzy', 'halo', 'split', 'hungry',
  'ember', 'boomer', 'lucky', 'static', 'wiggle', 'quick', 'sharp', 'sniper', 'peel', 'sprout', 'spiky', 'glow', 'clover', 'juice', 'magnet', 'regrow',
  'nova', 'cannon', 'buddy', 'phoenix', 'storm', 'crown', 'chrono', 'mirror', 'vamp',
  'pump', 'capy', 'chill', 'brim', 'coaster', 'pick', 'fuse', 'pact', 'dropper',
  'bonus', 'tag', 'gratis', 'hagel', 'kroket', 'klomp', 'motie', 'hamer', 'stroop', 'molen', 'veto', 'coalitie', 'deltaplan',
  'compost', 'graft', 'bruised', 'sap', 'seedbank', 'pollen', 'dash'];
const ITEMS = {
  twin: { w: 0.6, name: 'Twin Stem', desc: 'Two seeds per shot. Same effort.', apply(p) { p.twin = true; } },
  cyanide: { name: 'Cyanide Pips', desc: 'Seeds poison what they hit. Slow, but it works.', apply(p) { p.cyanide = true; p.dmg += 0.2; } },
  toffee: { name: 'Toffee Shell', desc: 'Blocks one bite, then hardens again. Armor that resets.', apply(p) { p.toffee = true; p.shellUp = true; p.shellT = 0; } },
  worm: { name: 'The Worm', desc: 'A worm circles you, bites snakes it touches and eats spit. Uninvited.', apply(p) { p.worm = { a: 0, cd: 0 }; } },
  cider: { w: 0.7, name: 'Cider Rush', desc: 'Faster feet, faster shots, faster seeds. Cider.', apply(p) { p.cider = true; p.speed *= 1.15; p.fireDelay *= 0.8; p.shotSpeed *= 1.15; } },
  big: { w: 0.7, name: 'Big Pips', desc: 'Huge seeds, more damage, a bit slower in the air.', apply(p) { p.seedSize *= 1.7; p.dmg += 0.5; p.shotSpeed *= 0.9; } },
  sling: { w: 0.8, name: 'Slingshot', desc: 'Seeds fly 40% faster and 35% farther. A stick and a band.', apply(p) { p.shotSpeed *= 1.4; p.range *= 1.35; } },
  spread: { w: 0.6, name: 'Spread Core', desc: 'Two extra seeds in a wide fan. Aiming optional.', apply(p) { p.spread = true; } },
  thorn: { name: 'Thorn Pips', desc: 'Seeds pierce through snakes. One seed, several snakes.', apply(p) { p.pierce = true; } },
  rubber: { name: 'Rubber Pips', desc: 'Seeds bounce off walls twice. Walls finally help.', apply(p) { p.bounce = 2; } },
  rain: { w: 0.7, name: 'Seed Rain', desc: 'Shoot almost twice as fast. Seeds are smaller and weaker.', apply(p) { p.fireDelay *= 0.55; p.dmg *= 0.72; p.seedSize *= 0.75; } },
  seeker: { name: 'Seeker Seeds', desc: 'Seeds curve toward the nearest snake.', apply(p) { p.seeker = true; } },
  frost: { name: 'Frost Pips', desc: 'Seeds chill snakes and slow them down.', apply(p) { p.frost = true; } },
  fizzy: { name: 'Fizzy Pips', desc: 'Seeds burst on hit and splash nearby snakes.', apply(p) { p.fizzy = true; } },
  halo: { name: 'Seed Halo', desc: 'Three seeds circle you. They block spit and sting snakes.', apply(p) { p.halo = { a: 0, cd: [0, 0, 0], orbs: [{}, {}, {}] }; } },
  split: { name: 'Splitting Pips', desc: 'Seeds split into three on hit.', apply(p) { p.split = true; } },
  hungry: { w: 0.55, name: 'Hungry Core', desc: 'Every 8 kills heal half an apple. You eat what you kill.', apply(p) { p.hungry = true; p.dmg += 0.15; } },
  ember: { name: 'Ember Pips', desc: 'Seeds set snakes on fire.', apply(p) { p.ember = true; } },
  boomer: { name: 'Boomerang Pips', desc: 'Seeds fly back to you and can hit twice.', apply(p) { p.boomer = true; } },
  lucky: { name: 'Lucky Pips', desc: '1 in 5 seeds is golden: triple damage.', apply(p) { p.lucky = true; } },
  static: { name: 'Static Pips', desc: 'Every hit zaps the nearest other snake.', apply(p) { p.zap = true; } },
  wiggle: { name: 'Wiggle Pips', desc: 'Seeds swim in a wave and hit 15% harder. No reason.', apply(p) { p.wiggle = true; p.dmg *= 1.15; } },
  quick: { w: 0.6, name: 'Quick Draw', desc: 'Shoot a quarter faster.', apply(p) { p.fireDelay *= 0.78; } },
  sharp: { w: 0.6, name: 'Sharp Pips', desc: 'Every seed hits harder. Plain and useful.', apply(p) { p.dmg += 0.5; } },
  sniper: { name: 'Sniper Seed', desc: '20% more range. Seeds hit harder the farther they fly.', apply(p) { p.sniper = true; p.range *= 1.2; } },
  peel: { w: 0.6, name: 'Thick Peel', desc: 'One more apple. Bites push you around less.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.heavy = true; } },
  sprout: { name: 'Sprout Legs', desc: 'Walk 18% faster. Legs grew. Normal.', apply(p) { p.speed *= 1.18; } },
  spiky: { name: 'Spiky Skin', desc: 'Snakes that bite you take heavy damage.', apply(p) { p.spiky = true; } },
  glow: { name: 'Glow Peel', desc: 'Lights up dark rooms. 10% more range.', apply(p) { p.glow = true; p.range *= 1.1; } },
  clover: { name: 'Four Leaf', desc: '1 in 5 bites misses you. Luck.', apply(p) { p.clover = true; } },
  juice: { w: 0.55, name: 'Apple Juice', desc: 'Apple slices heal double.', apply(p) { p.juice = true; } },
  magnet: { w: 0.6, name: 'Sticky Sap', desc: 'Apple slices fly to you from across the room.', apply(p) { p.magnet = true; } },
  regrow: { w: 0.55, name: 'Regrowth', desc: 'Clear a room you got bitten in: half an apple grows back.', apply(p) { p.regrow = true; } },
  nova: { rare: true, name: 'Apple Nova', desc: 'Every 5th shot also fires a ring of seeds around you.', apply(p) { p.nova = true; } },
  cannon: { rare: true, name: 'Pip Cannon', desc: 'Huge seeds that pierce everything, 2.6x damage. Shoots much slower.', apply(p) { p.cannon = true; p.pierce = true; p.seedSize *= 1.8; p.dmg *= 2.6; p.fireDelay *= 1.65; } },
  buddy: { rare: true, name: 'Little Apple', desc: 'A tiny apple follows you and shoots along.', apply(p) { p.buddy = { x: p.x, y: p.y + 20 }; } },
  phoenix: { rare: true, name: 'Phoenix Seed', desc: 'Once per run, get back up with two apples.', apply(p) { p.phoenix = true; } },
  storm: { rare: true, name: 'Seed Storm', desc: 'Every few seconds, seeds rain down on snakes.', apply(p) { p.storm = true; p.stormT = 1; } },
  crown: { rare: true, name: 'Apple Crown', desc: 'One more apple. 30% more damage, faster shots, feet and seeds.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.dmg *= 1.3; p.fireDelay *= 0.85; p.speed *= 1.08; p.shotSpeed *= 1.1; } },
  chrono: { rare: true, name: 'Rotten Clock', desc: 'Every snake moves 25% slower.', apply(p) { p.chrono = true; } },
  mirror: { rare: true, name: 'Mirror Core', desc: 'Every shot also fires backwards. Seeds bounce once.', apply(p) { p.mirror = true; p.bounce = Math.max(p.bounce, 1); } },
  vamp: { rare: true, name: 'Blood Orange', desc: 'Every 25 damage you deal heals half an apple.', apply(p) { p.vamp = true; p.vampAcc = 0; } },
  pump: { name: 'Pump Pips', desc: 'Every 4th seed is a fuel can. It explodes and breaks rocks and pots.', apply(p) { p.pump = true; p.pumpN = 0; } },
  capy: { name: 'Capybara', desc: 'A capybara walks with you. Nearby snakes calm down. Brings a yuzu now and then.', apply(p) { p.capy = { x: p.x - 20, y: p.y + 10, t: 0, ph: 0 }; } },
  chill: { name: 'Chill Vibes', desc: 'Stand still: shoot a lot faster, nothing pushes you.', apply(p) { p.chill = true; } },
  brim: { name: 'Brimstone', desc: 'Kills leave hellfire that burns other snakes.', apply(p) { p.brim = true; } },
  coaster: { name: 'Coaster Pips', desc: 'Seeds loop once, then hit 50% harder.', apply(p) { p.coaster = true; } },
  pick: { name: 'Diamond Pick', desc: 'Seeds break rocks, pots and blocks in one hit.', apply(p) { p.pick = true; } },
  fuse: { rare: true, name: 'Short Fuse', desc: 'Get bitten and you explode, hitting everything around you.', apply(p) { p.fuse = true; } },
  pact: { rare: true, name: "Lucifer's Pact", desc: 'Lose one apple for good. Seeds burn and hit 50% harder.', apply(p) { p.maxHp = Math.max(2, p.maxHp - 2); p.hp = Math.min(p.hp, p.maxHp); p.bites.length = Math.min(p.bites.length, Math.max(0, p.maxHp - p.hp)); p.dmg *= 1.5; p.ember = true; p.pact = true; } },
  dropper: { rare: true, name: 'Tycoon Dropper', desc: 'Every 3rd room you clear drops a new powerup.', apply(p) { p.dropper = 0; } },
  bonus: { name: 'Bonus Card', desc: 'Shops a third cheaper. Snakes drop more coins.', apply(p) { p.bonus = true; } },
  tag: { name: 'Price Tag', desc: 'Seeds tag snakes. Tagged snakes take 40% more damage.', apply(p) { p.tag = true; } },
  gratis: { w: 0.55, name: '1+1 Gratis', desc: 'Every apple slice comes with a free second one.', apply(p) { p.gratis = true; } },
  hagel: { name: 'Hagelslag', desc: 'Every shot also sprays sprinkles.', apply(p) { p.hagel = true; } },
  kroket: { w: 0.5, name: 'Kroket', desc: 'One more apple and a full heal. Deep fried.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(99); } },
  klomp: { name: 'Klompen', desc: 'Walking stomps: hurts snakes next to you and pops diggers up.', apply(p) { p.klomp = true; p.stompT = 0; } },
  motie: { name: 'Motie', desc: 'Every 6th kill hits every snake in the room hard.', apply(p) { p.motie = true; p.motieN = 0; } },
  hamer: { name: 'Gavel', desc: 'Seeds stagger snakes. Every 10th shot stuns the whole room.', apply(p) { p.hamer = true; } },
  stroop: { name: 'Stroopwafel', desc: 'A syrup shield blocks the first bite in every room.', apply(p) { p.stroop = true; p.syrup = true; } },
  molen: { name: 'Windmill', desc: 'Every few seconds a gust clears all spit and slows snakes.', apply(p) { p.molen = true; p.molenT = 3; } },
  veto: { rare: true, name: 'Veto', desc: 'Once per room, dropping to one apple stuns every snake.', apply(p) { p.veto = true; } },
  coalitie: { rare: true, name: 'Coalition', desc: 'Two party worms circle you and bite anything close.', apply(p) { p.coalitie = [{ a: 0, cd: 0, col: '#e8742a' }, { a: Math.PI, cd: 0, col: '#2a6ad8' }]; } },
  deltaplan: { rare: true, name: 'Deltaplan', desc: 'Every 10 seconds a wave hurts every snake and flushes out diggers.', apply(p) { p.delta = true; p.deltaT = 4; } },
  golden: { name: 'Golden Apple', desc: 'One more apple, one healed. Shiny.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); } },
  compost: { name: 'Compost Heap', desc: 'Every 4th kill leaves a sunflower that shoots snakes for 10 seconds.', apply(p) { p.compost = true; p.compostN = 0; } },
  graft: { name: 'Grafting', desc: 'Every 3rd room you clear: a bit more damage, for good.', apply(p) { p.graft = true; p.graftN = 0; } },
  bruised: { name: 'Bruised', desc: '15% more damage per missing apple.', apply(p) { p.bruised = true; } },
  sap: { name: 'Sap Trail', desc: 'You leave sap where you walk. It slows snakes.', apply(p) { p.sap = true; p.sapT = 0; } },
  seedbank: { name: 'Seed Bank', desc: '1% more damage per coin you carry, up to 40%.', apply(p) { p.seedbank = true; } },
  pollen: { name: 'Pollen Puff', desc: 'Every few seconds you puff pollen. Snakes in it cannot bite.', apply(p) { p.pollen = true; p.pollenT = 2; } },
  dash: { rare: true, name: 'Cider Dash', desc: 'Dash with Space, Shift or right click, or double tap the move side. Nothing can bite you mid dash. Short, fast, untouchable.', apply(p) { p.dash = true; p.dashCd = 0; } },
};

/* Curses: a deal. Something gets a lot better, something gets worse. You can wash them off. */
const CURSE_IDS = ['glass', 'heavycore', 'overripe', 'greedy', 'hangover', 'stampede', 'blight', 'wormy', 'rotting', 'bitter'];
const CURSES = {
  glass: { curse: true, name: 'Glass Cannon', desc: 'Seeds deal 2x damage. Every bite takes 1 whole apple. Strong and breakable.', mod: { dmg: 2 }, flag: 'glass' },
  heavycore: { curse: true, name: 'Heavy Core', desc: 'Seeds hit 60% harder. You walk 25% slower. Heavy hands, heavy legs.', mod: { dmg: 1.6, speed: 0.75 } },
  overripe: { curse: true, name: 'Overripe', desc: 'You shoot 33% faster and walk faster. 1 apple less while it lasts. Ripe is a state, not a goal.', mod: { rate: 0.75, speed: 1.15 }, maxHp: -2 },
  greedy: { curse: true, name: 'Greedy Peel', desc: 'Snakes drop 2x the coins. Shops cost 50% more. Money in, money out.', flag: 'greedy' },
  hangover: { curse: true, name: 'Hangover', desc: 'You shoot 33% faster and seeds fly farther. Your aim sways all over. Last night is still in there.', mod: { rate: 0.75, range: 1.15, sway: 0.24 } },
  stampede: { curse: true, name: 'Stampede', desc: 'Snakes move 15% faster and drop more apple slices and coins. Faster snakes, bigger payout.', flag: 'stampede' },
  blight: { curse: true, name: 'Blight', desc: 'Every fight has a gold worm. Powerups are 2x as likely to be legendary. More risk, more shine.', flag: 'blight' },
  wormy: { curse: true, name: 'Wormy', desc: '1 extra grub in every fight. Every grub drops a coin. Small pests, small change.', flag: 'wormy' },
  rotting: { curse: true, name: 'Core Rot', desc: 'Seeds hit 35% harder. Every new floor rots away 0.5 apple of health for good. Strong now, less later.', mod: { dmg: 1.35 }, flag: 'rotting' },
  bitter: { curse: true, name: 'Bitter Skin', desc: 'Snakes that bite you get hurt badly. Apple slices heal 50% less. Bite back, eat less.', flag: 'bitter' },
};
/* Downgrades: plain bad luck. Get bitten in a room and the rot may follow you out. */
const DOWN_IDS = ['dull', 'stiff', 'soggy', 'sluggish', 'wormhole', 'butter', 'rattled', 'blurry'];
const DOWNS = {
  dull: { down: true, name: 'Dull Pips', desc: 'Seeds hit 12% softer. Slightly worse.', mod: { dmg: 0.88 } },
  stiff: { down: true, name: 'Stiff Stem', desc: 'You shoot 12% slower. Your finger works. The stem does not.', mod: { rate: 1.12 } },
  soggy: { down: true, name: 'Soggy Seeds', desc: 'Seeds fly slower and not as far. Wet seeds.', mod: { shot: 0.9, range: 0.88 } },
  sluggish: { down: true, name: 'Sluggish', desc: 'You move 8% slower. Everything takes longer.', mod: { speed: 0.92 } },
  wormhole: { down: true, name: 'Wormhole', desc: 'A worm ate a hole in you: 0.5 apple of health less. It left.', maxHp: -1 },
  butter: { down: true, name: 'Butterfingers', desc: 'Your aim wobbles a little. Slippery hands.', mod: { wobble: 0.1 } },
  rattled: { down: true, name: 'Rattled', desc: 'Bites knock you back a lot farther. Shaken.', mod: { kb: 1.6 } },
  blurry: { down: true, name: 'Cloudy Eyes', desc: 'Your light reaches less far in the dark. Less to see.', mod: { light: 0.82 } },
};
// powerups, curses and downgrades share icons and info cards
function thingInfo(id) { return ITEMS[id] || CURSES[id] || DOWNS[id] || null; }

