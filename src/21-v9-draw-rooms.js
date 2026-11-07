/* src/21-v9-draw-rooms.js: v9 drawing: new rooms, club, tankstation, floors, glow, minimap. From v9. Lines 12477 to 13121 of the v13.7 script. */
/* =====================================================================
   Version 9 drawing: the new rooms, the club, the tankstation, the
   kapsalon, the courtroom, the second story's floors, and everything
   that moves or glows in them
   ===================================================================== */
const STATIC9 = {};
const DYN9 = {};
const ROCK9 = {};
const URN9 = {};
const VENOM9 = {};
const DRAWPICK9 = {};
const MINI9 = {};
const NEON9 = ['#ff3ad8', '#3ad8ff', '#d8ff3a', '#ffb43a', '#b05aff'];
const FUEL_PRICES = ['2,19', '1,94', '0,99', '2,07', '0,89'];

function hash9(a, b, c2) { let h = (a * 73856093) ^ (b * 19349663) ^ ((c2 || 0) * 83492791); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function clubRoom9(room) { return room.theme === 'club' || room.theme === 'hell'; }

/* ------------------------------------------------------------------ floors */
function floorTiles9(c, room, L, rng) {
  const club = clubRoom9(room);
  if (club || L.deco === 'rave') {
    const hell = room.theme === 'hell';
    c.fillStyle = hell ? '#0c0204' : '#0a0710'; c.fillRect(0, 0, RW, RH);
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const x = col * T, y = r * T;
      rrect(c, x + 1.5, y + 1.5, T - 3, T - 3, 3); c.fillStyle = (r + col) % 2 ? (hell ? '#1a0608' : '#140e1c') : (hell ? '#140406' : '#100b16'); c.fill();
      c.strokeStyle = hell ? 'rgba(255,60,40,0.12)' : 'rgba(255,58,216,0.1)'; c.lineWidth = 1; c.stroke();
    }
    return true;
  }
  if (room.type === 'tank') {
    c.fillStyle = '#4a4e56'; c.fillRect(0, 0, RW, RH);
    for (let r = 0; r < ROWS; r += 2) for (let col = 0; col < COLS; col += 2) {
      c.fillStyle = rng() < 0.5 ? '#565a62' : '#50545c'; c.fillRect(col * T + 1, r * T + 1, T * 2 - 2, T * 2 - 2);
    }
    return true;
  }
  if (room.type === 'kapper') {
    for (let r = 0; r < ROWS * 2; r++) for (let col = 0; col < COLS * 2; col++) { c.fillStyle = (r + col) % 2 ? '#e8e4dc' : '#1e1e22'; c.fillRect(col * T / 2, r * T / 2, T / 2, T / 2); }
    return true;
  }
  if (room.type === 'courtroom' || L.deco === 'court') {
    c.fillStyle = L.deco === 'court' ? L.grout : '#24170d'; c.fillRect(0, 0, RW, RH);
    const a = L.deco === 'court' ? L.floor : '#5a3a24', b = L.deco === 'court' ? L.floor2 : '#4e321f';
    for (let y = 0; y < RH; y += 10) for (let x = -20 + ((y / 10) % 2) * 20; x < RW; x += 40) {
      c.fillStyle = rng() < 0.5 ? a : b;
      c.fillRect(x + 1, y + 1, 38, 8);
    }
    return true;
  }
  if (L.deco === 'bus') {
    c.fillStyle = L.floor; c.fillRect(0, 0, RW, RH);
    for (let i = 0; i < 900; i++) { c.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.12)'; c.fillRect(rng() * RW, rng() * RH, 1.5, 1.5); }
    // the pavement along the walls
    c.fillStyle = '#4a4e56';
    c.fillRect(0, 0, RW, T * 0.8); c.fillRect(0, RH - T * 0.8, RW, T * 0.8);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
    for (let x = 0; x < RW; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, T * 0.8); c.moveTo(x, RH - T * 0.8); c.lineTo(x, RH); c.stroke(); }
    c.fillStyle = '#8a8e96'; c.fillRect(0, T * 0.8 - 3, RW, 3); c.fillRect(0, RH - T * 0.8, RW, 3);
    return true;
  }
  return false;
}
function floorDeco9(c, room, L, rng) {
  if (clubRoom9(room) || L.deco === 'rave') {
    for (let i = 0; i < 70; i++) { c.fillStyle = rgba(NEON9[Math.floor(rng() * NEON9.length)], 0.5); c.save(); c.translate(rng() * RW, rng() * RH); c.rotate(rng() * TAU); c.fillRect(-2, -1, 4, 2); c.restore(); }
    for (let i = 0; i < 4; i++) { const x = 30 + rng() * (RW - 60), y = 30 + rng() * (RH - 60); c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, x + 1, y + 2, 4, 2); c.fill(); c.fillStyle = '#c82630'; c.beginPath(); c.moveTo(x - 4, y - 5); c.lineTo(x + 4, y - 5); c.lineTo(x + 3, y + 3); c.lineTo(x - 3, y + 3); c.closePath(); c.fill(); c.fillStyle = '#f2ecd8'; c.fillRect(x - 4, y - 5, 8, 1.5); }
    for (let i = 0; i < 3; i++) { c.save(); c.translate(30 + rng() * (RW - 60), 30 + rng() * (RH - 60)); c.rotate(rng() * TAU); c.strokeStyle = rgba(NEON9[i], 0.6); c.lineWidth = 2.2; c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.stroke(); c.restore(); }
    return true;
  }
  if (room.type === 'tank') {
    c.strokeStyle = 'rgba(242,194,0,0.55)'; c.lineWidth = 3;
    for (const x of [T * 3.5, T * 6.5]) { c.beginPath(); c.moveTo(x, T * 1.2); c.lineTo(x, T * 4.2); c.stroke(); }
    c.fillStyle = 'rgba(242,242,236,0.5)'; c.font = `800 16px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STOP', RW / 2, T * 4.6);
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(10,10,14,0.35)'; ell(c, 30 + rng() * (RW - 60), 30 + rng() * (RH - 60), 8 + rng() * 14, 5 + rng() * 8, rng() * 3); c.fill(); c.fillStyle = 'rgba(120,80,200,0.08)'; ell(c, 30 + rng() * (RW - 60), 30 + rng() * (RH - 60), 6, 3, rng() * 3); c.fill(); }
    c.strokeStyle = 'rgba(20,20,24,0.35)'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, RH * 0.75); c.quadraticCurveTo(RW * 0.4, RH * 0.6, RW, RH * 0.8); c.stroke();
    return true;
  }
  if (room.type === 'kapper') {
    c.fillStyle = 'rgba(120,20,30,0.85)'; ell(c, RW / 2, RH / 2 + 6, 62, 46); c.fill();
    c.strokeStyle = 'rgba(214,170,80,0.6)'; c.lineWidth = 2; ell(c, RW / 2, RH / 2 + 6, 56, 40); c.stroke();
    c.fillStyle = 'rgba(40,24,12,0.8)'; for (let i = 0; i < 40; i++) { const a = rng() * TAU, r = 20 + rng() * 40; c.save(); c.translate(RW / 2 + Math.cos(a) * r, RH / 2 + 6 + Math.sin(a) * r * 0.75); c.rotate(rng() * TAU); c.fillRect(-2, -0.4, 4, 0.8); c.restore(); }
    return true;
  }
  if (room.type === 'courtroom') {
    c.fillStyle = '#7a1a20'; c.fillRect(RW / 2 - 34, T * 4.2, 68, RH - T * 4.2);
    c.strokeStyle = 'rgba(214,170,80,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(RW / 2 - 31, T * 4.2); c.lineTo(RW / 2 - 31, RH); c.moveTo(RW / 2 + 31, T * 4.2); c.lineTo(RW / 2 + 31, RH); c.stroke();
    return true;
  }
  if (L.deco === 'bus') {
    c.strokeStyle = 'rgba(232,200,74,0.55)'; c.lineWidth = 3; c.setLineDash([16, 12]);
    c.beginPath(); c.moveTo(0, RH / 2); c.lineTo(RW, RH / 2); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(232,232,226,0.4)'; c.font = `800 22px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.save(); c.translate(RW * 0.25 + rng() * RW * 0.5, RH / 2 + (rng() < 0.5 ? -26 : 26)); c.fillText('BUS', 0, 0); c.restore();
    for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(20,30,50,0.45)'; ell(c, 40 + rng() * (RW - 80), 50 + rng() * (RH - 100), 14 + rng() * 18, 6 + rng() * 8, rng() * 0.5); c.fill(); c.fillStyle = 'rgba(180,200,230,0.08)'; ell(c, 40 + rng() * (RW - 80), 50 + rng() * (RH - 100), 8, 3, 0); c.fill(); }
    for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(232,226,210,0.5)'; c.save(); c.translate(rng() * RW, rng() * RH); c.rotate(rng() * TAU); c.fillRect(-2, -0.6, 4, 1.2); c.restore(); }
    return true;
  }
  if (L.deco === 'court') {
    for (let i = 0; i < 5; i++) { c.save(); c.translate(30 + rng() * (RW - 60), 30 + rng() * (RH - 60)); c.rotate(rng() * TAU); c.fillStyle = 'rgba(232,226,208,0.35)'; c.fillRect(-6, -8, 12, 16); c.fillStyle = 'rgba(40,40,60,0.3)'; for (let k = 0; k < 4; k++) c.fillRect(-4, -5 + k * 3, 8, 0.8); c.restore(); }
    c.fillStyle = 'rgba(122,26,32,0.6)'; c.fillRect(RW / 2 - 26, 0, 52, RH);
    return true;
  }
  return false;
}
const NOBONES9 = { tank: 1, kapper: 1, courtroom: 1, club: 1, hell: 1 };

/* ------------------------------------------------------------------ walls */
function wallCol9(room, L) {
  if (room.theme === 'club') return '#140a1c';
  if (room.theme === 'hell') return '#1c0406';
  if (room.type === 'tank') return '#2c3a30';
  if (room.type === 'kapper') return '#cfc8b8';
  if (room.type === 'courtroom') return '#4a3424';
  return null;
}
function wallText9(c, txt, x, y, size, col, rot) {
  txt = sayF9(txt);
  c.save(); c.translate(x, y); if (rot) c.rotate(rot);
  c.font = `800 ${size}px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(txt, 0, 0);
  c.restore();
}
function drawWalls9(c, room, L, rng) {
  const door = (k) => !!room.doors[k];
  if (clubRoom9(room)) {
    const hell = room.theme === 'hell';
    c.strokeStyle = hell ? 'rgba(255,60,40,0.75)' : 'rgba(255,58,216,0.75)'; c.lineWidth = 2;
    for (const [x0, x1] of [[-4, RW / 2 - 36], [RW / 2 + 36, RW + 4]]) { c.beginPath(); c.moveTo(x0, -3); c.lineTo(x1, -3); c.moveTo(x0, RH + 3); c.lineTo(x1, RH + 3); c.stroke(); }
    c.strokeStyle = hell ? 'rgba(255,170,40,0.75)' : 'rgba(58,216,255,0.75)';
    for (const [y0, y1] of [[-4, RH / 2 - 36], [RH / 2 + 36, RH + 4]]) { c.beginPath(); c.moveTo(-3, y0); c.lineTo(-3, y1); c.moveTo(RW + 3, y0); c.lineTo(RW + 3, y1); c.stroke(); }
    const d = room.clubDoor || 's', far = OPP[d];
    const txt = hell ? 'HELLCLUB' : 'DJ MANU-BEAU', col = hell ? '#ff5a3a' : '#ff7af0';
    if (far === 'n') wallText9(c, txt, RW * 0.25, -WALL / 2, 11, col);
    else if (far === 's') wallText9(c, txt, RW * 0.25, RH + WALL / 2, 11, col);
    else if (far === 'w') wallText9(c, txt, -WALL / 2, RH * 0.25, 11, col, -Math.PI / 2);
    else wallText9(c, txt, RW + WALL / 2, RH * 0.25, 11, col, Math.PI / 2);
    return;
  }
  if (room.type === 'tank') {
    // the canopy along the north wall
    // v10.6: leave the doorway free when a room hangs above, so the door sits on top of the canopy
    const cSegs = door('n') ? [[-WALL, RW / 2 - DOOR_HW - 9], [RW / 2 + DOOR_HW + 9, RW + WALL]] : [[-WALL, RW + WALL]];
    for (const [a0, a1] of cSegs) {
      c.fillStyle = '#1f7a3a'; c.fillRect(a0, -WALL + 3, a1 - a0, WALL - 8);
      c.fillStyle = '#f2c230'; c.fillRect(a0, -8, a1 - a0, 4);
    }
    if (!door('n')) wallText9(c, 'BP TANKSTATION', RW / 2, -WALL / 2 - 1, 13, '#ffffff');
    else { wallText9(c, 'BP', RW * 0.22, -WALL / 2 - 1, 13, '#ffffff'); wallText9(c, 'TANKSTATION', RW * 0.78, -WALL / 2 - 1, 12, '#ffffff'); }
    // the price board on the west wall
    c.save(); c.translate(-WALL / 2, RH * 0.22); c.rotate(-Math.PI / 2);
    c.fillStyle = '#16181c'; c.fillRect(-34, -9, 68, 18);
    c.fillStyle = '#7cff7a'; c.font = `700 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(`98 ${FUEL_PRICES[0]}   D ${FUEL_PRICES[1]}`, 0, -3); c.fillText(`LPG ${FUEL_PRICES[2]}   AD ${FUEL_PRICES[4]}`, 0, 4);
    c.restore();
    // shop windows on the south wall
    for (const x of [40, 110, 330, 400]) { c.fillStyle = 'rgba(160,210,240,0.35)'; c.fillRect(x - 26, RH + 5, 52, WALL - 10); c.strokeStyle = '#1a2a20'; c.lineWidth = 1.5; c.strokeRect(x - 26, RH + 5, 52, WALL - 10); }
    return;
  }
  if (room.type === 'kapper') {
    for (const x of [70, 150, 290, 370]) { c.fillStyle = '#8a8e96'; c.fillRect(x - 22, -WALL + 4, 44, WALL - 8); c.fillStyle = 'rgba(200,225,240,0.7)'; c.fillRect(x - 20, -WALL + 6, 40, WALL - 12); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x - 14, -WALL + 7, 4, WALL - 14); }
    if (!door('s')) wallText9(c, 'KAPSALON', RW / 2, RH + WALL / 2, 12, '#2a2a30');
    // the barber pole
    const px = RW + WALL / 2, py = RH * 0.2;
    c.fillStyle = '#f2f0ea'; rrect(c, px - 5, py - 16, 10, 32, 4); c.fill();
    c.save(); c.beginPath(); c.rect(px - 5, py - 16, 10, 32); c.clip();
    for (let i = -4; i < 6; i++) { c.fillStyle = i % 2 ? '#c3243a' : '#1a4ab0'; c.beginPath(); c.moveTo(px - 5, py - 16 + i * 8); c.lineTo(px + 5, py - 22 + i * 8); c.lineTo(px + 5, py - 18 + i * 8); c.lineTo(px - 5, py - 12 + i * 8); c.closePath(); c.fill(); }
    c.restore();
    return;
  }
  if (room.type === 'courtroom') {
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1;
    for (let x = -WALL + 16; x < RW + WALL; x += 32) { c.beginPath(); c.moveTo(x, -WALL + 3); c.lineTo(x, -3); c.moveTo(x, RH + 3); c.lineTo(x, RH + WALL - 3); c.stroke(); }
    const x = RW * 0.22, y = -WALL / 2;
    c.strokeStyle = '#d8b46a'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x, y + 7); c.moveTo(x - 10, y - 5); c.lineTo(x + 10, y - 5); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 10, y - 5); c.lineTo(x + s * 7, y + 1); c.lineTo(x + s * 13, y + 1); c.closePath(); c.stroke(); }
    wallText9(c, 'RECHTBANK', RW * 0.78, -WALL / 2, 10, '#d8b46a');
    return;
  }
  if (L.deco === 'bus') {
    for (const x of [60, 150, 290, 380]) { c.fillStyle = 'rgba(160,200,230,0.22)'; c.fillRect(x - 28, -WALL + 4, 56, WALL - 8); c.strokeStyle = '#1a1f26'; c.lineWidth = 1.5; c.strokeRect(x - 28, -WALL + 4, 56, WALL - 8); }
    c.fillStyle = '#e8c84a'; c.fillRect(RW * 0.12 - 9, RH + 6, 18, 14); wallText9(c, '34', RW * 0.12, RH + 13, 9, '#16181c');
    c.fillStyle = '#e8c84a'; c.fillRect(RW * 0.88 - 9, RH + 6, 18, 14); wallText9(c, '36', RW * 0.88, RH + 13, 9, '#16181c');
  } else if (L.deco === 'rave') {
    c.strokeStyle = 'rgba(255,58,216,0.5)'; c.lineWidth = 1.6;
    for (const [x0, x1] of [[-4, RW / 2 - 36], [RW / 2 + 36, RW + 4]]) { c.beginPath(); c.moveTo(x0, -3); c.lineTo(x1, -3); c.moveTo(x0, RH + 3); c.lineTo(x1, RH + 3); c.stroke(); }
  } else if (L.deco === 'court') {
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
    for (let x = -WALL + 16; x < RW + WALL; x += 32) { c.beginPath(); c.moveTo(x, -WALL + 3); c.lineTo(x, -3); c.moveTo(x, RH + 3); c.lineTo(x, RH + WALL - 3); c.stroke(); }
  }
}
function drawHellWall9(c, link, L) {
  c.save(); doorTransform(c, link.k);
  const dmg = 4 - link.hp;
  c.strokeStyle = 'rgba(120,10,16,0.9)'; c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(-6, -WALL + 2); c.lineTo(-2, -WALL * 0.55); c.lineTo(-8, -WALL * 0.3); c.lineTo(-3, -1);
  c.moveTo(-2, -WALL * 0.55); c.lineTo(7, -WALL * 0.45); c.lineTo(10, -WALL * 0.15);
  if (dmg >= 1) { c.moveTo(-8, -WALL * 0.3); c.lineTo(-16, -WALL * 0.25); c.lineTo(-19, -WALL * 0.6); }
  if (dmg >= 2) { c.moveTo(7, -WALL * 0.45); c.lineTo(15, -WALL * 0.75); c.moveTo(10, -WALL * 0.15); c.lineTo(17, -2); }
  if (dmg >= 3) { c.moveTo(-16, -WALL * 0.25); c.lineTo(-14, -2); c.moveTo(15, -WALL * 0.75); c.lineTo(20, -WALL * 0.4); }
  c.stroke();
  c.fillStyle = 'rgba(200,30,30,0.5)'; c.fillRect(-1, -WALL * 0.58, 3, 3);
  c.restore();
}

/* ------------------------------------------------------------------ things on the floor that never move */
function bevel9(c, x, y, w, h, out, fill, r = 3) {
  c.fillStyle = 'rgba(0,0,0,0.42)'; rrect(c, x + 3, y + 5, w, h, r); c.fill();
  c.fillStyle = out; rrect(c, x, y, w, h, r); c.fill();
  c.fillStyle = fill; rrect(c, x + 1.5, y + 1.5, w - 3, h - 3, Math.max(1, r - 1)); c.fill();
}
STATIC9.bench = (c, o) => {
  const x = o.c * T, y = o.y - 9;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 5, T, 20);
  c.fillStyle = '#2a1a10'; c.fillRect(x, y, T, 20);
  c.fillStyle = '#8a5a34'; c.fillRect(x + 1, y + 6, T - 2, 13);
  c.fillStyle = '#6a4224'; c.fillRect(x + 1, y + 1, T - 2, 5);
  c.strokeStyle = 'rgba(40,20,8,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 2, y + 12); c.lineTo(x + T - 2, y + 12); c.stroke();
};
STATIC9.judge = (c, o) => {
  const x = o.c * T, y = o.r * T + 2;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 6, T, T - 4);
  c.fillStyle = '#2a170a'; c.fillRect(x, y, T, T - 4);
  const g = c.createLinearGradient(x, y, x, y + T); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#5a3a20');
  c.fillStyle = g; c.fillRect(x + 1, y + 1, T - 2, T - 6);
  c.fillStyle = '#3a2412'; c.fillRect(x + 1, y + T - 12, T - 2, 6);
  if (o.c === 5) {
    c.fillStyle = '#d8b46a'; c.fillRect(o.x - 13, y + 12, 26, 8); c.fillStyle = '#2a170a'; c.font = `700 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KANTONRECHTER', o.x, y + 16.5);
    c.fillStyle = '#5a3a20'; rrect(c, o.x + 8, y + 3, 12, 6, 2); c.fill();
  } else { c.fillStyle = '#f2f0ea'; c.fillRect(o.x - 6, y + 5, 12, 9); c.fillStyle = 'rgba(40,40,60,0.4)'; for (let k = 0; k < 3; k++) c.fillRect(o.x - 4, y + 7 + k * 2.4, 8, 0.7); }
};
STATIC9.crate = (c, o, room, L, rng) => {
  const x = o.x - 17, y = o.y - 15;
  bevel9(c, x, y, 34, 30, '#3a2410', '#a8783e', 2);
  c.strokeStyle = 'rgba(60,36,14,0.6)'; c.lineWidth = 1; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x + 2, y + i * 10); c.lineTo(x + 32, y + i * 10); c.stroke(); }
  const kind = Math.floor(rng() * 4);
  const col = ['#7ac03a', '#f08a2c', '#e83a40', '#f2d24a'][kind];
  for (let i = 0; i < 6; i++) { const fx = x + 7 + (i % 3) * 10, fy = y + 8 + Math.floor(i / 3) * 12; c.fillStyle = mixHex(col, '#000000', 0.25); circle(c, fx + 0.8, fy + 0.8, 4.6); c.fillStyle = col; circle(c, fx, fy, 4.4); c.fillStyle = 'rgba(255,255,255,0.35)'; circle(c, fx - 1.4, fy - 1.4, 1.3); }
  if (room.store) { c.fillStyle = room.store === 'blue' ? '#167fb4' : '#f2c200'; c.fillRect(x + 22, y + 24, 12, 6); c.fillStyle = room.store === 'blue' ? '#ffffff' : '#151515'; c.font = `700 5px ${UIF}`; c.textAlign = 'center'; c.fillText('VERS', x + 28, y + 28.5); }
};
STATIC9.bread = (c, o, room, L, rng) => {
  const x = o.x - 18, y = o.y - 16;
  bevel9(c, x, y, 36, 32, '#2a1a10', '#6a4a2a', 2);
  for (let i = 0; i < 4; i++) {
    const bx = x + 9 + (i % 2) * 18, by = y + 9 + Math.floor(i / 2) * 14;
    c.fillStyle = '#5a3414'; ell(c, bx + 0.6, by + 0.8, 7.5, 5); c.fill();
    c.fillStyle = i === 3 ? '#e8c890' : '#c88a44'; ell(c, bx, by, 7, 4.6); c.fill();
    c.strokeStyle = 'rgba(80,40,10,0.6)'; c.lineWidth = 0.9; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(bx + k * 3 - 1.5, by - 2.5); c.lineTo(bx + k * 3 + 1.5, by + 2.5); c.stroke(); }
  }
};
STATIC9.checkout = (c, o, room) => {
  const x = o.x - 14, y = o.y - 18;
  bevel9(c, x, y, 28, 36, '#20232a', '#d8dce2', 2);
  c.fillStyle = '#16181c'; c.fillRect(x + 4, y + 3, 9, 30);
  c.fillStyle = '#3a3e46'; for (let i = 0; i < 6; i++) c.fillRect(x + 4, y + 5 + i * 5, 9, 1);
  c.fillStyle = '#2a2e36'; rrect(c, x + 16, y + 6, 9, 8, 1.5); c.fill(); c.fillStyle = '#5fd06a'; c.fillRect(x + 17.5, y + 7.5, 6, 3);
  c.fillStyle = room.store === 'yellow' ? '#c9a000' : '#167fb4'; c.fillRect(x + 1.5, y + 32, 25, 2.5);
};
STATIC9.bottles = (c, o) => {
  const x = o.x - 13, y = o.y - 17;
  bevel9(c, x, y, 26, 34, '#20232a', '#9aa2ae', 3);
  c.fillStyle = '#16181c'; circle(c, o.x, y + 12, 6.5); c.fillStyle = '#3a3e46'; circle(c, o.x, y + 12, 4);
  c.fillStyle = '#5fd06a'; circle(c, o.x + 7, y + 26, 2);
  c.fillStyle = '#e8e2d0'; c.fillRect(x + 4, y + 22, 10, 7); c.fillStyle = '#1aa0e0'; c.fillRect(x + 4, y + 22, 10, 2);
};
STATIC9.freezer = (c, o) => {
  const x = o.x - 18, y = o.y - 15;
  bevel9(c, x, y, 36, 30, '#5a6068', '#e8eef2', 3);
  c.fillStyle = 'rgba(150,200,240,0.55)'; rrect(c, x + 4, y + 4, 28, 22, 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.65)'; c.fillRect(x + 6, y + 6, 3, 18);
  for (let i = 0; i < 3; i++) { c.fillStyle = PRODUCT_COLS[(o.c * 5 + o.r * 3 + i) % PRODUCT_COLS.length]; c.fillRect(x + 12 + i * 6, y + 10 + (i % 2) * 6, 5, 7); }
};
STATIC9.till = (c, o, room) => {
  const x = o.x - T / 2, y = o.y - T / 2 + 5, w = T, h = T - 10;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 5, w, h);
  c.fillStyle = '#1a2a20'; c.fillRect(x, y, w, h);
  c.fillStyle = '#d8dce2'; c.fillRect(x, y, w, h - 6);
  c.fillStyle = '#1f7a3a'; c.fillRect(x, y + h - 6, w, 6);
  if (o.main) {
    c.fillStyle = '#2a2e36'; rrect(c, o.x - 9, y + 2, 18, 13, 2); c.fill();
    c.fillStyle = '#7cff7a'; c.fillRect(o.x - 6, y + 4, 12, 4);
    c.fillStyle = '#9aa2ae'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c.fillRect(o.x - 6 + i * 4.4, y + 9.5 + j * 2.6, 3, 1.8);
    c.fillStyle = '#16181c'; c.font = `700 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KASSA', o.x, y + 21);
  } else {
    for (let i = 0; i < 6; i++) { c.fillStyle = PRODUCT_COLS[(i * 3 + 1) % PRODUCT_COLS.length]; c.fillRect(x + 4 + (i % 3) * 11, y + 3 + Math.floor(i / 3) * 9, 9, 7); }
  }
};
ROCK9.shelter = (c, o, rng, L) => {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 3, y + 12, 18, 6); c.fill();
  if ((o.c + o.r) % 2) {
    // a glass panel
    c.fillStyle = '#1a1f26'; rrect(c, x - 17, y - 7, 34, 14, 2); c.fill();
    c.fillStyle = 'rgba(160,200,230,0.45)'; c.fillRect(x - 15, y - 5, 30, 10);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 12, y - 4, 2, 8);
    c.fillStyle = '#e8c84a'; c.fillRect(x + 4, y - 4, 8, 8); c.fillStyle = '#16181c'; c.font = `800 5px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(['34', '36', '31'][(o.c + o.r) % 3], x + 8, y + 0.5);
  } else {
    // a bin and a bus stop pole
    c.fillStyle = '#5a5e66'; circle(c, x, y, 5); c.fillStyle = '#8a8e96'; circle(c, x - 1, y - 1, 3.5);
    c.fillStyle = '#16181c'; rrect(c, x - 13, y - 13, 26, 12, 2); c.fill();
    c.fillStyle = '#e8c84a'; rrect(c, x - 12, y - 12, 24, 10, 1.5); c.fill();
    c.fillStyle = '#16181c'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS', x, y - 6.5);
  }
};
ROCK9.speaker = (c, o, rng) => {
  const x = o.x - 15, y = o.y - 17;
  bevel9(c, x, y, 30, 34, '#050506', '#22222a', 3);
  for (const [cy, r] of [[y + 11, 6.5], [y + 25, 8]]) { c.fillStyle = '#0c0c10'; circle(c, o.x, cy, r); c.fillStyle = '#3a3a44'; circle(c, o.x, cy, r * 0.45); }
};
ROCK9.bench = (c, o, rng) => {
  const x = o.x - T / 2, y = o.y - 10;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 5, T, 22);
  c.fillStyle = '#2a1a10'; c.fillRect(x, y, T, 22);
  c.fillStyle = '#8a5a34'; c.fillRect(x + 1, y + 7, T - 2, 14);
  c.fillStyle = '#6a4224'; c.fillRect(x + 1, y + 1, T - 2, 6);
  c.fillStyle = 'rgba(255,240,210,0.12)'; c.fillRect(x + 1, y + 7, T - 2, 1.5);
};
URN9.bin = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  const x = o.x + sh, y = o.y + 2;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 12, 13, 5); c.fill();
  c.fillStyle = '#0c1a10'; rrect(c, x - 11, y - 12, 22, 25, 4); c.fill();
  c.fillStyle = L.clay; rrect(c, x - 10, y - 11, 20, 23, 3.5); c.fill();
  c.fillStyle = L.clayLo; c.fillRect(x - 10, y + 6, 20, 4);
  c.fillStyle = '#1a2a1e'; ell(c, x, y - 11, 9, 3); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(x - 7, y - 8, 2, 14);
  if (o.hp < o.max) { c.strokeStyle = 'rgba(10,20,10,0.9)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x + 3, y - 6); c.lineTo(x + 6, y); c.lineTo(x + 3, y + 5); c.stroke(); }
};
URN9.cups = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  const x = o.x + sh, y = o.y + 2;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 12, 14, 5); c.fill();
  const n = 1 + o.hp;
  for (let i = 0; i < n; i++) {
    const cx = x + (i - (n - 1) / 2) * 8, cy = y + 4 - (i % 2) * 6;
    c.fillStyle = '#3a060a'; c.beginPath(); c.moveTo(cx - 6, cy - 9); c.lineTo(cx + 6, cy - 9); c.lineTo(cx + 4.5, cy + 8); c.lineTo(cx - 4.5, cy + 8); c.closePath(); c.fill();
    c.fillStyle = L.clay; c.beginPath(); c.moveTo(cx - 5, cy - 8); c.lineTo(cx + 5, cy - 8); c.lineTo(cx + 3.6, cy + 7); c.lineTo(cx - 3.6, cy + 7); c.closePath(); c.fill();
    c.fillStyle = '#f2ecd8'; c.fillRect(cx - 5, cy - 8, 10, 2);
  }
};
URN9.files = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  const x = o.x + sh, y = o.y + 1;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 11, y - 9, 26, 24);
  c.fillStyle = '#5a4a2a'; c.fillRect(x - 13, y - 12, 26, 24);
  c.fillStyle = L.clay; c.fillRect(x - 12, y - 11, 24, 22);
  c.fillStyle = '#f2ecd8'; c.fillRect(x - 7, y - 3, 14, 7); c.fillStyle = 'rgba(40,40,60,0.6)'; c.fillRect(x - 5, y - 1, 10, 1); c.fillRect(x - 5, y + 1.5, 7, 1);
  c.fillStyle = '#2a2a30'; c.fillRect(x - 4, y - 9, 8, 3);
  if (o.hp < o.max) { c.strokeStyle = 'rgba(40,24,8,0.8)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(x + 6, y - 10); c.lineTo(x + 9, y - 3); c.lineTo(x + 6, y + 4); c.stroke(); }
};

/* ------------------------------------------------------------------ things that move with the music, or with you */
DYN9.booth = (c, o, room, t) => {
  const x = o.c * T, y = o.r * T, hell = room.theme === 'hell';
  const p = beatPulse9();
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 2, y + 6, T, T - 4);
  c.fillStyle = '#060608'; c.fillRect(x, y + 2, T, T - 4);
  c.fillStyle = '#1c1a22'; c.fillRect(x + 1, y + 3, T - 2, T - 6);
  c.fillStyle = rgba(hell ? '#ff3a1a' : '#ff3ad8', 0.5 + p * 0.5); c.fillRect(x, y + T - 5, T, 2.5);
  const horiz = room.tiles[o.r] && ((room.tiles[o.r][o.c - 1] && room.tiles[o.r][o.c - 1].type === 'booth') || (room.tiles[o.r][o.c + 1] && room.tiles[o.r][o.c + 1].type === 'booth'));
  const idx = horiz ? o.c : o.r, mid = horiz ? 5 : 4;
  if (idx === mid) {
    c.fillStyle = '#2a2832'; c.fillRect(o.x - 12, o.y - 10, 24, 18);
    for (let i = 0; i < 4; i++) { c.fillStyle = '#5a5866'; c.fillRect(o.x - 9 + i * 6, o.y - 8, 2, 14); c.fillStyle = NEON9[i]; c.fillRect(o.x - 10 + i * 6, o.y - 4 + Math.sin(t * 3 + i) * 3, 4, 2.5); }
  } else if (Math.abs(idx - mid) === 2) {
    c.fillStyle = '#0c0c10'; circle(c, o.x, o.y - 1, 12);
    c.save(); c.translate(o.x, o.y - 1); c.rotate(t * 3.5);
    c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 0.8; for (const r of [5, 8, 10]) { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
    c.fillStyle = hell ? '#ff3a1a' : '#ff3ad8'; circle(c, 0, 0, 3.2); c.fillStyle = '#ffffff'; c.fillRect(1, -0.5, 3, 1);
    c.restore();
  } else {
    c.fillStyle = '#9ea2aa'; c.fillRect(o.x - 10, o.y - 6, 20, 12); c.fillStyle = rgba(hell ? '#ff6a3a' : '#7af0ff', 0.6 + p * 0.3); c.fillRect(o.x - 8, o.y - 4, 16, 8);
  }
};
DYN9.speaker = (c, o, room, t) => {
  const p = Math.max(beatPulse9() * 0.6, o.pulse9 || 0);
  const x = o.x - 16, y = o.y - 17;
  bevel9(c, x, y, 32, 34, '#050506', '#1c1c24', 3);
  for (const [cy, r] of [[y + 10, 6], [y + 24, 9]]) {
    c.fillStyle = '#0c0c10'; circle(c, o.x, cy, r * (1 + p * 0.12));
    c.fillStyle = '#2a2a34'; circle(c, o.x, cy, r * 0.5);
    c.fillStyle = rgba(room.theme === 'hell' ? '#ff3a1a' : '#ff3ad8', 0.3 + p * 0.5); circle(c, o.x, cy, r * 0.18);
  }
};
DYN9.pump = (c, o, room, t) => {
  const x = o.x - 12, y = o.y - 18;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 6, 24, 34);
  c.fillStyle = '#0c1a10'; rrect(c, x, y, 24, 34, 3); c.fill();
  c.fillStyle = '#f2f0ea'; rrect(c, x + 1.5, y + 1.5, 21, 31, 2); c.fill();
  c.fillStyle = '#1f7a3a'; c.fillRect(x + 1.5, y + 1.5, 21, 6); c.fillStyle = '#f2c230'; c.fillRect(x + 1.5, y + 7.5, 21, 1.5);
  c.fillStyle = '#16181c'; c.fillRect(x + 4, y + 11, 16, 10);
  const p = o.offer ? PUMP_BY_ID[o.offer] : null;
  c.font = `700 4.6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (p && !o.used) { c.fillStyle = '#7cff7a'; c.fillText(p.name.toUpperCase().slice(0, 10), o.x, y + 14); c.fillStyle = '#ffd84a'; c.fillText(`${pumpCost9(o)} C`, o.x, y + 18.5); }
  else { c.fillStyle = Math.sin(t * 4) > 0 ? '#ff6a5a' : '#5a1a14'; c.fillText('LEEG', o.x, y + 16); }
  if (o.fillT > 0) { c.fillStyle = '#7cff7a'; c.fillRect(x + 4, y + 22, 16 * (1 - o.fillT / 1.2), 2); }
  // the hose and the nozzle
  c.strokeStyle = '#16181c'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 22, y + 24); c.quadraticCurveTo(x + 34, y + 30, x + 28, y + 12); c.stroke();
  c.fillStyle = '#2a2e36'; rrect(c, x + 24, y + 6, 7, 7, 1.5); c.fill();
};
DYN9.chair = (c, o, room, t) => {
  const sp = o.snipT > 0 ? Math.sin(t * 20) * 0.15 : 0;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, o.x + 2, o.y + 10, 16, 6); c.fill();
  c.fillStyle = '#a8acb4'; circle(c, o.x, o.y + 4, 9); c.fillStyle = '#d8dce2'; circle(c, o.x, o.y + 4, 6);
  c.save(); c.translate(o.x, o.y - 2); c.rotate(sp);
  rrect(c, -14, -12, 28, 24, 6); c.fillStyle = '#0c0c10'; c.fill();
  rrect(c, -12, -10, 24, 20, 5); c.fillStyle = '#7a1a20'; c.fill();
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-9, -8, 18, 3);
  c.fillStyle = '#a8acb4'; c.fillRect(-16, -4, 3, 12); c.fillRect(13, -4, 3, 12);
  c.restore();
  if (o.snipT > 0) { c.strokeStyle = '#c8ccd4'; c.lineWidth = 1.6; const a = Math.sin(t * 30) * 0.3; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(o.x + 16, o.y - 18); c.lineTo(o.x + 16 + Math.cos(-2 + s * a) * 9, o.y - 18 + Math.sin(-2 + s * a) * 9); c.stroke(); } }
};

/* ------------------------------------------------------------------ the floor layer, drawn every frame */
function drawFloorThings9(c, room, t) {
  if (clubRoom9(room) || (G.levelDef && G.levelDef.deco === 'rave')) {
    const step = DJ.on ? Math.floor(DJ.step / 4) : Math.floor(G.t * BittenRemix.BPM / 60), p = beatPulse9();
    const hell = room.theme === 'hell';
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      if (room.solid(col, r)) continue;
      const h = hash9(col, r, step);
      if (h > (room.cleared ? 0.12 : 0.24)) continue;
      const colr = hell ? (h < 0.1 ? '#ff2a1a' : '#ff8a1a') : NEON9[Math.floor(h * 97) % NEON9.length];
      c.fillStyle = rgba(colr, 0.1 + p * 0.16); rrect(c, col * T + 2, r * T + 2, T - 4, T - 4, 3); c.fill();
    }
  }
  if (room.syrup9 && room.syrup9.length) for (const s of room.syrup9) {
    const a = Math.min(1, (s.life - s.t) / 0.8) * Math.min(1, s.t * 6);
    c.fillStyle = `rgba(184,102,26,${0.55 * a})`; ell(c, s.x, s.y, s.r, s.r * 0.75, s.seed); c.fill();
    c.fillStyle = `rgba(255,220,150,${0.3 * a})`; ell(c, s.x - s.r * 0.3, s.y - s.r * 0.25, s.r * 0.3, s.r * 0.15, s.seed); c.fill();
  }
  const L = room.busLane9;
  if (L) {
    const u = clamp(L.t / L.warn, 0, 1), c0 = (L.pos + 0.5) * T, a = 0.12 + 0.3 * u * (0.6 + 0.4 * Math.sin(t * 20));
    c.fillStyle = `rgba(255,70,50,${a})`;
    if (L.horiz) c.fillRect(0, c0 - 21, RW, 42); else c.fillRect(c0 - 21, 0, 42, RH);
    c.fillStyle = `rgba(255,240,200,${0.3 + 0.5 * u})`; c.font = `800 13px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) {
      const k = (i + 0.5) / 4;
      c.save(); c.translate(L.horiz ? RW * k : c0, L.horiz ? c0 : RH * k); c.rotate(L.horiz ? (L.dir > 0 ? 0 : Math.PI) : (L.dir > 0 ? Math.PI / 2 : -Math.PI / 2));
      c.fillText('>>', 0, 0); c.restore();
    }
  }
  if (room.plates9) for (const pl of room.plates9) {
    const used = room.verdictDone;
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, pl.x + 1, pl.y + 3, 17, 7); c.fill();
    c.fillStyle = used ? '#4a3a2a' : pl.side === 'eiser' ? '#b8862a' : '#7a8a9a'; ell(c, pl.x, pl.y, 16, 7); c.fill();
    c.strokeStyle = used ? 'rgba(0,0,0,0.3)' : `rgba(255,240,200,${0.4 + 0.3 * Math.sin(t * 3)})`; c.lineWidth = 1.4; ell(c, pl.x, pl.y, 16, 7); c.stroke();
    c.fillStyle = used ? 'rgba(255,255,255,0.3)' : '#1a1208'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pl.side === 'eiser' ? 'EISER' : 'GEDAAGDE', pl.x, pl.y + 0.5);
  }
  for (const sn of room.snakes) {
    const m = sn.micDrop || sn.slam;
    if (!m || !sn.alive) continue;
    const u = clamp(m.t / m.warn, 0, 1), R = m.r || 52;
    c.strokeStyle = `rgba(255,${sn.slam ? 220 : 120},80,${0.3 + 0.5 * u})`; c.lineWidth = 2 + u * 2;
    c.setLineDash([6, 5]); c.beginPath(); c.arc(m.x, m.y, R, 0, TAU); c.stroke(); c.setLineDash([]);
    c.fillStyle = `rgba(255,${sn.slam ? 220 : 120},80,${0.08 + 0.18 * u})`; c.beginPath(); c.arc(m.x, m.y, R * u, 0, TAU); c.fill();
  }
  if (room.sockets9) for (const s of room.sockets9) {
    c.fillStyle = '#e8e8ee'; rrect(c, s.x - 7, s.y - 7, 14, 14, 3); c.fill(); c.strokeStyle = '#8a8a96'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#2a2a30'; circle(c, s.x - 2.5, s.y, 1.4); circle(c, s.x + 2.5, s.y, 1.4);
  }
}

/* ------------------------------------------------------------------ the glow layer */
function drawGlow9(c, room, t) {
  c.globalCompositeOperation = 'lighter';
  const p = beatPulse9();
  if (room.lasers9) for (const z of room.lasers9) {
    const ex = z.x + Math.cos(z.a) * z.len, ey = z.y + Math.sin(z.a) * z.len;
    if (z.t < z.warn) {
      c.strokeStyle = rgba(z.col, 0.25 + 0.25 * Math.sin(t * 30)); c.lineWidth = 1.2; c.setLineDash([4, 6]);
      c.beginPath(); c.moveTo(z.x, z.y); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
    } else {
      c.strokeStyle = rgba(z.col, 0.35); c.lineWidth = 9; c.beginPath(); c.moveTo(z.x, z.y); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = rgba(z.col, 0.85); c.lineWidth = 3; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; c.stroke();
    }
    glowDot(c, z.x, z.y, 14, z.col, 0.6);
  }
  for (const k in room.doors) {
    const d = room.doors[k];
    if (d.type !== 'club' && d.type !== 'hellclub') continue;
    const [sx, sy] = secretSpot(k);
    glowDot(c, sx, sy, 34 + p * 10, d.type === 'club' ? '#ff3ad8' : '#ff2a1a', 0.22 + p * 0.15);
  }
  if (room.hellLink) { const [sx, sy] = secretSpot(room.hellLink.k); glowDot(c, sx, sy, 26 + p * 14, '#ff2a1a', 0.12 + p * 0.18); }
  for (const k in room.doors) {
    if (!isPortalDoor10(room, room.doors[k])) continue;
    const [sx, sy] = secretSpot(k), pu = 0.5 + 0.5 * Math.sin(t * 2.4);
    glowDot(c, sx, sy, 62 + pu * 14, '#a24dff', 0.26 + pu * 0.14);
    glowDot(c, sx, sy, 28 + pu * 6, '#e2b0ff', 0.2 + pu * 0.12);
  }
  if (clubRoom9(room)) {
    const hell = room.theme === 'hell';
    for (let i = 0; i < 4; i++) {
      const a = t * (0.5 + i * 0.21) + i * 1.9;
      glowDot(c, RW / 2 + Math.cos(a) * RW * 0.34, RH / 2 + Math.sin(a * 1.27) * RH * 0.32, 46 + p * 16, hell ? (i % 2 ? '#ff2a1a' : '#ff8a1a') : NEON9[i], 0.12 + p * 0.12);
    }
    for (const o of room.obs) if (o.type === 'booth') glowDot(c, o.x, o.y + 14, 22, hell ? '#ff3a1a' : '#ff3ad8', 0.15 + p * 0.25);
    if (room.theme === 'hell' && DJ.on && !room.cleared) {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(160,0,20,${(0.05 + p * 0.07) * (REDUCED ? 0.4 : 1)})`; c.fillRect(-WALL, -WALL, VIEW_W, VIEW_H);
      c.globalCompositeOperation = 'lighter';
    }
  }
  for (const o of room.pumps9 || []) glowDot(c, o.x, o.y - 6, 18, o.used ? '#ff5a4a' : '#7cff7a', 0.18);
  const L = room.busLane9;
  if (L) {
    const c0 = (L.pos + 0.5) * T, u = clamp(L.t / L.warn, 0, 1);
    const x = L.horiz ? (L.dir > 0 ? 0 : RW) : c0, y = L.horiz ? c0 : (L.dir > 0 ? 0 : RH);
    for (const s of [-1, 1]) glowDot(c, x + (L.horiz ? 0 : s * 14), y + (L.horiz ? s * 14 : 0), 18 + u * 20, '#fff2c4', 0.2 + u * 0.5);
  }
  if (room.sockets9) for (const s of room.sockets9) glowDot(c, s.x, s.y, 14, '#7cffb0', 0.15);
  c.globalCompositeOperation = 'source-over';
}
function extraLights9(room, light) {
  const t = G.t, p = beatPulse9();
  if (clubRoom9(room)) {
    for (let i = 0; i < 3; i++) { const a = t * (0.6 + i * 0.25) + i * 2.1; light(RW / 2 + Math.cos(a) * RW * 0.32, RH / 2 + Math.sin(a * 1.3) * RH * 0.3, 70 + p * 30, 0.35 + p * 0.25); }
    for (const o of room.obs) if (o.type === 'booth') light(o.x, o.y, 44, 0.45);
  }
  if (room.lasers9) for (const z of room.lasers9) if (z.t >= z.warn) for (let k = 0.1; k < 1; k += 0.18) light(z.x + Math.cos(z.a) * z.len * k * 0.7, z.y + Math.sin(z.a) * z.len * k * 0.7, 36, 0.35);
  for (const o of room.pumps9 || []) light(o.x, o.y - 8, 60, 0.5);
  if (room.chair9) light(room.chair9.x, room.chair9.y, 90, 0.6);
  if (room.hellLink) { const [sx, sy] = secretSpot(room.hellLink.k); light(sx, sy, 40 + p * 16, 0.4); }
  for (const k in room.doors) if (isPortalDoor10(room, room.doors[k])) { const [sx, sy] = secretSpot(k); light(sx, sy, 78, 0.55); }
  for (const sn of room.snakes) {
    if (!sn.alive || sn.burrowed) continue;
    if (sn.kind === 'tellie') light(sn.x, sn.y, 80, 0.55);
    else if (sn.kind === 'bus') light(sn.x + Math.cos(sn.drawAng) * 60, sn.y + Math.sin(sn.drawAng) * 60, 76, 0.5);
    else if (DJ_KINDS[sn.kind]) light(sn.x, sn.y, 70, 0.4);
  }
}

/* ------------------------------------------------------------------ projectiles */
VENOM9.note = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate(Math.sin(v.t * 8) * 0.25);
  c.fillStyle = '#16121a'; ell(c, -1, 3, 4.6, 3.6, -0.3); c.fill();
  c.fillStyle = v.col; ell(c, -1, 3, 3.6, 2.7, -0.3); c.fill();
  c.strokeStyle = '#16121a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(2.2, 2); c.lineTo(2.2, -8); c.quadraticCurveTo(6, -6, 7, -2); c.stroke();
  c.strokeStyle = v.col; c.lineWidth = 1.2; c.stroke();
  c.restore();
};
VENOM9.vinylv = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate(v.t * 14);
  c.fillStyle = '#0c0c10'; circle(c, 0, 0, v.r); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.8; c.beginPath(); c.arc(0, 0, v.r * 0.7, 0, TAU); c.stroke();
  c.fillStyle = '#ff3ad8'; circle(c, 0, 0, v.r * 0.35); c.fillStyle = '#0c0c10'; circle(c, 0, 0, 1);
  c.restore();
};
VENOM9.msg = (c, v, t) => {
  c.save(); c.translate(v.x, v.y);
  rrect(c, -11, -7, 22, 13, 5); c.fillStyle = '#2a6aff'; c.fill(); c.strokeStyle = '#0a1a4a'; c.lineWidth = 1; c.stroke();
  c.beginPath(); c.moveTo(-5, 5); c.lineTo(-9, 10); c.lineTo(-1, 5.5); c.closePath(); c.fill();
  c.fillStyle = '#ffffff'; c.font = `700 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText((v.txt || '?').slice(0, 9), 0, 0);
  c.restore();
};
VENOM9.debris = (c, v, t) => {
  c.save(); c.translate(v.x, v.y); c.rotate(v.t * 9 + (v.spin || 0));
  c.fillStyle = '#2a2016'; c.fillRect(-5.5, -4, 11, 8); c.fillStyle = v.col; c.fillRect(-4.5, -3, 9, 6);
  c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(-4.5, -3, 9, 1.2);
  c.restore();
};
VENOM9.smoke = (c, v, t) => {
  const a = Math.max(0, 1 - v.t / v.life);
  c.fillStyle = `rgba(90,90,96,${0.55 * a})`; circle(c, v.x, v.y, v.r * (1 + v.t * 0.8));
  c.fillStyle = `rgba(150,150,156,${0.35 * a})`; circle(c, v.x - 2, v.y - 2, v.r * 0.6 * (1 + v.t * 0.8));
};
function drawSeed9(c, s, z) {
  const y = s.y - z + 2, R = 5 * (s.size || 1);
  if (s.draw9 === 'vinyl') {
    c.save(); c.translate(s.x, y); c.rotate(s.t * 20);
    c.fillStyle = '#0c0c10'; circle(c, 0, 0, R * 1.1); c.fillStyle = s.look9 ? s.look9[2] : '#e83a50'; circle(c, 0, 0, R * 0.45); c.fillStyle = '#0c0c10'; circle(c, 0, 0, R * 0.12);
    c.restore();
    return true;
  }
  if (s.draw9 === 'wheel') {
    c.save(); c.translate(s.x, y); c.rotate(s.t * 12);
    c.strokeStyle = '#5a3a14'; c.lineWidth = R * 0.4; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
    c.strokeStyle = '#d8a050'; c.lineWidth = R * 0.24; c.stroke();
    c.lineWidth = 1.2; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R, Math.sin(a) * R); c.stroke(); }
    c.restore();
    return true;
  }
  if (s.draw9 === 'olie') {
    c.fillStyle = '#4a2a10'; circle(c, s.x, y, R * 0.95); c.fillStyle = '#6a3a18'; circle(c, s.x - R * 0.2, y - R * 0.2, R * 0.6);
    c.fillStyle = 'rgba(250,246,236,0.95)'; c.beginPath(); c.ellipse(s.x, y - R * 0.3, R * 0.8, R * 0.45, 0, Math.PI, TAU); c.fill();
    return true;
  }
  return false;
}
DRAWPICK9.bitterbal = (c, p, t) => {
  const bob = Math.sin(t * 4 + (p.ph || 0)) * 1.2, a = p.t > p.life - 2 ? 0.5 + 0.5 * Math.sin(t * 20) : 1;
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, p.x + 1, p.y + 7, 6, 2.4); c.fill();
  const g = c.createRadialGradient(p.x - 2, p.y - 3 + bob, 1, p.x, p.y + bob, 7); g.addColorStop(0, '#e8a050'); g.addColorStop(1, '#6a3a14');
  c.fillStyle = g; circle(c, p.x, p.y - 1 + bob, 6);
  c.fillStyle = '#e8c030'; ell(c, p.x + 5, p.y + 3 + bob, 2.4, 1.4); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.8;
  for (let i = 0; i < 2; i++) { const ph = (t * 0.8 + i * 0.5) % 1; c.beginPath(); c.moveTo(p.x - 2 + i * 4, p.y - 8 - ph * 8); c.quadraticCurveTo(p.x + i * 4, p.y - 11 - ph * 8, p.x - 2 + i * 4, p.y - 14 - ph * 8); c.stroke(); }
  c.restore();
};

/* ------------------------------------------------------------------ the minimap */
MINI9.tank = (c, mx, my, cur) => { c.fillStyle = cur ? '#1a5a2a' : '#4ac05a'; c.fillRect(mx - 2.4, my - 3, 4.8, 6); c.fillStyle = cur ? '#ece2d4' : '#f2c230'; c.fillRect(mx - 1.6, my - 2.2, 3.2, 1.6); };
MINI9.kapper = (c, mx, my, cur) => { c.fillStyle = cur ? '#5a1a20' : '#e8e2d0'; c.fillRect(mx - 1.4, my - 3.4, 2.8, 6.8); c.fillStyle = '#c3243a'; c.fillRect(mx - 1.4, my - 1, 2.8, 1.4); };
MINI9.courtroom = (c, mx, my, cur) => { c.strokeStyle = cur ? '#6a4a20' : '#d8b46a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(mx, my - 3); c.lineTo(mx, my + 3); c.moveTo(mx - 3.2, my - 1.6); c.lineTo(mx + 3.2, my - 1.6); c.stroke(); };
MINI9.club = (c, mx, my, cur) => { c.fillStyle = cur ? '#8a1a6a' : '#ff3ad8'; circle(c, mx - 1, my + 1.6, 1.8); c.fillRect(mx + 0.2, my - 3.4, 1.2, 5); };
MINI9.hellclub = (c, mx, my, cur) => { c.fillStyle = cur ? '#5a0a0e' : '#ff3a2a'; circle(c, mx, my + 0.8, 2.4); c.beginPath(); c.moveTo(mx - 2.4, my - 0.5); c.lineTo(mx - 3.2, my - 3.4); c.lineTo(mx - 1, my - 1.5); c.moveTo(mx + 2.4, my - 0.5); c.lineTo(mx + 3.2, my - 3.4); c.lineTo(mx + 1, my - 1.5); c.fill(); };

/* ------------------------------------------------------------------ on and around the apple */
function drawPlayerOver9(c, P, t) {
  if (P.stok) {
    const x = P.x - 4, y = P.y - 20 + Math.sin(t * 3) * 0.6, look = Math.sin(t * 1.3) * 0.6;
    c.fillStyle = '#2a1c0c'; ell(c, x, y + 4, 3.6, 5.5); c.fill(); c.fillStyle = '#c9a26b'; ell(c, x, y + 4, 2.8, 4.8); c.fill();
    c.fillStyle = '#2a1c0c'; ell(c, x + look, y - 2.5, 3.2, 3.6); c.fill(); c.fillStyle = '#c9a26b'; ell(c, x + look, y - 2.5, 2.5, 3); c.fill();
    c.fillStyle = '#2a1c0c'; circle(c, x + look - 1, y - 3, 0.8); circle(c, x + look + 1, y - 3, 0.8);
  }
  if (P.verdictT > 0) {
    c.strokeStyle = 'rgba(180,184,196,0.8)'; c.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) { const a = t * 1.5 + (i / 8) * TAU; ell(c, P.x + Math.cos(a) * 15, P.y + Math.sin(a) * 13, 2.6, 1.6, a); c.stroke(); }
  }
  if (P.disco) {
    const d = P.disco;
    if (d.x == null) { d.x = P.x; d.y = P.y - 34; }
    c.strokeStyle = 'rgba(200,200,210,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(d.x, d.y - 14); c.lineTo(d.x, d.y - 6); c.stroke();
    c.save(); c.beginPath(); c.arc(d.x, d.y, 6, 0, TAU); c.clip();
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const v = Math.sin(i * 1.7 + j * 2.3 + t * 5); c.fillStyle = v > 0.5 ? '#ffffff' : v > -0.2 ? '#b8bcc6' : '#6a6e78'; c.fillRect(d.x + i * 2, d.y + j * 2, 1.8, 1.8); }
    c.restore();
  }
  if (P.speaker) {
    const s = P.speaker, k = 1 + (s.pulse || 0) * 0.15;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, s.x + 1, s.y + 8, 7, 2.5); c.fill();
    rrect(c, s.x - 6, s.y - 8, 12, 15, 2); c.fillStyle = '#16141c'; c.fill();
    c.fillStyle = '#0c0c10'; circle(c, s.x, s.y + 1.5, 4 * k); c.fillStyle = '#c48af0'; circle(c, s.x, s.y + 1.5, 1.4); c.fillStyle = '#0c0c10'; circle(c, s.x, s.y - 4.5, 1.8);
  }
  if (P.wheel != null) {
    const f = P.wheel;
    c.strokeStyle = f >= 1 ? `rgba(255,210,122,${0.6 + 0.3 * Math.sin(t * 8)})` : 'rgba(216,160,80,0.35)'; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(P.x, P.y + 12, 16, 5.6, 0, Math.PI / 2, Math.PI / 2 + f * TAU); c.stroke();
  }
  if (P.bankN > 0) { c.fillStyle = '#7cd0ff'; for (let i = 0; i < P.bankN; i++) circle(c, P.x - 8 + i * 4, P.y - 22, 1.3); }
}

