/* src/72-v127-wereldmachten.js: v12.7: Wereldmachten. From v12.7. Lines 33641 to 34078 of the v13.7 script. */
/* ===== v12.7: Wereldmachten. Ten powerups, five curses, five downgrades, four BP pumps and six court rulings.
   Gummy worms, a lucky strike, Europe, Ukraine, Russia, the USA, tariffs, China and rice waffles. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { if (window.console) console.warn('v12.7', e); return fb; } };
  const bossK = (sn) => (sn && sn.isBoss ? 0.5 : 1); // room-wide and proc damage is halved on bosses

  /* ------------------------------------------------------------------ powerups */
  const NEW = {
    gummy: { w: 0.8, name: 'Gummy Worms', desc: 'Seeds are gummy worms. A hit slows the snake for 1.5 seconds and the worm stretches to the next snake within reach for 50% damage. Worms fighting worms.', apply(p) { p.gummy33 = true; } },
    luckystrike: { w: 0.8, name: 'Lucky Strike', desc: 'Every 7th seed is lit: 2.5x damage, sets the snake on fire and blows smoke in its face, a short stun. Bosses barely blink. Bad habit, good aim.', apply(p) { p.strike33 = true; p.strikeN33 = 0; } },
    schengen: { w: 0.7, name: 'Schengen', desc: 'Seeds fly straight through rocks, pots, shelves and desks without breaking them. They hit 10% softer. No borders, some paperwork.', apply(p) { p.schengen33 = true; } },
    matroesjka: { w: 0.7, name: 'Matroesjka', desc: 'You carry 2 dolls every floor. A bite opens one instead of hurting you. The dolls come back on the next floor. There is always a smaller one.', apply(p) { p.doll33 = true; p.dolls33 = 2; } },
    borsjtsj: { w: 0.7, name: 'Borsjtsj', desc: 'Clear a room with 2 apples or less: eat a bowl, one apple back. Red soup, works every time.', apply(p) { p.borsjtsj33 = true; } },
    supersize: { w: 0.6, name: 'Super Size', desc: 'One more apple. Seeds 25% bigger and a bit harder. You walk 8% slower. Would you like fries with that.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.seedSize *= 1.25; p.dmg += 0.15; p.speed *= 0.92; p.super33 = true; } },
    revolver: { w: 0.7, name: 'Six Shooter', desc: 'Every 6th shot is a revolver round: 2x damage, 50% faster, pierces. Then half a second to reload. Six, never seven.', apply(p) { p.rev33 = true; p.revN33 = 0; } },
    importheffing: { w: 0.6, name: 'Importheffing', desc: 'Every snake pays at the border: it starts a fight with 15% less length, bosses 5%. Shops charge 15% more. Somebody always pays.', apply(p) { p.tariff33 = true; } },
    rijstwafel: { w: 0.7, name: 'Rijstwafel', desc: 'Every 5th shot is a rice waffle: wide, flat, flies through every snake in its way at 80% damage. Weighs nothing, tastes like it.', apply(p) { p.wafel33 = true; p.wafelN33 = 0; } },
    sterren: { rare: true, name: 'Twaalf Sterren', desc: 'Every 12 kills, a ring of 12 star seeds bursts out of you at 60% damage. Bosses count as 3 kills. Everyone in a circle, nobody in charge.', apply(p) { p.stars33 = true; p.starsN33 = 0; } },
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = NEW[id].rare ? 4.5 : 3;

  /* ------------------------------------------------------------------ curses */
  const NEW_CURSES = {
    brussel: { curse: true, name: 'Brusselse Regels', desc: 'Seeds hit 35% harder and are 10% bigger. You cannot shoot faster than once every 0.3 seconds. There is a form for that.', mod: { dmg: 1.35, size: 1.1 }, flag: 'eu33' },
    handelsoorlog: { curse: true, name: 'Handelsoorlog', desc: 'Seeds hit 30% harder. Shops, pumps and haircuts cost 30% more. Tariffs on everything, mostly on you.', mod: { dmg: 1.3 }, flag: 'trade33' },
    madeinchina: { curse: true, name: 'Made In China', desc: 'Shops cost 40% less. Every powerup you buy has a 1 in 4 chance to come with a downgrade. Cheap, until it is not.', flag: 'china33' },
    suiker: { curse: true, name: 'Suikerspiegel', desc: 'You shoot 22% faster. Every 20 seconds in a fight you crash for 2.5 seconds: slower feet, slower shots. Gummy worms for breakfast.', mod: { rate: 0.78 }, flag: 'sugar33' },
    droom: { curse: true, name: 'American Dream', desc: 'Snakes drop 80% more coins. Every bite costs 4 coins on top. Cannot pay, get a downgrade. The bill always comes.', flag: 'dream33' },
  };
  for (const id in NEW_CURSES) { CURSES[id] = NEW_CURSES[id]; CURSE_IDS.push(id); }

  /* ------------------------------------------------------------------ downgrades */
  const NEW_DOWNS = {
    stekker: { down: true, name: 'Verkeerde Stekker', desc: 'You shoot 7% slower and your light is 8% weaker. Wrong plug, right country.', mod: { rate: 1.07, light: 0.92 } },
    droogwafel: { down: true, name: 'Droge Rijstwafel', desc: 'Seeds hit 7% softer and bites push you 15% farther. You ate nothing and feel it.', mod: { dmg: 0.93, kb: 1.15 } },
    jetlag: { down: true, name: 'Jetlag', desc: 'You walk 25% slower and shoot 15% slower for the first 3 seconds of every fight. Your body is still elsewhere.', flag: 'jet33' },
    gaatje: { down: true, name: 'Gaatje', desc: 'Seeds fly 7% slower and your aim wobbles a little. Too many gummy worms.', mod: { shot: 0.93, wobble: 0.04 } },
    plakvingers: { down: true, name: 'Plakvingers', desc: 'You shoot 5% slower and walk 3% slower. Everything sticks.', mod: { rate: 1.05, speed: 0.97 } },
  };
  for (const id in NEW_DOWNS) { DOWNS[id] = NEW_DOWNS[id]; DOWN_IDS.push(id); }

  /* ------------------------------------------------------------------ BP pumps */
  const NEW_PUMPS = [
    { id: 'unleaded', name: 'Regular Unleaded', desc: 'You walk 12% faster. Seeds hit 6% softer. Cheap, by the gallon.', cost: 18, mod: { speed: 1.12, dmg: 0.94 } },
    { id: 'e10', name: 'E10', desc: 'You shoot 8% faster. Seeds fly 8% less far. Meets every standard, barely.', cost: 22, mod: { rate: 0.92, range: 0.92 } },
    { id: 'zonolie', name: 'Zonnebloemolie', desc: 'Seeds fly 12% faster and your light reaches 8% farther. You shoot 5% slower. Smooth, from the field.', cost: 24, mod: { shot: 1.12, light: 1.08, rate: 1.05 } },
    { id: 'importbenzine', name: 'Importbenzine', desc: 'Seeds hit 18% harder and you walk 4% faster. Costs a lot. Taxed at the border.', cost: 38, mod: { dmg: 1.18, speed: 1.04 } },
  ];
  for (const p of NEW_PUMPS) if (!PUMP_BY_ID[p.id]) { PUMPS.push(p); PUMP_BY_ID[p.id] = p; }

  /* clash tags for these powerups live in CLASH_TAGS13 */

  /* ------------------------------------------------------------------ defaults */
  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      Object.assign(P, { gummy33: false, strike33: false, strikeN33: 0, schengen33: false, doll33: false, dolls33: 0, borsjtsj33: false, super33: false,
        rev33: false, revN33: 0, revHot33: false, tariff33: false, wafel33: false, wafelN33: 0, wafelHot33: false, stars33: false, starsN33: 0,
        deal33: false, bought33: 0, crash33: false });
    };
    for (const k of ['strikeN33', 'dolls33', 'revN33', 'revHot33', 'wafelN33', 'wafelHot33', 'starsN33', 'deal33', 'bought33', 'crash33']) SELL_SKIP.add(k);
  }

  /* ------------------------------------------------------------------ numbers */
  const sugarCrash = (P, room) => !!(P && P.flags && P.flags.sugar33 && room && room.locked && ((P.fightT || 0) % 20) > 17.5);
  const jetOn = (P, room) => !!(P && P.flags && P.flags.jet33 && room && room.locked && (P.fightT || 0) < 3);
  {
    const r0 = rateK9;
    rateK9 = function (P) {
      let k = r0(P);
      const room = G.room;
      if (sugarCrash(P, room)) k *= 1.4;
      if (jetOn(P, room)) k *= 1.15;
      return k;
    };
    const s0 = speedK9;
    speedK9 = function (P, room) {
      let k = s0(P, room);
      if (sugarCrash(P, room)) k *= 0.7;
      if (jetOn(P, room)) k *= 0.75;
      return k;
    };
    const e0 = effDelay;
    effDelay = function (P, noChill) { const d = e0(P, noChill); return P && P.flags && P.flags.eu33 ? Math.max(0.3, d) : d; };
    const pc0 = priceOf;
    priceOf = function (p) {
      const P = G.player; let c = pc0(p);
      if (P) {
        if (P.tariff33) c *= 1.15;
        if (P.flags && P.flags.trade33) c *= 1.3;
        if (P.flags && P.flags.china33) c *= 0.6;
        if (P.deal33) c *= 0.8;
      }
      return Math.max(1, Math.ceil(c));
    };
    const pu0 = pumpCost9;
    pumpCost9 = function (o) { const P = G.player; let c = pu0(o); if (P && P.flags && P.flags.trade33) c *= 1.3; return Math.max(1, Math.ceil(c)); };
    if (typeof cutCost9 === 'function') {
      const cu0 = cutCost9;
      cutCost9 = function (o) { const P = G.player; let c = cu0(o); if (P && P.flags && P.flags.trade33) c *= 1.3; return Math.max(1, Math.ceil(c)); };
    }
    const dc0 = dropCoins;
    dropCoins = function (room, x, y, n) {
      const P = G.player;
      if (P && n > 0 && P.flags && P.flags.dream33) n = Math.floor(n * 1.8 + Math.random() * 0.999);
      return dc0(room, x, y, n);
    };
    /* tariffs: every snake loses a slice of length at the border */
    const is0 = initSnake9;
    initSnake9 = function (sn, o) {
      is0(sn, o);
      const P = G.player;
      if (P && P.tariff33 && !(o && o.preview) && G.state === 'play') safe(() => { sn.hp = sn.maxHp * (sn.isBoss ? 0.95 : 0.85); });
    };
  }

  /* ------------------------------------------------------------------ shooting */
  const GUMMY = [['#6a0a2a', '#ffd0e0', '#ff3a7a'], ['#0a4a1a', '#d0ffd8', '#3ad86a'], ['#5a3a00', '#fff0b0', '#ffc21a'], ['#3a1a6a', '#e8d0ff', '#9a5aff'], ['#6a2a00', '#ffe0c0', '#ff8a1a']];
  {
    const fr0 = fire9;
    fire9 = function (P, base) {
      P.revHot33 = !!(P.rev33 && ++P.revN33 % 6 === 0);
      P.wafelHot33 = !!(P.wafel33 && ++P.wafelN33 % 5 === 0);
      fr0(P, base);
      if (P.revHot33) { P.cool = Math.max(P.cool || 0, 0.5); floatText(P.x, P.y - 26, 'BANG', '#ffd27a'); safe(() => Sfx.gavel()); }
      P.revHot33 = false; P.wafelHot33 = false;
    };
    const sd0 = seed9;
    seed9 = function (P, s, o) {
      sd0(P, s, o);
      if (P.schengen33) { s.schengen33 = true; s.dmg *= 0.9; }
      if (!o.inherit) return;
      if (P.gummy33) s.look9 = GUMMY[Math.floor(Math.random() * GUMMY.length)];
      if (P.strike33 && ++P.strikeN33 % 7 === 0) { s.dmg *= 2.5; s.strike33 = true; s.glow = true; s.look9 = ['#3a2a20', '#ffffff', '#f2ece0']; }
      if (P.revHot33) { s.dmg *= 2; s.vx *= 1.5; s.vy *= 1.5; s.life /= 1.5; s.pierce = true; s.rev33 = true; s.look9 = ['#2a2a30', '#ffe8a0', '#c8a040']; }
      if (P.wafelHot33) { s.pierce = true; s.size *= 1.7; s.dmg *= 0.8; s.wafel33 = true; s.look9 = ['#7a5a2a', '#fff4d8', '#e8d0a0']; }
    };
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = G.player; if (!P || !sn) return;
      safe(() => {
        if (s.strike33 && !s.strikeDone33) {
          s.strikeDone33 = true;
          if (!sn.K.fireproof) sn.burn = Math.max(sn.burn || 0, 2);
          sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.1 : 0.35);
          burst(s.x, s.y, 7, '#b8b8c0', { min: 15, max: 60, lmin: 0.5, lmax: 1 });
          floatText(sn.x, sn.y - 20, 'STRIKE', '#ff5a3a');
        }
        if (s.wafel33 && Math.random() < 0.6) burst(s.x, s.y, 3, '#e8d0a0', { kind: 'shard', min: 20, max: 70, lmin: 0.3, lmax: 0.6 });
        if (P.gummy33) {
          sn.slow = Math.max(sn.slow || 0, 1.5);
          if (!s.child && !s.gummy33) {
            const tg = room.snakes.filter((o) => o !== sn && o.canBeHit() && !o.burrowed).sort((a, b) => dist2(a.x, a.y, s.x, s.y) - dist2(b.x, b.y, s.x, s.y))[0];
            if (tg && dist(tg.x, tg.y, s.x, s.y) < 110) {
              const n = makeSeed(P, s.x, s.y, Math.atan2(tg.y - s.y, tg.x - s.x), { mult: 0.5 * bossK(tg), size: 0.8, noCan: true });
              n.child = true; n.gummy33 = true; n.hits = new Set([sn]); n.look9 = s.look9 || GUMMY[0];
            }
          }
        }
      });
    };
  }

  /* ------------------------------------------------------------------ kills, clears, floors */
  {
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0.apply(this, arguments);
      if (!P || !P.stars33 || !room) return;
      safe(() => {
        P.starsN33 += sn && sn.isBoss ? 3 : 1;
        if (P.starsN33 < 12) return;
        P.starsN33 = 0;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          const n = makeSeed(P, P.x, P.y - 2, a, { mult: 0.6, size: 0.9, noCan: true });
          n.child = true; n.glow = true; n.look9 = ['#0a2a7a', '#fff6a0', '#ffd21a'];
        }
        floatText(P.x, P.y - 40, 'STERREN', '#ffd21a', true);
        burst(P.x, P.y, 14, '#ffd21a', { min: 40, max: 140, lmin: 0.3, lmax: 0.7, glow: true });
        Sfx.zap();
      });
    };
    const cr0 = clearRoom9;
    clearRoom9 = function (room) {
      cr0(room);
      const P = G.player; if (!P || P.dying > 0) return;
      safe(() => {
        if (P.borsjtsj33 && P.hp <= 4 && P.hp < P.maxHp) {
          P.heal(2); floatText(P.x, P.y - 40, 'BORSJTSJ', '#c3243a', true);
          burst(P.x, P.y, 10, '#c3243a', { min: 20, max: 80, lmin: 0.3, lmax: 0.6 });
        }
      });
    };
    const fl0 = floor9;
    floor9 = function (P) {
      fl0(P);
      if (!P) return;
      P.deal33 = false;
      if (P.doll33) P.dolls33 = 2;
    };
  }

  /* ------------------------------------------------------------------ getting bitten: dolls first, then the bill */
  {
    const h0 = Player.prototype.hurt;
    Player.prototype.hurt = function (n, sx, sy, src) {
      if (this === G.player && n > 0 && this.doll33 && this.dolls33 > 0 && !(this.inv > 0) && !(this.dashT > 0) && !(this.dying > 0) && !this.god) {
        this.dolls33--; this.inv = Math.max(this.inv || 0, 0.9);
        floatText(this.x, this.y - 30, this.dolls33 ? 'MATROESJKA' : 'LAATSTE POP', '#ff6a4a', true);
        burst(this.x, this.y, 12, '#e8402a', { kind: 'shard', min: 40, max: 130, lmin: 0.4, lmax: 0.8 });
        safe(() => Sfx.shell());
        return;
      }
      const before = this.hp;
      const r = h0.apply(this, arguments);
      if (this === G.player && this.hp < before && this.flags && this.flags.dream33 && G.run) safe(() => {
        const c = G.run.coins || 0;
        if (c >= 4) { G.run.coins = c - 4; floatText(this.x, this.y - 44, 'REKENING -4', '#ffd84a'); }
        else { G.run.coins = 0; if (this.downs.length < DOWN_CAP) giveDown(); floatText(this.x, this.y - 44, 'ONVERZEKERD', '#ff7a8a'); }
      });
      return r;
    };
  }

  /* ------------------------------------------------------------------ the frame: sugar crash text, cheap shopping */
  {
    const pu0 = Player.prototype.update;
    Player.prototype.update = function (dt, room) {
      pu0.call(this, dt, room);
      if (this !== G.player || !G.run) return;
      safe(() => {
        const cr = sugarCrash(this, room);
        if (cr && !this.crash33) { floatText(this.x, this.y - 30, 'SUIKERDIP', '#ff9ad0'); }
        this.crash33 = cr;
        const b = G.run.bought || 0;
        if (b > this.bought33) {
          if (this.flags && this.flags.china33 && Math.random() < 0.25 && this.downs.length < DOWN_CAP) setTimeout(() => { if (G.state === 'play') giveDown(); }, 700);
          this.bought33 = b;
        } else if (b < this.bought33) this.bought33 = b;
      });
    };
  }

  /* ------------------------------------------------------------------ the court */
  safe(() => {
    const C = window.__bitten && window.__bitten.COURT21; if (!C) return;
    C.eiser.push(
      { w: 6, good: 1, run(room, pl, P) { dropCoins(room, pl.x, pl.y - 24, 8); P.deal33 = true; UI.banner('Handelsakkoord', 'A trade deal. Eight coins, and shops are 20 percent cheaper for the rest of this floor.'); Sfx.register(); } },
      { w: 4, good: 1, run(room, pl, P) { let n = 0; if (P.curses.length && removeThing(P, P.curses[P.curses.length - 1], 'curse')) n++; if (P.downs.length && removeThing(P, P.downs[P.downs.length - 1], 'down')) n++; if (n) UI.banner('Europees Hof', 'The highest court. Your newest curse and newest downgrade are dropped.', 'clean'); else { dropCoins(room, pl.x, pl.y - 24, 6); UI.banner('Europees Hof', 'Nothing to drop. Six coins for the trip to Luxembourg.'); } } },
      { w: 6, good: 0, run(room, pl, P) { const c = G.run.coins || 0; if (c >= 6) { G.run.coins = c - 6; UI.banner('Importheffing', 'The court rules you imported it. Duties: 6 coins.', 'curse'); } else { G.run.coins = 0; if (P.downs.length < DOWN_CAP) giveDown(); UI.banner('Importheffing', 'Duties you cannot pay. The rest in rot.', 'curse'); } } },
    );
    C.gedaagde.push(
      { w: 5, good: 1, run(room, pl) { for (let i = 0; i < 3; i++) dropCoins(room, pl.x - 24 + i * 24, pl.y - 24, 2); UI.banner('Matroesjka Getuige', 'A witness inside a witness inside a witness. Nobody agrees. Case dropped, 6 coins.'); } },
      { w: 5, good: 1, run(room, pl, P) { P.heal(2); dropCoins(room, pl.x, pl.y - 24, 2); UI.banner('Gummy Schikking', 'Settled in gummy worms. One apple back and 2 coins.'); } },
      { w: 4, good: 0, run(room, pl, P) { const smoker = (P.items || []).some((id) => id === 'luckystrike' || id === 'nicotine' || id === 'peuk'); const c = G.run.coins || 0; G.run.coins = Math.max(0, c - 4); if (smoker && P.downs.length < DOWN_CAP) giveDown(DOWNS.hoest ? 'hoest' : undefined); UI.banner('Rookverbod', smoker ? 'Smoking indoors. 4 coins, and a cough to remember it by.' : 'Smoking indoors. You did not, someone did. 4 coins.', 'curse'); } },
    );
  });

  /* ------------------------------------------------------------------ icons */
  const O = '#1a1210';
  function txt(c, s, size, col, y) { c.font = `900 ${Math.round(size)}px "Barlow Condensed", "Arial Narrow", Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = Math.max(1, size * 0.16); c.strokeStyle = O; c.strokeText(s, 0, y || 0); c.fillStyle = col; c.fillText(s, 0, y || 0); }
  function star(c, x, y, r, col) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, rr = i % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); }
  function gummyWorm(c, R, t, col, hi, ox, oy, k) {
    const n = 8, pts = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1); pts.push([ox + lerp(-R * 0.75, R * 0.7, u) * k, oy + Math.sin(u * 5 + t * 3) * R * 0.18 * k]); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = O; c.lineWidth = R * 0.34 * k; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    const half = Math.floor(n / 2);
    c.lineWidth = R * 0.24 * k;
    c.strokeStyle = col; c.beginPath(); pts.slice(0, half + 1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = hi; c.beginPath(); pts.slice(half).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 1; i < n; i += 2) circle(c, pts[i][0], pts[i][1] - R * 0.05 * k, R * 0.025 * k);
  }
  function icon(c, id, R, t) {
    if (id === 'gummy') {
      gummyWorm(c, R, t, '#ff3a7a', '#ffc21a', 0, -R * 0.28, 1);
      gummyWorm(c, R, t + 1.3, '#3ad86a', '#9a5aff', 0, R * 0.32, 0.9);
    } else if (id === 'luckystrike') {
      c.save(); c.rotate(-0.35);
      c.fillStyle = '#f4efe4'; c.fillRect(-R * 0.75, -R * 0.12, R * 1.1, R * 0.24);
      c.fillStyle = '#d88a3a'; c.fillRect(-R * 0.75, -R * 0.12, R * 0.34, R * 0.24);
      c.strokeStyle = O; c.lineWidth = R * 0.05; c.strokeRect(-R * 0.75, -R * 0.12, R * 1.1, R * 0.24);
      const g = 0.6 + 0.4 * Math.sin(t * 6);
      c.fillStyle = `rgba(255,${Math.round(80 + 60 * g)},40,1)`; c.fillRect(R * 0.35, -R * 0.12, R * 0.12, R * 0.24);
      c.restore();
      c.fillStyle = 'rgba(200,200,210,0.55)';
      for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; circle(c, R * 0.35 + Math.sin(ph * 6 + i) * R * 0.12, -R * 0.35 - ph * R * 0.6, R * (0.1 + ph * 0.12)); }
      c.strokeStyle = '#ffd21a'; c.lineWidth = R * 0.09;
      c.beginPath(); c.moveTo(-R * 0.55, R * 0.25); c.lineTo(-R * 0.3, R * 0.5); c.lineTo(-R * 0.42, R * 0.55); c.lineTo(-R * 0.15, R * 0.85); c.stroke();
    } else if (id === 'schengen') {
      c.fillStyle = '#1f3fa8'; rrect(c, -R * 0.85, -R * 0.6, R * 1.7, R * 1.2, R * 0.08); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; star(c, Math.cos(a) * R * 0.38, Math.sin(a) * R * 0.38, R * 0.08, '#ffd21a'); }
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = R * 0.07; c.setLineDash([R * 0.12, R * 0.1]);
      c.beginPath(); c.moveTo(-R * 1.0, R * 0.78); c.lineTo(R * 1.0, R * 0.78); c.stroke(); c.setLineDash([]);
      seedIcon(c, R * 0.55 - ((t * 0.5) % 1) * R * 1.1, R * 0.78, R * 0.16, Math.PI / 2);
    } else if (id === 'matroesjka') {
      for (const [x, k] of [[R * 0.5, 0.55], [R * 0.05, 0.75], [-R * 0.42, 1]]) {
        const h = R * 0.9 * k, w = R * 0.42 * k;
        c.save(); c.translate(x, R * 0.15);
        ell(c, 0, h * 0.18, w, h * 0.62); c.fillStyle = '#d8262e'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
        ell(c, 0, -h * 0.38, w * 0.72, w * 0.72); c.fillStyle = '#d8262e'; c.fill(); c.stroke();
        ell(c, 0, -h * 0.36, w * 0.5, w * 0.48); c.fillStyle = '#fbe6cc'; c.fill();
        c.fillStyle = '#1a1210'; circle(c, -w * 0.18, -h * 0.4, R * 0.03 * k + 0.4); circle(c, w * 0.18, -h * 0.4, R * 0.03 * k + 0.4);
        c.fillStyle = 'rgba(255,90,100,0.6)'; circle(c, -w * 0.28, -h * 0.3, w * 0.1); circle(c, w * 0.28, -h * 0.3, w * 0.1);
        c.fillStyle = '#ffd21a'; circle(c, 0, h * 0.25, w * 0.32); c.fillStyle = '#3a8a3a'; circle(c, 0, h * 0.25, w * 0.14);
        c.restore();
      }
    } else if (id === 'borsjtsj') {
      ell(c, 0, R * 0.15, R * 0.85, R * 0.32); c.fillStyle = '#8a1424'; c.fill();
      c.beginPath(); c.moveTo(-R * 0.85, R * 0.15); c.quadraticCurveTo(-R * 0.75, R * 0.9, 0, R * 0.9); c.quadraticCurveTo(R * 0.75, R * 0.9, R * 0.85, R * 0.15); c.closePath();
      c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.strokeStyle = '#1f5fb0'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(-R * 0.7, R * 0.45); c.quadraticCurveTo(0, R * 0.6, R * 0.7, R * 0.45); c.stroke();
      ell(c, 0, R * 0.15, R * 0.85, R * 0.32); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = '#fff6ea'; ell(c, R * 0.12, R * 0.1, R * 0.2, R * 0.08); c.fill();
      c.fillStyle = '#4a9a2a'; circle(c, R * 0.2, R * 0.05, R * 0.05);
      c.strokeStyle = 'rgba(255,240,230,0.55)'; c.lineWidth = R * 0.05;
      for (let i = 0; i < 3; i++) { const x = (i - 1) * R * 0.3, ph = Math.sin(t * 2 + i) * R * 0.06; c.beginPath(); c.moveTo(x, -R * 0.15); c.quadraticCurveTo(x + R * 0.12 + ph, -R * 0.45, x, -R * 0.75); c.stroke(); }
    } else if (id === 'supersize') {
      c.fillStyle = '#d8262e'; c.beginPath(); c.moveTo(-R * 0.55, -R * 0.55); c.lineTo(R * 0.55, -R * 0.55); c.lineTo(R * 0.42, R * 0.85); c.lineTo(-R * 0.42, R * 0.85); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = '#f2ecd8'; c.fillRect(-R * 0.6, -R * 0.68, R * 1.2, R * 0.16); c.strokeRect(-R * 0.6, -R * 0.68, R * 1.2, R * 0.16);
      c.strokeStyle = '#ffd21a'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(R * 0.1, -R * 0.68); c.lineTo(R * 0.3, -R * 1.0); c.stroke();
      txt(c, 'XXL', R * 0.42, '#ffd21a', R * 0.18);
    } else if (id === 'revolver') {
      c.save(); c.rotate(-0.2);
      c.fillStyle = '#3a3a44'; c.fillRect(-R * 0.15, -R * 0.42, R * 1.05, R * 0.22); c.strokeStyle = O; c.lineWidth = R * 0.05; c.strokeRect(-R * 0.15, -R * 0.42, R * 1.05, R * 0.22);
      ell(c, -R * 0.15, -R * 0.24, R * 0.3, R * 0.24); c.fillStyle = '#5a5a66'; c.fill(); c.stroke();
      c.fillStyle = '#7a4a22'; c.beginPath(); c.moveTo(-R * 0.4, -R * 0.15); c.lineTo(-R * 0.15, -R * 0.1); c.lineTo(-R * 0.35, R * 0.75); c.lineTo(-R * 0.72, R * 0.68); c.closePath(); c.fill(); c.stroke();
      c.restore();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t; c.fillStyle = i ? '#c8a040' : '#ffe8a0'; circle(c, R * 0.55 + Math.cos(a) * R * 0.22, R * 0.45 + Math.sin(a) * R * 0.22, R * 0.07); }
    } else if (id === 'importheffing') {
      rrect(c, -R * 0.7, -R * 0.35, R * 1.4, R * 1.0, R * 0.06); c.fillStyle = '#b8853a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.strokeStyle = '#7a5520'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.7, R * 0.05); c.lineTo(R * 0.7, R * 0.05); c.stroke();
      c.save(); c.translate(R * 0.2, -R * 0.3); c.rotate(-0.25);
      rrect(c, -R * 0.42, -R * 0.2, R * 0.84, R * 0.4, R * 0.04); c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = '#c3243a'; c.lineWidth = R * 0.06; c.stroke();
      txt(c, '+15%', R * 0.3, '#c3243a', R * 0.01);
      c.restore();
    } else if (id === 'rijstwafel') {
      ell(c, 0, 0, R * 0.82, R * 0.62); c.fillStyle = '#ead6a8'; c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = 'rgba(160,120,60,0.35)';
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i / 26) * R * 0.66; circle(c, Math.cos(a) * r, Math.sin(a) * r * 0.75, R * 0.06); }
      c.fillStyle = 'rgba(255,250,235,0.7)';
      for (let i = 0; i < 12; i++) { const a = i * 1.7 + 1, r = Math.sqrt(i / 12) * R * 0.6; ell(c, Math.cos(a) * r, Math.sin(a) * r * 0.75, R * 0.07, R * 0.04, a); c.fill(); }
    } else if (id === 'sterren') {
      c.fillStyle = '#163ea0'; circle(c, 0, 0, R * 0.95); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + t * 0.4; star(c, Math.cos(a) * R * 0.64, Math.sin(a) * R * 0.64, R * 0.13, '#ffd21a'); }
      sparkle(c, 0, 0, R * (0.2 + 0.05 * Math.sin(t * 4)), '#fff6c8');
    }
    /* curses */
    else if (id === 'brussel') {
      rrect(c, -R * 0.55, -R * 0.65, R * 1.1, R * 1.3, R * 0.05); c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
      c.fillStyle = '#163ea0'; c.fillRect(-R * 0.55, -R * 0.65, R * 1.1, R * 0.3);
      for (let i = 0; i < 6; i++) star(c, -R * 0.4 + i * R * 0.16, -R * 0.5, R * 0.05, '#ffd21a');
      c.strokeStyle = 'rgba(40,40,50,0.6)'; c.lineWidth = R * 0.04;
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-R * 0.42, -R * 0.2 + i * R * 0.17); c.lineTo(R * (0.42 - (i % 2) * 0.15), -R * 0.2 + i * R * 0.17); c.stroke(); }
      c.save(); c.translate(R * 0.3, R * 0.45); c.rotate(-0.3); txt(c, 'NEE', R * 0.3, '#c3243a', 0); c.restore();
    } else if (id === 'handelsoorlog') {
      for (const [x, col] of [[-R * 0.35, '#c3243a'], [R * 0.35, '#1f5fb0']]) { rrect(c, x - R * 0.3, -R * 0.1, R * 0.6, R * 0.6, R * 0.04); c.fillStyle = col; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke(); }
      c.strokeStyle = '#f2ecd8'; c.lineWidth = R * 0.09;
      c.beginPath(); c.moveTo(-R * 0.5, -R * 0.4); c.lineTo(R * 0.5, -R * 0.4); c.moveTo(R * 0.32, -R * 0.55); c.lineTo(R * 0.5, -R * 0.4); c.lineTo(R * 0.32, -R * 0.25); c.stroke();
      c.beginPath(); c.moveTo(R * 0.5, -R * 0.62); c.lineTo(-R * 0.5, -R * 0.62); c.stroke();
      txt(c, '%', R * 0.4, '#ffd21a', R * 0.22);
    } else if (id === 'madeinchina') {
      rrect(c, -R * 0.6, -R * 0.45, R * 1.2, R * 0.9, R * 0.05); c.fillStyle = '#c8a46a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
      c.fillStyle = '#f2ecd8'; c.fillRect(-R * 0.45, -R * 0.15, R * 0.9, R * 0.32);
      c.fillStyle = '#2a2a30'; c.font = `800 ${Math.round(R * 0.17)}px "Barlow Condensed", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MADE IN CHINA', 0, R * 0.01);
      c.strokeStyle = '#7a5520'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(R * 0.15, -R * 0.45); c.lineTo(-R * 0.1, -R * 0.2); c.lineTo(R * 0.05, -R * 0.15); c.stroke();
    } else if (id === 'suiker') {
      gummyWorm(c, R * 0.9, t, '#ff3a7a', '#ffc21a', 0, -R * 0.15, 1);
      c.strokeStyle = '#ff9ad0'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 0.6, R * 0.55); c.lineTo(-R * 0.2, R * 0.3); c.lineTo(R * 0.1, R * 0.5); c.lineTo(R * 0.6, R * 0.85); c.stroke();
    } else if (id === 'droom') {
      c.fillStyle = '#3a8a4a'; rrect(c, -R * 0.75, -R * 0.4, R * 1.5, R * 0.8, R * 0.06); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
      c.strokeStyle = '#c8e8c0'; c.lineWidth = R * 0.04; rrect(c, -R * 0.65, -R * 0.3, R * 1.3, R * 0.6, R * 0.04); c.stroke();
      txt(c, '$', R * 0.55, '#c8e8c0', 0);
      c.fillStyle = '#f2ecd8'; c.save(); c.translate(R * 0.45, R * 0.5); c.rotate(0.2); c.fillRect(-R * 0.25, -R * 0.15, R * 0.5, R * 0.36); c.restore();
      c.save(); c.translate(R * 0.45, R * 0.52); c.rotate(0.2); txt(c, '-4', R * 0.24, '#c3243a', 0); c.restore();
    }
    /* downgrades */
    else if (id === 'stekker') {
      c.fillStyle = '#e8e2d0'; rrect(c, -R * 0.45, -R * 0.3, R * 0.9, R * 0.75, R * 0.2); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
      c.fillStyle = '#9a9aa0'; c.fillRect(-R * 0.25, -R * 0.62, R * 0.1, R * 0.34); c.fillRect(R * 0.15, -R * 0.62, R * 0.1, R * 0.34); c.fillRect(-R * 0.05, -R * 0.62, R * 0.1, R * 0.28);
      c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.45); c.quadraticCurveTo(R * 0.1, R * 0.8, -R * 0.4, R * 0.85); c.stroke();
    } else if (id === 'droogwafel') {
      c.save(); c.beginPath(); c.moveTo(-R, -R); c.lineTo(R * 0.15, -R); c.lineTo(-R * 0.05, 0); c.lineTo(R * 0.2, R); c.lineTo(-R, R); c.closePath(); c.clip();
      ell(c, 0, 0, R * 0.75, R * 0.58); c.fillStyle = '#d8c090'; c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = R * 0.06; c.stroke(); c.restore();
      c.fillStyle = '#d8c090'; for (const [x, y, r] of [[0.35, -0.2, 0.08], [0.5, 0.15, 0.06], [0.3, 0.35, 0.05]]) circle(c, x * R, y * R, r * R);
    } else if (id === 'jetlag') {
      c.fillStyle = '#e8e2d0'; circle(c, 0, 0, R * 0.62); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.07; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t * 3) * R * 0.45, Math.sin(t * 3) * R * 0.45); c.moveTo(0, 0); c.lineTo(-R * 0.25, -R * 0.2); c.stroke();
      c.fillStyle = '#9aa8c8'; c.save(); c.translate(R * 0.5, -R * 0.55); c.rotate(-0.6); c.beginPath(); c.moveTo(-R * 0.3, 0); c.lineTo(R * 0.3, 0); c.lineTo(R * 0.1, -R * 0.06); c.lineTo(0, -R * 0.25); c.lineTo(-R * 0.05, -R * 0.05); c.closePath(); c.fill(); c.restore();
    } else if (id === 'gaatje') {
      c.beginPath(); c.moveTo(-R * 0.5, -R * 0.55); c.quadraticCurveTo(0, -R * 0.8, R * 0.5, -R * 0.55); c.quadraticCurveTo(R * 0.55, R * 0.1, R * 0.3, R * 0.75); c.lineTo(R * 0.12, R * 0.2); c.lineTo(-R * 0.12, R * 0.2); c.lineTo(-R * 0.3, R * 0.75); c.quadraticCurveTo(-R * 0.55, R * 0.1, -R * 0.5, -R * 0.55); c.closePath();
      c.fillStyle = '#f4efe4'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
      c.fillStyle = '#3a2a20'; circle(c, R * 0.1, -R * 0.35, R * 0.12);
    } else if (id === 'plakvingers') {
      c.fillStyle = '#fbe6cc'; for (let i = 0; i < 4; i++) { rrect(c, -R * 0.55 + i * R * 0.28, -R * 0.6 + Math.abs(i - 1.5) * R * 0.1, R * 0.22, R * 0.75, R * 0.1); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.04; c.stroke(); }
      c.fillStyle = 'rgba(255,58,122,0.65)'; for (const [x, y] of [[-0.3, 0.25], [0.1, 0.32], [0.4, 0.2]]) { ell(c, x * R, y * R, R * 0.12, R * 0.2); c.fill(); }
    }
  }
  const ICONS = new Set([...Object.keys(NEW), ...Object.keys(NEW_CURSES), ...Object.keys(NEW_DOWNS)]);
  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (!ICONS.has(id)) return di0.apply(this, arguments);
    const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    safe(() => {
      if (NEW_CURSES[id]) curseDisc(c, R, t);
      icon(c, id, R, t);
      if (NEW_DOWNS[id]) downBadge(c, R);
    });
    c.restore();
  };

  /* ------------------------------------------------------------------ texts, the Clear lines, the guide */
  for (const s of ['BANG', 'STRIKE', 'STERREN', 'BORSJTSJ', 'MATROESJKA', 'LAATSTE POP', 'REKENING -4', 'ONVERZEKERD', 'SUIKERDIP']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const V = window.__bitten.V12; if (!V || !V.CLEAR12) return;
    const L = V.CLEAR12;
    Object.assign(L.items, {
      gummy: 'Seeds slow snakes and jump to the next one.', luckystrike: 'Every 7th seed burns and stuns.', schengen: 'Seeds fly through obstacles.',
      matroesjka: 'Two bites blocked every floor.', borsjtsj: 'Low on health? Clearing a room heals.', supersize: 'More health, bigger seeds, slower feet.',
      revolver: 'Every 6th shot is a piercing heavy round.', importheffing: 'Snakes start shorter, shops cost more.', rijstwafel: 'Every 5th shot is a wide piercing waffle.',
      sterren: 'Every 12 kills, a ring of seeds.',
    });
    if (L.curses) Object.assign(L.curses, { brussel: 'Harder seeds, capped fire rate.', handelsoorlog: 'Harder seeds, everything costs more.', madeinchina: 'Cheap shops, buys can bring rot.', suiker: 'Faster shots, sugar crashes.', droom: 'More coins, bites cost coins.' });
    if (L.downs) Object.assign(L.downs, { stekker: 'Slower shots, less light.', droogwafel: 'Softer seeds, more knockback.', jetlag: 'Slow start in every fight.', gaatje: 'Slower seeds, shaky aim.', plakvingers: 'A bit slower at everything.' });
    if (L.pumps) Object.assign(L.pumps, { unleaded: 'Faster feet, softer seeds.', e10: 'Faster shots, less range.', zonolie: 'Faster seeds, more light, slower shots.', importbenzine: 'Harder seeds, faster feet, expensive.' });
    V.install(NEW, L.items); V.install(NEW_CURSES, L.curses || {}); V.install(NEW_DOWNS, L.downs || {}); V.install(NEW_PUMPS, L.pumps || {});
  });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  Object.assign(window.__bitten || (window.__bitten = {}), { WORLD33: { NEW, NEW_CURSES, NEW_DOWNS, NEW_PUMPS } });
})();

