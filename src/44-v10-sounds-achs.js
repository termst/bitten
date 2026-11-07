/* src/44-v10-sounds-achs.js: v10: sounds, achievements, achievements page. From v10. Lines 21357 to 21682 of the v13.7 script. */
/* =====================================================================
   Version 10: sounds, a lot more achievements, a cleaner achievements
   page, the guide, and the texts file
   ===================================================================== */
Object.assign(Sfx, {
  static10() { this.noise(0.28, { filter: 'highpass', f: 3000, vol: 0.06 }); this.tone(60, 0.2, { type: 'square', vol: 0.03, lp: 300 }); },
  bell10() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.05 }); this.tone(1320, 0.5, { type: 'triangle', vol: 0.05, delay: 0.32 }); },
  whoosh10() { this.noise(0.4, { filter: 'bandpass', f: 600, fTo: 2400, q: 1.2, vol: 0.06 }); },
  boo10() { this.tone(220, 0.6, { to: 110, type: 'sine', vol: 0.12, verb: true }); this.tone(330, 0.6, { to: 165, type: 'triangle', vol: 0.05, verb: true }); },
  cough10() { this.noise(0.12, { filter: 'bandpass', f: 500, q: 1.4, vol: 0.12 }); this.noise(0.1, { filter: 'bandpass', f: 420, q: 1.4, vol: 0.1, delay: 0.16 }); },
  horn10() { this.tone(520, 0.16, { to: 470, type: 'square', vol: 0.06, lp: 2000 }); this.tone(390, 0.22, { to: 350, type: 'square', vol: 0.06, lp: 2000, delay: 0.18 }); },
  gull10() { this.tone(1600, 0.22, { to: 1100, type: 'triangle', vol: 0.04 }); this.tone(1700, 0.18, { to: 1200, type: 'triangle', vol: 0.035, delay: 0.24 }); },
  blow10() { this.noise(0.3, { filter: 'bandpass', f: 900, fTo: 1600, q: 2, vol: 0.05 }); },
  pop10() { this.noise(0.06, { filter: 'highpass', f: 1800, vol: 0.12 }); this.tone(700, 0.05, { to: 300, type: 'triangle', vol: 0.05 }); },
  giggle10() { for (let i = 0; i < 4; i++) this.tone(700 + i * 40, 0.08, { to: 600, type: 'square', vol: 0.03, lp: 2400, delay: i * 0.11 }); },
  swing10() { this.noise(0.18, { filter: 'bandpass', f: 400, fTo: 1800, q: 1, vol: 0.09 }); },
  scare10() { this.noise(0.5, { filter: 'bandpass', f: 1800, fTo: 500, q: 0.8, vol: 0.2 }); this.tone(90, 0.7, { to: 50, type: 'sawtooth', vol: 0.18, lp: 600 }); this.horn10(); },
});

/* ------------------------------------------------------------------ numbers and achievements */
STAT_DEFS.splice(STAT_DEFS.length - 2, 0,
  ['clownHQ', 'Clown HQs survived'], ['balloons', 'Balloons popped'], ['rageKills', 'Rage worms beaten'], ['rageGrow', 'Rage worms that grew'],
  ['jaudeMet', 'Times Jaude woke up'], ['rests', 'Quiet rests'], ['swaps', 'Powerups swapped'], ['gapRooms', 'Caved-in rooms cleared'],
  ['floorsSeen', 'Floors seen'], ['rareFloors', 'Rare floors visited'], ['cubes', 'Power cubes'], ['adsClosed', 'Pop-ups closed']);
ACHS.push(
  { id: 'honk', reward: 'clownneus', name: 'Honk Honk', desc: 'Survive Clini-Clown HQ.', stat: 'clownHQ', goal: 1 },
  { id: 'hqwin', reward: 'kaasschaaf', name: 'Chief Of Medicine', desc: 'Survive Clini-Clown HQ 5 times.', stat: 'clownHQ', goal: 5 },
  { id: 'standup', reward: 'koptelefoon', name: 'Stand Up For Yourself!', desc: 'Fight Jaude when she wakes up, and win.', stat: 'boss_jaude', goal: 1 },
  { id: 'sorry', reward: 'deken', name: 'Sorry, Sorry', desc: 'Say sorry to Jaude.', stat: 'jaudeSorry', goal: 1 },
  { id: 'lightsleeper', reward: 'helm', name: 'Light Sleeper', desc: 'Wake Jaude up 3 times.', stat: 'jaudeMet', goal: 3 },
  { id: 'quietroom', reward: 'verrekijker', name: 'Even Stil', desc: 'Rest on the beanbag in a quiet room 3 times.', stat: 'rests', goal: 3 },
  { id: 'gap', reward: 'gympies', name: 'Mind The Gap', desc: 'Clear 10 rooms where the floor caves in, or that have a chasm.', stat: 'gapRooms', goal: 10, unlocks: 'apploa' },
  { id: 'seagull', reward: 'skyrain', name: 'Free As A Seagull', desc: 'Escape in Arcade or a Daily Run as Apploa Vogels.', stat: 'win_apploa', goal: 1 },
  { id: 'clowns', reward: 'fidget', name: 'Send In The Clowns', desc: 'Kill 40 Clownsnakes.', stat: 'k_clown', goal: 40 },
  { id: 'killer1', reward: 'rodestip', name: 'Not Funny', desc: 'Kill a Killer-Clownsnake.', stat: 'k_killerclown', goal: 1 },
  { id: 'killer10', reward: 'vliegenmepper', name: 'Clown Hunter', desc: 'Kill 10 Killer-Clownsnakes.', stat: 'k_killerclown', goal: 10 },
  { id: 'popper', reward: 'ballon', name: 'Pop Pop Pop', desc: 'Pop 60 hostile balloons.', stat: 'balloons', goal: 60 },
  { id: 'rage5', reward: 'dikkepit', name: 'Anger Management', desc: 'Beat 15 rage worms.', stat: 'rageKills', goal: 15 },
  { id: 'grew', reward: 'puntje', name: 'It Grew', desc: 'Let a rage worm get so angry it grows.', stat: 'rageGrow', goal: 1 },
  { id: 'calm', reward: 'reuzenkracht', name: 'Calm Down', desc: 'Beat De Razende Reus.', stat: 'k_rage3', goal: 1 },
  { id: 'rotking', reward: 'tulp', name: 'Older Than Dirt', desc: 'Kill an Ancient Rot Eater.', stat: 'rotAncient', goal: 1 },
  { id: 'compostbin', reward: 'garantie', name: 'Compost Bin', desc: 'Kill all four kinds of Rot Eater.', stat: 'rotKinds', goal: 4 },
  { id: 'ghost', reward: 'paraplu', name: 'Who You Gonna Call', desc: 'Beat Het Kelderspook behind a cracked wall.', stat: 'boss_spook', goal: 1 },
  { id: 'unplugged', reward: 'elastiek', name: 'Unplugged', desc: 'Kill 15 Stekkerworms.', stat: 'k_stekker', goal: 15 },
  { id: 'bushes', reward: 'bosje', name: 'Nobody Hides From Me', desc: 'Kill 15 Bosjesworms.', stat: 'k_bosje', goal: 15 },
  { id: 'freshair', reward: 'rookgordijn', name: 'Fresh Air', desc: 'Kill 15 Peukworms.', stat: 'k_peukworm', goal: 15 },
  { id: 'mutants', reward: 'knoflook', name: 'Tunnel Vision', desc: 'Kill 25 Tunnelmutants.', stat: 'k_mutant', goal: 25 },
  { id: 'tvdone', reward: 'magnetron', name: 'Switched Off', desc: 'Beat De Demo-TV in De Megastore.', stat: 'boss_tvboss', goal: 1 },
  { id: 'champ', reward: 'hypercharge', name: 'New Champion', desc: 'Beat De Kampioen in De Arena.', stat: 'boss_kampioen', goal: 1 },
  { id: 'peukuit', reward: 'nicotine', name: 'Stoppen Met Roken', desc: 'Beat De Grote Peuk in De Rookruimte.', stat: 'boss_peuk', goal: 1 },
  { id: 'laststop', reward: 'gasmasker', name: 'Last Stop', desc: 'Beat De Tunnelwacht in De Metro.', stat: 'boss_tunnel', goal: 1 },
  { id: 'void', reward: 'inzone', name: 'Stare Back', desc: 'Beat De Leegte in De Afgrond.', stat: 'boss_leegte', goal: 1 },
  { id: 'bosshunter', reward: 'beker', name: 'Boss Hunter', desc: 'Beat 25 bosses.', stat: 'bosses', goal: 25 },
  { id: 'bossslayer', reward: 'crown', name: 'Boss Slayer', desc: 'Beat 100 bosses.', stat: 'bosses', goal: 100 },
  { id: 'flawless5', reward: 'clover', name: 'Not A Scratch', desc: 'Beat 5 bosses without losing an apple.', stat: 'flawless', goal: 5 },
  { id: 'offmap', reward: 'supermeter', name: 'Off The Map', desc: 'Reach a rare floor.', stat: 'rareFloors', goal: 1 },
  { id: 'tourist', reward: 'flap', name: 'Tourist', desc: 'See 6 different floors.', stat: 'floorsSeen', goal: 6 },
  { id: 'seenitall', reward: 'drone', name: 'Seen It All', desc: 'See all 13 floors.', stat: 'floorsSeen', goal: 13 },
  { id: 'bottomless', reward: 'stofzuiger', name: 'Bottomless', desc: 'Reach floor 15 in Endless.', stat: 'endlessFloor', goal: 15 },
  { id: 'deepend', reward: 'powercube', name: 'The Deep End', desc: 'Escape after a run that went through De Afgrond.', stat: 'abyssWins', goal: 1 },
  { id: 'swapmeet', reward: 'patroon', name: 'Swap Meet', desc: 'Swap a powerup for one it clashes with.', stat: 'swaps', goal: 1 },
  { id: 'collector2', reward: 'hyperfocus', name: 'Big Collection', desc: 'Find 60 different powerups.', stat: 'found', goal: 60 },
  { id: 'collector3', reward: 'golden', name: 'Gotta Find Them All', desc: 'Find every powerup.', stat: 'foundAll', goal: 1 },
  { id: 'legend25', reward: 'phoenix', name: 'Living Legend', desc: 'Take 25 legendaries.', stat: 'legend', goal: 25 },
  { id: 'fulldeck', reward: 'special', name: 'Full Deck', desc: 'Hold 20 powerups in one run.', stat: 'mostItems', goal: 20 },
  { id: 'kills1000', reward: 'assseed', name: 'Pest Control Pro', desc: 'Kill 1000 snakes.', stat: 'kills', goal: 1000 },
  { id: 'kills2500', reward: 'storm', name: 'The Worm Apocalypse', desc: 'Kill 2500 snakes.', stat: 'kills', goal: 2500 },
  { id: 'rooms500', reward: 'mandje', name: 'Room Service', desc: 'Clear 500 rooms.', stat: 'rooms', goal: 500 },
  { id: 'runs50', reward: 'pepernoot', name: 'One More Run', desc: 'Start 50 runs.', stat: 'runs', goal: 50 },
  { id: 'deaths25', reward: 'peel', name: 'Applesauce', desc: 'Get eaten 25 times.', stat: 'deaths', goal: 25 },
  { id: 'wins5', reward: 'vitamine', name: 'Fresh Air Again', desc: 'Escape 5 times.', stat: 'wins', goal: 5 },
  { id: 'wins20', reward: 'buddy', name: 'Escape Artist', desc: 'Escape 20 times.', stat: 'wins', goal: 20 },
  { id: 'coins500', reward: 'seedbank', name: 'Piggy Bank', desc: 'Find 500 coins.', stat: 'coins', goal: 500 },
  { id: 'spent500', reward: 'bonus', name: 'Shopaholic', desc: 'Spend 500 coins.', stat: 'spent', goal: 500 },
  { id: 'heals100', reward: 'juice', name: 'Fruit Bowl', desc: 'Heal 100 times.', stat: 'heals', goal: 100 },
  { id: 'gold10', reward: 'lucky', name: 'Gold Fever', desc: 'Kill 10 gold worms.', stat: 'champs', goal: 10 },
  { id: 'mini10', reward: 'sharp', name: 'Small Game Hunter', desc: 'Beat 10 mini bosses.', stat: 'minis', goal: 10 },
  { id: 'secret15', reward: 'pick', name: 'Wall Breaker', desc: 'Break open 15 cracked walls.', stat: 'secrets', goal: 15 },
  { id: 'cleanse20', reward: 'regrow', name: 'Squeaky Clean', desc: 'Wash off 20 downgrades or curses.', stat: 'cleansed', goal: 20 },
  { id: 'winappel', reward: 'big', name: 'Gameplay', desc: 'Escape in Arcade or a Daily Run as Appelgameplay.', stat: 'win_appel', goal: 1 },
  { id: 'winrot', reward: 'cyanide', name: 'Rotten Win', desc: 'Escape in Arcade or a Daily Run as The Rotten Apple.', stat: 'win_rot', goal: 1 },
  { id: 'winkrul', reward: 'kroket', name: 'Curly Win', desc: 'Escape in Arcade or a Daily Run as Krullenbol.', stat: 'win_krul', goal: 1 },
  { id: 'winmika', reward: 'chrono', name: 'One Face', desc: 'Escape in Arcade or a Daily Run as Mikappols.', stat: 'win_mika', goal: 1 },
  { id: 'basket', reward: 'gratis', name: 'Fruit Basket', desc: 'Escape with 6 different characters.', stat: 'winChars', goal: 6 },
  { id: 'nightmare3', reward: 'vamp', name: 'Sleepless', desc: 'Escape on Nightmare 3 times.', stat: 'nightWins', goal: 3 },
  { id: 'daily5', reward: 'koffie', name: 'Daily Grind', desc: 'Escape in 5 Daily Runs.', stat: 'dailyWins', goal: 5 },
  { id: 'chaos3', reward: 'remix', name: 'Chaos Theory', desc: 'Survive Extreme Chaos 3 times.', stat: 'chaosWins', goal: 3 },
  { id: 'rushhard', reward: 'veto', name: 'No Rest', desc: 'Beat the Boss Rush on Hard or Nightmare.', stat: 'rushHard', goal: 1 },
  { id: 'storyboth', reward: 'haring', name: 'Two Stories', desc: 'Finish both stories.', stat: 'storiesDone', goal: 2 },
  { id: 'adblock', reward: 'garantie', name: 'Adblocker', desc: 'Close 20 pop-up ads in De Megastore.', stat: 'adsClosed', goal: 20 },
  { id: 'cubed', reward: 'dikkepit', name: 'Cubed', desc: 'Pick up 25 power cubes.', stat: 'cubes', goal: 25 },
);
{ const rw = ACHS.find((a) => a.id === 'rushwin'); if (rw) rw.desc = 'Beat every boss in Boss Rush.'; }
MODES.arcade.desc = 'Five floors, one life. After the first one, any floor can turn out to be a rare one with its own boss.';
MODES.endless.desc = 'The floors never end, and rare floors turn up more and more. Every lap down gets nastier.';
{
  const w0 = Game.win;
  Game.win = function (afterStory) {
    if (G.mode !== 'story' || afterStory) {
      const m = G.mode, P = G.player, run = G.run;
      if ((m === 'arcade' || m === 'daily') && P) Meta.add('win_' + P.char);
      if ((m === 'arcade' || m === 'daily') && run && run.floors10 && run.floors10.includes('afgrond')) Meta.add('abyssWins');
      if (m === 'rush' && (G.diff === 'hard' || G.diff === 'nightmare')) Meta.add('rushHard');
    }
    return w0.call(this, afterStory);
  };
}

/* ------------------------------------------------------------------ the achievements page */
const BOSS_ORDER10 = ['mother', 'queen', 'pricewar', 'coalition', 'ouro', 'ender', 'manu', 'manudevil', 'bus', 'tellie', 'rechter', 'peuk', 'tvboss', 'kampioen', 'tunnel', 'leegte', 'spook', 'jaude'];
const STAT_GROUP10 = {
  kills: 'Fighting', burnKills: 'Fighting', bosses: 'Fighting', minis: 'Fighting', boomed: 'Fighting', goals: 'Fighting', balloons: 'Fighting', rageKills: 'Fighting', rageGrow: 'Fighting', cubes: 'Fighting', adsClosed: 'Fighting', streak: 'Fighting',
  runs: 'Runs', wins: 'Runs', deaths: 'Runs', time: 'Runs', endlessFloor: 'Runs', chaosWins: 'Runs', achs: 'Runs',
  rooms: 'Exploring', vaults: 'Exploring', survived: 'Exploring', votes: 'Exploring', jackpots: 'Exploring', clownHQ: 'Exploring', jaudeMet: 'Exploring', rests: 'Exploring', gapRooms: 'Exploring', floorsSeen: 'Exploring', rareFloors: 'Exploring', verdicts: 'Exploring',
  items: 'Stuff', legend: 'Stuff', coins: 'Stuff', spent: 'Stuff', heals: 'Stuff', tunes: 'Stuff', sold: 'Stuff', haircuts: 'Stuff', swaps: 'Stuff', eaten: 'Stuff',
  downs: 'Rot', curses: 'Rot', cleansed: 'Rot',
};
const STAT_ORDER10 = ['Runs', 'Fighting', 'Exploring', 'Stuff', 'Rot', 'Other'];
function achCat10(a) {
  const s = a.stat;
  if (/^boss_/.test(s) || ['bosses', 'flawless', 'minis', 'rushWins', 'rushHard'].includes(s)) return 'bosses';
  if (/^k_/.test(s) || ['kills', 'champs', 'burnKills', 'balloons', 'rageKills', 'rageGrow', 'rotAncient', 'rotKinds', 'goals', 'fuelPop', 'cartHits', 'thieves', 'freezes', 'eaten', 'boomed'].includes(s)) return 'snakes';
  if (['rooms', 'mostRooms', 'secrets', 'vaults', 'challenges', 'survived', 'clownHQ', 'jaudeMet', 'jaudeSorry', 'rests', 'gapRooms', 'floorsSeen', 'rareFloors', 'endlessFloor', 'offerings', 'votes', 'jackpots', 'verdicts', 'tunes', 'haircuts', 'streak', 'chill', 'adsClosed', 'cubes'].includes(s)) return 'places';
  if (['found', 'foundAll', 'legend', 'items', 'mostItems', 'mostCurses', 'curses', 'downs', 'cleansed', 'heals', 'coins', 'spent', 'swaps', 'sold'].includes(s)) return 'collect';
  return 'runs';
}
const ACH_FILTERS10 = [['all', 'All'], ['done', 'Done'], ['almost', 'Almost'], ['todo', 'To do']];
const ACH_CATS10 = [['any', 'Everything'], ['snakes', 'Snakes'], ['bosses', 'Bosses'], ['places', 'Rooms and floors'], ['runs', 'Runs'], ['collect', 'Collecting']];
Object.assign(UI, {
  openAchs(keep) {
    if (!keep) { this.hide('menu'); this.show('achs'); this.el.achs.scrollTop = 0; }
    for (const id of ['achBar10', 'achSum10', 'achFilt10', 'bossTab10', 'snakeTop10', 'charWin10']) this.el[id] = document.getElementById(id);
    const S = Save.data.stats, done = Meta.done(), all = ACHS.length;
    this.el.achCount.textContent = `${done} of ${all} done`;
    if (this.el.achBar10) this.el.achBar10.style.width = `${Math.round((done / all) * 100)}%`;
    // the summary tiles
    const kinds = BOSS_ORDER10.filter((k) => BOSS_INFO[k] || KINDS[k]);
    const beat = kinds.filter((k) => Meta.value('boss_' + k) > 0).length;
    const found = Object.keys(Save.data.found).filter((k) => ITEMS[k]).length;
    const tiles = [['Done', `${done}/${all}`], ['Bosses beaten', `${beat}/${kinds.length}`], ['Snakes killed', Math.floor(Meta.value('kills'))], ['Escapes', Math.floor(Meta.value('wins'))], ['Powerups found', `${found}/${ITEM_IDS.length}`], ['Time played', fmtTime(S.time)]];
    if (this.el.achSum10) this.el.achSum10.innerHTML = tiles.map(([k, v]) => `<div><b>${v}</b><span>${sayF9(k)}</span></div>`).join('');
    // filters
    const box = this.el.achFilt10;
    if (box && !box.childElementCount) {
      const mk = (list, key) => {
        const row = document.createElement('div'); row.className = 'frow10';
        for (const [id, label] of list) {
          const b = document.createElement('button'); b.type = 'button'; b.dataset[key] = id; b.textContent = sayF9(label);
          b.addEventListener('click', (e) => { e.preventDefault(); if (key === 'f') this._achF = id; else this._achC = id; Sfx.blip(); this.paintAchList10(); });
          row.appendChild(b);
        }
        box.appendChild(row);
      };
      mk(ACH_FILTERS10, 'f'); mk(ACH_CATS10, 'c');
    }
    this.paintAchList10();
    // bosses beaten
    if (this.el.bossTab10) this.el.bossTab10.innerHTML = kinds.map((k) => {
      const n = Math.floor(Meta.value('boss_' + k)), nm = BOSS_INFO[k] ? BOSS_INFO[k].title : KINDS[k].name;
      return `<div class="${n ? 'on' : ''}"><span>${n ? escHtml10(nm) : '???'}</span><b>${n || ''}</b></div>`;
    }).join('');
    // the snakes you killed most
    if (this.el.snakeTop10) {
      const rows = Object.keys(KINDS).filter((k) => !KINDS[k].boss).map((k) => [k, Math.floor(Meta.value('k_' + k))]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
      this.el.snakeTop10.innerHTML = rows.length ? rows.map(([k, n]) => `<div class="on"><span>${escHtml10(KINDS[k].name)}</span><b>${n}</b></div>`).join('') : `<p class="savehint">${sayF9('Nothing yet. Go bite back.')}</p>`;
    }
    // your numbers, in groups
    const groups = {};
    for (const [k, label] of STAT_DEFS) { const g = STAT_GROUP10[k] || 'Other'; (groups[g] = groups[g] || []).push([k, label]); }
    this.el.lstats.innerHTML = STAT_ORDER10.filter((g) => groups[g]).map((g) => `<div class="lg10"><h4>${sayF9(g)}</h4><dl class="lstats">${groups[g].map(([k, label]) => `<div><dt>${escHtml10(label)}</dt><dd>${k === 'time' ? fmtTime(S.time) : Math.floor(Meta.value(k))}</dd></div>`).join('')}</dl></div>`).join('');
    // who escaped
    if (this.el.charWin10) this.el.charWin10.innerHTML = CHAR_IDS.map((id) => {
      const won = !!Save.data.winChars[id], n = Math.floor(Meta.value('win_' + id)), open = id === 'apple' || !!Save.data.unlocks[id];
      return `<div class="${won ? 'on' : ''}"><canvas data-char="${id}" aria-hidden="true"></canvas><span>${open ? escHtml10(CHARS[id].name) : '???'}</span><b>${won ? (n ? `${n}x` : sayF9('Escaped')) : sayF9('Not yet')}</b></div>`;
    }).join('');
    if (this.el.charWin10) for (const cv of this.el.charWin10.querySelectorAll('canvas[data-char]')) { const id = cv.dataset.char; paintChar(cv, id, id !== 'apple' && !Save.data.unlocks[id], { face: true }); }
    // the powerups you found
    const coll = this.el.coll; coll.innerHTML = '';
    const fd = Save.data.found;
    this.el.collHead.textContent = `${sayF9('Powerups found')}  ${found} of ${ITEM_IDS.length}`;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const id of ITEM_IDS) {
      const cv = document.createElement('canvas'); cv.width = Math.round(36 * dpr); cv.height = Math.round(36 * dpr);
      if (ITEMS[id].rare) cv.className = 'rare';
      cv.title = fd[id] ? `${ITEMS[id].name}: ${ITEMS[id].desc}` : 'Not found yet';
      coll.appendChild(cv);
      const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      const oc = off.getContext('2d'); oc.setTransform(dpr, 0, 0, dpr, 18 * dpr, 18 * dpr);
      drawItemIcon(oc, id, 25, 1);
      if (!fd[id]) {
        oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = '#16100d'; oc.fillRect(0, 0, off.width, off.height);
        oc.globalCompositeOperation = 'source-over'; oc.fillStyle = 'rgba(236,226,212,0.35)'; oc.font = `700 ${Math.round(14 * dpr)}px "Barlow Condensed", sans-serif`;
        oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.fillText('?', off.width / 2, off.height / 2);
      }
      cv.getContext('2d').drawImage(off, 0, 0);
    }
    if (!keep) setTimeout(() => this.el.btnAchBack.focus({ preventScroll: true }), 50);
  },
  paintAchList10() {
    const f = this._achF || 'all', cat = this._achC || 'any';
    const box = this.el.achFilt10;
    if (box) for (const b of box.querySelectorAll('button')) b.setAttribute('aria-pressed', (b.dataset.f ? b.dataset.f === f : b.dataset.c === cat) ? 'true' : 'false');
    const list = this.el.alist; list.innerHTML = '';
    const rows = ACHS.map((a) => {
      const done = !!Save.data.ach[a.id], v = Meta.progress(a), fr = done ? 1 : a.goal ? v / a.goal : 0;
      return { a, done, v, fr };
    }).filter((r) => (cat === 'any' || achCat10(r.a) === cat) && (f === 'all' || (f === 'done' ? r.done : f === 'todo' ? !r.done : !r.done && r.fr >= 0.5)));
    rows.sort((x, y) => (x.done === y.done ? (x.done ? 0 : y.fr - x.fr) : x.done ? 1 : -1));
    for (const { a, done, v, fr } of rows) {
      const d = document.createElement('div');
      d.className = 'acard ac10' + (done ? ' done' : '');
      d.innerHTML = `${this.medal(done)}<div><p class="an"></p><p class="ad"></p><div class="ab"><i><b style="width:${Math.round(fr * 100)}%"></b></i><span>${done ? sayF9('Done') : a.goal > 1 ? `${Math.floor(v)}/${a.goal}` : '0/1'}</span></div><p class="ar"></p></div>`;
      d.querySelector('.an').textContent = a.name; d.querySelector('.ad').textContent = a.desc;
      const rw = [];
      if (a.unlocks) rw.push(`${done ? 'Unlocked' : 'Unlocks'} ${this.unlockName(a.unlocks)}`);
      if (a.reward && ITEMS[a.reward]) rw.push(`${ITEMS[a.reward].name}${ITEMS[a.reward].rare ? ' (legendary)' : ''}`);
      d.querySelector('.ar').textContent = rw.join('  ·  ');
      list.appendChild(d);
    }
    if (!rows.length) list.innerHTML = `<p class="savehint">${sayF9('Nothing here yet.')}</p>`;
  },
});
function escHtml10(s) { return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

/* ------------------------------------------------------------------ the guide */
(function guide10() {
  const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${name}</b><span class="size">${size}</span><span>${txt}</span></figcaption></figure>`;
  const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
  if (decks[0]) decks[0].insertAdjacentHTML('beforeend', [
    fig('clown', 'Clownsnake', 'Small, slow', 'Happy and slow, and full of balloons. It blows them up fast. The balloons float after you: shoot them before they touch you.'),
    fig('killerclown', 'Killer-Clownsnake', 'Medium, very fast', 'Bigger, faster, not happy at all. It chases you with a spiked bat, vanishes, and turns up right behind you. It can show up in any fight. Any.'),
    fig('rage1', 'Boze Worm', 'Medium', 'A rage worm. Charges and smashes what is in the way. Leave it angry too long and it grows. Anger scales.'),
    fig('rage2', 'Woedeworm', 'Big', 'The second size. Slams the floor and breaks furniture. Still growing. Same mood, more mass.'),
    fig('rage3', 'De Razende Reus', 'Huge', 'The biggest. Throws boulders that leave holes, smashes walls and does not stop charging. Shows up when you make too much noise, take too long, or carry too many curses. You asked for it.'),
    fig('stekker', 'Stekkerworm', 'Small', 'Charges up, then fires a bolt down a straight line. Step out of the line. Not hard.'),
    fig('bosje', 'Bosjesworm', 'Small, fast', 'Hides in bushes and jumps out when you come close. Classic.'),
    fig('peukworm', 'Peukworm', 'Small', 'Leaves hot ash behind it and blows rings of smoke. Do not touch the ash.'),
    fig('mutant', 'Tunnelmutant', 'Small, fast', 'Blind. It hears every shot you fire and rushes to where it came from. Shooting is loud.'),
    fig('rotter', 'Rot Eater', 'Secret rooms', 'Four kinds, harder the deeper you go: plain, Bloated (seeds bounce off while it eats), Hive (hatches rotlings) and Ancient (travels under the floor and heals). Same apple, different problem.'),
  ].join(''));
  if (decks[1]) decks[1].insertAdjacentHTML('beforeend', [
    fig('tvboss', 'De Demo-TV', 'Megastore boss', 'A chain of screens. Zaps across the room, fills it with pop-up ads you can shoot closed, and glares down a whole lane. Display model.'),
    fig('kampioen', 'De Kampioen', 'Arena boss', 'Its Super meter fills while it fights. When it is full: a jump, a slam and a ring of rockets. Below a third it hypercharges. Same bar you have.'),
    fig('peuk', 'De Grote Peuk', 'Rookruimte boss', 'Leaves a trail of fire, blows smoke rings and rains ash. Every quarter it loses, it coughs: hit it then. Smoking is bad for it too.'),
    fig('tunnel', 'De Tunnelwacht', 'Metro boss', 'The strongest one. A rifle, grenades that leave holes, a rail cart, then gas, then the lights go out and the mutants come. Bring everything.'),
    fig('leegte', 'De Leegte', 'Afgrond boss', 'Sinks into the pits and comes up next to you. Breaks the floor into new holes and pulls you toward it. Do not look down.'),
    fig('spook', 'Het Kelderspook', 'Behind a cracked wall', 'Floats through rocks and walls, throws the pots in the room at you, and fades out to say BOO. Basic ghost behavior.'),
    fig('jaude', 'Jaude', 'Rare', 'Your sister. Wake her up and she wants it quiet. Fight her and every bite stays. Say sorry and she yells for a while. Sorry is cheaper.'),
  ].join(''));
  const roomList = document.querySelector('#tab-rooms ul.rooms9');
  if (roomList) roomList.insertAdjacentHTML('beforeend', [
    '<li><i style="background:#ff3a5a" aria-hidden="true"></i><b>Clini-Clown HQ</b><span>From the second floor on, a door that looks like any other. Inside: a row of clowns, balloons everywhere, and more every second. Win and a coin flips: a free powerup, or half an apple gone for good.</span></li>',
    '<li><i style="background:#b8a8e8" aria-hidden="true"></i><b>De Prikkelarme Kamer</b><span>A quiet, dim room with a beanbag. Lie still on it for two seconds: it heals an apple and washes off your oldest downgrade. Finally, quiet.</span></li>',
    '<li><i style="background:#a8c8ff" aria-hidden="true"></i><b>Het Kelderspook</b><span>Some cracked walls hide a ghost instead of a Rot Eater. It is a boss, and it pays like one.</span></li>',
    '<li><i style="background:#ff8ab0" aria-hidden="true"></i><b>Jaude</b><span>Very rarely, after a fight, the doors slam shut again. Your sister was asleep. Step on a plate: fight her, or say sorry.</span></li>',
  ].join(''));
  const rules = document.querySelector('#tab-rooms ul.rules');
  if (rules) rules.insertAdjacentHTML('beforeend', [
    '<li>Short circuits light up a tile in blue before it zaps. The arena gas closes in from the walls: stay in the middle. Thick smoke slows you down and makes it darker.</li>',
    '<li>On live rails a cart comes through after the bell: the rails go red first. Chasms and holes only stop you if you cannot fly.</li>',
    '<li>Bushes hide whatever is in them, you too. Power cube crates in the arena drop cubes: each one makes you stronger until the next floor.</li>',
    '<li>Two powerups that clash cannot be held together. Every powerup has tags, like Fire or Speed; the guide shows them and the rule each tag follows. Stand on the new one for a moment to swap: the old one drops on the floor.</li>',
  ].join(''));
  const modes = document.querySelector('#tab-modes ul.rooms9');
  if (modes) modes.insertAdjacentHTML('beforeend', '<li><i style="background:#9a7aff" aria-hidden="true"></i><b>Rare floors</b><span>De Megastore, De Arena, De Rookruimte, De Metro and De Afgrond, and the bus station, the club and the court from the second story. After the first floor any floor can be a rare one, more often the deeper you go. Each has its own snakes, hazards and boss. De Metro and De Afgrond are the hardest.</span></li>');
})();

/* ------------------------------------------------------------------ the texts file: new floors in, old names out */
{
  const co0 = Texts.collect;
  Texts.collect = function () {
    const o = co0.call(this);
    for (const k in FLOOR10) o.floors[k] = fieldsOf9(FLOOR10[k], ['name', 'sub']);
    for (const k in RARE_NAMES10) o.floors['rare_' + k] = fieldsOf9(RARE_NAMES10[k], ['name', 'sub']);
    return o;
  };
  const ap0 = Texts.apply;
  Texts.apply = function (o) {
    if (o && typeof o === 'object') {
      o = Object.assign({}, o);
      // a texts file from before version 10 still has the old powerup names: keep the new ones
      if (o.powerups && typeof o.powerups === 'object') {
        const pw = {};
        for (const id in o.powerups) {
          const v = o.powerups[id];
          if (!v || typeof v !== 'object') continue;
          const c = Object.assign({}, v);
          if (V10_OLD_NAMES[id] && c.name === V10_OLD_NAMES[id]) delete c.name;
          if (id === 'dash' && c.desc === V10_OLD_TXT.dash) delete c.desc;
          pw[id] = c;
        }
        o.powerups = pw;
      }
      if (o.characters && o.characters.rot && o.characters.rot.perk === V10_OLD_TXT.rot) { o.characters = Object.assign({}, o.characters); o.characters.rot = Object.assign({}, o.characters.rot); delete o.characters.rot.perk; }
    }
    ap0.call(this, o);
    if (o && o.floors) {
      for (const k in FLOOR10) setFields9(FLOOR10[k], o.floors[k], ['name', 'sub']);
      for (const k in RARE_NAMES10) setFields9(RARE_NAMES10[k], o.floors['rare_' + k], ['name', 'sub']);
    }
  };
}


/* ------------------------------------------------------------------ the new lines, for the texts file */
for (const s of ["SWAP", "CRIT", "GOTCHA", "SUPER READY", "MEP", "SUPER", "HELM", "OUT OF THE ZONE", "HIDDEN", "+1", "HYPERCHARGE", "PING", "IN THE ZONE", "HAHA", "HONK", "KUCH", "KUCH KUCH", "MEEUW", "-1", "GARANTIE", "POP", "HIHI", "TADA", "BOO", "BONK", "HONK HONK", "SMASH", "IT GREW", "!", "HATCH", "BLOATED", "SUPER!", "TIK TIK", "KIJK NIET NAAR BENEDEN", "SSST", "STIL NOU", "IK SLAAP", "BAM", "KAMPIOEN", "ROKEN", "IS DODELIJK", "MEGASTORE", "ROOD", "BLAUW", "ARENA", "-1/2", "RUST", "Some of us are trying to SLEEP.", "OKAY. You asked for it.", "SORRY is not ENOUGH.", "SLAM", "STIL!", "AU", "IK SLAAP!", "GA WEG!", "WAAROM?!", "ZACHTJES!", "...fine. Goodnight.", "GONE FOR GOOD", "DEKEN +1", "WEGGEKLIKT", "adsClosed", "TOET", "TULP", "CLINI-CLOWN HQ", "CLINI-CLOWN", "PRIKKELARM", "PARAPLU", "C", "MA", "-50%"]) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
for (const s of ["Part of you", "Reuzenkracht", "You are really angry now. Six seconds.", "Covered by warranty", "That downgrade bounced right off. Once per floor.", "The lair", "Uitverkoop", "Everything must go. Even the cables.", "Hypercharge", "The Champion is glowing purple. Everything faster.", "Gas", "He pulls his mask down. The tunnel fills up.", "Lights out", "The station lamp dies. Only his headlamp is left.", "A secret room", "The Rot Eater", ", ", "A hidden room", "Clini-Clown HQ", "The clowns took over the hospital. They want you to smile.", "TADA", "The clowns left you a present. No strings attached. Probably.", "HAHA", "The joke is on you: half an apple of health, gone for good.", "A quiet moment. Everything is a little lighter.", "Rested", "A quiet moment. That helped.", "Jaude is awake", "Fight her: every bite stays for good. Say sorry: she yells, you lose a bite or two.", "A small boss", "Jaude", "Every bite she gets in stays for good.", "The gas is coming", "It closes in from the walls. Stay in the middle."]) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
/* ------------------------------------------------------------------ loop and boot */
let lastFrame = performance.now();
function frame(now) {
  let dt = (now - lastFrame) / 1000; lastFrame = now;
  if (!(dt > 0)) dt = 0;
  dt = Math.min(dt, 0.05);
  try {
    if (G.state === 'play') {
      const steps = Math.max(1, Math.ceil(dt / (1 / 60) - 1e-6));
      const h = dt / steps;
      for (let i = 0; i < steps && G.state === 'play'; i++) Game.update(h);
    } else if (G.state === 'cutscene') Story.update(dt);
    else if (G.state === 'menu') { MenuScene.step(dt); Sfx.musicTick(); }
    else if (G.state === 'win') Sfx.musicTick();
    render(dt);
  } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

