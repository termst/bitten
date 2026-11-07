/* src/49-v104-death-remix.js: v10.4: the death remix (synthesized). From v10.4. Lines 22312 to 22409 of the v13.7 script. */
/* ===== v10.4: epic death remix (same chords as the Rotten Waltz) ===== */
(function () {
  'use strict';
  const D = { out: null, until: 0 };
  const BPM = 78, B = 60 / BPM, E8 = B / 2;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MEL = [[69, 72, 76], [77, 76, 72], [71, 72, 68], [69, 0, 0], [64, 69, 72], [74, 72, 71], [70, 69, 65], [64, 0, 0]];
  const ROOT = [33, 38, 40, 33, 33, 38, 34, 40];
  const CHORD = [[57, 60, 64], [57, 62, 65], [56, 59, 64], [57, 60, 64], [57, 60, 64], [57, 62, 65], [58, 62, 65], [56, 59, 64]];
  const LP = [0, 3, 6], LL = [3, 3, 2];                 /* the 3+3+2 melody shape, in eighths */

  function build(c, t0) {
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5;
    const out = c.createGain(); out.gain.value = 0.55; comp.connect(out); out.connect(Sfx.master);
    const dl = c.createDelay(1); dl.delayTime.value = B * 0.75;
    const fb = c.createGain(); fb.gain.value = 0.38;
    const dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(comp);
    const wet = c.createGain(); wet.gain.value = 0.45; wet.connect(dl);
    const bus = c.createGain(); bus.connect(comp); bus.connect(wet);
    D.out = out;

    const osc = (type, f, t, dur, vol, att, det, dest) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = f; if (det) o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att);
      g.gain.setValueAtTime(vol, t + Math.max(att, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || bus); o.start(t); o.stop(t + dur + 0.05);
    };
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate);
    { const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const hit = (t, big) => {                         /* timpani: pitch drop + noise thump */
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(big ? 130 : 105, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.35);
      g.gain.setValueAtTime(big ? 1 : 0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.9 : 0.55));
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 1);
      const n = c.createBufferSource(), ng = c.createGain(), nf = c.createBiquadFilter();
      n.buffer = nb; nf.type = 'lowpass'; nf.frequency.value = big ? 1800 : 900;
      ng.gain.setValueAtTime(big ? 0.5 : 0.25, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      n.connect(nf); nf.connect(ng); ng.connect(bus); n.start(t); n.stop(t + 0.3);
    };
    const pad = c.createBiquadFilter(); pad.type = 'lowpass'; pad.Q.value = 1.2; pad.connect(bus);
    pad.frequency.setValueAtTime(500, t0); pad.frequency.exponentialRampToValueAtTime(4200, t0 + 8 * 4 * B);

    for (let bar = 0; bar < 8; bar++) {
      const t = t0 + bar * 4 * B, climax = bar >= 4;
      CHORD[bar].forEach((m) => { [-9, 0, 9].forEach((d) => osc('sawtooth', mtof(m), t, 4 * B + 0.2, 0.07, 0.5, d, pad)); });
      osc('sine', mtof(ROOT[bar]), t, 4 * B, 0.5, 0.05); osc('sawtooth', mtof(ROOT[bar]), t, 4 * B, 0.12, 0.05, 0, pad);
      if (climax) osc('sawtooth', mtof(ROOT[bar] + 12), t, 4 * B, 0.08, 0.05, 6, pad);
      hit(t, bar === 0 || bar === 4);
      if (climax) { hit(t + B, false); hit(t + 2 * B, false); hit(t + 3 * B, false); }
      if (bar >= 2) for (let i = 0; i < 8; i++) {      /* rising arpeggio */
        const ch = CHORD[bar], m = ch[i % 3] + 12 + (i >= 6 ? 12 : 0);
        osc('triangle', mtof(m), t + i * E8, E8 * 1.6, climax ? 0.1 : 0.06, 0.01);
      }
      MEL[bar].forEach((m, i) => {
        if (!m) return;
        const len = (i === 0 && !MEL[bar][1] ? 8 : LL[i]) * E8, st = t + LP[i] * E8, f = mtof(m + (climax ? 12 : 0));
        osc(climax ? 'sawtooth' : 'triangle', f, st, len, climax ? 0.13 : 0.12, 0.02);
        if (climax) osc('square', f, st, len, 0.05, 0.02, 7);
      });
    }
    /* the last chord: Am, huge, long */
    const tf = t0 + 32 * B;
    [45, 57, 60, 64, 69, 72, 76].forEach((m) => { osc('sawtooth', mtof(m), tf, 6, 0.08, 0.15, -7, pad); osc('sawtooth', mtof(m), tf, 6, 0.08, 0.15, 7, pad); });
    osc('sine', mtof(33), tf, 6, 0.6, 0.05); hit(tf, true);
    const sw = c.createBufferSource(), sg = c.createGain(), sf = c.createBiquadFilter();
    sw.buffer = nb; sf.type = 'highpass'; sf.frequency.value = 5000;
    sg.gain.setValueAtTime(0.0001, tf); sg.gain.exponentialRampToValueAtTime(0.18, tf + 0.05); sg.gain.exponentialRampToValueAtTime(0.0001, tf + 2.2);
    sw.connect(sf); sf.connect(sg); sg.connect(bus); sw.start(tf); sw.loop = true; sw.stop(tf + 2.3);
    D.until = tf + 6.5;
  }

  const musicOn = () => Save.data.settings.music !== false;
  window.__deathSong = { dur: 32 * B + 6.5, play(c) { D.jb = true; build(c, c.currentTime + 0.1); }, stop() { D.jb = false; try { if (D.out) { D.out.gain.setTargetAtTime(0, Sfx.ctx.currentTime, 0.1); D.out = null; } } catch (e) { D.out = null; } } };
  const origOver = Game.gameOver;
  Game.gameOver = function () {
    const r = origOver.apply(this, arguments);
    try {
      const c = Sfx.ctx;
      if (c && Sfx.master && Sfx.on && c.state === 'running' && (musicOn() || Math.random() < 0.1)) {
        if (typeof DJ !== 'undefined') DJ.stop(0.3, true);
        build(c, c.currentTime + 0.6);
      }
    } catch (e) { D.out = null; }
    return r;
  };

  /* fade the song out when the player leaves the game over screen */
  function watch() {
    requestAnimationFrame(watch);
    try {
      if (D.out && !D.jb && G.state !== 'over') { D.out.gain.setTargetAtTime(0, Sfx.ctx.currentTime, 0.15); D.out = null; }
    } catch (e) { D.out = null; }
  }
  requestAnimationFrame(watch);
})();

