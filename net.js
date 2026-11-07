/* Bitten v14.0 phase 3: online coop. Loaded after bitten.js, shares its global scope.

   Model: host driven lockstep. Every peer runs the same seeded simulation (T8: G.rng, fixed 1/60 s ticks).
   The host owns the clock: each tick it bundles the input of every apple (its own, plus the newest input
   each guest sent) and sends the bundle to everyone. Every peer, the host included, runs tick n only with
   bundle n, so all simulations see the same inputs in the same order. Things that change the game outside
   the tick (a click in the sell or contract panel, a guest leaving) travel inside a bundle as events, so
   they also land on the same tick everywhere.

   Safety net: every 60 ticks each peer hashes the game state. A guest that disagrees with the host asks for
   a repair; the host attaches its state (rng, apples, snakes, seeds, pickups) to a later checkpoint and the
   guest overwrites its copy there.

   Transport: PeerJS (vendor/peerjs.min.js, loaded on first use) over WebRTC data channels, with the public
   PeerJS broker for the handshake. ?net=local swaps in a BroadcastChannel transport: two tabs of the same
   browser, no network (used by test/net.js). */
(function () {
  'use strict';
  const B = window.__bitten = window.__bitten || {};
  const safe = (fn, fb) => { try { return fn(); } catch (e) { try { errNote14(e, 'net'); } catch (e2) { /* ignore */ } return fb; } };
  const T = (s) => (typeof sayF9 === 'function' ? sayF9(s) : s);
  const PROTO = 'bitten-net-14.0-1';
  const STEP = 1 / 60, CHECK = 60, MAXP = 4;
  const ID_PREFIX = 'bitten14-';
  const LINES = ['Host a game', 'Join', 'Room code', 'Leave', 'Copy invite link', 'Link copied', 'Waiting for players', 'Connecting',
    'Connected', 'The host left', 'Could not connect', 'That room is full', 'A run is already going in that room. Wait for the next one.',
    'This room runs another version of Bitten', 'No room with that code', 'Start online run', 'Only the host can start',
    'Needs at least two apples', 'Waiting for the host', 'The host starts the next run', 'Back to the lobby', 'left the game',
    'joined', 'Host', 'You', 'Online play needs the game served over http or https.', 'Share the code or the link. Up to four apples, one room, the host picks the mode.',
    'is choosing', 'Out of sync, repaired', 'Online', 'Mode', 'ping'];
  safe(() => { for (const s of LINES) if (!TEXT_LIT9.messages.includes(s)) TEXT_LIT9.messages.push(s); });

  /* ================================================================ rng with a readable state (repairs) */
  /* same numbers as the mulberry32 in 01-core.js; the returned function can also report and take its state */
  safe(() => {
    mulberry32 = function (a) {
      const f = function () {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      f.getState = () => a | 0; f.setState = (v) => { a = v | 0; };
      return f;
    };
  });
  /* audio draws its own random numbers, so a muted peer and a loud one stay on the same G.rng stream */
  const realRandom = (obj) => safe(() => {
    if (!obj) return;
    for (const k of Object.keys(obj)) {
      const f = obj[k]; if (typeof f !== 'function' || f.net14) continue;
      const w = function () {
        if (!RAND14.on || !NET14.live) return f.apply(this, arguments);
        const keep = Math.random; Math.random = RAND14.real;
        try { return f.apply(this, arguments); } finally { Math.random = keep; }
      };
      w.net14 = true; obj[k] = w;
    }
  });
  realRandom(typeof Sfx !== 'undefined' ? Sfx : null);
  realRandom(typeof DJ !== 'undefined' ? DJ : null);

  /* ================================================================ transports */
  const CODE_ABC = 'BCDFGHJKLMNPQRSTVWXZ';
  const newCode = () => { let s = ''; for (let i = 0; i < 5; i++) s += CODE_ABC[(RAND14.real() * CODE_ABC.length) | 0]; return s; };
  const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  const localMode = () => /[?&]net=local\b/.test(location.search);

  /* a link: send(obj), close(), onmsg(obj), onclose() */
  function makeLink(sendFn, closeFn) { return { send: sendFn, close: closeFn, onmsg: null, onclose: null, open: true }; }

  /* BroadcastChannel transport (tests, two tabs) */
  const LocalNet = {
    host(code, onJoin, onReady, onError) {
      const ch = new BroadcastChannel('bitten-net-' + code), links = new Map();
      let claimed = true;
      ch.onmessage = (e) => {
        const m = e.data; if (!m || m.to !== 'host') return;
        if (m.k === 'probe') { ch.postMessage({ to: m.from, k: 'taken' }); return; }
        if (m.k === 'open') {
          const L = makeLink((o) => ch.postMessage({ to: m.from, k: 'd', d: o }), () => { ch.postMessage({ to: m.from, k: 'close' }); links.delete(m.from); L.open = false; });
          links.set(m.from, L); ch.postMessage({ to: m.from, k: 'ok' }); onJoin(L); return;
        }
        const L = links.get(m.from); if (!L) return;
        if (m.k === 'd' && L.onmsg) L.onmsg(m.d);
        if (m.k === 'close') { links.delete(m.from); L.open = false; if (L.onclose) L.onclose(); }
      };
      setTimeout(() => claimed && onReady(code), 30);
      return { close() { claimed = false; for (const L of links.values()) L.close(); ch.close(); } };
    },
    join(code, onOpen, onError) {
      const ch = new BroadcastChannel('bitten-net-' + code), me = 'g' + ((RAND14.real() * 1e9) >>> 0);
      let L = null, ok = false;
      ch.onmessage = (e) => {
        const m = e.data; if (!m || m.to !== me) return;
        if (m.k === 'ok' && !ok) {
          ok = true;
          L = makeLink((o) => ch.postMessage({ to: 'host', from: me, k: 'd', d: o }), () => { ch.postMessage({ to: 'host', from: me, k: 'close' }); L.open = false; ch.close(); });
          onOpen(L);
        } else if (m.k === 'd' && L && L.onmsg) L.onmsg(m.d);
        else if (m.k === 'close' && L) { L.open = false; if (L.onclose) L.onclose(); ch.close(); }
      };
      ch.postMessage({ to: 'host', from: me, k: 'open' });
      setTimeout(() => { if (!ok) { ch.close(); onError('No room with that code'); } }, 1500);
      return { close() { if (L) L.close(); else ch.close(); } };
    },
  };

  /* PeerJS transport */
  let peerLib = null;
  function loadPeer() {
    if (window.Peer) return Promise.resolve(window.Peer);
    if (peerLib) return peerLib;
    peerLib = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'vendor/peerjs.min.js'; s.async = true;
      s.onload = () => (window.Peer ? res(window.Peer) : rej(new Error('peerjs missing')));
      s.onerror = () => { peerLib = null; rej(new Error('peerjs load failed')); };
      document.head.appendChild(s);
    });
    return peerLib;
  }
  const peerOpts = () => Object.assign({ debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] } }, window.BITTEN_NET_CONFIG || {});
  function wrapConn(conn) {
    const L = makeLink((o) => { if (conn.open) safe(() => conn.send(o)); }, () => { L.open = false; safe(() => conn.close()); });
    conn.on('data', (d) => { if (L.onmsg) L.onmsg(d); });
    const gone = () => { if (!L.open && L.closed14) return; L.open = false; L.closed14 = true; if (L.onclose) L.onclose(); };
    conn.on('close', gone); conn.on('error', gone);
    safe(() => { conn.peerConnection && conn.peerConnection.addEventListener('iceconnectionstatechange', () => { const s = conn.peerConnection.iceConnectionState; if (s === 'failed' || s === 'closed') gone(); }); });
    return L;
  }
  const PeerNet = {
    host(code, onJoin, onReady, onError) {
      let peer = null, dead = false;
      loadPeer().then((Peer) => {
        if (dead) return;
        peer = new Peer(ID_PREFIX + code, peerOpts());
        peer.on('open', () => onReady(code));
        peer.on('connection', (conn) => { conn.on('open', () => onJoin(wrapConn(conn))); });
        peer.on('error', (e) => { const t = e && e.type; onError(t === 'unavailable-id' ? 'taken' : t === 'network' || t === 'server-error' || t === 'socket-error' ? 'Could not connect' : 'Could not connect'); });
        peer.on('disconnected', () => { safe(() => { if (!dead && !peer.destroyed) peer.reconnect(); }); });
      }, () => onError('Could not connect'));
      return { close() { dead = true; if (peer) safe(() => peer.destroy()); } };
    },
    join(code, onOpen, onError) {
      let peer = null, dead = false, ok = false;
      loadPeer().then((Peer) => {
        if (dead) return;
        peer = new Peer(peerOpts());
        peer.on('open', () => {
          const conn = peer.connect(ID_PREFIX + code, { reliable: true, serialization: 'json' });
          conn.on('open', () => { ok = true; onOpen(wrapConn(conn)); });
          setTimeout(() => { if (!ok && !dead) onError('Could not connect'); }, 15000);
        });
        peer.on('error', (e) => { if (ok) return; onError(e && e.type === 'peer-unavailable' ? 'No room with that code' : 'Could not connect'); });
      }, () => onError('Could not connect'));
      return { close() { dead = true; if (peer) safe(() => peer.destroy()); } };
    },
  };
  const Net = () => (localMode() ? LocalNet : PeerNet);

  /* ================================================================ session state */
  const S = {
    role: null,            // 'host' | 'guest' | null
    code: '', status: '', err: '',
    tr: null,              // transport handle
    link: null,            // guest: the link to the host
    members: [],           // host: [{slot, name, char, look, link, in, away}]; guest: [{slot, name, char, look}]
    me: 0,                 // my slot
    running: false,
    ping: 0,
  };
  const NET = NET14;
  NET.S = S;
  Object.assign(NET, { live: false, tick: 0, acc: 0, queue: [], srcs: [], menu: false, decider: -1, desync: 0, repairs: 0, needFix: false, wantFix: false, events: [], keep: null, local: { dashN: 0, pingN: 0 } });

  const myProfile = () => {
    const s = Save.data.settings || {}, names = s.coopNames14 || [];
    const p = S.profile || (S.profile = { name: names[0] || 'P1', char: Save.data.char || 'apple', look: safe(() => B.SKINS24.skinIdx(Save.data.char || 'apple'), 0) || 0 });
    if (p.char !== 'apple' && !Save.data.unlocks[p.char]) p.char = 'apple';
    return p;
  };
  const pubMembers = () => S.members.map((m) => ({ slot: m.slot, name: m.name, char: m.char, look: m.look }));
  const cleanName = (n, slot) => String(n || '').replace(/[<>&"]/g, '').trim().slice(0, 12) || 'P' + (slot + 1);

  /* ================================================================ host */
  function hostOpen() {
    leave(true);
    S.role = 'host'; S.me = 0; S.err = ''; S.status = T('Connecting');
    const p = myProfile();
    S.members = [{ slot: 0, name: cleanName(p.name, 0), char: p.char, look: p.look, link: null, in: null, away: false }];
    let tries = 0;
    const tryCode = () => {
      S.code = newCode();
      S.tr = Net().host(S.code, onGuest, () => { S.status = T('Waiting for players'); paint(); }, (why) => {
        if (why === 'taken' && tries++ < 4) { safe(() => S.tr.close()); tryCode(); return; }
        S.err = T(why); S.status = ''; paint();
      });
    };
    tryCode(); paint();
  }
  function onGuest(L) {
    L.onmsg = (m) => safe(() => hostMsg(L, m));
    L.onclose = () => safe(() => guestGone(L));
    setTimeout(() => { if (!S.members.some((m) => m.link === L) && L.open) L.close(); }, 8000);  /* no hello: drop */
  }
  function hostMsg(L, m) {
    if (!m || typeof m !== 'object') return;
    let mem = S.members.find((x) => x.link === L);
    if (m.t === 'hello') {
      if (m.v !== PROTO) { L.send({ t: 'no', why: 'This room runs another version of Bitten' }); setTimeout(() => L.close(), 300); return; }
      if (S.running) { L.send({ t: 'no', why: 'A run is already going in that room. Wait for the next one.' }); setTimeout(() => L.close(), 300); return; }
      if (S.members.length >= MAXP) { L.send({ t: 'no', why: 'That room is full' }); setTimeout(() => L.close(), 300); return; }
      let slot = 1; while (S.members.some((x) => x.slot === slot)) slot++;
      let nm = cleanName(m.name, slot);
      if (/^P\d$/.test(nm) || S.members.some((x) => x.name === nm)) nm = /^P\d$/.test(nm) ? 'P' + (slot + 1) : (nm.slice(0, 10) + ' ' + (slot + 1));
      mem = { slot, name: nm, char: CHARS[m.char] ? m.char : 'apple', look: m.look | 0, link: L, in: null, away: false, dashN: -1, pingN: -1 };
      S.members.push(mem); S.members.sort((a, b) => a.slot - b.slot);
      lobbyCast(); safe(() => UI.banner(mem.name + ' ' + T('joined'), '')); safe(() => Sfx.pickup());
      return;
    }
    if (!mem) return;
    if (m.t === 'me') { mem.name = cleanName(m.name, mem.slot); if (/^P\d$/.test(mem.name)) mem.name = 'P' + (mem.slot + 1); if (CHARS[m.char]) mem.char = m.char; mem.look = m.look | 0; lobbyCast(); return; }
    if (m.t === 'in') { if (Array.isArray(m.d)) mem.in = m.d; return; }
    if (m.t === 'act') { if (S.running && mem.slot === NET.decider) NET.events.push({ k: 'act', s: mem.slot, a: m.a }); return; }
    if (m.t === 'h') { const mine = NET.hashes && NET.hashes.get(m.n); if (mine != null && mine !== m.h) { NET.desync++; NET.needFix = true; } return; }
    if (m.t === 'fixme') { NET.needFix = true; return; }
    if (m.t === 'p') { L.send({ t: 'P', ts: m.ts }); return; }
    if (m.t === 'leave') { if (S.running) markAway(mem); return; }
    if (m.t === 'bye') { guestGone(L); }
  }
  function markAway(mem) { if (mem.away) return; mem.away = true; NET.events.push({ k: 'away', s: mem.slot }); safe(() => UI.banner(mem.name + ' ' + T('left the game'), '')); }
  function guestGone(L) {
    const mem = S.members.find((x) => x.link === L); if (!mem) return;
    if (S.running) markAway(mem);
    else { S.members = S.members.filter((x) => x !== mem); lobbyCast(); safe(() => UI.banner(mem.name + ' ' + T('left the game'), '')); }
    mem.link = null;
  }
  function lobbyCast() {
    const pub = pubMembers();
    for (const m of S.members) if (m.link && m.link.open) m.link.send({ t: 'lobby', code: S.code, members: pub, you: m.slot, mode: onlineMode() });
    paint();
  }
  const ONLINE_MODES = () => Object.keys(MODES).filter((k) => k !== 'story' && k !== 'daily');
  const onlineMode = () => { const m = Save.data.mode; return ONLINE_MODES().includes(m) ? m : 'arcade'; };
  function hostStart() {
    if (S.role !== 'host') return;
    const live = S.members.filter((m) => m.slot === 0 || (m.link && m.link.open));
    S.members = live;
    if (S.members.length < 2) { safe(() => UI.banner(T('Needs at least two apples'), '')); return; }
    if (NET.live) endRun(false);
    for (const m of S.members) { m.away = false; m.in = null; m.dashN = -1; m.pingN = -1; }
    const seed = (RAND14.real() * 4294967296) >>> 0;
    const msg = { t: 'start', seed, mode: onlineMode(), members: pubMembers(), save: JSON.parse(JSON.stringify(Save.data)), opts: optsNow() };
    for (const m of S.members) if (m.link) m.link.send(msg);
    beginRun(msg);
  }
  const optsNow = () => safe(() => (B.OPTS7 ? JSON.parse(JSON.stringify(B.OPTS7)) : null), null);

  /* ================================================================ guest */
  function guestJoin(code) {
    code = cleanCode(code);
    if (code.length < 4) { S.err = T('No room with that code'); paint(); return; }
    leave(true);
    S.role = 'guest'; S.code = code; S.err = ''; S.status = T('Connecting'); paint();
    S.tr = Net().join(code, (L) => {
      S.link = L; S.status = T('Connected');
      const p = myProfile();
      L.send({ t: 'hello', v: PROTO, name: cleanName(p.name, 1), char: p.char, look: p.look });
      L.onmsg = (m) => safe(() => guestMsg(m));
      L.onclose = () => safe(() => { if (S.role !== 'guest') return; const was = NET.live; leave(true); S.err = T('The host left'); if (was) safe(() => Game.toMenu()); openLobby(); paint(); safe(() => UI.banner(T('The host left'), '')); });
      paint();
    }, (why) => { if (S.role !== 'guest') return; S.err = T(why); S.status = ''; S.role = null; paint(); });
  }
  function guestMsg(m) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'lobby') { S.members = m.members; S.me = m.you; S.code = m.code; S.mode = m.mode; S.status = T('Waiting for the host'); paint(); return; }
    if (m.t === 'no') { S.err = T(m.why); S.status = ''; const L = S.link; S.link = null; S.role = null; safe(() => L && L.close()); paint(); return; }
    if (m.t === 'start') { S.members = m.members; beginRun(m); return; }
    if (m.t === 'b') { if (NET.live) for (const x of m.L) NET.queue.push(x); return; }
    if (m.t === 'lobbyback') { if (NET.live) { endRun(false); safe(() => Game.toMenu()); openLobby(); } return; }
    if (m.t === 'P') { S.ping = Math.round(performance.now() - m.ts); return; }
  }
  function sendMe() {
    const p = myProfile();
    if (S.role === 'guest' && S.link) S.link.send({ t: 'me', name: cleanName(p.name, S.me), char: p.char, look: p.look });
    if (S.role === 'host') { const m = S.members[0]; m.name = cleanName(p.name, 0); m.char = p.char; m.look = p.look; lobbyCast(); }
  }
  function leave(quiet) {
    if (NET.live) endRun(true);
    if (S.role === 'guest' && S.link) { safe(() => S.link.send({ t: 'bye' })); const L = S.link; S.link = null; setTimeout(() => safe(() => L.close()), 50); }
    if (S.role === 'host') for (const m of S.members) if (m.link) { const L = m.link; m.link = null; safe(() => L.send({ t: 'bye' })); setTimeout(() => safe(() => L.close()), 50); }
    if (S.tr) { const tr = S.tr; S.tr = null; setTimeout(() => safe(() => tr.close()), 80); }
    S.role = null; S.members = []; S.code = ''; S.status = ''; S.running = false;
    if (!quiet) paint();
  }

  /* ================================================================ the run */
  /* an input source fed by the bundles (every apple online uses one, also my own) */
  class NetSource {
    constructor(slot) { this.kind = 'net'; this.slot = slot; this.mx = 0; this.my = 0; this.aim = null; this.dq = 0; this.pq = 0; this.spot = null; }
    set(a) {
      if (!a) { this.mx = 0; this.my = 0; this.aim = null; this.spot = null; return; }
      this.mx = a[0]; this.my = a[1];
      this.aim = a[2] == null ? null : { x: a[2], y: a[3], touch: !!a[4] };
      this.dq += a[5] | 0; this.pq += a[6] | 0;
      this.spot = a[7] == null ? null : { x: a[7], y: a[8] };
    }
    moveVec() { return { x: this.mx, y: this.my }; }
    aimVec() { return this.aim ? { x: this.aim.x, y: this.aim.y, touch: this.aim.touch } : null; }
    dash() { if (this.dq > 0) { this.dq--; return true; } return false; }
    interact() { if (this.pq > 0) { this.pq--; return true; } return false; }
  }
  const q3 = (v) => Math.round(v * 1000) / 1000;
  /* what my keyboard, mouse, touch sticks or gamepad do right now, for my apple */
  const kbm = B.input14 ? new B.input14.KeyboardMouseSource() : null;
  function sampleLocal() {
    const P = G.players && G.players[S.me];
    const L = NET.local;
    if (!P || NET.menu || (NET.decider >= 0 && G.state !== 'play') || document.hidden) return [0, 0, null, null, 0, L.dashN, L.pingN, null, null];
    return withPlayer(P, () => {
      let mv = Input.moveVec();
      const pads = (B.input14 && B.input14.Pads.any) || [];
      let pad = null;
      for (const gp of pads) { const s = B.input14.padFor(gp.index); const m = s.moveVec(); if (!pad) pad = s; if (!mv.x && !mv.y && (m.x || m.y)) { mv = m; pad = s; } }
      const scr = View.toScreen(P.x, P.y);
      let aim = Input.aimVec(scr[0], scr[1]);
      if (!aim && pad) aim = pad.aimVec();
      if (Input.dashReq) { Input.dashReq = false; L.dashN++; }
      for (const gp of pads) { const s = B.input14.padFor(gp.index); if (s.dash()) L.dashN++; if (s.interact()) L.pingN++; }
      if (L.pingQ) { L.pingQ = false; L.pingN++; }
      let sx = null, sy = null;
      if (!Input.touchMode && Input.mouse && Input.mouse.down) { const k = View.s || 1; sx = q3((Input.mouse.x - View.ox) / k - WALL); sy = q3((Input.mouse.y - View.oy) / k - WALL); }
      return [q3(mv.x || 0), q3(mv.y || 0), aim ? q3(aim.x) : null, aim ? q3(aim.y) : null, aim && aim.touch ? 1 : 0, L.dashN, L.pingN, sx, sy];
    });
  }
  /* turn a raw sample into one slot of a bundle: counters become edges since the last bundle */
  function bundleSlot(mem, raw) {
    if (!raw || mem.away) return [0, 0, null, null, 0, 0, 0, null, null];
    const dn = mem.dashN < 0 ? 0 : Math.max(0, Math.min(3, raw[5] - mem.dashN)), pn = mem.pingN < 0 ? 0 : Math.max(0, Math.min(3, raw[6] - mem.pingN));
    mem.dashN = raw[5]; mem.pingN = raw[6];
    return [raw[0], raw[1], raw[2], raw[3], raw[4], dn, pn, raw[7], raw[8]];
  }

  /* guests play on the host's save (unlocks, powerup pool, custom run, game options) so every peer builds the
     same run. Their own save comes back when the run ends; local look and sound settings stay their own. */
  const LOCAL_SETTINGS = ['music', 'shake', 'vibrate', 'numbers', 'info', 'fx', 'party', 'rq14', 'debug14', 'ctSeen24', 'coopNames14'];
  function swapSave(msg) {
    const mine = Save.data, st0 = Save.store, opts = optsNow();
    const d = JSON.parse(JSON.stringify(msg.save));
    d.settings = Object.assign({}, d.settings || {});
    for (const k of LOCAL_SETTINGS) if (mine.settings && k in mine.settings) d.settings[k] = mine.settings[k];
    d.sound = mine.sound;
    Save.data = d; Save.store = function () { return true; };
    if (msg.opts && B.OPTS7) Object.assign(B.OPTS7, msg.opts);
    NET.keep = () => { Save.data = mine; Save.store = st0; if (opts && B.OPTS7) { for (const k of Object.keys(B.OPTS7)) delete B.OPTS7[k]; Object.assign(B.OPTS7, opts); } };
  }
  function beginRun(msg) {
    safe(() => Sfx.init());
    if (NET.live) endRun(false);
    if (S.role === 'guest') swapSave(msg);
    else NET.keep = null;
    S.running = true;
    NET.tick = 0; NET.acc = 0; NET.queue = []; NET.events = []; NET.menu = false; NET.decider = -1; NET.hashes = new Map(); NET.hist = new Map(); NET.fixAt = -1; NET.needFix = false; NET.wantFix = false; NET.fixWait = 0;
    NET.local = { dashN: 0, pingN: 0 };
    NET.srcs = msg.members.map((m) => new NetSource(m.slot));
    const C = B.coop14;
    C.pending = msg.members.map((m, i) => ({ src: NET.srcs[i], char: m.char, look: m.look, name: m.name }));
    UI.hidePanels(); if (B.coopSec14) B.coopSec14.hidden = true;
    /* the start of a run draws from Math.random (the map, the first rooms): give every peer the same stream */
    const keepR = Math.random, r = mulberry32((msg.seed ^ 0x2c1b3c6d) >>> 0);
    Math.random = r; NET.starting = true; TM.list = []; TM.id = 0; NET.tick = 0;
    try { inSim(() => Game.startRun(false, msg.mode)); } finally { Math.random = keepR; NET.starting = false; }
    if (!MP14.on || G.players.length !== msg.members.length) { errNote14(new Error('online start failed'), 'net'); endRun(true); safe(() => Game.toMenu()); return; }
    for (const P of G.players) P.net14 = true;
    NET.live = true;
    lastFrame = performance.now();
    if (S.role === 'host') NET.hostLast = performance.now();
  }
  function endRun(silent) {
    if (!NET.live && !S.running) return;
    NET.live = false; S.running = false; NET.menu = false; TM.list = []; NET.decider = -1; NET.queue = []; NET.events = [];
    gameRandOff();
    if (NET.keep) { const k = NET.keep; NET.keep = null; safe(k); }
  }

  /* timers set by game code during a tick (a delayed downgrade, a coin drop, a room that clears late) count
     ticks, not milliseconds: on a real clock they would land on a different tick on every peer */
  const realST = window.setTimeout, realCT = window.clearTimeout;
  const TM = { list: [], id: 0, on: 0 };
  function simSetTimeout(fn, ms) {
    if (typeof fn !== 'function') return realST.apply(window, arguments);
    const args = [].slice.call(arguments, 2), id = 'n' + (++TM.id);
    TM.list.push({ id, at: NET.tick + Math.max(1, Math.ceil((+ms || 0) / (STEP * 1000) - 1e-9)), fn, args });
    return id;
  }
  function simClearTimeout(id) {
    if (typeof id === 'string' && id[0] === 'n') { const i = TM.list.findIndex((t) => t.id === id); if (i >= 0) TM.list.splice(i, 1); return; }
    return realCT.apply(window, arguments);
  }
  window.clearTimeout = simClearTimeout;
  function inSim(fn) {
    TM.on++; if (TM.on === 1) window.setTimeout = simSetTimeout;
    try { return fn(); } finally { TM.on--; if (!TM.on) window.setTimeout = realST; }
  }
  function runTimers(n) {
    if (!TM.list.length) return;
    const due = TM.list.filter((t) => t.at <= n);
    if (!due.length) return;
    TM.list = TM.list.filter((t) => t.at > n);
    for (const t of due) { gameRandOn(); try { t.fn.apply(window, t.args); } catch (e) { errNote14(e, 'net timer'); } finally { gameRandOff(); } }
  }
  /* one tick, the same on every peer */
  function simTick(b) { return inSim(() => simTick0(b)); }
  function simTick0(b) {
    const n = b[0], ins = b[1], ev = b[2];
    if (ev) for (const e of ev) safe(() => applyEvent(e));
    for (let i = 0; i < NET.srcs.length; i++) NET.srcs[i].set(ins[i]);
    runTimers(n);
    if (G.state === 'play') {
      gameRandOn();
      try { Game.update(STEP); Sched.run('step', n * STEP * 1000, STEP); }
      catch (err) { console.error(err); errNote14(err, 'update'); }
      finally { gameRandOff(); }
    }
    if (NET.dbg) { const L = NET.dbgT || (NET.dbgT = []); L.push([n, G.state, Math.round(G.t * 1e6), G.rng && G.rng.getState ? G.rng.getState() : 0, G.room ? G.room.id : -1, ev ? JSON.stringify(ev) : '', TM.list.length, ins.map((x) => x ? x.slice(0, 2).join(',') : '-').join('|')]); if (L.length > 4000) L.splice(0, 1000); }
    NET.tick = n + 1;
    if (NET.tick % CHECK === 0) checkpoint(NET.tick, b[3]);
  }
  function applyEvent(e) {
    if (e.k === 'away') { const P = G.players[e.s]; if (P) { P.away14 = true; P.vx = P.vy = 0; } return; }
    if (e.k === 'act') { const P = G.players[e.s]; if (P) withPlayer(P, () => replayClick(e.a)); return; }
  }

  /* ---------------- host loop: make a bundle each tick, send, run it */
  function hostPump(dt) {
    NET.acc = Math.min(NET.acc + dt, STEP * 6);
    const out = [];
    let k = 0;
    while (NET.acc >= STEP - 1e-6 && k < 6) {
      NET.acc -= STEP; k++;
      const n = NET.tick, ins = [];
      const mine = sampleLocal();
      for (const mem of S.members) ins[mem.slot] = mem.slot === S.me ? bundleSlot(mem, mine) : bundleSlot(mem, mem.in);
      for (let i = 0; i < NET.srcs.length; i++) if (!ins[i]) ins[i] = null;
      const ev = NET.events.length ? NET.events.splice(0) : 0;
      const b = [n, ins, ev, 0];
      /* a repair: the guest copies this state right after it runs tick n (the host fills it in below) */
      const fixHere = NET.needFix && (n + 1) % CHECK === 0;
      if (fixHere) NET.needFix = false;
      simTick(b);
      if (fixHere) b[3] = fixBlob();
      out.push(b);
    }
    if (out.length) for (const m of S.members) if (m.link && m.link.open && !m.away) m.link.send({ t: 'b', L: out });
  }
  /* ---------------- guest loop: run the bundles that came in, a little faster when behind */
  function guestPump(dt) {
    const Q = NET.queue;
    NET.acc = Math.min(NET.acc + dt, STEP * 4);
    let k = 0;
    const extra = Q.length > 6 ? Math.min(Q.length - 3, 30) : 0;
    while (Q.length && ((NET.acc >= STEP - 1e-6) || k < extra)) {
      if (NET.acc >= STEP - 1e-6) NET.acc -= STEP;
      simTick(Q.shift()); k++;
      if (k > 40) break;
    }
    if (!Q.length) NET.acc = Math.min(NET.acc, STEP);
    /* my input goes to the host every frame */
    const L = S.link;
    if (L && L.open) {
      L.send({ t: 'in', d: sampleLocal() });
      const now = performance.now();
      if (!NET.pingT || now - NET.pingT > 2000) { NET.pingT = now; L.send({ t: 'p', ts: now }); }
    }
  }
  NET.pump = function (dt, now) {
    if (!NET.live) return;
    if (S.role === 'host') hostPump(dt);
    else guestPump(dt);
  };

  /* ================================================================ checks and repairs */
  function stateHash() {
    let h = 2166136261 >>> 0;
    const mix = (v) => { v = (typeof v === 'number' ? Math.round(v * 100) : v ? 1 : 0) | 0; h = Math.imul(h ^ v, 16777619) >>> 0; };
    mix(G.levelIdx); mix(G.room ? G.room.id : -1); mix(G.run ? G.run.kills : 0); mix(G.run ? G.run.coins : 0);
    mix(G.rng && G.rng.getState ? G.rng.getState() : 0);
    for (const P of G.players) { mix(P.x); mix(P.y); mix(P.hp); mix(P.maxHp); mix(P.items ? P.items.length : 0); mix(P.ghost14); }
    const R = G.room;
    if (R) { mix(R.snakes.length); for (const sn of R.snakes) { mix(sn.x); mix(sn.y); mix(sn.hp); mix(sn.alive); } mix(R.pickups ? R.pickups.length : 0); }
    mix(G.seeds ? G.seeds.length : 0);
    return h;
  }
  function checkpoint(n, fix) {
    const H = NET.hist || (NET.hist = new Map());
    H.set(n, stateHash()); if (H.size > 300) H.delete(H.keys().next().value);
    if (NET.dbg) { const D = NET.dbgSnap || (NET.dbgSnap = new Map()); D.set(n, JSON.stringify(fixBlob())); if (D.size > 80) D.delete(D.keys().next().value); }
    if (S.role === 'host') {
      NET.hashes.set(n, stateHash());
      if (NET.hashes.size > 30) NET.hashes.delete(NET.hashes.keys().next().value);
      return;
    }
    if (fix && fix.n === n) {
      const h0 = stateHash();
      if (h0 !== fix.h) { safe(() => applyFix(fix)); NET.repairs++; if (stateHash() !== fix.h) NET.desync++; else safe(() => UI.banner(T('Out of sync, repaired'), '')); }
      NET.wantFix = false;
      return;
    }
    const h = stateHash();
    if (S.link && S.link.open) S.link.send({ t: 'h', n, h });
  }
  /* own primitive fields of an object (numbers, booleans, strings), and x/y of points in arrays */
  function prims(o) {
    const out = {};
    for (const k of Object.keys(o)) {
      const v = o[k], t = typeof v;
      if (t === 'number' || t === 'boolean' || t === 'string' || v === null) out[k] = v;
      else if (Array.isArray(v) && v.length && v.length < 400 && v[0] && typeof v[0] === 'object' && typeof v[0].x === 'number') out[k] = { pts: v.map((p) => [p.x, p.y]) };
    }
    return out;
  }
  function put(o, d) {
    for (const k of Object.keys(d)) {
      const v = d[k];
      if (v && typeof v === 'object' && v.pts) { const a = o[k]; if (Array.isArray(a) && a.length === v.pts.length) for (let i = 0; i < a.length; i++) if (a[i]) { a[i].x = v.pts[i][0]; a[i].y = v.pts[i][1]; } }
      else if (typeof o[k] !== 'function' && typeof o[k] !== 'object') o[k] = v;
      else if (o[k] === null) o[k] = v;
    }
  }
  function fixBlob() {
    const R = G.room;
    return {
      n: NET.tick, h: stateHash(), rng: G.rng && G.rng.getState ? G.rng.getState() : null,
      g: { t: G.t, freeze: G.freeze, shake: 0 }, run: prims(G.run || {}), room: R ? R.id : -1, lvl: G.levelIdx,
      pl: G.players.map((P) => prims(P)),
      sn: R ? R.snakes.map((s) => prims(s)) : [], seeds: (G.seeds || []).map((s) => prims(s)), pk: R && R.pickups ? R.pickups.map((p) => prims(p)) : [],
      rm: R ? prims(R) : null,
    };
  }
  function applyFix(f) {
    if (f.rng != null && G.rng && G.rng.setState) G.rng.setState(f.rng);
    G.t = f.g.t; if (G.run) put(G.run, f.run);
    G.players.forEach((P, i) => { if (f.pl[i]) put(P, f.pl[i]); });
    const R = G.room;
    if (!R || R.id !== f.room || G.levelIdx !== f.lvl) return;
    if (f.rm) put(R, f.rm);
    if (R.snakes.length === f.sn.length) R.snakes.forEach((s, i) => put(s, f.sn[i]));
    if (G.seeds && G.seeds.length === f.seeds.length) G.seeds.forEach((s, i) => put(s, f.seeds[i]));
    else if (G.seeds && f.seeds.length === 0) G.seeds.length = 0;
    if (R.pickups && R.pickups.length === f.pk.length) R.pickups.forEach((p, i) => put(p, f.pk[i]));
  }
  /* a guest that sees a mismatch asks for a repair (hash reply from the host comes through 'h' on its side) */

  /* ================================================================ panels that change the run (sell, contract) */
  const MODAL_STATES = { sell: 'sell', contract: 'contract24' };
  /* who opened it: the apple in context when the state changed */
  safe(() => {
    let st = G.state;
    Object.defineProperty(G, 'state', {
      configurable: true, enumerable: true,
      get() { return st; },
      set(v) {
        if (NET.live && MODAL_STATES[v] && st === 'play') NET.decider = G.player && G.player.slot14 != null ? G.player.slot14 : 0;
        if (NET.live && v === 'play') NET.decider = -1;
        st = v;
      },
    });
  });
  const pathOf = (root, el) => { const all = root.querySelectorAll('*'); for (let i = 0; i < all.length; i++) if (all[i] === el) return i; return -1; };
  function replayClick(a) {
    const root = document.getElementById(a.r); if (!root) return;
    const el = root.querySelectorAll('*')[a.i]; if (!el) return;
    NET.replay = true;
    gameRandOn();
    try { inSim(() => el.click()); } finally { gameRandOff(); NET.replay = false; }
  }
  const modalRoot = (el) => { for (const id of Object.values(MODAL_STATES)) { const r = document.getElementById(id); if (r && r.contains(el)) return r; } return null; };
  document.addEventListener('click', (e) => {
    if (!NET.live || NET.replay) return;
    const root = modalRoot(e.target); if (!root) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!MODAL_STATES[G.state]) return;
    if (NET.decider !== S.me) { const P = G.players[NET.decider]; safe(() => UI.banner((P ? P.name14 : '') + ' ' + T('is choosing'), '')); return; }
    const hit = e.target.closest('button, a, input, label, [data-i], [tabindex]') || e.target;
    const a = { r: root.id, i: pathOf(root, hit) };
    if (a.i < 0) return;
    if (S.role === 'host') NET.events.push({ k: 'act', s: S.me, a });
    else if (S.link) S.link.send({ t: 'act', a });
  }, true);
  window.__netKey14 = (e) => {
    if (!NET.live) return;
    if (MODAL_STATES[G.state] && !['Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) { e.stopImmediatePropagation(); e.preventDefault(); }
    if (e.code === 'KeyE' && !e.repeat && G.state === 'play') NET.local.pingQ = true;
  };
  /* the panel says who chooses */
  Sched.every('ui', 'v14 net modal note', () => {
    const id = MODAL_STATES[G.state]; if (!id) return;
    const root = document.getElementById(id); if (!root) return;
    let n = root.querySelector('.net14-note');
    if (!n) { n = document.createElement('div'); n.className = 'net14-note'; n.style.cssText = 'position:sticky;top:0;z-index:5;margin:0 auto 8px;max-width:520px;padding:6px 10px;background:rgba(12,8,8,.9);border:1px solid var(--line);border-radius:3px;font:700 13px/1.2 var(--ui);letter-spacing:.06em;text-align:center;color:#fff4ec'; root.prepend(n); }
    const P = G.players[NET.decider], mine = NET.decider === S.me;
    n.hidden = mine; if (!mine) n.textContent = (P ? P.name14 : '') + ' ' + T('is choosing');
    root.style.pointerEvents = '';
  }, () => NET.live);

  /* ================================================================ pause, retry, menu while online */
  safe(() => {
    const pause0 = Game.pause, resume0 = Game.resume, onKey0 = Game.onKey, retry0 = Game.retry, toMenu0 = Game.toMenu, start0 = Game.startRun;
    /* the run never stops for one player: the pause panel opens on top and the apple stands still */
    Game.pause = function () {
      if (!NET.live) return pause0.apply(this, arguments);
      if (G.state !== 'play' || NET.menu) return;
      NET.menu = true;
      safe(() => { UI.el.pauseWhere.textContent = `${T('Online')}  ·  ${floorLabel(G.levelIdx)}  ·  ${G.levelDef.name}`; });
      UI.hideOverlays(); UI.refresh(); UI.show('pause'); safe(() => UI.fillPause()); UI.el.btnPause.hidden = true;
      setTimeout(() => safe(() => UI.el.btnResume.focus({ preventScroll: true })), 60);
    };
    Game.resume = function () {
      if (!NET.live || !NET.menu) return resume0.apply(this, arguments);
      NET.menu = false;
      UI.hide('pause'); UI.hide('how'); UI.hide('settings');
      UI.el.btnPause.hidden = false;
      safe(() => View.cv.focus({ preventScroll: true }));
    };
    Game.onKey = function (code) {
      if (NET.live && NET.menu && (code === 'Escape' || code === 'KeyP')) {
        if (!UI.el.how.hidden) UI.closeHow(); else if (!UI.el.settings.hidden) UI.closeSettings(); else Game.resume();
        return;
      }
      return onKey0.apply(this, arguments);
    };
    /* try again: the host starts a new online run for everyone */
    Game.retry = function () {
      if (!S.running && !NET.live) return retry0.apply(this, arguments);
      if (S.role === 'host') hostStart(); else safe(() => UI.banner(T('The host starts the next run'), ''));
    };
    Game.startRun = function (story) {
      if (NET.live && !NET.starting && S.role === 'guest') { safe(() => UI.banner(T('The host starts the next run'), '')); return; }
      if (NET.live && !NET.starting && S.role === 'host' && !story) { NET.starting = true; try { hostStart(); } finally { NET.starting = false; } return; }
      return start0.apply(this, arguments);
    };
    /* the menu: the host takes everyone back to the lobby, a guest leaves the run and waits there */
    Game.toMenu = function () {
      if (NET.live) {
        const host = S.role === 'host';
        if (host) { for (const m of S.members) if (m.link && m.link.open) m.link.send({ t: 'lobbyback' }); }
        else if (S.link) S.link.send({ t: 'leave' });
        endRun(false);
        const r = toMenu0.apply(this, arguments);
        if (S.role) setTimeout(() => openLobby(), 0);
        return r;
      }
      return toMenu0.apply(this, arguments);
    };
  });

  /* guests see the run from their own apple: the HUD shows their hearts and items */
  safe(() => {
    const r0 = render;
    render = function () {
      if (NET.live && S.role === 'guest' && G.players && G.players[S.me]) return withPlayer(G.players[S.me], () => r0.apply(this, arguments));
      return r0.apply(this, arguments);
    };
  });
  /* the mouse spot (some powerups aim at the cursor) comes from the bundle for remote apples */
  safe(() => {
    const a0 = aimSpot10;
    aimSpot10 = function (P, room, base) {
      if (NET.live && P && P.input14 && P.input14.kind === 'net') {
        const s = P.input14.spot;
        if (s) return { x: clamp(s.x, 10, RW - 10), y: clamp(s.y, 10, RH - 10) };
        const keep = Input.mouse.down; Input.mouse.down = false;
        try { return a0.apply(this, arguments); } finally { Input.mouse.down = keep; }
      }
      return a0.apply(this, arguments);
    };
  });


  /* ================================================================ the Online pane */
  const CSS = `
#coop14 .net14{max-width:720px;display:grid;gap:12px}
#coop14 .net14-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#coop14 .net14 input{all:unset;box-sizing:border-box;padding:8px 10px;border:1px solid var(--line);border-radius:2px;font:700 18px/1.1 var(--ui);letter-spacing:.2em;text-transform:uppercase;color:#fff4ec;width:9.5em}
#coop14 .net14 input.nm{letter-spacing:.02em;text-transform:none;width:11em;font-size:15px}
#coop14 .net14-code{font:800 34px/1 var(--ui);letter-spacing:.24em;color:#fff4ec}
#coop14 .net14-st{font:600 13px/1.3 var(--ui);color:var(--muted)}
#coop14 .net14-err{font:700 13px/1.3 var(--ui);color:#ff8a7a}
#coop14 .net14-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
#coop14 .net14-m{border:1px solid var(--line);border-radius:4px;padding:8px;display:grid;grid-template-columns:48px 1fr;gap:4px 8px;align-items:center;position:relative}
#coop14 .net14-m::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--pc)}
#coop14 .net14-m canvas{width:48px;height:48px;grid-row:span 2}
#coop14 .net14-m b{font:700 15px/1.1 var(--ui);color:#fff4ec;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#coop14 .net14-m small{font:600 11px/1 var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
#coop14 .net14-me{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#coop14 .net14-me .co14-row{width:200px}
`;
  let pane = null;
  function ensurePane() {
    const sec = B.coopSec14; if (!sec) return null;
    const host = sec.querySelector('[data-pane="online"]'); if (!host) return null;
    if (pane && host.contains(pane)) return pane;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    pane = document.createElement('div'); pane.className = 'net14';
    host.appendChild(pane);
    return pane;
  }
  const COL = () => (B.coop14 && B.coop14.COL) || ['#e8403a', '#3a8ee8', '#e8c83a', '#4ac85a'];
  const charsOpen = () => CHAR_IDS.filter((id) => id === 'apple' || Save.data.unlocks[id]);
  const looksOf = (id) => (B.SKINS24 && B.SKINS24.SKINS[id] ? B.SKINS24.SKINS[id].length : 0);
  const lookName = (id, n) => (n && B.SKINS24 && B.SKINS24.SKINS[id] && B.SKINS24.SKINS[id][n - 1] ? B.SKINS24.SKINS[id][n - 1].name : 'Original');
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, '');
  function paint() {
    const p = ensurePane(); if (!p) return;
    if (B.coopSec14.hidden) return;
    const http = /^https?:$/.test(location.protocol) || localMode();
    const me = myProfile();
    let h = `<p class="co14-note">${T('Share the code or the link. Up to four apples, one room, the host picks the mode.')}</p>`;
    if (!http) { p.innerHTML = h + `<p class="net14-err">${T('Online play needs the game served over http or https.')}</p>`; return; }
    h += `<div class="net14-me"><input class="nm" type="text" maxlength="12" aria-label="${T('Name')}" value="${esc(me.name)}">
      <div class="co14-row"><button type="button" data-k="char" data-d="-1" aria-label="${T('Character')}">&lsaquo;</button><span>${esc(CHARS[me.char] ? CHARS[me.char].name : me.char)}</span><button type="button" data-k="char" data-d="1" aria-label="${T('Character')}">&rsaquo;</button></div>
      <div class="co14-row"><button type="button" data-k="look" data-d="-1" aria-label="${T('Look')}">&lsaquo;</button><span>${esc(lookName(me.char, me.look))}</span><button type="button" data-k="look" data-d="1" aria-label="${T('Look')}">&rsaquo;</button></div></div>`;
    if (!S.role) {
      h += `<div class="net14-row"><button class="btn primary" type="button" data-a="host">${T('Host a game')}</button></div>
        <div class="net14-row"><input class="cd" type="text" maxlength="5" autocomplete="off" spellcheck="false" aria-label="${T('Room code')}" placeholder="${T('Room code')}" value="${esc(S.joinCode || '')}"><button class="btn" type="button" data-a="join">${T('Join')}</button></div>`;
    } else {
      h += `<div class="net14-row"><span class="net14-code" aria-label="${T('Room code')}">${esc(S.code || '·····')}</span>`;
      if (S.code) h += `<button class="btn" type="button" data-a="link">${T('Copy invite link')}</button>`;
      h += `<button class="btn" type="button" data-a="leave">${T('Leave')}</button></div>`;
      h += `<div class="net14-list">`;
      for (const m of S.members) {
        const tag = m.slot === 0 ? T('Host') : '', you = m.slot === S.me ? T('You') : '';
        h += `<div class="net14-m" style="--pc:${COL()[m.slot]}"><canvas width="96" height="96" data-c="${esc(m.char)}" data-l="${m.look | 0}" aria-hidden="true"></canvas><b>${esc(m.name)}</b><small>${[tag, you].filter(Boolean).join(' · ') || '&nbsp;'}</small></div>`;
      }
      h += `</div>`;
      const mode = MODES[S.role === 'host' ? onlineMode() : S.mode] || MODES.arcade;
      h += `<div class="net14-row"><span class="net14-st">${T('Mode')}: <b>${esc(mode.name)}</b>${S.role === 'guest' && S.ping ? ` · ${T('ping')} ${S.ping} ms` : ''}</span></div>`;
      if (S.role === 'host') h += `<div class="playfoot"><span class="ddesc">${S.members.length < 2 ? T('Waiting for players') : ''}</span><button class="btn primary" type="button" data-a="start"${S.members.length < 2 ? ' disabled' : ''}>${T('Start online run')}</button></div>`;
    }
    if (S.status && !(S.role === 'host' && S.members.length > 1)) h += `<div class="net14-st" aria-live="polite">${esc(S.status)}</div>`;
    if (S.err) h += `<div class="net14-err" role="alert">${esc(S.err)}</div>`;
    const foc = document.activeElement && p.contains(document.activeElement) ? (document.activeElement.dataset.a || document.activeElement.className) : null;
    p.innerHTML = h;
    for (const cv of p.querySelectorAll('canvas[data-c]')) safe(() => B.SKINS24.drawOn(cv, cv.dataset.c, +cv.dataset.l, 1.2, {}));
    const on = (sel, fn) => { const e = p.querySelector(sel); if (e) e.addEventListener('click', (ev) => { ev.preventDefault(); safe(() => Sfx.blip()); fn(); }); };
    on('[data-a="host"]', () => hostOpen());
    on('[data-a="join"]', () => { const v = p.querySelector('input.cd'); S.joinCode = v ? v.value : ''; guestJoin(S.joinCode); });
    on('[data-a="leave"]', () => { leave(); S.err = ''; paint(); });
    on('[data-a="start"]', () => hostStart());
    on('[data-a="link"]', () => {
      const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('join', S.code); if (localMode()) u.searchParams.set('net', 'local');
      const done = () => safe(() => UI.banner(T('Link copied'), u.toString()));
      safe(() => navigator.clipboard.writeText(u.toString()).then(done, done), done());
    });
    const cd = p.querySelector('input.cd');
    if (cd) { cd.addEventListener('input', () => { S.joinCode = cleanCode(cd.value); }); cd.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); guestJoin(cd.value); } }); }
    const nm = p.querySelector('input.nm');
    nm.addEventListener('change', () => {
      me.name = cleanName(nm.value, S.me);
      const L = Save.data.settings.coopNames14 = (Save.data.settings.coopNames14 || []).slice(); L[0] = me.name; Save.store();
      sendMe();
    });
    for (const b of p.querySelectorAll('.net14-me [data-k]')) b.addEventListener('click', (e) => {
      e.preventDefault(); const dd = +b.dataset.d;
      if (b.dataset.k === 'char') { const L = charsOpen(); me.char = L[(L.indexOf(me.char) + dd + L.length) % L.length]; me.look = 0; }
      else { const n = looksOf(me.char) + 1; me.look = ((me.look || 0) + dd + n) % n; }
      safe(() => Sfx.blip()); sendMe(); paint();
      const f = p.querySelector(`.net14-me [data-k="${b.dataset.k}"][data-d="${b.dataset.d}"]`); if (f) f.focus();
    });
    if (foc) { const f = p.querySelector(`[data-a="${foc}"]`) || p.querySelector('.' + String(foc).split(' ')[0]); if (f && f.focus) f.focus({ preventScroll: true }); }
  }
  function openLobby() {
    const C = B.coop14; if (!C) return;
    if (!B.coopSec14 || B.coopSec14.hidden) C.open();
    C.setTab('online');
    paint();
  }
  NET.paintLobby = paint;
  B.net14 = { paintLobby: paint, S, NET, host: hostOpen, join: guestJoin, leave, start: hostStart, openLobby, stateHash, NetSource, PROTO };

  /* ?join=CODE opens the lobby and joins */
  safe(() => {
    const m = /[?&]join=([A-Za-z]{4,5})/.exec(location.search);
    if (m) setTimeout(() => safe(() => { openLobby(); guestJoin(m[1]); }), 400);
  });
  window.addEventListener('pagehide', () => safe(() => leave(true)));
})();
