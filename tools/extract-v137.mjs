// One-time tool (T6, T7, M16): split ref/Bitten_v13.7.html into src/*.js, assets/wals.mp3 and
// the pieces of index.html. Kept for the record; src/ is the source of truth after this ran.
// Usage: node tools/extract-v137.mjs [path/to/Bitten_v13.7.html]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(process.argv[2] || path.join(root, 'ref/Bitten_v13.7.html'), 'utf8');
const L = html.split('\n');
const iScript = L.indexOf('<script>');
const iEnd = L.lastIndexOf('</script>');
const js = L.slice(iScript + 1, iEnd);

// start line (1-based in the script), file name, what it is, versions
const PARTS = [
  [1, '00-music-remix', 'Rotten Waltz (Bite Remix): the 140 BPM menu remix, synthesized', 'v9 to v10'],
  [408, '01-core', 'core helpers, constants, settings, world geometry, per viewer progress', 'v1 to v8'],
  [586, '02-sound', 'Sfx: every sound synthesized with WebAudio', 'v1 to v8'],
  [807, '03-data', 'data: levels, room templates, snakes, powerups', 'v1 to v8'],
  [1236, '04-stats', 'lifetime stats and achievements', 'v5 to v8'],
  [1360, '05-world', 'world: rooms, level layout, collision helpers', 'v1 to v8'],
  [1824, '06-draw', 'drawing: the apple, icons, snakes, obstacles, room cache, decals', 'v1 to v8'],
  [3973, '07-draw-2', 'drawing part two: Mikappols, the new worms, supermarket and chamber rooms, icons', 'v7'],
  [4696, '08-draw-v8', 'drawing for v8: icons, curses, downgrades, walls, furniture, the info card', 'v8'],
  [5539, '09-input', 'Input: keyboard, mouse and two floating touch sticks', 'v1 to v8'],
  [5660, '10-actors', 'actors: Player, seeds, venom, pickups, particles, decals', 'v1 to v8'],
  [6525, '11-snakes', 'class Snake: movement helpers and behaviours', 'v1 to v8'],
  [7165, '12-block-boost', 'Block Worm, Boost Worm and its ball, Seed Storm', 'v6 to v7'],
  [7424, '13-explosions', 'explosions, fire, fuel cans, Fuel Worm, creepers, Ender Wyrm', 'v7'],
  [7668, '14-supermarket', 'supermarket and Second Chamber: coins, carts, belts, spikes, worms, two bosses', 'v7'],
  [8275, '15-v8-rules', 'v8: downgrades, curses, keys, vault, slot machine, spring, hazards, traits, threat', 'v8'],
  [9047, '16-story', 'story mode: Jensbabba, the lockdown and the worms', 'v8'],
  [9765, '17-render', 'rendering: layout, room, lighting, HUD, menu scene, bestiary pictures', 'v1 to v8, v13.1'],
  [10996, '18-game', 'Game flow, UI wiring, the main loop (frame)', 'v1 to v8'],
  [11526, '19-v9-data', 'v9 data: snakes, bosses, Peanapple, powerups, curses, rooms', 'v9'],
  [11810, '20-v9-draw-snakes', 'v9 drawing: new snakes and bosses, Peanapple, icons', 'v9'],
  [12477, '21-v9-draw-rooms', 'v9 drawing: new rooms, club, tankstation, floors, glow, minimap', 'v9'],
  [13122, '22-v9-snake-ai', 'v9: how the new snakes behave', 'v9'],
  [13430, '23-v9-bosses', 'v9 bosses: DJ Manu-Beau, Lijn 34, De Tellie, De Kantonrechter', 'v9'],
  [13950, '24-v9-rooms', 'v9 rooms: tankstation, kapsalon, courtroom, second story floors', 'v9'],
  [14258, '25-v9-powerups', 'v9: what the new powerups, curses and downgrades do', 'v9'],
  [14695, '26-v9-story2', 'v9: the second story, ONDER CURATELE (script)', 'v9'],
  [14917, '27-v9-story2-cast', 'v9: the second story cast and scenes', 'v9'],
  [15338, '28-v9-screens', 'v9 screens: story list, tankstation till, choices', 'v9'],
  [15637, '29-v91-chaos', 'v9.1: Extreme Chaos and a meaner Coalition', 'v9.1'],
  [15774, '30-v91-texts', 'v9.1: Texts, every name and line in one editable texts file', 'v9.1'],
  [16934, '31-v10-hospital', 'v10: the clown hospital, rage worms', 'v10'],
  [17020, '32-clash', 'clash rules (v13 tags)', 'v10, v13'],
  [17765, '33-v10-snakes', 'v10 snakes: clowns and others', 'v10'],
  [18326, '34-v10-draw-snakes', 'v10: drawing the new snakes', 'v10'],
  [18520, '35-v10-bosses', 'v10 bosses: Demo-TV, Kampioen, Grote Peuk and more', 'v10'],
  [19032, '36-v10-draw-bosses', 'v10: drawing the bosses', 'v10'],
  [19283, '37-v10-floors', 'v10 floors: Megastore, Arena, Rookruimte, Metro', 'v10'],
  [19524, '38-v10-draw-floors', 'v10: drawing the new floors, walls, rocks and pots', 'v10'],
  [19848, '39-v10-rooms', 'v10 rooms: Clini-Clown HQ, quiet room, Kelderspook', 'v10'],
  [20465, '40-v10-draw-rooms', 'v10: drawing the rooms and their hazards', 'v10'],
  [20788, '41-v10-apploa', 'v10: Apploa Vogels', 'v10'],
  [21048, '42-v10-powerup-rules', 'v10: the small rules that go with the new powerups', 'v10'],
  [21152, '43-v10-icons', 'v10 icons: powerups, downgrades, curses', 'v10'],
  [21357, '44-v10-sounds-achs', 'v10: sounds, achievements, achievements page', 'v10'],
  [21683, '45-v116-lucifappel', 'v11.6: Lucifappel', 'v11.6'],
  [21909, '46-v122-lucky', 'v12.2: Lucky', 'v12.2'],
  [22119, '47-v101-haadee', 'v10.1: DagelijksHaaDee', 'v10.1'],
  [22224, '48-v103-remix', 'v10.3: Rotten Waltz remix as a living arrangement', 'v10.3'],
  [22312, '49-v104-death-remix', 'v10.4: the death remix (synthesized)', 'v10.4'],
  [22410, '50-v105-soundtracks', 'v10.5: Soundtracks tab', 'v10.5'],
  [22488, '51-v107-wals', 'v10.7: noodles, De Wals (and its MP3 track), big screen HUD, settings', 'v10.7'],
  [23184, '52-v1010-powerups', 'v10.10: 16 powerups, 5 curses, 4 downgrades', 'v10.10'],
  [23908, '53-v1011-howto', 'v10.11: How to play, one header, one row of tabs', 'v10.11'],
  [24156, '54-v1012-snake-bg', 'v10.12: snake picture backgrounds', 'v10.12'],
  [24221, '55-v1013-music-tab', 'v10.13: the Music tab', 'v10.13'],
  [24589, '56-v1015-basics', 'v10.15: Basics, character frames, achievements page', 'v10.15'],
  [25389, '57-v1016-chips', 'v10.16: square filter chips', 'v10.16'],
  [25409, '58-v1020-menu', 'v10.20: start menu, dropdowns, pick your apple', 'v10.20'],
  [26054, '59-v1021-powerups', 'v10.21: powerups, legendaries, locked powerups, curses, downgrades, pumps', 'v10.21'],
  [26949, '60-v1024-rotting', 'v10.24: Rotting', 'v10.24'],
  [27099, '61-v110-contracts', 'v11.0: Contracten (De Makelaar)', 'v11.0'],
  [27901, '62-v111-skins', 'v11.1 to v13.6: skins, wardrobe, Epic, Grotesque, Arcade (SKINS24)', 'v11.1, v12.2, v13.2, v13.4, v13.5, v13.6'],
  [31014, '63-v112-bloom', 'v11.2: bloom, light, grain, grade', 'v11.2'],
  [31233, '64-v113-admin', 'v11.3: admin panel, locked powerups', 'v11.3'],
  [31508, '65-v114-cards', 'v11.4: pause, game over and escape screens as cards, party menu', 'v11.4'],
  [31739, '66-v118-gym', 'v11.8: Klokhuis Gym', 'v11.8'],
  [32408, '67-v119-admin-rooms', 'v11.9: admin room tools', 'v11.9'],
  [32640, '68-v1111-watermelon', 'v11.11: Watermelon', 'v11.11'],
  [32822, '69-v1112-mud', 'v11.12: Mud', 'v11.12'],
  [32955, '70-v120-settings', 'v12.0: settings in tabs, description style, merge fixes', 'v12.0'],
  [33521, '71-v121-tygo', 'v12.1: Ty-Go!', 'v12.1'],
  [33641, '72-v127-wereldmachten', 'v12.7: Wereldmachten', 'v12.7'],
  [34079, '73-v128-zeldzaam', 'v12.8: Zeldzame Vijf', 'v12.8'],
  [34366, '74-v123-mapmaker', 'v12.3 to v12.6: Map Maker', 'v12.3 to v12.6'],
  [39287, '75-v13-clash-guide', 'v13: clash tags in the guide, texts file and test hooks', 'v13.0'],
  [39449, '76-v133-autoaim', 'v13.3: auto aim', 'v13.3'],
  [39561, '77-v137-chars-tab', 'v13.7: Characters tab', 'v13.7'],
];

fs.mkdirSync(path.join(root, 'src'), { recursive: true });
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
let total = 0;
for (let k = 0; k < PARTS.length; k++) {
  const [start, name, what, ver] = PARTS[k];
  const end = k + 1 < PARTS.length ? PARTS[k + 1][0] - 1 : js.length;
  let lines = js.slice(start - 1, end);
  total += lines.length;
  // T7: the base64 MP3 leaves the source
  lines = lines.map((s) => {
    const m = s.match(/^(\s*)const WALS_MP3 = '([A-Za-z0-9+/=]+)';\s*$/);
    if (!m) return s;
    fs.writeFileSync(path.join(root, 'assets/wals.mp3'), Buffer.from(m[2], 'base64'));
    return m[1] + "const WALS_MP3 = 'assets/wals.mp3';            /* T7: was 2.86 MB of base64, now a file fetched on demand */";
  });
  const head = `/* src/${name}.js: ${what}. From ${ver}. Lines ${start} to ${end} of the v13.7 script. */\n`;
  fs.writeFileSync(path.join(root, 'src', name + '.js'), head + lines.join('\n') + '\n');
}
if (total !== js.length) throw new Error('split lost lines: ' + total + ' vs ' + js.length);

// pieces for index.html
const pieces = {
  comments: L.slice(1, L.findIndex((s) => s.startsWith('<link rel="preconnect"'))).join('\n'),
  style: L.slice(L.indexOf('<style>'), L.indexOf('</style>') + 1).join('\n'),
  markup: L.slice(L.indexOf('</style>') + 1, iScript).join('\n'),
};
fs.writeFileSync(path.join(root, 'tools/.pieces.json'), JSON.stringify(pieces));
console.log('parts', PARTS.length, 'lines', total);
