/* src/42-v10-powerup-rules.js: v10: the small rules that go with the new powerups. From v10. Lines 21048 to 21151 of the v13.7 script. */
/* =====================================================================
   The small rules that go with the new powerups
   ===================================================================== */
function clashHard10(id, P) { const cl = clashOf10(id, P); return !!(cl && cl.hard); }
// Uitverkoop: everything you buy comes with a downgrade
function afterTake10(p) {
  const P = G.player;
  if (p && p.cost && P && P.flags && P.flags.sale && P.downs.length < DOWN_CAP) setTimeout(() => { if (G.player === P && G.state === 'play') giveDown(); }, 900);
}
// the gas mask: fire on the floor does nothing
{
  const uf0 = updateFires;
  updateFires = function (dt, room) {
    const P = G.player;
    if (!P || !P.gasmask || !room.fires || !room.fires.length) return uf0(dt, room);
    const hot = room.fires.filter((f) => f.hostile);
    for (const f of hot) f.hostile = false;
    try { uf0(dt, room); } finally { for (const f of hot) f.hostile = true; }
  };
  const vh0 = venomHit9;
  venomHit9 = function (v, P) {
    const r = vh0(v, P);
    if (r) return r;
    if (P.inv > 0 || P.dashT > 0 || P.dying > 0 || P.escaping > 0) return 0;
    if (P.gasmask && v.kind === 'smoke') return 1;
    if (P.paraplu && Math.random() < 1 / 3 && Math.abs(angDiff(Math.atan2(P.aimY, P.aimX), Math.atan2(v.y - P.y, v.x - P.x))) < 1.0) {
      floatText(P.x, P.y - 24, 'PARAPLU', '#9fd8ff');
      burst(v.x, v.y, 5, '#9fd8ff', { min: 30, max: 90, lmin: 0.2, lmax: 0.4, glow: true });
      return 1;
    }
    return 0;
  };
}
// the gift from the last run: never something this apple cannot hold
{
  const sr0 = Game.startRun;
  Game.startRun = function (story, mode) {
    sr0.call(this, story, mode);
    const P = G.player, st = G.map && G.map.start;
    if (!P || !st) return;
    for (const p of st.pickups) if (p.kind === 'item' && p.gift && clashHard10(p.id, P)) { G.run.pending.delete(p.id); p.id = nextItemId(0.3); if (p.id !== 'golden') G.run.pending.add(p.id); }
  };
}
// saves remember which floors you saw and which Rot Eaters you killed
{
  const d0 = Save.defaults;
  Save.defaults = function () { const d = d0.call(this); d.floorsSeen = {}; d.rotKinds = {}; return d; };
  const a0 = Save.applyData;
  Save.applyData = function (d, settings) {
    a0.call(this, d, settings);
    const D = this.data;
    for (const k of ['floorsSeen', 'rotKinds']) {
      if (!D[k] || typeof D[k] !== 'object') D[k] = {};
      const m = d[k];
      if (m && typeof m === 'object') for (const id in m) if (m[id]) D[k][id] = D[k][id] || m[id];
    }
  };
  const mv0 = Meta.value;
  Meta.value = function (k) {
    const d = Save.data;
    if (k === 'floorsSeen') return Object.keys(d.floorsSeen || {}).length;
    if (k === 'rotKinds') return Object.keys(d.rotKinds || {}).length;
    if (k === 'storiesDone') return ((d.stats.storyWins || 0) > 0 ? 1 : 0) + ((d.stats.story2Wins || 0) > 0 ? 1 : 0);
    if (k === 'foundAll') return Object.keys(d.found).filter((id) => ITEMS[id]).length >= ITEM_IDS.length ? 1 : 0;
    return mv0.call(this, k);
  };
}
// the info card and the pickup itself show a clash
{
  const if0 = infoFor;
  infoFor = function (p) {
    const o = if0(p);
    const P = G.player;
    if (o && p.kind === 'item' && P) {
      const cl = clashOf10(p.id, P);
      if (cl) o.notes = (o.notes || []).concat([[cl.hard ? cl.why : `Clashes with ${clashNames10(cl.ids)}. Stand on it to swap.`, '#ff9a7a']]);
    }
    return o;
  };
  const dip0 = drawItemPickup;
  drawItemPickup = function (c, p, t) {
    dip0(c, p, t);
    if (p.swapT > 0) {
      c.strokeStyle = '#ffd27a'; c.lineWidth = 2.4;
      c.beginPath(); c.arc(p.x, p.y - 10, 20, -Math.PI / 2, -Math.PI / 2 + (p.swapT / SWAP_HOLD10) * TAU); c.stroke();
      txt10(c, 'SWAP', p.x, p.y - 36, 8, '#ffd27a');
    } else if (p.clashSeen && G.t - p.clashSeen < 0.25) {
      c.strokeStyle = 'rgba(255,120,100,0.7)'; c.lineWidth = 1.6; c.setLineDash([4, 4]);
      c.beginPath(); c.arc(p.x, p.y - 10, 20, 0, TAU); c.stroke(); c.setLineDash([]);
    }
  };
  const bic0 = UI.buildItemCards;
  UI.buildItemCards = function () {
    bic0.call(this);
    const box = this.el.itemCards; if (!box) return;
    for (const f of box.children) {
      const line = clashLine10(f.dataset.id);
      if (!line) continue;
      const s = document.createElement('span'); s.className = 'cl10'; s.textContent = line;
      const cap = f.querySelector('figcaption'); if (cap) cap.appendChild(s);
    }
  };
}

