/* src/67-v119-admin-rooms.js: v11.9: admin room tools. From v11.9. Lines 32408 to 32639 of the v13.7 script. */
/* =====================================================================
   Bitten v11.9: Admin room tools. A Rooms section in the Admin panel:
   pick a room type, then click the floor map. A free spot next to the map
   gets a new room with doors to its neighbours, an existing room is rebuilt
   as the new type, and "Go to room" teleports. Start and boss rooms stay
   locked so a floor can always be finished.
   ===================================================================== */
(() => {
  const safe = (fn, fb) => { try { return fn(); } catch (e) { if (window.console) console.warn('v11.9', e); return fb; } };
  // id, label, three letter code for the map cell
  const TYPES = [
    ['fight', 'Fight room', 'FGT'], ['chest', 'Chest room', 'CHS'], ['shop', 'Shop', 'SHP'], ['challenge', 'Challenge altar', 'CHL'],
    ['survival', 'Survival altar', 'SUR'], ['miniboss', 'Mini boss', 'MIN'], ['chaosboss', 'Boss fight', 'BSS'], ['vote', 'Vote', 'VOT'],
    ['library', 'Cursed library', 'LIB'], ['gamble', 'Slot machine', 'SLT'], ['spring', 'Spring', 'SPR'], ['offering', 'Offering altar', 'OFR'],
    ['pantry', 'Pantry', 'PAN'], ['vault', 'Vault', 'VLT'], ['secret', 'Secret room', 'SEC'], ['portal', 'Portal (Ender Wyrm)', 'PRT'],
    ['tank', 'BP Tankstation', 'TNK'], ['kapper', 'Kapsalon', 'KAP'], ['courtroom', 'Rechtbank', 'CRT'], ['gym', 'Klokhuis Gym', 'GYM'],
    ['club', 'Club (DJ Manu-Beau)', 'CLB'], ['hellclub', 'Hellclub', 'HEL'], ['clownhq', 'Clini-Clown HQ', 'CLN'], ['quiet', 'Prikkelarme Kamer', 'QUI'],
  ];
  const CODE = { start: 'STA', boss: 'BOS' };
  for (const t of TYPES) CODE[t[0]] = t[2];
  const MODS = [['', 'No modifier'], ['dark', 'Dark'], ['swarm', 'Swarm'], ['elite', 'Elite'], ['spikes', 'Spikes'], ['collapse', 'Collapse'],
    ['freezer', 'Freezer aisle'], ['skins', 'Shed skins'], ['roots', 'Roots'], ['lasers', 'Lasers'], ['blackice', 'Black ice']];
  // rooms that hang off one door in the normal game, and rooms nobody else may open into
  const HUNG = new Set(['club', 'hellclub', 'portal', 'secret', 'vault', 'clownhq', 'quiet']);
  const NOLINK = new Set(['club', 'hellclub', 'portal', 'secret', 'vault']);
  const LOCKED = new Set(['start', 'boss']);
  const sel = { type: 'gym', mod: '', boss: '', mode: 'place', go: true };

  const inRun = () => !!(G.run && G.player && G.room && G.map && (G.state === 'play' || G.state === 'pause'));
  const roomAt = (x, y) => G.map.rooms.find((r) => r.gx === x && r.gy === y) || null;

  /* ------------------------------------------------------------------ building */
  // clear everything the old type left behind
  function wipe(r) {
    resetRoom9(r);
    r.pickups = []; r.decals = []; r.snakes = []; r.balls = []; r.fires = []; r.carts = []; r.spikes = []; r.cracks = []; r.skins = []; r.roots = [];
    r.turrets = []; r.sap = []; r.clouds = []; r.spores = [];
    r.locked = false; r.doorCl = 0; r.cleared = false; r.seen = false; r.fought = false; r.offered = false; r.sealed = false;
    r.store = null; r.ice = false; r.chaos = false; r.exit = null; r.spook10 = false; r.mandje9 = false; r.taak = false; r.chaosBoss = null;
    delete r.theme; delete r.clubDoor;
  }
  function make(room, type) {
    const def = G.levelDef, rng = Math.random;
    const flip = { rng, fx: rng() < 0.5, fy: rng() < 0.5 };
    wipe(room);
    room.type = type;
    if (type === 'fight') {
      const tpls = FIGHT_SETS[def.set] || FIGHT_SETS.cellar;
      room.mod = sel.mod || null;
      room.build(pick(tpls), def, Object.assign(flip, { shuffle: true, mod: room.mod }));
      if (room.mod === 'freezer' || room.mod === 'blackice') room.ice = true;
      if (room.mod === 'spikes') placeSpikes(room, rng);
      if (room.mod === 'collapse') placeCracks(room, rng);
      room.cleared = false;
    } else if (type === 'secret') { room.build(TPL.secret, def); room.cleared = false; }
    else if (type === 'portal') { room.theme = 'craft'; room.build(TPL.portal, def); room.cleared = false; }
    else if (type === 'vault') { room.build(TPL.vault, def); room.cleared = true; }
    else if (type === 'club' || type === 'hellclub') {
      const door = Object.keys(room.doors)[0] || 's';
      room.theme = type === 'club' ? 'club' : 'hell'; room.clubDoor = door;
      room.build(clubTemplate(door), def); room.sconces = []; room.tubes = null; room.cleared = false;
    } else {
      chaosRoom9(room, type, def, rng);
      if (type === 'chaosboss' && sel.boss) room.chaosBoss = sel.boss;
    }
    room.visited = false; room.dirty = true; room.ver++;
  }
  function stockOne(room) {
    const one = { rooms: [room] };
    safe(() => Game.stockRooms(one));
    safe(() => stock9(one));
    if (room.type === 'club' || room.type === 'hellclub' || (room.type === 'chaosboss' && (room.chaosBoss === 'manu' || room.chaosBoss === 'manudevil'))) safe(() => DJ.prepare());
  }
  function fitBounds() {
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const r of G.map.rooms) { minX = Math.min(minX, r.gx); maxX = Math.max(maxX, r.gx); minY = Math.min(minY, r.gy); maxY = Math.max(maxY, r.gy); }
    G.map.bounds = { minX, maxX, minY, maxY };
  }

  // a new room at a free spot, or a rebuild of an existing one; returns a message
  function place(room, gx, gy) {
    const map = G.map, type = sel.type;
    const isNew = !room;
    let links = [];
    if (isNew) {
      room = new Room(gx, gy, map.rooms.length);
      for (const k in DOORV) {
        const o = roomAt(gx + DOORV[k][0], gy + DOORV[k][1]);
        if (o && !NOLINK.has(o.type) && !o.sealed) links.push([k, o]);
      }
      if (!links.length) return 'No room next to this spot can open a door here.';
      if (HUNG.has(type)) links = [links[0]];
      for (const [k, o] of links) room.doors[k] = o;
      room.dist = Math.min(...links.map(([k, o]) => o.dist || 0)) + 1;
    }
    make(room, type);
    stockOne(room);
    if (isNew) {
      for (const [k, o] of links) { o.doors[OPP[k]] = room; o.dirty = true; o.ver++; }
      map.rooms.push(room);
      fitBounds();
    }
    const name = (TYPES.find((t) => t[0] === type) || [0, type])[1];
    const here = room === G.room;
    if (sel.go || here) goTo(room, Object.keys(room.doors)[0] || null);
    return `${isNew ? 'Added' : 'Rebuilt as'} ${name} at ${room.gx},${room.gy}.`;
  }

  function goTo(room, entry) {
    const prev = G.room;
    const ov = document.getElementById('admin23'); if (ov) ov.hidden = true;
    safe(() => { if (G.state === 'pause') Game.resume(); });
    if (G.state !== 'play') return;
    G.trans = null; G.fade = 0; G.boss = null; G.bossGroup = null;
    if (prev && prev !== room) { prev.locked = false; prev.doorCl = 0; }
    safe(() => { if (DJ.on) DJ.stop(0.3, true); });
    Game.enterRoom(room, entry || null);
    safe(() => UI.refresh());
  }

  /* ------------------------------------------------------------------ the panel */
  const css = document.createElement('style');
  css.textContent = `
.rm11 .mp11{display:grid;gap:3px;margin-top:8px}
.cell11{min-width:0;min-height:30px;padding:0;font:700 9px/1 inherit;letter-spacing:.04em;color:#ece2d4;background:#241a18;border:1px solid rgba(236,226,212,.25);border-radius:0;cursor:pointer}
.cell11:hover{border-color:rgba(236,226,212,.7)}
.cell11.unv{color:rgba(236,226,212,.55)}
.cell11.lk{opacity:.6}
.cell11.cur{border-color:#ece2d4;box-shadow:inset 0 0 0 1px #ece2d4;background:#3a2a24}
.cell11.free{background:transparent;border-style:dashed;color:rgba(236,226,212,.55);font-size:15px;font-weight:500}
.cell11.void{visibility:hidden;pointer-events:none}
.rm11 .sub11{margin-top:6px}
`;
  document.head.appendChild(css);

  function mk(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function select(label, opts, val, onChange, q) {
    const box = mk('div', 'sub11');
    const s = document.createElement('select'); s.className = 'pl'; s.setAttribute('aria-label', label);
    if (q) s.dataset.q = q;
    for (const [v, t] of opts) { const o = document.createElement('option'); o.value = v; o.textContent = t; if (v === val) o.selected = true; s.appendChild(o); }
    s.addEventListener('change', () => onChange(s.value));
    box.appendChild(s);
    return box;
  }

  function section(body) {
    const wrap = mk('div', 'rm11');
    wrap.appendChild(mk('h3', '', 'Rooms'));
    const anchor = [...body.querySelectorAll('h3')].find((h) => h.textContent === 'Powerups') || body.querySelector('p.m23');
    if (anchor) body.insertBefore(wrap, anchor); else body.appendChild(wrap);
    if (!inRun()) { wrap.appendChild(mk('p', 'i23', 'Start a run to place or visit rooms.')); return; }
    const msg = mk('p', 'm23', '');
    const say = (s) => { msg.textContent = s || ''; };

    const types = select('Room type', TYPES.map((t) => [t[0], t[1]]), sel.type, (v) => { sel.type = v; sync(); }, 'Search rooms');
    const modBox = select('Fight modifier', MODS, sel.mod, (v) => { sel.mod = v; }, '');
    const bossBox = select('Boss', [['', 'Random boss']].concat(CHAOS_BOSSES9.map((k) => [k, (BOSS_INFO[k] && BOSS_INFO[k].title) || k])), sel.boss, (v) => { sel.boss = v; }, 'Search bosses');
    wrap.appendChild(types); wrap.appendChild(modBox); wrap.appendChild(bossBox);
    const sync = () => { modBox.hidden = sel.type !== 'fight'; bossBox.hidden = sel.type !== 'chaosboss'; };
    sync();

    const row = mk('div', 'g23 sub11');
    const bPlace = mk('button', 'b23', 'Place or replace'), bGo = mk('button', 'b23', 'Go to room'), bTp = mk('button', 'b23', '');
    for (const b of [bPlace, bGo, bTp]) b.type = 'button';
    bTp.style.gridColumn = '1 / -1';
    const paint = () => {
      bPlace.classList.toggle('on', sel.mode === 'place'); bGo.classList.toggle('on', sel.mode === 'go');
      bTp.textContent = sel.go ? 'Teleport after placing: on' : 'Teleport after placing: off'; bTp.classList.toggle('on', sel.go);
      bTp.hidden = sel.mode !== 'place';
    };
    bPlace.addEventListener('click', () => { sel.mode = 'place'; paint(); say(''); });
    bGo.addEventListener('click', () => { sel.mode = 'go'; paint(); say(''); });
    bTp.addEventListener('click', () => { sel.go = !sel.go; paint(); });
    row.appendChild(bPlace); row.appendChild(bGo); row.appendChild(bTp);
    wrap.appendChild(row);
    paint();

    const grid = mk('div', 'mp11');
    wrap.appendChild(grid);
    wrap.appendChild(msg);
    wrap.appendChild(mk('p', 'i23', 'Click + to add the chosen room next to the map. Click a room to rebuild it as that type. Start and boss rooms are locked. Doors open to every neighbouring room, except hidden ones.'));

    const draw = () => {
      grid.textContent = '';
      if (!inRun()) return;
      const rooms = G.map.rooms;
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const r of rooms) { x0 = Math.min(x0, r.gx); x1 = Math.max(x1, r.gx); y0 = Math.min(y0, r.gy); y1 = Math.max(y1, r.gy); }
      x0--; x1++; y0--; y1++;
      grid.style.gridTemplateColumns = `repeat(${x1 - x0 + 1}, minmax(0, 1fr))`;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const r = roomAt(x, y), b = mk('button', 'cell11'); b.type = 'button';
          if (r) {
            b.textContent = CODE[r.type] || String(r.type).slice(0, 3).toUpperCase();
            b.title = `${r.type}  ${x},${y}${r.visited ? '' : '  (not visited)'}`;
            if (!r.visited) b.classList.add('unv');
            if (LOCKED.has(r.type)) b.classList.add('lk');
            if (r === G.room) b.classList.add('cur');
          } else {
            const near = Object.values(DOORV).some((v) => { const o = roomAt(x + v[0], y + v[1]); return o && !NOLINK.has(o.type) && !o.sealed; });
            if (near) { b.textContent = '+'; b.classList.add('free'); b.title = `New room at ${x},${y}`; }
            else { b.classList.add('void'); b.disabled = true; b.tabIndex = -1; }
          }
          b.addEventListener('click', () => {
            let out = '';
            try {
              if (sel.mode === 'go') {
                if (!r) out = 'Pick an existing room to go to.';
                else if (r === G.room) out = 'You are already here.';
                else { goTo(r, r.type === 'start' ? null : (Object.keys(r.doors)[0] || null)); return; }
              } else if (r && LOCKED.has(r.type)) out = 'Start and boss rooms are locked.';
              else { out = place(r, x, y); if (!inRun() || G.state !== 'pause') return; }
            } catch (e) { out = 'Failed: ' + (e && e.message); if (window.console) console.warn('v11.9', e); }
            say(out); draw();
          });
          grid.appendChild(b);
        }
      }
    };
    draw();
  }

  const a0 = window.__bitten && window.__bitten.adm113;
  window.__bitten.adm113 = function (body) {
    safe(() => section(body));
    return a0 ? a0.apply(this, arguments) : undefined;
  };
  Object.assign(window.__bitten, { V119: { TYPES, sel, place, make, goTo, roomAt, section } });
})();

