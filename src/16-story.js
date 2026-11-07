/* src/16-story.js: story mode: Jensbabba, the lockdown and the worms. From v8. Lines 9047 to 9764 of the v13.7 script. */
/* =====================================================================
   Story mode: Jensbabba, the lockdown, and the worms
   ===================================================================== */
const STORY_LEVEL_OVERRIDES = [
  {
    name: 'Under the Sink', sub: 'Operation Appelmoes. Name by Jensbabba.', checker: true,
    floor: '#3a3832', floor2: '#201e1b', grout: '#141311', wall: '#4b5550', wallHi: '#6f7b74', wallLo: '#232927', void: '#0a0b0a',
    rock: '#e9e4d8', rockHi: '#ffffff', rockLo: '#9e978a', rockStyle: 'tp', deco: 'kitchen', decoCol: '#c9a46a', dirt: '#4a4236',
  },
  {
    name: 'The Wormwide Web', sub: 'World wide web. World wide WORM. Think about it.',
    floor: '#161d2c', floor2: '#1a2235', grout: '#0a0e17', wall: '#1d2739', wallHi: '#32456a', wallLo: '#0b1019', void: '#06080d',
    rock: '#5d6170', rockHi: '#8a8fa0', rockLo: '#2a2d36', rockStyle: 'monitor', deco: 'cables', decoCol: '#3a8a5a', dirt: '#30384a',
  },
  {
    name: "Big Worm's Garden", sub: 'The most outside anyone has been in 47 days.',
    floor: '#25301c', floor2: '#2a3620', grout: '#121808', wall: '#3a2f24', wallHi: '#5a4a38', wallLo: '#1a140e', void: '#070906',
    rock: '#5b5a4c', rockHi: '#7d7c69', rockLo: '#2d2c22', deco: 'garden', decoCol: '#4a2a1a', dirt: '#3d3220',
  },
];
// the story keeps its own three chapters: the cellar, the halls and the garden
const STORY_LEVELS = [
  Object.assign({}, LEVELS[0], STORY_LEVEL_OVERRIDES[0], { tier: 0 }),
  Object.assign({}, LEVELS[1], STORY_LEVEL_OVERRIDES[1], { tier: 1, rooms: 9, venomSpeed: 158, hpMult: 1.25, portal: true }),
  Object.assign({}, LEVELS[4], STORY_LEVEL_OVERRIDES[2], { tier: 2, rooms: 10, venomSpeed: 172, hpMult: 1.5, portal: true }),
];
const STORY_BOSS = {
  mother: { title: 'Madame Larva', sub: 'Minister of Grubs. Probably.', name: 'MADAME LARVA' },
  queen: { title: 'The Algorithm', sub: 'She decides what you see on your feed.', name: 'THE ALGORITHM' },
  ouro: { title: 'BIG WORM', sub: 'No beginning and no end. Like this lockdown.', name: 'BIG WORM' },
};

/* ---- the script. jens = Jensbabba, apple = you, cap = narration ---- */
const J = (face, text, extra) => Object.assign({ who: 'jens', face, text }, extra || {});
const CAP = (text, extra) => Object.assign({ who: 'cap', text }, extra || {});
const ME = (text, extra) => Object.assign({ who: 'apple', text }, extra || {});
const SCRIPT = {
  intro: [
    CAP('AMSTERDAM. DAY 47 OF THE LOCKDOWN.', { bg: 'kitchen', v: 'night' }),
    CAP('The fruit bowl is empty. Except for you. One apple. Slightly scared.'),
    J('normal', 'ok ok ok. three more articles and then i sleep'),
    CAP('He has read this next post 31 times.', { post: { name: 'WormWaarheid', handle: '@wormwaarheid', text: 'BREAKING: who BENEFITS when everybody stays inside?? not u. not me. THE WORMS. no humans outside = nobody steps on worms = WORM POPULATION EXPLODES. wake up sheep', likes: 4 } }),
    J('shout', 'IT ALL MAKES SENSE NOW!!!!'),
    J('whisper', 'the lockdown... is a WORM lockdown. they lock US down... so THEY can go UP'),
    J('proud', 'lockDOWN. wormsUP. wow. i have to post that'),
    J('proud', 'posted. the people need to know', { post: { jens: true, text: 'LOCKDOWN = WORMS GOING UP. think about it. i did. for 6 hours #STOPDELOCKDOWN #wormgate #wakkerworden', likes: 2, note: 'one of them is my mom' } }),
    CAP('He turns around. Slowly. He looks at the fruit bowl.'),
    J('whisper', 'appel. little buddy. little red soldier'),
    J('normal', 'everybody knows the natural enemy of the worm... is the apple'),
    ME('(that is literally the opposite of how it works)'),
    J('normal', 'the worm HQ is down the drain. i saw a video. 14 minutes. no sources. didnt need them'),
    J('shout', 'GO APPEL. KILL THE WORMS. STOP DE LOCKDOWN!!!', { bg: 'drain' }),
    CAP('He drops you in the sink. The drain goes down a lot further than a drain should.'),
  ],
  end0: [
    CAP('Madame Larva is dead. Probably. It is hard to tell with grubs.', { bg: 'drain' }),
    J('shout', 'APPEL!! U OK?? i heard a squish'),
    J('proud', 'i posted a pic of the drain. SIX likes. the movement is growing'),
    CAP('(Did you eat today? Why is there an apple in the sink? Jens?)', { phone: { from: 'Mama', msgs: ['Jens heb je vandaag gegeten?', 'Jens waarom ligt er een appel in de gootsteen', 'Jens?'] } }),
    J('whisper', 'mom is not ready for the truth'),
    J('whisper', 'listen. the worms are not only in the ground. they are in the INTERNET', { bg: 'kitchen', v: 'night' }),
    J('shout', 'why do u think its called the world wide WEB. world wide... WORM'),
    ME('(it is not)'),
    J('proud', 'ok then why are cables long and thin. CHECKMATE'),
    CAP('He unplugs the router and pushes you into the cable hole behind the fridge.'),
  ],
  end1: [
    CAP('The Algorithm goes offline. Somewhere, a feed shows something normal for once.', { bg: 'kitchen', v: 'night' }),
    J('shout', 'MY POST GOT 41 LIKES!!! they cant suppress me anymore!!!'),
    CAP('(Jens, it is 3 at night. I can hear you through the wall.)', { post: { jens: true, text: 'apple update: 2 worm bosses down. 1 to go. if u see this post it is NOT a coincidence #STOPDELOCKDOWN #appelleger', likes: 41, reply: { name: 'Ans (neighbour)', text: 'Jens het is 3 uur s nachts. Ik hoor je door de muur.' } } }),
    J('shout', 'ANS IS A WORM'),
    J('whisper', 'one left. the BIG WORM. the one that started it all. it lives under the garden of this building'),
    J('normal', 'it eats its own tail. like the lockdown. every press conference: three more weeks. THREE MORE WEEKS'),
    J('cry', 'appel... if u dont come back... i will name my sourdough starter after u'),
    CAP('He throws you off the balcony into the shared garden. The most outside either of you has been in 47 days.', { bg: 'garden', v: 'night' }),
  ],
  ending: [
    CAP('BIG WORM falls apart. The garden goes quiet. The sun comes up.', { bg: 'garden', v: 'dawn' }),
    CAP('Somewhere, a press conference ends.', { bg: 'kitchen', v: 'day', tv: { head: 'LOCKDOWN EASED', text: 'Shops reopen next week', tick: 'experts point to falling numbers   ·   experts point to falling numbers   ·   experts point to falling numbers' } }),
    J('shout', 'FALLING NUMBERS?? FALLING WORMS!!! IT WAS US APPEL. IT WAS US!!!'),
    J('proud', 'posted', { post: { jens: true, text: 'the lockdown is over. ur welcome. i will not explain #STOPDELOCKDOWN #WEDIDIT #appel', likes: 3, note: 'mom, Ans, and a bot' } }),
    J('proud', 'appel. u are a hero. u get a frame. next to all my selfies'),
    CAP('He hangs your picture on the wall. Between 31 pictures of himself.'),
    J('normal', '...hey. why are bananas curved'),
    J('whisper', '...like a worm'),
    CAP('THE END?'),
  ],
};

const CHAT_LINES = {
  fightFirst: ['those r WORMS. shoot them with ur seeds or whatever apples do', 'careful these worms are very online. they spit like keyboard warriors', 'thats a LONG worm. longest i have seen. and i have seen a LOT (on youtube)'],
  fight: [
    ['more worms. they multiply when u dont post about them', 'i can see u on the baby monitor. its a baby monitor. dont ask', 'is that a snake? NO. a snake is just a worm with a PR team', 'worm count: too many. sleep count: 0'],
    ['report and block. by which i mean SHOOT', 'these worms have blue checkmarks. dont trust them', 'they are DMing each other. i can feel it', 'ratio them appel. RATIO THEM'],
    ['the garden smells like freedom. and soil. mostly soil', 'Ans is watching from her window. act natural', 'i havent been outside in 47 days. how is it. dont tell me', 'these are the elite worms. the ones with private gardens'],
  ],
  clear: ['W. huge W. posting this', 'room cleared. like my schedule. since march', 'another one. #STOPDELOCKDOWN', 'ok that was sick. my mom liked my last post btw', 'they never stood a chance. i did my research'],
  hurt: ['appel NO. i dont have another apple. the supermarket is a TRAP', 'dont let them bite u!! that is literally ur whole thing', 'ouch. i felt that in my tinfoil', 'BITE MARKS?? that is evidence. screenshot it'],
  item: ['woah. power up. like in the movies i watched 9 times this week', 'nice. the worms didnt see that coming. some of them dont have eyes. whatever', 'upgrade!! u are becoming the apple i always knew u could be'],
  secret: ['why does it smell like my fridge in there', 'rotten apples?? TRAITORS. they joined the worms'],
  rotHunt: ['it ate all the traitors. now it wants u. RUN appel'],
  boss: ['thats the MINISTER OF GRUBS. i KNEW it. she was on the news (she wasnt)', 'THE ALGORITHM. she is why my posts get 2 likes. END HER', 'BIG WORM. it eats its own tail. three more weeks. THREE MORE WEEKS'],
  bossDown: ['WE GOT HER. posting. no wait. posting AND screenshotting', 'the algorithm is DOWN. my feed is just cats now. beautiful', 'is it over? is it actually over?'],
  low: ['ur looking very eaten appel. find a slice or something', 'appel ur health is like my wifi. bad'],
  challenge: ['a red stone thing. touch it. what could go wrong. (everything)', 'this is a TEST room. the worms test u like the government tests the 5G', 'touch the rune appel. three waves. i believe in u. mostly'],
  offering: ['it wants a piece of u. thats how they get u. pay anyway its shiny', 'blood altar?? in MY kitchen?? ok but the item looks sick', 'nothing in life is free. except my posts. those are free. please read them'],
  goal: ['GOOOOAL. what a save. what a save. what a save', 'calculated', 'that worm just got demoed by a FRUIT'],
  tetra: ['that worm is made of BLOCKS. the government builds them in minecraft', 'BLOCK WORM. dont let the pieces land on u. i learned that on a gameboy'],
  rocket: ['a worm with a CAR. and a BALL. shoot the ball back into its face appel', 'boost worm. probably funded by big rubber. hit the ball back at it'],
  fuel: ['a worm that smells like the gas station. DONT touch it. trust me i touched one', 'FUEL WORM. thats why gas is so expensive. they DRINK it', 'it throws gas cans. this is literally my nightmare and also my uncle'],
  ender: ['a PORTAL. in my cellar. the worms have their own minecraft server', 'BLOCK DRAGON. it builds walls like my landlord. shoot the creepers before they hug u', 'it teleports!! thats how they always know where i am'],
  pantry: ['my emergency pantry!! i hoarded for this exact moment', 'eat. u look peeled'],
  dark: ['who turned off the lights. the worms. obviously the worms'],
  elite: ['that one is GOLD. gold worms are the rich worms. the 1 percent'],
};
const DEATH_LINES = ['noooo. ok. new plan. i will post about it', 'appel down. i repeat appel down. ordering a new one. no wait. supermarket is a trap', 'this is EXACTLY what the worms want. try again'];

/* ------------------------------------------------------------------ Jensbabba (an original cartoon) */
const JENS_SKIN = '#efcdb2', JENS_OUT = '#1d1612', JENS_HAIR = '#2a1b13';

// head only, origin at the head centre
function drawJensHead(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  const blink = opt.blink ? 0.08 : 1;
  // hair tufts sticking out behind
  c.fillStyle = JENS_HAIR;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 34, -38); c.lineTo(s * 62, -30); c.lineTo(s * 44, -18); c.lineTo(s * 64, -8); c.lineTo(s * 46, 2); c.lineTo(s * 58, 14); c.lineTo(s * 40, 10); c.closePath(); c.fill();
  }
  // ears
  for (const s of [-1, 1]) { ell(c, s * 47, 2, 9, 13); c.fillStyle = JENS_SKIN; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3; c.stroke(); }
  // face
  ell(c, 0, 0, 47, 55); c.fillStyle = JENS_SKIN; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3.2; c.stroke();
  c.fillStyle = 'rgba(230,110,100,0.32)'; ell(c, -27, 20, 11, 6); c.fill(); ell(c, 27, 20, 11, 6); c.fill();
  c.fillStyle = 'rgba(58,42,34,0.38)';
  for (let i = 0; i < 26; i++) { const a = 0.35 + (i / 26) * (Math.PI - 0.7); const r = 40 + (i % 3) * 4; circle(c, Math.cos(a) * r * 0.75, 18 + Math.sin(a) * r * 0.62, 1.1); }
  // fringe under the hat
  c.fillStyle = JENS_HAIR;
  c.beginPath(); c.moveTo(-46, -26);
  const fr = [[-38, -12], [-30, -24], [-20, -10], [-10, -22], [0, -9], [10, -22], [20, -11], [30, -24], [38, -12]];
  for (const [x, y] of fr) c.lineTo(x, y);
  c.lineTo(46, -26); c.lineTo(46, -34); c.lineTo(-46, -34); c.closePath(); c.fill();
  // eyes: wide, sleepless
  const look = opt.look || 0;
  for (const s of [-1, 1]) {
    const ex = s * 18, ey = -2;
    c.strokeStyle = 'rgba(110,70,110,0.55)'; c.lineWidth = 3; c.beginPath(); c.arc(ex, ey + 6, 13, 0.35, Math.PI - 0.35); c.stroke();
    if (face === 'proud') { c.strokeStyle = JENS_OUT; c.lineWidth = 3.5; c.beginPath(); c.arc(ex, ey + 4, 10, Math.PI + 0.4, -0.4); c.stroke(); continue; }
    const ry = (face === 'whisper' ? 7 : 12) * blink;
    ell(c, ex, ey, 13, ry); c.fillStyle = '#fbf7ef'; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 2.6; c.stroke();
    if (blink > 0.5) { c.fillStyle = '#1a0f0a'; circle(c, ex + look * 4, ey + (face === 'cry' ? 2 : 0), face === 'shout' ? 2.4 : 3.3); }
  }
  // unibrow
  c.strokeStyle = JENS_HAIR; c.lineWidth = 7;
  c.beginPath();
  if (face === 'shout') { c.moveTo(-34, -28); c.lineTo(-4, -16); c.lineTo(4, -16); c.lineTo(34, -28); }
  else if (face === 'cry') { c.moveTo(-34, -15); c.lineTo(-4, -28); c.lineTo(4, -28); c.lineTo(34, -15); }
  else if (face === 'whisper') { c.moveTo(-32, -17); c.quadraticCurveTo(0, -12, 32, -17); }
  else if (face === 'proud') { c.moveTo(-34, -22); c.quadraticCurveTo(-18, -32, -3, -24); c.moveTo(3, -24); c.quadraticCurveTo(18, -32, 34, -22); }
  else { c.moveTo(-34, -20); c.quadraticCurveTo(-18, -27, -4, -21); c.quadraticCurveTo(0, -19, 4, -21); c.quadraticCurveTo(18, -27, 34, -20); }
  c.stroke();
  // nose
  c.strokeStyle = 'rgba(120,70,50,0.7)'; c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(-2, 6); c.quadraticCurveTo(-8, 18, 0, 20); c.quadraticCurveTo(5, 21, 7, 17); c.stroke();
  // mouth
  const talk = opt.talk ? (Math.sin(t * 22) > 0 ? 1 : 0.35) : 0;
  c.strokeStyle = JENS_OUT; c.lineWidth = 3.4;
  if (face === 'shout') {
    const h = 13 + talk * 4;
    ell(c, 0, 33, 17, h); c.fillStyle = '#3a0d10'; c.fill(); c.stroke();
    c.save(); ell(c, 0, 33, 17, h); c.clip();
    c.fillStyle = '#f6f1e6'; c.fillRect(-17, 33 - h, 34, 6);
    c.fillStyle = '#d4505c'; ell(c, 0, 33 + h * 0.7, 10, 6); c.fill();
    c.restore();
  } else if (face === 'whisper') {
    ell(c, 4, 32, 5 + talk * 2, 4 + talk * 2); c.fillStyle = '#3a0d10'; c.fill(); c.stroke();
  } else if (face === 'cry') {
    c.beginPath(); c.moveTo(-15, 37); c.quadraticCurveTo(-8, 28, 0, 33); c.quadraticCurveTo(8, 28, 15, 37); c.stroke();
  } else if (face === 'proud') {
    c.beginPath(); c.moveTo(-20, 26); c.quadraticCurveTo(0, 46 + talk * 4, 20, 26); c.closePath(); c.fillStyle = '#3a0d10'; c.fill(); c.stroke();
    c.save(); c.beginPath(); c.moveTo(-20, 26); c.quadraticCurveTo(0, 46, 20, 26); c.closePath(); c.clip(); c.fillStyle = '#f6f1e6'; c.fillRect(-20, 26, 40, 6); c.restore();
  } else if (talk > 0.5) {
    ell(c, 2, 32, 10, 7); c.fillStyle = '#3a0d10'; c.fill(); c.stroke();
  } else {
    c.beginPath(); c.moveTo(-14, 31); c.quadraticCurveTo(2, 38, 17, 27); c.stroke();
  }
  // extras
  if (face === 'cry') {
    c.fillStyle = 'rgba(120,190,240,0.85)';
    for (const s of [-1, 1]) { const ph = (t * 1.3 + (s > 0 ? 0.5 : 0)) % 1; rrect(c, s * 18 - 2.5, 6, 5, 10 + ph * 30, 2.5); c.fill(); }
  }
  if (face === 'shout') {
    c.strokeStyle = '#c3243a'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(22, -40); c.lineTo(26, -46); c.lineTo(30, -40); c.lineTo(34, -46); c.stroke();
    c.fillStyle = 'rgba(150,210,245,0.9)'; c.beginPath(); c.moveTo(-44, -30); c.quadraticCurveTo(-50, -18, -44, -14); c.quadraticCurveTo(-38, -18, -44, -30); c.fill();
  }
  // tinfoil hat with a paperclip antenna
  const g = c.createLinearGradient(-50, -60, 40, -120);
  g.addColorStop(0, '#9aa1ab'); g.addColorStop(0.45, '#f3f6fa'); g.addColorStop(1, '#8c939e');
  c.beginPath(); c.moveTo(-58, -26); c.lineTo(-34, -74); c.lineTo(-4, -124); c.lineTo(10, -118); c.lineTo(34, -76); c.lineTo(58, -26);
  c.quadraticCurveTo(0, -42, -58, -26); c.closePath();
  c.fillStyle = g; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3; c.stroke();
  c.strokeStyle = 'rgba(80,88,100,0.55)'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-30, -40); c.lineTo(-14, -70); c.lineTo(-20, -90); c.moveTo(6, -44); c.lineTo(14, -80); c.lineTo(4, -104); c.moveTo(30, -44); c.lineTo(22, -62); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-24, -52); c.lineTo(-8, -96); c.stroke();
  c.beginPath(); c.moveTo(-58, -26); c.quadraticCurveTo(-30, -20, -14, -30); c.quadraticCurveTo(6, -24, 26, -32); c.quadraticCurveTo(44, -24, 58, -26);
  c.strokeStyle = '#7d848f'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = '#b7bcc4'; c.lineWidth = 2.4;
  c.beginPath(); c.moveTo(3, -121); c.lineTo(5, -146); c.quadraticCurveTo(6, -152, 11, -150); c.lineTo(10, -132); c.stroke();
  c.fillStyle = '#c3243a'; circle(c, 6, -150, 3.5);
  c.restore();
}

// full bust, origin at the base of the neck
function drawJens(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  ell(c, 0, -4, 76, 26); c.fillStyle = '#5c5f68'; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.moveTo(-58, -6); c.bezierCurveTo(-95, 0, -118, 18, -124, 60); c.lineTo(-134, 230); c.lineTo(134, 230); c.lineTo(124, 60); c.bezierCurveTo(118, 18, 95, 0, 58, -6); c.closePath();
  const g = c.createLinearGradient(0, -6, 0, 230); g.addColorStop(0, '#8d9099'); g.addColorStop(1, '#666972');
  c.fillStyle = g; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3.2; c.stroke();
  c.beginPath(); c.moveTo(-40, -8); c.quadraticCurveTo(0, 30, 40, -8); c.closePath(); c.fillStyle = '#4b4e56'; c.fill();
  c.strokeStyle = '#e8e4da'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-16, 14); c.lineTo(-21, 70); c.moveTo(16, 14); c.lineTo(22, 72); c.stroke();
  c.fillStyle = '#b9b3a6'; c.fillRect(-24, 68, 6, 9); c.fillRect(19, 70, 6, 9);
  c.fillStyle = '#f4f1ea'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = '700 34px "Barlow Condensed", "Arial Narrow", sans-serif'; c.fillText('STOP', 0, 118);
  c.font = '700 20px "Barlow Condensed", "Arial Narrow", sans-serif'; c.fillText('DE', 0, 140);
  c.font = '700 30px "Barlow Condensed", "Arial Narrow", sans-serif'; c.fillText('LOCKDOWN', 0, 170);
  c.strokeStyle = '#55585f'; c.lineWidth = 2; c.beginPath(); c.moveTo(-60, 205); c.quadraticCurveTo(0, 196, 60, 205); c.stroke();
  c.fillStyle = JENS_SKIN; c.fillRect(-20, -38, 40, 40); c.strokeStyle = JENS_OUT; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -38); c.lineTo(-20, 0); c.moveTo(20, -38); c.lineTo(20, 0); c.stroke();
  c.strokeStyle = '#e6f2f8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-34, -8); c.lineTo(-46, -80); c.moveTo(34, -8); c.lineTo(46, -80); c.stroke();
  rrect(c, -36, -18, 72, 24, 9); c.fillStyle = '#a7d4ea'; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 2; c.stroke();
  c.strokeStyle = 'rgba(60,110,140,0.5)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-30, -10); c.lineTo(30, -10); c.moveTo(-30, -3); c.lineTo(30, -3); c.stroke();
  c.restore();
  c.save(); c.translate(0, -84 * S);
  drawJensHead(c, S, face, t, opt);
  c.restore();
}

function drawJensMini(c, x, y, s) {
  c.save(); c.translate(x, y);
  drawJensHead(c, s, 'normal', 0, {});
  c.restore();
}

/* ------------------------------------------------------------------ cutscene backgrounds (design space 600 x 400) */
function drawPoster(c, x, y, w, h, rot) {
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-w / 2 + 4, -h / 2 + 5, w, h);
  c.fillStyle = '#121212'; c.fillRect(-w / 2, -h / 2, w, h);
  c.fillStyle = '#f2efe8'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${h * 0.3}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.fillText('STOP', 0, -h * 0.24);
  c.font = `700 ${h * 0.17}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.fillText('DE', 0, h * 0.02);
  c.font = `700 ${h * 0.25}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.fillText('LOCKDOWN', 0, h * 0.26);
  c.fillStyle = 'rgba(240,230,180,0.7)';
  for (const [tx, ty] of [[-1, -1], [1, -1]]) { c.save(); c.translate(tx * w / 2, ty * h / 2); c.rotate(tx * 0.6); c.fillRect(-9, -4, 18, 8); c.restore(); }
  c.restore();
}
function drawSelfie(c, x, y, w, h, rot, face, apple) {
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
  c.fillStyle = '#4a3322'; c.fillRect(-w / 2, -h / 2, w, h);
  c.fillStyle = apple ? '#f0d9a8' : '#9fc2dc'; c.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  c.save(); c.beginPath(); c.rect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8); c.clip();
  if (apple) {
    applePath(c, h * 0.26); c.fillStyle = '#d92a40'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = '#e3a54a'; c.font = `700 ${h * 0.12}px "Barlow Condensed", sans-serif`; c.textAlign = 'center'; c.fillText('HERO', 0, h * 0.4);
  } else { c.translate(0, h * 0.16); drawJensHead(c, h * 0.0044, face || 'proud', 0, {}); }
  c.restore();
  c.restore();
}
function drawBoard(c, x, y, w, h) {
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 4, y + 5, w, h);
  c.fillStyle = '#6b4a2e'; c.fillRect(x, y, w, h);
  c.fillStyle = '#a07a4e'; c.fillRect(x + 5, y + 5, w - 10, h - 10);
  const pins = [[0.25, 0.2], [0.72, 0.18], [0.5, 0.5], [0.22, 0.78], [0.76, 0.75]];
  c.strokeStyle = '#c3243a'; c.lineWidth = 1.6;
  c.beginPath();
  for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) if ((i + j) % 2 === 0 || j === i + 1) { c.moveTo(x + pins[i][0] * w, y + pins[i][1] * h); c.lineTo(x + pins[j][0] * w, y + pins[j][1] * h); }
  c.stroke();
  const notes = ['WORMS', 'WHY LONG', 'THEY KNOW', '???', 'ANS'];
  pins.forEach(([px, py], i) => {
    const nx = x + px * w, ny = y + py * h;
    c.fillStyle = i % 2 ? '#f6e27a' : '#f4f1ea'; c.fillRect(nx - 14, ny - 9, 28, 18);
    c.fillStyle = '#1b1b1b'; c.font = '700 7px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(notes[i], nx, ny + 1);
    c.fillStyle = '#c3243a'; circle(c, nx, ny - 9, 2.2);
  });
}
function drawTPStack(c, x, y, s) {
  const rolls = [[-1, 0], [0, 0], [1, 0], [-0.5, -1], [0.5, -1], [0, -2]];
  for (const [rx, ry] of rolls) {
    const cx = x + rx * 22 * s, cy = y + ry * 19 * s;
    rrect(c, cx - 11 * s, cy - 10 * s, 22 * s, 19 * s, 3 * s); c.fillStyle = '#f2efe8'; c.fill(); c.strokeStyle = '#8f897c'; c.lineWidth = 1.2; c.stroke();
    ell(c, cx, cy - 1 * s, 4 * s, 4 * s); c.fillStyle = '#c8a97a'; c.fill();
  }
}
function drawKitchenScene(c, v, t, st) {
  const day = v === 'day';
  // window
  const wx = 452, wy = 34, ww = 120, wh = 118;
  c.fillStyle = '#2b2620'; c.fillRect(wx - 6, wy - 6, ww + 12, wh + 12);
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  if (day) { sky.addColorStop(0, '#9cc9ec'); sky.addColorStop(1, '#f4e3bf'); }
  else { sky.addColorStop(0, '#0d1428'); sky.addColorStop(1, '#22304e'); }
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  if (day) { c.fillStyle = '#fff1c2'; circle(c, wx + 88, wy + 30, 13); }
  else { c.fillStyle = '#f0ead6'; circle(c, wx + 90, wy + 26, 10); c.fillStyle = '#22304e'; circle(c, wx + 95, wy + 22, 9); }
  c.fillStyle = day ? '#6f6a63' : '#0a0d16';
  const roofs = [[0, 70], [22, 56], [40, 76], [62, 50], [84, 68], [104, 58]];
  c.beginPath(); c.moveTo(wx, wy + wh);
  for (const [rx, ry] of roofs) { c.lineTo(wx + rx, wy + ry); c.lineTo(wx + rx + 20, wy + ry); }
  c.lineTo(wx + ww, wy + wh); c.closePath(); c.fill();
  if (!day) { c.fillStyle = '#e8c870'; for (let i = 0; i < 9; i++) c.fillRect(wx + 6 + (i * 37) % 110, wy + 82 + (i * 17) % 28, 4, 5); }
  c.fillStyle = '#2b2620'; c.fillRect(wx + ww / 2 - 2, wy, 4, wh); c.fillRect(wx, wy + wh / 2 - 2, ww, 4);
  // wall stuff
  drawBoard(c, 16, 56, 112, 128);
  drawPoster(c, 196, 92, 92, 112, -0.04);
  drawPoster(c, 404, 176, 44, 54, 0.08);
  drawSelfie(c, 318, 52, 42, 46, 0.05, 'proud');
  drawSelfie(c, 372, 70, 36, 40, -0.08, 'normal');
  drawSelfie(c, 296, 108, 34, 38, -0.05, 'whisper');
  if (day) drawSelfie(c, 356, 120, 40, 44, 0.06, null, true);
  // Jensbabba behind the counter
  const bob = Math.sin(t * 2) * 2;
  c.save(); c.translate(300, 250 + bob);
  drawJens(c, 0.9, st.face, t, { talk: st.talk, blink: st.blink, look: st.look });
  c.restore();
  // counter
  c.fillStyle = '#7d5f40'; c.fillRect(-200, 288, 1000, 16);
  c.fillStyle = 'rgba(255,240,210,0.25)'; c.fillRect(-200, 288, 1000, 3);
  c.fillStyle = '#4e3d2f'; c.fillRect(-200, 304, 1000, 200);
  c.strokeStyle = '#3a2d22'; c.lineWidth = 2;
  for (let x = -180; x < 800; x += 110) { c.strokeRect(x, 316, 96, 120); c.fillStyle = '#b8a07a'; c.fillRect(x + 80, 330, 4, 22); }
  // laptop seen from behind, and the toilet paper hoard
  c.fillStyle = '#2a2b2f'; c.beginPath(); c.moveTo(118, 289); c.lineTo(226, 289); c.lineTo(232, 296); c.lineTo(112, 296); c.closePath(); c.fill();
  c.fillStyle = '#9ea2aa'; c.beginPath(); c.moveTo(126, 289); c.lineTo(132, 214); c.lineTo(212, 214); c.lineTo(218, 289); c.closePath(); c.fill();
  c.strokeStyle = '#55585f'; c.lineWidth = 2; c.stroke();
  drawPoster(c, 172, 252, 30, 36, 0.05);
  drawTPStack(c, 52, 278, 0.9);
  // fruit bowl with you in it, and a banana when the sun is up
  if (day) {
    c.save(); c.translate(468, 270); c.rotate(-0.3);
    c.strokeStyle = '#3a2a08'; c.lineWidth = 15; c.beginPath(); c.arc(0, -24, 30, 0.5, 2.3); c.stroke();
    c.strokeStyle = '#f2d24a'; c.lineWidth = 11; c.beginPath(); c.arc(0, -24, 30, 0.5, 2.3); c.stroke();
    c.restore();
  }
  st.drawApple(c, 428, 262, 1.75);
  c.fillStyle = '#c9c2b4'; c.beginPath(); c.ellipse(440, 286, 54, 12, 0, 0, Math.PI); c.fill();
  c.strokeStyle = '#7a7366'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#e8e2d4'; ell(c, 440, 286, 54, 7); c.fill();
}
function drawDrainScene(c, v, t, st) {
  const g = c.createRadialGradient(300, 230, 30, 300, 230, 360);
  g.addColorStop(0, '#9aa3ad'); g.addColorStop(1, '#3c434b');
  c.fillStyle = g; c.fillRect(-300, -200, 1200, 700);
  rrect(c, 40, 30, 520, 380, 46); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
  rrect(c, 52, 42, 496, 360, 40); const g2 = c.createLinearGradient(0, 42, 0, 400); g2.addColorStop(0, '#6d7680'); g2.addColorStop(1, '#a9b2bb'); c.fillStyle = g2; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(300, 240, 60 + i * 34, Math.PI * 1.1, Math.PI * 1.4); c.stroke(); }
  c.fillStyle = '#2b3036'; circle(c, 300, 240, 44);
  const hole = c.createRadialGradient(300, 240, 2, 300, 240, 38); hole.addColorStop(0, '#000000'); hole.addColorStop(1, '#22272c');
  c.fillStyle = hole; circle(c, 300, 240, 38);
  c.strokeStyle = '#8b939c'; c.lineWidth = 5; c.beginPath(); c.moveTo(262, 240); c.lineTo(338, 240); c.moveTo(300, 202); c.lineTo(300, 278); c.stroke();
  c.strokeStyle = 'rgba(200,40,50,0.6)'; c.lineWidth = 2; c.globalCompositeOperation = 'lighter';
  glowDot(c, 300, 240, 40, '#ff2020', 0.18 + 0.08 * Math.sin(t * 3)); c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(220,235,250,0.6)';
  for (let i = 0; i < 7; i++) circle(c, 120 + i * 61 % 360, 330 - (i * 47) % 200, 3 + (i % 3));
  st.drawApple(c, 420, 270, 3);
  c.save(); c.translate(300, -6 + Math.sin(t * 2) * 3);
  drawJensHead(c, 1.25, st.face, t, { talk: st.talk, blink: st.blink });
  c.restore();
  for (const s of [-1, 1]) { ell(c, 300 + s * 150, 46, 28, 16); c.fillStyle = JENS_SKIN; c.fill(); c.strokeStyle = JENS_OUT; c.lineWidth = 3; c.stroke(); }
}
function drawGardenScene(c, v, t, st) {
  const dawn = v === 'dawn';
  const sky = c.createLinearGradient(0, -200, 0, 140);
  if (dawn) { sky.addColorStop(0, '#5a6ea0'); sky.addColorStop(1, '#f2a66b'); } else { sky.addColorStop(0, '#05070f'); sky.addColorStop(1, '#1b2340'); }
  c.fillStyle = sky; c.fillRect(-300, -200, 1200, 340);
  if (!dawn) { c.fillStyle = '#e8e4d0'; for (let i = 0; i < 18; i++) circle(c, (i * 97) % 600, (i * 53) % 120 - 40, 1.2); }
  else { c.fillStyle = '#ffd88a'; circle(c, 470, 130, 30); }
  c.fillStyle = dawn ? '#3a2e2a' : '#11131c'; c.fillRect(-300, 40, 560, 120);
  c.fillStyle = dawn ? '#e6b06a' : '#d9b860'; for (let i = 0; i < 6; i++) c.fillRect(-40 + i * 52, 66, 18, 24);
  const lawn = c.createLinearGradient(0, 140, 0, 420);
  lawn.addColorStop(0, dawn ? '#3f5a2a' : '#152311'); lawn.addColorStop(1, dawn ? '#2a3f1c' : '#0b1409');
  c.fillStyle = lawn; c.fillRect(-300, 140, 1200, 400);
  c.fillStyle = dawn ? '#6a4a2e' : '#2a1d12';
  for (let x = -300; x < 900; x += 22) c.fillRect(x, 124, 14, 34);
  c.strokeStyle = dawn ? '#5d7a3a' : '#1f3318'; c.lineWidth = 2;
  for (let i = 0; i < 40; i++) { const x = (i * 71) % 620 - 10, y = 170 + (i * 37) % 220; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - 8); c.moveTo(x, y); c.lineTo(x + 3, y - 9); c.stroke(); }
  c.fillStyle = '#060404'; ell(c, 330, 320, 70, 30); c.fill();
  if (!dawn) {
    c.globalCompositeOperation = 'lighter'; glowDot(c, 330, 320, 90, '#ff3030', 0.22 + 0.06 * Math.sin(t * 2.5)); c.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) { c.fillStyle = '#ffae42'; ell(c, 330 + s * 18, 316, 7, 4 * (0.6 + 0.4 * Math.abs(Math.sin(t * 0.7)))); c.fill(); }
  } else {
    c.fillStyle = 'rgba(234,222,201,0.85)';
    for (let i = 0; i < 8; i++) circle(c, 260 + i * 20, 330 + Math.sin(i) * 10, 9 - (i % 3));
  }
  // the balcony, with Jensbabba hanging over the railing
  c.save(); c.translate(250, 104 + Math.sin(t * 2) * 1.5);
  drawJens(c, 0.36, st.face, t, { talk: st.talk, blink: st.blink });
  c.restore();
  c.fillStyle = '#20222a'; c.fillRect(150, 134, 220, 8);
  c.fillStyle = '#20222a'; for (let x = 156; x < 370; x += 14) c.fillRect(x, 134, 3, 36);
  c.fillRect(150, 166, 220, 5);
  if (!dawn) {
    const fall = (t * 0.6) % 1;
    st.drawApple(c, 330, 170 + fall * 110, 1.6);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
    for (const dx of [-14, 0, 14]) { c.beginPath(); c.moveTo(330 + dx, 140 + fall * 110); c.lineTo(330 + dx, 118 + fall * 110); c.stroke(); }
  } else st.drawApple(c, 410, 300, 1.5);
}

/* ------------------------------------------------------------------ the story player */
const Story = {
  beats: null, i: 0, typed: 0, done: null, t: 0, bg: 'kitchen', v: 'night', face: 'normal',
  blinkT: 2, chatLast: -99, used: new Set(), lowSaid: false, firstFight: false,
  ap: null, apx: null,

  play(id, done) {
    this.id = id; this.beats = curStory().script[id]; this.faceA = 'normal'; this.faceS = 'normal'; this.i = 0; this.done = done; this.bg = 'kitchen'; this.v = 'night'; this.face = 'normal'; this.t = 0;
    G.state = 'cutscene';
    UI.el.btnPause.hidden = true; UI.hidePanels(); UI.hideOverlays();
    UI.el.chat.classList.remove('show');
    UI.el.story.hidden = false;
    Input.reset();
    Sfx.init(); Sfx.resume(); Sfx.stopDrone(); if (Save.data.sound) Sfx.startMusic();
    this.enterBeat();
  },
  enterBeat() {
    const b = this.beats[this.i];
    if (b.bg) this.bg = b.bg;
    if (b.v) this.v = b.v;
    if (b.face) { this.face = b.face; if (b.who === 'alesen') this.faceA = b.face; else if (b.who === 'senale') this.faceS = b.face; }
    this.typed = 0;
    const box = UI.el.storyBox;
    box.className = 'sbox ' + b.who;
    UI.el.storyWho.textContent = WHO9[b.who] || '';
    UI.el.storyText.textContent = '';
    this.buildCard(b);
  },
  buildCard(b) {
    const card = UI.el.storyCard;
    card.textContent = '';
    card.className = 'scard';
    const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    const tagged = (text) => {
      const p = mk('p', 'ptext');
      text.split(' ').forEach((w, i) => { if (i) p.appendChild(document.createTextNode(' ')); if (w[0] === '#' || w[0] === '@') p.appendChild(mk('span', 'tag', w)); else p.appendChild(document.createTextNode(w)); });
      return p;
    };
    if (b.post) {
      const P = b.post;
      card.classList.add('post');
      const head = mk('div', 'phead');
      const av = document.createElement('canvas'); av.className = 'av'; av.width = 88; av.height = 88;
      paintAvatar(av, P.who || !!P.jens);
      head.appendChild(av);
      const nm = mk('div', 'pname'); nm.appendChild(mk('b', null, P.jens ? 'JENSBABBA' : P.name)); nm.appendChild(mk('span', null, P.jens ? '@jensbabba_official  ·  3:12' : `${P.handle}  ·  2h`));
      head.appendChild(nm); card.appendChild(head);
      card.appendChild(tagged(P.text));
      const foot = mk('div', 'pfoot', `${P.likes} ${P.likes === 1 ? 'like' : 'likes'}${P.note ? '  ·  ' + P.note : ''}`);
      card.appendChild(foot);
      if (P.reply) { const r = mk('div', 'preply'); r.appendChild(mk('b', null, P.reply.name)); r.appendChild(mk('p', null, P.reply.text)); card.appendChild(r); }
    } else if (b.phone) {
      card.classList.add('phone');
      card.appendChild(mk('div', 'pfrom', b.phone.from));
      for (const m of b.phone.msgs) card.appendChild(mk('div', 'bub', m));
      card.appendChild(mk('div', 'pseen', b.phone.seen || 'Read 03:14'));
    } else if (b.tv) {
      card.classList.add('tv');
      card.appendChild(mk('div', 'brk', 'BREAKING'));
      card.appendChild(mk('div', 'thead', b.tv.head));
      card.appendChild(mk('div', 'tsub', b.tv.text));
      const tick = mk('div', 'tick'); tick.appendChild(mk('span', null, b.tv.tick)); card.appendChild(tick);
    } else { card.hidden = true; return; }
    card.hidden = false;
  },
  full() { return (this.beats && this.beats[this.i].text) || ''; },
  next() {
    if (!this.beats) return;
    const full = this.full();
    if (this.typed < full.length) { this.typed = full.length; this.paint(); return; }
    this.i++;
    if (this.i >= this.beats.length) { this.end(); return; }
    this.enterBeat();
  },
  end() {
    UI.el.story.hidden = true;
    const d = this.done; this.beats = null; this.done = null;
    Sfx.stopMusic();
    if (d) d();
  },
  paint() { UI.el.storyText.textContent = this.full().slice(0, Math.floor(this.typed)); },
  update(dt) {
    if (!this.beats) return;
    this.t += dt;
    this.blinkT -= dt; if (this.blinkT < -0.12) this.blinkT = rnd(2, 4.5);
    const full = this.full();
    if (this.typed < full.length) {
      const before = Math.floor(this.typed);
      this.typed = Math.min(full.length, this.typed + dt * 40);
      const now = Math.floor(this.typed);
      if (now !== before) { this.paint(); if (before % 3 === 0 && full[before] !== ' ') Sfx.blip(this.beats[this.i].who); }
    }
    Sfx.musicTick();
  },
  drawApple(c, x, y, sc) {
    const k = sc * View.dpr * this.k;
    const size = 64, px = Math.ceil(size * k);
    if (!this.ap) { this.ap = document.createElement('canvas'); this.apx = this.ap.getContext('2d'); }
    if (this.ap.width !== px) { this.ap.width = px; this.ap.height = px; }
    const a = this.apx;
    a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, px, px);
    a.setTransform(k, 0, 0, k, px / 2, px / 2);
    const P = G.player;
    const speaking = this.beats && this.beats[this.i].who === 'apple';
    drawApple(a, 14, {
      char: P ? P.char : Save.data.char, t: this.t, lookX: this.bg === 'garden' ? 0 : -0.8, lookY: this.bg === 'drain' ? -0.9 : -0.2,
      blink: this.blinkT < 0 ? 0.05 : 1, fear: this.v === 'day' ? 0.2 : 0.9, hurt: 0, bites: P ? P.bites : [], leaf: Math.sin(this.t * 2) * 0.12,
      twin: P && P.twin, toffee: P && P.toffee, shellUp: P && P.shellUp, cyanide: P && P.cyanide, mouthOpen: speaking && Math.sin(this.t * 20) > 0,
    });
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.drawImage(this.ap, -size / 2, -size / 2, size, size);
    c.restore();
  },
  render(c) {
    const W = View.W, H = View.H;
    const short = !View.portrait && H < 560;
    const sh = Math.max(H * 0.5, H - (View.portrait ? 172 : short ? 118 : 150));
    const k = View.portrait ? Math.min(W / 340, sh / 400) : Math.min(W / 430, sh / 380);
    this.k = k;
    const cardOn = !UI.el.storyCard.hidden;
    const cx = View.portrait ? W / 2 : cardOn ? W * 0.3 : W / 2;
    const ox = cx - (View.portrait ? 325 : 300) * k, oy = sh - 400 * k;
    c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    c.fillStyle = SCENE_BG9[this.bg + '_' + this.v] || SCENE_BG9[this.bg] || (this.bg === 'kitchen' ? (this.v === 'day' ? '#b9bfa8' : '#2a312d') : this.bg === 'drain' ? '#3c434b' : '#05070f');
    c.fillRect(0, 0, W, H);
    c.setTransform(View.dpr * k, 0, 0, View.dpr * k, ox * View.dpr, oy * View.dpr);
    if (this.bg === 'kitchen') {
      c.strokeStyle = this.v === 'day' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'; c.lineWidth = 1.2;
      const top = -oy / k - 10, left = -ox / k - 10, right = (W - ox) / k + 10;
      for (let y = 290; y > top; y -= 26) { c.beginPath(); c.moveTo(left, y); c.lineTo(right, y); c.stroke(); }
      for (let x = Math.floor(left / 34) * 34; x < right; x += 34) for (let y = 290; y > top; y -= 52) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 26); c.moveTo(x + 17, y - 26); c.lineTo(x + 17, y - 52); c.stroke(); }
    }
    const b = this.beats ? this.beats[this.i] : {};
    const st = { face: this.face, faceA: this.faceA, faceS: this.faceS, who: b.who, talk: this.typed < this.full().length && (b.who === 'jens' || b.who === 'alesen' || b.who === 'senale' || b.who === 'ouders'), blink: this.blinkT < 0, look: 0, drawApple: (cc, x, y, s) => this.drawApple(cc, x, y, s) };
    if (SCENES9[this.bg]) SCENES9[this.bg](c, this.v, this.t, st);
    else if (this.bg === 'kitchen') drawKitchenScene(c, this.v, this.t, st);
    else if (this.bg === 'drain') drawDrainScene(c, this.v, this.t, st);
    else drawGardenScene(c, this.v, this.t, st);
    c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    if (this.bg === 'kitchen' && this.v === 'night') {
      const lx = ox + 172 * k, ly = oy + 240 * k;
      c.globalCompositeOperation = 'lighter';
      const gl = c.createRadialGradient(lx, ly, 0, lx, ly, 260 * k);
      gl.addColorStop(0, 'rgba(90,150,255,0.28)'); gl.addColorStop(1, 'rgba(90,150,255,0)');
      c.fillStyle = gl; c.fillRect(0, 0, W, sh);
      c.globalCompositeOperation = 'source-over';
      const vg = c.createRadialGradient(ox + 280 * k, oy + 200 * k, 60 * k, ox + 280 * k, oy + 200 * k, 520 * k);
      vg.addColorStop(0, 'rgba(4,6,10,0)'); vg.addColorStop(1, 'rgba(4,6,10,0.75)');
      c.fillStyle = vg; c.fillRect(0, 0, W, sh);
    }
    const fade = c.createLinearGradient(0, sh - 40, 0, sh + 30);
    fade.addColorStop(0, 'rgba(11,8,7,0)'); fade.addColorStop(1, 'rgba(11,8,7,1)');
    c.fillStyle = fade; c.fillRect(0, sh - 40, W, H - sh + 40);
  },

  // Jensbabba talks to you through the baby monitor while you play
  chat(ev, force) {
    if (G.mode !== 'story' || G.state !== 'play') return;
    if (!force && G.t - this.chatLast < 6) return;
    const CL = curStory().chat;
    let list = CL[ev];
    if (ev === 'fight') list = CL.fight[G.levelIdx] || CL.fight[0];
    if (ev === 'fightFirst' || ev === 'boss' || ev === 'bossDown') list = [CL[ev][G.levelIdx] || CL[ev][0]];
    if (!list || !list.length) return;
    const fresh = list.filter((l) => !this.used.has(l));
    const line = pick(fresh.length ? fresh : list);
    this.used.add(line);
    this.chatLast = G.t;
    UI.chat(line);
  },
};

function paintAvatar(cv, jens) {
  if (typeof jens === 'string') { if (jens !== 'jens') return paintAvatar9(cv, jens); jens = true; }
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = jens ? '#9fc2dc' : '#2d4a2a'; c.fillRect(0, 0, cv.width, cv.height);
  if (jens) { c.translate(cv.width / 2, cv.height * 0.62); drawJensHead(c, cv.width / 170, 'proud', 0, {}); }
  else {
    c.translate(cv.width / 2, cv.height / 2);
    c.strokeStyle = '#e7a5b2'; c.lineWidth = cv.width * 0.12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-cv.width * 0.3, cv.width * 0.15); c.bezierCurveTo(-cv.width * 0.1, -cv.width * 0.3, cv.width * 0.1, cv.width * 0.3, cv.width * 0.3, -cv.width * 0.15); c.stroke();
  }
}

/* ------------------------------------------------------------------ story rooms: his flat, his posters, his face */
function drawStoryFloor(c, room, L, rng) {
  if (curStory().id !== 'lockdown') return drawStoryFloor2(c, room, L, rng);
  const spray = room.type !== 'secret';
  if (spray) {
    const x = RW / 2 + (rng() - 0.5) * 80, y = room.type === 'start' ? RH * 0.36 : 70 + rng() * (RH - 140);
    c.save(); c.translate(x, y); c.rotate((rng() - 0.5) * 0.35);
    c.font = '700 34px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const txt = 'STOP DE LOCKDOWN'; const w = c.measureText(txt).width;
    c.fillStyle = 'rgba(215,32,44,0.48)'; c.fillText(txt, 0, 0);
    c.fillStyle = 'rgba(205,30,40,0.3)';
    for (let i = 0; i < 9; i++) { const dx = -w / 2 + rng() * w, len = 4 + rng() * 14; c.fillRect(dx, 10, 1.6, len); circle(c, dx + 0.8, 10 + len, 1.4); }
    c.restore();
  }
  const photos = rng() < 0.6 ? 1 + Math.floor(rng() * 2) : 0;
  for (let i = 0; i < photos; i++) {
    c.save(); c.translate(36 + rng() * (RW - 72), 36 + rng() * (RH - 72)); c.rotate((rng() - 0.5) * 0.9);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-12, -13, 26, 30);
    c.fillStyle = '#efece4'; c.fillRect(-13, -15, 26, 30);
    c.fillStyle = '#8fb3cf'; c.fillRect(-11, -13, 22, 21);
    c.save(); c.beginPath(); c.rect(-11, -13, 22, 21); c.clip(); c.translate(0, 0); drawJensHead(c, 0.09, 'proud', 0, {}); c.restore();
    c.fillStyle = 'rgba(240,230,170,0.6)'; c.fillRect(-5, -17, 10, 4);
    c.restore();
  }
}
function drawStoryWalls(c, room, L) {
  if (curStory().id !== 'lockdown') return drawStoryWalls2(c, room, L);
  let n = 0;
  const near = (side, pos) => room.sconces.some((s) => s.side === side && Math.abs((side === 'n' || side === 's' ? s.x : s.y) - pos) < 30);
  for (const side of ['n', 's']) {
    for (const x of [56, 136, 304, 384]) {
      if (near(side, x)) continue;
      const y = side === 'n' ? -WALL / 2 : RH + WALL / 2;
      c.save(); c.translate(x, y);
      if ((n++ + room.id) % 2) wallPoster(c); else wallFrame(c);
      c.restore();
    }
  }
  for (const side of ['w', 'e']) {
    for (const y of [70, 290]) {
      if (near(side, y)) continue;
      const x = side === 'w' ? -WALL / 2 : RW + WALL / 2;
      c.save(); c.translate(x, y); c.rotate(side === 'w' ? -Math.PI / 2 : Math.PI / 2);
      if ((n++ + room.id) % 2) wallPoster(c); else wallFrame(c);
      c.restore();
    }
  }
}
function wallPoster(c) {
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-19, -7, 40, 17);
  c.fillStyle = '#121212'; c.fillRect(-20, -9, 40, 17);
  c.fillStyle = '#f2efe8'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '700 6px "Barlow Condensed", "Arial Narrow", sans-serif'; c.fillText('STOP DE', 0, -3.5);
  c.fillText('LOCKDOWN', 0, 3.2);
  c.fillStyle = 'rgba(240,230,170,0.7)'; c.fillRect(-22, -10, 5, 3); c.fillRect(17, -10, 5, 3);
}
function wallFrame(c) {
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-11, -8, 24, 19);
  c.fillStyle = '#5a3d25'; c.fillRect(-12, -10, 24, 19);
  c.fillStyle = '#9fc2dc'; c.fillRect(-10, -8, 20, 15);
  c.save(); c.beginPath(); c.rect(-10, -8, 20, 15); c.clip(); c.translate(0, 3); drawJensHead(c, 0.07, 'proud', 0, {}); c.restore();
}
function drawTPRock(c, o, rng) {
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, o.x + 2, o.y + 12, 19, 6); c.fill();
  const rolls = [[-9, 6], [9, 6], [0, -8]];
  for (const [dx, dy] of rolls) {
    const x = o.x + dx, y = o.y + dy;
    c.fillStyle = '#b8b1a3'; circle(c, x + 1, y + 2, 10);
    c.fillStyle = '#f4f1ea'; circle(c, x, y, 9.5);
    c.strokeStyle = 'rgba(140,132,118,0.8)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.stroke();
    c.fillStyle = '#c8a97a'; circle(c, x, y, 4); c.fillStyle = '#3a2a18'; circle(c, x, y, 2.4);
  }
  c.fillStyle = 'rgba(255,255,255,0.15)'; ell(c, o.x - 4, o.y - 10, 9, 4); c.fill();
}
function drawMonitorRock(c, o, rng) {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 13, 19, 6); c.fill();
  rrect(c, x - 17, y - 14, 34, 28, 4); c.fillStyle = '#121418'; c.fill();
  rrect(c, x - 16, y - 13, 32, 26, 3); c.fillStyle = '#b6b1a2'; c.fill();
  c.fillStyle = '#8f8a7c'; c.fillRect(x - 16, y + 7, 32, 6);
  rrect(c, x - 12, y - 10, 24, 16, 2); c.fillStyle = '#0c2416'; c.fill();
  c.strokeStyle = '#5cff9a'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(x - 8, y - 1); c.quadraticCurveTo(x - 4, y - 7, x, y - 2); c.quadraticCurveTo(x + 4, y + 3, x + 8, y - 3); c.stroke();
  c.fillStyle = '#5cff9a'; circle(c, x + 8, y - 3, 1.2);
  c.fillStyle = '#f6e27a'; c.fillRect(x + 7, y - 15, 9, 8);
}
function drawKitchenDeco(c, rng, L) {
  c.fillStyle = 'rgba(214,180,120,0.5)';
  for (let i = 0; i < 40; i++) circle(c, rng() * RW, rng() * RH, 0.6 + rng() * 1.2);
  for (let k = 0; k < 2; k++) {
    const cx = 40 + rng() * (RW - 80), cy = 40 + rng() * (RH - 80);
    c.strokeStyle = 'rgba(60,34,20,0.85)'; c.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) { const a = rng() * TAU, x = cx + Math.cos(a) * rng() * 14, y = cy + Math.sin(a) * rng() * 10, b = rng() * TAU; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(b) * 3, y + Math.sin(b) * 3); c.stroke(); }
  }
  c.fillStyle = 'rgba(240,240,232,0.12)'; ell(c, 60 + rng() * (RW - 120), 60 + rng() * (RH - 120), 22, 12, rng()); c.fill();
  c.save(); c.translate(50 + rng() * (RW - 100), 50 + rng() * (RH - 100)); c.rotate((rng() - 0.5) * 0.8);
  c.fillStyle = 'rgba(246,226,122,0.75)'; c.fillRect(-9, -9, 18, 18);
  c.fillStyle = '#3a2a10'; c.font = '700 5px "Barlow Condensed", sans-serif'; c.textAlign = 'center'; c.fillText('WORMS??', 0, 1);
  c.restore();
}
function drawCablesDeco(c, rng, L) {
  const cols = ['#2c6e49', '#8a2a2a', '#2a4f8a', '#b08a2a'];
  for (let i = 0; i < 5; i++) {
    const side = Math.floor(rng() * 4);
    const x0 = side < 2 ? rng() * RW : side === 2 ? 0 : RW, y0 = side < 2 ? (side === 0 ? 0 : RH) : rng() * RH;
    const x1 = rng() * RW, y1 = rng() * RH, x2 = rng() * RW, y2 = rng() * RH;
    c.lineCap = 'round';
    c.strokeStyle = '#05070b'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x1, y1, x2, y2, rng() * RW, rng() * RH); c.stroke();
    const col = cols[i % cols.length];
    c.strokeStyle = col; c.lineWidth = 3.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1; c.stroke();
  }
  for (let i = 0; i < 6; i++) { c.fillStyle = rng() < 0.5 ? 'rgba(92,255,154,0.55)' : 'rgba(255,90,90,0.5)'; circle(c, rng() * RW, rng() * RH, 1.4); }
}
function drawGardenDeco(c, rng, L) {
  drawVeinsDeco(c, rng, L);
  c.strokeStyle = 'rgba(90,130,60,0.45)'; c.lineWidth = 1.2;
  for (let i = 0; i < 50; i++) { const x = rng() * RW, y = rng() * RH; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y - 5); c.moveTo(x, y); c.lineTo(x + 2, y - 6); c.stroke(); }
}

