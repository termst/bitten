/* src/18-game.js: Game flow, UI wiring, the main loop (frame). From v1 to v8. Lines 10996 to 11525 of the v13.7 script. */
/* =====================================================================
   Game flow, UI wiring, main loop
   ===================================================================== */
const G = {
  state: 'menu', t: 0, levelIdx: 0, levelDef: LEVELS[0], map: null, room: null, player: null,
  seeds: [], venom: [], particles: [], flashes: [], strikes: [], lobs: [],
  shake: 0, darkA: 0.8, hurtFlash: 0, fade: 0, whiteout: 0,
  trans: null, run: null, boss: null, hbT: 0, mode: 'arcade',
  diff: 'normal', D: DIFFS.normal, bossGroup: null, freeze: 0, flood: null, speedK: 1, bossSpeedK: 1,
  rng: null, errors: 0, errorLog: ERR14.log,                    /* T8 gameplay stream, T2 error count */
};
ERR14.g = G;

const MODE_ICONS = {
  arcade: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="18" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v10m-4-4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  endless: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 12a1 1 0 1 1-1-1 3 3 0 1 1-3 3 5 5 0 1 1 5 5 7 7 0 1 1 7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  rush: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11a7 7 0 1 1 14 0c0 2.6-1.2 4-3 4.8V19H8v-3.2C6.2 15 5 13.6 5 11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9.3" cy="11" r="1.6" fill="currentColor"/><circle cx="14.7" cy="11" r="1.6" fill="currentColor"/><path d="M11 19v-2m2 2v-2" stroke="currentColor" stroke-width="1.4"/></svg>',
  daily: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M8.5 3.5v4m7-4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="2.2" fill="currentColor"/></svg>',
};
const SETTING_KEYS = { music: 1, shake: 1, vibrate: 1, numbers: 1, info: 1 };

const UI = {
  el: {},
  confirmT: {},
  init() {
    const ids = ['menu', 'how', 'pause', 'over', 'win', 'card', 'banner', 'btnPause', 'btnPlay', 'btnHow', 'btnHowBack',
      'btnResume', 'btnHow2', 'btnRestart', 'btnQuit', 'btnRetry', 'btnOverMenu', 'btnAgain', 'btnWinMenu',
      'best', 'pauseWhere', 'overWhere', 'overStats', 'winStats', 'btnChar', 'appelNote', 'mikaNote',
      'story', 'storyBox', 'storyWho', 'storyText', 'storyCard', 'btnSkip', 'btnStory', 'chat', 'chatText', 'chatFace', 'winTitle', 'winLead', 'overTitle',
      'chars', 'btnCharsBack', 'charList', 'charCount', 'charFace', 'charNow', 'pauseStats', 'pauseItems', 'rotNote',
      'achs', 'btnAch', 'btnAchBack', 'achCount', 'lstats', 'alist', 'coll', 'collHead', 'toast', 'toastName', 'pauseNext', 'itemCards', 'krulNote',
      'btnSaveDl', 'btnSaveUp', 'btnSaveCode', 'btnCodePaste', 'saveFile', 'codeBox', 'saveCode', 'btnCodeCopy', 'btnCodeLoad', 'saveMsg',
      'play', 'btnPlayBack', 'modeList', 'diffList', 'diffDesc', 'btnPlayChar', 'playFace', 'playChar', 'btnGo',
      'settings', 'btnSet', 'btnSetBack', 'btnSet2', 'toggles', 'playNow', 'achNow', 'setNow', 'curseCards', 'downCards'];
    for (const id of ids) this.el[id] = document.getElementById(id);
    const on = (id, fn) => this.el[id].addEventListener('click', (e) => { e.preventDefault(); if (G.state !== 'pause') Sfx.init(); fn(); });
    on('btnPlay', () => this.openPlay());
    on('btnStory', () => this.openStories());
    on('btnGo', () => Game.startRun(false, Save.data.mode));
    on('btnPlayBack', () => this.closePlay());
    on('btnPlayChar', () => this.openChars('play'));
    this.el.btnSkip.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); Story.end(); });
    this.el.story.addEventListener('click', (e) => { e.preventDefault(); Story.next(); });
    paintAvatar(this.el.chatFace, true);
    on('btnChar', () => this.openChars('menu'));
    on('btnCharsBack', () => this.closeChars());
    on('btnAch', () => this.openAchs());
    on('btnAchBack', () => this.closeAchs());
    on('btnSet', () => this.openSettings('menu'));
    on('btnSet2', () => this.openSettings('pause'));
    on('btnSetBack', () => this.closeSettings());
    on('btnSaveDl', () => this.downloadSave());
    on('btnSaveUp', () => { this.el.saveFile.value = ''; this.el.saveFile.click(); });
    on('btnSaveCode', () => this.showCode());
    on('btnCodeCopy', () => this.copyCode());
    on('btnCodePaste', () => this.pasteCode());
    this.el.saveCode.addEventListener('paste', () => setTimeout(() => { if (/^\s*BITTEN-/i.test(this.el.saveCode.value)) this.loadText(this.el.saveCode.value, 'code'); }, 0));
    on('btnCodeLoad', () => this.loadText(this.el.saveCode.value, 'code'));
    this.el.saveFile.addEventListener('change', () => {
      const f = this.el.saveFile.files && this.el.saveFile.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => this.loadText(String(rd.result || ''), 'file');
      rd.onerror = () => this.saveMsg('That file could not be read.');
      rd.readAsText(f);
    });
    for (const b of this.el.toggles.querySelectorAll('.tog')) b.addEventListener('click', (e) => { e.preventDefault(); this.flip(b.dataset.set); });
    // T10: the claude.ai viewer can hand a file to the player (optional first try); elsewhere a normal download
    try { this.dlP = window.claude && window.claude.use ? window.claude.use('downloads') : null; } catch (e) { this.dlP = null; }
    this.buildChars();
    this.buildItemCards();
    this.buildModes();
    on('btnHow', () => this.openHow('menu'));
    on('btnHow2', () => this.openHow('pause'));
    on('btnHowBack', () => this.closeHow());
    on('btnPause', () => Game.pause());
    on('btnResume', () => Game.resume());
    on('btnRestart', () => this.confirm('btnRestart', 'Tap again to restart', 'Restart', () => Game.retry()));
    on('btnQuit', () => this.confirm('btnQuit', 'Tap again to leave', 'Menu', () => Game.toMenu()));
    on('btnRetry', () => Game.retry());
    on('btnAgain', () => (G.mode === 'story' ? Game.startStory() : Game.startRun(false, G.mode)));
    on('btnOverMenu', () => Game.toMenu());
    on('btnWinMenu', () => Game.toMenu());
    this.howFrom = 'menu'; this.charsFrom = 'menu'; this.setFrom = 'menu';
  },
  confirm(id, ask, label, fn) {
    const b = this.el[id];
    if (this.confirmT[id]) { clearTimeout(this.confirmT[id]); this.confirmT[id] = null; b.textContent = label; b.classList.remove('warn'); fn(); return; }
    b.textContent = ask; b.classList.add('warn');
    this.confirmT[id] = setTimeout(() => { this.confirmT[id] = null; b.textContent = label; b.classList.remove('warn'); }, 3000);
  },
  show(id) { const e = this.el[id]; e.hidden = false; e.classList.remove('enter'); void e.offsetWidth; e.classList.add('enter'); },
  hide(id) { this.el[id].hidden = true; },
  hidePanels() { for (const id of ['menu', 'how', 'chars', 'achs', 'pause', 'over', 'win', 'play', 'settings']) this.el[id].hidden = true; },
  back() {
    if (!this.el.how.hidden) this.closeHow();
    else if (!this.el.chars.hidden) this.closeChars();
    else if (!this.el.achs.hidden) this.closeAchs();
    else if (!this.el.settings.hidden) this.closeSettings();
    else if (!this.el.play.hidden) this.closePlay();
  },

  /* ---- mode select */
  buildModes() {
    const box = this.el.modeList; box.innerHTML = '';
    for (const id of MODE_IDS) {
      const M = MODES[id], b = document.createElement('button');
      b.type = 'button'; b.className = 'mcard'; b.dataset.id = id; b.setAttribute('role', 'radio');
      b.innerHTML = `${MODE_ICONS[id]}<b></b><p></p><span class="mb"></span>`;
      b.querySelector('b').textContent = M.name; b.querySelector('p').textContent = M.desc;
      b.addEventListener('click', (e) => { e.preventDefault(); Save.data.mode = id; Save.store(); Sfx.init(); Sfx.blip(); this.paintPlay(); });
      box.appendChild(b);
    }
    const seg = this.el.diffList; seg.innerHTML = '';
    for (const id of DIFF_IDS) {
      const D = DIFFS[id], b = document.createElement('button');
      b.type = 'button'; b.dataset.id = id; b.setAttribute('role', 'radio');
      b.innerHTML = `<b></b><span class="sk">${[1, 2, 3, 4].map((k) => `<i class="${k <= D.skulls ? 'f' : ''}"></i>`).join('')}</span><svg class="lk" viewBox="0 0 12 12" aria-hidden="true" hidden><rect x="2" y="5.5" width="8" height="6" rx="1.2" fill="currentColor"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
      b.querySelector('b').textContent = D.name;
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (Save.data.mode === 'daily') { this.el.diffDesc.textContent = 'The daily run is always on Normal, so everybody plays the same thing.'; return; }
        if (id === 'nightmare' && !Save.data.unlocks.nightmare) { this.el.diffDesc.textContent = `${D.name} is locked. ${D.unlock}`; Sfx.thud(); return; }
        Save.data.diff = id; Save.store(); Sfx.init(); Sfx.blip(); this.paintPlay();
      });
      seg.appendChild(b);
    }
  },
  modeBest(id) {
    const B = Save.data.best;
    if (id === 'arcade') return B.level ? `Deepest floor <em>${B.level}</em> of ${LEVELS.length}${Meta.value('wins') ? `, escaped <em>${Meta.value('wins')}</em>` : ''}` : 'Five floors deep';
    if (id === 'endless') return B.endless ? `Deepest floor <em>${B.endless}</em>` : 'No record yet';
    if (id === 'chaos') return B.chaos ? `Deepest layer <em>${B.chaos}</em> of 3${Meta.value('chaosWins') ? `, survived <em>${Meta.value('chaosWins')}</em>` : ''}` : 'Three layers, anything goes';
    if (id === 'custom') return window.customSummary10 ? window.customSummary10() : 'Build your own run';
    if (id === 'rush') return B.rush ? `Bosses beaten <em>${Math.min(B.rush, RUSH_ORDER.length)}</em> of ${RUSH_ORDER.length}` : `${RUSH_ORDER.length} bosses, no rest`;
    const day = todayKey(), tw = dailyTwist(day), d = Save.data.daily;
    const sub = d.day === day ? (d.won ? ', done today' : d.best ? `, best floor ${d.best}` : '') : '';
    return `Today: <em>${tw.name}</em>${sub}`;
  },
  paintPlay() {
    const mode = MODES[Save.data.mode] ? Save.data.mode : 'arcade';
    for (const b of this.el.modeList.children) {
      const onM = b.dataset.id === mode;
      b.classList.toggle('on', onM); b.setAttribute('aria-checked', onM ? 'true' : 'false');
      b.querySelector('.mb').innerHTML = this.modeBest(b.dataset.id);
    }
    const daily = mode === 'daily';
    let diff = DIFFS[Save.data.diff] ? Save.data.diff : 'normal';
    if (diff === 'nightmare' && !Save.data.unlocks.nightmare) diff = 'hard';
    const shown = daily ? 'normal' : diff;
    for (const b of this.el.diffList.children) {
      const id = b.dataset.id, onD = id === shown;
      const locked = id === 'nightmare' && !Save.data.unlocks.nightmare;
      b.classList.toggle('on', onD); b.classList.toggle('locked', locked); b.classList.toggle('off', daily && !onD);
      b.setAttribute('aria-checked', onD ? 'true' : 'false');
      b.querySelector('b').textContent = DIFFS[id].name;
      b.querySelector('.sk').hidden = locked; b.querySelector('.lk').hidden = !locked;
    }
    const tw = dailyTwist(todayKey());
    this.el.diffDesc.textContent = daily ? `Today's twist, ${tw.name}: ${tw.desc} Always on Normal.` : DIFFS[shown].desc;
    this.el.playChar.textContent = CHARS[Save.data.char].name;
    paintChar(this.el.playFace, Save.data.char, false, { face: true });
    this.el.btnGo.textContent = `Start ${MODES[mode].name}`;
  },
  openPlay() {
    this.hide('menu'); this.show('play'); this.el.play.scrollTop = 0;
    requestAnimationFrame(() => this.paintPlay());
    setTimeout(() => this.el.btnGo.focus({ preventScroll: true }), 50);
  },
  closePlay() { this.hide('play'); this.show('menu'); this.refresh(); this.el.btnPlay.focus({ preventScroll: true }); },

  /* ---- settings */
  setting(k) { return k === 'sound' ? Save.data.sound : k === 'assist' ? Save.data.assist : Save.data.settings[k] !== false; },
  flip(k) {
    if (k === 'sound') Game.toggleSound();
    else if (k === 'assist') { Save.data.assist = !Save.data.assist; Save.store(); }
    else if (SETTING_KEYS[k]) { Save.data.settings[k] = !this.setting(k); Save.store(); }
    if (G.state !== 'pause') Sfx.blip();
    this.paintSettings();
  },
  paintSettings() {
    for (const b of this.el.toggles.querySelectorAll('.tog')) b.setAttribute('aria-checked', this.setting(b.dataset.set) ? 'true' : 'false');
    this.refresh();
  },
  openSettings(from) {
    this.setFrom = from;
    this.hide(from); this.show('settings'); this.el.settings.scrollTop = 0;
    this.el.codeBox.hidden = true; this.saveMsg('');
    this.paintSettings();
    setTimeout(() => this.el.btnSetBack.focus({ preventScroll: true }), 50);
  },
  closeSettings() { this.hide('settings'); this.show(this.setFrom); if (this.setFrom === 'menu') this.el.btnSet.focus({ preventScroll: true }); else this.fillPause(); },

  buildItemCards() {
    const box = this.el.itemCards; box.innerHTML = '';
    const ids = ITEM_IDS.filter((id) => !ITEMS[id].rare).concat(ITEM_IDS.filter((id) => ITEMS[id].rare));
    for (const id of ids) {
      const it = ITEMS[id], f = document.createElement('figure');
      if (it.rare) f.className = 'rare';
      f.innerHTML = `<canvas data-item="${id}"></canvas><figcaption><b></b>${it.rare ? '<span class="tagr">Legendary</span>' : ''}<span class="d"></span></figcaption>`;
      f.querySelector('b').textContent = it.name; f.querySelector('.d').textContent = it.desc;
      box.appendChild(f);
    }
    // curses and downgrades get their own little lists
    for (const [boxId, ids, src, cls, tag] of [['curseCards', CURSE_IDS, CURSES, 'curse', 'Curse'], ['downCards', DOWN_IDS, DOWNS, 'down', 'Downgrade']]) {
      const b2 = this.el[boxId]; if (!b2) continue;
      b2.innerHTML = '';
      for (const id of ids) {
        const it = src[id], f = document.createElement('figure');
        f.className = cls;
        f.innerHTML = `<canvas data-item="${id}"></canvas><figcaption><b></b><span class="tag${cls[0]}">${tag}</span><span class="d"></span></figcaption>`;
        f.querySelector('b').textContent = it.name; f.querySelector('.d').textContent = it.desc;
        b2.appendChild(f);
      }
    }
  },
  medal(done) {
    const c = done ? '#e3a54a' : '#4a3f38', r = done ? '#c3243a' : '#2e2622';
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 2h6l3 12h-6zM27 2h-6l-3 12h6z" fill="${r}"/><circle cx="20" cy="25" r="12" fill="${done ? '#2a1a0c' : '#1a1412'}" stroke="${c}" stroke-width="2.5"/><path d="M20 18l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="${c}"/></svg>`;
  },
  unlockName(u) { return u === 'nightmare' ? 'Nightmare difficulty' : CHARS[u] ? CHARS[u].name : u; },
  openAchs(keep) {
    if (!keep) { this.hide('menu'); this.show('achs'); this.el.achs.scrollTop = 0; }
    const S = Save.data.stats;
    this.el.lstats.innerHTML = STAT_DEFS.map(([k, label]) => `<div><dt>${label}</dt><dd>${k === 'time' ? fmtTime(S.time) : Math.floor(Meta.value(k))}</dd></div>`).join('');
    this.el.achCount.textContent = `${Meta.done()} of ${ACHS.length} done`;
    this.el.alist.innerHTML = '';
    const order = ACHS.slice().sort((a, b) => (Save.data.ach[b.id] ? 1 : 0) - (Save.data.ach[a.id] ? 1 : 0));
    for (const a of order) {
      const done = !!Save.data.ach[a.id], v = Meta.progress(a);
      const d = document.createElement('div');
      d.className = 'acard' + (done ? ' done' : '');
      d.innerHTML = `${this.medal(done)}<div><p class="an"></p><p class="ad"></p><div class="ab"><i><b style="width:${Math.round((v / a.goal) * 100)}%"></b></i><span>${Math.floor(v)}/${a.goal}</span></div><p class="ar"></p></div>`;
      d.querySelector('.an').textContent = a.name; d.querySelector('.ad').textContent = a.desc;
      const rw = [];
      if (a.unlocks) rw.push(`${done ? 'Unlocked' : 'Unlocks'} ${this.unlockName(a.unlocks)}`);
      if (a.reward) rw.push(`Reward: ${ITEMS[a.reward].name}${ITEMS[a.reward].rare ? ' (legendary)' : ''}`);
      d.querySelector('.ar').textContent = rw.join('  ·  ');
      this.el.alist.appendChild(d);
    }
    const box = this.el.coll; box.innerHTML = '';
    const found = Save.data.found;
    this.el.collHead.textContent = `Powerups found  ${Object.keys(found).filter((k) => ITEMS[k]).length} of ${ITEM_IDS.length}`;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const id of ITEM_IDS) {
      const cv = document.createElement('canvas'); cv.width = Math.round(44 * dpr); cv.height = Math.round(44 * dpr);
      if (ITEMS[id].rare) cv.className = 'rare';
      cv.title = found[id] ? `${ITEMS[id].name}: ${ITEMS[id].desc}` : 'Not found yet';
      box.appendChild(cv);
      const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      const oc = off.getContext('2d'); oc.setTransform(dpr, 0, 0, dpr, 22 * dpr, 22 * dpr);
      drawItemIcon(oc, id, 30, 1);
      if (!found[id]) {
        oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = '#16100d'; oc.fillRect(0, 0, off.width, off.height);
        oc.globalCompositeOperation = 'source-over'; oc.fillStyle = 'rgba(236,226,212,0.35)'; oc.font = `700 ${Math.round(16 * dpr)}px "Barlow Condensed", sans-serif`;
        oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.fillText('?', off.width / 2, off.height / 2);
      }
      cv.getContext('2d').drawImage(off, 0, 0);
    }
    if (!keep) setTimeout(() => this.el.btnAchBack.focus({ preventScroll: true }), 50);
  },
  saveMsg(t) { this.el.saveMsg.textContent = t; },
  async downloadSave() {
    const txt = Save.exportText(), name = `bitten-save-${new Date().toISOString().slice(0, 10)}.json`;
    const r = await saveFile14(name, txt, this.dlP);                    /* T10 */
    if (r === 'declined') { this.saveMsg('Download cancelled.'); return; }
    if (r === 'failed') { this.showCode(); this.saveMsg('Downloads do not work here. Copy the save code instead.'); return; }
    this.saveMsg('Save file downloaded. Keep it somewhere safe.');
  },
  showCode() {
    this.el.codeBox.hidden = false;
    this.el.saveCode.value = Save.exportCode();
    this.saveMsg('This code holds all your progress. Copy it, or paste a code and load it.');
  },
  async copyCode() {
    const ta = this.el.saveCode;
    if (!ta.value || !/^BITTEN-/i.test(ta.value.trim())) ta.value = Save.exportCode();
    try { await navigator.clipboard.writeText(ta.value); this.saveMsg('Save code copied.'); }
    catch (e) { ta.focus(); ta.select(); try { document.execCommand('copy'); this.saveMsg('Save code copied.'); } catch (e2) { this.saveMsg('Select the code and copy it by hand.'); } }
  },
  // reads whatever is on the clipboard and loads it as a save; falls back to the code box where the browser blocks clipboard reads
  async pasteCode() {
    let txt = '';
    try { txt = await navigator.clipboard.readText(); } catch (e) { txt = ''; }
    if (!txt || !txt.trim()) {
      this.el.codeBox.hidden = false; this.el.saveCode.value = '';
      try { this.el.saveCode.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      this.saveMsg('This screen blocks reading the clipboard. Paste the code in the box and it loads by itself.');
      return;
    }
    this.el.codeBox.hidden = false; this.el.saveCode.value = txt.trim();
    this.loadText(txt, 'code');
  },
  loadText(txt, from) {
    try {
      const before = Meta.done();
      const obj = Save.importText(txt);
      Meta.check();
      const v = obj.gameVersion ? ` from version ${obj.gameVersion}` : '';
      this.saveMsg(`Save ${from === 'file' ? 'file' : 'code'} loaded${v}. ${Meta.done() - before > 0 ? `${Meta.done() - before} new achievements. ` : ''}Everything merged.`);
      this.paintSettings();
    } catch (e) { this.saveMsg(`That is not a Bitten save (${String(e.message || e).slice(0, 60)}).`); }
  },
  closeAchs() { this.hide('achs'); this.show('menu'); this.refresh(); this.el.btnAch.focus({ preventScroll: true }); },
  toastQ: [],
  toast(a) {
    this.toastQ.push(a);
    if (!this._toastOn) this.nextToast();
  },
  nextToast() {
    const a = this.toastQ.shift();
    if (!a) { this._toastOn = false; return; }
    this._toastOn = true;
    this.el.toastName.textContent = a.name;
    const el = this.el.toast; void el.offsetWidth; el.classList.add('show');
    Sfx.achieve();
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => this.nextToast(), 350); }, 2600);
  },
  buildChars() {
    const list = this.el.charList; list.innerHTML = '';
    const bar = (k, v, txt) => `<div><dt>${k}</dt><dd><i style="width:${Math.round(clamp(v, 0.06, 1) * 100)}%"></i></dd><span>${txt}</span></div>`;
    for (const id of CHAR_IDS) {
      const C = CHARS[id];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ccard'; b.dataset.id = id; b.setAttribute('role', 'radio');
      b.innerHTML = `<canvas></canvas><div class="cn"><b></b><span class="tagl"></span></div><p class="cd"></p>
        <dl class="bars">${bar('Health', C.maxHp / 10, C.maxHp / 2)}${bar('Speed', (C.speed - 110) / 70, Math.round(C.speed))}${bar('Fire rate', (1 / C.fireDelay - 1.8) / 1.4, (1 / C.fireDelay).toFixed(1))}${bar('Damage', (C.dmg - 0.5) / 1, C.dmg.toFixed(2))}</dl>
        <p class="perk"></p><p class="lock" hidden></p>`;
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (id !== 'apple' && !Save.data.unlocks[id]) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); Sfx.thud(); return; }
        Save.data.char = id; Save.store(); Sfx.init(); Sfx.pickup(); this.refresh(); this.paintChars();
      });
      list.appendChild(b);
    }
  },
  paintChars() {
    let n = 0;
    for (const b of this.el.charList.children) {
      const id = b.dataset.id, C = CHARS[id];
      const open = id === 'apple' || !!Save.data.unlocks[id];
      if (open) n++;
      const onC = Save.data.char === id;
      b.classList.toggle('on', onC); b.classList.toggle('locked', !open);
      b.setAttribute('aria-checked', onC ? 'true' : 'false');
      b.querySelector('b').textContent = open ? C.name : '???';
      b.querySelector('.tagl').textContent = onC ? 'Selected' : open ? 'Tap to pick' : 'Locked';
      b.querySelector('.cd').textContent = open ? C.desc : 'Something else is waiting to be played.';
      b.querySelector('.perk').textContent = open ? C.perk || '' : '';
      const lk = b.querySelector('.lock'); lk.hidden = open;
      if (!open) {
        const a = ACHS.find((x) => x.id === C.ach), v = a ? Meta.progress(a) : 0;
        lk.innerHTML = '<span></span>' + (a ? `<div class="cbar" style="margin-top:6px"><i><b style="width:${Math.round((v / a.goal) * 100)}%"></b></i><span>${Math.floor(v)}/${a.goal}</span></div>` : '');
        lk.querySelector('span').textContent = `To unlock: ${C.unlock || ''}`;
      }
      paintChar(b.querySelector('canvas'), id, !open, { big: true });
    }
    this.el.charCount.textContent = `${n} of ${CHAR_IDS.length} unlocked`;
  },
  openChars(from) {
    this.charsFrom = from || 'menu';
    this.hide(this.charsFrom); this.show('chars');
    this.el.chars.scrollTop = 0;
    for (const id of CHAR_IDS) if (Save.data.unlocks[id]) Save.data.seen[id] = true;
    Save.store(); this.refresh();
    requestAnimationFrame(() => this.paintChars());
    const cur = [...this.el.charList.children].find((b) => b.dataset.id === Save.data.char);
    setTimeout(() => (cur || this.el.btnCharsBack).focus({ preventScroll: true }), 50);
  },
  closeChars() {
    this.hide('chars'); this.show(this.charsFrom); this.refresh();
    if (this.charsFrom === 'play') { this.paintPlay(); this.el.btnPlayChar.focus({ preventScroll: true }); }
    else this.el.btnChar.focus({ preventScroll: true });
  },
  fillPause() {
    const P = G.player; if (!P) return;
    const st = playerStats(P).map(([k, v, f]) => `<div><dt>${k}</dt><dd>${f(v)}</dd></div>`);
    if (G.run) st.push(`<div><dt>COINS</dt><dd>${G.run.coins}</dd></div>`);
    { const ep = enemyPowerPct(P); st.push(`<div><dt>FOES</dt><dd>+${ep.toFixed(ep % 1 ? 1 : 0)}%</dd></div>`); }
    this.el.pauseStats.innerHTML = st.join('');
    const nu = Meta.nextUnlock(), pn = this.el.pauseNext;
    pn.hidden = !nu;
    if (nu) { pn.innerHTML = 'Next unlock: <b></b>. <span></span>'; pn.querySelector('b').textContent = CHARS[nu.id].name; pn.querySelector('span').textContent = `${nu.a.desc.replace(/\.$/, '')} (${Math.floor(Meta.progress(nu.a))}/${nu.a.goal})`; }
    const box = this.el.pauseItems; box.innerHTML = '';
    const all = P.items.concat(P.curses, P.downs);
    if (!all.length) { box.innerHTML = '<span class="none">No powerups yet. Break things.</span>'; return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const id of all) {
      const X = thingInfo(id);
      const f = document.createElement('figure');
      f.innerHTML = '<canvas></canvas><figcaption></figcaption>';
      f.querySelector('figcaption').textContent = X.name;
      if (X.rare) f.querySelector('canvas').style.cssText = 'background:rgba(255,170,60,.16);box-shadow:inset 0 0 0 1px rgba(255,180,70,.7)';
      else if (X.curse) f.querySelector('canvas').style.cssText = 'background:rgba(176,90,255,.16);box-shadow:inset 0 0 0 1px rgba(196,138,240,.75)';
      else if (X.down) f.querySelector('canvas').style.cssText = 'background:rgba(30,20,30,.6);box-shadow:inset 0 0 0 1px rgba(232,58,80,.55)';
      f.title = `${X.curse ? 'Curse. ' : X.down ? 'Downgrade. ' : ''}${X.desc}`;
      box.appendChild(f);
      const cv = f.querySelector('canvas'); const S = cv.clientWidth || 34;
      cv.width = Math.round(S * dpr); cv.height = Math.round(S * dpr);
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, S / 2 * dpr, S / 2 * dpr);
      drawItemIcon(c, id, S * 0.74, 1);
    }
  },
  hideOverlays() { this.hideCard(); clearTimeout(this._banT); this.el.banner.classList.remove('show'); clearTimeout(this._chatT); if (this.el.chat) this.el.chat.classList.remove('show'); },
  openHow(from) {
    this.howFrom = from;
    this.hide(from); this.show('how');
    this.el.how.scrollTop = 0;
    requestAnimationFrame(() => paintBestiary());
    const b = this.el.btnHowBack; setTimeout(() => b.focus({ preventScroll: true }), 50);
  },
  closeHow() { this.hide('how'); this.show(this.howFrom); if (this.howFrom === 'menu') this.el.btnHow.focus({ preventScroll: true }); },
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
    this.el.appelNote.textContent = U.appel ? 'Faster feet and bigger seeds, one apple less. Unlocked.' : 'Faster feet and bigger seeds, one apple less. Beat the Grub Mother to unlock him.';
    this.el.krulNote.textContent = U.krul ? 'Eats rocks and eggs to grow his seeds. Unlocked.' : `Eats rocks and eggs to grow his seeds. Heal 20 times to unlock (${Math.min(20, Meta.value('heals'))}/20).`;
    this.el.rotNote.textContent = U.rot ? 'Slow and tough. Poison seeds and a worm inside. Unlocked.' : 'Slow and tough. Poison seeds and a worm inside. Kill a Rot Eater to unlock.';
    this.el.mikaNote.textContent = U.mika ? 'One face, always. Every bite freezes the room. Unlocked.' : 'One face, always. Every bite freezes the room. Beat The Coalition to unlock.';
    const b = Save.data.best;
    const parts = [];
    if (b.level > 0) parts.push(`Deepest floor ${b.level}`);
    if (b.endless > 0) parts.push(`Endless floor ${b.endless}`);
    if (b.kills > 0) parts.push(`Most snakes ${b.kills}`);
    if (b.wins > 0) parts.push(b.wins === 1 ? 'Escaped once' : `Escaped ${b.wins} times`);
    this.el.best.textContent = parts.map((x) => x.replace(/ /g, '\u00a0')).join('  ·  ');
  },
  card(k, t, s, cls, dur = 2.6) {
    const el = this.el.card;
    el.className = 'card' + (cls ? ' ' + cls : '');
    el.querySelector('.k').textContent = say9(k || '');
    el.querySelector('.t').textContent = say9(t || '');
    el.querySelector('.s').textContent = say9(s || '');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._cardT);
    this._cardT = setTimeout(() => el.classList.remove('show'), dur * 1000);
  },
  hideCard() { clearTimeout(this._cardT); this.el.card.classList.remove('show'); },
  chat(text) {
    text = chatWho9(text);
    const el = this.el.chat;
    this.el.chatText.textContent = text;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._chatT);
    this._chatT = setTimeout(() => el.classList.remove('show'), 3800);
    const who9 = this._chatWho || 'jens';
    Sfx.blip(who9); setTimeout(() => Sfx.blip(who9), 70);
  },
  banner(t, s, cls) {
    const el = this.el.banner;
    el.className = 'banner' + (cls ? ' ' + cls : '');
    el.querySelector('.t').textContent = say9(t); el.querySelector('.s').textContent = say9(s);
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._banT);
    this._banT = setTimeout(() => el.classList.remove('show'), 3000);
  },
  place() {
    if (!this.el.card) return;
    const roomTop = View.oy + WALL * View.s, roomH = RH * View.s;
    this.el.card.style.top = Math.max(12, roomTop + roomH * 0.5 - 70) + 'px';
    const rb = View.oy + VIEW_H * View.s;
    const by = View.portrait ? Math.max(rb + 70, Math.min(rb + 160, View.H - 170)) : View.oy + WALL * View.s + 10;
    this.el.banner.style.top = Math.round(by) + 'px';
    const ch = this.el.chat;
    if (View.portrait) { ch.style.left = '50%'; ch.style.right = 'auto'; ch.style.top = Math.round(Math.max(rb + 120, Math.min(rb + 250, View.H - 100))) + 'px'; ch.style.maxWidth = 'min(92%, 380px)'; ch.classList.remove('side'); }
    else if (View.ox > 150) { ch.style.left = '12px'; ch.style.right = 'auto'; ch.style.top = Math.round(View.H * 0.44) + 'px'; ch.style.maxWidth = Math.round(View.ox - 24) + 'px'; ch.classList.add('side'); }
    else { ch.style.left = '50%'; ch.style.top = Math.round(View.oy + VIEW_H * View.s - 70) + 'px'; ch.style.maxWidth = 'min(80%, 380px)'; ch.classList.remove('side'); }
  },
};

function darkTarget(room, L) {
  const d9 = darkTarget9(room, L);
  if (d9 != null) return d9;
  if (room.cleared) return L.darkClear;
  return room.mod === 'dark' ? Math.min(0.94, L.dark + 0.1) : L.dark;
}

/* Extra snakes per floor theme, for harder difficulties and challenge waves */
const EXTRA_POOL = { cellar: ['grub', 'grub', 'hood', 'splitter'], halls: ['grub', 'hood', 'lamprey', 'sniper'], market: ['grub', 'bonus', 'hood', 'discount'], kamer: ['grub', 'kamerlid', 'kamerlid', 'lobby', 'sniper'], garden: ['grub', 'hood', 'lamprey', 'splitter', 'sniper'] };
const WAVE_POOL = { cellar: ['grub', 'grub', 'hood', 'splitter'], halls: ['grub', 'grub', 'hood', 'lamprey', 'sniper'], market: ['grub', 'bonus', 'discount', 'hood'], kamer: ['grub', 'kamerlid', 'kamerlid', 'lobby', 'hood'], garden: ['grub', 'grub', 'hood', 'lamprey', 'long', 'splitter', 'sniper'] };
const ROMAN = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
const MOD_NAMES = { dark: 'A dark room', swarm: 'A swarm', elite: 'Something big', spikes: 'Spike traps', freezer: 'The freezer aisle', collapse: 'The floor is cracking', skins: 'Shed skins', roots: 'Roots underfoot' };
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function dailyTwist(day) { return DAILY_TWISTS[hashStr('bitten-daily-' + day) % DAILY_TWISTS.length]; }
// what the boss bar shows: one boss, or a group of them sharing one bar
function bossBar() {
  const g = G.bossGroup;
  if (g) {
    if (!g.list.some((b) => b.alive)) return null;
    let hp = 0, mx = 0;
    for (const b of g.list) { mx += b.maxHp; if (b.alive && b.dying <= 0) hp += Math.max(0, b.hp); }
    return { f: clamp((hp / (mx || 1)) * (g.scale || 1), 0, 1), name: g.name };
  }
  const b = G.boss;
  if (b && b.alive) return { f: clamp(b.hp / b.maxHp, 0, 1), name: b.displayName || b.K.name };
  return null;
}
// a boss rush, or a boss only stage inside a custom run
function rushy() { return G.mode === 'rush' || !!(G.levelDef && G.levelDef.rush); }
function floorLabel(i) {
  if (G.mode === 'story') return `Chapter ${i + 1}`;
  if (G.mode === 'custom') { const c = G.run && G.run.cust; return c && !c.loop ? `Stage ${i + 1} of ${c.n}` : `Stage ${i + 1}`; }
  if (G.mode === 'rush') return `Boss ${i + 1} of ${RUSH_ORDER.length}`;
  if (G.mode === 'chaos') return `Layer ${i + 1} of 3`;
  if (G.mode === 'endless') return `Floor ${i + 1}`;
  return `Floor ${i + 1} of ${LEVELS.length}`;
}

