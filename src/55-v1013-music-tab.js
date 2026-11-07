/* src/55-v1013-music-tab.js: v10.13: the Music tab. From v10.13. Lines 24221 to 24588 of the v13.7 script. */
/* ===== v10.13: the Music tab. Every song in the game, one card each, the parts of a song inside it ===== */
(function () {
  'use strict';
  const root = document.getElementById('jukebox'); if (!root) return;
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe55'); console.error(e); return fb; } };
  const BR = BittenRemix;
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const BAR = BR.BAR, LEAD = BR.SECTIONS[0].start;

  /* ------------------------------------------------------------------ the songs */
  const SONGS = [
    { id: 'waltz', name: 'Rotten Waltz', tag: 'Bite Remix', where: 'The main theme. It follows every run: calm between rooms, the drop in a fight, the break when you are almost eaten.',
      col: '#d7263d', acc: '#e3a54a', kind: 'remix', dur: BR.DURATION,
      parts: BR.SECTIONS.map((s) => ({ id: s.id, name: s.name, from: s.start, to: s.end })) },
    { id: 'box', name: 'Music Box Waltz', tag: 'The original', where: 'The first song, in A minor on a music box. Plays on the menu with Music turned off.',
      col: '#e3a54a', acc: '#f2e6cf', kind: 'box', loop: true },
    { id: 'club', name: 'Club Mix', tag: 'DJ Manu-Beau', where: 'His set in the club. Every attack lands on the beat, so learn the drop.',
      col: '#ff3ad8', acc: '#3ae0ff', kind: 'club', loop: true },
    { id: 'hell', name: 'Hellclub Mix', tag: 'Devil DJ Manu-Beau', where: 'The afterparty from hell. Twelve percent faster, overdriven, hotter.',
      col: '#ff3a2a', acc: '#ffb43a', kind: 'hell', loop: true },
    { id: 'wals', name: 'Rotten Waltz', tag: 'Ultra Hard Remix', where: 'De Wals brings its own track. It moves in threes, and so does this.',
      col: '#9a5aff', acc: '#ffd23a', kind: 'wals' },
    { id: 'death', name: 'Game Over', tag: 'Epic Remix', where: 'The same chords, played when something finally eats you.',
      col: '#8a2a3a', acc: '#d8c8b0', kind: 'death', dur: window.__deathSong ? window.__deathSong.dur : 30 },
    { id: 'floors', name: 'Floor Hum', tag: 'Ambience', where: 'The low drone under every floor. Each floor hums in its own key.',
      col: '#3aa89a', acc: '#9fe8d8', kind: 'drone', loop: true,
      parts: [['cellar', 'Cellar'], ['halls', 'Halls'], ['market', 'Supermarket'], ['kamer', 'Chamber'], ['garden', 'Garden']].map(([id, name]) => ({ id, name })) },
  ];

  /* ------------------------------------------------------------------ the look */
  const css = `
#how #jukebox { display: flex; flex-direction: column; gap: 12px; }
#how .mbar13 { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
#how .mbar13 p { margin: 0; font-size: 15px; color: var(--muted); }
#how .rep13 { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 12px; border: 1px solid var(--line); border-radius: 3px;
  font: 600 13px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
#how .rep13 svg { width: 14px; height: 14px; }
#how .rep13[aria-pressed="true"] { color: #fff4ec; border-color: var(--apple); background: rgba(215, 38, 61, .16); }
#how .rep13:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#how .songs13 { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 6px; align-items: start; }
#how .song13 { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 12px; align-items: start; padding: 8px 10px 10px 8px;
  border: 1px solid var(--edge13, var(--line)); border-radius: 3px; background: linear-gradient(90deg, var(--tint13) 0%, rgba(255,255,255,.015) 60%); transition: border-color .2s, background .2s; }
#how .song13.on { border-color: var(--col13); background: linear-gradient(90deg, var(--tintOn13) 0%, rgba(255,255,255,.02) 75%); }
#how .art13 { all: unset; box-sizing: border-box; position: relative; width: 76px; height: 76px; border-radius: 3px; cursor: pointer; box-shadow: 0 0 0 1px var(--edge13); overflow: hidden; }
#how .art13 canvas { width: 76px; height: 76px; display: block; }
#how .art13 .pb13 { position: absolute; right: 5px; bottom: 5px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(12, 8, 7, .72); border: 1px solid var(--col13); color: var(--ink); transition: background .2s, transform .15s; }
#how .art13 .pb13 svg { width: 10px; height: 10px; }
#how .art13:hover .pb13 { transform: scale(1.08); }
#how .song13.on .pb13 { background: var(--col13); color: #fff; }
#how .art13:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#how .song13.load .art13 { opacity: .6; }
#how .txt13 { min-width: 0; display: flex; flex-direction: column; gap: 3px; padding-top: 2px; }
#how .txt13 .k13 { font: 600 11px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; color: var(--acc13); }
#how .txt13 b { font: 800 21px/1 var(--display); color: var(--ink); }
#how .txt13 .w13 { font-size: 14px; line-height: 1.3; color: var(--muted); }
#how .meta13 { display: flex; align-items: center; gap: 8px; margin-top: 4px; font: 600 12px/1 var(--ui); letter-spacing: .1em; color: var(--faint); font-variant-numeric: tabular-nums; }
#how .bar13 { position: relative; flex: 1; height: 3px; border-radius: 2px; background: rgba(236, 226, 212, .1); overflow: hidden; }
#how .bar13 i { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: var(--col13); border-radius: 2px; }
#how .bar13 u { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(12, 8, 7, .9); }
#how .bar13.live i { width: 100%; opacity: .35; animation: hum13 1.6s ease-in-out infinite; }
@keyframes hum13 { 50% { opacity: .9; } }
#how .parts13 { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
#how .parts13 button { all: unset; box-sizing: border-box; cursor: pointer; min-height: 28px; padding: 0 9px; display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 3px;
  font: 600 12px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); transition: background .2s, border-color .2s, color .2s; }
#how .parts13 button:hover { border-color: var(--edge13); color: var(--ink); }
#how .parts13 button.on { color: #fff4ec; border-color: var(--col13); background: var(--tintOn13); }
#how .parts13 button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { #how .bar13.live i { animation: none; opacity: .6; } }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ------------------------------------------------------------------ the pictures: same fade and twist as the snakes */
  function bg13(c, w, h, S) {
    c.fillStyle = '#100b09'; c.fillRect(0, 0, w, h);
    const R = Math.max(w, h);
    const g = c.createRadialGradient(w * 0.55, h * 0.48, 0, w * 0.55, h * 0.48, R * 0.8);
    g.addColorStop(0, rgba(S.col, 0.5)); g.addColorStop(0.55, rgba(S.col, 0.14)); g.addColorStop(1, rgba(S.col, 0));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const lg = c.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, rgba(S.acc, 0)); lg.addColorStop(0.45, rgba(S.acc, 0.1 + i * 0.05)); lg.addColorStop(1, rgba(S.acc, 0));
      c.strokeStyle = lg; c.lineWidth = h * (0.34 - i * 0.1);
      c.beginPath(); c.moveTo(-w * 0.1, h * 0.98); c.bezierCurveTo(w * 0.3, h * 0.25, w * 0.62, h * 1.05, w * 1.1, h * 0.15); c.stroke();
    }
    c.restore();
    const v = c.createRadialGradient(w * 0.5, h * 0.5, R * 0.28, w * 0.5, h * 0.5, R * 0.74);
    v.addColorStop(0, 'rgba(12,8,7,0)'); v.addColorStop(1, 'rgba(12,8,7,0.78)');
    c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  function note13(c, x, y, r, col) {
    c.fillStyle = col; ell(c, x, y, r, r * 0.75, -0.4); c.fill();
    c.strokeStyle = col; c.lineWidth = r * 0.35; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + r * 0.85, y - r * 0.2); c.lineTo(x + r * 0.85, y - r * 3); c.quadraticCurveTo(x + r * 1.8, y - r * 2.5, x + r * 2.1, y - r * 1.6); c.stroke();
  }
  function vinyl13(c, x, y, r, spin, label, hot) {
    c.fillStyle = '#0c0a0e'; circle(c, x, y, r);
    c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 0.8;
    for (let k = 0.45; k < 0.95; k += 0.12) { c.beginPath(); c.arc(x, y, r * k, 0, TAU); c.stroke(); }
    c.strokeStyle = rgba(hot || '#ffffff', 0.35); c.lineWidth = 1.4;
    c.beginPath(); c.arc(x, y, r * 0.8, spin, spin + 0.9); c.stroke();
    c.beginPath(); c.arc(x, y, r * 0.62, spin + Math.PI, spin + Math.PI + 0.7); c.stroke();
    c.fillStyle = label; circle(c, x, y, r * 0.32);
    c.fillStyle = '#0c0a0e'; circle(c, x, y, r * 0.06);
  }
  const ART = {
    waltz(c, w, h, t, on) {
      const b = on ? Math.sin(t * TAU * BR.BPM / 60) * 1.2 : 0;
      c.save(); c.translate(w * 0.44, h * 0.56 + b);
      const g = c.createRadialGradient(-6, -7, 2, 0, 0, 20); g.addColorStop(0, '#ff7a6e'); g.addColorStop(0.45, '#d92a40'); g.addColorStop(1, '#6e0b1d');
      applePath(c, 17); c.fillStyle = g; c.fill();
      c.save(); applePath(c, 17); c.clip();
      c.fillStyle = '#f6e9cb'; circle(c, 18, -3, 7.5); circle(c, 16, -11, 4.5); circle(c, 19.5, 4.5, 4.5);
      c.fillStyle = 'rgba(255,255,255,0.4)'; ell(c, -8, -7, 4, 2.4, -0.7); c.fill();
      c.restore();
      applePath(c, 17); c.strokeStyle = '#2b070f'; c.lineWidth = 1.6; c.stroke();
      c.strokeStyle = '#3d2414'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -10); c.lineTo(2, -17); c.stroke();
      leafShape(c, 1.5, -15, 9, -0.4);
      c.restore();
      note13(c, w * 0.76, h * 0.4 - (on ? Math.abs(Math.sin(t * 3)) * 3 : 0), 3.4, '#ffd9a0');
    },
    box(c, w, h, t, on) {
      const cx = w * 0.48, cy = h * 0.6;
      c.fillStyle = '#5a3418'; rrect(c, cx - 20, cy - 8, 40, 20, 3); c.fill();
      c.fillStyle = '#7a4a24'; rrect(c, cx - 20, cy - 8, 40, 6, 2); c.fill();
      c.strokeStyle = '#e3a54a'; c.lineWidth = 1; rrect(c, cx - 15, cy - 1, 30, 9, 2); c.stroke();
      c.save(); c.translate(cx, cy - 8); c.rotate(-0.55); c.fillStyle = '#6a3e1c'; rrect(c, -20, -16, 40, 16, 3); c.fill(); c.fillStyle = 'rgba(255,240,200,0.12)'; rrect(c, -16, -13, 32, 10, 2); c.fill(); c.restore();
      const a = on ? t * 3 : 0.6;
      c.strokeStyle = '#d8c8a0'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx + 20, cy + 2); c.lineTo(cx + 25, cy + 2); c.stroke();
      c.beginPath(); c.moveTo(cx + 25, cy + 2); c.lineTo(cx + 25 + Math.cos(a) * 6, cy + 2 + Math.sin(a) * 6); c.stroke();
      c.fillStyle = '#e3a54a'; circle(c, cx + 25 + Math.cos(a) * 6, cy + 2 + Math.sin(a) * 6, 1.8);
      for (let i = 0; i < 3; i++) { const u = on ? (t * 0.5 + i / 3) % 1 : 0.2 + i * 0.25; c.globalAlpha = on ? 1 - u : 0.9; note13(c, cx - 6 + i * 9, cy - 16 - u * 16, 2.4, '#f2e6cf'); }
      c.globalAlpha = 1;
    },
    club(c, w, h, t, on) {
      vinyl13(c, w * 0.48, h * 0.52, 24, on ? t * 4 : 0.4, '#ff3ad8', '#3ae0ff');
      c.fillStyle = '#ffffff'; c.font = `800 6px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MB', w * 0.48, h * 0.52);
      c.strokeStyle = '#c8c8d0'; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(w * 0.86, h * 0.14); c.lineTo(w * 0.82, h * 0.52); c.lineTo(w * 0.66, h * 0.62); c.stroke();
      c.fillStyle = '#3ae0ff'; circle(c, w * 0.86, h * 0.14, 3);
    },
    hell(c, w, h, t, on) {
      const cx = w * 0.48, cy = h * 0.56;
      for (const [x, s] of [[-14, 0.9], [0, 1.15], [14, 0.9]]) {
        const f = on ? 1 + Math.sin(t * 12 + x) * 0.08 : 1;
        flameShape(c, cx + x, cy - 8, 7 * s, 18 * s * f); c.fillStyle = '#e8341a'; c.fill();
        flameShape(c, cx + x, cy - 4, 3.6 * s, 9 * s * f); c.fillStyle = '#ffb43a'; c.fill();
      }
      vinyl13(c, cx, cy + 4, 20, on ? t * 4.5 : 0.4, '#ff3a2a', '#ffb43a');
      for (const s of [-1, 1]) { c.fillStyle = '#8a0e14'; c.beginPath(); c.moveTo(cx + s * 4, cy - 3); c.quadraticCurveTo(cx + s * 9, cy - 9, cx + s * 8, cy - 14); c.quadraticCurveTo(cx + s * 6, cy - 8, cx + s * 1.5, cy - 1); c.fill(); }
    },
    wals(c, w, h, t, on) {
      const cx = w * 0.5, cy = h * 0.52, sp = on ? t * 1.2 : 0.3;
      c.strokeStyle = 'rgba(255,210,58,0.35)'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, 22, 0, TAU); c.stroke();
      for (let i = 0; i < 3; i++) { const a = sp + i * TAU / 3; note13(c, cx + Math.cos(a) * 22 - 2, cy + Math.sin(a) * 22 + 3, 3, '#ffd23a'); }
      c.fillStyle = '#5a2a9a'; circle(c, cx, cy, 11); c.fillStyle = '#9a5aff'; circle(c, cx - 1, cy - 1, 9);
      c.fillStyle = '#ffd23a'; for (const s of [-1, 1]) circle(c, cx + s * 4, cy - 2, 2.4);
      c.fillStyle = '#1a0d00'; for (const s of [-1, 1]) circle(c, cx + s * 4 + 0.6, cy - 2, 1);
      c.fillStyle = '#f2e6cf'; c.font = `800 7px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(on ? String(1 + Math.floor(t * BR.BPM / 60) % 3) : '3', cx, cy + 5);
    },
    death(c, w, h, t, on) {
      c.save(); c.translate(w * 0.48, h * 0.55 + (on ? Math.sin(t * 2) * 1.2 : 0)); drawCore(c, 19, false); c.restore();
      c.fillStyle = 'rgba(216,200,176,0.5)';
      for (let i = 0; i < 4; i++) { const u = on ? (t * 0.35 + i / 4) % 1 : i / 4; c.globalAlpha = 0.6 * (1 - u); circle(c, w * 0.2 + i * 12, h * 0.85 - u * 20, 1.4); }
      c.globalAlpha = 1;
    },
    floors(c, w, h, t, on, part) {
      const lv = { cellar: 0, halls: 1, market: 2, kamer: 3, garden: 4 }[part] ?? 0, L = LEVELS[lv] || LEVELS[0];
      c.strokeStyle = rgba(L.rockHi || '#9fe8d8', 0.9); c.lineWidth = 1.8; c.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        c.globalAlpha = 0.9 - k * 0.25; c.beginPath();
        for (let x = 6; x <= w - 6; x += 2) { const y = h * 0.5 + Math.sin(x * (0.12 + k * 0.05) + (on ? t * (2 + k) : k)) * (8 - k * 2) * (on ? 1 : 0.6); if (x === 6) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke();
      }
      c.globalAlpha = 1;
      c.fillStyle = rgba(L.floor || '#2c221b', 1); c.fillRect(0, h * 0.82, w, h * 0.18);
      c.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 0; x < w; x += 10) c.fillRect(x, h * 0.82, 1, h * 0.18);
    },
  };

  /* ------------------------------------------------------------------ the cards */
  const icon = { play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor"/></svg>', stop: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor"/></svg>' };
  const J = { cur: null, part: null, rep: false, src: null, nodes: [], t0: 0, off: 0, rate: 1, loopA: 0, loopB: 0, timer: null, droneWas: null, boxWas: false };
  const cards = {};
  root.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'mbar13';
  bar.innerHTML = '<p>Every song in the game. Tap a picture to play, tap a part to jump in. Sound has to be on.</p><button type="button" class="rep13" aria-pressed="false"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5h7l-2-2M11 9H4l2 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Repeat</button>';
  root.appendChild(bar);
  const rep = bar.querySelector('.rep13');
  rep.addEventListener('click', () => { J.rep = !J.rep; rep.setAttribute('aria-pressed', J.rep ? 'true' : 'false'); });
  const list = document.createElement('div'); list.className = 'songs13'; root.appendChild(list);

  for (const S of SONGS) {
    const f = document.createElement('div'); f.className = 'song13'; f.dataset.id = S.id;
    f.style.setProperty('--col13', S.col); f.style.setProperty('--acc13', S.acc);
    f.style.setProperty('--tint13', rgba(S.col, 0.1)); f.style.setProperty('--tintOn13', rgba(S.col, 0.22)); f.style.setProperty('--edge13', rgba(S.col, 0.32));
    const parts = S.parts ? '<div class="parts13">' + S.parts.map((p) => `<button type="button" data-part="${p.id}">${p.name}</button>`).join('') + '</div>' : '';
    f.innerHTML = `<button type="button" class="art13" aria-label="Play ${S.name}, ${S.tag}"><canvas aria-hidden="true"></canvas><span class="pb13">${icon.play}</span></button>
      <div class="txt13"><span class="k13">${S.tag}</span><b>${S.name}</b><span class="w13">${S.where}</span>
      <div class="meta13"><span class="tm13"></span><div class="bar13"><i></i></div><span class="du13"></span></div>${parts}</div>`;
    list.appendChild(f);
    const C = { el: f, S, cv: f.querySelector('canvas'), pb: f.querySelector('.pb13'), bar: f.querySelector('.bar13'), fill: f.querySelector('.bar13 i'), tm: f.querySelector('.tm13'), du: f.querySelector('.du13') };
    cards[S.id] = C;
    // section marks on the bar
    if (S.kind === 'remix') for (const p of S.parts.slice(1)) { const u = document.createElement('u'); u.style.left = (p.from / S.dur * 100) + '%'; C.bar.appendChild(u); }
    f.querySelector('.art13').addEventListener('click', () => (J.cur === S.id ? stop() : play(S, S.parts && S.kind === 'drone' ? S.parts[0].id : null)));
    for (const b of f.querySelectorAll('[data-part]')) b.addEventListener('click', () => play(S, b.dataset.part));
    duration(C);
  }
  function duration(C) {
    const S = C.S;
    let d = S.dur;
    if (S.kind === 'wals') { const M = window.__bitten && window.__bitten.walsTrack; d = M && M.buf ? M.buf.duration : 0; }
    C.du.textContent = S.loop ? 'loops' : d ? fmt(d) : '';
    C.tm.textContent = '0:00';
    if (S.loop) C.tm.textContent = '';
  }
  function draw(C, t) {
    const cv = C.cv, dpr = Math.min(window.devicePixelRatio || 1, 2), w = 76, h = 76;
    if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.lineJoin = 'round'; c.lineCap = 'round';
    bg13(c, w, h, C.S);
    safe(() => ART[C.S.id](c, w, h, t, J.cur === C.S.id, J.cur === C.S.id ? J.part : (C.S.parts ? C.S.parts[0].id : null)));
  }
  function paintAll() { for (const id in cards) draw(cards[id], 0.6); }

  /* ------------------------------------------------------------------ the player */
  function ui() {
    for (const id in cards) {
      const C = cards[id], on = J.cur === id;
      C.el.classList.toggle('on', on);
      C.pb.innerHTML = on ? icon.stop : icon.play;
      C.el.querySelector('.art13').setAttribute('aria-label', `${on ? 'Stop' : 'Play'} ${C.S.name}, ${C.S.tag}`);
      for (const b of C.el.querySelectorAll('[data-part]')) b.classList.toggle('on', on && b.dataset.part === J.part);
      C.bar.classList.toggle('live', on && !!C.S.loop);
      if (!on) { C.fill.style.width = '0'; duration(C); draw(C, 0.6); }
    }
  }
  /* regular music: silent while a song from the tab plays, back when it stops */
  function quiet13() {
    window.__jukebox = true;                              // the in-game mix stops scheduling
    const c = Sfx.ctx, B = window.__bitten || {};
    safe(() => { const bus = B.regularBus && B.regularBus(); if (bus && c) { bus.gain.cancelScheduledValues(c.currentTime); bus.gain.setTargetAtTime(0, c.currentTime, 0.04); } });
    if (J.muted) return;
    J.muted = true;
    J.boxWas = !!Sfx.musicOn; if (J.boxWas) Sfx.stopMusic();
    J.droneWas = Sfx.drone && G.levelDef && (G.state === 'play' || G.state === 'pause') ? G.levelDef.set : null;
    if (Sfx.drone) Sfx.stopDrone();
    const M = B.walsTrack;                                // De Wals boss track, when it is running
    if (M && M.g && c) { J.bossG = M.g; J.bossVol = M.g.gain.value; M.g.gain.cancelScheduledValues(c.currentTime); M.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.04); }
  }
  function loud13() {
    if (!J.muted) return;
    J.muted = false; window.__jukebox = false;
    const c = Sfx.ctx;
    if (J.boxWas) safe(() => Sfx.startMusic());
    if (J.droneWas && !Sfx.drone) safe(() => Sfx.startDrone(J.droneWas));
    if (J.bossG && c) safe(() => { J.bossG.gain.cancelScheduledValues(c.currentTime); J.bossG.gain.setTargetAtTime(Math.max(0.001, J.bossVol || 0.3), c.currentTime, 0.2); });
    J.boxWas = J.droneWas = J.bossG = null;
  }
  function stop(keep) {
    const was = J.cur;
    if (J.src) { try { J.src.onended = null; J.src.stop(); } catch (e) { /* ignore */ } }
    for (const n of J.nodes) try { n.disconnect(); } catch (e) { /* ignore */ }
    J.src = null; J.nodes = [];
    if (was === 'death' && window.__deathSong) safe(() => window.__deathSong.stop());
    if (was === 'box') Sfx.stopMusic();
    if (was === 'floors') Sfx.stopDrone();
    J.cur = null; J.part = null;
    if (!keep) loud13();
    if (was && G.state === 'pause') Sfx.suspend();
    ui();
  }
  function bufSource(buf, from, a, b, rate) {
    const c = Sfx.ctx, bus = c.createGain(); bus.gain.value = 0.7; bus.connect(Sfx.master);
    const s = c.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate || 1;
    if (a != null) { s.loop = true; s.loopStart = a; s.loopEnd = b; }
    J.nodes = [bus]; J.src = s; J.rate = rate || 1; J.loopA = a; J.loopB = b;
    return { s, bus };
  }
  function play(S, part) {
    stop(true); Sfx.init(); Sfx.resume();
    const c = Sfx.ctx; if (!c || !Sfx.master) { loud13(); return; }
    if (typeof DJ !== 'undefined' && DJ.on) DJ.stop(0.2, true);
    quiet13(); J.cur = S.id; J.part = part; J.t0 = null; J.off = 0; ui();
    const C = cards[S.id];
    const start = (buf, from, a, b, rate, chain) => {
      if (J.cur !== S.id) return;
      C.el.classList.remove('load');
      const { s, bus } = bufSource(buf, from, a, b, rate);
      let node = s;
      if (chain) { node = chain(s); }
      node.connect(bus);
      s.onended = () => { if (J.cur === S.id && J.src === s) stop(); };
      J.t0 = c.currentTime + 0.05; J.off = from; s.start(J.t0, from);
    };
    if (S.kind === 'remix' || S.kind === 'club' || S.kind === 'hell') {
      C.el.classList.add('load'); C.tm.textContent = 'loading';
      BR.render(c.sampleRate).then((buf) => {
        if (S.kind === 'remix') {
          const p = part && S.parts.find((x) => x.id === part);
          if (p) start(buf, p.from, J.rep ? p.from : null, J.rep ? p.to : null, 1);
          else start(buf, 0, J.rep ? 0 : null, J.rep ? buf.duration : null, 1);
        } else if (S.kind === 'club') start(buf, LEAD + 12 * BAR, LEAD + 16 * BAR, LEAD + 56 * BAR, 1);
        else start(buf, LEAD + 12 * BAR, LEAD + 16 * BAR, LEAD + 56 * BAR, 1.12, (s) => {
          const sh = c.createWaveShaper(), n = 1024, cu = new Float32Array(n);
          for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; cu[i] = Math.tanh(x * 2.6) / Math.tanh(2.6); }
          sh.curve = cu; sh.oversample = '2x';
          const lo = c.createBiquadFilter(); lo.type = 'lowshelf'; lo.frequency.value = 140; lo.gain.value = 5;
          s.connect(sh); sh.connect(lo); J.nodes.push(sh, lo); return lo;
        });
      }).catch(() => stop());
    } else if (S.kind === 'wals') {
      const B = window.__bitten || {}, M = B.walsTrack;
      if (!M || !B.walsLoad) { stop(); return; }
      C.el.classList.add('load'); C.tm.textContent = 'loading';
      if (!M.buf) safe(() => B.walsLoad());
      let tries = 0;
      const wait = () => {
        if (J.cur !== S.id) return;
        if (M.buf) { start(M.buf, 0, J.rep ? 0 : null, J.rep ? M.buf.duration : null, 1); duration(C); return; }
        if (M.failed || ++tries > 300) { stop(); return; }   /* T7: 30 s for a slow first fetch */
        setTimeout(wait, 100);
      };
      wait();
    } else if (S.kind === 'death' && window.__deathSong) { J.t0 = c.currentTime; J.off = 0; window.__deathSong.play(c); }
    else if (S.kind === 'box') { J.t0 = c.currentTime; Sfx.startMusic(); }
    else if (S.kind === 'drone') {
      J.t0 = c.currentTime; Sfx.startDrone(part || 'cellar');
    }
    ui();
  }
  // the clock: progress, the part that is playing, the moving picture
  function tick() {
    if (!J.cur || how.hidden) return;
    const C = cards[J.cur], S = C.S, c = Sfx.ctx; if (!c) return;
    const now = c.currentTime;
    if (J.t0 == null) { draw(C, now); return; }
    if (S.kind === 'box') safe(() => (Sfx.oldWaltz || Sfx.musicTick).call(Sfx));
    let pos = J.off + Math.max(0, now - J.t0) * (J.rate || 1);
    if (J.src && J.src.loop && J.loopB > J.loopA && pos > J.loopB) pos = J.loopA + ((pos - J.loopA) % (J.loopB - J.loopA));
    if (S.kind === 'remix') {
      C.fill.style.width = Math.min(100, pos / S.dur * 100) + '%'; C.tm.textContent = fmt(pos);
      const p = S.parts.find((x) => pos >= x.from && pos < x.to);
      if (p && p.id !== J.part) { J.part = p.id; for (const b of C.el.querySelectorAll('[data-part]')) b.classList.toggle('on', b.dataset.part === p.id); }
    } else if (S.kind === 'death') {
      const d = S.dur; C.fill.style.width = Math.min(100, (now - J.t0) / d * 100) + '%'; C.tm.textContent = fmt(Math.min(d, now - J.t0));
      if (now - J.t0 > d) { stop(); return; }
    } else if (S.kind === 'wals' && J.src) {
      const d = J.src.buffer.duration; C.fill.style.width = Math.min(100, (pos % d) / d * 100) + '%'; C.tm.textContent = fmt(pos % d);
    }
    draw(C, now - J.t0);
  }
  const how = document.getElementById('how');
  Sched.every('ui', 'v10.13 music tab', tick, () => !!J.cur && !how.hidden);   /* T3: only while the tab plays */

  /* leaving the tab or the guide stops the song */
  const hc = UI.closeHow;
  UI.closeHow = function () { stop(); return hc.apply(this, arguments); };
  const ht = UI.howTab;
  UI.howTab = function (id) { if (id !== 'music' && J.cur) stop(); const r = ht.apply(this, arguments); if (id === 'music') requestAnimationFrame(paintAll); return r; };
  paintAll();
})();


