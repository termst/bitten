/* src/46-v122-lucky.js: v12.2: Lucky. From v12.2. Lines 21909 to 22118 of the v13.7 script. */
/* =====================================================================
   Version 12.2: Lucky. A crab apple with a horseshoe nailed into his skull,
   a die where the left eye was and a rabbit's foot on a string.
   Every shot rolls a die: a 6 is a golden seed, a 1 is a dud. 1 in 6 bites miss him.
   ===================================================================== */
CHAR_IDS.push('lucky');
CHARS.lucky = {
  name: 'Lucky', desc: 'A crab apple with a horseshoe nailed into his skull and a die where the left eye was. Everything is a gamble. So far it works.',
  speed: 150, fireDelay: 0.36, dmg: 0.9, seedSize: 1, maxHp: 6, lucky12: true,
  perk: 'Every shot rolls a die: a 6 is a golden seed for 2.5x damage, a 1 is a dud at half. 1 in 6 bites miss him.',
  unlock: 'Hit the jackpot on a slot machine twice.', ach: 'lucky12',
};
ACHS.push({ id: 'lucky12', reward: 'bonus', name: 'Geluksvogel', desc: 'Hit the jackpot on a slot machine twice.', stat: 'jackpots', goal: 2, unlocks: 'lucky' });
// he already is lucky: Four Leaf (dodge) and Lucky Pips (golden seeds) do the same thing
CHAR_CLASH10.lucky = ['clover', 'lucky'];
const LUCKY12 = { six: 2.5, one: 0.5, dodge: 1 / 6 };

{
  const i0 = initPlayer9;
  initPlayer9 = function (P, C) { i0(P, C); P.lucky12 = !!(C && C.lucky12); P.roll12 = 0; };

  const s0 = seed9;
  seed9 = function (P, s, o) {
    s0(P, s, o);
    if (!P || !P.lucky12 || !s || !o || !o.inherit || s.crit) return;
    const r = 1 + Math.floor(Math.random() * 6);
    P.roll12 = r;
    if (r === 6) { s.dmg *= LUCKY12.six; s.size *= 1.2; s.crit = true; s.lucky12 = 6; }
    else if (r === 1) { s.dmg *= LUCKY12.one; s.size *= 0.8; s.lucky12 = 1; }
  };

  Hooks.layer('Player.hurt', 'v12.2 Lucky dodge', function (next, n, sx, sy, src) {
    if (this.lucky12 && !this.god && !(this.inv > 0 || this.dashT > 0 || this.dying > 0 || this.escaping > 0) && G.state === 'play' && Math.random() < LUCKY12.dodge) {
      this.inv = 0.6;
      floatText(this.x, this.y - 24, 'LUCKY', '#ffd84a');
      burst(this.x, this.y, 9, '#ffd84a', { min: 30, max: 100, lmin: 0.3, lmax: 0.5, glow: true });
      Sfx.coin();
      return true;
    }
    return next.apply(this, [].slice.call(arguments, 1));
  });
}

/* ------------------------------------------------------------------ how he looks */
const LUCKY_PIPS12 = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
function luckyDie12(c, x, y, s, face, rot) {
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  rrect(c, -s, -s, s * 2, s * 2, s * 0.32); c.fillStyle = '#f6f0e2'; c.fill();
  c.strokeStyle = '#1a1008'; c.lineWidth = Math.max(0.5, s * 0.16); c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-s * 0.9, s * 0.5, s * 1.8, s * 0.4);
  c.fillStyle = face === 1 ? '#c4121e' : '#1a1008';
  for (const [px, py] of LUCKY_PIPS12[face] || LUCKY_PIPS12[1]) circle(c, px * s * 0.52, py * s * 0.52, face === 1 ? s * 0.28 : s * 0.19);
  c.restore();
}
function luckyFoot12(c, x, y, R, t) {
  c.save(); c.translate(x, y); c.rotate(0.25 + Math.sin(t * 2.2) * 0.25);
  ell(c, 0, R * 0.2, R * 0.15, R * 0.27); c.fillStyle = '#e8e0d2'; c.fill(); c.strokeStyle = '#5a4a3a'; c.lineWidth = Math.max(0.5, R * 0.035); c.stroke();
  c.strokeStyle = 'rgba(120,100,80,0.55)'; c.lineWidth = Math.max(0.3, R * 0.02);
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo((i - 2.5) * R * 0.04, R * 0.05); c.lineTo((i - 2.5) * R * 0.05, R * 0.3); c.stroke(); }
  // three little claws, and the end where it came off
  c.strokeStyle = '#2a1a10'; c.lineWidth = Math.max(0.4, R * 0.03);
  for (const k of [-1, 0, 1]) { c.beginPath(); c.moveTo(k * R * 0.06, R * 0.44); c.quadraticCurveTo(k * R * 0.08, R * 0.52, k * R * 0.03 + R * 0.02, R * 0.54); c.stroke(); }
  ell(c, 0, -R * 0.05, R * 0.11, R * 0.055); c.fillStyle = '#8a1018'; c.fill();
  c.fillStyle = '#f0e8d8'; circle(c, 0, -R * 0.05, R * 0.03);
  c.fillStyle = '#c8b890'; c.fillRect(-R * 0.1, -R * 0.12, R * 0.2, R * 0.05);
  c.restore();
}
function luckyFace12(st) {
  if (st.die12) return st.die12;
  if (typeof G !== 'undefined' && G.state === 'play' && G.player && G.player.lucky12 && G.player.roll12) return G.player.roll12;
  return 1 + (Math.floor((st.t || 0) * 0.7) % 6);
}
function drawLucky12(c, R, st) {
  const t = st.t || 0, fear = st.fear || 0;
  // the string to the rabbit's foot hangs behind him
  const sw = Math.sin(t * 2.2), fx = R * (1.02 + sw * 0.06), fy = R * 0.18;
  c.strokeStyle = '#3a2a18'; c.lineWidth = Math.max(0.6, R * 0.06);
  c.beginPath(); c.moveTo(R * 0.06, -R * 0.72); c.quadraticCurveTo(R * 0.95, -R * 0.8, fx, fy - R * 0.17); c.stroke();
  c.strokeStyle = '#d8c89a'; c.lineWidth = Math.max(0.4, R * 0.03); c.stroke();
  // a sour crab apple, yellow going green, with a red cheek
  const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#f8f4a0'); g.addColorStop(0.45, '#b8c040'); g.addColorStop(1, '#3a4410');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  const bl = c.createRadialGradient(R * 0.5, R * 0.35, 0, R * 0.5, R * 0.35, R * 0.7);
  bl.addColorStop(0, 'rgba(220,40,40,0.65)'); bl.addColorStop(1, 'rgba(220,40,40,0)');
  c.fillStyle = bl; c.fillRect(-R * 1.3, -R * 1.3, R * 2.6, R * 2.6);
  c.fillStyle = 'rgba(70,60,10,0.45)';
  for (const [x, y, r] of [[-0.6, 0.4, 0.05], [-0.5, 0.55, 0.035], [-0.7, 0.15, 0.04], [0.15, 0.72, 0.04], [0.7, -0.2, 0.035], [-0.15, 0.6, 0.03]]) circle(c, x * R, y * R, r * R);
  // an old scar across the right cheek, stitched
  c.strokeStyle = '#5a1418'; c.lineWidth = Math.max(0.5, R * 0.045);
  c.beginPath(); c.moveTo(R * 0.36, R * 0.16); c.lineTo(R * 0.82, R * 0.42); c.stroke();
  c.strokeStyle = '#2a0a08'; c.lineWidth = Math.max(0.4, R * 0.03);
  for (let i = 0; i < 4; i++) { const u = 0.15 + i * 0.23, x = R * (0.36 + 0.46 * u), y = R * (0.16 + 0.26 * u); c.beginPath(); c.moveTo(x - R * 0.04, y + R * 0.07); c.lineTo(x + R * 0.04, y - R * 0.07); c.stroke(); }
  if (st.cyanide) { c.fillStyle = 'rgba(38,74,30,0.6)'; for (const [x, y, r] of [[-0.58, 0.36, 0.09], [0.52, 0.52, 0.07]]) circle(c, x * R, y * R, r * R); }
  c.restore();
  ell(c, -R * 0.5, -R * 0.4, R * 0.18, R * 0.1, -0.7); c.fillStyle = 'rgba(255,255,230,0.5)'; c.fill();
  if (st.toffee && st.shellUp) { c.strokeStyle = 'rgba(255,236,190,0.8)'; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.78, -1.15, -0.35); c.stroke(); }
  applePath(c, R); c.strokeStyle = '#1e2206'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  // a horseshoe nailed into the top of his head, open end up
  c.save(); c.translate(0, -R * 0.58); c.rotate(-0.12);
  c.lineCap = 'butt';
  c.strokeStyle = '#141418'; c.lineWidth = R * 0.27; c.beginPath(); c.arc(0, -R * 0.12, R * 0.42, Math.PI * 0.05, Math.PI * 0.95); c.stroke();
  c.strokeStyle = '#9aa0a8'; c.lineWidth = R * 0.17; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = R * 0.04; c.beginPath(); c.arc(0, -R * 0.12, R * 0.47, Math.PI * 0.25, Math.PI * 0.6); c.stroke();
  c.fillStyle = '#2a2a30';
  for (const a of [0.2, 0.38, 0.62, 0.8]) circle(c, Math.cos(a * Math.PI) * R * 0.42, -R * 0.12 + Math.sin(a * Math.PI) * R * 0.42, R * 0.045);
  c.lineCap = 'round';
  c.restore();
  // dried blood under the nails
  c.fillStyle = '#6a0a10';
  c.beginPath(); c.moveTo(-R * 0.33, -R * 0.42); c.quadraticCurveTo(-R * 0.36, -R * 0.3, -R * 0.33, -R * 0.24); c.quadraticCurveTo(-R * 0.29, -R * 0.3, -R * 0.3, -R * 0.42); c.closePath(); c.fill();
  circle(c, -R * 0.325, -R * 0.22, R * 0.035);
  if (st.face !== false) {
    const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
    // the left eye is a die in a dark socket
    ell(c, -R * 0.32, -R * 0.02, R * 0.21, R * 0.2); c.fillStyle = '#2a1008'; c.fill();
    luckyDie12(c, -R * 0.32, -R * 0.02, R * 0.13, luckyFace12(st), 0.18 + Math.sin(t * 1.3) * 0.05);
    // the right eye bulges and is not happy about it
    const x = R * 0.3 + lx * R * 0.04, y = -R * 0.05 + ly * R * 0.03;
    ell(c, x, y, R * 0.21, R * 0.23 * open); c.fillStyle = '#fff6e0'; c.fill(); c.strokeStyle = '#1e2206'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
    if (open > 0.3) {
      c.strokeStyle = 'rgba(200,30,40,0.6)'; c.lineWidth = Math.max(0.3, R * 0.02);
      for (const a of [0.3, 2.6, 3.6, 5.6]) { c.beginPath(); c.moveTo(x + Math.cos(a) * R * 0.2, y + Math.sin(a) * R * 0.2 * open); c.lineTo(x + Math.cos(a + 0.2) * R * 0.1, y + Math.sin(a + 0.2) * R * 0.1 * open); c.stroke(); }
      const px = x + lx * R * 0.07, py = y + ly * R * 0.07 * open;
      c.fillStyle = '#2a8a3a'; circle(c, px, py, R * 0.08); c.fillStyle = '#0a0a04'; circle(c, px, py, R * (0.035 + fear * 0.01));
      c.fillStyle = '#ffffff'; circle(c, px - R * 0.03, py - R * 0.03, R * 0.022);
    }
    c.strokeStyle = '#1e2206'; c.lineWidth = Math.max(0.6, R * 0.065);
    c.beginPath(); c.moveTo(R * 0.12, -R * 0.32 - fear * R * 0.04); c.quadraticCurveTo(R * 0.3, -R * 0.44, R * 0.5, -R * 0.34); c.stroke();
    if (st.hurt > 0 || st.mouthOpen) { ell(c, R * 0.02, R * 0.42, R * 0.13, R * 0.14); c.fillStyle = '#1a0404'; c.fill(); }
    else {
      // a crooked grin with one gold tooth
      c.beginPath(); c.moveTo(-R * 0.34, R * 0.3); c.quadraticCurveTo(R * 0.02, R * 0.6, R * 0.36, R * 0.24); c.quadraticCurveTo(R * 0.02, R * 0.4, -R * 0.34, R * 0.3); c.closePath();
      c.fillStyle = '#1a0404'; c.fill();
      c.save(); c.clip();
      for (let i = 0; i < 6; i++) { const tx = -R * 0.26 + i * R * 0.1; c.fillStyle = i === 4 ? '#ffd84a' : '#f2ead2'; c.fillRect(tx, R * 0.26, R * 0.08, R * 0.1); }
      c.restore();
      c.strokeStyle = '#1e2206'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
    }
  }
  // a short stem with a four leaf clover where the leaf should be
  c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.11; c.lineCap = 'round';
  c.beginPath(); c.moveTo(R * 0.04, -R * 0.62); c.quadraticCurveTo(R * 0.08, -R * 0.82, R * 0.2, -R * 0.92); c.stroke();
  c.save(); c.translate(R * 0.24, -R * 0.96); c.rotate(Math.sin(t * 1.6) * 0.15 + (st.leaf || 0));
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + Math.PI / 4; c.fillStyle = '#1f4012'; circle(c, Math.cos(a) * R * 0.11, Math.sin(a) * R * 0.11, R * 0.11); c.fillStyle = i % 2 ? '#5cbf4a' : '#6ed05a'; circle(c, Math.cos(a) * R * 0.11, Math.sin(a) * R * 0.11, R * 0.085); }
  c.restore();
  luckyFoot12(c, fx, fy, R, t);
}
{
  const da0 = drawApple;
  drawApple = function (c, R, st) {
    if (st && st.char === 'lucky') { c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; try { drawLucky12(c, R, st); } finally { c.restore(); } return; }
    return da0.apply(this, arguments);
  };
}

function boot() {
  Save.load();
  // write pending progress the moment the game is hidden, closed or reloaded, and every 20 s as a safety net
  const flushSave = () => { try { Save.store(); } catch (e) { /* ignore */ } };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
  window.addEventListener('pagehide', flushSave);
  window.addEventListener('beforeunload', flushSave);
  window.addEventListener('blur', flushSave);
  setInterval(() => { if (Meta._t) flushSave(); }, 20000);
  Texts.boot();
  Sfx.on = Save.data.sound;
  View.init(); UI.init(); Input.init(View.cv);
  MenuScene.init();
  View.layout(); UI.refresh();
  setTimeout(() => Meta.check(), 900);
  const relayout = () => { View.layout(); };
  window.addEventListener('resize', relayout);
  try { new ResizeObserver(relayout).observe(document.getElementById('app')); } catch (e) { /* older browsers use resize */ }
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') Game.pause(); });
  if (document.fonts && document.fonts.load) {
    const fams = ['700 30px "Barlow Condensed"', '500 11px "Barlow Condensed"', '600 15px "Barlow Condensed"', '600 12px "Barlow Condensed"', '800 20px "Grenze Gotisch"'];
    Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null))).then(() => {
      if (G.map) for (const r of G.map.rooms) r.dirty = true;
      View.heartsK = 0;
    });
  }
  View.cv.setAttribute('tabindex', '-1');
  // the music box starts on the first touch or key press on the menu (browsers block sound before that)
  const wakeAudio = () => {
    document.removeEventListener('pointerdown', wakeAudio, true);
    document.removeEventListener('keydown', wakeAudio, true);
    if (G.state === 'menu' && Save.data.sound) { Sfx.init(); Sfx.setOn(true); Sfx.startMusic(); }
  };
  document.addEventListener('pointerdown', wakeAudio, true);
  document.addEventListener('keydown', wakeAudio, true);
  requestAnimationFrame(frame);
}
window.__bitten = { G, Game, Input, View, KINDS, LEVELS, Snake, render, UI, Save, Story, generateLevel, generateRushLevel, mulberry32, collectItem, CHARS, Meta, ACHS, ITEMS, ITEM_IDS, spawnBall, DIFFS, MODES, STORY_LEVELS, FIGHT_SETS, dropCoins, cartsIn, splitCoalition, bossBar, nextItemId,
  CURSES, CURSE_IDS, DOWNS, DOWN_IDS, giveCurse, giveDown, cleanseOne, recalcMods, seedDmg, effDelay, priceOf, infoTarget, releaseSpore, dropKey, plantSunflower, bossHpK, enemyPowerPct, enemyPowerK, ITEM_THREAT, startMini, giveTraits };
Object.assign(window.__bitten, { DJ, STORIES9, curStory, bossFight9, startBoss9, sellItem9, sellPrice, canSell9, PUMPS, CUTS, TPL, Room, tplConnected, clubTemplate, BittenRemix,
  V9_ITEMS, V9_CURSES, V9_DOWNS, itemUnlocked, Texts, parseTexts9, chaosLevel9, MODES, MODE_IDS, spawnItem, dropHeart, updateTank9, stock9, generateLevel, RUSH_ORDER, HOW_TABS9 });
Object.assign(window.__bitten, { V10_ITEMS, V10_DOWNS, V10_CURSES, CLASH10, clashOf10, FLOOR10, TPL10, JAUDE10, startJaude10, jumpScare10, spawnRage10, spawnBoss10, planFloors10 });
boot();


