/* src/52-v1010-powerups.js: v10.10: 16 powerups, 5 curses, 4 downgrades. From v10.10. Lines 23184 to 23907 of the v13.7 script. */
/* ===== v10.10: 16 new powerups, 5 curses, 4 downgrades, 4 achievements =====
   Themes: candy shells, the endless vertical feed, ego, looking back at yourself,
   the chameleon, and an egg that sat on a wall. Clash rules for every overlap. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { console.error(e); return fb; } };

  /* ------------------------------------------------------------------ the powerups */
  const NEW = {
    linzen: { w: 0.9, name: 'Chocolinzen', desc: 'Every seed gets a random candy shell: red burns, blue chills, green poisons, yellow stuns, orange splashes, brown hits 50% harder.', apply(p) { p.linzen11 = true; } },
    snoepzak: { w: 0.85, name: 'Zakje Snoep', desc: '1 in 4 kills drops candy. Each one: shoot 3% faster, up to 30%, until the next floor.', apply(p) { p.snoep11 = true; } },
    doomscroll: { w: 0.85, name: 'Doomscroll', desc: 'Every 8 seconds in a fight, a random boost: fire rate, speed, damage or homing.', apply(p) { p.doom11 = true; p.clipT11 = 0; p.clip11 = null; } },
    viral: { w: 0.85, name: 'Viral', desc: 'Hits are 1 view, kills 5. At 60 views every snake takes 3x your damage and freezes.', apply(p) { p.viral11 = true; p.views11 = 0; } },
    reeks: { w: 0.9, name: 'Streak', desc: 'Every room in a row without a bite: 4% more damage, 2% faster shots, up to 10 rooms. A bite resets it.', apply(p) { p.reeks11 = true; } },
    duet: { w: 0.8, name: 'Duet', desc: 'A mirrored copy of you fires along at half damage.', apply(p) { p.duet11 = { x: RW - p.x, y: p.y }; } },
    selfie: { w: 0.85, name: 'Selfie', desc: 'Every 9 seconds in a fight, a flash stops snakes in front of you from biting. 3 or more in frame heals half an apple, once per room.', apply(p) { p.selfie11 = true; p.selfieT11 = 4; } },
    dagboek: { w: 0.85, name: 'Dagboek', desc: 'Snake types that bit you this run take 25% more damage from you.', apply(p) { p.dagboek11 = true; } },
    reflectie: { w: 0.85, name: 'Reflectie', desc: 'Seeds bounce off walls once and hit 30% harder after the bounce.', apply(p) { p.refl11 = true; p.bounce = Math.max(p.bounce, 1); } },
    kamhuid: { w: 0.85, name: 'Kameleonhuid', desc: 'Stand still 0.5 seconds to blend in for up to 3 seconds: snakes cannot bite. First shot out hits 60% harder.', apply(p) { p.kamhuid11 = true; } },
    kamtong: { w: 0.85, name: 'Kameleontong', desc: 'Every 5th shot your tongue pulls the first snake in line closer and hits it for double damage.', apply(p) { p.kamtong11 = true; p.tongN11 = 0; } },
    kleurwissel: { w: 0.85, name: 'Kleurwissel', desc: 'New color every room. Red: damage. Blue: fire rate. Yellow: speed. Green: heal half an apple on clear.', apply(p) { p.kleur11 = true; p.color11 = -1; } },
    eierschaal: { w: 0.85, name: 'Eierschaal', desc: '20% more damage while the shell is whole. Bites crack it, the 3rd breaks it for the room and the shards cut nearby snakes.', apply(p) { p.egg11 = true; p.cracks11 = 0; } },
    // legendaries
    hoofdpersoon: { rare: true, lock: 'spotlight11', name: 'Main Character', desc: 'At full health: seeds hit 40% harder, are bigger and glow. Walk 10% faster.', apply(p) { p.hoofd11 = true; } },
    terugblik: { rare: true, lock: 'diary11', name: 'Terugblik', desc: 'Once per room, the first bite is undone: you rewind 1.5 seconds.', apply(p) { p.terug11 = true; p.terugUsed11 = false; } },
    grotevala: { rare: true, lock: 'greatfall11', name: 'De Grote Val', desc: 'Once per run, a killing bite shatters you: every snake takes 8x your damage, you come back with two apples.', apply(p) { p.val11 = true; p.valUsed11 = false; } },
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  Object.assign(SELL, { linzen: 6, snoepzak: 5, doomscroll: 6, viral: 6, reeks: 6, duet: 6, selfie: 5, dagboek: 5, reflectie: 5, kamhuid: 5, kamtong: 5, kleurwissel: 5, eierschaal: 5, hoofdpersoon: 13, terugblik: 12, grotevala: 12 });
  Object.assign(ITEM_THREAT, { linzen: 4, snoepzak: 3, doomscroll: 4, viral: 4.5, reeks: 3.5, duet: 4.5, selfie: 3, dagboek: 3, reflectie: 2.5, kamhuid: 2.5, kamtong: 3, kleurwissel: 3, eierschaal: 3, hoofdpersoon: 6, terugblik: 4, grotevala: 4 });
  for (const k of ['clipT11', 'clip11', 'views11', 'selfieT11', 'selfieHeal11', 'diary11', 'camo11', 'camoT11', 'camoCd11', 'camoShot11', 'tongN11', 'tongue11', 'color11',
    'cracks11', 'candyN11', 'terugUsed11', 'hist11', 'histT11', 'valUsed11', 'narcT11', 'sugarT11', 'crash11']) SELL_SKIP.add(k);

  /* ------------------------------------------------------------------ curses and downgrades */
  const NEW_CURSES = {
    narcist: { curse: true, name: 'Narcist', desc: 'Seeds hit 45% harder. Every 10 seconds in a fight you stop for a moment to admire yourself. Mirror time.', mod: { dmg: 1.45 }, flag: 'narcist' },
    aandacht: { curse: true, name: 'Aandachtsspanne', desc: 'You shoot 33% faster. Seeds fly 30% less far. Short attention, short range.', mod: { rate: 0.75, range: 0.7 } },
    wankelei: { curse: true, name: 'Wankel Ei', desc: 'Seeds hit 50% harder. Every bite knocks you over and you cannot move for a moment. Hard hits, soft legs.', mod: { dmg: 1.5 }, flag: 'wobbly' },
    schutkleur: { curse: true, name: 'Schutkleur', desc: '1 in 4 bites or spit misses you. Your see through seeds fly 15% slower and 12% less far. Hidden, not fast.', mod: { shot: 0.85, range: 0.88 }, flag: 'camo11' },
    suiker: { curse: true, name: 'Suikerverslaving', desc: 'You shoot a third faster. Every 25 seconds in a fight without healing you crash: 5 seconds of slow shots and slow feet. Sugar high, then the floor.', mod: { rate: 0.75 }, flag: 'sugar' },
  };
  for (const id in NEW_CURSES) { CURSES[id] = NEW_CURSES[id]; CURSE_IDS.push(id); }
  const NEW_DOWNS = {
    schermtijd: { down: true, name: 'Schermtijd', desc: 'Your light reaches 15% less far and seeds fly a little slower. Dim and slow.', mod: { light: 0.85, shot: 0.93 } },
    kraakje: { down: true, name: 'Kraakje', desc: 'Seeds are 6% softer and 6% smaller. Barely visible. Still there.', mod: { dmg: 0.94, size: 0.94 } },
    geenlikes: { down: true, name: '0 Likes', desc: '1 coin in 4 that a snake drops never shows up. No likes, no coins.', flag: 'nolikes' },
    verkleurd: { down: true, name: 'Verkleurd', desc: 'Your aim wobbles a little and seeds fly 5% slower. Looks sick.', mod: { wobble: 0.07, shot: 0.95 } },
  };
  for (const id in NEW_DOWNS) { DOWNS[id] = NEW_DOWNS[id]; DOWN_IDS.push(id); }


  /* ------------------------------------------------------------------ achievements */
  if (!STAT_DEFS.some((s) => s[0] === 'bitten11')) STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['bitten11', 'Times bitten'], ['virals11', 'Times gone viral'], ['halfapple11', 'Half-apple survivals']);
  const NEW_ACHS = [
    { id: 'spotlight11', reward: 'reeks', name: 'Spotlight', desc: 'Clear 8 rooms in a row without a bite.', stat: 'streak', goal: 8 },
    { id: 'greatfall11', reward: 'eierschaal', name: 'Great Fall', desc: 'Get bitten down to half an apple and live, 10 times.', stat: 'halfapple11', goal: 10 },
    { id: 'diary11', reward: 'dagboek', name: 'Dear Diary', desc: 'Get bitten 150 times.', stat: 'bitten11', goal: 150 },
    { id: 'viral11', reward: 'selfie', name: 'Gone Viral', desc: 'Go viral 5 times.', stat: 'virals11', goal: 5 },
  ];
  for (const a of NEW_ACHS) if (!ACHS.some((x) => x.id === a.id)) ACHS.push(a);

  /* ------------------------------------------------------------------ player defaults */
  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      P.linzen11 = false; P.snoep11 = false; P.candyN11 = 0; P.doom11 = false; P.clipT11 = 0; P.clip11 = null;
      P.viral11 = false; P.views11 = 0; P.reeks11 = false; P.duet11 = null; P.selfie11 = false; P.selfieT11 = 4; P.selfieHeal11 = false;
      P.dagboek11 = false; P.diary11 = null; P.refl11 = false; P.kamhuid11 = false; P.camo11 = false; P.camoT11 = 0; P.camoCd11 = 0; P.camoShot11 = false;
      P.kamtong11 = false; P.tongN11 = 0; P.tongue11 = null; P.kleur11 = false; P.color11 = -1; P.egg11 = false; P.cracks11 = 0;
      P.hoofd11 = false; P.terug11 = false; P.terugUsed11 = false; P.hist11 = []; P.histT11 = 0; P.val11 = false; P.valUsed11 = false;
      P.narcT11 = 10; P.sugarT11 = 0; P.crash11 = 0;
    };
  }
  const COLORS11 = [
    { name: 'RED', col: '#ff4a4a' }, { name: 'BLUE', col: '#4a9aff' }, { name: 'YELLOW', col: '#ffd23a' }, { name: 'GREEN', col: '#5ad86a' },
  ];
  const CANDY11 = [
    { k: 'red', look: ['#7a0a10', '#ff9a9a', '#e8323c'] }, { k: 'orange', look: ['#7a3a00', '#ffcf8a', '#ff8a1e'] },
    { k: 'yellow', look: ['#6a5000', '#fff2a0', '#ffd21e'] }, { k: 'green', look: ['#0a4a1a', '#a8f0b0', '#3ab54a'] },
    { k: 'blue', look: ['#0a2a6a', '#a8ccff', '#2a7ae8'] }, { k: 'brown', look: ['#2a1206', '#d8a878', '#7a4a2a'] },
  ];
  const full = (P) => P.hp >= P.maxHp;
  const inFight = () => fighting10(G.room);

  /* ------------------------------------------------------------------ numbers */
  {
    const d0 = dmgK9;
    dmgK9 = function (P) {
      let k = d0(P);
      if (P.hoofd11 && full(P)) k *= 1.4;
      if (P.reeks11 && G.run) k *= 1 + 0.04 * Math.min(10, G.run.streak || 0);
      if (P.egg11 && P.cracks11 < 3) k *= 1.2;
      if (P.clip11 === 'dmg' && inFight()) k *= 1.3;
      if (P.kleur11 && P.color11 === 0) k *= 1.2;
      return k;
    };
    const r0 = rateK9;
    rateK9 = function (P) {
      let k = r0(P);
      if (P.clip11 === 'rate' && inFight()) k *= 0.75;
      if (P.kleur11 && P.color11 === 1) k *= 0.85;
      if (P.candyN11) k *= 1 - 0.03 * Math.min(10, P.candyN11);
      if (P.reeks11 && G.run) k *= 1 - 0.02 * Math.min(10, G.run.streak || 0);
      if (P.crash11 > 0) k *= 1.45;
      return k;
    };
    const s0 = speedK9;
    speedK9 = function (P, room) {
      let k = s0(P, room);
      if (P.clip11 === 'speed' && inFight()) k *= 1.25;
      if (P.kleur11 && P.color11 === 2) k *= 1.15;
      if (P.hoofd11 && full(P)) k *= 1.1;
      if (P.crash11 > 0) k *= 0.85;
      return k;
    };
    const h0 = hurtMod9;
    hurtMod9 = function (sn, amount, fx, fy, isPoison) {
      amount = h0(sn, amount, fx, fy, isPoison);
      const P = G.player; if (!P) return amount;
      if (P.dagboek11 && P.diary11 && P.diary11.has(sn.kind)) amount *= 1.25;
      const s = SEED10.s;
      if (s && s.refl11 && s.bounce < s.b011) amount *= 1.3;
      return amount;
    };
  }

  /* ------------------------------------------------------------------ shooting */
  {
    const pf0 = preFire9;
    preFire9 = function (P) {
      if (P.camo11) { P.camoShot11 = true; endCamo11(P, true); }
      return pf0(P);
    };
    const sd0 = seed9;
    seed9 = function (P, s, o) {
      sd0(P, s, o);
      if (P.refl11) { s.refl11 = true; s.b011 = s.bounce; }
      if (!o.inherit) return;
      if (P.linzen11) { const c = pick(CANDY11); s.candy11 = c.k; s.look9 = c.look; }
      if (P.clip11 === 'home' && inFight()) s.home = true;
      if (P.hoofd11 && full(P)) { s.size *= 1.2; s.glow = true; if (!s.look9) s.look9 = ['#6a4a00', '#fff6c8', '#ffe27a']; }
      if (P.camoShot11) { s.dmg *= 1.6; s.look9 = ['#1a4a1a', '#c8ffb0', '#6ad84a']; s.glow = true; }
    };
    const fr0 = fire9;
    fire9 = function (P, base) {
      fr0(P, base);
      P.camoShot11 = false;
      const room = G.room; if (!room) return;
      if (P.duet11) {
        const d = P.duet11, a = Math.PI - base;
        makeSeed(P, d.x + Math.cos(a) * 8, d.y + Math.sin(a) * 8 - 2, a, { mult: 0.5, size: 0.85, noCan: true });
      }
      if (P.kamtong11 && ++P.tongN11 % 5 === 0) tongue11(P, room, base);
    };
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = G.player; if (!P) return;
      if (s.candy11 && sn.alive) candyHit11(room, s, sn, dmg);
      if (P.viral11 && !s.child) addViews11(P, room, 1);
    };
  }
  function candyHit11(room, s, sn, dmg) {
    const k = s.candy11;
    if (k === 'red') { if (!sn.K.fireproof) sn.burn = Math.max(sn.burn || 0, 2); }
    else if (k === 'blue') sn.slow = Math.max(sn.slow || 0, 1.4);
    else if (k === 'green') sn.poison = Math.max(sn.poison || 0, 2.1);
    else if (k === 'yellow') { sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.12 : 0.35); if (Math.random() < 0.3) floatText(s.x, s.y - 12, 'ZAP', '#ffd21e'); }
    else if (k === 'orange') {
      for (const o of room.snakes) if (o !== sn && o.canBeHit() && !o.burrowed && o.hitTest(s.x, s.y, 36)) o.hurt(dmg * 0.4, s.x, s.y);
      burst(s.x, s.y, 7, '#ff8a1e', { min: 30, max: 100, lmin: 0.2, lmax: 0.4, glow: true });
    } else if (k === 'brown' && sn.canBeHit()) sn.hurt(dmg * 0.5, s.x, s.y, true);
  }
  function addViews11(P, room, n) {
    P.views11 = (P.views11 || 0) + n;
    if (P.views11 < 60) return;
    P.views11 = 0;
    const d = seedDmg(P) * 3;
    for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed) { sn.hurt(d, sn.x, sn.y); sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.2 : 0.6); burst(sn.x, sn.y, 6, '#ff4a8a', { min: 30, max: 100, lmin: 0.3, lmax: 0.5, glow: true }); }
    floatText(P.x, P.y - 40, 'VIRAL', '#ff4a8a', true);
    Meta.add('virals11');
    G.shake = Math.max(G.shake, 5); flashLight(P.x, P.y, 160, 0.7, 0.4);
    [0, 4, 7, 12].forEach((st, i) => Sfx.tone(523 * Math.pow(2, st / 12), 0.25, { type: 'square', vol: 0.035, lp: 2600, delay: i * 0.05 }));
  }
  // the tongue: a straight snap toward where you aim
  function tongue11(P, room, base) {
    const ca = Math.cos(base), sa = Math.sin(base);
    let hitSn = null, len = 170;
    for (let d = 10; d <= 170; d += 5) {
      const x = P.x + ca * d, y = P.y + sa * d;
      const o = room.tileAt(x, y);
      if (o && o.shots) { len = d; break; }
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(x, y, 5)) { hitSn = sn; break; }
      if (hitSn) { len = d; break; }
    }
    P.tongue11 = { a: base, len, t: 0 };
    Sfx.tone(700, 0.08, { to: 260, type: 'triangle', vol: 0.05 }); Sfx.noise(0.06, { f: 1800, vol: 0.04 });
    if (!hitSn) return;
    hitSn.hurt(seedDmg(P) * 2, hitSn.x, hitSn.y);
    hitSn.stagger = Math.max(hitSn.stagger || 0, 0.4);
    if (!hitSn.isBoss && hitSn.alive) {
      const a = Math.atan2(P.y - hitSn.y, P.x - hitSn.x);
      for (let i = 0; i < 10; i++) {
        if (dist(hitSn.x, hitSn.y, P.x, P.y) < 46) break;
        const nx = hitSn.x + Math.cos(a) * 5, ny = hitSn.y + Math.sin(a) * 5;
        if (!freeAt(room, nx, ny, hitSn.headR * 0.7)) break;
        hitSn.moveTo(nx, ny);
      }
    }
    floatText(hitSn.x, hitSn.y - 20, 'SLURP', '#ff7aa8');
  }

  /* ------------------------------------------------------------------ getting bitten */
  {
    const hu0 = Player.prototype.hurt;
    Player.prototype.hurt = function (n, sx, sy, src) {
      const P = this;
      const open = !(P.inv > 0 || P.dashT > 0 || P.dying > 0 || P.escaping > 0 || G.state !== 'play' || P.god);
      if (open && P.flags && P.flags.camo11 && Math.random() < 0.25) {
        P.inv = 0.6; floatText(P.x, P.y - 24, 'CAMO', '#8ad86a');
        burst(P.x, P.y, 8, '#6ab84a', { min: 30, max: 90, lmin: 0.3, lmax: 0.5 });
        return true;
      }
      if (open && P.camo11 && src && src.K) return false;
      if (open && P.terug11 && !P.terugUsed11 && P.hist11 && P.hist11.length) {
        P.terugUsed11 = true;
        let spot = P.hist11[0];
        for (const h of P.hist11) if (G.t - h.t >= 1.5) spot = h;
        burst(P.x, P.y, 12, '#9fd8ff', { min: 30, max: 120, lmin: 0.3, lmax: 0.6, glow: true });
        if (freeAt(G.room, spot.x, spot.y, P.r)) { P.x = spot.x; P.y = spot.y; }
        P.inv = 1.2; P.kbx = 0; P.kby = 0; P.squash = 0.6;
        floatText(P.x, P.y - 30, 'TERUGBLIK', '#9fd8ff', true);
        ring10(P.x, P.y, 14, '#9fd8ff', 0.5);
        Sfx.tone(900, 0.4, { to: 300, type: 'triangle', vol: 0.05, verb: true });
        return true;
      }
      return hu0.call(this, n, sx, sy, src);
    };
    const b0 = bitten10;
    bitten10 = function (P, lost, sx, sy, src) {
      b0(P, lost, sx, sy, src);
      safe(() => {
        Meta.add('bitten11');
        if (P.hp > 0 && P.hp <= 1) Meta.add('halfapple11');
        if (P.dagboek11 && src && src.kind) {
          if (!P.diary11) P.diary11 = new Set();
          if (!P.diary11.has(src.kind)) { P.diary11.add(src.kind); floatText(P.x, P.y - 40, `NOTED: ${(KINDS[src.kind] ? KINDS[src.kind].name : src.kind).toUpperCase()}`, '#e8d8b0'); }
        }
        if (P.egg11 && P.cracks11 < 3) {
          P.cracks11++;
          Sfx.tone(1800, 0.12, { to: 900, type: 'triangle', vol: 0.04 });
          if (P.cracks11 >= 3) {
            const room = G.room, d = seedDmg(P) * 2.5;
            for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && dist(sn.x, sn.y, P.x, P.y) < 80 + sn.headR) sn.hurt(d, P.x, P.y);
            burst(P.x, P.y, 18, '#f4ecd8', { kind: 'shard', min: 60, max: 200, rmin: 1.5, rmax: 3.2, lmin: 0.4, lmax: 0.8 });
            floatText(P.x, P.y - 34, 'SHELL BROKE', '#f4ecd8', true);
            Sfx.shell();
          } else floatText(P.x, P.y - 30, 'CRACK', '#f4ecd8');
        }
        if (P.flags.wobbly && P.hp > 0) { P.rootT = Math.max(P.rootT || 0, 0.7); floatText(P.x, P.y - 26, 'OOPS', '#f4ecd8'); }
        if (P.camo11) endCamo11(P, false);
      });
    };
    // De Grote Val: a finishing bite becomes a fall
    const cu0 = curatorN9;
    curatorN9 = function (P, n) {
      n = cu0(P, n);
      if (!P.val11 || P.valUsed11 || P.hp - n > 0) return n;
      P.valUsed11 = true;
      const room = G.room, d = seedDmg(P) * 8;
      for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed) {
        sn.hurt(d, P.x, P.y); sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.3 : 1);
      }
      P.hp = Math.min(P.maxHp, 4); fixBites(P);
      for (const col of ['#f4ecd8', '#e8d8b0', '#ffd27a']) burst(P.x, P.y, 18, col, { kind: 'shard', min: 60, max: 240, rmin: 1.5, rmax: 3.5, lmin: 0.5, lmax: 1.1 });
      G.shake = Math.max(G.shake, 12); G.whiteout = 0.35; flashLight(P.x, P.y, 220, 1, 1);
      UI.banner('De Grote Val', 'You fell, you shattered, you got put back together. Mostly.', 'legend');
      Sfx.boom(true);
      setTimeout(() => { if (G.state === 'play' && G.player === P) giveDown('kraakje'); }, 1200);
      return 0;
    };
    // Suikerverslaving: any heal is sugar
    const he0 = Player.prototype.heal;
    Player.prototype.heal = function (n) {
      const r = he0.call(this, n);
      if (r > 0 && this.flags && this.flags.sugar) { this.sugarT11 = 0; this.crash11 = 0; }
      return r;
    };
  }
  function endCamo11(P, shot) {
    if (!P.camo11) return;
    P.camo11 = false; P.camoCd11 = 1.5; P.camoT11 = 0;
    if (!shot) floatText(P.x, P.y - 26, 'SPOTTED', '#c8e8a8');
  }

  /* ------------------------------------------------------------------ every frame */
  {
    const up0 = updatePlayer9;
    updatePlayer9 = function (P, dt, room, sp) { up0(P, dt, room, sp); safe(() => update11(P, dt, room, sp)); };
  }
  const CLIPS11 = [['rate', 'CLIP: FAST HANDS', '#ff6ab0'], ['speed', 'CLIP: RUNNING', '#6ad8ff'], ['dmg', 'CLIP: HARD HITS', '#ff8a3a'], ['home', 'CLIP: AIMBOT', '#b88aff']];
  function update11(P, dt, room, sp) {
    const fight = fighting10(room);
    // rewind history, a few seconds of where you stood
    if (P.terug11) {
      P.histT11 = (P.histT11 || 0) - dt;
      if (P.histT11 <= 0) { P.histT11 = 0.1; P.hist11.push({ x: P.x, y: P.y, t: G.t }); while (P.hist11.length > 30) P.hist11.shift(); }
    }
    if (P.duet11) {
      const d = P.duet11, k = Math.min(1, dt * 12);
      d.x += (clamp(RW - P.x, 12, RW - 12) - d.x) * k; d.y += (P.y - d.y) * k;
    }
    if (P.tongue11) { P.tongue11.t += dt; if (P.tongue11.t > 0.22) P.tongue11 = null; }
    if (P.doom11 && fight) {
      P.clipT11 -= dt;
      if (P.clipT11 <= 0) {
        P.clipT11 = 8;
        const opts = CLIPS11.filter((c) => c[0] !== P.clip11), c = pick(opts);
        P.clip11 = c[0]; floatText(P.x, P.y - 36, c[1], c[2], true);
        Sfx.tone(1200, 0.05, { type: 'square', vol: 0.02, lp: 3000 }); Sfx.tone(1600, 0.06, { type: 'square', vol: 0.02, lp: 3000, delay: 0.05 });
      }
    }
    if (P.selfie11 && fight) {
      P.selfieT11 -= dt;
      if (P.selfieT11 <= 0) { P.selfieT11 = 9; selfie11(P, room); }
    }
    if (P.kamhuid11) {
      if (P.camoCd11 > 0) P.camoCd11 -= dt;
      if (P.camo11) {
        P.camoT11 -= dt;
        for (const sn of room.snakes) if (sn.alive && !sn.isBoss) sn.daze = Math.max(sn.daze || 0, 0.15);
        if (Math.random() < dt * 10) addP({ kind: 'dot', x: P.x + rnd(-10, 10), y: P.y + rnd(-10, 6), vx: rnd(-10, 10), vy: rnd(-20, -5), r: rnd(1, 2), life: 0.5, col: pick(['#6ab84a', '#a8d86a', '#3a8a3a']), drag: 2 });
        if (P.camoT11 <= 0 || P.stillT <= 0.05 || !fight) endCamo11(P, !fight);
      } else if (fight && P.stillT > 0.5 && P.camoCd11 <= 0 && P.dying <= 0) {
        P.camo11 = true; P.camoT11 = 3; floatText(P.x, P.y - 28, 'BLEND', '#8ad86a');
      }
    }
    // candy on the floor
    if (room.pickups.length) for (let i = room.pickups.length - 1; i >= 0; i--) {
      const p = room.pickups[i];
      if (p.kind !== 'candy11') continue;
      if (p.vx || p.vy) {
        p.vx = approach(p.vx, 0, 200 * dt); p.vy = approach(p.vy, 0, 200 * dt);
        let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
        [nx, ny] = resolveTiles(room, nx, ny, 5);
        p.x = clamp(nx, 8, RW - 8); p.y = clamp(ny, 8, RH - 8);
      }
      if (p.t > p.life) { room.pickups.splice(i, 1); continue; }
      if (p.t < 0.35 || P.dying > 0 || dist2(p.x, p.y, P.x, P.y) > (P.r + 8) * (P.r + 8)) continue;
      room.pickups.splice(i, 1);
      if (P.candyN11 < 10) P.candyN11++;
      floatText(P.x, P.y - 28, `CANDY ${P.candyN11 * 3}%`, p.col);
      burst(p.x, p.y, 7, p.col, { min: 20, max: 70, lmin: 0.3, lmax: 0.5, glow: true });
      Sfx.pickup();
      if (P.flags.sugar) { P.sugarT11 = 0; P.crash11 = 0; }
    }
    // curses with a clock
    if (fight && P.flags.narcist) {
      P.narcT11 -= dt;
      if (P.narcT11 <= 0) {
        P.narcT11 = 10; P.rootT = Math.max(P.rootT || 0, 0.6);
        floatText(P.x, P.y - 30, pick(['LOOK AT ME', 'SO PRETTY', 'NICE PEEL']), '#ff9ad8');
        Sfx.tone(1320, 0.3, { type: 'triangle', vol: 0.03, verb: true });
      }
    }
    if (P.crash11 > 0) { P.crash11 -= dt; if (Math.random() < dt * 6) addP({ kind: 'dot', x: P.x + rnd(-6, 6), y: P.y - 12, vx: 0, vy: 20, r: 1.5, life: 0.5, col: '#c8c8d0', drag: 1 }); }
    else if (fight && P.flags.sugar) {
      P.sugarT11 += dt;
      if (P.sugarT11 >= 25) { P.sugarT11 = 0; P.crash11 = 5; floatText(P.x, P.y - 30, 'SUGAR CRASH', '#c8c8d0', true); Sfx.down(); }
    }
  }
  function selfie11(P, room) {
    const base = Math.atan2(P.aimY || 0, P.aimX || 1);
    let n = 0;
    for (const sn of room.snakes) {
      if (!sn.canBeHit() || sn.burrowed) continue;
      if (dist(sn.x, sn.y, P.x, P.y) > 180 + sn.headR) continue;
      if (Math.abs(angDiff(base, Math.atan2(sn.y - P.y, sn.x - P.x))) > 1.0) continue;
      n++;
      if (sn.isBoss) sn.stun = Math.max(sn.stun || 0, 0.3);
      else sn.daze = Math.max(sn.daze || 0, 1.4);
      burst(sn.x, sn.y - 4, 4, '#ffffff', { min: 10, max: 40, lmin: 0.3, lmax: 0.5, glow: true });
    }
    flashLight(P.x + Math.cos(base) * 50, P.y + Math.sin(base) * 50, 150, 1, 0.35);
    for (let i = 0; i < 14; i++) { const a = base + rnd(-0.9, 0.9), s = rnd(120, 320); addP({ kind: 'dot', x: P.x, y: P.y - 4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1, 2.4), life: 0.3, col: '#ffffff', glow: true, drag: 3 }); }
    floatText(P.x, P.y - 34, n ? `SELFIE x${n}` : 'SELFIE', '#ffffff', true);
    Sfx.noise(0.05, { filter: 'highpass', f: 4000, vol: 0.08 }); Sfx.tone(2400, 0.06, { type: 'square', vol: 0.02, lp: 4000, delay: 0.04 });
    if (n >= 3 && !P.selfieHeal11 && P.hp < P.maxHp) { P.selfieHeal11 = true; if (P.heal(1)) floatText(P.x, P.y - 48, '+1 LIKES', '#ff6ab0'); }
  }

  /* ------------------------------------------------------------------ kills, rooms, floors, coins */
  {
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0(sn, room, P);
      if (!P) return;
      safe(() => {
        if (P.viral11) addViews11(P, room, 5);
        if (P.snoep11 && Math.random() < 0.25) {
          const a = rnd(TAU);
          room.pickups.push({ kind: 'candy11', x: sn.x, y: sn.y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, t: 0, life: 16, ph: rnd(10), col: pick(['#e8323c', '#ff8a1e', '#ffd21e', '#3ab54a', '#2a7ae8', '#7a4a2a']) });
        }
      });
    };
    const en0 = enter9;
    enter9 = function (P) {
      en0(P);
      P.terugUsed11 = false; P.hist11 = []; P.cracks11 = 0; P.camo11 = false; P.camoCd11 = 0; P.selfieHeal11 = false; P.tongue11 = null;
      P.narcT11 = 10; P.selfieT11 = Math.min(P.selfieT11, 4);
      if (P.kleur11 && G.room && !G.room.cleared) {
        let c = Math.floor(Math.random() * 4); if (c === P.color11) c = (c + 1 + Math.floor(Math.random() * 3)) % 4;
        P.color11 = c;
        setTimeout(() => { if (G.state === 'play' && G.player === P) floatText(P.x, P.y - 32, COLORS11[c].name, COLORS11[c].col, true); }, 300);
      }
    };
    const fl0 = floor9;
    floor9 = function (P) { fl0(P); P.candyN11 = 0; };
    const cr0 = clearRoom9;
    clearRoom9 = function (room) {
      cr0(room);
      const P = G.player;
      if (P && P.kleur11 && P.color11 === 3 && room.type !== 'boss' && P.heal(1)) floatText(P.x, P.y - 30, 'GREEN +1', '#5ad86a');
    };
    const dc0 = dropCoins;
    dropCoins = function (room, x, y, n) {
      const P = G.player;
      if (P && P.flags && P.flags.nolikes && n > 0) {
        let k = 0; for (let i = 0; i < n; i++) if (Math.random() >= 0.25) k++;
        if (k < n && Math.random() < 0.4) floatText(x, y - 16, '0 LIKES', '#a8a8b0');
        if (k <= 0) return;
        n = k;
      }
      return dc0(room, x, y, n);
    };
  }

  /* ------------------------------------------------------------------ drawing in the room */
  DRAWPICK9.candy11 = (c, p, t) => {
    const a = p.t > p.life - 3 ? 0.5 + 0.5 * Math.sin(t * 20) : 1, bob = Math.sin(t * 4 + p.ph) * 1.2;
    c.save(); c.globalAlpha = a; c.translate(p.x, p.y - 2 + bob);
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 1, 7 - bob, 5, 2); c.fill();
    c.fillStyle = p.col; ell(c, 0, 0, 5.5, 4.2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 0.8; ell(c, 0, 0, 5.5, 4.2); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, -1.8, -1.6, 1.8, 1, -0.4); c.fill();
    c.restore();
  };
  {
    const dp0 = drawPlayer;
    drawPlayer = function (c) {
      const P = G.player;
      if (!P || P.dying > 1) return dp0(c);
      const t = G.t;
      // the duet: a see-through mirror apple
      if (P.duet11) safe(() => {
        const d = P.duet11;
        c.save(); c.globalAlpha = 0.42;
        c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, d.x, d.y + 10, 8, 3); c.fill();
        c.translate(d.x, d.y - 1 + Math.sin(t * 6) * 1.2); c.scale(-1, 1);
        miniApple(c, 0, 0, 9, '#ff6ab0');
        c.fillStyle = '#1a0a10'; circle(c, -3, -1, 1.2); circle(c, 3, -1, 1.2);
        c.restore();
        c.strokeStyle = 'rgba(255,106,176,0.25)'; c.lineWidth = 1; c.setLineDash([3, 5]);
        c.beginPath(); c.moveTo(RW / 2, d.y - 14); c.lineTo(RW / 2, d.y + 10); c.stroke(); c.setLineDash([]);
      });
      // color ring, main character spotlight
      if (P.kleur11 && P.color11 >= 0) { c.strokeStyle = rgba(COLORS11[P.color11].col, 0.55); c.lineWidth = 2; ell(c, P.x, P.y + 11, 13, 4.5); c.stroke(); }
      if (P.hoofd11 && full(P)) {
        const g = c.createRadialGradient(P.x, P.y + 8, 2, P.x, P.y + 8, 22);
        g.addColorStop(0, 'rgba(255,240,180,0.35)'); g.addColorStop(1, 'rgba(255,240,180,0)');
        c.fillStyle = g; ell(c, P.x, P.y + 8, 22, 9); c.fill();
      }
      if (P.camo11) { c.save(); c.globalAlpha = 0.3; dp0(c); c.restore(); }
      else dp0(c);
      // the egg shell, cracked as it is
      if (P.egg11 && P.cracks11 < 3 && P.inv <= 0) {
        c.strokeStyle = 'rgba(244,236,216,0.5)'; c.lineWidth = 1.2;
        c.beginPath(); c.ellipse(P.x, P.y - 1, 15, 17, 0, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(80,60,40,0.7)'; c.lineWidth = 1;
        for (let i = 0; i < P.cracks11; i++) {
          const a = -1.2 + i * 1.6, x0 = P.x + Math.cos(a) * 15, y0 = P.y - 1 + Math.sin(a) * 17;
          c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 - Math.cos(a) * 4 + 2, y0 - Math.sin(a) * 4); c.lineTo(x0 - Math.cos(a) * 7 - 1, y0 - Math.sin(a) * 7 + 1); c.stroke();
        }
      }
    };
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const P = G.player; if (!P || P.dying > 0) return;
      if (P.tongue11) {
        const T0 = P.tongue11, u = T0.t < 0.08 ? T0.t / 0.08 : 1 - (T0.t - 0.08) / 0.14, L = T0.len * clamp(u, 0, 1);
        const x2 = P.x + Math.cos(T0.a) * L, y2 = P.y - 2 + Math.sin(T0.a) * L;
        c.strokeStyle = '#a8304a'; c.lineWidth = 4.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(P.x, P.y - 2); c.lineTo(x2, y2); c.stroke();
        c.strokeStyle = '#ff7aa8'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(P.x, P.y - 2); c.lineTo(x2, y2); c.stroke();
        c.fillStyle = '#ff7aa8'; circle(c, x2, y2, 4.2); c.fillStyle = 'rgba(255,255,255,0.5)'; circle(c, x2 - 1, y2 - 1.2, 1.3);
      }
      if (P.viral11 && P.views11 > 0) txt10(c, `${P.views11}/60 VIEWS`, P.x, P.y + 22, 6.5, '#ff8ac0', 700);
      if (P.doom11 && P.clip11 && fighting10(G.room)) {
        const x = P.x + 14, y = P.y - 30;
        c.fillStyle = '#1a1a22'; rrect(c, x - 4, y - 7, 8, 13, 1.6); c.fill();
        const col = (CLIPS11.find((q) => q[0] === P.clip11) || [0, 0, '#fff'])[2];
        c.fillStyle = col; c.fillRect(x - 3, y - 5.5, 6, 8.5);
        c.fillStyle = '#fff'; c.fillRect(x - 3, y + 3.6, 6 * (1 - P.clipT11 / 8), 0.9);
      }
    };
  }

  /* ------------------------------------------------------------------ icons */
  const ALL11 = Object.assign({}, NEW, NEW_CURSES, NEW_DOWNS);
  function phone11(c, R, x, y, w, h, scr) {
    c.fillStyle = '#16161c'; rrect(c, x - w / 2, y - h / 2, w, h, w * 0.18); c.fill();
    c.strokeStyle = '#4a4a56'; c.lineWidth = R * 0.05; rrect(c, x - w / 2, y - h / 2, w, h, w * 0.18); c.stroke();
    c.fillStyle = scr || '#2a2a3a'; rrect(c, x - w / 2 + w * 0.1, y - h / 2 + h * 0.08, w * 0.8, h * 0.84, w * 0.08); c.fill();
  }
  function egg11(c, x, y, rx, ry, col) {
    c.beginPath(); c.moveTo(x, y - ry);
    c.bezierCurveTo(x + rx * 0.9, y - ry, x + rx * 1.05, y + ry * 0.2, x + rx, y + ry * 0.35);
    c.bezierCurveTo(x + rx * 0.9, y + ry * 1.05, x - rx * 0.9, y + ry * 1.05, x - rx, y + ry * 0.35);
    c.bezierCurveTo(x - rx * 1.05, y + ry * 0.2, x - rx * 0.9, y - ry, x, y - ry); c.closePath();
    c.fillStyle = col || '#f4ecd8'; c.fill(); c.strokeStyle = '#6a5a40'; c.lineWidth = Math.max(0.7, rx * 0.1); c.stroke();
  }
  function crackLine11(c, pts, R) {
    c.strokeStyle = '#4a3a24'; c.lineWidth = R * 0.06; c.lineJoin = 'miter';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.stroke();
  }
  function icon11(c, id, R, t) {
    if (id === 'linzen') {
      const cols = ['#e8323c', '#ff8a1e', '#ffd21e', '#3ab54a', '#2a7ae8', '#7a4a2a'];
      const pos = [[-0.45, -0.4], [0.2, -0.55], [0.6, -0.05], [-0.05, 0.1], [-0.6, 0.35], [0.35, 0.5]];
      pos.forEach(([x, y], i) => {
        const bob = Math.sin(t * 3 + i) * R * 0.03;
        c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x * R + R * 0.03, y * R + R * 0.06 + bob, R * 0.27, R * 0.19); c.fill();
        c.fillStyle = cols[i]; ell(c, x * R, y * R + bob, R * 0.27, R * 0.2, i * 0.4); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = R * 0.04; c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, x * R - R * 0.08, y * R - R * 0.07 + bob, R * 0.08, R * 0.04, -0.4); c.fill();
      });
    } else if (id === 'snoepzak') {
      c.fillStyle = '#e8d8b0'; c.beginPath(); c.moveTo(-R * 0.55, -R * 0.2); c.lineTo(R * 0.55, -R * 0.2); c.lineTo(R * 0.45, R * 0.85); c.lineTo(-R * 0.45, R * 0.85); c.closePath(); c.fill();
      c.strokeStyle = '#6a5a3a'; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = '#c8b890'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-R * 0.55 + i * R * 0.22, -R * 0.2); c.lineTo(-R * 0.44 + i * R * 0.22, -R * 0.34); c.lineTo(-R * 0.33 + i * R * 0.22, -R * 0.2); c.fill(); }
      const cols = ['#e8323c', '#ffd21e', '#2a7ae8', '#3ab54a'];
      [[-0.25, -0.4], [0.1, -0.55], [0.38, -0.35], [-0.02, -0.28]].forEach(([x, y], i) => { c.fillStyle = cols[i]; ell(c, x * R, y * R + Math.sin(t * 3 + i) * R * 0.03, R * 0.17, R * 0.13); c.fill(); });
      c.fillStyle = '#e8323c'; c.font = `800 ${Math.round(R * 0.32)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SNOEP', 0, R * 0.38);
    } else if (id === 'doomscroll') {
      phone11(c, R, 0, R * 0.05, R * 0.95, R * 1.7, '#2a2040');
      const sc = (t * 0.6) % 1;
      c.save(); c.beginPath(); c.rect(-R * 0.38, -R * 0.7, R * 0.76, R * 1.45); c.clip();
      for (let i = -1; i < 2; i++) { const y = (i - sc) * R * 1.45; c.fillStyle = ['#ff6ab0', '#6ad8ff', '#ffb43a'][(i + 3) % 3]; c.fillRect(-R * 0.38, y - R * 0.68, R * 0.76, R * 1.38); c.fillStyle = 'rgba(255,255,255,0.8)'; circle(c, R * 0.25, y + R * 0.25, R * 0.06); circle(c, R * 0.25, y + R * 0.42, R * 0.06); }
      c.restore();
      c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 0.75, R * 0.3); c.lineTo(-R * 0.75, -R * 0.35); c.moveTo(-R * 0.9, -R * 0.2); c.lineTo(-R * 0.75, -R * 0.38); c.lineTo(-R * 0.6, -R * 0.2); c.stroke();
    } else if (id === 'viral') {
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-R * 0.75, 0); c.quadraticCurveTo(0, -R * 0.7, R * 0.75, 0); c.quadraticCurveTo(0, R * 0.7, -R * 0.75, 0); c.fill();
      c.strokeStyle = '#1a1a22'; c.lineWidth = R * 0.07; c.stroke();
      c.fillStyle = '#ff4a8a'; circle(c, 0, 0, R * 0.3); c.fillStyle = '#1a0a10'; circle(c, 0, 0, R * 0.14); c.fillStyle = '#fff'; circle(c, -R * 0.08, -R * 0.08, R * 0.05);
      c.strokeStyle = '#ff4a8a'; c.lineWidth = R * 0.07;
      for (let i = 0; i < 7; i++) { const a = -Math.PI + 0.25 + i * 0.44, u = (t * 1.5 + i * 0.3) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.moveTo(Math.cos(a) * R * (0.6 + u * 0.15), Math.sin(a) * R * (0.5 + u * 0.15) - R * 0.1); c.lineTo(Math.cos(a) * R * (0.85 + u * 0.15), Math.sin(a) * R * (0.75 + u * 0.15) - R * 0.1); c.stroke(); }
      c.globalAlpha = 1;
    } else if (id === 'reeks') {
      flameShape(c, 0, R * 0.1, R * 0.62, R * 0.95); c.fillStyle = '#ff6a1a'; c.fill();
      flameShape(c, 0, R * 0.3, R * 0.38, R * 0.58); c.fillStyle = '#ffd36a'; c.fill();
      c.fillStyle = '#3a1406'; c.font = `800 ${Math.round(R * 0.6)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(1 + Math.floor(t * 1.2) % 9), 0, R * 0.42);
    } else if (id === 'duet') {
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = R * 0.05; c.setLineDash([R * 0.1, R * 0.1]); c.beginPath(); c.moveTo(0, -R * 0.9); c.lineTo(0, R * 0.9); c.stroke(); c.setLineDash([]);
      const b = Math.sin(t * 5) * R * 0.08;
      miniApple(c, -R * 0.45, R * 0.1 + b, R * 0.36);
      c.save(); c.globalAlpha = 0.55; c.scale(-1, 1); miniApple(c, -R * 0.45, R * 0.1 + b, R * 0.36, '#ff6ab0'); c.restore();
      c.fillStyle = '#ff6ab0'; ell(c, R * 0.5, -R * 0.45, R * 0.1, R * 0.08, -0.4); c.fill(); c.strokeStyle = '#ff6ab0'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(R * 0.59, -R * 0.47); c.lineTo(R * 0.59, -R * 0.85); c.lineTo(R * 0.75, -R * 0.75); c.stroke();
    } else if (id === 'selfie') {
      c.save(); c.rotate(-0.25);
      phone11(c, R, R * 0.05, 0, R * 1.0, R * 1.6, '#3a4a6a');
      miniApple(c, R * 0.05, R * 0.12, R * 0.3);
      c.fillStyle = '#1a0a10'; circle(c, -R * 0.05, R * 0.08, R * 0.04); circle(c, R * 0.15, R * 0.08, R * 0.04);
      c.strokeStyle = '#1a0a10'; c.lineWidth = R * 0.04; c.beginPath(); c.arc(R * 0.05, R * 0.15, R * 0.09, 0.3, Math.PI - 0.3); c.stroke();
      c.restore();
      const f = 0.5 + 0.5 * Math.sin(t * 4);
      sparkle(c, R * 0.6, -R * 0.68, R * (0.2 + f * 0.12), '#ffffff');
    } else if (id === 'dagboek') {
      c.save(); c.rotate(-0.12);
      c.fillStyle = '#7a2a3a'; rrect(c, -R * 0.62, -R * 0.75, R * 1.15, R * 1.5, R * 0.1); c.fill();
      c.fillStyle = '#f2e8d0'; c.fillRect(R * 0.4, -R * 0.68, R * 0.1, R * 1.36);
      c.fillStyle = '#5a1a2a'; c.fillRect(-R * 0.62, -R * 0.75, R * 0.16, R * 1.5);
      c.strokeStyle = '#e3a54a'; c.lineWidth = R * 0.05; rrect(c, -R * 0.3, -R * 0.35, R * 0.55, R * 0.3, R * 0.04); c.stroke();
      c.fillStyle = '#e8323c'; c.beginPath(); c.moveTo(R * 0.1, R * 0.75); c.lineTo(R * 0.1, R * 1.0); c.lineTo(R * 0.18, R * 0.9); c.lineTo(R * 0.26, R * 1.0); c.lineTo(R * 0.26, R * 0.75); c.fill();
      c.restore();
      c.save(); c.translate(R * 0.55, R * 0.2); c.rotate(0.7); c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.06, -R * 0.6, R * 0.12, R * 0.9); c.fillStyle = '#f2c8a0'; c.beginPath(); c.moveTo(-R * 0.06, R * 0.3); c.lineTo(R * 0.06, R * 0.3); c.lineTo(0, R * 0.45); c.fill(); c.restore();
    } else if (id === 'reflectie') {
      c.save(); c.rotate(-0.6);
      const g = c.createLinearGradient(-R * 0.1, 0, R * 0.1, 0); g.addColorStop(0, '#8a93a3'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#8a93a3');
      c.fillStyle = g; c.fillRect(-R * 0.09, -R * 0.95, R * 0.18, R * 1.9);
      c.restore();
      c.strokeStyle = 'rgba(239,217,173,0.7)'; c.lineWidth = R * 0.06; c.setLineDash([R * 0.1, R * 0.08]);
      c.beginPath(); c.moveTo(-R * 0.85, -R * 0.55); c.lineTo(-R * 0.05, -R * 0.05); c.lineTo(-R * 0.6, R * 0.6); c.stroke(); c.setLineDash([]);
      seedIcon(c, -R * 0.6, R * 0.6, R * 0.24, -2.3, '#5a3820', '#ffd36a');
      sparkle(c, -R * 0.05, -R * 0.05, R * 0.2, '#ffffff');
    } else if (id === 'kamhuid') {
      c.save(); c.globalAlpha = 0.65 + 0.3 * Math.sin(t * 2);
      miniApple(c, 0, R * 0.1, R * 0.6, '#5aa83a');
      c.restore();
      c.fillStyle = 'rgba(30,80,20,0.6)';
      for (const [x, y, r] of [[-0.25, 0, 0.12], [0.2, 0.25, 0.1], [0.3, -0.15, 0.08], [-0.15, 0.4, 0.09], [0.05, -0.05, 0.06]]) circle(c, x * R, y * R + R * 0.1, r * R);
      c.fillStyle = '#ffd23a'; circle(c, R * 0.12, -R * 0.05, R * 0.12); c.fillStyle = '#1a1a0a'; circle(c, R * 0.12 + Math.sin(t * 2) * R * 0.04, -R * 0.05, R * 0.05);
    } else if (id === 'kamtong') {
      c.fillStyle = '#5aa83a'; ell(c, -R * 0.55, 0, R * 0.4, R * 0.32); c.fill(); c.strokeStyle = '#1e4a12'; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = '#ffd23a'; circle(c, -R * 0.62, -R * 0.12, R * 0.1);
      const L = 0.4 + 0.5 * Math.abs(Math.sin(t * 2.5));
      c.strokeStyle = '#a8304a'; c.lineWidth = R * 0.18; c.lineCap = 'round'; c.beginPath(); c.moveTo(-R * 0.2, R * 0.08); c.lineTo(-R * 0.2 + L * R * 1.1, R * 0.08); c.stroke();
      c.strokeStyle = '#ff7aa8'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(-R * 0.2, R * 0.08); c.lineTo(-R * 0.2 + L * R * 1.1, R * 0.08); c.stroke();
      c.fillStyle = '#ff7aa8'; circle(c, -R * 0.2 + L * R * 1.1, R * 0.08, R * 0.17);
    } else if (id === 'kleurwissel') {
      const cols = ['#ff4a4a', '#4a9aff', '#ffd23a', '#5ad86a'], i0 = Math.floor(t * 0.8) % 4;
      c.save(); c.translate(0, R * 0.12); applePath(c, R * 0.62); c.clip();
      c.fillStyle = cols[i0]; c.fillRect(-R, -R, R, R * 2);
      c.fillStyle = cols[(i0 + 1) % 4]; c.fillRect(0, -R, R, R * 2);
      c.restore();
      c.save(); c.translate(0, R * 0.12); applePath(c, R * 0.62); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.08; c.stroke(); c.restore();
      c.strokeStyle = '#ece2d4'; c.lineWidth = R * 0.07;
      for (const s of [-1, 1]) {
        c.beginPath(); c.arc(0, R * 0.12, R * 0.86, s > 0 ? -0.9 : 2.2, s > 0 ? 0.2 : 3.3); c.stroke();
        const ea = s > 0 ? 0.2 : 3.3, ex = Math.cos(ea) * R * 0.86, ey = R * 0.12 + Math.sin(ea) * R * 0.86;
        c.fillStyle = '#ece2d4'; c.beginPath(); c.moveTo(ex - R * 0.12 * s, ey - R * 0.02); c.lineTo(ex + R * 0.12 * s, ey - R * 0.04); c.lineTo(ex - R * 0.02 * s, ey + R * 0.16); c.closePath(); c.fill();
      }
      c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(0, -R * 0.26); c.lineTo(R * 0.08, -R * 0.48); c.stroke();
    } else if (id === 'eierschaal') {
      egg11(c, 0, R * 0.05, R * 0.6, R * 0.82);
      crackLine11(c, [[-0.55, 0.05], [-0.3, -0.1], [-0.15, 0.1], [0.05, -0.08], [0.25, 0.12], [0.55, -0.02]], R);
      crackLine11(c, [[0.05, -0.08], [0.1, -0.4]], R);
      c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, -R * 0.25, -R * 0.4, R * 0.1, R * 0.2, 0.3); c.fill();
    } else if (id === 'hoofdpersoon') {
      c.fillStyle = 'rgba(255,240,180,0.22)'; c.beginPath(); c.moveTo(-R * 0.15, -R); c.lineTo(R * 0.15, -R); c.lineTo(R * 0.8, R * 0.8); c.lineTo(-R * 0.8, R * 0.8); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,240,180,0.35)'; ell(c, 0, R * 0.78, R * 0.75, R * 0.16); c.fill();
      miniApple(c, 0, R * 0.32, R * 0.42);
      c.fillStyle = '#1a0a10'; circle(c, -R * 0.12, R * 0.28, R * 0.04); circle(c, R * 0.12, R * 0.28, R * 0.04);
      for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1; sparkle(c, Math.cos(a) * R * 0.62, -R * 0.2 + Math.sin(a) * R * 0.3, R * 0.14, '#fff2a0'); }
    } else if (id === 'terugblik') {
      c.fillStyle = '#2a2a4a'; circle(c, 0, 0, R * 0.78); c.fillStyle = '#e8e8f2'; circle(c, 0, 0, R * 0.62);
      c.strokeStyle = '#2a2a4a'; c.lineWidth = R * 0.08;
      const a = -t * 1.6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - 1.6) * R * 0.45, Math.sin(a - 1.6) * R * 0.45); c.moveTo(0, 0); c.lineTo(Math.cos(a * 0.2) * R * 0.3, Math.sin(a * 0.2) * R * 0.3); c.stroke();
      c.strokeStyle = '#9fd8ff'; c.lineWidth = R * 0.1; c.beginPath(); c.arc(0, 0, R * 0.92, -0.4, -2.6, true); c.stroke();
      c.fillStyle = '#9fd8ff'; c.beginPath(); const ex = Math.cos(-2.6) * R * 0.92, ey = Math.sin(-2.6) * R * 0.92; c.moveTo(ex - R * 0.2, ey + R * 0.02); c.lineTo(ex + R * 0.08, ey - R * 0.2); c.lineTo(ex + R * 0.12, ey + R * 0.16); c.closePath(); c.fill();
    } else if (id === 'grotevala') {
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
        const off = r % 2 ? R * 0.22 : 0, x = -R * 0.9 + k * R * 0.45 + off, y = R * 0.3 + r * R * 0.22;
        if (x > R * 0.9) continue;
        c.fillStyle = (r + k) % 2 ? '#a8503a' : '#b8604a'; c.fillRect(x, y, Math.min(R * 0.42, R * 0.9 - x), R * 0.2);
      }
      const fall = (t * 0.7) % 1, fy = -R * 0.2 + Math.max(0, fall - 0.5) * R * 0.4, rot = Math.max(0, fall - 0.4) * 2;
      c.save(); c.translate(R * 0.05, fy); c.rotate(rot); egg11(c, 0, -R * 0.15, R * 0.32, R * 0.42); c.restore();
      if (fall > 0.75) sparkle(c, R * 0.5, R * 0.1, R * 0.2, '#ffd27a');
    }
    // curses (the disc is already drawn)
    else if (id === 'narcist') {
      c.fillStyle = '#e3a54a'; rrect(c, -R * 0.08, R * 0.2, R * 0.16, R * 0.7, R * 0.05); c.fill();
      c.fillStyle = '#e3a54a'; ell(c, 0, -R * 0.15, R * 0.5, R * 0.55); c.fill();
      c.fillStyle = '#cfe4ff'; ell(c, 0, -R * 0.15, R * 0.4, R * 0.45); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, -R * 0.15, -R * 0.35, R * 0.07, R * 0.16, 0.4); c.fill();
      c.fillStyle = '#ff6ab0'; const s = 1 + 0.1 * Math.sin(t * 6); c.save(); c.translate(R * 0.05, -R * 0.12); c.scale(s, s);
      c.beginPath(); c.moveTo(0, R * 0.12); c.bezierCurveTo(-R * 0.25, -R * 0.05, -R * 0.12, -R * 0.25, 0, -R * 0.08); c.bezierCurveTo(R * 0.12, -R * 0.25, R * 0.25, -R * 0.05, 0, R * 0.12); c.fill(); c.restore();
    } else if (id === 'aandacht') {
      phone11(c, R, 0, 0, R * 0.8, R * 1.4, '#3a2a4a');
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 2; i++) { const x = -R * 0.18 + i * R * 0.2; c.beginPath(); c.moveTo(x, -R * 0.18); c.lineTo(x + R * 0.18, 0); c.lineTo(x, R * 0.18); c.closePath(); c.fill(); }
      c.fillStyle = '#ff4a4a'; c.fillRect(-R * 0.3, R * 0.45, R * 0.6 * ((t * 0.9) % 1), R * 0.06);
    } else if (id === 'wankelei') {
      const w = Math.sin(t * 5) * 0.35;
      c.save(); c.translate(0, R * 0.55); c.rotate(w); egg11(c, 0, -R * 0.6, R * 0.42, R * 0.58); c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = R * 0.05;
      for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.6, -R * 0.1, R * 0.2, s > 0 ? -1 : 2.1, s > 0 ? 1 : 4.1); c.stroke(); }
    } else if (id === 'schutkleur') {
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; leafShape(c, Math.cos(a) * R * 0.15, Math.sin(a) * R * 0.15, R * 0.62, a); }
      c.fillStyle = '#ffd23a'; circle(c, 0, 0, R * 0.2); c.fillStyle = '#1a1a0a'; ell(c, 0, 0, R * 0.05, R * 0.15); c.fill();
    } else if (id === 'suiker') {
      c.save(); c.rotate(-0.4);
      c.fillStyle = '#ff6ab0'; ell(c, 0, 0, R * 0.42, R * 0.32); c.fill();
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.38, 0); c.lineTo(s * R * 0.85, -R * 0.3); c.lineTo(s * R * 0.75, 0); c.lineTo(s * R * 0.85, R * 0.3); c.closePath(); c.fill(); }
      c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.07; for (const x of [-0.15, 0.05, 0.25]) { c.beginPath(); c.moveTo(x * R, -R * 0.28); c.lineTo((x - 0.12) * R, R * 0.28); c.stroke(); }
      c.restore();
    }
    // downgrades (the badge is drawn after)
    else if (id === 'schermtijd') {
      phone11(c, R, 0, 0, R * 0.85, R * 1.5, '#1e2030');
      c.fillStyle = 'rgba(160,200,255,0.25)'; circle(c, 0, 0, R * 0.3);
      c.fillStyle = '#9fb0d8'; c.font = `800 ${Math.round(R * 0.32)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Zz', R * 0.05, -R * 0.3 + Math.sin(t * 2) * R * 0.05);
    } else if (id === 'kraakje') {
      miniApple(c, 0, R * 0.1, R * 0.6);
      crackLine11(c, [[-0.1, -0.35], [0.08, -0.15], [-0.08, 0.05], [0.1, 0.25], [-0.02, 0.45]], R);
    } else if (id === 'geenlikes') {
      c.fillStyle = '#4a4a56';
      c.beginPath(); c.moveTo(0, R * 0.55); c.bezierCurveTo(-R * 0.85, -R * 0.05, -R * 0.4, -R * 0.75, 0, -R * 0.25); c.bezierCurveTo(R * 0.4, -R * 0.75, R * 0.85, -R * 0.05, 0, R * 0.55); c.fill();
      c.strokeStyle = '#1a1a22'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(0, -R * 0.25); c.lineTo(-R * 0.1, 0); c.lineTo(R * 0.08, R * 0.15); c.lineTo(0, R * 0.5); c.stroke();
      c.fillStyle = '#e8e8f2'; c.font = `800 ${Math.round(R * 0.42)}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('0', R * 0.55, -R * 0.55);
    } else if (id === 'verkleurd') {
      c.save(); c.translate(0, R * 0.12); applePath(c, R * 0.66); c.clip();
      const g = c.createLinearGradient(-R, -R, R, R); g.addColorStop(0, '#8a6a9a'); g.addColorStop(0.5, '#9aa85a'); g.addColorStop(1, '#6a8aa8');
      c.fillStyle = g; c.fillRect(-R, -R, R * 2, R * 2);
      c.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 4; i++) ell(c, -R * 0.4 + i * R * 0.3, Math.sin(t * 2 + i) * R * 0.2, R * 0.2, R * 0.1, 0.6);
      c.restore();
      c.save(); c.translate(0, R * 0.12); applePath(c, R * 0.66); c.strokeStyle = '#2b2b30'; c.lineWidth = R * 0.08; c.stroke(); c.restore();
    }
  }
  {
    const di0 = drawItemIcon;
    drawItemIcon = function (c, id, S, t = 0) {
      if (!ALL11[id]) return di0.apply(this, arguments);
      const R = S / 2;
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      safe(() => {
        if (NEW_CURSES[id]) curseDisc(c, R, t);
        icon11(c, id, R, t);
        if (NEW_DOWNS[id]) downBadge(c, R);
      });
      c.restore();
    };
  }

  /* ------------------------------------------------------------------ the guide */
  safe(() => UI.buildItemCards());
  safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  safe(() => Meta.check());
  Object.assign(window.__bitten || (window.__bitten = {}), { NEW11: NEW, NEW_CURSES11: NEW_CURSES, NEW_DOWNS11: NEW_DOWNS });
})();


