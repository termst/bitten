/* src/93-v1410-coop.js: v14.10, the coop items left open in v14.0 to v14.9.
   F9  recap on the game over and win screens: per apple kills, damage dealt (by source), damage taken, what bit last, powerups.
   B6  room wide effects (air horn, the drop, bass waves, stomps, gusts, motions, vetoes, the gavel, sky rain) are capped for the
       team: with k apples carrying one, each one hits at 1.5 / k, so the team total is at most 1.5x one apple's.
   M9  couch: the till and the contract panel show which apple chooses (one shared screen still pauses for it).
   A Multiplayer tab in How to play, and three coop achievements.
   B8 (room curses for the whole team) is teamFlag14 in 01-core.js, read where the curse acts. Sim side: no Math.random here. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe93'); return fb; } };
  const B = window.__bitten;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const multi = () => MP14.on && G.players && G.players.length > 1;

  /* ---------------------------------------------------------------- B6: the team cap on room wide effects */
  const ROOMWIDE14 = ['airHorn9', 'theDrop9', 'bassWave9', 'stomp', 'gust', 'passMotion', 'vetoAll', 'gavelOrder', 'skyRain10'];
  const RW = { on: 0, k: 1 };
  // apples that can fire a room wide effect: their items carry a blast-like clash tag (32-clash.js)
  const roomItem = (id) => /\b(blast|killblast|deathblast|party)\b/.test((typeof CLASH_TAGS13 !== 'undefined' && CLASH_TAGS13[id]) || '');
  const carriers = () => { let n = 0; for (const P of livePlayers14()) if (P.items && P.items.some(roomItem)) n++; return Math.max(1, n); };
  for (const name of ROOMWIDE14) safe(() => {
    const f0 = window[name]; if (typeof f0 !== 'function') return;
    window[name] = function () {
      if (!multi()) return f0.apply(this, arguments);
      RW.on++; RW.k = carriers();
      try { return f0.apply(this, arguments); } finally { RW.on--; }
    };
  });
  Hooks.layer('Snake.hurt', 'v14.10 B6 team cap', function (next, amount, fx, fy, isPoison) {
    if (RW.on && multi() && RW.k > 1 && amount > 0) amount *= Math.min(1, 1.5 / RW.k);
    return next.call(this, amount, fx, fy, isPoison);
  });

  /* ---------------------------------------------------------------- F9: the recap */
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function iconCv(id, px) {
    const d = dpr(), cv = document.createElement('canvas');
    cv.width = Math.round(px * d); cv.height = Math.round(px * d); cv.style.width = cv.style.height = px + 'px';
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, px / 2 * d, px / 2 * d);
    safe(() => drawItemIcon(c, id, px * 0.7, 1));
    cv.title = (thingInfo(id) || {}).name || id;
    return cv;
  }
  function recap(panelId) {
    const host = document.getElementById(panelId); if (!host) return;
    const old = host.parentNode && host.parentNode.querySelector('.recap14'); if (old) old.remove();
    if (!multi()) return;
    const C = B.coop14; if (!C || !C.stats) return;
    const map = C.stats();
    const box = document.createElement('div'); box.className = 'recap14';
    box.innerHTML = '<h3>Team recap</h3>';
    let best = null;
    const rows = G.players.map((P) => {
      const s = map.get(P) || { dealt: {}, kills: 0, taken: 0, killer: '' };
      const dealt = Object.values(s.dealt).reduce((a, b) => a + b, 0);
      if (!best || dealt > best.d) best = { P, d: dealt };
      return { P, s, dealt };
    });
    for (const { P, s, dealt } of rows) {
      const card = document.createElement('div'); card.className = 'rc14';
      card.style.setProperty('--c', P.color14 || '#ece2d4');
      const src = Object.entries(s.dealt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${esc(k)} ${Math.round(v)}`).join(', ');
      const down = P.ghost14 || P.hp <= 0;
      card.innerHTML = `<div class="rc14-h"><i></i><b>${esc(P.name14 || 'Apple')}</b>${best && best.P === P && rows.length > 1 && dealt > 0 ? '<span class="rc14-mvp">Most damage</span>' : ''}</div>
<dl><dt>Kills</dt><dd>${s.kills | 0}</dd><dt>Damage dealt</dt><dd>${Math.round(dealt)}</dd><dt>Damage taken</dt><dd>${(s.taken / 2).toFixed(1)} apples</dd>
${src ? `<dt>From</dt><dd>${src}</dd>` : ''}${down && s.killer ? `<dt>Bitten by</dt><dd>${esc(s.killer)}</dd>` : ''}</dl><div class="rc14-it"></div>`;
      const it = card.querySelector('.rc14-it');
      for (const id of (P.items || []).slice(0, 14)) it.appendChild(iconCv(id, 26));
      if ((P.items || []).length > 14) { const m = document.createElement('span'); m.textContent = '+' + (P.items.length - 14); it.appendChild(m); }
      box.appendChild(card);
    }
    host.insertAdjacentElement('afterend', box);
  }
  safe(() => {
    const go0 = Game.gameOver;
    Game.gameOver = function () { const r = go0.apply(this, arguments); safe(() => recap('overStats')); return r; };
    const w0 = Game.win;
    Game.win = function () { const r = w0.apply(this, arguments); if (G.state === 'win') safe(() => recap('winStats')); return r; };
  });

  /* ---------------------------------------------------------------- M9: the couch owner of the till and the contract */
  safe(() => {
    const ir0 = Input.reset;
    Input.reset = function () {
      const r = ir0.apply(this, arguments);
      safe(() => {
        for (const id of ['sell', 'contract24']) { const el = document.getElementById(id); const ch = el && el.querySelector('.owner14'); if (ch) ch.remove(); }
        if (!multi() || NET14.live || (G.state !== 'sell' && G.state !== 'contract')) return;
        const el = document.getElementById(G.state === 'sell' ? 'sell' : 'contract24'); if (!el) return;
        const P = G.player, chip = document.createElement('div');
        chip.className = 'owner14'; chip.style.setProperty('--c', P.color14 || '#ece2d4');
        chip.innerHTML = `<i></i>${esc(P.name14 || 'Apple')} chooses`;
        (el.querySelector('.sheet-inner, .ct-inner, div') || el).prepend(chip);
      });
      return r;
    };
  });

  /* ---------------------------------------------------------------- achievements for playing together */
  safe(() => {
    STAT_DEFS.splice(STAT_DEFS.length - 2, 0, ['coopWins', 'Coop wins'], ['coopRevives', 'Apples revived'], ['onlineFloors', 'Online floors cleared']);
    ACHS.push(
      { id: 'coopwin', reward: 'buddy', name: 'Better Together', desc: 'Win a run with two or more apples.', stat: 'coopWins', goal: 1 },
      { id: 'cooprevive', reward: 'halo', name: 'Back On Your Stem', desc: 'Revive 10 apples from the klokhuis in coop.', stat: 'coopRevives', goal: 10 },
      { id: 'onlinefloor', reward: 'twin', name: 'Long Distance', desc: 'Clear 5 floors in online coop.', stat: 'onlineFloors', goal: 5 },
    );
    const w0 = Game.win;
    Game.win = function () { const was = G.state; const r = w0.apply(this, arguments); if (was !== 'win' && G.state === 'win' && multi()) safe(() => Meta.add('coopWins')); return r; };
    Hooks.layer('Game.loadLevel', 'v14.10 online floors', function (next, i) {
      const prev = G.levelIdx, r = next.apply(this, [].slice.call(arguments, 1));
      if (NET14.live && multi() && G.run && i > 0 && i === prev + 1) safe(() => Meta.add('onlineFloors'));
      return r;
    });
    // a revive is a ghost that stands up again: seen from the update, so 81's revive code stays as it is
    const ghost = new WeakMap();
    Hooks.layer('Game.update', 'v14.10 revive count', function (next) {
      const r = next.apply(this, [].slice.call(arguments, 1));
      if (multi() && G.run) for (const P of G.players) { const g = !!P.ghost14; if (ghost.get(P) && !g && P.hp > 0) safe(() => Meta.add('coopRevives')); ghost.set(P, g); }
      return r;
    });
  });

  /* ---------------------------------------------------------------- How to play: Multiplayer */
  safe(() => {
    const tabs = document.getElementById('howTabs'), how = document.querySelector('#how .sheet-inner');
    if (!tabs || !how || document.getElementById('t-mp14')) return;
    const tb = document.createElement('button'); tb.type = 'button'; tb.setAttribute('role', 'tab'); tb.id = 't-mp14'; tb.dataset.tab = 'mp14';
    tb.setAttribute('aria-controls', 'tab-mp14'); tb.setAttribute('aria-selected', 'false'); tb.tabIndex = -1; tb.textContent = 'Multiplayer';
    const mus = tabs.querySelector('[data-tab="music"]');
    if (mus) tabs.insertBefore(tb, mus); else tabs.appendChild(tb);
    const panel = document.createElement('div'); panel.className = 'tabpanel9'; panel.id = 'tab-mp14'; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 't-mp14'); panel.hidden = true;
    const tips = [
      ['Couch', 'Up to 4 apples on one screen. Coop on the start screen, Couch tab: every apple picks a character, a look and a name. Keyboard and mouse is apple 1, every gamepad joins with A.'],
      ['Online', 'Coop, Online tab. Host makes a room code, friends join with it. The host picks the mode and the rules in the Game Maker. Works on phones too.'],
      ['Coop and Coop Plus', 'Coop: every apple has its own coins, contracts and pumps. Coop Plus: one purse, and every powerup goes to every apple.'],
      ['Doors', 'A door opens when every apple is close, or 3 seconds after the first one walks in.'],
      ['The klokhuis', 'An apple that is eaten becomes a ghost. Stand next to it for 3 seconds to bring it back with 2 apples of health. The run ends when every apple is a ghost.'],
      ['More apples, more snakes', 'Every extra apple adds a snake to each fight, more boss health and more drops. Chests give one extra pick per apple.'],
      ['Team rules', 'Room wide blasts from several apples add up to at most 1.5 times one apple. A curse that darkens the room or calls extra snakes counts for the whole team while its apple lives.'],
      ['Panels', 'Online, the till and contracts are personal: only you see yours and the run keeps going. On the couch the screen waits, and the panel says which apple chooses.'],
      ['Recap', 'After a coop run: kills, damage, what bit you last and the powerups of every apple.'],
      ['Progress', 'Online guests keep what they earned: stats, powerups found, achievements.'],
    ];
    panel.innerHTML = `<p class="intro9">Play Bitten with up to four apples, on one screen or online.</p>
<div class="tips9">${tips.map(([b, s]) => `<div class="tip9"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>`;
    const musPanel = document.getElementById('tab-music');
    if (musPanel && musPanel.parentNode === how) how.insertBefore(panel, musPanel); else how.appendChild(panel);
    if (!HOW_TABS9.includes('mp14')) { const i = HOW_TABS9.indexOf('music'); if (i >= 0) HOW_TABS9.splice(i, 0, 'mp14'); else HOW_TABS9.push('mp14'); }
  });

  /* ---------------------------------------------------------------- styles */
  safe(() => {
    const st = document.createElement('style'); st.id = 'coop1410css';
    st.textContent = `.recap14{margin:10px auto 4px;max-width:640px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;text-align:left}
.recap14 h3{grid-column:1/-1;margin:0;font:700 15px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#cdbfa9}
.rc14{border:2px solid var(--c);border-radius:10px;padding:6px 8px;background:rgba(0,0,0,.28)}
.rc14-h{display:flex;align-items:center;gap:6px;font:700 17px "Barlow Condensed",sans-serif}.rc14-h i{width:10px;height:10px;border-radius:50%;background:var(--c)}
.rc14-mvp{margin-left:auto;font-size:12px;color:#ffd23a}.rc14 dl{display:grid;grid-template-columns:auto 1fr;gap:1px 8px;margin:4px 0;font-size:14px}.rc14 dt{opacity:.7}.rc14 dd{margin:0}
.rc14-it{display:flex;flex-wrap:wrap;gap:2px;align-items:center}.rc14-it span{font-size:12px;opacity:.7}
.owner14{display:inline-flex;align-items:center;gap:6px;margin:0 0 6px;padding:2px 10px;border-radius:99px;border:2px solid var(--c);font:700 15px "Barlow Condensed",sans-serif;color:#ece2d4;background:rgba(0,0,0,.35)}
.owner14 i{width:10px;height:10px;border-radius:50%;background:var(--c)}`;
    document.head.appendChild(st);
  });

  Object.assign(B, { COOP1410: { recap, ROOMWIDE14, RW, carriers, teamFlag: (f) => teamFlag14(f) } });
})();
