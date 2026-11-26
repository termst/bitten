/* ===== v14.6: one catalog of everything the game has, read from the registries the content files fill in.
   Custom Run and the Map Maker used lists written by hand in v10.7 and v12.3, so every floor, snake, boss, room
   type, modifier and powerup that came later (the dragon sky, space, the Knokpit, the planets and dragons) was
   missing there. This file loads after all content, so the registries are complete when it runs:
   * B.CAT14 lists floors, bosses, snakes, room types, modifiers and powerups straight from FLOOR10,
     RARE_STORY10, LEVELS, BOSS_INFO, KINDS, CHAOS_ROOMS9, MOD_NAMES and ITEM_IDS.
   * The Map Maker's catalog arrays are filled from it (MK123.refresh14), Custom Run reads the floor registries
     itself (src/51 rareSets).
   * Custom Run: a powerup for beating a stage's boss, a Knokpit per stage, the Knokpit rule.
   * Map Maker: powerup lists per room (they also allow dragon and space powerups off their floor), boss rewards
     per floor.
   No Math.random draws outside the rooms and drops these settings ask for, so runs without them stay identical. ===== */
(function () {
  'use strict';
  const B = window.__bitten || (window.__bitten = {});
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'cat14'); return fb; } };
  const MK = () => B.MK123;

  /* ---------------------------------------------------------------- the catalog */
  const uniq = (a) => a.filter((k, i) => a.indexOf(k) === i);
  /* v14.8: room info for every feature. Content files register their own room (B.ROOMINFO14[type]) and hidden
     rooms (B.HIDDEN14); the rooms below came before that. hung: one door only, nolink: no other room opens into it. */
  const RI = B.ROOMINFO14 || (B.ROOMINFO14 = {});
  const HID = B.HIDDEN14 || (B.HIDDEN14 = []);
  const RI0 = {
    secret: { name: 'Secret room', code: 'SEC', col: '#7a6a5a', hung: 1, nolink: 1, desc: 'Behind a cracked wall in the game: a Rot Eater and its loot. Fixed layout.' },
    spook: { name: 'Het Kelderspook', code: 'SPK', col: '#a8c8ff', hung: 1, nolink: 1, desc: 'A secret room with the ghost boss inside. Fixed layout.' },
    portal: { name: 'Portal (Rift Wyrm)', code: 'PRT', col: '#9a5ad8', hung: 1, nolink: 1, desc: 'The block world behind the portal, with the Rift Wyrm. Fixed layout.' },
    club: { name: 'Club (DJ Manu-Beau)', code: 'CLB', col: '#3ad8ff', hung: 1, nolink: 1, desc: 'The club behind a door: DJ Manu-Beau and his beat. Fixed layout.' },
    hellclub: { name: 'Hellclub', code: 'HEL', col: '#ff3a2a', hung: 1, nolink: 1, desc: 'The club gone to hell: Manu-Beau as a devil. Fixed layout.' },
    clownhq: { name: 'Clini-Clown HQ', code: 'CLN', col: '#ff5ab4', hung: 1, desc: 'The clowns’ hideout: a fight with a prize. Fixed layout.' },
    quiet: { name: 'Prikkelarme Kamer', code: 'QUI', col: '#9a8acf', hung: 1, desc: 'A beanbag that heals and washes off one downgrade. Fixed layout.' },
    vault: { name: 'Vault', code: 'VLT', col: '#c9a000', hung: 1, nolink: 1, desc: 'Barred shut, a key opens it. Two powerups and gold.' },
  };
  for (const k in RI0) if (!RI[k]) RI[k] = RI0[k];
  /* build a room of any type the way the game builds it (Admin and the Map Maker use this) */
  function buildRoom(room, type, def, rng) {
    rng = rng || Math.random;
    if (type === 'secret' || type === 'spook') { resetRoom9(room); room.type = 'secret'; room.spook10 = type === 'spook'; room.build(type === 'spook' ? TPL10.spook : TPL.secret, def); room.cleared = false; }
    else if (type === 'portal') { resetRoom9(room); room.type = 'portal'; room.theme = 'craft'; room.build(TPL.portal, def); room.cleared = false; }
    else if (type === 'vault') { resetRoom9(room); room.type = 'vault'; room.build(TPL.vault, def); room.cleared = true; }
    else if (type === 'club' || type === 'hellclub') {
      resetRoom9(room); room.type = type;
      const door = Object.keys(room.doors)[0] || 's';
      room.theme = type === 'club' ? 'club' : 'hell'; room.clubDoor = door;
      room.build(clubTemplate(door), def); room.sconces = []; room.tubes = null; room.cleared = false;
    } else chaosRoom9(room, type, def, rng);
    return room;
  }
  const CAT14 = {
    floors: () => uniq(LEVELS.map((L) => L.set).concat(typeof RARE_STORY10 !== 'undefined' ? Object.keys(RARE_STORY10) : [], Object.keys(FLOOR10)))
      .filter((k) => SET_LEVEL[k] != null || safe(() => !!floorDef10(k), false)),
    bosses: () => uniq(BOSS_ORDER10.concat(Object.keys(BOSS_INFO))).filter((k) => BOSS_INFO[k]),
    snakes: () => Object.keys(KINDS).filter((k) => KINDS[k] && !KINDS[k].boss && KINDS[k].name),
    rooms: () => uniq(Object.keys(TPL).concat(typeof TPL10 !== 'undefined' ? Object.keys(TPL10) : [], CHAOS_ROOMS9, Object.keys(RI))).filter((t) => t !== 'chaosboss'),
    info: (t) => RI[t] || null,
    hidden: () => HID.slice(),
    build: buildRoom,
    mods: () => Object.keys(MOD_NAMES),
    items: () => ITEM_IDS.filter((id) => ITEMS[id]),
  };
  CAT14.count = () => { const o = {}; for (const k of ['floors', 'bosses', 'snakes', 'rooms', 'mods', 'items']) o[k] = CAT14[k]().length; return o; };
  B.CAT14 = CAT14;
  safe(() => MK() && MK().refresh14());

  /* ---------------------------------------------------------------- shared: drop a powerup in a room */
  function rollId(id) {
    const P = G.player;
    if (id === 'rare') return nextItemId(1);
    if (id === 'rand' || !ITEMS[id] || (P && P.items.includes(id)) || G.run.pending.has(id)) return nextItemId(0.12);
    return id;
  }
  function drop(room, id, x, y) {
    if (id !== 'golden') G.run.pending.add(id);
    room.pickups.push({ kind: 'item', id, x, y, t: 0 });
    safe(() => flashLight(x, y, 100, 0.8, 0.9));
    safe(() => burst(x, y, 12, '#ffd27a', { min: 30, max: 110, lmin: 0.4, lmax: 0.9, glow: true }));
  }
  function dropRow(room, ids) {
    const n = ids.length;
    ids.forEach((id, i) => {
      const f = safe(() => nearestFreeCell(room, RW / 2 + (i - (n - 1) / 2) * 52, RH / 2 + 56), null) || { x: RW / 2 + (i - (n - 1) / 2) * 52, y: RH / 2 + 56 };
      drop(room, rollId(id), f.x, f.y);
    });
  }

  /* ---------------------------------------------------------------- boss rewards: Custom Run stages and map floors */
  const custStage = () => { const c = G.mode === 'custom' && G.run && G.run.cust; return c && c.stages && c.n ? c.stages[(G.levelIdx || 0) % c.n] : null; };
  Hooks.layer('Game.clearRoom', 'v14.6 boss rewards', function (next, room) {
    const was = room && room.cleared, r = next.apply(this, [].slice.call(arguments, 1));
    if (was || !room || room.type !== 'boss' || !G.run || room.rw14) return r;
    safe(() => {
      let ids = null;
      const st = custStage();
      if (st && st.rw) ids = [st.rw];
      const M = MK() && MK().inMap() && MK().RTM.cur;
      if (M && G.levelDef && G.levelDef.mapF != null) { const F = M.floors[G.levelDef.mapF]; if (F && F.brw && F.brw.length) ids = F.brw.slice(); }
      if (!ids) return;
      room.rw14 = true;
      dropRow(room, ids);
      safe(() => UI.banner('Boss reward', ids.length > 1 ? `${ids.length} powerups` : 'A powerup'));
    });
    return r;
  });

  /* ---------------------------------------------------------------- Custom Run and Game Maker: every hidden room (B.HIDDEN14:
     the Knokpit, SIX SEVEN, whatever comes later) per stage and as a rule. Each entry: id (room type), sk (stage flag),
     rk (rule key), label, cfg (its flags: force and *Odds) */
  safe(() => {
    const pe1 = placeExtras9;
    placeExtras9 = function () {
      const c = G.mode === 'custom' && G.run && G.run.cust;
      const gm = !c && G.run && G.mode !== 'story' && G.mode !== 'map' && typeof MP14 !== 'undefined' && MP14.on && Save.data.gm14 && Save.data.gm14.p;
      const p = c ? c.p : gm;
      if (!p) return pe1.apply(this, arguments);
      const st = c ? custStage() : null, keep = [];
      for (const h of HID) {
        const K = h.cfg; if (!K) continue;
        const rule = p[h.rk], was = {};
        for (const k in K) if (k === 'force' || /Odds$|^odds$/.test(k)) was[k] = K[k];
        keep.push([K, was]);
        if ((st && st[h.sk]) || rule === 1) K.force = true;
        else if (rule === -1) for (const k in was) K[k] = k === 'force' ? false : 0;
      }
      try { return pe1.apply(this, arguments); } finally { for (const [K, was] of keep) Object.assign(K, was); }
    };
  });

  /* ---------------------------------------------------------------- Map Maker: powerup lists per room, and "only" lists that
     let dragon and space powerups roll off their own floor (the floor rules in 82 and 90 hide them elsewhere) */
  safe(() => {
    const nx1 = nextItemId;
    nextItemId = function (legend = 0.05) {
      const mk = MK();
      if (!mk || !mk.inMap() || !G.player || !G.run) return nx1.apply(this, arguments);
      const R = G.room && G.room.mkR, rp = R && R.pl && R.pl.m && R.pl.ids.length ? R.pl : null;
      const mp = mk.RTM.cur.pool && mk.RTM.cur.pool.m && mk.RTM.cur.pool.ids.length ? mk.RTM.cur.pool : null;
      const pool = rp || mp;
      if (!pool || (pool === mp && pool.m === 'ban')) return nx1.apply(this, arguments);
      const P = G.player;
      if (P.flags && P.flags.blight) legend = Math.min(1, legend * 2);
      const own = (id) => ITEMS[id] && !P.items.includes(id) && !G.run.pending.has(id);
      const clash = (id) => typeof clashOf10 === 'function' && !!safe(() => clashOf10(id, P), null);
      let free;
      if (pool.m === 'only') free = pool.ids.filter((id) => own(id) && !clash(id));
      else {
        const ban = new Set(pool.ids.concat(mp && mp.m === 'ban' ? mp.ids : []));
        const only = mp && mp.m === 'only' ? new Set(mp.ids) : null;
        free = (only ? [...only] : ITEM_IDS).filter((id) => !ban.has(id) && own(id) && (only ? !clash(id) : itemOk9(id, P)));
      }
      const rare = free.filter((id) => ITEMS[id].rare), norm = free.filter((id) => !ITEMS[id].rare);
      if (rare.length && (Math.random() < legend || !norm.length)) return weightedPick(rare);
      return norm.length ? weightedPick(norm) : 'golden';
    };
  });

  /* ---------------------------------------------------------------- the Play menu is solo: Map is a coop mode (Game Maker) */
  safe(() => {
    const pp1 = UI.paintPlay;
    UI.paintPlay = function () { if (Save.data.mode === 'map') Save.data.mode = 'arcade'; return pp1.apply(this, arguments); };
  });
})();
