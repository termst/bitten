/* 74.js section 13: chests-rewards. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, ART, ENTS, ENT_ORDER, ENT_PARAMS, FLAT, FONT, GH, GW, HELP, IC, MK, Maker, P_, ROOM_FIELDS, RTM, R_, TILE, btn, canvasIcon, changed, cleanRoom, closeDlg, dlg, el, entDefaults, esc, field, inMap, label, newRoom, pickItem, pushUndo, putOb, row, safe, scheduleSave, seg, selectOf } = M74;
  M74.itemBtn = itemBtn; M74.pickMany = pickMany;
  /* ================================================================== 12. v12.5: chests that open, rewards you choose, a powerup pool */

  /* ---- the chest piece: a real chest with contents you pick */
  ENTS.cb = { name: 'Treasure chest', cat: 'loot', solid: 1, desc: 'A chest that opens when you walk up to it. You pick what is inside: random, legendary, or exact powerups, plus coins, apples or a key. Can be a mimic.' };
  ENT_PARAMS.cb = [
    P_('n', 'Powerups inside', 'seg', [[0, 'None'], [1, 'One'], [2, 'Two'], [3, 'Three']], 2),
    P_('i1', 'First', 'item', null, 'rand'), P_('i2', 'Second', 'item', null, 'rand'), P_('i3', 'Third', 'item', null, 'rand'),
    P_('x', 'Also inside', 'sel', [['', 'Nothing else'], ['coins', '10 coins'], ['heart', 'One apple'], ['key', 'A key'], ['all', 'Coins, an apple and a key']], ''),
    P_('mim', 'Mimic', 'seg', [[0, 'No'], [1, 'It bites first']], 0),
  ];
  Maker.bp.cb = entDefaults('cb');
  ENT_ORDER.loot = ['cb'].concat(ENT_ORDER.loot.filter((t) => t !== 'cb'));
  ENTS.pd.name = 'Powerup pedestal';
  ENTS.pd.desc = 'One powerup on a stone. Pick the exact one, a random one or a random legendary. Free or for coins.';
  FLAT.cb = 5;
  const CHEST_STUB = (x, y) => ({ x, y, c: 0, r: 0, open: false, t: 0, woke: false, mimic: false, seed: 0.4, shake: 0, wob: 0 });
  ART.cb = (c, x, y, e, t, mode) => {
    safe(() => drawChest(c, CHEST_STUB(x, y), mode === 'icon' ? 0 : t));
    if (mode === 'edit') {
      const n = e.n == null ? 2 : e.n;
      label(c, x + 12, y - 13, String(n), '#ffc53a', 8);
      if (e.mim) label(c, x - 12, y - 13, 'M', '#e83a50', 8);
    }
  };

  // what a chosen item turns into when the run starts
  function rollItem(id) {
    const P = G.player;
    if (id === 'rare') return nextItemId(1);
    if (id === 'rand' || !ITEMS[id] || (P && P.items.includes(id)) || G.run.pending.has(id)) return nextItemId(0.12);
    return id;
  }
  function dropItemAt(room, id, x, y, grp) {
    if (id !== 'golden') G.run.pending.add(id);
    room.pickups.push(Object.assign({ kind: 'item', id, x, y, t: 0 }, grp ? { grp } : {}));
    flashLight(x, y, 100, 0.8, 0.9);
    burst(x, y, 12, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true });
  }
  function dropExtra(room, kind, x, y) {
    if (kind === 'coins' || kind === 'all') dropCoins(room, x, y, 10);
    if (kind === 'heart' || kind === 'all') dropHeart(room, x + (kind === 'all' ? 30 : 0), y, 2);
    if (kind === 'key' || kind === 'all') dropKey(room, x - (kind === 'all' ? 30 : 0), y);
  }

  safe(() => {
    // the piece becomes a real chest obstacle
    const se0 = M74.setupEnt;
    M74.setupEnt = function (room, e, def, map) {
      if (e.t !== 'cb') return se0.apply(this, arguments);
      const o = putOb(room, 'chest', e.c, e.r, { open: false, t: 0, mimic: !!e.mim, mkChest: e });
      if (!room.chest) room.chest = o;
    };
    // a chest piece holds what the maker put in it
    const ci0 = Game.chestItems;
    Game.chestItems = function (room, ch) {
      if (!ch || !ch.mkChest) return ci0.apply(this, arguments);
      const e = ch.mkChest, n = e.n == null ? 2 : e.n, grp = 'mk' + ch.c + '_' + ch.r + '_' + G.levelIdx;
      const ids = [e.i1, e.i2, e.i3].slice(0, n).map((id) => rollItem(id || 'rand'));
      ids.forEach((id, i) => { const x = ch.x + (ids.length === 1 ? 0 : (i - (ids.length - 1) / 2) * 44), y = ch.y - 38; const f = nearestFreeCell(room, x, y); dropItemAt(room, id, f.x, f.y, ids.length > 1 && !e.mim ? null : null); });
      if (e.x) { const f = nearestFreeCell(room, ch.x, ch.y + 40); dropExtra(room, e.x, f.x, f.y); }
      if (G.map.chestExtra) { G.map.chestExtra = false; spawnItem(room, ch.x, ch.y + 40); }
    };
  });

  /* ---- more than one chest in a room: the game only tracked one */
  function chestSwap(room) {
    const P = G.player; if (!P || !room.obs) return;
    const cur = room.chest;
    if (cur && !cur.open && !cur.woke && dist(P.x, P.y, cur.x, cur.y) < P.r + 60) return;
    if (cur && cur.open && cur.pending) return;
    for (const o of room.obs) {
      if (o.type !== 'chest' || o === cur || o.open || o.woke) continue;
      if (dist(P.x, P.y, o.x, o.y) < P.r + 60) { room.chest = o; return; }
    }
  }
  safe(() => {
    const ure9 = updateRoomExtras;
    updateRoomExtras = function (dt, room) {
      ure9.apply(this, arguments);
      if (room && G.state === 'play' && !(MK.Pop && MK.Pop.on)) safe(() => {
        chestSwap(room);
        // opened chests that are no longer the tracked one keep their lid moving
        for (const o of room.obs) if (o.type === 'chest' && o !== room.chest && o.open && o.t < 3) o.t += dt;
      });
    };
  });

  /* ---- rewards when a room is cleared */
  const RW_KINDS = [['item', 'Powerup'], ['heart', 'Apples'], ['coins', 'Coins'], ['key', 'Key'], ['chest', 'Chest (two random)']]; M74.RW_KINDS = RW_KINDS;
  const RW_N = { heart: [[1, 'Half'], [2, 'One'], [4, 'Two']], coins: [[5, '5'], [10, '10'], [20, '20'], [40, '40']] };
  function cleanRw(list) {
    const out = [];
    for (const r of Array.isArray(list) ? list : []) {
      if (!r || !RW_KINDS.some((k) => k[0] === r.k) || out.length >= 4) continue;
      const o = { k: r.k };
      if (r.k === 'item') o.id = r.id === 'rand' || r.id === 'rare' || (typeof r.id === 'string' && ITEMS[r.id]) ? r.id : 'rand';
      if (RW_N[r.k]) o.n = RW_N[r.k].some((x) => x[0] === r.n) ? r.n : RW_N[r.k][1][0];
      out.push(o);
    }
    return out;
  }
  function giveRewards(room) {
    const R = room.mkR; if (!R || !R.rw || !R.rw.length || room.mkRwDone) return;
    room.mkRwDone = true;
    const P = G.player, n = R.rw.length;
    R.rw.forEach((r, i) => {
      const f = nearestFreeCell(room, RW / 2 + (i - (n - 1) / 2) * 48, RH / 2);
      setTimeout(() => {
        if (G.room !== room || G.state !== 'play') return;
        if (r.k === 'item') dropItemAt(room, rollItem(r.id), f.x, f.y);
        else if (r.k === 'heart') dropHeart(room, f.x, f.y, r.n || 2);
        else if (r.k === 'coins') dropCoins(room, f.x, f.y, r.n || 10);
        else if (r.k === 'key') dropKey(room, f.x, f.y);
        else if (r.k === 'chest') {
          const cc = Math.max(0, Math.min(GW - 1, Math.floor(f.x / T))), rr = Math.max(0, Math.min(GH - 1, Math.floor(f.y / T)));
          if (Math.abs(P.x - f.x) < T && Math.abs(P.y - f.y) < T) { dropItemAt(room, rollItem('rand'), f.x, f.y); return; }
          const o = putOb(room, 'chest', cc, rr, { open: false, t: 0, mimic: false });
          room.ver = (room.ver || 0) + 1;
          if (!room.chest || room.chest.open) room.chest = o;
          burst(o.x, o.y, 16, '#e3a54a', { kind: 'shard', min: 30, max: 120, lmin: 0.3, lmax: 0.7 }); Sfx.thud();
        }
      }, 450 + i * 180);
    });
  }
  safe(() => {
    Hooks.layer('Game.clearRoom', 'v12.5 room rewards', function (next, room) {
      if (!inMap() || !room || !room.mkR) return next.apply(this, [].slice.call(arguments, 1));
      const R = room.mkR, keep = R.rg !== 0, first = !room.mkRwDone;
      const before = new Set(room.pickups);
      const r = next.apply(this, [].slice.call(arguments, 1));
      safe(() => {
        // a mimic outside a treasure room still pays out once it is dead
        const ch = room.chest;
        if (ch && ch.mimic && ch.woke && !ch.open && room.type !== 'chest') { ch.open = true; ch.t = 0; ch.pending = true; Sfx.chest(); }
        if (first && R.rw && R.rw.length) {
          if (!keep) for (const p of room.pickups.slice()) if (!before.has(p) && (p.kind === 'item' || p.kind === 'heart' || p.kind === 'coin')) { room.pickups.splice(room.pickups.indexOf(p), 1); if (p.kind === 'item') G.run.pending.delete(p.id); }
          giveRewards(room);
        } else if (first && !keep) { for (const p of room.pickups.slice()) if (!before.has(p) && (p.kind === 'item' || p.kind === 'heart' || p.kind === 'coin')) { room.pickups.splice(room.pickups.indexOf(p), 1); if (p.kind === 'item') G.run.pending.delete(p.id); } room.mkRwDone = true; }
      });
      return r;
    });
  });

  /* ---- the powerup pool: which powerups the map can roll */
  safe(() => {
    const nx0 = nextItemId;
    nextItemId = function (legend = 0.05) {
      const pool = inMap() && RTM.cur.pool;
      if (!pool || !pool.m || !pool.ids || !pool.ids.length) return nx0.apply(this, arguments);
      const P = G.player;
      if (P && P.flags && P.flags.blight) legend = Math.min(1, legend * 2);
      const ok = (id) => (pool.m === 'only' ? pool.ids.includes(id) : !pool.ids.includes(id));
      const free = ITEM_IDS.filter((id) => ok(id) && !P.items.includes(id) && !G.run.pending.has(id) && itemOk9(id, P));
      const rare = free.filter((id) => ITEMS[id].rare), norm = free.filter((id) => !ITEMS[id].rare);
      if (rare.length && (Math.random() < legend || !norm.length)) return weightedPick(rare);
      return norm.length ? weightedPick(norm) : 'golden';
    };
  });

  /* ---- saving it all: room rewards and the pool go into the map and the code */
  function cleanPool(p) {
    if (!p || typeof p !== 'object') return { m: '', ids: [] };
    const m = p.m === 'only' || p.m === 'ban' ? p.m : '';
    const ids = (Array.isArray(p.ids) ? p.ids : []).filter((id, i, a) => typeof id === 'string' && ITEMS[id] && a.indexOf(id) === i).slice(0, 120);
    return { m, ids };
  }
  safe(() => {
    ROOM_FIELDS.push(
      { k: 'rw', init: () => [], clean: (R) => cleanRw(R.rw), out: (v) => (v && v.length ? v.map((x) => Object.assign({}, x)) : undefined) },
      { k: 'rg', init: () => 1, clean: (R) => (R.rg === 0 ? 0 : 1), out: (v) => (v === 0 ? 0 : undefined) });
    const cm0 = M74.cleanMap;
    M74.cleanMap = function (M) { const o = cm0.apply(this, arguments); o.pool = cleanPool(M && M.pool); return o; };
    const nm0 = M74.newMap;
    M74.newMap = function () { const o = nm0.apply(this, arguments); o.pool = { m: '', ids: [] }; return o; };
    const cp0 = M74.compact;
    M74.compact = function (M) {
      const o = cp0.apply(this, arguments);
      if (M.pool && M.pool.m && M.pool.ids.length) o.pool = { m: M.pool.m, ids: M.pool.ids.slice() };
      return o;
    };
  });

  /* ---- the editor: a Rewards block in Room, a Powerup pool in Map */
  const FIGHTY = ['fight', 'arena', 'miniboss', 'challenge', 'survival', 'boss'];
  function itemBtn(id, onPick) {
    const b = el('button', 'mk-pick'); b.type = 'button';
    b.appendChild(canvasIcon(32, (c, s) => { c.translate(s / 2, s / 2); if (id === 'rand' || id === 'rare') { c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 22px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, id, s * 0.8, 1); }));
    b.appendChild(el('span', null, esc(id === 'rand' ? 'Random powerup' : id === 'rare' ? 'Random legendary' : ITEMS[id].name)));
    b.addEventListener('click', (e) => { e.preventDefault(); pickItem(id, true, onPick); });
    return b;
  }
  function rewardSection(R) {
    const sec = el('div', 'mk-sec mk-rw');
    sec.appendChild(el('h4', 'mk-h', 'Reward when the fight is won'));
    if (!R.rw) R.rw = [];
    const fighty = FIGHTY.includes(R.t) || R.e.some((e) => e.t === 'sn' || e.t === 'ns');
    if (!fighty) sec.appendChild(el('div', 'mk-note', 'This room has no fight, so it never gets won. Put snakes in it, or use a chest or a pedestal here instead.'));
    const upd = (fn) => { pushUndo(); fn(); changed(); };
    R.rw.forEach((r, i) => {
      const line = el('div', 'mk-rwl');
      line.appendChild(selectOf(RW_KINDS, r.k, (v) => upd(() => { R.rw[i] = cleanRw([{ k: v }])[0]; })));
      if (r.k === 'item') line.appendChild(itemBtn(r.id || 'rand', (id) => upd(() => { r.id = id; })));
      else if (RW_N[r.k]) line.appendChild(seg(RW_N[r.k], r.n, (v) => upd(() => { r.n = v; })));
      else line.appendChild(el('span', 'mk-p', r.k === 'key' ? 'Opens one locked room.' : 'Lands in the middle. Opens like any chest.'));
      line.appendChild(btn('ic red', IC.trash, 'Remove this reward', () => upd(() => { R.rw.splice(i, 1); })));
      sec.appendChild(line);
    });
    if (R.rw.length < 4) sec.appendChild(btn('gold', IC.plus + 'Add a reward', 'Add something that drops when the room is won', () => upd(() => { R.rw.push({ k: 'item', id: 'rand' }); })));
    sec.appendChild(row('The game’s own drops', seg([[1, 'Keep them'], [0, 'Only mine']], R.rg === 0 ? 0 : 1, (v) => upd(() => { R.rg = v; }))));
    sec.appendChild(el('p', 'mk-p', 'Rewards land in the middle of the room when the last snake goes down. Exact powerups you already carry turn into a random one. Up to four.'));
    return sec;
  }
  function pickMany(cur, done) {
    const sel = new Set(cur);
    const body = el('div');
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search powerups'; q.setAttribute('aria-label', 'Search powerups');
    body.appendChild(q);
    let only = '';
    const flt = seg([['', 'All'], ['rare', 'Legendary'], ['on', 'Picked']], only, (v) => { only = v; fill(); flt.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['', 'rare', 'on'][i] === v)); });
    flt.style.marginTop = '8px'; body.appendChild(flt);
    const cnt = el('p', 'mk-p'); cnt.style.margin = '8px 0 0'; body.appendChild(cnt);
    const list = el('div', 'mk-plist'); body.appendChild(list);
    const ids = ITEM_IDS.filter((id) => ITEMS[id]).sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
    const shown = () => { const qq = q.value.trim().toLowerCase(); return ids.filter((id) => (!qq || ITEMS[id].name.toLowerCase().includes(qq) || ITEMS[id].desc.toLowerCase().includes(qq)) && (only !== 'rare' || ITEMS[id].rare) && (only !== 'on' || sel.has(id))); };
    const fill = () => {
      list.textContent = '';
      cnt.textContent = `${sel.size} picked`;
      for (const id of shown()) {
        const it = ITEMS[id];
        const b = el('button', (sel.has(id) ? 'on ' : '') + (it.rare ? 'rare' : '')); b.type = 'button'; b.title = it.desc; b.setAttribute('aria-pressed', sel.has(id) ? 'true' : 'false');
        b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.78, 1); }));
        b.appendChild(el('span', null, `${esc(it.name)}<small>${sel.has(id) ? 'In the list' : it.rare ? 'Legendary' : 'Powerup'}</small>`));
        b.addEventListener('click', (e) => { e.preventDefault(); if (sel.has(id)) sel.delete(id); else sel.add(id); fill(); });
        list.appendChild(b);
      }
    };
    q.addEventListener('input', fill);
    fill();
    dlg('Pick powerups', body, [
      btn('', 'Pick all shown', 'Add every powerup in the list', () => { for (const id of shown()) sel.add(id); fill(); }),
      btn('', 'Clear', 'Remove all', () => { sel.clear(); fill(); }),
      btn('gold', 'Done', 'Save the list', () => { closeDlg(); done([...sel]); }),
    ]);
  }
  function poolSection(M) {
    if (!M.pool) M.pool = { m: '', ids: [] };
    const P0 = M.pool;
    const sec = el('div', 'mk-sec');
    sec.appendChild(el('h4', 'mk-h', 'Powerup pool'));
    const upd = (fn) => { pushUndo(); fn(); scheduleSave(); M74.renderMapPane(); };
    sec.appendChild(field('Random powerups come from', seg([['', 'Everything'], ['only', 'Only these'], ['ban', 'Everything but these']], P0.m, (v) => upd(() => { P0.m = v; }))));
    if (P0.m) {
      const chips = el('div', 'mk-items');
      for (const id of P0.ids) {
        const b = el('button', 'mk-it'); b.type = 'button'; b.title = 'Remove ' + ITEMS[id].name;
        b.appendChild(canvasIcon(30, (c, s) => { c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.8, 1); }));
        b.appendChild(el('span', null, esc(ITEMS[id].name)));
        b.addEventListener('click', (e) => { e.preventDefault(); upd(() => { P0.ids = P0.ids.filter((x) => x !== id); }); });
        chips.appendChild(b);
      }
      sec.appendChild(chips);
      sec.appendChild(btn('gold', IC.plus + (P0.ids.length ? 'Change the list' : 'Pick powerups'), 'Choose powerups for the pool', () => pickMany(P0.ids, (ids) => upd(() => { P0.ids = ids; }))));
      const note = P0.m === 'only'
        ? (P0.ids.length < 4 ? `Only ${P0.ids.length} in the pool. Once they are taken, everything random turns into golden apples.` : `Chests, pedestals, bosses and pots only roll these ${P0.ids.length}.`)
        : `These ${P0.ids.length} never show up at random. Exact picks you place still do.`;
      sec.appendChild(el('p', 'mk-p', esc(note))).style.marginTop = '8px';
    } else sec.appendChild(el('p', 'mk-p', 'Every powerup can roll, like a normal run. Pick a list to narrow it down or ban a few.'));
    return sec;
  }
  safe(() => {
    const rr9 = M74.renderRoomPane;
    M74.renderRoomPane = function () {
      const r = rr9.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop;
        const sec = rewardSection(R_());
        const doors = pane.querySelector('.mk-doors'), h = doors && doors.previousElementSibling;
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const rm9 = M74.renderMapPane;
    M74.renderMapPane = function () {
      const r = rm9.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop;
        const sec = poolSection(Maker.M);
        const h = [...pane.querySelectorAll('.mk-h')].find((x) => /^Start powerups/.test(x.textContent));
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
  });

  // help and guide get a page on loot
  safe(() => {
    HELP.splice(3, 0, ['Loot', [
      ['Treasure chest', 'Under Loot. Opens when you walk up. Pick up to three exact powerups, random ones or random legendaries, plus coins, an apple or a key. Or make it a mimic.'],
      ['Pedestal', 'One powerup on a stone. Exact, random or legendary. Free or for coins.'],
      ['Room rewards', 'Room, Reward when the fight is won. Up to four drops in the middle of the room: powerups, apples, coins, a key or a chest. Keep the game’s own drops or switch them off.'],
      ['Powerup pool', 'Map, Powerup pool. Let random rolls come only from a list you pick, or ban a few. Exact picks always win.'],
    ]]);
  });

  const CSS9 = `
.mk-rwl{display:grid;grid-template-columns:minmax(0,150px) minmax(0,1fr) auto;gap:6px;align-items:center;margin-bottom:7px}
.mk-rwl .mk-pick{min-width:0}
.mk-rwl .mk-p{margin:0;font-size:13px}
.mk-rw>.mk-btn.gold{margin:2px 0 10px}
@media (max-width:420px){.mk-rwl{grid-template-columns:minmax(0,1fr) auto}.mk-rwl>:nth-child(2){grid-column:1/-1;grid-row:2}}`;
  safe(() => { const st = document.createElement('style'); st.id = 'mk125css'; st.textContent = CSS9; document.head.appendChild(st); });
  if (TILE.X) TILE.X.desc = 'A treasure chest with two random powerups. Want exact powerups inside? Use Treasure chest under Loot.';
  Object.assign(MK, { rollItem, chestSwap, cleanRw, cleanPool, pickMany, cleanMap: M74.cleanMap, cleanRoom, newMap: M74.newMap, newRoom, compact: M74.compact });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
