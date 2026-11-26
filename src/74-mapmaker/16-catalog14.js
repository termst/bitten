/* 74.js section 16: catalog14. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, BOSSES, FIXED, F_, HELP, IC, MINIS, MK, MODS, Maker, Pop, ROOM_FIELDS, RT, RTM, RTYPES, R_, S9, SETS, SNAKES, SPAWN_CH, addRoom, btn, canvasIcon, changed, drawEditor, el, esc, field, goFloor, itemBtn, layoutCanvas, paintBrushIcon, pickMany, playMap, popSkip, previewRoom, pushUndo, safe, seg, setType, showHub, tileAtlas, toast } = M74;
  /* ================================================================== 13. v14.6: every piece of the game, powerups per room and per floor, maps in coop
     The catalog lists (SETS, SNAKES, MINIS, BOSSES, MODS, RTYPES) were written by hand and missed every floor, snake,
     boss and room added after v12.6. refresh14() fills them from the game's own registries (FLOOR10, RARE_STORY10,
     KINDS, BOSS_INFO, MOD_NAMES, CHAOS_ROOMS9) in place, so code that holds the arrays sees the new entries.
     It runs once all files are loaded (src/91) and again when the Map Maker opens: a later file that registers
     a floor, a snake or a room type shows up here without an edit. */
  const EXTRA14 = {};
  const XROOM = {
    clownhq: ['Clini-Clown HQ', 'CLN', '#ff5ab4', 'The clowns’ hideout: a fight with a prize. Fixed layout.'],
    brawl: ['De Knokpit', 'KNK', '#6a5ae8', 'Three brawler snakes, loot boxes and power pads. Fixed layout.'],
    hype67: ['SIX SEVEN', '67', '#ff8a1a', 'The hidden 67 stage: a rhythm boss on a neon dance floor. Fixed layout.'],
  };
  const NOT_PIECE = { noodle: 1 };
  const NOT_MINI = { splitling: 1, rotling: 1, jong14: 1 };
  const NO_MOD = { swarm: 1 };
  function refresh14() {
    const fl = [];
    if (typeof RARE_STORY10 !== 'undefined') fl.push(...Object.keys(RARE_STORY10));
    if (typeof FLOOR10 !== 'undefined') fl.push(...Object.keys(FLOOR10));
    for (const k of fl) if (!SETS.includes(k) && safe(() => !!floorDef10(k), false)) SETS.push(k);
    for (const k in KINDS) {
      const K = KINDS[k];
      if (!K || K.boss || NOT_PIECE[k] || SNAKES.includes(k) || !K.name) continue;
      SNAKES.push(k); if (!NOT_MINI[k]) MINIS.push(k);
    }
    if (typeof V9_SPAWN === 'object') for (const ch in V9_SPAWN) if (!SPAWN_CH[ch]) SPAWN_CH[ch] = V9_SPAWN[ch];
    for (const k of (typeof BOSS_ORDER10 !== 'undefined' ? BOSS_ORDER10 : []).concat(Object.keys(BOSS_INFO))) if (BOSS_INFO[k] && k !== 'jaude' && !BOSSES.includes(k)) BOSSES.push(k);
    if (typeof MOD_NAMES === 'object') for (const k in MOD_NAMES) if (!NO_MOD[k] && !MODS.some((m) => m[0] === k)) MODS.push([k, String(MOD_NAMES[k])]);
    const C14 = window.__bitten && window.__bitten.CAT14;
    for (const t of new Set(C14 ? C14.rooms() : typeof CHAOS_ROOMS9 !== 'undefined' ? CHAOS_ROOMS9 : [])) {
      if (RT[t] || t === 'chaosboss') continue;
      const ri = C14 && C14.info(t);
      const x = XROOM[t] || (ri && [ri.name, ri.code, ri.col, ri.desc]) || [t[0].toUpperCase() + t.slice(1), t.slice(0, 3).toUpperCase(), '#a08aff', 'A room from the game, built like the game builds it. Fixed layout.'];
      RTYPES.push([t, x[0], x[1], x[2], x[3]]);
      RT[t] = { id: t, name: x[0], code: x[1], col: x[2], desc: x[3] };
      EXTRA14[t] = 1; FIXED[t] = 1;
    }
    return { floors: SETS.length, snakes: SNAKES.length, bosses: BOSSES.length, mods: MODS.length - 1, rooms: RTYPES.length, items: ITEM_IDS.length };
  }
  safe(() => { const ro = Maker.reopen; Maker.reopen = function () { safe(refresh14); return ro.apply(this, arguments); }; });

  /* rooms the game builds itself (Knokpit, Clini-Clown HQ and whatever comes later), and the spike trap modifier */
  safe(() => {
    const gl1 = generateLevel;
    generateLevel = function (def, rng) {
      const map = gl1.apply(this, arguments);
      if (G.mode === 'map' && RTM.cur && def && def.mapF != null && map && map.rooms) for (const rm of map.rooms) safe(() => {
        const R = rm.mkR; if (!R) return;
        if (EXTRA14[R.t] && rm !== map.start) {
          const seal = rm.sealed;
          const C14 = window.__bitten && window.__bitten.CAT14;
          if (C14) C14.build(rm, R.t, def, Math.random); else chaosRoom9(rm, R.t, def, Math.random);
          rm.mkR = R; rm.mkSn = []; rm.mkE = rm.mkE || []; rm.mkGuard = false;
          if (seal) rm.sealed = true;
          rm.dirty = true; rm.ver = (rm.ver || 0) + 1;
        }
        if (rm.type === 'fight' && rm.mod === 'spikes' && typeof placeSpikes === 'function') placeSpikes(rm, Math.random);
      });
      return map;
    };
  });

  /* ---- room powerup lists (R.pl) and floor boss rewards (F.brw) in the map and the share code */
  const BRW_MAX = 3;
  const cleanIds = (list, max, extra) => (Array.isArray(list) ? list : []).filter((id, i, a) => typeof id === 'string' && (ITEMS[id] || (extra && (id === 'rand' || id === 'rare'))) && (extra || a.indexOf(id) === i)).slice(0, max);
  safe(() => {
    ROOM_FIELDS.push({ k: 'pl', init: () => ({ m: '', ids: [] }), clean: (R) => { const p = R.pl; return { m: p && (p.m === 'only' || p.m === 'ban') ? p.m : '', ids: cleanIds(p && p.ids, 120) }; },
      out: (v) => (v && v.m && v.ids.length ? { m: v.m, ids: v.ids.slice() } : undefined) });
    const cf1 = M74.cleanFloor;
    M74.cleanFloor = function (F) { const o = cf1.apply(this, arguments); if (o) o.brw = cleanIds(F && F.brw, BRW_MAX, true); return o; };
    const nf1 = M74.newFloor;
    M74.newFloor = function () { const o = nf1.apply(this, arguments); o.brw = []; return o; };
    const cp1 = M74.compact;
    M74.compact = function (M) {
      const o = cp1.apply(this, arguments);
      M.floors.forEach((F, fi) => {
        const f = o.floors[fi]; if (!f) return;
        if (F.brw && F.brw.length) f.brw = F.brw.slice();
      });
      return o;
    };
  });

  /* ---- the editor: Powerups in this room (Room pane), Boss reward (Floor pane) */
  function roomPoolSection(R) {
    if (!R.pl) R.pl = { m: '', ids: [] };
    const P0 = R.pl, sec = el('div', 'mk-sec');
    sec.appendChild(el('h4', 'mk-h', 'Powerups in this room'));
    const upd = (fn) => { pushUndo(); fn(); changed(); };
    sec.appendChild(field('Random powerups here come from', seg([['', 'The map pool'], ['only', 'Only these'], ['ban', 'Not these']], P0.m, (v) => upd(() => { P0.m = v; }))));
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
      sec.appendChild(btn('gold', IC.plus + (P0.ids.length ? 'Change the list' : 'Pick powerups'), 'Choose the powerups of this room', () => pickMany(P0.ids, (ids) => upd(() => { P0.ids = ids; }))));
    }
    sec.appendChild(el('p', 'mk-p', P0.m === 'only' ? 'Chests, rewards, pots and drops in this room only roll these. Dragon and space powerups work on any floor here.'
      : P0.m === 'ban' ? 'These never roll in this room.' : 'This room rolls like the rest of the map. Pick a list to give it its own powerups.'));
    return sec;
  }
  function bossRewardSection(F) {
    if (!F.brw) F.brw = [];
    const sec = el('div', 'mk-sec mk-rw');
    sec.appendChild(el('h4', 'mk-h', 'Boss reward'));
    const upd = (fn) => { pushUndo(); fn(); changed(); };
    F.brw.forEach((id, i) => {
      const line = el('div', 'mk-rwl');
      line.appendChild(el('span', 'mk-p', `Drop ${i + 1}`));
      line.appendChild(itemBtn(id, (v) => upd(() => { F.brw[i] = v; })));
      line.appendChild(btn('ic red', IC.trash, 'Remove this drop', () => upd(() => { F.brw.splice(i, 1); })));
      sec.appendChild(line);
    });
    if (F.brw.length < BRW_MAX) sec.appendChild(btn('gold', IC.plus + 'Add a boss drop', 'A powerup that drops when the floor boss dies', () => upd(() => { F.brw.push('rare'); })));
    sec.appendChild(el('p', 'mk-p', 'Lands next to the boss loot when the floor boss dies. Exact, random or a random legendary. Up to three.'));
    return sec;
  }
  safe(() => {
    const rr1 = M74.renderRoomPane;
    M74.renderRoomPane = function () {
      const r = rr1.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneRoom'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop, sec = roomPoolSection(R_());
        const doors = pane.querySelector('.mk-doors'), h = doors && doors.previousElementSibling;
        if (h) pane.insertBefore(sec, h); else pane.appendChild(sec);
        pane.scrollTop = top;
      });
      return r;
    };
    const rf1 = M74.renderFloor;
    M74.renderFloor = function () {
      const r = rf1.apply(this, arguments);
      safe(() => {
        const pane = $('mkPaneFloor'); if (!pane || !Maker.M) return;
        const top = pane.scrollTop; pane.appendChild(bossRewardSection(F_())); pane.scrollTop = top;
      });
      return r;
    };
    HELP.splice(4, 0, ['Every piece', [
      ['All of the game', 'Every floor, snake, boss, room type and modifier of the game is in here, also the dragon sky, space, the Knokpit and the clowns. New ones show up by themselves.'],
      ['Snake colour and health', 'Select a snake: pick one of its colours and scale its health from 50% to 300%.'],
      ['Powerups per room', 'Room, Powerups in this room. Only these, or not these, for every random roll in that room.'],
      ['Boss reward', 'Floor, Boss reward. Up to three powerups that drop when the floor boss dies.'],
      ['Play together', 'Coop, Game Maker, mode Map: pick a map and play it with up to four apples, on one screen or online.'],
    ]]);
  });

  /* ---- online coop: a note or a choice is answered by the apple that found it, for the whole team
     Pop freezes Game.update until it is answered. Online every peer runs that freeze in the same tick, and the
     answer travels as an 'act' event through the host (net.js), so every peer unfreezes in the same tick too. */
  safe(() => {
    const live = () => typeof NET14 !== 'undefined' && NET14.live;
    const net = () => window.__bitten.net14;
    const nameOf = (slot) => { const P = G.players && G.players[slot]; return (P && P.name14) || 'P' + (slot + 1); };
    function popWho() {
      const o = Pop.cur, h = $('mkPopH'); if (!o || !h || !net()) return;
      const mine = (o.slot | 0) === net().S.me;
      h.textContent = mine ? (o.opts && o.opts.length > 1 ? 'You choose for the whole team. Keys 1 and 2 work too.' : 'Tap, Enter or Space to go on, for the whole team.') : `${nameOf(o.slot | 0)} is reading. The run waits.`;
    }
    const ps0 = M74.popShow;
    M74.popShow = function (o) { if (o && live() && o.slot == null) o.slot = G.player && G.player.slot14 != null ? G.player.slot14 : 0; return ps0.apply(this, arguments); };
    const pn0 = M74.popNext;
    M74.popNext = function () { const r = pn0.apply(this, arguments); if (live() && Pop.on && Pop.cur) { NET14.decider = Pop.cur.slot | 0; safe(popWho); } return r; };
    const pk0 = M74.popPick;
    M74.popPick = function (i) {
      if (!live()) return pk0.apply(this, arguments);
      const o = Pop.cur; if (!o) return;
      if (NET14.replay) {
        Pop.tm = -1e9; Pop.typed = Pop.full.length;
        const r = pk0.call(this, i);
        if (!Pop.on) NET14.decider = -1;
        return r;
      }
      if ((o.slot | 0) !== net().S.me) { safe(() => UI.banner(`${nameOf(o.slot | 0)} is choosing`, '')); return; }
      if (performance.now() - Pop.tm < 260 || popSkip()) return;
      const b = $('mkPopO').children[i]; if (!b || !net().act) return;
      net().act({ r: 'mkPop', i: [...Pop.el.querySelectorAll('*')].indexOf(b) });
    };
    /* the apple that has to answer left: the last answer is taken for it, in the same tick everywhere */
    Sched.every('step', 'v14.6 pop away', () => {
      const o = Pop.cur; if (!o || !live()) return;
      const P = G.players && G.players[o.slot | 0];
      if (P && !P.away14) return;
      const n = o.opts && o.opts.length ? o.opts.length : 1;
      NET14.replay = true; try { M74.popPick(n - 1); } finally { NET14.replay = false; }
    }, () => Pop.on);
  });

  /* ---- a map played in coop goes back to the coop screen, not into the Map Maker */
  safe(() => {
    const ro1 = Maker.reopen;
    Maker.reopen = function () { if (RTM.back === 'coop') { RTM.cur = null; RTM.back = 'hub'; return; } return ro1.apply(this, arguments); };
    const mb1 = M74.mapButtons;
    M74.mapButtons = function (on) {
      const r = mb1.apply(this, arguments);
      if (on && RTM.back === 'coop') for (const id of ['btnQuit', 'btnOverMenu', 'btnWinMenu']) { const b = UI.el[id]; if (b) b.textContent = S9('Menu'); }
      return r;
    };
  });
  Object.assign(MK, { refresh14, EXTRA14, cleanFloor: (F, i) => M74.cleanFloor(F, i), cleanMapNow: (M) => M74.cleanMap(M), compactNow: (M) => M74.compact(M), Pop });

  Object.assign(MK, { validate: M74.validate, edit: M74.edit, showHub, showEditor: M74.showEditor, playMap, toast, previewRoom, drawEditor, tileAtlas, paintBrushIcon, applyAt: M74.applyAt, setTool: M74.setTool, pickBrush: M74.pickBrush, selectRoom: M74.selectRoom, addRoom, setType, goFloor, layoutCanvas });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
