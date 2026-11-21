/* src/84-v14-galaxy-track.js: v14.3: De Galaxyworm fights to Rotten Waltz (Starlight Remix) (src/00-music-starwaltz.js).
   The song follows the boss: its stage picks the arrangement, a supernova charge gets a riser and closes the filter,
   the blast is the impact, the boss's death plays the last chord. Local audio only, read from game state, so it never
   changes what the simulation does. Same rules as the De Wals track: Music on, Boss music volume above 0. */
(function () {
  'use strict';
  const safe = (f) => { try { return f(); } catch (e) { errNote14(e, 'safe84'); console.error(e); } };
  const M = { inst: null, owned: false, nova: false, boss: null };
  const vol = () => { const O = window.__bitten && window.__bitten.OPTS7; return 0.62 * (O && O.bossVol != null ? O.bossVol : 0.75); };
  function release(fade, win) {
    const I = M.inst; M.inst = null; M.nova = false;
    if (I) { if (win) I.finale(); else I.stop(fade); }
    if (M.owned) { window.__jukebox = false; M.owned = false; }
    if (G.state === 'play' && G.levelDef && !DJ.on) setTimeout(() => { if (!M.inst && !DJ.on && G.state === 'play' && !Sfx.drone && G.levelDef && !window.__jukebox) safe(() => Sfx.startDrone(G.levelDef.set)); }, (win ? 7 : fade) * 1000 + 200);
  }
  function tick() {
    const b = G.boss, c = Sfx.ctx;
    const live = !!(b && b.kind === 'galaxy' && b.alive && b.hp > 0 && b.dying <= 0);
    const want = live && (G.state === 'play' || G.state === 'pause') && Sfx.on && c && Save.data.settings.music !== false && vol() > 0 && !(window.__jukebox && !M.owned);
    if (!want) {
      if (M.inst) release(G.state === 'play' ? 1.4 : 0.4, !!(M.boss && M.boss.kind === 'galaxy' && (M.boss.dying > 0 || !M.boss.alive) && G.state === 'play'));
      M.boss = null;
      return;
    }
    if (!M.inst) {
      M.inst = StarWaltz.create(c, Sfx.master, vol()); M.boss = b;
      if (!window.__jukebox) { window.__jukebox = true; M.owned = true; }
      Sfx.stopDrone && Sfx.stopDrone();
    }
    const I = M.inst;
    I.setStage(b.stage14 || 1);
    const charging = b.mode === 'nova';
    if (charging && !M.nova) I.riser(2.2 * Math.max(0.2, 1 - (b.charge14 || 0)));
    if (!charging && M.nova) I.impact();
    M.nova = charging;
    I.setDim(G.state === 'pause' ? 0.75 : charging ? 0.35 * (b.charge14 || 0) : 0);
    I.setVol(vol() * (G.state === 'pause' ? 0.4 : 1));
    I.tick();
  }
  Sched.every('audio', 'v14.3 galaxy track', () => safe(tick));
  Object.assign(window.__bitten || (window.__bitten = {}), { galaxyTrack: M });
})();
