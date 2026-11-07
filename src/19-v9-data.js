/* src/19-v9-data.js: v9 data: snakes, bosses, Peanapple, powerups, curses, rooms. From v9. Lines 11526 to 11809 of the v13.7 script. */
/* =====================================================================
   Version 9 data: new snakes and bosses, Peanapple, powerups, curses,
   downgrades, achievements, rooms, the tankstation and the kapsalon
   ===================================================================== */

/* ------------------------------------------------------------------ new snakes */
Object.assign(KINDS, {
  stok: {
    name: 'Meerkat Worm', hp: 7, headR: 10, r0: 9, r1: 4, spacing: 6, maxLen: 11, minLen: 4, speed: 70, turn: 3.6, bite: 1, underSpeed: 150, eruptDmg: 1,
    body: '#c9a26b', body2: '#bb9460', outline: '#2a1c0c', hi: 'rgba(255,240,210,0.3)', stripe: '#6a4a26', blood: '#7a5a2a', eye: '#ffb84a', mask: '#2a1c0c',
  },
  stroopw: {
    name: 'Stroopwafel Worm', hp: 13, headR: 12, r0: 12, r1: 8, spacing: 9, maxLen: 9, minLen: 3, speed: 52, turn: 2.6, bite: 1,
    body: '#d9a35a', body2: '#cf9850', outline: '#5a3008', hi: 'rgba(255,240,200,0.32)', grid: '#9a5f26', syrup: '#b8661a', blood: '#b8661a', eye: '#ffd27a',
  },
  bril: {
    name: 'Brillenworm', hp: 8, headR: 10, r0: 9, r1: 4, spacing: 6.5, maxLen: 11, minLen: 4, speed: 62, turn: 3.2, bite: 1,
    body: '#7a4a5a', body2: '#6e4250', outline: '#1a0c12', hi: 'rgba(255,220,230,0.22)', vest: '#e8d8a0', blood: '#5a1a2a', eye: '#7ad0ff',
  },
  handel: {
    name: 'Haggler', hp: 7, headR: 10, r0: 9, r1: 5, spacing: 6.5, maxLen: 9, minLen: 3, speed: 92, turn: 4, bite: 1,
    body: '#6a4a8a', body2: '#5e4080', outline: '#160c22', hi: 'rgba(230,210,255,0.25)', gold: '#f2c230', blood: '#3a1a4a', eye: '#ffe14a',
  },
  pantser: {
    name: 'Pantserworm', hp: 22, headR: 12, r0: 13, r1: 7, spacing: 9, maxLen: 10, minLen: 4, speed: 60, turn: 2.8, bite: 1,
    body: '#8a8f9a', body2: '#7a808b', outline: '#1a1c22', hi: 'rgba(240,245,255,0.3)', plate: '#5a606c', blood: '#4a3a3a', eye: '#ff6a3a',
  },
  driekop: {
    name: 'Driekop', hp: 26, headR: 14, r0: 14, r1: 6, spacing: 10, maxLen: 13, minLen: 5, speed: 50, turn: 2.4, bite: 1,
    body: '#2f6a4a', body2: '#285e40', outline: '#081a10', hi: 'rgba(200,255,220,0.2)', scale: '#4a8a5a', blood: '#1a4a2a', eye: '#ffe14a',
  },
  sloper: {
    name: 'De Sloper', hp: 32, headR: 15, r0: 15, r1: 9, spacing: 11, maxLen: 11, minLen: 4, speed: 44, turn: 2.2, bite: 2,
    body: '#e8b820', body2: '#d8a810', outline: '#1a1400', hi: 'rgba(255,250,200,0.35)', band: '#1a1a1a', blood: '#3a3010', eye: '#ff4a2a',
  },
  kameleon: {
    name: 'Kameleon', hp: 9, headR: 10, r0: 9, r1: 4, spacing: 6.5, maxLen: 12, minLen: 4, speed: 58, turn: 3.2, bite: 1,
    body: '#5aa84a', body2: '#4e9a40', outline: '#0c2008', hi: 'rgba(230,255,200,0.3)', blood: '#2a5a1a', eye: '#ffd84a',
  },
  raver: {
    name: 'Raver', hp: 3, headR: 8.5, r0: 7, r1: 3.5, spacing: 5, maxLen: 8, minLen: 3, speed: 96, turn: 4.6, bite: 1,
    body: '#e8d0ff', body2: '#dcc0f8', outline: '#1a0a2a', hi: 'rgba(255,255,255,0.4)', ring: 'rgba(90,40,120,0.4)', blood: '#b05aff', eye: '#ff3ad8',
  },
  /* ---- bosses ---- */
  manu: {
    boss: true, name: 'DJ Manu-Beau', hp: 200, headR: 25, r0: 25, r1: 15, spacing: 14, maxLen: 12, minLen: 6, bite: 2, speed: 62, turn: 2.4, underSpeed: 280, eruptDmg: 1,
    body: '#e8a0a0', body2: '#de9494', outline: '#3a1414', hi: 'rgba(255,235,235,0.35)', band: '#f4c0b4', crease: 'rgba(120,40,40,0.35)', blood: '#a8304a', eye: '#ffffff',
  },
  manudevil: {
    boss: true, name: 'Devil DJ Manu-Beau', hp: 340, headR: 27, r0: 27, r1: 16, spacing: 14.5, maxLen: 13, minLen: 6, bite: 2, speed: 78, turn: 2.8, underSpeed: 340, eruptDmg: 2,
    body: '#c8262e', body2: '#b81e28', outline: '#1a0204', hi: 'rgba(255,170,150,0.3)', band: '#ff6a3a', crease: 'rgba(40,0,0,0.45)', blood: '#2a0004', eye: '#ffd23a',
  },
  bus: {
    boss: true, noMound: true, name: 'Lijn 34', hp: 100, headR: 19, r0: 19, r1: 19, spacing: 27, maxLen: 6, minLen: 2, bite: 2, speed: 0, turn: 2,
    body: '#d8262e', body2: '#c81e26', outline: '#1a0606', hi: 'rgba(255,220,220,0.3)', window: '#1c2a3a', stripe: '#f2f0ea', blood: '#3a3a3a', eye: '#fff2c4',
  },
  tellie: {
    boss: true, name: 'De Tellie', hp: 150, headR: 22, r0: 8, r1: 6, spacing: 9, maxLen: 18, minLen: 6, bite: 2, speed: 70, turn: 2.6,
    body: '#f2f2f2', body2: '#e2e2e6', outline: '#1a1a1e', hi: 'rgba(255,255,255,0.5)', blood: '#3a6aff', eye: '#7ad0ff',
  },
  rechter: {
    boss: true, name: 'De Kantonrechter', hp: 250, headR: 22, r0: 20, r1: 10, spacing: 12, maxLen: 18, minLen: 7, bite: 2, speed: 52, turn: 2.2,
    body: '#1a1a20', body2: '#24242c', outline: '#000000', hi: 'rgba(200,200,220,0.16)', skin: '#c99a82', bef: '#f2f0ea', blood: '#5a1a2a', eye: '#ffd166',
  },
});
Object.assign(BOSS_INFO, {
  manu: { title: 'DJ Manu-Beau', sub: 'Big guy. Big sound. Wait. Is he a worm now?' },
  manudevil: { title: 'Devil DJ Manu-Beau', sub: 'The afterparty from hell. Nobody leaves until the beat drops.' },
  bus: { title: 'Lijn 34', sub: 'It is a bus. It is a worm. It is late.' },
  tellie: { title: 'De Tellie', sub: 'Eight percent battery. One hour to go. It is furious.' },
  rechter: { title: 'De Kantonrechter', sub: 'He has read the whole chat. All of it. Twice.' },
});
// the DJ joins the Boss Rush, between the Coalition and Ouroboros
RUSH_ORDER.splice(RUSH_ORDER.indexOf('ouro'), 0, 'manu');
RUSH_SET.manu = 'kamer';

/* ------------------------------------------------------------------ Peanapple */
CHAR_IDS.push('pean');
CHARS.pean = {
  name: 'Peanapple', desc: 'Half apple, half guinea pig. Peanut brown, red eyed, and scared of absolutely everything.',
  speed: 166, fireDelay: 0.33, dmg: 0.95, seedSize: 0.88, maxHp: 6, wheek: true,
  perk: 'Wheek: squeaks when a snake gets close, knocking it back and dazing it. Popcorns when a room is clear.',
  unlock: 'Beat DJ Manu-Beau.', ach: 'afterparty',
};

/* ------------------------------------------------------------------ powerups */
const V9_ITEMS = {
  bass: { name: 'Bass Boost', desc: 'Every 4th shot sends a bass wave that hits and pushes snakes back.', apply(p) { p.bass = true; } },
  rave: { name: 'Rave Seeds', desc: '1 in 4 hits makes a snake dance in place for 0.5 seconds.', apply(p) { p.rave = true; } },
  vinyl: { name: 'Vinyl Pips', desc: 'After a hit, a seed skips on to the next snake, once.', apply(p) { p.vinyl = true; } },
  kaas: { w: 0.5, name: 'Kaasburger', desc: 'One more apple, two healed. Walk 5% slower.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(4); p.speed *= 0.95; } },
  bank: { lock: 'phone', name: 'Powerbank', desc: 'Every 9 seconds in a fight: next 5 shots are bigger and hit 60% harder.', apply(p) { p.bank = true; p.bankT = 4; p.bankN = 0; } },
  ov: { name: 'OV-Chipkaart', desc: 'Snakes wake up 1 second later in every fight. Walk 6% faster.', apply(p) { p.ov = true; p.speed *= 1.06; } },
  schaar: { name: 'Kappersschaar', desc: '1 in 5 hits deals 3 bonus damage. Snip.', apply(p) { p.schaar = true; } },
  stok: { name: 'Meerkat Lookout', desc: 'Spit close to you slows down and glows.', apply(p) { p.stok = true; } },
  wheek: { name: 'Wheek!', desc: 'A snake too close gets knocked back and dazed. Every 5 seconds.', apply(p) { p.wheek = true; p.wheekCd = 0; } },
  perfect: { lock: 'untouchable', name: 'Perfect Peel', desc: 'Every room cleared without a bite: 3% more damage for good, up to 45%.', apply(p) { p.perfect = true; } },
  sticky: { name: 'Stroopkogels', desc: 'Hit snakes slow down and take 15% more damage.', apply(p) { p.stickySeeds = true; } },
  nitro: { lock: 'fulltank', name: 'Nitro', desc: 'Every kill: 70% extra speed for 1.5 seconds.', apply(p) { p.nitro = true; p.nitroT = 0; } },
  horn: { lock: 'demolition', name: 'Air Horn', desc: 'Every 8 seconds in a fight, snakes close to you are stunned briefly.', apply(p) { p.horn = true; p.hornT = 3; } },
  bril: { name: 'Reading Glasses', desc: 'See farther in the dark. Every 5th seed is a crit.', apply(p) { p.bril = true; p.brilN = 0; } },
  bezwaar: { name: 'Bezwaar!', desc: 'Once per room, the first spit that would hit you flies back at the shooter.', apply(p) { p.bezwaar = true; p.bezwaarUsed = false; } },
  mandje: { name: 'Boodschappenmandje', desc: 'Shops stock one more powerup. Coins fly to you from farther.', apply(p) { p.mandje = true; } },
  haring: { name: 'Hollandse Nieuwe', desc: 'Every powerup you pick up heals half an apple.', apply(p) { p.haring = true; } },
  bitterbal: { name: 'Bitterballen', desc: 'Kills sometimes drop a bitterbal. Eat it for half an apple, or it bursts on a snake.', apply(p) { p.bitterbal = true; } },
  pinda: { lock: 'pinball', name: 'Pindakaas', desc: 'Seeds stick peanut butter on snakes. It bursts 1 second later for 60% extra damage.', apply(p) { p.pinda = true; } },
  oliebol: { name: 'Oliebol', desc: 'Every 6th shot is an oliebol. Snakes in its sugar cloud cannot bite.', apply(p) { p.oliebol = true; p.olieN = 0; } },
  verzoek: { lock: 'pawnshop', name: 'Betaalverzoek', desc: 'Every kill: 1 in 3 chance of a coin.', apply(p) { p.verzoek = true; } },
  fiets: { name: 'Fietsbel', desc: 'Every 7th shot rings a bell: snakes ahead flinch, spit ahead is swept away.', apply(p) { p.fiets = true; } },
  zonnebril: { name: 'Zonnebril', desc: '1 in 4 spits glances off you.', apply(p) { p.zonnebril = true; } },
  koffie: { w: 0.7, name: 'Tankstation Koffie', desc: 'Shoot 12% faster, walk 6% faster.', apply(p) { p.fireDelay *= 0.88; p.speed *= 1.06; } },
  // legendaries
  disco: { rare: true, lock: 'afterparty', name: 'Disco Ball', desc: 'A disco ball beams a snake every 0.7 seconds for 70% of your damage.', apply(p) { p.disco = { t: 0.7, a: 0 }; } },
  drop: { rare: true, lock: 'hellraiser', name: 'The Drop', desc: 'Every 16 seconds in a fight: every snake takes 4x your damage and is stunned.', apply(p) { p.drop = true; p.dropT = 6; } },
  speaker: { rare: true, lock: 'order', name: 'Speaker Box', desc: 'A speaker follows you and hurts every snake close to it.', apply(p) { p.speaker = { x: p.x, y: p.y + 20, t: 0 }; } },
  remix: { rare: true, name: 'Remix', desc: 'Every shot gets a random effect: fire, frost, poison, zap, split or bounce.', apply(p) { p.remix = true; } },
  wheel: { rare: true, name: 'Hamsterwiel', desc: 'Keep moving to fill the wheel. Full: next shot is a giant wheel that rolls through everything.', apply(p) { p.wheel = 0; } },
  curator: { rare: true, lock: 'curatele', name: 'Curator', desc: 'Once per floor, a killing bite leaves you at half an apple.', apply(p) { p.curator = true; p.curatorUsed = false; } },
};
for (const id in V9_ITEMS) { ITEMS[id] = V9_ITEMS[id]; ITEM_IDS.push(id); }
// locked powerups only join the pool once their achievement is done
function itemUnlocked(id) { const it = ITEMS[id]; return !it || !it.lock || !!(Save.data && Save.data.ach[it.lock]); }

/* ------------------------------------------------------------------ curses and downgrades */
const V9_CURSES = {
  curatele: { curse: true, name: 'Onder Curatele', desc: 'You cannot buy anything. Every coin you carry makes your seeds 1.5% stronger, up to 60%. No allowance.', flag: 'curatele' },
  idool: { curse: true, name: 'Als Een Idool', desc: 'Seeds hit 40% harder. All snakes move 15% faster. Fame has a price.', mod: { dmg: 1.4 }, flag: 'idool' },
  busje: { curse: true, name: 'Pak Deze Bus', desc: 'You walk 25% faster and shoot 10% faster. Every floor is slippery. Brakes not included.', mod: { speed: 1.25, rate: 0.9 }, flag: 'slippery' },
  nacht: { curse: true, name: 'Nachtdienst', desc: 'Every room is darker. Your seeds glow and hit 30% harder. Night shift.', mod: { dmg: 1.3, light: 0.8 }, flag: 'nacht' },
  weken: { curse: true, name: '81 Weken', desc: 'Apple slices do not heal you for the first 81 seconds of every floor. Snakes drop 2x as many slices. The wait is the point.', flag: 'weken' },
  loud: { curse: true, name: 'Noise Complaint', desc: 'Every 4th shot is a heavy bass wave. 1 extra snake in every fight. Noise attracts.', flag: 'loud' },
};
for (const id in V9_CURSES) { CURSES[id] = V9_CURSES[id]; CURSE_IDS.push(id); }
const V9_DOWNS = {
  lowbat: { down: true, name: '8 Procent', desc: 'The longer a fight lasts, the slower you shoot, up to 25%. You recharge in every new room. Low battery.', flag: 'lowbat' },
  crooked: { down: true, name: 'Schuine Foto', desc: 'Shots drift a little to the left. Hang it straight.', mod: { crooked: 0.07 } },
  cold: { down: true, name: 'Kaulo Koud', desc: 'You move 25% slower for the first 3 seconds of every fight. Warm up first.', flag: 'cold' },
  kfail: { down: true, name: 'Kappersfail', desc: 'Seeds are 15% smaller. Nobody says anything. Nobody saw anything.', mod: { size: 0.85 } },
  ghosted: { down: true, name: 'Ghosted', desc: '1 in 5 apple slices disappears just before you reach it. Left on read.', flag: 'ghosted' },
  witharen: { down: true, name: 'Wit Haar', desc: 'Snakes spot you sooner and wake up faster in every fight. White hair, no cover.', flag: 'witharen' },
};
for (const id in V9_DOWNS) { DOWNS[id] = V9_DOWNS[id]; DOWN_IDS.push(id); }

/* ------------------------------------------------------------------ what a powerup sells for at the tankstation */
// not much: a fair price for how strong and how useful it is, never close to what a shop asks
const SELL = {
  twin: 7, cyanide: 5, toffee: 6, worm: 5, cider: 6, big: 6, sling: 4, spread: 7, thorn: 6, rubber: 4, rain: 6, seeker: 6, frost: 5, fizzy: 5, halo: 6, split: 6, hungry: 6,
  ember: 6, boomer: 4, lucky: 5, static: 5, wiggle: 4, quick: 6, sharp: 6, sniper: 5, peel: 6, sprout: 5, spiky: 4, glow: 3, clover: 6, juice: 4, magnet: 3, regrow: 5,
  nova: 12, cannon: 15, buddy: 11, phoenix: 12, storm: 13, crown: 16, chrono: 12, mirror: 11, vamp: 12,
  pump: 5, capy: 5, chill: 4, brim: 5, coaster: 4, pick: 4, fuse: 10, pact: 12, dropper: 13,
  bonus: 4, tag: 5, gratis: 4, hagel: 5, kroket: 6, klomp: 4, motie: 5, hamer: 5, stroop: 5, molen: 5, veto: 10, coalitie: 12, deltaplan: 12,
  compost: 5, graft: 6, bruised: 4, sap: 3, seedbank: 4, pollen: 4, dash: 11,
  bass: 6, rave: 4, vinyl: 6, kaas: 6, bank: 6, ov: 3, schaar: 5, stok: 4, wheek: 5, perfect: 7, sticky: 6, nitro: 4, horn: 5, bril: 5, bezwaar: 5,
  mandje: 3, haring: 4, bitterbal: 5, pinda: 6, oliebol: 4, verzoek: 3, fiets: 4, zonnebril: 6, koffie: 6,
  disco: 14, drop: 15, speaker: 12, remix: 12, wheel: 11, curator: 12,
};
function sellPrice(id, P) {
  let v = SELL[id] || (ITEMS[id] && ITEMS[id].rare ? 10 : 4);
  if (id === 'phoenix' && P && P.phoenixUsed) v = 3;
  if (id === 'veto' && P && P.vetoUsed) v = Math.max(4, v - 4);
  return v;
}

/* ------------------------------------------------------------------ the BP Tankstation: tune one thing up, another down */
const PUMPS = [
  { id: 'super98', name: 'Super 98', desc: 'Seeds hit 20% harder. You walk 10% slower. Premium, heavy.', cost: 30, mod: { dmg: 1.2, speed: 0.9 } },
  { id: 'diesel', name: 'Diesel', desc: '1 more apple of health. You shoot 12% slower. Slow burn.', cost: 28, maxHp: 2, mod: { rate: 1.12 } },
  { id: 'lpg', name: 'LPG', desc: 'You shoot 22% faster. Seeds hit 14% softer. Cheap, quick, weak.', cost: 26, mod: { rate: 0.82, dmg: 0.86 } },
  { id: 'euro95', name: 'Euro 95', desc: 'You walk 16% faster. 0.5 apple less health. Standard fuel, light frame.', cost: 22, maxHp: -1, mod: { speed: 1.16 } },
  { id: 'adblue', name: 'AdBlue', desc: 'Seeds fly 30% farther and faster. They hit 10% softer. Cleaner, weaker.', cost: 20, mod: { range: 1.3, shot: 1.3, dmg: 0.9 } },
  { id: 'turbo', name: 'Turbo', desc: 'Seeds hit 35% harder. You shoot 18% slower. Big hit, long wait.', cost: 36, mod: { dmg: 1.35, rate: 1.18 } },
  { id: 'nos', name: 'Lachgas', desc: 'You shoot 15% faster and walk 10% faster. Seeds fly 20% less far. Fast and short.', cost: 32, mod: { rate: 0.87, speed: 1.1, range: 0.8 } },
  { id: 'wash', name: 'Ruitensproeier', desc: 'Washes off every downgrade you carry. Seeds hit 8% softer. Clean car, dull seeds.', cost: 24, cleanse: true, mod: { dmg: 0.92 } },
  { id: 'xxl', name: 'XXL Fill', desc: 'Seeds are 25% bigger and hit 10% harder. They fly 12% slower. Large size.', cost: 25, mod: { size: 1.25, dmg: 1.1, shot: 0.88 } },
  { id: 'vpower', name: 'V-Max', desc: 'Seeds hit 45% harder. 1 apple less health. Premium price, premium risk.', cost: 40, maxHp: -2, mod: { dmg: 1.45 } },
];
/* ------------------------------------------------------------------ the kapsalon: a fresh cut, or a kappersfail */
const CUTS = [
  { id: 'fade', name: 'Skin fade', desc: 'You walk 8 percent faster. Clean sides, fast legs.', mod: { speed: 1.08 } },
  { id: 'buzz', name: 'Buzz cut', desc: 'You shoot 9 percent faster. Short hair, short delay.', mod: { rate: 0.91 } },
  { id: 'mullet', name: 'Mullet', desc: 'Seeds hit 10 percent harder. Business in front, party in the back.', mod: { dmg: 1.1 } },
  { id: 'curtains', name: 'Middenscheiding', desc: 'Seeds fly 15 percent farther. Parted in the middle. Wide reach.', mod: { range: 1.15 } },
  { id: 'bleach', name: 'Bleached tips', desc: 'Seeds hit 6 percent harder and you walk 4 percent faster. Yellow tips, small boost.', mod: { dmg: 1.06, speed: 1.04 } },
];

/* ------------------------------------------------------------------ lifetime numbers and achievements */
STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['tunes', 'Tunes at the pump'], ['sold', 'Powerups sold'], ['haircuts', 'Haircuts'], ['verdicts', 'Verdicts heard'], ['streak', 'Best clean streak']);
ACHS.find((a) => a.id === 'story').desc = 'Finish STOP DE LOCKDOWN.';
ACHS.find((a) => a.id === 'rushwin').desc = 'Beat every boss in Boss Rush.';
ACHS.push(
  { id: 'afterparty', reward: 'disco', name: 'Afterparty', desc: 'Beat DJ Manu-Beau.', stat: 'boss_manu', goal: 1, unlocks: 'pean' },
  { id: 'hellraiser', reward: 'drop', name: 'Hellraiser', desc: 'Beat Devil DJ Manu-Beau in a hidden club on Hard or Nightmare.', stat: 'boss_manudevil', goal: 1 },
  { id: 'curatele', reward: 'curator', name: 'Onder Curatele', desc: 'Finish the second story.', stat: 'story2Wins', goal: 1 },
  { id: 'lijn34', reward: 'ov', name: 'Pak Deze Bus', desc: 'Beat Lijn 34.', stat: 'boss_bus', goal: 1 },
  { id: 'phone', reward: 'bank', name: '8 Procent', desc: 'Beat De Tellie.', stat: 'boss_tellie', goal: 1 },
  { id: 'judge', reward: 'bezwaar', name: 'Hoger Beroep', desc: 'Beat De Kantonrechter.', stat: 'boss_rechter', goal: 1 },
  { id: 'fulltank', reward: 'nitro', name: 'Vol Tanken', desc: 'Tune your apple 5 times at a BP Tankstation.', stat: 'tunes', goal: 5 },
  { id: 'pawnshop', reward: 'verzoek', name: 'Inkoop Verkoop', desc: 'Sell 10 powerups at a tankstation.', stat: 'sold', goal: 10 },
  { id: 'freshcut', reward: 'schaar', name: 'Fresh Cut', desc: 'Get 5 haircuts at a kapsalon.', stat: 'haircuts', goal: 5 },
  { id: 'order', reward: 'speaker', name: 'Order In The Court', desc: 'Hear 3 verdicts in a courtroom.', stat: 'verdicts', goal: 3 },
  { id: 'meerkat', reward: 'stok', name: 'Lookout Duty', desc: 'Kill 25 Meerkat Worms.', stat: 'k_stok', goal: 25 },
  { id: 'syrupday', reward: 'sticky', name: 'Stroopwafeldag', desc: 'Kill 15 Stroopwafel Worms.', stat: 'k_stroopw', goal: 15 },
  { id: 'nerd', reward: 'bril', name: 'Nerd Alert', desc: 'Break the glasses of 10 Brillenworms.', stat: 'glasses', goal: 10 },
  { id: 'gotcha', reward: 'mandje', name: 'Got You', desc: 'Kill a Haggler that stole your coins.', stat: 'thieves', goal: 1 },
  { id: 'pinball', reward: 'pinda', name: 'Pinball', desc: 'Kill 10 Pantserworms.', stat: 'k_pantser', goal: 10 },
  { id: 'headcount', reward: 'bass', name: 'Headcount', desc: 'Shoot 30 heads off Driekoppen.', stat: 'heads', goal: 30 },
  { id: 'demolition', reward: 'horn', name: 'Demolition', desc: 'Kill 5 Slopers.', stat: 'k_sloper', goal: 5 },
  { id: 'iseeyou', reward: 'rave', name: 'I See You', desc: 'Kill 15 Kameleons.', stat: 'k_kameleon', goal: 15 },
  { id: 'untouchable', reward: 'perfect', name: 'Untouchable', desc: 'Clear 12 rooms in a row without getting bitten.', stat: 'streak', goal: 12 },
  { id: 'popcorn', reward: 'wheek', name: 'Popcorn', desc: 'Escape in Arcade as Peanapple.', stat: 'peanWins', goal: 1 },
);

/* ------------------------------------------------------------------ rooms */
/* New tiles.  5 DJ booth   6 speaker   7 fuel pump   8 the till   9 barber chair   3 the judge's bench
   n court bench   o produce crate   b bread rack   x checkout   l bottle machine   f freezer chest
   p a verdict plate (floor)   s a snack for sale
   New snakes.  k meerkat   w stroopwafel   i brillenworm   j haggler   a pantser   y driekop   z sloper   v kameleon   d raver */
const V9_SPAWN = { k: 'stok', w: 'stroopw', i: 'bril', j: 'handel', a: 'pantser', y: 'driekop', z: 'sloper', v: 'kameleon', d: 'raver' };
const V9_ROCKY = { n: 'bench', o: 'crate', b: 'bread', x: 'checkout', l: 'bottles', f: 'freezer' };

TPL.tank = ['...........', '...........', '..7..7..7..', '...........', '...........', '...........', '..88...s...', '...........', '...........'];
TPL.kapper = ['...........', '...........', '...........', '...........', '.....9.....', '...........', '...........', '...........', '...........'];
TPL.courtroom = ['...........', '.nnn...nnn.', '...........', '....333....', '...........', '..p.....p..', '...........', '.nnn...nnn.', '...........'];
// a club puts its DJ booth on the wall across from its door
function clubTemplate(door) {
  const g = [];
  for (let r = 0; r < ROWS; r++) g.push('...........'.split(''));
  for (const [r, c] of [[1, 1], [1, 9], [7, 1], [7, 9]]) g[r][c] = '6';
  if (door === 's') for (let c = 3; c <= 7; c++) g[2][c] = '5';
  else if (door === 'n') for (let c = 3; c <= 7; c++) g[6][c] = '5';
  else if (door === 'e') for (let r = 2; r <= 6; r++) g[r][2] = '5';
  else for (let r = 2; r <= 6; r++) g[r][8] = '5';
  return g.map((row) => row.join(''));
}
// where the DJ stands behind the booth
function boothSpot(door) {
  if (door === 's') return { x: RW / 2, y: T * 0.95, ax: 1, ay: 0 };
  if (door === 'n') return { x: RW / 2, y: RH - T * 0.95, ax: 1, ay: 0 };
  if (door === 'e') return { x: T * 0.95, y: RH / 2, ax: 0, ay: 1 };
  return { x: RW - T * 0.95, y: RH / 2, ax: 0, ay: 1 };
}

/* the supermarket, up to date: fresh produce, the bakery, the checkouts, the freezers */
MARKET_FIGHT.push(
  ['...........', '.oo..N..oo.', '.oo.....oo.', '...........', '..W..o..W..', '...........', '.oo.....oo.', '.oo..D..oo.', '...........'],
  ['...........', '.x.x...x.x.', '.x.x.N.x.x.', '.x.x...x.x.', '...........', '..W..K..W..', '...........', '.l..j.D..l.', '...........'],
  ['...........', '.bb.....bb.', '...........', '.bb.N.N.bb.', '...........', '..w.....W..', '...........', '.bb.....bb.', '...........'],
  ['...........', '.fff...fff.', '...........', '..W..D..W..', '...........', '...........', '.fff...fff.', '.....w.....', '...........'],
  ['u.........u', '.oo.....bb.', '.oo..j..bb.', '...........', '..N..K..D..', '...........', '.xx.....ll.', '...........', 'u.........u'],
);
// rooms where the new snakes live, one pair per floor
TPL.fight[0].push(
  ['...........', '..#.....#..', '...k...k...', '...........', '....u.u....', '...........', '...i...W...', '..#.....#..', '...........'],
  ['e.........e', '...........', '..k..#..k..', '...........', '.W.......W.', '...........', '..i..#.....', '...........', 'e.........e'],
);
TPL.fight[1].push(
  ['...........', '..#..v..#..', '...........', '.S.......S.', '...........', '....a......', '...........', '..#.....#..', '...........'],
  ['u.........u', '...........', '..v.....v..', '...#...#...', '.....B.....', '...#...#...', '..W.....W..', '...........', 'u.........u'],
);
KAMER_FIGHT.push(
  ['...........', '.###...###.', '...i...i...', '.###...###.', '.....z.....', '...........', '..M.....M..', '...........', '...........'],
  ['u.........u', '..#.....#..', '...M.L.M...', '...........', '..a.....a..', '...........', '..#.....#..', '...........', 'u.........u'],
);
TPL.fight[2].push(
  ['...........', '.#.......#.', '...........', '..y.....W..', '...........', '..W.....z..', '...........', '.#.......#.', '...........'],
  ['e.........e', '...........', '..a..#..v..', '...........', '....y......', '...........', '..v..#..a..', '...........', 'e.........e'],
);
// the new snakes sneak into older rooms too, the strong ones deeper down
NEW_WORMS.cellar += 'ki'; NEW_WORMS.halls += 'via'; NEW_WORMS.market += 'wjw'; NEW_WORMS.kamer += 'iaz'; NEW_WORMS.garden += 'yazv';
MINI_POOL.cellar.push('stok'); MINI_POOL.halls.push('kameleon', 'bril'); MINI_POOL.market.push('stroopw'); MINI_POOL.kamer.push('pantser'); MINI_POOL.garden.push('driekop', 'sloper');

/* the new hazard: lasers in the rave rooms, and black ice at the bus station */
HAZARDS.rave = ['lasers', 0.3];
HAZARDS.bus = ['blackice', 0.3];
HAZARDS.court = ['collapse', 0.14];
Object.assign(DRONE_ROOT, { bus: 49, rave: 41.2, court: 43.65 });

/* the floors grow a little: there is more to find on every one */
for (const L of LEVELS) L.rooms += 1;
/* and the snakes bite a little harder: tougher on Normal and up, fewer slices from pots */
Object.assign(DIFFS.normal, { hp: 1.06, hearts: 0.92 });
Object.assign(DIFFS.hard, { hp: 1.28, speed: 1.08, hearts: 0.8 });
Object.assign(DIFFS.nightmare, { hp: 1.5, speed: 1.14, hearts: 0.66 });

