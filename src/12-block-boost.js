/* src/12-block-boost.js: Block Worm, Boost Worm and its ball, Seed Storm. From v6 to v7. Lines 7165 to 7423 of the v13.7 script. */
/* =====================================================================
   The Block Worm (falling tetromino blocks), the Boost Worm (a ball),
   seed storm strikes and floating text
   ===================================================================== */
function floatText(x, y, text, col, big) {
  text = say9(text);
  if (text === '') return;
  if (!big && Save.data.settings && Save.data.settings.numbers === false) return;
  addP({ kind: 'text', x, y, vx: 0, vy: big ? -26 : -34, r: big ? 1.5 : 1, life: big ? 1.3 : 0.9, col: col || '#ffe2a4', text, drag: 1.4 });
}

/* ------------------------------------------------------------------ Block Worm */
function rotCells(cells, k) {
  let out = cells.map(([x, y]) => [x, y]);
  for (let i = 0; i < k; i++) out = out.map(([x, y]) => [-y, x]);
  const mx = Math.min(...out.map((p) => p[0])), my = Math.min(...out.map((p) => p[1]));
  return out.map(([x, y]) => [x - mx, y - my]);
}
function blockCount(room) { let n = 0; for (const o of room.obs) if (o.type === 'block') n++; return n; }
function planPiece(room, P, sn) {
  if (blockCount(room) > 14) return null;
  const pc = clamp(Math.floor(P.x / T), 0, COLS - 1), pr = clamp(Math.floor(P.y / T), 0, ROWS - 1);
  const ok = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !room.solid(c, r) && !isDoorZone(r, c);
  for (let tries = 0; tries < 40; tries++) {
    const key = pick(TETRO_ORDER);
    const shape = rotCells(TETROS[key], Math.floor(Math.random() * 4));
    const anchor = pick(shape);
    // most drops land on the apple, some just next to it
    const tc = tries < 26 ? pc : pc + Math.floor(rnd(-2, 3)), tr = tries < 26 ? pr : pr + Math.floor(rnd(-2, 3));
    const cells = shape.map(([x, y]) => [tc - anchor[0] + x, tr - anchor[1] + y]);
    if (!cells.every(([c, r]) => ok(c, r))) continue;
    const hc = Math.floor(sn.x / T), hr = Math.floor(sn.y / T);
    if (cells.some(([c, r]) => c === hc && r === hr)) continue;
    return { key, cells, col: TETRO_COL[key], t: 0 };
  }
  return null;
}
function slamPiece(room, sn, g) {
  const P = G.player;
  let hitP = false;
  for (const [c, r] of g.cells) {
    if (room.solid(c, r)) continue;
    const o = { type: 'block', solid: true, shots: true, hp: 3, max: 3, breakable: true, col: g.col, ttl: rnd(7, 8.5), owner: sn, c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, shake: 0.25, seed: Math.random(), wob: 0, born: 0 };
    room.tiles[r][c] = o; room.obs.push(o);
    burst(o.x, o.y + 14, 5, G.levelDef.dirt, { min: 30, max: 90, lmin: 0.25, lmax: 0.5 });
    if (P.dying <= 0 && Math.abs(P.x - o.x) < T / 2 + P.r - 4 && Math.abs(P.y - o.y) < T / 2 + P.r - 4) hitP = true;
  }
  room.ver++;
  G.shake = Math.max(G.shake, 6);
  Sfx.slam();
  if (hitP) {
    P.hurt(1, P.x, P.y - 20);
    const f = nearestFreeCell(room, P.x, P.y);
    P.x = f.x; P.y = f.y;
  }
  mpRest14((Q) => { if (!freeAt(room, Q.x, Q.y, Q.r * 0.6)) { Q.hurt(1, Q.x, Q.y - 20); const f = nearestFreeCell(room, Q.x, Q.y); Q.x = f.x; Q.y = f.y; } });   /* M3: the others too */
  // a full row of blocks clears like the old game and hurts the worm
  for (let r = 0; r < ROWS; r++) {
    let full = true;
    for (let c = 0; c < COLS; c++) { const o = room.tiles[r][c]; if (!o || !o.solid) { full = false; break; } }
    if (!full) continue;
    for (let c = 0; c < COLS; c++) { const o = room.tiles[r][c]; if (o && o.type === 'block') crumbleBlock(room, o, c * 0.03); }
    if (sn.alive) sn.hurt(6, sn.x, sn.y);
    floatText(RW / 2, (r + 0.5) * T, 'LINE CLEAR', '#ffe24a', true);
  }
}
function crumbleBlock(room, o, delay) {
  if (o.dead) return;
  if (delay) { o.ttl = Math.min(o.ttl, delay); return; }
  o.dead = true;
  room.removeObstacle(o);
  burst(o.x, o.y, 9, o.col, { kind: 'shard', min: 40, max: 140, rmin: 1.6, rmax: 3.4, lmin: 0.35, lmax: 0.7, drag: 4 });
  burst(o.x, o.y, 4, '#ffffff', { min: 20, max: 60, lmin: 0.2, lmax: 0.4 });
}
function updateBlocks(dt, room) {
  for (let i = room.obs.length - 1; i >= 0; i--) {
    const o = room.obs[i];
    if (o.type !== 'block') continue;
    o.born += dt; o.ttl -= dt;
    if (o.ttl <= 0) { crumbleBlock(room, o); if (Math.random() < 0.5) Sfx.breakUrn(); }
  }
}

AI.tetra = function (sn, room, dt) {
  const P = G.player;
  gridMove(sn, room, (sn.K.cells - (sn.ghost ? 0.9 : 0)) * T, dt);
  sn.dropCd -= dt;
  if (!sn.ghost && sn.dropCd <= 0 && P.dying <= 0) {
    sn.ghost = planPiece(room, P, sn);
    sn.dropCd = rnd(4, 5.2) * ((G.levelDef.tier || 0) >= 2 ? 0.85 : 1);
    if (sn.ghost) { Sfx.blockWarn(); sn.mouth = 1; }
  }
  if (sn.ghost) {
    sn.ghost.t += dt;
    if (sn.ghost.t >= 0.95) { slamPiece(room, sn, sn.ghost); sn.ghost = null; }
  }
};

/* ------------------------------------------------------------------ Boost Worm and its ball */
function spawnBall(room) {
  const f = nearestFreeCell(room, RW / 2, RH / 2);
  const b = { x: f.x, y: f.y, vx: 0, vy: 0, r: 15, rot: 0, last: null, t: 0, hitCd: 0, hide: 0 };
  room.balls.push(b);
  return b;
}
function ballGoal(room, b, sn) {
  sn.hurt(6, b.x, b.y);
  if (sn.alive && sn.dying <= 0) { sn.mode = 'stun'; sn.mt = 0; }
  Meta.add('goals');
  floatText(b.x, b.y - 24, 'GOAL!', '#7cc4ff', true);
  G.shake = Math.max(G.shake, 9);
  Sfx.goal();
  flashLight(b.x, b.y, 150, 1, 0.8);
  for (const col of ['#3a9bff', '#9fd2ff', '#ffffff']) burst(b.x, b.y, 14, col, { min: 60, max: 260, rmin: 1.4, rmax: 3, lmin: 0.5, lmax: 1, glow: true });
  b.hide = 1.1; b.vx = 0; b.vy = 0; b.last = null;
  if (Math.random() < 0.6) setTimeout(() => Story.chat('goal', true), 600);
}
function popBall(room, b) {
  for (const col of ['#ff8a2a', '#ffd36a', '#ffffff']) burst(b.x, b.y, 12, col, { min: 50, max: 200, rmin: 1.2, rmax: 2.8, lmin: 0.4, lmax: 0.9, glow: true });
  flashLight(b.x, b.y, 110, 0.8, 0.6);
  Sfx.breakEgg();
  room.balls.splice(room.balls.indexOf(b), 1);
}
function updateBalls(dt, room) {
  const P = G.player;
  for (let i = room.balls.length - 1; i >= 0; i--) {
    const b = room.balls[i];
    b.t += dt; b.hitCd = Math.max(0, b.hitCd - dt);
    if (b.hide > 0) {
      b.hide -= dt;
      if (b.hide <= 0) { const f = nearestFreeCell(room, RW / 2, RH / 2); b.x = f.x; b.y = f.y; b.vx = 0; b.vy = 0; flashLight(b.x, b.y, 80, 0.6, 0.5); }
      continue;
    }
    const drag = Math.max(0, 1 - 0.5 * dt);
    b.vx *= drag; b.vy *= drag;
    let sp = Math.hypot(b.vx, b.vy);
    if (sp > 520) { b.vx *= 520 / sp; b.vy *= 520 / sp; sp = 520; }
    let nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
    const e = 0.82;
    if (nx < b.r) { nx = b.r; b.vx = Math.abs(b.vx) * e; }
    if (nx > RW - b.r) { nx = RW - b.r; b.vx = -Math.abs(b.vx) * e; }
    if (ny < b.r) { ny = b.r; b.vy = Math.abs(b.vy) * e; }
    if (ny > RH - b.r) { ny = RH - b.r; b.vy = -Math.abs(b.vy) * e; }
    const [rx, ry] = resolveTiles(room, nx, ny, b.r);
    const px = rx - nx, py = ry - ny, pd = Math.hypot(px, py);
    if (pd > 0.01) {
      const ux = px / pd, uy = py / pd, dot = b.vx * ux + b.vy * uy;
      if (dot < 0) { b.vx -= (1 + e) * dot * ux; b.vy -= (1 + e) * dot * uy; }
      if (sp > 120) Sfx.ballBounce();
    }
    b.x = rx; b.y = ry;
    b.rot += (sp / b.r) * dt * (b.vx >= 0 ? 1 : -1);
    // snakes: the Boost Worm hits it hard, others just bump it
    for (const sn of room.snakes) {
      if (!sn.alive || sn.state !== 'active' || sn.burrowed || sn.dying > 0) continue;
      const rr = sn.headR + b.r, d2 = dist2(b.x, b.y, sn.x, sn.y);
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || 1, ux = (b.x - sn.x) / d, uy = (b.y - sn.y) / d;
        b.x = sn.x + ux * rr; b.y = sn.y + uy * rr;
        if (b.last === 'player' && sp > 130 && sn.kind === 'rocket') { ballGoal(room, b, sn); break; }
        if (sn.kind === 'rocket') {
          const f = sn.mode === 'boost' ? 440 : 230;
          const hx = ux + Math.cos(sn.ang) * 1.2, hy = uy + Math.sin(sn.ang) * 1.2, hl = Math.hypot(hx, hy) || 1;
          b.vx = (hx / hl) * f; b.vy = (hy / hl) * f; b.last = 'worm';
          if (b.hitCd <= 0) { Sfx.ballHit(); b.hitCd = 0.15; burst(b.x, b.y, 6, '#ff8a2a', { min: 30, max: 120, lmin: 0.2, lmax: 0.4, glow: true }); }
        } else { const dot = b.vx * ux + b.vy * uy; if (dot < 60) { b.vx += ux * (90 - dot); b.vy += uy * (90 - dot); } }
      } else if (b.last === 'player' && sp > 130 && sn.kind === 'rocket' && sn.hitTest(b.x, b.y, b.r * 0.8)) { ballGoal(room, b, sn); break; }
    }
    if (b.hide > 0) continue;
    // the apple dribbles it, or gets smacked by it
    if (P.dying <= 0 && P.escaping <= 0) {
      const rr = P.r + b.r, d2 = dist2(b.x, b.y, P.x, P.y);
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) || 1, ux = (b.x - P.x) / d, uy = (b.y - P.y) / d;
        b.x = P.x + ux * rr; b.y = P.y + uy * rr;
        if (b.last === 'worm' && sp > 170) {
          P.hurt(1, b.x, b.y);
          b.vx = ux * sp * 0.5; b.vy = uy * sp * 0.5; b.last = null;
        } else {
          const ps = Math.hypot(P.vx, P.vy), f = Math.max(160, ps * 1.5);
          b.vx = ux * f + P.vx * 0.4; b.vy = uy * f + P.vy * 0.4; b.last = 'player';
          if (b.hitCd <= 0) { Sfx.ballHit(); b.hitCd = 0.2; }
        }
      }
    }
  }
}
// seeds push the ball
function seedHitsBall(room, s, sr) {
  for (const b of room.balls) {
    if (b.hide > 0) continue;
    if (dist2(s.x, s.y, b.x, b.y) < (b.r + sr) * (b.r + sr)) {
      const k = 0.42 * Math.min(2.2, s.size || 1);
      b.vx += s.vx * k; b.vy += s.vy * k; b.last = 'player';
      burst(s.x, s.y, 4, '#9fd2ff', { min: 20, max: 70, lmin: 0.2, lmax: 0.4, glow: true });
      if (b.hitCd <= 0) { Sfx.ballHit(); b.hitCd = 0.12; }
      return true;
    }
  }
  return false;
}

AI.rocket = function (sn, room, dt) {
  const P = G.player;
  let ball = room.balls[0];
  if (!ball && !sn.ballMade) { ball = spawnBall(room); sn.ballMade = true; }
  sn.mt += dt; sn.boostCd -= dt; sn.demoCd -= dt;
  const flame = (n) => {
    const tail = sn.pts[sn.pts.length - 1] || sn;
    for (let i = 0; i < n; i++) addP({ kind: 'dot', x: tail.x + rnd(-3, 3), y: tail.y + rnd(-3, 3), vx: -Math.cos(sn.ang) * rnd(40, 120) + rnd(-20, 20), vy: -Math.sin(sn.ang) * rnd(40, 120) + rnd(-20, 20), r: rnd(1.5, 3.2), life: rnd(0.2, 0.4), col: Math.random() < 0.5 ? '#ff8a2a' : '#ffe08a', glow: true, drag: 2 });
  };
  if (sn.mode === 'stun') {
    sn.drawAng += dt * 14; sn.mouth = 1;
    if (sn.mt > 0.9) { sn.mode = 'drive'; sn.mt = 0; sn.boostCd = rnd(0.8, 1.6); }
    return;
  }
  if (sn.mode === 'boost') {
    const tgt = sn.boostTgt === 'ball' && ball && ball.hide <= 0 ? ball : P;
    steerMove(sn, room, Math.atan2(tgt.y - sn.y, tgt.x - sn.x), 285, 2.1, dt);
    flame(2); sn.mouth = 1;
    if (sn.mt > (sn.boostTgt === 'ball' ? 0.95 : 0.8)) { sn.mode = 'drive'; sn.mt = 0; sn.boostCd = rnd(1.4, 2.4); }
    return;
  }
  let desired;
  if (ball && ball.hide <= 0 && P.dying <= 0) {
    // drive to the spot behind the ball, then boost through it at the apple
    const ax = P.x - ball.x, ay = P.y - ball.y, d = Math.hypot(ax, ay) || 1;
    const tx = clamp(ball.x - (ax / d) * 40, 14, RW - 14), ty = clamp(ball.y - (ay / d) * 40, 14, RH - 14);
    const toT = Math.atan2(ty - sn.y, tx - sn.x), dT = dist(sn.x, sn.y, tx, ty);
    desired = dT > 26 ? toT : Math.atan2(ball.y - sn.y, ball.x - sn.x);
    const toBall = Math.atan2(ball.y - sn.y, ball.x - sn.x), dB = dist(sn.x, sn.y, ball.x, ball.y);
    if (sn.boostCd <= 0 && dB < 200 && Math.abs(angDiff(toBall, Math.atan2(ay, ax))) < 0.45 && Math.abs(angDiff(sn.ang, toBall)) < 0.7) {
      sn.mode = 'boost'; sn.mt = 0; sn.boostTgt = 'ball'; Sfx.boost(); return;
    }
  } else desired = Math.atan2(P.y - sn.y, P.x - sn.x);
  if (sn.demoCd <= 0 && P.dying <= 0 && dist(sn.x, sn.y, P.x, P.y) < 260) {
    sn.mode = 'boost'; sn.mt = 0; sn.boostTgt = 'player'; sn.demoCd = rnd(5.5, 8); Sfx.boost(); return;
  }
  sn.wig += dt * 3;
  steerMove(sn, room, desired + Math.sin(sn.wig) * 0.12, sn.K.speed, sn.K.turn, dt);
  if (Math.random() < dt * 4) flame(1);
};

/* ------------------------------------------------------------------ Seed Storm */
function updateStrikes(dt, room) {
  const S = G.strikes;
  for (let i = S.length - 1; i >= 0; i--) {
    const s = S[i];
    s.t += dt;
    if (s.t >= 0.5) {
      for (const sn of room.snakes) if (sn.canBeHit() && sn.hitTest(s.x, s.y, 16)) sn.hurt(s.dmg, s.x, s.y);
      burst(s.x, s.y, 8, '#ffe2a4', { min: 30, max: 110, lmin: 0.25, lmax: 0.5, glow: true });
      addP({ kind: 'ring', x: s.x, y: s.y, vx: 0, vy: 0, r: 6, life: 0.3, col: '#ffe2a4', drag: 0 });
      flashLight(s.x, s.y, 50, 0.5, 0.3);
      Sfx.splat();
      S.splice(i, 1);
    }
  }
}

