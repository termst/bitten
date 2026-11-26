/* 62.js section 09: wardrobe. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { SKINS, rnd24, wantIdx } = S62;
  S62.drawOn = drawOn;
  /* ------------------------------------------------------------------ the wardrobe */
  function backdrop(c, W, H, t, S) {
    const g = c.createLinearGradient(0, 0, 0, H);
    if (!S) { g.addColorStop(0, '#221812'); g.addColorStop(1, '#0c0807'); }
    else { g.addColorStop(0, S.bg[0]); g.addColorStop(1, S.bg[1]); }
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const m = S && S.motif, u = Math.min(W, H) / 100;
    c.save();
    if (m === 'knit') {
      c.strokeStyle = 'rgba(200,230,150,0.08)'; c.lineWidth = 2 * u;
      for (let y = 0; y < H + 10 * u; y += 9 * u) for (let x = 0; x < W + 8 * u; x += 8 * u) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4 * u, y + 5 * u); c.lineTo(x + 8 * u, y); c.stroke(); }
    } else if (m === 'rgb') {
      for (let i = 0; i < 5; i++) { const y = H * (0.2 + i * 0.16); c.strokeStyle = `hsla(${(t * 60 + i * 50) % 360},100%,60%,0.16)`; c.lineWidth = 3 * u; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + Math.sin(t + i) * 6 * u); c.stroke(); }
    } else if (m === 'spores') {
      for (let i = 0; i < 40; i++) { const x = rnd24(i) * W, y = ((rnd24(i + 50) * H) - t * 8 * u * (0.5 + rnd24(i + 9))) % H; c.fillStyle = 'rgba(210,230,220,0.18)'; circle(c, x, y < 0 ? y + H : y, (0.6 + rnd24(i + 3)) * u); }
    } else if (m === 'beach') {
      const sg = c.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, 30 * u); sg.addColorStop(0, 'rgba(255,240,170,0.9)'); sg.addColorStop(1, 'rgba(255,240,170,0)');
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ffd68a'; circle(c, W * 0.5, H * 0.62, 12 * u);
      c.fillStyle = '#1a3a6a'; c.fillRect(0, H * 0.66, W, H * 0.34);
      c.strokeStyle = 'rgba(255,214,138,0.5)'; c.lineWidth = 1.2 * u; for (let i = 0; i < 5; i++) { const y = H * (0.7 + i * 0.05); c.beginPath(); c.moveTo(W * 0.5 - (8 + i * 6) * u, y); c.lineTo(W * 0.5 + (8 + i * 6) * u, y); c.stroke(); }
    } else if (m === 'tiles') {
      const s = 26 * u;
      for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
        c.strokeStyle = 'rgba(29,63,154,0.16)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, s, s);
        c.fillStyle = 'rgba(29,63,154,0.12)'; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { c.beginPath(); c.arc(x + a * s, y + b * s, s * 0.22, 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(29,63,154,0.2)'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.14, 0, TAU); c.stroke();
      }
    } else if (m === 'hay') {
      c.lineWidth = 1.4 * u;
      for (let i = 0; i < 60; i++) { const x = rnd24(i) * W, y = H * 0.68 + rnd24(i + 7) * H * 0.32, a = (rnd24(i + 3) - 0.5) * 1.2; c.strokeStyle = `rgba(${200 + rnd24(i) * 40},${170 + rnd24(i + 2) * 40},90,0.45)`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 14 * u, y - Math.abs(Math.sin(a)) * 6 * u - 4 * u); c.stroke(); }
    } else if (m === 'confetti') {
      const cl = (S && S.mcol) || ['#ffffff'];
      for (let i = 0; i < 34; i++) { const x = rnd24(i + 2) * W, y = (rnd24(i + 12) * H + t * 14 * u * (0.5 + rnd24(i + 22))) % H; c.save(); c.translate(x, y); c.rotate(t * 2 + i); c.fillStyle = cl[i % cl.length]; c.globalAlpha = 0.35; c.fillRect(-1.6 * u, -0.8 * u, 3.2 * u, 1.6 * u); c.restore(); }
    } else if (m === 'fuzz') {
      c.lineWidth = 0.6 * u;
      for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(${150 + rnd24(i) * 100},${60 + rnd24(i + 1) * 60},255,0.12)`; c.beginPath(); c.arc(rnd24(i + 3) * W, rnd24(i + 4) * H, (4 + rnd24(i + 5) * 10) * u, t * 0.2 + i, t * 0.2 + i + 4); c.stroke(); }
    } else if (m === 'spark') {
      c.strokeStyle = 'rgba(160,220,255,0.25)'; c.lineWidth = u;
      for (let i = 0; i < 4; i++) { const ph = Math.floor(t * 6 + i * 3); let x = rnd24(ph) * W, y = 0; c.beginPath(); c.moveTo(x, y); while (y < H) { x += (rnd24(ph + y) - 0.5) * 14 * u; y += 10 * u; c.lineTo(x, y); } c.stroke(); }
    } else if (m === 'flakes') {
      c.strokeStyle = 'rgba(42,106,154,0.25)'; c.lineWidth = 0.8 * u;
      for (let i = 0; i < 18; i++) { const x = rnd24(i + 6) * W, y = (rnd24(i + 16) * H + t * 6 * u) % H, r = (2 + rnd24(i) * 3) * u; for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.stroke(); } }
    } else if (m === 'stars') {
      for (let i = 0; i < 26; i++) { const x = rnd24(i + 8) * W, y = rnd24(i + 18) * H, r = (0.8 + rnd24(i) * 2) * u; c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 3 + i); sparkle(c, x, y, r * 2, i % 4 ? '#c890ff' : '#e2b04e'); }
      c.globalAlpha = 1;
    } else if (m === 'waves') {
      c.strokeStyle = 'rgba(122,200,255,0.2)'; c.lineWidth = 1.5 * u;
      for (let r = 0; r < 7; r++) { const y = H * (0.55 + r * 0.07); c.beginPath(); for (let x = 0; x <= W; x += 4 * u) { const yy = y + Math.sin(x / (8 * u) + t * 2 + r) * 2 * u; if (x) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); }
    } else if (m === 'crumbs') {
      for (let i = 0; i < 70; i++) { c.fillStyle = i % 2 ? 'rgba(232,160,64,0.18)' : 'rgba(255,220,150,0.12)'; c.fillRect(rnd24(i + 9) * W, rnd24(i + 19) * H, 1.6 * u, 1.2 * u); }
    } else if (m === 'fair') {
      for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? 'rgba(255,240,220,0.08)' : 'rgba(255,60,60,0.1)'; c.beginPath(); c.moveTo(W / 2, -H * 0.1); c.lineTo((i / 10) * W * 1.6 - W * 0.3, H); c.lineTo(((i + 1) / 10) * W * 1.6 - W * 0.3, H); c.closePath(); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * 0.12); c.quadraticCurveTo(W / 2, H * 0.22, W, H * 0.12); c.stroke();
      for (let i = 0; i < 9; i++) { const x = (i + 0.5) * W / 9, y = H * 0.12 + Math.sin((x / W) * Math.PI) * H * 0.08; glowDot(c, x, y, 5 * u, i % 2 ? '#ffd36a' : '#ff6a6a', 0.5 + 0.4 * Math.sin(t * 3 + i)); }
    } else if (m === 'yuzu') {
      for (let i = 0; i < 9; i++) { const x = rnd24(i + 3) * W, y = (rnd24(i + 13) * H + t * 6 * u) % H; c.fillStyle = 'rgba(255,180,60,0.22)'; circle(c, x, y, (3 + rnd24(i) * 3) * u); }
    } else if (m === 'petals') {
      for (let i = 0; i < 14; i++) { const x = rnd24(i + 5) * W, y = (rnd24(i + 15) * H + t * 10 * u * (0.5 + rnd24(i))) % H; c.save(); c.translate(x, y); c.rotate(t + i); c.fillStyle = 'rgba(255,210,58,0.3)'; ell(c, 0, 0, 3 * u, 1.3 * u); c.fill(); c.restore(); }
    } else if (m === 'waffle') {
      c.strokeStyle = 'rgba(232,160,64,0.12)'; c.lineWidth = 2 * u;
      for (let i = -12; i < 24; i++) { c.beginPath(); c.moveTo(i * 9 * u, 0); c.lineTo(i * 9 * u + H, H); c.stroke(); c.beginPath(); c.moveTo(i * 9 * u, 0); c.lineTo(i * 9 * u - H, H); c.stroke(); }
    } else if (m === 'cogs') {
      for (const [cx, cy, r, sp] of [[0.18, 0.25, 16, 0.4], [0.82, 0.3, 11, -0.6], [0.8, 0.82, 18, 0.3], [0.15, 0.8, 10, -0.7]]) {
        c.save(); c.translate(cx * W, cy * H); c.rotate(t * sp); c.strokeStyle = 'rgba(232,196,90,0.16)'; c.lineWidth = 2 * u;
        c.beginPath(); c.arc(0, 0, r * u, 0, TAU); c.stroke();
        for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * r * u, Math.sin(a) * r * u); c.lineTo(Math.cos(a) * (r + 4) * u, Math.sin(a) * (r + 4) * u); c.stroke(); }
        c.restore();
      }
    } else if (m === 'lasers') {
      for (let i = 0; i < 6; i++) { const a = Math.sin(t * 0.8 + i) * 0.6 + (i - 2.5) * 0.25; c.strokeStyle = `hsla(${(i * 60 + t * 80) % 360},100%,60%,0.22)`; c.lineWidth = 1.5 * u; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2 + Math.sin(a) * H * 1.2, Math.cos(a) * H * 1.2); c.stroke(); }
    } else if (m === 'embers' || m === 'hellbox') {
      if (m === 'hellbox') {
        c.strokeStyle = 'rgba(226,176,78,0.35)'; c.lineWidth = 2 * u; c.strokeRect(5 * u, 5 * u, W - 10 * u, H - 10 * u);
        c.strokeStyle = 'rgba(213,35,47,0.4)'; c.lineWidth = u; c.strokeRect(8 * u, 8 * u, W - 16 * u, H - 16 * u);
        c.fillStyle = 'rgba(90,46,22,0.5)'; c.fillRect(0, 0, 4 * u, H); c.fillRect(W - 4 * u, 0, 4 * u, H);
      }
      for (let i = 0; i < 26; i++) { const x = rnd24(i + 7) * W, y = H - ((rnd24(i + 17) * H + t * 18 * u * (0.5 + rnd24(i + 4))) % H); glowDot(c, x, y, (1.5 + rnd24(i) * 2) * u, i % 3 ? '#ff7a1a' : '#ffd36a', 0.5); }
    } else if (m === 'bunting') {
      for (const row of [0.1, 0.24]) {
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * row); c.quadraticCurveTo(W / 2, H * row + 10 * u, W, H * row); c.stroke();
        for (let i = 0; i < 12; i++) {
          const x = (i + 0.5) * W / 12, y = H * row + Math.sin((x / W) * Math.PI) * 5 * u + Math.sin(t * 2 + i) * u;
          c.fillStyle = ['#c8102e', '#ffffff', '#21468b', '#ff7a12'][i % 4]; c.beginPath(); c.moveTo(x - 3.4 * u, y); c.lineTo(x + 3.4 * u, y); c.lineTo(x, y + 7 * u); c.closePath(); c.fill();
        }
      }
    } else if (m === 'pix135') {
      const cs = 6 * u;
      for (let i = 0; i < 46; i++) { const x = Math.floor(rnd24(i + 3) * W / cs) * cs, y = Math.floor(((rnd24(i + 33) * H + t * 10 * u * (0.4 + rnd24(i))) % H) / cs) * cs; c.fillStyle = ['rgba(255,210,58,0.5)', 'rgba(58,138,255,0.45)', 'rgba(255,255,255,0.35)', 'rgba(232,32,58,0.45)'][i % 4]; c.fillRect(x, y, cs * 0.6, cs * 0.6); }
      c.fillStyle = '#3a8a2a'; c.fillRect(0, H * 0.86, W, H * 0.14); c.fillStyle = '#5ac83a'; c.fillRect(0, H * 0.86, W, cs * 0.6);
      c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < W; x += cs * 2) c.fillRect(x, H * 0.9, cs, cs);
    } else if (m === 'lcd135') {
      c.fillStyle = 'rgba(15,56,15,0.12)'; const g = 3 * u;
      for (let y = 0; y < H; y += g) c.fillRect(0, y, W, Math.max(1, g * 0.25));
      for (let x = 0; x < W; x += g) c.fillRect(x, 0, Math.max(1, g * 0.25), H);
      c.strokeStyle = 'rgba(15,56,15,0.5)'; c.lineWidth = 2 * u; c.strokeRect(4 * u, 4 * u, W - 8 * u, H - 8 * u);
    } else if (m === 'synth135') {
      const hy = H * 0.6, sg = c.createLinearGradient(0, H * 0.18, 0, hy);
      sg.addColorStop(0, '#ffd23a'); sg.addColorStop(1, '#ff3ad8');
      c.save(); c.beginPath(); c.arc(W / 2, hy, Math.min(W, H) * 0.3, Math.PI, TAU); c.clip();
      c.fillStyle = sg; c.fillRect(0, 0, W, hy);
      c.fillStyle = 'rgba(42,10,74,0.9)'; for (let i = 0; i < 6; i++) { const y = hy - (i + 1) * Math.min(W, H) * 0.035; c.fillRect(0, y, W, (i + 1) * 0.5 * u + u); }
      c.restore();
      c.strokeStyle = 'rgba(58,240,255,0.55)'; c.lineWidth = 1.2 * u;
      for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(W / 2 + i * W * 0.02, hy); c.lineTo(W / 2 + i * W * 0.16, H); c.stroke(); }
      for (let i = 0; i < 9; i++) { const f = ((i + (t * 0.6) % 1) / 9), y = hy + (H - hy) * f * f; c.globalAlpha = 0.3 + f * 0.6; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.globalAlpha = 1;
    } else if (m === 'glitch135') {
      const f = Math.floor(t * 8);
      for (let i = 0; i < 14; i++) { const y = rnd24(f * 13 + i) * H, h = (1 + rnd24(f + i * 3) * 6) * u; c.fillStyle = ['rgba(255,42,74,0.25)', 'rgba(42,240,255,0.25)', 'rgba(255,255,255,0.12)'][i % 3]; c.fillRect((rnd24(f + i) - 0.3) * W, y, W * (0.3 + rnd24(i + f * 2)), h); }
      c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < H; y += 3 * u) c.fillRect(0, y, W, u);
    } else if (m === 'holo135') {
      c.strokeStyle = 'rgba(90,230,255,0.22)'; c.lineWidth = u;
      for (let i = 0; i < 12; i++) { const y = H * 0.62 + i * i * u * 0.9; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(W / 2 + i * W * 0.04, H * 0.62); c.lineTo(W / 2 + i * W * 0.2, H); c.stroke(); }
      for (let i = 0; i < 3; i++) { const r = ((t * 0.3 + i / 3) % 1) * Math.min(W, H) * 0.5; c.strokeStyle = `rgba(90,230,255,${0.4 * (1 - r / (Math.min(W, H) * 0.5))})`; c.beginPath(); c.arc(W / 2, H * 0.5, r, 0, TAU); c.stroke(); }
    } else if (m === 'comic135') {
      c.fillStyle = 'rgba(255,255,255,0.22)';
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.1; c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * W); c.lineTo(W / 2 + Math.cos(a + 0.18) * W, H / 2 + Math.sin(a + 0.18) * W); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(232,32,58,0.18)'; const g = 7 * u;
      for (let y = 0; y < H; y += g) for (let x = 0; x < W; x += g) { const d = Math.hypot(x - W / 2, y - H / 2) / Math.max(W, H); circle(c, x, y, g * 0.45 * d * 1.6); }
    }
    c.restore();
    if (S) {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) { const a = t * 0.15 + (i * TAU) / 10, L = Math.max(W, H); c.fillStyle = rgba(S.acc, 0.05); c.beginPath(); c.moveTo(W / 2, H * 0.5); c.lineTo(W / 2 + Math.cos(a - 0.11) * L, H * 0.5 + Math.sin(a - 0.11) * L); c.lineTo(W / 2 + Math.cos(a + 0.11) * L, H * 0.5 + Math.sin(a + 0.11) * L); c.closePath(); c.fill(); }
      const rg = c.createRadialGradient(W / 2, H * 0.86, 0, W / 2, H * 0.86, Math.min(W, H) * 0.32); rg.addColorStop(0, rgba(S.acc, 0.35)); rg.addColorStop(1, rgba(S.acc, 0));
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
      c.restore();
    }
    const sp = c.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.55);
    sp.addColorStop(0, S && S.light ? 'rgba(255,255,255,0.35)' : 'rgba(255,230,190,0.16)'); sp.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = sp; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, W / 2, H * 0.86, Math.min(W, H) * 0.2, Math.min(W, H) * 0.045); c.fill();
  }
  function drawOn(cv, id, skin, t, o = {}) {
    const W = cv.width, H = cv.height, c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    const n = wantIdx(id, skin), S = n && SKINS[id] ? SKINS[id][n - 1] || null : null;
    backdrop(c, W, H, t, S);
    if (!drawOn.off) drawOn.off = document.createElement('canvas');
    const off = drawOn.off; off.width = W; off.height = H;
    const oc = off.getContext('2d');
    const k = Math.min(W, H) / (id === 'apploa' ? 92 : id === 'lucif' && n ? 76 : 64), hop = o.hop || 0;
    oc.setTransform(k, 0, 0, k, W / 2, H * 0.5 + 2 * k - hop * k * 6);
    const blink = (t % 3.4) > 3.28 ? 0.1 : 1;
    drawApple(oc, 14, { char: id, skin: n, t, lookX: o.lookX || Math.sin(t * 0.7) * 0.6, lookY: o.lookY != null ? o.lookY : 0.15, blink, fear: id === 'apple' ? 0.5 : 0, hurt: 0, mouthOpen: hop > 0.3, bites: [], leaf: Math.sin(t * 1.6) * 0.2 });
    c.drawImage(off, 0, 0);
  }

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
