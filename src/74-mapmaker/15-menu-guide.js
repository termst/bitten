/* 74.js section 15: menu-guide. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { $, CSS, EFFECTS, ENTS, EXAMPLES, FX_SUB, HELP, Maker, RT, RW_KINDS, SF, Store, TILE, canvasIcon, el, entDefaults, esc, paintBrushIcon, safe } = M74;
  /* ================================================================== 10. the menu, the guide, achievements and the texts file
     (v14.10: the menu button, the How to play tab, achievements and texts lists are in 00-prelude.js, in bitten.js) */
  safe(() => { const st = document.createElement('style'); st.id = 'mk123css'; st.textContent = CSS; document.head.appendChild(st); });
  // v14.10: the button itself is made by the core stub (00-prelude.js), so it is there before this chunk loads
  safe(() => {
    const b = $('btnMaker'); if (!b) return;
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
  // a tab in How to play: the tab and its text come from the core stub, the piece cards from here
  safe(() => {
    const panel = $('tab-maker'); if (!panel) return;
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
  });
  // the texts file: every new piece, room type and message
  safe(() => {
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
