/* src/08-draw-v8.js: drawing for v8: icons, curses, downgrades, walls, furniture, the info card. From v8. Lines 4696 to 5538 of the v13.7 script. */
/* =====================================================================
   Drawing for version 8: new icons, curses and downgrades, the new
   rooms and hazards, the Splitter and the Sharpshooter, snake traits,
   and the powerup info card
   ===================================================================== */

/* ------------------------------------------------------------------ small shared bits */
function downBadge(c, R) {
  const x = R * 0.62, y = R * 0.6, r = R * 0.34;
  c.fillStyle = '#1a0c10'; circle(c, x, y, r + R * 0.06);
  c.fillStyle = '#e83a50'; circle(c, x, y, r);
  c.fillStyle = '#fff0f0';
  c.beginPath(); c.moveTo(x - r * 0.55, y - r * 0.1); c.lineTo(x + r * 0.55, y - r * 0.1); c.lineTo(x, y + r * 0.6); c.closePath(); c.fill();
  c.fillRect(x - r * 0.2, y - r * 0.6, r * 0.4, r * 0.55);
}
function curseDisc(c, R, t) {
  const g = c.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
  g.addColorStop(0, 'rgba(176,90,255,0.32)'); g.addColorStop(1, 'rgba(120,40,200,0)');
  c.fillStyle = g; circle(c, 0, 0, R);
  c.strokeStyle = `rgba(196,138,240,${0.45 + 0.2 * Math.sin(t * 3)})`; c.lineWidth = R * 0.06;
  c.setLineDash([R * 0.18, R * 0.12]); c.beginPath(); c.arc(0, 0, R * 0.92, t * 0.4, t * 0.4 + TAU); c.stroke(); c.setLineDash([]);
}
function snailShape(c, R) {
  c.fillStyle = '#b8a07a'; ell(c, -R * 0.05, R * 0.55, R * 0.8, R * 0.2); c.fill();
  c.fillStyle = '#d2bc94'; ell(c, R * 0.62, R * 0.38, R * 0.18, R * 0.24, -0.4); c.fill();
  c.strokeStyle = '#6a5838'; c.lineWidth = R * 0.05;
  c.beginPath(); c.moveTo(R * 0.66, R * 0.2); c.lineTo(R * 0.74, -R * 0.08); c.moveTo(R * 0.56, R * 0.2); c.lineTo(R * 0.52, -R * 0.06); c.stroke();
  c.fillStyle = '#7a5a3a'; circle(c, -R * 0.12, R * 0.08, R * 0.5);
  c.strokeStyle = '#3a2614'; c.lineWidth = R * 0.07;
  c.beginPath(); for (let i = 0; i < 26; i++) { const a = i * 0.42, r = R * 0.06 + i * R * 0.017; const x = -R * 0.12 + Math.cos(a) * r, y = R * 0.08 + Math.sin(a) * r; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
}

/* ------------------------------------------------------------------ icons: new powerups, curses, downgrades */
function drawItemIcon4(c, id, R, t) {
  if (id === 'compost') {
    c.strokeStyle = '#2f6a22'; c.lineWidth = R * 0.14;
    c.beginPath(); c.moveTo(0, R * 0.98); c.quadraticCurveTo(R * 0.12, R * 0.45, 0, R * 0.05); c.stroke();
    leafShape(c, R * 0.04, R * 0.62, R * 0.46, -0.45); leafShape(c, R * 0.02, R * 0.72, R * 0.4, Math.PI + 0.5);
    c.save(); c.translate(0, -R * 0.2); c.rotate(t * 0.6);
    for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.fillStyle = i % 2 ? '#f2c230' : '#ffd84a'; ell(c, 0, -R * 0.42, R * 0.14, R * 0.26); c.fill(); }
    c.restore();
    c.fillStyle = '#5a3418'; circle(c, 0, -R * 0.2, R * 0.3);
    c.fillStyle = '#3a200c'; for (let i = 0; i < 7; i++) { const a = i * 2.4; circle(c, Math.cos(a) * R * 0.16, -R * 0.2 + Math.sin(a) * R * 0.16, R * 0.04); }
  } else if (id === 'graft') {
    c.save(); c.rotate(-0.6);
    c.fillStyle = '#6a4424'; rrect(c, -R * 0.95, -R * 0.12, R * 0.95, R * 0.24, R * 0.1); c.fill();
    c.fillStyle = '#8a5a30'; rrect(c, 0, -R * 0.12, R * 0.95, R * 0.24, R * 0.1); c.fill();
    c.fillStyle = '#efe4cc'; c.fillRect(-R * 0.2, -R * 0.2, R * 0.4, R * 0.4);
    c.strokeStyle = 'rgba(120,100,70,0.6)'; c.lineWidth = R * 0.04;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-R * 0.2 + i * R * 0.14, -R * 0.2); c.lineTo(-R * 0.12 + i * R * 0.14, R * 0.2); c.stroke(); }
    c.restore();
    leafShape(c, R * 0.35, -R * 0.35, R * 0.55, -1.2 + Math.sin(t * 2) * 0.08);
    seedIcon(c, -R * 0.55, R * 0.55, R * 0.22, 0.4);
  } else if (id === 'bruised') {
    c.save(); c.translate(0, R * 0.12);
    applePath(c, R * 0.72); c.fillStyle = '#c92139'; c.fill();
    c.save(); applePath(c, R * 0.72); c.clip();
    c.fillStyle = 'rgba(70,40,110,0.75)'; ell(c, R * 0.2, R * 0.08, R * 0.34, R * 0.28, 0.4); c.fill();
    c.fillStyle = 'rgba(40,90,120,0.55)'; ell(c, R * 0.24, R * 0.1, R * 0.18, R * 0.14, 0.4); c.fill();
    c.restore();
    applePath(c, R * 0.72); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.08; c.stroke();
    c.restore();
    c.fillStyle = '#9be37a';
    c.beginPath(); c.moveTo(-R * 0.62, -R * 0.35); c.lineTo(-R * 0.36, -R * 0.75); c.lineTo(-R * 0.1, -R * 0.35); c.closePath(); c.fill();
    c.fillRect(-R * 0.45, -R * 0.38, R * 0.18, R * 0.36);
  } else if (id === 'sap') {
    const drop = (x, y, s) => {
      c.beginPath(); c.moveTo(x, y - s); c.bezierCurveTo(x + s * 0.75, y - s * 0.1, x + s * 0.7, y + s * 0.75, x, y + s * 0.75);
      c.bezierCurveTo(x - s * 0.7, y + s * 0.75, x - s * 0.75, y - s * 0.1, x, y - s); c.closePath();
    };
    drop(-R * 0.12, -R * 0.08, R * 0.8); c.fillStyle = '#d88a1a'; c.fill(); c.strokeStyle = '#5a3008'; c.lineWidth = R * 0.07; c.stroke();
    drop(-R * 0.12, -R * 0.02, R * 0.52); c.fillStyle = '#f0b040'; c.fill();
    c.fillStyle = 'rgba(255,245,210,0.7)'; ell(c, -R * 0.32, -R * 0.12, R * 0.1, R * 0.2, 0.3); c.fill();
    for (const [x, y, s] of [[0.6, 0.55, 0.16], [0.75, 0.15, 0.1]]) { drop(x * R, y * R + Math.sin(t * 3 + x * 5) * R * 0.04, s * R); c.fillStyle = '#d88a1a'; c.fill(); }
  } else if (id === 'seedbank') {
    rrect(c, -R * 0.62, -R * 0.55, R * 1.24, R * 1.45, R * 0.25); c.fillStyle = 'rgba(190,220,235,0.22)'; c.fill();
    c.save(); rrect(c, -R * 0.62, -R * 0.55, R * 1.24, R * 1.45, R * 0.25); c.clip();
    for (let i = 0; i < 9; i++) { const x = -R * 0.42 + (i % 3) * R * 0.42, y = R * 0.68 - Math.floor(i / 3) * R * 0.3; coinIcon(c, x, y, R * 0.16); }
    c.restore();
    c.strokeStyle = 'rgba(220,240,255,0.75)'; c.lineWidth = R * 0.07; rrect(c, -R * 0.62, -R * 0.55, R * 1.24, R * 1.45, R * 0.25); c.stroke();
    c.fillStyle = '#6a4a2a'; rrect(c, -R * 0.66, -R * 0.78, R * 1.32, R * 0.28, R * 0.08); c.fill();
    seedIcon(c, 0, -R * 0.2, R * 0.24, 0.3);
  } else if (id === 'pollen') {
    c.fillStyle = 'rgba(242,214,90,0.45)';
    for (const [x, y, r] of [[-0.35, 0.1, 0.42], [0.25, -0.1, 0.48], [0.1, 0.4, 0.36], [-0.1, -0.4, 0.34]]) circle(c, x * R, y * R, r * R);
    c.fillStyle = '#ffe680';
    for (let i = 0; i < 12; i++) { const a = i * 2.39 + t * 0.6, r = R * (0.2 + (i % 4) * 0.17); circle(c, Math.cos(a) * r, Math.sin(a) * r * 0.9, R * 0.055); }
    c.save(); c.translate(R * 0.5, R * 0.55);
    for (let i = 0; i < 5; i++) { c.rotate(TAU / 5); c.fillStyle = '#f2f0ea'; ell(c, 0, -R * 0.16, R * 0.09, R * 0.15); c.fill(); }
    c.fillStyle = '#f2c230'; circle(c, 0, 0, R * 0.09);
    c.restore();
  } else if (id === 'dash') {
    c.strokeStyle = 'rgba(255,226,164,0.85)'; c.lineCap = 'round';
    for (const [y, w, l] of [[-0.35, 0.1, 0.9], [0.05, 0.13, 1.1], [0.42, 0.1, 0.8]]) {
      const ph = (t * 2.2 + y) % 1;
      c.lineWidth = R * w; c.beginPath(); c.moveTo(-R * 0.95 + ph * R * 0.15, y * R); c.lineTo(-R * 0.95 + l * R * 0.6, y * R); c.stroke();
    }
    miniApple(c, R * 0.35, R * 0.05, R * 0.5, '#c92139');
    c.fillStyle = 'rgba(255,220,140,0.9)';
    for (let i = 0; i < 3; i++) circle(c, -R * 0.1 - i * R * 0.18, R * 0.35 + Math.sin(t * 6 + i) * R * 0.04, R * (0.06 - i * 0.012));
  }
  // ---- curses: a purple halo, then what the deal is about
  else if (V9_ITEMS[id]) drawItemIcon9(c, id, R, t);
  else if (V10_ITEMS[id]) drawItemIcon10(c, id, R, t);
  else if (CURSES[id]) { curseDisc(c, R, t); if (V9_CURSES[id]) drawCurseIcon9(c, id, R, t); else if (V10_CURSES[id]) drawCurseIcon10(c, id, R, t); else drawCurseIcon(c, id, R, t); }
  // ---- downgrades: plain things gone a bit wrong, with a red arrow
  else if (DOWNS[id]) { if (V9_DOWNS[id]) drawDownIcon9(c, id, R, t); else if (V10_DOWNS[id]) drawDownIcon10(c, id, R, t); else drawDownIcon(c, id, R, t); downBadge(c, R); }
}
function drawCurseIcon(c, id, R, t) {
  if (id === 'glass') {
    c.save(); c.translate(0, R * 0.1);
    applePath(c, R * 0.66); c.fillStyle = 'rgba(190,230,255,0.35)'; c.fill(); c.strokeStyle = '#dff2ff'; c.lineWidth = R * 0.08; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = R * 0.05;
    c.beginPath(); c.moveTo(-R * 0.1, -R * 0.5); c.lineTo(R * 0.05, -R * 0.12); c.lineTo(-R * 0.15, R * 0.12); c.lineTo(R * 0.12, R * 0.5);
    c.moveTo(R * 0.05, -R * 0.12); c.lineTo(R * 0.4, -R * 0.02); c.stroke();
    c.restore();
    sparkle(c, R * 0.55, -R * 0.55, R * 0.18, '#ffffff');
  } else if (id === 'heavycore') {
    c.fillStyle = '#2a2a30';
    c.beginPath(); c.moveTo(-R * 0.55, R * 0.8); c.lineTo(R * 0.55, R * 0.8); c.lineTo(R * 0.4, -R * 0.1); c.lineTo(-R * 0.4, -R * 0.1); c.closePath(); c.fill();
    c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.14; c.beginPath(); c.arc(0, -R * 0.2, R * 0.28, Math.PI, TAU); c.stroke();
    c.fillStyle = '#e8e2d0'; c.font = `800 ${Math.round(R * 0.5)}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('1T', 0, R * 0.38);
    seedIcon(c, R * 0.62, -R * 0.55, R * 0.2, 0.6, '#ff6a3a', '#ffd0a0');
  } else if (id === 'overripe') {
    c.save(); c.translate(0, R * 0.12); c.scale(1.08, 0.88);
    applePath(c, R * 0.7); c.fillStyle = '#9a4a14'; c.fill(); c.strokeStyle = '#2a1206'; c.lineWidth = R * 0.08; c.stroke();
    c.fillStyle = 'rgba(60,30,8,0.55)'; circle(c, R * 0.2, R * 0.1, R * 0.22); circle(c, -R * 0.3, -R * 0.15, R * 0.12);
    c.restore();
    c.fillStyle = '#9a4a14'; ell(c, R * 0.1, R * 0.85 + Math.sin(t * 2) * R * 0.03, R * 0.1, R * 0.16); c.fill();
    c.fillStyle = '#100808';
    for (let i = 0; i < 2; i++) { const a = t * (4 + i) + i * 2; circle(c, Math.cos(a) * R * 0.75, -R * 0.55 + Math.sin(a * 1.3) * R * 0.2, R * 0.06); }
  } else if (id === 'greedy') {
    // a coin with a bite taken out of it (a clip, so nothing under the icon gets erased)
    c.save();
    c.beginPath(); c.rect(-R, -R, R * 2, R * 2);
    for (const [x, y] of [[0.55, -0.4], [0.72, -0.05], [0.62, 0.3]]) { c.moveTo(x * R + R * 0.2, y * R); c.arc(x * R, y * R, R * 0.2, 0, TAU); }
    c.clip('evenodd');
    c.fillStyle = '#7a5208'; circle(c, 0, R * 0.05, R * 0.7);
    c.fillStyle = '#f2c230'; circle(c, 0, R * 0.05, R * 0.6);
    c.fillStyle = '#c99a1a'; circle(c, 0, R * 0.05, R * 0.38);
    c.restore();
    c.fillStyle = 'rgba(255,250,210,0.8)'; circle(c, -R * 0.25, -R * 0.2, R * 0.1);
  } else if (id === 'hangover') {
    c.save(); c.rotate(0.6);
    c.fillStyle = '#3a6a2a'; rrect(c, -R * 0.22, -R * 0.2, R * 0.44, R * 1.0, R * 0.12); c.fill();
    c.fillRect(-R * 0.1, -R * 0.62, R * 0.2, R * 0.46);
    c.fillStyle = '#efe0bf'; c.fillRect(-R * 0.22, R * 0.15, R * 0.44, R * 0.3);
    c.restore();
    c.strokeStyle = '#c48af0'; c.lineWidth = R * 0.07;
    c.beginPath(); for (let i = 0; i < 30; i++) { const a = i * 0.45 + t * 2, r = R * 0.04 + i * R * 0.012; const x = -R * 0.45 + Math.cos(a) * r, y = -R * 0.45 + Math.sin(a) * r; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
  } else if (id === 'stampede') {
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * R * 0.45, x = -R * 0.1 + (i % 2) * R * 0.25 + ((t * 0.8 + i * 0.3) % 1) * R * 0.1;
      c.fillStyle = '#4e455a'; for (let k = 0; k < 4; k++) circle(c, x - k * R * 0.17, y + Math.sin(t * 8 + k + i) * R * 0.04, R * (0.14 - k * 0.015));
      c.fillStyle = '#ff3b3b'; circle(c, x + R * 0.06, y - R * 0.04, R * 0.04);
    }
    c.strokeStyle = 'rgba(236,226,212,0.5)'; c.lineWidth = R * 0.05;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-R * 0.95, (i - 1) * R * 0.45); c.lineTo(-R * 0.75, (i - 1) * R * 0.45); c.stroke(); }
  } else if (id === 'blight') {
    c.save(); c.rotate(-0.5);
    c.beginPath(); c.moveTo(-R * 0.75, 0); c.quadraticCurveTo(0, -R * 0.62, R * 0.75, 0); c.quadraticCurveTo(0, R * 0.62, -R * 0.75, 0); c.closePath();
    c.fillStyle = '#5a6a2a'; c.fill(); c.strokeStyle = '#222a0a'; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = '#1e1a0a'; for (const [x, y, r] of [[-0.3, 0.05, 0.12], [0.1, -0.12, 0.09], [0.35, 0.1, 0.11]]) circle(c, x * R, y * R, r * R);
    c.restore();
    c.fillStyle = '#f2c230';
    c.beginPath(); c.moveTo(-R * 0.35, -R * 0.55); c.lineTo(-R * 0.35, -R * 0.82); c.lineTo(-R * 0.2, -R * 0.68); c.lineTo(0, -R * 0.88); c.lineTo(R * 0.2, -R * 0.68); c.lineTo(R * 0.35, -R * 0.82); c.lineTo(R * 0.35, -R * 0.55); c.closePath(); c.fill();
  } else if (id === 'wormy') {
    c.save(); c.translate(-R * 0.12, R * 0.12);
    applePath(c, R * 0.66); c.fillStyle = '#c92139'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.08; c.stroke();
    c.fillStyle = '#1a0606'; circle(c, -R * 0.2, R * 0.15, R * 0.1); circle(c, R * 0.25, -R * 0.1, R * 0.12);
    c.restore();
    const n = 5;
    for (let i = n - 1; i >= 0; i--) {
      const x = R * 0.13 + i * R * 0.13, y = -R * 0.1 - i * R * 0.1 + Math.sin(t * 5 + i) * R * 0.04;
      c.fillStyle = '#5a1f2b'; circle(c, x, y, R * 0.13); c.fillStyle = i % 2 ? '#e9899a' : '#f39cac'; circle(c, x, y, R * 0.1);
    }
  } else if (id === 'rotting') {
    c.save(); c.translate(0, R * 0.1);
    corePath(c, R * 0.72); c.fillStyle = '#6a5a2a'; c.fill(); c.strokeStyle = '#1e1606'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = 'rgba(60,90,30,0.7)'; circle(c, -R * 0.15, R * 0.2, R * 0.16); circle(c, R * 0.2, -R * 0.2, R * 0.12);
    c.fillStyle = '#2a1606'; for (const s of [-1, 1]) { ell(c, s * R * 0.08, R * 0.04, R * 0.05, R * 0.1, s * 0.3); c.fill(); }
    c.restore();
    c.fillStyle = 'rgba(160,190,90,0.8)';
    for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; circle(c, Math.sin(i * 2.3) * R * 0.35, -R * 0.5 - ph * R * 0.4, R * 0.05 * (1 - ph)); }
  } else if (id === 'bitter') {
    c.save(); c.translate(0, R * 0.1);
    applePath(c, R * 0.6); c.fillStyle = '#7a9a2a'; c.fill(); c.strokeStyle = '#1e2a06'; c.lineWidth = R * 0.08; c.stroke();
    c.restore();
    c.fillStyle = '#d8e0a0';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + 0.2;
      c.beginPath(); c.moveTo(Math.cos(a - 0.14) * R * 0.56, R * 0.1 + Math.sin(a - 0.14) * R * 0.56); c.lineTo(Math.cos(a) * R * 0.92, R * 0.1 + Math.sin(a) * R * 0.92); c.lineTo(Math.cos(a + 0.14) * R * 0.56, R * 0.1 + Math.sin(a + 0.14) * R * 0.56); c.closePath(); c.fill();
    }
  }
}
function drawDownIcon(c, id, R, t) {
  if (id === 'dull') {
    seedShape(c, -R * 0.1, R * 0.05, R * 0.72, 0.5); c.fillStyle = '#6a6460'; c.fill(); c.strokeStyle = '#c8c0b4'; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#4a4440'; c.fillRect(-R * 0.55, -R * 0.75, R * 0.5, R * 0.18);
  } else if (id === 'stiff') {
    c.strokeStyle = '#8a7a6a'; c.lineWidth = R * 0.12;
    c.beginPath(); c.moveTo(-R * 0.75, R * 0.55);
    for (let i = 0; i < 6; i++) c.lineTo(-R * 0.55 + i * R * 0.24, i % 2 ? R * 0.15 : -R * 0.35);
    c.stroke();
    c.fillStyle = '#a0522d'; for (const [x, y] of [[-0.3, -0.2], [0.2, 0.1], [0.5, -0.3]]) circle(c, x * R, y * R, R * 0.07);
  } else if (id === 'soggy') {
    c.fillStyle = 'rgba(80,140,200,0.45)'; ell(c, 0, R * 0.55, R * 0.8, R * 0.24); c.fill();
    seedShape(c, 0, R * 0.05, R * 0.5, 1.4); c.fillStyle = '#4a3a30'; c.fill(); c.strokeStyle = '#a8b8c8'; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = '#8ac0f0';
    for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i * 0.33) % 1; ell(c, -R * 0.4 + i * R * 0.4, -R * 0.6 + ph * R * 0.9, R * 0.06, R * 0.11); c.fill(); }
  } else if (id === 'sluggish') {
    snailShape(c, R);
  } else if (id === 'wormhole') {
    c.save(); c.translate(-R * 0.05, R * 0.1);
    applePath(c, R * 0.7); c.fillStyle = '#a86a6a'; c.fill(); c.strokeStyle = '#2b070f'; c.lineWidth = R * 0.08; c.stroke();
    const g = c.createRadialGradient(R * 0.05, 0, 0, R * 0.05, 0, R * 0.3); g.addColorStop(0, '#000000'); g.addColorStop(1, '#3a1010');
    c.fillStyle = g; circle(c, R * 0.05, 0, R * 0.28);
    c.restore();
    c.fillStyle = '#e9899a'; circle(c, R * 0.12 + Math.sin(t * 4) * R * 0.04, R * 0.1, R * 0.08);
  } else if (id === 'butter') {
    c.save(); c.rotate(-0.15);
    c.fillStyle = '#c8a830'; c.fillRect(-R * 0.65, -R * 0.05, R * 1.3, R * 0.6);
    c.fillStyle = '#f2d870'; c.fillRect(-R * 0.65, -R * 0.25, R * 1.3, R * 0.25);
    c.fillStyle = 'rgba(255,250,220,0.6)'; c.fillRect(-R * 0.5, -R * 0.2, R * 0.6, R * 0.06);
    c.restore();
    seedIcon(c, R * 0.35 + Math.sin(t * 3) * R * 0.15, -R * 0.62, R * 0.22, 1.2 + Math.sin(t * 3), '#6a6460', '#c8c0b4');
  } else if (id === 'rattled') {
    const sh = Math.sin(t * 40) * R * 0.05;
    miniApple(c, sh, R * 0.1, R * 0.55, '#a8505a');
    c.strokeStyle = 'rgba(236,226,212,0.7)'; c.lineWidth = R * 0.06;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(0, R * 0.1, R * (0.68 + i * 0.16), s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); c.stroke(); }
  } else if (id === 'blurry') {
    c.fillStyle = '#e8e2d0'; ell(c, 0, 0, R * 0.78, R * 0.45); c.fill();
    c.fillStyle = '#5a5048'; circle(c, 0, 0, R * 0.3);
    c.fillStyle = '#100808'; circle(c, 0, 0, R * 0.13);
    c.fillStyle = 'rgba(160,160,170,0.55)';
    for (let i = 0; i < 4; i++) { const ph = (t * 0.3 + i * 0.25) % 1; ell(c, -R * 0.8 + ph * R * 1.6, -R * 0.15 + (i % 2) * R * 0.3, R * 0.35, R * 0.14); c.fill(); }
  }
}

/* ------------------------------------------------------------------ walls inside rooms, pits, cracks */
function drawWallBlock(c, o, room, L) {
  const x = o.c * T, y = o.r * T;
  const isW = (cc, rr) => cc >= 0 && rr >= 0 && cc < COLS && rr < ROWS && room.tiles[rr][cc] && room.tiles[rr][cc].type === 'wall';
  if (!isW(o.c, o.r + 1)) { c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + T, T - 2, 8); }
  if (!isW(o.c + 1, o.r)) { c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x + T, y + 4, 6, T); }
  c.fillStyle = L.wall; c.fillRect(x, y, T, T);
  c.strokeStyle = L.wallLo; c.lineWidth = 1.1;
  const bh = T / 3;
  for (let row = 0; row < 3; row++) {
    const yy = y + row * bh, off = ((o.r * 3 + row) % 2) ? 11 : 0;
    c.beginPath(); c.moveTo(x, yy + bh); c.lineTo(x + T, yy + bh); c.stroke();
    for (let xx = Math.ceil((x - off) / 22) * 22 + off; xx < x + T; xx += 22) { if (xx <= x + 0.5) continue; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + bh); c.stroke(); }
  }
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(x, y, T, 4);
  c.fillStyle = L.wallHi;
  if (!isW(o.c, o.r - 1)) c.fillRect(x, y, T, 2.5);
  c.fillStyle = L.wallLo;
  if (!isW(o.c - 1, o.r)) c.fillRect(x, y, 2.2, T);
  if (!isW(o.c + 1, o.r)) c.fillRect(x + T - 2.2, y, 2.2, T);
  if (!isW(o.c, o.r + 1)) c.fillRect(x, y + T - 3, T, 3);
}
function drawPit(c, o, L) {
  const rng = mulberry32(Math.floor(o.seed * 1e9) | 0), x = o.x, y = o.y;
  const pts = [];
  for (let i = 0; i < 11; i++) { const a = (i / 11) * TAU, r = T * (0.44 + rng() * 0.1); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.94]); }
  const path = (k) => { c.beginPath(); pts.forEach(([px, py], i) => { const X = x + (px - x) * k, Y = y + (py - y) * k; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.closePath(); };
  path(1.08); c.fillStyle = L.rockLo; c.fill();
  path(1); const g = c.createRadialGradient(x, y + 4, 2, x, y, T * 0.55); g.addColorStop(0, '#000000'); g.addColorStop(0.7, '#050303'); g.addColorStop(1, L.grout);
  c.fillStyle = g; c.fill();
  c.save(); path(1); c.clip();
  c.fillStyle = rgba(L.dirt, 0.8); c.fillRect(x - T, y - T * 0.62, T * 2, T * 0.22);
  c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(x - T, y - T * 0.42, T * 2, T * 0.1);
  c.restore();
  c.fillStyle = L.dirt;
  for (let i = 0; i < 6; i++) { const a = rng() * TAU, r = T * (0.5 + rng() * 0.16); c.fillRect(x + Math.cos(a) * r - 1.5, y + Math.sin(a) * r - 1.5, 2 + rng() * 3, 2 + rng() * 2); }
}
function drawCracks(c, room, t) {
  for (const k of room.cracks) {
    if (k.state === 2) continue;
    const rng = mulberry32(Math.floor(k.seed * 1e9) | 0);
    const sh = k.state === 1 ? Math.sin(t * 50 + k.seed * 20) * 0.8 : 0;
    const w = k.state === 1 ? 1.8 : 1.1;
    if (k.state === 1) { c.fillStyle = `rgba(0,0,0,${0.18 + 0.12 * Math.sin(t * 20)})`; rrect(c, k.c * T + 4, k.r * T + 4, T - 8, T - 8, 4); c.fill(); }
    c.strokeStyle = k.state === 1 ? 'rgba(10,4,2,0.9)' : 'rgba(10,4,2,0.55)'; c.lineWidth = w;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + rng(); let x = k.x + sh, y = k.y;
      c.beginPath(); c.moveTo(x, y);
      for (let s = 0; s < 3; s++) { x += Math.cos(a + (rng() - 0.5)) * 6; y += Math.sin(a + (rng() - 0.5)) * 6; c.lineTo(clamp(x, k.c * T + 2, k.c * T + T - 2), clamp(y, k.r * T + 2, k.r * T + T - 2)); }
      c.stroke();
    }
  }
}

/* ------------------------------------------------------------------ the new room furniture */
const SLOT_COLS = ['#c92139', '#f2c230', '#3a9bff', '#e9899a', '#e8e2d0', '#ffd84a'];
function slotFace(c, f, x, y, s) {
  if (f === 0) { miniApple(c, x, y + s * 0.1, s * 0.62, '#c92139'); }
  else if (f === 1) coinIcon(c, x, y, s * 0.55);
  else if (f === 2) {
    c.fillStyle = '#3a9bff'; c.fillRect(x - s * 0.6, y - s * 0.4, s * 1.2, s * 1.0);
    c.fillStyle = '#ffd84a'; c.fillRect(x - s * 0.12, y - s * 0.4, s * 0.24, s * 1.0); c.fillRect(x - s * 0.6, y - s * 0.02, s * 1.2, s * 0.22);
  } else if (f === 3) {
    c.strokeStyle = '#d0607a'; c.lineWidth = s * 0.42; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s * 0.55, y + s * 0.35); c.bezierCurveTo(x - s * 0.55, y - s * 0.6, x + s * 0.55, y + s * 0.6, x + s * 0.55, y - s * 0.35); c.stroke();
    c.fillStyle = '#1a0a0e'; circle(c, x + s * 0.55, y - s * 0.38, s * 0.1);
  } else if (f === 4) {
    c.fillStyle = '#e8e2d0'; circle(c, x, y - s * 0.1, s * 0.55); c.fillRect(x - s * 0.3, y + s * 0.2, s * 0.6, s * 0.4);
    c.fillStyle = '#120808'; circle(c, x - s * 0.2, y - s * 0.12, s * 0.15); circle(c, x + s * 0.2, y - s * 0.12, s * 0.15);
  } else sparkle(c, x, y, s * 0.75, '#ffd84a');
}
function drawSlot(c, o, t) {
  const sh = o.shake > 0 ? Math.sin(t * 60) * o.shake * 4 : 0;
  const x = o.x + sh, y = o.y + 6;
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 14, 22, 6); c.fill();
  // the cabinet
  rrect(c, x - 19, y - 40, 38, 54, 6); c.fillStyle = '#1a0606'; c.fill();
  const g = c.createLinearGradient(x - 18, 0, x + 18, 0); g.addColorStop(0, '#7a0e1a'); g.addColorStop(0.5, '#c4243a'); g.addColorStop(1, '#6a0a16');
  rrect(c, x - 17.5, y - 38.5, 35, 51, 5); c.fillStyle = g; c.fill();
  c.fillStyle = '#f2c230'; rrect(c, x - 17.5, y - 38.5, 35, 9, 4); c.fill();
  // the lights along the top
  for (let i = 0; i < 6; i++) {
    const on = !o.broken && (Math.floor(t * (o.spin > 0 ? 14 : 4)) + i) % 2 === 0;
    c.fillStyle = on ? '#fff6c0' : '#7a5a10'; circle(c, x - 13 + i * 5.2, y - 34, 1.6);
  }
  // the window with three reels
  rrect(c, x - 16, y - 28, 32, 18, 2.5); c.fillStyle = '#0c0606'; c.fill();
  for (let i = 0; i < 3; i++) {
    const rx = x - 10.4 + i * 10.4;
    c.fillStyle = '#f2ece0'; c.fillRect(rx - 4.8, y - 26.5, 9.6, 15);
    const f = o.reels[i];
    const spinning = o.spin > 0 && o.spin > 0.75 - i * 0.3;
    c.save(); c.beginPath(); c.rect(rx - 4.8, y - 26.5, 9.6, 15); c.clip();
    slotFace(c, f, rx, y - 19 + (spinning ? Math.sin(t * 60 + i) * 2.5 : 0), 5);
    c.restore();
  }
  // the coin slot and the tray
  c.fillStyle = '#0c0606'; c.fillRect(x - 4, y - 6, 8, 2);
  rrect(c, x - 12, y + 2, 24, 8, 2); c.fillStyle = '#3a0a10'; c.fill();
  c.fillStyle = '#f2c230'; c.fillRect(x - 11, y + 2, 22, 1.5);
  // the lever
  const pull = o.spin > 0.85 ? (1.15 - o.spin) / 0.3 : o.spin > 0 ? 1 - (0.85 - o.spin) * 1.3 : 0;
  const lv = clamp(pull, 0, 1);
  c.strokeStyle = '#2a2a30'; c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(x + 18, y - 14); c.lineTo(x + 24, y - 14); c.lineTo(x + 24, y - 30 + lv * 20); c.stroke();
  c.fillStyle = '#e83a50'; circle(c, x + 24, y - 31 + lv * 20, 3.6);
  c.fillStyle = 'rgba(255,255,255,0.5)'; circle(c, x + 23, y - 32 + lv * 20, 1.1);
  if (o.broken) {
    c.save(); c.translate(x, y - 18); c.rotate(-0.18);
    c.fillStyle = '#f2ece0'; c.fillRect(-17, -5, 34, 10); c.fillStyle = '#1a1a1a';
    c.font = '700 6.5px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT OF ORDER', 0, 0.5);
    c.restore();
  }
}
function drawBookstand(c, o, t) {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 14, 18, 6); c.fill();
  c.fillStyle = '#140a14';
  c.beginPath(); c.moveTo(x - 6, y + 13); c.lineTo(x + 6, y + 13); c.lineTo(x + 4, y - 2); c.lineTo(x - 4, y - 2); c.closePath(); c.fill();
  c.fillStyle = '#2a1428'; c.fillRect(x - 3, y - 2, 6, 14);
  c.fillStyle = '#1a0c18';
  c.beginPath(); c.moveTo(x - 16, y - 6); c.lineTo(x + 16, y - 6); c.lineTo(x + 13, y - 1); c.lineTo(x - 13, y - 1); c.closePath(); c.fill();
  // the open book
  const lift = Math.sin(t * 2 + o.c) * 0.8;
  c.fillStyle = '#4a1a5a'; rrect(c, x - 15, y - 13 + lift, 30, 9, 2); c.fill();
  c.fillStyle = '#efe6d2';
  c.beginPath(); c.moveTo(x, y - 6 + lift); c.quadraticCurveTo(x - 7, y - 14 + lift, x - 14, y - 11 + lift); c.lineTo(x - 14, y - 6 + lift); c.quadraticCurveTo(x - 7, y - 8 + lift, x, y - 5 + lift); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x, y - 6 + lift); c.quadraticCurveTo(x + 7, y - 14 + lift, x + 14, y - 11 + lift); c.lineTo(x + 14, y - 6 + lift); c.quadraticCurveTo(x + 7, y - 8 + lift, x, y - 5 + lift); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,60,160,0.7)'; c.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - 11, y - 10.5 + i * 1.6 + lift); c.lineTo(x - 3, y - 9.5 + i * 1.6 + lift); c.moveTo(x + 3, y - 9.5 + i * 1.6 + lift); c.lineTo(x + 11, y - 10.5 + i * 1.6 + lift); c.stroke(); }
}
function drawGold(c, o, t) {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 6 : 0;
  const x = o.x + sh, y = o.y + 4;
  c.fillStyle = 'rgba(0,0,0,0.42)'; ell(c, x + 2, y + 9, 17, 5); c.fill();
  const bar = (bx, by) => {
    c.fillStyle = '#6a4a08';
    c.beginPath(); c.moveTo(bx - 8, by + 4); c.lineTo(bx + 8, by + 4); c.lineTo(bx + 6, by - 3); c.lineTo(bx - 6, by - 3); c.closePath(); c.fill();
    c.fillStyle = '#f2c230';
    c.beginPath(); c.moveTo(bx - 7, by + 3); c.lineTo(bx + 7, by + 3); c.lineTo(bx + 5.3, by - 2.2); c.lineTo(bx - 5.3, by - 2.2); c.closePath(); c.fill();
    c.fillStyle = '#ffe9a0'; c.fillRect(bx - 4.5, by - 2, 9, 1.2);
  };
  const n = o.hp;
  const spots = [[-7, 4], [7, 4], [0, -3], [-7, -10], [7, -10]];
  for (let i = 0; i < Math.min(spots.length, n + 1); i++) bar(x + spots[i][0], y + spots[i][1]);
  const tw = 0.5 + 0.5 * Math.sin(t * 4 + o.seed * 10);
  if (tw > 0.8) sparkle(c, x + 5, y - 12, 3 * tw, '#fffbe0');
}
function drawSurvivalAltar(c, o, room, t) {
  const x = o.x, y = o.y + 2, S = room.surv || { on: false, t: 0, len: 25 };
  const done = room.cleared, live = S.on && !done;
  const f = live ? clamp(S.t / S.len, 0, 1) : done ? 1 : 0;
  c.save(); c.translate(x, y + 2); c.scale(1, 0.62);
  c.strokeStyle = `rgba(232,140,60,${done ? 0.15 : 0.3})`; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.stroke();
  if (f > 0) { c.strokeStyle = done ? 'rgba(160,220,120,0.5)' : `rgba(255,170,70,${0.7 + 0.2 * Math.sin(t * 8)})`; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 40, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.stroke(); }
  if (!S.on && !done) { c.strokeStyle = `rgba(255,170,70,${0.35 + 0.25 * Math.sin(t * 3)})`; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 33, 0, TAU); c.stroke(); }
  c.restore();
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 13, 20, 6); c.fill();
  rrect(c, x - 17, y - 8, 34, 20, 3); c.fillStyle = '#100808'; c.fill();
  rrect(c, x - 15.5, y - 6.5, 31, 17, 2); c.fillStyle = '#5a4a3a'; c.fill();
  rrect(c, x - 19, y - 14, 38, 9, 2); c.fillStyle = '#100808'; c.fill();
  rrect(c, x - 17.5, y - 12.5, 35, 6, 1.5); c.fillStyle = '#7a6450'; c.fill();
  // an hourglass
  const hx = x, hy = y + 2;
  c.fillStyle = '#2a1a0c'; c.fillRect(hx - 5, hy - 7, 10, 1.6); c.fillRect(hx - 5, hy + 5.4, 10, 1.6);
  c.fillStyle = 'rgba(230,220,200,0.35)';
  c.beginPath(); c.moveTo(hx - 4, hy - 5.4); c.lineTo(hx + 4, hy - 5.4); c.lineTo(hx + 0.8, hy); c.lineTo(hx + 4, hy + 5.4); c.lineTo(hx - 4, hy + 5.4); c.lineTo(hx - 0.8, hy); c.closePath(); c.fill();
  c.fillStyle = '#ffb44a';
  const top = 1 - f;
  c.beginPath(); c.moveTo(hx - 3.4 * top, hy - 0.6 - 4.6 * top); c.lineTo(hx + 3.4 * top, hy - 0.6 - 4.6 * top); c.lineTo(hx, hy - 0.4); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(hx - 3.6, hy + 5.2); c.lineTo(hx + 3.6, hy + 5.2); c.lineTo(hx, hy + 5.2 - 4.4 * f); c.closePath(); c.fill();
}
function drawSpring(c, room, t) {
  const s = room.spring; if (!s) return;
  const x = s.x, y = s.y, used = s.used;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU, rx = Math.cos(a) * 34, ry = Math.sin(a) * 26;
    c.fillStyle = '#1a1612'; ell(c, x + rx + 1, y + ry + 2, 7, 5.5); c.fill();
    c.fillStyle = i % 2 ? '#6a6458' : '#7e776a'; ell(c, x + rx, y + ry, 6.5, 5); c.fill();
  }
  const g = c.createRadialGradient(x - 6, y - 6, 3, x, y, 32);
  if (used) { g.addColorStop(0, '#2a3a38'); g.addColorStop(1, '#101a18'); }
  else { g.addColorStop(0, '#9fe8ff'); g.addColorStop(0.5, '#3aa8b8'); g.addColorStop(1, '#0e4a5a'); }
  c.fillStyle = g; ell(c, x, y, 30, 22); c.fill();
  if (!used) {
    c.strokeStyle = 'rgba(220,250,255,0.55)'; c.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) { const u = (t * 0.5 + i * 0.5) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.ellipse(x, y, 6 + u * 22, 4 + u * 16, 0, 0, TAU); c.stroke(); }
    c.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1); if (tw > 0.7) sparkle(c, x - 14 + i * 13, y - 8 + (i % 2) * 12, 2.6 * tw, '#ffffff'); }
  }
}
function drawRotPickup(c, p, t, coins) {
  const bob = Math.sin(t * 3 + (p.ph || 0)) * 1.4;
  if (p.kind === 'key') {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, p.x + 1, p.y + 8, 8, 3); c.fill();
    c.save(); c.translate(p.x, p.y - 4 + bob); c.rotate(-0.6 + Math.sin(t * 2) * 0.1);
    c.strokeStyle = '#5a3a08'; c.lineWidth = 4.2; c.beginPath(); c.arc(-6, 0, 4, 0, TAU); c.stroke();
    c.strokeStyle = '#f2c230'; c.lineWidth = 2.4; c.beginPath(); c.arc(-6, 0, 4, 0, TAU); c.stroke();
    c.fillStyle = '#5a3a08'; c.fillRect(-2.5, -1.8, 13, 3.6);
    c.fillStyle = '#f2c230'; c.fillRect(-2, -1.1, 12, 2.2); c.fillRect(6, 1, 2, 3.4); c.fillRect(9, 1, 1.6, 2.6);
    c.restore();
    return;
  }
  if (p.kind === 'cleanse') {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, p.x + 1, p.y + 10, 9, 3.4); c.fill();
    c.save(); c.translate(p.x, p.y - 2 + bob);
    rrect(c, -6.5, -6, 13, 15, 3); c.fillStyle = '#0e3a4a'; c.fill();
    rrect(c, -5.5, -5, 11, 13, 2.5); c.fillStyle = '#7cd8ff'; c.fill();
    c.fillStyle = '#e8f8ff'; c.fillRect(-5.5, -0.5, 11, 4);
    c.fillStyle = '#0e3a4a'; c.fillRect(-2, -10, 4, 4.5); c.fillRect(-2, -11, 7, 2.2);
    c.restore();
    c.strokeStyle = 'rgba(220,250,255,0.75)'; c.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i * 0.33) % 1; c.globalAlpha = 1 - ph; c.beginPath(); c.arc(p.x + 8 + Math.sin(i * 2 + t) * 2, p.y - 10 - ph * 16, 1.4 + i * 0.4, 0, TAU); c.stroke(); }
    c.globalAlpha = 1;
    drawPriceLabel(c, p.x, p.y + 18, priceOf(p), coins >= priceOf(p));
    return;
  }
  // the reroll machine
  const sp = p.spin > 0 ? p.spin : 0;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, p.x + 2, p.y + 12, 14, 4.5); c.fill();
  c.save(); c.translate(p.x, p.y);
  rrect(c, -12, -15, 24, 26, 4); c.fillStyle = '#0a1a2a'; c.fill();
  rrect(c, -10.5, -13.5, 21, 23, 3); c.fillStyle = '#1a6ab0'; c.fill();
  c.fillStyle = '#0c1420'; circle(c, 0, -3, 7.5);
  c.save(); c.translate(0, -3); c.rotate(t * 1.2 + sp * 20);
  c.strokeStyle = '#7cc4ff'; c.lineWidth = 1.8;
  for (const s of [0, Math.PI]) { c.beginPath(); c.arc(0, 0, 4.6, s + 0.3, s + 2.6); c.stroke(); const a = s + 2.6; c.fillStyle = '#7cc4ff'; c.beginPath(); c.moveTo(Math.cos(a) * 6.6, Math.sin(a) * 6.6); c.lineTo(Math.cos(a) * 2.6, Math.sin(a) * 2.6); c.lineTo(Math.cos(a + 0.6) * 4.6, Math.sin(a + 0.6) * 4.6); c.closePath(); c.fill(); }
  c.restore();
  c.fillStyle = '#f2c230'; c.fillRect(-8, 6, 16, 2);
  c.restore();
  drawPriceLabel(c, p.x, p.y + 20, priceOf(p), coins >= priceOf(p));
}
function drawCurseLabel(c, x, y) {
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(20,6,30,0.85)'; rrect(c, -23, -6, 46, 12, 6); c.fill();
  c.strokeStyle = 'rgba(196,138,240,0.85)'; c.lineWidth = 1; rrect(c, -22.5, -5.5, 45, 11, 5.5); c.stroke();
  c.fillStyle = '#d8a8ff'; c.font = '700 8px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('+ CURSE', 0, 0.5);
  c.restore();
}
// a mimic: before it wakes it only breathes, and one tooth shows at the lid
function drawMimicTell(c, o, t) {
  if (!o.mimic || o.woke || o.open) return;
  c.fillStyle = '#efe4cf';
  c.beginPath(); c.moveTo(o.x + 5, o.y - 3); c.lineTo(o.x + 7, o.y + 1.2); c.lineTo(o.x + 9, o.y - 3); c.closePath(); c.fill();
}
function drawMimic(c, o, t) {
  const x = o.x + Math.sin(t * 30) * 1.2, y = o.y + 3, gape = 0.6 + 0.4 * Math.sin(t * 6);
  c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, x + 2, y + 13, 22, 6); c.fill();
  c.save(); c.translate(x, y);
  // the lid, thrown open like a jaw
  c.save(); c.translate(0, -8); c.rotate(-0.5 * gape);
  rrect(c, -19, -12, 38, 12, 4); c.fillStyle = '#120a06'; c.fill();
  rrect(c, -17.5, -10.5, 35, 9, 3); c.fillStyle = '#7a4e31'; c.fill();
  c.fillStyle = '#efe4cf';
  for (let i = 0; i < 6; i++) { const tx = -15 + i * 6; c.beginPath(); c.moveTo(tx, -1.5); c.lineTo(tx + 3, 4); c.lineTo(tx + 6, -1.5); c.closePath(); c.fill(); }
  c.restore();
  // the mouth
  c.fillStyle = '#3a0a10'; rrect(c, -17, -9, 34, 10, 3); c.fill();
  c.fillStyle = '#c3243a'; ell(c, 2 + Math.sin(t * 9) * 3, -3, 9, 3.4); c.fill();
  c.fillStyle = '#120a06'; rrect(c, -19, 0, 38, 13, 3); c.fill();
  const g = c.createLinearGradient(0, 0, 0, 13); g.addColorStop(0, '#6a432a'); g.addColorStop(1, '#3a2316');
  rrect(c, -17.5, 1.5, 35, 10, 2); c.fillStyle = g; c.fill();
  c.fillStyle = '#efe4cf';
  for (let i = 0; i < 6; i++) { const tx = -15 + i * 6; c.beginPath(); c.moveTo(tx, 1.5); c.lineTo(tx + 3, -4); c.lineTo(tx + 6, 1.5); c.closePath(); c.fill(); }
  c.restore();
}
function drawSunflower(c, u, t) {
  const grow = smooth(Math.min(1, u.t / 0.35)), wilt = u.t > u.life - 1 ? (u.t - (u.life - 1)) : 0;
  const x = u.x, y = u.y;
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x + 1, y + 6, 7, 2.6); c.fill();
  c.save(); c.translate(x, y + 4); c.scale(grow, grow); c.rotate(wilt * 0.6);
  c.strokeStyle = '#2f6a22'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(1.5, -7, 0, -14); c.stroke();
  leafShape(c, 0.5, -5, 6, -0.5); leafShape(c, 0, -7, 5.5, Math.PI + 0.6);
  c.translate(0, -15); c.rotate(u.ang + Math.PI / 2 - wilt);
  for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.fillStyle = i % 2 ? '#f2c230' : '#ffd84a'; ell(c, 0, -5.5, 1.8, 3.2); c.fill(); }
  c.fillStyle = '#5a3418'; circle(c, 0, 0, 3.6);
  c.fillStyle = '#2a1408'; circle(c, 0, -2.2, 1.2);
  c.restore();
}
function drawSap(c, room, t) {
  for (const s of room.sap) {
    const a = s.t < 0.2 ? s.t / 0.2 : s.t > 2.4 ? Math.max(0, 1 - (s.t - 2.4) / 0.8) : 1;
    c.fillStyle = `rgba(216,138,26,${0.32 * a})`; ell(c, s.x, s.y, s.r, s.r * 0.7); c.fill();
    c.fillStyle = `rgba(255,220,140,${0.25 * a})`; ell(c, s.x - s.r * 0.3, s.y - s.r * 0.2, s.r * 0.3, s.r * 0.18); c.fill();
  }
}
function drawClouds(c, room, t) {
  for (const k of room.clouds) {
    const a = k.t < 0.2 ? k.t / 0.2 : k.t > k.life - 0.8 ? Math.max(0, (k.life - k.t) / 0.8) : 1;
    for (let i = 0; i < 7; i++) {
      const ang = i * 0.9 + k.seed + t * 0.2, r = k.r * (0.45 + (i % 3) * 0.12);
      c.fillStyle = k.sugar ? `rgba(246,240,228,${0.16 * a})` : `rgba(242,220,110,${0.12 * a})`; circle(c, k.x + Math.cos(ang) * r * 0.6, k.y + Math.sin(ang) * r * 0.5, r * 0.6);
    }
    c.fillStyle = k.sugar ? `rgba(255,255,250,${0.8 * a})` : `rgba(255,236,140,${0.75 * a})`;
    for (let i = 0; i < 14; i++) { const ang = i * 2.39 + k.seed + t * (0.3 + (i % 3) * 0.2), r = k.r * ((i * 0.37) % 1); circle(c, k.x + Math.cos(ang) * r, k.y + Math.sin(ang) * r * 0.8, 1.1); }
  }
}
function drawSkins(c, room, t) {
  for (const k of room.skins) {
    const a = clamp(k.a, 0, 1) * clamp(k.hp / 4, 0.3, 1);
    c.save(); c.translate(k.x, k.y); c.rotate(k.rot);
    c.globalAlpha = 0.55 * a;
    const wob = (u) => 1 + Math.sin(u * 5 + t * 2 + k.seed) * 0.06 + (k.ripple > 0 ? Math.sin(u * 9 + t * 40) * k.ripple * 0.3 : 0);
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const u = (i / 24) * TAU, w = wob(u); const X = Math.cos(u) * k.rx * w, Y = Math.sin(u) * k.ry * w; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }
    c.closePath();
    c.fillStyle = '#d8d0b8'; c.fill();
    c.strokeStyle = 'rgba(120,110,90,0.8)'; c.lineWidth = 1; c.stroke();
    c.save(); c.clip();
    c.strokeStyle = 'rgba(110,100,80,0.55)'; c.lineWidth = 0.8;
    for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) {
      const sx = i * 7 + (j % 2) * 3.5, sy = j * 6;
      c.beginPath(); c.moveTo(sx - 3, sy - 1.5); c.lineTo(sx, sy + 1.5); c.lineTo(sx + 3, sy - 1.5); c.stroke();
    }
    c.restore();
    c.restore(); c.globalAlpha = 1;
  }
}
function drawRoots(c, room, t) {
  for (const k of room.roots) {
    const rng = mulberry32(Math.floor(k.seed * 1000) | 0);
    if (!k.done) {
      const u = clamp(k.t / k.warn, 0, 1);
      c.strokeStyle = `rgba(255,90,60,${0.25 + 0.55 * u})`; c.lineWidth = 1.4 + u;
      c.setLineDash([5, 4]); c.beginPath(); c.arc(k.x, k.y, k.r, 0, TAU); c.stroke(); c.setLineDash([]);
      c.strokeStyle = `rgba(30,12,8,${0.4 + 0.5 * u})`; c.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + rng(); c.beginPath(); c.moveTo(k.x, k.y); c.lineTo(k.x + Math.cos(a) * k.r * u * 0.9, k.y + Math.sin(a) * k.r * u * 0.9); c.stroke(); }
      continue;
    }
    const e = k.t - k.warn, up = e < 0.12 ? e / 0.12 : Math.max(0, 1 - (e - 0.35) / 0.45);
    if (up <= 0) continue;
    c.fillStyle = `rgba(20,8,4,${0.5 * up})`; ell(c, k.x, k.y + 2, k.r * 0.9, k.r * 0.6); c.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + rng() * 0.6, d = k.r * (0.15 + rng() * 0.7), h = (22 + rng() * 18) * up, w = 3.6 + rng() * 1.6;
      const bx = k.x + Math.cos(a) * d, by = k.y + Math.sin(a) * d * 0.7;
      c.fillStyle = '#1e0e06';
      c.beginPath(); c.moveTo(bx - w, by + 1.5); c.quadraticCurveTo(bx + rng() * 6 - 3, by - h * 0.6, bx + Math.cos(a) * 4, by - h); c.lineTo(bx + w, by + 1.5); c.closePath(); c.fill();
      c.fillStyle = '#6a3a20';
      c.beginPath(); c.moveTo(bx - w * 0.45, by); c.quadraticCurveTo(bx, by - h * 0.55, bx + Math.cos(a) * 4, by - h + 3); c.lineTo(bx + w * 0.3, by); c.closePath(); c.fill();
    }
  }
}
function drawSpores(c, room, t) {
  for (const s of room.spores) {
    const pul = 1 + Math.sin(t * 8 + s.ph) * 0.12;
    if (s.kind === 'core') {
      c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, s.x, s.y + 10, 5, 2); c.fill();
      c.fillStyle = '#3a1048'; circle(c, s.x, s.y, 6.5 * pul);
      c.fillStyle = '#b05aff'; circle(c, s.x, s.y, 4.6 * pul);
      c.fillStyle = '#f0d8ff'; circle(c, s.x - 1.2, s.y - 1.4, 1.6);
    } else {
      c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, s.x, s.y + 9, 6, 2.2); c.fill();
      c.fillStyle = '#2a1430';
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + t * 0.8 + s.ph; circle(c, s.x + Math.cos(a) * 6 * pul, s.y + Math.sin(a) * 6 * pul, 2.4); }
      c.fillStyle = '#5a2a6a'; circle(c, s.x, s.y, 6 * pul);
      c.fillStyle = '#9fbf5a'; for (let i = 0; i < 4; i++) circle(c, s.x + Math.cos(i * 1.7 + s.ph) * 3, s.y + Math.sin(i * 2.3 + s.ph) * 3, 1.1);
      c.fillStyle = '#ffd0ff'; circle(c, s.x - 1.6, s.y - 1.4, 1.2); circle(c, s.x + 1.8, s.y - 1.2, 1.2);
    }
  }
}
function drawBolt(c, v, t) {
  const sp = Math.hypot(v.vx, v.vy) || 1, ux = v.vx / sp, uy = v.vy / sp, L = 18;
  c.strokeStyle = 'rgba(255,74,58,0.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(v.x - ux * L, v.y - uy * L); c.lineTo(v.x, v.y); c.stroke();
  c.strokeStyle = '#ff4a3a'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(v.x - ux * L * 0.8, v.y - uy * L * 0.8); c.lineTo(v.x, v.y); c.stroke();
  c.strokeStyle = '#fff0e8'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(v.x - ux * L * 0.5, v.y - uy * L * 0.5); c.lineTo(v.x + ux * 2, v.y + uy * 2); c.stroke();
}

/* ------------------------------------------------------------------ the Splitter, the Sharpshooter, traits */
function decorateSnake3(c, sn, t) {
  const K = sn.K, pts = sn.pts, n = pts.length;
  if (sn.kind === 'splitter' || sn.kind === 'splitling') {
    // a seam down the back where it will come apart
    c.strokeStyle = K.seam; c.lineWidth = sn.kind === 'splitter' ? 1.8 : 1.2;
    c.beginPath(); c.moveTo(sn.x, sn.y);
    for (let k = 0; k < n; k++) { const p = pts[k]; if (p.hid) break; c.lineTo(p.x, p.y); }
    c.stroke();
    if (sn.kind === 'splitter') {
      c.strokeStyle = 'rgba(220,255,245,0.45)'; c.lineWidth = 0.9;
      for (let k = 1; k < n; k += 2) {
        const p = pts[k]; if (p.hid) continue;
        const [dx, dy] = bodyDir(sn, k), nx = -dy, ny = dx;
        c.beginPath(); c.moveTo(p.x + nx * 2.5 - dx, p.y + ny * 2.5 - dy); c.lineTo(p.x - nx * 2.5 + dx, p.y - ny * 2.5 + dy); c.stroke();
      }
    }
  } else if (sn.kind === 'sniper') {
    c.fillStyle = 'rgba(20,30,10,0.55)';
    for (let k = 1; k < n; k++) {
      const p = pts[k]; if (p.hid) continue;
      const [dx, dy] = bodyDir(sn, k), nx = -dy, ny = dx, s = (k % 2 ? 1 : -1);
      circle(c, p.x + nx * p.r * 0.35 * s, p.y + ny * p.r * 0.35 * s, p.r * 0.32);
    }
  }
}
function headSniper(c, sn, H, out, fill, t) {
  // a long, thin snout like a barrel
  c.fillStyle = out; rrect(c, H * 0.2, -H * 0.24, H * 1.35, H * 0.48, H * 0.2); c.fill();
  c.fillStyle = fill; rrect(c, H * 0.25, -H * 0.16, H * 1.25, H * 0.32, H * 0.14); c.fill();
  c.fillStyle = '#0b1006'; circle(c, H * 1.48, 0, H * 0.13);
  c.fillStyle = out; ell(c, 0, 0, H * 1.05, H * 0.86); c.fill();
  c.fillStyle = fill; ell(c, 0, 0, H * 0.95, H * 0.76); c.fill();
  c.fillStyle = 'rgba(220,240,180,0.18)'; ell(c, -H * 0.2, -H * 0.3, H * 0.4, H * 0.22); c.fill();
  // the eye socket; the eye glows in the light pass
  c.fillStyle = '#0b1006'; circle(c, H * 0.2, 0, H * 0.42);
}
function glowEyes3(c, sn, t, P, loc, lookAt, open) {
  const H = sn.headR;
  if (sn.kind === 'sniper') {
    const aim = sn.mode === 'aim' ? Math.min(1, sn.mt / 0.95) : 0;
    const [x, y] = loc(H * 0.2, 0);
    glowDot(c, x, y, H * (1.6 + aim * 2), '#ff2a2a', (0.4 + aim * 0.45) * open);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = aim > 0 ? '#ffd0c8' : '#ff3b30'; circle(c, x, y, H * 0.3 * Math.max(0.2, open));
    c.fillStyle = '#200404'; circle(c, x + Math.cos(sn.drawAng) * H * 0.08, y + Math.sin(sn.drawAng) * H * 0.08, H * (aim > 0 ? 0.08 : 0.13));
    return;
  }
  // splitters have two pairs of eyes, one for each worm inside
  const pairs = sn.kind === 'splitter' ? [[H * 0.25, H * 0.42], [H * -0.05, H * 0.62]] : [[H * 0.15, H * 0.45]];
  for (const [ex, ey] of pairs) for (const s of [-1, 1]) { const [x, y] = loc(ex, s * ey); glowDot(c, x, y, H * 0.9, sn.K.eye, 0.35 * open); }
  c.globalCompositeOperation = 'source-over';
  for (const [ex, ey] of pairs) for (const s of [-1, 1]) {
    const [x, y] = loc(ex, s * ey);
    c.fillStyle = '#0d1a18'; circle(c, x, y, H * 0.18);
    c.fillStyle = sn.K.eye; ell(c, x, y, H * 0.13, H * 0.13 * open); c.fill();
  }
}
function drawTrait(c, sn, t) {
  if (!sn.trait || sn.burrowed || !sn.alive || sn.state !== 'active') return;
  const H = sn.headR;
  if (sn.trait === 'armor') {
    c.save(); c.translate(sn.x, sn.y); c.rotate(sn.drawAng);
    c.strokeStyle = sn.clank > 0 ? '#ffffff' : '#1a1e24'; c.lineWidth = 5.2;
    c.beginPath(); c.arc(0, 0, H * 1.05, -1.1, 1.1); c.stroke();
    c.strokeStyle = sn.clank > 0 ? '#ffffff' : '#9aa4ae'; c.lineWidth = 3.4;
    c.beginPath(); c.arc(0, 0, H * 1.05, -1.1, 1.1); c.stroke();
    c.fillStyle = '#dfe6ee'; for (const a of [-0.75, 0, 0.75]) circle(c, Math.cos(a) * H * 1.05, Math.sin(a) * H * 1.05, 1.1);
    c.restore();
  } else if (sn.trait === 'swift') {
    const tail = sn.pts[sn.pts.length - 1] || sn;
    const [dx, dy] = sn.pts.length > 1 ? bodyDir(sn, sn.pts.length - 1) : [Math.cos(sn.drawAng), Math.sin(sn.drawAng)];
    c.strokeStyle = 'rgba(255,226,106,0.75)'; c.lineWidth = 1.4;
    for (const s of [-1, 0, 1]) {
      const ox = -dy * s * 4, oy = dx * s * 4, l = 8 + Math.sin(t * 20 + s) * 3;
      c.beginPath(); c.moveTo(tail.x - dx * 6 + ox, tail.y - dy * 6 + oy); c.lineTo(tail.x - dx * (6 + l) + ox, tail.y - dy * (6 + l) + oy); c.stroke();
    }
  } else if (sn.trait === 'spite') {
    const a = 0.35 + 0.3 * Math.sin(t * 7 + sn.blinkSeed);
    c.strokeStyle = `rgba(255,90,60,${a})`; c.lineWidth = 1.2;
    for (let k = 0; k < sn.pts.length; k += 2) { const p = sn.pts[k]; if (!p.hid) { c.beginPath(); c.arc(p.x, p.y, p.r + 1.5, 0, TAU); c.stroke(); } }
  } else if (sn.trait === 'regen') {
    c.strokeStyle = `rgba(143,224,122,${0.35 + 0.2 * Math.sin(t * 5)})`; c.lineWidth = 1.2;
    c.beginPath(); c.arc(sn.x, sn.y, H + 3, 0, TAU); c.stroke();
    c.fillStyle = '#8fe07a'; c.fillRect(sn.x - 1, sn.y - H - 9, 2, 6); c.fillRect(sn.x - 3, sn.y - H - 7, 6, 2);
  }
}

/* ------------------------------------------------------------------ things that need light, and the glow pass */
function extraLights(room, light) {
  const t = G.t;
  extraLights9(room, light);
  if (room.spring && !room.spring.used) light(room.spring.x, room.spring.y, 90, 0.7);
  if (room.slot) light(room.slot.x, room.slot.y - 14, room.slot.broken ? 50 : 84, 0.7);
  for (const b of room.books) light(b.x, b.y - 8, 52, 0.5);
  for (const s of room.spores) light(s.x, s.y, 34, 0.45);
  for (const u of room.turrets) light(u.x, u.y - 12, 34, 0.4);
  for (const p of room.pickups) if (p.kind === 'key' || p.kind === 'cleanse' || p.kind === 'reroll') light(p.x, p.y, 50, 0.55);
  if (room.surv && room.surv.on && !room.cleared && room.altar) light(room.altar.x, room.altar.y, 80, 0.6 + 0.1 * Math.sin(t * 6));
}
function drawGlow3(c, room, t) {
  drawGlow9(c, room, t);
  c.globalCompositeOperation = 'lighter';
  for (const s of room.spores) glowDot(c, s.x, s.y, s.kind === 'core' ? 26 : 20, s.kind === 'core' ? '#b05aff' : '#9a5ac0', 0.35);
  if (room.spring && !room.spring.used) glowDot(c, room.spring.x, room.spring.y, 46, '#7ce0f0', 0.18 + 0.05 * Math.sin(t * 2));
  if (room.slot && !room.slot.broken) glowDot(c, room.slot.x, room.slot.y - 28, 30, '#ffd27a', room.slot.spin > 0 ? 0.35 : 0.15);
  for (const b of room.books) glowDot(c, b.x, b.y - 10, 24, '#b05aff', 0.16 + 0.06 * Math.sin(t * 3 + b.c));
  for (const p of room.pickups) if (p.kind === 'key') glowDot(c, p.x, p.y - 4, 22, '#ffd27a', 0.3);
  // a Sharpshooter's line through the dark
  for (const sn of room.snakes) {
    if (sn.kind !== 'sniper' || sn.mode !== 'aim' || !sn.alive || sn.dying > 0) continue;
    const u = clamp(sn.mt / 0.95, 0, 1), [ex, ey] = sniperLineEnd(room, sn);
    c.strokeStyle = `rgba(255,40,30,${0.18 + 0.5 * u})`; c.lineWidth = 1 + u * 2.2;
    if (u < 0.5) c.setLineDash([6, 5]);
    c.beginPath(); c.moveTo(sn.x + Math.cos(sn.aimA) * sn.headR, sn.y + Math.sin(sn.aimA) * sn.headR); c.lineTo(ex, ey); c.stroke();
    c.setLineDash([]);
    glowDot(c, ex, ey, 10 + u * 8, '#ff3a2a', 0.3 + 0.3 * u);
  }
  c.globalCompositeOperation = 'source-over';
}
function drawFloorThings(c, room, t) {
  drawFloorThings9(c, room, t);
  if (room.sap.length) drawSap(c, room, t);
  if (room.cracks.length) drawCracks(c, room, t);
  if (room.spring) drawSpring(c, room, t);
}
// under the apple: roots that hold it, and the dash getting ready
function drawPlayerUnder3(c, P, t) {
  if (P.rootT > 0) {
    c.fillStyle = '#2a1408';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + 0.4, bx = P.x + Math.cos(a) * 10, by = P.y + 10 + Math.sin(a) * 4;
      c.beginPath(); c.moveTo(bx - 2.4, by + 1); c.quadraticCurveTo(bx, by - 8, P.x + Math.cos(a) * 5, P.y - 2); c.lineTo(bx + 2.4, by + 1); c.closePath(); c.fill();
    }
  }
  if (P.dash) {
    const f = P.dashCd > 0 ? 1 - P.dashCd / 1.5 : 1;
    c.strokeStyle = f >= 1 ? `rgba(255,214,120,${0.4 + 0.15 * Math.sin(t * 4)})` : 'rgba(255,214,120,0.3)'; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(P.x, P.y + 12, 13, 4.6, 0, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.stroke();
  }
}

/* ------------------------------------------------------------------ the HUD: powerups, curses and downgrades in one row */
function hudThings(P) { return P.items.concat(P.curses, P.downs); }
function drawThingSlot(c, P, id, ix, iy, sz, t) {
  const X = thingInfo(id) || {};
  if (X.rare) { c.fillStyle = 'rgba(255,170,60,0.16)'; rrect(c, ix, iy, sz, sz, 4); c.fill(); c.strokeStyle = 'rgba(255,180,70,0.7)'; c.lineWidth = 1; rrect(c, ix + 0.5, iy + 0.5, sz - 1, sz - 1, 4); c.stroke(); }
  else if (X.curse) { c.fillStyle = 'rgba(176,90,255,0.18)'; rrect(c, ix, iy, sz, sz, 4); c.fill(); c.strokeStyle = 'rgba(196,138,240,0.8)'; c.lineWidth = 1; rrect(c, ix + 0.5, iy + 0.5, sz - 1, sz - 1, 4); c.stroke(); }
  else if (X.down) { c.fillStyle = 'rgba(20,10,14,0.7)'; rrect(c, ix, iy, sz, sz, 4); c.fill(); c.strokeStyle = 'rgba(232,58,80,0.55)'; c.lineWidth = 1; rrect(c, ix + 0.5, iy + 0.5, sz - 1, sz - 1, 4); c.stroke(); }
  else { c.fillStyle = 'rgba(236,226,212,0.06)'; rrect(c, ix, iy, sz, sz, 4); c.fill(); }
  c.save(); c.translate(ix + sz / 2, iy + sz / 2);
  if ((id === 'toffee' && !P.shellUp) || (id === 'phoenix' && P.phoenixUsed) || (id === 'dash' && P.dashCd > 0)) c.globalAlpha = 0.35;
  drawItemIcon(c, id, sz - 3, t);
  c.restore();
}

/* ------------------------------------------------------------------ the info card */
const InfoCard = { a: 0, key: null, data: null };
function wrapText(c, txt, w) {
  const words = String(txt).split(' '), out = [];
  let line = '';
  for (const wd of words) {
    const test = line ? line + ' ' + wd : wd;
    if (line && c.measureText(test).width > w) { out.push(line); line = wd; } else line = test;
  }
  if (line) out.push(line);
  return out;
}
function renderInfoCard(c, dt) {
  const on = Save.data.settings.info !== false && G.state === 'play';
  const tgt = on ? infoTarget() : null;
  const k = Math.min(1, (dt || 1 / 60) * 9);
  if (tgt) {
    if (tgt.key !== InfoCard.key) { InfoCard.key = tgt.key; InfoCard.a = Math.min(InfoCard.a, 0.25); }
    InfoCard.data = tgt; InfoCard.a = Math.min(1, InfoCard.a + k);
  } else InfoCard.a = Math.max(0, InfoCard.a - k * 1.4);
  const d = InfoCard.data;
  if (!d || InfoCard.a <= 0.02) return;
  c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  // on a tall phone screen the card sits in the free space under the room instead of over it
  const docked = View.portrait && HudStats.pBottom && View.H - HudStats.pBottom > 170;
  const W = docked ? Math.min(360, View.W - 24) : Math.min(264, View.W - 24), pad = 10, inner = W - pad * 2, lh = 15;
  c.font = `500 13px ${HUD_FONT}`;
  const body = wrapText(c, d.body, inner);
  const notes = [];
  for (const [txt, col] of d.notes || []) for (const ln of wrapText(c, txt, inner)) notes.push([ln, col]);
  const H = pad + 18 + 5 + body.length * lh + (notes.length ? 6 + notes.length * lh : 0) + pad - 3;
  const [sx, sy] = View.toScreen(d.x, d.y);
  let x, y;
  if (docked) { x = (View.W - W) / 2; y = Math.min(HudStats.pBottom + 6, View.H - H - 8); }
  else {
    const P = G.player, above = !P || P.y >= d.y - 4;
    const gap = 24 * View.s;
    y = above ? sy - gap - H : sy + gap + 16 * View.s;
    if (y < 6) y = sy + gap + 16 * View.s;
    if (y + H > View.H - 6) y = sy - gap - H;
    y = clamp(y, 6, Math.max(6, View.H - H - 6));
    x = clamp(sx - W / 2, 10, Math.max(10, View.W - W - 10));
  }
  c.globalAlpha = InfoCard.a;
  // a little pointer toward the thing
  if (!docked) {
    const tipX = clamp(sx, x + 14, x + W - 14), tipUp = y > sy;
    c.fillStyle = 'rgba(14,9,9,0.94)';
    c.beginPath();
    if (tipUp) { c.moveTo(tipX - 7, y + 1); c.lineTo(tipX, y - 7); c.lineTo(tipX + 7, y + 1); }
    else { c.moveTo(tipX - 7, y + H - 1); c.lineTo(tipX, y + H + 7); c.lineTo(tipX + 7, y + H - 1); }
    c.closePath(); c.fill();
  }
  c.fillStyle = 'rgba(14,9,9,0.94)'; rrect(c, x, y, W, H, 7); c.fill();
  c.strokeStyle = rgba(d.tagCol, 0.55); c.lineWidth = 1; rrect(c, x + 0.5, y + 0.5, W - 1, H - 1, 7); c.stroke();
  c.textBaseline = 'middle'; c.textAlign = 'left';
  c.font = `700 10px ${HUD_FONT}`;
  const tw = c.measureText(d.tag).width + 12;
  c.fillStyle = rgba(d.tagCol, 0.18); rrect(c, x + W - pad - tw, y + pad, tw, 15, 7.5); c.fill();
  c.fillStyle = d.tagCol; c.fillText(d.tag, x + W - pad - tw + 6, y + pad + 8);
  let fs = 16;
  c.font = `700 ${fs}px ${HUD_FONT}`;
  while (fs > 11 && c.measureText(d.title).width > inner - tw - 8) { fs--; c.font = `700 ${fs}px ${HUD_FONT}`; }
  c.fillStyle = '#ece2d4';
  c.fillText(d.title, x + pad, y + pad + 8.5);
  let ty = y + pad + 18 + 5 + lh / 2;
  c.font = `500 13px ${HUD_FONT}`; c.fillStyle = 'rgba(236,226,212,0.86)';
  for (const ln of body) { c.fillText(ln, x + pad, ty); ty += lh; }
  if (notes.length) {
    ty += 2;
    c.fillStyle = 'rgba(236,226,212,0.1)'; c.fillRect(x + pad, ty - lh / 2 - 2, inner, 1);
    ty += 4;
    c.font = `600 13px ${HUD_FONT}`;
    for (const [ln, col] of notes) { c.fillStyle = col; c.fillText(ln, x + pad, ty); ty += lh; }
  }
  c.globalAlpha = 1;
}

