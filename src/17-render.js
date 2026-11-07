/* src/17-render.js: rendering: layout, room, lighting, HUD, menu scene, bestiary pictures. From v1 to v8, v13.1. Lines 9765 to 10995 of the v13.7 script. */
/* =====================================================================
   Rendering: layout, the room, lighting, HUD, the menu scene
   ===================================================================== */
const View = {
  cv: null, ctx: null, W: 0, H: 0, dpr: 1, s: 1, ox: 0, oy: 0, portrait: false,
  dark: null, dctx: null, apple: null, actx: null, appleK: 0,
  hearts: [], heartsK: 0,
  init() {
    this.cv = document.getElementById('stage');
    this.ctx = this.cv.getContext('2d');
    this.dark = document.createElement('canvas'); this.dctx = this.dark.getContext('2d');
    this.apple = document.createElement('canvas'); this.actx = this.apple.getContext('2d');
  },
  layout() {
    const app = document.getElementById('app');
    const W = Math.max(1, app.clientWidth), H = Math.max(1, app.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * renderQ14();     /* P4: Render quality */
    this.W = W; this.H = H; this.dpr = dpr;
    this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr);
    const portrait = H > W * 1.05;
    this.portrait = portrait;
    let s;
    if (portrait) {
      const hud = 76;
      s = Math.min((W - 16) / VIEW_W, (H * 0.62 - hud) / VIEW_H);
      s = Math.max(0.3, s);
      this.ox = (W - VIEW_W * s) / 2; this.oy = hud;
    } else {
      const side = Math.min(170, W * 0.18);
      s = Math.min((W - side * 2) / VIEW_W, (H - 20) / VIEW_H);
      s = Math.max(0.3, s);
      this.ox = (W - VIEW_W * s) / 2; this.oy = (H - VIEW_H * s) / 2;
    }
    this.s = s;
    this.darkK = Math.min(s * dpr, 1.6);
    this.dark.width = Math.max(1, Math.ceil(VIEW_W * this.darkK)); this.dark.height = Math.max(1, Math.ceil(VIEW_H * this.darkK));
    const k = s * dpr;
    if (k !== this.heartsK) { this.buildHearts(); this.heartsK = k; }
    UI.place();
  },
  toScreen(x, y) { return [this.ox + (x + WALL) * this.s, this.oy + (y + WALL) * this.s]; },
  buildHearts() {
    const S = 22, dpr = this.dpr, px = Math.ceil(S * dpr);
    this.hearts = [];
    for (let i = 0; i <= 2; i++) {
      const cv = document.createElement('canvas'); cv.width = px; cv.height = px;
      const c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, px / 2, px / 2 + dpr);
      if (i === 0) { c.globalAlpha = 0.45; drawCore(c, 8.2, true); }
      else drawApple(c, 8.4, { t: 0, lookX: 0, lookY: 0, blink: 1, fear: 0, hurt: 0, face: false, leaf: 0, bites: i === 1 ? [{ a: -0.2, t: 0 }, { a: 0.55, t: 0 }] : [] });
      this.hearts.push(cv);
    }
  },
};

/* ------------------------------------------------------------------ main render */
function render(dt) {
  const c = View.ctx;
  c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  c.imageSmoothingEnabled = true;
  const L = G.levelDef || LEVELS[0];
  c.fillStyle = (G.state === 'menu' ? LEVELS[0].void : L.void);
  c.fillRect(0, 0, View.W, View.H);
  if (G.state === 'cutscene') { Story.render(c); return; }
  if (G.state === 'menu' || !G.room) { MenuScene.render(c); return; }
  if (G.state === 'win') { renderDawn(c); return; }
  renderRoom(c, L);
  renderHUD(c, L);
  renderInfoCard(c, dt);
  renderSticks(c);
  if (G.fade > 0) { c.fillStyle = `rgba(0,0,0,${G.fade})`; c.fillRect(0, 0, View.W, View.H); }
  if (G.whiteout > 0) { c.fillStyle = `rgba(255,244,220,${G.whiteout})`; c.fillRect(0, 0, View.W, View.H); }
}

function renderRoom(c, L) {
  const room = G.room, P = G.player, t = G.t;
  const k = View.s * View.dpr;
  const ck = Math.min(k, 3);
  if (room.dirty || room.cacheK !== ck || !room.cache) buildRoomCache(room, L, ck);
  let sx = 0, sy = 0;
  if (G.shake > 0.2 && !REDUCED && Save.data.settings.shake !== false) { sx = (Math.random() * 2 - 1) * G.shake * 0.6; sy = (Math.random() * 2 - 1) * G.shake * 0.6; }
  const ox = View.ox + sx, oy = View.oy + sy;
  c.drawImage(room.cache, ox, oy, VIEW_W * View.s, VIEW_H * View.s);
  const wx = (ox + WALL * View.s) * View.dpr, wy = (oy + WALL * View.s) * View.dpr;
  c.setTransform(k, 0, 0, k, wx, wy);
  c.lineJoin = 'round'; c.lineCap = 'round';

  drawDoorJaws(c, room);
  drawPortalDoors10(c, room, t);
  if (room.belts.length) drawBelts(c, room, t);
  if (room.spikes.length) drawSpikes(c, room, t);
  drawFloorThings(c, room, t);
  if (room.exit) drawExit(c, room.exit, L, t);
  // breakables and the chest
  for (const o of room.obs) {
    if (o.type === 'urn') drawUrn(c, o, L, t);
    else if (o.type === 'egg') drawEggs(c, o, L, t);
    else if (o.type === 'chest') drawChest(c, o, t);
    else if (o.type === 'altar') drawAltar(c, o, room, t);
    else if (o.type === 'block') drawBlock(c, o, t);
    else if (o.type === 'slot') drawSlot(c, o, t);
    else if (o.type === 'book') drawBookstand(c, o, t);
    else if (o.type === 'gold') drawGold(c, o, t);
    else if (DYN9[o.type]) DYN9[o.type](c, o, room, t);
  }
  for (const sn of room.snakes) if (sn.ghost) drawGhost(c, sn.ghost, t);
  for (const r of room.rots) drawRot(c, r, t);
  for (const sn of room.snakes) for (const h of sn.holes) drawHole(c, h, L);
  const coins = G.run ? G.run.coins : 0;
  for (const p of room.pickups) {
    if (p.kind === 'coin') drawCoin(c, p, t);
    else if (p.kind === 'heart') { drawHeartPickup(c, p, t); if (p.cost) drawPriceLabel(c, p.x, p.y + 16, priceOf(p), coins >= priceOf(p)); }
    else if (p.kind === 'key' || p.kind === 'cleanse' || p.kind === 'reroll') drawRotPickup(c, p, t, coins);
    else if (DRAWPICK9[p.kind]) DRAWPICK9[p.kind](c, p, t, coins);
    else {
      drawItemPickup(c, p, t);
      if (p.cost) drawPriceLabel(c, p.x, p.y + 22, priceOf(p), coins >= priceOf(p));
      if (p.curseCost) drawCurseLabel(c, p.x, p.y + (p.cost ? 36 : 22));
      if (p.price) {
        c.save(); c.translate(p.x, p.y + 22);
        c.fillStyle = 'rgba(10,6,6,0.8)'; rrect(c, -27, -6, 54, 12, 3); c.fill();
        c.fillStyle = '#ff6a6a'; c.font = '700 8px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('COSTS 1 APPLE', 0, 0.5);
        c.restore();
      }
    }
  }
  drawFires(c, room, t);
  for (const k of room.carts) drawCart(c, k, room);
  for (const u of room.turrets) drawSunflower(c, u, t);
  // snakes: shadows first, then bodies, biggest at the bottom
  const order = room.snakes.filter((s) => s.delay <= 0).sort((a, b) => b.K.r0 - a.K.r0);
  for (const sn of order) if (sn.burrowed && !sn.K.noMound) drawMound(c, sn, L, t);
  c.fillStyle = 'rgba(0,0,0,0.3)';
  for (const sn of order) drawSnakeShadow(c, sn);
  for (const sn of order) drawSnake(c, sn, t);
  for (const sn of order) for (const h of sn.holes) drawHoleLip(c, h, L);
  if (room.roots.length) drawRoots(c, room, t);
  for (const b of room.balls) drawBall(c, b);
  if (room.skins.length) drawSkins(c, room, t);
  drawParticles(c, false);
  drawPlayer(c);
  drawSeeds(c);
  drawLobs(c);
  drawVenomBodies(c, t);
  if (room.spores.length) drawSpores(c, room, t);
  if (room.clouds.length) drawClouds(c, room, t);
  if (G.flood) drawFlood(c, t);

  // ---- lighting ----
  c.setTransform(1, 0, 0, 1, 0, 0);
  renderDarkness(c, room, L, ox, oy);
  // ---- things that glow ----
  c.setTransform(k, 0, 0, k, wx, wy);
  for (const s of room.sconces) {
    const fx = s.side === 'n' ? s.x : s.side === 's' ? s.x : s.side === 'w' ? s.x + 4 : s.x - 4;
    const fy = s.side === 'n' ? s.y + 4 : s.side === 's' ? s.y - 2 : s.y + 2;
    drawFlame(c, fx, fy, 1.1, t, s.ph);
  }
  for (const o of room.obs) if (o.type === 'candle') for (const f of o.flames) drawFlame(c, o.x + f.dx, o.y + f.dy - f.h - 1.5, 0.85, t, f.ph);
  drawTubeLights(c, room, t);
  drawShopNeon(c, room, t);
  drawGlow3(c, room, t);
  for (const sn of order) drawSnakeGlow(c, sn, t, P);
  if (room.balls.length) {
    c.globalCompositeOperation = 'lighter';
    for (const b of room.balls) if (b.hide <= 0) glowDot(c, b.x, b.y, b.r * 2.3, ballTeam(b), 0.22 + Math.min(0.25, Math.hypot(b.vx, b.vy) / 1600));
    c.globalCompositeOperation = 'source-over';
  }
  drawVenomGlow(c, t);
  if (G.seeds.length || G.strikes.length) {
    c.globalCompositeOperation = 'lighter';
    for (const s of G.strikes) glowDot(c, s.x, s.y - (1 - s.t / 0.5) * 120, 14, '#ffd9a0', 0.4);
    for (const s of G.seeds) { const z = Math.sin(Math.PI * Math.min(1, s.t / s.life)) * 5 + 2; glowDot(c, s.x, s.y - z + 2, 10 * (s.size || 1) * (s.glow ? 1.5 : 1), seedLook(s)[2], s.glow ? 0.45 : 0.32); }
    c.globalCompositeOperation = 'source-over';
  }
  drawParticles(c, true);
  drawTexts(c);
  if (room.exit && room.exit.kind === 'light') drawLightShaft(c, room.exit, t);
  for (const p of room.pickups) if (p.kind === 'item') { const rr = ITEMS[p.id] && ITEMS[p.id].rare; c.globalCompositeOperation = 'lighter'; glowDot(c, p.x, p.y - 10, rr ? 52 : 36, rr ? '#ff9d3a' : '#ffcc66', (rr ? 0.26 : 0.18) + 0.06 * Math.sin(t * 3)); c.globalCompositeOperation = 'source-over'; }
  if (room.chest && room.chest.open && room.chest.t < 1.5) {
    c.globalCompositeOperation = 'lighter'; glowDot(c, room.chest.x, room.chest.y - 6, 60, '#ffc870', 0.4 * (1 - room.chest.t / 1.5)); c.globalCompositeOperation = 'source-over';
  }
  // boss bar sits on the room
  c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  /* P4: the vignette is baked once per screen size and drawn as an image */
  const vk = 'vig|' + View.W + 'x' + View.H + '|' + View.dpr;
  let vgc = SPR14.m.get(vk);
  if (!vgc) {
    vgc = document.createElement('canvas'); vgc.width = Math.max(1, Math.round(View.W * View.dpr)); vgc.height = Math.max(1, Math.round(View.H * View.dpr));
    const vx = vgc.getContext('2d'); vx.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    const vg = vx.createRadialGradient(View.W / 2, View.H / 2, Math.min(View.W, View.H) * 0.35, View.W / 2, View.H / 2, Math.max(View.W, View.H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    vx.fillStyle = vg; vx.fillRect(0, 0, View.W, View.H);
    for (const k of SPR14.m.keys()) if (k.startsWith('vig|')) SPR14.m.delete(k);
    SPR14.m.set(vk, vgc);
  }
  c.drawImage(vgc, 0, 0, View.W, View.H);
  if (P.hp <= 2 && P.dying <= 0 && P.hp > 0) {
    const a = 0.12 + 0.1 * Math.sin(G.t * 6);
    const rg = c.createRadialGradient(View.W / 2, View.H / 2, Math.min(View.W, View.H) * 0.3, View.W / 2, View.H / 2, Math.max(View.W, View.H) * 0.7);
    rg.addColorStop(0, 'rgba(120,0,10,0)'); rg.addColorStop(1, `rgba(120,0,10,${a})`);
    c.fillStyle = rg; c.fillRect(0, 0, View.W, View.H);
  }
  if (G.hurtFlash > 0) { c.fillStyle = `rgba(160,10,20,${G.hurtFlash * 0.45})`; c.fillRect(0, 0, View.W, View.H); }
  if (G.freeze > 0) {
    // Mikappols stopped time: everything goes cold and blue
    const a = Math.min(1, G.freeze / 0.3) * 0.22;
    c.fillStyle = `rgba(40,90,255,${a})`; c.fillRect(0, 0, View.W, View.H);
    c.fillStyle = `rgba(200,220,255,${a * 0.5})`;
    for (let y = (G.t * 60) % 6; y < View.H; y += 6) c.fillRect(0, y, View.W, 1);
  }
}

function renderDarkness(c, room, L, ox, oy) {
  const dk = View.dark, dc = View.dctx, P = G.player, t = G.t;
  const k = View.darkK;
  dc.setTransform(1, 0, 0, 1, 0, 0);
  dc.globalCompositeOperation = 'source-over';
  dc.clearRect(0, 0, dk.width, dk.height);
  dc.fillStyle = `rgba(4,2,2,${G.darkA})`;
  dc.fillRect(0, 0, dk.width, dk.height);
  dc.globalCompositeOperation = 'destination-out';
  dc.setTransform(k, 0, 0, k, WALL * k, WALL * k);
  const light = (x, y, r, i) => {
    if (r <= 1 || i <= 0) return;
    /* P2: one cached hole per radius bucket, its strength through globalAlpha (stops 1, 0.82 at 0.45, 0) */
    /* above 1 the old stops clamp (0.82 * i reaches 1), so strong lights get their own sprite */
    const px = SPR14.bucket(r * k), iq = i > 1 ? Math.min(1.22, Math.round(i * 20) / 20) : 1, mid = Math.min(1, 0.82 * iq);
    const spr = SPR14.get('L|' + px + '|' + iq, px, (sc, p) => {
      const g = sc.createRadialGradient(p, p, 0, p, p, p);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, `rgba(0,0,0,${mid})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = g; sc.fillRect(0, 0, p * 2, p * 2);
    });
    dc.globalAlpha = Math.min(1, i); dc.drawImage(spr, x - r, y - r, r * 2, r * 2); dc.globalAlpha = 1;
  };
  let pr = L.light * (1 + Math.sin(t * 7.3) * 0.02 + Math.sin(t * 13.1) * 0.015);
  if (P.dying > 0) pr *= Math.max(0, 1 - P.dying / 1.7);
  if (P.escaping > 0) pr *= 1 + P.escaping * 1.2;
  if (room.mod === 'dark' && !room.cleared) pr *= 0.78;
  if (P.glow) pr *= 1.45;
  if (P.bril) pr *= 1.2;
  if (P.mods) pr *= P.mods.light;
  light(P.x, P.y, pr, 1);
  if (MP14.on) for (const Q of G.players) if (Q !== P) light(Q.x, Q.y, pr * (Q.ghost14 ? 0.55 : 1), Q.ghost14 ? 0.6 : 1);   /* M3: every apple carries its light */
  for (const s of room.sconces) light(s.lx, s.ly, 92 + Math.sin(t * 9 + s.ph) * 4, 0.75);
  for (const o of room.obs) if (o.type === 'candle' && !o.sign) light(o.x, o.y - 6, 96 + Math.sin(t * 8 + o.seed * 9) * 5, 0.85);
  if (room.tubes) for (const s of room.tubes) { const lv = tubeLevel(s, t); for (const dx of [-0.25, 0.25]) light(s.x + dx * s.w, s.y, 135, 0.66 * lv); }
  if (room.type === 'shop') light(RW / 2, 22, 70, 0.5);
  extraLights(room, light);
  for (const v of G.venom) light(v.x, v.y, 28, 0.5);
  for (const r of room.rots) light(r.x, r.y, 46, 0.55);
  for (const p of room.pickups) if (p.kind === 'item') light(p.x, p.y - 8, 74, 0.8);
  if (room.altar) light(room.altar.x, room.altar.y, 70, room.altar.kind === 'offering' ? 0.5 : 0.65);
  if (P.halo) for (const o of P.halo.orbs) if (o.x != null) light(o.x, o.y, 26, 0.5);
  for (const b of room.balls) if (b.hide <= 0) light(b.x, b.y, 58, 0.45);
  for (const s of G.strikes) light(s.x, s.y, 30 + s.t * 40, 0.5);
  if (room.fires) for (const f of room.fires) light(f.x, f.y, f.r * 2.6, 0.6 * Math.min(1, (f.life - f.t) / 0.5));
  for (const l of G.lobs) light(lerp(l.x0, l.x1, l.t / l.dur), lerp(l.y0, l.y1, l.t / l.dur), 40, 0.5);
  if (P.capy) light(P.capy.x, P.capy.y, 34, 0.35);
  for (const sn of room.snakes) if (sn.kind === 'ender' && sn.alive) light(sn.x, sn.y, 70, 0.4);
  if (P.buddy) light(P.buddy.x, P.buddy.y, 40, 0.5);
  for (const sn of room.snakes) if (sn.kind === 'rocket' && sn.alive && !sn.burrowed) light(sn.x + Math.cos(sn.drawAng) * 40, sn.y + Math.sin(sn.drawAng) * 40, 50, 0.35);
  if (room.chest) light(room.chest.x, room.chest.y, room.chest.open ? 84 : 56, 0.7);
  if (room.exit) light(room.exit.x, room.exit.y, room.exit.kind === 'light' ? 150 + Math.sin(t * 2) * 8 : 66, room.exit.kind === 'light' ? 1 : 0.55);
  for (const f of G.flashes) light(f.x, f.y, f.r, f.i * (1 - f.t / f.life));
  dc.globalCompositeOperation = 'source-over';
  c.drawImage(dk, ox * View.dpr, oy * View.dpr, VIEW_W * View.s * View.dpr, VIEW_H * View.s * View.dpr);
}

function drawPlayer(c) {
  const P = G.player, t = G.t;
  if (P.dying > 1.0) {
    c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, P.x + 1, P.y + 12, 9, 3.5); c.fill();
    c.save(); c.translate(P.x, P.y - 2);
    const s = smooth((P.dying - 1.0) / 0.25);
    c.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
    drawCore(c, 14, P.dying > 2.2);
    c.restore();
    return;
  }
  const blink = P.inv > 0 && P.dying <= 0 && Math.floor(P.inv * 14) % 2 === 0;
  // shadow
  const lift = P.escaping > 0 ? P.escaping * 30 : P.hopH;
  c.fillStyle = `rgba(0,0,0,${0.36 * (1 - Math.min(0.8, lift / 40))})`;
  ell(c, P.x + 1, P.y + 12, 11 * (1 - lift * 0.01), 4); c.fill();
  if (P.worm) drawWormBuddy(c, P.worm, t);
  if (P.halo) for (const o of P.halo.orbs) {
    if (o.x == null) continue;
    seedShape(c, o.x, o.y - 3, 4, P.halo.a * 2);
    c.fillStyle = '#4a2c18'; c.fill(); c.strokeStyle = '#ffd9a0'; c.lineWidth = 1.2; c.stroke();
  }
  if (P.capy) drawCapybara(c, P.capy, t);
  drawPlayerUnder(c, P, t);
  drawPlayerUnder3(c, P, t);
  if (P.chillOn) {
    c.strokeStyle = `rgba(150,210,255,${0.35 + 0.15 * Math.sin(t * 4)})`; c.lineWidth = 1.2;
    for (const k of [0, 0.5]) { const u = (t * 0.8 + k) % 1; c.globalAlpha = 1 - u; c.beginPath(); c.ellipse(P.x, P.y + 11, 10 + u * 14, 3.5 + u * 5, 0, 0, TAU); c.stroke(); }
    c.globalAlpha = 1;
  }
  if (P.buddy && P.buddy.x != null) {
    const b = P.buddy, bob = Math.sin(t * 7) * 1.2;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, b.x, b.y + 7, 5, 2); c.fill();
    c.save(); c.translate(b.x, b.y - 2 + bob);
    drawApple(c, 6.2, { t, lookX: P.lookX, lookY: P.lookY, blink: P.blink, fear: 0, hurt: 0, bites: [], leaf: P.leaf });
    c.restore();
  }
  if (blink) return;
  // build the apple on its own canvas (the bites are cut out of it)
  const k = View.s * View.dpr;
  const size = 64, px = Math.ceil(size * k);
  const ac = View.apple, actx = View.actx;
  if (ac.width !== px) { ac.width = px; ac.height = px; }
  actx.setTransform(1, 0, 0, 1, 0, 0);
  actx.clearRect(0, 0, px, px);
  actx.setTransform(k, 0, 0, k, px / 2, px / 2);
  let bites = P.bites;
  if (P.dying > 0) {
    const extra = Math.floor(P.dying / 0.11);
    bites = P.bites.slice();
    for (let i = 0; i < extra; i++) bites.push({ a: BITE_ANGLES[(P.bites.length + i) % BITE_ANGLES.length] + i * 0.3, t: G.t });
  }
  drawApple(actx, P.R, {
    char: P.char,
    t, lookX: P.lookX, lookY: P.lookY, blink: P.blink, fear: P.fear, hurt: P.hurtT, bites,
    twin: P.twin, toffee: P.toffee, shellUp: P.shellUp, cyanide: P.cyanide, leaf: P.leaf, mouthOpen: P.dying > 0, chewing: P.chew > 0, chomp: P.chomp, horns: P.pact, pop: P.popT || 0,
  });
  // squash, stretch and hop
  const sp = Math.hypot(P.vx, P.vy);
  const breathe = sp < 20 ? Math.sin(t * 2.4) * 0.025 : 0;
  const sq = P.squash * 0.18, rc = P.recoil * 0.07;
  let sxs = 1 + sq + rc - breathe * 0.5, sys = 1 - sq - rc + breathe;
  if (sp > 20) { const h = Math.abs(Math.sin(P.hop)); sxs += (1 - h) * 0.05; sys -= (1 - h) * 0.05; }
  const shake = P.dying > 0 ? (Math.random() - 0.5) * 3 : 0;
  const sink = 1 - (P.sink || 0) * 0.9;
  c.save();
  c.translate(P.x + shake, P.y - lift - 1 + (P.sink || 0) * 6);
  if (P.sink) c.rotate(P.sink * 2.5);
  c.scale(sxs * sink, sys * sink);
  c.drawImage(ac, -size / 2, -size / 2 + 2, size, size);
  c.restore();
  drawPlayerOver(c, P, t);
}

function drawWormBuddy(c, w, t) {
  if (w.x == null) return;
  const n = 5, dirA = w.a + Math.PI / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const back = i * 3.6;
    pts.push([w.x - Math.cos(dirA) * back + Math.sin(t * 9 + i) * 0.8, w.y - Math.sin(dirA) * back + Math.cos(t * 9 + i) * 0.8]);
  }
  c.fillStyle = '#5a1f2b'; for (let i = n - 1; i >= 0; i--) circle(c, pts[i][0], pts[i][1], 4.6 - i * 0.35);
  for (let i = n - 1; i >= 0; i--) { c.fillStyle = i % 2 ? '#e9899a' : '#f39cac'; circle(c, pts[i][0], pts[i][1], 3.4 - i * 0.3); }
  const [hx, hy] = pts[0];
  c.fillStyle = '#1a0a0e';
  circle(c, hx + Math.cos(dirA + 0.6) * 1.6, hy + Math.sin(dirA + 0.6) * 1.6, 0.7);
  circle(c, hx + Math.cos(dirA - 0.6) * 1.6, hy + Math.sin(dirA - 0.6) * 1.6, 0.7);
}

function seedLook(s) {
  if (s.crit) return ['#c99a1a', '#fff0a0', '#ffd84a'];
  if (s.look9) return s.look9;
  if (s.hell) return ['#6a0a0e', '#ff6a3a', '#ff3a2a'];
  if (s.ember) return ['#8a3510', '#ffb46a', '#ff9a3a'];
  if (s.zap) return ['#2a4a70', '#bfe8ff', '#9fd8ff'];
  if (s.cy) return ['#2f5a24', '#bfe58f', '#9fd36a'];
  if (s.frost) return ['#2f5f86', '#e6f5ff', '#bfe4ff'];
  return ['#4a2c18', '#efd9ad', '#ffd9a0'];
}
function drawSeeds(c) {
  for (const s of G.seeds) {
    const u = s.t / s.life;
    const z = Math.sin(Math.PI * Math.min(1, u)) * 5 + 2;
    const [fill, stroke] = seedLook(s);
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, s.x, s.y + 4, 3 * Math.max(1, (s.size || 1) * 0.8), 1.6); c.fill();
    if (s.can) { drawJerrycan(c, s.x, s.y - z + 2, 0.55 * Math.max(1, s.size || 1), s.rot + s.t * 10); continue; }
    if (s.draw9 && drawSeed9(c, s, z)) continue;
    seedShape(c, s.x, s.y - z + 2, 5 * (s.size || 1), s.rot + Math.PI / 2);
    c.fillStyle = fill; c.fill();
    c.strokeStyle = stroke; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,240,215,0.5)';
    circle(c, s.x - 1, s.y - z + 1, 1);
  }
  for (const s of G.strikes) {
    const k = clamp(s.t / 0.5, 0, 1);
    c.fillStyle = `rgba(0,0,0,${0.15 + 0.25 * k})`; ell(c, s.x, s.y + 3, 3 + 6 * k, 1.5 + 3 * k); c.fill();
    c.strokeStyle = `rgba(255,217,160,${0.25 + 0.5 * k})`; c.lineWidth = 1.2; c.beginPath(); c.arc(s.x, s.y, 16 * (1.2 - k * 0.4), 0, TAU); c.stroke();
    seedShape(c, s.x, s.y - (1 - k) * 120, 6, Math.PI);
    c.fillStyle = '#4a2c18'; c.fill(); c.strokeStyle = '#ffd36a'; c.lineWidth = 1.3; c.stroke();
  }
}
function drawVenomBodies(c, t) {
  for (const v of G.venom) {
    if (v.kind) { drawVenomThing(c, v, t); continue; }
    const w = 1 + Math.sin(t * 20 + v.ph) * 0.12;
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, v.x + 1, v.y + 6, v.r * 0.9, v.r * 0.45); c.fill();
    c.fillStyle = rgba(v.col, 0.95); ell(c, v.x, v.y, v.r * w, v.r / w); c.fill();
  }
}
function drawVenomGlow(c, t) {
  if (!G.venom.length) return;
  c.globalCompositeOperation = 'lighter';
  for (const v of G.venom) glowDot(c, v.x, v.y, v.r * (v.kind ? 2.4 : 3.2), v.col, v.kind ? 0.28 : 0.45);
  c.globalCompositeOperation = 'source-over';
  for (const v of G.venom) {
    if (v.kind) { drawVenomThing(c, v, t); continue; }
    const w = 1 + Math.sin(t * 20 + v.ph) * 0.12;
    c.fillStyle = rgba(v.col, 1); ell(c, v.x, v.y, v.r * w * 0.85, (v.r / w) * 0.85); c.fill();
    c.fillStyle = 'rgba(255,250,225,0.9)'; circle(c, v.x - 1.5, v.y - 1.8, v.r * 0.32);
  }
}
function drawLightShaft(c, ex, t) {
  const a = smooth(Math.min(1, ex.t / 1.2));
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(ex.x, ex.y - 220, ex.x, ex.y + 20);
  g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.7, `rgba(255,236,190,${0.35 * a})`); g.addColorStop(1, `rgba(255,236,190,${0.1 * a})`);
  c.fillStyle = g;
  c.beginPath(); c.moveTo(ex.x - 18, ex.y - 230); c.lineTo(ex.x + 18, ex.y - 230); c.lineTo(ex.x + 34, ex.y + 10); c.lineTo(ex.x - 34, ex.y + 10); c.closePath(); c.fill();
  glowDot(c, ex.x, ex.y, 50, '#ffe8b0', 0.4 * a);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = `rgba(255,248,225,${0.7 * a})`;
  for (let i = 0; i < 8; i++) { const ph = (t * 0.25 + i * 0.13) % 1; circle(c, ex.x + Math.sin(i * 2.7 + t) * 22, ex.y + 8 - ph * 160, 1 + (i % 3) * 0.4); }
}

function drawParticles(c, glow) {
  const t = G.t;
  if (glow) c.globalCompositeOperation = 'lighter';
  for (const p of G.particles) {
    if (!!p.glow !== glow) continue;
    const u = p.t / p.life, a = 1 - u * u;
    switch (p.kind) {
      case 'sev': {
        const tw = u < 0.6 ? Math.sin(p.t * 48 + p.ph) * 1.4 * (1 - u) : 0;
        const fade = u > 0.65 ? 1 - (u - 0.65) / 0.35 : 1;
        c.globalAlpha = fade;
        c.fillStyle = p.col2; circle(c, p.x + tw, p.y, p.r + 1.6);
        c.fillStyle = p.col; circle(c, p.x + tw, p.y, p.r);
        c.fillStyle = 'rgba(80,20,25,0.55)'; circle(c, p.x + tw + p.r * 0.2, p.y + p.r * 0.15, p.r * 0.45);
        c.globalAlpha = 1;
        break;
      }
      case 'chunk':
        c.globalAlpha = a; c.fillStyle = '#5a2a1a'; circle(c, p.x, p.y, p.r * (1 - u * 0.4) + 0.8);
        c.fillStyle = p.col; circle(c, p.x, p.y, p.r * (1 - u * 0.4)); c.globalAlpha = 1; break;
      case 'shard':
        c.globalAlpha = a; c.fillStyle = p.col;
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.beginPath(); c.moveTo(-p.r, -p.r * 0.6); c.lineTo(p.r, -p.r * 0.2); c.lineTo(-p.r * 0.2, p.r); c.closePath(); c.fill();
        c.restore(); c.globalAlpha = 1; break;
      case 'bubble':
        c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = 0.8;
        c.beginPath(); c.arc(p.x + Math.sin(t * 6 + p.y) * 1.2, p.y, p.r, 0, TAU); c.stroke(); c.globalAlpha = 1; break;
      case 'ring':
        c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, p.r + u * 30, 0, TAU); c.stroke(); c.globalAlpha = 1; break;
      case 'text': break;
      case 'wind': {
        c.globalAlpha = a * 0.55; c.strokeStyle = p.col; c.lineWidth = 1.2;
        const sp = Math.hypot(p.vx, p.vy) || 1;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - (p.vx / sp) * p.r, p.y - (p.vy / sp) * p.r); c.stroke(); c.globalAlpha = 1; break;
      }
      case 'paper':
        c.globalAlpha = a; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.t * 6 + p.rot)) * 0.7 + 0.3);
        c.fillStyle = p.col; c.fillRect(-p.r, -p.r * 1.3, p.r * 2, p.r * 2.6);
        c.fillStyle = 'rgba(40,40,60,0.4)'; c.fillRect(-p.r * 0.6, -p.r * 0.6, p.r * 1.2, 0.8); c.fillRect(-p.r * 0.6, p.r * 0.1, p.r * 1.2, 0.8);
        c.restore(); c.globalAlpha = 1; break;
      case 'zap': {
        c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = 2;
        const n = 6, dx = p.x2 - p.x, dy = p.y2 - p.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
        c.beginPath(); c.moveTo(p.x, p.y);
        for (let i = 1; i < n; i++) { const f = i / n, o = Math.sin(p.seed + i * 7.3 + t * 40) * 7; c.lineTo(p.x + dx * f + nx * o, p.y + dy * f + ny * o); }
        c.lineTo(p.x2, p.y2); c.stroke(); c.globalAlpha = 1; break;
      }
      default:
        c.globalAlpha = a; c.fillStyle = p.col; circle(c, p.x, p.y, p.r * (1 - u * 0.5)); c.globalAlpha = 1;
    }
  }
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
}

function drawTexts(c) {
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const p of G.particles) {
    if (p.kind !== 'text') continue;
    const u = p.t / p.life, a = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
    const s = (p.r || 1) * (u < 0.12 ? 0.6 + u * 3.3 : 1);
    c.globalAlpha = a;
    c.font = `700 ${Math.round(10 * s)}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    c.lineWidth = 3; c.strokeStyle = 'rgba(10,6,6,0.85)'; c.strokeText(p.text, p.x, p.y);
    c.fillStyle = p.col; c.fillText(p.text, p.x, p.y);
  }
  c.globalAlpha = 1;
}

/* ------------------------------------------------------------------ HUD */
const HUD_FONT = '"Barlow Condensed", "Arial Narrow", sans-serif';
const HudStats = { prev: null, flash: {} };
function hudPanel(c, x, y, w, h) {
  c.fillStyle = 'rgba(12,8,8,0.62)'; rrect(c, x, y, w, h, 6); c.fill();
  c.strokeStyle = 'rgba(236,226,212,0.09)'; c.lineWidth = 1; rrect(c, x + 0.5, y + 0.5, w - 1, h - 1, 6); c.stroke();
}
function playerStats(P) {
  const st = [
    ['DMG', seedDmg(P) * (P.twin ? 1.6 : 1) * (P.spread ? 1.42 : 1), (v) => v.toFixed(1)],
    ['RATE', 1 / effDelay(P, true), (v) => v.toFixed(1)],
    ['SPD', P.speed * P.mods.speed, (v) => String(Math.round(v))],
    ['RNG', (P.range * P.mods.range) / T, (v) => v.toFixed(1)],
  ];
  if (P.eater) st.push(['GROW', P.growth, (v) => `${v}/16`]);
  return st;
}
function updateHudStats(P) {
  const st = playerStats(P);
  const now = st.map((x) => x[1]);
  if (HudStats.prev && HudStats.prev.length === now.length) {
    for (let i = 0; i < now.length; i++) {
      const d = now[i] - HudStats.prev[i];
      if (Math.abs(d) > 1e-3) HudStats.flash[i] = { t: G.t, up: d > 0 };
    }
  }
  HudStats.prev = now;
  return st;
}
function drawStatCell(c, i, st, x, y, w) {
  const [k, v, fmt] = st;
  const f = HudStats.flash[i];
  const hot = f && G.t - f.t < 2.2 ? 1 - (G.t - f.t) / 2.2 : 0;
  c.textBaseline = 'middle'; c.textAlign = 'left';
  c.font = `600 9px ${HUD_FONT}`; c.fillStyle = 'rgba(236,226,212,0.42)'; c.fillText(k, x, y);
  c.font = `700 12px ${HUD_FONT}`;
  c.fillStyle = hot > 0 ? (f.up ? `rgba(150,230,120,${0.55 + hot * 0.45})` : `rgba(255,110,110,${0.55 + hot * 0.45})`) : 'rgba(236,226,212,0.9)';
  c.fillText(fmt(v), x + Math.min(30, w * 0.45), y + 0.5);
}
function roomChip(room) {
  if (!room) return null;
  if (room.type === 'boss' && !room.cleared) return ['BOSS', '#e83a50'];
  if (room.type === 'chaosboss') return room.cleared ? ['BOSS DOWN', '#8a3a3f'] : ['BOSS', '#e83a50'];
  if (room.type === 'club') return room.cleared ? ['PARTY OVER', '#b05aff'] : ['CLUB', '#ff3ad8'];
  if (room.type === 'hellclub') return room.cleared ? ['SILENCE', '#8a3a3f'] : ['HELLCLUB', '#ff3a2a'];
  if (room.type === 'tank') return ['BP TANKSTATION', '#4ac05a'];
  if (room.type === 'kapper') return ['KAPSALON', '#e8e2d0'];
  if (room.type === 'courtroom') return room.locked ? ['TAAKSTRAF', '#e0583e'] : [room.verdictDone ? 'CASE CLOSED' : 'RECHTBANK', '#d8b46a'];
  if (room.type === 'portal') return [room.cleared ? 'PORTAL CLOSED' : 'PORTAL BOSS', '#b05aff'];
  if (room.type === 'secret' && !room.cleared) return ['SECRET', '#9aa83a'];
  if (room.type === 'challenge') return room.cleared ? ['CHALLENGE WON', '#e0a05a'] : [room.wave ? `WAVE ${room.wave} OF 3` : 'TOUCH THE ALTAR', '#e0583e'];
  if (room.type === 'offering') return ['OFFERING', '#d04a5c'];
  if (room.type === 'pantry') return ['PANTRY', '#8fc24a'];
  if (room.type === 'chest') return room.chest && room.chest.woke && room.locked ? ['MIMIC', '#e83a50'] : ['TREASURE', '#e3a54a'];
  if (room.type === 'shop') return ['SHOP', '#1aa0e0'];
  if (room.voteRoom && room.pickups.some((p) => p.vote)) return ['VOTE', '#e8742a'];
  if (room.type === 'miniboss' && !room.cleared) return ['MINI BOSS', '#e8742a'];
  if (room.type === 'survival') { const S = room.surv; return room.cleared ? ['SURVIVED', '#e0a05a'] : S.on ? [`SURVIVE ${Math.max(0, Math.ceil(S.len - S.t))}`, '#e0583e'] : ['TOUCH THE ALTAR', '#e0583e']; }
  if (room.type === 'gamble') return room.locked ? ['BUST', '#e83a50'] : [room.slot && room.slot.broken ? 'OUT OF ORDER' : 'SLOT MACHINE', '#f2c230'];
  if (room.type === 'spring') return room.spring && room.spring.used ? ['SPRING USED', '#4a7a74'] : ['SPRING', '#4ac0b0'];
  if (room.type === 'library' && room.pickups.some((p) => p.book)) return ['CURSED BOOKS', '#c48af0'];
  if (room.type === 'vault') return ['VAULT', '#c9a000'];
  if (room.mod && !room.cleared) return [{ dark: 'DARK ROOM', swarm: 'SWARM', elite: 'GOLD WORM', spikes: 'SPIKES', freezer: 'FREEZER', collapse: 'CRUMBLING FLOOR', skins: 'SHED SKINS', roots: 'ROOTS', lasers: 'LASERS', blackice: 'BLACK ICE' }[room.mod] || String(room.mod).toUpperCase(), room.mod === 'elite' ? '#f0c040' : room.mod === 'freezer' || room.mod === 'blackice' ? '#9ad0ff' : room.mod === 'lasers' ? '#ff7af0' : room.mod === 'roots' ? '#c87850' : '#b7a89a'];
  return null;
}
function drawChip(c, txt, col, x, y, align) {
  txt = sayF9(txt);
  c.font = `700 10px ${HUD_FONT}`;
  const w = c.measureText(txt).width + 14;
  const bx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  c.fillStyle = 'rgba(12,8,8,0.7)'; rrect(c, bx, y, w, 16, 8); c.fill();
  c.strokeStyle = rgba(col, 0.7); c.lineWidth = 1; rrect(c, bx + 0.5, y + 0.5, w - 1, 15, 7.5); c.stroke();
  c.fillStyle = col; circle(c, bx + 7, y + 8, 2);
  c.fillStyle = 'rgba(236,226,212,0.9)'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText(txt, bx + 11, y + 8.5);
  return w;
}

function renderHUD(c, L) {
  const P = G.player, t = G.t, room = G.room;
  if (G.state === 'pause') return;
  c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  const portrait = View.portrait;
  const stats = updateHudStats(P);
  const roomBottom = View.oy + VIEW_H * View.s;
  const mm = drawMinimap(c);
  // ---- hearts + items (top left)
  const x0 = 10, y0 = 10, pad = 7;
  const n = Math.ceil(P.maxHp / 2);
  let pw = portrait ? Math.max(70, Math.min(8 * 22 + pad * 2, mm.left - x0 - 8)) : Math.max(110, Math.min(206, View.ox - 20));
  const perRow = Math.max(3, Math.floor((pw - pad * 2) / 22));
  const rows = Math.ceil(n / perRow);
  if (portrait) pw = Math.min(n, perRow) * 22 + pad * 2;
  const isz = 18, igap = 3, iPer = portrait ? 1 : Math.max(1, Math.floor((pw - pad * 2 + igap) / (isz + igap)));
  const things = hudThings(P);
  const iRows = portrait ? 0 : Math.ceil(things.length / iPer);
  const statsH = portrait ? 0 : Math.ceil(stats.length / 2) * 15 + 4;
  const coinH = 17;
  const ph = pad + rows * 23 + coinH + (statsH ? statsH + 2 : 0) + (iRows ? iRows * (isz + igap) + 4 : 0) + pad - 2;
  hudPanel(c, x0, y0, pw, ph);
  for (let i = 0; i < n; i++) {
    const v = clamp(P.hp - i * 2, 0, 2);
    const img = View.hearts[v];
    if (!img) continue;
    const row = Math.floor(i / perRow), col = i % perRow;
    const bob = P.hp <= 2 && v > 0 ? Math.sin(t * 8) * 1.2 : 0;
    c.drawImage(img, x0 + pad + col * 22, y0 + pad + row * 23 + bob, 22, 22);
  }
  let cy = y0 + pad + rows * 23 + 2;
  {
    const cn = G.run ? G.run.coins : 0;
    coinIcon(c, x0 + pad + 6, cy + 6, 4.4);
    c.font = `700 12px ${HUD_FONT}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    const flash = HudStats.coinT && G.t - HudStats.coinT < 0.6;
    c.fillStyle = flash ? '#ffe7a0' : 'rgba(236,226,212,0.9)'; c.fillText(String(cn), x0 + pad + 15, cy + 6.5);
    if (HudStats.coins !== cn) { HudStats.coins = cn; HudStats.coinT = G.t; }
    let tx = x0 + pad + 15 + c.measureText(String(cn)).width + 10;
    const keys = G.run ? G.run.keys || 0 : 0;
    if (keys) {
      c.save(); c.translate(tx + 5, cy + 6.5); c.rotate(-0.6);
      c.strokeStyle = '#f2c230'; c.lineWidth = 1.8; c.beginPath(); c.arc(-3, 0, 2.6, 0, TAU); c.stroke();
      c.fillStyle = '#f2c230'; c.fillRect(-0.6, -0.9, 7, 1.8); c.fillRect(4, 0.8, 1.4, 2.2);
      c.restore();
      c.fillStyle = 'rgba(236,226,212,0.9)'; c.fillText(String(keys), tx + 13, cy + 6.5);
      tx += 26;
    }
    if (G.freeze > 0) { c.fillStyle = '#9ab8ff'; c.fillText('FROZEN', tx, cy + 6.5); }
    cy += coinH;
  }
  if (statsH) {
    c.fillStyle = 'rgba(236,226,212,0.07)'; c.fillRect(x0 + pad, cy, pw - pad * 2, 1);
    const cw = (pw - pad * 2) / 2;
    for (let i = 0; i < stats.length; i++) drawStatCell(c, i, stats[i], x0 + pad + (i % 2) * cw, cy + 9 + Math.floor(i / 2) * 15, cw);
    cy += statsH + 2;
  }
  if (iRows) {
    c.fillStyle = 'rgba(236,226,212,0.07)'; c.fillRect(x0 + pad, cy - 1, pw - pad * 2, 1);
    cy += 3;
    things.forEach((id, k) => {
      const ix = x0 + pad + (k % iPer) * (isz + igap), iy = cy + Math.floor(k / iPer) * (isz + igap);
      drawThingSlot(c, P, id, ix, iy, isz, t);
    });
  }
  // ---- boss bar
  const bb = bossBar();
  const bossOn = !!bb;
  if (bossOn) {
    const bw = Math.min(VIEW_W * View.s * 0.7, 380);
    const bx = View.W / 2 - bw / 2;
    const below = View.H - roomBottom;
    const bh = 12;
    const by = below > 40 ? roomBottom + 10 : roomBottom - WALL * View.s * 0.5 - bh / 2;
    const f = bb.f;
    c.fillStyle = 'rgba(0,0,0,0.75)'; rrect(c, bx - 2, by - 2, bw + 4, bh + 4, 4); c.fill();
    c.fillStyle = '#2a0c10'; rrect(c, bx, by, bw, bh, 3); c.fill();
    if (f > 0) { c.fillStyle = '#c4243a'; rrect(c, bx, by, bw * f, bh, 3); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(bx + 2, by + 1, Math.max(0, bw * f - 4), 2);
    c.fillStyle = 'rgba(255,240,230,0.92)'; c.font = `700 9px ${HUD_FONT}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(bb.name.toUpperCase(), View.W / 2, by + bh / 2 + 0.5);
  }
  // ---- level line, stats and room chip
  const label = `${floorLabel(G.levelIdx).toUpperCase()}  ·  ${L.name.toUpperCase()}`;
  const chip = roomChip(room);
  c.font = `600 11px ${HUD_FONT}`; c.textBaseline = 'top';
  if (portrait) {
    let y = roomBottom + (bossOn ? 30 : 8);
    c.fillStyle = 'rgba(236,226,212,0.42)'; c.textAlign = 'center';
    if (!bossOn) { c.fillText(label, View.W / 2, y); y += 17; }
    // stats in one row
    const ns = stats.length, cw = Math.min(78, (View.W - 30) / ns), sx = View.W / 2 - (cw * ns) / 2;
    for (let i = 0; i < ns; i++) drawStatCell(c, i, stats[i], sx + i * cw + 6, y + 6, cw);
    y += 18;
    // powerups, centred rows under the stats
    const it = things, sz = 20, gp = 4, per = Math.max(1, Math.floor((View.W - 24 + gp) / (sz + gp)));
    for (let k = 0; k < it.length; k++) {
      const row = Math.floor(k / per), inRow = Math.min(per, it.length - row * per);
      const ix = View.W / 2 - (inRow * (sz + gp) - gp) / 2 + (k % per) * (sz + gp), iy = y + row * (sz + gp);
      drawThingSlot(c, P, it[k], ix, iy, sz, t);
    }
    if (it.length) y += Math.ceil(it.length / per) * (sz + gp) + 2;
    if (chip) drawChip(c, chip[0], chip[1], View.W / 2, y + 2, 'center');
    HudStats.pBottom = y + (chip ? 24 : 4);
  } else {
    c.textAlign = 'left'; c.fillStyle = 'rgba(236,226,212,0.42)';
    c.fillText(label, x0 + 2, View.H - 22);
    const rx = View.W - 12;
    if (chip) drawChip(c, chip[0], chip[1], rx, mm.bottom + 8, 'right');
  }
}

function drawMinimap(c) {
  const map = G.map; if (!map) return { bottom: 50, left: View.W - 62 };
  const b = map.bounds;
  const cw = 14, ch = 10, gap = 3, pad = 7;
  const w = (b.maxX - b.minX + 1) * (cw + gap) - gap, h = (b.maxY - b.minY + 1) * (ch + gap) - gap;
  const right = View.W - 12 - 50;
  const x0 = right - w - pad, y0 = 10 + pad;
  const counted = map.rooms.filter((r) => r.type !== 'secret' && r.type !== 'hellclub');
  const seen = counted.filter((r) => r.visited).length;
  hudPanel(c, x0 - pad, y0 - pad, w + pad * 2, h + pad * 2 + 14);
  const known = new Set();
  for (const r of map.rooms) if (r.visited) { known.add(r); for (const k in r.doors) known.add(r.doors[k]); }
  // corridors
  c.strokeStyle = 'rgba(236,226,212,0.18)'; c.lineWidth = 1.5;
  for (const r of map.rooms) {
    if (!r.visited) continue;
    const x = x0 + (r.gx - b.minX) * (cw + gap) + cw / 2, y = y0 + (r.gy - b.minY) * (ch + gap) + ch / 2;
    for (const k in r.doors) { const o = r.doors[k]; if (!known.has(o)) continue; c.beginPath(); c.moveTo(x, y); c.lineTo(x0 + (o.gx - b.minX) * (cw + gap) + cw / 2, y0 + (o.gy - b.minY) * (ch + gap) + ch / 2); c.stroke(); }
  }
  for (const r of map.rooms) {
    if (!known.has(r)) continue;
    const x = x0 + (r.gx - b.minX) * (cw + gap), y = y0 + (r.gy - b.minY) * (ch + gap);
    const cur = r === G.room;
    if (cur) { c.fillStyle = '#ece2d4'; rrect(c, x, y, cw, ch, 2); c.fill(); }
    else if (r.visited) { c.fillStyle = r.cleared ? '#5e524b' : '#8a3a3f'; rrect(c, x, y, cw, ch, 2); c.fill(); }
    else { c.fillStyle = 'rgba(20,14,14,0.9)'; rrect(c, x, y, cw, ch, 2); c.fill(); c.strokeStyle = 'rgba(236,226,212,0.3)'; c.lineWidth = 1; rrect(c, x + 0.5, y + 0.5, cw - 1, ch - 1, 2); c.stroke(); }
    const mx = x + cw / 2, my = y + ch / 2;
    if (r.type === 'boss') {
      c.fillStyle = cur ? '#8e1426' : '#e83a50'; circle(c, mx, my - 0.5, 3);
      c.fillStyle = cur ? '#ece2d4' : '#1a0c0c'; circle(c, mx - 1.1, my - 1, 0.8); circle(c, mx + 1.1, my - 1, 0.8);
    } else if (r.type === 'secret') { c.fillStyle = '#9aa83a'; circle(c, mx, my, 2.4); }
    else if (r.type === 'chest') { c.fillStyle = cur ? '#8a6018' : '#e3a54a'; c.fillRect(mx - 3, my - 2, 6, 4.5); c.fillStyle = cur ? '#ece2d4' : '#5a3a10'; c.fillRect(mx - 3, my - 0.5, 6, 0.8); }
    else if (r.type === 'challenge') { c.fillStyle = cur ? '#8e2a1a' : '#e0583e'; c.beginPath(); c.moveTo(mx, my - 3.2); c.lineTo(mx + 3, my); c.lineTo(mx, my + 3.2); c.lineTo(mx - 3, my); c.closePath(); c.fill(); }
    else if (r.type === 'offering') { c.fillStyle = cur ? '#7a1020' : '#d04a5c'; c.beginPath(); c.moveTo(mx, my - 3.4); c.quadraticCurveTo(mx + 3, my + 0.5, mx, my + 3); c.quadraticCurveTo(mx - 3, my + 0.5, mx, my - 3.4); c.fill(); }
    else if (r.type === 'portal') { c.fillStyle = cur ? '#4a2a78' : '#b05aff'; c.fillRect(mx - 3, my - 3, 6, 6); c.fillStyle = cur ? '#ece2d4' : '#1a0a2a'; c.fillRect(mx - 1.2, my - 1.2, 2.4, 2.4); }
    else if (r.type === 'pantry') { c.fillStyle = cur ? '#4a6a20' : '#8fc24a'; circle(c, mx, my + 0.5, 2.6); c.fillRect(mx - 0.5, my - 3.5, 1, 2); }
    else if (r.type === 'shop') { c.fillStyle = cur ? '#8a6018' : '#f2c230'; circle(c, mx, my, 2.8); c.fillStyle = cur ? '#ece2d4' : '#7a5208'; circle(c, mx, my, 1.2); }
    else if (r.type === 'vote') { c.fillStyle = cur ? '#8a3a10' : '#e8742a'; c.fillRect(mx - 2.6, my - 2, 5.2, 4.4); c.fillStyle = cur ? '#ece2d4' : '#2a1206'; c.fillRect(mx - 0.6, my - 3.4, 1.2, 1.8); }
    else if (r.type === 'vault') { c.fillStyle = cur ? '#6a5208' : '#c9a000'; c.fillRect(mx - 3, my - 2.6, 6, 5.2); c.fillStyle = cur ? '#ece2d4' : '#2a1a08'; if (r.sealed) { c.fillRect(mx - 1.6, my - 2.6, 0.9, 5.2); c.fillRect(mx + 0.7, my - 2.6, 0.9, 5.2); } else circle(c, mx, my, 1); }
    else if (r.type === 'gamble') { c.fillStyle = cur ? '#8a1a20' : '#e83a50'; c.fillRect(mx - 2.6, my - 3, 5.2, 6); c.fillStyle = cur ? '#ece2d4' : '#f2c230'; c.fillRect(mx - 1.8, my - 1.6, 3.6, 1.6); }
    else if (r.type === 'spring') { c.fillStyle = cur ? '#1a6a6a' : '#4ac0b0'; c.beginPath(); c.moveTo(mx, my - 3.4); c.quadraticCurveTo(mx + 3, my + 0.8, mx, my + 3); c.quadraticCurveTo(mx - 3, my + 0.8, mx, my - 3.4); c.fill(); }
    else if (r.type === 'library') { c.fillStyle = cur ? '#4a1a6a' : '#b05aff'; c.fillRect(mx - 3, my - 2, 2.7, 4.2); c.fillRect(mx + 0.3, my - 2, 2.7, 4.2); }
    else if (r.type === 'miniboss') { c.fillStyle = cur ? '#8a3a10' : '#e8742a'; circle(c, mx, my - 0.3, 2.6); c.fillStyle = cur ? '#ece2d4' : '#1a0c0c'; circle(c, mx - 0.9, my - 0.6, 0.6); circle(c, mx + 0.9, my - 0.6, 0.6); }
    else if (r.type === 'survival') { c.fillStyle = cur ? '#8a4a10' : '#e0a05a'; c.beginPath(); c.moveTo(mx - 2.6, my - 3); c.lineTo(mx + 2.6, my - 3); c.lineTo(mx - 2.6, my + 3); c.lineTo(mx + 2.6, my + 3); c.closePath(); c.fill(); }
    else if (MINI9[r.type]) MINI9[r.type](c, mx, my, cur);
    else if (r.type === 'start' && !cur) { c.fillStyle = 'rgba(236,226,212,0.5)'; circle(c, mx, my, 1.2); }
  }
  c.fillStyle = 'rgba(236,226,212,0.5)'; c.font = `600 9px ${HUD_FONT}`; c.textAlign = 'right'; c.textBaseline = 'middle';
  c.fillText(`EXPLORED ${seen}/${counted.length}`, x0 + w, y0 + h + 10);
  return { bottom: y0 + h + pad + 14, left: x0 - pad };
}

function renderSticks(c) {
  if (G.state !== 'play') return;
  c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  const R = Input.R;
  const drawStick = (s, col) => {
    c.strokeStyle = rgba(col, 0.35); c.lineWidth = 2;
    c.beginPath(); c.arc(s.ox, s.oy, R, 0, TAU); c.stroke();
    const dx = s.x - s.ox, dy = s.y - s.oy, d = Math.hypot(dx, dy), m = Math.min(d, R);
    const kx = d > 0 ? s.ox + (dx / d) * m : s.ox, ky = d > 0 ? s.oy + (dy / d) * m : s.oy;
    c.fillStyle = rgba(col, 0.4); circle(c, kx, ky, 22);
  };
  if (Input.sticks.move) drawStick(Input.sticks.move, '#ece2d4');
  if (Input.sticks.aim) drawStick(Input.sticks.aim, '#e83a50');
  if (Input.touchMode && !(Input.used.move && Input.used.aim) && G.levelIdx === 0) {
    const y = View.portrait ? Math.max(View.oy + VIEW_H * View.s + 90, View.H * 0.78) : View.H * 0.72;
    const a = 0.22 + 0.08 * Math.sin(G.t * 3);
    c.font = '600 13px "Barlow Condensed", "Arial Narrow", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const sideX = View.portrait ? View.W * 0.22 : Math.max(R + 14, View.ox / 2);
    if (!Input.used.move && !Input.sticks.move) {
      const x = sideX;
      c.strokeStyle = `rgba(236,226,212,${a})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      c.fillStyle = `rgba(236,226,212,${a + 0.2})`; c.fillText('MOVE', x, y);
    }
    if (!Input.used.aim && !Input.sticks.aim) {
      const x = View.W - sideX;
      c.strokeStyle = `rgba(232,58,80,${a + 0.05})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      c.fillStyle = `rgba(236,226,212,${a + 0.2})`; c.fillText('SHOOT', x, y);
    }
  }
}

/* ------------------------------------------------------------------ menu scene */
/* v13.1: the start screen is a night show. Six short scenes take turns, each on a floor of its own,
   with the light going out between them: the Long One circling, a grub swarm the apple shoots at,
   a lamprey under the floor, two hoods spitting, the supermarket duo with price tags, and a boss
   passing in the dark. Your own apple is always in the middle. */
const MenuScene = {
  t: 0, st: 0, scene: null, order: [], oi: 0, fx: [], shots: [], snakes: [], eyes: [],
  ap: null, theme: 0, flick: 0, cut: 0, shake: 0, holes: [],
  SCENES: ['circle', 'swarm', 'burrow', 'hood', 'market', 'boss'],
  THEME: { circle: 0, swarm: 4, burrow: 1, hood: 4, market: 2, boss: 3 },
  LEN: { circle: 11, swarm: 10, burrow: 10, hood: 9, market: 10, boss: 11 },
  // kept so old patches that read MenuScene.snake still find one
  get snake() { return this.snakes[0] || null; },
  init() {
    this.eyes = [];
    for (let i = 0; i < 7; i++) this.eyes.push({ x: rnd(-1, 1), y: rnd(-1, 1), t: rnd(0, 6), life: rnd(2, 4), s: rnd(0.7, 1.2) });
    this.order = ['circle'].concat(shuffle(this.SCENES.slice(1)));
    this.oi = 0; this.cut = 0;
    this.start(REDUCED ? 'circle' : this.order[0]);
    for (let i = 0; i < 90; i++) this.step(1 / 30);
  },
  mk(kind, x, y, len) {
    const ang = Math.atan2(-y, -x), back = ang + Math.PI, K = KINDS[kind];
    const total = (K.maxLen + 2) * K.spacing;
    const sn = new Snake(kind, x + Math.cos(back) * total, y + Math.sin(back) * total, { emerge: false, ang });
    sn.state = 'active'; sn.eyeOpen = 1; if (len) sn.len = Math.min(len, sn.maxLen);
    // lay the body down behind the head so it exists from frame one
    for (let i = 1; i <= 40; i++) sn.moveTo(x + Math.cos(back) * total * (1 - i / 40), y + Math.sin(back) * total * (1 - i / 40));
    sn.ang = sn.drawAng = ang; sn.computeBody();
    return sn;
  },
  start(name) {
    this.scene = name; this.st = 0; this.snakes = []; this.shots = []; this.fx = []; this.holes = [];
    this.theme = this.THEME[name] || 0;
    this.ap = { x: 0, y: 0, vx: 0, hop: 0, look: 0, fear: 0.85, mouth: 0, cd: 1.2, target: null, bites: [{ a: 0.35, t: -3 }] };
    const S = this.snakes;
    if (name === 'circle') {
      const sn = this.mk('long', 150, 0, 22); sn.a = 0; S.push(sn);
      const g = this.mk('grub', -260, 140, 7); g.role = 'cross'; g.wait = 4.5; S.push(g);
    } else if (name === 'swarm') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + rnd(-0.2, 0.2), r = rnd(250, 300);
        const g = this.mk('grub', Math.cos(a) * r, Math.sin(a) * r * 0.8, rndi(6, 9));
        g.orb = a; g.wait = i * 0.35; g.lungeCd = rnd(1.5, 3); g.hp = 2; S.push(g);
      }
    } else if (name === 'burrow') {
      const sn = this.mk('lamprey', -200, -80, 12); sn.phase = 'under'; sn.pt = 0; sn.a = Math.PI;
      sn.under = [[sn.odo - 1, 1e12]]; sn.burrowed = true; S.push(sn);
    } else if (name === 'hood') {
      for (const s of [-1, 1]) { const h = this.mk('hood', s * 175, -40 + s * 30, 12); h.side = s; h.spitCd = 1.2 + (s > 0 ? 1.1 : 0); S.push(h); }
    } else if (name === 'market') {
      const b = this.mk('bonus', -170, 0, 11); b.ph = 0; b.tagCd = 2; S.push(b);
      const d = this.mk('discount', 170, 0, 10); d.ph = Math.PI; S.push(d);
    } else if (name === 'boss') {
      const kind = pick(['ouro', 'mother', 'queen']);
      const b = this.mk(kind, -380, -150, kind === 'ouro' ? 30 : 0); b.boss = true; b.a = Math.PI * 1.15; S.push(b);
    }
  },
  steer(sn, tx, ty, speed, turn, dt) {
    sn.ang = turnToward(sn.ang, Math.atan2(ty - sn.y, tx - sn.x), dt * turn);
    sn.moveTo(sn.x + Math.cos(sn.ang) * speed * dt, sn.y + Math.sin(sn.ang) * speed * dt);
    sn.drawAng = sn.ang;
  },
  life(sn, dt) {
    sn.computeBody();
    sn.blinkCd -= dt; if (sn.blinkCd <= 0) { sn.blinkT = 0.13; sn.blinkCd = rnd(2.5, 6); } if (sn.blinkT > 0) sn.blinkT -= dt;
    if (sn.flash > 0) sn.flash -= dt;
    sn.mouth = Math.max(0, (sn.mouth || 0) - dt * 2);
  },
  fire(tx, ty, sp = 330) {
    const A = this.ap, a = Math.atan2(ty - A.y, tx - A.x);
    this.shots.push({ x: A.x + Math.cos(a) * 16, y: A.y + Math.sin(a) * 16, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, life: 1.1, kind: 'seed' });
    A.mouth = 0.18;
  },
  puff(x, y, col, n = 8, sp = 90) {
    for (let i = 0; i < n; i++) { const a = rnd(TAU), v = rnd(sp * 0.3, sp); this.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.3, 0.6), max: 0.6, r: rnd(1, 2.6), col }); }
  },
  step(dt) {
    this.t += dt; this.st += dt;
    const A = this.ap, S = this.snakes, sc = this.scene, st = this.st;
    // scene change: the light dies, the next scene starts in the dark, the light comes back
    if (!REDUCED) {
      const len = this.LEN[sc] || 10;
      if (st > len && !this.cut) this.cut = 0.0001;
      if (this.cut) {
        this.cut += dt;
        if (this.cut >= 0.7 && !this.swapped) {
          this.swapped = true; this.oi = (this.oi + 1) % this.order.length;
          if (this.oi === 0) this.order = [this.order[this.order.length - 1]].concat(shuffle(this.SCENES.filter((s) => s !== this.order[this.order.length - 1])));
          this.start(this.order[this.oi]); this.st = 0;
        }
        if (this.cut >= 1.5) { this.cut = 0; this.swapped = false; }
      }
    }
    this.shake = Math.max(0, this.shake - dt * 2.5);
    A.mouth = Math.max(0, A.mouth - dt); A.hop = Math.max(0, A.hop - dt * 2.2);
    A.x += A.vx * dt; A.vx *= Math.pow(0.02, dt); A.x = clamp(A.x * Math.pow(0.6, dt), -60, 60);
    A.y = approach(A.y, 0, dt * 20);
    let near = null, nd = 1e9;
    for (const sn of S) { if (sn.dead || sn.burrowed) continue; const d = dist2(sn.x, sn.y, A.x, A.y); if (d < nd) { nd = d; near = sn; } }
    if (sc === 'circle') {
      const sn = S[0]; sn.a += dt * 0.42;
      const R = 162 + Math.sin(this.t * 0.6) * 18;
      this.steer(sn, Math.cos(sn.a) * R, Math.sin(sn.a) * R * 0.78, 74, 3, dt);
      if (st > 6.5 && st < 7.1) sn.mouth = 1;
      const g = S[1];
      if (g && st > g.wait) { this.steer(g, 300, -170, 95, 1.2, dt); if (st > 6.2 && !g.shot) { g.shot = true; this.fire(g.x + 30, g.y - 10); } }
    } else if (sc === 'swarm') {
      A.cd -= dt;
      const live = S.filter((g) => !g.dead);
      for (const g of live) {
        if (st < g.wait) continue;
        g.orb += dt * 0.55;
        const r = Math.max(70, 220 - st * 16), tx = Math.cos(g.orb) * r, ty = Math.sin(g.orb) * r * 0.8;
        g.lungeCd -= dt;
        if (g.lungeCd < 0 && g.lungeCd > -0.45) this.steer(g, A.x, A.y, 210, 5, dt), g.mouth = 1;
        else { if (g.lungeCd <= -0.45) g.lungeCd = rnd(1.6, 3); this.steer(g, tx, ty, 92, 4.5, dt); }
        if (dist(g.x, g.y, A.x, A.y) < 34) { g.lungeCd = rnd(1.6, 3); g.ang += Math.PI; A.vx += (A.x - g.x) * 4; A.hop = 1; this.shake = 0.5; this.puff(A.x, A.y - 8, '#f6e9cb', 6, 60); }
      }
      if (A.cd <= 0 && live.length && st > 1.2) {
        const tg = pick(live); A.target = tg; A.cd = rnd(0.32, 0.55);
        this.fire(tg.x + Math.cos(tg.ang) * 18, tg.y + Math.sin(tg.ang) * 18);
      }
      if (!live.length && st < this.LEN.swarm - 1.5) this.st = this.LEN.swarm - 1.5;
    } else if (sc === 'burrow') {
      const sn = S[0]; sn.pt += dt;
      if (sn.phase === 'under') {
        sn.a += dt * 0.9;
        const R = 150 - sn.pt * 14;
        this.steer(sn, Math.cos(sn.a) * R, Math.sin(sn.a) * R * 0.8, 120, 3.2, dt);
        if (Math.random() < dt * 14) this.fx.push({ x: sn.x + rnd(-8, 8), y: sn.y + rnd(-6, 6), vx: rnd(-20, 20), vy: rnd(-40, -10), life: 0.5, max: 0.5, r: rnd(1, 2), col: '#6a5340' });
        this.shake = Math.max(this.shake, 0.12);
        A.fear = 1;
        if (sn.pt > 3.6 && dist(sn.x, sn.y, A.x, A.y) < 95) {
          sn.phase = 'out'; sn.pt = 0; sn.under = [[sn.under[0][0], sn.odo]]; sn.burrowed = false; sn.mouth = 1;
          this.holes.push({ x: sn.x, y: sn.y, r: 16, t: 0 }); this.puff(sn.x, sn.y, '#7a5f48', 18, 160); this.shake = 1.2;
          A.hop = 1; A.vx = (A.x - sn.x) * 6 || 120;
        }
      } else if (sn.phase === 'out') {
        // an arc over the apple, then back into the floor
        const away = Math.atan2(sn.y - A.y, sn.x - A.x) + 1.4;
        this.steer(sn, A.x + Math.cos(away) * 120, A.y + Math.sin(away) * 100, 150, 2.6, dt);
        if (sn.pt > 2.6) { sn.phase = 'dive'; sn.pt = 0; sn.under = sn.under.concat([[sn.odo, 1e12]]); sn.burrowed = true; this.holes.push({ x: sn.x, y: sn.y, r: 14, t: 0 }); this.puff(sn.x, sn.y, '#7a5f48', 12, 120); this.shake = 0.7; }
      } else {
        this.steer(sn, sn.x * 1.4 + 40, sn.y * 1.4 + 30, 130, 1, dt);
      }
    } else if (sc === 'hood') {
      for (const h of S) {
        const tx = h.side * (165 + Math.sin(st * 0.8 + h.side) * 25), ty = Math.sin(st * 0.6 + h.side * 2) * 70;
        if (h.mode2 === 'spit') { h.ang = turnToward(h.ang, Math.atan2(A.y - h.y, A.x - h.x), dt * 6); h.drawAng = h.ang; h.hood = Math.min(1, h.hood + dt * 3); h.mt2 += dt;
          if (h.mt2 > 0.55 && !h.spat) { h.spat = true; h.mouth = 1; const a = h.ang; for (const o of [-0.18, 0, 0.18]) this.shots.push({ x: h.x + Math.cos(a) * 14, y: h.y + Math.sin(a) * 14, vx: Math.cos(a + o) * 200, vy: Math.sin(a + o) * 200, life: 1.6, kind: 'venom' }); A.vx += (Math.random() < 0.5 ? -1 : 1) * 260; A.hop = 0.8; }
          if (h.mt2 > 1.1) { h.mode2 = null; h.spitCd = rnd(1.8, 2.6); }
        } else {
          h.hood = Math.max(0, h.hood - dt * 2); this.steer(h, tx, ty, 58, 3, dt);
          h.spitCd -= dt; if (h.spitCd <= 0) { h.mode2 = 'spit'; h.mt2 = 0; h.spat = false; }
        }
      }
      A.cd -= dt; if (A.cd <= 0 && near) { A.cd = rnd(0.5, 0.8); this.fire(near.x, near.y, 300); }
    } else if (sc === 'market') {
      const b = S[0], d = S[1];
      b.ph += dt * 0.7; d.ph += dt * 0.7;
      for (const sn of [b, d]) { const p = sn.ph; this.steer(sn, Math.sin(p) * 190, Math.sin(p * 2) * 95, sn === b ? 82 : 78, 3.4, dt); }
      b.tagCd -= dt;
      if (b.tagCd <= 0) { b.tagCd = rnd(1.4, 2.2); const a = Math.atan2(A.y - b.y, A.x - b.x); this.shots.push({ x: b.x, y: b.y, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210, a: 0, life: 2.2, kind: 'tag', home: b, out: 0 }); b.mouth = 1; }
      if (st > 5.4 && st < 6.4) { d.mouth = 1; d.ph += dt * 0.9; }
      A.cd -= dt; if (A.cd <= 0 && near) { A.cd = rnd(0.45, 0.7); this.fire(near.x, near.y); }
    } else if (sc === 'boss') {
      const b = S[0]; b.a += dt * 0.26;
      const R = st < 7 ? 330 : 330 - (st - 7) * 45;
      this.steer(b, Math.cos(b.a) * R, Math.sin(b.a) * R * 0.5, 70, 1.4, dt);
      this.shake = Math.max(this.shake, 0.18 + (st > 7 ? 0.4 : 0));
      A.fear = 1; if (st > 8.5) b.mouth = 1;
    }
    // apple: looks at the nearest threat, hops when scared
    const look = near || S[0];
    if (look) A.look = Math.atan2(look.y - A.y, look.x - A.x);
    for (const sn of S) if (!sn.dead) this.life(sn, dt);
    // seeds, venom and price tags
    for (const s of this.shots) {
      s.life -= dt;
      if (s.kind === 'tag') { s.out += dt; s.a += dt * 12; if (s.out > 0.7) { const h = s.home; const a = Math.atan2(h.y - s.y, h.x - s.x); s.vx = lerp(s.vx, Math.cos(a) * 260, dt * 4); s.vy = lerp(s.vy, Math.sin(a) * 260, dt * 4); if (dist(s.x, s.y, h.x, h.y) < 14) s.life = 0; } }
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.kind === 'seed') {
        for (const sn of S) {
          if (sn.dead || sn.burrowed || sn.boss) continue;
          if (dist(s.x, s.y, sn.x, sn.y) < sn.headR + 6) {
            s.life = 0; sn.flash = 0.08; this.puff(s.x, s.y, sn.K.blood, 6, 80);
            if (sc === 'swarm') { sn.hp -= 1; if (sn.hp <= 0) { sn.dead = true; this.puff(sn.x, sn.y, sn.K.blood, 16, 140); this.holes.push({ x: sn.x, y: sn.y, r: 9, t: 0, splat: sn.K.blood }); } else sn.len = Math.max(3, sn.len - 2); }
            break;
          }
        }
      } else if (s.kind === 'venom' && s.life <= 0) this.holes.push({ x: s.x, y: s.y, r: 8, t: 0, splat: '#7fd04a' });
      if (s.kind === 'venom' && dist(s.x, s.y, A.x, A.y) < 14) { s.life = 0; this.puff(A.x, A.y, '#9fe06a', 8, 70); A.hop = 1; }
    }
    this.shots = this.shots.filter((s) => s.life > 0 && Math.abs(s.x) < 460 && Math.abs(s.y) < 360);
    for (const f of this.fx) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.9; f.vy *= 0.9; }
    this.fx = this.fx.filter((f) => f.life > 0);
    for (const h of this.holes) h.t += dt;
    for (const e of this.eyes) { e.t += dt; if (e.t > e.life + 1.5) { e.t = 0; e.x = rnd(-1, 1); e.y = rnd(-1, 1); e.life = rnd(2, 4); } }
  },
  // the scene sits in the space the menu leaves free
  frameBox() {
    const m = UI.el && UI.el.menu;
    if (m && !m.hidden && (!this.box || (this.boxN = (this.boxN || 0) + 1) % 20 === 0)) {
      const a = m.querySelector('.menu-top').getBoundingClientRect(), b = m.querySelector('.menu-list').getBoundingClientRect();
      if (b.height > 0) this.box = { top: a.bottom, bottom: b.top, right: Math.max(a.right, b.right) };
    }
    return this.box;
  },
  floor(c) {
    const L = LEVELS[this.theme] || LEVELS[0], set = L.set;
    const rng = mulberry32(1234 + this.theme * 77);
    for (let r = -8; r <= 8; r++) for (let q = -8; q <= 8; q++) {
      const x = q * 40 - 20, y = r * 40 - 6, d = Math.hypot(x + 20, y + 20);
      const v = rng();
      if (d > 270) continue;
      c.globalAlpha = clamp(1.15 - d / 270, 0, 1);
      const chk = L.checker ? ((q + r) & 1) : v < 0.5;
      c.fillStyle = chk ? L.floor : L.floor2; rrect(c, x + 1.3, y + 1.3, 37.4, 37.4, set === 'market' ? 0.5 : 3); c.fill();
      if (v > 0.8) { c.fillStyle = 'rgba(0,0,0,0.18)'; circle(c, x + 10 + v * 18, y + 12 + v * 10, 2); }
    }
    c.globalAlpha = 1;
    const t = this.t;
    // a few things that belong to this floor
    for (let i = 0; i < 6; i++) {
      const x = Math.cos(i * 2.3 + this.theme) * 160, y = Math.sin(i * 1.7 + this.theme) * 115 + 25, a = i * 1.3;
      if (set === 'cellar') drawBone(c, x, y, a, 0.9);
      else if (set === 'halls') { c.strokeStyle = 'rgba(225,218,196,0.28)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 18, y); c.quadraticCurveTo(x, y - 10 * Math.cos(a), x + 20, y + 4); c.stroke(); }
      else if (set === 'market') { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = 'rgba(238,246,251,0.5)'; c.fillRect(-7, -4, 14, 8); c.fillStyle = 'rgba(200,30,40,0.55)'; c.fillRect(-7, -4, 4, 8); c.restore(); }
      else if (set === 'kamer') { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = 'rgba(232,226,208,0.45)'; c.fillRect(-8, -6, 16, 12); c.fillStyle = 'rgba(60,60,80,0.4)'; for (let k = 0; k < 3; k++) c.fillRect(-6, -3 + k * 3, 11, 1); c.restore(); }
      else { c.strokeStyle = 'rgba(120,26,38,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); for (let k = 1; k < 5; k++) c.lineTo(x + k * 9, y + Math.sin(k * 1.7 + a + t * 0.6) * 6); c.stroke(); }
    }
    // holes, splats and craters left behind in this scene
    for (const h of this.holes) {
      if (h.splat) { c.fillStyle = rgba(h.splat, 0.45 * Math.max(0, 1 - h.t / 6)); ell(c, h.x, h.y, h.r * 1.3, h.r * 0.8); c.fill(); continue; }
      c.fillStyle = 'rgba(0,0,0,0.6)'; ell(c, h.x, h.y, h.r * 1.4, h.r); c.fill();
      c.strokeStyle = rgba(L.dirt || '#5a4332', 0.9); c.lineWidth = 3; ell(c, h.x, h.y, h.r * 1.6, h.r * 1.15); c.stroke();
    }
  },
  render(c) {
    const W = View.W, H = View.H;
    const wide = W >= H / 1.05, box = this.frameBox();
    let ms, cx, cy;
    if (wide) {
      const left = box ? Math.min(box.right, W * 0.62) : W * 0.4;
      cx = (left + W) / 2; cy = H * 0.52; ms = Math.max(0.45, Math.min((W - left) / 430, H / 470));
    } else {
      const top = box ? box.top : H * 0.22, bot = box ? box.bottom : H * 0.62;
      cx = W / 2; cy = (top + bot) / 2 + 6; ms = Math.max(0.45, Math.min(W / 400, (bot - top) / 330));
    }
    if (this.shake > 0 && !REDUCED && Save.data.settings.shake !== false) { cx += rnd(-1, 1) * this.shake * 3; cy += rnd(-1, 1) * this.shake * 3; }
    c.setTransform(View.dpr * ms, 0, 0, View.dpr * ms, cx * View.dpr, cy * View.dpr);
    const t = this.t, A = this.ap, S = this.snakes, L = LEVELS[this.theme] || LEVELS[0];
    this.floor(c);
    // floor glow under the apple, in the floor's own light
    const g = c.createRadialGradient(A.x, 30, 10, A.x, 30, 260);
    g.addColorStop(0, this.theme === 2 ? 'rgba(90,110,120,0.5)' : this.theme === 3 ? 'rgba(60,70,120,0.5)' : this.theme === 4 ? 'rgba(90,30,34,0.55)' : 'rgba(70,46,34,0.55)'); g.addColorStop(1, 'rgba(20,12,10,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(A.x, 30, 300, 220, 0, 0, TAU); c.fill();
    // lamprey under the floor: the soil rises where it swims
    for (const sn of S) {
      if (!sn.burrowed) continue;
      c.fillStyle = rgba(L.dirt || '#5a4332', 0.85);
      for (let k = 0; k < sn.pts.length; k += 2) { const p = sn.pts[k]; ell(c, p.x, p.y, p.r * 1.25 * (1 - k / sn.pts.length * 0.5), p.r * 0.8); c.fill(); }
      c.fillStyle = 'rgba(0,0,0,0.35)'; ell(c, sn.x, sn.y + 3, 15, 8); c.fill();
      c.fillStyle = rgba(L.dirt || '#5a4332', 1); ell(c, sn.x, sn.y, 14, 9); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sn.x - 8, sn.y); c.lineTo(sn.x + 6, sn.y - 3); c.moveTo(sn.x - 2, sn.y + 4); c.lineTo(sn.x + 4, sn.y - 4); c.stroke();
    }
    const drawSn = (sn) => {
      if (sn.dead) return;
      if (sn.boss) return;
      c.fillStyle = 'rgba(0,0,0,0.3)'; drawSnakeShadow(c, sn);
      drawSnake(c, sn, t);
    };
    for (const sn of S) if (sn.y < A.y) drawSn(sn);
    // the apple
    const k = View.dpr * ms;
    const size = 64, px = Math.ceil(size * 2.4 * k);
    const ac = View.apple, actx = View.actx;
    if (ac.width !== px) { ac.width = px; ac.height = px; }
    actx.setTransform(1, 0, 0, 1, 0, 0); actx.clearRect(0, 0, px, px);
    actx.setTransform(k * 2.4, 0, 0, k * 2.4, px / 2, px / 2);
    const la = A.look;
    drawApple(actx, 14, { char: Save.data.char, t, lookX: Math.cos(la) * 0.9, lookY: Math.sin(la) * 0.9, blink: (t % 4.3) < 0.12 ? 0.05 : 1, fear: A.fear, hurt: A.hop > 0.6 ? 1 : 0, mouthOpen: A.mouth > 0, bites: [{ a: 0.35, t: t - 3 }], leaf: Math.sin(t * 2) * 0.15 });
    const hop = Math.sin(clamp(A.hop, 0, 1) * Math.PI) * 14;
    c.fillStyle = 'rgba(0,0,0,0.45)'; ell(c, A.x, 34, 30 - hop * 0.6, 9 - hop * 0.2); c.fill();
    const tremble = Math.sin(t * 31) * (A.fear > 0.9 ? 1.1 : 0.6);
    c.drawImage(ac, A.x - size * 1.2 + tremble, A.y - size * 1.2 + 2 - hop, size * 2.4, size * 2.4);
    for (const sn of S) if (sn.y >= A.y) drawSn(sn);
    // shots
    for (const s of this.shots) {
      if (s.kind === 'seed') { seedShape(c, s.x, s.y, 4.2, s.a + Math.PI / 2); c.fillStyle = '#5a3820'; c.fill(); c.strokeStyle = '#efd9ad'; c.lineWidth = 1; c.stroke(); }
      else if (s.kind === 'venom') { c.fillStyle = '#3e7a22'; circle(c, s.x, s.y, 5.5); c.fillStyle = '#9fe06a'; circle(c, s.x - 1.2, s.y - 1.2, 3.4); }
      else { c.save(); c.translate(s.x, s.y); c.rotate(s.a); c.fillStyle = '#eef6fb'; c.fillRect(-8, -5, 16, 10); c.fillStyle = '#c3243a'; c.fillRect(-8, -5, 5, 10); c.fillStyle = '#111'; circle(c, -5.5, 0, 1.2); c.restore(); }
    }
    for (const f of this.fx) { c.globalAlpha = clamp(f.life / f.max, 0, 1); c.fillStyle = f.col; circle(c, f.x, f.y, f.r); }
    c.globalAlpha = 1;
    // a boss passing in the dark: a body bigger than the light
    const boss = S.find((s) => s.boss);
    if (boss) { c.save(); c.globalAlpha = 0.55; c.fillStyle = 'rgba(0,0,0,0.3)'; drawSnakeShadow(c, boss); drawSnake(c, boss, t); c.restore(); }
    // darkness around the little light of the apple; it flickers before a cut
    c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    const out = this.cut ? (this.cut < 0.7 ? smooth(this.cut / 0.7) * (0.85 + Math.random() * 0.15) : smooth(1 - (this.cut - 0.7) / 0.8)) : 0;
    const rr = 250 * ms * (1 - out * 0.85);
    const ax = cx + A.x * ms;
    const dg = c.createRadialGradient(ax, cy, rr * 0.25, ax, cy, Math.max(W, H) * 0.75);
    dg.addColorStop(0, `rgba(6,3,3,${out * 0.9})`); dg.addColorStop(0.35, `rgba(6,3,3,${0.72 + out * 0.26})`); dg.addColorStop(1, 'rgba(6,3,3,0.97)');
    c.fillStyle = dg; c.fillRect(0, 0, W, H);
    c.setTransform(View.dpr * ms, 0, 0, View.dpr * ms, cx * View.dpr, cy * View.dpr);
    for (const sn of S) if (!sn.dead && !sn.burrowed) drawSnakeGlow(c, sn, t, { x: A.x, y: A.y });
    // dust drifting through the light
    c.fillStyle = this.theme === 4 ? 'rgba(255,150,130,0.3)' : 'rgba(255,236,200,0.35)';
    for (let i = 0; i < 18; i++) {
      const ph = (t * (0.02 + (i % 5) * 0.006) + i * 0.137) % 1;
      circle(c, Math.sin(i * 12.9898) * 120 + Math.sin(t * 0.3 + i) * 10, 90 - ph * 220, 0.7 + (i % 3) * 0.4);
    }
    // seed and venom glow, so the shots read in the dark
    c.globalCompositeOperation = 'lighter';
    for (const s of this.shots) if (s.kind === 'venom') glowDot(c, s.x, s.y, 16, '#7fd04a', 0.35);
    c.globalCompositeOperation = 'source-over';
    for (const e of this.eyes) {
      const o = e.t < 0.4 ? e.t / 0.4 : e.t > e.life ? Math.max(0, 1 - (e.t - e.life) / 0.4) : 1;
      if (o <= 0) continue;
      const ex = e.x * (W / ms) * 0.48, ey = e.y * (H / ms) * 0.48;
      if (Math.abs(ex) < 210 && Math.abs(ey) < 170) continue;
      c.globalCompositeOperation = 'lighter';
      glowDot(c, ex, ey, 22 * e.s, '#ff2020', 0.35 * o);
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(255,70,60,${o})`;
      ell(c, ex - 7 * e.s, ey, 3 * e.s, 2.2 * e.s * o); c.fill();
      ell(c, ex + 7 * e.s, ey, 3 * e.s, 2.2 * e.s * o); c.fill();
    }
    // the floor name, small, while the scene opens
    const lab = this.st < 3 && !this.cut ? clamp(this.st < 0.6 ? this.st / 0.6 : (3 - this.st) / 0.8, 0, 1) : 0;
    if (lab > 0) {
      c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
      c.globalAlpha = lab * 0.7; c.fillStyle = '#a69688'; c.font = `600 ${Math.round(11 * Math.max(0.9, ms))}px 'Barlow Condensed', sans-serif`;
      c.textAlign = 'center'; c.fillText(L.name.toUpperCase().split('').join(' '), ax, cy + 150 * ms);
      c.globalAlpha = 1; c.textAlign = 'start';
    }
  },
};

function renderDawn(c) {
  const W = View.W, H = View.H, t = G.t + performance.now() / 1000;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a2a1c'); g.addColorStop(0.45, '#1a120d'); g.addColorStop(1, '#0b0807');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';
  const sg = c.createRadialGradient(W / 2, -H * 0.1, 10, W / 2, -H * 0.1, H * 0.9);
  sg.addColorStop(0, 'rgba(255,220,160,0.35)'); sg.addColorStop(1, 'rgba(255,220,160,0)');
  c.fillStyle = sg; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(255,240,210,0.5)';
  for (let i = 0; i < 26; i++) {
    const ph = (t * 0.03 + i * 0.137) % 1;
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * W + Math.sin(t * 0.4 + i) * 12;
    circle(c, x, H * (1 - ph), 1 + (i % 3) * 0.6);
  }
}

/* ------------------------------------------------------------------ bestiary pictures */
function paintBestiary(root) {
  root = root || document;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  root.querySelectorAll('canvas[data-snake]').forEach((cv) => {
    const kinds = cv.dataset.snake.split(',');
    const w = cv.clientWidth || 160, h = cv.clientHeight || 92;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    bestiaryBg11(c, w, h, kinds);
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    const list = kinds.map((kind, k) => {
      const oy = k * 52, ox = k * 26;
      const sn = new Snake(kind, ox, oy, { emerge: false, ang: 0, preview: true });
      sn.state = 'active'; sn.eyeOpen = 1;
      const total = sn.len * sn.spacing;
      if (KINDS[kind].blocky) {
        const path = [[0, 0], [3, 0], [3, 1], [6, 1], [6, 0], [8, 0], [8, 1], [10, 1], [10, 0], [13, 0]];
        for (let j = 1; j < path.length; j++) {
          const [ax, ay] = path[j - 1], [bx, by] = path[j];
          for (let i = 1; i <= 10; i++) { const u = i / 10; sn.moveTo(ox + (ax + (bx - ax) * u) * 20, oy + (ay + (by - ay) * u) * 20); }
        }
      } else {
        for (let i = 0; i <= 60; i++) {
          const u = i / 60, x = ox + u * (total + 10), y = oy + Math.sin(u * 5.2 + k * 2) * sn.K.r0 * 0.9;
          sn.moveTo(x, y);
        }
      }
      sn.ang = sn.drawAng = Math.atan2(sn.y - sn.trail[2].y, sn.x - sn.trail[2].x);
      if (kind === 'hood') sn.hood = 0.75;
      sn.computeBody();
      const pad = kind === 'hood' ? 2.2 : 1.3;
      minX = Math.min(minX, sn.x - sn.headR * 1.4); maxX = Math.max(maxX, sn.x + sn.headR * 1.6); minY = Math.min(minY, sn.y - sn.headR * pad); maxY = Math.max(maxY, sn.y + sn.headR * pad);
      for (const p of sn.pts) { minX = Math.min(minX, p.x - p.r - sn.headR * 0.4); maxX = Math.max(maxX, p.x + p.r); minY = Math.min(minY, p.y - p.r - sn.headR * 0.3); maxY = Math.max(maxY, p.y + p.r + sn.headR * 0.3); }
      return sn;
    });
    const sc = Math.min((w - 16) / (maxX - minX), (h - 12) / (maxY - minY));
    c.translate(w / 2, h / 2); c.scale(sc, sc); c.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (const sn of list) {
      c.fillStyle = 'rgba(0,0,0,0.35)'; drawSnakeShadow(c, sn);
      drawSnake(c, sn, 1.3);
      drawSnakeGlow(c, sn, 1.3, { x: sn.x + 60, y: sn.y + 20 });
    }
  });
  root.querySelectorAll('canvas[data-char]').forEach((cv) => {
    const id = cv.dataset.char;
    paintChar(cv, id, id !== 'apple' && !Save.data.unlocks[id]);
  });
  root.querySelectorAll('canvas[data-item]').forEach((cv) => {
    const w = cv.clientWidth || 160, h = cv.clientHeight || 60;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#17110e'; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, h * 0.7);
    g.addColorStop(0, 'rgba(227,165,74,0.22)'); g.addColorStop(1, 'rgba(227,165,74,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.translate(w / 2, h / 2);
    drawItemIcon(c, cv.dataset.item, h * 0.72, 1);
  });
}

// A character portrait. Locked characters are a dark silhouette with a question mark.
function paintChar(cv, id, locked, opt = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || (opt.face ? 34 : 160), h = cv.clientHeight || (opt.face ? 34 : 92);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (!opt.face) {
    c.fillStyle = '#17110e'; c.fillRect(0, 0, cv.width, cv.height);
    const g = c.createRadialGradient(cv.width / 2, cv.height * 0.45, 2, cv.width / 2, cv.height * 0.45, cv.height * 0.7);
    g.addColorStop(0, locked ? 'rgba(120,110,100,0.12)' : 'rgba(255,220,170,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, cv.width / 2, cv.height * 0.84, cv.height * 0.2, cv.height * 0.045); c.fill();
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
}

function paintPanelArt(id, kind) {
  const cv = document.getElementById(id); if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = 96;
  cv.width = Math.round(s * dpr); cv.height = Math.round(s * dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, (s / 2) * dpr, (s / 2 + 4) * dpr);
  if (kind === 'core') {
    c.fillStyle = 'rgba(0,0,0,0.4)'; ell(c, 0, 34, 24, 6); c.fill();
    drawCore(c, 32, true);
  } else {
    const g = c.createRadialGradient(0, 0, 4, 0, 0, 48);
    g.addColorStop(0, 'rgba(255,236,190,0.45)'); g.addColorStop(1, 'rgba(255,236,190,0)');
    c.fillStyle = g; c.fillRect(-48, -52, 96, 96);
    const off = document.createElement('canvas'); off.width = Math.round(s * dpr); off.height = Math.round(s * dpr);
    const oc = off.getContext('2d');
    oc.setTransform(dpr * 2.1, 0, 0, dpr * 2.1, off.width / 2, off.height / 2);
    const P = G.player;
    drawApple(oc, 14, { char: P ? P.char : 'apple', t: G.t, lookX: 0, lookY: -0.6, blink: 1, fear: 0, hurt: 0, bites: P ? P.bites : [], leaf: 0.1, twin: P && P.twin, toffee: P && P.toffee, shellUp: P && P.shellUp, cyanide: P && P.cyanide });
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(off, 0, 0);
  }
}

