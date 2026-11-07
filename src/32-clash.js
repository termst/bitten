/* src/32-clash.js: clash rules (v13 tags). From v10, v13. Lines 17020 to 17764 of the v13.7 script. */
/* =====================================================================
   THE CLASH RULES (v13: tags)
   Some powerups do the same job, or cannot work together: two pairs of
   glasses, fire and ice, two ways for a seed to fly. You hold one of
   them. Walk onto a clashing one and stand on it to swap: the old one
   drops on the floor.

   How it works since v13:
   - Every powerup has tags in CLASH_TAGS13 ('' when it clashes with nothing).
   - CLASH_LIMIT13: at most `max` powerups with that tag at once.
   - CLASH_CROSS13: nothing with tag a next to anything with tag b.
   - CLASH10 is built from those two tables. Never push into it by hand.

   RULE FOR EVERY NEW POWERUP FROM NOW ON: give it tags, nothing else.
   tagClash13('id', 'fire burn') at the place where the powerup is added.
   Only add a new limit or cross when no existing tag fits the overlap.
   A powerup without an entry shows a warning in the console and fails
   the clash test.
   ===================================================================== */
const CLASH_TAGS13 = {
  // the first powerups
  twin: 'multishot', cyanide: 'poison', toffee: 'shield shell', worm: 'helper', cider: 'pace', big: 'huge swing', sling: '',
  spread: 'multishot', thorn: 'pierce', rubber: 'bounce', rain: 'tiny pace', seeker: 'path homing', frost: 'ice', fizzy: 'trick carry',
  halo: 'helper', split: 'trick carry', hungry: 'hunger counter', ember: 'burn fire', boomer: 'path', lucky: 'crit luckyshot',
  static: 'trick chain', wiggle: 'path', quick: 'pace', sharp: '', sniper: '', peel: '', sprout: 'pace', spiky: 'biteback', glow: '',
  clover: 'dodge', juice: '', magnet: '', regrow: 'rest', nova: 'rings', cannon: 'heavy pierce', buddy: 'helper gunners',
  phoenix: 'second', storm: 'sky', crown: 'crown', chrono: 'slow', mirror: 'back mirror', vamp: 'hunger', pump: 'boom counted',
  capy: 'helper', chill: 'still', brim: 'deathblast', coaster: 'path', pick: 'dig', fuse: '', pact: 'burn fire', dropper: '',
  bonus: 'discount', tag: 'mark', gratis: '', hagel: 'extras', kroket: 'deepfried', klomp: 'shoes', motie: 'blast killblast counter',
  hamer: '', stroop: 'shield', molen: 'blast wind', veto: 'panic', coalitie: 'helper', deltaplan: 'blast', golden: '',
  compost: 'counter', graft: 'growth', bruised: 'growth lowhp', sap: 'goo', seedbank: 'growth', pollen: '', dash: 'pace',
  // v9 and v10
  bass: 'loud', rave: '', vinyl: 'trick carry', kaas: '', bank: 'charge', ov: '', schaar: 'scissors', stok: '', wheek: '',
  perfect: 'growth clean', sticky: 'sticky', nitro: 'pace', horn: 'honk blast flash', bril: 'glasses crit', bezwaar: '', mandje: '',
  haring: '', bitterbal: '', pinda: 'sticky', oliebol: '', verzoek: '', fiets: 'bell', zonnebril: 'glasses dodge', koffie: 'pace',
  disco: 'helper', drop: 'blast', speaker: 'helper loud', remix: 'random', wheel: 'charge', curator: 'second', assseed: 'helper back',
  skyrain: 'sky', flap: '', vitamine: '', puntje: '', elastiek: 'pace', verrekijker: '', dikkepit: '', gympies: 'shoes',
  vliegenmepper: '', kaasschaaf: 'opener', rodestip: 'crit', knoflook: '', tulp: '', paraplu: 'dodge raingear umbrella', helm: '',
  nicotine: 'heal smoke', peuk: 'burn fire', rookgordijn: 'smoke', koptelefoon: 'quiet', hyperfocus: 'growth', special: 'grudge',
  patroon: 'crit', fidget: 'helper', deken: 'rest', drone: 'helper', stofzuiger: 'helper', garantie: 'court', supermeter: 'charge',
  powercube: 'growth floorbuff', bosje: 'still', pepernoot: 'extras', clownneus: 'honk blast show', ballon: '', hypercharge: 'pace timed',
  magnetron: 'blast peck', inzone: 'homing', gasmasker: '', meeuw: 'helper', beker: 'growth', reuzenkracht: 'lowhp',
  haadee: 'show swing feed',
  // v10.10
  linzen: 'random colors candy', snoepzak: 'floorbuff', doomscroll: 'feed timed', viral: 'blast killblast', reeks: 'growth clean',
  duet: 'helper mirror', selfie: 'flash', dagboek: 'grudge', reflectie: 'bounce', kamhuid: 'still', kamtong: 'sticky',
  kleurwissel: 'colors', eierschaal: 'shell', hoofdpersoon: 'fullhp', terugblik: 'shield', grotevala: 'second',
  // v10.21
  stamppot: '', veter: 'candy counted', fietspomp: 'charge', statiegeld: 'resale', mosterd: '', schaatsen: 'shoes', regenjas: 'raingear',
  frikandel: '', automaat: 'rest', kwartje: 'counted', appelmoes: 'lowhp', uitsmijter: 'biteback', koekoek: 'peck', tegeltje: '',
  tosti: 'fire counted', elfsteden: 'growth', koningsdag: 'blast party', pakjesavond: '', nachtwacht: 'killblast party',
  appelboom: 'heal', kernsplitsing: 'deathblast', koets: 'discount', drieling: 'multishot', zwartgat: 'blast', kampvuur: 'fire still heal',
  vuurwerk: 'boom counted', snelkookpan: 'blast', zevendehemel: 'lowhp', koningsappel: 'crown', tulpenmanie: 'growth',
  tondeuse: 'scissors', spaarpas: 'growth', advocaat: 'court', marktplaats: 'resale', stempas: '', fiche: '', brandweer: 'weakspot',
  ijsblokje: 'weakspot', loodgieter: 'weakspot', trampoline: 'trick carry chain', veerpont: 'opener', pindasaus: 'mark',
  megafoon: 'flash bell', rugzak: 'growth', verjaardag: 'floorbuff',
  // v10.24 to v12.8
  rotting: 'rot stack', fietsbel: 'bell', zoutedrop: 'growth', melon: 'huge goo burst', mud: 'sticky goo stack slow mark',
  tygo: 'go', gummy: 'candy chain', luckystrike: 'burn fire smoke luckyshot counted', schengen: 'phase', matroesjka: 'shield',
  borsjtsj: 'rest', supersize: 'huge deepfried', revolver: 'pierceshot counted', importheffing: 'discount',
  rijstwafel: 'pierceshot counted', sterren: 'rings counter', genadeslag: 'trick finisher', dubbelganger: 'helper gunners',
  lijn34: 'blast', grotehap: 'finisher counter', airbag: 'shield panic',
};

// at most `max` powerups with this tag
const CLASH_LIMIT13 = {
  path: { max: 1, name: 'Seed path', why: 'A seed can only follow one path.' },
  huge: { max: 1, name: 'Seed size', why: 'The seed is already as big as it gets.' },
  burn: { max: 1, name: 'Fire', why: 'One kind of fire is enough.' },
  shield: { max: 1, name: 'Shield', why: 'Only one shield at a time.' },
  shell: { max: 1, name: 'Shell', why: 'One shell around an apple.' },
  second: { max: 1, name: 'Second chance', why: 'You only get one second chance.' },
  hunger: { max: 1, name: 'Hunger', why: 'Two kinds of hunger cannot share one apple.' },
  glasses: { max: 1, name: 'Glasses', why: 'You can only wear one pair of glasses.' },
  shoes: { max: 1, name: 'Shoes', why: 'One pair of shoes. You have one pair of feet.' },
  sky: { max: 1, name: 'Sky', why: 'There is only one sky.' },
  back: { max: 1, name: 'Your back', why: 'Your back is already covered.' },
  sticky: { max: 1, name: 'Sticky', why: 'Two coatings on one snake make one big mess.' },
  still: { max: 1, name: 'Standing still', why: 'There is only so much standing still.' },
  helper: { max: 3, name: 'Helpers', why: 'Three helpers is a crowd.' },
  honk: { max: 1, name: 'Honk', why: 'One honk at a time.' },
  blast: { max: 2, name: 'Room blasts', why: 'Two room-wide blasts is the limit.' },
  extras: { max: 1, name: 'Extras per shot', why: 'One handful of extras per shot.' },
  crit: { max: 2, name: 'Crits', why: 'Two crit tricks at most.' },
  dodge: { max: 2, name: 'Dodges', why: 'Two lucky dodges at most.' },
  rest: { max: 1, name: 'Rest', why: 'One way to rest after a room.' },
  growth: { max: 2, name: 'Growing damage', why: 'Two growing damage boosts at most.' },
  trick: { max: 2, name: 'Seed tricks', why: 'A seed can only do so many tricks when it hits.' },
  charge: { max: 1, name: 'Charged shot', why: 'Only one charged shot at a time.' },
  homing: { max: 1, name: 'Homing', why: 'Your seeds already find their way.' },
  lowhp: { max: 1, name: 'Last stand', why: 'One last-stand mood at a time.' },
  show: { max: 1, name: 'Entertainers', why: 'Two failed entertainers is too many.' },
  swing: { max: 1, name: 'Damage swing', why: 'Both change the damage per seed. That gets unreadable.' },
  random: { max: 1, name: 'Random seeds', why: 'Two things want to pick what a seed does.' },
  colors: { max: 1, name: 'Colors', why: 'Too many colors on one apple.' },
  floorbuff: { max: 1, name: 'Floor buffs', why: 'One pile of things that fade at the next floor.' },
  feed: { max: 1, name: 'Feed', why: 'One feed to scroll at a time.' },
  timed: { max: 1, name: 'Timed boosts', why: 'Two timed boosts fight over the same moment.' },
  killblast: { max: 1, name: 'Kill volley', why: 'One thing that counts kills to hit the whole room.' },
  clean: { max: 1, name: 'Clean rooms', why: 'Both reward rooms without a bite.' },
  mirror: { max: 1, name: 'Mirror', why: 'One mirror trick at a time.' },
  bounce: { max: 1, name: 'Bounce', why: 'A seed can only bounce one way.' },
  flash: { max: 1, name: 'Flash and blast', why: 'Two things that stun everything in front of you.' },
  grudge: { max: 1, name: 'Grudges', why: 'One kind of grudge against a snake at a time.' },
  raingear: { max: 1, name: 'Rain gear', why: 'Umbrella or raincoat. Not both, you are an apple.' },
  biteback: { max: 1, name: 'Bite back', why: 'Both punish whatever bites you.' },
  resale: { max: 1, name: 'Resale', why: 'Both raise what the till pays.' },
  heal: { max: 1, name: 'Slow heals', why: 'One slow heal in a fight.' },
  deathblast: { max: 1, name: 'Death blasts', why: 'Kills can only blow up one way.' },
  discount: { max: 1, name: 'Discount', why: 'One discount at a time.' },
  multishot: { max: 2, name: 'Extra seeds', why: 'Two ways to fire more seeds at most.' },
  boom: { max: 1, name: 'Explosive seeds', why: 'One kind of exploding seed.' },
  crown: { max: 1, name: 'Crown', why: 'One crown per apple.' },
  scissors: { max: 1, name: 'Scissors', why: 'Scissors or clippers. Not both.' },
  mark: { max: 1, name: 'Marks', why: 'One mark on a snake at a time.' },
  weakspot: { max: 2, name: 'Weak spots', why: 'Two weak spot tricks at most.' },
  court: { max: 1, name: 'Court', why: 'Both fight over the same paperwork.' },
  peck: { max: 1, name: 'Timed peck', why: 'Both hit the closest snake on a timer.' },
  opener: { max: 1, name: 'Opening hit', why: 'Only one thing gets to go first.' },
  bell: { max: 1, name: 'Bells', why: 'One thing that rings at a time. Nobody hears the second one.' },
  party: { max: 1, name: 'Big party', why: 'One room wide show at a time.' },
  goo: { max: 1, name: 'Goo', why: 'Two kinds of goo is one too many.' },
  stack: { max: 1, name: 'Stacking mess', why: 'Two kinds of stacking mess. One at a time.' },
  slow: { max: 1, name: 'Slow room', why: 'Both slow the room down. One at a time.' },
  candy: { max: 1, name: 'Candy seeds', why: 'One kind of candy on a seed. The rest sticks together.' },
  chain: { max: 1, name: 'Chain hits', why: 'A hit can only jump to the next snake one way.' },
  smoke: { max: 1, name: 'Smoke', why: 'One smoking habit per apple.' },
  luckyshot: { max: 1, name: 'Lucky hits', why: 'Two kinds of lucky shot. Luck does not stack.' },
  counted: { max: 2, name: 'Counted shots', why: 'Every Nth seed is special for two things at most. After that nobody keeps count.' },
  rings: { max: 1, name: 'Rings', why: 'Two rings of seeds. Pick one circle.' },
  deepfried: { max: 1, name: 'Supersize', why: 'One deep fried size upgrade per apple.' },
  gunners: { max: 1, name: 'Gunners', why: 'Two extra shooters is one too many. Pick who fires with you.' },
  finisher: { max: 1, name: 'Finishing blows', why: 'Both decide how a snake ends. One is enough.' },
  counter: { max: 2, name: 'Kill counters', why: 'Two kill counters is the most one apple keeps track of.' },
  panic: { max: 1, name: 'Panic stuns', why: 'Two panic buttons, one panic.' },
};

// nothing with tag a next to anything with tag b
const CLASH_CROSS13 = [
  { a: 'fire', b: 'ice', name: 'Fire and ice', why: 'Fire and ice cancel each other out.' },
  { a: 'fire', b: 'rot', name: 'Rot and fire', why: 'Fire burns the rot away.' },
  { a: 'ice', b: 'rot', name: 'Rot and ice', why: 'Cold keeps food fresh. Nothing rots.' },
  { a: 'ice', b: 'stack', name: 'Cold and goo', why: 'Cold goo is just a rock. One at a time.' },
  { a: 'poison', b: 'rot', name: 'Rot and poison', why: 'Two slow ways to go bad is one too many.' },
  { a: 'tiny', b: 'huge', name: 'Seed size', why: 'Huge seeds and tiny seeds do not mix.' },
  { a: 'tiny', b: 'heavy', name: 'Cannon', why: 'A cannon does not fire tiny seeds.' },
  { a: 'quiet', b: 'loud', name: 'Noise', why: 'Noise cancelling and a loud speaker cancel out.' },
  { a: 'fullhp', b: 'lowhp', name: 'Mood', why: 'Main character energy and a last stand do not mix.' },
  { a: 'phase', b: 'bounce', name: 'Through things', why: 'Bouncing off borders that are not there.' },
  { a: 'phase', b: 'dig', name: 'Through things', why: 'Seeds that ignore rocks have no use for a pick.' },
  { a: 'wind', b: 'umbrella', name: 'Wind and umbrella', why: 'The windmill blows the umbrella inside out.' },
  { a: 'pierce', b: 'pierceshot', name: 'Pierce', why: 'Every seed already goes through. The extra piercing shot adds nothing.' },
  { a: 'burst', b: 'pierce', name: 'Bursting seeds', why: 'A seed that bursts on the first snake does not go through.' },
  { a: 'burst', b: 'carry', name: 'Bursting seeds', why: 'It bursts once. It does not split, skip or bounce on.' },
  { a: 'burst', b: 'charge', name: 'Bursting seeds', why: 'The charged shot and the burst fight over the same shot.' },
  { a: 'go', b: 'pace', name: 'Speed boosts', why: 'Two speed boosts on one apple. One at a time.' },
  { a: 'go', b: 'still', name: 'Speed boosts', why: 'This one wants you standing still. GO wants you running.' },
];

// short labels for the guide chips
const CLASH_LABEL13 = {
  fire: 'Fire', burn: 'Burn', ice: 'Ice', rot: 'Rot', poison: 'Poison', pace: 'Speed', go: 'Speed burst', tiny: 'Tiny seeds', huge: 'Big seeds',
  heavy: 'Cannon', sticky: 'Sticky', goo: 'Goo', bell: 'Bell', raingear: 'Rain gear', umbrella: 'Umbrella', shield: 'Shield', shell: 'Shell',
  heal: 'Slow heal', rest: 'Rest', helper: 'Helper', blast: 'Room blast', crit: 'Crit', dodge: 'Dodge', growth: 'Growing damage',
  multishot: 'Extra seeds', pierce: 'Pierce', pierceshot: 'Pierce shot', counted: 'Every Nth', counter: 'Kill counter', charge: 'Charged shot',
  path: 'Seed path', still: 'Stand still', lowhp: 'Last stand', fullhp: 'Full health', loud: 'Loud', quiet: 'Quiet', mark: 'Mark',
};

const CLASH10 = [];
let clashSig13 = '', clashVer13 = 0, clashWarned13 = {};
function clashTags13(id) { const t = CLASH_TAGS13[id]; return t ? String(t).split(/\s+/).filter(Boolean) : []; }
// the only way to give a powerup clash rules
function tagClash13(id, tags) { CLASH_TAGS13[id] = Array.isArray(tags) ? tags.join(' ') : String(tags || ''); clashVer13++; }
function buildClash13() {
  const ids = Object.keys(ITEMS).filter((id) => id !== 'golden');
  const by = {};
  for (const id of ids) {
    if (!(id in CLASH_TAGS13) && !clashWarned13[id]) { clashWarned13[id] = 1; try { console.warn(`Bitten: powerup "${id}" has no clash tags. Add tagClash13('${id}', '...') ('' when nothing fits).`); } catch (e) { /* ignore */ } }
    for (const t of clashTags13(id)) (by[t] || (by[t] = [])).push(id);
  }
  CLASH10.length = 0;
  for (const t in CLASH_LIMIT13) {
    const r = CLASH_LIMIT13[t], g = by[t] || [];
    if (g.length > r.max) CLASH10.push({ name: r.name, ids: g.slice(), max: r.max, why: r.why, tag: t });
  }
  const seen = new Set();
  for (const x of CLASH_CROSS13) {
    for (const a of by[x.a] || []) for (const b of by[x.b] || []) {
      if (a === b) continue;
      const k = a < b ? a + '|' + b : b + '|' + a;
      if (seen.has(k)) continue; seen.add(k);
      CLASH10.push({ name: x.name, ids: [a, b], max: 1, why: x.why, tag: x.a + '+' + x.b, cross: true });
    }
  }
  clashSig13 = ids.length + ':' + clashVer13;
}
function ensureClash13() { if (clashSig13 !== Object.keys(ITEMS).filter((id) => id !== 'golden').length + ':' + clashVer13) buildClash13(); }
// tags that matter for the guide: the ones that take part in a limit or a cross
function clashChips13(id) {
  const out = [];
  for (const t of clashTags13(id)) {
    if (CLASH_LIMIT13[t] || CLASH_CROSS13.some((x) => x.a === t || x.b === t)) out.push(t);
  }
  return out;
}

// things a character already is
const CHAR_CLASH10 = { apploa: ['dash'], pean: ['wheek'] };
function clashGroups10(id) { ensureClash13(); return CLASH10.filter((g) => g.ids.includes(id)); }
// null when it is fine, or { ids: what has to go, why, hard: it cannot be swapped }
function clashOf10(id, P) {
  if (!P || !id || id === 'golden' || !ITEMS[id]) return null;
  ensureClash13();
  const cc = CHAR_CLASH10[P.char];
  if (cc && cc.includes(id)) return { ids: [], why: `${CHARS[P.char].name} can already do that.`, hard: true };
  let out = null;
  for (const g of CLASH10) {
    if (!g.ids.includes(id)) continue;
    const held = P.items.filter((x) => x !== id && g.ids.includes(x));
    if (held.length < g.max) continue;
    if (!out) out = { ids: [], why: g.why, hard: false };
    for (const x of (g.max === 1 ? held : held.slice(0, held.length - g.max + 1))) if (!out.ids.includes(x)) out.ids.push(x);
  }
  if (out) { const C = CHARS[P.char]; if (out.ids.some((x) => C.start && C.start.includes(x))) out.hard = true; }
  return out;
}
function clashNames10(ids) { return ids.map((x) => (ITEMS[x] ? ITEMS[x].name : x)).join(', '); }
// what the guide shows under a powerup
function clashLine10(id) {
  const parts = [], solo = [];
  for (const g of clashGroups10(id)) {
    const others = g.ids.filter((x) => x !== id && ITEMS[x]);
    if (!others.length) continue;
    if (g.max === 1) { for (const x of others) if (!solo.includes(x)) solo.push(x); }
    else parts.push(`${g.name.toLowerCase()}: at most ${g.max} of ${clashNames10(g.ids.filter((x) => ITEMS[x]))}`);
  }
  if (solo.length) parts.unshift(`not with ${clashNames10(solo)}`);
  for (const ch in CHAR_CLASH10) if (CHAR_CLASH10[ch].includes(id) && CHARS[ch]) parts.push(`not for ${CHARS[ch].name}`);
  if (!parts.length) return '';
  const line = `Clashes: ${parts.join('; ')}`;
  return /[.!?]$/.test(line) ? line : line + '.';
}
// the floor never offers something that clashes with what you hold
{
  const ok0 = itemOk9;
  itemOk9 = function (id, P) { return ok0(id, P) && !clashOf10(id, P); };
}
// standing on a clashing powerup: wait a moment, then swap
function clashHold10(p, P, room, dt) {
  const cl = clashOf10(p.id, P);
  if (!cl) { p.swapT = 0; return false; }
  p.clashSeen = G.t;
  if (cl.hard) { if (!p.deny) { p.deny = 3; UI.banner('Part of you', cl.why); Sfx.thud(); } return true; }
  if (p.cost && ((P.flags && P.flags.curatele) || G.run.coins < priceOf(p))) return false;
  if (p.price && P.maxHp - p.price < 2) return false;
  if (!p.swapHint) { p.swapHint = true; UI.banner(`Clash: ${clashNames10(cl.ids)}`, `${cl.why} Stay on it to swap.`, 'curse'); Sfx.thud(); }
  p.swapT = (p.swapT || 0) + dt;
  if (p.swapT < SWAP_HOLD10) return true;
  p.swapT = 0;
  for (const old of cl.ids) {
    if (!sellItem9(P, old)) continue;
    // the old one lands a little way off, toward the middle of the room
    const a = Math.atan2(RH / 2 - p.y, RW / 2 - p.x) + rnd(-0.6, 0.6);
    const f = nearestFreeCell(room, clamp(p.x + Math.cos(a) * 62, 30, RW - 30), clamp(p.y + Math.sin(a) * 62, 30, RH - 30));
    room.pickups.push({ kind: 'item', id: old, x: f.x, y: f.y, t: 0, swapped: true });
    G.run.pending.add(old);
    floatText(f.x, f.y - 26, 'SWAP', '#ffd27a', true);
  }
  Meta.add('swaps'); Sfx.pickup();
  return false;
}

/* ------------------------------------------------------------------ the new powerups */
const V10_ITEMS = {
  assseed: { w: 0.8, name: 'Ass-seed', desc: 'A seed sits behind you: blocks spit from behind, stings snakes there, fires backwards every 6th shot. Yes, there.', apply(p) { p.ass10 = { x: p.x, y: p.y + 18, cd: 0, n: 0 }; } },
  skyrain: { w: 0.7, name: 'Rain from above', desc: 'Every 2nd shot, a seed also drops from the sky where you aim.', apply(p) { p.skyrain = true; p.skyN = 0; } },
  flap: { name: 'Appelflap', desc: 'Half an apple more health, half an apple healed.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 1); p.heal(1); } },
  vitamine: { name: 'Vitamine C', desc: 'Half an apple more health. Walk 3% faster.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 1); p.speed *= 1.03; } },
  puntje: { w: 1.1, name: 'Puntenslijper', desc: 'Seeds hit 8% harder.', apply(p) { p.dmg *= 1.08; } },
  elastiek: { w: 1.1, name: 'Elastiekje', desc: 'Shoot 8% faster.', apply(p) { p.fireDelay *= 0.92; } },
  verrekijker: { name: 'Verrekijker', desc: 'Seeds fly 20% farther and a bit faster.', apply(p) { p.range *= 1.2; p.shotSpeed *= 1.05; } },
  dikkepit: { name: 'Dikke Pit', desc: 'Seeds 20% bigger, 5% harder.', apply(p) { p.seedSize *= 1.2; p.dmg *= 1.05; } },
  gympies: { name: 'Gympies', desc: 'Walk 8% faster.', apply(p) { p.speed *= 1.08; } },
  vliegenmepper: { w: 0.9, name: 'Vliegenmepper', desc: 'Every 8th shot swats a wide area in front of you and knocks snakes back.', apply(p) { p.mepper = true; p.mepN = 0; } },
  kaasschaaf: { w: 0.9, name: 'Kaasschaaf', desc: 'Every hit also shaves off 3 percent of what a snake has left, 2 percent on bosses. Great against the big ones. Thin slices add up.', apply(p) { p.schaaf = true; } },
  rodestip: { w: 0.9, name: 'Rode Stip', desc: 'The first seed that hits a snake always crits.', apply(p) { p.redDot = true; } },
  knoflook: { name: 'Knoflook', desc: 'Snakes close to you keep taking small damage.', apply(p) { p.knoflook = true; p.garlicT = 0; } },
  tulp: { w: 0.8, name: 'Tulpenbol', desc: '1 in 8 kills plants a tulip. Walk over it to heal half an apple.', apply(p) { p.tulp = true; } },
  paraplu: { w: 0.9, name: 'Paraplu', desc: 'One spit in three that comes at you from the front bounces off your umbrella. Dutch weather gear.', apply(p) { p.paraplu = true; } },
  helm: { w: 0.9, name: 'Fietshelm', desc: 'The first bite on every floor does nothing.', apply(p) { p.helm = true; p.helmUp = true; } },
  nicotine: { w: 0.8, name: 'Nicotinepleister', desc: 'Every 40 seconds in a fight, heal half an apple.', apply(p) { p.patch = true; p.patchT = 0; } },
  peuk: { name: 'Gloeiende Peuk', desc: '1 in 3 hits sets a snake on fire.', apply(p) { p.peuk = true; } },
  rookgordijn: { w: 0.9, name: 'Rookgordijn', desc: 'Get bitten and you vanish in smoke. Snakes in it cannot see or bite you.', apply(p) { p.rookgordijn = true; } },
  koptelefoon: { w: 0.9, name: 'Noise Cancelling', desc: 'No knockback from bites. Roots, syrup and cold hold you half as long.', apply(p) { p.koptelefoon = true; } },
  hyperfocus: { w: 0.9, name: 'Hyperfocus', desc: 'Each hit in a row on the same snake: 6% more damage, up to 60%. Switching resets it.', apply(p) { p.hyper = true; p.hyperT = null; p.hyperN = 0; } },
  special: { w: 0.9, name: 'Special Interest', desc: 'The next snake type you kill takes 35% more damage from you, all run.', apply(p) { p.special = true; } },
  patroon: { w: 0.9, name: 'Patroonherkenning', desc: 'See every spit path. Every 5th hit on the same snake crits.', apply(p) { p.patroon = true; } },
  fidget: { w: 0.9, name: 'Fidget Spinner', desc: 'A spinner circles you. The faster you move, the harder it cuts.', apply(p) { p.fidget = { a: 0, cd: 0, x: p.x, y: p.y }; } },
  deken: { w: 0.8, name: 'Verzwaringsdeken', desc: 'Every 2nd room cleared without a bite heals half an apple.', apply(p) { p.deken = true; p.dekenN = 0; } },
  drone: { w: 0.8, name: 'Drone', desc: 'A drone bombs a snake every 3 seconds.', apply(p) { p.drone = { x: p.x, y: p.y - 30, t: 1.5 }; } },
  stofzuiger: { w: 0.8, name: 'Robotstofzuiger', desc: 'A robot vacuum grabs coins, pushes slices your way and bumps into snakes.', apply(p) { p.vac = { x: p.x + 20, y: p.y + 20, a: 0, cd: 0, tx: null, ty: null }; } },
  garantie: { w: 0.9, name: 'Extra Garantie', desc: 'Once per floor, a downgrade bounces off.', apply(p) { p.garantie = true; p.garantieUsed = false; } },
  supermeter: { w: 0.8, name: 'Super Meter', desc: 'Hits charge your Super. Full: next shot is nine piercing seeds in a wide fan.', apply(p) { p.superM = 0; } },
  powercube: { w: 0.9, name: 'Power Cubes', desc: 'Kills sometimes drop a cube: 3% more damage, 1% more speed each, until the next floor.', apply(p) { p.cubes10 = true; } },
  bosje: { w: 0.9, name: 'In De Bosjes', desc: 'Stand still 1 second to hide: nearby snakes slow down, first shot out hits double.', apply(p) { p.bosje = true; } },
  pepernoot: { name: 'Pepernoten', desc: 'Every 5th shot also throws pepernoten that bounce off walls.', apply(p) { p.peper = true; p.peperN = 0; } },
  clownneus: { lock: 'honk', w: 0.8, name: 'Clown Nose', desc: 'Every 7 seconds in a fight you honk: snakes close by stop and take a little damage.', apply(p) { p.neus = true; p.neusT = 4; } },
  ballon: { lock: 'popper', w: 0.8, name: 'Ballonnen', desc: 'Every 6th shot is a slow balloon. It pops, hurting and dazing snakes around it.', apply(p) { p.ballon = true; p.ballonN = 0; } },
  // legendaries
  hypercharge: { rare: true, lock: 'champ', name: 'Hypercharge', desc: 'Every 20 seconds in a fight, for 5 seconds: shoot 40% faster, walk 25% faster, seeds pierce.', apply(p) { p.hyperc = true; p.hypercT = 8; } },
  magnetron: { rare: true, lock: 'tvdone', name: 'Magnetron', desc: 'Every 6 seconds the closest snake cooks for 2 seconds and takes heavy damage. Ding.', apply(p) { p.magnetron = true; p.magT = 3; } },
  inzone: { rare: true, name: 'In De Zone', desc: '6 seconds in a fight without a hit: seeds home in and hit 25% harder until you get bitten.', apply(p) { p.zone = true; p.zoneT = 0; } },
  gasmasker: { rare: true, lock: 'laststop', name: 'Gasmasker', desc: 'Floor gas, smoke and fire do nothing to you. Downgrades half as likely.', apply(p) { p.gasmask = true; } },
  meeuw: { rare: true, lock: 'gap', name: 'Meeuwenzwerm', desc: 'Every 4 seconds a seagull dives at a snake for a big bite. Sometimes drops a fry.', apply(p) { p.meeuw = { t: 2, birds: [0, 2.1, 4.2] }; } },
  beker: { rare: true, lock: 'bosshunter', name: 'Kampioensbeker', desc: 'Every boss you beat: 10% more damage, half an apple more health.', apply(p) { p.beker = true; } },
  reuzenkracht: { rare: true, lock: 'calm', name: 'Reuzenkracht', desc: 'At one apple or less: 6 seconds of double damage, bigger seeds, knockback. Once per room.', apply(p) { p.reus = true; p.reusUsed = false; } },
};
for (const id in V10_ITEMS) { ITEMS[id] = V10_ITEMS[id]; ITEM_IDS.push(id); }
Object.assign(SELL, {
  assseed: 6, skyrain: 7, flap: 3, vitamine: 3, puntje: 4, elastiek: 4, verrekijker: 3, dikkepit: 4, gympies: 3, vliegenmepper: 5, kaasschaaf: 6, rodestip: 5,
  knoflook: 4, tulp: 4, paraplu: 5, helm: 5, nicotine: 4, peuk: 5, rookgordijn: 5, koptelefoon: 5, hyperfocus: 6, special: 6, patroon: 5, fidget: 5, deken: 4,
  drone: 6, stofzuiger: 5, garantie: 5, supermeter: 7, powercube: 6, bosje: 5, pepernoot: 4, clownneus: 5, ballon: 5,
  hypercharge: 13, magnetron: 13, inzone: 12, gasmasker: 11, meeuw: 12, beker: 12, reuzenkracht: 12,
});
// runtime counters that a sale must not touch
for (const k of ['skyN', 'mepN', 'garlicT', 'helmUp', 'patchT', 'hyperT', 'hyperN', 'specialKind', 'dekenN', 'garantieUsed', 'superReady', 'cubeN', 'hidden10', 'hiddenShot',
  'hideCd', 'peperN', 'neusT', 'ballonN', 'hypercT', 'hypercOn', 'magT', 'zoneT', 'inZone', 'bekerN', 'reusUsed', 'reusT', 'coughT', 'coughing', 'chainT', 'flyT', 'tapDash']) SELL_SKIP.add(k);

/* ------------------------------------------------------------------ new downgrades and curses */
const V10_DOWNS = {
  tinypit: { down: true, name: 'Mini Pitje', desc: 'Seeds are 12% smaller. Small pit, small problem.', mod: { size: 0.88 } },
  kortadem: { down: true, name: 'Korte Adem', desc: 'Seeds fly 15% less far. Out of breath.', mod: { range: 0.85 } },
  natlont: { down: true, name: 'Natte Lont', desc: 'Seeds fly 12% slower. Wet fuse.', mod: { shot: 0.88 } },
  dunschil: { down: true, name: 'Dunne Schil', desc: 'After a bite you blink for a shorter time, so the next bite can come sooner. Thin skin.', flag: 'thin' },
  hoest: { down: true, name: 'Rokershoest', desc: 'Every 12 seconds in a fight you cough and cannot shoot for 0.5 second. Smoker cough.', flag: 'cough' },
  deuk: { down: true, name: 'Deukje', desc: 'You walk 5% slower and seeds hit 5% softer. Minor damage, everywhere.', mod: { speed: 0.95, dmg: 0.95 } },
  lek: { down: true, name: 'Lekke Portemonnee', desc: 'Every new room you walk into, a coin might fall out. Check your pockets.', flag: 'leaky' },
  maandag: { down: true, name: 'Maandagochtend', desc: 'Snakes wake up faster. You shoot 20% slower for the first 3 seconds of every fight. Monday morning.', flag: 'monday' },
};
for (const id in V10_DOWNS) { DOWNS[id] = V10_DOWNS[id]; DOWN_IDS.push(id); }
const V10_CURSES = {
  ketting: { curse: true, name: 'Kettingroker', desc: 'You shoot 25% faster. Every 15 seconds in a fight you cough for 1 second and cannot shoot. Chain smoker.', mod: { rate: 0.8 }, flag: 'chain' },
  glimlach: { curse: true, name: 'Eeuwige Glimlach', desc: 'Snakes drop 50% more coins. A Killer-Clownsnake can turn up in any fight. Keep smiling.', flag: 'clownbait' },
  woede: { curse: true, name: 'Woedeaanval', desc: 'Seeds hit 40% harder. Rage worms find you a lot more often. Anger pays, and bills.', mod: { dmg: 1.4 }, flag: 'rage' },
  hyperactief: { curse: true, name: 'Hyperactief', desc: 'You walk 25% faster and shoot 15% faster. Your aim never sits still. Cannot stop.', mod: { speed: 1.25, rate: 0.87, sway: 0.12 } },
  uitverkoop: { curse: true, name: 'Uitverkoop', desc: 'Everything in shops costs 50% less. Every powerup you buy comes with a downgrade. Sale, no returns.', flag: 'sale' },
};
for (const id in V10_CURSES) { CURSES[id] = V10_CURSES[id]; CURSE_IDS.push(id); }

/* ------------------------------------------------------------------ what they do: the apple's numbers */
{
  const init0 = initPlayer9;
  initPlayer9 = function (P, C) {
    init0(P, C);
    P.flyer = !!C.flyer; P.flyT = 0; P.tapDash = !!C.dash;
    if (C.dash) { P.dash = true; P.dashCd = 0; }
    P.ass10 = null; P.skyrain = false; P.skyN = 0; P.mepper = false; P.mepN = 0; P.schaaf = false; P.redDot = false;
    P.knoflook = false; P.garlicT = 0; P.tulp = false; P.paraplu = false; P.helm = false; P.helmUp = false; P.patch = false; P.patchT = 0;
    P.peuk = false; P.rookgordijn = false; P.koptelefoon = false; P.hyper = false; P.hyperT = null; P.hyperN = 0; P.special = false; P.specialKind = null;
    P.patroon = false; P.fidget = null; P.deken = false; P.dekenN = 0; P.drone = null; P.vac = null; P.garantie = false; P.garantieUsed = false;
    P.superM = null; P.superReady = false; P.cubes10 = false; P.cubeN = 0; P.bosje = false; P.hidden10 = 0; P.hiddenShot = false; P.hideCd = 0;
    P.peper = false; P.peperN = 0; P.neus = false; P.neusT = 4; P.ballon = false; P.ballonN = 0;
    P.hyperc = false; P.hypercT = 8; P.hypercOn = 0; P.magnetron = false; P.magT = 3; P.zone = false; P.zoneT = 0; P.inZone = false;
    P.gasmask = false; P.meeuw = null; P.beker = false; P.bekerN = 0; P.reus = false; P.reusUsed = false; P.reusT = 0;
    P.coughT = 12; P.coughing = 0; P.chainT = 15;
  };
}
{
  const sp0 = speedK9;
  speedK9 = function (P, room) {
    let k = sp0(P, room);
    if (P.koptelefoon) { if (P.flags.cold && room.locked && P.fightT < 3) k /= 0.75 / 0.88; if (P.syrupT > 0) k *= 0.8 / 0.6; }
    if (P.hypercOn > 0) k *= 1.25;
    if (P.cubeN) k *= 1 + 0.01 * P.cubeN;
    if (room.smog10 && room.locked) k *= 0.92;
    return k;
  };
  const rt0 = rateK9;
  rateK9 = function (P) {
    let k = rt0(P);
    if (P.hypercOn > 0) k *= 0.714;
    if (P.flags && P.flags.monday && G.room && G.room.locked && (P.fightT || 0) < 3) k *= 1.25;
    return k;
  };
  const dm0 = dmgK9;
  dmgK9 = function (P) {
    let k = dm0(P);
    if (P.cubeN) k *= 1 + 0.03 * P.cubeN;
    if (P.inZone) k *= 1.25;
    if (P.bekerN) k *= 1 + 0.1 * P.bekerN;
    if (P.reusT > 0) k *= 2;
    return k;
  };
  const ss0 = snakeSpeed9;
  snakeSpeed9 = function (sn, P) {
    let k = ss0(sn, P);
    if (P && P.hidden10 >= 1 && !sn.isBoss && dist2(sn.x, sn.y, P.x, P.y) < 160 * 160) k *= 0.7;
    return k;
  };
}
// hits on snakes: streaks, crits, special interests and the bosses' own rules
{
  const hm0 = hurtMod9;
  hurtMod9 = function (sn, amount, fx, fy, isPoison) {
    amount = hm0(sn, amount, fx, fy, isPoison);
    const P = G.player;
    if (!P) return amount;
    if (P.specialKind && sn.kind === P.specialKind) amount *= 1.35;
    const s = SEED10.s;
    if (s && !isPoison) {
      if (P.hyper) {
        if (P.hyperT === sn) P.hyperN = Math.min(10, P.hyperN + 1); else { P.hyperT = sn; P.hyperN = 0; }
        amount *= 1 + 0.06 * P.hyperN;
      }
      let crit = false;
      if (P.redDot && !sn.redHit10) { sn.redHit10 = true; crit = !s.crit; }
      if (P.patroon) { sn.patN10 = (sn.patN10 || 0) + 1; if (sn.patN10 % 5 === 0 && !s.crit) crit = true; }
      if (crit) { amount *= 3; burst(fx, fy, 8, '#ffd84a', { min: 40, max: 130, lmin: 0.25, lmax: 0.5, glow: true }); floatText(fx, fy - 10, 'CRIT', '#ffd84a'); }
      if (s.reus10 && !sn.isBoss && sn.alive) { const a = Math.atan2(sn.y - P.y, sn.x - P.x); for (let i = 0; i < 4; i++) { const nx = sn.x + Math.cos(a) * 4, ny = sn.y + Math.sin(a) * 4; if (!freeAt(G.room, nx, ny, sn.headR * 0.7)) break; sn.moveTo(nx, ny); } }
    }
    if (HURT10[sn.kind]) amount = HURT10[sn.kind](sn, amount, fx, fy, isPoison);
    return amount;
  };
}
const HURT10 = {};

/* ------------------------------------------------------------------ shooting */
{
  const pf0 = preFire9;
  preFire9 = function (P) {
    P.hiddenShot = P.bosje && P.hidden10 >= 1;
    return pf0(P);
  };
  const sd0 = seed9;
  seed9 = function (P, s, o) {
    sd0(P, s, o);
    if (!o.inherit) return;
    if (P.hiddenShot) { s.dmg *= 2; s.hide10 = true; s.glow = true; }
    if (P.hypercOn > 0) { s.pierce = true; s.look9 = ['#4a1a6a', '#e8b0ff', '#c86aff']; }
    if (P.inZone) s.home = true;
    if (P.reusT > 0) { s.size *= 1.25; s.reus10 = true; s.look9 = ['#6a1a0a', '#ffb090', '#ff6a3a']; }
  };
  const fr0 = fire9;
  fire9 = function (P, base) {
    fr0(P, base);
    const room = G.room; if (!room) return;
    room.noise10 = { x: P.x, y: P.y, t: G.t }; room.shots10 = (room.shots10 || 0) + 1;
    if (P.hiddenShot) { P.hiddenShot = false; P.hidden10 = 0; P.hideCd = 1.2; floatText(P.x, P.y - 30, 'GOTCHA', '#9be37a'); }
    if (P.skyrain && ++P.skyN % 2 === 0) skyRain10(P, room, base);
    if (P.ass10 && ++P.ass10.n % 6 === 0) {
      makeSeed(P, P.ass10.x, P.ass10.y, base + Math.PI, { mult: 0.7, size: 0.85 });
      Sfx.tone(120, 0.12, { to: 70, type: 'sawtooth', vol: 0.04, lp: 500 });
      burst(P.ass10.x, P.ass10.y, 4, '#d8d0b8', { kind: 'bubble', min: 10, max: 40, lmin: 0.3, lmax: 0.5 });
    }
    if (P.mepper && ++P.mepN % 8 === 0) swat10(P, room, base);
    if (P.peper && ++P.peperN % 5 === 0) {
      for (let i = 0; i < 5; i++) {
        const s = makeSeed(P, P.x + Math.cos(base) * 8, P.y + Math.sin(base) * 8 - 2, base + rnd(-0.6, 0.6), { mult: 0.35, size: 0.55, noCan: true });
        s.bounce = 1; s.life *= 0.8; s.look9 = ['#6a3a14', '#e8b070', '#d89a50']; s.pierce = false; s.split = false; s.boom = false; s.fizzy = false;
      }
    }
    if (P.ballon && ++P.ballonN % 6 === 0) fx10(room).pballs.push({ x: P.x + Math.cos(base) * 14, y: P.y + Math.sin(base) * 14, vx: Math.cos(base) * 70, vy: Math.sin(base) * 70, t: 0, life: 3.2, col: pick(BALLOON_COLS10), seed: rnd(10) });
    if (P.superReady) { P.superReady = false; P.superM = 0; superShot10(P, base); }
  };
  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    const P = G.player; if (!P) return;
    if (P.peuk && !sn.K.fireproof && Math.random() < 1 / 3) sn.burn = Math.max(sn.burn, 2);
    if (P.schaaf && sn.canBeHit() && !s.child) { const ex = Math.max(0.12, sn.hp * (sn.isBoss ? 0.02 : 0.03)); sn.hurt(ex, s.x, s.y, true); }
    if (P.superM != null && !P.superReady && !s.child) {
      P.superM = Math.min(1, P.superM + 1 / 26);
      if (P.superM >= 1) { P.superReady = true; floatText(P.x, P.y - 34, 'SUPER READY', '#ffd84a', true); Sfx.ping(); }
    }
  };
}
// the spot you aim at: the mouse, or the snake in front of you, or a little way ahead
function aimSpot10(P, room, base) {
  if (!Input.touchMode && Input.mouse.down) {
    const s = View.s || 1;
    const x = (Input.mouse.x - View.ox) / s - WALL, y = (Input.mouse.y - View.oy) / s - WALL;
    return { x: clamp(x, 10, RW - 10), y: clamp(y, 10, RH - 10) };
  }
  let best = null, bd = 0.42;
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    const d = dist(sn.x, sn.y, P.x, P.y); if (d > 420) continue;
    const df = Math.abs(angDiff(base, Math.atan2(sn.y - P.y, sn.x - P.x)));
    if (df < bd) { bd = df; best = sn; }
  }
  if (best) return { x: best.x + Math.cos(best.ang) * 14, y: best.y + Math.sin(best.ang) * 14 };
  return { x: clamp(P.x + Math.cos(base) * 150, 10, RW - 10), y: clamp(P.y + Math.sin(base) * 150, 10, RH - 10) };
}
function skyRain10(P, room, base) {
  const p = aimSpot10(P, room, base);
  G.strikes.push({ x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), t: 0, dmg: seedDmg(P) * 0.9 });
}
function swat10(P, room, base) {
  for (const sn of room.snakes) {
    if (!sn.canBeHit() || sn.burrowed) continue;
    const d = dist(sn.x, sn.y, P.x, P.y);
    if (d > 74 + sn.headR || Math.abs(angDiff(base, Math.atan2(sn.y - P.y, sn.x - P.x))) > 1.05) continue;
    sn.hurt(seedDmg(P) * 1.5, sn.x, sn.y); sn.stagger = Math.max(sn.stagger, 0.4);
    if (!sn.isBoss) { const a = Math.atan2(sn.y - P.y, sn.x - P.x); for (let i = 0; i < 6; i++) { const nx = sn.x + Math.cos(a) * 4, ny = sn.y + Math.sin(a) * 4; if (!freeAt(room, nx, ny, sn.headR * 0.7)) break; sn.moveTo(nx, ny); } }
  }
  for (let i = G.venom.length - 1; i >= 0; i--) { const v = G.venom[i]; if (v.friendly) continue; if (dist(v.x, v.y, P.x, P.y) < 74 && Math.abs(angDiff(base, Math.atan2(v.y - P.y, v.x - P.x))) < 1.05) G.venom.splice(i, 1); }
  addP({ kind: 'ring', x: P.x + Math.cos(base) * 34, y: P.y + Math.sin(base) * 34, vx: Math.cos(base) * 80, vy: Math.sin(base) * 80, r: 14, life: 0.25, col: '#e8f0ff', drag: 0 });
  floatText(P.x + Math.cos(base) * 30, P.y + Math.sin(base) * 30 - 12, 'MEP', '#e8f0ff');
  Sfx.tone(300, 0.08, { to: 120, type: 'triangle', vol: 0.06 }); Sfx.noise(0.08, { f: 2000, vol: 0.05 });
}
function superShot10(P, base) {
  for (let i = 0; i < 9; i++) {
    const a = base + (i - 4) * 0.13;
    const s = makeSeed(P, P.x + Math.cos(a) * 10, P.y + Math.sin(a) * 10 - 2, a, { mult: 1.2, size: 1.25 });
    s.pierce = true; s.look9 = ['#6a4a00', '#fff2a0', '#ffd84a']; s.glow = true;
  }
  floatText(P.x, P.y - 34, 'SUPER', '#ffd84a', true);
  Sfx.boost(); G.shake = Math.max(G.shake, 4); flashLight(P.x, P.y, 120, 0.8, 0.4);
}

/* ------------------------------------------------------------------ getting bitten */
{
  const hurt0 = Player.prototype.hurt;
  Player.prototype.hurt = function (n, sx, sy, src) {
    const P = this;
    const open = !(P.inv > 0 || P.dashT > 0 || P.dying > 0 || P.escaping > 0 || G.state !== 'play');
    if (open && P.helmUp) {
      P.helmUp = false; P.inv = 0.9; P.squash = 0.6;
      floatText(P.x, P.y - 26, 'HELM', '#9fd8ff', true); Sfx.clank(); G.shake = Math.max(G.shake, 3);
      burst(P.x, P.y - 8, 10, '#9fd8ff', { kind: 'shard', min: 40, max: 120, lmin: 0.3, lmax: 0.6 });
      return true;
    }
    const hp0 = P.hp;
    const r = hurt0.call(this, n, sx, sy, src);
    if (open && r) {
      P.zoneT = 0; if (P.inZone) { P.inZone = false; floatText(P.x, P.y - 36, 'OUT OF THE ZONE', '#c8c0d8'); }
      if (P.koptelefoon) { P.kbx = 0; P.kby = 0; }
    }
    const lost = hp0 - P.hp;
    if (lost > 0) bitten10(P, lost, sx, sy, src);
    return r;
  };
}
function bitten10(P, lost, sx, sy, src) {
  const room = G.room;
  if (P.flags.thin) P.inv = Math.min(P.inv, 0.68);
  if (P.rookgordijn && room) { fx10(room).zones.push({ kind: 'smoke', x: P.x, y: P.y, r: 16, rMax: 66, t: 0, life: 3.2 }); Sfx.puff(); }
  if (P.reus && !P.reusUsed && P.hp > 0 && P.hp <= 2) {
    P.reusUsed = true; P.reusT = 6;
    UI.banner('Reuzenkracht', 'You are really angry now. Six seconds.', 'legend');
    G.shake = Math.max(G.shake, 8); Sfx.roar(); flashLight(P.x, P.y, 160, 0.9, 0.5);
  }
  jaudeBite10(P, lost);
}

/* ------------------------------------------------------------------ every frame: helpers and timers */
{
  const up0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) { up0(P, dt, room, sp); updatePlayer10(P, dt, room, sp); };
}
function updatePlayer10(P, dt, room, sp) {
  const fight = fighting10(room);
  if (P.koptelefoon && P.rootT > 0.3) P.rootT = 0.3;
  if (P.hideCd > 0) P.hideCd -= dt;
  // In De Bosjes
  if (P.bosje) {
    if (P.stillT > 1 && P.hideCd <= 0 && room.locked) { if (P.hidden10 < 1) { P.hidden10 = 1; floatText(P.x, P.y - 28, 'HIDDEN', '#9be37a'); } }
    else if (P.stillT <= 0.05) P.hidden10 = 0;
  }
  // Ass-seed hangs behind you, away from where you aim
  if (P.ass10) {
    const a = P.ass10, tx = P.x - P.aimX * 20, ty = P.y - P.aimY * 18 + 4, k = Math.min(1, dt * 10);
    a.x += (tx - a.x) * k; a.y += (ty - a.y) * k;
    a.cd -= dt;
    for (let i = G.venom.length - 1; i >= 0; i--) { const v = G.venom[i]; if (!v.friendly && dist2(v.x, v.y, a.x, a.y) < 10 * 10) { burst(v.x, v.y, 4, v.col, { min: 20, max: 60, lmin: 0.2, lmax: 0.4, glow: true }); G.venom.splice(i, 1); } }
    if (a.cd <= 0) for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(a.x, a.y, 6)) { sn.hurt(seedDmg(P) * 0.6 + 0.3, a.x, a.y); a.cd = 0.3; break; }
  }
  if (P.fidget) {
    const f = P.fidget, w = 2.4 + Math.min(1.6, sp / 90) * 4;
    f.a += dt * w; f.x = P.x + Math.cos(f.a) * 30; f.y = P.y + Math.sin(f.a) * 27;
    f.cd -= dt;
    if (f.cd <= 0) for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(f.x, f.y, 6)) { sn.hurt((0.45 + P.dmg * 0.35) * (0.6 + Math.min(1.4, sp / 110)), f.x, f.y); f.cd = 0.25; break; }
  }
  if (P.knoflook && fight) {
    P.garlicT -= dt;
    if (P.garlicT <= 0) {
      P.garlicT = 0.5;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && dist(sn.x, sn.y, P.x, P.y) < 46 + sn.headR) { sn.hurt(0.3 + P.dmg * 0.15, sn.x, sn.y, true); if (Math.random() < 0.3) burst(sn.x, sn.y, 3, '#e8f0c8', { min: 10, max: 40, lmin: 0.3, lmax: 0.5 }); }
    }
  }
  if (P.patch && fight) {
    P.patchT += dt;
    if (P.patchT >= 40) { P.patchT = 0; if (P.heal(1)) floatText(P.x, P.y - 30, '+1', '#f2c8a0'); }
  }
  if (P.drone) {
    const d = P.drone, k = Math.min(1, dt * 4);
    d.x += (P.x + 18 - d.x) * k; d.y += (P.y - 34 + Math.sin(G.t * 3) * 3 - d.y) * k;
    if (fight) {
      d.t -= dt;
      if (d.t <= 0) {
        const tg = nearSnake10(room, d.x, d.y, 360);
        d.t = tg ? 3 : 0.5;
        if (tg) { G.strikes.push({ x: tg.x + rnd(-4, 4), y: tg.y + rnd(-4, 4), t: 0.1, dmg: seedDmg(P) * 1.3 }); Sfx.tone(1400, 0.06, { to: 900, type: 'square', vol: 0.02, lp: 3000 }); }
      }
    }
  }
  if (P.vac) updateVac10(P, dt, room);
  if (P.meeuw) { updateGulls10(P, dt, room, fight); updateGullDive10(P, dt, room); }
  if (P.hyperc && fight) {
    if (P.hypercOn > 0) { P.hypercOn -= dt; if (Math.random() < dt * 30) addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y + rnd(-8, 8), vx: rnd(-20, 20), vy: rnd(-40, -10), r: rnd(1, 2), life: 0.4, col: '#c86aff', glow: true, drag: 2 }); }
    else { P.hypercT -= dt; if (P.hypercT <= 0) { P.hypercT = 20; P.hypercOn = 5; floatText(P.x, P.y - 34, 'HYPERCHARGE', '#c86aff', true); Sfx.boost(); Sfx.ping(); flashLight(P.x, P.y, 140, 0.8, 0.5); } }
  }
  if (P.magnetron && fight) {
    P.magT -= dt;
    if (P.magT <= 0) {
      const tg = nearSnake10(room, P.x, P.y, 300);
      P.magT = tg ? 6 : 1;
      if (tg) { tg.cook10 = 2; tg.cookD10 = seedDmg(P) * (tg.isBoss ? 3 : 5); floatText(tg.x, tg.y - 26, 'PING', '#ffe7a0', true); Sfx.ping(); }
    }
  }
  if (P.zone) {
    if (fight) { P.zoneT += dt; if (!P.inZone && P.zoneT >= 6) { P.inZone = true; floatText(P.x, P.y - 34, 'IN THE ZONE', '#7cd0ff', true); Sfx.ping(); } }
  }
  if (P.reusT > 0) { P.reusT -= dt; if (Math.random() < dt * 20) addP({ kind: 'dot', x: P.x + rnd(-10, 10), y: P.y - 10 + rnd(-6, 6), vx: rnd(-10, 10), vy: rnd(-50, -30), r: rnd(1.2, 2.4), life: 0.5, col: '#ff8a5a', drag: 1 }); }
  if (P.neus && fight) {
    P.neusT -= dt;
    if (P.neusT <= 0) {
      P.neusT = 7;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(P.x, P.y, 120)) { sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.35 : 0.9); sn.hurt(0.8 + P.dmg * 0.4, sn.x, sn.y); if (Math.random() < 0.5) floatText(sn.x, sn.y - 18, 'HAHA', '#ff8ab0'); }
      floatText(P.x, P.y - 32, 'HONK', '#ff5a7a', true); Sfx.horn10(); ring10(P.x, P.y, 12, '#ff5a7a', 0.45);
    }
  }
  // coughing: a downgrade and a curse
  if (P.coughing > 0) { P.coughing -= dt; P.cool = Math.max(P.cool, 0.05); if (Math.random() < dt * 8) addP({ kind: 'dot', x: P.x + rnd(-5, 5), y: P.y - 6, vx: rnd(-20, 20), vy: rnd(-30, -10), r: rnd(2, 3.5), life: 0.7, col: '#9a9aa0', drag: 2 }); }
  if (fight && P.flags.cough) { P.coughT -= dt; if (P.coughT <= 0) { P.coughT = 12; P.coughing = 0.5; floatText(P.x, P.y - 26, 'KUCH', '#c8c8d0'); Sfx.cough10(); } }
  if (fight && P.flags.chain) { P.chainT -= dt; if (P.chainT <= 0) { P.chainT = 15; P.coughing = 1; floatText(P.x, P.y - 26, 'KUCH KUCH', '#c8c8d0'); Sfx.cough10(); } }
}
// the robot vacuum: coins first, then it bumps into snakes
function updateVac10(P, dt, room) {
  const v = P.vac;
  let tx = P.x + 26, ty = P.y + 18, target = null, bd = 1e12;
  for (const p of room.pickups) {
    if (p.kind !== 'coin' && p.kind !== 'heart') continue;
    if (p.cost) continue;
    const d = dist2(p.x, p.y, v.x, v.y); if (d < bd) { bd = d; target = p; }
  }
  const sn = target ? null : (fighting10(room) ? nearSnake10(room, v.x, v.y, 300) : null);
  if (target) { tx = target.x; ty = target.y; } else if (sn) { tx = sn.x; ty = sn.y; }
  const a = Math.atan2(ty - v.y, tx - v.x), d = Math.hypot(tx - v.x, ty - v.y);
  v.a = turnToward(v.a, a, dt * 5);
  const spd = target || sn ? 120 : Math.min(120, d * 2);
  let nx = v.x + Math.cos(v.a) * spd * dt, ny = v.y + Math.sin(v.a) * spd * dt;
  [nx, ny] = resolveTiles(room, nx, ny, 8);
  v.x = clamp(nx, 10, RW - 10); v.y = clamp(ny, 10, RH - 10);
  v.cd -= dt;
  if (target && dist(v.x, v.y, target.x, target.y) < 12) {
    if (target.kind === 'coin') {
      G.run.coins++; G.run.coinsGot = (G.run.coinsGot || 0) + 1; Meta.add('coins'); Sfx.coin();
      room.pickups.splice(room.pickups.indexOf(target), 1);
    } else { const k = Math.atan2(P.y - target.y, P.x - target.x); target.vx = Math.cos(k) * 240; target.vy = Math.sin(k) * 240; target.t = Math.max(target.t, 0.3); }
  }
  if (sn && v.cd <= 0 && sn.hitTest(v.x, v.y, 9)) { sn.hurt(1 + P.dmg * 0.4, v.x, v.y); sn.stagger = Math.max(sn.stagger, 0.2); v.cd = 0.6; Sfx.clank(); }
}
// the seagulls: they circle, then one dives
function updateGulls10(P, dt, room, fight) {
  const m = P.meeuw;
  m.ph = (m.ph || 0) + dt;
  if (!fight) return;
  m.t -= dt;
  if (m.t > 0 || m.dive) return;
  const tg = nearSnake10(room, P.x, P.y, 380);
  if (!tg) { m.t = 0.5; return; }
  m.t = 4;
  const sx = P.x + rnd(-40, 40), sy = P.y - 60;
  m.dive = { x0: sx, y0: sy, tg, t: 0 };
  Sfx.gull10();
}
function updateGullDive10(P, dt, room) {
  const m = P.meeuw; if (!m || !m.dive) return;
  const d = m.dive; d.t += dt;
  if (d.t < 0.45) return;
  m.dive = null;
  const tg = d.tg;
  if (!tg || !tg.canBeHit()) return;
  tg.hurt(seedDmg(P) * 2.2 + 1, tg.x, tg.y);
  burst(tg.x, tg.y, 10, '#f2f2f2', { kind: 'shard', min: 40, max: 120, lmin: 0.3, lmax: 0.6 });
  floatText(tg.x, tg.y - 22, 'MEEUW', '#f2f2f2', true);
  if (Math.random() < 0.18) dropHeart(room, tg.x, tg.y, 1);
}

/* ------------------------------------------------------------------ kills, rooms, floors */
{
  const ok0 = onKill9;
  onKill9 = function (sn, room, P) {
    ok0(sn, room, P);
    if (!P) return;
    if (P.special && !P.specialKind && !sn.isBoss && KINDS[sn.kind]) { P.specialKind = sn.kind; floatText(P.x, P.y - 40, `SPECIAL INTEREST: ${KINDS[sn.kind].name.toUpperCase()}`, '#7cd0ff', true); Sfx.ping(); }
    if (P.hyperT === sn) { P.hyperT = null; P.hyperN = 0; }
    if (P.tulp && Math.random() < 1 / 8) room.pickups.push({ kind: 'tulip10', x: sn.x, y: sn.y, t: 0, life: 22, ph: rnd(10), col: pick(['#e83a50', '#ffb43a', '#f2e24a', '#e86ac0']) });
    if (P.cubes10 && Math.random() < 0.15) { const a = rnd(TAU); room.pickups.push({ kind: 'cube10', x: sn.x, y: sn.y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, t: 0, life: 14, ph: rnd(10) }); }
    if (P.flags.clownbait && Math.random() < 0.5) dropCoins(room, sn.x, sn.y, 1);
    onKill10(sn, room, P);
  };
  const fl0 = floor9;
  floor9 = function (P) { fl0(P); P.helmUp = !!P.helm; P.garantieUsed = false; if (P.cubeN) P.cubeN = 0; };
  const en0 = enter9;
  enter9 = function (P) {
    en0(P);
    P.reusUsed = false; P.zoneT = 0; P.inZone = false; P.hidden10 = 0; P.coughT = 12; P.chainT = 15; P.coughing = 0;
    if (P.hyperc) P.hypercT = Math.min(P.hypercT, 8);
    if (P.flags.leaky && G.run && G.run.coins > 0 && G.room && !G.room.visited10 && Math.random() < 0.35) { G.run.coins--; setTimeout(() => { if (G.state === 'play') floatText(P.x, P.y - 28, '-1', '#ffd84a'); }, 400); }
    if (G.room) G.room.visited10 = true;
  };
}
// a downgrade that bounces off: the warranty and the gas mask
{
  const gd0 = giveDown;
  giveDown = function (id) {
    const P = G.player;
    if (P && P.garantie && !P.garantieUsed && P.dying <= 0) {
      P.garantieUsed = true;
      UI.banner('Covered by warranty', 'That downgrade bounced right off. Once per floor.', 'clean');
      floatText(P.x, P.y - 30, 'GARANTIE', '#9fe8ff', true); Sfx.cleanse();
      return false;
    }
    return gd0(id);
  };
  const rd0 = rollDown;
  rollDown = function (room) {
    const P = G.player;
    if (P && P.gasmask && Math.random() < 0.5) return;
    return rd0(room);
  };
}
// Uitverkoop: half price, and every powerup you buy comes with a downgrade
{
  const pr0 = priceOf;
  priceOf = function (p) {
    let c = pr0(p);
    const P = G.player;
    if (P && P.flags && P.flags.sale) c = Math.max(1, Math.ceil(c * 0.5));
    return c;
  };
}

