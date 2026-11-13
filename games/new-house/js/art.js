// Drawing the house: ground, floors, walls and everything that is built in.
// All drawing is in feet; the world sets the scale.
(() => {
  const A = G.ART = {};
  const OL = A.OL = '#4a3f63';
  const LW = 0.07;
  const TAU = Math.PI * 2;

  // ---------- helpers ----------
  const rr = A.rr = (c, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  };
  const box = A.box = (c, x, y, w, h, fill, r = 0.12, line = OL) => { rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); if (line) { c.strokeStyle = line; c.lineWidth = LW; c.stroke(); } };
  const circ = A.circ = (c, x, y, r, fill, line = OL) => { c.beginPath(); c.arc(x, y, r, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (line) { c.strokeStyle = line; c.lineWidth = LW; c.stroke(); } };
  const oval = A.oval = (c, x, y, rx, ry, fill, line = OL, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (line) { c.strokeStyle = line; c.lineWidth = LW; c.stroke(); } };
  const line = A.line = (c, pts, col, w = LW) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  // an emoji, centred, about `size` feet tall
  const emoji = A.emoji = (c, ch, x, y, size, rot = 0) => {
    c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(size / 40, size / 40);
    c.font = '40px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#000'; c.fillText(ch, 0, 2); c.restore();
  };
  A.text = (c, s, x, y, size, col = OL, weight = 600) => {
    c.save(); c.translate(x, y); c.scale(size / 40, size / 40);
    c.font = weight + ' 40px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, 0, 0); c.restore();
  };
  // run fn in a frame centred on the fixture and turned so its back is at the top; gives the turned width and height
  const local = (c, f, fn) => {
    const r = f.r || 0, w = r % 2 ? f.h : f.w, h = r % 2 ? f.w : f.h;
    c.save(); c.translate(f.x + f.w / 2, f.y + f.h / 2); c.rotate(r * Math.PI / 2); fn(w, h); c.restore();
  };
  const MARBLE = '#f6f3ee', CAB = '#fbfaf7', GOLD = '#d9a441', STEEL = '#c9ced6', GLASS = 'rgba(160,215,245,.45)';
  const marble = (c, x, y, w, h, r = 0.12) => {
    box(c, x, y, w, h, MARBLE, r);
    c.save(); rr(c, x, y, w, h, r); c.clip();
    c.strokeStyle = 'rgba(120,120,135,.35)'; c.lineWidth = 0.035;
    for (let i = 0; i < 3; i++) { const yy = y + h * (0.2 + i * 0.3); c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + w * 0.3, yy - 0.4, x + w * 0.6, yy + 0.5, x + w, yy - 0.2); c.stroke(); }
    c.restore();
  };
  const faucet = (c, x, y, ang = 0) => { c.save(); c.translate(x, y); c.rotate(ang); line(c, [0, 0, 0, 0.45], GOLD, 0.13); circ(c, 0, 0, 0.11, GOLD, null); c.restore(); };
  const drops = (c, x, y, w, h, t, n = 10, col = 'rgba(90,170,255,.8)') => {
    c.fillStyle = col;
    for (let i = 0; i < n; i++) { const px = x + ((i * 0.37 + 0.13) % 1) * w, py = y + ((t * 1.7 + i * 0.29) % 1) * h; c.beginPath(); c.ellipse(px, py, 0.05, 0.11, 0, 0, TAU); c.fill(); }
  };

  // ---------- floor patterns ----------
  const pats = {};
  const tile = (key, px, ft, paint) => {
    if (pats[key]) return pats[key];
    const cv = document.createElement('canvas'); cv.width = cv.height = px;
    paint(cv.getContext('2d'), px);
    const p = document.createElement('canvas').getContext('2d').createPattern(cv, 'repeat');
    if (p.setTransform) p.setTransform(new DOMMatrix().scale(ft / px));
    return pats[key] = p;
  };
  A.FLOORS = {
    wood: ['Wood', '#e9d6ba'], carpetCream: ['Cream carpet', '#f3ead8'], carpetPink: ['Pink carpet', '#ffd3e4'], carpetBlue: ['Blue carpet', '#cfe3ff'],
    carpetPurple: ['Purple carpet', '#e0d2ff'], carpetGreen: ['Green carpet', '#d2f0d0'], rainbow: ['Rainbow', '#ffe9a8'], space: ['Space', '#2a2460'], grass: ['Grass', '#9bd67a'], checker: ['Checkers', '#fff'],
  };
  A.WALLS = { white: '#fdfbf7', pink: '#ffb9d6', purple: '#c9a8ff', blue: '#9cc8ff', teal: '#8fe0d8', green: '#a8e6a1', yellow: '#ffe483', orange: '#ffc38a', red: '#ff8f8f', rainbow: 'rainbow' };
  A.floorStyle = kind => {
    if (kind === 'wood' || !kind) return tile('wood', 96, 6, (c, s) => {
      c.fillStyle = '#e9d6ba'; c.fillRect(0, 0, s, s);
      const cols = ['#e4cfb0', '#edddc4', '#e7d3b6', '#eedcc0', '#e2ccab', '#ead8bd', '#e6d1b3', '#ecdac1'];
      for (let i = 0; i < 8; i++) { c.fillStyle = cols[i]; c.fillRect(0, i * 12, s, 12); c.fillStyle = 'rgba(150,115,75,.35)'; c.fillRect(0, i * 12, s, 1); c.fillRect((i * 37) % s, i * 12, 1, 12); }
    });
    if (kind === 'concrete') return tile('concrete', 96, 6, (c, s) => { c.fillStyle = '#e2d5c1'; c.fillRect(0, 0, s, s); c.strokeStyle = 'rgba(140,120,95,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(s, s); c.moveTo(0, s); c.lineTo(s, 0); c.stroke(); });
    if (kind === 'garage') return tile('garage', 64, 8, (c, s) => { c.fillStyle = '#d9dbde'; c.fillRect(0, 0, s, s); c.fillStyle = 'rgba(120,125,135,.3)'; c.fillRect(0, 0, s, 1); c.fillRect(0, 0, 1, s); });
    if (kind === 'porch') return tile('porch', 48, 3, (c, s) => { c.fillStyle = '#d3d3d8'; c.fillRect(0, 0, s, s); c.fillStyle = 'rgba(110,110,125,.25)'; c.fillRect(0, 0, s, 1); });
    if (kind === 'lawn') return tile('lawn', 64, 4, (c, s) => { c.fillStyle = '#8fd16a'; c.fillRect(0, 0, s, s); c.fillStyle = '#7fc45a'; for (let i = 0; i < 26; i++) c.fillRect((i * 29) % s, (i * 47) % s, 2, 4); c.fillStyle = '#a2dd7c'; for (let i = 0; i < 16; i++) c.fillRect((i * 41 + 7) % s, (i * 23 + 11) % s, 2, 3); });
    if (kind === 'sidewalk') return tile('sidewalk', 64, 4, (c, s) => { c.fillStyle = '#e4e0d8'; c.fillRect(0, 0, s, s); c.fillStyle = 'rgba(120,115,105,.35)'; c.fillRect(0, 0, 1.5, s); });
    if (kind === 'roof') return tile('roof', 48, 3, (c, s) => { c.fillStyle = '#9a6a4c'; c.fillRect(0, 0, s, s); c.fillStyle = '#86583d'; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(i * 12 + (j % 2 ? 6 : 0), j * 12 + 12, 6, Math.PI, 0); c.fill(); } });
    if (kind === 'checker') return tile('checker', 64, 4, (c, s) => { c.fillStyle = '#fff'; c.fillRect(0, 0, s, s); c.fillStyle = '#ffc0dc'; c.fillRect(0, 0, 32, 32); c.fillRect(32, 32, 32, 32); });
    if (kind === 'rainbow') return tile('rainbow', 84, 7, (c, s) => { ['#ffb3b3', '#ffd6a5', '#fff3a8', '#c8f2b4', '#b4e1ff', '#d4c2ff', '#ffc4e8'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 12, s, 12); }); });
    if (kind === 'space') return tile('space', 96, 8, (c, s) => { c.fillStyle = '#2a2460'; c.fillRect(0, 0, s, s); c.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((i * 37 + 9) % s, (i * 53 + 17) % s, i % 3 ? 1 : 1.8, 0, TAU); c.fill(); } c.fillStyle = '#ffe066'; c.beginPath(); c.arc(70, 30, 3, 0, TAU); c.fill(); });
    if (kind === 'grass') return A.floorStyle('lawn');
    return (A.FLOORS[kind] || A.FLOORS.wood)[1];
  };

  // ---------- ground and floors ----------
  const fillRect = (c, q, style) => { c.fillStyle = style; c.fillRect(q[0], q[1], q[2] - q[0], q[3] - q[1]); };
  A.ground = (c, floor, t) => {
    const F = G.MAP.floors[floor], b = F.bounds, SIDE = -8.6;
    const roof = q => { fillRect(c, q, A.floorStyle('roof')); c.strokeStyle = OL; c.lineWidth = 0.1; c.strokeRect(q[0], q[1], q[2] - q[0], q[3] - q[1]); };
    if (floor === 1) {
      fillRect(c, [b[0] - 30, b[1] - 30, b[2] + 30, b[3] + 40], '#a9d98a');
      // the alley, with the garages of the houses across it
      fillRect(c, [-45, -13, 65, 0.4], '#d6d0c5');
      c.strokeStyle = 'rgba(120,115,105,.35)'; c.lineWidth = 0.06; for (let x = -40; x < 60; x += 12) { c.beginPath(); c.moveTo(x, -13); c.lineTo(x, 0.4); c.stroke(); }
      for (let x = -42; x < 60; x += 33) { roof([x, -40, x + 26, -13]); box(c, x + 3, -13.7, 16, 0.7, '#fff', 0.1); }
      // the houses on both sides: one neighbor's wall closes our courtyard, the other's courtyard touches our far wall
      roof([-40, -1, SIDE - 0.5, 62]); roof([-40 - 33, -1, -40 - 2, 62]);
      fillRect(c, [24.6, 0.4, 33.2, 62], '#e0d3bf'); roof([33.2, -1, 60, 62]);
      line(c, [24.6, 0.4, 33.2, 0.4], '#b98a5e', 0.3);
      // our courtyard: scored concrete, and a bark path past the chimney to the front gate
      fillRect(c, [SIDE, 0.4, 3.06, 28.9], A.floorStyle('concrete')); fillRect(c, [SIDE, 28.9, 8.65, 41.38], A.floorStyle('concrete'));
      fillRect(c, [SIDE, 41.38, 0, 57.9], '#b98d6f');
      c.fillStyle = A.floorStyle('concrete'); c.beginPath(); c.moveTo(SIDE, 41.3); c.lineTo(0, 41.3); c.lineTo(0, 42.2); c.quadraticCurveTo(-4, 44.6, SIDE, 42.6); c.closePath(); c.fill();
      // porch
      for (const q of [[-0.3, 57.28, 24.5, 62.9], [15.63, 54.77, 24.5, 57.28]]) fillRect(c, q, A.floorStyle('porch'));
      // front: lawn, then the path that runs along the green belt, then the trees
      fillRect(c, [-45, 62.9, 65, 73], A.floorStyle('lawn'));
      fillRect(c, [-45, 73, 65, 77], A.floorStyle('sidewalk'));
      fillRect(c, [-45, 77, 65, 120], '#8fca6c');
      for (let i = 0; i < 9; i++) { const x = -38 + i * 11.5, y = 81 + (i % 3) * 2.2, r = 3 + (i % 2); circ(c, x, y, r, '#5fae52', '#3f8a3a'); circ(c, x - 1, y - 1, r * 0.55, '#78c466', null); }
    } else {
      fillRect(c, [b[0] - 30, b[1] - 30, b[2] + 30, b[3] + 30], '#bfdcef');
      // looking down from upstairs: the neighbors' roofs, our courtyard, the porch roof and the treetops
      roof([-40, -1, SIDE - 0.5, 62]); roof([33.2, -1, 60, 62]);
      c.globalAlpha = 0.6; fillRect(c, [SIDE - 0.5, -0.5, 3, 30.8], '#d9cdb9'); fillRect(c, [SIDE - 0.5, 30.8, 8.6, 43.3], '#d9cdb9'); fillRect(c, [SIDE - 0.5, 43.3, -0.2, 58], '#b98d6f'); fillRect(c, [24.6, 0, 33.2, 62], '#d9cdb9');
      fillRect(c, [-45, -14, 65, -0.5], '#cfcabf'); c.globalAlpha = 1;
      roof([-0.8, 55.4, 14, 63.2]); roof([14, 56.7, 24.9, 63.2]); roof([2.6, 30.7, 8.6, 43.3]);
      fillRect(c, [-2.5, 44, -0.2, 53.6], '#c9a57b');
      for (const [x, y, r] of [[-6.5, 26, 2], [-5, 65, 2.6], [24, 68, 2.8], [-7, -4, 2.2]]) { circ(c, x, y, r, '#6fbf5e', null); circ(c, x - r * 0.3, y - r * 0.3, r * 0.6, '#86d273', null); }
      for (let i = 0; i < 4; i++) { const x = ((t * 0.5 + i * 13) % 50) - 14, y = -2 + i * 17; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(x - 30 + (i % 2) * 62, y, 2.2, 0.9, 0, 0, TAU); c.fill(); }
    }
  };
  A.floors = (c, floor) => {
    for (let i = G.MAP.rooms.length - 1; i >= 0; i--) {
      const r = G.MAP.rooms[i];
      if (r.floor !== floor || ['courtyard', 'alley', 'yard', 'porch'].includes(r.id)) continue;
      const paint = G.save.house.paint[r.id] || {};
      const style = A.floorStyle(r.id === 'garage' ? 'garage' : (paint.floor || 'wood'));
      for (const q of r.rects) fillRect(c, q, style);
      const wall = paint.wall && A.WALLS[paint.wall];
      if (wall && wall !== A.WALLS.white) {
        // a band of colour around the room shows its painted walls
        c.save(); c.beginPath(); for (const q of r.rects) c.rect(q[0], q[1], q[2] - q[0], q[3] - q[1]); c.clip();
        c.lineWidth = 1.1;
        r.rects.forEach((q, k) => {
          if (wall === 'rainbow') { const g = c.createLinearGradient(q[0], q[1], q[2], q[3]); ['#ff8f8f', '#ffc38a', '#ffe483', '#a8e6a1', '#9cc8ff', '#c9a8ff'].forEach((col, n) => g.addColorStop(n / 5, col)); c.strokeStyle = g; } else c.strokeStyle = wall;
          if (k === 0) c.strokeRect(q[0], q[1], q[2] - q[0], q[3] - q[1]);
        });
        c.restore();
      }
    }
  };
  // patches of sunshine on the floor under each window
  A.sunbeams = (c, floor, t) => {
    const F = G.MAP.floors[floor];
    c.fillStyle = 'rgba(255,246,190,.28)';
    for (const w of F.windows) {
      if (w[4]) continue;
      const mx = (w[0] + w[2]) / 2, my = (w[1] + w[3]) / 2, horiz = w[1] === w[3];
      const inside = (dx, dy) => { const r = G.MAP.roomAt(floor, mx + dx, my + dy); return r && !['courtyard', 'alley', 'yard', 'porch'].includes(r.id); };
      let nx = 0, ny = 0;
      if (horiz) ny = inside(0, 1) ? 1 : inside(0, -1) ? -1 : 0; else nx = inside(1, 0) ? 1 : inside(-1, 0) ? -1 : 0;
      if (!nx && !ny) continue;
      const L = 2.6, sk = 0.9;
      c.beginPath();
      if (horiz) { c.moveTo(w[0], w[1] + ny * 0.4); c.lineTo(w[2], w[1] + ny * 0.4); c.lineTo(w[2] + sk, w[1] + ny * L); c.lineTo(w[0] + sk, w[1] + ny * L); }
      else { c.moveTo(w[0] + nx * 0.4, w[1]); c.lineTo(w[0] + nx * 0.4, w[3]); c.lineTo(w[0] + nx * L, w[3] + sk); c.lineTo(w[0] + nx * L, w[1] + sk); }
      c.closePath(); c.fill();
    }
  };
  const WALLCOL = { t: '#d6ad7f', y: '#f3de8c', c: '#f6f1e6', pony: '#fffdf8' };
  A.walls = (c, floor) => {
    const F = G.MAP.floors[floor];
    const stroke = (segs, col, w, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'square'; c.beginPath(); for (const s of segs) { c.moveTo(s[0] + dx, s[1] + dy); c.lineTo(s[2] + dx, s[3] + dy); } c.stroke(); };
    stroke(F.walls, 'rgba(40,30,70,.16)', 0.6, 0.14, 0.22);
    stroke(F.walls, OL, 0.62);
    stroke(F.walls, '#fffdf8', 0.44);
    // outside walls show what the house is made of: tan stucco, yellow siding on the front
    for (const k of ['t', 'y', 'c']) stroke(F.walls.filter(s => s[4] === k), WALLCOL[k], 0.44);
    c.lineCap = 'butt';
    for (const w of F.windows) {
      if (w[4] === 'pass') { line(c, [w[0], w[1], w[2], w[3]], OL, 0.62); line(c, [w[0], w[1], w[2], w[3]], MARBLE, 0.46); continue; }
      c.lineCap = 'butt'; c.strokeStyle = OL; c.lineWidth = 0.62; c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke();
      c.strokeStyle = '#9fdcff'; c.lineWidth = 0.44; c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke();
      const h = w[1] === w[3]; c.strokeStyle = '#fff'; c.lineWidth = 0.1; c.beginPath(); c.moveTo((w[0] + w[2]) / 2 - (h ? 0 : 0.22), (w[1] + w[3]) / 2 - (h ? 0.22 : 0)); c.lineTo((w[0] + w[2]) / 2 + (h ? 0 : 0.22), (w[1] + w[3]) / 2 + (h ? 0.22 : 0)); c.stroke();
    }
    for (const d of F.doors) {
      const a = d[3] * Math.PI / 180, ex = d[0] + Math.cos(a) * d[2], ey = d[1] + Math.sin(a) * d[2];
      line(c, [d[0], d[1], ex, ey], OL, 0.26); line(c, [d[0], d[1], ex, ey], d[4] === 'front' ? '#2f4a6b' : d[4] === 'glass' ? '#bfe6ff' : '#fff', 0.14);
      circ(c, d[0] + Math.cos(a) * (d[2] - 0.3) - Math.sin(a) * 0.14, d[1] + Math.sin(a) * (d[2] - 0.3) + Math.cos(a) * 0.14, 0.08, GOLD, null);
    }
    for (const f of F.fences) {
      const [x1, y1, x2, y2, kind] = f; if (kind === 'none') continue;
      const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(len / (kind === 'wood' ? 1.2 : 0.7)));
      if (kind === 'neighbor') { line(c, [x1 - 0.25, y1, x2 - 0.25, y2], OL, 0.72); line(c, [x1 - 0.25, y1, x2 - 0.25, y2], WALLCOL.t, 0.54); for (let i = 1; i < 6; i++) { const yy = y1 + (y2 - y1) * i / 6; line(c, [x1 - 0.25, yy - 0.6, x1 - 0.25, yy + 0.6], '#9fdcff', 0.3); } }
      else if (kind === 'wood') { line(c, [x1, y1, x2, y2], OL, 0.42); line(c, [x1, y1, x2, y2], '#b98a5e', 0.28); for (let i = 0; i <= n; i++) circ(c, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, 0.17, '#a37548', null); }
      else if (kind === 'hedge') { for (let i = 0; i <= n * 2; i++) circ(c, x1 + (x2 - x1) * i / (n * 2), y1 + (y2 - y1) * i / (n * 2), 0.75, i % 2 ? '#6dbb5c' : '#7dc96b', null); }
      else { line(c, [x1, y1, x2, y2], OL, 0.3); line(c, [x1, y1, x2, y2], '#fff', 0.18); for (let i = 0; i <= n; i++) circ(c, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, 0.13, '#fff', OL); }
    }
  };

  // ---------- built-in things ----------
  // each gets (ctx, fixture, time); fixture.on is its switch
  const X = A.fx = {};
  X.counter = (c, f) => marble(c, f.x, f.y, f.w, f.h);
  X.island = (c, f, t) => {
    marble(c, f.x, f.y, f.w, f.h, 0.2); circ(c, f.x + f.w / 2, f.y + f.h * 0.28, 0.55, '#fff'); emoji(c, '🍏', f.x + f.w / 2, f.y + f.h * 0.28, 0.7);
    // the gold lamp with glass balls that hangs over it
    line(c, [f.x + f.w / 2, f.y + f.h * 0.5, f.x + f.w / 2, f.y + f.h * 0.92], GOLD, 0.09);
    for (let i = 0; i < 5; i++) { const yy = f.y + f.h * (0.52 + i * 0.1), dx = (i % 2 ? 0.42 : -0.42); line(c, [f.x + f.w / 2, yy, f.x + f.w / 2 + dx, yy], GOLD, 0.06); circ(c, f.x + f.w / 2 + dx, yy, 0.22, `rgba(255,250,215,${0.75 + 0.2 * Math.sin(t * 2 + i)})`, 'rgba(180,150,80,.7)'); }
  };
  X.stool = (c, f) => { circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.5, '#d9a66c'); circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.36, null, '#b9854c'); };
  X.cooktop = (c, f, t) => {
    box(c, f.x, f.y, f.w, f.h, '#3a3d46', 0.1);
    for (const [u, v, r] of [[0.3, 0.2, 0.26], [0.72, 0.2, 0.2], [0.5, 0.5, 0.3], [0.3, 0.8, 0.2], [0.72, 0.8, 0.26]]) {
      circ(c, f.x + f.w * u, f.y + f.h * v, r, '#22242b', '#6a6e7a');
      if (f.on) { c.strokeStyle = `rgba(80,170,255,${0.6 + 0.4 * Math.sin(t * 12 + u * 9)})`; c.lineWidth = 0.08; c.beginPath(); c.arc(f.x + f.w * u, f.y + f.h * v, r * 0.7, 0, TAU); c.stroke(); }
    }
    if (f.on) { circ(c, f.x + f.w * 0.5, f.y + f.h * 0.5, 0.5, '#4a4d57'); emoji(c, f.food || '🥞', f.x + f.w * 0.5, f.y + f.h * 0.5, 0.7); }
  };
  X.ksink = (c, f, t) => {
    box(c, f.x, f.y, f.w, f.h, STEEL, 0.2); box(c, f.x + 0.15, f.y + 0.15, f.w - 0.3, f.h - 0.3, '#aab1bc', 0.18, '#8a909c');
    faucet(c, f.x + f.w / 2, f.y + f.h - 0.05, Math.PI);
    if (f.on) { circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.3 + 0.05 * Math.sin(t * 20), 'rgba(90,170,255,.8)', null); drops(c, f.x + 0.3, f.y + 0.2, f.w - 0.6, f.h - 0.4, t, 6); }
  };
  X.fridge = (c, f, t) => {
    const g = c.createLinearGradient(f.x, 0, f.x + f.w, 0); g.addColorStop(0, '#e3e7ed'); g.addColorStop(1, '#b9c0ca');
    box(c, f.x, f.y, f.w, f.h, g, 0.15);
    if (f.on) {
      box(c, f.x + 0.2, f.y + 0.2, f.w - 0.4, f.h - 0.4, '#f4fbff', 0.1, '#9aa');
      ['🥛', '🧀', '🍓', '🥚', '🥕', '🍎'].forEach((e, i) => emoji(c, e, f.x + 0.7 + (i % 2) * 1.1, f.y + 0.65 + Math.floor(i / 2) * 0.9, 0.7));
      line(c, [f.x, f.y, f.x - 1.3, f.y - 0.5], OL, 0.24); line(c, [f.x, f.y, f.x - 1.3, f.y - 0.5], '#d5dae2', 0.14);
      line(c, [f.x, f.y + f.h, f.x - 1.3, f.y + f.h + 0.5], OL, 0.24); line(c, [f.x, f.y + f.h, f.x - 1.3, f.y + f.h + 0.5], '#d5dae2', 0.14);
    } else { line(c, [f.x + 0.25, f.y + f.h * 0.42, f.x + f.w - 0.2, f.y + f.h * 0.42], '#8d95a1', 0.05); line(c, [f.x + 0.14, f.y + 0.3, f.x + 0.14, f.y + f.h * 0.36], '#7f8794', 0.1); line(c, [f.x + 0.14, f.y + f.h * 0.5, f.x + 0.14, f.y + f.h - 0.3], '#7f8794', 0.1); }
  };
  X.ovens = (c, f, t) => {
    box(c, f.x, f.y, f.w, f.h, STEEL, 0.12); box(c, f.x + 0.2, f.y + 0.25, f.w - 0.6, f.h - 0.5, f.on ? '#ffb347' : '#2b2d36', 0.1, '#555');
    line(c, [f.x + 0.1, f.y + 0.3, f.x + 0.1, f.y + f.h - 0.3], '#7f8794', 0.1);
    if (f.on) emoji(c, '🍪', f.x + f.w / 2 - 0.1, f.y + f.h / 2, 0.8);
  };
  X.kdesk = (c, f) => { marble(c, f.x, f.y, f.w, f.h); box(c, f.x, f.y, f.w, 0.5, CAB, 0.06); emoji(c, '📓', f.x + 0.9, f.y + 1.1, 0.65); emoji(c, '✏️', f.x + 2.2, f.y + 1.15, 0.55); emoji(c, '🖍️', f.x + 3.5, f.y + 1.1, 0.55); };
  X.pshelf = (c, f) => {
    box(c, f.x, f.y, f.w, f.h, CAB, 0.08);
    const long = f.w > f.h, n = Math.floor((long ? f.w : f.h) / 0.95), E = ['🥫', '🍝', '🥣', '🍯', '🍪', '🍚', '🥜', '🧃'];
    for (let i = 0; i < n; i++) emoji(c, E[(i + (long ? 0 : 4)) % E.length], long ? f.x + 0.55 + i * 0.95 : f.x + f.w / 2, long ? f.y + f.h / 2 : f.y + 0.55 + i * 0.95, 0.72);
  };
  X.fireplace = (c, f, t) => {
    // seen from above: the marble hearth fills the bump in the wall, and the fire opens toward the room
    marble(c, f.x, f.y, f.w, f.h, 0.08);
    box(c, f.x + f.w * 0.3, f.y + f.h * 0.18, f.w * 0.7, f.h * 0.64, '#2a2530', 0.08);
    box(c, f.x + f.w - 0.22, f.y + f.h * 0.14, 0.22, f.h * 0.72, '#fff', 0.05);
    if (f.on) {
      for (let i = 0; i < 4; i++) { const yy = f.y + f.h * (0.28 + i * 0.15), s = 0.5 + 0.12 * Math.sin(t * 9 + i * 2); emoji(c, '🔥', f.x + f.w * 0.62, yy, s * 1.3, -Math.PI / 2); }
      c.fillStyle = `rgba(255,170,60,${0.12 + 0.04 * Math.sin(t * 7)})`; c.beginPath(); c.ellipse(f.x + f.w + 1.8, f.y + f.h / 2, 2.8, 3.4, 0, 0, TAU); c.fill();
    } else emoji(c, '🪵', f.x + f.w * 0.62, f.y + f.h / 2, 0.8, -Math.PI / 2);
  };
  X.builtin = (c, f) => { box(c, f.x, f.y, f.w, f.h, CAB, 0.08); marble(c, f.x + 0.5, f.y + 0.15, f.w - 0.6, f.h - 0.3, 0.08); circ(c, f.x + 0.42, f.y + f.h / 2, 0.36, '#dfeaf2', '#555'); emoji(c, '🪴', f.x + f.w * 0.62, f.y + 0.8, 0.6); emoji(c, '🏺', f.x + f.w * 0.62, f.y + f.h - 0.8, 0.6); };
  X.lowshelf = (c, f) => { box(c, f.x, f.y, f.w, f.h, CAB, 0.08); const n = Math.floor(f.h / 1.1); for (let i = 0; i < n; i++) { line(c, [f.x, f.y + i * (f.h / n), f.x + f.w, f.y + i * (f.h / n)], '#cfcbc2', 0.04); emoji(c, ['📚', '🧺', '🧸', '📚', '🪴', '🎲', '📚', '🧩', '🪀', '📚'][i % 10], f.x + f.w / 2, f.y + (i + 0.5) * (f.h / n), 0.7); } };
  X.nook = (c, f) => { marble(c, f.x, f.y, f.w, f.h); box(c, f.x + f.w - 0.5, f.y, 0.5, f.h, CAB, 0.06); emoji(c, '💡', f.x + 0.9, f.y + 0.8, 0.7); emoji(c, '📚', f.x + 0.9, f.y + f.h / 2, 0.7); emoji(c, '🖍️', f.x + 0.9, f.y + f.h - 0.8, 0.6); circ(c, f.x - 0.9, f.y + f.h * 0.42, 0.55, '#d9a66c'); };
  X.toilet = (c, f, t) => local(c, f, (w, h) => {
    box(c, -w / 2 + 0.15, -h / 2, w - 0.3, h * 0.3, '#fff', 0.12);
    oval(c, 0, h * 0.12, w * 0.4, h * 0.36, '#fff'); oval(c, 0, h * 0.12, w * 0.27, h * 0.24, f.on ? '#7cc4ff' : '#dff1ff', '#b9c6d6');
    if (f.on) { c.strokeStyle = '#fff'; c.lineWidth = 0.07; c.beginPath(); for (let a = 0; a < 7; a += 0.3) { const r = a / 7 * w * 0.25; c.lineTo(Math.cos(a + t * 12) * r, h * 0.12 + Math.sin(a + t * 12) * r * 0.9); } c.stroke(); }
    circ(c, w * 0.26, -h * 0.36, 0.08, STEEL, '#889');
  });
  const basin = (c, x, y, on, t) => { oval(c, x, y, 0.62, 0.45, '#fff', '#b9c6d6'); if (on) circ(c, x, y, 0.2 + 0.04 * Math.sin(t * 20), 'rgba(90,170,255,.85)', null); else circ(c, x, y, 0.06, '#889', null); };
  X.vanity = (c, f, t) => local(c, f, (w, h) => { marble(c, -w / 2, -h / 2, w, h); basin(c, 0, 0.12, f.on, t); faucet(c, 0, -h / 2 + 0.2); });
  X.vanity2 = (c, f, t) => { marble(c, f.x, f.y, f.w, f.h); for (const v of [0.27, 0.73]) { c.save(); c.translate(f.x + f.w / 2, f.y + f.h * v); c.rotate(Math.PI / 2); basin(c, 0, 0.1, f.on, t); faucet(c, 0, -0.62); c.restore(); } };
  X.lsink = (c, f, t) => { marble(c, f.x, f.y, f.w, f.h); box(c, f.x + 0.6, f.y + 0.45, f.w - 0.85, f.h - 0.9, '#fff', 0.2, '#b9c6d6'); if (f.on) circ(c, f.x + f.w / 2 + 0.2, f.y + f.h / 2, 0.25, 'rgba(90,170,255,.85)', null); c.save(); c.translate(f.x + 0.3, f.y + f.h / 2); c.rotate(-Math.PI / 2); faucet(c, 0, 0); c.restore(); };
  X.shower = (c, f, t) => {
    box(c, f.x, f.y, f.w, f.h, '#f3f1ee', 0.1);
    c.save(); rr(c, f.x, f.y, f.w, f.h, 0.1); c.clip(); c.fillStyle = '#3c3c46'; for (let i = 0; i < f.w / 0.42; i++) for (let j = 0; j < f.h / 0.42; j++) { c.beginPath(); c.arc(f.x + 0.3 + i * 0.42 + (j % 2) * 0.21, f.y + 0.3 + j * 0.42, 0.09, 0, TAU); c.fill(); } c.restore();
    if (f.on) { drops(c, f.x + 0.2, f.y + 0.2, f.w - 0.4, f.h - 0.4, t, 26); c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(f.x + f.w * (0.2 + i * 0.2), f.y + f.h * (0.5 + 0.2 * Math.sin(t * 1.5 + i)), 0.6, 0, TAU); c.fill(); } }
    box(c, f.x, f.y, f.w, f.h, GLASS, 0.1, '#7fc4ea');
    circ(c, f.x + 0.5, f.y + 0.5, 0.26, STEEL, '#778');
  };
  X.tub = (c, f, t) => {
    marble(c, f.x, f.y, f.w, f.h); rr(c, f.x + 0.45, f.y + 0.4, f.w - 1, f.h - 0.8, 1.1); c.fillStyle = f.on ? '#8fd0ff' : '#fff'; c.fill(); c.strokeStyle = '#b9c6d6'; c.lineWidth = LW; c.stroke();
    if (f.on) for (let i = 0; i < 12; i++) circ(c, f.x + 1 + ((i * 0.83) % (f.w - 2.2)), f.y + 0.9 + ((i * 0.57 + 0.1 * Math.sin(t * 2 + i)) % (f.h - 1.8)), 0.16 + (i % 3) * 0.07, 'rgba(255,255,255,.85)', 'rgba(150,200,240,.8)');
    c.save(); c.translate(f.x + 0.4, f.y + f.h / 2); c.rotate(-Math.PI / 2); faucet(c, 0, 0); c.restore();
    if (f.duck) emoji(c, '🦆', f.x + f.w * 0.6 + Math.sin(t * 1.4) * 0.5, f.y + f.h * 0.5 + Math.cos(t * 1.1) * 0.25, 0.8);
  };
  const machine = (c, f, t, glass) => {
    box(c, f.x, f.y, f.w, f.h, '#fff', 0.2); circ(c, f.x + f.w / 2, f.y + f.h / 2, f.w * 0.33, '#dfe5ee', '#9aa3b2'); circ(c, f.x + f.w / 2, f.y + f.h / 2, f.w * 0.24, glass, '#7a8494');
    if (f.on) { c.save(); c.translate(f.x + f.w / 2, f.y + f.h / 2); c.rotate(t * 8); emoji(c, '🧦', 0.22, 0, 0.5); emoji(c, '👕', -0.2, 0.1, 0.5); c.restore(); }
    circ(c, f.x + f.w - 0.32, f.y + 0.3, 0.1, f.on ? '#4cd97b' : '#c5cad3', null);
  };
  X.washer = (c, f, t) => machine(c, f, t, f.on ? '#7cc4ff' : '#9bb6d4');
  X.dryer = (c, f, t) => machine(c, f, t, f.on ? '#ffd39b' : '#9bb6d4');
  X.closet = (c, f) => {
    const long = f.w > f.h; c.fillStyle = 'rgba(90,70,50,.08)'; c.fillRect(f.x, f.y, f.w, f.h);
    if (long) line(c, [f.x, f.y + f.h / 2, f.x + f.w, f.y + f.h / 2], '#b98a5e', 0.14); else line(c, [f.x + f.w / 2, f.y, f.x + f.w / 2, f.y + f.h], '#b98a5e', 0.14);
    const cols = ['#ff8fb8', '#9b6bff', '#4d8dff', '#ffd93d', '#4cd97b', '#ff9f43', '#37c9d6', '#ff6f6f'], n = Math.floor((long ? f.w : f.h) / 0.62);
    for (let i = 0; i < n; i++) { if (long) box(c, f.x + 0.25 + i * 0.62, f.y + 0.12, 0.34, f.h - 0.24, cols[i % 8], 0.1); else box(c, f.x + 0.12, f.y + 0.25 + i * 0.62, f.w - 0.24, 0.34, cols[i % 8], 0.1); }
  };
  X.doorsign = (c, f) => { const r = G.MAP.room(f.room); circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.62, '#fff8d6', '#e2c15a'); emoji(c, G.MAP.roomIcon(r), f.x + f.w / 2, f.y + f.h / 2, 0.8); };
  X.block = (c, f) => box(c, f.x, f.y, f.w, f.h, '#fffdf8', 0.05);
  X.stairs1 = (c, f) => {
    // ten steps up along the garage wall, then the steps fan around the corner
    const x0 = f.x + 0.8, n = 9, sw = 0.838, turn = x0 + n * sw;
    box(c, f.x, f.y, 0.8, f.h + 1.2, '#ecd9bc', 0.3, '#b89b74');
    for (let i = 0; i < n; i++) box(c, x0 + i * sw, f.y, sw, f.h, i % 2 ? '#e3cba8' : '#ecd9bc', 0.02, '#b89b74');
    c.fillStyle = '#e6d2b3'; c.fillRect(turn, f.y, f.x + f.w - turn, f.h); c.strokeStyle = '#b89b74'; c.lineWidth = 0.05; c.strokeRect(turn, f.y, f.x + f.w - turn, f.h);
    line(c, [turn, f.y, f.x + f.w, f.y + f.h], '#b89b74', 0.05); line(c, [turn, f.y, f.x + f.w, f.y + f.h * 0.45], '#b89b74', 0.05); line(c, [turn, f.y, turn + (f.x + f.w - turn) * 0.5, f.y + f.h], '#b89b74', 0.05);
    emoji(c, '⬆️', x0 + 1.2, f.y + f.h / 2, 0.9, Math.PI / 2);
  };
  X.stairs2 = (c, f) => {
    // from above: the lower steps (going down), the turn, and the last steps up to the hall
    const lx = f.x, ly = f.y + 4.36, lw = 6.06, lh = f.h - 4.36;
    c.fillStyle = 'rgba(60,45,90,.22)'; c.fillRect(lx, ly - 0.2, lw, lh + 0.2);
    for (let i = 0; i < 8; i++) box(c, lx + 0.2 + i * 0.73, ly, 0.73, lh - 0.1, i % 2 ? '#d5bd98' : '#dfc9a8', 0.02, '#a88c66');
    box(c, f.x + 6.06, f.y, f.w - 6.06, f.h, '#e6d2b3', 0.02, '#b89b74');
    for (const [ex, ey] of [[f.x + f.w, f.y], [f.x + f.w, f.y + f.h * 0.5], [f.x + f.w, f.y + f.h], [f.x + 6.06 + 1.6, f.y + f.h]]) line(c, [f.x + 6.5, f.y + 3.94, ex, ey], '#b89b74', 0.05);
    for (let i = 0; i < 3; i++) box(c, f.x + 4.3 + i * 0.73, f.y, 0.73, 3.27, i % 2 ? '#e3cba8' : '#ecd9bc', 0.02, '#b89b74');
    box(c, f.x + 4.3, f.y + 3.27, 2.2, 1.2, '#e6d2b3', 0.02, '#b89b74');
    emoji(c, '⬇️', f.x + 5.4, f.y + 1.6, 0.9, -Math.PI / 2);
  };
  // garage
  X.garagedoor = (c, f) => {
    const open = G.save.house.garageOpen;
    c.globalAlpha = open ? 0.25 : 1; box(c, f.x, f.y, f.w, f.h, '#fff', 0.05);
    for (let i = 1; i < 8; i++) line(c, [f.x + f.w * i / 8, f.y, f.x + f.w * i / 8, f.y + f.h], '#c5c9d0', 0.04); c.globalAlpha = 1;
  };
  X.car = (c, f, t) => {
    const x = f.x, y = f.y, w = f.w, h = f.h, col = '#4f8fe0';
    for (const [u, v] of [[-0.02, 0.18], [1.02, 0.18], [-0.02, 0.8], [1.02, 0.8]]) box(c, x + w * u - 0.3, y + h * v - 1, 0.6, 2, '#2b2b33', 0.2);
    box(c, x, y, w, h, col, 1.3);
    box(c, x + 0.6, y + h * 0.2, w - 1.2, h * 0.5, '#3d79c7', 0.8, null);
    box(c, x + 0.8, y + h * 0.16, w - 1.6, h * 0.13, '#bfe6ff', 0.4); box(c, x + 0.9, y + h * 0.66, w - 1.8, h * 0.1, '#bfe6ff', 0.4);
    const lit = f.on && Math.sin(t * 14) > 0;
    circ(c, x + 1, y + 0.5, 0.36, lit ? '#fff7a8' : '#f4f4e0'); circ(c, x + w - 1, y + 0.5, 0.36, lit ? '#fff7a8' : '#f4f4e0');
    box(c, x + 0.7, y + h - 0.6, 1.2, 0.36, '#ff5d5d', 0.1); box(c, x + w - 1.9, y + h - 0.6, 1.2, 0.36, '#ff5d5d', 0.1);
  };
  X.shelf = (c, f) => { box(c, f.x, f.y, f.w, f.h, '#eef0f3', 0.06, '#aab'); const n = Math.floor(f.h / 1.3); for (let i = 0; i < n; i++) emoji(c, ['📦', '🧰', '🪣', '🏀', '📦', '🧴', '📦'][i % 7], f.x + f.w / 2, f.y + 0.7 + i * 1.3, 0.8); };
  X.panel = (c, f, t) => { box(c, f.x, f.y, f.w, f.h, '#9aa3b2', 0.06); for (let i = 0; i < 4; i++) box(c, f.x + 0.12, f.y + 0.2 + i * 0.44, 0.26, 0.28, f.on ? '#ffd93d' : '#3c4150', 0.04, null); if (f.alert) emoji(c, '⚡', f.x + 1, f.y + 1 + Math.sin(t * 6) * 0.15, 0.9); };
  X.heater = (c, f) => { circ(c, f.x + f.w / 2, f.y + f.h / 2, f.w * 0.46, '#dfe3e8'); circ(c, f.x + f.w / 2, f.y + f.h / 2, f.w * 0.3, '#eef1f4', '#aab'); circ(c, f.x + f.w * 0.3, f.y + f.h * 0.3, 0.13, '#c0392b', null); circ(c, f.x + f.w * 0.7, f.y + f.h * 0.3, 0.13, '#2e86de', null); };
  X.opener = (c, f, t) => { box(c, f.x, f.y, f.w, f.h, '#fff', 0.08); circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.14, G.save.house.garageOpen ? '#4cd97b' : '#ff6f6f', null); };
  X.bikes = (c, f, t) => { emoji(c, '🛴', f.x + 1, f.y + 1.2, 1.7); emoji(c, '🚲', f.x + 2.5, f.y + 2.8, 2); };
  X.rocket = (c, f, t) => {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    oval(c, cx, cy + 1.2, 1.1, 0.4, 'rgba(40,30,70,.18)', null);
    c.save(); c.translate(cx, cy + (f.on ? -0.3 - Math.abs(Math.sin(t * 5)) * 0.4 : 0));
    c.beginPath(); c.moveTo(-0.55, 0.9); c.lineTo(-1.05, 1.35); c.lineTo(-0.55, 0.3); c.moveTo(0.55, 0.9); c.lineTo(1.05, 1.35); c.lineTo(0.55, 0.3); c.fillStyle = '#b83a66'; c.fill(); c.strokeStyle = OL; c.lineWidth = LW; c.stroke();
    c.beginPath(); c.moveTo(0, -1.6); c.bezierCurveTo(0.75, -0.9, 0.62, 0.5, 0.55, 1); c.lineTo(-0.55, 1); c.bezierCurveTo(-0.62, 0.5, -0.75, -0.9, 0, -1.6); c.fillStyle = '#ff5d8f'; c.fill(); c.stroke();
    circ(c, 0, -0.3, 0.3, '#bfeeff');
    if (f.on) emoji(c, '🔥', 0, 1.45, 0.7, Math.PI);
    c.restore();
  };
  // outside
  X.mat = (c, f) => { box(c, f.x, f.y, f.w, f.h, '#c9a26a', 0.1); A.text(c, 'home', f.x + f.w / 2, f.y + f.h / 2, 0.6, '#5a4326'); };
  X.doorbell = (c, f, t) => { circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.24, '#fff'); circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.11, f.on ? '#ffd93d' : '#ff9f43', null); if (f.hint) emoji(c, '👆', f.x + f.w / 2 + 0.2, f.y + f.h + 0.6 + Math.sin(t * 6) * 0.15, 0.9); };
  X.flowerpot = (c, f, t) => { circ(c, f.x + f.w / 2, f.y + f.h / 2, 0.55, '#4b5568'); for (let i = 0; i < 5; i++) emoji(c, '🌼', f.x + f.w / 2 + Math.cos(i * 1.26) * 0.3, f.y + f.h / 2 + Math.sin(i * 1.26) * 0.3 - (f.on ? Math.abs(Math.sin(t * 8 + i)) * 0.15 : 0), 0.5); };
  X.column = (c, f) => { box(c, f.x, f.y, f.w, f.h, '#fff', 0.08); box(c, f.x + 0.14, f.y + 0.14, f.w - 0.28, f.h - 0.28, '#f1f1f4', 0.05, '#c9c9d2'); };
  X.walk = (c, f) => { c.fillStyle = A.floorStyle('sidewalk'); c.fillRect(f.x, f.y, f.w, f.h); c.strokeStyle = 'rgba(120,115,105,.5)'; c.lineWidth = 0.05; c.strokeRect(f.x, f.y, f.w, f.h); };
  X.bush = (c, f) => { const n = Math.round(f.w / 1.1); for (let i = 0; i < n; i++) circ(c, f.x + 0.7 + i * (f.w - 1.4) / Math.max(1, n - 1), f.y + f.h / 2 + (i % 2 ? 0.15 : -0.15), 0.95, i % 2 ? '#5fae52' : '#74c365', '#3f8a3a'); };
  X.tree = (c, f, t) => { const cx = f.x + f.w / 2, cy = f.y + f.h / 2, s = f.on ? Math.sin(t * 16) * 0.08 : 0; circ(c, cx, cy, 0.5, '#8a5a3c'); c.globalAlpha = 0.9; circ(c, cx + s, cy - 0.5, f.w * 0.62, '#62b455', '#3f8a3a'); circ(c, cx - 0.6 + s, cy - 1, f.w * 0.36, '#7dc96b', null); c.globalAlpha = 1; };
  X.banana = (c, f, t) => { const cx = f.x + f.w / 2, cy = f.y + f.h / 2; for (let i = 0; i < 7; i++) { c.save(); c.translate(cx, cy); c.rotate(i * 0.9 + (f.on ? Math.sin(t * 14) * 0.1 : 0)); oval(c, 0.9, 0, 1.1, 0.4, i % 2 ? '#4fb060' : '#66c773', '#2f8046'); line(c, [0.1, 0, 1.9, 0], '#2f8046', 0.04); c.restore(); } };
  X.truck = (c, f, t) => {
    box(c, f.x, f.y, f.w * 0.72, f.h, '#fff', 0.3); box(c, f.x + f.w * 0.74, f.y + 0.4, f.w * 0.26, f.h - 0.8, '#ffb347', 0.6); box(c, f.x + f.w * 0.84, f.y + 0.8, f.w * 0.1, f.h - 1.6, '#bfe6ff', 0.3);
    A.text(c, 'MOVING DAY', f.x + f.w * 0.36, f.y + f.h * 0.36, 1.1, '#ff6fb1', 700); emoji(c, '📦', f.x + f.w * 0.2, f.y + f.h * 0.7, 1.3); emoji(c, '📦', f.x + f.w * 0.36, f.y + f.h * 0.72, 1.1); emoji(c, '🪑', f.x + f.w * 0.52, f.y + f.h * 0.7, 1.2);
  };
  X.sign = (c, f, t) => { box(c, f.x + f.w / 2 - 0.1, f.y + 0.4, 0.2, 1.3, '#8a5a3c', 0.04); box(c, f.x - 0.5, f.y - 0.8, f.w + 1, 1.3, '#fff8d6', 0.2, '#b9902f'); emoji(c, '🏊', f.x + 0.1, f.y - 0.15, 0.8); emoji(c, '🛝', f.x + 1.2, f.y - 0.15, 0.8); emoji(c, '👈', f.x - 1.2, f.y - 0.1 + Math.sin(t * 4) * 0.1, 0.8); };
  X.bistro = (c, f) => { const cx = f.x + f.w / 2, cy = f.y + f.h / 2; for (const s of [-1, 1]) { circ(c, cx + s * 1.75, cy, 0.78, '#2e2e36'); circ(c, cx + s * 1.75, cy, 0.5, '#4a4a55', null); } circ(c, cx, cy, 0.62, '#3a3a44'); emoji(c, '🪴', cx, cy, 0.6); };
  X.planter = (c, f, t) => {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2, st = (G.save.house.flowers[f.id] || {});
    circ(c, cx, cy, 0.8, '#c9703f'); circ(c, cx, cy, 0.6, '#6b4428', '#8a5a3c');
    if (st.stage === 1) emoji(c, '🌱', cx, cy - 0.1, 0.8);
    if (st.stage >= 2) { for (let i = 0; i < 3; i++) emoji(c, st.kind || '🌷', cx + (i - 1) * 0.45, cy - 0.2 - (i === 1 ? 0.3 : 0) + Math.sin(t * 2 + i) * 0.04, 0.85); }
    if (f.wet) drops(c, cx - 0.6, cy - 1.4, 1.2, 1.3, t, 6);
  };
  X.acbox = (c, f) => { box(c, f.x, f.y, f.w, f.h, '#fff', 0.06); c.strokeStyle = '#c9ccd3'; c.lineWidth = 0.05; c.save(); rr(c, f.x, f.y, f.w, f.h, 0.06); c.clip(); for (let i = -8; i < 10; i++) { c.beginPath(); c.moveTo(f.x + i * 0.45, f.y); c.lineTo(f.x + i * 0.45 + f.h, f.y + f.h); c.moveTo(f.x + i * 0.45 + f.h, f.y); c.lineTo(f.x + i * 0.45, f.y + f.h); c.stroke(); } c.restore(); };
  X.gate = (c, f) => { const d = f.dir || 1; line(c, [f.x, f.y, f.x + 0.8, f.y + d * (f.w - 0.2)], OL, 0.36); line(c, [f.x, f.y, f.x + 0.8, f.y + d * (f.w - 0.2)], '#c79a6d', 0.24); };
  X.bins = (c, f) => { [['#3a3a44', 0], ['#2e7dd1', 1], ['#3fa35a', 2]].forEach(([col, i]) => { box(c, f.x + i * 0.95, f.y + 0.3, 0.85, 1.9, col, 0.15); box(c, f.x + i * 0.95, f.y + 0.2, 0.85, 0.5, col, 0.12); }); };

  // a ceiling fan, seen as its turning shadow on the floor
  X.fan = (c, f, t) => {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2, r = f.w / 2;
    c.save(); c.translate(cx, cy); c.rotate(t * 1.6); c.fillStyle = 'rgba(90,60,40,.16)';
    for (let i = 0; i < 5; i++) { c.rotate(TAU / 5); c.beginPath(); c.ellipse(r * 0.55, 0, r * 0.45, r * 0.13, 0, 0, TAU); c.fill(); }
    c.restore(); circ(c, cx, cy, r * 0.16, 'rgba(255,246,200,.5)', null);
  };
  X.steps = (c, f) => { box(c, f.x, f.y, f.w, f.h, '#c2c2c8', 0.08); line(c, [f.x, f.y + f.h / 2, f.x + f.w, f.y + f.h / 2], '#9a9aa5', 0.05); };
  X.mulch = (c, f) => { c.fillStyle = '#9c5a3c'; c.fillRect(f.x, f.y, f.w, f.h); c.fillStyle = 'rgba(60,30,15,.25)'; for (let i = 0; i < f.w * 3; i++) c.fillRect(f.x + ((i * 0.37) % f.w), f.y + ((i * 0.91) % f.h), 0.18, 0.08); };
  X.plantbed = (c, f, t) => { c.fillStyle = '#8a5236'; c.fillRect(f.x, f.y, f.w, f.h); const n = Math.floor(f.h / 2.6); for (let i = 0; i < n; i++) { const cx = f.x + f.w / 2, cy = f.y + 1.4 + i * (f.h - 2) / Math.max(1, n - 1); for (let k = 0; k < 7; k++) { c.save(); c.translate(cx, cy); c.rotate(k * 0.9 + i); oval(c, 0.55, 0, 0.6, 0.16, k % 2 ? '#4f9a6a' : '#63b07c', '#2f7046'); c.restore(); } } };
  X.stones = (c, f) => { const n = Math.floor(f.h / 1.7); for (let i = 0; i < n; i++) box(c, f.x + (i % 2 ? 0.25 : 0), f.y + 0.2 + i * (f.h / n), f.w - 0.25, f.h / n - 0.45, i % 2 ? '#b9b3a8' : '#c8c2b6', 0.25, '#8f897d'); };
  X.linen = (c, f) => { box(c, f.x, f.y, f.w, f.h, CAB, 0.08); line(c, [f.x + f.w, f.y + f.h / 2, f.x + f.w - 0.5, f.y + f.h / 2], '#cfcbc2', 0.04); circ(c, f.x + f.w - 0.2, f.y + f.h * 0.4, 0.07, GOLD, null); circ(c, f.x + f.w - 0.2, f.y + f.h * 0.6, 0.07, GOLD, null); emoji(c, '🧺', f.x + f.w * 0.42, f.y + f.h * 0.3, 0.7); emoji(c, '🧻', f.x + f.w * 0.42, f.y + f.h * 0.72, 0.6); };
  X.sliders = (c, f) => { box(c, f.x, f.y + f.h * 0.1, f.w * 0.55, f.h * 0.4, '#fff', 0.03); box(c, f.x + f.w * 0.45, f.y + f.h * 0.5, f.w * 0.55, f.h * 0.4, '#fff', 0.03); };
  A.fixture = (c, f, t) => { const fn = X[f.t]; if (fn) fn(c, f, t); };
})();
