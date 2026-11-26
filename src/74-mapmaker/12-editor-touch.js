/* 74.js section 12: editor-touch. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { $, EFFECTS, ENT_PARAMS, FIXED, F_, GW, IC, LIMITS, MK, Maker, Pop, RT, R_, SVG, TILE, brushDesc, brushId, brushName, btn, canvasIcon, capShow, cellFrom, changed, closeDlg, colName, dlg, el, entAt, entDefaults, esc, field, paintBrushIcon, paramControl, pushUndo, restore, runFx, safe, scheduleSave, setCh, setPane, syncUndo, toast } = M74;
  M74.gDown = gDown; M74.gMove = gMove; M74.gUp = gUp;
  /* ================================================================== the editor: touch, a cell sheet, recent brushes, help */
  // touch: a tap paints when the finger lifts, a drag paints as it goes, a long press opens the cell
  const GS = { p: null, n: 0 };
  function gDown(e) {
    if (e.pointerType !== 'touch' || !Maker.M) { const now = performance.now(); if (!GS.mu || now - GS.mu.t > 500) GS.mu = { u: Maker.undo.length, t: now }; return M74.onDown(e); }
    GS.n++;
    if (GS.p) { clearTimeout(GS.p.tm); if (GS.p.started) M74.onUp(e); GS.p = null; return; }
    const p = cellFrom(e);
    if (!p.inside) return M74.onDown(e);
    e.preventDefault();
    try { Maker.cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const st = { id: e.pointerId, x: e.clientX, y: e.clientY, ev: { clientX: e.clientX, clientY: e.clientY, button: 0, pointerId: e.pointerId, pointerType: 'touch', preventDefault() {} }, started: false, long: false };
    st.tm = setTimeout(() => {
      if (GS.p !== st || st.started) return;
      st.long = true;
      safe(() => navigator.vibrate && navigator.vibrate(12));
      openCell(p.c, p.r, { x: st.x, y: st.y });
    }, 430);
    GS.p = st;
    Maker.hover = { c: p.c, r: p.r };
  }
  function gMove(e) {
    const st = GS.p;
    if (st && e.pointerId === st.id && !st.started && !st.long) {
      if (Math.hypot(e.clientX - st.x, e.clientY - st.y) < 9) return;
      clearTimeout(st.tm); st.started = true; M74.onDown(st.ev);
    }
    if (st && st.long) return;
    M74.onMove(e);
  }
  function gUp(e) {
    const st = GS.p;
    if (st && e.pointerId === st.id) {
      clearTimeout(st.tm); GS.p = null;
      if (st.long) return;
      if (!st.started) {
        const p = cellFrom(st.ev);
        if (Maker.tool === 'move' && p.inside && entAt(R_(), p.c, p.r)) { M74.onDown(st.ev); M74.onUp(e); openCell(p.c, p.r, { x: st.x, y: st.y }); return; }
        M74.onDown(st.ev);
      }
    }
    M74.onUp(e);
  }
  function gDbl(e) {
    if (!Maker.M) return;
    const p = cellFrom(e); if (!p.inside) return;
    e.preventDefault();
    // the first click of a double click painted: take that back before opening the cell
    if (GS.mu && performance.now() - GS.mu.t < 700 && Maker.undo.length > GS.mu.u) { restore(Maker.undo.pop()); syncUndo(); }
    GS.mu = null;
    openCell(p.c, p.r, { x: e.clientX, y: e.clientY });
  }

  // the cell sheet: what is on this tile, change it, or put something here
  function closeCell() { const s = $('mkSheet'); if (s) { s.hidden = true; s.textContent = ''; } Maker.cell = null; }
  function openCell(c, r, at) {
    const sh = $('mkSheet'); if (!sh || !Maker.M) return;
    const R = R_(), F = F_(), e = entAt(R, c, r), ch = R.g[r * GW + c];
    if (!Maker.cell || Maker.cell.c !== c || Maker.cell.r !== r) Maker.cellT = performance.now();
    Maker.cell = { c, r, at };
    if (e) { Maker.sel = { c, r }; M74.renderInspector(); }
    sh.textContent = '';
    const card = el('div', 'mks-card');
    const hd = el('div', 'mks-hd');
    hd.appendChild(el('div', null, `<small>${esc(RT[R.t].name)} ${colName(R.x)}${R.y + 1}</small><b>Tile ${colName(c)}${r + 1}</b>`));
    hd.appendChild(btn('ic', SVG('<path d="M6 6l12 12M18 6L6 18"/>'), 'Close', closeCell));
    card.appendChild(hd);
    const bd = el('div', 'mks-bd');
    const lock = FIXED[R.t];
    // the tile
    const tb = el('div', 'mks-item');
    tb.appendChild(canvasIcon(40, (cc, s) => paintBrushIcon(cc, s, { k: 'tile', ch }, F.set)));
    tb.appendChild(el('div', null, `<b>${esc(TILE[ch].name)}</b><span>${esc(TILE[ch].desc)}</span>`));
    bd.appendChild(tb);
    const ta = el('div', 'mk-acts');
    ta.append(btn('', IC.brush + 'Paint with this', 'Use this tile as the brush', () => { M74.pickBrush({ k: 'tile', ch }); closeCell(); toast(`Brush: ${TILE[ch].name}`); }));
    if (ch !== '.' && !lock) ta.append(btn('', IC.erase + 'Make it floor', 'Turn this tile into floor', () => { pushUndo(); setCh(R, c, r, '.'); changed(); openCell(c, r, at); }));
    bd.appendChild(ta);
    // the piece on it
    if (e) {
      bd.appendChild(el('h4', 'mk-h', e.t === 'sn' ? 'Snake here' : 'Piece here'));
      const pb = el('div', 'mks-item');
      pb.appendChild(canvasIcon(40, (cc, s) => paintBrushIcon(cc, s, { k: 'ent', t: e.t, p: e }, F.set)));
      pb.appendChild(el('div', null, `<b>${esc(brushName({ k: 'ent', t: e.t, p: e }))}</b><span>${esc(brushDesc({ k: 'ent', t: e.t, p: e }))}</span>`));
      bd.appendChild(pb);
      const apply = (k, v) => { pushUndo(); e[k] = v; changed(); M74.renderInspector(); openCell(c, r, at); };
      for (const p of ENT_PARAMS[e.t]) bd.appendChild(paramControl(p, e, apply));
      const pa = el('div', 'mk-acts');
      pa.append(
        btn('', IC.brush + 'Use as brush', 'Paint with these settings', () => { const p = Object.assign({}, e); delete p.c; delete p.r; delete p.t; M74.pickBrush({ k: 'ent', t: e.t, p }); closeCell(); }),
        btn('red', IC.trash + 'Remove', 'Remove this piece', () => { pushUndo(); R.e = R.e.filter((x) => x !== e); Maker.sel = null; changed(); M74.renderInspector(); openCell(c, r, at); }),
      );
      bd.appendChild(pa);
    } else if (!lock) {
      // put something here: the current brush and the recent ones
      bd.appendChild(el('h4', 'mk-h', 'Put here'));
      const grid = el('div', 'mks-put');
      const list = recentList(true);
      for (const b of list.slice(0, 10)) {
        const x = el('button', 'mk-br'); x.type = 'button'; x.title = b.name;
        x.appendChild(canvasIcon(34, (cc, s) => paintBrushIcon(cc, s, b, F.set)));
        x.appendChild(el('span', null, esc(b.name)));
        x.addEventListener('click', (ev) => { ev.preventDefault(); M74.pickBrush(b); Maker.stroke = { tool: 'brush', saved: false, changed: false }; M74.applyAt(c, r, 'brush'); const st = Maker.stroke; Maker.stroke = null; if (st.changed || st.saved) changed(); closeCell(); });
        grid.appendChild(x);
      }
      bd.appendChild(grid);
      bd.appendChild(el('p', 'mk-p', 'More pieces under Paint. The one you pick there shows up here next time.'));
    } else bd.appendChild(el('div', 'mk-note', 'This room has a fixed layout. Painting here does nothing.'));
    card.appendChild(bd);
    sh.appendChild(card);
    sh.hidden = false;
    const narrow = window.innerWidth < 720 || window.innerHeight < 520;
    sh.classList.toggle('bottom', narrow);
    card.style.left = card.style.top = '';
    if (!narrow && at) {
      const w = 340, h = Math.min(card.offsetHeight || 420, window.innerHeight - 24);
      card.style.left = Math.round(Math.max(12, Math.min(window.innerWidth - w - 12, at.x + 18))) + 'px';
      card.style.top = Math.round(Math.max(12, Math.min(window.innerHeight - h - 12, at.y - 40))) + 'px';
    }
  }

  // recent brushes: the last ten things you painted with
  function recentList(withCur) {
    const out = [], seen = new Set();
    const add = (b) => { const id = brushId(b); if (seen.has(id)) return; seen.add(id); out.push(Object.assign({}, b, { name: brushName(b), id })); };
    if (withCur) add(Maker.brush);
    for (const b of Maker.recent || []) add(b);
    if (out.length < 6) for (const b of [{ k: 'tile', ch: '#' }, { k: 'tile', ch: 'u' }, { k: 'ent', t: 'sn', p: { k: 'grub', g: 0, tr: '' } }, { k: 'ent', t: 'nt', p: entDefaults('nt') }, { k: 'ent', t: 'cn', p: { n: 3 } }, { k: 'ent', t: 'tx', p: entDefaults('tx') }]) if (TILE[b.ch] || b.k === 'ent') add(b);
    return out;
  }
  safe(() => {
    const pb0 = M74.pickBrush;
    M74.pickBrush = function (b) {
      const r = pb0.apply(this, arguments);
      safe(() => {
        const nb = b.k === 'tile' ? { k: 'tile', ch: b.ch } : { k: 'ent', t: b.t, p: Object.assign({}, b.p) };
        const id = brushId(nb);
        Maker.recent = [nb].concat((Maker.recent || []).filter((x) => brushId(x) !== id)).slice(0, 10);
        paintRecent(); paintChip();
      });
      return r;
    };
    const rp0 = M74.renderPaint;
    M74.renderPaint = function () { const r = rp0.apply(this, arguments); safe(paintRecent); return r; };
    const st0 = M74.setTool;
    M74.setTool = function () { const r = st0.apply(this, arguments); safe(paintChip); return r; };
    const ri0 = M74.renderInspector;
    M74.renderInspector = function () { const r = ri0.apply(this, arguments); safe(paintChip); return r; };
  });
  function paintRecent() {
    const pane = $('mkPanePaint'); if (!pane) return;
    let row = $('mkRecent');
    if (!row) { row = el('div', 'mk-recent'); row.id = 'mkRecent'; const cats = pane.querySelector('.mk-cats'); if (cats) cats.insertAdjacentElement('afterend', row); else return; }
    row.textContent = '';
    const list = (Maker.recent || []).slice(0, 10);
    if (!list.length) { row.hidden = true; return; }
    row.hidden = false;
    row.appendChild(el('small', null, 'Recent'));
    const set = F_().set, cur = brushId(Maker.brush);
    for (const b of list) {
      const x = el('button', brushId(b) === cur ? 'on' : ''); x.type = 'button'; x.title = brushName(b); x.setAttribute('aria-label', brushName(b));
      x.appendChild(canvasIcon(30, (cc, s) => paintBrushIcon(cc, s, b, set)));
      x.addEventListener('click', (ev) => { ev.preventDefault(); M74.pickBrush(b); });
      row.appendChild(x);
    }
  }
  // the brush chip on the room: what a tap will paint
  function paintChip() {
    const ch = $('mkChip'); if (!ch || !Maker.M) return;
    ch.textContent = '';
    const tool = Maker.tool;
    const b = tool === 'erase' ? { k: 'tile', ch: '.' } : Maker.brush;
    ch.appendChild(canvasIcon(24, (cc, s) => paintBrushIcon(cc, s, b, F_().set)));
    const word = { brush: 'Brush', erase: 'Eraser', fill: 'Fill', box: 'Box', pick: 'Picker', move: 'Select' }[tool] || 'Brush';
    ch.appendChild(el('span', null, `<small>${word}</small>${esc(tool === 'erase' ? 'Rubs out' : tool === 'pick' ? 'Tap to copy' : tool === 'move' ? 'Tap a piece' : brushName(b))}`));
  }

  /* ---- help: a few pages, shown once on the first visit */
  const HELP = [
    ['Start here', [
      ['The idea', 'A map is one to eight floors. A floor is rooms on a grid. Every floor needs a start room, and a lair or an exit hatch to leave by.'],
      ['Paint', 'Pick a piece under Paint, then paint the room. Tiles, snakes, traps, gadgets, loot and words. Undo is top left and never runs out of patience.'],
      ['Rooms', 'Room sets the type: fight, hall, shop, lair and so on. It also sets doors, locks, and what the room says when you walk in.'],
      ['Floors and map', 'Floor is the bird view: add rooms, move between them, set looks and the boss. Map holds the rules, the story and the share code.'],
    ]],
    ['On a phone', [
      ['Tap', 'A tap paints one tile when you lift your finger. Drag to paint a line.'],
      ['Hold', 'Hold a tile for half a second. A sheet opens: what is there, its settings, and a row of pieces to drop on it.'],
      ['Select', 'With Select on, tap a piece to open its settings. Drag it to move it.'],
      ['Panel height', 'Drag the bar above Paint, Room, Floor and Map. Up gives the panel more room, down gives the room more. Double tap the bar to reset.'],
      ['Walls', 'Tap a plus on a wall to add a room on that side. Tap a door label to cycle door, wall and crack.'],
      ['Turn it', 'On a phone held sideways, the room sits left and the panels sit right.'],
    ]],
    ['Words', [
      ['Floor text', 'Paint words on the floor. Chalk, blood, gold, slime or ice. Still, glowing, waving or flickering.'],
      ['Note', 'A note on the floor. Step on it and the game stops while it reads out. Paper, a warning, a story page, or a phone full of messages. Split messages with a | sign.'],
      ['Choice', 'A shrine with a question and two answers. Each answer does one thing: heal, hurt, coins, a powerup, a downgrade, snakes, gates, a bomb or a key. Hide the outcome for a gamble.'],
      ['Shout', 'An invisible trigger. A big line over the room when you walk in, step on it, or clear the room.'],
      ['Talking snakes', 'Every snake can say one line when the fight starts, and leave last words.'],
      ['Room, floor and map lines', 'A room can say something when you walk in and when it is clear. A floor can open with a page. The map can open with a story and close with your own last line.'],
    ]],
    ['Codes and keys', [
      ['Share', 'Share turns the whole map into one line of text. Send it. Whoever pastes it in the Map Maker can play it or edit a copy.'],
      ['Keys', 'B brush, E eraser, F fill, R box, I picker, V select. X and Y mirror. G grid. T tests. Ctrl Z and Ctrl Y undo and redo. Arrows walk between rooms.'],
      ['Mouse', 'Right click rubs out. Double click a tile for the cell sheet.'],
      ['Saving', 'Maps save in this browser as you go. Clear the browser and they are gone. The share code is the backup.'],
    ]],
  ]; M74.HELP = HELP;
  function openHelp(page) {
    let i = Math.max(0, Math.min(HELP.length - 1, page | 0));
    const body = el('div', 'mk-help');
    const tabs = el('div', 'mk-seg');
    const box = el('div', 'mk-help-p');
    body.append(tabs, box);
    const prev = btn('', 'Back', 'Previous page', () => go(i - 1));
    const next = btn('gold', 'Next', 'Next page', () => { if (i >= HELP.length - 1) closeDlg(); else go(i + 1); });
    const go = (n) => {
      i = Math.max(0, Math.min(HELP.length - 1, n));
      tabs.textContent = '';
      HELP.forEach(([nm], k) => { const b = el('button', k === i ? 'on' : '', esc(nm)); b.type = 'button'; b.addEventListener('click', (ev) => { ev.preventDefault(); go(k); }); tabs.appendChild(b); });
      box.innerHTML = HELP[i][1].map(([b, s]) => `<div class="mk-tip"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
      prev.disabled = i === 0;
      next.lastChild.textContent = i >= HELP.length - 1 ? 'Done' : 'Next';
      if (next.lastChild.nodeType !== 3) next.textContent = i >= HELP.length - 1 ? 'Done' : 'Next';
    };
    dlg('How the Map Maker works', body, [prev, next]);
    go(i);
  }

  /* ---- extra fields: what rooms, floors and the map say */
  function textField(label, val, max, ph, rows, onSet) {
    const t = el(rows ? 'textarea' : 'input', 'mk-in'); t.maxLength = max; t.value = val || ''; t.placeholder = ph; if (rows) t.rows = rows; t.spellcheck = true;
    const cnt = el('em', 'mk-cnt', `${(val || '').length}/${max}`);
    t.addEventListener('input', () => { cnt.textContent = `${t.value.length}/${max}`; });
    t.addEventListener('change', () => onSet(t.value.slice(0, max)));
    const f = field(label, t); f.firstChild.appendChild(cnt); return f;
  }
  safe(() => {
    const rr0 = M74.renderRoomPane;
    M74.renderRoomPane = function () {
      const r = rr0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const R = R_(), top = pane.scrollTop;
        const sec = el('div', 'mk-sec');
        sec.appendChild(el('h4', 'mk-h', 'What this room says'));
        sec.appendChild(textField('When you walk in', R.ie, LIMITS.rtext, 'Smells like somebody left the oven on.', 2, (v) => { pushUndo(); R.ie = v; changed(); }));
        sec.appendChild(textField('When it is clear', R.ic, LIMITS.rtext, 'Quiet again. For now.', 2, (v) => { pushUndo(); R.ic = v; changed(); }));
        sec.appendChild(el('p', 'mk-p', 'Both show once, as a line at the top of the room. Leave them empty for silence.'));
        const doors = pane.querySelector('.mk-doors');
        const h = doors && doors.previousElementSibling;
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const rf0 = M74.renderFloor;
    M74.renderFloor = function () {
      const r = rf0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
        const F = F_(), top = pane.scrollTop;
        const f = textField('Opening page', F.it, LIMITS.fintro, 'Shown when the floor starts. Set the scene, or lie about it.', 3, (v) => { pushUndo(); F.it = v; changed(); });
        const tag = [...pane.querySelectorAll('.mk-field')].find((x) => x.firstChild && /^Tagline/.test(x.firstChild.textContent));
        if (tag) tag.insertAdjacentElement('afterend', f); else pane.appendChild(f);
        pane.scrollTop = top;
      });
      return r;
    };
    const rm0 = M74.renderMapPane;
    M74.renderMapPane = function () {
      const r = rm0.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
        const M = Maker.M, top = pane.scrollTop;
        const sec = el('div', 'mk-sec');
        sec.appendChild(el('h4', 'mk-h', 'Story'));
        sec.appendChild(textField('Before the run', M.it, LIMITS.intro, 'Shown once before floor one, as a page the player taps away.', 4, (v) => { pushUndo(); M.it = v; scheduleSave(); }));
        sec.appendChild(textField('On the win screen', M.ot, LIMITS.win, 'Your last word, above the time.', 2, (v) => { pushUndo(); M.ot = v; scheduleSave(); }));
        const h = [...pane.querySelectorAll('.mk-h')].find((x) => x.textContent === 'Who plays it');
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
  });

  // build: the sheet, the chip, the help button, and the touch layer
  function buildExtras() {
    const ed = $('mkEd'); if (!ed || $('mkSheet')) return;
    const sh = el('div', 'mks'); sh.id = 'mkSheet'; sh.hidden = true;
    sh.addEventListener('pointerdown', (e) => { if (e.target === sh && performance.now() - (Maker.cellT || 0) > 400) closeCell(); });
    // the finger that opened the sheet must not also press a button in it
    sh.addEventListener('click', (e) => { if (performance.now() - (Maker.cellT || 0) < 450 || GS.p) { e.preventDefault(); e.stopPropagation(); } }, true);
    ed.appendChild(sh);
    const cvw = $('mkCvw');
    const chip = el('button', 'mk-chip'); chip.id = 'mkChip'; chip.type = 'button'; chip.title = 'Your brush. Tap to pick another.';
    chip.addEventListener('click', (e) => { e.preventDefault(); setPane('paint'); const pal = $('mkPal'); if (pal) pal.scrollIntoView({ block: 'nearest' }); });
    cvw.appendChild(chip);
    const R = $('mkTopR');
    const hb = btn('ic', SVG('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.8M12 17.2v.3"/>'), 'How it works', () => openHelp(0)); hb.id = 'mkHelp';
    R.insertBefore(hb, R.firstChild);
    const cv = Maker.cv;
    cv.addEventListener('dblclick', gDbl);
    cv.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
    paintChip();
  }
  safe(() => {
    const se0 = M74.showEditor;
    M74.showEditor = function () {
      const r = se0.apply(this, arguments);
      safe(() => {
        buildExtras(); closeCell(); paintChip(); paintRecent();
        if (!Save.data.seen.mkHelp) { Save.data.seen.mkHelp = 1; Save.store(); setTimeout(() => { if (Maker.open && Maker.view === 'editor') openHelp(0); }, 350); }
      });
      return r;
    };
    // Escape closes the sheet first
    const ok0 = M74.onKey;
    M74.onKey = function (e) {
      if (Maker.open && e.key === 'Escape' && $('mkSheet') && !$('mkSheet').hidden && $('mkDlg').hidden) { e.preventDefault(); e.stopPropagation(); closeCell(); return; }
      if (Maker.open && (e.key === '?' || (e.key === 'h' && !e.ctrlKey && !e.metaKey)) && Maker.view === 'editor') { const tag = (e.target && e.target.tagName) || ''; if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') { e.preventDefault(); e.stopPropagation(); openHelp(0); return; } }
      return ok0.apply(this, arguments);
    };
    // the sheet goes when the room changes
    const sr0 = M74.selectRoom;
    M74.selectRoom = function () { closeCell(); return sr0.apply(this, arguments); };
  });

  /* ---- styles */
  const CSS8 = `
.mkp{position:absolute;inset:0;z-index:5;background:rgba(9,6,6,.42)}
.mkp[hidden]{display:none}
.mkp-card{position:absolute;left:50%;top:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;transition:transform .2s cubic-bezier(.2,.9,.3,1.2),opacity .16s;
  max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;padding:16px 16px 12px;border-radius:3px;font-family:var(--ui);color:#2a1a0c;background:#efe2c4;border:1px solid #5a3a1a;box-shadow:0 18px 50px rgba(0,0,0,.6)}
.mkp-card.in{transform:translate(-50%,-50%);opacity:1}
.mkp-hd small{display:block;font:700 11px/1 var(--ui);letter-spacing:.22em;text-transform:uppercase;opacity:.7;margin-bottom:5px}
.mkp-hd b{display:block;font:400 28px/1.02 var(--display);letter-spacing:.01em;text-wrap:balance}
.mkp-bd{margin:10px 0 12px;font:500 17px/1.38 var(--ui);min-height:1.4em}
.mkp-bd p{margin:0;white-space:pre-wrap}
.mkp-card.typing .mkp-bd p::after{content:'';display:inline-block;width:7px;height:1em;margin-left:2px;vertical-align:-2px;background:currentColor;opacity:.6;animation:mkpBlink .7s steps(2) infinite}
@keyframes mkpBlink{50%{opacity:0}}
.mkp-ops{display:grid;gap:6px}
.mkp-op{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 12px;border:1px solid rgba(42,26,12,.45);border-radius:2px;background:rgba(255,255,255,.35);transition:background .12s,border-color .12s,transform .08s}
.mkp-op:hover{background:rgba(255,255,255,.6)}
.mkp-op:active{transform:translateY(1px)}
.mkp-op:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.mkp-op kbd{flex:none;min-width:22px;height:22px;display:grid;place-items:center;font:700 12px/1 var(--ui);border:1px solid currentColor;border-radius:2px;opacity:.6}
.mkp-op span{display:flex;flex-direction:column;gap:2px;min-width:0}
.mkp-op b{font:700 16px/1.1 var(--ui);letter-spacing:.06em;text-transform:uppercase}
.mkp-op small{font:500 14px/1.2 var(--ui);opacity:.75}
.mkp-op.off{opacity:.45;cursor:not-allowed}
.mkp-op.nope{animation:mkpNope .3s}
@keyframes mkpNope{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.mkp-hint{margin:8px 0 0;font:600 12px/1.2 var(--ui);letter-spacing:.08em;opacity:.55;text-align:right}
.mkp-card.warn{background:#1a1408;color:#ffe28a;border-color:#ffd23a;background-image:repeating-linear-gradient(-45deg,rgba(255,210,58,.9) 0 10px,#1a1408 10px 20px);background-size:100% 8px;background-repeat:no-repeat;padding-top:22px}
.mkp-card.warn .mkp-op{border-color:rgba(255,210,58,.5);background:rgba(255,210,58,.08)}
.mkp-card.warn .mkp-op:hover{background:rgba(255,210,58,.18)}
.mkp-card.story,.mkp-card.intro{background:#140c0b;color:var(--ink);border-color:rgba(200,32,42,.6)}
.mkp-card.story .mkp-hd small,.mkp-card.intro .mkp-hd small{color:#ff8494;opacity:1}
.mkp-card.story .mkp-op,.mkp-card.intro .mkp-op,.mkp-card.choice .mkp-op{border-color:var(--line);background:rgba(255,255,255,.04);color:var(--ink)}
.mkp-card.story .mkp-op:hover,.mkp-card.intro .mkp-op:hover,.mkp-card.choice .mkp-op:hover{border-color:rgba(236,226,212,.5);background:rgba(255,255,255,.08)}
.mkp-card.intro{border-color:rgba(227,165,74,.6)}
.mkp-card.intro .mkp-hd small{color:var(--toffee)}
.mkp-card.intro .mkp-hd b{font-size:34px}
.mkp-card.choice{background:#1c1816;color:var(--ink);border-color:rgba(255,197,58,.55);box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 40px rgba(255,197,58,.12)}
.mkp-card.choice .mkp-hd small{color:#ffc53a;opacity:1}
.mkp-card.choice .mkp-op.a{border-color:rgba(255,197,58,.6)}
.mkp-card.phone{background:#0c0d10;color:#e8eef8;border:1px solid #2a3240;border-radius:3px}
.mkp-card.phone .mkp-hd small{color:#7cc4ff;opacity:1}
.mkp-card.phone .mkp-hd b{font:700 20px/1.1 var(--ui);letter-spacing:.04em}
.mkp-card.phone .mkp-bd{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.mkp-card.phone .bub{max-width:86%;padding:8px 11px;border-radius:3px;background:#1d2633;font:500 16px/1.3 var(--ui);opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s}
.mkp-card.phone .bub.on{opacity:1;transform:none}
.mkp-card.phone .mkp-op{border-color:#2a3240;background:#141a22;color:#e8eef8}
.mkcap{position:absolute;left:50%;transform:translate(-50%,calc(-100% + 6px));z-index:4;opacity:0;pointer-events:none;box-sizing:border-box;padding:8px 14px;max-width:min(560px,92vw);
  background:rgba(12,8,7,.82);border:1px solid rgba(236,226,212,.16);border-radius:2px;font:500 16px/1.32 var(--ui);color:var(--ink);text-align:center;transition:opacity .25s,transform .25s}
.mkcap.show{opacity:1;transform:translate(-50%,-100%)}
.mkcap small{display:block;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--toffee);margin-bottom:4px}
.mks{position:absolute;inset:0;z-index:15}
.mks[hidden]{display:none}
.mks-card{position:absolute;width:340px;max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;background:#0e0a09;border:1px solid rgba(227,165,74,.45);border-radius:3px;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:mksIn .16s ease-out}
@keyframes mksIn{from{opacity:0;transform:translateY(6px)}}
.mks.bottom{background:rgba(9,6,6,.5)}
.mks.bottom .mks-card{left:0!important;right:0;bottom:0;top:auto!important;width:auto;max-height:72%;border-radius:4px 4px 0 0;border-width:1px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);animation:mksUp .2s cubic-bezier(.2,.9,.3,1)}
@keyframes mksUp{from{transform:translateY(40%)}}
.mks.bottom .mks-card::before{content:'';display:block;width:42px;height:4px;margin:8px auto 0;border-radius:1px;background:rgba(236,226,212,.25)}
.mks-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px 8px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#0e0a09;z-index:1}
.mks-hd small{display:block;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.mks-hd b{font:400 22px/1 var(--display);color:var(--ink)}
.mks-bd{padding:10px 12px 14px}
.mks-item{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}
.mks-item canvas{flex:none;border:1px solid var(--line);border-radius:2px}
.mks-item b{display:block;font:700 16px/1.1 var(--ui);color:var(--ink);margin-bottom:3px}
.mks-item span{display:block;font:500 14px/1.3 var(--ui);color:var(--muted)}
.mks-put{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-bottom:8px}
.mks-put .mk-br span{font-size:12px}
.mk-recent{display:flex;align-items:center;gap:5px;overflow-x:auto;margin:-2px 0 10px;padding-bottom:2px;scrollbar-width:none}
.mk-recent::-webkit-scrollbar{display:none}
.mk-recent small{flex:none;font:700 10px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin-right:3px}
.mk-recent button{all:unset;flex:none;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--line);border-radius:2px;background:#120d0b}
.mk-recent button.on{border-color:var(--toffee)}
.mk-recent canvas{width:28px;height:28px;display:block}
.mk-chip canvas{width:24px;height:24px;display:block}
.mks-item canvas{width:40px;height:40px;display:block}
.mks-put .mk-br canvas{width:34px;height:34px}
.mk-recent button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mke-cvw{position:relative}
.mk-chip{all:unset;box-sizing:border-box;cursor:pointer;position:absolute;left:8px;top:8px;z-index:2;display:flex;align-items:center;gap:7px;max-width:calc(100% - 16px);padding:3px 9px 3px 3px;background:rgba(12,8,7,.86);border:1px solid rgba(227,165,74,.45);border-radius:2px;font:700 13px/1.05 var(--ui);color:var(--ink);letter-spacing:.03em}
.mk-chip canvas{flex:none;border-radius:1px}
.mk-chip span{display:flex;flex-direction:column;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mk-chip small{font:700 9px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--toffee)}
.mk-chip:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-cnt{float:right;font:600 11px/1 var(--ui);font-style:normal;letter-spacing:.06em;color:var(--faint)}
.mk-field>span{display:block}
.mk-sec{margin-top:4px}
.mk-help .mk-seg{margin-bottom:12px}
.mk-help-p{display:grid;gap:8px}
.mk-tip{padding:9px 11px;border:1px solid var(--line);border-radius:2px;background:rgba(255,255,255,.02)}
.mk-tip b{display:block;font:700 15px/1.1 var(--ui);letter-spacing:.06em;text-transform:uppercase;color:var(--toffee);margin-bottom:4px}
.mk-tip span{display:block;font:500 15px/1.35 var(--ui);color:var(--ink)}
@media (max-width:979px){
  .mke-tabs{position:sticky;top:0;z-index:3;background:#0b0807}
  .mke-tools .mk-btn{min-height:42px;flex:none}
  .mk-seg button{min-height:36px;padding:0 11px}
  .mk-br{min-height:72px}
}
@media (max-width:979px) and (orientation:landscape) and (max-height:560px){
  .mke-tools .mk-btn .tl{display:none}
  .mke-tools .mk-btn{padding:0;width:40px;min-height:36px}
  .mk-chip span{display:none}
  .mk-chip{padding:3px}
}
@media (max-width:560px){
  .mkp-hd b{font-size:24px}
  .mkp-card.intro .mkp-hd b{font-size:28px}
  .mkp-bd{font-size:16px}
  .mk-chip{left:6px;top:6px;padding:2px 8px 2px 2px;font-size:12px}
  .mks-put{grid-template-columns:repeat(auto-fill,minmax(58px,1fr))}
}
@media (pointer:coarse){
  .mk-in{font-size:16px}
  .mkp-op{min-height:52px}
}
@media (prefers-reduced-motion:reduce){
  .mkp-card,.mks-card,.mkcap,.mkp-card.phone .bub{transition:none;animation:none}
}`;
  safe(() => { const st = document.createElement('style'); st.id = 'mk124css'; st.textContent = CSS8; document.head.appendChild(st); });

  Object.assign(MK, { Pop, popShow: M74.popShow, capShow, openCell, closeCell, openHelp, gDown, gMove, gUp, recentList, EFFECTS, runFx });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
