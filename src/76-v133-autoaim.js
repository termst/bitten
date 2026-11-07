/* src/76-v133-autoaim.js: v13.3: auto aim. From v13.3. Lines 39449 to 39560 of the v13.7 script. */
/* ===== v13.3: Auto aim. Walk only: the apple picks the best target and shoots by itself.
   On with the code AUTOAIM (Code tab, no admin needed) or the Auto aim switch in Admin.
   Manual aim always wins: touch the aim stick, hold the mouse or press an arrow key and you steer. ===== */
(function autoaim133() {
  'use strict';
  try {
    const LIT = ['AUTO AIM ON', 'AUTO AIM OFF'];
    try { for (const s of LIT) if (typeof TEXT_LIT9 !== 'undefined' && TEXT_LIT9.popups && !TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s); } catch (e) { /* texts file is optional */ }

    const adminA = () => { try { return window.__bitten && window.__bitten.admin23 && window.__bitten.admin23.A; } catch (e) { return null; } };
    const isOn = () => { const A = adminA(); return !!(A && A.t && A.t.aim); };

    /* how much a kind is worth shooting first. Healers and thieves first, things that explode from far away. */
    const KIND_W = { lobby: 2.4, handel: 2.1, sniper: 1.9, bril: 1.45, kameleon: 1.3, kamerlid: 1.1, rocket: 1.15, tetra: 1.15, driekop: 1.2, splitter: 0.9, rotter: 1.3, raver: 0.8, grub: 0.85, splitling: 0.8 };
    const BLAST = { fuel: 1, creeper: 1 };

    const mem = new WeakMap();      // snake -> last position and smoothed velocity
    let cur = null, curT = 0, lastT = 0, wasOn = false, dbg = { target: null, fired: 0, picks: 0 };

    function track(room, now) {
      const dt = clamp(now - lastT, 0.001, 0.12);
      for (const sn of room.snakes) {
        if (!sn.alive) continue;
        let m = mem.get(sn);
        if (!m) { mem.set(sn, { x: sn.x, y: sn.y, vx: 0, vy: 0 }); continue; }
        const vx = (sn.x - m.x) / dt, vy = (sn.y - m.y) / dt, k = Math.min(1, dt * 9);
        // a teleport or a burrow jump is not a speed
        if (Math.abs(vx) > 700 || Math.abs(vy) > 700) { m.vx = 0; m.vy = 0; } else { m.vx += (vx - m.vx) * k; m.vy += (vy - m.vy) * k; }
        m.x = sn.x; m.y = sn.y;
      }
    }

    /* one aim point on a snake: the head, or a body piece when the head is armored or hidden */
    function bestPoint(room, P, sn, ss, R, pierce) {
      const m = mem.get(sn) || { vx: 0, vy: 0 };
      const armored = sn.trait === 'armor';
      const pts = [{ x: sn.x, y: sn.y, f: armored ? 0.45 : 1 }];
      if (sn.pts) for (let k = 1; k < sn.pts.length; k += 2) { const p = sn.pts[k]; if (p && !p.hid) pts.push({ x: p.x, y: p.y, f: armored ? 1 : 0.8 }); }
      let best = null;
      for (const p of pts) {
        let tx = p.x, ty = p.y;
        for (let i = 0; i < 2; i++) {
          const t = dist(P.x, P.y, tx, ty) / ss;
          tx = clamp(p.x + m.vx * t * 0.85, 8, RW - 8); ty = clamp(p.y + m.vy * t * 0.85, 8, RH - 8);
        }
        const d = dist(P.x, P.y, tx, ty);
        if (d > R || d < 1) continue;
        if (!pierce && !clearLine(room, P.x, P.y, tx, ty)) continue;
        const s = p.f / (1 + d / 500);
        if (!best || s > best.s) best = { x: tx, y: ty, d, s };
      }
      return best;
    }

    function pick() {
      const P = G.player, room = G.room;
      if (!P || !room) return null;
      const ss = Math.max(60, (P.shotSpeed || 320) * ((P.mods && P.mods.shot) || 1));
      const R = Math.min(560, (P.range || 255) * ((P.mods && P.mods.range) || 1) * 0.92);
      const pierce = !!(P.pierce || P.pick || P.cannon);
      const dmg = typeof seedDmg === 'function' ? seedDmg(P) : (P.dmg || 1);
      let best = null;
      for (const sn of room.snakes) {
        if (!sn.canBeHit() || sn.burrowed || sn.shell || sn.fade < 0.25) continue;
        const pt = bestPoint(room, P, sn, ss, R, pierce);
        if (!pt) continue;
        let w = (KIND_W[sn.kind] || 1) * (sn.champ ? 1.25 : 1);
        const near = clamp((280 - pt.d) / 280, 0, 1);
        w *= 1 + near * 1.5;                                            // close things bite first
        if (sn.lunge > 0 || sn.charge) w *= 1.6;                         // already coming at you
        if (BLAST[sn.kind]) w *= pt.d > 130 ? 1.7 : 0.7;                 // blow them up from a distance
        w *= 1 + (1 - clamp(sn.hp / sn.maxHp, 0, 1)) * 0.6;              // finish what is hurt
        if (sn.hp <= dmg * 2) w *= 1.35;                                 // two seeds from dead
        if (sn.shieldT > 0) w *= 0.6;                                    // shielded by a lobbyist
        if (sn.isBoss) w *= 1.05;
        w *= pt.s;
        if (sn === cur) w *= 1.4;                                        // do not flip between targets
        if (!best || w > best.w) best = { sn, w, x: pt.x, y: pt.y };
      }
      return best;
    }

    const orig = Input.aimVec;
    Input.aimVec = function (px, py) {
      const manual = orig.call(this, px, py);
      const on = isOn();
      if (on !== wasOn) {
        wasOn = on;
        try { if (G.player) floatText(G.player.x, G.player.y - 30, on ? 'AUTO AIM ON' : 'AUTO AIM OFF', on ? '#9fe8ff' : '#a69688'); } catch (e) { /* cosmetic */ }
      }
      if (manual || !on) return manual;
      const P = G.player, room = G.room;
      if (!P || !room || G.state !== 'play' || P.dying > 0 || P.escaping > 0) return null;
      const now = G.t || 0;
      track(room, now); lastT = now;
      const b = pick();
      if (!b) { cur = null; dbg.target = null; return null; }
      if (b.sn !== cur) { cur = b.sn; curT = now; dbg.picks++; }
      dbg.target = b.sn.kind;
      const dx = b.x - P.x, dy = b.y - P.y, l = Math.hypot(dx, dy) || 1;
      dbg.fired++;
      return { x: dx / l, y: dy / l, touch: false, auto: true };
    };

    window.__bitten = window.__bitten || {};
    Object.assign(window.__bitten, { autoaim133: { isOn, pick, dbg, KIND_W } });
  } catch (e) {
    try { console.warn('autoaim133 failed', e); } catch (x) { /* ignore */ }
  }
})();


