// Obstacle courses: the kids lay out pieces in a room (with the decorating drawer),
// then run the course from the start flag to the finish line, clearing each piece in order.
(() => {
  const W = G.W, M = G.MAP;
  const C = G.course = { run: null };
  const kindOf = it => { const d = G.ITEMS[it.t]; return d && d.course ? d.course : null; };
  // a spot on a piece (given in the piece's own frame) -> where that is in the room, and back
  const out = (it, lx, ly) => { const r = it.r || 0; return r === 0 ? [it.x + lx, it.y + ly] : r === 1 ? [it.x - ly, it.y + lx] : r === 2 ? [it.x - lx, it.y - ly] : [it.x + ly, it.y - lx]; };
  const into = (it, x, y) => { const dx = x - it.x, dy = y - it.y, r = it.r || 0; return r === 0 ? [dx, dy] : r === 1 ? [dy, -dx] : r === 2 ? [-dx, -dy] : [-dy, dx]; };
  const inside = (it, x, y, pad = 0) => { const d = G.ITEMS[it.t], [lx, ly] = into(it, x, y); return Math.abs(lx) < d.w / 2 + pad && Math.abs(ly) < d.h / 2 + pad; };

  // ---------- the course in a room ----------
  // { start, finish, obs: obstacles in running order, lava: [] }
  C.parts = roomId => {
    const all = (G.save.house.items[roomId] || []).filter(kindOf);
    const start = all.find(it => kindOf(it).kind === 'start'), finish = all.find(it => kindOf(it).kind === 'finish');
    const lava = all.filter(it => kindOf(it).kind === 'lava');
    let rest = all.filter(it => !['start', 'finish', 'lava'].includes(kindOf(it).kind));
    const obs = [];
    let cur = start || rest[0];
    while (rest.length && cur) { // nearest one next, so the numbers follow a sensible path
      let best = 0, bd = 1e9;
      rest.forEach((it, i) => { const d = G.dist(cur.x, cur.y, it.x, it.y); if (d < bd) { bd = d; best = i; } });
      cur = rest.splice(best, 1)[0]; obs.push(cur);
    }
    return { start, finish, obs, lava };
  };
  C.missing = roomId => { const p = C.parts(roomId); return !p.start ? 'needStart' : !p.finish ? 'needFinish' : !p.obs.length ? 'needMore' : null; };
  C.valid = roomId => !C.missing(roomId);
  C.best = roomId => ((G.save.house.course || {})[roomId] || {})[G.kid().id] || null;
  C.clear = roomId => { const h = G.save.house; if (h.items[roomId]) h.items[roomId] = h.items[roomId].filter(it => !kindOf(it)); };

  // lay out a fresh course along the long side of the room
  C.surprise = roomId => {
    const room = M.room(roomId), q = M.decoRects(room)[0], long = (q[3] - q[1]) >= (q[2] - q[0]);
    const L = long ? q[3] - q[1] : q[2] - q[0], Wd = long ? q[2] - q[0] : q[3] - q[1];
    const small = L < 18;
    const kinds = G.shuffle(small ? ['cHurdle', 'cHoop', 'cTramp', 'cPillows', 'cSpin'] : ['cCones', 'cHurdle', 'cTunnel', 'cBeam', 'cStones', 'cHoop', 'cTramp', 'cPillows', 'cSpin']);
    const n = small ? G.clamp(Math.floor((L - 3.6) / 3.2), 1, 3) : G.clamp(Math.floor((L - 4) / 5.6), 1, G.isLittle() ? 3 : 5);
    C.clear(roomId);
    const items = G.itemsIn(roomId), mid = long ? (q[0] + q[2]) / 2 : (q[1] + q[3]) / 2, flip = Math.random() < 0.5;
    const at = (u, off) => { const a = (long ? q[1] : q[0]) + (flip ? L - u : u), b = mid + off; return long ? [b, a] : [a, b]; };
    const put = (t, u, off, r) => { const [x, y] = at(u, off); const it = { t, x: +x.toFixed(2), y: +y.toFixed(2), r }; items.push(it); return it; };
    const rr = long ? 0 : 1; // long pieces lie along the way you run
    put('cStart', 1.2, 0, rr);
    const gap = (L - 4) / n;
    for (let i = 0; i < n; i++) {
      const t = kinds[i], d = G.ITEMS[t], room2 = Math.max(0, (Wd - Math.min(d.w, Wd)) / 2 - 0.6);
      put(t, 2 + gap * (i + 0.5), (Math.random() * 2 - 1) * Math.min(room2, 1.6), rr);
    }
    put('cFinish', L - 1.2, 0, rr);
    G.persist();
  };

  // ---------- running it ----------
  const hud = () => ({ pill: G.$('#course-pill'), stop: G.$('#btn-stop'), count: G.$('#count') });
  C.locked = () => !!(C.run && C.run.state === 'count');
  C.start = roomId => {
    if (C.run) return;
    const miss = C.missing(roomId);
    if (miss) { G.sfx.oops(); G.beep(G.T('course.' + miss)); return; }
    if (W.mode === 'decor') G.decor.close(true);
    const parts = C.parts(roomId), p = W.player, room = M.room(roomId);
    const s = M.nearestFree(room.floor, parts.start.x, parts.start.y, 4) || [parts.start.x, parts.start.y];
    p.x = s[0]; p.y = s[1]; p.path = null; p.then = null;
    let len = 0, prev = parts.start; for (const it of parts.obs.concat([parts.finish])) { len += G.dist(prev.x, prev.y, it.x, it.y); prev = it; }
    C.run = { room: roomId, parts, i: 0, t: 0, state: 'count', count: 2.4, shown: 4, prog: {}, pen: 0, said: {}, keep: W.target, par: len / 7.2 * 1.35 + parts.obs.length * 1.6 };
    for (const it of parts.obs) it._done = 0;
    const h = hud(); h.pill.classList.remove('hidden'); h.stop.classList.remove('hidden'); h.count.classList.remove('hidden');
    G.beep(G.T('course.ready')); aim();
  };
  function aim() {
    const r = C.run, it = r.parts.obs[r.i] || r.parts.finish, fl = M.room(r.room).floor;
    W.setTarget({ floor: fl, x: it.x, y: it.y, tall: -1.2 });
  }
  C.stop = quiet => {
    const r = C.run; if (!r) return;
    C.run = null; W.setTarget(r.keep || null); W.player.slow = 1; W.player.hidden = false;
    for (const it of r.parts.obs) { delete it._done; delete it._bump; }
    const h = hud(); if (h.pill) { h.pill.classList.add('hidden'); h.stop.classList.add('hidden'); h.count.classList.add('hidden'); }
    if (!quiet) G.sfx.close();
  };
  C.jump = () => { const p = W.player; if (p.hop === 0) { p.hopV = 9.5; G.sfx.boing(); } };
  const sayOnce = (key, line) => { const r = C.run; if (r && !r.said[key]) { r.said[key] = 1; G.beep(line); } };
  function cleared(it) {
    const r = C.run, p = W.player;
    it._done = 1; r.i++; r.prog = {};
    G.sfx.good(); W.puff(it.x, it.y - 1, '⭐', 4, p.floor);
    aim();
    const next = r.parts.obs[r.i];
    if (next) sayOnce('n_' + next.t, G.T('course.next.' + next.t)); else sayOnce('fin', G.T('course.toFinish'));
  }
  function finish() {
    const r = C.run, p = W.player, time = r.t + r.pen, kid = G.kid().id;
    const h = G.save.house; h.course = h.course || {}; h.course[r.room] = h.course[r.room] || {};
    const old = h.course[r.room][kid], best = !old || time < old;
    if (best) h.course[r.room][kid] = +time.toFixed(1);
    const stars = G.isLittle() ? 3 : time <= r.par ? 3 : time <= r.par * 1.6 ? 2 : 1;
    const room = r.room;
    C.stop(true);
    G.sfx.great(); W.celebrate(); G.addStars(stars, ...W.screenOf(p)); G.persist();
    const box = G.modal(`<div class="course-done"><h2>🏁</h2><div class="time">⏱ ${time.toFixed(1)}</div><div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      ${best && old ? '<div class="best">🏆</div>' : ''}<div class="row"><button class="btn" data-a="again">🔁</button><button class="btn done" data-a="ok">✅</button></div></div>`);
    box.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; G.sfx.tap(); G.closeModal(); if (b.dataset.a === 'again') C.start(room); };
    G.beep(G.T('course.done') + (best && old ? ' ' + G.T('course.best') : ''));
    G.Q.onCourse && G.Q.onCourse(room, time);
  }

  // one step of the run (also keeps lava hot and tunnels dark when nobody is racing)
  let lavaT = 0;
  C.tick = dt => {
    const p = W.player, r = C.run, roomId = W.roomId;
    p.slow = 1; p.hidden = false;
    const items = (roomId && G.save.house.items[roomId]) || [];
    let onLava = false, safe = false;
    for (const it of items) {
      const k = kindOf(it); if (!k) continue;
      if (!inside(it, p.x, p.y)) { if (it._bump != null) delete it._bump; continue; }
      const [lx, ly] = into(it, p.x, p.y);
      if (k.slow) p.slow = Math.min(p.slow, k.slow);
      if (k.hide) { p.hidden = true; it._bump = ly; }
      if (k.kind === 'lava') onLava = true;
      else if (k.kind !== 'start' && k.kind !== 'finish' && (!k.pts || k.pts.some(q => G.dist(lx, ly, q[0], q[1]) < k.r))) safe = true;
      // cones wobble away when bumped
      if (k.bump) for (const q of k.bump) if (G.dist(lx, ly, q[0], q[1]) < 0.4 && !(it._bonk > W.t)) { it._bonk = W.t + 0.5; G.sfx.thump(); }
    }
    lavaT -= dt;
    if (onLava && !safe && p.hop === 0) {
      p.hopV = 7.5;
      if (lavaT <= 0) { lavaT = 0.9; G.sfx.sizzle(); W.puff(p.x, p.y - 0.5, '🔥', 2); if (r) { r.pen += 1; sayOnce('lava', G.T('course.lava')); } }
    }
    if (!r) return;
    const h = hud();
    if (r.state === 'count') {
      r.count -= dt; const n = Math.ceil(r.count / 0.6);
      if (n !== r.shown) { r.shown = n; h.count.textContent = n > 0 ? n : 'GO!'; G.sfx.count(n); }
      if (r.count <= -0.5) { r.state = 'go'; h.count.classList.add('hidden'); const first = r.parts.obs[0]; if (first) sayOnce('n_' + first.t, G.T('course.next.' + first.t)); }
      return;
    }
    if (roomId !== r.room) { C.stop(); return; }
    r.t += dt;
    h.pill.textContent = `⏱ ${(r.t + r.pen).toFixed(1)}   ${'✅'.repeat(r.i)}${'⬜'.repeat(r.parts.obs.length - r.i)}🏁`;
    const it = r.parts.obs[r.i];
    if (!it) { if (inside(r.parts.finish, p.x, p.y, 0.3)) finish(); return; }
    if (inside(r.parts.finish, p.x, p.y) && !(r.warn > W.t)) { r.warn = W.t + 4; G.sfx.oops(); G.beep(G.T('course.missed')); }
    const d = G.ITEMS[it.t], k = d.course, [lx, ly] = into(it, p.x, p.y), g = r.prog;
    if (k.kind === 'center') { if (Math.hypot(lx, ly) < k.r) cleared(it); }
    else if (k.kind === 'stay') {
      if (Math.hypot(lx, ly) < k.r) { g.s = (g.s || 0) + dt; it.on = true; p.face = Math.floor(g.s * 8) % 2 ? 1 : -1; if (!g.snd) { g.snd = 1; G.sfx.whoosh(); } if (g.s >= k.secs) { it.on = false; cleared(it); } }
      else { g.s = 0; g.snd = 0; it.on = false; }
    } else if (k.kind === 'points') {
      g.hit = g.hit || {};
      k.pts.forEach((q, j) => { if (!g.hit[j] && G.dist(lx, ly, q[0], q[1]) < k.r) { g.hit[j] = 1; G.sfx.step(j * 2); if (k.hop && p.hop === 0) p.hopV = 6; W.puff(p.x, p.y - 0.4, '✨', 2); } });
      if (Object.keys(g.hit).length === k.pts.length) cleared(it);
    } else if (k.kind === 'ends') {
      const e0 = G.dist(lx, ly, k.ends[0][0], k.ends[0][1]) < k.r, e1 = G.dist(lx, ly, k.ends[1][0], k.ends[1][1]) < k.r;
      if (g.from == null) { if (e0) g.from = 0; else if (e1) g.from = 1; }
      else if ((g.from === 0 && e1) || (g.from === 1 && e0)) { cleared(it); return; }
      else if (k.strict && (Math.abs(lx) > k.strict || Math.abs(ly) > d.h / 2 + 0.4)) { g.from = null; G.sfx.oops(); p.hopV = 5; sayOnce('beam', G.T('course.beamOff')); }
      else if (!k.strict && !inside(it, p.x, p.y, 0.3)) g.from = null;
    } else if (k.kind === 'cross') {
      const near = Math.abs(lx) < k.half;
      if (near && G.isLittle() && Math.abs(ly) < 1.3 && p.hop === 0 && p.moving) C.jump();
      const side = ly > 0.12 ? 1 : ly < -0.12 ? -1 : 0;
      if (near && side && g.side && side !== g.side) {
        if (p.hop > 0.2) { cleared(it); return; }
        // ran into it: bounce back to the side she came from
        const [bx, by] = out(it, lx, g.side * 0.8); p.x = bx; p.y = by; p.path = null; G.sfx.thump(); W.puff(bx, by - 1, '💫', 3); sayOnce('bonk', G.T('course.bonk'));
        return;
      }
      if (side && Math.abs(ly) < 2.5) g.side = side; else if (Math.abs(ly) >= 2.5) g.side = 0;
    }
  };

  // numbers and a dotted path, while running and while building
  C.draw = (c, t, roomId, building) => {
    const r = C.run, id = r ? r.room : roomId; if (!id) return;
    const p = r ? r.parts : C.parts(id); if (!p.start && !p.obs.length) return;
    const pts = [].concat(p.start ? [p.start] : [], p.obs, p.finish ? [p.finish] : []);
    if (building || r) {
      c.setLineDash([0.4, 0.4]); c.lineDashOffset = -t * 1.5; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 0.14; c.beginPath();
      pts.forEach((it, i) => i ? c.lineTo(it.x, it.y) : c.moveTo(it.x, it.y)); c.stroke(); c.setLineDash([]);
    }
    p.obs.forEach((it, i) => {
      const done = r && i < r.i, next = r && i === r.i, y = it.y - 0.2;
      G.ART.circ(c, it.x, y, next ? 0.62 + 0.08 * Math.sin(t * 8) : 0.5, done ? '#4cd97b' : next ? '#ffd93d' : '#fff', '#4a3f63');
      G.ART.text(c, done ? '✓' : String(i + 1), it.x, y + 0.03, 0.62, '#4a3f63', 700);
    });
  };
})();
