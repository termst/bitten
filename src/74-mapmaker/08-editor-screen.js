/* 74.js section 08: editor-screen. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { $, ART, EMPTY, ENT_PARAMS, FONT, GW, LIMITS, MK, RT, RTM, SIDES, Store, TILES, cloneMap, codeError, decodeMap, doorsOf, entDefaults, esc, looksLikeCode, roomAt, rowsOf, safe, setDef, snakeSprite, uid } = M74;
  M74.seg = seg; M74.row = row; M74.field = field; M74.canvasIcon = canvasIcon; M74.withScene = withScene; M74.pieceArt = pieceArt; M74.tileAtlas = tileAtlas; M74.paintBrushIcon = paintBrushIcon; M74.toast = toast; M74.pushUndo = pushUndo; M74.restore = restore; M74.doUndo = doUndo; M74.doRedo = doRedo; M74.syncUndo = syncUndo; M74.scheduleSave = scheduleSave; M74.saveNow = saveNow; M74.changed = changed; M74.build = build; M74.showHub = showHub; M74.showEditor = showEditor; M74.edit = edit; M74.mapStats = mapStats; M74.paintFloorThumb = paintFloorThumb; M74.setPane = setPane; M74.syncTools = syncTools; M74.setTool = setTool;
  /* ================================================================== 8. the Map Maker screen */
  const SVG = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`; M74.SVG = SVG;
  const IC = {
    back: SVG('<path d="M15 5l-7 7 7 7"/>'),
    undo: SVG('<path d="M9 7H5V3"/><path d="M5 7a8 8 0 1 1-1.5 6.5"/>'),
    redo: SVG('<path d="M15 7h4V3"/><path d="M19 7a8 8 0 1 0 1.5 6.5"/>'),
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2v12L13.5 8z" fill="currentColor"/></svg>',
    share: SVG('<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>'),
    brush: SVG('<path d="M14.5 4.5l5 5-8.5 8.5H6v-5z"/><path d="M12 7l5 5"/>'),
    erase: SVG('<path d="M4 15l8.5-8.5 6 6L12 19H7z"/><path d="M12 19h8"/>'),
    fill: SVG('<path d="M5 12l7-7 7 7-7 7z"/><path d="M20 15c0 1.4-1 2.5-1.8 2.5S16.5 16.4 16.5 15c0-1 1.8-3 1.8-3S20 14 20 15z" fill="currentColor"/>'),
    box: SVG('<rect x="4.5" y="5.5" width="15" height="13" rx="1"/><path d="M4.5 9.5h15" stroke-dasharray="2 2"/>'),
    pick: SVG('<path d="M14 6l4 4M5 19l1.5-4L15 6.5a2.1 2.1 0 0 1 3 3L9.5 18z"/>'),
    move: SVG('<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>'),
    mirX: SVG('<path d="M12 3v18" stroke-dasharray="2 2.5"/><path d="M9 7l-5 5 5 5zM15 7l5 5-5 5z"/>'),
    mirY: SVG('<path d="M3 12h18" stroke-dasharray="2 2.5"/><path d="M7 9l5-5 5 5zM7 15l5 5 5-5z"/>'),
    grid: SVG('<path d="M4 4h16v16H4zM4 10h16M4 15h16M10 4v16M15 4v16"/>'),
    plus: SVG('<path d="M12 5v14M5 12h14"/>'),
    trash: SVG('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>'),
    copy: SVG('<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/>'),
    paste: SVG('<rect x="6" y="5" width="12" height="15" rx="1"/><path d="M9 5V3.5h6V5M9 11h6M9 15h4"/>'),
    flipX: SVG('<path d="M12 3v18" stroke-dasharray="2 2.5"/><path d="M9 6H4l5 12zM15 6h5l-5 12z"/>'),
    flipY: SVG('<path d="M3 12h18" stroke-dasharray="2 2.5"/><path d="M6 9V4l12 5zM6 15v5l12-5z"/>'),
    layout: SVG('<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 16h3"/>'),
    check: SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    warn: SVG('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>'),
    key: SVG('<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M20 12v2.5"/>'),
    map: SVG('<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>'),
    paste2: SVG('<path d="M8 4h8v4H8zM6 6H4v15h16V6h-2"/><path d="M9 13h6M9 17h4"/>'),
    dots: SVG('<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>'),
    edit: SVG('<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    floorIc: SVG('<rect x="3" y="7" width="7" height="6"/><rect x="14" y="7" width="7" height="6"/><rect x="14" y="16" width="7" height="5"/><path d="M10 10h4M17.5 13v3"/>'),
    test: SVG('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>'),
  }; M74.IC = IC;
  const TOOLS = [['brush', 'Brush', 'B'], ['erase', 'Erase', 'E'], ['fill', 'Fill', 'F'], ['box', 'Box', 'R'], ['pick', 'Pick', 'I'], ['move', 'Select', 'V']]; M74.TOOLS = TOOLS;
  const CATS = [['blocks', 'Blocks'], ['floor', 'Floor'], ['snakes', 'Snakes'], ['traps', 'Traps'], ['gadgets', 'Gadgets'], ['loot', 'Loot'], ['text', 'Text'], ['pieces', 'Room pieces']]; M74.CATS = CATS;
  const ENT_ORDER = { traps: ['fb', 'sw', 'tt', 'bx', 'ns', 'ac', 'wk', 'sk'], gadgets: ['tp', 'jp', 'sp', 'bm', 'lv', 'gt', 'pl', 'sg', 'ex'], loot: ['pd', 'ky', 'cn'], text: ['tx', 'nt', 'cq', 'sh', 'sg'] }; M74.ENT_ORDER = ENT_ORDER;
  const TYPE_ICON = (col) => `<i style="background:${col}"></i>`; M74.TYPE_ICON = TYPE_ICON;

  const CSS = `
#maker{position:absolute;inset:0;z-index:6;background:#0b0807;color:var(--ink);font-family:var(--ui);text-align:left;-webkit-user-select:none;user-select:none}
#maker input,#maker textarea,#maker select{-webkit-user-select:text;user-select:text}
.mk-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:2px;
  background:rgba(255,255,255,.03);font:700 13px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--ink);white-space:nowrap;transition:border-color .14s,background .14s,color .14s}
.mk-btn:hover{border-color:rgba(236,226,212,.45)}
.mk-btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.mk-btn svg{width:16px;height:16px;flex:none}
.mk-btn.ic{padding:0;width:36px}
.mk-btn.pri{background:var(--apple);border-color:var(--apple);color:#fff4ec;box-shadow:0 0 22px rgba(215,38,61,.28)}
.mk-btn.pri:hover{background:var(--apple-hi);border-color:var(--apple-hi)}
.mk-btn.gold{color:var(--toffee);border-color:rgba(227,165,74,.5)}
.mk-btn.red{color:#ff8494;border-color:rgba(232,58,80,.45)}
.mk-btn.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-btn[disabled]{opacity:.32;cursor:default;pointer-events:none}
.mk-in{all:unset;box-sizing:border-box;width:100%;background:#120d0b;border:1px solid var(--line);border-radius:2px;padding:8px 10px;font:500 15px/1.25 var(--ui);color:var(--ink)}
.mk-in:focus{border-color:var(--toffee)}
textarea.mk-in{min-height:64px;resize:vertical;white-space:pre-wrap}
textarea.mk-code{font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;word-break:break-all;min-height:96px}
select.mk-in{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);background-position:calc(100% - 15px) 52%,calc(100% - 10px) 52%;background-size:5px 5px;background-repeat:no-repeat;padding-right:28px}
select.mk-in option{background:#120d0b;color:var(--ink)}
.mk-h{margin:16px 0 8px;font:700 11px/1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.mk-h:first-child{margin-top:2px}
.mk-p{margin:0 0 8px;font:500 14px/1.35 var(--ui);color:var(--muted)}
.mk-seg{display:flex;flex-wrap:wrap;gap:4px}
.mk-seg button{all:unset;box-sizing:border-box;cursor:pointer;min-height:30px;padding:0 9px;display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:2px;font:600 13px/1 var(--ui);letter-spacing:.04em;color:var(--muted);background:rgba(255,255,255,.02)}
.mk-seg button:hover{color:var(--ink);border-color:rgba(236,226,212,.4)}
.mk-seg button.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-seg button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-seg i{width:10px;height:10px;border-radius:1px;display:inline-block}
.mk-row{display:grid;grid-template-columns:118px minmax(0,1fr);gap:6px 10px;align-items:center;margin-bottom:7px}
.mk-row>span{font:600 12px/1.15 var(--ui);letter-spacing:.06em;color:var(--muted)}
.mk-field{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.mk-field>span{font:600 11px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}
.mk-note{margin:6px 0;padding:8px 10px;border-left:3px solid var(--toffee);background:rgba(227,165,74,.06);font:500 13px/1.35 var(--ui);color:var(--muted)}
.mk-toast{position:absolute;left:50%;bottom:18px;transform:translate(-50%,10px);opacity:0;pointer-events:none;z-index:30;background:#1a1210;border:1px solid rgba(227,165,74,.55);border-radius:2px;padding:9px 14px;font:600 14px/1.2 var(--ui);color:var(--ink);transition:opacity .2s,transform .2s;max-width:calc(100% - 32px);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.mk-toast.show{opacity:1;transform:translate(-50%,0)}
/* hub */
.mkh{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:22px max(16px,env(safe-area-inset-right)) 40px max(16px,env(safe-area-inset-left))}
.mkh-in{max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.mkh-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap}
.mkh-head h2{font:800 clamp(40px,10vw,62px)/.95 var(--display);margin:4px 0 0}
.mkh-head .kick{color:var(--toffee)}
.mkh-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.mkh-act{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:42px minmax(0,1fr);grid-template-rows:auto auto;column-gap:12px;row-gap:3px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:3px;background:linear-gradient(180deg,rgba(28,20,17,.9),rgba(12,9,8,.93))}
.mkh-act:hover{border-color:rgba(232,58,80,.6)}
.mkh-act:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.mkh-act .ai{grid-row:1/3;width:42px;height:42px;border-radius:2px;display:grid;place-items:center;background:rgba(215,38,61,.14);color:var(--apple-hi);border:1px solid rgba(215,38,61,.4)}
.mkh-act .ai svg{width:22px;height:22px}
.mkh-act b{font:800 24px/1 var(--display)}
.mkh-act span{font:500 13px/1.25 var(--ui);color:var(--muted)}
.mkh-act.alt .ai{background:rgba(227,165,74,.1);color:var(--toffee);border-color:rgba(227,165,74,.4)}
.mkh-paste{border:1px solid rgba(227,165,74,.35);border-radius:3px;padding:12px;background:rgba(227,165,74,.04);display:flex;flex-direction:column;gap:8px}
.mkh-msg{margin:0;min-height:1.2em;font:600 14px/1.3 var(--ui);color:var(--toffee)}
.mkh-sec{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:10px 0 -4px;border-bottom:1px solid var(--line);padding-bottom:8px}
.mkh-sec h3{margin:0;font:700 13px/1 var(--ui);letter-spacing:.24em;text-transform:uppercase;color:var(--apple-hi)}
.mkh-sec span{font:600 12px/1 var(--ui);letter-spacing:.12em;color:var(--faint);text-transform:uppercase}
.mkh-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.mkh-card{display:grid;grid-template-columns:96px minmax(0,1fr);gap:11px;padding:10px;border:1px solid var(--line);border-radius:3px;background:rgba(255,255,255,.02);min-width:0}
.mkh-card canvas{width:96px;height:72px;display:block;border-radius:2px;background:#120d0b}
.mkh-card .ci{display:flex;flex-direction:column;gap:3px;min-width:0}
.mkh-card b{font:800 21px/1.05 var(--display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mkh-card small{font:600 11px/1.2 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mkh-card p{margin:0;font:500 13px/1.3 var(--ui);color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mkh-card .cb{grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap}
.mkh-card .cb .mk-btn{min-height:32px;font-size:12px;padding:0 10px;flex:1 1 auto}
.mkh-card.ex{border-color:rgba(227,165,74,.3)}
.mkh-empty{padding:18px;border:1px dashed var(--line);border-radius:3px;font:500 15px/1.35 var(--ui);color:var(--muted)}
/* editor */
.mke{position:absolute;inset:0;display:flex;flex-direction:column}
.mke-top{flex:none;display:flex;align-items:center;gap:6px;padding:7px max(10px,env(safe-area-inset-right)) 7px max(10px,env(safe-area-inset-left));border-bottom:1px solid var(--line);background:#0e0a09}
.mke-title{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 auto;margin:0 4px}
.mke-title small{display:flex;gap:10px;font:700 10px/1 var(--ui);letter-spacing:.22em;text-transform:uppercase;color:var(--apple-hi)}
.mke-title small em{font-style:normal;color:var(--faint);letter-spacing:.14em}
.mke-title input{all:unset;box-sizing:border-box;font:800 22px/1.15 var(--display);color:var(--ink);min-width:0;width:100%;border-bottom:1px dashed transparent;-webkit-user-select:text;user-select:text}
.mke-title input:hover{border-bottom-color:var(--line)}
.mke-title input:focus{border-bottom-color:var(--toffee)}
.mke-chk{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 10px;border:1px solid rgba(124,216,120,.4);border-radius:2px;font:700 12px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:#9be37a}
.mke-chk svg{width:15px;height:15px}
.mke-chk.bad{border-color:rgba(232,58,80,.55);color:#ff8494}
.mke-chk.meh{border-color:rgba(227,165,74,.5);color:var(--toffee)}
.mke-body{flex:1;min-height:0;display:grid;grid-template-columns:270px minmax(0,1fr) 340px;grid-template-rows:auto minmax(0,1fr);grid-template-areas:"floor stage tabs" "floor stage pane"}
.mke-stage{grid-area:stage;display:flex;flex-direction:column;min-width:0;min-height:0;border-left:1px solid var(--line);border-right:1px solid var(--line);background:radial-gradient(120% 90% at 50% 40%,#17110e,#0b0807)}
.mke-crumb{flex:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 12px 0;font:600 12px/1.2 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--faint);min-height:28px}
.mke-crumb b{color:var(--ink);font-weight:700}
.mke-crumb i{width:9px;height:9px;border-radius:1px;display:inline-block}
.mke-crumb .hv{margin-left:auto;color:var(--muted);text-transform:none;letter-spacing:.04em}
.mke-cvw{flex:1;min-height:0;display:grid;place-items:center;padding:8px;position:relative}
.mke-cvw canvas{display:block;touch-action:none;cursor:crosshair;box-shadow:0 18px 50px rgba(0,0,0,.55)}
.mke-tools{flex:none;display:flex;gap:4px;padding:8px 10px;border-top:1px solid var(--line);overflow-x:auto;scrollbar-width:none;background:#0e0a09}
.mke-tools::-webkit-scrollbar{display:none}
.mke-tools .sep{width:1px;background:var(--line);margin:3px 4px;flex:none}
.mke-tools .mk-btn{min-height:38px;padding:0 10px;font-size:12px;letter-spacing:.1em}
.mke-tools .mk-btn kbd{font:600 10px/1 var(--ui);border:1px solid var(--line);border-radius:2px;padding:2px 4px;color:var(--faint);margin-left:2px}
@media (max-width:1599px){.mke-tools .mk-btn kbd{display:none}}
@media (max-width:1279px) and (min-width:980px){.mke-tools .mk-btn .tl{display:none}.mke-tools .mk-btn{padding:0;width:40px}}
.mke-tabs{grid-area:tabs;display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--line);background:#0e0a09}
.mke-tabs button{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 0;min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--line);border-radius:2px;font:700 12px/1 var(--ui);letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.mke-tabs button[aria-selected=true]{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mke-tabs button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mke-tabs button[data-p=floor]{display:none}
.mke-pane{grid-area:pane;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:12px 12px 30px;min-height:0}
.mke-pane.on{display:block}
#mkPaneFloor{grid-area:floor;display:block;border-right:0}
.mk-cats{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.mk-cats button{all:unset;box-sizing:border-box;cursor:pointer;min-height:28px;padding:0 8px;display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:2px;font:700 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.mk-cats button.on{background:var(--toffee);border-color:var(--toffee);color:#16100d}
.mk-cats button:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-pal{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:5px}
.mk-br{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 3px 6px;border:1px solid var(--line);border-radius:2px;background:rgba(255,255,255,.02);min-width:0;position:relative}
.mk-br:hover{border-color:rgba(236,226,212,.4)}
.mk-br:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
.mk-br canvas{width:42px;height:42px;display:block}
.mk-br span{font:600 11px/1.05 var(--ui);color:var(--muted);text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mk-br.on{border-color:var(--toffee);background:rgba(227,165,74,.12)}
.mk-br.on span{color:var(--ink)}
.mk-br.new::after{content:"NEW";position:absolute;top:3px;right:3px;font:700 8px/1 var(--ui);letter-spacing:.1em;background:var(--apple);color:#fff4ec;padding:2px 3px;border-radius:1px}
.mk-card{margin-top:12px;border:1px solid rgba(227,165,74,.35);border-radius:3px;padding:10px;background:rgba(227,165,74,.04)}
.mk-card .hd{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:center;margin-bottom:8px}
.mk-card .hd canvas{width:44px;height:44px;background:#120d0b;border-radius:2px}
.mk-card .hd b{display:block;font:800 21px/1 var(--display)}
.mk-card .hd small{display:block;margin-top:3px;font:600 10px/1 var(--ui);letter-spacing:.18em;text-transform:uppercase;color:var(--toffee)}
.mk-card p{margin:0 0 8px;font:500 14px/1.32 var(--ui);color:var(--muted)}
.mk-pick{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:4px 10px 4px 4px;border:1px solid var(--line);border-radius:2px;background:#120d0b;font:600 14px/1.1 var(--ui);color:var(--ink)}
.mk-pick canvas{width:32px;height:32px;flex:none}
.mk-pick:hover{border-color:rgba(236,226,212,.4)}
.mk-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:4px}
.mk-types button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:7px;min-height:32px;padding:0 8px;border:1px solid var(--line);border-radius:2px;font:600 13px/1.05 var(--ui);color:var(--muted)}
.mk-types button i{width:10px;height:10px;border-radius:1px;flex:none;box-shadow:0 0 6px rgba(255,255,255,.12)}
.mk-types button:hover{color:var(--ink);border-color:rgba(236,226,212,.4)}
.mk-types button.on{background:rgba(215,38,61,.18);border-color:var(--apple);color:#fff4ec}
.mk-doors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.mk-door{border:1px solid var(--line);border-radius:2px;padding:7px;display:flex;flex-direction:column;gap:5px}
.mk-door>span{font:700 11px/1 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.mk-door>span em{font-style:normal;color:var(--muted);letter-spacing:.04em;text-transform:none}
.mk-acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
.mk-acts .mk-btn{font-size:11.5px;padding:0 8px;letter-spacing:.08em}
.mk-floors{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
.mk-floors button{all:unset;box-sizing:border-box;cursor:pointer;min-width:34px;min-height:32px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:2px;font:700 13px/1 var(--ui);letter-spacing:.1em;color:var(--muted)}
.mk-floors button.on{background:rgba(215,38,61,.2);border-color:var(--apple);color:#fff4ec}
.mk-floors button svg{width:14px;height:14px}
.mk-fg{display:grid;gap:0;user-select:none;margin:4px 0 6px}
.mk-fc{all:unset;box-sizing:border-box;position:relative;aspect-ratio:6/5;border:1px dashed rgba(236,226,212,.07);border-radius:2px;cursor:default;min-width:0}
.mk-fc.add{border-color:rgba(236,226,212,.22);cursor:pointer;display:grid;place-items:center;color:var(--faint)}
.mk-fc.add svg{width:13px;height:13px;opacity:.6}
.mk-fc.add:hover{border-color:var(--toffee);color:var(--toffee)}
.mk-fc.rm{border:1px solid rgba(236,226,212,.25);cursor:pointer;background:#120d0b;overflow:hidden}
.mk-fc.rm canvas{position:absolute;inset:0;width:100%;height:100%}
.mk-fc.rm b{position:absolute;left:2px;bottom:1px;font:800 9px/1 var(--ui);letter-spacing:.06em;color:#fff4ec;text-shadow:0 0 3px #000,0 0 2px #000}
.mk-fc.rm.cur{border-color:var(--toffee);box-shadow:0 0 0 1px var(--toffee),0 0 14px rgba(227,165,74,.35)}
.mk-fc.rm.lk::after{content:"";position:absolute;right:2px;top:2px;width:7px;height:7px;border-radius:1px;background:#c9a000;box-shadow:0 0 0 1px #000}
.mk-fe{all:unset;box-sizing:border-box;cursor:pointer;display:grid;place-items:center;min-width:0;min-height:0}
.mk-fe::before{content:"";display:block;background:rgba(236,226,212,.55)}
.mk-fe.v::before{width:3px;height:42%}
.mk-fe.h::before{height:3px;width:42%}
.mk-fe.w::before{background:#5a2a2e;width:100%;height:100%}
.mk-fe.v.w::before{width:4px;height:100%}
.mk-fe.h.w::before{height:4px;width:100%}
.mk-fe.c::before{background:repeating-linear-gradient(45deg,var(--toffee) 0 2px,transparent 2px 4px)}
.mk-fe.v.c::before{width:5px;height:80%}
.mk-fe.h.c::before{height:5px;width:80%}
.mk-fe:hover::before{background:var(--apple-hi)}
.mk-fe.no{pointer-events:none}
.mk-fe.no::before{display:none}
.mk-key{display:flex;gap:10px;flex-wrap:wrap;font:600 11px/1 var(--ui);letter-spacing:.08em;color:var(--faint);margin-bottom:6px}
.mk-key span{display:inline-flex;align-items:center;gap:5px}
.mk-key i{display:inline-block;width:12px;height:4px;background:rgba(236,226,212,.55)}
.mk-key i.w{background:#5a2a2e;height:5px}
.mk-key i.c{background:repeating-linear-gradient(45deg,var(--toffee) 0 2px,transparent 2px 4px);height:5px}
.mk-items{display:flex;flex-wrap:wrap;gap:5px}
.mk-items button{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:2px 9px 2px 3px;border:1px solid var(--line);border-radius:2px;font:600 13px/1 var(--ui);color:var(--ink)}
.mk-items button canvas{width:28px;height:28px}
.mk-items button:hover{border-color:#ff8494}
.mk-items button.add{padding:0 10px;color:var(--toffee);border-color:rgba(227,165,74,.45)}
.mk-probs{display:flex;flex-direction:column;gap:5px}
.mk-probs button{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;align-items:start;padding:7px 9px;border:1px solid var(--line);border-left:3px solid var(--toffee);border-radius:2px;font:500 13.5px/1.3 var(--ui);color:var(--ink)}
.mk-probs button.err{border-left-color:var(--apple)}
.mk-probs button svg{width:15px;height:15px;color:var(--toffee);margin-top:1px}
.mk-probs button.err svg{color:var(--apple-hi)}
.mk-probs button small{display:block;color:var(--faint);font-size:12px;margin-top:2px}
/* dialogs */
.mk-dlg{position:absolute;inset:0;z-index:20;background:rgba(9,6,6,.82);display:grid;place-items:center;padding:16px}
.mk-dlg[hidden]{display:none}
.mk-dlg-in{width:min(560px,100%);max-height:calc(100% - 20px);display:flex;flex-direction:column;border:1px solid rgba(227,165,74,.45);border-radius:3px;background:#0e0a09;box-shadow:0 24px 70px rgba(0,0,0,.7)}
.mk-dlg-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
.mk-dlg-hd b{font:800 26px/1 var(--display)}
.mk-dlg-bd{padding:12px 14px;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0}
.mk-dlg-ft{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line)}
.mk-plist{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;margin-top:8px}
.mk-plist button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:44px;padding:3px 8px 3px 3px;border:1px solid var(--line);border-radius:2px;font:600 13px/1.1 var(--ui);color:var(--ink);min-width:0}
.mk-plist button canvas{width:38px;height:38px;flex:none}
.mk-plist button span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.mk-plist button small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mk-plist button.rare small{color:#ffb44a}
.mk-plist button.lk{opacity:.7}
.mk-plist button.on{border-color:var(--toffee);background:rgba(227,165,74,.12)}
.mk-plist button:hover{border-color:rgba(236,226,212,.45)}
.mk-plist.bosses{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.mke-grip{display:none;grid-area:grip;align-items:center;justify-content:center;height:26px;border-top:1px solid var(--line);background:#0e0a09;cursor:row-resize;touch-action:none;-webkit-user-select:none;user-select:none;position:relative}
.mke-grip::before{content:"";width:48px;height:4px;border-radius:1px;background:rgba(236,226,212,.35)}
.mke-grip:hover::before,.mke-grip.drag::before{background:var(--toffee)}
.mke-grip:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}
.mk-dlg{grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr)}.mk-dlg-in.pk{height:min(680px,calc(100% - 20px))}
.mk-dlg-bd.pk{display:flex;flex-direction:column;overflow:hidden;flex:1 1 auto}
.mk-pk-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.mk-pk-top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.mk-pk-top .mk-in{flex:1 1 180px;min-width:0;width:auto}
.mk-pk-top .mk-seg{margin:0}
.mk-plist.pk{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;align-content:start;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));padding-bottom:4px}
.mk-plist.pk button{align-items:center;min-height:54px}
.mk-plist.pk button span{overflow:visible;white-space:normal}
.mk-plist.pk button em.d{display:block;margin-top:3px;font:500 12px/1.25 var(--ui);font-style:normal;letter-spacing:0;text-transform:none;color:var(--muted)}
.mk-plist.bosses button canvas{width:64px;height:37px}
.mk-prev{border:1px solid var(--line);border-radius:3px;padding:10px;display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;margin-top:4px}
.mk-prev canvas{width:110px;height:82px;background:#120d0b;border-radius:2px}
.mk-prev b{font:800 24px/1 var(--display)}
.mk-prev p{margin:4px 0 0;font:500 14px/1.3 var(--ui);color:var(--muted)}
.mk-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font:600 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.mk-stats b{font:700 15px/1 var(--ui);color:var(--ink);margin-right:3px;letter-spacing:0}
@media (max-width:979px){
  .mke-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto auto minmax(0,1fr);grid-template-areas:"stage" "grip" "tabs" "pane"}
  .mke-stage{border:0;height:var(--mk-sh,min(60vh,calc((100vw - 12px) * 0.8374 + 104px)))}
  .mke-grip{display:flex}
  #mkPaneFloor{grid-area:pane;display:none}
  #mkPaneFloor.on{display:block}
  .mke-tabs button[data-p=floor]{display:inline-flex}
  .mke-top .lbl{display:none}
  .mke-top .mk-btn{padding:0 9px}
  .mke-cvw{padding:6px}
}
@media (max-width:979px) and (orientation:landscape) and (max-height:560px){
  .mke-body{grid-template-columns:minmax(0,1fr) minmax(290px,44%);grid-template-rows:auto minmax(0,1fr);grid-template-areas:"stage tabs" "stage pane"}
  .mke-stage{height:auto;border-right:1px solid var(--line)}
  .mke-grip{display:none}
  .mke-crumb{display:none}
  .mke-tools{padding:5px 6px}
  .mke-tools .mk-btn{min-height:32px}
  .mke-tabs{padding:6px 8px}
  .mke-tabs button{min-height:30px}
  .mke-top{padding-top:4px;padding-bottom:4px}
  .mke-title input{font-size:18px}
}
@media (max-width:560px){
  .mke-title input{font-size:19px}
  .mke-title small em{display:none}
  .mke-tools .mk-btn .tl{display:none}
  .mke-tools .mk-btn kbd{display:none}
  .mke-tools .mk-btn{padding:0;width:40px}
  .mke-crumb .hv{display:none}
  .mk-row{grid-template-columns:96px minmax(0,1fr)}
  .mkh-card{grid-template-columns:84px minmax(0,1fr)}
  .mkh-card canvas{width:84px;height:63px}
}
@media (max-width:420px){.mke-top{gap:4px}.mke-top .mk-btn.ic,.mke-top .mk-btn{width:34px;padding:0}.mke-chk{padding:0 8px}}
@media (min-width:980px) and (max-height:560px){
  .mke-top{padding-top:4px;padding-bottom:4px}
  .mke-title input{font-size:18px}
  .mke-crumb{display:none}
  .mke-body{grid-template-columns:220px minmax(0,1fr) 300px}
  .mke-tools{padding:5px 8px}
  .mke-tools .mk-btn{min-height:32px}
}
/* the menu tile */
#menu.m19 .mi.mk123{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;row-gap:3px;align-items:center;min-height:58px;padding:9px 12px;border-radius:3px;
  background:linear-gradient(100deg,rgba(40,28,14,.92),rgba(14,10,8,.94) 60%);border:1px solid rgba(227,165,74,.35);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
#menu.m19 .mi.mk123 .ml{grid-column:1;grid-row:1;font:800 clamp(21px,5.8vw,25px)/.95 var(--display);color:var(--ink);transform:none}
#menu.m19 .mi.mk123 small{grid-column:1;grid-row:2;margin:0;font:600 10px/1.15 var(--ui);letter-spacing:.13em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#menu.m19 .mi.mk123 .mkt{grid-column:2;grid-row:1/3;display:grid;grid-template-columns:repeat(4,9px);grid-auto-rows:9px;gap:2px}
#menu.m19 .mi.mk123 .mkt i{background:rgba(227,165,74,.22);border-radius:1px}
#menu.m19 .mi.mk123 .mkt i.f{background:var(--toffee)}
#menu.m19 .mi.mk123 .mkt i.r{background:var(--apple)}
#menu.m19 .mi.mk123.new::after{left:auto;right:64px;top:50%;transform:translateY(-50%)}
#menu.m19 .mi.mk123:hover,#menu.m19 .mi.mk123:focus-visible{border-color:var(--toffee);transform:translateY(-1px)}
@media (min-aspect-ratio:20/21) and (max-height:560px){#menu.m19 .mi.mk123{min-height:34px;padding:4px 10px}#menu.m19 .mi.mk123 small,#menu.m19 .mi.mk123 .mkt{display:none}#menu.m19 .mi.mk123 .ml{font-size:17px}}
@media (max-height:700px) and (max-aspect-ratio:20/21){#menu.m19 .mi.mk123{min-height:46px}#menu.m19 .mi.mk123 .mkt{display:none}}
/* the guide tab */
.mk-gd .cards.items{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.mk-gd .cards.items figure{flex-direction:row;align-items:center;gap:12px;padding:8px 10px}
.mk-gd .cards.items canvas{width:46px;height:46px;flex:none;border-radius:3px;background:#17110e}
.mk-gd .cards.items b{font-size:19px;color:var(--toffee)}
.mk-gd .cards.items span{font-size:14px}
`; M74.CSS = CSS;

  /* ---- small DOM helpers */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }; M74.el = el;
  const btn = (cls, html, title, fn) => { const b = el('button', 'mk-btn ' + (cls || ''), html); b.type = 'button'; if (title) { b.title = title; b.setAttribute('aria-label', title); } if (fn) b.addEventListener('click', (e) => { e.preventDefault(); fn(e); }); return b; }; M74.btn = btn;
  function seg(opts, val, onPick, cls) {
    const box = el('div', 'mk-seg' + (cls ? ' ' + cls : ''));
    for (const [v, label, extra] of opts) {
      const b = el('button', v === val ? 'on' : '', (extra || '') + esc(label)); b.type = 'button';
      b.setAttribute('aria-pressed', v === val ? 'true' : 'false');
      b.addEventListener('click', (e) => { e.preventDefault(); onPick(v); });
      box.appendChild(b);
    }
    return box;
  }
  function row(label, child) { const r = el('div', 'mk-row'); r.appendChild(el('span', null, esc(label))); r.appendChild(child); return r; }
  function field(label, child) { const r = el('div', 'mk-field'); r.appendChild(el('span', null, esc(label))); r.appendChild(child); return r; }
  function canvasIcon(size, paint) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas');
    cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    safe(() => paint(c, size));
    return cv;
  }

  /* ---- icons for everything on the palette */
  const ATLAS = {};
  function previewDef(set) { return setDef(set); }
  function withScene(room, def, fn) {
    const kr = G.room, kl = G.levelDef, kt = G.t;
    G.levelDef = def; if (room) G.room = room;
    try { return fn(); } finally { G.room = kr; G.levelDef = kl; G.t = kt; }
  }
  // the room spots that only look like something once a run stocks them
  function pieceArt(c, ch, x, y, t) {
    if (ch === '$' || ch === '%') {
      c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, x, y + 10, 11, 4); c.fill();
      c.save(); c.translate(x, y - 2); drawItemIcon(c, ch === '%' ? 'cyanide' : 'twin', 20, t); c.restore();
      c.fillStyle = ch === '%' ? '#b05aff' : '#ffd84a'; c.font = `800 8px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(ch === '%' ? 'CURSED' : '15', x, y + 14);
    } else if (ch === '+') {
      safe(() => drawHeartPickup(c, { x, y: y - 2, amount: 2, t: 1, ph: 0 }, t));
      c.fillStyle = '#ffd84a'; c.font = `800 8px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('6', x, y + 14);
    } else if (ch === '!' || ch === 'q') {
      safe(() => drawRotPickup(c, { kind: ch === '!' ? 'cleanse' : 'reroll', x, y, t: 1, ph: 0, cost: ch === '!' ? 8 : 5, spin: 0 }, t, 99));
    } else if (ch === 's') {
      c.fillStyle = '#3a6a3a'; c.fillRect(x - 13, y - 6, 26, 14); c.fillStyle = '#ffd23a'; c.fillRect(x - 10, y - 4, 6, 8); c.fillStyle = '#e83a50'; c.fillRect(x - 2, y - 4, 6, 8); c.fillStyle = '#3aa0ff'; c.fillRect(x + 6, y - 4, 5, 8);
    } else if (ch === 'p') {
      c.fillStyle = '#d8b46a'; ell(c, x, y, 14, 9); c.fill(); c.strokeStyle = '#5a3a10'; c.lineWidth = 1.4; ell(c, x, y, 14, 9); c.stroke();
      c.fillStyle = '#5a3a10'; c.font = `800 7px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(x < RW / 2 ? 'EISER' : 'PLATE', x, y + 0.5);
    }
  }
  const DYN_DRAW = (c, o, room, def, t) => {
    if (o.type === 'urn') drawUrn(c, o, def, t);
    else if (o.type === 'egg') drawEggs(c, o, def, t);
    else if (o.type === 'chest') drawChest(c, o, t);
    else if (o.type === 'altar') drawAltar(c, o, room, t);
    else if (o.type === 'slot') drawSlot(c, o, t);
    else if (o.type === 'book') drawBookstand(c, o, t);
    else if (o.type === 'gold') drawGold(c, o, t);
    else if (DYN9[o.type]) DYN9[o.type](c, o, room, t);
  }; M74.DYN_DRAW = DYN_DRAW;
  function tileAtlas(set) {
    if (ATLAS[set]) return ATLAS[set];
    const def = previewDef(set), out = {};
    const chars = TILES.map((t) => t[0]);
    const K = 2;
    for (let b = 0; b < chars.length; b += 20) {
      const batch = chars.slice(b, b + 20), g = EMPTY.split(''), pos = {};
      batch.forEach((ch, i) => { const c = 1 + (i % 5) * 2, r = 1 + Math.floor(i / 5) * 2; if (ch !== '.') g[r * GW + c] = ch; pos[ch] = [c, r]; });
      const room = new Room(0, 0, 0); room.type = 'hall';
      safe(() => withScene(room, def, () => {
        room.build(rowsOf(g.join('')), def, {});
        room.decals = [];
        buildRoomCache(room, def, K);
        const c = room.cacheCtx, t = 0;
        for (const o of room.obs) safe(() => DYN_DRAW(c, o, room, def, t));
        safe(() => { if (room.belts.length) drawBelts(c, room, t); });
        safe(() => drawFloorThings(c, room, t));
        for (const k of room.carts) safe(() => drawCart(c, k, room));
        for (const p of room.pickups) if (p.kind === 'heart') safe(() => drawHeartPickup(c, p, t));
        for (const r of room.rots) safe(() => drawRot(c, r, t));
        for (const ch of batch) if ('$+%!qsp'.includes(ch)) { const [cc, rr] = pos[ch]; safe(() => pieceArt(c, ch, (cc + 0.5) * T, (rr + 0.5) * T, t)); }
        for (const ch of batch) {
          const [cc, rr] = pos[ch], S = 48, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
          const x0 = (WALL + cc * T - 3) * K, y0 = (WALL + rr * T - 7) * K;
          cv.getContext('2d').drawImage(room.cache, x0, y0, (T + 6) * K, (T + 6) * K, 0, 0, S, S);
          out[ch] = cv;
        }
      }));
    }
    ATLAS[set] = out;
    return out;
  }
  function paintBrushIcon(c, size, br, set) {
    c.fillStyle = '#17110e'; c.fillRect(0, 0, size, size);
    if (br.k === 'tile') {
      const a = tileAtlas(set)[br.ch];
      if (a) c.drawImage(a, 0, 0, size, size);
      return;
    }
    if (br.t === 'sn') {
      const sp = snakeSprite(br.p.k, br.p.g);
      c.drawImage(sp, 2, 2, size - 4, size - 4);
      return;
    }
    c.save(); c.translate(size / 2, size / 2); const s = size / 44; c.scale(s, s);
    const e = Object.assign({ c: 3, r: 3 }, br.p);
    if (br.t === 'tt' || br.t === 'bx' || br.t === 'ns' || br.t === 'lv' || br.t === 'gt' || br.t === 'bm' || br.t === 'pd' || br.t === 'sg') ART[br.t](c, 0, 2, e, 0.4, 'icon');
    else if (br.t === 'fb') { const e2 = Object.assign({}, e, { n: 2 }); ART.fb(c, 0, 0, e2, 0.6, 'icon'); }
    else if (br.t === 'sw') ART.sw(c, 0, 0, e, 0.3, 'icon');
    else ART[br.t](c, 0, 0, e, 0.5, 'icon');
    c.restore();
  }

  /* ---- the editor state */
  const Maker = {
    open: false, view: 'hub', built: false, M: null, fi: 0, rx: 4, ry: 4,
    tool: 'brush', brush: { k: 'tile', ch: '#' }, bp: {}, mirX: false, mirY: false, showGrid: true,
    undo: [], redo: [], cat: 'blocks', pane: 'paint', q: '', sel: null, hover: null, stroke: null, clip: null,
    saveT: 0, pv: null, pvKey: '', cv: null, ctx: null, s: 1, raf: 0, last: 0, probs: [], seenBr: {},
  }; M74.Maker = Maker;
  MK.Maker = Maker;
  for (const t in ENT_PARAMS) Maker.bp[t] = entDefaults(t);

  const F_ = () => Maker.M.floors[Maker.fi]; M74.F_ = F_;
  const R_ = () => roomAt(F_(), Maker.rx, Maker.ry) || F_().rooms[0]; M74.R_ = R_;
  function toast(msg) {
    const t = $('mkToast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(Maker._toastT); Maker._toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---- undo, redo and saving */
  function snap() { return JSON.stringify(Maker.M); }
  function pushUndo() { Maker.undo.push(snap()); if (Maker.undo.length > 120) Maker.undo.shift(); Maker.redo.length = 0; syncUndo(); }
  function restore(s) {
    const fi = Maker.fi, rx = Maker.rx, ry = Maker.ry;
    Maker.M = JSON.parse(s);
    Maker.fi = Math.min(fi, Maker.M.floors.length - 1);
    if (!roomAt(F_(), rx, ry)) { const r0 = F_().rooms[0]; Maker.rx = r0.x; Maker.ry = r0.y; }
    Maker.sel = null;
    changed(true);
  }
  function doUndo() { if (!Maker.undo.length) return; Maker.redo.push(snap()); restore(Maker.undo.pop()); syncUndo(); toast('Undone'); }
  function doRedo() { if (!Maker.redo.length) return; Maker.undo.push(snap()); restore(Maker.redo.pop()); syncUndo(); toast('Redone'); }
  function syncUndo() { const u = $('mkUndo'), r = $('mkRedo'); if (u) u.disabled = !Maker.undo.length; if (r) r.disabled = !Maker.redo.length; }
  function scheduleSave() {
    clearTimeout(Maker.saveT);
    const s = $('mkSaved'); if (s) s.textContent = 'Editing';
    Maker.saveT = setTimeout(saveNow, 700);
  }
  function saveNow() {
    clearTimeout(Maker.saveT);
    if (!Maker.M) return;
    const ok = Store.put(Maker.M);
    const s = $('mkSaved'); if (s) s.textContent = ok ? 'Saved' : 'Not saved: storage full';
    const rooms = Maker.M.floors.reduce((n, F) => n + F.rooms.length, 0);
    if (ok && rooms >= 5) Meta.max('mapsMade', Store.list.length);
  }
  // after any change: redraw what depends on it
  function changed(all) {
    Maker.pvKey = '';
    if (all) { renderPanes(); } else { M74.renderFloor(); M74.renderRoomPane(); }
    M74.renderCrumb(); M74.validateSoon();
    scheduleSave();
  }

  /* ---- building the screen */
  function build() {
    if (Maker.built) return;
    Maker.built = true;
    const sec = el('section', 'panel'); sec.id = 'maker'; sec.hidden = true; sec.setAttribute('aria-label', 'Map Maker');
    sec.style.cssText = 'padding:0;display:block;gap:0;align-items:stretch;justify-content:flex-start';
    sec.innerHTML = `
<div class="mkh" id="mkHub">
  <div class="mkh-in">
    <div class="mkh-head"><div><p class="kick">Build it, test it, send it</p><h2>Map Maker</h2></div><button class="btn" id="mkHubBack" type="button">Back</button></div>
    <div class="mkh-acts">
      <button class="mkh-act" id="mkNew" type="button"><span class="ai">${IC.plus}</span><b>New map</b><span>One empty start room. The rest is yours.</span></button>
      <button class="mkh-act alt" id="mkPasteOpen" type="button"><span class="ai">${IC.paste2}</span><b>Paste a code</b><span>Play or edit a map somebody sent you.</span></button>
    </div>
    <div class="mkh-paste" id="mkPasteBox" hidden>
      <textarea class="mk-in mk-code" id="mkPasteTxt" spellcheck="false" placeholder="BITMAP1..." aria-label="Map code"></textarea>
      <div class="row" style="justify-content:flex-start"><button class="mk-btn gold" id="mkPasteGo" type="button">Read code</button><button class="mk-btn" id="mkPasteClip" type="button">From clipboard</button></div>
      <p class="mkh-msg" id="mkPasteMsg" aria-live="polite"></p>
      <div id="mkPastePrev"></div>
    </div>
    <div class="mkh-sec"><h3>Your maps</h3><span id="mkCount"></span></div>
    <div class="mkh-list" id="mkMine"></div>
    <div class="mkh-sec"><h3>Examples</h3><span>Play them, or edit a copy</span></div>
    <div class="mkh-list" id="mkEx"></div>
  </div>
</div>
<div class="mke" id="mkEd" hidden>
  <header class="mke-top">
    <span id="mkTopL"></span>
    <div class="mke-title"><small>Map Maker <em id="mkSaved">Saved</em></small><input id="mkName" maxlength="${LIMITS.name}" aria-label="Map name" spellcheck="false"></div>
    <span id="mkTopR" style="display:flex;gap:6px;align-items:center"></span>
  </header>
  <div class="mke-body">
    <div class="mke-stage">
      <div class="mke-crumb" id="mkCrumb"></div>
      <div class="mke-cvw" id="mkCvw"><canvas id="mkCv" aria-label="Room editor"></canvas></div>
      <div class="mke-tools" id="mkTools"></div>
    </div>
    <div class="mke-grip" id="mkGrip" role="separator" aria-orientation="horizontal" aria-label="Drag to resize the panel" tabindex="0"></div>
    <div class="mke-tabs" id="mkTabs" role="tablist">
      <button type="button" role="tab" data-p="paint">Paint</button><button type="button" role="tab" data-p="room">Room</button><button type="button" role="tab" data-p="floor">Floor</button><button type="button" role="tab" data-p="map">Map</button>
    </div>
    <div class="mke-pane" id="mkPanePaint" data-pane="paint"></div>
    <div class="mke-pane" id="mkPaneRoom" data-pane="room"></div>
    <div class="mke-pane" id="mkPaneFloor" data-pane="floor"></div>
    <div class="mke-pane" id="mkPaneMap" data-pane="map"></div>
  </div>
</div>
<div class="mk-dlg" id="mkDlg" hidden><div class="mk-dlg-in" id="mkDlgIn" role="dialog" aria-modal="true"></div></div>
<div class="mk-toast" id="mkToast" aria-live="polite"></div>`;
    $('app').appendChild(sec);
    // hub
    $('mkHubBack').addEventListener('click', (e) => { e.preventDefault(); Maker.close(); });
    $('mkNew').addEventListener('click', (e) => { e.preventDefault(); const M = M74.newMap(); Store.put(M); M74.edit(M); });
    $('mkPasteOpen').addEventListener('click', (e) => { e.preventDefault(); const b = $('mkPasteBox'); b.hidden = !b.hidden; if (!b.hidden) $('mkPasteTxt').focus(); });
    $('mkPasteGo').addEventListener('click', (e) => { e.preventDefault(); readPasted($('mkPasteTxt').value); });
    $('mkPasteClip').addEventListener('click', async (e) => {
      e.preventDefault();
      try { const t = await navigator.clipboard.readText(); $('mkPasteTxt').value = t; readPasted(t); }
      catch (err) { $('mkPasteMsg').textContent = 'The clipboard is closed here. Paste the code in the box.'; }
    });
    $('mkPasteTxt').addEventListener('paste', () => setTimeout(() => { if (looksLikeCode($('mkPasteTxt').value)) readPasted($('mkPasteTxt').value); }, 0));
    // editor top bar
    const L = $('mkTopL'), R = $('mkTopR');
    L.appendChild(btn('ic', IC.back, 'Back to your maps', () => { saveNow(); showHub(); }));
    const bu = btn('ic', IC.undo, 'Undo (Ctrl Z)', doUndo); bu.id = 'mkUndo';
    const brd = btn('ic', IC.redo, 'Redo (Ctrl Y)', doRedo); brd.id = 'mkRedo';
    const chk = el('button', 'mke-chk', ''); chk.type = 'button'; chk.id = 'mkChk'; chk.addEventListener('click', (e) => { e.preventDefault(); setPane('map'); const p = $('mkProbs'); if (p) p.scrollIntoView({ block: 'center' }); });
    R.append(bu, brd, chk,
      btn('', IC.share + '<span class="lbl">Share</span>', 'Share code', (function () { return M74.openShare.apply(this, arguments); })),
      btn('', IC.test + '<span class="lbl">Room</span>', 'Test from this room', () => M74.play({ floor: Maker.fi, room: true })),
      btn('pri', IC.play + '<span class="lbl">Test</span>', 'Test the whole map', () => M74.play({ floor: 0 })));
    $('mkName').addEventListener('input', () => { Maker.M.name = $('mkName').value.slice(0, LIMITS.name); scheduleSave(); });
    $('mkName').addEventListener('change', () => { pushUndo(); Maker.M.name = $('mkName').value.trim() || 'Untitled map'; $('mkName').value = Maker.M.name; scheduleSave(); });
    // tools
    const tools = $('mkTools');
    for (const [id, label, key] of TOOLS) {
      const b = btn('', IC[id] + `<span class="tl">${label}</span><kbd>${key}</kbd>`, `${label} (${key})`, () => M74.setTool(id)); b.dataset.tool = id; tools.appendChild(b);
    }
    tools.appendChild(el('span', 'sep'));
    const mx = btn('', IC.mirX + '<span class="tl">Mirror</span><kbd>X</kbd>', 'Mirror left and right (X)', () => { Maker.mirX = !Maker.mirX; M74.syncTools(); }); mx.dataset.mir = 'x';
    const my = btn('', IC.mirY + '<span class="tl">Mirror</span><kbd>Y</kbd>', 'Mirror top and bottom (Y)', () => { Maker.mirY = !Maker.mirY; M74.syncTools(); }); my.dataset.mir = 'y';
    const gr = btn('', IC.grid + '<span class="tl">Grid</span><kbd>G</kbd>', 'Show the grid (G)', () => { Maker.showGrid = !Maker.showGrid; M74.syncTools(); }); gr.dataset.mir = 'g';
    tools.append(mx, my, gr);
    // tabs
    $('mkTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) { e.preventDefault(); setPane(b.dataset.p); } });
    // canvas
    Maker.cv = $('mkCv'); Maker.ctx = Maker.cv.getContext('2d');
    const cv = Maker.cv;
    cv.addEventListener('pointerdown', (function () { return M74.gDown.apply(this, arguments); }));
    cv.addEventListener('pointermove', (function () { return M74.gMove.apply(this, arguments); }));
    cv.addEventListener('pointerup', (function () { return M74.gUp.apply(this, arguments); }));
    cv.addEventListener('pointercancel', (function () { return M74.gUp.apply(this, arguments); }));
    cv.addEventListener('pointerleave', () => { Maker.hover = null; M74.renderCrumb(); });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    try { new ResizeObserver(() => M74.layoutCanvas()).observe($('mkCvw')); } catch (e) { window.addEventListener('resize', (function () { return M74.layoutCanvas.apply(this, arguments); })); }
    M74.initGrip();
    // dialog closes on the backdrop and Escape
    $('mkDlg').addEventListener('pointerdown', (e) => { if (e.target.id === 'mkDlg') M74.closeDlg(); });
    // keys: the Map Maker gets them first, the game never sees them while it is open
    window.addEventListener('keydown', M74.onKey, true);
  }

  /* ---- views */
  Maker.openHub = function () {
    M74.build(); Store.load();
    UI.hidePanels(); UI.hideOverlays();
    this.open = true;
    $('maker').hidden = false;
    if (!Save.data.seen.maker) { Save.data.seen.maker = 1; Save.store(); }
    showHub();
  };
  Maker.close = function () {
    saveNow();
    this.open = false; M74.stopLoop();
    $('maker').hidden = true; M74.closeDlg();
    UI.refresh(); UI.show('menu');
  };
  Maker.reopen = function () {
    M74.build();
    this.open = true;
    UI.hidePanels();
    $('maker').hidden = false;
    if (RTM.back === 'editor' && this.M) M74.showEditor(); else showHub();
  };
  function showHub() {
    M74.stopLoop();
    Maker.view = 'hub';
    $('mkHub').hidden = false; $('mkEd').hidden = true;
    renderHub();
  }
  function showEditor() {
    Maker.view = 'editor';
    $('mkHub').hidden = true; $('mkEd').hidden = false;
    renderPanes(); M74.syncTools(); syncUndo();
    requestAnimationFrame(() => { M74.layoutCanvas(); M74.startLoop(); });
  }
  function edit(M) {
    Maker.M = cloneMap(M); Maker.fi = 0; Maker.undo = []; Maker.redo = []; Maker.sel = null;
    const st = Maker.M.floors[0].rooms.find((r) => r.t === 'start') || Maker.M.floors[0].rooms[0];
    Maker.rx = st.x; Maker.ry = st.y; Maker.pvKey = '';
    if (!Maker.pane || Maker.pane === 'floor') Maker.pane = 'paint';
    M74.showEditor();
  }
  Maker.edit = M74.edit;

  /* ---- the hub */
  function mapStats(M) {
    const rooms = M.floors.reduce((n, F) => n + F.rooms.length, 0);
    const snakes = M.floors.reduce((n, F) => n + F.rooms.reduce((m, R) => m + R.e.filter((e) => e.t === 'sn').length, 0), 0);
    return { rooms, snakes, floors: M.floors.length };
  }
  function paintFloorThumb(c, w, h, F, cur) {
    c.fillStyle = '#120d0b'; c.fillRect(0, 0, w, h);
    if (!F || !F.rooms.length) return;
    let x0 = 99, x1 = -99, y0 = 99, y1 = -99;
    for (const R of F.rooms) { x0 = Math.min(x0, R.x); x1 = Math.max(x1, R.x); y0 = Math.min(y0, R.y); y1 = Math.max(y1, R.y); }
    const cw = Math.min((w - 8) / (x1 - x0 + 1), ((h - 8) / (y1 - y0 + 1)) * 1.2), ch = cw / 1.2;
    const ox = (w - cw * (x1 - x0 + 1)) / 2, oy = (h - ch * (y1 - y0 + 1)) / 2;
    for (const R of F.rooms) {
      const x = ox + (R.x - x0) * cw, y = oy + (R.y - y0) * ch;
      for (const s of doorsOf(F, R)) { const v = SIDES[s]; c.fillStyle = 'rgba(236,226,212,.35)'; c.fillRect(x + cw / 2 + v[0] * cw / 2 - 1, y + ch / 2 + v[1] * ch / 2 - 1, 2, 2); }
      c.fillStyle = RT[R.t] ? RT[R.t].col : '#888';
      c.globalAlpha = 0.85; c.fillRect(x + 1, y + 1, cw - 2, ch - 2); c.globalAlpha = 1;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 2, y + 2, cw - 4, ch - 4);
      if (cur && R.x === cur.x && R.y === cur.y) { c.strokeStyle = '#e3a54a'; c.lineWidth = 1.5; c.strokeRect(x + 0.75, y + 0.75, cw - 1.5, ch - 1.5); }
    }
  }
  function mapCard(it, ex) {
    const M = it.map || it, st = mapStats(M);
    const card = el('div', 'mkh-card' + (ex ? ' ex' : ''));
    const cv = canvasIcon(96, (c) => paintFloorThumb(c, 96, 72, M.floors[0]));
    cv.style.height = '72px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.height = Math.round(72 * dpr); safe(() => { const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); paintFloorThumb(c, 96, 72, M.floors[0]); });
    card.appendChild(cv);
    const ci = el('div', 'ci');
    ci.appendChild(el('b', null, esc(M.name)));
    ci.appendChild(el('small', null, esc(`${M.author ? 'by ' + M.author + '  ·  ' : ''}${st.floors > 1 ? st.floors + ' floors, ' : ''}${st.rooms} rooms, ${st.snakes} snakes`)));
    ci.appendChild(el('p', null, esc(M.desc || (ex ? '' : 'Last changed ' + new Date(it.t || Date.now()).toLocaleDateString()))));
    card.appendChild(ci);
    const cb = el('div', 'cb');
    cb.appendChild(btn('pri', IC.play + 'Play', 'Play ' + M.name, () => M74.playMap(M, 'hub')));
    if (ex) cb.appendChild(btn('gold', IC.edit + 'Edit a copy', 'Edit a copy', () => { const C = cloneMap(M); C.id = uid(); C.name = M.name + ' (copy)'; Store.put(C); M74.edit(C); }));
    else {
      cb.appendChild(btn('gold', IC.edit + 'Edit', 'Edit ' + M.name, () => M74.edit(M)));
      cb.appendChild(btn('ic', IC.share, 'Share ' + M.name, () => { Maker.M = cloneMap(M); M74.openShare(); }));
      cb.appendChild(btn('ic', IC.copy, 'Duplicate', () => { const C = cloneMap(M); C.id = uid(); C.name = (M.name + ' (copy)').slice(0, LIMITS.name); Store.put(C); renderHub(); }));
      const del = btn('ic red', IC.trash, 'Delete', () => {
        if (!del.classList.contains('on')) { del.classList.add('on'); toast('Tap delete again to remove it for good.'); setTimeout(() => del.classList.remove('on'), 2600); return; }
        Store.del(M.id); renderHub();
      });
      cb.appendChild(del);
    }
    card.appendChild(cb);
    return card;
  }
  function renderHub() {
    Store.load();
    const mine = $('mkMine'); mine.textContent = '';
    $('mkCount').textContent = Store.list.length ? `${Store.list.length} saved in this browser` : '';
    if (!Store.list.length) mine.appendChild(el('div', 'mkh-empty', 'Nothing here yet. Start a new map, edit a copy of an example, or paste a code somebody sent you. Maps live in this browser: share the code to keep one safe.'));
    for (const it of Store.list) mine.appendChild(mapCard(it, false));
    const ex = $('mkEx'); ex.textContent = '';
    for (const M of M74.EXAMPLES()) ex.appendChild(mapCard(M, true));
  }
  async function readPasted(txt) {
    const msg = $('mkPasteMsg'), prev = $('mkPastePrev');
    prev.textContent = '';
    if (!String(txt || '').trim()) { msg.textContent = 'Paste a map code first.'; return; }
    msg.textContent = 'Reading...';
    try {
      const M = await decodeMap(txt);
      msg.textContent = '';
      const st = mapStats(M);
      const box = el('div', 'mk-prev');
      const cv = canvasIcon(110, (c) => paintFloorThumb(c, 110, 82, M.floors[0]));
      const dpr = Math.min(window.devicePixelRatio || 1, 2); cv.height = Math.round(82 * dpr); safe(() => { const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); paintFloorThumb(c, 110, 82, M.floors[0]); });
      box.appendChild(cv);
      const info = el('div');
      info.innerHTML = `<b>${esc(M.name)}</b><div class="mk-stats"><span><b>${st.floors}</b>floor${st.floors === 1 ? '' : 's'}</span><span><b>${st.rooms}</b>rooms</span><span><b>${st.snakes}</b>snakes</span></div><p>${esc(M.author ? 'By ' + M.author + '. ' : '')}${esc(M.desc || '')}</p>`;
      const r = el('div', 'row'); r.style.cssText = 'justify-content:flex-start;margin-top:8px';
      r.append(btn('pri', IC.play + 'Play', 'Play it', () => { Meta.add('mapImports'); M74.playMap(M, 'hub'); }),
        btn('gold', IC.edit + 'Save and edit', 'Save to your maps and edit', () => { Store.put(M); Meta.add('mapImports'); M74.edit(M); }));
      info.appendChild(r);
      box.appendChild(info);
      prev.appendChild(box);
    } catch (e) { msg.textContent = codeError(e); }
  }

  /* ---- panes */
  function setPane(p) {
    const wide = window.matchMedia('(min-width: 980px)').matches;
    if (p === 'floor' && wide) p = 'paint';
    Maker.pane = p;
    for (const b of $('mkTabs').querySelectorAll('[data-p]')) b.setAttribute('aria-selected', b.dataset.p === p ? 'true' : 'false');
    for (const pn of document.querySelectorAll('#mkEd .mke-pane')) pn.classList.toggle('on', pn.dataset.pane === p);
  }
  function renderPanes() {
    if (!Maker.M) return;
    $('mkName').value = Maker.M.name;
    M74.renderPaint(); M74.renderRoomPane(); M74.renderFloor(); M74.renderMapPane(); M74.renderCrumb(); M74.validateSoon();
    setPane(Maker.pane || 'paint');
  }
  function syncTools() {
    for (const b of $('mkTools').querySelectorAll('[data-tool]')) b.classList.toggle('on', b.dataset.tool === Maker.tool);
    for (const b of $('mkTools').querySelectorAll('[data-mir]')) b.classList.toggle('on', b.dataset.mir === 'x' ? Maker.mirX : b.dataset.mir === 'y' ? Maker.mirY : Maker.showGrid);
    Maker.cv && (Maker.cv.style.cursor = Maker.tool === 'move' ? 'pointer' : 'crosshair');
  }
  function setTool(id) { Maker.tool = id; if (id !== 'move') Maker.sel = null; M74.syncTools(); M74.renderInspector(); }

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
