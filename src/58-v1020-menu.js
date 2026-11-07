/* src/58-v1020-menu.js: v10.20: start menu, dropdowns, pick your apple. From v10.20. Lines 25409 to 26053 of the v13.7 script. */
/* ===== v10.20: start menu rebuilt, custom dropdowns with icons, red Reset all, Pick your apple in a compact grid,
   Rooms tab as little rooms in their own color, Modes tab as mode cards with emblems and a difficulty ladder ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe58'); console.error(e); return fb; } };
  const $ = (id) => document.getElementById(id);
  const say = (s) => safe(() => (typeof sayF9 === 'function' ? sayF9(s) : s), s);
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toHex = (col) => {
    if (!col) return '#a69688';
    if (col[0] === '#') return col.length === 4 ? '#' + col.slice(1).split('').map((x) => x + x).join('') : col.slice(0, 7);
    const m = col.match(/\d+/g); if (!m) return '#a69688';
    return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
  };

  const css = `
/* ---------- start menu ---------- */
#menu.m19 .tag{font-size:clamp(14px,3.8vw,17px)}
#menu.m19 .best{display:none}
#menu.m19 .menu-list{width:min(100%,372px);gap:8px;display:flex;flex-direction:column}
#menu.m19 .mi{all:unset;box-sizing:border-box;cursor:pointer;position:relative;color:var(--ink);text-align:left;-webkit-tap-highlight-color:transparent;
  transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease,filter .16s ease}
#menu.m19 .mi .eye{display:none}
#menu.m19 .mi:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
#menu.m19 .mi.play{display:grid;grid-template-columns:46px minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:13px;row-gap:3px;align-items:center;
  min-height:80px;padding:12px 12px 12px 14px;border-radius:3px;overflow:hidden;border:1px solid #ef4a60;
  background:radial-gradient(120% 140% at 0% 0%,#d72a42 0%,#a3132a 45%,#5a0716 100%);
  box-shadow:0 14px 38px rgba(215,38,61,.34),inset 0 1px 0 rgba(255,255,255,.2),inset 0 -2px 0 rgba(0,0,0,.25)}
#menu.m19 .mi.play::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.16) 46%,transparent 60%);transform:translateX(-120%);animation:sheen19 6.5s ease-in-out infinite;pointer-events:none}
@keyframes sheen19{0%,72%{transform:translateX(-120%)}88%,100%{transform:translateX(120%)}}
#menu.m19 .mi.play .pi19{grid-row:1/3;grid-column:1;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.22);border:1px solid rgba(255,240,230,.42);box-shadow:inset 0 0 12px rgba(0,0,0,.35)}
#menu.m19 .mi.play .pi19 svg{width:18px;height:18px;margin-left:3px}
#menu.m19 .mi.play .ml{grid-column:2;grid-row:1;font:800 clamp(32px,9vw,38px)/.9 var(--display);color:#fff4ec;text-shadow:0 2px 0 rgba(60,0,10,.45);letter-spacing:.01em;transform:none}
#menu.m19 .mi.play small{grid-column:2;grid-row:2;margin:0;font:700 11px/1.15 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:rgba(255,232,222,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#menu.m19 .mi.play .pf19{grid-column:3;grid-row:1/3;width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 50% 40%,rgba(255,230,210,.22),rgba(0,0,0,.28) 70%);border:1px solid rgba(255,240,230,.3);display:grid;place-items:center;overflow:hidden}
#menu.m19 .mi.play .pf19 canvas{width:50px;height:50px;display:block}
#menu.m19 .mi.play:hover{filter:brightness(1.08);transform:translateY(-1px)}
#menu.m19 .mi.play:active{transform:translateY(1px)}
#menu.m19 .mg19{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#menu.m19 .mg19 .mi{display:flex;flex-direction:column;justify-content:flex-end;gap:4px;min-height:76px;overflow:hidden;padding:10px 11px 10px 12px;border-radius:3px;
  background:linear-gradient(180deg,rgba(28,20,17,.9),rgba(12,9,8,.93));border:1px solid rgba(236,226,212,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
#menu.m19 .mg19 .mi .ml{font:800 clamp(20px,5.8vw,24px)/.95 var(--display);color:var(--ink);transform:none;white-space:nowrap}
#menu.m19 .mg19 .mi small{margin:0;font:600 10px/1.15 var(--ui);letter-spacing:.13em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#menu.m19 .mi .ic19{position:absolute;top:9px;right:10px;width:19px;height:19px;color:#7d6c60;transition:color .16s}
#menu.m19 .mi .ic19 svg{width:100%;height:100%;display:block}
#menu.m19 .mg19 .mi .cf{position:absolute;top:5px;right:6px;margin:0;line-height:0}
#menu.m19 .mg19 .mi .cf canvas{width:30px;height:30px}
#menu.m19 .mi.new .cf::after,#menu.m19 .mi.newst .ml::after{display:none}
#menu.m19 .mi.new::after,#menu.m19 .mi.newst::after{content:"NEW";position:absolute;top:8px;left:11px;background:var(--apple);color:#fff4ec;font:700 10px/1 var(--ui);letter-spacing:.14em;padding:3px 5px;border-radius:2px;box-shadow:0 2px 8px rgba(215,38,61,.5)}
#menu.m19 .mg19 .mi:hover,#menu.m19 .mg19 .mi:focus-visible{border-color:rgba(232,58,80,.6);background:linear-gradient(180deg,rgba(48,20,22,.92),rgba(16,9,9,.94));transform:translateY(-1px)}
#menu.m19 .mi:hover .ic19,#menu.m19 .mi:focus-visible .ic19{color:var(--apple-hi)}
#menu.m19 .mi .pb19{position:absolute;left:0;right:0;bottom:0;display:block;height:3px;background:rgba(236,226,212,.08);overflow:hidden}
#menu.m19 .mi .pb19 i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--apple),var(--toffee))}
#menu.m19 .mi.set19{display:flex;align-items:center;gap:10px;min-height:42px;padding:0 12px;border-radius:3px;background:rgba(12,9,8,.82);border:1px solid rgba(236,226,212,.11)}
#menu.m19 .mi.set19 .ic19{position:static;width:17px;height:17px}
#menu.m19 .mi.set19 .ml{font:700 13px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);transform:none}
#menu.m19 .mi.set19 small{margin:0 0 0 auto;font:600 10px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#menu.m19 .mi.set19:hover,#menu.m19 .mi.set19:focus-visible{border-color:rgba(236,226,212,.35)}
#menu.m19 .mi.set19:hover .ml{color:var(--ink)}
#menu.m19 .ms19{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));margin-top:2px;padding-top:9px;border-top:1px solid rgba(236,226,212,.1)}
#menu.m19 .ms19 div{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;border-left:1px solid rgba(236,226,212,.08)}
#menu.m19 .ms19 div:first-child{border-left:0}
#menu.m19 .ms19 b{font:700 18px/1 var(--ui);font-variant-numeric:tabular-nums;color:var(--ink)}
#menu.m19 .ms19 b.z{color:var(--faint)}
#menu.m19 .ms19 span{font:600 9.5px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
@media (min-aspect-ratio:20/21){#menu.m19 .menu-list{width:min(100%,380px)}}
@media (min-aspect-ratio:20/21) and (max-height:560px){
  #menu.m19 .menu-list{gap:6px;width:min(100%,400px)}
  #menu.m19 .mi.play{min-height:56px;padding:7px 10px;grid-template-columns:36px minmax(0,1fr) auto;column-gap:10px}
  #menu.m19 .mi.play .pi19{width:36px;height:36px}
  #menu.m19 .mi.play .ml{font-size:28px}
  #menu.m19 .mi.play .pf19{width:42px;height:42px}#menu.m19 .mi.play .pf19 canvas{width:38px;height:38px}
  #menu.m19 .mg19{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
  #menu.m19 .mg19 .mi{min-height:46px;padding:7px 8px}
  #menu.m19 .mg19 .mi .ml{font-size:clamp(12px,1.55vw,16px)}
  #menu.m19 .mi.play small{display:block}
  #menu.m19 .mi.new::after,#menu.m19 .mi.newst::after{top:4px;left:auto;right:4px;padding:2px 4px;font-size:9px}
  #menu.m19 .mg19 .mi small,#menu.m19 .mg19 .mi .ic19,#menu.m19 .mg19 .mi .cf{display:none}
  #menu.m19 .mi.set19{min-height:32px}
  #menu.m19 .ms19{display:none}
}
@media (max-height:700px) and (max-aspect-ratio:20/21){
  #menu.m19 .tag{display:none}
  #menu.m19 .mg19 .mi{min-height:60px}
  #menu.m19 .mg19 .mi .ic19{display:none}
  #menu.m19 .mi.play{min-height:68px}
}
@media (prefers-reduced-motion:reduce){#menu.m19 .mi.play::before{animation:none;display:none}}

/* ---------- Custom Run: red Reset all ---------- */
.cust10 .c10pre button.rst19{color:#ff8494;background:linear-gradient(180deg,rgba(215,38,61,.2),rgba(215,38,61,.08));box-shadow:inset 0 -2px 0 var(--apple);display:flex;align-items:center;justify-content:center;gap:5px}
.cust10 .c10pre button.rst19 svg{width:12px;height:12px;flex:none}
.cust10 .c10pre button.rst19:hover{color:#fff4ec;background:linear-gradient(180deg,rgba(215,38,61,.42),rgba(215,38,61,.2))}
.cust10 .c10pre button.rst19.arm19{color:#fff4ec;background:var(--apple);box-shadow:none}

/* ---------- custom dropdowns ---------- */
.dd19{position:relative;min-width:0;width:100%}
.dd19>select{position:absolute!important;inset:0;width:100%;height:100%;opacity:0;pointer-events:none}
.dd19 .ddb19{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto minmax(0,1fr) 12px;align-items:center;gap:8px;width:100%;height:34px;padding:0 9px 0 4px;
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:2px;color:var(--ink);font:600 13px/1 var(--ui);letter-spacing:.02em;
  transition:border-color .12s,background .12s}
.dd19 .ddb19:hover{border-color:rgba(236,226,212,.4)}
.dd19 .ddb19:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.dd19 .ddb19[aria-expanded="true"]{border-color:var(--apple);background:rgba(215,38,61,.1)}
.dd19 .ddb19[disabled]{opacity:.4;cursor:default}
.dd19 .ddb19 .t19{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dd19 .ddb19 .t19 em{font-style:normal;color:var(--faint);font-weight:600;margin-right:4px}
.dd19 .ddb19 .cv19{display:block;border-radius:2px}
.dd19 .ddb19>svg{width:12px;height:12px;color:var(--faint);transition:transform .15s}
.dd19 .ddb19[aria-expanded="true"]>svg{transform:rotate(180deg);color:var(--apple-hi)}
.ddp19{position:fixed;z-index:60;display:flex;flex-direction:column;background:#120d0b;border:1px solid rgba(236,226,212,.24);border-radius:3px;box-shadow:0 18px 50px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.5);overflow:hidden;
  animation:ddIn19 .12s ease both;font-family:var(--ui)}
@keyframes ddIn19{from{opacity:0;transform:translateY(-4px)}}
.ddp19.up{animation-name:ddUp19}@keyframes ddUp19{from{opacity:0;transform:translateY(4px)}}
.ddp19 .dds19{all:unset;box-sizing:border-box;margin:6px 6px 2px;height:32px;padding:0 9px;background:#0a0706;border:1px solid var(--line);border-radius:2px;color:var(--ink);font:500 14px/1 var(--ui);-webkit-user-select:text;user-select:text}
.ddp19 .dds19:focus{border-color:var(--toffee)}
.ddp19 .ddh19{padding:6px 10px 2px;font:700 10px/1 var(--ui);letter-spacing:.18em;text-transform:uppercase;color:var(--apple-hi)}
.ddp19 ul{list-style:none;margin:0;padding:4px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.ddp19 li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;padding:4px 8px 4px 4px;min-height:34px;border-radius:2px;cursor:pointer;color:var(--ink);font:600 13px/1.15 var(--ui)}
.ddp19 li .n19{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ddp19 li .k19{font:700 9.5px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;padding:3px 5px;border-radius:2px}
.ddp19 li .k19.cl{color:#ff9a7a;border:1px solid rgba(255,122,90,.45)}
.ddp19 li .k19.lg{color:#ffb44a;border:1px solid rgba(255,180,74,.45)}
.ddp19 li .k19.ok{color:var(--toffee);border:0;padding:0;font-size:14px;letter-spacing:0}
.ddp19 li:hover,.ddp19 li.f19{background:rgba(236,226,212,.07)}
.ddp19 li[aria-selected="true"]{background:rgba(215,38,61,.2);color:#fff4ec}
.ddp19 li[aria-disabled="true"]{cursor:default;color:var(--faint)}
.ddp19 li[aria-disabled="true"] canvas{opacity:.35}
.ddp19 li .cv19{display:block;border-radius:2px}
.ddp19 .dde19{padding:12px 10px;font-size:13px;color:var(--faint);text-align:center}
.cust10 .c10it{grid-template-columns:minmax(0,1fr)!important}
.cust10 .c10it>canvas{display:none!important}
.cust10 .c10it small{grid-column:1!important;margin-top:0!important;padding-left:2px}
.cust10 li.c10s .dd19.fl,.cust10 li.c10s .dd19.bs{min-width:0}

/* ---------- Pick your apple ---------- */
#chars .sheet-head{flex-wrap:nowrap;align-items:center}
#chars .sheet-head h2{font-size:clamp(34px,10vw,64px)}
#chars .sheet-head .btn{flex:none}
#charList.charlist{grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}
#charList .ccard{padding:0;gap:0;overflow:hidden;border-radius:3px;display:flex;flex-direction:column;border-color:var(--edge15,var(--line));
  background:linear-gradient(180deg,var(--tint15,rgba(255,255,255,.02)),rgba(12,9,8,.6) 70%)}
#charList .ccard canvas{width:100%;height:118px;border-radius:0;border-bottom:1px solid rgba(236,226,212,.08)}
#charList .ccard .cn{padding:9px 11px 0;display:flex;flex-direction:column;align-items:flex-start;gap:4px}
#charList .ccard b{font-size:21px;line-height:1}
#charList .ccard .tagl{font-size:9.5px;letter-spacing:.18em}
#charList .ccard.on{border-color:var(--toffee);box-shadow:0 0 0 1px var(--toffee),0 10px 30px rgba(227,165,74,.14)}
#charList .ccard.on::before{content:"\\2713  Selected";position:absolute;top:7px;left:7px;z-index:1;background:var(--toffee);color:#1a1006;font:700 10px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;padding:4px 6px;border-radius:2px}
#charList .ccard.on .tagl{display:none}
#charList .ccard .cd{padding:5px 11px 0;font-size:13px;line-height:1.28;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#charList .ccard .bars{padding:8px 11px 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px}
#charList .ccard .bars div{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 4px;gap:3px 4px;align-items:end}
#charList .ccard .bars dt{grid-column:1;grid-row:1;font-size:9.5px;letter-spacing:.1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#charList .ccard .bars span{grid-column:2;grid-row:1;font-size:12px}
#charList .ccard .bars dd{grid-column:1/3;grid-row:2;height:4px}
#charList .ccard .perk{padding:8px 11px 11px;margin:auto 0 0;font-size:12px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:0}
#charList .ccard .perk:empty{padding:4px 0 0}
#charList .ccard .lock{margin:8px 11px 11px;font-size:12px;padding:7px 8px}
#charList .ccard.locked .perk{display:none}
@media (max-width:520px){
  #charList.charlist{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  #charList .ccard canvas{height:104px}
  #charList .ccard b{font-size:19px}
  #charList .ccard .cd{font-size:12px}
  #chars .sheet-inner{gap:16px}
}

/* ---------- Rooms tab: little rooms in their own color ---------- */
#how #tab-rooms ul.rooms19{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;border:0!important;background:none!important;padding:0!important;box-shadow:none!important}
#how #tab-rooms ul.rooms19>li.rm19{--rc:#a69688;position:relative;display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;align-items:start;padding:11px 12px 11px 11px;margin:0;
  border:1px solid color-mix(in srgb,var(--rc) 30%,transparent);border-radius:3px;
  background:radial-gradient(130% 120% at 0% 0%,color-mix(in srgb,var(--rc) 14%,transparent),transparent 60%),linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,0,0,.15))}
#how #tab-rooms ul.rooms19>li.rm19::before{content:"";position:absolute;left:-1px;right:-1px;top:-1px;height:3px;border-radius:3px 3px 0 0;
  background:linear-gradient(90deg,color-mix(in srgb,var(--rc) 55%,transparent) 0 40%,transparent 40% 60%,color-mix(in srgb,var(--rc) 55%,transparent) 60%)}
#how #tab-rooms ul.rooms19>li.rm19::after{content:"";position:absolute;top:-2px;left:calc(40% - 3px);width:calc(20% + 6px);height:5px;
  background:linear-gradient(90deg,var(--rc) 0 6px,transparent 6px calc(100% - 6px),var(--rc) calc(100% - 6px));box-shadow:0 0 10px color-mix(in srgb,var(--rc) 60%,transparent);border-radius:1px}
#how #tab-rooms .rm19 svg.art19{width:64px;height:56px;display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))}
#how #tab-rooms .rm19 .tx19{display:flex;flex-direction:column;gap:4px;min-width:0;padding-top:2px}
#how #tab-rooms .rm19 .tx19 b{font:800 21px/1 var(--display);letter-spacing:.01em;color:color-mix(in srgb,var(--rc) 45%,#fff4ec)}
#how #tab-rooms .rm19 .tx19 span{font-size:14px;line-height:1.32;color:var(--muted)}
#how #tab-rooms .rm19 .tg19{display:inline-flex;align-self:flex-start;font:700 9.5px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb,var(--rc) 70%,#fff);
  border:1px solid color-mix(in srgb,var(--rc) 40%,transparent);padding:3px 5px;border-radius:2px;margin-top:2px}
#how #tab-rooms .sec11>h3{display:flex;align-items:center;gap:10px}
#how #tab-rooms .sec11>h3::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(232,58,80,.4),transparent)}
#how #tab-rooms .sec11>h3 small{font:600 11px/1 var(--ui);letter-spacing:.1em;color:var(--faint);text-transform:none}
@media (max-width:420px){#how #tab-rooms ul.rooms19>li.rm19{grid-template-columns:54px minmax(0,1fr);gap:10px}#how #tab-rooms .rm19 svg.art19{width:54px;height:48px}#how #tab-rooms .rm19 .tx19 b{font-size:19px}#how #tab-rooms .rm19 .tx19 span{font-size:13.5px}}

/* ---------- Modes tab: mode cards and a difficulty ladder ---------- */
#how #tab-modes .modes19{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px}
#how #tab-modes .mc19{--mc:#e83a50;position:relative;display:grid;grid-template-columns:76px minmax(0,1fr);gap:0;border:1px solid color-mix(in srgb,var(--mc) 32%,transparent);border-radius:3px;overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,0,0,.18))}
#how #tab-modes .mc19 .em19{position:relative;display:grid;place-items:center;align-content:center;gap:6px;padding:12px 0;
  background:radial-gradient(90% 70% at 50% 35%,color-mix(in srgb,var(--mc) 34%,transparent),transparent 75%),repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 12px),repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 1px,transparent 1px 12px),#120d0b;
  border-right:1px solid color-mix(in srgb,var(--mc) 30%,transparent)}
#how #tab-modes .mc19 .em19 svg{width:34px;height:34px;color:color-mix(in srgb,var(--mc) 70%,#fff);filter:drop-shadow(0 0 10px color-mix(in srgb,var(--mc) 60%,transparent))}
#how #tab-modes .mc19 .em19 i{font:700 9px/1 var(--ui);font-style:normal;letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb,var(--mc) 65%,#fff);opacity:.8}
#how #tab-modes .mc19 .bd19{display:flex;flex-direction:column;gap:6px;padding:11px 12px 12px;min-width:0}
#how #tab-modes .mc19 .bd19 b{font:800 23px/1 var(--display);color:#fff4ec;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
#how #tab-modes .mc19 .bd19 b em{font:700 9.5px/1 var(--ui);font-style:normal;letter-spacing:.16em;text-transform:uppercase;color:#1a1006;background:var(--toffee);padding:3px 5px;border-radius:2px}
#how #tab-modes .mc19 .bd19 p{margin:0;font-size:14px;line-height:1.33;color:var(--muted)}
#how #tab-modes .mc19 .ch19{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
#how #tab-modes .mc19 .ch19 span{font:700 10px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;padding:4px 6px;border-radius:2px;color:color-mix(in srgb,var(--mc) 60%,#fff);background:color-mix(in srgb,var(--mc) 12%,transparent);border:1px solid color-mix(in srgb,var(--mc) 30%,transparent)}
#how #tab-modes .mc19.on{border-color:var(--toffee);box-shadow:0 0 0 1px rgba(227,165,74,.5)}
#how #tab-modes .ladder19{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
#how #tab-modes .dl19{--dc:#4ac05a;display:flex;flex-direction:column;gap:7px;padding:11px 11px 12px;border:1px solid color-mix(in srgb,var(--dc) 30%,transparent);border-radius:3px;position:relative;overflow:hidden;
  background:linear-gradient(180deg,color-mix(in srgb,var(--dc) 13%,transparent),rgba(0,0,0,.15) 70%)}
#how #tab-modes .dl19::before{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--dc);opacity:.75}
#how #tab-modes .dl19 .sk19{display:flex;gap:4px}
#how #tab-modes .dl19 .sk19 i{width:9px;height:9px;border-radius:50%;background:rgba(236,226,212,.12)}
#how #tab-modes .dl19 .sk19 i.f{background:var(--dc);box-shadow:0 0 6px color-mix(in srgb,var(--dc) 70%,transparent)}
#how #tab-modes .dl19 b{font:800 21px/1 var(--display);color:color-mix(in srgb,var(--dc) 40%,#fff4ec)}
#how #tab-modes .dl19 span{font-size:13px;line-height:1.3;color:var(--muted)}
#how #tab-modes .dl19.on{box-shadow:0 0 0 1px var(--toffee);border-color:var(--toffee)}
#how #tab-modes .dl19.on b::after{content:"Current";margin-left:6px;font:700 9px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:#1a1006;background:var(--toffee);padding:3px 4px;border-radius:2px;vertical-align:4px}
@media (max-width:620px){#how #tab-modes .ladder19{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:420px){#how #tab-modes .modes19{grid-template-columns:minmax(0,1fr)}#how #tab-modes .mc19{grid-template-columns:64px minmax(0,1fr)}#how #tab-modes .mc19 .em19 svg{width:28px;height:28px}#how #tab-modes .mc19 .bd19 b{font-size:21px}}
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const SV = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;

  /* ================================================================ 1. the start menu */
  safe(() => {
    const menu = $('menu'), nav = menu && menu.querySelector('.menu-list');
    if (!nav) return;
    const B = (id) => $(id);
    const bPlay = B('btnPlay'), bStory = B('btnStory'), bChar = B('btnChar'), bAch = B('btnAch'), bHow = B('btnHow'), bSet = B('btnSet');
    if (!bPlay || !bStory || !bChar || !bAch || !bHow || !bSet) return;
    menu.classList.add('m19');
    const ic = (b, svg) => { const s = document.createElement('span'); s.className = 'ic19'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = svg; b.appendChild(s); return s; };
    // the hero: a play button with your apple on it
    const pi = document.createElement('span'); pi.className = 'pi19'; pi.setAttribute('aria-hidden', 'true');
    pi.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 1.8v12.4L13.6 8z" fill="#fff4ec"/></svg>';
    bPlay.insertBefore(pi, bPlay.firstChild);
    const pf = document.createElement('span'); pf.className = 'pf19'; pf.setAttribute('aria-hidden', 'true');
    const pcv = document.createElement('canvas'); pcv.id = 'playFace19'; pf.appendChild(pcv); bPlay.appendChild(pf);
    // the tiles
    const grid = document.createElement('div'); grid.className = 'mg19';
    ic(bStory, SV('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>'));
    ic(bAch, SV('<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20h7M10 17h4"/>'));
    ic(bHow, SV('<rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.6v.4"/><circle cx="12" cy="16.7" r=".6" fill="currentColor"/>'));
    const pb = document.createElement('span'); pb.className = 'pb19'; pb.setAttribute('aria-hidden', 'true'); pb.innerHTML = '<i></i>'; bAch.appendChild(pb);
    grid.append(bStory, bChar, bAch, bHow);
    bSet.classList.add('set19');
    const gear = ic(bSet, SV('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'));
    bSet.insertBefore(gear, bSet.querySelector('.ml'));
    const stats = document.createElement('div'); stats.className = 'ms19'; stats.id = 'menuStats19'; stats.setAttribute('aria-label', 'Your best');
    nav.append(bPlay, grid, bSet, stats);

    function paintMenu19() {
      const D = Save.data, b = D.best || {}, S = D.stats || {};
      const cells = [['Deepest floor', b.level || 0], b.endless > 0 ? ['Endless', b.endless] : null, ['Snakes', S.kills || b.kills || 0], ['Escapes', S.wins || b.wins || 0]].filter(Boolean);
      stats.style.setProperty('--n', cells.length);
      stats.innerHTML = cells.map(([k, v]) => `<div><b class="${v ? '' : 'z'}">${esc(v)}</b><span>${esc(say(k))}</span></div>`).join('');
      const done = Meta.done(), all = ACHS.length; pb.firstChild.style.width = `${Math.round((done / Math.max(1, all)) * 100)}%`;
      if (typeof paintChar === 'function') paintChar(pcv, D.char || 'apple', false, { face: true });
      const sn = $('setNow'); if (sn) sn.textContent = sn.textContent.replace(/, aim assist (on|off)/, '');
    }
    const rf = UI.refresh;
    UI.refresh = function () { const r = rf.apply(this, arguments); safe(paintMenu19); return r; };
    paintMenu19();
    window.__bitten = Object.assign(window.__bitten || {}, { paintMenu19 });
  });

  /* ================================================================ 2. Custom Run: red Reset all, armed on the first tap */
  safe(() => {
    const pre = $('c10pre'); if (!pre) return;
    const btn = [...pre.querySelectorAll('button')].find((b) => /reset/i.test(b.title || b.textContent)); if (!btn) return;
    const label = btn.textContent;
    btn.classList.add('rst19');
    const icon = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7a4.5 4.5 0 1 0 1.4-3.3M2.5 1.8v2.4h2.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const show = (t) => { btn.innerHTML = icon + `<span>${esc(t)}</span>`; };
    show(label);
    let armT = 0;
    const disarm = () => { clearTimeout(armT); armT = 0; btn.classList.remove('arm19'); show(label); };
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('arm19')) { disarm(); return; } // second tap: let the reset through
      e.stopImmediatePropagation(); e.preventDefault();
      btn.classList.add('arm19'); show(say('Tap again')); Sfx.blip && Sfx.blip();
      armT = setTimeout(disarm, 2600);
    }, true);
  });

  /* ================================================================ 3. custom dropdowns with icons */
  const ICONS = new Map();
  function iconCanvas(key, w, h, draw) {
    const d = DPR(), k = key + '@' + w + 'x' + h;
    let src = ICONS.get(k);
    if (!src) {
      src = document.createElement('canvas'); src.width = Math.round(w * d); src.height = Math.round(h * d);
      const c = src.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
      safe(() => draw(c, w, h, src));
      ICONS.set(k, src);
    }
    const cv = document.createElement('canvas'); cv.className = 'cv19'; cv.width = src.width; cv.height = src.height;
    cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.setAttribute('aria-hidden', 'true');
    cv.getContext('2d').drawImage(src, 0, 0);
    return cv;
  }
  const C10 = () => (window.__bitten && window.__bitten.cust10) || {};
  function floorIcon(set) {
    return iconCanvas('f:' + set, 26, 26, (c, w, h) => {
      const base = (C10().floorBase && C10().floorBase(set)) || (typeof LEVELS !== 'undefined' && LEVELS[0]) || {};
      const wall = base.wall || '#3a2c22', hi = base.wallHi || '#5a4431', f1 = base.floor || '#2c221b', f2 = base.floor2 || f1, gr = base.grout || '#17110d';
      c.fillStyle = base.void || '#0b0807'; c.fillRect(0, 0, w, h);
      c.fillStyle = wall; c.fillRect(1, 1, w - 2, h - 2);
      c.fillStyle = hi; c.fillRect(1, 1, w - 2, 2);
      const x0 = 4, y0 = 4, s = (w - 8) / 3;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { c.fillStyle = (r + q) % 2 ? f2 : f1; c.fillRect(x0 + q * s, y0 + r * s, s, s); }
      c.strokeStyle = gr; c.lineWidth = 0.6;
      for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x0 + i * s, y0); c.lineTo(x0 + i * s, h - 4); c.moveTo(x0, y0 + i * s); c.lineTo(w - 4, y0 + i * s); c.stroke(); }
      c.fillStyle = f1; c.fillRect(w / 2 - 3, 0, 6, 4);
      c.fillStyle = hi; c.fillRect(w / 2 - 5, 0, 2, 4); c.fillRect(w / 2 + 3, 0, 2, 4);
      c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1);
    });
  }
  const BOSS_SNAKE = { pricewar: 'pwblue,pwyellow' };
  function bossKinds(k) {
    if (BOSS_SNAKE[k]) return BOSS_SNAKE[k];
    if (typeof KINDS !== 'undefined' && KINDS[k]) return k;
    const nm = BOSS_INFO[k] && BOSS_INFO[k].title;
    if (nm) for (const f of document.querySelectorAll('#tab-snakes figure')) { const b = f.querySelector('b'), cv = f.querySelector('canvas[data-snake]'); if (b && cv && b.textContent.trim() === nm) return cv.dataset.snake; }
    return null;
  }
  function bossIcon(k) {
    return iconCanvas('b:' + k, 40, 26, (c, w, h, src) => {
      const kinds = bossKinds(k);
      let ok = false;
      if (kinds && typeof paintBestiary === 'function') {
        const tmp = document.createElement('canvas'); tmp.dataset.snake = kinds;
        tmp.style.cssText = 'position:fixed;left:-999px;top:0;width:80px;height:52px'; document.body.appendChild(tmp);
        ok = safe(() => { paintBestiary({ querySelectorAll: (q) => (q === 'canvas[data-snake]' ? [tmp] : []) }); c.drawImage(tmp, 0, 0, w, h); return true; }, false);
        tmp.remove();
      }
      if (!ok) {
        c.fillStyle = '#1a1210'; c.fillRect(0, 0, w, h);
        c.strokeStyle = '#e3a54a'; c.lineWidth = 1.6; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(w / 2 - 8, h / 2 + 5); c.lineTo(w / 2 - 9, h / 2 - 4); c.lineTo(w / 2 - 4, h / 2); c.lineTo(w / 2, h / 2 - 6); c.lineTo(w / 2 + 4, h / 2); c.lineTo(w / 2 + 9, h / 2 - 4); c.lineTo(w / 2 + 8, h / 2 + 5); c.closePath(); c.stroke();
      }
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1);
    });
  }
  function itemIcon(id) {
    return iconCanvas('i:' + id, 26, 26, (c, w, h) => {
      const rare = ITEMS[id] && ITEMS[id].rare;
      c.fillStyle = rare ? 'rgba(255,170,60,.14)' : 'rgba(227,165,74,.07)'; c.fillRect(0, 0, w, h);
      c.strokeStyle = rare ? 'rgba(255,180,70,.7)' : 'rgba(236,226,212,.18)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1);
      if (id) { c.save(); c.translate(w / 2, h / 2); drawItemIcon(c, id, 20, 1); c.restore(); }
    });
  }
  function emptyIcon(w = 26, h = 26) {
    return iconCanvas('e:' + w, w, h, (c) => { c.setLineDash([2, 2]); c.strokeStyle = 'rgba(236,226,212,.3)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1); c.setLineDash([]); c.strokeStyle = 'rgba(236,226,212,.35)'; c.beginPath(); c.moveTo(w / 2, h / 2 - 4); c.lineTo(w / 2, h / 2 + 4); c.moveTo(w / 2 - 4, h / 2); c.lineTo(w / 2 + 4, h / 2); c.stroke(); });
  }
  // what a select holds, for the menu
  function readOpt(sel, o, kind) {
    let txt = o.textContent, clash = / \(clash\)$/.test(txt), rare = / ★/.test(txt);
    txt = txt.replace(/ \(clash\)$/, '').replace(/ ★/, '');
    let pre = '';
    const m = txt.match(/^(Boss): (.*)$/); if (m) { pre = say('Floor boss'); txt = m[2]; }
    let icon = null, iconKey = o.value;
    if (kind === 'floor') icon = () => floorIcon(o.value);
    else if (kind === 'boss') {
      let k = o.value;
      if (k === 'auto') { const li = sel.closest('li'), fl = li && li.querySelector('select.fl,.dd19.fl select'); const base = fl && C10().floorBase && C10().floorBase(fl.value); k = base && base.boss; iconKey = 'auto:' + k; }
      icon = () => (k ? bossIcon(k) : emptyIcon(40, 26));
    } else if (kind === 'plain') icon = () => { const i = document.createElement('i'); i.className = 'pl19'; return i; };
    else icon = () => (o.value ? itemIcon(o.value) : emptyIcon());
    return { v: o.value, txt, pre, clash, rare, dis: o.disabled, sel: o.selected, icon, iconKey };
  }
  const caret = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  let OPEN = null;
  function closeDD(focusBack) {
    if (!OPEN) return;
    const o = OPEN; OPEN = null;
    o.pop.remove(); o.btn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('resize', o.off); document.removeEventListener('pointerdown', o.outside, true);
    const sc = document.getElementById('play'); if (sc) sc.removeEventListener('scroll', o.off);
    if (focusBack) o.btn.focus({ preventScroll: true });
  }
  function enhance(sel) {
    if (sel._dd19 || !sel.closest('.cust10, #admin23')) return;
    const kind = sel.classList.contains('fl') ? 'floor' : sel.classList.contains('bs') ? 'boss' : sel.classList.contains('pl') ? 'plain' : 'item';
    const wrap = document.createElement('div'); wrap.className = 'dd19 ' + (kind === 'floor' ? 'fl' : kind === 'boss' ? 'bs' : 'it');
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.classList.remove('fl', 'bs'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ddb19';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', sel.getAttribute('aria-label') || '');
    wrap.appendChild(btn);
    sel._dd19 = { wrap, btn, kind };
    const paintBtn = () => {
      const o = sel.options[sel.selectedIndex] || sel.options[0]; if (!o) return;
      const d = readOpt(sel, o, kind);
      btn.innerHTML = '';
      btn.appendChild(d.icon());
      const t = document.createElement('span'); t.className = 't19'; t.textContent = d.txt; btn.appendChild(t);
      btn.insertAdjacentHTML('beforeend', caret);
      btn.disabled = sel.disabled; btn.title = kind === 'item' && ITEMS[o.value] ? ITEMS[o.value].desc : d.txt;
    };
    paintBtn();
    sel.addEventListener('change', paintBtn);
    btn.addEventListener('click', () => (OPEN && OPEN.sel === sel ? closeDD(true) : openDD(sel)));
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openDD(sel); } });
  }
  function openDD(sel) {
    closeDD(false);
    const { btn, kind } = sel._dd19; if (btn.disabled) return;
    const opts = [...sel.options].map((o) => readOpt(sel, o, kind));
    const pop = document.createElement('div'); pop.className = 'ddp19'; pop.setAttribute('role', 'presentation');
    let search = null;
    if ((kind === 'item' || sel.dataset.q) && opts.length > 10) {
      search = document.createElement('input'); search.type = 'search'; search.className = 'dds19'; search.placeholder = say(sel.dataset.q || 'Search powerups'); search.setAttribute('aria-label', say(sel.dataset.q || 'Search powerups')); search.autocomplete = 'off';
      pop.appendChild(search);
    }
    const ul = document.createElement('ul'); ul.setAttribute('role', 'listbox'); ul.setAttribute('aria-label', btn.getAttribute('aria-label')); pop.appendChild(ul);
    const items = [];
    for (const d of opts) {
      const li = document.createElement('li'); li.setAttribute('role', 'option'); li.tabIndex = -1;
      li.setAttribute('aria-selected', String(d.sel)); if (d.dis) li.setAttribute('aria-disabled', 'true');
      li.appendChild(d.icon());
      const n = document.createElement('span'); n.className = 'n19'; n.textContent = d.txt; li.appendChild(n);
      const k = document.createElement('span'); k.className = 'k19';
      if (d.sel) { k.classList.add('ok'); k.textContent = '✓'; } else if (d.clash) { k.classList.add('cl'); k.textContent = say('Clash'); } else if (d.rare) { k.classList.add('lg'); k.textContent = say('Legend'); } else if (d.pre) { k.classList.add('lg'); k.textContent = say('Home'); }
      if (k.textContent) li.appendChild(k);
      if (kind === 'item' && ITEMS[d.v]) li.title = ITEMS[d.v].desc;
      li.addEventListener('click', () => pickOpt(d, li));
      li._d = d; li._name = (d.txt + ' ' + d.pre).toLowerCase();
      ul.appendChild(li); items.push(li);
    }
    function pickOpt(d) {
      if (d.dis) { Sfx.thud && Sfx.thud(); return; }
      const changed = sel.value !== d.v;
      closeDD(true);
      if (changed) { sel.value = d.v; sel.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    let empty = null;
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase(); let n = 0;
        for (const li of items) { const show = !q || li._name.includes(q) || !li._d.v; li.hidden = !show; if (show) n++; }
        if (!empty) { empty = document.createElement('p'); empty.className = 'dde19'; empty.textContent = say('Nothing found'); pop.appendChild(empty); }
        empty.hidden = n > 0;
      });
    }
    document.body.appendChild(pop);
    // place it under the button, or above when there is no room; follows the button when the sheet scrolls
    const place = () => {
      const r = btn.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) { closeDD(false); return; }
      const w = Math.min(vw - 16, Math.max(r.width, kind === 'item' ? 280 : 240));
      const below = vh - r.bottom - 10, above = r.top - 10, up = below < 240 && above > below;
      const maxH = Math.max(150, Math.min(340, up ? above : below));
      pop.style.width = w + 'px'; pop.style.left = Math.max(8, Math.min(r.left, vw - w - 8)) + 'px';
      pop.style.maxHeight = maxH + 'px'; ul.style.maxHeight = (maxH - (search ? 44 : 0)) + 'px';
      pop.classList.toggle('up', up);
      if (up) { pop.style.top = ''; pop.style.bottom = (vh - r.top + 4) + 'px'; } else { pop.style.bottom = ''; pop.style.top = (r.bottom + 4) + 'px'; }
    };
    place();
    btn.setAttribute('aria-expanded', 'true');
    const off = () => (OPEN && OPEN.pop === pop ? place() : null);
    const outside = (e) => { if (!pop.contains(e.target) && !btn.contains(e.target)) closeDD(false); };
    OPEN = { sel, btn, pop, off, outside };
    window.addEventListener('resize', off); document.addEventListener('pointerdown', outside, true);
    const sc = document.getElementById('play'); if (sc) sc.addEventListener('scroll', off, { passive: true });
    const cur = items.find((li) => li.getAttribute('aria-selected') === 'true') || items[0];
    if (cur) { cur.scrollIntoView({ block: 'nearest' }); }
    const vis = () => items.filter((li) => !li.hidden && li.getAttribute('aria-disabled') !== 'true');
    const focusLi = (li) => { for (const x of items) x.classList.remove('f19'); if (li) { li.classList.add('f19'); li.focus({ preventScroll: true }); li.scrollIntoView({ block: 'nearest' }); } };
    if (search && !COARSE) search.focus(); else focusLi(cur && cur.getAttribute('aria-disabled') !== 'true' ? cur : vis()[0]);
    pop.addEventListener('keydown', (e) => {
      const v = vis(), at = v.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDD(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); focusLi(v[Math.min(v.length - 1, at + 1)] || v[0]); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (at <= 0 && search) search.focus(); else focusLi(v[Math.max(0, at - 1)]); }
      else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement._d) { e.preventDefault(); pickOpt(document.activeElement._d); }
      else if (e.key === 'Enter' && document.activeElement === search && v[0]) { e.preventDefault(); pickOpt(v[0]._d); }
      else if (e.key === 'Tab') closeDD(false);
    });
  }
  safe(() => {
    const box = $('cust10'); if (!box) return;
    const scan = () => { for (const s of box.querySelectorAll('select')) safe(() => enhance(s)); };
    new MutationObserver(scan).observe(box, { childList: true, subtree: true });
    scan();
    const ph = UI.hide;
    if (ph) UI.hide = function () { safe(() => closeDD(false)); return ph.apply(this, arguments); };
    window.__bitten = Object.assign(window.__bitten || {}, { dd19: { open: openDD, close: closeDD, enhance } });
  });

  /* ================================================================ 4. Rooms tab: every room drawn as a little room */
  const ROOM_ART = {
    shop: '<path d="M-6-3h12l-1 9h-10z"/><path d="M-3-3v-2a3 3 0 0 1 6 0v2"/>',
    tank: '<rect x="-6" y="-6" width="8" height="13" rx="1"/><path d="M-4-3h4M2-3l3 2v6a1.5 1.5 0 0 0 3 0V-1L6-4"/>',
    gym: '<path d="M-5 0h10"/><rect x="-8" y="-4" width="3" height="8" rx=".6"/><rect x="5" y="-4" width="3" height="8" rx=".6"/><path d="M-9.5-2v4M9.5-2v4"/>',
    kapper: '<circle cx="-4" cy="4" r="2.4"/><circle cx="4" cy="4" r="2.4"/><path d="M-2.4 2.3 5-6M2.4 2.3-5-6"/>',
    slot: '<rect x="-7" y="-6" width="12" height="12" rx="1.5"/><path d="M-3-6v12M1-6v12"/><path d="M5-3h2v-3"/><circle cx="7" cy="-7" r="1" fill="currentColor"/>',
    spring: '<path d="M0-7c-3 4-5 6-5 9a5 5 0 0 0 10 0c0-3-2-5-5-9z"/><path d="M-2 3a2 2 0 0 0 2 2"/>',
    calm: '<path d="M3-6a6 6 0 1 0 4 9A5 5 0 0 1 3-6z"/><path d="M-5-5v2M-6-4h2"/>',
    chest: '<rect x="-7" y="-3" width="14" height="9" rx="1"/><path d="M-7-3a7 4 0 0 1 14 0M-7 1h14"/><rect x="-1.5" y="-.5" width="3" height="3" fill="currentColor"/>',
    pantry: '<rect x="-5" y="-4" width="10" height="11" rx="2"/><path d="M-4-4v-2h8v2M-5 1h10"/>',
    offering: '<path d="M-6 6h12M-4 6V1h8v5"/><path d="M0 1c-2-2-2-4 0-7 2 3 2 5 0 7z"/>',
    books: '<path d="M-7-5h5v12h-5zM-2-5h4v12h-4zM3-4l3.5-1 3 11.5-3.5 1z"/>',
    vote: '<path d="M-6-1h12v8H-6z"/><path d="M-3-1v-5h6v5M-2 3h4"/>',
    court: '<path d="M-6-5 1 2M-3-8 4-1"/><path d="M-4.5-6.5 2.5.5" stroke-width="3.5"/><path d="M1 2 6 7M-7 7h8"/>',
    vault: '<circle cx="-3" cy="0" r="4"/><path d="M1 0h7M5 0v3M8 0v2"/><circle cx="-3" cy="0" r="1.3" fill="currentColor"/>',
    challenge: '<path d="M-7-7 5 5M7-7-5 5M3 7l4-4M-3 7l-4-4"/>',
    secret: '<path d="M-7-7h14v14h-14z"/><path d="M-1-7 1-2-2 1 1 4 0 7"/>',
    mini: '<path d="M-7 5V-4l3.5 3L0-6l3.5 5L7-4v9z"/><path d="M-7 5h14"/>',
    survival: '<path d="M-5-7h10M-5 7h10M-4-7c0 5 8 5 8 7s-8 2-8 7M4-7c0 5-8 5-8 7"/>',
    club: '<path d="M-3 5V-6l9-2v11"/><circle cx="-5" cy="5" r="2.3"/><circle cx="4" cy="3" r="2.3"/>',
    hell: '<path d="M-6-7c1 3 3 4 3 4M6-7c-1 3-3 4-3 4"/><path d="M0 7c-4 0-6-3-5-6 1 1 2 1 2 1 0-3 1-5 3-7 0 3 3 4 3 7 0 0 1-.5 1.5-1.5C5.5 4 4 7 0 7z"/>',
    portal: '<ellipse cx="0" cy="0" rx="5" ry="8"/><ellipse cx="0" cy="0" rx="2.4" ry="4.6"/>',
    clown: '<circle cx="0" cy="0" r="7"/><circle cx="0" cy="1" r="2" fill="currentColor"/><path d="M-4 4a5 3 0 0 0 8 0"/><circle cx="-2.5" cy="-3" r=".8" fill="currentColor"/><circle cx="2.5" cy="-3" r=".8" fill="currentColor"/>',
    ghost: '<path d="M-6 7V-1a6 6 0 0 1 12 0v8l-2-2-2 2-2-2-2 2-2-2z"/><circle cx="-2" cy="-1" r="1" fill="currentColor"/><circle cx="2" cy="-1" r="1" fill="currentColor"/>',
    heart: '<path d="M0 6s-7-4-7-9a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 5-7 9-7 9z"/>',
    star: '<path d="M0-7 2 -2 7-2 3 1 4.5 6 0 3-4.5 6-3 1-7-2-2-2z"/>',
  };
  const ROOM_KEY = (name) => {
    const n = name.toLowerCase();
    const map = [['gym', 'gym'], ['shop', 'shop'], ['tank', 'tank'], ['kapsalon', 'kapper'], ['slot', 'slot'], ['spring', 'spring'], ['prikkel', 'calm'], ['treasure', 'chest'], ['pantry', 'pantry'],
      ['offering', 'offering'], ['book', 'books'], ['vote', 'vote'], ['rechtbank', 'court'], ['vault', 'vault'], ['challenge', 'challenge'], ['secret', 'secret'], ['mini', 'mini'],
      ['survival', 'survival'], ['hellclub', 'hell'], ['club', 'club'], ['portal', 'portal'], ['clown', 'clown'], ['spook', 'ghost'], ['jaude', 'heart']];
    for (const [k, v] of map) if (n.includes(k)) return v;
    return 'star';
  };
  const ROOM_TAG = { gym: 'Free', shop: 'Coins', tank: 'Coins', kapper: 'Coins', slot: 'Coins', spring: 'Heals', calm: 'Heals', chest: 'Pick one', pantry: 'Safe', offering: 'Costs health', books: 'Curse inside',
    vote: 'Pick one', court: 'Gamble', vault: 'Needs a key', challenge: 'Fight', secret: 'Hidden', mini: 'Boss', survival: 'Fight', club: 'Boss', hell: 'Boss', portal: 'Boss', clown: 'Boss', ghost: 'Boss', heart: 'Boss' };
  function roomArt(col, key) {
    const tile = [];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) tile.push(`<rect x="${9 + q * 11.5}" y="${11 + r * 11.3}" width="11.5" height="11.3" fill="${(r + q) % 2 ? '#241a15' : '#2b201a'}"/>`);
    return `<svg class="art19" viewBox="0 0 64 56" aria-hidden="true">
      <rect x="1" y="3" width="62" height="52" rx="2" fill="${mixHex('#120d0b', col, 0.18)}" stroke="${mixHex('#000000', col, 0.45)}" stroke-width="1.2"/>
      <rect x="1" y="3" width="62" height="3" fill="${mixHex('#2a1e18', col, 0.4)}"/>
      ${tile.join('')}
      <rect x="9" y="11" width="46" height="34" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1"/>
      <rect x="26" y="0" width="12" height="11" fill="#2b201a"/>
      <rect x="22" y="0" width="4" height="12" rx=".6" fill="${col}"/><rect x="38" y="0" width="4" height="12" rx=".6" fill="${col}"/>
      <ellipse cx="32" cy="29" rx="15" ry="11" fill="${col}" opacity=".16"/>
      <g transform="translate(32 29)" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="color:${col}">${ROOM_ART[key] || ROOM_ART.star}</g>
    </svg>`;
  }
  function buildRooms19() {
    const tab = $('tab-rooms'); if (!tab || tab._r19) return; tab._r19 = true;
    for (const ul of tab.querySelectorAll('ul.rooms9')) {
      const lis = [...ul.children].filter((li) => li.querySelector('i') && li.querySelector('b'));
      if (!lis.length) continue;
      ul.classList.add('rooms19');
      for (const li of lis) {
        const col = toHex(li.querySelector('i').style.background || li.querySelector('i').style.backgroundColor);
        const name = li.querySelector('b').textContent, desc = (li.querySelector('span') || {}).textContent || '';
        const key = ROOM_KEY(name), tag = ROOM_TAG[key];
        li.className = 'rm19'; li.style.setProperty('--rc', col);
        li.innerHTML = roomArt(col, key) + `<div class="tx19"><b>${esc(name)}</b><span>${esc(desc)}</span>${tag ? `<em class="tg19">${esc(say(tag))}</em>` : ''}</div>`;
      }
      const h = ul.closest('.sec11') && ul.closest('.sec11').querySelector('h3');
      if (h && !h.querySelector('small')) h.insertAdjacentHTML('beforeend', `<small>${lis.length}</small>`);
    }
    const intro = tab.querySelector('.intro9');
    if (intro) intro.textContent = say('The pillars of a doorway tell you what is behind it. Every room below wears its own colors.');
  }

  /* ================================================================ 5. Modes tab: mode cards and a difficulty ladder */
  const MODE_META = {
    arcade: { id: 'arcade', chips: ['5 floors', 'One life', 'Escape'], tag: 'Classic' },
    endless: { id: 'endless', chips: ['No end', 'Harder each lap'], tag: 'Loop' },
    rush: { id: 'rush', chips: ['Every boss', 'Vote first'], tag: 'Bosses' },
    chaos: { id: 'chaos', chips: ['3 layers', '10 to 20 rooms', 'Anything goes'], tag: 'Chaos' },
    custom: { id: 'custom', chips: ['Up to 20 stages', '3 start gifts', 'Own rules'], tag: 'Build' },
    daily: { id: 'daily', chips: ['New every day', 'One twist', 'Normal'], tag: 'Today' },
    stories: { chips: ['Chapters', 'Bosses of their own'], tag: 'Story',
      svg: SV('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>') },
    rare: { chips: ['After floor 1', 'Own boss'], tag: 'Rare',
      svg: SV('<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 5 3-5M12 9v11"/>') },
  };
  const modeOf = (name) => {
    const n = name.toLowerCase();
    if (n.includes('arcade')) return 'arcade'; if (n.includes('endless')) return 'endless'; if (n.includes('boss rush')) return 'rush';
    if (n.includes('chaos')) return 'chaos'; if (n.includes('custom')) return 'custom'; if (n.includes('daily')) return 'daily';
    if (n.includes('stor')) return 'stories'; if (n.includes('rare')) return 'rare'; return null;
  };
  const DIFF_COL = { easy: '#4ac05a', normal: '#e3a54a', hard: '#e8742a', nightmare: '#e83a50' };
  function modeSvg(key) {
    const M = MODE_META[key]; if (!M) return SV('<circle cx="12" cy="12" r="7"/>');
    if (M.svg) return M.svg;
    const s = document.querySelector(`#modeList .mcard[data-id="${M.id}"] svg`);
    if (s) return s.outerHTML;
    return SV('<circle cx="12" cy="12" r="7"/>');
  }
  function buildModes19(force) {
    const tab = $('tab-modes'); if (!tab) return;
    if (tab._m19 && !force) { paintModes19(); return; }
    const secs = [...tab.querySelectorAll('.sec11')];
    const mSec = secs.find((s) => /mode/i.test((s.querySelector('h3') || {}).textContent || '')) || secs[0];
    const dSec = secs.find((s) => /difficult/i.test((s.querySelector('h3') || {}).textContent || ''));
    if (mSec && !mSec._m19) {
      const ul = mSec.querySelector('ul.rooms9');
      if (ul) {
        const data = [...ul.children].filter((li) => li.querySelector('b')).map((li) => ({ col: toHex(li.querySelector('i') && (li.querySelector('i').style.background || li.querySelector('i').style.backgroundColor)), name: li.querySelector('b').textContent, desc: (li.querySelector('span') || {}).textContent || '' }));
        const box = document.createElement('div'); box.className = 'modes19';
        box.innerHTML = data.map((d) => {
          const key = modeOf(d.name), M = MODE_META[key] || { chips: [] };
          return `<article class="mc19" data-m="${esc(M.id || key || '')}" style="--mc:${d.col}"><div class="em19">${modeSvg(key)}<i>${esc(say(M.tag || 'Mode'))}</i></div>`
            + `<div class="bd19"><b>${esc(d.name)}</b><p>${esc(d.desc)}</p>${M.chips.length ? `<div class="ch19">${M.chips.map((c) => `<span>${esc(say(c))}</span>`).join('')}</div>` : ''}</div></article>`;
        }).join('');
        ul.replaceWith(box); mSec._m19 = true;
      }
    }
    if (dSec && !dSec._m19) {
      const ul = dSec.querySelector('ul');
      if (ul) {
        const lis = [...ul.children];
        const box = document.createElement('div'); box.className = 'ladder19';
        box.innerHTML = lis.map((li, i) => {
          const b = li.querySelector('b'), name = b ? b.textContent : '', id = (DIFF_IDS[i] || name.toLowerCase());
          const txt = li.textContent.replace(name, '').replace(/^\s*:\s*/, '').trim();
          const pips = [0, 1, 2, 3].map((k) => `<i class="${k <= i ? 'f' : ''}"></i>`).join('');
          return `<div class="dl19" data-d="${esc(id)}" style="--dc:${DIFF_COL[id] || '#a69688'}"><span class="sk19" aria-hidden="true">${pips}</span><b>${esc(name)}</b><span>${esc(txt.charAt(0).toUpperCase() + txt.slice(1))}</span></div>`;
        }).join('');
        ul.replaceWith(box); dSec._m19 = true;
      }
    }
    tab._m19 = true;
    paintModes19();
  }
  function paintModes19() {
    const tab = $('tab-modes'); if (!tab) return;
    const D = Save.data;
    for (const a of tab.querySelectorAll('.mc19')) {
      const on = a.dataset.m && a.dataset.m === D.mode; a.classList.toggle('on', on);
      const b = a.querySelector('.bd19 b'); let em = b.querySelector('em');
      if (on && !em) { em = document.createElement('em'); em.textContent = say('Selected'); b.appendChild(em); } else if (!on && em) em.remove();
    }
    for (const d of tab.querySelectorAll('.dl19')) d.classList.toggle('on', d.dataset.d === D.diff);
  }
  safe(() => {
    buildRooms19();
    setTimeout(() => safe(() => buildModes19()), 0);
    const tm = $('t-modes'); if (tm) tm.addEventListener('click', () => safe(() => buildModes19()));
    const oh = UI.openHow;
    if (oh) UI.openHow = function () { const r = oh.apply(this, arguments); safe(() => { buildRooms19(); buildModes19(); }); return r; };
    window.__bitten = Object.assign(window.__bitten || {}, { rooms19: buildRooms19, modes19: buildModes19 });
  });
})();


