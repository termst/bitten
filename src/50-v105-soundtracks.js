/* src/50-v105-soundtracks.js: v10.5: Soundtracks tab. From v10.5. Lines 22410 to 22487 of the v13.7 script. */
/* ===== v10.5: Soundtracks tab in How to play ===== */
(function () {
  'use strict';
  if (typeof HOW_TABS9 !== 'undefined' && !HOW_TABS9.includes('music')) HOW_TABS9.push('music');
  const root = document.getElementById('jukebox'); if (!root) return;
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const BR = BittenRemix;
  const TRACKS = [
    { id: 'full', name: 'Rotten Waltz (Bite Remix)', sub: 'The whole song, intro to outro', kind: 'remix', from: 0, dur: BR.DURATION },
  ].concat(BR.SECTIONS.map((s) => ({ id: s.id, name: 'Remix: ' + s.name, sub: s.bars + ' bars of the remix', kind: 'remix', from: s.start, dur: s.end - s.start, loopable: true })))
   .concat([
    { id: 'death', name: 'Game Over (Epic Remix)', sub: 'Plays when you die', kind: 'death', dur: window.__deathSong ? window.__deathSong.dur : 30 },
    { id: 'box', name: 'Music Box Waltz', sub: 'The original menu song', kind: 'box', dur: 0 },
  ]);

  const J = { cur: null, loop: false, src: null, t0: 0, timer: null, bus: null };
  window.__jukebox = false;

  root.innerHTML = '<p class="intro9">Pick a track to hear it. Sound has to be on.</p>' +
    '<label class="jbloop"><input type="checkbox" id="jbLoop"> Loop sections</label><div class="jblist"></div>';
  const list = root.querySelector('.jblist');
  const rows = {};
  for (const t of TRACKS) {
    const r = document.createElement('div'); r.className = 'jbrow';
    r.innerHTML = '<button type="button" class="jbplay" aria-label="Play ' + t.name + '"></button><div class="jbtxt"><b>' + t.name + '</b><span>' + t.sub + (t.dur ? ' · ' + fmt(t.dur) : '') + '</span><div class="jbbar"><i></i></div></div>';
    r.querySelector('.jbplay').addEventListener('click', () => (J.cur === t.id ? stop() : play(t)));
    list.appendChild(r); rows[t.id] = r;
  }
  root.querySelector('#jbLoop').addEventListener('change', (e) => { J.loop = e.target.checked; });

  function paint() {
    for (const id in rows) { const on = J.cur === id; rows[id].classList.toggle('on', on); rows[id].querySelector('.jbplay').textContent = on ? '■' : '▶'; if (!on) rows[id].querySelector('.jbbar i').style.width = '0'; }
  }
  function stop() {
    const c = Sfx.ctx;
    if (J.src) { try { J.src.onended = null; J.src.stop(); } catch (e) { /* ignore */ } J.src = null; }
    if (J.cur === 'death' && window.__deathSong) window.__deathSong.stop();
    if (J.cur === 'box') Sfx.stopMusic();
    if (J.bus) { try { J.bus.disconnect(); } catch (e) { /* ignore */ } J.bus = null; }
    clearInterval(J.timer); J.timer = null; J.cur = null; window.__jukebox = false; paint();
  }
  function play(t) {
    stop(); Sfx.init(); Sfx.resume(); const c = Sfx.ctx; if (!c || !Sfx.master) return;
    window.__jukebox = true; J.cur = t.id; paint();
    if (typeof DJ !== 'undefined') DJ.stop(0.2, true);
    J.t0 = c.currentTime;
    if (t.kind === 'remix') {
      rows[t.id].classList.add('load');
      BR.render(c.sampleRate).then((buf) => {
        rows[t.id].classList.remove('load');
        if (J.cur !== t.id) return;
        const bus = c.createGain(); bus.gain.value = 0.7; bus.connect(Sfx.master); J.bus = bus;
        const s = c.createBufferSource(); s.buffer = buf; s.connect(bus);
        if (J.loop && t.loopable) { s.loop = true; s.loopStart = t.from; s.loopEnd = t.from + t.dur; }
        s.onended = () => { if (J.cur === t.id) stop(); };
        J.t0 = c.currentTime + 0.05; s.start(J.t0, t.from, J.loop && t.loopable ? undefined : t.dur); J.src = s;
      }).catch(() => stop());
    } else if (t.kind === 'death' && window.__deathSong) { window.__deathSong.play(c); }
    else if (t.kind === 'box') { Sfx.startMusic(); }
    J.timer = setInterval(() => {
      if (!J.cur) return;
      if (t.kind === 'box') { try { (Sfx.oldWaltz || Sfx.musicTick).call(Sfx); } catch (e) { /* ignore */ } return; }
      const e = c.currentTime - J.t0;
      if (t.kind === 'death' && e > t.dur) { stop(); return; }
      const f = t.dur ? ((e % t.dur) / t.dur) : 0;
      rows[t.id].querySelector('.jbbar i').style.width = Math.max(0, Math.min(1, f)) * 100 + '%';
    }, 120);
  }
  paint();

  /* leaving the guide stops the player */
  const close = UI.closeHow;
  UI.closeHow = function () { stop(); return close.apply(this, arguments); };
  const tabs = document.getElementById('howTabs');
  if (tabs) tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b && b.dataset.tab !== 'music') stop(); });
})();


