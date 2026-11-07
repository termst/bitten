/* src/47-v101-haadee.js: v10.1: DagelijksHaaDee. From v10.1. Lines 22119 to 22223 of the v13.7 script. */
/* ===== v10.1: DagelijksHaaDee (achievement "F#@% BITTEN, IK STAP ER UIT!!!") ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe47'); return fb; } };

  /* achievement + stat */
  safe(() => {
    if (!STAT_DEFS.some(s => s[0] === 'leftRuns')) STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['leftRuns', 'Runs left early']);
    if (!ACHS.some(a => a.id === 'leave')) ACHS.push({ id: 'leave', reward: 'haadee', name: 'F#@% BITTEN, IK STAP ER UIT!!!', desc: 'Leave a run through the menu.', stat: 'leftRuns', goal: 1 });
  });

  /* leaving a live run through the menu counts once */
  safe(() => {
    if (Game.__haadeeToMenu) return;
    const orig = Game.toMenu;
    Game.toMenu = function () {
      safe(() => { if (G.run && (G.state === 'play' || G.state === 'pause')) Meta.add('leftRuns', 1); });
      return orig.apply(this, arguments);
    };
    Game.__haadeeToMenu = true;
  });

  /* the powerup */
  const ACTS = [
    { name: 'HET TEAM',        mult: 1.35, say: ['Samen sterk!', 'Nieuwe video!', 'Dagelijks content!'] },
    { name: 'DE BREUK',        mult: 0.75, say: ['We gaan solo.', 'Ik stop ermee.', 'Unfollow.'] },
    { name: 'SOLO CARRIERE',   mult: 0.6,  say: ['0 views', '12 abonnees', 'Pls subscribe'] },
    { name: 'COMEBACK',        mult: 1.9,  say: ['WE ZIJN TERUG!', 'Grote aankondiging!'] },
    { name: 'CRINGE',          mult: 0.5,  say: ['Cringe compilatie', 'Reactievideo over mij', 'Dislike ratio'] },
    { name: 'MEME',            mult: 0.8,  say: ['HAHAHA', 'Kijk dit nou', 'Nog steeds meme'] }
  ];
  const hs = { has: false, act: -1, base: 0, t: 0, comebackT: 0, lastSay: 0 };
  window.__haadee = hs;

  function curRooms() { return safe(() => G.run.rooms || 0, 0); }
  function owned() { return safe(() => !!(G.player && G.player.haadee), false); }
  function say(txt, col) {
    safe(() => { const P = G.player; floatText(P.x, P.y - 30, txt, col || '#ffd23a', true); });
  }
  function setAct(id) {
    if (hs.act === id) return;
    hs.act = id; hs.t = 0;
    say(ACTS[id].name, id === 3 ? '#4fc3ff' : id >= 4 ? '#ff6a6a' : '#ffd23a');
    safe(() => Sfx.pickup());
  }

  ITEMS.haadee = {
    lock: 'leave', w: 0.7, rare: true, name: 'DagelijksHaaDee',
    desc: 'Damage swings over every 10 rooms: team x1.35, breakup x0.75, solo x0.6, comeback x1.9 for 6 seconds, cringe x0.5, meme x0.8. Repeat.',
    apply(p) { p.haadee = true; hs.has = true; hs.act = -1; hs.base = curRooms(); hs.t = 0; hs.comebackT = 0; }
  };
  ITEM_IDS.push('haadee');


  /* tick: reads state, cycles acts every 10 rooms. T3: runs in the game substeps with the same dt */
  function tick(now, dt) {
    safe(() => {
      if (G.state !== 'play' || !G.run || !G.player) return;
      if (!owned()) { hs.has = false; return; }
      if (!hs.has) { hs.has = true; hs.base = curRooms(); hs.act = -1; }
      hs.t += dt;
      const phase = ((curRooms() - hs.base) % 10 + 10) % 10;
      let want = phase < 2 ? 0 : phase < 3 ? 1 : phase < 6 ? 2 : phase < 7 ? 3 : phase < 9 ? 4 : 5;
      if (want === 3) { hs.comebackT += dt; if (hs.comebackT > 6) want = 4; }
      else hs.comebackT = 0;
      if (want !== hs.act) setAct(want);
      if (hs.t - hs.lastSay > 7) { hs.lastSay = hs.t; const a = ACTS[hs.act]; if (a) say(a.say[Math.floor(Math.random() * a.say.length)], hs.act >= 4 ? '#ff9a9a' : '#fff'); }
    });
  }
  Sched.every('step', 'v10.1 haadee', tick);

  /* damage: seedDmg is called by name everywhere, so this covers every seed and hit */
  const origSeed = seedDmg;
  seedDmg = function (p) {
    const v = origSeed.apply(this, arguments);
    if (p && p.haadee && hs.act >= 0) return v * ACTS[hs.act].mult;
    return v;
  };

  /* icon: simplified d-b logo */
  const origIcon = drawItemIcon;
  drawItemIcon = function (c, id, S, t) {
    if (id !== 'haadee') return origIcon.apply(this, arguments);
    const R = S / 2;
    c.save();
    c.beginPath(); c.arc(0, 0, R * 0.95, 0, Math.PI * 2); c.fillStyle = '#0b0b0b'; c.fill();
    c.lineWidth = R * 0.14; c.strokeStyle = '#1e7bff';
    c.beginPath(); c.arc(0, 0, R * 0.8, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.strokeStyle = '#ffd23a'; c.lineWidth = R * 0.08; c.setLineDash([R * 0.1, R * 0.12]);
    c.beginPath(); c.arc(0, 0, R * 0.8, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
    c.setLineDash([]);
    c.beginPath(); c.arc(0, 0, R * 0.52, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    c.fillStyle = '#0b0b0b'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '900 ' + Math.round(R * 0.55) + 'px sans-serif'; c.fillText('d-b', 0, -R * 0.02);
    c.fillRect(-R * 0.95, R * 0.42, R * 1.9, R * 0.3);
    c.fillStyle = '#fff'; c.font = '700 ' + Math.round(R * 0.2) + 'px sans-serif'; c.fillText('DAGELIJKSHAADEE', 0, R * 0.57);
    c.restore();
  };

  safe(() => UI.buildItemCards());
})();

