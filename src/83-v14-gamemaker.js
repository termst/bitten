/* ===== v14.2: the Game Maker. One run setup for coop (couch and online): mode and difficulty (the same
   settings as the Play menu), the coop style, run rules for every mode (the Custom Run rules), team rules
   (revive, door, team scaling, coin drops) and, online, the room (max apples, a fixed seed).
   The host's settings live in Save.data.gm14. Online guests play on the host's save (net.js swapSave), so
   every peer reads the same settings at the start of the run and builds the same run.

   Coop styles:
   'split' Coop: every apple for itself. Own coins (P.coins14 behind G.run.coins), own contract, own pump,
           chair and gym set (perApple14), own clean room count. More coins drop to make up for it.
   'plus'  Coop Plus: one team. One purse, every powerup any apple takes goes to every apple, and chests,
           treasure rooms and bosses deal loot as for one apple. ===== */
(function () {
  'use strict';
  const B = window.__bitten || (window.__bitten = {});
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'gm14'); return fb; } };
  const T = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s);
  const LINES = ['Game Maker', 'Coop style', 'Coop Plus', 'Every apple for itself: own coins, contracts, pumps and gym. More coins drop.',
    'One team: every powerup and every coin is shared. Fewer powerups drop.', 'Run rules', 'Team', 'Room', 'Mode', 'Difficulty',
    'Revive time', 'Revive health', 'Door wait', 'Team scaling', 'Coin drops', 'Max apples', 'Seed', 'Random', 'Off', 'Half apple',
    'One apple', 'Full', 'No wait', 'Everyone', 'Light', 'Normal', 'Heavy', 'Auto', 'Reset', 'Set by the host', 'ALL',
    'Same seed, same mode: the same run. Empty: a new run every time.', 'Custom Run: stages, rules and start powerups from the builder below.',
    'Custom Run: the host builds the stages.', 'changed', 'Locked', 'Map', 'Pick a map', 'Your maps', 'Examples', 'No map picked yet.',
    'A map from the Map Maker, for the whole team. Its own rules, powerups and rooms count; the team rules below too.', 'The host picks the map.'];
  safe(() => { for (const s of LINES) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s); });

  /* ---------------------------------------------------------------- the settings */
  const RULE_KEYS = ['apples', 'coins', 'hearts', 'dmg', 'fire', 'pspeed', 'speed', 'bossHp'];
  const TEAM = [
    ['revive', 'Revive time', [[0, 'Off'], [1.5, '1.5 s'], [3, '3 s'], [6, '6 s']], 3],
    ['reviveHp', 'Revive health', [[1, 'Half apple'], [2, 'One apple'], [99, 'Full']], 2],
    ['door', 'Door wait', [[0, 'No wait'], [3, '3 s'], [6, '6 s'], [99, 'Everyone']], 3],
    ['scale', 'Team scaling', [[0.5, 'Light'], [1, 'Normal'], [1.5, 'Heavy']], 1],
    ['coin', 'Coin drops', [[0, 'Auto'], [1, '100%'], [1.5, '150%'], [2, '200%']], 0],
  ];
  const MAXES = [[2, '2'], [3, '3'], [4, '4']];
  const STYLES = [['split', 'Coop', 'Every apple for itself: own coins, contracts, pumps and gym. More coins drop.'],
    ['plus', 'Coop Plus', 'One team: every powerup and every coin is shared. Fewer powerups drop.']];
  const ruleRows = () => {
    const C = B.cust10; if (!C || !C.PG) return [];
    const out = [];
    /* v14.8: plus a rule per hidden room (Knokpit, SIX SEVEN, ...) from window.__bitten.HIDDEN14 */
    const hk = (B.HIDDEN14 || []).map((h) => h.rk);
    for (const [, rows] of C.PG) for (const r of rows) if (RULE_KEYS.includes(r[0]) || hk.includes(r[0])) out.push(r);
    return out;
  };
  const PD = () => (B.cust10 && B.cust10.PD) || {};
  /* v14.6: Map is a coop mode too: a map from the Map Maker, played by the whole team */
  const coopModes = () => MODE_IDS.filter((k) => k !== 'story' && k !== 'daily' && MODES[k]).concat(MODES.map && B.MK123 ? ['map'] : []);
  const MK = () => B.MK123;
  /* every map you can pick: your own, then the examples. Each entry: [id, map] */
  function mapChoices() {
    const out = [];
    safe(() => { const S = MK().Store; S.load(); for (const it of S.list) out.push([it.id, it.map, 0]); });
    safe(() => { for (const M of MK().EXAMPLES()) out.push([M.id, M, 1]); });
    return out;
  }
  /* the picked map travels in the host save (online guests play on it), as the compact share form */
  function pickMap(M) { const c = cfg(); c.map = safe(() => Object.assign(MK().compactNow(M), { id: M.id }), null); }
  function mapNow() {
    const c = cfg(); if (!c.map || typeof c.map !== 'object') return null;
    return safe(() => MK().cleanMapNow(JSON.parse(JSON.stringify(c.map))), null);
  }

  function cfg() {
    const D = Save.data;
    let c = D.gm14;
    if (!c || typeof c !== 'object') c = D.gm14 = {};
    if (!STYLES.some((s) => s[0] === c.style)) c.style = 'split';
    if (!c.p || typeof c.p !== 'object') c.p = {};
    for (const [k, , opts] of ruleRows()) if (!opts.some((o) => o[0] === c.p[k])) c.p[k] = PD()[k];
    if (!c.co || typeof c.co !== 'object') c.co = {};
    for (const [k, , opts, def] of TEAM) if (!opts.some((o) => o[0] === c.co[k])) c.co[k] = def;
    if (!MAXES.some((m) => m[0] === c.max)) c.max = 4;
    c.seed = String(c.seed || '').replace(/[^A-Za-z0-9 -]/g, '').slice(0, 16);
    return c;
  }
  const changed = (c) => ruleRows().filter(([k]) => c.p[k] !== PD()[k]).length + TEAM.filter(([k, , , d]) => c.co[k] !== d).length;
  const modeNow = () => (coopModes().includes(Save.data.mode) ? Save.data.mode : 'arcade');
  const diffNow = () => { let d = DIFFS[Save.data.diff] ? Save.data.diff : 'normal'; if (d === 'nightmare' && !Save.data.unlocks.nightmare) d = 'hard'; return d; };
  /* what guests see in the lobby */
  function pub() {
    const c = cfg();
    return { mode: modeNow(), diff: diffNow(), style: c.style, p: Object.assign({}, c.p), co: Object.assign({}, c.co), max: c.max, seed: c.seed ? 1 : 0,
      cust: modeNow() === 'custom' ? safe(() => String(window.customSummary10()).replace(/<[^>]+>/g, ''), '') : '',
      map: modeNow() === 'map' && c.map ? String(c.map.name || '').slice(0, 40) : '' };
  }
  const seedNum = () => { const s = cfg().seed; return s ? hashStr('bitten-gm-' + s.toLowerCase()) : null; };

  /* ---------------------------------------------------------------- the run */
  const CO_DEF = { revive: 3, reviveHp: 2, door: 3, scale: 1 };
  Hooks.layer('Game.startRun', 'v14.2 game maker', function (next, story, mode) {
    const q = B.coop14 && B.coop14.pending, multi = !!(q && q.length >= 2);
    const c = multi ? cfg() : null;
    Object.assign(CO14, CO_DEF);
    if (c) for (const k of Object.keys(CO_DEF)) CO14[k] = c.co[k];
    /* v14.6: a coop Map run plays the Game Maker's map; with no map picked it is an Arcade run */
    if (mode === 'map' && multi) {
      const M = mapNow(), R = MK() && MK().RTM;
      if (M && R) { R.cur = M; R.back = 'coop'; R.startRoom = null; R.tpTo = null; R.test = false; }
      else { const a = [].slice.call(arguments, 1); a[1] = 'arcade'; return next.apply(this, a); }
    }
    const r = next.apply(this, [].slice.call(arguments, 1));
    safe(() => {
      if (!c || !MP14.on || !G.run || G.mode === 'story') { Object.assign(CO14, CO_DEF); return; }
      const R = G.run, L = G.players;
      R.coop14 = c.style;
      if (G.mode === 'custom') {
        /* the v10.7 recipe tweak ran before the other apples existed: give them the same */
        const cu = R.cust && R.cust.p;
        if (cu) for (const P of L.slice(1)) {
          if (cu.dmg !== 1) P.dmg *= cu.dmg;
          if (cu.pspeed !== 1) P.speed *= cu.pspeed;
          if (cu.fire !== 1) P.fireDelay /= cu.fire;
          if (cu.apples) { P.maxHp = Math.min(20, P.maxHp + cu.apples * 2); P.hp = P.maxHp; }
        }
      } else if (G.mode === 'map') {
        /* the map's own rules reached apple 1 only (the other apples did not exist yet) */
        const ru = safe(() => MK().RTM.cur.rules, null);
        if (ru) for (const P of L.slice(1)) {
          if (ru.dm !== 1) P.dmg *= ru.dm;
          if (ru.ps !== 1) P.speed *= ru.ps;
          if (ru.fr !== 1) P.fireDelay /= ru.fr;
          if (ru.ap) { P.maxHp = Math.min(20, P.maxHp + ru.ap * 2); P.hp = P.maxHp; P.bites.length = 0; }
        }
      } else {
        const p = c.p;
        for (const P of L) {
          if (p.dmg !== 1) P.dmg *= p.dmg;
          if (p.pspeed !== 1) P.speed *= p.pspeed;
          if (p.fire !== 1) P.fireDelay /= p.fire;
          if (p.apples) { P.maxHp = Math.min(20, P.maxHp + p.apples * 2); P.hp = P.maxHp; P.bites.length = 0; }
        }
        if (p.coins) R.coins = (R.coins || 0) + p.coins;
        if (p.hearts !== 1) G.D = Object.assign({}, G.D, { hearts: (G.D.hearts || 1) * p.hearts });
        if (p.speed !== 1) { G.speedK = (G.speedK || 1) * p.speed; G.bossSpeedK = (G.bossSpeedK || 1) * (0.5 + p.speed * 0.5); }
        R.gmBoss14 = p.bossHp;
      }
      R.gmCoin14 = c.co.coin;
      if (c.style === 'split') splitPurse(R, L);
    });
    return r;
  });
  /* split: G.run.coins and G.run.roomHits read and write the purse of the apple in context */
  function splitPurse(R, L) {
    const start = R.coins || 0;
    for (const P of L) { P.coins14 = start; P.roomHits14 = 0; }
    Object.defineProperty(R, 'coins', {
      configurable: true, enumerable: false,
      get() { const P = G.player; return P && P.coins14 != null ? P.coins14 : 0; },
      set(v) { const P = G.player; if (P) P.coins14 = v; },
    });
    Object.defineProperty(R, 'roomHits', {
      configurable: true, enumerable: false,
      get() { const P = G.player; return (P && P.roomHits14) || 0; },
      set(v) { if (!v) { for (const P of G.players) P.roomHits14 = 0; } else if (G.player) G.player.roomHits14 = v; },
    });
  }
  /* boss health rule outside a Custom Run (the Custom Run applies its own) */
  safe(() => { const bh0 = bossHpK; bossHpK = function () { const k = MP14.on && G.run && G.mode !== 'custom' && G.run.gmBoss14; return bh0.apply(this, arguments) * (k || 1); }; });
  /* split: more coins, so every purse fills about as fast as one apple alone would */
  safe(() => {
    const dc0 = dropCoins;
    dropCoins = function (room, x, y, n) {
      if (coopSplit14() && n > 0) {
        const k = (G.run.gmCoin14 || 0) || 1 + 0.5 * (mpCount14() - 1), m = n * k, w = Math.floor(m);
        n = w + (Math.random() < m - w ? 1 : 0);
      }
      return dc0.call(this, room, x, y, n);
    };
  });
  /* the real frame time, for things the extra coop passes (dt 0) must still time per apple (the gym) */
  Hooks.layer('Game.update', 'v14.2 frame dt', function (next, dt) { MP14.dt = dt; return next.call(this, dt); });
  /* split: pumps, the chair and the gym are per apple */
  function splitRoom(room) {
    if (!room || !coopSplit14()) return;
    if (room.pumps9) for (const o of room.pumps9) perApple14(o, 'used');
    if (room.chair9) perApple14(room.chair9, 'done');
    if (room.gym9) {
      perApple14(room.gym9, 'used');
      for (const s of room.gym9.stations || []) { perApple14(s, 'prog'); perApple14(s, 'said'); perApple14(s, 'fire'); }
    }
  }
  Hooks.layer('Game.enterRoom', 'v14.2 split rooms', function (next, room) {
    safe(() => splitRoom(room));
    const r = next.apply(this, [].slice.call(arguments, 1));
    safe(() => splitRoom(G.room));
    return r;
  });
  /* Coop Plus: a powerup one apple takes goes to every apple (quietly, one banner) */
  safe(() => {
    const ci0 = collectItem;
    let inside = false;
    collectItem = function (id) {
      const r = ci0.apply(this, arguments);
      if (inside || !coopPlus14()) return r;
      inside = true;
      const me = G.player, b0 = UI.banner, s0 = Sfx.item, s1 = Sfx.legend;
      UI.banner = function () {}; Sfx.item = function () {}; Sfx.legend = function () {};
      try { for (const P of G.players) if (P !== me) withPlayer(P, () => safe(() => ci0.call(this, id))); }
      finally { UI.banner = b0; Sfx.item = s0; Sfx.legend = s1; inside = false; }
      return r;
    };
  });

  /* ---------------------------------------------------------------- the panel */
  const CSS = `
.gm14{margin:0 0 12px;max-width:880px}
.gm14 .gm14-hd{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.gm14 .gm14-hd small{font:600 11px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.gm14 .gm14-sty{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gm14 .gm14-sty button{border:1px solid var(--line);border-radius:3px;padding:10px;display:flex;flex-direction:column;gap:5px;text-align:left;background:rgba(0,0,0,.18)}
.gm14 .gm14-sty button b{font:700 17px/1 var(--ui);color:var(--ink)}
.gm14 .gm14-sty button span{font:500 12px/1.3 var(--ui);color:var(--faint)}
.gm14 .gm14-sty button[aria-checked="true"]{border-color:var(--apple);background:rgba(215,38,61,.16)}
.gm14 .gm14-sty button[aria-checked="true"] b{color:#fff4ec}
.gm14 .sg button.lk{opacity:.4}
.gm14 input.gm14-seed{all:unset;box-sizing:border-box;width:100%;height:32px;padding:0 8px;border:1px solid var(--line);border-radius:2px;font:600 14px/1 var(--ui);letter-spacing:.06em;color:#fff4ec}
.gm14 input.gm14-seed:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.gm14.ro button{cursor:default}
.gm14.ro .sg button:not([aria-checked="true"]){opacity:.55}
.gm14 .gm14-cust>.cust10{border:0;padding:0;background:none}
.gm14 .gm14-maps{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;max-height:260px;overflow:auto}
.gm14 .gm14-maps .gm14-mh{grid-column:1/-1;font:600 10px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:4px 0 0}
.gm14 .gm14-maps button{border:1px solid var(--line);border-radius:3px;padding:8px 10px;display:flex;flex-direction:column;gap:4px;text-align:left;background:rgba(0,0,0,.18);min-width:0}
.gm14 .gm14-maps button b{font:700 15px/1.1 var(--ui);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm14 .gm14-maps button span{font:500 12px/1.2 var(--ui);color:var(--faint)}
.gm14 .gm14-maps button[aria-checked="true"]{border-color:var(--apple);background:rgba(215,38,61,.16)}
@media (max-width:420px){.gm14 .gm14-sty{grid-template-columns:1fr}}`;
  let cssOn = false;
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, '');
  /* host: el, { room: max apples (online), seed: the seed field, onChange }; guest: el, { ro: pub() from the host } */
  function mount(el, o) {
    if (!el) return;
    o = o || {};
    if (!cssOn) { cssOn = true; const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
    const ro = !!o.ro, c = ro ? o.ro : cfg();
    const mode = ro ? c.mode : modeNow(), diff = ro ? c.diff : diffNow();
    const seg = (key, name, opts, cur, def, lock) => `<div class="cr${cur !== def ? ' ch' : ''}"><b>${T(name)}</b><div class="sg" role="radiogroup" aria-label="${esc(T(name))}">`
      + opts.map(([v, lab]) => `<button type="button" role="radio" data-g="${key}" data-v="${esc(v)}" aria-checked="${String(v) === String(cur)}"${v === def ? ' class="def"' : ''}${lock && lock(v) ? ' class="lk"' : ''}${ro ? ' disabled' : ''}>${esc(T(lab))}</button>`).join('') + '</div></div>';
    let h = `<div class="c10hd gm14-hd"><h3>${T('Game Maker')}</h3><small>${ro ? T('Set by the host') : changed(c) ? `${changed(c)} ${T('changed')}` : ''}</small></div>`;
    h += '<div class="c10sec">' + seg('mode', 'Mode', coopModes().map((k) => [k, MODES[k].name]), mode, 'arcade')
      + seg('diff', 'Difficulty', DIFF_IDS.map((k) => [k, DIFFS[k].name]), diff, 'normal', (v) => v === 'nightmare' && !ro && !Save.data.unlocks.nightmare)
      + `<p class="cn">${esc(DIFFS[diff] ? DIFFS[diff].desc : '')}</p></div>`;
    h += `<div class="c10sec"><div class="c10t">${T('Coop style')}</div><div class="gm14-sty" role="radiogroup" aria-label="${T('Coop style')}">`
      + STYLES.map(([k, n, d]) => `<button type="button" role="radio" data-g="style" data-v="${k}" aria-checked="${c.style === k}"${ro ? ' disabled' : ''}><b>${T(n)}</b><span>${T(d)}</span></button>`).join('') + '</div></div>';
    if (mode === 'map') {
      h += `<div class="c10sec gm14-map"><div class="c10t">${T('Map')}</div>`;
      if (ro) h += `<p class="cn">${T('The host picks the map.')} <b>${esc(c.map || T('No map picked yet.'))}</b></p>`;
      else {
        const cur = cfg().map, list = mapChoices();
        h += `<p class="cn">${T('A map from the Map Maker, for the whole team. Its own rules, powerups and rooms count; the team rules below too.')}</p><div class="gm14-maps" role="radiogroup" aria-label="${T('Pick a map')}">`;
        let lastEx = -1;
        for (const [id, M, ex] of list) {
          if (ex !== lastEx) { h += `<small class="gm14-mh">${T(ex ? 'Examples' : 'Your maps')}</small>`; lastEx = ex; }
          const rooms = M.floors.reduce((n, F) => n + F.rooms.length, 0);
          h += `<button type="button" role="radio" data-map="${esc(id)}" aria-checked="${!!(cur && cur.id === id)}"><b>${esc(M.name)}</b><span>${M.floors.length > 1 ? M.floors.length + ' floors, ' : ''}${rooms} rooms${M.author ? ' · ' + esc(M.author) : ''}</span></button>`;
        }
        h += '</div>';
        if (!cur) h += `<p class="cn">${T('No map picked yet.')}</p>`;
      }
      h += '</div>';
    } else if (mode === 'custom') h += `<div class="c10sec gm14-cust"><div class="c10t">${T('Run rules')}</div><p class="cn">${ro ? `${T('Custom Run: the host builds the stages.')} ${esc(c.cust || '')}` : T('Custom Run: stages, rules and start powerups from the builder below.')}</p></div>`;
    else h += `<div class="c10sec"><div class="c10t">${T('Run rules')}</div>` + ruleRows().map(([k, n, opts]) => seg('p.' + k, n, opts, c.p[k], PD()[k])).join('') + '</div>';
    h += `<div class="c10sec"><div class="c10t">${T('Team')}</div>` + TEAM.filter(([k]) => k !== 'coin' || c.style === 'split').map(([k, n, opts, d]) => seg('co.' + k, n, opts, c.co[k], d)).join('') + '</div>';
    if (o.room || o.seed || ro) {
      h += `<div class="c10sec"><div class="c10t">${T('Room')}</div>` + (o.room || ro ? seg('max', 'Max apples', MAXES, c.max, 4) : '');
      h += ro ? `<div class="cr"><b>${T('Seed')}</b><span class="cn">${c.seed ? '●●●●' : T('Random')}</span></div>`
        : `<div class="cr"><b>${T('Seed')}</b><input class="gm14-seed" type="text" maxlength="16" spellcheck="false" autocomplete="off" placeholder="${T('Random')}" aria-label="${T('Seed')}" value="${esc(c.seed)}"></div><p class="cn">${T('Same seed, same mode: the same run. Empty: a new run every time.')}</p>`;
      h += '</div>';
    }
    if (!ro) h += `<div class="c10pre" style="grid-template-columns:1fr"><button type="button" data-a="gmreset">${T('Reset')}</button></div>`;
    el.classList.add('cust10', 'gm14'); el.classList.toggle('ro', ro);
    el.innerHTML = h;
    if (ro) return;
    const done = () => { safe(() => Save.store()); safe(() => Sfx.blip()); mount(el, o); if (o.onChange) safe(o.onChange); };
    for (const b of el.querySelectorAll('[data-g]')) b.addEventListener('click', (e) => {
      e.preventDefault();
      const g = b.dataset.g, raw = b.dataset.v, C = cfg(), num = raw !== '' && !isNaN(+raw) ? +raw : raw;
      if (g === 'mode') Save.data.mode = raw;
      else if (g === 'diff') { if (raw === 'nightmare' && !Save.data.unlocks.nightmare) { safe(() => UI.banner(T('Locked'), DIFFS.nightmare.unlock || '')); safe(() => Sfx.thud()); return; } Save.data.diff = raw; }
      else if (g === 'style') C.style = raw;
      else if (g === 'max') C.max = num;
      else if (g.startsWith('p.')) C.p[g.slice(2)] = num;
      else if (g.startsWith('co.')) C.co[g.slice(3)] = num;
      done();
    });
    for (const b of el.querySelectorAll('[data-map]')) b.addEventListener('click', (e) => {
      e.preventDefault();
      const hit = mapChoices().find((x) => x[0] === b.dataset.map); if (!hit) return;
      pickMap(hit[1]); done();
    });
    const sd = el.querySelector('.gm14-seed');
    if (sd) sd.addEventListener('change', () => { cfg().seed = sd.value; safe(() => Save.store()); if (o.onChange) safe(o.onChange); });
    const rs = el.querySelector('[data-a="gmreset"]');
    if (rs) rs.addEventListener('click', (e) => { e.preventDefault(); const k = Save.data.gm14 ? Save.data.gm14.style : 'split'; Save.data.gm14 = { style: k }; done(); });
    /* the Custom Run builder from the Play menu, moved in (UI.paintPlay puts it back) */
    const cb = el.querySelector('.gm14-cust'), U = B.custUI10;
    if (cb && U) { cb.appendChild(U.box); U.box.hidden = false; safe(() => U.paint()); }
    else if (U && el.contains(U.box)) U.home();
  }
  /* v14.10: the Map Maker is a lazy chunk. The coop screen (couch and online) can pick and play maps, so it loads it when it
     opens; the map list and the lobby repaint once it is in. A Map run also waits for it (gate in 74-mapmaker/00-prelude.js). */
  safe(() => {
    const op = B.coop14.open;
    B.coop14.open = function () {
      const r = op.apply(this, arguments);
      const M = MK();
      if (M && M.ready && !M.ready()) M.ensure().then(() => safe(() => { if (B.coopSec14 && !B.coopSec14.hidden) { B.coop14.paint(); if (B.net14 && B.net14.paintLobby) B.net14.paintLobby(); } }));
      return r;
    };
  });
  B.gm14 = { cfg, pub, mount, seedNum, max: () => cfg().max, STYLES, TEAM, pickMap, mapNow, mapChoices };
})();
