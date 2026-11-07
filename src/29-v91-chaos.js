/* src/29-v91-chaos.js: v9.1: Extreme Chaos and a meaner Coalition. From v9.1. Lines 15637 to 15773 of the v13.7 script. */
/* =====================================================================
   Version 9.1: Extreme Chaos, and a meaner Coalition
   Three layers of 10 to 20 rooms. Any room, any snake, any boss, anywhere.
   ===================================================================== */
const CHAOS_POOL9 = ['grub', 'hood', 'lamprey', 'long', 'splitter', 'sniper', 'tetra', 'rocket', 'fuel', 'bonus', 'discount', 'kamerlid', 'lobby',
  'stok', 'stroopw', 'bril', 'handel', 'pantser', 'driekop', 'sloper', 'kameleon', 'raver'];
const CHAOS_BOSSES9 = ['mother', 'queen', 'pricewar', 'coalition', 'ouro', 'ender', 'manu', 'manudevil', 'bus', 'tellie', 'rechter'];
const CHAOS_ROOMS9 = ['chest', 'shop', 'challenge', 'challenge', 'offering', 'pantry', 'vote', 'gamble', 'survival', 'survival', 'miniboss', 'miniboss', 'miniboss',
  'spring', 'library', 'tank', 'kapper', 'courtroom', 'chaosboss', 'chaosboss', 'chaosboss'];
const CHAOS_MODS9 = [null, null, null, 'dark', 'swarm', 'elite', 'elite', 'spikes', 'collapse', 'freezer', 'skins', 'roots', 'lasers', 'blackice'];
const CHAOS_LAYERS9 = [
  { name: 'Wrong Rooms', sub: 'Nothing down here is where it belongs.' },
  { name: 'Wrong Snakes', sub: 'Everything that ever bit you, all at once.' },
  { name: 'Everything At Once', sub: 'The last layer. Then daylight. Maybe.' },
];
const CHAOS_LOOKS9 = { cellar: () => LEVELS[0], halls: () => LEVELS[1], market: () => LEVELS[2], kamer: () => LEVELS[3], garden: () => LEVELS[4], bus: () => STORY_BUS, rave: () => STORY_RAVE, court: () => STORY_COURT };

MODES.chaos = { name: 'Extreme Chaos', desc: 'Three layers of 10 to 20 rooms. Every room, snake and boss can turn up anywhere, in rooms where they do not belong.', floors: 3 };
MODE_IDS.push('chaos');
MODE_ICONS.chaos = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 5.3 5.6.4-4.3 3.6 1.4 5.5L12 14.8 7.1 17.8l1.4-5.5L4.2 8.7l5.6-.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 21l4-4m14 4-4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
MODES.custom = { name: 'Custom Run', desc: 'Build your own run from the floors and bosses you have met, and set the rules.', floors: 5 };
MODE_IDS.push('custom');
MODE_ICONS.custom = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="13" y="4.5" width="4" height="5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="7" y="14.5" width="4" height="5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['customWins', 'Custom runs won']);
STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['chaosWins', 'Chaos survived']);
ACHS.push({ id: 'chaos', reward: 'remix', name: 'Agent of Chaos', desc: 'Survive all three layers of Extreme Chaos.', stat: 'chaosWins', goal: 1 });

/* the three layers of one run: a random look, a random size, a random boss in the lair */
function chaosLevel9(i) {
  const run = G.run;
  if (!run.chaos) {
    const sets = shuffle(Object.keys(CHAOS_LOOKS9)).slice(0, 3);
    const bosses = shuffle(CHAOS_BOSSES9.slice());
    run.chaos = sets.map((set, k) => {
      const base = CHAOS_LOOKS9[set]();
      return Object.assign({}, base, CHAOS_LAYERS9[k], {
        set, chaos: true, tier: [1, 3, 4][k], rooms: rndi(8, 16), boss: bosses[k], portal: true, endless: false, rush: false,
        hpMult: [1.35, 1.65, 1.95][k], venomSpeed: [162, 174, 186][k],
      });
    });
  }
  return run.chaos[i];
}

/* after a layer is laid out: shake every room up */
function chaosFloor9(map, def) {
  const rng = Math.random;
  if (G.levelIdx + 1 > (Save.data.best.chaos || 0)) { Save.data.best.chaos = G.levelIdx + 1; Save.store(); }
  const fights = shuffle(map.rooms.filter((r) => r.type === 'fight'));
  const nSpecial = Math.round(fights.length * 0.35);
  fights.forEach((r, i) => { if (i < nSpecial) chaosRoom9(r, pick(CHAOS_ROOMS9), def, rng); else chaosFight9(r, def, rng); });
  for (const r of map.rooms) if (r.type === 'fight' || r.type === 'challenge' || r.type === 'survival') r.chaos = true;
}
function resetRoom9(r) {
  r.mod = null; r.ice = false; r.spikes = []; r.cracks = []; r.skins = []; r.roots = []; r.voteRoom = false; r.wave = 0; r.surv = null; r.mini = null;
}
function chaosRoom9(r, t, def, rng) {
  resetRoom9(r);
  const flip = { rng, fx: rng() < 0.5, fy: rng() < 0.5 };
  r.type = t;
  if (t === 'chest') { r.build(TPL.chest, def, flip); r.cleared = true; if (r.chest && rng() < 0.3) r.chest.mimic = true; }
  else if (t === 'shop') { r.build(TPL.shop, def, flip); r.cleared = true; r.store = rng() < 0.5 ? 'blue' : 'yellow'; }
  else if (t === 'challenge') { r.build(TPL.challenge, def, flip); r.cleared = false; r.wave = 0; }
  else if (t === 'vote') { r.voteRoom = true; r.build(TPL.vote, def); r.cleared = true; }
  else if (t === 'miniboss') {
    r.build(TPL.miniboss, def, flip); r.cleared = false;
    const all = [].concat(...Object.values(MINI_POOL)).concat(['sloper', 'driekop', 'pantser', 'tetra', 'fuel', 'lobby', 'bril']);
    r.mini = pick(all);
  } else if (t === 'survival') { r.build(TPL.survival, def, flip); r.cleared = false; r.surv = { on: false, t: 0, spawnT: 0, len: 25 }; }
  else if (t === 'chaosboss') { r.build(TPL.boss, def); r.cleared = false; r.chaosBoss = pick(CHAOS_BOSSES9); }
  else { r.build(TPL[t], def, t === 'library' ? { rng } : flip); r.cleared = true; }
}
function chaosFight9(r, def, rng) {
  resetRoom9(r);
  const sets = Object.keys(FIGHT_SETS);
  const tpl = pick(FIGHT_SETS[pick(sets)]);
  r.mod = pick(CHAOS_MODS9);
  r.build(tpl, def, { rng, fx: rng() < 0.5, fy: rng() < 0.5, shuffle: true, mod: r.mod });
  if (r.mod === 'freezer' || r.mod === 'blackice') r.ice = true;
  if (r.mod === 'spikes') placeSpikes(r, rng);
  if (r.mod === 'collapse') placeCracks(r, rng);
  // snakes that have no business being here
  for (const s of r.spawns) if (rng() < 0.45) s.kind = pick(CHAOS_POOL9);
}
// a boss in the middle of a layer: beat it for a legendary
function chaosBossFight9(room, entry) {
  const L = G.levelDef, keep = L.boss;
  L.boss = room.chaosBoss;
  try { Game.startBoss(room, entry); } finally { L.boss = keep; }
}
function chaosCombat9(room) {
  if (!G.levelDef || !G.levelDef.chaos || room.type !== 'fight') return;
  const P = G.player;
  const n = Math.random() < 0.55 ? 1 : 0;
  for (let i = 0; i < n; i++) {
    const cell = Game.farCell(room, P, new Set());
    room.snakes.push(new Snake(pick(CHAOS_POOL9), cell.x, cell.y, { delay: 0.8 + i * 0.3, ang: Math.atan2(P.y - cell.y, P.x - cell.x), champ: Math.random() < 0.15 }));
  }
}
function chaosCleared9(room) {
  if (room.type !== 'chaosboss') return;
  spawnItem(room, RW / 2, RH / 2 - 20, 0.6);
  dropHeart(room, RW / 2 - 50, RH / 2 + 24, 2); dropCoins(room, RW / 2 + 50, RH / 2 + 24, 6);
  UI.card('', 'It is down', 'It did not belong here either.', 'boss', 2);
}
MINI9.chaosboss = (c, mx, my, cur) => { c.fillStyle = cur ? '#5a1430' : '#ff5a8a'; circle(c, mx, my - 0.5, 3); c.fillStyle = cur ? '#ece2d4' : '#1a0c0c'; circle(c, mx - 1.1, my - 1, 0.8); circle(c, mx + 1.1, my - 1, 0.8); };

/* ------------------------------------------------------------------ The Coalition, meaner */
Object.assign(KINDS.coalition, { hp: 270, speed: 58 });
Object.assign(KINDS.party, { hp: 52, speed: 78 });
(() => {
  const coal0 = AI.coalition, party0 = AI.party;
  AI.coalition = function (sn, room, dt) {
    const before = sn.mode, half = sn.hp < sn.maxHp * 0.75;
    coal0(sn, room, dt * (half ? 1.25 : 1.12));
    if (!sn.alive || sn.split) return;
    // every act ends with a paper volley: the minutes of the meeting
    if (before !== 'move' && sn.mode === 'move') {
      const n = half ? 12 : 9, off = rnd(TAU);
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, G.levelDef.venomSpeed * 0.72, '#f2f0ea'); v.kind = 'paper'; v.spin = rnd(TAU); }
      Sfx.paper();
    }
    // a motion of no confidence: lobbyists shield the coalition
    sn.motionT = (sn.motionT == null ? 9 : sn.motionT) - dt;
    if (sn.motionT <= 0 && sn.mode === 'move') {
      sn.motionT = half ? 9 : 12;
      if (countKind(room, 'lobby') < 2) {
        const cell = nearestFreeCell(room, sn.x + rnd(-60, 60), sn.y + rnd(-60, 60));
        room.snakes.push(new Snake('lobby', cell.x, cell.y, { emerge: false, spawnTime: 0.4 }));
        floatText(sn.x, sn.y - 32, 'MOTIE VAN WANTROUWEN', '#e8e2d0', true); Sfx.gavel();
      }
    }
  };
  AI.party = function (sn, room, dt) { party0(sn, room, dt * 1.1); };
})();
BOSS_INFO.coalition.sub = 'Four parties, one worm. Faster now, and it takes minutes.';

