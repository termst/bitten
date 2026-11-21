/* src/85-v14-stages.js: v14.3 boss stages. Every boss fights in 2 to 4 stages by health, each boss with its own stage names,
   its own new attack per stage and its own pace. Shared rules, so strong builds no longer melt a boss in two seconds:
   * a stage line holds: damage stops at the line, the boss roars into the next stage behind a 1.1 s shield
     (the air is cleared of venom, so the change is a breather, not a trap);
   * one hit takes at most 6% of the boss, and past 15% in a second (more with more apples) damage counts at 45%;
   * no idle start: long opening cooldowns are cut, so every boss moves and attacks within the first seconds.
   All of it runs inside the simulation (Math.random is G.rng there), so online peers stay in lockstep.
   DEF[kind] = { at: [hp fractions where stage 2, 3.. start], names: [[title, sub] per new stage], speed: [per stage],
                 col, enter(sn, room, stage), tick(sn, room, dt, stage) } */
(function () {
  'use strict';
  const safe = (f) => { try { return f(); } catch (e) { errNote14(e, 'stages85'); console.error(e); } };
  const CAP_HIT = 0.06, WIN = 0.15, SHIELD = 1.1;

  /* ------------------------------------------------------------------ helpers the stage attacks share */
  const every = (sn, k, p, dt, first) => { const S = sn.sc14 || (sn.sc14 = {}); if (S[k] == null) S[k] = first == null ? p : first; S[k] -= dt; if (S[k] <= 0) { S[k] += p; return true; } return false; };
  const vs = () => G.levelDef.venomSpeed;
  function ring(x, y, n, sp, col, off = 0, r) { for (let i = 0; i < n; i++) { const v = spawnVenom(x, y, off + (i / n) * TAU, sp, col); if (r) v.r = r; } }
  function trail(sn, col, life = 1.6) { if (sn.burrowed) return; const v = spawnVenom(sn.x, sn.y, 0, 0, col); v.r = 5; v.life = life; }
  const aimed = (sn, n, spread, k, col) => { if (!sn.burrowed && G.player.dying <= 0) fanAt(sn, n, spread, vs() * k, col); };
  // strikes: a warning circle, then a hit where it was. `ring` > 0 also throws a ring of venom from there.
  function strike(room, x, y, o) {
    (room.st14 || (room.st14 = [])).push(Object.assign({ x: clamp(x, 18, RW - 18), y: clamp(y, 18, RH - 18), r: 30, t: 0, warn: 1.1, col: '#ff6a4a', ring: 0 }, o));
  }
  function strikes(room, n, spread, o) {
    for (const Q of livePlayers14()) {
      if (Q.dying > 0) continue;
      for (let i = 0; i < n; i++) { const a = rnd(TAU), r = i ? rnd(40, spread) : 0; strike(room, Q.x + Math.cos(a) * r, Q.y + Math.sin(a) * r, Object.assign({}, o, { warn: (o.warn || 1.1) + i * 0.12 })); }
    }
  }
  function pull(sn, dt, str, R) {
    for (const Q of livePlayers14()) {
      if (Q.dying > 0 || Q.dashT > 0) continue;
      const d = dist(Q.x, Q.y, sn.x, sn.y); if (d > R || d < sn.headR + 6) continue;
      const a = Math.atan2(sn.y - Q.y, sn.x - Q.x), s = str * (1 - d / R);
      const [nx, ny] = resolveTiles(G.room, Q.x + Math.cos(a) * s * dt, Q.y + Math.sin(a) * s * dt, Q.r);
      Q.x = clamp(nx, Q.r, RW - Q.r); Q.y = clamp(ny, Q.r, RH - Q.r);
    }
  }
  const modeIn = (sn, from, to) => { const was = sn.lm14; sn.lm14 = sn.mode; return was !== sn.mode && (from == null || was === from) && (to == null || sn.mode === to); };
  const partner = (sn, room, kind) => room.snakes.find((s) => s !== sn && s.kind === kind && s.isBoss);

  /* ------------------------------------------------------------------ every boss, its own stages */
  const DEF = {
    // the Grub Mother was a 64 hp pushover: more of her, faster, and she poisons the ground she crawls on
    mother: { sting: ['squelch', 'roar'], at: [0.6, 0.25], col: '#c8d86a', speed: [1.05, 1.1, 1.2],
      names: [['Broedkoorts', 'She leaves a trail of slime. Do not follow her.', 'My children are hungry.'], ['Laatste Leg', 'Every egg she has left, all at once.', 'Every last egg. For you.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'slime', 0.45, dt)) trail(sn, '#b8c85a', 1.4);
        if (st >= 3 && every(sn, 'eggs', 4.5, dt, 1.5)) ring(sn.x, sn.y, 8, vs() * 0.6, '#e8e0a0', rnd(TAU));
      } },
    queen: { sting: ['rumble', 'roar'], at: [0.66, 0.33], col: '#e2604e', speed: [1.1, 1.15, 1.25],
      names: [['Echolocatie', 'Under the floor she leaves tremors that stay.', 'I can hear your heartbeat.'], ['Twee Tunnels', 'Every time she comes up, the floor bursts in a ring.', 'The whole floor is mine.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && sn.mode === 'under' && every(sn, 'tremor', 0.28, dt)) { const v = spawnVenom(sn.x, sn.y, 0, 0, '#a0583a'); v.r = 6; v.life = 1.4; }
        if (modeIn(sn, 'warn', 'surface') && st >= 3) ring(sn.x, sn.y, 12, vs() * 0.75, '#e2604e', rnd(TAU));
      } },
    // the Price War: two bosses. Each has its own second stage, and the one left standing goes for a monopoly.
    pwblue: { sting: ['register', 'coin'], at: [0.5], col: '#3a8aff', speed: [1.1, 1.3],
      names: [['Uitverkoop', 'Blue slashes prices: faster, and price tags fly.', 'Everything must go. You first.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'tags', 3.2, dt, 0.8)) aimed(sn, 3, 0.18, 1.1, '#9ac8ff');
        monopoly(sn, room, dt, 'pwyellow');
      } },
    pwyellow: { sting: ['coin', 'dingdong'], at: [0.5], col: '#ffd23a', speed: [1.1, 1.2],
      names: [['Bonuskaart', 'Yellow hands its partner a shield and spends coins like venom.', 'Bonus card says: you lose.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'card', 6, dt, 1)) { const o = partner(sn, room, 'pwblue'); if (o && o.alive && o.dying <= 0) { o.shieldT = Math.max(o.shieldT || 0, 2.2); floatText(o.x, o.y - 30, 'BONUSKAART', '#ffd23a'); } ring(sn.x, sn.y, 8, vs() * 0.8, '#ffd23a', rnd(TAU)); }
        monopoly(sn, room, dt, 'pwblue');
      } },
    coalition: { sting: ['gavel', 'roar'], at: [0.75], col: '#c0c0d0', speed: [1.1, 1.2],
      names: [['Kabinetscrisis', 'The parties argue in rings of venom.', 'We agree on nothing. Except you.']],
      tick(sn, room, dt, st) { if (st >= 2 && !sn.split && every(sn, 'crisis', 4.2, dt, 1)) for (let k = 0; k < 4; k++) ring(sn.x, sn.y, 4, vs() * (0.55 + k * 0.12), ['#e2604e', '#3a8aff', '#5ac85a', '#ffd23a'][k], k * 0.4); } },
    party: { sting: ['gavel', 'hiss'], at: [0.5], col: '#c0c0d0', speed: [1, 1.3],
      names: [['Motie van Wantrouwen', 'A party on its own has nothing to lose.', 'No coalition. No mercy.']],
      tick(sn, room, dt, st) { if (st >= 2 && every(sn, 'motie', 2.8, dt, 0.5)) aimed(sn, 3, 0.25, 1, sn.K.blood); } },
    ouro: { sting: ['hiss', 'roar'], at: [0.7, 0.35], col: '#ff7a3c', speed: [1.05, 1.15, 1.3],
      names: [['Staart in de Bek', 'From the middle of its ring, venom flies outward.', 'The end bites the beginning.'], ['Vervelling', 'It sheds its skin. The old skin still bites.', 'Out with the old skin.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && sn.mode === 'ring' && every(sn, 'core', 3.2, dt, 0.6)) ring(sn.cx, sn.cy, 10, vs() * 0.6, '#ff7a3c', sn.theta);
        if (st >= 3 && every(sn, 'skin', 0.4, dt)) { const p = sn.pts[Math.floor(sn.pts.length * 0.7)]; if (p && !p.hid) { const v = spawnVenom(p.x, p.y, 0, 0, '#c8803a'); v.r = 6; v.life = 2.4; } }
      } },
    ender: { sting: ['warp', 'roar'], at: [0.66, 0.33], col: '#c86bff', speed: [1.1, 1.15, 1.25],
      names: [['Parelregen', 'Every time it lands from a teleport, pearls burst around it.', 'Do not look me in the eyes.'], ['Het Einde', 'Obsidian falls from the ceiling. Keep moving.', 'This is how it ends.']],
      tick(sn, room, dt, st) {
        if (modeIn(sn, 'tpIn', 'move') && st >= 2) ring(sn.x, sn.y, 8, vs() * 0.7, '#c86bff', rnd(TAU));
        if (st >= 3 && every(sn, 'obsid', 5, dt, 1.5)) strikes(room, 3, 120, { col: '#6a3aa8', r: 28 });
      } },
    manu: { sting: ['stinger', 'boom'], at: [0.5], col: '#ff3ad8', speed: [1, 1.1],
      names: [['Bass Drop', 'The speakers fall from the rafters. Watch the floor.', 'Hands in the air. Speakers too.']],
      tick(sn, room, dt, st) { if (st >= 2 && every(sn, 'spk', 6.5, dt, 1)) strikes(room, 3, 130, { col: '#ff3ad8', r: 32, ring: 6 }); } },
    manudevil: { sting: ['stinger', 'boom', 'curse'], at: [0.66, 0.33], col: '#ff3a2a', speed: [1, 1.1, 1.2],
      names: [['Vuurdans', 'He dances on fire. The fire stays.', 'Feel the heat on the floor.'], ['Hellevuur', 'The whole floor is the stage now.', 'Welcome to the afterparty.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && sn.mode !== 'booth' && every(sn, 'fire', 0.22, dt)) trail(sn, '#ff6a2a', 1.8);
        if (st >= 3 && every(sn, 'hell', 5.5, dt, 1)) { const P = G.player; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; strike(room, P.x + Math.cos(a) * 95, P.y + Math.sin(a) * 95, { col: '#ff3a2a', r: 30, warn: 1.2 }); } }
      } },
    bus: { sting: ['busHorn', 'boost'], at: [0.5], col: '#ffb43a', speed: [1, 1.3],
      names: [['Spitsuur', 'Rush hour. Lijn 34 is late and does not stop for anyone.', 'Next stop: you. No stopping.']],
      tick(sn, room, dt, st) { if (st >= 2 && every(sn, 'exh', 0.18, dt)) trail(sn, '#6a6a6a', 1.5); } },
    tellie: { sting: ['buzz', 'zap'], at: [0.5], col: '#3ae0ff', speed: [1.05, 1.2],
      names: [['Kortsluiting', 'Every socket in the room sparks at you.', 'Stay tuned. Stay plugged in.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && room.sockets9 && every(sn, 'spark', 4.2, dt, 0.8)) {
          const P = G.player;
          for (const k of room.sockets9) { const a = Math.atan2(P.y - k.y, P.x - k.x); for (let i = -1; i <= 1; i++) spawnVenom(k.x, k.y, a + i * 0.22, vs() * 0.8, '#3ae0ff'); }
          Sfx.zap && Sfx.zap();
        }
      } },
    rechter: { sting: ['gavel', 'paper'], at: [0.6, 0.3], col: '#d8b46a', speed: [1.05, 1.15, 1.25],
      names: [['Hoger Beroep', 'The gavel comes down where you stand.', 'Objection overruled.'], ['Cassatie', 'Final ruling: venom in every direction.', 'Final verdict: guilty.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'gavel', 4.6, dt, 1)) strikes(room, 2, 90, { col: '#d8b46a', r: 34 });
        if (st >= 3 && every(sn, 'cross', 2.6, dt, 0.5)) { sn.crossO14 = (sn.crossO14 || 0) + Math.PI / 4; ring(sn.x, sn.y, 4, vs() * 0.85, '#f2e6cf', sn.crossO14); }
      } },
    peuk: { sting: ['fuse', 'puff'], at: [0.5], col: '#a0a0a0', speed: [1.1, 1.25],
      names: [['Asregen', 'Burning ash falls. The smoke hangs in the air.', 'Ashes to ashes.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'ash', 5, dt, 1)) strikes(room, 3, 140, { col: '#ff8a2a', r: 26 });
        if (st >= 2 && every(sn, 'smoke', 0.35, dt)) trail(sn, '#7a7a7a', 2);
      } },
    tvboss: { sting: ['zap', 'dingdong'], at: [0.6, 0.3], col: '#3ae0ff', speed: [1.05, 1.15, 1.25],
      names: [['Zapper', 'Channel change: a ring with one way out.', 'We now switch channels.'], ['Storing', 'No signal. Static everywhere.', 'Signal lost. So are you.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'zap14', 4.5, dt, 1)) {
          const P = G.player, gap = Math.atan2(P.y - sn.y, P.x - sn.x) + rnd(-1.2, 1.2);
          for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; if (Math.abs(angDiff(a, gap)) > 0.45) spawnVenom(sn.x, sn.y, a, vs() * 0.7, '#3ae0ff'); }
        }
        if (st >= 3 && every(sn, 'static', 4, dt, 2)) strikes(room, 4, 160, { col: '#d8f0ff', r: 24, warn: 0.95 });
      } },
    kampioen: { sting: ['dingdong', 'roar'], at: [0.5], col: '#ffd23a', speed: [1.15, 1.3],
      names: [['Tweede Ronde', 'The champion is warmed up: faster, and an uppercut after every dash.', 'Round two. Gloves off.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'upper', 2.8, dt, 0.6)) aimed(sn, 3, 0.16, 1.2, '#ffd23a');
      } },
    tunnel: { sting: ['collapse', 'rumble'], at: [0.66, 0.33], col: '#a08a6a', speed: [1.05, 1.15, 1.2],
      names: [['Instorting', 'The tunnel roof comes down in pieces.', 'Mind the ceiling.'], ['Lockdown', 'More rock, faster. Nobody leaves.', 'Nobody leaves the tunnel.']],
      tick(sn, room, dt, st) { if (st >= 2 && every(sn, 'rock', st >= 3 ? 3.4 : 5, dt, 1)) strikes(room, st >= 3 ? 5 : 3, 150, { col: '#c8a878', r: 28 }); } },
    leegte: { sting: ['descend', 'warp'], at: [0.6, 0.3], col: '#8a6aff', speed: [1.05, 1.15, 1.2],
      names: [['Niets', 'Nothing spins out of it, in two arms.', 'There is nothing here.'], ['Alles Weg', 'It pulls everything in. Run the other way.', 'Everything comes to nothing.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'arm', 0.16, dt)) { sn.armA14 = (sn.armA14 || 0) + 0.33; if (Math.floor(G.t / 3) % 2 === 0) ring(sn.x, sn.y, 2, vs() * 0.55, '#8a6aff', sn.armA14); }
        if (st >= 3) pull(sn, dt, 70, 320);
      } },
    spook: { sting: ['curse', 'descend'], at: [0.5], col: '#d8e8ff', speed: [1.1, 1.25],
      names: [['Spookuur', 'Midnight. Ghost lights come at you from every corner.', 'It is midnight. My hour.']],
      tick(sn, room, dt, st) {
        if (st >= 2 && every(sn, 'corner', 4.5, dt, 1)) {
          const P = G.player;
          for (const [x, y] of [[30, 30], [RW - 30, 30], [30, RH - 30], [RW - 30, RH - 30]]) { const v = spawnVenom(x, y, Math.atan2(P.y - y, P.x - x), vs() * 0.6, '#d8e8ff'); v.r = 7; v.life = 5; }
        }
      } },
    jaude: { sting: ['slam', 'roar'], at: [0.5], col: '#ff5ab4', speed: [1.15, 1.35],
      names: [['Jaude Boos', 'Jaude is angry now. Faster, and venom on every stomp.', 'Jaude is not happy.']],
      tick(sn, room, dt, st) { if (st >= 2 && every(sn, 'boos', 3.4, dt, 0.8)) ring(sn.x, sn.y, 8, vs() * 0.75, '#ff5ab4', rnd(TAU)); } },
    // De Wals keeps its own second half at 50%; the coda is new: strikes fall in threes, in time
    wals: { sting: ['stinger', 'whoosh10'], at: [0.5, 0.2], col: '#ff5ab4', speed: [1, 1, 1.15],
      names: [['Tweede Helft', 'The second half of the waltz. It brought the noodles.', 'Faster now. Keep up.'], ['Coda', 'The last bars. One, two, three, all around you.', 'One, two, three. The end.']],
      tick(sn, room, dt, st) { if (st >= 3 && every(sn, 'coda', 3 * 0.33 * 4, dt, 1)) { const P = G.player, a0 = rnd(TAU); for (let i = 0; i < 3; i++) { const a = a0 + (i / 3) * TAU; strike(room, P.x + Math.cos(a) * 70, P.y + Math.sin(a) * 70, { col: '#ff5ab4', r: 34, warn: 0.99 + i * 0.33, ring: 3 }); } } } },
    // De Galaxyworm: four stages, all of its attacks live in its own AI (src/82-v14-ruimte.js)
    galaxy: { sting: ['warp', 'charge'], at: [0.7, 0.4, 0.15], col: '#c45aff',
      names: [['Zwart Gat', 'The middle of the galaxy opens. Black holes, meteors, a comet.', 'I ate every star you wished on.'], ['Supernova', 'Its heart is collapsing. Hide behind a rock when it blows.', 'Watch my heart go.'], ['Singulariteit', 'The event horizon closes in. Stay inside the ring.', 'Not even light leaves now.']],
      enter(sn, room, st) { const S = window.__bitten.SPACE14; if (S && S.galaxyStage14) S.galaxyStage14(sn, room, st); } },
  };
  // the Price War partner that is left alone goes for the monopoly, once
  function monopoly(sn, room, dt, other) {
    if (sn.mono14) return;
    const o = partner(sn, room, other);
    if (o && o.alive && o.dying <= 0) return;
    sn.mono14 = true; sn.monoK14 = 1.25;
    UI.banner('Monopolie', 'One supermarket left. It sets the prices now.', 'curse');
    ring(sn.x, sn.y, 14, vs() * 0.7, sn.K.blood, rnd(TAU)); Sfx.roar();
  }

  /* ------------------------------------------------------------------ the rules */
  function st0(sn) {
    if (sn.stage14) return;
    sn.stage14 = 1; sn.stageT14 = 0; sn.win14 = 0; sn.wt14 = G.t; sn.sc14 = sn.sc14 || {};
  }
  const hm0 = hurtMod9;
  hurtMod9 = function (sn, amount) {
    let a = hm0.apply(this, arguments);
    const D = sn && sn.isBoss && DEF[sn.kind];
    if (!D || !(a > 0)) return a;
    st0(sn);
    if (sn.stageT14 > 0) a *= 0.1;
    a = Math.min(a, sn.maxHp * CAP_HIT);
    sn.win14 = Math.max(0, sn.win14 - (G.t - sn.wt14) * sn.maxHp * WIN); sn.wt14 = G.t;
    const n = typeof livePlayers14 === 'function' ? Math.max(1, livePlayers14().length) : 1;
    if (sn.win14 > sn.maxHp * WIN * (1 + 0.5 * (n - 1))) a *= 0.45;
    sn.win14 += a;
    const line = D.at[sn.stage14 - 1];
    if (line != null && sn.hp - a < sn.maxHp * line) { a = Math.max(0, sn.hp - sn.maxHp * line); sn.stagePend14 = true; }
    return a;
  };
  // the stage card: the boss's own name and colour, how far along the fight is, and a line in its own voice.
  // The banner under it keeps the gameplay hint.
  function announce(sn, D, nm) {
    const total = D.at.length + 1, who = sn.displayName || sn.K.name, col = D.col || '#ffffff';
    const pips = Array.from({ length: total }, (_, i) => (i < sn.stage14 ? '\u25c6' : '\u25c7')).join(' ');
    UI.card(`${who}  ${pips}`, nm[0], nm[2] ? '\u201c' + nm[2] + '\u201d' : '', 'boss stage14', 2.6);
    if (UI.el && UI.el.card) UI.el.card.style.setProperty('--sc', col);
    UI.banner(`Stage ${sn.stage14} of ${total}`, nm[1], 'curse');
    floatText(sn.x, sn.y - sn.headR - 26, nm[0].toUpperCase(), col, true);
    if (sn.kind === 'wals') sn.ph2Said = true;
  }
  function stageUp(sn, room) {
    const D = DEF[sn.kind];
    sn.stage14++; sn.stagePend14 = false; sn.stageT14 = SHIELD;
    const nm = D.names && D.names[sn.stage14 - 2];
    if (nm) announce(sn, D, nm);
    for (let j = G.venom.length - 1; j >= 0; j--) if (!G.venom[j].friendly) G.venom.splice(j, 1);
    if (room.st14) room.st14.length = 0;
    burst(sn.x, sn.y, 34, D.col || sn.K.blood, { min: 80, max: 300, rmin: 1.4, rmax: 3.2, lmin: 0.4, lmax: 0.9, glow: true });
    addP({ kind: 'ring', x: sn.x, y: sn.y, vx: 0, vy: 0, r: sn.headR * 2, life: 0.5, col: D.col || '#ffffff', drag: 0 });
    G.shake = Math.max(G.shake || 0, 10); flashLight(sn.x, sn.y, 240, 1, 0.4);
    for (const k of D.sting || ['roar']) if (typeof Sfx[k] === 'function') Sfx[k]();
    sn.stun = 0;
    if (D.enter) D.enter(sn, room, sn.stage14);
    if (G.run) G.run.stages14 = (G.run.stages14 || 0) + 1;
  }
  const CDS = ['cd', 'spitCd', 'birthCd', 'chargeCd', 'tpCd', 'pearlCd', 'creepCd', 'ringCd', 'diveCd', 'potCd', 'stompCd', 'dashCd', 'adCd', 'beamCd', 'zapCd', 'nadeCd', 'gasCd', 'roleCd', 'spiralCd', 'conCd', 'ashCd', 'slamCd'];
  for (const k in DEF) {
    const a0 = AI[k]; if (!a0) continue;
    const D = DEF[k];
    AI[k] = function (sn, room, dt) {
      if (!sn.isBoss) return a0.call(this, sn, room, dt);
      st0(sn);
      if (!sn.woke14) {
        // no idle start: the first attack comes within about two seconds
        sn.woke14 = true;
        for (const c of CDS) if (typeof sn[c] === 'number' && sn[c] > 2) sn[c] = 1 + (sn[c] - 1) * 0.35;
      }
      const ln = D.at[sn.stage14 - 1];
      if ((sn.stagePend14 || (ln != null && sn.hp < sn.maxHp * ln)) && dt > 0 && sn.dying <= 0) stageUp(sn, room);
      if (sn.stageT14 > 0) sn.stageT14 -= dt;
      const sp = (D.speed ? D.speed[Math.min(D.speed.length, sn.stage14) - 1] : 1) * (sn.monoK14 || 1);
      if (D.tick && dt > 0 && sn.dying <= 0 && G.player && G.player.dying <= 0) safe(() => D.tick(sn, room, dt * sp, sn.stage14));
      return a0.call(this, sn, room, dt * sp);
    };
  }
  // Grub Mother: 64 hp was gone in a breath
  if (KINDS.mother) KINDS.mother.hp = Math.max(KINDS.mother.hp, 80);
  if (KINDS.jaude) KINDS.jaude.hp = Math.max(KINDS.jaude.hp, 90);

  /* ------------------------------------------------------------------ strikes: update once per frame, draw */
  function updateStrikes(dt, room) {
    const L = room.st14; if (!L || !L.length) return;
    if (!fighting10(room)) { L.length = 0; return; }
    for (let i = L.length - 1; i >= 0; i--) {
      const s = L[i]; s.t += dt;
      if (s.t < s.warn) continue;
      L.splice(i, 1);
      for (const Q of livePlayers14()) if (!(Q.dying > 0) && dist(Q.x, Q.y, s.x, s.y) < s.r + Q.r - 4) withPlayer(Q, () => Q.hurt(1, s.x, s.y));
      burst(s.x, s.y, 16, s.col, { min: 50, max: 180, rmin: 1.2, rmax: 2.8, lmin: 0.3, lmax: 0.7, glow: true });
      addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: s.r * 0.6, life: 0.3, col: s.col, drag: 0 });
      if (s.ring) ring(s.x, s.y, s.ring, vs() * 0.6, s.col, rnd(TAU));
      G.shake = Math.max(G.shake || 0, 4); Sfx.thud();
    }
  }
  const ur0 = updateRoom9;
  updateRoom9 = function (dt, room, frozen) {
    ur0(dt, room, frozen);
    if (room && room.st14 && !frozen && dt > 0) safe(() => updateStrikes(dt, room));
  };
  const dv0 = drawVenomBodies;
  drawVenomBodies = function (c, t) {
    dv0(c, t);
    const room = G.room; if (!room) return;
    safe(() => {
      for (const s of room.st14 || []) {
        const u = Math.min(1, s.t / s.warn);
        c.strokeStyle = rgba(s.col, 0.55 + 0.4 * u); c.lineWidth = 2;
        c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.stroke();
        c.fillStyle = rgba(s.col, 0.12 + 0.25 * u); c.beginPath(); c.arc(s.x, s.y, s.r * u, 0, TAU); c.fill();
      }
      for (const sn of room.snakes) if (sn.stageT14 > 0 && sn.alive) {
        const D = DEF[sn.kind], k = sn.stageT14 / SHIELD;
        c.strokeStyle = rgba((D && D.col) || '#ffffff', 0.7 * k); c.lineWidth = 3;
        c.beginPath(); c.arc(sn.x, sn.y, sn.headR + 10 + (1 - k) * 8, 0, TAU); c.stroke();
      }
    });
  };

  Object.assign(window.__bitten || (window.__bitten = {}), { STAGE14: { DEF, strike, CAP_HIT, WIN } });
})();
