/* src/65-v114-cards.js: v11.4: pause, game over and escape screens as cards, party menu. From v11.4. Lines 31508 to 31738 of the v13.7 script. */
/* ===== v11.4: Pause, game over and the escape screen as framed cards, sharp switches in Settings.
   Party menu: with the remix as menu music the start screen turns into a club that follows the song,
   intro, build, drop, break and drop II, with a now playing slip. Settings switch "Party menu". ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { console.error(e); return fb; } };

  /* ------------------------------------------------------------------ the old screens, new look */
  const css = document.createElement('style');
  css.textContent = `
/* switches: square, no pills */
.tog{background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015));border-radius:2px}
.tog i{width:44px;height:24px;border-radius:2px;background:#0c0807;border:1px solid var(--line)}
.tog i::after{left:3px;top:3px;width:16px;height:16px;border-radius:1px;background:var(--faint)}
.tog[aria-checked="true"]{border-color:rgba(215,38,61,.45)}
.tog[aria-checked="true"] i{background:rgba(215,38,61,.25);border-color:var(--apple)}
.tog[aria-checked="true"] i::after{transform:translateX(20px);background:var(--apple-hi);box-shadow:0 0 10px rgba(232,58,80,.6)}
/* framed cards for pause, game over and escape */
.card114{width:min(100%,460px);display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;background:rgba(14,10,9,.94);
  border:1px solid var(--line);border-top:3px solid var(--apple);border-radius:3px;padding:22px 18px 18px;box-shadow:0 24px 70px rgba(0,0,0,.75);position:relative}
.card114::before{content:attr(data-kick);position:absolute;top:-1px;left:50%;transform:translate(-50%,-55%);background:var(--apple);color:#fff4ec;font:700 10px/1 var(--ui);letter-spacing:.28em;padding:5px 9px;border-radius:2px;white-space:nowrap}
#win .card114{border-top-color:var(--toffee)}
#win .card114::before{background:var(--toffee);color:#16100d}
.card114 .stats{width:100%;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px}
.card114 .stats div{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:2px;padding:8px 10px;align-items:flex-start}
.card114 .stats dd{font-size:22px}
.card114 .row{width:100%}
.card114 .row{flex-wrap:nowrap}
.card114 .row .btn{flex:1;white-space:nowrap;padding:0 12px}
.card114 .row .btn.primary{font-size:17px;letter-spacing:.14em}
#pause .pinfo{background:rgba(14,10,9,.94);border:1px solid var(--line);border-top:3px solid var(--apple);border-radius:3px;padding:18px 16px 14px;box-shadow:0 24px 70px rgba(0,0,0,.75)}
#pause .pstats{width:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));gap:6px}
#pause .pstats div{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:2px;padding:7px 6px}
#pause > .stack{width:min(100%,520px)}
#pause > .stack .btn.primary{width:100%}
#pause > .stack .row{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px}
#pause .kick{color:var(--apple-hi)}
/* party menu: now playing slip */
.np114{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:max(10px,env(safe-area-inset-right,0px));z-index:6;pointer-events:none;display:grid;grid-template-columns:22px auto;gap:3px 9px;align-items:center;
  background:rgba(10,7,7,.82);border:1px solid var(--line);border-left:3px solid var(--np,#ff3ad8);border-radius:2px;padding:7px 10px 7px 8px;font-family:var(--ui);transition:opacity .4s}
.np114[hidden]{display:grid!important;opacity:0}
.np114 .eq{grid-row:1/3;display:flex;align-items:flex-end;gap:2px;height:20px}
.np114 .eq i{width:3px;background:var(--np,#ff3ad8);height:30%;border-radius:0}
.np114 b{font:700 10px/1 var(--ui);letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
.np114 span{font:700 14px/1 var(--ui);letter-spacing:.08em;text-transform:uppercase;color:var(--ink)}
.np114 em{grid-column:1/3;display:block;height:2px;background:rgba(236,226,212,.12);margin-top:3px}
.np114 em i{display:block;height:100%;width:0;background:var(--np,#ff3ad8)}
`;
  document.body.appendChild(css);

  function frame(id, kick) {
    const sec = document.getElementById(id); if (!sec || sec.querySelector('.card114')) return;
    const card = document.createElement('div'); card.className = 'card114'; card.dataset.kick = kick;
    while (sec.firstChild) card.appendChild(sec.firstChild);
    sec.appendChild(card);
  }
  safe(() => frame('over', 'GAME OVER'));
  safe(() => frame('win', 'DAYLIGHT'));

  /* ------------------------------------------------------------------ party menu */
  const PAL = ['#ff3ad8', '#3ad8ff', '#ffd23a', '#ff3a50', '#7aff5a'];
  const SEC_NAME = { intro: 'Intro', build: 'Build', drop: 'Drop', break: 'Break', drop2: 'Drop II', outro: 'Outro' };
  const SEC_COL = { intro: '#e3a54a', build: '#ff7a3a', drop: '#ff3ad8', break: '#9a6aff', drop2: '#3ad8ff', outro: '#e3a54a' };
  const PT = { conf: [], spark: [], last: 0, lastBar: -1, lastBeat: -1, bump: 0 };
  const partyOn = () => !!(Save.data && Save.data.settings && Save.data.settings.party !== false && Save.data.settings.music !== false && Sfx.on);

  // where the song is right now, from the chunks the remix player scheduled
  function songNow() {
    const st = window.__bitten && window.__bitten.remixState && window.__bitten.remixState();
    const c = Sfx.ctx; if (!st || !c || !st.hist || !st.buf || c.state !== 'running') return null;
    const now = c.currentTime;
    let cur = null; for (const h of st.hist) if (h.when <= now + 0.005) cur = h;
    if (!cur || now > cur.when + cur.dur + 0.3) return null;
    const BAR = BittenRemix.BAR, SEC = window.__bitten.remixSec[cur.sec];
    const barF = cur.bar + (now - cur.when) / BAR;
    const beatF = (barF % 1) * 4;
    return { sec: cur.sec, barF, beat: Math.floor(beatF), bf: beatF % 1, prog: Math.max(0, Math.min(1, (barF - SEC.from) / (SEC.to - SEC.from))) };
  }

  let np = null;
  function slip() {
    if (np) return np;
    np = document.createElement('div'); np.className = 'np114'; np.hidden = true; np.setAttribute('aria-hidden', 'true');
    np.innerHTML = '<div class="eq"><i></i><i></i><i></i><i></i></div><b>Now playing</b><span>Rotten Waltz</span><em><i></i></em>';
    document.getElementById('app').appendChild(np);
    return np;
  }

  const ms0 = MenuScene.render;
  MenuScene.render = function (c) {
    ms0.call(this, c);
    const s = partyOn() ? songNow() : null;
    const n = slip();
    const menuVis = UI.el && UI.el.menu && !UI.el.menu.hidden;
    n.hidden = !(s && menuVis);
    const cv = View.cv;
    if (!s) { if (PT.bump) { PT.bump = 0; cv.style.transform = ''; } return; }
    safe(() => party(c, s, n));
  };

  function party(c, s, n) {
    const W = View.W, H = View.H, dpr = View.dpr, t = performance.now() / 1000;
    const dt = Math.min(0.05, PT.last ? t - PT.last : 0.016); PT.last = t;
    const drop = s.sec === 'drop' || s.sec === 'drop2', build = s.sec === 'build', brk = s.sec === 'break';
    const kick = Math.exp(-s.bf * (drop ? 7 : 4));                 // fresh on every beat
    const barK = Math.exp(-((s.barF % 1) * 4) * 2.2);               // fresh on every bar
    const newBar = Math.floor(s.barF) !== PT.lastBar; PT.lastBar = Math.floor(s.barF);
    const newBeat = s.beat !== PT.lastBeat; PT.lastBeat = s.beat;
    const col = SEC_COL[s.sec] || '#ff3ad8';
    const pc = (i) => PAL[(i + Math.floor(s.barF)) % PAL.length];

    c.save();
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the room goes darker so the lights read
    c.fillStyle = `rgba(4,2,6,${drop ? 0.32 : brk ? 0.4 : 0.22})`; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const cx = W * (W > H ? 0.62 : 0.5);

    // spotlights from the ceiling
    const nSpots = s.sec === 'intro' ? 1 : build ? 2 : brk ? 3 : 4;
    const spd = s.sec === 'intro' ? 0.35 : build ? 0.6 + s.prog * 1.4 : brk ? 0.25 : 1.1;
    for (let i = 0; i < nSpots; i++) {
      const sx = nSpots === 1 ? cx : W * (0.12 + (0.76 * i) / (nSpots - 1));
      const a = Math.PI / 2 + Math.sin(t * spd + i * 1.7) * 0.55;
      const len = H * 1.15, w = brk ? 0.2 : 0.13;
      const g = c.createLinearGradient(sx, 0, sx + Math.cos(a) * len, Math.sin(a) * len);
      const cc = drop ? pc(i) : brk ? '#7a5aff' : col;
      const al = (s.sec === 'intro' ? 0.1 : build ? 0.08 + s.prog * 0.12 : brk ? 0.09 : 0.12 + kick * 0.1);
      g.addColorStop(0, rgba(cc, al)); g.addColorStop(1, rgba(cc, 0));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(sx, -4);
      c.lineTo(sx + Math.cos(a - w) * len, Math.sin(a - w) * len); c.lineTo(sx + Math.cos(a + w) * len, Math.sin(a + w) * len); c.closePath(); c.fill();
      glowDot(c, sx + Math.cos(a) * H * 0.62, Math.sin(a) * H * 0.62, 90, cc, al * 1.4);
    }
    // lasers in the drops, fanning from the two top corners on the beat
    if (drop) {
      c.lineWidth = 1.4;
      const nl = s.sec === 'drop2' ? 7 : 5;
      for (const side of [0, 1]) for (let i = 0; i < nl; i++) {
        const ox = side ? W + 4 : -4, base = side ? Math.PI * 0.75 : Math.PI * 0.25;
        const a = base + (i / (nl - 1) - 0.5) * (0.9 + 0.3 * Math.sin(t * 0.9)) * (side ? -1 : 1) + Math.sin(t * 1.3 + side) * 0.2;
        c.strokeStyle = rgba(pc(i + side * 2), 0.18 + kick * 0.35);
        c.beginPath(); c.moveTo(ox, -4); c.lineTo(ox + Math.cos(a) * W * 1.6, Math.sin(a) * W * 1.6); c.stroke();
      }
      // floor wash that thumps with the kick
      const fg = c.createRadialGradient(cx, H * 0.92, 0, cx, H * 0.92, Math.max(W, H) * 0.7);
      fg.addColorStop(0, rgba(pc(0), 0.1 + kick * 0.22)); fg.addColorStop(1, rgba(pc(0), 0));
      c.fillStyle = fg; c.fillRect(0, 0, W, H);
      // bass ring every bar
      if (barK > 0.02) { c.strokeStyle = rgba(pc(1), 0.35 * barK); c.lineWidth = 2; c.beginPath(); c.arc(cx, H * 0.52, 40 + (1 - barK) * Math.max(W, H) * 0.5, 0, TAU); c.stroke(); }
      // drop II: a mirror ball and a strobe on the off beats
      if (s.sec === 'drop2') {
        const bx = cx, by = Math.min(70, H * 0.08);
        for (let i = 0; i < 26; i++) {
          const a = i * 2.39996 + t * 0.6, r = (0.15 + ((i * 0.37) % 1) * 0.85) * Math.max(W, H) * 0.6;
          const x = bx + Math.cos(a) * r, y = by + Math.abs(Math.sin(a)) * r * 1.2;
          glowDot(c, x, y, 5, '#ffffff', 0.35 + 0.3 * Math.sin(t * 7 + i));
        }
        glowDot(c, bx, by, 26, '#ffffff', 0.4);
        if (s.beat % 2 === 1 && s.bf < 0.09) { c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(0, 0, W, H); }
      }
    }
    // build: everything speeds up, the last quarter flickers in eighths
    if (build && s.prog > 0.72) {
      const e = (s.barF * 8) % 1;
      if (e < 0.18) { c.fillStyle = rgba(col, 0.05 + (s.prog - 0.72) * 0.25); c.fillRect(0, 0, W, H); }
    }
    // break: slow purple haze rolling through
    if (brk) {
      for (let i = 0; i < 5; i++) {
        const x = ((t * 18 + i * 260) % (W + 400)) - 200, y = H * (0.25 + 0.14 * i) + Math.sin(t * 0.4 + i) * 20;
        glowDot(c, x, y, 160, i % 2 ? '#7a5aff' : '#c45aff', 0.05);
      }
    }
    // particles: confetti in the drops, sparks rising in the build, dust in the intro
    if (newBeat && drop) for (let i = 0; i < (s.sec === 'drop2' ? 10 : 6); i++) PT.conf.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 80, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 8, c: pick(PAL), l: 4 });
    if (build && Math.random() < 0.25 + s.prog) PT.spark.push({ x: Math.random() * W, y: H + 6, vy: -(60 + s.prog * 160 + Math.random() * 60), c: col, l: 3 });
    if (newBar && s.sec === 'intro') PT.spark.push({ x: cx + (Math.random() - 0.5) * 200, y: H * 0.7, vy: -20, c: '#ffe8b0', l: 4 });
    c.globalCompositeOperation = 'source-over';
    for (let i = PT.conf.length - 1; i >= 0; i--) {
      const p = PT.conf[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.l -= dt;
      if (p.l <= 0 || p.y > H + 10) { PT.conf.splice(i, 1); continue; }
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.globalAlpha = Math.min(1, p.l); c.fillRect(-3, -1.5, 6, 3); c.restore();
    }
    c.globalCompositeOperation = 'lighter';
    for (let i = PT.spark.length - 1; i >= 0; i--) {
      const p = PT.spark[i]; p.y += p.vy * dt; p.l -= dt;
      if (p.l <= 0 || p.y < -10) { PT.spark.splice(i, 1); continue; }
      glowDot(c, p.x, p.y, 6, p.c, 0.5 * Math.min(1, p.l));
    }
    if (PT.conf.length > 220) PT.conf.splice(0, PT.conf.length - 220);
    if (PT.spark.length > 160) PT.spark.splice(0, PT.spark.length - 160);
    c.restore();

    // the whole floor bumps on the kick in the drops
    const bump = drop && !REDUCED ? 1 + 0.012 * kick : 1;
    if (Math.abs(bump - (PT.bump || 1)) > 0.0005) { View.cv.style.transform = bump === 1 ? '' : `scale(${bump.toFixed(4)})`; PT.bump = bump; }

    // now playing slip
    n.style.setProperty('--np', col);
    n.querySelector('span').textContent = 'Rotten Waltz · ' + (SEC_NAME[s.sec] || s.sec);
    const bars = n.querySelectorAll('.eq i');
    bars.forEach((b, i) => { const v = drop ? 0.25 + 0.75 * Math.abs(Math.sin(t * (5 + i * 1.7) + i)) * (0.5 + 0.5 * kick) : 0.2 + 0.4 * Math.abs(Math.sin(t * (2 + i) + i)); b.style.height = Math.round(v * 100) + '%'; });
    n.querySelector('em i').style.width = Math.round(s.prog * 100) + '%';
  }
  // leaving the menu: put the stage back
  const hide0 = UI.hide;
  UI.hide = function (id) { if (id === 'menu') safe(() => { View.cv.style.transform = ''; PT.bump = 0; if (np) np.hidden = true; }); return hide0.apply(this, arguments); };
  const r0 = render;
  render = function (dt) { r0(dt); if (G.state !== 'menu' && PT.bump) { View.cv.style.transform = ''; PT.bump = 0; if (np) np.hidden = true; } };

  /* settings switch */
  safe(() => {
    if (typeof SETTING_KEYS === 'object') SETTING_KEYS.party = 1;
    const box = UI.el && UI.el.toggles; if (!box || box.querySelector('[data-set="party"]')) return;
    const b = document.createElement('button'); b.className = 'tog'; b.type = 'button'; b.setAttribute('role', 'switch'); b.dataset.set = 'party';
    b.innerHTML = '<span><b>Party menu</b><small>With Music on, the start screen turns into a club that follows the remix: intro, build, drop, break, drop II. Off keeps the quiet cellar.</small></span><i></i>';
    b.addEventListener('click', (e) => { e.preventDefault(); UI.flip('party'); });
    const ref = box.querySelector('[data-set="music"]');
    if (ref && ref.nextSibling) box.insertBefore(b, ref.nextSibling); else box.appendChild(b);
    UI.paintSettings();
  });
  safe(() => {
    for (const s of ['Party menu', 'With Music on, the start screen turns into a club that follows the remix: intro, build, drop, break, drop II. Off keeps the quiet cellar.', 'Now playing', 'Rotten Waltz'])
      if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
  });

  Object.assign(window.__bitten, { V114: { PT, songNow, party } });
})();


