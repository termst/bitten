/* src/40-v10-draw-rooms.js: v10: drawing the rooms and their hazards. From v10. Lines 20465 to 20787 of the v13.7 script. */
/* =====================================================================
   Drawing the rooms and their hazards
   ===================================================================== */
function hqFloor10(c, room, rng) {
  const tint = room.hq10 ? room.hq10.tint : 0;
  const A = ['#d8ece6', '#d8e4f2', '#efe8d8'][tint], B = ['#c8e0d8', '#c8d6ea', '#e2dac8'][tint];
  c.fillStyle = '#9aaaa6'; c.fillRect(0, 0, RW, RH);
  for (let r = 0; r < ROWS * 2; r++) for (let col = 0; col < COLS * 2; col++) {
    c.fillStyle = (r + col) % 2 ? A : B; c.fillRect(col * T / 2 + 0.5, r * T / 2 + 0.5, T / 2 - 1, T / 2 - 1);
  }
  c.fillStyle = 'rgba(40,120,110,0.35)'; c.fillRect(0, RH / 2 - 3, RW, 6);
}
function hqDeco10(c, room, rng) {
  // confetti, pie, big shoe prints, and a rubber chicken
  for (let i = 0; i < 80; i++) { c.fillStyle = rgba(BALLOON_COLS10[Math.floor(rng() * BALLOON_COLS10.length)], 0.7); c.save(); c.translate(rng() * RW, rng() * RH); c.rotate(rng() * TAU); c.fillRect(-1.6, -0.8, 3.2, 1.6); c.restore(); }
  for (let i = 0; i < 3; i++) {
    const x = 40 + rng() * (RW - 80), y = 40 + rng() * (RH - 80);
    c.fillStyle = 'rgba(250,246,236,0.9)'; for (let k = 0; k < 7; k++) { const a = k * 0.9 + rng(); circle(c, x + Math.cos(a) * 7, y + Math.sin(a) * 5, 4 + rng() * 2); }
    c.fillStyle = 'rgba(232,140,180,0.8)'; circle(c, x + 1, y, 3);
  }
  let x = rng() * RW, y = RH - 10, a = -Math.PI / 2 + rng() * 0.8 - 0.4;
  for (let i = 0; i < 9; i++) {
    c.save(); c.translate(x + (i % 2 ? 8 : -8) * Math.cos(a + Math.PI / 2), y + (i % 2 ? 8 : -8) * Math.sin(a + Math.PI / 2)); c.rotate(a + Math.PI / 2);
    c.fillStyle = 'rgba(200,30,50,0.28)'; ell(c, 0, 0, 6, 11); c.fill(); c.restore();
    x += Math.cos(a) * 24; y += Math.sin(a) * 24; a += rng() * 0.4 - 0.2;
    if (x < 10 || x > RW - 10 || y < 10) break;
  }
  const cx = 40 + rng() * (RW - 80), cy = 40 + rng() * (RH - 80);
  c.save(); c.translate(cx, cy); c.rotate(rng() * TAU);
  c.fillStyle = '#f2d23a'; ell(c, 0, 0, 9, 4); c.fill(); c.fillStyle = '#e8a03a'; c.beginPath(); c.moveTo(9, -1); c.lineTo(13, 0); c.lineTo(9, 1.5); c.closePath(); c.fill();
  c.fillStyle = '#e83a3a'; ell(c, 6, -3, 2, 1.2); c.fill(); c.fillStyle = '#1a1a1a'; circle(c, 7, -0.8, 0.6);
  c.restore();
  // scribbles on the floor: HONK
  c.save(); c.translate(RW * (0.25 + rng() * 0.5), RH * (0.2 + rng() * 0.6)); c.rotate(rng() * 0.6 - 0.3);
  c.fillStyle = 'rgba(200,30,50,0.4)'; c.font = `800 22px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sayF9('HONK'), 0, 0);
  c.restore();
}
function hqWalls10(c, room, rng) {
  const H = room.hq10;
  if (!H) return;
  if (!room.doors.n) wallText9(c, 'CLINI-CLOWN HQ', RW / 2, -WALL / 2, 11, '#c8102a');
  else wallText9(c, 'CLINI-CLOWN', RW * 0.22, -WALL / 2, 9, '#c8102a');
  for (const p of H.posters) {
    c.save();
    if (p.side === 'n') c.translate(RW * p.u, -WALL / 2);
    else if (p.side === 's') c.translate(RW * p.u, RH + WALL / 2);
    else if (p.side === 'w') { c.translate(-WALL / 2, RH * p.u); c.rotate(-Math.PI / 2); }
    else { c.translate(RW + WALL / 2, RH * p.u); c.rotate(Math.PI / 2); }
    c.rotate((p.seed - 0.5) * 0.12);
    c.fillStyle = '#1a0a10'; c.fillRect(-25, -11, 50, 22);
    c.fillStyle = '#f2e8d0'; c.fillRect(-24, -10, 48, 20);
    drawScareFace10(c, -15, 0, 8, 1);
    c.fillStyle = '#c8102a'; c.font = `800 5.2px ${UIF}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    const words = sayF9(p.txt).split(' ');
    const lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > 11) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
    if (cur.trim()) lines.push(cur.trim());
    lines.slice(0, 3).forEach((ln, i) => c.fillText(ln, -5, (i - (Math.min(3, lines.length) - 1) / 2) * 6));
    c.restore();
  }
  // graffiti: a big painted smile on one wall
  c.strokeStyle = 'rgba(200,16,42,0.55)'; c.lineWidth = 2.2;
  c.beginPath(); c.arc(RW * 0.62, RH + WALL * 0.2, 9, 0.3, Math.PI - 0.3); c.stroke();
}
// a Killer-Clownsnake, face on: for posters and for the scare
function drawScareFace10(c, x, y, R, a) {
  c.save(); c.translate(x, y); c.globalAlpha *= a;
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#a8102a' : '#e8203a'; circle(c, s * R * (0.85 + i * 0.08), -R * 0.25 + i * R * 0.22, R * 0.36); }
  c.fillStyle = '#d8d0c4'; ell(c, 0, 0, R * 0.92, R); c.fill();
  c.fillStyle = '#1a0408';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.12, -R * 0.42); c.lineTo(s * R * 0.62, -R * 0.12); c.lineTo(s * R * 0.2, -R * 0.02); c.closePath(); c.fill(); }
  c.fillStyle = '#ffe14a'; for (const s of [-1, 1]) circle(c, s * R * 0.3, -R * 0.16, R * 0.08);
  c.fillStyle = '#c8102a'; circle(c, 0, R * 0.12, R * 0.17);
  c.fillStyle = '#3a040a'; c.beginPath(); c.moveTo(-R * 0.6, R * 0.32); c.quadraticCurveTo(0, R * 1.05, R * 0.6, R * 0.32); c.quadraticCurveTo(0, R * 0.58, -R * 0.6, R * 0.32); c.fill();
  c.fillStyle = '#f2ecd8'; for (let i = 0; i < 6; i++) { const u = -0.5 + i * 0.2, tx = u * R * 1.1; c.beginPath(); c.moveTo(tx - R * 0.07, R * 0.42 + Math.abs(u) * R * 0.1); c.lineTo(tx + R * 0.07, R * 0.42 + Math.abs(u) * R * 0.1); c.lineTo(tx, R * 0.62); c.closePath(); c.fill(); }
  c.restore();
}
function quietFloor10(c, room, rng) {
  c.fillStyle = '#2a2440'; c.fillRect(0, 0, RW, RH);
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) { c.fillStyle = (r + col) % 2 ? '#2e2846' : '#2c2644'; c.fillRect(col * T, r * T, T, T); }
}
function quietDeco10(c, room, rng) {
  c.fillStyle = 'rgba(200,184,255,0.12)'; ell(c, RW / 2, RH / 2, 130, 90); c.fill();
  c.strokeStyle = 'rgba(200,184,255,0.22)'; c.lineWidth = 2; ell(c, RW / 2, RH / 2, 120, 82); c.stroke();
  for (const [x, y, col] of [[RW * 0.2, RH * 0.25, '#8a7ac8'], [RW * 0.8, RH * 0.3, '#6a9ac8'], [RW * 0.22, RH * 0.75, '#c8a0c8'], [RW * 0.78, RH * 0.72, '#7ab8a8']]) {
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x + 2, y + 5, 15, 7); c.fill();
    c.fillStyle = col; rrect(c, x - 14, y - 9, 28, 16, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 9, y - 1); c.lineTo(x + 9, y - 1); c.stroke();
  }
  // a weighted blanket, folded, and a pair of big headphones
  c.fillStyle = '#5a4a8a'; rrect(c, RW * 0.6, RH * 0.12, 40, 18, 4); c.fill(); c.fillStyle = '#6a5a9a'; rrect(c, RW * 0.6, RH * 0.12, 40, 7, 3); c.fill();
  c.strokeStyle = '#2a2a30'; c.lineWidth = 3; c.beginPath(); c.arc(RW * 0.32, RH * 0.86, 9, Math.PI, TAU); c.stroke();
  c.fillStyle = '#3a3a44'; ell(c, RW * 0.32 - 9, RH * 0.86, 4, 5); c.fill(); ell(c, RW * 0.32 + 9, RH * 0.86, 4, 5); c.fill();
}
function quietWalls10(c, room) {
  if (!room.doors.n) wallText9(c, 'PRIKKELARM', RW / 2, -WALL / 2, 10, '#c8b8ff');
  c.fillStyle = 'rgba(200,184,255,0.25)';
  for (const x of [RW * 0.18, RW * 0.82]) { rrect(c, x - 16, RH + 6, 32, WALL - 12, 4); c.fill(); }
}
function drawBeanbag10(c, b, t) {
  const sq = b.rest > 0 ? 1 - Math.min(0.15, b.rest * 0.08) : 1;
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, b.x + 2, b.y + 9, 22, 9); c.fill();
  const g = c.createRadialGradient(b.x - 6, b.y - 6, 2, b.x, b.y, 24);
  g.addColorStop(0, b.used ? '#7a6a9a' : '#b8a0f0'); g.addColorStop(1, b.used ? '#3a3050' : '#5a4a9a');
  c.fillStyle = g; ell(c, b.x, b.y, 20, 15 * sq); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1; c.beginPath(); c.arc(b.x - 3, b.y - 2, 9, 3.6, 5.2); c.stroke();
  if (!b.used && b.rest > 0) { c.strokeStyle = 'rgba(200,184,255,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y, 26, -Math.PI / 2, -Math.PI / 2 + (b.rest / 2) * TAU); c.stroke(); }
}
function drawBushes10(c, room, t) {
  const B = room.bushes10; if (!B || !B.length) return;
  const P = G.player;
  for (const b of B) {
    const inside = P && dist(P.x, P.y, b.x, b.y) < 22;
    let hid = inside;
    if (!hid) for (const sn of room.snakes) if (sn.alive && sn.kind === 'bosje' && sn.mode === 'hide' && dist(sn.x, sn.y, b.x, b.y) < 18) { hid = true; break; }
    const sway = Math.sin(t * 2 + b.seed * 9) * 1.5 + (b.rustle > 0 ? Math.sin(t * 40) * 2 : 0);
    c.save(); c.globalAlpha = inside ? 0.45 : 0.96;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, b.x + 2, b.y + 10, 20, 7); c.fill();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + b.seed * 6, r = 10 + (i % 3) * 3;
      c.fillStyle = i % 2 ? '#3a8a3a' : '#4aa04a'; circle(c, b.x + Math.cos(a) * r * 0.8 + sway * 0.4, b.y + Math.sin(a) * r * 0.6 - 4, 9 + (i % 3));
    }
    c.fillStyle = '#5ab84a'; circle(c, b.x + sway * 0.5, b.y - 6, 10);
    c.fillStyle = 'rgba(255,255,255,0.12)'; circle(c, b.x - 3 + sway * 0.5, b.y - 9, 4);
    if (hid && !inside) { c.fillStyle = 'rgba(255,225,74,0.85)'; for (const s of [-1, 1]) circle(c, b.x + s * 3, b.y - 4, 1.1); }
    c.restore();
  }
}
function drawWarn10(c, w, t) {
  if (w.beam) {
    const u = clamp(w.t / w.warn, 0, 1), c0 = (w.pos + 0.5) * T, half = T * 0.5 * (w.w || 1);
    const on = w.t >= w.warn;
    c.fillStyle = on ? 'rgba(232,244,255,0.55)' : `rgba(122,208,255,${0.08 + 0.2 * u * (0.6 + 0.4 * Math.sin(t * 24))})`;
    if (w.horiz) c.fillRect(0, c0 - half, RW, half * 2); else c.fillRect(c0 - half, 0, half * 2, RH);
    return;
  }
  const u = clamp(w.t / w.warn, 0, 1);
  if (w.square) {
    c.fillStyle = rgba(w.col, 0.08 + 0.22 * u); rrect(c, w.x - T / 2 + 3, w.y - T / 2 + 3, T - 6, T - 6, 4); c.fill();
    c.strokeStyle = rgba(w.col, 0.35 + 0.5 * u * (0.6 + 0.4 * Math.sin(t * 30))); c.lineWidth = 1.5; rrect(c, w.x - T / 2 + 3, w.y - T / 2 + 3, T - 6, T - 6, 4); c.stroke();
    return;
  }
  c.strokeStyle = rgba(w.col, 0.3 + 0.5 * u); c.lineWidth = 1.6 + u * 1.6;
  c.setLineDash([6, 5]); c.beginPath(); c.arc(w.x, w.y, w.r, 0, TAU); c.stroke(); c.setLineDash([]);
  c.fillStyle = rgba(w.col, 0.06 + 0.18 * u); c.beginPath(); c.arc(w.x, w.y, w.r * u, 0, TAU); c.fill();
  if (w.clock) { c.fillStyle = '#ffd27a'; circle(c, w.x, w.y, 6); c.strokeStyle = '#3a2a10'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(w.x, w.y); c.lineTo(w.x + Math.cos(t * 12) * 4, w.y + Math.sin(t * 12) * 4); c.stroke(); }
}
function drawLob10(c, l, t) {
  const u = clamp(l.t / l.dur, 0, 1), x = lerp(l.x0, l.x1, u), y = lerp(l.y0, l.y1, u), z = Math.sin(u * Math.PI) * (l.kind === 'clock' ? 50 : 70);
  c.fillStyle = `rgba(0,0,0,${0.15 + 0.3 * u})`; ell(c, x, y + 4, 6 + 6 * u, 3 + 2 * u); c.fill();
  c.strokeStyle = `rgba(255,120,80,${0.2 + 0.4 * u})`; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.beginPath(); c.arc(l.x1, l.y1, (l.r || 30) * 0.9, 0, TAU); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(x, y - z); c.rotate(l.rot);
  if (l.kind === 'boulder') { c.fillStyle = '#2a1e14'; circle(c, 0, 0, 11); c.fillStyle = G.levelDef.rock || '#6a5a4a'; circle(c, -1, -1, 9.5); c.fillStyle = 'rgba(255,255,255,0.15)'; circle(c, -3, -3, 3); }
  else if (l.kind === 'nade') { c.fillStyle = '#2a3a1e'; ell(c, 0, 0, 6, 7.5); c.fill(); c.fillStyle = '#5a6a3a'; ell(c, -1, -1, 4.6, 6); c.fill(); c.fillStyle = '#8a8a7a'; c.fillRect(-2, -10, 4, 3); c.fillStyle = Math.sin(t * 30) > 0 ? '#ff5a3a' : '#ffd27a'; circle(c, 0, -11, 1.4); }
  else if (l.kind === 'clock') { c.fillStyle = '#e83a50'; circle(c, 0, 0, 8); c.fillStyle = '#f2f0ea'; circle(c, 0, 0, 6); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -4); c.moveTo(0, 0); c.lineTo(3, 0); c.stroke(); for (const s of [-1, 1]) { c.fillStyle = '#e83a50'; circle(c, s * 6, -7, 3); } }
  c.restore();
}
function drawAd10(c, a, t) {
  const pop = Math.min(1, a.t / 0.15), x = a.x + a.w / 2, y = a.y + a.h / 2;
  c.save(); c.translate(x, y); c.scale(pop, pop);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-a.w / 2 + 3, -a.h / 2 + 4, a.w, a.h);
  c.fillStyle = a.flash > 0 ? '#ffffff' : '#e8eaee'; c.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
  c.fillStyle = a.col; c.fillRect(-a.w / 2, -a.h / 2, a.w, 9);
  c.fillStyle = '#ffffff'; c.font = `800 6px ${UIF}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('POP-UP', -a.w / 2 + 3, -a.h / 2 + 4.8);
  c.fillStyle = '#c8102a'; c.fillRect(a.w / 2 - 9, -a.h / 2 + 1, 8, 7); c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(a.w / 2 - 7.5, -a.h / 2 + 2.5); c.lineTo(a.w / 2 - 2.5, -a.h / 2 + 6.5); c.moveTo(a.w / 2 - 2.5, -a.h / 2 + 2.5); c.lineTo(a.w / 2 - 7.5, -a.h / 2 + 6.5); c.stroke();
  const blink = Math.sin(t * 12 + a.x) > 0;
  c.fillStyle = blink ? '#c8102a' : '#1a1a2a'; c.font = `800 12px ${UIF}`; c.textAlign = 'center'; c.fillText(sayF9(a.txt), 0, 5);
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1; c.strokeRect(-a.w / 2, -a.h / 2, a.w, a.h);
  for (let i = 0; i < a.hp; i++) { c.fillStyle = '#3a8aff'; c.fillRect(-a.w / 2 + 3 + i * 6, a.h / 2 - 5, 4, 2.5); }
  c.restore();
}
function drawDraisine10(c, k, t) {
  const y = (k.row + 0.5) * T;
  c.save(); c.translate(k.x, y); if (k.dir < 0) c.scale(-1, 1);
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-26, 6, 52, 8);
  c.fillStyle = '#2a2a26'; c.fillRect(-26, -12, 52, 22);
  c.fillStyle = '#6a5a3a'; c.fillRect(-24, -10, 48, 14);
  c.fillStyle = '#1a1a16'; for (const x of [-16, 16]) { circle(c, x, 9, 6); c.fillStyle = '#5a5a56'; circle(c, x, 9, 3); c.fillStyle = '#1a1a16'; }
  c.fillStyle = '#3a3a34'; c.fillRect(-4, -20, 8, 10); c.fillRect(-14, -22, 28, 3);
  c.fillStyle = '#fff6d8'; circle(c, 25, -2, 3);
  c.restore();
}
function drawRailWarn10(c, k, t) {
  const y = (k.row + 0.5) * T, u = clamp(k.t / k.warn, 0, 1);
  c.fillStyle = `rgba(255,80,60,${0.1 + 0.25 * u * (0.6 + 0.4 * Math.sin(t * 22))})`; c.fillRect(0, y - 16, RW, 32);
  c.fillStyle = `rgba(255,240,200,${0.3 + 0.5 * u})`; c.font = `800 13px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < 4; i++) { c.save(); c.translate(RW * (i + 0.5) / 4, y); if (k.dir < 0) c.scale(-1, 1); c.fillText('>>', 0, 0); c.restore(); }
}
function drawZone10(c, z, t) {
  const a = Math.min(1, z.t / 0.4) * Math.min(1, (z.life - z.t) / 0.8);
  const gas = z.kind === 'gas';
  for (let i = 0; i < 8; i++) {
    const ang = i * 0.8 + t * (gas ? 0.4 : 0.6) + z.x * 0.01, r = z.r * (0.4 + (i % 3) * 0.16);
    c.fillStyle = gas ? `rgba(140,190,80,${0.13 * a})` : `rgba(170,170,180,${0.2 * a})`;
    circle(c, z.x + Math.cos(ang) * r * 0.6, z.y + Math.sin(ang) * r * 0.45, r * 0.7);
  }
}
function drawGas10(c, room, t) {
  const g = room.gas10; if (!g || g.ix <= 0.5) return;
  c.save();
  c.beginPath(); c.rect(0, 0, RW, RH); c.rect(g.ix, g.iy, RW - g.ix * 2, RH - g.iy * 2); c.clip('evenodd');
  c.fillStyle = 'rgba(90,170,70,0.32)'; c.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 26; i++) { const x = (i * 97 + t * 14) % RW, y = (i * 53 + Math.sin(t + i) * 20 + RH) % RH; c.fillStyle = 'rgba(160,220,110,0.12)'; circle(c, x, y, 18 + (i % 4) * 6); }
  c.restore();
  c.strokeStyle = `rgba(160,240,110,${0.5 + 0.2 * Math.sin(t * 6)})`; c.lineWidth = 2; c.setLineDash([8, 6]);
  c.strokeRect(g.ix, g.iy, RW - g.ix * 2, RH - g.iy * 2); c.setLineDash([]);
}
function drawJaudeNpc10(c, room, t) {
  const J = room.jaude10;
  if (!J || J.phase === 'done' || J.phase === 'fight') return;
  const P = G.player, bob = J.step ? Math.abs(Math.sin(J.step)) * 3 : 0;
  const stomp = J.phase === 'sorry' ? Math.abs(Math.sin(G.t * 9)) * 5 : 0;
  drawJaude10(c, J.x, J.y - bob - stomp, 15, { mad: 1, yell: J.phase === 'sorry' || J.sayT > 0.3, look: Math.sign(P.x - J.x) });
}
function drawPlates10(c, J, t) {
  for (const pl of J.plates) {
    const f = pl.kind === 'fight';
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, pl.x + 1, pl.y + 3, 19, 8); c.fill();
    c.fillStyle = f ? '#a82a3a' : '#5a7aa8'; ell(c, pl.x, pl.y, 18, 8); c.fill();
    c.strokeStyle = `rgba(255,240,220,${0.4 + 0.3 * Math.sin(t * 3)})`; c.lineWidth = 1.4; ell(c, pl.x, pl.y, 18, 8); c.stroke();
    c.fillStyle = '#ffffff'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sayF9(f ? 'FIGHT HER' : 'SAY SORRY'), pl.x, pl.y + 0.5);
  }
}
function drawSpeech10(c, x, y, txt) {
  txt = sayF9(txt);
  c.font = `700 10px ${UIF}`;
  const w = c.measureText(txt).width + 14, h = 18, bx = clamp(x - w / 2, 4, RW - w - 4), by = Math.max(4, y - h);
  c.fillStyle = 'rgba(250,246,240,0.96)'; rrect(c, bx, by, w, h, 6); c.fill();
  c.beginPath(); c.moveTo(clamp(x - 4, bx + 6, bx + w - 10), by + h); c.lineTo(clamp(x + 4, bx + 10, bx + w - 6), by + h); c.lineTo(clamp(x, bx + 8, bx + w - 8), by + h + 6); c.closePath(); c.fill();
  c.fillStyle = '#2a1a20'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, bx + w / 2, by + h / 2 + 0.5);
}
function drawFlip10(c, room, t) {
  const F = room.hqFlip10; if (!F) return;
  const spin = F.t < 1.4, s = spin ? Math.cos(F.t * 26) : 1, y = F.y - Math.sin(Math.min(1, F.t / 1.4) * Math.PI) * 40;
  c.save(); c.translate(F.x, y); c.scale(Math.max(0.08, Math.abs(s)), 1);
  c.fillStyle = '#6a4a00'; circle(c, 0, 0, 15); c.fillStyle = '#ffd23a'; circle(c, 0, 0, 13);
  if (!spin || s > 0) { drawScareFace10(c, 0, 1, 8, 1); } else { c.fillStyle = '#c8102a'; circle(c, 0, 0, 5); }
  c.restore();
  if (!spin) txt10(c, F.good ? 'TADA' : 'HAHA', F.x, F.y - 34, 16, F.good ? '#ffd23a' : '#ff5a7a');
}
function drawScare10(c) {
  const S = G.scare10; if (!S) return;
  const u = S.t / S.dur, a = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85;
  const W = View.W, H = View.H;
  c.save();
  c.fillStyle = `rgba(120,0,16,${0.45 * a})`; c.fillRect(0, 0, W, H);
  const R = Math.min(W, H) * (0.22 + 0.1 * (1 - a)) * (REDUCED ? 0.7 : 1);
  drawScareFace10(c, W / 2, H / 2, R, Math.max(0, a) * (REDUCED ? 0.6 : 0.92));
  c.restore();
}
{
  const df0 = drawFloorThings;
  drawFloorThings = function (c, room, t) {
    df0(c, room, t);
    const F = room.fx10;
    if (F) { for (const w of F.warns) drawWarn10(c, w, t); for (const k of F.carts) if (k.x == null) drawRailWarn10(c, k, t); }
    for (const b of room.beanbags10 || []) drawBeanbag10(c, b, t);
    if (room.jaude10 && room.jaude10.plates) drawPlates10(c, room.jaude10, t);
    const P = G.player;
    if (P && P.vac) drawVac10(c, P.vac, t);
  };
  const dv0 = drawVenomBodies;
  drawVenomBodies = function (c, t) {
    dv0(c, t);
    const room = G.room; if (!room) return;
    drawBushes10(c, room, t);
    const F = room.fx10;
    if (F) {
      for (const z of F.zones) drawZone10(c, z, t);
      for (const b of F.balloons) drawBalloon10(c, b, t, false);
      for (const b of F.pballs) drawBalloon10(c, b, t, true);
      for (const l of F.lobs) drawLob10(c, l, t);
      for (const a of F.ads) drawAd10(c, a, t);
      for (const k of F.carts) if (k.x != null) drawDraisine10(c, k, t);
    }
    if (room.gas10) drawGas10(c, room, t);
    drawJaudeNpc10(c, room, t);
    if (room.hqFlip10) drawFlip10(c, room, t);
    const P = G.player;
    if (P && P.meeuw) drawGulls10(c, P, t);
  };
  const dg0 = drawGlow3;
  drawGlow3 = function (c, room, t) {
    dg0(c, room, t);
    c.globalCompositeOperation = 'lighter';
    const F = room.fx10;
    if (F) {
      for (const w of F.warns) if (w.beam && w.t >= w.warn) { const c0 = (w.pos + 0.5) * T; for (let k = 0.1; k < 1; k += 0.2) glowDot(c, w.horiz ? RW * k : c0, w.horiz ? c0 : RH * k, 40, '#e8f4ff', 0.3); }
      else if (w.col === '#7ad0ff') glowDot(c, w.x, w.y, 24, '#7ad0ff', 0.25 * (w.t / w.warn));
      for (const a of F.ads) glowDot(c, a.x + a.w / 2, a.y + a.h / 2, 46, a.col, 0.18);
      for (const b of F.pballs) glowDot(c, b.x, b.y, 18, '#fff2b0', 0.25);
    }
    if (!room.lightsOut10) for (const o of room.lamps10 || []) glowDot(c, o.x, o.y - 14, 26, '#fff0c0', 0.35);
    for (const p of room.pickups) if (p.kind === 'cube10') glowDot(c, p.x, p.y - 4, 20, '#5ae85a', 0.35 + 0.1 * Math.sin(t * 5 + p.ph));
    c.globalCompositeOperation = 'source-over';
    const J = room.jaude10;
    if (J && J.phase !== 'done' && J.sayT > 0 && J.say) drawSpeech10(c, J.x, J.y - 30, J.say);
  };
  const rr0 = renderRoom;
  renderRoom = function (c, L) {
    rr0(c, L);
    if (G.scare10) { c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0); drawScare10(c); }
  };
}
DRAWPICK9.tulip10 = (c, p, t) => {
  const grow = Math.min(1, p.t / 0.4), a = p.life && p.t > p.life - 3 ? 0.5 + 0.5 * Math.sin(t * 20) : 1;
  c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.scale(grow, grow);
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 1, 6, 6, 2.4); c.fill();
  c.strokeStyle = '#3a8a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 6); c.lineTo(0, -4); c.stroke();
  leafShape(c, 0, 3, 7, -0.6); c.fillStyle = '#4aa04a'; c.fill();
  c.fillStyle = p.col; c.beginPath(); c.moveTo(-5, -6); c.lineTo(-5, -12); c.lineTo(-2.5, -9); c.lineTo(0, -13); c.lineTo(2.5, -9); c.lineTo(5, -12); c.lineTo(5, -6); c.quadraticCurveTo(0, -2, -5, -6); c.fill();
  c.restore();
};
DRAWPICK9.cube10 = (c, p, t) => {
  const bob = Math.sin(t * 4 + p.ph) * 1.5, a = p.life && p.t > p.life - 3 ? 0.5 + 0.5 * Math.sin(t * 20) : 1;
  c.save(); c.globalAlpha = a; c.translate(p.x, p.y - 2 + bob);
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 1, 8 - bob, 6, 2.4); c.fill();
  c.fillStyle = '#1a6a1a'; c.beginPath(); c.moveTo(0, -7); c.lineTo(6.5, -3.5); c.lineTo(6.5, 3.5); c.lineTo(0, 7); c.lineTo(-6.5, 3.5); c.lineTo(-6.5, -3.5); c.closePath(); c.fill();
  c.fillStyle = '#5ae85a'; c.beginPath(); c.moveTo(0, -7); c.lineTo(6.5, -3.5); c.lineTo(0, 0); c.lineTo(-6.5, -3.5); c.closePath(); c.fill();
  c.fillStyle = '#3ac83a'; c.beginPath(); c.moveTo(-6.5, -3.5); c.lineTo(0, 0); c.lineTo(0, 7); c.lineTo(-6.5, 3.5); c.closePath(); c.fill();
  c.restore();
};

