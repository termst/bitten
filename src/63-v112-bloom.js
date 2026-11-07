/* src/63-v112-bloom.js: v11.2: bloom, light, grain, grade. From v11.2. Lines 31014 to 31232 of the v13.7 script. */
/* ===== v11.2: Sharper look. Bloom on everything that glows, colored light from torches and tubes,
   contact shadows and floor grain baked into every room, dust in the light, a color grade per floor,
   film grain. Settings switch "Fancy graphics"; slow devices drop to a lighter mode on their own. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { console.error(e); return fb; } };
  const on = () => !!(Save.data && Save.data.settings && Save.data.settings.fx !== false);
  // per floor: light tint for torches, a soft-light grade, how strong the bloom is
  const GRADE = {
    cellar: { warm: '#ff9a48', grade: '#c98a52', ga: 0.10, bloom: 0.42 },
    halls: { warm: '#ffb070', grade: '#7a8cc0', ga: 0.10, bloom: 0.40 },
    market: { warm: '#e8f2ff', grade: '#8ab0a0', ga: 0.08, bloom: 0.36 },
    kamer: { warm: '#ffc070', grade: '#6a80c8', ga: 0.10, bloom: 0.40 },
    garden: { warm: '#ff7a4a', grade: '#c05050', ga: 0.12, bloom: 0.46 },
  };
  const gradeOf = () => { const L = G.levelDef || LEVELS[0]; return GRADE[L.set] || GRADE.cellar; };
  const FX = { low: false, slow: 0, n: 0, b1: null, b2: null, grain: null, motes: new WeakMap(), frames: 0 };

  /* ------------------------------------------------------------------ baked into the room cache */
  const brc0 = buildRoomCache;
  buildRoomCache = function (room, L, k) {
    brc0(room, L, k);
    if (!on()) return;
    safe(() => bakeRoom(room, L, k));
  };
  function bakeRoom(room, L, k) {
    const c = room.cacheCtx; if (!c) return;
    c.save();
    c.setTransform(k, 0, 0, k, WALL * k, WALL * k);
    c.globalCompositeOperation = 'source-over';
    const rng = mulberry32((room.seed ^ 0x5f3759df) >>> 0);
    const empty = (cc, rr) => cc >= 0 && rr >= 0 && cc < COLS && rr < ROWS && !(room.tiles[rr] && room.tiles[rr][cc]);
    const block = (cc, rr) => cc >= 0 && rr >= 0 && cc < COLS && rr < ROWS && room.tiles[rr][cc] && room.tiles[rr][cc].solid && room.tiles[rr][cc].type !== 'candle';
    // floor grain: soft blotches and tiny specks on empty tiles only, so nothing lands on a rock
    for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
      if (!empty(cc, rr)) continue;
      const x0 = cc * T, y0 = rr * T;
      for (let i = 0; i < 2; i++) {
        const x = x0 + 6 + rng() * (T - 12), y = y0 + 6 + rng() * (T - 12), r = 6 + rng() * 10;
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        const dark = rng() < 0.6;
        g.addColorStop(0, dark ? 'rgba(0,0,0,0.10)' : 'rgba(255,240,220,0.035)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let i = 0; i < 7; i++) {
        c.fillStyle = rng() < 0.55 ? 'rgba(0,0,0,0.22)' : 'rgba(255,238,215,0.07)';
        c.fillRect(x0 + rng() * T, y0 + rng() * T, 0.7 + rng() * 0.9, 0.7 + rng() * 0.9);
      }
    }
    // contact shadows: empty tiles next to something solid get a soft dark edge on that side
    const SH = 13;
    for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
      if (!empty(cc, rr)) continue;
      const x0 = cc * T, y0 = rr * T;
      const edge = (x, y, w, h, gx0, gy0, gx1, gy1, a) => {
        const g = c.createLinearGradient(gx0, gy0, gx1, gy1);
        g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(x, y, w, h);
      };
      if (block(cc, rr - 1)) edge(x0, y0, T, SH, 0, y0, 0, y0 + SH, 0.42); // things cast down a little more
      if (block(cc - 1, rr)) edge(x0, y0, SH * 0.8, T, x0, 0, x0 + SH * 0.8, 0, 0.3);
      if (block(cc + 1, rr)) edge(x0 + T - SH * 0.8, y0, SH * 0.8, T, x0 + T, 0, x0 + T - SH * 0.8, 0, 0.3);
      if (block(cc, rr + 1)) edge(x0, y0 + T - SH * 0.6, T, SH * 0.6, 0, y0 + T, 0, y0 + T - SH * 0.6, 0.22);
    }
    // the walls lean over the floor: a deep shadow band along every inside edge
    const band = (x, y, w, h, gx0, gy0, gx1, gy1, a) => {
      const g = c.createLinearGradient(gx0, gy0, gx1, gy1);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.45, `rgba(0,0,0,${a * 0.35})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x, y, w, h);
    };
    band(0, 0, RW, 30, 0, 0, 0, 30, 0.55);
    band(0, RH - 22, RW, 22, 0, RH, 0, RH - 22, 0.38);
    band(0, 0, 24, RH, 0, 0, 24, 0, 0.45);
    band(RW - 24, 0, 24, RH, RW, 0, RW - 24, 0, 0.45);
    // a faint top light on the wall caps
    c.globalCompositeOperation = 'lighter';
    const tg = c.createLinearGradient(0, -WALL, 0, -WALL + 6);
    tg.addColorStop(0, 'rgba(255,230,200,0.06)'); tg.addColorStop(1, 'rgba(255,230,200,0)');
    c.fillStyle = tg; c.fillRect(-WALL, -WALL, VIEW_W, 6);
    c.restore();
  }

  /* ------------------------------------------------------------------ in the room: colored light and dust */
  const rr0 = renderRoom;
  renderRoom = function (c, L) {
    rr0(c, L);
    if (!on() || !G.room) return;
    safe(() => roomLights(c, G.room, L));
  };
  function motesOf(room) {
    let m = FX.motes.get(room);
    if (!m) {
      m = [];
      for (let i = 0; i < 34; i++) m.push({ x: rnd(0, RW), y: rnd(0, RH), z: rnd(0.4, 1), ph: rnd(0, TAU), s: rnd(0.5, 1.3) });
      FX.motes.set(room, m);
    }
    return m;
  }
  function roomLights(c, room, L) {
    const k = View.s * View.dpr, t = G.t, P = G.player, gr = gradeOf();
    const wx = (View.ox + WALL * View.s) * View.dpr, wy = (View.oy + WALL * View.s) * View.dpr;
    c.save();
    c.setTransform(k, 0, 0, k, wx, wy);
    c.globalCompositeOperation = 'lighter';
    // torches and candles throw their own color on the floor
    for (const s of room.sconces) {
      const f = 0.85 + Math.sin(t * 9 + s.ph) * 0.08 + Math.sin(t * 23 + s.ph * 2) * 0.05;
      glowDot(c, s.lx, s.ly + (s.side === 'n' ? 18 : s.side === 's' ? -18 : 0), 92, gr.warm, 0.11 * f);
      glowDot(c, s.x, s.y, 26, '#ffd9a0', 0.22 * f);
    }
    for (const o of room.obs) if (o.type === 'candle' && !o.sign) glowDot(c, o.x, o.y - 8, 70, gr.warm, 0.09 + Math.sin(t * 8 + o.seed * 9) * 0.015);
    if (room.tubes) for (const s of room.tubes) { const lv = tubeLevel(s, t); glowDot(c, s.x, s.y, 120, '#cfe4ff', 0.06 * lv); }
    if (room.exit && room.exit.kind !== 'light') glowDot(c, room.exit.x, room.exit.y, 60, '#ff6a3a', 0.05 + 0.02 * Math.sin(t * 2));
    // dust drifting through the light around the apple and the torches
    if (!FX.low) {
      const ms = motesOf(room);
      const pr = (L.light || 200) * 0.85;
      for (const m of ms) {
        m.x += Math.sin(t * 0.3 + m.ph) * 0.06 + 0.04 * m.z; m.y += Math.cos(t * 0.23 + m.ph) * 0.05 - 0.03 * m.z;
        if (m.x > RW) m.x -= RW; if (m.x < 0) m.x += RW; if (m.y < 0) m.y += RH; if (m.y > RH) m.y -= RH;
        let lit = Math.max(0, 1 - dist(m.x, m.y, P.x, P.y) / pr);
        for (const s of room.sconces) lit = Math.max(lit, 0.8 * Math.max(0, 1 - dist(m.x, m.y, s.lx, s.ly) / 90));
        if (lit <= 0.02) continue;
        const tw = 0.55 + 0.45 * Math.sin(t * (1.3 + m.s) + m.ph);
        c.fillStyle = `rgba(255,236,205,${0.32 * lit * tw * m.z})`;
        c.beginPath(); c.arc(m.x, m.y, 0.55 + m.s * 0.5 * m.z, 0, TAU); c.fill();
      }
    }
    // rim light: a thin bright edge on the apple, from the upper left
    if (P && P.dying <= 0 && P.hp > 0) {
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = 'rgba(255,225,200,0.16)'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(P.x - 0.5, P.y - 2 - (P.hopH || 0), (P.R || 12) * 1.02, Math.PI * 1.05, Math.PI * 1.55); c.stroke();
    }
    c.restore();
  }

  /* ------------------------------------------------------------------ after everything: grade, bloom, grain */
  const render0 = render;
  render = function (dt) {
    render0(dt);
    if (!on()) return;
    safe(() => post(dt));
  };
  function grainTile() {
    if (FX.grain) return FX.grain;
    const n = 128, cv = document.createElement('canvas'); cv.width = n; cv.height = n;
    const g = cv.getContext('2d'), img = g.createImageData(n, n);
    for (let i = 0; i < n * n; i++) { const v = 128 + (Math.random() * 2 - 1) * 90; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
    FX.grain = cv; return cv;
  }
  function post(dt) {
    const c = View.ctx, cv = View.cv, W = cv.width, H = cv.height;
    if (!W || !H) return;
    // frame time watch: a phone that cannot keep up gets the light version
    if (dt > 0) { FX.n++; FX.slow = FX.slow * 0.97 + (dt > 1 / 38 ? 1 : 0) * 0.03; if (FX.n > 180 && FX.slow > 0.6) FX.low = true; }
    const inGame = G.state !== 'menu' && !!G.room && G.state !== 'win' && G.state !== 'cutscene';
    const gr = gradeOf();
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    // color grade: soft light pushes contrast and gives each floor its own air
    if (inGame) {
      c.globalCompositeOperation = 'soft-light'; c.globalAlpha = gr.ga * 2.2;
      c.fillStyle = gr.grade; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
    // bloom: shrink the frame, raise it to the fourth power so only bright things survive, spread it back
    const bw = Math.max(8, Math.round(W / (FX.low ? 8 : 5))), bh = Math.max(8, Math.round(H / (FX.low ? 8 : 5)));
    if (!FX.b1) { FX.b1 = document.createElement('canvas'); FX.b2 = document.createElement('canvas'); }
    const b1 = FX.b1, b2 = FX.b2;
    if (b1.width !== bw || b1.height !== bh) { b1.width = bw; b1.height = bh; b2.width = Math.max(4, bw >> 1); b2.height = Math.max(4, bh >> 1); }
    const x1 = b1.getContext('2d'), x2 = b2.getContext('2d');
    x1.globalCompositeOperation = 'source-over'; x1.imageSmoothingEnabled = true;
    x1.drawImage(cv, 0, 0, bw, bh);
    x1.globalCompositeOperation = 'multiply';
    x1.drawImage(b1, 0, 0); x1.drawImage(b1, 0, 0);
    x1.globalCompositeOperation = 'source-over';
    x2.globalCompositeOperation = 'copy'; x2.imageSmoothingEnabled = true;
    x2.drawImage(b1, 0, 0, b2.width, b2.height);
    x2.globalCompositeOperation = 'source-over';
    c.imageSmoothingEnabled = true;
    const amt = inGame ? gr.bloom : 0.34;
    c.globalCompositeOperation = 'screen';
    c.globalAlpha = amt * 0.75; c.drawImage(b1, 0, 0, W, H);
    c.globalAlpha = amt; c.drawImage(b2, -W * 0.01, -H * 0.01, W * 1.02, H * 1.02);
    if (!FX.low && !REDUCED) {
      // film grain, a new offset every frame
      const tile = grainTile();
      const pat = c.createPattern(tile, 'repeat');
      if (pat) {
        c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.055;
        const ox = (Math.random() * 128) | 0, oy = (Math.random() * 128) | 0;
        c.translate(-ox, -oy); c.fillStyle = pat; c.fillRect(0, 0, W + 128, H + 128);
      }
    }
    c.restore();
  }

  /* ------------------------------------------------------------------ the switch in Settings, texts, the guide */
  safe(() => {
    if (typeof SETTING_KEYS === 'object') SETTING_KEYS.fx = 1;
    const box = UI.el && UI.el.toggles; if (!box || box.querySelector('[data-set="fx"]')) return;
    const b = document.createElement('button'); b.className = 'tog'; b.type = 'button'; b.setAttribute('role', 'switch'); b.dataset.set = 'fx';
    b.innerHTML = '<span><b>Fancy graphics</b><small>Bloom, colored torch light, dust, shadows and film grain. Off is faster on old phones. Slow phones dial it down by themselves.</small></span><i></i>';
    b.addEventListener('click', (e) => { e.preventDefault(); UI.flip('fx'); FX.low = false; FX.slow = 0; FX.n = 0; if (G.map) for (const r of G.map.rooms) r.dirty = true; });
    const ref = box.querySelector('[data-set="shake"]');
    if (ref && ref.nextSibling) box.insertBefore(b, ref.nextSibling); else box.appendChild(b);
    UI.paintSettings();
  });
  safe(() => {
    if (typeof TEXT_LIT9 === 'object' && Array.isArray(TEXT_LIT9.messages)) for (const s of ['Fancy graphics', 'Bloom, colored torch light, dust, shadows and film grain. Off is faster on old phones. Slow phones dial it down by themselves.']) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
    for (const p of document.querySelectorAll('#tab-controls .intro9')) if (/Settings has screen shake/.test(p.textContent)) p.textContent = 'Settings has screen shake, fancy graphics, vibration, pop-up text, aim assist and the powerup cards. Your save code lives there too.';
  });

  Object.assign(window.__bitten || (window.__bitten = {}), { FX112: { FX, post, bakeRoom, roomLights, GRADE } });
})();


