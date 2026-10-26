// Cartoon portraits of the family, drawn from their photos. Each is a 100 x 100 SVG used as an image.
(() => {
  const OUT = 'stroke="#2d2250" stroke-width="2"';
  const eyes = (y, dx, rx, ry, col) => [50 - dx, 50 + dx].map(x =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}"/><circle cx="${x + rx * 0.35}" cy="${y - ry * 0.4}" r="${rx * 0.35}" fill="#fff"/>`).join('');
  const cheeks = y => `<ellipse cx="33" cy="${y}" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/><ellipse cx="67" cy="${y}" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/>`;
  const brows = (y, col, w) => `<path d="M${36 - w} ${y + 1} Q${40} ${y - 3} ${44} ${y}" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M56 ${y} Q60 ${y - 3} ${64 + w} ${y + 1}" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const head = (skin, rx = 25, ry = 28, cy = 50, ears = true) => (ears ? `<ellipse cx="25" cy="${cy + 2}" rx="5" ry="7" fill="${skin}" ${OUT}/><ellipse cx="75" cy="${cy + 2}" rx="5" ry="7" fill="${skin}" ${OUT}/>` : '') + `<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}" ${OUT}/>`;
  const nose = (y, skin) => `<path d="M50 ${y - 5} Q47 ${y + 1} 50 ${y + 2}" stroke="#c98a6b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const smile = y => `<path d="M40 ${y} Q50 ${y + 11} 60 ${y} Z" fill="#7a2a3a" ${OUT} stroke-linejoin="round"/><path d="M42 ${y + 0.5} L58 ${y + 0.5} L57 ${y + 3} L43 ${y + 3} Z" fill="#fff"/>`;
  const svg = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${s}</svg>`);

  // Mama: long straight black hair with side-swept bangs, warm light skin, big smile
  const mamaSkin = '#f2cfae';
  const mama = svg(
    `<path d="M22 46 Q18 12 50 12 Q82 12 78 46 L84 100 L16 100 Z" fill="#17121a" ${OUT}/>` +
    `<path d="M34 86 Q50 80 66 86 L74 100 L26 100 Z" fill="#26222e"/>` +
    `<rect x="44" y="72" width="12" height="12" fill="${mamaSkin}"/>` +
    head(mamaSkin, 24, 27, 50, false) +
    `<path d="M25 52 Q24 18 50 17 Q77 18 75 50 Q72 30 56 25 Q46 32 25 52 Z" fill="#17121a" ${OUT} stroke-linejoin="round"/>` +
    `<path d="M26 44 Q22 60 25 76 L20 76 Q16 56 22 42 Z M75 42 Q79 60 76 76 L81 76 Q85 56 78 40 Z" fill="#17121a"/>` +
    brows(42, '#17121a', 0) + eyes(50, 10, 3.6, 2.8, '#2a1a14') + cheeks(60) + nose(57) + smile(64));

  // Baba: bald on top with short dark hair at the sides, short brown beard, big toothy smile
  const babaSkin = '#f4d1bb';
  const baba = svg(
    `<path d="M20 100 Q22 82 50 80 Q78 82 80 100 Z" fill="#26324a" ${OUT}/>` +
    head(babaSkin, 25, 30, 48) +
    `<path d="M25 46 Q25 30 30 26 L32 44 Z M75 46 Q75 30 70 26 L68 44 Z" fill="#5a3d2b"/>` +
    `<path d="M38 24 Q46 21 52 23" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>` +
    `<path d="M26 52 Q27 80 50 80 Q73 80 74 52 Q70 66 60 66 Q50 63 40 66 Q30 66 26 52 Z" fill="#8a5a3c" ${OUT} stroke-linejoin="round"/>` +
    `<path d="M40 63 Q50 58 60 63" stroke="#8a5a3c" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    brows(39, '#4a3020', 1) + eyes(46, 10, 3.2, 2.6, '#4a5a6a') + nose(55) + smile(64));

  // Mira: light brown hair to her shoulders, parted to the side, big grin
  const miraSkin = '#fbe0cc';
  const mira = svg(
    `<path d="M22 50 Q18 14 50 14 Q82 14 78 50 L80 86 L20 86 Z" fill="#a8804f" ${OUT}/>` +
    `<path d="M24 100 Q26 84 50 82 Q74 84 76 100 Z" fill="#c9a3ff" ${OUT}/>` +
    head(miraSkin, 23, 26, 52, false) +
    `<path d="M27 48 Q28 22 46 20 Q72 18 74 46 Q64 30 52 30 Q44 38 27 48 Z" fill="#a8804f" ${OUT}/>` +
    brows(44, '#8a6638', -1) + eyes(52, 10, 3.6, 3.6, '#5a3a22') + cheeks(61) + nose(58) + smile(65));

  // Maia: dark brown wavy hair in two pigtails, big dark eyes, little smile
  const maiaSkin = '#f2d0b0';
  const maia = svg(
    `<path d="M24 34 Q8 30 10 50 Q12 60 20 54 Q18 44 24 40 Z M76 34 Q92 30 90 50 Q88 60 80 54 Q82 44 76 40 Z" fill="#3a2518" ${OUT}/>` +
    `<circle cx="24" cy="36" r="3.5" fill="#4cd97b" ${OUT}/><circle cx="76" cy="36" r="3.5" fill="#4cd97b" ${OUT}/>` +
    `<path d="M26 100 Q28 86 50 84 Q72 86 74 100 Z" fill="#ffb6d5" ${OUT}/>` +
    head(maiaSkin, 24, 26, 56) +
    `<path d="M26 54 Q24 26 50 25 Q76 26 74 54 Q70 38 60 36 Q56 42 50 38 Q44 43 38 37 Q30 40 26 54 Z" fill="#3a2518" ${OUT} stroke-linejoin="round"/>` +
    brows(47, '#3a2518', -1) + eyes(56, 10, 4.2, 4.4, '#22140e') + cheeks(65) + nose(63) +
    `<path d="M45 70 Q50 74 55 70" stroke="#a03a4a" stroke-width="2.4" fill="#d9707f" stroke-linecap="round"/>`);

  G.AVATARS = { mama, baba, mira, maia };
  // crew id -> portrait ('kid' and 'sis' depend on who is playing)
  G.avatarFor = (id, p) => {
    const kid = (p && G.FAMILY.kid(p.id)) || G.FAMILY.kids[0];
    const who = id === 'kid' ? kid && kid.id : id === 'sis' ? kid && G.FAMILY.kids.find(k => k.name === kid.sis)?.id : id;
    return G.AVATARS[who] || null;
  };
})();
