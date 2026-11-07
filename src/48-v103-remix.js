/* src/48-v103-remix.js: v10.3: Rotten Waltz remix as a living arrangement. From v10.3. Lines 22224 to 22311 of the v13.7 script. */
/* ===== v10.3: Rotten Waltz remix, played as a living arrangement ===== */
(function () {
  'use strict';
  /* the old music box returns when Music is off but Sound is on */
  const oldTick = Sfx.musicTick; Sfx.oldWaltz = oldTick;
  Sfx.musicTick = function () { if (Save.data.settings.music === false || !S.buf) return oldTick.apply(this, arguments); };

  const BAR = BittenRemix.BAR, LEAD = BittenRemix.SECTIONS[0].start;
  const SEC = {}; for (const s of BittenRemix.SECTIONS) SEC[s.id] = { from: s.from, to: s.from + s.bars };
  const CH = 2;                                         /* bars per chunk: the mix can change every ~3.4s */
  const S = { buf: null, loading: false, bus: null, lp: null, nextT: 0, cur: null, bar: 0, fightN: 0, calmN: 0, was: false };

  const musicOn = () => Save.data.settings.music !== false;

  /* what the song should be doing right now */
  function mood() {
    if (window.__jukebox || (typeof DJ !== 'undefined' && DJ.on)) return null;   /* jukebox or boss track owns the sound */
    const s = G.state;
    if (s === 'over') return null;                                           /* the death song plays here */
    if (s === 'menu') {
      if (Save.data.settings.party === false) return { sec: (!S.cur || S.cur.sec === 'intro') && S.menuN < 4 ? 'intro' : 'build', g: 0.5, f: 9000 };
      /* the party menu walks the whole song: intro once, then build, drop, break, drop II, around again */
      const PLAN = [['build', 4], ['drop', 8], ['break', 4], ['drop2', 8]], tot = 24;
      if (S.menuN < 4) return { sec: 'intro', g: 0.5, f: 7000 };
      let n = (S.menuN - 4) % tot, sec = 'build';
      for (const [k, len] of PLAN) { if (n < len) { sec = k; break; } n -= len; }
      return { sec, g: sec === 'drop' || sec === 'drop2' ? 0.56 : 0.5, f: sec === 'break' ? 3200 : sec === 'build' ? 9000 : 16000 };
    }
    if (s === 'win') return { sec: 'drop2', g: 0.5, f: 9000 };
    if (s === 'pause') return { sec: S.cur ? S.cur.sec : 'build', g: 0.16, f: 1400 };
    if (s === 'play' && G.player) {
      const P = G.player, hp = Math.max(0, Math.min(1, P.hp / (P.maxHp || 6)));
      const fight = !!(G.room && G.room.snakes && G.room.snakes.length);
      if (hp <= 0.34) return { sec: 'break', g: 0.4, f: 2200 };               /* near death: the break */
      if (fight) { const late = Math.floor(S.fightN / 8) % 2; return { sec: G.boss ? 'drop2' : late ? 'drop2' : 'drop', g: 0.42, f: 7000 + 2000 * hp, fight: 1 }; }
      return { sec: S.calmN % 8 < 4 ? 'build' : 'intro', g: 0.28, f: 2600 + 4500 * hp, calm: 1 };
    }
    return { sec: 'build', g: 0.3, f: 3000 };
  }
  S.menuN = 0;

  function ensure(c) {
    if (S.bus) return;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; lp.Q.value = 0.7;
    const bus = c.createGain(); bus.gain.value = 0.0001;
    lp.connect(bus); bus.connect(Sfx.master); S.lp = lp; S.bus = bus;
  }

  /* schedule one 2-bar chunk of section `sec` at ctx time `when` */
  function chunk(c, sec, when) {
    const sc = SEC[sec]; let bar;
    if (S.cur && S.cur.sec === sec) { bar = S.cur.bar + CH; if (bar >= sc.to) bar = sc.from; } else bar = sc.from;
    const dur = CH * BAR, src = c.createBufferSource(), env = c.createGain();
    src.buffer = S.buf; src.connect(env); env.connect(S.lp);
    env.gain.setValueAtTime(0.0001, when); env.gain.linearRampToValueAtTime(1, when + 0.02);
    env.gain.setValueAtTime(1, when + dur - 0.06); env.gain.linearRampToValueAtTime(0.0001, when + dur);
    src.start(when, LEAD + bar * BAR, dur + 0.05);
    S.cur = { sec, bar };
    S.hist = (S.hist || []).concat([{ sec, bar, when, dur }]).slice(-3);
    S.menuN = G.state === 'menu' ? S.menuN + 1 : 0;
  }

  let ok = true;
  function tick() {
    requestAnimationFrame(tick);
    if (!ok) return;
    try {
      const c = Sfx.ctx;
      if (!c || !Sfx.master || c.state !== 'running') return;
      if (!S.buf) { if (!S.loading && Sfx.on && musicOn()) { S.loading = true; BittenRemix.render(c.sampleRate).then((b) => { S.buf = b; }).catch(() => { S.loading = false; }); } return; }
      ensure(c);
      const now = c.currentTime, m = (Sfx.on && musicOn()) ? mood() : null;
      S.bus.gain.setTargetAtTime(m ? m.g : 0, now, 0.35);
      if (m) S.lp.frequency.setTargetAtTime(m.f, now, 0.5);
      if (!m) { S.was = false; S.cur = null; return; }            /* silent: restart cleanly when it returns */
      if (!S.was) { S.was = true; S.nextT = now + 0.1; S.menuN = 0; }
      if (S.nextT - now < 0.6) {
        if (m.fight) S.fightN++; else if (!m.fight && G.state === 'play') S.fightN = 0;
        if (m.calm) S.calmN++;
        chunk(c, m.sec, S.nextT);
        S.nextT += CH * BAR;
      }
    } catch (e) { ok = false; }
  }
  requestAnimationFrame(tick);
  Object.assign(window.__bitten || (window.__bitten = {}), { regularBus: () => S.bus, remixState: () => S, remixSec: SEC });
})();

