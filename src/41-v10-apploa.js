/* src/41-v10-apploa.js: v10: Apploa Vogels. From v10. Lines 20788 to 21047 of the v13.7 script. */
/* =====================================================================
   Version 10: Apploa Vogels, the apple with seagull wings, and how the
   new powerups look on and around the apple
   ===================================================================== */
CHAR_IDS.push('apploa');
CHARS.apploa = {
  name: 'Apploa Vogels', desc: 'Dark skin, blonde hair, and the wings of a Dutch seagull. Light, quick, and only two apples tough.',
  speed: 164, fireDelay: 0.35, dmg: 1.05, seedSize: 1, maxHp: 4, flyer: true, dash: true,
  perk: 'Flies over holes, chasms and caved-in floor. Double tap a direction to dash.',
  unlock: 'Clear 10 rooms where the floor caves in, or that have a chasm.', ach: 'gap',
};

/* ------------------------------------------------------------------ flying: holes in the floor do not stop her */
function resolveFly10(room, x, y, r) {
  for (let pass = 0; pass < 2; pass++) {
    const c0 = Math.floor((x - r) / T), c1 = Math.floor((x + r) / T);
    const r0 = Math.floor((y - r) / T), r1 = Math.floor((y + r) / T);
    for (let rr = r0; rr <= r1; rr++) {
      if (rr < 0 || rr >= ROWS) continue;
      for (let cc = c0; cc <= c1; cc++) {
        if (cc < 0 || cc >= COLS) continue;
        const o = room.tiles[rr][cc];
        if (!o || !o.solid || o.type === 'pit') continue;
        const ins = tileInset(o);
        const minX = cc * T + ins, maxX = (cc + 1) * T - ins, minY = rr * T + ins, maxY = (rr + 1) * T - ins;
        const nx = clamp(x, minX, maxX), ny = clamp(y, minY, maxY);
        const dx = x - nx, dy = y - ny, d2 = dx * dx + dy * dy;
        if (d2 >= r * r) continue;
        if (d2 > 1e-6) { const d = Math.sqrt(d2); x = nx + (dx / d) * r; y = ny + (dy / d) * r; }
        else {
          const l = x - minX, rt = maxX - x, tp = y - minY, bt = maxY - y;
          const m = Math.min(l, rt, tp, bt);
          if (m === l) x = minX - r; else if (m === rt) x = maxX + r; else if (m === tp) y = minY - r; else y = maxY + r;
        }
      }
    }
  }
  return [x, y];
}
{
  const pu0 = Player.prototype.update;
  Player.prototype.update = function (dt, room) {
    pu0.call(this, dt, room);
    if (!this.flyer || this.dying > 0) return;
    this.flyT = (this.flyT || 0) + dt;
    const o = room.tileAt(this.x, this.y), over = !!(o && o.type === 'pit');
    this.overPit10 = over;
    this.hopH = Math.max(this.hopH, over ? 8 + Math.sin(this.flyT * 5) * 1.6 : 2.5 + Math.sin(this.flyT * 3.2) * 1);
  };
}
// double tap a direction to dash (Apploa, and anyone holding DASH!)
const TAP10 = { code: null, t: 0 };
{
  const ik0 = Input.onKey;
  Input.onKey = function (e, down) {
    if (down && !e.repeat && G.state === 'play' && ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
      const now = performance.now(), P = G.player;
      if (TAP10.code === e.code && now - TAP10.t < 260 && P && P.dash) { this.dashReq = true; TAP10.code = null; }
      else { TAP10.code = e.code; TAP10.t = now; }
    }
    return ik0.call(this, e, down);
  };
}

/* ------------------------------------------------------------------ drawing her */
{
  const da0 = drawApple;
  drawApple = function (c, R, st) {
    if (st && st.char === 'apploa') { c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; drawApploa10(c, R, st); c.restore(); return; }
    return da0(c, R, st);
  };
}
function drawApploa10(c, R, st) {
  const t = st.t || 0, fear = st.fear || 0;
  // a blonde ponytail behind the apple
  c.save(); c.translate(R * 0.55, -R * 0.55); c.rotate(0.5 + Math.sin(t * 3) * 0.08);
  c.fillStyle = '#a8803a'; ell(c, R * 0.3, R * 0.2, R * 0.28, R * 0.55, 0.3); c.fill();
  c.fillStyle = '#e8c870'; ell(c, R * 0.28, R * 0.12, R * 0.2, R * 0.46, 0.3); c.fill();
  c.restore();
  const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2);
  g.addColorStop(0, '#b0744a'); g.addColorStop(0.45, '#7a4426'); g.addColorStop(1, '#341a0c');
  applePath(c, R); c.fillStyle = g; c.fill();
  c.save(); applePath(c, R); c.clip();
  c.strokeStyle = 'rgba(255,200,150,0.12)'; c.lineWidth = R * 0.05;
  for (const x of [-0.55, -0.2, 0.3, 0.62]) { c.beginPath(); c.moveTo(x * R, -R * 0.7); c.quadraticCurveTo(x * R * 1.15, 0, x * R * 0.8, R * 0.85); c.stroke(); }
  c.restore();
  ell(c, -R * 0.48, -R * 0.38, R * 0.2, R * 0.12, -0.7); c.fillStyle = 'rgba(255,230,200,0.32)'; c.fill();
  applePath(c, R); c.strokeStyle = '#1a0c04'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
  if (st.bites && st.bites.length) {
    c.globalCompositeOperation = 'source-atop';
    for (const b of st.bites) { c.fillStyle = biteColor(t - b.t); biteShape(c, R, b.a, 1.38); c.fill(); }
    c.globalCompositeOperation = 'destination-out';
    for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); }
    c.globalCompositeOperation = 'source-over';
  }
  // the blonde fringe on top
  c.fillStyle = '#d8b050';
  c.beginPath(); c.moveTo(-R * 0.98, -R * 0.12); c.quadraticCurveTo(-R * 1.0, -R * 1.02, 0, -R * 0.86); c.quadraticCurveTo(R * 1.0, -R * 1.02, R * 0.98, -R * 0.12);
  c.quadraticCurveTo(R * 0.75, -R * 0.55, R * 0.4, -R * 0.5); c.quadraticCurveTo(R * 0.2, -R * 0.34, 0, -R * 0.48); c.quadraticCurveTo(-R * 0.35, -R * 0.3, -R * 0.55, -R * 0.52); c.quadraticCurveTo(-R * 0.8, -R * 0.45, -R * 0.98, -R * 0.12);
  c.closePath(); c.fill();
  c.strokeStyle = '#7a5a20'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke();
  c.strokeStyle = '#f6e2a0'; c.lineWidth = R * 0.05;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-R * (0.7 - i * 0.4), -R * 0.82); c.quadraticCurveTo(-R * (0.62 - i * 0.4), -R * 0.66, -R * (0.5 - i * 0.4), -R * 0.56); c.stroke(); }
  drawStem(c, R, st.leaf || 0, 0);
  if (st.face !== false) {
    const open = clamp(st.blink == null ? 1 : st.blink, 0.07, 1);
    const lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
    for (const s of [-1, 1]) {
      const x = s * R * 0.33 + lx * R * 0.05, y = -R * 0.06 + ly * R * 0.04;
      ell(c, x, y, R * 0.2, R * 0.24 * open); c.fillStyle = '#fff8ec'; c.fill();
      c.strokeStyle = '#1a0a04'; c.lineWidth = R * 0.055; c.stroke();
      if (open > 0.3) {
        const pr = R * (0.12 - fear * 0.04), px = x + lx * R * 0.075, py = y + ly * R * 0.09 * open;
        c.fillStyle = '#3a2210'; circle(c, px, py, pr * 1.25); c.fillStyle = '#0c0604'; circle(c, px, py, pr * 0.7);
        c.fillStyle = '#ffffff'; circle(c, px - pr * 0.4, py - pr * 0.45, pr * 0.4);
      }
      // lashes
      c.strokeStyle = '#1a0a04'; c.lineWidth = R * 0.04;
      c.beginPath(); c.moveTo(x + s * R * 0.16, y - R * 0.14 * open); c.lineTo(x + s * R * 0.26, y - R * 0.22 * open); c.stroke();
    }
    c.strokeStyle = '#c8a040'; c.lineWidth = R * 0.07; c.lineCap = 'round';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.5, -R * 0.33 + fear * R * 0.02); c.lineTo(s * R * 0.18, -R * 0.42 - fear * R * 0.05); c.stroke(); }
    c.fillStyle = 'rgba(220,110,90,0.28)'; for (const s of [-1, 1]) { ell(c, s * R * 0.5, R * 0.18, R * 0.13, R * 0.08); c.fill(); }
    if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.12, R * 0.15); c.fillStyle = '#1a0406'; c.fill(); }
    else {
      c.strokeStyle = '#2a0e06'; c.lineWidth = R * 0.07;
      c.beginPath(); c.moveTo(-R * 0.17, R * 0.36); c.quadraticCurveTo(0, R * 0.5, R * 0.17, R * 0.36); c.stroke();
    }
  }
  // the seagull wings: in the game they flap on their own, everywhere else they sit behind her
  if (!('chomp' in st)) {
    c.globalCompositeOperation = 'destination-over';
    drawGullWings10(c, R, Math.sin(t * 2) * 0.12, true);
    c.globalCompositeOperation = 'source-over';
  }
}
function drawGullWings10(c, R, flap, behind) {
  // a herring gull from above: long pale grey wings, black tips with white spots, a white trailing edge.
  // behind: drawn under what is already there, so the steps go in the other order
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * R * 0.74, R * 0.02); c.scale(side, 1); c.rotate(0.12 - flap);
    const L = R * 1.85;
    const wing = () => {
      c.beginPath();
      c.moveTo(0, -R * 0.26);
      c.bezierCurveTo(L * 0.3, -R * 0.62, L * 0.72, -R * 0.56, L, -R * 0.16);
      c.quadraticCurveTo(L * 0.92, R * 0.06, L * 0.8, R * 0.04);
      c.quadraticCurveTo(L * 0.72, R * 0.2, L * 0.6, R * 0.14);
      c.quadraticCurveTo(L * 0.5, R * 0.3, L * 0.38, R * 0.24);
      c.quadraticCurveTo(L * 0.24, R * 0.38, L * 0.1, R * 0.3);
      c.quadraticCurveTo(L * 0.04, R * 0.32, 0, R * 0.24);
      c.closePath();
    };
    const inside = (fn) => () => { c.save(); wing(); c.clip(); fn(); c.restore(); };
    const ops = [
      () => { wing(); c.fillStyle = '#c8ced6'; c.fill(); },
      inside(() => { c.fillStyle = '#aab2bc'; c.fillRect(L * 0.2, -R * 0.7, L * 0.5, R * 0.42); }),
      inside(() => { c.fillStyle = '#17171b'; c.beginPath(); c.moveTo(L * 0.66, -R); c.lineTo(L * 1.2, -R); c.lineTo(L * 1.2, R); c.lineTo(L * 0.74, R); c.closePath(); c.fill(); }),
      inside(() => { c.fillStyle = '#ffffff'; circle(c, L * 0.9, -R * 0.2, R * 0.075); circle(c, L * 0.8, -R * 0.08, R * 0.06); }),
      inside(() => { c.strokeStyle = '#f6f8fa'; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(L * 0.04, R * 0.3); c.quadraticCurveTo(L * 0.24, R * 0.38, L * 0.38, R * 0.24); c.quadraticCurveTo(L * 0.5, R * 0.3, L * 0.6, R * 0.14); c.stroke(); }),
      inside(() => { c.strokeStyle = 'rgba(80,88,100,0.45)'; c.lineWidth = R * 0.035; for (let i = 0; i < 5; i++) { const x = L * (0.18 + i * 0.13); c.beginPath(); c.moveTo(x, -R * 0.32 + i * R * 0.02); c.lineTo(x + L * 0.05, R * 0.2 - i * R * 0.03); c.stroke(); } }),
      () => { wing(); c.strokeStyle = '#2e333b'; c.lineWidth = Math.max(0.8, R * 0.06); c.stroke(); },
    ];
    if (behind) ops.reverse();
    for (const op of ops) op();
    c.restore();
  }
}
{
  const du0 = drawPlayerUnder3;
  drawPlayerUnder3 = function (c, P, t) {
    du0(c, P, t);
    if (P.char === 'apploa' && P.dying <= 0) {
      const lift = P.escaping > 0 ? P.escaping * 30 : P.hopH, sp = Math.hypot(P.vx, P.vy);
      const flap = Math.sin((P.flyT || 0) * (sp > 30 || P.overPit10 ? 15 : 5)) * (sp > 30 || P.overPit10 ? 0.5 : 0.2) + (P.overPit10 ? 0.2 : 0);
      c.save(); c.translate(P.x, P.y - lift + 1); drawGullWings10(c, P.R, flap); c.restore();
    }
    if (P.hidden10 >= 1) { c.fillStyle = 'rgba(60,140,60,0.5)'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 0.4; leafShape(c, P.x + Math.cos(a) * 12, P.y + 6 + Math.sin(a) * 5, 10, a); c.fill(); } }
  };
}

/* ------------------------------------------------------------------ the new helpers around the apple */
{
  const dpo0 = drawPlayerOver9;
  drawPlayerOver9 = function (c, P, t) {
    dpo0(c, P, t);
    const lift = P.escaping > 0 ? P.escaping * 30 : P.hopH;
    if (P.ass10) {
      const a = P.ass10;
      c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, a.x, a.y + 6, 3.4, 1.6); c.fill();
      seedShape(c, a.x, a.y - 2, 4.4, Math.atan2(P.aimY, P.aimX) - Math.PI / 2);
      c.fillStyle = '#5a2c18'; c.fill(); c.strokeStyle = '#ffb090'; c.lineWidth = 1.1; c.stroke();
    }
    if (P.fidget) {
      const f = P.fidget;
      c.save(); c.translate(f.x, f.y - 3); c.rotate(f.a * 3);
      for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; c.fillStyle = ['#3a9aff', '#ff3a5a', '#ffd23a'][i]; circle(c, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 2.6); }
      c.fillStyle = '#e8e8ee'; circle(c, 0, 0, 2); c.restore();
    }
    if (P.drone) {
      const d = P.drone;
      c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, d.x, d.y + 26, 6, 2); c.fill();
      c.save(); c.translate(d.x, d.y);
      c.fillStyle = '#2a2e36'; rrect(c, -4, -2.5, 8, 5, 1.5); c.fill();
      c.strokeStyle = '#2a2e36'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-7, -4); c.lineTo(7, 4); c.moveTo(7, -4); c.lineTo(-7, 4); c.stroke();
      c.fillStyle = 'rgba(200,210,230,0.55)'; for (const [x, y] of [[-7, -4], [7, -4], [-7, 4], [7, 4]]) { ell(c, x, y, 3.2 + Math.sin(t * 50) * 0.4, 1.2); c.fill(); }
      c.fillStyle = Math.sin(t * 6) > 0 ? '#ff3a3a' : '#3aff6a'; circle(c, 0, 0, 1);
      c.restore();
    }
    if (P.superM != null) {
      const f = P.superM;
      c.strokeStyle = P.superReady ? `rgba(255,216,74,${0.6 + 0.3 * Math.sin(t * 10)})` : 'rgba(255,216,74,0.35)'; c.lineWidth = 1.8;
      c.beginPath(); c.ellipse(P.x, P.y + 12, 18, 6.2, 0, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.stroke();
    }
    if (P.hypercOn > 0) { c.strokeStyle = `rgba(200,106,255,${0.5 + 0.3 * Math.sin(t * 14)})`; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y - lift - 1, P.R + 5, 0, TAU); c.stroke(); }
    if (P.inZone) { c.strokeStyle = 'rgba(124,208,255,0.55)'; c.lineWidth = 1.4; c.setLineDash([3, 4]); c.beginPath(); c.arc(P.x, P.y - lift - 1, P.R + 7, t * 2, t * 2 + TAU); c.stroke(); c.setLineDash([]); }
    if (P.reusT > 0) { c.strokeStyle = `rgba(255,90,40,${0.5 + 0.3 * Math.sin(t * 20)})`; c.lineWidth = 2.4; c.beginPath(); c.arc(P.x, P.y - lift - 1, P.R + 4 + Math.sin(t * 20) * 1.5, 0, TAU); c.stroke(); }
    if (P.koptelefoon) {
      c.strokeStyle = '#2a2a30'; c.lineWidth = 2.4; c.beginPath(); c.arc(P.x, P.y - lift - 3, P.R * 0.95, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      c.fillStyle = '#3a3a44'; for (const s of [-1, 1]) { ell(c, P.x + s * P.R * 0.95, P.y - lift - 2, 3, 4.2); c.fill(); }
    }
    if (P.neus) { c.fillStyle = '#e8203a'; circle(c, P.x + P.lookX * 2, P.y - lift + 3 + P.lookY, 2.6); c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, P.x + P.lookX * 2 - 0.8, P.y - lift + 2.2, 0.8); }
    if (P.helmUp) { c.fillStyle = '#3a8aff'; c.beginPath(); c.arc(P.x, P.y - lift - P.R * 0.7, P.R * 0.55, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(P.x - 4, P.y - lift - P.R * 0.7 - 5, 8, 1.4); }
    if (P.cubeN > 0) {
      const n = Math.min(6, P.cubeN);
      for (let i = 0; i < n; i++) { const x = P.x - (n - 1) * 2.5 + i * 5, y = P.y - lift - P.R - 8; c.fillStyle = '#1a6a1a'; c.fillRect(x - 1.8, y - 1.8, 3.6, 3.6); c.fillStyle = '#5ae85a'; c.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); }
    }
  };
}
function drawVac10(c, v, t) {
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, v.x + 1, v.y + 4, 9, 3.5); c.fill();
  c.save(); c.translate(v.x, v.y); c.rotate(v.a);
  c.fillStyle = '#2a2e36'; circle(c, 0, 0, 8); c.fillStyle = '#5a606c'; circle(c, 0, 0, 6.6);
  c.fillStyle = '#1a1c22'; c.fillRect(4, -3, 3, 6);
  c.fillStyle = Math.sin(t * 4) > 0 ? '#3aff8a' : '#2aa05a'; circle(c, -2, 0, 1.2);
  c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, 4.5, -2.4, -0.8); c.stroke();
  c.restore();
}
function drawGull10(c, x, y, s, flap) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#f4f6f8'; ell(c, 0, 0, 4, 2.2); c.fill();
  c.strokeStyle = '#9aa2ac'; c.lineWidth = 1.6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-1, 0); c.quadraticCurveTo(-5, -4 * flap - 1, -10, -1 * flap); c.moveTo(1, 0); c.quadraticCurveTo(5, -4 * flap - 1, 10, -1 * flap); c.stroke();
  c.strokeStyle = '#16161a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-8.4, -1.4 * flap); c.lineTo(-10, -1 * flap); c.moveTo(8.4, -1.4 * flap); c.lineTo(10, -1 * flap); c.stroke();
  c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(3.6, -0.6); c.lineTo(6, 0); c.lineTo(3.6, 0.8); c.closePath(); c.fill();
  c.restore();
}
function drawGulls10(c, P, t) {
  const m = P.meeuw, ph = m.ph || 0;
  for (let i = 0; i < m.birds.length; i++) {
    if (m.dive && i === 0) continue;
    const a = ph * 0.9 + m.birds[i], x = P.x + Math.cos(a) * 46, y = P.y - 54 + Math.sin(a) * 14;
    drawGull10(c, x, y, 0.9, Math.sin(t * 9 + i * 2));
  }
  if (m.dive && m.dive.tg) {
    const d = m.dive, u = clamp(d.t / 0.45, 0, 1), x = lerp(d.x0, d.tg.x, u), y = lerp(d.y0, d.tg.y, u) - Math.sin(u * Math.PI) * 20;
    drawGull10(c, x, y, 1.1, 0.2);
  }
}

