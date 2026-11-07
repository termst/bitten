/* src/09-input.js: Input: keyboard, mouse and two floating touch sticks. From v1 to v8. Lines 5539 to 5659 of the v13.7 script. */
/* =====================================================================
   Input: keyboard, mouse, and two floating thumb sticks for touch
   ===================================================================== */
const Input = {
  keys: new Set(),
  mouse: { x: 0, y: 0, down: false },
  sticks: { move: null, aim: null },
  touchMode: COARSE,
  used: { move: false, aim: false },
  dashReq: false, lastMoveUp: 0, lastMoveX: 0, lastMoveY: 0,
  R: 54,
  el: null,

  init(el) {
    this.el = el;
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => this.reset());
    el.addEventListener('pointerdown', (e) => this.down(e));
    el.addEventListener('pointermove', (e) => this.move(e));
    el.addEventListener('pointerup', (e) => this.up(e));
    el.addEventListener('pointercancel', (e) => this.up(e));
    el.addEventListener('lostpointercapture', (e) => this.up(e));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  },
  reset() { this.keys.clear(); this.mouse.down = false; this.sticks.move = null; this.sticks.aim = null; this.dashReq = false; },
  onKey(e, down) {
    const code = e.code;
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    if (G.state === 'play' && gameKeys.includes(code)) e.preventDefault();
    if (down) {
      if (e.repeat) return;
      this.keys.add(code);
      if (gameKeys.includes(code)) this.touchMode = false;
      if (G.state === 'play' && (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight')) this.dashReq = true;
      Game.onKey(code, e);
    } else this.keys.delete(code);
  },
  pos(e) { const r = this.el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; },
  down(e) {
    const [x, y] = this.pos(e);
    if (e.pointerType === 'mouse') {
      this.mouse.x = x; this.mouse.y = y;
      if (e.button === 0) { this.mouse.down = true; try { this.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      if (e.button === 2 && G.state === 'play') this.dashReq = true;
      this.touchMode = false;
      return;
    }
    e.preventDefault();
    this.touchMode = true;
    const side = x < this.el.clientWidth / 2 ? 'move' : 'aim';
    if (this.sticks[side]) return;
    // a quick double tap on the move side dashes
    if (side === 'move' && G.state === 'play' && performance.now() - this.lastMoveUp < 300 && Math.hypot(x - this.lastMoveX, y - this.lastMoveY) < 80) this.dashReq = true;
    this.sticks[side] = { id: e.pointerId, ox: x, oy: y, x, y };
    try { this.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    Sfx.resume();
  },
  move(e) {
    const [x, y] = this.pos(e);
    if (e.pointerType === 'mouse') { this.mouse.x = x; this.mouse.y = y; return; }
    for (const k of ['move', 'aim']) {
      const s = this.sticks[k];
      if (s && s.id === e.pointerId) {
        s.x = x; s.y = y;
        const dx = x - s.ox, dy = y - s.oy, d = Math.hypot(dx, dy), max = this.R * 1.2;
        if (d > max) { s.ox = x - (dx / d) * max; s.oy = y - (dy / d) * max; }
      }
    }
  },
  up(e) {
    if (e.pointerType === 'mouse') {
      if (e.type !== 'pointerup' || e.button === 0) this.mouse.down = false;
      return;
    }
    for (const k of ['move', 'aim']) {
      const s = this.sticks[k];
      if (s && s.id === e.pointerId) {
        if (k === 'move') { this.lastMoveUp = performance.now(); this.lastMoveX = s.x; this.lastMoveY = s.y; }
        this.sticks[k] = null;
      }
    }
  },
  stick(k) {
    const s = this.sticks[k]; if (!s) return null;
    const dx = s.x - s.ox, dy = s.y - s.oy, d = Math.hypot(dx, dy);
    return { dx, dy, m: d / this.R };
  },
  moveVec() {
    let x = 0, y = 0;
    if (this.keys.has('KeyA')) x -= 1;
    if (this.keys.has('KeyD')) x += 1;
    if (this.keys.has('KeyW')) y -= 1;
    if (this.keys.has('KeyS')) y += 1;
    if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l }; }
    const v = this.stick('move');
    if (v && v.m > 0.12) {
      this.used.move = true;
      const m = clamp((v.m - 0.12) / 0.5, 0, 1); const l = Math.hypot(v.dx, v.dy);
      return { x: (v.dx / l) * m, y: (v.dy / l) * m };
    }
    return { x: 0, y: 0 };
  },
  // px,py: the player's position on screen, used for mouse aiming
  aimVec(px, py) {
    let x = 0, y = 0;
    if (this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('ArrowDown')) y += 1;
    if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l, touch: false }; }
    const v = this.stick('aim');
    if (v && v.m > 0.22) { this.used.aim = true; const l = Math.hypot(v.dx, v.dy); return { x: v.dx / l, y: v.dy / l, touch: true }; }
    if (this.mouse.down) {
      const dx = this.mouse.x - px, dy = this.mouse.y - py, l = Math.hypot(dx, dy);
      if (l > 4) return { x: dx / l, y: dy / l, touch: false };
    }
    return null;
  },
};

