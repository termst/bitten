// Welch t-test per character and pooled, for a bot.json with two builds. Usage: node test/stats.js test/out/x.json
const all = require(require('path').resolve(process.argv[2]));
const [A, B] = Object.keys(all);
const m = (a) => a.reduce((s, v) => s + v, 0) / a.length, v = (a) => { const mu = m(a); return a.reduce((s, x) => s + (x - mu) ** 2, 0) / (a.length - 1); };
const t = (a, b) => (m(a) - m(b)) / Math.sqrt(v(a) / a.length + v(b) / b.length || 1e-9);
const keys = ['floor', 'kills', 'dmg', 'time'];
const pool = { [A]: {}, [B]: {} };
for (const ch of Object.keys(all[A])) {
  const row = [ch.padEnd(7)];
  for (const k of keys) {
    const a = all[A][ch].map((r) => r[k]), b = (all[B][ch] || []).map((r) => r[k]);
    (pool[A][k] = pool[A][k] || []).push(...a); (pool[B][k] = pool[B][k] || []).push(...b);
    const tv = t(a, b); row.push(`${k} ${m(a).toFixed(1)}/${m(b).toFixed(1)} t=${tv.toFixed(2)}${Math.abs(tv) > 2.0 ? '*' : ''}`);
  }
  console.log(row.join('  '));
}
console.log('pooled ' + keys.map((k) => `${k} ${m(pool[A][k]).toFixed(2)}/${m(pool[B][k]).toFixed(2)} t=${t(pool[A][k], pool[B][k]).toFixed(2)}`).join('  '));
