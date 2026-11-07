/* src/77-v137-chars-tab.js: v13.7: Characters tab. From v13.7. Lines 39561 to 39790 of the v13.7 script. */
/* ===== v13.7: Characters tab in How to play, rebuilt. No more wall of text: a roster strip, the four
   kinds of look as colour tiles, the wardrobe in five short moves, and one card per apple with its
   worn look, stat bars against the rest, the perk, a look bar per category, the look names as chips
   and a button straight into the wardrobe. Locked apples show the achievement and how far along. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe77'); try { console.error('chars137', e); } catch (x) { /* ignore */ } return fb; } };
  const CATS = [
    { id: 'Original', col: '#a69688', blurb: 'How the apple left the factory.' },
    { id: 'Epic', col: '#e3a54a', blurb: 'Full outfits. Aura, light rays, own particles, a trail in fights.' },
    { id: 'Grotesque', col: '#c84a5a', blurb: 'Something from the game got in and stayed.' },
    { id: 'Arcade', col: '#3af0ff', blurb: 'Old console filters. Kills burst in the same style.' },
  ];
  const COL = {
    apple: '#d92a40', appel: '#c8303c', rot: '#8c6d2c', krul: '#c8844a', mika: '#2a5af0',
    pean: '#b07a48', apploa: '#8a5030', lucif: '#d5232f', lucky: '#a8b830',
  };
  const ACC = {
    apple: '#7fc85a', appel: '#f2c890', rot: '#b8c86a', krul: '#e0a060', mika: '#9ad8ff',
    pean: '#f0b890', apploa: '#e8c870', lucif: '#e2b04e', lucky: '#ffd84a',
  };
  const STEPS = [
    ['Open', 'Tap an apple on the Characters screen, or Wardrobe below.'],
    ['Filter', 'Tabs per kind, with counts. Keys 1 to 6.'],
    ['Star', 'Mark favourites with the star or F.'],
    ['Shuffle', 'A random look. From favourites once you star 2.'],
    ['Every run', 'Switch on New look every run. It picks for you at the start.'],
  ];
  const sk = () => (window.__bitten && window.__bitten.SKINS24) || null;
  const skinsOf = (id) => { const S = sk(); return (S && S.SKINS && S.SKINS[id]) || []; };
  const tierOf = (s) => s.tier || 'Epic';
  const unlocked = (id) => id === 'apple' || !!(Save.data && Save.data.unlocks && Save.data.unlocks[id]);

  const css = document.createElement('style');
  css.textContent = `
#tab-chars.c137 > :not(.c137-root) { display: none !important; }
.c137-root { display: flex; flex-direction: column; gap: 22px; }
.c137-lead { margin: 0; font: 500 17px/1.4 var(--ui); color: var(--muted); max-width: 60ch; }
.c137-lead b { color: var(--ink); font-weight: 600; }
.c137-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--line); border-radius: 2px; }
.c137-strip div { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; min-width: 0; border-right: 1px solid var(--line); }
.c137-strip div:last-child { border-right: 0; }
.c137-strip b { font: 700 26px/1 var(--ui); font-variant-numeric: tabular-nums; color: var(--ink); }
.c137-strip b small { font-size: 15px; color: var(--faint); font-weight: 600; }
.c137-strip span { font: 600 11px/1.1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
.c137-h { margin: 0 0 10px; font: 600 13px/1 var(--ui); letter-spacing: .3em; text-transform: uppercase; color: var(--apple-hi); display: flex; gap: 10px; align-items: baseline; }
.c137-h em { font-style: normal; color: var(--faint); letter-spacing: .1em; }
.c137-kinds { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.c137-kind { border: 1px solid var(--line); border-top: 3px solid var(--kc); border-radius: 2px; padding: 10px 11px; display: flex; flex-direction: column; gap: 5px; min-width: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--kc) 10%, transparent), transparent 70%); }
.c137-kind header { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
.c137-kind b { font: 700 16px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--kc); }
.c137-kind i { font: 700 20px/1 var(--ui); font-style: normal; font-variant-numeric: tabular-nums; color: var(--ink); }
.c137-kind p { margin: 0; font: 500 14px/1.3 var(--ui); color: var(--muted); }
.c137-steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0; border: 1px solid var(--line); border-radius: 2px; counter-reset: st; }
.c137-steps div { padding: 10px 11px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.c137-steps div:last-child { border-right: 0; }
.c137-steps b { font: 700 15px/1.1 var(--ui); letter-spacing: .06em; color: var(--ink); display: flex; gap: 7px; align-items: baseline; }
.c137-steps b::before { counter-increment: st; content: counter(st); font: 700 11px/1 var(--ui); color: var(--void); background: var(--toffee); padding: 3px 5px; border-radius: 1px; }
.c137-steps span { font: 500 13px/1.3 var(--ui); color: var(--muted); }
.c137-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 12px; }
.c137-card { --cc: #d92a40; --ca: #e3a54a; border: 1px solid color-mix(in srgb, var(--cc) 45%, var(--line)); border-radius: 2px; display: grid; grid-template-columns: 112px minmax(0, 1fr); background: linear-gradient(110deg, color-mix(in srgb, var(--cc) 14%, transparent), rgba(255,255,255,.015) 55%); overflow: hidden; }
.c137-card.locked { --cc: #6a5e56; --ca: var(--faint); border-color: var(--line); background: rgba(255,255,255,.015); }
.c137-pic { position: relative; background: linear-gradient(180deg, #0c0807, color-mix(in srgb, var(--cc) 10%, #0c0807)); border-right: 1px solid var(--line); display: flex; flex-direction: column; }
.c137-pic canvas { width: 100%; aspect-ratio: 1 / 1.15; max-width: 100%; display: block; }
.c137-pic .c137-worn { padding: 6px 6px 8px; font: 600 10px/1.15 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink); text-align: center; border-top: 1px solid var(--line); }
.c137-pic .c137-worn i { display: block; font-style: normal; color: var(--wc, var(--faint)); margin-bottom: 1px; }
.c137-body { padding: 11px 12px 12px; display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.c137-name { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.c137-name b { font: 800 26px/.95 var(--display); color: var(--ink); }
.c137-card.locked .c137-name b { color: var(--faint); }
.c137-name span { font: 600 11px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--ca); white-space: nowrap; }
.c137-desc { margin: 0; font: 500 14px/1.3 var(--ui); color: var(--muted); }
.c137-bars { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 14px; margin: 0; }
.c137-bars div { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.c137-bars dt { font: 600 10px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: var(--faint); display: flex; justify-content: space-between; gap: 4px; }
.c137-bars dt em { font-style: normal; color: var(--ink); font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.c137-bars dd { margin: 0; height: 4px; background: rgba(236,226,212,.09); border-radius: 1px; overflow: hidden; }
.c137-bars dd i { display: block; height: 100%; background: var(--cc); filter: brightness(1.25); }
.c137-perk { margin: 0; font: 500 13px/1.3 var(--ui); color: var(--ink); padding-left: 9px; border-left: 2px solid var(--ca); }
.c137-perk b { font-weight: 700; color: var(--ca); letter-spacing: .14em; text-transform: uppercase; font-size: 10px; margin-right: 6px; }
.c137-looks { display: flex; flex-direction: column; gap: 6px; }
.c137-lbar { display: flex; height: 6px; gap: 2px; }
.c137-lbar i { display: block; height: 100%; background: var(--kc); border-radius: 1px; }
.c137-lhead { display: flex; justify-content: space-between; gap: 8px; font: 600 11px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
.c137-lhead em { font-style: normal; color: var(--ink); }
.c137-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.c137-chip { font: 600 12px/1 var(--ui); letter-spacing: .03em; color: var(--ink); padding: 4px 6px 4px 5px; border: 1px solid color-mix(in srgb, var(--kc) 55%, transparent); border-left: 3px solid var(--kc); border-radius: 1px; background: color-mix(in srgb, var(--kc) 8%, transparent); white-space: nowrap; }
.c137-chip.on { background: color-mix(in srgb, var(--kc) 26%, transparent); }
.c137-chip.on::after { content: " \\2713"; color: var(--kc); }
.c137-chip.arc { color: var(--kc); }
.c137-go { all: unset; box-sizing: border-box; cursor: pointer; align-self: flex-start; font: 600 13px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: var(--ink); border: 1px solid color-mix(in srgb, var(--ca) 70%, transparent); padding: 9px 12px; min-height: 36px; border-radius: 2px; display: inline-flex; align-items: center; gap: 8px; }
.c137-go:hover { background: color-mix(in srgb, var(--ca) 14%, transparent); }
.c137-go:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.c137-go svg { width: 12px; height: 12px; }
.c137-lock { margin: 0; padding: 9px 10px; border: 1px dashed var(--line); border-radius: 2px; display: flex; flex-direction: column; gap: 6px; }
.c137-lock span { font: 600 11px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
.c137-lock b { font: 600 15px/1.25 var(--ui); color: var(--ink); }
.c137-lock .c137-prog { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; }
.c137-lock .c137-prog i { display: block; height: 4px; background: rgba(236,226,212,.09); border-radius: 1px; overflow: hidden; }
.c137-lock .c137-prog i b { display: block; height: 100%; background: var(--toffee); }
.c137-lock .c137-prog em { font: 600 12px/1 var(--ui); font-style: normal; font-variant-numeric: tabular-nums; color: var(--muted); }
.c137-foot { margin: 0; font: 500 13px/1.3 var(--ui); letter-spacing: .04em; color: var(--faint); }
@media (max-width: 640px) {
  .c137-kinds { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .c137-steps { grid-template-columns: minmax(0, 1fr); }
  .c137-steps div { border-right: 0; border-bottom: 1px solid var(--line); flex-direction: row; align-items: baseline; gap: 10px; }
  .c137-steps div:last-child { border-bottom: 0; }
  .c137-steps b { flex: 0 0 96px; }
}
@media (max-width: 420px) {
  .c137-list { grid-template-columns: minmax(0, 1fr); }
  .c137-card { grid-template-columns: 92px minmax(0, 1fr); }
  .c137-name b { font-size: 23px; }
  .c137-bars { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 7px; }
  .c137-strip b { font-size: 22px; }
}
@media (prefers-reduced-motion: reduce) { .c137-go { transition: none; } }
`;
  document.head.appendChild(css);

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function stats(ids) {
    const v = (C) => ({ spd: C.speed || 150, rate: 1 / (C.fireDelay || 0.36), dmg: C.dmg || 1, hp: C.maxHp || 6 });
    const all = ids.map((id) => v(CHARS[id]));
    const mx = { spd: 0, rate: 0, dmg: 0, hp: 0 }, mn = { spd: 1e9, rate: 1e9, dmg: 1e9, hp: 1e9 };
    for (const a of all) for (const k in mx) { mx[k] = Math.max(mx[k], a[k]); mn[k] = Math.min(mn[k], a[k]); }
    // bars start at 35% for the lowest, so nobody reads as empty
    return (id) => { const a = v(CHARS[id]), o = {}; for (const k in a) o[k] = 35 + 65 * ((a[k] - mn[k]) / ((mx[k] - mn[k]) || 1)); return { a, o }; };
  }

  function paintPic(cv, id, open) {
    safe(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      const w = Math.max(60, Math.round((r.width || 112) * dpr)), h = Math.max(60, Math.round((r.height || 150) * dpr));
      cv.width = w; cv.height = h;
      const S = sk();
      if (open && S && S.drawOn) { S.drawOn(cv, id, null, 1.3, { lookX: 0.35, lookY: 0.2 }); return; }
      if (typeof paintChar === 'function') paintChar(cv, id, !open);
    });
  }

  function build() {
    const tab = document.getElementById('tab-chars'); if (!tab) return;
    tab.classList.add('c137');
    let root = tab.querySelector('.c137-root');
    if (!root) { root = document.createElement('div'); root.className = 'c137-root'; tab.appendChild(root); }
    const ids = CHAR_IDS.filter((id) => CHARS[id]);
    const st = stats(ids);
    const S = sk();
    const count = { Original: 0, Epic: 0, Grotesque: 0, Arcade: 0 };
    let looks = 0;
    for (const id of ids) { count.Original++; looks++; for (const s of skinsOf(id)) { count[tierOf(s)] = (count[tierOf(s)] || 0) + 1; looks++; } }
    const open = ids.filter(unlocked).length;
    const arcNames = [...new Set(ids.flatMap((id) => skinsOf(id).filter((s) => tierOf(s) === 'Arcade').map((s) => s.name)))];
    const kdesc = (c) => c.id === 'Arcade' && arcNames.length ? `${c.blurb} Same ${arcNames.length} for every apple: ${arcNames.join(', ')}.` : c.blurb;

    let h = `<p class="c137-lead">Every apple plays different. <b>Speed, fire rate, damage and apples</b> are fixed per apple, the perk is what makes it one. Looks are cosmetic. Nothing else changes.</p>
<div class="c137-strip" role="list">
  <div role="listitem"><b>${open}<small> / ${ids.length}</small></b><span>Apples open</span></div>
  <div role="listitem"><b>${looks}</b><span>Looks in total</span></div>
  <div role="listitem"><b>4</b><span>Kinds of look</span></div>
</div>
<section><h3 class="c137-h">Kinds of look <em>${looks}</em></h3><div class="c137-kinds">`;
    for (const c of CATS) h += `<div class="c137-kind" style="--kc:${c.col}"><header><b>${c.id}</b><i>${count[c.id] || 0}</i></header><p>${esc(kdesc(c))}</p></div>`;
    h += `</div></section><section><h3 class="c137-h">The wardrobe</h3><div class="c137-steps">`;
    for (const [a, b] of STEPS) h += `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`;
    h += `</div></section><section><h3 class="c137-h">The apples <em>${ids.length}</em></h3><div class="c137-list">`;
    for (const id of ids) {
      const C = CHARS[id], ok = unlocked(id), L = skinsOf(id);
      const worn = ok && S && S.skinIdx ? S.skinIdx(id) : 0, wS = worn ? L[worn - 1] : null;
      const wCat = wS ? CATS.find((c) => c.id === tierOf(wS)) : CATS[0];
      const { a, o } = st(id);
      h += `<article class="c137-card${ok ? '' : ' locked'}" ${ok ? `style="--cc:${COL[id] || '#d92a40'};--ca:${ACC[id] || '#e3a54a'}"` : ''} data-id="${id}">
<div class="c137-pic"><canvas data-c137="${id}" aria-hidden="true"></canvas>${ok ? `<span class="c137-worn" style="--wc:${wCat.col}"><i>${wCat.id}</i>${esc(wS ? wS.name : 'No skin')}</span>` : ''}</div>
<div class="c137-body">
<div class="c137-name"><b>${ok ? esc(C.name) : '???'}</b><span>${id === 'apple' ? 'Start' : ok ? 'Open' : 'Locked'}</span></div>`;
      if (ok) {
        h += `<p class="c137-desc">${esc(C.desc)}</p>
<dl class="c137-bars">
<div><dt>Speed<em>${Math.round(a.spd)}</em></dt><dd><i style="width:${o.spd.toFixed(0)}%"></i></dd></div>
<div><dt>Fire<em>${a.rate.toFixed(1)}/s</em></dt><dd><i style="width:${o.rate.toFixed(0)}%"></i></dd></div>
<div><dt>Damage<em>${a.dmg.toFixed(2).replace(/0$/, '')}x</em></dt><dd><i style="width:${o.dmg.toFixed(0)}%"></i></dd></div>
<div><dt>Apples<em>${a.hp / 2}</em></dt><dd><i style="width:${o.hp.toFixed(0)}%"></i></dd></div>
</dl>`;
        if (C.perk) h += `<p class="c137-perk"><b>Perk</b>${esc(C.perk)}</p>`;
        const per = { Original: 1 }; for (const s of L) per[tierOf(s)] = (per[tierOf(s)] || 0) + 1;
        h += `<div class="c137-looks"><div class="c137-lhead"><span>Looks</span><em>${L.length + 1}</em></div><div class="c137-lbar" aria-hidden="true">`;
        for (const c of CATS) if (per[c.id]) h += `<i style="--kc:${c.col};flex:${per[c.id]}"></i>`;
        h += `</div><div class="c137-chips">`;
        h += `<span class="c137-chip${worn ? '' : ' on'}" style="--kc:${CATS[0].col}">Original</span>`;
        L.forEach((s, i) => { if (tierOf(s) === 'Arcade') return; const c = CATS.find((k) => k.id === tierOf(s)) || CATS[1]; h += `<span class="c137-chip${worn === i + 1 ? ' on' : ''}" style="--kc:${c.col}">${esc(s.name)}</span>`; });
        if (per.Arcade) { const on = wS && tierOf(wS) === 'Arcade'; h += `<span class="c137-chip arc${on ? ' on' : ''}" style="--kc:${CATS[3].col}">${on ? esc(wS.name) : `+${per.Arcade} Arcade`}</span>`; }
        h += `</div></div>`;
        if (L.length && S && S.open) h += `<button type="button" class="c137-go" data-open="${id}">Wardrobe<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>`;
      } else {
        const A = C.ach && typeof ACHS !== 'undefined' ? ACHS.find((x) => x.id === C.ach) : null;
        const p = A && typeof Meta !== 'undefined' ? Meta.progress(A) : 0, g = A ? A.goal : 1;
        h += `<div class="c137-lock"><span>${A ? esc(A.name) : 'To unlock'}</span><b>${esc(C.unlock || (A && A.desc) || 'Keep playing.')}</b>`;
        if (A) h += `<div class="c137-prog"><i><b style="width:${Math.round((p / g) * 100)}%"></b></i><em>${p} / ${g}</em></div>`;
        h += `</div>`;
        const n = L.length + 1;
        h += `<div class="c137-lhead"><span>Looks waiting</span><em>${n}</em></div>`;
      }
      h += `</div></article>`;
    }
    h += `</div></section><p class="c137-foot">Bars compare the ${ids.length} apples with each other. Fire is shots per second without powerups.</p>`;
    root.innerHTML = h;
    requestAnimationFrame(() => { for (const cv of root.querySelectorAll('canvas[data-c137]')) paintPic(cv, cv.dataset.c137, unlocked(cv.dataset.c137)); });
  }

  safe(() => {
    document.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('.c137-go'); if (!b) return;
      const S = sk(); if (S && S.open) safe(() => S.open(b.dataset.open));
    });
    // repaint after the wardrobe closes, the worn look may have changed
    const w = document.getElementById('skins24');
    if (w && window.MutationObserver) new MutationObserver(() => { if (w.hidden) { const t = document.getElementById('tab-chars'); if (t && !t.hidden) safe(build); } }).observe(w, { attributes: true, attributeFilter: ['hidden'] });
    const prev = UI.buildHowChars9;
    UI.buildHowChars9 = function () { safe(() => prev && prev.apply(this, arguments)); safe(build); };
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const t = document.getElementById('tab-chars'); if (t && !t.hidden) for (const cv of t.querySelectorAll('canvas[data-c137]')) paintPic(cv, cv.dataset.c137, unlocked(cv.dataset.c137)); }, 150); });
    if (typeof TEXT_LIT9 === 'object' && Array.isArray(TEXT_LIT9.messages)) for (const s of ['Every apple plays different.', 'Kinds of look', 'The wardrobe', 'The apples', 'Looks waiting', 'Bars compare the apples with each other. Fire is shots per second without powerups.'].concat(STEPS.map((x) => x[1]), CATS.map((c) => c.blurb))) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
    const t = document.getElementById('tab-chars'); if (t && !t.hidden) build();
  });
  window.__bitten = window.__bitten || {};
  window.__bitten.chars137 = { build };
})();

