// Preview clip of SIX SEVEN: frames of a scripted fight (god mode), then ffmpeg makes an mp4 and a gif.
// Usage: NODE_PATH=$(npm root -g) node test/six67-clip.js outdir
const { launch, ROOT } = require('./lib');
const fakeClockInit = require('./fakeclock');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'test', 'out', 'clip67'));
const FR = path.join(OUT, 'frames');
(async () => {
  fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
  const b = await launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') ? r.continue() : r.abort()));
  await page.addInitScript(fakeClockInit);
  await page.goto('file://' + path.resolve(ROOT, 'index.html'));
  await page.evaluate(async () => {
    const B = window.__bitten, G = B.G;
    await window.__advance(300);
    B.H67.CFG.next = true; B.Save.data.char = 'apple';
    B.Game.toMenu(); B.Game.startRun(false, 'arcade');
    for (let i = 0; i < 10; i++) await window.__advance(50);
    B.Game.loadLevel(1);
    for (let i = 0; i < 30; i++) await window.__advance(50);
    G.player.god = true;
    const room = G.map.rooms.find((q) => q.type === 'hype67');
    B.Game.enterRoom(room, Object.keys(room.doors)[0]);
  });
  let f = 0;
  const frame = async () => { await page.screenshot({ path: path.join(FR, String(f++).padStart(4, '0') + '.png') }); };
  // one frame of game time, the apple walks to the nearest pad (or circles), aims at the boss
  const drive = async (n, plan) => {
    for (let i = 0; i < n; i++) {
      const aim = await page.evaluate(async (plan) => {
        const B = window.__bitten, G = B.G, P = G.player, H = G.room.h67, sn = H && H.sn;
        if (plan.pre) (new Function('B', 'G', 'H', plan.pre))(B, G, H);
        let tx = P.x, ty = P.y;
        const p = H && H.pads[0];
        if (plan.pads && p) { tx = p.x; ty = p.y; } else if (sn) { const a = G.t * 0.9; tx = 220 + Math.cos(a) * 120; ty = 180 + Math.sin(a) * 90; }
        const d = Math.hypot(tx - P.x, ty - P.y), sp = 160 / 30;
        if (d > 1) { P.x += ((tx - P.x) / d) * Math.min(sp, d); P.y += ((ty - P.y) / d) * Math.min(sp, d); }
        await window.__advance(33);
        if (!sn) return null;
        const [x, y] = B.View.toScreen(sn.x, sn.y);
        return { x, y };
      }, plan);
      if (aim) { await page.mouse.move(aim.x, aim.y); if (!plan.noFire) await page.mouse.down(); }
      await frame();
    }
  };
  await drive(90, { noFire: true });                      // intro: 6, 7, SIX SEVEN
  await drive(150, { pads: true });                       // stage 1, pads on the beat
  await drive(140, { pre: 'if (H.hype < 1 && !H.mode67) H.hype = Math.max(H.hype, 0.97);' });   // SIX SEVEN MODE
  await drive(10, { pre: 'const s = H.sn; for (let i = 0; i < 6 && (s.stage14 || 1) < 3; i++) { s.stagePend14 = true; } ' });
  await page.evaluate(async () => { const H = window.__bitten.G.room.h67, s = H.sn; s.hp = s.maxHp * 0.6; for (let i = 0; i < 40; i++) await window.__advance(33); s.hp = s.maxHp * 0.3; for (let i = 0; i < 80; i++) await window.__advance(33); H.mode67 = 0.01; });
  await drive(150, {});                                   // stage 3: double time
  await drive(110, { pre: 'if (!H.mode67 && H.modes < 2) H.hype = 1;' });
  await page.evaluate(async () => { const s = window.__bitten.G.room.h67.sn; s.hp = 1; s.hurt(50, s.x, s.y); });
  await drive(90, {});
  await page.mouse.up();
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(FR, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-vf', 'scale=960:-2', path.join(OUT, 'six67-preview.mp4')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(OUT, 'six67-preview.mp4'), '-vf', 'fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer', path.join(OUT, 'six67-preview.gif')]);
  console.log('frames', f, OUT);
})();
