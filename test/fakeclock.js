// In-page fake clock for deterministic, fast tests. Injected with addInitScript before the game loads.
// Replaces requestAnimationFrame, setTimeout, setInterval, performance.now and Date.now.
// window.__advance(ms, hz = 60) runs frames of 1000/hz ms: due timers first, then the rAF callbacks.
module.exports = function fakeClockInit() {
  const real = { now: performance.now.bind(performance), dnow: Date.now };
  const base = 1700000000000;
  let now = 0, nid = 1, raf = [];
  const timers = new Map();
  performance.now = () => now;
  Date.now = () => base + now;
  window.setTimeout = (fn, d, ...a) => { const id = nid++; timers.set(id, { at: now + Math.max(0, +d || 0), fn, a, rep: 0 }); return id; };
  window.setInterval = (fn, d, ...a) => { const id = nid++; const rep = Math.max(1, +d || 0); timers.set(id, { at: now + rep, fn, a, rep }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (fn) => { const id = nid++; raf.push({ id, fn }); return id; };
  window.cancelAnimationFrame = (id) => { raf = raf.filter((r) => r.id !== id); };
  window.__realNow = real.now;
  window.__clockNow = () => now;
  window.__advance = async (ms, hz = 60) => {
    const end = now + ms, step = 1000 / hz;
    while (now < end - 1e-9) {
      now += step;
      for (;;) {                                   // timers in order of due time, then id
        let best = null, bid = 0;
        for (const [id, t] of timers) if (t.at <= now + 1e-9 && (!best || t.at < best.at || (t.at === best.at && id < bid))) { best = t; bid = id; }
        if (!best) break;
        if (best.rep) best.at += best.rep; else timers.delete(bid);
        try { typeof best.fn === 'function' ? best.fn(...best.a) : 0; } catch (e) { console.error(e); }
      }
      const q = raf; raf = [];
      for (const r of q) { try { r.fn(now); } catch (e) { console.error(e); } }
      await null;
    }
  };
};
