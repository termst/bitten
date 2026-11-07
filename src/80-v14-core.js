/* src/80-v14-core.js: v14.0 phase 1. Settings rows for Debug (T2) and Render quality (P4), the red error
   counter in the corner (T2), and the v14 strings for the texts file. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'v14'); return fb; } };
  const S = () => (Save.data.settings || (Save.data.settings = {}));

  /* every v14 line goes through the texts file */
  const LINES = ['Debug', 'A red counter in the corner: errors the game caught and kept going. For bug reports.',
    'Render quality', 'Draws the game at a lower resolution. Faster on old phones, softer to look at.',
    'Downloads do not work in this browser. Try another one.', 'errors caught', 'Full', 'Lower', 'Low', 'On', 'Off'];
  safe(() => { for (const s of LINES) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s); });
  window.T14 = (s) => sayF9(s);

  /* ---------------- T2: the counter */
  const debugOn = () => /[?&]debug\b/.test(location.search) || S().debug14 === true;
  const box = document.createElement('div');
  box.id = 'err14';
  box.setAttribute('aria-live', 'off');
  box.style.cssText = 'position:fixed;top:calc(4px + env(safe-area-inset-top,0px));right:4px;z-index:99;min-width:18px;padding:3px 6px;border-radius:2px;background:#b3182c;color:#fff;font:700 12px/1 var(--ui,sans-serif);letter-spacing:.04em;text-align:center;pointer-events:auto;cursor:help;display:none';
  document.body.appendChild(box);
  box.addEventListener('click', () => { box.title = ERR14.log.slice(-20).join('\n'); safe(() => console.table(ERR14.log)); });
  let shown = -1, hostN = 0;
  Sched.every('ui', 'v14 error counter', () => {
    const on = debugOn();
    box.style.display = on ? 'block' : 'none';
    if (!on) return;
    const n = ERR14.n + hostN;
    if (n !== shown) { shown = n; box.textContent = String(n); box.title = `${n} ${T14('errors caught')}\n` + ERR14.log.slice(-20).join('\n'); }
  });
  /* in multiplayer the host sends its count (phase 3 sets this) */
  window.__bitten = window.__bitten || {};
  window.__bitten.errHost14 = (n) => { hostN = Math.max(0, n | 0); };

  /* ---------------- settings rows: Debug in Play, Render quality in Screen */
  safe(() => {
    const sec = UI.el.settings, inner = sec && sec.querySelector('.sheet-inner'), toggles = UI.el.toggles;
    if (!inner || !toggles) return;
    const row = (tab, title, line, opts, get, set) => {
      const r = document.createElement('div'); r.className = 'row12'; r.dataset.t12 = tab;
      r.innerHTML = `<b>${T14(title)}</b><small>${T14(line)}</small>`;
      const sg = document.createElement('div'); sg.className = 'seg12'; sg.setAttribute('role', 'radiogroup');
      for (const [v, lab] of opts) {
        const b = document.createElement('button'); b.type = 'button'; b.dataset.v = String(v); b.textContent = T14(lab); b.setAttribute('role', 'radio');
        b.addEventListener('click', (e) => { e.preventDefault(); set(v); Save.store(); safe(() => { if (G.state !== 'pause') Sfx.blip(); }); paint(); });
        sg.appendChild(b);
      }
      r.appendChild(sg);
      const paint = () => { const cur = String(get()); for (const b of sg.children) { const on = b.dataset.v === cur; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); } };
      r.paint14 = paint; paint();
      toggles.appendChild(r);
      return r;
    };
    const rq = row('screen', 'Render quality', 'Draws the game at a lower resolution. Faster on old phones, softer to look at.',
      [[1, 'Full'], [0.75, 'Lower'], [0.5, 'Low']], () => renderQ14(), (v) => { S().rq14 = v; safe(() => { View.layout(); if (G.map) for (const r of G.map.rooms) r.dirty = true; }); });
    const dbg = row('play', 'Debug', 'A red counter in the corner: errors the game caught and kept going. For bug reports.',
      [[true, 'On'], [false, 'Off']], () => S().debug14 === true, (v) => { S().debug14 = v; });
    const ps0 = UI.paintSettings;
    UI.paintSettings = function () { const r = ps0.apply(this, arguments); safe(() => { rq.paint14(); dbg.paint14(); }); return r; };
  });
})();
