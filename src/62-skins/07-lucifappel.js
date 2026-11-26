/* 62.js section 07: lucifappel. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { SKINS, bites24, drawBlok132, drawBon132, drawHand132, drawKapper132, drawOuro132, drawPomp132, drawPrik132, drawTel132, handWings132, lw27, rnd24, skinBody24 } = S62;
  S62.drawLucifer134 = drawLucifer134; S62.drawMelt134 = drawMelt134; S62.epic122 = epic122;
  /* ------------------------------------------------------------------ v13.4: Lucifappel, redrawn and three new looks */
  const INK134 = '#0e0a08';
  const eye134 = (st) => ({ o: clamp(st.blink == null ? 1 : st.blink, 0.07, 1), lx: clamp(st.lookX || 0, -1, 1), ly: clamp(st.lookY || 0, -1, 1) });
  const bz134 = (a, b, d, e, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * d[0] + u * u * u * e[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * d[1] + u * u * u * e[1]]; };
  const bzd134 = (a, b, d, e, u) => { const v = 1 - u; return [3 * v * v * (b[0] - a[0]) + 6 * v * u * (d[0] - b[0]) + 3 * u * u * (e[0] - d[0]), 3 * v * v * (b[1] - a[1]) + 6 * v * u * (d[1] - b[1]) + 3 * u * u * (e[1] - d[1])]; };
  // a curved horn that tapers to a point, mirrored by s. pts are four bezier points in R units.
  function horn134(c, R, s, pts, w, g0, g1, rings) {
    const P = pts.map((p) => [s * p[0] * R, p[1] * R]), N = 18, A = [], B = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = bz134(P[0], P[1], P[2], P[3], u), d = bzd134(P[0], P[1], P[2], P[3], u), l = Math.hypot(d[0], d[1]) || 1;
      const hw = R * w * Math.pow(1 - u, 0.8) + R * 0.012, nx = -d[1] / l, ny = d[0] / l;
      A.push([p[0] + nx * hw, p[1] + ny * hw]); B.push([p[0] - nx * hw, p[1] - ny * hw]);
    }
    c.beginPath(); c.moveTo(A[0][0], A[0][1]);
    for (let i = 1; i <= N; i++) c.lineTo(A[i][0], A[i][1]);
    for (let i = N; i >= 0; i--) c.lineTo(B[i][0], B[i][1]);
    c.closePath();
    const g = c.createLinearGradient(P[0][0], P[0][1], P[3][0], P[3][1]); g.addColorStop(0, g0); g.addColorStop(1, g1);
    c.fillStyle = g; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.07); c.stroke();
    if (rings) { c.strokeStyle = 'rgba(14,10,8,0.6)'; c.lineWidth = lw27(R, 0.04); for (let k = 1; k <= rings; k++) { const i = Math.round((k / (rings + 1)) * N * 0.85); c.beginPath(); c.moveTo(A[i][0], A[i][1]); c.lineTo(B[i][0], B[i][1]); c.stroke(); } }
    c.strokeStyle = 'rgba(255,240,200,0.4)'; c.lineWidth = lw27(R, 0.028); c.beginPath(); c.moveTo(A[2][0], A[2][1]); for (let i = 3; i < N - 3; i++) c.lineTo(A[i][0], A[i][1]); c.stroke();
  }
  // a bat wing: arm, three fingers, scalloped skin between them. s mirrors it.
  function wing134(c, R, s, t, col0, col1, bone) {
    const fl = Math.sin(t * 2.3 + (s > 0 ? 0 : 0.5)) * 0.06;
    const sh = [0.8, 0.12], wr = [1.5, -0.78 + fl], tp = [[1.92, -0.14 + fl * 1.6], [1.72, 0.34 + fl], [1.3, 0.68 + fl * 0.5]], rt = [0.88, 0.55], el = [1.08, -0.98 + fl];
    const X = (p) => p[0] * R, Y = (p) => p[1] * R;
    const sc = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return [m[0] + (sh[0] - m[0]) * 0.3, m[1] + (sh[1] - m[1]) * 0.3]; };
    c.save(); c.scale(s, 1);
    c.beginPath(); c.moveTo(X(sh), Y(sh)); c.quadraticCurveTo(X(el), Y(el), X(wr), Y(wr)); c.lineTo(X(tp[0]), Y(tp[0]));
    for (let i = 0; i < 2; i++) { const m = sc(tp[i], tp[i + 1]); c.quadraticCurveTo(X(m), Y(m), X(tp[i + 1]), Y(tp[i + 1])); }
    { const m = sc(tp[2], rt); c.quadraticCurveTo(X(m), Y(m), X(rt), Y(rt)); }
    c.closePath();
    const g = c.createLinearGradient(X(sh), 0, X(tp[0]), 0); g.addColorStop(0, col0); g.addColorStop(1, col1);
    c.fillStyle = g; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.07); c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = bone; c.lineWidth = lw27(R, 0.06); c.lineCap = 'round';
    for (const p of tp) { c.beginPath(); c.moveTo(X(wr), Y(wr)); c.lineTo(X(p), Y(p)); c.stroke(); }
    c.beginPath(); c.moveTo(X(sh), Y(sh)); c.quadraticCurveTo(X(el), Y(el), X(wr), Y(wr)); c.stroke();
    c.fillStyle = '#e2b04e'; c.beginPath(); c.moveTo(X(wr) - R * 0.05, Y(wr) + R * 0.02); c.lineTo(X(wr) + R * 0.12, Y(wr) - R * 0.22); c.lineTo(X(wr) + R * 0.12, Y(wr) + R * 0.06); c.closePath(); c.fill();
    c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.03); c.stroke();
    c.restore();
  }
  function pentagram134(c, x, y, r, col, lwid) {
    c.strokeStyle = col; c.lineWidth = lwid; c.beginPath();
    for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + ((i * 2) % 5) * (TAU / 5); const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.stroke(); c.beginPath(); c.arc(x, y, r * 1.18, 0, TAU); c.stroke();
  }
  function emberRise134(c, R, t, n, x0, y0, spread, rise, col) {
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.45 * (0.6 + rnd24(i + 5)) + rnd24(i)) % 1, a = Math.sin(ph * Math.PI);
      glowDot(c, x0 + (rnd24(i + 2) - 0.5) * spread * R + Math.sin(t * 2 + i) * R * 0.06, y0 - ph * rise * R, R * (0.07 + rnd24(i + 9) * 0.07), i % 3 ? col : '#ffe08a', 0.85 * a);
    }
  }

  /* Lucifappel: Lucifer, the devil on the match label. Horns, wings, a spade tail, a hellfire crown. */
  function drawLucifer134(c, R, st) {
    const t = st.t || 0, fear = st.fear || 0, e = eye134(st);
    glowDot(c, 0, R * 0.1, R * 2.1, '#ff2a10', 0.16);
    wing134(c, R, -1, t, '#a01220', '#3a050c', '#14080a'); wing134(c, R, 1, t, '#a01220', '#3a050c', '#14080a');
    // the tail ends in a spade
    const tx = R * 1.74, ty = R * 0.56 + Math.sin(t * 3) * R * 0.05;
    c.lineCap = 'round'; c.strokeStyle = INK134; c.lineWidth = R * 0.14; c.beginPath(); c.moveTo(R * 0.55, R * 0.82); c.bezierCurveTo(R * 0.95, R * 1.55, R * 1.95, R * 1.25, tx, ty); c.stroke();
    c.strokeStyle = '#6a0c14'; c.lineWidth = R * 0.07; c.stroke();
    c.save(); c.translate(tx, ty); c.rotate(-0.9 + Math.sin(t * 3) * 0.16);
    c.beginPath(); c.moveTo(0, -R * 0.36); c.bezierCurveTo(R * 0.34, -R * 0.1, R * 0.28, R * 0.14, 0, R * 0.04); c.bezierCurveTo(-R * 0.28, R * 0.14, -R * 0.34, -R * 0.1, 0, -R * 0.36); c.closePath();
    c.fillStyle = '#e8222c'; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.06); c.stroke(); c.restore();
    for (const s of [-1, 1]) horn134(c, R, s, [[0.34, -0.74], [1.02, -1.0], [1.52, -1.34], [1.02, -1.94]], 0.3, '#3a0a0c', '#ffe08a', 4);
    // the body: hot red, lit from below
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2);
    g.addColorStop(0, '#ff6a48'); g.addColorStop(0.4, '#d81c28'); g.addColorStop(0.78, '#8e0a16'); g.addColorStop(1, '#3a0408');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const gb = c.createLinearGradient(0, R * 0.1, 0, R); gb.addColorStop(0, 'rgba(255,120,30,0)'); gb.addColorStop(1, 'rgba(255,150,40,0.5)'); c.fillStyle = gb; c.fillRect(-R * 1.2, R * 0.1, R * 2.4, R * 1.0);
    c.fillStyle = 'rgba(90,4,12,0.35)';
    for (let y = -R; y < R; y += R * 0.14) for (let x = -R; x < R; x += R * 0.14) circle(c, x + ((y / (R * 0.14)) % 2 ? R * 0.07 : 0), y, R * 0.028 * (0.4 + (y + R) / (2 * R)));
    // black hair with a widow's peak
    c.fillStyle = '#16070a'; c.beginPath(); c.moveTo(-R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 1.3); c.lineTo(R * 1.3, -R * 0.36);
    c.quadraticCurveTo(R * 0.8, -R * 0.5, R * 0.42, -R * 0.5); c.quadraticCurveTo(R * 0.12, -R * 0.46, 0, -R * 0.3); c.quadraticCurveTo(-R * 0.12, -R * 0.46, -R * 0.42, -R * 0.5);
    c.quadraticCurveTo(-R * 0.8, -R * 0.5, -R * 1.3, -R * 0.36); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,170,150,0.22)'; c.lineWidth = lw27(R, 0.035);
    for (const x of [-0.7, -0.4, 0.4, 0.7]) { c.beginPath(); c.moveTo(x * R, -R * 0.95); c.quadraticCurveTo(x * R * 1.1, -R * 0.75, x * R * 0.9, -R * 0.55); c.stroke(); }
    c.fillStyle = 'rgba(255,215,190,0.28)'; ell(c, -R * 0.45, -R * 0.3, R * 0.3, R * 0.17, -0.6); c.fill();
    // the gold label frame
    c.save(); c.scale(0.86, 0.88); applePath(c, R); c.restore();
    c.strokeStyle = '#e2b04e'; c.lineWidth = Math.max(0.6, R * 0.055); c.stroke();
    c.restore();
    applePath(c, R); c.strokeStyle = INK134; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    lucifBanner26(c, R, R * 0.8, R * 0.84, R * 0.22, '#e2b04e', true);
    if (st.face !== false) {
      pentagram134(c, 0, -R * 0.52, R * 0.085, '#ffd36a', lw27(R, 0.03));
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = e.ly * R * 0.02, o = e.o;
        glowDot(c, ex, ey, R * 0.5, '#ffcc33', 0.28);
        c.beginPath(); c.moveTo(ex - s * R * 0.23, ey + R * 0.09); c.quadraticCurveTo(ex - s * R * 0.02, ey - R * 0.22 * o, ex + s * R * 0.26, ey - R * 0.12);
        c.quadraticCurveTo(ex, ey + R * 0.17 * o, ex - s * R * 0.23, ey + R * 0.09); c.closePath();
        const eg = c.createRadialGradient(ex, ey, 0, ex, ey, R * 0.27); eg.addColorStop(0, '#fffde0'); eg.addColorStop(1, '#ffb41e');
        c.fillStyle = eg; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.stroke();
        if (o > 0.3) { c.fillStyle = INK134; ell(c, ex + e.lx * R * 0.05, ey - R * 0.01, R * 0.03, R * 0.11 * o); c.fill(); }
        const by = -R * 0.17 - fear * R * 0.03;
        c.fillStyle = INK134; c.beginPath(); c.moveTo(s * R * 0.03, by + R * 0.05); c.lineTo(s * R * 0.6, by - R * 0.26); c.lineTo(s * R * 0.56, by - R * 0.1); c.lineTo(s * R * 0.12, by + R * 0.12); c.closePath(); c.fill();
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.075); c.beginPath(); c.moveTo(s * R * 0.05, R * 0.21); c.quadraticCurveTo(s * R * 0.3, R * 0.35, s * R * 0.5, R * 0.21); c.quadraticCurveTo(s * R * 0.58, R * 0.15, s * R * 0.53, R * 0.07); c.stroke();
      }
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.42, R * 0.14, R * 0.16); c.fillStyle = '#2a0206'; c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.stroke(); }
      else {
        c.beginPath(); c.moveTo(-R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.7, R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.39, -R * 0.34, R * 0.31); c.closePath();
        c.fillStyle = '#2a0206'; c.fill();
        c.fillStyle = '#fffaf0'; for (let i = 0; i < 6; i++) { const x = -R * 0.27 + i * R * 0.108, big = i === 1 || i === 4; c.beginPath(); c.moveTo(x, R * 0.335); c.lineTo(x + R * 0.08, R * 0.335); c.lineTo(x + R * 0.04, R * (big ? 0.5 : 0.43)); c.closePath(); c.fill(); }
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.34, R * 0.31); c.quadraticCurveTo(0, R * 0.7, R * 0.34, R * 0.31); c.stroke();
      }
      // a pointed goatee
      c.fillStyle = '#16070a'; c.beginPath(); c.moveTo(-R * 0.16, R * 0.56); c.quadraticCurveTo(0, R * 0.62, R * 0.16, R * 0.56); c.lineTo(0, R * 1.06); c.closePath(); c.fill();
      c.strokeStyle = '#e2b04e'; c.lineWidth = lw27(R, 0.03); c.stroke();
    }
    // the trident is three matches tied together, all lit
    c.save(); c.translate(-R * 1.08, R * 0.2); c.rotate(-0.18 + Math.sin(t * 2) * 0.04);
    c.strokeStyle = INK134; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(0, R * 0.9); c.lineTo(0, -R * 0.5); c.stroke();
    c.strokeStyle = '#8a5a2a'; c.lineWidth = R * 0.09; c.stroke();
    for (const k of [-1, 0, 1]) lucifMatch26(c, k * R * 0.08, -R * 0.4, k * R * 0.24, -R * 1.02 + Math.abs(k) * R * 0.1, R * 0.9, t + k, true);
    c.fillStyle = '#e2b04e'; c.fillRect(-R * 0.16, -R * 0.5, R * 0.32, R * 0.1);
    c.restore();
    // the stem is a lit match with a flame crown
    lucifMatch26(c, R * 0.02, -R * 0.64, R * 0.12, -R * 1.34, R, t, true);
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06, hx = R * 0.14, hy = -R * 1.5;
    glowDot(c, hx, hy - R * 0.15, R * 1.0, '#ff4a10', 0.35);
    for (const [dx, h, w] of [[-0.2, 0.46, 0.12], [0.2, 0.4, 0.11]]) { flameShape(c, hx + dx * R, hy, w * R * f, h * R * f); c.fillStyle = '#ff6a1a'; c.fill(); flameShape(c, hx + dx * R, hy + R * 0.05, w * R * f * 0.5, h * R * f * 0.55); c.fillStyle = '#ffd36a'; c.fill(); }
    emberRise134(c, R, t, 5, hx, hy, 1.2, 0.6, '#ff7a1a');
  }

  /* Lucifappel: Smeltkop. Struck one time too many: a box of red wax, running. */
  // a drip as plain subpaths (a wobbling tube and a round end), so a whole group can be outlined and filled as one shape
  function dripPath134(c, R, x, y0, len, w, ph) {
    const N = 12, A = [], B = [], sway = R * 0.03;
    for (let i = 0; i <= N; i++) {
      const u = i / N, y = y0 + len * u, cx = x + Math.sin(u * 3.2 + (ph || 0)) * sway * u, hw = w * (0.9 - 0.5 * Math.min(1, u / 0.7));
      A.push([cx - hw, y]); B.push([cx + hw, y]);
    }
    const br = w * 0.82, ex = (A[N][0] + B[N][0]) / 2, ey = y0 + len - br * 0.25;
    c.moveTo(A[0][0], A[0][1]);
    for (let i = 1; i <= N; i++) c.lineTo(A[i][0], A[i][1]);
    for (let i = N; i >= 0; i--) c.lineTo(B[i][0], B[i][1]);
    c.closePath(); c.moveTo(ex + br, ey); c.arc(ex, ey, br, 0, TAU, true); c.closePath();
    return { x: ex, y: ey, r: br };
  }
  function drawMelt134(c, R, st) {
    const t = st.t || 0, e = eye134(st), INKR = '#2a0406';
    glowDot(c, 0, R * 0.3, R * 1.9, '#ff4a10', 0.18);
    // the pool it stands in
    const pg = c.createRadialGradient(0, R * 1.04, 0, 0, R * 1.04, R * 1.5); pg.addColorStop(0, 'rgba(214,30,36,0.95)'); pg.addColorStop(0.65, 'rgba(120,10,16,0.9)'); pg.addColorStop(1, 'rgba(60,4,8,0)');
    c.fillStyle = pg; ell(c, 0, R * 1.06, R * 1.5, R * 0.27); c.fill();
    c.fillStyle = 'rgba(255,170,140,0.4)'; ell(c, -R * 0.4, R * 1.0, R * 0.42, R * 0.05); c.fill();
    for (const [x, ph] of [[-1.0, 0], [1.02, 0.5]]) { const k = (t * 0.6 + ph) % 1; c.strokeStyle = `rgba(255,150,120,${0.6 * (1 - k)})`; c.lineWidth = lw27(R, 0.03); ell(c, x * R, R * 1.14, R * (0.08 + k * 0.3), R * (0.03 + k * 0.07)); c.stroke(); }
    // the apple and the wax running off its sides are one shape: one outline, no seams
    const SIDE = [[-1.0, 1.12, 0.17], [-0.93, 0.8, 0.12], [0.96, 0.92, 0.13], [1.02, 1.12, 0.17]], ends = [];
    const sidePath = () => { applePath(c, R); SIDE.forEach(([x, endY, w], i) => { const y0 = -R * 0.05, d = dripPath134(c, R, x * R, y0, endY * R - y0 + Math.sin(t * 0.9 + i * 1.7) * R * 0.04, w * R, i); ends[i] = d; }); };
    sidePath(); c.lineJoin = 'round'; c.strokeStyle = INKR; c.lineWidth = Math.max(1.4, R * 0.2); c.stroke();
    sidePath(); c.fillStyle = '#b0121c'; c.fill();
    const g = c.createRadialGradient(-R * 0.34, -R * 0.4, R * 0.06, 0, 0, R * 1.2);
    g.addColorStop(0, '#ff9468'); g.addColorStop(0.35, '#e83a1c'); g.addColorStop(0.75, '#a60f18'); g.addColorStop(1, '#4a0608');
    applePath(c, R); c.fillStyle = g; c.fill();
    for (const d of ends) { c.fillStyle = 'rgba(255,170,150,0.7)'; ell(c, d.x - d.r * 0.3, d.y - d.r * 0.1, d.r * 0.2, d.r * 0.4); c.fill(); }
    c.save(); applePath(c, R); c.clip();
    glowDot(c, 0, R * 0.35, R * 1.0, '#ffb040', 0.4);
    // the black strip and its gold rules slid down and sag in the middle
    c.lineCap = 'butt'; c.strokeStyle = INK134; c.lineWidth = R * 0.34; c.beginPath(); c.moveTo(-R * 1.2, R * 0.58); c.quadraticCurveTo(0, R * 1.02, R * 1.2, R * 0.62); c.stroke();
    c.strokeStyle = '#e2b04e'; c.lineWidth = lw27(R, 0.04);
    for (const dy of [-0.11, 0.11]) { c.beginPath(); c.moveTo(-R * 1.2, R * (0.58 + dy)); c.quadraticCurveTo(0, R * (1.02 + dy), R * 1.2, R * (0.62 + dy)); c.stroke(); }
    // a thick layer of wax over the top, tongues running down the front
    const edge = (x) => { const a = Math.abs(x), u = Math.min(1, Math.max(0, (a - 0.45) / 0.55)); return -0.36 + 0.56 * u * u * (3 - 2 * u) + Math.max(0, a - 1) * 1.4 + Math.sin(x * 5.2 + 1.3) * 0.03; };
    const TONG = [];
    const capPath = () => {
      c.beginPath(); c.moveTo(-R * 1.6, -R * 1.6); c.lineTo(R * 1.6, -R * 1.6); for (let x = 1.6; x >= -1.6; x -= 0.08) c.lineTo(x * R, edge(x) * R); c.closePath();
      TONG.forEach(([x, endY, w], i) => { const y0 = edge(x) * R - R * 0.1; dripPath134(c, R, x * R, y0, endY * R - y0 + Math.sin(t * 0.8 + i * 2) * R * 0.04, w * R, i + 3); });
    };
    capPath(); c.strokeStyle = 'rgba(42,4,6,0.6)'; c.lineWidth = lw27(R, 0.07); c.lineJoin = 'round'; c.stroke();
    capPath(); const cg = c.createLinearGradient(0, -R, 0, R * 0.2); cg.addColorStop(0, '#4a0810'); cg.addColorStop(1, '#c4182a'); c.fillStyle = cg; c.fill();
    c.fillStyle = 'rgba(255,220,200,0.5)'; ell(c, -R * 0.5, -R * 0.64, R * 0.26, R * 0.07, -0.35); c.fill();
    const pul = 0.6 + 0.4 * Math.sin(t * 3); c.fillStyle = '#120606'; ell(c, R * 0.03, -R * 0.64, R * 0.3, R * 0.1); c.fill(); glowDot(c, R * 0.03, -R * 0.64, R * 0.3, '#ff7a1a', 0.7 * pul);
    c.fillStyle = 'rgba(255,230,210,0.45)'; ell(c, -R * 0.66, R * 0.12, R * 0.06, R * 0.24, 0.3); c.fill(); circle(c, -R * 0.58, R * 0.46, R * 0.035);
    c.restore();
    bites24(c, R, st);
    if (st.face !== false) {
      const E = [[-0.3, 0.1, 0.17, 0.19, -0.15], [0.3, -0.01, 0.14, 0.15, 0.05]];
      E.forEach(([x0, y0, rx, ry, lid], k) => {
        const ex = x0 * R + e.lx * R * 0.04, ey = y0 * R + e.ly * R * 0.03, o = e.o;
        c.fillStyle = 'rgba(60,4,8,0.5)'; ell(c, ex, ey + R * 0.02, rx * R * 1.35, ry * R * 1.3); c.fill();
        ell(c, ex, ey, rx * R, ry * R * o); c.fillStyle = '#fbe6c4'; c.fill();
        if (o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05 + R * 0.04; c.fillStyle = '#e8651a'; circle(c, px, py, R * 0.085); c.fillStyle = INK134; circle(c, px, py, R * 0.045); c.fillStyle = '#fff'; circle(c, px - R * 0.025, py - R * 0.03, R * 0.02); }
        c.save(); ell(c, ex, ey, rx * R, ry * R * o); c.clip(); c.fillStyle = '#7a0c14'; c.fillRect(ex - rx * R * 1.3, ey - ry * R * 1.3, rx * R * 2.6, ry * R * (1.3 + lid)); c.restore();
        c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.045); ell(c, ex, ey, rx * R, ry * R * o); c.stroke();
        c.beginPath(); c.moveTo(ex - rx * R, ey + lid * ry * R); c.lineTo(ex + rx * R, ey + lid * ry * R); c.stroke();
      });
      // a wax tear
      c.beginPath(); const td = dripPath134(c, R, -R * 0.3, R * 0.25, R * 0.4, R * 0.055, 2); c.strokeStyle = INKR; c.lineWidth = lw27(R, 0.06); c.stroke(); c.fillStyle = '#c0141f'; c.fill();
      c.fillStyle = 'rgba(255,200,180,0.8)'; ell(c, td.x - td.r * 0.3, td.y - td.r * 0.1, td.r * 0.2, td.r * 0.4); c.fill();
      if (st.hurt > 0 || st.mouthOpen) { ell(c, R * 0.02, R * 0.42, R * 0.13, R * 0.15); c.fillStyle = '#2a0206'; c.fill(); }
      else { c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(-R * 0.2, R * 0.42); c.quadraticCurveTo(-R * 0.05, R * 0.34, R * 0.08, R * 0.43); c.quadraticCurveTo(R * 0.2, R * 0.52, R * 0.27, R * 0.4); c.stroke(); }
    }
    // the match still burns, charred and dripping
    const hx = R * 0.2, hy = -R * 1.3, f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06;
    const sg = c.createLinearGradient(0, -R * 0.62, hx, hy); sg.addColorStop(0, '#e8cd90'); sg.addColorStop(0.45, '#c8a468'); sg.addColorStop(0.8, '#2a1a10'); sg.addColorStop(1, '#120a08');
    c.lineCap = 'round'; c.beginPath(); c.moveTo(R * 0.03, -R * 0.62); c.quadraticCurveTo(R * 0.0, -R * 1.0, hx, hy + R * 0.05);
    c.strokeStyle = INK134; c.lineWidth = R * 0.17; c.stroke(); c.strokeStyle = sg; c.lineWidth = R * 0.1; c.stroke();
    glowDot(c, hx, hy - R * 0.2, R * 0.9, '#ff6a1a', 0.5);
    c.beginPath(); const hd = dripPath134(c, R, hx + R * 0.1, hy, R * 0.5, R * 0.08, 1); c.strokeStyle = INKR; c.lineWidth = lw27(R, 0.06); c.stroke(); c.fillStyle = '#b00e18'; c.fill();
    c.fillStyle = '#b00e18'; ell(c, hx, hy, R * 0.22, R * 0.19); c.fill(); c.strokeStyle = INK134; c.lineWidth = lw27(R, 0.045); c.stroke();
    c.fillStyle = 'rgba(255,200,170,0.5)'; ell(c, hx - R * 0.07, hy - R * 0.06, R * 0.07, R * 0.04, -0.5); c.fill();
    flameShape(c, hx, hy - R * 0.3, R * 0.3 * f, R * 0.54 * f); c.fillStyle = '#ff4a10'; c.fill();
    flameShape(c, hx, hy - R * 0.22, R * 0.16 * f, R * 0.33 * f); c.fillStyle = '#ffd36a'; c.fill();
    for (let i = 0; i < 3; i++) { const ph = (t * 0.4 + i * 0.33) % 1; c.fillStyle = `rgba(70,60,55,${0.4 * (1 - ph)})`; circle(c, hx + Math.sin(t + i * 2) * R * 0.2, hy - R * 0.8 - ph * R * 0.6, R * (0.1 + ph * 0.2)); }
  }

  /* Lucifappel: Suikerschedel. A sugar skull, a marigold crown and a candle for a stem. */
  function marigold134(c, x, y, r, t, i) {
    c.save(); c.translate(x, y); c.rotate(i + Math.sin(t + i) * 0.05);
    c.fillStyle = '#2f8a3a'; for (const s of [-1, 1]) { ell(c, s * r * 1.05, r * 0.5, r * 0.55, r * 0.22, s * 0.6); c.fill(); }
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.fillStyle = k % 2 ? '#ff9a1e' : '#ffb830'; ell(c, Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.46, r * 0.26, a); c.fill(); c.strokeStyle = '#8a3a06'; c.lineWidth = Math.max(0.3, r * 0.08); c.stroke(); }
    c.fillStyle = '#c2410c'; circle(c, 0, 0, r * 0.32); c.fillStyle = '#ffd23a'; circle(c, 0, 0, r * 0.14);
    c.restore();
  }
  function drawSugar134(c, R, st) {
    const t = st.t || 0, e = eye134(st), PINK = '#ff4fa3', TEAL = '#1fc8b8', INKP = '#2a1230';
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.08, 0, 0, R * 1.2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#f7efdc'); g.addColorStop(1, '#bfae86');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU; c.fillStyle = i % 2 ? PINK : TEAL; circle(c, Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.86, R * 0.04); }
    const spiral = (cx, cy, r0, dir, col) => { c.strokeStyle = col; c.lineWidth = lw27(R, 0.04); c.beginPath(); for (let a = 0; a <= 3.2 * TAU; a += 0.2) { const r = (r0 * a) / (3.2 * TAU), x = cx + Math.cos(a * dir) * r, y = cy + Math.sin(a * dir) * r; if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); };
    for (const s of [-1, 1]) {
      spiral(s * R * 0.66, R * 0.3, R * 0.2, s, TEAL);
      for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + 0.4; c.fillStyle = PINK; circle(c, s * R * 0.66 + Math.cos(a) * R * 0.27, R * 0.3 + Math.sin(a) * R * 0.27, R * 0.03); }
      c.fillStyle = TEAL; for (let k = 0; k < 3; k++) circle(c, s * R * (0.78 - k * 0.07), -R * 0.28 + k * R * 0.08, R * 0.03);
    }
    c.fillStyle = TEAL; c.beginPath(); c.moveTo(0, -R * 0.44); c.lineTo(R * 0.07, -R * 0.36); c.lineTo(0, -R * 0.28); c.lineTo(-R * 0.07, -R * 0.36); c.closePath(); c.fill();
    c.fillStyle = PINK; circle(c, 0, -R * 0.36, R * 0.025);
    c.restore();
    applePath(c, R); c.strokeStyle = INKP; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    for (const [x, y, r, i] of [[-0.8, -0.52, 0.19, 0.3], [-0.46, -0.84, 0.19, 1.1], [0.46, -0.84, 0.19, 2.1], [0.8, -0.52, 0.19, 0.7]]) marigold134(c, x * R, y * R, r * R, t, i);
    lucifBanner26(c, R, R * 0.86, R * 0.64, R * 0.17, '#ffb02e', true);
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3, ey = -R * 0.04;
        for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; c.fillStyle = k % 2 ? PINK : TEAL; ell(c, ex + Math.cos(a) * R * 0.25, ey + Math.sin(a) * R * 0.25, R * 0.085, R * 0.05, a); c.fill(); c.strokeStyle = INKP; c.lineWidth = Math.max(0.3, R * 0.02); c.stroke(); }
        ell(c, ex, ey, R * 0.2, R * 0.2 * Math.max(e.o, 0.25)); c.fillStyle = '#1a0a1e'; c.fill(); c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.04); c.stroke();
        if (e.o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05; glowDot(c, px, py, R * 0.14, '#ffb02e', 0.9); c.fillStyle = '#fff4c0'; circle(c, px, py, R * 0.035); }
        c.strokeStyle = s > 0 ? PINK : TEAL; c.lineWidth = lw27(R, 0.04); c.beginPath(); c.arc(ex, ey, R * 0.36, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      }
      c.fillStyle = INKP; c.beginPath(); c.moveTo(0, R * 0.14); c.bezierCurveTo(-R * 0.1, R * 0.2, -R * 0.08, R * 0.32, 0, R * 0.28); c.bezierCurveTo(R * 0.08, R * 0.32, R * 0.1, R * 0.2, 0, R * 0.14); c.fill();
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.5, R * 0.2, R * 0.14); c.fillStyle = '#1a0a1e'; c.fill(); c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.04); c.stroke(); }
      else {
        c.strokeStyle = INKP; c.lineWidth = lw27(R, 0.05); c.beginPath(); c.moveTo(-R * 0.5, R * 0.44); c.quadraticCurveTo(0, R * 0.62, R * 0.5, R * 0.44); c.stroke();
        c.lineWidth = lw27(R, 0.035);
        for (let i = 0; i < 9; i++) { const x = -R * 0.45 + i * R * 0.1125, u = (x + R * 0.5) / (R * 1.0), y = (1 - u) * (1 - u) * R * 0.44 + 2 * (1 - u) * u * R * 0.62 + u * u * R * 0.44; c.beginPath(); c.moveTo(x, y - R * 0.07); c.lineTo(x, y + R * 0.07); c.stroke(); }
      }
    }
    lucifMatch26(c, R * 0.02, -R * 0.68, R * 0.1, -R * 1.4, R, t, true);
  }

  /* Lucifappel: Koud Vuur. Left in the freezer overnight. */
  function drawIce134(c, R, st) {
    const t = st.t || 0, e = eye134(st);
    glowDot(c, 0, 0, R * 2.0, '#38c8ff', 0.14);
    const shard = (x, y, w, h, rot) => { c.save(); c.translate(x, y); c.rotate(rot); const g = c.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, '#6ac0e8'); g.addColorStop(1, '#f2fdff'); c.beginPath(); c.moveTo(-w, 0); c.lineTo(-w * 0.2, -h); c.lineTo(w * 0.2, -h * 0.9); c.lineTo(w, 0); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.05); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = lw27(R, 0.025); c.beginPath(); c.moveTo(-w * 0.3, -h * 0.1); c.lineTo(-w * 0.1, -h * 0.8); c.stroke(); c.restore(); };
    for (const [x, h, w, r] of [[-0.55, 0.5, 0.15, -0.5], [-0.28, 0.76, 0.13, -0.18], [0.3, 0.68, 0.13, 0.22], [0.56, 0.48, 0.15, 0.5]]) shard(x * R, -R * 0.72, w * R, h * R, r);
    for (const [x, h, w] of [[-0.62, 0.55, 0.14], [-0.26, 0.85, 0.13], [0.14, 0.6, 0.13], [0.5, 0.74, 0.14]]) { c.save(); c.translate(x * R, R * 0.8); c.scale(1, -1); shard(0, 0, w * R, h * R, 0); c.restore(); }
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2); g.addColorStop(0, '#f6feff'); g.addColorStop(0.35, '#a8e4f6'); g.addColorStop(0.75, '#4a9ad0'); g.addColorStop(1, '#173f78');
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const FAC = [[[-1.1, -0.2], [-0.2, -1.0], [0.3, -0.1]], [[0.3, -0.1], [-0.2, -1.0], [1.1, -0.4]], [[-1.1, -0.2], [0.3, -0.1], [-0.3, 1.0]], [[0.3, -0.1], [1.1, -0.4], [1.0, 0.8]], [[-0.3, 1.0], [0.3, -0.1], [1.0, 0.8]]];
    FAC.forEach((tri, i) => { c.beginPath(); tri.forEach(([x, y], k) => (k ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.closePath(); c.fillStyle = i % 2 ? 'rgba(255,255,255,0.14)' : 'rgba(10,40,90,0.14)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = lw27(R, 0.025); c.stroke(); });
    for (let i = 0; i < 46; i++) { const a = rnd24(i) * TAU, r = 0.74 + rnd24(i + 40) * 0.26; c.fillStyle = `rgba(255,255,255,${0.35 + rnd24(i + 9) * 0.45})`; circle(c, Math.cos(a) * r * R, Math.sin(a) * r * R * 0.96, R * (0.012 + rnd24(i + 3) * 0.03)); }
    const sh = c.createLinearGradient(0, R * 0.2, 0, R); sh.addColorStop(0, 'rgba(10,40,90,0)'); sh.addColorStop(1, 'rgba(10,40,90,0.45)'); c.fillStyle = sh; c.fillRect(-R * 1.2, R * 0.2, R * 2.4, R * 0.9);
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, -R * 0.5, -R * 0.42, R * 0.2, R * 0.09, -0.65); c.fill(); ell(c, -R * 0.2, -R * 0.62, R * 0.08, R * 0.04, -0.4); c.fill();
    c.save(); c.scale(0.86, 0.88); applePath(c, R); c.restore(); c.strokeStyle = 'rgba(232,251,255,0.7)'; c.lineWidth = Math.max(0.5, R * 0.05); c.stroke();
    c.fillStyle = 'rgba(10,37,72,0.5)'; c.fillRect(-R * 1.2, R * 0.66, R * 2.4, R * 0.5); c.fillStyle = 'rgba(232,251,255,0.7)'; c.fillRect(-R * 1.2, R * 0.7, R * 2.4, R * 0.035); c.fillRect(-R * 1.2, R * 0.86, R * 2.4, R * 0.035);
    c.restore();
    applePath(c, R); c.strokeStyle = '#0a2548'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + 0.5, x = Math.cos(a) * R * 1.03, y = Math.sin(a) * R * 0.99 - R * 0.04, l = R * (0.05 + rnd24(i + 4) * 0.05); c.strokeStyle = 'rgba(235,252,255,0.85)'; c.lineWidth = lw27(R, 0.03); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    if (st.face !== false) {
      c.fillStyle = 'rgba(255,130,170,0.4)'; for (const s of [-1, 1]) { ell(c, s * R * 0.56, R * 0.24, R * 0.14, R * 0.08); c.fill(); }
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = -R * 0.02 + e.ly * R * 0.02, o = e.o;
        ell(c, ex, ey, R * 0.16, R * 0.19 * o); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.stroke();
        if (o > 0.3) { const px = ex + e.lx * R * 0.05, py = ey + e.ly * R * 0.05; c.fillStyle = '#37b8f0'; circle(c, px, py, R * 0.095); c.fillStyle = '#06223a'; circle(c, px, py, R * 0.05); c.fillStyle = '#fff'; circle(c, px - R * 0.03, py - R * 0.035, R * 0.03); }
        c.save(); ell(c, ex, ey, R * 0.16, R * 0.19 * o); c.clip(); c.fillStyle = '#8fd0ee'; c.fillRect(ex - R * 0.2, ey - R * 0.25, R * 0.4, R * 0.25 * o + R * 0.02); c.restore();
        c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.beginPath(); c.moveTo(ex - R * 0.16, ey - R * 0.04 * o); c.lineTo(ex + R * 0.16, ey - R * 0.04 * o); c.stroke();
        c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(s * R * 0.12, -R * 0.26); c.lineTo(s * R * 0.46, -R * 0.3); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = lw27(R, 0.03); for (let k = 0; k < 3; k++) { const x = ex + (k - 1) * R * 0.1; c.beginPath(); c.moveTo(x, ey - R * 0.19 * o); c.lineTo(x + (k - 1) * R * 0.04, ey - R * 0.3 * o); c.stroke(); }
      }
      if (st.hurt > 0 || st.mouthOpen) { ell(c, 0, R * 0.4, R * 0.12, R * 0.14); c.fillStyle = '#06223a'; c.fill(); }
      else { c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.06); c.beginPath(); c.moveTo(-R * 0.14, R * 0.4); c.quadraticCurveTo(0, R * 0.36, R * 0.14, R * 0.4); c.stroke(); }
      for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; c.fillStyle = `rgba(235,250,255,${0.55 * (1 - ph)})`; ell(c, R * (0.12 + ph * 0.5), R * (0.46 - ph * 0.14), R * (0.07 + ph * 0.1), R * (0.05 + ph * 0.07)); c.fill(); }
    }
    // a frozen match with a flame that is not warm
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06, hx = R * 0.12, hy = -R * 1.36;
    c.lineCap = 'round'; c.beginPath(); c.moveTo(R * 0.02, -R * 0.64); c.lineTo(hx, hy + R * 0.05); c.strokeStyle = '#0a2548'; c.lineWidth = R * 0.17; c.stroke(); c.strokeStyle = '#dff6ff'; c.lineWidth = R * 0.1; c.stroke();
    c.fillStyle = '#bfe8ff'; ell(c, hx, hy, R * 0.2, R * 0.17); c.fill(); c.strokeStyle = '#0a2548'; c.lineWidth = lw27(R, 0.045); c.stroke();
    glowDot(c, hx, hy - R * 0.25, R * 1.0, '#38c8ff', 0.5);
    flameShape(c, hx, hy - R * 0.3, R * 0.26 * f, R * 0.52 * f); c.fillStyle = '#2ab4ff'; c.fill();
    flameShape(c, hx, hy - R * 0.22, R * 0.13 * f, R * 0.3 * f); c.fillStyle = '#eafcff'; c.fill();
    for (let i = 0; i < 4; i++) { const a = t * 0.8 + (i * TAU) / 4; sparkle(c, Math.cos(a) * R * 1.45, Math.sin(a) * R * 0.9 - R * 0.2, R * (0.07 + 0.03 * Math.sin(t * 5 + i)), '#ffffff'); }
  }

  /* Lucifappel: Vulkaan. Basalt with lava in the cracks, and the match is what erupts. */
  function drawVolcano134(c, R, st) {
    const t = st.t || 0, e = eye134(st), pul = 0.7 + 0.3 * Math.sin(t * 2.6);
    for (let i = 0; i < 5; i++) { const ph = (t * 0.22 + i / 5) % 1; c.fillStyle = `rgba(70,60,66,${0.5 * (1 - ph)})`; circle(c, R * (0.1 + Math.sin(t * 0.6 + i) * 0.22) + ph * R * 0.3, -R * 1.65 - ph * R * 0.3, R * (0.12 + ph * 0.14)); }
    glowDot(c, 0, -R * 0.2, R * 1.9, '#ff5a10', 0.2);
    const g = c.createRadialGradient(-R * 0.36, -R * 0.42, R * 0.06, 0, 0, R * 1.2); g.addColorStop(0, '#8a7c78'); g.addColorStop(0.4, '#4a3e40'); g.addColorStop(1, '#120c0c');
    // the cone sits behind the apple and rises out of the stem notch; lava runs down both sides
    const cone = () => { c.beginPath(); c.moveTo(-R * 0.8, -R * 0.5); c.lineTo(-R * 0.22, -R * 1.34); c.lineTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.closePath(); };
    cone(); c.fillStyle = g; c.fill(); c.save(); cone(); c.clip();
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.moveTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.lineTo(R * 0.2, -R * 0.5); c.closePath(); c.fill();
    c.lineCap = 'round'; for (const [w, col, a] of [[0.12, '#ff5a10', 0.3], [0.055, '#ff8a1e', 0.95], [0.022, '#ffe08a', 1]]) { c.strokeStyle = rgba(col, a * pul); c.lineWidth = R * w; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.1, -R * 1.3); c.quadraticCurveTo(s * R * 0.3, -R * 1.05, s * R * (0.46 + 0.05 * Math.sin(t * 2 + s)), -R * 0.5); c.stroke(); } }
    c.restore(); c.beginPath(); c.moveTo(-R * 0.8, -R * 0.5); c.lineTo(-R * 0.22, -R * 1.34); c.lineTo(R * 0.26, -R * 1.34); c.lineTo(R * 0.84, -R * 0.5); c.strokeStyle = '#050308'; c.lineWidth = Math.max(1, R * 0.09); c.lineJoin = 'round'; c.stroke();
    c.fillStyle = '#1a1214'; ell(c, R * 0.02, -R * 1.34, R * 0.28, R * 0.09); c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke();
    const cg = c.createRadialGradient(R * 0.02, -R * 1.34, 0, R * 0.02, -R * 1.34, R * 0.26); cg.addColorStop(0, '#ffe08a'); cg.addColorStop(1, '#ff5a10'); c.fillStyle = cg; ell(c, R * 0.02, -R * 1.35, R * 0.22, R * 0.06); c.fill();
    applePath(c, R); c.fillStyle = g; c.fill();
    c.save(); applePath(c, R); c.clip();
    const ROCK = [[[-1.1, -0.3], [-0.4, -1.0], [-0.1, -0.2]], [[-0.1, -0.2], [-0.4, -1.0], [0.8, -0.8]], [[-1.1, -0.3], [-0.1, -0.2], [-0.6, 0.7]], [[0.8, -0.8], [-0.1, -0.2], [1.1, 0.2]], [[-0.6, 0.7], [-0.1, -0.2], [0.5, 1.0]], [[-0.1, -0.2], [1.1, 0.2], [0.5, 1.0]]];
    ROCK.forEach((tri, i) => { c.beginPath(); tri.forEach(([x, y], k) => (k ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.closePath(); c.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.22)'; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = lw27(R, 0.03); c.stroke(); });
    const VEIN = [[[-0.98, -0.15], [-0.72, -0.02], [-0.64, 0.28], [-0.84, 0.5], [-0.64, 0.8]], [[1.0, -0.3], [0.76, -0.12], [0.82, 0.2], [0.62, 0.42], [0.8, 0.7], [0.62, 0.92]], [[-0.3, 1.0], [-0.22, 0.78], [-0.36, 0.64]], [[0.3, 1.0], [0.22, 0.8], [0.36, 0.68]], [[-0.5, -0.5], [-0.36, -0.36], [-0.52, -0.24]], [[0.52, -0.52], [0.38, -0.38], [0.54, -0.26]]];
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [w, col, a] of [[0.15, '#ff5a10', 0.25], [0.065, '#ff8a1e', 0.95], [0.025, '#ffe08a', 1]]) { c.strokeStyle = rgba(col, a * pul); c.lineWidth = R * w; for (const pl of VEIN) { c.beginPath(); pl.forEach(([x, y], i) => (i ? c.lineTo(x * R, y * R) : c.moveTo(x * R, y * R))); c.stroke(); } }
    c.restore();
    applePath(c, R); c.strokeStyle = '#050308'; c.lineWidth = Math.max(1, R * 0.1); c.stroke();
    bites24(c, R, st);
    if (st.face !== false) {
      for (const s of [-1, 1]) {
        const ex = s * R * 0.3 + e.lx * R * 0.03, ey = R * 0.04 + e.ly * R * 0.02, o = e.o;
        c.fillStyle = '#07050a'; ell(c, ex, ey, R * 0.21, R * 0.19 * o); c.fill();
        const lg = c.createRadialGradient(ex, ey, 0, ex, ey, R * 0.2); lg.addColorStop(0, '#fff0a0'); lg.addColorStop(0.5, '#ff9a1e'); lg.addColorStop(1, '#e8400a'); c.fillStyle = lg; ell(c, ex, ey, R * 0.16, R * 0.13 * o); c.fill();
        glowDot(c, ex, ey, R * 0.42, '#ff8a1e', 0.3 * pul);
        if (o > 0.3) { c.fillStyle = '#07050a'; ell(c, ex + e.lx * R * 0.04, ey, R * 0.03, R * 0.1 * o); c.fill(); }
        c.fillStyle = '#1c1416'; c.beginPath(); c.moveTo(s * R * 0.02, -R * 0.16); c.lineTo(s * R * 0.62, -R * 0.38); c.lineTo(s * R * 0.58, -R * 0.12); c.lineTo(s * R * 0.44, -R * 0.08); c.lineTo(s * R * 0.12, -R * 0.04); c.closePath(); c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.04); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = lw27(R, 0.025); c.beginPath(); c.moveTo(s * R * 0.06, -R * 0.15); c.lineTo(s * R * 0.56, -R * 0.35); c.stroke();
      }
      const mg = c.createLinearGradient(0, R * 0.32, 0, R * 0.64); mg.addColorStop(0, '#ffe08a'); mg.addColorStop(1, '#e8400a');
      c.beginPath(); c.moveTo(-R * 0.4, R * 0.34);
      if (st.hurt > 0 || st.mouthOpen) { c.quadraticCurveTo(0, R * 0.84, R * 0.4, R * 0.34); c.closePath(); c.fillStyle = mg; c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke(); }
      else {
        for (let i = 1; i <= 8; i++) c.lineTo(-R * 0.4 + i * R * 0.1, R * (i % 2 ? 0.58 : 0.46));
        c.lineTo(R * 0.4, R * 0.34); c.quadraticCurveTo(0, R * 0.28, -R * 0.4, R * 0.34); c.closePath(); c.fillStyle = mg; c.fill(); c.strokeStyle = '#050308'; c.lineWidth = lw27(R, 0.05); c.stroke();
        c.fillStyle = '#2a2024'; for (let i = 0; i < 4; i++) { const x = -R * 0.3 + i * R * 0.2; c.beginPath(); c.moveTo(x, R * 0.32); c.lineTo(x + R * 0.1, R * 0.32); c.lineTo(x + R * 0.05, R * 0.44); c.closePath(); c.fill(); }
      }
    }
    // the match is what erupts
    const f = 1 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.06;
    lucifMatch26(c, R * 0.02, -R * 1.32, R * 0.1, -R * 1.6, R, t, true);
    const hx = R * 0.1, hy = -R * 1.76;
    glowDot(c, hx, hy - R * 0.1, R * 1.0, '#ff4a10', 0.4);
    for (const [dx, h, w] of [[-0.2, 0.34, 0.1], [0.2, 0.3, 0.09]]) { flameShape(c, hx + dx * R, hy, w * R * f, h * R * f); c.fillStyle = '#ff6a1a'; c.fill(); }
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.7 + i / 9) % 1, dir = (i % 2 ? 1 : -1) * (0.25 + rnd24(i + 3) * 0.75), x = R * 0.02 + dir * ph * R * 0.95, y = -R * 1.38 - Math.sin(ph * Math.PI) * R * 0.6 + ph * ph * R * 0.9;
      glowDot(c, x, y, R * (0.08 + rnd24(i) * 0.06), i % 3 ? '#ff8a1e' : '#ffe08a', 0.9 * (1 - ph * 0.6));
    }
  }

  /* Lucky: Eenarmige Bandiet. The lever is an arm, the reels are eyes */
  function drawBandiet132(c, R, st) {
    const t = st.t || 0, pull = Math.max(0, Math.sin(t * 1.2)) * 0.45;
    // upper arm, elbow, forearm, a hand around the ball
    const sx = R * 0.9, sy = R * 0.15, el = [R * 1.3, -R * (0.15 - pull * 0.3)], hx = R * 1.22, hy = -R * (0.8 - pull);
    c.lineCap = 'round';
    for (const [w, col] of [[0.16, '#2a2018'], [0.09, '#efe6d2']]) {
      c.strokeStyle = col; c.lineWidth = lw27(R, w); c.beginPath(); c.moveTo(sx, sy); c.lineTo(el[0], el[1]); c.lineTo(hx, hy); c.stroke();
    }
    c.fillStyle = '#efe6d2'; c.strokeStyle = '#2a2018'; c.lineWidth = lw27(R, 0.03); circle(c, el[0], el[1], R * 0.08); c.stroke();
    c.fillStyle = '#d5232f'; circle(c, hx, hy - R * 0.08, R * 0.15); c.strokeStyle = '#3a0408'; c.lineWidth = lw27(R, 0.035); c.stroke();
    c.strokeStyle = '#efe6d2'; c.lineWidth = lw27(R, 0.045);
    for (let k = 0; k < 4; k++) { const a = -2.6 + k * 0.5; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + Math.cos(a) * R * 0.18, hy + Math.sin(a) * R * 0.18 - R * 0.05, hx + Math.cos(a + 0.9) * R * 0.17, hy - R * 0.08 + Math.sin(a + 0.9) * R * 0.17); c.stroke(); }
    skinBody24(c, R, st, { g: ['#e8d090', '#9a7428', '#2a1a04'], vein: 'rgba(255,240,200,0.12)', hl: 'rgba(255,255,255,0.4)', out: '#2a1a04',
      inside(c, R) {
        c.fillStyle = 'rgba(120,60,20,0.45)'; for (const [x, y, r] of [[-0.6, 0.5, 0.2], [0.5, 0.65, 0.16], [-0.7, -0.4, 0.12], [0.75, -0.3, 0.1]]) circle(c, x * R, y * R, r * R);
        c.fillStyle = '#1a0a04'; rrect(c, -R * 0.82, -R * 0.4, R * 1.64, R * 0.56, R * 0.08); c.fill();
        for (let i = 0; i < 3; i++) {
          const x = -R * 0.52 + i * R * 0.52, spin = i === 1 ? (t * 6) % 1 : i === 2 && st.hurt > 0 ? (t * 9) % 1 : 0;
          c.save(); rrect(c, x - R * 0.22, -R * 0.35, R * 0.44, R * 0.46, R * 0.05); c.fillStyle = '#f2e6d0'; c.fill(); c.clip();
          for (const dy of [-1, 0, 1]) {
            const y = -R * 0.12 + (dy + spin) * R * 0.46;
            ell(c, x, y, R * 0.17, R * 0.15); c.fillStyle = '#fbf6ea'; c.fill();
            c.strokeStyle = 'rgba(200,30,40,0.6)'; c.lineWidth = lw27(R, 0.012); for (let v = 0; v < 4; v++) { const a = v * 1.6 + i; c.beginPath(); c.moveTo(x + Math.cos(a) * R * 0.16, y + Math.sin(a) * R * 0.14); c.lineTo(x + Math.cos(a) * R * 0.08, y + Math.sin(a) * R * 0.07); c.stroke(); }
            const lx = clamp(st.lookX || 0, -1, 1) * R * 0.04;
            c.fillStyle = ['#3a6a2a', '#7a1a20', '#2a4a8a'][i]; circle(c, x + lx, y, R * 0.08); c.fillStyle = '#0a0204'; circle(c, x + lx, y, R * 0.04);
          }
          c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x - R * 0.22, -R * 0.35, R * 0.44, R * 0.09); c.fillRect(x - R * 0.22, R * 0.02, R * 0.44, R * 0.09);
          c.restore();
        }
      } });
    if (st.face !== false) {
      // a coin slot for a mouth, and coins for teeth
      c.fillStyle = '#7a0a14'; rrect(c, -R * 0.36, R * 0.26, R * 0.72, R * 0.22, R * 0.06); c.fill();
      c.fillStyle = '#0a0204'; rrect(c, -R * 0.28, R * 0.32, R * 0.56, R * 0.1, R * 0.03); c.fill();
      c.fillStyle = '#ffd84a'; c.strokeStyle = '#6a4008'; c.lineWidth = lw27(R, 0.02);
      for (let i = 0; i < 6; i++) { const x = -R * 0.25 + i * R * 0.1; ell(c, x, R * 0.3, R * 0.035, R * 0.06); c.fill(); c.stroke(); }
    }
    drawStem(c, R, st.leaf || 0, 0);
  }

  const NEW132 = {
    apple: { name: 'Prikmond', tier: 'Grotesque', line: 'The face is a lamprey mouth now. Three rings of teeth, all pointing in, all turning. It does not chew. It holds.', draw: drawPrik132, bg: ['#3a0a18', '#0e0206'], motif: 'embers', acc: '#ff6a8a' },
    appel: { name: 'Kappersfail', tier: 'Grotesque', line: 'One in four cuts is a fail. He got all four at once. The mullet is stapled back on. Nobody said anything.', draw: drawKapper132, bg: ['#2a1010', '#0a0404'], motif: 'crumbs', acc: '#e8c2a8' },
    rot: { name: 'Staartbijter', tier: 'Grotesque', line: 'A small Ouroboros moved in. Out the left eye, around the whole apple, back into its own tail. Rent free, forever.', draw: drawOuro132, bg: ['#1e1a0a', '#060502'], motif: 'spores', acc: '#ffae42' },
    krul: { name: 'Kassabon', tier: 'Grotesque', line: 'Everything must go, so it went. A receipt for a tongue, a barcode cut in the cheek, one eye on sale. Still laughing at the price.', draw: drawBon132, bg: ['#2a2404', '#0a0802'], motif: 'fair', acc: '#f2c200' },
    mika: { name: '8 Procent', tier: 'Grotesque', line: 'Same face, behind cracked glass. A charger in the skull, cable for veins, 8 percent left. Nothing gets to him. The battery might.', draw: drawTel132, bg: ['#0a1430', '#02040c'], motif: 'spark', acc: '#5a8aff' },
    pean: { name: 'Blokrot', tier: 'Grotesque', line: 'Hit by one Block Worm too many. The pieces grew in. A T in the back, an L in the cheek, the next one already falling.', draw: drawBlok132, bg: ['#0a1a2a', '#02060a'], motif: 'lasers', acc: '#3fc6d8' },
    apploa: { name: 'Handjeklap', tier: 'Grotesque', line: 'The wings are arms now, suit sleeves and all, and every hand wants something. Gold ring on each one. She votes with all of them.', draw: drawHand132, bg: ['#1a1a2a', '#06060c'], motif: 'stars', acc: '#e3a54a', wings: handWings132 },
    lucif: { name: 'Benzinekop', tier: 'Grotesque', line: 'Someone filled him up and left the nozzle in. Fuel runs out of both eyes and the match is still lit. Regular, unleaded.', draw: drawPomp132, bg: ['#1a2004', '#060800'], motif: 'hellbox', acc: '#b8e81a' },
    lucky: { name: 'Eenarmige Bandiet', tier: 'Grotesque', line: 'The lever is an arm now, bone and all, and it pulls itself. The reels are eyes. They spin. They never stop on anything nice.', draw: drawBandiet132, bg: ['#2a1a04', '#0a0602'], motif: 'fair', acc: '#ffd84a' },
  };
  for (const id in NEW132) if (SKINS[id]) SKINS[id].push(NEW132[id]);
  SKINS.lucif.push(
    { name: 'Suikerschedel', tier: 'Epic', line: 'Dead already, and doing better than most. Marigolds in the hair, a candle for a stem, sugar all the way down.', draw: drawSugar134, bg: ['#1a0e2e', '#07030f'], motif: 'petals', acc: '#ff7ab8' },
    { name: 'Koud Vuur', tier: 'Epic', line: 'Left in the freezer overnight. The box is ice, the match is ice, and the flame is blue and warms nothing. He does not mind.', draw: drawIce134, bg: ['#0e2a44', '#030a14'], motif: 'flakes', acc: '#7fdcff' },
    { name: 'Vulkaan', tier: 'Epic', line: 'Basalt outside, lava in every crack. Erupts on a schedule nobody has seen. The match is just what comes out first.', draw: drawVolcano134, bg: ['#2a1c24', '#0a0608'], motif: 'embers', acc: '#ff6a2a' },
  );

  /* ---- the epic layer: an aura, slow light rays and particles that belong to the skin ---- */
  const FX122 = {
    'Granny Smith': { mote: 'spark' }, Kermisappel: { mote: 'spark', col2: '#ffd36a' }, Spiegelbol: { mote: 'spark' },
    'Streamer Setup': { mote: 'pixel' }, Capybara: { mote: 'bubble' }, 'Paarse Pluis': { mote: 'spark' },
    Schimmelkoning: { mote: 'spore' }, Zonnebloem: { mote: 'petal' }, Kortsluiting: { mote: 'spark', col2: '#ffffff' },
    Zomerkrul: { mote: 'bubble' }, Stroopkrul: { mote: 'ember' }, Kroket: { mote: 'ember' },
    'Delfts Blauw': { mote: 'spark', col: '#6a8aff' }, Klokwerk: { mote: 'spark' }, IJsblok: { mote: 'spark', col: '#7ac8ff' },
    Driekleur: { mote: 'dot' }, 'Rave Cavia': { mote: 'pixel' }, Klompen: { mote: 'petal' },
    Koningsdag: { mote: 'pixel' }, Feniks: { mote: 'ember' }, Sterinsigne: { mote: 'spark' }, Deltaplan: { mote: 'bubble' },
    Lucifer: { mote: 'ember' }, 'Kort Lontje': { mote: 'ember' }, Afterparty: { mote: 'pixel' },
    Binnenstebuiten: { mote: 'drip' }, Madennest: { mote: 'fly' }, Vliegenkoning: { mote: 'fly', n: 9 }, Gebit: { mote: 'drip', dcol: '#c84a5a' },
    Lappendeken: { mote: 'spark', col2: '#bfe8ff' }, Ogenvacht: { mote: 'eye' }, Botvleugels: { mote: 'feather' }, Smeltkop: { mote: 'ember' },
    Jackpot: { mote: 'coin' }, 'Snake Eyes': { mote: 'drip' },
    Prikmond: { mote: 'drip', dcol: '#e8dcc0' }, Kappersfail: { mote: 'feather', n: 6 }, Staartbijter: { mote: 'spore' }, Kassabon: { mote: 'coin' },
    '8 Procent': { mote: 'pixel' }, Blokrot: { mote: 'pixel', col: '#3fc6d8' }, Handjeklap: { mote: 'coin', n: 5 }, Benzinekop: { mote: 'drip', dcol: '#b8c81a' }, 'Eenarmige Bandiet': { mote: 'eye' },
    Suikerschedel: { mote: 'petal', col: '#ff9a1e', col2: '#ffd36a' }, 'Koud Vuur': { mote: 'spark', col: '#7fdcff', col2: '#ffffff' }, Vulkaan: { mote: 'ember', col: '#ff6a2a' },
  }; S62.FX122 = FX122;
  function mote122(c, R, fx, i, t) {
    const n = fx.n, r1 = rnd24(i + 11), r2 = rnd24(i + 23), m = fx.mote;
    if (m === 'ember' || m === 'bubble' || m === 'spore' || m === 'petal' || m === 'feather') {
      const ph = (t * 0.32 * (0.6 + r2) + r1) % 1, x = (r1 - 0.5) * R * 2.3 + Math.sin(t * 1.5 + i) * R * 0.12, y = R * 1.0 - ph * R * 2.5, a = Math.sin(ph * Math.PI);
      if (m === 'ember') glowDot(c, x, y, R * (0.14 + r2 * 0.1), i % 3 ? fx.col : '#ffd36a', 0.75 * a);
      else if (m === 'bubble') { c.strokeStyle = rgba(fx.col, 0.7 * a); c.lineWidth = lw27(R, 0.03); c.beginPath(); c.arc(x, y, R * (0.05 + r2 * 0.06), 0, TAU); c.stroke(); }
      else if (m === 'spore') { c.fillStyle = rgba(fx.col, 0.55 * a); circle(c, x, y, R * (0.025 + r2 * 0.03)); }
      else { c.save(); c.translate(x, y + ph * R * 0.6); c.rotate(t * 2 + i); c.fillStyle = m === 'feather' ? `rgba(22,18,26,${0.85 * a})` : rgba(fx.col, 0.75 * a); ell(c, 0, 0, R * 0.09, R * (m === 'feather' ? 0.03 : 0.04)); c.fill(); c.restore(); }
      return;
    }
    if (m === 'drip') {
      const ph = (t * 0.45 * (0.6 + r2) + r1) % 1, x = (r1 - 0.5) * R * 1.5, y = R * 0.7 + ph * R * 0.9;
      c.fillStyle = rgba(fx.dcol || '#8a0a14', 0.85 * (1 - ph));
      c.beginPath(); c.moveTo(x, y - R * 0.1); c.quadraticCurveTo(x + R * 0.06, y, x, y + R * 0.05); c.quadraticCurveTo(x - R * 0.06, y, x, y - R * 0.1); c.fill();
      return;
    }
    const a = t * (0.6 + r2 * 0.8) * (i % 2 ? 1 : -1) + (i / n) * TAU, rr = R * (1.18 + r1 * 0.32);
    let x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.62 - R * 0.08;
    if (m === 'fly') {
      x += Math.sin(t * 13 + i * 3) * R * 0.08; y += Math.cos(t * 11 + i) * R * 0.08;
      c.fillStyle = 'rgba(230,240,255,0.55)'; ell(c, x - R * 0.04, y - R * 0.04, R * 0.05, R * 0.025, Math.sin(t * 60 + i)); c.fill(); ell(c, x + R * 0.04, y - R * 0.04, R * 0.05, R * 0.025, -Math.sin(t * 60 + i)); c.fill();
      c.fillStyle = '#0a0a08'; circle(c, x, y, R * 0.045);
    } else if (m === 'pixel') { c.fillStyle = i % 2 ? fx.col : `hsl(${(t * 120 + i * 50) % 360},100%,62%)`; const s = R * 0.08; c.fillRect(x - s / 2, y - s / 2, s, s); }
    else if (m === 'coin') { const w = Math.abs(Math.cos(t * 4 + i)); ell(c, x, y, R * 0.09 * Math.max(0.15, w), R * 0.09); c.fillStyle = '#ffd84a'; c.fill(); c.strokeStyle = '#8a5a10'; c.lineWidth = lw27(R, 0.02); c.stroke(); }
    else if (m === 'eye') { const op = Math.sin(t * 1.4 + i * 2) > 0.9 ? 0.15 : 1; ell(c, x, y, R * 0.08, R * 0.07 * op); c.fillStyle = '#f6efe0'; c.fill(); if (op > 0.5) { c.fillStyle = '#7a1a20'; circle(c, x - Math.cos(a) * R * 0.025, y - Math.sin(a) * R * 0.02, R * 0.035); } }
    else if (m === 'dot') glowDot(c, x, y, R * 0.12, fx.col, 0.6);
    else sparkle(c, x, y, R * (0.08 + 0.05 * Math.sin(t * 6 + i)), i % 3 ? fx.col2 : fx.col);
  }
  function epic122(S) {
    if (S.fx122) return;
    const fx = S.fx122 = Object.assign({ col: S.acc, col2: '#ffffff', mote: 'spark', n: 7 }, FX122[S.name] || {});
    if (!S.tier) S.tier = 'Epic';
    const d0 = S.draw;
    S.draw = function (c, R, st) {
      d0(c, R, st);
      const t = st.t || 0, k = 0.78 + 0.22 * Math.sin(t * 2.2);
      // behind everything that is already drawn
      c.save(); c.globalCompositeOperation = 'destination-over';
      c.fillStyle = rgba(fx.col2, 0.08 * k);
      for (let i = 0; i < 8; i++) {
        const a = t * 0.45 + (i * TAU) / 8;
        c.beginPath(); c.moveTo(Math.cos(a - 0.1) * R * 0.9, Math.sin(a - 0.1) * R * 0.9); c.lineTo(Math.cos(a) * R * 2.05, Math.sin(a) * R * 2.05); c.lineTo(Math.cos(a + 0.1) * R * 0.9, Math.sin(a + 0.1) * R * 0.9); c.closePath(); c.fill();
      }
      const g = c.createRadialGradient(0, 0, R * 0.55, 0, 0, R * 2.05);
      g.addColorStop(0, rgba(fx.col, 0.5 * k)); g.addColorStop(0.45, rgba(fx.col, 0.16 * k)); g.addColorStop(1, rgba(fx.col, 0));
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 2.05, 0, TAU); c.fill();
      c.restore();
      // bites still go through, glow and all
      if (st.bites && st.bites.length) { c.save(); c.globalCompositeOperation = 'destination-out'; for (const b of st.bites) { biteShape(c, R, b.a, 1); c.fill(); } c.restore(); }
      c.save(); c.lineCap = 'round';
      for (let i = 0; i < fx.n; i++) mote122(c, R, fx, i, t);
      c.restore();
    };
  }
})(window.__bitten.S62 || (window.__bitten.S62 = {}));
