/* 74.js section 20: pro-run. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { CH_COLS, CH_NAMES, DARK_V, FONT, GEN, HELP, MK, PRO, ROOM_FIELDS, RTM, ST_IN, applyGates, areaMove, cleanRoom, fillEmptyRooms, flipClip, genFloor, grabArea, inMap, myStamps, newRoom, openExit, openGenerator, openTestSettings, placeClip, putStamp, rotClip, safe, saveStamp, startStamp } = M74;
  /* ================================ the run: waves, events, room rules, test settings */
  safe(() => {
    const br = M74.buildRoom;
    M74.buildRoom = function (room, R) {
      const r = br.apply(this, arguments);
      const sn = R.e.filter((e) => e.t === 'sn');
      if (room.mkSn) room.mkSn.forEach((s, i) => { s.wv = (sn[i] && sn[i].wv) || 1; });
      room.mkEv = (R.ev || []).map((e) => Object.assign({}, e, { done: false }));
      room.mkDk = R.dk != null && R.dk >= 0 ? R.dk : null;
      room.mkShp = R.sh || 1; room.mkTbLen = R.tb || 0;
      return r;
    };
    // snake health per room, and waves
    function spawnList(room, list) {
      const keep = room.mkSn, before = room.snakes.length;
      room.mkSn = list;
      try { sms0(room); } finally { room.mkSn = keep; }
      if (room.mkShp && room.mkShp !== 1) for (const sn of room.snakes.slice(before)) { sn.maxHp = Math.max(1, Math.round(sn.maxHp * room.mkShp)); sn.hp = sn.maxHp; }
    }
    const sms0 = M74.spawnMapSnakes;
    M74.spawnMapSnakes = function (room) {
      const list = room.mkSn || [];
      const waved = (room.type === 'fight' || room.mkGuard) && list.some((s) => (s.wv || 1) > 1);
      if (!waved) return spawnList(room, list);
      room.mkWq = [2, 3].map((w) => list.filter((s) => s.wv === w)).filter((l) => l.length);
      room.mkWave = 1;
      spawnList(room, list.filter((s) => (s.wv || 1) <= 1));
    };
    Hooks.layer('Game.clearRoom', 'v14.9 map waves and events', function (next, room) {
      if (inMap() && room && room.mkWq && room.mkWq.length && !room.cleared) {
        if (!room.mkWaveAt) { room.mkWaveAt = G.t + 0.9; return; }
        if (G.t < room.mkWaveAt) return;
        room.mkWaveAt = 0;
        const list = room.mkWq.shift(); room.mkWave = (room.mkWave || 1) + 1;
        safe(() => spawnList(room, list));
        safe(() => { UI.banner(room.mkWave === 2 ? 'Second wave' : 'Third wave', room.mkWq.length ? 'One more after this.' : 'The last of them.', 'curse'); Sfx.hiss(0.8); });
        fireEv(room, 'wave', room.mkWave);
        return;
      }
      const was = room && room.cleared;
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap() && room && !was && room.cleared) safe(() => {
        const tb = room.mkTb;
        if (tb && !tb.done) {
          tb.done = true;
          if (G.t <= tb.end) { const f = nearestFreeCell(room, RW / 2, RH / 2); spawnItem(room, f.x, f.y); UI.banner('In time', `Cleared with ${Math.ceil(tb.end - G.t)} seconds to spare. A powerup.`, 'legend'); Sfx.tone(660, 0.25, { to: 1320, type: 'triangle', vol: 0.07 }); }
          else UI.banner('Too slow', 'The clock ran out. No prize this time.');
        }
        fireEv(room, 'clear', 0);
      });
      return r;
    });
    Hooks.layer('Game.enterRoom', 'v14.9 map events', function (next, room) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap() && room) safe(() => {
        room.mkCh0 = G.map && G.map.mkCh ? G.map.mkCh.slice() : [0, 0, 0, 0];
        if (!room.mkIn) { room.mkIn = true; fireEv(room, 'enter', 0); }
        startClock(room);
      });
      return r;
    });
    function startClock(room) {
      if (!room.mkTbLen || room.mkTb || room.cleared || !room.locked) return;
      room.mkTb = { end: G.t + room.mkTbLen + 1, len: room.mkTbLen, done: false };
      UI.banner('Beat the clock', `Clear this room in ${room.mkTbLen} seconds for a powerup.`);
    }
    const ure = updateRoomExtras;
    updateRoomExtras = function (dt, room, frozen) {
      ure.apply(this, arguments);
      if (dt > 0 && !frozen && room && room === G.room && inMap() && G.state === 'play' && G.map) safe(() => evTick(dt, room));
    };
    function evTick(dt, room) {
      if (!room.mkTb) startClock(room);
      const E = room.mkEv; if (!E || !E.length || E.every((e) => e.done)) return;
      const P = G.player;
      room.mkTime = (room.mkTime || 0) + dt;
      fireEv(room, 'time', room.mkTime);
      // kills: every snake seen alive in this room that is gone now
      const seen = room.mkSeenSn || (room.mkSeenSn = new Set());
      for (const sn of room.snakes) if (sn.alive && !sn.isBoss) seen.add(sn);
      let k = 0; for (const sn of seen) if (!sn.alive || !room.snakes.includes(sn)) k++;
      fireEv(room, 'kills', k);
      if (P && P.hp > 0 && P.hp <= P.maxHp / 2) fireEv(room, 'hurt', 0);
      const ch = G.map.mkCh, c0 = room.mkCh0 || (room.mkCh0 = ch.slice());
      for (let i = 0; i < 4; i++) if (ch[i] !== c0[i]) { c0[i] = ch[i]; fireEv(room, 'flip', i); }
    }
    function fireEv(room, w, v) {
      for (const e of room.mkEv || []) {
        if (e.done || e.w !== w) continue;
        if ((w === 'time' || w === 'kills') && v < e.n) continue;
        if ((w === 'wave' || w === 'flip') && v !== e.n) continue;
        e.done = true;
        safe(() => doEv(room, e));
      }
    }
    function doEv(room, e) {
      const P = G.player, mid = () => nearestFreeCell(room, P ? P.x : RW / 2, P ? P.y + T : RH / 2);
      switch (e.d) {
        case 'shout': UI.banner(e.txt || '', ''); Sfx.tone(440, 0.2, { to: 660, type: 'triangle', vol: 0.05 }); break;
        case 'gates': G.map.mkCh[e.a | 0] ^= 1; applyGates(G.map, true); Sfx.clank(); if (P) floatText(P.x, P.y - 30, `${CH_NAMES[e.a | 0].toUpperCase()} GATES`, CH_COLS[e.a | 0], true); break;
        case 'snakes': {
          if (!KINDS[e.k] || !P) break;
          const used = new Set(), n = e.a || 1;
          for (let i = 0; i < n; i++) {
            const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c);
            const sn = safe(() => new Snake(e.k, cell.x, cell.y, { delay: 0.3 + i * 0.18, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
            if (!sn) continue;
            if (room.mkShp && room.mkShp !== 1) { sn.maxHp = Math.max(1, Math.round(sn.maxHp * room.mkShp)); sn.hp = sn.maxHp; }
            room.snakes.push(sn);
          }
          if (!room.locked) { room.cleared = false; room.locked = true; room.doorCl = 0; Sfx.doorShut(); }
          Sfx.hiss(0.9);
          break;
        }
        case 'heal': if (P) { P.heal(e.a || 2); floatText(P.x, P.y - 28, e.a >= 4 ? '+2 APPLES' : e.a >= 2 ? '+1 APPLE' : '+½ APPLE', '#ff6a7a', true); Sfx.tone(660, 0.18, { to: 990, type: 'triangle', vol: 0.06 }); } break;
        case 'coins': G.run.coins = (G.run.coins || 0) + (e.a || 10); Sfx.coin(); if (P) floatText(P.x, P.y - 28, `+${e.a || 10} COINS`, '#ffd84a', true); break;
        case 'item': { const f = mid(); spawnItem(room, f.x, f.y, e.a === 'rare' ? 1 : 0.04); flashLight(f.x, f.y, 90, 0.8, 0.6); break; }
        case 'key': { const f = mid(); room.pickups.push({ kind: 'key', x: f.x, y: f.y, vx: 0, vy: 60, t: 0.5, ph: 0 }); Sfx.tone(880, 0.2, { to: 1320, type: 'triangle', vol: 0.06 }); break; }
        case 'lights': room.mkDkEv = e.a | 0; Sfx.tone(e.a >= 2 ? 160 : 520, 0.25, { to: e.a >= 2 ? 90 : 780, type: 'sine', vol: 0.06 }); break;
        case 'open': {
          let n = 0;
          for (const s in room.doors) { const o = room.doors[s]; if (o && o.sealed) { o.sealed = false; o.dirty = true; o.ver = (o.ver || 0) + 1; n++; } }
          if (room.sealed) { room.sealed = false; n++; }
          room.dirty = true; room.ver++;
          if (room.mkExit && !room.exit) { openExit(room); n++; }
          Sfx.unlock(); UI.banner(n ? 'Unlocked' : 'Click', n ? 'Something opened.' : 'Nothing here was locked.');
          break;
        }
        case 'boom': explode(room, RW / 2, RH / 2, 80, { dmg: 1, snakeDmg: 9 }); break;
        default: break;
      }
    }
    // darkness per room and from events
    const dt0 = darkTarget;
    darkTarget = function (room, L) {
      if (inMap() && room && (room.mkDkEv != null || room.mkDk != null)) {
        const v = room.mkDkEv != null ? room.mkDkEv : room.mkDk;
        return room.cleared && room.mkDkEv == null ? Math.max(0.12, DARK_V[v] * 0.6) : DARK_V[v];
      }
      return dt0.apply(this, arguments);
    };
    // the clock on screen
    const gl = drawGlow3;
    drawGlow3 = function (c, room) {
      gl.apply(this, arguments);
      const tb = room && room.mkTb;
      if (!tb || tb.done || !inMap()) return;
      safe(() => {
        const left = Math.max(0, tb.end - G.t), late = left <= 0, warn = left < 5;
        c.save();
        c.font = `800 15px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        const s = late ? 'TIME UP' : `${Math.ceil(left)}`;
        const w = c.measureText(s).width + 20;
        const y0 = RH - 28; c.fillStyle = 'rgba(10,6,5,0.7)'; c.fillRect(RW / 2 - w / 2, y0, w, 20);
        c.strokeStyle = late ? '#8a7a6a' : warn ? '#ff4a5a' : '#ffc53a'; c.lineWidth = 1; c.strokeRect(RW / 2 - w / 2 + 0.5, y0 + 0.5, w - 1, 19);
        c.fillStyle = late ? '#b8a8a0' : warn ? '#ff6a7a' : '#ffd27a'; c.fillText(s, RW / 2, y0 + 10.5);
        c.restore();
      });
    };
    // test settings, only when testing from the editor
    Hooks.layer('Game.startRun', 'v14.9 map test settings', function (next) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap() && RTM.back === 'editor') safe(() => {
        const T0 = PRO.test;
        for (const P of (G.players && G.players.length ? G.players : [G.player])) if (P && T0.god) P.god = true;
        if (T0.coins) G.run.coins = (G.run.coins || 0) + T0.coins;
        if (T0.keys) G.run.keys = (G.run.keys || 0) + T0.keys;
        if (T0.god || T0.coins || T0.keys) UI.banner('Test run', [T0.god ? 'can not die' : '', T0.coins ? `+${T0.coins} coins` : '', T0.keys ? `${T0.keys} keys` : ''].filter(Boolean).join(', '));
      });
      return r;
    });
  });

  /* ---- help */
  safe(() => {
    HELP.splice(HELP.length - 1, 0, ['Pro tools', [
      ['Shapes', 'L line, O outline, C circle (Shift for a filled one). S cycles the brush size: 1, 2 or 3 tiles.'],
      ['Area', 'M, then drag a box. Copy, cut, delete, fill, flip, or drag it to move it. Arrow keys nudge it. Ctrl A takes the whole room.'],
      ['Stamps', 'Ctrl V after copying an area gives a stamp: click to put it down, X and Y flip it, R turns it. Save areas as stamps; they show under Paint, Stamps, next to the built in ones.'],
      ['Waves', 'Select a snake and set its Wave. Second wave snakes come when the first wave is dead, the third after that.'],
      ['Events', 'Room, Events. When you walk in, clear the room, after some seconds, after some kills, when a wave starts, at half health or when gates flip: shout, flip gates, let snakes out, heal, coins, a powerup, a key, lights, unlock, or an explosion.'],
      ['Room rules', 'Darkness and snake health per room, and Beat the clock: clear it in time for a powerup.'],
      ['Generate', 'Floor, Quick build. Generate a whole floor in its style, or fill every empty room with a layout and snakes.'],
      ['Test settings', 'The gear next to Test: can not die, extra coins and keys. Only in your own test runs.'],
    ]]);
    const keys = HELP[HELP.length - 1][1].find((x) => x[0] === 'Keys');
    if (keys) keys[1] = 'B brush, E eraser, F fill, R box, L line, O outline, C circle, M area, I picker, V select, S size. X and Y mirror. G grid. T tests. Ctrl Z and Ctrl Y undo and redo. Arrows walk between rooms, or move an area.';
  });

  const CSS14 = `
.mk-ev{border:1px solid var(--line);border-left:3px solid #e3a54a;border-radius:2px;padding:8px 10px 2px;margin-bottom:8px;background:rgba(255,255,255,.02)}
.mk-ev-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.mk-ev-hd b{font:700 12px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--toffee)}
.mk-ev-hd .mk-btn.ic{width:30px;min-height:30px}
.mk-stb.mine{border-color:rgba(124,196,255,.45)}
.mk-stp{grid-column:1/-1;margin-top:6px}
.mk-small{font-size:12.5px}
.mk-ic{display:inline-flex;width:44px;height:44px;align-items:center;justify-content:center;color:#7cc4ff}
.mk-ic svg{width:26px;height:26px}
.mk-crx{color:var(--toffee)}
.mk-gen-pv{display:flex;justify-content:center;background:#120d0b;border:1px solid var(--line);border-radius:2px;padding:8px;margin-bottom:6px}
.mk-gen .mk-row{grid-template-columns:96px minmax(0,1fr)}
table.mk-ov{width:100%;border-collapse:collapse;font:600 13px/1.2 var(--ui);color:var(--muted)}
table.mk-ov th{font:700 10px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--faint);text-align:left;padding:4px 4px 6px}
table.mk-ov td{padding:6px 4px;border-top:1px solid var(--line)}
table.mk-ov td small{color:var(--faint);font-weight:500}
table.mk-ov tbody tr{cursor:pointer}
table.mk-ov tbody tr:hover td{color:var(--ink);background:rgba(255,255,255,.03)}
table.mk-ov i.th{font-style:normal;padding:2px 6px;border-radius:2px;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
i.th.mild{background:rgba(90,216,90,.15);color:#8fe08f}i.th.fair{background:rgba(255,200,58,.15);color:#ffd27a}i.th.tough{background:rgba(255,138,26,.18);color:#ffaa5a}i.th.brutal{background:rgba(232,58,80,.2);color:#ff8494}
@media (max-width:1599px) and (min-width:980px){.mke-tools .mk-btn .tl{display:none}.mke-tools .mk-btn{padding:0;width:40px}}
@media (max-width:520px){table.mk-ov th:nth-child(5),table.mk-ov td:nth-child(5){display:none}}
`; M74.CSS14 = CSS14;
  // v14.10: the plain names follow the current wrapped functions (they used to be the v12.3 / v12.5 originals)
  Object.assign(MK, { cleanMap: (M) => M74.cleanMap(M), compact: (M) => M74.compact(M), cleanRoom: (R) => cleanRoom(R), cleanFloor: (F, i) => M74.cleanFloor(F, i),
    newMap: () => M74.newMap(), newRoom: (x, y, t) => newRoom(x, y, t), newFloor: (i, set) => M74.newFloor(i, set), ROOM_FIELDS });
  Object.assign(MK, { PRO, applyAt: M74.applyAt, setTool: M74.setTool, pickBrush: M74.pickBrush, validate: M74.validate, genFloor, GEN, grabArea, placeClip, flipClip, rotClip, startStamp, putStamp, areaMove, saveStamp, myStamps, ST_IN, fillEmptyRooms, openGenerator, openTestSettings, cleanMapNow: (M) => M74.cleanMap(M), compactNow: (M) => M74.compact(M), cleanFloor: (F, i) => M74.cleanFloor(F, i) });
})(window.__bitten.M74 || (window.__bitten.M74 = {}));
