/* src/78-v14-more-text.js: v14.1: more icon free content. 31 BP pumps, 22 kapsalon cuts, 13 eiser rulings, 14 gedaagde rulings.
   These categories show text only, so they need no icon painters. Effects are written as plain percentages and the
   description is built from them: the sentence and the number cannot drift apart. Only existing mechanics are used. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe78'); if (window.console) console.warn('v14.1', e); return fb; } };

  /* ------------------------------------------------------------------ description builder */
  // each key: [text when n > 0, text when n < 0, which sign hurts, short Clear line up, short Clear line down]
  const FX = {
    dmg:   [(n, u) => `Seeds hit ${n}${u} harder.`, (n, u) => `Seeds hit ${n}${u} softer.`, -1, 'Stronger seeds', 'weaker seeds'],
    fire:  [(n, u) => `You shoot ${n}${u} faster.`, (n, u) => `You shoot ${n}${u} slower.`, -1, 'Faster shots', 'slower shots'],
    speed: [(n, u) => `You walk ${n}${u} faster.`, (n, u) => `You walk ${n}${u} slower.`, -1, 'Faster walking', 'slower walking'],
    range: [(n, u) => `Seeds fly ${n}${u} farther.`, (n, u) => `Seeds fly ${n}${u} less far.`, -1, 'Longer range', 'shorter range'],
    shot:  [(n, u) => `Seeds fly ${n}${u} faster.`, (n, u) => `Seeds fly ${n}${u} slower.`, -1, 'Faster seeds', 'slower seeds'],
    size:  [(n, u) => `Seeds are ${n}${u} bigger.`, (n, u) => `Seeds are ${n}${u} smaller.`, -1, 'Bigger seeds', 'smaller seeds'],
    light: [(n, u) => `Your light reaches ${n}${u} farther.`, (n, u) => `Your light reaches ${n}${u} less far.`, -1, 'More light', 'less light'],
    kb:    [(n, u) => `Bites push you ${n}${u} farther.`, (n, u) => `Bites push you ${n}${u} less.`, 1, 'more knockback', 'less knockback'],
  };
  const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const uc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const apples = (h) => { const a = h / 2; return a <= 1 ? `${a} apple` : `${a} apples`; };
  // fx: { dmg, fire, speed, range, shot, size, light, kb: percent; hp: half apples }, extra: mechanics the pump already knows
  function build(id, name, cost, fx, tail, extra, unit) {
    const o = { id, name, desc: '', mod: {} };
    if (cost != null) o.cost = cost;
    const good = [], bad = [], lines = [], shortGood = [], shortBad = [];
    for (const k in FX) {
      const n = fx[k]; if (!n) continue;
      const F = FX[k];
      o.mod[k === 'fire' ? 'rate' : k] = Math.round((k === 'fire' ? 1 / (1 + n / 100) : 1 + n / 100) * 10000) / 10000;
      const hurt = Math.sign(n) === F[2];
      (hurt ? bad : good).push((n > 0 ? F[0] : F[1])(Math.abs(n), unit));
      (hurt ? shortBad : shortGood).push(n > 0 ? F[3] : F[4]);
    }
    if (fx.hp) o.maxHp = fx.hp;
    if (extra) Object.assign(o, extra);
    if (o.cleanse) { lines.push('Washes off every downgrade you carry.'); shortGood.unshift('Removes downgrades'); }
    if (o.cleanseCurse) { lines.push('Washes off your newest curse.'); shortGood.unshift('Removes a curse'); }
    if (o.healFull) { lines.push('Heals you all the way.'); shortGood.unshift('Full heal'); }
    if (o.heal14) { lines.push(o.heal14 === 1 ? 'Heals you half an apple.' : o.heal14 === 2 ? 'Heals you one apple.' : `Heals you ${apples(o.heal14)}.`); shortGood.unshift('Heals you'); }
    if (fx.hp > 0) { good.unshift(fx.hp === 2 ? '1 more apple of health.' : `${apples(fx.hp)} more health.`); shortGood.push('More health'); }
    if (fx.hp < 0) { bad.unshift(`${apples(-fx.hp)} less health.`); shortBad.push('less health'); }
    lines.push(...good, ...bad);
    if (o.rot14) { lines.push('It leaves you a downgrade.'); shortBad.push('a downgrade'); }
    if (tail) lines.push(tail);
    o.desc = lines.join(' ');
    const g = shortGood.slice(0, 2).map((s, i) => (i ? lc(s) : uc(s))).join(' and ');
    const b = shortBad.slice(0, 2).map(lc).join(' and ');
    o.clear14 = g ? `${g}${b ? ', but ' + b : ''}.` : `${uc(b)}.`;
    return o;
  }

  /* ------------------------------------------------------------------ BP pumps: [id, name, cost, effects, closer, extra] */
  const PUMP_SPECS = [
    ['ruitenwissers', 'Ruitenwissers', 22, { light: 14, fire: -6 }, 'Wipers on high.'],
    ['antivries', 'Antivries', 20, { kb: -35, speed: -5 }, 'Does not freeze, does not hurry.'],
    ['wonderboom', 'Wonderboom', 20, { range: 12, dmg: -4 }, 'Smells like a pine forest. A cheap one.'],
    ['tostihk', 'Tosti Ham Kaas', 24, { fire: -6 }, 'Hot from the grill. Burns your tongue.', { heal14: 2 }],
    ['lotto', 'Lotto Formulier', 28, { dmg: 25, hp: -1 }, 'Six numbers and a prayer.'],
    ['kraslot', 'Kraslot', 22, { fire: 18, dmg: -8 }, 'Scratch, scratch, scratch.'],
    ['energiedrank', 'Energiedrank', 26, { fire: 16, speed: 6, hp: -1 }, 'Gives you wings. Takes your sleep.'],
    ['pechhulp', 'Pechhulp', 26, { speed: -8 }, 'The yellow van is on its way. In forty minutes.', { cleanse: true }],
    ['jerrycan', 'Jerrycan', 24, { hp: 1, speed: -6 }, 'Heavy to carry. Nice to have.'],
    ['trekhaak', 'Trekhaak', 22, { kb: -50, speed: -8 }, 'Something is always attached to you.'],
    ['dakkoffer', 'Dakkoffer', 28, { hp: 2, speed: -10, shot: -6 }, 'Everything fits. Nothing is fast.'],
    ['flitspaal', 'Flitspaal', 28, { dmg: 16, speed: -8 }, 'Slow down. Smile.'],
    ['fietsendrager', 'Fietsendrager', 22, { size: 20, shot: -8 }, 'Everything goes on the back.'],
    ['spatborden', 'Spatborden', 20, { kb: -30, size: -8 }, 'The mud stays off.'],
    ['tankpas', 'Tankpas Gold', 26, { dmg: 8, fire: 8, speed: 4, light: -10 }, 'Points on everything. Small print on the rest.'],
    ['gevuldekoek', 'Gevulde Koek', 22, { dmg: -5 }, 'Round, heavy, almond in the middle.', { heal14: 2 }],
    ['espresso', 'Dubbele Espresso', 24, { fire: 22, light: -12 }, 'Wide awake. Squinting.'],
    ['bapao', 'Bapao', 22, { hp: 1, kb: -20 }, 'Warm, soft and heavy.'],
    ['gasfles', 'Gasfles', 30, { dmg: 22, kb: 30 }, 'Handle with care. You do not.'],
    ['siliconen', 'Siliconenspray', 22, { speed: 14, kb: 40 }, 'Slippery. Everything slides.'],
    ['frituurvet', 'Frituurvet', 24, { dmg: 12, speed: 5, light: -8 }, 'Fuel from the fryer. You smell like a snack bar.'],
    ['rodediesel', 'Rode Diesel', 34, { dmg: 30, light: -10 }, 'Not for road use. Nobody checks.'],
    ['bioethanol', 'Bio Ethanol', 24, { shot: 16, range: -6 }, 'Made from a field of something.'],
    ['zwartehandel', 'Zwarte Handel', 22, { dmg: 35 }, 'Cheaper at the back door. It leaks.', { rot14: true }],
    ['startkabels', 'Startkabels', 26, { fire: 14, speed: 6, light: -8 }, 'A jump start. A small shock.'],
    ['airco', 'Airco', 24, { light: 10, kb: -15, speed: -4 }, 'Cool air, closed windows.'],
    ['autoradio', 'Autoradio', 22, { fire: 10, light: -6 }, 'Turned up loud.'],
    ['navigatie', 'Navigatie', 26, { range: 18, speed: -5 }, 'Turn left in 200 meters. You cannot.'],
    ['winterbanden', 'Winterbanden', 24, { kb: -45, speed: 4, dmg: -5 }, 'Grip, even in July.'],
    ['driehoek', 'Gevarendriehoek', 22, { light: 16, fire: -8 }, 'Warns the others. The snakes too.'],
    ['spoiler', 'Spoiler', 26, { speed: 10, kb: -20, dmg: -4 }, 'Does nothing, officially.'],
  ];
  const NEW_PUMPS = PUMP_SPECS.filter((s) => !PUMP_BY_ID[s[0]]).map((s) => build(s[0], s[1], s[2], s[3], s[4], s[5], '%'));
  const OLD_PUMPS = PUMPS.length;
  for (const p of NEW_PUMPS) { PUMPS.push(p); PUMP_BY_ID[p.id] = p; }

  /* stock9 shuffles the pump list for every tank room, so a longer list moves the seeded random stream of the whole run, even for
     a player who never tanks. Keep the original draw exactly as it was (same Math.random calls, new pumps hidden from it), then deal
     the three pumps again from the full list with a generator of our own. Seeded runs that never buy a new pump stay identical. */
  {
    const st0 = stock9;
    stock9 = function (map) {
      const hold = PUMPS.splice(OLD_PUMPS, PUMPS.length - OLD_PUMPS);
      try { st0(map); } finally { PUMPS.push(...hold); }
      safe(() => {
        const rng = mulberry32((((G.run && G.run.seed) || 1) + (G.levelIdx || 0) * 104729) >>> 0);
        for (const r of map.rooms) {
          if (r.type !== 'tank' || !r.pumps9) continue;
          const deck = PUMPS.slice();
          for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
          r.pumps9.forEach((o, i) => { const p = deck[i % deck.length]; o.offer = p.id; o.cost = clamp(p.cost + Math.floor(rng() * 5) - 2, 20, 40); });
        }
      });
    };
  }

  /* pumps that give something once, right after the fill: heal14 (half apples) and rot14 (a downgrade) */
  {
    const ut0 = updateTank9;
    updateTank9 = function (dt, room) {
      const P = G.player, n0 = P && P.tunes ? P.tunes.length : 0;
      ut0(dt, room);
      if (!P || !P.tunes || P.tunes.length <= n0) return;
      safe(() => {
        const pm = PUMP_BY_ID[P.tunes[P.tunes.length - 1]]; if (!pm) return;
        if (pm.heal14) P.heal(pm.heal14);
        if (pm.rot14) setTimeout(() => { if (G.state === 'play' && G.player === P && P.downs.length < DOWN_CAP) giveDown(); }, 900);
      });
    };
  }

  /* ------------------------------------------------------------------ kapsalon cuts: small boosts for good */
  const CUT_SPECS = [
    ['paardenstaart', 'Paardenstaart', { speed: 6, shot: 6 }, 'Swings behind you.'],
    ['pagekopje', 'Pagekopje', { dmg: 5, light: 5 }, 'Neat, straight, symmetrical.'],
    ['krullen', 'Krullen', { size: 10, kb: -10 }, 'Curls with volume.'],
    ['kaalgeschoren', 'Kaalgeschoren', { kb: -25 }, 'Nothing left to grab.'],
    ['afro', 'Afro', { size: 14, light: 4 }, 'Big and proud.'],
    ['vlechtjes', 'Vlechtjes', { dmg: 4, fire: 4, speed: 4 }, 'Small braids, small gains everywhere.'],
    ['mannenknot', 'Mannenknot', { dmg: 7 }, 'Tied up and focused.'],
    ['kommetje', 'Kommetje', { kb: -30, speed: 3 }, 'Round and safe. A little dull.'],
    ['hanenkam', 'Hanenkam', { range: 15, light: 4 }, 'Stands up and looks far.'],
    ['kuif', 'Kuif', { range: 10, light: 6 }, 'Rises high.'],
    ['scheidingrechts', 'Scheiding Rechts', { shot: 14 }, 'Parted on the right. Sharp.'],
    ['pompadour', 'Pompadour', { dmg: 8, light: 4 }, 'Tall, glossy, confident.'],
    ['highlights', 'Highlights', { light: 12 }, 'Shines in dark rooms.'],
    ['permanent', 'Permanent', { size: 8, range: 6 }, 'Curls that last a year.'],
    ['natgel', 'Natte Gel Look', { shot: 10, speed: 4 }, 'Wet, shiny, fast.'],
    ['undercut', 'Undercut', { speed: 5, fire: 5 }, 'Short sides, quick hands.'],
    ['nummerdrie', 'Nummer Drie', { fire: 6, speed: 4 }, 'One setting for everybody.'],
    ['stekels', 'Stekels', { dmg: 6, kb: -10 }, 'Sharp on the outside.'],
    ['blauwspoeling', 'Blauwe Spoeling', { light: 9, shot: 5 }, 'Granny blue. Glows a bit.'],
    ['visgraat', 'Visgraat', { shot: 12, range: 5 }, 'Woven tight like a fishbone.'],
    ['beehive', 'Beehive', { size: 10, dmg: 4 }, 'Tall and buzzing.'],
    ['kinderknip', 'Kinderknipbeurt', { kb: -20, light: 6 }, 'A lollipop for being brave.'],
  ];
  const NEW_CUTS = CUT_SPECS.filter((s) => !CUT_BY_ID[s[0]]).map((s) => { const o = build(s[0], s[1], null, s[2], s[3], null, ' percent'); delete o.clear14; return o; });
  for (const c of NEW_CUTS) { CUTS.push(c); CUT_BY_ID[c.id] = c; }

  /* ------------------------------------------------------------------ the Rechtbank: more rulings on both sides */
  // every banner text lives here so the texts file can list it
  const TX = {
    volle: ['Ten Volle Toegewezen', 'Granted in full, with interest. A legendary and four coins.'],
    dading: ['Dading', 'Settled out of court. A snack and eight coins.'],
    kort: ['Kort Geding', 'Summary proceedings. Quick and light: five coins and half an apple back.'],
    aanbet: ['Aanbetaling', 'The other side pays a deposit. Twelve coins.'],
    boete: ['Boetebeding', 'The penalty clause bites them, not you. Sixteen coins.'],
    expert: ['Deskundigenbericht', 'The expert report is on your side.'],
    expertNiks: ['Deskundigenbericht', 'The expert agrees with you. Nothing to wash off, so six coins.'],
    bijstand: ['Rechtsbijstand', 'Legal aid pays. A powerup, no questions asked.'],
    nietOnt: ['Niet-Ontvankelijk', 'The claim is inadmissible. The court keeps three coins.'],
    nietOntKlein: ['Niet-Ontvankelijk', 'The claim is inadmissible. The court keeps what little you had.'],
    verjaard: ['Verjaard', 'Too late: the claim expired. The rot moves in.'],
    verjaardKlein: ['Verjaard', 'Too late: the claim expired. Four coins in fees.'],
    tegen: ['Tegenvordering', 'They countersue and win. A curse, and five coins to go away.'],
    cassWin: ['Cassatie: gewonnen', 'The highest court agrees. One more apple, all healed.'],
    cassLoss: ['Cassatie: verworpen', 'The highest court says no. A curse, and up to five coins in fees.'],
    hinder: ['Hinderlijk Gedrag', 'Disturbing the court. Three of them. Clear the room and the court pays.'],
    hinderPay: ['Zitting gesloten', 'Order is restored. Seven coins and a snack.'],
    beslag: ['Beslag', 'The bailiff takes half your coins.'],
    beslagNiks: ['Beslag', 'The bailiff finds nothing to take. He seems upset.'],
    sepot: ['Sepot', 'The prosecutor shrugs. Case closed, here is a snack.'],
    waarsch: ['Waarschuwing', 'Just a warning. Two coins for the walk home.'],
    trans: ['Transactie', 'You pay a small fine. Every downgrade is gone.'],
    transSnack: ['Transactie', 'You pay a small fine. Nothing to wash off, so a snack.'],
    korting: ['Strafkorting', 'Sentence reduced. One apple back.'],
    alibi: ['Alibi', 'A friend vouches for you. Six coins for lunch.'],
    gratie: ['Gratie', 'A full pardon. Every downgrade and curse washed off.'],
    contra: ['Contra-Expertise', 'A second opinion. A powerup, no charge.'],
    uitgesteld: ['Zitting Uitgesteld', 'Hearing postponed. Take a snack for the wait.'],
    kwijt: ['Kwijtschelding', 'Debt forgiven. Your newest curse is gone.'],
    kwijtNiks: ['Kwijtschelding', 'Debt forgiven. Nothing to forgive, so five coins.'],
    raad: ['Raadkamer', 'The judges deliberate. You hear laughing. All healed.'],
    bemid: ['Bemiddeling', 'The mediator splits it down the middle. Four coins and half an apple.'],
    dwang: ['Dwangbevel', 'A writ for old debts. Five coins gone.'],
    dwangKlein: ['Dwangbevel', 'A writ for old debts. Whatever you carry goes.'],
    orde: ['Ordemaatregel', 'The court wants order. Three of them. Clear the room and get a snack for it.'],
    ordePay: ['Orde in de zaal', 'The room is quiet again. Four coins and a snack.'],
    meineed: ['Meineed', 'You lied under oath. A curse.'],
  };
  const B = (key, cls) => UI.banner(TX[key][0], TX[key][1], cls);
  const spot = () => [RW / 2, RH * 0.42 + 30];
  const coinsHeld = () => (G.run && G.run.coins) || 0;
  const lose = (n) => { const k = Math.min(n, coinsHeld()); if (G.run) G.run.coins -= k; return k; };
  const later = (fn, ms) => setTimeout(() => { if (G.state === 'play') safe(fn); }, ms);
  function addSnakes(room, kinds) {
    const P = G.player, used = new Set();
    room.locked = true; room.doorCl = 0; Sfx.doorShut();
    kinds.forEach((k, i) => { const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c); room.snakes.push(new Snake(k, cell.x, cell.y, { delay: 0.4 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) })); });
  }
  const three = () => { const pool = EXTRA_POOL[G.levelDef.set] || EXTRA_POOL.cellar; return [pick(pool), pick(pool), pick(pool)]; };

  const EISER14 = [
    { w: 4, good: 1, run(room, pl) { const [x, y] = spot(); spawnItem(room, x, y, 1); dropCoins(room, pl.x, pl.y - 24, 4); B('volle', 'legend'); } },
    { w: 8, good: 1, run(room, pl) { dropHeart(room, pl.x + 20, pl.y - 20, 2); dropCoins(room, pl.x, pl.y - 24, 8); B('dading'); Sfx.register(); } },
    { w: 9, good: 1, run(room, pl, P) { dropCoins(room, pl.x, pl.y - 24, 5); P.heal(1); B('kort'); } },
    { w: 6, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 12); B('aanbet'); Sfx.register(); } },
    { w: 3, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 16); B('boete'); Sfx.register(); } },
    { w: 6, good: 1, run(room, pl, P) { if (!cleanseOne(P, TX.expert[1])) { dropCoins(room, pl.x, pl.y - 24, 6); B('expertNiks'); } } },
    { w: 5, good: 1, run(room) { const [x, y] = spot(); spawnItem(room, x, y, 0.1); B('bijstand'); } },
    { w: 9, good: 0, run() { B(coinsHeld() >= 3 ? 'nietOnt' : 'nietOntKlein', 'curse'); lose(3); } },
    { w: 7, good: 0, run(room, pl, P) { if (P.downs.length < DOWN_CAP) { B('verjaard', 'curse'); later(() => giveDown(), 900); } else { lose(4); B('verjaardKlein', 'curse'); } } },
    { w: 6, good: 0, run(room, pl) { giveCurse(pickCurse()); dropCoins(room, pl.x, pl.y - 24, 5); B('tegen', 'curse'); } },
    { w: 5, good: 0, run(room, pl, P) {
      if (Math.random() < 0.5) { P.maxHp = Math.min(16, P.maxHp + 2); P.heal(99); B('cassWin', 'legend'); }
      else { giveCurse(pickCurse()); lose(5); B('cassLoss', 'curse'); }
    } },
    { w: 6, good: 0, run(room) { room.taak22 = 'hinder'; addSnakes(room, three()); B('hinder', 'curse'); } },
    { w: 5, good: 0, run() { const n = Math.floor(coinsHeld() / 2); if (n) { lose(n); B('beslag', 'curse'); } else B('beslagNiks', 'curse'); } },
  ];
  const GEDAAGDE14 = [
    { w: 7, good: 1, run(room, pl) { dropHeart(room, pl.x + 20, pl.y - 20, 2); B('sepot'); } },
    { w: 9, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 2); B('waarsch'); } },
    { w: 6, good: 1, run(room, pl, P) { lose(3); if (cleanseDowns(P)) B('trans', 'clean'); else { P.heal(2); B('transSnack'); } } },
    { w: 6, good: 1, run(room, pl, P) { P.heal(2); B('korting', 'clean'); } },
    { w: 6, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 6); B('alibi'); } },
    { w: 3, good: 1, run(room, pl, P) { cleanseDowns(P); while (P.curses.length) removeThing(P, P.curses[0], 'curse'); B('gratie', 'clean'); Sfx.cleanse(); } },
    { w: 4, good: 1, run(room) { const [x, y] = spot(); spawnItem(room, x, y, 0.05); B('contra'); } },
    { w: 8, good: 1, run(room, pl) { dropHeart(room, pl.x + 20, pl.y - 20, 1); B('uitgesteld'); } },
    { w: 5, good: 1, run(room, pl, P) { if (P.curses.length) { removeThing(P, P.curses[P.curses.length - 1], 'curse'); B('kwijt', 'clean'); Sfx.cleanse(); } else { dropCoins(room, pl.x, pl.y - 24, 5); B('kwijtNiks'); } } },
    { w: 4, good: 1, run(room, pl, P) { P.heal(99); B('raad', 'clean'); } },
    { w: 6, good: 1, run(room, pl, P) { dropCoins(room, pl.x, pl.y - 24, 4); P.heal(1); B('bemid'); } },
    { w: 6, good: 0, run() { B(coinsHeld() >= 5 ? 'dwang' : 'dwangKlein', 'curse'); lose(5); } },
    { w: 6, good: 0, run(room) { room.taak22 = 'orde'; addSnakes(room, three()); B('orde', 'curse'); } },
    { w: 4, good: 0, run() { giveCurse(pickCurse()); B('meineed', 'curse'); } },
  ];
  safe(() => {
    const C = window.__bitten && window.__bitten.COURT21; if (!C) return;
    C.eiser.push(...EISER14); C.gedaagde.push(...GEDAAGDE14);
  });
  /* the fight rulings pay when the room is clear */
  {
    const PAY = {
      hinder: (room) => { dropCoins(room, RW / 2, RH / 2, 7); dropHeart(room, RW / 2 + 30, RH / 2, 1); B('hinderPay', 'clean'); },
      orde: (room) => { dropCoins(room, RW / 2, RH / 2, 4); dropHeart(room, RW / 2 + 30, RH / 2, 2); B('ordePay', 'clean'); },
    };
    const cr0 = clearRoom9;
    clearRoom9 = function (room) {
      cr0(room);
      safe(() => { const k = room.taak22; if (k && PAY[k]) { room.taak22 = null; PAY[k](room); } });
    };
  }

  /* ------------------------------------------------------------------ texts file lines, Clear lines, the guide */
  for (const k in TX) for (const s of TX[k]) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
  safe(() => {
    const V = window.__bitten.V12; if (!V || !V.CLEAR12 || !V.CLEAR12.pumps) return;
    for (const p of NEW_PUMPS) V.CLEAR12.pumps[p.id] = p.clear14;
    V.install(NEW_PUMPS, V.CLEAR12.pumps);
  });
  safe(() => {
    const li = (re) => [...document.querySelectorAll('#tab-rooms li')].find((x) => re.test(x.textContent));
    const set = (re, text) => { const l = li(re); const sp = l && l.querySelector('span'); if (sp) sp.textContent = text; };
    const C = window.__bitten && window.__bitten.COURT21;
    if (C) set(/Rechtbank/, `Step onto a plate. Eiser: ${C.eiser.length} rulings, from a legendary to contempt of court. Gedaagde: ${C.gedaagde.length} rulings, mostly small. The other plate closes.`);
    set(/BP Tankstation/, `Three pumps from ${PUMPS.length} kinds of fuel. Each pushes one number up and another down, for 20 to 40 coins. Some wash, heal or leave a mark. The till buys your powerups back.`);
    set(/Kapsalon/, `One cut, 8 coins, from ${CUTS.length} styles: a small boost for good. One in four is a kappersfail. Nobody will say anything.`);
  });
  Object.assign(window.__bitten || (window.__bitten = {}), { MORE14: { NEW_PUMPS, NEW_CUTS, EISER14, GEDAAGDE14, TX, build } });
})();
