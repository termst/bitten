/* src/74-v123-mapmaker.js: v12.3 to v12.6: Map Maker. From v12.3 to v12.6. Lines 34366 to 39286 of the v13.7 script. */
/* =====================================================================
   Bitten v12.3: Map Maker. Build your own dungeon floor by floor and room
   by room: paint every tile, drop snakes, traps and loot, set the rules,
   test it, and share the whole map as one line of text.
   New map pieces, usable anywhere in a map: teleporters, jump pads, speed
   strips, bumpers, fire bars, saw blades, spitter totems, powder kegs,
   snake nests, levers and gates, signs, pedestals, exit hatches, acid,
   weak floor, spike traps, keys and coin piles.
   ===================================================================== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe74'); if (window.console) console.warn('v12.3', e); return fb; } };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S9 = (s) => (typeof say9 === 'function' ? say9(s) : s);
  const SF = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s);
  const FONT = typeof UIF !== 'undefined' ? UIF : '"Barlow Condensed", "Arial Narrow", sans-serif';
  const MK = window.__bitten.MK123 = {};

  /* ================================================================== 1. the catalog */
  const GW = COLS, GH = ROWS, GN = COLS * ROWS;
  const EMPTY = '.'.repeat(GN);
  const CH_COLS = ['#ff4a5a', '#3aa0ff', '#5ad85a', '#ffc83a'];
  const CH_NAMES = ['Red', 'Blue', 'Green', 'Gold'];
  const DIRS = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]];
  const DIR_NAMES = ['East', 'South-east', 'South', 'South-west', 'West', 'North-west', 'North', 'North-east'];
  const DIR_SHORT = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
  // mirroring a direction: across a vertical line (left and right swap), across a horizontal line (up and down swap)
  const MIRX = [4, 3, 2, 1, 0, 7, 6, 5], MIRY = [0, 7, 6, 5, 4, 3, 2, 1];

  // the floors a map can use, in the order the picker shows them
  const SETS = ['cellar', 'halls', 'market', 'kamer', 'garden', 'bus', 'rook', 'mega', 'arena', 'rave', 'court', 'metro', 'afgrond'];
  const setDef = (set) => (SET_LEVEL[set] != null ? LEVELS[SET_LEVEL[set]] : (typeof floorDef10 === 'function' && floorDef10(set)) || LEVELS[0]);
  const setName = (set) => setDef(set).name || set;

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
  ];
  const TILE = {};
  for (const [ch, id, name, cat, desc, solid] of TILES) TILE[ch] = { ch, id, name, cat, desc, solid: !!solid };
  const GRID_OK = TILES.map((t) => t[0]).join('');
  const SOLID_TILE = (ch) => !!(TILE[ch] && TILE[ch].solid);

  // snakes: everything a room can spawn. Characters from the game's templates turn into snake pieces.
  const SPAWN_CH = Object.assign({ W: 'grub', S: 'hood', B: 'lamprey', G: 'long', R: 'rotter', Q: 'tetra', V: 'rocket', F: 'fuel', N: 'bonus', D: 'discount', M: 'kamerlid', L: 'lobby', P: 'splitter', Z: 'sniper' }, typeof V9_SPAWN === 'object' ? V9_SPAWN : {});
  const SNAKES = ['grub', 'hood', 'lamprey', 'long', 'splitter', 'splitling', 'sniper', 'tetra', 'rocket', 'fuel', 'creeper', 'bonus', 'discount', 'kamerlid', 'lobby', 'rotter',
    'stok', 'stroopw', 'bril', 'handel', 'pantser', 'driekop', 'sloper', 'kameleon', 'raver', 'clown', 'killerclown', 'stekker', 'bosje', 'peukworm', 'mutant', 'rage1', 'rage2', 'rage3']
    .filter((k) => KINDS[k] && !KINDS[k].boss);
  const snakeName = (k) => SF((KINDS[k] && KINDS[k].name) || k);
  const TRAITS = ['', 'armor', 'swift', 'spite', 'regen'];
  const TRAIT_LABEL = { '': 'None', armor: 'Armored', swift: 'Swift', spite: 'Spiteful', regen: 'Regrows' };
  // bosses a lair or an arena can hold
  const BOSSES = (typeof BOSS_ORDER10 !== 'undefined' ? BOSS_ORDER10 : ['mother', 'queen', 'pricewar', 'coalition', 'ouro', 'ender'])
    .concat(BOSS_INFO.wals ? ['wals'] : []).filter((k, i, a) => BOSS_INFO[k] && a.indexOf(k) === i && k !== 'jaude');
  const bossName = (k) => SF((BOSS_INFO[k] && BOSS_INFO[k].title) || (KINDS[k] && KINDS[k].name) || k);
  const bossArt = (k) => (k === 'pricewar' ? 'pwblue,pwyellow' : KINDS[k] ? k : 'mother');
  const MINIS = SNAKES.filter((k) => !['splitling', 'rotter', 'creeper', 'rage1', 'rage2', 'rage3'].includes(k));

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
  ];
  const RT = {};
  for (const [id, name, code, col, desc] of RTYPES) RT[id] = { id, name, code, col, desc };
  // the pieces a room type needs to work, and the layout it starts from
  const NEEDS = { shop: '$+%!q', challenge: 'A', offering: 'O', survival: 'U', vote: 'Y', library: 'I', tank: '7', kapper: '9', courtroom: 'p', chest: 'X', gamble: 'J', spring: '~' };
  const FIXED = { quiet: 1 };
  function typeTemplate(type) {
    if (type === 'quiet' && typeof TPL10 !== 'undefined' && TPL10.quiet) return TPL10.quiet.join('');
    const t = TPL[type];
    if (!t || type === 'boss' || type === 'fight' || type === 'start') return null;
    return (Array.isArray(t[0]) ? t[0] : t).map((r) => (r + '...........').slice(0, GW)).join('');
  }
  const MODS = [['', 'None'], ['dark', 'Dark'], ['elite', 'One gold snake'], ['freezer', 'Ice floor'], ['blackice', 'Black ice'], ['collapse', 'Cracking floor'], ['skins', 'Shed skins'],
    ['roots', 'Roots'], ['lasers', 'Lasers'], ['sparks', 'Short circuit'], ['gas', 'Closing gas'], ['smog', 'Thick smoke'], ['rails', 'Live rails']].filter(([k]) => !k || MOD_NAMES[k]);

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
  };
  // what an answer at a Choice does
  const EFFECTS = [['none', 'Nothing'], ['heal', 'Heal one apple'], ['hurt', 'Lose half an apple'], ['coins', 'Get 10 coins'], ['buy', 'Pay 10 coins for a powerup'],
    ['deal', 'Lose an apple for a powerup'], ['item', 'Free powerup'], ['down', 'Get a downgrade'], ['snakes', 'Let out three snakes'], ['gate', 'Flip the gates'], ['bomb', 'It blows up'], ['key', 'Get a key']];
  const TX_COLS = ['#efe6d2', '#c8202a', '#ffc53a', '#8fe04a', '#8ad8ff'];
  const P_ = (k, label, kind, opts, def) => ({ k, label, kind, opts, def });
  const ENT_PARAMS = {
    sn: [P_('k', 'Snake', 'snake', null, 'grub'), P_('g', 'Gold worm', 'seg', [[0, 'No'], [1, 'Yes']], 0), P_('tr', 'Trait', 'seg', TRAITS.map((t) => [t, TRAIT_LABEL[t]]), ''),
      P_('say', 'Says when the fight starts', 'text', 50, ''), P_('die', 'Last words', 'text', 40, '')],
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
  };
  function entDefaults(t) { const o = {}; for (const p of ENT_PARAMS[t] || []) o[p.k] = p.def; return o; }

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
  ];
  const RULE_DEF = {};
  for (const [k, , , d] of RULES) RULE_DEF[k] = d;
  const DARK = [[-1, 'Floor default'], [0, 'Bright'], [1, 'Dim'], [2, 'Dark'], [3, 'Pitch']];
  const DARK_V = [0.32, 0.55, 0.76, 0.9];
  const DIFF_OPTS = [['', 'Player picks'], ['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['nightmare', 'Nightmare']];
  const LIMITS = { floors: 8, rooms: 40, ents: 120, items: 5, name: 40, author: 30, desc: 160, sign: 90, fname: 40, fsub: 70, intro: 300, win: 160, fintro: 240, rtext: 120 };
  const FW = 9, FH = 7;

  const uid = () => 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  function newRoom(x, y, t) { return { x, y, t: t || 'fight', g: EMPTY, e: [], m: '', b: '', n: 25, st: '', mim: 0, lk: 0, ta: 1, d: {}, ie: '', ic: '' }; }
  function newFloor(i, set) {
    const s = set || 'cellar';
    const st = newRoom(4, 4, 'start');
    st.g = cleanGrid((START_SETS[s] || START_SETS.cellar).join(''));
    return { name: '', sub: '', set: s, boss: 'auto', dark: -1, it: '', rooms: [st] };
  }
  function newMap() {
    return { v: 1, id: uid(), name: 'Untitled map', author: '', desc: '', char: '', diff: '', it: '', ot: '', rules: Object.assign({}, RULE_DEF), items: [], floors: [newFloor(0, 'cellar')], made: Date.now() };
  }
  function cleanGrid(g) {
    g = String(g || '');
    let out = '';
    for (let i = 0; i < GN; i++) { const ch = g[i] || '.'; out += GRID_OK.includes(ch) ? ch : '.'; }
    return out;
  }
  const clampN = (v, lo, hi, d) => { v = Number(v); return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  const strN = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
  const pickOpt = (v, opts, d) => (opts.some((o) => o[0] === v) ? v : d);

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
    if (!o.rooms.length) return newFloor(i, o.set);
    syncEdges(o);
    return o;
  }
  function cleanMap(M) {
    if (!M || typeof M !== 'object') throw new Error('not a map');
    const o = newMap();
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
    const fl = (Array.isArray(M.floors) ? M.floors : []).slice(0, LIMITS.floors).map(cleanFloor).filter(Boolean);
    o.floors = fl.length ? fl : [newFloor(0)];
    o.made = clampN(M.made, 0, 1e14, Date.now());
    return o;
  }
  const cloneMap = (M) => JSON.parse(JSON.stringify(M));

  /* ---- grid and room helpers */
  const roomAt = (F, x, y) => F.rooms.find((r) => r.x === x && r.y === y) || null;
  const entAt = (R, c, r) => R.e.find((e) => e.c === c && e.r === r) || null;
  const cellCh = (R, c, r) => R.g[r * GW + c];
  function setCh(R, c, r, ch) { const k = r * GW + c; if (R.g[k] === ch) return false; R.g = R.g.slice(0, k) + ch + R.g.slice(k + 1); return true; }
  const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  const OPPS = { n: 's', s: 'n', w: 'e', e: 'w' };
  // the floor cell in front of each door
  const MOUTH = { n: [5, 0], s: [5, 8], w: [0, 4], e: [10, 4] };
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

  /* ================================================================== 3. share codes */
  // BITMAP1.<base64url of the deflated JSON>.<4 character check>; BITMAP0 is the same without the compression
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function b64url(bytes) {
    let s = '', i = 0;
    for (; i + 2 < bytes.length; i += 3) { const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]; s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63]; }
    if (i < bytes.length) {
      const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8);
      s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < bytes.length ? B64[n >> 6 & 63] : '');
    }
    return s;
  }
  function unb64url(s) {
    const map = {}; for (let i = 0; i < 64; i++) map[B64[i]] = i;
    const out = new Uint8Array(Math.floor(s.length * 3 / 4));
    let o = 0, i = 0;
    for (; i + 3 < s.length; i += 4) { const n = (map[s[i]] << 18) | (map[s[i + 1]] << 12) | (map[s[i + 2]] << 6) | map[s[i + 3]]; out[o++] = n >> 16 & 255; out[o++] = n >> 8 & 255; out[o++] = n & 255; }
    const rest = s.length - i;
    if (rest >= 2) { const n = (map[s[i]] << 18) | (map[s[i + 1]] << 12) | (rest > 2 ? map[s[i + 2]] << 6 : 0); out[o++] = n >> 16 & 255; if (rest > 2) out[o++] = n >> 8 & 255; }
    return out.slice(0, o);
  }
  const checkOf = (s) => (hashStr(s) % 1679616).toString(36).padStart(4, '0');
  async function pipeBytes(bytes, St, fmt) {
    const stream = new Blob([bytes]).stream().pipeThrough(new St(fmt));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  // a smaller copy for the code: everything that is still the default is left out
  function compact(M) {
    const o = { v: 1, name: M.name };
    if (M.author) o.author = M.author;
    if (M.desc) o.desc = M.desc;
    if (M.it) o.it = M.it;
    if (M.ot) o.ot = M.ot;
    if (M.char) o.char = M.char;
    if (M.diff) o.diff = M.diff;
    const ru = {}; let any = false;
    for (const k in RULE_DEF) if (M.rules[k] !== RULE_DEF[k]) { ru[k] = M.rules[k]; any = true; }
    if (any) o.rules = ru;
    if (M.items.length) o.items = M.items.slice();
    o.floors = M.floors.map((F) => {
      const f = { set: F.set, rooms: [] };
      if (F.name) f.name = F.name; if (F.sub) f.sub = F.sub; if (F.boss !== 'auto') f.boss = F.boss; if (F.dark !== -1) f.dark = F.dark; if (F.it) f.it = F.it;
      for (const R of F.rooms) {
        const r = { x: R.x, y: R.y, t: R.t };
        if (R.g !== EMPTY) r.g = R.g;
        if (R.e.length) r.e = R.e.map((e) => { const q = { t: e.t, c: e.c, r: e.r }; for (const p of ENT_PARAMS[e.t]) if (e[p.k] !== p.def) q[p.k] = e[p.k]; return q; });
        if (R.m) r.m = R.m; if (R.b) r.b = R.b; if (R.n !== 25) r.n = R.n; if (R.st) r.st = R.st; if (R.mim) r.mim = 1; if (R.lk) r.lk = 1; if (!R.ta) r.ta = 0; if (R.ie) r.ie = R.ie; if (R.ic) r.ic = R.ic;
        const d = {}; let dd = false; for (const k in R.d) { d[k] = R.d[k]; dd = true; }
        if (dd) r.d = d;
        f.rooms.push(r);
      }
      return f;
    });
    return o;
  }
  async function encodeMap(M) {
    const json = JSON.stringify(compact(M));
    const bytes = new TextEncoder().encode(json);
    let head = 'BITMAP0.', body = bytes;
    if (typeof CompressionStream === 'function') {
      try { body = await pipeBytes(bytes, CompressionStream, 'deflate'); head = 'BITMAP1.'; } catch (e) { head = 'BITMAP0.'; body = bytes; }
    }
    const b = b64url(body);
    return head + b + '.' + checkOf(b);
  }
  const CODE_RE = /BITMAP([01])\.([A-Za-z0-9_-]+)\.([0-9a-z]{4})/;
  const looksLikeCode = (t) => /BITMAP[01]\./.test(String(t || ''));
  async function decodeMap(txt) {
    const m = CODE_RE.exec(String(txt || '').replace(/\s+/g, ''));
    if (!m) throw new Error('nocode');
    if (checkOf(m[2]) !== m[3]) throw new Error('damaged');
    let bytes = unb64url(m[2]);
    if (m[1] === '1') {
      if (typeof DecompressionStream !== 'function') throw new Error('oldbrowser');
      bytes = await pipeBytes(bytes, DecompressionStream, 'deflate');
    }
    if (bytes.length > 600000) throw new Error('toobig');
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    const M = cleanMap(obj);
    M.id = uid();
    return M;
  }
  const CODE_ERR = {
    nocode: 'That is not a map code. A map code starts with BITMAP.',
    damaged: 'That code is damaged. A part of it is missing or changed.',
    oldbrowser: 'This browser can not unpack map codes. Try a newer one.',
    toobig: 'That map is too big to load.',
  };
  const codeError = (e) => CODE_ERR[e && e.message] || 'That code could not be read.';

  /* ================================================================== 4. your maps, kept in this browser */
  const MAPS_KEY = 'bitten.maps.v1';
  const Store = {
    list: [], last: '', loaded: false,
    load() {
      if (this.loaded) return;
      this.loaded = true;
      try {
        const d = JSON.parse(localStorage.getItem(MAPS_KEY) || 'null');
        if (d && Array.isArray(d.maps)) {
          for (const it of d.maps) { try { const M = cleanMap(it.map); M.id = it.map && it.map.id ? M.id : uid(); this.list.push({ id: M.id, t: Number(it.t) || 0, map: M }); } catch (e) { /* skip a broken one */ } }
          this.last = typeof d.last === 'string' ? d.last : '';
        }
      } catch (e) { /* storage unavailable */ }
    },
    save() {
      try { localStorage.setItem(MAPS_KEY, JSON.stringify({ v: 1, last: this.last, maps: this.list.map((it) => ({ t: it.t, map: compactKeepId(it.map) })) })); return true; } catch (e) { return false; }
    },
    get(id) { this.load(); return this.list.find((it) => it.id === id) || null; },
    put(M) {
      this.load();
      let it = this.get(M.id);
      if (!it) { it = { id: M.id, t: 0, map: null }; this.list.unshift(it); }
      it.map = cloneMap(M); it.t = Date.now(); this.last = M.id;
      this.list.sort((a, b) => b.t - a.t);
      return this.save();
    },
    del(id) { this.load(); this.list = this.list.filter((it) => it.id !== id); if (this.last === id) this.last = ''; this.save(); },
  };
  function compactKeepId(M) { const o = compact(M); o.id = M.id; o.made = M.made; return o; }

  Object.assign(MK, { TILES, TILE, ENTS, ENT_PARAMS, RTYPES, RT, SNAKES, BOSSES, MINIS, SETS, setDef, setName, newMap, newFloor, newRoom, cleanMap, cleanRoom, cleanEnt, cloneMap,
    encodeMap, decodeMap, compact, Store, edgeOf, setEdge, doorsOf, roomAt, entAt, cellCh, setCh, typeTemplate, NEEDS, FIXED, MODS, RULES, RULE_DEF, DARK, DARK_V, DIFF_OPTS, LIMITS,
    CH_COLS, CH_NAMES, DIRS, DIR_NAMES, MOUTH, SIDES, OPPS, GRID_OK, SPAWN_CH, codeError, looksLikeCode, entDefaults, MIRX, MIRY, EMPTY, FW, FH });

  /* ================================================================== 5. the art for the new pieces
     Every piece is drawn around its own centre, in world units (one tile is 40). mode: 'game', 'edit' or 'icon'. */
  const ART = {};
  const lineC = (c, x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  function chevron(c, x, y, a, s) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(-s * 0.55, -s); c.lineTo(s * 0.45, 0); c.lineTo(-s * 0.55, s); c.stroke();
    c.restore();
  }
  ART.tp = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], on = mode !== 'game' || e.on !== false;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 2, 17, 15); c.fill();
    c.fillStyle = '#16110f'; circle(c, x, y, 16);
    c.strokeStyle = '#4a3e36'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 15, 0, TAU); c.stroke();
    c.save(); c.translate(x, y); c.rotate(t * 0.9);
    c.strokeStyle = rgba(col, on ? 0.95 : 0.35); c.lineWidth = 2.4; c.setLineDash([5, 3.6]);
    c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.stroke(); c.setLineDash([]);
    c.restore();
    c.save(); c.translate(x, y); c.rotate(-t * 1.6);
    c.fillStyle = rgba(col, on ? 0.9 : 0.3);
    for (let i = 0; i < 4; i++) { c.rotate(TAU / 4); c.fillRect(-1.2, -15.5, 2.4, 3.5); }
    c.restore();
    const g = c.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, rgba('#ffffff', on ? 0.95 : 0.3)); g.addColorStop(0.35, rgba(col, on ? 0.85 : 0.25)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; circle(c, x, y, 9);
    if (mode === 'edit') label(c, x, y + 1, CH_NAMES[e.ch || 0][0], '#fff4ec');
  };
  ART.jp = (c, x, y, e, t, mode) => {
    const k = e.k || 0, a = Math.atan2(DIRS[e.d || 0][1], DIRS[e.d || 0][0]), sc = 1 + k * 0.12;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = 'rgba(0,0,0,0.35)'; rrect(c, -15, -13, 30, 30, 4); c.fill();
    c.fillStyle = '#5a4c40'; rrect(c, -15, -15, 30, 30, 4); c.fill();
    c.fillStyle = '#2a221c'; rrect(c, -12.5, -12.5, 25, 25, 3); c.fill();
    c.strokeStyle = '#8a7a66'; c.lineWidth = 1;
    for (const [px, py] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) { c.fillStyle = '#a89a86'; circle(c, px * 0.92, py * 0.92, 1.3); }
    c.strokeStyle = k > 0.2 ? '#ffffff' : '#ffd23a'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
    const off = mode === 'game' ? ((t * 1.6) % 1) * 5 : 0;
    chevron(c, Math.cos(a) * (-3 + off), Math.sin(a) * (-3 + off), a, 5);
    c.strokeStyle = rgba(k > 0.2 ? '#ffffff' : '#ffd23a', 0.55);
    chevron(c, Math.cos(a) * (5 + off), Math.sin(a) * (5 + off), a, 5);
    c.restore();
    if (mode === 'edit' && e.f && e.f !== 2) label(c, x + 11, y - 11, e.f === 1 ? 'S' : 'F', '#ffd23a', 7);
  };
  ART.sp = (c, x, y, e, t, mode) => {
    const d = DIRS[e.d || 0], a = Math.atan2(d[1], d[0]);
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = '#191615'; c.fillRect(-19, -17, 38, 34);
    c.fillStyle = '#ff9a2a'; c.fillRect(-19, -17, 38, 2.5); c.fillRect(-19, 14.5, 38, 2.5);
    c.beginPath(); c.rect(-19, -14, 38, 28); c.clip();
    c.strokeStyle = '#ff9a2a'; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round';
    const off = mode === 'game' ? ((t * 2.2) % 1) * 13 : 4;
    for (let i = -2; i <= 2; i++) { c.globalAlpha = 0.85; chevron(c, i * 13 + off, 0, 0, 7); }
    c.globalAlpha = 1;
    c.restore();
  };
  const BUMP = [['#ff4a5a', '#8a0e1c'], ['#ffd23a', '#9a6a08'], ['#3aa0ff', '#0e3a8a']];
  ART.bm = (c, x, y, e, t, mode) => {
    const k = e.k || 0, [hi, lo] = BUMP[e.st || 0], R = 13 * (1 + k * 0.18);
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x, y + 4, 16, 13); c.fill();
    c.fillStyle = '#2a2424'; circle(c, x, y, 16);
    c.strokeStyle = '#6a5e58'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, 15.5, 0, TAU); c.stroke();
    const g = c.createRadialGradient(x - R * 0.35, y - R * 0.4, 1, x, y, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, hi); g.addColorStop(1, lo);
    c.fillStyle = g; circle(c, x, y, R);
    c.strokeStyle = k > 0.1 ? '#ffffff' : rgba('#ffffff', 0.7); c.lineWidth = 1.6;
    c.beginPath(); for (let i = 0; i < 5; i++) { const aa = -Math.PI / 2 + i * TAU / 5 * 2; const px = x + Math.cos(aa) * R * 0.45, py = y + Math.sin(aa) * R * 0.45; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); c.stroke();
    if (k > 0.05) { c.strokeStyle = rgba('#ffffff', k); c.lineWidth = 2; c.beginPath(); c.arc(x, y, R + 4 + (1 - k) * 8, 0, TAU); c.stroke(); }
  };
  ART.lv = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], st = e.on ? 1 : 0, sw = e.swing || 0;
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x, y + 10, 14, 6); c.fill();
    c.fillStyle = '#3a322c'; rrect(c, x - 12, y + 1, 24, 13, 2); c.fill();
    c.fillStyle = '#5a4e44'; rrect(c, x - 12, y + 1, 24, 4, 2); c.fill();
    const a = (st ? 0.7 : -0.7) + sw;
    c.strokeStyle = '#1a1512'; c.lineWidth = 4.4; c.lineCap = 'round';
    lineC(c, x, y + 4, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17);
    c.strokeStyle = '#9a8e84'; c.lineWidth = 2.6;
    lineC(c, x, y + 4, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17);
    c.fillStyle = col; circle(c, x + Math.sin(a) * 17, y + 4 - Math.cos(a) * 17, 4.2);
    c.fillStyle = 'rgba(255,255,255,0.5)'; circle(c, x + Math.sin(a) * 17 - 1.2, y + 4 - Math.cos(a) * 17 - 1.4, 1.4);
    c.fillStyle = '#1a1512'; circle(c, x, y + 4, 2.6);
    c.fillStyle = rgba(col, st ? 1 : 0.35); circle(c, x + (st ? 7 : -7), y + 10, 2);
    if (mode === 'edit') label(c, x - 9, y - 11, CH_NAMES[e.ch || 0][0], col, 8);
  };
  ART.gt = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0];
    const open = mode === 'game' ? e.lift || 0 : e.o ? 1 : 0;
    if (open < 1) {
      const h = 1 - open;
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 19, y + 10, 38, 8);
      c.fillStyle = '#1a1716'; c.fillRect(x - 20, y - 17 * h - 2, 5, 34 * h + 6); c.fillRect(x + 15, y - 17 * h - 2, 5, 34 * h + 6);
      for (let i = 0; i < 4; i++) {
        const bx = x - 11 + i * 7.3;
        c.fillStyle = '#2a2624'; c.fillRect(bx - 1.9, y - 18 * h, 3.8, 35 * h);
        c.fillStyle = '#8a8480'; c.fillRect(bx - 1.1, y - 18 * h, 1.4, 35 * h);
        c.fillStyle = '#5a5450'; c.beginPath(); c.moveTo(bx - 2.4, y - 18 * h); c.lineTo(bx, y - 23 * h); c.lineTo(bx + 2.4, y - 18 * h); c.fill();
      }
      c.fillStyle = col; c.fillRect(x - 16, y - 3, 32, 4);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 16, y - 3, 32, 1.2);
    }
    if (open > 0) {
      c.globalAlpha = open;
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x - 17, y - 3, 34, 6);
      c.strokeStyle = rgba(col, 0.75); c.lineWidth = 1.4; c.strokeRect(x - 17, y - 3, 34, 6);
      c.fillStyle = '#0c0a09'; for (let i = 0; i < 4; i++) c.fillRect(x - 12 + i * 7.3, y - 1.6, 2.6, 3.2);
      c.globalAlpha = 1;
    }
    if (mode === 'edit') label(c, x + 12, y - 13, CH_NAMES[e.ch || 0][0], col, 8);
  };
  ART.sg = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x + 2, y + 14, 9, 3.5); c.fill();
    c.fillStyle = '#3a2614'; c.fillRect(x - 1.8, y - 4, 3.6, 18);
    c.fillStyle = '#7a5530'; rrect(c, x - 14, y - 16, 28, 15, 1.5); c.fill();
    c.strokeStyle = '#2a1a0c'; c.lineWidth = 1.2; rrect(c, x - 14, y - 16, 28, 15, 1.5); c.stroke();
    c.strokeStyle = 'rgba(30,18,8,0.7)'; c.lineWidth = 1.1;
    lineC(c, x - 10, y - 12, x + 9, y - 12); lineC(c, x - 10, y - 8.5, x + 6, y - 8.5); lineC(c, x - 10, y - 5, x + 8, y - 5);
  };
  ART.ex = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 15, y - 13, 32, 32);
    c.fillStyle = '#4a4440'; c.fillRect(x - 16, y - 16, 32, 32);
    c.fillStyle = '#2e2a28'; c.fillRect(x - 13, y - 13, 26, 26);
    c.strokeStyle = '#6a625c'; c.lineWidth = 1; for (let i = -1; i <= 1; i++) lineC(c, x - 13, y + i * 7, x + 13, y + i * 7);
    c.fillStyle = '#8a827a'; for (const [px, py] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) circle(c, x + px, y + py, 1.3);
    c.strokeStyle = mode === 'game' ? 'rgba(255,200,120,0.55)' : '#ffc870'; c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x - 6, y - 2); c.lineTo(x, y + 5); c.lineTo(x + 6, y - 2); c.stroke(); lineC(c, x, y - 8, x, y + 4);
  };
  ART.fbPivot = (c, x, y) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 10, y - 8, 22, 22);
    c.fillStyle = '#3a3634'; c.fillRect(x - 11, y - 11, 22, 22);
    c.fillStyle = '#5a5450'; c.fillRect(x - 11, y - 11, 22, 4);
    c.fillStyle = '#1a1716'; circle(c, x, y, 5);
    c.fillStyle = '#ff8a3a'; circle(c, x, y, 2.4);
  };
  const fbBall = (c, x, y, r, t, i) => {
    const f = 1 + Math.sin(t * 22 + i * 1.7) * 0.12;
    const g = c.createRadialGradient(x, y, 0, x, y, r * 1.5 * f);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(0.35, '#ffd24a'); g.addColorStop(0.7, '#ff6a1a'); g.addColorStop(1, 'rgba(255,60,10,0)');
    c.fillStyle = g; circle(c, x, y, r * 1.5 * f);
  };
  const fbAngle = (e) => (e.a || 0) / 2 * (Math.PI / 2);
  const FB_SPD = [0, 1.05, 1.7, 2.5];
  ART.fb = (c, x, y, e, t, mode) => {
    ART.fbPivot(c, x, y);
    const n = e.n || 4;
    const a = mode === 'game' ? e.ang : fbAngle(e) + (mode === 'icon' ? t * (e.w || 1) * 1.3 : 0);
    if (mode === 'edit') {
      c.strokeStyle = 'rgba(255,140,60,0.4)'; c.lineWidth = 1; c.setLineDash([4, 4]);
      c.beginPath(); c.arc(x, y, 12 + (n - 1) * 12, 0, TAU); c.stroke(); c.setLineDash([]);
      const aa = a + (e.w || 1) * 0.5;
      c.strokeStyle = 'rgba(255,170,90,0.7)'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(x, y, 12 + (n - 1) * 12 + 5, a, aa, (e.w || 1) < 0); c.stroke();
    }
    if (mode !== 'game') for (let i = 0; i < n; i++) fbBall(c, x + Math.cos(a) * (12 + i * 12), y + Math.sin(a) * (12 + i * 12), mode === 'icon' ? 5 : 5.5, t, i);
  };
  ART.swGroove = (c, e) => {
    if (e.lo == null) return;
    c.fillStyle = 'rgba(0,0,0,0.55)';
    if (e.ax === 'v') c.fillRect(e.x - 3, e.lo - 6, 6, e.hi - e.lo + 12); else c.fillRect(e.lo - 6, e.y - 3, e.hi - e.lo + 12, 6);
    c.fillStyle = 'rgba(255,255,255,0.06)';
    if (e.ax === 'v') c.fillRect(e.x - 3, e.lo - 6, 1.5, e.hi - e.lo + 12); else c.fillRect(e.lo - 6, e.y - 3, e.hi - e.lo + 12, 1.5);
  };
  ART.swBlade = (c, x, y, spin) => {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x + 1, y + 3, 13, 11); c.fill();
    c.save(); c.translate(x, y); c.rotate(spin);
    c.fillStyle = '#8a9098';
    c.beginPath();
    for (let i = 0; i < 12; i++) { const a0 = (i / 12) * TAU, a1 = a0 + TAU / 24; c.lineTo(Math.cos(a0) * 10, Math.sin(a0) * 10); c.lineTo(Math.cos(a1) * 14, Math.sin(a1) * 14); }
    c.closePath(); c.fill();
    const g = c.createRadialGradient(-3, -3, 1, 0, 0, 11); g.addColorStop(0, '#f2f4f8'); g.addColorStop(1, '#6a7078');
    c.fillStyle = g; circle(c, 0, 0, 10.5);
    c.strokeStyle = 'rgba(40,44,50,0.6)'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.rotate(TAU / 3); lineC(c, 3, 0, 9, 0); }
    c.fillStyle = '#2a2c30'; circle(c, 0, 0, 3);
    c.restore();
  };
  ART.sw = (c, x, y, e, t, mode) => {
    if (mode === 'edit' && e.lo != null) ART.swGroove(c, e);
    else if (mode !== 'game') { c.fillStyle = 'rgba(0,0,0,0.5)'; if (e.ax === 'v') c.fillRect(x - 3, y - 19, 6, 38); else c.fillRect(x - 19, y - 3, 38, 6); }
    ART.swBlade(c, x, y, mode === 'game' ? e.spin : t * 6);
  };
  ART.tt = (c, x, y, e, t, mode) => {
    const aim = (e.d === 8);
    const a = aim ? (mode === 'game' && e.aimA != null ? e.aimA : Math.PI / 2) : Math.atan2(DIRS[e.d || 0][1], DIRS[e.d || 0][0]);
    const ch = mode === 'game' ? clamp(e.charge || 0, 0, 1) : 0.4;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 5, 15, 12); c.fill();
    c.fillStyle = '#4a443c'; rrect(c, x - 14, y - 14, 28, 28, 5); c.fill();
    c.fillStyle = '#625a50'; rrect(c, x - 14, y - 14, 28, 9, 5); c.fill();
    c.strokeStyle = '#2a2620'; c.lineWidth = 1.2; rrect(c, x - 14, y - 14, 28, 28, 5); c.stroke();
    c.save(); c.translate(x, y); c.rotate(a);
    // a carved snake head looking the way it spits
    c.fillStyle = '#7a7266'; c.beginPath(); c.moveTo(-8, -8); c.quadraticCurveTo(12, -9, 14, 0); c.quadraticCurveTo(12, 9, -8, 8); c.closePath(); c.fill();
    c.strokeStyle = '#2a2620'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#1a1612'; c.beginPath(); c.moveTo(6, -2.5); c.lineTo(14, 0); c.lineTo(6, 2.5); c.closePath(); c.fill();
    c.fillStyle = mixHex('#2a3a1a', '#d8ff5a', ch); circle(c, 1, -4.5, 2); circle(c, 1, 4.5, 2);
    c.restore();
    if (mode === 'edit') {
      c.strokeStyle = 'rgba(200,230,90,0.55)'; c.lineWidth = 1.4; c.setLineDash([3, 3]);
      if (aim) { c.beginPath(); c.arc(x, y, 18, 0, TAU); c.stroke(); }
      else lineC(c, x + Math.cos(a) * 16, y + Math.sin(a) * 16, x + Math.cos(a) * 34, y + Math.sin(a) * 34);
      c.setLineDash([]);
      if (!e.b) label(c, x + 10, y - 11, '∞', '#d8d0c4', 9);
    }
  };
  ART.bx = (c, x, y, e, t, mode) => {
    const fl = mode === 'game' && e.fuse > 0 && Math.sin(t * 40) > 0;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 13, 13, 5); c.fill();
    c.fillStyle = fl ? '#ffe0c0' : '#7a4a22'; rrect(c, x - 12, y - 10, 24, 24, 6); c.fill();
    c.fillStyle = fl ? '#ffffff' : '#9a6230'; for (let i = -1; i <= 1; i++) c.fillRect(x + i * 7 - 1.5, y - 9, 3, 22);
    c.fillStyle = '#2e2e34'; c.fillRect(x - 12.5, y - 5, 25, 3); c.fillRect(x - 12.5, y + 7, 25, 3);
    c.fillStyle = fl ? '#fff4d8' : '#a8723a'; ell(c, x, y - 10, 12, 4.5); c.fill();
    c.strokeStyle = '#3a2210'; c.lineWidth = 1; ell(c, x, y - 10, 12, 4.5); c.stroke();
    c.fillStyle = '#c3243a'; circle(c, x, y + 2, 4.2);
    c.fillStyle = '#fff4ec'; c.font = `900 7px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', x, y + 2.4);
    c.strokeStyle = '#2a2020'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 3, y - 11); c.quadraticCurveTo(x + 7, y - 17, x + 4, y - 20); c.stroke();
    if (mode === 'game' && e.fuse > 0) { c.globalCompositeOperation = 'lighter'; glowDot(c, x + 4, y - 20, 8, '#ffd24a', 0.9); c.globalCompositeOperation = 'source-over'; }
  };
  ART.ns = (c, x, y, e, t, mode) => {
    const hp = mode === 'game' && e.ob ? clamp(e.ob.hp / e.ob.max, 0, 1) : 1, pulse = 1 + Math.sin(t * 3) * 0.04;
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, x + 1, y + 5, 18, 14); c.fill();
    const g = c.createRadialGradient(x - 4, y - 5, 2, x, y, 18 * pulse);
    g.addColorStop(0, '#6a4e34'); g.addColorStop(1, '#2a1c10');
    c.fillStyle = g; ell(c, x, y, 18 * pulse, 15 * pulse); c.fill();
    c.fillStyle = 'rgba(255,220,180,0.08)'; for (let i = 0; i < 5; i++) circle(c, x - 10 + i * 5, y - 8 + (i % 2) * 4, 1.6);
    c.fillStyle = '#0a0605'; ell(c, x, y + 1, 7.5, 6); c.fill();
    const kk = KINDS[e.k || 'grub'] || KINDS.grub;
    c.strokeStyle = kk.body || '#d9c8b3'; c.lineWidth = 2.6; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + Math.sin(t * 4 + i) * 0.4, l = 6 + Math.sin(t * 5 + i * 2) * 2;
      c.beginPath(); c.moveTo(x + Math.cos(a) * 3, y + 1 + Math.sin(a) * 2.5);
      c.quadraticCurveTo(x + Math.cos(a + 0.6) * (l + 2), y + Math.sin(a + 0.6) * (l + 2), x + Math.cos(a) * (l + 4), y + Math.sin(a) * (l + 3)); c.stroke();
    }
    if (hp < 1) {
      c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2;
      const n = Math.ceil((1 - hp) * 6);
      for (let i = 0; i < n; i++) { const a = i * 1.9; lineC(c, x + Math.cos(a) * 9, y + Math.sin(a) * 8, x + Math.cos(a + 0.3) * 16, y + Math.sin(a + 0.3) * 13); }
    }
    if (mode === 'edit') label(c, x + 12, y - 12, String(e.n || 3), '#ffd27a', 8);
  };
  ART.ac = (c, x, y, e, t, mode) => {
    c.save();
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU, r = 17 + Math.sin(a * 3 + (e.c || 0)) * 1.6 + Math.sin(a * 5 + (e.r || 0)) * 1.1; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.92; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.closePath();
    const g = c.createRadialGradient(x, y, 2, x, y, 18);
    g.addColorStop(0, '#b8ff4a'); g.addColorStop(0.6, '#4ac01a'); g.addColorStop(1, '#1a5a0a');
    c.fillStyle = g; c.fill();
    c.strokeStyle = '#123a06'; c.lineWidth = 1.6; c.stroke();
    c.clip();
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.8 + i * 0.37 + (e.c || 0) * 0.13) % 1;
      const bx = x + Math.sin(i * 2.4 + (e.r || 0)) * 10, by = y + Math.cos(i * 1.7) * 9;
      c.strokeStyle = `rgba(230,255,180,${0.7 * (1 - ph)})`; c.lineWidth = 1;
      c.beginPath(); c.arc(bx, by, 1 + ph * 3.2, 0, TAU); c.stroke();
    }
    c.restore();
  };
  ART.wk = (c, x, y, e, t, mode) => {
    const s = mode === 'game' && e.state === 1 ? (Math.random() - 0.5) * 2.2 : 0;
    c.save(); c.translate(x + s, y);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(-18, -18, 36, 36);
    c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 1.3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-16, -6); c.lineTo(-6, -2); c.lineTo(-2, -12); c.lineTo(6, -6); c.lineTo(16, -10);
    c.moveTo(-6, -2); c.lineTo(-4, 8); c.lineTo(-14, 14); c.moveTo(-4, 8); c.lineTo(8, 6); c.lineTo(14, 15); c.moveTo(8, 6); c.lineTo(6, -6); c.stroke();
    c.strokeStyle = 'rgba(255,240,220,0.1)'; c.lineWidth = 1; c.translate(0.8, 0.8);
    c.beginPath(); c.moveTo(-16, -6); c.lineTo(-6, -2); c.lineTo(-2, -12); c.lineTo(6, -6); c.lineTo(16, -10); c.stroke();
    c.restore();
  };
  ART.sk = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 17, y - 17, 34, 34);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const px = x - 10 + i * 10, py = y - 10 + j * 10;
      c.fillStyle = '#1a1716'; circle(c, px, py, 3.4);
      c.fillStyle = '#b8b2aa'; c.beginPath(); c.moveTo(px - 2.6, py + 1.6); c.lineTo(px, py - 4); c.lineTo(px + 2.6, py + 1.6); c.closePath(); c.fill();
    }
    label(c, x + 12, y - 12, e.g ? 'B' : 'A', e.g ? '#7cc4ff' : '#ff9a7a', 8);
  };
  ART.pd = (c, x, y, e, t, mode) => {
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 14, 14, 5); c.fill();
    c.fillStyle = '#6a625a'; c.fillRect(x - 10, y + 1, 20, 13);
    c.fillStyle = '#4a443e'; c.fillRect(x - 10, y + 10, 20, 4);
    c.fillStyle = '#8a8278'; ell(c, x, y + 1, 13, 5.5); c.fill();
    c.strokeStyle = '#3a342e'; c.lineWidth = 1; ell(c, x, y + 1, 13, 5.5); c.stroke();
    if (mode !== 'game') {
      const id = e.id || 'rand';
      if (id === 'rand' || id === 'rare') {
        c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 15px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y - 7);
      } else safe(() => { c.save(); c.translate(x, y - 8); drawItemIcon(c, id, 17, t); c.restore(); });
      if (e.c) label(c, x, y + 16, String(e.c), '#ffd84a', 7);
    }
  };
  ART.ky = (c, x, y, e, t) => {
    c.save(); c.translate(x, y + Math.sin(t * 3) * 1.2); c.rotate(-0.6);
    c.strokeStyle = '#6a4a08'; c.lineWidth = 4.6; c.lineCap = 'round';
    c.beginPath(); c.arc(-6, 0, 4.6, 0, TAU); c.stroke(); lineC(c, -1.5, 0, 10, 0); lineC(c, 7, 0, 7, 4); lineC(c, 10, 0, 10, 4);
    c.strokeStyle = '#ffd27a'; c.lineWidth = 2.4;
    c.beginPath(); c.arc(-6, 0, 4.6, 0, TAU); c.stroke(); lineC(c, -1.5, 0, 10, 0); lineC(c, 7, 0, 7, 4); lineC(c, 10, 0, 10, 4);
    c.restore();
  };
  ART.cn = (c, x, y, e) => {
    const n = Math.min(4, Math.ceil((e.n || 3) / 2.5));
    for (let i = 0; i < n; i++) {
      const px = x + [-5, 5, 0, -2][i], py = y + [3, 4, -3, -9][i];
      c.fillStyle = '#7a5a08'; ell(c, px, py + 1.4, 6, 3.4); c.fill();
      c.fillStyle = '#ffd84a'; ell(c, px, py, 6, 3.4); c.fill();
      c.fillStyle = '#fff2a8'; ell(c, px - 1.4, py - 0.8, 2.4, 1.1); c.fill();
    }
  };
  function label(c, x, y, s, col, size = 9) {
    c.font = `800 ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(10,6,5,0.9)'; c.strokeText(s, x, y);
    c.fillStyle = col; c.fillText(s, x, y);
  }

  // snake pictures for the editor and the palette, made once per kind
  const SPR = {};
  function snakeSprite(kind, champ) {
    const key = kind + (champ ? '*' : '');
    if (SPR[key]) return SPR[key];
    const S = 96, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const c = cv.getContext('2d');
    safe(() => {
      const keepL = G.levelDef; if (!G.levelDef) G.levelDef = LEVELS[0];
      const sn = new Snake(kind, 0, 0, { emerge: false, ang: 0, preview: true, champ: !!champ });
      G.levelDef = keepL;
      sn.state = 'active'; sn.eyeOpen = 1;
      const total = sn.len * sn.spacing, K = KINDS[kind];
      if (K.blocky) {
        const path = [[0, 0], [2, 0], [2, 1], [0, 1], [0, 2], [3, 2]];
        for (let j = 1; j < path.length; j++) { const [ax, ay] = path[j - 1], [bx, by] = path[j]; for (let i = 1; i <= 10; i++) { const u = i / 10; sn.moveTo((ax + (bx - ax) * u) * 20, (ay + (by - ay) * u) * 20); } }
      } else {
        // a loose S coil so long snakes still fit a square
        const N = 80, R0 = Math.max(10, total / 9);
        for (let i = 0; i <= N; i++) { const u = i / N, a = u * Math.PI * 2.6; sn.moveTo(Math.cos(a) * R0 * (0.5 + u * 0.7) + u * R0 * 0.8, Math.sin(a) * R0 * (0.5 + u * 0.7)); }
      }
      sn.ang = sn.drawAng = Math.atan2(sn.y - sn.trail[2].y, sn.x - sn.trail[2].x);
      if (kind === 'hood') sn.hood = 0.75;
      sn.computeBody();
      let x0 = sn.x - sn.headR * 1.5, x1 = sn.x + sn.headR * 1.5, y0 = sn.y - sn.headR * 1.5, y1 = sn.y + sn.headR * 1.5;
      for (const p of sn.pts) { x0 = Math.min(x0, p.x - p.r - 2); x1 = Math.max(x1, p.x + p.r + 2); y0 = Math.min(y0, p.y - p.r - 2); y1 = Math.max(y1, p.y + p.r + 2); }
      const sc = Math.min((S - 8) / (x1 - x0), (S - 8) / (y1 - y0));
      c.translate(S / 2, S / 2); c.scale(sc, sc); c.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.fillStyle = 'rgba(0,0,0,0.35)'; drawSnakeShadow(c, sn);
      drawSnake(c, sn, 1.3);
    });
    SPR[key] = cv;
    return cv;
  }
  function bossSprite(kind) {
    const key = 'boss:' + kind;
    if (SPR[key]) return SPR[key];
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 92; cv.style.width = '160px'; cv.style.height = '92px';
    cv.dataset.snake = bossArt(kind);
    const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:-9999px;top:0;width:160px;height:92px'; box.appendChild(cv); document.body.appendChild(box);
    safe(() => paintBestiary(box));
    box.remove();
    SPR[key] = cv;
    return cv;
  }

  /* ================================================================== 6. playing a map: the run */
  const RTM = MK.RTM = { cur: null, back: 'hub', fromFloor: 0, startRoom: null, tpTo: null, test: false, label: '' };
  MODES.map = { name: 'Map', desc: 'A map from the Map Maker.', floors: 1 };
  const inMap = () => G.mode === 'map' && !!RTM.cur && !!G.run;
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
  const rowsOf = (g) => { const out = []; for (let r = 0; r < GH; r++) out.push(g.slice(r * GW, r * GW + GW)); return out; };
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
    for (const r of rooms) safe(() => buildRoom(r, r.mkR, def, map, r === start));
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
    room.mkSn = sn.map((e) => ({ k: e.k, c: e.c, r: e.r, g: e.g, tr: e.tr, say: e.say || '', die: e.die || '' }));
    room.mkR = R;
    room.spawns = [];
    if (combat && !['fight', 'boss', 'arena', 'miniboss', 'challenge', 'survival'].includes(type)) { room.mkGuard = true; room.cleared = false; }
    room.mkAlways = R.ta !== 0;
    // the new pieces
    room.mkE = [];
    for (const e of R.e) if (e.t !== 'sn') safe(() => setupEnt(room, e, def, map));
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
      safe(() => mapButtons(true));
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
        if (['boss', 'chaosboss', 'miniboss'].includes(room.type) && room.mkSn && room.mkSn.length && !room.mkSnDone && room.locked) { room.mkSnDone = true; spawnMapSnakes(room); }
        if (room.mkExit && !room.locked && !room.exit && !mustFight(room)) openExit(room);
      });
      return r;
    });
    const sc0 = Game.startCombat;
    Game.startCombat = function (room) {
      if (!inMap() || !room.mkSn) return sc0.apply(this, arguments);
      const keep = room.spawns; room.spawns = [];
      try { sc0.apply(this, arguments); } finally { room.spawns = keep; }
      if (!room.mkSnDone) { room.mkSnDone = true; spawnMapSnakes(room); }
    };
    const sw0 = Game.spawnWave;
    Game.spawnWave = function (room) {
      const r = sw0.apply(this, arguments);
      if (inMap() && room.mkSn && room.mkSn.length && !room.mkSnDone) { room.mkSnDone = true; safe(() => spawnMapSnakes(room)); }
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
      mapButtons(false);
      if (wasMap) {
        G.mode = 'arcade';
        RTM.tpTo = null; RTM.startRoom = null;
        safe(() => Maker.reopen());
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

  /* ================================================================== 7. the new pieces at work */
  const TT_RATE = [0, 3.2, 2.2, 1.4], NEST_RATE = [0, 6, 4, 2.6], JP_V = [0, 430, 600, 780];
  const inCell = (P, k, pad) => Math.abs(P.x - k.x) < T / 2 - pad && Math.abs(P.y - k.y) < T / 2 - pad;

  function teleport(room, k) {
    const pads = G.map.mkPads.filter((p) => (p.e.ch || 0) === (k.ch || 0));
    const P = G.player, col = CH_COLS[k.ch || 0];
    if (pads.length < 2) {
      if (!(k.fizz > G.t)) { k.fizz = G.t + 1.6; floatText(k.x, k.y - 22, 'NO PARTNER', '#b8a8a0'); Sfx.zap(); }
      return;
    }
    const i = pads.findIndex((p) => p.e === k), to = pads[(i + 1) % pads.length];
    Sfx.warp();
    burst(P.x, P.y, 14, col, { min: 30, max: 110, lmin: 0.3, lmax: 0.6, glow: true });
    P.mkTpLock = true;
    if (to.room === room) {
      P.x = to.e.x; P.y = to.e.y; P.kbx = 0; P.kby = 0;
      burst(P.x, P.y, 14, col, { min: 30, max: 110, lmin: 0.3, lmax: 0.6, glow: true });
      flashLight(P.x, P.y, 80, 0.8, 0.5);
    } else {
      RTM.tpTo = to;
      G.trans = { kind: 'door', phase: 'out', t: 0, to: to.room, dir: null };
    }
  }
  function sawRange(room, k) {
    let lo = k.ax === 'v' ? k.r : k.c, hi = lo;
    if (k.ax === 'v') { while (lo > 0 && !room.solid(k.c, lo - 1)) lo--; while (hi < GH - 1 && !room.solid(k.c, hi + 1)) hi++; }
    else { while (lo > 0 && !room.solid(lo - 1, k.r)) lo--; while (hi < GW - 1 && !room.solid(hi + 1, k.r)) hi++; }
    k.lo = (lo + 0.5) * T; k.hi = (hi + 0.5) * T; k.ver = room.ver;
  }
  function hurtSnakesAt(room, x, y, r, dmg, tag, cd, burn) {
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed || (sn[tag] || 0) > G.t) continue;
      if (!sn.hitTest(x, y, r)) continue;
      sn.hurt(sn.isBoss ? dmg * 0.5 : dmg, x, y);
      if (burn && !sn.K.fireproof) sn.burn = Math.max(sn.burn || 0, 1);
      sn[tag] = G.t + cd;
    }
  }
  function reflect(o, k, R) {
    const dx = o.x - k.x, dy = o.y - k.y, d = Math.hypot(dx, dy);
    if (d >= R || d < 0.01) return false;
    const nx = dx / d, ny = dy / d, vn = o.vx * nx + o.vy * ny;
    if (vn >= 0) return false;
    o.vx -= 2 * vn * nx; o.vy -= 2 * vn * ny;
    const sp = Math.hypot(o.vx, o.vy), want = Math.min(900, sp * 1.12);
    o.vx *= want / (sp || 1); o.vy *= want / (sp || 1);
    o.x = k.x + nx * (R + 1); o.y = k.y + ny * (R + 1);
    return true;
  }
  function killOb(room, k, col, kind) {
    const o = k.ob; if (!o || o.broken) return;
    room.removeObstacle(o); o.broken = true; k.dead = true;
    burst(o.x, o.y, 14, col, { kind: kind || 'shard', min: 40, max: 150, rmin: 1.5, rmax: 3.4, lmin: 0.35, lmax: 0.8, drag: 4 });
  }
  function blowKeg(room, k) {
    if (k.dead) return;
    killOb(room, k, '#7a4a22');
    explode(room, k.x, k.y, 66, { dmg: 1, snakeDmg: 7 });
  }

  function mkUpdate(dt, room, frozen) {
    const P = G.player, alive = P.dying <= 0 && P.escaping <= 0 && !G.trans;
    if (P.mkTpLock && !room.mkE.some((k) => k.t === 'tp' && dist(P.x, P.y, k.x, k.y) < 24)) P.mkTpLock = false;
    for (const k of room.mkE) {
      if (k.dead) continue;
      switch (k.t) {
        case 'tp':
          k.on = !room.locked;
          if (alive && k.on && !P.mkTpLock && dist(P.x, P.y, k.x, k.y) < 12) teleport(room, k);
          break;
        case 'jp': {
          k.cd = Math.max(0, k.cd - dt); k.k = Math.max(0, k.k - dt * 4);
          const d = DIRS[k.d || 0], v = JP_V[k.f || 2];
          if (alive && k.cd <= 0 && dist(P.x, P.y, k.x, k.y) < 14) {
            P.kbx = d[0] * v; P.kby = d[1] * v; P.vx *= 0.3; P.vy *= 0.3; P.squash = 0.7;
            k.cd = 0.5; k.k = 1;
            Sfx.boost(); Sfx.tone(320, 0.16, { to: 760, type: 'triangle', vol: 0.06 });
            burst(k.x, k.y, 10, '#ffd23a', { min: 30, max: 110, lmin: 0.25, lmax: 0.5 });
          }
          for (const ct of room.carts) if (dist(ct.x, ct.y, k.x, k.y) < 15 && !(ct.mkJp > G.t)) { ct.vx = d[0] * v * 0.8; ct.vy = d[1] * v * 0.8; ct.mkJp = G.t + 0.5; k.k = 1; }
          break;
        }
        case 'sp': {
          const d = DIRS[k.d || 0];
          if (alive && inCell(P, k, 2)) { P.kbx = approach(P.kbx, d[0] * 330, 2600 * dt); P.kby = approach(P.kby, d[1] * 330, 2600 * dt); }
          for (const ct of room.carts) if (inCell(ct, k, 0)) { ct.vx = approach(ct.vx, d[0] * 300, 1600 * dt); ct.vy = approach(ct.vy, d[1] * 300, 1600 * dt); }
          for (const p of room.pickups) if ((p.kind === 'coin' || p.kind === 'heart') && p.vx != null && inCell(p, k, 0)) { p.x += d[0] * 120 * dt; p.y += d[1] * 120 * dt; }
          break;
        }
        case 'bm': {
          k.cd -= dt; k.k = Math.max(0, k.k - dt * 5);
          if (alive && k.cd <= 0 && dist(P.x, P.y, k.x, k.y) < P.r + 16) {
            const a = Math.atan2(P.y - k.y, P.x - k.x);
            P.kbx = Math.cos(a) * 470; P.kby = Math.sin(a) * 470;
            k.cd = 0.18; k.k = 1;
            Sfx.tone(880, 0.12, { type: 'square', vol: 0.05, lp: 2600 }); Sfx.tone(1320, 0.1, { type: 'triangle', vol: 0.04, delay: 0.04 });
            flashLight(k.x, k.y, 70, 0.7, 0.3);
          }
          let bounced = false;
          for (const s of G.seeds) if (reflect(s, k, 13 + 4 * (s.size || 1))) { s.rot = Math.atan2(s.vy, s.vx); s.t = Math.min(s.t, s.life * 0.5); s.hits = null; bounced = true; }
          for (const v of G.venom) if (reflect(v, k, 19)) bounced = true;
          if (bounced) { k.k = Math.max(k.k, 0.6); if (!(k.snd > G.t)) { k.snd = G.t + 0.08; Sfx.tone(1100, 0.06, { type: 'square', vol: 0.03, lp: 3000 }); } }
          break;
        }
        case 'lv': {
          k.cd -= dt; k.swing = approach(k.swing, 0, dt * 4);
          const d = dist(P.x, P.y, k.x, k.y);
          if (alive && d < P.r + 18 && !k.touch) { k.touch = true; pullLever(room, k); }
          else if (d > P.r + 28) k.touch = false;
          break;
        }
        case 'gt': k.lift = approach(k.lift, gateOpen(G.map, k) ? 1 : 0, dt * 5); break;
        case 'fb': {
          if (!frozen) k.ang += dt * (k.w || 1) * FB_SPD[k.s || 2];
          k.hitT -= dt;
          const n = k.n || 4;
          for (let i = 0; i < n; i++) {
            const bx = k.x + Math.cos(k.ang) * (12 + i * 12), by = k.y + Math.sin(k.ang) * (12 + i * 12);
            if (alive && dist(P.x, P.y, bx, by) < P.r * 0.55 + 5.5) P.hurt(1, bx, by);
            hurtSnakesAt(room, bx, by, 5.5, 1.6, 'mkFbT', 0.45, true);
          }
          if (Math.random() < dt * 8) { const i = Math.floor(Math.random() * n); addP({ kind: 'dot', x: k.x + Math.cos(k.ang) * (12 + i * 12), y: k.y + Math.sin(k.ang) * (12 + i * 12), vx: rnd(-10, 10), vy: rnd(-40, -15), r: rnd(0.8, 1.8), life: 0.4, col: '#ffb43a', glow: true, drag: 2 }); }
          break;
        }
        case 'sw': {
          if (k.ver !== room.ver || k.lo == null) sawRange(room, k);
          if (!frozen) {
            k.spin += dt * 16 * k.dir;
            if (k.ax === 'v') { k.y += k.dir * k.v * dt; if (k.y >= k.hi) { k.y = k.hi; k.dir = -1; } else if (k.y <= k.lo) { k.y = k.lo; k.dir = 1; } }
            else { k.x += k.dir * k.v * dt; if (k.x >= k.hi) { k.x = k.hi; k.dir = -1; } else if (k.x <= k.lo) { k.x = k.lo; k.dir = 1; } }
          }
          if (alive && dist(P.x, P.y, k.x, k.y) < P.r * 0.6 + 11) P.hurt(1, k.x, k.y);
          hurtSnakesAt(room, k.x, k.y, 11, 2, 'mkSawT', 0.5, false);
          if (Math.random() < dt * 10) addP({ kind: 'dot', x: k.x + rnd(-6, 6), y: k.y + rnd(-6, 6), vx: rnd(-60, 60), vy: rnd(-60, 20), r: rnd(0.6, 1.2), life: 0.25, col: '#ffe8a0', glow: true, drag: 3 });
          break;
        }
        case 'tt': {
          if (frozen || !alive) break;
          const active = k.on === 'a' || (room.locked && !room.cleared);
          if (!active) { k.charge = Math.max(0, k.charge - dt * 2); break; }
          const aimA = Math.atan2(P.y - k.y, P.x - k.x);
          k.aimA = k.aimA == null ? aimA : turnToward(k.aimA, aimA, dt * 3);
          k.cd -= dt; k.charge = clamp(1 - k.cd / 0.6, 0, 1);
          if (k.cd <= 0) {
            const a = k.d === 8 ? k.aimA : Math.atan2(DIRS[k.d || 0][1], DIRS[k.d || 0][0]);
            spawnVenom(k.x + Math.cos(a) * 16, k.y + Math.sin(a) * 16, a, (G.levelDef.venomSpeed || 150) * 0.85, '#b6e04a');
            Sfx.spit();
            k.cd = TT_RATE[k.s || 2];
          }
          break;
        }
        case 'bx':
          if (k.fuse > 0) { k.fuse -= dt; if (Math.random() < dt * 30) addP({ kind: 'dot', x: k.x + 4, y: k.y - 20, vx: rnd(-30, 30), vy: rnd(-60, -20), r: rnd(0.6, 1.4), life: 0.3, col: '#ffd24a', glow: true, drag: 2 }); if (k.fuse <= 0) blowKeg(room, k); }
          break;
        case 'ns': {
          if (frozen || !room.locked || room.cleared || !alive) break;
          k.cd -= dt;
          const out = room.snakes.filter((s) => s.alive && s.mkNest === k).length;
          if (k.cd <= 0 && out < (k.n || 3)) {
            k.cd = NEST_RATE[k.s || 2];
            const cell = nearestFreeCell(room, k.x, k.y + 6, (c, r) => c === k.c && r === k.r);
            const sn = safe(() => new Snake(k.k || 'grub', cell.x, cell.y, { delay: 0, spawnTime: 0.6, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
            if (sn) { sn.mkNest = k; room.snakes.push(sn); Sfx.hiss(0.7); burst(k.x, k.y, 8, '#5a4030', { kind: 'chunk', min: 20, max: 80, lmin: 0.3, lmax: 0.6, drag: 3 }); if (k.ob) k.ob.shake = 0.3; }
          }
          break;
        }
        case 'ac': {
          if (alive && inCell(P, k, 5)) {
            const hit = P.hurt(1, P.x - P.vx * 0.05, P.y - P.vy * 0.05 + 1);
            if (hit) { Sfx.tone(420, 0.25, { to: 160, type: 'sawtooth', vol: 0.05, lp: 1200 }); floatText(P.x, P.y - 24, 'ACID', '#9be37a'); }
            if (Math.random() < dt * 20) addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y + rnd(-4, 6), vx: rnd(-10, 10), vy: rnd(-50, -20), r: rnd(0.8, 1.6), life: 0.4, col: '#b8ff4a', glow: true, drag: 2 });
          }
          for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && !sn.isBoss && inCell(sn, k, 4) && !(sn.mkAcT > G.t)) { sn.hurt(0.8, sn.x, sn.y, true); sn.mkAcT = G.t + 0.5; }
          break;
        }
        case 'wk':
          if (k.state === 0 && alive && inCell(P, k, 4)) { k.state = 1; k.tm = 0; Sfx.crumble(); }
          else if (k.state === 1) {
            k.tm += dt;
            if (Math.random() < dt * 16) addP({ kind: 'dot', x: k.x + rnd(-16, 16), y: k.y + rnd(-16, 16), vx: rnd(-10, 10), vy: rnd(-30, -10), r: rnd(0.8, 1.8), life: 0.5, col: G.levelDef.dirt || '#5a4332', drag: 2 });
            if (k.tm > 0.65) { const onIt = Math.abs(P.x - k.x) < T / 2 + P.r - 6 && Math.abs(P.y - k.y) < T / 2 + P.r - 6; collapseCell(room, k, onIt && P.dying <= 0); k.state = 2; }
          }
          break;
        default: break;
      }
    }
    if (room.type === 'survival' && room.surv && room.surv.on && room.mkSn && room.mkSn.length && !room.mkSnDone) { room.mkSnDone = true; spawnMapSnakes(room); }
    if (room.mkExit && !room.exit && !room.locked && !mustFight(room)) openExit(room);
  }

  /* ---- the hooks into the game's own update and drawing */
  safe(() => {
    const ure0 = updateRoomExtras;
    updateRoomExtras = function (dt, room, frozen) {
      ure0.apply(this, arguments);
      if (room && room.mkE && G.map && G.state === 'play') safe(() => mkUpdate(dt, room, frozen));
    };
    const ho0 = hitObstacle;
    hitObstacle = function (room, o) { if (o && o.mk) { mkHit(room, o, 1); return; } return ho0.apply(this, arguments); };
    const bo0 = breakObstacle;
    breakObstacle = function (room, o) { if (o && o.mk) { mkHit(room, o, 4); return; } return bo0.apply(this, arguments); };
  });
  function mkHit(room, o, n) {
    const k = o.mk; if (!k || k.dead) return;
    o.shake = 0.3;
    if (o.type === 'mkLever') { pullLever(room, k); return; }
    if (o.type === 'mkKeg') {
      if (k.fuse > 0) return;
      if (n >= 4) { k.fuse = 0.15; Sfx.fuse(); return; }
      o.hp -= 1; Sfx.clank();
      if (o.hp <= 0) { k.fuse = 0.28; Sfx.fuse(); }
      return;
    }
    if (o.type === 'mkTotem') {
      if (!o.breakable) return;
      o.hp -= n >= 4 ? 3 : 1; Sfx.thud();
      if (o.hp <= 0) { killOb(room, k, '#6a625a'); Sfx.breakUrn(); addDecal(room, 'crack', k.x, k.y, 14, '#000000'); }
      return;
    }
    if (o.type === 'mkNest') {
      o.hp -= n >= 4 ? 3 : 1;
      if (o.hp <= 0) {
        killOb(room, k, '#4a3624', 'chunk'); Sfx.squelch();
        addDecal(room, 'splat', k.x, k.y, 14, '#2a1a10');
        floatText(k.x, k.y - 24, 'NEST DOWN', '#ffd27a', true);
      } else if (Math.random() < 0.4) Sfx.splat();
    }
  }

  function drawMkFloor(c, room, t) {
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'ac') ART.ac(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'wk' && k.state < 2) ART.wk(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'sp') ART.sp(c, k.x, k.y, k, t, 'game');
    }
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'jp') ART.jp(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'tp') ART.tp(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'ex' && !room.exit) ART.ex(c, k.x, k.y, k, t, 'game');
      else if (k.t === 'pd') ART.pd(c, k.x, k.y + 4, k, t, 'game');
      else if (k.t === 'sw') ART.swGroove(c, k);
    }
    for (const k of room.mkE) {
      if (k.dead) continue;
      if (k.t === 'sw') ART.swBlade(c, k.x, k.y, k.spin);
      else if (k.t === 'sg') ART.sg(c, k.x, k.y, k, t, 'game');
    }
  }
  function drawMkHigh(c, room, t) {
    for (const k of room.mkE) {
      if (k.dead || k.t !== 'fb') continue;
      for (let i = 0; i < (k.n || 4); i++) fbBall(c, k.x + Math.cos(k.ang) * (12 + i * 12), k.y + Math.sin(k.ang) * (12 + i * 12), 5.5, t, i);
    }
  }
  function wrapText(c, s, maxW) {
    const words = String(s).split(/\s+/).filter(Boolean), lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (c.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 6);
  }
  function drawSignBubble(c, k, room, a) {
    c.save(); c.globalAlpha = a;
    c.font = `600 9.5px ${FONT}`;
    const lines = wrapText(c, k.txt || '', 128);
    if (!lines.length) { c.restore(); return; }
    const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 14, h = lines.length * 11.5 + 9;
    let x = clamp(k.x - w / 2, 4, RW - w - 4), y = k.y - 22 - h;
    if (y < 4) y = k.y + 24;
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 3, w, h);
    c.fillStyle = '#efe2c4'; c.fillRect(x, y, w, h);
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.2; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (y < k.y) { c.fillStyle = '#efe2c4'; c.beginPath(); c.moveTo(k.x - 5, y + h - 0.5); c.lineTo(k.x, y + h + 5); c.lineTo(k.x + 5, y + h - 0.5); c.fill(); }
    c.fillStyle = '#2a1a0c'; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach((l, i) => c.fillText(l, x + 7, y + 5 + i * 11.5));
    c.restore();
  }
  safe(() => {
    const df0 = drawFloorThings;
    drawFloorThings = function (c, room, t) { df0.apply(this, arguments); if (room && room.mkE && room.mkE.length) safe(() => drawMkFloor(c, room, t)); };
    const vb0 = drawVenomBodies;
    drawVenomBodies = function (c, t) { vb0.apply(this, arguments); const room = G.room; if (room && room.mkE && room.mkE.length) safe(() => drawMkHigh(c, room, t)); };
    const gl0 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      gl0.apply(this, arguments);
      if (!room || !room.mkE || !room.mkE.length) return;
      safe(() => {
        const P = G.player;
        c.globalCompositeOperation = 'lighter';
        for (const k of room.mkE) {
          if (k.dead) continue;
          if (k.t === 'tp') glowDot(c, k.x, k.y, k.on ? 30 : 18, CH_COLS[k.ch || 0], k.on ? 0.26 + 0.06 * Math.sin(t * 3 + k.t0) : 0.08);
          else if (k.t === 'fb') for (let i = 0; i < (k.n || 4); i++) glowDot(c, k.x + Math.cos(k.ang) * (12 + i * 12), k.y + Math.sin(k.ang) * (12 + i * 12), 15, '#ff7a2a', 0.32);
          else if (k.t === 'ac') glowDot(c, k.x, k.y, 26, '#7aff3a', 0.12 + 0.04 * Math.sin(t * 2 + k.t0));
          else if (k.t === 'lv') glowDot(c, k.x, k.y + 8, 12, CH_COLS[k.ch || 0], k.on ? 0.4 : 0.12);
          else if (k.t === 'bm' && k.k > 0) glowDot(c, k.x, k.y, 30, BUMP[k.st || 0][0], 0.5 * k.k);
          else if (k.t === 'tt' && k.charge > 0.05) glowDot(c, k.x, k.y, 18, '#c8ff4a', 0.35 * k.charge);
          else if (k.t === 'bx' && k.fuse > 0) glowDot(c, k.x, k.y, 34, '#ff6a1a', 0.3 + 0.2 * Math.sin(t * 40));
          else if (k.t === 'sw') glowDot(c, k.x, k.y, 16, '#ffe8a0', 0.08);
        }
        c.globalCompositeOperation = 'source-over';
        for (const k of room.mkE) {
          if (k.t !== 'sg' || k.dead) continue;
          const near = P && P.dying <= 0 && dist(P.x, P.y, k.x, k.y) < 52;
          k.show = approach(k.show || 0, near ? 1 : 0, 0.12);
          if (k.show > 0.02) drawSignBubble(c, k, room, k.show);
        }
      });
    };
    const xl0 = extraLights;
    extraLights = function (room, light) {
      xl0.apply(this, arguments);
      if (!room || !room.mkE) return;
      for (const k of room.mkE) {
        if (k.dead) continue;
        if (k.t === 'tp') light(k.x, k.y, k.on ? 48 : 26, k.on ? 0.6 : 0.3);
        else if (k.t === 'fb') { const n = k.n || 4; light(k.x + Math.cos(k.ang) * (6 + n * 6), k.y + Math.sin(k.ang) * (6 + n * 6), 20 + n * 9, 0.55); }
        else if (k.t === 'ac') light(k.x, k.y, 40, 0.42);
        else if (k.t === 'lv') light(k.x, k.y, 30, 0.3);
        else if (k.t === 'sg') light(k.x, k.y - 8, 30, 0.3);
        else if (k.t === 'bx' && k.fuse > 0) light(k.x, k.y, 70, 0.8);
      }
    };
    DYN9.mkBump = (c, o, room, t) => ART.bm(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkLever = (c, o, room, t) => ART.lv(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkGate = (c, o, room, t) => ART.gt(c, o.x, o.y, o.mk, t, 'game');
    DYN9.mkPivot = (c, o) => ART.fbPivot(c, o.x, o.y);
    DYN9.mkTotem = (c, o, room, t) => ART.tt(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    DYN9.mkKeg = (c, o, room, t) => ART.bx(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    DYN9.mkNest = (c, o, room, t) => ART.ns(c, o.x + (o.shake > 0 ? rnd(-1.5, 1.5) : 0), o.y, o.mk, t, 'game');
    if (typeof MINI9 === 'object') MINI9.hall = (c, mx, my, cur) => { c.fillStyle = cur ? '#5a4a3a' : '#8a7a6a'; c.fillRect(mx - 2, my - 0.8, 4, 1.6); };
  });

  Object.assign(MK, { ART, snakeSprite, bossSprite, buildFloor, label, fbBall, FB_SPD, BUMP });

  /* ================================================================== 8. the Map Maker screen */
  const SVG = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
  const IC = {
    back: SVG('<path d="M15 5l-7 7 7 7"/>'),
    undo: SVG('<path d="M9 7H5V3"/><path d="M5 7a8 8 0 1 1-1.5 6.5"/>'),
    redo: SVG('<path d="M15 7h4V3"/><path d="M19 7a8 8 0 1 0 1.5 6.5"/>'),
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2v12L13.5 8z" fill="currentColor"/></svg>',
    share: SVG('<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>'),
    brush: SVG('<path d="M14.5 4.5l5 5-8.5 8.5H6v-5z"/><path d="M12 7l5 5"/>'),
    erase: SVG('<path d="M4 15l8.5-8.5 6 6L12 19H7z"/><path d="M12 19h8"/>'),
    fill: SVG('<path d="M5 12l7-7 7 7-7 7z"/><path d="M20 15c0 1.4-1 2.5-1.8 2.5S16.5 16.4 16.5 15c0-1 1.8-3 1.8-3S20 14 20 15z" fill="currentColor"/>'),
    box: SVG('<rect x="4.5" y="5.5" width="15" height="13" rx="1"/><path d="M4.5 9.5h15" stroke-dasharray="2 2"/>'),
    pick: SVG('<path d="M14 6l4 4M5 19l1.5-4L15 6.5a2.1 2.1 0 0 1 3 3L9.5 18z"/>'),
    move: SVG('<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>'),
    mirX: SVG('<path d="M12 3v18" stroke-dasharray="2 2.5"/><path d="M9 7l-5 5 5 5zM15 7l5 5-5 5z"/>'),
    mirY: SVG('<path d="M3 12h18" stroke-dasharray="2 2.5"/><path d="M7 9l5-5 5 5zM7 15l5 5 5-5z"/>'),
    grid: SVG('<path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16M15 4v16"/>'),
    plus: SVG('<path d="M12 5v14M5 12h14"/>'),
    trash: SVG('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>'),
    copy: SVG('<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/>'),
    paste: SVG('<rect x="6" y="5" width="12" height="15" rx="1"/><path d="M9 5V3.5h6V5M9 11h6M9 15h4"/>'),
    flipX: SVG('<path d="M12 3v18" stroke-dasharray="2 2.5"/><path d="M9 6H4l5 12zM15 6h5l-5 12z"/>'),
    flipY: SVG('<path d="M3 12h18" stroke-dasharray="2 2.5"/><path d="M6 9V4l12 5zM6 15v5l12-5z"/>'),
    layout: SVG('<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 16h3"/>'),
    check: SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    warn: SVG('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'),
    key: SVG('<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M20 12v2.5"/>'),
    map: SVG('<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>'),
    paste2: SVG('<path d="M8 4h8v4H8zM6 6H4v15h16V6h-2"/><path d="M9 13h6M9 17h4"/>'),
    dots: SVG('<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>'),
    edit: SVG('<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    floorIc: SVG('<rect x="3" y="7" width="7" height="6"/><rect x="14" y="7" width="7" height="6"/><rect x="14" y="16" width="7" height="5"/><path d="M10 10h4M17.5 13v3"/>'),
    test: SVG('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>'),
  };
  const TOOLS = [['brush', 'Brush', 'B'], ['erase', 'Erase', 'E'], ['fill', 'Fill', 'F'], ['box', 'Box', 'R'], ['pick', 'Pick', 'I'], ['move', 'Select', 'V']];
  const CATS = [['blocks', 'Blocks'], ['floor', 'Floor'], ['snakes', 'Snakes'], ['traps', 'Traps'], ['gadgets', 'Gadgets'], ['loot', 'Loot'], ['text', 'Text'], ['pieces', 'Room pieces']];
  const ENT_ORDER = { traps: ['fb', 'sw', 'tt', 'bx', 'ns', 'ac', 'wk', 'sk'], gadgets: ['tp', 'jp', 'sp', 'bm', 'lv', 'gt', 'pl', 'sg', 'ex'], loot: ['pd', 'ky', 'cn'], text: ['tx', 'nt', 'cq', 'sh', 'sg'] };
  const TYPE_ICON = (col) => `<i style="background:${col}"></i>`;

  const CSS = `
#maker{position:absolute;inset:0;z-index:6;background:#0b0807;color:var(--ink);font-family:var(--ui);text-align:left;-webkit-user-select:none;user-select:none}
#maker input,#maker textarea,#maker select{-webkit-user-select:text;user-select:text}
.mk-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:2px;
  background:rgba(255,255,255,.03);font:700 13px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--ink);white-space:nowrap;transition:border-color .14s,background .14s,color .14s}
.mk-btn:hover{border-color:rgba(236,226,212,.45)}
.mk-btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.mk-btn svg{width:16px;height:16px;flex:none}
.mk-btn.ic{padding:0;width:36px}
.mk-btn.pri{background:var(--apple);border-color:var(--apple);color:#fff4ec;box-shadow:0 0 22px rgba(215,38,61,.28)}
.mk-btn.pri:hover{background:var(--apple-hi);border-color:var(--apple-hi)}
.mk-btn.gold{color:var(--toffee);border-color:rgba(227,165,74,.5)}
.mk-btn.red{color:#ff8494;border-color:rgba(232,58,80,.45)}
.mk-btn.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-btn[disabled]{opacity:.32;cursor:default;pointer-events:none}
.mk-in{all:unset;box-sizing:border-box;width:100%;background:#120d0b;border:1px solid var(--line);border-radius:2px;padding:8px 10px;font:500 15px/1.25 var(--ui);color:var(--ink)}
.mk-in:focus{border-color:var(--toffee)}
textarea.mk-in{min-height:64px;resize:vertical;white-space:pre-wrap}
textarea.mk-code{font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;word-break:break-all;min-height:96px}
select.mk-in{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);background-position:calc(100% - 15px) 52%,calc(100% - 10px) 52%;background-size:5px 5px;background-repeat:no-repeat;padding-right:28px}
select.mk-in option{background:#120d0b;color:var(--ink)}
.mk-h{margin:16px 0 8px;font:700 11px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.mk-h:first-child{margin-top:2px}
.mk-p{margin:0 0 8px;font:500 14px/1.35 var(--ui);color:var(--muted)}
.mk-seg{display:flex;flex-wrap:wrap;gap:4px}
.mk-seg button{all:unset;box-sizing:border-box;cursor:pointer;min-height:30px;padding:0 9px;display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:2px;font:600 13px/1 var(--ui);letter-spacing:.04em;color:var(--muted);background:rgba(255,255,255,.02)}
.mk-seg button:hover{color:var(--ink);border-color:rgba(236,226,212,.4)}
.mk-seg button.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-seg button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-seg i{width:10px;height:10px;border-radius:1px;display:inline-block}
.mk-row{display:grid;grid-template-columns:118px minmax(0,1fr);gap:6px 10px;align-items:center;margin-bottom:7px}
.mk-row>span{font:600 12px/1.15 var(--ui);letter-spacing:.06em;color:var(--muted)}
.mk-field{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.mk-field>span{font:600 11px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}
.mk-note{margin:6px 0;padding:8px 10px;border-left:3px solid var(--toffee);background:rgba(227,165,74,.06);font:500 13px/1.35 var(--ui);color:var(--muted)}
.mk-toast{position:absolute;left:50%;bottom:18px;transform:translate(-50%,10px);opacity:0;pointer-events:none;z-index:30;background:#1a1210;border:1px solid rgba(227,165,74,.55);border-radius:2px;padding:9px 14px;font:600 14px/1.2 var(--ui);color:var(--ink);transition:opacity .2s,transform .2s;max-width:calc(100% - 32px);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.mk-toast.show{opacity:1;transform:translate(-50%,0)}
/* hub */
.mkh{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:22px max(16px,env(safe-area-inset-right)) 40px max(16px,env(safe-area-inset-left))}
.mkh-in{max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.mkh-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap}
.mkh-head h2{font:800 clamp(40px,10vw,62px)/.95 var(--display);margin:4px 0 0}
.mkh-head .kick{color:var(--toffee)}
.mkh-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.mkh-act{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:42px minmax(0,1fr);grid-template-rows:auto auto;column-gap:12px;row-gap:3px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:3px;background:linear-gradient(180deg,rgba(28,20,17,.9),rgba(12,9,8,.93))}
.mkh-act:hover{border-color:rgba(232,58,80,.6)}
.mkh-act:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.mkh-act .ai{grid-row:1/3;width:42px;height:42px;border-radius:2px;display:grid;place-items:center;background:rgba(215,38,61,.14);color:var(--apple-hi);border:1px solid rgba(215,38,61,.4)}
.mkh-act .ai svg{width:22px;height:22px}
.mkh-act b{font:800 24px/1 var(--display)}
.mkh-act span{font:500 13px/1.25 var(--ui);color:var(--muted)}
.mkh-act.alt .ai{background:rgba(227,165,74,.1);color:var(--toffee);border-color:rgba(227,165,74,.4)}
.mkh-paste{border:1px solid rgba(227,165,74,.35);border-radius:3px;padding:12px;background:rgba(227,165,74,.04);display:flex;flex-direction:column;gap:8px}
.mkh-msg{margin:0;min-height:1.2em;font:600 14px/1.3 var(--ui);color:var(--toffee)}
.mkh-sec{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:10px 0 -4px;border-bottom:1px solid var(--line);padding-bottom:8px}
.mkh-sec h3{margin:0;font:700 13px/1 var(--ui);letter-spacing:.24em;text-transform:uppercase;color:var(--apple-hi)}
.mkh-sec span{font:600 12px/1 var(--ui);letter-spacing:.12em;color:var(--faint);text-transform:uppercase}
.mkh-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.mkh-card{display:grid;grid-template-columns:96px minmax(0,1fr);gap:11px;padding:10px;border:1px solid var(--line);border-radius:3px;background:rgba(255,255,255,.02);min-width:0}
.mkh-card canvas{width:96px;height:72px;display:block;border-radius:2px;background:#120d0b}
.mkh-card .ci{display:flex;flex-direction:column;gap:3px;min-width:0}
.mkh-card b{font:800 21px/1.05 var(--display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mkh-card small{font:600 11px/1.2 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mkh-card p{margin:0;font:500 13px/1.3 var(--ui);color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mkh-card .cb{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}
.mkh-card .cb .mk-btn{min-height:32px;font-size:12px;padding:0 10px;flex:1 1 auto}
.mkh-card.ex{border-color:rgba(227,165,74,.3)}
.mkh-empty{padding:18px;border:1px dashed var(--line);border-radius:3px;font:500 15px/1.35 var(--ui);color:var(--muted)}
/* editor */
.mke{position:absolute;inset:0;display:flex;flex-direction:column}
.mke-top{flex:none;display:flex;align-items:center;gap:6px;padding:7px max(10px,env(safe-area-inset-right)) 7px max(10px,env(safe-area-inset-left));border-bottom:1px solid var(--line);background:#0e0a09}
.mke-title{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto;margin:0 4px}
.mke-title small{display:flex;gap:10px;font:700 10px/1 var(--ui);letter-spacing:.22em;text-transform:uppercase;color:var(--apple-hi)}
.mke-title small em{font-style:normal;color:var(--faint);letter-spacing:.14em}
.mke-title input{all:unset;box-sizing:border-box;font:800 22px/1.15 var(--display);color:var(--ink);min-width:0;width:100%;border-bottom:1px dashed transparent;-webkit-user-select:text;user-select:text}
.mke-title input:hover{border-bottom-color:var(--line)}
.mke-title input:focus{border-bottom-color:var(--toffee)}
.mke-chk{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 10px;border:1px solid rgba(124,216,120,.4);border-radius:2px;font:700 12px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:#9be37a}
.mke-chk svg{width:15px;height:15px}
.mke-chk.bad{border-color:rgba(232,58,80,.55);color:#ff8494}
.mke-chk.meh{border-color:rgba(227,165,74,.5);color:var(--toffee)}
.mke-body{flex:1;min-height:0;display:grid;grid-template-columns:270px minmax(0,1fr) 340px;grid-template-rows:auto minmax(0,1fr);grid-template-areas:"floor stage tabs" "floor stage pane"}
.mke-stage{grid-area:stage;display:flex;flex-direction:column;min-width:0;min-height:0;border-left:1px solid var(--line);border-right:1px solid var(--line);background:radial-gradient(120% 90% at 50% 40%,#17110e,#0b0807)}
.mke-crumb{flex:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px 0;font:600 12px/1.2 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--faint);min-height:28px}
.mke-crumb b{color:var(--ink);font-weight:700}
.mke-crumb i{width:9px;height:9px;border-radius:1px;display:inline-block}
.mke-crumb .hv{margin-left:auto;color:var(--muted);text-transform:none;letter-spacing:.04em}
.mke-cvw{flex:1;min-height:0;display:grid;place-items:center;padding:8px;position:relative}
.mke-cvw canvas{display:block;touch-action:none;cursor:crosshair;box-shadow:0 18px 50px rgba(0,0,0,.55)}
.mke-tools{flex:none;display:flex;gap:4px;padding:8px 10px;border-top:1px solid var(--line);overflow-x:auto;scrollbar-width:none;background:#0e0a09}
.mke-tools::-webkit-scrollbar{display:none}
.mke-tools .sep{width:1px;background:var(--line);margin:3px 4px;flex:none}
.mke-tools .mk-btn{min-height:38px;padding:0 10px;font-size:12px;letter-spacing:.1em}
.mke-tools .mk-btn kbd{font:600 10px/1 var(--ui);border:1px solid var(--line);border-radius:2px;padding:2px 4px;color:var(--faint);margin-left:2px}
@media (max-width:1599px){.mke-tools .mk-btn kbd{display:none}}
@media (max-width:1279px) and (min-width:980px){.mke-tools .mk-btn .tl{display:none}.mke-tools .mk-btn{padding:0;width:40px}}
.mke-tabs{grid-area:tabs;display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--line);background:#0e0a09}
.mke-tabs button{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 0;min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);border-radius:2px;font:700 12px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.mke-tabs button[aria-selected=true]{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mke-tabs button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mke-tabs button[data-p=floor]{display:none}
.mke-pane{grid-area:pane;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:12px 12px 30px;min-height:0}
.mke-pane.on{display:block}
#mkPaneFloor{grid-area:floor;display:block;border-right:0}
.mk-cats{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.mk-cats button{all:unset;box-sizing:border-box;cursor:pointer;min-height:28px;padding:0 8px;display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:2px;font:700 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.mk-cats button.on{background:var(--toffee);border-color:var(--toffee);color:#16100d}
.mk-cats button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-pal{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:5px}
.mk-br{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 3px 6px;border:1px solid var(--line);border-radius:2px;background:rgba(255,255,255,.02);min-width:0;position:relative}
.mk-br:hover{border-color:rgba(236,226,212,.4)}
.mk-br:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-br canvas{width:42px;height:42px;display:block}
.mk-br span{font:600 11px/1.05 var(--ui);color:var(--muted);text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mk-br.on{border-color:var(--toffee);background:rgba(227,165,74,.12)}
.mk-br.on span{color:var(--ink)}
.mk-br.new::after{content:"NEW";position:absolute;top:3px;right:3px;font:700 8px/1 var(--ui);letter-spacing:.1em;background:var(--apple);color:#fff4ec;padding:2px 3px;border-radius:1px}
.mk-card{margin-top:12px;border:1px solid rgba(227,165,74,.35);border-radius:3px;padding:10px;background:rgba(227,165,74,.04)}
.mk-card .hd{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:center;margin-bottom:8px}
.mk-card .hd canvas{width:44px;height:44px;background:#120d0b;border-radius:2px}
.mk-card .hd b{display:block;font:800 21px/1 var(--display)}
.mk-card .hd small{display:block;margin-top:3px;font:600 10px/1 var(--ui);letter-spacing:.18em;text-transform:uppercase;color:var(--toffee)}
.mk-card p{margin:0 0 8px;font:500 14px/1.32 var(--ui);color:var(--muted)}
.mk-pick{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:4px 10px 4px 4px;border:1px solid var(--line);border-radius:2px;background:#120d0b;font:600 14px/1.1 var(--ui);color:var(--ink)}
.mk-pick canvas{width:32px;height:32px;flex:none}
.mk-pick:hover{border-color:rgba(236,226,212,.4)}
.mk-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:4px}
.mk-types button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:7px;min-height:32px;padding:0 8px;border:1px solid var(--line);border-radius:2px;font:600 13px/1.05 var(--ui);color:var(--muted)}
.mk-types button i{width:10px;height:10px;border-radius:1px;flex:none;box-shadow:0 0 6px rgba(255,255,255,.12)}
.mk-types button:hover{color:var(--ink);border-color:rgba(236,226,212,.4)}
.mk-types button.on{background:rgba(215,38,61,.18);border-color:var(--apple);color:#fff4ec}
.mk-doors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.mk-door{border:1px solid var(--line);border-radius:2px;padding:7px;display:flex;flex-direction:column;gap:5px}
.mk-door>span{font:700 11px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.mk-door>span em{font-style:normal;color:var(--muted);letter-spacing:.04em;text-transform:none}
.mk-acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
.mk-acts .mk-btn{font-size:11.5px;padding:0 8px;letter-spacing:.08em}
.mk-floors{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.mk-floors button{all:unset;box-sizing:border-box;cursor:pointer;min-width:34px;min-height:32px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:2px;font:700 13px/1 var(--ui);letter-spacing:.1em;color:var(--muted)}
.mk-floors button.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-floors button svg{width:14px;height:14px}
.mk-fg{display:grid;gap:0;user-select:none;margin:4px 0 6px}
.mk-fc{all:unset;box-sizing:border-box;position:relative;aspect-ratio:6/5;border:1px dashed rgba(236,226,212,.07);border-radius:2px;cursor:default;min-width:0}
.mk-fc.add{border-color:rgba(236,226,212,.22);cursor:pointer;display:grid;place-items:center;color:var(--faint)}
.mk-fc.add svg{width:13px;height:13px;opacity:.6}
.mk-fc.add:hover{border-color:var(--toffee);color:var(--toffee)}
.mk-fc.rm{border:1px solid rgba(236,226,212,.25);cursor:pointer;background:#120d0b;overflow:hidden}
.mk-fc.rm canvas{position:absolute;inset:0;width:100%;height:100%}
.mk-fc.rm b{position:absolute;left:2px;bottom:1px;font:800 9px/1 var(--ui);letter-spacing:.06em;color:#fff4ec;text-shadow:0 0 3px #000,0 0 2px #000}
.mk-fc.rm.cur{border-color:var(--toffee);box-shadow:0 0 0 1px var(--toffee),0 0 14px rgba(227,165,74,.35)}
.mk-fc.rm.lk::after{content:"";position:absolute;right:2px;top:2px;width:7px;height:7px;border-radius:1px;background:#c9a000;box-shadow:0 0 0 1px #000}
.mk-fe{all:unset;box-sizing:border-box;cursor:pointer;display:grid;place-items:center;min-width:0;min-height:0}
.mk-fe::before{content:"";display:block;background:rgba(236,226,212,.55)}
.mk-fe.v::before{width:3px;height:42%}
.mk-fe.h::before{height:3px;width:42%}
.mk-fe.w::before{background:#5a2a2e;width:100%;height:100%}
.mk-fe.v.w::before{width:4px;height:100%}
.mk-fe.h.w::before{height:4px;width:100%}
.mk-fe.c::before{background:repeating-linear-gradient(45deg,var(--toffee) 0 2px,transparent 2px 4px)}
.mk-fe.v.c::before{width:5px;height:80%}
.mk-fe.h.c::before{height:5px;width:80%}
.mk-fe:hover::before{background:var(--apple-hi)}
.mk-fe.no{pointer-events:none}
.mk-fe.no::before{display:none}
.mk-key{display:flex;gap:10px;flex-wrap:wrap;font:600 11px/1 var(--ui);letter-spacing:.08em;color:var(--faint);margin-bottom:6px}
.mk-key span{display:inline-flex;align-items:center;gap:5px}
.mk-key i{display:inline-block;width:12px;height:4px;background:rgba(236,226,212,.55)}
.mk-key i.w{background:#5a2a2e;height:5px}
.mk-key i.c{background:repeating-linear-gradient(45deg,var(--toffee) 0 2px,transparent 2px 4px);height:5px}
.mk-items{display:flex;flex-wrap:wrap;gap:5px}
.mk-items button{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:2px 9px 2px 3px;border:1px solid var(--line);border-radius:2px;font:600 13px/1 var(--ui);color:var(--ink)}
.mk-items button canvas{width:28px;height:28px}
.mk-items button:hover{border-color:#ff8494}
.mk-items button.add{padding:0 10px;color:var(--toffee);border-color:rgba(227,165,74,.45)}
.mk-probs{display:flex;flex-direction:column;gap:5px}
.mk-probs button{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;align-items:start;padding:7px 9px;border:1px solid var(--line);border-left:3px solid var(--toffee);border-radius:2px;font:500 13.5px/1.3 var(--ui);color:var(--ink)}
.mk-probs button.err{border-left-color:var(--apple)}
.mk-probs button svg{width:15px;height:15px;color:var(--toffee);margin-top:1px}
.mk-probs button.err svg{color:var(--apple-hi)}
.mk-probs button small{display:block;color:var(--faint);font-size:12px;margin-top:2px}
/* dialogs */
.mk-dlg{position:absolute;inset:0;z-index:20;background:rgba(9,6,6,.82);display:grid;place-items:center;padding:16px}
.mk-dlg[hidden]{display:none}
.mk-dlg-in{width:min(560px,100%);max-height:calc(100% - 20px);display:flex;flex-direction:column;border:1px solid rgba(227,165,74,.45);border-radius:3px;background:#0e0a09;box-shadow:0 24px 70px rgba(0,0,0,.7)}
.mk-dlg-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
.mk-dlg-hd b{font:800 26px/1 var(--display)}
.mk-dlg-bd{padding:12px 14px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0}
.mk-dlg-ft{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line)}
.mk-plist{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;margin-top:8px}
.mk-plist button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:44px;padding:3px 8px 3px 3px;border:1px solid var(--line);border-radius:2px;font:600 13px/1.1 var(--ui);color:var(--ink);min-width:0}
.mk-plist button canvas{width:38px;height:38px;flex:none}
.mk-plist button span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.mk-plist button small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mk-plist button.rare small{color:#ffb44a}
.mk-plist button.lk{opacity:.7}
.mk-plist button.on{border-color:var(--toffee);background:rgba(227,165,74,.12)}
.mk-plist button:hover{border-color:rgba(236,226,212,.45)}
.mk-plist.bosses{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.mke-grip{display:none;grid-area:grip;align-items:center;justify-content:center;height:26px;border-top:1px solid var(--line);background:#0e0a09;cursor:row-resize;touch-action:none;-webkit-user-select:none;user-select:none;position:relative}
.mke-grip::before{content:"";width:48px;height:4px;border-radius:1px;background:rgba(236,226,212,.35)}
.mke-grip:hover::before,.mke-grip.drag::before{background:var(--toffee)}
.mke-grip:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}
.mk-dlg{grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr)}.mk-dlg-in.pk{height:min(680px,calc(100% - 20px))}
.mk-dlg-bd.pk{display:flex;flex-direction:column;overflow:hidden;flex:1 1 auto}
.mk-pk-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.mk-pk-top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.mk-pk-top .mk-in{flex:1 1 180px;min-width:0;width:auto}
.mk-pk-top .mk-seg{margin:0}
.mk-plist.pk{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;align-content:start;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));padding-bottom:4px}
.mk-plist.pk button{align-items:center;min-height:54px}
.mk-plist.pk button span{overflow:visible;white-space:normal}
.mk-plist.pk button em.d{display:block;margin-top:3px;font:500 12px/1.25 var(--ui);font-style:normal;letter-spacing:0;text-transform:none;color:var(--muted)}
.mk-plist.bosses button canvas{width:64px;height:37px}
.mk-prev{border:1px solid var(--line);border-radius:3px;padding:10px;display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;margin-top:4px}
.mk-prev canvas{width:110px;height:82px;background:#120d0b;border-radius:2px}
.mk-prev b{font:800 24px/1 var(--display)}
.mk-prev p{margin:4px 0 0;font:500 14px/1.3 var(--ui);color:var(--muted)}
.mk-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font:600 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mk-stats b{font:700 15px/1 var(--ui);color:var(--ink);margin-right:3px;letter-spacing:0}
@media (max-width:979px){
  .mke-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto minmax(0,1fr);grid-template-areas:"stage" "grip" "tabs" "pane"}
  .mke-stage{border:0;height:var(--mk-sh,min(60vh,calc((100vw - 12px) * 0.8374 + 104px)))}
  .mke-grip{display:flex}
  #mkPaneFloor{grid-area:pane;display:none}
  #mkPaneFloor.on{display:block}
  .mke-tabs button[data-p=floor]{display:inline-flex}
  .mke-top .lbl{display:none}
  .mke-top .mk-btn{padding:0 9px}
  .mke-cvw{padding:6px}
}
@media (max-width:979px) and (orientation:landscape) and (max-height:560px){
  .mke-body{grid-template-columns:minmax(0,1fr) minmax(290px,44%);grid-template-rows:auto minmax(0,1fr);grid-template-areas:"stage tabs" "stage pane"}
  .mke-stage{height:auto;border-right:1px solid var(--line)}
  .mke-grip{display:none}
  .mke-crumb{display:none}
  .mke-tools{padding:5px 6px}
  .mke-tools .mk-btn{min-height:32px}
  .mke-tabs{padding:6px 8px}
  .mke-tabs button{min-height:30px}
  .mke-top{padding-top:4px;padding-bottom:4px}
  .mke-title input{font-size:18px}
}
@media (max-width:560px){
  .mke-title input{font-size:19px}
  .mke-title small em{display:none}
  .mke-tools .mk-btn .tl{display:none}
  .mke-tools .mk-btn kbd{display:none}
  .mke-tools .mk-btn{padding:0;width:40px}
  .mke-crumb .hv{display:none}
  .mk-row{grid-template-columns:96px minmax(0,1fr)}
  .mkh-card{grid-template-columns:84px minmax(0,1fr)}
  .mkh-card canvas{width:84px;height:63px}
}
@media (max-width:420px){.mke-top{gap:4px}.mke-top .mk-btn.ic,.mke-top .mk-btn{width:34px;padding:0}.mke-chk{padding:0 8px}}
@media (min-width:980px) and (max-height:560px){
  .mke-top{padding-top:4px;padding-bottom:4px}
  .mke-title input{font-size:18px}
  .mke-crumb{display:none}
  .mke-body{grid-template-columns:220px minmax(0,1fr) 300px}
  .mke-tools{padding:5px 8px}
  .mke-tools .mk-btn{min-height:32px}
}
/* the menu tile */
#menu.m19 .mi.mk123{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:center;min-height:58px;padding:9px 12px;border-radius:3px;
  background:linear-gradient(100deg,rgba(40,28,14,.92),rgba(14,10,8,.94) 60%);border:1px solid rgba(227,165,74,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
#menu.m19 .mi.mk123 .ml{grid-column:1;grid-row:1;font:800 clamp(21px,5.8vw,25px)/.95 var(--display);color:var(--ink);transform:none}
#menu.m19 .mi.mk123 small{grid-column:1;grid-row:2;margin:0;font:600 10px/1.15 var(--ui);letter-spacing:.13em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#menu.m19 .mi.mk123 .mkt{grid-column:2;grid-row:1/3;display:grid;grid-template-columns:repeat(4,9px);grid-auto-rows:9px;gap:2px}
#menu.m19 .mi.mk123 .mkt i{background:rgba(227,165,74,.22);border-radius:1px}
#menu.m19 .mi.mk123 .mkt i.f{background:var(--toffee)}
#menu.m19 .mi.mk123 .mkt i.r{background:var(--apple)}
#menu.m19 .mi.mk123.new::after{left:auto;right:64px;top:50%;transform:translateY(-50%)}
#menu.m19 .mi.mk123:hover,#menu.m19 .mi.mk123:focus-visible{border-color:var(--toffee);transform:translateY(-1px)}
@media (min-aspect-ratio:20/21) and (max-height:560px){#menu.m19 .mi.mk123{min-height:34px;padding:4px 10px}#menu.m19 .mi.mk123 small,#menu.m19 .mi.mk123 .mkt{display:none}#menu.m19 .mi.mk123 .ml{font-size:17px}}
@media (max-height:700px) and (max-aspect-ratio:20/21){#menu.m19 .mi.mk123{min-height:46px}#menu.m19 .mi.mk123 .mkt{display:none}}
/* the guide tab */
.mk-gd .cards.items{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.mk-gd .cards.items figure{flex-direction:row;align-items:center;gap:12px;padding:8px 10px}
.mk-gd .cards.items canvas{width:46px;height:46px;flex:none;border-radius:3px;background:#17110e}
.mk-gd .cards.items b{font-size:19px;color:var(--toffee)}
.mk-gd .cards.items span{font-size:14px}
`;

  /* ---- small DOM helpers */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const btn = (cls, html, title, fn) => { const b = el('button', 'mk-btn ' + (cls || ''), html); b.type = 'button'; if (title) { b.title = title; b.setAttribute('aria-label', title); } if (fn) b.addEventListener('click', (e) => { e.preventDefault(); fn(e); }); return b; };
  function seg(opts, val, onPick, cls) {
    const box = el('div', 'mk-seg' + (cls ? ' ' + cls : ''));
    for (const [v, label, extra] of opts) {
      const b = el('button', v === val ? 'on' : '', (extra || '') + esc(label)); b.type = 'button';
      b.setAttribute('aria-pressed', v === val ? 'true' : 'false');
      b.addEventListener('click', (e) => { e.preventDefault(); onPick(v); });
      box.appendChild(b);
    }
    return box;
  }
  function row(label, child) { const r = el('div', 'mk-row'); r.appendChild(el('span', null, esc(label))); r.appendChild(child); return r; }
  function field(label, child) { const r = el('div', 'mk-field'); r.appendChild(el('span', null, esc(label))); r.appendChild(child); return r; }
  function canvasIcon(size, paint) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas');
    cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    safe(() => paint(c, size));
    return cv;
  }

  /* ---- icons for everything on the palette */
  const ATLAS = {};
  function previewDef(set) { return setDef(set); }
  function withScene(room, def, fn) {
    const kr = G.room, kl = G.levelDef, kt = G.t;
    G.levelDef = def; if (room) G.room = room;
    try { return fn(); } finally { G.room = kr; G.levelDef = kl; G.t = kt; }
  }
  // the room spots that only look like something once a run stocks them
  function pieceArt(c, ch, x, y, t) {
    if (ch === '$' || ch === '%') {
      c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 10, 11, 4); c.fill();
      c.save(); c.translate(x, y - 2); drawItemIcon(c, ch === '%' ? 'cyanide' : 'twin', 20, t); c.restore();
      c.fillStyle = ch === '%' ? '#b05aff' : '#ffd84a'; c.font = `800 8px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(ch === '%' ? 'CURSED' : '15', x, y + 14);
    } else if (ch === '+') {
      safe(() => drawHeartPickup(c, { x, y: y - 2, amount: 2, t: 1, ph: 0 }, t));
      c.fillStyle = '#ffd84a'; c.font = `800 8px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('6', x, y + 14);
    } else if (ch === '!' || ch === 'q') {
      safe(() => drawRotPickup(c, { kind: ch === '!' ? 'cleanse' : 'reroll', x, y, t: 1, ph: 0, cost: ch === '!' ? 8 : 5, spin: 0 }, t, 99));
    } else if (ch === 's') {
      c.fillStyle = '#3a6a3a'; c.fillRect(x - 13, y - 6, 26, 14); c.fillStyle = '#ffd23a'; c.fillRect(x - 10, y - 4, 6, 8); c.fillStyle = '#e83a50'; c.fillRect(x - 2, y - 4, 6, 8); c.fillStyle = '#3aa0ff'; c.fillRect(x + 6, y - 4, 5, 8);
    } else if (ch === 'p') {
      c.fillStyle = '#d8b46a'; ell(c, x, y, 14, 9); c.fill(); c.strokeStyle = '#5a3a10'; c.lineWidth = 1.4; ell(c, x, y, 14, 9); c.stroke();
      c.fillStyle = '#5a3a10'; c.font = `800 7px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(x < RW / 2 ? 'EISER' : 'PLATE', x, y + 0.5);
    }
  }
  const DYN_DRAW = (c, o, room, def, t) => {
    if (o.type === 'urn') drawUrn(c, o, def, t);
    else if (o.type === 'egg') drawEggs(c, o, def, t);
    else if (o.type === 'chest') drawChest(c, o, t);
    else if (o.type === 'altar') drawAltar(c, o, room, t);
    else if (o.type === 'slot') drawSlot(c, o, t);
    else if (o.type === 'book') drawBookstand(c, o, t);
    else if (o.type === 'gold') drawGold(c, o, t);
    else if (DYN9[o.type]) DYN9[o.type](c, o, room, t);
  };
  function tileAtlas(set) {
    if (ATLAS[set]) return ATLAS[set];
    const def = previewDef(set), out = {};
    const chars = TILES.map((t) => t[0]);
    const K = 2;
    for (let b = 0; b < chars.length; b += 20) {
      const batch = chars.slice(b, b + 20), g = EMPTY.split(''), pos = {};
      batch.forEach((ch, i) => { const c = 1 + (i % 5) * 2, r = 1 + Math.floor(i / 5) * 2; if (ch !== '.') g[r * GW + c] = ch; pos[ch] = [c, r]; });
      const room = new Room(0, 0, 0); room.type = 'hall';
      safe(() => withScene(room, def, () => {
        room.build(rowsOf(g.join('')), def, {});
        room.decals = [];
        buildRoomCache(room, def, K);
        const c = room.cacheCtx, t = 0;
        for (const o of room.obs) safe(() => DYN_DRAW(c, o, room, def, t));
        safe(() => { if (room.belts.length) drawBelts(c, room, t); });
        safe(() => drawFloorThings(c, room, t));
        for (const k of room.carts) safe(() => drawCart(c, k, room));
        for (const p of room.pickups) if (p.kind === 'heart') safe(() => drawHeartPickup(c, p, t));
        for (const r of room.rots) safe(() => drawRot(c, r, t));
        for (const ch of batch) if ('$+%!qsp'.includes(ch)) { const [cc, rr] = pos[ch]; safe(() => pieceArt(c, ch, (cc + 0.5) * T, (rr + 0.5) * T, t)); }
        for (const ch of batch) {
          const [cc, rr] = pos[ch], S = 48, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
          const x0 = (WALL + cc * T - 3) * K, y0 = (WALL + rr * T - 7) * K;
          cv.getContext('2d').drawImage(room.cache, x0, y0, (T + 6) * K, (T + 6) * K, 0, 0, S, S);
          out[ch] = cv;
        }
      }));
    }
    ATLAS[set] = out;
    return out;
  }
  function paintBrushIcon(c, size, br, set) {
    c.fillStyle = '#17110e'; c.fillRect(0, 0, size, size);
    if (br.k === 'tile') {
      const a = tileAtlas(set)[br.ch];
      if (a) c.drawImage(a, 0, 0, size, size);
      return;
    }
    if (br.t === 'sn') {
      const sp = snakeSprite(br.p.k, br.p.g);
      c.drawImage(sp, 2, 2, size - 4, size - 4);
      return;
    }
    c.save(); c.translate(size / 2, size / 2); const s = size / 44; c.scale(s, s);
    const e = Object.assign({ c: 3, r: 3 }, br.p);
    if (br.t === 'tt' || br.t === 'bx' || br.t === 'ns' || br.t === 'lv' || br.t === 'gt' || br.t === 'bm' || br.t === 'pd' || br.t === 'sg') ART[br.t](c, 0, 2, e, 0.4, 'icon');
    else if (br.t === 'fb') { const e2 = Object.assign({}, e, { n: 2 }); ART.fb(c, 0, 0, e2, 0.6, 'icon'); }
    else if (br.t === 'sw') ART.sw(c, 0, 0, e, 0.3, 'icon');
    else ART[br.t](c, 0, 0, e, 0.5, 'icon');
    c.restore();
  }

  /* ---- the editor state */
  const Maker = {
    open: false, view: 'hub', built: false, M: null, fi: 0, rx: 4, ry: 4,
    tool: 'brush', brush: { k: 'tile', ch: '#' }, bp: {}, mirX: false, mirY: false, showGrid: true,
    undo: [], redo: [], cat: 'blocks', pane: 'paint', q: '', sel: null, hover: null, stroke: null, clip: null,
    saveT: 0, pv: null, pvKey: '', cv: null, ctx: null, s: 1, raf: 0, last: 0, probs: [], seenBr: {},
  };
  MK.Maker = Maker;
  for (const t in ENT_PARAMS) Maker.bp[t] = entDefaults(t);

  const F_ = () => Maker.M.floors[Maker.fi];
  const R_ = () => roomAt(F_(), Maker.rx, Maker.ry) || F_().rooms[0];
  function toast(msg) {
    const t = $('mkToast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(Maker._toastT); Maker._toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---- undo, redo and saving */
  function snap() { return JSON.stringify(Maker.M); }
  function pushUndo() { Maker.undo.push(snap()); if (Maker.undo.length > 120) Maker.undo.shift(); Maker.redo.length = 0; syncUndo(); }
  function restore(s) {
    const fi = Maker.fi, rx = Maker.rx, ry = Maker.ry;
    Maker.M = JSON.parse(s);
    Maker.fi = Math.min(fi, Maker.M.floors.length - 1);
    if (!roomAt(F_(), rx, ry)) { const r0 = F_().rooms[0]; Maker.rx = r0.x; Maker.ry = r0.y; }
    Maker.sel = null;
    changed(true);
  }
  function doUndo() { if (!Maker.undo.length) return; Maker.redo.push(snap()); restore(Maker.undo.pop()); syncUndo(); toast('Undone'); }
  function doRedo() { if (!Maker.redo.length) return; Maker.undo.push(snap()); restore(Maker.redo.pop()); syncUndo(); toast('Redone'); }
  function syncUndo() { const u = $('mkUndo'), r = $('mkRedo'); if (u) u.disabled = !Maker.undo.length; if (r) r.disabled = !Maker.redo.length; }
  function scheduleSave() {
    clearTimeout(Maker.saveT);
    const s = $('mkSaved'); if (s) s.textContent = 'Editing';
    Maker.saveT = setTimeout(saveNow, 700);
  }
  function saveNow() {
    clearTimeout(Maker.saveT);
    if (!Maker.M) return;
    const ok = Store.put(Maker.M);
    const s = $('mkSaved'); if (s) s.textContent = ok ? 'Saved' : 'Not saved: storage full';
    const rooms = Maker.M.floors.reduce((n, F) => n + F.rooms.length, 0);
    if (ok && rooms >= 5) Meta.max('mapsMade', Store.list.length);
  }
  // after any change: redraw what depends on it
  function changed(all) {
    Maker.pvKey = '';
    if (all) { renderPanes(); } else { renderFloor(); renderRoomPane(); }
    renderCrumb(); validateSoon();
    scheduleSave();
  }

  /* ---- building the screen */
  function build() {
    if (Maker.built) return;
    Maker.built = true;
    const sec = el('section', 'panel'); sec.id = 'maker'; sec.hidden = true; sec.setAttribute('aria-label', 'Map Maker');
    sec.style.cssText = 'padding:0;display:block;gap:0;align-items:stretch;justify-content:flex-start';
    sec.innerHTML = `
<div class="mkh" id="mkHub">
  <div class="mkh-in">
    <div class="mkh-head"><div><p class="kick">Build it, test it, send it</p><h2>Map Maker</h2></div><button class="btn" id="mkHubBack" type="button">Back</button></div>
    <div class="mkh-acts">
      <button class="mkh-act" id="mkNew" type="button"><span class="ai">${IC.plus}</span><b>New map</b><span>One empty start room. The rest is yours.</span></button>
      <button class="mkh-act alt" id="mkPasteOpen" type="button"><span class="ai">${IC.paste2}</span><b>Paste a code</b><span>Play or edit a map somebody sent you.</span></button>
    </div>
    <div class="mkh-paste" id="mkPasteBox" hidden>
      <textarea class="mk-in mk-code" id="mkPasteTxt" spellcheck="false" placeholder="BITMAP1..." aria-label="Map code"></textarea>
      <div class="row" style="justify-content:flex-start"><button class="mk-btn gold" id="mkPasteGo" type="button">Read code</button><button class="mk-btn" id="mkPasteClip" type="button">From clipboard</button></div>
      <p class="mkh-msg" id="mkPasteMsg" aria-live="polite"></p>
      <div id="mkPastePrev"></div>
    </div>
    <div class="mkh-sec"><h3>Your maps</h3><span id="mkCount"></span></div>
    <div class="mkh-list" id="mkMine"></div>
    <div class="mkh-sec"><h3>Examples</h3><span>Play them, or edit a copy</span></div>
    <div class="mkh-list" id="mkEx"></div>
  </div>
</div>
<div class="mke" id="mkEd" hidden>
  <header class="mke-top">
    <span id="mkTopL"></span>
    <div class="mke-title"><small>Map Maker <em id="mkSaved">Saved</em></small><input id="mkName" maxlength="${LIMITS.name}" aria-label="Map name" spellcheck="false"></div>
    <span id="mkTopR" style="display:flex;gap:6px;align-items:center"></span>
  </header>
  <div class="mke-body">
    <div class="mke-stage">
      <div class="mke-crumb" id="mkCrumb"></div>
      <div class="mke-cvw" id="mkCvw"><canvas id="mkCv" aria-label="Room editor"></canvas></div>
      <div class="mke-tools" id="mkTools"></div>
    </div>
    <div class="mke-grip" id="mkGrip" role="separator" aria-orientation="horizontal" aria-label="Drag to resize the panel" tabindex="0"></div>
    <div class="mke-tabs" id="mkTabs" role="tablist">
      <button type="button" role="tab" data-p="paint">Paint</button><button type="button" role="tab" data-p="room">Room</button><button type="button" role="tab" data-p="floor">Floor</button><button type="button" role="tab" data-p="map">Map</button>
    </div>
    <div class="mke-pane" id="mkPanePaint" data-pane="paint"></div>
    <div class="mke-pane" id="mkPaneRoom" data-pane="room"></div>
    <div class="mke-pane" id="mkPaneFloor" data-pane="floor"></div>
    <div class="mke-pane" id="mkPaneMap" data-pane="map"></div>
  </div>
</div>
<div class="mk-dlg" id="mkDlg" hidden><div class="mk-dlg-in" id="mkDlgIn" role="dialog" aria-modal="true"></div></div>
<div class="mk-toast" id="mkToast" aria-live="polite"></div>`;
    $('app').appendChild(sec);
    // hub
    $('mkHubBack').addEventListener('click', (e) => { e.preventDefault(); Maker.close(); });
    $('mkNew').addEventListener('click', (e) => { e.preventDefault(); const M = newMap(); Store.put(M); edit(M); });
    $('mkPasteOpen').addEventListener('click', (e) => { e.preventDefault(); const b = $('mkPasteBox'); b.hidden = !b.hidden; if (!b.hidden) $('mkPasteTxt').focus(); });
    $('mkPasteGo').addEventListener('click', (e) => { e.preventDefault(); readPasted($('mkPasteTxt').value); });
    $('mkPasteClip').addEventListener('click', async (e) => {
      e.preventDefault();
      try { const t = await navigator.clipboard.readText(); $('mkPasteTxt').value = t; readPasted(t); }
      catch (err) { $('mkPasteMsg').textContent = 'The clipboard is closed here. Paste the code in the box.'; }
    });
    $('mkPasteTxt').addEventListener('paste', () => setTimeout(() => { if (looksLikeCode($('mkPasteTxt').value)) readPasted($('mkPasteTxt').value); }, 0));
    // editor top bar
    const L = $('mkTopL'), R = $('mkTopR');
    L.appendChild(btn('ic', IC.back, 'Back to your maps', () => { saveNow(); showHub(); }));
    const bu = btn('ic', IC.undo, 'Undo (Ctrl Z)', doUndo); bu.id = 'mkUndo';
    const brd = btn('ic', IC.redo, 'Redo (Ctrl Y)', doRedo); brd.id = 'mkRedo';
    const chk = el('button', 'mke-chk', ''); chk.type = 'button'; chk.id = 'mkChk'; chk.addEventListener('click', (e) => { e.preventDefault(); setPane('map'); const p = $('mkProbs'); if (p) p.scrollIntoView({ block: 'center' }); });
    R.append(bu, brd, chk,
      btn('', IC.share + '<span class="lbl">Share</span>', 'Share code', openShare),
      btn('', IC.test + '<span class="lbl">Room</span>', 'Test from this room', () => play({ floor: Maker.fi, room: true })),
      btn('pri', IC.play + '<span class="lbl">Test</span>', 'Test the whole map', () => play({ floor: 0 })));
    $('mkName').addEventListener('input', () => { Maker.M.name = $('mkName').value.slice(0, LIMITS.name); scheduleSave(); });
    $('mkName').addEventListener('change', () => { pushUndo(); Maker.M.name = $('mkName').value.trim() || 'Untitled map'; $('mkName').value = Maker.M.name; scheduleSave(); });
    // tools
    const tools = $('mkTools');
    for (const [id, label, key] of TOOLS) {
      const b = btn('', IC[id] + `<span class="tl">${label}</span><kbd>${key}</kbd>`, `${label} (${key})`, () => setTool(id)); b.dataset.tool = id; tools.appendChild(b);
    }
    tools.appendChild(el('span', 'sep'));
    const mx = btn('', IC.mirX + '<span class="tl">Mirror</span><kbd>X</kbd>', 'Mirror left and right (X)', () => { Maker.mirX = !Maker.mirX; syncTools(); }); mx.dataset.mir = 'x';
    const my = btn('', IC.mirY + '<span class="tl">Mirror</span><kbd>Y</kbd>', 'Mirror top and bottom (Y)', () => { Maker.mirY = !Maker.mirY; syncTools(); }); my.dataset.mir = 'y';
    const gr = btn('', IC.grid + '<span class="tl">Grid</span><kbd>G</kbd>', 'Show the grid (G)', () => { Maker.showGrid = !Maker.showGrid; syncTools(); }); gr.dataset.mir = 'g';
    tools.append(mx, my, gr);
    // tabs
    $('mkTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) { e.preventDefault(); setPane(b.dataset.p); } });
    // canvas
    Maker.cv = $('mkCv'); Maker.ctx = Maker.cv.getContext('2d');
    const cv = Maker.cv;
    cv.addEventListener('pointerdown', gDown);
    cv.addEventListener('pointermove', gMove);
    cv.addEventListener('pointerup', gUp);
    cv.addEventListener('pointercancel', gUp);
    cv.addEventListener('pointerleave', () => { Maker.hover = null; renderCrumb(); });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    try { new ResizeObserver(() => layoutCanvas()).observe($('mkCvw')); } catch (e) { window.addEventListener('resize', layoutCanvas); }
    initGrip();
    // dialog closes on the backdrop and Escape
    $('mkDlg').addEventListener('pointerdown', (e) => { if (e.target.id === 'mkDlg') closeDlg(); });
    // keys: the Map Maker gets them first, the game never sees them while it is open
    window.addEventListener('keydown', onKey, true);
  }

  /* ---- views */
  Maker.openHub = function () {
    build(); Store.load();
    UI.hidePanels(); UI.hideOverlays();
    this.open = true;
    $('maker').hidden = false;
    if (!Save.data.seen.maker) { Save.data.seen.maker = 1; Save.store(); }
    showHub();
  };
  Maker.close = function () {
    saveNow();
    this.open = false; stopLoop();
    $('maker').hidden = true; closeDlg();
    UI.refresh(); UI.show('menu');
  };
  Maker.reopen = function () {
    build();
    this.open = true;
    UI.hidePanels();
    $('maker').hidden = false;
    if (RTM.back === 'editor' && this.M) showEditor(); else showHub();
  };
  function showHub() {
    stopLoop();
    Maker.view = 'hub';
    $('mkHub').hidden = false; $('mkEd').hidden = true;
    renderHub();
  }
  function showEditor() {
    Maker.view = 'editor';
    $('mkHub').hidden = true; $('mkEd').hidden = false;
    renderPanes(); syncTools(); syncUndo();
    requestAnimationFrame(() => { layoutCanvas(); startLoop(); });
  }
  function edit(M) {
    Maker.M = cloneMap(M); Maker.fi = 0; Maker.undo = []; Maker.redo = []; Maker.sel = null;
    const st = Maker.M.floors[0].rooms.find((r) => r.t === 'start') || Maker.M.floors[0].rooms[0];
    Maker.rx = st.x; Maker.ry = st.y; Maker.pvKey = '';
    if (!Maker.pane || Maker.pane === 'floor') Maker.pane = 'paint';
    showEditor();
  }
  Maker.edit = edit;

  /* ---- the hub */
  function mapStats(M) {
    const rooms = M.floors.reduce((n, F) => n + F.rooms.length, 0);
    const snakes = M.floors.reduce((n, F) => n + F.rooms.reduce((m, R) => m + R.e.filter((e) => e.t === 'sn').length, 0), 0);
    return { rooms, snakes, floors: M.floors.length };
  }
  function paintFloorThumb(c, w, h, F, cur) {
    c.fillStyle = '#120d0b'; c.fillRect(0, 0, w, h);
    if (!F || !F.rooms.length) return;
    let x0 = 99, x1 = -99, y0 = 99, y1 = -99;
    for (const R of F.rooms) { x0 = Math.min(x0, R.x); x1 = Math.max(x1, R.x); y0 = Math.min(y0, R.y); y1 = Math.max(y1, R.y); }
    const cw = Math.min((w - 8) / (x1 - x0 + 1), ((h - 8) / (y1 - y0 + 1)) * 1.2), ch = cw / 1.2;
    const ox = (w - cw * (x1 - x0 + 1)) / 2, oy = (h - ch * (y1 - y0 + 1)) / 2;
    for (const R of F.rooms) {
      const x = ox + (R.x - x0) * cw, y = oy + (R.y - y0) * ch;
      for (const s of doorsOf(F, R)) { const v = SIDES[s]; c.fillStyle = 'rgba(236,226,212,.35)'; c.fillRect(x + cw / 2 + v[0] * cw / 2 - 1, y + ch / 2 + v[1] * ch / 2 - 1, 2, 2); }
      c.fillStyle = RT[R.t] ? RT[R.t].col : '#888';
      c.globalAlpha = 0.85; c.fillRect(x + 1, y + 1, cw - 2, ch - 2); c.globalAlpha = 1;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 2, y + 2, cw - 4, ch - 4);
      if (cur && R.x === cur.x && R.y === cur.y) { c.strokeStyle = '#e3a54a'; c.lineWidth = 1.5; c.strokeRect(x + 0.75, y + 0.75, cw - 1.5, ch - 1.5); }
    }
  }
  function mapCard(it, ex) {
    const M = it.map || it, st = mapStats(M);
    const card = el('div', 'mkh-card' + (ex ? ' ex' : ''));
    const cv = canvasIcon(96, (c) => paintFloorThumb(c, 96, 72, M.floors[0]));
    cv.style.height = '72px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.height = Math.round(72 * dpr); safe(() => { const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); paintFloorThumb(c, 96, 72, M.floors[0]); });
    card.appendChild(cv);
    const ci = el('div', 'ci');
    ci.appendChild(el('b', null, esc(M.name)));
    ci.appendChild(el('small', null, esc(`${M.author ? 'by ' + M.author + '  ·  ' : ''}${st.floors > 1 ? st.floors + ' floors, ' : ''}${st.rooms} rooms, ${st.snakes} snakes`)));
    ci.appendChild(el('p', null, esc(M.desc || (ex ? '' : 'Last changed ' + new Date(it.t || Date.now()).toLocaleDateString()))));
    card.appendChild(ci);
    const cb = el('div', 'cb');
    cb.appendChild(btn('pri', IC.play + 'Play', 'Play ' + M.name, () => playMap(M, 'hub')));
    if (ex) cb.appendChild(btn('gold', IC.edit + 'Edit a copy', 'Edit a copy', () => { const C = cloneMap(M); C.id = uid(); C.name = M.name + ' (copy)'; Store.put(C); edit(C); }));
    else {
      cb.appendChild(btn('gold', IC.edit + 'Edit', 'Edit ' + M.name, () => edit(M)));
      cb.appendChild(btn('ic', IC.share, 'Share ' + M.name, () => { Maker.M = cloneMap(M); openShare(); }));
      cb.appendChild(btn('ic', IC.copy, 'Duplicate', () => { const C = cloneMap(M); C.id = uid(); C.name = (M.name + ' (copy)').slice(0, LIMITS.name); Store.put(C); renderHub(); }));
      const del = btn('ic red', IC.trash, 'Delete', () => {
        if (!del.classList.contains('on')) { del.classList.add('on'); toast('Tap delete again to remove it for good.'); setTimeout(() => del.classList.remove('on'), 2600); return; }
        Store.del(M.id); renderHub();
      });
      cb.appendChild(del);
    }
    card.appendChild(cb);
    return card;
  }
  function renderHub() {
    Store.load();
    const mine = $('mkMine'); mine.textContent = '';
    $('mkCount').textContent = Store.list.length ? `${Store.list.length} saved in this browser` : '';
    if (!Store.list.length) mine.appendChild(el('div', 'mkh-empty', 'Nothing here yet. Start a new map, edit a copy of an example, or paste a code somebody sent you. Maps live in this browser: share the code to keep one safe.'));
    for (const it of Store.list) mine.appendChild(mapCard(it, false));
    const ex = $('mkEx'); ex.textContent = '';
    for (const M of EXAMPLES()) ex.appendChild(mapCard(M, true));
  }
  async function readPasted(txt) {
    const msg = $('mkPasteMsg'), prev = $('mkPastePrev');
    prev.textContent = '';
    if (!String(txt || '').trim()) { msg.textContent = 'Paste a map code first.'; return; }
    msg.textContent = 'Reading...';
    try {
      const M = await decodeMap(txt);
      msg.textContent = '';
      const st = mapStats(M);
      const box = el('div', 'mk-prev');
      const cv = canvasIcon(110, (c) => paintFloorThumb(c, 110, 82, M.floors[0]));
      const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.height = Math.round(82 * dpr); safe(() => { const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); paintFloorThumb(c, 110, 82, M.floors[0]); });
      box.appendChild(cv);
      const info = el('div');
      info.innerHTML = `<b>${esc(M.name)}</b><div class="mk-stats"><span><b>${st.floors}</b>floor${st.floors === 1 ? '' : 's'}</span><span><b>${st.rooms}</b>rooms</span><span><b>${st.snakes}</b>snakes</span></div><p>${esc(M.author ? 'By ' + M.author + '. ' : '')}${esc(M.desc || '')}</p>`;
      const r = el('div', 'row'); r.style.cssText = 'justify-content:flex-start;margin-top:8px';
      r.append(btn('pri', IC.play + 'Play', 'Play it', () => { Meta.add('mapImports'); playMap(M, 'hub'); }),
        btn('gold', IC.edit + 'Save and edit', 'Save to your maps and edit', () => { Store.put(M); Meta.add('mapImports'); edit(M); }));
      info.appendChild(r);
      box.appendChild(info);
      prev.appendChild(box);
    } catch (e) { msg.textContent = codeError(e); }
  }

  /* ---- panes */
  function setPane(p) {
    const wide = window.matchMedia('(min-width: 980px)').matches;
    if (p === 'floor' && wide) p = 'paint';
    Maker.pane = p;
    for (const b of $('mkTabs').querySelectorAll('[data-p]')) b.setAttribute('aria-selected', b.dataset.p === p ? 'true' : 'false');
    for (const pn of document.querySelectorAll('#mkEd .mke-pane')) pn.classList.toggle('on', pn.dataset.pane === p);
  }
  function renderPanes() {
    if (!Maker.M) return;
    $('mkName').value = Maker.M.name;
    renderPaint(); renderRoomPane(); renderFloor(); renderMapPane(); renderCrumb(); validateSoon();
    setPane(Maker.pane || 'paint');
  }
  function syncTools() {
    for (const b of $('mkTools').querySelectorAll('[data-tool]')) b.classList.toggle('on', b.dataset.tool === Maker.tool);
    for (const b of $('mkTools').querySelectorAll('[data-mir]')) b.classList.toggle('on', b.dataset.mir === 'x' ? Maker.mirX : b.dataset.mir === 'y' ? Maker.mirY : Maker.showGrid);
    Maker.cv && (Maker.cv.style.cursor = Maker.tool === 'move' ? 'pointer' : 'crosshair');
  }
  function setTool(id) { Maker.tool = id; if (id !== 'move') Maker.sel = null; syncTools(); renderInspector(); }

  /* ---- the palette */
  function brushList(cat) {
    const out = [];
    if (cat === 'snakes') { for (const k of SNAKES) out.push({ k: 'ent', t: 'sn', p: { k, g: 0, tr: '' }, name: snakeName(k), id: 'sn:' + k }); return out; }
    for (const [ch, id, name, c] of TILES) if (c === cat && ch !== '.') out.push({ k: 'tile', ch, name, id: 't:' + ch });
    if (cat === 'blocks') out.unshift({ k: 'tile', ch: '.', name: 'Floor', id: 't:.' });
    for (const t of ENT_ORDER[cat] || []) {
      if (t === 'tp' || t === 'lv' || t === 'gt' || t === 'pl') { for (let ch = 0; ch < 4; ch++) out.push({ k: 'ent', t, p: Object.assign({}, Maker.bp[t], { ch }), name: `${ENTS[t].name} ${CH_NAMES[ch]}`, id: `${t}:${ch}` }); }
      else if (t === 'sk') { for (let g = 0; g < 2; g++) out.push({ k: 'ent', t, p: { g }, name: `Spikes ${g ? 'B' : 'A'}`, id: `sk:${g}` }); }
      else out.push({ k: 'ent', t, p: Maker.bp[t], name: ENTS[t].name, id: t, isNew: true });
    }
    return out;
  }
  const brushId = (b) => (b.k === 'tile' ? 't:' + b.ch : b.t === 'sn' ? 'sn:' + b.p.k : (b.t === 'tp' || b.t === 'lv' || b.t === 'gt' || b.t === 'pl') ? `${b.t}:${b.p.ch || 0}` : b.t === 'sk' ? `sk:${b.p.g || 0}` : b.t);
  function brushName(b) {
    if (b.k === 'tile') return TILE[b.ch].name;
    if (b.t === 'sn') return snakeName(b.p.k);
    if (b.t === 'tp' || b.t === 'lv' || b.t === 'gt' || b.t === 'pl') return `${ENTS[b.t].name} ${CH_NAMES[b.p.ch || 0]}`;
    return ENTS[b.t].name;
  }
  function brushDesc(b) { return b.k === 'tile' ? TILE[b.ch].desc : b.t === 'sn' ? snakeDesc(b.p.k) : ENTS[b.t].desc; }
  function snakeDesc(k) {
    const box = document.querySelector(`#tab-snakes canvas[data-snake="${k}"]`);
    const sp = box && box.parentElement && box.parentElement.querySelector('figcaption span:last-child');
    return (sp && sp.textContent) || `${snakeName(k)}. It bites.`;
  }
  function renderPaint() {
    const pane = $('mkPanePaint'); pane.textContent = '';
    const cats = el('div', 'mk-cats');
    for (const [id, label] of CATS) { const b = el('button', Maker.cat === id && !Maker.q ? 'on' : '', esc(label)); b.type = 'button'; b.addEventListener('click', (e) => { e.preventDefault(); Maker.cat = id; Maker.q = ''; renderPaint(); }); cats.appendChild(b); }
    pane.appendChild(cats);
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search pieces'; q.value = Maker.q; q.setAttribute('aria-label', 'Search pieces'); q.style.marginBottom = '8px';
    q.addEventListener('input', () => { Maker.q = q.value.trim().toLowerCase(); fillPal(); });
    pane.appendChild(q);
    const pal = el('div', 'mk-pal'); pal.id = 'mkPal'; pane.appendChild(pal);
    const ins = el('div'); ins.id = 'mkIns'; pane.appendChild(ins);
    fillPal(); renderInspector();
  }
  function fillPal() {
    const pal = $('mkPal'); if (!pal) return;
    pal.textContent = '';
    let list;
    if (Maker.q) { list = []; const seen = new Set(); for (const [id] of CATS) for (const b of brushList(id)) if (!seen.has(b.id) && (b.name.toLowerCase().includes(Maker.q) || (b.k === 'ent' && ENTS[b.t].desc.toLowerCase().includes(Maker.q)))) { seen.add(b.id); list.push(b); } }
    else list = brushList(Maker.cat);
    const set = F_().set, cur = brushId(Maker.brush);
    for (const b of list) {
      const e = el('button', 'mk-br' + (b.id === cur ? ' on' : '') + (b.isNew && !Maker.seenBr[b.id] ? ' new' : '')); e.type = 'button'; e.title = b.name;
      e.appendChild(canvasIcon(42, (c, s) => paintBrushIcon(c, s, b, set)));
      e.appendChild(el('span', null, esc(b.name)));
      e.addEventListener('click', (ev) => { ev.preventDefault(); Maker.seenBr[b.id] = 1; pickBrush(b); });
      pal.appendChild(e);
    }
    if (!list.length) pal.appendChild(el('p', 'mk-p', 'Nothing by that name.'));
  }
  function pickBrush(b) {
    Maker.brush = b.k === 'tile' ? { k: 'tile', ch: b.ch } : { k: 'ent', t: b.t, p: Object.assign({}, b.p) };
    if (b.k === 'ent' && b.t !== 'sn') Maker.bp[b.t] = Object.assign({}, Maker.bp[b.t], b.p);
    if (Maker.tool !== 'fill' && Maker.tool !== 'box') Maker.tool = 'brush';
    Maker.sel = null;
    syncTools(); fillPal(); renderInspector();
  }
  // the card under the palette: the brush, or the selected piece in the room
  function renderInspector() {
    const box = $('mkIns'); if (!box) return;
    box.textContent = '';
    const R = R_();
    const selE = Maker.sel ? entAt(R, Maker.sel.c, Maker.sel.r) : null;
    const target = selE ? { k: 'ent', t: selE.t, p: selE } : Maker.brush;
    const card = el('div', 'mk-card');
    const hd = el('div', 'hd');
    hd.appendChild(canvasIcon(44, (c, s) => paintBrushIcon(c, s, target.k === 'ent' ? { k: 'ent', t: target.t, p: target.p } : target, F_().set)));
    const nm = el('div'); nm.innerHTML = `<small>${selE ? `Selected at ${colName(selE.c)}${selE.r + 1}` : Maker.tool === 'erase' ? 'Eraser' : 'Painting with'}</small><b>${esc(Maker.tool === 'erase' && !selE ? 'Floor' : brushName(target))}</b>`;
    hd.appendChild(nm); card.appendChild(hd);
    card.appendChild(el('p', null, esc(brushDesc(target))));
    if (target.k === 'ent') {
      const t = target.t, obj = selE || Maker.bp[t] && t !== 'sn' ? (selE || Maker.bp[t]) : Maker.brush.p;
      const apply = (k, v) => {
        const pn = $('mkPanePaint'), keep = pn ? pn.scrollTop : 0;
        if (selE) { pushUndo(); selE[k] = v; changed(); }
        else { if (t === 'sn') Maker.brush.p[k] = v; else { Maker.bp[t][k] = v; Maker.brush.p[k] = v; } fillPal(); }
        renderInspector();
        if (pn) pn.scrollTop = keep;
      };
      for (const p of ENT_PARAMS[t]) card.appendChild(paramControl(p, obj, apply));
      if (selE) {
        const r2 = el('div', 'mk-acts'); r2.style.marginTop = '8px';
        r2.append(btn('', IC.brush + 'Use as brush', 'Paint with these settings', () => { const p = Object.assign({}, selE); delete p.c; delete p.r; delete p.t; pickBrush({ k: 'ent', t: selE.t, p }); }),
          btn('red', IC.trash + 'Remove', 'Remove this piece', () => { pushUndo(); R.e = R.e.filter((e) => e !== selE); Maker.sel = null; changed(); renderInspector(); }));
        card.appendChild(r2);
      }
    }
    if (Maker.tool === 'move' && !selE) card.appendChild(el('div', 'mk-note', 'Select: tap a piece to change its settings, drag it to move it. Delete removes it.'));
    box.appendChild(card);
  }
  const colName = (c) => 'ABCDEFGHIJK'[c];
  function paramControl(p, obj, apply) {
    const v = obj[p.k] != null ? obj[p.k] : p.def;
    if (p.kind === 'seg') return row(p.label, seg(p.opts, v, (nv) => apply(p.k, nv)));
    if (p.kind === 'col') return row(p.label, seg(CH_NAMES.map((n, i) => [i, n, `<i style="background:${CH_COLS[i]}"></i>`]), v, (nv) => apply(p.k, nv)));
    if (p.kind === 'dir4') return row(p.label, seg([[6, 'Up'], [0, 'Right'], [2, 'Down'], [4, 'Left']], v, (nv) => apply(p.k, nv)));
    if (p.kind === 'dir8' || p.kind === 'dir8a') {
      const opts = [[6, 'N'], [7, 'NE'], [0, 'E'], [1, 'SE'], [2, 'S'], [3, 'SW'], [4, 'W'], [5, 'NW']];
      if (p.kind === 'dir8a') opts.push([8, 'At you']);
      return row(p.label, seg(opts, v, (nv) => apply(p.k, nv)));
    }
    if (p.kind === 'text') {
      const ta = el(p.opts > 50 ? 'textarea' : 'input', 'mk-in'); ta.maxLength = p.opts; ta.value = v || ''; if (p.opts > 50) ta.rows = p.opts > 150 ? 4 : 2; ta.spellcheck = true;
      const cnt = el('em', 'mk-cnt', `${(v || '').length}/${p.opts}`);
      ta.addEventListener('input', () => { cnt.textContent = `${ta.value.length}/${p.opts}`; });
      ta.addEventListener('change', () => apply(p.k, ta.value.slice(0, p.opts)));
      const f = field(p.label, ta); f.firstChild.appendChild(cnt); return f;
    }
    if (p.kind === 'sel') return field(p.label, selectOf(p.opts, v, (nv) => apply(p.k, nv)));
    if (p.kind === 'snake') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => c.drawImage(snakeSprite(v), 0, 0, s, s)));
      b.appendChild(el('span', null, esc(snakeName(v))));
      b.addEventListener('click', (e) => { e.preventDefault(); pickSnake(v, (k) => apply(p.k, k)); });
      return row(p.label, b);
    }
    if (p.kind === 'item') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => { c.translate(s / 2, s / 2); if (v === 'rand' || v === 'rare') { c.fillStyle = v === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 22px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, v, s * 0.8, 1); }));
      b.appendChild(el('span', null, esc(v === 'rand' ? 'Random powerup' : v === 'rare' ? 'Random legendary' : ITEMS[v].name)));
      b.addEventListener('click', (e) => { e.preventDefault(); pickItem(v, true, (id) => apply(p.k, id)); });
      return row(p.label, b);
    }
    return el('div');
  }

  /* ---- the room pane */
  function renderRoomPane() {
    const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const F = F_(), R = R_();
    pane.appendChild(el('h4', 'mk-h', `Room ${colName(R.x)}${R.y + 1} on floor ${Maker.fi + 1}`));
    const types = el('div', 'mk-types');
    for (const [id, name, , col] of RTYPES) {
      const b = el('button', R.t === id ? 'on' : '', TYPE_ICON(col) + esc(name)); b.type = 'button'; b.title = RT[id].desc;
      b.addEventListener('click', (e) => { e.preventDefault(); setType(R, id); });
      types.appendChild(b);
    }
    pane.appendChild(types);
    const rdesc = el('p', 'mk-p', esc(RT[R.t].desc)); rdesc.style.marginTop = '8px'; pane.appendChild(rdesc);
    const opt = el('div');
    const upd = (k, v) => { pushUndo(); R[k] = v; changed(); };
    if (R.t === 'fight') opt.appendChild(field('Modifier', selectOf(MODS, R.m, (v) => upd('m', v))));
    if (R.t === 'arena') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      const k = BOSSES.includes(R.b) ? R.b : 'mother';
      b.appendChild(canvasIcon(32, (c, s) => { const sp = bossSprite(k); c.drawImage(sp, 0, 0, sp.width, sp.height, -s * 0.4, 0, s * 1.8, s); }));
      b.appendChild(el('span', null, esc(bossName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); pickBoss(k, false, (v) => upd('b', v)); });
      opt.appendChild(row('Boss', b));
    }
    if (R.t === 'miniboss') {
      const k = MINIS.includes(R.b) ? R.b : (MINI_POOL[F.set] || MINI_POOL.cellar)[0];
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => c.drawImage(snakeSprite(k, true), 0, 0, s, s)));
      b.appendChild(el('span', null, esc(snakeName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); pickSnake(k, (v) => upd('b', v), MINIS); });
      opt.appendChild(row('Gold snake', b));
    }
    if (R.t === 'survival') opt.appendChild(row('Hold out', seg([[15, '15 s'], [20, '20 s'], [25, '25 s'], [30, '30 s'], [45, '45 s'], [60, '60 s']], R.n, (v) => upd('n', v))));
    if (R.t === 'shop') opt.appendChild(row('Store', seg([['', 'Random'], ['blue', 'Blue'], ['yellow', 'Yellow']], R.st, (v) => upd('st', v))));
    if (R.t === 'chest') opt.appendChild(row('Mimic', seg([[0, 'No'], [1, 'It bites']], R.mim, (v) => upd('mim', v))));
    if (R.t === 'boss') {
      const bk = F.boss !== 'auto' ? F.boss : setDef(F.set).boss;
      opt.appendChild(el('div', 'mk-note', `The lair boss is set per floor: <b>${esc(bossName(bk))}</b>. Change it under Floor.`));
      if (typeof BOSS_TPL10 !== 'undefined' && BOSS_TPL10[bk] && R.g === EMPTY) opt.appendChild(el('div', 'mk-note', 'This boss brings its own furniture while the room is empty.'));
    }
    if (FIXED[R.t]) opt.appendChild(el('div', 'mk-note', 'This room has a fixed layout. Painting here does nothing.'));
    if (R.t === 'gym') opt.appendChild(el('div', 'mk-note', 'Coach Larspel puts his stations and furniture on top of whatever you paint.'));
    if (NEEDS[R.t] && ![...NEEDS[R.t]].some((ch) => R.g.includes(ch))) opt.appendChild(el('div', 'mk-note', 'Missing its pieces. They go back in their usual spot when you play. Find them under Room pieces.'));
    pane.appendChild(opt);
    if (R.t !== 'start') pane.appendChild(row('Locked', seg([[0, 'Open'], [1, 'Needs a key']], R.lk, (v) => upd('lk', v))));
    pane.appendChild(row('Spike traps', seg([[1, 'Always on'], [0, 'Only in a fight']], R.ta, (v) => upd('ta', v))));
    // the four ways out
    pane.appendChild(el('h4', 'mk-h', 'Doors'));
    const doors = el('div', 'mk-doors');
    for (const [s, nm] of [['n', 'North'], ['e', 'East'], ['s', 'South'], ['w', 'West']]) {
      const o = neighbor(F, R, s), d = el('div', 'mk-door');
      d.appendChild(el('span', null, `${nm} <em>${o ? esc(RT[o.t].name) : 'no room'}</em>`));
      if (o) d.appendChild(seg([['o', 'Door'], ['w', 'Wall'], ['c', 'Crack']], edgeOf(F, R, s), (v) => { pushUndo(); setEdge(F, R, s, v); changed(); }));
      else if (R.x + SIDES[s][0] >= 0 && R.x + SIDES[s][0] < FW && R.y + SIDES[s][1] >= 0 && R.y + SIDES[s][1] < FH) d.appendChild(btn('gold', IC.plus + 'Add room', 'Add a room on this side', () => addRoom(R.x + SIDES[s][0], R.y + SIDES[s][1], true)));
      else d.appendChild(el('span', null, '<em>Edge of the map</em>'));
      doors.appendChild(d);
    }
    pane.appendChild(doors);
    pane.appendChild(el('p', 'mk-p', 'A crack is a hidden way: shoot the wall three times to open it. The side closer to the start holds the crack.')).style.marginTop = '6px';
    // what you can do with the whole room
    pane.appendChild(el('h4', 'mk-h', 'This room'));
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('', IC.layout + 'Game layout', 'Fill with a layout from the game', () => loadLayout(R)),
      btn('', IC.flipX + 'Flip', 'Flip left and right', () => flipRoom(R, true)),
      btn('', IC.flipY + 'Flip', 'Flip top and bottom', () => flipRoom(R, false)),
      btn('', IC.copy + 'Copy', 'Copy this room', () => { Maker.clip = JSON.stringify({ g: R.g, e: R.e, t: R.t, m: R.m, b: R.b, n: R.n }); toast('Room copied'); renderRoomPane(); }),
      btn('', IC.paste + 'Paste', 'Paste the copied room here', () => pasteRoom(R)),
      btn('', IC.erase + 'Clear', 'Clear this room', () => { pushUndo(); R.g = EMPTY; R.e = []; Maker.sel = null; changed(); toast('Room cleared'); }),
    );
    if (!Maker.clip) acts.children[4].disabled = true;
    pane.appendChild(acts);
    const del = btn('red', IC.trash + 'Delete room', 'Delete this room', () => {
      if (F.rooms.length <= 1) { toast('A floor needs at least one room.'); return; }
      if (!del.classList.contains('on')) { del.classList.add('on'); del.lastChild.textContent = 'Tap again to delete'; setTimeout(() => { del.classList.remove('on'); del.lastChild.textContent = 'Delete room'; }, 2600); return; }
      pushUndo(); F.rooms = F.rooms.filter((r) => r !== R); syncEdges(F);
      const nb = F.rooms[0]; Maker.rx = nb.x; Maker.ry = nb.y; changed(true);
    });
    del.innerHTML = IC.trash + '<span>Delete room</span>'; del.style.marginTop = '6px'; del.style.width = '100%';
    pane.appendChild(del);
    const st = { sn: 0, tr: 0, gd: 0, lt: 0 };
    for (const e of R.e) { const c = ENTS[e.t].cat; if (c === 'snakes') st.sn++; else if (c === 'traps') st.tr++; else if (c === 'gadgets' || c === 'text') st.gd++; else st.lt++; }
    const stats = el('div', 'mk-stats'); stats.style.marginTop = '10px';
    stats.innerHTML = `<span><b>${st.sn}</b>snakes</span><span><b>${st.tr}</b>traps</span><span><b>${st.gd}</b>gadgets</span><span><b>${st.lt}</b>loot</span>`;
    pane.appendChild(stats);
    pane.scrollTop = top;
  }
  function selectOf(opts, val, onPick) {
    const s = el('select', 'mk-in');
    for (const [v, label] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = label; if (v === val) o.selected = true; s.appendChild(o); }
    s.addEventListener('change', () => onPick(s.value));
    return s;
  }
  function setType(R, id) {
    if (R.t === id) return;
    const F = F_();
    pushUndo();
    if (id === 'start') for (const o of F.rooms) if (o !== R && o.t === 'start') o.t = 'hall';
    if (id === 'boss') for (const o of F.rooms) if (o !== R && o.t === 'boss') o.t = 'fight';
    if (R.t === 'start' && !F.rooms.some((o) => o !== R && o.t === 'start')) toast('The floor has no start now. Pick another room as start.');
    R.t = id;
    if (id === 'start') R.lk = 0;
    // a room type that needs its pieces gets them, on top of what is there
    const tpl = typeTemplate(id);
    if (tpl && (FIXED[id] || NEEDS[id])) {
      let g = R.g;
      for (let i = 0; i < GN; i++) {
        const ch = tpl[i]; if (ch === '.') continue;
        const c = i % GW, r = Math.floor(i / GW);
        if (FIXED[id]) { g = g.slice(0, i) + ch + g.slice(i + 1); continue; }
        if (g[i] !== '.' || entAt(R, c, r)) continue;
        g = g.slice(0, i) + ch + g.slice(i + 1);
      }
      if (FIXED[id]) { for (let i = 0; i < GN; i++) if (tpl[i] === '.') g = g.slice(0, i) + '.' + g.slice(i + 1); R.e = []; }
      R.g = g;
    }
    if (id === 'arena' && !BOSSES.includes(R.b)) R.b = 'mother';
    if (id === 'miniboss' && !MINIS.includes(R.b)) R.b = (MINI_POOL[F.set] || MINI_POOL.cellar)[0];
    changed(true);
  }
  function loadLayout(R) {
    const F = F_(), set = F.set;
    let pool;
    if (R.t === 'start') pool = [START_SETS[set] || START_SETS.cellar];
    else if (R.t === 'fight' || R.t === 'hall') pool = FIGHT_SETS[set] || FIGHT_SETS.cellar;
    else { const tp = typeTemplate(R.t); pool = tp ? [rowsOf(tp)] : FIGHT_SETS[set] || FIGHT_SETS.cellar; }
    Maker._lay = ((Maker._lay || 0) + 1) % pool.length;
    const tpl = pool[Maker._lay];
    pushUndo();
    const C = cleanRoom({ x: R.x, y: R.y, t: R.t, g: tpl.map((r) => (r + '...........').slice(0, GW)).join('').replace(/[12]/g, '.') });
    R.g = C.g; R.e = C.e;
    Maker.sel = null;
    changed();
    toast(`Layout ${Maker._lay + 1} of ${pool.length}`);
  }
  function flipEnt(e, x) {
    const n = Object.assign({}, e);
    if (x) n.c = GW - 1 - e.c; else n.r = GH - 1 - e.r;
    if ((e.t === 'jp' || e.t === 'sp') && e.d != null) n.d = (x ? MIRX : MIRY)[e.d];
    if (e.t === 'tt' && e.d != null && e.d < 8) n.d = (x ? MIRX : MIRY)[e.d];
    if (e.t === 'fb') { n.w = -(e.w || 1); n.a = (x ? MIRX : MIRY)[e.a || 0]; }
    return n;
  }
  function flipRoom(R, x) {
    pushUndo();
    let g = '';
    for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
      const sc = x ? GW - 1 - c : c, sr = x ? r : GH - 1 - r;
      let ch = R.g[sr * GW + sc];
      if (x && ch === '>') ch = '<'; else if (x && ch === '<') ch = '>';
      g += ch;
    }
    R.g = g; R.e = R.e.map((e) => flipEnt(e, x));
    Maker.sel = null;
    changed();
  }
  function pasteRoom(R) {
    if (!Maker.clip) return;
    pushUndo();
    const d = JSON.parse(Maker.clip);
    R.g = d.g; R.e = d.e.map((e) => Object.assign({}, e)); R.m = d.m || ''; R.b = d.b || ''; R.n = d.n || 25;
    if (d.t !== 'start' && d.t !== 'boss') R.t = d.t;
    changed(true); toast('Room pasted');
  }

  /* ---- the floor pane */
  function renderFloor() {
    const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const M = Maker.M, F = F_();
    pane.appendChild(el('h4', 'mk-h', 'Floors'));
    const fl = el('div', 'mk-floors');
    M.floors.forEach((_, i) => { const b = el('button', i === Maker.fi ? 'on' : '', String(i + 1)); b.type = 'button'; b.title = 'Floor ' + (i + 1); b.addEventListener('click', (e) => { e.preventDefault(); goFloor(i); }); fl.appendChild(b); });
    if (M.floors.length < LIMITS.floors) { const b = el('button', '', IC.plus); b.type = 'button'; b.title = 'Add a floor'; b.setAttribute('aria-label', 'Add a floor'); b.addEventListener('click', (e) => { e.preventDefault(); pushUndo(); M.floors.push(newFloor(M.floors.length, SETS[Math.min(M.floors.length, 4)])); goFloor(M.floors.length - 1); }); fl.appendChild(b); }
    pane.appendChild(fl);
    pane.appendChild(el('div', 'mk-key', '<span><i></i>Door</span><span><i class="w"></i>Wall</span><span><i class="c"></i>Crack</span>'));
    // the map of the floor: rooms, the gaps between them, and spots where a room fits
    const grid = el('div', 'mk-fg');
    grid.style.gridTemplateColumns = `repeat(${FW - 1}, minmax(0,1fr) 7px) minmax(0,1fr)`;
    const has = (x, y) => !!roomAt(F, x, y);
    for (let gy = 0; gy < FH * 2 - 1; gy++) {
      for (let gx = 0; gx < FW * 2 - 1; gx++) {
        const x = gx >> 1, y = gy >> 1, cellX = gx % 2 === 0, cellY = gy % 2 === 0;
        if (cellX && cellY) {
          const R = roomAt(F, x, y);
          if (R) {
            const b = el('button', 'mk-fc rm' + (x === Maker.rx && y === Maker.ry ? ' cur' : '') + (R.lk ? ' lk' : '')); b.type = 'button';
            b.title = `${RT[R.t].name} at ${colName(x)}${y + 1}`;
            const cv = document.createElement('canvas'); cv.width = 66; cv.height = 55; paintRoomThumb(cv.getContext('2d'), 66, 55, R);
            b.appendChild(cv); b.appendChild(el('b', null, RT[R.t].code));
            b.addEventListener('click', (e) => { e.preventDefault(); selectRoom(x, y); });
            grid.appendChild(b);
          } else {
            const near = Object.values(SIDES).some((v) => has(x + v[0], y + v[1]));
            const b = el('button', 'mk-fc' + (near ? ' add' : '')); b.type = 'button';
            if (near) { b.innerHTML = IC.plus; b.title = `Add a room at ${colName(x)}${y + 1}`; b.setAttribute('aria-label', b.title); b.addEventListener('click', (e) => { e.preventDefault(); addRoom(x, y, true); }); }
            else { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
            grid.appendChild(b);
          }
        } else if (!cellX && cellY) {
          const a = roomAt(F, x, y), o = roomAt(F, x + 1, y);
          const b = el('button', 'mk-fe v'); b.type = 'button';
          if (a && o) { const ed = edgeOf(F, a, 'e'); b.classList.add(ed === 'w' ? 'w' : ed === 'c' ? 'c' : 'o'); b.title = 'Door, wall or crack'; b.addEventListener('click', (e) => { e.preventDefault(); cycleEdge(a, 'e'); }); }
          else b.classList.add('no');
          grid.appendChild(b);
        } else if (cellX && !cellY) {
          const a = roomAt(F, x, y), o = roomAt(F, x, y + 1);
          const b = el('button', 'mk-fe h'); b.type = 'button';
          if (a && o) { const ed = edgeOf(F, a, 's'); b.classList.add(ed === 'w' ? 'w' : ed === 'c' ? 'c' : 'o'); b.title = 'Door, wall or crack'; b.addEventListener('click', (e) => { e.preventDefault(); cycleEdge(a, 's'); }); }
          else b.classList.add('no');
          grid.appendChild(b);
        } else grid.appendChild(el('span'));
      }
    }
    pane.appendChild(grid);
    pane.appendChild(el('p', 'mk-p', 'Tap + to add a room next to one. Tap a bar between two rooms: door, wall, crack.'));
    // the floor itself
    pane.appendChild(el('h4', 'mk-h', `Floor ${Maker.fi + 1}`));
    const nm = el('input', 'mk-in'); nm.maxLength = LIMITS.fname; nm.value = F.name; nm.placeholder = setName(F.set);
    nm.addEventListener('change', () => { pushUndo(); F.name = nm.value.trim(); changed(); });
    pane.appendChild(field('Name', nm));
    const sb = el('input', 'mk-in'); sb.maxLength = LIMITS.fsub; sb.value = F.sub; sb.placeholder = setDef(F.set).sub || '';
    sb.addEventListener('change', () => { pushUndo(); F.sub = sb.value.trim(); changed(); });
    pane.appendChild(field('Tagline', sb));
    pane.appendChild(field('Looks and snakes like', selectOf(SETS.map((s) => [s, setName(s)]), F.set, (v) => { pushUndo(); F.set = v; Maker.pvKey = ''; changed(true); })));
    const bk = F.boss !== 'auto' ? F.boss : setDef(F.set).boss;
    const bb = el('button', 'mk-pick'); bb.type = 'button';
    bb.appendChild(canvasIcon(32, (c, s) => { const sp = bossSprite(bk); c.drawImage(sp, 0, 0, sp.width, sp.height, -s * 0.4, 0, s * 1.8, s); }));
    bb.appendChild(el('span', null, esc((F.boss === 'auto' ? 'Floor default: ' : '') + bossName(bk))));
    bb.addEventListener('click', (e) => { e.preventDefault(); pickBoss(F.boss, true, (v) => { pushUndo(); F.boss = v; changed(true); }); });
    pane.appendChild(field('Lair boss', bb));
    pane.appendChild(field('Darkness', seg(DARK, F.dark, (v) => { pushUndo(); F.dark = v; Maker.pvKey = ''; changed(); })));
    const fa = el('div', 'mk-acts');
    fa.append(
      btn('', IC.copy + 'Duplicate', 'Duplicate this floor', () => { if (M.floors.length >= LIMITS.floors) { toast('Eight floors is the most.'); return; } pushUndo(); M.floors.splice(Maker.fi + 1, 0, JSON.parse(JSON.stringify(F))); goFloor(Maker.fi + 1); }),
      btn('', '← Earlier', 'Move this floor up', () => { if (Maker.fi === 0) return; pushUndo(); const [f] = M.floors.splice(Maker.fi, 1); M.floors.splice(Maker.fi - 1, 0, f); goFloor(Maker.fi - 1); }),
      btn('', 'Later →', 'Move this floor down', () => { if (Maker.fi >= M.floors.length - 1) return; pushUndo(); const [f] = M.floors.splice(Maker.fi, 1); M.floors.splice(Maker.fi + 1, 0, f); goFloor(Maker.fi + 1); }),
    );
    const dl = btn('red', IC.trash + 'Delete floor', 'Delete this floor', () => {
      if (M.floors.length <= 1) { toast('A map needs at least one floor.'); return; }
      if (!dl.classList.contains('on')) { dl.classList.add('on'); toast('Tap again to delete this floor.'); setTimeout(() => dl.classList.remove('on'), 2600); return; }
      pushUndo(); M.floors.splice(Maker.fi, 1); goFloor(Math.max(0, Maker.fi - 1));
    });
    fa.appendChild(dl);
    pane.appendChild(fa);
    pane.scrollTop = top;
  }
  function paintRoomThumb(c, w, h, R) {
    const col = RT[R.t] ? RT[R.t].col : '#888';
    c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h);
    c.fillStyle = rgba(col, 0.22); c.fillRect(0, 0, w, h);
    const cw = w / GW, ch = h / GH;
    for (let i = 0; i < GN; i++) {
      const t = R.g[i]; if (t === '.') continue;
      const x = (i % GW) * cw, y = Math.floor(i / GW) * ch;
      c.fillStyle = SOLID_TILE(t) ? 'rgba(236,226,212,.55)' : 'rgba(236,226,212,.22)';
      c.fillRect(x + 0.4, y + 0.4, cw - 0.8, ch - 0.8);
    }
    for (const e of R.e) {
      const x = (e.c + 0.5) * cw, y = (e.r + 0.5) * ch;
      c.fillStyle = e.t === 'sn' ? (e.g ? '#ffc83a' : '#ff4a5a') : ENTS[e.t].cat === 'traps' ? '#ff9a2a' : ENTS[e.t].cat === 'loot' ? '#ffd84a' : '#7cc4ff';
      c.fillRect(x - cw * 0.32, y - ch * 0.32, cw * 0.64, ch * 0.64);
    }
    c.fillStyle = col; c.fillRect(0, 0, w, 2.5);
  }
  function selectRoom(x, y) {
    Maker.rx = x; Maker.ry = y; Maker.sel = null; Maker.pvKey = '';
    renderFloor(); renderRoomPane(); renderCrumb(); renderInspector();
  }
  function goFloor(i) {
    Maker.fi = clamp(i, 0, Maker.M.floors.length - 1);
    const F = F_(), st = F.rooms.find((r) => r.t === 'start') || F.rooms[0];
    Maker.rx = st.x; Maker.ry = st.y; Maker.sel = null;
    changed(true);
  }
  function addRoom(x, y, go) {
    const F = F_();
    if (roomAt(F, x, y)) { selectRoom(x, y); return; }
    if (F.rooms.length >= LIMITS.rooms) { toast(`${LIMITS.rooms} rooms is the most for one floor.`); return; }
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    pushUndo();
    const R = newRoom(x, y, F.rooms.some((r) => r.t === 'boss') ? 'fight' : 'fight');
    F.rooms.push(R);
    if (go) { Maker.rx = x; Maker.ry = y; Maker.sel = null; }
    changed(true);
    toast('Room added. Paint it.');
  }
  function cycleEdge(R, s) {
    const F = F_(), cur = edgeOf(F, R, s); if (!cur) return;
    pushUndo();
    setEdge(F, R, s, cur === 'o' ? 'w' : cur === 'w' ? 'c' : 'o');
    changed();
  }

  /* ---- the map pane */
  function renderMapPane() {
    const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const M = Maker.M;
    const pr = el('div'); pr.id = 'mkProbs'; pane.appendChild(pr);
    pane.appendChild(el('h4', 'mk-h', 'About'));
    const au = el('input', 'mk-in'); au.maxLength = LIMITS.author; au.value = M.author; au.placeholder = 'Your name';
    au.addEventListener('change', () => { pushUndo(); M.author = au.value.trim(); scheduleSave(); });
    pane.appendChild(field('Made by', au));
    const ds = el('textarea', 'mk-in'); ds.maxLength = LIMITS.desc; ds.value = M.desc; ds.placeholder = 'One or two lines for whoever plays it.'; ds.rows = 2;
    ds.addEventListener('change', () => { pushUndo(); M.desc = ds.value.slice(0, LIMITS.desc); scheduleSave(); });
    pane.appendChild(field('Description', ds));
    pane.appendChild(el('h4', 'mk-h', 'Who plays it'));
    const chars = [['', 'Player picks']].concat(CHAR_IDS.filter((id) => CHARS[id]).map((id) => [id, CHARS[id].name + (id === 'apple' || Save.data.unlocks[id] ? '' : ' (locked for you)')]));
    pane.appendChild(field('Character', selectOf(chars, M.char, (v) => { pushUndo(); M.char = v; scheduleSave(); })));
    pane.appendChild(field('Difficulty', seg(DIFF_OPTS, M.diff, (v) => { pushUndo(); M.diff = v; scheduleSave(); renderMapPane(); })));
    pane.appendChild(el('p', 'mk-p', 'A locked character or Nightmare falls back to what the player has.'));
    pane.appendChild(el('h4', 'mk-h', 'Rules'));
    for (const [k, label, opts] of RULES) pane.appendChild(field(label, seg(opts, M.rules[k], (v) => { pushUndo(); M.rules[k] = v; scheduleSave(); renderMapPane(); })));
    pane.appendChild(el('h4', 'mk-h', `Start powerups (${M.items.length} of ${LIMITS.items})`));
    const its = el('div', 'mk-items');
    for (const id of M.items) {
      const b = el('button'); b.type = 'button'; b.title = 'Remove ' + ITEMS[id].name;
      b.appendChild(canvasIcon(28, (c, s) => { c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.85, 1); }));
      b.appendChild(el('span', null, esc(ITEMS[id].name)));
      b.addEventListener('click', (e) => { e.preventDefault(); pushUndo(); M.items = M.items.filter((x) => x !== id); scheduleSave(); renderMapPane(); });
      its.appendChild(b);
    }
    if (M.items.length < LIMITS.items) {
      const b = el('button', 'add', IC.plus.replace('<svg', '<svg width="14" height="14"') + ' Add'); b.type = 'button';
      b.addEventListener('click', (e) => { e.preventDefault(); pickItem('', false, (id) => { if (!M.items.includes(id)) { pushUndo(); M.items.push(id); scheduleSave(); renderMapPane(); } }); });
      its.appendChild(b);
    }
    pane.appendChild(its);
    pane.appendChild(el('p', 'mk-p', 'They wait in the start room. Tap one to take it off.')).style.marginTop = '6px';
    pane.appendChild(el('h4', 'mk-h', 'The map'));
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('gold', IC.share + 'Share code', 'Share code', openShare),
      btn('', IC.check + 'Save now', 'Save now', () => { saveNow(); toast('Saved in this browser'); }),
      btn('', IC.copy + 'Save a copy', 'Save a copy', () => { saveNow(); const C = cloneMap(Maker.M); C.id = uid(); C.name = (C.name + ' (copy)').slice(0, LIMITS.name); Store.put(C); edit(C); toast('Now editing the copy'); }),
      btn('', IC.map + 'Your maps', 'Back to your maps', () => { saveNow(); showHub(); }),
    );
    pane.appendChild(acts);
    const st = mapStats(M);
    const stats = el('div', 'mk-stats'); stats.style.marginTop = '10px';
    stats.innerHTML = `<span><b>${st.floors}</b>floors</span><span><b>${st.rooms}</b>rooms</span><span><b>${st.snakes}</b>snakes</span>`;
    pane.appendChild(stats);
    renderProbs();
    pane.scrollTop = top;
  }

  /* ---- checks */
  function validate(M) {
    const out = [];
    M.floors.forEach((F, fi) => {
      const fl = M.floors.length > 1 ? `Floor ${fi + 1}: ` : '';
      const starts = F.rooms.filter((r) => r.t === 'start'), lairs = F.rooms.filter((r) => r.t === 'boss');
      const exits = F.rooms.filter((r) => r.e.some((e) => e.t === 'ex'));
      if (!starts.length) out.push({ err: 1, msg: fl + 'no start room. Make one room the start.', fi, x: F.rooms[0].x, y: F.rooms[0].y });
      if (!lairs.length && !exits.length) out.push({ err: 1, msg: fl + 'no way out. Add a lair or an exit hatch.', fi, x: F.rooms[0].x, y: F.rooms[0].y });
      const st = starts[0] || F.rooms[0], seen = new Set([st]), q = [st];
      while (q.length) { const R = q.shift(); for (const s of doorsOf(F, R)) { const o = neighbor(F, R, s); if (o && !seen.has(o)) { seen.add(o); q.push(o); } } }
      const lost = F.rooms.filter((r) => !seen.has(r));
      if (lost.length) out.push({ msg: `${fl}${lost.length === 1 ? 'one room can' : lost.length + ' rooms can'} not be reached from the start.`, fi, x: lost[0].x, y: lost[0].y });
      const keys = F.rooms.reduce((n, R) => n + R.e.filter((e) => e.t === 'ky').length, 0), locks = F.rooms.filter((r) => r.lk || r.t === 'vault');
      if (locks.length > keys) out.push({ msg: `${fl}${locks.length} locked room${locks.length === 1 ? '' : 's'}, ${keys} key${keys === 1 ? '' : 's'}. The game hides the missing ones in pots.`, fi, x: locks[0].x, y: locks[0].y, soft: 1 });
      const pads = [0, 0, 0, 0], levers = [0, 0, 0, 0], gates = [0, 0, 0, 0];
      for (const R of F.rooms) {
        for (const e of R.e) { if (e.t === 'tp') pads[e.ch || 0]++; if (e.t === 'lv') levers[e.ch || 0]++; if (e.t === 'gt') gates[e.ch || 0]++; }
        for (const s of doorsOf(F, R)) { const [mc, mr] = MOUTH[s]; const e = entAt(R, mc, mr); if (SOLID_TILE(cellCh(R, mc, mr)) || (e && ENTS[e.t].solid && e.t !== 'gt')) { out.push({ msg: `${fl}a doorway is blocked in ${RT[R.t].name.toLowerCase()} ${colName(R.x)}${R.y + 1}.`, fi, x: R.x, y: R.y }); break; } }
        if (NEEDS[R.t] && ![...NEEDS[R.t]].some((ch) => R.g.includes(ch))) out.push({ msg: `${fl}${RT[R.t].name} ${colName(R.x)}${R.y + 1} is missing its pieces. They get put back.`, fi, x: R.x, y: R.y, soft: 1 });
      }
      for (let ch = 0; ch < 4; ch++) {
        if (pads[ch] === 1) out.push({ msg: `${fl}one ${CH_NAMES[ch].toLowerCase()} teleporter has no partner.`, fi, soft: 1 });
        if (levers[ch] && !gates[ch]) out.push({ msg: `${fl}a ${CH_NAMES[ch].toLowerCase()} lever with no ${CH_NAMES[ch].toLowerCase()} gates.`, fi, soft: 1 });
        if (gates[ch] && !levers[ch]) out.push({ msg: `${fl}${CH_NAMES[ch].toLowerCase()} gates with no ${CH_NAMES[ch].toLowerCase()} lever.`, fi, soft: 1 });
      }
    });
    return out;
  }
  function validateSoon() { clearTimeout(Maker._vT); Maker._vT = setTimeout(() => { if (!Maker.M) return; Maker.probs = validate(Maker.M); renderChk(); renderProbs(); }, 120); }
  function renderChk() {
    const b = $('mkChk'); if (!b) return;
    const errs = Maker.probs.filter((p) => p.err).length, warns = Maker.probs.length - errs;
    b.className = 'mke-chk' + (errs ? ' bad' : warns ? ' meh' : '');
    b.innerHTML = errs ? IC.warn + `<span class="lbl">${errs} to fix</span>` : warns ? IC.warn + `<span class="lbl">${warns} note${warns === 1 ? '' : 's'}</span>` : IC.check + '<span class="lbl">Ready</span>';
    b.title = errs ? 'Things to fix before testing' : warns ? 'Notes about the map' : 'Ready to play';
  }
  function renderProbs() {
    const box = $('mkProbs'); if (!box) return;
    box.textContent = '';
    if (!Maker.probs.length) return;
    box.appendChild(el('h4', 'mk-h', 'Check'));
    const list = el('div', 'mk-probs');
    for (const p of Maker.probs) {
      const b = el('button', p.err ? 'err' : '', (p.err ? IC.warn : IC.warn) + `<span>${esc(p.msg)}</span>`); b.type = 'button';
      b.addEventListener('click', (e) => { e.preventDefault(); if (p.fi !== Maker.fi) { Maker.fi = p.fi; } if (p.x != null) { Maker.rx = p.x; Maker.ry = p.y; } changed(true); setPane('room'); });
      list.appendChild(b);
    }
    box.appendChild(list);
  }

  /* ---- the bar above the room */
  function renderCrumb() {
    const b = $('mkCrumb'); if (!b || !Maker.M) return;
    const F = F_(), R = R_(), sn = R.e.filter((e) => e.t === 'sn').length;
    let hv = '';
    if (Maker.hover && Maker.hover.c >= 0) {
      const { c, r } = Maker.hover, e = entAt(R, c, r), ch = cellCh(R, c, r);
      hv = `${colName(c)}${r + 1}  ${e ? (e.t === 'sn' ? snakeName(e.k) : ENTS[e.t].name) : ch !== '.' ? TILE[ch].name : ''}`;
    }
    b.innerHTML = `<span>Floor <b>${Maker.fi + 1}</b> · ${esc(F.name || setName(F.set))}</span><span><i style="background:${RT[R.t].col}"></i> <b>${esc(RT[R.t].name)}</b> ${colName(R.x)}${R.y + 1}${sn ? ' · ' + sn + ' snake' + (sn === 1 ? '' : 's') : ''}</span><span class="hv">${esc(hv)}</span>`;
  }

  /* ---- the room on the canvas, drawn by the game's own renderer */
  /* the drag bar on phones: the share of the editor the room takes is kept as a fraction, so it survives turning the phone */
  function initGrip() {
    const g = $('mkGrip'), tabs = $('mkTabs'), stage = document.querySelector('#mkEd .mke-stage'), body = g && g.parentNode;
    if (!g || !tabs || !stage || !body) return;
    const KEY = 'bitten-mk-sh';
    let frac = null, drag = null, lastUp = 0;
    try { const f = parseFloat(localStorage.getItem(KEY)); if (f > 0.1 && f < 0.95) frac = f; } catch (e) { /* ignore */ }
    const bounds = () => { const bh = body.clientHeight; return [Math.min(170, bh * 0.4), Math.max(170, bh - tabs.offsetHeight - g.offsetHeight - 130), bh]; };
    const apply = () => {
      const [lo, hi, bh] = bounds();
      if (!bh || g.offsetHeight === 0) return;
      if (frac == null) { body.style.removeProperty('--mk-sh'); return; }
      const h = Math.round(clamp(frac * bh, lo, hi));
      body.style.setProperty('--mk-sh', h + 'px');
      g.setAttribute('aria-valuenow', String(h));
    };
    const save = () => { try { if (frac == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, String(frac)); } catch (e) { /* ignore */ } };
    const reset = () => { frac = null; apply(); save(); };
    const setPx = (h) => { const [lo, hi, bh] = bounds(); if (!bh) return; frac = clamp(h, lo, hi) / bh; apply(); };
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { g.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      drag = { y: e.clientY, h: stage.getBoundingClientRect().height, moved: false };
      g.classList.add('drag');
    });
    g.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (Math.abs(e.clientY - drag.y) > 3) drag.moved = true;
      if (drag.moved) setPx(drag.h + e.clientY - drag.y);
    });
    const end = (e) => {
      if (!drag) return;
      const moved = drag.moved; drag = null; g.classList.remove('drag');
      if (moved) { save(); lastUp = 0; return; }
      const now = Date.now();
      if (e && e.type === 'pointerup' && now - lastUp < 380) { reset(); lastUp = 0; } else lastUp = now;
    };
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
    g.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'Home') return;
      e.preventDefault(); e.stopPropagation();
      if (k === 'Home') { reset(); return; }
      setPx(stage.getBoundingClientRect().height + (k === 'ArrowUp' ? -28 : 28)); save();
    });
    try { new ResizeObserver(apply).observe(body); } catch (e) { window.addEventListener('resize', apply); }
    apply();
  }
  function layoutCanvas() {
    const w = $('mkCvw'); if (!w || !Maker.cv || Maker.view !== 'editor' || $('mkEd').hidden) return;
    const r = w.getBoundingClientRect();
    const aw = Math.max(120, r.width - 14), ah = Math.max(90, r.height - 14);
    const s = Math.max(0.3, Math.min(aw / VIEW_W, ah / VIEW_H));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.abs(s - Maker.s) < 0.001 && dpr === Maker.dpr && Maker.cv.width) return;
    Maker.s = s; Maker.dpr = dpr;
    Maker.cv.style.width = Math.round(VIEW_W * s) + 'px'; Maker.cv.style.height = Math.round(VIEW_H * s) + 'px';
    Maker.cv.width = Math.round(VIEW_W * s * dpr); Maker.cv.height = Math.round(VIEW_H * s * dpr);
    Maker.pvKey = '';
  }
  const gameType = (t) => (t === 'arena' ? 'chaosboss' : t);
  function previewRoom() {
    const F = F_(), R = R_(), def = setDef(F.set);
    const dk = Object.keys(SIDES).map((s) => { const o = neighbor(F, R, s); return o ? edgeOf(F, R, s) + o.t + (o.lk ? 'L' : '') : '-'; }).join('');
    const bossK = F.boss !== 'auto' ? F.boss : def.boss;
    const key = [Maker.fi, R.x, R.y, R.t, R.g, F.set, R.st, dk, bossK, Maker.s, Maker.dpr].join('|');
    if (key === Maker.pvKey && Maker.pv) return Maker.pv;
    const room = new Room(R.x, R.y, 0);
    room.type = gameType(R.t);
    let g = R.g;
    if (FIXED[R.t]) g = typeTemplate(R.t) || g;
    for (const s in SIDES) {
      const o = neighbor(F, R, s); if (!o) continue;
      const e = edgeOf(F, R, s);
      if (e === 'o') { const nb = new Room(o.x, o.y, 1); nb.type = gameType(o.t); nb.sealed = !!o.lk || o.t === 'vault'; room.doors[s] = nb; }
      else if (e === 'c' && !room.secretLink) room.secretLink = { k: s, room, hp: 3 };
    }
    if (def.set === 'market') room.store = R.st || 'blue';
    if (R.t === 'shop') room.store = R.st || 'blue';
    safe(() => withScene(room, def, () => {
      let rows = rowsOf(g);
      if (R.t === 'boss' && g === EMPTY && typeof BOSS_TPL10 !== 'undefined' && BOSS_TPL10[bossK]) rows = BOSS_TPL10[bossK];
      room.build(rows, def, {});
      if (R.t === 'quiet') safe(() => setupQuiet10(room));
      room.decals = [];
      buildRoomCache(room, def, Math.min(3, Maker.s * Maker.dpr));
    }));
    Maker.pv = room; Maker.pvKey = key;
    return room;
  }
  const BIG_SN = { long: 1.25, sloper: 1.3, driekop: 1.2, tetra: 1.15, pantser: 1.1 }, SMALL_SN = { grub: 0.8, raver: 0.75, splitling: 0.72, creeper: 0.85, rotling: 0.8 };
  function editSaw(R, e) {
    const solid = (c, r) => c < 0 || r < 0 || c >= GW || r >= GH || SOLID_TILE(R.g[r * GW + c]) || (() => { const o = entAt(R, c, r); return !!(o && ENTS[o.t].solid); })();
    let lo = e.ax === 'v' ? e.r : e.c, hi = lo;
    if (e.ax === 'v') { while (!solid(e.c, lo - 1)) lo--; while (!solid(e.c, hi + 1)) hi++; }
    else { while (!solid(lo - 1, e.r)) lo--; while (!solid(hi + 1, e.r)) hi++; }
    return { lo: (lo + 0.5) * T, hi: (hi + 0.5) * T };
  }
  const FLAT = { ac: 0, wk: 0, sp: 0, sk: 1, jp: 2, tp: 2, ex: 2, sw: 3, pd: 4 };
  function drawEnts(c, R, t) {
    const list = R.e.slice().sort((a, b) => (FLAT[a.t] != null ? FLAT[a.t] : 6) - (FLAT[b.t] != null ? FLAT[b.t] : 6) || a.r - b.r);
    for (const e of list) {
      const x = (e.c + 0.5) * T, y = (e.r + 0.5) * T;
      safe(() => {
        if (e.t === 'sn') {
          const sp = snakeSprite(e.k, e.g), S = 36 * (BIG_SN[e.k] || SMALL_SN[e.k] || 1);
          c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 6, S * 0.42, S * 0.24); c.fill();
          if (e.g) { c.strokeStyle = 'rgba(255,200,58,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 17, 0, TAU); c.stroke(); }
          c.drawImage(sp, x - S / 2, y - S / 2, S, S);
          if (e.tr) label(c, x + 12, y - 13, e.tr[0].toUpperCase(), TRAIT_COLS[e.tr] || '#fff', 8);
          return;
        }
        if (e.t === 'sw') { const rg = editSaw(R, e); ART.sw(c, x, y, Object.assign({}, e, rg, { x, y }), t, 'edit'); return; }
        if (e.t === 'fb') { ART.fb(c, x, y, e, t, 'edit'); return; }
        if (e.t === 'pd') { ART.pd(c, x, y + 4, e, t, 'edit'); return; }
        ART[e.t](c, x, y, e, t, 'edit');
      });
    }
  }
  function mouths(F, R) { const out = {}; for (const s of doorsOf(F, R)) { const [c, r] = MOUTH[s]; out[r * GW + c] = s; } return out; }
  function drawOverlay(c, R, F, t) {
    // the grid
    if (Maker.showGrid) {
      c.strokeStyle = 'rgba(255,240,220,0.07)'; c.lineWidth = 1 / Maker.s;
      c.beginPath();
      for (let i = 1; i < GW; i++) { c.moveTo(i * T, 0); c.lineTo(i * T, RH); }
      for (let i = 1; i < GH; i++) { c.moveTo(0, i * T); c.lineTo(RW, i * T); }
      c.stroke();
    }
    if (Maker.mirX || Maker.mirY) {
      c.strokeStyle = 'rgba(227,165,74,0.55)'; c.lineWidth = 1.2; c.setLineDash([5, 5]);
      c.beginPath(); if (Maker.mirX) { c.moveTo(RW / 2, 0); c.lineTo(RW / 2, RH); } if (Maker.mirY) { c.moveTo(0, RH / 2); c.lineTo(RW, RH / 2); } c.stroke(); c.setLineDash([]);
    }
    // doorways: what is behind them, and a + where a room could go
    const mo = mouths(F, R);
    for (const k in mo) {
      const i = +k, cc = i % GW, rr = Math.floor(i / GW), e = entAt(R, cc, rr);
      if (SOLID_TILE(R.g[i]) || (e && ENTS[e.t].solid && e.t !== 'gt')) { c.strokeStyle = '#ff4a5a'; c.lineWidth = 2; c.strokeRect(cc * T + 3, rr * T + 3, T - 6, T - 6); label(c, (cc + 0.5) * T, (rr + 0.5) * T, 'BLOCKED', '#ff8494', 8); }
    }
    for (const s in SIDES) {
      const v = SIDES[s], o = neighbor(F, R, s), [mc, mr] = MOUTH[s];
      const x = s === 'w' ? -WALL / 2 : s === 'e' ? RW + WALL / 2 : (mc + 0.5) * T, y = s === 'n' ? -WALL / 2 : s === 's' ? RH + WALL / 2 : (mr + 0.5) * T;
      if (o) {
        const ed = edgeOf(F, R, s);
        const txt = ed === 'w' ? 'WALL' : ed === 'c' ? 'CRACK' : RT[o.t].code + (o.lk ? ' •' : '');
        c.fillStyle = 'rgba(10,6,5,0.85)'; c.fillRect(x - 17, y - 6.5, 34, 13);
        c.strokeStyle = ed === 'o' ? RT[o.t].col : ed === 'c' ? '#e3a54a' : '#5a2a2e'; c.lineWidth = 1; c.strokeRect(x - 17 + 0.5, y - 6.5 + 0.5, 33, 12);
        label(c, x, y + 0.5, txt, ed === 'o' ? '#ece2d4' : ed === 'c' ? '#e3a54a' : '#a66', 7.5);
      } else if (R.x + v[0] >= 0 && R.x + v[0] < FW && R.y + v[1] >= 0 && R.y + v[1] < FH) {
        const hov = Maker.hoverWall === s;
        c.fillStyle = hov ? 'rgba(227,165,74,0.9)' : 'rgba(10,6,5,0.75)'; c.fillRect(x - 8, y - 8, 16, 16);
        c.strokeStyle = 'rgba(227,165,74,0.8)'; c.lineWidth = 1; c.strokeRect(x - 7.5, y - 7.5, 15, 15);
        c.strokeStyle = hov ? '#16100d' : '#e3a54a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.moveTo(x, y - 4); c.lineTo(x, y + 4); c.stroke();
      }
    }
    if (FIXED[R.t]) { c.fillStyle = 'rgba(10,6,5,0.35)'; c.fillRect(0, 0, RW, RH); label(c, RW / 2, 16, 'FIXED LAYOUT', '#e3a54a', 10); }
    // the selected piece
    if (Maker.sel) { c.strokeStyle = '#e3a54a'; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.strokeRect(Maker.sel.c * T + 1.5, Maker.sel.r * T + 1.5, T - 3, T - 3); c.setLineDash([]); }
    // the box being dragged
    const st = Maker.stroke;
    if (st && st.box) {
      const b = st.box, c0 = Math.min(b.c0, b.c1), c1 = Math.max(b.c0, b.c1), r0 = Math.min(b.r0, b.r1), r1 = Math.max(b.r0, b.r1);
      c.fillStyle = st.tool === 'erase' ? 'rgba(232,58,80,0.18)' : 'rgba(227,165,74,0.18)'; c.fillRect(c0 * T, r0 * T, (c1 - c0 + 1) * T, (r1 - r0 + 1) * T);
      c.strokeStyle = '#e3a54a'; c.lineWidth = 1.5; c.strokeRect(c0 * T + 0.75, r0 * T + 0.75, (c1 - c0 + 1) * T - 1.5, (r1 - r0 + 1) * T - 1.5);
    }
    // the hovered cell, and a ghost of the brush in it
    const h = Maker.hover;
    if (h && h.c >= 0 && h.r >= 0 && h.c < GW && h.r < GH && !(st && st.box)) {
      const cells = mirrorCells(h.c, h.r);
      for (const [cc, rr] of cells) {
        const erase = Maker.tool === 'erase';
        if (Maker.tool === 'brush' && !FIXED[R.t]) {
          c.globalAlpha = 0.45;
          const br = Maker.brush, x = (cc + 0.5) * T, y = (rr + 0.5) * T;
          if (br.k === 'ent') safe(() => { if (br.t === 'sn') { const sp = snakeSprite(br.p.k, br.p.g); c.drawImage(sp, x - 18, y - 18, 36, 36); } else if (br.t !== 'sw' && br.t !== 'fb') ART[br.t](c, x, br.t === 'pd' ? y + 4 : y, Object.assign({ c: cc, r: rr }, br.p), t, 'icon'); });
          else { const a = tileAtlas(F.set)[br.ch]; if (a) c.drawImage(a, cc * T - 3, rr * T - 7, T + 6, T + 6); }
          c.globalAlpha = 1;
        }
        c.strokeStyle = erase ? '#ff6a7a' : Maker.tool === 'move' ? '#7cc4ff' : '#e3a54a'; c.lineWidth = 1.6;
        c.strokeRect(cc * T + 1, rr * T + 1, T - 2, T - 2);
      }
    }
  }
  function drawEditor(now) {
    const c = Maker.ctx, cv = Maker.cv; if (!c || !Maker.M || !cv.width) return;
    const s = Maker.s, dpr = Maker.dpr, k = s * dpr, t = now / 1000;
    const F = F_(), R = R_(), def = setDef(F.set);
    const pv = previewRoom();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0b0807'; c.fillRect(0, 0, cv.width, cv.height);
    if (pv.cache) c.drawImage(pv.cache, 0, 0, cv.width, cv.height);
    c.setTransform(k, 0, 0, k, WALL * k, WALL * k);
    c.lineJoin = 'round'; c.lineCap = 'round';
    withScene(pv, def, () => {
      G.t = t;
      safe(() => { if (pv.belts.length) drawBelts(c, pv, t); });
      safe(() => drawFloorThings(c, pv, t));
      const g = FIXED[R.t] ? typeTemplate(R.t) || R.g : R.g;
      for (let i = 0; i < GN; i++) if ('$+%!qsp'.includes(g[i])) safe(() => pieceArt(c, g[i], (i % GW + 0.5) * T, (Math.floor(i / GW) + 0.5) * T, t));
      for (const o of pv.obs) safe(() => DYN_DRAW(c, o, pv, def, t));
      for (const ct of pv.carts) safe(() => drawCart(c, ct, pv));
      for (const p of pv.pickups) if (p.kind === 'heart') safe(() => drawHeartPickup(c, p, t));
      for (const rt of pv.rots) safe(() => drawRot(c, rt, t));
    });
    if (!FIXED[R.t]) drawEnts(c, R, t);
    drawOverlay(c, R, F, t);
  }
  function loop(now) {
    Maker.raf = 0;
    if (!Maker.open || Maker.view !== 'editor') return;
    Maker.raf = Sched.raf(loop);
    if (now - Maker.last < 33) return;
    Maker.last = now;
    safe(() => drawEditor(now));
  }
  function startLoop() { if (!Maker.raf) Maker.raf = Sched.raf(loop); }
  function stopLoop() { if (Maker.raf) Sched.cancel(Maker.raf); Maker.raf = 0; }

  /* ---- painting */
  function mirrorCells(c, r) {
    const out = [[c, r]];
    if (Maker.mirX) out.push([GW - 1 - c, r]);
    if (Maker.mirY) out.push([c, GH - 1 - r]);
    if (Maker.mirX && Maker.mirY) out.push([GW - 1 - c, GH - 1 - r]);
    const seen = new Set();
    return out.filter(([a, b]) => { const k = a + ',' + b; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function ensureUndo() { const st = Maker.stroke; if (st && st.saved) return; pushUndo(); if (st) st.saved = true; }
  let warnT = 0;
  function warnOnce(msg) { if (performance.now() - warnT > 1500) { warnT = performance.now(); toast(msg); } }
  function mouthAt(F, R, c, r) { return mouths(F, R)[r * GW + c]; }
  function sameEnt(a, b) { if (a.t !== b.t) return false; for (const p of ENT_PARAMS[a.t]) if (a[p.k] !== b[p.k]) return false; return true; }
  function paintOne(R, F, c, r, tool, fx, fy) {
    const i = r * GW + c;
    if (tool === 'erase') {
      let ch = false;
      if (R.g[i] !== '.') { ensureUndo(); setCh(R, c, r, '.'); ch = true; }
      const e = entAt(R, c, r); if (e) { ensureUndo(); R.e.splice(R.e.indexOf(e), 1); ch = true; if (Maker.sel && Maker.sel.c === c && Maker.sel.r === r) Maker.sel = null; }
      return ch;
    }
    const br = Maker.brush;
    if (br.k === 'tile') {
      if (TILE[br.ch].solid && mouthAt(F, R, c, r)) { warnOnce('Keep the doorway clear.'); return false; }
      const e = entAt(R, c, r);
      if (R.g[i] === br.ch && !e) return false;
      ensureUndo();
      setCh(R, c, r, br.ch);
      if (e) R.e.splice(R.e.indexOf(e), 1);
      return true;
    }
    if (ENTS[br.t].solid && br.t !== 'gt' && mouthAt(F, R, c, r)) { warnOnce('Keep the doorway clear.'); return false; }
    const ex = entAt(R, c, r);
    if (!ex && R.e.length >= LIMITS.ents) { warnOnce(`${LIMITS.ents} pieces is the most for one room.`); return false; }
    let n = Object.assign({ t: br.t, c, r }, br.p);
    if (fx) n = flipEnt(Object.assign({}, n, { c: GW - 1 - c }), true);
    if (fy) n = flipEnt(Object.assign({}, n, { r: GH - 1 - r }), false);
    n.c = c; n.r = r;
    n = cleanEnt(n); if (!n) return false;
    if (ex && sameEnt(ex, n) && R.g[i] === '.') return false;
    ensureUndo();
    if (ex) R.e.splice(R.e.indexOf(ex), 1);
    if (R.g[i] !== '.') setCh(R, c, r, '.');
    R.e.push(n);
    return true;
  }
  function applyAt(c, r, tool) {
    const R = R_(), F = F_();
    if (c < 0 || r < 0 || c >= GW || r >= GH) return;
    let any = false;
    for (const [cc, rr] of mirrorCells(c, r)) any = paintOne(R, F, cc, rr, tool, cc !== c, rr !== r) || any;
    if (any && Maker.stroke) Maker.stroke.changed = true;
  }
  function sig(R, c, r) { const e = entAt(R, c, r); return e ? 'e:' + e.t + ':' + (e.k || '') + (e.ch != null ? e.ch : '') : 't:' + R.g[r * GW + c]; }
  function fillAt(c, r) {
    const R = R_(), F = F_(), want = sig(R, c, r), q = [[c, r]], seen = new Set([r * GW + c]);
    const tool = Maker.tool === 'erase' ? 'erase' : 'brush';
    Maker.stroke = { tool, saved: false, changed: false };
    let n = 0;
    while (q.length && n < GN) {
      const [x, y] = q.shift(); n++;
      paintOne(R, F, x, y, tool, false, false);
      for (const [dx, dy] of DIR4) {
        const nx = x + dx, ny = y + dy, k = ny * GW + nx;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || seen.has(k)) continue;
        seen.add(k);
        if (sig(R, nx, ny) === want) q.push([nx, ny]);
      }
    }
    const ch = Maker.stroke.changed || Maker.stroke.saved;
    Maker.stroke = null;
    if (ch) changed();
  }
  function boxFill(b, tool) {
    const c0 = Math.min(b.c0, b.c1), c1 = Math.max(b.c0, b.c1), r0 = Math.min(b.r0, b.r1), r1 = Math.max(b.r0, b.r1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) applyAt(c, r, tool);
  }
  function pickFrom(c, r) {
    const R = R_(), e = entAt(R, c, r);
    if (e) { const p = Object.assign({}, e); delete p.c; delete p.r; delete p.t; pickBrush({ k: 'ent', t: e.t, p }); toast(`Picked ${e.t === 'sn' ? snakeName(e.k) : ENTS[e.t].name}`); }
    else { pickBrush({ k: 'tile', ch: R.g[r * GW + c] }); toast(`Picked ${TILE[R.g[r * GW + c]].name}`); }
  }
  function lineCells(c0, r0, c1, r1) {
    const out = []; let dx = Math.abs(c1 - c0), dy = -Math.abs(r1 - r0), sx = c0 < c1 ? 1 : -1, sy = r0 < r1 ? 1 : -1, err = dx + dy;
    for (let i = 0; i < 40; i++) { out.push([c0, r0]); if (c0 === c1 && r0 === r1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; c0 += sx; } if (e2 <= dx) { err += dx; r0 += sy; } }
    return out;
  }
  function cellFrom(e) {
    const r = Maker.cv.getBoundingClientRect();
    const wx = (e.clientX - r.left) / Maker.s - WALL, wy = (e.clientY - r.top) / Maker.s - WALL;
    return { wx, wy, c: Math.floor(wx / T), r: Math.floor(wy / T), inside: wx >= 0 && wy >= 0 && wx < RW && wy < RH };
  }
  function wallSide(p) {
    if (p.inside) return null;
    const near = (a, b) => Math.abs(a - b) < 26;
    if (p.wy < 0 && near(p.wx, RW / 2)) return 'n';
    if (p.wy > RH && near(p.wx, RW / 2)) return 's';
    if (p.wx < 0 && near(p.wy, RH / 2)) return 'w';
    if (p.wx > RW && near(p.wy, RH / 2)) return 'e';
    return null;
  }
  function onDown(e) {
    if (!Maker.M) return;
    const p = cellFrom(e);
    if (!p.inside) {
      const s = wallSide(p); if (!s) return;
      const F = F_(), R = R_(), o = neighbor(F, R, s);
      if (o) cycleEdge(R, s);
      else addRoom(R.x + SIDES[s][0], R.y + SIDES[s][1], true);
      return;
    }
    e.preventDefault();
    try { Maker.cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const R = R_();
    const tool = e.button === 2 ? 'erase' : Maker.tool;
    if (FIXED[R.t] && tool !== 'pick') { toast('This room has a fixed layout.'); return; }
    if (tool === 'pick') { pickFrom(p.c, p.r); return; }
    if (tool === 'move') {
      const ent = entAt(R, p.c, p.r);
      Maker.sel = ent ? { c: p.c, r: p.r } : null;
      Maker.stroke = { tool, drag: ent, saved: false, changed: false };
      if (!ent) toast('Nothing to select here. Pieces and snakes can be selected.');
      renderInspector();
      return;
    }
    if (tool === 'fill') { fillAt(p.c, p.r); return; }
    Maker.stroke = { tool, saved: false, changed: false, last: p };
    if (tool === 'box') { Maker.stroke.box = { c0: p.c, r0: p.r, c1: p.c, r1: p.r }; Maker.stroke.boxTool = e.button === 2 ? 'erase' : 'brush'; return; }
    applyAt(p.c, p.r, tool);
  }
  function onMove(e) {
    if (!Maker.M) return;
    const p = cellFrom(e);
    const hv = p.inside ? { c: p.c, r: p.r } : null;
    Maker.hoverWall = wallSide(p);
    if (!Maker.hover || !hv || hv.c !== Maker.hover.c || hv.r !== Maker.hover.r) { Maker.hover = hv; renderCrumb(); }
    const st = Maker.stroke; if (!st) return;
    if (st.box) { st.box.c1 = clamp(p.c, 0, GW - 1); st.box.r1 = clamp(p.r, 0, GH - 1); return; }
    if (st.tool === 'move') {
      const R = R_();
      if (!st.drag || !p.inside || (p.c === st.drag.c && p.r === st.drag.r)) return;
      if (entAt(R, p.c, p.r) || SOLID_TILE(R.g[p.r * GW + p.c])) return;
      if (ENTS[st.drag.t].solid && st.drag.t !== 'gt' && mouthAt(F_(), R, p.c, p.r)) return;
      ensureUndo();
      st.drag.c = p.c; st.drag.r = p.r; Maker.sel = { c: p.c, r: p.r }; st.changed = true;
      return;
    }
    if (!p.inside) return;
    const last = st.last || p;
    for (const [c, r] of lineCells(last.c, last.r, p.c, p.r)) applyAt(c, r, st.tool);
    st.last = p;
  }
  function onUp() {
    const st = Maker.stroke; if (!st) return;
    if (st.box) boxFill(st.box, st.boxTool === 'erase' ? 'erase' : Maker.tool === 'box' ? 'brush' : st.tool);
    Maker.stroke = null;
    if (st.changed || st.saved) { changed(); if (st.tool === 'move') renderInspector(); }
  }

  /* ---- keys */
  function onKey(e) {
    if (!Maker.open) return;
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!$('mkDlg').hidden) closeDlg();
      else if (typing) e.target.blur();
      else if (Maker.view === 'editor') { saveNow(); showHub(); }
      else Maker.close();
      return;
    }
    if (typing || Maker.view !== 'editor' || !$('mkDlg').hidden) return;
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); return; }
    if (mod && k === 'y') { e.preventDefault(); doRedo(); return; }
    if (mod && k === 'c') { e.preventDefault(); const R = R_(); Maker.clip = JSON.stringify({ g: R.g, e: R.e, t: R.t, m: R.m, b: R.b, n: R.n }); toast('Room copied'); renderRoomPane(); return; }
    if (mod && k === 'v') { e.preventDefault(); pasteRoom(R_()); return; }
    if (mod || e.altKey) return;
    const tools = { b: 'brush', e: 'erase', f: 'fill', r: 'box', i: 'pick', v: 'move' };
    if (tools[k]) { e.preventDefault(); setTool(tools[k]); return; }
    if (k === 'x') { Maker.mirX = !Maker.mirX; syncTools(); return; }
    if (k === 'y') { Maker.mirY = !Maker.mirY; syncTools(); return; }
    if (k === 'g') { Maker.showGrid = !Maker.showGrid; syncTools(); return; }
    if (k === 't') { play({ floor: 0 }); return; }
    if ((k === 'delete' || k === 'backspace') && Maker.sel) {
      e.preventDefault();
      const R = R_(), en = entAt(R, Maker.sel.c, Maker.sel.r);
      if (en) { pushUndo(); R.e.splice(R.e.indexOf(en), 1); Maker.sel = null; changed(); renderInspector(); }
      return;
    }
    const arrows = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
    if (arrows[k]) {
      e.preventDefault();
      const [dx, dy] = arrows[k];
      if (roomAt(F_(), Maker.rx + dx, Maker.ry + dy)) selectRoom(Maker.rx + dx, Maker.ry + dy);
      return;
    }
    if (k === 'pageup' || k === 'pagedown') { e.preventDefault(); goFloor(Maker.fi + (k === 'pageup' ? -1 : 1)); }
  }

  /* ---- dialogs */
  function closeDlg() { const d = $('mkDlg'); if (!d) return; d.hidden = true; $('mkDlgIn').textContent = ''; $('mkDlgIn').className = 'mk-dlg-in'; }
  function dlg(title, body, foot) {
    const d = $('mkDlg'), inn = $('mkDlgIn'); inn.textContent = ''; inn.className = 'mk-dlg-in';
    const hd = el('div', 'mk-dlg-hd'); hd.appendChild(el('b', null, esc(title)));
    hd.appendChild(btn('ic', SVG('<path d="M6 6l12 12M18 6L6 18"/>'), 'Close', closeDlg));
    inn.appendChild(hd);
    const bd = el('div', 'mk-dlg-bd'); bd.appendChild(body); inn.appendChild(bd);
    if (foot) { const ft = el('div', 'mk-dlg-ft'); for (const b of foot) ft.appendChild(b); inn.appendChild(ft); }
    d.hidden = false;
    return bd;
  }
  async function copyText(txt, ta) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) { /* fall back */ }
    try { if (ta) { ta.focus(); ta.select(); } return document.execCommand('copy'); } catch (e) { return false; }
  }
  async function openShare() {
    if (!Maker.M) return;
    const body = el('div');
    body.appendChild(el('p', 'mk-p', 'Copy the code and send it. Whoever pastes it into the Map Maker can play it right away or edit a copy. The code holds the whole map, every floor.'));
    const ta = el('textarea', 'mk-in mk-code'); ta.readOnly = true; ta.value = 'Packing...'; ta.setAttribute('aria-label', 'Map code');
    body.appendChild(ta);
    const info = el('p', 'mk-p'); info.style.marginTop = '6px'; body.appendChild(info);
    const probs = validate(Maker.M).filter((p) => p.err);
    if (probs.length) body.appendChild(el('div', 'mk-note', esc('Heads up: ' + probs[0].msg + ' Others can not play it like this.')));
    const cp = btn('pri', IC.copy + 'Copy code', 'Copy code', async () => {
      const ok = await copyText(ta.value, ta);
      if (ok) { toast('Code copied'); Meta.add('mapShares'); cp.innerHTML = IC.check + 'Copied'; } else toast('Select the code and copy it by hand.');
    });
    cp.disabled = true;
    dlg('Share this map', body, [btn('', 'Close', 'Close', closeDlg), cp]);
    try {
      const code = await encodeMap(Maker.M);
      ta.value = code; cp.disabled = false;
      info.textContent = `${code.length} characters. ${code.startsWith('BITMAP1') ? 'Packed small.' : 'Unpacked: this browser can not compress.'}`;
      ta.addEventListener('focus', () => ta.select());
    } catch (e) { ta.value = ''; info.textContent = 'Could not make a code: ' + (e && e.message); }
  }
  function pickItem(cur, ped, done) {
    const body = el('div', 'mk-pk-body');
    const top = el('div', 'mk-pk-top');
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search powerups'; q.setAttribute('aria-label', 'Search powerups');
    top.appendChild(q);
    let only = '';
    const flt = seg([['', 'All'], ['rare', 'Legendary'], ['found', 'Found by you']], only, (v) => { only = v; fill(); flt.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['', 'rare', 'found'][i] === v)); });
    top.appendChild(flt);
    body.appendChild(top);
    const list = el('div', 'mk-plist pk'); body.appendChild(list);
    const ids = ITEM_IDS.filter((id) => ITEMS[id]).concat(ITEMS.golden ? ['golden'] : []);
    /* the short plain line of every powerup, whatever the Descriptions setting says */
    const shortOf = (id) => {
      const V = window.__bitten && window.__bitten.V12, m = V && V.CLEAR12 && V.CLEAR12.items;
      return (m && m[id]) || (ITEMS[id] && ITEMS[id].desc) || '';
    };
    const fill = () => {
      list.textContent = '';
      const qq = q.value.trim().toLowerCase();
      const opts = [];
      if (ped) opts.push(['rand', 'Random powerup', 'Random', 'Rolled from the pool when the map is played.'], ['rare', 'Random legendary', 'Random', 'A legendary, rolled when the map is played.']);
      for (const id of ids.slice().sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name))) {
        const it = ITEMS[id];
        if (only === 'rare' && !it.rare) continue;
        if (only === 'found' && !Save.data.found[id]) continue;
        opts.push([id, it.name, it.rare ? 'Legendary' : Save.data.found[id] ? 'Powerup' : 'Not found yet', shortOf(id)]);
      }
      for (const [id, name, sub, desc] of opts) {
        if (qq && !name.toLowerCase().includes(qq)) continue;
        const b = el('button', (id === cur ? 'on ' : '') + (ITEMS[id] && ITEMS[id].rare ? 'rare ' : '') + (ITEMS[id] && !Save.data.found[id] ? 'lk' : '')); b.type = 'button';
        b.title = ITEMS[id] ? ITEMS[id].descFull || ITEMS[id].desc : name;
        b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.translate(s / 2, s / 2); if (id === 'rand' || id === 'rare') { c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 24px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, id, s * 0.78, 1); }));
        const sp = el('span', null, `${esc(name)}<small>${esc(sub)}</small><em class="d">${esc(desc)}</em>`); b.appendChild(sp);
        b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(id); });
        list.appendChild(b);
      }
      if (!list.children.length) list.appendChild(el('p', 'mk-p', 'Nothing by that name.'));
    };
    q.addEventListener('input', fill);
    fill();
    const bd = dlg(ped ? 'Pick a powerup' : 'Add a start powerup', body);
    bd.classList.add('pk'); bd.parentNode.classList.add('pk');
    /* on a touch screen the keyboard would cover the list and push the page around */
    if (!(typeof COARSE !== 'undefined' && COARSE)) setTimeout(() => q.focus(), 30);
  }
  function pickSnake(cur, done, pool) {
    const body = el('div'), list = el('div', 'mk-plist');
    for (const k of pool || SNAKES) {
      const b = el('button', k === cur ? 'on' : ''); b.type = 'button';
      b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.drawImage(snakeSprite(k), 1, 1, s - 2, s - 2); }));
      b.appendChild(el('span', null, esc(snakeName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(k); });
      list.appendChild(b);
    }
    body.appendChild(list);
    dlg('Pick a snake', body);
  }
  function pickBoss(cur, withAuto, done) {
    const body = el('div'), list = el('div', 'mk-plist bosses');
    const opts = (withAuto ? ['auto'] : []).concat(BOSSES);
    for (const k of opts) {
      const b = el('button', k === cur ? 'on' : ''); b.type = 'button';
      const kk = k === 'auto' ? setDef(F_().set).boss : k;
      b.appendChild(canvasIcon(64, (c, s) => { const sp = bossSprite(kk); c.drawImage(sp, 0, 0, sp.width, sp.height, 0, 0, s, s * 0.58); }));
      b.lastChild.style.height = '37px';
      b.appendChild(el('span', null, `${esc(k === 'auto' ? 'Floor default' : bossName(k))}${k === 'auto' ? `<small>${esc(bossName(kk))}</small>` : ''}`));
      b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(k); });
      list.appendChild(b);
    }
    body.appendChild(list);
    dlg('Pick a boss', body);
  }

  /* ---- playing */
  function play(opt) {
    if (!Maker.M) return;
    const errs = validate(Maker.M).filter((p) => p.err && (!opt.floor || p.fi >= opt.floor));
    if (errs.length) { toast(errs[0].msg); setPane('map'); return; }
    saveNow();
    const M = cloneMap(Maker.M);
    if (opt.floor > 0) M.floors = M.floors.slice(opt.floor);
    RTM.startRoom = opt.room ? { x: Maker.rx, y: Maker.ry } : null;
    playMap(M, 'editor');
  }
  function playMap(M, back) {
    const errs = validate(M).filter((p) => p.err);
    if (errs.length && back === 'hub') { toast('Not playable yet: ' + errs[0].msg); return; }
    if (back === 'hub') RTM.startRoom = null;
    RTM.cur = cleanMap(cloneMap(M)); RTM.back = back; RTM.tpTo = null;
    stopLoop(); closeDlg();
    Maker.open = false;
    $('maker').hidden = true;
    safe(() => Sfx.init());
    Game.startRun(false, 'map');
  }
  Maker.play = playMap;

  /* ================================================================== 11. v12.4: words in the dungeon, and a Map Maker that fits a phone */
  const GATE_WORD = (ch) => CH_NAMES[ch || 0];

  /* ---- art for the text pieces */
  const TX_SIZE = [0, 11, 16, 25];
  let TXF = null;
  function txFontC(e) { if (!TXF) TXF = { disp: (getComputedStyle(document.documentElement).getPropertyValue('--display') || 'Georgia, serif').trim() }; const sz = TX_SIZE[e.sz || 2]; return (e.cl === 1 || e.cl === 2) ? `${Math.round(sz * 1.2)}px ${TXF.disp}` : `800 ${sz}px ${FONT}`; }
  ART.tx = (c, x, y, e, t, mode) => {
    const txt = String(e.txt || '').trim();
    if (!txt) { if (mode !== 'game') { c.strokeStyle = 'rgba(239,230,210,0.35)'; c.setLineDash([3, 3]); c.strokeRect(x - 15, y - 15, 30, 30); c.setLineDash([]); } return; }
    const col = TX_COLS[e.cl || 0], fx = e.fx || 0;
    c.save();
    c.font = mode === 'icon' ? `800 14px ${FONT}` : txFontC(e);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    let a = e.cl === 0 ? 0.78 : 0.9;
    if (fx === 3 && mode !== 'icon') { const n = Math.sin(t * 23 + x) * Math.sin(t * 7.1 + y); a *= n > 0.6 ? 0.25 : 0.95; }
    const show = mode === 'icon' ? txt.slice(0, 3) : txt;
    if (fx === 1 && mode !== 'icon') { c.shadowColor = col; c.shadowBlur = 10 + 4 * Math.sin(t * 3 + x); }
    if (fx === 2 && mode !== 'icon') {
      const ws = [...show].map((ch) => c.measureText(ch).width), tw = ws.reduce((s, w) => s + w, 0);
      let px = x - tw / 2;
      [...show].forEach((ch, i) => {
        const yy = y + Math.sin(t * 4 + i * 0.6) * 2.4;
        c.globalAlpha = a * 0.5; c.fillStyle = '#000'; c.fillText(ch, px + ws[i] / 2 + 1, yy + 1.5);
        c.globalAlpha = a; c.fillStyle = col; c.fillText(ch, px + ws[i] / 2, yy);
        px += ws[i];
      });
    } else {
      c.globalAlpha = a * 0.45; c.fillStyle = '#000'; c.fillText(show, x + 1, y + 1.5);
      c.globalAlpha = a; c.fillStyle = col; c.fillText(show, x, y);
      if (e.cl === 0) { c.globalAlpha = a * 0.35; c.fillText(show, x + 0.7, y - 0.6); }
      if (e.cl === 1 && mode !== 'icon') {
        c.shadowBlur = 0; c.globalAlpha = 0.85; c.fillStyle = col;
        const w = c.measureText(show).width, n = Math.max(2, Math.floor(w / 14)), sz = TX_SIZE[e.sz || 2];
        for (let i = 0; i < n; i++) { const dx = x - w / 2 + ((i * 37 + 11) % Math.max(1, Math.floor(w))), len = 3 + ((i * 13) % 7) * (sz / 11); c.fillRect(dx, y + sz * 0.35, 1.3, len); circle(c, dx + 0.6, y + sz * 0.35 + len, 1.2); }
      }
    }
    c.restore();
  };
  const NT_LOOK = [['#efe2c4', '#5a3a1a'], ['#ffd23a', '#2a1a0c'], ['#2a1414', '#c8202a'], ['#1b2230', '#7cc4ff']];
  ART.nt = (c, x, y, e, t, mode) => {
    const [bg, ink] = NT_LOOK[e.ty || 0], read = mode === 'game' && e.read;
    c.save(); c.translate(x, y + (mode === 'game' && !read ? Math.sin(t * 2 + (e.t0 || 0)) * 1.2 : 0)); c.rotate(-0.12);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-10, -6, 22, 17);
    if ((e.ty || 0) === 3) {
      c.fillStyle = '#0c0d10'; rrect(c, -8, -12, 16, 24, 2.5); c.fill();
      c.fillStyle = read ? '#26303e' : bg; c.fillRect(-6.5, -9.5, 13, 18);
      if (!read) { c.fillStyle = ink; c.fillRect(-5, -7, 8, 3); c.fillRect(-3, -2.5, 7, 3); c.fillStyle = '#ff4a5a'; circle(c, 6, -10, 2.4); }
    } else {
      c.fillStyle = read ? 'rgba(160,150,130,0.55)' : bg; c.fillRect(-11, -9, 22, 17);
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(11, 3); c.lineTo(11, 8); c.lineTo(6, 8); c.fill();
      c.strokeStyle = ink; c.lineWidth = 1; c.globalAlpha = read ? 0.35 : 0.85;
      for (let i = 0; i < 3; i++) lineC(c, -8, -5 + i * 4, 6 - (i === 2 ? 5 : 0), -5 + i * 4);
      c.globalAlpha = 1;
      if ((e.ty || 0) === 1 && !read) { c.fillStyle = '#2a1a0c'; c.font = `900 9px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 7, -4); }
      if ((e.ty || 0) === 2 && !read) { c.fillStyle = '#c8202a'; circle(c, 7, 5, 2.2); }
    }
    c.restore();
  };
  ART.cq = (c, x, y, e, t, mode) => {
    const used = mode === 'game' && e.used;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 13, 14, 4.5); c.fill();
    c.fillStyle = used ? '#3a3430' : '#5a524c'; c.fillRect(x - 13, y + 4, 26, 9);
    c.fillStyle = used ? '#2a2522' : '#6e6660'; c.fillRect(x - 10, y - 14, 20, 19);
    c.fillStyle = used ? '#1c1816' : '#3a3430'; c.fillRect(x - 7, y - 10, 14, 12);
    if (used) { c.strokeStyle = '#100d0c'; c.lineWidth = 1.2; lineC(c, x - 9, y - 12, x + 2, y + 3); lineC(c, x + 2, y + 3, x + 7, y - 4); return; }
    const p = mode === 'icon' ? 1 : 0.65 + 0.35 * Math.sin(t * 3 + (e.t0 || 0));
    c.fillStyle = `rgba(255,197,58,${p})`; c.font = `900 13px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y - 3.5);
    c.fillStyle = '#8a827a'; c.fillRect(x - 13, y + 4, 26, 1.5);
  };
  ART.sh = (c, x, y, e, t, mode) => {
    if (mode === 'game') return;
    c.save();
    c.strokeStyle = 'rgba(255,197,58,0.7)'; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.strokeRect(x - 16, y - 16, 32, 32); c.setLineDash([]);
    c.fillStyle = '#ffc53a'; c.beginPath(); c.moveTo(x - 9, y - 3); c.lineTo(x - 3, y - 3); c.lineTo(x + 6, y - 9); c.lineTo(x + 6, y + 9); c.lineTo(x - 3, y + 3); c.lineTo(x - 9, y + 3); c.closePath(); c.fill();
    c.strokeStyle = '#ffc53a'; c.lineWidth = 1.4; c.beginPath(); c.arc(x + 7, y, 6, -0.7, 0.7); c.stroke();
    if (mode === 'edit') label(c, x + 11, y - 12, (e.on || 'e').toUpperCase(), '#ffc53a', 8);
    c.restore();
  };
  ART.pl = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], dn = mode === 'game' && e.down;
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x - 14, y - 13, 29, 29);
    c.fillStyle = '#3a3430'; c.fillRect(x - 15, y - 15, 30, 30);
    c.fillStyle = dn ? rgba(col, 0.55) : '#6e6660'; c.fillRect(x - 12, y - (dn ? 10 : 12), 24, dn ? 22 : 22);
    c.fillStyle = dn ? rgba(col, 0.9) : '#8a827a'; c.fillRect(x - 12, y - (dn ? 10 : 12), 24, 2);
    c.strokeStyle = rgba(col, dn ? 1 : 0.7); c.lineWidth = 1.6; c.strokeRect(x - 12.5, y - 12.5, 25, 25);
    if (mode === 'edit') label(c, x + 12, y - 13, CH_NAMES[e.ch || 0][0], col, 8);
  };
  Object.assign(FLAT, { tx: -1, pl: 0, sh: 1, nt: 2, cq: 5 });

  /* ---- the popup: notes, choices and intros stop the game until you answer */
  const Pop = { on: false, q: [], cur: null, typed: 0, full: '', tm: 0, el: null };
  function popBuild() {
    if (Pop.el) return Pop.el;
    const app = document.getElementById('app'); if (!app) return null;
    const d = document.createElement('div'); d.className = 'mkp'; d.id = 'mkPop'; d.hidden = true;
    d.innerHTML = '<div class="mkp-card" role="dialog" aria-modal="true" aria-labelledby="mkPopT"><div class="mkp-hd"><small id="mkPopK"></small><b id="mkPopT"></b></div><div class="mkp-bd" id="mkPopB"></div><div class="mkp-ops" id="mkPopO"></div><p class="mkp-hint" id="mkPopH"></p></div>';
    app.appendChild(d);
    d.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!e.target.closest('button')) { e.preventDefault(); popSkip(); } });
    Pop.el = d;
    return d;
  }
  function popPlace() {
    const d = Pop.el; if (!d || d.hidden) return;
    const card = d.firstChild;
    const cx = View.ox + (VIEW_W * View.s) / 2, cy = View.oy + (VIEW_H * View.s) / 2;
    card.style.left = Math.round(cx) + 'px';
    card.style.top = Math.round(Math.min(View.H - 12 - card.offsetHeight / 2, Math.max(12 + card.offsetHeight / 2, cy))) + 'px';
    card.style.width = Math.round(Math.min(460, Math.max(280, VIEW_W * View.s - 24), View.W - 24)) + 'px';
  }
  // o: { look: paper|warn|story|phone|choice|intro, kick, title, text, opts: [{ label, sub, off, fn }] }
  function popShow(o) {
    if (!popBuild()) return;
    Pop.q.push(o);
    if (!Pop.on) popNext();
  }
  function popNext() {
    const o = Pop.q.shift();
    if (!o) { popClose(); return; }
    if (!(G.state === 'play' || G.state === 'pause') || !G.run) { Pop.q.length = 0; popClose(); return; }
    Pop.on = true; Pop.cur = o; Pop.typed = 0; Pop.full = String(o.text || ''); Pop.tm = performance.now();
    Input.reset();
    const d = Pop.el, card = d.firstChild;
    card.className = 'mkp-card ' + (o.look || 'paper');
    $('mkPopK').textContent = o.kick || '';
    $('mkPopT').textContent = o.title || '';
    const bd = $('mkPopB'); bd.textContent = '';
    if (o.look === 'phone') {
      const raw = Pop.full.includes('|') ? Pop.full.split('|') : Pop.full.replace(/([.!?])\s+(?=[A-Z0-9"'])/g, '$1|').split('|');
      const parts = raw.map((x) => x.trim()).filter(Boolean).slice(0, 8);
      Pop.parts = parts; Pop.full = parts.join('\n');
      for (const p of parts) { const b = el('div', 'bub', ''); b.dataset.t = p; bd.appendChild(b); }
    } else { Pop.parts = null; bd.appendChild(el('p', null, '')); }
    const ops = $('mkPopO'); ops.textContent = '';
    const list = o.opts && o.opts.length ? o.opts : [{ label: o.ok || 'Got it', fn: null }];
    list.forEach((op, i) => {
      const b = el('button', 'mkp-op' + (op.off ? ' off' : '') + (list.length > 1 && i === 0 ? ' a' : ''), `<kbd>${list.length > 1 ? i + 1 : '↵'}</kbd><span><b>${esc(op.label)}</b>${op.sub ? `<small>${esc(op.sub)}</small>` : ''}</span>`);
      b.type = 'button'; if (op.off) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); popPick(i); });
      ops.appendChild(b);
    });
    $('mkPopH').textContent = list.length > 1 ? 'Pick one. Keys 1 and 2 work too.' : 'Tap, Enter or Space to go on.';
    d.hidden = false;
    popPaint();
    requestAnimationFrame(() => { popPlace(); card.classList.add('in'); });
    safe(() => (o.look === 'phone' ? Sfx.blip('jens') : Sfx.tone(520, 0.09, { type: 'triangle', vol: 0.05, to: 780 })));
  }
  function popPaint() {
    const n = Math.floor(Pop.typed);
    if (Pop.parts) {
      let left = n;
      for (const b of $('mkPopB').children) { const t = b.dataset.t; const k = Math.max(0, Math.min(t.length, left)); left -= t.length + 1; b.textContent = t.slice(0, k); b.classList.toggle('on', k > 0); }
    } else { const p = $('mkPopB').firstChild; if (p) p.textContent = Pop.full.slice(0, n); }
    Pop.el.firstChild.classList.toggle('typing', n < Pop.full.length);
  }
  function popSkip() {
    if (!Pop.on) return false;
    if (Pop.typed < Pop.full.length) { Pop.typed = Pop.full.length; popPaint(); return true; }
    return false;
  }
  function popPick(i) {
    const o = Pop.cur; if (!o) return;
    if (performance.now() - Pop.tm < 260) return;
    if (popSkip()) return;
    const list = o.opts && o.opts.length ? o.opts : [{}];
    const op = list[i]; if (!op) return;
    if (op.off) { safe(() => Sfx.thud()); const b = $('mkPopO').children[i]; if (b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); } return; }
    Pop.cur = null;
    Pop.el.firstChild.classList.remove('in');
    Pop.on = false;
    Input.reset();
    if (op.fn) safe(op.fn);
    if (Pop.q.length) setTimeout(popNext, 120); else popClose();
  }
  function popClose() {
    Pop.on = false; Pop.cur = null;
    if (Pop.el) { Pop.el.hidden = true; Pop.el.firstChild.classList.remove('in'); }
  }
  // typing runs on its own clock, the game clock is stopped
  /* T3, T4: a UI task of the one scheduler, typed by time: 132 characters a second (the phone look 96) */
  function popTick(now, dt) {
    if (Pop.on && Pop.typed < Pop.full.length && Pop.el && !Pop.el.hidden) { Pop.typed = Math.min(Pop.full.length, Pop.typed + (Pop.cur && Pop.cur.look === 'phone' ? 96 : 132) * dt); popPaint(); if (Math.floor(Pop.typed) % 5 === 0) safe(() => Sfx.tone(900 + Math.random() * 200, 0.02, { type: 'square', vol: 0.008, lp: 2400 })); }
  }
  Sched.every('ui', 'v12.4 pop typing', popTick, () => Pop.on);
  window.addEventListener('keydown', (e) => {
    if (!Pop.on || !Pop.el || Pop.el.hidden || G.state !== 'play') return;
    const o = Pop.cur; if (!o) return;
    const n = o.opts && o.opts.length ? o.opts.length : 1;
    if (e.code === 'Escape' && n > 1) return;
    e.preventDefault(); e.stopPropagation();
    if (e.repeat) return;
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE' || e.code === 'NumpadEnter') { if (!popSkip() && n === 1) popPick(0); }
    else if (e.code === 'Escape') { if (!popSkip()) popPick(0); }
    else if (/^(Digit|Numpad)[1-4]$/.test(e.code)) { const i = Number(e.code.slice(-1)) - 1; if (i < n) popPick(i); }
  }, true);
  window.addEventListener('resize', () => safe(popPlace));
  safe(() => {
    Hooks.layer('Game.update', 'v12.4 Pop freeze', function (next) { if (Pop.on && G.state === 'play') return; return next.apply(this, [].slice.call(arguments, 1)); });
    const pa0 = Game.pause;
    Game.pause = function () { const r = pa0.apply(this, arguments); if (Pop.el && G.state === 'pause') Pop.el.hidden = true; return r; };
    const rs0 = Game.resume;
    Game.resume = function () { const r = rs0.apply(this, arguments); if (Pop.on && Pop.el && G.state === 'play') { Pop.el.hidden = false; Input.reset(); requestAnimationFrame(popPlace); } return r; };
    for (const k of ['toMenu', 'gameOver', 'win']) {
      const f0 = Game[k];
      if (typeof f0 === 'function') Game[k] = function () { Pop.q.length = 0; popClose(); capHide(); return f0.apply(this, arguments); };
    }
    Hooks.layer('Game.startRun', 'v12.4 Pop close', function (next) { Pop.q.length = 0; popClose(); capHide(); return next.apply(this, [].slice.call(arguments, 1)); });
  });

  /* ---- the caption: a line of text at the top of the room, for room texts */
  const Cap = { el: null, t: 0, full: '', typed: 0, hideAt: 0 };
  function capShow(text, kick) {
    text = String(text || '').trim(); if (!text) return;
    if (!Cap.el) {
      const app = document.getElementById('app'); if (!app) return;
      Cap.el = el('div', 'mkcap'); Cap.el.setAttribute('aria-live', 'polite'); app.appendChild(Cap.el);
    }
    Cap.full = text; Cap.typed = 0; Cap.kick = kick || '';
    Cap.el.innerHTML = `${kick ? `<small>${esc(kick)}</small>` : ''}<span></span>`;
    Cap.el.style.top = Math.round(View.oy + (WALL + RH) * View.s - 10) + 'px';
    Cap.el.style.maxWidth = Math.round(Math.min(560, VIEW_W * View.s - 28)) + 'px';
    Cap.el.classList.add('show');
    Cap.hideAt = performance.now() + 2600 + text.length * 55;
  }
  function capHide() { if (Cap.el) Cap.el.classList.remove('show'); Cap.hideAt = 0; }
  /* T3, T4: typed by time, 84 characters a second; while the game waits the hide clock waits by real time */
  function capTick(now, dt) {
    if (Cap.el && Cap.hideAt) {
      if (G.state === 'play' && !Pop.on) {
        if (Cap.typed < Cap.full.length) { Cap.typed = Math.min(Cap.full.length, Cap.typed + 84 * dt); Cap.el.lastChild.textContent = Cap.full.slice(0, Math.floor(Cap.typed)); }
        else if (performance.now() > Cap.hideAt) capHide();
      } else if (G.state !== 'play' && G.state !== 'pause') capHide();
      else Cap.hideAt += dt * 1000;
    }
  }
  Sched.every('ui', 'v12.4 captions', capTick, () => !!(Cap.el && Cap.hideAt));

  /* ---- what the answers at a Choice do */
  const FX_SUB = {
    none: 'Nothing happens', heal: '+1 apple', hurt: 'Costs half an apple', coins: '+10 coins', buy: 'Costs 10 coins, gives a powerup', deal: 'Costs an apple, gives a powerup',
    item: 'A free powerup', down: 'A downgrade, on purpose', snakes: 'Three snakes come out', gate: 'The gates flip', bomb: 'It explodes', key: 'A key drops',
  };
  function fxOff(fx) {
    const P = G.player;
    if (fx === 'buy' && (G.run.coins || 0) < 10) return 'You have ' + (G.run.coins || 0) + ' coins. It wants 10.';
    if (fx === 'deal' && P.hp <= 2) return 'Not enough apple left to pay with.';
    if (fx === 'heal' && P.hp >= P.maxHp) return '';
    return '';
  }
  function freeSpot(room, k) { const f = safe(() => nearestFreeCell(room, k.x, k.y + T, (c, r) => c === k.c && r === k.r)); return f || { x: k.x, y: k.y + T }; }
  function runFx(room, k, fx) {
    const P = G.player;
    switch (fx) {
      case 'heal': P.heal(2); Sfx.tone(660, 0.18, { to: 990, type: 'triangle', vol: 0.06 }); floatText(P.x, P.y - 28, '+1 APPLE', '#ff6a7a', true); break;
      case 'hurt': P.inv = 0; P.dashT = 0; P.hurt(1, k.x, k.y - 10); break;
      case 'coins': G.run.coins = (G.run.coins || 0) + 10; Sfx.coin(); floatText(P.x, P.y - 28, '+10 COINS', '#ffd84a', true); break;
      case 'buy': { G.run.coins = Math.max(0, (G.run.coins || 0) - 10); Sfx.coin(); const f = freeSpot(room, k); spawnItem(room, f.x, f.y); floatText(k.x, k.y - 30, '-10 COINS', '#ffd84a'); break; }
      case 'deal': { P.inv = 0; P.dashT = 0; P.hurt(2, k.x, k.y - 10); const f = freeSpot(room, k); setTimeout(() => { if (G.room === room && G.state === 'play') spawnItem(room, f.x, f.y); }, 450); break; }
      case 'item': { const f = freeSpot(room, k); spawnItem(room, f.x, f.y); break; }
      case 'down': safe(() => giveDown()); break;
      case 'snakes': {
        const kinds = ['grub', 'grub', 'grub'];
        kinds.forEach((kd, i) => {
          const cell = safe(() => Game.farCell(room, P, new Set())) || { x: k.x, y: k.y };
          const sn = safe(() => new Snake(kd, cell.x, cell.y, { delay: 0.2 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
          if (sn) room.snakes.push(sn);
        });
        Sfx.hiss(0.9); UI.banner('Bad answer', 'Something came out of the walls.', 'curse');
        break;
      }
      case 'gate': if (G.map && G.map.mkCh) { G.map.mkCh[k.ch || 0] ^= 1; applyGates(G.map, true); Sfx.clank(); floatText(k.x, k.y - 30, `${GATE_WORD(k.ch).toUpperCase()} GATES`, CH_COLS[k.ch || 0], true); } break;
      case 'bomb': explode(room, k.x, k.y, 70, { dmg: 1, snakeDmg: 7 }); break;
      case 'key': room.pickups.push({ kind: 'key', x: k.x, y: k.y + 22, vx: 0, vy: 80, t: 0.5, ph: Math.random() * 10 }); Sfx.tone(880, 0.2, { to: 1320, type: 'triangle', vol: 0.06 }); break;
      default: floatText(k.x, k.y - 30, 'NOTHING', '#b8a8a0'); break;
    }
  }
  const NT_LOOKS = ['paper', 'warn', 'story', 'phone'];
  const NT_KICK = ['A note', 'Warning', 'A page', 'New message'];
  function askChoice(room, k) {
    const hide = k.hd === 1;
    const mk = (label, fx) => { const off = fxOff(fx); return { label: label || 'Answer', sub: off || (hide ? 'Who knows' : FX_SUB[fx] || ''), off: !!off, fn: () => { k.used = true; burst(k.x, k.y, 12, '#6e6660', { kind: 'shard', min: 30, max: 110, lmin: 0.3, lmax: 0.7 }); runFx(room, k, fx); } }; };
    const opts = [mk(k.a, k.ae), mk(k.b, k.be)];
    if (opts.every((o) => o.off)) opts.push({ label: 'Leave it', sub: 'Come back later', fn: () => { k.away = true; } });
    popShow({ look: 'choice', kick: 'A choice', title: k.ti || 'A choice', text: k.txt || '', opts });
  }

  /* ---- the text pieces at work */
  function mk8Update(dt, room) {
    const P = G.player, alive = P.dying <= 0 && P.escaping <= 0 && !G.trans;
    for (const k of room.mkE) {
      if (k.dead) continue;
      const inside = alive && inCell(P, k, 7);
      switch (k.t) {
        case 'nt':
          if (inside && !k.inside && !(k.on === 'o' && k.read)) { k.read = true; popShow({ look: NT_LOOKS[k.ty || 0], kick: NT_KICK[k.ty || 0], title: k.ti || '', text: k.txt || '' }); }
          break;
        case 'cq':
          if (inside && !k.inside && !k.used) askChoice(room, k);
          break;
        case 'sh':
          if (k.fired) break;
          if (k.on === 's' ? inside : k.on === 'c' ? room.cleared && !room.locked : ((k.tm = (k.tm || 0) + dt) > 0.6)) {
            k.fired = true; UI.banner(k.txt || '', k.s || '', k.st || undefined); safe(() => (k.st === 'curse' ? Sfx.stinger() : Sfx.tone(440, 0.2, { to: 660, type: 'triangle', vol: 0.05 })));
          }
          break;
        case 'pl': {
          let on = inside;
          if (!on) for (const ct of room.carts) if (inCell(ct, k, 4)) { on = true; break; }
          if (on !== !!k.down) {
            k.down = on;
            if (on || k.m === 'h') {
              if (G.map && G.map.mkCh) { G.map.mkCh[k.ch || 0] ^= 1; applyGates(G.map, true); }
              Sfx.tone(on ? 220 : 180, 0.12, { to: on ? 140 : 240, type: 'square', vol: 0.06, lp: 900 });
              if (on && G.map) { const n = G.map.mkGates.filter((g) => (g.e.ch || 0) === (k.ch || 0)).length; floatText(k.x, k.y - 24, n ? `${GATE_WORD(k.ch).toUpperCase()} GATES` : 'CLICK', CH_COLS[k.ch || 0], !!n); }
            }
          }
          break;
        }
        default: break;
      }
      if (k.t === 'nt' || k.t === 'cq') k.inside = inside;
    }
    // snakes that talk
    if (room.mkTalk && room.mkTalk.length) {
      for (const sn of room.mkTalk) {
        if (sn.mkSay && !sn.mkSaid && sn.alive && G.t >= sn.mkSayAt) { sn.mkSaid = G.t; safe(() => Sfx.hiss(0.35)); }
        if (sn.mkDie && !sn.mkDied && (!sn.alive || sn.hp <= 0)) { sn.mkDied = true; (room.mkWords || (room.mkWords = [])).push({ x: sn.x, y: sn.y - 14, txt: sn.mkDie, t: G.t }); }
      }
      if (room.mkTalk.every((s) => s.mkDied || !s.mkDie) && room.mkTalk.every((s) => !s.alive)) room.mkTalk = [];
    }
  }
  function drawBubble(c, x, y, text, a, look) {
    c.save(); c.globalAlpha = a;
    c.font = `700 9.5px ${FONT}`;
    const lines = wrapText(c, text, 120);
    if (!lines.length) { c.restore(); return; }
    const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 14, h = lines.length * 11.5 + 8;
    const bx = clamp(x - w / 2, 4, RW - w - 4); let by = y - h - 8;
    if (by < 2) by = y + 18;
    const bg = look === 'die' ? '#2a1414' : '#efe2c4', fg = look === 'die' ? '#ffb4bc' : '#2a1a0c', ln = look === 'die' ? '#c8202a' : '#5a3a1a';
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(bx + 2, by + 3, w, h);
    c.fillStyle = bg; c.fillRect(bx, by, w, h);
    c.strokeStyle = ln; c.lineWidth = 1.2; c.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
    if (by < y) { c.fillStyle = bg; c.beginPath(); c.moveTo(x - 4, by + h - 0.5); c.lineTo(x, by + h + 5); c.lineTo(x + 4, by + h - 0.5); c.fill(); }
    c.fillStyle = fg; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach((l, i) => c.fillText(l, bx + 7, by + 4.5 + i * 11.5));
    c.restore();
  }
  safe(() => {
    const ure8 = updateRoomExtras;
    updateRoomExtras = function (dt, room, frozen) {
      ure8.apply(this, arguments);
      if (room && room.mkE && G.map && G.state === 'play' && !Pop.on) safe(() => mk8Update(dt, room));
    };
    const df8 = drawFloorThings;
    drawFloorThings = function (c, room, t) {
      if (room && room.mkE && room.mkE.length) safe(() => { for (const k of room.mkE) if (!k.dead && (k.t === 'tx' || k.t === 'pl')) ART[k.t](c, k.x, k.y, k, t, 'game'); });
      df8.apply(this, arguments);
      if (room && room.mkE && room.mkE.length) safe(() => { for (const k of room.mkE) if (!k.dead && (k.t === 'nt' || k.t === 'cq')) ART[k.t](c, k.x, k.y, k, t, 'game'); });
    };
    const gl8 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      gl8.apply(this, arguments);
      if (!room) return;
      safe(() => {
        if (room.mkE) {
          c.globalCompositeOperation = 'lighter';
          for (const k of room.mkE) {
            if (k.dead) continue;
            if (k.t === 'cq' && !k.used) glowDot(c, k.x, k.y - 4, 22, '#ffc53a', 0.16 + 0.06 * Math.sin(t * 3 + k.t0));
            else if (k.t === 'nt' && !k.read) glowDot(c, k.x, k.y, 18, '#efe2c4', 0.1 + 0.05 * Math.sin(t * 2 + k.t0));
            else if (k.t === 'tx' && k.fx === 1) glowDot(c, k.x, k.y, 20 + TX_SIZE[k.sz || 2] * 1.4, TX_COLS[k.cl || 0], 0.14);
            else if (k.t === 'pl' && k.down) glowDot(c, k.x, k.y, 24, CH_COLS[k.ch || 0], 0.3);
          }
          c.globalCompositeOperation = 'source-over';
        }
        if (room.mkTalk) for (const sn of room.mkTalk) {
          if (!sn.mkSaid || !sn.alive) continue;
          const age = G.t - sn.mkSaid, hold = 2.4 + sn.mkSay.length * 0.05, a = age < 0.15 ? age / 0.15 : age > hold ? Math.max(0, 1 - (age - hold) / 0.4) : 1;
          if (a > 0.01) drawBubble(c, sn.x, sn.y - (sn.headR || 10) - 4, sn.mkSay, a, 'say');
        }
        if (room.mkWords && room.mkWords.length) {
          room.mkWords = room.mkWords.filter((w) => G.t - w.t < 2.8);
          for (const w of room.mkWords) { const age = G.t - w.t; drawBubble(c, w.x, w.y - age * 6, w.txt, age > 2.3 ? (2.8 - age) / 0.5 : 1, 'die'); }
        }
      });
    };
    const xl8 = extraLights;
    extraLights = function (room, light) {
      xl8.apply(this, arguments);
      if (!room || !room.mkE) return;
      for (const k of room.mkE) {
        if (k.dead) continue;
        if (k.t === 'cq' && !k.used) light(k.x, k.y, 40, 0.45);
        else if (k.t === 'tx' && k.fx === 1) light(k.x, k.y, 30 + TX_SIZE[k.sz || 2] * 1.5, 0.4);
        else if (k.t === 'nt' && !k.read) light(k.x, k.y, 24, 0.25);
      }
    };
  });

  /* ---- intros, room lines and the last word */
  safe(() => {
    Hooks.layer('Game.loadLevel', 'v12.4 floor text', function (next, i) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => {
        const M = RTM.cur, F = M.floors[G.levelIdx] || M.floors[0];
        const q = [];
        if (G.levelIdx === 0 && M.it && !RTM.startRoom) q.push({ look: 'intro', kick: M.author ? 'A map by ' + M.author : 'A map', title: M.name, text: M.it, ok: 'Start' });
        if (F && F.it) q.push({ look: 'story', kick: floorLabel(G.levelIdx), title: F.name || G.levelDef.name || '', text: F.it, ok: 'Go' });
        if (q.length) { const run = G.run; setTimeout(() => { if (G.run === run && G.state === 'play') for (const o of q) popShow(o); }, 1300); }
      });
      return r;
    });
    Hooks.layer('Game.enterRoom', 'v12.4 room words', function (next, room) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => {
        if (room && room.mkR && room.mkR.ie && !room.mkIeDone) { room.mkIeDone = true; setTimeout(() => { if (G.room === room && G.state === 'play') capShow(room.mkR.ie); }, 450); }
        else if (room && G.room === room) capHide();
      });
      return r;
    });
    Hooks.layer('Game.clearRoom', 'v12.4 room words', function (next, room) {
      const was = room && room.cleared;
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => { if (room && !was && room.cleared && room.mkR && room.mkR.ic && !room.mkIcDone) { room.mkIcDone = true; setTimeout(() => { if (G.room === room && G.state === 'play') capShow(room.mkR.ic); }, 700); } });
      return r;
    });
    const w8 = Game.win;
    Game.win = function () {
      const r = w8.apply(this, arguments);
      if (inMap() && RTM.cur.ot) safe(() => { UI.el.winLead.textContent = RTM.cur.ot + '  ' + UI.el.winLead.textContent; });
      return r;
    };
  });

  /* ================================================================== the editor: touch, a cell sheet, recent brushes, help */
  // touch: a tap paints when the finger lifts, a drag paints as it goes, a long press opens the cell
  const GS = { p: null, n: 0 };
  function gDown(e) {
    if (e.pointerType !== 'touch' || !Maker.M) { const now = performance.now(); if (!GS.mu || now - GS.mu.t > 500) GS.mu = { u: Maker.undo.length, t: now }; return onDown(e); }
    GS.n++;
    if (GS.p) { clearTimeout(GS.p.tm); if (GS.p.started) onUp(e); GS.p = null; return; }
    const p = cellFrom(e);
    if (!p.inside) return onDown(e);
    e.preventDefault();
    try { Maker.cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const st = { id: e.pointerId, x: e.clientX, y: e.clientY, ev: { clientX: e.clientX, clientY: e.clientY, button: 0, pointerId: e.pointerId, pointerType: 'touch', preventDefault() {} }, started: false, long: false };
    st.tm = setTimeout(() => {
      if (GS.p !== st || st.started) return;
      st.long = true;
      safe(() => navigator.vibrate && navigator.vibrate(12));
      openCell(p.c, p.r, { x: st.x, y: st.y });
    }, 430);
    GS.p = st;
    Maker.hover = { c: p.c, r: p.r };
  }
  function gMove(e) {
    const st = GS.p;
    if (st && e.pointerId === st.id && !st.started && !st.long) {
      if (Math.hypot(e.clientX - st.x, e.clientY - st.y) < 9) return;
      clearTimeout(st.tm); st.started = true; onDown(st.ev);
    }
    if (st && st.long) return;
    onMove(e);
  }
  function gUp(e) {
    const st = GS.p;
    if (st && e.pointerId === st.id) {
      clearTimeout(st.tm); GS.p = null;
      if (st.long) return;
      if (!st.started) {
        const p = cellFrom(st.ev);
        if (Maker.tool === 'move' && p.inside && entAt(R_(), p.c, p.r)) { onDown(st.ev); onUp(e); openCell(p.c, p.r, { x: st.x, y: st.y }); return; }
        onDown(st.ev);
      }
    }
    onUp(e);
  }
  function gDbl(e) {
    if (!Maker.M) return;
    const p = cellFrom(e); if (!p.inside) return;
    e.preventDefault();
    // the first click of a double click painted: take that back before opening the cell
    if (GS.mu && performance.now() - GS.mu.t < 700 && Maker.undo.length > GS.mu.u) { restore(Maker.undo.pop()); syncUndo(); }
    GS.mu = null;
    openCell(p.c, p.r, { x: e.clientX, y: e.clientY });
  }

  // the cell sheet: what is on this tile, change it, or put something here
  function closeCell() { const s = $('mkSheet'); if (s) { s.hidden = true; s.textContent = ''; } Maker.cell = null; }
  function openCell(c, r, at) {
    const sh = $('mkSheet'); if (!sh || !Maker.M) return;
    const R = R_(), F = F_(), e = entAt(R, c, r), ch = R.g[r * GW + c];
    if (!Maker.cell || Maker.cell.c !== c || Maker.cell.r !== r) Maker.cellT = performance.now();
    Maker.cell = { c, r, at };
    if (e) { Maker.sel = { c, r }; renderInspector(); }
    sh.textContent = '';
    const card = el('div', 'mks-card');
    const hd = el('div', 'mks-hd');
    hd.appendChild(el('div', null, `<small>${esc(RT[R.t].name)} ${colName(R.x)}${R.y + 1}</small><b>Tile ${colName(c)}${r + 1}</b>`));
    hd.appendChild(btn('ic', SVG('<path d="M6 6l12 12M18 6L6 18"/>'), 'Close', closeCell));
    card.appendChild(hd);
    const bd = el('div', 'mks-bd');
    const lock = FIXED[R.t];
    // the tile
    const tb = el('div', 'mks-item');
    tb.appendChild(canvasIcon(40, (cc, s) => paintBrushIcon(cc, s, { k: 'tile', ch }, F.set)));
    tb.appendChild(el('div', null, `<b>${esc(TILE[ch].name)}</b><span>${esc(TILE[ch].desc)}</span>`));
    bd.appendChild(tb);
    const ta = el('div', 'mk-acts');
    ta.append(btn('', IC.brush + 'Paint with this', 'Use this tile as the brush', () => { pickBrush({ k: 'tile', ch }); closeCell(); toast(`Brush: ${TILE[ch].name}`); }));
    if (ch !== '.' && !lock) ta.append(btn('', IC.erase + 'Make it floor', 'Turn this tile into floor', () => { pushUndo(); setCh(R, c, r, '.'); changed(); openCell(c, r, at); }));
    bd.appendChild(ta);
    // the piece on it
    if (e) {
      bd.appendChild(el('h4', 'mk-h', e.t === 'sn' ? 'Snake here' : 'Piece here'));
      const pb = el('div', 'mks-item');
      pb.appendChild(canvasIcon(40, (cc, s) => paintBrushIcon(cc, s, { k: 'ent', t: e.t, p: e }, F.set)));
      pb.appendChild(el('div', null, `<b>${esc(brushName({ k: 'ent', t: e.t, p: e }))}</b><span>${esc(brushDesc({ k: 'ent', t: e.t, p: e }))}</span>`));
      bd.appendChild(pb);
      const apply = (k, v) => { pushUndo(); e[k] = v; changed(); renderInspector(); openCell(c, r, at); };
      for (const p of ENT_PARAMS[e.t]) bd.appendChild(paramControl(p, e, apply));
      const pa = el('div', 'mk-acts');
      pa.append(
        btn('', IC.brush + 'Use as brush', 'Paint with these settings', () => { const p = Object.assign({}, e); delete p.c; delete p.r; delete p.t; pickBrush({ k: 'ent', t: e.t, p }); closeCell(); }),
        btn('red', IC.trash + 'Remove', 'Remove this piece', () => { pushUndo(); R.e = R.e.filter((x) => x !== e); Maker.sel = null; changed(); renderInspector(); openCell(c, r, at); }),
      );
      bd.appendChild(pa);
    } else if (!lock) {
      // put something here: the current brush and the recent ones
      bd.appendChild(el('h4', 'mk-h', 'Put here'));
      const grid = el('div', 'mks-put');
      const list = recentList(true);
      for (const b of list.slice(0, 10)) {
        const x = el('button', 'mk-br'); x.type = 'button'; x.title = b.name;
        x.appendChild(canvasIcon(34, (cc, s) => paintBrushIcon(cc, s, b, F.set)));
        x.appendChild(el('span', null, esc(b.name)));
        x.addEventListener('click', (ev) => { ev.preventDefault(); pickBrush(b); Maker.stroke = { tool: 'brush', saved: false, changed: false }; applyAt(c, r, 'brush'); const st = Maker.stroke; Maker.stroke = null; if (st.changed || st.saved) changed(); closeCell(); });
        grid.appendChild(x);
      }
      bd.appendChild(grid);
      bd.appendChild(el('p', 'mk-p', 'More pieces under Paint. The one you pick there shows up here next time.'));
    } else bd.appendChild(el('div', 'mk-note', 'This room has a fixed layout. Painting here does nothing.'));
    card.appendChild(bd);
    sh.appendChild(card);
    sh.hidden = false;
    const narrow = window.innerWidth < 720 || window.innerHeight < 520;
    sh.classList.toggle('bottom', narrow);
    card.style.left = card.style.top = '';
    if (!narrow && at) {
      const w = 340, h = Math.min(card.offsetHeight || 420, window.innerHeight - 24);
      card.style.left = Math.round(Math.max(12, Math.min(window.innerWidth - w - 12, at.x + 18))) + 'px';
      card.style.top = Math.round(Math.max(12, Math.min(window.innerHeight - h - 12, at.y - 40))) + 'px';
    }
  }

  // recent brushes: the last ten things you painted with
  function recentList(withCur) {
    const out = [], seen = new Set();
    const add = (b) => { const id = brushId(b); if (seen.has(id)) return; seen.add(id); out.push(Object.assign({}, b, { name: brushName(b), id })); };
    if (withCur) add(Maker.brush);
    for (const b of Maker.recent || []) add(b);
    if (out.length < 6) for (const b of [{ k: 'tile', ch: '#' }, { k: 'tile', ch: 'u' }, { k: 'ent', t: 'sn', p: { k: 'grub', g: 0, tr: '' } }, { k: 'ent', t: 'nt', p: entDefaults('nt') }, { k: 'ent', t: 'cn', p: { n: 3 } }, { k: 'ent', t: 'tx', p: entDefaults('tx') }]) if (TILE[b.ch] || b.k === 'ent') add(b);
    return out;
  }
  safe(() => {
    const pb0 = pickBrush;
    pickBrush = function (b) {
      const r = pb0.apply(this, arguments);
      safe(() => {
        const nb = b.k === 'tile' ? { k: 'tile', ch: b.ch } : { k: 'ent', t: b.t, p: Object.assign({}, b.p) };
        const id = brushId(nb);
        Maker.recent = [nb].concat((Maker.recent || []).filter((x) => brushId(x) !== id)).slice(0, 10);
        paintRecent(); paintChip();
      });
      return r;
    };
    const rp0 = renderPaint;
    renderPaint = function () { const r = rp0.apply(this, arguments); safe(paintRecent); return r; };
    const st0 = setTool;
    setTool = function () { const r = st0.apply(this, arguments); safe(paintChip); return r; };
    const ri0 = renderInspector;
    renderInspector = function () { const r = ri0.apply(this, arguments); safe(paintChip); return r; };
  });
  function paintRecent() {
    const pane = $('mkPanePaint'); if (!pane) return;
    let row = $('mkRecent');
    if (!row) { row = el('div', 'mk-recent'); row.id = 'mkRecent'; const cats = pane.querySelector('.mk-cats'); if (cats) cats.insertAdjacentElement('afterend', row); else return; }
    row.textContent = '';
    const list = (Maker.recent || []).slice(0, 10);
    if (!list.length) { row.hidden = true; return; }
    row.hidden = false;
    row.appendChild(el('small', null, 'Recent'));
    const set = F_().set, cur = brushId(Maker.brush);
    for (const b of list) {
      const x = el('button', brushId(b) === cur ? 'on' : ''); x.type = 'button'; x.title = brushName(b); x.setAttribute('aria-label', brushName(b));
      x.appendChild(canvasIcon(30, (cc, s) => paintBrushIcon(cc, s, b, set)));
      x.addEventListener('click', (ev) => { ev.preventDefault(); pickBrush(b); });
      row.appendChild(x);
    }
  }
  // the brush chip on the room: what a tap will paint
  function paintChip() {
    const ch = $('mkChip'); if (!ch || !Maker.M) return;
    ch.textContent = '';
    const tool = Maker.tool;
    const b = tool === 'erase' ? { k: 'tile', ch: '.' } : Maker.brush;
    ch.appendChild(canvasIcon(24, (cc, s) => paintBrushIcon(cc, s, b, F_().set)));
    const word = { brush: 'Brush', erase: 'Eraser', fill: 'Fill', box: 'Box', pick: 'Picker', move: 'Select' }[tool] || 'Brush';
    ch.appendChild(el('span', null, `<small>${word}</small>${esc(tool === 'erase' ? 'Rubs out' : tool === 'pick' ? 'Tap to copy' : tool === 'move' ? 'Tap a piece' : brushName(b))}`));
  }

  /* ---- help: a few pages, shown once on the first visit */
  const HELP = [
    ['Start here', [
      ['The idea', 'A map is one to eight floors. A floor is rooms on a grid. Every floor needs a start room, and a lair or an exit hatch to leave by.'],
      ['Paint', 'Pick a piece under Paint, then paint the room. Tiles, snakes, traps, gadgets, loot and words. Undo is top left and never runs out of patience.'],
      ['Rooms', 'Room sets the type: fight, hall, shop, lair and so on. It also sets doors, locks, and what the room says when you walk in.'],
      ['Floors and map', 'Floor is the bird view: add rooms, move between them, set looks and the boss. Map holds the rules, the story and the share code.'],
    ]],
    ['On a phone', [
      ['Tap', 'A tap paints one tile when you lift your finger. Drag to paint a line.'],
      ['Hold', 'Hold a tile for half a second. A sheet opens: what is there, its settings, and a row of pieces to drop on it.'],
      ['Select', 'With Select on, tap a piece to open its settings. Drag it to move it.'],
      ['Panel height', 'Drag the bar above Paint, Room, Floor and Map. Up gives the panel more room, down gives the room more. Double tap the bar to reset.'],
      ['Walls', 'Tap a plus on a wall to add a room on that side. Tap a door label to cycle door, wall and crack.'],
      ['Turn it', 'On a phone held sideways, the room sits left and the panels sit right.'],
    ]],
    ['Words', [
      ['Floor text', 'Paint words on the floor. Chalk, blood, gold, slime or ice. Still, glowing, waving or flickering.'],
      ['Note', 'A note on the floor. Step on it and the game stops while it reads out. Paper, a warning, a story page, or a phone full of messages. Split messages with a | sign.'],
      ['Choice', 'A shrine with a question and two answers. Each answer does one thing: heal, hurt, coins, a powerup, a downgrade, snakes, gates, a bomb or a key. Hide the outcome for a gamble.'],
      ['Shout', 'An invisible trigger. A big line over the room when you walk in, step on it, or clear the room.'],
      ['Talking snakes', 'Every snake can say one line when the fight starts, and leave last words.'],
      ['Room, floor and map lines', 'A room can say something when you walk in and when it is clear. A floor can open with a page. The map can open with a story and close with your own last line.'],
    ]],
    ['Codes and keys', [
      ['Share', 'Share turns the whole map into one line of text. Send it. Whoever pastes it in the Map Maker can play it or edit a copy.'],
      ['Keys', 'B brush, E eraser, F fill, R box, I picker, V select. X and Y mirror. G grid. T tests. Ctrl Z and Ctrl Y undo and redo. Arrows walk between rooms.'],
      ['Mouse', 'Right click rubs out. Double click a tile for the cell sheet.'],
      ['Saving', 'Maps save in this browser as you go. Clear the browser and they are gone. The share code is the backup.'],
    ]],
  ];
  function openHelp(page) {
    let i = Math.max(0, Math.min(HELP.length - 1, page | 0));
    const body = el('div', 'mk-help');
    const tabs = el('div', 'mk-seg');
    const box = el('div', 'mk-help-p');
    body.append(tabs, box);
    const prev = btn('', 'Back', 'Previous page', () => go(i - 1));
    const next = btn('gold', 'Next', 'Next page', () => { if (i >= HELP.length - 1) closeDlg(); else go(i + 1); });
    const go = (n) => {
      i = Math.max(0, Math.min(HELP.length - 1, n));
      tabs.textContent = '';
      HELP.forEach(([nm], k) => { const b = el('button', k === i ? 'on' : '', esc(nm)); b.type = 'button'; b.addEventListener('click', (ev) => { ev.preventDefault(); go(k); }); tabs.appendChild(b); });
      box.innerHTML = HELP[i][1].map(([b, s]) => `<div class="mk-tip"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
      prev.disabled = i === 0;
      next.lastChild.textContent = i >= HELP.length - 1 ? 'Done' : 'Next';
      if (next.lastChild.nodeType !== 3) next.textContent = i >= HELP.length - 1 ? 'Done' : 'Next';
    };
    dlg('How the Map Maker works', body, [prev, next]);
    go(i);
  }

  /* ---- extra fields: what rooms, floors and the map say */
  function textField(label, val, max, ph, rows, onSet) {
    const t = el(rows ? 'textarea' : 'input', 'mk-in'); t.maxLength = max; t.value = val || ''; t.placeholder = ph; if (rows) t.rows = rows; t.spellcheck = true;
    const cnt = el('em', 'mk-cnt', `${(val || '').length}/${max}`);
    t.addEventListener('input', () => { cnt.textContent = `${t.value.length}/${max}`; });
    t.addEventListener('change', () => onSet(t.value.slice(0, max)));
    const f = field(label, t); f.firstChild.appendChild(cnt); return f;
  }
  safe(() => {
    const rr0 = renderRoomPane;
    renderRoomPane = function () {
      const r = rr0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const R = R_(), top = pane.scrollTop;
        const sec = el('div', 'mk-sec');
        sec.appendChild(el('h4', 'mk-h', 'What this room says'));
        sec.appendChild(textField('When you walk in', R.ie, LIMITS.rtext, 'Smells like somebody left the oven on.', 2, (v) => { pushUndo(); R.ie = v; changed(); }));
        sec.appendChild(textField('When it is clear', R.ic, LIMITS.rtext, 'Quiet again. For now.', 2, (v) => { pushUndo(); R.ic = v; changed(); }));
        sec.appendChild(el('p', 'mk-p', 'Both show once, as a line at the top of the room. Leave them empty for silence.'));
        const doors = pane.querySelector('.mk-doors');
        const h = doors && doors.previousElementSibling;
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const rf0 = renderFloor;
    renderFloor = function () {
      const r = rf0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
        const F = F_(), top = pane.scrollTop;
        const f = textField('Opening page', F.it, LIMITS.fintro, 'Shown when the floor starts. Set the scene, or lie about it.', 3, (v) => { pushUndo(); F.it = v; changed(); });
        const tag = [...pane.querySelectorAll('.mk-field')].find((x) => x.firstChild && /^Tagline/.test(x.firstChild.textContent));
        if (tag) tag.insertAdjacentElement('afterend', f); else pane.appendChild(f);
        pane.scrollTop = top;
      });
      return r;
    };
    const rm0 = renderMapPane;
    renderMapPane = function () {
      const r = rm0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
        const M = Maker.M, top = pane.scrollTop;
        const sec = el('div', 'mk-sec');
        sec.appendChild(el('h4', 'mk-h', 'Story'));
        sec.appendChild(textField('Before the run', M.it, LIMITS.intro, 'Shown once before floor one, as a page the player taps away.', 4, (v) => { pushUndo(); M.it = v; scheduleSave(); }));
        sec.appendChild(textField('On the win screen', M.ot, LIMITS.win, 'Your last word, above the time.', 2, (v) => { pushUndo(); M.ot = v; scheduleSave(); }));
        const h = [...pane.querySelectorAll('.mk-h')].find((x) => x.textContent === 'Who plays it');
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
  });

  // build: the sheet, the chip, the help button, and the touch layer
  function buildExtras() {
    const ed = $('mkEd'); if (!ed || $('mkSheet')) return;
    const sh = el('div', 'mks'); sh.id = 'mkSheet'; sh.hidden = true;
    sh.addEventListener('pointerdown', (e) => { if (e.target === sh && performance.now() - (Maker.cellT || 0) > 400) closeCell(); });
    // the finger that opened the sheet must not also press a button in it
    sh.addEventListener('click', (e) => { if (performance.now() - (Maker.cellT || 0) < 450 || GS.p) { e.preventDefault(); e.stopPropagation(); } }, true);
    ed.appendChild(sh);
    const cvw = $('mkCvw');
    const chip = el('button', 'mk-chip'); chip.id = 'mkChip'; chip.type = 'button'; chip.title = 'Your brush. Tap to pick another.';
    chip.addEventListener('click', (e) => { e.preventDefault(); setPane('paint'); const pal = $('mkPal'); if (pal) pal.scrollIntoView({ block: 'nearest' }); });
    cvw.appendChild(chip);
    const R = $('mkTopR');
    const hb = btn('ic', SVG('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.8M12 17.2v.3"/>'), 'How it works', () => openHelp(0)); hb.id = 'mkHelp';
    R.insertBefore(hb, R.firstChild);
    const cv = Maker.cv;
    cv.addEventListener('dblclick', gDbl);
    cv.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    paintChip();
  }
  safe(() => {
    const se0 = showEditor;
    showEditor = function () {
      const r = se0.apply(this, arguments);
      safe(() => {
        buildExtras(); closeCell(); paintChip(); paintRecent();
        if (!Save.data.seen.mkHelp) { Save.data.seen.mkHelp = 1; Save.store(); setTimeout(() => { if (Maker.open && Maker.view === 'editor') openHelp(0); }, 350); }
      });
      return r;
    };
    // Escape closes the sheet first
    const ok0 = onKey;
    onKey = function (e) {
      if (Maker.open && e.key === 'Escape' && $('mkSheet') && !$('mkSheet').hidden && $('mkDlg').hidden) { e.preventDefault(); e.stopPropagation(); closeCell(); return; }
      if (Maker.open && (e.key === '?' || (e.key === 'h' && !e.ctrlKey && !e.metaKey)) && Maker.view === 'editor') { const tag = (e.target && e.target.tagName) || ''; if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') { e.preventDefault(); e.stopPropagation(); openHelp(0); return; } }
      return ok0.apply(this, arguments);
    };
    // the sheet goes when the room changes
    const sr0 = selectRoom;
    selectRoom = function () { closeCell(); return sr0.apply(this, arguments); };
  });

  /* ---- styles */
  const CSS8 = `
.mkp{position:absolute;inset:0;z-index:5;background:rgba(9,6,6,.42)}
.mkp[hidden]{display:none}
.mkp-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;transition:transform .2s cubic-bezier(.2,.9,.3,1.2),opacity .16s;
  max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;padding:16px 16px 12px;border-radius:3px;font-family:var(--ui);color:#2a1a0c;background:#efe2c4;border:1px solid #5a3a1a;box-shadow:0 18px 50px rgba(0,0,0,.6)}
.mkp-card.in{transform:translate(-50%,-50%);opacity:1}
.mkp-hd small{display:block;font:700 11px/1 var(--ui);letter-spacing:.22em;text-transform:uppercase;opacity:.7;margin-bottom:5px}
.mkp-hd b{display:block;font:400 28px/1.02 var(--display);letter-spacing:.01em;text-wrap:balance}
.mkp-bd{margin:10px 0 12px;font:500 17px/1.38 var(--ui);min-height:1.4em}
.mkp-bd p{margin:0;white-space:pre-wrap}
.mkp-card.typing .mkp-bd p::after{content:'';display:inline-block;width:7px;height:1em;margin-left:2px;vertical-align:-2px;background:currentColor;opacity:.6;animation:mkpBlink .7s steps(2) infinite}
@keyframes mkpBlink{50%{opacity:0}}
.mkp-ops{display:grid;gap:6px}
.mkp-op{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 12px;border:1px solid rgba(42,26,12,.45);border-radius:2px;background:rgba(255,255,255,.35);transition:background .12s,border-color .12s,transform .08s}
.mkp-op:hover{background:rgba(255,255,255,.6)}
.mkp-op:active{transform:translateY(1px)}
.mkp-op:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.mkp-op kbd{flex:none;min-width:22px;height:22px;display:grid;place-items:center;font:700 12px/1 var(--ui);border:1px solid currentColor;border-radius:2px;opacity:.6}
.mkp-op span{display:flex;flex-direction:column;gap:2px;min-width:0}
.mkp-op b{font:700 16px/1.1 var(--ui);letter-spacing:.06em;text-transform:uppercase}
.mkp-op small{font:500 14px/1.2 var(--ui);opacity:.75}
.mkp-op.off{opacity:.45;cursor:not-allowed}
.mkp-op.nope{animation:mkpNope .3s}
@keyframes mkpNope{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.mkp-hint{margin:8px 0 0;font:600 12px/1.2 var(--ui);letter-spacing:.08em;opacity:.55;text-align:right}
.mkp-card.warn{background:#1a1408;color:#ffe28a;border-color:#ffd23a;background-image:repeating-linear-gradient(-45deg,rgba(255,210,58,.9) 0 10px,#1a1408 10px 20px);background-size:100% 8px;background-repeat:no-repeat;padding-top:22px}
.mkp-card.warn .mkp-op{border-color:rgba(255,210,58,.5);background:rgba(255,210,58,.08)}
.mkp-card.warn .mkp-op:hover{background:rgba(255,210,58,.18)}
.mkp-card.story,.mkp-card.intro{background:#140c0b;color:var(--ink);border-color:rgba(200,32,42,.6)}
.mkp-card.story .mkp-hd small,.mkp-card.intro .mkp-hd small{color:#ff8494;opacity:1}
.mkp-card.story .mkp-op,.mkp-card.intro .mkp-op,.mkp-card.choice .mkp-op{border-color:var(--line);background:rgba(255,255,255,.04);color:var(--ink)}
.mkp-card.story .mkp-op:hover,.mkp-card.intro .mkp-op:hover,.mkp-card.choice .mkp-op:hover{border-color:rgba(236,226,212,.5);background:rgba(255,255,255,.08)}
.mkp-card.intro{border-color:rgba(227,165,74,.6)}
.mkp-card.intro .mkp-hd small{color:var(--toffee)}
.mkp-card.intro .mkp-hd b{font-size:34px}
.mkp-card.choice{background:#1c1816;color:var(--ink);border-color:rgba(255,197,58,.55);box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 40px rgba(255,197,58,.12)}
.mkp-card.choice .mkp-hd small{color:#ffc53a;opacity:1}
.mkp-card.choice .mkp-op.a{border-color:rgba(255,197,58,.6)}
.mkp-card.phone{background:#0c0d10;color:#e8eef8;border:1px solid #2a3240;border-radius:3px}
.mkp-card.phone .mkp-hd small{color:#7cc4ff;opacity:1}
.mkp-card.phone .mkp-hd b{font:700 20px/1.1 var(--ui);letter-spacing:.04em}
.mkp-card.phone .mkp-bd{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.mkp-card.phone .bub{max-width:86%;padding:8px 11px;border-radius:3px;background:#1d2633;font:500 16px/1.3 var(--ui);opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s}
.mkp-card.phone .bub.on{opacity:1;transform:none}
.mkp-card.phone .mkp-op{border-color:#2a3240;background:#141a22;color:#e8eef8}
.mkcap{position:absolute;left:50%;transform:translate(-50%,calc(-100% + 6px));z-index:4;opacity:0;pointer-events:none;box-sizing:border-box;padding:8px 14px;max-width:min(560px,92vw);
  background:rgba(12,8,7,.82);border:1px solid rgba(236,226,212,.16);border-radius:2px;font:500 16px/1.32 var(--ui);color:var(--ink);text-align:center;transition:opacity .25s,transform .25s}
.mkcap.show{opacity:1;transform:translate(-50%,-100%)}
.mkcap small{display:block;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--toffee);margin-bottom:4px}
.mks{position:absolute;inset:0;z-index:15}
.mks[hidden]{display:none}
.mks-card{position:absolute;width:340px;max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;background:#0e0a09;border:1px solid rgba(227,165,74,.45);border-radius:3px;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:mksIn .16s ease-out}
@keyframes mksIn{from{opacity:0;transform:translateY(6px)}}
.mks.bottom{background:rgba(9,6,6,.5)}
.mks.bottom .mks-card{left:0!important;right:0;bottom:0;top:auto!important;width:auto;max-height:72%;border-radius:4px 4px 0 0;border-width:1px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);animation:mksUp .2s cubic-bezier(.2,.9,.3,1)}
@keyframes mksUp{from{transform:translateY(40%)}}
.mks.bottom .mks-card::before{content:'';display:block;width:42px;height:4px;margin:8px auto 0;border-radius:1px;background:rgba(236,226,212,.25)}
.mks-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px 8px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#0e0a09;z-index:1}
.mks-hd small{display:block;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.mks-hd b{font:400 22px/1 var(--display);color:var(--ink)}
.mks-bd{padding:10px 12px 14px}
.mks-item{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}
.mks-item canvas{flex:none;border:1px solid var(--line);border-radius:2px}
.mks-item b{display:block;font:700 16px/1.1 var(--ui);color:var(--ink);margin-bottom:3px}
.mks-item span{display:block;font:500 14px/1.3 var(--ui);color:var(--muted)}
.mks-put{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-bottom:8px}
.mks-put .mk-br span{font-size:12px}
.mk-recent{display:flex;align-items:center;gap:5px;overflow-x:auto;margin:-2px 0 10px;padding-bottom:2px;scrollbar-width:none}
.mk-recent::-webkit-scrollbar{display:none}
.mk-recent small{flex:none;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-right:3px}
.mk-recent button{all:unset;flex:none;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--line);border-radius:2px;background:#120d0b}
.mk-recent button.on{border-color:var(--toffee)}
.mk-recent canvas{width:28px;height:28px;display:block}
.mk-chip canvas{width:24px;height:24px;display:block}
.mks-item canvas{width:40px;height:40px;display:block}
.mks-put .mk-br canvas{width:34px;height:34px}
.mk-recent button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mke-cvw{position:relative}
.mk-chip{all:unset;box-sizing:border-box;cursor:pointer;position:absolute;left:8px;top:8px;z-index:2;display:flex;align-items:center;gap:7px;max-width:calc(100% - 16px);padding:3px 9px 3px 3px;background:rgba(12,8,7,.86);border:1px solid rgba(227,165,74,.45);border-radius:2px;font:700 13px/1.05 var(--ui);color:var(--ink);letter-spacing:.03em}
.mk-chip canvas{flex:none;border-radius:1px}
.mk-chip span{display:flex;flex-direction:column;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mk-chip small{font:700 9px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--toffee)}
.mk-chip:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-cnt{float:right;font:600 11px/1 var(--ui);font-style:normal;letter-spacing:.06em;color:var(--faint)}
.mk-field>span{display:block}
.mk-sec{margin-top:4px}
.mk-help .mk-seg{margin-bottom:12px}
.mk-help-p{display:grid;gap:8px}
.mk-tip{padding:9px 11px;border:1px solid var(--line);border-radius:2px;background:rgba(255,255,255,.02)}
.mk-tip b{display:block;font:700 15px/1.1 var(--ui);letter-spacing:.06em;text-transform:uppercase;color:var(--toffee);margin-bottom:4px}
.mk-tip span{display:block;font:500 15px/1.35 var(--ui);color:var(--ink)}
@media (max-width:979px){
  .mke-tabs{position:sticky;top:0;z-index:3;background:#0b0807}
  .mke-tools .mk-btn{min-height:42px;flex:none}
  .mk-seg button{min-height:36px;padding:0 11px}
  .mk-br{min-height:72px}
}
@media (max-width:979px) and (orientation:landscape) and (max-height:560px){
  .mke-tools .mk-btn .tl{display:none}
  .mke-tools .mk-btn{padding:0;width:40px;min-height:36px}
  .mk-chip span{display:none}
  .mk-chip{padding:3px}
}
@media (max-width:560px){
  .mkp-hd b{font-size:24px}
  .mkp-card.intro .mkp-hd b{font-size:28px}
  .mkp-bd{font-size:16px}
  .mk-chip{left:6px;top:6px;padding:2px 8px 2px 2px;font-size:12px}
  .mks-put{grid-template-columns:repeat(auto-fill,minmax(58px,1fr))}
}
@media (pointer:coarse){
  .mk-in{font-size:16px}
  .mkp-op{min-height:52px}
}
@media (prefers-reduced-motion:reduce){
  .mkp-card,.mks-card,.mkcap,.mkp-card.phone .bub{transition:none;animation:none}
}`;
  safe(() => { const st = document.createElement('style'); st.id = 'mk124css'; st.textContent = CSS8; document.head.appendChild(st); });

  Object.assign(MK, { Pop, popShow, capShow, openCell, closeCell, openHelp, gDown, gMove, gUp, recentList, EFFECTS, runFx });

  /* ================================================================== 12. v12.5: chests that open, rewards you choose, a powerup pool */

  /* ---- the chest piece: a real chest with contents you pick */
  ENTS.cb = { name: 'Treasure chest', cat: 'loot', solid: 1, desc: 'A chest that opens when you walk up to it. You pick what is inside: random, legendary, or exact powerups, plus coins, apples or a key. Can be a mimic.' };
  ENT_PARAMS.cb = [
    P_('n', 'Powerups inside', 'seg', [[0, 'None'], [1, 'One'], [2, 'Two'], [3, 'Three']], 2),
    P_('i1', 'First', 'item', null, 'rand'), P_('i2', 'Second', 'item', null, 'rand'), P_('i3', 'Third', 'item', null, 'rand'),
    P_('x', 'Also inside', 'sel', [['', 'Nothing else'], ['coins', '10 coins'], ['heart', 'One apple'], ['key', 'A key'], ['all', 'Coins, an apple and a key']], ''),
    P_('mim', 'Mimic', 'seg', [[0, 'No'], [1, 'It bites first']], 0),
  ];
  Maker.bp.cb = entDefaults('cb');
  ENT_ORDER.loot = ['cb'].concat(ENT_ORDER.loot.filter((t) => t !== 'cb'));
  ENTS.pd.name = 'Powerup pedestal';
  ENTS.pd.desc = 'One powerup on a stone. Pick the exact one, a random one or a random legendary. Free or for coins.';
  FLAT.cb = 5;
  const CHEST_STUB = (x, y) => ({ x, y, c: 0, r: 0, open: false, t: 0, woke: false, mimic: false, seed: 0.4, shake: 0, wob: 0 });
  ART.cb = (c, x, y, e, t, mode) => {
    safe(() => drawChest(c, CHEST_STUB(x, y), mode === 'icon' ? 0 : t));
    if (mode === 'edit') {
      const n = e.n == null ? 2 : e.n;
      label(c, x + 12, y - 13, String(n), '#ffc53a', 8);
      if (e.mim) label(c, x - 12, y - 13, 'M', '#e83a50', 8);
    }
  };

  // what a chosen item turns into when the run starts
  function rollItem(id) {
    const P = G.player;
    if (id === 'rare') return nextItemId(1);
    if (id === 'rand' || !ITEMS[id] || (P && P.items.includes(id)) || G.run.pending.has(id)) return nextItemId(0.12);
    return id;
  }
  function dropItemAt(room, id, x, y, grp) {
    if (id !== 'golden') G.run.pending.add(id);
    room.pickups.push(Object.assign({ kind: 'item', id, x, y, t: 0 }, grp ? { grp } : {}));
    flashLight(x, y, 100, 0.8, 0.9);
    burst(x, y, 12, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true });
  }
  function dropExtra(room, kind, x, y) {
    if (kind === 'coins' || kind === 'all') dropCoins(room, x, y, 10);
    if (kind === 'heart' || kind === 'all') dropHeart(room, x + (kind === 'all' ? 30 : 0), y, 2);
    if (kind === 'key' || kind === 'all') dropKey(room, x - (kind === 'all' ? 30 : 0), y);
  }

  safe(() => {
    // the piece becomes a real chest obstacle
    const se0 = setupEnt;
    setupEnt = function (room, e, def, map) {
      if (e.t !== 'cb') return se0.apply(this, arguments);
      const o = putOb(room, 'chest', e.c, e.r, { open: false, t: 0, mimic: !!e.mim, mkChest: e });
      if (!room.chest) room.chest = o;
    };
    // a chest piece holds what the maker put in it
    const ci0 = Game.chestItems;
    Game.chestItems = function (room, ch) {
      if (!ch || !ch.mkChest) return ci0.apply(this, arguments);
      const e = ch.mkChest, n = e.n == null ? 2 : e.n, grp = 'mk' + ch.c + '_' + ch.r + '_' + G.levelIdx;
      const ids = [e.i1, e.i2, e.i3].slice(0, n).map((id) => rollItem(id || 'rand'));
      ids.forEach((id, i) => { const x = ch.x + (ids.length === 1 ? 0 : (i - (ids.length - 1) / 2) * 44), y = ch.y - 38; const f = nearestFreeCell(room, x, y); dropItemAt(room, id, f.x, f.y, ids.length > 1 && !e.mim ? null : null); });
      if (e.x) { const f = nearestFreeCell(room, ch.x, ch.y + 40); dropExtra(room, e.x, f.x, f.y); }
      if (G.map.chestExtra) { G.map.chestExtra = false; spawnItem(room, ch.x, ch.y + 40); }
    };
  });

  /* ---- more than one chest in a room: the game only tracked one */
  function chestSwap(room) {
    const P = G.player; if (!P || !room.obs) return;
    const cur = room.chest;
    if (cur && !cur.open && !cur.woke && dist(P.x, P.y, cur.x, cur.y) < P.r + 60) return;
    if (cur && cur.open && cur.pending) return;
    for (const o of room.obs) {
      if (o.type !== 'chest' || o === cur || o.open || o.woke) continue;
      if (dist(P.x, P.y, o.x, o.y) < P.r + 60) { room.chest = o; return; }
    }
  }
  safe(() => {
    const ure9 = updateRoomExtras;
    updateRoomExtras = function (dt, room) {
      ure9.apply(this, arguments);
      if (room && G.state === 'play' && !(MK.Pop && MK.Pop.on)) safe(() => {
        chestSwap(room);
        // opened chests that are no longer the tracked one keep their lid moving
        for (const o of room.obs) if (o.type === 'chest' && o !== room.chest && o.open && o.t < 3) o.t += dt;
      });
    };
  });

  /* ---- rewards when a room is cleared */
  const RW_KINDS = [['item', 'Powerup'], ['heart', 'Apples'], ['coins', 'Coins'], ['key', 'Key'], ['chest', 'Chest (two random)']];
  const RW_N = { heart: [[1, 'Half'], [2, 'One'], [4, 'Two']], coins: [[5, '5'], [10, '10'], [20, '20'], [40, '40']] };
  function cleanRw(list) {
    const out = [];
    for (const r of Array.isArray(list) ? list : []) {
      if (!r || !RW_KINDS.some((k) => k[0] === r.k) || out.length >= 4) continue;
      const o = { k: r.k };
      if (r.k === 'item') o.id = r.id === 'rand' || r.id === 'rare' || (typeof r.id === 'string' && ITEMS[r.id]) ? r.id : 'rand';
      if (RW_N[r.k]) o.n = RW_N[r.k].some((x) => x[0] === r.n) ? r.n : RW_N[r.k][1][0];
      out.push(o);
    }
    return out;
  }
  function giveRewards(room) {
    const R = room.mkR; if (!R || !R.rw || !R.rw.length || room.mkRwDone) return;
    room.mkRwDone = true;
    const P = G.player, n = R.rw.length;
    R.rw.forEach((r, i) => {
      const f = nearestFreeCell(room, RW / 2 + (i - (n - 1) / 2) * 48, RH / 2);
      setTimeout(() => {
        if (G.room !== room || G.state !== 'play') return;
        if (r.k === 'item') dropItemAt(room, rollItem(r.id), f.x, f.y);
        else if (r.k === 'heart') dropHeart(room, f.x, f.y, r.n || 2);
        else if (r.k === 'coins') dropCoins(room, f.x, f.y, r.n || 10);
        else if (r.k === 'key') dropKey(room, f.x, f.y);
        else if (r.k === 'chest') {
          const cc = Math.max(0, Math.min(GW - 1, Math.floor(f.x / T))), rr = Math.max(0, Math.min(GH - 1, Math.floor(f.y / T)));
          if (Math.abs(P.x - f.x) < T && Math.abs(P.y - f.y) < T) { dropItemAt(room, rollItem('rand'), f.x, f.y); return; }
          const o = putOb(room, 'chest', cc, rr, { open: false, t: 0, mimic: false });
          room.ver = (room.ver || 0) + 1;
          if (!room.chest || room.chest.open) room.chest = o;
          burst(o.x, o.y, 16, '#e3a54a', { kind: 'shard', min: 30, max: 120, lmin: 0.3, lmax: 0.7 }); Sfx.thud();
        }
      }, 450 + i * 180);
    });
  }
  safe(() => {
    Hooks.layer('Game.clearRoom', 'v12.5 room rewards', function (next, room) {
      if (!inMap() || !room || !room.mkR) return next.apply(this, [].slice.call(arguments, 1));
      const R = room.mkR, keep = R.rg !== 0, first = !room.mkRwDone;
      const before = new Set(room.pickups);
      const r = next.apply(this, [].slice.call(arguments, 1));
      safe(() => {
        // a mimic outside a treasure room still pays out once it is dead
        const ch = room.chest;
        if (ch && ch.mimic && ch.woke && !ch.open && room.type !== 'chest') { ch.open = true; ch.t = 0; ch.pending = true; Sfx.chest(); }
        if (first && R.rw && R.rw.length) {
          if (!keep) for (const p of room.pickups.slice()) if (!before.has(p) && (p.kind === 'item' || p.kind === 'heart' || p.kind === 'coin')) { room.pickups.splice(room.pickups.indexOf(p), 1); if (p.kind === 'item') G.run.pending.delete(p.id); }
          giveRewards(room);
        } else if (first && !keep) { for (const p of room.pickups.slice()) if (!before.has(p) && (p.kind === 'item' || p.kind === 'heart' || p.kind === 'coin')) { room.pickups.splice(room.pickups.indexOf(p), 1); if (p.kind === 'item') G.run.pending.delete(p.id); } room.mkRwDone = true; }
      });
      return r;
    });
  });

  /* ---- the powerup pool: which powerups the map can roll */
  safe(() => {
    const nx0 = nextItemId;
    nextItemId = function (legend = 0.05) {
      const pool = inMap() && RTM.cur.pool;
      if (!pool || !pool.m || !pool.ids || !pool.ids.length) return nx0.apply(this, arguments);
      const P = G.player;
      if (P && P.flags && P.flags.blight) legend = Math.min(1, legend * 2);
      const ok = (id) => (pool.m === 'only' ? pool.ids.includes(id) : !pool.ids.includes(id));
      const free = ITEM_IDS.filter((id) => ok(id) && !P.items.includes(id) && !G.run.pending.has(id) && itemOk9(id, P));
      const rare = free.filter((id) => ITEMS[id].rare), norm = free.filter((id) => !ITEMS[id].rare);
      if (rare.length && (Math.random() < legend || !norm.length)) return weightedPick(rare);
      return norm.length ? weightedPick(norm) : 'golden';
    };
  });

  /* ---- saving it all: room rewards and the pool go into the map and the code */
  function cleanPool(p) {
    if (!p || typeof p !== 'object') return { m: '', ids: [] };
    const m = p.m === 'only' || p.m === 'ban' ? p.m : '';
    const ids = (Array.isArray(p.ids) ? p.ids : []).filter((id, i, a) => typeof id === 'string' && ITEMS[id] && a.indexOf(id) === i).slice(0, 120);
    return { m, ids };
  }
  safe(() => {
    const cr0 = cleanRoom;
    cleanRoom = function (R) { const o = cr0.apply(this, arguments); if (o) { o.rw = cleanRw(R && R.rw); o.rg = R && R.rg === 0 ? 0 : 1; } return o; };
    const cm0 = cleanMap;
    cleanMap = function (M) { const o = cm0.apply(this, arguments); o.pool = cleanPool(M && M.pool); return o; };
    const nr0 = newRoom;
    newRoom = function () { const o = nr0.apply(this, arguments); o.rw = []; o.rg = 1; return o; };
    const nm0 = newMap;
    newMap = function () { const o = nm0.apply(this, arguments); o.pool = { m: '', ids: [] }; return o; };
    const cp0 = compact;
    compact = function (M) {
      const o = cp0.apply(this, arguments);
      if (M.pool && M.pool.m && M.pool.ids.length) o.pool = { m: M.pool.m, ids: M.pool.ids.slice() };
      M.floors.forEach((F, fi) => F.rooms.forEach((R, ri) => {
        const r = o.floors[fi] && o.floors[fi].rooms[ri]; if (!r) return;
        if (R.rw && R.rw.length) r.rw = R.rw.map((x) => Object.assign({}, x));
        if (R.rg === 0) r.rg = 0;
      }));
      return o;
    };
  });

  /* ---- the editor: a Rewards block in Room, a Powerup pool in Map */
  const FIGHTY = ['fight', 'arena', 'miniboss', 'challenge', 'survival', 'boss'];
  function itemBtn(id, onPick) {
    const b = el('button', 'mk-pick'); b.type = 'button';
    b.appendChild(canvasIcon(32, (c, s) => { c.translate(s / 2, s / 2); if (id === 'rand' || id === 'rare') { c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 22px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, id, s * 0.8, 1); }));
    b.appendChild(el('span', null, esc(id === 'rand' ? 'Random powerup' : id === 'rare' ? 'Random legendary' : ITEMS[id].name)));
    b.addEventListener('click', (e) => { e.preventDefault(); pickItem(id, true, onPick); });
    return b;
  }
  function rewardSection(R) {
    const sec = el('div', 'mk-sec mk-rw');
    sec.appendChild(el('h4', 'mk-h', 'Reward when the fight is won'));
    if (!R.rw) R.rw = [];
    const fighty = FIGHTY.includes(R.t) || R.e.some((e) => e.t === 'sn' || e.t === 'ns');
    if (!fighty) sec.appendChild(el('div', 'mk-note', 'This room has no fight, so it never gets won. Put snakes in it, or use a chest or a pedestal here instead.'));
    const upd = (fn) => { pushUndo(); fn(); changed(); };
    R.rw.forEach((r, i) => {
      const line = el('div', 'mk-rwl');
      line.appendChild(selectOf(RW_KINDS, r.k, (v) => upd(() => { R.rw[i] = cleanRw([{ k: v }])[0]; })));
      if (r.k === 'item') line.appendChild(itemBtn(r.id || 'rand', (id) => upd(() => { r.id = id; })));
      else if (RW_N[r.k]) line.appendChild(seg(RW_N[r.k], r.n, (v) => upd(() => { r.n = v; })));
      else line.appendChild(el('span', 'mk-p', r.k === 'key' ? 'Opens one locked room.' : 'Lands in the middle. Opens like any chest.'));
      line.appendChild(btn('ic red', IC.trash, 'Remove this reward', () => upd(() => { R.rw.splice(i, 1); })));
      sec.appendChild(line);
    });
    if (R.rw.length < 4) sec.appendChild(btn('gold', IC.plus + 'Add a reward', 'Add something that drops when the room is won', () => upd(() => { R.rw.push({ k: 'item', id: 'rand' }); })));
    sec.appendChild(row('The game’s own drops', seg([[1, 'Keep them'], [0, 'Only mine']], R.rg === 0 ? 0 : 1, (v) => upd(() => { R.rg = v; }))));
    sec.appendChild(el('p', 'mk-p', 'Rewards land in the middle of the room when the last snake goes down. Exact powerups you already carry turn into a random one. Up to four.'));
    return sec;
  }
  function pickMany(cur, done) {
    const sel = new Set(cur);
    const body = el('div');
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search powerups'; q.setAttribute('aria-label', 'Search powerups');
    body.appendChild(q);
    let only = '';
    const flt = seg([['', 'All'], ['rare', 'Legendary'], ['on', 'Picked']], only, (v) => { only = v; fill(); flt.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['', 'rare', 'on'][i] === v)); });
    flt.style.marginTop = '8px'; body.appendChild(flt);
    const cnt = el('p', 'mk-p'); cnt.style.margin = '8px 0 0'; body.appendChild(cnt);
    const list = el('div', 'mk-plist'); body.appendChild(list);
    const ids = ITEM_IDS.filter((id) => ITEMS[id]).sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
    const shown = () => { const qq = q.value.trim().toLowerCase(); return ids.filter((id) => (!qq || ITEMS[id].name.toLowerCase().includes(qq) || ITEMS[id].desc.toLowerCase().includes(qq)) && (only !== 'rare' || ITEMS[id].rare) && (only !== 'on' || sel.has(id))); };
    const fill = () => {
      list.textContent = '';
      cnt.textContent = `${sel.size} picked`;
      for (const id of shown()) {
        const it = ITEMS[id];
        const b = el('button', (sel.has(id) ? 'on ' : '') + (it.rare ? 'rare' : '')); b.type = 'button'; b.title = it.desc; b.setAttribute('aria-pressed', sel.has(id) ? 'true' : 'false');
        b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.78, 1); }));
        b.appendChild(el('span', null, `${esc(it.name)}<small>${sel.has(id) ? 'In the list' : it.rare ? 'Legendary' : 'Powerup'}</small>`));
        b.addEventListener('click', (e) => { e.preventDefault(); if (sel.has(id)) sel.delete(id); else sel.add(id); fill(); });
        list.appendChild(b);
      }
    };
    q.addEventListener('input', fill);
    fill();
    dlg('Pick powerups', body, [
      btn('', 'Pick all shown', 'Add every powerup in the list', () => { for (const id of shown()) sel.add(id); fill(); }),
      btn('', 'Clear', 'Remove all', () => { sel.clear(); fill(); }),
      btn('gold', 'Done', 'Save the list', () => { closeDlg(); done([...sel]); }),
    ]);
  }
  function poolSection(M) {
    if (!M.pool) M.pool = { m: '', ids: [] };
    const P0 = M.pool;
    const sec = el('div', 'mk-sec');
    sec.appendChild(el('h4', 'mk-h', 'Powerup pool'));
    const upd = (fn) => { pushUndo(); fn(); scheduleSave(); renderMapPane(); };
    sec.appendChild(field('Random powerups come from', seg([['', 'Everything'], ['only', 'Only these'], ['ban', 'Everything but these']], P0.m, (v) => upd(() => { P0.m = v; }))));
    if (P0.m) {
      const chips = el('div', 'mk-items');
      for (const id of P0.ids) {
        const b = el('button', 'mk-it'); b.type = 'button'; b.title = 'Remove ' + ITEMS[id].name;
        b.appendChild(canvasIcon(30, (c, s) => { c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.8, 1); }));
        b.appendChild(el('span', null, esc(ITEMS[id].name)));
        b.addEventListener('click', (e) => { e.preventDefault(); upd(() => { P0.ids = P0.ids.filter((x) => x !== id); }); });
        chips.appendChild(b);
      }
      sec.appendChild(chips);
      sec.appendChild(btn('gold', IC.plus + (P0.ids.length ? 'Change the list' : 'Pick powerups'), 'Choose powerups for the pool', () => pickMany(P0.ids, (ids) => upd(() => { P0.ids = ids; }))));
      const note = P0.m === 'only'
        ? (P0.ids.length < 4 ? `Only ${P0.ids.length} in the pool. Once they are taken, everything random turns into golden apples.` : `Chests, pedestals, bosses and pots only roll these ${P0.ids.length}.`)
        : `These ${P0.ids.length} never show up at random. Exact picks you place still do.`;
      sec.appendChild(el('p', 'mk-p', esc(note))).style.marginTop = '8px';
    } else sec.appendChild(el('p', 'mk-p', 'Every powerup can roll, like a normal run. Pick a list to narrow it down or ban a few.'));
    return sec;
  }
  safe(() => {
    const rr9 = renderRoomPane;
    renderRoomPane = function () {
      const r = rr9.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop;
        const sec = rewardSection(R_());
        const doors = pane.querySelector('.mk-doors'), h = doors && doors.previousElementSibling;
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const rm9 = renderMapPane;
    renderMapPane = function () {
      const r = rm9.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop;
        const sec = poolSection(Maker.M);
        const h = [...pane.querySelectorAll('.mk-h')].find((x) => /^Start powerups/.test(x.textContent));
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
  });

  // help and guide get a page on loot
  safe(() => {
    HELP.splice(3, 0, ['Loot', [
      ['Treasure chest', 'Under Loot. Opens when you walk up. Pick up to three exact powerups, random ones or random legendaries, plus coins, an apple or a key. Or make it a mimic.'],
      ['Pedestal', 'One powerup on a stone. Exact, random or legendary. Free or for coins.'],
      ['Room rewards', 'Room, Reward when the fight is won. Up to four drops in the middle of the room: powerups, apples, coins, a key or a chest. Keep the game’s own drops or switch them off.'],
      ['Powerup pool', 'Map, Powerup pool. Let random rolls come only from a list you pick, or ban a few. Exact picks always win.'],
    ]]);
  });

  const CSS9 = `
.mk-rwl{display:grid;grid-template-columns:minmax(0,150px) minmax(0,1fr) auto;gap:6px;align-items:center;margin-bottom:7px}
.mk-rwl .mk-pick{min-width:0}
.mk-rwl .mk-p{margin:0;font-size:13px}
.mk-rw>.mk-btn.gold{margin:2px 0 10px}
@media (max-width:420px){.mk-rwl{grid-template-columns:minmax(0,1fr) auto}.mk-rwl>:nth-child(2){grid-column:1/-1;grid-row:2}}`;
  safe(() => { const st = document.createElement('style'); st.id = 'mk125css'; st.textContent = CSS9; document.head.appendChild(st); });
  if (TILE.X) TILE.X.desc = 'A treasure chest with two random powerups. Want exact powerups inside? Use Treasure chest under Loot.';
  Object.assign(MK, { rollItem, chestSwap, cleanRw, cleanPool, pickMany, cleanMap, cleanRoom, newMap, newRoom, compact });

  /* ================================================================== 9. three maps to start from */
  const E_ = (t, c, r, p) => Object.assign({ t, c, r }, p || {});
  const SN = (k, c, r, g, tr) => ({ t: 'sn', c, r, k, g: g ? 1 : 0, tr: tr || '' });
  const RM = (x, y, t, rows, e, extra) => Object.assign({ x, y, t, g: rows ? rows.join('') : EMPTY, e: e || [] }, extra || {});
  let EXCACHE = null;
  function EXAMPLES() {
    if (EXCACHE) return EXCACHE;
    const chestT = TPL.chest, vaultT = TPL.vault, shopT = TPL.shop;
    const raw = [
      {
        id: 'expinball', name: 'Pinball Cellar', author: 'Bitten', desc: 'Bumpers, powder kegs and a fire bar in the corridor. The Grub Mother waits at the end. Same as always.',
        floors: [{
          name: 'Flipperkelder', sub: 'Everything bounces down here. You too.', set: 'cellar', boss: 'auto', dark: -1, rooms: [
            RM(4, 4, 'start', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '.#.......#.', 'c.........c'],
              [E_('sg', 3, 6, { txt: 'Bumpers kick, kegs blow, the fire bar does not care. The lair is west.' }), E_('cn', 8, 2, { n: 3 })]),
            RM(4, 3, 'fight', ['#.........#', '...........', '...........', '...........', '...........', '...........', '...........', '...........', '#.........#'],
              [E_('bm', 2, 2, { st: 0 }), E_('bm', 8, 2, { st: 1 }), E_('bm', 5, 4, { st: 2 }), E_('bm', 2, 6, { st: 1 }), E_('bm', 8, 6, { st: 0 }),
                SN('grub', 3, 4), SN('grub', 7, 4), SN('hood', 5, 2), SN('splitter', 5, 6, 1)]),
            RM(5, 3, 'chest', chestT, [E_('cn', 2, 4, { n: 5 })]),
            RM(4, 5, 'fight', ['...........', '.u.......u.', '...........', '...#...#...', '...........', '...#...#...', '...........', '.u.......u.', '...........'],
              [E_('bx', 4, 2), E_('bx', 6, 2), E_('bx', 2, 6), E_('bx', 8, 6), E_('bx', 5, 4), SN('grub', 3, 2), SN('grub', 7, 2), SN('grub', 3, 6), SN('grub', 7, 6), SN('hood', 5, 6)]),
            RM(3, 4, 'hall', ['HHHHHHHHHHH', 'HHHHHHHHHHH', '...........', '...........', '...........', '...........', '...........', 'HHHHHHHHHHH', 'HHHHHHHHHHH'],
              [E_('fb', 3, 4, { n: 3, s: 1, w: 1, a: 0 }), E_('fb', 7, 4, { n: 3, s: 2, w: -1, a: 4 }), E_('cn', 5, 2, { n: 5 }), E_('sg', 9, 2, { txt: 'Time it. The bars do not stop for anybody.' })]),
            RM(2, 4, 'boss', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'c.........c']),
          ],
        }],
      },
      {
        id: 'exgates', name: 'Levers and Gates', author: 'Bitten', desc: 'Pull a lever, a gate opens somewhere. A key, a vault and a pad back to the start. The Lamprey Queen sits behind the blue gates.',
        floors: [{
          name: 'De Sluis', sub: 'Everything here opens. Eventually.', set: 'halls', boss: 'auto', dark: -1, rooms: [
            RM(4, 4, 'start', ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
              [E_('lv', 2, 4, { ch: 0 }), E_('gt', 10, 4, { ch: 0, o: 0 }), E_('gt', 10, 3, { ch: 0, o: 0 }), E_('gt', 10, 5, { ch: 0, o: 0 }), E_('tp', 8, 2, { ch: 2 }),
                E_('sg', 3, 6, { txt: 'Red lever, red gates. Shoot it or walk into it. The green pad is a way back, later.' })]),
            RM(5, 4, 'fight', ['...........', '...........', '...........', '.##.....##.', '...........', '.##.....##.', '...........', '...........', '...........'],
              [E_('sw', 2, 1, { ax: 'h', s: 2 }), E_('sw', 8, 7, { ax: 'h', s: 1 }), E_('tt', 5, 8, { d: 6, s: 2, on: 'f', b: 1 }), E_('ky', 9, 6),
                SN('grub', 3, 6), SN('grub', 7, 6), SN('sniper', 8, 2), SN('hood', 2, 2), SN('lamprey', 5, 4, 1)]),
            RM(5, 3, 'vault', vaultT),
            RM(6, 4, 'hall', ['...........', '.c.......c.', '...........', '...........', '...........', '...........', '...........', '.c.......c.', '...........'],
              [E_('lv', 8, 6, { ch: 1 }), E_('gt', 10, 3, { ch: 1, o: 0 }), E_('gt', 10, 4, { ch: 1, o: 0 }), E_('gt', 10, 5, { ch: 1, o: 0 }), E_('tp', 8, 2, { ch: 2 }),
                E_('sg', 2, 6, { txt: 'Blue opens the lair. The vault up north wants the key from the saw room.' })]),
            RM(7, 4, 'boss'),
          ],
        }],
      },
      {
        id: 'exsaws', name: 'The Saw Mill', author: 'Bitten', desc: 'Nests, acid, saws and a floor that gives way. No lair, a hatch. Mind your step.',
        rules: { co: 15 },
        floors: [{
          name: 'Zaagmolen', sub: 'Open late. The machines never stop.', set: 'market', boss: 'auto', dark: -1, rooms: [
            RM(3, 4, 'start', ['...........', '.##.....##.', '...........', '...........', '...........', '...........', '...........', '.##.....##.', '...........'],
              [E_('sp', 6, 4, { d: 0 }), E_('sp', 7, 4, { d: 0 }), E_('sp', 8, 4, { d: 0 }), E_('sp', 9, 4, { d: 0 }),
                E_('sg', 3, 6, { txt: 'No lair on this floor. Find the hatch. Mind the floor, it is old.' })]),
            RM(4, 4, 'fight', ['u.........u', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'u.........u'],
              [E_('ns', 8, 2, { k: 'grub', n: 3, s: 2 }), E_('ns', 2, 6, { k: 'bonus', n: 1, s: 1 }), E_('ac', 4, 3), E_('ac', 5, 3), E_('ac', 6, 3), E_('ac', 4, 5), E_('ac', 5, 5), E_('ac', 6, 5),
                SN('discount', 8, 6)]),
            RM(4, 5, 'shop', shopT, [], { st: 'yellow' }),
            RM(5, 4, 'hall', ['HHHHHHHHHHH', 'HHHHHHHHHHH', '...........', '...........', '...........', '...........', '...........', 'HHHHHHHHHHH', 'HHHHHHHHHHH'],
              [E_('wk', 2, 3), E_('wk', 3, 3), E_('wk', 4, 3), E_('wk', 6, 3), E_('wk', 7, 3), E_('wk', 8, 3), E_('wk', 2, 5), E_('wk', 3, 5), E_('wk', 4, 5), E_('wk', 6, 5), E_('wk', 7, 5), E_('wk', 8, 5),
                E_('sw', 5, 2, { ax: 'v', s: 2 }), E_('jp', 1, 4, { d: 0, f: 1 }), E_('pd', 9, 2, { id: 'rand', c: 10 }), E_('cn', 9, 6, { n: 3 })]),
            RM(6, 4, 'fight', ['...........', '.#.......#.', '...........', '...........', '...........', '...........', '...........', '.#.......#.', '...........'],
              [E_('fb', 5, 4, { n: 4, s: 1, w: 1, a: 6 }), E_('ex', 9, 4), E_('tt', 1, 1, { d: 8, s: 1, on: 'f', b: 1 }), SN('rocket', 5, 2), SN('stroopw', 8, 6), SN('grub', 2, 6)]),
          ],
        }],
      },
      {
        id: 'extalk', name: 'Small Talk', author: 'Bitten', desc: 'A cellar that will not shut up. Notes, a shrine with a deal, a plate that opens the lair, and snakes with something to say.',
        it: 'Somebody built this place to talk at you. Read the notes, answer the shrine, stand on the plate. Or skip all of it and find out the hard way.',
        ot: 'You read everything. Nobody reads everything.',
        floors: [{
          name: 'Kletskelder', sub: 'The walls have opinions.', set: 'cellar', boss: 'auto', dark: -1,
          it: 'Floor one. Damp, loud, full of notes from the last guy. He did not make it, but his handwriting did.',
          rooms: [
            RM(4, 4, 'start', ['c.........c', '...........', '...........', '...........', '...........', '...........', '...........', '...........', 'c.........c'],
              [E_('tx', 5, 2, { txt: 'WELCOME', sz: 3, cl: 2, fx: 2 }), E_('tx', 5, 3, { txt: 'mind the snakes', sz: 1, cl: 0, fx: 0 }),
                E_('nt', 3, 5, { ti: 'Jens', txt: 'yo where r u | the cellar thing started without u | dont touch the shrine. or do. idk', ty: 3, on: 'o' }),
                E_('nt', 7, 5, { ti: 'House rules', txt: 'Notes stop the game while you read. The gold thing east asks a question. The plate east opens the lair. North is a fight with a lot to say.', ty: 0, on: 'a' })],
              { ie: 'The door locks behind you. Classic.' }),
            RM(4, 3, 'fight', ['#.........#', '...........', '..u.....u..', '...........', '...........', '...........', '..u.....u..', '...........', '#.........#'],
              [SN('grub', 3, 3), SN('grub', 7, 3), Object.assign(SN('hood', 5, 2), { say: 'Oh. A visitor. We do not get visitors.', die: 'Fair enough.' }),
                Object.assign(SN('splitter', 5, 5), { say: 'Two of us, soon.', die: 'Told you.' }),
                E_('sh', 5, 7, { txt: 'Quiet now', s: 'They did warn you. Several times.', on: 'c', st: 'legend' }),
                E_('tx', 5, 4, { txt: 'NO TALKING', sz: 2, cl: 1, fx: 3 })],
              { ic: 'Well. That settles the conversation.' }),
            RM(5, 4, 'hall', ['HHH.....HHH', '.........H.', '.........H.', '...........', '...........', '...........', '.........H.', '.........H.', 'HHH.....HHH'],
              [E_('cq', 5, 2, { ti: 'The shrine', txt: 'It wants an apple. It offers something shiny. It does not do refunds.', a: 'Pay an apple', ae: 'deal', b: 'Keep walking', be: 'none', ch: 1, hd: 0 }),
                E_('pl', 2, 2, { ch: 1, m: 't' }), E_('tx', 2, 3, { txt: 'STEP', sz: 1, cl: 4, fx: 1 }),
                E_('gt', 9, 3, { ch: 1, o: 0 }), E_('gt', 9, 4, { ch: 1, o: 0 }), E_('gt', 9, 5, { ch: 1, o: 0 }),
                E_('nt', 7, 6, { ti: 'Careful', txt: 'The lair is behind the bars. The plate in the corner flips them. Step on it again and they shut. Do not do that.', ty: 1, on: 'o' }),
                E_('sh', 5, 7, { txt: 'Decisions', s: 'One shrine, one plate, no refunds.', on: 'e', st: '' })],
              { ie: 'A shrine, a plate, a row of bars. Somebody planned this.' }),
            RM(6, 4, 'boss', null, [], { ie: 'The last room. It has been waiting all day and it is not happy about it.' }),
            RM(3, 4, 'chest', chestT, [E_('nt', 5, 6, { ti: 'Page 14', txt: 'The chest is real. I checked. Probably. The last chest was not, and that is why this page is torn.', ty: 2, on: 'o' })]),
          ],
        }],
      },
    ];
    EXCACHE = raw.map((m) => { const M = safe(() => cleanMap(m)); if (M) M.id = m.id; return M; }).filter(Boolean);
    return EXCACHE;
  }
  MK.EXAMPLES = EXAMPLES;

  /* ================================================================== 10. the menu, the guide, achievements and the texts file */
  safe(() => { const st = document.createElement('style'); st.id = 'mk123css'; st.textContent = CSS; document.head.appendChild(st); });
  safe(() => {
    const nav = document.querySelector('#menu .menu-list'), set = $('btnSet');
    if (!nav) return;
    const b = el('button', 'mi mk123'); b.id = 'btnMaker'; b.type = 'button';
    const tiles = [0, 1, 0, 0, 1, 1, 2, 1, 0, 1, 1, 0].map((v) => `<i class="${v === 1 ? 'f' : v === 2 ? 'r' : ''}"></i>`).join('');
    b.innerHTML = `<i class="eye" aria-hidden="true"></i><span class="ml">Map Maker</span><small id="makerNow">Build a dungeon, share the code</small><span class="mkt" aria-hidden="true">${tiles}</span>`;
    if (set && set.parentNode === nav) nav.insertBefore(b, set); else nav.appendChild(b);
    b.addEventListener('click', (e) => { e.preventDefault(); safe(() => Sfx.init()); Maker.openHub(); });
    const paint = () => safe(() => {
      Store.load();
      b.classList.toggle('new', !Save.data.seen.maker);
      const n = Store.list.length;
      $('makerNow').textContent = n ? `${n} map${n === 1 ? '' : 's'} in this browser` : 'Build a dungeon, share the code';
    });
    const rf = UI.refresh;
    UI.refresh = function () { const r = rf.apply(this, arguments); paint(); return r; };
    paint();
  });
  // the menu scene sleeps while the Map Maker covers it
  safe(() => {
    const mr0 = MenuScene.render;
    MenuScene.render = function (c) { if (Maker.open) { c.fillStyle = '#0b0807'; c.fillRect(0, 0, View.W, View.H); return; } return mr0.apply(this, arguments); };
    const bk0 = UI.back;
    UI.back = function () { if (Maker.open) return; return bk0.apply(this, arguments); };
  });
  // a tab in How to play
  safe(() => {
    const tabs = $('howTabs'), how = document.querySelector('#how .sheet-inner');
    if (!tabs || !how) return;
    const tb = el('button', null, 'Maps'); tb.type = 'button'; tb.setAttribute('role', 'tab'); tb.id = 't-maker'; tb.dataset.tab = 'maker'; tb.setAttribute('aria-controls', 'tab-maker'); tb.setAttribute('aria-selected', 'false'); tb.tabIndex = -1;
    const mus = tabs.querySelector('[data-tab="music"]');
    if (mus) tabs.insertBefore(tb, mus); else tabs.appendChild(tb);
    const panel = el('div', 'tabpanel9 mk-gd'); panel.id = 'tab-maker'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 't-maker'); panel.hidden = true;
    const tips = [
      ['Floors and rooms', 'A map is one to eight floors. A floor is rooms on a grid, joined by doors. Every floor needs a start, and a lair or an exit hatch.'],
      ['Paint', 'Pick a piece, paint the room. Fill, box and mirror help. Right click rubs out. Undo is always there.'],
      ['Room types', 'Fights shut the doors. Halls stay open. Shops, chests, springs, gyms, lairs and arenas work like the real thing.'],
      ['Doors', 'Between two rooms: a door, a wall or a crack. A crack opens after three shots. A locked room needs a key.'],
      ['Rules', 'Set apples, coins, damage, speed, boss health, start powerups and the difficulty. The player can not change them.'],
      ['Share', 'Share gives one line of text with the whole map in it. Paste a code in the Map Maker to play it or edit a copy.'],
      ['Test', 'Test runs the whole map. Room starts you in the room you are looking at. Menu takes you back to the editor.'],
      ['Words', 'Paint text on the floor, drop notes that stop the game to read, set up shrines with two answers, shout over a room, and give snakes lines. Rooms, floors and the map can talk too.'],
      ['On a phone', 'Tap paints, drag paints a line, hold a tile to open its sheet. The Recent row keeps your last ten pieces close.'],
      ['It counts, a bit', 'Kills and rooms count. Escapes, wins and powerups found do not. Maps live in this browser: keep the code.'],
    ];
    panel.innerHTML = `<p class="intro9">Build your own dungeon in the Map Maker on the start screen. Every tile, every snake, every trap. Then send it to somebody.</p>
<div class="tips9">${tips.map(([b, s]) => `<div class="tip9"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
<h3>Map pieces</h3><div class="cards items" id="mkGuideCards"></div>
<p class="intro9" style="font-size:15px">Everything from the real game is in there too: rocks, pots, belts, carts, chests, slot machines, springs and every snake that can spawn.</p>`;
    if (mus) how.insertBefore(panel, document.getElementById('tab-music')); else how.appendChild(panel);
    if (!HOW_TABS9.includes('maker')) { const i = HOW_TABS9.indexOf('music'); if (i >= 0) HOW_TABS9.splice(i, 0, 'maker'); else HOW_TABS9.push('maker'); }
    const cards = panel.querySelector('#mkGuideCards');
    const order = ['cb', 'pd', 'tx', 'nt', 'cq', 'sh', 'sg', 'pl', 'tp', 'jp', 'sp', 'bm', 'lv', 'gt', 'ex', 'fb', 'sw', 'tt', 'bx', 'ns', 'ac', 'wk', 'sk', 'ky', 'cn'];
    const fill = () => {
      cards.textContent = '';
      for (const t of order) {
        const f = el('figure');
        f.appendChild(canvasIcon(46, (c, s) => paintBrushIcon(c, s, { k: 'ent', t, p: Object.assign({}, entDefaults(t), t === 'tp' || t === 'lv' || t === 'gt' || t === 'pl' ? { ch: 0 } : {}) }, 'cellar')));
        const cap = el('figcaption'); cap.innerHTML = `<b>${esc(SF(ENTS[t].name))}</b><span>${esc(SF(ENTS[t].desc))}</span>`;
        f.appendChild(cap); cards.appendChild(f);
      }
    };
    const ht = UI.howTab;
    UI.howTab = function (id) { const r = ht.apply(this, arguments); if (id === 'maker') safe(fill); return r; };
    const modes = document.querySelector('#tab-modes ul.rooms9');
    if (modes) modes.insertAdjacentHTML('beforeend', '<li><i style="background:#e3a54a" aria-hidden="true"></i><b>Map Maker</b><span>Your own floors, rooms, snakes, traps and rules, shared as one line of text. On the start screen. Wins there do not count as escapes.</span></li>');
  });
  // achievements for building, finishing and sharing
  safe(() => {
    STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['mapsMade', 'Maps saved'], ['mapWins', 'Maps finished'], ['mapShares', 'Map codes shared'], ['mapImports', 'Maps loaded from a code']);
    ACHS.push(
      { id: 'mapmaker', reward: 'pick', name: 'Architect', desc: 'Save a map with at least 5 rooms in the Map Maker.', stat: 'mapsMade', goal: 1 },
      { id: 'mapwin', reward: 'graft', name: 'Playtester', desc: 'Finish a map with at least 3 rooms.', stat: 'mapWins', goal: 1 },
      { id: 'mapshare', reward: 'hagel', name: 'Word Of Mouth', desc: 'Copy a map code to share it.', stat: 'mapShares', goal: 1 },
    );
  });
  // the texts file: every new piece, room type and message
  safe(() => {
    const msgs = ['Guarded', 'Something lives here. The doors shut.', 'A way down', 'The hatch is open', 'Daylight', 'Walk into the light', 'Map cleared', 'Play again', 'Try again', 'Editor', 'Maps',
      'Something moved', 'Gates shifted somewhere else on this floor.', 'Locked', 'A key opens it. One is somewhere on this floor.', 'Its key drops in the next fight you win on this floor.',
      'A hidden way', 'The wall gave in. Somebody built it like that.', 'Bad answer', 'Something came out of the walls.'];
    for (const s of msgs) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
    for (const s of ['NO PARTNER', 'ACID', 'NEST DOWN', 'CLICK', 'RED GATES', 'BLUE GATES', 'GREEN GATES', 'GOLD GATES', '+1 APPLE', '+10 COINS', '-10 COINS', 'NOTHING']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
    const tc0 = Texts.collect;
    Texts.collect = function () {
      const o = tc0.apply(this, arguments);
      o.map_pieces = {}; for (const t in ENTS) o.map_pieces[t] = { name: ENTS[t].name, desc: ENTS[t].desc };
      o.map_tiles = {}; for (const ch in TILE) o.map_tiles[TILE[ch].id] = { name: TILE[ch].name, desc: TILE[ch].desc };
      o.map_rooms = {}; for (const id in RT) o.map_rooms[id] = { name: RT[id].name, desc: RT[id].desc };
      o.map_reward_kinds = {}; for (const [k, name] of RW_KINDS) o.map_reward_kinds[k] = name;
      o.map_choice_effects = {}; for (const [k, name] of EFFECTS) o.map_choice_effects[k] = { name, shows: FX_SUB[k] || '' };
      o.map_maker_help = {}; for (const [page, tips] of HELP) o.map_maker_help[page] = tips.map(([b, t]) => ({ title: b, text: t }));
      o.map_examples = {}; for (const M of EXAMPLES()) o.map_examples[M.id] = { name: M.name, desc: M.desc, intro: M.it || '', win: M.ot || '' };
      return o;
    };
    const ta0 = Texts.apply;
    Texts.apply = function (o) {
      const r = ta0.apply(this, arguments);
      safe(() => {
        if (o && o.map_pieces) for (const t in o.map_pieces) if (ENTS[t]) setFields9(ENTS[t], o.map_pieces[t], ['name', 'desc']);
        if (o && o.map_rooms) for (const id in o.map_rooms) if (RT[id]) setFields9(RT[id], o.map_rooms[id], ['name', 'desc']);
        if (o && o.map_tiles) for (const ch in TILE) if (o.map_tiles[TILE[ch].id]) setFields9(TILE[ch], o.map_tiles[TILE[ch].id], ['name', 'desc']);
      });
      return r;
    };
  });
  Object.assign(MK, { validate, edit, showHub, showEditor, playMap, toast, previewRoom, drawEditor, tileAtlas, paintBrushIcon, applyAt, setTool, pickBrush, selectRoom, addRoom, setType, goFloor, layoutCanvas });
})();

