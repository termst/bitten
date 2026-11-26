/* 74.js section 19: pro-generator. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, CH_NAMES, EMPTY, ENTS, FH, FIXED, FW, F_, GH, GW, IC, LIMITS, MOUTH, Maker, OPPS, PRO, RT, SIDES, SNAKES, SOLID_TILE, TSTORE, btn, changed, cleanEnt, cleanRoom, closeDlg, colName, dlg, doorsOf, el, entAt, esc, lsSet, neighbor, newRoom, paintFloorThumb, play, pushUndo, row, rowsOf, safe, seg, setName, setPane, syncEdges, toast, typeTemplate } = M74;
  M74.genFloor = genFloor; M74.openGenerator = openGenerator; M74.fillEmptyRooms = fillEmptyRooms; M74.openTestSettings = openTestSettings;
  /* ---- the floor generator */
  const GEN = { rooms: 9, shape: 'branch', snakes: 1, extras: { chest: 1, shop: 1, miniboss: 1, vault: 0, challenge: 0, spring: 0, secret: 1, pantry: 0 }, seed: 1 }; M74.GEN = GEN;
  const GEN_EX = [['chest', 'Treasure'], ['shop', 'Shop'], ['miniboss', 'Mini boss'], ['vault', 'Vault and key'], ['challenge', 'Challenge'], ['spring', 'Spring'], ['pantry', 'Pantry'], ['secret', 'Secret room']];
  function genPool(set) { const p = ((typeof WAVE_POOL !== 'undefined' && WAVE_POOL[set]) || ['grub', 'grub', 'hood', 'splitter']).filter((k) => SNAKES.includes(k)); return p.length ? p : ['grub']; }
  function genFloor(F, o) {
    const rng = mulberry32((o.seed >>> 0) || 1), ri = (n) => Math.floor(rng() * n), pk = (a) => a[ri(a.length)];
    const set = F.set, rooms = [], at = new Map(), key = (x, y) => x + ',' + y;
    const add = (x, y, t, parent) => { const R = newRoom(x, y, t); R.par = parent; rooms.push(R); at.set(key(x, y), R); return R; };
    const free = (x, y) => x >= 0 && y >= 0 && x < FW && y < FH && !at.has(key(x, y));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const start = add(4, 3, 'start', null);
    const want = clamp(o.rooms | 0, 4, 24);
    let guard = 0;
    while (rooms.length < want && guard++ < 4000) {
      const from = o.shape === 'line' ? rooms[rooms.length - 1] : o.shape === 'loop' ? pk(rooms) : (rng() < 0.6 ? rooms[Math.max(0, rooms.length - 1 - ri(3))] : pk(rooms));
      const d = pk(dirs), x = from.x + d[0], y = from.y + d[1];
      if (!free(x, y)) { if (o.shape === 'line' && guard % 40 === 39) { const r2 = pk(rooms); rooms.push(rooms.splice(rooms.indexOf(r2), 1)[0]); } continue; }
      // branches and lines stay thin: no room with three neighbors already in place, most of the time
      const nb = dirs.filter((v) => at.has(key(x + v[0], y + v[1]))).length;
      if (o.shape !== 'loop' && nb > 1 && rng() < 0.85) continue;
      add(x, y, 'fight', from);
    }
    const Fx = { rooms };
    // doors: parent links always; other neighbors are walls, except on loops
    for (const R of rooms) for (const s in SIDES) {
      const v = SIDES[s], n = at.get(key(R.x + v[0], R.y + v[1])); if (!n) continue;
      const linked = n.par === R || R.par === n;
      if (!linked && (o.shape !== 'loop' || rng() < 0.25)) { R.d[s] = 'w'; n.d[OPPS[s]] = 'w'; }
    }
    // distances from the start, through doors
    const dist = new Map([[start, 0]]), q = [start];
    while (q.length) { const R = q.shift(); for (const s of doorsOf(Fx, R)) { const n = neighbor(Fx, R, s); if (n && !dist.has(n)) { dist.set(n, dist.get(R) + 1); q.push(n); } } }
    const far = rooms.slice().sort((a, b) => (dist.get(b) || 0) - (dist.get(a) || 0));
    const lair = far[0] !== start ? far[0] : rooms[rooms.length - 1];
    lair.t = 'boss';
    const deg = (R) => doorsOf(Fx, R).length;
    const spare = rooms.filter((R) => R.t === 'fight' && R !== lair);
    const ends = spare.filter((R) => deg(R) === 1).sort(() => rng() - 0.5), mids = spare.filter((R) => deg(R) > 1).sort(() => rng() - 0.5);
    const takeRoom = () => ends.shift() || (mids.length > 2 ? mids.shift() : null);
    const special = [];
    for (const [k] of GEN_EX) if (o.extras[k] && k !== 'secret') { const R = takeRoom(); if (!R) break; R.t = k; special.push(R); }
    // a secret room: a new room behind a cracked wall
    if (o.extras.secret) {
      const cands = [];
      for (const R of rooms) for (const s in SIDES) { const v = SIDES[s]; if (free(R.x + v[0], R.y + v[1]) && R !== lair && R.t !== 'start') cands.push([R, s]); }
      if (cands.length && rooms.length < LIMITS.rooms) {
        const [R, s] = pk(cands), v = SIDES[s], S = add(R.x + v[0], R.y + v[1], 'chest', R);
        // walls to everything but its way in, and that way is a crack
        for (const s2 in SIDES) { const v2 = SIDES[s2], n = at.get(key(S.x + v2[0], S.y + v2[1])); if (!n) continue; S.d[s2] = n === R ? 'c' : 'w'; n.d[OPPS[s2]] = S.d[s2]; }
      }
    }
    // the rooms themselves
    const pool = genPool(set), fights = (FIGHT_SETS[set] || FIGHT_SETS.cellar).slice();
    for (const R of rooms) {
      let rows = null;
      if (R.t === 'start') rows = START_SETS[set] || START_SETS.cellar;
      else if (R.t === 'fight') rows = pk(fights);
      else if (R.t !== 'boss') { const tp = typeTemplate(R.t); rows = tp ? rowsOf(tp) : null; }
      if (rows) {
        const C = cleanRoom({ x: R.x, y: R.y, t: R.t, g: rows.map((r) => (r + '...........').slice(0, GW)).join('').replace(/[12]/g, '.') });
        R.g = C.g; R.e = C.e;
      }
      if (R.t === 'fight') {
        let sn = R.e.filter((e) => e.t === 'sn');
        for (const e of sn) e.k = pk(pool);
        const goal = Math.max(1, Math.round((sn.length || 3) * o.snakes));
        while (sn.length > goal) { const e = sn.pop(); R.e.splice(R.e.indexOf(e), 1); }
        let tries = 0;
        while (sn.length < goal && tries++ < 80) {
          const c = 1 + ri(GW - 2), r = 1 + ri(GH - 2);
          if (R.g[r * GW + c] !== '.' || entAt(R, c, r)) continue;
          const e = cleanEnt({ t: 'sn', c, r, k: pk(pool) }); if (e) { R.e.push(e); sn.push(e); }
        }
        // bigger floors get a few second waves
        if (o.snakes >= 1 && sn.length >= 4 && rng() < 0.35) for (const e of sn.slice(-2)) e.wv = 2;
      }
      if (R.t === 'miniboss') R.b = pk(MINI_POOL[set] || MINI_POOL.cellar);
      if (R.t === 'vault') R.lk = 0;
    }
    // a key for the vault, in a fight room on the way
    if (special.some((R) => R.t === 'vault')) {
      const fr = rooms.filter((R) => R.t === 'fight');
      const R = fr.length ? pk(fr) : start;
      for (let i = 0; i < 40; i++) { const c = 1 + ri(GW - 2), r = 1 + ri(GH - 2); if (R.g[r * GW + c] === '.' && !entAt(R, c, r)) { R.e.push(cleanEnt({ t: 'ky', c, r })); break; } }
    }
    // doorways stay clear
    for (const R of rooms) for (const s of doorsOf(Fx, R)) {
      const [mc, mr] = MOUTH[s], k = mr * GW + mc;
      if (SOLID_TILE(R.g[k])) R.g = R.g.slice(0, k) + '.' + R.g.slice(k + 1);
      const e = entAt(R, mc, mr); if (e && ENTS[e.t].solid && e.t !== 'gt') R.e.splice(R.e.indexOf(e), 1);
    }
    for (const R of rooms) delete R.par;
    return rooms;
  }
  function openGenerator() {
    const F = F_();
    const body = el('div', 'mk-gen');
    const pv = el('div', 'mk-gen-pv');
    const cv = document.createElement('canvas'); pv.appendChild(cv);
    const info = el('p', 'mk-p');
    let rooms = null;
    const redo = () => {
      rooms = genFloor(F, GEN);
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = 260, h = 170;
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintFloorThumb(c, w, h, { rooms, set: F.set });
      const sn = rooms.reduce((n, R) => n + R.e.filter((e) => e.t === 'sn').length, 0);
      info.textContent = `${rooms.length} rooms, ${sn} snakes. Seed ${GEN.seed}.`;
    };
    const opts = el('div');
    const paintOpts = () => {
      opts.textContent = '';
      opts.appendChild(row('Rooms', seg([[6, '6'], [9, '9'], [12, '12'], [16, '16'], [20, '20']], GEN.rooms, (v) => { GEN.rooms = v; paintOpts(); redo(); })));
      opts.appendChild(row('Shape', seg([['branch', 'Branches'], ['loop', 'Loops'], ['line', 'A long line']], GEN.shape, (v) => { GEN.shape = v; paintOpts(); redo(); })));
      opts.appendChild(row('Snakes', seg([[0.5, 'Few'], [1, 'Normal'], [1.6, 'Many']], GEN.snakes, (v) => { GEN.snakes = v; paintOpts(); redo(); })));
      const ex = el('div', 'mk-seg');
      for (const [k, nm] of GEN_EX) {
        const b = el('button', GEN.extras[k] ? 'on' : '', esc(nm)); b.type = 'button'; b.setAttribute('aria-pressed', GEN.extras[k] ? 'true' : 'false');
        b.addEventListener('click', (e) => { e.preventDefault(); GEN.extras[k] = GEN.extras[k] ? 0 : 1; paintOpts(); redo(); });
        ex.appendChild(b);
      }
      opts.appendChild(row('Extra rooms', ex));
    };
    paintOpts();
    body.append(pv, info, opts);
    body.appendChild(el('p', 'mk-p', `Uses the layouts and snakes of ${setName(F.set)}. Replaces every room on floor ${Maker.fi + 1}; Undo brings them back.`));
    GEN.seed = 1 + Math.floor(Math.random() * 99999);
    redo();
    dlg('Generate a floor', body, [
      btn('', IC.rot + 'Another one', 'Roll a new floor', () => { GEN.seed = 1 + Math.floor(Math.random() * 99999); redo(); }),
      btn('pri', IC.gen + 'Use this floor', 'Replace this floor with it', () => {
        if (!rooms) return;
        pushUndo();
        F.rooms = rooms; syncEdges(F);
        const st = F.rooms.find((R) => R.t === 'start') || F.rooms[0]; Maker.rx = st.x; Maker.ry = st.y; Maker.sel = null; PRO.area = null;
        closeDlg(); changed(true); toast(`Floor ${Maker.fi + 1}: ${rooms.length} new rooms`);
      }),
    ]);
  }
  function fillEmptyRooms() {
    const F = F_(), set = F.set, pool = genPool(set), fights = FIGHT_SETS[set] || FIGHT_SETS.cellar;
    let n = 0;
    const R0 = F.rooms.filter((R) => R.g === EMPTY && !R.e.length && !FIXED[R.t] && R.t !== 'boss');
    if (!R0.length) { toast('No empty rooms on this floor.'); return; }
    pushUndo();
    for (const R of R0) {
      let rows;
      if (R.t === 'start') rows = START_SETS[set] || START_SETS.cellar;
      else if (R.t === 'fight' || R.t === 'hall') rows = fights[Math.floor(Math.random() * fights.length)];
      else { const tp = typeTemplate(R.t); rows = tp ? rowsOf(tp) : fights[Math.floor(Math.random() * fights.length)]; }
      const C = cleanRoom({ x: R.x, y: R.y, t: R.t, g: rows.map((r) => (r + '...........').slice(0, GW)).join('').replace(/[12]/g, '.') });
      R.g = C.g; R.e = R.t === 'hall' ? C.e.filter((e) => e.t !== 'sn') : C.e;
      for (const e of R.e) if (e.t === 'sn') e.k = pool[Math.floor(Math.random() * pool.length)];
      for (const s of doorsOf(F, R)) { const [mc, mr] = MOUTH[s], k = mr * GW + mc; if (SOLID_TILE(R.g[k])) R.g = R.g.slice(0, k) + '.' + R.g.slice(k + 1); }
      n++;
    }
    changed(true); toast(`${n} room${n === 1 ? '' : 's'} filled`);
  }
  safe(() => {
    const rf = M74.renderFloor;
    M74.renderFloor = function () {
      const r = rf.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop;
        const sec = el('div', 'mk-sec');
        sec.appendChild(el('h4', 'mk-h', 'Quick build'));
        const acts = el('div', 'mk-acts');
        acts.append(btn('gold', IC.gen + 'Generate floor', 'Generate a whole floor', openGenerator), btn('', IC.layout + 'Fill empty rooms', 'Give every empty room a layout and snakes', fillEmptyRooms));
        sec.appendChild(acts);
        sec.appendChild(el('p', 'mk-p', 'Generate makes a full floor in this floor’s style: start, lair, fights and the extra rooms you pick. Fill empty rooms only touches rooms with nothing in them.'));
        const grid = pane.querySelector('.mk-fg'), after = grid && grid.nextElementSibling;
        if (after && after.nextSibling) pane.insertBefore(sec, after.nextSibling); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
  });

  /* ---- the map pane: an overview, and test settings */
  function threatOf(R) {
    let t = 0;
    for (const e of R.e) {
      if (e.t === 'sn') { const K = KINDS[e.k] || {}; t += Math.sqrt(K.hp || 6) * (e.g ? 2 : 1) * (e.hp || 1) * (R.sh || 1); }
      else if (e.t === 'ns') t += 6; else if (ENTS[e.t] && ENTS[e.t].cat === 'traps') t += 1.2;
    }
    for (const ev of R.ev || []) if (ev.d === 'snakes') t += Math.sqrt((KINDS[ev.k] || {}).hp || 6) * (ev.a || 1);
    if (R.t === 'boss' || R.t === 'arena') t += 30; else if (R.t === 'miniboss') t += 14;
    return t;
  }
  function overviewSection(M) {
    const sec = el('div', 'mk-sec');
    sec.appendChild(el('h4', 'mk-h', 'Overview'));
    const tb = el('table', 'mk-ov');
    let html = '<thead><tr><th>Floor</th><th>Rooms</th><th>Snakes</th><th>Traps</th><th>Loot</th><th>Events</th><th>Threat</th></tr></thead><tbody>';
    M.floors.forEach((F, i) => {
      let sn = 0, tr = 0, lt = 0, ev = 0, th = 0, top = null, topT = -1;
      for (const R of F.rooms) {
        for (const e of R.e) { const c = ENTS[e.t] && ENTS[e.t].cat; if (e.t === 'sn') sn++; else if (c === 'traps') tr++; else if (c === 'loot') lt++; }
        ev += (R.ev || []).length;
        const t = threatOf(R); th += t; if (t > topT) { topT = t; top = R; }
      }
      const lvl = th < 40 ? 'Mild' : th < 90 ? 'Fair' : th < 160 ? 'Tough' : 'Brutal';
      html += `<tr data-f="${i}" data-x="${top ? top.x : 0}" data-y="${top ? top.y : 0}"><td>${i + 1} <small>${esc(F.name || setName(F.set))}</small></td><td>${F.rooms.length}</td><td>${sn}</td><td>${tr}</td><td>${lt}</td><td>${ev}</td><td><i class="th ${lvl.toLowerCase()}">${lvl}</i></td></tr>`;
    });
    tb.innerHTML = html + '</tbody>';
    tb.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-f]'); if (!tr) return; Maker.fi = +tr.dataset.f; Maker.rx = +tr.dataset.x; Maker.ry = +tr.dataset.y; Maker.sel = null; changed(true); setPane('room'); });
    sec.appendChild(tb);
    sec.appendChild(el('p', 'mk-p mk-small', 'Threat counts snakes by their health, traps, nests, events and bosses. Tap a floor to jump to its heaviest room.'));
    return sec;
  }
  function openTestSettings() {
    const T0 = PRO.test, body = el('div');
    const paint = () => {
      body.textContent = '';
      body.appendChild(el('p', 'mk-p', 'Only for testing from the editor. Players of your map never get these.'));
      const set = (k, v) => { T0[k] = v; lsSet(TSTORE, T0); paint(); };
      body.appendChild(row('Can not die', seg([[0, 'Off'], [1, 'On']], T0.god | 0, (v) => set('god', v))));
      body.appendChild(row('Extra coins', seg([[0, '0'], [50, '50'], [200, '200']], T0.coins | 0, (v) => set('coins', v))));
      body.appendChild(row('Keys', seg([[0, '0'], [3, '3'], [9, '9']], T0.keys | 0, (v) => set('keys', v))));
    };
    paint();
    dlg('Test settings', body, [btn('', 'Close', 'Close', closeDlg), btn('pri', IC.play + 'Test map', 'Test the whole map', () => { closeDlg(); play({ floor: 0 }); })]);
  }
  safe(() => {
    const rm = M74.renderMapPane;
    M74.renderMapPane = function () {
      const r = rm.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneMap'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop, about = [...pane.querySelectorAll('.mk-h')].find((h) => h.textContent === 'About');
        const sec = overviewSection(Maker.M);
        if (about) pane.insertBefore(sec, about); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const vd = M74.validate;
    M74.validate = function (M) {
      const out = vd.apply(this, arguments);
      M.floors.forEach((F, fi) => {
        const fl = M.floors.length > 1 ? `Floor ${fi + 1}: ` : '';
        const gates = [0, 0, 0, 0];
        for (const R of F.rooms) for (const e of R.e) if (e.t === 'gt') gates[e.ch || 0]++;
        for (const R of F.rooms) {
          const sn = R.e.filter((e) => e.t === 'sn'), nm = `${RT[R.t] ? RT[R.t].name : R.t} ${colName(R.x)}${R.y + 1}`;
          if (R.tb && !sn.length && !R.e.some((e) => e.t === 'ns') && !['challenge', 'survival', 'boss', 'arena', 'miniboss'].includes(R.t)) out.push({ msg: `${fl}${nm} has a clock but nothing to fight.`, fi, x: R.x, y: R.y, soft: 1 });
          if (sn.length && sn.every((e) => (e.wv || 1) > 1)) out.push({ msg: `${fl}${nm}: no snake in the first wave. The second comes right away.`, fi, x: R.x, y: R.y, soft: 1 });
          for (const ev of R.ev || []) {
            if (ev.d === 'gates' && !gates[ev.a | 0]) out.push({ msg: `${fl}${nm}: an event flips ${CH_NAMES[ev.a | 0].toLowerCase()} gates, there are none.`, fi, x: R.x, y: R.y, soft: 1 });
            if (ev.w === 'wave' && !sn.some((e) => (e.wv || 1) >= ev.n)) out.push({ msg: `${fl}${nm}: an event waits for wave ${ev.n}, it never comes.`, fi, x: R.x, y: R.y, soft: 1 });
          }
        }
      });
      return out;
    };
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
