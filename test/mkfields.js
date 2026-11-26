// v14.10: every Map Maker field survives a share code. Builds a map where every map, floor, room and piece field
// differs from its default, sends it through encodeMap/decodeMap and through the plain MK.cleanMap/MK.compact, and
// compares field by field. A new room field in MK.ROOM_FIELDS without a non-default sample here fails the test.
// Usage: NODE_PATH=$(npm root -g) node test/mkfields.js
const { launch, ROOT } = require('./lib');
const path = require('path');
(async () => {
  const b = await launch();
  const page = await (await b.newContext()).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.waitForFunction(() => window.__bitten && window.__bitten.MK123);
  const res = await page.evaluate(async () => {
    const B = window.__bitten, MK = B.MK123;
    if (MK.ensure) await MK.ensure();
    const ids = ITEM_IDS.slice(0, 6);
    const M = MK.newMap();
    Object.assign(M, { name: 'Round trip', author: 'test', desc: 'every field', it: 'intro', ot: 'outro', char: 'apple', diff: 'hard', items: ids.slice(0, 2) });
    for (const [k, , opts, d] of MK.RULES) { const o = opts.find((x) => x[0] !== d); if (o) M.rules[k] = o[0]; }
    M.pool = { m: 'ban', ids: ids.slice(2, 4) };
    const F = M.floors[0];
    Object.assign(F, { name: 'F1', sub: 'sub', set: 'halls', boss: MK.BOSSES[0], dark: 2, it: 'floor intro', brw: [ids[0], 'rand'] });
    const R = MK.newRoom(5, 4, 'fight');
    Object.assign(R, { m: MK.MODS[1][0], b: MK.MINIS[0] || '', n: 40, st: 'blue', mim: 1, lk: 1, ta: 0, ie: 'enter text', ic: 'clear text', d: { w: 'c' } });
    R.g = MK.EMPTY.slice(0, 13) + '#' + MK.EMPTY.slice(14);
    // one piece of every kind with every parameter off its default
    const pieces = [];
    let c = 1, r = 1;
    for (const t of Object.keys(MK.ENT_PARAMS)) {
      const e = MK.entDefaults ? MK.entDefaults(t) : { t };
      e.t = t; e.c = c; e.r = r;
      for (const p of MK.ENT_PARAMS[t]) {
        if (p.kind === 'col' || p.kind === 'dir8' || p.kind === 'dir8a' || p.kind === 'dir4') e[p.k] = p.def === 2 ? 4 : 2;
        else if (p.kind === 'text') e[p.k] = 'txt';
        else if (p.kind === 'seg' || p.kind === 'sel') { const o = (p.opts || []).map((x) => (Array.isArray(x) ? x[0] : x)).find((v) => v !== p.def); if (o !== undefined) e[p.k] = o; }
        else if (p.kind === 'snake') e[p.k] = MK.SNAKES.find((k) => k !== p.def);
        else if (p.kind === 'item') e[p.k] = 'rare' === p.def ? 'rand' : 'rare';
        else if (typeof p.def === 'number') e[p.k] = p.max != null ? p.max : p.def + 1;
      }
      pieces.push(e);
      if (++c > 9) { c = 1; r++; }
      if (r > 7) break;
    }
    R.e = pieces;
    const SAMPLE = {
      rw: [{ k: 'item', id: 'rare' }], rg: 0, pl: { m: 'only', ids: ids.slice(0, 3) },
      ev: [{ w: 'enter', n: 0, d: 'shout', a: 0, k: 'grub', txt: 'Hi' }], dk: 2, sh: 1.5, tb: 30,
    };
    const missing = [];
    for (const f of MK.ROOM_FIELDS || []) { if (!(f.k in SAMPLE)) missing.push(f.k); else R[f.k] = SAMPLE[f.k]; }
    // rw goes through cleanRw: take what it keeps so the sample is valid
    const pre = MK.cleanRoom(JSON.parse(JSON.stringify(R)));
    Object.assign(R, pre);
    F.rooms.push(R);
    const want = MK.cleanMap(JSON.parse(JSON.stringify(M)));
    const code = await MK.encodeMap(want);
    const back = await MK.decodeMap(code);
    const plain = MK.cleanMap(JSON.parse(JSON.stringify(MK.compact(want))));
    const strip = (x) => { const o = JSON.parse(JSON.stringify(x)); delete o.id; delete o.made; return o; };
    const diffs = [];
    const cmp = (a, b2, p) => {
      if (typeof a !== typeof b2 || Array.isArray(a) !== Array.isArray(b2)) { diffs.push(p); return; }
      if (a && typeof a === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b2)])) cmp(a[k], b2[k], p + '.' + k); return; }
      if (a !== b2) diffs.push(p + ' ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b2));
    };
    cmp(strip(want), strip(back), 'code');
    cmp(strip(want), strip(plain), 'plain');
    const wr = want.floors[0].rooms[1];
    const changed = Object.keys(SAMPLE).filter((k) => JSON.stringify(wr[k]) !== JSON.stringify(MK.newRoom(0, 0)[k]));
    return { diffs, missing, fields: (MK.ROOM_FIELDS || []).map((f) => f.k), changed, pieces: pieces.length, sameAlias: MK.cleanMap(want).pool.m === 'ban' };
  });
  const out = [];
  const ok = (n, c, i = '') => { out.push(`${c ? 'PASS' : 'FAIL'} ${n}${i ? ': ' + i : ''}`); if (!c) process.exitCode = 1; };
  ok('ROOM_FIELDS has the v12.5 to v14.9 room fields', ['rw', 'rg', 'pl', 'ev', 'dk', 'sh', 'tb'].every((k) => res.fields.includes(k)), res.fields.join(' '));
  ok('every room field has a sample', res.missing.length === 0, res.missing.join(' '));
  ok('every sample differs from the default', res.changed.length === res.fields.length, res.changed.join(' '));
  ok(`share code round trip (${res.pieces} pieces)`, res.diffs.length === 0, res.diffs.slice(0, 6).join(' | '));
  ok('MK.cleanMap keeps newer fields', res.sameAlias);
  ok('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  console.log(out.join('\n'));
  await b.close();
})();
