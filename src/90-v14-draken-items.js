/* src/90-v14-draken-items.js: v14.5 dragon powerups. 21 powerups in the dragon theme (two legendary). On De Drakenhemel
   45% of powerup rolls are dragon ones; everywhere else 7% of rolls turn into one, so they are not exclusive to the floor.
   Seeded runs: the dragon ids are kept out of the shared pool (itemOk9), the normal roll draws exactly what it did
   before, and the 7% swap uses a hash of the run seed and a counter, not Math.random. */
(function () {
  'use strict';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { errNote14(e, 'draken90'); if (window.console) console.warn('v14 draken items', e); return fb; } };
  const DK = () => window.__bitten.DRAAK14;
  const inSky = () => !!(G.levelDef && G.levelDef.set === 'draken');
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const FIRE_LOOK = ['#5a1a04', '#ffd27a', '#ff7a2a'], GOLD_LOOK = ['#5a3a08', '#fff2b0', '#f2cf5a'], HORN_LOOK = ['#3a2a10', '#fff4dc', '#e8c88a'];
  const live = (P) => players14().includes(P);
  const NEW = {
    adem_dk: { w: 0.9, name: 'Drakenadem', desc: 'Every 5th shot you also breathe fire: a cone of 5 burning seeds (45% damage each). A dragon powerup.', apply(p) { p.adem14 = true; p.ademN14 = 0; } },
    neonvuur_dk: { w: 0.8, name: 'Neonvuur', desc: 'A quarter of your hits set the floor on neon fire for 2 seconds: snakes in it burn for 50% damage twice a second. A dragon powerup.', apply(p) { p.neon14 = true; } },
    muntspuug_dk: { w: 0.8, name: 'Muntspuug', desc: 'Every 8th shot you spit a gold coin: 2.5x damage, flies through snakes. A snake it kills drops a coin. A dragon powerup.', apply(p) { p.munt14 = true; p.muntN14 = 0; } },
    schubben_dk: { w: 0.8, name: 'Drakenschubben', desc: 'Scales grow on your skin: every 4th bite bounces off. A dragon powerup.', apply(p) { p.schub14 = true; p.schubN14 = 0; } },
    vleugels_dk: { w: 1, name: 'Drakenvleugels', desc: 'Small wings: 12% faster and 10% more range. A dragon powerup.', apply(p) { p.speed *= 1.12; p.range *= 1.1; p.wings14 = true; } },
    parel_dk: { w: 0.7, name: 'Hemelparel', desc: 'A pearl circles you. Every 18 seconds in a fight it heals 1 apple, if you are hurt. A dragon powerup.', apply(p) { p.parel14 = true; p.parelT14 = 18; } },
    schat_dk: { w: 0.9, name: 'Drakenschat', desc: '15 coins now. Your seeds hit 1% harder for every 4 coins you hold (at most 20%). A dragon powerup.', apply(p) { p.schat14 = true; if (live(p) && G.run) G.run.coins = (G.run.coins || 0) + 15; } },
    ei_dk: { w: 0.8, name: 'Drakenei', desc: 'An egg rolls after you. After 3 cleared rooms it hatches: a baby dragon that spits fire at the nearest snake (60% damage). A dragon powerup.', apply(p) { p.ei14 = true; p.eiN14 = 0; p.baby14 = null; } },
    staart_dk: { w: 0.8, name: 'Zwiepstaart', desc: 'Every 3.5 seconds in a fight a dragon tail sweeps round you: 140% damage to snakes close by, and it swats venom away. A dragon powerup.', apply(p) { p.staart14 = true; p.staartT14 = 3.5; p.swipe14 = 0; } },
    donder_dk: { w: 0.8, name: 'Donderklauw', desc: 'Every 6th hit calls lightning: it jumps to two more snakes for 150% damage. A dragon powerup.', apply(p) { p.donder14 = true; p.donderN14 = 0; } },
    toorn_dk: { rare: true, name: 'Drakentoorn', desc: 'On half your apples or less the dragon wakes up: 35% more damage, 20% faster shots. A dragon powerup.', apply(p) { p.toorn14 = true; } },
    hoorn_dk: { w: 0.9, name: 'Drakenhoorn', desc: 'Every 4th shot also fires a horn: 160% damage, big, and it goes through every snake. A dragon powerup.', apply(p) { p.hoorn14 = true; p.hoornN14 = 0; } },
    wraak_dk: { w: 0.8, name: 'Wraakvuur', desc: 'Bitten? Fire bursts out of you: 10 burning seeds in a ring. A dragon powerup.', apply(p) { p.wraak14 = true; } },
    zon_dk: { rare: true, name: 'Zonneschijf', desc: 'The sun on your back: every 9 seconds in a fight a flare throws 14 seeds all round (90% damage). A dragon powerup.', apply(p) { p.zon14 = true; p.zonT14 = 5; } },
    jade_dk: { w: 0.8, name: 'Jadeschub', desc: 'A lucky jade scale: every cleared room has a 30% chance to heal 1 apple. A dragon powerup.', apply(p) { p.jade14 = true; } },
    vuurspuwer_dk: { w: 0.9, name: 'Vuurspuwer', desc: 'Your seeds are embers: 20% more damage and they set snakes on fire, but they fly 8% slower. A dragon powerup.', apply(p) { p.vuur14 = true; p.shotSpeed *= 0.92; } },
    wolk_dk: { w: 0.8, name: 'Wolkenrijder', desc: 'Every 4 seconds you leave a small cloud where you stand. For 3 seconds it eats every venom that flies into it. A dragon powerup.', apply(p) { p.wolk14 = true; p.wolkT14 = 2; } },
    oog_dk: { w: 0.9, name: 'Drakenoog', desc: 'Every 2nd seed sees like a dragon and bends toward a snake. A dragon powerup.', apply(p) { p.oog14 = true; p.oogN14 = 0; } },
    lantaarn_dk: { w: 0.8, name: 'Lantaarnfeest', desc: 'Every snake you kill leaves a paper lantern. It rises and bursts after a second: 150% damage around it. A dragon powerup.', apply(p) { p.lantaarn14 = true; } },
    brul_dk: { w: 0.8, name: 'Drakenbrul', desc: 'Every 12 seconds in a fight you roar: snakes near you are stunned for a moment and the venom near you is blown away. A dragon powerup.', apply(p) { p.brul14 = true; p.brulT14 = 6; } },
    koning_dk: { w: 0.6, name: 'Drakenkoning', desc: 'King of the dragons: 4% more damage and 3% faster shots for every dragon powerup you carry. A dragon powerup.', apply(p) { p.koning14 = true; } },
  };
  const IDS = Object.keys(NEW);
  for (const id of IDS) { ITEMS[id] = NEW[id]; ITEM_IDS.push(id); SELL[id] = NEW[id].rare ? 12 : 5; ITEM_THREAT[id] = NEW[id].rare ? 4.5 : 3; }
  const TAGS = { adem_dk: 'counted multishot fire', neonvuur_dk: 'fire', muntspuug_dk: 'counted pierceshot', schubben_dk: 'shield counted', vleugels_dk: 'pace', parel_dk: 'heal helper', schat_dk: 'growth',
    ei_dk: 'helper', staart_dk: '', donder_dk: 'counted', toorn_dk: 'lowhp', hoorn_dk: 'counted pierceshot', wraak_dk: 'fire', zon_dk: 'blast', jade_dk: 'heal', vuurspuwer_dk: 'fire burn',
    wolk_dk: 'shield', oog_dk: 'path', lantaarn_dk: 'counter', brul_dk: 'loud', koning_dk: 'growth' };
  for (const id of IDS) tagClash13(id, TAGS[id] || '');
  const dkCount = (P) => P.items.filter((id) => NEW[id]).length;

  {
    const i0 = initPlayer9;
    initPlayer9 = function (P, C) {
      i0(P, C);
      Object.assign(P, { adem14: false, ademN14: 0, neon14: false, munt14: false, muntN14: 0, schub14: false, schubN14: 0, wings14: false, parel14: false, parelT14: 18, schat14: false,
        ei14: false, eiN14: 0, baby14: null, staart14: false, staartT14: 3.5, swipe14: 0, donder14: false, donderN14: 0, toorn14: false, hoorn14: false, hoornN14: 0, wraak14: false,
        zon14: false, zonT14: 5, jade14: false, vuur14: false, wolk14: false, wolkT14: 2, oog14: false, oogN14: 0, lantaarn14: false, brul14: false, brulT14: 6, roar14: 0, koning14: false, parelA14: 0, healGlow14: 0 });
    };
    for (const k of ['ademN14', 'muntN14', 'schubN14', 'parelT14', 'eiN14', 'baby14', 'staartT14', 'swipe14', 'donderN14', 'hoornN14', 'zonT14', 'wolkT14', 'oogN14', 'brulT14', 'roar14', 'parelA14', 'healGlow14']) SELL_SKIP.add(k);
  }

  /* ------------------------------------------------------------------ the pool */
  {
    let allow = false;
    const io0 = itemOk9;
    itemOk9 = function (id, P) { if (NEW[id] && !allow) return false; return io0(id, P); };
    const free = (P) => { allow = true; try { return IDS.filter((id) => !P.items.includes(id) && !G.run.pending.has(id) && itemOk9(id, P)); } finally { allow = false; } };
    const ni0 = nextItemId;
    nextItemId = function (legend = 0.05) {
      const P = G.player;
      if (!P || !G.run) return ni0.call(this, legend);
      if (inSky()) {
        const f = free(P);
        if (f.length && Math.random() < 0.45) {
          const rare = f.filter((id) => NEW[id].rare), norm = f.filter((id) => !NEW[id].rare);
          if (rare.length && (Math.random() < legend * 3 || !norm.length)) return weightedPick(rare);
          if (norm.length) return weightedPick(norm);
        }
        return ni0.call(this, legend);
      }
      const id = ni0.call(this, legend);
      return safe(() => {
        // everywhere else: 7% of rolls become a dragon powerup, picked from a hash (no Math.random: seeded runs keep their draws)
        const run = G.run, n = run.dk14n = (run.dk14n || 0) + 1;
        const r = mulberry32((((run.seed >>> 0) ^ 0x44524b4e) + n * 0x9e3779b1) >>> 0);
        if (r() >= DK().itemOdds) return id;
        const f = free(P).filter((x) => !NEW[x].rare || r() < 0.3);
        return f.length ? f[Math.floor(r() * f.length)] : id;
      }, id);
    };
  }

  /* ------------------------------------------------------------------ numbers */
  {
    const dk0 = dmgK9;
    dmgK9 = function (P) {
      let k = dk0(P);
      if (!P) return k;
      if (P.schat14 && G.run) k *= 1 + Math.min(0.2, Math.floor((G.run.coins || 0) / 4) * 0.01);
      if (P.toorn14 && P.hp <= P.maxHp / 2) k *= 1.35;
      if (P.vuur14) k *= 1.2;
      if (P.koning14) k *= 1 + 0.04 * dkCount(P);
      return k;
    };
    const rk0 = rateK9;
    rateK9 = function (P) {
      let k = rk0(P);
      if (!P) return k;
      if (P.toorn14 && P.hp <= P.maxHp / 2) k *= 0.83;
      if (P.koning14) k *= Math.pow(0.97, dkCount(P));
      return k;
    };
  }

  /* ------------------------------------------------------------------ shots and hits */
  const ring = (P, n, mult, look, x = P.x, y = P.y) => {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rnd(0.3), s = makeSeed(P, x + Math.cos(a) * 10, y + Math.sin(a) * 10 - 2, a, { mult, size: 0.85 }); s.look9 = look; s.ember = true; }
  };
  {
    const fr0 = fire9;
    fire9 = function (P, base) {
      fr0(P, base);
      safe(() => {
        const main = G.seeds[G.seeds.length - 1];
        if (P.oog14 && ++P.oogN14 % 2 === 0 && main) main.home = true;
        if (P.adem14 && ++P.ademN14 % 5 === 0) {
          for (let i = -2; i <= 2; i++) { const a = base + i * 0.16, s = makeSeed(P, P.x + Math.cos(a) * 12, P.y + Math.sin(a) * 12 - 2, a, { mult: 0.45, size: 0.75 }); s.ember = true; s.look9 = FIRE_LOOK; s.life *= 0.55; }
          addP({ kind: 'dot', x: P.x + Math.cos(base) * 16, y: P.y + Math.sin(base) * 16, vx: Math.cos(base) * 60, vy: Math.sin(base) * 60, r: 6, life: 0.3, col: '#ff8a2a', glow: true, drag: 3 });
          Sfx.puff ? Sfx.puff() : Sfx.spit();
        }
        if (P.munt14 && ++P.muntN14 % 8 === 0) {
          const s = makeSeed(P, P.x + Math.cos(base) * 12, P.y + Math.sin(base) * 12 - 2, base, { mult: 2.5, size: 1.3 });
          s.pierce = true; s.coin14 = true; s.look9 = GOLD_LOOK; Sfx.coin();
        }
        if (P.hoorn14 && ++P.hoornN14 % 4 === 0) {
          const s = makeSeed(P, P.x + Math.cos(base) * 12, P.y + Math.sin(base) * 12 - 2, base + 0.06, { mult: 1.6, size: 1.6 });
          s.pierce = true; s.horn14 = true; s.look9 = HORN_LOOK;
        }
      });
    };
    const sd0 = seed9;
    seed9 = function (P, s, o) {
      sd0(P, s, o);
      if (P.vuur14) { s.ember = true; if (!s.look9) s.look9 = FIRE_LOOK; }
    };
    const ht0 = hit9;
    hit9 = function (room, s, sn, dmg) {
      ht0(room, s, sn, dmg);
      const P = (s && s.owner14) || G.player; if (!P || !sn) return;
      safe(() => {
        if (s.coin14 && (!sn.alive || sn.dying > 0 || sn.hp <= 0) && !s.paid14) { s.paid14 = true; dropCoins(room, sn.x, sn.y, 1); }
        if (P.neon14 && Math.random() < 0.25) DK().neonPatch(room, sn.x, sn.y, { hostile: false, dmg: seedDmg(P) * 0.5, life: 2, r: 20, col: '#d84aff' });
        if (P.donder14 && ++P.donderN14 % 6 === 0) {
          const dd = seedDmg(P) * 1.5;
          zapChain(room, sn, sn, dd);
          const two = room.snakes.find((o) => o !== sn && o.canBeHit() && !o.burrowed && dist(o.x, o.y, sn.x, sn.y) < 160 && o.flash > 0);
          zapChain(room, two || sn, sn, dd);
          flashLight(sn.x, sn.y, 90, 0.8, 0.25);
        }
      });
    };
  }
  /* bites: the scales and the revenge fire */
  Hooks.layer('Player.hurt', 'v14 draken scales', function (next, n, sx, sy, src) {
    const P = this;
    if (P.schub14 && n > 0 && !(P.inv > 0) && !(P.dying > 0) && !P.god && !(P.dashT > 0)) {
      P.schubN14++;
      if (P.schubN14 % 4 === 0) {
        safe(() => {
          P.inv = Math.max(P.inv || 0, 0.6);
          floatText(P.x, P.y - 26, 'SCHUB', '#7ae0b0'); Sfx.clank();
          burst(P.x, P.y, 10, '#7ae0b0', { kind: 'shard', min: 40, max: 120, lmin: 0.2, lmax: 0.5 });
        });
        return false;
      }
    }
    const hp0 = P.hp;
    const r = next.call(this, n, sx, sy, src);
    if (r && P.wraak14 && P.hp < hp0 && G.room) safe(() => { ring(P, 10, 1, FIRE_LOOK); floatText(P.x, P.y - 30, 'WRAAK', '#ff8a2a'); flashLight(P.x, P.y, 80, 0.7, 0.3); });
    return r;
  });
  {
    const ok0 = onKill9;
    onKill9 = function (sn, room, P) {
      ok0.apply(this, arguments);
      if (!P || !room || !sn || !P.lantaarn14) return;
      safe(() => { const F = DK().fx(room); (F.lanterns || (F.lanterns = [])).push({ x: sn.x, y: sn.y, t: 0, owner: P, dmg: seedDmg(P) * 1.5, seed: sn.blinkSeed || 0 }); });
    };
  }
  Hooks.layer('Game.clearRoom', 'v14 draken items', function (next, room) {
    const r = next.call(this, room);
    safe(() => {
      for (const P of players14()) {
        if (P.dying > 0) continue;
        if (P.jade14 && Math.random() < 0.3 && P.hp < P.maxHp) { withPlayer(P, () => P.heal(1)); floatText(P.x, P.y - 26, 'JADE', '#7ae0b0'); }
        if (P.ei14 && !P.baby14 && room.type !== 'start') {
          P.eiN14++;
          if (P.eiN14 >= 3) { P.baby14 = { x: P.x - 18, y: P.y + 6, cd: 1, a: 0 }; floatText(P.x, P.y - 34, 'UITGEKOMEN', '#9ae86a', true); burst(P.x - 18, P.y + 6, 14, '#f2e2b8', { kind: 'shard', min: 30, max: 110, lmin: 0.3, lmax: 0.6 }); Sfx.squeak ? Sfx.squeak() : Sfx.pop10(); }
        }
      }
    });
    return r;
  });

  /* ------------------------------------------------------------------ every frame, per apple */
  {
    const up0 = updatePlayer9;
    updatePlayer9 = function (P, dt, room, sp) {
      up0(P, dt, room, sp);
      safe(() => tick(P, dt, room));
    };
  }
  function tick(P, dt, room) {
    if (P.roar14 > 0) P.roar14 -= dt;
    if (P.swipe14 > 0) P.swipe14 -= dt;
    if (P.healGlow14 > 0) P.healGlow14 -= dt;
    P.parelA14 += dt * 2.6;
    if (P.dying > 0 || !room) return;
    const fight = fighting10(room);
    // the egg rolls after you, the baby dragon flies after you
    if (P.ei14) {
      const B = P.baby14 || (P.egg14 || (P.egg14 = { x: P.x, y: P.y }));
      const tx = P.x - 20, ty = P.y + 8;
      B.x += (tx - B.x) * Math.min(1, dt * 5); B.y += (ty - B.y) * Math.min(1, dt * 5);
      if (P.baby14 && fight) {
        const b = P.baby14; b.cd -= dt;
        if (b.cd <= 0) {
          let best = null, bd = 260 * 260;
          for (const sn of room.snakes) { if (!sn.canBeHit() || sn.burrowed) continue; const d = dist2(sn.x, sn.y, b.x, b.y); if (d < bd) { bd = d; best = sn; } }
          if (best) { b.cd = 1.1; b.a = Math.atan2(best.y - b.y, best.x - b.x); const s = makeSeed(P, b.x, b.y - 6, b.a, { mult: 0.6, size: 0.7, noCan: true }); s.ember = true; s.look9 = FIRE_LOOK; }
          else b.cd = 0.3;
        }
      }
    }
    if (P.parel14 && fight) {
      P.parelT14 -= dt;
      if (P.parelT14 <= 0) { P.parelT14 = 18; if (P.hp < P.maxHp && P.heal(1)) { P.healGlow14 = 1; floatText(P.x, P.y - 26, '+1', '#ffe8a8'); } }
    }
    if (P.staart14 && fight) {
      P.staartT14 -= dt;
      if (P.staartT14 <= 0) {
        P.staartT14 = 3.5; P.swipe14 = 0.35;
        const R0 = 52, dd = seedDmg(P) * 1.4;
        for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(P.x, P.y, R0)) sn.hurt(dd, P.x, P.y);
        for (let i = G.venom.length - 1; i >= 0; i--) { const v = G.venom[i]; if (!v.friendly && dist2(v.x, v.y, P.x, P.y) < R0 * R0) G.venom.splice(i, 1); }
        Sfx.whoosh10();
      }
    }
    if (P.zon14 && fight) {
      P.zonT14 -= dt;
      if (P.zonT14 <= 0) { P.zonT14 = 9; ring(P, 14, 0.9, GOLD_LOOK); P.healGlow14 = 0.6; flashLight(P.x, P.y, 160, 0.9, 0.4); Sfx.boom(); }
    }
    if (P.wolk14 && fight) {
      P.wolkT14 -= dt;
      if (P.wolkT14 <= 0) { P.wolkT14 = 4; const F = DK().fx(room); (F.clouds || (F.clouds = [])).push({ x: P.x, y: P.y, t: 0, life: 3, r: 22 }); }
    }
    if (P.brul14 && fight) {
      P.brulT14 -= dt;
      if (P.brulT14 <= 0) {
        P.brulT14 = 12; P.roar14 = 0.6;
        for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && dist(sn.x, sn.y, P.x, P.y) < 130 + sn.headR) sn.stun = Math.max(sn.stun || 0, sn.isBoss ? 0.25 : 0.9);
        for (let i = G.venom.length - 1; i >= 0; i--) { const v = G.venom[i]; if (!v.friendly && dist2(v.x, v.y, P.x, P.y) < 130 * 130) G.venom.splice(i, 1); }
        floatText(P.x, P.y - 32, 'ROAAAR', '#ffcf6a', true); Sfx.roar(); G.shake = Math.max(G.shake || 0, 4);
      }
    }
  }
  /* room parts of the powerups: lanterns and clouds, once per frame */
  {
    const ur0 = updateRoom9;
    updateRoom9 = function (dt, room, frozen) {
      ur0(dt, room, frozen);
      const F = room && room.dk14;
      if (!F || frozen || !(dt > 0)) return;
      safe(() => {
        if (F.lanterns) for (let i = F.lanterns.length - 1; i >= 0; i--) {
          const L = F.lanterns[i]; L.t += dt;
          if (L.t < 0.9) continue;
          F.lanterns.splice(i, 1);
          const y = L.y - 24;
          for (const sn of room.snakes) if (sn.canBeHit() && !sn.burrowed && sn.hitTest(L.x, y, 46)) sn.hurt(L.dmg, L.x, y);
          burst(L.x, y, 18, '#ffb03a', { min: 50, max: 180, rmin: 1.2, rmax: 2.8, lmin: 0.3, lmax: 0.7, glow: true });
          addP({ kind: 'ring', x: L.x, y, vx: 0, vy: 0, r: 30, life: 0.35, col: '#ffcf6a', drag: 0 });
          Sfx.pop10 ? Sfx.pop10() : Sfx.boom();
        }
        if (F.clouds) for (let i = F.clouds.length - 1; i >= 0; i--) {
          const C = F.clouds[i]; C.t += dt;
          if (C.t >= C.life) { F.clouds.splice(i, 1); continue; }
          for (let j = G.venom.length - 1; j >= 0; j--) { const v = G.venom[j]; if (!v.friendly && dist2(v.x, v.y, C.x, C.y) < (C.r + v.r) * (C.r + v.r)) { G.venom.splice(j, 1); burst(v.x, v.y, 3, '#ffffff', { min: 10, max: 40, lmin: 0.2, lmax: 0.4 }); } }
        }
      });
    };
  }

  /* ------------------------------------------------------------------ drawing */
  function drawLantern(c, L, t) {
    const u = clamp01(L.t / 0.9), y = L.y - u * 24 + Math.sin(t * 6 + L.seed) * 1.5;
    c.fillStyle = `rgba(0,0,0,${(0.2 * (1 - u)).toFixed(3)})`; ell(c, L.x, L.y + 6, 6, 2.5); c.fill();
    DK().lantern(c, L.x, y, 5 + u, u > 0.7 && Math.sin(t * 40) > 0 ? '#fff2b0' : '#e8402e');
  }
  function babyDragon(c, b, t) {
    const f = Math.sin(t * 16) * 0.5;
    c.save(); c.translate(b.x, b.y - 10 + Math.sin(t * 4) * 2);
    c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, 0, 16, 7, 2.5); c.fill();
    c.rotate(b.a || 0);
    for (const s of [-1, 1]) { c.fillStyle = '#08240f'; c.beginPath(); c.moveTo(-2, 0); c.lineTo(-8, s * (10 + f * 4)); c.lineTo(-11, s * 3); c.closePath(); c.fill(); c.fillStyle = '#8ae0a0'; c.beginPath(); c.moveTo(-3, s); c.lineTo(-8, s * (8.5 + f * 4)); c.lineTo(-10, s * 3); c.closePath(); c.fill(); }
    c.fillStyle = '#08240f'; circle(c, -8, 0, 4); circle(c, -3, 0, 5); ell(c, 3, 0, 5.5, 4.6); c.fill();
    c.fillStyle = '#3aa86a'; circle(c, -8, 0, 3); circle(c, -3, 0, 4); ell(c, 3, 0, 4.5, 3.6); c.fill();
    c.fillStyle = '#f2d24a'; circle(c, -3, 0, 1.3);
    c.fillStyle = '#ffffff'; circle(c, 4, -1.8, 1.4); circle(c, 4, 1.8, 1.4); c.fillStyle = '#1a0a04'; circle(c, 4.5, -1.8, 0.8); circle(c, 4.5, 1.8, 0.8);
    c.restore();
  }
  function egg(c, e, t) {
    c.save(); c.translate(e.x, e.y);
    c.fillStyle = 'rgba(0,0,0,0.25)'; ell(c, 0, 6, 5, 2); c.fill();
    c.rotate(Math.sin(t * 7) * 0.2);
    c.fillStyle = '#1a0a08'; ell(c, 0, 0, 5.2, 6.6); c.fill();
    c.fillStyle = '#3aa86a'; ell(c, 0, 0, 4.2, 5.6); c.fill();
    c.fillStyle = '#c8ff8a'; circle(c, -1.5, -2, 1.1); circle(c, 1.6, 1, 0.9);
    c.restore();
  }
  {
    const dv0 = drawVenomBodies;
    drawVenomBodies = function (c, t) {
      dv0(c, t);
      const room = G.room; if (!room) return;
      safe(() => {
        const F = room.dk14;
        if (F && F.clouds) for (const C of F.clouds) { const a = Math.min(1, C.t / 0.2, (C.life - C.t) / 0.4); for (let i = 0; i < 5; i++) { const an = i / 5 * TAU + C.t * 0.4; DK().puff(c, C.x + Math.cos(an) * 10, C.y + Math.sin(an) * 7, 9, 0.75 * a); } }
        if (F && F.lanterns) for (const L of F.lanterns) drawLantern(c, L, t);
        for (const P of players14()) {
          if (P.dying > 0) continue;
          if (P.ei14) { if (P.baby14) babyDragon(c, P.baby14, t); else if (P.egg14) egg(c, P.egg14, t); }
          if (P.parel14) {
            const x = P.x + Math.cos(P.parelA14) * 22, y = P.y + Math.sin(P.parelA14) * 14 - 4;
            c.fillStyle = '#3a0a06'; circle(c, x, y, 4.3); c.fillStyle = P.healGlow14 > 0 ? '#fff6c8' : '#f4ecdc'; circle(c, x, y, 3.4); c.fillStyle = '#ffffff'; circle(c, x - 1, y - 1, 1.1);
          }
          if (P.swipe14 > 0) {
            const u = 1 - P.swipe14 / 0.35, a0 = u * TAU * 1.1;
            c.strokeStyle = `rgba(80,200,140,${(0.8 * (1 - u)).toFixed(3)})`; c.lineWidth = 7 * (1 - u) + 2;
            c.beginPath(); c.arc(P.x, P.y, 46, a0 - 1.4, a0); c.stroke();
            c.strokeStyle = `rgba(255,240,160,${(0.8 * (1 - u)).toFixed(3)})`; c.lineWidth = 2; c.beginPath(); c.arc(P.x, P.y, 46, a0 - 1.2, a0); c.stroke();
          }
          if (P.roar14 > 0) { const u = 1 - P.roar14 / 0.6; c.strokeStyle = `rgba(255,207,106,${(0.7 * (1 - u)).toFixed(3)})`; c.lineWidth = 3; for (const k of [0, 0.25]) { c.beginPath(); c.arc(P.x, P.y, 20 + (u + k) * 110, 0, TAU); c.stroke(); } }
        }
      });
    };
    // little dragon wings behind the apple
    const pu0 = drawPlayerUnder;
    drawPlayerUnder = function (c, P, t) {
      if (P && P.wings14 && !(P.dying > 0)) safe(() => {
        const f = Math.sin(t * 9) * 0.25, y = P.y - 4 - (P.hopH || 0);
        for (const s of [-1, 1]) {
          c.save(); c.translate(P.x + s * 8, y); c.scale(s, 1); c.rotate(-0.3 - f);
          c.fillStyle = '#2a0a06'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -14, 20, -10); c.lineTo(15, -4); c.lineTo(17, 1); c.lineTo(10, 1); c.lineTo(11, 5); c.closePath(); c.fill();
          c.fillStyle = '#e8503a'; c.beginPath(); c.moveTo(1.5, -0.5); c.quadraticCurveTo(10, -12, 18, -9); c.lineTo(13.5, -4); c.lineTo(15, 0); c.lineTo(9.5, 0); c.lineTo(10, 3.5); c.closePath(); c.fill();
          c.restore();
        }
      });
      return pu0.apply(this, arguments);
    };
    const dg0 = drawGlow3;
    drawGlow3 = function (c, room, t) {
      dg0(c, room, t);
      safe(() => {
        c.globalCompositeOperation = 'lighter';
        const F = room.dk14;
        if (F && F.lanterns) for (const L of F.lanterns) glowDot(c, L.x, L.y - (L.t / 0.9) * 24, 22, '#ffb03a', 0.4);
        for (const P of players14()) {
          if (P.healGlow14 > 0) glowDot(c, P.x, P.y, 50, '#ffe8a8', 0.5 * Math.min(1, P.healGlow14));
          if (P.toorn14 && P.hp <= P.maxHp / 2 && !(P.dying > 0)) glowDot(c, P.x, P.y, 30, '#ff5a2a', 0.22 + 0.08 * Math.sin(t * 8));
        }
        c.globalCompositeOperation = 'source-over';
      });
    };
  }

  /* ------------------------------------------------------------------ icons */
  const O = '#1a1210';
  function wingShape(c, R, s, col) {
    c.save(); c.scale(s, 1);
    c.fillStyle = O; c.beginPath(); c.moveTo(R * 0.05, R * 0.1); c.quadraticCurveTo(R * 0.4, -R * 0.75, R * 0.95, -R * 0.55); c.lineTo(R * 0.72, -R * 0.2); c.lineTo(R * 0.85, R * 0.1); c.lineTo(R * 0.55, R * 0.1); c.lineTo(R * 0.6, R * 0.35); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(R * 0.12, R * 0.06); c.quadraticCurveTo(R * 0.42, -R * 0.65, R * 0.86, -R * 0.5); c.lineTo(R * 0.66, -R * 0.19); c.lineTo(R * 0.76, R * 0.05); c.lineTo(R * 0.52, R * 0.06); c.lineTo(R * 0.55, R * 0.27); c.closePath(); c.fill();
    c.restore();
  }
  function headIcon(c, R, body, horn, eye) {
    for (const s of [-1, 1]) { c.strokeStyle = O; c.lineWidth = R * 0.16; c.beginPath(); c.moveTo(-R * 0.1, s * R * 0.25); c.quadraticCurveTo(-R * 0.5, s * R * 0.6, -R * 0.85, s * R * 0.45); c.stroke(); c.strokeStyle = horn; c.lineWidth = R * 0.08; c.stroke(); }
    c.fillStyle = O; ell(c, 0, 0, R * 0.5, R * 0.44); c.fill(); ell(c, R * 0.42, 0, R * 0.42, R * 0.28); c.fill();
    c.fillStyle = body; ell(c, 0, 0, R * 0.43, R * 0.37); c.fill(); ell(c, R * 0.42, 0, R * 0.35, R * 0.21); c.fill();
    c.fillStyle = eye; circle(c, R * 0.1, -R * 0.22, R * 0.08); circle(c, R * 0.1, R * 0.22, R * 0.08);
    c.fillStyle = O; circle(c, R * 0.68, -R * 0.09, R * 0.04); circle(c, R * 0.68, R * 0.09, R * 0.04);
  }
  function flame(c, x, y, s, col, col2) {
    c.fillStyle = O; c.beginPath(); c.moveTo(x, y - s * 1.15); c.quadraticCurveTo(x + s * 0.95, y - s * 0.1, x + s * 0.5, y + s * 0.6); c.quadraticCurveTo(x, y + s * 0.95, x - s * 0.5, y + s * 0.6); c.quadraticCurveTo(x - s * 0.95, y - s * 0.1, x, y - s * 1.15); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x + s * 0.8, y - s * 0.1, x + s * 0.42, y + s * 0.5); c.quadraticCurveTo(x, y + s * 0.8, x - s * 0.42, y + s * 0.5); c.quadraticCurveTo(x - s * 0.8, y - s * 0.1, x, y - s); c.fill();
    c.fillStyle = col2; c.beginPath(); c.moveTo(x, y - s * 0.3); c.quadraticCurveTo(x + s * 0.4, y + s * 0.15, x, y + s * 0.55); c.quadraticCurveTo(x - s * 0.4, y + s * 0.15, x, y - s * 0.3); c.fill();
  }
  function icon(c, id, R, t) {
    const D = DK();
    if (id === 'adem_dk') {
      c.save(); c.rotate(-0.5); headIcon(c, R * 0.8, '#d8402e', '#f2c86a', '#ffcf3a'); c.restore();
      for (let i = 0; i < 4; i++) { const a = -0.5 + (i - 1.5) * 0.25; flame(c, Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75 - R * 0.1, R * (0.18 + 0.03 * Math.sin(t * 8 + i)), '#ff7a2a', '#fff0a0'); }
    } else if (id === 'neonvuur_dk') {
      glowDot(c, 0, 0, R, '#d84aff', 0.35);
      flame(c, 0, R * 0.05, R * 0.62, '#b43aff', '#ffd8ff'); flame(c, -R * 0.45, R * 0.35, R * 0.28, '#d84aff', '#ffffff'); flame(c, R * 0.45, R * 0.35, R * 0.28, '#d84aff', '#ffffff');
    } else if (id === 'muntspuug_dk') {
      for (let i = 0; i < 3; i++) D.coin(c, -R * 0.5 + i * R * 0.45, -R * 0.35 + i * R * 0.3, R * 0.3, t * 3 + i, 1);
      c.strokeStyle = 'rgba(255,220,120,0.7)'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(-R * 0.9, -R * 0.75); c.lineTo(-R * 0.6, -R * 0.55); c.stroke();
    } else if (id === 'schubben_dk') {
      for (let r = 0; r < 3; r++) for (let k = -1; k <= 1; k++) {
        const x = k * R * 0.42 + (r % 2) * R * 0.21, y = -R * 0.45 + r * R * 0.38;
        if (Math.abs(x) > R * 0.7) continue;
        c.fillStyle = O; c.beginPath(); c.arc(x, y, R * 0.27, 0, Math.PI); c.closePath(); c.fill();
        c.fillStyle = r === 1 ? '#3aa88a' : '#2a8a6a'; c.beginPath(); c.arc(x, y, R * 0.22, 0, Math.PI); c.closePath(); c.fill();
        c.fillStyle = 'rgba(200,255,230,0.5)'; ell(c, x - R * 0.05, y + R * 0.06, R * 0.08, R * 0.04); c.fill();
      }
    } else if (id === 'vleugels_dk') {
      wingShape(c, R, 1, '#e8503a'); wingShape(c, R, -1, '#e8503a');
      c.fillStyle = O; circle(c, 0, R * 0.15, R * 0.3); c.fillStyle = '#e8402e'; circle(c, 0, R * 0.15, R * 0.24);
    } else if (id === 'parel_dk') {
      glowDot(c, 0, 0, R * 0.9, '#ffe8a8', 0.35);
      c.fillStyle = O; circle(c, 0, 0, R * 0.48);
      const g = c.createRadialGradient(-R * 0.15, -R * 0.15, 1, 0, 0, R * 0.42); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e8d8c0'); c.fillStyle = g; circle(c, 0, 0, R * 0.42);
      c.strokeStyle = '#e8b840'; c.lineWidth = R * 0.08; for (const s of [-1, 1]) { c.beginPath(); c.arc(0, 0, R * 0.55, s * 0.9 - 0.5, s * 0.9 + 0.5); c.stroke(); }
      for (let i = 0; i < 4; i++) { const a = t + i * Math.PI / 2; c.fillStyle = '#fff6c8'; circle(c, Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, R * 0.06); }
    } else if (id === 'schat_dk') {
      for (let i = 0; i < 7; i++) D.coin(c, (i % 4 - 1.5) * R * 0.32, R * 0.3 - Math.floor(i / 4) * R * 0.25, R * 0.22, 0.4 * i, 1);
      c.fillStyle = O; c.beginPath(); c.moveTo(-R * 0.35, -R * 0.15); c.lineTo(-R * 0.35, -R * 0.55); c.lineTo(-R * 0.18, -R * 0.35); c.lineTo(0, -R * 0.65); c.lineTo(R * 0.18, -R * 0.35); c.lineTo(R * 0.35, -R * 0.55); c.lineTo(R * 0.35, -R * 0.15); c.closePath(); c.fill();
      c.fillStyle = '#f2cf5a'; c.beginPath(); c.moveTo(-R * 0.29, -R * 0.2); c.lineTo(-R * 0.29, -R * 0.45); c.lineTo(-R * 0.16, -R * 0.29); c.lineTo(0, -R * 0.55); c.lineTo(R * 0.16, -R * 0.29); c.lineTo(R * 0.29, -R * 0.45); c.lineTo(R * 0.29, -R * 0.2); c.closePath(); c.fill();
      c.fillStyle = '#d84aff'; circle(c, 0, -R * 0.28, R * 0.06);
    } else if (id === 'ei_dk') {
      c.save(); c.rotate(Math.sin(t * 3) * 0.12);
      c.fillStyle = O; ell(c, 0, 0, R * 0.48, R * 0.62); c.fill();
      c.fillStyle = '#3aa86a'; ell(c, 0, 0, R * 0.41, R * 0.55); c.fill();
      c.fillStyle = '#c8ff8a'; for (const [x, y] of [[-0.15, -0.25], [0.18, 0], [-0.1, 0.25], [0.12, 0.32]]) circle(c, x * R, y * R, R * 0.07);
      c.strokeStyle = O; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(-R * 0.4, -R * 0.05); c.lineTo(-R * 0.2, R * 0.08); c.lineTo(0, -R * 0.08); c.lineTo(R * 0.2, R * 0.08); c.lineTo(R * 0.4, -R * 0.05); c.stroke();
      c.restore();
    } else if (id === 'staart_dk') {
      c.strokeStyle = O; c.lineWidth = R * 0.26; c.beginPath(); c.arc(0, R * 0.1, R * 0.55, Math.PI * 0.9, Math.PI * 2.2); c.stroke();
      c.strokeStyle = '#3aa86a'; c.lineWidth = R * 0.16; c.stroke();
      const a = Math.PI * 2.2, x = Math.cos(a) * R * 0.55, y = R * 0.1 + Math.sin(a) * R * 0.55;
      c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = O; c.beginPath(); c.moveTo(R * 0.4, 0); c.lineTo(0, R * 0.25); c.lineTo(R * 0.1, 0); c.lineTo(0, -R * 0.25); c.closePath(); c.fill(); c.fillStyle = '#f2d24a'; c.beginPath(); c.moveTo(R * 0.3, 0); c.lineTo(R * 0.04, R * 0.15); c.lineTo(R * 0.12, 0); c.lineTo(R * 0.04, -R * 0.15); c.closePath(); c.fill(); c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = R * 0.05; c.beginPath(); c.arc(0, R * 0.1, R * 0.78, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    } else if (id === 'donder_dk') {
      for (let i = -1; i <= 1; i++) { c.strokeStyle = O; c.lineWidth = R * 0.2; c.beginPath(); c.moveTo(i * R * 0.3, -R * 0.55); c.quadraticCurveTo(i * R * 0.45, R * 0.1, i * R * 0.2 + R * 0.05, R * 0.45); c.stroke(); c.strokeStyle = '#e8d8c0'; c.lineWidth = R * 0.11; c.stroke(); }
      glowDot(c, 0, 0, R * 0.8, '#9fd8ff', 0.3 + 0.2 * Math.sin(t * 10));
      c.fillStyle = '#ffe85a'; c.strokeStyle = O; c.lineWidth = R * 0.05; c.beginPath(); c.moveTo(R * 0.15, -R * 0.85); c.lineTo(-R * 0.25, R * 0.02); c.lineTo(R * 0.02, R * 0.02); c.lineTo(-R * 0.15, R * 0.75); c.lineTo(R * 0.35, -R * 0.15); c.lineTo(R * 0.06, -R * 0.15); c.closePath(); c.fill(); c.stroke();
    } else if (id === 'toorn_dk') {
      glowDot(c, 0, 0, R, '#ff5a2a', 0.35 + 0.15 * Math.sin(t * 6));
      headIcon(c, R * 0.95, '#a8141c', '#c89a5a', '#ffcf3a');
      c.strokeStyle = '#ffcf3a'; c.lineWidth = R * 0.06; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-R * 0.05, s * R * 0.3); c.lineTo(R * 0.22, s * R * 0.15); c.stroke(); }
    } else if (id === 'hoorn_dk') {
      c.save(); c.rotate(-0.6);
      c.fillStyle = O; c.beginPath(); c.moveTo(-R * 0.5, -R * 0.3); c.quadraticCurveTo(R * 0.3, -R * 0.35, R * 0.9, 0); c.quadraticCurveTo(R * 0.3, R * 0.1, -R * 0.5, R * 0.3); c.closePath(); c.fill();
      const g = c.createLinearGradient(-R * 0.5, 0, R * 0.9, 0); g.addColorStop(0, '#c8a060'); g.addColorStop(1, '#fff4dc');
      c.fillStyle = g; c.beginPath(); c.moveTo(-R * 0.42, -R * 0.22); c.quadraticCurveTo(R * 0.3, -R * 0.26, R * 0.78, 0); c.quadraticCurveTo(R * 0.3, R * 0.04, -R * 0.42, R * 0.22); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(90,60,20,0.5)'; c.lineWidth = R * 0.04; for (let i = 0; i < 4; i++) { const x = -R * 0.3 + i * R * 0.22; c.beginPath(); c.moveTo(x, -R * 0.2 + i * 0.04 * R); c.lineTo(x + R * 0.05, R * 0.18 - i * 0.04 * R); c.stroke(); }
      c.restore();
    } else if (id === 'wraak_dk') {
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 0.5; flame(c, Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62, R * 0.16, '#ff7a2a', '#fff0a0'); }
      c.fillStyle = O; circle(c, 0, R * 0.05, R * 0.34); c.fillStyle = '#e8402e'; circle(c, 0, R * 0.05, R * 0.28); c.fillStyle = '#3a8a2a'; ell(c, R * 0.08, -R * 0.3, R * 0.12, R * 0.05, -0.5); c.fill();
    } else if (id === 'zon_dk') {
      const p = 0.5 + 0.5 * Math.sin(t * 3);
      glowDot(c, 0, 0, R * 1.05, '#ffcf3a', 0.35 + 0.2 * p);
      c.fillStyle = '#ffb030';
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.4, L1 = R * (i % 2 ? 0.72 : 0.9); c.beginPath(); c.moveTo(Math.cos(a - 0.14) * R * 0.45, Math.sin(a - 0.14) * R * 0.45); c.lineTo(Math.cos(a) * L1, Math.sin(a) * L1); c.lineTo(Math.cos(a + 0.14) * R * 0.45, Math.sin(a + 0.14) * R * 0.45); c.closePath(); c.fill(); }
      c.fillStyle = O; circle(c, 0, 0, R * 0.5); c.fillStyle = '#fff2b0'; circle(c, 0, 0, R * 0.44);
      c.save(); c.scale(0.5, 0.5); D.ruyi(c, 0, 0, R / 18, 0, '#b3262a'); c.restore();
    } else if (id === 'jade_dk') {
      c.save(); c.rotate(0.2);
      c.fillStyle = O; c.beginPath(); c.moveTo(0, -R * 0.75); c.quadraticCurveTo(R * 0.7, -R * 0.35, R * 0.5, R * 0.35); c.quadraticCurveTo(0, R * 0.8, -R * 0.5, R * 0.35); c.quadraticCurveTo(-R * 0.7, -R * 0.35, 0, -R * 0.75); c.fill();
      const g = c.createRadialGradient(-R * 0.2, -R * 0.25, 1, 0, 0, R * 0.7); g.addColorStop(0, '#b8ffd8'); g.addColorStop(0.5, '#3ab88a'); g.addColorStop(1, '#0e5a3a');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -R * 0.63); c.quadraticCurveTo(R * 0.58, -R * 0.3, R * 0.42, R * 0.3); c.quadraticCurveTo(0, R * 0.67, -R * 0.42, R * 0.3); c.quadraticCurveTo(-R * 0.58, -R * 0.3, 0, -R * 0.63); c.fill();
      c.restore();
      c.save(); c.scale(0.7, 0.7); D.ruyi(c, 0, R * 0.05, R / 22, 0, 'rgba(230,255,240,0.8)'); c.restore();
    } else if (id === 'vuurspuwer_dk') {
      c.save(); c.rotate(-0.4);
      c.fillStyle = O; ell(c, -R * 0.15, 0, R * 0.42, R * 0.3); c.fill();
      c.fillStyle = '#6a3a1a'; ell(c, -R * 0.15, 0, R * 0.36, R * 0.24); c.fill();
      c.fillStyle = '#ffb03a'; ell(c, -R * 0.05, -R * 0.05, R * 0.16, R * 0.08); c.fill();
      for (let i = 0; i < 3; i++) flame(c, R * 0.25 + i * R * 0.22, (i - 1) * R * 0.08, R * (0.22 - i * 0.04), '#ff7a2a', '#fff0a0');
      c.restore();
    } else if (id === 'wolk_dk') {
      D.puff(c, -R * 0.35, R * 0.1, R * 0.32, 1); D.puff(c, R * 0.3, R * 0.12, R * 0.3, 1); D.puff(c, 0, -R * 0.1, R * 0.4, 1);
      c.strokeStyle = '#5aa0f0'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(-R * 0.6, R * 0.55); c.quadraticCurveTo(0, R * 0.4, R * 0.6, R * 0.55); c.stroke();
      c.fillStyle = '#d84aff'; for (let i = 0; i < 3; i++) { const u = (t * 0.8 + i / 3) % 1; c.globalAlpha = 1 - u; circle(c, R * (0.85 - u * 0.5), -R * 0.6 + u * R * 0.4, R * 0.07); } c.globalAlpha = 1;
    } else if (id === 'oog_dk') {
      c.fillStyle = O; ell(c, 0, 0, R * 0.85, R * 0.5); c.fill();
      const g = c.createRadialGradient(0, 0, 1, 0, 0, R * 0.75); g.addColorStop(0, '#fff2a0'); g.addColorStop(0.7, '#f2a020'); g.addColorStop(1, '#8a4a08');
      c.fillStyle = g; ell(c, 0, 0, R * 0.76, R * 0.42); c.fill();
      c.fillStyle = O; ell(c, Math.sin(t * 1.5) * R * 0.1, 0, R * 0.08, R * 0.36); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.8)'; circle(c, -R * 0.25, -R * 0.15, R * 0.08);
    } else if (id === 'lantaarn_dk') {
      D.lantern(c, 0, R * 0.05, R * 0.48, '#e8402e');
      glowDot(c, 0, 0, R * 0.9, '#ffb03a', 0.3);
      c.fillStyle = '#ffe8a8'; for (let i = 0; i < 4; i++) { const u = (t * 0.5 + i / 4) % 1; c.globalAlpha = 1 - u; circle(c, (i - 1.5) * R * 0.35, R * 0.7 - u * R * 1.4, R * 0.05); } c.globalAlpha = 1;
    } else if (id === 'brul_dk') {
      c.save(); c.translate(-R * 0.25, 0); headIcon(c, R * 0.7, '#3aa86a', '#f2e2b8', '#ffcf3a'); c.restore();
      c.strokeStyle = '#ffcf6a'; c.lineWidth = R * 0.07;
      for (let i = 0; i < 3; i++) { const r = R * (0.35 + i * 0.2 + ((t * 0.8) % 1) * 0.2); c.globalAlpha = 1 - i * 0.25; c.beginPath(); c.arc(R * 0.15, 0, r, -0.6, 0.6); c.stroke(); }
      c.globalAlpha = 1;
    } else if (id === 'koning_dk') {
      glowDot(c, 0, 0, R, '#ffcf3a', 0.3);
      headIcon(c, R * 0.85, '#f4ead2', '#e8a420', '#ff8a1a');
      c.fillStyle = O; c.beginPath(); c.moveTo(-R * 0.45, -R * 0.5); c.lineTo(-R * 0.45, -R * 0.85); c.lineTo(-R * 0.25, -R * 0.68); c.lineTo(-R * 0.08, -R * 0.92); c.lineTo(R * 0.1, -R * 0.68); c.lineTo(R * 0.3, -R * 0.85); c.lineTo(R * 0.3, -R * 0.5); c.closePath(); c.fill();
      c.fillStyle = '#f2cf5a'; c.beginPath(); c.moveTo(-R * 0.39, -R * 0.55); c.lineTo(-R * 0.39, -R * 0.76); c.lineTo(-R * 0.24, -R * 0.62); c.lineTo(-R * 0.08, -R * 0.83); c.lineTo(R * 0.08, -R * 0.62); c.lineTo(R * 0.24, -R * 0.76); c.lineTo(R * 0.24, -R * 0.55); c.closePath(); c.fill();
    }
  }
  {
    const di0 = drawItemIcon;
    drawItemIcon = function (c, id, S, t = 0) {
      if (!NEW[id]) return di0.apply(this, arguments);
      const R = S / 2; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
      safe(() => icon(c, id, R, t));
      c.restore();
    };
  }

  /* ------------------------------------------------------------------ texts */
  for (const s of ['SCHUB', 'WRAAK', 'JADE', 'UITGEKOMEN', 'ROAAAR']) if (!TEXT_LIT9.popups.includes(s)) TEXT_LIT9.popups.push(s);
  safe(() => {
    const V = window.__bitten.V12; if (!V || !V.CLEAR12) return;
    const L = V.CLEAR12;
    Object.assign(L.items, {
      adem_dk: 'Every 5th shot: a cone of 5 fire seeds.', neonvuur_dk: 'Hits can leave neon fire on the floor.', muntspuug_dk: 'Every 8th shot: a piercing gold coin.',
      schubben_dk: 'Every 4th bite bounces off.', vleugels_dk: 'Faster, more range.', parel_dk: 'Heals 1 apple every 18 s in a fight.', schat_dk: '15 coins, coins add damage.',
      ei_dk: 'Hatches a baby dragon after 3 rooms.', staart_dk: 'A tail sweep every 3.5 s.', donder_dk: 'Every 6th hit: lightning to two more.', toorn_dk: 'Low on health: more damage, faster.',
      hoorn_dk: 'Every 4th shot: a piercing horn.', wraak_dk: 'Bitten? A ring of fire seeds.', zon_dk: 'A ring of 14 seeds every 9 s.', jade_dk: 'Cleared rooms can heal 1.',
      vuurspuwer_dk: 'Harder burning seeds, a bit slower.', wolk_dk: 'Leaves clouds that eat venom.', oog_dk: 'Every 2nd seed homes in.', lantaarn_dk: 'Kills leave lanterns that burst.',
      brul_dk: 'A roar every 12 s stuns snakes near you.', koning_dk: 'More damage and speed per dragon powerup.',
    });
    V.install(NEW, L.items);
  });
  safe(() => UI.buildItemCards()); safe(() => { if (UI.filterItems9) UI.filterItems9(); });
  Object.assign(window.__bitten.DRAAK14 || (window.__bitten.DRAAK14 = {}), { ITEMS: NEW, ITEM_IDS: IDS, icon });
})();
