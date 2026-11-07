/* src/64-v113-admin.js: v11.3: admin panel, locked powerups. From v11.3. Lines 31233 to 31507 of the v13.7 script. */
/* ===== v11.3: Admin panel in the house style (Custom Run dropdowns with snake pictures, icons on every powerup,
   curse and downgrade). Five new locked powerups, each opened by an achievement: Kaasschaaf, Fietsbel,
   Zoute Drop, Paraplu and the legendary De Nachtwacht. Clash rules for all five. ===== */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'safe64'); console.error(e); return fb; } };
  const bossK = (sn) => (sn.isBoss ? 0.5 : 1);

  /* ------------------------------------------------------------------ admin: the look */
  const css = document.createElement('style');
  css.textContent = `
#admin23 .bx23,#code23 .bx23{width:min(100%,520px);background:#0e0a09;border:1px solid var(--line);border-top:3px solid var(--apple);border-radius:3px;padding:18px 18px 16px;
  box-shadow:0 24px 70px rgba(0,0,0,.75);font-family:var(--ui);scrollbar-width:thin}
#admin23 .bx23 h2,#code23 .bx23 h2{font:800 38px/.95 var(--display);color:var(--ink);margin:0 0 6px;letter-spacing:.01em}
#admin23 .bx23 h3{margin:18px 0 8px;font:600 12px/1 var(--ui);letter-spacing:.3em;text-transform:uppercase;color:var(--apple-hi);display:flex;align-items:center;gap:10px}
#admin23 .bx23 h3::after{content:"";flex:1;height:1px;background:var(--line)}
#admin23 .i23{font:600 12px/1.5 var(--ui);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:2px;padding:7px 10px;margin:4px 0 2px}
#code23 .bx23 p{font:500 15px/1.35 var(--ui);color:var(--muted)}
#admin23 .g23{gap:6px}
#admin23 .b23,#code23 .b23{font:600 13px/1.1 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--ink);min-height:38px;padding:8px 8px;border-radius:2px;
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid var(--line);transition:border-color .12s,background .12s,color .12s}
#admin23 .b23:hover,#code23 .b23:hover{border-color:rgba(236,226,212,.45)}
#admin23 .b23.on{color:var(--toffee);border-color:var(--toffee);background:rgba(227,165,74,.1);box-shadow:inset 0 -2px 0 var(--toffee)}
#admin23 .b23:focus-visible,#code23 .b23:focus-visible{outline:2px solid var(--ink);outline-offset:1px}
#admin23 .r23 .b23,#code23 #codeGo23{background:var(--apple);border-color:var(--apple);color:#fff4ec;letter-spacing:.18em;min-height:44px}
#admin23 .r23 .b23:hover,#code23 #codeGo23:hover{background:var(--apple-hi);border-color:var(--apple-hi)}
#admin23 input[type=text],#code23 input[type=text]{font:500 15px/1.2 var(--ui);color:var(--ink);background:#120d0b;border:1px solid var(--line);border-radius:2px;padding:9px 11px;-webkit-user-select:text;user-select:text}
#admin23 input[type=text]:focus,#code23 input[type=text]:focus{outline:2px solid var(--toffee);outline-offset:1px}
#admin23 .dd19{margin-top:6px}
#admin23 .dd19 .ddb19{height:40px;font-size:14px}
#admin23 .dd19 .pl19,.ddp19 .pl19{display:block;width:4px;height:18px;border-radius:1px;background:var(--apple)}
#admin23 .l23{max-height:210px;gap:4px;margin-top:6px;padding-right:2px}
#admin23 .l23 .b23{display:grid;grid-template-columns:24px minmax(0,1fr);align-items:center;gap:8px;text-align:left;padding:4px 8px 4px 4px;min-height:34px;font-size:12px;letter-spacing:.04em;text-transform:none}
#admin23 .l23 .b23 canvas{width:24px;height:24px;display:block}
#admin23 .l23 .b23 span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#admin23 .l23 .b23.rare113 span{color:#ffb44a}
#admin23 .l23 .b23.lk113 span::after{content:" LOCKED";font-size:9px;letter-spacing:.14em;color:var(--faint)}
#admin23 .m23{font:600 13px/1.3 var(--ui);color:var(--toffee);letter-spacing:.04em}
.ddp19{z-index:95}
`;
  document.head.appendChild(css);

  function icon(id, S) {
    const k = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas');
    cv.width = cv.height = Math.round(S * k);
    const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, (S * k) / 2, (S * k) / 2);
    safe(() => drawItemIcon(c, id, S * 0.82, 1));
    return cv;
  }
  function decorate(body) {
    for (const b of body.querySelectorAll('.l23 .b23[data-id]')) {
      if (b._ic113) continue; b._ic113 = true;
      const id = b.dataset.id, txt = b.textContent;
      b.textContent = '';
      b.appendChild(icon(id, 24));
      const s = document.createElement('span'); s.textContent = txt; b.appendChild(s);
      if (ITEMS[id] && ITEMS[id].rare) b.classList.add('rare113');
      if (ITEMS[id] && typeof itemUnlocked === 'function' && !itemUnlocked(id)) b.classList.add('lk113');
    }
  }
  function adm113(body) {
    const dd = window.__bitten && window.__bitten.dd19;
    if (dd) for (const sel of body.querySelectorAll('select')) safe(() => dd.enhance(sel));
    decorate(body);
    if (!body._mo113) {
      body._mo113 = new MutationObserver(() => decorate(body));
      body._mo113.observe(body, { childList: true, subtree: true });
      const bx = body.closest('.bx23');
      if (bx && dd) bx.addEventListener('scroll', () => dd.close(false), { passive: true });
    }
  }
  Object.assign(window.__bitten || (window.__bitten = {}), { adm113 });

  /* ------------------------------------------------------------------ five locked powerups */
  const NEW = {
    kaasschaaf: { lock: 'slice25', name: 'Kaasschaaf', desc: 'Your first seed on every snake deals 60% extra damage. Bosses get half.', apply(p) { p.kaas25 = true; } },
    fietsbel: { lock: 'bell25', name: 'Fietsbel', desc: 'Every 6 seconds in a fight, nearby snakes are dazed 0.7 seconds and take half your damage. Bosses barely notice.', apply(p) { p.bel25 = true; p.belT25 = 3; } },
    zoutedrop: { lock: 'zout25', name: 'Zoute Drop', desc: 'Every downgrade you carry: 8% more damage, up to 32%.', apply(p) { p.zout25 = true; } },
    paraplu: { lock: 'rain25', name: 'Paraplu', desc: 'Spit that gets close pops. Once every 1.5 seconds.', apply(p) { p.plu25 = true; p.pluT25 = 0; } },
    nachtwacht: { rare: true, lock: 'night25', name: 'De Nachtwacht', desc: 'Every 15 kills, every snake in the room takes 3x your damage. Bosses take half. Max once per 3 seconds.', apply(p) { p.wacht25 = true; p.wachtN25 = 0; p.wachtT25 = 0; } },
  };
  for (const id in NEW) { ITEMS[id] = NEW[id]; if (!ITEM_IDS.includes(id)) ITEM_IDS.push(id); }
  safe(() => { for (const id in NEW) SELL[id] = NEW[id].rare ? 12 : 5; });
  safe(() => { for (const id in NEW) ITEM_THREAT[id] = NEW[id].rare ? 5 : 3; });

  const ACH25 = [
    { id: 'slice25', reward: 'kaasschaaf', name: 'Dun Gesneden', desc: 'Kill 50 Splitters.', stat: 'k_splitter', goal: 50 },
    { id: 'bell25', reward: 'fietsbel', name: 'Fietsenrek', desc: 'Kill 2000 snakes.', stat: 'kills', goal: 2000 },
    { id: 'zout25', reward: 'zoutedrop', name: 'Zoutgehalte', desc: 'Get 40 downgrades.', stat: 'downs', goal: 40 },
    { id: 'rain25', reward: 'paraplu', name: 'Hollands Weer', desc: 'Heal 150 times.', stat: 'heals', goal: 150 },
    { id: 'night25', reward: 'nachtwacht', name: 'Schutterij', desc: 'Beat 50 bosses.', stat: 'bosses', goal: 50 },
  ];
  for (const a of ACH25) if (!ACHS.some((x) => x.id === a.id)) ACHS.push(a);


  /* effects */
  const i0 = initPlayer9;
  initPlayer9 = function (P, C) { i0(P, C); Object.assign(P, { kaas25: false, bel25: false, belT25: 3, zout25: false, plu25: false, pluT25: 0, wacht25: false, wachtN25: 0, wachtT25: 0 }); };

  const sd0 = seedDmg;
  seedDmg = function (P) {
    let d = sd0(P);
    if (P && P.zout25 && P.downs) d *= 1 + Math.min(0.32, 0.08 * P.downs.length);
    return d;
  };

  const ht0 = hit9;
  hit9 = function (room, s, sn, dmg) {
    ht0(room, s, sn, dmg);
    const P = G.player; if (!P || !P.kaas25) return;
    safe(() => {
      if (sn.kaas25 || !sn.alive || !sn.canBeHit()) return;
      sn.kaas25 = true;
      sn.hurt(dmg * 0.6 * bossK(sn), s.x, s.y);
      floatText(s.x, s.y - 14, 'KAAS', '#f2d36a');
    });
  };

  const up0 = updatePlayer9;
  updatePlayer9 = function (P, dt, room, sp) {
    up0(P, dt, room, sp);
    if (!room || !room.snakes) return;
    const fight = room.locked && room.snakes.some((s) => s.alive);
    safe(() => {
      if (P.bel25 && fight) {
        P.belT25 -= dt;
        if (P.belT25 <= 0) {
          P.belT25 = 6; let n = 0;
          for (const sn of room.snakes) {
            if (!sn.alive || sn.burrowed || !sn.canBeHit() || dist(sn.x, sn.y, P.x, P.y) > 110) continue;
            sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.15 : 0.7);
            sn.hurt(seedDmg(P) * 0.5 * bossK(sn), P.x, P.y); n++;
          }
          for (const r of [30, 80]) addP({ kind: 'ring', x: P.x, y: P.y, vx: 0, vy: 0, r, life: 0.35, col: '#ffe8a0', drag: 0, glow: true });
          floatText(P.x, P.y - 26, 'TRING', '#ffe8a0');
          safe(() => Sfx.dingdong());
        }
      }
      if (P.plu25) {
        P.pluT25 = Math.max(0, P.pluT25 - dt);
        if (P.pluT25 <= 0) {
          for (let i = G.venom.length - 1; i >= 0; i--) {
            const v = G.venom[i]; if (v.friendly) continue;
            if (dist2(v.x, v.y, P.x, P.y) < 40 * 40) {
              burst(v.x, v.y, 5, v.col || '#9ad8ff', { min: 30, max: 80, lmin: 0.2, lmax: 0.4, glow: true });
              G.venom.splice(i, 1); P.pluT25 = 1.5; P.pluShow25 = 0.5; safe(() => Sfx.clank()); break;
            }
          }
        }
        P.pluShow25 = Math.max(0, (P.pluShow25 || 0) - dt);
      }
      if (P.wacht25) P.wachtT25 = Math.max(0, P.wachtT25 - dt);
    });
  };

  const ok0 = onKill9;
  onKill9 = function (sn, room, P) {
    ok0(sn, room, P);
    if (!P || !P.wacht25) return;
    safe(() => {
      P.wachtN25 = (P.wachtN25 || 0) + 1;
      if (P.wachtN25 < 15 || P.wachtT25 > 0) return;
      P.wachtN25 = 0; P.wachtT25 = 3;
      const d = seedDmg(P) * 3;
      for (const o of room.snakes.slice()) {
        if (o === sn || !o.alive || o.burrowed || !o.canBeHit()) continue;
        o.hurt(d * bossK(o), P.x, P.y);
        addP({ kind: 'dot', x: o.x, y: o.y, vx: 0, vy: -30, r: 3, life: 0.4, col: '#ffd36a', glow: true, drag: 1 });
      }
      flashLight(P.x, P.y, 260, 0.8, 0.35);
      floatText(P.x, P.y - 30, 'VUUR!', '#ffd36a', true);
      safe(() => Sfx.boom(false)); G.shake = Math.max(G.shake || 0, 4);
    });
  };

  /* a small umbrella over the apple when it pops spit */
  const dp0 = drawPlayer;
  drawPlayer = function (c) {
    dp0(c);
    const P = G.player; if (!P || !P.plu25 || !(P.pluShow25 > 0)) return;
    safe(() => {
      const a = Math.min(1, P.pluShow25 / 0.2);
      c.save(); c.globalAlpha = a; c.translate(P.x, P.y - 22);
      c.fillStyle = '#c3243a'; c.beginPath(); c.arc(0, 0, 13, Math.PI, 0); c.closePath(); c.fill();
      c.strokeStyle = '#2a0a10'; c.lineWidth = 1.2; c.stroke();
      c.strokeStyle = '#f2e6d0'; c.lineWidth = 1; c.beginPath(); c.moveTo(-4.5, -12); c.lineTo(-4.5, 0); c.moveTo(4.5, -12); c.lineTo(4.5, 0); c.stroke();
      c.restore();
    });
  };

  /* icons */
  const di0 = drawItemIcon;
  drawItemIcon = function (c, id, S, t = 0) {
    if (!NEW[id]) return di0.apply(this, arguments);
    const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    safe(() => ICON[id](c, R, t));
    c.restore();
  };
  const ln = (c, R, k) => Math.max(0.8, R * k);
  const ICON = {
    kaasschaaf(c, R, t) {
      // a wedge of cheese with holes, a slicer on top, a thin slice curling off
      c.fillStyle = '#f2c84a'; c.strokeStyle = '#5a3a08'; c.lineWidth = ln(c, R, 0.07);
      c.beginPath(); c.moveTo(-R * 0.85, R * 0.75); c.lineTo(R * 0.85, R * 0.75); c.lineTo(R * 0.85, R * 0.15); c.lineTo(-R * 0.85, R * 0.45); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#d8a82a'; for (const [x, y, r] of [[-0.4, 0.58, 0.1], [0.15, 0.5, 0.13], [0.55, 0.6, 0.08]]) circle(c, x * R, y * R, r * R);
      c.fillStyle = '#ffe28a'; c.beginPath(); c.moveTo(-R * 0.2, R * 0.28); c.quadraticCurveTo(R * 0.1, -R * 0.05 + Math.sin(t * 3) * R * 0.03, R * 0.5, R * 0.05); c.lineTo(R * 0.5, R * 0.16); c.quadraticCurveTo(R * 0.1, R * 0.08, -R * 0.2, R * 0.36); c.closePath(); c.fill();
      c.strokeStyle = '#2a2a33'; c.lineWidth = ln(c, R, 0.14); c.beginPath(); c.moveTo(-R * 0.05, R * 0.05); c.lineTo(-R * 0.7, -R * 0.75); c.stroke();
      c.fillStyle = '#c9ccd6'; c.strokeStyle = '#3a3c48'; c.lineWidth = ln(c, R, 0.06);
      rrect(c, -R * 0.3, -R * 0.08, R * 0.72, R * 0.22, R * 0.05); c.fill(); c.stroke();
      c.fillStyle = '#1a1a22'; c.fillRect(-R * 0.18, R * 0.0, R * 0.48, R * 0.05);
    },
    fietsbel(c, R, t) {
      const sw = Math.sin(t * 9) * 0.12;
      c.save(); c.rotate(sw);
      c.fillStyle = '#c9ccd6'; c.strokeStyle = '#2a2c36'; c.lineWidth = ln(c, R, 0.08);
      c.beginPath(); c.arc(0, R * 0.1, R * 0.62, Math.PI, 0); c.lineTo(R * 0.7, R * 0.3); c.lineTo(-R * 0.7, R * 0.3); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.6)'; ell(c, -R * 0.25, -R * 0.2, R * 0.14, R * 0.24, -0.4); c.fill();
      c.fillStyle = '#2a2c36'; c.fillRect(-R * 0.1, -R * 0.68, R * 0.2, R * 0.2);
      c.fillStyle = '#c3243a'; rrect(c, R * 0.45, -R * 0.55, R * 0.42, R * 0.16, R * 0.05); c.fill();
      c.restore();
      c.fillStyle = '#4a4c58'; rrect(c, -R * 0.9, R * 0.42, R * 1.8, R * 0.18, R * 0.08); c.fill();
      c.strokeStyle = 'rgba(255,232,160,0.8)'; c.lineWidth = ln(c, R, 0.06);
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(0, R * 0.05, R * (0.82 + i * 0.16), s < 0 ? Math.PI * 1.05 : -0.35, s < 0 ? Math.PI * 1.35 : -0.05); c.stroke(); }
    },
    zoutedrop(c, R, t) {
      // a black diamond of salty licorice, sugar crystals, a white salt shaker dusting it
      c.save(); c.translate(-R * 0.08, R * 0.12); c.rotate(Math.PI / 4);
      c.fillStyle = '#16120f'; c.strokeStyle = '#000'; c.lineWidth = ln(c, R, 0.06);
      rrect(c, -R * 0.45, -R * 0.45, R * 0.9, R * 0.9, R * 0.12); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = ln(c, R, 0.05);
      c.beginPath(); c.moveTo(-R * 0.3, -R * 0.3); c.lineTo(R * 0.3, -R * 0.3); c.stroke();
      c.restore();
      c.fillStyle = '#f4f0e6';
      for (let i = 0; i < 9; i++) { const ph = (t * 0.6 + i * 0.13) % 1; c.fillRect(-R * 0.4 + ((i * 0.37) % 1) * R * 0.7, -R * 0.15 + ph * R * 0.6, R * 0.07, R * 0.07); }
      c.fillStyle = '#e8e2d0'; c.strokeStyle = '#4a4438'; c.lineWidth = ln(c, R, 0.06);
      rrect(c, R * 0.38, -R * 0.92, R * 0.42, R * 0.55, R * 0.1); c.fill(); c.stroke();
      c.fillStyle = '#9a9488'; c.fillRect(R * 0.38, -R * 0.92, R * 0.42, R * 0.14);
    },
    paraplu(c, R, t) {
      c.strokeStyle = '#2a1a10'; c.lineWidth = ln(c, R, 0.09);
      c.beginPath(); c.moveTo(0, -R * 0.2); c.lineTo(0, R * 0.7); c.arc(-R * 0.16, R * 0.7, R * 0.16, 0, Math.PI); c.stroke();
      c.fillStyle = '#c3243a'; c.strokeStyle = '#3a0810'; c.lineWidth = ln(c, R, 0.07);
      c.beginPath(); c.moveTo(-R * 0.9, -R * 0.05); c.quadraticCurveTo(-R * 0.8, -R * 0.85, 0, -R * 0.88); c.quadraticCurveTo(R * 0.8, -R * 0.85, R * 0.9, -R * 0.05);
      for (let i = 0; i < 4; i++) { const x0 = 0.9 - i * 0.45, x1 = x0 - 0.45; c.quadraticCurveTo(((x0 + x1) / 2) * R, -R * 0.3, x1 * R, -R * 0.05); }
      c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#f2e6d0'; c.beginPath(); c.moveTo(-R * 0.3, -R * 0.1); c.quadraticCurveTo(-R * 0.25, -R * 0.7, 0, -R * 0.86); c.quadraticCurveTo(-R * 0.08, -R * 0.5, 0, -R * 0.08); c.closePath(); c.fill();
      c.fillStyle = '#9fd8ff';
      for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i * 0.33) % 1, x = [-0.7, 0.55, 0.85][i] * R; ell(c, x, -R * 0.9 + ph * R * 0.6, R * 0.05, R * 0.1); c.fill(); }
    },
    nachtwacht(c, R, t) {
      // a dark golden frame, a musket barrel with a flash, a captain's hat
      c.fillStyle = '#1a120a'; c.strokeStyle = '#c9a03a'; c.lineWidth = ln(c, R, 0.12);
      rrect(c, -R * 0.88, -R * 0.78, R * 1.76, R * 1.56, R * 0.06); c.fill(); c.stroke();
      const g = c.createRadialGradient(R * 0.2, -R * 0.1, 0, R * 0.2, -R * 0.1, R * 0.9);
      g.addColorStop(0, 'rgba(255,214,120,0.55)'); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(-R * 0.8, -R * 0.7, R * 1.6, R * 1.4);
      c.fillStyle = '#0c0805'; c.beginPath(); c.moveTo(-R * 0.55, -R * 0.05); c.lineTo(R * 0.05, -R * 0.05); c.quadraticCurveTo(-R * 0.25, -R * 0.55, -R * 0.55, -R * 0.05); c.fill();
      c.fillStyle = '#e8e0c8'; ell(c, -R * 0.25, -R * 0.12, R * 0.3, R * 0.06); c.fill();
      c.fillStyle = '#d8b06a'; circle(c, -R * 0.25, R * 0.18, R * 0.2);
      c.strokeStyle = '#6a4a2a'; c.lineWidth = ln(c, R, 0.1); c.beginPath(); c.moveTo(-R * 0.1, R * 0.45); c.lineTo(R * 0.5, -R * 0.35); c.stroke();
      const f = 0.6 + 0.4 * Math.sin(t * 6);
      c.fillStyle = `rgba(255,220,120,${f})`; sparkle(c, R * 0.58, -R * 0.45, R * 0.24, `rgba(255,230,150,${f})`);
      c.fillStyle = '#c3243a'; c.fillRect(-R * 0.55, R * 0.48, R * 0.6, R * 0.12);
    },
  };

  /* texts */
  safe(() => {
    for (const s of ['KAAS', 'TRING', 'VUUR!']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  });
  safe(() => { if (UI.buildItemCards) UI.buildItemCards(); });

  Object.assign(window.__bitten, { V113: { NEW, ACH25, ICON } });
})();


