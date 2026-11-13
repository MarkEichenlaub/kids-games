// The house in 3D. The same map, furniture and people as the flat map view, built into a
// three.js scene: walls stand up, every built-in thing and piece of furniture becomes a
// solid shape with its map drawing on top, and the family are stand-up pictures.
// Three views: the flat map (2D), a tilted dollhouse you can turn, and walking inside.
(() => {
  const W = G.W, M = G.MAP, A = G.ART;
  const V = G.V3 = { on: false, mode: '2d', yaw: 0, yawTo: 0, dist: 36, ok: typeof THREE !== 'undefined' };
  if (!V.ok) return;
  const T = THREE, OUTSIDE = ['courtyard', 'alley', 'yard', 'porch'];
  const WALLCOL = { t: '#d6ad7f', y: '#f3de8c', c: '#f6f1e6' };
  let renderer, scene, camera, cv3, vw = 1, vh = 1, built = null, dark;
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), tmp = new T.Vector3();
  let dragY = null;

  // ---------- little builders ----------
  const mats = {};
  const mat = (col, o) => { const k = col + JSON.stringify(o || 0); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: col }, o))); };
  const canvasTex = (w, h, paint) => {
    const c = document.createElement('canvas'); c.width = Math.max(8, Math.round(w)); c.height = Math.max(8, Math.round(h));
    const tex = new T.CanvasTexture(c); tex.userData = { c, paint };
    paint(c.getContext('2d'), c); return tex;
  };
  const repaint = tex => { const c = tex.userData.c, x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); tex.userData.paint(x, c); tex.needsUpdate = true; };
  // a block standing on the floor at plan rect (x, y, w, h), with a picture on top
  const block = (x, y, w, h, H, top, side = '#f2efe9', base = 0, o = {}) => {
    const g = new T.BoxGeometry(w, H, h), s = mat(side, o.sideOpts);
    const topM = top && top.isTexture ? new T.MeshBasicMaterial({ map: top, transparent: !!o.clear, alphaTest: o.clear ? 0.05 : 0 }) : mat(top || side, o.sideOpts);
    const m = new T.Mesh(g, [s, s, topM, s, s, s]); m.position.set(x + w / 2, base + H / 2, y + h / 2); return m;
  };
  const cyl = (x, y, r, H, col, base = 0, top) => { const m = new T.Mesh(new T.CylinderGeometry(r, r, H, 20), top ? [mat(col), new T.MeshBasicMaterial({ map: top }), mat(col)] : mat(col)); m.position.set(x, base + H / 2, y); return m; };
  const ball = (x, y, r, col, base = 0) => { const m = new T.Mesh(new T.SphereGeometry(r, 14, 10), mat(col)); m.position.set(x, base + r, y); return m; };
  // a picture that always faces the camera, standing at plan (x, y)
  const stand = (w, h, px, paint) => {
    const tex = canvasTex(w * px, h * px, paint);
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.04 })); s.center.set(0.5, 0); s.scale.set(w, h, 1); s.userData.tex = tex; return s;
  };
  const emojiStand = (ch, size) => stand(size, size, Math.min(64, 256 / size), (c, cv) => { c.font = `${cv.height * 0.8}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, cv.width / 2, cv.height * 0.55); });
  // the map drawing of one fixture or item, as a texture for its top
  const PX = 40;
  const fixTop = (f, bg) => canvasTex(Math.min(640, f.w * PX), Math.min(640, f.h * PX), (c, cv) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); } c.scale(cv.width / f.w, cv.height / f.h); c.translate(-f.x, -f.y); A.fixture(c, f, 1.3); });
  const itemTops = {};
  const itemTop = (it, d, bg) => {
    const k = it.t + (it.on ? '+' : '') + (bg || '');
    return itemTops[k] || (itemTops[k] = canvasTex(Math.min(640, d.w * PX), Math.min(640, d.h * PX), (c, cv) => { if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); } c.scale(cv.width / d.w, cv.height / d.h); c.translate(d.w / 2, d.h / 2); d.draw(c, d.w, d.h, 1.3, { on: it.on, t: it.t }); }));
  };

  // ---------- heights, in feet ----------
  const FH = { counter: 3, island: 3, fridge: 6, ovens: 6.6, kdesk: 2.6, pshelf: 6, fireplace: 4.6, builtin: 3.2, toilet: 1.7, vanity: 2.9, vanity2: 2.9, lsink: 2.9, tub: 1.9, washer: 3.2, dryer: 3.2,
    closet: 5.4, linen: 7, nook: 2.6, lowshelf: 1.9, shelf: 0.8, heater: 4.8, acbox: 3, plantbed: 0.5, truck: 9, block: 8.5 };
  const FBASE = { shelf: 5.4, cooktop: 3, ksink: 2.95, panel: 3.4, opener: 4, doorbell: 3.6 };
  const FSIDE = { fridge: '#c9ced6', ovens: '#c9ced6', fireplace: '#f6f3ee', heater: '#dfe3e8', acbox: '#ffffff', closet: '#efe9df', plantbed: '#8a5236', truck: '#ffffff', block: '#fffdf8', shelf: '#eef0f3' };
  const IH = { bunk: 5.4, bigbed: 2.2, dresser: 3, nightstand: 2.1, desk: 2.5, bookshelf: 5.6, toychest: 1.8, sofa: 2.5, armchair: 2.4, coffee: 1.4, dtable: 2.5, tv: 2.1, piano: 4, beanbag: 1.5,
    playkitchen: 3, dollhouse: 2.6, traintable: 1.6, fishtank: 3.3, ballpit: 1.3, slide: 2.6, sandbox: 0.6, cBeam: 0.5, cPillows: 1.5 };
  const ISIDE = { sofa: '#9aa0ab', armchair: '#f1ede4', piano: '#3a2a22', dtable: '#3a2f2a', bookshelf: '#e6c9a0', desk: '#e6c9a0', toychest: '#ffb347', ballpit: '#7fb5ff', slide: '#ffd93d', sandbox: '#b98a5e',
    playkitchen: '#ffc4e1', dollhouse: '#ffd0e6', traintable: '#8fd16a', fishtank: '#8fd8ff', cBeam: '#e0a85e', cPillows: '#d6c5ff', coffee: '#cfe9f5', bunk: '#d9b48a', beanbag: '#ff8fb8' };

  // ---------- walls ----------
  const inside = (floor, x, y) => { const r = M.roomAt(floor, x, y); return r && !OUTSIDE.includes(r.id) ? r : null; };
  const paintOf = r => { const p = G.save.house.paint[r.id], w = p && p.wall && A.WALLS[p.wall]; return !w || w === 'rainbow' ? (w ? '#ffc4e8' : '#fffdf8') : w; };
  function wallPiece(grp, floor, x1, y1, x2, y2, y0, y1h, kind, ext = 0.22, glass) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 0.02 || y1h - y0 < 0.02) return;
    const a = Math.atan2(y2 - y1, x2 - x1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -Math.sin(a), ny = Math.cos(a);
    const sideCol = s => { const r = inside(floor, mx + nx * 0.7 * s, my + ny * 0.7 * s); return r ? paintOf(r) : (WALLCOL[kind] || (inside(floor, mx - nx * 0.7 * s, my - ny * 0.7 * s) ? WALLCOL.t : '#fffdf8')); };
    let m;
    if (glass) m = new T.Mesh(new T.BoxGeometry(L, y1h - y0, 0.12), new T.MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: 0.45 }));
    else {
      const p = new T.MeshLambertMaterial({ color: sideCol(1) }), n = new T.MeshLambertMaterial({ color: sideCol(-1) }), t = new T.MeshLambertMaterial({ color: '#e7e1d6' });
      m = new T.Mesh(new T.BoxGeometry(L + ext * 2, y1h - y0, 0.44), [t, t, t, t, p, n]); m.userData.wall = [x1, y1, x2, y2];
    }
    m.position.set(mx, (y0 + y1h) / 2, my); m.rotation.y = -a; grp.add(m);
  }
  function buildWalls(floor, H) {
    const F = M.floors[floor], grp = new T.Group(), low = H < 5;
    for (const s of F.walls) {
      const [x1, y1, x2, y2, kind] = s, horiz = Math.abs(y1 - y2) < 0.01, vert = Math.abs(x1 - x2) < 0.01;
      if (!horiz && !vert) { wallPiece(grp, floor, x1, y1, x2, y2, 0, H, kind, 0); continue; }
      // cut out the windows that sit on this wall
      const a0 = horiz ? Math.min(x1, x2) : Math.min(y1, y2), a1 = horiz ? Math.max(x1, x2) : Math.max(y1, y2), fix = horiz ? y1 : x1;
      const wins = F.windows.filter(w => (horiz ? Math.abs(w[1] - fix) < 0.2 && Math.abs(w[3] - fix) < 0.2 : Math.abs(w[0] - fix) < 0.2 && Math.abs(w[2] - fix) < 0.2))
        .map(w => [Math.max(a0, horiz ? Math.min(w[0], w[2]) : Math.min(w[1], w[3])), Math.min(a1, horiz ? Math.max(w[0], w[2]) : Math.max(w[1], w[3])), w[4]]).filter(w => w[1] - w[0] > 0.2).sort((p, q) => p[0] - q[0]);
      const pt = (t, b) => horiz ? [t, fix, b, fix] : [fix, t, fix, b];
      let cur = a0;
      for (const w of wins) {
        if (w[0] > cur) wallPiece(grp, floor, ...pt(cur, w[0]), 0, H, kind, cur === a0 ? 0.22 : 0);
        const small = w[1] - w[0] < 2.2, sill = w[2] === 'pass' ? 3.4 : small ? 4.8 : 2.7, head = w[2] === 'pass' ? 7 : 6.9;
        wallPiece(grp, floor, ...pt(w[0], w[1]), 0, Math.min(sill, H), kind, 0);
        if (!low) { wallPiece(grp, floor, ...pt(w[0], w[1]), head, H, kind, 0); if (w[2] !== 'pass') wallPiece(grp, floor, ...pt(w[0], w[1]), sill, head, kind, 0, true); }
        else if (w[2] !== 'pass' && sill < H) wallPiece(grp, floor, ...pt(w[0], w[1]), sill, H, kind, 0, true);
        cur = w[1];
      }
      if (cur < a1) wallPiece(grp, floor, ...pt(cur, a1), 0, H, kind, 0.22);
    }
    for (const d of F.doors) { // open door leaves
      const len = d[2], h = Math.min(H, 6.8), col = d[4] === 'front' ? '#2f4a6b' : d[4] === 'glass' ? '#bfe6ff' : '#ffffff';
      const g = new T.BoxGeometry(len, h, 0.14); g.translate(len / 2, 0, 0);
      const m = new T.Mesh(g, d[4] === 'glass' ? new T.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.6 }) : mat(col)); m.position.set(d[0], h / 2, d[1]); m.rotation.y = -d[3] * Math.PI / 180; grp.add(m);
    }
    for (const f of F.fences) {
      const [x1, y1, x2, y2, kind] = f; if (kind === 'none') continue;
      const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1);
      const h = kind === 'neighbor' ? (low ? H : 18) : kind === 'wood' ? Math.min(H, 5.6) : kind === 'hedge' ? 3.2 : 3, th = kind === 'hedge' ? 1.4 : kind === 'neighbor' ? 0.6 : 0.16;
      const col = kind === 'neighbor' ? WALLCOL.t : kind === 'wood' ? '#b98a5e' : kind === 'hedge' ? '#6dbb5c' : '#ffffff';
      const m = new T.Mesh(new T.BoxGeometry(L, h, th), kind === 'rail' || kind === 'banister' ? new T.MeshLambertMaterial({ color: col, transparent: true, opacity: 0.8 }) : mat(col));
      m.position.set((x1 + x2) / 2 - (kind === 'neighbor' ? 0.3 : 0), h / 2, (y1 + y2) / 2); m.rotation.y = -a; if (kind === 'neighbor' || kind === 'wood') { m.userData.wall = [x1, y1, x2, y2]; m.material = m.material.clone(); }
      grp.add(m);
    }
    return grp;
  }

  // ---------- built-in things ----------
  function buildFixture(f, floor, low) {
    const g = new T.Group(), cx = f.x + f.w / 2, cy = f.y + f.h / 2, t = f.t;
    const top = () => fixTop(f, FSIDE[t] || '#f7f4ee');
    let tex = null;
    if (t === 'garagedoor') { const m = block(f.x, f.y + 0.1, f.w, 0.3, low ? 3.4 : 7.2, '#ffffff', '#ffffff'); g.add(m); g.userData.door = 1; }
    else if (t === 'car') { const K = A.CARS[f.model] || A.CARS.volvo, ioniq = f.model === 'ioniq'; g.add(block(f.x, f.y, f.w, f.h, ioniq ? 2.3 : 2.5, fixTop(f, K.body), K.body, 0.9)); g.add(block(f.x + 0.45, f.y + f.h * 0.12, f.w - 0.9, f.h * 0.6, ioniq ? 1.6 : 1.9, K.roof, '#6f8ea6', ioniq ? 3.2 : 3.4)); for (const [u, v] of [[0, 0.2], [1, 0.2], [0, 0.78], [1, 0.78]]) { const w = cyl(f.x + f.w * u, f.y + f.h * v, 1.15, 0.7, '#26262b', 0); w.rotation.z = Math.PI / 2; w.position.y = 1.15; g.add(w); } }
    else if (t === 'stool') g.add(cyl(cx, cy, 0.5, 2.2, '#d9a66c'));
    else if (t === 'planter' || t === 'flowerpot') { g.add(cyl(cx, cy, f.w * 0.42, 1.3, t === 'planter' ? '#c9703f' : '#4b5568')); const s = stand(1.6, 1.6, 64, (c, cv) => { const st = t === 'planter' ? (G.save.house.flowers[f.id] || {}) : { stage: 2, kind: '🌼' }; const e = st.stage >= 2 ? (st.kind || '🌷') : st.stage === 1 ? '🌱' : ''; c.font = `${cv.height * 0.7}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; if (e) c.fillText(e, cv.width / 2, cv.height * 0.55); }); s.position.set(cx, 1.1, cy); g.add(s); tex = s.userData.tex; }
    else if (t === 'column') g.add(block(f.x, f.y, f.w, f.h, low ? 3.4 : 8.5, '#ffffff', '#ffffff'));
    else if (t === 'bush') { const n = Math.round(f.w / 1.1); for (let i = 0; i < n; i++) g.add(ball(f.x + 0.7 + i * (f.w - 1.4) / Math.max(1, n - 1), cy + (i % 2 ? 0.15 : -0.15), 1, i % 2 ? '#5fae52' : '#74c365')); }
    else if (t === 'tree' || t === 'banana') { g.add(cyl(cx, cy, 0.35, low ? 3 : 7, '#8a5a3c')); g.add(ball(cx, cy, low ? 1.8 : 3.4, t === 'tree' ? '#62b455' : '#4fb060', low ? 2.2 : 5.5)); }
    else if (t === 'bistro') { for (const s of [-1, 1]) g.add(cyl(cx + s * 1.75, cy, 0.75, 1.5, '#2e2e36')); g.add(cyl(cx, cy, 0.6, 2.3, '#3a3a44')); }
    else if (t === 'bins') [['#3a3a44', 0], ['#2e7dd1', 1], ['#3fa35a', 2]].forEach(([col, i]) => g.add(block(f.x + i * 0.95, f.y + 0.3, 0.85, 1.9, 3.4, col, col)));
    else if (t === 'bikes') { const s = emojiStand('🚲', 3.4); s.position.set(f.x + 2.3, 0, f.y + 2.8); g.add(s); const s2 = emojiStand('🛴', 2.8); s2.position.set(f.x + 1, 0, f.y + 1.1); g.add(s2); }
    else if (t === 'rocket') { const s = stand(3, 4.4, 64, (c, cv) => { c.translate(cv.width / 2, cv.height * 0.5); c.scale(cv.width / 3, cv.width / 3); A.fx.rocket(c, { x: -1.5, y: -1.7, w: 3, h: 3.4, on: f.on }, 1); }); s.position.set(cx, 0, cy); g.add(s); tex = s.userData.tex; }
    else if (t === 'sign') { g.add(cyl(cx, cy, 0.12, 4, '#8a5a3c')); const s = emojiStand('🏊', 1.6); s.position.set(cx - 0.6, 3.2, cy); g.add(s); const s2 = emojiStand('🛝', 1.6); s2.position.set(cx + 0.7, 3.2, cy); g.add(s2); }
    else if (t === 'gate') { const len = f.w - 0.2, h = low ? 3.4 : 5.4, geo = new T.BoxGeometry(len, h, 0.16); geo.translate(len / 2, 0, 0); const m = new T.Mesh(geo, mat('#c79a6d')); m.position.set(f.x, h / 2, f.y); m.rotation.y = -(f.dir || 1) * 1.28; g.add(m); }
    else if (t === 'shower') { g.add(block(f.x, f.y, f.w, f.h, 0.12, tex = fixTop(f, '#f3f1ee'))); const gl = new T.Mesh(new T.BoxGeometry(f.w, low ? 3.2 : 6.6, f.h), new T.MeshLambertMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.22, depthWrite: false })); gl.position.set(cx, (low ? 3.2 : 6.6) / 2, cy); g.add(gl); }
    else if (t === 'stairs1') { const x0 = f.x + 0.8, n = 9, sw = 0.838; for (let i = 0; i < n; i++) g.add(block(x0 + i * sw, f.y, sw, f.h, (i + 1) * 0.72, i % 2 ? '#e3cba8' : '#ecd9bc', '#fbfaf7')); g.add(block(x0 + n * sw, f.y, f.x + f.w - x0 - n * sw, f.h, Math.min(low ? 7 : 8.4, 7.4), '#e6d2b3', '#fbfaf7')); }
    else if (FH[t] || FBASE[t] != null) { const H = Math.min(FH[t] || 0.15, t === 'block' && low ? 3.4 : 99); g.add(block(f.x, f.y, f.w, f.h, H, tex = top(), FSIDE[t] || '#f7f4ee', FBASE[t] || 0)); }
    else return null; // flat things are painted on the floor
    g.userData = Object.assign(g.userData, { fx: f, tex, key: '' });
    g.traverse(o => { if (o.isMesh || o.isSprite) o.userData.plan = [cx, cy]; });
    return g;
  }
  const fxKey = f => `${f.on ? 1 : 0}${f.duck ? 1 : 0}${f.wet ? 1 : 0}${f.alert ? 1 : 0}${f.hint ? 1 : 0}${f.t === 'planter' ? JSON.stringify(G.save.house.flowers[f.id] || 0) : ''}`;

  // ---------- furniture and toys ----------
  function buildItem(it) {
    const d = G.ITEMS[it.t]; if (!d) return null;
    const g = new T.Group(), w = d.w, h = d.h, t = it.t, k = d.course && d.course.kind;
    const side = d.side || ISIDE[t] || '#f2efe9', topTex = flat => itemTop(it, d, flat ? null : side);
    if (d.cat === 'toys' || t === 'plant' || t === 'flowers' || t === 'bigplant' || t === 'nightlight' || t === 'globe' || t === 'rockinghorse' || t === 'easel') {
      const size = Math.max(w, 1.5) * (t === 'bigplant' ? 1.6 : 1.15); const s = emojiStand(d.icon || '🧸', size); g.add(s);
    } else if (t === 'lamp') { g.add(cyl(0, 0, 0.09, 4.4, '#d9a441')); const sh = cyl(0, 0, 0.6, 0.9, it.on ? '#fff3a8' : '#f3e7c9', 4.2); if (it.on) sh.material = new T.MeshBasicMaterial({ color: '#fff3a8' }); g.add(sh); }
    else if (t === 'tent') { const m = new T.Mesh(new T.ConeGeometry(w / 2, 4.6, 6), mat('#ff8fb8')); m.position.y = 2.3; g.add(m); }
    else if (t === 'trampoline' || t === 'cTramp') g.add(cyl(0, 0, w / 2, 0.9, t === 'cTramp' ? '#ff6fb1' : '#4d8dff', 0, topTex()));
    else if (t === 'cCones') for (const y of [-2.1, 0, 2.1]) { const m = new T.Mesh(new T.ConeGeometry(0.4, 1.3, 12), mat('#ff7a2f')); m.position.set(0, 0.65, y); g.add(m); }
    else if (t === 'cHurdle') { for (const s of [-1, 1]) g.add(block(s * (w / 2 - 0.2) - 0.14, -0.2, 0.28, 0.4, 1.5, '#ffffff', '#ffffff')); g.add(block(-w / 2 + 0.2, -0.1, w - 0.4, 0.2, 0.3, '#ff5d5d', '#ff5d5d', 1.2)); }
    else if (t === 'cTunnel') { const tx = canvasTex(64, 224, c => { ['#4d8dff', '#37c9d6', '#4cd97b', '#ffd93d', '#ff9f43', '#ff6fb1', '#9b6bff'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 32, 64, 32); }); }); const m = new T.Mesh(new T.CylinderGeometry(w / 2, w / 2, h, 20, 1, true, Math.PI / 2, Math.PI), new T.MeshLambertMaterial({ map: tx, side: T.DoubleSide })); m.rotation.x = Math.PI / 2; g.add(m); }
    else if (t === 'cStones') [[-0.6, -2.4], [0.6, -0.8], [-0.6, 0.8], [0.6, 2.4]].forEach(([x, y], i) => g.add(cyl(x, y, 0.68, 0.28, ['#9ad0ff', '#b9f0c8', '#ffe08a', '#ffc4e1'][i])));
    else if (t === 'cHoop') { const m = new T.Mesh(new T.TorusGeometry(1.15, 0.14, 8, 28), mat('#ff6fb1')); m.rotation.x = Math.PI / 2; m.position.y = 0.16; g.add(m); }
    else if (d.table) { const tb = d.table; g.add(block(tb.top[0], tb.top[1], tb.top[2], tb.top[3], 0.25, tb.col, tb.col, 2.3)); for (const sx of [0.15, tb.top[2] - 0.45]) for (const sy of [0.15, tb.top[3] - 0.45]) g.add(block(tb.top[0] + sx, tb.top[1] + sy, 0.3, 0.3, 2.3, tb.col, tb.col)); for (const [x, y] of tb.chairs) { g.add(block(x - 0.7, y - 0.7, 1.4, 1.4, 0.3, tb.chairCol, tb.chairCol, 1.3)); g.add(block(x + (x < 0 ? -0.75 : 0.5), y - 0.7, 0.25, 1.4, 1.6, tb.chairCol, tb.chairCol, 1.3)); g.add(cyl(x, y, 0.12, 1.3, '#b9763f')); } }
    else if (d.piano) { g.add(block(-w / 2, -h / 2, w, 2.2, 4.1, itemTop(it, { w, h: 2.2, draw: (c, ww, hh, tt, i2) => { c.translate(0, (h - 2.2) / 2); d.draw(c, w, h, tt, i2); } }, '#7a1820'), '#7a1820')); g.add(block(-1.3, h / 2 - 1.2, 2.6, 1.05, 1.6, '#1d1d21', '#1d1d21')); }
    else if (d.desk) { g.add(block(-w / 2, -h / 2, w, 1.9, 2.5, '#fbfaf7', '#fbfaf7')); g.add(block(-1, -h / 2 + 0.2, 2, 0.15, 1.3, '#22242b', '#22242b', 2.6)); g.add(cyl(0, h / 2 - 0.7, 0.65, 1.5, '#8a8f9a')); g.add(block(-0.6, h / 2 - 0.25, 1.2, 0.2, 1.7, '#8a8f9a', '#8a8f9a', 1.5)); }
    else if (d.round) g.add(cyl(0, 0, w / 2, d.round, side, 0, topTex()));
    else if (d.glow) { const on = it.on !== false; const m = new T.Mesh(new T.SphereGeometry(0.62, 16, 12), new T.MeshBasicMaterial({ color: on ? '#fff1b8' : '#e6dfd0' })); m.position.y = 0.62; g.add(m); }
    else if (t.startsWith('bed')) { g.add(block(-w / 2, -h / 2, w, h, 1.9, topTex(), '#ffffff')); g.add(block(-w / 2, -h / 2, w, 0.4, 3.4, '#d9b48a', '#d9b48a')); }
    else if (d.ourBed) { g.add(block(-w / 2, -h / 2, w, h, 2, itemTop(it, d, '#ffffff'), '#ffffff')); g.add(block(-w / 2, -h / 2, w, 0.4, 4, d.head, d.head)); if (d.tent) { const m = new T.Mesh(new T.SphereGeometry(w / 2 + 0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ color: '#3b2f7a', side: T.DoubleSide })); m.scale.set(1, 1.3, 1.25); m.position.set(0, 2, -h / 2 + 1.9); g.add(m); } }
    else if (d.flat) { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: topTex(true), transparent: true, alphaTest: 0.03, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.renderOrder = 1; g.add(m); }
    else { g.add(block(-w / 2, -h / 2, w, h, d.tall || IH[t] || 2, topTex(), side)); if (d.tv) g.add(block(-2.2, -h / 2 + 0.25, 4.4, 0.2, 2.5, it.on ? '#7fd0ff' : '#22242b', '#22242b', (d.tall || 2.6))); }
    g.userData.it = it;
    return g;
  }

  // ---------- one floor ----------
  function buildFloor(floor, low) {
    const F = M.floors[floor], b = F.bounds, grp = new T.Group(), P = 22;
    const tex = canvasTex((b[2] - b[0]) * P, (b[3] - b[1]) * P, (c, cv) => {
      c.scale(P, P); c.translate(-b[0], -b[1]); A.ground(c, floor, 0); A.floors(c, floor);
      for (const f of F.fixtures) if (f.flat && f.t !== 'fan') A.fixture(c, f, 0);
      A.sunbeams(c, floor, 0);
    });
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const ground = new T.Mesh(new T.PlaneGeometry(b[2] - b[0], b[3] - b[1]), new T.MeshBasicMaterial({ map: tex })); ground.rotation.x = -Math.PI / 2; ground.position.set((b[0] + b[2]) / 2, 0, (b[1] + b[3]) / 2); grp.add(ground);
    const far = new T.Mesh(new T.PlaneGeometry(600, 600), new T.MeshBasicMaterial({ color: floor === 1 ? '#a9d98a' : '#bfdcef' })); far.rotation.x = -Math.PI / 2; far.position.set(10, -0.06, 30); grp.add(far);
    const walls = buildWalls(floor, low ? 3.4 : 8.5); grp.add(walls);
    const fx = new T.Group(); for (const f of F.fixtures) { const m = buildFixture(f, floor, low); if (m) fx.add(m); } grp.add(fx);
    if (floor === 1) { // the neighbors' houses and the garages across the alley, as plain blocks
      const nh = low ? 0.5 : 18;
      for (const q of [[-40, -1, -9.2, 62], [33.2, -1, 60, 62], [-42, -40, -16, -13], [-9, -40, 17, -13], [24, -40, 50, -13]]) grp.add(block(q[0], q[1], q[2] - q[0], q[3] - q[1], nh, '#9a6a4c', WALLCOL.t));
    }
    const items = new T.Group(); grp.add(items);
    return { grp, tex, walls, fx, items, floor, low, map: new Map(), paint: JSON.stringify(G.save.house.paint) };
  }

  // ---------- people ----------
  const actors = new Map();
  function actor(key, w, h, px, paint) {
    let a = actors.get(key);
    if (!a) { a = stand(w, h, px, paint); a.userData.paint = paint; scene.add(a); actors.set(key, a); }
    a.userData.seen = true; return a;
  }
  const kidPaint = ch => (c, cv) => { c.translate(cv.width / 2, cv.height * 0.93); c.scale(cv.width / 3.4, cv.width / 3.4); A.kid(c, { who: ch.who, costume: ch.costume, t: ch.t, moving: ch.moving, face: ch.face, bounce: ch.hop, hold: ch.hold }); };
  function people(fl, t) {
    for (const a of actors.values()) a.userData.seen = false;
    const put = (a, x, y, plan) => { a.position.set(x, 0, y); a.userData.plan = plan || [x, y]; a.visible = true; };
    for (const ch of [W.sis, W.player]) if (ch.floor === fl && !ch.hidden && W.mode !== 'decor') { const a = actor('kid' + ch.who, 3.4, 5.1, 64, kidPaint(ch)); a.center.set(0.5, 0.07); a.userData.tex.userData.paint = kidPaint(ch); repaint(a.userData.tex); put(a, ch.x, ch.y); a.userData.plan = null; } // taps go through the kids to what is behind them
    for (const n of W.npcs) if (n.floor === fl) { const a = actor('npc' + n.id, 3.2, 6.4, 56, () => { }); a.center.set(0.5, 0.05); a.userData.tex.userData.paint = (c, cv) => { c.translate(cv.width / 2, cv.height * 0.95); c.scale(cv.width / 3.2, cv.width / 3.2); A.grownup(c, { who: n.who, t, mark: n.mark, wave: n.wave, apron: n.apron }); }; repaint(a.userData.tex); put(a, n.x, n.y, [n.x, n.y - 1]); }
    if (W.pet && W.pet.floor === fl && W.mode !== 'decor') { const p = W.pet, a = actor('pet', 1.8, 1.8, 64, () => { }); a.center.set(0.5, 0.1); a.userData.tex.userData.paint = (c, cv) => { c.translate(cv.width / 2, cv.height * 0.9); c.scale(cv.width / 1.8, cv.width / 1.8); A.pet(c, p); }; repaint(a.userData.tex); put(a, p.x, p.y); a.userData.plan = null; }
    for (const p of W.props) if (p.floor === fl) {
      const a = actor('prop' + p.id + p.icon, p.size * 1.5, p.size * 1.5, 64, (c, cv) => { if (p.glow) { c.fillStyle = 'rgba(255,236,150,.45)'; c.beginPath(); c.arc(cv.width / 2, cv.height / 2, cv.width * 0.46, 0, 6.3); c.fill(); } c.font = `${cv.height * 0.62}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.icon, cv.width / 2, cv.height * 0.55); });
      put(a, p.x, p.y, [p.x, p.y - p.r * 0.5]); a.position.y = (p.bob ? Math.abs(Math.sin(t * 3 + p.x)) * 0.25 : 0) - (p.peek ? p.size * 0.45 : 0);
    }
    const tg = W.target;
    if (tg && tg.floor === fl && W.mode === 'play') { const a = actor('target', 1.6, 1.6, 64, (c, cv) => { c.font = `${cv.height * 0.7}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⭐', cv.width / 2, cv.height * 0.55); }); a.position.set(tg.x, 4.6 + (tg.tall || 0) + Math.sin(t * 5) * 0.3, tg.y); a.userData.plan = null; a.visible = true; ring.visible = true; ring.position.set(tg.x, 0.06, tg.y); ring.scale.setScalar(1 + 0.2 * Math.sin(t * 5)); } else ring.visible = false;
    for (const [k, a] of actors) if (!a.userData.seen) { scene.remove(a); a.material.map.dispose(); a.material.dispose(); actors.delete(k); }
  }
  let ring, selBox, areaLines;

  // ---------- keeping the scene in step with the game ----------
  function sync(t) {
    const fl = W.floor, low = V.mode === 'tilt' || W.mode === 'decor';
    const paint = JSON.stringify(G.save.house.paint);
    if (!built || built.floor !== fl || built.low !== low || built.paint !== paint) {
      if (built) { scene.remove(built.grp); built.grp.traverse(o => { if (o.geometry) o.geometry.dispose(); }); built.tex.dispose(); }
      built = buildFloor(fl, low); scene.add(built.grp);
    }
    for (const g of built.fx.children) { // things that changed (water on, fridge open, flowers grown)
      const f = g.userData.fx;
      if (g.userData.door) { g.visible = !G.save.house.garageOpen; continue; }
      const k = fxKey(f); if (g.userData.tex && k !== g.userData.key) { g.userData.key = k; repaint(g.userData.tex); }
    }
    // furniture: add what is new, move what moved, drop what was put away
    const seen = new Set();
    for (const r of M.rooms) if (r.floor === fl) for (const it of G.itemsIn(r.id)) {
      const key = it.t + '|' + (it.on ? 1 : 0); let m = built.map.get(it);
      if (m && m.userData.key !== key) { built.items.remove(m); m = null; }
      if (!m) { m = buildItem(it); if (!m) continue; m.userData.key = key; built.items.add(m); built.map.set(it, m); }
      m.position.set(it.x, (G.ITEMS[it.t].flat ? 0 : 0), it.y); m.rotation.y = -(it.r || 0) * Math.PI / 2;
      m.traverse(o => { if (o.isMesh || o.isSprite) o.userData.plan = [it.x, it.y]; });
      seen.add(it);
    }
    for (const [it, m] of built.map) if (!seen.has(it)) { built.items.remove(m); built.map.delete(it); }
    people(fl, t);
    // decorating: show where things may go and what is picked up
    const st = W.mode === 'decor' && W.decor;
    areaLines.visible = selBox.visible = false;
    if (st) {
      const pts = []; for (const q of st.rects) pts.push(q[0], 0.08, q[1], q[2], 0.08, q[1], q[2], 0.08, q[1], q[2], 0.08, q[3], q[2], 0.08, q[3], q[0], 0.08, q[3], q[0], 0.08, q[3], q[0], 0.08, q[1]);
      areaLines.geometry.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); areaLines.visible = true;
      if (st.sel) { const s = G.itemRect(st.sel); selBox.visible = true; selBox.position.set((s[0] + s[2]) / 2, 0.1, (s[1] + s[3]) / 2); selBox.scale.set(s[2] - s[0] + 0.4, 1, s[3] - s[1] + 0.4); }
    }
  }

  // ---------- camera ----------
  const focus = new T.Vector3(12, 0, 60);
  function aim(dt, snap) {
    const p = W.player, st = W.mode === 'decor' && W.decor;
    let tx = p.x, tz = p.y, ty = 0, pitch, D, fov;
    if (st) { const q = st.box, big = Math.max(q[2] - q[0], q[3] - q[1]) > 20; tx = big ? st.cx : (q[0] + q[2]) / 2; tz = big ? st.cy : (q[1] + q[3]) / 2; V.yawTo = 0; pitch = 1.05; D = G.clamp(Math.max(q[2] - q[0], (q[3] - q[1]) * 1.25) * 1.7, 24, 44); fov = 36; }
    else if (V.mode === 'walk') {
      ty = 3; pitch = 0.42; D = 9.5; fov = 60;
      const vx = p.x - (V.lx ?? p.x), vy = p.y - (V.ly ?? p.y);
      if (p.moving && Math.hypot(vx, vy) > 0.002) V.yawTo = Math.atan2(-vx, -vy);
    } else { pitch = 0.95; D = V.dist; fov = 36; }
    V.lx = p.x; V.ly = p.y;
    let dy = V.yawTo - V.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
    V.yaw += dy * (snap ? 1 : Math.min(1, dt * (V.mode === 'walk' && !st ? 2.2 : 6)));
    const k = snap ? 1 : Math.min(1, dt * 6);
    focus.x += (tx - focus.x) * k; focus.z += (tz - focus.z) * k; focus.y += (ty - focus.y) * k;
    V.d = (V.d || D) + (D - (V.d || D)) * k; V.pitch = (V.pitch || pitch) + (pitch - (V.pitch || pitch)) * k;
    const ch = Math.cos(V.pitch) * V.d;
    camera.position.set(focus.x + Math.sin(V.yaw) * ch, focus.y + Math.sin(V.pitch) * V.d, focus.z + Math.cos(V.yaw) * ch);
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.lookAt(focus.x, focus.y + (st ? -1.5 : 0), focus.z); camera.updateMatrixWorld();
    W.cam.ppf = vh / (2 * Math.tan(fov * Math.PI / 360) * V.d); // roughly, for dragging the view around
    // walls between the camera and the player go see-through
    if (built) {
      const cx = camera.position.x, cz = camera.position.z, walk = V.mode === 'walk' && !st;
      for (const m of built.walls.children) {
        const w = m.userData.wall; if (!w) continue;
        let o = 1;
        if (walk) { const d1 = side(cx, cz, p.x, p.y, w[0], w[1]) * side(cx, cz, p.x, p.y, w[2], w[3]), d2 = side(w[0], w[1], w[2], w[3], cx, cz) * side(w[0], w[1], w[2], w[3], p.x, p.y); if ((d1 <= 0 && d2 <= 0) || nearSeg(cx, cz, w) < 2) o = 0; }
        const ms = Array.isArray(m.material) ? m.material : [m.material];
        m.visible = o > 0;
      }
    }
  }
  const side = (ax, ay, bx, by, px, py) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const nearSeg = (px, py, s) => { const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy, t = l2 ? G.clamp(((px - s[0]) * dx + (py - s[1]) * dy) / l2, 0, 1) : 0; return Math.hypot(px - (s[0] + t * dx), py - (s[1] + t * dy)); };

  // ---------- taps: where on the floor, or which thing ----------
  V.toWorld = (sx, sy, pick) => {
    ray.setFromCamera({ x: sx / vw * 2 - 1, y: -(sy / vh) * 2 + 1 }, camera);
    if (pick && built) {
      const hits = ray.intersectObjects([built.fx, built.items, ...actors.values()], true);
      for (const h of hits) { const pl = h.object.userData.plan; if (pl === null) continue; if (h.object.isSprite && pl) return pl; if (pl) { if (W.mode === 'decor') dragY = h.point.y; return [h.point.x, h.point.z]; } }
    }
    plane.constant = -(dragY || 0);
    return ray.ray.intersectPlane(plane, tmp) ? [tmp.x, tmp.z] : [W.player.x, W.player.y];
  };
  V.release = () => { dragY = null; };
  V.toScreen = (x, y, up = 0) => { tmp.set(x, up, y).project(camera); const behind = tmp.z > 1; return [(behind ? -tmp.x : tmp.x) * (behind ? 4 : 1) * vw / 2 + vw / 2, -(behind ? -tmp.y - 2 : tmp.y) * vh / 2 + vh / 2]; };
  // arrow keys push away from the camera, whichever way it is turned
  V.keyDir = (kx, ky) => { const c = Math.cos(V.yaw), s = Math.sin(V.yaw); return [c * kx + s * ky, -s * kx + c * ky]; };

  // ---------- on and off ----------
  V.init = root => {
    cv3 = document.createElement('canvas'); cv3.id = 'cv3'; cv3.className = 'hidden'; root.insertBefore(cv3, root.firstChild.nextSibling);
    dark = G.html('<div id="dark3" class="hidden"></div>'); root.insertBefore(dark, cv3.nextSibling);
    try { renderer = new T.WebGLRenderer({ canvas: cv3, antialias: true }); } catch (e) { V.ok = false; return null; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new T.Scene(); scene.background = new T.Color('#bfe3ff');
    scene.add(new T.AmbientLight('#ffffff', 0.78)); const sun = new T.DirectionalLight('#fff4d6', 0.5); sun.position.set(-30, 60, 40); scene.add(sun);
    camera = new T.PerspectiveCamera(36, 1, 0.5, 500);
    ring = new T.Mesh(new T.RingGeometry(0.8, 1.05, 28), new T.MeshBasicMaterial({ color: '#ffd93d', side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
    selBox = new T.LineLoop(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute([-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5], 3)), new T.LineBasicMaterial({ color: '#4d8dff' })); selBox.visible = false; scene.add(selBox);
    areaLines = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({ color: '#ff6fb1' })); areaLines.visible = false; scene.add(areaLines);
    built = null; actors.clear();
    V.resize(root.clientWidth, root.clientHeight);
    return cv3;
  };
  V.resize = (w, h) => { vw = w; vh = h; if (!renderer) return; renderer.setSize(w, h, false); cv3.style.width = w + 'px'; cv3.style.height = h + 'px'; camera.aspect = w / h; camera.updateProjectionMatrix(); };
  V.set = mode => {
    if (!V.ok || !renderer) mode = '2d';
    V.mode = mode; V.on = mode !== '2d';
    cv3.classList.toggle('hidden', !V.on);
    if (V.on) { if (mode === 'tilt') V.yawTo = Math.round(V.yawTo / (Math.PI / 4)) * (Math.PI / 4); aim(0, true); }
    G.save.settings.view = mode; G.persist();
  };
  V.turn = dir => { V.yawTo += dir * Math.PI / 4; };
  V.zoom = f => { V.dist = G.clamp(V.dist * f, 16, 70); };
  V.render = (dt, t) => {
    sync(t); aim(dt);
    renderer.render(scene, camera);
    if (W.dark && W.mode !== 'decor') { const [sx, sy] = V.toScreen(W.player.x, W.player.y, 2.5); dark.classList.remove('hidden'); dark.style.background = `radial-gradient(circle at ${sx}px ${sy}px, rgba(12,8,45,0) 110px, rgba(12,8,45,.9) 340px)`; } else dark.classList.add('hidden');
  };
  V.dispose = () => { if (renderer) { renderer.dispose(); renderer = null; } built = null; actors.clear(); };
})();
