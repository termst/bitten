/* src/92-v14-curve.js: v14.4 difficulty curve. Two problems on every difficulty:
   * floors 1 and 2 were the wall: full rooms of snakes while the apple has no powerups yet;
   * from floor 3 on a stacked apple melted everything, bosses died before their stages showed.
   The fix is dynamic, it watches the apple instead of only the floor number:
   * early relief: softer snakes on floors 1 and 2, one snake less per fight and per wave on floors 1 and 2, at most one
     nasty trait on floor 1, slower venom, and the first won fight on floors 1 and 2 drops a powerup;
   * a power meter: damage dealt to normal snakes per second of fighting (DPS14, a 12 s moving average).
     Floor 1 is the yardstick: R = DPS now / DPS on floor 1, so a careful player and a fast one both get their own curve;
   * snakes from floor 3 grow with R, on top of the old powerup threat (which only counted powerups, not their combos);
   * bosses get the HP the meter says they need to last a target time (30 s on floor 2 up to 42 s on floor 5, minis half),
     so every stage line is reached and shown. Never more than 3x the old HP. The floor 1 and 2 bosses start at 85% and 90%.
   The numbers come from seeded bot runs, see the v14.4 notes in HANDOFF.md.
   Everything runs inside the simulation (only G.rng and sim state), so online peers stay in lockstep.
   Test hooks: window.__bitten.CURVE14 { CFG, state() }. Report: node test/curve.js */
(function () {
  'use strict';
  const safe = (f, d) => { try { return f(); } catch (e) { errNote14(e, 'curve92'); console.error(e); return d; } };
  const CFG = {
    on: true,
    hp: [0.75, 0.85],          // snake HP on floor 1, floor 2
    venom: [0.9, 0.96],       // venom speed on floor 1, floor 2
    trim: [1, 1], keep: [2, 3],   // floor 1, floor 2: snakes taken out of every fight and wave, never below keep
    traits: 1,                // floor 1: at most this many nasty traits per fight
    firstDrop: true,          // the first won fight on floor 1 and on floor 2 drops a powerup
    tau: 12,                  // seconds, power meter average
    minRef: 6,                // seconds of fighting on floor 1 before it counts as the yardstick
    snakeFrom: 2,             // floor index where snakes start to follow the meter (floor 3)
    snakeExp: 0.5, snakeMax: 1.5,
    expect: [1, 1.6, 3, 4.5, 6],   // the R a floor already plans for with its own hpMult and the old threat, by floor index
    bossT: [0, 30, 34, 38, 42], bossLo: [0.85, 0.9, 1], miniK: 0.5, bossMax: 3, eff: 1.2,   // eff: boss HP per second per meter point, measured (test/curve.js: 1.1 to 1.3)
  };
  const modeOk = () => G.run && (G.mode === 'arcade' || G.mode === 'daily' || G.mode === 'endless' || G.mode === 'story')
    && !(typeof inMap === 'function' && safe(() => inMap(), false));
  const early = (i) => modeOk() && i != null && i < 2;
  const S = () => G.run && (G.run.c14 || (G.run.c14 = { acc: 0, t: 0, ema: null, refD: 0, refT: 0, ref: null, first: -1 }));

  /* ------------------------------------------------------------------ floors 1 and 2: softer */
  const sd0 = Game.scaleDef;
  Game.scaleDef = function (base, i) {
    const d = sd0.apply(this, arguments);
    if (CFG.on && early(i) && !base.rush) {
      d.hpMult *= CFG.hp[i]; d.venomSpeed *= CFG.venom[i];
      if (i === 0) d.traits = Math.min(d.traits || 0, CFG.traits);
    }
    return d;
  };
  const sc0 = Game.startCombat;
  Game.startCombat = function (room) {
    const i = G.levelIdx || 0;
    if (!(CFG.on && room && room.type === 'fight' && early(i) && room.spawns && room.spawns.length > CFG.keep[i] && !room.trim14)) return sc0.apply(this, arguments);
    room.trim14 = true;
    const keep = room.spawns; room.spawns = keep.slice(0, Math.max(CFG.keep[i], keep.length - CFG.trim[i]));
    try { return sc0.apply(this, arguments); } finally { room.spawns = keep; }
  };
  const sw0 = Game.spawnWave;
  Game.spawnWave = function (room) {
    const n0 = room.snakes.length, r = sw0.apply(this, arguments);
    const i = G.levelIdx || 0;
    if (CFG.on && early(i)) {
      const cut = Math.min(CFG.trim[i], room.snakes.length - n0 - CFG.keep[i]);
      if (cut > 0) room.snakes.splice(room.snakes.length - cut, cut);
    }
    return r;
  };
  Hooks.layer('Game.clearRoom', 'v14.4 curve', function (next, room) {
    const was = room && room.cleared, r = next.apply(this, [].slice.call(arguments, 1));
    if (CFG.on && CFG.firstDrop && room && !was && room.type === 'fight' && modeOk()) {
      const s = S(), i = G.levelIdx || 0;
      if (s && i < 2 && s.first < i) { s.first = i; safe(() => spawnItem(room, RW / 2, RH / 2, 0)); }
    }
    return r;
  });

  /* ------------------------------------------------------------------ the power meter */
  const hm0 = hurtMod9;
  hurtMod9 = function (sn) {
    const a = hm0.apply(this, arguments);
    if (a > 0 && sn && !sn.isBoss && G.run) { const s = S(); s.acc += a; }
    return a;
  };
  function meter(dt, room) {
    const s = S(); if (!s) return;
    const foes = room.snakes.some((x) => x.alive && x.state === 'active' && !x.isBoss);
    if (!foes || !room.locked || room.snakes.some((x) => x.isBoss && x.alive)) { s.acc = 0; return; }
    s.t += dt;
    if (G.levelIdx === 0) { s.refD += s.acc; s.refT += dt; }
    const inst = s.acc / dt; s.acc = 0;
    s.ema = s.ema == null ? inst : s.ema + (inst - s.ema) * Math.min(1, dt / CFG.tau);
  }
  const ratio = () => {
    const s = S(); if (!s || s.ema == null) return 1;
    if (s.ref == null && G.levelIdx > 0) s.ref = s.refT >= CFG.minRef ? s.refD / s.refT : null;
    const ref = s.ref != null ? s.ref : s.refT >= CFG.minRef ? s.refD / s.refT : null;
    return ref > 0 ? s.ema / ref : 1;
  };
  const expectAt = (i) => CFG.expect[Math.min(i, CFG.expect.length - 1)] * (1 + 0.5 * Math.max(0, i - CFG.expect.length + 1));
  function snakeK() {
    const i = G.levelIdx || 0;
    if (!CFG.on || !modeOk() || i < CFG.snakeFrom) return 1;
    return clamp(Math.pow(ratio() / expectAt(i), CFG.snakeExp), 1, CFG.snakeMax);
  }
  // normal snakes: the old threat times the meter. Bosses keep the old threat only, the boss rule below adds the rest.
  const ep0 = enemyPowerK;
  enemyPowerK = function (P) { return ep0(P) * (G.run && G.state === 'play' ? snakeK() : 1); };
  bossHpK = function () { const L = G.levelDef, P = G.player; return (L.bossMult || 1) * ep0(P) * mpBossHpK14(); };

  /* ------------------------------------------------------------------ bosses: enough HP to see every stage */
  function bossFit(room) {
    const bs = room.snakes.filter((x) => x.isBoss && x.alive && !x.dyn14 && x.maxHp > 0);
    if (!bs.length) return;
    for (const b of bs) b.dyn14 = 1;
    const s = S(), i = G.levelIdx || 0;
    if (!CFG.on || !modeOk() || !s) return;
    const lo = room.type === 'boss' ? CFG.bossLo[Math.min(i, CFG.bossLo.length - 1)] : 1;
    const T = CFG.bossT[Math.min(i, CFG.bossT.length - 1)] * (room.type === 'boss' ? 1 : CFG.miniK);
    const all = room.snakes.filter((x) => x.isBoss && x.alive), hp = all.reduce((a, x) => a + x.maxHp, 0);
    const need = (s.ema || 0) * CFG.eff * T, f = clamp(need / Math.max(1, hp), lo, CFG.bossMax);
    if (Math.abs(f - 1) < 0.001) return;
    for (const b of bs) { b.maxHp *= f; b.hp *= f; b.dyn14 = f; }
    s.lastBoss = { f: +f.toFixed(2), hp: Math.round(hp * f), need: Math.round(need) };
  }
  const ur0 = updateRoom9;
  updateRoom9 = function (dt, room, frozen) {
    ur0(dt, room, frozen);
    if (room && G.run && G.state === 'play' && dt > 0 && !frozen) safe(() => { bossFit(room); meter(dt, room); });
  };

  function state() {
    const s = S() || {};
    return { dps: s.ema, ref: s.ref != null ? s.ref : s.refT ? s.refD / s.refT : null, R: ratio(), snakeK: snakeK(), combat: s.t, lastBoss: s.lastBoss || null, first: s.first };
  }
  Object.assign(window.__bitten || (window.__bitten = {}), { CURVE14: { CFG, state } });
})();
