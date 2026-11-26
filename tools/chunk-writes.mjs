// v14.10: lists what a lazy chunk changes outside itself: global names it assigns and properties of global objects it sets,
// and Hooks.layer names. The build's chunk guard (src/73-chunks.js) must reserve a slot for each wrapped one, so a chunk that
// loads late still sits at its old place in every wrapper chain.
// Usage: node tools/chunk-writes.mjs <file.js>...   (needs espree and eslint-scope, like split-iife.mjs)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(process.env.SPLIT_DEPS || import.meta.url);
const espree = require('espree');
const eslintScope = require('eslint-scope');
const globals = new Map(), props = new Map(), hooks = new Set();
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  const ast = espree.parse(src, { ecmaVersion: 'latest', sourceType: 'script', range: true, loc: true });
  const sm = eslintScope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' });
  const gscope = sm.globalScope;
  const isGlobal = (id) => { const ref = gscope.through.find((r) => r.identifier === id); return !!ref; };
  const throughIds = new Set(gscope.through.map((r) => r.identifier));
  (function walk(n, fnDepth) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'AssignmentExpression') {
      const L = n.left;
      if (L.type === 'Identifier' && throughIds.has(L)) globals.set(L.name, (globals.get(L.name) || []).concat(`${f.split('/').pop()}:${L.loc.start.line}`));
      if (L.type === 'MemberExpression' && !L.computed && L.object.type === 'Identifier' && throughIds.has(L.object) && /Function/.test(n.right.type)) {
        const k = L.object.name + '.' + L.property.name;
        props.set(k, (props.get(k) || []).concat(`${f.split('/').pop()}:${L.loc.start.line}`));
      }
    }
    if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.object.name === 'Hooks' && n.callee.property.name === 'layer' && n.arguments[0] && n.arguments[0].type === 'Literal') hooks.add(n.arguments[0].value);
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach((x) => walk(x)); else if (v && typeof v === 'object' && v.type) walk(v); }
  })(ast);
}
console.log('globals assigned:'); for (const [k, v] of globals) console.log('  ' + k + '  ' + v.join(' '));
console.log('global object properties set to a function:'); for (const [k, v] of props) console.log('  ' + k + '  ' + v.join(' '));
console.log('Hooks.layer: ' + [...hooks].join(', '));
