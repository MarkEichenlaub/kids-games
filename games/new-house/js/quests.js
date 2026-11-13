// Jobs from Mama and Baba, the first visit, packages, and the little games inside the jobs.
(() => {
  const W = G.W, M = G.MAP;
  const Q = G.Q = { active: null };
  const GIVES = { mama: ['unpack', 'socks', 'hide', 'bedtime'], baba: ['course', 'pancakes', 'garden', 'lights', 'swim'] };
  const ICON = { intro: '🔔', unpack: '📦', socks: '🧦', hide: '🧸', bedtime: '🌙', pancakes: '🥞', course: '🏁', garden: '🌷', lights: '🔦', swim: '🏊' };
  const little = () => G.isLittle();
  const P = () => G.P();

  // ---------- helpers ----------
  const spot = (floor, x, y) => { const s = M.nearestFree(floor, x, y, 6) || [x, y]; return { floor, x: s[0], y: s[1] }; };
  const aim = (floor, x, y) => W.setTarget(spot(floor, x, y));
  const aimFx = id => { const f = M.fixture(id); const s = M.nearestFree(f.floor, f.x + f.w / 2, f.y + f.h / 2, 6); W.setTarget({ floor: f.floor, x: s[0], y: s[1] }); };
  const aimRoom = id => { const c = M.roomCenter(id); aim(M.room(id).floor, c[0], c[1]); };
  const say = (line, queue) => { if (Q.active) Q.active.line = line; return G.beep(line, { queue }); };
  const step = n => { if (Q.active) Q.active.step = n; };
  function marks() {
    for (const n of W.npcs) n.mark = !Q.active && P().intro ? '!' : null;
    W.setQuestPill(Q.active ? ICON[Q.active.id] + (Q.active.count ? ' ' + Q.active.count : '') : '', () => { G.sfx.tap(); Q.hint(); });
  }
  const nextFor = who => { const list = GIVES[who], d = P().done; const fresh = list.find(id => !d[id]); if (fresh) return fresh; const others = list.filter(id => id !== d['last_' + who]); return G.pick(others); };
  function start(id, who) {
    Q.active = { id, step: 0, who, data: {} };
    if (who) P().done['last_' + who] = id;
    marks(); QUEST[id].start(Q.active.data);
    marks();
  }
  function finish() {
    const a = Q.active; if (!a) return;
    Q.active = null; W.setTarget(null); W.player.hold = null; W.dark = false;
    const d = P().done; d[a.id] = (d[a.id] || 0) + 1; G.persist();
    G.sfx.great(); W.celebrate(); G.addStars(5, ...W.screenOf(W.player));
    marks();
    G.beep(G.T('q.' + a.id + '.done')).then(() => Q.reward());
  }
  Q.finish = finish;

  // ---------- packages ----------
  const PKG = M.floors[1].spots.pkg;
  function spawnPkg() {
    if (!(G.save.house.pendingPkg > 0) || W.prop('pkg')) return;
    W.addProp({ id: 'pkg', floor: 1, x: PKG[0], y: PKG[1], icon: '📦', tag: '🎀', size: 1.7, r: 1.3, glow: 1, onTap: openPkg });
  }
  Q.reward = () => {
    const h = G.save.house; h.pendingPkg = (h.pendingPkg || 0) + 1; G.persist();
    spawnPkg(); G.sfx.doorbell();
    if (!Q.active) W.setTarget({ floor: 1, x: PKG[0], y: PKG[1], tall: -1.5 });
    return G.beep(G.T('pkgCome'), { queue: true });
  };
  function openPkg() {
    const h = G.save.house;
    h.pendingPkg = Math.max(0, (h.pendingPkg || 1) - 1);
    W.removeProp('pkg'); if (W.target && W.target.x === PKG[0] && W.target.y === PKG[1]) W.setTarget(null);
    const got = G.PACKAGE_ITEMS.slice(h.nextPkg, h.nextPkg + 2);
    G.sfx.gift(); G.confetti(60);
    if (!got.length) { G.addStars(5, ...W.screenOf(W.player)); G.beep(G.T('pkgNone')); }
    else {
      h.nextPkg += got.length; got.forEach(id => { if (!h.unlocked.includes(id)) h.unlocked.push(id); });
      G.modal(`<div class="pkg"><h2>🎁</h2><div class="row">${got.map(id => `<div class="pkg-item"><img src="${G.itemThumb(id)}" alt=""><b>${G.ITEMS[id].name}</b></div>`).join('')}</div><div class="pkg-tip">🎨</div></div>`);
      G.beep(G.T('pkgOpen'));
    }
    G.persist(); setTimeout(spawnPkg, 1500);
  }

  // ---------- the first visit ----------
  function intro() {
    Q.active = { id: 'intro', step: 0, data: {} };
    M.fixture('doorbell').hint = true;
    aim(1, ...M.floors[1].spots.bell);
    marks();
    say(G.T('intro1')).then(() => { if (Q.active && Q.active.id === 'intro' && Q.active.step === 0 && !W.player.moving && !W.player.path) G.beep(G.T('introMove')); });
  }

  // ---------- jobs ----------
  const BOX_SPOTS = M.spots.boxes, HIDE_SPOTS = M.spots.hides;
  const nearestProp = prefix => {
    const p = W.player; let best = null, bd = 1e9;
    for (const q of W.props) if (q.id.startsWith(prefix)) { const d = G.dist(p.x, p.y, q.x, q.y) + (q.floor === p.floor ? 0 : 60); if (d < bd) { bd = d; best = q; } }
    return best;
  };
  const aimProp = q => q && W.setTarget({ floor: q.floor, x: q.x, y: q.y, tall: -1.6 });

  const QUEST = {
    // carry what is in each moving box to the room where it belongs
    unpack: {
      start(d) {
        const n = little() ? 3 : 5, picks = G.shuffle(G.UNPACK).slice(0, n), spots = G.shuffle(BOX_SPOTS);
        d.left = n; d.held = null;
        picks.forEach((u, i) => {
          const s = spots.find(q => !u.rooms.includes((M.roomAt(q[0], q[1], q[2]) || {}).id)) || spots[0]; spots.splice(spots.indexOf(s), 1);
          const sp = spot(s[0], s[1], s[2]);
          W.addProp({ id: 'box' + i, floor: sp.floor, x: sp.x, y: sp.y, icon: '📦', size: 1.6, r: 1.2, glow: 1, onTap: pr => this.open(d, u, pr) });
        });
        Q.active.count = n;
        say(G.T('q.unpack.start')); aimProp(nearestProp('box'));
      },
      open(d, u, pr) {
        if (d.held) { say(G.T('unpackAsk', d.held.name)); return; }
        W.removeProp(pr.id); d.held = u; W.player.hold = u.icon2 || u.icon; G.sfx.pop(); W.puff(pr.x, pr.y - 1, '✨', 6, pr.floor);
        if (little()) { say(G.T('unpackAsk', u.name) + ' ' + G.T('unpackHint', G.roomShort(u.rooms[0]))); aimRoom(u.rooms[0]); }
        else { say(G.T('unpackAsk', u.name)); W.setTarget(null); }
      },
      room(d, id) {
        if (!d.held || !d.held.rooms.includes(id)) return;
        const p = W.player; W.puff(p.x, p.y - 3.5, d.held.icon, 1); W.puff(p.x, p.y - 2, '✨', 6);
        p.hold = null; d.held = null; d.left--; Q.active.count = d.left || ''; G.sfx.good(); G.addStars(1, ...W.screenOf(p)); marks();
        if (!d.left) return finish();
        say(G.T('unpackYes') + ' ' + G.T('q.unpack.next')); aimProp(nearestProp('box'));
      },
      hint(d) {
        if (d.held) { say(G.T('unpackHint', G.roomShort(d.held.rooms[0]))); aimRoom(d.held.rooms[0]); }
        else { say(G.T('q.unpack.next')); aimProp(nearestProp('box')); }
      },
    },
    // stuffed animals peek out from corners all over the house
    hide: {
      start(d) {
        const n = little() ? 3 : 5, picks = G.shuffle(G.HIDERS).slice(0, n), spots = G.shuffle(HIDE_SPOTS).slice(0, n);
        d.left = n; Q.active.count = n; d.cue = 3;
        picks.forEach((h, i) => { const sp = spot(spots[i][0], spots[i][1], spots[i][2]); W.addProp({ id: 'hid' + i, floor: sp.floor, x: sp.x, y: sp.y, icon: h[0], size: 1.25, r: 1.2, peek: 1, wiggle: 1, bob: 0, onTap: pr => this.found(d, h, pr) }); });
        say(G.T('q.hide.start')); if (little()) aimProp(nearestProp('hid'));
      },
      found(d, h, pr) {
        W.removeProp(pr.id); W.puff(pr.x, pr.y - 1, h[0], 1, pr.floor); W.puff(pr.x, pr.y - 1, '✨', 8, pr.floor);
        d.left--; Q.active.count = d.left || ''; G.sfx.good(); G.addStars(1, ...W.screenOf(W.player)); marks();
        if (!d.left) return finish();
        say(G.T('foundToy', h[1]) + ' ' + G.T('q.hide.next'));
        if (little()) aimProp(nearestProp('hid')); else W.setTarget(null);
      },
      tick(d, dt) {
        d.cue -= dt; if (d.cue > 0) return; d.cue = 3.5;
        const q = nearestProp('hid'); if (q && q.floor === W.floor && G.dist(q.x, q.y, W.player.x, W.player.y) < 8) { G.sfx.squeak(); W.puff(q.x, q.y - 1.4, '🎵', 1, q.floor); }
      },
      hint(d) { const q = nearestProp('hid'); if (!q) return; if (q.floor !== W.floor) say(G.T(q.floor === 2 ? 'q.hide.up' : 'q.hide.down')); else say(G.T('followStar')); aimProp(q); },
    },
    socks: {
      start() { say(G.T('q.socks.start')); aimFx('dryer'); },
      act(d, f) {
        if (Q.active.step === 0 && f.id === 'dryer') { G.sfx.spin(); sockGame(() => { step(1); W.player.hold = '🧦'; say(G.T('q.socks.away')); aimFx('closetA'); }); return true; }
        if (Q.active.step === 1 && f.act === 'closet') { G.sfx.close(); finish(); return true; }
      },
      hint() { say(Q.active.line); aimFx(Q.active.step ? 'closetA' : 'dryer'); },
    },
    bedtime: {
      start() { say(G.T('q.bedtime.start')); aimFx('kidsink'); },
      act(d, f) {
        const s = Q.active.step;
        if (s === 0 && f.id === 'kidsink') { brushGame(() => { step(1); say(G.T('q.bedtime.pjs')); aimFx('closetA'); }); return true; }
        if (s === 1 && f.act === 'closet') { G.sfx.sparkle(); W.puff(W.player.x, W.player.y - 2, '✨', 10); step(2); say(G.T('q.bedtime.bed')); this.aimBed(d); return true; }
      },
      aimBed(d) {
        d.bed = null;
        for (const r of ['bedA', 'bedB']) for (const it of G.itemsIn(r)) if (!d.bed && /bed|bunk/i.test(it.t)) d.bed = { floor: 2, x: it.x, y: it.y };
        if (!d.bed) { const c = M.roomCenter('bedA'); d.bed = { floor: 2, x: c[0], y: c[1] }; }
        W.setTarget({ floor: 2, x: d.bed.x, y: d.bed.y, tall: -1 });
      },
      tick(d) { if (Q.active.step === 2 && d.bed && !d.night && W.floor === 2 && G.dist(W.player.x, W.player.y, d.bed.x, d.bed.y) < 2.2) { d.night = true; night(() => finish()); } },
      hint(d) { say(Q.active.line); const s = Q.active.step; if (s === 0) aimFx('kidsink'); else if (s === 1) aimFx('closetA'); else this.aimBed(d); },
    },
    pancakes: {
      start() { say(G.T('q.pancakes.start')); aimFx('fridge'); },
      act(d, f) {
        const s = Q.active.step;
        if (s === 0 && f.id === 'fridge') { f.on = true; G.sfx.open(); countGame('eggs', '🥚', () => { f.on = false; step(1); say(G.T('q.pancakes.flour')); aimFx('pantry'); }); return true; }
        if (s === 1 && f.act === 'pantry') { G.sfx.pop(); countGame('flour', '🌾', () => { step(2); say(G.T('q.pancakes.cook')); aimFx('stove'); }); return true; }
        if (s === 2 && f.id === 'stove') { f.on = true; flipGame(() => { f.on = false; step(3); W.player.hold = '🥞'; say(G.T('q.pancakes.carry')); aimRoom('dining'); }); return true; }
      },
      room(d, id) { if (Q.active.step === 3 && id === 'dining') { const p = W.player; W.puff(p.x, p.y - 2, '🥞', 5); W.puff(p.x, p.y - 2, '😋', 2); finish(); } },
      hint() { say(Q.active.line); const s = Q.active.step; s === 0 ? aimFx('fridge') : s === 1 ? aimFx('pantry') : s === 2 ? aimFx('stove') : aimRoom('dining'); },
    },
    garden: {
      start() { G.save.house.flowers = {}; G.persist(); say(G.T('q.garden.start')); this.next(); },
      next() { const id = ['pot1', 'pot2', 'pot3', 'pot4'].find(k => !((G.save.house.flowers[k] || {}).stage >= 2)); if (id) aimFx(id); return id; },
      garden() { if (!this.next()) { for (let i = 0; i < 6; i++) W.puff(-3 + i * 1.8, 33 + (i % 3) * 1.5, '🦋', 1, 1); finish(); } },
      hint() { say(Q.active.line); this.next(); },
    },
    lights: {
      start() { W.dark = true; G.sfx.oops(); say(G.T('q.lights.start')); aimFx('panel'); M.fixture('panel').alert = true; },
      act(d, f) { if (f.id === 'panel') { simonGame(() => { W.dark = false; f.alert = false; f.on = true; G.sfx.sparkle(); finish(); }); return true; } },
      hint() { say(Q.active.line); aimFx('panel'); },
    },
    // build an obstacle course (Beep builds it for the little one), then run it
    course: {
      start(d) {
        d.room = 'courtyard';
        if (little()) { if (!G.course.valid('courtyard')) G.course.surprise('courtyard'); step(2); say(G.T('q.course.startLittle')); }
        else say(G.T('q.course.start'));
        this.aim(d);
      },
      aim(d) { const p = G.course.parts(d.room); if (p.start) aim(M.room(d.room).floor, p.start.x, p.start.y); else aimRoom(d.room); },
      decorOpen(d, room) { d.room = room; if (Q.active.step === 0) step(1); },
      decor(d, room) {
        if (Q.active.step > 1) return;
        d.room = room;
        if (G.course.valid(room)) { step(2); say(G.T('q.course.run'), true); this.aim(d); }
        else say(G.T('course.' + G.course.missing(room)), true);
      },
      course(d) { finish(); },
      hint(d) { say(Q.active.line); this.aim(d); },
    },
    swim: {
      start() { say(G.T('q.swim.start')); aimFx('sign'); },
      town(d, place) { if (place === 'pool') d.swam = true; },
      townClose(d) { if (d.swam) finish(); },
      hint() { say(Q.active.line); aimFx('sign'); },
    },
  };

  // ---------- hooks the world calls ----------
  Q.begin = () => {
    Q.active = null; W.dark = false;
    if (!P().intro) intro(); else { marks(); spawnPkg(); }
  };
  Q.talk = npc => {
    if (W.target && W.target.x === npc.x && W.target.y === npc.y) W.setTarget(null);
    npc.wave = true; setTimeout(() => { npc.wave = false; }, 2500);
    if (Q.active) { if (Q.active.id === 'intro') return; G.beep(G.T('busy')); return; }
    if (!P().intro) return;
    G.sfx.chime(); start(nextFor(npc.who), npc.who);
  };
  Q.onAct = f => {
    const a = Q.active; if (!a) return false;
    if (a.id === 'intro') {
      if (f.id !== 'doorbell' || a.step !== 0) return false;
      G.sfx.doorbell(); f.on = true; setTimeout(() => { f.on = false; }, 700); f.hint = false;
      a.step = 1; const p = P(); p.intro = true; p.stamps.yard = 1; p.stamps.porch = 1; G.persist(); W.updateHud();
      say(G.T('intro2')); aim(1, ...M.floors[1].spots.inside);
      return true;
    }
    const q = QUEST[a.id]; return !!(q.act && q.act(a.data, f));
  };
  Q.onItem = () => false;
  Q.onRoom = id => {
    const a = Q.active; if (!a) return;
    if (a.id === 'intro') {
      if (a.step === 1 && id === 'living') {
        a.step = 2; W.setTarget(null);
        const mama = W.npcs.find(n => n.id === 'mama'); if (mama) { mama.wave = true; setTimeout(() => { mama.wave = false; }, 5000); }
        G.beep(G.T('intro3'), { queue: true }).then(() => G.beep(G.T('intro4'))).then(() => { if (Q.active && Q.active.id === 'intro') { Q.active = null; marks(); } });
      }
      return;
    }
    const q = QUEST[a.id]; if (q.room) q.room(a.data, id);
  };
  Q.onDecorOpen = room => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].decorOpen) QUEST[a.id].decorOpen(a.data, room); };
  Q.onDecor = room => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].decor) QUEST[a.id].decor(a.data, room); };
  Q.onCourse = room => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].course) QUEST[a.id].course(a.data, room); };
  Q.onGarden = () => { const a = Q.active; if (a && a.id === 'garden') QUEST.garden.garden(); };
  Q.onTown = place => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].town) QUEST[a.id].town(a.data, place); };
  Q.onTownClose = () => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].townClose) QUEST[a.id].townClose(a.data); };
  Q.tick = dt => { const a = Q.active; if (a && QUEST[a.id] && QUEST[a.id].tick) QUEST[a.id].tick(a.data, dt); };
  // tapping Beep: say the job again and show the way
  Q.hint = () => {
    const a = Q.active;
    if (!a) {
      if (W.prop('pkg')) { W.setTarget({ floor: 1, x: PKG[0], y: PKG[1], tall: -1.5 }); G.beep(G.T('pkgCome')); return true; }
      if (P().intro) { // point at the nearest grown-up
        const p = W.player, n = W.npcs.slice().sort((a, b) => (a.floor !== p.floor) - (b.floor !== p.floor) || G.dist(a.x, a.y, p.x, p.y) - G.dist(b.x, b.y, p.x, p.y))[0];
        if (n) W.setTarget({ floor: n.floor, x: n.x, y: n.y, tall: 1.4 }); G.beep(G.T('askJob')); return true;
      }
      return false;
    }
    if (a.id === 'intro') { if (a.step === 0) { say(G.T('intro1')); aim(1, ...M.floors[1].spots.bell); } return true; }
    if (W.target && W.target.floor !== W.floor && a.id !== 'hide') { G.beep(G.T(W.floor === 1 ? 'upstairsHint' : 'downstairsHint')); return true; }
    QUEST[a.id].hint(a.data); return true;
  };
  Q.allStamps = () => {
    G.confetti(120); G.sfx.great();
    G.beep(G.T('allStamps'));
    const box = G.modal(`<div class="pets"><h2>🏠 ⭐ 🏠</h2><div class="row wrap">${G.PETS.map(p => `<button class="pet-btn" data-pet="${p.id}">${p.icon}</button>`).join('')}</div></div>`, { close: false });
    box.onclick = e => {
      const b = e.target.closest('[data-pet]'); if (!b) return;
      const pet = G.PETS.find(p => p.id === b.dataset.pet);
      G.closeModal(); W.setPet(pet.id); G.sfx[pet.sfx](); W.celebrate(); G.beep(G.T('petLine.' + pet.id));
    };
  };

  // ---------- little games ----------
  // put the right number of things in the bowl
  function countGame(kind, icon, done) {
    const lit = little();
    const a = lit ? G.rand(1, 3) : G.rand(1, 4), b = lit ? 0 : G.rand(1, 4), n = a + b;
    const box = G.modal(`<div class="mini count"><div class="mini-top"><span class="ask">${lit ? icon.repeat(n) : `${a} + ${b}`}</span></div>
      <div class="tray">${Array.from({ length: 9 }, (_, i) => `<button class="thing" data-i="${i}">${icon}</button>`).join('')}</div>
      <div class="bowl"><div class="bowl-in" id="bowl-in"></div><b id="bowl-n">0</b></div>
      ${lit ? '' : '<button class="btn done" id="count-ok">✅</button>'}</div>`, { cls: 'wide' });
    const ask = lit ? G.T('count.need', n) + ' ' + G.T('count.' + kind) : G.T('count.mira', a, b);
    G.beep(ask);
    let cnt = 0, over = false;
    const win = () => { over = true; G.sfx.great(); G.confetti(30); G.beep(G.T('count.right', n)).then(() => { G.closeModal(); done(); }); };
    const upd = () => { G.$('#bowl-n', box).textContent = cnt; };
    box.addEventListener('click', e => {
      if (over) return;
      const t = e.target.closest('.thing');
      if (t) {
        const inBowl = t.parentElement.id === 'bowl-in';
        if (!inBowl && lit && cnt >= n) return;
        if (inBowl) { G.$('.tray', box).appendChild(t); cnt--; G.sfx.tap(); } else { G.$('#bowl-in', box).appendChild(t); cnt++; G.sfx.step(cnt - 1); }
        upd();
        if (lit && cnt === n) win();
      } else if (e.target.closest('#count-ok')) {
        if (cnt === n) win(); else { G.sfx.oops(); G.beep(cnt > n ? G.T('count.tooMany') : ask); }
      }
    });
  }
  // tap each pancake when it is golden
  function flipGame(done) {
    const box = G.modal(`<div class="mini flip"><div class="pans">${[0, 1, 2].map(i => `<button class="pan" data-i="${i}"><i class="cake"></i></button>`).join('')}</div></div>`, { cls: 'wide' });
    G.beep(G.T('q.pancakes.flip')); G.sfx.sizzle();
    const st = [0, 1, 2].map(i => ({ t: -i * 1.3 - 0.5, done: false }));
    let left = 3, lastT = performance.now(), over = false;
    const cakes = G.$$('.cake', box), COL = t => t < 0 ? '#fff3d6' : t < 2.2 ? `hsl(42,85%,${88 - t * 12}%)` : t < 5.5 ? '#e0a03c' : '#5a3a22';
    const timer = setInterval(() => {
      if (!document.body.contains(box)) { clearInterval(timer); return; }
      const now = performance.now(), dt = (now - lastT) / 1000; lastT = now;
      st.forEach((s, i) => { if (s.done) return; s.t += dt; if (s.t > 7) { s.t = -0.5; G.sfx.oops(); } cakes[i].style.background = COL(s.t); cakes[i].classList.toggle('ready', s.t >= 2.2 && s.t < 5.5); });
    }, 80);
    box.addEventListener('click', e => {
      const pan = e.target.closest('.pan'); if (!pan || over) return;
      const s = st[+pan.dataset.i]; if (s.done) return;
      if (s.t >= 2.2 && s.t < 5.5) { s.done = true; left--; pan.classList.add('flipped'); pan.innerHTML = '<span>🥞</span>'; G.sfx.good(); if (!left) { over = true; clearInterval(timer); G.confetti(30); setTimeout(() => { G.closeModal(); done(); }, 900); } }
      else G.sfx.oops();
    });
  }
  // match the socks, two at a time
  function sockGame(done) {
    const n = little() ? 3 : 6;
    const kinds = G.shuffle([['#ff8fb8', '⭐'], ['#7fb5ff', '⭐'], ['#ffd93d', '💜'], ['#7fdc9a', '🌙'], ['#b58cff', '🌙'], ['#ff9f43', '💜'], ['#ff8fb8', '🌙'], ['#7fb5ff', '💜']]).slice(0, n);
    const socks = G.shuffle(kinds.flatMap((k, i) => [i, i]));
    const box = G.modal(`<div class="mini socks"><div class="sock-grid n${n}">${socks.map(i => `<button class="sock" data-k="${i}" style="--c:${kinds[i][0]}"><span>🧦</span><i>${kinds[i][1]}</i></button>`).join('')}</div></div>`, { cls: 'wide' });
    G.beep(G.T('q.socks.game'));
    let first = null, left = n;
    box.addEventListener('click', e => {
      const s = e.target.closest('.sock'); if (!s || s.classList.contains('gone')) return;
      if (!first) { first = s; s.classList.add('pick'); G.sfx.tap(); return; }
      if (s === first) { first.classList.remove('pick'); first = null; return; }
      if (s.dataset.k === first.dataset.k) { [s, first].forEach(x => { x.classList.remove('pick'); x.classList.add('gone'); }); first = null; left--; G.sfx.good(); if (!left) { G.confetti(30); setTimeout(() => { G.closeModal(); done(); }, 800); } }
      else { G.sfx.oops(); const f = first; first = null; s.classList.add('no'); f.classList.add('no'); setTimeout(() => { s.classList.remove('no'); f.classList.remove('no', 'pick'); }, 450); }
    });
  }
  // tap the germs off the teeth
  function brushGame(done) {
    const n = little() ? 5 : 9;
    const box = G.modal(`<div class="mini brush"><div class="mouth"><div class="teeth">${'<i></i>'.repeat(8)}</div><div class="teeth low">${'<i></i>'.repeat(8)}</div>
      ${Array.from({ length: n }, (_, i) => `<button class="germ" style="left:${8 + (i * 37) % 80}%;top:${12 + (i * 53) % 62}%;animation-delay:${-(i * 0.37)}s">🦠</button>`).join('')}</div><div class="brush-tip">🪥</div></div>`, { cls: 'wide' });
    G.beep(G.T('q.bedtime.brush'));
    let left = n;
    box.addEventListener('pointerdown', e => {
      const g = e.target.closest('.germ'); if (!g || g.classList.contains('gone')) return;
      g.classList.add('gone'); G.sfx.brush(); left--;
      const r = g.getBoundingClientRect(); G.burst(r.left + r.width / 2, r.top + r.height / 2, '✨', 5);
      if (!left) { G.sfx.sparkle(); G.confetti(30); setTimeout(() => { G.closeModal(); done(); }, 900); }
    });
  }
  // watch the lights blink, then tap them in the same order
  function simonGame(done) {
    const rounds = little() ? [2, 3] : [3, 4, 5], cols = ['#ff6f6f', '#ffd93d', '#6fd97b', '#6fa8ff'];
    const box = G.modal(`<div class="mini simon"><div class="simon-grid">${cols.map((c, i) => `<button class="lamp" data-i="${i}" style="--c:${c}">💡</button>`).join('')}</div><div class="simon-dots" id="simon-dots"></div></div>`, { cls: 'wide' });
    const lamps = G.$$('.lamp', box);
    let round = 0, seq = [], pos = 0, listening = false, dead = false;
    const alive = () => !dead && document.body.contains(box);
    const flash = i => { lamps[i].classList.add('lit'); G.sfx.note(i * 2); setTimeout(() => lamps[i].classList.remove('lit'), 380); };
    const dots = () => { G.$('#simon-dots', box).innerHTML = rounds.map((_, i) => `<i class="${i < round ? 'on' : ''}"></i>`).join(''); };
    async function play(fresh) {
      listening = false; dots();
      if (fresh) seq = Array.from({ length: rounds[round] }, () => G.rand(0, 3));
      await G.wait(700);
      for (const i of seq) { if (!alive()) return; flash(i); await G.wait(620); }
      pos = 0; listening = true;
    }
    G.beep(G.T('q.lights.game')).then(() => alive() && play(true));
    box.addEventListener('click', e => {
      const l = e.target.closest('.lamp'); if (!l || !listening) return;
      const i = +l.dataset.i; flash(i);
      if (i !== seq[pos]) { listening = false; G.sfx.oops(); G.beep(G.T('q.lights.again')).then(() => alive() && play(false)); return; }
      pos++;
      if (pos === seq.length) {
        listening = false; round++; dots(); G.sfx.good();
        if (round === rounds.length) { dead = true; G.confetti(30); setTimeout(() => { G.closeModal(); done(); }, 800); } else setTimeout(() => alive() && play(true), 700);
      }
    });
  }
  // lights out, stars, a lullaby, then morning
  function night(done) {
    const e = G.html('<div class="night"><div class="moon">🌙</div><div class="zzz">💤</div></div>');
    for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%'; s.style.animationDelay = Math.random() * 3 + 's'; e.appendChild(s); }
    G.$('#app').appendChild(e); requestAnimationFrame(() => e.classList.add('on'));
    const lull = [4, 4, 7, 4, 4, 7, 4, 7, 9, 8, 7, 5]; lull.forEach((n, i) => setTimeout(() => G.sfx.note(n % 8), 900 + i * 480));
    G.beep(G.T('q.bedtime.night'));
    setTimeout(() => { e.classList.remove('on'); setTimeout(() => e.remove(), 1200); done(); }, 7600);
  }
  Q.games = { countGame, flipGame, sockGame, brushGame, simonGame, night };
  Q.start = start;
})();
