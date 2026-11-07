/* src/30-v91-texts.js: v9.1: Texts, every name and line in one editable texts file. From v9.1. Lines 15774 to 16933 of the v13.7 script. */
/* =====================================================================
   Version 9.1: every name and line in one editable texts file.
   Download it from Settings, change it in any text editor, load it back.
   Popups and messages can hold several options: the game picks one.
   ===================================================================== */
const TEXT_LIT9 = {"popups": ["MISS", "STROOP", "YUZU", "FULL", "CRIT", "1+1 GRATIS", "VERWORPEN", "AANGENOMEN", "+1", "LINE CLEAR", "GOAL!", "KABOOM", "!!", "UP", "WIND", "MOTIE AANGENOMEN", "ORDER", "KORTING", "DEAL", "BONUS", "OP = OP", "QUORUM", "WORMEN EERST", "DOWNGRADE", "THE ROT STAYS", "ROT", "NO ROOM FOR MORE ROT", "POP", "CURSED", "A KEY", "REROLL", "SPROUT", "POEDER", "ACHOO", "JACKPOT", "PRIZE", "PAYOUT", "SNACK", "BUST", "ROTTEN LUCK", "NOTHING", "SPLIT", "BRIL KAPOT", "KOP ERAF", "ALARM", "!", "HEHE", "SLOOP", "drop", "DROP", "DROP II", "MIC DROP", "INSTAPPEN", "OPLADEN", "UITGETROKKEN", "BIJNA LEEG", "ORDE", "-3", "SCHOON", "NIEMAND ZAG IETS", "eiser", "EISER", "GEDAAGDE", "GELADEN", "WIEL VOL", "WHEEK!", "TOETER", "THE DROP", "TRING", "KNIP", "PINDA", "BEZWAAR!", "GLANCE", "BETAALD", "TERUG", "HARING", "GHOSTED", "HEET", "BITTERBAL", "LEKKER", "POPCORN", "MOTIE VAN WANTROUWEN", "REWARD", "DROPPER", "GRAFTED"], "messages": ["Phoenix Seed", "You burst back to life.", "A hidden way", "Something smells rotten in there.", "You are full", "Come back when something has bitten you.", "Not enough coins", "Not enough apples", "You need more than one apple of health to pay.", "VETO", "Everything stops. Get out of there.", "You feel fresher already.", "A vault key", "Somewhere on this floor a vault is barred shut. Walk up to its door.", "Keep it. The next vault you find opens with it.", "Nothing to wash off", "Come back when the rot gets to you.", "Sold out", "Nothing left on the shelves to swap.", "The vault opens", "The key turns. Something glitters in there.", "Barred shut", "A vault. Its key drops in the next fight you win on this floor.", "A vault. Its key hides in something breakable on this floor.", "Out of order", "It already paid out everything it had.", "The spring", "The devil breathes", "Break", "It gets very dark. Watch his eyes.", "He goes back to the decks. Shoot him there.", "Bus gaat 36", "31 pas bus", "Zelfs.", "Hoezo duurt zo lang.", "Hoger beroep", "He is not done with you. Faster now.", "81 weken", "Ik wil jou voor 81 weken niet meer spreken.", "Onder curatele", "Your parents hold your seeds. Half damage for 5 seconds.", "Te laat", "Is te laat om terug te krabbelen nu.", "Boete", "Three coins. Payable at once.", "Orde in de zaal", "Paper everywhere.", "VIP only", "The bass behind the wall is wrong. Very wrong.", "Taakstraf voldaan", "Community service done. The court pays up.", "Leeg", "This pump is empty. Try another one.", "Too thin for that", "You need more health to spare for this tune.", "Klaar", "One cut per visit. It looks great. Really.", "Toegewezen", "The court rules in your favour. Take what you are owed.", "Schadevergoeding", "Ten coins in damages.", "Afgewezen", "The claim is denied. And it costs you.", "Vrijspraak", "Not guilty. You feel lighter.", "Schikking", "A settlement: a snack and four coins.", "Taakstraf", "Community service. Clean up these three.", "Your parents hold your money. You cannot buy anything.", "Curator", "Your parents stepped in. Half an apple left.", "Core Rot", "Half an apple of health rotted away on the way down.", "New record", "The rot went down with the boss.", "Nothing left to eat", "It wants you now", "It lets go", "Ouroboros", "Coalition collapse", "Four parties", "Every party for itself now.", "Survive", "They keep coming. Stay alive until the time runs out.", "Something big", "Gold, angry and twice the size. It guards a good powerup.", "hell", "The hellclub", "club", "The club", "The lair", "BP Tankstation", "Tank at a pump to tune your apple. Sell powerups at the till.", "De kapsalon", "Rechtbank", "Pick a side", "Eiser: a big win or a big loss. Gedaagde: plays it safe.", "The party is over", "Take what he was spinning.", "The devil is down", "For tonight.", "It is down", "It did not belong here either.", "Pick a powerup, then go through the door.", "An offering", "It costs a curse", "It costs one apple", "Take the gift and lose one apple of health for good.", "A pantry", "Somebody hid snacks down here.", "A shop", "Open late. Walk onto something to buy it.", "A vote", "Pick one", "Walk onto a motion. The other one fails.", "A slot machine", "Three coins a pull. Walk into it.", "A spring", "Step in once. It heals and washes off every downgrade.", "Cursed books", "Take one", "Every book holds a powerup and a curse. The others burn.", "The vault", "All of it is yours. Break the gold too.", "Challenge", "Three waves", "Touch the altar to start. Win a powerup.", "A secret room", "The Rot Eater", "Shoot the rotten apples before it eats them.", "Survival", "Hold out", "Through the portal", "The Ender Wyrm", "It builds, it teleports, and it brought creepers.", "It was a mimic", "Kill what came out of it. The chest pays better after.", "Daylight", "A way down", "Walk into the light", "Drop into the hole", "Take what it was guarding.", "You held out", "The rest of them rotted away.", "Prices slashed", "The other one is furious now."]};
const TEXTS_KEY9 = 'bitten.texts.v1';
const TEXT_README9 = [
  'BITTEN TEXTS FILE. Change the text on the right side of every line, keep the left side (the key) exactly as it is.',
  'Load it in the game: Settings, Texts and names, Load texts file. Reset texts puts everything back.',
  'popups, messages and screens: a text, a list of texts, or texts with weights.',
  '  "CRIT": "AU"                         always shows AU',
  '  "CRIT": ["CRIT", "BAM", "AU"]        picks one of the three at random every time',
  '  "CRIT": {"CRIT": 6, "BAM": 2, "": 1} CRIT most of the time, sometimes BAM, and "" means no popup that time',
  'popups are the small words over the action. messages are the banners and big cards. screens are menus and the guide.',
  'story_chat: the lines that pop up while you play a story. Add lines to make it more random. In ONDER CURATELE, A: is Alesen and S: is Senale.',
  'story_scenes: the cutscenes, line by line. "who" is only there to help you, changing it does nothing.',
  'Texts with numbers in them that change (like -12 coins) are not in this file.',
  'The file must stay valid JSON: every text between double quotes, a comma between items. The game also accepts // comments and a comma too many.',
];

/* ------------------------------------------------------------------ picking from a pool */
function normPool9(v) {
  if (typeof v === 'string') return [[v, 1]];
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string').map((x) => [x, 1]);
  if (v && typeof v === 'object') return Object.entries(v).map(([k, w]) => [k, Math.max(0, Number(w) || 0)]).filter((e) => e[1] > 0);
  return null;
}
function pickPool9(p) {
  if (p.length === 1) return p[0][0];
  let tot = 0; for (const e of p) tot += e[1];
  let x = Math.random() * tot;
  for (const e of p) { x -= e[1]; if (x <= 0) return e[0]; }
  return p[p.length - 1][0];
}
// a text as the game shows it right now (random when it has options)
function say9(s) { if (typeof s !== 'string') return s; const p = Texts.pools.get(s); return p && p.length ? pickPool9(p) : s; }
// the same, but stable: for things drawn every frame
function sayF9(s) { if (typeof s !== 'string') return s; const p = Texts.pools.get(s); if (!p || !p.length) return s; let best = p[0]; for (const e of p) if (e[1] > best[1]) best = e; return best[0]; }

/* tolerant reader: plain JSON, plus // comments, /* comments *\/ and trailing commas */
function parseTexts9(raw) {
  raw = String(raw || '').replace(/^﻿/, '');
  try { return JSON.parse(raw); } catch (e) { /* try the forgiving way */ }
  let out = '', i = 0, inStr = false;
  while (i < raw.length) {
    const ch = raw[i], nx = raw[i + 1];
    if (inStr) { out += ch; if (ch === '\\') { out += nx || ''; i += 2; continue; } if (ch === '"') inStr = false; i++; continue; }
    if (ch === '"') { inStr = true; out += ch; i++; continue; }
    if (ch === '/' && nx === '/') { while (i < raw.length && raw[i] !== '\n') i++; continue; }
    if (ch === '/' && nx === '*') { i += 2; while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++; i += 2; continue; }
    out += ch; i++;
  }
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(out);
}

/* ------------------------------------------------------------------ the data the file covers */
function fieldsOf9(obj, fields) { const o = {}; for (const f of fields) if (typeof obj[f] === 'string') o[f] = obj[f]; return o; }
function setFields9(obj, src, fields) { if (!obj || !src || typeof src !== 'object') return; for (const f of fields) if (typeof src[f] === 'string') obj[f] = src[f]; }
function mapOf9(table, ids, fields) { const o = {}; for (const id of ids) if (table[id]) o[id] = fieldsOf9(table[id], fields); return o; }
function applyMap9(table, src, fields) { if (!src || typeof src !== 'object') return; for (const id in src) if (table[id]) setFields9(table[id], src[id], fields); }
function cleanList9(v) {
  if (!Array.isArray(v)) return null;
  return v.map((x) => (Array.isArray(x) ? x.filter((y) => typeof y === 'string') : typeof x === 'string' ? x : null)).filter((x) => x !== null);
}
function setList9(arr, v) { const c = cleanList9(v); if (!c || !c.length) return; arr.length = 0; arr.push(...c); }

const Texts = {
  pools: new Map(),
  raw: { popups: {}, messages: {}, screens: {} },
  dom: [],
  defaults: null,

  boot() {
    this.captureDom();
    this.defaults = this.collect();
    let raw = null;
    try { raw = localStorage.getItem(TEXTS_KEY9); } catch (e) { raw = null; }
    if (raw) { try { this.apply(parseTexts9(raw)); } catch (e) { /* a broken file is ignored */ } }
    this.applyDom();
  },

  // the static words on the screens, as they were written
  captureDom() {
    const root = document.getElementById('app'); if (!root) return;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      const key = n.nodeValue.trim();
      if (!key || key.length < 2) continue;
      const par = n.parentElement;
      if (!par || par.closest('canvas,script,style,svg') || par.id) continue;
      this.dom.push({ n, orig: n.nodeValue, key });
    }
  },
  applyDom() {
    for (const d of this.dom) {
      const lead = d.orig.match(/^\s*/)[0], trail = d.orig.match(/\s*$/)[0];
      d.n.nodeValue = lead + sayF9(d.key) + trail;
    }
  },

  lists() {
    const L = TEXT_LIT9 || { popups: [], messages: [] };
    const screens = [];
    const seen = new Set();
    for (const d of this.dom) if (!seen.has(d.key)) { seen.add(d.key); screens.push(d.key); }
    return { popups: L.popups, messages: L.messages, screens };
  },

  // everything, as it is now: this is what the downloaded file holds
  collect() {
    const lists = this.lists(), o = { _read_me: TEXT_README9 };
    for (const sec of ['popups', 'messages', 'screens']) {
      o[sec] = {};
      for (const k of lists[sec]) o[sec][k] = this.raw[sec][k] !== undefined ? this.raw[sec][k] : sec === 'popups' ? [k] : k;
      for (const k in this.raw[sec]) if (!(k in o[sec])) o[sec][k] = this.raw[sec][k];
    }
    const itemIds = ITEM_IDS.concat(['golden']);
    o.powerups = mapOf9(ITEMS, itemIds, ['name', 'desc']);
    o.curses = mapOf9(CURSES, CURSE_IDS, ['name', 'desc']);
    o.downgrades = mapOf9(DOWNS, DOWN_IDS, ['name', 'desc']);
    o.snakes = {}; o.bosses = {};
    for (const k in KINDS) {
      if (!KINDS[k].boss) o.snakes[k] = KINDS[k].name;
      else o.bosses[k] = Object.assign({ name: KINDS[k].name }, BOSS_INFO[k] ? fieldsOf9(BOSS_INFO[k], ['title', 'sub']) : {});
    }
    o.coalition_parties = {}; for (const p of PARTIES) o.coalition_parties[p.role] = p.name;
    o.characters = mapOf9(CHARS, CHAR_IDS, ['name', 'desc', 'perk', 'unlock']);
    o.floors = {}; for (const L of LEVELS) o.floors[L.set] = fieldsOf9(L, ['name', 'sub']);
    o.chaos_layers = CHAOS_LAYERS9.map((L) => fieldsOf9(L, ['name', 'sub']));
    o.modes = mapOf9(MODES, MODE_IDS, ['name', 'desc']);
    o.difficulties = mapOf9(DIFFS, DIFF_IDS, ['name', 'desc', 'unlock']);
    o.daily_twists = {}; for (const t of DAILY_TWISTS) o.daily_twists[t.id] = fieldsOf9(t, ['name', 'desc']);
    o.achievements = {}; for (const a of ACHS) o.achievements[a.id] = fieldsOf9(a, ['name', 'desc']);
    o.stats = {}; for (const [k, label] of STAT_DEFS) o.stats[k] = label;
    o.tankstation = {}; for (const p of PUMPS) o.tankstation[p.id] = fieldsOf9(p, ['name', 'desc']);
    o.haircuts = {}; for (const p of CUTS) o.haircuts[p.id] = fieldsOf9(p, ['name', 'desc']);
    o.room_hazards = Object.assign({}, MOD_NAMES);
    o.stories = {}; o.story_chat = {}; o.story_death_lines = {}; o.story_scenes = {};
    for (const id of STORY_ORDER9) {
      const S = STORIES9[id];
      o.stories[id] = {
        title: S.title, tag: S.tag, blurb: S.blurb, win_title: S.winText[0], win_text: S.winText[1], win_button: S.winText[2],
        chapters: S.levels.map((L) => fieldsOf9(L, ['name', 'sub'])),
        bosses: (() => { const b = {}; for (const k in S.boss) b[k] = fieldsOf9(S.boss[k], ['title', 'sub', 'name']); return b; })(),
      };
      o.story_chat[id] = JSON.parse(JSON.stringify(S.chat));
      o.story_death_lines[id] = S.death.slice();
      const sc = {};
      for (const sid in S.script) {
        sc[sid] = S.script[sid].map((b) => {
          const e = { who: b.who === 'cap' ? 'story' : b.who, text: b.text || '' };
          if (b.phone) { e.phone_from = b.phone.from; e.phone = b.phone.msgs.slice(); }
          if (b.post) e.post = b.post.text;
          if (b.tv) { e.tv_head = b.tv.head; e.tv_text = b.tv.text; }
          return e;
        });
      }
      o.story_scenes[id] = sc;
    }
    return o;
  },

  apply(o) {
    if (!o || typeof o !== 'object') return;
    for (const sec of ['popups', 'messages', 'screens']) {
      const src = o[sec]; if (!src || typeof src !== 'object') continue;
      for (const k in src) {
        const p = normPool9(src[k]); if (!p) continue;
        this.raw[sec][k] = src[k];
        const same = p.length === 1 && p[0][0] === k;
        if (same) this.pools.delete(k); else this.pools.set(k, p);
      }
    }
    applyMap9(ITEMS, o.powerups, ['name', 'desc']);
    applyMap9(CURSES, o.curses, ['name', 'desc']);
    applyMap9(DOWNS, o.downgrades, ['name', 'desc']);
    if (o.snakes) for (const k in o.snakes) if (KINDS[k] && typeof o.snakes[k] === 'string') KINDS[k].name = o.snakes[k];
    if (o.bosses) for (const k in o.bosses) {
      const v = o.bosses[k]; if (!v || !KINDS[k]) continue;
      if (typeof v.name === 'string') KINDS[k].name = v.name;
      if (BOSS_INFO[k]) setFields9(BOSS_INFO[k], v, ['title', 'sub']);
    }
    if (o.coalition_parties) for (const p of PARTIES) if (typeof o.coalition_parties[p.role] === 'string') p.name = o.coalition_parties[p.role];
    applyMap9(CHARS, o.characters, ['name', 'desc', 'perk', 'unlock']);
    if (o.floors) for (const L of LEVELS) setFields9(L, o.floors[L.set], ['name', 'sub']);
    if (Array.isArray(o.chaos_layers)) o.chaos_layers.forEach((v, i) => setFields9(CHAOS_LAYERS9[i], v, ['name', 'sub']));
    applyMap9(MODES, o.modes, ['name', 'desc']);
    applyMap9(DIFFS, o.difficulties, ['name', 'desc', 'unlock']);
    if (o.daily_twists) for (const t of DAILY_TWISTS) setFields9(t, o.daily_twists[t.id], ['name', 'desc']);
    if (o.achievements) for (const a of ACHS) setFields9(a, o.achievements[a.id], ['name', 'desc']);
    if (o.stats) for (const row of STAT_DEFS) if (typeof o.stats[row[0]] === 'string') row[1] = o.stats[row[0]];
    if (o.tankstation) for (const p of PUMPS) setFields9(p, o.tankstation[p.id], ['name', 'desc']);
    if (o.haircuts) for (const p of CUTS) setFields9(p, o.haircuts[p.id], ['name', 'desc']);
    if (o.room_hazards) for (const k in o.room_hazards) if (typeof o.room_hazards[k] === 'string') MOD_NAMES[k] = o.room_hazards[k];
    for (const id of STORY_ORDER9) {
      const S = STORIES9[id];
      const st = o.stories && o.stories[id];
      if (st) {
        setFields9(S, st, ['title', 'tag', 'blurb']);
        if (typeof st.win_title === 'string') S.winText[0] = st.win_title;
        if (typeof st.win_text === 'string') S.winText[1] = st.win_text;
        if (typeof st.win_button === 'string') S.winText[2] = st.win_button;
        if (Array.isArray(st.chapters)) st.chapters.forEach((v, i) => setFields9(S.levels[i], v, ['name', 'sub']));
        if (st.bosses) for (const k in st.bosses) setFields9(S.boss[k], st.bosses[k], ['title', 'sub', 'name']);
      }
      const ch = o.story_chat && o.story_chat[id];
      if (ch && typeof ch === 'object') for (const k in ch) { const c = cleanList9(ch[k]); if (c && c.length) S.chat[k] = c; }
      const dl = o.story_death_lines && o.story_death_lines[id];
      if (dl) setList9(S.death, dl);
      const sc = o.story_scenes && o.story_scenes[id];
      if (sc) for (const sid in sc) {
        const beats = S.script[sid], src = sc[sid];
        if (!beats || !Array.isArray(src)) continue;
        src.forEach((e, i) => {
          const b = beats[i]; if (!b || e == null) return;
          if (typeof e === 'string') { b.text = e; return; }
          if (typeof e.text === 'string') b.text = e.text;
          if (b.phone) { if (typeof e.phone_from === 'string') b.phone.from = e.phone_from; const m = cleanList9(e.phone); if (m && m.length) b.phone.msgs = m.filter((x) => typeof x === 'string'); }
          if (b.post && typeof e.post === 'string') b.post.text = e.post;
          if (b.tv) { if (typeof e.tv_head === 'string') b.tv.head = e.tv_head; if (typeof e.tv_text === 'string') b.tv.text = e.tv_text; }
        });
      }
    }
  },

  // back to how the game shipped, then the file on top
  reload(o) {
    this.pools.clear(); this.raw = { popups: {}, messages: {}, screens: {} };
    this.apply(this.defaults);
    this.pools.clear(); this.raw = { popups: {}, messages: {}, screens: {} };
    if (o) this.apply(o);
    this.applyDom();
    try {
      UI.buildItemCards(); UI.buildChars(); UI.buildModes(); UI.buildHowChars9(); UI.refresh();
      if (G.map) for (const r of G.map.rooms) r.dirty = true;
    } catch (e) { /* the screens rebuild on the next open anyway */ }
  },
};

/* ------------------------------------------------------------------ Settings: the texts box */
(() => {
  const init0 = UI.init;
  UI.init = function () {
    init0.call(this);
    for (const id of ['btnTextsDl', 'btnTextsUp', 'btnTextsReset', 'textsFile', 'textsMsg']) this.el[id] = document.getElementById(id);
    const on = (id, fn) => { if (this.el[id]) this.el[id].addEventListener('click', (e) => { e.preventDefault(); fn(); }); };
    on('btnTextsDl', () => this.downloadTexts());
    on('btnTextsUp', () => { this.el.textsFile.value = ''; this.el.textsFile.click(); });
    on('btnTextsReset', () => this.confirm('btnTextsReset', 'Tap again to reset', 'Reset texts', () => {
      try { localStorage.removeItem(TEXTS_KEY9); } catch (e) { /* ignore */ }
      Texts.reload(null); this.textsMsg('Every name and line is back to how it was.');
    }));
    if (this.el.textsFile) this.el.textsFile.addEventListener('change', () => {
      const f = this.el.textsFile.files && this.el.textsFile.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => this.loadTexts(String(rd.result || ''));
      rd.onerror = () => this.textsMsg('That file could not be read.');
      rd.readAsText(f);
    });
  };
})();
Object.assign(UI, {
  textsMsg(t) { if (this.el.textsMsg) this.el.textsMsg.textContent = t; },
  loadTexts(txt) {
    let o;
    try { o = parseTexts9(txt); } catch (e) { this.textsMsg(`That file has a typo in it: ${String(e.message || e).slice(0, 90)}`); return; }
    if (!o || typeof o !== 'object' || !(o.popups || o.powerups || o.messages || o.screens)) { this.textsMsg('That is not a Bitten texts file.'); return; }
    try { localStorage.setItem(TEXTS_KEY9, JSON.stringify(o)); } catch (e) { /* it still works until you close the game */ }
    Texts.reload(o);
    this.textsMsg('Texts loaded. Your names and lines are in the game now.');
  },
  async downloadTexts() {
    const txt = prettyTexts9(Texts.collect()), name = 'bitten-texts.json';
    const r = await saveFile14(name, txt, this.dlP);                    /* T10 */
    this.textsMsg(r === 'declined' ? 'Download cancelled.' : r === 'failed' ? sayF9('Downloads do not work in this browser. Try another one.') : 'Texts file downloaded. Edit it, then load it here.');
  },
});

/* one line per entry, so the file reads like a list */
function prettyTexts9(o) {
  o = Object.assign({}, o);
  for (const sec of ['popups', 'messages', 'screens']) {
    if (!o[sec]) continue;
    const m = {};
    for (const [k, v] of Object.entries(o[sec])) m[k] = (Array.isArray(v) && v.length === 1 && typeof v[0] === 'string') ? v[0] : v;
    o[sec] = m;
  }
  const inl = (v) => {
    if (Array.isArray(v)) return '[' + v.map(inl).join(', ') + ']';
    if (v !== null && typeof v === 'object') return '{' + Object.keys(v).map((k) => JSON.stringify(k) + ': ' + inl(v[k])).join(', ') + '}';
    return JSON.stringify(v);
  };
  const block = (v, pad) => {
    const s1 = inl(v);
    if (v === null || typeof v !== 'object' || s1.length + pad.length <= 120) return s1;
    if (Array.isArray(v)) return '[\n' + v.map((x) => pad + '  ' + block(x, pad + '  ')).join(',\n') + '\n' + pad + ']';
    return '{\n' + Object.keys(v).map((k) => pad + '  ' + JSON.stringify(k) + ': ' + block(v[k], pad + '  ')).join(',\n') + '\n' + pad + '}';
  };
  return block(o, '') + '\n';
}

const Game = {
  wake: null,

  toggleSound() {
    Save.data.sound = !Save.data.sound; Save.store();
    Sfx.init(); Sfx.setOn(Save.data.sound);
    if (G.state === 'menu' && Save.data.sound) Sfx.startMusic();
    if (G.state === 'pause') Sfx.suspend();
    UI.refresh();
  },

  startStory(id) {
    G.storyId = STORIES9[id] ? id : (G.storyId || 'lockdown');
    G.mode = 'story';
    Story.used.clear();
    G.player = null;
    Story.play('intro', () => this.startRun(true));
  },
  retryChapter() {
    const ch = G.run && G.run.chapter;
    if (!ch) { this.startRun(G.mode === 'story'); return; }
    G.player = new Player(ch.char);
    for (const id of ch.items) { ITEMS[id].apply(G.player); G.player.items.push(id); }
    G.player.curses = (ch.curses || []).slice(); G.player.downs = (ch.downs || []).slice();
    G.player.tunes = (ch.tunes || []).slice(); G.player.cuts = (ch.cuts || []).slice(); G.player.perfectN = ch.perfectN || 0;
    recalcMods(G.player); DJ.stop(0.2, true);
    G.player.maxHp = ch.maxHp; G.player.hp = ch.maxHp; G.player.bites = [];
    G.run.pending = new Set(); G.run.rewardQ = []; G.run.coins = ch.coins || 0; G.run.keys = ch.keys || 0; G.run.roomHits = 0;
    G.boss = null; G.bossGroup = null; G.freeze = 0; G.flood = null; G.whiteout = 0; G.hurtFlash = 0; G.shake = 0;
    UI.hidePanels(); UI.hideOverlays();
    UI.el.btnPause.hidden = false;
    Input.reset();
    G.state = 'play';
    this.loadLevel(G.levelIdx);
    G.fade = 1; G.trans = { kind: 'start', phase: 'in', t: 0 };
    this.requestWake();
  },
  retry() { if (G.mode === 'story') this.retryChapter(); else this.startRun(false, G.mode); },
  startRun(story, mode) {
    G.mode = story ? 'story' : MODES[mode] ? mode : MODES[Save.data.mode] ? Save.data.mode : 'arcade';
    let diff = G.mode === 'story' || G.mode === 'daily' ? 'normal' : DIFFS[Save.data.diff] ? Save.data.diff : 'normal';
    if (diff === 'nightmare' && !Save.data.unlocks.nightmare) diff = 'hard';
    G.diff = diff; G.D = DIFFS[diff];
    Sfx.init(); Sfx.setOn(Save.data.sound); Sfx.resume(); Sfx.stopMusic(); DJ.stop(0.2, true);
    const day = todayKey();
    const seed = G.mode === 'daily' ? hashStr('bitten-daily-' + day) : (Math.random() * 1e9) >>> 0;
    G.rng = mulberry32((seed ^ 0x5bd1e995) >>> 0);          /* T8: the gameplay stream */
    G.run = { seed, kills: 0, rooms: 0, time: 0, pending: new Set(), coins: 0, coinsGot: 0, day, twist: G.mode === 'daily' ? dailyTwist(day) : null, rewardQ: [], rewardRoom: null, keys: 0, bought: 0, roomHits: 0, lastKill: null };
    const tw = G.run.twist ? G.run.twist.id : null;
    G.speedK = G.D.speed * (tw === 'fast' ? 1.15 : 1);
    G.bossSpeedK = G.D.bossSpeed * (tw === 'fast' ? 1.1 : 1);
    G.player = new Player(Save.data.char === 'apple' || Save.data.unlocks[Save.data.char] ? Save.data.char : 'apple');
    const P = G.player;
    if (G.D.startHp) { P.maxHp = Math.min(16, P.maxHp + G.D.startHp); P.hp = P.maxHp; }
    if (tw === 'glass') { P.maxHp = 4; P.hp = 4; P.dmg *= 2; }
    if (tw === 'fast') { P.speed *= 1.12; P.fireDelay *= 0.9; }
    if (tw === 'rich') G.run.coins = 40;
    if (tw === 'cursed') { giveCurse(pickCurse()); G.run.keys = 1; }
    G.boss = null; G.bossGroup = null; G.freeze = 0; G.flood = null; G.t = 0; G.whiteout = 0; G.hurtFlash = 0; G.shake = 0; G.hbT = 0;
    G.seeds = []; G.venom = []; G.particles = []; PART14.count.clear(); G.flashes = []; G.strikes = []; G.lobs = [];
    G.run.hits = 0;
    Meta.add('runs');
    if (G.mode === 'daily' && Save.data.daily.day !== day) { Save.data.daily = { day, best: 0, won: false }; Save.store(); }
    UI.hidePanels(); UI.hideCard();
    UI.el.btnPause.hidden = false;
    Input.reset(); Input.used.move = false; Input.used.aim = false;
    G.state = 'play';
    this.loadLevel(0);
    if (Save.data.gift && ITEMS[Save.data.gift]) {
      const id = Save.data.gift; delete Save.data.gift; Save.store();
      if (id !== 'golden') G.run.pending.add(id);
      G.map.start.pickups.push({ kind: 'item', id, x: RW / 2, y: RH / 2 - 50, t: 0, gift: 'saved' });
    }
    G.fade = 1; G.trans = { kind: 'start', phase: 'in', t: 0 };
    this.requestWake();
  },

  // the floor a run is on, before the difficulty is put on top
  levelBase(i) {
    if (G.mode === 'chaos') return chaosLevel9(i);
    if (G.mode === 'story') return curStory().levels[i];
    if (G.mode === 'rush') {
      const boss = RUSH_ORDER[i];
      return Object.assign({}, LEVELS[SET_LEVEL[RUSH_SET[boss]]], { boss, rush: true, rooms: 2, portal: false, name: BOSS_INFO[boss].title, sub: 'Pick a powerup, then go through the door.', tier: Math.min(4, i) });
    }
    if (G.mode === 'endless') {
      const L = LEVELS[i % LEVELS.length], loop = Math.floor(i / LEVELS.length);
      return Object.assign({}, L, { endless: true, loop, name: loop ? `${L.name} ${ROMAN[Math.min(loop, ROMAN.length - 1)] || loop + 1}` : L.name, rooms: L.rooms + Math.min(3, loop), portal: !!L.portal || i % 2 === 1, tier: Math.min(4, L.tier + loop), sub: loop ? 'You have been here before. It got worse.' : L.sub });
    }
    return LEVELS[i];
  },
  scaleDef(base, i) {
    const D = G.D || DIFFS.normal, loop = base.loop || 0, tw = G.run.twist && G.run.twist.id;
    return Object.assign({}, base, {
      hpMult: base.hpMult * D.hp * (1 + 0.35 * loop),
      venomSpeed: base.venomSpeed * D.venom * (1 + 0.05 * Math.min(4, loop)),
      extra: D.extra + (loop >= 1 ? 1 : 0) + (loop >= 3 ? 1 : 0),
      champ: D.champ * (tw === 'gold' ? 2 : 1) * (1 + loop * 0.3),
      bossMult: D.bossHp * (1 + 0.3 * loop),
      traits: (D.traits || 0) + Math.min(3, loop),
      first: i === 0 && G.mode !== 'rush',
    });
  },
  isLast(i = G.levelIdx) {
    if (G.mode === 'story') return i >= curStory().levels.length - 1;
    if (G.mode === 'endless') return false;
    if (G.mode === 'custom') { const c = G.run && G.run.cust; return !!c && !c.loop && i >= c.n - 1; }
    if (G.mode === 'chaos') return i >= 2;
    if (G.mode === 'rush') return i >= RUSH_ORDER.length - 1;
    return i >= LEVELS.length - 1;
  },
  loadLevel(i) {
    G.levelIdx = i;
    G.levelDef = this.scaleDef(this.levelBase(i), i);
    const P0 = G.player;
    G.run.chapter = { char: P0.char, items: P0.items.slice(), maxHp: P0.maxHp, coins: G.run.coins, curses: P0.curses.slice(), downs: P0.downs.slice(), keys: G.run.keys || 0,
      tunes: (P0.tunes || []).slice(), cuts: (P0.cuts || []).slice(), perfectN: P0.perfectN || 0 };
    Story.lowSaid = false; Story.firstFight = false; Story.chatLast = -99;
    G.map = rushy() ? generateRushLevel(G.levelDef) : generateLevel(G.levelDef, mulberry32((G.run.seed + i * 7919) >>> 0));
    if (G.mode === 'chaos') chaosFloor9(G.map, G.levelDef);
    if (G.run.twist && G.run.twist.id === 'dark') for (const r of G.map.rooms) if (r.type === 'fight' && !r.mod) r.mod = 'dark';
    if (!rushy()) {
      const cands = [];
      for (const r of G.map.rooms) if (r.type === 'fight' || r.type === 'start') for (const o of r.obs) if (o.breakable) cands.push(o);
      if (cands.length) pick(cands).item = true; else G.map.chestExtra = true;
      // a vault's key hides in another breakable; with nothing to hide in, a won fight drops it
      if (G.map.rooms.some((r) => r.type === 'vault')) {
        const kc = cands.filter((o) => !o.item);
        if (kc.length) pick(kc).key = true; else G.map.keyDrop = true;
      }
      // a few pots are rotten all the way through
      const tier = G.levelDef.tier || 0;
      for (const r of G.map.rooms) if (r.type === 'fight') for (const o of r.obs) if (o.type === 'urn' && !o.item && !o.key && Math.random() < 0.05 + 0.012 * tier) o.rotten = true;
    }
    if (i > 0 && P0.flags.rotting) {
      P0.maxHp = Math.max(2, P0.maxHp - 1); P0.hp = Math.min(P0.hp, P0.maxHp); fixBites(P0);
      const run = G.run;
      setTimeout(() => { if (G.state === 'play' && G.run === run) UI.banner('Core Rot', 'Half an apple of health rotted away on the way down.', 'curse'); }, 3600);
    }
    this.stockRooms(G.map);
    stock9(G.map);
    if (G.mode === 'chaos' || G.map.rooms.some((r) => r.type === 'club' || r.type === 'hellclub') || DJ_KINDS[G.levelDef.boss]) DJ.prepare();
    G.room = null; G.boss = null; G.bossGroup = null; G.freeze = 0; G.flood = null;
    G.player.sink = 0;
    floor9(G.player);
    this.enterRoom(G.map.start, null);
    Sfx.startDrone(G.levelDef.set);
    this.floorCard(i);
    const B = Save.data.best;
    if (G.mode === 'endless') {
      Meta.max('endlessFloor', i + 1);
      if (i + 1 > (B.endless || 0)) {
        if (B.endless >= 2) setTimeout(() => { if (G.state === 'play') UI.banner('New record', `Floor ${i + 1}. Deeper than you have ever been.`); }, 3600);
        B.endless = i + 1; Save.store();
      }
    }
    else if ((G.mode === 'arcade' || G.mode === 'daily') && i + 1 > B.level) { B.level = i + 1; Save.store(); }
    if (G.mode === 'daily') { const d = Save.data.daily; if (d.day === G.run.day && i + 1 > d.best) { d.best = i + 1; Save.store(); } }
  },
  floorCard(i) {
    const L = G.levelDef, tw = G.run.twist;
    if (G.mode === 'story') UI.card(`Chapter ${i + 1}`, L.name, L.sub, '', 3.2);
    else if (G.mode === 'rush' || L.rush) UI.card(floorLabel(i), BOSS_INFO[L.boss].title, 'Pick a powerup, then go through the door.', 'boss', 3.2);
    else if (G.mode === 'daily' && i === 0 && tw) UI.card(`Daily run  ·  ${tw.name}`, L.name, tw.desc, '', 3.6);
    else UI.card(`${floorLabel(i)}${G.diff !== 'normal' && G.mode !== 'daily' ? '  ·  ' + G.D.name : ''}`, L.name, L.sub, '', 3.2);
  },
  // shops get their goods and vote rooms their two motions when a floor is made
  stockRooms(map) {
    for (const r of map.rooms) {
      if (r.type === 'shop') {
        let goods = 0;
        for (const s of r.shopSpots) {
          if (s.ch === '+') r.pickups.push({ kind: 'heart', amount: 2, x: s.x, y: s.y, vx: 0, vy: 0, t: 0.5, ph: rnd(10), cost: 6 });
          else if (s.ch === '!') r.pickups.push({ kind: 'cleanse', x: s.x, y: s.y, t: 0, cost: 8 });
          else if (s.ch === 'q') r.pickups.push({ kind: 'reroll', x: s.x, y: s.y, t: 0, cost: 5, armed: true });
          else if (s.ch === '%') {
            const id = nextItemId(0.2), cu = pickCurse();
            if (id !== 'golden') G.run.pending.add(id);
            r.pickups.push({ kind: 'item', id, x: s.x, y: s.y, t: 0, cost: ITEMS[id].rare ? 18 : 8, curseCost: cu });
          } else {
            const rareSlot = goods === 2; goods++;
            const id = nextItemId(rareSlot ? 0.3 : 0.04);
            if (id !== 'golden') G.run.pending.add(id);
            r.pickups.push({ kind: 'item', id, x: s.x, y: s.y, t: 0, cost: ITEMS[id].rare ? 35 : 15, goods: true, rareSlot });
          }
        }
      } else if (r.type === 'library') {
        const grp = 'b' + r.id + '_' + G.levelIdx, used = new Set();
        for (const b of r.books) {
          const id = nextItemId(0.15), cu = pickCurse(used);
          if (cu) used.add(cu);
          if (id !== 'golden') G.run.pending.add(id);
          r.pickups.push({ kind: 'item', id, x: b.x, y: b.y + 38, t: 0, grp, book: true, curseCost: cu });
        }
      } else if (r.type === 'vault') {
        for (const [dx, lg] of [[-46, 1], [46, 0]]) {
          const id = nextItemId(lg);
          if (id !== 'golden') G.run.pending.add(id);
          r.pickups.push({ kind: 'item', id, x: RW / 2 + dx, y: RH / 2, t: 0 });
        }
      } else if (r.voteRoom) {
        const grp = 'v' + r.id + '_' + G.levelIdx;
        // sometimes one motion is a legendary with a curse attached
        const cursedI = (rushy() || (G.levelDef.tier || 0) >= 1) && Math.random() < 0.35 ? 1 : -1;
        r.lecterns.forEach((l, k) => {
          const cursed = k === cursedI;
          const id = nextItemId(cursed ? 1 : rushy() ? 0.25 : 0.12);
          if (id !== 'golden') G.run.pending.add(id);
          r.pickups.push({ kind: 'item', id, x: l.x, y: l.y + 36, t: 0, vote: grp, curseCost: cursed ? pickCurse() : null });
        });
        if (rushy() && G.levelIdx > 0) r.pickups.push({ kind: 'heart', amount: 2, x: RW / 2, y: RH * 0.72, vx: 0, vy: 0, t: 0.5, ph: rnd(10) });
      }
    }
  },

  enterRoom(room, entry) {
    const prev = G.room;
    if (prev && prev !== room) {
      prev.snakes = []; prev.balls = []; prev.fires = [];
      prev.carts = prev.carts.filter((k) => k.temp == null);
      for (const o of prev.obs.slice()) if (o.type === 'block') prev.removeObstacle(o);
      flushSpores(prev);
      prev.turrets = []; prev.sap = []; prev.clouds = []; prev.roots = [];
      if (prev.cleared) prev.skins = [];
    }
    G.room = room; room.visited = true;
    G.run.roomHits = 0;
    G.seeds.length = 0; G.venom.length = 0; G.particles.length = 0; PART14.count.clear(); G.flashes.length = 0; G.strikes.length = 0; G.lobs.length = 0;
    G.freeze = 0; G.flood = null;
    const P = G.player;
    if (entry) { const v = DOORV[entry]; P.x = RW / 2 + v[0] * (RW / 2 - P.r - 8); P.y = RH / 2 + v[1] * (RH / 2 - P.r - 8); }
    else { P.x = RW / 2; P.y = RH / 2; }
    P.kbx = 0; P.kby = 0;
    P.syrup = !!P.stroop; P.vetoUsed = false;
    G.darkA = darkTarget(room, G.levelDef);
    room.doorCl = 0;
    if (room.type === 'offering' && !room.offered && room.altar) {
      room.offered = true;
      const id = nextItemId(0.35); if (id !== 'golden') G.run.pending.add(id);
      // half of the altars want a curse instead of an apple
      const cu = Math.random() < 0.5 ? pickCurse() : null;
      room.pickups.push({ kind: 'item', id, x: room.altar.x, y: room.altar.y - 30, t: 0, price: cu ? 0 : 2, curseCost: cu });
      if (cu) UI.card('An offering', 'It costs a curse', `Take the gift and carry ${CURSES[cu].name} with it.`, 'boss', 2.8);
      else UI.card('An offering', 'It costs one apple', 'Take the gift and lose one apple of health for good.', 'boss', 2.8);
      setTimeout(() => Story.chat('offering', true), 3000);
    } else if (room.type === 'pantry' && !room.seen) { room.seen = true; UI.card('', 'A pantry', 'Somebody hid snacks down here.', '', 2); setTimeout(() => Story.chat('pantry', true), 1600); }
    else if (room.type === 'shop' && !room.seen) { room.seen = true; UI.card('', 'A shop', 'Open late. Walk onto something to buy it.', '', 2.4); Sfx.dingdong(); }
    else if (room.voteRoom && !room.seen && !rushy()) { room.seen = true; UI.card('A vote', 'Pick one', 'Walk onto a motion. The other one fails.', '', 2.6); Sfx.gavel(); }
    else if (room.type === 'gamble' && !room.seen) { room.seen = true; UI.card('', 'A slot machine', 'Three coins a pull. Walk into it.', '', 2.4); Sfx.coin(); }
    else if (room.type === 'spring' && !room.seen) { room.seen = true; UI.card('', 'A spring', 'Step in once. It heals and washes off every downgrade.', '', 2.6); Sfx.splash(); }
    else if (room.type === 'library' && !room.seen) { room.seen = true; UI.card('Cursed books', 'Take one', 'Every book holds a powerup and a curse. The others burn.', 'boss', 2.8); Sfx.paper(); }
    else if (room.type === 'vault' && !room.seen) { room.seen = true; UI.card('', 'The vault', 'All of it is yours. Break the gold too.', '', 2.4); Sfx.register(); }
    else if (room.type === 'chest' && room.chest && room.chest.mimic && !room.seen) { room.seen = true; }
    if (!room.cleared) {
      if (room.type === 'fight') this.startCombat(room);
      else if (room.type === 'boss') this.startBoss(room, entry);
      else if (room.type === 'portal') this.startPortal(room, entry);
      else if (room.type === 'challenge' && !room.wave) { UI.card('Challenge', 'Three waves', 'Touch the altar to start. Win a powerup.', 'boss', 2.6); setTimeout(() => Story.chat('challenge', true), 2800); }
      else if (room.type === 'secret') secretStart10(room, entry);
      else if (room.type === 'miniboss') startMini(room);
      else if (room.type === 'survival' && !room.surv.on) UI.card('Survival', 'Hold out', `Touch the altar, then stay alive for ${room.surv.len} seconds. Win a powerup.`, 'boss', 2.8);
    }
    enterRoom9(room, entry);
  },

  goThrough(dir) {
    if (G.trans) return;
    const next = G.room.doors[dir];
    if (!next) return;
    G.trans = { kind: 'door', phase: 'out', t: 0, to: next, dir };
  },
  descend() {
    if (G.trans) return;
    G.trans = { kind: 'descend', phase: 'out', t: 0, x0: G.player.x, y0: G.player.y };
    Sfx.descend();
  },
  escape() {
    const P = G.player;
    if (P.escaping > 0) return;
    P.escaping = 0.0001; P.inv = 99;
    Sfx.escape(); Sfx.stopDrone();
    UI.el.btnPause.hidden = true;
  },
  updateTrans(dt) {
    const tr = G.trans; tr.t += dt;
    const outT = tr.kind === 'door' ? 0.16 : 0.95, inT = tr.kind === 'door' ? 0.2 : 0.75;
    if (tr.phase === 'out') {
      G.fade = clamp(tr.t / outT, 0, 1);
      if (tr.kind === 'descend' && G.room.exit) {
        const P = G.player, u = smooth(tr.t / outT);
        P.sink = u; P.x = lerp(tr.x0, G.room.exit.x, u); P.y = lerp(tr.y0, G.room.exit.y, u);
      }
      if (tr.t >= outT) {
        if (tr.kind === 'door') this.enterRoom(tr.to, OPP[tr.dir]);
        else if (G.mode === 'story') {
          G.trans = null;
          const next = G.levelIdx + 1;
          Story.play('end' + G.levelIdx, () => {
            G.state = 'play'; UI.el.btnPause.hidden = false;
            this.loadLevel(next);
            G.fade = 1; G.trans = { kind: 'start', phase: 'in', t: 0 };
          });
          return;
        } else this.loadLevel(G.levelIdx + 1);
        tr.phase = 'in'; tr.t = 0;
      }
    } else {
      G.fade = clamp(1 - tr.t / inT, 0, 1);
      if (tr.t >= inT) { G.trans = null; G.fade = 0; }
    }
    updateParticles(dt);
  },

  startCombat(room) {
    room.locked = true; room.doorCl = 0;
    Sfx.doorShut();
    const P = G.player, used = new Set(), L = G.levelDef, tier = L.tier || 0;
    if (room.mod && room.type === 'fight') UI.card('', MOD_NAMES[room.mod] || '', '', '', 1.4);
    const blight = G.player.flags.blight && room.type === 'fight';
    const champIdx = room.mod === 'elite' || blight ? Math.floor(Math.random() * room.spawns.length) : -1;
    const champP = 0.04 * (tier + 1) * (L.champ || 1);
    const newbie = room.spawns.find((s) => s.kind === 'tetra' || s.kind === 'rocket' || s.kind === 'fuel' || NEWBIE9[s.kind]);
    if (newbie && room.type === 'fight' && Story.firstFight) setTimeout(() => Story.chat(newbie.kind, true), 1500);
    else if (room.type === 'fight') { if (!Story.firstFight) { Story.firstFight = true; setTimeout(() => Story.chat('fightFirst', true), 1200); } else setTimeout(() => Story.chat(room.mod === 'dark' || room.mod === 'elite' ? room.mod : 'fight', !!room.mod && room.mod !== 'swarm'), 1500); }
    room.spawns.forEach((sp, i) => {
      let c = sp.c, r = sp.r, x = (c + 0.5) * T, y = (r + 0.5) * T;
      if (dist(x, y, P.x, P.y) < 3.4 * T || used.has(r * COLS + c)) {
        const cell = this.farCell(room, P, used); c = cell.c; r = cell.r; x = cell.x; y = cell.y;
      }
      used.add(r * COLS + c);
      const champ = sp.kind !== 'rotter' && (i === champIdx || Math.random() < champP);
      room.snakes.push(new Snake(sp.kind, x, y, { delay: 0.3 + i * 0.2 + rnd(0, 0.1), ang: Math.atan2(P.y - y, P.x - x) + rnd(-0.6, 0.6), champ }));
    });
    if (room.type !== 'fight') return;
    room.crackT = 0;
    if (room.mod === 'skins') placeSkins(room);
    // harder difficulties and deeper laps bring company
    const tw = G.run.twist && G.run.twist.id;
    const wormy = G.player.flags.wormy ? 1 : 0;
    const extra = (L.extra || 0) + (tw === 'swarm' ? 2 : 0) + wormy;
    const pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar;
    for (let i = 0; i < extra; i++) {
      const kind = (tw === 'swarm' && i >= extra - 2 - wormy) || (wormy && i === extra - 1) ? 'grub' : pick(pool);
      const cell = this.farCell(room, P, used); used.add(cell.r * COLS + cell.c);
      room.snakes.push(new Snake(kind, cell.x, cell.y, { delay: 0.5 + (room.spawns.length + i) * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x), champ: Math.random() < champP * 0.5 }));
    }
    giveTraits(room, L.traits || 0);
    combat9(room);
  },
  spawnWave(room) {
    room.wave++;
    room.locked = true;
    Sfx.doorShut(); Sfx.hiss(1.2);
    const L = G.levelDef, tier = L.tier || 0;
    const pool = WAVE_POOL[L.set] || WAVE_POOL.cellar;
    const n = 2 + Math.min(3, tier) + room.wave + (L.extra || 0);
    const P = G.player, used = new Set();
    for (let i = 0; i < n; i++) {
      let kind = pick(pool);
      if (kind === 'long' && room.snakes.some((s) => s.alive && s.kind === 'long')) kind = 'hood';
      if (i === 0 && room.wave >= 2 && tier >= 1 && Math.random() < 0.6) {
        const k2 = pick(['tetra', 'rocket', 'fuel']);
        if (!room.snakes.some((s) => s.alive && s.kind === k2)) kind = k2;
      }
      const cell = this.farCell(room, P, used); used.add(cell.r * COLS + cell.c);
      room.snakes.push(new Snake(kind, cell.x, cell.y, { delay: 0.2 + i * 0.18, ang: Math.atan2(P.y - cell.y, P.x - cell.x), champ: room.wave === 3 && i === 0 }));
    }
    giveTraits(room, Math.min(2, L.traits || 0));
    UI.card('', `Wave ${room.wave} of 3`, '', '', 1.2);
  },
  farCell(room, P, used) {
    const opts = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (room.solid(c, r) || used.has(r * COLS + c)) continue;
        if (room.beltMap && room.beltMap[r * COLS + c]) continue;
        const x = (c + 0.5) * T, y = (r + 0.5) * T;
        if (dist(x, y, P.x, P.y) < 4 * T) continue;
        if ((c >= 4 && c <= 6 && (r <= 1 || r >= 7)) || (r >= 3 && r <= 5 && (c <= 1 || c >= 9))) continue;
        opts.push({ c, r, x, y });
      }
    }
    if (!opts.length) return nearestFreeCell(room, RW - P.x, RH - P.y);
    return pick(opts);
  },

  startBoss(room, entry) {
    if (startBoss9(room, entry)) return;
    const kind = G.levelDef.boss, P = G.player, L = G.levelDef;
    if (kind === 'ender') { room.theme = 'craft'; room.dirty = true; this.startPortal(room, entry); return; }
    room.locked = true; room.doorCl = 0;
    Sfx.doorShut();
    const v = entry ? DOORV[entry] : [0, 1];
    let boss;
    if (kind === 'ouro') {
      const cx = RW / 2, cy = RH / 2;
      const R = (KINDS.ouro.maxLen * KINDS.ouro.spacing) / TAU * 1.02;
      const theta = Math.atan2(cy - P.y, cx - P.x);
      boss = new Snake('ouro', cx + Math.cos(theta) * R, cy + Math.sin(theta) * R, { ang: theta + Math.PI / 2 });
      boss.mode = 'ring'; boss.cx = cx; boss.cy = cy; boss.ringR = R; boss.theta = theta; boss.spin = 1;
    } else if (kind === 'pricewar') {
      // two bosses at once, side by side across the room from the door
      const side = v[0] === 0 ? [1, 0] : [0, 1];
      const cx = RW / 2 - v[0] * RW * 0.28, cy = RH / 2 - v[1] * RH * 0.24;
      const mk = (k, s) => {
        const f = nearestFreeCell(room, clamp(cx + side[0] * s * 90, 40, RW - 40), clamp(cy + side[1] * s * 70, 40, RH - 40));
        const b = new Snake(k, f.x, f.y, { ang: Math.atan2(P.y - f.y, P.x - f.x) });
        b.maxHp = b.hp = b.K.hp * bossHpK();
        return b;
      };
      const a = mk('pwblue', -1), b = mk('pwyellow', 1);
      a.delay = 0.7; b.delay = 1.1;
      room.snakes.push(a, b);
      G.bossGroup = { kind: 'pricewar', name: 'THE PRICE WAR', list: [a, b], scale: 1 };
      boss = a;
    } else {
      const x = RW / 2 - v[0] * RW * 0.28, y = RH / 2 - v[1] * RH * 0.24;
      boss = new Snake(kind, x, y, { ang: Math.atan2(P.y - y, P.x - x) });
    }
    if (!G.bossGroup) { boss.maxHp = boss.hp = boss.K.hp * bossHpK(); boss.delay = 0.7; room.snakes.push(boss); }
    G.boss = boss;
    G.run.bossHits0 = G.run.hits || 0;
    const info = G.mode === 'story' ? curStory().boss[kind] : BOSS_INFO[kind];
    if (G.mode === 'story') { boss.displayName = curStory().boss[kind].name; setTimeout(() => { if (G.boss === boss) Story.chat('boss', true); }, 3400); }
    Sfx.stinger();
    if (kind === 'pricewar') Sfx.dingdong();
    setTimeout(() => { if (G.boss === boss && G.state === 'play') Sfx.roar(); }, 900);
    UI.card('The lair', info.title, info.sub, 'boss', 2.8);
  },

  startPortal(room, entry) {
    room.locked = true; room.doorCl = 0;
    Sfx.doorShut(); Sfx.warp();
    const P = G.player, v = entry ? DOORV[entry] : [0, 1], L = G.levelDef;
    const x = RW / 2 - v[0] * RW * 0.26, y = RH / 2 - v[1] * RH * 0.22;
    const f = nearestFreeCell(room, x, y);
    const boss = new Snake('ender', f.x, f.y, { ang: Math.atan2(P.y - f.y, P.x - f.x) });
    const tier = L.rush ? 4 : Math.min(4, L.tier || 0);
    boss.maxHp = boss.hp = (100 + 20 * tier) * bossHpK();
    boss.delay = 0.7;
    room.snakes.push(boss); G.boss = boss;
    G.run.bossHits0 = G.run.hits || 0;
    Sfx.stinger();
    UI.card('Through the portal', 'The Ender Wyrm', 'It builds, it teleports, and it brought creepers.', 'boss', 2.8);
    setTimeout(() => { if (G.boss === boss) Story.chat('ender', true); }, 3200);
  },
  // a chest offers two powerups: take one, the other vanishes
  chestItems(room, ch) {
    const grp = 'c' + room.id + '_' + G.levelIdx;
    for (let i = 0; i < 2; i++) {
      const id = nextItemId(ch.mimic ? (i === 0 ? 1 : 0.2) : 0.12);
      if (id !== 'golden') G.run.pending.add(id);
      const x = ch.x + (i ? 34 : -34), y = ch.y - 38;
      room.pickups.push({ kind: 'item', id, x, y, t: 0, grp });
      flashLight(x, y, 100, 0.8, 0.9);
      burst(x, y, 12, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true });
    }
    // the floor's hidden gift found no pot to hide in, so it waits here too
    if (G.map.chestExtra) { G.map.chestExtra = false; spawnItem(room, ch.x, ch.y + 40); }
  },
  wakeMimic(room, ch) {
    ch.woke = true; ch.t = 0;
    room.locked = true; room.doorCl = 0;
    Sfx.roar(); Sfx.doorShut(); G.shake = Math.max(G.shake, 8);
    const P = G.player, L = G.levelDef, tier = L.tier || 0;
    if (dist(P.x, P.y, ch.x, ch.y) < P.r + 30) P.hurt(1, ch.x, ch.y);
    const pool = WAVE_POOL[L.set] || WAVE_POOL.cellar;
    const n = 3 + Math.min(2, tier);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd(-0.3, 0.3);
      const f = nearestFreeCell(room, ch.x + Math.cos(a) * 70, ch.y + Math.sin(a) * 60);
      let kind = pick(pool); if (kind === 'long') kind = 'hood';
      room.snakes.push(new Snake(kind, f.x, f.y, { emerge: false, spawnTime: 0.4, delay: 0.25 + i * 0.15, ang: a, champ: i === 0 }));
    }
    giveTraits(room, Math.min(2, L.traits || 0));
    burst(ch.x, ch.y, 20, '#3a2316', { kind: 'shard', min: 50, max: 160, lmin: 0.4, lmax: 0.8 });
    UI.card('', 'It was a mimic', 'Kill what came out of it. The chest pays better after.', 'boss', 2.4);
  },
  // achievement rewards drop in the room, one per room; the rest wait for the next room
  giveReward(a) {
    const P = G.player;
    const live = G.state === 'play' || G.state === 'pause';
    if (!live || !P || !G.run || P.dying > 0 || P.escaping > 0) { if (!Save.data.gift) { Save.data.gift = a.reward; Save.store(); } return; }
    G.run.rewardQ.push(a);
    this.flushRewards();
  },
  flushRewards() {
    const P = G.player, room = G.room, q = G.run && G.run.rewardQ;
    if (!q || !q.length || !room || G.trans || G.state !== 'play' || P.dying > 0 || P.escaping > 0) return;
    if (G.run.rewardRoom === room) return;
    const a = q.shift();
    G.run.rewardRoom = room;
    let id = a.reward;
    if (id !== 'golden' && (P.items.includes(id) || G.run.pending.has(id) || clashHard10(id, P))) id = nextItemId(0.3);
    if (id !== 'golden') G.run.pending.add(id);
    const f = nearestFreeCell(room, P.x + (P.x < RW / 2 ? 46 : -46), P.y, (c, r) => Math.abs((c + 0.5) * T - P.x) < 30 && Math.abs((r + 0.5) * T - P.y) < 30);
    room.pickups.push({ kind: 'item', id, x: f.x, y: f.y, t: 0, gift: a.name });
    flashLight(f.x, f.y, 120, 1, 0.9);
    burst(f.x, f.y, 18, '#ffd27a', { min: 30, max: 130, lmin: 0.4, lmax: 0.9, glow: true });
    setTimeout(() => { if (G.room === room) floatText(f.x, f.y - 30, 'REWARD', '#ffd27a', true); }, 200);
  },
  // rewards still waiting when a run ends go to the next run
  stashRewards() {
    const q = G.run && G.run.rewardQ;
    if (q && q.length && !Save.data.gift) { Save.data.gift = q[0].reward; Save.store(); }
    if (q) q.length = 0;
  },
  clearRoom(room) {
    room.locked = false; room.cleared = true;
    Sfx.doorOpen();
    G.run.rooms++;
    Meta.add('rooms'); Meta.max('mostRooms', G.run.rooms);
    if (G.player.dropper != null) {
      G.player.dropper++;
      if (G.player.dropper % 3 === 0) {
        const c = nearestFreeCell(room, RW / 2, RH / 2 + 40);
        setTimeout(() => { if (G.room === room && G.state === 'play') { spawnItem(room, c.x, c.y, 0.15); floatText(c.x, c.y - 30, 'DROPPER', '#7cc4ff', true); Sfx.ballHit(); } }, 500);
      }
    }
    room.fires = [];
    for (const o of room.obs.slice()) if (o.type === 'block') crumbleBlock(room, o);
    for (const b of room.balls.slice()) popBall(room, b);
    room.carts = room.carts.filter((k) => k.temp == null);
    const P = G.player, hk = (G.D ? G.D.hearts : 1) * (P.flags.stampede ? 1.5 : 1);
    if (room.type !== 'boss' && room.type !== 'portal' && room.type !== 'club' && room.type !== 'hellclub' && room.type !== 'chaosboss') rollDown(room);
    // Regrowth grows back what got bitten off in this room
    if (P.regrow && room.type !== 'boss' && G.run.roomHits > 0 && P.heal(1)) { floatText(P.x, P.y - 24, '+1', '#9be37a'); burst(P.x, P.y, 8, '#9be37a', { min: 20, max: 70, lmin: 0.3, lmax: 0.6, glow: true }); }
    if (P.graft && ++P.graftN % 3 === 0) { P.dmg += 0.12; floatText(P.x, P.y - 36, 'GRAFTED', '#9be37a', true); }
    if (G.map && G.map.keyDrop && room.type === 'fight') { G.map.keyDrop = false; const kc = nearestFreeCell(room, RW / 2, RH / 2 - 30); dropKey(room, kc.x, kc.y); }
    if (room.type === 'chest' && room.chest && room.chest.mimic) { const ch = room.chest; ch.open = true; ch.t = 0; ch.pending = true; Sfx.chest(); }
    if (room.type === 'boss') {
      const last = this.isLast();
      setTimeout(() => Story.chat('bossDown', true), 2600);
      room.exit = { x: RW / 2, y: RH / 2, t: 0, kind: last ? 'light' : 'hole' };
      dropHeart(room, RW / 2 + 50, RH / 2 + 10, 2);
      if (rushy()) dropHeart(room, RW / 2 - 50, RH / 2 + 10, 2);
      setTimeout(() => {
        if (G.room === room && G.state === 'play') UI.card(last ? 'Daylight' : 'A way down', last ? 'Walk into the light' : 'Drop into the hole', '', '', 2.4);
      }, 1200);
    } else if (room.type === 'portal') {
      spawnItem(room, RW / 2, RH / 2 - 20, 1);
      dropHeart(room, RW / 2 - 50, RH / 2 + 20, 2); dropHeart(room, RW / 2 + 50, RH / 2 + 20, 2);
      setTimeout(() => Story.chat('bossDown', true), 2600);
    } else if (room.type === 'miniboss') {
      spawnItem(room, RW / 2, RH / 2 - 20, 0.5);
      dropCoins(room, RW / 2, RH / 2 + 24, 4);
      Meta.add('minis');
      UI.card('', 'It is down', 'Take what it was guarding.', '', 1.8);
    } else if (room.type === 'survival') {
      const a = room.altar;
      spawnItem(room, a ? a.x : RW / 2, (a ? a.y : RH / 2) - 36, 0.3);
      dropHeart(room, RW / 2 + 44, RH / 2 + 34, 2);
      UI.card('', 'You held out', 'The rest of them rotted away.', '', 1.8);
    } else if (room.type === 'secret') {
      spawnItem(room, RW / 2, RH / 2, 0.3);
    } else if (room.type === 'challenge') {
      spawnItem(room, room.altar ? room.altar.x : RW / 2, (room.altar ? room.altar.y : RH / 2) - 36, 0.25);
      dropHeart(room, RW / 2 + 40, RH / 2 + 30, 1);
      dropCoins(room, RW / 2 - 40, RH / 2 + 30, 2);
      Meta.add('challenges');
      Story.chat('clear', true);
    } else if (room.type === 'fight' && (Story.chat('clear'), Math.random() < 0.3 * hk)) {
      const c = nearestFreeCell(room, RW / 2, RH / 2);
      dropHeart(room, c.x, c.y, 1);
    }
    clearRoom9(room);
  },

  onSnakeKilled(sn) {
    const P = G.player, room = G.room;
    Meta.add('kills'); Meta.add('k_' + sn.kind);
    G.run.lastKill = { x: sn.x, y: sn.y, room };
    if (sn.kind === 'splitter') splitWorm(sn, room);
    if (P && P.compost && ++P.compostN % 4 === 0) plantSunflower(room, sn.x, sn.y);
    if (P && P.flags.stampede && Math.random() < 0.06) dropHeart(room, sn.x, sn.y, 1);
    if (sn.champ) { dropHeart(room, sn.x, sn.y, Math.random() < 0.3 ? 2 : 1); Meta.add('champs'); }
    if (sn.kind === 'tetra') for (const o of room.obs.slice()) if (o.owner === sn) crumbleBlock(room, o);
    if (sn.burn > 0) Meta.add('burnKills');
    if (sn.kind === 'fuel' && !sn.blown) { sn.blown = true; explode(room, sn.x, sn.y, 50, { dmg: 1, src: sn, snakeDmg: 5 }); addFire(room, sn.x, sn.y, 28, 2.8, true); }
    if (P && P.brim && sn.kind !== 'creeper') addFire(room, sn.x, sn.y, 26, 3.2, false);
    if (sn.kind === 'rocket' && !room.snakes.some((s) => s !== sn && s.alive && s.kind === 'rocket')) for (const b of room.balls.slice()) popBall(room, b);
    // coins: lobbyists and shop worms carry the most
    const k = sn.kind;
    let cn = sn.champ ? 2 : k === 'lobby' ? 2 : k === 'bonus' || k === 'discount' ? 1 : k === 'creeper' ? 0 : k === 'grub' || k === 'splitling' ? (Math.random() < 0.15 ? 1 : 0) : Math.random() < 0.3 ? 1 : 0;
    if (sn.mini) cn += 2;
    if (P && P.flags.wormy && k === 'grub') cn = Math.max(cn, 1);
    if (P && P.flags.stampede && Math.random() < 0.25) cn++;
    if (cn) dropCoins(room, sn.x, sn.y, cn);
    if (P && P.hungry) {
      P.hunger++;
      if (P.hunger >= 8) { P.hunger = 0; if (P.heal(1)) { Sfx.pickup(); burst(P.x, P.y, 10, '#ff6a6a', { min: 20, max: 70, lmin: 0.3, lmax: 0.6 }); } }
    }
    if (P && P.motie) { P.motieN++; if (P.motieN >= 6) { P.motieN = 0; P.motieGo = 0.3; } }
    onKill9(sn, room, P);
  },
  unlock(id) {
    if (Save.data.unlocks[id]) return;
    Save.data.unlocks[id] = true; if (id === 'appel') Save.data.unlocked = true;
    Save.store(); UI.refresh();
    const t = id === 'nightmare' ? ['Unlocked: Nightmare', 'A new difficulty on the play screen.'] : [`Unlocked: ${CHARS[id] ? CHARS[id].name : id}`, 'Pick it on the Characters screen.'];
    setTimeout(() => { if (G.state === 'play') UI.banner(t[0], t[1]); }, 700);
  },
  onBossDying(b) {
    Sfx.roar();
    const g = G.bossGroup;
    if (g && g.list.includes(b)) {
      const rest = g.list.filter((s) => s !== b && s.alive && s.dying <= 0);
      if (rest.length) {
        if (g.kind === 'pricewar') { for (const s of rest) s.enraged = true; UI.card('', 'Prices slashed', 'The other one is furious now.', 'boss', 1.8); }
        else floatText(b.x, b.y - 30, `${b.displayName || 'PARTY'} OUT`, '#e8e2d0', true);
        return;
      }
    }
    G.venom.length = 0;
    for (const s of G.room.snakes) if (s !== b && s.alive && s.dying <= 0) s.kill(false);
  },
  onBossDead(b) {
    bossDead9(b);
    if (G.boss === b) G.boss = null;
    Meta.add('kills');
    for (const o of G.room.obs.slice()) if (o.owner === b) crumbleBlock(G.room, o);
    const g = G.bossGroup;
    if (g && g.list.includes(b)) {
      dropCoins(G.room, b.x, b.y, 3);
      const alive = g.list.filter((s) => s.alive);
      if (alive.length) { if (!G.boss || !G.boss.alive) G.boss = alive[0]; return; }
      G.bossGroup = null;
      Meta.add('bosses'); Meta.add('boss_' + g.kind);
    } else {
      dropCoins(G.room, b.x, b.y, 5 + Math.floor(Math.random() * 2));
      Meta.add('bosses'); Meta.add('boss_' + b.kind);
    }
    if ((G.run.hits || 0) === (G.run.bossHits0 || 0)) Meta.add('flawless');
    // a beaten boss takes one downgrade down with it
    const P = G.player;
    if (P && P.downs.length) {
      const id = P.downs[0];
      removeThing(P, id, 'down'); Sfx.cleanse();
      const run = G.run;
      setTimeout(() => { if (G.state === 'play' && G.run === run) UI.banner(`Washed off: ${DOWNS[id].name}`, 'The rot went down with the boss.', 'clean'); }, 2600);
    }
    if (G.mode === 'rush' && G.levelIdx + 1 > (Save.data.best.rush || 0)) Save.data.best.rush = G.levelIdx + 1;
    if (G.run.kills > Save.data.best.kills) Save.data.best.kills = G.run.kills;
    Save.store();
  },
  onPlayerDeath() {
    Meta.add('deaths'); Save.store();
    Sfx.stopDrone();
    Sfx.tone(140, 1.6, { to: 40, vol: 0.2, type: 'sawtooth', lp: 400, verb: true });
    UI.el.btnPause.hidden = true;
  },

  statsHTML() {
    const r = G.run, P = G.player;
    const rows = G.mode === 'endless' ? [['Floor', G.levelIdx + 1], ['Snakes', r.kills], ['Powerups', P.items.length], ['Time', fmtTime(r.time)]]
      : [['Snakes', r.kills], ['Rooms', r.rooms], ['Powerups', P.items.length], ['Time', fmtTime(r.time)]];
    return rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  },
  saveBest() {
    const b = Save.data.best;
    if (G.run.kills > b.kills) b.kills = G.run.kills;
    if (G.run.rooms > b.rooms) b.rooms = G.run.rooms;
    Save.store(); UI.refresh();
  },
  gameOver() {
    G.state = 'over';
    DJ.stop(0.8, true);
    this.saveBest(); this.stashRewards();
    const L = G.levelDef, i = G.levelIdx;
    let where;
    if (G.mode === 'story') where = storyDeath9();
    else if (G.mode === 'endless') where = `Eaten on floor ${i + 1} of Endless. Your deepest is floor ${Math.max(i + 1, Save.data.best.endless || 0)}.`;
    else if (G.mode === 'chaos') where = `Eaten on layer ${i + 1} of 3 of Extreme Chaos, in ${L.name}.`;
    else if (G.mode === 'rush') where = `Eaten by boss ${i + 1} of ${RUSH_ORDER.length}, ${BOSS_INFO[L.boss].title}.`;
    else if (G.mode === 'custom') { const c = G.run && G.run.cust; where = `Eaten in ${L.name}, stage ${i + 1}${c && !c.loop ? ' of ' + c.n : ''} of a Custom Run${G.diff !== 'normal' ? ', on ' + G.D.name : ''}.`; }
    else where = `Eaten in ${L.name}, floor ${i + 1} of ${LEVELS.length}${G.mode === 'daily' ? ', daily run' : G.diff !== 'normal' ? ', on ' + G.D.name : ''}.`;
    UI.el.overWhere.textContent = where;
    UI.el.btnRetry.textContent = G.mode === 'story' ? `Retry chapter ${i + 1}` : G.mode === 'daily' ? 'Try today again' : 'Try again';
    UI.el.overStats.innerHTML = this.statsHTML();
    UI.hideOverlays();
    paintPanelArt('coreArt', 'core');
    UI.show('over');
    this.releaseWake();
    setTimeout(() => UI.el.btnRetry.focus({ preventScroll: true }), 60);
  },
  win(afterStory) {
    if (G.mode === 'story' && !afterStory) { G.whiteout = 0; Story.play('ending', () => this.win(true)); return; }
    G.state = 'win';
    DJ.stop(0.5, true);
    const m = G.mode;
    if (m === 'story') Meta.add(curStory().winStat);
    else if (m === 'rush') Meta.add('rushWins');
    else if (m === 'chaos') Meta.add('chaosWins');
    else if (m === 'custom') Meta.add('customWins');
    else {
      Meta.add('wins');
      if (m === 'daily') { Meta.add('dailyWins'); if (Save.data.daily.day === G.run.day) Save.data.daily.won = true; }
      if (m === 'arcade' && G.run.time < 1200) Meta.add('fastWin');
      if (m === 'arcade' && (G.diff === 'hard' || G.diff === 'nightmare')) Meta.add('hardWins');
      if (m === 'arcade' && G.diff === 'nightmare') Meta.add('nightWins');
    }
    if (m !== 'custom') Meta.mark('winChars', G.player.char);
    if (m === 'arcade' && G.player.char === 'pean') Meta.add('peanWins');
    this.stashRewards();
    const T2 = {
      story: curStory().winText,
      rush: ['Every boss is down', 'Every lair, every boss. Not one of them got the apple.', 'Rush again'],
      chaos: ['You survived the chaos', `Three layers and ${G.run.rooms} rooms. Nothing was where it belonged.`, 'Chaos again'],
      custom: ['Run complete', `Your own run, ${G.run && G.run.cust ? G.run.cust.n : 0} stage${G.run && G.run.cust && G.run.cust.n === 1 ? '' : 's'}. ${G.diff !== 'normal' ? 'On ' + G.D.name + '. ' : ''}Build another one.`, 'Run again'],
      daily: ['Daily run done', `${G.run.twist ? G.run.twist.name + '. ' : ''}A new dungeon opens tomorrow.`, 'Play again'],
      arcade: ['You escaped', `${G.diff !== 'normal' ? 'On ' + G.D.name + '. ' : ''}The garden is quiet. For now.`, 'Play again'],
    }[m] || ['You escaped', 'The garden is quiet. For now.', 'Play again'];
    UI.el.winTitle.textContent = T2[0];
    UI.el.winLead.textContent = T2[1];
    UI.el.btnAgain.textContent = T2[2];
    if (m === 'arcade' || m === 'daily') Save.data.best.wins++;
    this.saveBest();
    UI.el.winStats.innerHTML = this.statsHTML();
    UI.hideOverlays(); G.whiteout = 0;
    paintPanelArt('winArt', 'apple');
    UI.show('win');
    Sfx.startMusic();
    this.releaseWake();
    setTimeout(() => UI.el.btnAgain.focus({ preventScroll: true }), 60);
  },
  pause() {
    if (G.state !== 'play' || G.player.dying > 0 || G.player.escaping > 0) return;
    G.state = 'pause';
    Input.reset();
    UI.el.pauseWhere.textContent = G.mode === 'daily' && G.run.twist ? `Daily run, ${G.run.twist.name}  ·  ${floorLabel(G.levelIdx)}` : `${floorLabel(G.levelIdx)}  ·  ${G.levelDef.name}`;
    UI.hideOverlays();
    UI.refresh();
    UI.show('pause');
    UI.fillPause();
    UI.el.btnPause.hidden = true;
    Sfx.suspend();
    setTimeout(() => UI.el.btnResume.focus({ preventScroll: true }), 60);
  },
  resume() {
    if (G.state !== 'pause') return;
    UI.hide('pause'); UI.hide('how'); UI.hide('settings');
    G.state = 'play';
    UI.el.btnPause.hidden = false;
    Sfx.resume();
    View.cv.focus({ preventScroll: true });
  },
  toMenu() {
    if (G.run && (G.state === 'pause' || G.state === 'play')) this.stashRewards();
    G.state = 'menu'; G.room = null; G.map = null; G.boss = null; G.bossGroup = null; G.trans = null; G.fade = 0; G.whiteout = 0; G.freeze = 0; G.flood = null;
    DJ.stop(0.4, true); Sfx.stopDrone(); Sfx.resume();
    UI.hidePanels(); UI.hideOverlays(); UI.el.btnPause.hidden = true;
    UI.refresh(); UI.show('menu');
    if (Save.data.sound) Sfx.startMusic();
    this.releaseWake();
  },
  onKey(code) {
    if (G.state === 'cutscene') {
      if (code === 'Space' || code === 'Enter' || code === 'ArrowRight') Story.next();
      else if (code === 'Escape') Story.end();
      return;
    }
    if (code === 'Escape' || code === 'KeyP') {
      if (G.state === 'play') this.pause();
      else if (G.state === 'pause') { if (!UI.el.how.hidden) UI.closeHow(); else if (!UI.el.settings.hidden) UI.closeSettings(); else this.resume(); }
      else UI.back();
    } else if (code === 'KeyM') this.toggleSound();
  },
  async requestWake() {
    try { if ('wakeLock' in navigator) this.wake = await navigator.wakeLock.request('screen'); } catch (e) { this.wake = null; }
  },
  releaseWake() { try { if (this.wake) this.wake.release(); } catch (e) { /* ignore */ } this.wake = null; },

  update(dt) {
    if (G.state !== 'play') return;
    G.t += dt;
    G.shake = Math.max(0, G.shake - dt * 28);
    G.hurtFlash = Math.max(0, G.hurtFlash - dt * 1.4);
    if (G.trans) { this.updateTrans(dt); if (!G.trans) this.flushRewards(); return; }
    const P = G.player, room = G.room, L = G.levelDef;
    G.run.time += dt;
    G.darkA = approach(G.darkA, darkTarget(room, L), dt * 0.22);
    room.doorCl = approach(room.doorCl, room.locked ? 1 : 0, dt * 4);
    // Mikappols stops time: nothing hungry moves while the room is frozen
    const frozen = G.freeze > 0;
    if (frozen) G.freeze = Math.max(0, G.freeze - dt);
    P.update(dt, room);
    DJ.update(dt);
    if (!frozen) for (let i = 0; i < room.snakes.length; i++) { const sn = room.snakes[i]; if (sn.alive) sn.update(dt, room); }
    if (room.snakes.some((s) => !s.alive)) room.snakes = room.snakes.filter((s) => s.alive);
    Save.data.stats.time = (Save.data.stats.time || 0) + dt;
    updateSeeds(dt, room);
    updateStrikes(dt, room);
    if (!frozen) { updateLobs(dt, room); updateBlocks(dt, room); updateVenom(dt, room); }
    updateFires(dt, room);
    if (room.balls.length) updateBalls(dt, room);
    updatePickups(dt, room);
    if (room.carts.length) updateCarts(dt, room);
    if (room.beltMap && !frozen) updateBelts(dt, room);
    if (room.spikes.length && !frozen) updateSpikes(dt, room);
    updateRoomExtras(dt, room, frozen);
    updateParticles(dt);
    if (G.run.rewardQ.length) this.flushRewards();
    for (const o of room.obs) {
      if (o.shake > 0) o.shake = Math.max(0, o.shake - dt);
      if (o.type === 'egg') { o.wob = Math.max(0, o.wob - dt * 1.5); if (Math.random() < dt * 0.1) o.wob = 0.8; }
    }
    if (room.secretLink && Math.random() < dt * 1.2) {
      const [sx, sy] = secretSpot(room.secretLink.k);
      addP({ kind: 'dot', x: sx + rnd(-14, 14) * (sy === 0 || sy === RH ? 1 : 0.2), y: sy + rnd(-14, 14) * (sx === 0 || sx === RW ? 1 : 0.2), vx: (RW / 2 - sx) * 0.12, vy: (RH / 2 - sy) * 0.12 + 10, r: rnd(0.8, 1.6), life: 0.9, col: '#8d7a62', drag: 2 });
    }
    const ch = room.chest;
    if (ch) {
      if (ch.woke && !ch.open) ch.t += dt;
      if (ch.open) {
        ch.t += dt;
        if (ch.pending && ch.t > 0.35) { ch.pending = false; this.chestItems(room, ch); }
      } else if (P.dying <= 0 && !ch.woke && dist(P.x, P.y, ch.x, ch.y) < P.r + 24) {
        if (ch.mimic) this.wakeMimic(room, ch);
        else { ch.open = true; ch.t = 0; ch.pending = true; Sfx.chest(); flashLight(ch.x, ch.y, 130, 0.8, 1.1); G.shake = Math.max(G.shake, 2); }
      }
    }
    if (room.type === 'challenge' && !room.cleared) {
      if (!room.wave) {
        if (room.altar && P.dying <= 0 && dist(P.x, P.y, room.altar.x, room.altar.y) < P.r + 26) this.spawnWave(room);
      } else if (!room.snakes.some((s) => s.alive && s.locks)) {
        if (room.wave < 3) { room.waveT = (room.waveT || 0) + dt; if (room.waveT > 1.1) { room.waveT = 0; this.spawnWave(room); } }
        else this.clearRoom(room);
      }
    } else if (room.type === 'survival' && !room.cleared) updateSurvival(dt, room);
    else if (room.locked && !room.snakes.some((s) => s.alive && s.locks)) this.clearRoom(room);
    if (room.exit) {
      room.exit.t += dt;
      if (room.exit.t > 1 && P.dying <= 0 && P.escaping <= 0 && dist(P.x, P.y, room.exit.x, room.exit.y) < 20) {
        if (room.exit.kind === 'hole') this.descend(); else this.escape();
      }
    }
    if (P.hp <= 2 && P.hp > 0 && P.dying <= 0 && P.escaping <= 0) { G.hbT -= dt; if (G.hbT <= 0) { G.hbT = 0.95; Sfx.heartbeat(); } }
    if (G.mode === 'story' && P.hp <= 2 && P.hp > 0 && P.dying <= 0 && !Story.lowSaid) { Story.lowSaid = true; Story.chat('low', true); }
    if (P.dying > 2.4 && G.state === 'play') this.gameOver();
    if (P.escaping > 0) {
      G.whiteout = clamp((P.escaping - 0.7) / 1.3, 0, 1);
      if (P.escaping > 2.2 && G.state === 'play') this.win();
    }
  },
};
/* T1: one entry per hot function, every later version adds a layer (see Hooks in 01-core.js) */
for (const k of ['update', 'startRun', 'loadLevel', 'enterRoom', 'clearRoom']) Hooks.install(Game, k, 'Game.' + k);

