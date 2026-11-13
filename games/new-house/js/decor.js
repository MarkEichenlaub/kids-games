// Decorating: drag the furniture around, add new things from the drawer, paint the room.
(() => {
  const W = G.W, M = G.MAP, A = G.ART;
  const D = G.decor = {};
  let st = null, ui = null;

  const areaOf = room => room.id === 'courtyard' ? room.rects[1] : room.rects[0];
  const clampIn = (it, q) => {
    const d = G.ITEMS[it.t], w = (it.r % 2 ? d.h : d.w) / 2, h = (it.r % 2 ? d.w : d.h) / 2, pad = 0.3;
    it.x = G.clamp(it.x, Math.min(q[0] + w + pad, (q[0] + q[2]) / 2), Math.max(q[2] - w - pad, (q[0] + q[2]) / 2));
    it.y = G.clamp(it.y, Math.min(q[1] + h + pad, (q[1] + q[3]) / 2), Math.max(q[3] - h - pad, (q[1] + q[3]) / 2));
  };
  const snap = v => Math.round(v * 4) / 4;

  D.open = roomId => {
    const room = M.room(roomId); if (!room || !room.deco) return;
    st = W.decor = { room, rect: areaOf(room), items: G.itemsIn(roomId), sel: null, drag: null, tab: 'furniture' };
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
      if (b.dataset.tab) { st.tab = b.dataset.tab; G.sfx.tap(); fill(); }
      else if (b.dataset.a === 'done') D.close();
      else if (b.dataset.a === 'turn' && st.sel) { st.sel.r = ((st.sel.r || 0) + 1) % 4; clampIn(st.sel, st.rect); G.sfx.snap(); G.persist(); }
      else if (b.dataset.a === 'away' && st.sel) { st.items.splice(st.items.indexOf(st.sel), 1); select(null); G.sfx.whoosh(); G.persist(); }
      else if (b.dataset.item) add(b.dataset.item);
      else if (b.dataset.wall) { paint().wall = b.dataset.wall; G.sfx.sparkle(); G.persist(); fill(); }
      else if (b.dataset.floor) { paint().floor = b.dataset.floor; G.sfx.sparkle(); G.persist(); fill(); }
    };
    fill();
    G.$('#btn-decor').textContent = '✅';
    if (!G.P().done.decorHi) { G.P().done.decorHi = 1; G.persist(); G.beep(G.T('decorHi')); }
  };
  const paint = () => G.save.house.paint[st.room.id] || (G.save.house.paint[st.room.id] = {});
  function fill() {
    const box = G.$('#decor-items', ui);
    G.$$('.tab', ui).forEach(t => t.classList.toggle('on', t.dataset.tab === st.tab));
    if (st.tab === 'paint') {
      const p = paint(), outside = st.room.id === 'courtyard';
      box.innerHTML = (outside ? '' : `<div class="swatches"><span>🧱</span>${Object.entries(A.WALLS).map(([k, v]) => `<button class="swatch ${((p.wall || 'white') === k) ? 'on' : ''}" data-wall="${k}" style="background:${v === 'rainbow' ? 'linear-gradient(90deg,#ff8f8f,#ffe483,#a8e6a1,#9cc8ff,#c9a8ff)' : v}"></button>`).join('')}</div>
        <div class="swatches"><span>🟫</span>${Object.entries(A.FLOORS).map(([k, v]) => `<button class="swatch ${((p.floor || 'wood') === k) ? 'on' : ''}" data-floor="${k}" title="${v[0]}" style="background:${k === 'rainbow' ? 'linear-gradient(180deg,#ffb3b3,#fff3a8,#c8f2b4,#b4e1ff,#d4c2ff)' : k === 'checker' ? 'repeating-conic-gradient(#ffc0dc 0 25%,#fff 0 50%) 0 0/20px 20px' : v[1]}">${k === 'space' ? '✨' : ''}</button>`).join('')}</div>`);
      if (outside) box.innerHTML = '<div class="swatches"><span>🌴</span></div>';
      return;
    }
    const list = Object.values(G.ITEMS).filter(d => d.cat === st.tab && G.hasItem(d.id));
    const locked = Object.values(G.ITEMS).filter(d => d.cat === st.tab && !G.hasItem(d.id)).length;
    box.innerHTML = list.map(d => `<button class="item-btn" data-item="${d.id}" title="${d.name}"><img src="${G.itemThumb(d.id)}" alt="${d.name}"></button>`).join('') +
      (locked ? `<div class="item-locked" title="More come in packages">📦 × ${locked}</div>` : '');
  }
  function add(id) {
    if (st.items.length >= 40) { G.sfx.oops(); return; }
    const q = st.rect, it = { t: id, x: snap((q[0] + q[2]) / 2 + (Math.random() - 0.5) * 2), y: snap((q[1] + q[3]) / 2 + (Math.random() - 0.5) * 2), r: 0 };
    clampIn(it, q); st.items.push(it); select(it); G.sfx.pop(); W.puff(it.x, it.y - 0.5, '✨', 5); G.persist();
  }
  function select(it) { st.sel = it; G.$('#decor-tools', ui).classList.toggle('hidden', !it); }
  function hit(wx, wy) {
    let best = null;
    for (const flat of [false, true]) {
      for (let i = st.items.length - 1; i >= 0; i--) {
        const it = st.items[i], d = G.ITEMS[it.t]; if (!d || !!d.flat !== flat) continue;
        const q = G.itemRect(it), pad = 0.25;
        if (wx > q[0] - pad && wx < q[2] + pad && wy > q[1] - pad && wy < q[3] + pad) { best = it; break; }
      }
      if (best) break;
    }
    return best;
  }
  D.down = (wx, wy) => {
    const it = hit(wx, wy);
    select(it);
    if (it) { st.drag = { dx: it.x - wx, dy: it.y - wy }; G.sfx.tap(); st.items.splice(st.items.indexOf(it), 1); st.items.push(it); }
  };
  D.move = (wx, wy) => { if (!st || !st.drag || !st.sel) return; st.sel.x = snap(wx + st.drag.dx); st.sel.y = snap(wy + st.drag.dy); clampIn(st.sel, st.rect); };
  D.up = () => { if (st && st.drag) { st.drag = null; G.sfx.thump(); G.persist(); } };
  D.draw = (c, t) => {
    if (!st) return;
    const q = st.rect;
    c.setLineDash([0.5, 0.35]); c.lineDashOffset = -t * 1.2; c.strokeStyle = 'rgba(255,111,177,.9)'; c.lineWidth = 0.12; c.strokeRect(q[0] + 0.2, q[1] + 0.2, q[2] - q[0] - 0.4, q[3] - q[1] - 0.4);
    if (st.sel) { const s = G.itemRect(st.sel); c.strokeStyle = '#4d8dff'; c.lineWidth = 0.14; c.strokeRect(s[0] - 0.2, s[1] - 0.2, s[2] - s[0] + 0.4, s[3] - s[1] + 0.4); }
    c.setLineDash([]);
  };
  D.close = quiet => {
    if (!st) return;
    st = W.decor = null; W.mode = 'play'; if (ui) ui.innerHTML = '';
    const b = G.$('#btn-decor'); if (b) b.textContent = '🎨';
    G.persist();
    if (!quiet) { G.sfx.good(); G.beep(G.T('decorDone')); G.Q.onDecor && G.Q.onDecor(); }
  };
})();
