// Decorating: drag the furniture around, add new things from the drawer, paint the room,
// and build obstacle courses (the flag tab).
(() => {
  const W = G.W, M = G.MAP, A = G.ART;
  const D = G.decor = {};
  let st = null, ui = null;

  // keep a piece inside the parts of the room where furniture may stand
  const clampIn = (it, rects) => {
    const d = G.ITEMS[it.t], w = (it.r % 2 ? d.h : d.w) / 2, h = (it.r % 2 ? d.w : d.h) / 2, pad = 0.2;
    let best = null, bd = 1e9;
    for (const q of rects) {
      const mx = (q[0] + q[2]) / 2, my = (q[1] + q[3]) / 2;
      const x = G.clamp(it.x, Math.min(q[0] + w + pad, mx), Math.max(q[2] - w - pad, mx)), y = G.clamp(it.y, Math.min(q[1] + h + pad, my), Math.max(q[3] - h - pad, my));
      const dd = G.dist(x, y, it.x, it.y); if (dd < bd) { bd = dd; best = [x, y]; }
    }
    it.x = best[0]; it.y = best[1];
  };
  const snap = v => Math.round(v * 4) / 4;
  const paint = () => G.save.house.paint[st.room.id] || (G.save.house.paint[st.room.id] = {});

  D.open = (roomId, tab) => {
    const room = M.room(roomId); if (!room || !room.deco) return;
    if (G.course.run) G.course.stop(true);
    const rects = M.decoRects(room);
    const box = [Math.min(...rects.map(q => q[0])), Math.min(...rects.map(q => q[1])), Math.max(...rects.map(q => q[2])), Math.max(...rects.map(q => q[3]))];
    st = W.decor = { room, rects, box, items: G.itemsIn(roomId), sel: null, drag: null, pan: null, tab: tab || 'furniture', cx: G.clamp(W.player.x, box[0], box[2]), cy: G.clamp(W.player.y, box[1], box[3]) };
    W.mode = 'decor'; W.player.path = null;
    ui = G.$('#decor-ui'); ui.innerHTML = `
      <div class="decor-tools hidden" id="decor-tools">
        <button class="big-btn" data-a="turn" title="Turn">🔄</button>
        <button class="big-btn" data-a="away" title="Put away">🗑️</button>
      </div>
      <div class="decor-drawer">
        <div class="decor-tabs">${G.CATS.map(c => `<button class="tab" data-tab="${c[0]}" title="${c[2]}">${c[1]}</button>`).join('')}<div class="spacer"></div><button class="btn done" data-a="done">✅ Done</button></div>
        <div class="decor-items" id="decor-items"></div>
      </div>`;
    ui.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset.a;
      if (b.dataset.tab) { st.tab = b.dataset.tab; G.sfx.tap(); fill(); if (st.tab === 'course' && !G.P().done.courseHi) { G.P().done.courseHi = 1; G.persist(); G.beep(G.T('course.buildHi')); } }
      else if (a === 'done') D.close();
      else if (a === 'turn' && st.sel) { st.sel.r = ((st.sel.r || 0) + 1) % 4; clampIn(st.sel, st.rects); G.sfx.snap(); G.persist(); }
      else if (a === 'away' && st.sel) { st.items.splice(st.items.indexOf(st.sel), 1); select(null); G.sfx.whoosh(); G.persist(); fill(); }
      else if (a === 'dice') { G.course.surprise(st.room.id); st.items = G.itemsIn(st.room.id); select(null); G.sfx.gift(); G.confetti(30); G.beep(G.T('course.surprise')); fill(); }
      else if (a === 'go') { const id = st.room.id; if (G.course.valid(id)) { D.close(true); G.Q.onDecor && G.Q.onDecor(id); G.course.start(id); } else { G.sfx.oops(); G.beep(G.T('course.' + G.course.missing(id))); } }
      else if (b.dataset.item) add(b.dataset.item);
      else if (b.dataset.wall) { paint().wall = b.dataset.wall; G.sfx.sparkle(); G.persist(); fill(); }
      else if (b.dataset.floor) { paint().floor = b.dataset.floor; G.sfx.sparkle(); G.persist(); fill(); }
    };
    fill();
    G.$('#btn-decor').textContent = '✅';
    if (st.tab === 'course') { if (!G.P().done.courseHi) { G.P().done.courseHi = 1; G.beep(G.T('course.buildHi')); } }
    else if (!G.P().done.decorHi) { G.P().done.decorHi = 1; G.beep(G.T('decorHi')); }
    G.persist();
    G.Q.onDecorOpen && G.Q.onDecorOpen(roomId);
  };
  function fill() {
    const box = G.$('#decor-items', ui);
    G.$$('.tab', ui).forEach(t => t.classList.toggle('on', t.dataset.tab === st.tab));
    if (st.tab === 'paint') {
      const p = paint();
      if (st.room.id === 'courtyard') { box.innerHTML = '<div class="swatches"><span>🌴</span></div>'; return; }
      box.innerHTML = `<div class="swatches"><span>🧱</span>${Object.entries(A.WALLS).map(([k, v]) => `<button class="swatch ${((p.wall || 'white') === k) ? 'on' : ''}" data-wall="${k}" style="background:${v === 'rainbow' ? 'linear-gradient(90deg,#ff8f8f,#ffe483,#a8e6a1,#9cc8ff,#c9a8ff)' : v}"></button>`).join('')}</div>
        <div class="swatches"><span>🟫</span>${Object.entries(A.FLOORS).map(([k, v]) => `<button class="swatch ${((p.floor || 'wood') === k) ? 'on' : ''}" data-floor="${k}" title="${v[0]}" style="background:${k === 'rainbow' ? 'linear-gradient(180deg,#ffb3b3,#fff3a8,#c8f2b4,#b4e1ff,#d4c2ff)' : k === 'checker' ? 'repeating-conic-gradient(#ffc0dc 0 25%,#fff 0 50%) 0 0/20px 20px' : v[1]}">${k === 'space' ? '✨' : ''}</button>`).join('')}</div>`;
      return;
    }
    const btn = d => `<button class="item-btn" data-item="${d.id}" title="${d.name}"><img src="${G.itemThumb(d.id)}" alt="${d.name}"></button>`;
    if (st.tab === 'course') {
      const p = G.course.parts(st.room.id), ok = G.course.valid(st.room.id);
      box.innerHTML = `<button class="btn go-btn ${ok ? '' : 'off'}" data-a="go">▶️ Go!</button>
        <div class="course-check"><span class="${p.start ? 'ok' : ''}">🟢</span><span class="${p.obs.length ? 'ok' : ''}">${p.obs.length}</span><span class="${p.finish ? 'ok' : ''}">🏁</span></div>
        <button class="item-btn dice" data-a="dice" title="Surprise course">🎲</button>` + G.COURSE_ITEMS.map(id => btn(G.ITEMS[id])).join('');
      return;
    }
    const list = Object.values(G.ITEMS).filter(d => d.cat === st.tab && G.hasItem(d.id));
    const locked = Object.values(G.ITEMS).filter(d => d.cat === st.tab && !G.hasItem(d.id)).length;
    box.innerHTML = list.map(btn).join('') + (locked ? `<div class="item-locked" title="More come in packages">📦 × ${locked}</div>` : '');
  }
  function add(id) {
    if (st.items.length >= 60) { G.sfx.oops(); return; }
    const k = G.ITEMS[id].course;
    if (k && (k.kind === 'start' || k.kind === 'finish')) { // only one of each: move the old one
      const old = st.items.find(it => it.t === id); if (old) st.items.splice(st.items.indexOf(old), 1);
    }
    const it = { t: id, x: snap(st.cx + (Math.random() - 0.5) * 2), y: snap(st.cy + (Math.random() - 0.5) * 2), r: 0 };
    clampIn(it, st.rects); st.items.push(it); select(it); G.sfx.pop(); W.puff(it.x, it.y - 0.5, '✨', 5); G.persist();
    if (st.tab === 'course') fill();
  }
  function select(it) { st.sel = it; G.$('#decor-tools', ui).classList.toggle('hidden', !it); }
  function hit(wx, wy) {
    for (const flat of [false, true]) {
      for (let i = st.items.length - 1; i >= 0; i--) {
        const it = st.items[i], d = G.ITEMS[it.t]; if (!d || !!d.flat !== flat) continue;
        const q = G.itemRect(it), pad = 0.25;
        if (wx > q[0] - pad && wx < q[2] + pad && wy > q[1] - pad && wy < q[3] + pad) return it;
      }
    }
    return null;
  }
  D.down = (wx, wy, e) => {
    const it = hit(wx, wy);
    select(it);
    if (it) { st.drag = { dx: it.x - wx, dy: it.y - wy }; G.sfx.tap(); st.items.splice(st.items.indexOf(it), 1); st.items.push(it); }
    else st.pan = { sx: e.clientX, sy: e.clientY, cx: st.cx, cy: st.cy }; // drag the floor to look around a big space
  };
  D.move = (wx, wy, e) => {
    if (!st) return;
    if (st.drag && st.sel) { st.sel.x = snap(wx + st.drag.dx); st.sel.y = snap(wy + st.drag.dy); clampIn(st.sel, st.rects); }
    else if (st.pan) { st.cx = G.clamp(st.pan.cx - (e.clientX - st.pan.sx) / W.cam.ppf, st.box[0], st.box[2]); st.cy = G.clamp(st.pan.cy - (e.clientY - st.pan.sy) / W.cam.ppf, st.box[1], st.box[3]); }
  };
  D.up = () => { if (!st) return; if (st.drag) { st.drag = null; G.sfx.thump(); G.persist(); if (st.tab === 'course') fill(); } st.pan = null; };
  D.draw = (c, t) => {
    if (!st) return;
    c.setLineDash([0.5, 0.35]); c.lineDashOffset = -t * 1.2; c.strokeStyle = 'rgba(255,111,177,.9)'; c.lineWidth = 0.12;
    for (const q of st.rects) c.strokeRect(q[0] + 0.1, q[1] + 0.1, q[2] - q[0] - 0.2, q[3] - q[1] - 0.2);
    if (st.sel) { const s = G.itemRect(st.sel); c.strokeStyle = '#4d8dff'; c.lineWidth = 0.14; c.strokeRect(s[0] - 0.2, s[1] - 0.2, s[2] - s[0] + 0.4, s[3] - s[1] + 0.4); }
    c.setLineDash([]);
    G.course.draw(c, t, st.room.id, true);
  };
  D.close = quiet => {
    if (!st) return;
    const id = st.room.id;
    st = W.decor = null; W.mode = 'play'; if (ui) ui.innerHTML = '';
    const b = G.$('#btn-decor'); if (b) b.textContent = '🎨';
    G.persist();
    if (!quiet) { G.sfx.good(); G.beep(G.T(G.course.valid(id) && !G.P().done.say_buildOk ? 'course.buildOk' : 'decorDone')); if (G.course.valid(id)) G.P().done.say_buildOk = 1; G.Q.onDecor && G.Q.onDecor(id); }
  };
})();
