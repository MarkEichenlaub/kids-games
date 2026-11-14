// The title page, costumes, the menu, the passport and the grown-ups page.
(() => {
  const M = G.MAP, W = G.W;

  // the front of the house, as on moving day
  const HOUSE = `<svg class="title-house" viewBox="0 0 520 330" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#4a3f63" stroke-width="3" stroke-linejoin="round">
      <rect x="60" y="30" width="26" height="60" fill="#e9d79a"/>
      <path d="M90 100 L260 26 L430 100 Z" fill="#9a6a4c"/>
      <rect x="110" y="100" width="300" height="100" fill="#f3de8c"/>
      <rect x="150" y="122" width="52" height="52" fill="#bfe6ff"/><rect x="318" y="122" width="52" height="52" fill="#bfe6ff"/>
      <rect x="138" y="118" width="12" height="60" fill="#2f4a6b"/><rect x="202" y="118" width="12" height="60" fill="#2f4a6b"/><rect x="306" y="118" width="12" height="60" fill="#2f4a6b"/><rect x="370" y="118" width="12" height="60" fill="#2f4a6b"/>
      <path d="M50 214 L90 176 L430 176 L470 214 Z" fill="#9a6a4c"/>
      <rect x="70" y="214" width="380" height="86" fill="#f3de8c"/>
      <rect x="236" y="226" width="48" height="74" fill="#2f4a6b"/><circle cx="276" cy="266" r="3.5" fill="#ffd93d"/>
      <rect x="120" y="232" width="64" height="48" fill="#bfe6ff"/><rect x="336" y="232" width="64" height="48" fill="#bfe6ff"/>
      <rect x="62" y="214" width="14" height="92" fill="#fff"/><rect x="204" y="214" width="14" height="92" fill="#fff"/><rect x="302" y="214" width="14" height="92" fill="#fff"/><rect x="444" y="214" width="14" height="92" fill="#fff"/>
      <rect x="76" y="270" width="128" height="30" fill="#fff"/><rect x="316" y="270" width="128" height="30" fill="#fff"/>
      <rect x="50" y="300" width="420" height="12" fill="#cfcfd4"/>
    </g>
    <g stroke="#4a3f63" stroke-width="2">${[92, 108, 124, 140, 156, 172, 188, 332, 348, 364, 380, 396, 412, 428].map(x => `<line x1="${x}" y1="272" x2="${x}" y2="298"/>`).join('')}</g>
    <text x="222" y="296" font-size="26">🌼</text><text x="286" y="296" font-size="26">🌼</text>
  </svg>`;

  G.screens.title = {
    enter(root) {
      root.className = 'title';
      root.innerHTML = `<div class="sky-cloud c1"></div><div class="sky-cloud c2"></div>
        <a class="round-btn title-back" href="../../index.html" title="More games">🎮</a>
        <button class="round-btn title-gear" id="gear" title="Grown-ups">⚙️</button>
        <div class="title-wrap"><h1>Our New House</h1>${HOUSE}
          <div class="who" id="who"></div></div>`;
      const who = G.$('#who', root);
      for (const k of Object.values(G.KIDS)) {
        const prof = G.save.profiles[k.id] || G.defaultProfile(k.id);
        const b = G.html(`<button class="who-btn" style="--c:${k.color}"><b>${k.name}</b></button>`);
        b.prepend(G.kidPicture(k.id, prof.costume, 130));
        b.onclick = () => {
          G.audio(); G.sfx.good();
          const fresh = !G.save.profiles[k.id];
          G.usePro(k.id);
          if (fresh || !G.P().picked) G.go('dress'); else G.go('world');
        };
        who.appendChild(b);
      }
      G.$('#gear', root).onclick = () => { G.sfx.tap(); G.grownups(); };
      G.showBeep(true);
      const hello = () => { root.removeEventListener('pointerdown', hello); if (G.current === 'title' && !G.modalOpen()) G.beep(G.T('title')); };
      root.addEventListener('pointerdown', hello);
    },
  };

  // ---------- costumes ----------
  function costumeGrid(onPick) {
    const k = G.kid(), cur = G.P().costume;
    const grid = G.html('<div class="costumes"></div>');
    for (const c of G.COSTUMES) {
      const b = G.html(`<button class="costume ${c.id === cur ? 'on' : ''}"><b>${c.name}</b></button>`);
      b.prepend(G.kidPicture(k.id, c.id, 104));
      b.onclick = () => { G.P().costume = c.id; G.P().picked = 1; G.persist(); G.sfx.sparkle(); G.$$('.costume', grid).forEach(x => x.classList.remove('on')); b.classList.add('on'); G.beep(c.say); onPick(c); };
      grid.appendChild(b);
    }
    return grid;
  }
  G.screens.dress = {
    enter(root) {
      root.className = 'title dress';
      root.innerHTML = `<div class="dress-wrap"><h2>${G.kid().name}</h2><div id="grid"></div><button class="btn go hidden" id="go">▶️ Go!</button></div>`;
      G.$('#grid', root).appendChild(costumeGrid(() => G.$('#go', root).classList.remove('hidden')));
      if (G.P().picked) G.$('#go', root).classList.remove('hidden');
      G.$('#go', root).onclick = () => { G.sfx.great(); G.go('world'); };
      G.showBeep(true); G.beep(G.T('pickCostume'));
    },
  };
  // from a closet, while playing
  G.costumes = () => {
    const wrap = G.html('<div class="dress-wrap in-modal"></div>');
    wrap.appendChild(costumeGrid(c => { W.player.costume = c.id; W.puff(W.player.x, W.player.y - 2, '✨', 10); setTimeout(G.closeModal, 900); }));
    G.modal(wrap, { cls: 'wide' });
  };

  // ---------- menu ----------
  G.menu = () => {
    const box = G.modal(`<div class="menu">
      <button class="btn" data-a="dress">👗 <b>Dress up</b></button>
      <button class="btn" data-a="pass">📖 <b>Passport</b></button>
      <button class="btn" data-a="who">👭 <b>Who is playing?</b></button>
      <button class="btn" data-a="games">🎮 <b>More games</b></button>
      <button class="btn small" data-a="grown">⚙️ <b>Grown-ups</b></button></div>`);
    box.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return; G.sfx.tap();
      const a = b.dataset.a;
      if (a === 'dress') G.costumes(); else if (a === 'pass') G.passport(); else if (a === 'who') G.go('title');
      else if (a === 'games') location.href = '../../index.html'; else G.grownups();
    };
  };

  // ---------- passport ----------
  G.passport = () => {
    const P = G.P(), k = G.kid();
    const stamp = r => P.stamps[r.id] ? `<button class="pstamp got" data-room="${r.id}"><span>${M.roomIcon(r)}</span><b>${M.roomName(r)}</b></button>` : `<div class="pstamp"><span>❔</span><b>&nbsp;</b></div>`;
    const town = [['pool', '🏊'], ['play', '🛝'], ['park', '🌳'], ['school', '🏫'], ['kinder', '🧸'], ['library', '📚']];
    const box = G.modal(`<div class="passport"><h2>📖 ${k.name} · ⭐ ${P.stars}</h2>
      <h3>⬇️</h3><div class="pgrid">${M.rooms.filter(r => r.floor === 1).map(stamp).join('')}</div>
      <h3>⬆️</h3><div class="pgrid">${M.rooms.filter(r => r.floor === 2).map(stamp).join('')}</div>
      <h3>🔎 ${Object.keys(P.glims).length}/${G.FRIENDS.length}</h3><div class="pfriends">${G.FRIENDS.map(f => `<span class="${P.glims[f.id] ? 'got' : ''}" title="${P.glims[f.id] ? f.name : ''}">${P.glims[f.id] ? f.icon : '❔'}</span>`).join('')}</div>
      ${G.photosFor('plans').length ? '<button class="btn small" data-plans="1">🗺️ The real floor plan</button>' : ''}
      <h3>🗺️</h3><div class="pfriends">${town.map(t => `<span class="${P.done['town_' + t[0]] ? 'got' : ''}">${P.done['town_' + t[0]] ? t[1] : '❔'}</span>`).join('')}</div></div>`, { cls: 'wide' });
    box.onclick = e => {
      if (e.target.closest('[data-plans]')) { G.sfx.tap(); return W.photoModal({ id: 'plans', icon: '🗺️', name: 'floor plan' }); }
      const b = e.target.closest('[data-room]'); if (!b) return;
      const r = M.room(b.dataset.room); G.sfx.tap();
      if (G.photosFor(r.id).length) W.photoModal(r); else G.beep(G.roomLine(r));
    };
  };

  // ---------- grown-ups ----------
  G.grownups = () => {
    const s = G.save.settings, h = G.save.house;
    const sel = id => `<select data-room="${id}">${Object.entries(M.ROOM_NAMES).map(([k, v]) => `<option value="${k}" ${h.roomNames[id] === k ? 'selected' : ''}>${v[0]} ${v[1]}</option>`).join('')}</select>`;
    const box = G.modal(`<div class="grown"><h2>⚙️ Grown-ups</h2>
      <p class="hold-note" id="hold-note">Press and hold the lock for two seconds.</p><button class="btn" id="lock">🔒 Hold</button>
      <div id="grown-in" class="hidden">
        <label><input type="checkbox" data-s="voice" ${s.voice ? 'checked' : ''}> Beep talks</label>
        <label><input type="checkbox" data-s="sound" ${s.sound ? 'checked' : ''}> Sound effects</label>
        <label><input type="checkbox" data-s="music" ${s.music ? 'checked' : ''}> Music</label>
        <p><b>The two kids' bedrooms.</b> Until you decide who sleeps where, they are the Star Bedroom (sliding closet, west) and the Moon Bedroom (walk-in closet, east).</p>
        <label>West bedroom ${sel('bedA')}</label><label>East bedroom ${sel('bedB')}</label>
        <p><b>Real photos.</b> <span id="photo-state"></span></p>
        <label>Family key <input type="text" id="key" placeholder="paste the link or key from What's Hiding?" autocomplete="off"></label>
        <p><b>Two players.</b> Arrow keys or taps move the kid who is playing. W, A, S and D move her sister. Space touches things.</p>
        <p><b>Backup.</b> Stamps, stars, jobs and the decorating are backed up online and shared between computers: ${window.CLOUD ? CLOUD.status : 'off'}.</p>
        <p><b>Start over.</b></p>
        <div class="row"><button class="btn small" data-reset="mira">Mira's stamps and jobs</button><button class="btn small" data-reset="maia">Maia's stamps and jobs</button><button class="btn small" data-reset="house">The furniture and paint</button></div>
      </div></div>`);
    const state = () => { G.$('#photo-state', box).textContent = G.hasPhotos() ? 'Unlocked on this device. The camera button and the passport show the real rooms.' : 'Locked. Paste the family key below (the same one What\'s Hiding? uses).'; };
    let t = null;
    const lock = G.$('#lock', box);
    const open = () => { G.$('#grown-in', box).classList.remove('hidden'); lock.remove(); G.$('#hold-note', box).remove(); state(); };
    lock.addEventListener('pointerdown', () => { lock.classList.add('holding'); t = setTimeout(open, 1800); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => lock.addEventListener(ev, () => { clearTimeout(t); lock.classList.remove('holding'); }));
    box.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.s) { s[el.dataset.s] = el.checked; G.persist(); if (el.dataset.s === 'music') G.music(G.current === 'world' && el.checked); if (!s.voice) G.hush(); }
      if (el.dataset.room) { h.roomNames[el.dataset.room] = el.value; G.persist(); if (G.current === 'world') W.refreshRoom(); }
      if (el.id === 'key') { const k = G.keyFromText(el.value); if (k) G.setKey(k).then(state); }
    });
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-reset]'); if (!b) return;
      if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to erase'; return; }
      const what = b.dataset.reset;
      const now = Date.now(); G.save.resets = G.save.resets || {}; G.save.resets[what] = now;
      if (what === 'house') G.save.house = Object.assign(G.defaultHouse(), { roomNames: h.roomNames, born: now + 1 }); else delete G.save.profiles[what];
      G.persist(); b.textContent = 'Erased'; b.disabled = true;
      setTimeout(() => { G.closeModal(); G.go('title'); }, 600);
    });
  };

  G.start = () => {
    G.load(); G.initBeep();
    G.photosReady();
    window.addEventListener('hashchange', () => G.photosReady()); // Dad's key link, opened while the game is already up
    G.facesReady().then(() => {
      G.go('title');
      // pull in progress and decorating saved on other computers
      if (window.CLOUD) {
        G.markSeen();
        CLOUD.onChange = what => {
          if (G.current === 'title') G.go('title');
          else if (G.current === 'world' && what === 'house' && G.W.rebuild) G.W.rebuild();
          const p = G.P(); if (p) G.$$('.star-count').forEach(e => e.textContent = p.stars);
        };
        CLOUD.sync();
        document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - CLOUD.lastSync > 60000) CLOUD.sync(); });
      }
    });
    document.addEventListener('pointerdown', () => G.audio(), true);
    document.addEventListener('contextmenu', e => e.preventDefault());
  };
})();
