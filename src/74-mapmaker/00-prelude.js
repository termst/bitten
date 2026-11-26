/* 74.js section 00: prelude. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
/* src/74-v123-mapmaker.js: v12.3 to v12.6: Map Maker. From v12.3 to v12.6. Lines 34366 to 39286 of the v13.7 script. */
/* =====================================================================
   Bitten v12.3: Map Maker. Build your own dungeon floor by floor and room
   by room: paint every tile, drop snakes, traps and loot, set the rules,
   test it, and share the whole map as one line of text.
   New map pieces, usable anywhere in a map: teleporters, jump pads, speed
   strips, bumpers, fire bars, saw blades, spitter totems, powder kegs,
   snake nests, levers and gates, signs, pedestals, exit hatches, acid,
   weak floor, spike traps, keys and coin piles.
   ===================================================================== */
(function (M74) {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe74'); if (window.console) console.warn('v12.3', e); return fb; } }; M74.safe = safe;
  const $ = (id) => document.getElementById(id); M74.$ = $;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); M74.esc = esc;
  const S9 = (s) => (typeof say9 === 'function' ? say9(s) : s); M74.S9 = S9;
  const SF = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s); M74.SF = SF;
  const FONT = typeof UIF !== 'undefined' ? UIF : '"Barlow Condensed", "Arial Narrow", sans-serif'; M74.FONT = FONT;
  const MK = window.__bitten.MK123 = {}; M74.MK = MK;

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
