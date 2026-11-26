/* ===== v14.8: every room, boss, snake and floor in every feature, from one source.
   Rule: new content registers once, at its source, and shows up everywhere without a second edit:
     floors   FLOOR10 / RARE_STORY10          snakes  KINDS (guide text: KINDS[k].guide14 = [size, text])
     bosses   BOSS_INFO + BOSS_ORDER10         rooms   CHAOS_ROOMS9 or TPL, info in window.__bitten.ROOMINFO14[type]
     mods     MOD_NAMES                        hidden rooms (rare, hung off a fight room): window.__bitten.HIDDEN14
   This file loads last (keep it the highest number in src/) and fills the features that still held lists
   written by hand: the Admin room tools (types, fight modifiers), the Custom Run and Game Maker rules (one per
   hidden room), the guide (a card per snake and boss, an entry per special room) and the Map Maker catalog.
   B.SYNC14.audit() lists what any feature still misses; test/sync.js fails on anything in it. ===== */
(function () {
  'use strict';
  const B = window.__bitten || (window.__bitten = {});
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'sync14'); return fb; } };
  const C = () => B.CAT14;
  const NOT_ROOM = { start: 1, boss: 1 };        // the floor's own start and lair: never placed by hand
  const NOT_BOSS = { jaude: 1 };                  // Jaude is an event, not a boss you pick
  const NOT_SNAKE = { noodle: 1 };                // noodles are a floor effect, not a placeable snake

  /* ---------------------------------------------------------------- Custom Run and Game Maker: a rule per hidden room */
  function rules() {
    const cu = B.cust10; if (!cu || !cu.PG) return;
    const run = cu.PG.find((g) => g[0] === 'Run'); if (!run) return;
    let n = 0;
    for (const h of C().hidden()) {
      if (!run[1].some((r) => r[0] === h.rk)) { run[1].push([h.rk, h.label, [[-1, 'Never'], [0, 'Rare'], [1, 'Every floor']]]); n++; }
      if (!(h.rk in cu.PD)) cu.PD[h.rk] = 0;
    }
    if (n && B.custUI10 && B.custUI10.buildRules) B.custUI10.buildRules();
  }

  /* ---------------------------------------------------------------- Admin room tools: every room type and fight modifier */
  function admin() {
    const A = B.V119; if (!A) return;
    for (const t of C().rooms()) {
      if (NOT_ROOM[t] || A.TYPES.some((x) => x[0] === t)) continue;
      const ri = C().info(t) || {}, mk = B.MK123 && B.MK123.RT && B.MK123.RT[t];
      const name = ri.name || (mk && mk.name) || t[0].toUpperCase() + t.slice(1), code = ri.code || (mk && mk.code) || t.slice(0, 3).toUpperCase();
      A.TYPES.push([t, name, code]); A.CODE[t] = code;
      if (ri.hung) A.HUNG.add(t);
      if (ri.nolink) A.NOLINK.add(t);
    }
    if (typeof MOD_NAMES === 'object') for (const k in MOD_NAMES) if (!A.MODS.some((m) => m[0] === k)) A.MODS.push([k, String(MOD_NAMES[k])]);
  }

  /* ---------------------------------------------------------------- the guide: a card per snake and boss, an entry per room */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fig = (snake, name, size, txt) => `<figure><canvas data-snake="${snake}" aria-hidden="true"></canvas><figcaption><b>${esc(name)}</b><span class="size">${esc(size)}</span><span>${esc(txt)}</span></figcaption></figure>`;
  const LEGACY_GUIDE = {
    creeper: ['Small, from the Rift Wyrm', 'Square, green and quiet. The Rift Wyrm drops them in its fight. Walks up to you, hisses, and blows up. Shoot it first or step away.'],
    splitling: ['Tiny, from a Splitter', 'What is left when a Splitter dies. Fast and weak: one or two seeds each.'],
    rotling: ['Tiny, from a Rot Eater', 'A bloated Rot Eater spits these out while it feeds and when it dies. Fast and weak, but they come in groups.'],
  };
  for (const k in LEGACY_GUIDE) if (KINDS[k] && !KINDS[k].guide14) KINDS[k].guide14 = LEGACY_GUIDE[k];
  const cardKinds = () => new Set([...document.querySelectorAll('#tab-snakes canvas[data-snake]')].flatMap((c) => c.dataset.snake.split(',')));
  const guideSnakes = () => C().snakes().filter((k) => !NOT_SNAKE[k]);
  const guideBosses = () => C().bosses().filter((k) => k !== 'pricewar');   // pricewar shows as its two halves
  function guide() {
    const decks = document.querySelectorAll('#tab-snakes .cards.snakes');
    if (decks.length) {
      const have = cardKinds(), add0 = [], add1 = [];
      for (const k of guideSnakes()) if (!have.has(k)) { const g = KINDS[k].guide14 || ['Snake', 'A snake from the game.']; add0.push(fig(k, KINDS[k].name || k, g[0], g[1])); }
      for (const k of guideBosses()) if (!have.has(k)) { const I = BOSS_INFO[k] || {}; add1.push(fig(k, I.title || k, 'Boss', I.sub || 'A boss from the game.')); }
      if (add0.length) decks[0].insertAdjacentHTML('beforeend', add0.join(''));
      if (add1.length) (decks[1] || decks[0]).insertAdjacentHTML('beforeend', add1.join(''));
    }
    const list = document.querySelector('#tab-rooms ul.rooms9');
    if (list) {
      const add = [];
      for (const t of C().rooms()) {
        const ri = C().info(t); if (!ri || roomInGuide(t)) continue;
        add.push(`<li data-room="${esc(t)}"><i style="background:${esc(ri.col || '#a08aff')}" aria-hidden="true"></i><b>${esc(ri.name)}</b><span>${esc(ri.guide || ri.desc)}</span></li>`);
      }
      if (add.length) {
        list.insertAdjacentHTML('beforeend', add.join(''));
        const tab = document.getElementById('tab-rooms');   // the room cards (src/58) take the new entries too
        if (tab && tab._r19 && B.rooms19) { tab._r19 = false; B.rooms19(); }
      }
    }
  }
  /* a room is in the guide when an entry carries its type or its name, in the Rooms or the Modes tab */
  function roomInGuide(t) {
    const ri = C().info(t); if (!ri) return true;
    const lis = [...document.querySelectorAll('#tab-rooms ul.rooms9 li, #tab-modes ul.rooms9 li, #tab-modes .mc19')];
    const nm = ri.name.toLowerCase().replace(/^(de|het) /, '').replace(/ \(.*\)$/, '');
    return lis.some((li) => li.dataset.room === t || (li.querySelector('b') && li.querySelector('b').textContent.toLowerCase().includes(nm)));
  }

  /* ---------------------------------------------------------------- what any feature still misses */
  function audit() {
    const out = {}, miss = (key, all, have) => { const m = all.filter((k) => !have.includes(k)); if (m.length) out[key] = m; };
    const cat = { floors: C().floors(), bosses: C().bosses().filter((k) => !NOT_BOSS[k]), snakes: C().snakes().filter((k) => !NOT_SNAKE[k]),
      rooms: C().rooms().filter((t) => !NOT_ROOM[t]), mods: C().mods() };
    const A = B.V119, MK = B.MK123, cu = B.cust10;
    if (A) {
      miss('admin.rooms', cat.rooms, A.TYPES.map((t) => t[0]));
      miss('admin.mods', cat.mods, A.MODS.map((m) => m[0]));
      miss('admin.bosses', cat.bosses, CHAOS_BOSSES9);
      miss('admin.snakes', cat.snakes.concat(cat.bosses.filter((k) => KINDS[k])), Object.keys(KINDS));
    }
    if (MK && MK.SETS) {   // v14.10: before the Map Maker chunk loads, MK123 is only a stub
      miss('mapmaker.floors', cat.floors, MK.SETS);
      miss('mapmaker.snakes', cat.snakes, MK.SNAKES);
      miss('mapmaker.bosses', cat.bosses, MK.BOSSES);
      miss('mapmaker.mods', cat.mods.filter((k) => k !== 'swarm'), MK.MODS.map((m) => m[0]));
      miss('mapmaker.rooms', cat.rooms, MK.RTYPES.map((t) => t[0]));
    }
    if (cu) {
      miss('custom.floors', cat.floors, cu.floorList());
      miss('custom.bosses', cat.bosses, cu.bossList());
      const keys = cu.PG.flatMap((g) => g[1].map((r) => r[0]));
      miss('custom.hiddenRules', C().hidden().map((h) => h.rk), keys);
    }
    const have = cardKinds();
    miss('guide.snakes', cat.snakes, [...have]);
    miss('guide.bosses', guideBosses().filter((k) => !NOT_BOSS[k] || have.has(k)), [...have]);
    miss('guide.rooms', cat.rooms.filter((t) => C().info(t)), cat.rooms.filter((t) => C().info(t) && roomInGuide(t)));
    return out;
  }

  function sync() {
    safe(rules); safe(admin); safe(guide);
    safe(() => B.MK123 && B.MK123.refresh14());
  }
  sync();
  /* a file that loads later, or content registered at run time, still gets in: sync again when the panels open */
  safe(() => { const a0 = B.adm113; B.adm113 = function () { safe(admin); return a0 ? a0.apply(this, arguments) : undefined; }; });
  window.addEventListener('load', () => safe(sync));
  B.SYNC14 = { sync, audit, NOT_ROOM, NOT_BOSS, NOT_SNAKE };
})();
