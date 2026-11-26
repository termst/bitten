// v14.10: split one big src file, written as a single IIFE, into section files that share that IIFE's scope through an object.
// Usage: node tools/split-iife.mjs <src file> <out dir> <param> <spec.json> [--dry]
//   spec.json: [[startLine, "name"], ...]  the first entry starts at the IIFE prelude ('use strict' line + 1 works).
// Every top level name of the IIFE that another section uses travels in the scope object <param>:
//   * a name that is reassigned anywhere, or used by a section before the one that declares it, is read and written as
//     <param>.name everywhere (so a later wrapper, `compact = function ...`, reaches every caller, as before);
//   * any other shared name is exported once (<param>.name = name) right where it is declared and destructured at the top
//     of each later section that reads it.
// Needs espree and eslint-scope (npm i --no-save espree eslint-scope). Not used by the build: the output is plain src files.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(process.env.SPLIT_DEPS || import.meta.url);
const espree = require('espree');
const eslintScope = require('eslint-scope');

const [file, outDir, P, specFile] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
const src = fs.readFileSync(file, 'utf8');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const ast = espree.parse(src, { ecmaVersion: 'latest', sourceType: 'script', range: true, loc: true, comment: true });
const sm = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' });

// the IIFE
const stmt = ast.body.find((s) => s.type === 'ExpressionStatement' && s.expression.type === 'CallExpression' && /Function/.test(s.expression.callee.type));
if (!stmt) throw new Error('no top level IIFE');
const fn = stmt.expression.callee;
const fscope = sm.acquire(fn);
const body = fn.body.body;
const lineStart = []; { let o = 0; for (const l of src.split('\n')) { lineStart.push(o); o += l.length + 1; } }
const off = (line) => lineStart[line - 1];
const secs = spec.map(([line, name], i) => ({ i, name, start: off(line), end: i + 1 < spec.length ? off(spec[i + 1][0]) : fn.body.range[1] - 1 }));
const secOf = (pos) => { for (const s of secs) if (pos >= s.start && pos < s.end) return s.i; return -1; };
// the prelude before the first section ('use strict')
const bodyStart = fn.body.range[0] + 1;
if (secs[0].start < bodyStart) throw new Error('first section starts before the IIFE body');
for (const st of body) {
  const a = secOf(st.range[0]), b = secOf(st.range[1] - 1);
  if (st.type === 'ExpressionStatement' && st.directive) continue;
  if (a < 0 || a !== b) throw new Error(`statement at line ${st.loc.start.line} crosses a section line (${a} to ${b})`);
}
// shorthand properties: {name} must become {name: P.name}
const shorthand = new Set(), callee = new Set();
(function walk(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'Property' && n.shorthand) shorthand.add(n.value.type === 'AssignmentPattern' ? n.value.left.range[0] : n.value.range[0]);
  if ((n.type === 'CallExpression' || n.type === 'NewExpression') && n.callee.type === 'Identifier') callee.add(n.callee.range[0]);
  if (n.type === 'UnaryExpression' && n.operator === 'typeof' && n.argument.type === 'Identifier') callee.add(n.argument.range[0]);
  for (const k in n) { if (k === 'parent') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object' && v.type) walk(v); }
})(fn.body);

const info = [], fwd = [];
for (const v of fscope.variables) {
  if (v.name === 'arguments') continue;
  const def = v.defs[0]; if (!def) continue;
  const dsec = secOf(def.name.range[0]);
  if (v.defs.length > 1) throw new Error(`${v.name} declared twice`);
  const refs = v.references.map((r) => ({ r, sec: secOf(r.identifier.range[0]) }));
  const writes = refs.filter((x) => x.r.isWrite() && !(x.r.init));
  const other = refs.filter((x) => x.sec !== dsec);
  const forward = other.some((x) => x.sec < dsec);
  const reassigned = writes.length > 0;
  if (!other.length) continue;
  const live = reassigned || (forward && def.type === 'Variable' && def.parent.kind !== 'const');
  info.push({ v, name: v.name, def, dsec, refs, other, forward, reassigned, live });
}
const edits = secs.map(() => []);
const imports = secs.map(() => new Set());
const topExports = secs.map(() => []);
for (const x of info) {
  const { name, def, dsec } = x;
  if (x.live) {
    for (const { r, sec } of x.refs) {
      if (r.init && def.type === 'Variable') continue; // the declaration itself, handled below
      const id = r.identifier;
      edits[sec].push([id.range[0], id.range[1], shorthand.has(id.range[0]) ? `${name}: ${P}.${name}` : `${P}.${name}`]);
    }
    if (def.type === 'FunctionName') topExports[dsec].push(`${P}.${name} = ${name};`);
    else if (def.type === 'Variable') {
      const decl = def.parent;
      if (!body.includes(decl)) throw new Error(`${name}: live variable declared inside a block (line ${decl.loc.start.line})`);
      if (decl.kind === 'const') throw new Error(`${name}: const can not be live`);
      if (!decl.__done) {
        decl.__done = true;
        const parts = decl.declarations.map((d) => {
          const lv = info.find((y) => y.def.node === d && y.live);
          const init = d.init ? src.slice(d.init.range[0], d.init.range[1]) : 'undefined';
          if (lv) return `${P}.${d.id.name} = ${init};`;
          return `${decl.kind} ${src.slice(d.range[0], d.range[1])};`;
        });
        edits[dsec].push([decl.range[0], decl.range[1], parts.join(' ')]);
      }
    } else throw new Error(`${name}: live ${def.type} not handled`);
  } else {
    // export where declared, import into later sections, P.name for earlier ones
    if (def.type === 'FunctionName') topExports[dsec].push(`${P}.${name} = ${name};`);
    else {
      const decl = def.type === 'Variable' ? def.parent : def.node;
      if (!body.includes(decl)) throw new Error(`${name}: shared name declared inside a block (line ${decl.loc.start.line})`);
      edits[dsec].push([decl.range[1], decl.range[1], ` ${P}.${name} = ${name};`]);
    }
    for (const { r, sec } of x.other) {
      if (sec > dsec) imports[sec].add(name);
      else {
        const id = r.identifier;
        if (r.isWrite()) throw new Error(`${name}: written before its section`);
        // a hoisted function used as a value before its section (a table entry at load time): a forwarder keeps it callable
        let t = `${P}.${name}`;
        if (def.type === 'FunctionName' && !callee.has(id.range[0])) { t = `(function () { return ${P}.${name}.apply(this, arguments); })`; fwd.push(name); }
        edits[sec].push([id.range[0], id.range[1], shorthand.has(id.range[0]) ? `${name}: ${t}` : t]);
      }
    }
  }
}
// a local declaration in a section must not shadow an import of the same name there (it can not: same IIFE scope)
const header = (s) => `/* ${path.basename(file)} section ${String(s.i).padStart(2, '0')}: ${s.name}. Split by tools/split-iife.mjs (v14.10); shares the old IIFE scope through ${P}. */\n`;
const files = [];
const scopeExpr = `window.__bitten.${P} || (window.__bitten.${P} = {})`;
for (const s of secs) {
  let text = src.slice(s.start, s.end);
  const es = edits[s.i].slice().sort((a, b) => b[0] - a[0]);
  let last = Infinity;
  for (const [a, b, t] of es) {
    if (b > last) throw new Error('overlapping edits in section ' + s.i);
    text = text.slice(0, a - s.start) + t + text.slice(b - s.start); last = a;
  }
  const imp = [...imports[s.i]].sort();
  const top = topExports[s.i];
  const head = `(function (${P}) {\n  'use strict';\n` + (imp.length ? `  const { ${imp.join(', ')} } = ${P};\n` : '') + (top.length ? '  ' + top.join(' ') + '\n' : '');
  const out = header(s) + (s.i === 0 ? src.slice(0, src.lastIndexOf('\n', stmt.range[0]) + 1).replace(/^\s*$/gm, '') : '') + head + text.replace(/^\s*'use strict';\n/, '') + `})(window.__bitten = window.__bitten || {}, ${scopeExpr});\n`;
  files.push([`${String(s.i).padStart(2, '0')}-${s.name}.js`, out]);
}
// the param list: (P) only; fix the call above to pass one argument
for (const f of files) f[1] = f[1].replace(`})(window.__bitten = window.__bitten || {}, ${scopeExpr});\n`, `})(${scopeExpr});\n`);
const live = info.filter((x) => x.live).map((x) => x.name);
const shared = info.filter((x) => !x.live).map((x) => x.name);
console.log(`${info.length} shared names: ${live.length} live (${P}.name), ${shared.length} exported once`);
console.log('live: ' + live.join(' '));
if (fwd.length) console.log('forwarders (function values used before their section): ' + fwd.join(' '));
if (!dry) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [n, t] of files) fs.writeFileSync(path.join(outDir, n), t);
  console.log(files.map(([n, t]) => `${n} ${t.split('\n').length} lines`).join('\n'));
}
