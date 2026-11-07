// Online lifecycle over ?net=local: lobby, start, a guest leaves mid run (its apple goes away, the run goes on),
// the host goes back to the lobby (everyone follows), a second run starts, a stranger cannot join a running run.
// Usage: NODE_PATH=$(npm root -g) node test/netlife.js
const { launch, serve } = require('./lib');
(async () => {
  const srv = await serve(0); const url = `http://127.0.0.1:${srv.address().port}/index.html?net=local`;
  const b = await launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  const errs = [], pages = [];
  for (let i = 0; i < 4; i++) { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`p${i}: ${e.message}`)); await p.goto(url); await p.waitForFunction(() => window.__bitten && window.__bitten.net14); pages.push(p); }
  const [H, A, Bp, X] = pages, wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const res = {}; const ok = (k, v) => { res[k] = v; };
  // the lobby through the real buttons
  await H.evaluate(() => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); });
  await H.click('#coop14 [data-a="host"]');
  await H.waitForFunction(() => window.__bitten.net14.S.code && /Waiting/.test(window.__bitten.net14.S.status));
  const code = await H.evaluate(() => window.__bitten.net14.S.code);
  for (const g of [A, Bp]) {
    await g.evaluate(() => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); });
    await g.fill('#coop14 input.cd', code); await g.click('#coop14 [data-a="join"]');
  }
  await H.waitForFunction(() => window.__bitten.net14.S.members.length === 3);
  ok('lobby cards on guest', await A.evaluate(() => document.querySelectorAll('#coop14 .net14-m').length));
  await H.click('#coop14 [data-a="start"]');
  for (const p of [H, A, Bp]) await p.waitForFunction(() => window.__bitten.net14.NET.live && window.__bitten.G.state === 'play');
  ok('players', await A.evaluate(() => window.__bitten.G.players.length));
  await wait(3000);
  // a stranger tries to join the running room
  await X.evaluate((c) => { window.__bitten.coop14.open(); window.__bitten.coop14.setTab('online'); window.__bitten.net14.join(c); }, code);
  await wait(1500);
  ok('stranger refused', await X.evaluate(() => window.__bitten.net14.S.err));
  // guest B closes its tab
  await Bp.close();
  await wait(1500);
  ok('away on host', await H.evaluate(() => window.__bitten.G.players[2].away14 === true));
  ok('away on A', await A.evaluate(() => window.__bitten.G.players[2].away14 === true));
  ok('still running', await A.evaluate(() => window.__bitten.net14.NET.live && window.__bitten.G.state));
  await wait(2000);
  const ha = await H.evaluate(() => [...window.__bitten.net14.NET.hist]), aa = await A.evaluate(() => [...window.__bitten.net14.NET.hist]);
  const m = new Map(ha); ok('hash match after leave', aa.filter(([n, h]) => m.has(n)).every(([n, h]) => m.get(n) === h));
  // host goes to the menu: both back in the lobby
  await H.evaluate(() => window.__bitten.Game.toMenu());
  await wait(800);
  ok('A back in lobby', await A.evaluate(() => !window.__bitten.net14.NET.live && !window.__bitten.coopSec14.hidden && window.__bitten.net14.S.role));
  ok('A save restored', await A.evaluate(() => typeof window.__bitten.Save.store === 'function' && window.__bitten.Save.store.toString().length > 40));
  ok('members after leave', await H.evaluate(() => window.__bitten.net14.S.members.filter((m) => m.slot === 0 || (m.link && m.link.open)).length));
  // second run with two
  await H.evaluate(() => window.__bitten.net14.start());
  for (const p of [H, A]) await p.waitForFunction(() => window.__bitten.net14.NET.live && window.__bitten.G.state === 'play');
  ok('second run players', await A.evaluate(() => window.__bitten.G.players.length));
  await wait(3000);
  // host leaves for good: the guest is told
  await H.evaluate(() => window.__bitten.net14.leave());
  await wait(800);
  ok('guest after host left', await A.evaluate(() => [window.__bitten.net14.NET.live, window.__bitten.G.state, window.__bitten.net14.S.err]));
  console.log(JSON.stringify(res, null, 1), errs.slice(0, 5));
  const pass = res['lobby cards on guest'] === 3 && res.players === 3 && /running|already/i.test(res['stranger refused']) && res['away on host'] && res['away on A'] && res['hash match after leave'] &&
    res['A back in lobby'] && res['A save restored'] && res['second run players'] === 2 && res['guest after host left'][0] === false && !errs.length;
  console.log(pass ? 'PASS' : 'FAIL');
  await b.close(); srv.close(); process.exit(pass ? 0 : 1);
})();
