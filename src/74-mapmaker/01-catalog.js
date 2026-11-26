/* 74.js section 01: catalog. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { SF } = M74;
  M74.typeTemplate = typeTemplate; M74.entDefaults = entDefaults;
  /* ================================================================== 1. the catalog */
  const GW = COLS, GH = ROWS, GN = COLS * ROWS; M74.GN = GN; M74.GH = GH; M74.GW = GW;
  const EMPTY = '.'.repeat(GN); M74.EMPTY = EMPTY;
  const CH_COLS = ['#ff4a5a', '#3aa0ff', '#5ad85a', '#ffc83a']; M74.CH_COLS = CH_COLS;
  const CH_NAMES = ['Red', 'Blue', 'Green', 'Gold']; M74.CH_NAMES = CH_NAMES;
  const DIRS = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]]; M74.DIRS = DIRS;
  const DIR_NAMES = ['East', 'South-east', 'South', 'South-west', 'West', 'North-west', 'North', 'North-east']; M74.DIR_NAMES = DIR_NAMES;
  const DIR_SHORT = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
  // mirroring a direction: across a vertical line (left and right swap), across a horizontal line (up and down swap)
  const MIRX = [4, 3, 2, 1, 0, 7, 6, 5], MIRY = [0, 7, 6, 5, 4, 3, 2, 1]; M74.MIRY = MIRY; M74.MIRX = MIRX;

  // the floors a map can use, in the order the picker shows them
  const SETS = ['cellar', 'halls', 'market', 'kamer', 'garden', 'bus', 'rook', 'mega', 'arena', 'rave', 'court', 'metro', 'afgrond', 'ruimte']; M74.SETS = SETS;
  const setDef = (set) => (SET_LEVEL[set] != null ? LEVELS[SET_LEVEL[set]] : (typeof floorDef10 === 'function' && floorDef10(set)) || LEVELS[0]); M74.setDef = setDef;
  const setName = (set) => setDef(set).name || set; M74.setName = setName;

  // tiles: one character in the room grid, the same characters the game's own rooms use
  // [char, id, name, palette group, description, solid]
  const TILES = [
    ['.', 'floor', 'Floor', 'blocks', 'Empty floor. Paint it to rub things out.', 0],
    ['#', 'rock', 'Rock', 'blocks', 'Solid. Blocks feet and seeds. Explosions and a Diamond Pick break it.', 1],
    ['H', 'wall', 'Wall', 'blocks', 'A full block of wall. Joins up with the walls next to it.', 1],
    ['u', 'pot', 'Pot', 'blocks', 'Breaks in three hits. Slices, coins, sometimes rot.', 1],
    ['e', 'eggs', 'Eggs', 'blocks', 'Break in two hits. Sometimes a grub hatches. Sometimes a slice.', 1],
    ['g', 'gold', 'Gold pile', 'loot', 'Shoot it for coins. Four hits.', 1],
    ['c', 'candles', 'Candles', 'blocks', 'Light in the dark. Seeds fly past.', 1],
    ['_', 'chasm', 'Chasm', 'blocks', 'A hole in the floor. Nobody walks it, seeds fly over it.', 1],
    ['T', 'counter', 'Counter', 'blocks', 'A shop counter. Solid.', 1],
    ['&', 'screens', 'Screen wall', 'blocks', 'A wall of televisions. Solid.', 1],
    ['/', 'vending', 'Vending machine', 'blocks', 'Solid. Out of order.', 1],
    ['4', 'lamp', 'Station lamp', 'blocks', 'A lamp post. Solid.', 1],
    ['=', 'bed', 'Hospital bed', 'blocks', 'Solid. Somebody left.', 1],
    ['[', 'medcart', 'Med cart', 'blocks', 'Solid. Rolls nowhere.', 1],
    ['o', 'crate', 'Crate', 'blocks', 'Solid.', 1],
    ['n', 'bench', 'Bench', 'blocks', 'Solid. For the public.', 1],
    ['l', 'bottles', 'Bottles', 'blocks', 'Solid.', 1],
    ['b', 'bread', 'Bread rack', 'blocks', 'Solid. Yesterday’s.', 1],
    ['x', 'checkout', 'Checkout', 'blocks', 'Solid. Self service.', 1],
    ['f', 'freezer', 'Freezer', 'blocks', 'Solid. Cold.', 1],
    ['>', 'beltR', 'Belt right', 'floor', 'A conveyor belt. Carries everything to the right.', 0],
    ['<', 'beltL', 'Belt left', 'floor', 'A conveyor belt. Carries everything to the left.', 0],
    ['K', 'cart', 'Shopping cart', 'floor', 'Walk or shoot it into a snake to ram it. Blocks venom.', 0],
    ['*', 'bush', 'Bush', 'floor', 'Floor plant. Looks nice.', 0],
    ['-', 'rails', 'Rails', 'floor', 'Old rails in the floor.', 0],
    ['h', 'slice', 'Apple slice', 'loot', 'Heals when you walk over it.', 0],
    ['r', 'rotapple', 'Rotten apple', 'floor', 'Shoot it before a Rot Eater eats it.', 0],
    ['X', 'chest', 'Chest', 'loot', 'Two powerups inside, take one. Works in any room.', 1],
    ['J', 'slot', 'Slot machine', 'loot', 'Three coins a pull. Works in any room.', 1],
    ['~', 'spring', 'Spring', 'loot', 'Step in once: heals and washes off downgrades. Works in any room.', 0],
    ['$', 'goods', 'Shop goods', 'pieces', 'A powerup for sale. Shop rooms only.', 0],
    ['+', 'goodsSlice', 'Shop slices', 'pieces', 'Two slices for sale. Shop rooms only.', 0],
    ['%', 'goodsCursed', 'Cursed goods', 'pieces', 'Half price, with a curse. Shop rooms only.', 0],
    ['!', 'goodsWash', 'Apple Wash', 'pieces', 'Washes off one downgrade or curse. Shop rooms only.', 0],
    ['q', 'goodsReroll', 'Reroll machine', 'pieces', 'Swaps the goods. Shop rooms only.', 0],
    ['A', 'altarC', 'Challenge altar', 'pieces', 'Starts three waves. Challenge rooms only.', 1],
    ['U', 'altarS', 'Survival altar', 'pieces', 'Starts the countdown. Survival rooms only.', 1],
    ['O', 'altarO', 'Offering altar', 'pieces', 'Holds the offering. Offering rooms only.', 1],
    ['Y', 'lectern', 'Lectern', 'pieces', 'Holds a motion. Vote rooms only.', 1],
    ['I', 'book', 'Book stand', 'pieces', 'Holds a cursed book. Library rooms only.', 1],
    ['7', 'pump', 'Pump', 'pieces', 'A BP pump. Tankstation rooms only.', 1],
    ['8', 'till', 'Till', 'pieces', 'Sells your powerups. Tankstation rooms only.', 1],
    ['s', 'snackspot', 'Snack shelf', 'pieces', 'Snacks for sale. Tankstation rooms only.', 0],
    ['9', 'chair', 'Barber chair', 'pieces', 'Sit for a cut. Kapsalon rooms only.', 1],
    ['p', 'plate', 'Court plate', 'pieces', 'Eiser on the left half, gedaagde on the right. Rechtbank rooms only.', 0],
    ['3', 'judge', 'Judge’s bench', 'pieces', 'Rechtbank rooms only.', 1],
  ]; M74.TILES = TILES;
  const TILE = {}; M74.TILE = TILE;
  for (const [ch, id, name, cat, desc, solid] of TILES) TILE[ch] = { ch, id, name, cat, desc, solid: !!solid };
  const GRID_OK = TILES.map((t) => t[0]).join(''); M74.GRID_OK = GRID_OK;
  const SOLID_TILE = (ch) => !!(TILE[ch] && TILE[ch].solid); M74.SOLID_TILE = SOLID_TILE;

  // snakes: everything a room can spawn. Characters from the game's templates turn into snake pieces.
  const SPAWN_CH = Object.assign({ W: 'grub', S: 'hood', B: 'lamprey', G: 'long', R: 'rotter', Q: 'tetra', V: 'rocket', F: 'fuel', N: 'bonus', D: 'discount', M: 'kamerlid', L: 'lobby', P: 'splitter', Z: 'sniper' }, typeof V9_SPAWN === 'object' ? V9_SPAWN : {}); M74.SPAWN_CH = SPAWN_CH;
  const SNAKES = ['grub', 'hood', 'lamprey', 'long', 'splitter', 'splitling', 'sniper', 'tetra', 'rocket', 'fuel', 'creeper', 'bonus', 'discount', 'kamerlid', 'lobby', 'rotter',
    'stok', 'stroopw', 'bril', 'handel', 'pantser', 'driekop', 'sloper', 'kameleon', 'raver', 'clown', 'killerclown', 'stekker', 'bosje', 'peukworm', 'mutant', 'rage1', 'rage2', 'rage3']
    .filter((k) => KINDS[k] && !KINDS[k].boss); M74.SNAKES = SNAKES;
  const snakeName = (k) => SF((KINDS[k] && KINDS[k].name) || k); M74.snakeName = snakeName;
  const TRAITS = ['', 'armor', 'swift', 'spite', 'regen'];
  const TRAIT_LABEL = { '': 'None', armor: 'Armored', swift: 'Swift', spite: 'Spiteful', regen: 'Regrows' };
  // bosses a lair or an arena can hold
  const BOSSES = (typeof BOSS_ORDER10 !== 'undefined' ? BOSS_ORDER10 : ['mother', 'queen', 'pricewar', 'coalition', 'ouro', 'ender'])
    .concat(BOSS_INFO.wals ? ['wals'] : []).filter((k, i, a) => BOSS_INFO[k] && a.indexOf(k) === i && k !== 'jaude'); M74.BOSSES = BOSSES;
  const bossName = (k) => SF((BOSS_INFO[k] && BOSS_INFO[k].title) || (KINDS[k] && KINDS[k].name) || k); M74.bossName = bossName;
  const bossArt = (k) => (k === 'pricewar' ? 'pwblue,pwyellow' : KINDS[k] ? k : 'mother'); M74.bossArt = bossArt;
  const MINIS = SNAKES.filter((k) => !['splitling', 'rotter', 'creeper', 'rage1', 'rage2', 'rage3'].includes(k)); M74.MINIS = MINIS;

  // room types. [id, name, code, color, description]
  const RTYPES = [
    ['start', 'Start', 'STA', '#ece2d4', 'The apple drops in here. One per floor. Snakes in here jump you right away.'],
    ['fight', 'Fight', 'FGT', '#d7263d', 'Doors bite shut until every snake and every nest in here is dead.'],
    ['hall', 'Hall', 'HAL', '#8a7a6a', 'No lock, no fight. A corridor, a breather, a puzzle room.'],
    ['boss', 'Lair', 'LAI', '#e83a50', 'The floor boss. Beat it and the way down opens. One per floor.'],
    ['arena', 'Boss arena', 'ARN', '#ff5a8a', 'Any boss you pick, anywhere on the floor. Pays a legendary.'],
    ['miniboss', 'Mini boss', 'MIN', '#d06a3a', 'One big gold snake guarding a good powerup.'],
    ['challenge', 'Challenge', 'CHL', '#b0402e', 'Touch the altar, survive three waves, win a powerup.'],
    ['survival', 'Survival', 'SUR', '#c87830', 'Touch the altar and stay alive while they keep coming.'],
    ['chest', 'Treasure', 'CHS', '#b8913f', 'A chest with two powerups. Take one, the other vanishes.'],
    ['shop', 'Shop', 'SHP', '#1aa0e0', 'Goods on the floor, prices on the goods.'],
    ['vault', 'Vault', 'VLT', '#c9a000', 'Barred shut, a key opens it. Two powerups and gold.'],
    ['pantry', 'Pantry', 'PAN', '#6f9a3a', 'Slices and pots, nothing hungry.'],
    ['offering', 'Offering', 'OFR', '#d04a5c', 'A free powerup for one apple of health or a curse.'],
    ['library', 'Cursed books', 'LIB', '#9a5ad8', 'Every book holds a powerup and a curse. Take one.'],
    ['vote', 'Vote', 'VOT', '#e8742a', 'Two motions on two lecterns. Walk onto one.'],
    ['gamble', 'Slot machine', 'SLT', '#f2c230', 'Three coins a pull.'],
    ['spring', 'Spring', 'SPR', '#3aa89a', 'Heals and washes off every downgrade. Once.'],
    ['tank', 'BP Tankstation', 'TNK', '#4ac05a', 'Pumps that tune your apple, and a till that buys powerups.'],
    ['kapper', 'Kapsalon', 'KAP', '#e8e2d0', 'One cut, a small boost for good. Or a kappersfail.'],
    ['courtroom', 'Rechtbank', 'CRT', '#d8b46a', 'Step onto a plate. Eiser or gedaagde.'],
    ['gym', 'Klokhuis Gym', 'GYM', '#b4f03c', 'Coach Larspel opens three stations. His furniture goes on top.'],
    ['quiet', 'Prikkelarme Kamer', 'QUI', '#9a8acf', 'A beanbag that heals and washes off one downgrade. Fixed layout.'],
  ]; M74.RTYPES = RTYPES;
  const RT = {}; M74.RT = RT;
  for (const [id, name, code, col, desc] of RTYPES) RT[id] = { id, name, code, col, desc };
  // the pieces a room type needs to work, and the layout it starts from
  const NEEDS = { shop: '$+%!q', challenge: 'A', offering: 'O', survival: 'U', vote: 'Y', library: 'I', tank: '7', kapper: '9', courtroom: 'p', chest: 'X', gamble: 'J', spring: '~' }; M74.NEEDS = NEEDS;
  const FIXED = { quiet: 1 }; M74.FIXED = FIXED;
  function typeTemplate(type) {
    if (type === 'quiet' && typeof TPL10 !== 'undefined' && TPL10.quiet) return TPL10.quiet.join('');
    const t = TPL[type];
    if (!t || type === 'boss' || type === 'fight' || type === 'start') return null;
    return (Array.isArray(t[0]) ? t[0] : t).map((r) => (r + '...........').slice(0, GW)).join('');
  }
  const MODS = [['', 'None'], ['dark', 'Dark'], ['elite', 'One gold snake'], ['freezer', 'Ice floor'], ['blackice', 'Black ice'], ['collapse', 'Cracking floor'], ['skins', 'Shed skins'],
    ['roots', 'Roots'], ['lasers', 'Lasers'], ['sparks', 'Short circuit'], ['gas', 'Closing gas'], ['smog', 'Thick smoke'], ['rails', 'Live rails']].filter(([k]) => !k || MOD_NAMES[k]); M74.MODS = MODS;

  // the pieces this patch adds. [id, name, palette group, description, solid, params]
  // params: [key, label, kind, options or default]
  const ENTS = {
    sn: { name: 'Snake', cat: 'snakes', solid: 0, desc: 'A snake that waits in this spot until you walk in.' },
    tp: { name: 'Teleporter', cat: 'gadgets', solid: 0, desc: 'Step on it and come out at the next pad of the same color, in this room or another one. Dead while the doors are shut.' },
    jp: { name: 'Jump pad', cat: 'gadgets', solid: 0, desc: 'Flings the apple the way the arrow points. Carts too.' },
    sp: { name: 'Speed strip', cat: 'gadgets', solid: 0, desc: 'Pushes everything on it the way the chevrons point. Fast.' },
    bm: { name: 'Bumper', cat: 'gadgets', solid: 1, desc: 'Pinball bumper. Kicks the apple away and bounces seeds back out a bit faster.' },
    lv: { name: 'Lever', cat: 'gadgets', solid: 1, desc: 'Shoot it or walk into it. Flips every gate of its color on the floor.' },
    gt: { name: 'Gate', cat: 'gadgets', solid: 1, desc: 'Bars in the floor. A lever of the same color opens and shuts it.' },
    sg: { name: 'Sign', cat: 'gadgets', solid: 0, desc: 'Says your text when the apple stands next to it.' },
    ex: { name: 'Exit hatch', cat: 'gadgets', solid: 0, desc: 'Opens when the room is clear. Drops you a floor, or into daylight on the last one.' },
    fb: { name: 'Fire bar', cat: 'traps', solid: 1, desc: 'A row of fireballs turning around a post. Burns the apple and snakes alike.' },
    sw: { name: 'Saw blade', cat: 'traps', solid: 0, desc: 'Runs back and forth in a slot until it hits something solid. Cuts everything.' },
    tt: { name: 'Spitter totem', cat: 'traps', solid: 1, desc: 'A stone head that spits venom on a timer. Can aim at you.' },
    bx: { name: 'Powder keg', cat: 'traps', solid: 1, desc: 'Two hits and it blows. Hurts everything close, breaks rocks, sets off other kegs.' },
    ns: { name: 'Snake nest', cat: 'traps', solid: 1, desc: 'Keeps spitting out snakes while you fight. The room stays shut until it is broken.' },
    ac: { name: 'Acid', cat: 'traps', solid: 0, desc: 'Burns the apple that steps in. Snakes too, slower.' },
    wk: { name: 'Weak floor', cat: 'traps', solid: 0, desc: 'Gives way a moment after you step on it. Then it is a hole.' },
    sk: { name: 'Spike trap', cat: 'traps', solid: 0, desc: 'Spikes come up in turns, group A then group B. Snakes get hurt too.' },
    pd: { name: 'Pedestal', cat: 'loot', solid: 0, desc: 'A powerup on a stone, free or for coins. Pick one or let the floor roll it.' },
    ky: { name: 'Key', cat: 'loot', solid: 0, desc: 'Opens one locked room. Any locked room.' },
    cn: { name: 'Coins', cat: 'loot', solid: 0, desc: 'A small pile of coins.' },
    pl: { name: 'Pressure plate', cat: 'gadgets', solid: 0, desc: 'A plate in the floor. Stand on it and every gate of its color flips. Step off and they flip back, or not, your call.' },
    tx: { name: 'Floor text', cat: 'text', solid: 0, desc: 'Words painted on the floor. Chalk, blood, gold. Big ones run across a few tiles.' },
    nt: { name: 'Note', cat: 'text', solid: 0, desc: 'A note on the floor. Step on it and the game stops while it reads out. Paper, a warning, a story page or a phone.' },
    cq: { name: 'Choice', cat: 'text', solid: 0, desc: 'A little shrine that asks a question. Two answers, each does something. Heal, coins, a powerup, a curse, snakes. One use.' },
    sh: { name: 'Shout', cat: 'text', solid: 0, desc: 'An invisible trigger. Puts a big line of text over the room when you walk in, step on it, or clear the room.' },
  }; M74.ENTS = ENTS;
  // what an answer at a Choice does
  const EFFECTS = [['none', 'Nothing'], ['heal', 'Heal one apple'], ['hurt', 'Lose half an apple'], ['coins', 'Get 10 coins'], ['buy', 'Pay 10 coins for a powerup'],
    ['deal', 'Lose an apple for a powerup'], ['item', 'Free powerup'], ['down', 'Get a downgrade'], ['snakes', 'Let out three snakes'], ['gate', 'Flip the gates'], ['bomb', 'It blows up'], ['key', 'Get a key']]; M74.EFFECTS = EFFECTS;
  const TX_COLS = ['#efe6d2', '#c8202a', '#ffc53a', '#8fe04a', '#8ad8ff']; M74.TX_COLS = TX_COLS;
  const P_ = (k, label, kind, opts, def) => ({ k, label, kind, opts, def }); M74.P_ = P_;
  const ENT_PARAMS = {
    sn: [P_('k', 'Snake', 'snake', null, 'grub'), P_('g', 'Gold worm', 'seg', [[0, 'No'], [1, 'Yes']], 0), P_('tr', 'Trait', 'seg', TRAITS.map((t) => [t, TRAIT_LABEL[t]]), ''),
      P_('say', 'Says when the fight starts', 'text', 50, ''), P_('die', 'Last words', 'text', 40, ''),
      P_('vr', 'Colour', 'seg', [[0, 'Random'], [1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four']], 0), P_('hp', 'Health', 'seg', [[0.5, '50%'], [1, '100%'], [1.5, '150%'], [2, '200%'], [3, '300%']], 1)],
    tp: [P_('ch', 'Color', 'col', null, 0)],
    jp: [P_('d', 'Direction', 'dir8', null, 6), P_('f', 'Power', 'seg', [[1, 'Short'], [2, 'Normal'], [3, 'Far']], 2)],
    sp: [P_('d', 'Direction', 'dir4', null, 0)],
    bm: [P_('st', 'Color', 'seg', [[0, 'Red'], [1, 'Yellow'], [2, 'Blue']], 0)],
    lv: [P_('ch', 'Color', 'col', null, 0)],
    gt: [P_('ch', 'Color', 'col', null, 0), P_('o', 'At the start', 'seg', [[0, 'Shut'], [1, 'Open']], 0)],
    sg: [P_('txt', 'Text', 'text', 90, 'Mind the snakes.')],
    ex: [],
    fb: [P_('n', 'Length', 'seg', [[2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6']], 4), P_('s', 'Speed', 'seg', [[1, 'Slow'], [2, 'Normal'], [3, 'Fast']], 2), P_('w', 'Turns', 'seg', [[1, 'Clockwise'], [-1, 'Counter']], 1), P_('a', 'Starts at', 'dir4', null, 0)],
    sw: [P_('ax', 'Runs', 'seg', [['h', 'Left, right'], ['v', 'Up, down']], 'h'), P_('s', 'Speed', 'seg', [[1, 'Slow'], [2, 'Normal'], [3, 'Fast']], 2)],
    tt: [P_('d', 'Spits', 'dir8a', null, 8), P_('s', 'Rate', 'seg', [[1, 'Slow'], [2, 'Normal'], [3, 'Fast']], 2), P_('on', 'Active', 'seg', [['a', 'Always'], ['f', 'In a fight']], 'a'), P_('b', 'Breakable', 'seg', [[0, 'No'], [1, 'Yes']], 1)],
    bx: [],
    ns: [P_('k', 'Snake', 'snake', null, 'grub'), P_('n', 'At once', 'seg', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], 3), P_('s', 'Rate', 'seg', [[1, 'Slow'], [2, 'Normal'], [3, 'Fast']], 2)],
    ac: [],
    wk: [],
    sk: [P_('g', 'Group', 'seg', [[0, 'A'], [1, 'B']], 0)],
    pd: [P_('id', 'Powerup', 'item', null, 'rand'), P_('c', 'Price', 'seg', [[0, 'Free'], [5, '5'], [10, '10'], [15, '15'], [25, '25'], [35, '35']], 0)],
    ky: [],
    cn: [P_('n', 'Coins', 'seg', [[1, '1'], [3, '3'], [5, '5'], [10, '10']], 3)],
    pl: [P_('ch', 'Color', 'col', null, 0), P_('m', 'Works', 'seg', [['h', 'While you stand on it'], ['t', 'Flips on every step']], 'h')],
    tx: [P_('txt', 'Text', 'text', 40, 'THIS WAY'), P_('sz', 'Size', 'seg', [[1, 'Small'], [2, 'Medium'], [3, 'Big']], 2),
      P_('cl', 'Paint', 'seg', [[0, 'Chalk'], [1, 'Blood'], [2, 'Gold'], [3, 'Slime'], [4, 'Ice']], 0), P_('fx', 'Effect', 'seg', [[0, 'Still'], [1, 'Glow'], [2, 'Wave'], [3, 'Flicker']], 0)],
    nt: [P_('ti', 'Title', 'text', 30, 'A note'), P_('txt', 'Text', 'text', 240, 'Whoever finds this: the snakes are not the worst part. The worst part is the stairs.'),
      P_('ty', 'Looks like', 'seg', [[0, 'Paper'], [1, 'Warning'], [2, 'Story'], [3, 'Phone']], 0), P_('on', 'Shows', 'seg', [['o', 'Once'], ['a', 'Every time']], 'o')],
    cq: [P_('ti', 'Title', 'text', 30, 'A deal'), P_('txt', 'Question', 'text', 160, 'The shrine wants something. It always wants something.'),
      P_('a', 'Answer one', 'text', 24, 'Take the deal'), P_('ae', 'Answer one does', 'sel', EFFECTS, 'deal'),
      P_('b', 'Answer two', 'text', 24, 'Walk away'), P_('be', 'Answer two does', 'sel', EFFECTS, 'none'),
      P_('ch', 'Gate color (for Flip the gates)', 'col', null, 0), P_('hd', 'Show what answers do', 'seg', [[0, 'Show'], [1, 'Hide, a gamble']], 0)],
    sh: [P_('txt', 'Big line', 'text', 40, 'Welcome in'), P_('s', 'Small line', 'text', 70, 'Nobody leaves hungry.'),
      P_('on', 'Fires', 'seg', [['e', 'When you walk in'], ['s', 'When you step here'], ['c', 'When the room is clear']], 'e'), P_('st', 'Style', 'seg', [['', 'Plain'], ['legend', 'Gold'], ['curse', 'Red']], '')],
  }; M74.ENT_PARAMS = ENT_PARAMS;
  function entDefaults(t) { const o = {}; for (const p of ENT_PARAMS[t] || []) o[p.k] = p.def; return o; }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
