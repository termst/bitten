/* src/00-music-starwaltz.js: Rotten Waltz (Starlight Remix), the live boss track of De Galaxyworm. v14.3.
   The menu waltz melody, scheduled bar by bar on Web Audio, so the arrangement follows the fight:
     stage 1 Nevel          112 BPM, a real 3/4 waltz: glass bells, nebula pads, star dust, a soft heartbeat kick
     stage 2 Zwart Gat      138 BPM, 4/4 with the 3+3+2 melody: four on the floor, sub bass, choir, sidechain
     stage 3 Supernova      146 BPM: reese bass, supersaw lead in octaves, 16th hats, snare rolls into each phrase
     stage 4 Singulariteit  156 BPM: everything, wobbling bass, double kicks, lead an octave up
   Audio only: it never touches Math.random or game state, so online peers stay in lockstep whatever they hear.
   StarWaltz.create(ctx, dest, vol) -> { tick(), setStage(n), riser(sec), impact(), setDim(0..1), finale(), stop(fade), stage, bar }
   ===================================================================== */
const StarWaltz = (() => {
  'use strict';
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MEL = [[69, 72, 76], [77, 76, 72], [71, 72, 68], [69, 0, 0], [64, 69, 72], [74, 72, 71], [70, 69, 65], [64, 0, 0]];
  const ROOT = [33, 38, 40, 33, 33, 38, 34, 40];
  const CHORD = [[57, 60, 64], [57, 62, 65], [56, 59, 64], [57, 60, 64], [57, 60, 64], [57, 62, 65], [58, 62, 65], [56, 59, 64]];
  const ORN = { 3: [[10, 76], [12, 72], [14, 71]], 7: [[12, 68], [14, 71]] };
  const STAGES = [null,
    { bpm: 112, meter: 3, name: 'Nevel' },
    { bpm: 138, meter: 4, name: 'Zwart Gat' },
    { bpm: 146, meter: 4, name: 'Supernova' },
    { bpm: 156, meter: 4, name: 'Singulariteit' }];
  function rng(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function create(ctx, dest, vol) {
    const R = rng(0x57a12), sr = ctx.sampleRate;
    const gain = (v, to) => { const g = ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; };
    const filt = (type, f, q, to) => { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; if (to) n.connect(to); return n; };
    const pan = (p, to) => { const n = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); if (n.pan) n.pan.value = p; n.connect(to); return n; };
    const curve = (k) => { const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } return c; };

    const nbuf = ctx.createBuffer(1, sr * 2, sr);
    { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
    // a long, bright space hall
    const ir = ctx.createBuffer(2, Math.floor(sr * 4.2), sr);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / d.length, 2.6) * (i < sr * 0.02 ? i / (sr * 0.02) : 1); }

    // master: gain, dim filter (pause, nova charge), glue, soft clip
    const out = gain(0.0001, dest);
    const clip = ctx.createWaveShaper(); clip.curve = curve(1.2); clip.connect(out);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.18; comp.connect(clip);
    const dim = filt('lowpass', 18000, 0.7, comp);
    const lvl = gain(0.45, dim), LVL = [0, 0.45, 0.8, 0.95, 1.05];   // the stages also grow in level
    const mix = gain(0.78, lvl);
    const verbIn = gain(1), verb = ctx.createConvolver(); verb.normalize = true; verb.buffer = ir;
    verbIn.connect(verb); verb.connect(gain(0.55, mix));
    const dlyL = ctx.createDelay(2), dlyR = ctx.createDelay(2), dlyIn = gain(1), dfb = gain(0.42), dlp = filt('lowpass', 3800, 0.6);
    dlyIn.connect(dlyL); dlyL.connect(dlp); dlp.connect(dlyR); dlyR.connect(dfb); dfb.connect(dlyL);
    dlyL.connect(pan(-0.7, mix)); dlyR.connect(pan(0.7, mix)); dlp.connect(gain(0.2, verbIn));
    const send = (to, v, d) => { const g = gain(1, to); if (v) g.connect(gain(v, verbIn)); if (d) g.connect(gain(d, dlyIn)); return g; };
    const duck = gain(1, mix);
    const bellBus = send(mix, 0.75, 0.4), padBus = send(duck, 0.6, 0), leadBus = send(duck, 0.3, 0.22), arpBus = send(duck, 0.35, 0.45);
    const choirOut = send(duck, 0.8, 0), choirIn = gain(1);
    for (const [ff, q, k] of [[650, 5, 1.1], [1100, 6, 0.7], [2700, 8, 0.25]]) choirIn.connect(filt('bandpass', ff, q, gain(k, choirOut)));
    const bassBus = gain(1, duck), bassLP = filt('lowpass', 900, 4, bassBus);
    const drums = gain(1, mix), drumVerb = send(drums, 0.3, 0);
    const hats = filt('highpass', 7800, 0.7, drums);
    const HOT = curve(3);

    function noise(t, dur, to, o) {
      const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true;
      const g = ctx.createGain(), a = o.a || 0.002;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.f) { const f = filt(o.type || 'bandpass', o.f, o.q == null ? 0.8 : o.q); f.frequency.setValueAtTime(o.f, t); if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur); s.connect(f); f.connect(g); } else s.connect(g);
      g.connect(to); s.start(t, R() * 1.5); s.stop(t + dur + 0.02);
    }
    function tone(t, dur, to, o) {
      const s = ctx.createOscillator(); s.type = o.type || 'sine'; s.frequency.setValueAtTime(o.f, t);
      if (o.det) s.detune.value = o.det;
      if (o.fTo) s.frequency.exponentialRampToValueAtTime(o.fTo, t + (o.glide || dur));
      const g = ctx.createGain(), a = o.a || 0.003;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.lp) s.connect(filt('lowpass', o.lp, 0.7, g)); else s.connect(g);
      g.connect(o.to2 || to); s.start(t); s.stop(t + dur + 0.02);
    }

    /* ---- drums ---- */
    const pump = (t, depth, back) => { duck.gain.setValueAtTime(depth, t); duck.gain.linearRampToValueAtTime(1, t + back); };
    const kick = (t, v = 1, hard) => {
      tone(t, hard ? 0.5 : 0.42, drums, { f: hard ? 190 : 150, fTo: 42, glide: 0.1, vol: 0.9 * v });
      noise(t, 0.014, drums, { type: 'highpass', f: 3200, vol: (hard ? 0.3 : 0.16) * v });
      pump(t, hard ? 0.25 : 0.4, 0.24);
    };
    const softKick = (t, v = 1) => { tone(t, 0.5, drums, { f: 95, fTo: 40, glide: 0.14, vol: 0.55 * v }); pump(t, 0.7, 0.4); };
    const clap = (t, v = 1) => { for (let i = 0; i < 3; i++) noise(t + i * 0.01, 0.03, drums, { f: 1600, q: 1.2, vol: 0.36 * v }); noise(t + 0.02, 0.32, drumVerb, { f: 1300, q: 0.9, vol: 0.3 * v }); };
    const snare = (t, v = 1) => { tone(t, 0.12, drums, { type: 'triangle', f: 230, fTo: 160, vol: 0.22 * v }); noise(t, 0.16, drums, { type: 'highpass', f: 1900, vol: 0.22 * v }); };
    const hat = (t, v = 1, open) => noise(t, open ? 0.28 : 0.04, hats, { vol: 0.15 * v });
    const shaker = (t, v = 1) => noise(t, 0.07, hats, { vol: 0.06 * v, a: 0.02 });
    const crash = (t, v = 1) => { noise(t, 3, drumVerb, { type: 'highpass', f: 3800, vol: 0.13 * v }); noise(t, 1.5, drums, { f: 6500, q: 0.5, vol: 0.05 * v }); };
    const boom = (t, v = 1) => { tone(t, 2.2, drums, { f: 68, fTo: 24, vol: 0.62 * v }); noise(t, 1.2, drumVerb, { type: 'lowpass', f: 1800, fTo: 120, vol: 0.25 * v }); };

    /* ---- voices ---- */
    // glass bell: a sine with inharmonic partials, long tail, both sends
    const bell = (t, m, v) => {
      const f = mtof(m);
      tone(t, 2.6, bellBus, { f, vol: v, a: 0.003 });
      tone(t, 1.2, bellBus, { f: f * 2.756, vol: v * 0.28, a: 0.002 });
      tone(t, 0.5, bellBus, { f: f * 5.404, vol: v * 0.1, a: 0.002 });
      tone(t, 3.4, bellBus, { f: f * 0.5, vol: v * 0.22, a: 0.01 });
    };
    const pad = (t, chord, dur, v, bright) => chord.forEach((m, i) => {
      const f = mtof(m), amp = ctx.createGain(), lp = filt('lowpass', bright ? 2400 : 1100, 0.6, amp);
      lp.frequency.setValueAtTime(bright ? 1400 : 700, t); lp.frequency.linearRampToValueAtTime(bright ? 3200 : 1500, t + dur);
      amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + Math.min(0.8, dur * 0.4));
      amp.gain.setValueAtTime(v, t + dur - 0.05); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2);
      for (const det of [-11, 0, 11]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 1.25); }
      amp.connect(pan([-0.6, 0, 0.6][i], padBus));
    });
    const choir = (t, chord, dur, v) => chord.forEach((m, i) => {
      const f = mtof(m + 12), amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.5);
      amp.gain.setValueAtTime(v, t + dur - 0.1); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 4.8 + i * 0.3; const lg = gain(f * 0.008); lfo.connect(lg);
      for (const det of [-7, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; lg.connect(o.frequency); o.connect(amp); o.start(t); o.stop(t + dur + 1.02); }
      lfo.start(t); lfo.stop(t + dur + 1.02);
      amp.connect(pan([-0.5, 0, 0.5][i], choirIn));
    });
    // supersaw lead: seven saws, a filter that opens on the hit
    const saw = (t, m, dur, v) => {
      const f = mtof(m), hold = Math.max(0.05, dur * 0.9), end = t + hold + 0.3;
      const lp = filt('lowpass', 7000, 1.5), amp = ctx.createGain();
      lp.frequency.setValueAtTime(7000, t); lp.frequency.exponentialRampToValueAtTime(2200, t + Math.min(0.5, dur));
      amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.008);
      amp.gain.exponentialRampToValueAtTime(v * 0.7, t + hold); amp.gain.exponentialRampToValueAtTime(0.0001, t + hold + 0.28);
      lp.connect(amp); amp.connect(leadBus);
      [-24, -14, -6, 0, 6, 14, 24].forEach((det, k) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; const p = pan((k - 3) / 4, lp); o.connect(p); o.start(t); o.stop(end); });
    };
    const spark = (t, m, v, side) => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
      const amp = ctx.createGain(); amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.003); amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(amp); amp.connect(pan(side, arpBus)); o.start(t); o.stop(t + 0.37);
    };
    // bass: sub sine plus, from stage 3, a detuned reese through drive. `wob` > 0 wobbles the filter (stage 4).
    const bass = (t, m, dur, v, reese, wob) => {
      const f = mtof(m), end = t + dur + 0.08;
      const amp = ctx.createGain(); amp.gain.setValueAtTime(0.0001, t); amp.gain.exponentialRampToValueAtTime(v, t + 0.005);
      amp.gain.setValueAtTime(v * 0.8, t + dur - 0.02); amp.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06); amp.connect(bassLP);
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.setValueAtTime(f * 2, t); sub.frequency.exponentialRampToValueAtTime(f, t + 0.025);
      sub.connect(amp); sub.start(t); sub.stop(end);
      if (reese) {
        const sh = ctx.createWaveShaper(); sh.curve = HOT; const rg = gain(reese); sh.connect(rg); rg.connect(amp);
        for (const det of [-16, 16]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * 2; o.detune.value = det; o.connect(sh); o.start(t); o.stop(end); }
      }
      bassLP.frequency.cancelScheduledValues(t);
      if (wob) {
        const n = Math.max(1, Math.round(dur / wob));
        for (let i = 0; i < n; i++) { bassLP.frequency.setValueAtTime(2600, t + i * wob); bassLP.frequency.exponentialRampToValueAtTime(240, t + (i + 0.9) * wob); }
      } else { bassLP.frequency.setValueAtTime(reese ? 1600 : 700, t); bassLP.frequency.exponentialRampToValueAtTime(reese ? 500 : 400, t + dur); }
    };
    const riser = (t, dur) => {
      noise(t, dur, mix, { f: 240, fTo: 9000, q: 2.4, vol: 0.13, a: dur * 0.95 });
      tone(t, dur, mix, { type: 'sawtooth', f: 110, fTo: 1760, vol: 0.025, a: dur * 0.9, lp: 2400 });
      for (let i = 0; i < 8; i++) spark(t + dur * (i / 8), 81 + i * 2, 0.03 + i * 0.006, i % 2 ? 0.6 : -0.6);
    };

    /* ---- the arrangement ---- */
    const S = { stage: 1, want: 1, bar: 0, nextT: ctx.currentTime + 0.12, alive: true, done: false, side: 1 };
    function scheduleBar(t) {
      const st = S.stage, D = STAGES[st], beat = 60 / D.bpm, b = S.bar, mb = b % 8, pass = Math.floor(b / 8) % 2, phrase0 = mb === 0;
      const ch = CHORD[mb], root = ROOT[mb];
      if (D.meter === 3) {
        // a real waltz: one bell note a beat, the pad breathing under it
        const barD = beat * 3, s16 = beat / 4;
        pad(t, ch, barD, 0.035, false);
        if (b % 2 === 0) choir(t, ch, barD * 2, pass ? 0.02 : 0.012);
        bass(t, root + 12, barD * 0.95, 0.2);
        MEL[mb].forEach((m, i) => { if (m) bell(t + i * beat, m + (pass ? 12 : 0), 0.085); });
        if (!MEL[mb][1]) { bell(t + beat * 1.5, MEL[mb][0] + 7 + (pass ? 12 : 0), 0.04); bell(t + beat * 2, MEL[mb][0] + 12, 0.05); }
        for (let i = 0; i < 6; i++) spark(t + i * beat / 2, ch[(i + mb) % 3] + 24 + (i > 2 ? 12 : 0), 0.022 + (i === 0 ? 0.01 : 0), (S.side = -S.side) * 0.7);
        softKick(t, 1); if (b % 4 === 3) softKick(t + beat * 2.5, 0.6);
        for (let i = 0; i < 6; i++) shaker(t + i * beat / 2 + s16, i % 2 ? 1 : 0.6);
        if (phrase0) crash(t, 0.5);
        return barD;
      }
      // 4/4: the waltz melody on a 3+3+2 grid
      const barD = beat * 4, s = barD / 16, T = (k) => t + k * s;
      const POS = [0, 6, 12], LEN = [6, 6, 4], hard = st >= 3, top = st === 4 ? 12 : 0;
      pad(t, ch, barD, st === 2 ? 0.03 : 0.024, true);
      if (b % 2 === 0) choir(t, ch, barD * 2, st === 2 ? 0.024 : 0.03);
      // melody: bells always, the supersaw from stage 3, octave doubled in stage 4
      MEL[mb].forEach((m, i) => {
        if (!m) return;
        let len = LEN[i]; if (i === 0 && !MEL[mb][1]) len = mb === 3 ? 10 : 12;
        bell(T(POS[i]), m + 12 + top, st === 2 ? 0.06 : 0.045);
        if (hard) { saw(T(POS[i]), m + top, len * s, 0.05); if (st === 4 || pass) saw(T(POS[i]), m + 12 + top, len * s, 0.026); }
        else if (pass) saw(T(POS[i]), m, len * s, 0.03);
      });
      if (ORN[mb]) for (const [k, m] of ORN[mb]) { bell(T(k), m + 12 + top, 0.04); if (hard) saw(T(k), m + top, 2 * s, 0.035); }
      // bass on the 3+3+2 pulse
      const wob = st === 4 ? s * 2 : 0;
      for (const [k, len] of [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]) bass(T(k), root + (k === 14 && st >= 3 ? 12 : 0), len * s * 0.92, st === 2 ? 0.26 : 0.3, hard ? (st === 4 ? 0.5 : 0.35) : 0, wob);
      // arp of star dust
      const arpN = hard ? 16 : 8;
      for (let i = 0; i < arpN; i++) spark(T(i * (16 / arpN)), ch[i % 3] + 24 + (i % 4 === 3 ? 12 : 0), hard ? 0.02 : 0.018, (S.side = -S.side) * 0.7);
      // drums
      for (let k = 0; k < 16; k += 4) kick(T(k), 1, hard);
      if (st === 4) { kick(T(14), 0.7, true); if (mb % 2) kick(T(7), 0.6, true); }
      clap(T(4)); clap(T(12));
      for (let k = 0; k < 16; k++) {
        if (k % 4 === 2) hat(T(k), 1, st >= 3 && k === 14);
        else if (hard) hat(T(k), k % 2 ? 0.5 : 0.35);
      }
      if (mb === 7) {
        const n = hard ? 16 : 8;
        for (let i = 0; i < n; i++) snare(T(8 + i * (8 / n)), 0.3 + 0.7 * (i / n));
        noise(T(8), barD / 2, mix, { f: 300, fTo: 8000, q: 2, vol: 0.08, a: barD / 2 * 0.9 });
      }
      if (phrase0) crash(t, hard ? 1 : 0.7);
      return barD;
    }

    const api = {
      get stage() { return S.stage; }, get bar() { return S.bar; },
      tick() {
        if (!S.alive || S.done) return;
        const now = ctx.currentTime;
        if (S.nextT < now - 0.5) S.nextT = now + 0.05;      // the tab slept: start again from now
        let guard = 0;
        while (S.nextT < now + 0.35 && guard++ < 4) {
          if (S.want !== S.stage) { S.stage = S.want; S.bar = 0; lvl.gain.setTargetAtTime(LVL[S.stage], S.nextT, 0.08); }
          const d = scheduleBar(S.nextT);
          S.nextT += d; S.bar++;
        }
      },
      // the change lands on the next bar; the hit lands now
      setStage(n) {
        n = Math.max(1, Math.min(4, n | 0));
        if (n === S.want) return;
        const up = n > S.want; S.want = n;
        if (up) api.impact();
      },
      impact() { const t = ctx.currentTime + 0.02; boom(t); crash(t, 1); kick(t, 1.2, true); noise(t, 1.6, mix, { f: 7000, fTo: 200, q: 1.5, vol: 0.12 }); },
      riser(dur) { riser(ctx.currentTime + 0.02, Math.max(0.5, dur)); },
      setDim(u) { dim.frequency.setTargetAtTime(18000 * Math.pow(500 / 18000, Math.max(0, Math.min(1, u))), ctx.currentTime, 0.15); },
      setVol(v) { out.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, 0.25); },
      // the boss dies: one last A major chord, the melody's first note in a bell, and the hall rings out
      finale() {
        if (S.done) return; S.done = true;
        const t = Math.max(ctx.currentTime + 0.05, Math.min(S.nextT, ctx.currentTime + 0.4));
        lvl.gain.setTargetAtTime(0.9, t, 0.1); boom(t, 1.2); crash(t, 1.2);
        pad(t, [57, 61, 64], 4, 0.05, true); choir(t, [57, 61, 64], 4, 0.035);
        bell(t, 81, 0.1); bell(t + 0.6, 76, 0.07); bell(t + 1.2, 73, 0.06); bell(t + 1.8, 69, 0.08);
        bass(t, 33, 3.5, 0.3);
        api.stop(7, t + 1);
      },
      stop(fade = 1, at) {
        if (!S.alive) return; S.alive = false;
        const t = Math.max(ctx.currentTime, at || 0);
        try { out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t); out.gain.exponentialRampToValueAtTime(0.0001, t + fade); } catch (e) { /* ignore */ }
        setTimeout(() => { try { out.disconnect(); } catch (e) { /* ignore */ } }, (t - ctx.currentTime + fade + 0.3) * 1000);
      },
    };
    out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(Math.max(0.001, vol == null ? 0.6 : vol), ctx.currentTime + 1.2);
    return api;
  }
  return { create, STAGES };
})();
