// A walk around the neighborhood. With the family key, the map is the real one: the streets
// around our house traced from a street map, and the real places at their real spots (sealed in
// data/town.bin, like the photos). Without the key it is a made-up little town with the same places.
// Each place has its own scene, drawn to look like the real place, with something to do there.
(() => {
  const W = G.W;
  const Tn = G.town = {};
  let el = null, timers = [], raf = 0;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clear = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EMO = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  const sticker = id => { const P = G.P(); if (!P.done['town_' + id]) { P.done['town_' + id] = 1; G.addStars(3); G.persist(); } G.Q.onTown(id); };
  const win = (id) => { G.sfx.great(); G.confetti(50); sticker(id); };

  // ---------- the map ----------
  // places: home, pool, play (the little park), park (the big park), school (Mira's), kinder (Maia's, a drive away), library
  const ICON = { home: '🏠', pool: '🏊', play: '🛝', park: '🌳', school: '🏫', kinder: '🧸', library: '📚' };
  const SUB = { school: 'Mira\'s school', kinder: 'Maia\'s school' };
  const FAKE = {
    w: 1000, h: 760,
    roads: [{ k: 'major', p: [[0, 380], [1000, 380]] }, { k: 'major', p: [[500, 0], [500, 760]] }, { k: 'street', p: [[200, 120], [200, 640], [800, 640], [800, 120], [200, 120]] }, { k: 'street', p: [[350, 380], [350, 640]] }],
    areas: [{ k: 'park', p: [[560, 180], [760, 180], [760, 340], [560, 340]] }, { k: 'park', p: [[230, 420], [330, 420], [330, 520], [230, 520]] }, { k: 'school', p: [[560, 560], [760, 560], [760, 700], [560, 700]] }],
    places: { home: [420, 450], pool: [300, 300], play: [280, 470], park: [660, 260], school: [660, 630], library: [380, 140], kinder: [975, 560] },
    names: { pool: 'Pool', play: 'Little Park', park: 'Big Park', school: 'School', kinder: 'Preschool', library: 'Library' },
  };
  const data = () => {
    const d = G.townData; if (!d) return FAKE;
    const pl = d.places;
    return { w: d.w, h: d.h, roads: d.roads, areas: d.areas, names: Object.assign({}, FAKE.names, { pool: d.names.pool, play: d.names.play, park: d.names.park, school: d.names.school, kinder: d.names.kinder, library: d.names.library }),
      places: { home: pl.home, pool: pl.pool, play: pl.play, park: pl.park, school: pl.school, library: pl.library, kinder: pl.kinder } };
  };
  const name = id => data().names[id] || '';
  function mapSvg(d) {
    const pts = p => p.map(q => q[0] + ',' + q[1]).join(' ');
    const AC = { park: '#86d26f', field: '#9edc84', school: '#ecd9b0', shops: '#ead9cc', library: '#ead9cc' };
    let s = `<svg class="town-svg" viewBox="0 0 ${d.w} ${d.h}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect x="-500" y="-500" width="${d.w + 1000}" height="${d.h + 1000}" fill="#c2e3a0"/>`;
    for (const k of ['shops', 'school', 'library', 'park', 'field']) for (const a of d.areas) if (a.k === k) s += `<polygon points="${pts(a.p)}" fill="${AC[k]}"/>`;
    const RW = { major: 13, mid: 10, street: 5.5, alley: 4 }, RC = { major: '#a7acb4', mid: '#b6bac1', street: '#e7e2d8', alley: '#ddd5c6' };
    for (const k of ['alley', 'street', 'mid', 'major']) for (const r of d.roads) if (r.k === k) s += `<polyline points="${pts(r.p)}" fill="none" stroke="${RC[k]}" stroke-width="${RW[k]}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // trees along the big roads
    let n = 0;
    for (const r of d.roads) if (r.k === 'major') for (let i = 1; i < r.p.length; i++) {
      const [x1, y1] = r.p[i - 1], [x2, y2] = r.p[i], L = Math.hypot(x2 - x1, y2 - y1);
      for (let t = 0; t < L; t += 46) { const u = t / L, nx = -(y2 - y1) / L, ny = (x2 - x1) / L, side = (n++ % 2 ? 1 : -1) * 15; s += `<circle cx="${x1 + (x2 - x1) * u + nx * side}" cy="${y1 + (y2 - y1) * u + ny * side}" r="6.5" fill="${n % 3 ? '#5fae52' : '#4f9a48'}"/>`; }
    }
    // the houses near ours
    const [hx, hy] = d.places.home;
    s += `<g transform="translate(${hx},${hy})"><circle r="30" fill="#ff6fb1" opacity=".18"/></g>`;
    return s + '</svg>';
  }
  Tn.open = () => {
    if (el) return;
    W.mode = 'town'; W.player.path = null;
    el = G.html('<div class="town"></div>'); G.$('#screen').appendChild(el);
    map(true);
  };
  Tn.close = () => {
    if (!el) return;
    clear(); el.remove(); el = null; W.mode = 'play';
    G.beep(G.T('town.home')); G.Q.onTownClose();
  };
  let kidAt = 'home';
  function map(first) {
    clear(); kidAt = 'home';
    const d = data();
    el.className = 'town map';
    el.innerHTML = `<div class="town-frame" style="aspect-ratio:${d.w}/${d.h}">${mapSvg(d)}
      ${Object.entries(d.places).map(([id, [x, y]]) => { if (id === 'pool' && G.townData) { x -= 115; y -= 10; } return [id, [x, y]]; }).map(([id, [x, y]]) => `<button class="place ${id}" style="left:${x / d.w * 100}%;top:${y / d.h * 100}%" data-go="${id}"><span>${ICON[id]}</span>${id === 'home' ? '<b>Home</b>' : `<b>${esc(name(id))}</b>`}${SUB[id] ? `<em>${SUB[id]}</em>` : ''}${id !== 'home' && G.P().done['town_' + id] ? '<i>⭐</i>' : ''}${id === 'kinder' ? '<u>🚗</u>' : ''}</button>`).join('')}</div>`;
    const frame = G.$('.town-frame', el), kid = kidPic(84); kid.className = 'town-kid'; frame.appendChild(kid);
    const [hx, hy] = d.places.home; kid.style.left = hx / d.w * 100 + '%'; kid.style.top = hy / d.h * 100 + '%';
    el.onclick = e => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      G.sfx.tap();
      const id = b.dataset.go;
      if (id === 'home') return Tn.close();
      el.onclick = null;
      if (id === 'kinder') { // a car ride
        kid.style.opacity = '0'; const car = G.html('<div class="town-car">🚙</div>'); car.style.left = kid.style.left; car.style.top = kid.style.top; frame.appendChild(car);
        G.sfx.honk(); G.beep(G.T('town.drive'));
        requestAnimationFrame(() => { car.style.left = b.style.left; car.style.top = b.style.top; });
        later(() => scene(id), 2300); return;
      }
      kid.style.left = b.style.left; kid.style.top = b.style.top; kid.classList.add('hop');
      later(() => scene(id), 1100);
    };
    if (first) G.beep(G.T('town.map'));
  }
  const kidPic = (size = 110) => { const p = W.player; return G.kidPicture(p.who, p.costume, size); };

  // ---------- scenes: SVG pictures with things to tap ----------
  // every scene is 1600 x 900; the kid is an image we slide around
  const sky = (top = '#8fd3ff', bot = '#d7f0ff') => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#sk)"/>`;
  const hills = (y = 470) => `<path d="M0 ${y} Q180 ${y - 120} 380 ${y - 40} T760 ${y - 70} T1140 ${y - 30} T1600 ${y - 90} V900 H0Z" fill="#a9b98a"/><path d="M0 ${y + 30} Q260 ${y - 50} 520 ${y + 10} T1060 ${y} T1600 ${y - 10} V900 H0Z" fill="#94ad74"/>`;
  const cloud = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="70" ry="26"/><ellipse cx="-30" cy="-18" rx="34" ry="26"/><ellipse cx="22" cy="-22" rx="40" ry="30"/></g>`;
  const tree = (x, y, s = 1, c = '#5fae52') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-10" width="18" height="70" fill="#8a5a3c"/><circle cx="0" cy="-40" r="56" fill="${c}"/><circle cx="-26" cy="-60" r="30" fill="#78c466"/></g>`;
  const palm = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-6 0 Q-14 -120 6 -230 L14 -230 Q0 -120 8 0Z" fill="#9b7a52"/>${[-150, -110, -60, -20, 30, 70].map(a => `<path d="M10 -230 q${Math.cos(a * Math.PI / 180) * 70} ${Math.sin(a * Math.PI / 180) * 50 - 10} ${Math.cos(a * Math.PI / 180) * 120} ${Math.sin(a * Math.PI / 180) * 90 + 40}" stroke="#4f9a48" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
  const emo = (ch, x, y, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" style="font-family:${EMO}" ${extra}>${ch}</text>`;
  const label = (txt, x, y, size, col = '#fff', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="${col}" ${extra}>${esc(txt)}</text>`;
  function frame(id, cls, svg, intro, back) {
    clear(); el.className = 'town scene ' + cls;
    el.innerHTML = `<button class="round-btn town-back" title="Back">⬅️</button><svg class="scene-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${svg}<image id="kid" width="170" height="170" x="0" y="0"/></svg><div class="town-pol hidden"></div>`;
    G.$('.town-back', el).onclick = () => { G.sfx.tap(); G.hush(); (back || map)(); };
    el.onclick = null;
    const k = G.$('#kid', el); k.setAttribute('href', kidPic(170).toDataURL()); k.style.pointerEvents = 'none';
    const ids = G.photosFor(id);
    if (ids.length) G.photo(ids[0]).then(u => { const p = el && G.$('.town-pol', el); if (u && p) { p.innerHTML = `<img src="${u}" alt="">`; p.classList.remove('hidden'); p.onclick = () => p.classList.toggle('big'); } });
    G.beep(G.T(intro || ('town.' + id)));
    return G.$('.scene-svg', el);
  }
  // slide the kid to (x, y) (her feet), with an optional little arc
  const kidPos = { x: 0, y: 0 };
  function moveKid(x, y, ms = 700, arc = 0) {
    const k = el && G.$('#kid', el); if (!k) return Promise.resolve();
    const x0 = kidPos.x, y0 = kidPos.y, t0 = performance.now();
    return new Promise(res => {
      const step = now => {
        const u = Math.min(1, (now - t0) / ms), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        kidPos.x = x0 + (x - x0) * e; kidPos.y = y0 + (y - y0) * e - Math.sin(u * Math.PI) * arc;
        k.setAttribute('x', kidPos.x - 85); k.setAttribute('y', kidPos.y - 160);
        if (u < 1) raf = requestAnimationFrame(step); else { kidPos.y = y; res(); }
      };
      raf = requestAnimationFrame(step);
    });
  }
  const putKid = (x, y) => { kidPos.x = x; kidPos.y = y; const k = G.$('#kid', el); k.setAttribute('x', x - 85); k.setAttribute('y', y - 160); };
  const tapOn = (svg, sel, fn) => G.$$(sel, svg).forEach(n => n.addEventListener('click', e => { e.stopPropagation(); fn(n, e); }));
  const burstAt = (e, ch, n = 6) => G.burst(e.clientX, e.clientY, ch, n);

  function scene(id) {
    if (!el) return;
    const SC = { pool, play, park, school, kinder, library };
    SC[id]();
  }

  // ----- our pool: the association pool with its spa under a white pergola, the cabana and palms -----
  function pool() {
    const toys = ['🛟', '🦆', '🏐', '🐬', '🦩'];
    const svg = frame('pool', 'pool', `${sky()}${cloud(300, 110)}${cloud(1250, 80, 0.8)}
      <rect y="300" width="1600" height="600" fill="#e8d5b5"/>
      ${palm(120, 330, 1)}${palm(1480, 320, 1.1)}${palm(1320, 330, 0.8)}
      <g><rect x="980" y="170" width="430" height="170" fill="#e9d6b0"/><path d="M955 175 L1195 95 L1435 175Z" fill="#a8603e"/><rect x="1150" y="230" width="90" height="110" fill="#6a7c8c"/><rect x="1020" y="220" width="90" height="70" fill="#bfe6ff"/><rect x="1280" y="220" width="90" height="70" fill="#bfe6ff"/></g>
      <path d="M0 300 H1600" stroke="#2e2e36" stroke-width="6"/>${Array.from({ length: 40 }, (_, i) => `<line x1="${i * 40 + 10}" y1="250" x2="${i * 40 + 10}" y2="300" stroke="#2e2e36" stroke-width="4"/>`).join('')}<line x1="0" y1="255" x2="1600" y2="255" stroke="#2e2e36" stroke-width="5"/>
      <g class="spa-tap" style="cursor:pointer"><ellipse cx="220" cy="560" rx="150" ry="70" fill="#fff"/><ellipse cx="220" cy="560" rx="125" ry="55" fill="#5bc8f0"/>${[0, 1, 2, 3].map(i => `<rect x="${80 + i * 90}" y="380" width="22" height="140" fill="#fbfaf5"/>`).join('')}<rect x="60" y="370" width="320" height="22" fill="#fbfaf5"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${70 + i * 52}" y="356" width="14" height="14" fill="#fbfaf5"/>`).join('')}</g>
      <g class="water"><rect x="450" y="420" width="900" height="380" rx="20" fill="#fff"/><rect x="474" y="442" width="852" height="336" rx="12" fill="#4fc0ef"/>
        ${Array.from({ length: 7 }, (_, i) => `<path d="M${500 + i * 120} 500 q30 -14 60 0 t60 0" stroke="#bfeeff" stroke-width="6" fill="none" opacity=".7"/>`).join('')}
        ${toys.map((t, i) => `<g class="floaty" data-i="${i}" style="cursor:pointer">${emo(t, 560 + i * 170, [560, 700, 520, 690, 600][i], 92)}</g>`).join('')}</g>
      ${[[1450, 470], [1470, 600]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-80" y="-14" width="160" height="28" rx="10" fill="#fff"/><rect x="-80" y="-14" width="50" height="28" rx="8" fill="#eee"/></g>`).join('')}`);
    putKid(1480, 840);
    let left = toys.length;
    tapOn(svg, '.floaty', (f, e) => {
      if (f.dataset.gone) return; f.dataset.gone = 1;
      const t = f.querySelector('text'), x = +t.getAttribute('x'), y = +t.getAttribute('y') + 60;
      G.sfx.splash(); moveKid(x, y, 650, 60).then(() => { f.style.opacity = '0'; burstAt(e, '💦'); if (!--left) later(() => { win('pool'); G.beep(G.T('town.poolDone')); }, 400); });
    });
    tapOn(svg, '.spa-tap', () => { for (let i = 0; i < 5; i++) later(G.sfx.bubble, i * 120); });
  }

  // ----- the little park by our house: a bowl of lawn, wood chips, a green shade over the play set -----
  function play() {
    const nm = G.townData ? name('play') : '';
    const svg = frame('play', 'play', `${sky()}${cloud(1200, 110)}${hills(430)}
      <rect y="470" width="1600" height="430" fill="#8fd16a"/>${tree(140, 520, 1.1)}${tree(1480, 500, 1.2, '#4f9a48')}${tree(1330, 560, 0.8)}
      <ellipse cx="760" cy="740" rx="560" ry="150" fill="#c9a46a"/>
      <g><path d="M380 330 L760 240 L1140 330 L1100 360 L420 360Z" fill="#1f8f7f"/>${[430, 760, 1090].map(x => `<rect x="${x - 7}" y="300" width="14" height="440" fill="#4a4f63"/>`).join('')}</g>
      <g class="slide-set" style="cursor:pointer"><rect x="470" y="470" width="150" height="200" fill="#e9c27a" stroke="#6b4a2a" stroke-width="6"/><path d="M470 470 L545 420 L620 470Z" fill="#1f8f7f"/>${[0, 1, 2, 3].map(i => `<line x1="440" y1="${500 + i * 45}" x2="470" y2="${500 + i * 45}" stroke="#6b4a2a" stroke-width="6"/>`).join('')}<path d="M620 520 Q720 560 760 720 L810 720 Q770 540 650 490Z" fill="#3fb06a" stroke="#257a45" stroke-width="5"/></g>
      <g class="swing-set" style="cursor:pointer"><path d="M960 720 L1020 430 L1080 720 M1220 720 L1280 430 L1340 720 M1020 430 H1280" stroke="#4a4f63" stroke-width="14" fill="none"/><g class="rope"><line x1="1150" y1="432" x2="1150" y2="640" stroke="#8a5a3c" stroke-width="6"/><rect x="1110" y="636" width="80" height="16" rx="6" fill="#ff6f6f"/></g></g>
      ${nm ? `<g transform="translate(1360,820)"><rect x="-170" y="-50" width="340" height="80" rx="16" fill="#8b7355"/><rect x="-158" y="-40" width="316" height="60" rx="10" fill="#a58b68"/>${label(nm.toUpperCase(), 0, 3, 30, '#fff')}</g>` : ''}`);
    putKid(1060, 800);
    let n = 0, busy = false;
    const fun = () => { busy = false; if (++n === 3) { win('play'); G.beep(G.T('town.playDone')); } };
    tapOn(svg, '.slide-set', () => { if (busy) return; busy = true; G.sfx.step(2); moveKid(545, 470, 600).then(() => { G.sfx.whoosh(); return moveKid(790, 760, 700); }).then(() => { G.sfx.boing(); fun(); }); });
    tapOn(svg, '.swing-set', () => {
      if (busy) return; busy = true;
      moveKid(1150, 660, 500).then(() => { const r = G.$('.rope', svg), k = G.$('#kid', svg); r.style.transformOrigin = '1150px 432px'; k.style.transformOrigin = '1150px 432px'; r.classList.add('swinging'); k.classList.add('swinging'); [0, 1, 2].forEach(i => later(G.sfx.whoosh, i * 800)); later(() => { r.classList.remove('swinging'); k.classList.remove('swinging'); moveKid(1150, 840, 400).then(fun); }, 2500); });
    });
  }

  // ----- the big park: a wide lawn, a curvy path, the round stone sign, red shade sails and orange tube slides -----
  function park() {
    const nm = G.townData ? name('park') : '';
    const svg = frame('park', 'park', `${sky()}${cloud(380, 120)}${cloud(1100, 90, 0.9)}${hills(380)}
      <rect y="420" width="1600" height="480" fill="#8fd16a"/>
      <path d="M-20 900 C300 700 200 560 620 520 S1200 470 1620 520" stroke="#eae6dc" stroke-width="40" fill="none"/>
      ${tree(260, 470, 0.9)}${tree(1500, 460, 1.1, '#4f9a48')}${tree(820, 450, 0.7)}
      <g transform="translate(1180,500)"><rect x="-210" y="40" width="420" height="160" rx="20" fill="#5a5a66" opacity=".25"/>
        <path d="M-220 -40 L-20 -10 L-170 60Z M-20 -60 L200 -30 L40 50Z M60 20 L230 60 L120 110Z" fill="#c4553a" opacity=".92"/>${[-200, -20, 210].map(x => `<rect x="${x - 6}" y="-60" width="12" height="260" fill="#4a3a32"/>`).join('')}
        <rect x="-120" y="70" width="190" height="110" fill="#d8b98a" stroke="#6b4a2a" stroke-width="5"/><path d="M-120 70 L-25 20 L70 70Z" fill="#a8603e"/>
        <g class="tube" style="cursor:pointer"><path d="M70 100 C170 100 180 180 120 200 C60 220 120 260 200 250" stroke="#ef7a2a" stroke-width="44" fill="none" stroke-linecap="round"/><path d="M70 100 C170 100 180 180 120 200 C60 220 120 260 200 250" stroke="#ff9f43" stroke-width="30" fill="none" stroke-linecap="round"/></g></g>
      <g transform="translate(330,570) scale(.8)"><ellipse cx="0" cy="40" rx="190" ry="26" fill="#6f6658" opacity=".3"/><path d="M-180 30 Q-180 -60 0 -70 Q180 -60 180 30Z" fill="#a8977f"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${-150 + (i % 6) * 60}" cy="${-30 + Math.floor(i / 6) * 40}" rx="28" ry="16" fill="${i % 3 ? '#b8a68c' : '#958470'}"/>`).join('')}${nm ? label(nm.toUpperCase(), 0, -8, 36, '#fdf6e8', 'stroke="#5a4a3a" stroke-width="1.5"') : ''}</g>
      ${[0, 1, 2, 3, 4].map(i => `<g class="fly f${i}" style="cursor:pointer">${emo('🦋', [560, 720, 900, 620, 1000][i], [540, 660, 600, 700, 720][i], 74)}</g>`).join('')}`);
    putKid(1000, 800);
    let left = 5;
    tapOn(svg, '.fly', (f, e) => { if (f.dataset.gone) return; f.dataset.gone = 1; burstAt(e, '✨'); f.style.opacity = '0'; G.sfx.sparkle(); if (!--left) later(() => { win('park'); G.beep(G.T('town.parkDone')); }, 500); });
    tapOn(svg, '.tube', () => { G.sfx.step(3); moveKid(1260, 590, 600).then(() => { G.sfx.whoosh(); return moveKid(1400, 760, 900, -20); }).then(() => G.sfx.boing()); });
  }

  // ----- Mira's school: tan stucco wings, red metal roofs and striped awnings, a tall entry with the star flag, the boulder sign -----
  function school() {
    const nm = G.townData ? name('school') : 'SCHOOL';
    const grades = G.shuffle(['K', '1', '2', '3']), doors = [250, 470, 1130, 1350];
    const wing = x0 => `<rect x="${x0}" y="340" width="520" height="230" fill="#e6d6b4"/><path d="M${x0 - 20} 345 L${x0 + 40} 290 H${x0 + 480} L${x0 + 540} 345Z" fill="#9b2f2f"/>${Array.from({ length: 14 }, (_, i) => `<line x1="${x0 + 40 + i * 32}" y1="292" x2="${x0 + 20 + i * 36}" y2="344" stroke="#7d2222" stroke-width="3"/>`).join('')}<rect x="${x0}" y="540" width="520" height="30" fill="#c9b893"/>`;
    const awning = (x, y) => `<g transform="translate(${x},${y})">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i * 22} 0 h22 l6 34 h-22Z" fill="${i % 2 ? '#fff' : '#c0283a'}"/>`).join('')}</g><rect x="${x + 6}" y="${y + 36}" width="120" height="70" fill="#5a6a70" stroke="#e8e1d0" stroke-width="6"/>`;
    const svg = frame('school', 'school', `${sky()}${cloud(220, 100)}${cloud(1400, 130, 0.8)}${hills(400)}
      ${tree(60, 520, 0.9)}${tree(1560, 520, 1)}
      ${wing(60)}${wing(1020)}${awning(110, 380)}${awning(1380, 380)}
      <g><rect x="600" y="190" width="400" height="380" fill="#bdb4a2"/><rect x="600" y="190" width="400" height="18" fill="#a59c8a"/>
        <g transform="translate(640,240)"><rect width="110" height="110" fill="#2a3f8f"/>${[0, 1, 2].map(i => `<path d="M0 ${60 + i * 16} Q30 ${48 + i * 16} 55 ${60 + i * 16} T110 ${60 + i * 16}" stroke="#fff" stroke-width="7" fill="none"/>`).join('')}<path d="M70 12 l8 18 20 2 -15 13 5 20 -18 -11 -18 11 5 -20 -15 -13 20 -2Z" fill="#fff"/></g>
        ${label(nm.length > 18 ? nm.toUpperCase().split(' ').slice(0, 2).join(' ') : nm.toUpperCase(), 870, 285, 34, '#fff')}${nm.length > 18 ? label('ELEMENTARY SCHOOL', 870, 325, 22, '#fff') : ''}
        <path d="M590 430 H1010 L1000 452 H600Z" fill="#3c3f47"/>${[620, 980].map(x => `<rect x="${x - 7}" y="450" width="14" height="120" fill="#3c3f47"/>`).join('')}
        ${Array.from({ length: 16 }, (_, i) => `<line x1="${660 + i * 18}" y1="480" x2="${660 + i * 18}" y2="570" stroke="#4a4f5a" stroke-width="5"/>`).join('')}<line x1="650" y1="482" x2="950" y2="482" stroke="#4a4f5a" stroke-width="6"/>
        <g class="bell" style="cursor:pointer">${emo('🔔', 800, 410, 54)}</g></g>
      ${doors.map((x, i) => `<g class="door" data-g="${grades[i]}" style="cursor:pointer"><rect class="leaf" x="${x - 45}" y="430" width="90" height="140" fill="#7a2a2a" stroke="#e8e1d0" stroke-width="6"/><circle cx="${x + 28}" cy="505" r="6" fill="#d9a441"/><circle cx="${x}" cy="398" r="30" fill="#fff8d6" stroke="#2a3f8f" stroke-width="5"/>${label(grades[i], x, 410, 34, '#2a3f8f')}</g>`).join('')}
      <rect y="570" width="1600" height="330" fill="#8fd16a"/><path d="M640 570 H960 L1100 900 H500Z" fill="#d9d4c8"/>
      <g transform="translate(1270,620)"><rect x="-4" y="-260" width="8" height="260" fill="#c9ccd3"/><g transform="translate(4,-255)">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect y="${i * 10}" width="110" height="10" fill="${i % 2 ? '#fff' : '#d22'}"/>`).join('')}<rect width="46" height="40" fill="#2a3f8f"/></g></g>
      <g transform="translate(300,650) scale(.75)"><path d="M-230 70 Q-250 -40 -150 -70 Q0 -100 160 -70 Q250 -40 230 70Z" fill="#9c9488"/>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${-180 + (i % 5) * 90}" cy="${-30 + Math.floor(i / 5) * 60}" rx="38" ry="20" fill="${i % 2 ? '#aaa194' : '#8e8679'}"/>`).join('')}${label(nm.toUpperCase().split(' ').slice(0, 2).join(' '), 0, -6, 40, '#4a443c')}${nm.length > 18 ? label('ELEMENTARY SCHOOL', 0, 38, 24, '#4a443c') : ''}</g>
      ${tree(1500, 800, 0.8)}`);
    putKid(1060, 780);
    let found = false;
    tapOn(svg, '.bell', () => G.sfx.doorbell());
    tapOn(svg, '.door', (d) => {
      const g = d.dataset.g, leaf = d.querySelector('.leaf'), x = +leaf.getAttribute('x') + 45;
      moveKid(x, 600, 600).then(() => {
        G.sfx.open(); leaf.setAttribute('fill', '#3b3f4a');
        if (!d.dataset.peek) { d.dataset.peek = 1; d.insertAdjacentHTML('beforeend', emo(g === 'K' ? '🍎' : G.pick(['📐', '📏', '🌍', '🔬']), x, 480, 50) + emo(g === 'K' ? '🧸' : '✏️', x, 535, 40)); }
        if (g === 'K') { if (!found) { found = true; G.beep(G.T('town.schoolK')); win('school'); } else G.beep(G.T('town.schoolK')); }
        else G.beep(G.T('town.grade' + g));
      });
    });
  }

  // ----- Maia's school: a low gray building with a red tile roof, a red door with an arched window, a red chair, and a bright playground -----
  function kinder() {
    const nm = G.townData ? name('kinder') : '';
    const svg = frame('kinder', 'kinder', `${sky()}${cloud(350, 110)}${cloud(1200, 80, 0.9)}${hills(410)}
      ${tree(120, 470, 1.2, '#4f9a48')}${tree(980, 450, 1, '#5fae52')}${palm(1540, 450, 0.9)}
      <rect y="560" width="1600" height="340" fill="#8fd16a"/>
      <g><rect x="160" y="350" width="800" height="250" fill="#d6d9dc"/><rect x="160" y="350" width="800" height="250" fill="none" stroke="#fbfbfb" stroke-width="10"/>
        <path d="M120 360 L200 270 H920 L1000 360Z" fill="#b8452f"/>${Array.from({ length: 4 }, (_, r) => Array.from({ length: 26 }, (_, i) => `<path d="M${150 + i * 32 + r * 12} ${290 + r * 18} q16 14 32 0" stroke="#8f3020" stroke-width="4" fill="none"/>`).join('')).join('')}
        ${[230, 360, 720, 850].map(x => `<rect x="${x}" y="420" width="90" height="90" fill="#bfe6ff" stroke="#fff" stroke-width="8"/><line x1="${x + 45}" y1="420" x2="${x + 45}" y2="510" stroke="#fff" stroke-width="5"/>`).join('')}
        <g class="door door-in" style="cursor:pointer"><rect x="520" y="430" width="90" height="170" fill="#c62828"/><path d="M535 500 V470 Q565 440 595 470 V500Z" fill="#bfe6ff"/><circle cx="596" cy="530" r="6" fill="#d9a441"/></g>
        ${nm ? label(nm, 565, 395, 30, '#c62828') : ''}
        <g transform="translate(660,560)"><path d="M0 0 L50 0 L60 -60 L10 -60Z" fill="#d32f2f"/><rect x="-6" y="-10" width="70" height="14" fill="#d32f2f"/><rect x="0" y="0" width="10" height="40" fill="#b71c1c"/><rect x="48" y="0" width="10" height="40" fill="#b71c1c"/></g>
        <g class="pack" style="cursor:pointer">${emo('🎒', 440, 560, 70)}</g></g>
      <g transform="translate(1250,640)"><ellipse cx="0" cy="80" rx="290" ry="90" fill="#c9a46a"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="${-300 + i * 55}" y1="-10" x2="${-300 + i * 55}" y2="60" stroke="#2e2e36" stroke-width="5"/>`).join('')}<line x1="-300" y1="0" x2="305" y2="0" stroke="#2e2e36" stroke-width="5"/>
        <g class="slide" style="cursor:pointer"><rect x="-150" y="-120" width="140" height="170" fill="#ffd93d" stroke="#e0a800" stroke-width="5"/><rect x="-150" y="-60" width="140" height="18" fill="#9b6bff"/><path d="M-160 -125 L-80 -175 L0 -125Z" fill="#4d8dff"/>
          <path d="M-10 -70 Q90 -40 140 70 L190 70 Q130 -60 -10 -100Z" fill="#ff6fb1" stroke="#d6337a" stroke-width="5"/><rect x="-190" y="-110" width="30" height="160" fill="#4d8dff"/></g>
        ${emo('🪣', 210, 90, 56)}</g>`);
    putKid(920, 780);
    let step = 0, busy = false;
    tapOn(svg, '.door-in', () => { if (busy) return; busy = true; G.sfx.open(); moveKid(565, 610, 600).then(() => classroom()); });
    tapOn(svg, '.pack', p => {
      if (step !== 0 || busy) return; busy = true;
      moveKid(470, 620, 500).then(() => { const t = p.querySelector('text'); t.setAttribute('x', 565); t.setAttribute('y', 520); t.style.transition = 'opacity .6s'; G.sfx.open(); later(() => { t.style.opacity = '0'; G.sfx.close(); }, 500); step = 1; busy = false; later(() => G.beep(G.T('town.kinderPlay')), 700); });
    });
    tapOn(svg, '.slide', () => {
      if (busy) return; if (step === 0) { G.beep(G.T('town.kinder')); return; }
      busy = true; G.sfx.step(2);
      moveKid(1170, 540, 700, 40).then(() => { G.sfx.whoosh(); return moveKid(1440, 720, 700); }).then(() => { G.sfx.boing(); busy = false; if (step === 1) { step = 2; win('kinder'); G.beep(G.T('town.kinderDone')); } });
    });
  }

  // ----- the library: two stories of tan stucco under dark metal gables, and a wall of brown fieldstone with its name -----
  function library() {
    const nm = G.townData ? name('library') : 'LIBRARY';
    const svg = frame('library', 'library', `${sky()}${cloud(260, 90)}${cloud(1300, 120, 0.8)}${hills(440)}
      ${tree(120, 560, 1)}${tree(1500, 560, 1.1, '#4f9a48')}
      <g><rect x="300" y="250" width="560" height="350" fill="#dcc9a6"/><path d="M280 260 L580 140 L880 260Z" fill="#5d6168"/><path d="M280 260 L580 140 L880 260" stroke="#3f4248" stroke-width="10" fill="none"/>
        ${[360, 520, 680].map(x => `<rect x="${x}" y="300" width="90" height="80" fill="#4a5560" stroke="#efe6d4" stroke-width="6"/><path d="M${x - 10} 296 h110 l-10 20 h-90Z" fill="#5d6168"/>`).join('')}
        ${[360, 680].map(x => `<rect x="${x}" y="440" width="90" height="90" fill="#4a5560" stroke="#efe6d4" stroke-width="6"/>`).join('')}
        <g class="doors" style="cursor:pointer"><rect x="500" y="440" width="140" height="160" fill="#7fa6b8" stroke="#3f4248" stroke-width="8"/><line x1="570" y1="440" x2="570" y2="600" stroke="#3f4248" stroke-width="6"/><path d="M480 430 h180 l-14 -26 h-152Z" fill="#5d6168"/></g>
        <rect x="860" y="300" width="460" height="300" fill="#6b5040"/>${Array.from({ length: 60 }, (_, i) => `<ellipse cx="${880 + (i % 10) * 44 + (Math.floor(i / 10) % 2) * 20}" cy="${320 + Math.floor(i / 10) * 48}" rx="22" ry="15" fill="${['#7d5e4a', '#5c4436', '#8a6a52', '#4d3a2e'][i % 4]}"/>`).join('')}
        <path d="M840 310 L1090 220 L1340 310Z" fill="#5d6168"/>${label(nm.toUpperCase(), 1090, 400, nm.length > 16 ? 34 : 44, '#f3ead8', 'stroke="#2e2420" stroke-width="1"')}</g>
      <rect y="600" width="1600" height="300" fill="#7d838d"/>${[300, 620, 940, 1260].map(x => `<rect x="${x}" y="680" width="8" height="120" fill="#fff"/>`).join('')}<rect y="600" width="1600" height="24" fill="#c9c5ba"/>
      <g transform="translate(1440,620)"><rect x="-5" y="-300" width="10" height="300" fill="#4a4f5a"/><rect x="-26" y="-306" width="52" height="16" fill="#4a4f5a"/></g>`);
    putKid(1000, 770);
    tapOn(svg, '.doors', () => { G.sfx.open(); moveKid(570, 620, 600).then(() => inside()); });
    function inside() {
      const books = G.shuffle(LIB_BOOKS.slice());
      const svg2 = frame('library', 'library in', `<rect width="1600" height="900" fill="#f4ead6"/><rect y="640" width="1600" height="260" fill="#3a6fb0"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 80}" y="640" width="80" height="260" fill="${['#ff8fb8', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff'][i % 5]}" opacity=".25"/>`).join('')}
        ${[0, 1].map(r => `<rect x="120" y="${160 + r * 220}" width="1360" height="24" fill="#c9a46a"/>`).join('')}<rect x="120" y="140" width="24" height="460" fill="#c9a46a"/><rect x="1456" y="140" width="24" height="460" fill="#c9a46a"/>
        ${Array.from({ length: 2 }, (_, r) => Array.from({ length: 30 }, (_, i) => `<rect x="${160 + i * 43}" y="${40 + r * 220 + (i % 3) * 8}" width="36" height="${118 - (i % 3) * 8}" fill="${['#ff6f6f', '#ffb347', '#6fd97b', '#6fa8ff', '#b58cff', '#ff9cc7'][(i + r) % 6]}" stroke="#4a3f63" stroke-width="2"/>`).join('')).join('')}
        <rect x="60" y="590" width="1480" height="40" rx="8" fill="#c9a46a"/>
        ${books.map((id, i) => { const c = BOOK_ART[id].c, x = 212 + i * 148; return `<g class="book" data-id="${id}" style="cursor:pointer"><rect x="${x}" y="420" width="126" height="172" rx="10" fill="${c}" stroke="#4a3f63" stroke-width="5"/><rect x="${x}" y="420" width="18" height="172" fill="#000" opacity=".15"/>${emo(BOOK_ART[id].icon, x + 70, 500, 70)}${emo('⭐', x + 112, 428, 40, 'class="read-star" opacity="0"')}</g>`; }).join('')}
        <rect x="660" y="720" width="280" height="120" rx="60" fill="#ffd93d" opacity=".8"/>`, 'town.libraryIn', () => library());
      putKid(1100, 820);
      const read = new Set(); let done = false, busy = false;
      tapOn(svg2, '.book', (b, e) => {
        if (busy) return; busy = true;
        G.sfx.sparkle(); burstAt(e, '⭐', 5);
        const r = b.querySelector('rect'); moveKid(+r.getAttribute('x') + 63, 820, 500).then(() => {
          openBook(b.dataset.id, finished => {
            busy = false;
            if (!finished) return;
            read.add(b.dataset.id); b.querySelector('.read-star').setAttribute('opacity', '1');
            if (read.size >= 3 && !done) { done = true; later(() => { win('library'); G.beep(G.T('town.libraryDone')); }, 300); }
          });
        });
      });
    }
  }

  // ---------- picture books ----------
  // the words are in lines.js (G.book) so Beep's voice has them recorded; the pictures are here.
  // A picture is emoji placed on an 800 x 500 page: "emoji x,y,size" separated by spaces.
  const BOOK_ART = {
    owl: { icon: '🦉', c: '#9b6bff', pics: [
      ['#bfe6ff', '🌳400,300,380 🦉440,210,110'],
      ['#ffe9a8', '☀️130,110,130 🌳420,300,360 🦉450,210,100 🥱560,150,70'],
      ['#1d2a5a', '🌙660,100,110 🌳400,300,360 🦉440,210,110 ⭐170,90,40 ⭐290,60,30'],
      ['#1d2a5a', '⭐200,80,60 ⭐360,50,60 ⭐520,90,60 🦉400,230,130 🏠170,420,100 🏠400,430,100 🏠630,420,100'],
      ['#ffe0b8', '🌅650,100,120 🌳400,310,360 🦉440,220,100 💤540,150,60'],
    ] },
    rocket: { icon: '🚀', c: '#4d8dff', pics: [
      ['#bfe6ff', '🚀400,250,200 💨320,420,90 💨480,420,90'],
      ['#8fd3ff', '☁️190,320,150 ☁️610,140,150 🐦150,110,70 🐦650,360,60 🚀400,230,160'],
      ['#101836', '⭐120,100,40 ⭐300,60,30 ⭐620,110,40 ⭐700,390,30 ✨180,380,50 🚀400,250,160'],
      ['#101836', '🌕400,600,620 🚀400,170,140 ⭐140,80,40 ⭐660,70,40'],
      ['#101836', '🌍590,180,190 🚀220,330,130 ⭐110,80,30 ⭐430,60,30 🍽️690,420,70'],
    ] },
    unicorn: { icon: '🦄', c: '#ff6fb1', pics: [
      ['#ffe3f1', '🌈400,110,200 🦄400,300,220'],
      ['#9fb4c8', '🌧️190,90,130 🌧️590,90,130 🦄400,310,200 💧280,230,40 💧520,250,40'],
      ['#fff1c9', '☀️640,110,120 🍓160,340,110 🦊400,330,140'],
      ['#d8f5d0', '🐸160,340,120 🐦400,150,110 🍇640,340,120'],
      ['#ffe3f1', '🌈400,130,260 🦄400,330,200 ✨170,210,60 ✨630,230,60'],
    ] },
    panda: { icon: '🐼', c: '#4cd97b', pics: [
      ['#e8f5e9', '🐼330,290,220 🏠630,260,170'],
      ['#fff4e0', '📦380,330,220 🧸330,180,90 🐼620,300,140'],
      ['#bfe6ff', '🌳110,290,120 🚚400,320,220 🌳690,290,120'],
      ['#e9e4f5', '🏠400,220,260 🐼400,410,110'],
      ['#fff1c9', '🪟150,170,130 🛏️370,360,160 🐼560,320,120 🐰700,350,90'],
      ['#ffe3f1', '🏡400,240,250 🐼400,410,110 💗580,130,70'],
    ] },
    dino: { icon: '🦖', c: '#ff9f43', pics: [
      ['#d8f5d0', '🦖400,270,280'],
      ['#ffe9a8', '🦖290,290,230 🪥620,300,120'],
      ['#ffe9a8', '🦕220,300,210 🦖560,320,180 🪥410,190,90'],
      ['#bfe6ff', '🦖400,290,230 🪥570,220,100 🫧210,140,60 🫧650,110,50 🫧190,380,50'],
      ['#bfe6ff', '🦖400,290,250 ✨580,150,70 ✨220,160,60'],
    ] },
    moon: { icon: '🌙', c: '#2a3f8f', pics: [
      ['#1d2a5a', '🪟400,260,330 🌙420,190,90'],
      ['#1d2a5a', '🌕400,240,240 ⭐140,90,40 ⭐660,390,40'],
      ['#1d2a5a', '🌙400,240,230 🍌630,400,90 ⭐140,90,40'],
      ['#0b1024', '❓400,240,170 ⭐140,90,30 ⭐660,120,30'],
      ['#1d2a5a', '🛏️400,340,220 🌙620,110,100 ⭐190,100,40 💤300,220,60'],
    ] },
    bug: { icon: '🐛', c: '#37c9d6', pics: [
      ['#d8f5d0', '🍃400,270,280 🥚430,240,60'],
      ['#d8f5d0', '🍃250,300,180 🍃560,320,170 🐛420,340,130'],
      ['#e9f2d8', '🌿400,260,280 🫛440,330,90 💤570,170,60'],
      ['#1d2a5a', '🌙630,100,100 🌿380,280,250 🫛420,340,90 💤540,200,60'],
      ['#d8f5d0', '🦋400,230,230 🌸140,390,90 🌼660,390,90'],
    ] },
    crown: { icon: '👑', c: '#ffd93d', pics: [
      ['#f3e9ff', '🏰380,250,290 👸600,380,110'],
      ['#fff4e0', '🤒260,280,150 ❓530,250,150'],
      ['#fff4e0', '👸240,300,180 🥚500,190,70 🥛620,310,80 🥣480,390,100'],
      ['#fff4e0', '🥞400,60,100 👸280,330,180 🍳520,360,100 💨400,190,50'],
      ['#f3e9ff', '🥞400,300,210 👸170,330,140 🤴630,330,130 😂400,100,70'],
    ] },
    school: { icon: '🎒', c: '#ff6fb1', pics: [
      ['#fff4e0', '🎒300,270,190 🧥530,270,170'],
      ['#fff4e0', '🎵400,110,80 🧒230,330,130 👧400,330,130 🧒570,330,130'],
      ['#d8f5d0', '🎨180,260,140 🧱400,310,140 🛝630,280,160'],
      ['#d9d4f0', '😴400,290,200 🧸580,340,90 💤600,150,60'],
      ['#fff1c9', '🏫400,230,250 👋600,390,100'],
    ] },
    bear: { icon: '🐻', c: '#9b6bff', pics: [
      ['#fff4e0', '🐻400,260,250'],
      ['#fff4e0', '🐻170,300,130 🧱400,380,100 🧱400,290,100 🐰590,300,150'],
      ['#fff4e0', '🐻310,300,190 💬540,140,150 👋480,330,90'],
      ['#fff4e0', '🐻200,330,150 🐰600,330,150 🧱400,420,80 🧱400,345,80 🧱400,270,80 🧱400,195,80 🧱400,120,80'],
      ['#ffe3f1', '🐻290,300,180 🐰520,300,170 💗405,120,80'],
    ] },
  };
  const LIB_BOOKS = ['owl', 'rocket', 'unicorn', 'panda', 'dino', 'moon', 'bug', 'crown'];
  const pic = spec => spec.split(' ').map(t => { const m = t.match(/^(.+?)(-?\d+),(-?\d+),(\d+)$/u); return m ? emo(m[1], +m[2], +m[3], +m[4]) : ''; }).join('');
  // opens a book over the scene; done(true) when it was read to the end
  function openBook(id, done) {
    const art = BOOK_ART[id], b = G.book(id);
    const pages = [{ cover: true, text: b.title }, ...b.pages.map((t, i) => ({ text: t, pic: art.pics[i] })), { end: true, text: G.T('theEnd') }];
    let at = 0, reached = false;
    G.beepQuiet();
    const v = G.html(`<div class="book-view"><div class="book-card" style="border-color:${art.c}"><div class="book-pic"></div><div class="book-text"></div></div>
      <button class="round-btn book-x" title="Close">✖</button><button class="round-btn book-prev" title="Back a page">◀</button><button class="round-btn book-next" title="Next page">▶</button><button class="round-btn book-say" title="Read it again">🔊</button></div>`);
    el.appendChild(v);
    const card = G.$('.book-card', v);
    const show = () => {
      const pg = pages[at];
      let svg;
      if (pg.cover) svg = `<rect width="800" height="500" fill="${art.c}"/><rect x="40" y="30" width="720" height="440" rx="24" fill="#fff" opacity=".22"/>${emo(art.icon, 400, 250, 250)}`;
      else if (pg.end) svg = `<rect width="800" height="500" fill="#fff8e1"/>${emo(art.icon, 400, 250, 190)}${[[120, 110], [680, 100], [150, 400], [660, 410], [400, 60]].map(([x, y]) => emo('⭐', x, y, 60)).join('')}`;
      else svg = `<rect width="800" height="500" fill="${pg.pic[0]}"/>${pic(pg.pic[1])}`;
      G.$('.book-pic', v).innerHTML = `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
      const tx = G.$('.book-text', v); tx.textContent = pg.text; tx.classList.toggle('title', !!pg.cover);
      G.$('.book-prev', v).style.visibility = at ? 'visible' : 'hidden';
      G.$('.book-next', v).textContent = pg.end ? '✔' : '▶';
      card.classList.remove('turn'); void card.offsetWidth; card.classList.add('turn');
      if (pg.end) { reached = true; G.sfx.great(); }
      G.say(pg.text);
    };
    const close = () => { G.hush(); v.remove(); done(reached); };
    G.$('.book-next', v).onclick = e => { e.stopPropagation(); G.sfx.tap(); if (at === pages.length - 1) return close(); at++; show(); };
    G.$('.book-prev', v).onclick = e => { e.stopPropagation(); G.sfx.tap(); if (at) { at--; show(); } };
    G.$('.book-x', v).onclick = e => { e.stopPropagation(); G.sfx.tap(); close(); };
    G.$('.book-say', v).onclick = e => { e.stopPropagation(); G.say(pages[at].text); };
    G.$('.book-pic', v).onclick = e => { e.stopPropagation(); G.$('.book-next', v).click(); };
    show();
  }

  // ----- inside Maia's school: cubbies, the teacher, a sink, an easel, the fish tank, nap mats, the circle rug, blocks and a book corner -----
  function classroom() {
    const k = G.kid(), others = ['🐶', '🐱', '🌟', '🍎', '🚗'];
    const LET = 'ABCDEFGHIJKLMNOP', COL = ['#ff6f6f', '#ffb347', '#ffd93d', '#6fd97b', '#4d8dff', '#b58cff'];
    const svg = frame('kinderIn', 'kinder in', `<rect width="1600" height="620" fill="#fdf1d8"/><rect y="600" width="1600" height="300" fill="#e3c08a"/>${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${630 + i * 32}" x2="1600" y2="${630 + i * 32}" stroke="#cfa972" stroke-width="3"/>`).join('')}<rect y="590" width="1600" height="16" fill="#c49a62"/>
      <path d="M30 40 Q800 110 1570 40" stroke="#8a6a52" stroke-width="4" fill="none"/>${Array.from(LET).map((c, i) => { const x = 70 + i * 97, y = 40 + Math.sin((i + 0.5) / 16 * Math.PI) * 50; return `<path d="M${x - 34} ${y} L${x + 34} ${y} L${x} ${y + 70}Z" fill="${COL[i % 6]}"/>${label(c, x, y + 32, 30, '#fff')}`; }).join('')}
      <g><rect x="590" y="150" width="330" height="210" fill="#bfe6ff" stroke="#fff" stroke-width="14"/><line x1="755" y1="150" x2="755" y2="360" stroke="#fff" stroke-width="10"/>${tree(670, 330, 0.6)}${tree(855, 335, 0.5, '#4f9a48')}${cloud(800, 200, 0.45)}<rect x="575" y="355" width="360" height="18" fill="#e7d3b0"/></g>
      <g class="cubby" style="cursor:pointer"><rect x="205" y="250" width="240" height="330" fill="#d9a066" stroke="#8a5a3c" stroke-width="6"/>
        ${[0, 1].map(r => [0, 1, 2].map(c => { const x = 213 + c * 77, y = 262 + r * 158, i = r * 3 + c; return `<rect x="${x}" y="${y}" width="72" height="146" fill="#f6e2c2"/><circle cx="${x + 36}" cy="${y + 16}" r="6" fill="#8a8f9a"/><rect x="${x + 4}" y="${y + 112}" width="64" height="28" rx="6" fill="#fff"/>${i === 1 ? label(k.name, x + 36, y + 133, 19, '#c62828') : emo(others[i > 1 ? i - 1 : i], x + 36, y + 126, 22)}`; }).join('')).join('')}
        <g class="cubby-stuff" style="opacity:0;transition:opacity .4s">${emo('🎒', 326, 308, 48)}${emo('🧥', 326, 350, 34)}</g></g>
      <g class="teacher" style="cursor:pointer">${emo('👩‍🏫', 515, 525, 150)}</g>
      <g class="mats" style="cursor:pointer">${['#4d8dff', '#4cd97b', '#ff6f6f', '#ffd93d'].map((c, i) => `<rect x="640" y="${560 - i * 24}" width="180" height="22" rx="8" fill="${c}" stroke="#4a3f63" stroke-width="3"/>`).join('')}</g>
      <g class="sink" style="cursor:pointer"><rect x="950" y="440" width="110" height="160" fill="#7fc3e8" stroke="#3d7ea6" stroke-width="5"/><rect x="940" y="430" width="130" height="22" rx="6" fill="#e9eef2"/><ellipse cx="1005" cy="441" rx="38" ry="9" fill="#b9c4cc"/><path d="M1005 432 V398 H1030 V410" stroke="#9aa3ab" stroke-width="10" fill="none" stroke-linecap="round"/>${emo('🧼', 1050, 418, 30)}</g>
      <g class="easel" style="cursor:pointer"><path d="M1095 600 L1150 290 L1205 600 M1150 290 V600" stroke="#8a5a3c" stroke-width="10" fill="none"/><rect x="1085" y="310" width="130" height="190" fill="#fff" stroke="#c49a62" stroke-width="6"/><g class="paint"></g><rect x="1075" y="500" width="150" height="16" fill="#c49a62"/>${['#ff6f6f', '#ffd93d', '#4d8dff', '#4cd97b'].map((c, i) => `<circle cx="${1098 + i * 35}" cy="508" r="9" fill="${c}"/>`).join('')}</g>
      <g class="tank" style="cursor:pointer"><rect x="1235" y="470" width="165" height="130" fill="#b07a4a" stroke="#7a5030" stroke-width="5"/><rect x="1240" y="330" width="155" height="140" fill="#9fe3ff" stroke="#5aa9cf" stroke-width="6" opacity=".95"/><rect x="1240" y="330" width="155" height="16" fill="#5aa9cf"/><path d="M1245 470 q20 -30 40 0 q20 -24 40 0 q30 -40 60 0" fill="#7cc46a"/>
        <g class="fishes"><g class="fish f0">${emo('🐠', 1290, 410, 44)}</g><g class="fish f1">${emo('🐟', 1355, 440, 38)}</g><g class="fish f2">${emo('🐡', 1320, 378, 32)}</g></g><g class="food"></g></g>
      <g class="books" style="cursor:pointer"><rect x="940" y="640" width="140" height="160" fill="#4d8dff" stroke="#2a5fb8" stroke-width="5"/>${['school', 'bear'].map((id, i) => `<rect x="${953 + i * 62}" y="660" width="54" height="74" fill="${BOOK_ART[id].c}" stroke="#4a3f63" stroke-width="3"/>${emo(BOOK_ART[id].icon, 980 + i * 62, 697, 32)}`).join('')}<rect x="940" y="740" width="140" height="10" fill="#2a5fb8"/>
        <ellipse cx="1010" cy="845" rx="85" ry="50" fill="#ff8fb8"/><ellipse cx="1002" cy="822" rx="55" ry="30" fill="#ffa8c8"/></g>
      <g class="rug" style="cursor:pointer"><ellipse cx="700" cy="770" rx="210" ry="86" fill="#4d8dff"/><ellipse cx="700" cy="770" rx="186" ry="70" fill="#ffd93d"/>${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return `<circle cx="${700 + Math.cos(a) * 150}" cy="${770 + Math.sin(a) * 52}" r="16" fill="${COL[i % 6]}"/>`; }).join('')}${label('ABC', 700, 784, 40, '#ff6f6f')}</g>
      <g class="blocks" style="cursor:pointer"><rect x="1270" y="800" width="125" height="74" rx="10" fill="#ff9f43" stroke="#c46a1c" stroke-width="5"/>${['#ff6f6f', '#4d8dff', '#4cd97b'].map((c, i) => `<rect x="${1280 + i * 38}" y="780" width="36" height="30" fill="${c}" stroke="#4a3f63" stroke-width="3"/>`).join('')}<g class="tower"></g></g>
      <rect class="dim" width="1600" height="900" fill="#0b1024" opacity="0" pointer-events="none" style="transition:opacity .8s"/>`, 'town.kinderIn', () => kinder());
    putKid(1230, 890);
    const tried = new Set(); let busy = false, won = false, blocks = 0;
    const did = what => { tried.add(what); if (tried.size === 9 && !won) { won = true; later(() => { win('kinderIn'); G.beep(G.T('town.kinderInDone')); }, 2600); } };
    const go = (what, x, y, fn) => (n, e) => { if (busy) return; busy = true; moveKid(x, y, 550).then(() => { busy = false; fn(n, e); did(what); }); };
    tapOn(svg, '.cubby', go('cubby', 330, 700, () => { G.sfx.open(); G.$('.cubby-stuff', svg).style.opacity = '1'; G.beep(G.T('town.kinderCubby')); }));
    tapOn(svg, '.teacher', go('teacher', 630, 700, (n, e) => { G.sfx.chime(); burstAt(e, '💛', 5); G.beep(G.T('town.kinderTeacher')); }));
    tapOn(svg, '.sink', go('sink', 1005, 700, (n, e) => { G.sfx.water(); burstAt(e, '🫧', 8); G.beep(G.T('town.kinderSink')); }));
    let painted = 0;
    tapOn(svg, '.easel', (n, e) => {
      const add = () => { const g = G.$('.paint', svg); if (painted++ > 40) g.innerHTML = ''; g.insertAdjacentHTML('beforeend', `<circle cx="${G.rand(1105, 1195)}" cy="${G.rand(330, 480)}" r="${G.rand(12, 30)}" fill="${G.pick(COL)}" opacity=".9"/>`); G.sfx.pop(); };
      if (tried.has('easel')) return add();
      go('easel', 1150, 700, () => { add(); G.beep(G.T('town.kinderEasel')); })(n, e);
    });
    tapOn(svg, '.tank', go('tank', 1318, 700, () => {
      const f = G.$('.food', svg); f.innerHTML = Array.from({ length: 8 }, () => `<circle cx="${G.rand(1260, 1375)}" cy="350" r="5" fill="#c46a1c" class="flake"/>`).join('');
      G.$$('.flake', f).forEach(c => { c.style.transition = `transform ${1.5 + Math.random()}s ease-in`; requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transform = `translateY(${G.rand(40, 100)}px)`; })); });
      G.$('.fishes', svg).classList.add('eat'); later(() => { f.innerHTML = ''; G.$('.fishes', svg) && G.$('.fishes', svg).classList.remove('eat'); }, 2600);
      for (let i = 0; i < 4; i++) later(G.sfx.bubble, i * 200); G.beep(G.T('town.kinderTank'));
    }));
    tapOn(svg, '.mats', go('nap', 730, 640, () => {
      busy = true; const d = G.$('.dim', svg); d.setAttribute('opacity', '.55'); G.beep(G.T('town.kinderNap'));
      for (let i = 0; i < 3; i++) later(() => { const r = svg.getBoundingClientRect(); G.burst(r.left + r.width * 0.46, r.top + r.height * 0.6, '💤', 3); }, 600 + i * 800);
      later(() => { d.setAttribute('opacity', '0'); G.sfx.chime(); G.beep(G.T('town.kinderWake')); busy = false; }, 3600);
    }));
    tapOn(svg, '.rug', go('rug', 700, 780, (n, e) => { G.beep(G.T('town.kinderRug')); [523, 587, 659, 523].forEach((f, i) => later(() => { G.sfx.chime(); burstAt(e, '🎵', 3); }, 500 + i * 450)); }));
    const tower = () => G.$('.tower', svg);
    tapOn(svg, '.blocks', (n, e) => {
      const add = () => {
        if (busy) return;
        if (blocks >= 7) { // it falls over
          busy = true; G.sfx.thump(); G.$$('rect', tower()).forEach((b, i) => { b.style.transition = 'transform .7s ease-in, opacity .7s'; b.style.transformBox = 'fill-box'; b.style.transformOrigin = 'center'; b.style.transform = `translate(${(i % 2 ? 1 : -1) * G.rand(60, 160)}px, ${(7 - i) * 52}px) rotate(${G.rand(-120, 120)}deg)`; b.style.opacity = '0'; });
          later(() => { tower().innerHTML = ''; blocks = 0; busy = false; }, 800); G.beep(G.T('town.kinderCrash')); return;
        }
        tower().insertAdjacentHTML('beforeend', `<rect x="${1170 + G.rand(-6, 6)}" y="${812 - blocks * 52}" width="80" height="52" fill="${COL[blocks % 6]}" stroke="#4a3f63" stroke-width="4"/>`); blocks++; G.sfx.snap();
      };
      if (tried.has('blocks')) return add();
      go('blocks', 1330, 770, () => { add(); G.beep(G.T('town.kinderBlocks')); })(n, e);
    });
    let nextBook = 0;
    tapOn(svg, '.books', go('books', 1010, 870, () => { busy = true; openBook(['school', 'bear'][nextBook++ % 2], () => { busy = false; }); }));
  }
})();
