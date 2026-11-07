/* src/56-v1015-basics.js: v10.15: Basics, character frames, achievements page. From v10.15. Lines 24589 to 25388 of the v13.7 script. */
/* ===== v10.15: Basics as plain rules, a frame for every character, the achievements page rebuilt ===== */
(function () {
  'use strict';
  const safe = (fn) => { try { return fn(); } catch (e) { console.error(e); return undefined; } };
  const say = (s) => { try { return typeof sayF9 === 'function' ? sayF9(s) : s; } catch (e) { return s; } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const lumOf = (hex) => { const c = hexRgb(hex); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; };
  const pct = (v) => `${Math.round(v * 100)}%`;

  /* the shared look: a glow of the main color, a curl of the accent, dark edges */
  function fade15(c, w, h, body, acc, o) {
    o = o || {};
    const R = Math.max(w, h), lum = lumOf(body);
    c.fillStyle = '#100b09'; c.fillRect(0, 0, w, h);
    const cx = w * (o.cx != null ? o.cx : 0.5), cy = h * (o.cy != null ? o.cy : 0.5);
    const ga = (o.glow != null ? o.glow : 0.5) - 0.26 * lum;
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75);
    g.addColorStop(0, rgba(body, ga)); g.addColorStop(0.55, rgba(body, ga * 0.3)); g.addColorStop(1, rgba(body, 0));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (o.twist !== false) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const lw = h * (0.34 - i * 0.1), al = (o.twistA || 1) * (0.1 + i * 0.05);
        const lg = c.createLinearGradient(0, 0, w, 0);
        lg.addColorStop(0, rgba(acc, 0)); lg.addColorStop(0.5, rgba(acc, al)); lg.addColorStop(1, rgba(acc, 0));
        c.strokeStyle = lg; c.lineWidth = lw;
        c.beginPath(); c.moveTo(-w * 0.1, h * 0.1); c.bezierCurveTo(w * 0.35, h * 0.95, w * 0.6, -h * 0.1, w * 1.1, h * 0.85); c.stroke();
      }
      c.restore();
    }
    const v = c.createRadialGradient(cx, cy, R * 0.25, cx, cy, R * 0.72);
    v.addColorStop(0, 'rgba(12,8,7,0)'); v.addColorStop(1, 'rgba(12,8,7,0.82)');
    c.fillStyle = v; c.fillRect(0, 0, w, h);
  }

  const css = `
/* ---------- Basics ---------- */
#how .how11 #tab-basics.b15 { gap: 18px; }
#how .b15 .lead15 { margin: 0; font-size: 16px; line-height: 1.4; color: var(--ink); max-width: 62ch; }
#how .kn15 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
#how .kn15 > div { position: relative; overflow: hidden; border: 1px solid rgba(232, 58, 80, .28); border-radius: 4px; padding: 10px 10px 9px;
  background: radial-gradient(120% 140% at 0% 0%, rgba(215, 38, 61, .2), rgba(215, 38, 61, .03) 60%, rgba(255, 255, 255, .015)); min-width: 0; }
#how .kn15 b { display: block; font: 800 30px/1 var(--display); color: #fff4ec; }
#how .kn15 span { display: block; margin-top: 4px; font: 600 11.5px/1.2 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
#how .b15 .g15 h3 { display: flex; align-items: center; gap: 8px; color: var(--acc15, var(--apple-hi)); }
#how .b15 .g15 h3 i { width: 8px; height: 8px; border-radius: 2px; background: var(--acc15, var(--apple-hi)); box-shadow: 0 0 10px var(--acc15, var(--apple-hi)); flex: none; }
#how .b15 .g15 .list11 { border-color: var(--edge15, var(--line)); background: linear-gradient(90deg, var(--tint15, rgba(255,255,255,.02)), rgba(255, 255, 255, .015) 60%); }
#how .r15 { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; padding: 9px 12px; align-items: baseline; }
#how .r15 > b { font: 700 12px/1.25 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--acc15, var(--ink)); }
#how .r15 > span { font-size: 15px; line-height: 1.36; color: var(--muted); min-width: 0; }
#how .r15 > span b { color: var(--ink); font-weight: 700; }
#how .wide15 { grid-column: 1 / -1; }
#how .b15 > .cols11 { display: block; columns: 2 320px; column-gap: 20px; }
#how .b15 > .cols11 > * { break-inside: avoid; margin-bottom: 20px; }
#how .b15 > .cols11 > .wide15 { column-span: all; }
#how .dt15 { border: 1px solid var(--edge15, var(--line)); border-radius: 4px; overflow: hidden; background: linear-gradient(90deg, var(--tint15, rgba(255,255,255,.02)), rgba(255, 255, 255, .015) 60%); }
#how .dt15 > div { display: grid; grid-template-columns: minmax(84px, 1.25fr) repeat(4, minmax(0, 1fr)); border-top: 1px solid rgba(236, 226, 212, .08); }
#how .dt15 > div:first-child { border-top: 0; background: rgba(255, 255, 255, .03); }
#how .dt15 > div > * { padding: 8px 8px; font-size: 14px; line-height: 1.25; color: var(--muted); min-width: 0; overflow-wrap: anywhere; }
#how .dt15 > div > :first-child { font: 700 11.5px/1.25 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--acc15); padding-left: 12px; }
#how .dt15 > div:first-child > * { font: 700 12px/1.2 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink); }
#how .dt15 > div > .hi15 { color: var(--ink); }
#how .note15 { margin: 8px 0 0; font-size: 14px; color: var(--faint); }
@media (max-width: 420px) {
  #how .kn15 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  #how .r15 { grid-template-columns: 84px minmax(0, 1fr); gap: 10px; }
  #how .dt15 > div > * { padding: 7px 5px; font-size: 13px; }
  #how .dt15 > div > :first-child { padding-left: 10px; font-size: 10.5px; letter-spacing: .08em; }
  #how .dt15 > div:first-child > * { font-size: 10.5px; letter-spacing: .06em; }
}

/* ---------- characters ---------- */
#how .how11 .cards.chars figure { background: linear-gradient(90deg, var(--tint15, rgba(255,255,255,.02)) 0%, rgba(255, 255, 255, .015) 60%); border-color: var(--edge15, var(--line)); }
#how .how11 .cards.chars canvas { box-shadow: 0 0 0 1px var(--edge15, transparent); }
#how .how11 .cards.chars .perk9 { color: var(--acc15, var(--toffee)); }
.ccard[style*="--tint15"] { background-image: linear-gradient(165deg, var(--tint15), rgba(255, 255, 255, 0) 62%); }
.ccard[style*="--edge15"]:not(.on) { border-color: var(--edge15); }
.ccard[style*="--edge15"] canvas { box-shadow: 0 0 0 1px var(--edge15); }

/* ---------- achievements ---------- */
#achs.sheet { padding-top: 0; overflow-x: hidden; }
#achs .ach15 { gap: 18px; padding-bottom: 32px; min-width: 0; }
#achs .ach15 > .sheet-head { position: sticky; top: 0; z-index: 3; display: flex; flex-direction: column; align-items: stretch; flex-wrap: nowrap; gap: 10px; min-width: 0;
  margin: 0 calc(-1 * max(16px, env(safe-area-inset-left, 0px))); padding: calc(14px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-left, 0px)) 0;
  background: rgba(9, 6, 6, .985); border-bottom: 1px solid var(--line); }
#achs .head15 { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
#achs .head15 h2 { font-size: clamp(32px, 8vw, 46px); }
#achs .head15 .btn { min-height: 40px; padding: 0 16px; font-size: 14px; }
#achs .prog15 { display: flex; align-items: center; gap: 12px; }
#achs .prog15 .bar15 { flex: 1; height: 6px; border-radius: 3px; background: rgba(236, 226, 212, .1); overflow: hidden; }
#achs .prog15 .bar15 i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--apple), var(--toffee)); border-radius: 3px; transition: width .4s ease; }
#achs .prog15 #achCount { margin: 0; font: 600 13px/1 var(--ui); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
#achs .tabs9.atab15 { position: static; display: flex; flex-wrap: nowrap; gap: 4px; overflow-x: auto; scrollbar-width: none; border: 0; background: none; padding: 0 0 10px; margin: 0; width: 100%; min-width: 0; }
#achs .tabs9.atab15::-webkit-scrollbar { display: none; }
#achs .tabs9.atab15 button { flex: none; min-height: 36px; padding: 8px 12px; font-size: 14px; letter-spacing: .12em; }
#achs .ap15 { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
#achs .ap15 h3 { margin: 0 0 8px; }
#achs .sec15 { display: flex; flex-direction: column; min-width: 0; }
#achs .filt9 { gap: 6px; }
#achs .filt9 + .filt9 { margin-top: 6px; }
#achs .filt9 button em { font-style: normal; opacity: .7; margin-left: 6px; letter-spacing: .06em; }
#achs .alist15 { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 6px; align-items: start; }
#achs .ac15 { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 12px; align-items: start; padding: 10px 12px 10px 10px; min-width: 0;
  border: 1px solid var(--edge15, var(--line)); border-radius: 4px; background: linear-gradient(90deg, var(--tint15, rgba(255,255,255,.02)) 0%, rgba(255, 255, 255, .012) 62%); }
#achs .ac15 canvas.bd15 { width: 48px; height: 48px; border-radius: 3px; display: block; }
#achs .ac15 .tx15 { display: flex; flex-direction: column; min-width: 0; }
#achs .ac15 .n15 { font: 700 17px/1.12 var(--ui); letter-spacing: .03em; color: var(--ink); overflow-wrap: anywhere; }
#achs .ac15:not(.done) .n15 { color: #d6c9bb; }
#achs .ac15 .d15 { margin-top: 2px; font-size: 14px; line-height: 1.3; color: var(--muted); }
#achs .pg15 { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
#achs .pg15 i { flex: 1; height: 4px; background: rgba(236, 226, 212, .1); border-radius: 2px; overflow: hidden; }
#achs .pg15 i s { display: block; height: 100%; background: var(--acc15); border-radius: 2px; text-decoration: none; }
#achs .pg15 em { font: 600 12px/1 var(--ui); letter-spacing: .08em; color: var(--muted); font-style: normal; white-space: nowrap; }
#achs .rw15 { display: flex; align-items: center; gap: 6px; margin-top: 7px; font: 600 12.5px/1.2 var(--ui); letter-spacing: .05em; color: #b8966a; min-width: 0; }
#achs .rw15 canvas { width: 18px; height: 18px; flex: none; display: block; }
#achs .rw15 span { min-width: 0; overflow-wrap: anywhere; }
#achs .ac15.done .rw15 { color: var(--toffee); }
#achs .ac15.done { box-shadow: inset 0 0 0 1px rgba(240, 192, 64, .1); }
#achs .gh15 { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; }
#achs .gh15 h4 { margin: 0; font: 600 13px/1 var(--ui); letter-spacing: .3em; text-transform: uppercase; color: var(--acc15); white-space: nowrap; }
#achs .gh15 .gb15 { flex: 1; height: 3px; border-radius: 2px; background: rgba(236, 226, 212, .08); overflow: hidden; }
#achs .gh15 .gb15 i { display: block; height: 100%; background: var(--acc15); opacity: .8; }
#achs .gh15 span { font: 600 12px/1 var(--ui); letter-spacing: .12em; color: var(--faint); white-space: nowrap; }
#achs .empty15 { margin: 0; font-size: 15px; color: var(--faint); }
#achs .tiles15 { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
#achs .tiles15 > div { border: 1px solid var(--line); border-radius: 4px; padding: 10px 12px; background: radial-gradient(120% 140% at 0% 0%, rgba(227, 165, 74, .12), rgba(255, 255, 255, .015) 65%); min-width: 0; }
#achs .tiles15 b { display: block; font: 800 26px/1 var(--display); color: #fff4ec; }
#achs .tiles15 span { display: block; margin-top: 5px; font: 600 11.5px/1.2 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
#achs .bgrid15 { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
#achs .bt15 { border: 1px solid var(--line); border-radius: 4px; padding: 6px; display: flex; flex-direction: column; gap: 6px; background: rgba(255, 255, 255, .02); min-width: 0; }
#achs .bt15 canvas { width: 100%; height: 64px; display: block; border-radius: 3px; }
#achs .bt15:not(.on) canvas { filter: grayscale(1) brightness(.24); }
#achs .bt15 b { font: 700 15px/1.15 var(--ui); letter-spacing: .03em; color: var(--ink); padding: 0 4px; overflow-wrap: anywhere; }
#achs .bt15:not(.on) b { color: var(--faint); }
#achs .bt15 span { font: 600 11.5px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--faint); padding: 0 4px 2px; }
#achs .bt15.on { border-color: rgba(240, 192, 64, .32); }
#achs .bt15.on span { color: var(--toffee); }
#achs .hunt15 { border: 1px solid var(--line); border-radius: 4px; overflow: hidden; background: rgba(255, 255, 255, .02); }
#achs .hunt15 > div { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 6px 12px 6px 6px; border-top: 1px solid rgba(236, 226, 212, .08); }
#achs .hunt15 > div:first-child { border-top: 0; }
#achs .hunt15 canvas { width: 64px; height: 38px; border-radius: 3px; display: block; }
#achs .hunt15 b { font: 700 15px/1.1 var(--ui); color: var(--ink); }
#achs .hunt15 i { display: block; height: 3px; margin-top: 5px; border-radius: 2px; background: var(--apple-hi); opacity: .75; }
#achs .hunt15 em { font: 700 16px/1 var(--ui); font-style: normal; color: var(--toffee); }
#achs .sgrid15 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
#achs .sgrid15 h4 { margin: 0 0 6px; font: 600 12px/1 var(--ui); letter-spacing: .26em; text-transform: uppercase; color: var(--muted); }
#achs .sl15 { margin: 0; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; background: rgba(255, 255, 255, .02); }
#achs .sl15 > div { display: flex; justify-content: space-between; gap: 12px; padding: 7px 12px; border-top: 1px solid rgba(236, 226, 212, .08); }
#achs .sl15 > div:first-child { border-top: 0; }
#achs .sl15 dt { font-size: 14.5px; color: var(--muted); }
#achs .sl15 dd { margin: 0; font: 700 15px/1.2 var(--ui); color: var(--ink); }
#achs .sl15 > .z15 dt, #achs .sl15 > .z15 dd { color: var(--faint); font-weight: 500; }
#achs .esc15 { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
#achs .esc15 > div { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: center; border: 1px solid var(--line); border-radius: 4px; padding: 6px 10px 6px 6px; background: rgba(255, 255, 255, .02); }
#achs .esc15 canvas { width: 34px; height: 34px; display: block; }
#achs .esc15 b { display: block; font: 700 14.5px/1.1 var(--ui); color: var(--ink); overflow-wrap: anywhere; }
#achs .esc15 span { display: block; margin-top: 3px; font: 600 11px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
#achs .esc15 > .on { border-color: rgba(240, 192, 64, .32); }
#achs .esc15 > .on span { color: var(--toffee); }
#achs .esc15 > :not(.on) canvas { opacity: .45; }
#achs .cdet15 { position: sticky; z-index: 2; top: 140px; margin: 0 0 10px; min-height: 92px; padding: 12px 14px; display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 14px; align-items: center; overflow: hidden;
  border: 1px solid var(--icB, var(--line)); border-radius: 4px; background: #100b09; font-size: 14.5px; line-height: 1.35; color: #d8ccbe; box-shadow: 0 8px 24px rgba(0, 0, 0, .5), 0 0 22px var(--icA, transparent); transition: border-color .2s, box-shadow .2s; }
#achs .cdet15.idle { grid-template-columns: minmax(0, 1fr); min-height: 44px; background: rgba(16, 11, 9, .96); color: var(--muted); }
#achs .cdet15.idle canvas { display: none; }
#achs .cdet15 .cbg15 { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
#achs .cdet15 .cic15 { position: relative; z-index: 1; width: 64px; height: 64px; filter: drop-shadow(0 0 12px var(--icA, transparent)); }
#achs .cdet15 p { position: relative; z-index: 1; margin: 0; min-width: 0; text-shadow: 0 1px 2px rgba(0, 0, 0, .8); }
#achs .cdet15 b { color: #fff4ec; font-size: 17px; letter-spacing: .02em; }
#achs .cdet15 .lg15 { margin-left: 6px; font: 700 11px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--toffee); }
#achs .cgrid15 { display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr)); gap: 6px; }
#achs .cgrid15 button { all: unset; box-sizing: border-box; cursor: pointer; aspect-ratio: 1; border: 1px solid var(--line); border-radius: 3px; display: grid; place-items: center; background: rgba(255, 255, 255, .02); }
#achs .cgrid15 button.got { border-color: rgba(236, 226, 212, .3); background: radial-gradient(circle, rgba(227, 165, 74, .14), rgba(255, 255, 255, .02) 70%); }
#achs .cgrid15 button.rare.got { border-color: rgba(240, 192, 64, .7); box-shadow: inset 0 0 10px rgba(240, 192, 64, .2); }
#achs .cgrid15 button { transition: transform .15s, box-shadow .2s, border-color .2s; }
#achs .cgrid15 button[aria-pressed="true"] { border-color: var(--icB, var(--ink)); background: radial-gradient(circle at 50% 45%, var(--icA, rgba(227, 165, 74, .3)), rgba(16, 11, 9, .92) 78%); box-shadow: 0 0 16px var(--icA, transparent), inset 0 0 0 1px var(--icB, transparent); transform: translateY(-1px) scale(1.06); }
#achs .cgrid15 button:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }
#achs .cgrid15 canvas { width: 34px; height: 34px; display: block; }
#achs .savehint { margin: 0; }
@media (orientation: landscape) and (max-height: 560px) {
  #achs .ach15 > .sheet-head { padding-top: 8px; gap: 6px; }
  #achs .head15 h2 { font-size: 30px; }
}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* =====================================================================
     1. Basics: the rules, short
     ===================================================================== */
  const RULES15 = [
    ['Health', '#e83a50', [
      ['Apples', 'Your health. The Apple starts with <b>3</b>, other characters differ. Easy adds <b>1</b>. At most <b>8</b>.'],
      ['Bites', 'A bite takes <b>half an apple</b>. On Nightmare or with Glass Cannon, a <b>whole apple</b>.'],
      ['Safe time', 'After a bite you blink for about <b>1 second</b>. Nothing can bite you then.'],
      ['Healing', 'Slices heal half or a whole apple. A spring heals <b>2</b>. A shop apple costs <b>6</b> coins.'],
      ['Death', 'Out of apples ends the run. Phoenix Seed brings you back <b>once</b>.'],
    ]],
    ['Fighting', '#e3a54a', [
      ['Locked', 'Doors stay shut until every snake in the room is dead.'],
      ['Snakes', 'Length is health. Every hit makes a snake shorter. Short means almost dead.'],
      ['Gold worms', '<b>Twice</b> the health and a bit faster. Always drop a slice and <b>2</b> coins.'],
      ['Twists', 'A label shows when you walk in: dark, swarm, gold worm, spikes, freezer, crumbling floor, roots, lasers or black ice.'],
      ['Rage worms', 'Too much noise, too much time or too many curses calls one. They grow while they stay angry.'],
    ]],
    ['Floors', '#3aa89a', [
      ['Arcade', '<b>5</b> floors of <b>8 to 11</b> rooms. Every floor is tougher than the one above.'],
      ['Lairs', 'Every floor ends in a boss lair. Beat it, drop into the hole. The boss takes your oldest downgrade with it.'],
      ['Rare floors', 'After floor 1, any floor can be a rare one with its own boss.'],
      ['Doorways', 'The pillars show which room is behind a door. The Rooms tab lists them.'],
      ['Secrets', 'One cracked wall per floor: shoot it open. From floor 2, a vault. Its key hides in something breakable.'],
      ['Pots, eggs', 'Slices and coins inside. One per floor hides a gift. Some eggs hatch. A rotten pot lets out a spore: one seed pops it.'],
    ]],
    ['Powerups', '#f0c040', [
      ['They stay', 'Every powerup lasts the whole run. You never get the same one twice.'],
      ['Legendary', 'Gold frame. Rare, and a lot stronger.'],
      ['Info card', 'Stand next to anything you can take. A card shows what it does and what it costs.'],
      ['Clashes', 'Some powerups do not go together. Stand on a clashing one for about a second to swap. The old one drops.'],
      ['Selling', 'The till at the BP Tankstation buys powerups back.'],
      ['Rewards', 'Every achievement drops a powerup. Many add new powerups to the pool.'],
    ]],
    ['Rot and curses', '#b07ad0', [
      ['Downgrades', 'Bitten in a room? The rot may follow you out: <b>5%</b> plus <b>4.5%</b> per bite, <b>32%</b> at most. Less on floor 1. Up to <b>6</b> at once.'],
      ['Curses', 'A deal: a big plus and a minus. From offerings, cursed books, votes and the court.'],
      ['Washing', 'Spring: every downgrade. Apple Wash: your oldest downgrade, or with none, your newest curse. Bosses: your oldest downgrade.'],
    ]],
    ['Coins', '#f2c230', [
      ['Where', 'Most snakes drop one about <b>1 in 3</b> times. Gold worms, pots, vaults and slot machines pay too. Coins last one run.'],
      ['Prices', 'Powerup <b>15</b>. Legendary <b>35</b>. Apple <b>6</b>. Haircut <b>8</b>. Slot pull <b>3</b>. Pumps <b>20 to 40</b>.'],
      ['Changers', 'Bonus Card: a third off. Greedy Peel: half again as much.'],
    ]],
    ['Saving', '#a69688', [
      ['Auto', 'Stats, achievements, unlocks and settings save on their own.'],
      ['Backup', 'Settings has your save code and a save file.'],
    ]],
  ];
  const TILES15 = [['½', 'apple per bite'], ['1s', 'safe after a bite'], ['5', 'floors in Arcade'], ['8', 'apples at most']];

  function tintVars(body, a, e) {
    const l = lumOf(body);
    return `--acc15:${body};--tint15:${rgba(body, (a || 0.12) - 0.05 * l)};--edge15:${rgba(body, (e || 0.3) - 0.14 * l)}`;
  }
  function ruleGroup(title, col, rows, wide) {
    const s = el('div', 'sec11 g15' + (wide ? ' wide15' : ''));
    s.setAttribute('style', tintVars(col));
    s.appendChild(el('h3', null, `<i aria-hidden="true"></i>${esc(say(title))}`));
    const list = el('div', 'list11');
    for (const [k, v] of rows) list.appendChild(el('div', 'r15', `<b>${esc(say(k))}</b><span>${v}</span>`));
    s.appendChild(list);
    return s;
  }
  function diffTable() {
    const ids = ['easy', 'normal', 'hard', 'nightmare'].filter((k) => DIFFS[k]);
    const D = ids.map((k) => DIFFS[k]);
    const row = (label, vals, hi) => `<div role="row"><span role="rowheader">${esc(say(label))}</span>${vals.map((v, i) => `<span role="cell"${hi && hi(i) ? ' class="hi15"' : ''}>${v}</span>`).join('')}</div>`;
    const html = [
      `<div role="row"><span role="columnheader"></span>${D.map((d) => `<span role="columnheader">${esc(say(d.name))}</span>`).join('')}</div>`,
      row('Snake health', D.map((d) => pct(d.hp)), (i) => D[i].hp !== 1),
      row('Snake speed', D.map((d) => pct(d.speed)), (i) => D[i].speed !== 1),
      row('Boss health', D.map((d) => pct(d.bossHp)), (i) => D[i].bossHp !== 1),
      row('Per bite', D.map((d) => (d.bite ? '1 apple' : '½ apple')), (i) => !!D[i].bite),
      row('Slices', D.map((d) => pct(d.hearts)), (i) => D[i].hearts !== 1),
      row('Rot chance', D.map((d) => pct(d.rot)), (i) => D[i].rot !== 1),
      row('Gold worms', D.map((d) => pct(d.champ)), (i) => D[i].champ !== 1),
      row('Traits', D.map((d) => (d.traits ? `${d.traits} per fight` : 'None')), (i) => !!D[i].traits),
      row('Extra', D.map((d) => (d.startHp ? `+${d.startHp / 2} apple` : d.extra ? `+${d.extra} snake per fight` : '')), (i) => !!(D[i].startHp || D[i].extra)),
    ].join('');
    const s = el('div', 'sec11 g15 wide15'); s.setAttribute('style', tintVars('#d06a3a'));
    s.appendChild(el('h3', null, `<i aria-hidden="true"></i>${esc(say('Difficulty'))}`));
    const t = el('div', 'dt15', html); t.setAttribute('role', 'table'); t.setAttribute('aria-label', 'Difficulty compared');
    s.appendChild(t);
    s.appendChild(el('p', 'note15', esc(say('Traits: armored, swift, spiteful or regrowing. Nightmare unlocks when you escape on Hard.'))));
    return s;
  }
  safe(() => {
    const panel = document.getElementById('tab-basics'); if (!panel) return;
    const ctl = [...panel.querySelectorAll('.sec11')].find((s) => /controls/i.test(((s.querySelector('h3') || {}).textContent) || ''));
    panel.innerHTML = '';
    panel.classList.add('b15');
    panel.appendChild(el('p', 'lead15', esc(say('You are the apple. Clear every room, beat the boss in the lair, drop to the next floor. One life.'))));
    panel.appendChild(el('div', 'kn15', TILES15.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(say(s))}</span></div>`).join('')));
    const cols = el('div', 'cols11');
    if (ctl) { ctl.classList.add('g15'); ctl.setAttribute('style', tintVars('#a69688', 0.08, 0.22)); const h = ctl.querySelector('h3'); if (h && !h.querySelector('i')) h.insertAdjacentHTML('afterbegin', '<i aria-hidden="true"></i>'); cols.appendChild(ctl); }
    for (const [t, col, rows] of RULES15) if (t !== 'Saving') cols.appendChild(ruleGroup(t, col, rows));
    cols.appendChild(diffTable());
    const sv = RULES15.find((g) => g[0] === 'Saving'); if (sv) cols.appendChild(ruleGroup(sv[0], sv[1], sv[2]));
    panel.appendChild(cols);
  });

  /* =====================================================================
     2. Characters: a frame of their own colors, with a bitten halo
     ===================================================================== */
  const CHAR15 = {
    apple: { body: '#d92a40', acc: '#7fc85a', mot: '#f2dfb6', motif: 'seeds' },
    appel: { body: '#c8303c', acc: '#f2c890', mot: '#f2e6d0', motif: 'plus' },
    rot: { body: '#8c6d2c', acc: '#b8c86a', mot: '#f29ac0', motif: 'spores' },
    krul: { body: '#d92a40', acc: '#c8844a', mot: '#e0a060', motif: 'curls' },
    mika: { body: '#2a5af0', acc: '#9ad8ff', mot: '#d8f0ff', motif: 'flakes' },
    pean: { body: '#b07a48', acc: '#ff5a5a', mot: '#fff0c8', motif: 'popcorn', txt: '#f0b890' },
    apploa: { body: '#8a5030', acc: '#e8c870', mot: '#eef2f6', motif: 'feathers' },
    lucif: { body: '#d5232f', acc: '#e2b04e', mot: '#ffd36a', motif: 'matches' },
    lucky: { body: '#a8b830', acc: '#ffd84a', mot: '#f6f0e2', motif: 'dice' },
  };
  const charCol15 = (id) => CHAR15[id] || { body: '#d92a40', acc: '#e3a54a', mot: '#f2dfb6', motif: 'seeds' };
  function rng15(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
  function motif15(c, kind, x, y, s, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.lineCap = 'round'; c.lineJoin = 'round';
    switch (kind) {
      case 'seeds': c.beginPath(); c.ellipse(0, 0, s * 0.42, s * 0.7, 0, 0, Math.PI * 2); c.fill(); break;
      case 'plus': c.lineWidth = s * 0.34; c.beginPath(); c.moveTo(-s * 0.6, 0); c.lineTo(s * 0.6, 0); c.moveTo(0, -s * 0.6); c.lineTo(0, s * 0.6); c.stroke(); break;
      case 'spores': c.beginPath(); c.arc(0, 0, s * 0.5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(s * 0.75, -s * 0.5, s * 0.22, 0, Math.PI * 2); c.fill(); break;
      case 'curls': c.lineWidth = s * 0.26; c.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24, an = t * Math.PI * 3.2, r = s * (0.15 + 0.6 * t); if (i) c.lineTo(Math.cos(an) * r, Math.sin(an) * r); else c.moveTo(Math.cos(an) * r, Math.sin(an) * r); } c.stroke(); break;
      case 'flakes': c.lineWidth = s * 0.2; c.beginPath(); for (let i = 0; i < 3; i++) { const an = (i * Math.PI) / 3; c.moveTo(Math.cos(an) * s * 0.8, Math.sin(an) * s * 0.8); c.lineTo(-Math.cos(an) * s * 0.8, -Math.sin(an) * s * 0.8); } c.stroke(); break;
      case 'popcorn': for (const [px, py, r] of [[-0.3, 0.1, 0.42], [0.3, 0.15, 0.38], [0, -0.3, 0.4]]) { c.beginPath(); c.arc(px * s, py * s, r * s, 0, Math.PI * 2); c.fill(); } break;
      case 'matches': c.lineWidth = s * 0.22; c.beginPath(); c.moveTo(-s * 0.7, s * 0.4); c.lineTo(s * 0.45, -s * 0.25); c.stroke(); c.beginPath(); c.arc(s * 0.55, -s * 0.32, s * 0.24, 0, Math.PI * 2); c.fill(); break;
      case 'dice': c.beginPath(); c.rect(-s * 0.5, -s * 0.5, s, s); c.fill(); break;
      case 'feathers': c.beginPath(); c.moveTo(0, -s * 0.9); c.quadraticCurveTo(s * 0.55, 0, 0, s * 0.9); c.quadraticCurveTo(-s * 0.55, 0, 0, -s * 0.9); c.fill(); break;
      default: c.beginPath(); c.arc(0, 0, s * 0.4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
  function charBg15(c, w, h, id, locked) {
    const P = charCol15(id);
    const body = locked ? '#4e443e' : P.body, acc = locked ? '#3a322c' : P.acc;
    fade15(c, w, h, body, acc, { cy: 0.46, glow: locked ? 0.28 : 0.58, twist: false });
    const cx = w / 2, cy = h * 0.47, rr = Math.min(w * 0.42, h * 0.44);
    c.save();
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    // the twist: a halo behind the head, with a bite taken out of it
    const a0 = -0.42, gap = 0.95;
    const passes = locked ? [[0.1, 0.05]] : [[0.26, 0.09], [0.12, 0.18], [0.045, 0.55]];
    for (const [lw, al] of passes) {
      const lg = c.createLinearGradient(cx - rr, cy + rr, cx + rr, cy - rr);
      lg.addColorStop(0, rgba(acc, al * 0.35)); lg.addColorStop(0.6, rgba(acc, al)); lg.addColorStop(1, rgba(acc, al * 0.5));
      c.strokeStyle = lg; c.lineWidth = rr * lw;
      c.beginPath(); c.arc(cx, cy, rr, a0, a0 + Math.PI * 2 - gap); c.stroke();
    }
    if (!locked) {
      // the bite marks: two small scallops where the halo breaks
      c.fillStyle = rgba(acc, 0.35);
      for (const a of [a0 - 0.1, a0 - gap + 0.1]) { c.beginPath(); c.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, rr * 0.05, 0, Math.PI * 2); c.fill(); }
      // what this character is about, floating around the halo
      const r = rng15(id), n = 7, s = Math.max(2.2, h * 0.045);
      c.fillStyle = rgba(P.mot, 0.3); c.strokeStyle = rgba(P.mot, 0.3);
      for (let i = 0; i < n; i++) {
        const an = (i / n) * Math.PI * 2 + r() * 0.5, d = rr * (1.08 + r() * 0.5);
        const x = cx + Math.cos(an) * d * (w / h > 1.4 ? 1.35 : 1), y = cy + Math.sin(an) * d * 0.9;
        if (x < -s || x > w + s || y < -s || y > h + s) continue;
        motif15(c, P.motif, x, y, s * (0.75 + r() * 0.5), r() * Math.PI * 2);
      }
    }
    c.restore();
    // a soft light on the floor in the accent color
    const fl = c.createRadialGradient(cx, h * 0.86, 0, cx, h * 0.86, w * 0.4);
    fl.addColorStop(0, rgba(acc, locked ? 0.04 : 0.14)); fl.addColorStop(1, rgba(acc, 0));
    c.save(); c.translate(0, h * 0.86); c.scale(1, 0.32); c.translate(0, -h * 0.86);
    c.fillStyle = fl; c.fillRect(0, 0, w, h * 2); c.restore();
  }
  safe(() => {
    if (typeof paintChar !== 'function') return;
    paintChar = function (cv, id, locked, opt = {}) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || (opt.face ? 34 : 160), h = cv.clientHeight || (opt.face ? 34 : 92);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const c = cv.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (!opt.face) {
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        try { charBg15(c, w, h, id, locked); } catch (e) { c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h); }
        c.fillStyle = 'rgba(0,0,0,0.42)'; ell(c, w / 2, h * 0.84, h * 0.2, h * 0.045); c.fill();
        c.setTransform(1, 0, 0, 1, 0, 0);
      }
      const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      const oc = off.getContext('2d');
      const k = (opt.face ? h * 0.03 : opt.big ? h * 0.024 : h * 0.026) * dpr;
      oc.setTransform(k, 0, 0, k, off.width / 2, off.height / 2 + (opt.face ? 2 : 3) * k);
      const t = opt.t != null ? opt.t : 2;
      drawApple(oc, 14, { char: id, t, lookX: 0, lookY: 0.2, blink: 1, fear: id === 'apple' ? 0.6 : 0, hurt: 0, bites: [], leaf: 0.1 });
      if (locked) {
        oc.setTransform(1, 0, 0, 1, 0, 0);
        oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = '#0c0807'; oc.fillRect(0, 0, off.width, off.height);
        oc.globalCompositeOperation = 'source-over';
        oc.fillStyle = 'rgba(236,226,212,0.55)'; oc.font = `800 ${Math.round(h * 0.34 * dpr)}px "Grenze Gotisch", Georgia, serif`;
        oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.fillText('?', off.width / 2, off.height / 2 + h * 0.06 * dpr);
      }
      c.drawImage(off, 0, 0);
    };
  });
  function tintChars15() {
    for (const cv of document.querySelectorAll('#howChars canvas[data-char]')) {
      const f = cv.closest('figure'); if (!f) continue;
      const id = cv.dataset.char, open = id === 'apple' || !!Save.data.unlocks[id];
      const P = charCol15(id), body = open ? P.body : '#6a5e56';
      const l = lumOf(body);
      f.style.setProperty('--tint15', rgba(body, 0.14 - 0.05 * l));
      f.style.setProperty('--edge15', rgba(body, open ? 0.38 - 0.15 * l : 0.18));
      f.style.setProperty('--acc15', open ? (P.txt || P.acc) : 'var(--faint)');
    }
    const list = document.getElementById('charList');
    if (list) for (const b of list.children) {
      const id = b.dataset.id; if (!id) continue;
      const open = id === 'apple' || !!Save.data.unlocks[id], P = charCol15(id), body = open ? P.body : '#6a5e56', l = lumOf(body);
      b.style.setProperty('--tint15', rgba(body, 0.16 - 0.06 * l));
      b.style.setProperty('--edge15', rgba(body, open ? 0.42 - 0.16 * l : 0.2));
    }
  }
  safe(() => {
    const bh = UI.buildHowChars9;
    if (bh) UI.buildHowChars9 = function () { const r = bh.apply(this, arguments); safe(tintChars15); return r; };
    const pc = UI.paintChars;
    if (pc) UI.paintChars = function () { const r = pc.apply(this, arguments); safe(tintChars15); return r; };
    tintChars15();
  });

  /* =====================================================================
     3. New achievements
     ===================================================================== */
  const NEW15 = [
    { id: 'hattrick15', reward: 'vinyl', name: 'Hat Trick', desc: 'Score 3 goals on Boost Worms with their own ball.', stat: 'goals', goal: 3 },
    { id: 'grubs15', reward: 'hagel', name: 'Grub Hub', desc: 'Kill 300 grubs.', stat: 'k_grub', goal: 300 },
    { id: 'hoods15', reward: 'reflectie', name: 'Hoodwinked', desc: 'Kill 100 Hoods.', stat: 'k_hood', goal: 100 },
    { id: 'lamprey15', reward: 'klomp', name: 'Bottom Feeder', desc: 'Kill 60 Lampreys.', stat: 'k_lamprey', goal: 60 },
    { id: 'sniper15', reward: 'sniper', name: 'Counter Sniper', desc: 'Kill 40 Sharpshooters.', stat: 'k_sniper', goal: 40 },
    { id: 'gold15', reward: 'selfie', name: 'Gold Standard', desc: 'Kill 50 gold worms.', stat: 'champs', goal: 50 },
    { id: 'wals15', reward: 'bass', name: 'Last Dance', desc: 'Beat De Wals.', stat: 'boss_wals', goal: 1 },
    { id: 'deals15', reward: 'kamhuid', name: 'Bad Deals', desc: 'Take 15 curses.', stat: 'curses', goal: 15 },
    { id: 'hex15', reward: 'kleurwissel', name: 'Walking Curse', desc: 'Carry 5 curses at once.', stat: 'mostCurses', goal: 5 },
    { id: 'taken15', reward: 'linzen', name: 'Sticky Fingers', desc: 'Take 300 powerups.', stat: 'items', goal: 300 },
    { id: 'roller15', reward: 'snoepzak', name: 'High Roller', desc: 'Hit the jackpot 5 times.', stat: 'jackpots', goal: 5 },
    { id: 'eaten15', reward: 'peel', name: 'Rest In Pieces', desc: 'Get eaten 100 times.', stat: 'deaths', goal: 100 },
    { id: 'hours15', reward: 'doomscroll', name: 'Long Haul', desc: 'Play for 5 hours.', stat: 'time', goal: 18000 },
    { id: 'manual15', reward: 'duet', name: 'Read The Manual', desc: 'Open every tab in How to play.', stat: 'guide15', goal: 7 },
  ];
  safe(() => {
    for (const a of NEW15) if (!ACHS.find((x) => x.id === a.id) && (!a.reward || ITEMS[a.reward])) ACHS.push(a);
    const m = ACHS.find((a) => a.id === 'manual15'); if (m && typeof HOW_TABS9 !== 'undefined' && HOW_TABS9.length) m.goal = HOW_TABS9.length;
    // the guide counts the tabs you opened
    const ht = UI.howTab;
    UI.howTab = function (id) {
      const r = ht.apply(this, arguments);
      safe(() => {
        const i = HOW_TABS9.indexOf(id === 'controls' ? 'basics' : id); if (i < 0) return;
        const S = Save.data.stats, mask = (S.guideMask15 || 0) | (1 << i);
        if (mask === S.guideMask15) return;
        S.guideMask15 = mask; let n = 0; for (let x = mask; x; x >>= 1) n += x & 1;
        Meta.max('guide15', n);
      });
      return r;
    };
  });

  /* =====================================================================
     4. The achievements page
     ===================================================================== */
  const CAT15 = {
    runs: { name: 'Runs', body: '#c85a20', acc: '#ffd27a', glyph: 'apple' },
    bosses: { name: 'Bosses', body: '#b01e34', acc: '#f0c040', glyph: 'crown' },
    snakes: { name: 'Snakes', body: '#4a8a2a', acc: '#c8e05a', glyph: 'snake' },
    places: { name: 'Rooms and floors', body: '#2a8a80', acc: '#9fe8ff', glyph: 'door' },
    collect: { name: 'Collecting', body: '#a07a10', acc: '#fff0b0', glyph: 'gem' },
  };
  const CAT_ORDER15 = ['runs', 'bosses', 'snakes', 'places', 'collect'];
  const RUNS15 = ['wins', 'runs', 'deaths', 'time', 'guide15', 'achs', 'storyWins', 'story2Wins', 'storiesDone', 'hardWins', 'nightWins', 'dailyWins', 'fastWin', 'winChars', 'abyssWins', 'chaosWins', 'leftRuns', 'peanWins', 'rushWins'];
  const SNAKES15 = ['glasses', 'heads', 'thieves', 'champs', 'goals'];
  const catOf15 = (a) => {
    const s = a.stat || '';
    if (/^boss_/.test(s)) return 'bosses';
    if (/^k_/.test(s) || SNAKES15.includes(s)) return 'snakes';
    if (/^win_/.test(s) || RUNS15.includes(s)) return s === 'rushWins' ? 'bosses' : 'runs';
    const k = safe(() => achCat10(a)); return CAT15[k] ? k : 'runs';
  };
  const STATUS15 = [['all', 'All'], ['todo', 'To do'], ['almost', 'Almost'], ['done', 'Done']];
  const TABS15 = [['list', 'List'], ['boss', 'Bosses'], ['stats', 'Numbers'], ['coll', 'Powerups']];
  const BOSS_KIND15 = { pricewar: 'pwblue,pwyellow' };

  function glyph15(c, g, x, y, u, fill, line) {
    c.save(); c.translate(x, y); c.fillStyle = fill; c.strokeStyle = line; c.lineJoin = 'round'; c.lineCap = 'round';
    if (g === 'crown') {
      c.beginPath(); c.moveTo(-u, u * 0.62); c.lineTo(-u, -u * 0.42); c.lineTo(-u * 0.48, u * 0.06); c.lineTo(0, -u * 0.72); c.lineTo(u * 0.48, u * 0.06); c.lineTo(u, -u * 0.42); c.lineTo(u, u * 0.62); c.closePath(); c.fill();
      c.fillStyle = line; for (const px of [-u, 0, u]) { c.beginPath(); c.arc(px, px ? -u * 0.5 : -u * 0.8, u * 0.14, 0, Math.PI * 2); c.fill(); }
      c.fillRect(-u, u * 0.36, u * 2, u * 0.12);
    } else if (g === 'snake') {
      c.lineWidth = u * 0.46; c.strokeStyle = fill;
      c.beginPath(); c.moveTo(-u * 0.95, u * 0.7); c.bezierCurveTo(-u * 0.2, u * 0.95, -u * 0.9, -u * 0.1, -u * 0.1, -u * 0.15); c.quadraticCurveTo(u * 0.35, -u * 0.18, u * 0.45, -u * 0.35); c.stroke();
      c.beginPath(); c.ellipse(u * 0.55, -u * 0.42, u * 0.5, u * 0.38, -0.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = line; c.beginPath(); c.arc(u * 0.68, -u * 0.58, u * 0.1, 0, Math.PI * 2); c.fill();
      c.strokeStyle = line; c.lineWidth = u * 0.08; c.beginPath(); c.moveTo(u * 1.0, -u * 0.6); c.lineTo(u * 1.25, -u * 0.8); c.moveTo(u * 1.0, -u * 0.6); c.lineTo(u * 1.28, -u * 0.5); c.stroke();
    } else if (g === 'door') {
      c.beginPath(); c.moveTo(-u * 0.72, u * 0.8); c.lineTo(-u * 0.72, -u * 0.15); c.arc(0, -u * 0.15, u * 0.72, Math.PI, 0); c.lineTo(u * 0.72, u * 0.8); c.closePath(); c.fill();
      c.fillStyle = line; c.beginPath(); c.moveTo(-u * 0.4, u * 0.8); c.lineTo(-u * 0.4, -u * 0.1); c.arc(0, -u * 0.1, u * 0.4, Math.PI, 0); c.lineTo(u * 0.4, u * 0.8); c.closePath(); c.fill();
      c.fillStyle = fill; c.fillRect(-u * 0.95, u * 0.72, u * 1.9, u * 0.16);
    } else if (g === 'gem') {
      c.beginPath(); c.moveTo(0, -u); c.quadraticCurveTo(u * 0.16, -u * 0.16, u, 0); c.quadraticCurveTo(u * 0.16, u * 0.16, 0, u); c.quadraticCurveTo(-u * 0.16, u * 0.16, -u, 0); c.quadraticCurveTo(-u * 0.16, -u * 0.16, 0, -u); c.fill();
      c.fillStyle = line; c.beginPath(); c.arc(u * 0.62, -u * 0.62, u * 0.16, 0, Math.PI * 2); c.fill();
    } else {
      c.save(); c.translate(0, u * 0.1); applePath(c, u * 0.85); c.fill(); c.restore();
      c.strokeStyle = line; c.lineWidth = u * 0.16; c.beginPath(); c.moveTo(0, -u * 0.55); c.quadraticCurveTo(u * 0.06, -u * 0.85, u * 0.18, -u * 1.0); c.stroke();
      c.fillStyle = line; c.beginPath(); c.ellipse(u * 0.42, -u * 0.82, u * 0.28, u * 0.13, -0.5, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
  function badge15(cv, cat, done, fr) {
    const d = DPR(), s = cv.clientWidth || 48;
    cv.width = cv.height = Math.round(s * d);
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    const K = CAT15[cat] || CAT15.runs;
    fade15(c, s, s, done ? K.body : mixHex(K.body, '#3a302a', 0.62), done ? K.acc : mixHex(K.acc, '#4a3e36', 0.6), { glow: done ? 0.62 : 0.36, twistA: done ? 1.2 : 0.55 });
    const R = s * 0.38;
    c.lineCap = 'round'; c.lineWidth = s * 0.055;
    c.strokeStyle = 'rgba(236,226,212,0.12)'; c.beginPath(); c.arc(s / 2, s / 2, R, 0, Math.PI * 2); c.stroke();
    if (fr > 0) {
      c.strokeStyle = done ? '#f0c040' : K.acc;
      if (done) { c.shadowColor = 'rgba(240,192,64,0.7)'; c.shadowBlur = 6; }
      c.beginPath(); c.arc(s / 2, s / 2, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, fr)); c.stroke();
      c.shadowBlur = 0;
    }
    glyph15(c, K.glyph, s / 2, s / 2 + s * 0.01, s * 0.2, done ? '#fff4e0' : mixHex(K.acc, '#8a7a6e', 0.62), done ? K.body : '#2a2220');
  }
  function itemIcon15(cv, id, dim) {
    const d = DPR(), s = cv.clientWidth || 18;
    cv.width = cv.height = Math.round(s * d);
    const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
    const oc = off.getContext('2d'); oc.setTransform(d, 0, 0, d, (s / 2) * d, (s / 2) * d);
    try { drawItemIcon(oc, id, s * 0.92, 1); } catch (e) { /* ignore */ }
    if (dim) {
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = 'source-atop'; oc.fillStyle = '#16100d'; oc.fillRect(0, 0, off.width, off.height);
      oc.globalCompositeOperation = 'source-over'; oc.fillStyle = 'rgba(236,226,212,0.35)'; oc.font = `700 ${Math.round(s * 0.42 * d)}px "Barlow Condensed", sans-serif`;
      oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.fillText('?', off.width / 2, off.height / 2);
    }
    cv.getContext('2d').drawImage(off, 0, 0);
  }
  function snakePic15(cv) {
    const fake = { querySelectorAll: (q) => (q === 'canvas[data-snake]' ? [cv] : []) };
    try { paintBestiary(fake); } catch (e) {
      const d = DPR(), w = cv.clientWidth || 64, h = cv.clientHeight || 40; cv.width = w * d; cv.height = h * d;
      const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h);
    }
  }
  // paint canvases when they come into view
  let io = null;
  const paintNow = (cv) => { const f = cv._p15; if (f) { cv._p15 = null; safe(f); } };
  function later(cv, fn) {
    cv._p15 = fn;
    if (!io && 'IntersectionObserver' in window) io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { io.unobserve(e.target); paintNow(e.target); } }, { rootMargin: '200px 0px' });
    if (io) io.observe(cv); else requestAnimationFrame(() => paintNow(cv));
  }

  const ach = document.getElementById('achs');
  const inner = ach && ach.querySelector('.sheet-inner');
  if (!ach || !inner) return;
  const V = {};
  safe(() => {
    inner.classList.add('ach15');
    const head = inner.querySelector('.sheet-head');
    const back = document.getElementById('btnAchBack'), count = document.getElementById('achCount');
    head.innerHTML = '';
    const row = el('div', 'head15'); row.appendChild(el('h2', null, esc(say('Achievements')))); if (back) row.appendChild(back);
    head.appendChild(row);
    const prog = el('div', 'prog15'); V.bar = el('i'); const bar = el('div', 'bar15'); bar.setAttribute('aria-hidden', 'true'); bar.appendChild(V.bar); prog.appendChild(bar);
    if (count) { count.className = ''; prog.appendChild(count); }
    V.count = count;
    head.appendChild(prog);
    V.tabs = el('div', 'tabs9 atab15'); V.tabs.setAttribute('role', 'tablist'); V.tabs.setAttribute('aria-label', 'Achievements');
    for (const [id, label] of TABS15) {
      const b = el('button', null, esc(say(label))); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.t = id; b.id = 'at15-' + id; b.setAttribute('aria-controls', 'ap15-' + id);
      b.addEventListener('click', (e) => { e.preventDefault(); Sfx.blip(); tab(id); });
      V.tabs.appendChild(b);
    }
    V.tabs.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const ids = TABS15.map((t) => t[0]), i = ids.indexOf(UI._achTab15 || 'list');
      const n = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length]; tab(n, true); e.preventDefault();
    });
    head.appendChild(V.tabs);
    // everything below the header is new
    for (const n of [...inner.children]) if (n !== head) n.remove();
    const panel = (id) => { const p = el('div', 'ap15'); p.id = 'ap15-' + id; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'at15-' + id); p.hidden = true; inner.appendChild(p); return p; };
    V.list = panel('list'); V.boss = panel('boss'); V.stats = panel('stats'); V.coll = panel('coll');
    inner.appendChild(el('p', 'savehint', esc(say('Your save file and save code live in Settings.'))));
  });

  function tab(id, focus) {
    UI._achTab15 = id;
    for (const b of V.tabs.children) { const on = b.dataset.t === id; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus({ preventScroll: true }); }
    for (const [t] of TABS15) { const p = V[t]; if (p) p.hidden = t !== id; }
    ach.scrollTop = 0;
    safe(() => ({ list: paintList, boss: paintBoss, stats: paintStats, coll: paintColl }[id])());
  }

  function rowsAll() {
    return ACHS.map((a) => {
      const done = !!Save.data.ach[a.id], v = Meta.progress(a), fr = done ? 1 : a.goal ? Math.min(1, v / a.goal) : 0;
      return { a, done, v, fr, cat: catOf15(a), at: typeof Save.data.ach[a.id] === 'number' ? Save.data.ach[a.id] : 0 };
    });
  }
  const progTxt = (r) => (r.a.stat === 'time' ? `${fmtTime(r.v)} / ${fmtTime(r.a.goal)}` : `${Math.floor(r.v)}/${r.a.goal}`);
  function card(r) {
    const K = CAT15[r.cat] || CAT15.runs, a = r.a;
    const d = el('div', 'ac15' + (r.done ? ' done' : ''));
    const body = K.body, l = lumOf(body);
    d.setAttribute('style', `--acc15:${r.done ? '#f0c040' : K.acc};--tint15:${rgba(body, (r.done ? 0.18 : 0.07) - 0.05 * l)};--edge15:${rgba(body, r.done ? 0.5 - 0.14 * l : 0.2)}`);
    const rw = [];
    if (a.reward && ITEMS[a.reward]) rw.push(`${say(r.done ? 'Got' : 'Reward')}: ${ITEMS[a.reward].name}${ITEMS[a.reward].rare ? ` (${say('legendary')})` : ''}`);
    if (a.unlocks) rw.push(`${say(r.done ? 'Unlocked' : 'Unlocks')} ${safe(() => UI.unlockName(a.unlocks)) || a.unlocks}`);
    d.innerHTML = `<canvas class="bd15" aria-hidden="true"></canvas><div class="tx15"><b class="n15"></b><span class="d15"></span>`
      + (r.done ? '' : `<div class="pg15"><i><s style="width:${Math.round(r.fr * 100)}%"></s></i><em>${progTxt(r)}</em></div>`)
      + (rw.length ? `<div class="rw15">${a.reward && ITEMS[a.reward] ? '<canvas aria-hidden="true"></canvas>' : ''}<span></span></div>` : '') + '</div>';
    d.querySelector('.n15').textContent = a.name; d.querySelector('.d15').textContent = a.desc;
    if (rw.length) d.querySelector('.rw15 span').textContent = rw.join('  ·  ');
    d.setAttribute('aria-label', `${a.name}. ${a.desc} ${r.done ? say('Done') : progTxt(r)}.`);
    later(d.querySelector('.bd15'), () => badge15(d.querySelector('.bd15'), r.cat, r.done, r.fr));
    const ic = d.querySelector('.rw15 canvas'); if (ic) later(ic, () => itemIcon15(ic, a.reward, false));
    return d;
  }
  const sortRows = (rows) => rows.sort((x, y) => (x.done === y.done ? (x.done ? y.at - x.at : y.fr - x.fr) : x.done ? 1 : -1));

  function paintList() {
    const box = V.list; box.innerHTML = '';
    const all = rowsAll(), f = UI._achF15 || 'all', cat = UI._achC15 || 'any';
    const okF = (r) => f === 'all' || (f === 'done' ? r.done : f === 'todo' ? !r.done : !r.done && r.fr >= 0.5);
    // the closest ones to done
    const near = all.filter((r) => !r.done && r.fr > 0).sort((x, y) => y.fr - x.fr).slice(0, 3);
    if (near.length && f !== 'done') {
      const s = el('div', 'sec15'); s.appendChild(el('h3', null, esc(say('Closest'))));
      const l = el('div', 'alist15'); for (const r of near) l.appendChild(card(r)); s.appendChild(l); box.appendChild(s);
    }
    // filters, with counts
    const fs = el('div', 'sec15'); fs.appendChild(el('h3', null, esc(say('Show'))));
    const mk = (list, key, cur, label) => {
      const g = el('div', 'filt9'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', label);
      for (const [id, name, n] of list) {
        const b = el('button', null, `${esc(say(name))}${n != null ? `<em>${n}</em>` : ''}`); b.type = 'button'; b.setAttribute('aria-pressed', id === cur ? 'true' : 'false');
        b.addEventListener('click', (e) => { e.preventDefault(); Sfx.blip(); if (key === 'f') UI._achF15 = id; else UI._achC15 = id; paintList(); });
        g.appendChild(b);
      }
      return g;
    };
    const cnt = (fn) => all.filter(fn).length;
    fs.appendChild(mk(STATUS15.map(([id, n]) => [id, n, cnt((r) => (id === 'all' ? true : id === 'done' ? r.done : id === 'todo' ? !r.done : !r.done && r.fr >= 0.5))]), 'f', f, 'Status'));
    fs.appendChild(mk([['any', 'Everything', null]].concat(CAT_ORDER15.map((k) => [k, CAT15[k].name, `${cnt((r) => r.cat === k && r.done)}/${cnt((r) => r.cat === k)}`])), 'c', cat, 'Kind'));
    box.appendChild(fs);
    // the list, in groups
    const cats = cat === 'any' ? CAT_ORDER15 : [cat];
    let shown = 0;
    for (const k of cats) {
      const rows = sortRows(all.filter((r) => r.cat === k && okF(r))); if (!rows.length) continue;
      shown += rows.length;
      const K = CAT15[k], tot = all.filter((r) => r.cat === k), dn = tot.filter((r) => r.done).length;
      const s = el('div', 'sec15'); s.setAttribute('style', `--acc15:${K.acc}`);
      s.appendChild(el('div', 'gh15', `<h4>${esc(say(K.name))}</h4><div class="gb15" aria-hidden="true"><i style="width:${Math.round((dn / Math.max(1, tot.length)) * 100)}%"></i></div><span>${dn}/${tot.length}</span>`));
      const l = el('div', 'alist15'); for (const r of rows) l.appendChild(card(r)); s.appendChild(l);
      box.appendChild(s);
    }
    if (!shown) box.appendChild(el('p', 'empty15', esc(say('Nothing here yet.'))));
  }

  function paintBoss() {
    const box = V.boss; box.innerHTML = '';
    const kinds = (typeof BOSS_ORDER10 !== 'undefined' ? BOSS_ORDER10 : []).filter((k) => (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[k]) || KINDS[k]);
    const beat = kinds.filter((k) => Meta.value('boss_' + k) > 0).length;
    const s = el('div', 'sec15'); s.appendChild(el('h3', null, `${esc(say('Bosses beaten'))} <span class="cnt11" style="color:var(--faint);letter-spacing:.14em;margin-left:8px">${beat}/${kinds.length}</span>`));
    const g = el('div', 'bgrid15');
    for (const k of kinds) {
      const n = Math.floor(Meta.value('boss_' + k)), nm = (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[k]) ? BOSS_INFO[k].title : KINDS[k].name;
      const kindList = BOSS_KIND15[k] || (KINDS[k] ? k : null);
      const t = el('div', 'bt15' + (n ? ' on' : ''), `${kindList ? `<canvas data-snake="${kindList}" aria-hidden="true"></canvas>` : ''}<b></b><span></span>`);
      t.querySelector('b').textContent = n ? nm : '???';
      t.querySelector('span').textContent = n ? `${say('Beaten')} ${n}x` : say('Not yet');
      g.appendChild(t);
      const cv = t.querySelector('canvas'); if (cv) later(cv, () => snakePic15(cv));
    }
    s.appendChild(g); box.appendChild(s);
    // the snakes you killed most
    const rows = Object.keys(KINDS).filter((k) => !KINDS[k].boss).map((k) => [k, Math.floor(Meta.value('k_' + k))]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const h = el('div', 'sec15'); h.appendChild(el('h3', null, esc(say('Most hunted'))));
    if (!rows.length) h.appendChild(el('p', 'empty15', esc(say('Nothing yet. Go bite back.'))));
    else {
      const top = rows[0][1], l = el('div', 'hunt15');
      for (const [k, n] of rows) {
        const r = el('div', null, `<canvas data-snake="${k}" aria-hidden="true"></canvas><div><b></b><i style="width:${Math.max(4, Math.round((n / top) * 100))}%"></i></div><em>${n}</em>`);
        r.querySelector('b').textContent = KINDS[k].name; l.appendChild(r);
        const cv = r.querySelector('canvas'); later(cv, () => snakePic15(cv));
      }
      h.appendChild(l);
    }
    box.appendChild(h);
  }

  function paintStats() {
    const box = V.stats; box.innerHTML = '';
    const S = Save.data.stats, done = Meta.done(), all = ACHS.length;
    const kinds = (typeof BOSS_ORDER10 !== 'undefined' ? BOSS_ORDER10 : []).filter((k) => (typeof BOSS_INFO !== 'undefined' && BOSS_INFO[k]) || KINDS[k]);
    const beat = kinds.filter((k) => Meta.value('boss_' + k) > 0).length;
    const found = Object.keys(Save.data.found).filter((k) => ITEMS[k]).length;
    const tiles = [['Achievements', `${done}/${all}`], ['Bosses beaten', `${beat}/${kinds.length}`], ['Snakes killed', Math.floor(Meta.value('kills'))], ['Escapes', Math.floor(Meta.value('wins'))], ['Powerups found', `${found}/${ITEM_IDS.length}`], ['Time played', fmtTime(S.time)]];
    const t = el('div', 'sec15'); t.appendChild(el('div', 'tiles15', tiles.map(([k, v]) => `<div><b>${esc(v)}</b><span>${esc(say(k))}</span></div>`).join(''))); box.appendChild(t);
    const groups = {};
    for (const [k, label] of STAT_DEFS) { const g = (typeof STAT_GROUP10 !== 'undefined' && STAT_GROUP10[k]) || 'Other'; (groups[g] = groups[g] || []).push([k, label]); }
    const order = typeof STAT_ORDER10 !== 'undefined' ? STAT_ORDER10 : Object.keys(groups);
    const s = el('div', 'sec15'); s.appendChild(el('h3', null, esc(say('Your numbers'))));
    const grid = el('div', 'sgrid15');
    for (const g of order) {
      if (!groups[g]) continue;
      grid.appendChild(el('div', null, `<h4>${esc(say(g))}</h4><dl class="sl15">${groups[g].map(([k, label]) => `<div${k !== 'time' && !Math.floor(Meta.value(k)) ? ' class="z15"' : ''}><dt>${esc(say(label))}</dt><dd>${k === 'time' ? fmtTime(S.time) : Math.floor(Meta.value(k))}</dd></div>`).join('')}</dl>`));
    }
    s.appendChild(grid); box.appendChild(s);
    const e = el('div', 'sec15'); e.appendChild(el('h3', null, esc(say('Escaped as'))));
    const eg = el('div', 'esc15');
    for (const id of CHAR_IDS) {
      const won = !!Save.data.winChars[id], n = Math.floor(Meta.value('win_' + id)), open = id === 'apple' || !!Save.data.unlocks[id];
      const r = el('div', won ? 'on' : '', `<canvas aria-hidden="true"></canvas><div><b></b><span></span></div>`);
      r.querySelector('b').textContent = open ? CHARS[id].name : '???';
      r.querySelector('span').textContent = won ? (n ? `${n}x` : say('Escaped')) : say('Not yet');
      eg.appendChild(r);
      const cv = r.querySelector('canvas'); later(cv, () => paintChar(cv, id, !open, { face: true }));
    }
    e.appendChild(eg); box.appendChild(e);
  }

  // the main color of a powerup icon: average of its most colorful pixels
  const icCache15 = {};
  function iconCol15(id) {
    if (icCache15[id]) return icCache15[id];
    let out = '#e3a54a';
    safe(() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 40;
      const c = cv.getContext('2d'); c.translate(20, 20); drawItemIcon(c, id, 34, 1);
      const d = c.getImageData(0, 0, 40, 40).data; let r = 0, g = 0, b = 0, wt = 0;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3] / 255; if (a < 0.4) continue;
        const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        const w = a * ((mx - mn) / 255 + 0.05) * (mx / 255);
        r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; wt += w;
      }
      if (wt > 0) { const h = (v) => Math.round(Math.min(255, v / wt)).toString(16).padStart(2, '0'); out = `#${h(r)}${h(g)}${h(b)}`; }
    });
    return (icCache15[id] = out);
  }
  // the detail card: the icon's own color glows behind it, and a huge faded copy of the icon fills the right side
  function detBg15(det, id, col, got) {
    const d = DPR(), bg = det.querySelector('.cbg15'), w = det.clientWidth || 300, h = det.clientHeight || 92;
    bg.width = Math.round(w * d); bg.height = Math.round(h * d);
    const c = bg.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    fade15(c, w, h, col, mixHex(col, '#ffffff', 0.35), { cx: 0.16, glow: got ? 0.62 : 0.3, twistA: got ? 1 : 0.4 });
    if (got) {
      c.save(); c.globalAlpha = 0.2; c.translate(w - h * 0.55, h * 0.55); c.rotate(-0.18);
      try { drawItemIcon(c, id, h * 1.7, 1); } catch (e) { /* ignore */ }
      c.restore();
      const fl = c.createLinearGradient(0, 0, w, 0);
      fl.addColorStop(0, 'rgba(12,8,7,0.15)'); fl.addColorStop(0.55, 'rgba(12,8,7,0.45)'); fl.addColorStop(1, 'rgba(12,8,7,0.1)');
      c.fillStyle = fl; c.fillRect(0, 0, w, h);
    }
    itemIcon15(det.querySelector('.cic15'), id, !got);
  }
  function paintColl() {
    const box = V.coll; box.innerHTML = '';
    const fd = Save.data.found, found = ITEM_IDS.filter((k) => fd[k]).length;
    const s = el('div', 'sec15');
    s.appendChild(el('h3', null, `${esc(say('Powerups found'))} <span style="color:var(--faint);letter-spacing:.14em;margin-left:8px">${found}/${ITEM_IDS.length}</span>`));
    const det = el('div', 'cdet15 idle', '<canvas class="cbg15" aria-hidden="true"></canvas><canvas class="cic15" aria-hidden="true"></canvas><p></p>');
    det.setAttribute('aria-live', 'polite'); det.querySelector('p').textContent = say('Tap a powerup to read it.');
    s.appendChild(det);
    const head = ach.querySelector('.sheet-head'); if (head) det.style.top = `${head.offsetHeight + 8}px`;
    const g = el('div', 'cgrid15');
    const ids = ITEM_IDS.filter((k) => !ITEMS[k].rare).concat(ITEM_IDS.filter((k) => ITEMS[k].rare));
    for (const id of ids) {
      const it = ITEMS[id], got = !!fd[id];
      const b = el('button', (got ? 'got' : '') + (it.rare ? ' rare' : ''), '<canvas aria-hidden="true"></canvas>'); b.type = 'button';
      b.setAttribute('aria-label', got ? it.name : say('Not found yet')); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', (e) => {
        e.preventDefault(); Sfx.blip();
        for (const x of g.children) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); if (x !== b) { x.style.removeProperty('--icA'); x.style.removeProperty('--icB'); } }
        const col = got ? iconCol15(id) : '#5a4e46';
        for (const t of [b, det]) { t.style.setProperty('--icA', rgba(col, got ? 0.42 : 0.18)); t.style.setProperty('--icB', rgba(col, got ? 0.85 : 0.35)); }
        det.classList.remove('idle');
        det.querySelector('p').innerHTML = got ? `<b>${esc(it.name)}</b>${it.rare ? ` <span class="lg15">${esc(say('Legendary'))}</span>` : ''}<br>${esc(it.desc)}` : esc(say('Not found yet. Keep digging.'));
        safe(() => detBg15(det, id, col, got));
      });
      g.appendChild(b);
      const cv = b.querySelector('canvas'); later(cv, () => itemIcon15(cv, id, !got));
    }
    s.appendChild(g); box.appendChild(s);
  }

  UI.openAchs = function (keep) {
    if (!keep) { this.hide('menu'); this.show('achs'); ach.scrollTop = 0; }
    const done = Meta.done(), all = ACHS.length;
    if (V.count) V.count.textContent = `${done} ${say('of')} ${all} ${say('done')}`;
    if (V.bar) V.bar.style.width = `${Math.round((done / Math.max(1, all)) * 100)}%`;
    tab(keep ? (this._achTab15 || 'list') : (this._achTab15 || 'list'));
    if (!keep) setTimeout(() => this.el.btnAchBack.focus({ preventScroll: true }), 50);
  };
  UI.paintAchList10 = function () { if (UI._achTab15 === 'list' || !UI._achTab15) safe(paintList); };
  safe(() => { if (!ach.hidden) UI.openAchs(true); });
  // the menu button counts the new achievements too
  safe(() => { if (UI.el && UI.el.achNow) UI.el.achNow.textContent = `${Meta.done()} of ${ACHS.length} done`; });
})();


