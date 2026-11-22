/* src/89-v14-draken-reis.js: v14.5 the way to De Drakenhemel and back. The floor before the dragon floor does not end in
   a hole: a ladder comes down from a shaft of daylight. Every apple climbs it, and a short cut-away shows the climb up past
   every floor of the run so far, through the earth, out into the sky, up to the terrace in the clouds. When the sky boss
   falls and a floor is left, a hole tears open in the terrace: you drop through the clouds and fall past every floor again,
   down to the next one, and land.
   Online: like src/86, only the timing and the apple positions live in the simulation (G.trans ticks on every peer, no
   random draws); the cut-away is drawn from tick time. Test: node test/draken.js. */
(function () {
  'use strict';
  const safe = (f) => { try { return f(); } catch (e) { errNote14(e, 'reis89'); console.error(e); } };
  const D = () => window.__bitten.DRAAK14;
  const SET = 'draken';
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const hash = (x) => { const s = Math.sin(x * 12.9898 + 4.1414) * 43758.5453; return s - Math.floor(s); };
  const CLIMB = { out: 1.25, shaft: 2.7, in: 1.0 }, FALL = { out: 1.1, shaft: 2.3, in: 1.05 };
  const calm = (P) => { P.sink = 0; P.hopH = 0; P.squash = 0; };

  /* ================================================================ every floor of the run, for the cut-away */
  Hooks.layer('Game.loadLevel', 'v14 draken reis', function (next, i) {
    const r = next.call(this, i);
    safe(() => {
      const L = G.levelDef, run = G.run; if (!L || !run) return;
      const path = run.path14 || (run.path14 = []);
      path[i] = { name: L.name, set: L.set, floor: L.floor, floor2: L.floor2, grout: L.grout, wall: L.wall, wallHi: L.wallHi, wallLo: L.wallLo, void: L.void, deco: L.decoCol, rock: L.rock, dirt: L.dirt };
      path.length = i + 1;
    });
    return r;
  });
  const nextSet = (g) => safe(() => { if (G.mode === 'story' || g.isLast()) return null; const L = g.levelBase(G.levelIdx + 1); return L && L.set; });

  /* ================================================================ the exit: a ladder up, or a hole in the sky */
  Hooks.layer('Game.clearRoom', 'v14 draken reis', function (next, room) {
    const r = next.call(this, room);
    safe(() => {
      const ex = room && room.exit;
      if (!ex || ex.kind !== 'hole' || room.type !== 'boss') return;
      if (G.levelDef && G.levelDef.set === SET) {
        ex.sky14 = true;
        setTimeout(() => { if (G.room === room && G.state === 'play') UI.card('A way down', 'The sky tears open', 'Jump. Every floor flies past.', '', 2.4); }, 1400);
      } else if (nextSet(this) === SET) {
        ex.ladder14 = true;
        setTimeout(() => { if (G.room === room && G.state === 'play') UI.card('A way up', 'A ladder to the sky', 'Climb it, past every floor, above the clouds.', '', 2.6); }, 1400);
      }
    });
    return r;
  });
  const d0 = Game.descend;
  Game.descend = function () {
    if (G.trans) return;
    const ex = G.room && G.room.exit;
    if (!ex || !(ex.ladder14 || ex.sky14)) return d0.apply(this, arguments);
    const js = players14().map((Q, k) => ({ P: Q, x0: Q.x, y0: Q.y, d: k * 0.1, a: false, b: false, side: players14().length > 1 ? (k % 2 ? 1 : -1) * (6 + 4 * Math.floor(k / 2)) : 0 }));
    G.trans = { kind: ex.ladder14 ? 'climb14' : 'fall14', phase: 'out', t: 0, x0: G.player.x, y0: G.player.y, r14: { ex: { x: ex.x, y: ex.y }, js, from: G.levelIdx } };
    if (ex.ladder14) safe(() => Sfx.tone(330, 0.25, { to: 520, vol: 0.06, type: 'triangle' }));
  };
  const next14 = (g) => {
    g.loadLevel(G.levelIdx + 1);
    G.fade = 0;
  };

  const ut0 = Game.updateTrans;
  Game.updateTrans = function (dt) {
    const tr = G.trans;
    if (!tr || !tr.r14) return ut0.apply(this, arguments);
    tr.t += dt; G.fade = 0;
    const R = tr.r14, up = tr.kind === 'climb14', T0 = up ? CLIMB : FALL;
    if (tr.phase === 'out') {
      const ex = R.ex;
      for (const j of R.js) {
        const P = j.P, s = tr.t - j.d;
        if (s <= 0) continue;
        // walk or hop to the exit
        const u = clamp01(s / 0.4), e = smooth(u);
        P.x = lerp(j.x0, ex.x + j.side, e); P.y = lerp(j.y0, ex.y, e);
        if (up) {
          // climb: every rung a little push, up and out of the room
          if (s < 0.4) { P.hopH = Math.sin(Math.PI * u) * 8; P.squash = -0.3 * Math.sin(Math.PI * u); continue; }
          const v = s - 0.4, rung = Math.floor(v / 0.16);
          if (!j.a) { j.a = true; }
          P.hopH = v * 140 + Math.abs(Math.sin(v * Math.PI / 0.16)) * 4;
          P.squash = 0.18 * Math.sin(v * Math.PI / 0.08);
          if (j === R.js[0] && rung !== j.rung) { j.rung = rung; safe(() => Sfx.tone(300 + rung * 40, 0.06, { vol: 0.04, type: 'square' })); }
        } else {
          if (s < 0.12) { P.squash = 0.7 * Math.sin(Math.PI * s / 0.12); continue; }
          const w = clamp01((s - 0.12) / 0.45);
          P.hopH = Math.sin(Math.PI * Math.min(1, w)) * 26;
          if (w >= 1) {
            const v = clamp01((s - 0.57) / 0.4);
            if (!j.b) { j.b = true; if (j === R.js[0]) safe(() => { Sfx.descend(); Sfx.whoosh10(); }); }
            P.hopH = 0; P.sink = smooth(v); P.squash = -0.5 * v;
          }
        }
      }
      if (tr.t >= T0.out) {
        for (const j of R.js) calm(j.P);
        tr.phase = 'shaft'; tr.t = 0;
        // the stack of floors for the cut-away: every floor so far (the sky one left out), and for a fall the floor you land on
        R.stack = (G.run.path14 || []).map((L, i) => L && Object.assign({ i14: i }, L)).filter((L) => L && L.set !== SET && L.i14 <= R.from);
        next14(this);
        if (!up) R.stack.push(Object.assign({ i14: G.levelIdx }, G.run.path14[G.levelIdx]));
        R.n = R.stack.length;
        safe(() => (up ? Sfx.whoosh10() : Sfx.descend()));
      }
    } else if (tr.phase === 'shaft') {
      if (tr.t >= T0.shaft) {
        tr.phase = 'in'; tr.t = 0;
        R.land = players14().map((Q, k) => ({ P: Q, d: k * 0.08, hit: false }));
        if (up) safe(() => { const P = G.player; if (G.room) G.room.ladderTop14 = { x: P.x, y: P.y + 2 }; Sfx.tone(520, 0.4, { to: 880, vol: 0.06, type: 'sine', verb: true }); });
      }
    } else {
      let shook = false;
      for (const l of R.land) {
        const P = l.P, s = tr.t - l.d;
        if (up) {
          // out of the ladder hole, a hop onto the terrace
          const v = clamp01(s / 0.45);
          if (s < 0.45) { P.sink = 1 - smooth(v); P.hopH = 0; continue; }
          const w = clamp01((s - 0.45) / 0.4); P.sink = 0;
          P.hopH = Math.sin(Math.PI * w) * 14; P.squash = w < 1 ? -0.3 * Math.sin(Math.PI * w) : 0;
          if (w >= 1 && !l.hit) { l.hit = true; P.squash = 0.4; if (!shook) { shook = true; safe(() => Sfx.thud()); } }
        } else {
          const v = clamp01(s / 0.45);
          if (s < 0.45) { P.hopH = 110 * (1 - v * v); P.squash = -0.35 * v; continue; }
          const w = clamp01((s - 0.45) / 0.35);
          if (!l.hit) { l.hit = true; if (!shook) { shook = true; G.shake = Math.max(G.shake, 6); safe(() => Sfx.thud()); } }
          P.hopH = Math.abs(Math.sin(w * Math.PI)) * 3 * (1 - w);
          P.squash = 0.9 * (1 - w) * Math.cos(w * Math.PI * 1.5);
        }
      }
      if (tr.t >= T0.in) { for (const l of R.land) calm(l.P); G.trans = null; G.fade = 0; }
    }
    updateParticles(dt);
  };

  /* ================================================================ drawing the exits in the room */
  const toScreen = (x, y) => [View.ox + (WALL + x) * View.s, View.oy + (WALL + y) * View.s];
  function ladder(c, x0, y0, x1, y1, w0, w1, n, rail = '#7a4a1a', rung = '#c89a4a', a = 1) {
    c.save(); c.globalAlpha *= a; c.lineCap = 'round';
    const L = (u) => [lerp(x0, x1, u), lerp(y0, y1, u), lerp(w0, w1, u)];
    for (const pass of [0, 1]) {
      c.strokeStyle = pass ? rung : '#2a1406';
      for (let i = 1; i < n; i++) {
        const [x, y, w] = L(i / n);
        c.lineWidth = (pass ? 2.2 : 3.6) * (0.6 + w / Math.max(w0, w1) * 0.6);
        c.beginPath(); c.moveTo(x - w, y); c.lineTo(x + w, y); c.stroke();
      }
      c.strokeStyle = pass ? rail : '#2a1406';
      for (const s of [-1, 1]) {
        c.lineWidth = pass ? 3.4 : 5.4;
        c.beginPath(); c.moveTo(x0 + s * w0, y0); c.lineTo(x1 + s * w1, y1); c.stroke();
      }
    }
    c.restore();
  }
  const de0 = drawExit;
  drawExit = function (c, ex, L, t) {
    if (!ex.ladder14 && !ex.sky14) return de0.apply(this, arguments);
    const a = smooth(Math.min(1, ex.t / 0.9));
    if (a <= 0) return;
    safe(() => {
      if (ex.ladder14) {
        // daylight from a hatch high up, and the ladder coming down into it
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(ex.x, ex.y - 220, ex.x, ex.y + 20);
        g.addColorStop(0, `rgba(200,230,255,${(0.5 * a).toFixed(3)})`); g.addColorStop(1, `rgba(255,236,190,${(0.12 * a).toFixed(3)})`);
        c.fillStyle = g;
        c.beginPath(); c.moveTo(ex.x - 26, ex.y - 230); c.lineTo(ex.x + 26, ex.y - 230); c.lineTo(ex.x + 46, ex.y + 16); c.lineTo(ex.x - 46, ex.y + 16); c.closePath(); c.fill();
        c.restore();
        c.fillStyle = `rgba(255,244,214,${(0.3 * a).toFixed(3)})`; ell(c, ex.x, ex.y + 4, 40, 15); c.fill();
        // the ladder drops in from above
        const drop = (1 - a) * 140;
        c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, ex.x, ex.y + 10, 22 * a, 6 * a); c.fill();
        ladder(c, ex.x, ex.y + 6 - drop, ex.x, ex.y - 240 - drop, 11, 20, 12);
        // a few petals and a cloud wisp blow down from the sky
        for (let i = 0; i < 8; i++) {
          const ph = (t * 0.35 + i / 8) % 1, x = ex.x + Math.sin(t * 1.3 + i * 2) * 26, y = ex.y - 200 + ph * 210;
          c.fillStyle = i % 2 ? `rgba(255,190,210,${(0.8 * (1 - ph) * a).toFixed(3)})` : `rgba(255,255,255,${(0.7 * (1 - ph) * a).toFixed(3)})`;
          ell(c, x, y, 2.4, 1.2, t * 3 + i); c.fill();
        }
      } else {
        // a tear in the terrace: clouds round the rim, sky far below, and the floors of the run as tiny rings at the bottom
        c.save(); c.translate(ex.x, ex.y); c.scale(a, a);
        c.fillStyle = '#8a7a5a'; ell(c, 0, 3, 38, 28); c.fill();
        const g = c.createRadialGradient(0, 0, 2, 0, 0, 32);
        g.addColorStop(0, '#2a3a7a'); g.addColorStop(0.6, '#6a9ad8'); g.addColorStop(1, '#bfe0ff');
        c.fillStyle = g; ell(c, 0, 0, 33, 24); c.fill();
        c.save(); ell(c, 0, 0, 33, 24); c.clip();
        const path = (G.run && G.run.path14) || [];
        let k = 0;
        for (let i = path.length - 1; i >= 0; i--) { const P0 = path[i]; if (!P0 || P0.set === SET) continue; const s = 0.55 - k * 0.12; if (s <= 0.08) break; c.strokeStyle = P0.wall || '#444'; c.lineWidth = 2.2; c.strokeRect(-26 * s, -18 * s, 52 * s, 36 * s); k++; }
        for (let i = 0; i < 5; i++) { const ph = (t * 0.25 + i / 5) % 1, an = i * 2.3 + t * 0.2; D().puff(c, Math.cos(an) * 26 * (1 - ph), Math.sin(an) * 18 * (1 - ph), 5 * (1 - ph * 0.6), 0.75 * (1 - ph)); }
        c.restore();
        for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; D().puff(c, Math.cos(an) * 34, Math.sin(an) * 25, 7 + (i % 3) * 2, 0.95); }
        c.restore();
      }
    });
  };
  // where you came up: the top of the ladder pokes out of a cloud in the start room
  const ft0 = drawFloorThings;
  drawFloorThings = function (c, room, t) {
    ft0.apply(this, arguments);
    const L = room.ladderTop14;
    if (!L || G.levelDef.set !== SET) return;
    safe(() => {
      c.fillStyle = 'rgba(40,50,90,0.25)'; ell(c, L.x + 2, L.y + 6, 24, 12); c.fill();
      c.fillStyle = '#3a4a7a'; ell(c, L.x, L.y + 2, 18, 10); c.fill();
      c.fillStyle = '#9ac8f0'; ell(c, L.x, L.y + 2, 15, 8); c.fill();
      ladder(c, L.x, L.y + 6, L.x, L.y - 14, 9, 10, 3);
      for (let i = 0; i < 9; i++) { const an = i / 9 * TAU; D().puff(c, L.x + Math.cos(an) * 19, L.y + 2 + Math.sin(an) * 11, 5.5 + (i % 2) * 2, 0.95); }
    });
  };

  /* ================================================================ the cut-away: every floor of the run in one tower */
  function stackGeo(W, H, n) {
    const FH = Math.max(150, Math.min(H * 0.36, 260)), SKY = FH * 2.2;
    // y of floor i's walking line, in tower units: the surface is at 0, floors go down, the sky goes up
    const floorY = (i) => (i + 1) * FH;
    return { FH, SKY, floorY, top: -SKY + FH * 0.42, bottom: floorY(n - 1) };
  }
  function drawSky(c, W, H, y0, t, geo) {
    // y0: tower y of the top of the screen. The sky fills tower y < 0.
    const g = c.createLinearGradient(0, -geo.SKY - y0, 0, -y0);
    g.addColorStop(0, '#5aa0f0'); g.addColorStop(0.7, '#a8d4ff'); g.addColorStop(1, '#ffe8c0');
    c.fillStyle = g; c.fillRect(0, 0, W, Math.max(0, -y0));
    // the sun
    glowDot(c, W * 0.78, -geo.SKY * 0.7 - y0, 120, '#fff2c0', 0.6);
    c.fillStyle = '#fff6d8'; circle(c, W * 0.78, -geo.SKY * 0.7 - y0, 26);
    // cloud layers, the far ones move slower
    for (let L = 0; L < 3; L++) {
      const yy = -geo.SKY * (0.25 + L * 0.22) - y0, sp = 10 + L * 14;
      for (let i = 0; i < 7; i++) {
        const x = ((hash(L * 7 + i) * (W + 300) + t * sp) % (W + 300)) - 150;
        D().cloudBank(c, x, yy + hash(L * 3 + i * 1.7) * 60, 90 + L * 30, () => hash(i * 9.1 + L), 0.85 - L * 0.15, 1.3 + L * 0.4);
      }
    }
    // dragons fly between the clouds
    for (let i = 0; i < 3; i++) {
      const per = 7 + i * 2, u = ((t + i * 2.3) % per) / per, x = -120 + u * (W + 240), y = -geo.SKY * (0.35 + i * 0.18) - y0 + Math.sin(t * 1.5 + i) * 12;
      D().dragonShadow(c, i % 2 ? W - x : x, y, i % 2 ? Math.PI : 0, 0.35 + i * 0.08, t + i, 0.45);
    }
  }
  function drawEarth(c, W, H, y0, geo) {
    const top = Math.max(0, -y0);
    if (top >= H) return;
    const g = c.createLinearGradient(0, -y0, 0, geo.bottom + geo.FH - y0);
    g.addColorStop(0, '#6a4a2a'); g.addColorStop(0.5, '#3a2818'); g.addColorStop(1, '#140c08');
    c.fillStyle = g; c.fillRect(0, top, W, H - top);
    // stones and roots in the soil
    for (let i = 0; i < 70; i++) {
      const x = hash(i * 3.1) * W, y = hash(i * 5.7) * (geo.bottom + geo.FH) - y0;
      if (y < -10 || y > H + 10) continue;
      c.fillStyle = `rgba(${i % 3 ? '20,12,8' : '140,110,80'},${(0.25 + hash(i) * 0.3).toFixed(3)})`; ell(c, x, y, 3 + hash(i * 2) * 8, 2 + hash(i * 4) * 4, hash(i * 6) * 3); c.fill();
    }
    c.strokeStyle = 'rgba(30,20,10,0.6)'; c.lineWidth = 2;
    for (let i = 0; i < 10; i++) { const x = hash(i * 8.8) * W, y = 10 + hash(i * 1.3) * 60 - y0; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 20, y + 30, x - 20, y + 60, x + 10, y + 90); c.stroke(); }
    // the surface: grass and a stone hatch where the ladder comes out
    if (-y0 > -40 && -y0 < H + 40) {
      c.fillStyle = '#4a8a3a'; c.fillRect(0, -y0 - 8, W, 14);
      c.fillStyle = '#6ab84a'; for (let x = 0; x < W; x += 6) { c.beginPath(); c.moveTo(x, -y0 - 6); c.lineTo(x + 3, -y0 - 14 - hash(x) * 6); c.lineTo(x + 6, -y0 - 6); c.fill(); }
      c.fillStyle = '#2a4a24';
      for (let i = 0; i < 6; i++) { const x = hash(i * 4.4) * W; if (Math.abs(x - W / 2) < 80) continue; ell(c, x, -y0 - 26, 22, 28); c.fill(); c.fillRect(x - 2, -y0 - 8, 4, 8); }
    }
  }
  function drawFloorSlice(c, W, y, L, idx, FH, hole) {
    // y: screen y of the floor's walking line. The room is a box above it; under it a slab of rock.
    const x0 = W * 0.07, x1 = W * 0.93, rh = FH * 0.62, top = y - rh;
    c.fillStyle = L.void || '#000'; c.fillRect(x0, top, x1 - x0, rh);
    // the back wall in the floor's own colours
    c.fillStyle = L.wall || '#333'; c.fillRect(x0, top, x1 - x0, rh * 0.78);
    c.strokeStyle = L.wallLo || '#111'; c.lineWidth = 1.2;
    for (let r = 0; r < 5; r++) {
      const yy = top + r * rh * 0.156;
      c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke();
      for (let x = x0 + (r % 2 ? 14 : 0); x < x1; x += 28) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x, yy + rh * 0.156); c.stroke(); }
    }
    c.fillStyle = L.wallHi || '#555'; c.fillRect(x0, top + rh * 0.74, x1 - x0, 3);
    // torches in the floor's deco colour
    for (const fx0 of [0.25, 0.75]) { const tx = lerp(x0, x1, fx0), ty = top + rh * 0.4; glowDot(c, tx, ty, 46, L.deco || '#ffb060', 0.35); c.fillStyle = '#2a1a10'; c.fillRect(tx - 2, ty, 4, 10); c.fillStyle = '#ffcf6a'; ell(c, tx, ty - 3, 3, 5); c.fill(); }
    // the floor in perspective: a strip of tiles
    const fh = FH * 0.12;
    c.fillStyle = L.floor || '#666'; c.fillRect(x0, y - fh, x1 - x0, fh);
    c.fillStyle = L.floor2 || L.floor || '#555';
    for (let x = x0; x < x1; x += 24) if (Math.floor(x / 24) % 2) c.fillRect(x, y - fh, 24, fh);
    c.strokeStyle = L.grout || '#222'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y - fh * 0.5); c.lineTo(x1, y - fh * 0.5); c.stroke();
    // shade, frame
    const sg = c.createLinearGradient(0, top, 0, y); sg.addColorStop(0, 'rgba(0,0,0,0.45)'); sg.addColorStop(0.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.25)');
    c.fillStyle = sg; c.fillRect(x0, top, x1 - x0, rh);
    c.strokeStyle = '#0a0604'; c.lineWidth = 3; c.strokeRect(x0, top, x1 - x0, rh);
    // the slab under it, with the hole the ladder goes through
    c.fillStyle = L.rock ? mixHex(L.rock, '#000000', 0.55) : '#1a1410'; c.fillRect(x0 - 6, y, x1 - x0 + 12, FH * 0.08);
    c.fillStyle = '#060404'; ell(c, W / 2, y + FH * 0.04, hole, FH * 0.035); c.fill();
    c.fillStyle = '#060404'; ell(c, W / 2, top - 2, hole, FH * 0.03); c.fill();
    // the plaque: floor number and name
    c.save();
    c.font = `800 ${Math.round(FH * 0.085)}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textBaseline = 'middle'; c.textAlign = 'left';
    const label = `${(L.i14 != null ? L.i14 : idx) + 1}  ${String(L.name || '').toUpperCase()}`, tw = c.measureText(label).width;
    c.fillStyle = 'rgba(10,6,4,0.75)'; rrect(c, x0 + 10, top + 8, tw + 18, FH * 0.12, 4); c.fill();
    c.fillStyle = L.deco || '#ffe0a0'; c.fillText(label, x0 + 19, top + 8 + FH * 0.06);
    c.restore();
  }
  function drawTerrace(c, W, y) {
    // the underside of the sky terrace: a floating rock with the red balustrade on top
    c.fillStyle = '#6a5a4a';
    c.beginPath(); c.moveTo(W * 0.18, y); c.lineTo(W * 0.82, y); c.lineTo(W * 0.66, y + 60); c.lineTo(W * 0.56, y + 110); c.lineTo(W * 0.5, y + 150); c.lineTo(W * 0.42, y + 90); c.lineTo(W * 0.3, y + 50); c.closePath(); c.fill();
    c.fillStyle = '#4a3a2e'; c.beginPath(); c.moveTo(W * 0.5, y); c.lineTo(W * 0.82, y); c.lineTo(W * 0.66, y + 60); c.lineTo(W * 0.5, y + 150); c.closePath(); c.fill();
    c.fillStyle = '#e8dec8'; c.fillRect(W * 0.18, y - 8, W * 0.64, 10);
    c.fillStyle = '#b3262a'; c.fillRect(W * 0.18, y - 26, W * 0.64, 4); c.fillStyle = '#f2cf5a'; c.fillRect(W * 0.18, y - 27, W * 0.64, 1.5);
    for (let x = W * 0.18; x <= W * 0.82; x += 26) { c.fillStyle = '#7a0c10'; c.fillRect(x - 2, y - 26, 4, 18); }
    for (const s of [0.2, 0.8]) { D().lantern(c, W * s, y - 40, 7, '#e8402e'); glowDot(c, W * s, y - 40, 30, '#ffcf6a', 0.4); }
    for (let i = 0; i < 10; i++) D().puff(c, W * (0.15 + i * 0.075), y + 6 + Math.sin(i * 2) * 6, 14 + (i % 3) * 5, 0.9);
  }
  function drawApples(c, x, y, s, rot, t, climb) {
    const all = players14();
    all.forEach((Q, k) => {
      const off = all.length > 1 ? (k - (all.length - 1) / 2) * 26 * s : 0;
      const h0 = Q.hopH, s0 = Q.sink, q0 = Q.squash, cp = Q.capy, wm = Q.worm, hl = Q.halo;
      Q.hopH = 0; Q.sink = 0; Q.capy = null; Q.worm = null; Q.halo = null; Q.squash = climb ? 0.12 * Math.sin(t * 22 + k) : 0;
      c.save();
      c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      c.translate(x + off, y + (climb ? Math.abs(Math.sin(t * 11 + k)) * 3 : 0)); c.rotate(rot + (climb ? Math.sin(t * 11 + k) * 0.08 : k * 0.7));
      c.scale(s, s); c.translate(-Q.x, -Q.y);
      safe(() => withPlayer(Q, () => drawPlayer(c)));
      c.restore();
      Q.hopH = h0; Q.sink = s0; Q.squash = q0; Q.capy = cp; Q.worm = wm; Q.halo = hl;
    });
  }
  function drawTower(c, tr) {
    const R = tr.r14, up = tr.kind === 'climb14', W = View.W, H = View.H, t = G.t;
    const n = Math.max(1, R.n || 1), geo = stackGeo(W, H, n);
    const T0 = up ? CLIMB : FALL, u = clamp01(tr.t / T0.shaft), e = ease(u);
    // the camera: from the floor you left up into the sky, or from the sky down to the floor you land on
    const yLow = geo.floorY(up ? n - 1 : n - 1) - geo.FH * 0.3, yHigh = geo.top;
    const cam = up ? lerp(yLow, yHigh, e) : lerp(yHigh, yLow, e);
    const y0 = cam - H / 2;
    c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    drawEarth(c, W, H, y0, geo);
    if (y0 < 0) drawSky(c, W, H, y0, t, geo);
    for (let i = 0; i < n; i++) { const y = geo.floorY(i) - y0; if (y < -geo.FH || y > H + geo.FH) continue; drawFloorSlice(c, W, y, R.stack[i] || {}, i, geo.FH, up ? 26 : 30); }
    drawTerrace(c, W, geo.top - geo.FH * 0.05 - y0 - 40);
    if (up) {
      // one long ladder from the floor you left to the terrace
      const yb = geo.floorY(n - 1) - y0, yt = geo.top - y0 - 40;
      ladder(c, W / 2, yb, W / 2, yt, 17, 17, Math.max(8, Math.round((yb - yt) / 22)), '#8a5a2a', '#d8aa5a');
      drawApples(c, W / 2, H / 2 + 6, Math.min(2.4, geo.FH / 90), 0, t, true);
    } else {
      // speed lines, and the apples tumbling down
      const sp = Math.sin(Math.PI * u);
      c.strokeStyle = `rgba(255,255,255,${(0.35 * sp).toFixed(3)})`; c.lineWidth = 2;
      for (let i = 0; i < 26; i++) { const x = hash(i * 2.2) * W, y = ((hash(i * 7.3) * H) - t * 1600) % H; const yy = y < 0 ? y + H : y; c.beginPath(); c.moveTo(x, yy); c.lineTo(x, yy + 40 + 60 * sp); c.stroke(); }
      drawApples(c, W / 2, H / 2, Math.min(2.4, geo.FH / 90), t * 7, t, false);
    }
    // the words at the bottom
    c.font = `800 ${Math.round(Math.max(18, H * 0.035))}px "Barlow Condensed", "Arial Narrow", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const txt = up ? 'OMHOOG NAAR DE DRAKENHEMEL' : `TERUG NAAR BENEDEN: ${String((R.stack[n - 1] || {}).name || '').toUpperCase()}`;
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillText(txt, W / 2 + 2, H * 0.9 + 2);
    c.fillStyle = '#fff2d0'; c.fillText(txt, W / 2, H * 0.9);
    // a vignette, and a quick fade at both ends of the cut
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    const f = Math.max(1 - tr.t / 0.22, (tr.t - (T0.shaft - 0.22)) / 0.22);
    if (f > 0) { c.fillStyle = up && tr.t > T0.shaft / 2 ? `rgba(255,255,255,${clamp01(f).toFixed(3)})` : `rgba(0,0,0,${clamp01(f).toFixed(3)})`; c.fillRect(0, 0, W, H); }
    c.restore();
  }
  const rr0 = renderRoom;
  renderRoom = function (c, L) {
    rr0.apply(this, arguments);
    const tr = G.trans;
    if (!tr || !tr.r14) return;
    safe(() => {
      const W = View.W, H = View.H, up = tr.kind === 'climb14', T0 = up ? CLIMB : FALL;
      if (tr.phase === 'shaft') { drawTower(c, tr); return; }
      c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      if (tr.phase === 'out') {
        // the last moment in the room: light from above (up) or the dark of the hole (down) takes over
        const k = clamp01((tr.t - (T0.out - 0.35)) / 0.35);
        if (k > 0) { c.fillStyle = up ? `rgba(255,250,235,${k.toFixed(3)})` : `rgba(0,0,0,${k.toFixed(3)})`; c.fillRect(0, 0, W, H); }
      } else {
        // arriving: white of the sky (up) or the dark of the fall (down) clears
        const k = 1 - clamp01(tr.t / 0.4);
        if (k > 0) { c.fillStyle = up ? `rgba(255,255,255,${k.toFixed(3)})` : `rgba(0,0,0,${k.toFixed(3)})`; c.fillRect(0, 0, W, H); }
      }
      c.restore();
    });
    void toScreen;
  };
  Object.assign(window.__bitten.DRAAK14 || (window.__bitten.DRAAK14 = {}), { CLIMB, FALL, drawTower, ladder });
})();
