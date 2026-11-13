// The family, drawn as cartoons (the faces come from Rocket Builders), and the costumes.
(() => {
  const A = G.ART, OL = A.OL, TAU = Math.PI * 2;
  const { circ, oval, box, line, emoji } = A;

  // ---------- faces: 100 x 100 SVG heads, no shoulders ----------
  const S = 'stroke="#2d2250" stroke-width="2"';
  const eyes = (y, dx, rx, ry, col) => [50 - dx, 50 + dx].map(x => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}"/><circle cx="${x + rx * 0.35}" cy="${y - ry * 0.4}" r="${rx * 0.35}" fill="#fff"/>`).join('');
  const cheeks = y => `<ellipse cx="33" cy="${y}" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/><ellipse cx="67" cy="${y}" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/>`;
  const brows = (y, col, w) => `<path d="M${36 - w} ${y + 1} Q40 ${y - 3} 44 ${y}" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M56 ${y} Q60 ${y - 3} ${64 + w} ${y + 1}" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const head = (skin, rx = 25, ry = 28, cy = 50, ears = true) => (ears ? `<ellipse cx="25" cy="${cy + 2}" rx="5" ry="7" fill="${skin}" ${S}/><ellipse cx="75" cy="${cy + 2}" rx="5" ry="7" fill="${skin}" ${S}/>` : '') + `<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}" ${S}/>`;
  const nose = y => `<path d="M50 ${y - 5} Q47 ${y + 1} 50 ${y + 2}" stroke="#c98a6b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const smile = y => `<path d="M40 ${y} Q50 ${y + 11} 60 ${y} Z" fill="#7a2a3a" ${S} stroke-linejoin="round"/><path d="M42 ${y + 0.5} L58 ${y + 0.5} L57 ${y + 3} L43 ${y + 3} Z" fill="#fff"/>`;
  const svg = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`);
  const mamaSkin = '#f2cfae', babaSkin = '#f4d1bb', miraSkin = '#fbe0cc', maiaSkin = '#f2d0b0';
  const FACES = {
    mama: svg(`<path d="M22 46 Q18 12 50 12 Q82 12 78 46 L84 100 L16 100 Z" fill="#17121a" ${S}/><rect x="44" y="72" width="12" height="12" fill="${mamaSkin}"/>` + head(mamaSkin, 24, 27, 50, false) +
      `<path d="M25 52 Q24 18 50 17 Q77 18 75 50 Q72 30 56 25 Q46 32 25 52 Z" fill="#17121a" ${S} stroke-linejoin="round"/><path d="M26 44 Q22 60 25 76 L20 76 Q16 56 22 42 Z M75 42 Q79 60 76 76 L81 76 Q85 56 78 40 Z" fill="#17121a"/>` +
      brows(42, '#17121a', 0) + eyes(50, 10, 3.6, 2.8, '#2a1a14') + cheeks(60) + nose(57) + smile(64)),
    baba: svg(head(babaSkin, 25, 30, 48) + `<path d="M25 46 Q25 30 30 26 L32 44 Z M75 46 Q75 30 70 26 L68 44 Z" fill="#5a3d2b"/><path d="M38 24 Q46 21 52 23" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>` +
      `<path d="M26 52 Q27 80 50 80 Q73 80 74 52 Q70 66 60 66 Q50 63 40 66 Q30 66 26 52 Z" fill="#8a5a3c" ${S} stroke-linejoin="round"/><path d="M40 63 Q50 58 60 63" stroke="#8a5a3c" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      brows(39, '#4a3020', 1) + eyes(46, 10, 3.2, 2.6, '#4a5a6a') + nose(55) + smile(64)),
    mira: svg(`<path d="M22 50 Q18 14 50 14 Q82 14 78 50 L80 86 L20 86 Z" fill="#a8804f" ${S}/>` + head(miraSkin, 23, 26, 52, false) +
      `<path d="M27 48 Q28 22 46 20 Q72 18 74 46 Q64 30 52 30 Q44 38 27 48 Z" fill="#a8804f" ${S}/>` + brows(44, '#8a6638', -1) + eyes(52, 10, 3.6, 3.6, '#5a3a22') + cheeks(61) + nose(58) + smile(65)),
    maia: svg(`<path d="M24 34 Q8 30 10 50 Q12 60 20 54 Q18 44 24 40 Z M76 34 Q92 30 90 50 Q88 60 80 54 Q82 44 76 40 Z" fill="#3a2518" ${S}/><circle cx="24" cy="36" r="3.5" fill="#4cd97b" ${S}/><circle cx="76" cy="36" r="3.5" fill="#4cd97b" ${S}/>` + head(maiaSkin, 24, 26, 56) +
      `<path d="M26 54 Q24 26 50 25 Q76 26 74 54 Q70 38 60 36 Q56 42 50 38 Q44 43 38 37 Q30 40 26 54 Z" fill="#3a2518" ${S} stroke-linejoin="round"/>` + brows(47, '#3a2518', -1) + eyes(56, 10, 4.2, 4.4, '#22140e') + cheeks(65) + nose(63) +
      `<path d="M45 70 Q50 74 55 70" stroke="#a03a4a" stroke-width="2.4" fill="#d9707f" stroke-linecap="round"/>`),
  };
  G.FACES = FACES;
  const faceImg = {};
  for (const k in FACES) { const im = new Image(); im.src = FACES[k]; faceImg[k] = im; }
  const SKIN = { mama: mamaSkin, baba: babaSkin, mira: miraSkin, maia: maiaSkin };

  // ---------- costumes ----------
  // body: main colour; belly: tummy patch; the rest switch on ears, tails, hats and so on
  G.COSTUMES = [
    { id: 'me', name: 'Just Me', icon: '👧', say: 'You are you!' },
    { id: 'princess', name: 'Princess', icon: '👑', body: '#c58bff', dress: 1, tiara: 1, sparkle: 1, held: '🪄', say: 'You are a princess!' },
    { id: 'hero', name: 'Super Hero', icon: '🦸', body: '#e23b4a', cape: '#3a66e0', mask: '#3a66e0', emblem: '⭐', say: 'You are a super hero!' },
    { id: 'unicorn', name: 'Unicorn', icon: '🦄', body: '#ffffff', belly: '#ffe3f3', ears: 'cat', earIn: '#ffc4e1', horn: 1, tail: 'rainbow', say: 'You are a unicorn!' },
    { id: 'puppy', name: 'Puppy', icon: '🐶', body: '#6fa8dc', belly: '#fff3d6', ears: 'dog', earCol: '#3d6fa3', tail: 'dog', say: 'You are a puppy!' },
    { id: 'kitty', name: 'Kitty', icon: '🐱', body: '#ffb86b', belly: '#fff3d6', ears: 'cat', earIn: '#ff9ab5', tail: 'cat', say: 'You are a kitty!' },
    { id: 'owl', name: 'Snowy Owl', icon: '🦉', body: '#ffffff', belly: '#f1f3f8', ears: 'tuft', wings: 'owl', speckle: 1, say: 'You are a snowy owl!' },
    { id: 'tiger', name: 'Tiger', icon: '🐯', body: '#ff9f43', belly: '#fff3d6', ears: 'round', earIn: '#fff3d6', tail: 'cat', stripes: 1, say: 'You are a tiger!' },
    { id: 'monkey', name: 'Monkey', icon: '🐵', body: '#a8703f', belly: '#f1cfa0', ears: 'round', earIn: '#f1cfa0', tail: 'curl', say: 'You are a monkey!' },
    { id: 'bunny', name: 'Bunny', icon: '🐰', body: '#fdf3f7', belly: '#ffd9e8', ears: 'bunny', earIn: '#ffc4e1', tail: 'puff', say: 'You are a bunny!' },
    { id: 'dino', name: 'Dinosaur', icon: '🦖', body: '#58c26b', belly: '#d7f5b0', spikes: '#2f9a4a', tail: 'dino', say: 'You are a dinosaur!' },
    { id: 'popstar', name: 'Pop Star', icon: '🎤', body: '#2b2640', dress: 1, sparkle: 1, bow: '#ff4f9a', held: '🎤', say: 'You are a pop star!' },
    { id: 'astronaut', name: 'Astronaut', icon: '🧑‍🚀', body: '#f4f6fb', helmet: 1, pack: 1, emblem: '🚀', say: 'You are an astronaut!' },
    { id: 'robot', name: 'Robot', icon: '🤖', body: '#c9d1f5', antenna: 1, panel: 1, say: 'You are a robot! Beep boop!' },
    { id: 'detective', name: 'Detective', icon: '🕵️', body: '#b98a5e', hat: '#7a5230', held: '🔍', say: 'You are a detective!' },
    { id: 'fairy', name: 'Fairy', icon: '🧚', body: '#7fe0c0', dress: 1, wings: 'fairy', crown: '🌸', held: '🪄', say: 'You are a fairy!' },
    { id: 'mermaid', name: 'Mermaid', icon: '🧜', body: '#37c9d6', fin: '#2a9aa8', crown: '🐚', say: 'You are a mermaid!' },
    { id: 'chef', name: 'Chef', icon: '🧑‍🍳', body: '#ffffff', chefhat: 1, held: '🥄', say: 'You are a chef!' },
  ];
  G.costume = id => G.COSTUMES.find(c => c.id === id) || G.COSTUMES[0];
  const SHIRT = { mira: '#b58cff', maia: '#ff9cc7' };

  // ---------- one kid ----------
  // o: { who, costume, t, moving, face (1 right, -1 left), bounce, hold (emoji carried overhead), alpha }
  A.kid = (c, o) => {
    const cos = G.costume(o.costume), t = o.t || 0, mv = o.moving ? 1 : 0;
    const bob = mv ? Math.abs(Math.sin(t * 11)) * 0.1 : Math.sin(t * 2.2) * 0.02;
    const hop = o.bounce || 0, dir = o.face || 1;
    const body = cos.body || SHIRT[o.who] || '#b58cff', dark = 'rgba(40,30,70,.25)';
    oval(c, 0, 0, 0.62 - hop * 0.1, 0.2, 'rgba(40,30,70,.22)', null);
    c.save(); c.translate(0, -bob - hop);
    // behind the body
    c.save(); c.scale(dir, 1);
    if (cos.cape) { c.beginPath(); c.moveTo(-0.42, -1.5); c.lineTo(0.42, -1.5); c.lineTo(0.75 + Math.sin(t * 6) * 0.08 * (1 + mv), -0.3); c.lineTo(-0.85 - mv * 0.25 + Math.sin(t * 6 + 1) * 0.08, -0.25); c.closePath(); c.fillStyle = cos.cape; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); }
    if (cos.wings === 'fairy') { const f = 0.25 * Math.sin(t * 14); c.globalAlpha = 0.75; oval(c, -0.75, -1.45, 0.5, 0.3 + f * 0.1, '#c9f3ff', '#7fc4ea', -0.5 + f); oval(c, 0.75, -1.45, 0.5, 0.3 + f * 0.1, '#c9f3ff', '#7fc4ea', 0.5 - f); oval(c, -0.6, -0.95, 0.34, 0.2, '#ffd9f3', '#e79ad0', 0.4 + f); oval(c, 0.6, -0.95, 0.34, 0.2, '#ffd9f3', '#e79ad0', -0.4 - f); c.globalAlpha = 1; }
    if (cos.pack) box(c, -0.5, -1.5, 1, 0.95, '#aab3c9', 0.15);
    const tw = Math.sin(t * (mv ? 14 : 4)) * 0.15;
    if (cos.tail === 'cat') { c.beginPath(); c.moveTo(-0.4, -0.55); c.bezierCurveTo(-1.0, -0.5, -1.1 + tw, -1.1, -0.85 + tw, -1.4); c.strokeStyle = OL; c.lineWidth = 0.26; c.lineCap = 'round'; c.stroke(); c.strokeStyle = cos.body; c.lineWidth = 0.16; c.stroke(); }
    if (cos.tail === 'curl') { c.beginPath(); c.moveTo(-0.4, -0.55); c.bezierCurveTo(-1.1, -0.4, -1.2, -1.2 + tw, -0.8, -1.15 + tw); c.strokeStyle = OL; c.lineWidth = 0.22; c.lineCap = 'round'; c.stroke(); c.strokeStyle = cos.body; c.lineWidth = 0.13; c.stroke(); }
    if (cos.tail === 'dog') oval(c, -0.62, -0.75 + tw * 0.6, 0.3, 0.13, cos.earCol || cos.body, OL, -0.7 + tw * 2);
    if (cos.tail === 'puff') circ(c, -0.55, -0.6, 0.2, '#fff');
    if (cos.tail === 'rainbow') ['#ff6f6f', '#ffb347', '#ffe066', '#6fd97b', '#6fa8ff', '#b58cff'].forEach((col, i) => { c.beginPath(); c.moveTo(-0.4, -0.7); c.quadraticCurveTo(-0.9 - i * 0.03, -0.9 + i * 0.09 + tw, -1.0 + tw * 0.4, -0.25 + i * 0.03); c.strokeStyle = col; c.lineWidth = 0.09; c.lineCap = 'round'; c.stroke(); });
    if (cos.tail === 'dino') { c.beginPath(); c.moveTo(-0.3, -0.9); c.lineTo(-1.15, -0.2 + tw * 0.5); c.lineTo(-0.3, -0.35); c.closePath(); c.fillStyle = cos.body; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); }
    c.restore();
    // legs (or a mermaid's tail)
    const swing = mv ? Math.sin(t * 11) * 0.16 : 0;
    if (cos.fin) { c.beginPath(); c.moveTo(-0.42, -0.6); c.quadraticCurveTo(0, 0.1, 0.1 + swing, -0.02); c.lineTo(0.5 + swing, 0.12); c.lineTo(0.35 + swing, -0.3); c.quadraticCurveTo(0.45, -0.5, 0.42, -0.6); c.closePath(); c.fillStyle = cos.fin; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); }
    else { const leg = cos.body && !cos.dress ? cos.body : SKIN[o.who]; box(c, -0.36 + swing * 0.5, -0.5, 0.3, 0.5 - Math.max(0, swing) * 0.4, leg, 0.12); box(c, 0.06 - swing * 0.5, -0.5, 0.3, 0.5 + Math.min(0, swing) * 0.4, leg, 0.12); }
    // arms
    const arm = cos.wings === 'owl' ? '#fff' : (cos.body || SHIRT[o.who]);
    if (cos.wings === 'owl') { const fl = mv ? Math.sin(t * 11) * 0.3 : 0.05; oval(c, -0.68, -1.1, 0.26, 0.5, '#fff', OL, 0.5 + fl); oval(c, 0.68, -1.1, 0.26, 0.5, '#fff', OL, -0.5 - fl); }
    else if (o.hold) { oval(c, -0.55, -1.6, 0.16, 0.36, arm, OL, -0.5); oval(c, 0.55, -1.6, 0.16, 0.36, arm, OL, 0.5); }
    else { oval(c, -0.6, -1.05 + swing * 0.3, 0.16, 0.36, arm, OL, 0.35); oval(c, 0.6, -1.05 - swing * 0.3, 0.16, 0.36, arm, OL, -0.35); }
    // body
    c.beginPath();
    if (cos.dress || !cos.body) { c.moveTo(-0.4, -1.55); c.lineTo(0.4, -1.55); c.lineTo(0.72, -0.4); c.quadraticCurveTo(0, -0.22, -0.72, -0.4); c.closePath(); }
    else A.rr(c, -0.5, -1.55, 1, 1.2, 0.35);
    c.fillStyle = body; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.07; c.stroke();
    if (cos.belly) oval(c, 0, -0.9, 0.3, 0.38, cos.belly, null);
    if (cos.stripes) for (const y of [-1.25, -0.95, -0.65]) { line(c, [-0.5, y, -0.22, y + 0.06], '#3a2a1a', 0.08); line(c, [0.5, y, 0.22, y + 0.06], '#3a2a1a', 0.08); }
    if (cos.speckle) for (const [x, y] of [[-0.25, -1.2], [0.2, -1.1], [-0.05, -0.8], [0.28, -0.7], [-0.3, -0.6]]) oval(c, x, y, 0.07, 0.04, '#8b93a7', null);
    if (cos.sparkle) for (const [x, y, k] of [[-0.2, -1.1, 0], [0.25, -0.8, 1], [-0.1, -0.6, 2], [0.4, -0.5, 3], [-0.45, -0.55, 4]]) { c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5 + k * 2); circ(c, x, y, 0.06, '#fff8c0', null); c.globalAlpha = 1; }
    if (cos.panel) { box(c, -0.3, -1.2, 0.6, 0.5, '#1d2150', 0.08); circ(c, -0.12, -0.95, 0.07, '#6ff0ff', null); circ(c, 0.12, -0.95, 0.07, Math.sin(t * 4) > 0 ? '#ff4f9a' : '#ffe066', null); }
    if (cos.emblem) emoji(c, cos.emblem, 0, -0.95, 0.5);
    if (cos.spikes) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-0.5, -1.35 + i * 0.3); c.lineTo(-0.75, -1.25 + i * 0.3); c.lineTo(-0.5, -1.1 + i * 0.3); c.fillStyle = cos.spikes; c.fill(); }
    // head
    const hy = -2.2, hb = Math.sin(t * 2.2) * 0.015;
    c.save(); c.translate(0, hb);
    const er = cos.earCol || cos.body, ei = cos.earIn || '#ffc4e1';
    if (cos.ears === 'cat') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.28, -2.9); c.lineTo(s * 0.62, -3.42); c.lineTo(s * 0.78, -2.72); c.closePath(); c.fillStyle = er; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); c.beginPath(); c.moveTo(s * 0.42, -2.92); c.lineTo(s * 0.6, -3.2); c.lineTo(s * 0.68, -2.84); c.closePath(); c.fillStyle = ei; c.fill(); }
    if (cos.ears === 'bunny') for (const s of [-1, 1]) { oval(c, s * 0.34, -3.5, 0.17, 0.52, er, OL, s * 0.12); oval(c, s * 0.34, -3.5, 0.08, 0.36, ei, null, s * 0.12); }
    if (cos.ears === 'round') for (const s of [-1, 1]) { circ(c, s * 0.66, -2.98, 0.27, er); circ(c, s * 0.66, -2.98, 0.14, ei, null); }
    if (cos.ears === 'tuft') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.35, -2.95); c.lineTo(s * 0.8, -3.3); c.lineTo(s * 0.7, -2.8); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.06; c.stroke(); }
    if (cos.spikes) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-0.25 + i * 0.25, -3.05); c.lineTo(-0.12 + i * 0.25, -3.42 + Math.abs(i - 1) * 0.1); c.lineTo(0.02 + i * 0.25, -3.05); c.fillStyle = cos.spikes; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.05; c.stroke(); }
    const im = faceImg[o.who];
    if (im && im.complete && im.naturalWidth) c.drawImage(im, -1.3, hy - 1.35, 2.6, 2.6); else circ(c, 0, hy, 0.7, SKIN[o.who]);
    if (cos.ears === 'dog') for (const s of [-1, 1]) oval(c, s * 0.78, -2.35, 0.2, 0.45, er, OL, s * -0.25);
    if (cos.mask) { c.beginPath(); c.ellipse(-0.27, hy + 0.01, 0.22, 0.15, 0, 0, TAU); c.ellipse(0.27, hy + 0.01, 0.22, 0.15, 0, 0, TAU); c.rect(-0.1, hy - 0.05, 0.2, 0.1); c.moveTo(-0.17, hy); c.ellipse(-0.26, hy, 0.09, 0.08, 0, 0, TAU, true); c.moveTo(0.35, hy); c.ellipse(0.26, hy, 0.09, 0.08, 0, 0, TAU, true); c.fillStyle = cos.mask; c.fill('evenodd'); }
    if (cos.horn) { c.beginPath(); c.moveTo(-0.14, -3.02); c.lineTo(0, -3.75); c.lineTo(0.14, -3.02); c.closePath(); c.fillStyle = '#ffd93d'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.05; c.stroke(); line(c, [-0.1, -3.2, 0.08, -3.3], '#e0a800', 0.04); line(c, [-0.06, -3.42, 0.05, -3.5], '#e0a800', 0.04); }
    if (cos.tiara) { c.beginPath(); c.moveTo(-0.42, -2.98); c.lineTo(-0.4, -3.3); c.lineTo(-0.2, -3.1); c.lineTo(0, -3.45); c.lineTo(0.2, -3.1); c.lineTo(0.4, -3.3); c.lineTo(0.42, -2.98); c.closePath(); c.fillStyle = '#ffd93d'; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.05; c.stroke(); circ(c, 0, -3.14, 0.07, '#ff4f9a', null); }
    if (cos.bow) { oval(c, -0.2, -3.1, 0.22, 0.14, cos.bow, OL, 0.4); oval(c, 0.2, -3.1, 0.22, 0.14, cos.bow, OL, -0.4); circ(c, 0, -3.08, 0.08, cos.bow); }
    if (cos.crown) emoji(c, cos.crown, 0, -3.12, 0.5);
    if (cos.antenna) { line(c, [0, -3.05, 0, -3.5], '#8a93b8', 0.07); circ(c, 0, -3.55, 0.11, Math.sin(t * 5) > 0 ? '#ff4f9a' : '#ffe066'); line(c, [-0.6, -2.9, 0.6, -2.9], '#8a93b8', 0.1); }
    if (cos.hat) { oval(c, 0, -2.98, 0.85, 0.2, cos.hat); c.beginPath(); c.moveTo(-0.5, -3); c.quadraticCurveTo(-0.45, -3.6, 0, -3.6); c.quadraticCurveTo(0.45, -3.6, 0.5, -3); c.closePath(); c.fillStyle = cos.hat; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.05; c.stroke(); line(c, [-0.5, -3.08, 0.5, -3.08], '#3a2a1a', 0.09); }
    if (cos.chefhat) { box(c, -0.4, -3.35, 0.8, 0.4, '#fff', 0.05); circ(c, -0.3, -3.5, 0.26, '#fff'); circ(c, 0.3, -3.5, 0.26, '#fff'); circ(c, 0, -3.62, 0.3, '#fff'); c.fillStyle = '#fff'; c.fillRect(-0.34, -3.5, 0.68, 0.3); }
    if (cos.helmet) { circ(c, 0, hy - 0.05, 1.12, 'rgba(200,235,255,.1)', '#fff'); c.strokeStyle = '#aab3c9'; c.lineWidth = 0.1; c.beginPath(); c.arc(0, hy - 0.05, 1.12, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.07; c.beginPath(); c.arc(0, hy - 0.05, 0.95, 1.1 * Math.PI, 1.35 * Math.PI); c.stroke(); }
    c.restore();
    if (cos.held && !o.hold) emoji(c, cos.held, dir * 0.82, -1.0, 0.6);
    if (o.hold) emoji(c, o.hold, 0, -3.95 + Math.sin(t * 3) * 0.04, 1.0);
    c.restore();
  };

  // ---------- grown-ups ----------
  A.grownup = (c, o) => {
    const t = o.t || 0, who = o.who, b = Math.sin(t * 1.8 + (who === 'baba' ? 1 : 0)) * 0.03;
    oval(c, 0, 0, 0.75, 0.22, 'rgba(40,30,70,.22)', null);
    c.save(); c.translate(0, -b);
    const shirt = who === 'mama' ? '#e86a9a' : '#3d7fbf', pants = who === 'mama' ? '#3b3555' : '#4a4f63';
    box(c, -0.42, -1.5, 0.36, 1.5, pants, 0.14); box(c, 0.06, -1.5, 0.36, 1.5, pants, 0.14);
    const wave = o.wave ? Math.sin(t * 9) * 0.5 : 0;
    oval(c, -0.72, -2.25, 0.18, 0.55, shirt, OL, 0.2);
    if (o.wave) oval(c, 0.82, -3.0, 0.18, 0.5, shirt, OL, -0.7 + wave * 0.5); else oval(c, 0.72, -2.25, 0.18, 0.55, shirt, OL, -0.2);
    A.rr(c, -0.6, -3.05, 1.2, 1.7, 0.35); c.fillStyle = shirt; c.fill(); c.strokeStyle = OL; c.lineWidth = 0.07; c.stroke();
    if (who === 'baba' && o.apron) { box(c, -0.42, -2.6, 0.84, 1.3, '#fff', 0.1); }
    const im = faceImg[who];
    if (im && im.complete && im.naturalWidth) c.drawImage(im, -1.25, -4.95, 2.5, 2.5);
    if (o.mark) { const y = -5.3 + Math.sin(t * 5) * 0.12; circ(c, 0, y, 0.42, '#ffd93d'); A.text(c, o.mark, 0, y + 0.02, 0.62, '#4a3f63', 700); }
    c.restore();
  };

  // ---------- pets ----------
  G.PETS = [
    { id: 'puppy', icon: '🐶', name: 'puppy', sfx: 'woof' }, { id: 'kitten', icon: '🐱', name: 'kitten', sfx: 'meow' }, { id: 'bunny', icon: '🐰', name: 'bunny', sfx: 'squeak' },
    { id: 'owl', icon: '🦉', name: 'baby owl', sfx: 'hoot' }, { id: 'dragon', icon: '🐲', name: 'baby dragon', sfx: 'squeak' }, { id: 'unicorn', icon: '🦄', name: 'baby unicorn', sfx: 'sparkle' },
  ];
  A.pet = (c, o) => {
    const p = G.PETS.find(q => q.id === o.id) || G.PETS[0], t = o.t || 0;
    const hop = o.moving ? Math.abs(Math.sin(t * 12)) * 0.25 : Math.abs(Math.sin(t * 2)) * 0.04;
    oval(c, 0, 0, 0.42, 0.14, 'rgba(40,30,70,.22)', null);
    c.save(); c.scale(o.face || 1, 1); emoji(c, p.icon, 0, -0.62 - hop, 1.15); c.restore();
  };

  // a small picture of a kid in a costume, for buttons
  G.kidPicture = (who, costume, size = 120) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = size * 2;
    const c = cv.getContext('2d'); c.translate(size, size * 1.93); c.scale(size / 2.15, size / 2.15);
    const paint = () => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.restore(); A.kid(c, { who, costume, t: 0.4, face: 1 }); };
    paint();
    const im = faceImg[who]; if (im && !im.complete) im.addEventListener('load', paint);
    cv.style.width = cv.style.height = size + 'px';
    return cv;
  };
  G.facesReady = () => Promise.all(Object.values(faceImg).map(im => im.complete ? 1 : new Promise(r => { im.onload = im.onerror = r; })));
})();
