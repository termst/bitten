/* src/43-v10-icons.js: v10 icons: powerups, downgrades, curses. From v10. Lines 21152 to 21356 of the v13.7 script. */
/* =====================================================================
   Version 10 icons: every new powerup, downgrade and curse
   ===================================================================== */
function seedIcon10(c, x, y, r, rot, fill = '#4a2c18', edge = '#efd9ad') { seedShape(c, x, y, r, rot); c.fillStyle = fill; c.fill(); c.strokeStyle = edge; c.lineWidth = Math.max(0.6, r * 0.14); c.stroke(); }
function drawItemIcon10(c, id, R, t) {
  const O = '#1a1210';
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (id === 'assseed') {
    miniApple(c, -R * 0.15, -R * 0.05, R * 0.55, '#c92139');
    seedIcon10(c, R * 0.45, R * 0.5 + Math.sin(t * 4) * R * 0.04, R * 0.32, 2.5, '#5a2c18', '#ffb090');
  } else if (id === 'skyrain') {
    c.fillStyle = '#c8d0dc'; for (const [x, y, r] of [[-0.35, -0.45, 0.3], [0, -0.55, 0.36], [0.35, -0.45, 0.3], [0, -0.32, 0.34]]) circle(c, x * R, y * R, r * R);
    for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i / 3) % 1; seedIcon10(c, (i - 1) * R * 0.38, -R * 0.05 + u * R * 0.8, R * 0.18, Math.PI); }
  } else if (id === 'flap') {
    c.fillStyle = '#c88a3a'; c.beginPath(); c.moveTo(-R * 0.75, R * 0.55); c.lineTo(R * 0.75, R * 0.55); c.lineTo(0, -R * 0.65); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#f2d290'; c.beginPath(); c.moveTo(-R * 0.55, R * 0.42); c.lineTo(R * 0.55, R * 0.42); c.lineTo(0, -R * 0.42); c.closePath(); c.fill();
    c.strokeStyle = '#a8682a'; c.lineWidth = R * 0.06; for (const x of [-0.2, 0, 0.2]) { c.beginPath(); c.moveTo(x * R, R * 0.1); c.lineTo(x * R + R * 0.08, R * 0.3); c.stroke(); }
    c.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) circle(c, (i - 2) * R * 0.15, -R * 0.05 + (i % 2) * R * 0.15, R * 0.04);
  } else if (id === 'vitamine') {
    c.fillStyle = '#ff9a2a'; circle(c, 0, 0, R * 0.75); c.strokeStyle = O; c.lineWidth = R * 0.07; c.beginPath(); c.arc(0, 0, R * 0.75, 0, TAU); c.stroke();
    c.fillStyle = '#ffd27a'; circle(c, 0, 0, R * 0.6);
    c.strokeStyle = '#ff9a2a'; c.lineWidth = R * 0.06; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R * 0.58, Math.sin(a) * R * 0.58); c.stroke(); }
    txt10(c, 'C', 0, R * 0.04, Math.round(R * 0.7), '#c8102a');
  } else if (id === 'puntje') {
    rrect(c, -R * 0.55, -R * 0.35, R * 0.8, R * 0.7, R * 0.12); c.fillStyle = '#3a8aff'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#16181c'; circle(c, -R * 0.15, 0, R * 0.16);
    c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(R * 0.05, -R * 0.12); c.lineTo(R * 0.8, -R * 0.12); c.lineTo(R * 0.8, R * 0.12); c.lineTo(R * 0.05, R * 0.12); c.closePath(); c.fill();
    c.fillStyle = '#e8c890'; c.beginPath(); c.moveTo(-R * 0.15, 0); c.lineTo(R * 0.05, -R * 0.12); c.lineTo(R * 0.05, R * 0.12); c.closePath(); c.fill();
  } else if (id === 'elastiek') {
    c.strokeStyle = '#d8a050'; c.lineWidth = R * 0.18; c.beginPath(); c.ellipse(0, 0, R * 0.65, R * 0.38, -0.4 + Math.sin(t * 3) * 0.1, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.5)'; c.lineWidth = R * 0.05; c.beginPath(); c.ellipse(0, -R * 0.03, R * 0.62, R * 0.34, -0.4 + Math.sin(t * 3) * 0.1, 3.4, 5.2); c.stroke();
  } else if (id === 'verrekijker') {
    for (const s of [-1, 1]) { rrect(c, s * R * 0.42 - R * 0.28, -R * 0.45, R * 0.56, R * 0.95, R * 0.2); c.fillStyle = '#2a2e36'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke(); c.fillStyle = '#9fd8ff'; circle(c, s * R * 0.42, R * 0.32, R * 0.2); c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, s * R * 0.42 - R * 0.06, R * 0.26, R * 0.06); }
    c.fillStyle = '#4a4e58'; c.fillRect(-R * 0.16, -R * 0.2, R * 0.32, R * 0.25);
  } else if (id === 'dikkepit') {
    seedIcon10(c, 0, R * 0.05, R * 0.82, 0.35);
    c.fillStyle = 'rgba(255,240,215,0.5)'; circle(c, -R * 0.2, -R * 0.2, R * 0.14);
  } else if (id === 'gympies') {
    c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(-R * 0.8, R * 0.35); c.lineTo(-R * 0.75, -R * 0.2); c.quadraticCurveTo(-R * 0.4, -R * 0.45, -R * 0.1, -R * 0.15); c.quadraticCurveTo(R * 0.5, 0, R * 0.8, R * 0.2); c.lineTo(R * 0.8, R * 0.38); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#e83a3a'; c.fillRect(-R * 0.82, R * 0.3, R * 1.64, R * 0.14);
    c.strokeStyle = '#3a8aff'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 0.4, R * 0.15); c.quadraticCurveTo(0, -R * 0.1, R * 0.4, R * 0.2); c.stroke();
  } else if (id === 'vliegenmepper') {
    c.save(); c.rotate(-0.5 + Math.sin(t * 5) * 0.15);
    c.strokeStyle = '#3a8a3a'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.9); c.lineTo(0, -R * 0.1); c.stroke();
    rrect(c, -R * 0.42, -R * 0.85, R * 0.84, R * 0.8, R * 0.12); c.fillStyle = '#5ac85a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = 'rgba(20,60,20,0.5)'; c.lineWidth = R * 0.03; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-R * 0.42 + i * R * 0.21, -R * 0.85); c.lineTo(-R * 0.42 + i * R * 0.21, -R * 0.05); c.stroke(); c.beginPath(); c.moveTo(-R * 0.42, -R * 0.85 + i * R * 0.2); c.lineTo(R * 0.42, -R * 0.85 + i * R * 0.2); c.stroke(); }
    c.restore();
  } else if (id === 'kaasschaaf') {
    c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(-R * 0.8, R * 0.55); c.lineTo(R * 0.2, R * 0.55); c.lineTo(R * 0.2, -R * 0.05); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
    c.fillStyle = '#c8962a'; for (const [x, y] of [[-0.25, 0.35], [0.02, 0.2], [-0.45, 0.45]]) circle(c, x * R, y * R, R * 0.06);
    c.fillStyle = '#c8ccd4'; rrect(c, -R * 0.2, -R * 0.55, R * 0.8, R * 0.32, R * 0.06); c.fill(); c.stroke();
    c.fillStyle = '#5a3a20'; rrect(c, R * 0.45, -R * 0.42, R * 0.4, R * 0.12, R * 0.05); c.fill();
    c.strokeStyle = '#f8e090'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 0.1, -R * 0.2); c.quadraticCurveTo(R * 0.1, -R * 0.05, R * 0.3, -R * 0.2); c.stroke();
  } else if (id === 'rodestip') {
    rrect(c, -R * 0.8, -R * 0.12, R * 0.9, R * 0.26, R * 0.1); c.fillStyle = '#2a2e36'; c.fill();
    c.strokeStyle = 'rgba(255,40,30,0.8)'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(R * 0.1, 0); c.lineTo(R * 0.6, 0); c.stroke();
    c.fillStyle = '#ff2a1a'; circle(c, R * 0.62, 0, R * (0.12 + Math.sin(t * 8) * 0.03)); c.fillStyle = 'rgba(255,80,60,0.3)'; circle(c, R * 0.62, 0, R * 0.3);
  } else if (id === 'knoflook') {
    c.fillStyle = '#f2ece0'; c.beginPath(); c.moveTo(0, -R * 0.75); c.quadraticCurveTo(R * 0.15, -R * 0.4, R * 0.62, -R * 0.1); c.quadraticCurveTo(R * 0.8, R * 0.55, 0, R * 0.65); c.quadraticCurveTo(-R * 0.8, R * 0.55, -R * 0.62, -R * 0.1); c.quadraticCurveTo(-R * 0.15, -R * 0.4, 0, -R * 0.75); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = 'rgba(160,140,120,0.6)'; c.lineWidth = R * 0.04; for (const x of [-0.3, 0, 0.3]) { c.beginPath(); c.moveTo(x * R * 0.5, -R * 0.45); c.quadraticCurveTo(x * R, R * 0.1, x * R * 0.6, R * 0.6); c.stroke(); }
  } else if (id === 'tulp') {
    c.strokeStyle = '#3a8a3a'; c.lineWidth = R * 0.1; c.beginPath(); c.moveTo(0, R * 0.85); c.lineTo(0, -R * 0.1); c.stroke();
    leafShape(c, 0, R * 0.5, R * 0.6, -0.7);
    c.fillStyle = '#e83a50'; c.beginPath(); c.moveTo(-R * 0.42, -R * 0.1); c.lineTo(-R * 0.42, -R * 0.65); c.lineTo(-R * 0.2, -R * 0.4); c.lineTo(0, -R * 0.75); c.lineTo(R * 0.2, -R * 0.4); c.lineTo(R * 0.42, -R * 0.65); c.lineTo(R * 0.42, -R * 0.1); c.quadraticCurveTo(0, R * 0.2, -R * 0.42, -R * 0.1); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
  } else if (id === 'paraplu') {
    c.fillStyle = '#3a6ad8'; c.beginPath(); c.moveTo(-R * 0.8, 0); c.quadraticCurveTo(0, -R * 1.0, R * 0.8, 0); c.quadraticCurveTo(R * 0.6, -R * 0.12, R * 0.4, 0); c.quadraticCurveTo(R * 0.2, -R * 0.12, 0, 0); c.quadraticCurveTo(-R * 0.2, -R * 0.12, -R * 0.4, 0); c.quadraticCurveTo(-R * 0.6, -R * 0.12, -R * 0.8, 0); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
    c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, R * 0.6); c.quadraticCurveTo(0, R * 0.8, -R * 0.2, R * 0.75); c.stroke();
  } else if (id === 'helm') {
    c.fillStyle = '#3a8aff'; c.beginPath(); c.arc(0, R * 0.2, R * 0.75, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.fillStyle = '#16181c'; for (const x of [-0.4, 0, 0.4]) { rrect(c, x * R - R * 0.08, -R * 0.4, R * 0.16, R * 0.35, R * 0.06); c.fill(); }
    c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.6, R * 0.2); c.lineTo(-R * 0.2, R * 0.6); c.lineTo(R * 0.2, R * 0.6); c.lineTo(R * 0.6, R * 0.2); c.stroke();
  } else if (id === 'nicotine') {
    rrect(c, -R * 0.65, -R * 0.45, R * 1.3, R * 0.9, R * 0.25); c.fillStyle = '#e8c8a8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    rrect(c, -R * 0.35, -R * 0.25, R * 0.7, R * 0.5, R * 0.12); c.fillStyle = '#d8b090'; c.fill();
    c.fillStyle = 'rgba(80,50,30,0.4)'; for (let i = 0; i < 6; i++) circle(c, (i % 3 - 1) * R * 0.18, (Math.floor(i / 3) - 0.5) * R * 0.2, R * 0.03);
  } else if (id === 'peuk') {
    c.save(); c.rotate(-0.4);
    c.fillStyle = '#f2f0ea'; c.fillRect(-R * 0.7, -R * 0.13, R * 1.0, R * 0.26); c.fillStyle = '#d88a3a'; c.fillRect(R * 0.3, -R * 0.13, R * 0.4, R * 0.26);
    c.fillStyle = '#ff6a2a'; c.fillRect(-R * 0.78, -R * 0.13, R * 0.1, R * 0.26); c.fillStyle = 'rgba(255,200,80,0.5)'; circle(c, -R * 0.75, 0, R * 0.2);
    c.restore();
    for (let i = 0; i < 2; i++) { const u = (t * 0.6 + i * 0.5) % 1; c.fillStyle = `rgba(190,190,200,${0.5 * (1 - u)})`; circle(c, -R * 0.6 + Math.sin(u * 6) * R * 0.1, -R * 0.2 - u * R * 0.6, R * (0.1 + u * 0.15)); }
  } else if (id === 'rookgordijn') {
    for (const [x, y, r] of [[-0.35, 0.2, 0.36], [0.3, 0.25, 0.34], [0, -0.15, 0.42], [-0.45, -0.25, 0.24], [0.45, -0.2, 0.26]]) { c.fillStyle = `rgba(170,170,180,${0.75 + 0.1 * Math.sin(t * 2 + x * 5)})`; circle(c, x * R, y * R, r * R); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; circle(c, -R * 0.1, -R * 0.28, R * 0.15);
  } else if (id === 'koptelefoon') {
    c.strokeStyle = '#2a2a30'; c.lineWidth = R * 0.16; c.beginPath(); c.arc(0, R * 0.1, R * 0.6, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    for (const s of [-1, 1]) { rrect(c, s * R * 0.62 - R * 0.2, -R * 0.05, R * 0.4, R * 0.62, R * 0.14); c.fillStyle = '#3a3a44'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke(); c.fillStyle = '#7a6ac8'; rrect(c, s * R * 0.62 - R * 0.12, R * 0.05, R * 0.24, R * 0.42, R * 0.08); c.fill(); }
  } else if (id === 'hyperfocus') {
    c.strokeStyle = '#7cd0ff'; c.lineWidth = R * 0.08;
    for (const r of [0.75, 0.5]) { c.beginPath(); c.arc(0, 0, R * r, 0, TAU); c.stroke(); }
    c.beginPath(); c.moveTo(-R * 0.9, 0); c.lineTo(-R * 0.55, 0); c.moveTo(R * 0.55, 0); c.lineTo(R * 0.9, 0); c.moveTo(0, -R * 0.9); c.lineTo(0, -R * 0.55); c.moveTo(0, R * 0.55); c.lineTo(0, R * 0.9); c.stroke();
    c.fillStyle = '#fff8ec'; ell(c, 0, 0, R * 0.3, R * 0.2); c.fill(); c.fillStyle = '#1a3a6a'; circle(c, 0, 0, R * 0.13);
  } else if (id === 'special') {
    c.fillStyle = '#ffd84a'; c.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * TAU, r = i % 2 ? R * 0.34 : R * 0.8; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = '#d8643a'; circle(c, 0, R * 0.05, R * 0.2); c.fillStyle = '#ffffff'; circle(c, R * 0.05, 0, R * 0.06);
  } else if (id === 'patroon') {
    c.fillStyle = 'rgba(124,208,255,0.5)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) circle(c, (i - 1.5) * R * 0.42, (j - 1.5) * R * 0.42, R * 0.07);
    c.strokeStyle = '#7cd0ff'; c.lineWidth = R * 0.08; c.setLineDash([R * 0.12, R * 0.1]);
    c.beginPath(); c.moveTo(-R * 0.63, R * 0.63); c.lineTo(-R * 0.21, -R * 0.21); c.lineTo(R * 0.21, R * 0.21); c.lineTo(R * 0.63, -R * 0.63); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ffd84a'; circle(c, R * 0.63, -R * 0.63, R * 0.12);
  } else if (id === 'fidget') {
    c.save(); c.rotate(t * 4);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; c.fillStyle = ['#3a9aff', '#ff3a5a', '#ffd23a'][i]; circle(c, Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.3); c.fillStyle = '#16181c'; circle(c, Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, R * 0.1); }
    c.fillStyle = '#e8e8ee'; circle(c, 0, 0, R * 0.22); c.restore();
  } else if (id === 'deken') {
    rrect(c, -R * 0.8, -R * 0.35, R * 1.6, R * 0.8, R * 0.14); c.fillStyle = '#6a5a9a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    rrect(c, -R * 0.8, -R * 0.35, R * 1.6, R * 0.3, R * 0.12); c.fillStyle = '#8a7ac8'; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) circle(c, (i - 1.5) * R * 0.38, R * 0.12 + j * R * 0.2, R * 0.05);
  } else if (id === 'drone') {
    c.fillStyle = '#2a2e36'; rrect(c, -R * 0.3, -R * 0.18, R * 0.6, R * 0.36, R * 0.1); c.fill();
    c.strokeStyle = '#2a2e36'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(-R * 0.65, -R * 0.45); c.lineTo(R * 0.65, R * 0.45); c.moveTo(R * 0.65, -R * 0.45); c.lineTo(-R * 0.65, R * 0.45); c.stroke();
    c.fillStyle = 'rgba(200,210,230,0.65)'; for (const [x, y] of [[-0.65, -0.45], [0.65, -0.45], [-0.65, 0.45], [0.65, 0.45]]) { ell(c, x * R, y * R, R * (0.28 + Math.sin(t * 40) * 0.03), R * 0.08); c.fill(); }
    c.fillStyle = '#ff3a3a'; circle(c, 0, 0, R * 0.07);
  } else if (id === 'stofzuiger') {
    c.fillStyle = '#2a2e36'; circle(c, 0, 0, R * 0.75); c.fillStyle = '#5a606c'; circle(c, 0, 0, R * 0.62);
    c.fillStyle = '#1a1c22'; c.fillRect(R * 0.35, -R * 0.25, R * 0.25, R * 0.5);
    c.fillStyle = '#3aff8a'; circle(c, -R * 0.2, -R * 0.2, R * 0.08);
    c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = R * 0.05; c.beginPath(); c.arc(0, 0, R * 0.45, -2.4, -0.8); c.stroke();
  } else if (id === 'garantie') {
    c.fillStyle = '#e8ecf4'; c.beginPath(); c.moveTo(0, -R * 0.8); c.lineTo(R * 0.65, -R * 0.5); c.lineTo(R * 0.55, R * 0.35); c.lineTo(0, R * 0.8); c.lineTo(-R * 0.55, R * 0.35); c.lineTo(-R * 0.65, -R * 0.5); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.strokeStyle = '#3aa84a'; c.lineWidth = R * 0.14; c.beginPath(); c.moveTo(-R * 0.3, 0); c.lineTo(-R * 0.05, R * 0.25); c.lineTo(R * 0.35, -R * 0.25); c.stroke();
  } else if (id === 'supermeter') {
    rrect(c, -R * 0.85, -R * 0.2, R * 1.7, R * 0.4, R * 0.18); c.fillStyle = '#1a1a2a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.05; c.stroke();
    const f = 0.35 + 0.6 * ((t * 0.3) % 1);
    rrect(c, -R * 0.78, -R * 0.13, R * 1.56 * f, R * 0.26, R * 0.12); c.fillStyle = '#ffd84a'; c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(R * 0.1, -R * 0.75); c.lineTo(-R * 0.15, -R * 0.3); c.lineTo(R * 0.02, -R * 0.3); c.lineTo(-R * 0.1, R * 0.05); c.lineTo(R * 0.2, -R * 0.42); c.lineTo(R * 0.03, -R * 0.42); c.closePath(); c.fill();
  } else if (id === 'powercube') {
    c.fillStyle = '#1a6a1a'; c.beginPath(); c.moveTo(0, -R * 0.8); c.lineTo(R * 0.7, -R * 0.4); c.lineTo(R * 0.7, R * 0.4); c.lineTo(0, R * 0.8); c.lineTo(-R * 0.7, R * 0.4); c.lineTo(-R * 0.7, -R * 0.4); c.closePath(); c.fill();
    c.fillStyle = '#5ae85a'; c.beginPath(); c.moveTo(0, -R * 0.8); c.lineTo(R * 0.7, -R * 0.4); c.lineTo(0, 0); c.lineTo(-R * 0.7, -R * 0.4); c.closePath(); c.fill();
    c.fillStyle = '#3ac83a'; c.beginPath(); c.moveTo(-R * 0.7, -R * 0.4); c.lineTo(0, 0); c.lineTo(0, R * 0.8); c.lineTo(-R * 0.7, R * 0.4); c.closePath(); c.fill();
    c.strokeStyle = O; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(0, -R * 0.8); c.lineTo(R * 0.7, -R * 0.4); c.lineTo(R * 0.7, R * 0.4); c.lineTo(0, R * 0.8); c.lineTo(-R * 0.7, R * 0.4); c.lineTo(-R * 0.7, -R * 0.4); c.closePath(); c.stroke();
  } else if (id === 'bosje') {
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; c.fillStyle = i % 2 ? '#3a8a3a' : '#4aa04a'; circle(c, Math.cos(a) * R * 0.38, Math.sin(a) * R * 0.3, R * 0.38); }
    c.fillStyle = '#5ab84a'; circle(c, 0, -R * 0.05, R * 0.42);
    c.fillStyle = '#ffe14a'; for (const s of [-1, 1]) circle(c, s * R * 0.16, 0, R * 0.08);
  } else if (id === 'pepernoot') {
    for (const [x, y] of [[-0.35, -0.2], [0.3, -0.3], [0, 0.25], [-0.45, 0.4], [0.45, 0.35]]) { c.fillStyle = '#5a3414'; circle(c, x * R + R * 0.03, y * R + R * 0.04, R * 0.24); c.fillStyle = '#c88a44'; circle(c, x * R, y * R, R * 0.22); c.fillStyle = 'rgba(255,220,160,0.4)'; circle(c, x * R - R * 0.06, y * R - R * 0.06, R * 0.07); }
  } else if (id === 'clownneus') {
    c.fillStyle = '#c8102a'; circle(c, 0, 0, R * 0.62); c.fillStyle = '#e8203a'; circle(c, -R * 0.06, -R * 0.06, R * 0.52);
    c.fillStyle = 'rgba(255,255,255,0.6)'; circle(c, -R * 0.22, -R * 0.22, R * 0.14);
  } else if (id === 'ballon') {
    drawBalloon10(c, { x: 0, y: R * 0.05, r: R * 0.55, col: '#ff3a5a', seed: 1, life: 9, t: 0 }, t, false);
  } else if (id === 'hypercharge') {
    c.fillStyle = 'rgba(200,106,255,0.3)'; circle(c, 0, 0, R * 0.9);
    c.fillStyle = '#c86aff'; c.beginPath(); c.moveTo(R * 0.15, -R * 0.85); c.lineTo(-R * 0.4, R * 0.1); c.lineTo(-R * 0.02, R * 0.1); c.lineTo(-R * 0.2, R * 0.85); c.lineTo(R * 0.45, -R * 0.15); c.lineTo(R * 0.05, -R * 0.15); c.closePath(); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = R * 0.05; c.stroke();
  } else if (id === 'magnetron') {
    rrect(c, -R * 0.85, -R * 0.55, R * 1.7, R * 1.1, R * 0.1); c.fillStyle = '#e8eaee'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    rrect(c, -R * 0.72, -R * 0.42, R * 1.05, R * 0.84, R * 0.06); c.fillStyle = `rgba(255,${200 + Math.floor(Math.sin(t * 6) * 40)},100,0.75)`; c.fill();
    c.fillStyle = '#5a606c'; for (let i = 0; i < 3; i++) circle(c, R * 0.6, -R * 0.25 + i * R * 0.25, R * 0.07);
  } else if (id === 'inzone') {
    for (const [r, a] of [[0.85, 0.3], [0.6, 0.5], [0.35, 0.8]]) { c.strokeStyle = `rgba(124,208,255,${a})`; c.lineWidth = R * 0.1; c.beginPath(); c.arc(0, 0, R * r, t * (1 + r), t * (1 + r) + 4.8); c.stroke(); }
    c.fillStyle = '#7cd0ff'; circle(c, 0, 0, R * 0.14);
  } else if (id === 'gasmasker') {
    c.fillStyle = '#3a3e34'; ell(c, 0, -R * 0.05, R * 0.7, R * 0.75); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    for (const s of [-1, 1]) { c.fillStyle = '#0c0e0a'; circle(c, s * R * 0.3, -R * 0.2, R * 0.22); c.fillStyle = 'rgba(160,200,220,0.75)'; circle(c, s * R * 0.3, -R * 0.2, R * 0.16); }
    c.fillStyle = '#1a1a16'; rrect(c, -R * 0.22, R * 0.2, R * 0.44, R * 0.5, R * 0.1); c.fill();
    c.fillStyle = '#6a6a5a'; for (let i = 0; i < 3; i++) c.fillRect(-R * 0.16, R * 0.28 + i * R * 0.13, R * 0.32, R * 0.05);
  } else if (id === 'meeuw') {
    drawGull10(c, 0, 0, R / 10.5, Math.sin(t * 6) * 0.8 + 0.3);
  } else if (id === 'beker') {
    c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(-R * 0.5, -R * 0.7); c.lineTo(R * 0.5, -R * 0.7); c.quadraticCurveTo(R * 0.5, R * 0.15, 0, R * 0.2); c.quadraticCurveTo(-R * 0.5, R * 0.15, -R * 0.5, -R * 0.7); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.strokeStyle = '#ffd23a'; c.lineWidth = R * 0.1; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.55, -R * 0.4, R * 0.2, s > 0 ? -1.5 : 1.6, s > 0 ? 1.6 : 4.7); c.stroke(); }
    c.fillStyle = '#c8a020'; c.fillRect(-R * 0.1, R * 0.18, R * 0.2, R * 0.3); rrect(c, -R * 0.4, R * 0.45, R * 0.8, R * 0.25, R * 0.06); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(-R * 0.3, -R * 0.6, R * 0.1, R * 0.4);
  } else if (id === 'reuzenkracht') {
    c.fillStyle = '#d8643a'; c.beginPath(); c.moveTo(-R * 0.75, R * 0.5); c.quadraticCurveTo(-R * 0.8, -R * 0.1, -R * 0.3, -R * 0.2); c.quadraticCurveTo(-R * 0.1, -R * 0.75, R * 0.35, -R * 0.6); c.quadraticCurveTo(R * 0.75, -R * 0.45, R * 0.55, -R * 0.1); c.quadraticCurveTo(R * 0.3, R * 0.05, R * 0.1, R * 0.05); c.quadraticCurveTo(R * 0.4, R * 0.55, -R * 0.1, R * 0.6); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.07; c.stroke();
    c.strokeStyle = '#8a1a10'; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.4, R * 0.1); c.quadraticCurveTo(-R * 0.1, -R * 0.1, R * 0.05, R * 0.3); c.stroke();
    c.fillStyle = 'rgba(255,140,80,0.4)'; circle(c, R * 0.6, -R * 0.65, R * 0.15); circle(c, R * 0.78, -R * 0.38, R * 0.1);
  }
}
function drawDownIcon10(c, id, R, t) {
  const O = '#1a1210';
  if (id === 'tinypit') { seedIcon10(c, 0, 0, R * 0.3, 0.35); c.strokeStyle = 'rgba(236,226,212,0.4)'; c.setLineDash([R * 0.1, R * 0.1]); c.lineWidth = R * 0.05; c.beginPath(); c.arc(0, 0, R * 0.6, 0, TAU); c.stroke(); c.setLineDash([]); }
  else if (id === 'kortadem') { seedIcon10(c, -R * 0.5, 0, R * 0.25, Math.PI / 2); c.strokeStyle = '#e8e2d0'; c.lineWidth = R * 0.08; c.setLineDash([R * 0.12, R * 0.12]); c.beginPath(); c.moveTo(-R * 0.25, 0); c.lineTo(R * 0.2, 0); c.stroke(); c.setLineDash([]); c.fillStyle = '#e83a50'; c.fillRect(R * 0.25, -R * 0.3, R * 0.08, R * 0.6); }
  else if (id === 'natlont') { c.strokeStyle = '#8a6a3a'; c.lineWidth = R * 0.12; c.beginPath(); c.moveTo(-R * 0.7, R * 0.4); c.quadraticCurveTo(0, -R * 0.4, R * 0.5, -R * 0.2); c.stroke(); c.fillStyle = '#5ab0ff'; for (const [x, y] of [[0.2, 0.3], [0.5, 0.15], [-0.1, 0.55]]) { c.beginPath(); c.moveTo(x * R, y * R - R * 0.15); c.quadraticCurveTo(x * R + R * 0.1, y * R, x * R, y * R + R * 0.08); c.quadraticCurveTo(x * R - R * 0.1, y * R, x * R, y * R - R * 0.15); c.fill(); } }
  else if (id === 'dunschil') { c.strokeStyle = '#d92a40'; c.lineWidth = R * 0.06; c.beginPath(); for (let i = 0; i <= 30; i++) { const a = i * 0.4, r = R * (0.15 + i * 0.022); const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
  else if (id === 'hoest') { for (const [x, y, r] of [[-0.2, -0.1, 0.3], [0.2, -0.2, 0.25], [0.05, 0.2, 0.28]]) { c.fillStyle = 'rgba(170,170,180,0.85)'; circle(c, x * R, y * R, r * R); } txt10(c, 'KUCH', 0, R * 0.62, Math.round(R * 0.32), '#e8e2d0'); }
  else if (id === 'deuk') { miniApple(c, 0, R * 0.05, R * 0.7, '#c92139'); c.fillStyle = 'rgba(40,0,8,0.55)'; ell(c, R * 0.3, -R * 0.05, R * 0.22, R * 0.14, 0.6); c.fill(); }
  else if (id === 'lek') { rrect(c, -R * 0.7, -R * 0.45, R * 1.3, R * 0.8, R * 0.14); c.fillStyle = '#7a4a2a'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke(); c.fillStyle = '#0c0806'; circle(c, R * 0.1, R * 0.2, R * 0.12); c.fillStyle = '#ffd84a'; circle(c, R * 0.15, R * 0.55 + ((t * 0.8) % 1) * R * 0.3, R * 0.12); }
  else if (id === 'maandag') { rrect(c, -R * 0.6, -R * 0.6, R * 1.2, R * 1.2, R * 0.1); c.fillStyle = '#f2ecd8'; c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke(); c.fillStyle = '#3a6ad8'; c.fillRect(-R * 0.6, -R * 0.6, R * 1.2, R * 0.3); txt10(c, 'MA', 0, R * 0.12, Math.round(R * 0.55), '#2a2a30'); }
}
function drawCurseIcon10(c, id, R, t) {
  const O = '#1a1210';
  if (id === 'ketting') {
    for (let i = 0; i < 3; i++) { c.save(); c.translate((i - 1) * R * 0.4, (i - 1) * R * 0.25); c.rotate(-0.6); c.fillStyle = '#f2f0ea'; c.fillRect(-R * 0.35, -R * 0.09, R * 0.5, R * 0.18); c.fillStyle = '#d88a3a'; c.fillRect(R * 0.15, -R * 0.09, R * 0.2, R * 0.18); c.fillStyle = '#ff6a2a'; c.fillRect(-R * 0.4, -R * 0.09, R * 0.06, R * 0.18); c.restore(); }
  } else if (id === 'glimlach') {
    drawScareFace10(c, 0, 0, R * 0.62, 1);
  } else if (id === 'woede') {
    c.fillStyle = '#c4422a'; circle(c, 0, R * 0.08, R * 0.6); c.strokeStyle = O; c.lineWidth = R * 0.06; c.beginPath(); c.arc(0, R * 0.08, R * 0.6, 0, TAU); c.stroke();
    c.strokeStyle = '#2a0602'; c.lineWidth = R * 0.1; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.4, -R * 0.15); c.lineTo(s * R * 0.1, R * 0.0); c.stroke(); }
    c.beginPath(); c.moveTo(-R * 0.25, R * 0.38); c.lineTo(R * 0.25, R * 0.38); c.stroke();
    for (let i = 0; i < 2; i++) { const u = (t + i * 0.5) % 1; c.fillStyle = `rgba(240,240,240,${0.6 * (1 - u)})`; circle(c, (i ? 1 : -1) * R * 0.5, -R * 0.55 - u * R * 0.3, R * (0.1 + u * 0.1)); }
  } else if (id === 'hyperactief') {
    c.strokeStyle = '#ffd84a'; c.lineWidth = R * 0.12;
    c.beginPath(); c.moveTo(-R * 0.8, 0); for (let i = 1; i <= 8; i++) c.lineTo(-R * 0.8 + i * R * 0.2, (i % 2 ? -1 : 1) * R * 0.35 * (0.7 + 0.3 * Math.sin(t * 10 + i))); c.stroke();
  } else if (id === 'uitverkoop') {
    c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(-R * 0.75, -R * 0.35); c.lineTo(R * 0.4, -R * 0.35); c.lineTo(R * 0.8, 0); c.lineTo(R * 0.4, R * 0.35); c.lineTo(-R * 0.75, R * 0.35); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = R * 0.06; c.stroke();
    c.fillStyle = O; circle(c, R * 0.45, 0, R * 0.08);
    txt10(c, '-50%', -R * 0.15, R * 0.02, Math.round(R * 0.36), '#c8102a');
  }
}

