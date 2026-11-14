// Our big dollhouse: the KidKraft Shimmer Mansion in the play corner. Tap it in the house and it
// opens full screen, drawn from the front the way it really looks (pink, four levels, eight rooms:
// garage with barn doors, bathroom and rooftop hot tub on the left; gym and office, kitchen and the
// barbecue balcony, the living room with the fireplace and the stairs, and the loft bedroom up top;
// a working elevator in between). The Moana 2 friends and the kitty can be dragged into any room;
// where they stand is saved with the house. Their sayings are our own, not lines from the movie.
(() => {
  const W = G.W;
  const D = G.dollhouse = {};
  const OX = 70, OY = 4;                       // the house is drawn in its own coordinates, then moved here
  const EMO = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  let el = null, svg = null, raf = 0, timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const st = () => { const h = G.save.house; return h.dollhouse || (h.dollhouse = { figs: {}, elev: 0, up: 1, doors: 0, lamp: 0, fire: 0, mill: 0 }); };

  // ---------- the friends ----------
  // h is the height in scene pixels (one dollhouse room is about 210 tall)
  const FIGS = [
    { id: 'moana', name: 'Moana', h: 96 }, { id: 'maui', name: 'Maui', h: 124 }, { id: 'simea', name: 'Simea', h: 70 },
    { id: 'pua', name: 'Pua', h: 44 }, { id: 'heihei', name: 'Heihei', h: 52 }, { id: 'moni', name: 'Moni', h: 98 },
    { id: 'loto', name: 'Loto', h: 94 }, { id: 'kele', name: 'Kele', h: 92 }, { id: 'kitty', name: 'Kitty', h: 40 },
  ];
  // a person, drawn 100 tall with the feet at (0, 0)
  function person(o) {
    const sk = o.skin, w = o.wide || 1;
    let s = '';
    if (o.hairBack) s += o.hairBack;
    s += `<rect x="${-9 * w}" y="-33" width="${7 * w}" height="31" rx="3" fill="${o.legs || sk}"/><rect x="${2 * w}" y="-33" width="${7 * w}" height="31" rx="3" fill="${o.legs || sk}"/>
      <ellipse cx="${-6 * w}" cy="-1.5" rx="${5 * w}" ry="2.6" fill="${o.feet || '#6b4a32'}"/><ellipse cx="${6 * w}" cy="-1.5" rx="${5 * w}" ry="2.6" fill="${o.feet || '#6b4a32'}"/>`;
    s += `<path d="M${-12 * w} -63 Q${-21 * w} -52 ${-19 * w} -38" stroke="${sk}" stroke-width="${5.5 * w}" fill="none" stroke-linecap="round"/><path d="M${12 * w} -63 Q${21 * w} -52 ${19 * w} -38" stroke="${sk}" stroke-width="${5.5 * w}" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="${-12.5 * w}" y="-66" width="${25 * w}" height="${o.topH || 22}" rx="6" fill="${o.top}"/>`;
    if (o.topDeco) s += o.topDeco;
    s += `<path d="M${-13 * w} -46 L${13 * w} -46 L${16 * w} ${o.skirtTo || -26} L${-16 * w} ${o.skirtTo || -26} Z" fill="${o.bottom}"/>`;
    if (o.bottomDeco) s += o.bottomDeco;
    s += `<rect x="-3.5" y="-71" width="7" height="7" fill="${sk}"/><circle cx="0" cy="-80" r="13" fill="${sk}"/>`;
    s += `<circle cx="-4.6" cy="-80" r="1.9" fill="#2b1d16"/><circle cx="4.6" cy="-80" r="1.9" fill="#2b1d16"/><path d="M-4 -74.5 Q0 ${o.grump ? -76.5 : -71.5} 4 -74.5" stroke="#5a2a1e" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    if (o.grump) s += `<path d="M-8 -85 L-2 -83.5 M8 -85 L2 -83.5" stroke="#4a4a4a" stroke-width="1.8" stroke-linecap="round"/>`;
    if (o.hair) s += o.hair;
    if (o.extra) s += o.extra;
    return s;
  }
  const BROWN = '#a8693f', BROWN2 = '#93593a';
  const DRAW = {
    moana: () => person({
      skin: BROWN, top: '#d8452d', bottom: '#ead2a4', skirtTo: -20,
      hairBack: '<path d="M-15 -86 Q-22 -60 -16 -38 Q-10 -44 -8 -38 Q-2 -46 0 -40 Q4 -46 8 -38 Q12 -44 16 -38 Q22 -60 15 -86 Z" fill="#20150f"/>',
      hair: '<path d="M-14 -82 Q-12 -97 0 -96 Q13 -97 14 -82 Q6 -91 -2 -88 Q-8 -92 -14 -82Z" fill="#20150f"/>',
      topDeco: '<path d="M-10 -60 h20 M-10 -55 h20" stroke="#f7d9a8" stroke-width="1.6"/><circle cx="0" cy="-64" r="2.4" fill="#2fb5b0"/>',
      bottomDeco: '<path d="M-14 -36 h28 M-15 -29 h30" stroke="#b0412b" stroke-width="2"/>',
    }),
    maui: () => person({
      skin: BROWN2, wide: 1.35, top: BROWN2, topH: 20, bottom: '#4f9a45', skirtTo: -24,
      topDeco: '<path d="M-12 -62 q5 6 0 12 M-4 -63 q4 8 -2 14 M7 -62 q-5 7 2 13 M13 -58 q-4 4 0 8" stroke="#1d2b4a" stroke-width="1.6" fill="none"/>',
      bottomDeco: '<path d="M-20 -26 l5 -10 l5 10 l5 -10 l5 10 l5 -10 l5 10 l5 -10 l5 10" stroke="#3c7d34" stroke-width="2" fill="none"/>',
      hairBack: '<path d="M-17 -88 Q-30 -70 -20 -52 Q-14 -60 -10 -54 Q0 -62 10 -54 Q14 -60 20 -52 Q30 -70 17 -88Z" fill="#1d130e"/>',
      hair: '<path d="M-15 -82 Q-16 -100 0 -99 Q16 -100 15 -82 Q8 -93 0 -90 Q-8 -93 -15 -82Z" fill="#1d130e"/>',
      extra: '<path d="M27 -40 L27 -84 Q27 -96 18 -96 Q10 -96 11 -88" stroke="#efe1c0" stroke-width="5" fill="none" stroke-linecap="round"/>',
    }),
    simea: () => person({
      skin: BROWN, top: '#f3a33a', bottom: '#f3a33a', skirtTo: -22,
      hair: '<circle cx="-11" cy="-93" r="7" fill="#20150f"/><circle cx="11" cy="-93" r="7" fill="#20150f"/><path d="M-13 -82 Q-11 -94 0 -94 Q11 -94 13 -82 Q4 -89 -13 -82Z" fill="#20150f"/>',
      bottomDeco: '<path d="M-15 -30 h30" stroke="#d9652a" stroke-width="2"/>',
    }),
    moni: () => person({
      skin: BROWN2, top: '#4fb0c6', bottom: '#7a5236', skirtTo: -24,
      hair: '<path d="M-14 -82 Q-14 -97 0 -96 Q14 -97 14 -82 Q6 -90 -14 -82Z" fill="#20150f"/><circle cx="0" cy="-100" r="6.5" fill="#20150f"/>',
      topDeco: '<path d="M-12 -60 L12 -50" stroke="#f2e6c8" stroke-width="3"/>',
    }),
    loto: () => person({
      skin: BROWN, top: '#f2b632', bottom: '#8a2f3b', skirtTo: -22,
      hair: '<path d="M-14 -82 Q-13 -97 0 -96 Q13 -97 14 -82 Q5 -90 -14 -82Z" fill="#20150f"/><ellipse cx="0" cy="-99" rx="9" ry="6" fill="#20150f"/><path d="M-13 -88 Q0 -94 13 -88" stroke="#ffd84a" stroke-width="3" fill="none"/>',
      extra: '<path d="M21 -40 l6 -12 m-3 -2 l6 3" stroke="#8b8f97" stroke-width="3.2" stroke-linecap="round"/>',
    }),
    kele: () => person({
      skin: BROWN2, top: '#7a5a3a', bottom: '#5e4630', skirtTo: -18, grump: 1,
      hair: '<path d="M-14 -84 Q-13 -96 0 -95 Q13 -96 14 -84 Q7 -90 -14 -84Z" fill="#bdbdbd"/><path d="M-10 -73 Q0 -58 10 -73 Q4 -70 0 -70 Q-4 -70 -10 -73Z" fill="#d9d9d9"/>',
      topDeco: '<path d="M-14 -66 L14 -48 L14 -66 Z" fill="#5e4630" opacity=".7"/>',
    }),
    pua: () => `<ellipse cx="0" cy="-48" rx="40" ry="30" fill="#f2b2b8"/><ellipse cx="-14" cy="-56" rx="10" ry="7" fill="#6b5a5c" opacity=".55"/><ellipse cx="16" cy="-40" rx="9" ry="6" fill="#6b5a5c" opacity=".5"/>
      <rect x="-28" y="-26" width="9" height="24" rx="3" fill="#e79aa2"/><rect x="18" y="-26" width="9" height="24" rx="3" fill="#e79aa2"/>
      <circle cx="-30" cy="-70" r="21" fill="#f2b2b8"/><path d="M-44 -86 l-6 -16 l14 8Z M-18 -88 l2 -16 l-12 10Z" fill="#e79aa2"/>
      <ellipse cx="-44" cy="-64" rx="10" ry="8" fill="#e58f99"/><circle cx="-47" cy="-64" r="1.8" fill="#8a3d48"/><circle cx="-41" cy="-64" r="1.8" fill="#8a3d48"/>
      <circle cx="-34" cy="-76" r="3" fill="#2b1d16"/><circle cx="-22" cy="-76" r="3" fill="#2b1d16"/><path d="M38 -54 q10 -4 6 6 q-4 6 4 6" stroke="#e79aa2" stroke-width="3" fill="none"/>`,
    heihei: () => `<path d="M24 -60 Q46 -88 40 -40 Q34 -54 24 -44Z" fill="#26372d"/><ellipse cx="0" cy="-40" rx="26" ry="24" fill="#8a3b2a"/><path d="M-10 -40 q10 12 24 0" stroke="#6d2a1e" stroke-width="3" fill="none"/>
      <path d="M-6 -18 v16 m-5 0 h10 M6 -18 v16 m-5 0 h10" stroke="#e8b33a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-14" cy="-66" r="15" fill="#8a3b2a"/><path d="M-20 -80 q2 -12 6 -2 q3 -12 6 -1 q4 -10 5 3Z" fill="#d6332a"/><path d="M-28 -64 l-12 4 l12 4Z" fill="#f0b93c"/><ellipse cx="-20" cy="-56" rx="4" ry="6" fill="#d6332a"/>
      <circle cx="-18" cy="-70" r="5.5" fill="#fff"/><circle cx="-8" cy="-69" r="5.5" fill="#fff"/><circle cx="-19.5" cy="-69" r="2.2" fill="#111"/><circle cx="-6" cy="-71" r="2.2" fill="#111"/>`,
    kitty: () => `<ellipse cx="4" cy="-28" rx="30" ry="20" fill="#9aa0a8"/><path d="M30 -34 q20 -10 14 -34" stroke="#9aa0a8" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-22" cy="-52" r="17" fill="#9aa0a8"/>
      <path d="M-36 -62 l-2 -16 l12 9Z M-10 -64 l2 -16 l-12 9Z" fill="#9aa0a8"/><ellipse cx="-22" cy="-46" rx="9" ry="6" fill="#f2f2f2"/><circle cx="-28" cy="-55" r="2.6" fill="#2a2" /><circle cx="-16" cy="-55" r="2.6" fill="#2a2"/>
      <path d="M-22 -48 l-2 2 h4Z" fill="#ff8fb0"/><rect x="-14" y="-12" width="7" height="12" rx="3" fill="#8a9098"/><rect x="14" y="-12" width="7" height="12" rx="3" fill="#8a9098"/>`,
  };

  // ---------- where things can stand (the house's own coordinates; y is the floor) ----------
  const SPOTS = [
    { id: 'bed', x1: 338, x2: 532, y: 158 }, { id: 'loft', x1: 312, x2: 640, y: 195 },
    { id: 'hottub', x1: 98, x2: 244, y: 412 }, { id: 'spa', x1: 86, x2: 308, y: 428 },
    { id: 'sofa', x1: 480, x2: 584, y: 372 }, { id: 'living', x1: 405, x2: 770, y: 418 },
    { id: 'tub', x1: 112, x2: 208, y: 612 }, { id: 'bath', x1: 86, x2: 314, y: 640 },
    { id: 'kitchen', x1: 408, x2: 600, y: 625 }, { id: 'balcony', x1: 600, x2: 770, y: 612 },
    { id: 'mill', x1: 474, x2: 552, y: 808 }, { id: 'gym', x1: 408, x2: 560, y: 832 }, { id: 'office', x1: 560, x2: 770, y: 832 },
    { id: 'garage', x1: 86, x2: 314, y: 866 },
  ];
  const ELEV = { x1: 318, x2: 402, ys: [832, 625, 418] };
  const SHELF = [{ id: 'shelfTop', x1: 1010, x2: 1530, y: 470 }, { id: 'shelfMid', x1: 1010, x2: 1530, y: 690 }];
  const GROUND = 893;
  const surfaces = () => {
    const s = st(), out = SPOTS.map(p => ({ id: p.id, x1: p.x1 + OX, x2: p.x2 + OX, y: p.y + OY }));
    // at the top the elevator car is part of the living room floor
    out.push({ id: 'elev', x1: ELEV.x1 + OX, x2: ELEV.x2 + OX, y: ELEV.ys[s.elev] + OY });
    return out.concat(SHELF);
  };
  function snap(x, y) {
    let best = null;
    for (const p of surfaces()) if (x >= p.x1 && x <= p.x2 && p.y >= y - 46 && (!best || p.y < best.y)) best = p;
    return best ? { x, y: best.y, s: best.id } : { x: G.clamp(x, 20, 1580), y: GROUND, s: 'floor' };
  }
  // where everyone starts: in a row on the toy shelf
  function home(i) {
    const row = i < 5 ? 0 : 1, k = row ? i - 5 : i;
    return { x: 1060 + k * (row ? 118 : 100), y: SHELF[row].y, s: SHELF[row].id };
  }

  // ---------- the house, drawn from the front ----------
  const brick = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f6b9d1"/>` + Array.from({ length: Math.floor(h / 14) }, (_, i) => `<path d="M${x} ${y + i * 14 + 14} h${w}" stroke="#eea2c1" stroke-width="1.5"/>` + Array.from({ length: Math.ceil(w / 26) }, (_, j) => `<path d="M${x + j * 26 + (i % 2) * 13} ${y + i * 14} v14" stroke="#eea2c1" stroke-width="1.5"/>`).join('')).join('');
  const win = (x, y, w, h, col = '#a9e1ef') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" stroke="#fff" stroke-width="5"/><path d="M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}" stroke="#fff" stroke-width="3"/>`;
  const slab = (x, y, w, h = 13) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f3dcb8" stroke="#d9b98d" stroke-width="1.5"/>`;
  const post = (x, y, h) => `<rect x="${x}" y="${y}" width="10" height="${h}" fill="#f3dcb8" stroke="#d9b98d" stroke-width="1.5"/>`;
  function houseSvg(s, forTexture) {
    const lampOn = s.lamp, fireOn = s.fire;
    let o = '';
    // ---- left wing ----
    o += brick(18, 252, 70, 616) + win(30, 288, 44, 52) + win(30, 480, 44, 62) + win(30, 706, 44, 92);
    o += '<g fill="#7fc76a"><circle cx="40" cy="410" r="9"/><circle cx="56" cy="404" r="9"/><circle cx="70" cy="412" r="8"/></g><circle cx="48" cy="402" r="4" fill="#ff7fb0"/>';
    // rooftop spa under its curved roof
    o += '<rect x="86" y="232" width="224" height="196" fill="#fde5ee"/><rect x="86" y="356" width="224" height="72" fill="#7fd3df"/><rect x="86" y="350" width="224" height="8" fill="#f0478f"/>';
    o += '<path d="M8 236 Q160 178 312 172 L312 196 Q172 202 88 264 L16 264 Z" fill="#f9c6da" stroke="#e7a6c2" stroke-width="2"/><path d="M88 264 Q172 202 312 196 L312 210 Q182 216 92 276 Z" fill="#3a3340"/>';
    o += '<rect x="262" y="372" width="30" height="40" rx="4" fill="#c9884f"/><g fill="#3e9a4a"><path d="M277 372 q-22 -26 -4 -46 q4 22 4 46Z"/><path d="M277 372 q20 -28 6 -50 q-6 24 -6 50Z"/><path d="M277 372 q-2 -34 0 -54 q4 26 0 54Z"/></g>';
    // bathroom
    o += '<rect x="86" y="440" width="228" height="200" fill="#f58fbc"/><path d="M86 440 h228 v200 h-228Z" fill="url(#dhDots)"/>';
    o += '<rect x="112" y="452" width="62" height="58" rx="6" fill="#fff8e6" stroke="#e5b84a" stroke-width="5"/><rect x="98" y="512" width="92" height="56" rx="4" fill="#242228"/><g fill="#ddd"><rect x="104" y="518" width="80" height="13" rx="2"/><rect x="104" y="536" width="80" height="13" rx="2"/><rect x="104" y="553" width="80" height="11" rx="2"/></g>';
    o += '<rect x="206" y="458" width="36" height="40" fill="#fff" stroke="#e5b84a" stroke-width="3"/><circle cx="224" cy="476" r="9" fill="#bbb"/><path d="M215 470 l3 -8 l4 6 M233 470 l-3 -8 l-4 6" fill="#bbb" stroke="#bbb"/>';
    o += '<rect x="246" y="470" width="4" height="70" fill="#e5b84a"/><rect x="232" y="490" width="34" height="44" fill="#fff"/><path d="M232 498 h34 M232 508 h34 M232 518 h34 M232 528 h34" stroke="#111" stroke-width="4"/>';
    o += '<g data-act="sink" class="dh-tap"><rect x="272" y="572" width="10" height="66" fill="#f0478f"/><ellipse cx="277" cy="570" rx="22" ry="8" fill="#fff" stroke="#ddd"/><path d="M277 548 v14 h8" stroke="#bbb" stroke-width="3" fill="none"/></g>';
    o += '<g data-act="toilet" class="dh-tap"><rect x="90" y="584" width="26" height="30" rx="4" fill="#fff" stroke="#ddd"/><ellipse cx="110" cy="618" rx="18" ry="8" fill="#ff9cc7" stroke="#e77aa9"/><rect x="104" y="618" width="12" height="20" fill="#fff" stroke="#ddd"/></g>';
    // the garage, behind its barn doors (the doors are drawn in front of the friends)
    o += '<rect x="86" y="654" width="228" height="212" fill="#f9d2e2"/><rect x="86" y="654" width="228" height="20" fill="#f3b6cf"/>';
    // ---- the elevator shaft ----
    o += '<rect x="314" y="436" width="92" height="400" fill="#e9468e"/><rect x="322" y="436" width="76" height="400" fill="#ffc6de"/><path d="M326 440 v392 M394 440 v392" stroke="#c92d72" stroke-width="3"/>';
    // ---- ground floor: gym and office ----
    o += '<rect x="406" y="640" width="156" height="192" fill="#f6a7c8"/><rect x="560" y="640" width="210" height="192" fill="#fbd0e1"/>';
    o += '<rect x="420" y="662" width="104" height="58" fill="#fff" stroke="#fff" stroke-width="4"/><rect x="422" y="664" width="100" height="30" fill="#8ed4f3"/><rect x="422" y="694" width="100" height="24" fill="#f6dfa8"/><circle cx="452" cy="690" r="6" fill="#e2a37c"/><circle cx="486" cy="690" r="6" fill="#e2a37c"/><path d="M412 736 h140" stroke="#fff" stroke-width="5"/>';
    o += `<g data-act="mill" class="dh-tap"><path d="M546 736 L552 808" stroke="#9aa0a8" stroke-width="7"/><rect x="530" y="724" width="30" height="16" rx="4" fill="#e9ecef" stroke="#9aa0a8" stroke-width="2"/><rect x="472" y="806" width="84" height="16" rx="5" fill="#2a2a30"/><g id="dh-belt">${Array.from({ length: 9 }, (_, i) => `<rect x="${476 + i * 9}" y="809" width="4" height="10" fill="#555"/>`).join('')}</g><rect x="468" y="820" width="92" height="10" rx="3" fill="#cfd3d8"/></g>`;
    o += '<g data-act="pouf" class="dh-tap"><ellipse cx="436" cy="816" rx="24" ry="16" fill="#ff4fa0"/><ellipse cx="436" cy="809" rx="20" ry="6" fill="#ff86bf"/></g>';
    o += win(578, 660, 66, 76, '#7cc8d8') + '<g fill="#111"><rect x="566" y="654" width="12" height="96"/><rect x="644" y="654" width="12" height="96"/></g><g fill="#fff"><rect x="566" y="666" width="12" height="10"/><rect x="566" y="688" width="12" height="10"/><rect x="566" y="710" width="12" height="10"/><rect x="566" y="732" width="12" height="10"/><rect x="644" y="666" width="12" height="10"/><rect x="644" y="688" width="12" height="10"/><rect x="644" y="710" width="12" height="10"/><rect x="644" y="732" width="12" height="10"/></g>';
    o += '<rect x="690" y="652" width="66" height="98" fill="#fff" stroke="#111" stroke-width="3"/><path d="M690 670 h66 M690 690 h66 M690 710 h66 M690 730 h66" stroke="#111" stroke-width="7"/>';
    o += '<g data-act="laptop" class="dh-tap"><rect x="676" y="772" width="84" height="12" fill="#e7c48f"/><rect x="682" y="784" width="8" height="48" fill="#d9ad6d"/><rect x="746" y="784" width="8" height="48" fill="#d9ad6d"/><path d="M700 772 l6 -22 h30 l-4 22Z" fill="#cfd3d8"/></g>';
    o += '<g fill="#ff8fc0"><rect x="612" y="786" width="44" height="10" rx="4"/><rect x="612" y="756" width="10" height="32" rx="4"/><rect x="630" y="796" width="6" height="34"/><rect x="618" y="826" width="30" height="5" rx="2"/></g>';
    // ---- kitchen and the barbecue balcony ----
    o += '<rect x="406" y="432" width="196" height="194" fill="#fbe3ee"/><path d="M406 500 h196" stroke="#f0bcd2" stroke-width="2"/>' + win(474, 446, 58, 50, '#7cc8d8');
    o += '<g data-act="stove" class="dh-tap"><path d="M418 440 h50 l-8 30 h-34 Z" fill="#cfd3d8" stroke="#9aa0a8" stroke-width="2"/><rect x="412" y="520" width="58" height="104" fill="#2a2a30"/><rect x="418" y="550" width="46" height="34" rx="3" fill="#555" stroke="#888"/><g fill="#888"><circle cx="425" cy="527" r="4"/><circle cx="441" cy="527" r="4"/><circle cx="457" cy="527" r="4"/></g><g id="dh-flame" opacity="0"><path d="M425 520 q-4 -8 0 -12 q4 4 0 12Z M441 520 q-4 -8 0 -12 q4 4 0 12Z" fill="#4da3ff"/></g></g>';
    o += '<rect x="474" y="520" width="66" height="40" fill="#fff" stroke="#ddd"/><g data-act="ksink" class="dh-tap"><rect x="484" y="516" width="40" height="8" fill="#cfd3d8"/><path d="M504 516 v-14 h10" stroke="#9aa0a8" stroke-width="3" fill="none"/></g>';
    o += '<g data-act="fridge" class="dh-tap"><rect x="546" y="478" width="52" height="146" rx="4" fill="#8e949c"/><rect id="dh-fdoor" x="546" y="478" width="52" height="146" rx="4" fill="#a8adb4" stroke="#7d838a" stroke-width="2"/><path d="M546 538 h52" stroke="#7d838a" stroke-width="2"/><rect x="552" y="500" width="4" height="26" fill="#ddd"/><rect x="552" y="548" width="4" height="30" fill="#ddd"/></g>';
    o += '<rect x="432" y="574" width="96" height="10" rx="3" fill="#ff8fc0"/><rect x="446" y="584" width="7" height="40" fill="#f3c9a0"/><rect x="508" y="584" width="7" height="40" fill="#f3c9a0"/>';
    o += '<g fill="#e7c48f"><rect x="416" y="582" width="20" height="8"/><rect x="416" y="560" width="5" height="64"/><rect x="430" y="590" width="5" height="34"/><rect x="524" y="582" width="20" height="8"/><rect x="539" y="560" width="5" height="64"/><rect x="525" y="590" width="5" height="34"/></g><g fill="#ff6fb1"><rect x="415" y="578" width="22" height="5" rx="2"/><rect x="523" y="578" width="22" height="5" rx="2"/></g>';
    o += brick(602, 432, 168, 80) + win(640, 446, 58, 50);
    o += '<rect x="602" y="512" width="168" height="100" fill="#bfe9ef"/><rect x="602" y="506" width="168" height="10" fill="#f0478f"/><path d="M604 560 h164" stroke="#f0478f" stroke-width="5"/>';
    o += '<g data-act="grill" class="dh-tap"><path d="M672 576 l-14 34 M688 576 l14 34 M680 576 v34" stroke="#55595f" stroke-width="3.5"/><path d="M656 566 a24 22 0 0 1 48 0Z" fill="#3a3d42"/><rect x="654" y="564" width="52" height="12" rx="4" fill="#9aa0a8"/></g>';
    // ---- living room, the stairs and the big window ----
    o += '<rect x="310" y="210" width="310" height="210" fill="#e5468f"/><g fill="#f26ba9"><rect x="322" y="222" width="54" height="120"/><rect x="560" y="222" width="54" height="120"/></g>';
    o += '<rect x="398" y="226" width="68" height="54" rx="8" fill="#fff" stroke="#22242b" stroke-width="8"/>';
    o += `<g data-act="fire" class="dh-tap"><rect x="378" y="296" width="110" height="10" fill="#fff"/><rect x="384" y="306" width="98" height="96" fill="#f7f4ee"/><rect x="404" y="324" width="58" height="78" fill="#3a3340"/><path d="M404 340 h58 M404 356 h58 M404 372 h58 M404 388 h58" stroke="#f7f4ee" stroke-width="2"/><g id="dh-fire" opacity="${fireOn ? 1 : 0}"><path d="M416 400 q-6 -22 8 -30 q-2 12 6 16 q2 -14 10 -22 q8 18 -2 36Z" fill="#ff9a2f"/><path d="M426 400 q-2 -12 6 -16 q4 10 6 16Z" fill="#ffe14a"/></g><circle cx="470" cy="288" r="9" fill="#4da3ff"/><path d="M462 288 q8 -4 16 0" stroke="#5fd35f" stroke-width="3" fill="none"/></g>`;
    o += '<g data-act="sofa" class="dh-tap"><rect x="474" y="356" width="112" height="44" rx="12" fill="#ff8fc0"/><rect x="474" y="340" width="112" height="30" rx="10" fill="#ffa6cf"/><rect x="474" y="356" width="18" height="50" rx="7" fill="#ff7ab3"/><rect x="568" y="356" width="18" height="50" rx="7" fill="#ff7ab3"/><rect x="500" y="344" width="24" height="18" rx="4" fill="#fff"/><path d="M503 347 l6 12 M511 346 l6 14 M519 348 l3 8" stroke="#111" stroke-width="2.4"/><rect x="540" y="342" width="22" height="18" rx="4" fill="#e5004f"/></g>';
    o += '<ellipse cx="490" cy="414" rx="56" ry="7" fill="#fff"/><path d="M444 412 q8 -4 12 0 q8 -4 12 0 q8 -4 12 0 q8 -4 12 0 q8 -4 12 0 q8 -4 12 0 q8 -4 12 0" stroke="#111" stroke-width="2.5" fill="none"/>';
    o += '<rect x="330" y="356" width="34" height="8" fill="#e5b84a"/><path d="M334 364 l4 50 M360 364 l-4 50" stroke="#e5b84a" stroke-width="3"/><path d="M348 300 v56" stroke="#22242b" stroke-width="3"/><path d="M336 300 h24 l-4 -18 h-16Z" fill="#fff4cf"/>';
    o += '<rect x="620" y="26" width="150" height="394" fill="#f7b3cf"/><rect x="546" y="34" width="160" height="380" fill="#6fc1d6"/>';
    o += Array.from({ length: 5 }, (_, i) => `<path d="M${546 + i * 32} 34 v380" stroke="#2a4a55" stroke-width="3"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<path d="M546 ${34 + i * 63} h160" stroke="#2a4a55" stroke-width="3"/>`).join('');
    o += '<rect x="716" y="120" width="36" height="46" fill="#fff" stroke="#e5b84a" stroke-width="3"/><path d="M724 156 q10 -24 20 0" fill="#ff9cc7"/><rect x="716" y="196" width="36" height="160" fill="#a9e1ef" stroke="#fff" stroke-width="4"/>';
    o += '<path d="M700 40 v32 M740 40 v52" stroke="#22242b" stroke-width="2"/><path d="M692 72 h16 l-4 12 h-8Z M732 92 h16 l-4 12 h-8Z" fill="#22242b"/>';
    // the red stairs up to the loft
    o += Array.from({ length: 9 }, (_, i) => { const x = 700 - i * 16, y = 404 - i * 23; return `<rect x="${x - 34}" y="${y}" width="48" height="9" rx="2" fill="#ff3b6b" stroke="#c81d4c" stroke-width="1.5"/>`; }).join('') + '<path d="M700 404 L572 196" stroke="#c81d4c" stroke-width="5"/>';
    o += '<rect x="572" y="356" width="26" height="30" rx="3" fill="#c9884f"/><g fill="#3e9a4a"><circle cx="585" cy="318" r="18"/><circle cx="572" cy="336" r="14"/><circle cx="600" cy="334" r="14"/><circle cx="585" cy="296" r="13"/></g>';
    o += '<rect x="680" y="380" width="22" height="30" rx="3" fill="#7b62c9"/><g fill="#58b85a"><path d="M691 380 q-14 -26 -2 -40 q2 18 2 40Z"/><path d="M691 380 q14 -26 2 -40 q-2 18 -2 40Z"/></g>';
    // the loft bedroom
    o += '<rect x="310" y="26" width="236" height="170" fill="#f7a1c4"/><path d="M342 160 v-90 a34 34 0 0 1 68 0 v90Z" fill="#a9e1ef" stroke="#fff" stroke-width="6"/><path d="M376 46 v114 M342 110 h68" stroke="#fff" stroke-width="3"/>';
    o += '<rect x="428" y="54" width="70" height="56" rx="6" fill="#fff" stroke="#fff" stroke-width="5"/><rect x="433" y="59" width="60" height="46" rx="4" fill="#d6f1f7"/><rect x="424" y="112" width="80" height="10" fill="#fff"/><path d="M432 122 v38 M496 122 v38" stroke="#fff" stroke-width="5"/>';
    o += '<g data-act="bed" class="dh-tap"><rect x="334" y="146" width="202" height="30" rx="4" fill="#22242b"/><rect x="340" y="140" width="190" height="16" rx="6" fill="#ff9cc7"/><rect x="346" y="132" width="40" height="14" rx="5" fill="#fff"/><rect x="334" y="112" width="12" height="64" rx="3" fill="#22242b"/><rect x="334" y="172" width="8" height="22" fill="#22242b"/><rect x="528" y="172" width="8" height="22" fill="#22242b"/></g>';
    o += `<g data-act="lamp" class="dh-tap"><circle id="dh-glow" cx="566" cy="112" r="40" fill="#fff3a8" opacity="${lampOn ? 0.55 : 0}"/><rect x="548" y="150" width="38" height="44" rx="4" fill="#ff8fc0"/><path d="M567 150 v-26" stroke="#ff4fa0" stroke-width="4"/><path d="M552 124 h30 l-6 -20 h-18Z" fill="${lampOn ? '#fff7c2' : '#fff'}" stroke="#e5b84a" stroke-width="2" id="dh-shade"/></g>`;
    // the top tower and the big curved roof
    o += brick(234, 4, 78, 196) + win(248, 40, 22, 44) + win(278, 40, 22, 44);
    o += '<path d="M306 2 Q560 6 782 64 L776 92 Q560 32 306 24Z" fill="#3a3340"/><path d="M306 2 Q560 6 782 64" stroke="#f9c6da" stroke-width="5" fill="none"/>';
    // floors and posts, light wood like the real one
    o += slab(304, 194, 340) + slab(84, 426, 230) + slab(300, 416, 478) + slab(84, 638, 232) + slab(402, 622, 202) + slab(600, 610, 176) + slab(402, 830, 376) + slab(10, 864, 776, 26);
    o += post(400, 430, 404) + post(600, 432, 180) + post(616, 26, 392) + post(770, 26, 840) + post(306, 26, 404) + post(10, 250, 620) + post(78, 250, 620);
    if (forTexture) o += foreground(s);
    return o;
  }
  // in front of the friends: the hot tub's side, the bathtub's side and the garage doors
  function foreground(s) {
    let o = '<g data-act="hottub" class="dh-tap"><rect x="94" y="384" width="156" height="44" rx="6" fill="#36c5d6" stroke="#1f9fb0" stroke-width="3"/><rect x="100" y="378" width="144" height="12" rx="5" fill="#9ff0f7"/><rect x="150" y="372" width="50" height="16" rx="5" fill="#ff7ab3"/><g id="dh-bub" opacity="0"><circle cx="128" cy="372" r="6" fill="#fff"/><circle cx="170" cy="364" r="5" fill="#fff"/><circle cx="212" cy="370" r="7" fill="#fff"/></g></g>';
    o += '<g data-act="tub" class="dh-tap"><path d="M106 584 h112 q0 34 -26 38 h-60 q-26 -4 -26 -38Z" fill="#fff" stroke="#cfcfcf" stroke-width="2"/><path d="M118 622 l-6 14 M206 622 l6 14" stroke="#22242b" stroke-width="5" stroke-linecap="round"/><g id="dh-tubb" opacity="0"><circle cx="134" cy="580" r="7" fill="#fff" stroke="#bfe9ef"/><circle cx="160" cy="574" r="9" fill="#fff" stroke="#bfe9ef"/><circle cx="188" cy="580" r="7" fill="#fff" stroke="#bfe9ef"/></g></g>';
    const door = (x, flip) => `<g class="dh-door" style="transform-box:fill-box;transform-origin:${flip ? 'right' : 'left'} center;transform:scaleX(${s.doors ? 0.08 : 1})"><rect x="${x}" y="660" width="112" height="206" fill="#e9b97c" stroke="#b9844b" stroke-width="3"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${x + 4 + i * 18} 662 v202" stroke="#d9a466" stroke-width="2"/>`).join('')}<rect x="${x + 14}" y="676" width="84" height="26" fill="#6d4a2e"/><path d="M${x + 8} 712 h96 v146 h-96Z M${x + 8} 712 L${x + 104} 858 M${x + 104} 712 L${x + 8} 858" stroke="#c98f52" stroke-width="7" fill="none"/>
      <path d="M${flip ? x + 112 : x} 730 h${flip ? -26 : 26} M${flip ? x + 112 : x} 826 h${flip ? -26 : 26}" stroke="#2a2a30" stroke-width="7"/></g>`;
    o += `<g data-act="doors" class="dh-tap">${door(88, 0)}${door(200, 1)}</g>`;
    return o;
  }
  // the elevator car (drawn over the shaft, under the friends)
  const carY = () => ELEV.ys[st().elev];
  const carSvg = y => `<g data-act="elev" class="dh-tap" id="dh-car" transform="translate(0,${y - 832})"><rect x="320" y="716" width="80" height="116" fill="#ff7ab3" opacity=".35"/><rect x="320" y="708" width="80" height="10" fill="#22242b"/><rect x="318" y="828" width="84" height="10" fill="#22242b"/><path d="M322 716 v112 M398 716 v112" stroke="#22242b" stroke-width="4"/><circle cx="360" cy="728" r="9" fill="#fff"/><path d="M355 731 l5 -7 l5 7Z" fill="#ff3b6b" transform="${st().up ? '' : 'rotate(180 360 728)'}"/></g>`;

  // the front, for the 3D view: one picture of the house without the friends
  D.frontSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900"><defs>${defs()}</defs>${houseSvg(Object.assign({}, st(), { doors: 0 }), true)}${carSvg(carY())}</svg>`;
  const defs = () => '<pattern id="dhDots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="2" fill="#fbb6d3"/></pattern>';

  // ---------- open and close ----------
  D.open = () => {
    if (el) return;
    W.mode = 'town'; W.player.path = null;
    el = G.html('<div class="town dollhouse"></div>'); G.$('#screen').appendChild(el);
    draw();
    const P = G.P();
    if (!P.done.say_dollhouse) { P.done.say_dollhouse = 1; G.persist(); G.beep(G.T('doll.intro')); }
    else G.beep(G.T('doll.back'));
  };
  D.close = () => {
    if (!el) return;
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
    el.remove(); el = null; svg = null; W.mode = 'play'; G.hush();
  };

  function draw() {
    const s = st();
    el.innerHTML = `<button class="round-btn town-back" title="Back">⬅️</button>
      <svg class="dh-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><defs>${defs()}</defs>
      <rect x="-400" y="-200" width="2400" height="1300" fill="#fdf1e4"/><rect x="-400" y="880" width="2400" height="300" fill="#d9b48a"/>
      ${Array.from({ length: 30 }, (_, i) => `<path d="M${-400 + i * 90} 880 v320" stroke="#c9a074" stroke-width="2"/>`).join('')}
      <rect x="990" y="470" width="560" height="424" fill="#fbfaf7" stroke="#e2ddd2" stroke-width="4"/><rect x="1000" y="480" width="540" height="200" fill="#f1ece2"/><rect x="1000" y="700" width="540" height="184" fill="#f1ece2"/><rect x="990" y="682" width="560" height="16" fill="#fbfaf7" stroke="#e2ddd2" stroke-width="3"/><rect x="990" y="458" width="560" height="16" fill="#fbfaf7" stroke="#e2ddd2" stroke-width="3"/>
      <text x="1270" y="300" font-size="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="#e5468f">🌊 Moana and friends 🌺</text>
      <g transform="translate(${OX},${OY})">${houseSvg(s)}<g id="dh-carwrap">${carSvg(carY())}</g></g>
      <g id="dh-figs"></g>
      <g transform="translate(${OX},${OY})">${foreground(s)}</g>
      </svg>`;
    svg = G.$('.dh-svg', el);
    G.$('.town-back', el).onclick = () => { G.sfx.tap(); D.close(); };
    const figs = G.$('#dh-figs', svg);
    FIGS.forEach((f, i) => {
      const p = s.figs[f.id] || (s.figs[f.id] = home(i));
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'dh-fig'); g.dataset.id = f.id;
      g.innerHTML = `<g class="dh-hop"><g class="dh-body" transform="scale(${f.h / 100})">${DRAW[f.id]()}</g></g>`;
      figs.appendChild(g); place(g, p);
      dragify(g, f);
    });
    svg.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (a) act(a.dataset.act, e); });
    loop();
  }
  const place = (g, p) => { g.setAttribute('transform', `translate(${p.x},${p.y})`); g.dataset.s = p.s; };

  // ---------- dragging the friends ----------
  const toSvg = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  function dragify(g, f) {
    g.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); G.audio();
      const s = st(), p = s.figs[f.id], start = toSvg(e.clientX, e.clientY), dx = p.x - start.x, dy = p.y - start.y;
      let moved = false;
      g.parentNode.appendChild(g); g.classList.add('held'); // bring to the front
      const move = ev => {
        const q = toSvg(ev.clientX, ev.clientY);
        if (!moved && Math.hypot(q.x - start.x, q.y - start.y) < 10) return;
        if (!moved) { moved = true; G.sfx.pop(); }
        place(g, { x: q.x + dx, y: q.y + dy, s: '' });
      };
      const up = ev => {
        g.classList.remove('held');
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        if (!svg) return;
        if (!moved) { tapFig(g, f); return; }
        const q = toSvg(ev.clientX, ev.clientY), at = snap(q.x + dx, q.y + dy);
        s.figs[f.id] = at; place(g, at); G.sfx.step(2); G.persist();
        landed(f, at.s);
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
  }
  function tapFig(g, f) {
    const b = G.$('.dh-hop', g); b.classList.remove('jump'); void b.getBBox(); b.classList.add('jump');
    later(() => b.classList.remove('jump'), 700);
    if (f.id === 'pua') G.sfx.squeak(); else if (f.id === 'heihei') G.sfx.whistle(); else if (f.id === 'kitty') G.sfx.meow(); else G.sfx.boop();
    G.beep(G.T('doll.fig.' + f.id));
  }
  let lastSpot = 0;
  function landed(f, spot) {
    if (spot === 'hottub' || spot === 'tub') { G.sfx.splash(); bubbles(spot === 'tub' ? 'dh-tubb' : 'dh-bub'); }
    if (spot === 'bed') G.sfx.boing();
    if (Date.now() - lastSpot < 6000 || !G.hasLine('doll.spot.' + spot)) return;
    lastSpot = Date.now(); G.beep(G.T('doll.spot.' + spot));
  }

  // ---------- things to tap ----------
  function bubbles(id) { const b = svg && G.$('#' + id, svg); if (!b) return; b.setAttribute('opacity', 1); b.classList.add('rise'); for (let i = 0; i < 5; i++) later(G.sfx.bubble, i * 150); later(() => { b.setAttribute('opacity', 0); b.classList.remove('rise'); }, 2200); }
  function act(a, e) {
    const s = st(); G.audio();
    const burst = ch => G.burst(e.clientX, e.clientY, ch, 5);
    switch (a) {
      case 'elev': return ride();
      case 'doors': s.doors = s.doors ? 0 : 1; G.persist(); G.sfx[s.doors ? 'open' : 'close'](); G.$$('.dh-door', svg).forEach(d => { d.style.transform = `scaleX(${s.doors ? 0.08 : 1})`; }); if (s.doors && !G.P().done.say_dhdoors) { G.P().done.say_dhdoors = 1; G.beep(G.T('doll.doors')); } return;
      case 'toilet': G.sfx.flush(); return;
      case 'sink': case 'ksink': G.sfx.water(); burst('💧'); return;
      case 'tub': bubbles('dh-tubb'); return;
      case 'hottub': bubbles('dh-bub'); return;
      case 'lamp': s.lamp = s.lamp ? 0 : 1; G.persist(); G.sfx.click(); G.$('#dh-glow', svg).setAttribute('opacity', s.lamp ? 0.55 : 0); G.$('#dh-shade', svg).setAttribute('fill', s.lamp ? '#fff7c2' : '#fff'); return;
      case 'fire': s.fire = s.fire ? 0 : 1; G.persist(); if (s.fire) { G.sfx.crackle(); later(G.sfx.crackle, 700); } else G.sfx.whoosh(); G.$('#dh-fire', svg).setAttribute('opacity', s.fire ? 1 : 0); return;
      case 'stove': { const f = G.$('#dh-flame', svg), on = f.getAttribute('opacity') !== '1'; f.setAttribute('opacity', on ? 1 : 0); on ? G.sfx.sizzle() : G.sfx.click(); if (on) burst(G.pick(['🍳', '🥞', '🍲'])); return; }
      case 'fridge': { const d = G.$('#dh-fdoor', svg), open = d.getAttribute('width') !== '10'; d.setAttribute('width', open ? 10 : 52); open ? G.sfx.open() : G.sfx.close(); if (open) burst(G.pick(['🥛', '🍓', '🧀', '🥕'])); return; }
      case 'grill': G.sfx.sizzle(); burst(G.pick(['🌭', '🍔', '🌽', '💨'])); return;
      case 'mill': s.mill = s.mill ? 0 : 1; G.persist(); G.sfx.motor(0.8); return;
      case 'pouf': G.sfx.boing(); return;
      case 'laptop': G.sfx.click(); burst(G.pick(['💻', '📧', '⭐'])); return;
      case 'sofa': G.sfx.boing(); return;
      case 'bed': G.sfx.boing(); burst('💤'); return;
    }
  }
  // the elevator goes up to the top, then back down, and carries whoever is standing in it
  let riding = false;
  function ride() {
    if (riding) return;
    const s = st(), from = s.elev;
    let to = from + (s.up ? 1 : -1);
    if (to > 2 || to < 0) { s.up = s.up ? 0 : 1; to = from + (s.up ? 1 : -1); }
    const y0 = ELEV.ys[from], y1 = ELEV.ys[to];
    const riders = FIGS.filter(f => (s.figs[f.id] || {}).s === 'elev').map(f => [f, G.$(`.dh-fig[data-id="${f.id}"]`, svg)]);
    riding = true; G.sfx.motor(1.4); G.sfx.chime();
    const car = G.$('#dh-car', svg), t0 = performance.now(), ms = 1400;
    const step = now => {
      if (!svg) return;
      const u = Math.min(1, (now - t0) / ms), k = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, y = y0 + (y1 - y0) * k;
      car.setAttribute('transform', `translate(0,${y - 832})`);
      for (const [f, g] of riders) place(g, { x: s.figs[f.id].x, y: y + OY, s: 'elev' });
      if (u < 1) requestAnimationFrame(step);
      else {
        s.elev = to; if (to === 2 || to === 0) s.up = to === 0 ? 1 : 0;
        for (const [f] of riders) s.figs[f.id].y = y1 + OY;
        riding = false; G.sfx.doorbell(); G.persist();
        G.$('#dh-carwrap', svg).innerHTML = carSvg(carY());
        if (riders.length) G.beep(G.T('doll.elev.' + ['down', 'mid', 'up'][to]));
      }
    };
    requestAnimationFrame(step);
  }
  // the treadmill belt, and whoever is running on it
  function loop() {
    const t = performance.now() / 1000, s = st();
    if (svg) {
      const belt = G.$('#dh-belt', svg); if (belt) belt.setAttribute('transform', s.mill ? `translate(${-((t * 40) % 9)},0)` : '');
      for (const f of FIGS) {
        const p = s.figs[f.id]; if (!p) continue;
        const g = G.$(`.dh-fig[data-id="${f.id}"]`, svg); if (!g || g.classList.contains('held')) continue;
        const b = G.$('.dh-body', g);
        const run = s.mill && p.s === 'mill', sleep = p.s === 'bed';
        b.setAttribute('transform', `translate(0,${run ? -Math.abs(Math.sin(t * 12)) * 6 : 0}) scale(${f.h / 100})${sleep ? ' rotate(-80)' : ''}`);
      }
      raf = requestAnimationFrame(loop);
    }
  }
})();
