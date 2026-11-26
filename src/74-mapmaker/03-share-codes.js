/* 74.js section 03: share-codes. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through M74. */
(function (M74) {
  'use strict';
  const { EMPTY, ENT_PARAMS, ROOM_FIELDS, RULE_DEF, uid } = M74;
  M74.compact = compact; M74.encodeMap = encodeMap; M74.decodeMap = decodeMap;
  /* ================================================================== 3. share codes */
  // BITMAP1.<base64url of the deflated JSON>.<4 character check>; BITMAP0 is the same without the compression
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function b64url(bytes) {
    let s = '', i = 0;
    for (; i + 2 < bytes.length; i += 3) { const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]; s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63]; }
    if (i < bytes.length) {
      const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8);
      s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < bytes.length ? B64[n >> 6 & 63] : '');
    }
    return s;
  }
  function unb64url(s) {
    const map = {}; for (let i = 0; i < 64; i++) map[B64[i]] = i;
    const out = new Uint8Array(Math.floor(s.length * 3 / 4));
    let o = 0, i = 0;
    for (; i + 3 < s.length; i += 4) { const n = (map[s[i]] << 18) | (map[s[i + 1]] << 12) | (map[s[i + 2]] << 6) | map[s[i + 3]]; out[o++] = n >> 16 & 255; out[o++] = n >> 8 & 255; out[o++] = n & 255; }
    const rest = s.length - i;
    if (rest >= 2) { const n = (map[s[i]] << 18) | (map[s[i + 1]] << 12) | (rest > 2 ? map[s[i + 2]] << 6 : 0); out[o++] = n >> 16 & 255; if (rest > 2) out[o++] = n >> 8 & 255; }
    return out.slice(0, o);
  }
  const checkOf = (s) => (hashStr(s) % 1679616).toString(36).padStart(4, '0');
  async function pipeBytes(bytes, St, fmt) {
    const stream = new Blob([bytes]).stream().pipeThrough(new St(fmt));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  // a smaller copy for the code: everything that is still the default is left out
  function compact(M) {
    const o = { v: 1, name: M.name };
    if (M.author) o.author = M.author;
    if (M.desc) o.desc = M.desc;
    if (M.it) o.it = M.it;
    if (M.ot) o.ot = M.ot;
    if (M.char) o.char = M.char;
    if (M.diff) o.diff = M.diff;
    const ru = {}; let any = false;
    for (const k in RULE_DEF) if (M.rules[k] !== RULE_DEF[k]) { ru[k] = M.rules[k]; any = true; }
    if (any) o.rules = ru;
    if (M.items.length) o.items = M.items.slice();
    o.floors = M.floors.map((F) => {
      const f = { set: F.set, rooms: [] };
      if (F.name) f.name = F.name; if (F.sub) f.sub = F.sub; if (F.boss !== 'auto') f.boss = F.boss; if (F.dark !== -1) f.dark = F.dark; if (F.it) f.it = F.it;
      for (const R of F.rooms) {
        const r = { x: R.x, y: R.y, t: R.t };
        if (R.g !== EMPTY) r.g = R.g;
        if (R.e.length) r.e = R.e.map((e) => { const q = { t: e.t, c: e.c, r: e.r }; for (const p of ENT_PARAMS[e.t]) if (e[p.k] !== p.def) q[p.k] = e[p.k]; return q; });
        if (R.m) r.m = R.m; if (R.b) r.b = R.b; if (R.n !== 25) r.n = R.n; if (R.st) r.st = R.st; if (R.mim) r.mim = 1; if (R.lk) r.lk = 1; if (!R.ta) r.ta = 0; if (R.ie) r.ie = R.ie; if (R.ic) r.ic = R.ic;
        const d = {}; let dd = false; for (const k in R.d) { d[k] = R.d[k]; dd = true; }
        if (dd) r.d = d;
        for (const fd of ROOM_FIELDS) { const v = fd.out(R[fd.k]); if (v !== undefined) r[fd.k] = v; }
        f.rooms.push(r);
      }
      return f;
    });
    return o;
  }
  async function encodeMap(M) {
    const json = JSON.stringify(M74.compact(M));
    const bytes = new TextEncoder().encode(json);
    let head = 'BITMAP0.', body = bytes;
    if (typeof CompressionStream === 'function') {
      try { body = await pipeBytes(bytes, CompressionStream, 'deflate'); head = 'BITMAP1.'; } catch (e) { head = 'BITMAP0.'; body = bytes; }
    }
    const b = b64url(body);
    return head + b + '.' + checkOf(b);
  }
  const CODE_RE = /BITMAP([01])\.([A-Za-z0-9_-]+)\.([0-9a-z]{4})/;
  const looksLikeCode = (t) => /BITMAP[01]\./.test(String(t || '')); M74.looksLikeCode = looksLikeCode;
  async function decodeMap(txt) {
    const m = CODE_RE.exec(String(txt || '').replace(/\s+/g, ''));
    if (!m) throw new Error('nocode');
    if (checkOf(m[2]) !== m[3]) throw new Error('damaged');
    let bytes = unb64url(m[2]);
    if (m[1] === '1') {
      if (typeof DecompressionStream !== 'function') throw new Error('oldbrowser');
      bytes = await pipeBytes(bytes, DecompressionStream, 'deflate');
    }
    if (bytes.length > 600000) throw new Error('toobig');
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    const M = M74.cleanMap(obj);
    M.id = uid();
    return M;
  }
  const CODE_ERR = {
    nocode: 'That is not a map code. A map code starts with BITMAP.',
    damaged: 'That code is damaged. A part of it is missing or changed.',
    oldbrowser: 'This browser can not unpack map codes. Try a newer one.',
    toobig: 'That map is too big to load.',
  };
  const codeError = (e) => CODE_ERR[e && e.message] || 'That code could not be read.'; M74.codeError = codeError;

})(window.__bitten.M74 || (window.__bitten.M74 = {}));
