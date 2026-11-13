// A walk around the neighborhood: the pool, the playground, the park, the school and the library.
(() => {
  const W = G.W;
  const Tn = G.town = {};
  let el = null, timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const kidPic = (size = 110) => { const p = W.player; const c = G.kidPicture(p.who, p.costume, size); c.className = 'town-kid'; return c; };
  const PLACES = [
    { id: 'pool', icon: '🏊', name: 'Pool', x: 66, y: 20 }, { id: 'play', icon: '🛝', name: 'Playground', x: 14, y: 30 }, { id: 'park', icon: '🌳', name: 'Park', x: 16, y: 70 },
    { id: 'school', icon: '🏫', name: 'School', x: 86, y: 62 }, { id: 'library', icon: '📚', name: 'Library', x: 42, y: 84 },
  ];
  const sticker = id => { const P = G.P(); if (!P.done['town_' + id]) { P.done['town_' + id] = 1; G.addStars(3); G.persist(); } G.Q.onTown(id); };

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
  function map(first) {
    clear();
    el.className = 'town map';
    el.innerHTML = `<div class="road r1"></div><div class="road r2"></div><div class="road r3"></div>
      ${['🌴', '🌳', '🌴', '🌳', '🌲', '🌴', '🌳'].map((t, i) => `<span class="deco" style="left:${[5, 33, 55, 92, 62, 30, 90][i]}%;top:${[12, 14, 80, 12, 50, 88, 44][i]}%">${t}</span>`).join('')}
      <button class="place home" style="left:52%;top:50%" data-go="home"><span>🏠</span><b>Home</b></button>
      ${PLACES.map(p => `<button class="place" style="left:${p.x}%;top:${p.y}%" data-go="${p.id}"><span>${p.icon}</span><b>${p.name}</b>${G.P().done['town_' + p.id] ? '<i>⭐</i>' : ''}</button>`).join('')}`;
    const kid = kidPic(96); kid.style.left = '58%'; kid.style.top = '50%'; el.appendChild(kid);
    el.onclick = e => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      G.sfx.tap();
      if (b.dataset.go === 'home') return Tn.close();
      kid.style.left = b.style.left; kid.style.top = b.style.top; kid.classList.add('hop');
      el.onclick = null; later(() => scene(b.dataset.go), 900);
    };
    if (first) G.beep(G.T('town.map'));
  }
  function frame(id, cls, inner) {
    clear(); el.className = 'town scene ' + cls;
    el.innerHTML = `<button class="round-btn town-back" title="Back">⬅️</button>${inner}<div class="town-pol hidden"></div>`;
    G.$('.town-back', el).onclick = () => { G.sfx.tap(); map(); };
    el.onclick = null;
    const ids = G.photosFor(id);
    if (ids.length) G.photo(ids[0]).then(u => { const p = el && G.$('.town-pol', el); if (u && p) { p.innerHTML = `<img src="${u}" alt="">`; p.classList.remove('hidden'); p.onclick = () => p.classList.toggle('big'); } });
    G.beep(G.T('town.' + id));
  }
  function scene(id) {
    if (!el) return;
    if (id === 'pool') {
      const toys = ['🛟', '🦆', '🏐', '🐬', '🦩'];
      frame('pool', 'pool', `<span class="deco" style="left:4%;top:8%">🌴</span><span class="deco" style="left:86%;top:6%">🌴</span><span class="deco" style="left:90%;top:70%">⛱️</span><span class="deco" style="left:3%;top:74%">🩴</span>
        <div class="water">${toys.map((t, i) => `<button class="floaty" style="left:${12 + i * 17}%;top:${[30, 62, 22, 66, 40][i]}%;animation-delay:${-i * 0.6}s">${t}</button>`).join('')}</div><div class="spa">♨️</div>`);
      const water = G.$('.water', el), kid = kidPic(100); kid.style.left = '46%'; kid.style.top = '46%'; water.appendChild(kid);
      let left = toys.length;
      water.onclick = e => {
        const f = e.target.closest('.floaty'); if (!f || f.classList.contains('gone')) return;
        kid.style.left = f.style.left; kid.style.top = f.style.top; G.sfx.splash(); f.classList.add('gone');
        const r = f.getBoundingClientRect(); later(() => G.burst(r.left + r.width / 2, r.top + r.height / 2, '💦', 6), 500);
        if (!--left) later(() => { G.sfx.great(); G.confetti(50); sticker('pool'); G.beep(G.T('town.poolDone')); }, 900);
      };
      G.$('.spa', el).onclick = () => { for (let i = 0; i < 5; i++) later(G.sfx.bubble, i * 120); };
    } else if (id === 'play') {
      frame('play', 'play', `<span class="deco" style="left:6%;top:10%">🌴</span><span class="deco" style="left:88%;top:14%">🌳</span>
        <div class="shade"></div><button class="slide-set" data-do="slide"><i class="tower"></i><i class="chute"></i></button>
        <button class="swing-set" data-do="swing"><i class="bar"></i><i class="rope"><b class="seat"></b></i></button>`);
      const kid = kidPic(96); kid.style.left = '50%'; kid.style.top = '74%'; el.appendChild(kid);
      let n = 0, busy = false;
      const fun = () => { if (++n === 3) { G.sfx.great(); G.confetti(50); sticker('play'); G.beep(G.T('town.playDone')); } };
      el.onclick = e => {
        const b = e.target.closest('[data-do]'); if (!b || busy) return; busy = true;
        if (b.dataset.do === 'slide') {
          kid.style.transition = 'left .5s, top .5s'; kid.style.left = '24%'; kid.style.top = '30%'; G.sfx.step(2); later(() => G.sfx.step(4), 200);
          later(() => { kid.style.transition = 'left .7s ease-in, top .7s ease-in'; kid.style.left = '44%'; kid.style.top = '72%'; G.sfx.whoosh(); }, 650);
          later(() => { busy = false; G.sfx.boing(); fun(); }, 1500);
        } else {
          kid.style.transition = 'left .4s, top .4s'; kid.style.left = '74%'; kid.style.top = '54%';
          later(() => { kid.classList.add('swinging'); G.$('.rope', el).classList.add('swinging'); [0, 1, 2].forEach(i => later(G.sfx.whoosh, i * 800)); }, 420);
          later(() => { kid.classList.remove('swinging'); G.$('.rope', el).classList.remove('swinging'); busy = false; fun(); }, 2900);
        }
      };
    } else if (id === 'park') {
      frame('park', 'park', `<span class="deco" style="left:8%;top:18%">🌳</span><span class="deco" style="left:80%;top:12%">🌳</span><span class="deco" style="left:60%;top:64%">🧺</span><span class="deco" style="left:20%;top:70%">🌼</span><span class="deco" style="left:88%;top:76%">🌷</span>
        ${[0, 1, 2, 3, 4].map(i => `<button class="fly f${i}" style="animation-delay:${-i * 1.7}s">🦋</button>`).join('')}`);
      let left = 5;
      el.onclick = e => {
        const f = e.target.closest('.fly'); if (!f || f.classList.contains('gone')) return;
        const r = f.getBoundingClientRect(); G.burst(r.left + r.width / 2, r.top + r.height / 2, '✨', 6); f.classList.add('gone'); G.sfx.sparkle();
        if (!--left) later(() => { G.sfx.great(); G.confetti(50); sticker('park'); G.beep(G.T('town.parkDone')); }, 500);
      };
    } else {
      frame(id, 'card', `<div class="big-place">${id === 'school' ? '🏫' : '📚'}</div><div class="row">${(id === 'school' ? ['🎒', '✏️', '🎨', '⚽', '👧', '🧒'] : ['📕', '📗', '📘', '📙', '🦉', '🐛']).map(x => `<button class="bop">${x}</button>`).join('')}</div>`);
      el.onclick = e => { const b = e.target.closest('.bop'); if (!b) return; b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); G.sfx.note(G.rand(0, 7)); };
      sticker(id);
    }
  }
})();
