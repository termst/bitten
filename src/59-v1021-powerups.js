/* src/59-v1021-powerups.js: v10.21: powerups, legendaries, locked powerups, curses, downgrades, pumps. From v10.21. Lines 26054 to 26948 of the v13.7 script. */
/* ===== v10.21: 15 powerups, 15 legendaries, 15 locked powerups with 15 achievements, 15 curses, 15 downgrades,
   new court rulings (eiser and gedaagde), 15 new BP pumps. Bonuses from this patch stack additively and are capped. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe59'); console.error(e); return fb; } };
  const bossK = (sn) => (sn.isBoss ? 0.5 : 1); // room-wide and proc damage is halved on bosses

  /* ------------------------------------------------------------------ powerups */
  const NEW = {
    stamppot: { name: 'Stamppot', desc: 'One more apple, one healed. Every new floor heals half an apple.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.stamp21 = true; } },
    veter: { name: 'Dropveter', desc: 'Every 4th seed is a licorice lace: it pierces and slows.', apply(p) { p.veter21 = true; } },
    fietspomp: { name: 'Fietspomp', desc: 'Every 10 seconds in a fight, your next seed is bigger and hits double.', apply(p) { p.pomp21 = true; p.pompT21 = 5; } },
    statiegeld: { name: 'Statiegeld', desc: 'Every 10th kill drops two coins. The till pays 50% more.', apply(p) { p.statie21 = true; } },
    mosterd: { name: 'Zaanse Mosterd', desc: '4 hits on the same snake: it takes 1.5x your damage and freezes briefly.', apply(p) { p.mosterd21 = true; } },
    schaatsen: { name: 'Schaatsen', desc: 'Walk 10% faster. After 2 seconds of moving, seeds hit 15% harder.', apply(p) { p.schaats21 = true; } },
    regenjas: { name: 'Regenjas', desc: 'The first spit that hits you in every room does nothing.', apply(p) { p.jas21 = true; } },
    frikandel: { name: 'Frikandel Speciaal', desc: 'Every kill splashes sauce: nearby snakes slow down and take a little damage.', apply(p) { p.frik21 = true; } },
    automaat: { name: 'Muurautomaat', desc: 'Every 3rd room you clear drops a whole apple slice.', apply(p) { p.auto21 = true; p.autoN21 = 0; } },
    kwartje: { name: 'Kwartje', desc: 'Every 10th seed is a coin: 50% more damage, and a kill with it drops a coin.', apply(p) { p.kwartje21 = true; } },
    appelmoes: { name: 'Appelmoes', desc: 'At one apple or less: slices heal double, walk 15% faster.', apply(p) { p.moes21 = true; } },
    uitsmijter: { name: 'Uitsmijter', desc: 'Whatever bites you gets thrown back and dazed.', apply(p) { p.smijt21 = true; } },
    koekoek: { name: 'Koekoeksklok', desc: 'Every 12 seconds in a fight, the closest snake takes 2.5x your damage.', apply(p) { p.koekoek21 = true; p.koekT21 = 6; } },
    tegeltje: { w: 1.1, name: 'Tegeltje', desc: '6% more damage, 6% faster shots, 4% faster feet.', apply(p) { p.tegel21 = true; } },
    tosti: { name: 'Tosti', desc: 'Every 7th shot is a tosti: bigger, harder, sets snakes on fire.', apply(p) { p.tosti21 = true; } },
    // legendaries
    elfsteden: { rare: true, name: 'Elfstedentocht', desc: 'Every room cleared on this floor: 3% more damage, 2% more speed, up to 11 rooms. Resets each floor.', apply(p) { p.elf21 = 0; } },
    koningsdag: { rare: true, name: 'Koningsdag', desc: '1 second into every fight, every snake takes 2x your damage and is dazed. Bosses take half.', apply(p) { p.kd21 = true; } },
    pakjesavond: { rare: true, name: 'Pakjesavond', desc: 'One more apple. Every boss you beat drops an extra powerup.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.pakjes21 = true; } },
    nachtwacht: { rare: true, name: 'De Nachtwacht', desc: 'Seeds hit 12 percent harder, and 35 percent harder in dark rooms. Old painting, good eyes.', apply(p) { p.nacht21 = true; } },
    appelboom: { rare: true, name: 'De Appelboom', desc: 'Every 15 seconds in a fight, an apple slice drops next to you.', apply(p) { p.boom21 = true; p.boomT21 = 8; } },
    kernsplitsing: { rare: true, name: 'Kernsplitsing', desc: 'Kills explode for 1.5x your damage. Max 3 blasts a second.', apply(p) { p.kern21 = true; } },
    koets: { rare: true, name: 'De Gouden Koets', desc: 'Snakes drop double coins. Shops 20% cheaper.', apply(p) { p.koets21 = true; } },
    drieling: { rare: true, name: 'Drieling', desc: 'Every shot adds two seeds at 70% damage.', apply(p) { p.drie21 = true; } },
    zwartgat: { rare: true, name: 'Zwart Gat', desc: 'Every 14 seconds in a fight, a black hole where you aim pulls snakes in and hurts them for 2 seconds. Bosses: no pull, half damage.', apply(p) { p.gat21 = true; p.gatT21 = 6; } },
    kampvuur: { rare: true, name: 'Kampvuur', desc: 'Stand still 1.5 seconds in a fight to light a fire. Near it: heal half an apple every 8 seconds, seeds burn.', apply(p) { p.vuur21 = true; } },
    vuurwerk: { rare: true, name: 'Vuurwerkpijl', desc: 'Every 5th shot is a rocket that explodes for 2x your damage.', apply(p) { p.pijl21 = true; p.pijlN21 = 0; } },
    snelkookpan: { rare: true, name: 'Snelkookpan', desc: 'Damage builds pressure. Full: every snake takes 5x your damage. Bosses take half.', apply(p) { p.pan21 = 0; } },
    zevendehemel: { rare: true, name: 'Zevende Hemel', desc: 'Once per floor, a bite to one apple or less: 4 seconds untouchable, triple damage.', apply(p) { p.hemel21 = true; } },
    koningsappel: { rare: true, name: 'Koningsappel', desc: 'One more apple. 15% more damage, 12% faster shots, 8% faster feet, 15% more range.', apply(p) { p.maxHp = Math.min(16, p.maxHp + 2); p.heal(2); p.range *= 1.15; p.konap21 = true; } },
    tulpenmanie: { rare: true, name: 'Tulpenmanie', desc: 'Every kill in a room: 4% more damage, up to 32%. Resets when you leave.', apply(p) { p.tulp21 = true; } },
    // locked: an achievement opens them
    tondeuse: { lock: 'barber21', name: 'Tondeuse', desc: '1 in 6 hits deals 2 bonus damage plus 25% of your damage.', apply(p) { p.tond21 = true; } },
    spaarpas: { lock: 'tank21', name: 'BP Spaarpas', desc: 'Pumps 30% cheaper. Every tune you carry: 4% more damage, up to 24%.', apply(p) { p.spaar21 = true; } },
    advocaat: { lock: 'judge21', name: 'Advocaat', desc: 'Court rulings always go your way. Once per floor, a curse bounces off.', apply(p) { p.adv21 = true; p.advUsed21 = false; } },
    marktplaats: { lock: 'sell21', name: 'Marktplaats', desc: 'The till pays 60% more for powerups, plus 2 coins.', apply(p) { p.markt21 = true; } },
    stempas: { lock: 'vote21', name: 'Stempas', desc: '6% more damage. Vote rooms heal an apple and pay 3 coins.', apply(p) { p.stem21 = true; } },
    fiche: { lock: 'jackpot21', name: 'Casinofiche', desc: '1 in 8 kills rolls: 3 coins, an apple slice, or nothing.', apply(p) { p.fiche21 = true; } },
    brandweer: { lock: 'fire21', name: 'Brandweer', desc: 'Burning snakes take 30% more damage from you.', apply(p) { p.brand21 = true; } },
    ijsblokje: { lock: 'cold21', name: 'IJsblokje', desc: 'Slowed or stunned snakes take 25% more damage from you.', apply(p) { p.ijs21 = true; } },
    loodgieter: { lock: 'plumb21', name: 'Loodgieter', desc: 'Digging snakes take 40% more damage from you.', apply(p) { p.lood21 = true; } },
    trampoline: { lock: 'bounce21', name: 'Trampoline', desc: 'After a hit, a seed bounces to another snake for 70% damage. Once.', apply(p) { p.tramp21 = true; } },
    veerpont: { lock: 'ferry21', name: 'Veerpont', desc: 'Untouchable for the first 2 seconds of every fight. First 3 seeds hit 50% harder.', apply(p) { p.pont21 = true; } },
    pindasaus: { lock: 'satay21', name: 'Pindasaus', desc: 'Hit snakes take 12% more damage.', apply(p) { p.saus21 = true; } },
    megafoon: { lock: 'mega21', name: 'Megafoon', desc: 'Every 9 seconds in a fight, snakes in front of you are stunned briefly. Bosses barely.', apply(p) { p.mega21 = true; p.megaT21 = 4; } },
    rugzak: { lock: 'pack21', name: 'Rugzak', desc: '1% more damage per powerup you carry, up to 30%.', apply(p) { p.zak21 = true; } },
    verjaardag: { lock: 'bday21', name: 'Verjaardag', desc: 'Every new floor, a random gift: 15% more damage, faster shots or faster feet.', apply(p) { p.jarig21 = true; p.gift21 = null; } },
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = NEW[id].rare ? 4.5 : 3;
  for (const k of ['pompT21', 'pumped21', 'veterN21', 'kwartN21', 'tostiN21', 'statN21', 'autoN21', 'koekT21', 'glideT21', 'jasUsed21', 'elf21', 'kdT21', 'boomT21', 'kernN21', 'kernT21', 'gatT21', 'hole21', 'fire21', 'stillFire21',
    'pijlN21', 'pan21', 'hemelUsed21', 'hemelT21', 'tulpN21', 'advUsed21', 'megaT21', 'gift21', 'pontN21', 'tuneN21', 'proef21', 'band21', 'dwang21', 'laceT21', 'sneezeT21', 'sneeze21', 'flashT21', 'shortN21']) SELL_SKIP.add(k);

  /* ------------------------------------------------------------------ curses */
  const NEW_CURSES = {
    belasting: { curse: true, name: 'Belastingdienst', desc: 'Seeds hit 40% harder. Every new floor takes 33% of your coins. Blue envelope.', mod: { dmg: 1.4 }, flag: 'tax21' },
    spitsuur: { curse: true, name: 'Spitsuur', desc: 'You walk 20% faster and shoot 13% faster. Snakes are 10% faster too. Everyone is in a hurry.', mod: { speed: 1.2, rate: 0.87 }, flag: 'rush21' },
    hollandsweer: { curse: true, name: 'Hollands Weer', desc: 'Seeds hit 35% harder. Every floor is wet and slippery. It always rains.', mod: { dmg: 1.35 }, flag: 'slippery' },
    gokschuld: { curse: true, name: 'Gokschuld', desc: 'Snakes drop 2x the coins. Every new fight costs 2 coins. The debt collects itself.', flag: 'debt21' },
    delftsblauw: { curse: true, name: 'Delfts Blauw', desc: '1 apple less. Seeds hit 55% harder. Pretty, and it breaks.', mod: { dmg: 1.55 }, maxHp: -2 },
    tunnelvisie: { curse: true, name: 'Tunnelvisie', desc: 'Seeds fly 30% farther, 20% faster and hit 15% harder. Your light reaches 30% less far. Focus has edges.', mod: { range: 1.3, shot: 1.2, dmg: 1.15, light: 0.7 } },
    bloedmaan: { curse: true, name: 'Bloedmaan', desc: 'Seeds hit 30% harder. You shoot 8% faster. 1 extra snake in every fight. Red sky.', mod: { dmg: 1.3, rate: 0.92 }, flag: 'moon21' },
    kortsluiting: { curse: true, name: 'Kortsluiting', desc: 'You shoot 30% faster. Every 9th shot jams you for almost 1 second. Sparks.', mod: { rate: 0.7 }, flag: 'short21' },
    gamer: { curse: true, name: 'Gamer', desc: 'You shoot 20% faster. Your light is weaker and snakes notice you sooner. Up all night.', mod: { rate: 0.8, light: 0.85 }, flag: 'witharen' },
    paparazzi: { curse: true, name: 'Paparazzi', desc: 'Seeds hit 35% harder. Every 10 seconds in a fight a flash goes off in your face. Famous for nothing.', mod: { dmg: 1.35 }, flag: 'flash21' },
    opdieet: { curse: true, name: 'Op Dieet', desc: '1 apple less. You walk 20% faster and shoot 15% faster. Light, hungry.', mod: { speed: 1.2, rate: 0.85 }, maxHp: -2 },
    lood: { curse: true, name: 'Lood In De Schoenen', desc: 'Seeds hit 30% harder and are 20% bigger. You walk 20% slower and nothing pushes you around. Heavy.', mod: { dmg: 1.3, size: 1.2, speed: 0.8, kb: 0.2 } },
    pechvogel: { curse: true, name: 'Pechvogel', desc: '1 in 5 seeds fizzles out right away. The rest hit 50% harder. Unlucky, mostly.', mod: { dmg: 1.5 }, flag: 'dud21' },
    spiegel: { curse: true, name: 'Gebroken Spiegel', desc: 'Seeds hit 30% harder. Every bite has a 1 in 4 chance to bring a downgrade. 7 years.', mod: { dmg: 1.3 }, flag: 'mirror21' },
    vroegevogel: { curse: true, name: 'Vroege Vogel', desc: 'You shoot 40% faster for the first 10 seconds of every fight. After 30 seconds you shoot 25% slower. Peaks early.', flag: 'early21' },
  };
  for (const id in NEW_CURSES) { CURSES[id] = NEW_CURSES[id]; CURSE_IDS.push(id); }

  /* ------------------------------------------------------------------ downgrades */
  const NEW_DOWNS = {
    losveter: { down: true, name: 'Losse Veter', desc: 'Every 8 seconds of walking you trip and stop for a moment. Tie it.', flag: 'lace21' },
    zerevoet: { down: true, name: 'Zere Voet', desc: 'You walk 7% slower. Wrong shoes.', mod: { speed: 0.93 } },
    beslagen: { down: true, name: 'Beslagen Bril', desc: 'Your light reaches 15% less far and your aim wobbles a little. Steamed up.', mod: { light: 0.85, wobble: 0.05 } },
    blaar: { down: true, name: 'Blaar', desc: 'You walk 30% slower for the first 2 seconds of every fight. It hurts to start.', flag: 'blister21' },
    roestig: { down: true, name: 'Roestig', desc: 'You shoot 8% slower and seeds fly 5% slower. Rust.', mod: { rate: 1.08, shot: 0.95 } },
    bonnetje: { down: true, name: 'Bonnetje Kwijt', desc: 'Shops and pumps charge 15% more. No receipt, no discount.', flag: 'receipt21' },
    snotneus: { down: true, name: 'Snotneus', desc: 'Every 15 seconds in a fight you sneeze and one shot goes anywhere. Bless you.', flag: 'sneeze21' },
    kreukel: { down: true, name: 'Kreukel', desc: 'Seeds are 10% smaller and fly 5% less far. Wrinkled.', mod: { size: 0.9, range: 0.95 } },
    klamme: { down: true, name: 'Klamme Handen', desc: 'Seeds hit 8% softer. Sweaty grip.', mod: { dmg: 0.92 } },
    spierpijn: { down: true, name: 'Spierpijn', desc: 'You shoot 6% slower and walk 4% slower. Leg day.', mod: { rate: 1.06, speed: 0.96 } },
    pukkel: { down: true, name: 'Pukkel', desc: 'Bites knock you 30% farther and your light is a bit weaker. Self-conscious.', mod: { kb: 1.3, light: 0.95 } },
    slaperig: { down: true, name: 'Slaperig', desc: 'You cannot shoot for the first 1 second of every fight. Still waking up.', flag: 'sleepy21' },
    tocht: { down: true, name: 'Tocht', desc: 'Your shots drift a little to the right. Close the window.', mod: { crooked: -0.06 } },
    barst: { down: true, name: 'Barst In Je Scherm', desc: 'Your light is 10% weaker and seeds fly 6% slower. Cracked screen.', mod: { light: 0.9, shot: 0.94 } },
    krommerug: { down: true, name: 'Kromme Rug', desc: 'Seeds fly 10% less far and you walk 3% slower. Posture.', mod: { range: 0.9, speed: 0.97 } },
  };
  for (const id in NEW_DOWNS) { DOWNS[id] = NEW_DOWNS[id]; DOWN_IDS.push(id); }

  /* ------------------------------------------------------------------ BP pumps */
  const NEW_PUMPS = [
    { id: 'ultimate', name: 'BP Ultimate', desc: 'Seeds hit 25% harder. You shoot 8% slower. Ultimate price.', cost: 32, mod: { dmg: 1.25, rate: 1.08 } },
    { id: 'hvo', name: 'HVO100', desc: 'You walk 10% faster and seeds fly 10% farther. They hit 8% softer. Green-ish.', cost: 24, mod: { speed: 1.1, range: 1.1, dmg: 0.92 } },
    { id: 'waterstof', name: 'Waterstof', desc: 'You shoot 15% faster. Your light is 15% weaker. Clean, dim.', cost: 28, mod: { rate: 0.85, light: 0.85 } },
    { id: 'kerosine', name: 'Kerosine', desc: 'Seeds fly 35% faster and 25% farther. They are 12% smaller. Jet fuel.', cost: 26, mod: { shot: 1.35, range: 1.25, size: 0.88 } },
    { id: 'tweetakt', name: 'Tweetaktmix', desc: 'You shoot 20% faster. Bites knock you 40% farther. Scooter energy.', cost: 30, mod: { rate: 0.8, kb: 1.4 } },
    { id: 'stookolie', name: 'Stookolie', desc: 'Seeds hit 30% harder. They fly 15% slower and your light dims a bit. Dirty, strong.', cost: 30, mod: { dmg: 1.3, shot: 0.85, light: 0.9 } },
    { id: 'laadpaal', name: 'Snellaadpaal', desc: 'You shoot 30% faster for the first 4 seconds of every fight. Seeds hit 6% softer. Fast charge.', cost: 26, mod: { dmg: 0.94 }, flag: 'laad21' },
    { id: 'banden', name: 'Bandenspanning', desc: 'You walk 12% faster and bites push you 40% less. Seeds hit 5% softer. Pumped tires.', cost: 22, mod: { speed: 1.12, kb: 0.6, dmg: 0.95 } },
    { id: 'olie', name: 'Olie Verversen', desc: 'Washes off your newest curse. You walk 5% slower. Fresh oil, stiff start.', cost: 34, cleanseCurse: true, mod: { speed: 0.95 } },
    { id: 'wasstraat', name: 'Wasstraat', desc: 'Heals you all the way. You shoot 6% slower. Wash and wax.', cost: 24, healFull: true, mod: { rate: 1.06 } },
    { id: 'bpkoffie', name: 'BP Koffie', desc: 'You shoot 10% faster and walk 5% faster. Your light dims 8%. Strong, bitter.', cost: 20, mod: { rate: 0.9, speed: 1.05, light: 0.92 } },
    { id: 'kroketbp', name: 'Worstenbroodje', desc: '1 more apple. You walk 7% slower. From the warmer.', cost: 26, maxHp: 2, mod: { speed: 0.93 } },
    { id: 'autogas', name: 'CNG', desc: 'Seeds hit 15% harder and are 15% bigger. They fly 15% less far. Plus, minus.', cost: 24, mod: { dmg: 1.15, size: 1.15, range: 0.85 } },
    { id: 'premium', name: 'Premium Diesel', desc: '0.5 apple more health and 8% harder seeds. You shoot 6% slower. Premium, slightly.', cost: 30, maxHp: 1, mod: { dmg: 1.08, rate: 1.06 } },
    { id: 'airmiles', name: 'Air Miles', desc: 'Snakes drop 50% more coins. Seeds hit 10% softer. Collect, never redeem.', cost: 20, mod: { dmg: 0.9 }, flag: 'miles21' },
  ];
  for (const p of NEW_PUMPS) if (!PUMP_BY_ID[p.id]) { PUMPS.push(p); PUMP_BY_ID[p.id] = p; }


  /* ------------------------------------------------------------------ achievements for the locked ones */
  STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['rulings21', 'Rulings in your favour']);
  const NEW_ACHS = [
    { id: 'barber21', reward: 'tondeuse', name: 'Vaste Klant', desc: 'Get 15 haircuts.', stat: 'haircuts', goal: 15 },
    { id: 'tank21', reward: 'spaarpas', name: 'Volgetankt', desc: 'Tank 15 times at a BP pump.', stat: 'tunes', goal: 15 },
    { id: 'judge21', reward: 'advocaat', name: 'Bekende Van Justitie', desc: 'Hear 10 verdicts in the Rechtbank.', stat: 'verdicts', goal: 10 },
    { id: 'sell21', reward: 'marktplaats', name: 'Opkoper', desc: 'Sell 25 powerups at the till.', stat: 'sold', goal: 25 },
    { id: 'vote21', reward: 'stempas', name: 'Stemvee', desc: 'Vote in 20 rooms.', stat: 'votes', goal: 20 },
    { id: 'jackpot21', reward: 'fiche', name: 'Huis Wint Altijd', desc: 'Hit 5 jackpots.', stat: 'jackpots', goal: 5 },
    { id: 'fire21', reward: 'brandweer', name: 'Pyromaan', desc: 'Kill 150 snakes while they burn.', stat: 'burnKills', goal: 150 },
    { id: 'cold21', reward: 'ijsblokje', name: 'Ijskoud', desc: 'Beat 10 bosses without losing an apple.', stat: 'flawless', goal: 10 },
    { id: 'plumb21', reward: 'loodgieter', name: 'Ontstopper', desc: 'Kill 50 Lampreys.', stat: 'k_lamprey', goal: 50 },
    { id: 'bounce21', reward: 'trampoline', name: 'Hattrick', desc: 'Score 10 goals on Boost Worms.', stat: 'goals', goal: 10 },
    { id: 'ferry21', reward: 'veerpont', name: 'Overgestoken', desc: 'Clear 1000 rooms.', stat: 'rooms', goal: 1000 },
    { id: 'satay21', reward: 'pindasaus', name: 'Saté', desc: 'Kill 300 Grubs.', stat: 'k_grub', goal: 300 },
    { id: 'mega21', reward: 'megafoon', name: 'Oppositie', desc: 'Kill 200 Kamerleden.', stat: 'k_kamerlid', goal: 200 },
    { id: 'pack21', reward: 'rugzak', name: 'Sjouwer', desc: 'Hold 25 powerups in one run.', stat: 'mostItems', goal: 25 },
    { id: 'bday21', reward: 'verjaardag', name: 'Weer Een Jaar', desc: 'Start 100 runs.', stat: 'runs', goal: 100 },
  ];
  for (const a of NEW_ACHS) if (!ACHS.some((x) => x.id === a.id)) ACHS.push(a);

  /* ------------------------------------------------------------------ defaults */
  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      Object.assign(P, { stamp21: false, veter21: false, pomp21: false, statie21: false, mosterd21: false, schaats21: false, jas21: false, frik21: false, auto21: false, kwartje21: false, moes21: false, smijt21: false,
        koekoek21: false, tegel21: false, tosti21: false, kd21: false, pakjes21: false, nacht21: false, boom21: false, kern21: false, koets21: false, drie21: false, gat21: false, vuur21: false, pijl21: false,
        hemel21: false, konap21: false, tulp21: false, tond21: false, spaar21: false, adv21: false, markt21: false, stem21: false, fiche21: false, brand21: false, ijs21: false, lood21: false, tramp21: false,
        pont21: false, saus21: false, mega21: false, zak21: false, jarig21: false,
        elf21: null, pan21: null, pompT21: 5, pumped21: false, veterN21: 0, kwartN21: 0, tostiN21: 0, statN21: 0, autoN21: 0, koekT21: 6, glideT21: 0, jasUsed21: false, kdT21: 0, boomT21: 8,
        kernN21: 0, kernT21: 0, gatT21: 6, hole21: null, fire21: null, pijlN21: 0, hemelUsed21: false, hemelT21: 0, tulpN21: 0, advUsed21: false, megaT21: 4, gift21: null, pontN21: 0,
        tuneN21: 0, proef21: null, band21: false, dwang21: 0, laceT21: 8, sneezeT21: 15, sneeze21: false, flashT21: 10, shortN21: 0 });
    };
  }

  /* ------------------------------------------------------------------ numbers: additive, capped */
  const inFight = () => fighting10(G.room);
  function dark21(room) { return !!room && (room.mod === 'dark' || room.theme === 'club' || room.theme === 'hell' || (G.player && G.player.flags && G.player.flags.nacht)); }
  function dmgAdd21(P) {
    let a = 0;
    if (P.tegel21) a += 0.06;
    if (P.schaats21 && P.glideT21 >= 2) a += 0.15;
    if (P.elf21) a += 0.03 * P.elf21;
    if (P.nacht21) a += dark21(G.room) ? 0.35 : 0.12;
    if (P.konap21) a += 0.15;
    if (P.tulp21) a += 0.04 * Math.min(8, P.tulpN21);
    if (P.spaar21) a += Math.min(0.24, 0.04 * (P.tunes ? P.tunes.length : 0));
    if (P.stem21) a += 0.06;
    if (P.zak21) a += Math.min(0.3, 0.01 * (P.items ? P.items.length : 0));
    if (P.gift21 === 'dmg') a += 0.15;
    return a;
  }
  {
    const d0 = dmgK9;
    dmgK9 = function (P) { let k = d0(P); k *= 1 + dmgAdd21(P); if (P.hemelT21 > 0) k *= 3; return k; };
    const r0 = rateK9;
    rateK9 = function (P) {
      let k = r0(P), a = 0;
      if (P.tegel21) a += 0.06; if (P.konap21) a += 0.12; if (P.gift21 === 'rate') a += 0.15;
      const room = G.room, ft = P.fightT || 0, f = P.flags || {};
      if (f.laad21 && room && room.locked && ft < 4) a += 0.3;
      if (f.early21 && room && room.locked) { if (ft < 10) a += 0.4; else if (ft > 30) k *= 1.25; }
      return k * (1 - Math.min(0.4, a));
    };
    const s0 = speedK9;
    speedK9 = function (P, room) {
      let k = s0(P, room), a = 0;
      if (P.tegel21) a += 0.04; if (P.schaats21) a += 0.1; if (P.konap21) a += 0.08; if (P.elf21) a += 0.02 * P.elf21;
      if (P.moes21 && P.hp <= 2) a += 0.15; if (P.gift21 === 'speed') a += 0.15;
      k *= 1 + Math.min(0.4, a);
      if (P.flags && P.flags.blister21 && room.locked && (P.fightT || 0) < 2) k *= 0.7;
      return k;
    };
    const ss0 = snakeSpeed9;
    snakeSpeed9 = function (sn, P) { let k = ss0(sn, P); if (P && P.flags && P.flags.rush21) k *= sn.isBoss ? 1.05 : 1.1; return k; };
    const h0 = hurtMod9;
    hurtMod9 = function (sn, amount, fx, fy, isPoison) {
      amount = h0(sn, amount, fx, fy, isPoison);
      const P = G.player; if (!P) return amount;
      let a = 0;
      if (P.brand21 && sn.burn > 0) a += 0.3;
      if (P.ijs21 && (sn.slow > 0 || sn.stun > 0)) a += 0.25;
      if (P.lood21 && (sn.K.underSpeed || sn.burrowed)) a += 0.4;
      if (P.saus21 && sn.saus21) a += 0.12;
      return amount * (1 + a);
    };
    const sp0 = sellPrice;
    sellPrice = function (id, P) { let v = sp0(id, P); if (P && P.statie21) v = Math.round(v * 1.5); if (P && P.markt21) v = Math.round(v * 1.6) + 2; return v; };
    const pc0 = priceOf;
    priceOf = function (p) { const P = G.player; let c = pc0(p); if (P && P.koets21) c *= 0.8; if (P && P.flags && P.flags.receipt21) c *= 1.15; return Math.max(1, Math.ceil(c)); };
    const pu0 = pumpCost9;
    pumpCost9 = function (o) { const P = G.player; let c = pu0(o); if (P && P.spaar21) c *= 0.7; if (P && P.flags && P.flags.receipt21) c *= 1.15; return Math.max(1, Math.ceil(c)); };
    const dc0 = dropCoins;
    dropCoins = function (room, x, y, n) {
      const P = G.player;
      if (P && n > 0) {
        let m = 1;
        if (P.koets21) m *= 2; if (P.flags && P.flags.debt21) m *= 2; if (P.flags && P.flags.miles21) m *= 1.5;
        if (m !== 1) n = Math.floor(n * m + Math.random() * 0.999);
      }
      return dc0(room, x, y, n);
    };
    const he0 = Player.prototype.heal;
    Player.prototype.heal = function (n) { if (this.moes21 && this.hp <= 2 && n > 0 && n < 50) n *= 2; return he0.call(this, n); };
    const gc0 = giveCurse;
    giveCurse = function (id) {
      const P = G.player;
      if (P && P.adv21 && !P.advUsed21) { P.advUsed21 = true; UI.banner('Bezwaar gegrond', 'Your lawyer kept the curse off you. Once per floor.', 'clean'); Sfx.gavel(); return; }
      return gc0(id);
    };
  }

  /* ------------------------------------------------------------------ shooting */
  {
    const pf0 = preFire9;
    preFire9 = function (P) {
      let off = pf0(P);
      if (P.sneeze21) { P.sneeze21 = false; off += rnd(-1.2, 1.2); floatText(P.x, P.y - 26, 'HATSJOE', '#e8e8d0'); }
      return off;
    };
    const sd0 = seed9;
    seed9 = function (P, s, o) {
      sd0(P, s, o);
      if (!o.inherit) return;
      if (P.flags.dud21 && Math.random() < 0.2) { s.life *= 0.12; s.dmg *= 0.2; s.look9 = ['#2a2a2a', '#8a8a8a', '#5a5a5a']; return; }
      if (P.veter21 && ++P.veterN21 % 4 === 0) { s.pierce = true; s.veter21 = true; s.look9 = ['#0a0a0a', '#6a3a4a', '#1a1014']; }
      if (P.kwartje21 && ++P.kwartN21 % 10 === 0) { s.dmg *= 1.5; s.kwartje21 = true; s.look9 = ['#6a5000', '#fff2a0', '#e8c03a']; }
      if (P.tosti21 && ++P.tostiN21 % 7 === 0) { s.dmg *= 1.2; s.size *= 1.3; s.tosti21 = true; s.look9 = ['#6a3a10', '#ffe0a0', '#d89a40']; }
      if (P.pumped21) { s.dmg *= 2; s.size *= 1.4; s.glow = true; }
      if (P.pontN21 > 0) { P.pontN21--; s.dmg *= 1.5; }
      if (P.fire21 && P.fire21.room === G.room && dist(P.x, P.y, P.fire21.x, P.fire21.y) < 70) s.ember = true;
    };
    const fr0 = fire9;
    fire9 = function (P, base) {
      fr0(P, base);
      P.pumped21 = false;
      const room = G.room; if (!room) return;
      if (P.drie21) for (const d of [-0.12, 0.12]) makeSeed(P, P.x + Math.cos(base + d) * 8, P.y + Math.sin(base + d) * 8 - 2, base + d, { mult: 0.7, size: 0.9, noCan: true });
      if (P.pijl21 && ++P.pijlN21 % 5 === 0) { const s = makeSeed(P, P.x, P.y - 2, base, { mult: 1, size: 1.2, noCan: true }); s.vw21 = true; s.glow = true; s.look9 = ['#6a0a10', '#ffd27a', '#ff4a3a']; }
      if (P.flags.short21 && ++P.shortN21 % 9 === 0) { P.coughing = Math.max(P.coughing || 0, 0.8); floatText(P.x, P.y - 26, 'KORTSLUITING', '#9fd8ff'); Sfx.static10(); }
    };
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = G.player; if (!P) return;
      safe(() => {
        if (s.veter21) sn.slow = Math.max(sn.slow || 0, 1.2);
        if (s.tosti21 && !sn.K.fireproof) sn.burn = Math.max(sn.burn || 0, 2);
        if (P.saus21) sn.saus21 = true;
        if (s.vw21 && !s.vwDone21) { s.vwDone21 = true; explode(room, s.x, s.y, 52, { hurtPlayer: false, snakeDmg: seedDmg(P) * 2 }); s.life = 0; }
        if (P.pan21 != null) {
          P.pan21 += dmg;
          if (P.pan21 >= seedDmg(P) * 40) {
            P.pan21 = 0;
            for (const o of room.snakes) if (o.canBeHit() && !o.burrowed) o.hurt(seedDmg(P) * 5 * bossK(o), o.x, o.y);
            floatText(P.x, P.y - 36, 'PSSSHHT', '#e8f0ff', true); ring10(P.x, P.y, 18, '#e8f0ff', 0.5); Sfx.whoosh10();
          }
        }
        if (s.child) return;
        if (P.mosterd21 && sn.canBeHit()) {
          sn.mos21 = (sn.mos21 || 0) + 1;
          if (sn.mos21 >= 4 && G.t - (sn.mosT21 || -9) > 1.5) {
            sn.mos21 = 0; sn.mosT21 = G.t;
            sn.hurt(seedDmg(P) * 1.5 * bossK(sn), sn.x, sn.y); sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.15 : 0.4);
            floatText(sn.x, sn.y - 20, 'HATSJOE', '#e8c83a');
          }
        }
        if (P.tond21 && sn.canBeHit() && Math.random() < 1 / 6) { sn.hurt(2 + seedDmg(P) * 0.25, s.x, s.y, true); floatText(s.x, s.y - 12, 'TRIM', '#e8e2d0'); }
        if (P.tramp21 && !s.tramp21) {
          const tg = room.snakes.filter((o) => o !== sn && o.canBeHit() && !o.burrowed).sort((a, b) => dist2(a.x, a.y, s.x, s.y) - dist2(b.x, b.y, s.x, s.y))[0];
          if (tg && dist(tg.x, tg.y, s.x, s.y) < 220) { const n = makeSeed(P, s.x, s.y, Math.atan2(tg.y - s.y, tg.x - s.x), { mult: 0.7, size: 0.8, noCan: true }); n.child = true; n.tramp21 = true; n.hits = new Set([sn]); }
        }
      });
    };
  }

  /* ------------------------------------------------------------------ getting bitten */
  {
    const vh0 = venomHit9;
    venomHit9 = function (v, P) {
      const r = vh0(v, P); if (r) return r;
      if (P.inv > 0 || P.dashT > 0 || P.dying > 0 || P.escaping > 0) return 0;
      if (P.jas21 && !P.jasUsed21) { P.jasUsed21 = true; floatText(P.x, P.y - 24, 'REGENJAS', '#9fd8ff'); burst(v.x, v.y, 5, '#9fd8ff', { min: 30, max: 90, lmin: 0.2, lmax: 0.4 }); return 1; }
      return 0;
    };
    const b0 = bitten10;
    bitten10 = function (P, lost, sx, sy, src) {
      b0(P, lost, sx, sy, src);
      safe(() => {
        const room = G.room;
        if (P.smijt21 && src && src.K && src.alive) {
          src.stun = Math.max(src.stun || 0, src.isBoss ? 0.2 : 0.6);
          if (!src.isBoss) { const a = Math.atan2(src.y - P.y, src.x - P.x); for (let i = 0; i < 8; i++) { const nx = src.x + Math.cos(a) * 4, ny = src.y + Math.sin(a) * 4; if (!freeAt(room, nx, ny, src.headR * 0.7)) break; src.moveTo(nx, ny); } }
          floatText(src.x, src.y - 20, 'ERUIT', '#ffd27a');
        }
        if (P.hemel21 && !P.hemelUsed21 && P.hp > 0 && P.hp <= 2) {
          P.hemelUsed21 = true; P.hemelT21 = 4; P.inv = Math.max(P.inv, 4);
          UI.banner('Zevende Hemel', 'Four seconds. Nothing touches you.', 'legend'); flashLight(P.x, P.y, 160, 0.9, 0.5); Sfx.legend();
        }
        if (P.flags.mirror21 && Math.random() < 0.25 && P.downs.length < DOWN_CAP && P.hp > 0) setTimeout(() => { if (G.state === 'play' && G.player === P) giveDown(); }, 700);
        if (P.proef21 && P.proef21 !== room) { P.proef21 = null; setTimeout(() => { if (G.state === 'play' && G.player === P) { giveCurse(pickCurse()); UI.banner('Proeftijd geschonden', 'Bitten on probation. The suspended sentence starts now.', 'curse'); } }, 600); }
      });
    };
  }

  /* ------------------------------------------------------------------ every frame */
  {
    const up0 = updatePlayer9;
    updatePlayer9 = function (P, dt, room, sp) { up0(P, dt, room, sp); safe(() => update21(P, dt, room, sp)); };
  }
  function update21(P, dt, room, sp) {
    const fight = fighting10(room);
    // pumps with something extra
    if (P.tunes && P.tunes.length > P.tuneN21) {
      for (let i = P.tuneN21; i < P.tunes.length; i++) {
        const pm = PUMP_BY_ID[P.tunes[i]]; if (!pm) continue;
        if (pm.healFull) P.heal(99);
        if (pm.cleanseCurse && P.curses.length) { const id = P.curses[P.curses.length - 1]; removeThing(P, id, 'curse'); floatText(P.x, P.y - 44, 'SCHONE OLIE', '#9fe8ff', true); }
      }
      P.tuneN21 = P.tunes.length;
    }
    if (P.hemelT21 > 0) { P.hemelT21 -= dt; if (Math.random() < dt * 20) addP({ kind: 'dot', x: P.x + rnd(-10, 10), y: P.y + rnd(-10, 6), vx: 0, vy: -30, r: rnd(1, 2), life: 0.5, col: '#fff6c8', glow: true, drag: 1 }); }
    P.glideT21 = sp > 40 ? P.glideT21 + dt : 0;
    if (P.kdT21 > 0) { P.kdT21 -= dt; if (P.kdT21 <= 0 && fight) koningsdag21(P, room); }
    if (P.pomp21 && fight && !P.pumped21) { P.pompT21 -= dt; if (P.pompT21 <= 0) { P.pompT21 = 10; P.pumped21 = true; floatText(P.x, P.y - 28, 'OPGEPOMPT', '#7cd0ff'); Sfx.pump(); } }
    if (P.koekoek21 && fight) {
      P.koekT21 -= dt;
      if (P.koekT21 <= 0) {
        const tg = nearSnake10(room, P.x, P.y, 320); P.koekT21 = tg ? 12 : 1;
        if (tg) { tg.hurt(seedDmg(P) * 2.5, tg.x, tg.y); floatText(tg.x, tg.y - 22, 'KOEKOEK', '#e8d8b0', true); Sfx.tone(784, 0.15, { type: 'triangle', vol: 0.05 }); Sfx.tone(622, 0.2, { type: 'triangle', vol: 0.05, delay: 0.18 }); }
      }
    }
    if (P.boom21 && fight) { P.boomT21 -= dt; if (P.boomT21 <= 0) { P.boomT21 = 15; dropHeart(room, clamp(P.x + rnd(-30, 30), 12, RW - 12), clamp(P.y - 20, 12, RH - 12), 1); floatText(P.x, P.y - 34, 'PLOF', '#9be37a'); } }
    if (P.mega21 && fight) {
      P.megaT21 -= dt;
      if (P.megaT21 <= 0) {
        P.megaT21 = 9; const base = Math.atan2(P.aimY || 0, P.aimX || 1);
        for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && dist(sn.x, sn.y, P.x, P.y) < 170 + sn.headR && Math.abs(angDiff(base, Math.atan2(sn.y - P.y, sn.x - P.x))) < 1) sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.25 : 0.8);
        floatText(P.x + Math.cos(base) * 30, P.y + Math.sin(base) * 30 - 14, 'HE!', '#ffd27a', true); Sfx.horn10();
      }
    }
    if (P.gat21 && fight && !P.hole21) { P.gatT21 -= dt; if (P.gatT21 <= 0) { P.gatT21 = 14; const s = aimSpot10(P, room, Math.atan2(P.aimY || 0, P.aimX || 1)); P.hole21 = { x: s.x, y: s.y, t: 0, tick: 0, room }; Sfx.warp(); } }
    if (P.hole21) {
      const h = P.hole21; h.t += dt; h.tick -= dt;
      if (h.room !== room || h.t > 2) P.hole21 = null;
      else for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed || dist(sn.x, sn.y, h.x, h.y) > 120) continue;
        if (!sn.isBoss) { const a = Math.atan2(h.y - sn.y, h.x - sn.x), nx = sn.x + Math.cos(a) * 70 * dt, ny = sn.y + Math.sin(a) * 70 * dt; if (freeAt(room, nx, ny, sn.headR * 0.7)) sn.moveTo(nx, ny); }
        if (h.tick <= 0) sn.hurt(seedDmg(P) * 0.6 * bossK(sn), sn.x, sn.y);
      }
      if (h.tick <= 0) h.tick = 0.25;
    }
    if (P.vuur21) {
      if (P.fire21 && P.fire21.room !== room) P.fire21 = null;
      if (!P.fire21 && fight && P.stillT > 1.5) { P.fire21 = { x: P.x, y: P.y + 10, room, healT: 8 }; floatText(P.x, P.y - 30, 'KAMPVUUR', '#ffb04a'); Sfx.fuse(); }
      if (P.fire21 && fight && dist(P.x, P.y, P.fire21.x, P.fire21.y) < 70) { P.fire21.healT -= dt; if (P.fire21.healT <= 0) { P.fire21.healT = 8; if (P.heal(1)) floatText(P.x, P.y - 30, '+1', '#ffb04a'); } }
    }
    const f = P.flags;
    if (f.lace21 && sp > 40 && fight) { P.laceT21 -= dt; if (P.laceT21 <= 0) { P.laceT21 = 8; P.rootT = Math.max(P.rootT || 0, 0.4); floatText(P.x, P.y - 24, 'STRUIKEL', '#e8e2d0'); } }
    if (f.sneeze21 && fight) { P.sneezeT21 -= dt; if (P.sneezeT21 <= 0) { P.sneezeT21 = 15; P.sneeze21 = true; } }
    if (f.sleepy21 && room.locked && (P.fightT || 0) < 1) P.cool = Math.max(P.cool, 0.05);
    if (f.flash21 && fight) { P.flashT21 -= dt; if (P.flashT21 <= 0) { P.flashT21 = 10; G.whiteout = Math.max(G.whiteout, 0.45); floatText(P.x, P.y - 30, 'FLITS', '#ffffff'); Sfx.noise(0.05, { filter: 'highpass', f: 4000, vol: 0.08 }); } }
  }
  function koningsdag21(P, room) {
    for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed) { sn.hurt(seedDmg(P) * 2 * bossK(sn), sn.x, sn.y); sn.daze = Math.max(sn.daze || 0, sn.isBoss ? 0.3 : 1); burst(sn.x, sn.y, 6, '#ff8a1e', { min: 30, max: 100, lmin: 0.3, lmax: 0.6 }); }
    for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(80, 260); addP({ kind: 'dot', x: P.x, y: P.y - 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1.2, 2.4), life: 0.7, col: pick(['#ff8a1e', '#ffffff', '#2a6ad8', '#e8323c']), drag: 3 }); }
    floatText(P.x, P.y - 36, 'HUP HOLLAND', '#ff8a1e', true); Sfx.boom(false); G.shake = Math.max(G.shake, 4);
  }

  /* ------------------------------------------------------------------ fights, kills, rooms, floors */
  {
    const cb0 = combat9;
    combat9 = function (room) {
      cb0(room);
      const P = G.player; if (!P) return;
      safe(() => {
        if (P.flags.moon21) { const L = G.levelDef, pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar, cell = Game.farCell(room, P, new Set()); room.snakes.push(new Snake(pick(pool), cell.x, cell.y, { delay: 0.9, ang: Math.atan2(P.y - cell.y, P.x - cell.x) })); }
        if (P.flags.debt21 && G.run) { const n = Math.min(2, G.run.coins || 0); if (n) { G.run.coins -= n; floatText(P.x, P.y - 30, `-${n} SCHULD`, '#c48af0'); } }
        if (P.kd21) P.kdT21 = 1.2;
        if (P.pont21) { P.inv = Math.max(P.inv, 2); P.pontN21 = 3; floatText(P.x, P.y - 30, 'VEERPONT', '#9fd8ff'); }
      });
    };
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0(sn, room, P);
      if (!P) return;
      safe(() => {
        if (P.tulp21) P.tulpN21++;
        if (P.statie21 && ++P.statN21 % 10 === 0) { dropCoins(room, sn.x, sn.y, 2); floatText(sn.x, sn.y - 22, 'STATIEGELD', '#ffd84a'); }
        if (P.kwartje21 && SEED10.s && SEED10.s.kwartje21) dropCoins(room, sn.x, sn.y, 1);
        if (P.frik21) {
          for (const o of room.snakes) if (o !== sn && o.canBeHit() && !o.burrowed && dist(o.x, o.y, sn.x, sn.y) < 70 + o.headR) { o.slow = Math.max(o.slow || 0, 1.5); o.hurt(seedDmg(P) * 0.5 * bossK(o), o.x, o.y); }
          burst(sn.x, sn.y, 10, '#f2e8b0', { min: 30, max: 100, lmin: 0.3, lmax: 0.6 }); burst(sn.x, sn.y, 6, '#d8a030', { min: 20, max: 80, lmin: 0.3, lmax: 0.5 });
        }
        if (P.kern21) {
          if (G.t - P.kernT21 > 1) { P.kernT21 = G.t; P.kernN21 = 0; }
          if (P.kernN21 < 3) { P.kernN21++; explode(room, sn.x, sn.y, 46, { hurtPlayer: false, snakeDmg: seedDmg(P) * 1.5, src: sn }); }
        }
        if (P.fiche21 && Math.random() < 1 / 8) {
          const r = Math.random();
          if (r < 1 / 3) { dropCoins(room, sn.x, sn.y, 3); floatText(sn.x, sn.y - 22, 'WINST', '#ffd84a'); }
          else if (r < 2 / 3) { dropHeart(room, sn.x, sn.y, 1); floatText(sn.x, sn.y - 22, 'SNACK', '#ff9a8a'); }
          else floatText(sn.x, sn.y - 22, 'NIKS', '#a8a8b0');
        }
      });
    };
    const en0 = enter9;
    enter9 = function (P) {
      en0(P);
      P.jasUsed21 = false; P.tulpN21 = 0; P.hole21 = null; P.pumped21 = false; P.sneezeT21 = 15; P.flashT21 = 10; P.laceT21 = 8;
      const room = G.room;
      if (P.stem21 && room && room.voteRoom && !room.stem21) { room.stem21 = true; P.heal(2); setTimeout(() => { if (G.room === room) dropCoins(room, P.x, P.y - 20, 3); }, 200); floatText(P.x, P.y - 30, 'STEMPAS', '#e8742a'); }
    };
    const fl0 = floor9;
    floor9 = function (P) {
      fl0(P);
      P.advUsed21 = false; P.hemelUsed21 = false; P.band21 = false;
      if (P.elf21 != null) P.elf21 = 0;
      if (P.stamp21) P.heal(1);
      if (P.jarig21) { P.gift21 = pick(['dmg', 'rate', 'speed']); setTimeout(() => { if (G.state === 'play' && G.player === P) UI.banner('Gefeliciteerd', P.gift21 === 'dmg' ? 'Seeds hit 15 percent harder on this floor.' : P.gift21 === 'rate' ? 'You shoot 15 percent faster on this floor.' : 'You walk 15 percent faster on this floor.', 'clean'); }, 1600); }
      if (P.flags.tax21 && G.run && G.run.coins > 0) { const n = Math.floor(G.run.coins / 3); if (n) { G.run.coins -= n; setTimeout(() => { if (G.state === 'play') UI.banner('Belastingdienst', `${n} coins in tax. You knew this was coming.`, 'curse'); }, 1800); } }
    };
    const cr0 = clearRoom9;
    clearRoom9 = function (room) {
      cr0(room);
      const P = G.player; if (!P) return;
      safe(() => {
        if (P.elf21 != null && P.elf21 < 11 && room.type !== 'start') P.elf21++;
        if (P.auto21 && room.type !== 'start' && ++P.autoN21 % 3 === 0) { dropHeart(room, P.x + 24, P.y, 2); floatText(P.x, P.y - 30, 'AUTOMAAT', '#ffd27a'); }
        if (P.dwang21 > 0) { P.dwang21--; dropCoins(room, P.x, P.y - 20, 3); floatText(P.x, P.y - 34, 'DWANGSOM', '#ffd84a'); }
        if (P.proef21 && P.proef21 !== room) { P.proef21 = null; dropCoins(room, P.x, P.y - 20, 4); UI.banner('Proeftijd voorbij', 'Clean room. The case is closed, and you get 4 coins.', 'clean'); }
        if (room.taak21 === 'werk') { room.taak21 = null; dropCoins(room, RW / 2, RH / 2, 6); UI.banner('Werkstraf voldaan', 'Six coins for the hours.', 'clean'); }
        if (room.taak21 === 'contempt') { room.taak21 = null; spawnItem(room, RW / 2, RH / 2, 0.5); UI.banner('Hof tevreden', 'The court is satisfied. It pays up.', 'clean'); }
      });
    };
    const bd0 = bossDead9;
    bossDead9 = function (b) {
      bd0(b);
      const P = G.player, room = G.room;
      if (P && P.pakjes21 && room && !room.pakjes21) { room.pakjes21 = true; setTimeout(() => { if (G.room === room && G.state === 'play') { spawnItem(room, RW / 2 + 40, RH / 2, 0.2); floatText(RW / 2 + 40, RH / 2 - 30, 'PAKJE', '#e8323c', true); } }, 900); }
    };
  }

  /* ------------------------------------------------------------------ the Rechtbank: more rulings on both sides */
  function addSnakes21(room, kinds) {
    const P = G.player, used = new Set();
    room.locked = true; room.doorCl = 0; Sfx.doorShut();
    kinds.forEach((k, i) => { const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c); room.snakes.push(new Snake(k, cell.x, cell.y, { delay: 0.4 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) })); });
  }
  const COURT21 = {
    eiser: [
      { w: 22, good: 1, run(room, pl) { spawnItem(room, RW / 2, RH * 0.42 + 30, 0.35); UI.banner('Toegewezen', 'The court rules in your favour. Take what you are owed.', 'legend'); } },
      { w: 18, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 10); UI.banner('Schadevergoeding', 'Ten coins in damages.'); Sfx.register(); } },
      { w: 14, good: 0, run() { giveCurse(pickCurse()); UI.banner('Afgewezen', 'The claim is denied. And it costs you.', 'curse'); } },
      { w: 6, good: 1, run(room, pl, P) { P.maxHp = Math.min(16, P.maxHp + 2); P.heal(99); UI.banner('Smartengeld', 'Pain and suffering: one more apple, all healed.', 'legend'); } },
      { w: 8, good: 1, run(room, pl, P) { P.dwang21 = 5; UI.banner('Dwangsom', 'They pay per day: the next 5 rooms you clear pay 3 coins each.'); } },
      { w: 7, good: 1, run(room, pl, P) { if (Math.random() < 0.5) { spawnItem(room, RW / 2, RH * 0.42 + 30, 1); UI.banner('Hoger beroep: gewonnen', 'The appeal works. A legendary.', 'legend'); } else { giveCurse(pickCurse()); if (P.downs.length < DOWN_CAP) setTimeout(() => giveDown(), 900); UI.banner('Hoger beroep: verloren', 'The appeal fails. A curse and a downgrade.', 'curse'); } } },
      { w: 8, good: 0, run(room, pl, P) { const n = Math.min(8, G.run.coins || 0); G.run.coins -= n; if (n < 8 && P.downs.length < DOWN_CAP) giveDown(); UI.banner('Proceskosten', n < 8 ? `Legal fees. ${n} coins, and the rest in rot.` : 'Legal fees. Eight coins.', 'curse'); } },
      { w: 7, good: 0, run(room) { room.taak21 = 'contempt'; const pool = EXTRA_POOL[G.levelDef.set] || EXTRA_POOL.cellar; addSnakes21(room, [pick(pool), pick(pool), pick(pool), pick(pool)]); UI.banner('Minachting van het hof', 'You raised your voice. Four of them. Win and the court pays.', 'curse'); } },
      { w: 5, good: 1, run(room, pl, P) { cleanseDowns(P); dropCoins(room, pl.x, pl.y - 24, 5); UI.banner('Precedent', 'Your case sets a precedent. Every downgrade washed off, 5 coins.', 'clean'); } },
      { w: 5, good: 1, run(room, pl, P) { dropCoins(room, pl.x, pl.y - 24, 6); dropHeart(room, pl.x + 20, pl.y - 20, 1); UI.banner('Verstek', 'The other side did not show up. You win by default.'); } },
    ],
    gedaagde: [
      { w: 26, good: 1, run(room, pl, P) { if (!cleanseOne(P, 'Vrijspraak. Not guilty of anything.')) { P.heal(2); UI.banner('Vrijspraak', 'Not guilty. You feel lighter.', 'clean'); } } },
      { w: 18, good: 1, run(room, pl, P) { P.heal(2); dropCoins(room, pl.x, pl.y - 24, 4); UI.banner('Schikking', 'A settlement: a snack and four coins.'); } },
      { w: 12, good: 0, run(room) { room.taak = true; const pool = EXTRA_POOL[G.levelDef.set] || EXTRA_POOL.cellar; addSnakes21(room, [pick(pool), pick(pool), pick(pool)]); UI.banner('Taakstraf', 'Community service. Clean up these three.', 'curse'); } },
      { w: 8, good: 0, run(room, pl, P) { P.proef21 = room; UI.banner('Voorwaardelijk', 'Suspended sentence. Get bitten in the next fight and a curse starts. Stay clean and get 4 coins.', 'curse'); } },
      { w: 6, good: 1, run(room) { room.taak21 = 'werk'; addSnakes21(room, ['grub', 'grub', 'grub', 'grub', 'grub', 'grub']); UI.banner('Werkstraf', 'Six grubs. Easy hours, six coins.'); } },
      { w: 7, good: 1, run(room, pl, P) { const n = Math.min(5, G.run.coins || 0); G.run.coins -= n; if (P.curses.length) { removeThing(P, P.curses[P.curses.length - 1], 'curse'); UI.banner('Boete', `Pay ${n} coins. Your newest curse is dropped.`, 'clean'); } else { P.heal(2); UI.banner('Boete', `Pay ${n} coins. Nothing to drop, so here is a snack.`); } } },
      { w: 6, good: 1, run(room, pl, P) { P.maxHp = Math.min(16, P.maxHp + 2); P.heal(2); P.band21 = true; if (P.downs.length < DOWN_CAP) giveDown('zerevoet'); UI.banner('Enkelband', 'Ankle monitor. One more apple for good, and a sore foot.'); } },
      { w: 7, good: 1, run(room, pl, P) { spawnItem(room, RW / 2, RH * 0.42 + 30, 0.1); if (P.downs.length < DOWN_CAP) setTimeout(() => giveDown(), 900); UI.banner('Kroongetuige', 'You talked. A powerup, and a downgrade for snitching.'); } },
      { w: 6, good: 1, run(room, pl) { dropCoins(room, pl.x, pl.y - 24, 3); UI.banner('Geseponeerd', 'Case dropped. Three coins for your trouble.'); } },
      { w: 5, good: 1, run(room, pl, P) { if (P.downs.length) { removeThing(P, P.downs[P.downs.length - 1], 'down'); dropCoins(room, pl.x, pl.y - 24, 3); UI.banner('Bewijs kwijt', 'The evidence is gone. A downgrade too, plus 3 coins.', 'clean'); } else { dropCoins(room, pl.x, pl.y - 24, 5); UI.banner('Bewijs kwijt', 'The evidence is gone. Five coins.'); } } },
    ],
  };
  const odds21 = (side) => { const L = COURT21[side], all = L.reduce((s, o) => s + o.w, 0), good = L.filter((o) => o.good).reduce((s, o) => s + o.w, 0); return Math.round((good / all) * 100); };
  courtVerdict9 = function (room, pl) {
    room.verdictDone = true; pl.used = true;
    Meta.add('verdicts'); Sfx.gavel();
    const P = G.player, L = COURT21[pl.side] || COURT21.gedaagde;
    floatText(pl.x, pl.y - 30, pl.side === 'eiser' ? 'EISER' : 'GEDAAGDE', '#ffd27a', true);
    const roll = () => { let r = Math.random() * L.reduce((s, o) => s + o.w, 0); for (const o of L) { if ((r -= o.w) < 0) return o; } return L[0]; };
    let o = roll();
    if (P.adv21) { let n = 0; while (!o.good && n++ < 20) o = roll(); }
    if (o.good) Meta.add('rulings21');
    safe(() => o.run(room, pl, P));
  };
  {
    const i0 = info9;
    info9 = function (room, P) {
      const o = i0(room, P);
      if (o && o.tag === 'RECHTBANK') {
        const e = o.title === 'Eiser', side = e ? 'eiser' : 'gedaagde';
        o.body = e ? `Sue for it. ${COURT21.eiser.length} possible rulings, big wins and big losses. About ${odds21('eiser')} percent go your way.` : `Defend yourself. ${COURT21.gedaagde.length} possible rulings, mostly small ones. About ${odds21('gedaagde')} percent go your way.`;
        if (P.adv21) o.notes = (o.notes || []).concat([['Your lawyer is here. Nothing goes against you.', '#9fe8ff']]);
      }
      return o;
    };
  }

  /* ------------------------------------------------------------------ drawing: black hole and campfire */
  {
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const P = G.player; if (!P) return;
      safe(() => {
        if (P.hole21 && P.hole21.room === G.room) {
          const h = P.hole21, r = 14 + Math.sin(h.t * 10) * 2;
          const g = c.createRadialGradient(h.x, h.y, 2, h.x, h.y, r * 3); g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.4, 'rgba(60,20,90,0.55)'); g.addColorStop(1, 'rgba(60,20,90,0)');
          c.fillStyle = g; circle(c, h.x, h.y, r * 3);
          c.strokeStyle = 'rgba(200,140,255,0.6)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(h.x, h.y, r * (1 + i * 0.6), h.t * 6 + i, h.t * 6 + i + 2); c.stroke(); }
        }
        if (P.fire21 && P.fire21.room === G.room) {
          const f = P.fire21;
          c.fillStyle = '#4a2a14'; c.fillRect(f.x - 9, f.y + 2, 18, 4);
          flameShape(c, f.x, f.y - 2, 7, 12 + Math.sin(t * 12) * 2); c.fillStyle = '#ff6a1a'; c.fill();
          flameShape(c, f.x, f.y + 1, 4, 7); c.fillStyle = '#ffd36a'; c.fill();
          c.strokeStyle = 'rgba(255,160,60,0.18)'; c.lineWidth = 1; c.beginPath(); c.arc(f.x, f.y, 70, 0, TAU); c.stroke();
        }
      });
    };
  }

  /* ------------------------------------------------------------------ icons: one simple picture each */
  const ALL21 = Object.assign({}, NEW, NEW_CURSES, NEW_DOWNS);
  const ICON21 = {
    stamppot: ['pot', '#c8a050'], veter: ['lace', '#1a1014'], fietspomp: ['pump', '#3a6ad8'], statiegeld: ['bottle', '#3a9a4a'], mosterd: ['jar', '#e8c83a'], schaatsen: ['skate', '#c8d8e8'],
    regenjas: ['coat', '#ffd23a'], frikandel: ['stick', '#8a4a2a'], automaat: ['box', '#c8c8d0'], kwartje: ['coin', '#e8c03a'], appelmoes: ['bowl', '#f2e0a0'], uitsmijter: ['fist', '#e8b090'],
    koekoek: ['clock', '#8a5a2a'], tegeltje: ['tile', '#3a6ad8'], tosti: ['toast', '#d89a40'],
    elfsteden: ['skate', '#ffd27a'], koningsdag: ['crown', '#ff8a1e'], pakjesavond: ['gift', '#e8323c'], nachtwacht: ['frame', '#c8a050'], appelboom: ['tree', '#5aa83a'], kernsplitsing: ['atom', '#7cd0ff'],
    koets: ['coin', '#ffd84a'], drieling: ['seeds3', '#5a3820'], zwartgat: ['hole', '#2a1040'], kampvuur: ['fire', '#ff6a1a'], vuurwerk: ['rocket', '#e8323c'], snelkookpan: ['pot', '#a8b0c0'],
    zevendehemel: ['cloud', '#ffffff'], koningsappel: ['crown', '#ffd84a'], tulpenmanie: ['tulip', '#e8323c'],
    tondeuse: ['clipper', '#2a2a30'], spaarpas: ['card', '#3aa84a'], advocaat: ['gavel', '#8a5a2a'], marktplaats: ['tag', '#f2a03a'], stempas: ['ballot', '#e8742a'], fiche: ['chip', '#e8323c'],
    brandweer: ['helmet', '#e8323c'], ijsblokje: ['cube', '#bfe4ff'], loodgieter: ['wrench', '#a8b0c0'], trampoline: ['bounce', '#3a6ad8'], veerpont: ['boat', '#e8e2d0'], pindasaus: ['jar', '#a86a2a'],
    megafoon: ['mega', '#ffd23a'], rugzak: ['bag', '#5a6a3a'], verjaardag: ['cake', '#ff8ab0'],
    belasting: ['envelope', '#3a6ad8'], spitsuur: ['car', '#e8323c'], hollandsweer: ['rain', '#9fd8ff'], gokschuld: ['coin', '#c48af0'], delftsblauw: ['tile', '#2a5ab8'], tunnelvisie: ['eye', '#ffd27a'],
    bloedmaan: ['moon', '#c8102a'], kortsluiting: ['bolt', '#9fd8ff'], gamer: ['pad', '#5a5a6a'], paparazzi: ['camera', '#e8e2d0'], opdieet: ['bowl', '#9be37a'], lood: ['weight', '#6a6a78'],
    pechvogel: ['bird', '#2a2a30'], spiegel: ['mirror', '#cfe4ff'], vroegevogel: ['bird', '#ffb43a'],
    losveter: ['lace', '#e8e2d0'], zerevoet: ['foot', '#f2c8a0'], beslagen: ['glasses', '#cfe4ff'], blaar: ['foot', '#ff9a8a'], roestig: ['gear', '#a8582a'], bonnetje: ['receipt', '#f2ecd8'],
    snotneus: ['drop', '#9be37a'], kreukel: ['seed', '#8a6a4a'], klamme: ['hand', '#9fd8ff'], spierpijn: ['bolt', '#ff8a6a'], pukkel: ['dot', '#ff6a6a'], slaperig: ['zz', '#9fb0d8'],
    tocht: ['wind', '#c8d8e8'], barst: ['phone', '#3a3a4a'], krommerug: ['curve', '#e8e2d0'],
  };
  function glyph21(c, kind, col, R, t) {
    const O = '#1a1210';
    c.fillStyle = col; c.strokeStyle = O; c.lineWidth = Math.max(0.8, R * 0.07);
    const fs = (f) => { f(); c.fill(); c.stroke(); };
    switch (kind) {
      case 'pot': fs(() => rrect(c, -R * 0.6, -R * 0.2, R * 1.2, R * 0.8, R * 0.15)); c.fillRect(-R * 0.75, -R * 0.3, R * 1.5, R * 0.14); for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, (i - 1) * R * 0.3, -R * 0.5 - ((t + i * 0.3) % 1) * R * 0.3, R * 0.08); } break;
      case 'lace': c.strokeStyle = col === '#1a1014' ? '#3a1a24' : col; c.lineWidth = R * 0.18; c.beginPath(); for (let i = 0; i <= 16; i++) { const x = -R * 0.8 + i * R * 0.1, y = Math.sin(i * 0.8 + t * 3) * R * 0.35; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); break;
      case 'pump': fs(() => rrect(c, -R * 0.2, -R * 0.6, R * 0.4, R * 1.3, R * 0.1)); c.fillStyle = O; c.fillRect(-R * 0.6, -R * 0.75, R * 1.2, R * 0.14); c.fillRect(-R * 0.08, -R * 0.9, R * 0.16, R * 0.3); break;
      case 'bottle': fs(() => { c.beginPath(); c.moveTo(-R * 0.3, R * 0.8); c.lineTo(-R * 0.3, -R * 0.1); c.lineTo(-R * 0.12, -R * 0.4); c.lineTo(-R * 0.12, -R * 0.8); c.lineTo(R * 0.12, -R * 0.8); c.lineTo(R * 0.12, -R * 0.4); c.lineTo(R * 0.3, -R * 0.1); c.lineTo(R * 0.3, R * 0.8); c.closePath(); }); break;
      case 'jar': fs(() => rrect(c, -R * 0.45, -R * 0.4, R * 0.9, R * 1.15, R * 0.15)); c.fillStyle = '#e8e2d0'; c.fillRect(-R * 0.5, -R * 0.6, R, R * 0.22); break;
      case 'skate': fs(() => rrect(c, -R * 0.6, -R * 0.5, R * 0.8, R * 0.7, R * 0.2)); c.strokeStyle = '#d8dde6'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(-R * 0.75, R * 0.45); c.lineTo(R * 0.8, R * 0.45); c.quadraticCurveTo(R * 0.95, R * 0.3, R * 0.85, R * 0.15); c.stroke(); break;
      case 'coat': fs(() => { c.beginPath(); c.moveTo(-R * 0.3, -R * 0.7); c.lineTo(R * 0.3, -R * 0.7); c.lineTo(R * 0.7, R * 0.8); c.lineTo(-R * 0.7, R * 0.8); c.closePath(); }); c.fillStyle = '#9fd8ff'; for (let i = 0; i < 3; i++) circle(c, (i - 1) * R * 0.5, -R * 0.2 + ((t + i * 0.3) % 1) * R, R * 0.07); break;
      case 'stick': c.save(); c.rotate(-0.6); fs(() => rrect(c, -R * 0.8, -R * 0.16, R * 1.6, R * 0.32, R * 0.15)); c.fillStyle = '#f2e8b0'; c.fillRect(-R * 0.4, -R * 0.06, R * 0.8, R * 0.12); c.fillStyle = '#e8c83a'; c.fillRect(-R * 0.2, -R * 0.16, R * 0.4, R * 0.08); c.restore(); break;
      case 'box': fs(() => rrect(c, -R * 0.7, -R * 0.7, R * 1.4, R * 1.4, R * 0.08)); c.fillStyle = '#ffd27a'; for (let i = 0; i < 4; i++) c.fillRect(-R * 0.55 + (i % 2) * R * 0.6, -R * 0.55 + Math.floor(i / 2) * R * 0.6, R * 0.5, R * 0.45); break;
      case 'coin': fs(() => circle(c, 0, 0, R * 0.62)); c.beginPath(); c.arc(0, 0, R * 0.62, 0, TAU); c.stroke(); txt10(c, '25', 0, R * 0.02, Math.round(R * 0.5), O); break;
      case 'bowl': c.fillStyle = col; c.beginPath(); c.arc(0, -R * 0.1, R * 0.75, 0, Math.PI); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#e8c070'; ell(c, 0, -R * 0.1, R * 0.7, R * 0.16); c.fill(); break;
      case 'fist': fs(() => rrect(c, -R * 0.55, -R * 0.45, R * 1.1, R * 0.9, R * 0.25)); c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(-R * 0.55 + i * R * 0.27, -R * 0.45); c.lineTo(-R * 0.55 + i * R * 0.27, 0); } c.stroke(); break;
      case 'clock': fs(() => rrect(c, -R * 0.55, -R * 0.3, R * 1.1, R * 1.05, R * 0.06)); fs(() => { c.beginPath(); c.moveTo(-R * 0.7, -R * 0.25); c.lineTo(0, -R * 0.85); c.lineTo(R * 0.7, -R * 0.25); c.closePath(); }); c.fillStyle = '#f2ecd8'; circle(c, 0, R * 0.2, R * 0.3); c.strokeStyle = O; c.beginPath(); c.moveTo(0, R * 0.2); c.lineTo(Math.cos(t) * R * 0.22, R * 0.2 + Math.sin(t) * R * 0.22); c.stroke(); break;
      case 'tile': fs(() => c.rect(-R * 0.7, -R * 0.7, R * 1.4, R * 1.4)); c.fillStyle = '#f2ecd8'; c.fillRect(-R * 0.55, -R * 0.55, R * 1.1, R * 1.1); c.strokeStyle = col; c.lineWidth = R * 0.1; c.beginPath(); c.arc(0, 0, R * 0.32, 0, TAU); c.stroke(); break;
      case 'toast': fs(() => rrect(c, -R * 0.65, -R * 0.55, R * 1.3, R * 1.1, R * 0.25)); c.strokeStyle = '#7a4a1a'; c.lineWidth = R * 0.06; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-R * 0.5, i * R * 0.3); c.lineTo(R * 0.5, i * R * 0.3); c.stroke(); } c.fillStyle = '#ffe680'; c.fillRect(-R * 0.65, R * 0.4, R * 1.3, R * 0.12); break;
      case 'crown': fs(() => { c.beginPath(); c.moveTo(-R * 0.75, R * 0.5); c.lineTo(-R * 0.8, -R * 0.4); c.lineTo(-R * 0.4, 0); c.lineTo(0, -R * 0.65); c.lineTo(R * 0.4, 0); c.lineTo(R * 0.8, -R * 0.4); c.lineTo(R * 0.75, R * 0.5); c.closePath(); }); break;
      case 'gift': fs(() => c.rect(-R * 0.65, -R * 0.35, R * 1.3, R * 1.05)); c.fillStyle = '#ffd27a'; c.fillRect(-R * 0.1, -R * 0.35, R * 0.2, R * 1.05); c.fillRect(-R * 0.65, R * 0.05, R * 1.3, R * 0.18); c.strokeStyle = '#ffd27a'; c.lineWidth = R * 0.1; c.beginPath(); c.arc(-R * 0.2, -R * 0.5, R * 0.18, 0, TAU); c.arc(R * 0.2, -R * 0.5, R * 0.18, 0, TAU); c.stroke(); break;
      case 'frame': fs(() => c.rect(-R * 0.8, -R * 0.6, R * 1.6, R * 1.2)); c.fillStyle = '#2a1a0c'; c.fillRect(-R * 0.62, -R * 0.42, R * 1.24, R * 0.84); for (let i = 0; i < 4; i++) { c.fillStyle = '#ffd27a'; circle(c, -R * 0.4 + i * R * 0.27, R * 0.05 + (i % 2) * R * 0.1, R * 0.08); } break;
      case 'tree': c.fillStyle = '#6a4220'; c.fillRect(-R * 0.1, 0, R * 0.2, R * 0.85); c.fillStyle = col; circle(c, 0, -R * 0.25, R * 0.6); miniApple(c, -R * 0.2, -R * 0.15, R * 0.16); miniApple(c, R * 0.25, -R * 0.4, R * 0.16); break;
      case 'atom': c.strokeStyle = col; c.lineWidth = R * 0.07; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, 0, R * 0.85, R * 0.3, t + i * Math.PI / 3, 0, TAU); c.stroke(); } miniApple(c, 0, R * 0.05, R * 0.25); break;
      case 'seeds3': for (const a of [-0.35, 0, 0.35]) seedIcon10(c, Math.sin(a) * R * 0.7, -Math.cos(a) * R * 0.3 + R * 0.1, R * 0.32, a); break;
      case 'hole': { const g = c.createRadialGradient(0, 0, 1, 0, 0, R * 0.9); g.addColorStop(0, '#000'); g.addColorStop(0.5, '#3a1a6a'); g.addColorStop(1, 'rgba(60,20,90,0)'); c.fillStyle = g; circle(c, 0, 0, R * 0.9); c.strokeStyle = '#c88aff'; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, 0, R * 0.55, t * 3, t * 3 + 2.5); c.stroke(); break; }
      case 'fire': c.fillStyle = '#6a4220'; c.fillRect(-R * 0.6, R * 0.5, R * 1.2, R * 0.15); flameShape(c, 0, R * 0.05, R * 0.55, R * 0.85); c.fillStyle = '#ff6a1a'; c.fill(); flameShape(c, 0, R * 0.25, R * 0.3, R * 0.5); c.fillStyle = '#ffd36a'; c.fill(); break;
      case 'rocket': c.save(); c.rotate(-0.7); fs(() => rrect(c, -R * 0.15, -R * 0.8, R * 0.3, R * 1.2, R * 0.12)); c.fillStyle = '#ffd36a'; flameShape(c, 0, R * 0.65, R * 0.18, R * 0.3); c.fill(); c.restore(); sparkle(c, R * 0.5, -R * 0.5, R * 0.25, '#ffd27a'); break;
      case 'cloud': c.fillStyle = '#f2f4ff'; for (const [x, y, r] of [[-0.35, 0.1, 0.35], [0.05, -0.1, 0.45], [0.4, 0.1, 0.32]]) circle(c, x * R, y * R, r * R); txt10(c, '7', 0, R * 0.05, Math.round(R * 0.6), '#c8a050'); break;
      case 'tulip': c.strokeStyle = '#3d6a1c'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.9); c.lineTo(0, 0); c.stroke(); fs(() => { c.beginPath(); c.moveTo(-R * 0.4, -R * 0.6); c.lineTo(-R * 0.2, -R * 0.3); c.lineTo(0, -R * 0.65); c.lineTo(R * 0.2, -R * 0.3); c.lineTo(R * 0.4, -R * 0.6); c.quadraticCurveTo(R * 0.45, R * 0.1, 0, R * 0.1); c.quadraticCurveTo(-R * 0.45, R * 0.1, -R * 0.4, -R * 0.6); c.closePath(); }); break;
      case 'clipper': fs(() => rrect(c, -R * 0.3, -R * 0.6, R * 0.6, R * 1.4, R * 0.2)); c.fillStyle = '#d8dde6'; c.fillRect(-R * 0.35, -R * 0.8, R * 0.7, R * 0.2); break;
      case 'card': fs(() => rrect(c, -R * 0.8, -R * 0.5, R * 1.6, R, R * 0.12)); c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.8, -R * 0.25, R * 1.6, R * 0.18); txt10(c, 'BP', R * 0.35, R * 0.22, Math.round(R * 0.36), '#ffffff'); break;
      case 'gavel': c.save(); c.rotate(-0.6); fs(() => rrect(c, -R * 0.5, -R * 0.55, R, R * 0.4, R * 0.08)); c.fillStyle = '#5a3a1a'; c.fillRect(-R * 0.07, -R * 0.15, R * 0.14, R * 1.0); c.restore(); break;
      case 'tag': fs(() => { c.beginPath(); c.moveTo(-R * 0.75, -R * 0.35); c.lineTo(R * 0.4, -R * 0.35); c.lineTo(R * 0.8, 0); c.lineTo(R * 0.4, R * 0.35); c.lineTo(-R * 0.75, R * 0.35); c.closePath(); }); txt10(c, '€', -R * 0.15, 0, Math.round(R * 0.5), O); break;
      case 'ballot': fs(() => c.rect(-R * 0.6, -R * 0.2, R * 1.2, R * 0.9)); c.fillStyle = '#f2ecd8'; c.save(); c.rotate(0.1); c.fillRect(-R * 0.3, -R * 0.8, R * 0.6, R * 0.7); c.restore(); txt10(c, 'X', 0, -R * 0.45, Math.round(R * 0.4), '#e8323c'); break;
      case 'chip': fs(() => circle(c, 0, 0, R * 0.7)); c.beginPath(); c.arc(0, 0, R * 0.7, 0, TAU); c.stroke(); c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.12; c.setLineDash([R * 0.2, R * 0.2]); c.beginPath(); c.arc(0, 0, R * 0.55, 0, TAU); c.stroke(); c.setLineDash([]); break;
      case 'helmet': fs(() => { c.beginPath(); c.arc(0, R * 0.15, R * 0.7, Math.PI, 0); c.lineTo(R * 0.9, R * 0.3); c.lineTo(-R * 0.9, R * 0.3); c.closePath(); }); c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.15, -R * 0.4, R * 0.3, R * 0.3); break;
      case 'cube': fs(() => rrect(c, -R * 0.55, -R * 0.55, R * 1.1, R * 1.1, R * 0.15)); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-R * 0.4, -R * 0.4, R * 0.3, R * 0.15); break;
      case 'wrench': c.save(); c.rotate(-0.7); c.fillStyle = col; c.fillRect(-R * 0.1, -R * 0.3, R * 0.2, R * 1.1); c.beginPath(); c.arc(0, -R * 0.45, R * 0.3, 0, TAU); c.fill(); c.fillStyle = '#1a1210'; c.fillRect(-R * 0.08, -R * 0.8, R * 0.16, R * 0.3); c.restore(); break;
      case 'bounce': c.strokeStyle = col; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(-R * 0.8, R * 0.5); c.quadraticCurveTo(0, R * 0.8, R * 0.8, R * 0.5); c.stroke(); seedIcon10(c, 0, -R * 0.3 - Math.abs(Math.sin(t * 3)) * R * 0.3, R * 0.3, 0); break;
      case 'boat': fs(() => { c.beginPath(); c.moveTo(-R * 0.85, 0); c.lineTo(R * 0.85, 0); c.lineTo(R * 0.6, R * 0.45); c.lineTo(-R * 0.6, R * 0.45); c.closePath(); }); c.fillStyle = '#3a6ad8'; c.fillRect(-R * 0.9, R * 0.5, R * 1.8, R * 0.12); break;
      case 'mega': fs(() => { c.beginPath(); c.moveTo(-R * 0.6, -R * 0.2); c.lineTo(R * 0.6, -R * 0.6); c.lineTo(R * 0.6, R * 0.6); c.lineTo(-R * 0.6, R * 0.2); c.closePath(); }); for (let i = 1; i < 3; i++) { c.strokeStyle = '#ffffff'; c.beginPath(); c.arc(R * 0.6, 0, R * 0.2 * i, -0.8, 0.8); c.stroke(); } break;
      case 'bag': fs(() => rrect(c, -R * 0.55, -R * 0.5, R * 1.1, R * 1.25, R * 0.25)); c.strokeStyle = O; c.beginPath(); c.arc(0, -R * 0.5, R * 0.3, Math.PI, 0); c.stroke(); c.fillStyle = '#8a9a5a'; c.fillRect(-R * 0.35, R * 0.1, R * 0.7, R * 0.35); break;
      case 'cake': fs(() => c.rect(-R * 0.65, -R * 0.1, R * 1.3, R * 0.75)); c.fillStyle = '#ffffff'; c.fillRect(-R * 0.65, -R * 0.1, R * 1.3, R * 0.15); c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.04, -R * 0.55, R * 0.08, R * 0.45); flameShape(c, 0, -R * 0.65, R * 0.08, R * 0.15); c.fillStyle = '#ff8a1e'; c.fill(); break;
      case 'envelope': fs(() => c.rect(-R * 0.75, -R * 0.45, R * 1.5, R * 0.95)); c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(-R * 0.75, -R * 0.45); c.lineTo(0, R * 0.1); c.lineTo(R * 0.75, -R * 0.45); c.stroke(); break;
      case 'car': fs(() => rrect(c, -R * 0.8, -R * 0.1, R * 1.6, R * 0.5, R * 0.1)); fs(() => rrect(c, -R * 0.4, -R * 0.45, R * 0.8, R * 0.4, R * 0.1)); c.fillStyle = O; circle(c, -R * 0.45, R * 0.45, R * 0.15); circle(c, R * 0.45, R * 0.45, R * 0.15); break;
      case 'rain': c.fillStyle = '#9aa0ac'; for (const [x, y, r] of [[-0.3, -0.4, 0.3], [0.1, -0.5, 0.36], [0.4, -0.35, 0.28]]) circle(c, x * R, y * R, r * R); c.strokeStyle = col; c.lineWidth = R * 0.07; for (let i = 0; i < 4; i++) { const u = (t + i * 0.25) % 1; c.beginPath(); c.moveTo((i - 1.5) * R * 0.3, -R * 0.1 + u * R * 0.6); c.lineTo((i - 1.5) * R * 0.3 - R * 0.08, R * 0.1 + u * R * 0.6); c.stroke(); } break;
      case 'eye': fs(() => { c.beginPath(); c.moveTo(-R * 0.8, 0); c.quadraticCurveTo(0, -R * 0.6, R * 0.8, 0); c.quadraticCurveTo(0, R * 0.6, -R * 0.8, 0); }); c.fillStyle = O; circle(c, 0, 0, R * 0.18); break;
      case 'moon': c.fillStyle = col; circle(c, 0, 0, R * 0.65); c.fillStyle = 'rgba(80,0,10,0.5)'; circle(c, R * 0.2, -R * 0.15, R * 0.15); circle(c, -R * 0.25, R * 0.2, R * 0.1); break;
      case 'bolt': c.fillStyle = col; c.beginPath(); c.moveTo(R * 0.1, -R * 0.85); c.lineTo(-R * 0.4, R * 0.1); c.lineTo(0, R * 0.1); c.lineTo(-R * 0.1, R * 0.85); c.lineTo(R * 0.45, -R * 0.15); c.lineTo(R * 0.05, -R * 0.15); c.closePath(); c.fill(); c.stroke(); break;
      case 'pad': fs(() => rrect(c, -R * 0.8, -R * 0.35, R * 1.6, R * 0.75, R * 0.35)); c.fillStyle = '#e8323c'; circle(c, R * 0.4, 0, R * 0.1); c.fillStyle = '#3a6ad8'; circle(c, R * 0.55, R * 0.12, R * 0.1); c.fillStyle = '#e8e2d0'; c.fillRect(-R * 0.55, -R * 0.04, R * 0.35, R * 0.08); c.fillRect(-R * 0.41, -R * 0.18, R * 0.08, R * 0.36); break;
      case 'camera': fs(() => rrect(c, -R * 0.75, -R * 0.35, R * 1.5, R * 0.9, R * 0.12)); c.fillStyle = O; circle(c, 0, R * 0.1, R * 0.3); sparkle(c, R * 0.55, -R * 0.6, R * 0.25, '#ffffff'); break;
      case 'weight': fs(() => { c.beginPath(); c.moveTo(-R * 0.4, -R * 0.4); c.lineTo(R * 0.4, -R * 0.4); c.lineTo(R * 0.7, R * 0.6); c.lineTo(-R * 0.7, R * 0.6); c.closePath(); }); txt10(c, 'KG', 0, R * 0.15, Math.round(R * 0.4), '#e8e2d0'); break;
      case 'bird': fs(() => ell(c, 0, R * 0.1, R * 0.55, R * 0.4)); fs(() => circle(c, R * 0.45, -R * 0.25, R * 0.28)); c.fillStyle = '#ffb43a'; c.beginPath(); c.moveTo(R * 0.7, -R * 0.28); c.lineTo(R * 0.95, -R * 0.2); c.lineTo(R * 0.7, -R * 0.12); c.fill(); break;
      case 'mirror': fs(() => ell(c, 0, -R * 0.1, R * 0.5, R * 0.65)); c.strokeStyle = '#4a3a24'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.3, -R * 0.5); c.lineTo(0, -R * 0.1); c.lineTo(-R * 0.15, R * 0.2); c.lineTo(R * 0.2, R * 0.4); c.stroke(); break;
      case 'foot': fs(() => ell(c, 0, R * 0.15, R * 0.4, R * 0.6)); for (let i = 0; i < 4; i++) { c.fillStyle = col; circle(c, -R * 0.3 + i * R * 0.2, -R * 0.55, R * 0.1); } break;
      case 'glasses': c.strokeStyle = O; c.lineWidth = R * 0.08; c.fillStyle = col; for (const s of [-1, 1]) { circle(c, s * R * 0.38, 0, R * 0.3); c.beginPath(); c.arc(s * R * 0.38, 0, R * 0.3, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-R * 0.08, 0); c.lineTo(R * 0.08, 0); c.stroke(); break;
      case 'gear': c.fillStyle = col; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.fillRect(-R * 0.1, -R * 0.8, R * 0.2, R * 0.3); c.restore(); } circle(c, 0, 0, R * 0.55); c.fillStyle = O; circle(c, 0, 0, R * 0.18); break;
      case 'receipt': fs(() => c.rect(-R * 0.45, -R * 0.75, R * 0.9, R * 1.5)); c.strokeStyle = '#8a8478'; c.lineWidth = R * 0.05; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-R * 0.3, -R * 0.5 + i * R * 0.25); c.lineTo(R * 0.3, -R * 0.5 + i * R * 0.25); c.stroke(); } break;
      case 'drop': fs(() => { c.beginPath(); c.moveTo(0, -R * 0.7); c.quadraticCurveTo(R * 0.6, R * 0.1, 0, R * 0.6); c.quadraticCurveTo(-R * 0.6, R * 0.1, 0, -R * 0.7); }); break;
      case 'seed': seedIcon10(c, 0, 0, R * 0.55, 0.4, '#5a3820', col); break;
      case 'hand': fs(() => rrect(c, -R * 0.45, -R * 0.2, R * 0.9, R * 0.9, R * 0.2)); for (let i = 0; i < 4; i++) { c.fillStyle = col; rrect(c, -R * 0.42 + i * R * 0.22, -R * 0.75, R * 0.18, R * 0.6, R * 0.08); c.fill(); } break;
      case 'dot': miniApple(c, 0, R * 0.1, R * 0.6); c.fillStyle = col; circle(c, R * 0.2, -R * 0.05, R * 0.14); break;
      case 'zz': txt10(c, 'Zz', 0, 0, Math.round(R * 0.9), col); break;
      case 'wind': c.strokeStyle = col; c.lineWidth = R * 0.1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-R * 0.8, (i - 1) * R * 0.35); c.lineTo(R * 0.4, (i - 1) * R * 0.35); c.arc(R * 0.4, (i - 1) * R * 0.35 - R * 0.12, R * 0.12, Math.PI / 2, -Math.PI / 2, true); c.stroke(); } break;
      case 'phone': fs(() => rrect(c, -R * 0.4, -R * 0.75, R * 0.8, R * 1.5, R * 0.12)); c.strokeStyle = '#cfe4ff'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.3, -R * 0.5); c.lineTo(R * 0.1, 0); c.lineTo(-R * 0.1, R * 0.2); c.lineTo(R * 0.3, R * 0.6); c.stroke(); break;
      case 'curve': c.strokeStyle = col; c.lineWidth = R * 0.14; c.beginPath(); c.arc(R * 0.3, R * 0.1, R * 0.7, Math.PI * 0.6, Math.PI * 1.4); c.stroke(); circle(c, -R * 0.1, -R * 0.65, R * 0.2); break;
      default: miniApple(c, 0, 0, R * 0.6);
    }
  }
  {
    const di0 = drawItemIcon;
    drawItemIcon = function (c, id, S, t = 0) {
      if (!ALL21[id]) return di0.apply(this, arguments);
      const R = S / 2, g = ICON21[id] || ['apple', '#c92139'];
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      safe(() => { if (NEW_CURSES[id]) curseDisc(c, R, t); glyph21(c, g[0], g[1], R * (NEW_CURSES[id] ? 0.85 : 1), t); if (NEW_DOWNS[id]) downBadge(c, R); });
      c.restore();
    };
  }

  /* ------------------------------------------------------------------ texts file lines and the guide */
  for (const s of ['HATSJOE', 'TRIM', 'REGENJAS', 'ERUIT', 'OPGEPOMPT', 'KOEKOEK', 'PLOF', 'HE!', 'KAMPVUUR', 'STRUIKEL', 'FLITS', 'KORTSLUITING', 'SCHONE OLIE', 'HUP HOLLAND', 'STATIEGELD', 'WINST', 'SNACK', 'NIKS',
    'AUTOMAAT', 'DWANGSOM', 'STEMPAS', 'VEERPONT', 'PAKJE', 'PSSSHHT']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const rb = [...document.querySelectorAll('#tab-rooms li')].find((li) => /Rechtbank/.test(li.textContent));
    if (rb) { const sp = rb.querySelector('span'); if (sp) sp.textContent = `Step onto a plate. Eiser: ${COURT21.eiser.length} rulings, from a legendary to contempt of court. Gedaagde: ${COURT21.gedaagde.length} rulings, mostly small. The other plate closes.`; }
    const bp = [...document.querySelectorAll('#tab-rooms li')].find((li) => /BP Tankstation/.test(li.textContent));
    if (bp) { const sp = bp.querySelector('span'); if (sp) sp.textContent = `Three pumps from ${PUMPS.length} kinds of fuel. Each pushes one number up and another down, for 20 to 40 coins. Some wash or heal. The till buys your powerups back.`; }
  });
  safe(() => UI.buildItemCards());
  safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  safe(() => Meta.check());
  Object.assign(window.__bitten || (window.__bitten = {}), { NEW21: NEW, NEW_CURSES21: NEW_CURSES, NEW_DOWNS21: NEW_DOWNS, NEW_PUMPS21: NEW_PUMPS, COURT21 });
})();


/* ------------------------------------------------------------------ v10.23: Code tab and admin mode */
(function admin23() {
  try {
    const AKEY = 'bitten.admin23', UKEY = 'bitten.admin23.undo';
    const $ = (id) => document.getElementById(id);
    const rd = () => { try { return JSON.parse(localStorage.getItem(AKEY) || '{}') || {}; } catch (e) { return {}; } };
    const A = Object.assign({ on: false, t: {}, scale: 1 }, rd());
    A.t = A.t || {};
    const wr = () => { try { localStorage.setItem(AKEY, JSON.stringify(A)); } catch (e) { /* storage unavailable */ } };
    const FLOORS = ['cellar', 'halls', 'market', 'kamer', 'garden', 'bus', 'rook', 'mega', 'arena', 'rave', 'court', 'metro', 'afgrond'];

    /* ---------- unlock everything, with a snapshot to undo it */
    function unlockAll() {
      const D = Save.data;
      try { if (!localStorage.getItem(UKEY)) localStorage.setItem(UKEY, JSON.stringify(D)); } catch (e) { /* no snapshot */ }
      for (const id of CHAR_IDS) { D.unlocks[id] = true; D.winChars[id] = D.winChars[id] || true; D.seen[id] = true; }
      D.unlocks.nightmare = true; D.unlocked = true;
      for (const a of ACHS) { if (!D.ach[a.id]) D.ach[a.id] = Date.now(); if (a.reward && CHARS[a.reward]) D.unlocks[a.reward] = true; }
      for (const id of Object.keys(ITEMS)) if (id !== 'golden') D.found[id] = true;
      D.floorsSeen = D.floorsSeen || {};
      for (const f of FLOORS) { D.floorsSeen[f] = true; D.seen['f:' + f] = true; }
      for (const k of Object.keys(BOSS_INFO)) D.seen['b:' + k] = true;
      for (const k of BOSS_ORDER10) D.seen['b:' + k] = true;
      D.stats.storyWins = Math.max(1, D.stats.storyWins || 0); D.stats.story2Wins = Math.max(1, D.stats.story2Wins || 0);
      D.best.level = Math.max(D.best.level || 0, LEVELS.length); D.best.wins = Math.max(D.best.wins || 0, 1);
      Save.store(); UI.refresh();
      try { if (UI.buildItemCards) UI.buildItemCards(); } catch (e) { /* cosmetic */ }
    }
    function undoUnlock() {
      let raw = null; try { raw = localStorage.getItem(UKEY); } catch (e) { raw = null; }
      if (!raw) return false;
      try { Save.data = Object.assign(Save.defaults(), JSON.parse(raw)); localStorage.removeItem(UKEY); Save.store(); UI.refresh(); return true; } catch (e) { return false; }
    }

    /* ---------- styles and elements */
    const css = document.createElement('style');
    css.textContent = `
.tab23{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:30;font:600 11px/1 inherit;letter-spacing:.08em;text-transform:uppercase;color:rgba(236,226,212,.55);background:rgba(10,8,8,.7);border:1px solid rgba(236,226,212,.22);border-radius:0;padding:7px 10px;cursor:pointer}
.tab23:hover{color:#ece2d4;border-color:rgba(236,226,212,.5)}
.tab23.adm{right:62px;color:#ffd27a;border-color:rgba(255,210,122,.45)}
.ov23{position:fixed;inset:0;z-index:90;background:rgba(6,4,4,.82);display:flex;align-items:center;justify-content:center;padding:12px}
.ov23[hidden]{display:none}
.bx23{background:#16100f;border:1px solid rgba(236,226,212,.3);border-radius:0;width:min(100%,460px);max-height:100%;overflow:auto;padding:16px;color:#ece2d4}
.bx23 h2{margin:0 0 4px;font-size:18px}
.bx23 h3{margin:14px 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(236,226,212,.6)}
.bx23 p{margin:4px 0 8px;font-size:13px;line-height:1.4;color:rgba(236,226,212,.75)}
.bx23 input[type=text],.bx23 select{width:100%;box-sizing:border-box;background:#0c0808;color:#ece2d4;border:1px solid rgba(236,226,212,.3);border-radius:0;padding:9px;font:inherit;font-size:14px}
.g23{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.b23{background:#241a18;color:#ece2d4;border:1px solid rgba(236,226,212,.25);border-radius:0;padding:8px 6px;font:inherit;font-size:12px;cursor:pointer;text-align:center}
.b23:hover{border-color:rgba(236,226,212,.6)}
.b23.on{background:#4a2a14;border-color:#ffd27a;color:#ffd27a}
.b23:disabled{opacity:.35;cursor:default}
.l23{max-height:150px;overflow:auto;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px}
.l23 .b23{text-align:left;padding:6px;font-size:11px}
.m23{min-height:16px;font-size:12px;color:#ffd27a;margin:6px 0 0}
.r23{display:flex;gap:6px;margin-top:6px}
.r23 .b23{flex:1}
.i23{font-size:11px;color:rgba(236,226,212,.55);line-height:1.5}
`;
    document.head.appendChild(css);

    const code = document.createElement('div');
    code.className = 'ov23'; code.hidden = true; code.id = 'code23';
    code.innerHTML = `<div class="bx23" role="dialog" aria-label="Enter a code"><h2>Code</h2><p>Type a code to unlock something.</p>
<input type="text" id="codeIn23" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Code">
<p class="m23" id="codeMsg23"></p><div class="r23"><button class="b23" id="codeGo23" type="button">Enter</button><button class="b23" id="codeX23" type="button">Close</button></div></div>`;
    const adm = document.createElement('div');
    adm.className = 'ov23'; adm.hidden = true; adm.id = 'admin23';
    adm.innerHTML = '<div class="bx23" role="dialog" aria-label="Admin"><h2>Admin</h2><p class="i23" id="admInfo23"></p><div id="admBody23"></div><div class="r23"><button class="b23" id="admX23" type="button">Close</button></div></div>';
    document.body.appendChild(code); document.body.appendChild(adm);

    const menu = $('menu');
    const tab = document.createElement('button'); tab.type = 'button'; tab.className = 'tab23'; tab.textContent = 'Code'; tab.id = 'btnCode23';
    const atab = document.createElement('button'); atab.type = 'button'; atab.className = 'tab23 adm'; atab.textContent = 'Admin'; atab.id = 'btnAdm23'; atab.hidden = !A.on;
    if (menu) { menu.appendChild(tab); menu.appendChild(atab); }
    const pr = $('btnResume');
    const pAdm = document.createElement('button'); pAdm.type = 'button'; pAdm.className = 'btn'; pAdm.id = 'btnAdm2'; pAdm.textContent = 'Admin'; pAdm.hidden = !A.on;
    if (pr && pr.parentNode) pr.parentNode.insertBefore(pAdm, pr.nextSibling);

    /* keep game keys out of the text fields */
    for (const el of [code, adm]) for (const ev of ['keydown', 'keyup']) el.addEventListener(ev, (e) => { if (e.key === 'Escape' && ev === 'keydown') { e.preventDefault(); closeAll(); } e.stopPropagation(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (!code.hidden || !adm.hidden)) { e.preventDefault(); e.stopImmediatePropagation(); closeAll(); } }, true);
    function closeAll() { code.hidden = true; adm.hidden = true; }

    /* ---------- codes */
    const CODES = {
      AUTOAIM() {
        A.t.aim = !A.t.aim; wr();
        return A.t.aim ? 'Auto aim on. You only walk, the apple aims and shoots. Enter the code again to switch it off.' : 'Auto aim off.';
      },
      BRIE() {
        const again = A.on;
        A.on = true; wr(); unlockAll(); refreshTabs();
        return again ? 'Admin was on. Everything unlocked again.' : 'Admin mode on. Everything unlocked. Open Admin on the menu or the pause screen.';
      },
    };
    function enter() {
      const v = $('codeIn23').value.trim().toUpperCase(), m = $('codeMsg23');
      if (!v) { m.textContent = ''; return; }
      const fn = CODES[v];
      if (!fn) { m.textContent = 'Not a code.'; return; }
      m.textContent = fn(); $('codeIn23').value = '';
    }
    function refreshTabs() { atab.hidden = !A.on; pAdm.hidden = !A.on; }
    tab.addEventListener('click', (e) => { e.preventDefault(); code.hidden = false; $('codeMsg23').textContent = ''; setTimeout(() => $('codeIn23').focus(), 30); });
    $('codeGo23').addEventListener('click', enter);
    $('codeIn23').addEventListener('keydown', (e) => { if (e.key === 'Enter') enter(); });
    $('codeX23').addEventListener('click', closeAll);
    $('admX23').addEventListener('click', closeAll);
    atab.addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });
    pAdm.addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });
    code.addEventListener('click', (e) => { if (e.target === code) closeAll(); });
    adm.addEventListener('click', (e) => { if (e.target === adm) closeAll(); });

    /* ---------- admin panel */
    const inRun = () => !!(G.run && G.player && G.room && (G.state === 'play' || G.state === 'pause'));
    const TOG = [
      ['god', 'God mode'], ['one', 'One hit kills'], ['coins', 'Infinite coins and keys'], ['rapid', 'Rapid fire'],
      ['fast', 'Speed boost'], ['freeze', 'Freeze snakes'], ['aim', 'Auto aim (walk only)'],
    ];
    const nm = (t, id) => (t[id] && t[id].name) || id;
    let msgEl = null;
    const say = (s) => { if (msgEl) msgEl.textContent = s; };
    function openAdmin() {
      if (!A.on) return;
      adm.hidden = false; build();
    }
    function btn(label, fn, cls) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'b23' + (cls ? ' ' + cls : ''); b.textContent = label;
      b.addEventListener('click', () => { try { fn(b); } catch (e) { say('Failed: ' + (e && e.message)); } if (inRun()) { try { UI.refresh(); if (G.state === 'pause') UI.fillPause(); } catch (x) { /* cosmetic */ } } });
      return b;
    }
    function sec(parent, title) { const h = document.createElement('h3'); h.textContent = title; parent.appendChild(h); const g = document.createElement('div'); g.className = 'g23'; parent.appendChild(g); return g; }
    function listOf(parent, title, ids, table, give) {
      const h = document.createElement('h3'); h.textContent = title; parent.appendChild(h);
      const inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = 'Search'; inp.autocomplete = 'off'; parent.appendChild(inp);
      const box = document.createElement('div'); box.className = 'l23'; parent.appendChild(box);
      const fill = () => {
        box.textContent = '';
        const q = inp.value.trim().toLowerCase();
        const P = G.player;
        for (const id of ids) {
          const n = nm(table, id);
          if (q && n.toLowerCase().indexOf(q) < 0 && id.indexOf(q) < 0) continue;
          const b = btn(n, () => { give(id); fill(); }); b.title = (table[id] && table[id].desc) || ''; b.dataset.id = id;
          if (!inRun()) b.disabled = true;
          if (P && ((P.items && P.items.includes(id) && table === ITEMS) || (P.curses && P.curses.includes(id) && table === CURSES) || (P.downs && P.downs.includes(id) && table === DOWNS))) b.classList.add('on');
          box.appendChild(b);
        }
      };
      inp.addEventListener('input', fill); fill();
    }
    function build() {
      const body = $('admBody23'); body.textContent = '';
      const live = inRun(), P = live ? G.player : null;
      $('admInfo23').textContent = live
        ? `Seed ${G.run.seed}  ·  ${G.mode} ${G.diff}  ·  ${floorLabel(G.levelIdx)}  ·  room ${G.room.type || '?'}  ·  ${G.room.snakes.length} snakes  ·  ${P.items.length} powerups`
        : 'No run active. Start a run to use the run tools.';
      const t = sec(body, 'Toggles');
      for (const [k, label] of TOG) { const b = btn(label, () => { A.t[k] = !A.t[k]; wr(); applyToggleOff(k); b.classList.toggle('on', !!A.t[k]); }, A.t[k] ? 'on' : ''); t.appendChild(b); }
      const sc = document.createElement('select'); sc.className = 'pl'; sc.setAttribute('aria-label', 'Game speed');
      for (const s of [0.25, 0.5, 1, 1.5, 2]) { const o = document.createElement('option'); o.value = s; o.textContent = 'Game speed ' + s + 'x'; if (s === A.scale) o.selected = true; sc.appendChild(o); }
      sc.addEventListener('change', () => { A.scale = +sc.value; wr(); }); body.appendChild(sc);

      const r = sec(body, 'Run tools');
      const add = (label, fn) => { const b = btn(label, fn); if (!live) b.disabled = true; r.appendChild(b); };
      add('Heal full', () => { P.hp = P.maxHp; P.bites.length = 0; say('Healed.'); });
      add('+1 apple (max)', () => { P.maxHp = Math.min(16, P.maxHp + 2); P.hp = P.maxHp; P.bites.length = 0; say('Max apples ' + P.maxHp / 2 + '.'); });
      add('+25 coins', () => { G.run.coins += 25; say('Coins ' + G.run.coins + '.'); });
      add('+3 keys', () => { G.run.keys = (G.run.keys || 0) + 3; say('Keys ' + G.run.keys + '.'); });
      add('Kill all snakes', () => { killAll(); say('Snakes cleared.'); });
      add('Clear room', () => { killAll(); clearNow(); say('Room cleared.'); });
      add('Reveal map', () => { for (const rm of G.map.rooms) rm.visited = true; for (const rm of G.map.rooms) rm.dirty = true; say('Map revealed.'); });
      add('Next floor', () => { if (G.levelIdx + 1 >= LEVELS.length) { say('Last floor.'); return; } closeAll(); if (G.state === 'pause') Game.resume(); Game.loadLevel(G.levelIdx + 1); });
      add('Cleanse one', () => { say(cleanseOne(P, 'Admin.') ? 'Washed one off.' : 'Nothing to wash.'); });
      add('Cleanse all', () => { let n = 0; while (P.downs.length) { removeThing(P, P.downs[0], 'down'); n++; } while (P.curses.length) { removeThing(P, P.curses[0], 'curse'); n++; } say('Removed ' + n + '.'); });
      const sp = document.createElement('select'); sp.className = 'bs'; sp.dataset.q = 'Search snakes'; sp.setAttribute('aria-label', 'Snake to spawn');
      for (const k of Object.keys(KINDS)) { const o = document.createElement('option'); o.value = k; o.textContent = (KINDS[k].name || k) + (KINDS[k].boss ? ' (boss)' : ''); sp.appendChild(o); }
      body.appendChild(sp);
      const sb = btn('Spawn snake', () => { const a = Math.random() * 6.28, x = clamp(P.x + Math.cos(a) * 90, 60, RW - 60), y = clamp(P.y + Math.sin(a) * 90, 60, RH - 60); G.room.snakes.push(new Snake(sp.value, x, y, { emerge: false, spawnTime: 0.4 })); say('Spawned ' + sp.value + '.'); });
      if (!live) sb.disabled = true; sb.style.marginTop = '6px'; sb.style.width = '100%'; body.appendChild(sb);

      listOf(body, 'Powerups', ITEM_IDS.filter((id) => ITEMS[id]), ITEMS, (id) => { if (P.items.includes(id)) { say('Already have ' + nm(ITEMS, id) + '.'); return; } G.run.pending.delete(id); collectItem(id); say('Gave ' + nm(ITEMS, id) + '.'); });
      listOf(body, 'Curses', Object.keys(CURSES), CURSES, (id) => { if (P.curses.includes(id)) { removeThing(P, id, 'curse'); say('Removed ' + nm(CURSES, id) + '.'); } else { giveCurse(id); say('Gave ' + nm(CURSES, id) + '.'); } });
      listOf(body, 'Downgrades', Object.keys(DOWNS), DOWNS, (id) => { if (P.downs.includes(id)) { removeThing(P, id, 'down'); say('Removed ' + nm(DOWNS, id) + '.'); } else { giveDown(id); say('Gave ' + nm(DOWNS, id) + '.'); } });

      const s = sec(body, 'Save');
      s.appendChild(btn('Unlock everything', () => { unlockAll(); say('Everything unlocked.'); }));
      s.appendChild(btn('Undo unlock', () => { say(undoUnlock() ? 'Save restored to before the unlock.' : 'No snapshot found.'); }));
      s.appendChild(btn('Admin off', () => { A.on = false; wr(); refreshTabs(); closeAll(); }));
      s.appendChild(btn('Copy seed', () => { const v = live ? String(G.run.seed) : ''; try { navigator.clipboard.writeText(v); } catch (e) { /* no clipboard */ } say(v ? 'Seed copied.' : 'No run.'); }));
      msgEl = document.createElement('p'); msgEl.className = 'm23'; body.appendChild(msgEl);
      try { if (window.__bitten && window.__bitten.adm113) window.__bitten.adm113(body); } catch (e) { /* cosmetic */ }
    }
    function killAll() { for (const sn of G.room.snakes.slice()) { if (!sn.alive) continue; try { if (sn.hurt) sn.hurt(1e9, G.player.x, G.player.y); else sn.kill(false); } catch (e) { /* skip */ } if (sn.alive && sn.kill) { try { sn.kill(false); } catch (e) { /* skip */ } } } }
    function clearNow() { const room = G.room; setTimeout(() => { if (G.room === room && room.locked && !room.snakes.some((s) => s.alive)) { try { Game.clearRoom(room); } catch (e) { /* skip */ } } }, 600); }
    function applyToggleOff(k) {
      const P = G.player; if (!P) return;
      if (k === 'god' && !A.t.god) P.god = false;
      if ((k === 'one' || k === 'fast') && !A.t[k]) recalcMods(P);
      if (k === 'freeze' && !A.t.freeze) G.freeze = 0;
    }

    /* ---------- per frame effects */
    Hooks.layer('Game.update', 'v10.21 admin toggles', function (next, dt) {
      if (A.on) {
        const P = G.player;
        if (P && G.state === 'play') {
          if (A.t.god) P.god = true;
          if (A.t.one && P.mods) P.mods.dmg = Math.max(P.mods.dmg, 1000);
          if (A.t.fast && P.mods) P.mods.speed = Math.max(P.mods.speed, 1.6);
          if (A.t.coins && G.run) { G.run.coins = Math.max(G.run.coins, 99); G.run.keys = Math.max(G.run.keys || 0, 3); }
          if (A.t.freeze) G.freeze = Math.max(G.freeze, 0.2);
        }
        if (A.scale && A.scale !== 1) dt *= A.scale;
      }
      const out = next.call(this, dt);
      if (A.on && A.t.rapid && G.player && G.state === 'play') G.player.cool = Math.min(G.player.cool, 0.05);
      return out;
    });
    const pz = Game.pause;
    Game.pause = function () { const o = pz.apply(this, arguments); refreshTabs(); return o; };
    Object.assign(window.__bitten || (window.__bitten = {}), { admin23: { A, CODES, unlockAll, undoUnlock, openAdmin } });
  } catch (e) {
    try { console.warn('admin23 failed', e); } catch (x) { /* ignore */ }
  }
})();

