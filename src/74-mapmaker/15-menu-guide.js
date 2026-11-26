/* 74.js section 15: menu-guide. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, CSS, EFFECTS, ENTS, EXAMPLES, FX_SUB, HELP, Maker, RT, RW_KINDS, SF, Store, TILE, canvasIcon, el, entDefaults, esc, paintBrushIcon, safe } = M74;
  /* ================================================================== 10. the menu, the guide, achievements and the texts file */
  safe(() => { const st = document.createElement('style'); st.id = 'mk123css'; st.textContent = CSS; document.head.appendChild(st); });
  safe(() => {
    const nav = document.querySelector('#menu .menu-list'), set = $('btnSet');
    if (!nav) return;
    const b = el('button', 'mi mk123'); b.id = 'btnMaker'; b.type = 'button';
    const tiles = [0, 1, 0, 0, 1, 1, 2, 1, 0, 1, 1, 0].map((v) => `<i class="${v === 1 ? 'f' : v === 2 ? 'r' : ''}"></i>`).join('');
    b.innerHTML = `<i class="eye" aria-hidden="true"></i><span class="ml">Map Maker</span><small id="makerNow">Build a dungeon, share the code</small><span class="mkt" aria-hidden="true">${tiles}</span>`;
    if (set && set.parentNode === nav) nav.insertBefore(b, set); else nav.appendChild(b);
    b.addEventListener('click', (e) => { e.preventDefault(); safe(() => Sfx.init()); Maker.openHub(); });
    const paint = () => safe(() => {
      Store.load();
      b.classList.toggle('new', !Save.data.seen.maker);
      const n = Store.list.length;
      $('makerNow').textContent = n ? `${n} map${n === 1 ? '' : 's'} in this browser` : 'Build a dungeon, share the code';
    });
    const rf = UI.refresh;
    UI.refresh = function () { const r = rf.apply(this, arguments); paint(); return r; };
    paint();
  });
  // the menu scene sleeps while the Map Maker covers it
  safe(() => {
    const mr0 = MenuScene.render;
    MenuScene.render = function (c) { if (Maker.open) { c.fillStyle = '#0b0807'; c.fillRect(0, 0, View.W, View.H); return; } return mr0.apply(this, arguments); };
    const bk0 = UI.back;
    UI.back = function () { if (Maker.open) return; return bk0.apply(this, arguments); };
  });
  // a tab in How to play
  safe(() => {
    const tabs = $('howTabs'), how = document.querySelector('#how .sheet-inner');
    if (!tabs || !how) return;
    const tb = el('button', null, 'Maps'); tb.type = 'button'; tb.setAttribute('role', 'tab'); tb.id = 't-maker'; tb.dataset.tab = 'maker'; tb.setAttribute('aria-controls', 'tab-maker'); tb.setAttribute('aria-selected', 'false'); tb.tabIndex = -1;
    const mus = tabs.querySelector('[data-tab="music"]');
    if (mus) tabs.insertBefore(tb, mus); else tabs.appendChild(tb);
    const panel = el('div', 'tabpanel9 mk-gd'); panel.id = 'tab-maker'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 't-maker'); panel.hidden = true;
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
    const cards = panel.querySelector('#mkGuideCards');
    const order = ['cb', 'pd', 'tx', 'nt', 'cq', 'sh', 'sg', 'pl', 'tp', 'jp', 'sp', 'bm', 'lv', 'gt', 'ex', 'fb', 'sw', 'tt', 'bx', 'ns', 'ac', 'wk', 'sk', 'ky', 'cn'];
    const fill = () => {
      cards.textContent = '';
      for (const t of order) {
        const f = el('figure');
        f.appendChild(canvasIcon(46, (c, s) => paintBrushIcon(c, s, { k: 'ent', t, p: Object.assign({}, entDefaults(t), t === 'tp' || t === 'lv' || t === 'gt' || t === 'pl' ? { ch: 0 } : {}) }, 'cellar')));
        const cap = el('figcaption'); cap.innerHTML = `<b>${esc(SF(ENTS[t].name))}</b><span>${esc(SF(ENTS[t].desc))}</span>`;
        f.appendChild(cap); cards.appendChild(f);
      }
    };
    const ht = UI.howTab;
    UI.howTab = function (id) { const r = ht.apply(this, arguments); if (id === 'maker') safe(fill); return r; };
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
    const tc0 = Texts.collect;
    Texts.collect = function () {
      const o = tc0.apply(this, arguments);
      o.map_pieces = {}; for (const t in ENTS) o.map_pieces[t] = { name: ENTS[t].name, desc: ENTS[t].desc };
      o.map_tiles = {}; for (const ch in TILE) o.map_tiles[TILE[ch].id] = { name: TILE[ch].name, desc: TILE[ch].desc };
      o.map_rooms = {}; for (const id in RT) o.map_rooms[id] = { name: RT[id].name, desc: RT[id].desc };
      o.map_reward_kinds = {}; for (const [k, name] of RW_KINDS) o.map_reward_kinds[k] = name;
      o.map_choice_effects = {}; for (const [k, name] of EFFECTS) o.map_choice_effects[k] = { name, shows: FX_SUB[k] || '' };
      o.map_maker_help = {}; for (const [page, tips] of HELP) o.map_maker_help[page] = tips.map(([b, t]) => ({ title: b, text: t }));
      o.map_examples = {}; for (const M of EXAMPLES()) o.map_examples[M.id] = { name: M.name, desc: M.desc, intro: M.it || '', win: M.ot || '' };
      return o;
    };
    const ta0 = Texts.apply;
    Texts.apply = function (o) {
      const r = ta0.apply(this, arguments);
      safe(() => {
        if (o && o.map_pieces) for (const t in o.map_pieces) if (ENTS[t]) setFields9(ENTS[t], o.map_pieces[t], ['name', 'desc']);
        if (o && o.map_rooms) for (const id in o.map_rooms) if (RT[id]) setFields9(RT[id], o.map_rooms[id], ['name', 'desc']);
        if (o && o.map_tiles) for (const ch in TILE) if (o.map_tiles[TILE[ch].id]) setFields9(TILE[ch], o.map_tiles[TILE[ch].id], ['name', 'desc']);
      });
      return r;
    };
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
