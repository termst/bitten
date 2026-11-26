/* 74.js section 11: words. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { $, ART, CH_COLS, CH_NAMES, FLAT, FONT, RTM, TX_COLS, applyGates, el, esc, inCell, inMap, label, lineC, safe, wrapText } = M74;
  M74.popShow = popShow; M74.popNext = popNext; M74.popSkip = popSkip; M74.popPick = popPick; M74.capShow = capShow; M74.runFx = runFx;
  /* ================================================================== 11. v12.4: words in the dungeon, and a Map Maker that fits a phone */
  const GATE_WORD = (ch) => CH_NAMES[ch || 0];

  /* ---- art for the text pieces */
  const TX_SIZE = [0, 11, 16, 25];
  let TXF = null;
  function txFontC(e) { if (!TXF) TXF = { disp: (getComputedStyle(document.documentElement).getPropertyValue('--display') || 'Georgia, serif').trim() }; const sz = TX_SIZE[e.sz || 2]; return (e.cl === 1 || e.cl === 2) ? `${Math.round(sz * 1.2)}px ${TXF.disp}` : `800 ${sz}px ${FONT}`; }
  ART.tx = (c, x, y, e, t, mode) => {
    const txt = String(e.txt || '').trim();
    if (!txt) { if (mode !== 'game') { c.strokeStyle = 'rgba(239,230,210,0.35)'; c.setLineDash([3, 3]); c.strokeRect(x - 15, y - 15, 30, 30); c.setLineDash([]); } return; }
    const col = TX_COLS[e.cl || 0], fx = e.fx || 0;
    c.save();
    c.font = mode === 'icon' ? `800 14px ${FONT}` : txFontC(e);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    let a = e.cl === 0 ? 0.78 : 0.9;
    if (fx === 3 && mode !== 'icon') { const n = Math.sin(t * 23 + x) * Math.sin(t * 7.1 + y); a *= n > 0.6 ? 0.25 : 0.95; }
    const show = mode === 'icon' ? txt.slice(0, 3) : txt;
    if (fx === 1 && mode !== 'icon') { c.shadowColor = col; c.shadowBlur = 10 + 4 * Math.sin(t * 3 + x); }
    if (fx === 2 && mode !== 'icon') {
      const ws = [...show].map((ch) => c.measureText(ch).width), tw = ws.reduce((s, w) => s + w, 0);
      let px = x - tw / 2;
      [...show].forEach((ch, i) => {
        const yy = y + Math.sin(t * 4 + i * 0.6) * 2.4;
        c.globalAlpha = a * 0.5; c.fillStyle = '#000'; c.fillText(ch, px + ws[i] / 2 + 1, yy + 1.5);
        c.globalAlpha = a; c.fillStyle = col; c.fillText(ch, px + ws[i] / 2, yy);
        px += ws[i];
      });
    } else {
      c.globalAlpha = a * 0.45; c.fillStyle = '#000'; c.fillText(show, x + 1, y + 1.5);
      c.globalAlpha = a; c.fillStyle = col; c.fillText(show, x, y);
      if (e.cl === 0) { c.globalAlpha = a * 0.35; c.fillText(show, x + 0.7, y - 0.6); }
      if (e.cl === 1 && mode !== 'icon') {
        c.shadowBlur = 0; c.globalAlpha = 0.85; c.fillStyle = col;
        const w = c.measureText(show).width, n = Math.max(2, Math.floor(w / 14)), sz = TX_SIZE[e.sz || 2];
        for (let i = 0; i < n; i++) { const dx = x - w / 2 + ((i * 37 + 11) % Math.max(1, Math.floor(w))), len = 3 + ((i * 13) % 7) * (sz / 11); c.fillRect(dx, y + sz * 0.35, 1.3, len); circle(c, dx + 0.6, y + sz * 0.35 + len, 1.2); }
      }
    }
    c.restore();
  };
  const NT_LOOK = [['#efe2c4', '#5a3a1a'], ['#ffd23a', '#2a1a0c'], ['#2a1414', '#c8202a'], ['#1b2230', '#7cc4ff']];
  ART.nt = (c, x, y, e, t, mode) => {
    const [bg, ink] = NT_LOOK[e.ty || 0], read = mode === 'game' && e.read;
    c.save(); c.translate(x, y + (mode === 'game' && !read ? Math.sin(t * 2 + (e.t0 || 0)) * 1.2 : 0)); c.rotate(-0.12);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-10, -6, 22, 17);
    if ((e.ty || 0) === 3) {
      c.fillStyle = '#0c0d10'; rrect(c, -8, -12, 16, 24, 2.5); c.fill();
      c.fillStyle = read ? '#26303e' : bg; c.fillRect(-6.5, -9.5, 13, 18);
      if (!read) { c.fillStyle = ink; c.fillRect(-5, -7, 8, 3); c.fillRect(-3, -2.5, 7, 3); c.fillStyle = '#ff4a5a'; circle(c, 6, -10, 2.4); }
    } else {
      c.fillStyle = read ? 'rgba(160,150,130,0.55)' : bg; c.fillRect(-11, -9, 22, 17);
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.moveTo(11, 3); c.lineTo(11, 8); c.lineTo(6, 8); c.fill();
      c.strokeStyle = ink; c.lineWidth = 1; c.globalAlpha = read ? 0.35 : 0.85;
      for (let i = 0; i < 3; i++) lineC(c, -8, -5 + i * 4, 6 - (i === 2 ? 5 : 0), -5 + i * 4);
      c.globalAlpha = 1;
      if ((e.ty || 0) === 1 && !read) { c.fillStyle = '#2a1a0c'; c.font = `900 9px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 7, -4); }
      if ((e.ty || 0) === 2 && !read) { c.fillStyle = '#c8202a'; circle(c, 7, 5, 2.2); }
    }
    c.restore();
  };
  ART.cq = (c, x, y, e, t, mode) => {
    const used = mode === 'game' && e.used;
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, x + 1, y + 13, 14, 4.5); c.fill();
    c.fillStyle = used ? '#3a3430' : '#5a524c'; c.fillRect(x - 13, y + 4, 26, 9);
    c.fillStyle = used ? '#2a2522' : '#6e6660'; c.fillRect(x - 10, y - 14, 20, 19);
    c.fillStyle = used ? '#1c1816' : '#3a3430'; c.fillRect(x - 7, y - 10, 14, 12);
    if (used) { c.strokeStyle = '#100d0c'; c.lineWidth = 1.2; lineC(c, x - 9, y - 12, x + 2, y + 3); lineC(c, x + 2, y + 3, x + 7, y - 4); return; }
    const p = mode === 'icon' ? 1 : 0.65 + 0.35 * Math.sin(t * 3 + (e.t0 || 0));
    c.fillStyle = `rgba(255,197,58,${p})`; c.font = `900 13px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x, y - 3.5);
    c.fillStyle = '#8a827a'; c.fillRect(x - 13, y + 4, 26, 1.5);
  };
  ART.sh = (c, x, y, e, t, mode) => {
    if (mode === 'game') return;
    c.save();
    c.strokeStyle = 'rgba(255,197,58,0.7)'; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.strokeRect(x - 16, y - 16, 32, 32); c.setLineDash([]);
    c.fillStyle = '#ffc53a'; c.beginPath(); c.moveTo(x - 9, y - 3); c.lineTo(x - 3, y - 3); c.lineTo(x + 6, y - 9); c.lineTo(x + 6, y + 9); c.lineTo(x - 3, y + 3); c.lineTo(x - 9, y + 3); c.closePath(); c.fill();
    c.strokeStyle = '#ffc53a'; c.lineWidth = 1.4; c.beginPath(); c.arc(x + 7, y, 6, -0.7, 0.7); c.stroke();
    if (mode === 'edit') label(c, x + 11, y - 12, (e.on || 'e').toUpperCase(), '#ffc53a', 8);
    c.restore();
  };
  ART.pl = (c, x, y, e, t, mode) => {
    const col = CH_COLS[e.ch || 0], dn = mode === 'game' && e.down;
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(x - 14, y - 13, 29, 29);
    c.fillStyle = '#3a3430'; c.fillRect(x - 15, y - 15, 30, 30);
    c.fillStyle = dn ? rgba(col, 0.55) : '#6e6660'; c.fillRect(x - 12, y - (dn ? 10 : 12), 24, dn ? 22 : 22);
    c.fillStyle = dn ? rgba(col, 0.9) : '#8a827a'; c.fillRect(x - 12, y - (dn ? 10 : 12), 24, 2);
    c.strokeStyle = rgba(col, dn ? 1 : 0.7); c.lineWidth = 1.6; c.strokeRect(x - 12.5, y - 12.5, 25, 25);
    if (mode === 'edit') label(c, x + 12, y - 13, CH_NAMES[e.ch || 0][0], col, 8);
  };
  Object.assign(FLAT, { tx: -1, pl: 0, sh: 1, nt: 2, cq: 5 });

  /* ---- the popup: notes, choices and intros stop the game until you answer */
  const Pop = { on: false, q: [], cur: null, typed: 0, full: '', tm: 0, el: null }; M74.Pop = Pop;
  function popBuild() {
    if (Pop.el) return Pop.el;
    const app = document.getElementById('app'); if (!app) return null;
    const d = document.createElement('div'); d.className = 'mkp'; d.id = 'mkPop'; d.hidden = true;
    d.innerHTML = '<div class="mkp-card" role="dialog" aria-modal="true" aria-labelledby="mkPopT"><div class="mkp-hd"><small id="mkPopK"></small><b id="mkPopT"></b></div><div class="mkp-bd" id="mkPopB"></div><div class="mkp-ops" id="mkPopO"></div><p class="mkp-hint" id="mkPopH"></p></div>';
    app.appendChild(d);
    d.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!e.target.closest('button')) { e.preventDefault(); popSkip(); } });
    Pop.el = d;
    return d;
  }
  function popPlace() {
    const d = Pop.el; if (!d || d.hidden) return;
    const card = d.firstChild;
    const cx = View.ox + (VIEW_W * View.s) / 2, cy = View.oy + (VIEW_H * View.s) / 2;
    card.style.left = Math.round(cx) + 'px';
    card.style.top = Math.round(Math.min(View.H - 12 - card.offsetHeight / 2, Math.max(12 + card.offsetHeight / 2, cy))) + 'px';
    card.style.width = Math.round(Math.min(460, Math.max(280, VIEW_W * View.s - 24), View.W - 24)) + 'px';
  }
  // o: { look: paper|warn|story|phone|choice|intro, kick, title, text, opts: [{ label, sub, off, fn }] }
  function popShow(o) {
    if (!popBuild()) return;
    Pop.q.push(o);
    if (!Pop.on) M74.popNext();
  }
  function popNext() {
    const o = Pop.q.shift();
    if (!o) { popClose(); return; }
    if (!(G.state === 'play' || G.state === 'pause') || !G.run) { Pop.q.length = 0; popClose(); return; }
    Pop.on = true; Pop.cur = o; Pop.typed = 0; Pop.full = String(o.text || ''); Pop.tm = performance.now();
    Input.reset();
    const d = Pop.el, card = d.firstChild;
    card.className = 'mkp-card ' + (o.look || 'paper');
    $('mkPopK').textContent = o.kick || '';
    $('mkPopT').textContent = o.title || '';
    const bd = $('mkPopB'); bd.textContent = '';
    if (o.look === 'phone') {
      const raw = Pop.full.includes('|') ? Pop.full.split('|') : Pop.full.replace(/([.!?])\s+(?=[A-Z0-9"'])/g, '$1|').split('|');
      const parts = raw.map((x) => x.trim()).filter(Boolean).slice(0, 8);
      Pop.parts = parts; Pop.full = parts.join('\n');
      for (const p of parts) { const b = el('div', 'bub', ''); b.dataset.t = p; bd.appendChild(b); }
    } else { Pop.parts = null; bd.appendChild(el('p', null, '')); }
    const ops = $('mkPopO'); ops.textContent = '';
    const list = o.opts && o.opts.length ? o.opts : [{ label: o.ok || 'Got it', fn: null }];
    list.forEach((op, i) => {
      const b = el('button', 'mkp-op' + (op.off ? ' off' : '') + (list.length > 1 && i === 0 ? ' a' : ''), `<kbd>${list.length > 1 ? i + 1 : '↵'}</kbd><span><b>${esc(op.label)}</b>${op.sub ? `<small>${esc(op.sub)}</small>` : ''}</span>`);
      b.type = 'button'; if (op.off) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); M74.popPick(i); });
      ops.appendChild(b);
    });
    $('mkPopH').textContent = list.length > 1 ? 'Pick one. Keys 1 and 2 work too.' : 'Tap, Enter or Space to go on.';
    d.hidden = false;
    popPaint();
    requestAnimationFrame(() => { popPlace(); card.classList.add('in'); });
    safe(() => (o.look === 'phone' ? Sfx.blip('jens') : Sfx.tone(520, 0.09, { type: 'triangle', vol: 0.05, to: 780 })));
  }
  function popPaint() {
    const n = Math.floor(Pop.typed);
    if (Pop.parts) {
      let left = n;
      for (const b of $('mkPopB').children) { const t = b.dataset.t; const k = Math.max(0, Math.min(t.length, left)); left -= t.length + 1; b.textContent = t.slice(0, k); b.classList.toggle('on', k > 0); }
    } else { const p = $('mkPopB').firstChild; if (p) p.textContent = Pop.full.slice(0, n); }
    Pop.el.firstChild.classList.toggle('typing', n < Pop.full.length);
  }
  function popSkip() {
    if (!Pop.on) return false;
    if (Pop.typed < Pop.full.length) { Pop.typed = Pop.full.length; popPaint(); return true; }
    return false;
  }
  function popPick(i) {
    const o = Pop.cur; if (!o) return;
    if (performance.now() - Pop.tm < 260) return;
    if (popSkip()) return;
    const list = o.opts && o.opts.length ? o.opts : [{}];
    const op = list[i]; if (!op) return;
    if (op.off) { safe(() => Sfx.thud()); const b = $('mkPopO').children[i]; if (b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); } return; }
    Pop.cur = null;
    Pop.el.firstChild.classList.remove('in');
    Pop.on = false;
    Input.reset();
    if (op.fn) safe(op.fn);
    if (Pop.q.length) setTimeout(M74.popNext, 120); else popClose();
  }
  function popClose() {
    Pop.on = false; Pop.cur = null;
    if (Pop.el) { Pop.el.hidden = true; Pop.el.firstChild.classList.remove('in'); }
  }
  // typing runs on its own clock, the game clock is stopped
  /* T3, T4: a UI task of the one scheduler, typed by time: 132 characters a second (the phone look 96) */
  function popTick(now, dt) {
    if (Pop.on && Pop.typed < Pop.full.length && Pop.el && !Pop.el.hidden) { Pop.typed = Math.min(Pop.full.length, Pop.typed + (Pop.cur && Pop.cur.look === 'phone' ? 96 : 132) * dt); popPaint(); if (Math.floor(Pop.typed) % 5 === 0) safe(() => Sfx.tone(900 + Math.random() * 200, 0.02, { type: 'square', vol: 0.008, lp: 2400 })); }
  }
  Sched.every('ui', 'v12.4 pop typing', popTick, () => Pop.on);
  window.addEventListener('keydown', (e) => {
    if (!Pop.on || !Pop.el || Pop.el.hidden || G.state !== 'play') return;
    const o = Pop.cur; if (!o) return;
    const n = o.opts && o.opts.length ? o.opts.length : 1;
    if (e.code === 'Escape' && n > 1) return;
    e.preventDefault(); e.stopPropagation();
    if (e.repeat) return;
    if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE' || e.code === 'NumpadEnter') { if (!popSkip() && n === 1) M74.popPick(0); }
    else if (e.code === 'Escape') { if (!popSkip()) M74.popPick(0); }
    else if (/^(Digit|Numpad)[1-4]$/.test(e.code)) { const i = Number(e.code.slice(-1)) - 1; if (i < n) M74.popPick(i); }
  }, true);
  window.addEventListener('resize', () => safe(popPlace));
  safe(() => {
    Hooks.layer('Game.update', 'v12.4 Pop freeze', function (next) { if (Pop.on && G.state === 'play') return; return next.apply(this, [].slice.call(arguments, 1)); });
    const pa0 = Game.pause;
    Game.pause = function () { const r = pa0.apply(this, arguments); if (Pop.el && G.state === 'pause') Pop.el.hidden = true; return r; };
    const rs0 = Game.resume;
    Game.resume = function () { const r = rs0.apply(this, arguments); if (Pop.on && Pop.el && G.state === 'play') { Pop.el.hidden = false; Input.reset(); requestAnimationFrame(popPlace); } return r; };
    for (const k of ['toMenu', 'gameOver', 'win']) {
      const f0 = Game[k];
      if (typeof f0 === 'function') Game[k] = function () { Pop.q.length = 0; popClose(); capHide(); return f0.apply(this, arguments); };
    }
    Hooks.layer('Game.startRun', 'v12.4 Pop close', function (next) { Pop.q.length = 0; popClose(); capHide(); return next.apply(this, [].slice.call(arguments, 1)); });
  });

  /* ---- the caption: a line of text at the top of the room, for room texts */
  const Cap = { el: null, t: 0, full: '', typed: 0, hideAt: 0 };
  function capShow(text, kick) {
    text = String(text || '').trim(); if (!text) return;
    if (!Cap.el) {
      const app = document.getElementById('app'); if (!app) return;
      Cap.el = el('div', 'mkcap'); Cap.el.setAttribute('aria-live', 'polite'); app.appendChild(Cap.el);
    }
    Cap.full = text; Cap.typed = 0; Cap.kick = kick || '';
    Cap.el.innerHTML = `${kick ? `<small>${esc(kick)}</small>` : ''}<span></span>`;
    Cap.el.style.top = Math.round(View.oy + (WALL + RH) * View.s - 10) + 'px';
    Cap.el.style.maxWidth = Math.round(Math.min(560, VIEW_W * View.s - 28)) + 'px';
    Cap.el.classList.add('show');
    Cap.hideAt = performance.now() + 2600 + text.length * 55;
  }
  function capHide() { if (Cap.el) Cap.el.classList.remove('show'); Cap.hideAt = 0; }
  /* T3, T4: typed by time, 84 characters a second; while the game waits the hide clock waits by real time */
  function capTick(now, dt) {
    if (Cap.el && Cap.hideAt) {
      if (G.state === 'play' && !Pop.on) {
        if (Cap.typed < Cap.full.length) { Cap.typed = Math.min(Cap.full.length, Cap.typed + 84 * dt); Cap.el.lastChild.textContent = Cap.full.slice(0, Math.floor(Cap.typed)); }
        else if (performance.now() > Cap.hideAt) capHide();
      } else if (G.state !== 'play' && G.state !== 'pause') capHide();
      else Cap.hideAt += dt * 1000;
    }
  }
  Sched.every('ui', 'v12.4 captions', capTick, () => !!(Cap.el && Cap.hideAt));
  Object.assign(window.__bitten || (window.__bitten = {}), { pop14: { popShow: M74.popShow, capShow, Pop, Cap } });   /* test hooks (T4 check) */

  /* ---- what the answers at a Choice do */
  const FX_SUB = {
    none: 'Nothing happens', heal: '+1 apple', hurt: 'Costs half an apple', coins: '+10 coins', buy: 'Costs 10 coins, gives a powerup', deal: 'Costs an apple, gives a powerup',
    item: 'A free powerup', down: 'A downgrade, on purpose', snakes: 'Three snakes come out', gate: 'The gates flip', bomb: 'It explodes', key: 'A key drops',
  }; M74.FX_SUB = FX_SUB;
  function fxOff(fx) {
    const P = G.player;
    if (fx === 'buy' && (G.run.coins || 0) < 10) return 'You have ' + (G.run.coins || 0) + ' coins. It wants 10.';
    if (fx === 'deal' && P.hp <= 2) return 'Not enough apple left to pay with.';
    if (fx === 'heal' && P.hp >= P.maxHp) return '';
    return '';
  }
  function freeSpot(room, k) { const f = safe(() => nearestFreeCell(room, k.x, k.y + T, (c, r) => c === k.c && r === k.r)); return f || { x: k.x, y: k.y + T }; }
  function runFx(room, k, fx) {
    const P = G.player;
    switch (fx) {
      case 'heal': P.heal(2); Sfx.tone(660, 0.18, { to: 990, type: 'triangle', vol: 0.06 }); floatText(P.x, P.y - 28, '+1 APPLE', '#ff6a7a', true); break;
      case 'hurt': P.inv = 0; P.dashT = 0; P.hurt(1, k.x, k.y - 10); break;
      case 'coins': G.run.coins = (G.run.coins || 0) + 10; Sfx.coin(); floatText(P.x, P.y - 28, '+10 COINS', '#ffd84a', true); break;
      case 'buy': { G.run.coins = Math.max(0, (G.run.coins || 0) - 10); Sfx.coin(); const f = freeSpot(room, k); spawnItem(room, f.x, f.y); floatText(k.x, k.y - 30, '-10 COINS', '#ffd84a'); break; }
      case 'deal': { P.inv = 0; P.dashT = 0; P.hurt(2, k.x, k.y - 10); const f = freeSpot(room, k); setTimeout(() => { if (G.room === room && G.state === 'play') spawnItem(room, f.x, f.y); }, 450); break; }
      case 'item': { const f = freeSpot(room, k); spawnItem(room, f.x, f.y); break; }
      case 'down': safe(() => giveDown()); break;
      case 'snakes': {
        const kinds = ['grub', 'grub', 'grub'];
        kinds.forEach((kd, i) => {
          const cell = safe(() => Game.farCell(room, P, new Set())) || { x: k.x, y: k.y };
          const sn = safe(() => new Snake(kd, cell.x, cell.y, { delay: 0.2 + i * 0.2, ang: Math.atan2(P.y - cell.y, P.x - cell.x) }));
          if (sn) room.snakes.push(sn);
        });
        Sfx.hiss(0.9); UI.banner('Bad answer', 'Something came out of the walls.', 'curse');
        break;
      }
      case 'gate': if (G.map && G.map.mkCh) { G.map.mkCh[k.ch || 0] ^= 1; applyGates(G.map, true); Sfx.clank(); floatText(k.x, k.y - 30, `${GATE_WORD(k.ch).toUpperCase()} GATES`, CH_COLS[k.ch || 0], true); } break;
      case 'bomb': explode(room, k.x, k.y, 70, { dmg: 1, snakeDmg: 7 }); break;
      case 'key': room.pickups.push({ kind: 'key', x: k.x, y: k.y + 22, vx: 0, vy: 80, t: 0.5, ph: Math.random() * 10 }); Sfx.tone(880, 0.2, { to: 1320, type: 'triangle', vol: 0.06 }); break;
      default: floatText(k.x, k.y - 30, 'NOTHING', '#b8a8a0'); break;
    }
  }
  const NT_LOOKS = ['paper', 'warn', 'story', 'phone'];
  const NT_KICK = ['A note', 'Warning', 'A page', 'New message'];
  function askChoice(room, k) {
    const hide = k.hd === 1;
    const mk = (label, fx) => { const off = fxOff(fx); return { label: label || 'Answer', sub: off || (hide ? 'Who knows' : FX_SUB[fx] || ''), off: !!off, fn: () => { k.used = true; burst(k.x, k.y, 12, '#6e6660', { kind: 'shard', min: 30, max: 110, lmin: 0.3, lmax: 0.7 }); runFx(room, k, fx); } }; };
    const opts = [mk(k.a, k.ae), mk(k.b, k.be)];
    if (opts.every((o) => o.off)) opts.push({ label: 'Leave it', sub: 'Come back later', fn: () => { k.away = true; } });
    M74.popShow({ look: 'choice', kick: 'A choice', title: k.ti || 'A choice', text: k.txt || '', opts });
  }

  /* ---- the text pieces at work */
  function mk8Update(dt, room) {
    const P = G.player, alive = P.dying <= 0 && P.escaping <= 0 && !G.trans;
    for (const k of room.mkE) {
      if (k.dead) continue;
      const inside = alive && inCell(P, k, 7);
      switch (k.t) {
        case 'nt':
          if (inside && !k.inside && !(k.on === 'o' && k.read)) { k.read = true; M74.popShow({ look: NT_LOOKS[k.ty || 0], kick: NT_KICK[k.ty || 0], title: k.ti || '', text: k.txt || '' }); }
          break;
        case 'cq':
          if (inside && !k.inside && !k.used) askChoice(room, k);
          break;
        case 'sh':
          if (k.fired) break;
          if (k.on === 's' ? inside : k.on === 'c' ? room.cleared && !room.locked : ((k.tm = (k.tm || 0) + dt) > 0.6)) {
            k.fired = true; UI.banner(k.txt || '', k.s || '', k.st || undefined); safe(() => (k.st === 'curse' ? Sfx.stinger() : Sfx.tone(440, 0.2, { to: 660, type: 'triangle', vol: 0.05 })));
          }
          break;
        case 'pl': {
          let on = inside;
          if (!on) for (const ct of room.carts) if (inCell(ct, k, 4)) { on = true; break; }
          if (on !== !!k.down) {
            k.down = on;
            if (on || k.m === 'h') {
              if (G.map && G.map.mkCh) { G.map.mkCh[k.ch || 0] ^= 1; applyGates(G.map, true); }
              Sfx.tone(on ? 220 : 180, 0.12, { to: on ? 140 : 240, type: 'square', vol: 0.06, lp: 900 });
              if (on && G.map) { const n = G.map.mkGates.filter((g) => (g.e.ch || 0) === (k.ch || 0)).length; floatText(k.x, k.y - 24, n ? `${GATE_WORD(k.ch).toUpperCase()} GATES` : 'CLICK', CH_COLS[k.ch || 0], !!n); }
            }
          }
          break;
        }
        default: break;
      }
      if (k.t === 'nt' || k.t === 'cq') k.inside = inside;
    }
    // snakes that talk
    if (room.mkTalk && room.mkTalk.length) {
      for (const sn of room.mkTalk) {
        if (sn.mkSay && !sn.mkSaid && sn.alive && G.t >= sn.mkSayAt) { sn.mkSaid = G.t; safe(() => Sfx.hiss(0.35)); }
        if (sn.mkDie && !sn.mkDied && (!sn.alive || sn.hp <= 0)) { sn.mkDied = true; (room.mkWords || (room.mkWords = [])).push({ x: sn.x, y: sn.y - 14, txt: sn.mkDie, t: G.t }); }
      }
      if (room.mkTalk.every((s) => s.mkDied || !s.mkDie) && room.mkTalk.every((s) => !s.alive)) room.mkTalk = [];
    }
  }
  function drawBubble(c, x, y, text, a, look) {
    c.save(); c.globalAlpha = a;
    c.font = `700 9.5px ${FONT}`;
    const lines = wrapText(c, text, 120);
    if (!lines.length) { c.restore(); return; }
    const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 14, h = lines.length * 11.5 + 8;
    const bx = clamp(x - w / 2, 4, RW - w - 4); let by = y - h - 8;
    if (by < 2) by = y + 18;
    const bg = look === 'die' ? '#2a1414' : '#efe2c4', fg = look === 'die' ? '#ffb4bc' : '#2a1a0c', ln = look === 'die' ? '#c8202a' : '#5a3a1a';
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(bx + 2, by + 3, w, h);
    c.fillStyle = bg; c.fillRect(bx, by, w, h);
    c.strokeStyle = ln; c.lineWidth = 1.2; c.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
    if (by < y) { c.fillStyle = bg; c.beginPath(); c.moveTo(x - 4, by + h - 0.5); c.lineTo(x, by + h + 5); c.lineTo(x + 4, by + h - 0.5); c.fill(); }
    c.fillStyle = fg; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach((l, i) => c.fillText(l, bx + 7, by + 4.5 + i * 11.5));
    c.restore();
  }
  safe(() => {
    const ure8 = updateRoomExtras;
    updateRoomExtras = function (dt, room, frozen) {
      ure8.apply(this, arguments);
      if (room && room.mkE && G.map && G.state === 'play' && !Pop.on) safe(() => mk8Update(dt, room));
    };
    const df8 = drawFloorThings;
    drawFloorThings = function (c, room, t) {
      if (room && room.mkE && room.mkE.length) safe(() => { for (const k of room.mkE) if (!k.dead && (k.t === 'tx' || k.t === 'pl')) ART[k.t](c, k.x, k.y, k, t, 'game'); });
      df8.apply(this, arguments);
      if (room && room.mkE && room.mkE.length) safe(() => { for (const k of room.mkE) if (!k.dead && (k.t === 'nt' || k.t === 'cq')) ART[k.t](c, k.x, k.y, k, t, 'game'); });
    };
    const gl8 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      gl8.apply(this, arguments);
      if (!room) return;
      safe(() => {
        if (room.mkE) {
          c.globalCompositeOperation = 'lighter';
          for (const k of room.mkE) {
            if (k.dead) continue;
            if (k.t === 'cq' && !k.used) glowDot(c, k.x, k.y - 4, 22, '#ffc53a', 0.16 + 0.06 * Math.sin(t * 3 + k.t0));
            else if (k.t === 'nt' && !k.read) glowDot(c, k.x, k.y, 18, '#efe2c4', 0.1 + 0.05 * Math.sin(t * 2 + k.t0));
            else if (k.t === 'tx' && k.fx === 1) glowDot(c, k.x, k.y, 20 + TX_SIZE[k.sz || 2] * 1.4, TX_COLS[k.cl || 0], 0.14);
            else if (k.t === 'pl' && k.down) glowDot(c, k.x, k.y, 24, CH_COLS[k.ch || 0], 0.3);
          }
          c.globalCompositeOperation = 'source-over';
        }
        if (room.mkTalk) for (const sn of room.mkTalk) {
          if (!sn.mkSaid || !sn.alive) continue;
          const age = G.t - sn.mkSaid, hold = 2.4 + sn.mkSay.length * 0.05, a = age < 0.15 ? age / 0.15 : age > hold ? Math.max(0, 1 - (age - hold) / 0.4) : 1;
          if (a > 0.01) drawBubble(c, sn.x, sn.y - (sn.headR || 10) - 4, sn.mkSay, a, 'say');
        }
        if (room.mkWords && room.mkWords.length) {
          room.mkWords = room.mkWords.filter((w) => G.t - w.t < 2.8);
          for (const w of room.mkWords) { const age = G.t - w.t; drawBubble(c, w.x, w.y - age * 6, w.txt, age > 2.3 ? (2.8 - age) / 0.5 : 1, 'die'); }
        }
      });
    };
    const xl8 = extraLights;
    extraLights = function (room, light) {
      xl8.apply(this, arguments);
      if (!room || !room.mkE) return;
      for (const k of room.mkE) {
        if (k.dead) continue;
        if (k.t === 'cq' && !k.used) light(k.x, k.y, 40, 0.45);
        else if (k.t === 'tx' && k.fx === 1) light(k.x, k.y, 30 + TX_SIZE[k.sz || 2] * 1.5, 0.4);
        else if (k.t === 'nt' && !k.read) light(k.x, k.y, 24, 0.25);
      }
    };
  });

  /* ---- intros, room lines and the last word */
  safe(() => {
    Hooks.layer('Game.loadLevel', 'v12.4 floor text', function (next, i) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => {
        const M = RTM.cur, F = M.floors[G.levelIdx] || M.floors[0];
        const q = [];
        if (G.levelIdx === 0 && M.it && !RTM.startRoom) q.push({ look: 'intro', kick: M.author ? 'A map by ' + M.author : 'A map', title: M.name, text: M.it, ok: 'Start' });
        if (F && F.it) q.push({ look: 'story', kick: floorLabel(G.levelIdx), title: F.name || G.levelDef.name || '', text: F.it, ok: 'Go' });
        if (q.length) { const run = G.run; setTimeout(() => { if (G.run === run && G.state === 'play') for (const o of q) M74.popShow(o); }, 1300); }
      });
      return r;
    });
    Hooks.layer('Game.enterRoom', 'v12.4 room words', function (next, room) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => {
        if (room && room.mkR && room.mkR.ie && !room.mkIeDone) { room.mkIeDone = true; setTimeout(() => { if (G.room === room && G.state === 'play') capShow(room.mkR.ie); }, 450); }
        else if (room && G.room === room) capHide();
      });
      return r;
    });
    Hooks.layer('Game.clearRoom', 'v12.4 room words', function (next, room) {
      const was = room && room.cleared;
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (inMap()) safe(() => { if (room && !was && room.cleared && room.mkR && room.mkR.ic && !room.mkIcDone) { room.mkIcDone = true; setTimeout(() => { if (G.room === room && G.state === 'play') capShow(room.mkR.ic); }, 700); } });
      return r;
    });
    const w8 = Game.win;
    Game.win = function () {
      const r = w8.apply(this, arguments);
      if (inMap() && RTM.cur.ot) safe(() => { UI.el.winLead.textContent = RTM.cur.ot + '  ' + UI.el.winLead.textContent; });
      return r;
    };
  });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
