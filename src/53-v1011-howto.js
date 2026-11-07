/* src/53-v1011-howto.js: v10.11: How to play, one header, one row of tabs. From v10.11. Lines 23908 to 24155 of the v13.7 script. */
/* ===== v10.11: How to play, cleaner. One sticky header, one row of tabs, grouped lists ===== */
(function () {
  'use strict';
  const safe = (fn) => { try { fn(); } catch (e) { errNote14(e, 'safe53'); console.error(e); } };
  const how = document.getElementById('how'); if (!how) return;
  const inner = how.querySelector('.sheet-inner'); if (!inner) return;
  inner.classList.add('how11');

  const css = `
#how.sheet { padding-top: 0; overflow-x: hidden; }
#how .how11, #how .how11 > .sheet-head, #how .head11, #how .how11 .tabpanel9 { min-width: 0; }
#how .how11 { gap: 18px; padding-bottom: 32px; }
#how .how11 > .sheet-head { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; align-items: stretch; gap: 10px;
  margin: 0 calc(-1 * max(16px, env(safe-area-inset-left, 0px))); padding: calc(14px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-left, 0px)) 0;
  background: rgba(9, 6, 6, .985); border-bottom: 1px solid var(--line); }
#how .head11 { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
#how .head11 h2 { font-size: clamp(32px, 8vw, 46px); }
#how .head11 .btn { min-height: 40px; padding: 0 16px; font-size: 14px; }
#how .how11 .tabs9 { position: static; display: flex; flex-wrap: nowrap; gap: 4px; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none;
  border: 0; background: none; padding: 0 0 10px; margin: 0; width: 100%; min-width: 0; max-width: 100%; }
#how .how11 .tabs9::-webkit-scrollbar { display: none; }
#how .how11 .tabs9.more { -webkit-mask-image: linear-gradient(90deg, #000 82%, transparent); mask-image: linear-gradient(90deg, #000 82%, transparent); }
#how .how11 .tabs9 button { flex: none; min-height: 36px; padding: 8px 12px; font-size: 14px; letter-spacing: .12em; }
#how .how11 .tabpanel9 { gap: 20px; }
#how .how11 .tabpanel9 h3 { margin: 0 0 8px; }
#how .how11 .intro9 { font-size: 16px; }
#how .sec11 { display: flex; flex-direction: column; min-width: 0; }
#how .cols11 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
#how .cnt11 { color: var(--faint); letter-spacing: .14em; margin-left: 8px; }

/* text lists: one card, thin dividers */
#how .list11, #how .how11 ul.rooms9, #how .how11 ul.rules, #how .how11 dl.keys9 { display: block; margin: 0; padding: 0; list-style: none;
  border: 1px solid var(--line); border-radius: 4px; background: rgba(255, 255, 255, .02); overflow: hidden; }
#how .list11 > *, #how .how11 ul.rooms9 > li, #how .how11 ul.rules > li, #how .how11 dl.keys9 > div { border-top: 1px solid rgba(236, 226, 212, .08); }
#how .list11 > :first-child, #how .how11 ul.rooms9 > li:first-child, #how .how11 ul.rules > li:first-child, #how .how11 dl.keys9 > div:first-child { border-top: 0; }
#how .row11 { padding: 10px 12px; }
#how .row11 b { display: block; font: 700 16px/1.15 var(--ui); letter-spacing: .03em; color: var(--ink); }
#how .row11 span { display: block; margin-top: 3px; font-size: 14.5px; line-height: 1.35; color: var(--muted); }
#how .how11 ul.rooms9 > li { display: grid; grid-template-columns: 10px minmax(0, 1fr); column-gap: 12px; row-gap: 3px; align-items: center; padding: 10px 12px; border-left: 0; border-right: 0; border-bottom: 0; border-radius: 0; background: none; }
#how .how11 ul.rooms9 i { width: 10px; height: 10px; border-radius: 2px; }
#how .how11 ul.rooms9 b { font-size: 16px; }
#how .how11 ul.rooms9 span { font-size: 14.5px; }
#how .how11 ul.rules > li { padding: 10px 12px 10px 28px; font-size: 15px; line-height: 1.38; color: var(--muted); max-width: none; }
#how .how11 ul.rules > li::before { left: 12px; top: calc(10px + .62em); }
#how .how11 ul.rules > li b { color: var(--ink); }
#how .how11 dl.keys9 > div { grid-template-columns: 70px minmax(0, 1fr); gap: 12px; padding: 10px 12px; align-items: baseline; }
#how .how11 dl.keys9 dt { font-size: 13px; }
#how .how11 dl.keys9 dd { font-size: 15px; color: var(--muted); }
#how .how11 dl.keys9 kbd { color: var(--ink); }

/* things with a picture: compact row cards */
#how .how11 .cards.snakes, #how .how11 .cards.chars { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 6px; }
#how .how11 .cards.snakes figure, #how .how11 .cards.chars figure { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 12px; align-items: center; padding: 8px 10px 8px 8px; }
#how .how11 .cards.snakes canvas { width: 76px; height: 54px; border-radius: 3px; }
#how .how11 .cards.chars canvas { width: 76px; height: 64px; border-radius: 3px; }
#how .how11 .cards figcaption { gap: 3px; min-width: 0; }
#how .how11 .cards.snakes b, #how .how11 .cards.chars b { font-size: 20px; }
#how .how11 .cards .size { font-size: 11px; }
#how .how11 .cards.snakes figcaption > span:last-child, #how .how11 .cards.chars .d { font-size: 14px; line-height: 1.3; }
#how .how11 .cards .perk9 { font-size: 12.5px; }

/* powerups */
#how .how11 #tab-items .filt9 { gap: 6px; }
#how .how11 #tab-items .search9 { max-width: none; }
#how .how11 #itemCards, #how .how11 #curseCards, #how .how11 #downCards { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 6px; }
#how .how11 #itemCards figure, #how .how11 #curseCards figure, #how .how11 #downCards figure { gap: 10px; padding: 8px 10px; align-items: flex-start; }
#how .how11 #itemCards canvas, #how .how11 #curseCards canvas, #how .how11 #downCards canvas { width: 40px; height: 40px; margin-top: 2px; }
#how .how11 #itemCards b, #how .how11 #curseCards b, #how .how11 #downCards b { font-size: 18px; }
#how .how11 .cards.items figcaption { gap: 2px; }
#how .how11 .cards .cl10 { font-size: 12px !important; color: #c98a7a; }
#how .how11 .empty11 { margin: 0; font-size: 15px; color: var(--faint); }

/* soundtracks */
#how .jbloop { display: inline-flex; gap: 8px; align-items: center; margin: 0; color: var(--muted); font: 600 15px/1 var(--ui); }
#how .jbloop input { accent-color: var(--apple-hi); width: 18px; height: 18px; }
#how .jblist { display: block; border: 1px solid var(--line); border-radius: 4px; background: rgba(255, 255, 255, .02); overflow: hidden; }
#how .jbrow { display: flex; gap: 12px; align-items: center; padding: 9px 12px; border-top: 1px solid rgba(236, 226, 212, .08); }
#how .jbrow:first-child { border-top: 0; }
#how .jbrow.on { background: rgba(215, 38, 61, .1); }
#how .jbrow.load { opacity: .6; }
#how .jbplay { flex: none; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: transparent; color: var(--ink); font: 700 14px/1 var(--ui); cursor: pointer; padding: 0; }
#how .jbrow.on .jbplay { background: var(--apple-hi); border-color: var(--apple-hi); color: #fff; }
#how .jbplay:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
#how .jbtxt { flex: 1; min-width: 0; display: grid; gap: 3px; }
#how .jbtxt b { font: 700 16px/1.15 var(--ui); letter-spacing: .03em; color: var(--ink); }
#how .jbtxt span { color: var(--muted); font: 500 14px/1.25 var(--ui); }
#how .jbbar { height: 3px; background: var(--line); border-radius: 2px; overflow: hidden; margin-top: 3px; }
#how .jbbar i { display: block; height: 100%; width: 0; background: var(--apple-hi); }
#how .jbrow:not(.on) .jbbar { display: none; }
#how #jukebox { display: flex; flex-direction: column; gap: 12px; }

@media (orientation: landscape) and (max-height: 560px) {
  #how .how11 > .sheet-head { padding-top: 8px; gap: 6px; }
  #how .head11 h2 { font-size: 30px; }
  #how .how11 .tabs9 { padding-bottom: 8px; }
}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sec = (title, child) => { const s = el('div', 'sec11'); s.appendChild(el('h3', null, esc(title))); s.appendChild(child); return s; };

  /* ---- the header: title and back on one line, the tabs right under it, both stay on top */
  safe(() => {
    const head = inner.querySelector('.sheet-head'), tabs = document.getElementById('howTabs');
    if (!head || !tabs) return;
    const row = el('div', 'head11');
    while (head.firstChild) row.appendChild(head.firstChild);
    head.appendChild(row); head.appendChild(tabs);
    // one order that reads from first steps to extras; the controls live in Basics now
    const order = ['basics', 'rooms', 'snakes', 'items', 'chars', 'modes', 'music'];
    const label = { basics: 'Basics', rooms: 'Rooms', snakes: 'Snakes', items: 'Powerups', chars: 'Characters', modes: 'Modes', music: 'Music' };
    const ctl = tabs.querySelector('[data-tab="controls"]'); if (ctl) ctl.remove();
    for (const id of order) { const b = tabs.querySelector(`[data-tab="${id}"]`); if (b) { b.textContent = label[id]; tabs.appendChild(b); } }
    HOW_TABS9.length = 0; for (const id of order) if (document.getElementById('tab-' + id)) HOW_TABS9.push(id);
    const fade = () => tabs.classList.toggle('more', tabs.scrollWidth - tabs.clientWidth - tabs.scrollLeft > 4);
    tabs.addEventListener('scroll', fade, { passive: true });
    window.addEventListener('resize', fade);
    const ht = UI.howTab;
    UI.howTab = function (id, focus) {
      if (id === 'controls') id = 'basics';
      const r = ht.call(this, id, focus);
      const b = tabs.querySelector(`[data-tab="${id}"]`);
      if (b) { const l = b.offsetLeft, w = b.offsetWidth; if (l < tabs.scrollLeft || l + w > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = l - 16; }
      how.scrollTop = 0; requestAnimationFrame(fade);
      return r;
    };
    const oh = UI.openHow;
    UI.openHow = function () { const r = oh.apply(this, arguments); requestAnimationFrame(fade); return r; };
  });

  /* ---- Basics: what you are doing, how to move, then the rules in four groups */
  safe(() => {
    const panel = document.getElementById('tab-basics'), ctl = document.getElementById('tab-controls');
    const tips = panel && panel.querySelector('.tips9'); if (!tips) return;
    const GROUPS = [
      ['The run', ['Doors bite shut', 'Floors and lairs', 'It got harder']],
      ['Fighting', ['Bites show', 'Length is health']],
      ['Loot', ['Break things', 'Coins', 'Powerups stay', 'Read before you take', 'Achievements pay']],
      ['Risks', ['Downgrades', 'Curses are deals']],
    ];
    const all = [...tips.querySelectorAll('.tip9')].map((t) => ({ b: t.querySelector('b').textContent, s: t.querySelector('span').textContent }));
    const used = new Set();
    const cols = el('div', 'cols11');
    for (const [title, names] of GROUPS) {
      const list = el('div', 'list11');
      for (const n of names) { const t = all.find((x) => x.b === n); if (!t) continue; used.add(t); list.appendChild(el('div', 'row11', `<b>${esc(t.b)}</b><span>${esc(t.s)}</span>`)); }
      if (list.children.length) cols.appendChild(sec(title, list));
    }
    const rest = all.filter((t) => !used.has(t));
    if (rest.length) { const list = el('div', 'list11'); for (const t of rest) list.appendChild(el('div', 'row11', `<b>${esc(t.b)}</b><span>${esc(t.s)}</span>`)); cols.appendChild(sec('More', list)); }
    tips.replaceWith(cols);
    if (ctl) {
      const keys = ctl.querySelector('dl.keys9');
      if (keys) {
        const box = sec('Controls', keys);
        const note = ctl.querySelector('p.intro9');
        if (note) { note.style.marginTop = '8px'; note.style.fontSize = '14px'; note.style.color = 'var(--faint)'; box.appendChild(note); }
        cols.insertBefore(box, cols.firstChild);
      }
      ctl.hidden = true;
    }
  });

  /* ---- Rooms: by what they do for you */
  safe(() => {
    const panel = document.getElementById('tab-rooms');
    const ul = panel && panel.querySelector('ul.rooms9'); if (!ul) return;
    const GROUPS = [
      ['Spend and heal', ['Shop', 'BP Tankstation', 'Kapsalon', 'Slot machine', 'Spring', 'De Prikkelarme Kamer']],
      ['Free stuff, at a price', ['Treasure', 'Pantry', 'Offering', 'Cursed books', 'Vote', 'Rechtbank', 'Vault', 'Challenge', 'Secret room']],
      ['Big fights', ['Mini boss', 'Survival', 'Club', 'Hellclub', 'Portal', 'Clini-Clown HQ', 'Het Kelderspook', 'Jaude']],
    ];
    const items = [...ul.children];
    const nameOf = (li) => (li.querySelector('b') || {}).textContent || '';
    const intro = panel.querySelector('p.intro9');
    const frag = el('div', 'cols11');
    const used = new Set();
    for (const [title, names] of GROUPS) {
      const list = el('ul', 'rooms9');
      for (const n of names) { const li = items.find((x) => nameOf(x) === n); if (li) { used.add(li); list.appendChild(li); } }
      if (list.children.length) frag.appendChild(sec(title, list));
    }
    const rest = items.filter((li) => !used.has(li));
    if (rest.length) { const list = el('ul', 'rooms9'); for (const li of rest) list.appendChild(li); frag.appendChild(sec('Other rooms', list)); }
    ul.replaceWith(frag);
    if (intro) intro.textContent = 'The pillars of a doorway tell you what is behind it. The colored square is that color.';
    // traps go in a section of their own
    const h = [...panel.querySelectorAll('h3')].find((x) => /trap/i.test(x.textContent)), rules = panel.querySelector('ul.rules');
    if (h && rules) { const s = el('div', 'sec11'); h.replaceWith(s); s.appendChild(h); s.appendChild(rules); }
  });

  /* ---- Modes: a heading for the first list too */
  safe(() => {
    const panel = document.getElementById('tab-modes'); if (!panel) return;
    const ul = panel.querySelector('ul.rooms9');
    if (ul && !(ul.previousElementSibling && ul.previousElementSibling.tagName === 'H3')) {
      const s = el('div', 'sec11'); ul.replaceWith(s); s.appendChild(el('h3', null, 'Modes')); s.appendChild(ul);
    }
    const h = [...panel.querySelectorAll('h3')].find((x) => /difficulty/i.test(x.textContent)), rules = panel.querySelector('ul.rules');
    if (h && rules) { const s = el('div', 'sec11'); h.replaceWith(s); s.appendChild(h); s.appendChild(rules); }
  });

  /* ---- Snakes and characters: plain section titles */
  safe(() => {
    const panel = document.getElementById('tab-snakes'); if (!panel) return;
    const decks = panel.querySelectorAll('.cards.snakes'), hs = panel.querySelectorAll('h3');
    hs.forEach((h) => { h.style.marginTop = ''; });
    if (hs[0]) hs[0].textContent = 'Snakes';
    decks.forEach((d, i) => { const h = hs[i]; if (!h) return; const s = el('div', 'sec11'); h.replaceWith(s); s.appendChild(h); s.appendChild(d); });
    const tr = panel.querySelector('ul.rules'); if (tr) { const s = sec('Traits on harder difficulties', tr); panel.appendChild(s); }
  });
  safe(() => {
    const panel = document.getElementById('tab-chars'); if (!panel) return;
    const box = document.getElementById('howChars'); if (!box) return;
    const s = el('div', 'sec11'); box.replaceWith(s); s.appendChild(el('h3', null, 'Characters')); s.appendChild(box);
  });

  /* ---- Powerups: live counts on the section titles, a line when nothing matches */
  safe(() => {
    const panel = document.getElementById('tab-items'); if (!panel) return;
    const empty = el('p', 'empty11', 'Nothing matches. Try another word or filter.'); empty.hidden = true; panel.appendChild(empty);
    const count = () => {
      let any = 0;
      for (const id of ['itemCards', 'curseCards', 'downCards']) {
        const box = document.getElementById(id); if (!box) continue;
        const wrap = box.closest('.isec9'), h = wrap && wrap.querySelector('h3'); if (!h) continue;
        const n = [...box.children].filter((f) => !f.hidden).length;
        if (!wrap.hidden && n) any++;
        if (wrap && !wrap.hidden) wrap.hidden = n === 0;
        let c = h.querySelector('.cnt11'); if (!c) { c = el('span', 'cnt11'); h.appendChild(c); }
        c.textContent = String(n);
      }
      empty.hidden = !!any;
    };
    const fi = UI.filterItems9;
    UI.filterItems9 = function () { const r = fi.apply(this, arguments); safe(count); return r; };
    safe(count);
  });

  /* ---- Music: the tab title says what it is */
  safe(() => { const p = document.querySelector('#jukebox .intro9'); if (p) p.textContent = 'Every song in the game. Tap one to hear it, sound has to be on.'; });

  safe(() => { if (!how.hidden) UI.howTab(UI._howTab || 'basics', false); });
})();


