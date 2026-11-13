// Walking around the house: the camera, feet, taps, stairs, rooms and stamps.
(() => {
  const M = G.MAP, A = G.ART;
  const W = G.W = { props: [], parts: [], npcs: [], mode: 'play', t: 0, floor: 1 };
  let cv, ctx, raf = 0, last = 0, root = null, dpr = 1, vw = 0, vh = 0;
  const keys = {};
  const SPEED = 7.2, REACH = 2.1;
  const OUTSIDE = ['courtyard', 'alley', 'yard', 'porch'];

  const mkChar = (who, x, y, floor) => ({ who, x, y, floor, face: 1, moving: false, path: null, hop: 0, hopV: 0, hold: null, t: Math.random() * 5, costume: (G.save.profiles[who] || G.defaultProfile(who)).costume });
  const rectDist = (px, py, x, y, w, h) => Math.hypot(Math.max(x - px, 0, px - (x + w)), Math.max(y - py, 0, py - (y + h)));

  // ---------- camera ----------
  W.cam = { x: 12, y: 60, ppf: 36 };
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1); vw = root.clientWidth; vh = root.clientHeight;
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
    if (G.V3.ok) G.V3.resize(vw, vh);
  }
  const basePpf = () => G.clamp(Math.min(vw / 34, vh / 21), 18, 64);
  function aimCamera(dt, snap) {
    const p = W.player, F = M.floors[W.floor];
    let tx = p.x, ty = p.y - 1.2, ppf = basePpf();
    if (W.mode === 'decor' && W.decor) {
      const q = W.decor.box, fit = Math.min(vw / (q[2] - q[0] + 3), (vh - 260) / (q[3] - q[1] + 1.5));
      ppf = Math.max(fit, Math.min(24, basePpf()));
      const big = ppf > fit + 0.01;
      tx = big ? W.decor.cx : (q[0] + q[2]) / 2; ty = (big ? W.decor.cy : (q[1] + q[3]) / 2) + 60 / ppf;
    } else if (W.p2 && W.sis.floor === p.floor) {
      const s = W.sis; tx = (p.x + s.x) / 2; ty = (p.y + s.y) / 2 - 1.2;
      ppf = G.clamp(Math.min(vw / (Math.abs(p.x - s.x) + 12), vh / (Math.abs(p.y - s.y) + 10)), 12, ppf);
    }
    if (W.mode !== 'decor') {
      const hw = vw / ppf / 2, hh = vh / ppf / 2, b = F.bounds;
      tx = (b[2] - b[0] <= hw * 2) ? (b[0] + b[2]) / 2 : G.clamp(tx, b[0] + hw, b[2] - hw);
      ty = (b[3] - b[1] <= hh * 2) ? (b[1] + b[3]) / 2 : G.clamp(ty, b[1] + hh, b[3] - hh);
    }
    const k = snap ? 1 : Math.min(1, dt * 5);
    W.cam.x += (tx - W.cam.x) * k; W.cam.y += (ty - W.cam.y) * k; W.cam.ppf += (ppf - W.cam.ppf) * (snap ? 1 : Math.min(1, dt * 4));
  }
  // the flat map by default; the 3D view answers instead while it is on
  W.toScreen = (x, y) => G.V3.on ? G.V3.toScreen(x, y) : [(x - W.cam.x) * W.cam.ppf + vw / 2, (y - W.cam.y) * W.cam.ppf + vh / 2];
  W.toWorld = (sx, sy, pick) => G.V3.on ? G.V3.toWorld(sx, sy, pick) : [(sx - vw / 2) / W.cam.ppf + W.cam.x, (sy - vh / 2) / W.cam.ppf + W.cam.y];

  // ---------- little effects in the world ----------
  W.puff = (x, y, ch = '✨', n = 6, floor = W.floor) => { for (let i = 0; i < n; i++) W.parts.push({ x, y, floor, vx: (Math.random() - 0.5) * 4, vy: -1.5 - Math.random() * 3, life: 0.7 + Math.random() * 0.5, age: 0, ch, size: 0.5 + Math.random() * 0.4 }); };
  W.celebrate = (x, y) => { const p = W.player; W.puff(x ?? p.x, (y ?? p.y) - 2, '⭐', 8); G.confetti(50); };
  W.screenOf = ch => G.V3.on ? G.V3.toScreen(ch.x, ch.y, 4.2) : W.toScreen(ch.x, ch.y - 3.6);

  // ---------- things lying around (boxes, hidden toys, packages) ----------
  W.addProp = p => { W.removeProp(p.id); W.props.push(Object.assign({ size: 1.3, r: 1.1, bob: 1, floor: 1 }, p)); return p; };
  W.removeProp = id => { W.props = W.props.filter(p => p.id !== id); };
  W.prop = id => W.props.find(p => p.id === id);
  W.setTarget = tg => { W.target = tg || null; };

  // ---------- feet ----------
  function tryMove(ch, dx, dy, dist) {
    let moved = false;
    const nx = ch.x + dx * dist, ny = ch.y + dy * dist;
    if (dx && M.free(ch.floor, nx, ch.y)) { ch.x = nx; moved = true; }
    if (dy && M.free(ch.floor, ch.x, ny)) { ch.y = ny; moved = true; }
    if (!moved) { // slide around a corner
      for (const k of [0.35, -0.35, 0.7, -0.7]) {
        if (dx && !dy && M.free(ch.floor, nx, ch.y + k)) { ch.y += Math.sign(k) * dist; moved = true; break; }
        if (dy && !dx && M.free(ch.floor, ch.x + k, ny)) { ch.x += Math.sign(k) * dist; moved = true; break; }
      }
    }
    if (dx) ch.face = dx > 0 ? 1 : -1;
    return moved;
  }
  function follow(ch, dt, speed) {
    if (!ch.path || !ch.path.length) { ch.path = null; return false; }
    let budget = speed * dt;
    while (budget > 0 && ch.path.length) {
      const [tx, ty] = ch.path[0], d = G.dist(ch.x, ch.y, tx, ty);
      if (d < 0.05) { ch.path.shift(); continue; }
      const s = Math.min(d, budget);
      if (Math.abs(tx - ch.x) > 0.05) ch.face = tx > ch.x ? 1 : -1;
      ch.x += (tx - ch.x) / d * s; ch.y += (ty - ch.y) / d * s; budget -= s;
      if (s === d) ch.path.shift();
    }
    if (!ch.path.length) ch.path = null;
    return true;
  }
  W.walkTo = (x, y, then) => {
    const p = W.player;
    const path = M.path(p.floor, p.x, p.y, x, y);
    p.path = path; p.then = path ? (then || null) : null;
    if (!path && then && G.dist(p.x, p.y, x, y) < REACH + 1) then();
    return !!path;
  };
  W.place = (ch, floor, x, y) => { const s = M.nearestFree(floor, x, y, 6) || [x, y]; ch.floor = floor; ch.x = s[0]; ch.y = s[1]; ch.path = null; };
  function unstick(ch) { if (!M.free(ch.floor, ch.x, ch.y)) { const s = M.nearestFree(ch.floor, ch.x, ch.y, 8); if (s) { ch.x = s[0]; ch.y = s[1]; } } }

  // ---------- stairs ----------
  let cut = null;
  function climb(to) {
    const p = W.player, from = p.floor, Fa = M.floors[from], Fb = M.floors[to];
    cut = { t: 0, from, to, sx: p.x, sy: p.y, notes: 0, switched: false };
    W.mode = 'cut'; p.path = null; p.then = null;
    cut.a = Fa.stairs.run[1]; cut.b = Fb.stairs.run[1]; cut.end = Fb.stairs.arrive;
  }
  function tickCut(dt) {
    const p = W.player, D = 1.3; cut.t += dt;
    const k = cut.t / D, up = cut.to > cut.from;
    const want = Math.floor(k * 8);
    while (cut.notes <= want && cut.notes < 8) { G.sfx.step(up ? cut.notes : 7 - cut.notes); cut.notes++; }
    p.moving = true;
    if (k < 0.5) { const u = k / 0.5; p.x = G.lerp(cut.sx, cut.a[0], u); p.y = G.lerp(cut.sy, cut.a[1], u); p.face = 1; }
    else {
      if (!cut.switched) { cut.switched = true; p.floor = cut.to; W.floor = cut.to; aimCamera(0, true); }
      const u = Math.min(1, (k - 0.5) / 0.5); p.x = G.lerp(cut.b[0], cut.end[0], u); p.y = G.lerp(cut.b[1], cut.end[1], u); p.face = -1;
    }
    fadeEl.style.opacity = String(Math.max(0, 1 - Math.abs(k - 0.5) * 4));
    if (k >= 1) {
      W.mode = 'play'; fadeEl.style.opacity = '0'; cut = null; unstick(p);
      for (const o of [W.sis, W.pet]) if (o) W.place(o, p.floor, p.x + (o === W.sis ? 1.4 : -1.2), p.y + 0.8);
      hud.floor.textContent = p.floor === 2 ? '⬆️ Upstairs' : '⬇️ Downstairs';
      G.Q && G.Q.onFloor && G.Q.onFloor(p.floor);
    }
  }

  // ---------- rooms and stamps ----------
  W.roomId = null;
  function enterRoom(r) {
    W.roomId = r ? r.id : null;
    hud.room.textContent = r ? M.roomIcon(r) + ' ' + M.roomName(r) : '';
    hud.decor.classList.toggle('hidden', !(r && r.deco));
    hud.photo.classList.toggle('hidden', !(r && G.photosFor(r.id).length));
    if (!r) return;
    const P = G.P();
    if (!P.stamps[r.id] && P.intro) {
      P.stamps[r.id] = 1; G.persist();
      G.sfx.stamp(); G.addStars(1, ...W.screenOf(W.player));
      W.puff(W.player.x, W.player.y - 2.5, M.roomIcon(r), 1); W.puff(W.player.x, W.player.y - 2, '✨', 6);
      stampFx(r);
      const n = Object.keys(P.stamps).length, all = M.rooms.length;
      updateHud();
      G.beep(G.roomLine(r)).then(() => { if (n === all) G.Q.allStamps(); });
      showPolaroid(r);
    }
    G.Q && G.Q.onRoom && G.Q.onRoom(r.id);
  }
  function stampFx(r) {
    const e = G.html(`<div class="stamp-pop"><div class="stamp"><span>${M.roomIcon(r)}</span><b>${M.roomName(r)}</b></div></div>`);
    G.$('#fx-layer').appendChild(e); setTimeout(() => e.remove(), 2300);
  }
  async function showPolaroid(r, big) {
    const ids = G.photosFor(r.id); if (!ids.length) return;
    const url = await G.photo(ids[0]); if (!url || W.roomId !== r.id) return;
    if (big) return W.photoModal(r);
    hud.pol.innerHTML = `<img src="${url}" alt=""><span>The real ${M.roomName(r)}!</span>`;
    hud.pol.classList.remove('hidden'); hud.pol.onclick = () => { G.sfx.tap(); W.photoModal(r); };
    clearTimeout(hud.polT); hud.polT = setTimeout(() => hud.pol.classList.add('hidden'), 9000);
  }
  W.photoModal = async r => {
    const ids = G.photosFor(r.id); if (!ids.length) return;
    let i = 0;
    const box = G.modal(`<div class="photo-view"><h2>${M.roomIcon(r)} The real ${M.roomName(r)}</h2><img alt=""><div class="row"><button class="btn" data-a="prev">⬅️</button><button class="btn" data-a="next">➡️</button></div></div>`, { cls: 'wide' });
    const show = async () => { const u = await G.photo(ids[i]); if (u) box.querySelector('img').src = u; };
    box.querySelector('[data-a=prev]').onclick = () => { G.sfx.tap(); i = (i + ids.length - 1) % ids.length; show(); };
    box.querySelector('[data-a=next]').onclick = () => { G.sfx.tap(); i = (i + 1) % ids.length; show(); };
    if (ids.length < 2) box.querySelector('.row').remove();
    show(); G.beep(G.T('realPhoto'));
  };

  // ---------- what can be touched ----------
  function touchables() {
    const out = [], fl = W.floor;
    for (const f of M.floors[fl].fixtures) if (f.act) out.push({ kind: 'fx', o: f, x: f.x, y: f.y, w: f.w, h: f.h });
    for (const p of W.props) if (p.floor === fl && p.onTap) out.push({ kind: 'prop', o: p, x: p.x - p.r, y: p.y - p.r * 1.6, w: p.r * 2, h: p.r * 2 });
    for (const n of W.npcs) if (n.floor === fl) out.push({ kind: 'npc', o: n, x: n.x - 1, y: n.y - 4.6, w: 2, h: 4.8 });
    for (const r of M.rooms) if (r.floor === fl && G.save.house.items[r.id]) for (const it of G.save.house.items[r.id]) {
      const d = G.ITEMS[it.t]; if (!d || !(d.tap || d.sfx || d.box)) continue;
      const q = G.itemRect(it); out.push({ kind: 'item', o: it, room: r.id, x: q[0], y: q[1], w: q[2] - q[0], h: q[3] - q[1] });
    }
    return out;
  }
  function nearest(maxD) {
    const p = W.player; let best = null, bd = maxD;
    for (const tb of touchables()) {
      const d = tb.kind === 'npc' ? G.dist(p.x, p.y, tb.o.x, tb.o.y) : rectDist(p.x, p.y, tb.x, tb.y, tb.w, tb.h);
      const pri = tb.kind === 'prop' || tb.kind === 'npc' ? d - 0.6 : d;
      if (pri < bd) { bd = pri; best = tb; }
    }
    return best;
  }
  function touch(tb) {
    const p = W.player;
    const cx = tb.x + tb.w / 2;
    if (Math.abs(cx - p.x) > 0.3) p.face = cx > p.x ? 1 : -1;
    if (tb.kind === 'fx') G.acts.run(tb.o);
    else if (tb.kind === 'prop') tb.o.onTap(tb.o);
    else if (tb.kind === 'npc') tb.o.onTap && tb.o.onTap(tb.o);
    else if (tb.kind === 'item') G.acts.item(tb.o, tb.room);
  }
  function goTouch(tb) {
    const p = W.player;
    const d = tb.kind === 'npc' ? G.dist(p.x, p.y, tb.o.x, tb.o.y) : rectDist(p.x, p.y, tb.x, tb.y, tb.w, tb.h);
    if (d <= REACH) { p.path = null; touch(tb); return; }
    const tx = tb.kind === 'npc' ? tb.o.x : G.clamp(p.x, tb.x, tb.x + tb.w), ty = tb.kind === 'npc' ? tb.o.y + 1.2 : G.clamp(p.y, tb.y, tb.y + tb.h);
    // stand at the closest open spot next to it
    let best = null, bd = 1e9;
    for (let a = 0; a < 24; a++) for (const rad of [1.0, 1.5, 2.0]) {
      const cx = G.clamp(tx + Math.cos(a / 24 * 6.283) * 6, tb.x - rad, tb.x + tb.w + rad), cy = G.clamp(ty + Math.sin(a / 24 * 6.283) * 6, tb.y - rad, tb.y + tb.h + rad);
      if (!M.free(p.floor, cx, cy)) continue;
      const dd = G.dist(p.x, p.y, cx, cy) + rad * 2; if (dd < bd) { bd = dd; best = [cx, cy]; }
    }
    if (!best) { W.walkTo(tx, ty); return; }
    W.walkTo(best[0], best[1], () => {
      const d2 = tb.kind === 'npc' ? G.dist(p.x, p.y, tb.o.x, tb.o.y) : rectDist(p.x, p.y, tb.x, tb.y, tb.w, tb.h);
      if (d2 <= REACH + 1.2) touch(tb);
    });
  }
  W.act = () => { if (G.course.run) return G.course.jump(); const tb = nearest(REACH + 0.4); if (tb) touch(tb); else { G.sfx.tap(); W.player.hopV = 5; } };

  // ---------- pointer and keys ----------
  let held = false, heldAt = 0;
  function onDown(e) {
    if (W.mode === 'cut' || G.modalOpen()) return;
    G.audio();
    const r = cv.getBoundingClientRect(), [wx, wy] = W.toWorld(e.clientX - r.left, e.clientY - r.top, true);
    if (W.mode === 'decor') { G.decor.down(wx, wy, e); return; }
    let hit = null, bd = 1e9;
    for (const tb of touchables()) {
      const pad = tb.kind === 'fx' && tb.w * tb.h < 1 ? 0.7 : 0.25;
      if (wx > tb.x - pad && wx < tb.x + tb.w + pad && wy > tb.y - pad && wy < tb.y + tb.h + pad) { const d = G.dist(wx, wy, tb.x + tb.w / 2, tb.y + tb.h / 2) - (tb.kind === 'prop' || tb.kind === 'npc' ? 2 : 0); if (d < bd) { bd = d; hit = tb; } }
    }
    if (hit && !G.course.run) { goTouch(hit); return; }
    held = true; heldAt = 0;
    if (!W.walkTo(wx, wy)) G.sfx.click();
    W.tapMark = { x: wx, y: wy, age: 0 };
  }
  function onMove(e) {
    const r = cv.getBoundingClientRect(), [wx, wy] = W.toWorld(e.clientX - r.left, e.clientY - r.top);
    if (W.mode === 'decor') { G.decor.move(wx, wy, e); return; }
    if (!held || W.mode !== 'play') return;
    if (W.t - heldAt > 0.14) { heldAt = W.t; W.walkTo(wx, wy); }
  }
  function onUp(e) { held = false; if (W.mode === 'decor') G.decor.up(e); G.V3.release && G.V3.release(); }
  const KEYMAP = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l2', d: 'r2', w: 'u2', s: 'd2', A: 'l2', D: 'r2', W: 'u2', S: 'd2' };
  function onKey(e) {
    if (G.current !== 'world') return;
    const down = e.type === 'keydown', k = KEYMAP[e.key];
    if (k) { keys[k] = down; e.preventDefault(); if (down) G.audio(); return; }
    if (!down || G.modalOpen()) { if (down && e.key === 'Escape') G.closeModal(); return; }
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') { e.preventDefault(); if (W.mode === 'play') W.act(); }
    else if (e.key === 'Escape' && W.mode === 'decor') G.decor.close();
  }

  // ---------- one step of the world ----------
  function tick(dt) {
    W.t += dt;
    const p = W.player;
    for (const ch of [p, W.sis]) { ch.t += dt; if (ch.hop > 0 || ch.hopV) { ch.hopV -= 30 * dt; ch.hop += ch.hopV * dt; if (ch.hop <= 0) { ch.hop = 0; ch.hopV = 0; } } }
    if (W.mode === 'cut') { tickCut(dt); return; }
    if (W.floor !== p.floor) { W.floor = p.floor; hud.floor.textContent = p.floor === 2 ? '⬆️ Upstairs' : '⬇️ Downstairs'; }
    if (W.mode === 'play' && !G.modalOpen()) {
      // player one
      let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
      if (G.V3.on && (dx || dy)) [dx, dy] = G.V3.keyDir(dx, dy); // arrow keys follow the way the 3D view is turned
      const sp = SPEED * (p.slow || 1);
      if (G.course.locked()) { p.path = null; p.moving = false; }
      else if (dx || dy) { p.path = null; p.then = null; const n = Math.hypot(dx, dy); p.moving = tryMove(p, dx / n, dy / n, sp * dt); }
      else if (p.path) { p.moving = follow(p, dt, sp); if (!p.path) { p.moving = false; const th = p.then; p.then = null; if (th) th(); } }
      else p.moving = false;
      // stairs
      const z = M.floors[p.floor].stairs.zone;
      if (M.inRect(z, p.x, p.y)) { climb(p.floor === 1 ? 2 : 1); return; }
    } else p.moving = false;
    // sister: the second player's keys, or she tags along
    const s = W.sis, sx = (keys.r2 ? 1 : 0) - (keys.l2 ? 1 : 0), sy = (keys.d2 ? 1 : 0) - (keys.u2 ? 1 : 0);
    if ((sx || sy) && s.floor === p.floor && W.mode === 'play') { W.p2 = true; W.p2T = W.t; s.path = null; const n = Math.hypot(sx, sy); s.moving = tryMove(s, sx / n, sy / n, SPEED * dt); }
    else {
      if (W.p2 && W.t - W.p2T > 20) W.p2 = false;
      if (!W.p2) tagAlong(s, p, 2.6, 1.4, dt);
      else s.moving = false;
    }
    if (W.pet) { W.pet.t += dt; tagAlong(W.pet, s.floor === p.floor && W.pet.buddy === 'sis' ? s : p, 1.8, -1.1, dt, 8.5); }
    // balls roll, hopscotch sings, beds bounce, obstacle courses run
    itemsTick(dt);
    if (W.mode === 'play') G.course.tick(dt);
    // which room?
    const r = M.roomAt(p.floor, p.x, p.y);
    if ((r ? r.id : null) !== W.roomId) enterRoom(r);
    // sparkles
    for (const q of W.parts) { q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 6 * dt; }
    W.parts = W.parts.filter(q => q.age < q.life);
    if (W.tapMark) { W.tapMark.age += dt; if (W.tapMark.age > 0.5) W.tapMark = null; }
    hintTick(dt);
    G.Q && G.Q.tick && G.Q.tick(dt);
    saveT += dt; if (saveT > 3) { saveT = 0; const P = G.P(); P.pos = { floor: p.floor, x: +p.x.toFixed(1), y: +p.y.toFixed(1) }; G.persist(); }
  }
  let saveT = 0;
  function tagAlong(ch, lead, far, side, dt, speed = SPEED * 1.05) {
    if (ch.floor !== lead.floor) { ch.wait = (ch.wait || 0) + dt; if (ch.wait > 0.7) { ch.wait = 0; W.place(ch, lead.floor, lead.x - lead.face * 1.2, lead.y + 0.6); } ch.moving = false; return; }
    const d = G.dist(ch.x, ch.y, lead.x, lead.y);
    ch.think = (ch.think || 0) - dt;
    if (d > 14) W.place(ch, lead.floor, lead.x - lead.face * 1.2, lead.y + 0.6);
    else if (d > far && ch.think <= 0) { ch.think = 0.35; ch.path = M.path(ch.floor, ch.x, ch.y, lead.x - lead.face * (Math.abs(side) + 0.6), lead.y + (side > 0 ? 0.5 : -0.4)); }
    if (ch.path && d > 1.9) ch.moving = follow(ch, dt, speed); else { ch.path = null; ch.moving = false; }
  }
  function itemsTick(dt) {
    const p = W.player, r = W.roomId && M.room(W.roomId);
    for (const ch of [p, W.sis]) {
      const cr = M.roomAt(ch.floor, ch.x, ch.y); if (!cr || !G.save.house.items[cr.id]) continue;
      for (const it of G.save.house.items[cr.id]) {
        const d = G.ITEMS[it.t]; if (!d) continue;
        const q = G.itemRect(it), inside = ch.x > q[0] && ch.x < q[2] && ch.y > q[1] && ch.y < q[3];
        if (d.bounce && inside && ch.hop === 0 && ch.moving) { ch.hopV = 6 + d.bounce * 7; if (ch === p) G.sfx.boing(); }
        if (d.steps && inside && ch === p) { const n = Math.floor(((it.r % 2 ? (ch.x - q[0]) / (q[2] - q[0]) : (q[3] - ch.y) / (q[3] - q[1]))) * d.steps); if (n !== it._n) { it._n = n; G.sfx.note(G.clamp(n, 0, 7)); } }
        if (d.kick && G.dist(ch.x, ch.y, it.x, it.y) < 1 && ch.moving) { const a = Math.atan2(it.y - ch.y, it.x - ch.x); it.vx = Math.cos(a) * 11; it.vy = Math.sin(a) * 11; if (ch === p && !(it._k > W.t)) { G.sfx.thump(); it._k = W.t + 0.3; } }
      }
    }
    if (r && G.save.house.items[r.id]) for (const it of G.save.house.items[r.id]) {
      if (!it.vx && !it.vy) continue;
      const nx = it.x + it.vx * dt, ny = it.y + it.vy * dt;
      if (M.free(r.floor, nx, it.y) && M.roomAt(r.floor, nx, it.y) === r) it.x = nx; else it.vx = -it.vx * 0.7;
      if (M.free(r.floor, it.x, ny) && M.roomAt(r.floor, it.x, ny) === r) it.y = ny; else it.vy = -it.vy * 0.7;
      it.vx *= 1 - 2.2 * dt; it.vy *= 1 - 2.2 * dt; it.hop = 1;
      if (Math.hypot(it.vx, it.vy) < 0.4) { it.vx = it.vy = 0; it.hop = 0; it.x = +it.x.toFixed(2); it.y = +it.y.toFixed(2); G.persist(); }
    }
  }
  let hintT = 0;
  function hintTick(dt) {
    hintT -= dt; if (hintT > 0) return; hintT = 0.15;
    const run = G.course.run;
    W.near = W.mode === 'play' && !run ? nearest(REACH) : null;
    hud.act.classList.toggle('hidden', !W.near && !run); hud.act.textContent = run ? '⬆️' : '👆';
    const can = W.mode === 'play' && !run && W.roomId && G.course.valid(W.roomId);
    hud.go.classList.toggle('hidden', !can);
    if (can && !G.P().done.say_courseFound && G.P().intro) { G.P().done.say_courseFound = 1; G.persist(); G.beep(G.T('course.found'), { queue: true }); }
  }

  // ---------- drawing ----------
  function draw() {
    const c = ctx, fl = W.floor, t = W.t, F = M.floors[fl];
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, vw, vh);
    c.translate(vw / 2, vh / 2); c.scale(W.cam.ppf, W.cam.ppf); c.translate(-W.cam.x, -W.cam.y);
    const hw = vw / W.cam.ppf / 2 + 6, hh = vh / W.cam.ppf / 2 + 8;
    const vis = (x, y, w, h) => x + w > W.cam.x - hw && x < W.cam.x + hw && y + h > W.cam.y - hh && y < W.cam.y + hh;
    A.ground(c, fl, t); A.floors(c, fl);
    for (const f of F.fixtures) if (f.flat && vis(f.x, f.y, f.w, f.h)) A.fixture(c, f, t);
    const ents = [], solids = [], overs = [];
    for (const r of M.rooms) if (r.floor === fl) for (const it of G.itemsIn(r.id)) {
      const d = G.ITEMS[it.t]; if (!d) continue;
      const q = G.itemRect(it); if (!vis(q[0], q[1], q[2] - q[0], q[3] - q[1])) continue;
      if (d.flat) drawItem(c, it, t); else if (d.over) overs.push(it); else solids.push(it);
    }
    A.sunbeams(c, fl, t);
    A.walls(c, fl);
    for (const f of F.fixtures) if (!f.flat && vis(f.x - 2, f.y - 2, f.w + 4, f.h + 4)) A.fixture(c, f, t);
    for (const it of solids) drawItem(c, it, t);
    for (const p of W.props) if (p.floor === fl) ents.push([p.y, () => drawProp(c, p, t)]);
    for (const n of W.npcs) if (n.floor === fl) ents.push([n.y, () => { c.save(); c.translate(n.x, n.y); A.grownup(c, { who: n.who, t, mark: n.mark, wave: n.wave, apron: n.apron }); c.restore(); }]);
    const kid = ch => !ch.hidden && ents.push([ch.y, () => { c.save(); c.translate(ch.x, ch.y); A.kid(c, { who: ch.who, costume: ch.costume, t: ch.t, moving: ch.moving, face: ch.face, bounce: ch.hop, hold: ch.hold }); c.restore(); }]);
    const deco = W.mode === 'decor';
    if (W.sis.floor === fl && !deco) kid(W.sis);
    if (W.player.floor === fl && !deco) kid(W.player);
    if (W.pet && W.pet.floor === fl && !deco) ents.push([W.pet.y, () => { c.save(); c.translate(W.pet.x, W.pet.y); A.pet(c, W.pet); c.restore(); }]);
    ents.sort((a, b) => a[0] - b[0]);
    for (const e of ents) e[1]();
    for (const it of overs) drawItem(c, it, t);
    if (W.mode === 'decor') G.decor.draw(c, t); else G.course.draw(c, t, null, false);
    // where you tapped, what you can touch, where to go
    if (W.tapMark) { c.globalAlpha = 1 - W.tapMark.age * 2; A.circ(c, W.tapMark.x, W.tapMark.y, 0.3 + W.tapMark.age * 1.2, null, '#fff'); c.globalAlpha = 1; }
    if (W.near && W.mode === 'play') { const n = W.near; A.emoji(c, '👆', n.x + n.w / 2 + 0.3, n.y + n.h + 0.5 + Math.sin(t * 6) * 0.14, 0.9); }
    const tg = W.target;
    if (tg && tg.floor === fl && W.mode === 'play') {
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      c.strokeStyle = `rgba(255,217,61,${0.9 - pulse * 0.4})`; c.lineWidth = 0.14; c.beginPath(); c.ellipse(tg.x, tg.y, 0.9 + pulse * 0.4, 0.45 + pulse * 0.2, 0, 0, 6.283); c.stroke();
      A.emoji(c, '⭐', tg.x, tg.y - 3.6 - (tg.tall || 0) - pulse * 0.4, 1.1);
    }
    for (const q of W.parts) if (q.floor === fl) { c.globalAlpha = Math.max(0, 1 - q.age / q.life); A.emoji(c, q.ch, q.x, q.y, q.size); c.globalAlpha = 1; }
    if (W.dark && W.mode !== 'decor') {
      const [sx, sy] = W.toScreen(W.player.x, W.player.y - 1.6), r = W.cam.ppf * 5.5;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = c.createRadialGradient(sx, sy, r * 0.35, sx, sy, r);
      g.addColorStop(0, 'rgba(12,8,45,0)'); g.addColorStop(1, 'rgba(12,8,45,.9)');
      c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    }
    arrow();
  }
  function drawItem(c, it, t) { A.item(c, it, t); }
  function drawProp(c, p, t) {
    const y = p.y - (p.bob ? Math.abs(Math.sin(t * 3 + p.x)) * 0.18 : 0) - p.size * 0.45;
    if (p.glow) { c.fillStyle = `rgba(255,236,150,${0.28 + 0.14 * Math.sin(t * 4)})`; c.beginPath(); c.arc(p.x, p.y - p.size * 0.4, p.size * 0.95, 0, 6.283); c.fill(); }
    A.oval(c, p.x, p.y, p.size * 0.36, p.size * 0.12, 'rgba(40,30,70,.2)', null);
    if (p.peek) { c.save(); c.beginPath(); c.rect(p.x - p.size, y - p.size, p.size * 2, p.size * (0.95 + 0.2 * Math.sin(t * 2.4 + p.y))); c.clip(); A.emoji(c, p.icon, p.x + Math.sin(t * 9 + p.x) * (p.wiggle ? 0.08 : 0), y, p.size); c.restore(); }
    else A.emoji(c, p.icon, p.x, y, p.size, p.wiggle ? Math.sin(t * 9) * 0.12 : 0);
    if (p.tag) A.emoji(c, p.tag, p.x + p.size * 0.5, y - p.size * 0.6, p.size * 0.5);
  }
  // an arrow at the edge of the screen when the place to go is out of sight
  function arrow() {
    const tg = W.target, el = hud.arrow;
    if (!tg || W.mode !== 'play') { el.classList.add('hidden'); return; }
    let gx = tg.x, gy = tg.y;
    if (tg.floor !== W.floor) { const s = M.stairGoal(W.floor); gx = s[0]; gy = s[1]; }
    const [sx, sy] = W.toScreen(gx, gy - 1.5), m = 70;
    if (sx > m && sx < vw - m && sy > m + 40 && sy < vh - m && tg.floor === W.floor) { el.classList.add('hidden'); return; }
    const cx = G.clamp(sx, m, vw - m), cy = G.clamp(sy, m + 50, vh - m - 40);
    const [px, py] = W.toScreen(W.player.x, W.player.y - 1.5);
    const a = Math.atan2(sy - py, sx - px);
    const onS = sx > m && sx < vw - m && sy > m + 40 && sy < vh - m;
    el.classList.remove('hidden');
    el.style.transform = `translate(${onS ? sx : cx}px, ${onS ? sy - 90 : cy}px) rotate(${onS ? Math.PI / 2 : a}rad)`;
    el.textContent = '➤';
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    try { tick(dt); if (G.V3.on) { G.V3.render(dt, W.t); arrow(); } else { aimCamera(dt); draw(); } } catch (e) { console.error(e); }
  }

  // ---------- the play screen ----------
  const hud = {};
  let fadeEl = null;
  function updateHud() {
    const P = G.P();
    hud.stamps.textContent = Object.keys(P.stamps).length + '/' + M.rooms.length;
    G.$$('.star-count').forEach(e => e.textContent = P.stars);
  }
  W.updateHud = updateHud;
  W.refreshRoom = () => { const r = W.roomId && M.room(W.roomId); if (r) hud.room.textContent = M.roomIcon(r) + ' ' + M.roomName(r); };
  W.setQuestPill = (txt, onTap) => { hud.quest.classList.toggle('hidden', !txt); hud.quest.textContent = txt || ''; hud.quest.onclick = onTap || null; };
  W.setPet = id => {
    G.save.house.pet = id; G.persist();
    W.pet = id ? { id, x: W.player.x - 1, y: W.player.y + 0.5, floor: W.player.floor, face: 1, t: 0, moving: false } : null;
  };

  G.screens.world = {
    enter(r) {
      root = r; root.className = 'world';
      root.innerHTML = `<canvas id="cv"></canvas>
        <div class="hud top">
          <button class="round-btn" id="btn-menu" title="Menu">🏠</button>
          <div class="pill" id="room-pill"></div>
          <div class="pill small" id="floor-pill">⬇️ Downstairs</div>
          <div class="spacer"></div>
          <div class="pill course hidden" id="course-pill"></div>
          <button class="round-btn hidden" id="btn-stop" title="Stop">✖</button>
          <div class="pill quest hidden" id="quest-pill"></div>
          <button class="round-btn wide" id="btn-view" title="Change the view">🗺️</button>
          <button class="round-btn hidden" id="btn-photo" title="Real photo">📷</button>
          <button class="round-btn wide" id="btn-pass" title="Passport">📖 <span id="stamp-count"></span></button>
          <div class="pill">⭐ <span class="star-count">0</span></div>
        </div>
        <div class="hud side">
          <button class="big-btn go hidden" id="btn-go" title="Run the obstacle course">🏁</button>
          <button class="big-btn hidden" id="btn-decor" title="Decorate">🎨</button>
          <button class="big-btn hidden" id="btn-act" title="Touch">👆</button>
        </div>
        <div class="hud turn hidden" id="turn-btns">
          <button class="round-btn" id="btn-turnl" title="Turn the house">↪️</button>
          <button class="round-btn" id="btn-turnr" title="Turn the house">↩️</button>
          <button class="round-btn" id="btn-zin" title="Closer">➕</button>
          <button class="round-btn" id="btn-zout" title="Farther">➖</button>
        </div>
        <div id="polaroid" class="polaroid hidden"></div>
        <div id="arrow" class="guide-arrow hidden">➤</div>
        <div id="count" class="countdown hidden"></div>
        <div id="fade"></div><div id="decor-ui"></div>`;
      cv = G.$('#cv', root); ctx = cv.getContext('2d'); fadeEl = G.$('#fade', root);
      Object.assign(hud, { room: G.$('#room-pill', root), floor: G.$('#floor-pill', root), quest: G.$('#quest-pill', root), photo: G.$('#btn-photo', root), stamps: G.$('#stamp-count', root), decor: G.$('#btn-decor', root), go: G.$('#btn-go', root), act: G.$('#btn-act', root), pol: G.$('#polaroid', root), arrow: G.$('#arrow', root) });
      resize();
      M.buildGrid(1); M.buildGrid(2);
      const kid = G.kid(), P = G.P();
      const st = M.floors[1].spots.start, pos = P.intro && P.pos ? P.pos : { floor: 1, x: st[0], y: st[1] };
      W.props = []; W.parts = []; W.npcs = []; W.target = null; W.mode = 'play'; W.roomId = null; W.p2 = false; W.decor = null; cut = null;
      W.player = mkChar(kid.id, pos.x, pos.y, pos.floor); W.sis = mkChar(kid.sis, pos.x + 1.5, pos.y + 0.4, pos.floor);
      unstick(W.player); unstick(W.sis);
      W.floor = W.player.floor; hud.floor.textContent = W.floor === 2 ? '⬆️ Upstairs' : '⬇️ Downstairs';
      W.setPet(G.save.house.pet);
      W.npcs.push({ id: 'mama', who: 'mama', floor: 1, x: M.floors[1].spots.mama[0], y: M.floors[1].spots.mama[1], onTap: n => G.Q.talk(n) });
      W.npcs.push({ id: 'baba', who: 'baba', floor: 1, x: M.floors[1].spots.baba[0], y: M.floors[1].spots.baba[1], apron: 1, onTap: n => G.Q.talk(n) });
      aimCamera(0, true); updateHud();
      cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
      // the 3D view: its own canvas over the map, and a button that steps map -> dollhouse -> walking inside
      const VIEWS = ['2d', 'tilt', 'walk'], VICON = { '2d': '🗺️', tilt: '🏠', walk: '👀' };
      const c3 = G.V3.ok && G.V3.init(root), vbtn = G.$('#btn-view', root), turn = G.$('#turn-btns', root);
      const setView = (m, quiet) => { G.V3.set(m); m = G.V3.mode; vbtn.textContent = VICON[m]; turn.classList.toggle('hidden', m !== 'tilt'); if (!quiet) G.beep(G.T('view.' + m)); };
      if (c3) {
        c3.addEventListener('pointerdown', onDown); c3.addEventListener('pointermove', onMove);
        c3.addEventListener('wheel', e => { e.preventDefault(); G.V3.zoom(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
        vbtn.onclick = () => { G.sfx.whoosh(); setView(VIEWS[(VIEWS.indexOf(G.V3.mode) + 1) % 3]); };
        G.$('#btn-turnl', root).onclick = () => { G.sfx.tap(); G.V3.turn(1); }; G.$('#btn-turnr', root).onclick = () => { G.sfx.tap(); G.V3.turn(-1); };
        G.$('#btn-zin', root).onclick = () => { G.sfx.tap(); G.V3.zoom(0.85); }; G.$('#btn-zout', root).onclick = () => { G.sfx.tap(); G.V3.zoom(1.18); };
        setView(G.save.settings.view || '2d', true);
      } else vbtn.classList.add('hidden');
      window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
      window.addEventListener('resize', resize);
      G.$('#btn-menu', root).onclick = () => { G.sfx.tap(); G.menu(); };
      G.$('#btn-pass', root).onclick = () => { G.sfx.tap(); G.passport(); };
      hud.photo.onclick = () => { G.sfx.tap(); const rm = W.roomId && M.room(W.roomId); if (rm) W.photoModal(rm); };
      hud.decor.onclick = () => { G.sfx.tap(); if (W.mode === 'decor') G.decor.close(); else if (W.roomId) G.decor.open(W.roomId); };
      hud.act.onclick = () => { if (W.mode === 'play') W.act(); };
      hud.go.onclick = () => { G.sfx.tap(); if (W.roomId) G.course.start(W.roomId); };
      G.$('#btn-stop', root).onclick = () => G.course.stop();
      G.onBeepTap = () => G.Q.hint();
      G.showBeep(true); G.music(true);
      last = performance.now(); raf = requestAnimationFrame(loop);
      G.Q.begin();
    },
    leave() {
      cancelAnimationFrame(raf); G.music(false); G.onBeepTap = null; G.course.stop(true); if (G.V3.ok) { const m = G.V3.mode; G.V3.dispose(); G.V3.on = false; G.save.settings.view = m; }
      window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); window.removeEventListener('resize', resize);
      for (const k in keys) keys[k] = false;
      if (W.mode === 'decor') G.decor.close(true);
      G.persist();
    },
  };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  W.rebuild = () => { M.buildGrid(1); M.buildGrid(2); unstick(W.player); unstick(W.sis); };
  W.vsize = () => [vw, vh];
})();
