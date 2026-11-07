/* src/35-v10-bosses.js: v10 bosses: Demo-TV, Kampioen, Grote Peuk and more. From v10. Lines 18520 to 19031 of the v13.7 script. */
/* =====================================================================
   Version 10 bosses: De Demo-TV, De Kampioen, De Grote Peuk, De
   Tunnelwacht (the guard of the last metro station), De Leegte,
   Het Kelderspook behind a cracked wall, and Jaude
   ===================================================================== */
Object.assign(KINDS, {
  tvboss: {
    boss: true, name: 'De Demo-TV', hp: 210, headR: 20, r0: 15, r1: 12, spacing: 22, maxLen: 9, minLen: 3, bite: 2, speed: 64, turn: 2.6, noMound: true,
    body: '#1a1c22', body2: '#22252c', outline: '#050608', hi: 'rgba(200,220,255,0.15)', blood: '#3a8aff', eye: '#7ad0ff',
  },
  kampioen: {
    boss: true, name: 'De Kampioen', hp: 240, headR: 21, r0: 20, r1: 11, spacing: 12, maxLen: 15, minLen: 6, bite: 2, speed: 70, turn: 2.8,
    body: '#3a5ab8', body2: '#3450a8', outline: '#0a1430', hi: 'rgba(220,235,255,0.3)', gold: '#ffd23a', blood: '#1a2a6a', eye: '#ffffff',
  },
  peuk: {
    boss: true, name: 'De Grote Peuk', hp: 230, headR: 19, r0: 17, r1: 15, spacing: 13, maxLen: 12, minLen: 5, bite: 2, speed: 60, turn: 2.4, fireproof: true,
    body: '#f2f0ea', body2: '#e8e4dc', outline: '#2a2420', hi: 'rgba(255,255,255,0.45)', filter: '#d88a3a', blood: '#6a6a70', eye: '#ff6a2a',
  },
  tunnel: {
    boss: true, name: 'De Tunnelwacht', hp: 300, headR: 20, r0: 18, r1: 10, spacing: 12, maxLen: 16, minLen: 6, bite: 2, speed: 62, turn: 2.6,
    body: '#3a3e34', body2: '#33372e', outline: '#0a0c08', hi: 'rgba(220,230,200,0.18)', blood: '#5a2a1a', eye: '#d8f0ff', strap: '#5a4a2a',
  },
  leegte: {
    boss: true, name: 'De Leegte', hp: 320, headR: 22, r0: 21, r1: 10, spacing: 13, maxLen: 18, minLen: 7, bite: 2, speed: 60, turn: 2.4, underSpeed: 210, eruptDmg: 2, noMound: true,
    body: '#1a1428', body2: '#221a34', outline: '#000000', hi: 'rgba(180,150,255,0.15)', blood: '#7a5aff', eye: '#f2f0ff',
  },
  spook: {
    boss: true, name: 'Het Kelderspook', hp: 120, headR: 16, r0: 14, r1: 4, spacing: 9, maxLen: 12, minLen: 5, bite: 1, speed: 58, turn: 2.6, noMound: true,
    body: '#e8ecf4', body2: '#dce2ec', outline: '#5a6a8a', hi: 'rgba(255,255,255,0.5)', blood: '#a8c8ff', eye: '#1a2a4a',
  },
  jaude: {
    boss: true, name: 'Jaude', hp: 70, headR: 16, r0: 4, r1: 3, spacing: 2, maxLen: 3, minLen: 2, bite: 1, speed: 96, turn: 4, noMound: true,
    body: '#d92a40', body2: '#c92139', outline: '#2b070f', hi: 'rgba(255,255,255,0.4)', blood: '#f2f0ea', eye: '#3a2a1a',
  },
});
Object.assign(BOSS_INFO, {
  tvboss: { title: 'De Demo-TV', sub: 'The display model. It has been switched on for nine years straight.' },
  kampioen: { title: 'De Kampioen', sub: 'Three minutes on the clock. He has never lost a match.' },
  peuk: { title: 'De Grote Peuk', sub: 'Roken is dodelijk. Mostly for you.' },
  tunnel: { title: 'De Tunnelwacht', sub: 'He has guarded the last station for years. He thinks you are a mutant.' },
  leegte: { title: 'De Leegte', sub: 'Do not look down. It is looking up.' },
  spook: { title: 'Het Kelderspook', sub: 'Somebody walled it in down here. It has had a long time to get angry.' },
  jaude: { title: 'Jaude', sub: 'Your sister. Blond and ginger, glasses on, and she was SLEEPING.' },
});
Object.assign(CUSTOM_BOSS9, { tvboss: 1, kampioen: 1, peuk: 1, tunnel: 1, leegte: 1, spook: 1 });
// the boss rush gets every new lair boss, in order of how hard they bite
for (const [k, before] of [['peuk', 'pricewar'], ['tvboss', 'coalition'], ['kampioen', 'manu'], ['tunnel', 'ouro'], ['leegte', 'ender']]) RUSH_ORDER.splice(RUSH_ORDER.indexOf(before), 0, k);
Object.assign(RUSH_SET, { peuk: 'rook', tvboss: 'mega', kampioen: 'arena', tunnel: 'metro', leegte: 'afgrond' });
CHAOS_BOSSES9.push('tvboss', 'kampioen', 'peuk', 'tunnel', 'leegte', 'spook');

/* ------------------------------------------------------------------ starting a boss that is not a floor's lair */
function spawnBoss10(room, kind, entry, label) {
  const P = G.player;
  room.locked = true; room.doorCl = 0;
  Sfx.doorShut();
  const v = DOORV[entry || 's'] || [0, 1];
  const f = nearestFreeCell(room, RW / 2 - v[0] * RW * 0.28, RH / 2 - v[1] * RH * 0.24);
  const boss = new Snake(kind, f.x, f.y, { ang: Math.atan2(P.y - f.y, P.x - f.x) });
  boss.maxHp = boss.hp = boss.K.hp * bossHpK();
  boss.delay = 0.6;
  room.snakes.push(boss);
  G.boss = boss;
  G.run.bossHits0 = G.run.hits || 0;
  Sfx.stinger(); setTimeout(() => { if (G.boss === boss && G.state === 'play') Sfx.roar(); }, 900);
  const info = BOSS_INFO[kind];
  UI.card(label || 'The lair', info.title, info.sub, 'boss', 2.8);
  return boss;
}
// some bosses bring their own room: rails, pits, bushes, screens
const BOSS_TPL10 = {
  tvboss: ['...........', '.&&.....&&.', '...........', '...........', '...........', '...........', '...........', '.&&.....&&.', '...........'],
  kampioen: ['...........', '.*.......*.', '..u.....u..', '....*.*....', '...........', '....*.*....', '..u.....u..', '.*.......*.', '...........'],
  peuk: ['...........', '...........', '..#.....#..', '...........', '...........', '...........', '..#.....#..', '...........', '...........'],
  tunnel: ['...........', '.##.....##.', '.4.......4.', '-----------', '...........', '-----------', '.4.......4.', '.##.....##.', '...........'],
  leegte: ['...........', '...........', '..__...__..', '...........', '....._.....', '...........', '..__...__..', '...........', '...........'],
};
function prepBossRoom10(room, kind, def) {
  const tpl = BOSS_TPL10[kind];
  if (!tpl) return;
  room.build(tpl, def);
  if (kind === 'tunnel') room.theme10 = 'station';
}

/* ------------------------------------------------------------------ De Demo-TV */
BOSS9_INIT.tvboss = (sn) => { sn.mode = 'move'; sn.cd = 2; sn.adCd = 5; sn.beamCd = 4; sn.zapCd = 3; sn.sale = false; sn.cloak = 1; sn.chan = 0; };
AI.tvboss = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5, k = ph2 ? 1.3 : 1, vs = G.levelDef.venomSpeed;
  sn.mt += dt;
  if (ph2 && !sn.sale) {
    sn.sale = true;
    UI.banner('Uitverkoop', 'Everything must go. Even the cables.', 'curse'); Sfx.dingdong();
    for (let i = 0; i < 2; i++) { const c2 = Game.farCell(room, P, new Set()); room.snakes.push(new Snake('stekker', c2.x, c2.y, { emerge: false, spawnTime: 0.5, delay: i * 0.3 })); }
  }
  if (sn.mode === 'zapOut') {
    sn.cloak = Math.max(0.04, 1 - sn.mt / 0.4); sn.chan += dt * 20;
    if (sn.mt > 0.4) {
      let f = null;
      for (let i = 0; i < 12; i++) { const c2 = nearestFreeCell(room, rnd(50, RW - 50), rnd(50, RH - 50)); if (dist(c2.x, c2.y, P.x, P.y) > 160) { f = c2; break; } }
      f = f || nearestFreeCell(room, RW - P.x, RH - P.y);
      teleport10(sn, f.x, f.y); sn.ang = sn.drawAng = Math.atan2(P.y - f.y, P.x - f.x);
      sn.mode = 'zapIn'; sn.mt = 0; Sfx.static10();
    }
    return;
  }
  if (sn.mode === 'zapIn') {
    sn.cloak = Math.min(1, sn.mt / 0.3);
    if (sn.mt > 0.3) {
      sn.cloak = 1;
      const base = Math.atan2(P.y - sn.y, P.x - sn.x), n = ph2 ? 7 : 5;
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - (n - 1) / 2) * 0.2, vs * 1.05, '#7ad0ff'); v.kind = 'pixel10'; v.r = 5; }
      sn.mode = 'move'; sn.mt = 0; Sfx.spit();
    }
    return;
  }
  if (sn.mode === 'beam') { sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.03; if (sn.mt > 1.5) { sn.mode = 'move'; sn.mt = 0; } return; }
  sn.mode = 'move';
  keepAway(sn, room, dt, 150, 270, sn.K.speed * (ph2 ? 1.15 : 1));
  sn.zapCd -= dt * k; sn.adCd -= dt * k; sn.beamCd -= dt * k; sn.cd -= dt * k;
  if (sn.adCd <= 0) { sn.adCd = rnd(9, 11); spawnAds10(room, ph2 ? 4 : 3); }
  else if (sn.beamCd <= 0) { sn.beamCd = rnd(6, 7.5); glare10(room, P, ph2); sn.mode = 'beam'; sn.mt = 0; }
  else if (sn.zapCd <= 0) { sn.zapCd = rnd(4, 5.5); sn.mode = 'zapOut'; sn.mt = 0; Sfx.static10(); }
  else if (sn.cd <= 0 && P.dying <= 0) {
    sn.cd = rnd(1.4, 2);
    const base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < 3; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - 1) * 0.22, vs, '#7ad0ff'); v.kind = 'pixel10'; v.r = 5; }
    Sfx.spit();
  }
};
const AD_TEXTS10 = ['MEGA DEAL', '-70%', 'OP = OP', 'NU OF NOOIT', 'GRATIS*', 'UITVERKOOP', 'KOOP NU', '3 HALEN', '2 BETALEN', 'ALLES MOET WEG'];
function spawnAds10(room, n) {
  const F = fx10(room);
  for (let i = 0; i < n; i++) {
    const w = 70, h = 46;
    F.ads.push({ x: rnd(20, RW - w - 20), y: rnd(20, RH - h - 20), w, h, t: 0, life: 7, hp: 3, shotT: rnd(0.6, 1.2), txt: pick(AD_TEXTS10), col: pick(['#e83a3a', '#ffd23a', '#3a8aff']) });
  }
  Sfx.dingdong();
}
function glare10(room, P, fast) {
  const horiz = Math.random() < 0.5;
  const pos = horiz ? clamp(Math.floor(P.y / T), 0, ROWS - 1) : clamp(Math.floor(P.x / T), 0, COLS - 1);
  fx10(room).warns.push({ beam: true, horiz, pos, w: 1, t: 0, warn: fast ? 0.8 : 1.0, on: 0.45, x: 0, y: 0, r: 0, col: '#e8f4ff', hit: false });
  Sfx.tone(1800, 0.3, { type: 'sine', vol: 0.03 });
}

/* ------------------------------------------------------------------ De Kampioen */
BOSS9_INIT.kampioen = (sn) => { sn.mode = 'move'; sn.cd = 1.6; sn.superM = 0; sn.dashCd = 4; sn.hyper = false; };
AI.kampioen = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.35, vs = G.levelDef.venomSpeed;
  if (ph2 && !sn.hyper) { sn.hyper = true; UI.banner('Hypercharge', 'The Champion is glowing purple. Everything faster.', 'curse'); Sfx.boost(); Sfx.ping(); }
  const k = sn.hyper ? 1.35 : 1;
  sn.mt += dt;
  if (sn.mode !== 'super') sn.superM = Math.min(1, sn.superM + dt * 0.05 * (sn.hyper ? 2 : 1));
  if (sn.mode === 'super') {
    const L = sn.jump;
    if (sn.mt < 1.0) { sn.drawAng = sn.ang + Math.sin(sn.mt * 40) * 0.06; sn.mouth = 1; return; }
    const u = Math.min(1, (sn.mt - 1.0) / 0.55);
    sn.air9 = Math.sin(u * Math.PI); sn.moveTo(lerp(L.x0, L.x1, u), lerp(L.y0, L.y1, u));
    if (u >= 1) {
      sn.air9 = 0; sn.superM = 0; sn.mode = 'move'; sn.mt = 0;
      if (P.dying <= 0 && dist(P.x, P.y, sn.x, sn.y) < 70) P.hurt(2, sn.x, sn.y, sn);
      const n = sn.hyper ? 20 : 16, off = rnd(TAU);
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, vs * 0.85, '#ffd23a'); v.kind = 'rocket10'; v.r = 5.5; }
      G.shake = Math.max(G.shake, 11); Sfx.boom(true); flashLight(sn.x, sn.y, 180, 1, 0.5);
      ring10(sn.x, sn.y, 24, '#ffd23a', 0.5);
      floatText(sn.x, sn.y - 40, 'SUPER', '#ffd23a', true);
    }
    return;
  }
  if (sn.mode === 'dash') { const r = chargeStep(sn, room, dt, 330 * k, 0.6); if (r) { sn.mode = 'move'; sn.mt = 0; } return; }
  sn.mode = 'move';
  const { d } = keepAway(sn, room, dt, 140, 250, sn.K.speed * k);
  sn.cd -= dt * k; sn.dashCd -= dt * k;
  if (sn.superM >= 1 && P.dying <= 0) {
    sn.mode = 'super'; sn.mt = 0;
    const tx = clamp(P.x, 40, RW - 40), ty = clamp(P.y, 40, RH - 40);
    sn.jump = { x0: sn.x, y0: sn.y, x1: tx, y1: ty };
    warn10(room, tx, ty, 70, 1.55, null, '#ffd23a');
    floatText(sn.x, sn.y - 40, 'SUPER!', '#ffd23a', true); Sfx.charge();
  } else if (sn.dashCd <= 0 && d > 110 && d < 300) {
    sn.dashCd = rnd(4, 5.5); sn.mode = 'dash'; sn.mt = 0; sn.chargeAng = sn.ang = Math.atan2(P.y - sn.y, P.x - sn.x); Sfx.boost();
  } else if (sn.cd <= 0 && P.dying <= 0) {
    sn.cd = rnd(1.3, 1.8);
    const base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < 3; i++) { const v = spawnVenom(sn.x + Math.cos(base) * sn.headR, sn.y + Math.sin(base) * sn.headR, base + (i - 1) * 0.18, vs * 1.15, '#ffd23a'); v.kind = 'shell10'; v.r = 5; }
    sn.superM = Math.min(1, sn.superM + 0.08); sn.mouth = 1; Sfx.spit();
  }
};

/* ------------------------------------------------------------------ De Grote Peuk */
BOSS9_INIT.peuk = (sn) => { sn.mode = 'move'; sn.ringCd = 3; sn.ashCd = 6; sn.coughAt = sn.maxHp * 0.75; sn.trailT = 0; sn.rings = 0; sn.ringT = 0; };
AI.peuk = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.4, vs = G.levelDef.venomSpeed;
  sn.mt += dt;
  if (sn.mode === 'cough') {
    sn.drawAng = sn.ang + Math.sin(sn.mt * 35) * 0.12;
    if (Math.random() < dt * 12) addP({ kind: 'dot', x: sn.x + rnd(-10, 10), y: sn.y + rnd(-10, 10), vx: rnd(-30, 30), vy: rnd(-50, -20), r: rnd(3, 6), life: 0.9, col: '#9a9aa2', drag: 1.5 });
    if (sn.mt > 2.2) { sn.mode = 'move'; sn.mt = 0; }
    return;
  }
  if (sn.hp < sn.coughAt && sn.hp > 0) {
    sn.coughAt -= sn.maxHp * 0.25; sn.mode = 'cough'; sn.mt = 0;
    floatText(sn.x, sn.y - 36, 'KUCH KUCH', '#d8d8e0', true); Sfx.cough10(); Sfx.cough10();
    return;
  }
  sn.mode = 'move'; sn.wig += dt * 2;
  const toP = Math.atan2(P.y - sn.y, P.x - sn.x);
  steerMove(sn, room, toP + Math.sin(sn.wig) * 0.8, sn.K.speed * (ph2 ? 1.2 : 1), sn.K.turn, dt);
  sn.trailT -= dt;
  if (sn.trailT <= 0) { sn.trailT = ph2 ? 0.35 : 0.5; addFire(room, sn.x, sn.y, 14, 3.4, true); }
  sn.ringCd -= dt; sn.ashCd -= dt;
  if (sn.ringCd <= 0) { sn.ringCd = ph2 ? 2.6 : 3.4; sn.rings = 3; sn.ringT = 0; Sfx.puff(); }
  if (sn.rings > 0) {
    sn.ringT -= dt;
    if (sn.ringT <= 0) {
      sn.ringT = 0.35; sn.rings--;
      const n = 12, off = rnd(TAU);
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, vs * 0.5, '#8a8a92'); v.kind = 'smoke'; v.r = 7; v.life = 2.6; }
    }
  }
  if (sn.ashCd <= 0) {
    sn.ashCd = ph2 ? 5 : 7;
    const n = ph2 ? 8 : 6;
    for (let i = 0; i < n; i++) {
      const a = rnd(TAU), r = i === 0 ? 0 : rnd(30, 130);
      const x = clamp(P.x + Math.cos(a) * r, 16, RW - 16), y = clamp(P.y + Math.sin(a) * r, 16, RH - 16);
      warn10(room, x, y, 20, 0.9 + i * 0.12, (w) => {
        const Q = G.player;
        if (Q.dying <= 0 && dist(Q.x, Q.y, w.x, w.y) < w.r + Q.r * 0.4 && !Q.gasmask) Q.hurt(1, w.x, w.y);
        addFire(room, w.x, w.y, 12, 2, true);
        burst(w.x, w.y, 8, '#ff8a3a', { min: 30, max: 100, lmin: 0.3, lmax: 0.6, glow: true });
      }, '#ff8a3a', { ash: true });
    }
    floatText(sn.x, sn.y - 36, 'TIK TIK', '#ff8a3a'); Sfx.hiss(1);
  }
};
HURT10.peuk = (sn, amount) => (sn.mode === 'cough' ? amount * 1.6 : amount);

/* ------------------------------------------------------------------ De Tunnelwacht */
BOSS9_INIT.tunnel = (sn) => { sn.mode = 'move'; sn.cd = 2; sn.nadeCd = 5; sn.cartCd = 7; sn.gasCd = 3; sn.mutCd = 5; sn.phase = 0; sn.burst = 0; sn.burstT = 0; };
AI.tunnel = function (sn, room, dt) {
  const P = G.player, f = sn.hp / sn.maxHp, vs = G.levelDef.venomSpeed;
  const ph = f > 0.6 ? 0 : f > 0.3 ? 1 : 2;
  if (ph !== sn.phase) {
    sn.phase = ph; Sfx.roar();
    if (ph === 1) UI.banner('Gas', 'He pulls his mask down. The tunnel fills up.', 'curse');
    if (ph === 2) { UI.banner('Lights out', 'The station lamp dies. Only his headlamp is left.', 'curse'); room.lightsOut10 = true; }
  }
  sn.mt += dt;
  if (sn.mode === 'aim') {
    const toP = Math.atan2(P.y + P.vy * 0.15 - sn.y, P.x + P.vx * 0.15 - sn.x);
    sn.ang = turnToward(sn.ang, toP, 4 * dt); sn.drawAng = sn.ang;
    sn.burstT -= dt;
    if (sn.burstT <= 0 && sn.burst > 0) {
      sn.burst--; sn.burstT = 0.12;
      const mx = sn.x + Math.cos(sn.ang) * (sn.headR + 14) - Math.sin(sn.ang) * 9, my = sn.y + Math.sin(sn.ang) * (sn.headR + 14) + Math.cos(sn.ang) * 9;
      const v = spawnVenom(mx, my, sn.ang + rnd(-0.05, 0.05), vs * 1.6, '#d8d0b8'); v.kind = 'bearing10'; v.r = 4; v.life = 2.2;
      flashLight(mx, my, 60, 0.7, 0.1); Sfx.tone(260, 0.05, { to: 120, type: 'square', vol: 0.05, lp: 1500 });
    }
    if (sn.burst <= 0 && sn.burstT <= 0) { sn.mode = 'move'; sn.mt = 0; sn.cd = rnd(1.6, 2.2) - ph * 0.3; }
    return;
  }
  sn.mode = 'move';
  keepAway(sn, room, dt, 150, 280, sn.K.speed * (1 + ph * 0.1));
  sn.cd -= dt; sn.nadeCd -= dt; sn.cartCd -= dt; sn.gasCd -= dt; sn.mutCd -= dt;
  if (sn.nadeCd <= 0 && P.dying <= 0) {
    sn.nadeCd = rnd(5, 6.5) - ph;
    const tx = clamp(P.x + P.vx * 0.5, 20, RW - 20), ty = clamp(P.y + P.vy * 0.5, 20, RH - 20);
    lob10(room, sn.x, sn.y, tx, ty, 0.9, 'nade', (l) => {
      explode(room, l.x1, l.y1, 46, { dmg: 1, snakeDmg: 3, src: sn });
      crater10(room, l.x1, l.y1, 6);
    }, { r: 46 });
    Sfx.hiss(0.6);
  } else if (sn.cartCd <= 0) { sn.cartCd = rnd(8, 10) - ph; draisine10(room); }
  else if (ph >= 1 && sn.gasCd <= 0) {
    sn.gasCd = rnd(5.5, 7.5);
    const a = rnd(TAU), x = clamp(P.x + Math.cos(a) * rnd(40, 120), 40, RW - 40), y = clamp(P.y + Math.sin(a) * rnd(40, 100), 40, RH - 40);
    fx10(room).zones.push({ kind: 'gas', x, y, r: 10, rMax: 50, t: 0, life: 9, vx: rnd(-10, 10), vy: rnd(-10, 10), tick: 0.6 });
    Sfx.noise(0.8, { filter: 'bandpass', f: 900, fTo: 300, q: 0.8, vol: 0.06 });
  } else if (ph >= 2 && sn.mutCd <= 0) {
    sn.mutCd = 9;
    if (countKind(room, 'mutant') < 4) for (let i = 0; i < 3; i++) { const c2 = Game.farCell(room, P, new Set()); room.snakes.push(new Snake('mutant', c2.x, c2.y, { emerge: true, spawnTime: 0.6, delay: i * 0.25 })); }
  } else if (sn.cd <= 0 && P.dying <= 0 && clearLine(room, sn.x, sn.y, P.x, P.y)) {
    sn.mode = 'aim'; sn.mt = 0; sn.burst = ph >= 2 ? 5 : 3; sn.burstT = 0.4; Sfx.charge();
  }
};
// a rail cart comes through: watch the rails light up, then get off them
function draisine10(room) {
  const rails = railRows10(room);
  const row = rails.length ? pick(rails) : clamp(Math.floor(G.player.y / T), 1, ROWS - 2);
  fx10(room).carts.push({ row, dir: Math.random() < 0.5 ? 1 : -1, t: 0, warn: 1.1, x: null, hit: new Set() });
  Sfx.bell10();
}
function railRows10(room) { return room.rails10 ? [...new Set(room.rails10.map((r) => r.r))] : []; }

/* ------------------------------------------------------------------ De Leegte */
BOSS9_INIT.leegte = (sn) => { sn.mode = 'move'; sn.cd = 2.5; sn.diveCd = 4; sn.slamCd = 6.5; sn.pullCd = 9; };
function pitEdges10(room) {
  const out = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const o = room.tiles[r][c];
    if (!o || o.type !== 'pit') continue;
    for (const d of DIR4) { const nc = c + d[0], nr = r + d[1]; if (!room.solid(nc, nr)) out.push({ c: nc, r: nr, x: (nc + 0.5) * T, y: (nr + 0.5) * T, px: o.x, py: o.y }); }
  }
  return out;
}
AI.leegte = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5, vs = G.levelDef.venomSpeed;
  sn.mt += dt;
  if (sn.mode === 'sink') {
    const e = sn.edge;
    steerMove(sn, room, Math.atan2(e.y - sn.y, e.x - sn.x), sn.K.speed * 1.4, 4, dt);
    if (dist(sn.x, sn.y, e.x, e.y) < 12 || sn.mt > 3) {
      sn.dive(); sn.mode = 'deep'; sn.mt = 0;
      const edges = pitEdges10(room);
      let best = null, bd = 1e12;
      for (const q of edges) { const d2 = dist2(q.x, q.y, P.x, P.y); if (d2 < bd && d2 > 40 * 40) { bd = d2; best = q; } }
      sn.rise = best || { x: P.x, y: P.y, px: P.x, py: P.y };
      ring10(e.px, e.py, 14, '#7a5aff', 0.6);
    }
    return;
  }
  if (sn.mode === 'deep') {
    const e = sn.rise;
    sn.ang = turnToward(sn.ang, Math.atan2(e.y - sn.y, e.x - sn.x), 4 * dt); sn.drawAng = sn.ang;
    sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * sn.K.underSpeed * dt, 22, RW - 22), clamp(sn.y + Math.sin(sn.ang) * sn.K.underSpeed * dt, 22, RH - 22));
    if (dist(sn.x, sn.y, e.x, e.y) < 14 || sn.mt > 2.6) { sn.mode = 'warn'; sn.mt = 0; Sfx.rumble(); }
    return;
  }
  if (sn.mode === 'warn') {
    if (sn.mt > (ph2 ? 0.45 : 0.6)) {
      sn.erupt(room);
      const n = ph2 ? 14 : 10, off = rnd(TAU), e = sn.rise;
      for (let i = 0; i < n; i++) { const v = spawnVenom(e.px, e.py, off + (i / n) * TAU, vs * 0.75, '#9a7aff'); v.kind = 'void10'; v.r = 6; }
      sn.mode = 'move'; sn.mt = 0;
    }
    return;
  }
  if (sn.mode === 'slam') {
    sn.lift = Math.min(1, sn.mt / 0.7); sn.drawAng = sn.ang + Math.sin(sn.mt * 30) * 0.05;
    if (sn.mt > 0.7) {
      sn.lift = 0; sn.mode = 'move'; sn.mt = 0; G.shake = Math.max(G.shake, 8); Sfx.thud();
      const n = ph2 ? 4 : 3;
      for (let i = 0; i < n; i++) {
        const a = rnd(TAU), r = i === 0 ? 0 : rnd(40, 110);
        const x = clamp(P.x + Math.cos(a) * r, 30, RW - 30), y = clamp(P.y + Math.sin(a) * r, 30, RH - 30);
        warn10(room, (Math.floor(x / T) + 0.5) * T, (Math.floor(y / T) + 0.5) * T, 22, 1.0 + i * 0.15, (w) => { if (countPits10(room) < 16) crater10(room, w.x, w.y, 16); }, '#9a7aff', { square: true });
      }
    }
    return;
  }
  if (sn.mode === 'pull') {
    sn.drawAng = sn.ang = Math.atan2(P.y - sn.y, P.x - sn.x); sn.mouth = 1;
    if (P.dying <= 0 && !P.dashT) {
      const a = Math.atan2(sn.y - P.y, sn.x - P.x), str = 62;
      let nx = P.x + Math.cos(a) * str * dt, ny = P.y + Math.sin(a) * str * dt;
      [nx, ny] = P.flyer ? resolveFly10(room, nx, ny, P.r) : resolveTiles(room, nx, ny, P.r);
      P.x = nx; P.y = ny;
    }
    sn.pullShot = (sn.pullShot || 0) - dt;
    if (sn.pullShot <= 0) { sn.pullShot = 0.5; const v = spawnVenom(sn.x, sn.y, sn.ang + rnd(-0.4, 0.4), vs * 0.6, '#9a7aff'); v.kind = 'void10'; v.r = 6; }
    if (Math.random() < dt * 30) { const a = rnd(TAU), r = rnd(60, 140); addP({ kind: 'dot', x: sn.x + Math.cos(a) * r, y: sn.y + Math.sin(a) * r, vx: -Math.cos(a) * 120, vy: -Math.sin(a) * 120, r: rnd(1, 2), life: 0.6, col: '#b09aff', glow: true, drag: 0 }); }
    if (sn.mt > 2.2) { sn.mode = 'move'; sn.mt = 0; }
    return;
  }
  sn.mode = 'move';
  keepAway(sn, room, dt, 130, 240, sn.K.speed * (ph2 ? 1.2 : 1));
  sn.cd -= dt; sn.diveCd -= dt; sn.slamCd -= dt; sn.pullCd -= dt;
  const edges = sn.diveCd <= 0 ? pitEdges10(room) : null;
  if (edges && edges.length) {
    sn.diveCd = rnd(4.5, 6) - (ph2 ? 1 : 0);
    let best = null, bd = 1e12;
    for (const q of edges) { const d2 = dist2(q.x, q.y, sn.x, sn.y); if (d2 < bd) { bd = d2; best = q; } }
    sn.edge = best; sn.mode = 'sink'; sn.mt = 0;
  } else if (sn.slamCd <= 0 && P.dying <= 0) { sn.slamCd = rnd(6, 7.5); sn.mode = 'slam'; sn.mt = 0; Sfx.hiss(1.2); }
  else if (sn.pullCd <= 0 && P.dying <= 0) { sn.pullCd = rnd(9, 11); sn.mode = 'pull'; sn.mt = 0; floatText(sn.x, sn.y - 40, 'KIJK NIET NAAR BENEDEN', '#b09aff', true); Sfx.warp(); }
  else if (sn.cd <= 0 && P.dying <= 0) {
    sn.cd = rnd(1.6, 2.2) * (ph2 ? 0.8 : 1);
    const base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < 5; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - 2) * 0.24, vs * 0.85, '#9a7aff'); v.kind = 'void10'; v.r = 6; }
    sn.mouth = 1; Sfx.spit();
  }
};
function countPits10(room) { let n = 0; for (const o of room.obs) if (o.type === 'pit') n++; return n; }

/* ------------------------------------------------------------------ Het Kelderspook */
BOSS9_INIT.spook = (sn) => { sn.mode = 'float'; sn.cd = 2; sn.potCd = 2.5; sn.fadeCd = 5; sn.cloak = 1; };
AI.spook = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5, vs = G.levelDef.venomSpeed;
  sn.mt += dt; sn.wig += dt * 2;
  sn.air9 = sn.mode === 'fade' ? 1 : 0;
  if (sn.mode === 'fade') {
    sn.cloak = Math.max(0.06, 1 - sn.mt / 0.5);
    const tx = P.x - P.aimX * 70, ty = P.y - P.aimY * 70, a = Math.atan2(ty - sn.y, tx - sn.x);
    sn.ang = turnToward(sn.ang, a, 4 * dt); sn.drawAng = sn.ang;
    sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * 150 * dt, 18, RW - 18), clamp(sn.y + Math.sin(sn.ang) * 150 * dt, 18, RH - 18));
    if (sn.mt > 2) { sn.mode = 'boo'; sn.mt = 0; }
    return;
  }
  if (sn.mode === 'boo') {
    sn.cloak = Math.min(1, sn.mt / 0.25);
    if (sn.mt > 0.3) {
      floatText(sn.x, sn.y - 30, 'BOO', '#e8ecf4', true); Sfx.boo10();
      const n = ph2 ? 14 : 12, off = rnd(TAU);
      for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / n) * TAU, vs * 0.7, '#a8c8ff'); v.kind = 'ecto10'; v.r = 6; }
      sn.mode = 'float'; sn.mt = 0; sn.cloak = 1;
    }
    return;
  }
  sn.mode = 'float';
  // it floats straight through rocks and walls
  const a = Math.atan2(P.y - sn.y, P.x - sn.x) + Math.sin(sn.wig) * 0.7;
  sn.ang = turnToward(sn.ang, a, sn.K.turn * dt); sn.drawAng = sn.ang;
  sn.moveTo(clamp(sn.x + Math.cos(sn.ang) * sn.K.speed * (ph2 ? 1.2 : 1) * dt, 18, RW - 18), clamp(sn.y + Math.sin(sn.ang) * sn.K.speed * (ph2 ? 1.2 : 1) * dt, 18, RH - 18));
  sn.potCd -= dt; sn.fadeCd -= dt; sn.cd -= dt;
  if (sn.potCd <= 0) {
    sn.potCd = ph2 ? 2 : 2.8;
    const pots = shuffle(room.obs.filter((o) => o.type === 'urn' || o.type === 'egg' || o.type === 'gold'));
    const n = Math.min(pots.length, ph2 ? 2 : 1);
    for (let i = 0; i < n; i++) {
      const o = pots[i];
      room.removeObstacle(o); o.broken = true; room.dirty = true;
      const v = spawnVenom(o.x, o.y, Math.atan2(P.y - o.y, P.x - o.x), vs * 1.05, '#c8a070'); v.kind = 'pot10'; v.r = 9; v.spin = rnd(TAU); v.t = -0.45; v.vx0 = v.vx; v.vy0 = v.vy; v.vx = 0; v.vy = 0; v.rise10 = true;
    }
    if (n) Sfx.whoosh10();
    else { const base = Math.atan2(P.y - sn.y, P.x - sn.x); for (let i = 0; i < 3; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - 1) * 0.3, vs * 0.8, '#a8c8ff'); v.kind = 'ecto10'; v.r = 6; } }
  } else if (sn.fadeCd <= 0) { sn.fadeCd = rnd(6, 8); sn.mode = 'fade'; sn.mt = 0; Sfx.whoosh10(); }
  else if (sn.cd <= 0 && P.dying <= 0) {
    sn.cd = rnd(2, 2.6);
    const base = Math.atan2(P.y - sn.y, P.x - sn.x), n = ph2 ? 5 : 3;
    for (let i = 0; i < n; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - (n - 1) / 2) * 0.3, vs * 0.8, '#a8c8ff'); v.kind = 'ecto10'; v.r = 6; }
  }
};
HURT10.spook = (sn, amount) => (sn.mode === 'fade' ? amount * 0.15 : amount);

/* ------------------------------------------------------------------ Jaude */
BOSS9_INIT.jaude = (sn) => { sn.mode = 'move'; sn.cd = 1.4; sn.stompCd = 3.5; sn.clockCd = 6; sn.slamCd = 8; };
AI.jaude = function (sn, room, dt) {
  const P = G.player, ph2 = sn.hp < sn.maxHp * 0.5, vs = G.levelDef.venomSpeed;
  sn.mt += dt;
  if (sn.mode === 'stomp') {
    const L = sn.jump, u = Math.min(1, sn.mt / 0.75);
    sn.air9 = Math.sin(u * Math.PI); sn.moveTo(lerp(L.x0, L.x1, u), lerp(L.y0, L.y1, u));
    if (u >= 1) {
      sn.air9 = 0; sn.mode = 'move'; sn.mt = 0;
      if (P.dying <= 0 && dist(P.x, P.y, sn.x, sn.y) < 52) P.hurt(1, sn.x, sn.y, sn);
      const off = rnd(TAU);
      for (let i = 0; i < 8; i++) { const v = spawnVenom(sn.x, sn.y, off + (i / 8) * TAU, vs * 0.7, '#f2f0ea'); v.kind = 'feather10'; v.r = 5; v.spin = rnd(TAU); }
      G.shake = Math.max(G.shake, 8); Sfx.thud();
    }
    return;
  }
  sn.mode = 'move';
  keepAway(sn, room, dt, 90, 180, sn.K.speed * (ph2 ? 1.2 : 1));
  sn.cd -= dt; sn.stompCd -= dt; sn.clockCd -= dt; sn.slamCd -= dt;
  if (sn.stompCd <= 0 && P.dying <= 0) {
    sn.stompCd = rnd(4, 5.5) - (ph2 ? 1 : 0); sn.mode = 'stomp'; sn.mt = 0;
    const tx = clamp(P.x, 30, RW - 30), ty = clamp(P.y, 30, RH - 30);
    sn.jump = { x0: sn.x, y0: sn.y, x1: tx, y1: ty };
    warn10(room, tx, ty, 52, 0.75, null, '#ff8ab0');
    floatText(sn.x, sn.y - 34, pick(['SSST', 'STIL NOU', 'IK SLAAP']), '#ff8ab0', true);
  } else if (sn.clockCd <= 0 && P.dying <= 0) {
    sn.clockCd = rnd(6, 7.5);
    const tx = clamp(P.x + P.vx * 0.4, 20, RW - 20), ty = clamp(P.y + P.vy * 0.4, 20, RH - 20);
    lob10(room, sn.x, sn.y, tx, ty, 0.8, 'clock', (l) => {
      warn10(room, l.x1, l.y1, 30, 1.0, (w) => {
        const off = rnd(TAU);
        for (let i = 0; i < 10; i++) { const v = spawnVenom(w.x, w.y, off + (i / 10) * TAU, vs * 0.7, '#ffd27a'); v.kind = 'note'; v.r = 5; }
        Sfx.bell(); burst(w.x, w.y, 10, '#ffd27a', { min: 30, max: 100, lmin: 0.3, lmax: 0.6, glow: true });
      }, '#ffd27a', { clock: true });
      Sfx.tone(2200, 0.06, { type: 'square', vol: 0.03, lp: 3000 });
    }, { r: 30 });
  } else if (sn.slamCd <= 0) {
    sn.slamCd = rnd(7, 9);
    G.shake = Math.max(G.shake, 9); Sfx.doorShut(); Sfx.thud();
    floatText(sn.x, sn.y - 34, 'BAM', '#ff8ab0', true);
    for (let i = 0; i < 6; i++) {
      const side = rndi(0, 3), x = side < 2 ? rnd(20, RW - 20) : side === 2 ? 6 : RW - 6, y = side >= 2 ? rnd(20, RH - 20) : side === 0 ? 6 : RH - 6;
      const v = spawnVenom(x, y, Math.atan2(RH / 2 - y, RW / 2 - x) + rnd(-0.4, 0.4), vs * 0.75, '#a89070'); v.kind = 'debris'; v.spin = rnd(TAU);
    }
  } else if (sn.cd <= 0 && P.dying <= 0) {
    sn.cd = rnd(1.4, 2) * (ph2 ? 0.8 : 1);
    const base = Math.atan2(P.y - sn.y, P.x - sn.x);
    for (let i = 0; i < 3; i++) { const v = spawnVenom(sn.x, sn.y, base + (i - 1) * 0.3, vs * 0.95, '#f2f0ea'); v.kind = 'pillow10'; v.r = 9; v.spin = rnd(TAU); }
    Sfx.paper();
  }
};
// she does not fall apart: she sits down, sulks, and goes back to bed
{
  const ud0 = Snake.prototype.updateDying;
  Snake.prototype.updateDying = function (dt, room) {
    if (this.kind !== 'jaude') return ud0.call(this, dt, room);
    this.dying += dt; this.mouth = 1; this.drawAng = this.ang;
    if (this.dying > 1.4) { this.alive = false; G.run.kills++; Sfx.bossDie(); Game.onBossDead(this); }
    this.computeBody();
  };
}

/* ------------------------------------------------------------------ bosses that die take their mess with them */
{
  const bd0 = bossDead9;
  bossDead9 = function (b) {
    bd0(b);
    const room = G.room; if (!room) return;
    const F = fx10(room);
    if (b.kind === 'tvboss') F.ads.length = 0;
    if (b.kind === 'tunnel') { F.zones = F.zones.filter((z) => z.kind !== 'gas'); room.lightsOut10 = false; }
    F.warns = F.warns.filter((w) => !w.beam);
    const P = G.player;
    if (P && P.beker && b.kind !== 'pwblue' && b.kind !== 'pwyellow' && b.kind !== 'party') { P.bekerN++; P.maxHp = Math.min(16, P.maxHp + 1); P.heal(1); floatText(P.x, P.y - 40, 'KAMPIOEN', '#ffd23a', true); }
  };
}

