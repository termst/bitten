/* src/57-v1016-chips.js: v10.16: square filter chips. From v10.16. Lines 25389 to 25408 of the v13.7 script. */
/* ===== v10.16: filter chips with square corners and a diamond marker ===== */
(function () {
  'use strict';
  const css = `
html body .filt9 button, html body .frow10 button { position: relative; border-radius: 2px; padding: 8px 12px 8px 24px; min-height: 36px;
  border: 1px solid var(--line); background: linear-gradient(180deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .008)); color: var(--muted);
  transition: color .15s, border-color .15s, background .15s, box-shadow .15s; }
html body .filt9 button::before, html body .frow10 button::before { content: ""; position: absolute; left: 10px; top: 50%; width: 5px; height: 5px; margin-top: -3px;
  border: 1px solid currentColor; transform: rotate(45deg); opacity: .5; transition: background .15s, box-shadow .15s, opacity .15s; }
html body .filt9 button:hover, html body .frow10 button:hover { color: var(--ink); border-color: rgba(236, 226, 212, .4); }
html body .filt9 button[aria-pressed="true"], html body .frow10 button[aria-pressed="true"] { color: #ffe9c4; border-color: rgba(227, 165, 74, .7);
  background: linear-gradient(180deg, rgba(227, 165, 74, .22), rgba(227, 165, 74, .05)); box-shadow: inset 0 -2px 0 var(--toffee); }
html body .filt9 button[aria-pressed="true"]::before, html body .frow10 button[aria-pressed="true"]::before { background: var(--toffee); border-color: var(--toffee); opacity: 1; box-shadow: 0 0 6px rgba(227, 165, 74, .8); }
html body #achs .filt9 button em { margin-left: 8px; padding-left: 8px; border-left: 1px solid rgba(236, 226, 212, .16); opacity: 1; color: var(--faint); font-style: normal; }
html body #achs .filt9 button[aria-pressed="true"] em { color: var(--toffee); border-left-color: rgba(227, 165, 74, .4); }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();


