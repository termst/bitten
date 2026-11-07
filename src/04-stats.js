/* src/04-stats.js: lifetime stats and achievements. From v5 to v8. Lines 1236 to 1359 of the v13.7 script. */
/* =====================================================================
   Lifetime stats and achievements (saved per viewer, best effort)
   ===================================================================== */
const STAT_DEFS = [
  ['kills', 'Snakes killed'], ['heals', 'Times healed'], ['rooms', 'Rooms cleared'], ['runs', 'Runs started'],
  ['deaths', 'Times eaten'], ['wins', 'Escapes'], ['bosses', 'Bosses beaten'], ['items', 'Powerups taken'],
  ['legend', 'Legendaries taken'], ['eaten', 'Rocks and eggs eaten'], ['goals', 'Goals scored'], ['boomed', 'Things blown up'],
  ['burnKills', 'Snakes burned'], ['coins', 'Coins found'], ['spent', 'Coins spent'], ['votes', 'Votes cast'],
  ['downs', 'Downgrades taken'], ['curses', 'Curses taken'], ['cleansed', 'Washed off'], ['vaults', 'Vaults opened'],
  ['jackpots', 'Jackpots'], ['minis', 'Mini bosses beaten'], ['survived', 'Survival rooms won'],
  ['endlessFloor', 'Deepest Endless floor'], ['achs', 'Achievements'], ['time', 'Time played'],
];

const ACHS = [
  { id: 'first', reward: 'sharp', name: 'First Bite', desc: 'Kill your first snake.', stat: 'kills', goal: 1 },
  { id: 'pest', reward: 'quick', name: 'Pest Control', desc: 'Kill 100 snakes.', stat: 'kills', goal: 100 },
  { id: 'extinct', reward: 'crown', name: 'Extinction Event', desc: 'Kill 500 snakes.', stat: 'kills', goal: 500 },
  { id: 'medic', reward: 'juice', name: 'Snack Break', desc: 'Heal 20 times.', stat: 'heals', goal: 20, unlocks: 'krul' },
  { id: 'mother', reward: 'twin', name: 'Mother Issues', desc: 'Beat the Grub Mother.', stat: 'boss_mother', goal: 1, unlocks: 'appel' },
  { id: 'queen', reward: 'frost', name: 'Off With Her Head', desc: 'Beat the Lamprey Queen.', stat: 'boss_queen', goal: 1 },
  { id: 'ouro', reward: 'mirror', name: 'Tail End', desc: 'Beat Ouroboros.', stat: 'boss_ouro', goal: 1 },
  { id: 'rot', reward: 'cyanide', name: 'Compost', desc: 'Kill a Rot Eater in a secret room.', stat: 'k_rotter', goal: 1, unlocks: 'rot' },
  { id: 'escape', reward: 'golden', name: 'Daylight', desc: 'Escape in Arcade or a Daily Run.', stat: 'wins', goal: 1 },
  { id: 'story', reward: 'phoenix', name: 'STOP DE LOCKDOWN', desc: 'Finish story mode.', stat: 'storyWins', goal: 1 },
  { id: 'collector', reward: 'lucky', name: 'Collector', desc: 'Find 20 different powerups.', stat: 'found', goal: 20 },
  { id: 'legend', reward: 'glow', name: 'Legendary', desc: 'Take a legendary powerup.', stat: 'legend', goal: 1 },
  { id: 'hoarder', reward: 'magnet', name: 'Hoarder', desc: 'Hold 12 powerups in one run.', stat: 'mostItems', goal: 12 },
  { id: 'gold', reward: 'peel', name: 'Gold Digger', desc: 'Kill a gold worm.', stat: 'champs', goal: 1 },
  { id: 'waves', reward: 'coaster', name: 'Three Waves', desc: 'Win a challenge room.', stat: 'challenges', goal: 1 },
  { id: 'blood', reward: 'vamp', name: 'Blood Price', desc: 'Pay at an offering altar.', stat: 'offerings', goal: 1 },
  { id: 'secret', reward: 'seeker', name: 'Secret Keeper', desc: 'Break open 5 cracked walls.', stat: 'secrets', goal: 5 },
  { id: 'goal', reward: 'boomer', name: 'What A Save', desc: 'Score a goal on a Boost Worm with its own ball.', stat: 'goals', goal: 1 },
  { id: 'tetris', reward: 'static', name: 'Line Clear', desc: 'Kill a Block Worm.', stat: 'k_tetra', goal: 1 },
  { id: 'rockdiet', reward: 'sprout', name: 'Rock Diet', desc: 'Eat 30 rocks or eggs as Krullenbol.', stat: 'eaten', goal: 30 },
  { id: 'flawless', reward: 'clover', name: 'Flawless', desc: 'Beat a boss without losing an apple.', stat: 'flawless', goal: 1 },
  { id: 'fast', reward: 'cider', name: 'Fast Food', desc: 'Escape in arcade in under 20 minutes.', stat: 'fastWin', goal: 1 },
  { id: 'salad', reward: 'buddy', name: 'Fruit Salad', desc: 'Escape with 3 different characters.', stat: 'winChars', goal: 3 },
  { id: 'explorer', reward: 'regrow', name: 'Explorer', desc: 'Clear 200 rooms.', stat: 'rooms', goal: 200 },
  { id: 'ender', reward: 'pick', name: 'The End?', desc: 'Beat the Ender Wyrm behind a portal.', stat: 'boss_ender', goal: 1 },
  { id: 'kaboom', reward: 'pump', name: 'Kaboom', desc: 'Blow up 30 rocks, pots or eggs with explosions.', stat: 'boomed', goal: 30 },
  { id: 'selfserve', reward: 'fuse', name: 'Self Service', desc: 'Make a Fuel Worm blow itself up.', stat: 'fuelPop', goal: 1 },
  { id: 'hellfire', reward: 'brim', name: 'Hellfire', desc: 'Kill 40 snakes while they are on fire.', stat: 'burnKills', goal: 40 },
  { id: 'devil', reward: 'pact', name: 'Deal With The Devil', desc: 'Pay at 3 offering altars.', stat: 'offerings', goal: 3 },
  { id: 'chill', reward: 'capy', name: 'Chill Guy', desc: 'Stand still for 8 seconds while snakes hunt you.', stat: 'chill', goal: 1 },
  { id: 'tycoon', reward: 'dropper', name: 'Park Tycoon', desc: 'Clear 30 rooms in one run.', stat: 'mostRooms', goal: 30 },
  { id: 'pricewar', reward: 'tag', name: 'Price War', desc: 'Beat the Price War in the supermarket.', stat: 'boss_pricewar', goal: 1 },
  { id: 'coalition', reward: 'motie', name: 'Coalition Collapse', desc: 'Beat The Coalition in the Second Chamber.', stat: 'boss_coalition', goal: 1, unlocks: 'mika' },
  { id: 'hardwin', reward: 'hamer', name: 'Rotten To The Core', desc: 'Escape on Hard or Nightmare.', stat: 'hardWins', goal: 1, unlocks: 'nightmare' },
  { id: 'nightwin', reward: 'deltaplan', name: 'Nightmare Fuel', desc: 'Escape on Nightmare.', stat: 'nightWins', goal: 1 },
  { id: 'deep', reward: 'klomp', name: 'Deep Dive', desc: 'Reach floor 6 in Endless.', stat: 'endlessFloor', goal: 6 },
  { id: 'abyss', reward: 'coalitie', name: 'No Bottom', desc: 'Reach floor 10 in Endless.', stat: 'endlessFloor', goal: 10 },
  { id: 'rushwin', reward: 'veto', name: 'Boss Rush', desc: 'Beat all six bosses in Boss Rush.', stat: 'rushWins', goal: 1 },
  { id: 'dailywin', reward: 'kroket', name: 'Daily Bread', desc: 'Escape in a Daily Run.', stat: 'dailyWins', goal: 1 },
  { id: 'voter', reward: 'stroop', name: 'Democracy', desc: 'Vote in 5 rooms.', stat: 'votes', goal: 5 },
  { id: 'aisle', reward: 'gratis', name: 'Clean Up Aisle Five', desc: 'Ram snakes with shopping carts 15 times.', stat: 'cartHits', goal: 15 },
  { id: 'lobbybust', reward: 'molen', name: 'Lobby Buster', desc: 'Kill 10 Lobbyists.', stat: 'k_lobby', goal: 10 },
  { id: 'bluescreen', reward: 'hagel', name: 'Blue Screen', desc: 'Freeze the room 15 times as Mikappols.', stat: 'freezes', goal: 15 },
  { id: 'spender', reward: 'bonus', name: 'Big Spender', desc: 'Spend 150 coins in shops.', stat: 'spent', goal: 150 },
  { id: 'fresh', reward: 'sap', name: 'Fresh Start', desc: 'Wash off 5 downgrades or curses.', stat: 'cleansed', goal: 5 },
  { id: 'hexed', reward: 'bruised', name: 'Hex Collector', desc: 'Carry 3 curses at once.', stat: 'mostCurses', goal: 3 },
  { id: 'jackpot', reward: 'seedbank', name: 'Jackpot', desc: 'Hit the jackpot on a slot machine.', stat: 'jackpots', goal: 1 },
  { id: 'safecrack', reward: 'graft', name: 'Safe Cracker', desc: 'Open 3 vaults.', stat: 'vaults', goal: 3 },
  { id: 'holdline', reward: 'pollen', name: 'Hold The Line', desc: 'Win a survival room.', stat: 'survived', goal: 1 },
  { id: 'biggame', reward: 'compost', name: 'Big Game', desc: 'Beat 3 mini bosses.', stat: 'minis', goal: 3 },
  { id: 'rotluck', reward: 'dash', name: 'Rotten Luck', desc: 'Get 10 downgrades. It happens.', stat: 'downs', goal: 10 },
];

const Meta = {
  _t: null,
  value(k) {
    const d = Save.data;
    if (k === 'found') return Object.keys(d.found).length;
    if (k === 'winChars') return Object.keys(d.winChars).length;
    if (k === 'achs') return ACHS.filter((a) => d.ach[a.id]).length;
    return d.stats[k] || 0;
  },
  add(k, n = 1) {
    const S = Save.data.stats;
    S[k] = (S[k] || 0) + n;
    this.check(); this.soon();
  },
  max(k, v) {
    const S = Save.data.stats;
    if (v > (S[k] || 0)) { S[k] = v; this.check(); this.soon(); }
  },
  mark(map, key) { if (!Save.data[map][key]) { Save.data[map][key] = 1; this.check(); this.soon(); } },
  soon() { if (!this._t) this._t = setTimeout(() => { this._t = null; Save.store(); }, 1200); },
  check() { for (const a of ACHS) if (!Save.data.ach[a.id] && this.value(a.stat) >= a.goal) this.grant(a); },
  grant(a) {
    Save.data.ach[a.id] = Date.now();
    if (a.unlocks && typeof Game !== 'undefined') Game.unlock(a.unlocks);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast(a);
    if (a.reward && typeof Game !== 'undefined') Game.giveReward(a);
    Save.store();
  },
  done() { return ACHS.filter((a) => Save.data.ach[a.id]).length; },
  progress(a) { return Math.min(this.value(a.stat), a.goal); },
  // the closest character still locked, for the pause screen
  nextUnlock() {
    let best = null;
    for (const id of CHAR_IDS) {
      const C = CHARS[id]; if (id === 'apple' || Save.data.unlocks[id] || !C.ach) continue;
      if (!ACHS.find((x) => x.id === C.ach)) continue;
      const a = ACHS.find((x) => x.id === C.ach); if (!a) continue;
      const f = this.progress(a) / a.goal;
      if (!best || f > best.f) best = { id, a, f };
    }
    return best;
  },
};
function fmtTime(sec) {
  sec = Math.floor(sec || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}h ${m}m` : `${m}:${String(s).padStart(2, '0')}`;
}

/* Tetrominoes for the Block Worm */
const TETROS = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};
const TETRO_COL = { I: '#3fc6d8', O: '#f2d33c', T: '#a85ad8', S: '#5ccf5a', Z: '#e8483c', J: '#4a6ee0', L: '#f08a2c' };
const TETRO_ORDER = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

