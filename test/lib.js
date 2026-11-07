// Shared test helpers. Playwright comes from a global install (NODE_PATH=$(npm root -g)) or a local one.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

function serve(port = 0, root = ROOT) {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      const body = fs.readFileSync(f);
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': body.length });
      rsp.end(body);
    });
    s.listen(port, '127.0.0.1', () => res(s));
  });
}

async function launch() { return chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); }

// offline: abort every request that is not file:// or localhost
async function open(browser, url, opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 800 }, acceptDownloads: true }, opts.ctx || {}));
  const page = await ctx.newPage();
  const log = { errors: [], console: [], requests: [], aborted: [] };
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u.startsWith('file://') || u.startsWith('http://127.0.0.1') || u.startsWith('http://localhost') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue();
    log.aborted.push(u); return r.abort();
  });
  page.on('pageerror', (e) => log.errors.push(String(e && e.stack || e)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.console.push(m.type() + ': ' + m.text()); });
  page.on('response', async (r) => { try { const b = await r.body(); log.requests.push([r.url(), b.length]); } catch (e) { /* redirects */ } });
  if (opts.init) await page.addInitScript(opts.init);
  await page.goto(url);
  await page.waitForFunction(() => window.__bitten && window.__bitten.Game);
  return { ctx, page, log };
}

// the reliable way to start a run (see the v14 prompt, section 0)
async function startRun(page, char = 'apple', mode = 'arcade', skin = 0) {
  await page.evaluate(([id, mode, skin]) => {
    const B = window.__bitten; const { Save, Game } = B;
    Save.data.unlocks[id] = true; Save.data.char = id;
    if (B.SKINS24) B.SKINS24.setSkin(id, skin);
    Game.toMenu(); Game.startRun(false, mode);
  }, [char, mode, skin]);
  await page.waitForFunction(() => window.__bitten.G.state === 'play', null, { timeout: 15000 });
}

module.exports = { serve, launch, open, startRun, ROOT };
