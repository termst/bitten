/* 62.js section 04: catalogue. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { drawAfter27, drawApploaOranje24, drawBlauw27, drawBomb27, drawCandy27, drawCapy26, drawClock26, drawDelta27, drawFenix26, drawFenixWings26, drawGranny24, drawGroen27, drawGullWingsOranje24, drawIce27, drawKermis26, drawKlomp27, drawKroket27, drawMikaDelft24, drawMirror27, drawMould24, drawOranje27, drawPaars27, drawPeanTri24, drawPluis27, drawRage27, drawRave26, drawStar27, drawStatic27, drawStreamer24, drawSun26, drawWafel26, drawZomer24, wingsDelta27, wingsStar27 } = S62;
  /* ------------------------------------------------------------------ the catalogue */
  const SKINS1 = {
    apple: { name: 'Granny Smith', line: 'Green, sour, and has seen worse. Knits between rooms.', draw: drawGranny24,
      bg: ['#24301a', '#0e140a'], motif: 'knit', acc: '#8cc63f' },
    appel: { name: 'Streamer Setup', line: 'Live at all hours. Headset on, mullet dyed, chat says hi.', draw: drawStreamer24,
      bg: ['#2a1240', '#0a0614'], motif: 'rgb', acc: '#ff5aa8' },
    rot: { name: 'Schimmelkoning', line: 'Further gone than ever. The mushrooms elected him.', draw: drawMould24,
      bg: ['#1e2214', '#090a06'], motif: 'spores', acc: '#c8d8e0' },
    krul: { name: 'Zomerkrul', line: 'Back from Texel with a shirt nobody asked for.', draw: drawZomer24,
      bg: ['#ff9a5a', '#3a1a40'], motif: 'beach', acc: '#ffcf4a' },
    mika: { name: 'Delfts Blauw', line: 'Hand painted, glazed twice. Do not drop him.', draw: (c, R, st) => drawMikaDelft24(c, R, st),
      bg: ['#e9edf5', '#b8c4dc'], motif: 'tiles', acc: '#1d3f9a', light: true },
    pean: { name: 'Driekleur', line: 'Abyssinian coat. Three colours, rosettes everywhere. Still scared.', draw: (c, R, st) => drawPeanTri24(c, R, st),
      bg: ['#3a3018', '#14100a'], motif: 'hay', acc: '#d9822e' },
    apploa: { name: 'Koningsdag', line: 'Orange hair, a flag on each cheek, wings dipped in paint. Back home by Tuesday.', draw: (c, R, st) => drawApploaOranje24(c, R, st),
      bg: ['#ff8a1e', '#5a1e06'], motif: 'bunting', acc: '#ff7a12', wings: drawGullWingsOranje24 },
  };
  // v11.6: every apple holds a list of skins; index 0 is the original look
  const SKINS = {}; S62.SKINS = SKINS;
  for (const id in SKINS1) SKINS[id] = [SKINS1[id]];
  const MORE26 = {
    apple: { name: 'Kermisappel', line: 'Dipped in toffee, rolled in hagelslag, stuck on a stick. The fair left years ago.', draw: drawKermis26,
      bg: ['#5a1418', '#1a0606'], motif: 'fair', acc: '#ff9a3a' },
    appel: { name: 'Capybara', line: 'A capybara onesie and a yuzu on top. Nothing bothers him. Not even this.', draw: drawCapy26,
      bg: ['#3a5a2a', '#101a0a'], motif: 'yuzu', acc: '#ffb43a' },
    rot: { name: 'Zonnebloem', line: 'Something grew out of the compost. Sunflower on the outside, rotten on the inside.', draw: drawSun26,
      bg: ['#3a4a6a', '#141a24'], motif: 'petals', acc: '#ffd23a' },
    krul: { name: 'Stroopkrul', line: 'Two thin waffles, syrup in the middle, curls on top. Best warm, on a cup of tea.', draw: drawWafel26,
      bg: ['#5a3010', '#1a0c04'], motif: 'waffle', acc: '#e8a040' },
    mika: { name: 'Klokwerk', line: 'A pocket watch that runs a quarter slow. Same face as always.', draw: drawClock26,
      bg: ['#1a1e2a', '#08090e'], motif: 'cogs', acc: '#e8c45a' },
    pean: { name: 'Rave Cavia', line: 'Shades, glow sticks, a headband that blinks. Still scared, now in neon.', draw: drawRave26,
      bg: ['#1a0a2a', '#05020a'], motif: 'lasers', acc: '#ff3ad8' },
    apploa: { name: 'Feniks', line: 'Hair on fire, wings on fire. Came back from the ashes once already.', draw: drawFenix26,
      bg: ['#5a1606', '#140402'], motif: 'embers', acc: '#ff6a1a', wings: drawFenixWings26 },
    lucif: { name: 'Lucifer', line: 'Swept gold horns, bat wings, a spade tail and a trident of three lit matches. He is printed on every box. Nobody ever asked him to leave.', draw: (function () { return S62.drawLucifer134.apply(this, arguments); }),
      bg: ['#2a0606', '#0a0202'], motif: 'hellbox', acc: '#e2b04e' },
  };
  for (const id in MORE26) (SKINS[id] || (SKINS[id] = [])).push(MORE26[id]);
  const MORE27 = {
    apple: [
      { name: 'Oranje Rups', line: 'Campaigning for the orange party. Rosette, sash, a flag in the stem. Promises nothing, delivers less.', draw: drawOranje27, bg: ['#ff8a1e', '#5a1e06'], motif: 'confetti', mcol: ['#e8742a', '#ffffff', '#ffd23a'], acc: '#e8742a' },
      { name: 'Spiegelbol', line: 'Mirror Core, all over. Every tile throws the light back. Disco never died down here.', draw: drawMirror27, bg: ['#1a1030', '#06040c'], motif: 'lasers', acc: '#c9d4ff' },
    ],
    appel: [
      { name: 'Paarse Pluis', line: 'A ball of purple scribbles with two lights for eyes. Nobody knows what is under there. Neither does he.', draw: drawPluis27, bg: ['#1a0624', '#000000'], motif: 'fuzz', acc: '#d27bff' },
      { name: 'Blauw Boven', line: 'Navy suit, gold tie, blue rosette. The mullet stays. On the list, number two.', draw: drawBlauw27, bg: ['#2a6ad8', '#0a1a4a'], motif: 'confetti', mcol: ['#2a6ad8', '#ffffff', '#ffd23a'], acc: '#4a8aff' },
    ],
    rot: [
      { name: 'Groen Grondje', line: 'Runs for the green party. Sprouts in the soil, a rosette on the chest. Still rotten, now sustainably.', draw: drawGroen27, bg: ['#2a5a1a', '#0a1a06'], motif: 'confetti', mcol: ['#3aa84a', '#ffffff', '#a8e078'], acc: '#3aa84a' },
      { name: 'Kortsluiting', line: 'Static Pips went in, hair went up. Blue, crackling, slightly smoking.', draw: drawStatic27, bg: ['#0a1430', '#02040c'], motif: 'spark', acc: '#9fd8ff' },
    ],
    krul: [
      { name: 'Snoepjas', line: 'A hard candy shell that changes color every few seconds. Crunchy outside, laughing inside.', draw: drawCandy27, bg: ['#3a1040', '#10040e'], motif: 'confetti', mcol: ['#e8203a', '#1a5ad8', '#2aa83a', '#f2b81e'], acc: '#ff5a8a' },
      { name: 'Kroket', line: 'Breaded, deep fried, steaming, mustard on the side. From the wall, 2 euro 50.', draw: drawKroket27, bg: ['#5a3a10', '#1a0e04'], motif: 'crumbs', acc: '#e8a040' },
    ],
    mika: [
      { name: 'IJsblok', line: 'Frost Pips, taken too far. Frozen in a block with icicles. Same face, colder.', draw: drawIce27, bg: ['#cfe8f8', '#7aaed8'], motif: 'flakes', acc: '#2a6a9a', light: true },
      { name: 'Wormen Eerst', line: 'Purple, with a worm in a party hat on his shoulder. Worms first. He agreed without a face.', draw: drawPaars27, bg: ['#3a1060', '#0e0420'], motif: 'confetti', mcol: ['#8a3ad8', '#ffffff', '#e9899a'], acc: '#b06aff' },
    ],
    pean: [
      { name: 'Woedeaanval', line: 'The rage curse. Red all over, steam out of both ears, shirt torn. Still scared, now loudly.', draw: drawRage27, bg: ['#5a0806', '#140202'], motif: 'embers', acc: '#ff3a2a' },
      { name: 'Klompen', line: 'Lace cap, coral beads, a tulip and wooden shoes. Ready for the tourists. Hates the tourists.', draw: drawKlomp27, bg: ['#e9edf5', '#b8c4dc'], motif: 'tiles', acc: '#c3243a', light: true },
    ],
    apploa: [
      { name: 'Sterinsigne', line: 'Purple wings with gold tips, purple hair, a star badge on the chest. Ranked. Nobody said in what.', draw: drawStar27, bg: ['#2a0a40', '#08020e'], motif: 'stars', acc: '#e2b04e', wings: wingsStar27 },
      { name: 'Deltaplan', line: 'Goggles up, water inside, wings the color of a dike in the rain. Keeps her head above it.', draw: drawDelta27, bg: ['#1a4a7a', '#06142a'], motif: 'waves', acc: '#7ac8ff', wings: wingsDelta27 },
    ],
    lucif: [
      { name: 'Kort Lontje', line: 'Short Fuse in apple form. Black, round, a fuse that burns down and starts over. Does not take jokes.', draw: drawBomb27, bg: ['#2a1a10', '#080402'], motif: 'embers', acc: '#ffb44a' },
      { name: 'Afterparty', line: 'Back from the Hellclub. Headphones, shades, neon under the box. Still lit.', draw: drawAfter27, bg: ['#1a0420', '#05010a'], motif: 'lasers', acc: '#ff3ad8' },
    ],
  };
  for (const id in MORE27) for (const S of MORE27[id]) (SKINS[id] || (SKINS[id] = [])).push(S);
})(window.__bitten.S62 || (window.__bitten.S62 = {}));
