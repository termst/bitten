/* 74.js section 10: editor-canvas. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { $, ART, BOSSES, DYN_DRAW, EMPTY, ENTS, ENT_PARAMS, FH, FIXED, FONT, FW, F_, GH, GN, GW, IC, LIMITS, MOUTH, Maker, RT, RTM, R_, SIDES, SNAKES, SOLID_TILE, SVG, TILE, addRoom, bossName, bossSprite, btn, canvasIcon, changed, cleanEnt, cloneMap, cycleEdge, doRedo, doUndo, doorsOf, edgeOf, el, encodeMap, entAt, esc, flipEnt, goFloor, label, neighbor, pasteRoom, pieceArt, pushUndo, roomAt, rowsOf, safe, saveNow, seg, setCh, setDef, setPane, showHub, snakeName, snakeSprite, tileAtlas, toast, typeTemplate, withScene } = M74;
  M74.initGrip = initGrip; M74.layoutCanvas = layoutCanvas; M74.previewRoom = previewRoom; M74.drawEnts = drawEnts; M74.drawOverlay = drawOverlay; M74.drawEditor = drawEditor; M74.startLoop = startLoop; M74.stopLoop = stopLoop; M74.mirrorCells = mirrorCells; M74.mouthAt = mouthAt; M74.applyAt = applyAt; M74.fillAt = fillAt; M74.lineCells = lineCells; M74.cellFrom = cellFrom; M74.onDown = onDown; M74.onMove = onMove; M74.onUp = onUp; M74.onKey = onKey; M74.closeDlg = closeDlg; M74.dlg = dlg; M74.openShare = openShare; M74.pickItem = pickItem; M74.pickSnake = pickSnake; M74.pickBoss = pickBoss; M74.play = play; M74.playMap = playMap;
  /* ---- the room on the canvas, drawn by the game's own renderer */
  /* the drag bar on phones: the share of the editor the room takes is kept as a fraction, so it survives turning the phone */
  function initGrip() {
    const g = $('mkGrip'), tabs = $('mkTabs'), stage = document.querySelector('#mkEd .mke-stage'), body = g && g.parentNode;
    if (!g || !tabs || !stage || !body) return;
    const KEY = 'bitten-mk-sh';
    let frac = null, drag = null, lastUp = 0;
    try { const f = parseFloat(localStorage.getItem(KEY)); if (f > 0.1 && f < 0.95) frac = f; } catch (e) { /* ignore */ }
    const bounds = () => { const bh = body.clientHeight; return [Math.min(170, bh * 0.4), Math.max(170, bh - tabs.offsetHeight - g.offsetHeight - 130), bh]; };
    const apply = () => {
      const [lo, hi, bh] = bounds();
      if (!bh || g.offsetHeight === 0) return;
      if (frac == null) { body.style.removeProperty('--mk-sh'); return; }
      const h = Math.round(clamp(frac * bh, lo, hi));
      body.style.setProperty('--mk-sh', h + 'px');
      g.setAttribute('aria-valuenow', String(h));
    };
    const save = () => { try { if (frac == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, String(frac)); } catch (e) { /* ignore */ } };
    const reset = () => { frac = null; apply(); save(); };
    const setPx = (h) => { const [lo, hi, bh] = bounds(); if (!bh) return; frac = clamp(h, lo, hi) / bh; apply(); };
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { g.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      drag = { y: e.clientY, h: stage.getBoundingClientRect().height, moved: false };
      g.classList.add('drag');
    });
    g.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (Math.abs(e.clientY - drag.y) > 3) drag.moved = true;
      if (drag.moved) setPx(drag.h + e.clientY - drag.y);
    });
    const end = (e) => {
      if (!drag) return;
      const moved = drag.moved; drag = null; g.classList.remove('drag');
      if (moved) { save(); lastUp = 0; return; }
      const now = Date.now();
      if (e && e.type === 'pointerup' && now - lastUp < 380) { reset(); lastUp = 0; } else lastUp = now;
    };
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
    g.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'Home') return;
      e.preventDefault(); e.stopPropagation();
      if (k === 'Home') { reset(); return; }
      setPx(stage.getBoundingClientRect().height + (k === 'ArrowUp' ? -28 : 28)); save();
    });
    try { new ResizeObserver(apply).observe(body); } catch (e) { window.addEventListener('resize', apply); }
    apply();
  }
  function layoutCanvas() {
    const w = $('mkCvw'); if (!w || !Maker.cv || Maker.view !== 'editor' || $('mkEd').hidden) return;
    const r = w.getBoundingClientRect();
    const aw = Math.max(120, r.width - 14), ah = Math.max(90, r.height - 14);
    const s = Math.max(0.3, Math.min(aw / VIEW_W, ah / VIEW_H));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.abs(s - Maker.s) < 0.001 && dpr === Maker.dpr && Maker.cv.width) return;
    Maker.s = s; Maker.dpr = dpr;
    Maker.cv.style.width = Math.round(VIEW_W * s) + 'px'; Maker.cv.style.height = Math.round(VIEW_H * s) + 'px';
    Maker.cv.width = Math.round(VIEW_W * s * dpr); Maker.cv.height = Math.round(VIEW_H * s * dpr);
    Maker.pvKey = '';
  }
  const gameType = (t) => (t === 'arena' ? 'chaosboss' : t);
  function previewRoom() {
    const F = F_(), R = R_(), def = setDef(F.set);
    const dk = Object.keys(SIDES).map((s) => { const o = neighbor(F, R, s); return o ? edgeOf(F, R, s) + o.t + (o.lk ? 'L' : '') : '-'; }).join('');
    const bossK = F.boss !== 'auto' ? F.boss : def.boss;
    const key = [Maker.fi, R.x, R.y, R.t, R.g, F.set, R.st, dk, bossK, Maker.s, Maker.dpr].join('|');
    if (key === Maker.pvKey && Maker.pv) return Maker.pv;
    const room = new Room(R.x, R.y, 0);
    room.type = gameType(R.t);
    let g = R.g;
    if (FIXED[R.t]) g = typeTemplate(R.t) || g;
    for (const s in SIDES) {
      const o = neighbor(F, R, s); if (!o) continue;
      const e = edgeOf(F, R, s);
      if (e === 'o') { const nb = new Room(o.x, o.y, 1); nb.type = gameType(o.t); nb.sealed = !!o.lk || o.t === 'vault'; room.doors[s] = nb; }
      else if (e === 'c' && !room.secretLink) room.secretLink = { k: s, room, hp: 3 };
    }
    if (def.set === 'market') room.store = R.st || 'blue';
    if (R.t === 'shop') room.store = R.st || 'blue';
    safe(() => withScene(room, def, () => {
      let rows = rowsOf(g);
      if (R.t === 'boss' && g === EMPTY && typeof BOSS_TPL10 !== 'undefined' && BOSS_TPL10[bossK]) rows = BOSS_TPL10[bossK];
      room.build(rows, def, {});
      if (R.t === 'quiet') safe(() => setupQuiet10(room));
      room.decals = [];
      buildRoomCache(room, def, Math.min(3, Maker.s * Maker.dpr));
    }));
    Maker.pv = room; Maker.pvKey = key;
    return room;
  }
  const BIG_SN = { long: 1.25, sloper: 1.3, driekop: 1.2, tetra: 1.15, pantser: 1.1 }, SMALL_SN = { grub: 0.8, raver: 0.75, splitling: 0.72, creeper: 0.85, rotling: 0.8 };
  function editSaw(R, e) {
    const solid = (c, r) => c < 0 || r < 0 || c >= GW || r >= GH || SOLID_TILE(R.g[r * GW + c]) || (() => { const o = entAt(R, c, r); return !!(o && ENTS[o.t].solid); })();
    let lo = e.ax === 'v' ? e.r : e.c, hi = lo;
    if (e.ax === 'v') { while (!solid(e.c, lo - 1)) lo--; while (!solid(e.c, hi + 1)) hi++; }
    else { while (!solid(lo - 1, e.r)) lo--; while (!solid(hi + 1, e.r)) hi++; }
    return { lo: (lo + 0.5) * T, hi: (hi + 0.5) * T };
  }
  const FLAT = { ac: 0, wk: 0, sp: 0, sk: 1, jp: 2, tp: 2, ex: 2, sw: 3, pd: 4 }; M74.FLAT = FLAT;
  function drawEnts(c, R, t) {
    const list = R.e.slice().sort((a, b) => (FLAT[a.t] != null ? FLAT[a.t] : 6) - (FLAT[b.t] != null ? FLAT[b.t] : 6) || a.r - b.r);
    for (const e of list) {
      const x = (e.c + 0.5) * T, y = (e.r + 0.5) * T;
      safe(() => {
        if (e.t === 'sn') {
          const sp = snakeSprite(e.k, e.g), S = 36 * (BIG_SN[e.k] || SMALL_SN[e.k] || 1);
          c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x, y + 6, S * 0.42, S * 0.24); c.fill();
          if (e.g) { c.strokeStyle = 'rgba(255,200,58,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 17, 0, TAU); c.stroke(); }
          c.drawImage(sp, x - S / 2, y - S / 2, S, S);
          if (e.tr) label(c, x + 12, y - 13, e.tr[0].toUpperCase(), TRAIT_COLS[e.tr] || '#fff', 8);
          return;
        }
        if (e.t === 'sw') { const rg = editSaw(R, e); ART.sw(c, x, y, Object.assign({}, e, rg, { x, y }), t, 'edit'); return; }
        if (e.t === 'fb') { ART.fb(c, x, y, e, t, 'edit'); return; }
        if (e.t === 'pd') { ART.pd(c, x, y + 4, e, t, 'edit'); return; }
        ART[e.t](c, x, y, e, t, 'edit');
      });
    }
  }
  function mouths(F, R) { const out = {}; for (const s of doorsOf(F, R)) { const [c, r] = MOUTH[s]; out[r * GW + c] = s; } return out; }
  function drawOverlay(c, R, F, t) {
    // the grid
    if (Maker.showGrid) {
      c.strokeStyle = 'rgba(255,240,220,0.07)'; c.lineWidth = 1 / Maker.s;
      c.beginPath();
      for (let i = 1; i < GW; i++) { c.moveTo(i * T, 0); c.lineTo(i * T, RH); }
      for (let i = 1; i < GH; i++) { c.moveTo(0, i * T); c.lineTo(RW, i * T); }
      c.stroke();
    }
    if (Maker.mirX || Maker.mirY) {
      c.strokeStyle = 'rgba(227,165,74,0.55)'; c.lineWidth = 1.2; c.setLineDash([5, 5]);
      c.beginPath(); if (Maker.mirX) { c.moveTo(RW / 2, 0); c.lineTo(RW / 2, RH); } if (Maker.mirY) { c.moveTo(0, RH / 2); c.lineTo(RW, RH / 2); } c.stroke(); c.setLineDash([]);
    }
    // doorways: what is behind them, and a + where a room could go
    const mo = mouths(F, R);
    for (const k in mo) {
      const i = +k, cc = i % GW, rr = Math.floor(i / GW), e = entAt(R, cc, rr);
      if (SOLID_TILE(R.g[i]) || (e && ENTS[e.t].solid && e.t !== 'gt')) { c.strokeStyle = '#ff4a5a'; c.lineWidth = 2; c.strokeRect(cc * T + 3, rr * T + 3, T - 6, T - 6); label(c, (cc + 0.5) * T, (rr + 0.5) * T, 'BLOCKED', '#ff8494', 8); }
    }
    for (const s in SIDES) {
      const v = SIDES[s], o = neighbor(F, R, s), [mc, mr] = MOUTH[s];
      const x = s === 'w' ? -WALL / 2 : s === 'e' ? RW + WALL / 2 : (mc + 0.5) * T, y = s === 'n' ? -WALL / 2 : s === 's' ? RH + WALL / 2 : (mr + 0.5) * T;
      if (o) {
        const ed = edgeOf(F, R, s);
        const txt = ed === 'w' ? 'WALL' : ed === 'c' ? 'CRACK' : RT[o.t].code + (o.lk ? ' •' : '');
        c.fillStyle = 'rgba(10,6,5,0.85)'; c.fillRect(x - 17, y - 6.5, 34, 13);
        c.strokeStyle = ed === 'o' ? RT[o.t].col : ed === 'c' ? '#e3a54a' : '#5a2a2e'; c.lineWidth = 1; c.strokeRect(x - 17 + 0.5, y - 6.5 + 0.5, 33, 12);
        label(c, x, y + 0.5, txt, ed === 'o' ? '#ece2d4' : ed === 'c' ? '#e3a54a' : '#a66', 7.5);
      } else if (R.x + v[0] >= 0 && R.x + v[0] < FW && R.y + v[1] >= 0 && R.y + v[1] < FH) {
        const hov = Maker.hoverWall === s;
        c.fillStyle = hov ? 'rgba(227,165,74,0.9)' : 'rgba(10,6,5,0.75)'; c.fillRect(x - 8, y - 8, 16, 16);
        c.strokeStyle = 'rgba(227,165,74,0.8)'; c.lineWidth = 1; c.strokeRect(x - 7.5, y - 7.5, 15, 15);
        c.strokeStyle = hov ? '#16100d' : '#e3a54a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.moveTo(x, y - 4); c.lineTo(x, y + 4); c.stroke();
      }
    }
    if (FIXED[R.t]) { c.fillStyle = 'rgba(10,6,5,0.35)'; c.fillRect(0, 0, RW, RH); label(c, RW / 2, 16, 'FIXED LAYOUT', '#e3a54a', 10); }
    // the selected piece
    if (Maker.sel) { c.strokeStyle = '#e3a54a'; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.strokeRect(Maker.sel.c * T + 1.5, Maker.sel.r * T + 1.5, T - 3, T - 3); c.setLineDash([]); }
    // the box being dragged
    const st = Maker.stroke;
    if (st && st.box) {
      const b = st.box, c0 = Math.min(b.c0, b.c1), c1 = Math.max(b.c0, b.c1), r0 = Math.min(b.r0, b.r1), r1 = Math.max(b.r0, b.r1);
      c.fillStyle = st.tool === 'erase' ? 'rgba(232,58,80,0.18)' : 'rgba(227,165,74,0.18)'; c.fillRect(c0 * T, r0 * T, (c1 - c0 + 1) * T, (r1 - r0 + 1) * T);
      c.strokeStyle = '#e3a54a'; c.lineWidth = 1.5; c.strokeRect(c0 * T + 0.75, r0 * T + 0.75, (c1 - c0 + 1) * T - 1.5, (r1 - r0 + 1) * T - 1.5);
    }
    // the hovered cell, and a ghost of the brush in it
    const h = Maker.hover;
    if (h && h.c >= 0 && h.r >= 0 && h.c < GW && h.r < GH && !(st && st.box)) {
      const cells = mirrorCells(h.c, h.r);
      for (const [cc, rr] of cells) {
        const erase = Maker.tool === 'erase';
        if (Maker.tool === 'brush' && !FIXED[R.t]) {
          c.globalAlpha = 0.45;
          const br = Maker.brush, x = (cc + 0.5) * T, y = (rr + 0.5) * T;
          if (br.k === 'ent') safe(() => { if (br.t === 'sn') { const sp = snakeSprite(br.p.k, br.p.g); c.drawImage(sp, x - 18, y - 18, 36, 36); } else if (br.t !== 'sw' && br.t !== 'fb') ART[br.t](c, x, br.t === 'pd' ? y + 4 : y, Object.assign({ c: cc, r: rr }, br.p), t, 'icon'); });
          else { const a = tileAtlas(F.set)[br.ch]; if (a) c.drawImage(a, cc * T - 3, rr * T - 7, T + 6, T + 6); }
          c.globalAlpha = 1;
        }
        c.strokeStyle = erase ? '#ff6a7a' : Maker.tool === 'move' ? '#7cc4ff' : '#e3a54a'; c.lineWidth = 1.6;
        c.strokeRect(cc * T + 1, rr * T + 1, T - 2, T - 2);
      }
    }
  }
  function drawEditor(now) {
    const c = Maker.ctx, cv = Maker.cv; if (!c || !Maker.M || !cv.width) return;
    const s = Maker.s, dpr = Maker.dpr, k = s * dpr, t = now / 1000;
    const F = F_(), R = R_(), def = setDef(F.set);
    const pv = previewRoom();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0b0807'; c.fillRect(0, 0, cv.width, cv.height);
    if (pv.cache) c.drawImage(pv.cache, 0, 0, cv.width, cv.height);
    c.setTransform(k, 0, 0, k, WALL * k, WALL * k);
    c.lineJoin = 'round'; c.lineCap = 'round';
    withScene(pv, def, () => {
      G.t = t;
      safe(() => { if (pv.belts.length) drawBelts(c, pv, t); });
      safe(() => drawFloorThings(c, pv, t));
      const g = FIXED[R.t] ? typeTemplate(R.t) || R.g : R.g;
      for (let i = 0; i < GN; i++) if ('$+%!qsp'.includes(g[i])) safe(() => pieceArt(c, g[i], (i % GW + 0.5) * T, (Math.floor(i / GW) + 0.5) * T, t));
      for (const o of pv.obs) safe(() => DYN_DRAW(c, o, pv, def, t));
      for (const ct of pv.carts) safe(() => drawCart(c, ct, pv));
      for (const p of pv.pickups) if (p.kind === 'heart') safe(() => drawHeartPickup(c, p, t));
      for (const rt of pv.rots) safe(() => drawRot(c, rt, t));
    });
    if (!FIXED[R.t]) M74.drawEnts(c, R, t);
    M74.drawOverlay(c, R, F, t);
  }
  function loop(now) {
    Maker.raf = 0;
    if (!Maker.open || Maker.view !== 'editor') return;
    Maker.raf = Sched.raf(loop);
    if (now - Maker.last < 33) return;
    Maker.last = now;
    safe(() => drawEditor(now));
  }
  function startLoop() { if (!Maker.raf) Maker.raf = Sched.raf(loop); }
  function stopLoop() { if (Maker.raf) Sched.cancel(Maker.raf); Maker.raf = 0; }

  /* ---- painting */
  function mirrorCells(c, r) {
    const out = [[c, r]];
    if (Maker.mirX) out.push([GW - 1 - c, r]);
    if (Maker.mirY) out.push([c, GH - 1 - r]);
    if (Maker.mirX && Maker.mirY) out.push([GW - 1 - c, GH - 1 - r]);
    const seen = new Set();
    return out.filter(([a, b]) => { const k = a + ',' + b; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function ensureUndo() { const st = Maker.stroke; if (st && st.saved) return; pushUndo(); if (st) st.saved = true; }
  let warnT = 0;
  function warnOnce(msg) { if (performance.now() - warnT > 1500) { warnT = performance.now(); toast(msg); } }
  function mouthAt(F, R, c, r) { return mouths(F, R)[r * GW + c]; }
  function sameEnt(a, b) { if (a.t !== b.t) return false; for (const p of ENT_PARAMS[a.t]) if (a[p.k] !== b[p.k]) return false; return true; }
  function paintOne(R, F, c, r, tool, fx, fy) {
    const i = r * GW + c;
    if (tool === 'erase') {
      let ch = false;
      if (R.g[i] !== '.') { ensureUndo(); setCh(R, c, r, '.'); ch = true; }
      const e = entAt(R, c, r); if (e) { ensureUndo(); R.e.splice(R.e.indexOf(e), 1); ch = true; if (Maker.sel && Maker.sel.c === c && Maker.sel.r === r) Maker.sel = null; }
      return ch;
    }
    const br = Maker.brush;
    if (br.k === 'tile') {
      if (TILE[br.ch].solid && mouthAt(F, R, c, r)) { warnOnce('Keep the doorway clear.'); return false; }
      const e = entAt(R, c, r);
      if (R.g[i] === br.ch && !e) return false;
      ensureUndo();
      setCh(R, c, r, br.ch);
      if (e) R.e.splice(R.e.indexOf(e), 1);
      return true;
    }
    if (ENTS[br.t].solid && br.t !== 'gt' && mouthAt(F, R, c, r)) { warnOnce('Keep the doorway clear.'); return false; }
    const ex = entAt(R, c, r);
    if (!ex && R.e.length >= LIMITS.ents) { warnOnce(`${LIMITS.ents} pieces is the most for one room.`); return false; }
    let n = Object.assign({ t: br.t, c, r }, br.p);
    if (fx) n = flipEnt(Object.assign({}, n, { c: GW - 1 - c }), true);
    if (fy) n = flipEnt(Object.assign({}, n, { r: GH - 1 - r }), false);
    n.c = c; n.r = r;
    n = cleanEnt(n); if (!n) return false;
    if (ex && sameEnt(ex, n) && R.g[i] === '.') return false;
    ensureUndo();
    if (ex) R.e.splice(R.e.indexOf(ex), 1);
    if (R.g[i] !== '.') setCh(R, c, r, '.');
    R.e.push(n);
    return true;
  }
  function applyAt(c, r, tool) {
    const R = R_(), F = F_();
    if (c < 0 || r < 0 || c >= GW || r >= GH) return;
    let any = false;
    for (const [cc, rr] of mirrorCells(c, r)) any = paintOne(R, F, cc, rr, tool, cc !== c, rr !== r) || any;
    if (any && Maker.stroke) Maker.stroke.changed = true;
  }
  function sig(R, c, r) { const e = entAt(R, c, r); return e ? 'e:' + e.t + ':' + (e.k || '') + (e.ch != null ? e.ch : '') : 't:' + R.g[r * GW + c]; }
  function fillAt(c, r) {
    const R = R_(), F = F_(), want = sig(R, c, r), q = [[c, r]], seen = new Set([r * GW + c]);
    const tool = Maker.tool === 'erase' ? 'erase' : 'brush';
    Maker.stroke = { tool, saved: false, changed: false };
    let n = 0;
    while (q.length && n < GN) {
      const [x, y] = q.shift(); n++;
      paintOne(R, F, x, y, tool, false, false);
      for (const [dx, dy] of DIR4) {
        const nx = x + dx, ny = y + dy, k = ny * GW + nx;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || seen.has(k)) continue;
        seen.add(k);
        if (sig(R, nx, ny) === want) q.push([nx, ny]);
      }
    }
    const ch = Maker.stroke.changed || Maker.stroke.saved;
    Maker.stroke = null;
    if (ch) changed();
  }
  function boxFill(b, tool) {
    const c0 = Math.min(b.c0, b.c1), c1 = Math.max(b.c0, b.c1), r0 = Math.min(b.r0, b.r1), r1 = Math.max(b.r0, b.r1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) M74.applyAt(c, r, tool);
  }
  function pickFrom(c, r) {
    const R = R_(), e = entAt(R, c, r);
    if (e) { const p = Object.assign({}, e); delete p.c; delete p.r; delete p.t; M74.pickBrush({ k: 'ent', t: e.t, p }); toast(`Picked ${e.t === 'sn' ? snakeName(e.k) : ENTS[e.t].name}`); }
    else { M74.pickBrush({ k: 'tile', ch: R.g[r * GW + c] }); toast(`Picked ${TILE[R.g[r * GW + c]].name}`); }
  }
  function lineCells(c0, r0, c1, r1) {
    const out = []; let dx = Math.abs(c1 - c0), dy = -Math.abs(r1 - r0), sx = c0 < c1 ? 1 : -1, sy = r0 < r1 ? 1 : -1, err = dx + dy;
    for (let i = 0; i < 40; i++) { out.push([c0, r0]); if (c0 === c1 && r0 === r1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; c0 += sx; } if (e2 <= dx) { err += dx; r0 += sy; } }
    return out;
  }
  function cellFrom(e) {
    const r = Maker.cv.getBoundingClientRect();
    const wx = (e.clientX - r.left) / Maker.s - WALL, wy = (e.clientY - r.top) / Maker.s - WALL;
    return { wx, wy, c: Math.floor(wx / T), r: Math.floor(wy / T), inside: wx >= 0 && wy >= 0 && wx < RW && wy < RH };
  }
  function wallSide(p) {
    if (p.inside) return null;
    const near = (a, b) => Math.abs(a - b) < 26;
    if (p.wy < 0 && near(p.wx, RW / 2)) return 'n';
    if (p.wy > RH && near(p.wx, RW / 2)) return 's';
    if (p.wx < 0 && near(p.wy, RH / 2)) return 'w';
    if (p.wx > RW && near(p.wy, RH / 2)) return 'e';
    return null;
  }
  function onDown(e) {
    if (!Maker.M) return;
    const p = cellFrom(e);
    if (!p.inside) {
      const s = wallSide(p); if (!s) return;
      const F = F_(), R = R_(), o = neighbor(F, R, s);
      if (o) cycleEdge(R, s);
      else addRoom(R.x + SIDES[s][0], R.y + SIDES[s][1], true);
      return;
    }
    e.preventDefault();
    try { Maker.cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const R = R_();
    const tool = e.button === 2 ? 'erase' : Maker.tool;
    if (FIXED[R.t] && tool !== 'pick') { toast('This room has a fixed layout.'); return; }
    if (tool === 'pick') { pickFrom(p.c, p.r); return; }
    if (tool === 'move') {
      const ent = entAt(R, p.c, p.r);
      Maker.sel = ent ? { c: p.c, r: p.r } : null;
      Maker.stroke = { tool, drag: ent, saved: false, changed: false };
      if (!ent) toast('Nothing to select here. Pieces and snakes can be selected.');
      M74.renderInspector();
      return;
    }
    if (tool === 'fill') { M74.fillAt(p.c, p.r); return; }
    Maker.stroke = { tool, saved: false, changed: false, last: p };
    if (tool === 'box') { Maker.stroke.box = { c0: p.c, r0: p.r, c1: p.c, r1: p.r }; Maker.stroke.boxTool = e.button === 2 ? 'erase' : 'brush'; return; }
    M74.applyAt(p.c, p.r, tool);
  }
  function onMove(e) {
    if (!Maker.M) return;
    const p = cellFrom(e);
    const hv = p.inside ? { c: p.c, r: p.r } : null;
    Maker.hoverWall = wallSide(p);
    if (!Maker.hover || !hv || hv.c !== Maker.hover.c || hv.r !== Maker.hover.r) { Maker.hover = hv; M74.renderCrumb(); }
    const st = Maker.stroke; if (!st) return;
    if (st.box) { st.box.c1 = clamp(p.c, 0, GW - 1); st.box.r1 = clamp(p.r, 0, GH - 1); return; }
    if (st.tool === 'move') {
      const R = R_();
      if (!st.drag || !p.inside || (p.c === st.drag.c && p.r === st.drag.r)) return;
      if (entAt(R, p.c, p.r) || SOLID_TILE(R.g[p.r * GW + p.c])) return;
      if (ENTS[st.drag.t].solid && st.drag.t !== 'gt' && mouthAt(F_(), R, p.c, p.r)) return;
      ensureUndo();
      st.drag.c = p.c; st.drag.r = p.r; Maker.sel = { c: p.c, r: p.r }; st.changed = true;
      return;
    }
    if (!p.inside) return;
    const last = st.last || p;
    for (const [c, r] of lineCells(last.c, last.r, p.c, p.r)) M74.applyAt(c, r, st.tool);
    st.last = p;
  }
  function onUp() {
    const st = Maker.stroke; if (!st) return;
    if (st.box) boxFill(st.box, st.boxTool === 'erase' ? 'erase' : Maker.tool === 'box' ? 'brush' : st.tool);
    Maker.stroke = null;
    if (st.changed || st.saved) { changed(); if (st.tool === 'move') M74.renderInspector(); }
  }

  /* ---- keys */
  function onKey(e) {
    if (!Maker.open) return;
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!$('mkDlg').hidden) closeDlg();
      else if (typing) e.target.blur();
      else if (Maker.view === 'editor') { saveNow(); showHub(); }
      else Maker.close();
      return;
    }
    if (typing || Maker.view !== 'editor' || !$('mkDlg').hidden) return;
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); return; }
    if (mod && k === 'y') { e.preventDefault(); doRedo(); return; }
    if (mod && k === 'c') { e.preventDefault(); const R = R_(); Maker.clip = JSON.stringify({ g: R.g, e: R.e, t: R.t, m: R.m, b: R.b, n: R.n }); toast('Room copied'); M74.renderRoomPane(); return; }
    if (mod && k === 'v') { e.preventDefault(); pasteRoom(R_()); return; }
    if (mod || e.altKey) return;
    const tools = { b: 'brush', e: 'erase', f: 'fill', r: 'box', i: 'pick', v: 'move' };
    if (tools[k]) { e.preventDefault(); M74.setTool(tools[k]); return; }
    if (k === 'x') { Maker.mirX = !Maker.mirX; M74.syncTools(); return; }
    if (k === 'y') { Maker.mirY = !Maker.mirY; M74.syncTools(); return; }
    if (k === 'g') { Maker.showGrid = !Maker.showGrid; M74.syncTools(); return; }
    if (k === 't') { play({ floor: 0 }); return; }
    if ((k === 'delete' || k === 'backspace') && Maker.sel) {
      e.preventDefault();
      const R = R_(), en = entAt(R, Maker.sel.c, Maker.sel.r);
      if (en) { pushUndo(); R.e.splice(R.e.indexOf(en), 1); Maker.sel = null; changed(); M74.renderInspector(); }
      return;
    }
    const arrows = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
    if (arrows[k]) {
      e.preventDefault();
      const [dx, dy] = arrows[k];
      if (roomAt(F_(), Maker.rx + dx, Maker.ry + dy)) M74.selectRoom(Maker.rx + dx, Maker.ry + dy);
      return;
    }
    if (k === 'pageup' || k === 'pagedown') { e.preventDefault(); goFloor(Maker.fi + (k === 'pageup' ? -1 : 1)); }
  }

  /* ---- dialogs */
  function closeDlg() { const d = $('mkDlg'); if (!d) return; d.hidden = true; $('mkDlgIn').textContent = ''; $('mkDlgIn').className = 'mk-dlg-in'; }
  function dlg(title, body, foot) {
    const d = $('mkDlg'), inn = $('mkDlgIn'); inn.textContent = ''; inn.className = 'mk-dlg-in';
    const hd = el('div', 'mk-dlg-hd'); hd.appendChild(el('b', null, esc(title)));
    hd.appendChild(btn('ic', SVG('<path d="M6 6l12 12M18 6L6 18"/>'), 'Close', closeDlg));
    inn.appendChild(hd);
    const bd = el('div', 'mk-dlg-bd'); bd.appendChild(body); inn.appendChild(bd);
    if (foot) { const ft = el('div', 'mk-dlg-ft'); for (const b of foot) ft.appendChild(b); inn.appendChild(ft); }
    d.hidden = false;
    return bd;
  }
  async function copyText(txt, ta) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) { /* fall back */ }
    try { if (ta) { ta.focus(); ta.select(); } return document.execCommand('copy'); } catch (e) { return false; }
  }
  async function openShare() {
    if (!Maker.M) return;
    const body = el('div');
    body.appendChild(el('p', 'mk-p', 'Copy the code and send it. Whoever pastes it into the Map Maker can play it right away or edit a copy. The code holds the whole map, every floor.'));
    const ta = el('textarea', 'mk-in mk-code'); ta.readOnly = true; ta.value = 'Packing...'; ta.setAttribute('aria-label', 'Map code');
    body.appendChild(ta);
    const info = el('p', 'mk-p'); info.style.marginTop = '6px'; body.appendChild(info);
    const probs = M74.validate(Maker.M).filter((p) => p.err);
    if (probs.length) body.appendChild(el('div', 'mk-note', esc('Heads up: ' + probs[0].msg + ' Others can not play it like this.')));
    const cp = btn('pri', IC.copy + 'Copy code', 'Copy code', async () => {
      const ok = await copyText(ta.value, ta);
      if (ok) { toast('Code copied'); Meta.add('mapShares'); cp.innerHTML = IC.check + 'Copied'; } else toast('Select the code and copy it by hand.');
    });
    cp.disabled = true;
    dlg('Share this map', body, [btn('', 'Close', 'Close', closeDlg), cp]);
    try {
      const code = await encodeMap(Maker.M);
      ta.value = code; cp.disabled = false;
      info.textContent = `${code.length} characters. ${code.startsWith('BITMAP1') ? 'Packed small.' : 'Unpacked: this browser can not compress.'}`;
      ta.addEventListener('focus', () => ta.select());
    } catch (e) { ta.value = ''; info.textContent = 'Could not make a code: ' + (e && e.message); }
  }
  function pickItem(cur, ped, done) {
    const body = el('div', 'mk-pk-body');
    const top = el('div', 'mk-pk-top');
    const q = el('input', 'mk-in'); q.type = 'search'; q.placeholder = 'Search powerups'; q.setAttribute('aria-label', 'Search powerups');
    top.appendChild(q);
    let only = '';
    const flt = seg([['', 'All'], ['rare', 'Legendary'], ['found', 'Found by you']], only, (v) => { only = v; fill(); flt.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', ['', 'rare', 'found'][i] === v)); });
    top.appendChild(flt);
    body.appendChild(top);
    const list = el('div', 'mk-plist pk'); body.appendChild(list);
    const ids = ITEM_IDS.filter((id) => ITEMS[id]).concat(ITEMS.golden ? ['golden'] : []);
    /* the short plain line of every powerup, whatever the Descriptions setting says */
    const shortOf = (id) => {
      const V = window.__bitten && window.__bitten.V12, m = V && V.CLEAR12 && V.CLEAR12.items;
      return (m && m[id]) || (ITEMS[id] && ITEMS[id].desc) || '';
    };
    const fill = () => {
      list.textContent = '';
      const qq = q.value.trim().toLowerCase();
      const opts = [];
      if (ped) opts.push(['rand', 'Random powerup', 'Random', 'Rolled from the pool when the map is played.'], ['rare', 'Random legendary', 'Random', 'A legendary, rolled when the map is played.']);
      for (const id of ids.slice().sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name))) {
        const it = ITEMS[id];
        if (only === 'rare' && !it.rare) continue;
        if (only === 'found' && !Save.data.found[id]) continue;
        opts.push([id, it.name, it.rare ? 'Legendary' : Save.data.found[id] ? 'Powerup' : 'Not found yet', shortOf(id)]);
      }
      for (const [id, name, sub, desc] of opts) {
        if (qq && !name.toLowerCase().includes(qq)) continue;
        const b = el('button', (id === cur ? 'on ' : '') + (ITEMS[id] && ITEMS[id].rare ? 'rare ' : '') + (ITEMS[id] && !Save.data.found[id] ? 'lk' : '')); b.type = 'button';
        b.title = ITEMS[id] ? ITEMS[id].descFull || ITEMS[id].desc : name;
        b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.translate(s / 2, s / 2); if (id === 'rand' || id === 'rare') { c.fillStyle = id === 'rare' ? '#ffb44a' : '#ece2d4'; c.font = `900 24px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 1); } else drawItemIcon(c, id, s * 0.78, 1); }));
        const sp = el('span', null, `${esc(name)}<small>${esc(sub)}</small><em class="d">${esc(desc)}</em>`); b.appendChild(sp);
        b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(id); });
        list.appendChild(b);
      }
      if (!list.children.length) list.appendChild(el('p', 'mk-p', 'Nothing by that name.'));
    };
    q.addEventListener('input', fill);
    fill();
    const bd = dlg(ped ? 'Pick a powerup' : 'Add a start powerup', body);
    bd.classList.add('pk'); bd.parentNode.classList.add('pk');
    /* on a touch screen the keyboard would cover the list and push the page around */
    if (!(typeof COARSE !== 'undefined' && COARSE)) setTimeout(() => q.focus(), 30);
  }
  function pickSnake(cur, done, pool) {
    const body = el('div'), list = el('div', 'mk-plist');
    for (const k of pool || SNAKES) {
      const b = el('button', k === cur ? 'on' : ''); b.type = 'button';
      b.appendChild(canvasIcon(38, (c, s) => { c.fillStyle = '#17110e'; c.fillRect(0, 0, s, s); c.drawImage(snakeSprite(k), 1, 1, s - 2, s - 2); }));
      b.appendChild(el('span', null, esc(snakeName(k))));
      b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(k); });
      list.appendChild(b);
    }
    body.appendChild(list);
    dlg('Pick a snake', body);
  }
  function pickBoss(cur, withAuto, done) {
    const body = el('div'), list = el('div', 'mk-plist bosses');
    const opts = (withAuto ? ['auto'] : []).concat(BOSSES);
    for (const k of opts) {
      const b = el('button', k === cur ? 'on' : ''); b.type = 'button';
      const kk = k === 'auto' ? setDef(F_().set).boss : k;
      b.appendChild(canvasIcon(64, (c, s) => { const sp = bossSprite(kk); c.drawImage(sp, 0, 0, sp.width, sp.height, 0, 0, s, s * 0.58); }));
      b.lastChild.style.height = '37px';
      b.appendChild(el('span', null, `${esc(k === 'auto' ? 'Floor default' : bossName(k))}${k === 'auto' ? `<small>${esc(bossName(kk))}</small>` : ''}`));
      b.addEventListener('click', (e) => { e.preventDefault(); closeDlg(); done(k); });
      list.appendChild(b);
    }
    body.appendChild(list);
    dlg('Pick a boss', body);
  }

  /* ---- playing */
  function play(opt) {
    if (!Maker.M) return;
    const errs = M74.validate(Maker.M).filter((p) => p.err && (!opt.floor || p.fi >= opt.floor));
    if (errs.length) { toast(errs[0].msg); setPane('map'); return; }
    saveNow();
    const M = cloneMap(Maker.M);
    if (opt.floor > 0) M.floors = M.floors.slice(opt.floor);
    RTM.startRoom = opt.room ? { x: Maker.rx, y: Maker.ry } : null;
    playMap(M, 'editor');
  }
  function playMap(M, back) {
    const errs = M74.validate(M).filter((p) => p.err);
    if (errs.length && back === 'hub') { toast('Not playable yet: ' + errs[0].msg); return; }
    if (back === 'hub') RTM.startRoom = null;
    RTM.cur = M74.cleanMap(cloneMap(M)); RTM.back = back; RTM.tpTo = null;
    stopLoop(); closeDlg();
    Maker.open = false;
    $('maker').hidden = true;
    safe(() => Sfx.init());
    Game.startRun(false, 'map');
  }
  Maker.play = playMap;

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
