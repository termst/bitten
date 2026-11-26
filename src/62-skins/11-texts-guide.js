/* 62.js section 11: texts-guide. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through S62. */
(function (S62) {
  'use strict';
  const { SKINS, close, curSkin, drawOn, open, safe, setSkin, skinIdx, skinOn, step, wear } = S62;
  /* ------------------------------------------------------------------ texts and the guide */
  safe(() => {
    if (Array.isArray(TEXT_LIT9.messages)) for (const id in SKINS) for (const S of SKINS[id]) for (const s of [S.name, S.line]) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s);
  });
  safe(() => {
    const tab = document.getElementById('tab-chars'); if (!tab || tab.querySelector('.sk-guide')) return;
    const p = document.createElement('p'); p.className = 'intro9 sk-guide';
    p.textContent = `Every apple has more than one look, sorted in four categories: Original, Epic (full outfits with an aura), Grotesque (something in the game got in) and Arcade (old console filters, kill bursts in style). Tap a character on the Characters screen to open the wardrobe. Filter by category, star favourites, Shuffle for a random look, or switch on New look every run: ${Object.keys(SKINS).filter((id) => CHARS[id]).map((id) => `${CHARS[id].name} as ${SKINS[id].map((S) => S.name).join(' or ')}`).join(', ')}. Skins change the look, nothing else.`;
    tab.insertBefore(p, tab.firstChild);
  });

  Object.assign(window.__bitten || (window.__bitten = {}), { SKINS24: { SKINS, open, close, wear, step, skinOn, skinIdx, curSkin, setSkin, drawOn } });
})(window.__bitten.S62 || (window.__bitten.S62 = {}));
