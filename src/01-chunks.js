/* src/01-chunks.js: v14.10 lazy chunks. build.mjs moves files marked `@chunk <name>` out of bitten.js into chunks/<name>.js
   and leaves CHUNKS14.place(...) at each file's old spot. A chunk loads on first use (CHUNKS14.load), yet every wrapper it
   installs lands at its old place in the chain:
   * place(id, slots, hooks) runs where the file used to be. Each slot [name, get, set] names a function the file wraps;
     place() puts a forwarder there, so later files wrap the forwarder. Each hook name gets a marker layer.
   * begin(id) (first line of the file inside the chunk) puts the inner functions back, so the file wraps exactly what it
     wrapped before; Hooks.layer calls go in below the marker. end(id) keeps what the file made and puts the outer chain back.
   The build lists the slots itself (tools/chunk-writes.mjs logic), so a new wrapper in a chunk file needs nothing by hand. */
const CHUNKS14 = (() => {
  const C = {
    files: {},        // chunk name -> url, written by build.mjs at the end of bitten.js
    ids: {},          // chunk name -> [file ids], also from the build
    places: {},       // file id -> { slots, hooks, saved, impl, cur }
    state: {},        // chunk name -> 'loading' | 'ready' | 'failed'
    proms: {},
    after: {},        // chunk name -> [fn] run once it is in
    late: [],         // run once bitten.js is done (coreDone)
    core: false,
  };
  C.place = function (id, slots, hooks) {
    const P = { slots: [], hooks: hooks || [], marks: {} };
    for (const [name, get, set] of slots || []) {
      let v; try { v = get(); } catch (e) { continue; }
      if (typeof v !== 'function') continue;              // a new name: nothing outside can have wrapped it before the file
      const S = { name, get, set, saved: v, impl: null };
      const fwd = function () { return (S.impl || S.saved).apply(this, arguments); };
      fwd.chunk14 = id;
      set(fwd); S.fwd = fwd;
      P.slots.push(S);
    }
    for (const h of P.hooks) {
      if (typeof Hooks === 'undefined') break;
      const m = { label: '(' + id + ')', fn(next) { return next.apply(this, [].slice.call(arguments, 1)); }, mark14: true };
      if (!Hooks.lists[h]) Hooks.lists[h] = [];
      Hooks.lists[h].push(m); P.marks[h] = m;
    }
    C.places[id] = P;
  };
  let hookLayer0 = null;
  C.begin = function (id) {
    const P = C.places[id]; if (!P) return;
    for (const S of P.slots) { S.cur = S.get(); S.set(S.saved); }
    hookLayer0 = Hooks.layer;
    Hooks.layer = function (name, label, fn) {
      const m = P.marks[name], L = this.lists[name];
      if (!m || !L || L.indexOf(m) < 0) return hookLayer0.call(this, name, label, fn);
      L.splice(L.indexOf(m), 0, { label, fn });            // below the marker: under every layer of the files after it
    };
  };
  C.end = function (id) {
    const P = C.places[id]; if (!P) return;
    if (hookLayer0) { Hooks.layer = hookLayer0; hookLayer0 = null; }
    for (const S of P.slots) {
      const now = S.get();
      if (now !== S.saved) S.impl = now;
      S.set(S.cur);
    }
  };
  C.loaded = (name) => C.state[name] === 'ready';
  C.load = function (name) {
    if (!C.files[name] || C.state[name] === 'ready') return Promise.resolve(true);
    if (C.proms[name]) return C.proms[name];
    C.state[name] = 'loading';
    C.proms[name] = new Promise((res) => {
      const s = document.createElement('script');
      s.src = C.files[name]; s.async = false;
      s.onload = () => {
        C.state[name] = 'ready';
        for (const fn of C.after[name] || []) { try { fn(); } catch (e) { if (typeof errNote14 === 'function') errNote14(e, 'chunk ' + name); } }
        res(true);
      };
      s.onerror = () => { C.state[name] = 'failed'; C.proms[name] = null; res(false); };
      document.head.appendChild(s);
    });
    return C.proms[name];
  };
  C.loadAll = () => Promise.all(Object.keys(C.files).map(C.load));
  C.onLoad = function (name, fn) { (C.after[name] = C.after[name] || []).push(fn); if (C.loaded(name)) { try { fn(); } catch (e) { /* counted by the caller */ } } };
  C.whenCore = function (fn) { if (C.core) fn(); else C.late.push(fn); };
  C.coreDone = function (files, ids) {
    Object.assign(C.files, files || {}); Object.assign(C.ids, ids || {});
    C.core = true;
    window.__bitten = window.__bitten || {}; window.__bitten.CHUNKS14 = C;   // bitten.js makes window.__bitten anew after this file
    for (const fn of C.late.splice(0)) { try { fn(); } catch (e) { if (typeof errNote14 === 'function') errNote14(e, 'chunks late'); } }
  };
  return C;
})();
if (typeof window !== 'undefined') { window.__bitten = window.__bitten || {}; window.__bitten.CHUNKS14 = CHUNKS14; }
