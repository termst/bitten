/* src/00-music-remix.js: Rotten Waltz (Bite Remix): the 140 BPM menu remix, synthesized. From v9 to v10. Lines 1 to 407 of the v13.7 script. */
'use strict';
/* =====================================================================
   BITTEN  ·  Rotten Waltz (Bite Remix)
   The menu music box waltz in A minor, rebuilt as a 140 BPM melodic beat.
   Everything is synthesized with Web Audio, nothing is loaded.

   BittenRemix.render(sampleRate, onProgress) -> Promise<AudioBuffer>  (rendered once, cached)
   BittenRemix.play(ctx, dest, options)       -> { stop(fade), ready }
       options.loop:   'drop' (default: intro and build once, then the first drop forever), 'full', or false
       options.volume: 0..1 (default 0.6)
       options.offset: seconds to start from (default 0)
   BittenRemix.SECTIONS, BittenRemix.LOOP, BittenRemix.DURATION, BittenRemix.BPM
   ===================================================================== */
const BittenRemix = (() => {
  'use strict';
  const BPM = 140, BAR = 240 / BPM, STEP = BAR / 16, LEAD = 0.05;
  const BARS = 60, TAIL = 4.6;
  const DURATION = LEAD + BARS * BAR + TAIL;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* the menu waltz from the game: three notes a bar, eight bars */
  const MEL = [[69, 72, 76], [77, 76, 72], [71, 72, 68], [69, 0, 0], [64, 69, 72], [74, 72, 71], [70, 69, 65], [64, 0, 0]];
  const ROOT = [33, 38, 40, 33, 33, 38, 34, 40];
  const CHORD = [[57, 60, 64], [57, 62, 65], [56, 59, 64], [57, 60, 64], [57, 60, 64], [57, 62, 65], [58, 62, 65], [56, 59, 64]];
  /* the 3/4 bar becomes a 3+3+2 bar in 4/4 */
  const POS = [0, 6, 12], LEN = [6, 6, 4];
  /* the lead fills the two empty bars with a pickup */
  const ORN = { 3: [[10, 76, 2], [12, 72, 2], [14, 71, 2]], 7: [[12, 68, 2], [14, 71, 2]] };

  const SECTIONS = [
    { id: 'intro', name: 'Intro', from: 0, bars: 8 },
    { id: 'build', name: 'Build', from: 8, bars: 8 },
    { id: 'drop', name: 'Drop', from: 16, bars: 16 },
    { id: 'break', name: 'Break', from: 32, bars: 8 },
    { id: 'drop2', name: 'Drop II', from: 40, bars: 16 },
    { id: 'outro', name: 'Outro', from: 56, bars: 4 },
  ].map((s) => Object.assign(s, { start: LEAD + s.from * BAR, end: LEAD + (s.from + s.bars) * BAR }));
  const LOOP = [LEAD + 16 * BAR, LEAD + 32 * BAR];
  const secAt = (b) => { for (let i = SECTIONS.length - 1; i >= 0; i--) if (b >= SECTIONS[i].from) return SECTIONS[i].id; return 'intro'; };

  function barNotes(mb) {
    const out = [];
    MEL[mb].forEach((m, i) => {
      if (!m) return;
      let len = LEN[i];
      if (i === 0 && !MEL[mb][1]) len = mb === 3 ? 10 : 12;
      out.push({ s: POS[i], m, len });
    });
    return out;
  }
  function rng(a) {
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ------------------------------------------------------------ the instruments and buses on one context.
     Returns bar(b) which schedules one bar; call it a little before that bar plays. */
  function setup(ctx, out, t0) {
    const R = rng(0xb177e), sr = ctx.sampleRate;
    const gain = (v, to) => { const g = ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; };
    const panTo = (p, to) => { const n = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (n.pan) n.pan.value = p; n.connect(to); return n; };
    const filter = (type, f, q, to) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; if (to) n.connect(to); return n; };
    const curve = (k) => { const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } return c; };
    const SOFT = curve(1.1), HOT = curve(2.4);

    const nbuf = ctx.createBuffer(1, sr * 2, sr);
    { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
    const ir = ctx.createBuffer(2, Math.floor(sr * 2.1), sr);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / d.length, 3.4); }
    const crackBuf = ctx.createBuffer(1, sr * 3, sr);
    { const d = crackBuf.getChannelData(0); for (let i = 0; i < d.length; i++) { d[i] += (R() * 2 - 1) * 0.006; if (R() < 0.0007) { const a = (R() * 2 - 1) * 0.8; for (let j = 0; j < 30 && i + j < d.length; j++) d[i + j] += a * Math.pow(0.78, j); } } }

    /* mix bus: glue compressor and a soft clipper */
    const clip = ctx.createWaveShaper(); clip.curve = SOFT; clip.connect(out);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 3.2; comp.attack.value = 0.006; comp.release.value = 0.16; comp.connect(clip);
    const mix = gain(0.8, comp);
    /* cellar reverb and a dotted eighth echo, panned a little to the left so it bounces */
    const verbIn = gain(1), verb = ctx.createConvolver(); verb.normalize = true; verb.buffer = ir;
    verbIn.connect(verb); verb.connect(gain(0.45, mix));
    const dlyIn = gain(1), dly = ctx.createDelay(2), dlp = filter('lowpass', 2600, 0.7);
    dly.delayTime.value = STEP * 3;
    dlyIn.connect(dly); dly.connect(dlp); dlp.connect(gain(0.34, dly));
    const dRet = panTo(-0.35, mix); dlp.connect(gain(0.42, dRet)); dlp.connect(gain(0.15, verbIn));
    const sendBus = (to, v, d) => { const g = gain(1, to); if (v) g.connect(gain(v, verbIn)); if (d) g.connect(gain(d, dlyIn)); return g; };
    /* melodic synths share the sweep filter and the sidechain duck */
    const duck = gain(1, mix);
    const sweep = filter('lowpass', 900, 0.9, duck);
    const leadBus = sendBus(sweep, 0.18, 0.24);
    const arpBus = sendBus(sweep, 0.1, 0.35), arpL = panTo(-0.55, arpBus), arpR = panTo(0.55, arpBus);
    const padIn = filter('lowpass', 1400, 0.5, sendBus(sweep, 0.3, 0));
    const padPan = [panTo(-0.5, padIn), padIn, panTo(0.5, padIn)];
    const choirOut = sendBus(sweep, 0.6, 0), choirIn = gain(1);
    for (const [ff, q, k] of [[700, 5, 1.2], [1150, 6, 0.7], [2600, 8, 0.2]]) choirIn.connect(filter('bandpass', ff, q, gain(k, choirOut)));
    const choirPan = [panTo(-0.6, choirIn), choirIn, panTo(0.6, choirIn)];
    const mbBus = sendBus(mix, 0.5, 0.12);
    const bassBus = gain(1, mix);
    const drums = gain(1, mix), drumVerb = sendBus(drums, 0.35, 0);
    const hatClosed = filter('highpass', 8200, 0.7, drums), hatOpen = filter('highpass', 7000, 0.7, drums);

    function noise(t, dur, dest, o) {
      const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true;
      const g = ctx.createGain(); const a = o.a || 0.002;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.f) {
        const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f, t);
        if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur);
        f.Q.value = o.q == null ? 0.8 : o.q; s.connect(f); f.connect(g);
      } else s.connect(g);
      g.connect(dest);
      s.start(t, R() * 1.5); s.stop(t + dur + 0.02);
    }
    function tone(t, dur, dest, o) {
      const s = ctx.createOscillator(); s.type = o.type || 'sine';
      s.frequency.setValueAtTime(o.f, t);
      if (o.fTo) s.frequency.exponentialRampToValueAtTime(o.fTo, t + (o.glide || dur));
      const g = ctx.createGain(); const a = o.a || 0.003;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.lp) { const f = filter('lowpass', o.lp, 0.7, g); s.connect(f); } else s.connect(g);
      g.connect(dest);
      s.start(t); s.stop(t + dur + 0.02);
    }

    /* ---- drums ---- */
    const kick = (t, v = 1) => {
      tone(t, 0.4, drums, { f: 165, fTo: 46, glide: 0.11, vol: 0.85 * v });
      noise(t, 0.016, drums, { type: 'highpass', f: 3000, vol: 0.22 * v });
      duck.gain.setValueAtTime(0.32, t); duck.gain.linearRampToValueAtTime(1, t + 0.22);
    };
    const clap = (t, v = 1) => {
      for (let i = 0; i < 3; i++) noise(t + i * 0.011, 0.028, drums, { f: 1500, q: 1.2, vol: 0.38 * v });
      noise(t + 0.022, 0.24, drumVerb, { f: 1250, q: 0.9, vol: 0.3 * v });
    };
    const snare = (t, v = 1) => {
      tone(t, 0.12, drums, { type: 'triangle', f: 215, fTo: 150, vol: 0.24 * v });
      noise(t, 0.15, drums, { type: 'highpass', f: 1800, vol: 0.22 * v });
    };
    const hat = (t, v = 1, open = false) => noise(t, open ? 0.3 : 0.045, open ? hatOpen : hatClosed, { vol: 0.17 * v });
    const crash = (t, v = 1) => {
      noise(t, 2.4, drumVerb, { type: 'highpass', f: 3600, vol: 0.14 * v });
      noise(t, 1.4, drums, { f: 6200, q: 0.5, vol: 0.05 * v });
    };
    const boom = (t) => tone(t, 1.5, drums, { f: 72, fTo: 28, vol: 0.5 });
    const riser = (t, dur) => {
      noise(t, dur, mix, { f: 280, fTo: 7200, q: 2.2, vol: 0.12, a: dur * 0.94 });
      tone(t, dur, mix, { type: 'sawtooth', f: 110, fTo: 880, vol: 0.02, a: dur * 0.9, lp: 1800 });
    };
    /* the apple bite from the game, used as a percussion hit */
    const bite = (t, v = 1) => {
      noise(t, 0.16, drums, { type: 'lowpass', f: 2600, fTo: 700, q: 0.6, vol: 0.32 * v });
      noise(t + 0.05, 0.09, drums, { type: 'highpass', f: 2500, vol: 0.13 * v });
      tone(t, 0.2, drums, { type: 'sawtooth', f: 110, fTo: 45, vol: 0.2 * v, lp: 420 });
    };
    const hiss = (t, v = 1) => noise(t, 0.6, drumVerb, { f: 5200, q: 1.3, vol: 0.06 * v, a: 0.08 });
    const crackle = (t, dur, v) => {
      const s = ctx.createBufferSource(); s.buffer = crackBuf; s.loop = true;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.6);
      g.gain.setValueAtTime(v, t + dur - 1); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(filter('highpass', 900, 0.7, g)); g.connect(mix); s.start(t); s.stop(t + dur + 0.02);
    };

    /* ---- melodic voices ---- */
    const musicBox = (t, m, v) => {
      const f = mtof(m) * (1 + (R() - 0.5) * 0.008);
      tone(t, 1.6, mbBus, { f, vol: v, a: 0.004 });
      tone(t, 0.6, mbBus, { f: f * 2.01, vol: v * 0.35, a: 0.003 });
      tone(t, 0.18, mbBus, { f: f * 3.99, vol: v * 0.1, a: 0.002 });
    };
    const lead = (t, m, dur, v) => {
      const f = mtof(m), hold = Math.max(0.03, dur * 0.85), end = t + hold + 0.17;
      const merge = ctx.createChannelMerger(2);
      const flt = filter('lowpass', 5400, 3);
      flt.frequency.setValueAtTime(5400, t); flt.frequency.exponentialRampToValueAtTime(1300, t + Math.min(dur, 0.4));
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.006);
      amp.gain.exponentialRampToValueAtTime(v * 0.7, t + hold); amp.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.16);
      merge.connect(flt); flt.connect(amp); amp.connect(leadBus);
      const oscs = [];
      const osc = (type, fr, det) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = fr; o.detune.value = det; oscs.push(o); return o; };
      const a = osc('sawtooth', f, -9), b = osc('sawtooth', f, 9), c = osc('square', f / 2, 0);
      a.connect(merge, 0, 0); b.connect(merge, 0, 1);
      const sub = gain(0.45); c.connect(sub); sub.connect(merge, 0, 0); sub.connect(merge, 0, 1);
      if (dur > 0.3) {
        const lfo = ctx.createOscillator(); lfo.frequency.value = 5.4; const lg = gain(f * 0.006); lfo.connect(lg);
        a.frequency && lg.connect(a.frequency); lg.connect(b.frequency);
        lfo.start(t + 0.2); lfo.stop(end);
      }
      for (const o of oscs) { o.start(t); o.stop(end); }
    };
    let arpSide = 1;
    const arp = (t, m, v) => {
      arpSide = -arpSide;
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = mtof(m);
      const flt = filter('lowpass', 3400, 2); flt.frequency.setValueAtTime(3400, t); flt.frequency.exponentialRampToValueAtTime(800, t + 0.13);
      const amp = ctx.createGain(); amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.003); amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(flt); flt.connect(amp); amp.connect(arpSide < 0 ? arpL : arpR);
      o.start(t); o.stop(t + 0.18);
    };
    const pad = (t, chord, dur, v) => {
      chord.forEach((m, i) => {
        const f = mtof(m), amp = ctx.createGain();
        amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.35);
        amp.gain.setValueAtTime(v, t + dur - 0.05); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
        for (const det of [-7, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(amp); o.start(t); o.stop(t + dur + 0.52); }
        amp.connect(padPan[i]);
      });
    };
    const choir = (t, chord, dur, v) => {
      chord.forEach((m, i) => {
        const f = mtof(m + 12), amp = ctx.createGain();
        amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.6);
        amp.gain.setValueAtTime(v, t + dur - 0.1); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);
        const lfo = ctx.createOscillator(); lfo.frequency.value = 4.6 + i * 0.3; const lg = gain(f * 0.009); lfo.connect(lg);
        for (const det of [-6, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; lg.connect(o.frequency); o.connect(amp); o.start(t); o.stop(t + dur + 0.82); }
        lfo.start(t); lfo.stop(t + dur + 0.82);
        amp.connect(choirPan[i]);
      });
    };
    const bass = (t, m, dur, v, slideTo) => {
      const f = mtof(m), o = ctx.createOscillator(), o2 = ctx.createOscillator();
      o.type = 'sine'; o2.type = 'triangle';
      o.frequency.setValueAtTime(f * 2, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
      o2.frequency.setValueAtTime(f * 4, t); o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.03);
      if (slideTo != null) {
        const g2 = mtof(slideTo);
        o.frequency.setValueAtTime(f, t + dur * 0.35); o.frequency.exponentialRampToValueAtTime(g2, t + dur * 0.95);
        o2.frequency.setValueAtTime(f * 2, t + dur * 0.35); o2.frequency.exponentialRampToValueAtTime(g2 * 2, t + dur * 0.95);
      }
      const drive = ctx.createWaveShaper(); drive.curve = HOT;
      const pre = gain(0.9), up = gain(0.22);
      o.connect(pre); o2.connect(up); up.connect(pre); pre.connect(drive);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.004);
      amp.gain.exponentialRampToValueAtTime(v * 0.55, t + dur); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.07);
      drive.connect(amp); amp.connect(bassBus);
      o.start(t); o2.start(t); o.stop(t + dur + 0.09); o2.stop(t + dur + 0.09);
    };

    /* filter sweeps for the whole track */
    const T = (b, s = 0) => t0 + LEAD + b * BAR + s * STEP;
    const fq = sweep.frequency;
    fq.setValueAtTime(900, t0); fq.setValueAtTime(900, T(4)); fq.exponentialRampToValueAtTime(1400, T(8));
    fq.exponentialRampToValueAtTime(9000, T(15, 12)); fq.setValueAtTime(16000, T(16));
    fq.setValueAtTime(16000, T(32) - 0.01); fq.exponentialRampToValueAtTime(1500, T(32) + 0.4);
    fq.setValueAtTime(1500, T(36)); fq.exponentialRampToValueAtTime(9000, T(39, 12)); fq.setValueAtTime(16000, T(40));
    fq.setValueAtTime(16000, T(56)); fq.exponentialRampToValueAtTime(700, T(60));
    duck.gain.setValueAtTime(1, t0);

    /* ---- the arrangement, one bar at a time ---- */
    const roll = (b, from, to, per, v0, v1, fn = snare) => {
      const n = (to - from) * per;
      for (let i = 0; i < n; i++) fn(T(b, from + i / per), v0 + (v1 - v0) * (i / Math.max(1, n - 1)));
    };
    function bar(b) {
      if (b === BARS) {
        /* the last chord, then one more bite */
        musicBox(T(60), 69, 0.13); musicBox(T(60), 64, 0.08); musicBox(T(60), 57, 0.1); musicBox(T(60, 0.5), 76, 0.06);
        bass(T(60), 33, 2.2, 0.26);
        bite(T(60, 10), 1.2);
        return;
      }
      const sec = secAt(b), mb = b % 8, ch = CHORD[mb], root = ROOT[mb], next = ROOT[(mb + 1) % 8];
      const notes = barNotes(mb);
      const drop = sec === 'drop' || sec === 'drop2';
      const pass2 = (sec === 'drop' && b >= 24) || (sec === 'drop2' && b >= 48);
      const gapBar = b === 15 || b === 39;

      if (b === 0) crackle(T(0), 8 * BAR, 0.05);
      if (b === 56) crackle(T(56), 4 * BAR + TAIL - 0.2, 0.05);

      /* music box: the original tune, as is in the quiet parts, an octave up over the drops */
      if (!drop) for (const n of notes) musicBox(T(b, n.s), n.m, sec === 'intro' || sec === 'outro' ? 0.13 : 0.08);
      else for (const n of notes) musicBox(T(b, n.s), n.m + 12, 0.05);

      /* pads and choir */
      if (sec === 'intro' && b >= 4) pad(T(b), ch, BAR, 0.022);
      if (sec === 'build' || drop) pad(T(b), ch, gapBar ? BAR * 0.75 : BAR, 0.03);
      if (sec === 'break') { pad(T(b), ch, BAR, 0.024); choir(T(b), ch, gapBar ? BAR * 0.75 : BAR, 0.05); }
      if (sec === 'drop2' && pass2) choir(T(b), ch, BAR, 0.025);
      if (sec === 'outro') pad(T(b), ch, BAR, 0.026 - (b - 56) * 0.004);

      /* lead melody with the pickups */
      if (sec === 'build' || drop) {
        const v = sec === 'build' ? 0.12 : 0.15;
        for (const n of notes) {
          lead(T(b, n.s), n.m, n.len * STEP, n.s === 0 ? v : v * 0.85);
          if (sec === 'drop2' && pass2) lead(T(b, n.s), n.m + 12, n.len * STEP, v * 0.4);
        }
        if (ORN[mb] && !gapBar) for (const [s, m, l] of ORN[mb]) lead(T(b, s), m, l * STEP, v * 0.7);
      }

      /* arpeggio in the second half of each drop */
      if (pass2) {
        const seq = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1]];
        for (let s = 0; s < 16; s++) arp(T(b, s), seq[s % 6] + 12, s % 4 === 0 ? 0.05 : 0.035);
      }

      /* 808 */
      if (drop) {
        bass(T(b, 0), root, 6 * STEP, 0.32);
        bass(T(b, 7), root, 2 * STEP, 0.27);
        bass(T(b, 10), root + (mb % 2 ? 12 : 0), 3 * STEP, 0.28);
        if (b !== 31 && b !== 55) bass(T(b, 14), root, 2 * STEP, 0.26, next);
      } else if (sec === 'build' && b >= 12 && b < 15) bass(T(b), root, 8 * STEP, 0.3);
      else if (sec === 'break' && !gapBar) bass(T(b), root, BAR * 0.95, 0.13);

      /* drums */
      if (b === 14 || b === 38) riser(T(b), BAR + 12 * STEP);
      if (sec === 'build') {
        if (b < 12) { for (const s of [0, 4, 8, 12]) hat(T(b, s), 0.6); kick(T(b), 0.8); }
        else if (b < 15) { for (let s = 0; s < 16; s += 2) hat(T(b, s), s % 4 ? 0.45 : 0.7); kick(T(b)); kick(T(b, 10), 0.85); clap(T(b, 8)); }
      }
      if (sec === 'break' && b >= 36 && b < 39) { for (let s = 0; s < 16; s += 2) hat(T(b, s), 0.45); if (b === 38) kick(T(b), 0.8); }
      if (gapBar) {
        kick(T(b), 0.9);
        roll(b, 0, 8, 1, 0.25, 0.55); roll(b, 8, 12, 2, 0.6, 1);
        bite(T(b, 13), 1.1);
      }
      if (drop) {
        const ks = mb === 7 ? [0, 3, 10, 13] : mb % 2 ? [0, 3, 10] : [0, 10];
        for (const s of ks) kick(T(b, s), s === 0 ? 1 : 0.85);
        clap(T(b, 8)); snare(T(b, 8), 0.6);
        const fill = b === 31 || b === 55;
        if (fill) roll(b, 12, 16, 2, 0.4, 1);
        else if (mb === 3 || mb === 7) { snare(T(b, 14), 0.3); snare(T(b, 15), 0.45); }
        for (let s = 0; s < 16; s++) {
          if (s >= 12 && (mb === 1 || mb === 5 || mb === 3)) continue;
          if (s % 2 === 0) hat(T(b, s), s % 4 === 0 ? 0.7 : 0.5, s === 14 && mb % 2 === 0);
          else if (pass2) hat(T(b, s), 0.28);
        }
        if (mb === 1 || mb === 5) for (let i = 0; i < 8; i++) hat(T(b, 12 + i / 2), 0.35 + i * 0.06);
        if (mb === 3) for (let i = 0; i < 6; i++) hat(T(b, 12 + i * (4 / 6)), 0.4 + i * 0.07);
        if (mb === 7) bite(T(b, 6), 0.55);
        if (mb === 4) hiss(T(b, 4), 0.9);
      }

      /* section hits */
      if (b === 16 || b === 40) { crash(T(b)); boom(T(b)); }
      if (b === 24 || b === 48) crash(T(b), 0.6);
      if (b === 32) crash(T(b), 0.7);
      if (b === 56) { crash(T(b), 0.8); boom(T(b)); }
    }
    return { bar, T };
  }

  /* schedules everything at once, for a live context (heavier, but no waiting) */
  function schedule(ctx, out, t0) { const S = setup(ctx, out, t0); for (let b = 0; b <= BARS; b++) S.bar(b); }

  /* ------------------------------------------------------------ offline render, one bar at a time, cached */
  const cache = {};
  function render(sampleRate = 44100, onProgress) {
    if (cache[sampleRate]) return cache[sampleRate];
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OAC(2, Math.ceil(DURATION * sampleRate), sampleRate);
    const S = setup(oc, oc.destination, 0);
    const p = new Promise((res, rej) => {
      oc.oncomplete = (e) => res(e.renderedBuffer);
      if (typeof oc.suspend === 'function') {
        /* only the bars that are about to play live in the graph, so rendering stays fast */
        S.bar(0); S.bar(1);
        for (let b = 2; b <= BARS; b++) {
          const at = Math.max(0, S.T(b) - BAR * 0.6);
          oc.suspend(at).then(() => { S.bar(b); if (onProgress) onProgress(b / BARS); oc.resume(); });
        }
      } else schedule(oc, oc.destination, 0);
      const r = oc.startRendering();
      if (r && r.then) r.then(res, rej);
    }).then((buf) => {
      let peak = 0;
      for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; } }
      if (peak > 0) { const k = 0.93 / peak; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= k; } }
      if (onProgress) onProgress(1);
      return buf;
    });
    cache[sampleRate] = p;
    return p;
  }

  /* ------------------------------------------------------------ play it in the game, or anywhere */
  function play(ctx, dest, opt = {}) {
    const loop = opt.loop === undefined ? 'drop' : opt.loop;
    const vol = opt.volume == null ? 0.6 : opt.volume;
    const out = ctx.createGain(); out.gain.value = 0.0001; out.connect(dest || ctx.destination);
    let src = null, stopped = false;
    const ready = render(ctx.sampleRate, opt.onProgress).then((buf) => {
      if (stopped) return;
      src = ctx.createBufferSource(); src.buffer = buf;
      if (loop === 'drop') { src.loop = true; src.loopStart = LOOP[0]; src.loopEnd = LOOP[1]; }
      else if (loop === 'full') { src.loop = true; src.loopStart = 0; src.loopEnd = buf.duration; }
      src.connect(out);
      const t = ctx.currentTime + 0.02;
      out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(vol, t + 0.6);
      src.start(t, opt.offset || 0);
    });
    return {
      ready,
      stop(fade = 0.6) {
        stopped = true;
        const t = ctx.currentTime;
        try { out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t); out.gain.exponentialRampToValueAtTime(0.0001, t + fade); } catch (e) { /* ignore */ }
        if (src) try { src.stop(t + fade + 0.05); } catch (e) { /* ignore */ }
      },
    };
  }

  return { BPM, BAR, DURATION, SECTIONS, LOOP, render, play, schedule };
})();

