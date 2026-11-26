/* 74.js section 04: store. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. @chunk maker */
(function (M74) {
  'use strict';
  const { BOSSES, CH_COLS, CH_NAMES, DARK, DARK_V, DIFF_OPTS, DIRS, DIR_NAMES, EMPTY, ENTS, ENT_PARAMS, FH, FIXED, FW, GRID_OK, LIMITS, MINIS, MIRX, MIRY, MK, MODS, MOUTH, NEEDS, OPPS, RT, RTYPES, RULES, RULE_DEF, SETS, SIDES, SNAKES, SPAWN_CH, TILE, TILES, cellCh, cleanEnt, cleanRoom, cloneMap, codeError, decodeMap, doorsOf, edgeOf, encodeMap, entAt, entDefaults, looksLikeCode, newRoom, roomAt, setCh, setDef, setEdge, setName, typeTemplate, uid } = M74;
  /* ================================================================== 4. your maps, kept in this browser */
  const MAPS_KEY = 'bitten.maps.v1';
  const Store = {
    list: [], last: '', loaded: false,
    load() {
      if (this.loaded) return;
      this.loaded = true;
      try {
        const d = JSON.parse(localStorage.getItem(MAPS_KEY) || 'null');
        if (d && Array.isArray(d.maps)) {
          for (const it of d.maps) { try { const M = M74.cleanMap(it.map); M.id = it.map && it.map.id ? M.id : uid(); this.list.push({ id: M.id, t: Number(it.t) || 0, map: M }); } catch (e) { /* skip a broken one */ } }
          this.last = typeof d.last === 'string' ? d.last : '';
        }
      } catch (e) { /* storage unavailable */ }
    },
    save() {
      try { localStorage.setItem(MAPS_KEY, JSON.stringify({ v: 1, last: this.last, maps: this.list.map((it) => ({ t: it.t, map: compactKeepId(it.map) })) })); return true; } catch (e) { return false; }
    },
    get(id) { this.load(); return this.list.find((it) => it.id === id) || null; },
    put(M) {
      this.load();
      let it = this.get(M.id);
      if (!it) { it = { id: M.id, t: 0, map: null }; this.list.unshift(it); }
      it.map = cloneMap(M); it.t = Date.now(); this.last = M.id;
      this.list.sort((a, b) => b.t - a.t);
      return this.save();
    },
    del(id) { this.load(); this.list = this.list.filter((it) => it.id !== id); if (this.last === id) this.last = ''; this.save(); },
  }; M74.Store = Store;
  function compactKeepId(M) { const o = M74.compact(M); o.id = M.id; o.made = M.made; return o; }

  Object.assign(MK, { TILES, TILE, ENTS, ENT_PARAMS, RTYPES, RT, SNAKES, BOSSES, MINIS, SETS, setDef, setName, newMap: M74.newMap, newFloor: M74.newFloor, newRoom, cleanMap: M74.cleanMap, cleanRoom, cleanEnt, cloneMap,
    encodeMap, decodeMap, compact: M74.compact, Store, edgeOf, setEdge, doorsOf, roomAt, entAt, cellCh, setCh, typeTemplate, NEEDS, FIXED, MODS, RULES, RULE_DEF, DARK, DARK_V, DIFF_OPTS, LIMITS,
    CH_COLS, CH_NAMES, DIRS, DIR_NAMES, MOUTH, SIDES, OPPS, GRID_OK, SPAWN_CH, codeError, looksLikeCode, entDefaults, MIRX, MIRY, EMPTY, FW, FH });

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
