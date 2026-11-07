/* src/38-v10-draw-floors.js: v10: drawing the new floors, walls, rocks and pots. From v10. Lines 19524 to 19847 of the v13.7 script. */
/* =====================================================================
   Drawing the new floors, walls, rocks and pots
   ===================================================================== */
const DECO10 = { mega: 1, arena: 1, rook: 1, metro: 1, afgrond: 1 };
function hospital10(room) { return room.type === 'clownhq'; }
{
  const ft0 = floorTiles9;
  floorTiles9 = function (c, room, L, rng) {
    if (hospital10(room)) { hqFloor10(c, room, rng); return true; }
    if (room.type === 'quiet') { quietFloor10(c, room, rng); return true; }
    if (room.theme10 === 'station' || L.deco === 'metro') { metroFloor10(c, room, L, rng); return true; }
    if (L.deco === 'arena') { arenaFloor10(c, room, L, rng); return true; }
    if (L.deco === 'afgrond') { voidFloor10(c, room, L, rng); return true; }
    if (L.deco === 'rook') { rookFloor10(c, room, L, rng); return true; }
    return ft0(c, room, L, rng);
  };
  const fd0 = floorDeco9;
  floorDeco9 = function (c, room, L, rng) {
    let done = false;
    if (hospital10(room)) { hqDeco10(c, room, rng); done = true; }
    else if (room.type === 'quiet') { quietDeco10(c, room, rng); done = true; }
    else if (DECO10[L.deco] && !SPECIAL9[room.type] && !clubRoom9(room)) { floorDeco10(c, room, L, rng); done = true; }
    if (!done) done = fd0(c, room, L, rng);
    if (room.rails10 && room.rails10.length) drawRails10(c, room);
    return done;
  };
  const wc0 = wallCol9;
  wallCol9 = function (room, L) {
    if (hospital10(room)) return '#bcd8d0';
    if (room.type === 'quiet') return '#3e3456';
    return wc0(room, L);
  };
  const dw0 = drawWalls9;
  drawWalls9 = function (c, room, L, rng) {
    dw0(c, room, L, rng);
    if (hospital10(room)) hqWalls10(c, room, rng);
    else if (room.type === 'quiet') quietWalls10(c, room);
    else if (!SPECIAL9[room.type] && !clubRoom9(room)) walls10(c, room, L, rng);
  };
}
Object.assign(NOBONES9, { clownhq: 1, quiet: 1 });

function metroFloor10(c, room, L, rng) {
  c.fillStyle = L.grout || '#121312'; c.fillRect(0, 0, RW, RH);
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const x = col * T, y = r * T, v = rng();
    c.fillStyle = v < 0.5 ? (L.floor || '#2a2c2a') : (L.floor2 || '#262826'); c.fillRect(x + 1, y + 1, T - 2, T - 2);
    if (rng() < 0.3) { c.fillStyle = 'rgba(0,0,0,0.18)'; ell(c, x + rng() * T, y + rng() * T, 4 + rng() * 8, 2 + rng() * 4, rng() * 3); c.fill(); }
    if (rng() < 0.12) { c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 4, y + rng() * T); c.lineTo(x + T - 4, y + rng() * T); c.stroke(); }
  }
  // the yellow safety lines along the platform edges
  c.fillStyle = 'rgba(214,186,60,0.55)';
  c.fillRect(0, T * 0.55, RW, 3); c.fillRect(0, RH - T * 0.55 - 3, RW, 3);
  c.fillStyle = 'rgba(20,20,16,0.5)';
  for (let x = 0; x < RW; x += 8) { c.fillRect(x, T * 0.55 + 4, 4, 2); c.fillRect(x, RH - T * 0.55 - 6, 4, 2); }
}
function arenaFloor10(c, room, L, rng) {
  c.fillStyle = L.grout; c.fillRect(0, 0, RW, RH);
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const x = col * T, y = r * T;
    c.fillStyle = (r + col) % 2 ? L.floor : L.floor2; c.fillRect(x, y, T, T);
    c.fillStyle = 'rgba(255,255,255,0.04)'; c.fillRect(x, y, T, 3);
    for (let i = 0; i < 6; i++) { c.fillStyle = rng() < 0.5 ? 'rgba(140,200,90,0.35)' : 'rgba(30,60,20,0.3)'; c.fillRect(x + rng() * T, y + rng() * T, 1.2, 3); }
  }
  // the lanes: a wide strip down the middle, like a match field
  c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(RW / 2 - T * 1.5, 0, T * 3, RH);
}
function voidFloor10(c, room, L, rng) {
  c.fillStyle = L.grout; c.fillRect(0, 0, RW, RH);
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const x = col * T, y = r * T;
    c.fillStyle = rng() < 0.5 ? L.floor : L.floor2;
    c.beginPath(); c.moveTo(x + 2 + rng() * 3, y + 2); c.lineTo(x + T - 2, y + 2 + rng() * 3); c.lineTo(x + T - 2 - rng() * 3, y + T - 2); c.lineTo(x + 2, y + T - 2 - rng() * 3); c.closePath(); c.fill();
    if (rng() < 0.25) { c.strokeStyle = 'rgba(154,122,255,0.22)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + rng() * T, y + rng() * T); c.lineTo(x + rng() * T, y + rng() * T); c.stroke(); }
  }
}
function rookFloor10(c, room, L, rng) {
  c.fillStyle = L.grout; c.fillRect(0, 0, RW, RH);
  // a dark carpet with a worn pattern
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const x = col * T, y = r * T;
    c.fillStyle = (r + col) % 2 ? L.floor : L.floor2; c.fillRect(x, y, T, T);
    c.strokeStyle = 'rgba(160,90,40,0.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + T / 2, y + 4); c.lineTo(x + T - 4, y + T / 2); c.lineTo(x + T / 2, y + T - 4); c.lineTo(x + 4, y + T / 2); c.closePath(); c.stroke();
  }
  for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(10,8,6,0.3)'; ell(c, rng() * RW, rng() * RH, 6 + rng() * 14, 4 + rng() * 8, rng() * 3); c.fill(); }
}
function floorDeco10(c, room, L, rng) {
  if (L.deco === 'mega') {
    // stickers and price tags on a shiny floor
    for (let i = 0; i < 6; i++) {
      const x = 30 + rng() * (RW - 60), y = 30 + rng() * (RH - 60);
      c.save(); c.translate(x, y); c.rotate(rng() * 0.8 - 0.4);
      c.fillStyle = 'rgba(255,210,58,0.6)'; c.fillRect(-11, -6, 22, 12);
      c.fillStyle = 'rgba(20,20,26,0.75)'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(['-50%', 'SALE', 'OP=OP', '-30%', 'NIEUW'][Math.floor(rng() * 5)], 0, 0.5);
      c.restore();
    }
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(rng() * RW, 0, 6 + rng() * 10, RH); }
    c.strokeStyle = 'rgba(58,138,255,0.25)'; c.lineWidth = 2; c.setLineDash([10, 8]);
    c.beginPath(); c.moveTo(T, RH / 2); c.lineTo(RW - T, RH / 2); c.stroke(); c.setLineDash([]);
  } else if (L.deco === 'arena') {
    for (let i = 0; i < 6; i++) { const x = 30 + rng() * (RW - 60), y = 30 + rng() * (RH - 60); c.fillStyle = rng() < 0.5 ? 'rgba(255,240,120,0.5)' : 'rgba(255,140,180,0.5)'; for (let k = 0; k < 5; k++) circle(c, x + Math.cos(k * 1.26) * 2.6, y + Math.sin(k * 1.26) * 2.6, 1.4); c.fillStyle = '#ffd23a'; circle(c, x, y, 1.2); }
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 2;
    c.beginPath(); c.arc(RW / 2, RH / 2, T * 1.4, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(RW / 2, 0); c.lineTo(RW / 2, RH * 0.5 - T * 1.4); c.moveTo(RW / 2, RH * 0.5 + T * 1.4); c.lineTo(RW / 2, RH); c.stroke();
  } else if (L.deco === 'rook') {
    // cigarette butts and ash
    for (let i = 0; i < 26; i++) {
      const x = rng() * RW, y = rng() * RH;
      c.save(); c.translate(x, y); c.rotate(rng() * TAU);
      c.fillStyle = '#e8e2d6'; c.fillRect(-3, -0.9, 4, 1.8); c.fillStyle = '#d88a3a'; c.fillRect(1, -0.9, 2.4, 1.8);
      c.restore();
    }
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(140,136,130,0.25)'; ell(c, rng() * RW, rng() * RH, 5 + rng() * 6, 3 + rng() * 3, rng() * 3); c.fill(); }
  } else if (L.deco === 'metro') {
    for (let i = 0; i < 5; i++) { const x = 30 + rng() * (RW - 60), y = 30 + rng() * (RH - 60); c.save(); c.translate(x, y); c.rotate(rng() * TAU); c.fillStyle = 'rgba(200,190,160,0.35)'; c.fillRect(-5, -3, 10, 6); c.fillStyle = 'rgba(60,50,30,0.4)'; c.fillRect(-4, -1, 8, 1); c.restore(); }
    for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(90,120,140,0.18)'; ell(c, 30 + rng() * (RW - 60), 30 + rng() * (RH - 60), 10 + rng() * 16, 5 + rng() * 6, rng() * 0.6); c.fill(); }
  } else if (L.deco === 'afgrond') {
    for (let i = 0; i < 8; i++) {
      const x = rng() * RW, y = rng() * RH;
      c.strokeStyle = 'rgba(154,122,255,0.3)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y);
      let px = x, py = y; for (let k = 0; k < 4; k++) { px += rng() * 22 - 11; py += rng() * 22 - 11; c.lineTo(px, py); }
      c.stroke();
    }
    for (let i = 0; i < 20; i++) { c.fillStyle = 'rgba(200,180,255,0.25)'; circle(c, rng() * RW, rng() * RH, 0.6 + rng()); }
  }
}
function drawRails10(c, room) {
  const rows = new Map();
  for (const r of room.rails10) { if (!rows.has(r.r)) rows.set(r.r, []); rows.get(r.r).push(r.c); }
  for (const [r, cols] of rows) {
    const y = (r + 0.5) * T, x0 = Math.min(...cols) * T, x1 = (Math.max(...cols) + 1) * T;
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x0, y - 13, x1 - x0, 26);
    c.fillStyle = '#4a3a28'; for (let x = x0 + 4; x < x1; x += 12) c.fillRect(x, y - 12, 6, 24);
    c.fillStyle = '#8a8c90'; c.fillRect(x0, y - 8, x1 - x0, 3); c.fillRect(x0, y + 5, x1 - x0, 3);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x0, y - 8, x1 - x0, 1); c.fillRect(x0, y + 5, x1 - x0, 1);
  }
}
function walls10(c, room, L, rng) {
  const door = (k) => !!room.doors[k];
  if (L.deco === 'mega') {
    const x = RW * 0.25, y = -WALL / 2;
    c.fillStyle = '#0c121a'; rrect(c, x - 44, y - 9, 88, 18, 4); c.fill();
    c.strokeStyle = '#3a8aff'; c.lineWidth = 1.4; rrect(c, x - 44, y - 9, 88, 18, 4); c.stroke();
    wallText9(c, 'MEGASTORE', x, y + 0.5, 11, '#e8f2ff');
    if (!door('s')) { for (let i = 0; i < 4; i++) { const sx = 60 + i * 100; c.fillStyle = '#0a0c10'; c.fillRect(sx - 18, RH + 5, 36, WALL - 10); c.fillStyle = `hsl(${(i * 80 + 200) % 360},50%,40%)`; c.fillRect(sx - 16, RH + 7, 32, WALL - 14); } }
  } else if (L.deco === 'arena') {
    for (const [x, col] of [[RW * 0.2, '#e83a3a'], [RW * 0.8, '#3a8aff']]) { c.fillStyle = col; c.fillRect(x - 20, -WALL + 4, 40, WALL - 8); wallText9(c, col === '#e83a3a' ? 'ROOD' : 'BLAUW', x, -WALL / 2, 9, '#ffffff'); }
    if (!door('n')) wallText9(c, 'ARENA', RW / 2, -WALL / 2, 12, '#ffd23a');
  } else if (L.deco === 'rook') {
    for (const [x, y, rot] of [[RW * 0.25, -WALL / 2, 0], [RW * 0.75, RH + WALL / 2, 0], [-WALL / 2, RH * 0.75, -Math.PI / 2]]) {
      c.save(); c.translate(x, y); c.rotate(rot);
      c.fillStyle = '#f2f0ea'; c.fillRect(-36, -8, 72, 16); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.6; c.strokeRect(-35, -7, 70, 14);
      c.fillStyle = '#1a1a1a'; c.font = `800 8px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sayF9('ROKEN IS DODELIJK'), 0, 0.5);
      c.restore();
    }
  } else if (L.deco === 'metro' || room.theme10 === 'station') {
    const name = room.type === 'boss' ? 'LAATSTE HALTE' : ['CENTRAAL', 'NOORD', 'ZUID', 'OOST', 'WEST', 'HAVEN', 'DIEPTE'][Math.floor(rng() * 7)];
    for (const x of [RW * 0.25, RW * 0.75]) {
      c.fillStyle = '#e8e2d0'; rrect(c, x - 34, -WALL / 2 - 8, 68, 16, 3); c.fill();
      c.fillStyle = '#b8261e'; c.fillRect(x - 34, -WALL / 2 - 8, 68, 3);
      wallText9(c, name, x, -WALL / 2 + 1, 8, '#1a1a1a');
    }
  } else if (L.deco === 'afgrond') {
    c.strokeStyle = 'rgba(154,122,255,0.35)'; c.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) { const x = rng() * RW; c.beginPath(); c.moveTo(x, -WALL + 2); c.lineTo(x + rng() * 10 - 5, -WALL * 0.5); c.lineTo(x + rng() * 10 - 5, -3); c.stroke(); }
  }
}

/* ------------------------------------------------------------------ new obstacles */
STATIC9.bed = (c, o) => {
  const x = o.x - 17, y = o.y - 15;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 3, y + 5, 34, 30);
  c.fillStyle = '#8a929a'; rrect(c, x, y, 34, 30, 3); c.fill();
  c.fillStyle = '#f4f6f8'; rrect(c, x + 2, y + 2, 30, 26, 3); c.fill();
  c.fillStyle = '#9ad8d0'; c.fillRect(x + 2, y + 12, 30, 16);
  c.fillStyle = '#ffffff'; rrect(c, x + 6, y + 3, 22, 8, 3); c.fill();
  c.strokeStyle = 'rgba(40,60,70,0.3)'; c.lineWidth = 0.8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x + 4, y + 16 + i * 4); c.lineTo(x + 30, y + 15 + i * 4); c.stroke(); }
  if (o.clown) { for (let i = 0; i < 5; i++) { c.fillStyle = ['#ff3a5a', '#ffd23a', '#3a9aff'][i % 3]; circle(c, x + 10 + i * 3.5, y + 6 + (i % 2) * 2, 3); } }
};
STATIC9.cart10 = (c, o) => {
  const x = o.x - 12, y = o.y - 13;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 4, 26, 26);
  bevel9(c, x, y, 24, 26, '#5a626a', '#c8d0d8', 2);
  c.fillStyle = '#8a929a'; c.fillRect(x + 2, y + 12, 20, 1.6);
  const cols = ['#e83a3a', '#3a9aff', '#3ac86a', '#ffd23a'];
  for (let i = 0; i < 4; i++) { c.fillStyle = cols[(o.c + o.r + i) % 4]; rrect(c, x + 3 + i * 5, y + 3, 4, 8, 1.5); c.fill(); }
  c.fillStyle = '#e8e8ee'; c.fillRect(x + 4, y + 15, 16, 8); c.fillStyle = '#e83a3a'; c.fillRect(x + 11, y + 16, 2, 6); c.fillRect(x + 9, y + 18, 6, 2);
};
STATIC9.vending = (c, o) => {
  const x = o.x - 15, y = o.y - 18;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 5, 30, 36);
  bevel9(c, x, y, 30, 36, '#101418', ['#c8262e', '#2a6ad8', '#2a9a4a'][o.hue || 0], 3);
  c.fillStyle = 'rgba(180,220,255,0.55)'; c.fillRect(x + 4, y + 4, 16, 26);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { c.fillStyle = PRODUCT_COLS[(o.c * 3 + r * 4 + k) % PRODUCT_COLS.length]; c.fillRect(x + 5 + k * 5, y + 6 + r * 6, 4, 4); }
  c.fillStyle = '#16181c'; c.fillRect(x + 22, y + 6, 5, 10); c.fillStyle = '#7cff7a'; c.fillRect(x + 23, y + 7, 3, 2);
  c.fillStyle = '#0a0a0c'; c.fillRect(x + 4, y + 31, 16, 3);
};
DYN9.tvwall = (c, o, room, t) => {
  const x = o.c * T + 1, y = o.r * T + 2, w = T - 2, h = T - 6;
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x + 3, y + 5, w, h);
  c.fillStyle = '#0a0b0e'; c.fillRect(x, y, w, h);
  for (let i = 0; i < 4; i++) {
    const sx = x + 2 + (i % 2) * (w / 2 - 1), sy = y + 2 + Math.floor(i / 2) * (h / 2 - 1), sw = w / 2 - 3, sh = h / 2 - 3;
    const boss = G.boss && G.boss.kind === 'tvboss' && G.boss.alive;
    const k = Math.floor(t * (boss ? 6 : 1.5) + o.c * 3 + o.r * 5 + i) % 6;
    c.fillStyle = boss && Math.sin(t * 9 + i) > 0.3 ? '#e83a3a' : ['#1a3a8a', '#3a8aff', '#2a6a3a', '#8a3ad8', '#d8a03a', '#1a1a2a'][k];
    c.fillRect(sx, sy, sw, sh);
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(sx, sy, sw, sh * 0.35);
  }
};
DYN9.lamp10 = (c, o, room, t) => {
  const off = room.lightsOut10;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, o.x + 2, o.y + 10, 9, 4); c.fill();
  c.fillStyle = '#2a2c28'; c.fillRect(o.x - 2, o.y - 12, 4, 20);
  c.fillStyle = '#3a3c36'; rrect(c, o.x - 7, o.y - 18, 14, 8, 2); c.fill();
  c.fillStyle = off ? '#3a3830' : `rgba(255,240,190,${0.85 + 0.15 * Math.sin(t * 17 + o.c)})`; rrect(c, o.x - 5, o.y - 16, 10, 4, 1.5); c.fill();
  c.fillStyle = '#1a1a16'; ell(c, o.x, o.y + 8, 7, 3); c.fill();
};
ROCK9.shelf10 = (c, o, rng) => {
  const x = o.c * T + 2, y = o.r * T + 4, w = T - 4, h = T - 8;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 3, y + 5, w, h);
  c.fillStyle = '#16181e'; c.fillRect(x, y, w, h);
  c.fillStyle = '#2a2e38'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
  for (let k = 0; k < 2; k++) {
    const sy = y + 3 + k * (h / 2);
    c.fillStyle = '#464c58'; c.fillRect(x + 1, sy + h / 2 - 4, w - 2, 2);
    for (let i = 0; i < 3; i++) {
      const bx = x + 3 + i * ((w - 6) / 3), bw = (w - 6) / 3 - 2;
      if (rng() < 0.5) { c.fillStyle = '#0a0b0e'; c.fillRect(bx, sy, bw, h / 2 - 7); c.fillStyle = `hsl(${Math.floor(rng() * 360)},50%,45%)`; c.fillRect(bx + 1, sy + 1, bw - 2, h / 2 - 9); }
      else { c.fillStyle = PRODUCT_COLS[Math.floor(rng() * PRODUCT_COLS.length)]; c.fillRect(bx, sy, bw, h / 2 - 7); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(bx, sy, bw, 2); }
    }
  }
  c.fillStyle = '#ffd23a'; c.fillRect(x + w - 10, y + h - 6, 8, 4);
};
ROCK9.arena10 = (c, o, rng) => {
  const x = o.c * T + 1, y = o.r * T + 1, w = T - 2, h = T - 2;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 3, y + 5, w, h);
  c.fillStyle = '#5a3a1e'; rrect(c, x, y, w, h, 4); c.fill();
  c.fillStyle = '#c89a5a'; rrect(c, x + 2, y + 2, w - 4, h - 8, 3); c.fill();
  c.fillStyle = '#e8c080'; c.fillRect(x + 4, y + 4, w - 8, 4);
  c.strokeStyle = 'rgba(90,58,30,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + w / 2, y + 2); c.lineTo(x + w / 2, y + h - 6); c.moveTo(x + 2, y + h / 2 - 2); c.lineTo(x + w - 2, y + h / 2 - 2); c.stroke();
};
ROCK9.ashtray10 = (c, o, rng) => {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 9, 17, 7); c.fill();
  c.fillStyle = '#3a3a40'; ell(c, x, y + 4, 16, 9); c.fill();
  c.fillStyle = '#6a6a72'; ell(c, x, y, 16, 9); c.fill();
  c.fillStyle = '#2a2a2e'; ell(c, x, y, 11, 6); c.fill();
  c.fillStyle = 'rgba(160,156,150,0.8)'; ell(c, x, y + 1, 9, 4.5); c.fill();
  for (let i = 0; i < 5; i++) { c.save(); c.translate(x + rng() * 12 - 6, y + rng() * 6 - 3); c.rotate(rng() * TAU); c.fillStyle = '#e8e2d6'; c.fillRect(-3, -0.9, 4, 1.8); c.fillStyle = '#d88a3a'; c.fillRect(1, -0.9, 2.4, 1.8); c.restore(); }
};
ROCK9.sandbag10 = (c, o, rng) => {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 10, 19, 7); c.fill();
  for (let k = 0; k < 3; k++) for (let i = 0; i < 3 - (k === 2 ? 1 : 0); i++) {
    const bx = x - 12 + i * 12 + (k === 2 ? 6 : k === 1 ? 0 : 0), by = y + 8 - k * 8;
    c.fillStyle = '#4a3e28'; ell(c, bx, by, 7.5, 4.6); c.fill();
    c.fillStyle = ['#8a7a54', '#7a6a4a', '#9a8a60'][Math.floor(rng() * 3)]; ell(c, bx, by - 0.6, 6.8, 3.8); c.fill();
    c.strokeStyle = 'rgba(40,30,16,0.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(bx - 4, by - 1); c.lineTo(bx + 4, by - 1); c.stroke();
  }
};
ROCK9.void10 = (c, o, rng) => {
  const x = o.x, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, x + 2, y + 10, 18, 7); c.fill();
  const n = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.55, h = 18 + rng() * 10, bx = x + Math.cos(a) * 4, by = y + 8;
    c.fillStyle = '#1a1626'; c.beginPath(); c.moveTo(bx - 6, by); c.lineTo(bx + Math.cos(a) * h, by + Math.sin(a) * h); c.lineTo(bx + 6, by); c.closePath(); c.fill();
    c.fillStyle = '#5a4e78'; c.beginPath(); c.moveTo(bx - 4, by - 1); c.lineTo(bx + Math.cos(a) * h * 0.9, by + Math.sin(a) * h * 0.9); c.lineTo(bx + 1, by - 1); c.closePath(); c.fill();
  }
  c.fillStyle = 'rgba(154,122,255,0.5)'; circle(c, x, y - 4, 1.6);
};
URN9.box10 = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x - 12 + sh, y = o.y - 12;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 6, 26, 20);
  bevel9(c, x, y, 24, 22, '#3a3e48', '#e8eaee', 2);
  c.fillStyle = '#16181e'; c.fillRect(x + 4, y + 4, 16, 10); c.fillStyle = `hsl(${(o.c * 60 + o.r * 37) % 360},60%,50%)`; c.fillRect(x + 5, y + 5, 14, 8);
  c.fillStyle = '#3a8aff'; c.fillRect(x + 3, y + 16, 18, 3);
};
URN9.cube10 = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x - 13 + sh, y = o.y - 13;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 6, 28, 22);
  bevel9(c, x, y, 26, 24, '#4a3416', '#a8783e', 2);
  c.strokeStyle = 'rgba(60,36,14,0.6)'; c.lineWidth = 1; c.strokeRect(x + 3, y + 3, 20, 18);
  c.fillStyle = '#5ae85a'; c.beginPath(); c.moveTo(x + 14, y + 4); c.lineTo(x + 8, y + 13); c.lineTo(x + 12.5, y + 13); c.lineTo(x + 11, y + 20); c.lineTo(x + 18, y + 10); c.lineTo(x + 13.5, y + 10); c.closePath(); c.fill();
};
URN9.bin10 = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x + sh, y = o.y;
  c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 11, 11, 4); c.fill();
  c.fillStyle = '#4a4e56'; c.beginPath(); c.moveTo(x - 9, y - 8); c.lineTo(x + 9, y - 8); c.lineTo(x + 7, y + 11); c.lineTo(x - 7, y + 11); c.closePath(); c.fill();
  c.fillStyle = '#6a6e78'; ell(c, x, y - 8, 9, 3.5); c.fill();
  c.fillStyle = 'rgba(150,146,140,0.9)'; ell(c, x, y - 8, 7, 2.6); c.fill();
  c.fillStyle = '#e8e2d6'; c.fillRect(x - 2, y - 9.5, 4, 1.4);
};
URN9.crate10 = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0, x = o.x - 13 + sh, y = o.y - 11;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x + 2, y + 6, 28, 18);
  bevel9(c, x, y, 26, 20, '#2a2e1e', '#5a6a3a', 2);
  c.fillStyle = '#2a2e1e'; c.fillRect(x + 2, y + 9, 22, 2);
  c.fillStyle = '#d8d0a8'; c.font = `800 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7.62', x + 13, y + 15.5);
};
URN9.voidurn10 = (c, o, L, t) => {
  const sh = o.shake > 0 ? Math.sin(t * 70) * o.shake * 8 : 0;
  c.save(); c.translate(o.x + sh, o.y + 2);
  c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, 1, 9, 11, 4); c.fill();
  c.fillStyle = '#1a1626'; ell(c, 0, 0, 11, 12); c.fill();
  c.fillStyle = '#4a3e6a'; ell(c, 0, -1, 9.5, 10.5); c.fill();
  c.fillStyle = '#1a1626'; ell(c, 0, -10, 5, 2.4); c.fill();
  c.strokeStyle = `rgba(154,122,255,${0.4 + 0.3 * Math.sin(t * 2 + o.c)})`; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 6, 0.5, 2.6); c.stroke();
  c.restore();
};
// pits on the bottom floor go all the way down, and they glow a little
{
  const dp0 = drawPit;
  drawPit = function (c, o, L) {
    dp0(c, o, L);
    if (L.deco === 'afgrond' || o.chasm10) {
      const g = c.createRadialGradient(o.x, o.y + 4, 1, o.x, o.y, T * 0.5);
      g.addColorStop(0, 'rgba(122,90,255,0.35)'); g.addColorStop(1, 'rgba(122,90,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y, T * 0.5, 0, TAU); c.fill();
    }
  };
}

