/* src/54-v1012-snake-bg.js: v10.12: snake picture backgrounds. From v10.12. Lines 24156 to 24220 of the v13.7 script. */
/* ===== v10.12: every snake gets its own picture background, faded from its own colors ===== */
function snakeCols11(kind) {
  const K = (typeof KINDS !== 'undefined' && KINDS[kind]) || {};
  const ok = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
  const body = ok(K.body) ? K.body : ok(K.headCol) ? K.headCol : '#8a7a6a';
  let acc = [K.eye, K.band, K.hoodRim, K.tie, K.sac, K.seam, K.saddle, K.blood].find((v) => ok(v) && v.toLowerCase() !== '#ffffff' && v.toLowerCase() !== '#000000' && v.toLowerCase() !== '#111111');
  if (!acc) acc = ok(K.blood) ? K.blood : body;
  const c = hexRgb(body), lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  return { body, acc, boss: !!K.boss, lum };
}
function bestiaryBg11(c, w, h, kinds) {
  try {
    const cols = kinds.map(snakeCols11);
    c.fillStyle = '#100b09'; c.fillRect(0, 0, w, h);
    const R = Math.max(w, h);
    // the body color, glowing out from where the head sits; two kinds share the frame
    cols.forEach((k, i) => {
      const cx = cols.length > 1 ? w * (i ? 0.72 : 0.3) : w * 0.62, cy = h * 0.5;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75);
      const ga = (k.boss ? 0.56 : 0.5) - 0.26 * k.lum;
      g.addColorStop(0, rgba(k.body, ga)); g.addColorStop(0.55, rgba(k.body, ga * 0.3)); g.addColorStop(1, rgba(k.body, 0));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
    // the twist: a soft band of the accent color curling across the frame
    const a = cols[0].acc;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const lw = h * (0.34 - i * 0.1), al = 0.11 + i * 0.05;
      const lg = c.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, rgba(a, 0)); lg.addColorStop(0.45, rgba(a, al)); lg.addColorStop(1, rgba(a, 0));
      c.strokeStyle = lg; c.lineWidth = lw;
      c.beginPath(); c.moveTo(-w * 0.1, h * 0.95); c.bezierCurveTo(w * 0.3, h * 0.2, w * 0.62, h * 1.1, w * 1.1, h * 0.12); c.stroke();
    }
    c.restore();
    // fade to dark at the edges, so the frame melts into the card
    const v = c.createRadialGradient(w * 0.55, h * 0.5, R * 0.25, w * 0.55, h * 0.5, R * 0.72);
    v.addColorStop(0, 'rgba(12,8,7,0)'); v.addColorStop(1, 'rgba(12,8,7,0.82)');
    c.fillStyle = v; c.fillRect(0, 0, w, h);
  } catch (e) { c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h); }
}
(function () {
  'use strict';
  const css = `
#how .how11 .cards.snakes figure { background: linear-gradient(90deg, var(--tint11, rgba(255,255,255,.02)) 0%, rgba(255,255,255,.015) 55%); border-color: var(--edge11, var(--line)); }
#how .how11 .cards.snakes canvas { box-shadow: 0 0 0 1px var(--edge11, transparent); }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  // each card takes a whisper of its snake's color
  const tint = () => {
    for (const cv of document.querySelectorAll('#tab-snakes canvas[data-snake]')) {
      const f = cv.closest('figure'); if (!f || f.dataset.t11) continue;
      const k = snakeCols11(cv.dataset.snake.split(',')[0]);
      f.style.setProperty('--tint11', rgba(k.body, 0.13 - 0.06 * k.lum));
      f.style.setProperty('--edge11', rgba(k.body, 0.36 - 0.2 * k.lum));
      f.dataset.t11 = '1';
    }
  };
  try { tint(); } catch (e) { console.error(e); }
  const ht = UI.howTab;
  UI.howTab = function (id) { const r = ht.apply(this, arguments); if (id === 'snakes') try { tint(); } catch (e) { /* ignore */ } return r; };
})();


