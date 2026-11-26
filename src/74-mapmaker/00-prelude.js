/* 74.js section 00: prelude. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
/* src/74-v123-mapmaker.js: v12.3 to v12.6: Map Maker. From v12.3 to v12.6. Lines 34366 to 39286 of the v13.7 script. */
/* =====================================================================
   Bitten v12.3: Map Maker. Build your own dungeon floor by floor and room
   by room: paint every tile, drop snakes, traps and loot, set the rules,
   test it, and share the whole map as one line of text.
   New map pieces, usable anywhere in a map: teleporters, jump pads, speed
   strips, bumpers, fire bars, saw blades, spitter totems, powder kegs,
   snake nests, levers and gates, signs, pedestals, exit hatches, acid,
   weak floor, spike traps, keys and coin piles.
   ===================================================================== */
(function (M74) {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe74'); if (window.console) console.warn('v12.3', e); return fb; } }; M74.safe = safe;
  const $ = (id) => document.getElementById(id); M74.$ = $;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); M74.esc = esc;
  const S9 = (s) => (typeof say9 === 'function' ? say9(s) : s); M74.S9 = S9;
  const SF = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s); M74.SF = SF;
  const FONT = typeof UIF !== 'undefined' ? UIF : '"Barlow Condensed", "Arial Narrow", sans-serif'; M74.FONT = FONT;
  const MK = window.__bitten.MK123 = {}; M74.MK = MK;
  /* v14.10: the Map Maker is a lazy chunk (chunks/maker.js, every section file after this one). This stub stays in bitten.js:
     the menu button, the How to play tab, achievements and the texts lists exist from the start, the rest loads on first use.
     MK.ensure() loads it; MK.inMap() is false until then (no map run can be live without it). */
  const el0 = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const ensure = () => (typeof CHUNKS14 !== 'undefined' ? CHUNKS14.load('maker') : Promise.resolve(true));
  const ready = () => typeof CHUNKS14 === 'undefined' || CHUNKS14.loaded('maker') || !CHUNKS14.files.maker;
  Object.assign(MK, { ensure, ready, inMap: () => false, refresh14: () => {} });
  M74.ensure = ensure;
  safe(() => {
    const nav = document.querySelector('#menu .menu-list'), set = $('btnSet');
    if (!nav) return;
    const b = el0('button', 'mi mk123'); b.id = 'btnMaker'; b.type = 'button';
    const tiles = [0, 1, 0, 0, 1, 1, 2, 1, 0, 1, 1, 0].map((v) => `<i class="${v === 1 ? 'f' : v === 2 ? 'r' : ''}"></i>`).join('');
    b.innerHTML = `<i class="eye" aria-hidden="true"></i><span class="ml">Map Maker</span><small id="makerNow">Build a dungeon, share the code</small><span class="mkt" aria-hidden="true">${tiles}</span>`;
    if (set && set.parentNode === nav) nav.insertBefore(b, set); else nav.appendChild(b);
    b.addEventListener('click', (e) => { e.preventDefault(); safe(() => Sfx.init()); if (ready()) M74.Maker.openHub(); else ensure().then((ok) => ok && safe(() => M74.Maker.openHub())); });
    const paint = () => safe(() => {
      if (ready() && M74.Store) return;                    // the chunk paints it from its Store
      let n = 0; try { const d = JSON.parse(localStorage.getItem('bitten.maps.v1') || 'null'); n = d && Array.isArray(d.maps) ? d.maps.length : 0; } catch (e) { n = 0; }
      b.classList.toggle('new', !Save.data.seen.maker);
      $('makerNow').textContent = n ? `${n} map${n === 1 ? '' : 's'} in this browser` : 'Build a dungeon, share the code';
    });
    const rf = UI.refresh;
    UI.refresh = function () { const r = rf.apply(this, arguments); paint(); return r; };
    paint();
  });
  // a tab in How to play (the piece cards are drawn by the chunk)
  safe(() => {
    const tabs = $('howTabs'), how = document.querySelector('#how .sheet-inner');
    if (!tabs || !how) return;
    const tb = el0('button', null, 'Maps'); tb.type = 'button'; tb.setAttribute('role', 'tab'); tb.id = 't-maker'; tb.dataset.tab = 'maker'; tb.setAttribute('aria-controls', 'tab-maker'); tb.setAttribute('aria-selected', 'false'); tb.tabIndex = -1;
    const mus = tabs.querySelector('[data-tab="music"]');
    if (mus) tabs.insertBefore(tb, mus); else tabs.appendChild(tb);
    const panel = el0('div', 'tabpanel9 mk-gd'); panel.id = 'tab-maker'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 't-maker'); panel.hidden = true;
    const tips = [
      ['Floors and rooms', 'A map is one to eight floors. A floor is rooms on a grid, joined by doors. Every floor needs a start, and a lair or an exit hatch.'],
      ['Paint', 'Pick a piece, paint the room. Fill, box and mirror help. Right click rubs out. Undo is always there.'],
      ['Room types', 'Fights shut the doors. Halls stay open. Shops, chests, springs, gyms, lairs and arenas work like the real thing.'],
      ['Doors', 'Between two rooms: a door, a wall or a crack. A crack opens after three shots. A locked room needs a key.'],
      ['Rules', 'Set apples, coins, damage, speed, boss health, start powerups and the difficulty. The player can not change them.'],
      ['Share', 'Share gives one line of text with the whole map in it. Paste a code in the Map Maker to play it or edit a copy.'],
      ['Test', 'Test runs the whole map. Room starts you in the room you are looking at. Menu takes you back to the editor.'],
      ['Words', 'Paint text on the floor, drop notes that stop the game to read, set up shrines with two answers, shout over a room, and give snakes lines. Rooms, floors and the map can talk too.'],
      ['On a phone', 'Tap paints, drag paints a line, hold a tile to open its sheet. The Recent row keeps your last ten pieces close.'],
      ['It counts, a bit', 'Kills and rooms count. Escapes, wins and powerups found do not. Maps live in this browser: keep the code.'],
    ];
    panel.innerHTML = `<p class="intro9">Build your own dungeon in the Map Maker on the start screen. Every tile, every snake, every trap. Then send it to somebody.</p>
<div class="tips9">${tips.map(([b, s]) => `<div class="tip9"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
<h3>Map pieces</h3><div class="cards items" id="mkGuideCards"></div>
<p class="intro9" style="font-size:15px">Everything from the real game is in there too: rocks, pots, belts, carts, chests, slot machines, springs and every snake that can spawn.</p>`;
    if (mus) how.insertBefore(panel, document.getElementById('tab-music')); else how.appendChild(panel);
    if (!HOW_TABS9.includes('maker')) { const i = HOW_TABS9.indexOf('music'); if (i >= 0) HOW_TABS9.splice(i, 0, 'maker'); else HOW_TABS9.push('maker'); }
    const ht = UI.howTab;
    UI.howTab = function (id) { const r = ht.apply(this, arguments); if (id === 'maker' && !ready()) ensure().then(() => safe(() => { if (!$('tab-maker').hidden) UI.howTab('maker'); })); return r; };
    const modes = document.querySelector('#tab-modes ul.rooms9');
    if (modes) modes.insertAdjacentHTML('beforeend', '<li><i style="background:#e3a54a" aria-hidden="true"></i><b>Map Maker</b><span>Your own floors, rooms, snakes, traps and rules, shared as one line of text. On the start screen. Wins there do not count as escapes.</span></li>');
  });
  // achievements for building, finishing and sharing
  safe(() => {
    STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['mapsMade', 'Maps saved'], ['mapWins', 'Maps finished'], ['mapShares', 'Map codes shared'], ['mapImports', 'Maps loaded from a code']);
    ACHS.push(
      { id: 'mapmaker', reward: 'pick', name: 'Architect', desc: 'Save a map with at least 5 rooms in the Map Maker.', stat: 'mapsMade', goal: 1 },
      { id: 'mapwin', reward: 'graft', name: 'Playtester', desc: 'Finish a map with at least 3 rooms.', stat: 'mapWins', goal: 1 },
      { id: 'mapshare', reward: 'hagel', name: 'Word Of Mouth', desc: 'Copy a map code to share it.', stat: 'mapShares', goal: 1 },
    );
  });
  // the texts file: every new piece, room type and message
  safe(() => {
    const msgs = ['Guarded', 'Something lives here. The doors shut.', 'A way down', 'The hatch is open', 'Daylight', 'Walk into the light', 'Map cleared', 'Play again', 'Try again', 'Editor', 'Maps',
      'Something moved', 'Gates shifted somewhere else on this floor.', 'Locked', 'A key opens it. One is somewhere on this floor.', 'Its key drops in the next fight you win on this floor.',
      'A hidden way', 'The wall gave in. Somebody built it like that.', 'Bad answer', 'Something came out of the walls.'];
    for (const s of msgs) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
    for (const s of ['NO PARTNER', 'ACID', 'NEST DOWN', 'CLICK', 'RED GATES', 'BLUE GATES', 'GREEN GATES', 'GOLD GATES', '+1 APPLE', '+10 COINS', '-10 COINS', 'NOTHING']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
    // the texts download waits for the chunk, so the map pieces are in it; a texts file loaded before it is applied again after
    const dl = UI.downloadTexts;
    UI.downloadTexts = function () { if (ready()) return dl.apply(this, arguments); const a = arguments; return ensure().then(() => dl.apply(UI, a)); };
    let pend = null;
    const ta = Texts.apply;
    Texts.apply = function (o) { if (!ready() && o && (o.map_pieces || o.map_rooms || o.map_tiles)) pend = o; return ta.apply(this, arguments); };
    if (typeof CHUNKS14 !== 'undefined') CHUNKS14.onLoad('maker', () => { if (pend) { const o = pend; pend = null; safe(() => Texts.apply(o)); } safe(() => MK.refresh14()); safe(() => window.__bitten.SYNC14 && window.__bitten.SYNC14.sync && window.__bitten.SYNC14.sync()); });
  });
  // a map run (Map Maker test, a coop Map run, an online one) waits for the chunk; every other run never needs it
  if (typeof CHUNKS14 !== 'undefined') CHUNKS14.whenCore(() => {
    Hooks.layer('Game.startRun', 'v14.10 maker chunk gate', function (next, story, mode) {
      const m = mode === undefined ? Save.data.mode : mode;
      if (m !== 'map' || ready()) return next.apply(this, [].slice.call(arguments, 1));
      const a = [].slice.call(arguments, 1);
      ensure().then(() => Game.startRun.apply(Game, a));
    });
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
