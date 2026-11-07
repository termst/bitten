/* src/75-v13-clash-guide.js: v13: clash tags in the guide, texts file and test hooks. From v13.0. Lines 39287 to 39448 of the v13.7 script. */
/* =====================================================================
   v13: clash tags in the guide, the texts file and the test hooks
   ===================================================================== */
(() => {
  const safe13 = (fn) => { try { return fn(); } catch (e) { try { console.error('v13', e); } catch (e2) { /* ignore */ } } };
  ensureClash13();

  /* ---- one color per family of tags, so a card reads at a glance ---- */
  const FAM = {
    hot: ['fire', 'burn', 'smoke'], cold: ['ice', 'slow'], rot: ['rot', 'poison', 'stack', 'goo', 'sticky', 'mark'],
    speed: ['pace', 'go', 'still', 'timed'], seed: ['path', 'huge', 'tiny', 'heavy', 'pierce', 'pierceshot', 'burst', 'carry', 'trick', 'chain', 'bounce', 'phase', 'dig', 'homing', 'multishot', 'extras', 'counted', 'charge', 'rings', 'candy', 'random', 'colors', 'swing'],
    guard: ['shield', 'shell', 'second', 'dodge', 'raingear', 'umbrella', 'panic', 'biteback', 'heal', 'rest', 'hunger', 'lowhp', 'fullhp'],
    noise: ['bell', 'loud', 'quiet', 'honk', 'flash', 'show', 'feed', 'party', 'wind'],
    room: ['blast', 'killblast', 'deathblast', 'counter', 'peck', 'helper', 'gunners', 'back', 'mirror', 'sky'],
  };
  const COL = { hot: '#ff8a4a', cold: '#8fd4ff', rot: '#b8c45a', speed: '#ffd166', seed: '#e8c9a0', guard: '#9fe0b0', noise: '#e59cff', room: '#ff9aa8', misc: '#c8b8a8' };
  const famOf = (t) => { for (const f in FAM) if (FAM[f].includes(t)) return f; return 'misc'; };
  const label = (t) => CLASH_LABEL13[t] || (CLASH_LIMIT13[t] ? CLASH_LIMIT13[t].name : t.charAt(0).toUpperCase() + t.slice(1));
  const ruleText = (t) => {
    const out = [];
    const r = CLASH_LIMIT13[t]; if (r) out.push(r.max === 1 ? `One at a time. ${r.why}` : `At most ${r.max}. ${r.why}`);
    for (const x of CLASH_CROSS13) if (x.a === t || x.b === t) out.push(`Not with ${label(x.a === t ? x.b : x.a)}. ${x.why}`);
    return out.join(' ');
  };

  const css = document.createElement('style');
  css.textContent = `
  .tg13 { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .tg13 i { font: 600 10px/1 var(--ui); font-style: normal; letter-spacing: .12em; text-transform: uppercase; padding: 3px 6px 3px 5px; border-radius: 2px;
    border: 1px solid currentColor; border-left-width: 3px; background: rgba(0,0,0,.25); opacity: .9; }
  .tf13 { display: flex; flex-direction: column; gap: 6px; }
  .tf13 .tf13h { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .tf13 .tf13h b { font: 600 12px/1 var(--ui); letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
  .tf13 .tf13h button { all: unset; cursor: pointer; font: 600 12px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--faint); padding: 4px 2px; }
  .tf13 .tf13h button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .tf13row { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; -webkit-overflow-scrolling: touch; }
  .tf13row button { all: unset; box-sizing: border-box; flex: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 0 10px 0 8px;
    border: 1px solid var(--line); border-left: 3px solid var(--c, var(--line)); border-radius: 2px; font: 600 12px/1 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); background: rgba(255,255,255,.02); }
  .tf13row button small { font: 600 11px/1 var(--ui); color: var(--faint); letter-spacing: .04em; }
  .tf13row button[aria-pressed="true"] { color: #16100d; background: var(--c); border-color: var(--c); }
  .tf13row button[aria-pressed="true"] small { color: rgba(22,16,13,.7); }
  .tf13row button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .tf13note { margin: 0; font-size: 14px; line-height: 1.35; color: var(--muted); border-left: 3px solid var(--c, var(--line)); padding: 6px 10px; background: rgba(255,255,255,.02); }
  .tf13note[hidden] { display: none !important; }
  #itemCards figure.tg13off { display: none !important; }
  `;
  document.body.appendChild(css);

  /* ---- chips on every powerup card ---- */
  const bic0 = UI.buildItemCards;
  UI.buildItemCards = function () {
    bic0.apply(this, arguments);
    safe13(() => {
      ensureClash13();
      const box = this.el && this.el.itemCards; if (!box) return;
      for (const f of box.children) {
        const tags = clashChips13(f.dataset.id);
        f.dataset.tags = tags.join(' ');
        if (!tags.length) continue;
        const row = document.createElement('span'); row.className = 'tg13';
        for (const t of tags) { const i = document.createElement('i'); i.textContent = label(t); i.style.color = COL[famOf(t)]; i.title = ruleText(t); row.appendChild(i); }
        const cap = f.querySelector('figcaption'); if (!cap) continue;
        const cl = cap.querySelector('.cl10'); cap.insertBefore(row, cl || null);
      }
      buildFilter();
      applyTag();
    });
  };

  /* ---- the tag filter under the search box ---- */
  let cur = '';
  function buildFilter() {
    const search = document.getElementById('howSearch'); if (!search) return;
    let wrap = document.getElementById('tagFilt13');
    if (!wrap) {
      wrap = document.createElement('div'); wrap.id = 'tagFilt13'; wrap.className = 'tf13';
      wrap.innerHTML = '<div class="tf13h"><b>Clash tags</b><button type="button" data-clear>Show all</button></div><div class="tf13row" role="group" aria-label="Clash tags"></div><p class="tf13note" hidden></p>';
      search.insertAdjacentElement('afterend', wrap);
      wrap.addEventListener('click', (e) => {
        if (e.target.closest('[data-clear]')) { cur = ''; applyTag(); return; }
        const b = e.target.closest('[data-t]'); if (!b) return;
        cur = cur === b.dataset.t ? '' : b.dataset.t; applyTag();
      });
    }
    const count = {};
    for (const id of ITEM_IDS) if (ITEMS[id]) for (const t of clashChips13(id)) count[t] = (count[t] || 0) + 1;
    const fams = Object.keys(COL);
    const tags = Object.keys(count).sort((a, b) => fams.indexOf(famOf(a)) - fams.indexOf(famOf(b)) || count[b] - count[a] || label(a).localeCompare(label(b)));
    const row = wrap.querySelector('.tf13row'); row.innerHTML = '';
    for (const t of tags) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.t = t; b.style.setProperty('--c', COL[famOf(t)]);
      b.innerHTML = `<span></span><small>${count[t]}</small>`; b.firstChild.textContent = label(t);
      row.appendChild(b);
    }
  }
  function applyTag() {
    const wrap = document.getElementById('tagFilt13'), box = UI.el && UI.el.itemCards;
    if (wrap) {
      for (const b of wrap.querySelectorAll('[data-t]')) b.setAttribute('aria-pressed', b.dataset.t === cur ? 'true' : 'false');
      const on = wrap.querySelector(`[data-t="${cur}"]`), row = wrap.querySelector('.tf13row');
      if (on && row) row.scrollLeft = Math.max(0, on.offsetLeft - row.offsetLeft - 8);
      const note = wrap.querySelector('.tf13note');
      if (note) { note.hidden = !cur; note.textContent = cur ? `${label(cur)}: ${ruleText(cur)}` : ''; note.style.setProperty('--c', cur ? COL[famOf(cur)] : ''); }
      const clr = wrap.querySelector('[data-clear]'); if (clr) clr.hidden = !cur;
    }
    if (box) for (const f of box.children) f.classList.toggle('tg13off', !!cur && !(f.dataset.tags || '').split(' ').includes(cur));
  }

  /* ---- the info card next to a powerup on the floor says why ---- */
  const if0 = infoFor;
  infoFor = function (p) {
    const o = if0(p);
    safe13(() => {
      const P = G.player;
      if (!o || !p || p.kind !== 'item' || !P || !o.notes) return;
      const cl = clashOf10(p.id, P); if (!cl || cl.hard) return;
      for (const n of o.notes) if (Array.isArray(n) && typeof n[0] === 'string' && n[0].startsWith('Clashes with ')) n[0] = `Clashes with ${clashNames10(cl.ids)}. ${cl.why} Stand on it to swap.`;
    });
    return o;
  };

  /* ---- texts file: the reasons and names can be edited like everything else ---- */
  safe13(() => {
    const tc0 = Texts.collect;
    Texts.collect = function () {
      const o = tc0.apply(this, arguments);
      safe13(() => {
        o.clash_limits = {}; for (const t in CLASH_LIMIT13) o.clash_limits[t] = { name: CLASH_LIMIT13[t].name, why: CLASH_LIMIT13[t].why, label: label(t) };
        o.clash_crosses = CLASH_CROSS13.map((x) => ({ tags: x.a + ' + ' + x.b, name: x.name, why: x.why }));
      });
      return o;
    };
    const ta0 = Texts.apply;
    Texts.apply = function (o) {
      const r = ta0.apply(this, arguments);
      safe13(() => {
        if (o && o.clash_limits) for (const t in o.clash_limits) {
          const v = o.clash_limits[t], R = CLASH_LIMIT13[t]; if (!R || !v || typeof v !== 'object') continue;
          if (typeof v.name === 'string' && v.name.trim()) R.name = v.name.trim();
          if (typeof v.why === 'string' && v.why.trim()) R.why = v.why.trim();
          if (typeof v.label === 'string' && v.label.trim()) CLASH_LABEL13[t] = v.label.trim();
        }
        if (o && Array.isArray(o.clash_crosses)) for (const v of o.clash_crosses) {
          if (!v || typeof v.tags !== 'string') continue;
          const [a, b] = v.tags.split('+').map((x) => x.trim());
          const X = CLASH_CROSS13.find((x) => x.a === a && x.b === b); if (!X) continue;
          if (typeof v.name === 'string' && v.name.trim()) X.name = v.name.trim();
          if (typeof v.why === 'string' && v.why.trim()) X.why = v.why.trim();
        }
        clashVer13++; ensureClash13();
      });
      return r;
    };
  });

  safe13(() => UI.buildItemCards());
  safe13(() => { if (UI.filterItems9) UI.filterItems9(); });
  window.__bitten = window.__bitten || {};
  Object.assign(window.__bitten, { CLASH_TAGS13, CLASH_LIMIT13, CLASH_CROSS13, CLASH_LABEL13, CHAR_CLASH10, tagClash13, clashTags13, buildClash13, ensureClash13, clashLine10 });
})();


