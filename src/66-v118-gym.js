/* src/66-v118-gym.js: v11.8: Klokhuis Gym. From v11.8. Lines 31739 to 32407 of the v13.7 script. */
/* =====================================================================
   Bitten v11.8: Klokhuis Gym. Coach Larspel opens three of four stations:
   the treadmill (walk speed), the bench (seed damage), the bow lane
   (seed speed) and the protein bar machine (health). Amounts change every
   visit, one set per visit, gains stack additively and have caps.
   ===================================================================== */
(() => {
  const safe = (fn) => { try { return fn(); } catch (e) { if (window.console) console.warn('v11.8', e); return undefined; } };
  const LIME = '#b4f03c';
  // gains add up per run and stop at these caps (percent, and halves of an apple for health)
  const GYM_CAP = { speed: 30, dmg: 36, shot: 60, hp: 4 };
  const ST = {
    cardio: { name: 'Loopband', kind: 'Cardio', stat: 'speed', lo: 4, hi: 9, need: 1.8, tag: 'SPD',
      desc: (n) => `You walk ${n} percent faster, for good. Cardio. Nobody likes it.` },
    kracht: { name: 'Bankdrukken', kind: 'Krachttraining', stat: 'dmg', lo: 5, hi: 12, need: 1.8, tag: 'DMG',
      desc: (n) => `Seeds hit ${n} percent harder, for good. Push it.` },
    boog: { name: 'Handboog', kind: 'Boogschieten', stat: 'shot', lo: 10, hi: 22, need: 1.6, tag: 'SHOT',
      desc: (n) => `Seeds fly ${n} percent faster, for good. Aim is still your problem.` },
    eiwit: { name: 'Proteinereep', kind: 'Eiwit', stat: 'hp', lo: 1, hi: 2, need: 1.2, tag: 'HP',
      desc: (n) => `${n > 1 ? 'One apple' : 'Half an apple'} more health, for good. Tastes like chalk.` },
  };
  const ST_IDS = ['cardio', 'kracht', 'boog', 'eiwit'];
  // where everything stands: station pads, the coach, the furniture
  const POS = { cardio: [2, 2], kracht: [8, 2], boog: [2, 6], eiwit: [8, 6] };
  const LINES = {
    greet: ['Coach Larspel. Pick a station.', 'Welkom bij Klokhuis Gym. Pick one.', 'Pick one. I pick the weight.'],
    idle: ['Kom op.', 'No pain, no grain.', 'Leg day is every day.', 'Hydrate.', 'Core tight.', 'One set. Do it right.'],
    after: ['Stretch on the way out.', 'Same time next floor.', 'Drink water. Real water.'],
    cardio: ['Tempo omhoog.', 'Breathe through the nose.'],
    kracht: ['Nog eentje!', 'Push. Push.'],
    boog: ['Elbow up.', 'Breathe, then release.'],
    eiwit: ['Thirty grams. Chew.', 'Protein window. It is open.'],
    done: ['Lekker bezig.', 'Goed gedaan. Morgen spierpijn.', 'That is a set. The rest is closed.'],
    again: ['One set per visit. Rules are rules.', 'You trained. Go home.'],
    broken: ['That one is broken since 2014.', 'Ticket is open. Has been for years.'],
    max: ['You plateaued. Genetics.'],
  };
  const fmtGain = (k, n) => (k === 'eiwit' ? (n > 1 ? '+1 APPLE' : '+½ APPLE') : `+${n}% ${ST[k].tag}`);

  /* ------------------------------------------------------------------ the room itself */
  TPL.gym = ['...........', '...........', '...........', '...........', '...........', '...........', '...........', '...........', '...........'];
  Object.assign(INSET9, { coach11: 9, vend11: 5, target11: 9, locker11: 4, cooler11: 10, rack11: 5, tree11: 9 });
  SPECIAL9.gym = 1;
  NOBONES9.gym = 1;

  function put(room, type, c, r, extra) {
    const o = Object.assign({ type, solid: true, shots: true, c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, shake: 0, seed: Math.random(), wob: 0 }, extra || {});
    room.tiles[r][c] = o; room.obs.push(o);
    return o;
  }
  function setupGym(room) {
    room.sconces = [];
    room.tubes = [{ x: RW / 2, y: RH * 0.27, w: 170, ph: Math.random() * 10, broken: false }, { x: RW / 2, y: RH * 0.73, w: 170, ph: Math.random() * 10, broken: Math.random() < 0.35 }];
    const shut = pick(ST_IDS);
    const g = room.gym9 = { stations: [], used: null, say: null, sayCd: 3, arrows: [], stuck: [], greeted: false, pop: 0 };
    for (const k of ST_IDS) {
      const [c, r] = POS[k], S = ST[k];
      const amt = k === 'eiwit' ? (Math.random() < 0.7 ? 1 : 2) : rndi(S.lo, S.hi);
      g.stations.push({ k, c, r, x: (c + 0.5) * T, y: (r + 0.5) * T, amt, open: k !== shut, prog: 0, fire: 0, said: false, armed: true });
    }
    g.coach = put(room, 'coach11', 5, 4, { look: 0, talk: 0 });
    put(room, 'target11', 0, 6);
    put(room, 'vend11', 8, 7);
    put(room, 'locker11', 0, 0);
    put(room, 'cooler11', 10, 0);
    put(room, 'rack11', 10, 8);
    put(room, 'tree11', 0, 8);
    room.ver++;
    room.dirty = true;
  }
  const rb0 = Room.prototype.build;
  Room.prototype.build = function (tpl, def, opt) {
    rb0.call(this, tpl, def, opt);
    if (this.type === 'gym') setupGym(this); else this.gym9 = null;
  };

  /* ------------------------------------------------------------------ making a floor */
  const ex0 = extra9;
  extra9 = function (extra, set, tier, rng, def) {
    ex0(extra, set, tier, rng, def);
    if (def.rush || G.mode === 'story') return;
    if (rng() < 0.32) extra.push('gym');
  };
  CHAOS_ROOMS9.push('gym');

  /* ------------------------------------------------------------------ the apple's numbers: gym gains add up, then multiply in once */
  const ip0 = initPlayer9;
  initPlayer9 = function (P, C) { ip0(P, C); P.gym9 = { speed: 0, dmg: 0, shot: 0, hp: 0 }; };
  const rm0 = recalcMods;
  recalcMods = function (P) {
    rm0(P);
    const g = P && P.gym9;
    if (g && P.mods) { P.mods.speed *= 1 + g.speed / 100; P.mods.dmg *= 1 + g.dmg / 100; P.mods.shot *= 1 + g.shot / 100; }
  };

  /* ------------------------------------------------------------------ the coach talks */
  function say(room, key, force) {
    const g = room.gym9; if (!g) return;
    if (!force && g.say && g.say.t < 1.2) return;
    const arr = LINES[key] || LINES.idle;
    let txt = pick(arr);
    if (g.say && arr.length > 1) for (let i = 0; i < 4 && txt === g.say.txt; i++) txt = pick(arr);
    g.say = { txt, t: 0, life: 2.6 };
    g.sayCd = 6 + Math.random() * 4;
    if (g.coach) g.coach.talk = 0.9;
    Sfx.tone(520 + Math.random() * 80, 0.05, { type: 'square', vol: 0.02, lp: 1400 });
  }

  /* ------------------------------------------------------------------ sounds */
  Object.assign(Sfx, {
    whistle() { this.tone(2350, 0.18, { type: 'sine', vol: 0.06 }); this.tone(2480, 0.32, { type: 'sine', vol: 0.06, delay: 0.17 }); this.noise(0.4, { filter: 'bandpass', f: 2400, q: 6, vol: 0.03, delay: 0.05 }); },
    rep() { this.tone(880, 0.12, { type: 'triangle', to: 620, vol: 0.05 }); this.noise(0.05, { filter: 'highpass', f: 3800, vol: 0.05 }); },
    thwip() { this.noise(0.09, { filter: 'bandpass', f: 1800, fTo: 900, q: 1.4, vol: 0.06 }); },
    thunk() { this.tone(180, 0.1, { to: 110, vol: 0.12 }); this.noise(0.06, { filter: 'bandpass', f: 700, q: 2, vol: 0.08 }); },
    vend() { this.tone(140, 0.25, { to: 90, vol: 0.12, type: 'sawtooth', lp: 500 }); this.noise(0.2, { f: 500, vol: 0.08, delay: 0.18 }); },
  });

  /* ------------------------------------------------------------------ training */
  function gain(P, k, amt) {
    const S = ST[k], g = P.gym9 || (P.gym9 = { speed: 0, dmg: 0, shot: 0, hp: 0 });
    const room9 = Math.max(0, GYM_CAP[S.stat] - g[S.stat]);
    let n = Math.min(amt, room9);
    if (k === 'eiwit') n = Math.min(n, Math.max(0, 16 - P.maxHp));
    if (n <= 0) return 0;
    g[S.stat] += n;
    if (k === 'eiwit') { P.maxHp = Math.min(16, P.maxHp + n); P.heal(n); }
    recalcMods(P);
    return n;
  }
  function capped(P, k) {
    const g = P && P.gym9; if (!g) return false;
    if (k === 'eiwit' && P.maxHp >= 16) return true;
    return g[ST[k].stat] >= GYM_CAP[ST[k].stat];
  }
  function finish(room, s) {
    const P = G.player, g = room.gym9;
    const n = gain(P, s.k, s.amt);
    g.used = s.k;
    Meta.add('workouts');
    Sfx.whistle();
    if (!n) { UI.banner('Plateau', 'That number is maxed for this run. The coach saw it coming.'); say(room, 'max', true); return; }
    const S = ST[s.k];
    UI.banner(`${S.kind}: ${fmtGain(s.k, n).replace('+½ APPLE', 'half an apple').replace('+1 APPLE', 'one apple')}`, S.desc(n), 'clean');
    floatText(P.x, P.y - 34, fmtGain(s.k, n), LIME, true);
    burst(P.x, P.y, 14, LIME, { min: 30, max: 110, lmin: 0.4, lmax: 0.8, glow: true });
    say(room, 'done', true);
  }
  function updateGym(dt, room) {
    const g = room.gym9, P = G.player;
    if (!g || !P) return;
    if (g.say) { g.say.t += dt; if (g.say.t > g.say.life) g.say = null; }
    if (g.coach) {
      g.coach.talk = Math.max(0, g.coach.talk - dt);
      g.coach.look = Math.atan2(P.y - g.coach.y, P.x - g.coach.x);
    }
    if (!g.greeted) { g.greeted = true; say(room, 'greet', true); }
    g.sayCd -= dt;
    if (g.sayCd <= 0 && P.dying <= 0 && dist(P.x, P.y, g.coach.x, g.coach.y) < 150) say(room, g.used ? 'after' : 'idle');
    for (const s of g.stations) {
      const on = P.dying <= 0 && dist(P.x, P.y, s.x, s.y) < 17;
      if (!on) { s.armed = true; s.prog = Math.max(0, s.prog - dt * 2.5); s.said = false; continue; }
      if (!s.open) { if (s.armed) { s.armed = false; say(room, 'broken', true); Sfx.thud(); } continue; }
      if (g.used) { if (s.armed) { s.armed = false; say(room, 'again', true); } continue; }
      if (capped(P, s.k)) { if (s.armed) { s.armed = false; say(room, 'max', true); } continue; }
      const before = s.prog;
      s.prog += dt;
      if (!s.said) { s.said = true; say(room, s.k, true); if (s.k === 'eiwit') { Sfx.vend(); g.pop = 1; } }
      const S = ST[s.k];
      // a rep every fifth of the set
      if (Math.floor(before / S.need * 5) !== Math.floor(s.prog / S.need * 5) && s.prog < S.need) {
        if (s.k !== 'boog') Sfx.rep();
        if (s.k === 'cardio' || s.k === 'kracht') addP({ kind: 'dot', x: P.x + rnd(-8, 8), y: P.y - 10, vx: rnd(-30, 30), vy: rnd(-50, -20), r: rnd(1, 1.8), life: 0.6, col: '#bfe4ff', drag: 1.5, g: 140 });
      }
      if (s.k === 'boog') {
        s.fire -= dt;
        if (s.fire <= 0) {
          s.fire = 0.38;
          const tg = room.obs.find((o) => o.type === 'target11');
          if (tg) { g.arrows.push({ x0: P.x - 6, y0: P.y - 4, x1: tg.x + 4 + rnd(-3, 3), y1: tg.y - 6 + rnd(-7, 7), t: 0, dur: 0.22 }); Sfx.thwip(); }
        }
      }
      if (s.prog >= S.need) { s.prog = S.need; finish(room, s); }
    }
    for (let i = g.arrows.length - 1; i >= 0; i--) {
      const a = g.arrows[i]; a.t += dt;
      if (a.t >= a.dur) { g.arrows.splice(i, 1); g.stuck.push({ x: a.x1, y: a.y1, a: Math.atan2(a.y1 - a.y0, a.x1 - a.x0) + rnd(-0.12, 0.12) }); if (g.stuck.length > 9) g.stuck.shift(); Sfx.thunk(); }
    }
    if (g.pop > 0) g.pop = Math.max(0, g.pop - dt * 0.7);
  }
  const ur0 = updateRoom9;
  updateRoom9 = function (dt, room, frozen) { ur0(dt, room, frozen); if (room.type === 'gym') safe(() => updateGym(dt, room)); };
  const er0 = enterRoom9;
  enterRoom9 = function (room, entry) {
    er0(room, entry);
    if (room.type === 'gym' && !room.seen) {
      room.seen = true;
      UI.card('', 'Klokhuis Gym', 'Coach Larspel opens three stations. Train at one, keep it for the run.', '', 3);
      Sfx.whistle();
    }
  };

  /* ------------------------------------------------------------------ info cards */
  const i0 = info9;
  info9 = function (room, P) {
    const g = room.gym9;
    if (g) {
      for (const s of g.stations) {
        if (dist(P.x, P.y, s.x, s.y) > 60) continue;
        const S = ST[s.k];
        if (!s.open) return { key: s, x: s.x, y: s.y - 22, title: S.name, tag: 'BUITEN GEBRUIK', tagCol: '#e0583e', body: 'Out of order. Tape, a sign, no repairman. Classic budget gym.', notes: [] };
        if (g.used) return { key: s, x: s.x, y: s.y - 22, title: S.name, tag: 'GYM', tagCol: LIME, body: g.used === s.k ? 'Done. That set counts for the rest of the run.' : 'Closed for you. One set per visit.', notes: [] };
        const mx = capped(P, s.k);
        return { key: s, x: s.x, y: s.y - 22, title: `${S.kind}: ${S.name}`, tag: 'GYM', tagCol: LIME, body: mx ? 'Maxed for this run. Nothing left to gain here.' : S.desc(s.amt),
          notes: [[s.k === 'eiwit' ? 'Stand on the mat to eat it.' : 'Stand on it until the set is done.', '#b7a89a'], ['Free. One station per visit.', LIME]] };
      }
      if (g.coach && dist(P.x, P.y, g.coach.x, g.coach.y) < 66)
        return { key: g.coach, x: g.coach.x, y: g.coach.y - 30, title: 'Coach Larspel', tag: 'TRAINER', tagCol: LIME, body: 'Personal trainer. Opens three of four stations and picks the weight. One set per visit, kept for the run. Gains add up, with a cap.', notes: [] };
    }
    return i0(room, P);
  };

  /* ------------------------------------------------------------------ hud, map, doors, light */
  const rc0 = roomChip;
  roomChip = function (room) { if (room && room.type === 'gym') return [room.gym9 && room.gym9.used ? 'TRAINED' : 'KLOKHUIS GYM', LIME]; return rc0(room); };
  MINI9.gym = (c, mx, my, cur) => { c.fillStyle = cur ? '#3a5a10' : LIME; c.fillRect(mx - 2.6, my - 0.6, 5.2, 1.2); c.fillRect(mx - 3.4, my - 2.4, 1.6, 4.8); c.fillRect(mx + 1.8, my - 2.4, 1.6, 4.8); };
  const dk0 = darkTarget9;
  darkTarget9 = function (room, L) { if (room.type === 'gym') return 0.18; return dk0(room, L); };
  const xl0 = extraLights9;
  extraLights9 = function (room, light) {
    xl0(room, light);
    const g = room.gym9; if (!g) return;
    for (const s of g.stations) if (s.open) light(s.x, s.y, 60, 0.35);
    light(g.coach.x, g.coach.y, 80, 0.5);
  };
  const wc0 = wallCol9;
  wallCol9 = function (room, L) { if (room.type === 'gym') return '#25272b'; return wc0(room, L); };

  /* ------------------------------------------------------------------ pause screen */
  const fp0 = UI.fillPause;
  UI.fillPause = function () {
    const r = fp0.apply(this, arguments);
    safe(() => {
      const P = G.player, g = P && P.gym9, el = this.el.pauseTunes;
      if (!g || !el) return;
      const bits = [];
      if (g.speed) bits.push(`+${g.speed}% speed`);
      if (g.dmg) bits.push(`+${g.dmg}% damage`);
      if (g.shot) bits.push(`+${g.shot}% seed speed`);
      if (g.hp) bits.push(`+${g.hp / 2} apple`);
      if (!bits.length) return;
      el.hidden = false;
      el.textContent = (el.textContent ? el.textContent + '. ' : '') + 'Gym: ' + bits.join(', ');
    });
    return r;
  };

  /* ------------------------------------------------------------------ lifetime numbers and an achievement */
  STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['workouts', 'Workouts']);
  STAT_GROUP10.workouts = 'Stuff';
  ACHS.push({ id: 'gymrat', reward: 'sprout', name: 'Gym Rat', desc: 'Train 8 times at Klokhuis Gym.', stat: 'workouts', goal: 8 });
  const ac0 = achCat10;
  achCat10 = function (a) { return a.stat === 'workouts' ? 'places' : ac0(a); };

  /* ------------------------------------------------------------------ the floor */
  const ft0 = floorTiles9;
  floorTiles9 = function (c, room, L, rng) {
    if (room.type !== 'gym') return ft0(c, room, L, rng);
    c.fillStyle = '#121315'; c.fillRect(0, 0, RW, RH);
    for (let r = 0; r < ROWS; r += 1) for (let col = 0; col < COLS; col += 1) {
      const x = col * T, y = r * T;
      c.fillStyle = rng() < 0.5 ? '#1b1c20' : '#191a1d'; c.fillRect(x + 0.8, y + 0.8, T - 1.6, T - 1.6);
      for (let i = 0; i < 9; i++) {
        const u = rng();
        c.fillStyle = u < 0.08 ? 'rgba(180,240,60,0.45)' : u < 0.16 ? 'rgba(90,140,230,0.4)' : u < 0.5 ? 'rgba(80,84,92,0.7)' : 'rgba(0,0,0,0.35)';
        c.fillRect(x + 2 + rng() * (T - 5), y + 2 + rng() * (T - 5), 1.4, 1.4);
      }
    }
    return true;
  };
  const fd0 = floorDeco9;
  floorDeco9 = function (c, room, L, rng) {
    if (room.type !== 'gym') return fd0(c, room, L, rng);
    // the turf lane through the middle, where the coach lives
    const y0 = T * 4 - 6, h = T + 12;
    c.fillStyle = '#2c5e2e'; c.fillRect(T * 1, y0, RW - T * 2, h);
    for (let i = 0; i < 260; i++) { c.fillStyle = rng() < 0.5 ? 'rgba(120,200,90,0.35)' : 'rgba(10,40,12,0.4)'; c.fillRect(T + rng() * (RW - T * 2), y0 + rng() * h, 1, 2.4); }
    c.strokeStyle = 'rgba(240,240,232,0.75)'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(T, y0 + 1); c.lineTo(RW - T, y0 + 1); c.moveTo(T, y0 + h - 1); c.lineTo(RW - T, y0 + h - 1); c.stroke();
    c.lineWidth = 1.2;
    for (let x = T * 2; x <= RW - T * 2; x += T) { c.beginPath(); c.moveTo(x, y0 + 4); c.lineTo(x, y0 + 10); c.moveTo(x, y0 + h - 10); c.lineTo(x, y0 + h - 4); c.stroke(); }
    c.fillStyle = 'rgba(240,240,232,0.6)'; c.font = `800 9px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('10', T * 2, y0 + h / 2); c.fillText('10', RW - T * 2, y0 + h / 2);
    // the bow lane: dashed line from the mark to the target
    c.strokeStyle = 'rgba(180,240,60,0.55)'; c.lineWidth = 1.4; c.setLineDash([5, 5]);
    c.beginPath(); c.moveTo(T * 2.5 - 14, T * 6.5); c.lineTo(T * 0.5 + 12, T * 6.5); c.stroke(); c.setLineDash([]);
    // zone corners in lime tape around each station
    c.strokeStyle = 'rgba(180,240,60,0.6)'; c.lineWidth = 2;
    for (const k of ST_IDS) {
      const [cc, rr] = POS[k], x = cc * T + 2, y = rr * T + 2, w = T - 4;
      c.beginPath();
      c.moveTo(x, y + 8); c.lineTo(x, y); c.lineTo(x + 8, y);
      c.moveTo(x + w - 8, y); c.lineTo(x + w, y); c.lineTo(x + w, y + 8);
      c.moveTo(x + w, y + w - 8); c.lineTo(x + w, y + w); c.lineTo(x + w - 8, y + w);
      c.moveTo(x + 8, y + w); c.lineTo(x, y + w); c.lineTo(x, y + w - 8);
      c.stroke();
    }
    // a floor logo in the corner: a little core and the name
    c.save(); c.translate(RW * 0.5, T * 7.6); c.globalAlpha = 0.18; drawCore(c, 10, false); c.restore();
    c.fillStyle = 'rgba(180,240,60,0.16)'; c.font = `800 11px ${UIF}`; c.fillText('KLOKHUIS', RW * 0.5, T * 8.25);
    return true;
  };

  /* ------------------------------------------------------------------ the walls */
  const dw0 = drawWalls9;
  drawWalls9 = function (c, room, L, rng) {
    if (room.type !== 'gym') return dw0(c, room, L, rng);
    const door = (k) => !!room.doors[k];
    // mirrors along the north wall
    const segs = door('n') ? [[-WALL + 6, RW / 2 - 38], [RW / 2 + 38, RW + WALL - 6]] : [[-WALL + 6, RW + WALL - 6]];
    for (const [a, b] of segs) {
      c.fillStyle = '#0c0d10'; c.fillRect(a, -WALL + 3, b - a, WALL - 7);
      const g = c.createLinearGradient(a, 0, b, 0); g.addColorStop(0, 'rgba(150,180,200,0.55)'); g.addColorStop(0.5, 'rgba(200,225,240,0.7)'); g.addColorStop(1, 'rgba(140,170,190,0.5)');
      c.fillStyle = g; c.fillRect(a + 2, -WALL + 5, b - a - 4, WALL - 11);
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.4;
      for (let x = a + 16; x < b - 10; x += 46) { c.beginPath(); c.moveTo(x, -6); c.lineTo(x + 9, -WALL + 6); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.5)'; for (let x = a + 60; x < b - 20; x += 64) c.fillRect(x, -WALL + 5, 1.2, WALL - 11);
    }
    // the name on the south wall
    if (!door('s')) { wallText9(c, 'KLOKHUIS GYM', RW / 2 + 6, RH + WALL / 2, 13, LIME); c.save(); c.translate(RW / 2 - 50, RH + WALL / 2 + 1); drawCore(c, 7, false); c.restore(); }
    else { wallText9(c, 'KLOKHUIS', RW * 0.22 + 6, RH + WALL / 2, 12, LIME); wallText9(c, 'GYM', RW * 0.78, RH + WALL / 2, 12, LIME); c.save(); c.translate(RW * 0.22 - 38, RH + WALL / 2 + 1); drawCore(c, 6, false); c.restore(); }
    // the motto on the west wall, open hours on the east wall
    wallText9(c, 'NO PAIN NO GRAIN', -WALL / 2, RH * 0.2, 9, 'rgba(236,226,212,0.75)', -Math.PI / 2);
    c.fillStyle = '#0c0d10'; c.fillRect(RW + 4, RH * 0.18 - 14, WALL - 8, 28);
    wallText9(c, '24/7', RW + WALL / 2, RH * 0.18, 10, LIME, Math.PI / 2);
    c.fillStyle = 'rgba(180,240,60,0.85)'; c.fillRect(RW + 6, RH * 0.82 - 10, WALL - 12, 20);
    wallText9(c, 'OPEN', RW + WALL / 2, RH * 0.82, 8, '#16181c', Math.PI / 2);
  };

  /* ------------------------------------------------------------------ furniture */
  const shadow = (c, x, y, w, h) => { c.fillStyle = 'rgba(0,0,0,0.42)'; rrect(c, x + 2, y + 4, w, h, 3); c.fill(); };
  STATIC9.locker11 = (c, o) => {
    const x = o.x - 17, y = o.y - 17;
    shadow(c, x, y, 34, 32);
    for (let i = 0; i < 3; i++) {
      const lx = x + i * 11.5;
      c.fillStyle = '#20232a'; c.fillRect(lx, y, 11, 32);
      c.fillStyle = i === 1 ? '#3f6e9a' : '#35597c'; c.fillRect(lx + 1, y + 1, 9, 30);
      c.fillStyle = 'rgba(0,0,0,0.45)'; for (let k = 0; k < 3; k++) c.fillRect(lx + 2.5, y + 4 + k * 2.4, 6, 1);
      c.fillStyle = '#c8ccd2'; c.fillRect(lx + 7, y + 15, 1.6, 4);
    }
    // one door hangs open
    c.fillStyle = '#4a7aa6'; c.beginPath(); c.moveTo(x + 23, y + 1); c.lineTo(x + 30, y + 4); c.lineTo(x + 30, y + 30); c.lineTo(x + 23, y + 31); c.closePath(); c.fill();
    c.fillStyle = '#e8e2d0'; c.fillRect(x + 25.5, y + 20, 3, 6);
  };
  STATIC9.rack11 = (c, o) => {
    const x = o.x - 17, y = o.y - 15;
    shadow(c, x, y, 34, 30);
    c.fillStyle = '#2a2d33'; c.fillRect(x, y + 4, 34, 24);
    c.fillStyle = '#3a3e46'; c.fillRect(x + 1, y + 5, 32, 3); c.fillRect(x + 1, y + 16, 32, 3);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) {
      const dx = x + 6 + i * 11, dy = y + 2 + row * 11;
      c.fillStyle = '#c8ccd2'; c.fillRect(dx - 1, dy + 4, 2, 4);
      c.fillStyle = '#16171a'; rrect(c, dx - 4, dy, 8, 4, 1.2); c.fill(); rrect(c, dx - 4, dy + 8, 8, 4, 1.2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(dx - 3, dy + 0.6, 6, 1);
    }
  };
  STATIC9.tree11 = (c, o) => {
    const x = o.x, y = o.y;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 6, 15, 7); c.fill();
    const plates = [['#d23a3a', 13], ['#2a6ad8', 11.5], ['#e8c030', 10], ['#3aa84a', 8.5]];
    plates.forEach(([col, r], i) => { const py = y + 4 - i * 4; c.fillStyle = mixHex(col, '#000000', 0.35); ell(c, x, py + 1.2, r, r * 0.45); c.fill(); c.fillStyle = col; ell(c, x, py, r, r * 0.45); c.fill(); c.fillStyle = 'rgba(255,255,255,0.2)'; ell(c, x - r * 0.3, py - r * 0.12, r * 0.4, r * 0.1); c.fill(); });
    c.fillStyle = '#c8ccd2'; c.fillRect(x - 1.4, y - 16, 2.8, 12); c.fillStyle = '#e8ecf0'; circle(c, x, y - 16, 2);
  };
  DYN9.cooler11 = (c, o, room, t) => {
    const x = o.x, y = o.y;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 2, y + 13, 10, 4); c.fill();
    c.fillStyle = '#e8e6e0'; rrect(c, x - 8, y - 4, 16, 18, 2); c.fill(); c.strokeStyle = '#8a8e96'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#2a6ad8'; c.fillRect(x - 5, y + 1, 3, 3); c.fillStyle = '#d23a3a'; c.fillRect(x + 2, y + 1, 3, 3);
    c.fillStyle = 'rgba(120,190,255,0.55)'; ell(c, x, y - 11, 7, 9); c.fill(); c.strokeStyle = 'rgba(200,235,255,0.8)'; c.stroke();
    c.fillStyle = 'rgba(80,150,230,0.5)'; ell(c, x, y - 8, 6, 5); c.fill();
    const ph = (t * 0.5 + o.seed) % 1; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x + 1, y - 4 - ph * 12, 1.2, 0, TAU); c.stroke();
  };
  DYN9.vend11 = (c, o, room, t) => {
    const x = o.x - 16, y = o.y - 19, g = room.gym9, s = g && g.stations.find((q) => q.k === 'eiwit');
    shadow(c, x, y, 32, 34);
    c.fillStyle = '#16181c'; rrect(c, x, y, 32, 34, 2); c.fill();
    c.fillStyle = LIME; c.fillRect(x + 1, y + 1, 30, 6);
    c.fillStyle = '#16181c'; c.font = `800 5.5px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sayF9('EIWIT'), x + 16, y + 4.3);
    c.fillStyle = '#0d1a14'; c.fillRect(x + 2, y + 9, 20, 20);
    const cols = ['#b4f03c', '#ff8a3a', '#ff5ab0', '#5ab4ff'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) { c.fillStyle = cols[(r + i * 2) % 4]; c.fillRect(x + 3.5 + i * 6.3, y + 11 + r * 6, 5, 2.6); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + 3.5 + i * 6.3, y + 11 + r * 6, 5, 0.8); }
    c.fillStyle = 'rgba(200,240,255,0.12)'; c.fillRect(x + 2, y + 9, 6, 20);
    c.fillStyle = '#25282e'; c.fillRect(x + 23, y + 9, 7, 20);
    const live = s && s.open && !(g && g.used);
    c.fillStyle = live ? (Math.sin(t * 4) > 0 ? LIME : '#7aa82a') : '#5a2a2a'; c.fillRect(x + 24, y + 10, 5, 3);
    c.fillStyle = '#0a0b0d'; c.fillRect(x + 25.5, y + 16, 2, 4);
    c.fillStyle = '#0a0b0d'; c.fillRect(x + 3, y + 30, 18, 3);
    if (g && g.pop > 0) { c.fillStyle = '#ff8a3a'; c.fillRect(x + 7, y + 28 + (1 - g.pop) * 4, 9, 3); }
    if (s && !s.open) tape(c, o.x, o.y, 30);
  };
  DYN9.target11 = (c, o, room, t) => {
    const x = o.x + 2, y = o.y - 4, g = room.gym9;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 3, y + 18, 12, 4); c.fill();
    c.strokeStyle = '#6a4224'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 8, y + 18); c.lineTo(x - 2, y); c.moveTo(x + 8, y + 18); c.lineTo(x + 2, y); c.stroke();
    const rings = [['#f2f0ea', 14], ['#1a1a1e', 11.5], ['#2a8ad8', 9], ['#d23a3a', 6.4], ['#f2c230', 3.6]];
    c.fillStyle = '#c8a860'; circle(c, x, y, 15.5);
    for (const [col, r] of rings) { c.fillStyle = col; circle(c, x, y, r); }
    if (g) for (const a of g.stuck) {
      c.save(); c.translate(a.x, a.y); c.rotate(a.a + Math.PI);
      c.strokeStyle = '#7a5230'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(12, 0); c.stroke();
      c.fillStyle = LIME; c.beginPath(); c.moveTo(10, 0); c.lineTo(14, -2.6); c.lineTo(13, 0); c.lineTo(14, 2.6); c.closePath(); c.fill();
      c.restore();
    }
    const s = g && g.stations.find((q) => q.k === 'boog');
    if (s && !s.open) tape(c, x, y, 26);
  };
  function tape(c, x, y, w) {
    c.save(); c.translate(x, y);
    for (const a of [-0.6, 0.6]) {
      c.save(); c.rotate(a);
      c.fillStyle = '#f2c230'; c.fillRect(-w / 2, -2.4, w, 4.8);
      c.fillStyle = '#16181c'; for (let i = -w / 2; i < w / 2; i += 5) { c.beginPath(); c.moveTo(i, -2.4); c.lineTo(i + 2.4, -2.4); c.lineTo(i + 0.2, 2.4); c.lineTo(i - 2.2, 2.4); c.closePath(); c.fill(); }
      c.restore();
    }
    c.restore();
  }

  /* ------------------------------------------------------------------ Coach Larspel: an apple with short dark hair, a full trimmed beard, a smile and a cream zip sweater */
  function drawLarspel(c, R, st) {
    const lx = clamp(st.lx || 0, -1, 1), ly = clamp(st.ly || 0, -1, 1);
    // body
    const gr = c.createRadialGradient(-R * 0.38, -R * 0.42, R * 0.08, 0, 0, R * 1.18);
    gr.addColorStop(0, '#ff7a6e'); gr.addColorStop(0.42, '#d92a40'); gr.addColorStop(1, '#6e0b1d');
    applePath(c, R); c.fillStyle = gr; c.fill();
    c.save(); applePath(c, R); c.clip();
    // the sweater
    const sw = c.createLinearGradient(0, R * 0.4, 0, R); sw.addColorStop(0, '#e6dcc8'); sw.addColorStop(1, '#bcae96');
    c.beginPath(); c.moveTo(-R * 1.3, R * 0.5); c.quadraticCurveTo(0, R * 0.36, R * 1.3, R * 0.5); c.lineTo(R * 1.3, R * 1.4); c.lineTo(-R * 1.3, R * 1.4); c.closePath();
    c.fillStyle = sw; c.fill();
    c.strokeStyle = 'rgba(120,104,82,0.35)'; c.lineWidth = Math.max(0.4, R * 0.03);
    for (const x of [-0.8, -0.55, 0.55, 0.8]) { c.beginPath(); c.moveTo(x * R, R * 0.62); c.lineTo(x * R * 1.05, R); c.stroke(); }
    // the stand-up collar
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * R * 0.66, R * 0.52); c.lineTo(s * R * 0.52, R * 0.32); c.lineTo(s * R * 0.05, R * 0.42); c.lineTo(s * R * 0.04, R * 0.64); c.closePath();
      c.fillStyle = '#d8cdb6'; c.fill(); c.strokeStyle = 'rgba(110,94,72,0.6)'; c.lineWidth = Math.max(0.5, R * 0.04); c.stroke();
    }
    // the zip
    c.strokeStyle = '#2a2622'; c.lineWidth = Math.max(0.8, R * 0.07); c.beginPath(); c.moveTo(0, R * 0.42); c.lineTo(0, R * 1.05); c.stroke();
    c.strokeStyle = 'rgba(200,200,205,0.6)'; c.lineWidth = Math.max(0.4, R * 0.025);
    for (let y = 0.48; y < 1; y += 0.08) { c.beginPath(); c.moveTo(-R * 0.035, y * R); c.lineTo(R * 0.035, y * R); c.stroke(); }
    c.fillStyle = '#c8ccd2'; rrect(c, R * 0.02, R * 0.56, R * 0.09, R * 0.17, R * 0.03); c.fill();
    // the beard: full and short, cheek to cheek
    c.beginPath();
    c.moveTo(-R * 1.15, -R * 0.02); c.lineTo(-R * 0.86, 0);
    c.quadraticCurveTo(-R * 0.76, R * 0.26, -R * 0.42, R * 0.27);
    c.quadraticCurveTo(0, R * 0.17, R * 0.42, R * 0.27);
    c.quadraticCurveTo(R * 0.76, R * 0.26, R * 0.86, 0);
    c.lineTo(R * 1.15, -R * 0.02); c.lineTo(R * 1.15, R * 0.54);
    c.quadraticCurveTo(R * 0.5, R * 0.68, 0, R * 0.66);
    c.quadraticCurveTo(-R * 0.5, R * 0.68, -R * 1.15, R * 0.54); c.closePath();
    c.fillStyle = '#3b2617'; c.fill();
    c.fillStyle = 'rgba(110,72,40,0.55)';
    for (let i = 0; i < 26; i++) { const a = 0.25 + (i / 25) * (Math.PI - 0.5), rr = 0.62 + ((i * 37) % 9) / 40; circle(c, Math.cos(a) * R * rr, R * 0.26 + Math.sin(a) * R * 0.32, Math.max(0.35, R * 0.028)); }
    c.restore();
    // the mouth: a wide smile, upper teeth showing
    const talk = st.talk > 0 ? 0.5 + 0.5 * Math.abs(Math.sin(st.t * 16)) : 0.75;
    c.beginPath(); c.moveTo(-R * 0.26, R * 0.32); c.quadraticCurveTo(0, R * (0.36 + 0.2 * talk), R * 0.26, R * 0.32); c.quadraticCurveTo(0, R * 0.37, -R * 0.26, R * 0.32); c.closePath();
    c.fillStyle = '#3a0a10'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#fbf6ea'; c.fillRect(-R * 0.3, R * 0.3, R * 0.6, R * 0.1); c.restore();
    // the moustache
    c.beginPath(); c.moveTo(-R * 0.34, R * 0.32); c.quadraticCurveTo(-R * 0.18, R * 0.17, 0, R * 0.22); c.quadraticCurveTo(R * 0.18, R * 0.17, R * 0.34, R * 0.32);
    c.quadraticCurveTo(R * 0.16, R * 0.25, 0, R * 0.28); c.quadraticCurveTo(-R * 0.16, R * 0.25, -R * 0.34, R * 0.32); c.closePath();
    c.fillStyle = '#2e1d11'; c.fill();
    // eyes: warm, brown, a smile under them
    const open = clamp(st.blink == null ? 1 : st.blink, 0.08, 1);
    for (const s of [-1, 1]) {
      const x = s * R * 0.32, y = -R * 0.13;
      ell(c, x, y, R * 0.15, R * 0.12 * open); c.fillStyle = '#fff8ec'; c.fill();
      if (open > 0.3) {
        c.fillStyle = '#5a3418'; circle(c, x + lx * R * 0.05, y + ly * R * 0.03, R * 0.085);
        c.fillStyle = '#140804'; circle(c, x + lx * R * 0.05, y + ly * R * 0.03, R * 0.045);
        c.fillStyle = '#ffffff'; circle(c, x + lx * R * 0.05 - R * 0.03, y + ly * R * 0.03 - R * 0.035, R * 0.025);
      }
      c.strokeStyle = '#2b070f'; c.lineWidth = Math.max(0.6, R * 0.045);
      c.beginPath(); c.ellipse(x, y, R * 0.16, R * 0.13 * open, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      c.strokeStyle = 'rgba(120,12,28,0.7)'; c.lineWidth = Math.max(0.5, R * 0.04);
      c.beginPath(); c.arc(x, y + R * 0.2, R * 0.13, Math.PI * 1.2, Math.PI * 1.8); c.stroke();
      // brows: dark and straight
      c.strokeStyle = '#24160c'; c.lineWidth = Math.max(1, R * 0.09); c.lineCap = 'round';
      c.beginPath(); c.moveTo(s * R * 0.52, -R * 0.32); c.quadraticCurveTo(s * R * 0.34, -R * 0.4, s * R * 0.14, -R * 0.35); c.stroke();
    }
    // the hair: short at the sides, a little longer on top, pushed up
    const hg = c.createLinearGradient(0, -R * 1.2, 0, -R * 0.4); hg.addColorStop(0, '#4a3020'); hg.addColorStop(1, '#22150c');
    c.beginPath();
    c.moveTo(-R * 0.98, -R * 0.36);
    c.quadraticCurveTo(-R * 1.08, -R * 0.86, -R * 0.5, -R * 1.02);
    c.quadraticCurveTo(-R * 0.1, -R * 1.24, R * 0.3, -R * 1.14);
    c.quadraticCurveTo(R * 1.08, -R * 0.98, R * 0.98, -R * 0.36);
    c.lineTo(R * 0.86, -R * 0.4);
    c.quadraticCurveTo(R * 0.8, -R * 0.62, R * 0.52, -R * 0.68);
    c.quadraticCurveTo(R * 0.2, -R * 0.64, 0, -R * 0.72);
    c.quadraticCurveTo(-R * 0.3, -R * 0.64, -R * 0.56, -R * 0.68);
    c.quadraticCurveTo(-R * 0.84, -R * 0.6, -R * 0.86, -R * 0.4); c.closePath();
    c.fillStyle = hg; c.fill();
    c.strokeStyle = '#140c06'; c.lineWidth = Math.max(0.6, R * 0.05); c.stroke();
    c.strokeStyle = 'rgba(150,110,70,0.55)'; c.lineWidth = Math.max(0.4, R * 0.035);
    for (const [x0, y0, x1, y1] of [[-0.5, -0.72, -0.2, -1.08], [-0.25, -0.74, 0.05, -1.14], [0.02, -0.76, 0.3, -1.1], [0.28, -0.72, 0.55, -1.0], [-0.75, -0.56, -0.62, -0.9]]) {
      c.beginPath(); c.moveTo(x0 * R, y0 * R); c.quadraticCurveTo((x0 + 0.05) * R, (y1 + 0.1) * R, x1 * R, y1 * R); c.stroke();
    }
    // the stem sticks out of the quiff
    c.strokeStyle = '#3d2414'; c.lineWidth = R * 0.11; c.lineCap = 'round';
    c.beginPath(); c.moveTo(R * 0.06, -R * 1.08); c.quadraticCurveTo(R * 0.1, -R * 1.3, R * 0.2, -R * 1.42); c.stroke();
    leafShape(c, R * 0.16, -R * 1.34, R * 0.5, -0.3 + Math.sin(st.t * 2) * 0.06);
    // the whistle on a lime cord
    c.strokeStyle = LIME; c.lineWidth = Math.max(0.6, R * 0.05);
    c.beginPath(); c.moveTo(-R * 0.5, R * 0.44); c.quadraticCurveTo(-R * 0.1, R * 0.86, R * 0.26, R * 0.8); c.moveTo(R * 0.5, R * 0.44); c.quadraticCurveTo(R * 0.44, R * 0.7, R * 0.3, R * 0.78); c.stroke();
    c.fillStyle = '#d8dce2'; rrect(c, R * 0.22, R * 0.74, R * 0.26, R * 0.13, R * 0.05); c.fill(); c.strokeStyle = '#6a6e76'; c.lineWidth = Math.max(0.4, R * 0.03); c.stroke();
    c.fillStyle = '#6a6e76'; circle(c, R * 0.42, R * 0.8, R * 0.03);
    applePath(c, R); c.strokeStyle = '#2b070f'; c.lineWidth = Math.max(1, R * 0.08); c.stroke();
  }
  DYN9.coach11 = (c, o, room, t) => {
    const R = 16, P = G.player;
    const bob = Math.sin(t * 2.2 + o.seed * 6) * 0.8, hop = o.talk > 0 ? Math.abs(Math.sin(t * 12)) * 1.4 : 0;
    c.fillStyle = 'rgba(0,0,0,0.38)'; ell(c, o.x + 1, o.y + R * 0.95, R * 0.95, R * 0.32); c.fill();
    if (o.blinkT == null) o.blinkT = 2;
    const bt = (t + o.seed * 9) % 4.2, blink = bt < 0.12 ? 0.1 : 1;
    const lx = P ? Math.cos(o.look) : 0, ly = P ? Math.sin(o.look) * 0.6 : 0;
    c.save(); c.translate(o.x, o.y - 3 + bob - hop); c.lineJoin = 'round';
    drawLarspel(c, R, { t, talk: o.talk, blink, lx, ly });
    c.restore();
  };
  // other screens can draw him too (the guide)
  window.__bitten = Object.assign(window.__bitten || {}, { drawLarspel11: drawLarspel });

  /* ------------------------------------------------------------------ the stations on the floor */
  function drawTreadmill(c, s, t, P, active) {
    const x = s.x, y = s.y;
    c.fillStyle = 'rgba(0,0,0,0.42)'; rrect(c, x - 13, y - 18, 30, 42, 4); c.fill();
    c.fillStyle = '#2b2e34'; rrect(c, x - 15, y - 21, 30, 42, 4); c.fill();
    c.fillStyle = '#111215'; c.fillRect(x - 11, y - 12, 22, 30);
    c.save(); c.beginPath(); c.rect(x - 11, y - 12, 22, 30); c.clip();
    const off = active ? (t * 60) % 5 : 0;
    c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1;
    for (let k = -5; k < 32; k += 5) { c.beginPath(); c.moveTo(x - 11, y - 12 + k + off); c.lineTo(x + 11, y - 12 + k + off); c.stroke(); }
    c.restore();
    c.fillStyle = '#aab0b8'; c.fillRect(x - 14, y - 16, 2, 20); c.fillRect(x + 12, y - 16, 2, 20);
    c.fillStyle = '#1a1c20'; rrect(c, x - 14, y - 25, 28, 9, 2); c.fill();
    c.fillStyle = '#ff4a3a'; c.font = `700 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(active ? (10 + (s.prog / ST.cardio.need) * 4).toFixed(1) : '0.0', x - 3, y - 20.4);
    c.fillStyle = s.open ? LIME : '#5a2a2a'; circle(c, x + 9, y - 20.5, 2);
  }
  function drawBench(c, s, t, P, active) {
    const x = s.x, y = s.y;
    c.fillStyle = 'rgba(0,0,0,0.42)'; rrect(c, x - 6, y - 13, 16, 36, 4); c.fill();
    for (const sx of [-21, 21]) { c.fillStyle = '#2a2d33'; c.fillRect(x + sx - 2, y - 16, 4, 12); c.fillStyle = '#4a4e56'; circle(c, x + sx, y - 16, 2.6); }
    c.fillStyle = '#1c1c20'; rrect(c, x - 7, y - 15, 14, 34, 4); c.fill();
    c.strokeStyle = LIME; c.lineWidth = 1; rrect(c, x - 6, y - 14, 12, 32, 3.5); c.stroke();
    c.fillStyle = '#3a3e46'; c.fillRect(x - 2, y + 18, 4, 4);
    const lift = active ? Math.abs(Math.sin(t * 5.5)) * 4 : 0;
    const by = y - 12 - lift;
    c.strokeStyle = '#c8ccd2'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 30, by); c.lineTo(x + 30, by); c.stroke();
    for (const sd of [-1, 1]) {
      c.fillStyle = '#d23a3a'; rrect(c, x + sd * 25 - 2.2, by - 8, 4.4, 16, 1); c.fill();
      c.fillStyle = '#2a6ad8'; rrect(c, x + sd * 20.5 - 1.8, by - 6.5, 3.6, 13, 1); c.fill();
      c.fillStyle = '#e8ecf0'; c.fillRect(x + sd * 17.5 - 1, by - 2.5, 2, 5);
    }
  }
  function drawMark(c, s, t) {
    const x = s.x, y = s.y;
    c.fillStyle = '#f2f0ea'; c.fillRect(x - 15, y - 1, 3, 14); c.fillRect(x - 15, y + 5, 12, 2);
    // the quiver bucket
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 13, y - 9, 6, 3); c.fill();
    c.fillStyle = '#5a3a20'; rrect(c, x + 8, y - 20, 10, 12, 2); c.fill();
    c.strokeStyle = '#7a5230'; c.lineWidth = 1.2;
    for (const dx of [-2.5, 0, 2.5]) { c.beginPath(); c.moveTo(x + 13 + dx, y - 19); c.lineTo(x + 13 + dx * 1.6, y - 27); c.stroke(); c.fillStyle = LIME; c.fillRect(x + 12 + dx * 1.6, y - 29, 2, 3); }
  }
  function drawMat(c, s) {
    const x = s.x, y = s.y;
    c.fillStyle = '#1c2a12'; rrect(c, x - 13, y - 9, 26, 18, 3); c.fill();
    c.strokeStyle = LIME; c.lineWidth = 1; rrect(c, x - 12, y - 8, 24, 16, 2.5); c.stroke();
    c.fillStyle = '#ff8a3a'; rrect(c, x - 6, y - 2.5, 12, 5, 1.2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 5, y - 2, 10, 1);
  }
  const df0 = drawFloorThings9;
  drawFloorThings9 = function (c, room, t) {
    df0(c, room, t);
    const g = room.gym9; if (!g) return;
    const P = G.player;
    for (const s of g.stations) {
      const active = s.prog > 0 && !g.used;
      if (s.k === 'cardio') drawTreadmill(c, s, t, P, active);
      else if (s.k === 'kracht') drawBench(c, s, t, P, active);
      else if (s.k === 'boog') drawMark(c, s, t);
      else drawMat(c, s);
      if (!s.open && s.k !== 'eiwit' && s.k !== 'boog') tape(c, s.x, s.y, 30);
      // the label under each station
      const mx = P && capped(P, s.k);
      const lab = !s.open ? 'DEFECT' : g.used === s.k ? 'DONE' : g.used ? 'CLOSED' : mx ? 'MAX' : fmtGain(s.k, s.amt);
      const col = !s.open ? '#e0583e' : g.used === s.k ? '#ffe7a0' : g.used || mx ? 'rgba(236,226,212,0.45)' : LIME;
      const ly = s.y + 26;
      c.font = `800 8px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const w = c.measureText(sayF9(lab)).width + 8;
      c.fillStyle = 'rgba(10,10,12,0.82)'; rrect(c, s.x - w / 2, ly - 6, w, 12, 2); c.fill();
      c.fillStyle = col; c.fillText(sayF9(lab), s.x, ly + 0.5);
      // the set filling up
      if (s.prog > 0 && !g.used) {
        const u = clamp(s.prog / ST[s.k].need, 0, 1);
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 4; c.beginPath(); c.arc(s.x, s.y, 20, 0, TAU); c.stroke();
        c.strokeStyle = LIME; c.lineWidth = 2.6; c.beginPath(); c.arc(s.x, s.y, 20, -Math.PI / 2, -Math.PI / 2 + u * TAU); c.stroke();
        c.fillStyle = '#ffffff'; c.font = `800 8px ${UIF}`; c.fillText(`${Math.min(5, Math.floor(u * 5) + 1)}/5`, s.x + 24, s.y - 18);
      } else if (s.open && !g.used && !mx) {
        const a = 0.25 + 0.2 * Math.sin(t * 3 + s.c);
        c.strokeStyle = `rgba(180,240,60,${a})`; c.lineWidth = 1.4; c.beginPath(); c.arc(s.x, s.y, 18, 0, TAU); c.stroke();
      }
    }
    for (const a of g.arrows) {
      const u = clamp(a.t / a.dur, 0, 1), x = lerp(a.x0, a.x1, u), y = lerp(a.y0, a.y1, u) - Math.sin(u * Math.PI) * 6, ang = Math.atan2(a.y1 - a.y0, a.x1 - a.x0);
      c.save(); c.translate(x, y); c.rotate(ang);
      c.strokeStyle = '#7a5230'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-12, 0); c.lineTo(2, 0); c.stroke();
      c.fillStyle = '#c8ccd2'; c.beginPath(); c.moveTo(4, 0); c.lineTo(0, -2); c.lineTo(0, 2); c.closePath(); c.fill();
      c.fillStyle = LIME; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-15, -2.6); c.lineTo(-14, 0); c.lineTo(-15, 2.6); c.closePath(); c.fill();
      c.restore();
    }
  };

  /* ------------------------------------------------------------------ the speech bubble, drawn after the light */
  const dt0 = drawTexts;
  drawTexts = function (c) {
    safe(() => {
      const room = G.room, g = room && room.gym9;
      if (!g || !g.say || !g.coach || G.state === 'menu') return;
      const s = g.say, a = Math.min(1, s.t * 6) * Math.min(1, (s.life - s.t) * 3);
      if (a <= 0) return;
      const txt = sayF9(s.txt);
      c.save(); c.globalAlpha = a;
      c.font = `700 10px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const w = Math.min(180, c.measureText(txt).width + 14), h = 18;
      const cx = clamp(g.coach.x, w / 2 + 4, RW - w / 2 - 4), cy = g.coach.y - 40 - Math.min(1, s.t * 8) * 2;
      c.fillStyle = 'rgba(0,0,0,0.35)'; rrect(c, cx - w / 2 + 1.5, cy - h / 2 + 2, w, h, 3); c.fill();
      c.fillStyle = '#f7f5f0'; rrect(c, cx - w / 2, cy - h / 2, w, h, 3); c.fill();
      c.beginPath(); c.moveTo(g.coach.x - 4, cy + h / 2 - 0.5); c.lineTo(g.coach.x + 2, cy + h / 2 + 6); c.lineTo(g.coach.x + 5, cy + h / 2 - 0.5); c.closePath(); c.fill();
      c.fillStyle = '#16181c'; c.fillText(txt, cx, cy + 0.5, w - 8);
      c.fillStyle = '#3a5a10'; c.font = `800 6px ${UIF}`; c.textAlign = 'left'; c.fillText('COACH', cx - w / 2 + 3, cy - h / 2 - 4);
      c.restore();
    });
    return dt0(c);
  };

  /* ------------------------------------------------------------------ the texts file */
  safe(() => {
    const msg = ['Klokhuis Gym', 'Coach Larspel opens three stations. Train at one, keep it for the run.', 'Plateau', 'That number is maxed for this run. The coach saw it coming.', 'Coach Larspel',
      'Personal trainer. Opens three of four stations and picks the weight. One set per visit, kept for the run. Gains add up, with a cap.',
      'Out of order. Tape, a sign, no repairman. Classic budget gym.', 'Done. That set counts for the rest of the run.', 'Closed for you. One set per visit.', 'Maxed for this run. Nothing left to gain here.',
      'Stand on the mat to eat it.', 'Stand on it until the set is done.', 'Free. One station per visit.', 'EIWIT', 'DEFECT', 'DONE', 'CLOSED', 'MAX'];
    for (const k in LINES) for (const s of LINES[k]) msg.push(s);
    for (const s of msg) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
    const tc0 = Texts.collect;
    Texts.collect = function () {
      const o = tc0.apply(this, arguments);
      o.gym = {};
      for (const k of ST_IDS) o.gym[k] = { name: ST[k].name, kind: ST[k].kind, desc_template: k === 'eiwit' ? '{Half an apple / One apple} more health, for good. Tastes like chalk.' : ST[k].desc('{n}') };
      o.gym_coach_lines = JSON.parse(JSON.stringify(LINES));
      return o;
    };
  });

  Object.assign(window.__bitten, { V118: { ST, POS, LINES, GYM_CAP, setupGym, updateGym, gain } });
})();


