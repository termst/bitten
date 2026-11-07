/* src/61-v110-contracts.js: v11.0: Contracten (De Makelaar). From v11.0. Lines 27099 to 27900 of the v13.7 script. */
/* ===== v11.0: Contracten. Before some fights De Makelaar offers three contracts. Sign one: pay the stake,
   keep the terms, get paid when the room is clear. Break the terms and the stake is gone. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe61'); console.error(e); return fb; } };
  const DISPLAY = '"Grenze Gotisch", Georgia, serif';
  const TIER = [null,
    { n: 'I', name: 'Brons', wax: '#9a4f22', hi: '#e8a066', band: '#b8682e', stake: 3, pay: 2.0, extra: '' },
    { n: 'II', name: 'Zilver', wax: '#6c7684', hi: '#e2e8ef', band: '#9aa4b2', stake: 5, pay: 2.4, extra: '+ half an apple' },
    { n: 'III', name: 'Goud', wax: '#a87a08', hi: '#ffe58a', band: '#d9a520', stake: 8, pay: 2.9, extra: '+ a powerup' }];
  const live = (room) => room.snakes.filter((s) => s.alive && !(s.dying > 0));
  const fmt = (v) => (v < 10 ? v.toFixed(1) : String(Math.ceil(v)));
  const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  let CUR = null, PEND = null, NEXT_ID = 1;
  const fail = (C, why) => resolve(C, false, why);

  /* ------------------------------------------------------------------ the clauses */
  const CL = [
    { id: 'snelrecht', name: 'Snelrecht', k: 1.05,
      make(t, x) { const T_ = Math.round((5 + 3.2 * x.n) * [1.3, 1, 0.78][t - 1]); return { T: T_, text: `Clear this room within ${T_} seconds.` }; },
      tick(C) { if (C.t > C.p.T) fail(C, 'Too slow.'); },
      hud(C) { const r = Math.max(0, C.p.T - C.t); return { s: `${fmt(r)} s left`, f: r / C.p.T, w: r < C.p.T * 0.25 }; } },
    { id: 'schadevrij', name: 'Schadevrij', k: 1,
      make(t) { const A = [2, 1, 0][t - 1]; return { A, text: A ? `Clear this room. Take ${pl(A, 'bite')} at most.` : 'Clear this room without a single bite.' }; },
      bite(C) { if (C.bites > C.p.A) fail(C, 'Bitten.'); },
      hud(C) { return { s: `Bites ${C.bites} / ${C.p.A}`, f: 1 - C.bites / (C.p.A + 1), w: C.bites >= C.p.A }; } },
    { id: 'zuinig', name: 'Zuinigheid', k: 1,
      make(t, x) { const N = Math.max(x.n + 2, Math.ceil((x.hp / Math.max(0.4, x.dmg)) * [2.6, 2, 1.6][t - 1])); return { N, text: `Clear this room with ${N} shots or fewer.` }; },
      shot(C) { if (C.shots > C.p.N) fail(C, 'Out of shots.'); },
      hud(C) { return { s: `Shots ${C.shots} / ${C.p.N}`, f: 1 - C.shots / C.p.N, w: C.shots > C.p.N * 0.8 }; } },
    { id: 'trefzeker', name: 'Trefzekerheid', k: 1,
      make(t) { const X = [45, 60, 75][t - 1]; return { X, text: `Clear this room. At least ${X}% of your seeds must hit a snake.` }; },
      pct(C) { return C.seeds ? Math.round((100 * C.hits) / C.seeds) : 100; },
      clear(C) { return this.pct(C) >= C.p.X ? true : 'Missed too much.'; },
      hud(C) { const v = this.pct(C); return { s: `Hit ${v}% / ${C.p.X}%`, f: Math.min(1, v / 100), w: v < C.p.X, mark: C.p.X / 100 }; } },
    { id: 'thuiswerk', name: 'Thuiswerk', k: 1.1,
      make(t, x) { const R = [3.4, 2.6, 2][t - 1] * T, c = nearestFreeCell(x.room, RW / 2, RH / 2); return { R, cx: c.x, cy: c.y, text: 'Get into the circle in the middle within 3 seconds. Stay in it until the room is clear.' }; },
      tick(C, dt, P) {
        if (C.t < 3) return;
        const d = dist(P.x, P.y, C.p.cx, C.p.cy);
        if (d > C.p.R) { C.out += dt; if (C.out > 0.5) fail(C, 'Left the office.'); } else C.out = Math.max(0, C.out - dt * 2);
      },
      hud(C) {
        const P = G.player;
        if (C.t < 3) return { s: `Into the circle ${fmt(3 - C.t)}`, f: 1 - C.t / 3, w: true };
        const d = dist(P.x, P.y, C.p.cx, C.p.cy);
        return { s: d > C.p.R ? 'Outside. Get back in' : 'Stay in the circle', f: 1 - Math.min(1, d / C.p.R), w: d > C.p.R * 0.8 };
      } },
    { id: 'afstand', name: 'Afstand', k: 1.1,
      make(t) { const D = [0.7, 1.05, 1.4][t - 1]; return { D, text: `Clear this room. No snake head ever gets within ${D} tiles of you.` }; },
      tick(C, dt, P, room) {
        let m = 1e9;
        for (const s of room.snakes) { if (!s.alive || s.dying > 0 || s.burrowed || s.state !== 'active') continue; m = Math.min(m, dist(P.x, P.y, s.x, s.y) - s.headR - P.r); }
        C.near = m;
        if (C.t < 1) return;
        if (m < C.p.D * T) { C.close += dt; if (C.close > 0.2) fail(C, 'Too close.'); } else C.close = 0;
      },
      hud(C) { const m = C.near == null ? 1e9 : C.near, lim = C.p.D * T; return { s: 'Keep your distance', f: Math.max(0, Math.min(1, (m - lim) / (lim * 2))), w: m < lim * 1.6 }; } },
    { id: 'doorwerken', name: 'Doorwerken', k: 1,
      make(t) { const S = [1.6, 1.1, 0.7][t - 1]; return { S, text: `Clear this room. Never stand still for ${S} seconds.` }; },
      tick(C, dt, P) {
        const mv = Math.hypot(P.x - C.lx, P.y - C.ly) > 22 * dt; C.lx = P.x; C.ly = P.y;
        if (mv || P.rootT > 0 || G.freeze > 0 || C.t < 0.8) C.idle = 0;
        else { C.idle += dt; if (C.idle > C.p.S) fail(C, 'Stood still.'); }
      },
      hud(C) { return { s: 'Keep moving', f: 1 - C.idle / C.p.S, w: C.idle > C.p.S * 0.5 }; } },
    { id: 'rangorde', name: 'Rangorde', k: 1, ok: (x) => x.n >= 2,
      make(t, x) { const K = Math.min(t, x.n); return { K, tier: K, text: K === 1 ? 'Kill the marked snake before anything else. Then clear the room.' : `Kill the ${K} numbered snakes first, in order. Then clear the room.` }; },
      start(C, room) { shuffle(live(room).filter((s) => !s.isBoss)).slice(0, C.p.K).forEach((s, i) => { s.ord24 = i + 1; s.ordC24 = C.id; }); C.next = 1; },
      kill(C, sn) {
        if (C.next > C.p.K) return;
        if (sn.ordC24 === C.id && sn.ord24 === C.next) { C.next++; floatText(sn.x, sn.y - 30, C.next > C.p.K ? 'OP VOLGORDE' : `${C.next - 1} / ${C.p.K}`, '#efe4cc'); }
        else fail(C, 'Wrong order.');
      },
      hud(C) { return C.next > C.p.K ? { s: 'Order kept. Clear the room', f: 1, ok: true } : { s: `Next: number ${C.next}`, f: (C.next - 1) / C.p.K }; } },
    { id: 'bulk', name: 'Bulkkorting', k: 1.05, ok: (x) => x.n >= 2,
      make(t) { const W = [6, 4.2, 3][t - 1]; return { W, text: `After your first kill, every next kill comes within ${W} seconds. Clear the room.` }; },
      kill(C) { C.lastK = C.t; },
      tick(C, dt, P, room) { if (!C.kills) return; if (!live(room).length) { C.lastK = C.t; return; } if (C.t - C.lastK > C.p.W) fail(C, 'The chain broke.'); },
      hud(C) { if (!C.kills) return { s: 'First kill starts the clock', f: 1 }; const r = Math.max(0, C.p.W - (C.t - C.lastK)); return { s: `Next kill in ${fmt(r)} s`, f: r / C.p.W, w: r < C.p.W * 0.35 }; } },
    { id: 'handwerk', name: 'Handwerk', k: 1.05,
      make(t, x) { const N = Math.min(x.n, t); return { N, tier: N, text: `Get ${pl(N, 'kill')} from up close, within two tiles. Clear the room.` }; },
      kill(C, sn, P) { if (dist(P.x, P.y, sn.x, sn.y) - sn.headR < 2 * T) { C.closeK++; if (C.closeK <= C.p.N) floatText(P.x, P.y - 34, 'HANDWERK', '#efe4cc'); } },
      clear(C) { return C.closeK >= C.p.N ? true : 'Not close enough.'; },
      hud(C) { return { s: `Close kills ${Math.min(C.closeK, C.p.N)} / ${C.p.N}`, f: Math.min(1, C.closeK / C.p.N), ok: C.closeK >= C.p.N }; } },
    { id: 'spoed', name: 'Spoedklus', k: 1,
      make(t) { const F = [8, 6, 4.5][t - 1]; return { F, text: `Kill your first snake within ${F} seconds. Then clear the room.` }; },
      tick(C) { if (!C.kills && C.t > C.p.F) fail(C, 'Too slow to start.'); },
      hud(C) { if (C.kills) return { s: 'Started. Clear the room', f: 1, ok: true }; const r = Math.max(0, C.p.F - C.t); return { s: `First kill in ${fmt(r)} s`, f: r / C.p.F, w: r < 2 }; } },
    { id: 'bedenktijd', name: 'Bedenktijd', k: 1,
      make(t) { const S = [2.5, 3.5, 4.5][t - 1]; return { S, text: `Do not shoot for the first ${S} seconds. Then clear the room.` }; },
      shot(C) { if (C.t < C.p.S) fail(C, 'Shot too early.'); },
      hud(C) { if (C.t >= C.p.S) return { s: 'Fire at will. Clear the room', f: 1, ok: true }; const r = C.p.S - C.t; return { s: `Hold fire ${fmt(r)} s`, f: r / C.p.S, w: true }; } },
    { id: 'bezuiniging', name: 'Bezuiniging', k: 0.85,
      make(t) { const X = [25, 40, 55][t - 1]; return { X, text: `Your seeds do ${X}% less damage in this room. Clear it anyway.` }; },
      dmg(C) { return 1 - C.p.X / 100; },
      hud(C, room) { return { s: `Seeds ${C.p.X}% weaker. ${live(room).length} left`, f: 1 }; } },
    { id: 'kruipen', name: 'Kruipsnelheid', k: 0.85,
      make(t) { const X = [15, 25, 35][t - 1]; return { X, text: `You move ${X}% slower in this room. Clear it anyway.` }; },
      speed(C) { return 1 - C.p.X / 100; },
      hud(C, room) { return { s: `Feet ${C.p.X}% slower. ${live(room).length} left`, f: 1 }; } },
    { id: 'overuren', name: 'Overuren', k: 0.95,
      make(t) { return { N: t, text: `${t === 1 ? 'One more snake joins' : `${t} more snakes join`} this fight. Clear the room.` }; },
      start(C, room, P) {
        const L = G.levelDef, pool = EXTRA_POOL[L.set] || EXTRA_POOL.cellar, used = new Set();
        for (let i = 0; i < C.p.N; i++) {
          const cell = Game.farCell(room, P, used); used.add(cell.r * COLS + cell.c);
          room.snakes.push(new Snake(pick(pool), cell.x, cell.y, { delay: 0.9 + i * 0.3, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
        }
      },
      hud(C, room) { return { s: `${live(room).length} left on the clock`, f: 1 }; } },
    { id: 'voetganger', name: 'Voetganger', k: 0.95, ok: (x) => !!x.P.dash,
      make(t) { const A = [9, 2, 1][t - 1]; return { A, text: t === 1 ? 'No dashing in this room. Clear it on foot.' : `No dashing in this room, and ${pl(A, 'bite')} at most.` }; },
      tick(C, dt, P) { if (P.dashT > 0) fail(C, 'You dashed.'); },
      bite(C) { if (C.bites > C.p.A) fail(C, 'Bitten.'); },
      hud(C) { return C.p.A > 8 ? { s: 'On foot. No dashing', f: 1 } : { s: `On foot. Bites ${C.bites} / ${C.p.A}`, f: 1 - C.bites / (C.p.A + 1), w: C.bites >= C.p.A }; } },
    { id: 'voorschot', name: 'Voorschot', k: 1, loan: true,
      make(t) { const A = [2, 1, 0][t - 1]; return { A, text: A ? `Take the money now. Clear this room with ${pl(A, 'bite')} at most, or pay it back twice.` : 'Take the money now. Clear this room without a bite, or pay it back twice.' }; },
      bite(C) { if (C.bites > C.p.A) fail(C, 'Bitten.'); },
      hud(C) { return { s: `Bites ${C.bites} / ${C.p.A}`, f: 1 - C.bites / (C.p.A + 1), w: C.bites >= C.p.A }; } },
  ];
  const CLID = Object.fromEntries(CL.map((d) => [d.id, d]));

  /* small print: one optional twist per contract */
  const FINE = [
    { id: 'btw', text: 'Including VAT. Stake and pay go up 21%.', stake: 1.21, pay: 1.21 },
    { id: 'dubbel', text: 'Double or nothing. Twice the stake, twice the pay.', stake: 2, pay: 2, noLoan: true },
    { id: 'garantie', text: 'Guarantee. Break it and half the stake comes back.', pay: 0.9, noLoan: true },
    { id: 'boete', text: 'Penalty clause. Break it and you also lose half an apple.', pay: 1.4 },
    { id: 'haast', text: 'Rush job. The snakes here move 12% faster.', pay: 1.35 },
    { id: 'geheim', text: 'Confidential. No counter on your screen.', pay: 1.3 },
    { id: 'proef', text: 'Trial period. No stake. Half the pay.', stake: 0, pay: 0.5, noLoan: true },
    { id: 'bonus', text: 'Performance bonus. No bites at all pays 5 more.' },
    { id: 'pakket', text: 'Benefits package. A whole apple on top. Pay drops 20%.', pay: 0.8 },
    { id: 'notaris', text: 'Notarised. Counts double for your reputation, both ways.' },
  ];
  const QUOTES = [
    'Sign here. And here. Not there.',
    'Read it or don\'t. Nobody does.',
    'The snakes do not know about this. Keep it that way.',
    'Standard terms. They favour me.',
    'No refunds. That part is in bold.',
    'I take a cut. You take the bites.',
    'Ink is cheap. Your reputation is not.',
    'Everything is negotiable. Not these.',
    'Fresh paperwork. Still warm.',
    'You look like someone who reads the small print. You are not.',
  ];

  /* ------------------------------------------------------------------ offers */
  function ctxOf(room, P) {
    const ls = live(room);
    return { room, P, n: ls.length, hp: ls.reduce((a, s) => a + Math.max(0, s.hp || 0), 0), dmg: safe(() => seedDmg(P), 1) };
  }
  function build(def, t, x, fine) {
    const p = def.make(t, x); if (p.tier) t = Math.max(1, Math.min(3, p.tier));
    const R = G.run, rep = R.rep24 || 0;
    const base = TIER[t].stake + Math.floor((G.levelIdx || 0) * 0.7);
    let stake = base, pay = base * TIER[t].pay * (def.k || 1) * (1 + 0.1 * rep), adv = 0;
    if (fine) { if (fine.stake != null) stake *= fine.stake; if (fine.pay) pay *= fine.pay; }
    stake = Math.round(stake); pay = Math.round(pay);
    if (def.loan) { adv = Math.max(3, Math.round(base * 1.6 * (fine && fine.pay ? fine.pay : 1))); stake = 0; pay = 0; }
    const no = `${String(rndi(100, 999))}-${'ABCDEFGHJKLMNPRSTUVWXZ'[rndi(0, 21)]}`;
    return { def, t, p, fine, stake, pay, adv, no, extra: def.loan ? '' : TIER[t].extra };
  }
  function offers(room, P) {
    const x = ctxOf(room, P);
    const defs = shuffle(CL.filter((d) => !d.ok || d.ok(x)));
    const tiers = shuffle([1, 2, 3]);
    const out = [];
    for (let i = 0; i < 3 && i < defs.length; i++) {
      const d = defs[i], fpool = FINE.filter((f) => !(d.loan && f.noLoan));
      const fine = Math.random() < 0.6 ? pick(fpool) : null;
      out.push(build(d, tiers[i], x, fine));
    }
    return out.sort((a, b) => a.t - b.t);
  }

  /* ------------------------------------------------------------------ art: De Makelaar, wax seals, the slip */
  function drawBroker(c, S, t) {
    const u = S / 100;
    c.save(); c.clearRect(0, 0, S, S); c.scale(u, u); c.lineJoin = 'round'; c.lineCap = 'round';
    c.fillStyle = '#17130f'; c.fillRect(0, 0, 100, 100);
    // office window behind him, with his name on the glass
    c.fillStyle = '#252019'; c.fillRect(5, 5, 90, 56);
    c.strokeStyle = '#3d342a'; c.lineWidth = 1.4; c.strokeRect(5, 5, 90, 56); c.beginPath(); c.moveTo(50, 5); c.lineTo(50, 61); c.stroke();
    c.save(); c.font = `600 7px ${DISPLAY}`; c.fillStyle = 'rgba(232,212,160,0.22)'; c.textAlign = 'center'; c.fillText('MAKELAAR', 27, 14); c.fillText('& ZONEN', 73, 14); c.restore();
    const g = c.createRadialGradient(84, 18, 1, 84, 18, 46); g.addColorStop(0, 'rgba(255,210,130,0.32)'); g.addColorStop(1, 'rgba(255,210,130,0)'); c.fillStyle = g; c.fillRect(0, 0, 100, 100);
    const bob = Math.sin(t * 1.6) * 0.7;
    // suit
    c.fillStyle = '#2a2e38';
    c.beginPath(); c.moveTo(20, 100); c.lineTo(25, 72); c.quadraticCurveTo(28, 63, 37, 61); c.lineTo(63, 61); c.quadraticCurveTo(72, 63, 75, 72); c.lineTo(80, 100); c.closePath(); c.fill();
    c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 0.6; for (let x = 18; x < 84; x += 4) { c.beginPath(); c.moveTo(x, 58); c.lineTo(x + 2, 100); c.stroke(); } c.restore();
    c.fillStyle = '#e9e2d2'; c.beginPath(); c.moveTo(41, 61); c.lineTo(59, 61); c.lineTo(50, 86); c.closePath(); c.fill();
    c.fillStyle = '#1d2028';
    c.beginPath(); c.moveTo(37, 61); c.lineTo(42, 61); c.lineTo(50, 86); c.lineTo(41, 74); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(63, 61); c.lineTo(58, 61); c.lineTo(50, 86); c.lineTo(59, 74); c.closePath(); c.fill();
    c.fillStyle = '#a81e2c'; c.beginPath(); c.moveTo(48, 65); c.lineTo(52, 65); c.lineTo(53.5, 70); c.lineTo(50, 84); c.lineTo(46.5, 70); c.closePath(); c.fill();
    c.fillStyle = '#7e1420'; c.fillRect(47.6, 61.5, 4.8, 4);
    c.fillStyle = '#e8c45a'; c.fillRect(36, 76, 1.6, 4); // a pen in the breast pocket
    // neck
    c.strokeStyle = '#3f7430'; c.lineWidth = 13; c.beginPath(); c.moveTo(50, 66); c.quadraticCurveTo(47, 54, 50, 44 + bob); c.stroke();
    c.fillStyle = 'rgba(20,40,14,0.35)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(47 + (i % 2) * 5, 49 + i * 3.6, 1.1, 0, TAU); c.fill(); }
    // head
    c.save(); c.translate(0, bob);
    c.fillStyle = '#4f8c3a'; c.beginPath(); c.ellipse(50, 35, 18, 13, 0, 0, TAU); c.fill();
    c.fillStyle = '#3c6e2c'; c.beginPath(); c.ellipse(50, 30, 16, 8, 0, Math.PI, TAU); c.fill();
    c.fillStyle = '#76b257'; c.beginPath(); c.ellipse(50, 42, 11.5, 6.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#1c3012'; c.beginPath(); c.arc(46.5, 40, 0.9, 0, TAU); c.fill(); c.beginPath(); c.arc(53.5, 40, 0.9, 0, TAU); c.fill();
    // eyes behind round glasses
    const blink = (t % 4.3) > 4.12;
    for (const ex of [42, 58]) {
      if (blink) { c.strokeStyle = '#1c3012'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - 3.5, 33); c.lineTo(ex + 3.5, 33); c.stroke(); }
      else { c.fillStyle = '#e9d23e'; c.beginPath(); c.ellipse(ex, 33, 3.8, 3.4, 0, 0, TAU); c.fill(); c.fillStyle = '#0d0a06'; c.fillRect(ex - 0.6, 30, 1.2, 6); }
      c.fillStyle = 'rgba(200,228,255,0.16)'; c.beginPath(); c.arc(ex, 33, 6.4, 0, TAU); c.fill();
      c.strokeStyle = '#d8b04a'; c.lineWidth = 1.3; c.beginPath(); c.arc(ex, 33, 6.4, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.arc(ex, 33, 4.6, -2.4, -1.6); c.stroke();
    }
    c.strokeStyle = '#d8b04a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(48.4, 32.5); c.quadraticCurveTo(50, 31, 51.6, 32.5); c.stroke();
    // a thin smile, up on one side
    c.strokeStyle = '#1c3012'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(42, 44.5); c.quadraticCurveTo(50, 46.5, 57, 43.6); c.lineTo(58.4, 42.2); c.stroke();
    // the tongue flicks now and then
    const tk = t % 2.7;
    if (tk < 0.32) {
      const L = 5 + Math.sin((tk / 0.32) * Math.PI) * 5;
      c.strokeStyle = '#d43a48'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(50, 46); c.lineTo(50, 46 + L); c.lineTo(48.4, 48 + L); c.moveTo(50, 46 + L); c.lineTo(51.6, 48 + L); c.stroke();
    }
    // bowler hat
    c.fillStyle = '#121216'; c.beginPath(); c.ellipse(50, 24.5, 17, 3.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(39, 24); c.quadraticCurveTo(39, 11, 50, 11); c.quadraticCurveTo(61, 11, 61, 24); c.closePath(); c.fill();
    c.fillStyle = '#4a1a20'; c.fillRect(39.2, 20.5, 21.6, 2.6);
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.ellipse(45, 15, 3, 1.4, -0.5, 0, TAU); c.fill();
    c.restore();
    // desk, papers, and the tail holding a fountain pen
    c.fillStyle = '#4a2e1c'; c.fillRect(0, 88, 100, 12); c.fillStyle = '#6a4428'; c.fillRect(0, 88, 100, 1.6);
    c.save(); c.translate(17, 85); c.rotate(-0.08); c.fillStyle = '#e8dcc0'; c.fillRect(-10, -3, 22, 6); c.fillStyle = '#d8c8a4'; c.fillRect(-8, -5, 22, 5);
    c.strokeStyle = 'rgba(60,40,20,0.45)'; c.lineWidth = 0.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6, -3.6 + i * 1.3); c.lineTo(10, -3.6 + i * 1.3); c.stroke(); } c.restore();
    const sw = Math.sin(t * 2.2) * 1.5;
    c.strokeStyle = '#3f7430'; c.lineWidth = 6; c.beginPath(); c.moveTo(77, 100); c.quadraticCurveTo(92, 92, 86, 78 + sw); c.quadraticCurveTo(83, 72 + sw, 88, 70 + sw); c.stroke();
    c.strokeStyle = '#0e0e12'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(84, 76 + sw); c.lineTo(95, 61 + sw); c.stroke();
    c.fillStyle = '#e8c45a'; c.beginPath(); c.moveTo(94, 62 + sw); c.lineTo(98, 56 + sw); c.lineTo(96, 63.5 + sw); c.closePath(); c.fill();
    c.restore();
  }
  function seal(c, x, y, r, t, ang = 0) {
    const T_ = TIER[t];
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.arc(r * 0.06, r * 0.1, r, 0, TAU); c.fill();
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    g.addColorStop(0, T_.hi); g.addColorStop(0.55, T_.band); g.addColorStop(1, T_.wax);
    c.fillStyle = g; c.beginPath();
    for (let i = 0; i <= 28; i++) { const a = (i / 28) * TAU, rr = r * (1 + 0.07 * Math.sin(i * 2.3) + 0.04 * Math.sin(i * 5.1)); i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = Math.max(0.8, r * 0.07); c.beginPath(); c.arc(0, 0, r * 0.7, 0, TAU); c.stroke();
    c.font = `800 ${Math.round(r * (T_.n.length > 2 ? 0.62 : 0.8))}px ${DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillText(T_.n, -r * 0.03, r * 0.02);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillText(T_.n, r * 0.03, r * 0.08);
    c.restore();
  }
  function stamp(c, x, y, text, col, k, a) {
    c.save(); c.translate(x, y); c.rotate(-0.16); c.scale(k, k); c.globalAlpha *= a;
    c.font = `800 22px ${DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const w = c.measureText(text).width + 18;
    c.strokeStyle = col; c.lineWidth = 2.6; c.strokeRect(-w / 2, -15, w, 30); c.lineWidth = 1; c.strokeRect(-w / 2 + 3.5, -11.5, w - 7, 23);
    c.fillStyle = col; c.fillText(text, 0, 1.5);
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 18; i++) { const sx = Math.sin(i * 12.9898) * 43758.5453 % 1, sy = Math.sin(i * 78.233) * 12543.21 % 1; c.fillRect(sx * w * 0.5, sy * 13, 1.6, 1.6); }
    c.restore();
  }

  /* the slip on the HUD while a contract runs */
  function drawSlip(c, C) {
    const P = G.player, room = G.room; if (!P || !room) return;
    const age = C.state === 'live' ? 0 : G.t - C.endT;
    if (age > 3.4) return;
    const W = Math.min(258, View.W - 24), H = 50;
    let x = (View.W - W) / 2, y = 8;
    if (View.portrait) y = Math.min(View.H - H - 8, View.oy + VIEW_H * View.s + 8);
    const leave = Math.max(0, age - 2.7) / 0.7;
    y -= leave * 20;
    const enter = Math.min(1, (G.t - C.t0) / 0.25);
    c.save(); c.globalAlpha = Math.min(enter, 1 - leave);
    c.translate(x + W / 2, y + H / 2); c.rotate(-0.012); c.translate(-W / 2, -H / 2);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(3, 4, W, H);
    c.fillStyle = '#ece0c4'; c.fillRect(0, 0, W, H);
    c.fillStyle = TIER[C.tier].band; c.fillRect(0, 0, W, 3);
    c.strokeStyle = 'rgba(80,58,30,0.25)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, W - 1, H - 1);
    seal(c, 24, H / 2 + 1, 15, C.tier, -0.2);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#2b1f14'; c.font = `700 17px ${DISPLAY}`; c.fillText(C.def.name, 46, 20);
    const h = safe(() => C.def.hud(C, room), { s: '', f: 1 }) || { s: '', f: 1 };
    const hidden = C.fine && C.fine.id === 'geheim' && C.state === 'live';
    c.font = `600 12px ${HUD_FONT}`; c.fillStyle = h.w && !hidden && Math.sin(G.t * 10) > 0 ? '#b0202e' : '#5a4630';
    c.fillText(hidden ? 'Confidential' : h.s, 46, 36);
    // pay, top right
    const payTxt = C.def.loan ? `owe ${C.adv * 2}` : `+${C.pay}`;
    c.textAlign = 'right'; c.font = `700 13px ${HUD_FONT}`; c.fillStyle = C.def.loan ? '#8a2a20' : '#7a5a08'; c.fillText(payTxt, W - 10, 19);
    if (!C.def.loan) coinIcon(c, W - 16 - c.measureText(payTxt).width, 14.5, 3.6);
    c.font = `600 10px ${HUD_FONT}`; c.fillStyle = 'rgba(60,40,20,0.55)'; c.fillText(`NR. ${C.no}`, W - 10, 35);
    // progress
    if (!hidden) {
      const bx = 46, bw = W - 56, by = H - 8;
      c.fillStyle = 'rgba(60,40,20,0.14)'; c.fillRect(bx, by, bw, 3);
      c.fillStyle = h.ok ? '#3a7a2a' : h.w ? '#b0202e' : '#2b1f14'; c.fillRect(bx, by, bw * clamp(h.f == null ? 1 : h.f, 0, 1), 3);
      if (h.mark) { c.fillStyle = '#b0202e'; c.fillRect(bx + bw * h.mark - 0.5, by - 2, 1.2, 7); }
    }
    // the stamp lands when it ends, a small one when it starts
    if (C.state !== 'live') {
      const k = 1 + Math.max(0, 1 - age / 0.16) * 1.4;
      stamp(c, W * 0.62, H / 2, C.state === 'won' ? 'VOLDAAN' : 'NIETIG', C.state === 'won' ? '#2e7a2a' : '#b0202e', k * 0.85, Math.min(1, age / 0.08));
    } else if (G.t - C.t0 < 1.4) {
      const a2 = G.t - C.t0, k = 1 + Math.max(0, 1 - a2 / 0.16) * 1.2;
      stamp(c, W * 0.66, H / 2, 'GETEKEND', '#2b4a8a', k * 0.62, Math.min(1, a2 / 0.08) * Math.min(1, (1.4 - a2) / 0.4));
    }
    c.restore();
  }
  /* marks in the room: the circle, the numbered tags, the distance ring */
  function drawWorld(c, C) {
    const P = G.player, room = G.room, t = G.t;
    const k = View.s * View.dpr;
    c.save(); c.setTransform(k, 0, 0, k, (View.ox + WALL * View.s) * View.dpr, (View.oy + WALL * View.s) * View.dpr);
    const id = C.def.id, band = TIER[C.tier].band;
    if (id === 'thuiswerk') {
      const out = C.t >= 3 && dist(P.x, P.y, C.p.cx, C.p.cy) > C.p.R;
      c.fillStyle = out ? 'rgba(200,40,40,0.08)' : 'rgba(236,224,196,0.07)'; c.beginPath(); c.arc(C.p.cx, C.p.cy, C.p.R, 0, TAU); c.fill();
      c.strokeStyle = out ? 'rgba(255,80,70,0.85)' : band; c.lineWidth = 2; c.setLineDash([7, 6]); c.lineDashOffset = -t * 14;
      c.beginPath(); c.arc(C.p.cx, C.p.cy, C.p.R, 0, TAU); c.stroke(); c.setLineDash([]);
      c.font = `700 9px ${HUD_FONT}`; c.textAlign = 'center'; c.fillStyle = out ? 'rgba(255,90,80,0.9)' : 'rgba(236,224,196,0.7)'; c.fillText('KANTOOR', C.p.cx, C.p.cy - C.p.R - 5);
    }
    if (id === 'afstand' || id === 'handwerk') {
      const r = id === 'afstand' ? P.r + C.p.D * T : 2 * T;
      const warn = id === 'afstand' && C.near != null && C.near < C.p.D * T * 1.6;
      c.strokeStyle = warn ? `rgba(255,80,70,${0.5 + 0.4 * Math.sin(t * 14)})` : id === 'afstand' ? 'rgba(236,224,196,0.25)' : 'rgba(236,224,196,0.18)';
      c.lineWidth = 1.4; c.setLineDash([4, 5]); c.lineDashOffset = t * 10; c.beginPath(); c.arc(P.x, P.y, r, 0, TAU); c.stroke(); c.setLineDash([]);
    }
    if (id === 'rangorde') {
      for (const s of room.snakes) {
        if (s.ordC24 !== C.id || !s.alive || s.dying > 0 || s.burrowed || s.ord24 < C.next) continue;
        const nx = s.x, ny = s.y - s.headR - 15, nextUp = s.ord24 === C.next;
        c.save(); c.translate(nx, ny + Math.sin(t * 4 + s.ord24) * 1.5); c.rotate(-0.12);
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-7, -7, 15, 15);
        c.fillStyle = '#ece0c4'; c.fillRect(-8, -8, 15, 15);
        c.strokeStyle = nextUp ? band : 'rgba(80,58,30,0.5)'; c.lineWidth = nextUp ? 2 : 1; c.strokeRect(-8, -8, 15, 15);
        c.fillStyle = '#2b1f14'; c.font = `800 12px ${DISPLAY}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(C.p.K === 1 ? '!' : String(s.ord24), -0.5, 0.5);
        c.restore();
        if (nextUp) { c.strokeStyle = `rgba(236,224,196,${0.35 + 0.25 * Math.sin(t * 6)})`; c.lineWidth = 1.2; c.beginPath(); c.arc(s.x, s.y, s.headR + 7, 0, TAU); c.stroke(); }
      }
    }
    c.restore();
  }

  /* ------------------------------------------------------------------ the office: DOM panel */
  const css = document.createElement('style');
  css.textContent = `
#contract24 { overflow-y: auto; justify-content: flex-start; gap: 0; padding-block: 14px; }
#contract24 .ct-inner { width: 100%; max-width: 940px; margin-block: auto; display: flex; flex-direction: column; gap: 10px; text-align: left; }
#contract24 .ct-head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; border-bottom: 2px solid #d9a520; padding-bottom: 9px; }
#contract24 .ct-por { width: 58px; height: 58px; display: block; border: 1px solid rgba(236, 226, 212, .2); border-radius: 2px; }
#contract24 .ct-who { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
#contract24 .ct-who .kick { color: #d9a520; font-size: 11px; letter-spacing: .26em; }
#contract24 .ct-who h2 { font-size: clamp(28px, 7vw, 38px); line-height: .95; }
#contract24 .ct-quote { margin: 0; font: italic 500 13.5px/1.25 var(--ui); color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#contract24 .ct-side { display: grid; grid-template-columns: auto auto; gap: 4px 8px; align-items: center; justify-items: end; }
#contract24 .ct-chip { display: inline-flex; align-items: center; gap: 6px; font: 700 15px/1 var(--ui); font-variant-numeric: tabular-nums; color: var(--ink); background: rgba(255, 255, 255, .04); border: 1px solid var(--line); border-radius: 2px; padding: 5px 8px; white-space: nowrap; }
#contract24 .ct-chip small { font: 600 10px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
#contract24 .ct-chip .coin { width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff2a0, #f2c230 55%, #a87a08); box-shadow: 0 0 0 1px #6a4a04; }
#contract24 .ct-rep { gap: 7px; }
#contract24 .ct-rep i { display: inline-flex; gap: 3px; font-style: normal; }
#contract24 .ct-rep i b { width: 8px; height: 8px; transform: rotate(45deg); border: 1px solid #d9a520; display: block; }
#contract24 .ct-rep i b.on { background: #d9a520; box-shadow: 0 0 6px rgba(217, 165, 32, .6); }
#contract24 .ct-tally { grid-column: 1 / -1; margin: 0; font: 600 11px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
#contract24 .ct-tally b { color: #8fe07a; font-weight: 700; } #contract24 .ct-tally em { color: #ff8a7a; font-style: normal; font-weight: 700; }
#contract24 .ct-intro { margin: 0; font: 500 13px/1.35 var(--ui); color: var(--muted); border-left: 2px solid #d9a520; padding: 2px 0 2px 9px; }
#contract24 .ct-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
#contract24 .ct-card { --paper: #ece0c4; --ink24: #2b1f14; --soft: rgba(60, 40, 20, .62); --rule: rgba(90, 64, 30, .26);
  position: relative; overflow: hidden; background: var(--paper); color: var(--ink24); border-top: 4px solid var(--band); border-radius: 2px; padding: 10px 11px 9px;
  display: flex; flex-direction: column; gap: 7px; box-shadow: 0 8px 22px rgba(0, 0, 0, .45); transition: transform .16s, box-shadow .16s;
  background-image: repeating-linear-gradient(0deg, rgba(90, 64, 30, .06) 0 1px, transparent 1px 19px); }
#contract24 .ct-card.t1 { --paper: #ead6b8; }
#contract24 .ct-card.t2 { --paper: #e4e3dd; --soft: rgba(44, 48, 58, .62); --rule: rgba(60, 66, 80, .24); background-image: repeating-linear-gradient(0deg, rgba(60, 66, 80, .06) 0 1px, transparent 1px 19px); }
#contract24 .ct-card.t3 { --paper: #f1e4bd; box-shadow: 0 8px 22px rgba(0, 0, 0, .45), inset 0 0 0 1px rgba(217, 165, 32, .9), inset 0 0 0 4px rgba(241, 228, 189, 1), inset 0 0 0 5px rgba(217, 165, 32, .55); }
#contract24 .ct-card::after { content: attr(data-n); position: absolute; right: -4px; bottom: -18px; font: 800 110px/1 var(--display); color: var(--band); opacity: .1; pointer-events: none; }
#contract24 .ct-card > * { position: relative; z-index: 1; }
#contract24 .ct-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(0, 0, 0, .55); }
#contract24 .ct-card.t3:hover { box-shadow: 0 14px 30px rgba(0, 0, 0, .55), inset 0 0 0 1px rgba(217, 165, 32, .9), inset 0 0 0 4px rgba(241, 228, 189, 1), inset 0 0 0 5px rgba(217, 165, 32, .55); }
#contract24 .ct-card.poor { filter: grayscale(.75); opacity: .6; }
#contract24 .ct-h { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 8px; align-items: center; }
#contract24 .ct-seal { width: 40px; height: 40px; display: block; }
#contract24 .ct-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
#contract24 .ct-card h3 { margin: 0; font: 800 23px/1 var(--display); color: var(--ink24); letter-spacing: 0; text-transform: none; }
#contract24 .ct-sub { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; font: 600 10px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: var(--soft); }
#contract24 .ct-kind { color: #fff6e6; background: var(--kind); padding: 2px 5px 2px; border-radius: 1px; letter-spacing: .14em; }
#contract24 .ct-key { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 52px; padding: 5px 6px; border: 1.5px solid var(--kind); border-radius: 2px; color: var(--kind); background: rgba(255, 255, 255, .35); }
#contract24 .ct-key svg { width: 17px; height: 17px; }
#contract24 .ct-key b { font: 700 13px/1 var(--ui); font-variant-numeric: tabular-nums; white-space: nowrap; letter-spacing: .02em; }
#contract24 .ct-clause { margin: 0; font: 500 14.5px/1.28 var(--ui); color: var(--ink24); }
#contract24 .ct-money { margin: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-block: 1px solid var(--rule); }
#contract24 .ct-money div { display: flex; flex-direction: column; gap: 3px; padding: 6px 0 6px 7px; border-left: 1px dashed var(--rule); min-width: 0; }
#contract24 .ct-money div:first-child { border-left: 0; padding-left: 0; }
#contract24 .ct-money dt { font: 600 9px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--soft); white-space: nowrap; }
#contract24 .ct-money dd { margin: 0; font: 700 17px/1 var(--ui); font-variant-numeric: tabular-nums; color: var(--ink24); display: flex; align-items: center; gap: 4px; white-space: nowrap; }
#contract24 .ct-money dd i { width: 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff2a0, #f2c230 55%, #a87a08); box-shadow: 0 0 0 1px #6a4a04; display: inline-block; flex: none; }
#contract24 .ct-money dd.up { color: #2e6a22; } #contract24 .ct-money dd.down { color: #9a2a20; }
#contract24 .ct-money dd small { font: 600 10px/1 var(--ui); color: var(--soft); letter-spacing: .04em; }
#contract24 .ct-risk { display: flex; gap: 2px; align-items: center; }
#contract24 .ct-risk u { width: 6px; height: 11px; background: var(--rule); text-decoration: none; display: block; }
#contract24 .ct-risk u.on { background: var(--rc); }
#contract24 .ct-risk-l { font: 700 10px/1 var(--ui) !important; letter-spacing: .08em !important; text-transform: uppercase; color: var(--rc) !important; }
#contract24 .ct-perks { margin: 0; display: flex; flex-wrap: wrap; gap: 4px; }
#contract24 .ct-perk { display: inline-flex; align-items: center; gap: 4px; font: 700 10.5px/1 var(--ui); letter-spacing: .08em; text-transform: uppercase; color: var(--ink24); border: 1px solid var(--rule); background: rgba(255, 255, 255, .3); border-radius: 1px; padding: 3px 5px; }
#contract24 .ct-perk svg { width: 11px; height: 11px; }
#contract24 .ct-perk.gold { color: #7a5408; border-color: rgba(168, 122, 8, .55); background: rgba(255, 220, 120, .3); }
#contract24 .ct-perk.heal { color: #8a1e2c; border-color: rgba(168, 30, 44, .4); }
#contract24 .ct-perk.rep { color: var(--soft); }
#contract24 .ct-fine { margin: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 7px; align-items: baseline; font: 500 12px/1.28 var(--ui); color: var(--soft); }
#contract24 .ct-ftag { font: 700 9.5px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--fc); border: 1.5px solid var(--fc); padding: 3px 5px 2px; border-radius: 1px; white-space: nowrap; transform: rotate(-2deg); background: rgba(255, 255, 255, .25); }
#contract24 .ct-fine.none .ct-ftag { --fc: rgba(60, 40, 20, .45); }
#contract24 .ct-foot2 { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 9px; align-items: end; margin-top: auto; padding-top: 2px; }
#contract24 .ct-brk { position: relative; display: flex; flex-direction: column; gap: 2px; padding-bottom: 5px; border-bottom: 1px solid rgba(43, 31, 20, .5); min-width: 0; min-height: 30px; justify-content: flex-end; }
#contract24 .ct-brk span { font: 500 11.5px/1.2 var(--ui); color: var(--ink24); }
#contract24 .ct-brk span b { font: 700 9px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: #9a2a20; margin-right: 4px; }
#contract24 .ct-brk svg { position: absolute; left: 0; right: 0; bottom: 1px; width: 100%; height: 22px; overflow: visible; pointer-events: none; }
#contract24 .ct-brk path { fill: none; stroke: #1c2c6a; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 400; stroke-dashoffset: 400; }
#contract24 .ct-card.signed .ct-brk path { animation: ctInk .5s ease-out forwards; }
@keyframes ctInk { to { stroke-dashoffset: 0; } }
#contract24 .ct-go { min-height: 38px; font-size: 13px; padding: 0 12px; letter-spacing: .12em; background: var(--ink24); color: var(--paper); border-color: var(--ink24); border-radius: 2px; white-space: nowrap; }
#contract24 .ct-go:hover { background: #4a3420; border-color: #4a3420; }
#contract24 .ct-go:disabled { background: transparent; color: var(--soft); border-color: var(--rule); cursor: default; }
#contract24 .ct-go:focus-visible { outline: 2px solid var(--ink24); outline-offset: 3px; }
#contract24 kbd { font: 700 10px/1 var(--ui); border: 1px solid currentColor; border-radius: 2px; padding: 2px 4px; margin-left: 6px; opacity: .7; }
#contract24 .ct-stampel { position: absolute; z-index: 3; left: 50%; top: 46%; transform: translate(-50%, -50%) rotate(-12deg) scale(2); opacity: 0; pointer-events: none;
  font: 800 28px/1 var(--display); color: #2b4a8a; border: 3px double #2b4a8a; padding: 4px 12px; letter-spacing: .04em; background: rgba(236, 224, 196, .35); }
#contract24 .ct-card.signed .ct-stampel { animation: ctStamp .22s .38s ease-in forwards; }
@keyframes ctStamp { to { opacity: .9; transform: translate(-50%, -50%) rotate(-12deg) scale(1); } }
#contract24 .ct-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
#contract24 .ct-none { min-height: 40px; font-size: 13px; }
#contract24 .ct-hint { margin: 0; font: 500 12px/1.3 var(--ui); color: var(--faint); }
@media (min-width: 761px) {
  #contract24 .ct-card.t1 { transform: rotate(-.6deg); } #contract24 .ct-card.t3 { transform: rotate(.4deg); }
  #contract24 .ct-card:hover { transform: translateY(-3px) rotate(0); }
}
@media (max-width: 760px) {
  #contract24 .ct-cards { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  #contract24 .ct-card { gap: 6px; padding: 9px 10px 8px; }
  #contract24 .ct-clause { font-size: 14px; }
  #contract24 .ct-money dd { font-size: 16px; }
  #contract24 .ct-money div { padding-block: 5px; }
  #contract24 .ct-intro { font-size: 12.5px; }
  #contract24 .ct-head { grid-template-columns: auto minmax(0, 1fr); gap: 10px; }
  #contract24 .ct-side { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 6px; }
  #contract24 .ct-tally { flex-basis: auto; align-self: center; margin-left: auto; }
  #contract24 .ct-por { width: 50px; height: 50px; }
  #contract24 .ct-hint { display: none; }
  #contract24 .ct-none { width: 100%; }
  #contract24 kbd { display: none; }
}
@media (orientation: landscape) and (max-height: 560px) {
  #contract24 .ct-intro, #contract24 .ct-quote { display: none; }
  #contract24 .ct-clause { font-size: 13.5px; }
}
@media (prefers-reduced-motion: reduce) { #contract24 .ct-card, #contract24 .ct-card.signed .ct-brk path, #contract24 .ct-card.signed .ct-stampel { animation-duration: .01s !important; transition: none; } }
`;
  document.head.appendChild(css);
  const sec = document.createElement('section');
  sec.id = 'contract24'; sec.className = 'panel scrim'; sec.hidden = true; sec.setAttribute('aria-label', 'Contracten');
  sec.innerHTML = `<div class="ct-inner">
    <header class="ct-head">
      <canvas class="ct-por" aria-hidden="true"></canvas>
      <div class="ct-who"><p class="kick">Makelaar &amp; Zonen</p><h2>Contracten</h2><p class="ct-quote"></p></div>
      <div class="ct-side"><span class="ct-chip"><span class="coin" aria-hidden="true"></span><b class="ct-coins"></b><small>coins</small></span><span class="ct-chip ct-rep" title="Reputation"><small>Rep</small><i></i><em></em></span><p class="ct-tally"></p></div>
    </header>
    <p class="ct-intro" hidden>Sign one contract for this fight, or none. You pay the stake now. Keep the terms until the room is clear and you get paid. Break them and the stake stays here.</p>
    <div class="ct-cards"></div>
    <footer class="ct-foot"><button type="button" class="btn ct-none">Sign nothing<kbd>Esc</kbd></button><p class="ct-hint">The fight waits. Sign with 1, 2 or 3. Net is pay minus stake.</p></footer>
  </div>`;
  (document.getElementById('app') || document.body).appendChild(sec);
  const $ = (q) => sec.querySelector(q);
  const SCRIBS = ['M4 22 C 14 4, 20 30, 30 14 S 44 6, 48 20 C 52 30, 60 4, 70 16 S 86 26, 96 10 L 120 14',
    'M6 18 C 12 6, 18 6, 20 20 C 22 30, 34 2, 40 18 C 44 26, 52 10, 62 14 C 72 18, 80 6, 92 20 L 118 12',
    'M4 14 Q 16 30, 26 8 T 50 18 Q 58 26, 66 10 C 74 2, 84 28, 98 14 L 124 18'];
  let rafId = 0, OFF = [], busy = false;

  /* every clause gets an icon, a kind, a key number and a plain line on what breaks it */
  const IC = {
    clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.4 1.6"/>',
    tooth: '<path d="M4.2 2.8c1.4-.9 2.4 0 3.8 0s2.4-.9 3.8 0c1.5 1.2.9 3.9-.1 5.4L11 12.8c-.3.9-1.2.9-1.4 0L8.6 9.8H7.4l-1 3c-.2.9-1.1.9-1.4 0L4.3 8.2c-1-1.5-1.6-4.2-.1-5.4z"/>',
    seed: '<path d="M8 2c3 3 3 9 0 12C5 11 5 5 8 2z"/><path d="M8 5v6"/>',
    target: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r=".8" fill="currentColor"/>',
    ring: '<circle cx="8" cy="8" r="6" stroke-dasharray="2.2 1.8"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/>',
    gap: '<path d="M2 8h12M2 4.5v7M14 4.5v7M5 6l-2 2 2 2M11 6l2 2-2 2"/>',
    move: '<path d="M1.5 10.5c2-4 4-4 6.5 0s4.5 4 6.5 0"/><path d="M12 7.6l2.5 2.9-3.4.6"/>',
    order: '<path d="M7 4h7M7 8h7M7 12h7"/><circle cx="3.4" cy="4" r="1" fill="currentColor"/><circle cx="3.4" cy="8" r="1" fill="currentColor"/><circle cx="3.4" cy="12" r="1" fill="currentColor"/>',
    chain: '<rect x="1.5" y="5.5" width="7.5" height="5" rx="2.5"/><rect x="7" y="5.5" width="7.5" height="5" rx="2.5"/>',
    fist: '<path d="M1.5 8h4.5M4 5.5L6.5 8 4 10.5M14.5 8H10M12 5.5L9.5 8l2.5 2.5"/>',
    bolt: '<path d="M9.2 1.5L3.8 9h4l-1 5.5L12.2 7h-4z"/>',
    glass: '<path d="M4 2h8M4 14h8M5 2c0 4 6 3.5 6 6s-6 2-6 6M11 2c0 4-6 3.5-6 6s6 2 6 6"/>',
    weak: '<path d="M8 2c3 3 3 7 0 9.5C5 9 5 5 8 2z"/><path d="M4 14l8-12"/>',
    snail: '<path d="M1.5 12.5h11.5c.9 0 1.5-.8 1.5-2"/><circle cx="7" cy="8" r="3.6"/><path d="M7 8a1.3 1.3 0 1 1 1.3-1.3"/><path d="M12.5 10.5V7.5M14.5 10.5l.5-3"/>',
    plus: '<path d="M5.5 3v7M2 6.5h7"/><path d="M9 12c1.5-2 3.5-2 5 0"/><circle cx="11.5" cy="7" r="1.6"/>',
    boot: '<path d="M5 2v7.2L2.5 12v2h11v-1.3c0-1.1-1-1.7-2.6-2.1L8.5 10V2z"/><path d="M5 5h3.5"/>',
    loan: '<ellipse cx="8" cy="4.6" rx="5" ry="2"/><path d="M3 4.6v3.2c0 1.1 2.2 2 5 2s5-.9 5-2V4.6M3 7.8V11c0 1.1 2.2 2 5 2s5-.9 5-2V7.8"/>',
    apple: '<path d="M8 5c-1.6-1.2-5-1.2-5 2.6C3 11 5.4 14 8 13.2 10.6 14 13 11 13 7.6 13 3.8 9.6 3.8 8 5z"/><path d="M8 5c0-1.6.6-2.6 1.8-3"/>',
    star: '<path d="M8 1.8l1.8 4 4.3.4-3.3 2.9 1 4.3L8 11.2 4.2 13.4l1-4.3L1.9 6.2l4.3-.4z"/>',
    diamond: '<path d="M8 1.5L14.5 8 8 14.5 1.5 8z"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;
  const KIND = { tempo: ['Tempo', '#a8402a'], clean: ['Clean', '#2a6284'], aim: ['Aim', '#5e3f8e'], place: ['Position', '#2a6e4c'], order: ['Order', '#7e5a08'], cuts: ['Handicap', '#6e3a34'], loan: ['Loan', '#8a2a20'] };
  const META = {
    snelrecht: { ic: 'clock', kind: 'tempo', d: 0, key: (p) => `${p.T} s`, brk: 'The clock runs out.' },
    schadevrij: { ic: 'tooth', kind: 'clean', d: 0, key: (p) => (p.A ? `${p.A} max` : 'zero'), brk: (p) => (p.A ? `Bite number ${p.A + 1}.` : 'The first bite.') },
    zuinig: { ic: 'seed', kind: 'aim', d: 0, key: (p) => `${p.N} shots`, brk: (p) => `Shot number ${p.N + 1}.` },
    trefzeker: { ic: 'target', kind: 'aim', d: 0, key: (p) => `${p.X}%`, brk: (p) => `Hit rate under ${p.X}% when the room clears.` },
    thuiswerk: { ic: 'ring', kind: 'place', d: 0.5, key: (p) => `${(p.R / T).toFixed(1)} t`, brk: 'Half a second outside the circle.' },
    afstand: { ic: 'gap', kind: 'place', d: 0.5, key: (p) => `${p.D} t`, brk: 'A head gets inside the ring.' },
    doorwerken: { ic: 'move', kind: 'place', d: 0, key: (p) => `${p.S} s`, brk: (p) => `Standing still for ${p.S} s.` },
    rangorde: { ic: 'order', kind: 'order', d: 0, key: (p) => (p.K === 1 ? 'mark' : `1 to ${p.K}`), brk: 'Killing the wrong snake first.' },
    bulk: { ic: 'chain', kind: 'tempo', d: 0.5, key: (p) => `${p.W} s`, brk: (p) => `${p.W} s pass without a kill.` },
    handwerk: { ic: 'fist', kind: 'place', d: 0, key: (p) => `${p.N} close`, brk: 'Room clears with too few close kills.' },
    spoed: { ic: 'bolt', kind: 'tempo', d: -0.5, key: (p) => `${p.F} s`, brk: 'No kill when the clock runs out.' },
    bedenktijd: { ic: 'glass', kind: 'tempo', d: -0.5, key: (p) => `${p.S} s`, brk: 'One seed before the clock ends.' },
    bezuiniging: { ic: 'weak', kind: 'cuts', d: -0.5, key: (p) => `-${p.X}%`, brk: 'Nothing. Just dying in there.' },
    kruipen: { ic: 'snail', kind: 'cuts', d: -0.5, key: (p) => `-${p.X}%`, brk: 'Nothing. Just dying in there.' },
    overuren: { ic: 'plus', kind: 'cuts', d: 0, key: (p) => `+${p.N}`, brk: 'Nothing. Just dying in there.' },
    voetganger: { ic: 'boot', kind: 'clean', d: 0, key: (p) => (p.A > 8 ? 'no dash' : `${p.A} bite`), brk: (p) => (p.A > 8 ? 'One dash.' : `One dash, or bite number ${p.A + 1}.`) },
    voorschot: { ic: 'loan', kind: 'loan', d: 0, key: (p) => (p.A ? `${p.A} max` : 'zero'), brk: (p) => (p.A ? `Bite number ${p.A + 1}.` : 'The first bite.') },
  };
  const FTAG = {
    btw: ['BTW 21%', '#6a5a2a', 0], dubbel: ['Dubbel of niks', '#9a2a20', 0.6], garantie: ['Garantie', '#2a6e4c', -0.5], boete: ['Boeteclausule', '#9a2a20', 0.5],
    haast: ['Spoedtoeslag', '#a8402a', 0.8], geheim: ['Vertrouwelijk', '#3a3a5a', 0.4], proef: ['Proeftijd', '#2a6284', -0.6], bonus: ['Prestatiebonus', '#7e5a08', 0],
    pakket: ['Pakket', '#8a1e2c', 0], notaris: ['Notarieel', '#3a3a5a', 0.3],
  };
  const RISK = ['', 'Easy', 'Fair', 'Tight', 'Hard', 'Brutal'], RISKC = ['', '#2e6a22', '#5a6a22', '#9a6a10', '#a8402a', '#9a1a20'];
  function riskOf(o) {
    const m = META[o.def.id] || { d: 0 }, f = o.fine && FTAG[o.fine.id] ? FTAG[o.fine.id][2] : 0;
    return Math.max(1, Math.min(5, Math.round(o.t + 0.6 + m.d + f)));
  }
  function paintRep() {
    const R = G.run, rep = R.rep24 || 0;
    $('.ct-rep i').innerHTML = Array.from({ length: 5 }, (_, i) => `<b class="${i < rep ? 'on' : ''}"></b>`).join('');
    $('.ct-rep em').textContent = rep ? `+${rep * 10}%` : '';
    const k = R.ctWon24 || 0, l = R.ctLost24 || 0;
    $('.ct-tally').innerHTML = k || l ? `This run <b>${k} kept</b> <em>${l} broken</em>` : 'First deal this run';
  }
  function cardHTML(o, i) {
    const T_ = TIER[o.t], d = o.def, R = G.run, m = META[d.id] || { ic: 'star', kind: 'cuts', key: () => '', brk: 'The terms.' };
    const poor = !d.loan && o.stake > (R.coins || 0), K = KIND[m.kind] || KIND.cuts;
    const risk = riskOf(o), rc = RISKC[risk];
    const pips = Array.from({ length: 5 }, (_, j) => `<u class="${j < risk ? 'on' : ''}"></u>`).join('');
    const riskCell = `<div style="--rc:${rc}"><dt>Risk</dt><dd><span class="ct-risk">${pips}</span></dd><dd class="ct-risk-l">${RISK[risk]}</dd></div>`;
    let money;
    if (d.loan) money = `<div><dt>Now</dt><dd class="up"><i></i>+${o.adv}</dd></div><div><dt>Break, owe</dt><dd class="down">${o.adv * 2}</dd></div><div><dt>Keep</dt><dd class="up">free</dd></div>${riskCell}`;
    else {
      const net = o.pay - o.stake, roi = o.stake ? `${(o.pay / o.stake).toFixed(1)}x` : 'free';
      money = `<div><dt>Stake</dt><dd><i></i>${o.stake}</dd></div><div><dt>Pay</dt><dd><i></i>${o.pay}</dd></div><div><dt>Net</dt><dd class="${net >= 0 ? 'up' : 'down'}">${net >= 0 ? '+' : ''}${net} <small>${roi}</small></dd></div>${riskCell}`;
    }
    const perks = [];
    if (!d.loan && o.t === 2) perks.push(`<span class="ct-perk heal">${svg('apple')}+ half an apple</span>`);
    if (!d.loan && o.t === 3) perks.push(R.ctItemFloor24 === G.levelIdx ? `<span class="ct-perk gold">${svg('star')}+10 coins, powerup used</span>` : `<span class="ct-perk gold">${svg('star')}+ a powerup</span>`);
    if (o.fine && o.fine.id === 'bonus') perks.push(`<span class="ct-perk gold">${svg('diamond')}+5 with no bites</span>`);
    if (o.fine && o.fine.id === 'pakket') perks.push(`<span class="ct-perk heal">${svg('apple')}+ a whole apple</span>`);
    const nk = o.fine && o.fine.id === 'notaris' ? 2 : 1, rep = R.rep24 || 0;
    perks.push(`<span class="ct-perk rep">${svg('diamond')}Rep ${rep >= 5 ? 'max' : '+' + nk} / -${2 * nk}</span>`);
    const ft = o.fine && FTAG[o.fine.id];
    const fine = o.fine ? `<p class="ct-fine" style="--fc:${ft ? ft[1] : '#6a5a2a'}"><span class="ct-ftag">${ft ? ft[0] : 'Small print'}</span><span>${o.fine.text}</span></p>`
      : '<p class="ct-fine none"><span class="ct-ftag">No small print</span><span>Clean paper. Suspicious.</span></p>';
    let cost = d.loan ? `pay back ${o.adv * 2}` : o.stake ? `lose ${o.stake}` : 'lose nothing';
    if (o.fine && o.fine.id === 'garantie' && o.stake) cost = `${Math.ceil(o.stake / 2)} of ${o.stake} back`;
    if (o.fine && o.fine.id === 'boete') cost += ', half an apple';
    const brk = typeof m.brk === 'function' ? m.brk(o.p) : m.brk;
    return `<article class="ct-card t${o.t}${poor ? ' poor' : ''}" data-n="${T_.n}" style="--band:${T_.band};--kind:${K[1]}">
      <header class="ct-h"><canvas class="ct-seal" aria-hidden="true"></canvas>
        <div class="ct-t"><h3>${d.name}</h3><span class="ct-sub"><span class="ct-kind">${K[0]}</span><span>${T_.name}</span><span>Nr. ${o.no}</span></span></div>
        <span class="ct-key" title="${d.name}">${svg(m.ic)}<b>${m.key(o.p)}</b></span></header>
      <p class="ct-clause">${o.p.text}</p>
      <dl class="ct-money">${money}</dl>
      <p class="ct-perks">${perks.join('')}</p>
      ${fine}
      <div class="ct-foot2"><span class="ct-brk"><span><b>Breaks</b>${brk}</span><span><b>Then</b>${cost}.</span><svg viewBox="0 0 130 22" preserveAspectRatio="none" aria-hidden="true"><path d="${SCRIBS[i % 3]}" transform="translate(0,-4) scale(1,.9)"/></svg></span>
      <button type="button" class="btn ct-go" data-i="${i}" ${poor ? 'disabled' : ''}>${poor ? 'Short on coins' : 'Sign'}<kbd>${i + 1}</kbd></button></div>
      <span class="ct-stampel" aria-hidden="true">GETEKEND</span>
    </article>`;
  }
  function open(room) {
    const P = G.player;
    OFF = offers(room, P);
    if (!OFF.length) return;
    G.run.ctFloorN24 = (G.run.ctFloorN24 || 0) + 1; G.run.ctCool24 = 1;
    G.state = 'contract'; busy = false;
    safe(() => Input.reset()); safe(() => UI.hideOverlays()); safe(() => { UI.el.btnPause.hidden = true; });
    $('.ct-quote').textContent = pick(QUOTES);
    $('.ct-coins').textContent = G.run.coins || 0;
    $('.ct-intro').hidden = !!Save.data.settings.ctSeen24;
    paintRep();
    const box = $('.ct-cards'); box.innerHTML = OFF.map(cardHTML).join('');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    box.querySelectorAll('.ct-seal').forEach((cv, i) => { cv.width = cv.height = Math.round(40 * dpr); const c = cv.getContext('2d'); c.scale(dpr, dpr); seal(c, 20, 20, 16, OFF[i].t, -0.25 + i * 0.2); });
    box.querySelectorAll('.ct-go').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); sign(+b.dataset.i); }));
    sec.hidden = false; sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter');
    const por = $('.ct-por'); por.width = por.height = Math.round(58 * dpr);
    const pc = por.getContext('2d'), t0 = performance.now();
    Sched.cancel(rafId);
    const loop = () => { if (sec.hidden) return; safe(() => drawBroker(pc, por.width, (performance.now() - t0) / 1000)); rafId = Sched.raf(loop); };
    loop();
    safe(() => { Sfx.noise(0.18, { filter: 'bandpass', f: 2400, q: 0.7, vol: 0.05 }); Sfx.tone(392, 0.12, { vol: 0.04 }); });
    Meta.add('contractOffers');
    setTimeout(() => { const b = sec.querySelector('.ct-go:not(:disabled)') || $('.ct-none'); if (b) b.focus({ preventScroll: true }); }, 60);
  }
  function close() {
    sec.hidden = true; Sched.cancel(rafId);
    if (G.state === 'contract') { G.state = 'play'; safe(() => { UI.el.btnPause.hidden = false; }); }
    safe(() => Input.reset());
    safe(() => View.cv.focus({ preventScroll: true }));
  }
  function sign(i) {
    if (busy) return;
    const o = OFF[i]; if (!o) return;
    const R = G.run, P = G.player, room = G.room;
    const card = sec.querySelectorAll('.ct-card')[i];
    if (!o.def.loan && o.stake > (R.coins || 0)) { safe(() => Sfx.thud()); return; }
    busy = true;
    R.coins -= o.stake;
    if (o.def.loan) R.coins += o.adv;
    $('.ct-coins').textContent = R.coins;
    if (card) card.classList.add('signed');
    sec.querySelectorAll('.ct-go').forEach((b) => { b.disabled = true; });
    safe(() => { Sfx.noise(0.35, { filter: 'bandpass', f: 3400, q: 0.6, vol: 0.05, attack: 0.05 }); });
    setTimeout(() => safe(() => { Sfx.thud(); Sfx.tone(220, 0.12, { to: 160, vol: 0.06 }); }), 400);
    Save.data.settings.ctSeen24 = true; safe(() => Save.store());
    setTimeout(() => {
      close();
      if (G.room !== room) return;
      const C = { id: NEXT_ID++, def: o.def, tier: o.t, t: 0, p: o.p, fine: o.fine, stake: o.stake, pay: o.pay, adv: o.adv, no: o.no, room, run: R, state: 'live',
        t0: G.t, bites: 0, h0: R.roomHits || 0, shots: 0, seeds: 0, hits: 0, kills: 0, lastK: 0, idle: 0, out: 0, close: 0, closeK: 0, next: 1, lx: P.x, ly: P.y, near: null };
      CUR = C;
      safe(() => o.def.start && o.def.start(C, room, P));
      Meta.add('contracts');
      if (o.def.loan) floatText(P.x, P.y - 34, `+${o.adv} VOORSCHOT`, '#ffd84a', true);
    }, 820);
  }
  sec.querySelector('.ct-none').addEventListener('click', (e) => { e.preventDefault(); decline(); });
  function decline() { if (busy) return; close(); safe(() => Sfx.tone(300, 0.1, { to: 220, vol: 0.04 })); }
  window.addEventListener('keydown', (e) => {
    if (sec.hidden || G.state !== 'contract') return;
    if (e.key === 'Escape' || e.key === '0' || e.key === 'n' || e.key === 'N') { e.preventDefault(); e.stopPropagation(); decline(); }
    else if (e.key >= '1' && e.key <= '3') { e.preventDefault(); e.stopPropagation(); sign(+e.key - 1); }
  }, true);

  /* ------------------------------------------------------------------ settling up */
  function resolve(C, ok, why) {
    if (!C || C.state !== 'live') return;
    C.state = ok ? 'won' : 'lost'; C.endT = G.t; C.why = why;
    const P = G.player, room = C.room, R = G.run; if (!P || !R) return;
    const nk = C.fine && C.fine.id === 'notaris' ? 2 : 1;
    if (ok) {
      R.rep24 = Math.min(5, (R.rep24 || 0) + nk); R.ctWon24 = (R.ctWon24 || 0) + 1;
      let pay = C.pay;
      if (C.fine && C.fine.id === 'bonus' && C.bites === 0) pay += 5;
      if (pay > 0) { R.coins += pay; floatText(P.x, P.y - 40, `+${pay}`, '#ffd84a', true); burst(P.x, P.y, 14, '#ffd84a', { min: 40, max: 140, lmin: 0.4, lmax: 0.8, glow: true }); }
      if (!C.def.loan && C.tier === 2) dropHeart(room, P.x, P.y, 1);
      if (!C.def.loan && C.tier === 3) {
        if (R.ctItemFloor24 !== G.levelIdx) { R.ctItemFloor24 = G.levelIdx; const c = nearestFreeCell(room, RW / 2, RH / 2); spawnItem(room, c.x, c.y, 0.1); }
        else { R.coins += 10; floatText(P.x, P.y - 58, '+10', '#ffd84a'); }
      }
      if (C.fine && C.fine.id === 'pakket') dropHeart(room, P.x, P.y, 2);
      Meta.add('contractsWon');
      safe(() => { Sfx.thud(); Sfx.tone(660, 0.16, { to: 990, vol: 0.06 }); setTimeout(() => safe(() => Sfx.register()), 160); });
      UI.banner(`${C.def.name}: voldaan`, C.def.loan ? 'You keep the advance. The Makelaar is almost pleased.' : `${pay} coins paid out${C.tier > 1 ? ' and a bit more' : ''}. Pleasure doing business.`);
    } else {
      R.rep24 = Math.max(0, (R.rep24 || 0) - 2 * nk); R.ctLost24 = (R.ctLost24 || 0) + 1;
      let msg = 'The stake stays here.';
      if (C.def.loan) {
        const owe = C.adv * 2, paid = Math.min(R.coins || 0, owe); R.coins -= paid;
        if (paid < owe) { msg = `You paid ${paid} of ${owe}. The rest becomes a debt.`; safe(() => giveCurse('gokschuld')); }
        else msg = `You paid back ${owe}.`;
        floatText(P.x, P.y - 40, `-${paid}`, '#ff8a6a', true);
      }
      if (C.fine && C.fine.id === 'garantie' && C.stake > 0) { const back = Math.ceil(C.stake / 2); R.coins += back; msg = `Half the stake comes back: ${back}.`; }
      if (C.fine && C.fine.id === 'boete' && P.hp > 1) { P.hp -= 1; safe(() => P.bites.push({ a: BITE_ANGLES[P.bites.length % BITE_ANGLES.length], t: G.t })); msg += ' The penalty costs half an apple.'; }
      G.shake = Math.max(G.shake, 4);
      safe(() => { Sfx.thud(); Sfx.tone(180, 0.22, { to: 110, vol: 0.07 }); });
      UI.banner(`${C.def.name}: nietig`, `${why} ${msg}`, 'curse');
    }
    floatText(P.x, P.y - 24, ok ? 'VOLDAAN' : 'NIETIG', ok ? '#8fe07a' : '#ff6a5a', true);
  }

  /* ------------------------------------------------------------------ hooks */
  const cb0 = combat9;
  combat9 = function (room) {
    cb0(room);
    safe(() => {
      const R = G.run, P = G.player;
      if (!R || !P || room.type !== 'fight' || rushy() || OPTS_OFF()) return;
      R.ctFights24 = (R.ctFights24 || 0) + 1;
      if (R.ctFights24 < 2 || (R.ctFloorN24 || 0) >= 3) return;
      if (R.ctCool24 > 0) { R.ctCool24--; return; }
      if (Math.random() > (R.ctAny24 ? 0.32 : 0.6)) return;
      R.ctAny24 = true;
      PEND = { room, run: R };
    });
  };
  const OPTS_OFF = () => !!(Save.data && Save.data.settings && Save.data.settings.contracts === false);
  const fl0 = floor9;
  floor9 = function (P) { fl0(P); if (G.run) G.run.ctFloorN24 = 0; };
  const up0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) {
    up0(P, dt, room, sp);
    safe(() => {
      if (PEND) {
        if (PEND.run !== G.run || PEND.room !== room) PEND = null;
        else if (!G.trans && G.state === 'play' && !(P.dying > 0) && !CUR_LIVE()) { const r = PEND.room; PEND = null; open(r); return; }
      }
      const C = CUR; if (!C) return;
      if (C.run !== G.run) { CUR = null; return; }
      if (C.state !== 'live') { if (G.t - C.endT > 3.6) CUR = null; return; }
      if (C.room !== room) { C.state = 'lost'; C.endT = G.t; CUR = null; return; }
      C.t += dt;
      const h = G.run.roomHits || 0;
      if (h > C.h0) { C.bites += h - C.h0; C.h0 = h; if (C.def.bite) C.def.bite(C); if (C.state !== 'live') return; }
      if (C.def.tick) C.def.tick(C, dt, P, room);
    });
  };
  const CUR_LIVE = () => !!(CUR && CUR.state === 'live' && CUR.run === G.run);
  const fi0 = fire9;
  fire9 = function (P, base) { fi0(P, base); safe(() => { if (CUR_LIVE() && P === G.player) { CUR.shots++; if (CUR.def.shot) CUR.def.shot(CUR); } }); };
  const sd0 = seed9;
  seed9 = function (P, s, o) { sd0(P, s, o); if (CUR_LIVE() && P === G.player && s) { s.ct24 = CUR.id; CUR.seeds++; } };
  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) { ht0(room, s, sn, dmg); if (CUR_LIVE() && s && s.ct24 === CUR.id && !s.ctHit24) { s.ctHit24 = true; CUR.hits++; } };
  const ok0 = onKill9;
  onKill9 = function (sn, room, P) {
    ok0(sn, room, P);
    safe(() => { if (!CUR_LIVE() || CUR.room !== room) return; CUR.kills++; if (CUR.def.kill) CUR.def.kill(CUR, sn, P || G.player); });
  };
  const cl0 = clearRoom9;
  clearRoom9 = function (room) {
    cl0(room);
    safe(() => {
      if (!CUR_LIVE() || CUR.room !== room) return;
      const r = CUR.def.clear ? CUR.def.clear(CUR) : true;
      resolve(CUR, r === true, r === true ? '' : r);
    });
  };
  const hm0 = hurtMod9;
  hurtMod9 = function (sn, amount, fx, fy, isPoison) {
    amount = hm0(sn, amount, fx, fy, isPoison);
    if (CUR_LIVE() && CUR.def.dmg && G.room === CUR.room) amount *= CUR.def.dmg(CUR);
    return amount;
  };
  const sk0 = speedK9;
  speedK9 = function (P, room) { let k = sk0(P, room); if (CUR_LIVE() && CUR.def.speed && room === CUR.room) k *= CUR.def.speed(CUR); return k; };
  const ss0 = snakeSpeed9;
  snakeSpeed9 = function (sn, P) { let k = ss0(sn, P); if (CUR_LIVE() && CUR.fine && CUR.fine.id === 'haast' && !sn.isBoss) k *= 1.12; return k; };
  const rr0 = renderRoom;
  renderRoom = function (c, L) { rr0(c, L); if (CUR && CUR.state === 'live' && G.room === CUR.room) safe(() => drawWorld(c, CUR)); };
  const rh0 = renderHUD;
  renderHUD = function (c, L) {
    rh0(c, L);
    if (!CUR || G.state === 'pause' || G.room !== CUR.room) return;
    safe(() => { c.save(); c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0); drawSlip(c, CUR); c.restore(); });
  };

  /* ------------------------------------------------------------------ texts, guide, settings */
  for (const s of ['VOLDAAN', 'NIETIG', 'GETEKEND', 'VOORSCHOT', 'HANDWERK', 'OP VOLGORDE', 'KANTOOR']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    if (!Array.isArray(TEXT_LIT9.messages)) return;
    for (const q of QUOTES.concat(['Clean paper. Suspicious.', 'Nothing. Just dying in there.'])) if (!TEXT_LIT9.messages.includes(q)) TEXT_LIT9.messages.push(q);
    for (const d of CL) try { const tx = d.make(2, { n: 3, hp: 30, dmg: 1, room: G.room || { obs: [], snakes: [] }, P: { dash: true } }); if (tx && tx.text && !TEXT_LIT9.messages.includes(tx.text)) TEXT_LIT9.messages.push(tx.text); } catch (e) { /* needs a real room */ }
    for (const f of FINE) if (!TEXT_LIT9.messages.includes(f.text)) TEXT_LIT9.messages.push(f.text);
  });
  safe(() => {
    const tab = document.getElementById('tab-rooms'); if (!tab || tab.querySelector('.ct-guide')) return;
    const h = document.createElement('h3'); h.textContent = 'Contracten'; h.className = 'ct-guide';
    const ul = document.createElement('ul'); ul.className = 'rules';
    const li = (t) => { const e = document.createElement('li'); e.textContent = t; ul.appendChild(e); };
    li('Before some fights De Makelaar offers three contracts: Brons, Zilver and Goud. Sign one or none. The fight waits.');
    li('You pay the stake when you sign. Keep the terms until the room is clear and you get paid. Zilver adds half an apple, Goud a powerup (one per floor).');
    li(`There are ${CL.length} kinds of terms: a time limit, no bites, few shots, good aim, stay in the circle, keep your distance, keep moving, kill in order, keep the kills coming, kill up close, start fast, hold fire, weak seeds, slow feet, extra snakes, no dashing, and a loan.`);
    li(`Small print changes the deal: VAT, double or nothing, a guarantee, a penalty, a rush job, a secret counter, a trial, a bonus, an extra apple, a notary. ${FINE.length} kinds.`);
    li('Kept contracts build your reputation, up to five. Every point pays 10% more. A broken one costs two.');
    li('A loan pays now. Break it and you pay back twice. Cannot pay? It becomes a debt.');
    li('Every contract shows its kind (Tempo, Clean, Aim, Position, Order, Handicap, Loan), the key number, stake, pay, net, a risk meter from Easy to Brutal, and exactly what breaks it and what that costs.');
    tab.appendChild(h); tab.appendChild(ul);
  });
  safe(() => {
    const tab = document.getElementById('tab-basics'); const tips = tab && tab.querySelector('.tips9'); if (!tips || tips.querySelector('.ct-tip')) return;
    const d = document.createElement('div'); d.className = 'tip9 ct-tip';
    d.innerHTML = '<b>Paperwork</b><span>Sometimes a snake in a bowler hat has a contract for the next fight. Signing is optional. Reading is too, apparently.</span>';
    tips.appendChild(d);
  });

  safe(() => {
    if (typeof SETTING_KEYS === 'object') SETTING_KEYS.contracts = true;
    const box = UI.el.toggles; if (!box || box.querySelector('[data-set="contracts"]')) return;
    const b = document.createElement('button'); b.className = 'tog'; b.type = 'button'; b.setAttribute('role', 'switch'); b.dataset.set = 'contracts';
    b.innerHTML = '<span><b>Contracten</b><small>De Makelaar offers contracts before some fights. Off and he stays in his office.</small></span><i></i>';
    b.addEventListener('click', (e) => { e.preventDefault(); UI.flip('contracts'); });
    box.appendChild(b); UI.paintSettings();
  });

  function force(id, t = 2, fineId) { const room = G.room, P = G.player; const o = build(CLID[id], t, ctxOf(room, P), FINE.find((f) => f.id === fineId) || null); OFF = [o]; G.state = 'contract'; sec.hidden = false; busy = false; sign(0); return o; }
  Object.assign(window.__bitten || (window.__bitten = {}), { CT24: { force, CL, FINE, TIER, offers, open, sign, decline, resolve, get cur() { return CUR; }, get pend() { return PEND; }, drawBroker, seal, cardHTML, META, build, ctxOf } });
})();

