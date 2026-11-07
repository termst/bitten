/* src/71-v121-tygo.js: v12.1: Ty-Go!. From v12.1. Lines 33521 to 33640 of the v13.7 script. */
/* ===== v12.1: Ty-Go! A starting gun. When a fight starts: GO for 4 seconds, walk faster and shoot faster. Kills add a little time, capped. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { console.error(e); return fb; } };
  const GO_T = 4, GO_BOSS_T = 3, GO_MAX = 8, GO_ADD = 0.4, GO_EXT = 5, SPD_ADD = 0.25, RATE_SUB = 0.15, SPD_CAP = 2.0, RATE_MIN = 0.6;
  const NEW = {
    tygo: {
      w: 0.8,
      name: 'Ty-Go!',
      desc: 'When a fight starts: GO for 4 seconds. Walk 25% faster, shoot 18% faster. Each kill adds 0.4 seconds, up to 5 kills and 8 seconds in total. Bosses: 3 seconds, no extra time. He has no face and still yells it.',
      apply(p) { p.tygo28 = true; }
    }
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); }
  for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5;
  for (const id in NEW) ITEM_THREAT[id] = 3.5;


  const i0 = initPlayer9; initPlayer9 = function (P, C) { i0(P, C); P.tygo28 = false; P.go28T = 0; P.go28Ext = 0; };

  /* the starting gun: the first frame a fight room is locked with something alive in it */
  const pu0 = Player.prototype.update;
  Player.prototype.update = function (dt, room) {
    pu0.call(this, dt, room);
    if (!this.tygo28 || !room || this.dying > 0) return;
    safe(() => {
      if (room.locked && !room.go28 && room.snakes.some((s) => s.alive)) {
        room.go28 = true; this.go28Ext = 0;
        this.go28T = room.type === 'boss' ? GO_BOSS_T : GO_T;
        floatText(this.x, this.y - 40, 'GO!', '#ff2a3a', true);
        burst(this.x, this.y, 8, '#ffd36a');
        try { Sfx.dash(); } catch (e) {}
      }
      if (this.go28T > 0) {
        this.go28T = Math.max(0, this.go28T - dt);
        if (Math.random() < 0.35) burst(this.x - (this.aimX || 0) * 6, this.y + 4, 1, '#ff5a4a');
      }
      if (!room.locked) this.go28T = 0;
    });
  };

  /* every kill adds a little time, never past the cap */
  const ok0 = onKill9;
  onKill9 = function (sn, room, P) {
    ok0.apply(this, arguments);
    if (!P || !P.tygo28 || !(P.go28T > 0) || (sn && sn.isBoss) || (room && room.type === 'boss')) return;
    if (P.go28Ext >= GO_EXT) return;
    P.go28Ext++; P.go28T = Math.min(GO_MAX, P.go28T + GO_ADD);
  };

  /* additive on top of everything else, with a cap on both */
  const sp0 = speedK9;
  speedK9 = function (P, room) {
    let k = sp0(P, room);
    if (P && P.tygo28 && P.go28T > 0 && k < SPD_CAP) k = Math.min(SPD_CAP, k + SPD_ADD);
    return k;
  };
  const rt0 = rateK9;
  rateK9 = function (P) {
    let k = rt0(P);
    if (P && P.tygo28 && P.go28T > 0) k = Math.max(RATE_MIN, k - RATE_SUB);
    return k;
  };

  /* the icon: an empty face, blonde hair, a bit of glow, a bit of blush, a red GO in the middle */
  function tyFace(c, R, t) {
    const gl = c.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 1.25);
    gl.addColorStop(0, 'rgba(255,236,170,0.55)'); gl.addColorStop(1, 'rgba(255,236,170,0)');
    c.fillStyle = gl; circle(c, 0, 0, R * 1.25);
    /* hair behind the head */
    c.fillStyle = '#d9a93a';
    ell(c, 0, -R * 0.05, R * 0.86, R * 0.98); c.fill();
    c.strokeStyle = '#6e4d12'; c.lineWidth = Math.max(0.8, R * 0.05); c.stroke();
    /* face */
    const fg = c.createRadialGradient(-R * 0.2, -R * 0.25, R * 0.1, 0, 0, R * 0.8);
    fg.addColorStop(0, '#fbe6cc'); fg.addColorStop(1, '#e9bf98');
    ell(c, 0, R * 0.12, R * 0.6, R * 0.74); c.fillStyle = fg; c.fill();
    c.strokeStyle = '#7a4f2a'; c.lineWidth = Math.max(0.7, R * 0.04); c.stroke();
    /* fringe */
    c.fillStyle = '#e8bb44';
    c.beginPath(); c.moveTo(-R * 0.66, -R * 0.1);
    c.quadraticCurveTo(-R * 0.62, -R * 0.98, 0, -R * 0.98);
    c.quadraticCurveTo(R * 0.62, -R * 0.98, R * 0.66, -R * 0.1);
    c.quadraticCurveTo(R * 0.45, -R * 0.52, R * 0.12, -R * 0.4);
    c.quadraticCurveTo(-R * 0.1, -R * 0.6, -R * 0.3, -R * 0.36);
    c.quadraticCurveTo(-R * 0.5, -R * 0.5, -R * 0.66, -R * 0.1); c.closePath(); c.fill();
    c.strokeStyle = '#6e4d12'; c.lineWidth = Math.max(0.7, R * 0.045); c.stroke();
    c.strokeStyle = 'rgba(255,240,170,0.75)'; c.lineWidth = Math.max(0.5, R * 0.035);
    for (const [x0, x1] of [[-0.4, -0.2], [0.05, 0.25], [0.4, 0.5]]) { c.beginPath(); c.moveTo(x0 * R, -R * 0.86); c.quadraticCurveTo((x0 + x1) * R * 0.5, -R * 0.7, x1 * R, -R * 0.48); c.stroke(); }
    /* blush, a bit */
    c.fillStyle = 'rgba(255,110,120,0.38)';
    ell(c, -R * 0.4, R * 0.3, R * 0.17, R * 0.1); c.fill(); ell(c, R * 0.4, R * 0.3, R * 0.17, R * 0.1); c.fill();
    /* the GO */
    c.save(); c.translate(0, R * 0.14 + Math.sin(t * 4) * R * 0.015);
    c.font = `900 ${Math.round(R * 0.62)}px "Barlow Condensed", "Arial Narrow", Impact, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = Math.max(1.2, R * 0.12); c.strokeStyle = '#fff4e0'; c.strokeText('GO', 0, 0);
    c.fillStyle = '#e3122a'; c.fillText('GO', 0, 0);
    c.restore();
  }
  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (id !== 'tygo') return di0.apply(this, arguments);
    const R = S * 0.42; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    safe(() => tyFace(c, R, t));
    c.restore();
  };

  for (const s of ['GO!']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  Object.assign(window.__bitten || (window.__bitten = {}), { TYGO28: { NEW } });
  /* the Clear description line, same as every other powerup */
  safe(() => {
    const V = window.__bitten.V12;
    if (V && V.CLEAR12) { V.CLEAR12.items.tygo = 'A speed burst when a fight starts.'; V.install({ tygo: ITEMS.tygo }, V.CLEAR12.items); }
  });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
})();



