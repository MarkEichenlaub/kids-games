// Art: every rocket part is drawn as SVG so the rocket you build is the rocket you fly.
G.art = (function () {
  const A = {};
  let uid = 0;

  function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => Math.round(G.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
  A.shade = (hex, amt) => { const [r, g, b] = hexToRgb(hex); const t = amt < 0 ? 0 : 255, p = Math.abs(amt); return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p); };
  const pal = (main, accent) => ({ main, dark: A.shade(main, -0.35), light: A.shade(main, 0.45), accent: accent || '#ffffff', ink: '#2d2250' });
  const OUT = 'stroke="#2d2250" stroke-width="3" stroke-linejoin="round"';

  // ---------- noses (base width 100, bottom at y=h) ----------
  A.noses = {
    'nose-cone': { h: 70, d: c => `<path d="M0 70 C4 40 26 12 50 0 C74 12 96 40 100 70 Z" fill="${c.main}" ${OUT}/><path d="M44 8 C32 20 22 34 16 54" stroke="#fff" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/>` },
    'nose-needle': { h: 95, d: c => `<path d="M0 95 C10 60 38 22 46 8 L50 0 L54 8 C62 22 90 60 100 95 Z" fill="${c.accent === '#ffffff' ? '#dfe6f5' : c.accent}" ${OUT}/><rect x="0" y="80" width="100" height="15" fill="${c.main}" ${OUT}/><circle cx="50" cy="4" r="5" fill="#ff4f9a" ${OUT}/>` },
    'nose-bubble': { h: 55, d: c => `<path d="M0 55 A50 50 0 0 1 100 55 Z" fill="#bfeeff" fill-opacity=".85" ${OUT}/><path d="M22 34 Q34 16 52 12" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="68" cy="30" r="5" fill="#fff"/>` },
    'nose-star': { h: 95, d: c => `<path d="M0 95 C6 70 28 45 50 30 C72 45 94 70 100 95 Z" fill="${c.main}" ${OUT}/>${star(50, 18, 18, '#ffd93d')}` },
    'nose-unicorn': { h: 110, d: c => `<path d="M0 110 C4 80 26 58 50 48 C74 58 96 80 100 110 Z" fill="${c.main}" ${OUT}/><path d="M38 52 L50 0 L62 52 Z" fill="#fff4c9" ${OUT}/><path d="M41 42 L59 36 M43 30 L57 24 M46 18 L54 14" stroke="#ff6fb1" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="84" r="5" fill="#fff"/><circle cx="70" cy="84" r="5" fill="#fff"/>` },
    'nose-heart': { h: 80, d: c => `<path d="M0 80 C4 58 26 42 50 34 C74 42 96 58 100 80 Z" fill="${c.main}" ${OUT}/><path d="M50 32 C30 16 32 -2 44 2 C48 3 50 8 50 10 C50 8 52 3 56 2 C68 -2 70 16 50 32 Z" fill="#ff4f9a" ${OUT}/>` },
    'nose-crown': { h: 70, d: c => `<path d="M0 70 C4 52 26 40 50 36 C74 40 96 52 100 70 Z" fill="${c.main}" ${OUT}/><path d="M22 40 L18 8 L36 22 L50 0 L64 22 L82 8 L78 40 Z" fill="#ffd93d" ${OUT}/><circle cx="50" cy="26" r="6" fill="#ff4f9a"/><circle cx="32" cy="32" r="4" fill="#4d8dff"/><circle cx="68" cy="32" r="4" fill="#4cd97b"/>` },
    'nose-owl': { h: 85, d: c => `<path d="M0 85 C0 40 20 12 50 12 C80 12 100 40 100 85 Z" fill="#fbfbff" ${OUT}/><path d="M18 22 L10 0 L34 16 Z M82 22 L90 0 L66 16 Z" fill="#fbfbff" ${OUT}/><circle cx="34" cy="44" r="14" fill="#ffd93d" ${OUT}/><circle cx="66" cy="44" r="14" fill="#ffd93d" ${OUT}/><circle cx="34" cy="44" r="7" fill="#2d2250"/><circle cx="66" cy="44" r="7" fill="#2d2250"/><path d="M44 58 L50 70 L56 58 Z" fill="#ff9f43" ${OUT}/><g fill="#2d2250" opacity=".5"><circle cx="24" cy="70" r="2.5"/><circle cx="76" cy="72" r="2.5"/><circle cx="40" cy="78" r="2.5"/><circle cx="62" cy="80" r="2.5"/></g>` },
  };

  // ---------- capsules (100 x 64) ----------
  function porthole(cx, cy, r, crew) {
    const id = 'cl' + (++uid);
    let inner;
    if (crew && crew.img) inner = `<image href="${crew.img}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
    else inner = `<text x="${cx}" y="${cy + r * 0.38}" font-size="${r * 1.15}" text-anchor="middle">${(crew && crew.e) || '👧'}</text>`;
    return `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
      <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#c9d1f5" ${OUT}/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#bfeeff"/>${inner}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2d2250" stroke-width="2"/><path d="M${cx - r * 0.6} ${cy - r * 0.3} Q${cx - r * 0.4} ${cy - r * 0.7} ${cx} ${cy - r * 0.75}" stroke="#fff" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
  }
  A.capsules = {
    'cap-basic': { h: 64, d: (c, crew) => `<rect x="0" y="0" width="100" height="64" rx="6" fill="${c.light}" ${OUT}/>${porthole(50, 32, 18, crew[0])}` },
    'cap-big': { h: 74, d: (c, crew) => `<rect x="0" y="0" width="100" height="74" rx="6" fill="${c.light}" ${OUT}/>${porthole(50, 37, 26, crew[0])}` },
    'cap-double': { h: 64, d: (c, crew) => `<rect x="0" y="0" width="100" height="64" rx="6" fill="${c.light}" ${OUT}/>${porthole(28, 32, 14, crew[0])}${porthole(72, 32, 14, crew[1] || crew[0])}` },
    'cap-dome': { h: 70, d: (c, crew) => `<rect x="0" y="0" width="100" height="70" rx="10" fill="${c.dark}" ${OUT}/><rect x="10" y="8" width="80" height="54" rx="22" fill="#bfeeff" ${OUT}/><text x="50" y="50" font-size="40" text-anchor="middle">${crewEmoji(crew[0])}</text>${crew[0] && crew[0].img ? `<image href="${crew[0].img}" x="28" y="12" width="44" height="46" preserveAspectRatio="xMidYMid slice"/>` : ''}<path d="M18 22 Q24 12 40 12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    'cap-lights': { h: 64, d: (c, crew) => `<rect x="0" y="0" width="100" height="64" rx="6" fill="#1d2150" ${OUT}/>${lights(100, 64, 7)}${porthole(50, 32, 17, crew[0])}` },
  };
  function crewEmoji(cr) { return cr && !cr.img ? cr.e : (cr && cr.img ? '' : '👧'); }
  function lights(w, h, n) {
    const cols = ['#ff4f9a', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff', '#ff9f43'];
    let s = '';
    for (let i = 0; i < n * 2; i++) {
      const x = 8 + (i % n) * ((w - 16) / (n - 1)), y = i < n ? 7 : h - 7;
      s += `<circle cx="${x}" cy="${y}" r="4" fill="${cols[i % cols.length]}"><animate attributeName="opacity" values="1;.2;1" dur="${0.6 + (i % 4) * 0.3}s" repeatCount="indefinite"/></circle>`;
    }
    return s;
  }

  // ---------- bodies (100 x 90) ----------
  function star(cx, cy, r, fill) {
    let p = ''; for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; p += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1); }
    return `<path d="${p}Z" fill="${fill}" stroke="#2d2250" stroke-width="2" stroke-linejoin="round"/>`;
  }
  A.star = star;
  const BH = 90;
  const bodyBase = (c, inner) => { const id = 'bc' + (++uid); return `<defs><clipPath id="${id}"><rect x="0" y="0" width="100" height="${BH}"/></clipPath></defs><rect x="0" y="0" width="100" height="${BH}" fill="${c.main}"/><g clip-path="url(#${id})">${inner}</g><path d="M14 4 V${BH - 4}" stroke="#fff" stroke-opacity=".35" stroke-width="8" stroke-linecap="round"/><rect x="0" y="0" width="100" height="${BH}" fill="none" ${OUT}/>`; };
  A.bodies = {
    'body-plain': { d: c => bodyBase(c, `<rect x="0" y="36" width="100" height="18" fill="${c.accent}"/>`) },
    'body-stripes': { d: c => bodyBase(c, [0, 1, 2, 3].map(i => `<rect x="0" y="${8 + i * 22}" width="100" height="10" fill="${c.accent}"/>`).join('')) },
    'body-dots': { d: c => bodyBase(c, [[22, 20], [60, 14], [84, 40], [40, 46], [18, 72], [70, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c.accent}"/>`).join('')) },
    'body-stars': { d: c => bodyBase(c, star(30, 24, 13, '#ffd93d') + star(72, 50, 15, '#ffd93d') + star(32, 72, 10, '#ffd93d')) },
    'body-rainbow': { d: c => bodyBase(c, ['#ff5d5d', '#ff9f43', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff'].map((col, i) => `<rect x="0" y="${i * 15}" width="100" height="15" fill="${col}"/>`).join('')) },
    'body-checker': { d: c => bodyBase(c, Array.from({ length: 20 }, (_, i) => { const x = (i % 5) * 20, y = Math.floor(i / 5) * 22.5; return ((i % 5) + Math.floor(i / 5)) % 2 ? `<rect x="${x}" y="${y}" width="20" height="22.5" fill="${c.accent}"/>` : ''; }).join('')) },
    'body-zigzag': { d: c => bodyBase(c, `<path d="M0 30 L12.5 18 L25 30 L37.5 18 L50 30 L62.5 18 L75 30 L87.5 18 L100 30 V44 L87.5 32 L75 44 L62.5 32 L50 44 L37.5 32 L25 44 L12.5 32 L0 44 Z M0 62 L12.5 50 L25 62 L37.5 50 L50 62 L62.5 50 L75 62 L87.5 50 L100 62 V76 L87.5 64 L75 76 L62.5 64 L50 76 L37.5 64 L25 76 L12.5 64 L0 76 Z" fill="${c.accent}"/>`) },
    'body-hearts': { d: c => bodyBase(c, [[28, 22], [70, 40], [32, 66]].map(([x, y]) => `<path transform="translate(${x} ${y}) scale(1.2)" d="M0 8 C-12 0 -10 -10 -4 -10 C-1 -10 0 -7 0 -6 C0 -7 1 -10 4 -10 C10 -10 12 0 0 8 Z" fill="#ff4f9a" stroke="#2d2250" stroke-width="1.5"/>`).join('')) },
    'body-lights': { d: c => bodyBase({ ...c, main: '#1d2150' }, lights(100, BH, 7) + `<rect x="10" y="22" width="80" height="46" rx="6" fill="#2a2f6e"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${14 + (i % 6) * 12.5}" y="${28 + Math.floor(i / 6) * 20}" width="9" height="14" rx="2" fill="${['#ff4f9a', '#ffd93d', '#6ff0ff', '#4cd97b'][i % 4]}"><animate attributeName="opacity" values="1;.25;1" dur="${1 + (i % 3) * 0.4}s" begin="${i * 0.13}s" repeatCount="indefinite"/></rect>`).join('')) },
    'body-candy': { d: c => bodyBase({ ...c, main: '#ffffff' }, Array.from({ length: 8 }, (_, i) => `<path d="M${-40 + i * 24} ${BH} L${-10 + i * 24} 0 L${2 + i * 24} 0 L${-28 + i * 24} ${BH} Z" fill="#ff4f6d"/>`).join('')) },
    'body-windows': { d: c => bodyBase(c, [22, 50, 78].map(x => `<circle cx="${x}" cy="30" r="9" fill="#bfeeff" stroke="#2d2250" stroke-width="2"/><circle cx="${x}" cy="62" r="9" fill="#bfeeff" stroke="#2d2250" stroke-width="2"/>`).join('')) },
    'body-flag': { d: c => bodyBase({ ...c, main: '#f4f6ff' }, `<rect x="0" y="0" width="100" height="10" fill="${c.main}"/><rect x="0" y="80" width="100" height="10" fill="${c.main}"/><text x="50" y="58" font-size="30" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="${c.main}">${(G.kidName() || '').toUpperCase().slice(0, 5)}</text>`) },
  };

  // ---------- engines (width 100, drawn under the body) ----------
  const bell = (cx, w, h, fill) => `<path d="M${cx - w * 0.3} 0 L${cx + w * 0.3} 0 L${cx + w * 0.5} ${h} L${cx - w * 0.5} ${h} Z" fill="${fill}" ${OUT}/><path d="M${cx - w * 0.5 + 4} ${h - 8} H${cx + w * 0.5 - 4}" stroke="#2d2250" stroke-opacity=".3" stroke-width="3"/>`;
  A.engines = {
    'eng-1': { h: 40, tier: 1, d: c => `<rect x="25" y="-2" width="50" height="10" fill="#8a93b8" ${OUT}/>` + `<g transform="translate(0 8)">${bell(50, 46, 32, '#a8b0cf')}</g>` },
    'eng-2': { h: 44, tier: 2, d: c => `<rect x="10" y="-2" width="80" height="10" fill="#8a93b8" ${OUT}/><g transform="translate(0 8)">${bell(30, 38, 36, '#a8b0cf')}${bell(70, 38, 36, '#a8b0cf')}</g>` },
    'eng-3': { h: 48, tier: 3, d: c => `<rect x="4" y="-2" width="92" height="10" fill="#6e7699" ${OUT}/><g transform="translate(0 8)">${bell(20, 30, 34, '#c0c6de')}${bell(80, 30, 34, '#c0c6de')}${bell(50, 40, 40, '#ffd93d')}</g>` },
    'eng-4': { h: 54, tier: 4, d: c => `<rect x="0" y="-2" width="100" height="12" rx="4" fill="#9b6bff" ${OUT}/><g transform="translate(0 10)"><path d="M20 0 H80 L98 44 H2 Z" fill="#6ff0ff" ${OUT}/><path d="M26 10 H74 M18 22 H82 M10 34 H90" stroke="#fff" stroke-width="4" opacity=".7"/></g><circle cx="50" cy="4" r="4" fill="#fff"><animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite"/></circle>` },
  };

  // ---------- fins: drawn for the left side, origin at body bottom-left, extending left ----------
  A.fins = {
    'fins-tri': { d: c => `<path d="M2 -64 L-40 8 L-40 18 L2 0 Z" fill="${c.dark}" ${OUT}/>` },
    'fins-swept': { d: c => `<path d="M2 -80 C-16 -50 -36 -20 -46 22 L-24 14 L2 0 Z" fill="${c.dark}" ${OUT}/>` },
    'fins-round': { d: c => `<path d="M2 -70 C-44 -60 -52 0 -30 20 C-20 10 -8 4 2 0 Z" fill="${c.dark}" ${OUT}/>` },
    'fins-star': { d: c => `<path d="M2 -50 L-30 0 L2 0 Z" fill="${c.dark}" ${OUT}/>` + star(-30, 2, 16, '#ffd93d') },
    'fins-wing': { d: c => `<path d="M2 -110 L-12 -60 L-66 -6 L-66 6 L2 4 Z" fill="#f4f6ff" ${OUT}/><path d="M-60 -2 L-4 -2" stroke="#2d2250" stroke-width="7" opacity=".85"/>` },
    'fins-butterfly': { d: c => `<path d="M2 -60 C-40 -100 -64 -50 -36 -30 C-64 -16 -40 24 2 0 Z" fill="#ff9fce" ${OUT}/><circle cx="-30" cy="-54" r="8" fill="#ffd93d"/><circle cx="-26" cy="-8" r="6" fill="#9b6bff"/>` },
    'fins-feather': { d: c => `<path d="M2 -76 C-30 -70 -54 -40 -58 10 C-40 0 -30 12 -16 4 C-8 10 -2 6 2 0 Z" fill="#fbfbff" ${OUT}/><path d="M-10 -60 C-26 -40 -40 -16 -48 4 M-4 -40 C-14 -26 -22 -10 -26 4" stroke="#2d2250" stroke-width="2" fill="none" opacity=".4"/>` },
  };

  // ---------- boosters ----------
  A.boosters = {
    'boost-basic': { d: (c, h) => boosterShape(h, '#f4f6ff', c.main) },
    'boost-candy': { d: (c, h) => boosterShape(h, '#ffffff', '#ff4f6d', true) },
    'boost-rainbow': { d: (c, h) => boosterShape(h, '#fff', '#9b6bff', false, true) },
  };
  function boosterShape(h, fill, tip, candy, rainbow) {
    const id = 'bs' + (++uid);
    let deco = '';
    if (candy) deco = Array.from({ length: Math.ceil(h / 16) + 2 }, (_, i) => `<path d="M0 ${i * 16} L28 ${i * 16 - 12} L28 ${i * 16 - 4} L0 ${i * 16 + 8} Z" fill="#ff4f6d"/>`).join('');
    if (rainbow) deco = ['#ff5d5d', '#ff9f43', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff'].map((col, i) => `<rect x="0" y="${i * h / 6}" width="28" height="${h / 6 + 1}" fill="${col}"/>`).join('');
    return `<defs><clipPath id="${id}"><rect x="0" y="0" width="28" height="${h}"/></clipPath></defs>
      <path d="M0 0 C0 -18 10 -30 14 -34 C18 -30 28 -18 28 0 Z" fill="${tip}" ${OUT}/>
      <rect x="0" y="0" width="28" height="${h}" fill="${fill}"/><g clip-path="url(#${id})">${deco}</g><rect x="0" y="0" width="28" height="${h}" fill="none" ${OUT}/>
      <path d="M4 ${h} L24 ${h} L28 ${h + 16} L0 ${h + 16} Z" fill="#8a93b8" ${OUT}/>`;
  }

  // flame (animated in DOM, drawn separately on canvas)
  A.flame = (cx, y, w, big) => `<g transform="translate(${cx} ${y})"><g>
    <animateTransform attributeName="transform" type="scale" values="1 1;1.1 1.25;0.95 0.9;1 1" dur="0.25s" repeatCount="indefinite"/>
    <path d="M${-w / 2} 0 Q${-w / 2} ${w * 0.9} 0 ${w * (big ? 2.6 : 1.9)} Q${w / 2} ${w * 0.9} ${w / 2} 0 Z" fill="#ff9f43"/>
    <path d="M${-w / 3} 0 Q${-w / 3} ${w * 0.6} 0 ${w * (big ? 1.8 : 1.3)} Q${w / 3} ${w * 0.6} ${w / 3} 0 Z" fill="#ffd93d"/>
    <path d="M${-w / 6} 0 Q${-w / 6} ${w * 0.3} 0 ${w * 0.8} Q${w / 6} ${w * 0.3} ${w / 6} 0 Z" fill="#fff"/></g></g>`;

  // ---------- crew ----------
  A.crewFor = (r) => {
    const p = G.P();
    const list = (G.DATA && G.DATA.crew) || [];
    const get = id => { if (id === 'me' && p && p.face) return { img: p.face }; const c = list.find(c => c.id === id); return c ? { e: c.e } : { e: '👧' }; };
    const first = get(r.crew || 'kid');
    const second = get(r.crew2 || (r.crew === 'kid' || !r.crew ? 'sis' : 'kid'));
    return [first, second];
  };

  // ---------- compose a whole rocket ----------
  // returns {svg, w, h, box, slots} ; slots are rectangles (rocket coords) for drop hints
  A.rocket = (r, opts = {}) => {
    const c = pal(r.color || '#ff5d8f', r.accent || '#ffffff');
    const crew = A.crewFor(r);
    const hints = !!opts.hints;
    let parts = [], y = 0; const slots = {};
    const nose = r.nose && A.noses[r.nose];
    const cap = r.capsule && A.capsules[r.capsule];
    const bodies = (r.bodies || []).filter(b => A.bodies[b]);
    const eng = r.engine && A.engines[r.engine];
    const hint = (d) => `<path class="slot-hint" d="${d}"/>`;
    // nose
    if (nose) { parts.push(`<g transform="translate(0 ${y})">${nose.d(c)}</g>`); slots.nose = [0, y, 100, nose.h]; y += nose.h; }
    else if (hints) { parts.push(`<g transform="translate(0 ${y})">${hint('M0 70 L50 0 L100 70 Z')}<text x="50" y="58" font-size="26" text-anchor="middle">🔺</text></g>`); slots.nose = [0, y, 100, 70]; y += 70; }
    // capsule
    if (cap) { parts.push(`<g transform="translate(0 ${y})">${cap.d(c, crew)}</g>`); slots.capsule = [0, y, 100, cap.h]; y += cap.h; }
    else if (hints) { parts.push(`<g transform="translate(0 ${y})">${hint('M0 0 H100 V64 H0 Z')}<text x="50" y="44" font-size="28" text-anchor="middle">🪟</text></g>`); slots.capsule = [0, y, 100, 64]; y += 64; }
    // bodies
    const bodyTop = y;
    bodies.forEach(b => { parts.push(`<g transform="translate(0 ${y})">${A.bodies[b].d(c)}</g>`); y += BH; });
    if (!bodies.length && hints) { parts.push(`<g transform="translate(0 ${y})">${hint(`M0 0 H100 V${BH} H0 Z`)}<text x="50" y="56" font-size="28" text-anchor="middle">🛢️</text></g>`); y += BH; }
    slots.body = [0, bodyTop, 100, Math.max(BH, y - bodyTop)];
    const bodyBottom = y;
    // fins (behind engine but in front of body)
    let finsSvg = '';
    if (r.fins && A.fins[r.fins]) { const f = A.fins[r.fins].d(c); finsSvg = `<g transform="translate(0 ${bodyBottom})">${f}</g><g transform="translate(100 ${bodyBottom}) scale(-1 1)">${f}</g>`; }
    else if (hints) finsSvg = `<g transform="translate(0 ${bodyBottom})">${hint('M2 -60 L-40 10 L2 0 Z')}</g><g transform="translate(100 ${bodyBottom}) scale(-1 1)">${hint('M2 -60 L-40 10 L2 0 Z')}</g>`;
    slots.fins = [-50, bodyBottom - 70, 200, 90];
    // boosters
    let boostSvg = '';
    if (r.boosters && A.boosters[r.boosters]) {
      const bh = Math.max(70, (bodyBottom - bodyTop) * 0.85);
      const bd = A.boosters[r.boosters].d(c, bh);
      boostSvg = `<g transform="translate(-30 ${bodyBottom - bh + 8})">${bd}</g><g transform="translate(102 ${bodyBottom - bh + 8})">${bd}</g>`;
    }
    // engine
    let engSvg = '', engH = 0;
    if (eng) { engSvg = `<g transform="translate(0 ${bodyBottom})">${eng.d(c)}</g>`; engH = eng.h; }
    else if (hints) { engSvg = `<g transform="translate(0 ${bodyBottom})">${hint('M30 0 H70 L84 40 H16 Z')}<text x="50" y="32" font-size="22" text-anchor="middle">🔥</text></g>`; engH = 40; }
    slots.engine = [10, bodyBottom, 80, Math.max(engH, 40)];
    // flame
    let flame = '';
    if (opts.flame && eng) {
      const fy = bodyBottom + engH - 2, big = eng.tier >= 3;
      const xs = { 'eng-1': [50], 'eng-2': [30, 70], 'eng-3': [20, 50, 80], 'eng-4': [50] }[r.engine];
      const fw = { 'eng-1': 36, 'eng-2': 28, 'eng-3': 24, 'eng-4': 80 }[r.engine];
      flame = xs.map(x => A.flame(x, fy, fw, big)).join('');
      if (boostSvg) { const byy = bodyBottom + 24; flame += A.flame(-16, byy, 20, false) + A.flame(116, byy, 20, false); }
    }
    // stickers
    const stick = (r.stickers || []).map(s => `<text x="${s.x}" y="${s.y}" font-size="${s.s || 30}" text-anchor="middle" dominant-baseline="central">${s.e}</text>`).join('');
    const top = -4, bottom = bodyBottom + engH + (opts.flame ? 110 : 6);
    const left = -72, width = 244;
    const body = `${flame}${boostSvg}${finsSvg}${parts.join('')}${engSvg}${stick}`;
    const h = bottom - top;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${h}" width="${width}" height="${h}" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">${body}</svg>`;
    return { svg, w: width, h, box: [left, top, width, h], slots, bodyBottom, engBottom: bodyBottom + engH };
  };

  // one part by itself, for tray cards and prize reveals
  A.part = (id, r) => {
    r = r || (G.P() && G.P().rocket) || {};
    const c = pal(r.color || '#ff5d8f', r.accent || '#ffffff');
    const def = G.DATA.partById[id];
    if (!def) return '';
    const wrap = (vb, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
    switch (def.cat) {
      case 'nose': { const n = A.noses[id]; return wrap(`-10 -10 120 ${n.h + 20}`, n.d(c)); }
      case 'capsule': { const n = A.capsules[id]; return wrap(`-10 -10 120 ${n.h + 20}`, n.d(c, A.crewFor(r))); }
      case 'body': return wrap(`-10 -10 120 ${BH + 20}`, A.bodies[id].d(c));
      case 'engine': { const n = A.engines[id]; return wrap(`-5 -8 110 ${n.h + 16}`, n.d(c)); }
      case 'fins': return wrap('-80 -120 280 150', `<rect x="0" y="-70" width="100" height="70" fill="${c.main}" opacity=".25" rx="4"/><g>${A.fins[id].d(c)}</g><g transform="translate(100 0) scale(-1 1)">${A.fins[id].d(c)}</g>`);
      case 'booster': return wrap('-6 -40 82 150', `<g>${A.boosters[id].d(c, 90)}</g><g transform="translate(42 0)">${A.boosters[id].d(c, 90)}</g>`);
    }
    return '';
  };

  // turn an svg string into an Image (for canvas drawing)
  A.toImage = (svg) => new Promise(res => {
    const img = new Image();
    img.onload = () => res(img); img.onerror = () => res(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

  // planets drawn on canvas (used in space, map, stickers, jigsaw)
  A.drawPlanet = (ctx, pl, x, y, r, t = 0) => {
    ctx.save();
    if (pl.glow) { const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.8); g.addColorStop(0, pl.glow); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2); ctx.fill(); }
    if (pl.rings && pl.ringsBehind !== false) drawRings(ctx, pl, x, y, r, true);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, pl.colors[0]); grad.addColorStop(1, pl.colors[1] || pl.colors[0]);
    ctx.fillStyle = grad; ctx.fill();
    ctx.save(); ctx.clip();
    if (pl.bands) { pl.bands.forEach((b, i) => { ctx.fillStyle = b; ctx.globalAlpha = 0.55; const by = y - r + (i + 0.5) * (2 * r / pl.bands.length); ctx.fillRect(x - r, by - r / pl.bands.length * 0.35, 2 * r, r / pl.bands.length * 0.7); }); ctx.globalAlpha = 1; }
    if (pl.spots) pl.spots.forEach(s => { ctx.fillStyle = s[3]; ctx.beginPath(); ctx.ellipse(x + s[0] * r, y + s[1] * r, s[2] * r, s[2] * r * (s[4] || 1), 0, 0, Math.PI * 2); ctx.fill(); });
    if (pl.land) { ctx.fillStyle = pl.land; const rot = t * 0.05; [[-0.3, -0.2, 0.35, 0.25], [0.35, 0.25, 0.28, 0.3], [-0.1, 0.55, 0.3, 0.15], [0.4, -0.5, 0.2, 0.15]].forEach(([a, b, w, h]) => { const xx = ((a + rot) % 2 + 2) % 2 - 1; ctx.beginPath(); ctx.ellipse(x + xx * r * 1.2, y + b * r, w * r, h * r, 0.4, 0, Math.PI * 2); ctx.fill(); }); }
    if (pl.clouds) { ctx.fillStyle = 'rgba(255,255,255,.55)'; [[-0.5, -0.45, 0.4], [0.3, 0.1, 0.35], [-0.2, 0.7, 0.4]].forEach(([a, b, w]) => { ctx.beginPath(); ctx.ellipse(x + a * r, y + b * r, w * r, 0.07 * r, 0, 0, Math.PI * 2); ctx.fill(); }); }
    if (pl.heart) { ctx.fillStyle = 'rgba(255,240,230,.9)'; ctx.beginPath(); const hx = x + 0.15 * r, hy = y + 0.05 * r, s = r * 0.5; ctx.moveTo(hx, hy + s * 0.6); ctx.bezierCurveTo(hx - s, hy, hx - s * 0.6, hy - s * 0.7, hx, hy - s * 0.25); ctx.bezierCurveTo(hx + s * 0.6, hy - s * 0.7, hx + s, hy, hx, hy + s * 0.6); ctx.fill(); }
    if (pl.craters) { ctx.fillStyle = 'rgba(0,0,0,.14)'; [[-0.4, -0.3, 0.18], [0.3, 0.35, 0.22], [0.35, -0.4, 0.12], [-0.3, 0.45, 0.1], [0, 0, 0.1]].forEach(([a, b, w]) => { ctx.beginPath(); ctx.arc(x + a * r, y + b * r, w * r, 0, Math.PI * 2); ctx.fill(); }); }
    // shadow side
    const sh = ctx.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,20,.45)');
    if (!pl.isStar) { ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    ctx.restore();
    if (pl.face) { drawFace(ctx, x, y, r, pl.face); }
    if (pl.rings) drawRings(ctx, pl, x, y, r, false);
    ctx.restore();
  };
  function drawRings(ctx, pl, x, y, r, back) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(pl.ringTilt || -0.35);
    ctx.beginPath();
    if (back) ctx.ellipse(0, 0, r * 2.1, r * 0.5, 0, Math.PI, Math.PI * 2);
    else ctx.ellipse(0, 0, r * 2.1, r * 0.5, 0, 0, Math.PI);
    ctx.lineWidth = r * 0.28; ctx.strokeStyle = pl.rings; ctx.globalAlpha = 0.85; ctx.stroke();
    ctx.lineWidth = r * 0.06; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();
    ctx.restore();
  }
  function drawFace(ctx, x, y, r, kind) {
    ctx.save(); ctx.fillStyle = '#2d2250';
    const ex = r * 0.3, ey = -r * 0.1, er = Math.max(2, r * 0.08);
    ctx.beginPath(); ctx.arc(x - ex, y + ey, er, 0, 7); ctx.arc(x + ex, y + ey, er, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - ex + er * 0.35, y + ey - er * 0.35, er * 0.35, 0, 7); ctx.arc(x + ex + er * 0.35, y + ey - er * 0.35, er * 0.35, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2d2250'; ctx.lineWidth = Math.max(2, r * 0.05); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y + r * 0.08, r * 0.2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,170,.5)'; ctx.beginPath(); ctx.arc(x - r * 0.48, y + r * 0.12, r * 0.1, 0, 7); ctx.arc(x + r * 0.48, y + r * 0.12, r * 0.1, 0, 7); ctx.fill();
    ctx.restore();
  }

  A.planetCanvas = (pl, size = 120, pad = 1.0) => {
    const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    const r = size / 2 / (pl.rings ? 2.3 : (pl.glow ? 1.8 : 1.05)) * pad;
    if (pl.draw) pl.draw(ctx, size / 2, size / 2, r, 0); else A.drawPlanet(ctx, pl, size / 2, size / 2, r);
    return cv;
  };
  return A;
})();
