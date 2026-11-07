/* src/27-v9-story2-cast.js: v9: the second story cast and scenes. From v9. Lines 14917 to 15337 of the v13.7 script. */
/* =====================================================================
   Version 9: the second story's cast and scenes. Original cartoons.
   Alesen: puffer jacket, scarf, a plan for everything.
   Senale: red hoodie, fresh fade, a tuft of hair that might be white.
   ===================================================================== */
const OUT9 = '#1d1612';
const SKIN_A = '#f1c9a5', SKIN_S = '#e2b28c', SKIN_P = '#eac2a0', SKIN_J = '#d9a98a';
const UIF = '"Barlow Condensed", "Arial Narrow", sans-serif';

/* ------------------------------------------------------------------ faces */
function eyes9(c, face, blink, look, col) {
  const open = blink ? 0.08 : face === 'whisper' ? 0.45 : face === 'angry' ? 0.75 : 1;
  for (const s of [-1, 1]) {
    const x = s * 17 + (look || 0) * 2, y = -6;
    if (face === 'proud' && !blink) {
      c.strokeStyle = OUT9; c.lineWidth = 3; c.beginPath(); c.arc(x, y + 3, 6.5, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      continue;
    }
    ell(c, x, y, 7.5, 8.5 * open); c.fillStyle = '#fbf6ee'; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
    if (open > 0.3) { c.fillStyle = col || '#2a1a10'; circle(c, x + (look || 0) * 2.2, y + 1, 3.8); c.fillStyle = '#ffffff'; circle(c, x + (look || 0) * 2.2 - 1.3, y - 0.6, 1.3); }
  }
}
function brows9(c, face, col) {
  c.strokeStyle = col; c.lineWidth = 4.2; c.lineCap = 'round';
  for (const s of [-1, 1]) {
    c.beginPath();
    if (face === 'angry' || face === 'shout') { c.moveTo(s * 26, -22); c.lineTo(s * 9, -15); }
    else if (face === 'cry' || face === 'sad') { c.moveTo(s * 26, -16); c.lineTo(s * 9, -23); }
    else if (face === 'whisper') { c.moveTo(s * 26, -18); c.lineTo(s * 9, -17); }
    else if (face === 'proud') { c.moveTo(s * 26, -24); c.quadraticCurveTo(s * 17, -29, s * 9, -24); }
    else { c.moveTo(s * 26, -20); c.quadraticCurveTo(s * 17, -24, s * 9, -20); }
    c.stroke();
  }
}
function mouth9(c, face, talk, t) {
  const o = talk ? 0.5 + 0.5 * Math.abs(Math.sin(t * 18)) : 0;
  c.strokeStyle = OUT9; c.lineWidth = 3; c.lineCap = 'round';
  if (face === 'shout' || (face === 'angry' && talk)) {
    ell(c, 0, 22, 11, 7 + o * 5); c.fillStyle = '#3a0c10'; c.fill(); c.stroke();
    c.fillStyle = '#f4ecdc'; c.fillRect(-7, 16 - o * 2, 14, 3);
  } else if (talk) {
    ell(c, 0, 21, 8, 3 + o * 5); c.fillStyle = '#3a0c10'; c.fill(); c.stroke();
  } else if (face === 'proud') {
    c.beginPath(); c.moveTo(-12, 18); c.quadraticCurveTo(2, 28, 14, 15); c.stroke();
  } else if (face === 'cry' || face === 'sad') {
    c.beginPath(); c.moveTo(-10, 25); c.quadraticCurveTo(0, 17, 10, 25); c.stroke();
  } else if (face === 'angry') {
    c.beginPath(); c.moveTo(-10, 22); c.lineTo(10, 20); c.stroke();
  } else if (face === 'whisper') {
    c.beginPath(); c.moveTo(-6, 21); c.quadraticCurveTo(0, 18, 6, 21); c.stroke();
  } else {
    c.beginPath(); c.moveTo(-9, 20); c.quadraticCurveTo(0, 24, 9, 20); c.stroke();
  }
}
function tears9(c, t) {
  c.fillStyle = 'rgba(140,200,255,0.85)';
  for (const s of [-1, 1]) { const d = (t * 1.3 + (s > 0 ? 0.5 : 0)) % 1; ell(c, s * 19, 2 + d * 26, 2.6, 4); c.fill(); }
}

/* ------------------------------------------------------------------ Alesen */
function drawAlesenHead(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  // hair at the back
  c.fillStyle = '#3a2416'; ell(c, 0, -14, 44, 42); c.fill();
  for (const s of [-1, 1]) { ell(c, s * 41, 4, 9, 12); c.fillStyle = SKIN_A; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.6; c.stroke(); }
  ell(c, 0, 4, 40, 44); c.fillStyle = SKIN_A; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  // the swoop and the cowlick he never fixes
  c.fillStyle = '#3a2416';
  c.beginPath(); c.moveTo(-42, -8); c.quadraticCurveTo(-46, -46, -6, -50); c.quadraticCurveTo(34, -54, 44, -16);
  c.quadraticCurveTo(30, -30, 8, -28); c.quadraticCurveTo(-18, -34, -28, -16); c.quadraticCurveTo(-34, -12, -42, -8); c.closePath(); c.fill();
  c.strokeStyle = OUT9; c.lineWidth = 2.6; c.stroke();
  c.beginPath(); c.moveTo(4, -50); c.quadraticCurveTo(10, -66, 22, -62); c.quadraticCurveTo(12, -60, 12, -50); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,220,180,0.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -42); c.quadraticCurveTo(0, -46, 22, -40); c.stroke();
  brows9(c, face, '#2a180c');
  eyes9(c, face === 'cry' ? 'sad' : face, opt.blink, opt.look, '#3a5a2a');
  c.fillStyle = 'rgba(220,120,110,0.35)'; ell(c, -24, 12, 7, 4); c.fill(); ell(c, 24, 12, 7, 4); c.fill();
  c.strokeStyle = OUT9; c.lineWidth = 2.4; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(6, 9, 0, 11); c.stroke();
  mouth9(c, face, opt.talk, t);
  if (face === 'cry') tears9(c, t);
  if (face === 'whisper') { c.fillStyle = 'rgba(255,255,255,0.75)'; c.font = `700 14px ${UIF}`; c.textAlign = 'left'; c.fillText('psst', 30, -34); }
  c.restore();
}
function drawAlesen(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  // the green puffer jacket
  c.beginPath(); c.moveTo(-54, -8); c.bezierCurveTo(-96, 0, -118, 22, -124, 64); c.lineTo(-132, 230); c.lineTo(132, 230); c.lineTo(124, 64); c.bezierCurveTo(118, 22, 96, 0, 54, -8); c.closePath();
  const g = c.createLinearGradient(0, -8, 0, 230); g.addColorStop(0, '#3f7350'); g.addColorStop(1, '#244a33');
  c.fillStyle = g; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3.2; c.stroke();
  c.strokeStyle = 'rgba(10,30,18,0.55)'; c.lineWidth = 2.4;
  for (let y = 40; y < 230; y += 34) { c.beginPath(); c.moveTo(-122, y); c.quadraticCurveTo(0, y + 10, 122, y); c.stroke(); }
  c.strokeStyle = '#c9c4b8'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 230); c.stroke();
  // the scarf
  c.fillStyle = '#d8a03a';
  c.beginPath(); c.moveTo(-44, -12); c.quadraticCurveTo(0, 18, 44, -12); c.lineTo(46, 6); c.quadraticCurveTo(0, 36, -46, 6); c.closePath(); c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.6; c.stroke();
  c.beginPath(); c.moveTo(18, 14); c.lineTo(30, 96); c.lineTo(52, 92); c.lineTo(40, 10); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(120,70,10,0.5)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-36 + i * 22, -2 + (i % 2) * 4); c.lineTo(-30 + i * 22, 14); c.stroke(); }
  c.fillStyle = SKIN_A; c.fillRect(-16, -38, 32, 30);
  if (opt.phone) {
    c.save(); c.translate(opt.phone === 'flash' ? 70 : 74, 120); c.rotate(-0.25);
    rrect(c, -18, -30, 36, 60, 6); c.fillStyle = '#16181c'; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2; c.stroke();
    rrect(c, -14, -25, 28, 46, 3); c.fillStyle = opt.phone === 'flash' ? '#ffffff' : '#7fb0ff'; c.fill();
    c.restore();
    c.fillStyle = SKIN_A; ell(c, 66, 140, 16, 13); c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
  }
  c.restore();
  c.save(); c.translate(0, -78 * S);
  drawAlesenHead(c, S, face, t, opt);
  c.restore();
}

/* ------------------------------------------------------------------ Senale */
function drawSenaleHead(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  for (const s of [-1, 1]) { ell(c, s * 39, 6, 8, 11); c.fillStyle = SKIN_S; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.6; c.stroke(); }
  // white earbuds
  for (const s of [-1, 1]) { c.fillStyle = '#f4f4f0'; circle(c, s * 39, 10, 4.2); c.strokeStyle = '#9a9a96'; c.lineWidth = 1.2; c.stroke(); }
  rrect(c, -38, -36, 76, 86, 30); c.fillStyle = SKIN_S; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  // a skin fade on the sides, a tuft on top that is either blond or white
  c.fillStyle = 'rgba(40,24,14,0.45)';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 38, -8); c.quadraticCurveTo(s * 40, -30, s * 26, -36); c.lineTo(s * 24, -18); c.closePath(); c.fill(); }
  c.fillStyle = '#2a1a10';
  c.beginPath(); c.moveTo(-30, -26); c.quadraticCurveTo(-26, -46, 0, -48); c.quadraticCurveTo(26, -46, 30, -26); c.quadraticCurveTo(0, -36, -30, -26); c.closePath(); c.fill();
  c.fillStyle = '#f2ecd8';
  c.beginPath(); c.moveTo(-18, -40); c.quadraticCurveTo(-14, -66, 4, -60); c.quadraticCurveTo(10, -72, 22, -58); c.quadraticCurveTo(26, -46, 16, -40); c.quadraticCurveTo(0, -46, -18, -40); c.closePath(); c.fill();
  c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
  c.strokeStyle = 'rgba(200,190,160,0.8)'; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-10 + i * 7, -44); c.quadraticCurveTo(-8 + i * 7, -56, -2 + i * 7, -60); c.stroke(); }
  brows9(c, face, '#1e120a');
  eyes9(c, face, opt.blink, opt.look, '#3a2414');
  c.strokeStyle = OUT9; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -2); c.lineTo(-3, 9); c.lineTo(3, 10); c.stroke();
  mouth9(c, face === 'proud' ? 'proud' : face, opt.talk, t);
  if (face === 'sad') { c.fillStyle = 'rgba(140,200,255,0.7)'; ell(c, -20, 8 + ((t * 0.8) % 1) * 14, 2.2, 3.4); c.fill(); }
  c.restore();
}
function drawSenale(c, S, face, t, opt = {}) {
  c.save(); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-50, -8); c.bezierCurveTo(-90, 0, -112, 22, -118, 64); c.lineTo(-126, 230); c.lineTo(126, 230); c.lineTo(118, 64); c.bezierCurveTo(112, 22, 90, 0, 50, -8); c.closePath();
  const g = c.createLinearGradient(0, -8, 0, 230); g.addColorStop(0, '#c43038'); g.addColorStop(1, '#8a1a22');
  c.fillStyle = g; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3.2; c.stroke();
  // the hood around the neck, the strings, the pocket
  c.fillStyle = '#9a2028'; c.beginPath(); c.moveTo(-52, -10); c.quadraticCurveTo(0, 36, 52, -10); c.lineTo(58, 8); c.quadraticCurveTo(0, 56, -58, 8); c.closePath(); c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
  c.strokeStyle = '#f2ecd8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 26); c.lineTo(-18, 76); c.moveTo(14, 26); c.lineTo(18, 78); c.stroke();
  c.strokeStyle = 'rgba(60,8,12,0.6)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-60, 150); c.quadraticCurveTo(0, 140, 60, 150); c.lineTo(52, 196); c.lineTo(-52, 196); c.closePath(); c.stroke();
  c.fillStyle = SKIN_S; c.fillRect(-15, -34, 30, 28);
  if (opt.phone) {
    c.save(); c.translate(-70, 118); c.rotate(0.22);
    rrect(c, -18, -30, 36, 60, 6); c.fillStyle = '#16181c'; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2; c.stroke();
    rrect(c, -14, -25, 28, 46, 3); c.fillStyle = '#20242a'; c.fill();
    c.strokeStyle = '#ff5a4a'; c.lineWidth = 2; c.strokeRect(-9, -8, 16, 9); c.fillStyle = '#ff5a4a'; c.fillRect(-8, -7, 2.5, 7); c.fillRect(7, -5.5, 2, 4);
    c.fillStyle = '#ff8a7a'; c.font = `700 9px ${UIF}`; c.textAlign = 'center'; c.fillText('8%', 0, 14);
    c.restore();
    c.fillStyle = SKIN_S; ell(c, -64, 140, 15, 12); c.fill(); c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
  }
  c.restore();
  c.save(); c.translate(0, -80 * S);
  drawSenaleHead(c, S, face, t, opt);
  c.restore();
}

/* ------------------------------------------------------------------ the parents, the judge, the DJ before midnight */
function drawParent9(c, x, y, S, mom, talk, t) {
  c.save(); c.translate(x, y); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-40, 0); c.bezierCurveTo(-74, 6, -88, 30, -92, 70); c.lineTo(92, 70); c.bezierCurveTo(88, 30, 74, 6, 40, 0); c.closePath();
  c.fillStyle = mom ? '#6a4a7a' : '#4a5a6a'; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  if (!mom) { c.strokeStyle = '#c9b48a'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, 18 + i * 12, 3, 0, TAU); c.stroke(); } }
  c.fillStyle = SKIN_P; c.fillRect(-12, -24, 24, 26);
  c.translate(0, -50);
  rrect(c, -32, -34, 64, 70, 26); c.fillStyle = SKIN_P; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  if (mom) {
    c.fillStyle = '#7a5a3a'; ell(c, 0, -30, 32, 14); c.fill(); circle(c, 0, -46, 12); c.strokeStyle = OUT9; c.lineWidth = 2.4; c.stroke();
    for (const s of [-1, 1]) { c.strokeStyle = '#2a2a30'; c.lineWidth = 2.4; c.beginPath(); c.arc(s * 13, -4, 9, 0, TAU); c.stroke(); }
    c.beginPath(); c.moveTo(-4, -4); c.lineTo(4, -4); c.stroke();
  } else {
    c.fillStyle = '#9a9a9a'; c.beginPath(); c.moveTo(-32, -10); c.quadraticCurveTo(-30, -38, 0, -36); c.quadraticCurveTo(30, -38, 32, -10); c.quadraticCurveTo(20, -28, 0, -26); c.quadraticCurveTo(-20, -28, -32, -10); c.fill();
    c.fillStyle = '#5a4a3a'; c.beginPath(); c.moveTo(-16, 12); c.quadraticCurveTo(0, 6, 16, 12); c.quadraticCurveTo(0, 18, -16, 12); c.fill();
  }
  c.fillStyle = OUT9; circle(c, -13, -4, 3); circle(c, 13, -4, 3);
  c.strokeStyle = OUT9; c.lineWidth = 2.6; c.beginPath();
  if (talk) { ell(c, 0, 20, 6, 2 + Math.abs(Math.sin(t * 16)) * 4); c.fillStyle = '#3a0c10'; c.fill(); } else { c.moveTo(-8, 20); c.lineTo(8, 20); c.stroke(); }
  c.restore();
}
function drawJudge9(c, x, y, S, t) {
  c.save(); c.translate(x, y); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-46, 0); c.bezierCurveTo(-84, 6, -100, 30, -104, 70); c.lineTo(104, 70); c.bezierCurveTo(100, 30, 84, 6, 46, 0); c.closePath();
  c.fillStyle = '#16161c'; c.fill(); c.strokeStyle = '#000'; c.lineWidth = 3; c.stroke();
  // the white bef
  c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(-10, 2); c.lineTo(10, 2); c.lineTo(8, 34); c.lineTo(0, 30); c.lineTo(-8, 34); c.closePath(); c.fill(); c.strokeStyle = '#8a8a8a'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = SKIN_J; c.fillRect(-12, -24, 24, 26);
  c.translate(0, -52);
  rrect(c, -34, -36, 68, 74, 28); c.fillStyle = SKIN_J; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#e8e4dc'; for (const s of [-1, 1]) { ell(c, s * 30, -10, 10, 18); c.fill(); }
  c.strokeStyle = '#2a2a30'; c.lineWidth = 2.4; for (const s of [-1, 1]) { rrect(c, s * 14 - 9, -10, 18, 12, 3); c.stroke(); } c.beginPath(); c.moveTo(-5, -4); c.lineTo(5, -4); c.stroke();
  c.fillStyle = OUT9; circle(c, -14, -4, 2.6); circle(c, 14, -4, 2.6);
  c.strokeStyle = OUT9; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, -20); c.lineTo(-6, -15); c.moveTo(24, -20); c.lineTo(6, -15); c.stroke();
  c.beginPath(); c.moveTo(-10, 22); c.quadraticCurveTo(0, 17, 10, 22); c.stroke();
  c.restore();
}
function drawDJHuman9(c, x, y, S, t) {
  c.save(); c.translate(x, y); c.scale(S, S); c.lineJoin = 'round'; c.lineCap = 'round';
  const bob = Math.sin(t * 9.3) * 3;
  c.translate(0, bob);
  c.beginPath(); c.moveTo(-60, 0); c.bezierCurveTo(-120, 10, -140, 50, -146, 90); c.lineTo(146, 90); c.bezierCurveTo(140, 50, 120, 10, 60, 0); c.closePath();
  c.fillStyle = '#2a1a3a'; c.fill(); c.strokeStyle = '#000'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#ff3ad8'; c.font = `800 22px ${UIF}`; c.textAlign = 'center'; c.fillText('MANU-BEAU', 0, 50);
  c.strokeStyle = '#f2c230'; c.lineWidth = 5; c.beginPath(); c.arc(0, 4, 30, 0.2, Math.PI - 0.2); c.stroke();
  c.fillStyle = '#e8a890'; c.fillRect(-18, -24, 36, 26);
  c.translate(0, -58);
  ell(c, 0, 4, 46, 44); c.fillStyle = '#e8a890'; c.fill(); c.strokeStyle = OUT9; c.lineWidth = 3; c.stroke();
  ell(c, 0, 34, 30, 14); c.fillStyle = '#e8a890'; c.fill(); c.stroke();
  c.fillStyle = '#1a1a22'; c.beginPath(); c.moveTo(-44, -10); c.quadraticCurveTo(0, -60, 44, -10); c.lineTo(52, -6); c.lineTo(-44, -6); c.closePath(); c.fill();
  rrect(c, -34, -6, 68, 16, 6); c.fillStyle = '#0c0c10'; c.fill();
  c.fillStyle = 'rgba(255,58,216,0.6)'; c.fillRect(-28, -2, 22, 5); c.fillRect(6, -2, 22, 5);
  c.strokeStyle = '#2a2a32'; c.lineWidth = 7; c.beginPath(); c.arc(0, -4, 50, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
  for (const s of [-1, 1]) { rrect(c, s * 50 - 10, -14, 20, 30, 8); c.fillStyle = '#2a2a32'; c.fill(); c.strokeStyle = '#ff3ad8'; c.lineWidth = 2; c.stroke(); }
  c.strokeStyle = OUT9; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, 24); c.quadraticCurveTo(0, 30, 14, 22); c.stroke();
  c.restore();
}

/* ------------------------------------------------------------------ scenes (design space 600 x 400) */
function speak9(st, who) { return st.talk && st.who === who; }
function drawRoomScene9(c, v, t, st) {
  const day = v === 'day';
  c.fillStyle = day ? '#c8c2b0' : '#1d2333'; c.fillRect(-300, -200, 1200, 600);
  // the window
  const wx = 440, wy = 40;
  c.fillStyle = '#2b2620'; c.fillRect(wx - 6, wy - 6, 132, 124);
  const sky = c.createLinearGradient(0, wy, 0, wy + 112);
  if (day) { sky.addColorStop(0, '#9cc9ec'); sky.addColorStop(1, '#e8eef2'); } else { sky.addColorStop(0, '#0b1226'); sky.addColorStop(1, '#22304e'); }
  c.fillStyle = sky; c.fillRect(wx, wy, 120, 112);
  c.fillStyle = day ? '#7a7f88' : '#0a0d16';
  for (let i = 0; i < 6; i++) c.fillRect(wx + i * 21, wy + 60 - (i * 13) % 30, 18, 60);
  if (!day) { c.fillStyle = '#e8c870'; for (let i = 0; i < 10; i++) c.fillRect(wx + 4 + (i * 29) % 112, wy + 70 + (i * 11) % 34, 3, 4); }
  c.fillStyle = '#2b2620'; c.fillRect(wx + 58, wy, 4, 112);
  // the film poster: four stars
  c.save(); c.translate(150, 96); c.rotate(-0.04);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-46, -58, 96, 124);
  c.fillStyle = '#16121e'; c.fillRect(-50, -62, 96, 124);
  c.fillStyle = '#e8c84a'; c.font = `800 28px ${UIF}`; c.textAlign = 'center'; c.fillText('WAHED', -2, -18);
  c.fillStyle = '#f2ecd8'; c.font = `600 11px ${UIF}`; c.fillText('THE FILM', -2, -2);
  c.fillStyle = '#e8c84a'; c.font = `700 16px ${UIF}`; c.fillText('★★★★', -2, 26);
  c.fillStyle = '#ff6a5a'; c.font = `700 9px ${UIF}`; c.fillText('14 DEC  ·  UTRECHT', -2, 48);
  c.restore();
  // the calendar, with something circled
  c.save(); c.translate(318, 70); c.fillStyle = '#f2ecd8'; c.fillRect(-26, -30, 52, 58);
  c.fillStyle = '#c3243a'; c.fillRect(-26, -30, 52, 12); c.fillStyle = '#fff'; c.font = `700 9px ${UIF}`; c.textAlign = 'center'; c.fillText('DECEMBER', 0, -21);
  c.fillStyle = '#2a2a30'; c.font = `700 22px ${UIF}`; c.fillText(day ? '18' : '13', 0, 8);
  c.strokeStyle = '#c3243a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 1, 15, 0, TAU); c.stroke();
  c.restore();
  // Alesen at the desk
  c.save(); c.translate(280, 254 + Math.sin(t * 2) * 2);
  drawAlesen(c, 0.86, st.faceA || 'normal', t, { talk: speak9(st, 'alesen'), blink: st.blink, phone: true });
  c.restore();
  c.fillStyle = '#6a4a30'; c.fillRect(-300, 290, 1200, 16); c.fillStyle = '#4a3220'; c.fillRect(-300, 306, 1200, 200);
  // the laptop glow
  c.fillStyle = '#2a2b2f'; c.beginPath(); c.moveTo(80, 290); c.lineTo(190, 290); c.lineTo(196, 296); c.lineTo(74, 296); c.closePath(); c.fill();
  c.fillStyle = '#9ea2aa'; c.beginPath(); c.moveTo(88, 290); c.lineTo(94, 216); c.lineTo(176, 216); c.lineTo(182, 290); c.closePath(); c.fill();
  // the fruit bowl, and you
  st.drawApple(c, 450, 262, 1.75);
  c.fillStyle = '#c9c2b4'; c.beginPath(); c.ellipse(462, 286, 54, 12, 0, 0, Math.PI); c.fill();
  c.fillStyle = '#e8e2d4'; ell(c, 462, 286, 54, 7); c.fill();
}
function drawHokkieScene9(c, v, t, st) {
  const sky = c.createLinearGradient(0, -200, 0, 260);
  sky.addColorStop(0, '#1a2140'); sky.addColorStop(0.6, '#5a4a6a'); sky.addColorStop(1, '#d8846a');
  c.fillStyle = sky; c.fillRect(-300, -200, 1200, 460);
  c.fillStyle = '#20202a';
  for (let i = 0; i < 14; i++) { const x = -300 + i * 90, h = 80 + ((i * 37) % 70); c.fillRect(x, 220 - h, 70, h); }
  c.fillStyle = '#ffd88a'; for (let i = 0; i < 24; i++) c.fillRect(-280 + (i * 53) % 1100, 160 + (i * 17) % 50, 4, 5);
  // the pavement and the road
  c.fillStyle = '#3a3e46'; c.fillRect(-300, 260, 1200, 300);
  c.fillStyle = '#e8c84a'; for (let x = -300; x < 900; x += 60) c.fillRect(x, 340, 34, 5);
  c.fillStyle = '#5a5e66'; c.fillRect(-300, 252, 1200, 10);
  // the hokkie
  c.fillStyle = 'rgba(160,200,230,0.18)'; c.fillRect(300, 120, 230, 140);
  c.strokeStyle = '#2a2e36'; c.lineWidth = 6; c.strokeRect(300, 120, 230, 140);
  c.fillStyle = '#2a2e36'; c.fillRect(290, 108, 250, 14);
  c.fillStyle = '#e8c84a'; c.fillRect(420, 118, 70, 22); c.fillStyle = '#16181c'; c.font = `800 13px ${UIF}`; c.textAlign = 'center'; c.fillText('34  36  31', 455, 134);
  c.fillStyle = '#6a4a30'; c.fillRect(330, 220, 170, 10);
  c.save(); c.translate(415, 236 + Math.sin(t * 2.2) * 1.5);
  drawSenale(c, 0.55, st.faceS || 'normal', t, { talk: speak9(st, 'senale'), blink: st.blink, phone: true });
  c.restore();
  c.save(); c.translate(150, 262 + Math.sin(t * 2) * 2);
  drawAlesen(c, 0.68, st.faceA || 'normal', t, { talk: speak9(st, 'alesen'), blink: st.blink, phone: true });
  c.restore();
  // cold breath and snow
  c.fillStyle = 'rgba(240,244,255,0.5)';
  for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i * 0.33) % 1; circle(c, 186 + ph * 26, 168 - ph * 18, 4 + ph * 6); }
  for (let i = 0; i < 40; i++) { const x = ((i * 71 + t * 20) % 900) - 150, y = ((i * 43 + t * 34) % 460) - 60; c.fillStyle = 'rgba(255,255,255,0.7)'; circle(c, x, y, 1.4 + (i % 3) * 0.5); }
  st.drawApple(c, 290, 304, 1.3);
}
function drawMallScene9(c, v, t, st) {
  c.fillStyle = '#e8ece8'; c.fillRect(-300, -200, 1200, 600);
  c.fillStyle = '#1a6ab0'; c.fillRect(-300, -20, 1200, 30);
  c.fillStyle = '#ffffff'; c.font = `800 18px ${UIF}`; c.textAlign = 'left'; c.fillText('VERS  ·  ALTIJD OPEN  ·  KAASBURGER  2,50', 40, 2);
  // shelves full of nothing in particular
  for (const sx of [-120, 20, 440, 580]) {
    c.fillStyle = '#c8ccd0'; c.fillRect(sx, 40, 120, 200);
    for (let r = 0; r < 4; r++) {
      c.fillStyle = '#8a9096'; c.fillRect(sx, 80 + r * 46, 120, 5);
      for (let k = 0; k < 6; k++) { c.fillStyle = PRODUCT_COLS[Math.abs(k + r * 3 + sx) % PRODUCT_COLS.length]; c.fillRect(sx + 6 + k * 19, 52 + r * 46, 14, 28); }
    }
  }
  c.fillStyle = '#b8bcc0'; c.fillRect(-300, 260, 1200, 300);
  c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; for (let x = -300; x < 900; x += 40) { c.beginPath(); c.moveTo(x, 260); c.lineTo(x - 60, 500); c.stroke(); }
  // the kaasburger sign
  c.save(); c.translate(300, 70); c.fillStyle = '#c3243a'; rrect(c, -80, -26, 160, 52, 10); c.fill();
  c.fillStyle = '#ffd84a'; c.font = `800 26px ${UIF}`; c.textAlign = 'center'; c.fillText('KAASBURGER', 0, 4); c.font = `700 11px ${UIF}`; c.fillText('OD KLASSIEK', 0, 18); c.restore();
  c.save(); c.translate(190, 268 + Math.sin(t * 2) * 2);
  drawAlesen(c, 0.66, st.faceA || 'normal', t, { talk: speak9(st, 'alesen'), blink: st.blink });
  c.restore();
  c.save(); c.translate(410, 270 + Math.sin(t * 2.3) * 2);
  drawSenale(c, 0.64, st.faceS || 'normal', t, { talk: speak9(st, 'senale'), blink: st.blink, phone: true });
  c.restore();
  st.drawApple(c, 300, 300, 1.4);
}
function drawClubScene9(c, v, t, st) {
  c.fillStyle = '#0a0610'; c.fillRect(-300, -200, 1200, 600);
  const beat = Math.max(0, 1 - ((t * 140 / 60) % 1) * 3);
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const a = Math.sin(t * 0.8 + i * 1.3) * 0.6 + Math.PI / 2, col = ['#ff3ad8', '#3ad8ff', '#d8ff3a', '#ffb43a', '#b05aff'][i];
    const g = c.createLinearGradient(300, -40, 300 + Math.cos(a) * 500, -40 + Math.sin(a) * 500);
    g.addColorStop(0, rgba(col, 0.32 + beat * 0.2)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.moveTo(300, -40); c.lineTo(300 + Math.cos(a - 0.12) * 600, -40 + Math.sin(a - 0.12) * 600); c.lineTo(300 + Math.cos(a + 0.12) * 600, -40 + Math.sin(a + 0.12) * 600); c.closePath(); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#ff3ad8'; c.font = `800 34px ${UIF}`; c.textAlign = 'center'; c.shadowColor = '#ff3ad8'; c.shadowBlur = 18 + beat * 12; c.fillText('RIZZMAS', 300, 18); c.shadowBlur = 0;
  // the DJ, still a person, for now
  drawDJHuman9(c, 300, 130, 0.62, t);
  c.fillStyle = '#16141c'; c.fillRect(170, 160, 260, 40); c.fillStyle = '#2a2632'; c.fillRect(170, 160, 260, 6);
  for (const x of [215, 385]) { c.fillStyle = '#0c0c10'; circle(c, x, 180, 16); c.fillStyle = '#ff3ad8'; circle(c, x, 180, 4); }
  // the crowd
  for (let i = 0; i < 16; i++) { const x = -260 + i * 70, y = 300 + (i % 3) * 10 + Math.sin(t * 9.4 + i) * 4 * (0.5 + beat); c.fillStyle = '#1a1424'; circle(c, x, y - 40, 16); c.fillRect(x - 20, y - 26, 40, 80); }
  c.save(); c.translate(160, 300 + Math.sin(t * 9.4) * 3 * beat);
  drawAlesen(c, 0.62, st.faceA || 'normal', t, { talk: speak9(st, 'alesen'), blink: st.blink, phone: 'flash' });
  c.restore();
  c.save(); c.translate(440, 300 + Math.sin(t * 9.4 + 1) * 3 * beat);
  drawSenale(c, 0.6, st.faceS || 'normal', t, { talk: speak9(st, 'senale'), blink: st.blink });
  c.restore();
  st.drawApple(c, 300, 318, 1.3);
}
function drawCourtScene9(c, v, t, st) {
  c.fillStyle = '#3a2a20'; c.fillRect(-300, -200, 1200, 600);
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; for (let x = -300; x < 900; x += 60) { c.beginPath(); c.moveTo(x, -200); c.lineTo(x, 400); c.stroke(); }
  // a generic emblem: the scales
  c.save(); c.translate(300, 6); c.strokeStyle = '#d8b46a'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, -24); c.lineTo(0, 20); c.moveTo(-30, -14); c.lineTo(30, -14); c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 30, -14); c.lineTo(s * 22, 4); c.lineTo(s * 38, 4); c.closePath(); c.stroke(); }
  c.restore();
  drawJudge9(c, 300, 96, 0.62, t);
  c.fillStyle = '#5a3a24'; c.fillRect(150, 110, 300, 70); c.fillStyle = '#7a5434'; c.fillRect(150, 110, 300, 8);
  // the parents on the bench at the side
  drawParent9(c, 486, 236, 0.5, true, st.talk && st.who === 'ouders', t);
  drawParent9(c, 548, 240, 0.5, false, st.talk && st.who === 'ouders', t + 0.5);
  c.save(); c.translate(388, 286 + Math.sin(t * 2.2) * 1.5);
  drawSenale(c, 0.54, st.faceS || 'sad', t, { talk: speak9(st, 'senale'), blink: st.blink });
  c.restore();
  c.save(); c.translate(140, 290 + Math.sin(t * 2) * 2);
  drawAlesen(c, 0.6, st.faceA || 'normal', t, { talk: speak9(st, 'alesen'), blink: st.blink });
  c.restore();
  // the evidence table: you, with a sticker
  c.fillStyle = '#6a4a30'; c.fillRect(230, 300, 120, 14); c.fillRect(240, 314, 8, 60); c.fillRect(332, 314, 8, 60);
  st.drawApple(c, 290, 282, 1.3);
  c.fillStyle = '#f2ecd8'; c.fillRect(304, 270, 16, 14); c.fillStyle = '#c3243a'; c.font = `800 12px ${UIF}`; c.textAlign = 'center'; c.fillText('A', 312, 282);
}
const SCENES9 = { room: drawRoomScene9, hokkie: drawHokkieScene9, mall: drawMallScene9, club: drawClubScene9, court: drawCourtScene9 };
const SCENE_BG9 = { room: '#1d2333', room_day: '#c8c2b0', hokkie: '#1a2140', mall: '#e8ece8', club: '#0a0610', court: '#3a2a20' };

/* ------------------------------------------------------------------ avatars for the chat and the posts */
function paintAvatar9(cv, who) {
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  const W = cv.width, H = cv.height;
  c.fillStyle = who === 'alesen' ? '#8ab89a' : who === 'senale' ? '#e8a0a0' : '#b8a8c8'; c.fillRect(0, 0, W, H);
  c.translate(W / 2, H * 0.6);
  if (who === 'alesen') drawAlesenHead(c, W / 150, 'proud', 0, {});
  else if (who === 'senale') drawSenaleHead(c, W / 150, 'normal', 0, {});
  else { c.translate(-W * 0.18, H * 0.2); drawParent9(c, 0, 0, W / 200, true, false, 0); drawParent9(c, W * 0.36, 0, W / 200, false, false, 0); }
}

/* ------------------------------------------------------------------ the second story's rooms: their messages are on the floor */
const SPRAY9 = { bus: ['PAK DEZE BUS', 'KAULO KOUD', 'BUS GAAT 34', '36 ZELFS'], market: ['OD KLASSIEK', '8%', 'KAASBURGER', 'HOELANG DUURT DE LOOP'], rave: ['RIZZMAS', 'ALS EEN SOORT IDOOL', 'ROY!!!'], court: ['81 WEKEN', 'TE LAAT', 'NIEMAND ZAG IETS', 'CURATELE'] };
function drawStoryFloor2(c, room, L, rng) {
  if (room.type !== 'secret' && room.type !== 'boss') {
    const list = SPRAY9[L.set] || SPRAY9.bus, txt = list[Math.floor(rng() * list.length)];
    const x = RW / 2 + (rng() - 0.5) * 80, y = room.type === 'start' ? RH * 0.36 : 70 + rng() * (RH - 140);
    c.save(); c.translate(x, y); c.rotate((rng() - 0.5) * 0.35);
    c.font = `700 30px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = L.set === 'rave' ? 'rgba(255,58,216,0.4)' : 'rgba(232,200,74,0.38)'; c.fillText(txt, 0, 0);
    c.restore();
  }
  if (rng() < 0.55) {
    // a crooked photo. de foto is schuin
    c.save(); c.translate(40 + rng() * (RW - 80), 40 + rng() * (RH - 80)); c.rotate(0.3 + rng() * 0.4);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-12, -13, 26, 30);
    c.fillStyle = '#efece4'; c.fillRect(-13, -15, 26, 30);
    c.fillStyle = '#5a4a6a'; c.fillRect(-11, -13, 22, 21);
    c.save(); c.beginPath(); c.rect(-11, -13, 22, 21); c.clip(); c.translate(0, 2); drawSenaleHead(c, 0.13, 'angry', 0, {}); c.restore();
    c.restore();
  }
}
function drawStoryWalls2(c, room, L) {
  let n = 0;
  const near = (side, pos) => room.sconces.some((s) => s.side === side && Math.abs((side === 'n' || side === 's' ? s.x : s.y) - pos) < 30);
  for (const side of ['n', 's']) {
    for (const x of [56, 136, 304, 384]) {
      if (near(side, x)) continue;
      const y = side === 'n' ? -WALL / 2 : RH + WALL / 2;
      c.save(); c.translate(x, y);
      if ((n++ + room.id) % 2) {
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-15, -8, 32, 18);
        c.fillStyle = '#16121e'; c.fillRect(-16, -10, 32, 18);
        c.fillStyle = '#e8c84a'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WAHED', 0, -3.5); c.font = `700 5px ${UIF}`; c.fillText('★★★★', 0, 3.5);
      } else {
        c.fillStyle = '#e8c84a'; c.fillRect(-12, -8, 24, 15);
        c.fillStyle = '#16181c'; c.font = `800 8px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(['34', '36', '31'][(n + room.id) % 3], 0, 0);
      }
      c.restore();
    }
  }
}

