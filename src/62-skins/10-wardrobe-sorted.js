/* 62.js section 10: wardrobe-sorted. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { SKINS, curSkin, drawOn, safe, setSkin, skinIdx, skinKey, skinOn } = S62;
  S62.open = open; S62.close = close; S62.step = step; S62.wear = wear;
  /* ------------------------------------------------------------------ v13.6: the wardrobe, sorted
     Skins live in categories (Original, Epic, Grotesque, Arcade). The wardrobe shows them as a grid
     grouped per category with filter tabs, favourites, a shuffle button and a per apple
     "new look every run" switch. Tap previews, tap again or Wear puts it on. */
  const CATS136 = [
    { id: 'Original', label: 'Original', col: '#a69688', blurb: 'How the apple left the factory.' },
    { id: 'Epic', label: 'Epic', col: '#e3a54a', blurb: 'Full outfits with an aura, light rays and their own particles.' },
    { id: 'Grotesque', label: 'Grotesque', col: '#c84a5a', blurb: 'Something in the game got into the apple and stayed.' },
    { id: 'Arcade', label: 'Arcade', col: '#3af0ff', blurb: 'Run through a filter from an old console. Kills burst in the same style.' },
  ];
  const catOf = (o) => (o.skin ? (SKINS[V.id][o.skin - 1].tier || 'Epic') : 'Original');
  const catDef = (id) => CATS136.find((c) => c.id === id) || CATS136[1];
  const favs = (id) => { const d = Save.data; if (!d.skinFav || typeof d.skinFav !== 'object') d.skinFav = {}; if (!Array.isArray(d.skinFav[id])) d.skinFav[id] = []; return d.skinFav[id]; };
  const isFav = (id, name) => favs(id).includes(name);
  const shuffleKey = (id) => 'skinShuffle_' + id;

  const css = document.createElement('style');
  css.textContent = `
#skins24 { overflow-y: auto; justify-content: flex-start; gap: 0; z-index: 7; background: rgba(9, 6, 6, .96); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
#skins24 .sk-inner { width: 100%; max-width: 980px; display: flex; flex-direction: column; gap: 14px; text-align: left; padding-bottom: 20px; }
#skins24 .sk-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; border-bottom: 3px solid var(--acc24, #d7263d); padding-bottom: 10px; }
#skins24 .sk-head .kick { color: var(--acc24, #d7263d); margin-bottom: 6px; }
#skins24 .sk-head h2 { font-size: clamp(32px, 9vw, 52px); }
#skins24 .sk-main { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 20px; align-items: start; }
#skins24 .sk-side { position: sticky; top: 0; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
#skins24 .sk-stage { position: relative; aspect-ratio: 1 / 1; max-width: 100%; border: 1px solid var(--line); border-radius: 2px; overflow: hidden; background: #0c0807; }
#skins24 .sk-big { width: 100%; height: 100%; display: block; cursor: pointer; }
#skins24 .sk-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 2px; border: 1px solid rgba(236,226,212,.3); background: rgba(11,8,7,.55); color: var(--ink); display: grid; place-items: center; cursor: pointer; }
#skins24 .sk-arrow:hover { border-color: rgba(236,226,212,.6); }
#skins24 .sk-arrow:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-arrow.prev { left: 8px; } #skins24 .sk-arrow.next { right: 8px; }
#skins24 .sk-arrow svg { width: 16px; height: 16px; }
#skins24 .sk-count { position: absolute; left: 10px; bottom: 9px; font: 600 11px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; color: rgba(236,226,212,.8); text-shadow: 0 1px 2px #000; }
#skins24 .sk-favbig { position: absolute; right: 8px; top: 8px; }
#skins24 .sk-sname { margin: 0; font: 800 30px/1 var(--display); color: var(--ink); }
#skins24 .sk-meta { display: flex; gap: 6px; flex-wrap: wrap; }
#skins24 .sk-tag { font: 700 11px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; padding: 5px 8px; border: 1px solid var(--tc, var(--acc24)); color: var(--tc, var(--acc24)); border-radius: 2px; }
#skins24 .sk-line { margin: 0; font: 500 15px/1.4 var(--ui); color: var(--muted); min-height: 4.2em; }
#skins24 .sk-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
#skins24 .sk-wear { padding: 0 16px; font-size: 17px; min-height: 48px; }
#skins24 .sk-wear[disabled] { opacity: .5; cursor: default; box-shadow: none; }
#skins24 .sk-rand { min-height: 48px; padding: 0 14px; font-size: 13px; }
#skins24 .sk-tog { all: unset; box-sizing: border-box; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; border: 1px solid var(--line); border-radius: 2px; padding: 8px 10px; }
#skins24 .sk-tog b { font: 700 14px/1.1 var(--ui); letter-spacing: .04em; color: var(--ink); }
#skins24 .sk-tog small { display: block; font: 500 12px/1.25 var(--ui); color: var(--faint); margin-top: 2px; }
#skins24 .sk-tog i { width: 38px; height: 20px; border-radius: 2px; background: rgba(236,226,212,.12); position: relative; }
#skins24 .sk-tog i::after { content: ""; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 1px; background: var(--muted); transition: transform .15s; }
#skins24 .sk-tog[aria-checked="true"] i { background: var(--acc24); }
#skins24 .sk-tog[aria-checked="true"] i::after { transform: translateX(18px); background: #fff4ec; }
#skins24 .sk-tog:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-hint { margin: 0; font: 500 12px/1.35 var(--ui); color: var(--faint); }
#skins24 .sk-hint kbd { font: 700 10px/1 var(--ui); border: 1px solid currentColor; border-radius: 2px; padding: 2px 4px; }
#skins24 .sk-browse { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
#skins24 .sk-tabs { display: flex; gap: 6px; flex-wrap: wrap; position: sticky; top: 0; z-index: 2; background: rgba(9,6,6,.97); padding-block: 4px 8px; }
#skins24 .sk-tabs button { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; font: 600 13px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding: 8px 10px; min-height: 36px; border: 1px solid var(--line); border-radius: 2px; }
#skins24 .sk-tabs button i { width: 8px; height: 8px; border-radius: 1px; background: var(--tc); }
#skins24 .sk-tabs button em { font-style: normal; font-variant-numeric: tabular-nums; color: var(--faint); letter-spacing: .04em; }
#skins24 .sk-tabs button[aria-pressed="true"] { color: #fff4ec; border-color: var(--tc); background: rgba(255,255,255,.05); box-shadow: inset 0 -2px 0 var(--tc); }
#skins24 .sk-tabs button[aria-pressed="true"] em { color: var(--ink); }
#skins24 .sk-tabs button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#skins24 .sk-groups { display: flex; flex-direction: column; gap: 22px; }
#skins24 .sk-group { display: flex; flex-direction: column; gap: 8px; }
#skins24 .sk-group[hidden] { display: none; }
#skins24 .sk-ghead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; border-bottom: 1px solid var(--line); padding-bottom: 6px; }
#skins24 .sk-ghead b { font: 700 13px/1 var(--ui); letter-spacing: .26em; text-transform: uppercase; color: var(--tc); }
#skins24 .sk-ghead span { font: 500 13px/1.3 var(--ui); color: var(--faint); }
#skins24 .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
#skins24 .sk-card { all: unset; box-sizing: border-box; cursor: pointer; position: relative; display: flex; flex-direction: column; gap: 5px; padding: 5px 5px 7px; border: 1px solid var(--line); border-top: 3px solid var(--tc); border-radius: 2px; background: rgba(255,255,255,.02); min-width: 0; transition: transform .12s, border-color .12s; }
#skins24 .sk-card:hover { transform: translateY(-2px); border-color: rgba(236,226,212,.4); border-top-color: var(--tc); }
#skins24 .sk-card canvas { width: 100%; aspect-ratio: 1 / 1; display: block; border-radius: 1px; }
#skins24 .sk-card b { font: 700 14px/1.1 var(--ui); letter-spacing: .03em; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#skins24 .sk-card[aria-checked="true"] { border-color: var(--tc); box-shadow: 0 0 0 1px var(--tc), 0 0 22px rgba(0,0,0,.5); }
#skins24 .sk-card .wb { position: absolute; left: 9px; top: 9px; font: 700 9px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; padding: 3px 5px; background: var(--tc); color: #0b0807; border-radius: 1px; }
#skins24 .sk-card:not(.worn) .wb { display: none; }
#skins24 .sk-star { all: unset; box-sizing: border-box; cursor: pointer; width: 28px; height: 28px; display: grid; place-items: center; color: rgba(236,226,212,.55); background: rgba(11,8,7,.6); border-radius: 2px; }
#skins24 .sk-card .sk-star { position: absolute; right: 8px; top: 8px; }
#skins24 .sk-star svg { width: 15px; height: 15px; }
#skins24 .sk-star[aria-pressed="true"] { color: #ffd23a; }
#skins24 .sk-star:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }
#skins24 .sk-empty { margin: 0; font: 500 15px/1.4 var(--ui); color: var(--faint); padding: 18px; border: 1px dashed var(--line); border-radius: 2px; }
.ccard .skchip24 { position: absolute; top: 8px; right: 8px; font: 700 10px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; padding: 4px 6px; border: 1px solid var(--tc, rgba(236,226,212,.35)); color: var(--ink); background: rgba(11,8,7,.75); border-radius: 2px; pointer-events: none; }
.ccard { position: relative; }
@media (max-width: 760px) {
  #skins24 .sk-main { grid-template-columns: minmax(0, 1fr); }
  #skins24 .sk-side { position: static; }
  #skins24 .sk-stage { max-width: 210px; width: 100%; align-self: center; }
  #skins24 .sk-sname { font-size: 26px; }
  #skins24 .sk-line { min-height: 0; font-size: 14px; }
  #skins24 .sk-tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: -2px; }
  #skins24 .sk-tabs::-webkit-scrollbar { display: none; }
  #skins24 .sk-tabs button { flex: none; }
  #skins24 .sk-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
  #skins24 .sk-tabs button { padding: 7px 8px; font-size: 12px; letter-spacing: .08em; }
}
@media (pointer: coarse) { #skins24 .sk-hint { display: none; } }
@media (prefers-reduced-motion: reduce) { #skins24 .sk-card { transition: none; } #skins24 .sk-card:hover { transform: none; } }
`;
  document.head.appendChild(css);
  const sec = document.createElement('section');
  sec.id = 'skins24'; sec.className = 'panel scrim'; sec.hidden = true; sec.setAttribute('aria-label', 'Skins');
  const chev = (d) => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg>`;
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="currentColor"/></svg>';
  sec.innerHTML = `<div class="sk-inner">
    <header class="sk-head"><div><p class="kick">Garderobe</p><h2 class="sk-cname"></h2></div><button type="button" class="btn sk-done">Done</button></header>
    <div class="sk-main">
      <div class="sk-side">
        <div class="sk-stage"><canvas class="sk-big" aria-hidden="true"></canvas>
          <button type="button" class="sk-arrow prev" aria-label="Previous skin">${chev('M13 3 L6 10 L13 17')}</button>
          <button type="button" class="sk-arrow next" aria-label="Next skin">${chev('M7 3 L14 10 L7 17')}</button>
          <button type="button" class="sk-star sk-favbig" aria-pressed="false" aria-label="Favourite">${STAR}</button>
          <span class="sk-count"></span></div>
        <p class="sk-sname"></p>
        <div class="sk-meta"><span class="sk-tag sk-cat"></span><span class="sk-tag sk-state"></span></div>
        <p class="sk-line"></p>
        <div class="sk-actions"><button type="button" class="btn primary sk-wear">Wear this</button><button type="button" class="btn sk-rand" title="Wear a random look">Shuffle</button></div>
        <button type="button" class="sk-tog" role="switch" aria-checked="false"><span><b>New look every run</b><small class="sk-togs">Picks a random look when a run starts.</small></span><i></i></button>
        <p class="sk-hint"><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> browse, <kbd>Enter</kbd> wear, <kbd>F</kbd> favourite, <kbd>1</kbd> to <kbd>6</kbd> category, <kbd>Esc</kbd> close.</p>
      </div>
      <div class="sk-browse"><div class="sk-tabs" role="group" aria-label="Category"></div><div class="sk-groups"></div></div>
    </div>
  </div>`;
  (document.getElementById('app') || document.body).appendChild(sec);
  const $ = (q) => sec.querySelector(q);
  const V = { id: 'apple', i: 0, raf: 0, t0: 0, hopT: -9, look: null, from: null, filter: 'all' };
  const opts = (id) => [{ skin: 0, name: 'Original', line: CHARS[id].desc }].concat(SKINS[id].map((S, i) => ({ skin: i + 1, name: S.name, line: S.line })));
  const FILTERS = () => [{ id: 'all', label: 'All', col: '#ece2d4' }].concat(CATS136.filter((c) => c.id === 'Original' || SKINS[V.id].some((S) => (S.tier || 'Epic') === c.id)), [{ id: 'fav', label: 'Favourites', col: '#ffd23a' }]);
  const visible = (o) => V.filter === 'all' || (V.filter === 'fav' ? isFav(V.id, o.name) : catOf(o) === V.filter);
  const visIdx = () => opts(V.id).map((o, i) => (visible(o) ? i : -1)).filter((i) => i >= 0);

  function paintTabs() {
    const list = opts(V.id), F = FILTERS();
    if (!F.some((f) => f.id === V.filter)) V.filter = 'all';
    $('.sk-tabs').innerHTML = F.map((f) => {
      const n = f.id === 'all' ? list.length : f.id === 'fav' ? list.filter((o) => isFav(V.id, o.name)).length : list.filter((o) => catOf(o) === f.id).length;
      return `<button type="button" data-f="${f.id}" aria-pressed="${V.filter === f.id}" style="--tc:${f.col}"><i></i>${f.label} <em>${n}</em></button>`;
    }).join('');
  }
  function paintGroups() {
    const list = opts(V.id), box = $('.sk-groups');
    const groups = CATS136.map((c) => ({ c, items: list.map((o, i) => ({ o, i })).filter((x) => catOf(x.o) === c.id) })).filter((g) => g.items.length);
    box.innerHTML = groups.map((g) => `<div class="sk-group" data-cat="${g.c.id}" style="--tc:${g.c.col}"><div class="sk-ghead"><b>${g.c.label}</b><span>${g.c.blurb}</span></div><div class="sk-grid" role="radiogroup" aria-label="${g.c.label} skins">${
      g.items.map(({ o, i }) => `<div class="sk-card" role="radio" tabindex="-1" data-i="${i}" style="--tc:${g.c.col}"><canvas aria-hidden="true"></canvas><span class="wb">Wearing</span><button type="button" class="sk-star" data-star="${i}" aria-pressed="false" aria-label="Favourite ${o.name}">${STAR}</button><b>${o.name}</b></div>`).join('')
    }</div></div>`).join('') + '<p class="sk-empty" hidden>No favourites yet. Tap the star on a look to keep it here.</p>';
    sizeCards();
  }
  function applyFilter() {
    const list = opts(V.id);
    sec.querySelectorAll('.sk-card').forEach((b) => { b.hidden = !visible(list[+b.dataset.i]); });
    sec.querySelectorAll('.sk-group').forEach((g) => { g.hidden = !g.querySelector('.sk-card:not([hidden])'); });
    $('.sk-empty').hidden = V.filter !== 'fav' || list.some((o) => isFav(V.id, o.name));
    sec.querySelectorAll('.sk-tabs button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === V.filter ? 'true' : 'false'));
    const vi = visIdx(); if (vi.length && !vi.includes(V.i)) V.i = vi[0];
  }
  function paintInfo() {
    const id = V.id, list = opts(id), o = list[V.i], worn = skinIdx(id) === o.skin, cd = catDef(catOf(o));
    sec.style.setProperty('--acc24', o.skin ? SKINS[id][o.skin - 1].acc : cd.col);
    $('.sk-cname').textContent = CHARS[id].name;
    $('.sk-sname').textContent = o.name;
    const ct = $('.sk-cat'); ct.textContent = cd.label; ct.style.setProperty('--tc', cd.col);
    const sg = $('.sk-state'); sg.textContent = worn ? 'Wearing' : 'Preview'; sg.style.setProperty('--tc', worn ? '#7cff7a' : 'rgba(236,226,212,.5)');
    $('.sk-line').textContent = o.line;
    const vi = visIdx(), pos = vi.indexOf(V.i);
    $('.sk-count').textContent = pos >= 0 ? `${pos + 1} / ${vi.length}` : `${V.i + 1} / ${list.length}`;
    const w = $('.sk-wear'); w.disabled = worn; w.textContent = worn ? 'Wearing' : 'Wear this';
    $('.sk-favbig').setAttribute('aria-pressed', isFav(id, o.name) ? 'true' : 'false');
    const sh = !!Save.data.settings[shuffleKey(id)], nf = favs(id).length;
    const tg = $('.sk-tog'); tg.setAttribute('aria-checked', sh ? 'true' : 'false');
    $('.sk-togs').textContent = nf >= 2 ? `Picks one of your ${nf} favourites when a run starts.` : 'Picks a random look when a run starts. Star 2 or more to pick from those only.';
    sec.querySelectorAll('.sk-card').forEach((b) => {
      const i = +b.dataset.i, on = i === V.i;
      b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      b.classList.toggle('worn', skinIdx(id) === list[i].skin);
      b.querySelector('.sk-star').setAttribute('aria-pressed', isFav(id, list[i].name) ? 'true' : 'false');
    });
  }
  const paintAll = () => { paintTabs(); applyFilter(); paintInfo(); };
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function sizeCards() { const d = dpr(); sec.querySelectorAll('.sk-card canvas').forEach((cv) => { const q = cv.getBoundingClientRect(); cv.width = Math.max(32, Math.round((q.width || 100) * d)); cv.height = Math.max(32, Math.round((q.height || 100) * d)); }); }
  function pickCard(i) {
    if (i === V.i) { wear(); return; }
    V.i = i; V.hopT = (performance.now() - V.t0) / 1000; paintInfo(); safe(() => Sfx.blip());
  }
  function toggleFav(i) {
    const o = opts(V.id)[i], F = favs(V.id), k = F.indexOf(o.name);
    if (k >= 0) F.splice(k, 1); else F.push(o.name);
    safe(() => Save.store()); safe(() => Sfx.tone(k >= 0 ? 520 : 880, 0.08, { vol: 0.04 }));
    paintTabs(); applyFilter(); paintInfo();
  }
  function open(id) {
    if (!SKINS[id]) return;
    if (V.id !== id) V.filter = 'all';
    V.id = id; V.i = skinIdx(id); V.t0 = performance.now();
    sec.hidden = false; sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter');
    paintGroups(); paintAll();
    const big = $('.sk-big');
    const size = () => { const d = dpr(), r = big.getBoundingClientRect(); big.width = Math.max(64, Math.round(r.width * d)); big.height = Math.max(64, Math.round(r.height * d)); sizeCards(); };
    size(); V.size = size;
    Sched.cancel(V.raf);
    let last = 0, k = 0;
    const loop = (now) => {
      if (sec.hidden) return;
      const t = (now - V.t0) / 1000, h = t - V.hopT, hop = h >= 0 && h < 0.5 ? Math.sin((h / 0.5) * Math.PI) : 0;
      safe(() => drawOn(big, V.id, V.i, t, { hop, lookX: V.look ? V.look.x : undefined, lookY: V.look ? V.look.y : undefined }));
      // thumbnails: only the ones on screen, a few per frame so a long list stays smooth
      if (now - last > 50) {
        last = now;
        const cards = [...sec.querySelectorAll('.sk-card:not([hidden])')], H = window.innerHeight;
        for (let n = 0; n < 6 && cards.length; n++) {
          const b = cards[k++ % cards.length], r = b.getBoundingClientRect();
          if (r.bottom < 0 || r.top > H) continue;
          const i = +b.dataset.i; safe(() => drawOn(b.querySelector('canvas'), V.id, i, t + i * 0.7));
        }
      }
      V.raf = Sched.raf(loop);
    };
    // first paint of every thumbnail at once, so nothing sits empty
    sec.querySelectorAll('.sk-card').forEach((b) => { const i = +b.dataset.i; safe(() => drawOn(b.querySelector('canvas'), V.id, i, i * 0.7)); });
    V.raf = Sched.raf(loop);
    safe(() => Sfx.pickup());
    setTimeout(() => { const b = sec.querySelector('.sk-card[aria-checked="true"]'); if (b) { b.focus({ preventScroll: true }); b.scrollIntoView({ block: 'nearest' }); } }, 60);
  }
  function close() {
    if (sec.hidden) return;
    sec.hidden = true; Sched.cancel(V.raf);
    safe(() => UI.paintChars());
    const b = document.querySelector(`#charList .ccard[data-id="${V.id}"]`); if (b) b.focus({ preventScroll: true });
  }
  function step(d) {
    const vi = visIdx(); if (!vi.length) return;
    const p = vi.indexOf(V.i), n = vi.length;
    V.i = vi[((p < 0 ? 0 : p + d) % n + n) % n]; V.hopT = (performance.now() - V.t0) / 1000; paintInfo(); safe(() => Sfx.blip());
    const b = sec.querySelector(`.sk-card[data-i="${V.i}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  function wear() {
    const o = opts(V.id)[V.i]; if (skinIdx(V.id) === o.skin) return;
    setSkin(V.id, o.skin); V.hopT = (performance.now() - V.t0) / 1000; paintInfo();
    safe(() => { Sfx.pickup(); Sfx.tone(660, 0.12, { to: 880, vol: 0.05 }); });
  }
  // a random look: from the favourites when there are two or more, else from all; never the one on now
  function randomIdx(id) {
    const list = opts(id), F = favs(id), cur = skinIdx(id);
    let pool = list.filter((o) => F.length >= 2 ? F.includes(o.name) : true).map((o) => o.skin).filter((s) => s !== cur);
    if (!pool.length) pool = list.map((o) => o.skin).filter((s) => s !== cur);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : cur;
  }
  function shuffle() {
    const s = randomIdx(V.id);
    const vi = visIdx(); if (!vi.includes(s)) V.filter = 'all';
    V.i = s; setSkin(V.id, s); V.hopT = (performance.now() - V.t0) / 1000; paintAll();
    safe(() => { Sfx.slotTick(); Sfx.pickup(); });
    const b = sec.querySelector(`.sk-card[data-i="${s}"]`); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  $('.sk-done').addEventListener('click', (e) => { e.preventDefault(); close(); });
  $('.prev').addEventListener('click', (e) => { e.preventDefault(); step(-1); });
  $('.next').addEventListener('click', (e) => { e.preventDefault(); step(1); });
  $('.sk-wear').addEventListener('click', (e) => { e.preventDefault(); wear(); });
  $('.sk-rand').addEventListener('click', (e) => { e.preventDefault(); shuffle(); });
  $('.sk-favbig').addEventListener('click', (e) => { e.preventDefault(); toggleFav(V.i); });
  $('.sk-tog').addEventListener('click', (e) => { e.preventDefault(); const k = shuffleKey(V.id); Save.data.settings[k] = !Save.data.settings[k]; safe(() => Save.store()); paintInfo(); safe(() => Sfx.blip()); });
  $('.sk-tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-f]'); if (!b) return; e.preventDefault(); V.filter = b.dataset.f; applyFilter(); paintInfo(); sizeCards(); safe(() => Sfx.blip()); });
  $('.sk-groups').addEventListener('click', (e) => {
    const st = e.target.closest('.sk-star'); if (st) { e.preventDefault(); e.stopPropagation(); toggleFav(+st.dataset.star); return; }
    const b = e.target.closest('.sk-card'); if (b) { e.preventDefault(); pickCard(+b.dataset.i); }
  });
  const big = $('.sk-big');
  big.addEventListener('click', () => { V.hopT = (performance.now() - V.t0) / 1000; safe(() => Sfx.blip()); });
  big.addEventListener('pointermove', (e) => { const r = big.getBoundingClientRect(); V.look = { x: ((e.clientX - r.left) / r.width - 0.5) * 2.4, y: ((e.clientY - r.top) / r.height - 0.45) * 2.4 }; });
  big.addEventListener('pointerleave', () => { V.look = null; });
  window.addEventListener('resize', () => { if (!sec.hidden && V.size) V.size(); });
  window.addEventListener('keydown', (e) => {
    if (sec.hidden) return;
    const k = e.key, stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (k === 'Escape') { stop(); close(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { stop(); step(-1); }
    else if (k === 'ArrowRight' || k === 'ArrowDown') { stop(); step(1); }
    else if (k === 'f' || k === 'F') { stop(); toggleFav(V.i); }
    else if (k === 'r' || k === 'R') { stop(); shuffle(); }
    else if (/^[1-9]$/.test(k)) { const f = FILTERS()[+k - 1]; if (f) { stop(); V.filter = f.id; applyFilter(); paintInfo(); sizeCards(); } }
    else if ((k === 'Enter' || k === ' ') && !(e.target && e.target.closest && e.target.closest('.sk-done, .sk-arrow, .sk-star, .sk-tabs, .sk-tog, .sk-rand'))) { stop(); wear(); }
  }, true);

  /* a new look every run, for apples that have the switch on */
  safe(() => {
    Hooks.layer('Game.startRun', 'v13.6 random look', function (next) {
      safe(() => { const id = Save.data.char; if (SKINS[id] && Save.data.settings[shuffleKey(id)]) Save.data.settings[skinKey(id)] = randomIdx(id); });
      return next.apply(this, [].slice.call(arguments, 1));
    });
  });

  /* tap a character on the Characters screen: it is picked, and its wardrobe opens */
  safe(() => {
    const list = document.getElementById('charList'); if (!list) return;
    list.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('.ccard'); if (!b) return;
      const id = b.dataset.id; if (!(id === 'apple' || Save.data.unlocks[id])) return;
      setTimeout(() => open(id), 0);
    });
  });
  const pc0 = UI.paintChars;
  UI.paintChars = function () {
    const r = pc0.apply(this, arguments);
    safe(() => {
      for (const b of this.el.charList.children) {
        const id = b.dataset.id, open_ = id === 'apple' || !!Save.data.unlocks[id];
        let chip = b.querySelector('.skchip24');
        if (!SKINS[id] || !open_) { if (chip) chip.remove(); continue; }
        if (!chip) { chip = document.createElement('span'); chip.className = 'skchip24'; b.appendChild(chip); }
        chip.textContent = skinOn(id) ? curSkin(id).name : `${SKINS[id].length + 1} looks`;
        chip.style.setProperty('--tc', catDef(skinOn(id) ? curSkin(id).tier || 'Epic' : 'Original').col);
        if (Save.data.settings[shuffleKey(id)]) chip.textContent += ' · shuffle';
        const tg = b.querySelector('.tagl'); if (tg && Save.data.char === id) tg.textContent = 'Selected. Tap for skins';
      }
    });
    return r;
  };

})(window.__bitten.S62 || (window.__bitten.S62 = {}));
