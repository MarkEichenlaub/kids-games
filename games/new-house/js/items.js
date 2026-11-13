// Everything the kids can put in a room and move around.
// Each is drawn from above in a box w x h feet centred on (0, 0), with its back at the top.
(() => {
  const A = G.ART, OL = A.OL, TAU = Math.PI * 2;
  const { circ, oval, box, line, emoji, rr } = A;
  const I = {};
  const def = (id, name, cat, w, h, draw, extra) => { I[id] = Object.assign({ id, name, cat, w, h, draw }, extra || {}); };
  const toy = (id, name, ch, size = 1.3, extra) => def(id, name, 'toys', size, size, (c, w, h, t, it) => { oval(c, 0, h * 0.32, w * 0.36, h * 0.12, 'rgba(40,30,70,.18)', null); emoji(c, ch, 0, -(it && it.hop ? Math.abs(Math.sin(t * 10)) * 0.25 : 0), size * 0.95); }, Object.assign({ icon: ch }, extra));

  // ---------- furniture ----------
  const bed = (id, name, col, col2) => def(id, name, 'furniture', 3.5, 6.6, (c, w, h) => {
    box(c, -w / 2, -h / 2, w, h, '#fff', 0.3); box(c, -w / 2, -h / 2, w, 0.5, '#d9b48a', 0.15);
    box(c, -w / 2 + 0.12, -h / 2 + 2, w - 0.24, h - 2.15, col, 0.3); box(c, -w / 2 + 0.12, -h / 2 + 2, w - 0.24, 0.6, col2, 0.2, null);
    box(c, -w / 2 + 0.5, -h / 2 + 0.7, w - 1, 1.1, '#fff', 0.3, '#c9c9d6');
  }, { bounce: 0.5, icon: '🛏️' });
  bed('bedPink', 'Pink Bed', '#ff9cc7', '#ffd0e6'); bed('bedPurple', 'Purple Bed', '#b58cff', '#dccbff');
  bed('bedBlue', 'Blue Bed', '#7fb5ff', '#cfe3ff'); bed('bedGreen', 'Green Bed', '#7fdc9a', '#cff5d8');
  def('bunk', 'Bunk Bed', 'furniture', 4.2, 6.8, (c, w, h) => {
    box(c, -w / 2, -h / 2, w - 0.7, h, '#d9b48a', 0.2); box(c, -w / 2 + 0.2, -h / 2 + 0.2, w - 1.1, h - 0.4, '#fff', 0.25);
    box(c, -w / 2 + 0.3, -h / 2 + 2, w - 1.3, h - 2.3, '#ffb347', 0.25); box(c, -w / 2 + 0.6, -h / 2 + 0.6, w - 1.9, 1.1, '#fff', 0.3, '#c9c9d6');
    for (let i = 0; i < 5; i++) box(c, w / 2 - 0.7, -h / 2 + 1.2 + i * 1, 0.7, 0.2, '#b98a5e', 0.05);
    line(c, [w / 2 - 0.7, -h / 2 + 1, w / 2 - 0.7, h / 2 - 0.6], '#8a5a3c', 0.1); line(c, [w / 2, -h / 2 + 1, w / 2, h / 2 - 0.6], '#8a5a3c', 0.1);
    emoji(c, '⭐', -0.4, 1.4, 0.9);
  }, { bounce: 0.7, icon: '🛏️' });
  def('bigbed', 'Big Bed', 'furniture', 5.6, 7, (c, w, h) => {
    box(c, -w / 2, -h / 2, w, h, '#fff', 0.3); box(c, -w / 2, -h / 2, w, 0.6, '#8f96a3', 0.15);
    box(c, -w / 2 + 0.12, -h / 2 + 2.2, w - 0.24, h - 2.35, '#f4f4f6', 0.3); line(c, [-w / 2 + 0.3, -h / 2 + 2.9, w / 2 - 0.3, -h / 2 + 2.9], '#d5d5de', 0.06);
    box(c, -w / 2 + 0.4, -h / 2 + 0.8, 2.2, 1.2, '#fff', 0.3, '#c9c9d6'); box(c, w / 2 - 2.6, -h / 2 + 0.8, 2.2, 1.2, '#fff', 0.3, '#c9c9d6');
    box(c, -0.8, -h / 2 + 1.3, 1.6, 0.9, '#2f4a6b', 0.25);
  }, { bounce: 0.6, icon: '🛌' });
  def('dresser', 'Dresser', 'furniture', 3.6, 1.7, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#fbfaf7', 0.12); for (let i = 0; i < 3; i++) { box(c, -w / 2 + 0.15 + i * (w - 0.3) / 3, h / 2 - 0.5, (w - 0.3) / 3 - 0.1, 0.38, '#f0ede6', 0.06, '#c9c5ba'); circ(c, -w / 2 + 0.15 + (i + 0.5) * (w - 0.3) / 3 - 0.05, h / 2 - 0.3, 0.07, '#d9a441', null); } emoji(c, '🧸', -0.8, -0.2, 0.7); emoji(c, '🖼️', 0.8, -0.2, 0.7); }, { icon: '🗄️' });
  def('nightstand', 'Night Table', 'furniture', 1.6, 1.6, (c, w, h, t, it) => { box(c, -w / 2, -h / 2, w, h, '#fbfaf7', 0.12); if (it && it.on) circ(c, 0, 0, 1.5, 'rgba(255,236,150,.25)', null); circ(c, 0, 0, 0.5, it && it.on ? '#ffe98a' : '#f3e7c9'); circ(c, 0, 0, 0.14, '#d9a441', null); }, { tap: 'lamp', icon: '💡' });
  def('desk', 'Desk', 'furniture', 3.8, 3, (c, w, h) => { box(c, -w / 2, -h / 2, w, 1.9, '#e6c9a0', 0.12); emoji(c, '📒', -0.9, -0.55, 0.75); emoji(c, '🖍️', 0.2, -0.5, 0.65); emoji(c, '✏️', 1.1, -0.5, 0.6); circ(c, 0, 0.95, 0.6, '#ff9cc7'); }, { icon: '🪑' });
  def('bookshelf', 'Bookshelf', 'furniture', 3.6, 1.3, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#e6c9a0', 0.1); const cols = ['#ff6f6f', '#ffb347', '#ffe066', '#6fd97b', '#6fa8ff', '#b58cff', '#ff9cc7', '#37c9d6', '#ff6f6f', '#6fd97b']; cols.forEach((col, i) => box(c, -w / 2 + 0.2 + i * 0.32, -h / 2 + 0.18, 0.26, h - 0.36, col, 0.04)); }, { tap: 'book', icon: '📚' });
  def('toychest', 'Toy Chest', 'furniture', 2.8, 1.7, (c, w, h, t, it) => { box(c, -w / 2, -h / 2, w, h, '#ffb347', 0.2); box(c, -w / 2 + 0.2, -h / 2 + 0.2, w - 0.4, h - 0.4, it && it.on ? '#7a4a1e' : '#ffcc80', 0.15); if (it && it.on) { emoji(c, '🧸', -0.7, 0, 0.8); emoji(c, '🪀', 0, 0.05, 0.7); emoji(c, '🦖', 0.7, 0, 0.8); } else emoji(c, '⭐', 0, 0, 0.8); }, { tap: 'chest', icon: '🧰' });
  def('sofa', 'Sofa', 'furniture', 6.8, 2.9, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#9aa0ab', 0.4); box(c, -w / 2 + 0.5, -h / 2 + 0.9, w - 1, h - 1.1, '#b4bac4', 0.3); line(c, [0, -h / 2 + 1, 0, h / 2 - 0.3], '#8a909c', 0.05); box(c, -w / 2 + 0.7, -h / 2 + 0.5, 1.2, 0.9, '#2f3d57', 0.25); box(c, w / 2 - 1.9, -h / 2 + 0.5, 1.2, 0.9, '#e8c9a8', 0.25); box(c, -0.6, -h / 2 + 0.5, 1.2, 0.9, '#fff', 0.25); }, { bounce: 0.35, icon: '🛋️' });
  def('armchair', 'Comfy Chair', 'furniture', 2.7, 2.6, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#f1ede4', 0.5); box(c, -w / 2 + 0.4, -h / 2 + 0.8, w - 0.8, h - 1, '#fff', 0.35, '#d5d0c4'); box(c, -0.5, -h / 2 + 0.5, 1, 0.7, '#e8c9a8', 0.2); }, { bounce: 0.3, icon: '💺' });
  def('coffee', 'Round Table', 'furniture', 3, 3, (c, w, h) => { circ(c, 0, 0, w / 2, 'rgba(200,235,250,.55)', '#2e2e36'); circ(c, 0, 0, w / 2 - 0.25, null, 'rgba(255,255,255,.8)'); emoji(c, '🕯️', -0.3, 0, 0.6); emoji(c, '📖', 0.45, 0.2, 0.6); }, { icon: '⭕' });
  def('dtable', 'Dinner Table', 'furniture', 5.4, 7, (c, w, h) => {
    for (const [x, y] of [[-2.1, -1.8], [-2.1, 0], [-2.1, 1.8], [2.1, -1.8], [2.1, 0], [2.1, 1.8]]) { box(c, x - 0.6, y - 0.6, 1.2, 1.2, '#f4ecdf', 0.35); box(c, x + (x < 0 ? -0.6 : 0.35), y - 0.6, 0.25, 1.2, '#b9763f', 0.1); }
    box(c, -1.6, -h / 2 + 0.3, 3.2, h - 0.6, '#3a2f2a', 0.15); box(c, -0.5, -h / 2 + 0.3, 1, h - 0.6, '#f1e7d6', 0.05, null); emoji(c, '💐', 0, 0, 0.9);
  }, { icon: '🍽️' });
  def('tv', 'TV', 'furniture', 4.4, 1.3, (c, w, h, t, it) => { box(c, -w / 2, -h / 2, w, h, '#e6c9a0', 0.1); box(c, -1.8, -0.35, 3.6, 0.5, it && it.on ? '#7fd0ff' : '#22242b', 0.08); if (it && it.on) emoji(c, '🎬', 0, -0.1, 0.5); }, { tap: 'tv', icon: '📺' });
  def('piano', 'Piano', 'furniture', 4.8, 2.1, (c, w, h, t, it) => {
    box(c, -w / 2, -h / 2, w, h, '#3a2a22', 0.12); box(c, -w / 2 + 0.2, 0.05, w - 0.4, 0.8, '#fff', 0.05);
    for (let i = 1; i < 14; i++) line(c, [-w / 2 + 0.2 + i * (w - 0.4) / 14, 0.05, -w / 2 + 0.2 + i * (w - 0.4) / 14, 0.85], '#999', 0.03);
    for (let i = 0; i < 13; i++) if (![2, 6, 9].includes(i)) box(c, -w / 2 + 0.2 + (i + 0.72) * (w - 0.4) / 14, 0.05, 0.19, 0.5, '#22242b', 0.02, null);
    if (it && it.on) emoji(c, '🎵', Math.sin(t * 5) * 1.2, -0.5 - Math.abs(Math.sin(t * 3)) * 0.5, 0.7);
  }, { tap: 'piano', icon: '🎹' });
  def('beanbag', 'Bean Bag', 'furniture', 2.3, 2.3, (c, w, h) => { circ(c, 0, 0, w / 2, '#ff8fb8'); oval(c, 0, -0.1, w * 0.3, w * 0.24, '#ffb3cf', null); }, { bounce: 0.3, icon: '🫘' });
  def('tent', 'Play Tent', 'furniture', 3.8, 3.8, (c, w, h) => {
    const cols = ['#ff8fb8', '#ffd93d', '#7fb5ff', '#7fdc9a', '#b58cff', '#ffb347'];
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, w / 2, i * TAU / 6 + 0.26, (i + 1) * TAU / 6 + 0.26); c.closePath(); c.fillStyle = cols[i]; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); }
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, w / 2, TAU / 4 - 0.35, TAU / 4 + 0.35); c.closePath(); c.fillStyle = '#4a3f63'; c.fill(); circ(c, 0, 0, 0.16, '#fff');
  }, { icon: '⛺', tap: 'tent' });
  def('playkitchen', 'Play Kitchen', 'furniture', 3.2, 1.5, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#ffc4e1', 0.15); circ(c, -0.9, 0, 0.32, '#3a3d46'); circ(c, -0.2, 0, 0.32, '#3a3d46'); box(c, 0.4, -0.4, 0.95, 0.8, '#c9ced6', 0.15); emoji(c, '🍳', -0.9, 0, 0.5); }, { tap: 'sizzle', icon: '🍳' });
  def('easel', 'Art Easel', 'furniture', 2, 2, (c, w, h) => { box(c, -w / 2 + 0.2, -h / 2 + 0.2, w - 0.4, h - 0.6, '#fff', 0.08); emoji(c, '🎨', 0, -0.1, 1.1); line(c, [-0.8, 0.8, 0.8, 0.8], '#b98a5e', 0.14); }, { tap: 'art', icon: '🎨' });
  def('dollhouse', 'Dollhouse', 'furniture', 2.6, 2.2, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#ffd0e6', 0.1); line(c, [0, -h / 2, 0, h / 2], OL, 0.05); line(c, [-w / 2, 0, w / 2, 0], OL, 0.05); emoji(c, '🛏️', -0.65, -0.55, 0.6); emoji(c, '🛁', 0.65, -0.55, 0.6); emoji(c, '🛋️', -0.65, 0.55, 0.6); emoji(c, '👧', 0.65, 0.55, 0.6); }, { icon: '🏠' });
  def('traintable', 'Train Table', 'furniture', 4.2, 2.8, (c, w, h, t) => { box(c, -w / 2, -h / 2, w, h, '#8fd16a', 0.2); c.strokeStyle = '#8a5a3c'; c.lineWidth = 0.2; c.beginPath(); c.ellipse(0, 0, w / 2 - 0.6, h / 2 - 0.5, 0, 0, TAU); c.stroke(); const a = t * 1.2; emoji(c, '🚂', Math.cos(a) * (w / 2 - 0.6), Math.sin(a) * (h / 2 - 0.5), 0.8); emoji(c, '🌲', 0, 0, 0.7); }, { tap: 'train', icon: '🚂' });
  def('fishtank', 'Fish Tank', 'furniture', 3, 1.5, (c, w, h, t) => { box(c, -w / 2, -h / 2, w, h, '#8fd8ff', 0.15); emoji(c, '🐠', Math.sin(t * 0.9) * 0.9, -0.15, 0.6); emoji(c, '🐟', Math.cos(t * 0.7) * 0.8, 0.3, 0.5); emoji(c, '🌿', -1.1, 0.3, 0.5); }, { tap: 'bubble', icon: '🐠' });
  def('trampoline', 'Trampoline', 'furniture', 4.2, 4.2, (c, w, h) => { circ(c, 0, 0, w / 2, '#4d8dff'); circ(c, 0, 0, w / 2 - 0.45, '#22242b'); for (let i = 0; i < 12; i++) line(c, [Math.cos(i * TAU / 12) * (w / 2 - 0.45), Math.sin(i * TAU / 12) * (w / 2 - 0.45), Math.cos(i * TAU / 12) * (w / 2 - 0.1), Math.sin(i * TAU / 12) * (w / 2 - 0.1)], '#fff', 0.05); }, { bounce: 1.3, icon: '🤸' });
  def('ballpit', 'Ball Pit', 'furniture', 4.4, 4.4, (c, w, h, t) => { box(c, -w / 2, -h / 2, w, h, '#7fb5ff', 0.8); const cols = ['#ff6f6f', '#ffd93d', '#6fd97b', '#b58cff', '#ff9cc7', '#ffb347']; for (let i = 0; i < 40; i++) circ(c, -w / 2 + 0.6 + ((i * 0.77) % (w - 1.2)), -h / 2 + 0.6 + ((i * 1.31) % (h - 1.2)), 0.28, cols[i % 6], 'rgba(0,0,0,.15)'); }, { bounce: 0.25, tap: 'pop', icon: '🔴' });
  def('slide', 'Slide', 'furniture', 2.4, 6.4, (c, w, h) => { box(c, -w / 2, -h / 2, w, 1.6, '#ffb347', 0.2); for (let i = 0; i < 3; i++) line(c, [-0.8, -h / 2 + 0.4 + i * 0.4, 0.8, -h / 2 + 0.4 + i * 0.4], '#c77a1e', 0.08); box(c, -0.8, -h / 2 + 1.6, 1.6, h - 1.9, '#ffd93d', 0.3); line(c, [-0.8, -h / 2 + 1.6, -0.8, h / 2 - 0.4], '#e0a800', 0.14); line(c, [0.8, -h / 2 + 1.6, 0.8, h / 2 - 0.4], '#e0a800', 0.14); }, { tap: 'slide', icon: '🛝' });
  def('sandbox', 'Sandbox', 'furniture', 4.2, 4.2, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#b98a5e', 0.2); box(c, -w / 2 + 0.3, -h / 2 + 0.3, w - 0.6, h - 0.6, '#f2dfa8', 0.15, '#d9c17d'); emoji(c, '🏰', -0.6, -0.5, 1); emoji(c, '🪣', 0.9, 0.7, 0.8); }, { tap: 'dig', icon: '🏖️' });
  def('rockinghorse', 'Rocking Unicorn', 'furniture', 2.2, 1.5, (c, w, h, t, it) => { c.save(); c.rotate(it && it.on ? Math.sin(t * 6) * 0.2 : 0); emoji(c, '🎠', 0, -0.3, 1.9); c.restore(); }, { tap: 'rock', icon: '🎠' });

  // ---------- rugs (flat: you walk over them) ----------
  const rug = (id, name, w, h, draw, extra) => def(id, name, 'rugs', w, h, draw, Object.assign({ flat: 1, icon: '🟪' }, extra));
  rug('rugGeo', 'Diamond Rug', 8, 5.6, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#f4f1ea', 0.1); c.save(); rr(c, -w / 2, -h / 2, w, h, 0.1); c.clip(); c.strokeStyle = '#2b2b33'; c.lineWidth = 0.16; for (let i = -6; i <= 6; i++) for (let j = -3; j <= 3; j++) { const x = i * 1.4 + (j % 2 ? 0.7 : 0), y = j * 1; c.beginPath(); c.moveTo(x, y - 0.5); c.lineTo(x + 0.7, y); c.lineTo(x, y + 0.5); c.lineTo(x - 0.7, y); c.closePath(); c.stroke(); } c.restore(); }, { icon: '🔷' });
  rug('rugBeige', 'Soft Beige Rug', 7, 9.4, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#e8dccb', 0.1, '#cdbfa9'); for (let i = 0; i < 9; i++) line(c, [-w / 2 + 0.4, -h / 2 + 0.6 + i * 1, w / 2 - 0.4, -h / 2 + 0.8 + i * 1], 'rgba(255,255,255,.5)', 0.08); });
  rug('rugGray', 'Stripy Gray Rug', 9, 6, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#c9ccd3', 0.1, '#a9adb8'); for (let i = 0; i < 14; i++) line(c, [-w / 2 + 0.3 + i * 0.62, -h / 2 + 0.2, -w / 2 + 0.3 + i * 0.62, h / 2 - 0.2], 'rgba(255,255,255,.55)', 0.1); });
  rug('rugRainbow', 'Rainbow Rug', 5, 5, (c, w, h) => { ['#ff6f6f', '#ffb347', '#ffe066', '#6fd97b', '#6fa8ff', '#b58cff'].forEach((col, i) => circ(c, 0, 0, w / 2 - i * 0.38, col, i ? null : OL)); circ(c, 0, 0, 0.2, '#fff', null); }, { icon: '🌈' });
  rug('rugStar', 'Star Rug', 5, 5, (c, w, h) => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? w * 0.22 : w / 2, a = i * TAU / 10 - TAU / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fillStyle = '#ffd93d'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.07; c.stroke(); }, { icon: '⭐' });
  rug('rugHeart', 'Heart Rug', 5, 4.6, (c, w, h) => { c.beginPath(); c.moveTo(0, h / 2); c.bezierCurveTo(-w * 0.75, 0, -w * 0.45, -h * 0.75, 0, -h * 0.22); c.bezierCurveTo(w * 0.45, -h * 0.75, w * 0.75, 0, 0, h / 2); c.fillStyle = '#ff7fae'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.07; c.stroke(); }, { icon: '💗' });
  rug('rugSpace', 'Space Rug', 5.6, 5.6, (c, w, h, t) => { circ(c, 0, 0, w / 2, '#2a2460'); emoji(c, '🪐', -0.9, -0.7, 1.2); emoji(c, '🌙', 1.1, 0.4, 0.9); emoji(c, '⭐', -0.6, 1.3, 0.6); emoji(c, '🚀', 0.9, -1.3, 0.8); emoji(c, '✨', -1.6, 0.4, 0.5); }, { icon: '🪐' });
  rug('rugRoad', 'Road Rug', 6.4, 4.4, (c, w, h) => { box(c, -w / 2, -h / 2, w, h, '#8fd16a', 0.15); c.strokeStyle = '#555a66'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(0, 0, w / 2 - 0.9, h / 2 - 0.8, 0, 0, TAU); c.stroke(); c.strokeStyle = '#ffe066'; c.lineWidth = 0.06; c.setLineDash([0.3, 0.3]); c.beginPath(); c.ellipse(0, 0, w / 2 - 0.9, h / 2 - 0.8, 0, 0, TAU); c.stroke(); c.setLineDash([]); emoji(c, '🏠', 0, 0, 0.9); emoji(c, '🚗', -w / 2 + 0.9, 0, 0.6); }, { icon: '🛣️' });
  rug('rugHop', 'Hopscotch Rug', 2.6, 7, (c, w, h) => { const cols = ['#ff9cc7', '#ffd93d', '#7fb5ff', '#7fdc9a', '#b58cff', '#ffb347', '#37c9d6']; for (let i = 0; i < 7; i++) { box(c, -w / 2, h / 2 - (i + 1) * 1, w, 1, cols[i], 0.1); A.text(c, String(i + 1), 0, h / 2 - (i + 0.5) * 1, 0.7, '#fff', 700); } }, { icon: '🔢', steps: 7 });

  // ---------- plants and lights ----------
  def('plant', 'Plant', 'plants', 1.5, 1.5, (c, w, h, t, it) => { circ(c, 0, 0.1, 0.5, '#c9703f'); emoji(c, '🪴', 0, -0.25 + (it && it.hop ? Math.sin(t * 20) * 0.05 : 0), 1.4); }, { icon: '🪴' });
  def('bigplant', 'Big Leafy Plant', 'plants', 2.2, 2.2, (c, w, h, t) => { circ(c, 0, 0, 0.55, '#d9c8a8'); for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * 1.05); oval(c, 0.75, 0, 0.6, 0.3, i % 2 ? '#4fb060' : '#66c773', '#2f8046'); c.restore(); } }, { icon: '🌿' });
  def('flowers', 'Flower Pot', 'plants', 1.4, 1.4, (c, w, h, t) => { circ(c, 0, 0.1, 0.45, '#7fb5ff'); emoji(c, '🌷', -0.25, -0.2, 0.7); emoji(c, '🌼', 0.25, -0.25, 0.7); }, { icon: '🌷' });
  def('lamp', 'Tall Lamp', 'plants', 1.4, 1.4, (c, w, h, t, it) => { if (it && it.on) circ(c, 0, 0, 2.4, 'rgba(255,236,150,.22)', null); circ(c, 0, 0, 0.55, it && it.on ? '#ffe98a' : '#f3e7c9'); circ(c, 0, 0, 0.15, '#d9a441', null); }, { tap: 'lamp', icon: '💡' });
  def('starlights', 'Twinkle Lights', 'plants', 5, 0.8, (c, w, h, t) => { line(c, [-w / 2, 0, w / 2, 0], '#6a6e7a', 0.05); const cols = ['#ff6f6f', '#ffd93d', '#6fd97b', '#6fa8ff', '#b58cff', '#ff9cc7', '#ffb347', '#37c9d6']; for (let i = 0; i < 8; i++) { const on = Math.sin(t * 4 + i * 1.7) > -0.3; c.globalAlpha = on ? 1 : 0.35; if (on) circ(c, -w / 2 + 0.35 + i * 0.61, 0.12, 0.34, 'rgba(255,255,255,.25)', null); circ(c, -w / 2 + 0.35 + i * 0.61, 0.12, 0.17, cols[i], null); c.globalAlpha = 1; } }, { flat: 1, icon: '✨' });
  def('nightlight', 'Moon Night Light', 'plants', 1.3, 1.3, (c, w, h, t) => { circ(c, 0, 0, 1.3 + Math.sin(t * 2) * 0.1, 'rgba(255,240,170,.25)', null); emoji(c, '🌙', 0, 0, 1.1); }, { icon: '🌙' });
  def('globe', 'Globe', 'plants', 1.4, 1.4, (c, w, h, t, it) => { c.save(); c.rotate(it && it.on ? t * 4 : 0); emoji(c, '🌍', 0, 0, 1.3); c.restore(); }, { tap: 'spin', icon: '🌍' });

  // ---------- toys ----------
  toy('teddy', 'Teddy Bear', '🧸'); toy('owltoy', 'Snowy Owl', '🦉', 1.3, { sfx: 'hoot' }); toy('unicorntoy', 'Unicorn', '🦄'); toy('panda', 'Panda', '🐼'); toy('bunnytoy', 'Bunny', '🐰');
  toy('dinotoy', 'Dinosaur', '🦖'); toy('robot', 'Robot', '🤖', 1.3, { sfx: 'boop' }); toy('rockettoy', 'Toy Rocket', '🚀', 1.3, { sfx: 'whoosh' }); toy('car', 'Toy Car', '🚗', 1.2, { sfx: 'honk' }); toy('train', 'Toy Train', '🚂');
  toy('ball', 'Ball', '⚽', 1.1, { sfx: 'boing', kick: 1 }); toy('balloon', 'Balloon', '🎈', 1.2, { sfx: 'squeak' }); toy('kite', 'Kite', '🪁'); toy('drum', 'Drum', '🥁', 1.4, { sfx: 'thump' }); toy('guitar', 'Guitar', '🎸', 1.4, { sfx: 'note' });
  toy('puzzle', 'Puzzle', '🧩', 1.1); toy('books', 'Stack of Books', '📚', 1.2); toy('crown', 'Crown', '👑', 1.1, { sfx: 'sparkle' }); toy('castle', 'Castle', '🏰', 1.8); toy('blocks', 'Blocks', '🧱', 1.3, { sfx: 'thump' });
  toy('box', 'Moving Box', '📦', 1.6, { box: 1 });

  // ---------- obstacle course pieces ----------
  // course.kind says how a piece is cleared: center (reach the middle), stay (stand there a moment),
  // points (touch every spot), ends (go in one end and out the other), cross (jump over the line).
  const piece = (id, name, w, h, draw, course, extra) => def(id, name, 'course', w, h, draw, Object.assign({ course, icon: '🏁' }, extra));
  const flagLine = (c, w, h, cols, word, wordCol) => {
    const n = 10, sw = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { c.fillStyle = cols[(i + j) % 2]; c.fillRect(-w / 2 + i * sw, -h / 2 + 0.2 + j * (h - 0.4) / 2, sw, (h - 0.4) / 2); }
    c.strokeStyle = OL; c.lineWidth = 0.06; c.strokeRect(-w / 2, -h / 2 + 0.2, w, h - 0.4);
    for (const s of [-1, 1]) { circ(c, s * (w / 2 + 0.05), 0, 0.26, '#fff'); emoji(c, word, s * (w / 2 + 0.05), -0.75, 0.9); }
  };
  piece('cStart', 'Start Flag', 4, 1.4, (c, w, h) => flagLine(c, w, h, ['#4cd97b', '#c9f5d6'], '🟢'), { kind: 'start' }, { flat: 1, icon: '🟢' });
  piece('cFinish', 'Finish Line', 4, 1.4, (c, w, h) => flagLine(c, w, h, ['#2b2b33', '#fff'], '🏁'), { kind: 'finish' }, { flat: 1, icon: '🏁' });
  piece('cCones', 'Zigzag Cones', 2.9, 6.4, (c, w, h, t, it) => {
    c.setLineDash([0.25, 0.25]); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 0.09; c.beginPath(); c.moveTo(0.95, -3); c.bezierCurveTo(1.6, -1.4, -1.6, -1, -0.95, 0); c.bezierCurveTo(-1.6, 1, 1.6, 1.4, 0.95, 3); c.stroke(); c.setLineDash([]);
    for (const y of [-2.1, 0, 2.1]) { oval(c, 0, y + 0.18, 0.42, 0.16, 'rgba(40,30,70,.18)', null); c.beginPath(); c.moveTo(-0.34, y + 0.2); c.lineTo(0, y - 0.55); c.lineTo(0.34, y + 0.2); c.closePath(); c.fillStyle = '#ff7a2f'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.05; c.stroke(); line(c, [-0.17, y - 0.12, 0.17, y - 0.12], '#fff', 0.09); }
  }, { kind: 'points', pts: [[0.95, -2.1], [-0.95, 0], [0.95, 2.1]], r: 0.8, bump: [[0, -2.1], [0, 0], [0, 2.1]] });
  piece('cHurdle', 'Hurdle', 3.8, 1.3, (c, w, h) => {
    for (const s of [-1, 1]) box(c, s * (w / 2 - 0.2) - 0.14, -0.5, 0.28, 1, '#fff', 0.08);
    box(c, -w / 2 + 0.2, -0.16, w - 0.4, 0.32, '#ff5d5d', 0.1); for (let i = 0; i < 4; i++) box(c, -w / 2 + 0.55 + i * 0.86, -0.16, 0.36, 0.32, '#fff', 0.02, null);
  }, { kind: 'cross', half: 1.7 });
  piece('cTunnel', 'Crawl Tunnel', 2.6, 6.2, (c, w, h, t, it) => {
    for (let i = 0; i < 7; i++) box(c, -w / 2, -h / 2 + i * (h / 7), w, h / 7, ['#4d8dff', '#37c9d6', '#4cd97b', '#ffd93d', '#ff9f43', '#ff6fb1', '#9b6bff'][i], 0.25);
    for (const s of [-1, 1]) oval(c, 0, s * (h / 2 - 0.1), w / 2 - 0.25, 0.3, '#2a2460', OL);
    if (it && it._bump) { const b = it._bump; circ(c, 0, G.clamp(b, -h / 2 + 0.8, h / 2 - 0.8), 0.9, 'rgba(255,255,255,.35)', null); emoji(c, '👀', 0, G.clamp(b, -h / 2 + 0.8, h / 2 - 0.8), 0.6); }
  }, { kind: 'ends', ends: [[0, -2.7], [0, 2.7]], r: 0.95, slow: 0.7, hide: 1 }, { over: 1 });
  piece('cBeam', 'Balance Beam', 1.4, 6.6, (c, w, h) => {
    for (const s of [-1, 1]) box(c, -0.6, s * (h / 2 - 0.5) - 0.2, 1.2, 0.4, '#8a5a3c', 0.08);
    box(c, -0.32, -h / 2, 0.64, h, '#e0a85e', 0.12); line(c, [0, -h / 2 + 0.3, 0, h / 2 - 0.3], '#c98a3c', 0.05);
  }, { kind: 'ends', ends: [[0, -2.9], [0, 2.9]], r: 0.7, slow: 0.6, strict: 0.62 });
  piece('cStones', 'Stepping Stones', 3, 6.6, (c, w, h) => {
    [[-0.6, -2.4], [0.6, -0.8], [-0.6, 0.8], [0.6, 2.4]].forEach(([x, y], i) => { oval(c, x, y + 0.1, 0.72, 0.6, 'rgba(40,30,70,.16)', null); oval(c, x, y, 0.7, 0.58, ['#9ad0ff', '#b9f0c8', '#ffe08a', '#ffc4e1'][i], OL); });
  }, { kind: 'points', pts: [[-0.6, -2.4], [0.6, -0.8], [-0.6, 0.8], [0.6, 2.4]], r: 0.72, hop: 1, safe: 1 });
  piece('cHoop', 'Hoop', 2.8, 2.8, (c, w, h, t) => { c.strokeStyle = OL; c.lineWidth = 0.34; c.beginPath(); c.arc(0, 0, 1.15, 0, TAU); c.stroke(); const cols = ['#ff6fb1', '#ffd93d', '#4cd97b', '#4d8dff']; for (let i = 0; i < 8; i++) { c.strokeStyle = cols[i % 4]; c.lineWidth = 0.22; c.beginPath(); c.arc(0, 0, 1.15, i * TAU / 8, (i + 1) * TAU / 8); c.stroke(); } emoji(c, '✨', 0, 0, 0.6 + 0.1 * Math.sin(t * 5)); }, { kind: 'center', r: 0.8 });
  piece('cTramp', 'Bouncer', 3.2, 3.2, (c, w, h) => { circ(c, 0, 0, w / 2, '#ff6fb1'); circ(c, 0, 0, w / 2 - 0.42, '#2a2460'); emoji(c, '⭐', 0, 0, 1); }, { kind: 'center', r: 1 }, { bounce: 1.1 });
  piece('cPillows', 'Pillow Mountain', 3.8, 3.2, (c, w, h) => {
    [[-0.9, 0.5, '#ffc4e1', -0.2], [0.9, 0.55, '#b9e3ff', 0.25], [0, -0.5, '#fff3b0', 0.05], [-0.2, 0.2, '#d6c5ff', -0.1], [0.4, -0.1, '#c9f5d6', 0.3]].forEach(([x, y, col, a]) => { c.save(); c.translate(x, y); c.rotate(a); box(c, -0.95, -0.6, 1.9, 1.2, col, 0.4); line(c, [-0.5, 0, 0.5, 0], 'rgba(0,0,0,.08)', 0.05); c.restore(); });
  }, { kind: 'center', r: 0.9, slow: 0.45 }, { bounce: 0.25 });
  piece('cSpin', 'Spinner', 2.4, 2.4, (c, w, h, t, it) => { c.save(); c.rotate(it && it.on ? t * 9 : t * 0.6); for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, w / 2, i * TAU / 6, (i + 1) * TAU / 6); c.closePath(); c.fillStyle = i % 2 ? '#9b6bff' : '#ffd93d'; c.fill(); } c.restore(); circ(c, 0, 0, w / 2, null, OL); circ(c, 0, 0, 0.2, '#fff'); }, { kind: 'stay', r: 0.75, secs: 1.1 }, { flat: 1 });
  piece('cLava', 'Lava Floor', 5, 4, (c, w, h, t) => {
    box(c, -w / 2, -h / 2, w, h, '#ff5a1f', 0.6, '#b3270a'); c.save(); rr(c, -w / 2, -h / 2, w, h, 0.6); c.clip();
    for (let i = 0; i < 9; i++) { const x = -w / 2 + ((i * 0.83 + 0.3) % 1) * w, y = -h / 2 + ((i * 0.57 + 0.2) % 1) * h, r = 0.35 + 0.18 * Math.sin(t * 2.5 + i * 1.7); oval(c, x, y, r * 1.5, r, '#ffb300', null); oval(c, x, y, r * 0.8, r * 0.5, '#fff06a', null); }
    c.restore();
  }, { kind: 'lava' }, { flat: 1, icon: '🌋' });

  G.ITEMS = I;
  G.CATS = [['course', '🏁', 'Obstacle course'], ['furniture', '🛏️', 'Furniture'], ['toys', '🧸', 'Toys'], ['rugs', '🌈', 'Rugs'], ['plants', '🪴', 'Plants and lights'], ['paint', '🎨', 'Paint']];
  G.COURSE_ITEMS = ['cStart', 'cCones', 'cHurdle', 'cTunnel', 'cBeam', 'cStones', 'cHoop', 'cTramp', 'cPillows', 'cSpin', 'cLava', 'cFinish'];
  // what the house has on day one, and what comes later in packages (two at a time, in this order)
  G.START_ITEMS = ['bedPink', 'bedPurple', 'bedBlue', 'bedGreen', 'bigbed', 'dresser', 'nightstand', 'desk', 'bookshelf', 'toychest', 'sofa', 'armchair', 'coffee', 'dtable', 'piano', 'beanbag', 'slide', 'sandbox',
    'rugGeo', 'rugBeige', 'rugGray', 'rugRainbow', 'rugStar', 'plant', 'flowers', 'lamp', 'teddy', 'ball', 'blocks', 'books', 'box'];
  G.PACKAGE_ITEMS = ['tent', 'unicorntoy', 'bunk', 'owltoy', 'trampoline', 'starlights', 'fishtank', 'panda', 'dollhouse', 'rugHeart', 'playkitchen', 'bunnytoy', 'ballpit', 'rugSpace', 'easel', 'dinotoy',
    'traintable', 'rugRoad', 'rockinghorse', 'nightlight', 'rugHop', 'robot', 'tv', 'rockettoy', 'globe', 'drum', 'bigplant', 'guitar', 'castle', 'car', 'kite', 'train', 'balloon', 'crown', 'puzzle'];
  G.hasItem = id => G.START_ITEMS.includes(id) || G.COURSE_ITEMS.includes(id) || G.save.house.unlocked.includes(id);
  G.itemsIn = roomId => {
    const h = G.save.house;
    if (!h.items[roomId]) h.items[roomId] = (G.MAP.defaults[roomId] || []).map(d => ({ t: d[0], x: d[1], y: d[2], r: d[3] || 0 }));
    return h.items[roomId];
  };
  // footprint of a placed item, as [x1, y1, x2, y2]
  G.itemRect = it => { const d = I[it.t]; if (!d) return [it.x, it.y, it.x, it.y]; const w = it.r % 2 ? d.h : d.w, h = it.r % 2 ? d.w : d.h; return [it.x - w / 2, it.y - h / 2, it.x + w / 2, it.y + h / 2]; };
  A.item = (c, it, t) => { const d = I[it.t]; if (!d) return; c.save(); c.translate(it.x, it.y); c.rotate((it.r || 0) * Math.PI / 2); d.draw(c, d.w, d.h, t, it); c.restore(); };
  // a small picture of an item, for the catalogue
  const thumbs = {};
  G.itemThumb = id => {
    if (thumbs[id]) return thumbs[id];
    const d = I[id], cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d'), s = 108 / Math.max(d.w, d.h, 1.6);
    c.translate(64, 64); c.scale(s, s); d.draw(c, d.w, d.h, 0.6, null);
    return thumbs[id] = cv.toDataURL();
  };
})();
