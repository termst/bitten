/* src/02-sound.js: Sfx: every sound synthesized with WebAudio. From v1 to v8. Lines 586 to 806 of the v13.7 script. */
/* =====================================================================
   Sound: everything is synthesized, nothing is loaded
   ===================================================================== */
const MELODY = [[69, 72, 76], [77, 76, 72], [71, 72, 68], [69, 0, 0], [64, 69, 72], [74, 72, 71], [70, 69, 65], [64, 0, 0]];
const BASS = [45, 50, 52, 45, 45, 50, 46, 40];
const DRONE_ROOT = { cellar: 55, halls: 49, market: 51.91, kamer: 43.65, garden: 46.25 };

const Sfx = {
  ctx: null, master: null, verb: null, nbuf: null, on: true,
  drone: null, musicOn: false, musicT: 0, musicI: 0,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const c = (this.ctx = new AC());
      this.master = c.createGain();
      this.master.gain.value = this.on ? 0.85 : 0;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
      this.master.connect(comp); comp.connect(c.destination);
      // a dark echo used as a cheap cellar reverb
      this.verb = c.createGain(); this.verb.gain.value = 0.3;
      const dl = c.createDelay(1); dl.delayTime.value = 0.21;
      const fb = c.createGain(); fb.gain.value = 0.38;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
      this.verb.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(this.master);
      const len = Math.floor(c.sampleRate * 2);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.nbuf = buf;
      if (c.state === 'suspended') c.resume().catch(() => {});
    } catch (e) { this.ctx = null; }
  },
  setOn(v) {
    this.on = v;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v ? 0.85 : 0, this.ctx.currentTime, 0.05);
  },
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); },

  tone(f, dur, o = {}) {
    const c = this.ctx; if (!c || !this.on) return;
    try {
      const t0 = c.currentTime + (o.delay || 0);
      const osc = c.createOscillator(); osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(f, t0);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
      const g = c.createGain(); const v = o.vol == null ? 0.2 : o.vol; const a = o.attack == null ? 0.005 : o.attack;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      let node = osc;
      if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; node.connect(f2); node = f2; }
      node.connect(g); g.connect(this.master);
      if (o.verb) g.connect(this.verb);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    } catch (e) { /* ignore */ }
  },
  noise(dur, o = {}) {
    const c = this.ctx; if (!c || !this.on || !this.nbuf) return;
    try {
      const t0 = c.currentTime + (o.delay || 0);
      const src = c.createBufferSource(); src.buffer = this.nbuf; src.loop = true;
      const f = c.createBiquadFilter(); f.type = o.filter || 'lowpass';
      f.frequency.setValueAtTime(o.f || 1000, t0);
      if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t0 + dur);
      f.Q.value = o.q || 0.7;
      const g = c.createGain(); const v = o.vol == null ? 0.2 : o.vol; const a = o.attack == null ? 0.005 : o.attack;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(this.master);
      if (o.verb) g.connect(this.verb);
      src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.05);
    } catch (e) { /* ignore */ }
  },

  // ---- game sounds ----
  blip(who) {
    if (who === 'jens') this.tone(150 + Math.random() * 50, 0.05, { type: 'square', vol: 0.025, lp: 1100 });
    else if (who === 'apple') this.tone(760 + Math.random() * 80, 0.04, { type: 'triangle', vol: 0.022 });
    else this.tone(420, 0.03, { type: 'sine', vol: 0.015 });
  },
  shoot() { this.tone(640, 0.07, { type: 'triangle', to: 360, vol: 0.06 }); this.noise(0.03, { f: 3200, vol: 0.025 }); },
  splat() { this.noise(0.07, { f: 1300, fTo: 400, vol: 0.05 }); },
  hit() { this.noise(0.1, { f: 950, fTo: 250, vol: 0.15 }); this.tone(170, 0.1, { to: 70, vol: 0.09 }); },
  hiss(v = 1) { this.noise(0.55, { filter: 'bandpass', f: 5200, q: 1.3, vol: 0.05 * v, attack: 0.08 }); },
  spit() { this.noise(0.14, { filter: 'bandpass', f: 1700, fTo: 500, q: 1, vol: 0.13 }); this.tone(260, 0.12, { to: 110, vol: 0.07 }); },
  squelch() { this.noise(0.3, { f: 750, fTo: 150, vol: 0.2, q: 3 }); this.tone(210, 0.26, { to: 50, vol: 0.12, type: 'sawtooth', lp: 520 }); },
  crunch() {
    this.noise(0.16, { f: 2600, fTo: 700, vol: 0.26, q: 0.6 });
    this.noise(0.09, { filter: 'highpass', f: 2500, vol: 0.11, delay: 0.05 });
    this.tone(110, 0.2, { to: 45, vol: 0.18, type: 'sawtooth', lp: 420 });
  },
  shell() { this.tone(1900, 0.25, { to: 900, vol: 0.07, type: 'triangle' }); this.noise(0.18, { filter: 'highpass', f: 3600, vol: 0.12 }); },
  shellBack() { this.tone(900, 0.18, { to: 1500, vol: 0.05, type: 'triangle' }); },
  breakUrn() { this.noise(0.2, { filter: 'highpass', f: 1500, vol: 0.17 }); this.tone(330, 0.12, { to: 170, vol: 0.07, type: 'triangle' }); },
  breakEgg() { this.noise(0.22, { f: 1150, fTo: 300, vol: 0.17, q: 2 }); },
  slam() { this.tone(70, 0.35, { to: 38, vol: 0.32 }); this.noise(0.22, { f: 900, fTo: 200, vol: 0.18 }); this.tone(520, 0.08, { type: 'square', vol: 0.03, lp: 1400 }); },
  blockWarn() { [0, 4, 7].forEach((st, i) => this.tone(440 * Math.pow(2, st / 12), 0.09, { type: 'square', vol: 0.035, lp: 1800, delay: i * 0.08 })); },
  goal() { [0, 4, 7, 12].forEach((st, i) => this.tone(262 * Math.pow(2, st / 12), 0.7, { type: 'sawtooth', vol: 0.05, lp: 1600, delay: i * 0.07, verb: true })); this.noise(0.6, { f: 2400, fTo: 400, vol: 0.12 }); },
  ballHit() { this.tone(180, 0.12, { to: 90, vol: 0.16 }); this.noise(0.06, { filter: 'highpass', f: 1800, vol: 0.06 }); },
  ballBounce() { this.tone(140, 0.08, { to: 80, vol: 0.08 }); },
  boost() { this.noise(0.6, { filter: 'bandpass', f: 600, fTo: 2200, q: 0.8, vol: 0.12, attack: 0.04 }); this.tone(110, 0.5, { to: 220, type: 'sawtooth', vol: 0.04, lp: 700 }); },
  chomp() { this.noise(0.09, { f: 1400, fTo: 300, vol: 0.16, q: 2 }); this.tone(160, 0.07, { to: 90, vol: 0.1, delay: 0.02 }); },
  zap() { this.noise(0.12, { filter: 'highpass', f: 3000, vol: 0.07 }); this.tone(1400, 0.08, { type: 'square', to: 600, vol: 0.025 }); },
  legend() { [0, 7, 12, 16, 19, 24].forEach((st, i) => this.tone(262 * Math.pow(2, st / 12), 1.1, { vol: 0.06, delay: i * 0.08, verb: true })); },
  achieve() { [0, 4, 7, 12].forEach((st, i) => this.tone(523 * Math.pow(2, st / 12), 0.35, { type: 'triangle', vol: 0.05, delay: i * 0.06, verb: true })); },
  phoenix() { this.noise(0.9, { f: 600, fTo: 3000, vol: 0.14, attack: 0.1 }); [0, 7, 12].forEach((st, i) => this.tone(330 * Math.pow(2, st / 12), 0.9, { vol: 0.06, delay: 0.1 + i * 0.1, verb: true })); },
  boom(big) { this.noise(big ? 1.1 : 0.7, { f: 900, fTo: 60, vol: big ? 0.42 : 0.3 }); this.tone(60, big ? 0.9 : 0.6, { to: 28, vol: big ? 0.45 : 0.32 }); this.noise(0.15, { filter: 'highpass', f: 2500, vol: 0.1 }); },
  fuse() { this.noise(0.9, { filter: 'bandpass', f: 4200, q: 2, vol: 0.06, attack: 0.05 }); [0, 0.2, 0.4, 0.6].forEach((d) => this.tone(1400, 0.06, { type: 'square', vol: 0.03, delay: d, lp: 3000 })); },
  warp() { this.tone(180, 0.45, { to: 720, type: 'sawtooth', vol: 0.05, lp: 1200 }); this.tone(720, 0.45, { to: 160, type: 'triangle', vol: 0.05, delay: 0.1 }); },
  coin() { this.tone(1320, 0.07, { type: 'square', vol: 0.025, lp: 3200 }); this.tone(1760, 0.14, { type: 'square', vol: 0.025, lp: 3200, delay: 0.055 }); },
  register() { this.noise(0.08, { filter: 'highpass', f: 2600, vol: 0.08 }); [0, 4, 7].forEach((st, i) => this.tone(1046 * Math.pow(2, st / 12), 0.3, { type: 'triangle', vol: 0.05, delay: 0.05 + i * 0.05 })); },
  gavel() { this.tone(120, 0.25, { to: 60, vol: 0.32 }); this.noise(0.12, { filter: 'bandpass', f: 1200, q: 2, vol: 0.22 }); this.tone(900, 0.06, { type: 'square', vol: 0.03, lp: 2000 }); },
  paper() { this.noise(0.12, { filter: 'highpass', f: 2400, vol: 0.05 }); },
  cart() { this.noise(0.16, { filter: 'bandpass', f: 1800, q: 3, vol: 0.09 }); this.tone(320, 0.09, { type: 'square', vol: 0.022, lp: 1500 }); },
  clang() { this.tone(520, 0.4, { type: 'triangle', to: 380, vol: 0.08, verb: true }); this.noise(0.1, { filter: 'highpass', f: 3000, vol: 0.08 }); },
  freeze() { this.tone(1800, 0.5, { to: 600, vol: 0.06, verb: true }); this.noise(0.4, { filter: 'highpass', f: 5000, vol: 0.05 }); },
  splash() { this.noise(0.9, { f: 1400, fTo: 260, vol: 0.2, attack: 0.06 }); },
  gust() { this.noise(0.7, { filter: 'bandpass', f: 500, fTo: 1600, q: 0.7, vol: 0.1, attack: 0.15 }); },
  spikes() { this.noise(0.05, { filter: 'highpass', f: 2500, vol: 0.04 }); this.tone(240, 0.05, { type: 'square', vol: 0.016, lp: 900 }); },
  dingdong() { this.tone(988, 0.7, { vol: 0.045, verb: true }); this.tone(784, 0.9, { vol: 0.04, delay: 0.32, verb: true }); },
  thud() { this.tone(80, 0.3, { to: 40, vol: 0.3 }); this.noise(0.2, { f: 500, vol: 0.14 }); },
  clank() { this.tone(1200, 0.12, { type: 'triangle', to: 700, vol: 0.06 }); this.noise(0.05, { filter: 'highpass', f: 4000, vol: 0.06 }); },
  down() { [0, -3, -7].forEach((st, i) => this.tone(220 * Math.pow(2, st / 12), 0.5, { type: 'sawtooth', vol: 0.05, lp: 700, delay: i * 0.12, verb: true })); this.noise(0.5, { f: 600, fTo: 150, vol: 0.08 }); },
  curse() { [0, 1, 6, 11].forEach((st, i) => this.tone(98 * Math.pow(2, st / 12), 1.4, { type: 'sawtooth', vol: 0.045, lp: 900, delay: i * 0.05, verb: true })); this.noise(0.9, { filter: 'bandpass', f: 400, fTo: 2400, q: 1.5, vol: 0.06, attack: 0.2 }); },
  cleanse() { [0, 4, 7, 12, 16].forEach((st, i) => this.tone(659 * Math.pow(2, st / 12), 0.5, { vol: 0.04, delay: i * 0.05, verb: true })); this.noise(0.4, { filter: 'highpass', f: 5000, vol: 0.04 }); },
  rotRise() { this.tone(160, 0.7, { to: 420, type: 'triangle', vol: 0.05, lp: 900 }); this.noise(0.6, { filter: 'bandpass', f: 900, q: 3, vol: 0.05, attack: 0.15 }); },
  key() { [0, 7, 12].forEach((st, i) => this.tone(1175 * Math.pow(2, st / 12), 0.18, { type: 'triangle', vol: 0.04, delay: i * 0.06 })); },
  unlock() { this.tone(140, 0.3, { to: 70, vol: 0.25 }); this.noise(0.1, { filter: 'highpass', f: 2600, vol: 0.1 }); this.tone(880, 0.25, { type: 'triangle', vol: 0.05, delay: 0.12, verb: true }); },
  dash() { this.noise(0.22, { filter: 'bandpass', f: 900, fTo: 2600, q: 0.9, vol: 0.1 }); this.tone(300, 0.15, { to: 600, type: 'triangle', vol: 0.04 }); },
  slotTick() { this.tone(1500 + Math.random() * 300, 0.03, { type: 'square', vol: 0.018, lp: 4000 }); },
  crumble() { this.noise(0.5, { f: 400, fTo: 120, vol: 0.08, attack: 0.08 }); },
  collapse() { this.noise(0.6, { f: 700, fTo: 60, vol: 0.22 }); this.tone(70, 0.5, { to: 30, vol: 0.2 }); },
  roots() { this.noise(0.3, { filter: 'bandpass', f: 500, fTo: 200, q: 2, vol: 0.2 }); this.tone(90, 0.2, { to: 50, vol: 0.18 }); },
  charge() { this.tone(400, 0.9, { to: 1600, type: 'sawtooth', vol: 0.03, lp: 2400 }); },
  bolt() { this.noise(0.12, { filter: 'highpass', f: 2200, vol: 0.12 }); this.tone(900, 0.12, { to: 300, type: 'square', vol: 0.04, lp: 2400 }); },
  puff() { this.noise(0.5, { filter: 'bandpass', f: 1200, fTo: 500, q: 0.8, vol: 0.07, attack: 0.05 }); },
  pickup() { this.tone(660, 0.1, { vol: 0.08 }); this.tone(990, 0.16, { vol: 0.07, delay: 0.07 }); },
  item() { [0, 3, 7, 12, 15].forEach((st, i) => this.tone(330 * Math.pow(2, st / 12), 0.6, { vol: 0.065, delay: i * 0.09, verb: true })); },
  chest() { this.tone(140, 0.5, { to: 190, vol: 0.12, type: 'sawtooth', lp: 500 }); this.noise(0.4, { filter: 'bandpass', f: 900, q: 4, vol: 0.06 }); },
  doorShut() { this.tone(85, 0.35, { to: 45, vol: 0.28 }); this.noise(0.18, { f: 500, vol: 0.14 }); this.noise(0.06, { filter: 'highpass', f: 2000, vol: 0.08, delay: 0.04 }); },
  doorOpen() { this.tone(60, 0.45, { to: 96, vol: 0.16 }); this.noise(0.35, { f: 600, fTo: 200, vol: 0.07 }); },
  dig() { this.noise(0.45, { f: 300, fTo: 120, vol: 0.18, attack: 0.05 }); },
  rumble() { this.noise(0.6, { f: 160, vol: 0.12, attack: 0.1 }); },
  erupt() { this.noise(0.42, { f: 700, fTo: 150, vol: 0.3 }); this.tone(70, 0.42, { to: 35, vol: 0.3 }); },
  roar() {
    this.tone(70, 1.2, { to: 40, vol: 0.24, type: 'sawtooth', lp: 380, attack: 0.1, verb: true });
    this.tone(73.5, 1.2, { to: 42, vol: 0.18, type: 'sawtooth', lp: 300, attack: 0.1 });
    this.noise(1.2, { filter: 'bandpass', f: 900, fTo: 300, q: 2, vol: 0.12, attack: 0.15 });
  },
  stinger() { [0, 1, 6].forEach((st) => this.tone(110 * Math.pow(2, st / 12), 1.8, { vol: 0.055, type: 'sawtooth', lp: 900, attack: 0.02, verb: true })); },
  heartbeat() { this.tone(62, 0.14, { to: 40, vol: 0.3 }); this.tone(58, 0.14, { to: 38, vol: 0.22, delay: 0.2 }); },
  descend() { this.tone(220, 1.3, { to: 55, vol: 0.14, type: 'triangle', verb: true }); this.noise(1.3, { f: 500, fTo: 80, vol: 0.11 }); },
  bossDie() { this.roar(); this.noise(1.4, { f: 400, fTo: 60, vol: 0.2, delay: 0.2 }); },
  escape() { [0, 4, 7, 11, 14].forEach((st, i) => this.tone(262 * Math.pow(2, st / 12), 1.8, { vol: 0.06, delay: i * 0.16, verb: true })); },

  // ---- ambient cellar drone, one root per level ----
  startDrone(li) {
    this.stopDrone();
    const c = this.ctx; if (!c) return;
    try {
      const root = (typeof li === 'string' ? DRONE_ROOT[li] : [55, 49, 46.25][li]) || 55;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.085, c.currentTime + 3);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 2.5;
      const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = root;
      const o2 = c.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = root * 1.007;
      const o3 = c.createOscillator(); o3.type = 'sine'; o3.frequency.value = root * Math.SQRT2;
      const g3 = c.createGain(); g3.gain.value = 0.18;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.06;
      const lg = c.createGain(); lg.gain.value = 130;
      lfo.connect(lg); lg.connect(lp.frequency);
      const ns = c.createBufferSource(); ns.buffer = this.nbuf; ns.loop = true;
      const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 380; nf.Q.value = 0.9;
      const ng = c.createGain(); ng.gain.value = 0.32;
      ns.connect(nf); nf.connect(ng); ng.connect(g);
      o1.connect(lp); o2.connect(lp); o3.connect(g3); g3.connect(lp); lp.connect(g); g.connect(this.master);
      const nodes = [o1, o2, o3, lfo, ns];
      nodes.forEach((n) => n.start());
      this.drone = { g, nodes };
    } catch (e) { this.drone = null; }
  },
  stopDrone() {
    const d = this.drone; if (!d || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      d.g.gain.cancelScheduledValues(t);
      d.g.gain.setValueAtTime(Math.max(0.0001, d.g.gain.value), t);
      d.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      d.nodes.forEach((n) => { try { n.stop(t + 1); } catch (e) { /* ignore */ } });
    } catch (e) { /* ignore */ }
    this.drone = null;
  },

  // ---- music box for the menu: an original waltz in A minor ----
  startMusic() { if (!this.ctx) return; this.musicOn = true; this.musicT = this.ctx.currentTime + 0.15; this.musicI = 0; },
  stopMusic() { this.musicOn = false; },
  musicTick() {
    const c = this.ctx; if (!c || !this.musicOn || !this.on || c.state !== 'running') return;
    const beat = 0.52;
    if (this.musicT < c.currentTime - 1) this.musicT = c.currentTime + 0.05;
    while (this.musicT < c.currentTime + 0.35) {
      const bar = Math.floor(this.musicI / 3) % 8, b = this.musicI % 3;
      const n = MELODY[bar][b];
      const d = this.musicT - c.currentTime;
      if (n) this.box(n, d, 0.05);
      if (b === 0) this.box(BASS[bar], d, 0.035);
      this.musicI++; this.musicT += beat;
    }
  },
  box(midi, delay, vol) {
    const f = 440 * Math.pow(2, (midi - 69) / 12) * (1 + (Math.random() - 0.5) * 0.009);
    this.tone(f, 1.5, { vol, delay: Math.max(0, delay), attack: 0.004, verb: true });
    this.tone(f * 2.01, 0.6, { vol: vol * 0.35, delay: Math.max(0, delay), attack: 0.003 });
  },
};

