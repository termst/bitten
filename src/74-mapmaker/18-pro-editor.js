/* 74.js section 18: pro-editor. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, ART, CH_COLS, CH_NAMES, EV_A, EV_DO, EV_MAX, EV_N, EV_WHEN, F_, GH, GW, IC, Maker, PRO, RDARK, RSH, RTB, R_, SHAPES, ST_IN, areaCopy, areaDelete, areaFill, areaMove, areaNorm, areaTransform, btn, canvasIcon, changed, closeDlg, colName, cycleSize, deleteStamp, dlg, el, esc, evDefaults, evOf, field, flipClip, grabArea, label, mirrorCells, myStamps, newEv, paintClip, pickSnake, pushUndo, rotClip, row, safe, saveStamp, seg, selectOf, shapeCells, snakeName, snakeSprite, stampAnchor, startStamp, tileAtlas, toast } = M74;
  /* ---- drawing the new tools on the canvas */
  function shade(c, cells, col) { c.fillStyle = col; for (const [x, y] of cells) c.fillRect(x * T + 1, y * T + 1, T - 2, T - 2); }
  function drawClipGhost(c, clip, cc, rr, set, t) {
    const at = safe(() => tileAtlas(set), null);
    c.globalAlpha = 0.5;
    for (let i = 0; i < clip.w * clip.h; i++) {
      const ch = clip.g[i], x = cc + (i % clip.w), y = rr + Math.floor(i / clip.w);
      if (ch === '.' || x < 0 || y < 0 || x >= GW || y >= GH) continue;
      if (at && at[ch]) c.drawImage(at[ch], x * T - 3, y * T - 7, T + 6, T + 6);
    }
    for (const q of clip.e) {
      const x = cc + q.c, y = rr + q.r; if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
      const px = (x + 0.5) * T, py = (y + 0.5) * T;
      safe(() => {
        if (q.t === 'sn') { const sp = snakeSprite(q.k, q.g); c.drawImage(sp, px - 18, py - 18, 36, 36); }
        else if (q.t !== 'sw' && q.t !== 'fb') ART[q.t](c, px, q.t === 'pd' ? py + 4 : py, Object.assign({}, q, { c: x, r: y }), t, 'icon');
        else { c.fillStyle = '#ff9a2a'; c.beginPath(); c.arc(px, py, 8, 0, TAU); c.fill(); }
      });
    }
    c.globalAlpha = 1;
    c.strokeStyle = '#7cc4ff'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
    c.strokeRect(cc * T + 0.75, rr * T + 0.75, clip.w * T - 1.5, clip.h * T - 1.5); c.setLineDash([]);
  }
  function drawWaves(c, R) {
    for (const e of R.e) {
      if (e.t !== 'sn' || !(e.wv > 1)) continue;
      const x = (e.c + 0.5) * T - 13, y = (e.r + 0.5) * T + 12;
      c.fillStyle = 'rgba(10,6,5,0.85)'; c.fillRect(x - 6, y - 5.5, 12, 11);
      c.strokeStyle = e.wv === 2 ? '#7cc4ff' : '#c08aff'; c.lineWidth = 1; c.strokeRect(x - 5.5, y - 5, 11, 10);
      label(c, x, y + 0.5, String(e.wv), e.wv === 2 ? '#7cc4ff' : '#c08aff', 7.5);
    }
  }
  safe(() => {
    const de = M74.drawEnts;
    M74.drawEnts = function (c, R) { const r = de.apply(this, arguments); safe(() => drawWaves(c, R)); return r; };
    const dov = M74.drawOverlay;
    M74.drawOverlay = function (c, R, F, t) {
      const st = Maker.stroke, h = Maker.hover;
      // the original draws a one cell ghost at the pointer; the new tools draw their own
      const keepH = Maker.hover;
      if ((st && (st.shape || st.mark || st.drag)) || Maker.tool === 'stamp' || Maker.tool === 'area') Maker.hover = null;
      try { dov.apply(this, arguments); } finally { Maker.hover = keepH; }
      if (st && st.shape) {
        const cells = shapeCells(st), all = [];
        for (const [x, y] of cells) for (const m of mirrorCells(x, y)) all.push(m);
        shade(c, all, st.erase ? 'rgba(232,58,80,0.3)' : 'rgba(227,165,74,0.32)');
      }
      const a = st && st.mark ? areaNorm(st.mark) : PRO.area;
      if (a) {
        c.fillStyle = 'rgba(124,196,255,0.12)'; c.fillRect(a.c0 * T, a.r0 * T, (a.c1 - a.c0 + 1) * T, (a.r1 - a.r0 + 1) * T);
        c.strokeStyle = '#7cc4ff'; c.lineWidth = 1.6; c.setLineDash([6, 4]); c.lineDashOffset = -(t * 14) % 10;
        c.strokeRect(a.c0 * T + 0.8, a.r0 * T + 0.8, (a.c1 - a.c0 + 1) * T - 1.6, (a.r1 - a.r0 + 1) * T - 1.6);
        c.setLineDash([]); c.lineDashOffset = 0;
        label(c, a.c0 * T + 16, a.r0 * T - 7 < 4 ? a.r0 * T + 9 : a.r0 * T - 7, `${a.c1 - a.c0 + 1}x${a.r1 - a.r0 + 1}`, '#7cc4ff', 8);
      }
      if (Maker.tool === 'stamp' && PRO.stamp && h && h.c >= 0) { const an = stampAnchor(h.c, h.r); drawClipGhost(c, PRO.stamp, an.c, an.r, F.set, t); }
      if (h && h.c >= 0 && PRO.size > 1 && (Maker.tool === 'brush' || Maker.tool === 'erase') && !(st && st.box)) {
        const o = PRO.size === 2 ? 0 : -1, cells = [];
        for (let dr = 0; dr < PRO.size; dr++) for (let dc = 0; dc < PRO.size; dc++) { const x = h.c + o + dc, y = h.r + o + dr; if (x >= 0 && y >= 0 && x < GW && y < GH) cells.push([x, y]); }
        shade(c, cells, Maker.tool === 'erase' ? 'rgba(232,58,80,0.18)' : 'rgba(227,165,74,0.16)');
      }
      if (h && h.c >= 0 && (SHAPES[Maker.tool] || Maker.tool === 'area') && !st) { c.strokeStyle = Maker.tool === 'area' ? '#7cc4ff' : '#e3a54a'; c.lineWidth = 1.6; c.strokeRect(h.c * T + 1, h.r * T + 1, T - 2, T - 2); }
    };
  });

  /* ---- keys */
  safe(() => {
    const ok = M74.onKey;
    M74.onKey = function (e) {
      if (!Maker.open) return ok.apply(this, arguments);
      const tag = (e.target && e.target.tagName) || '';
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const live = !typing && Maker.view === 'editor' && $('mkDlg').hidden;
      if (live) {
        const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
        if (k === 'escape' && (PRO.area || Maker.tool === 'stamp')) { e.stopPropagation(); e.preventDefault(); PRO.area = null; if (Maker.tool === 'stamp') M74.setTool('brush'); M74.renderInspector(); return; }
        if (mod && k === 'c' && PRO.area) { e.stopPropagation(); e.preventDefault(); areaCopy(false); return; }
        if (mod && k === 'x' && PRO.area) { e.stopPropagation(); e.preventDefault(); areaCopy(true); return; }
        if (mod && k === 'v' && PRO.clip && PRO.lastCopy === 'area') { e.stopPropagation(); e.preventDefault(); startStamp(PRO.clip); return; }
        if (mod && k === 'a') { e.stopPropagation(); e.preventDefault(); M74.setTool('area'); PRO.area = { c0: 0, r0: 0, c1: GW - 1, r1: GH - 1 }; M74.renderInspector(); return; }
        if (mod && k === 'c') PRO.lastCopy = 'room';
        if (!mod && !e.altKey) {
          const mine = { l: 'line', o: 'ring', c: 'oval', m: 'area' };
          if (mine[k]) { e.stopPropagation(); e.preventDefault(); M74.setTool(mine[k]); return; }
          if (k === 's') { e.stopPropagation(); e.preventDefault(); cycleSize(); return; }
          if ((k === 'delete' || k === 'backspace') && PRO.area) { e.stopPropagation(); e.preventDefault(); areaDelete(); return; }
          const arrows = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
          if (arrows[k] && PRO.area) { e.stopPropagation(); e.preventDefault(); areaMove(arrows[k][0], arrows[k][1]); return; }
          if (Maker.tool === 'stamp' && PRO.stamp && (k === 'x' || k === 'y' || k === 'r')) {
            e.stopPropagation(); e.preventDefault();
            PRO.stamp = k === 'x' ? flipClip(PRO.stamp, true) : k === 'y' ? flipClip(PRO.stamp, false) : rotClip(PRO.stamp);
            M74.renderInspector(); return;
          }
        }
      }
      return ok.apply(this, arguments);
    };
  });

  /* ---- the toolbar: a size button */
  safe(() => {
    const b0 = M74.build;
    M74.build = function () {
      const was = Maker.built;
      const r = b0.apply(this, arguments);
      if (!was) safe(() => {
        const tools = $('mkTools'), g = tools.querySelector('[data-mir="g"]');
        const sb = btn('', IC.size + '<span class="tl">Size 1</span><kbd>S</kbd>', 'Brush size (S)', cycleSize); sb.dataset.size = '1';
        tools.insertBefore(sb, g ? g.nextSibling : null);
        const R = $('mkTopR'), test = R.querySelector('.mk-btn.pri');
        const ts = btn('ic', IC.gear, 'Test settings', (function () { return M74.openTestSettings.apply(this, arguments); })); ts.id = 'mkTestSet';
        R.insertBefore(ts, test);
        const st = document.createElement('style'); st.id = 'mk149css'; st.textContent = M74.CSS14; document.head.appendChild(st);
        M74.syncTools();
      });
      return r;
    };
  });

  /* ---- the palette: Stamps */
  function stampBrushes() {
    return ST_IN.map((s, i) => ({ k: 'stamp', clip: s, name: s.n, id: 'st:b' + i, builtin: 1 }))
      .concat(myStamps().map((s, i) => ({ k: 'stamp', clip: s, name: s.n, id: 'st:m' + i, mine: i })));
  }
  safe(() => {
    const fp = M74.fillPal;
    M74.fillPal = function () {
      if (Maker.cat !== 'stamps' || Maker.q) return fp.apply(this, arguments);
      const pal = $('mkPal'); if (!pal) return;
      pal.textContent = '';
      const set = F_().set;
      if (PRO.clip) {
        const b = el('button', 'mk-br mk-stb'); b.type = 'button'; b.title = 'The clipboard';
        b.appendChild(canvasIcon(42, (c, s) => paintClip(c, s, PRO.clip, set)));
        b.appendChild(el('span', null, 'Clipboard'));
        b.addEventListener('click', (ev) => { ev.preventDefault(); startStamp(PRO.clip); });
        pal.appendChild(b);
      }
      for (const s of stampBrushes()) {
        const b = el('button', 'mk-br mk-stb' + (s.mine != null ? ' mine' : '')); b.type = 'button'; b.title = s.name;
        b.appendChild(canvasIcon(42, (c, sz) => paintClip(c, sz, s.clip, set)));
        b.appendChild(el('span', null, esc(s.name)));
        b.addEventListener('click', (ev) => { ev.preventDefault(); startStamp(Object.assign({}, s.clip, { n: s.name, mine: s.mine })); });
        pal.appendChild(b);
      }
      pal.appendChild(el('p', 'mk-p mk-stp', 'Make your own: Area tool (M), drag over a part of a room, Save as stamp. Stamps live in this browser.'));
    };
  });

  /* ---- the inspector card for the area and the stamp */
  safe(() => {
    const ri = M74.renderInspector;
    M74.renderInspector = function () {
      const r = ri.apply(this, arguments);
      safe(() => {
        const box = $('mkIns'); if (!box) return;
        if (Maker.tool === 'area') { box.textContent = ''; box.appendChild(areaCard()); }
        else if (Maker.tool === 'stamp' && PRO.stamp) { box.textContent = ''; box.appendChild(stampCard()); }
        else if (SHAPES[Maker.tool]) box.appendChild(el('div', 'mk-note', Maker.tool === 'line' ? 'Line: drag from one tile to another. Paints with the brush, right drag rubs out.'
          : Maker.tool === 'ring' ? 'Outline: drag a box, only its edge gets painted. Right drag rubs out.' : 'Circle: drag a box, the ring inside it gets painted. Hold Shift for a filled one.'));
      });
      return r;
    };
  });
  function areaCard() {
    const a = PRO.area, card = el('div', 'mk-card');
    const hd = el('div', 'hd');
    hd.appendChild(el('span', 'mk-ic', IC.area));
    hd.appendChild(el('div', null, `<small>Area tool</small><b>${a ? `${a.c1 - a.c0 + 1} x ${a.r1 - a.r0 + 1} tiles from ${colName(a.c0)}${a.r0 + 1}` : 'Drag over the room'}</b>`));
    card.appendChild(hd);
    if (!a) { card.appendChild(el('p', null, 'Drag a box over the room to select tiles and pieces. Then copy, cut, move, flip, turn or save it as a stamp. Ctrl A takes the whole room.')); return card; }
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('', IC.copy + 'Copy', 'Copy (Ctrl C)', () => areaCopy(false)),
      btn('', IC.erase + 'Cut', 'Cut (Ctrl X)', () => areaCopy(true)),
      btn('', IC.trash + 'Delete', 'Delete (Del)', areaDelete),
      btn('', IC.fill + 'Fill', 'Fill with the brush', areaFill),
      btn('', IC.flipX + 'Flip', 'Flip left and right', () => areaTransform((cl) => flipClip(cl, true))),
      btn('', IC.flipY + 'Flip', 'Flip top and bottom', () => areaTransform((cl) => flipClip(cl, false))),
    );
    card.appendChild(acts);
    const a2 = el('div', 'mk-acts'); a2.style.marginTop = '6px';
    a2.append(btn('gold', IC.stamp + 'Save as stamp', 'Save as a stamp in your library', () => {
      const clip = grabArea(R_(), a);
      const body = el('div'); const inp = el('input', 'mk-in'); inp.maxLength = 24; inp.value = 'My stamp'; body.appendChild(field('Name', inp));
      body.appendChild(el('p', 'mk-p', 'Stamps live in this browser and show under Paint, Stamps.'));
      dlg('Save as stamp', body, [btn('', 'Cancel', 'Cancel', closeDlg), btn('pri', IC.check + 'Save', 'Save', () => { if (saveStamp(clip, inp.value.trim())) { closeDlg(); if (Maker.cat === 'stamps') M74.fillPal(); } })]);
      setTimeout(() => { inp.focus(); inp.select(); }, 30);
    }), btn('', IC.stamp + 'Stamp it', 'Use as a stamp brush', () => startStamp(grabArea(R_(), a))));
    card.appendChild(a2);
    card.appendChild(el('p', 'mk-p mk-small', 'Drag inside the box or use the arrow keys to move it. Esc lets go.'));
    return card;
  }
  function stampCard() {
    const S = PRO.stamp, card = el('div', 'mk-card');
    const hd = el('div', 'hd');
    hd.appendChild(canvasIcon(44, (c, s) => paintClip(c, s, S, F_().set)));
    hd.appendChild(el('div', null, `<small>Stamp, ${S.w} x ${S.h}</small><b>${esc(S.n || 'Clipboard')}</b>`));
    card.appendChild(hd);
    card.appendChild(el('p', null, 'Click to put it down, as often as you like. Empty tiles of the stamp leave the room alone. Right click or Esc stops.'));
    const acts = el('div', 'mk-acts');
    acts.append(
      btn('', IC.flipX + 'Flip', 'Flip left and right (X)', () => { PRO.stamp = flipClip(PRO.stamp, true); M74.renderInspector(); }),
      btn('', IC.flipY + 'Flip', 'Flip top and bottom (Y)', () => { PRO.stamp = flipClip(PRO.stamp, false); M74.renderInspector(); }),
      btn('', IC.rot + 'Turn', 'Turn a quarter (R)', () => { PRO.stamp = rotClip(PRO.stamp); M74.renderInspector(); }),
    );
    if (S.mine != null) acts.appendChild(btn('red', IC.trash + 'Delete', 'Delete from your stamps', () => { deleteStamp(S.mine); M74.setTool('brush'); Maker.cat = 'stamps'; M74.fillPal(); toast('Stamp deleted'); }));
    card.appendChild(acts);
    return card;
  }

  /* ---- the room pane: Room rules and Events */
  function roomRulesSection(R) {
    const sec = el('div', 'mk-sec');
    sec.appendChild(el('h4', 'mk-h', 'Room rules'));
    const upd = (k, v) => { pushUndo(); R[k] = v; changed(); };
    sec.appendChild(row('Darkness', seg(RDARK, R.dk == null ? -1 : R.dk, (v) => upd('dk', v))));
    sec.appendChild(row('Snake health', seg(RSH, R.sh || 1, (v) => upd('sh', v))));
    sec.appendChild(row('Beat the clock', seg(RTB, R.tb || 0, (v) => upd('tb', v))));
    const waves = R.e.filter((e) => e.t === 'sn' && e.wv > 1).length;
    sec.appendChild(el('p', 'mk-p', `${R.tb ? `Clear the fight within ${R.tb} seconds for a free powerup. ` : ''}${waves ? `${waves} snake${waves === 1 ? '' : 's'} wait for a later wave. ` : ''}Waves: select a snake and set its Wave. The next wave comes when the last one is dead.`));
    return sec;
  }
  function evLine(R, ev, i) {
    const box = el('div', 'mk-ev');
    const upd = (fn) => { pushUndo(); fn(); evDefaults(ev); changed(); };
    const hd = el('div', 'mk-ev-hd');
    hd.appendChild(el('b', null, `Event ${i + 1}`));
    hd.appendChild(btn('ic red', IC.trash, 'Remove this event', () => upd(() => { R.ev.splice(i, 1); })));
    box.appendChild(hd);
    box.appendChild(field('When', selectOf(EV_WHEN, ev.w, (v) => upd(() => { ev.w = v; }))));
    if (EV_N[ev.w]) box.appendChild(row(ev.w === 'time' ? 'After' : ev.w === 'kills' ? 'Count' : 'Wave', seg(EV_N[ev.w], ev.n, (v) => upd(() => { ev.n = v; }))));
    if (ev.w === 'flip') box.appendChild(row('Color', seg(CH_NAMES.map((n, k) => [k, n, `<i style="background:${CH_COLS[k]}"></i>`]), ev.n | 0, (v) => upd(() => { ev.n = v; }))));
    box.appendChild(field('Do', selectOf(EV_DO, ev.d, (v) => upd(() => { ev.d = v; }))));
    if (ev.d === 'shout') {
      const t = el('input', 'mk-in'); t.maxLength = 40; t.value = ev.txt || ''; t.placeholder = 'A big line over the room';
      t.addEventListener('change', () => upd(() => { ev.txt = t.value.slice(0, 40); }));
      box.appendChild(field('Line', t));
    }
    if (ev.d === 'gates') box.appendChild(row('Color', seg(CH_NAMES.map((n, k) => [k, n, `<i style="background:${CH_COLS[k]}"></i>`]), ev.a | 0, (v) => upd(() => { ev.a = v; }))));
    if (ev.d === 'snakes') {
      const b = el('button', 'mk-pick'); b.type = 'button';
      b.appendChild(canvasIcon(28, (c, s) => c.drawImage(snakeSprite(ev.k), 0, 0, s, s)));
      b.appendChild(el('span', null, esc(snakeName(ev.k))));
      b.addEventListener('click', (e) => { e.preventDefault(); pickSnake(ev.k, (k) => upd(() => { ev.k = k; })); });
      box.appendChild(row('Snake', b));
    }
    if (EV_A[ev.d]) box.appendChild(row(ev.d === 'snakes' ? 'How many' : ev.d === 'lights' ? 'Lights' : 'Amount', seg(EV_A[ev.d], ev.a, (v) => upd(() => { ev.a = v; }))));
    return box;
  }
  function eventsSection(R) {
    const sec = el('div', 'mk-sec');
    const list = evOf(R);
    sec.appendChild(el('h4', 'mk-h', `Events (${list.length} of ${EV_MAX})`));
    if (!list.length) sec.appendChild(el('p', 'mk-p', 'When something happens in this room, something else happens. Walk in and the lights go out. Kill three snakes and the red gates open. After 20 seconds a second pack comes out. Each event fires once.'));
    list.forEach((ev, i) => sec.appendChild(evLine(R, ev, i)));
    if (list.length < EV_MAX) sec.appendChild(btn('gold', IC.bolt + 'Add an event', 'Add an event to this room', () => { pushUndo(); list.push(newEv()); changed(); }));
    return sec;
  }
  safe(() => {
    const rr = M74.renderRoomPane;
    M74.renderRoomPane = function () {
      const r = rr.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop, R = R_();
        const doors = pane.querySelector('.mk-doors'), h = doors && doors.previousElementSibling;
        for (const s of [roomRulesSection(R), eventsSection(R)]) { if (h) pane.insertBefore(s, h); else pane.appendChild(s); }
        pane.scrollTop = top;
      });
      return r;
    };
    const rc = M74.renderCrumb;
    M74.renderCrumb = function () {
      const r = rc.apply(this, arguments);
      safe(() => {
        const b = $('mkCrumb'), R = Maker.M && R_(); if (!b || !R) return;
        const bits = [];
        if (R.ev && R.ev.length) bits.push(`${R.ev.length} event${R.ev.length === 1 ? '' : 's'}`);
        const wv = R.e.reduce((m, e) => (e.t === 'sn' ? Math.max(m, e.wv || 1) : m), 0);
        if (wv > 1) bits.push(`${wv} waves`);
        if (R.tb) bits.push(`clock ${R.tb} s`);
        if (bits.length) { const s = el('span', 'mk-crx', esc(bits.join(' · '))); const hv = b.querySelector('.hv'); b.insertBefore(s, hv); }
      });
      return r;
    };
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
