/* 62.js section 08: game-night. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { FX122, OLD122, SKINS, epic122, rnd24, safe } = S62;
  S62.skinIdx = skinIdx; S62.setSkin = setSkin;
  /* ------------------------------------------------------------------ v13.5: Game Night
     Six arcade skins for every apple. Each one renders the original apple into a buffer and runs it
     through a look: 8-Bit, Game Boy, Neon Arcade, Glitch, Hologram, Cel Shade. Kills in a fight
     leave a burst in the same style. Looks only, nothing else changes. */
  const GN135 = (() => {
    const bufs = {};
    const buf = (k, w, h) => {
      let b = bufs[k];
      if (!b) { b = bufs[k] = document.createElement('canvas'); b.ctx = b.getContext('2d', { willReadFrequently: true }); }   /* P1 */
      /* S1 (v14.0): reset the transform BEFORE clearing. The old order cleared a quarter of the buffer only,
         so the previous apple (often another character) stayed behind as a round ghost. */
      b.ctx.setTransform(1, 0, 0, 1, 0, 0); b.ctx.globalCompositeOperation = 'source-over'; b.ctx.globalAlpha = 1; b.ctx.imageSmoothingEnabled = true;
      if (b.width !== w || b.height !== h) { b.width = w; b.height = h; } else b.ctx.clearRect(0, 0, w, h);
      return b;
    };
    // the original apple, rendered into a square buffer that covers -box/2 .. box/2
    function base(c, R, st) {
      const m = c.getTransform ? c.getTransform() : { a: 1, b: 0 };
      const s = clamp(Math.hypot(m.a, m.b) || 1, 0.5, 8), box = R * 5.2, px = clamp(Math.ceil(box * s), 24, 520);
      const b = buf('base', px, px), k = px / box;
      b.ctx.setTransform(k, 0, 0, k, px / 2, px / 2);
      GLOW14.cap = [];
      try { drawApple(b.ctx, R, Object.assign({}, st, { skin: 0 })); } finally { lastB = { cv: b, box, px, glows: GLOW14.cap }; GLOW14.cap = null; }
      return lastB;
    }
    /* P1 (v14.0): the filtered apple is cached. Key: character, look, scale (quarter steps) and R; inside it a
       pose bucket: blink, hurt, facing in 8 directions, the animation clock in 12 steps a second, bites and the
       powerup flags that change the drawing. A cache refreshes at most 15 times a second. */
    const CACHE14 = new Map();
    function cached14(th, c, R, st) {
      const m = c.getTransform(), s = Math.hypot(m.a, m.b) || 1, sq = Math.max(0.5, Math.round(s * 4) / 4);
      const lx = st.lookX || 0, ly = st.lookY || 0, face = Math.hypot(lx, ly) < 0.3 ? 8 : (Math.round(Math.atan2(ly, lx) / (TAU / 8)) + 8) % 8;
      const pose = `${st.blink != null && st.blink < 0.5 ? 1 : 0}${st.hurt > 0 ? 1 : 0}${face}${Math.floor((st.t || 0) * 12)}|${st.bites ? st.bites.length : 0}${st.mouthOpen ? 1 : 0}${st.chewing ? 1 : 0}${st.horns ? 1 : 0}${st.shellUp ? 1 : 0}${st.toffee ? 1 : 0}${st.cyanide ? 1 : 0}${st.twin ? 1 : 0}${st.leaf != null ? Math.round(st.leaf * 4) : 0}`;
      const key = `${st.char || 'apple'}|${th.name}|${sq}|${R}`;
      let e = CACHE14.get(key);
      if (!e) {
        if (CACHE14.size > 64) CACHE14.clear();
        e = { cv: document.createElement('canvas'), pose: null, at: -1e9 }; e.ctx = e.cv.getContext('2d', { willReadFrequently: true }); CACHE14.set(key, e);
      }
      const now = performance.now();
      if (e.pose !== pose && (e.pose === null || now - e.at >= 1000 / 15 || now < e.at)) {
        const half = R * 3.2, px = Math.max(8, Math.ceil(half * 2 * sq));
        e.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (e.cv.width !== px) { e.cv.width = px; e.cv.height = px; } else e.ctx.clearRect(0, 0, px, px);
        e.ctx.setTransform(sq, 0, 0, sq, px / 2, px / 2); e.ctx.lineJoin = 'round'; e.ctx.lineCap = 'round';
        lastB = null; th.draw(e.ctx, R, st); glowsOver(e.ctx, lastB);
        e.pose = pose; e.at = now;
      }
      const h = R * 3.2;
      c.drawImage(e.cv, -h, -h, h * 2, h * 2);
    }
    /* S1: glows (Lucifappel's flame) go on top of the filtered apple, unfiltered */
    let lastB = null;
    function glowsOver(c, B) {
      if (!B || !B.glows || !B.glows.length) return;
      const k = B.px / B.box;
      c.save();
      for (const g of B.glows) {
        const x = (g.x - B.px / 2) / k, y = (g.y - B.px / 2) / k, r = g.r / k;
        const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, g.c0); gr.addColorStop(1, g.c1);
        c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      }
      c.restore();
    }
    // a solid colour copy of the silhouette
    function tint(src, col, key) {
      const b = buf(key || 'tint', src.width, src.height);
      b.ctx.drawImage(src, 0, 0); b.ctx.globalCompositeOperation = 'source-in'; b.ctx.fillStyle = col; b.ctx.fillRect(0, 0, src.width, src.height);
      return b;
    }
    const put = (c, cv, box, dx = 0, dy = 0, sc = 1) => c.drawImage(cv, -box * sc / 2 + dx, -box * sc / 2 + dy, box * sc, box * sc);
    // low resolution copy with its colours run through fn(r,g,b) -> [r,g,b]
    function crunch(B, R, cells, fn) {
      const n = clamp(Math.round(B.box / (R * 2) * cells), 12, 96), sm = buf('small', n, n);
      sm.ctx.drawImage(B.cv, 0, 0, n, n);
      const img = sm.ctx.getImageData(0, 0, n, n), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
        const a = d[i + 3] / 255, o = fn(d[i] / a, d[i + 1] / a, d[i + 2] / a);
        d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
      }
      sm.ctx.putImageData(img, 0, 0);
      return sm;
    }
    const lw = (R, k) => Math.max(0.6, R * k);

    /* 8-Bit: 22 big pixels across, a 4 level palette per channel, a dark pixel rim */
    function draw8(c, R, st) {
      const B = base(c, R, st);
      const q = (v) => Math.min(255, Math.round(v / 85) * 85);
      const sm = crunch(B, R, 22, (r, g, b) => [q(r * 1.08), q(g), q(b * 0.95)]);
      c.save(); c.imageSmoothingEnabled = false;
      const n = sm.width, cell = B.box / n;
      const rim = tint(sm, '#120a14', 'rim');
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(c, rim, B.box, dx * cell, dy * cell);
      put(c, sm, B.box);
      c.restore();
      // a 1UP coin bobbing over the stem
      const t = st.t || 0, y = -R * 1.75 + Math.sin(t * 3) * R * 0.08, w = Math.abs(Math.cos(t * 2.4));
      c.fillStyle = '#120a14'; c.fillRect(-R * 0.2 * Math.max(0.2, w) - cell * 0.5, y - R * 0.22, R * 0.4 * Math.max(0.2, w) + cell, R * 0.44);
      c.fillStyle = '#ffd23a'; c.fillRect(-R * 0.2 * Math.max(0.2, w), y - R * 0.2, R * 0.4 * Math.max(0.2, w), R * 0.4);
      c.fillStyle = '#fff6c0'; c.fillRect(-R * 0.12 * Math.max(0.2, w), y - R * 0.14, R * 0.06, R * 0.18);
    }

    /* Game Boy: four greens, a dot matrix grid, a little ghosting */
    const GB = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]];
    function drawGB(c, R, st) {
      const B = base(c, R, st);
      const sm = crunch(B, R, 30, (r, g, b) => { const l = (r * 0.3 + g * 0.59 + b * 0.11) / 255; return GB[clamp(Math.floor(Math.pow(l, 0.8) * 4), 0, 3)]; });
      const n = sm.width, up = buf('gbup', n * 4, n * 4);
      up.ctx.imageSmoothingEnabled = false; up.ctx.drawImage(sm, 0, 0, n * 4, n * 4);
      up.ctx.globalCompositeOperation = 'source-atop'; up.ctx.fillStyle = 'rgba(15,56,15,0.32)';
      for (let i = 0; i <= n; i++) { up.ctx.fillRect(i * 4, 0, 1, n * 4); up.ctx.fillRect(0, i * 4, n * 4, 1); }
      c.save(); c.imageSmoothingEnabled = false;
      c.globalAlpha = 0.22; put(c, up, B.box, R * 0.06, R * 0.05);
      c.globalAlpha = 1; put(c, up, B.box);
      c.restore();
    }

    /* Neon Arcade: a dark body, magenta and cyan tubes around the edge, a scan line running up */
    function drawNeon(c, R, st) {
      const B = base(c, R, st), t = st.t || 0, pulse = 0.75 + 0.25 * Math.sin(t * 5);
      const mag = tint(B.cv, '#ff3ad8', 'neonA'), cy = tint(B.cv, '#3af0ff', 'neonB');
      c.save();
      c.globalAlpha = 0.35 * pulse; put(c, mag, B.box, 0, 0, 1.13);
      c.globalAlpha = 0.9; put(c, mag, B.box, -R * 0.02, 0, 1.065);
      c.globalAlpha = 0.85; put(c, cy, B.box, R * 0.03, R * 0.01, 1.035);
      c.restore();
      const o = buf('neonO', B.px, B.px);
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      o.ctx.fillStyle = 'rgba(14,4,30,0.62)'; o.ctx.fillRect(0, 0, B.px, B.px);
      const sy = (1 - ((t * 0.45) % 1)) * B.px;
      const g = o.ctx.createLinearGradient(0, sy - B.px * 0.08, 0, sy + B.px * 0.08);
      g.addColorStop(0, 'rgba(58,240,255,0)'); g.addColorStop(0.5, 'rgba(58,240,255,0.55)'); g.addColorStop(1, 'rgba(58,240,255,0)');
      o.ctx.fillStyle = g; o.ctx.fillRect(0, sy - B.px * 0.08, B.px, B.px * 0.16);
      o.ctx.globalCompositeOperation = 'lighter'; o.ctx.globalAlpha = 0.25; o.ctx.drawImage(B.cv, 0, 0);
      put(c, o, B.box);
    }

    /* Glitch: split channels, and every so often the slices skip sideways */
    function drawGlitch(c, R, st) {
      const B = base(c, R, st), t = st.t || 0, f = Math.floor(t * 14), rr = (i) => rnd24(f * 7 + i);
      const on = (t % 1.9) < 0.28 || (st.hurt > 0) || rr(99) < 0.04, sh = on ? R * 0.16 : R * 0.05;
      const red = tint(B.cv, '#ff2a4a', 'glR'), cy = tint(B.cv, '#2af0ff', 'glC');
      c.save();
      c.globalAlpha = 0.55; put(c, red, B.box, -sh, 0); put(c, cy, B.box, sh, on ? R * 0.04 : 0);
      c.globalAlpha = 1;
      if (!on) put(c, B.cv, B.box);
      else {
        const strips = 9, hs = B.px / strips, hb = B.box / strips;
        for (let i = 0; i < strips; i++) {
          const dx = rr(i) < 0.45 ? (rr(i + 20) - 0.5) * R * 0.7 : 0;
          c.drawImage(B.cv, 0, i * hs, B.px, hs, -B.box / 2 + dx, -B.box / 2 + i * hb, B.box, hb);
        }
        for (let i = 0; i < 6; i++) {
          c.fillStyle = ['#ff2a4a', '#2af0ff', '#ffffff', '#f2ff3a'][i % 4];
          c.fillRect((rr(i + 40) - 0.5) * R * 2.4, (rr(i + 60) - 0.5) * R * 2.2, R * (0.08 + rr(i + 80) * 0.3), R * 0.07);
        }
      }
      c.restore();
    }

    /* Hologram: cyan, see through, scan lines, a projector under the feet */
    function drawHolo(c, R, st) {
      const B = base(c, R, st), t = st.t || 0;
      const flick = st.hurt > 0 ? 0.35 + Math.random() * 0.5 : (Math.sin(t * 23) > 0.96 ? 0.45 : 0.8);
      const o = buf('holo', B.px, B.px);
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'color'; o.ctx.fillStyle = '#3ad8ff'; o.ctx.fillRect(0, 0, B.px, B.px);
      o.ctx.globalCompositeOperation = 'destination-in'; o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      const step = Math.max(2, Math.round(B.px / 70)), off = Math.floor(t * 30) % step;
      o.ctx.fillStyle = 'rgba(0,20,40,0.45)';
      for (let y = off; y < B.px; y += step * 2) o.ctx.fillRect(0, y, B.px, step);
      o.ctx.fillStyle = 'rgba(200,250,255,0.18)'; o.ctx.fillRect(0, 0, B.px, B.px);
      // projector cone and pad
      c.save();
      const cg = c.createLinearGradient(0, R * 1.25, 0, -R * 0.6);
      cg.addColorStop(0, 'rgba(90,230,255,0.35)'); cg.addColorStop(1, 'rgba(90,230,255,0)');
      c.fillStyle = cg; c.beginPath(); c.moveTo(-R * 0.28, R * 1.25); c.lineTo(R * 0.28, R * 1.25); c.lineTo(R * 1.15, -R * 0.6); c.lineTo(-R * 1.15, -R * 0.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(90,230,255,0.8)'; c.lineWidth = lw(R, 0.05); ell(c, 0, R * 1.25, R * 0.5, R * 0.12); c.stroke();
      c.strokeStyle = `rgba(90,230,255,${0.5 + 0.3 * Math.sin(t * 4)})`; ell(c, 0, R * 1.25, R * 0.75 + Math.sin(t * 2) * R * 0.05, R * 0.18); c.stroke();
      c.globalAlpha = flick; put(c, o, B.box, Math.sin(t * 31) > 0.97 ? R * 0.08 : 0, 0);
      c.restore();
    }

    /* Cel Shade: a thick ink line, flat light, halftone dots in the shadow, a speech burst on hits */
    function drawCel(c, R, st) {
      const B = base(c, R, st), t = st.t || 0;
      const ink = tint(B.cv, '#0a0608', 'ink'), w = R * 0.11;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; put(c, ink, B.box, Math.cos(a) * w, Math.sin(a) * w); }
      const o = buf('cel', B.px, B.px), k = B.px / B.box;
      o.ctx.drawImage(B.cv, 0, 0);
      o.ctx.globalCompositeOperation = 'source-atop';
      o.ctx.fillStyle = 'rgba(255,255,255,0.12)'; o.ctx.fillRect(0, 0, B.px, B.px);
      o.ctx.fillStyle = 'rgba(20,6,30,0.4)';
      const gap = R * 0.16 * k;
      for (let y = 0; y < B.px; y += gap) for (let x = 0; x < B.px; x += gap) {
        const ux = x / B.px - 0.5, uy = y / B.px - 0.5, sh = ux * 0.7 + uy * 0.9;
        if (sh < 0.02) continue;
        o.ctx.beginPath(); o.ctx.arc(x + ((y / gap) % 2 ? gap / 2 : 0), y, Math.min(gap * 0.45, sh * gap * 2.2), 0, TAU); o.ctx.fill();
      }
      put(c, o, B.box);
      c.fillStyle = '#ffffff'; ell(c, -R * 0.52, -R * 0.42, R * 0.13, R * 0.07, -0.7); c.fill();
      if (st.hurt > 0 || (t % 4) < 0.6) {
        const bx = R * 1.15, by = -R * 1.2, s = 1 + Math.sin(t * 20) * 0.05;
        c.save(); c.translate(bx, by); c.scale(s, s);
        c.beginPath();
        for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, r = i % 2 ? R * 0.42 : R * 0.62; c.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r); }
        c.closePath(); c.fillStyle = '#ffd23a'; c.fill(); c.strokeStyle = '#0a0608'; c.lineWidth = lw(R, 0.06); c.stroke();
        c.fillStyle = '#e8203a'; c.font = `900 ${R * 0.42}px Impact, 'Arial Black', sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(st.hurt > 0 ? 'OUCH' : 'POW', 0, R * 0.02);
        c.restore();
      }
    }

    const THEMES = [
      { name: '8-Bit', draw: draw8, bg: ['#1a1a4a', '#06061a'], motif: 'pix135', acc: '#ffd23a', fx: { mote: 'pixel', col: '#ffd23a' }, kill: 'pixel', word: '+100',
        line: 'Downsampled to 22 pixels and four shades a channel. A 1UP coin follows him around. Blow on the cartridge if he freezes.' },
      { name: 'Game Boy', draw: drawGB, bg: ['#9bbc0f', '#306230'], motif: 'lcd135', acc: '#0f380f', light: true, fx: { mote: 'pixel', col: '#8bac0f' }, kill: 'gb', word: 'BEEP',
        line: 'Four shades of green and a screen you have to tilt toward the lamp. The batteries are always almost dead.' },
      { name: 'Neon Arcade', draw: drawNeon, bg: ['#2a0a4a', '#05010e'], motif: 'synth135', acc: '#ff3ad8', fx: { mote: 'spark', col: '#ff3ad8', col2: '#3af0ff' }, kill: 'neon', word: 'COMBO',
        line: 'Insert coin. Dark body, two neon tubes around the edge, a grid that runs to a sun that never sets. High score: nobody.' },
      { name: 'Glitch', draw: drawGlitch, bg: ['#0a0a12', '#000000'], motif: 'glitch135', acc: '#2af0ff', fx: { mote: 'pixel', col: '#ff2a4a' }, kill: 'glitch', word: 'ERR',
        line: 'Something broke in the save file and he kept going. Colours split, slices skip a frame. Do not report it.' },
      { name: 'Hologram', draw: drawHolo, bg: ['#04202e', '#01060c'], motif: 'holo135', acc: '#5ae6ff', fx: { mote: 'spark', col: '#5ae6ff', col2: '#e8fdff' }, kill: 'holo', word: 'SYNC',
        line: 'A projection of an apple. Cyan, see through, flickers when something bites. The real one is somewhere else.' },
      { name: 'Cel Shade', draw: drawCel, bg: ['#ffd23a', '#e8742a'], motif: 'comic135', acc: '#e8203a', light: true, fx: { mote: 'dot', col: '#ffd23a' }, kill: 'comic', word: null,
        line: 'Thick ink, flat light, dots in the shadows. Every hit gets a word in yellow. POW is the usual one.' },
    ];
    for (const id in SKINS) {
      if (!CHARS[id]) continue;
      for (const th of THEMES) SKINS[id].push({ name: th.name, tier: 'Arcade', line: th.line, draw: th.glow14 || (th.glow14 = function (c, R, st) { cached14(th, c, R, st); }), bg: th.bg, motif: th.motif, acc: th.acc, light: th.light, gn135: th });
    }
    for (const th of THEMES) FX122[th.name] = th.fx;

    /* kill bursts in the worn style, own little particle list so the old renderer stays untouched */
    const PX = [];
    let lastT = 0;
    const COMIC = ['POW', 'BAM', 'ZAP', 'WHAM', 'KRAK', 'SPLAT'];
    function onKill(sn, P) {
      if (!P || P !== G.player || !Save.data || Save.data.settings.fx === false) return;
      const S = curSkin(P.char), th = S && S.gn135;
      if (!th) return;
      const x = sn.x, y = sn.y, k = th.kill;
      const cols = k === 'pixel' ? ['#ffd23a', '#e8203a', '#3a8aff', '#ffffff'] : k === 'gb' ? ['#0f380f', '#306230', '#8bac0f'] : k === 'neon' ? ['#ff3ad8', '#3af0ff']
        : k === 'glitch' ? ['#ff2a4a', '#2af0ff', '#ffffff'] : k === 'holo' ? ['#5ae6ff', '#e8fdff'] : ['#ffd23a', '#e8203a', '#0a0608'];
      const n = PX.length > 220 ? 6 : 16;
      for (let i = 0; i < n; i++) {
        const a = rnd(TAU), sp = rnd(40, 150);
        PX.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: rnd(2, 4.5), t: 0, life: rnd(0.35, 0.7), col: cols[i % cols.length], glow: k === 'neon' || k === 'holo', sq: k !== 'comic' && k !== 'holo' });
      }
      if (k === 'neon' || k === 'holo') { addP({ kind: 'ring', x, y, vx: 0, vy: 0, r: 4, life: 0.45, col: cols[0], glow: true, drag: 0 }); addP({ kind: 'ring', x, y, vx: 0, vy: 0, r: 10, life: 0.6, col: cols[1], glow: true, drag: 0 }); }
      const word = th.word || COMIC[Math.floor(Math.random() * COMIC.length)];
      if (Math.random() < (k === 'comic' ? 0.8 : 0.45)) floatText(x, y - 10, word, k === 'gb' ? '#9bbc0f' : k === 'comic' ? '#ffd23a' : cols[0]);
    }
    safe(() => {
      const ok0 = onKill10;
      onKill10 = function (sn, room, P) { const r = ok0.apply(this, arguments); safe(() => onKill(sn, P)); return r; };
      const dp0 = drawParticles;
      drawParticles = function (c, glow) {
        dp0.apply(this, arguments);
        if (!PX.length) return;
        if (!glow) {
          const dt = clamp((G.t || 0) - lastT, 0, 0.05); lastT = G.t || 0;
          for (let i = PX.length - 1; i >= 0; i--) {
            const p = PX[i]; p.t += dt; if (p.t > p.life) { PX.splice(i, 1); continue; }
            const dr = Math.exp(-4 * dt); p.vx *= dr; p.vy *= dr; p.x += p.vx * dt; p.y += p.vy * dt;
          }
        }
        c.save(); if (glow) c.globalCompositeOperation = 'lighter';
        for (const p of PX) {
          if (!!p.glow !== !!glow) continue;
          const a = 1 - Math.pow(p.t / p.life, 2), s = p.s * (1 - (p.t / p.life) * 0.4);
          c.globalAlpha = a; c.fillStyle = p.col;
          if (p.sq) c.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); else circle(c, p.x, p.y, s * 0.6);
        }
        c.restore();
      };
      // a fresh room leaves the old sparks behind
      setInterval(() => { if (G.state !== 'play' && PX.length) PX.length = 0; }, 1500);
    });
    return { THEMES, PX };
  })();
  for (const id in SKINS) for (const S of SKINS[id]) epic122(S);

  /* old saves stored a position in the old list: find the same skin by name, or fall back to the original */
  function migrate122() {
    const st = Save.data && Save.data.settings;
    if (!st || st.skin122) return;
    for (const id in OLD122) {
      const key = 'skin_' + id, v = st[key];
      if (!v) continue;
      const n = v === true ? 1 : Math.round(+v) || 0, name = OLD122[id][n - 1], ni = name ? SKINS[id].findIndex((S) => S.name === name) : -1;
      st[key] = ni >= 0 ? ni + 1 : 0;
    }
    st.skin122 = true;
    safe(() => Save.store());
  }

  /* in a fight the worn skin leaves a few of its own sparks behind you */
  safe(() => {
    const dpo122 = drawPlayerOver9;
    drawPlayerOver9 = function (c, P, t) {
      dpo122(c, P, t);
      if (!P || P !== G.player || P.dying > 0 || G.state !== 'play' || !Save.data || Save.data.settings.fx === false) return;
      const L = SKINS[P.char], v = Save.data.settings['skin_' + P.char], n = v === true ? 1 : Math.round(+v) || 0, S = L && n > 0 ? L[n - 1] : null;
      if (!S || !S.fx122 || Math.hypot(P.vx || 0, P.vy || 0) < 40 || Math.random() > 0.35) return;
      addP({ kind: 'dot', x: P.x + rnd(-5, 5), y: P.y + P.R * 0.7, vx: rnd(-12, 12), vy: rnd(-28, -6), r: rnd(0.8, 1.8), life: rnd(0.3, 0.55), col: S.fx122.col, glow: true, drag: 1.5 });
    };
  });
  const skinKey = (id) => 'skin_' + id; S62.skinKey = skinKey;
  // what is worn: 0 the original, 1 and up a skin. Old saves stored true for the first skin.
  function skinIdx(id) {
    migrate122();
    const L = SKINS[id], v = Save.data && Save.data.settings && Save.data.settings[skinKey(id)];
    if (!L || !v) return 0;
    const n = v === true ? 1 : Math.round(+v) || 0;
    return n >= 1 && n <= L.length ? n : 0;
  }
  const skinOn = (id) => skinIdx(id) > 0; S62.skinOn = skinOn;
  const curSkin = (id) => { const n = skinIdx(id); return n ? SKINS[id][n - 1] : null; }; S62.curSkin = curSkin;
  function setSkin(id, n) { Save.data.settings[skinKey(id)] = typeof n === 'boolean' ? (n ? 1 : 0) : Math.max(0, Math.round(+n) || 0); safe(() => Save.store()); }
  const wantIdx = (id, sk) => (sk == null ? skinIdx(id) : sk === true ? 1 : sk === false ? 0 : Math.round(+sk) || 0); S62.wantIdx = wantIdx;

  /* every apple drawing goes through here: the worn skin, or the one a preview asks for */
  let IN = 0;
  const da0 = drawApple;
  drawApple = function (c, R, st) {
    const id = st && st.char, L = id && SKINS[id];
    const n = L ? wantIdx(id, st.skin) : 0, S = n > 0 && n <= L.length ? L[n - 1] : null;
    IN++;
    try {
      if (!S) return da0.apply(this, arguments);
      c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      try { S.draw(c, R, st); } catch (e) { console.error(e); } finally { c.restore(); }
    } finally { IN--; }
  };
  const gw0 = drawGullWings10;
  drawGullWings10 = function (c, R, flap, behind) {
    const S = !IN && G.player && G.player.char === 'apploa' ? curSkin('apploa') : null;
    if (S && S.wings) return S.wings(c, R, flap, behind);
    return gw0(c, R, flap, behind);
  };

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
