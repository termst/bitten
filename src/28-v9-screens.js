/* src/28-v9-screens.js: v9 screens: story list, tankstation till, choices. From v9. Lines 15338 to 15636 of the v13.7 script. */
/* =====================================================================
   Version 9 screens: the story list, the till at the tankstation, a
   pause screen that fits on a phone, and a How to play guide in tabs
   ===================================================================== */
const HOW_TABS9 = ['basics', 'controls', 'rooms', 'snakes', 'items', 'chars', 'modes'];

(() => {
  const init0 = UI.init;
  UI.init = function () {
    init0.call(this);
    for (const id of ['stories', 'storyList', 'storyCount', 'btnStoriesBack', 'sell', 'sellList', 'sellCoins', 'btnSellDone', 'pauseDetail', 'pauseTunes', 'howTabs', 'howFilter', 'howSearch', 'howChars']) this.el[id] = document.getElementById(id);
    const on = (id, fn) => { if (this.el[id]) this.el[id].addEventListener('click', (e) => { e.preventDefault(); fn(); }); };
    on('btnStoriesBack', () => this.closeStories());
    on('btnSellDone', () => this.closeSell());
    this._chatWho = 'jens';
    // the guide's tabs work with a mouse, a thumb and the arrow keys
    const tabs = this.el.howTabs;
    if (tabs) {
      tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { e.preventDefault(); this.howTab(b.dataset.tab, true); } });
      tabs.addEventListener('keydown', (e) => {
        const i = HOW_TABS9.indexOf(this._howTab || 'basics');
        let j = -1;
        if (e.key === 'ArrowRight') j = (i + 1) % HOW_TABS9.length; else if (e.key === 'ArrowLeft') j = (i - 1 + HOW_TABS9.length) % HOW_TABS9.length;
        else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = HOW_TABS9.length - 1;
        if (j >= 0) { e.preventDefault(); this.howTab(HOW_TABS9[j], true); }
      });
    }
    if (this.el.howFilter) this.el.howFilter.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { e.preventDefault(); this._howF = b.dataset.f; this.filterItems9(); } });
    if (this.el.howSearch) this.el.howSearch.addEventListener('input', () => this.filterItems9());
    this.buildHowChars9();
  };
})();

Object.assign(UI, {
  hidePanels() { for (const id of ['menu', 'how', 'chars', 'achs', 'pause', 'over', 'win', 'play', 'settings', 'stories', 'sell']) if (this.el[id]) this.el[id].hidden = true; },
  back() {
    if (this.el.sell && !this.el.sell.hidden) this.closeSell();
    else if (!this.el.how.hidden) this.closeHow();
    else if (this.el.stories && !this.el.stories.hidden) this.closeStories();
    else if (!this.el.chars.hidden) this.closeChars();
    else if (!this.el.achs.hidden) this.closeAchs();
    else if (!this.el.settings.hidden) this.closeSettings();
    else if (!this.el.play.hidden) this.closePlay();
  },
  refresh() {
    const U = Save.data.unlocks;
    if (Save.data.char !== 'apple' && !U[Save.data.char]) Save.data.char = 'apple';
    if (!MODES[Save.data.mode]) Save.data.mode = 'arcade';
    if (!DIFFS[Save.data.diff]) Save.data.diff = 'normal';
    this.el.charNow.textContent = CHARS[Save.data.char].name;
    this.el.btnChar.classList.toggle('new', CHAR_IDS.some((id) => id !== 'apple' && U[id] && !Save.data.seen[id]));
    paintChar(this.el.charFace, Save.data.char, false, { face: true });
    const mode = Save.data.mode, dname = mode === 'daily' ? 'Normal' : DIFFS[Save.data.diff === 'nightmare' && !U.nightmare ? 'hard' : Save.data.diff].name;
    this.el.playNow.textContent = `${MODES[mode].name}, ${dname}`;
    this.el.achNow.textContent = `${Meta.done()} of ${ACHS.length} done`;
    this.el.setNow.textContent = `Sound ${Save.data.sound ? 'on' : 'off'}${COARSE ? `, aim assist ${Save.data.assist ? 'on' : 'off'}` : ''}`;
    const sn = document.getElementById('storyNow');
    if (sn) {
      const open = STORY_ORDER9.filter((id) => storyOpen9(id)).length, done = STORY_ORDER9.filter((id) => storyDone9(id)).length;
      sn.textContent = open > 1 ? `${STORY_ORDER9.length} stories, ${done} finished` : 'Jensbabba has a plan';
    }
    this.el.btnStory.classList.toggle('newst', STORY_ORDER9.some((id) => storyOpen9(id) && !storyDone9(id) && id !== 'lockdown' && !Save.data.seen['story_' + id]));
    const b = Save.data.best, parts = [];
    if (b.level > 0) parts.push(`Deepest floor ${b.level}`);
    if (b.endless > 0) parts.push(`Endless floor ${b.endless}`);
    if (b.kills > 0) parts.push(`Most snakes ${b.kills}`);
    if (b.wins > 0) parts.push(b.wins === 1 ? 'Escaped once' : `Escaped ${b.wins} times`);
    this.el.best.textContent = parts.map((x) => x.replace(/ /g, ' ')).join('  ·  ');
  },

  /* ---- the story list */
  openStories() {
    this.hide('menu'); this.show('stories'); this.el.stories.scrollTop = 0;
    for (const id of STORY_ORDER9) if (storyOpen9(id)) Save.data.seen['story_' + id] = 1;
    Save.store();
    this.paintStories();
    setTimeout(() => { const f = this.el.storyList.querySelector('button:not([aria-disabled="true"])'); (f || this.el.btnStoriesBack).focus({ preventScroll: true }); }, 50);
  },
  closeStories() { this.hide('stories'); this.show('menu'); this.refresh(); this.el.btnStory.focus({ preventScroll: true }); },
  paintStories() {
    const box = this.el.storyList; box.innerHTML = '';
    let n = 0;
    STORY_ORDER9.forEach((id, i) => {
      const S = STORIES9[id], open = storyOpen9(id), done = storyDone9(id);
      if (done) n++;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'stcard' + (open ? '' : ' locked') + (done ? ' done' : '');
      if (!open) b.setAttribute('aria-disabled', 'true');
      b.innerHTML = `<canvas aria-hidden="true"></canvas><div class="stbody"><span class="stno"></span><b></b><span class="sttag"></span><p></p><span class="ststate"></span></div>`;
      b.querySelector('.stno').textContent = `Story ${i + 1}  ·  ${S.levels.length} chapters`;
      b.querySelector('b').textContent = open ? S.title : '???';
      b.querySelector('.sttag').textContent = open ? S.tag : 'Locked';
      b.querySelector('p').textContent = open ? S.blurb : `Finish ${STORIES9[S.needs].title} to open this story.`;
      b.querySelector('.ststate').textContent = done ? 'Finished. Play it again.' : open ? 'Not finished yet' : 'Locked';
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (!open) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); Sfx.init(); Sfx.thud(); return; }
        Sfx.init(); Game.startStory(id);
      });
      box.appendChild(b);
      requestAnimationFrame(() => paintStoryArt9(b.querySelector('canvas'), id, !open));
    });
    this.el.storyCount.textContent = `${n} of ${STORY_ORDER9.length} finished`;
  },

  /* ---- the till: sell what you carry */
  openSell() {
    if (G.state !== 'play') return;
    G.state = 'sell';
    Input.reset();
    UI.hideOverlays();
    this.el.btnPause.hidden = true;
    this.show('sell');
    this.paintSell();
    setTimeout(() => this.el.btnSellDone.focus({ preventScroll: true }), 60);
  },
  closeSell() {
    if (this.el.sell.hidden) return;
    this.hide('sell');
    if (G.state === 'sell') { G.state = 'play'; this.el.btnPause.hidden = false; }
    View.cv.focus({ preventScroll: true });
  },
  paintSell() {
    const P = G.player, box = this.el.sellList; box.innerHTML = '';
    this.el.sellCoins.innerHTML = `<span>Coins</span><b>${G.run.coins}</b>`;
    if (!P.items.length) { box.innerHTML = '<p class="none">Nothing to sell. Come back with something shiny.</p>'; return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const id of P.items) {
      const it = ITEMS[id], ok = canSell9(P, id), price = sellPrice(id, P);
      const row = document.createElement('div'); row.className = 'srow' + (it.rare ? ' rare' : '');
      row.innerHTML = '<canvas aria-hidden="true"></canvas><div class="sinfo"><b></b><span></span></div><button type="button" class="btn sbtn"></button>';
      row.querySelector('b').textContent = it.name; row.querySelector('span').textContent = it.desc;
      const btn = row.querySelector('button');
      btn.textContent = ok ? `Sell  +${price}` : 'Part of you';
      btn.disabled = !ok;
      btn.setAttribute('aria-label', ok ? `Sell ${it.name} for ${price} coins` : `${it.name} cannot be sold`);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!btn.dataset.armed) { btn.dataset.armed = '1'; btn.textContent = `Sure? +${price}`; btn.classList.add('warn'); setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = `Sell  +${price}`; btn.classList.remove('warn'); } }, 2600); return; }
        if (!sellItem9(P, id)) return;
        G.run.coins += price; Meta.add('sold'); Sfx.register();
        floatText(P.x, P.y - 30, `+${price}`, '#ffd84a', true);
        UI.banner(`Sold: ${it.name}`, `${price} coins. It is gone for good.`);
        this.paintSell();
      });
      box.appendChild(row);
      const cv = row.querySelector('canvas'); const S = 40;
      cv.width = Math.round(S * dpr); cv.height = Math.round(S * dpr);
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, S / 2 * dpr, S / 2 * dpr);
      drawItemIcon(c, id, S * 0.74, 1);
    }
  },

  /* ---- the pause screen: compact, scrolls on a phone, tap an icon to read it */
  fillPause() {
    const P = G.player; if (!P) return;
    const st = playerStats(P).map(([k, v, f]) => `<div><dt>${k}</dt><dd>${f(v)}</dd></div>`);
    if (G.run) st.push(`<div><dt>COINS</dt><dd>${G.run.coins}</dd></div>`);
    { const ep = enemyPowerPct(P); st.push(`<div><dt>FOES</dt><dd>+${ep.toFixed(ep % 1 ? 1 : 0)}%</dd></div>`); }
    this.el.pauseStats.innerHTML = st.join('');
    const nu = Meta.nextUnlock(), pn = this.el.pauseNext;
    pn.hidden = !nu;
    if (nu) { pn.innerHTML = 'Next unlock: <b></b>. <span></span>'; pn.querySelector('b').textContent = CHARS[nu.id].name; pn.querySelector('span').textContent = `${nu.a.desc.replace(/\.$/, '')} (${Math.floor(Meta.progress(nu.a))}/${nu.a.goal})`; }
    const tunes = this.el.pauseTunes;
    if (tunes) {
      const parts = P.tunes.map((id) => PUMP_BY_ID[id].name).concat(P.cuts.map((id) => CUT_BY_ID[id].name));
      tunes.hidden = !parts.length;
      tunes.textContent = parts.length ? `Tuned: ${parts.join(', ')}` : '';
    }
    const box = this.el.pauseItems; box.innerHTML = '';
    const det = this.el.pauseDetail;
    const all = P.items.concat(P.curses, P.downs);
    if (!all.length) { box.innerHTML = '<span class="none">No powerups yet. Break things.</span>'; if (det) det.hidden = true; return; }
    if (det) { det.hidden = false; det.innerHTML = '<span class="dh">Tap a powerup to read what it does.</span>'; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const show = (id, b) => {
      const X = thingInfo(id);
      for (const q of box.children) q.classList.toggle('on', q === b);
      if (!det) return;
      det.innerHTML = '<b></b><em></em><span></span>';
      det.querySelector('b').textContent = X.name;
      det.querySelector('em').textContent = X.rare ? 'Legendary' : X.curse ? 'Curse' : X.down ? 'Downgrade' : 'Powerup';
      det.querySelector('em').className = X.rare ? 'r' : X.curse ? 'c' : X.down ? 'd' : '';
      det.querySelector('span').textContent = X.desc;
    };
    for (const id of all) {
      const X = thingInfo(id);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pit' + (X.rare ? ' rare' : X.curse ? ' curse' : X.down ? ' down' : '');
      b.setAttribute('aria-label', `${X.name}. ${X.curse ? 'Curse. ' : X.down ? 'Downgrade. ' : ''}${X.desc}`);
      b.innerHTML = '<canvas aria-hidden="true"></canvas>';
      b.addEventListener('click', (e) => { e.preventDefault(); show(id, b); });
      b.addEventListener('focus', () => show(id, b));
      box.appendChild(b);
      const cv = b.querySelector('canvas'); const S = 34;
      cv.width = Math.round(S * dpr); cv.height = Math.round(S * dpr);
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, S / 2 * dpr, S / 2 * dpr);
      drawItemIcon(c, id, S * 0.74, 1);
    }
  },

  /* ---- How to play, in tabs */
  openHow(from) {
    this.howFrom = from;
    this.hide(from); this.show('how');
    this.el.how.scrollTop = 0;
    this.howTab(this._howTab || 'basics', false);
    const b = this.el.btnHowBack; setTimeout(() => b.focus({ preventScroll: true }), 50);
  },
  closeHow() { this.hide('how'); this.show(this.howFrom); if (this.howFrom === 'menu') this.el.btnHow.focus({ preventScroll: true }); else if (this.howFrom === 'pause') this.fillPause(); },
  howTab(id, focus) {
    this._howTab = id;
    const tabs = this.el.howTabs; if (!tabs) return;
    for (const b of tabs.querySelectorAll('[data-tab]')) {
      const on = b.dataset.tab === id;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus({ preventScroll: true });
    }
    for (const t of HOW_TABS9) { const p = document.getElementById('tab-' + t); if (p) p.hidden = t !== id; }
    const panel = document.getElementById('tab-' + id);
    if (id === 'chars') this.buildHowChars9();
    if (id === 'items') this.filterItems9();
    if (panel) requestAnimationFrame(() => paintBestiary(panel));
  },
  buildHowChars9() {
    const box = this.el.howChars; if (!box) return;
    box.innerHTML = '';
    for (const id of CHAR_IDS) {
      const C = CHARS[id], open = id === 'apple' || !!Save.data.unlocks[id];
      const f = document.createElement('figure');
      f.innerHTML = `<canvas data-char="${id}" aria-hidden="true"></canvas><figcaption><b></b><span class="d"></span><span class="perk9"></span></figcaption>`;
      f.querySelector('b').textContent = open ? C.name : '???';
      f.querySelector('.d').textContent = open ? C.desc : `Locked. To unlock: ${C.unlock}`;
      f.querySelector('.perk9').textContent = open ? C.perk || '' : '';
      box.appendChild(f);
    }
  },
  buildItemCards() {
    const fill = (boxId, ids, src, cls, tag) => {
      const box = this.el[boxId]; if (!box) return;
      box.innerHTML = '';
      for (const id of ids) {
        const it = src[id], f = document.createElement('figure');
        f.className = cls; f.dataset.id = id;
        const lock = it.lock && ACHS.find((a) => a.id === it.lock);
        f.innerHTML = `<canvas data-item="${id}" aria-hidden="true"></canvas><figcaption><b></b>${tag ? `<span class="tag${tag[0]}">${tag[1]}</span>` : ''}<span class="d"></span>${lock ? '<span class="lk9"></span>' : ''}</figcaption>`;
        f.querySelector('b').textContent = it.name; f.querySelector('.d').textContent = it.desc;
        if (lock) f.querySelector('.lk9').textContent = `Joins the pool after: ${lock.name}`;
        box.appendChild(f);
      }
    };
    const norm = ITEM_IDS.filter((id) => !ITEMS[id].rare), rare = ITEM_IDS.filter((id) => ITEMS[id].rare);
    fill('itemCards', norm.concat(rare), ITEMS, '', null);
    for (const f of this.el.itemCards ? this.el.itemCards.children : []) if (ITEMS[f.dataset.id].rare) { f.classList.add('rare'); f.querySelector('figcaption b').insertAdjacentHTML('afterend', '<span class="tagr">Legendary</span>'); }
    fill('curseCards', CURSE_IDS, CURSES, 'curse', ['c', 'Curse']);
    fill('downCards', DOWN_IDS, DOWNS, 'down', ['d', 'Downgrade']);
  },
  filterItems9() {
    const f = this._howF || 'all', q = (this.el.howSearch && this.el.howSearch.value || '').trim().toLowerCase();
    if (this.el.howFilter) for (const b of this.el.howFilter.querySelectorAll('[data-f]')) b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false');
    const showSec = { itemCards: f === 'all' || f === 'power' || f === 'legend' || f === 'locked', curseCards: f === 'all' || f === 'curse', downCards: f === 'all' || f === 'down' };
    for (const boxId in showSec) {
      const box = this.el[boxId]; if (!box) continue;
      const wrap = box.closest('.isec9'); if (wrap) wrap.hidden = !showSec[boxId];
      for (const fig of box.children) {
        const id = fig.dataset.id, it = thingInfo(id);
        let ok = true;
        if (boxId === 'itemCards') { if (f === 'legend') ok = !!it.rare; else if (f === 'power') ok = !it.rare; else if (f === 'locked') ok = !!it.lock && !itemUnlocked(id); }
        if (q && !(`${it.name} ${it.desc}`.toLowerCase().includes(q))) ok = false;
        fig.hidden = !ok;
      }
    }
  },
});

function paintStoryArt9(cv, id, locked) {
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || 300, h = cv.clientHeight || 120;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, h);
  if (id === 'lockdown') { g.addColorStop(0, '#22304e'); g.addColorStop(1, '#2a312d'); } else { g.addColorStop(0, '#3a1a4a'); g.addColorStop(1, '#1a2140'); }
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (id === 'lockdown') {
    drawPoster(c, w * 0.78, h * 0.42, 54, 66, 0.06);
    c.save(); c.translate(w * 0.36, h * 0.72); drawJensHead(c, h / 260, 'shout', 1, {}); c.restore();
  } else {
    c.fillStyle = 'rgba(232,200,74,0.9)'; c.fillRect(w * 0.42, h * 0.14, 64, 18); c.fillStyle = '#16181c'; c.font = `800 12px ${UIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('34 36 31', w * 0.42 + 32, h * 0.14 + 9.5);
    c.save(); c.translate(w * 0.26, h * 0.7); drawAlesenHead(c, h / 210, 'shout', 1, {}); c.restore();
    c.save(); c.translate(w * 0.74, h * 0.7); drawSenaleHead(c, h / 210, 'angry', 1, {}); c.restore();
  }
  if (locked) {
    c.fillStyle = 'rgba(8,6,6,0.82)'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(236,226,212,0.55)'; c.font = `800 ${Math.round(h * 0.4)}px "Grenze Gotisch", Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2);
  }
}

