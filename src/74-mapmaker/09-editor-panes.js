/* 74.js section 09: editor-panes. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, BOSSES, CATS, CH_COLS, CH_NAMES, DARK, DIFF_OPTS, EMPTY, ENTS, ENT_ORDER, ENT_PARAMS, FH, FIXED, FONT, FW, F_, GH, GN, GW, IC, LIMITS, MINIS, MIRX, MIRY, MODS, MOUTH, Maker, NEEDS, RT, RTYPES, RULES, R_, SETS, SIDES, SNAKES, SOLID_TILE, Store, TILE, TILES, TYPE_ICON, bossName, bossSprite, btn, canvasIcon, cellCh, changed, cleanRoom, cloneMap, doorsOf, edgeOf, el, entAt, esc, field, mapStats, neighbor, newRoom, paintBrushIcon, pushUndo, roomAt, row, rowsOf, saveNow, scheduleSave, seg, setDef, setEdge, setName, setPane, showHub, snakeName, snakeSprite, syncEdges, toast, typeTemplate, uid } = M74;
  M74.brushName = brushName; M74.brushDesc = brushDesc; M74.renderPaint = renderPaint; M74.fillPal = fillPal; M74.pickBrush = pickBrush; M74.renderInspector = renderInspector; M74.paramControl = paramControl; M74.renderRoomPane = renderRoomPane; M74.selectOf = selectOf; M74.setType = setType; M74.flipEnt = flipEnt; M74.pasteRoom = pasteRoom; M74.renderFloor = renderFloor; M74.selectRoom = selectRoom; M74.goFloor = goFloor; M74.addRoom = addRoom; M74.cycleEdge = cycleEdge; M74.renderMapPane = renderMapPane; M74.validate = validate; M74.validateSoon = validateSoon; M74.renderCrumb = renderCrumb;
  /* ---- the palette */
  function brushList(cat) {
    const out = [];
    if (cat === 'snakes') { for (const k of SNAKES) out.push({ k: 'ent', t: 'sn', p: { k, g: 0, tr: '' }, name: snakeName(k), id: 'sn:' + k }); return out; }
    for (const [ch, id, name, c] of TILES) if (c === cat && ch !== '.') out.push({ k: 'tile', ch, name, id: 't:' + ch });
    if (cat === 'blocks') out.unshift({ k: 'tile', ch: '.', name: 'Floor', id: 't:.' });
    for (const t of ENT_ORDER[cat] || []) {
      if (t === 'tp' || t === 'lv' || t === 'gt' || t === 'pl') { for (let ch = 0; ch < 4; ch++) out.push({ k: 'ent', t, p: Object.assign({}, Maker.bp[t], { ch }), name: `${ENTS[t].name} ${CH_NAMES[ch]}`, id: `${t}:${ch}` }); }
      else if (t === 'sk') { for (let g = 0; g < 2; g++) out.push({ k: 'ent', t, p: { g }, name: `Spikes ${g ? 'B' : 'A'}`, id: `sk:${g}` }); }
      else out.push({ k: 'ent', t, p: Maker.bp[t], name: ENTS[t].name, id: t, isNew: true });
    }
    return out;
  }
  const brushId = (b) => (b.k === 'tile' ? 't:' + b.ch : b.t === 'sn' ? 'sn:' + b.p.k : (b.t === 'tp' || b.t === 'lv' || b.t === 'gt' || b.t === 'pl') ? `${b.t}:${b.p.ch || 0}` : b.t === 'sk' ? `sk:${b.p.g || 0}` : b.t); M74.brushId = brushId;
  function brushName(b) {
    if (b.k === 'tile') return TILE[b.ch].name;
    if (b.t === 'sn') return snakeName(b.p.k);
    if (b.t === 'tp' || b.t === 'lv' || b.t === 'gt' || b.t === 'pl') return `${ENTS[b.t].name} ${CH_NAMES[b.p.ch || 0]}`;
    return ENTS[b.t].name;
  }
  function brushDesc(b) { return b.k === 'tile' ? TILE[b.ch].desc : b.t === 'sn' ? snakeDesc(b.p.k) : ENTS[b.t].desc; }
  function snakeDesc(k) {
    const box = document.querySelector(`#tab-snakes canvas[data-snake="${k}"]`);
    const sp = box && box.parentElement && box.parentElement.querySelector('figcaption span:last-child');
    return (sp && sp.textContent) || `${snakeName(k)}. It bites.`;
  }
  function renderPaint() {
    const pane = $('mkPanePaint'); pane.textContent = '';
    const cats = el('div', 'mk-cats');
    for (const [id, label] of CATS) { const b = el('button', Maker.cat === id && !Maker.q ? 'on' : '', esc(label)); b.type = 'button'; b.addEventListener('click', (e) => { e.preventDefault(); Maker.cat = id; Maker.q = ''; M74.renderPaint(); }); cats.appendChild(b); }
    pane.appendChild(cats);
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search pieces'; q.value = Maker.q; q.setAttribute('aria-label', 'Search pieces'); q.style.marginBottom = '8px';
    q.addEventListener('input', () => { Maker.q = q.value.trim().toLowerCase(); M74.fillPal(); });
    pane.appendChild(q);
    const pal = el('div', 'mk-pal'); pal.id = 'mkPal'; pane.appendChild(pal);
    const ins = el('div'); ins.id = 'mkIns'; pane.appendChild(ins);
    M74.fillPal(); M74.renderInspector();
  }
  function fillPal() {
    const pal = $('mkPal'); if (!pal) return;
    pal.textContent = '';
    let list;
    if (Maker.q) { list = []; const seen = new Set(); for (const [id] of CATS) for (const b of brushList(id)) if (!seen.has(b.id) && (b.name.toLowerCase().includes(Maker.q) || (b.k === 'ent' && ENTS[b.t].desc.toLowerCase().includes(Maker.q)))) { seen.add(b.id); list.push(b); } }
    else list = brushList(Maker.cat);
    const set = F_().set, cur = brushId(Maker.brush);
    for (const b of list) {
      const e = el('button', 'mk-br' + (b.id === cur ? ' on' : '') + (b.isNew && !Maker.seenBr[b.id] ? ' new' : '')); e.type = 'button'; e.title = b.name;
      e.appendChild(canvasIcon(42, (c, s) => paintBrushIcon(c, s, b, set)));
      e.appendChild(el('span', null, esc(b.name)));
      e.addEventListener('click', (ev) => { ev.preventDefault(); Maker.seenBr[b.id] = 1; M74.pickBrush(b); });
      pal.appendChild(e);
    }
    if (!list.length) pal.appendChild(el('p', 'mk-p', 'Nothing by that name.'));
  }
  function pickBrush(b) {
    Maker.brush = b.k === 'tile' ? { k: 'tile', ch: b.ch } : { k: 'ent', t: b.t, p: Object.assign({}, b.p) };
    if (b.k === 'ent' && b.t !== 'sn') Maker.bp[b.t] = Object.assign({}, Maker.bp[b.t], b.p);
    if (Maker.tool !== 'fill' && Maker.tool !== 'box') Maker.tool = 'brush';
    Maker.sel = null;
    M74.syncTools(); M74.fillPal(); M74.renderInspector();
  }
  // the card under the palette: the brush, or the selected piece in the room
  function renderInspector() {
    const box = $('mkIns'); if (!box) return;
    box.textContent = '';
    const R = R_();
    const selE = Maker.sel ? entAt(R, Maker.sel.c, Maker.sel.r) : null;
    const target = selE ? { k: 'ent', t: selE.t, p: selE } : Maker.brush;
    const card = el('div', 'mk-card');
    const hd = el('div', 'hd');
    hd.appendChild(canvasIcon(44, (c, s) => paintBrushIcon(c, s, target.k === 'ent' ? { k: 'ent', t: target.t, p: target.p } : target, F_().set)));
    const nm = el('div'); nm.innerHTML = `<small>${selE ? `Selected at ${colName(selE.c)}${selE.r + 1}` : Maker.tool === 'erase' ? 'Eraser' : 'Painting with'}</small><b>${esc(Maker.tool === 'erase' && !selE ? 'Floor' : brushName(target))}</b>`;
    hd.appendChild(nm); card.appendChild(hd);
    card.appendChild(el('p', null, esc(brushDesc(target))));
    if (target.k === 'ent') {
      const t = target.t, obj = selE || Maker.bp[t] && t !== 'sn' ? (selE || Maker.bp[t]) : Maker.brush.p;
      const apply = (k, v) => {
        const pn = $('mkPanePaint'), keep = pn ? pn.scrollTop : 0;
        if (selE) { pushUndo(); selE[k] = v; changed(); }
        else { if (t === 'sn') Maker.brush.p[k] = v; else { Maker.bp[t][k] = v; Maker.brush.p[k] = v; } M74.fillPal(); }
        M74.renderInspector();
        if (pn) pn.scrollTop = keep;
      };
      for (const p of ENT_PARAMS[t]) card.appendChild(paramControl(p, obj, apply));
      if (selE) {
        const r2 = el('div', 'mk-acts'); r2.style.marginTop = '8px';
        r2.append(btn('', IC.brush + 'Use as brush', 'Paint with these settings', () => { const p = Object.assign({}, selE); delete p.c; delete p.r; delete p.t; M74.pickBrush({ k: 'ent', t: selE.t, p }); }),
          btn('red', IC.trash + 'Remove', 'Remove this piece', () => { pushUndo(); R.e = R.e.filter((e) => e !== selE); Maker.sel = null; changed(); M74.renderInspector(); }));
        card.appendChild(r2);
      }
    }
    if (Maker.tool === 'move' && !selE) card.appendChild(el('div', 'mk-note', 'Select: tap a piece to change its settings, drag it to move it. Delete removes it.'));
    box.appendChild(card);
  }
  const colName = (c) => 'ABCDEFGHIJK'[c]; M74.colName = colName;
  function paramControl(p, obj, apply) {
    const v = obj[p.k] != null ? obj[p.k] : p.def;
    if (p.kind === 'seg') return row(p.label, seg(p.opts, v, (nv) => apply(p.k, nv)));
    if (p.kind === 'col') return row(p.label, seg(CH_NAMES.map((n, i) => [i, n, `<i style="background:${CH_COLS[i]}"></i>`]), v, (nv) => apply(p.k, nv)));
    if (p.kind === 'dir4') return row(p.label, seg([[6, 'Up'], [0, 'Right'], [2, 'Down'], [4, 'Left']], v, (nv) => apply(p.k, nv)));
    if (p.kind === 'dir8' || p.kind === 'dir8a') {
      const opts = [[6, 'N'], [7, 'NE'], [0, 'E'], [1, 'SE'], [2, 'S'], [3, 'SW'], [4, 'W'], [5, 'NW']];
      if (p.kind === 'dir8a') opts.push([8, 'At you']);
      return row(p.label, seg(opts, v, (nv) => apply(p.k, nv)));
    }
    if (p.kind === 'text') {
      const ta = el(p.opts > 50 ? 'textarea' : 'input', 'mk-in'); ta.maxLength = p.opts; ta.value = v || ''; if (p.opts > 50) ta.rows = p.opts > 150 ? 4 : 2; ta.spellcheck = true;
      const cnt = el('em', 'mk-cnt', `${(v || '').length}/${p.opts}`);
      ta.addEventListener('input', () => { cnt.textContent = `${ta.value.length}/${p.opts}`; });
      ta.addEventListener('change', () => apply(p.k, ta.value.slice(0, p.opts)));
      const f = field(p.label, ta); f.firstChild.appendChild(cnt); return f;
    }
    if (p.kind === 'sel') return field(p.label, selectOf(p.opts, v, (nv) => apply(p.k, nv)));
    if (p.kind === 'snake') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => c.drawImage(snakeSprite(v), 0, 0, s, s)));
      b.appendChild(el('span', null, esc(snakeName(v))));
      b.addEventListener('click', (e) => { e.preventDefault(); M74.pickSnake(v, (k) => apply(p.k, k)); });
      return row(p.label, b);
    }
    if (p.kind === 'item') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => { c.translate(s / 2, s / 2); if (v === 'rand' || v === 'rare') { c.fillStyle = v === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 22px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, v, s * 0.8, 1); }));
      b.appendChild(el('span', null, esc(v === 'rand' ? 'Random powerup' : v === 'rare' ? 'Random legendary' : ITEMS[v].name)));
      b.addEventListener('click', (e) => { e.preventDefault(); M74.pickItem(v, true, (id) => apply(p.k, id)); });
      return row(p.label, b);
    }
    return el('div');
  }

  /* ---- the room pane */
  function renderRoomPane() {
    const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const F = F_(), R = R_();
    pane.appendChild(el('h4', 'mk-h', `Room ${colName(R.x)}${R.y + 1} on floor ${Maker.fi + 1}`));
    const types = el('div', 'mk-types');
    for (const [id, name, , col] of RTYPES) {
      const b = el('button', R.t === id ? 'on' : '', TYPE_ICON(col) + esc(name)); b.type = 'button'; b.title = RT[id].desc;
      b.addEventListener('click', (e) => { e.preventDefault(); setType(R, id); });
      types.appendChild(b);
    }
    pane.appendChild(types);
    const rdesc = el('p', 'mk-p', esc(RT[R.t].desc)); rdesc.style.marginTop = '8px'; pane.appendChild(rdesc);
    const opt = el('div');
    const upd = (k, v) => { pushUndo(); R[k] = v; changed(); };
    if (R.t === 'fight') opt.appendChild(field('Modifier', selectOf(MODS, R.m, (v) => upd('m', v))));
    if (R.t === 'arena') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      const k = BOSSES.includes(R.b) ? R.b : 'mother';
      b.appendChild(canvasIcon(32, (c, s) => { const sp = bossSprite(k); c.drawImage(sp, 0, 0, sp.width, sp.height, -s * 0.4, 0, s * 1.8, s); }));
      b.appendChild(el('span', null, esc(bossName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); M74.pickBoss(k, false, (v) => upd('b', v)); });
      opt.appendChild(row('Boss', b));
    }
    if (R.t === 'miniboss') {
      const k = MINIS.includes(R.b) ? R.b : (MINI_POOL[F.set] || MINI_POOL.cellar)[0];
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(32, (c, s) => c.drawImage(snakeSprite(k, true), 0, 0, s, s)));
      b.appendChild(el('span', null, esc(snakeName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); M74.pickSnake(k, (v) => upd('b', v), MINIS); });
      opt.appendChild(row('Gold snake', b));
    }
    if (R.t === 'survival') opt.appendChild(row('Hold out', seg([[15, '15 s'], [20, '20 s'], [25, '25 s'], [30, '30 s'], [45, '45 s'], [60, '60 s']], R.n, (v) => upd('n', v))));
    if (R.t === 'shop') opt.appendChild(row('Store', seg([['', 'Random'], ['blue', 'Blue'], ['yellow', 'Yellow']], R.st, (v) => upd('st', v))));
    if (R.t === 'chest') opt.appendChild(row('Mimic', seg([[0, 'No'], [1, 'It bites']], R.mim, (v) => upd('mim', v))));
    if (R.t === 'boss') {
      const bk = F.boss !== 'auto' ? F.boss : setDef(F.set).boss;
      opt.appendChild(el('div', 'mk-note', `The lair boss is set per floor: <b>${esc(bossName(bk))}</b>. Change it under Floor.`));
      if (typeof BOSS_TPL10 !== 'undefined' && BOSS_TPL10[bk] && R.g === EMPTY) opt.appendChild(el('div', 'mk-note', 'This boss brings its own furniture while the room is empty.'));
    }
    if (FIXED[R.t]) opt.appendChild(el('div', 'mk-note', 'This room has a fixed layout. Painting here does nothing.'));
    if (R.t === 'gym') opt.appendChild(el('div', 'mk-note', 'Coach Larspel puts his stations and furniture on top of whatever you paint.'));
    if (NEEDS[R.t] && ![...NEEDS[R.t]].some((ch) => R.g.includes(ch))) opt.appendChild(el('div', 'mk-note', 'Missing its pieces. They go back in their usual spot when you play. Find them under Room pieces.'));
    pane.appendChild(opt);
    if (R.t !== 'start') pane.appendChild(row('Locked', seg([[0, 'Open'], [1, 'Needs a key']], R.lk, (v) => upd('lk', v))));
    pane.appendChild(row('Spike traps', seg([[1, 'Always on'], [0, 'Only in a fight']], R.ta, (v) => upd('ta', v))));
    // the four ways out
    pane.appendChild(el('h4', 'mk-h', 'Doors'));
    const doors = el('div', 'mk-doors');
    for (const [s, nm] of [['n', 'North'], ['e', 'East'], ['s', 'South'], ['w', 'West']]) {
      const o = neighbor(F, R, s), d = el('div', 'mk-door');
      d.appendChild(el('span', null, `${nm} <em>${o ? esc(RT[o.t].name) : 'no room'}</em>`));
      if (o) d.appendChild(seg([['o', 'Door'], ['w', 'Wall'], ['c', 'Crack']], edgeOf(F, R, s), (v) => { pushUndo(); setEdge(F, R, s, v); changed(); }));
      else if (R.x + SIDES[s][0] >= 0 && R.x + SIDES[s][0] < FW && R.y + SIDES[s][1] >= 0 && R.y + SIDES[s][1] < FH) d.appendChild(btn('gold', IC.plus + 'Add room', 'Add a room on this side', () => addRoom(R.x + SIDES[s][0], R.y + SIDES[s][1], true)));
      else d.appendChild(el('span', null, '<em>Edge of the map</em>'));
      doors.appendChild(d);
    }
    pane.appendChild(doors);
    pane.appendChild(el('p', 'mk-p', 'A crack is a hidden way: shoot the wall three times to open it. The side closer to the start holds the crack.')).style.marginTop = '6px';
    // what you can do with the whole room
    pane.appendChild(el('h4', 'mk-h', 'This room'));
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('', IC.layout + 'Game layout', 'Fill with a layout from the game', () => loadLayout(R)),
      btn('', IC.flipX + 'Flip', 'Flip left and right', () => flipRoom(R, true)),
      btn('', IC.flipY + 'Flip', 'Flip top and bottom', () => flipRoom(R, false)),
      btn('', IC.copy + 'Copy', 'Copy this room', () => { Maker.clip = JSON.stringify({ g: R.g, e: R.e, t: R.t, m: R.m, b: R.b, n: R.n }); toast('Room copied'); M74.renderRoomPane(); }),
      btn('', IC.paste + 'Paste', 'Paste the copied room here', () => pasteRoom(R)),
      btn('', IC.erase + 'Clear', 'Clear this room', () => { pushUndo(); R.g = EMPTY; R.e = []; Maker.sel = null; changed(); toast('Room cleared'); }),
    );
    if (!Maker.clip) acts.children[4].disabled = true;
    pane.appendChild(acts);
    const del = btn('red', IC.trash + 'Delete room', 'Delete this room', () => {
      if (F.rooms.length <= 1) { toast('A floor needs at least one room.'); return; }
      if (!del.classList.contains('on')) { del.classList.add('on'); del.lastChild.textContent = 'Tap again to delete'; setTimeout(() => { del.classList.remove('on'); del.lastChild.textContent = 'Delete room'; }, 2600); return; }
      pushUndo(); F.rooms = F.rooms.filter((r) => r !== R); syncEdges(F);
      const nb = F.rooms[0]; Maker.rx = nb.x; Maker.ry = nb.y; changed(true);
    });
    del.innerHTML = IC.trash + '<span>Delete room</span>'; del.style.marginTop = '6px'; del.style.width = '100%';
    pane.appendChild(del);
    const st = { sn: 0, tr: 0, gd: 0, lt: 0 };
    for (const e of R.e) { const c = ENTS[e.t].cat; if (c === 'snakes') st.sn++; else if (c === 'traps') st.tr++; else if (c === 'gadgets' || c === 'text') st.gd++; else st.lt++; }
    const stats = el('div', 'mk-stats'); stats.style.marginTop = '10px';
    stats.innerHTML = `<span><b>${st.sn}</b>snakes</span><span><b>${st.tr}</b>traps</span><span><b>${st.gd}</b>gadgets</span><span><b>${st.lt}</b>loot</span>`;
    pane.appendChild(stats);
    pane.scrollTop = top;
  }
  function selectOf(opts, val, onPick) {
    const s = el('select', 'mk-in');
    for (const [v, label] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = label; if (v === val) o.selected = true; s.appendChild(o); }
    s.addEventListener('change', () => onPick(s.value));
    return s;
  }
  function setType(R, id) {
    if (R.t === id) return;
    const F = F_();
    pushUndo();
    if (id === 'start') for (const o of F.rooms) if (o !== R && o.t === 'start') o.t = 'hall';
    if (id === 'boss') for (const o of F.rooms) if (o !== R && o.t === 'boss') o.t = 'fight';
    if (R.t === 'start' && !F.rooms.some((o) => o !== R && o.t === 'start')) toast('The floor has no start now. Pick another room as start.');
    R.t = id;
    if (id === 'start') R.lk = 0;
    // a room type that needs its pieces gets them, on top of what is there
    const tpl = typeTemplate(id);
    if (tpl && (FIXED[id] || NEEDS[id])) {
      let g = R.g;
      for (let i = 0; i < GN; i++) {
        const ch = tpl[i]; if (ch === '.') continue;
        const c = i % GW, r = Math.floor(i / GW);
        if (FIXED[id]) { g = g.slice(0, i) + ch + g.slice(i + 1); continue; }
        if (g[i] !== '.' || entAt(R, c, r)) continue;
        g = g.slice(0, i) + ch + g.slice(i + 1);
      }
      if (FIXED[id]) { for (let i = 0; i < GN; i++) if (tpl[i] === '.') g = g.slice(0, i) + '.' + g.slice(i + 1); R.e = []; }
      R.g = g;
    }
    if (id === 'arena' && !BOSSES.includes(R.b)) R.b = 'mother';
    if (id === 'miniboss' && !MINIS.includes(R.b)) R.b = (MINI_POOL[F.set] || MINI_POOL.cellar)[0];
    changed(true);
  }
  function loadLayout(R) {
    const F = F_(), set = F.set;
    let pool;
    if (R.t === 'start') pool = [START_SETS[set] || START_SETS.cellar];
    else if (R.t === 'fight' || R.t === 'hall') pool = FIGHT_SETS[set] || FIGHT_SETS.cellar;
    else { const tp = typeTemplate(R.t); pool = tp ? [rowsOf(tp)] : FIGHT_SETS[set] || FIGHT_SETS.cellar; }
    Maker._lay = ((Maker._lay || 0) + 1) % pool.length;
    const tpl = pool[Maker._lay];
    pushUndo();
    const C = cleanRoom({ x: R.x, y: R.y, t: R.t, g: tpl.map((r) => (r + '...........').slice(0, GW)).join('').replace(/[12]/g, '.') });
    R.g = C.g; R.e = C.e;
    Maker.sel = null;
    changed();
    toast(`Layout ${Maker._lay + 1} of ${pool.length}`);
  }
  function flipEnt(e, x) {
    const n = Object.assign({}, e);
    if (x) n.c = GW - 1 - e.c; else n.r = GH - 1 - e.r;
    if ((e.t === 'jp' || e.t === 'sp') && e.d != null) n.d = (x ? MIRX : MIRY)[e.d];
    if (e.t === 'tt' && e.d != null && e.d < 8) n.d = (x ? MIRX : MIRY)[e.d];
    if (e.t === 'fb') { n.w = -(e.w || 1); n.a = (x ? MIRX : MIRY)[e.a || 0]; }
    return n;
  }
  function flipRoom(R, x) {
    pushUndo();
    let g = '';
    for (let r = 0; r < GH; r++) for (let c = 0; c < GW; c++) {
      const sc = x ? GW - 1 - c : c, sr = x ? r : GH - 1 - r;
      let ch = R.g[sr * GW + sc];
      if (x && ch === '>') ch = '<'; else if (x && ch === '<') ch = '>';
      g += ch;
    }
    R.g = g; R.e = R.e.map((e) => flipEnt(e, x));
    Maker.sel = null;
    changed();
  }
  function pasteRoom(R) {
    if (!Maker.clip) return;
    pushUndo();
    const d = JSON.parse(Maker.clip);
    R.g = d.g; R.e = d.e.map((e) => Object.assign({}, e)); R.m = d.m || ''; R.b = d.b || ''; R.n = d.n || 25;
    if (d.t !== 'start' && d.t !== 'boss') R.t = d.t;
    changed(true); toast('Room pasted');
  }

  /* ---- the floor pane */
  function renderFloor() {
    const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const M = Maker.M, F = F_();
    pane.appendChild(el('h4', 'mk-h', 'Floors'));
    const fl = el('div', 'mk-floors');
    M.floors.forEach((_, i) => { const b = el('button', i === Maker.fi ? 'on' : '', String(i + 1)); b.type = 'button'; b.title = 'Floor ' + (i + 1); b.addEventListener('click', (e) => { e.preventDefault(); goFloor(i); }); fl.appendChild(b); });
    if (M.floors.length < LIMITS.floors) { const b = el('button', '', IC.plus); b.type = 'button'; b.title = 'Add a floor'; b.setAttribute('aria-label', 'Add a floor'); b.addEventListener('click', (e) => { e.preventDefault(); pushUndo(); M.floors.push(M74.newFloor(M.floors.length, SETS[Math.min(M.floors.length, 4)])); goFloor(M.floors.length - 1); }); fl.appendChild(b); }
    pane.appendChild(fl);
    pane.appendChild(el('div', 'mk-key', '<span><i></i>Door</span><span><i class="w"></i>Wall</span><span><i class="c"></i>Crack</span>'));
    // the map of the floor: rooms, the gaps between them, and spots where a room fits
    const grid = el('div', 'mk-fg');
    grid.style.gridTemplateColumns = `repeat(${FW - 1}, minmax(0,1fr) 7px) minmax(0,1fr)`;
    const has = (x, y) => !!roomAt(F, x, y);
    for (let gy = 0; gy < FH * 2 - 1; gy++) {
      for (let gx = 0; gx < FW * 2 - 1; gx++) {
        const x = gx >> 1, y = gy >> 1, cellX = gx % 2 === 0, cellY = gy % 2 === 0;
        if (cellX && cellY) {
          const R = roomAt(F, x, y);
          if (R) {
            const b = el('button', 'mk-fc rm' + (x === Maker.rx && y === Maker.ry ? ' cur' : '') + (R.lk ? ' lk' : '')); b.type = 'button';
            b.title = `${RT[R.t].name} at ${colName(x)}${y + 1}`;
            const cv = document.createElement('canvas'); cv.width = 66; cv.height = 55; paintRoomThumb(cv.getContext('2d'), 66, 55, R);
            b.appendChild(cv); b.appendChild(el('b', null, RT[R.t].code));
            b.addEventListener('click', (e) => { e.preventDefault(); M74.selectRoom(x, y); });
            grid.appendChild(b);
          } else {
            const near = Object.values(SIDES).some((v) => has(x + v[0], y + v[1]));
            const b = el('button', 'mk-fc' + (near ? ' add' : '')); b.type = 'button';
            if (near) { b.innerHTML = IC.plus; b.title = `Add a room at ${colName(x)}${y + 1}`; b.setAttribute('aria-label', b.title); b.addEventListener('click', (e) => { e.preventDefault(); addRoom(x, y, true); }); }
            else { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
            grid.appendChild(b);
          }
        } else if (!cellX && cellY) {
          const a = roomAt(F, x, y), o = roomAt(F, x + 1, y);
          const b = el('button', 'mk-fe v'); b.type = 'button';
          if (a && o) { const ed = edgeOf(F, a, 'e'); b.classList.add(ed === 'w' ? 'w' : ed === 'c' ? 'c' : 'o'); b.title = 'Door, wall or crack'; b.addEventListener('click', (e) => { e.preventDefault(); cycleEdge(a, 'e'); }); }
          else b.classList.add('no');
          grid.appendChild(b);
        } else if (cellX && !cellY) {
          const a = roomAt(F, x, y), o = roomAt(F, x, y + 1);
          const b = el('button', 'mk-fe h'); b.type = 'button';
          if (a && o) { const ed = edgeOf(F, a, 's'); b.classList.add(ed === 'w' ? 'w' : ed === 'c' ? 'c' : 'o'); b.title = 'Door, wall or crack'; b.addEventListener('click', (e) => { e.preventDefault(); cycleEdge(a, 's'); }); }
          else b.classList.add('no');
          grid.appendChild(b);
        } else grid.appendChild(el('span'));
      }
    }
    pane.appendChild(grid);
    pane.appendChild(el('p', 'mk-p', 'Tap + to add a room next to one. Tap a bar between two rooms: door, wall, crack.'));
    // the floor itself
    pane.appendChild(el('h4', 'mk-h', `Floor ${Maker.fi + 1}`));
    const nm = el('input', 'mk-in'); nm.maxLength = LIMITS.fname; nm.value = F.name; nm.placeholder = setName(F.set);
    nm.addEventListener('change', () => { pushUndo(); F.name = nm.value.trim(); changed(); });
    pane.appendChild(field('Name', nm));
    const sb = el('input', 'mk-in'); sb.maxLength = LIMITS.fsub; sb.value = F.sub; sb.placeholder = setDef(F.set).sub || '';
    sb.addEventListener('change', () => { pushUndo(); F.sub = sb.value.trim(); changed(); });
    pane.appendChild(field('Tagline', sb));
    pane.appendChild(field('Looks and snakes like', selectOf(SETS.map((s) => [s, setName(s)]), F.set, (v) => { pushUndo(); F.set = v; Maker.pvKey = ''; changed(true); })));
    const bk = F.boss !== 'auto' ? F.boss : setDef(F.set).boss;
    const bb = el('button', 'mk-pick'); bb.type = 'button';
    bb.appendChild(canvasIcon(32, (c, s) => { const sp = bossSprite(bk); c.drawImage(sp, 0, 0, sp.width, sp.height, -s * 0.4, 0, s * 1.8, s); }));
    bb.appendChild(el('span', null, esc((F.boss === 'auto' ? 'Floor default: ' : '') + bossName(bk))));
    bb.addEventListener('click', (e) => { e.preventDefault(); M74.pickBoss(F.boss, true, (v) => { pushUndo(); F.boss = v; changed(true); }); });
    pane.appendChild(field('Lair boss', bb));
    pane.appendChild(field('Darkness', seg(DARK, F.dark, (v) => { pushUndo(); F.dark = v; Maker.pvKey = ''; changed(); })));
    const fa = el('div', 'mk-acts');
    fa.append(
      btn('', IC.copy + 'Duplicate', 'Duplicate this floor', () => { if (M.floors.length >= LIMITS.floors) { toast('Eight floors is the most.'); return; } pushUndo(); M.floors.splice(Maker.fi + 1, 0, JSON.parse(JSON.stringify(F))); goFloor(Maker.fi + 1); }),
      btn('', '← Earlier', 'Move this floor up', () => { if (Maker.fi === 0) return; pushUndo(); const [f] = M.floors.splice(Maker.fi, 1); M.floors.splice(Maker.fi - 1, 0, f); goFloor(Maker.fi - 1); }),
      btn('', 'Later →', 'Move this floor down', () => { if (Maker.fi >= M.floors.length - 1) return; pushUndo(); const [f] = M.floors.splice(Maker.fi, 1); M.floors.splice(Maker.fi + 1, 0, f); goFloor(Maker.fi + 1); }),
    );
    const dl = btn('red', IC.trash + 'Delete floor', 'Delete this floor', () => {
      if (M.floors.length <= 1) { toast('A map needs at least one floor.'); return; }
      if (!dl.classList.contains('on')) { dl.classList.add('on'); toast('Tap again to delete this floor.'); setTimeout(() => dl.classList.remove('on'), 2600); return; }
      pushUndo(); M.floors.splice(Maker.fi, 1); goFloor(Math.max(0, Maker.fi - 1));
    });
    fa.appendChild(dl);
    pane.appendChild(fa);
    pane.scrollTop = top;
  }
  function paintRoomThumb(c, w, h, R) {
    const col = RT[R.t] ? RT[R.t].col : '#888';
    c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h);
    c.fillStyle = rgba(col, 0.22); c.fillRect(0, 0, w, h);
    const cw = w / GW, ch = h / GH;
    for (let i = 0; i < GN; i++) {
      const t = R.g[i]; if (t === '.') continue;
      const x = (i % GW) * cw, y = Math.floor(i / GW) * ch;
      c.fillStyle = SOLID_TILE(t) ? 'rgba(236,226,212,.55)' : 'rgba(236,226,212,.22)';
      c.fillRect(x + 0.4, y + 0.4, cw - 0.8, ch - 0.8);
    }
    for (const e of R.e) {
      const x = (e.c + 0.5) * cw, y = (e.r + 0.5) * ch;
      c.fillStyle = e.t === 'sn' ? (e.g ? '#ffc83a' : '#ff4a5a') : ENTS[e.t].cat === 'traps' ? '#ff9a2a' : ENTS[e.t].cat === 'loot' ? '#ffd84a' : '#7cc4ff';
      c.fillRect(x - cw * 0.32, y - ch * 0.32, cw * 0.64, ch * 0.64);
    }
    c.fillStyle = col; c.fillRect(0, 0, w, 2.5);
  }
  function selectRoom(x, y) {
    Maker.rx = x; Maker.ry = y; Maker.sel = null; Maker.pvKey = '';
    M74.renderFloor(); M74.renderRoomPane(); M74.renderCrumb(); M74.renderInspector();
  }
  function goFloor(i) {
    Maker.fi = clamp(i, 0, Maker.M.floors.length - 1);
    const F = F_(), st = F.rooms.find((r) => r.t === 'start') || F.rooms[0];
    Maker.rx = st.x; Maker.ry = st.y; Maker.sel = null;
    changed(true);
  }
  function addRoom(x, y, go) {
    const F = F_();
    if (roomAt(F, x, y)) { M74.selectRoom(x, y); return; }
    if (F.rooms.length >= LIMITS.rooms) { toast(`${LIMITS.rooms} rooms is the most for one floor.`); return; }
    if (x < 0 || y < 0 || x >= FW || y >= FH) return;
    pushUndo();
    const R = newRoom(x, y, F.rooms.some((r) => r.t === 'boss') ? 'fight' : 'fight');
    F.rooms.push(R);
    if (go) { Maker.rx = x; Maker.ry = y; Maker.sel = null; }
    changed(true);
    toast('Room added. Paint it.');
  }
  function cycleEdge(R, s) {
    const F = F_(), cur = edgeOf(F, R, s); if (!cur) return;
    pushUndo();
    setEdge(F, R, s, cur === 'o' ? 'w' : cur === 'w' ? 'c' : 'o');
    changed();
  }

  /* ---- the map pane */
  function renderMapPane() {
    const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
    const top = pane.scrollTop;
    pane.textContent = '';
    const M = Maker.M;
    const pr = el('div'); pr.id = 'mkProbs'; pane.appendChild(pr);
    pane.appendChild(el('h4', 'mk-h', 'About'));
    const au = el('input', 'mk-in'); au.maxLength = LIMITS.author; au.value = M.author; au.placeholder = 'Your name';
    au.addEventListener('change', () => { pushUndo(); M.author = au.value.trim(); scheduleSave(); });
    pane.appendChild(field('Made by', au));
    const ds = el('textarea', 'mk-in'); ds.maxLength = LIMITS.desc; ds.value = M.desc; ds.placeholder = 'One or two lines for whoever plays it.'; ds.rows = 2;
    ds.addEventListener('change', () => { pushUndo(); M.desc = ds.value.slice(0, LIMITS.desc); scheduleSave(); });
    pane.appendChild(field('Description', ds));
    pane.appendChild(el('h4', 'mk-h', 'Who plays it'));
    const chars = [['', 'Player picks']].concat(CHAR_IDS.filter((id) => CHARS[id]).map((id) => [id, CHARS[id].name + (id === 'apple' || Save.data.unlocks[id] ? '' : ' (locked for you)')]));
    pane.appendChild(field('Character', selectOf(chars, M.char, (v) => { pushUndo(); M.char = v; scheduleSave(); })));
    pane.appendChild(field('Difficulty', seg(DIFF_OPTS, M.diff, (v) => { pushUndo(); M.diff = v; scheduleSave(); M74.renderMapPane(); })));
    pane.appendChild(el('p', 'mk-p', 'A locked character or Nightmare falls back to what the player has.'));
    pane.appendChild(el('h4', 'mk-h', 'Rules'));
    for (const [k, label, opts] of RULES) pane.appendChild(field(label, seg(opts, M.rules[k], (v) => { pushUndo(); M.rules[k] = v; scheduleSave(); M74.renderMapPane(); })));
    pane.appendChild(el('h4', 'mk-h', `Start powerups (${M.items.length} of ${LIMITS.items})`));
    const its = el('div', 'mk-items');
    for (const id of M.items) {
      const b = el('button'); b.type = 'button'; b.title = 'Remove ' + ITEMS[id].name;
      b.appendChild(canvasIcon(28, (c, s) => { c.translate(s / 2, s / 2); drawItemIcon(c, id, s * 0.85, 1); }));
      b.appendChild(el('span', null, esc(ITEMS[id].name)));
      b.addEventListener('click', (e) => { e.preventDefault(); pushUndo(); M.items = M.items.filter((x) => x !== id); scheduleSave(); M74.renderMapPane(); });
      its.appendChild(b);
    }
    if (M.items.length < LIMITS.items) {
      const b = el('button', 'add', IC.plus.replace('<svg', '<svg width="14" height="14"') + ' Add'); b.type = 'button';
      b.addEventListener('click', (e) => { e.preventDefault(); M74.pickItem('', false, (id) => { if (!M.items.includes(id)) { pushUndo(); M.items.push(id); scheduleSave(); M74.renderMapPane(); } }); });
      its.appendChild(b);
    }
    pane.appendChild(its);
    pane.appendChild(el('p', 'mk-p', 'They wait in the start room. Tap one to take it off.')).style.marginTop = '6px';
    pane.appendChild(el('h4', 'mk-h', 'The map'));
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('gold', IC.share + 'Share code', 'Share code', (function () { return M74.openShare.apply(this, arguments); })),
      btn('', IC.check + 'Save now', 'Save now', () => { saveNow(); toast('Saved in this browser'); }),
      btn('', IC.copy + 'Save a copy', 'Save a copy', () => { saveNow(); const C = cloneMap(Maker.M); C.id = uid(); C.name = (C.name + ' (copy)').slice(0, LIMITS.name); Store.put(C); M74.edit(C); toast('Now editing the copy'); }),
      btn('', IC.map + 'Your maps', 'Back to your maps', () => { saveNow(); showHub(); }),
    );
    pane.appendChild(acts);
    const st = mapStats(M);
    const stats = el('div', 'mk-stats'); stats.style.marginTop = '10px';
    stats.innerHTML = `<span><b>${st.floors}</b>floors</span><span><b>${st.rooms}</b>rooms</span><span><b>${st.snakes}</b>snakes</span>`;
    pane.appendChild(stats);
    renderProbs();
    pane.scrollTop = top;
  }

  /* ---- checks */
  function validate(M) {
    const out = [];
    M.floors.forEach((F, fi) => {
      const fl = M.floors.length > 1 ? `Floor ${fi + 1}: ` : '';
      const starts = F.rooms.filter((r) => r.t === 'start'), lairs = F.rooms.filter((r) => r.t === 'boss');
      const exits = F.rooms.filter((r) => r.e.some((e) => e.t === 'ex'));
      if (!starts.length) out.push({ err: 1, msg: fl + 'no start room. Make one room the start.', fi, x: F.rooms[0].x, y: F.rooms[0].y });
      if (!lairs.length && !exits.length) out.push({ err: 1, msg: fl + 'no way out. Add a lair or an exit hatch.', fi, x: F.rooms[0].x, y: F.rooms[0].y });
      const st = starts[0] || F.rooms[0], seen = new Set([st]), q = [st];
      while (q.length) { const R = q.shift(); for (const s of doorsOf(F, R)) { const o = neighbor(F, R, s); if (o && !seen.has(o)) { seen.add(o); q.push(o); } } }
      const lost = F.rooms.filter((r) => !seen.has(r));
      if (lost.length) out.push({ msg: `${fl}${lost.length === 1 ? 'one room can' : lost.length + ' rooms can'} not be reached from the start.`, fi, x: lost[0].x, y: lost[0].y });
      const keys = F.rooms.reduce((n, R) => n + R.e.filter((e) => e.t === 'ky').length, 0), locks = F.rooms.filter((r) => r.lk || r.t === 'vault');
      if (locks.length > keys) out.push({ msg: `${fl}${locks.length} locked room${locks.length === 1 ? '' : 's'}, ${keys} key${keys === 1 ? '' : 's'}. The game hides the missing ones in pots.`, fi, x: locks[0].x, y: locks[0].y, soft: 1 });
      const pads = [0, 0, 0, 0], levers = [0, 0, 0, 0], gates = [0, 0, 0, 0];
      for (const R of F.rooms) {
        for (const e of R.e) { if (e.t === 'tp') pads[e.ch || 0]++; if (e.t === 'lv') levers[e.ch || 0]++; if (e.t === 'gt') gates[e.ch || 0]++; }
        for (const s of doorsOf(F, R)) { const [mc, mr] = MOUTH[s]; const e = entAt(R, mc, mr); if (SOLID_TILE(cellCh(R, mc, mr)) || (e && ENTS[e.t].solid && e.t !== 'gt')) { out.push({ msg: `${fl}a doorway is blocked in ${RT[R.t].name.toLowerCase()} ${colName(R.x)}${R.y + 1}.`, fi, x: R.x, y: R.y }); break; } }
        if (NEEDS[R.t] && ![...NEEDS[R.t]].some((ch) => R.g.includes(ch))) out.push({ msg: `${fl}${RT[R.t].name} ${colName(R.x)}${R.y + 1} is missing its pieces. They get put back.`, fi, x: R.x, y: R.y, soft: 1 });
      }
      for (let ch = 0; ch < 4; ch++) {
        if (pads[ch] === 1) out.push({ msg: `${fl}one ${CH_NAMES[ch].toLowerCase()} teleporter has no partner.`, fi, soft: 1 });
        if (levers[ch] && !gates[ch]) out.push({ msg: `${fl}a ${CH_NAMES[ch].toLowerCase()} lever with no ${CH_NAMES[ch].toLowerCase()} gates.`, fi, soft: 1 });
        if (gates[ch] && !levers[ch]) out.push({ msg: `${fl}${CH_NAMES[ch].toLowerCase()} gates with no ${CH_NAMES[ch].toLowerCase()} lever.`, fi, soft: 1 });
      }
    });
    return out;
  }
  function validateSoon() { clearTimeout(Maker._vT); Maker._vT = setTimeout(() => { if (!Maker.M) return; Maker.probs = M74.validate(Maker.M); renderChk(); renderProbs(); }, 120); }
  function renderChk() {
    const b = $('mkChk'); if (!b) return;
    const errs = Maker.probs.filter((p) => p.err).length, warns = Maker.probs.length - errs;
    b.className = 'mke-chk' + (errs ? ' bad' : warns ? ' meh' : '');
    b.innerHTML = errs ? IC.warn + `<span class="lbl">${errs} to fix</span>` : warns ? IC.warn + `<span class="lbl">${warns} note${warns === 1 ? '' : 's'}</span>` : IC.check + '<span class="lbl">Ready</span>';
    b.title = errs ? 'Things to fix before testing' : warns ? 'Notes about the map' : 'Ready to play';
  }
  function renderProbs() {
    const box = $('mkProbs'); if (!box) return;
    box.textContent = '';
    if (!Maker.probs.length) return;
    box.appendChild(el('h4', 'mk-h', 'Check'));
    const list = el('div', 'mk-probs');
    for (const p of Maker.probs) {
      const b = el('button', p.err ? 'err' : '', (p.err ? IC.warn : IC.warn) + `<span>${esc(p.msg)}</span>`); b.type = 'button';
      b.addEventListener('click', (e) => { e.preventDefault(); if (p.fi !== Maker.fi) { Maker.fi = p.fi; } if (p.x != null) { Maker.rx = p.x; Maker.ry = p.y; } changed(true); setPane('room'); });
      list.appendChild(b);
    }
    box.appendChild(list);
  }

  /* ---- the bar above the room */
  function renderCrumb() {
    const b = $('mkCrumb'); if (!b || !Maker.M) return;
    const F = F_(), R = R_(), sn = R.e.filter((e) => e.t === 'sn').length;
    let hv = '';
    if (Maker.hover && Maker.hover.c >= 0) {
      const { c, r } = Maker.hover, e = entAt(R, c, r), ch = cellCh(R, c, r);
      hv = `${colName(c)}${r + 1}  ${e ? (e.t === 'sn' ? snakeName(e.k) : ENTS[e.t].name) : ch !== '.' ? TILE[ch].name : ''}`;
    }
    b.innerHTML = `<span>Floor <b>${Maker.fi + 1}</b> · ${esc(F.name || setName(F.set))}</span><span><i style="background:${RT[R.t].col}"></i> <b>${esc(RT[R.t].name)}</b> ${colName(R.x)}${R.y + 1}${sn ? ' · ' + sn + ' snake' + (sn === 1 ? '' : 's') : ''}</span><span class="hv">${esc(hv)}</span>`;
  }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
