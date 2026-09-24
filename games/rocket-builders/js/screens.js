// Title, launch base, Rocket TV, the rocket-making story, sticker book, grown-up settings.

G.screens.title = {
  enter(root) {
    root.className = 'starry';
    G.showBeep(false);
    const kids = G.FAMILY.kids;
    const demo = { nose: 'nose-star', capsule: 'cap-basic', bodies: ['body-rainbow'], fins: 'fins-swept', engine: 'eng-2', boosters: 'boost-basic', color: '#9b6bff', accent: '#fff', stickers: [], crew: 'kid' };
    root.innerHTML = `${G.starBg(140)}<div class="title-wrap">
      <div class="title-rocket">${G.art.rocket(demo, { flame: true }).svg.replace('<svg ', '<svg style="width:100%;height:auto;overflow:visible" ')}</div>
      <div class="title-logo">Rocket Builders</div>
      <div class="title-sub">Build a rocket. Fly to space. Explore the stars!</div>
      <div class="profile-row">${kids.map(k => {
        const prof = G.save.profiles[k.id];
        const face = prof && prof.face ? `<img src="${prof.face}">` : k.face;
        return `<button class="profile-card" data-k="${k.id}" style="border-color:${k.color}"><div class="face" style="background:${k.color}33">${face}</div>${k.name}<small>${prof ? '⭐ ' + prof.stars : k.blurb}</small></button>`;
      }).join('')}</div>
    </div><button class="corner-link">⚙️ Grown-ups</button>`;
    root.querySelectorAll('.profile-card').forEach(b => b.onclick = () => {
      const k = G.FAMILY.kid(b.dataset.k);
      G.audio(); G.sfx.great();
      G.usePro(k.id, k.name, k.little);
      G.go('hub', { hello: true });
    });
    root.querySelector('.corner-link').onclick = () => G.grownups();
  },
};

G.screens.hub = {
  enter(root, arg = {}) {
    const p = G.P(), r = p.rocket;
    const little = G.isLittle();
    const night = !!p.flags.night;
    root.innerHTML = `<div class="hub${night ? ' night' : ''}">
      <div class="sun"></div>
      ${[0, 1, 2].map(i => `<div class="cloud" style="top:${6 + i * 11}%;width:${110 + i * 30}px;height:${34 + i * 6}px;animation-duration:${40 + i * 17}s;animation-delay:-${i * 13}s"></div>`).join('')}
      ${night ? G.starBg(60) : ''}
      <div class="hub-grid"></div></div>`;
    G.topbar(root, { onBack: () => G.go('title'), backIcon: '👋', title: `🏠 ${G.kidName()}'s Launch Base` });
    G.showBeep(true); G.music('base');
    const miss = G.rocketMissing(r);
    const power = G.rocketPower(r);
    const nextEngine = G.ch.nextPrize('engine');
    const stations = [
      { id: 'workshop', ic: '🏭', nm: 'Rocket Factory', go: () => G.go('workshop'), badge: p.flags.newParts ? 'NEW' : '', glow: miss.length > 0 },
      { id: 'launch', ic: '🚀', nm: 'Launch Pad', go: () => miss.length ? (G.sfx.oops(), G.beep('Your rocket isn\'t finished yet! Let\'s go to the Rocket Factory.').then(() => G.go('workshop'))) : G.go('launch'), glow: !miss.length, cls: 'launch' },
      { id: 'engine', ic: '🔥', nm: 'Engine Lab', go: () => G.go('challenge', 'engine'), glow: !miss.length && power < 5 && p.launched > 0 && nextEngine },
      { id: 'fuel', ic: '⛽', nm: 'Fuel Depot', go: () => G.go('challenge', 'fuel') },
      { id: 'words', ic: '🔤', nm: 'Mission Control', go: () => G.go('challenge', 'words') },
      { id: 'puzzle', ic: '🧩', nm: 'Puzzle Lab', go: () => G.go('challenge', 'puzzle') },
      { id: 'shapes', ic: '🔷', nm: 'Shape Shop', go: () => G.go('challenge', 'shapes') },
      { id: 'story', ic: '📖', nm: 'How Rockets Are Made', go: () => G.go('story') },
      { id: 'tv', ic: '📺', nm: 'Rocket TV', go: () => G.go('tv') },
      { id: 'book', ic: '📒', nm: 'Sticker Book', go: () => G.go('book'), badge: Object.keys(p.stickers).length ? String(Object.keys(p.stickers).length) : '' },
    ];
    const grid = root.querySelector('.hub-grid');
    stations.forEach(s => {
      const b = G.html(`<button class="station ${s.cls || ''}${s.glow ? ' glow' : ''}"><span class="ic">${s.ic}</span><span class="nm">${s.nm}</span>${s.badge ? `<span class="badge">${s.badge}</span>` : ''}</button>`);
      b.onclick = () => { G.sfx.tap(); s.go(); };
      grid.appendChild(b);
    });
    // tap the sun five times for nighttime
    let sunTaps = 0;
    root.querySelector('.sun').onclick = () => {
      G.sfx.boop(); sunTaps++;
      if (sunTaps === 5) { p.flags.night = !p.flags.night; G.persist(); G.sfx.warp(); G.go('hub'); setTimeout(() => G.beep(p.flags.night ? 'You turned on nighttime! Look at all the stars! Goodnight, Sun!' : 'Good morning! The Sun is back!'), 300); }
    };
    // what Beep says
    const today = new Date().toDateString();
    const bday = G.FAMILY.birthdayNow(p.id);
    let line;
    if (arg.hello && bday && p.flags.bdaySaid !== today) { p.flags.bdaySaid = today; G.confetti(150); line = `Happy birthday, ${G.kidName()}! Beep boop! I made you a birthday party!`; }
    else if (arg.hello && p.flags.helloDay !== today) { p.flags.helloDay = today; line = G.pick(G.FAMILY.hellos[p.id] || [`Hi ${G.kidName()}!`]); }
    if (!p.flags.hubIntro) { p.flags.hubIntro = 1; line = `Hi ${G.kidName()}! I'm Beep, your robot helper! This is your Launch Base. Let's build a rocket! Tap the Rocket Factory!`; }
    else if (!line) {
      if (miss.length) line = 'Let\'s finish your rocket in the Rocket Factory!';
      else if (!p.launched) line = 'Your rocket is ready! Tap the Launch Pad to blast off!';
      else if (p.flags.newParts) line = 'You have a new part! Put it on your rocket in the Rocket Factory!';
      else if (power < 5 && nextEngine) line = G.pick([`Want to fly farther? Solve puzzles in the Engine Lab for a stronger engine!`, 'Where should we go today?', 'Want to fly to space again?']);
      else line = G.pick(['Where should we go today?', 'Want to learn how real rockets are made? Tap the story book!', 'Let\'s go to space!']);
    }
    G.persist();
    setTimeout(() => { if (G.current === 'hub') G.beep(line); }, 350);
  },
};

G.screens.tv = {
  enter(root) {
    const p = G.P(), D = G.DATA;
    root.innerHTML = `<div class="tvroom">${D.videoTopics.map(t => `<div class="tv-section"><h3>${t.name}</h3><div class="tv-grid">${D.videos.filter(v => v.topic === t.id).map(v => `
      <button class="tv-card${p.videosSeen[v.id] ? ' seen' : ''}" data-v="${v.id}"><img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy"><span class="play">▶</span><div class="t">${v.title}</div></button>`).join('')}</div></div>`).join('')}</div>`;
    G.topbar(root, { title: '📺 Rocket TV' });
    G.showBeep(true, true); G.music(null);
    root.querySelectorAll('.tv-card').forEach(b => b.onclick = () => { G.sfx.tap(); G.playVideo(b.dataset.v, () => b.classList.add('seen')); });
    G.beep('Real videos of real rockets! Tap one to watch.');
  },
};

G.screens.story = {
  enter(root) {
    const steps = G.DATA.story;
    let i = 0;
    root.innerHTML = `<div class="story"><div class="story-card"><div class="story-step"></div><div class="story-art"></div><div class="story-text"></div>
      <div class="story-nav"><button class="big-btn small blue" data-a="prev">⬅️</button><button class="big-btn small" data-a="tv" style="display:none">📺 See it for real</button><button class="big-btn small green" data-a="next">Next ➡️</button></div></div></div>`;
    G.topbar(root, { title: '📖 How Rockets Are Made' });
    G.showBeep(true, true); G.music('think');
    const art = root.querySelector('.story-art');
    const show = () => {
      const s = steps[i];
      root.querySelector('.story-step').textContent = `Page ${i + 1} of ${steps.length}`;
      art.innerHTML = s.art;
      art.style.animation = 'none'; void art.offsetWidth; art.style.animation = 'pop .5s';
      root.querySelector('.story-text').textContent = s.text;
      root.querySelector('[data-a=tv]').style.display = s.video ? '' : 'none';
      root.querySelector('[data-a=prev]').style.visibility = i ? 'visible' : 'hidden';
      root.querySelector('[data-a=next]').textContent = i === steps.length - 1 ? '🏭 Build one!' : 'Next ➡️';
      G.beep(s.text, { linger: 8000 });
      if (s.balloon) {
        art.innerHTML = '<button style="background:none;font-size:inherit" title="Let go!">🎈</button><div style="font-size:20px">Tap the balloon to let it go!</div>';
        art.querySelector('button').onclick = (e) => {
          const b = e.currentTarget; G.sfx.whoosh();
          b.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(120px,-80px) rotate(90deg)' }, { transform: 'translate(-160px,-160px) rotate(260deg)' }, { transform: 'translate(80px,-260px) rotate(420deg)' }, { transform: 'translate(0,0) rotate(720deg)' }], { duration: 1800, easing: 'ease-in-out' });
          G.beep('Whoosh! The air pushed out the back, and the balloon went the other way!');
        };
      }
    };
    root.querySelectorAll('.story-nav [data-a]').forEach(b => b.onclick = () => {
      G.sfx.tap();
      if (b.dataset.a === 'tv') { G.playVideo(steps[i].video); return; }
      if (b.dataset.a === 'prev') i = Math.max(0, i - 1);
      else { if (i === steps.length - 1) { const p = G.P(); if (!p.flags.storyDone) { p.flags.storyDone = 1; G.addStars(3); } G.go('workshop'); return; } i++; }
      show();
    });
    show();
  },
};

G.screens.book = {
  enter(root) {
    const p = G.P(), W = G.WORLD;
    const places = W.places.filter(pl => !pl.decor && !pl.hidden);
    const aliens = G.FAMILY.aliens;
    const owned = G.DATA.parts.filter(pt => p.parts.includes(pt.id)).length;
    root.innerHTML = `<div class="book">
      <h3>🪐 Places I've explored (${places.filter(pl => p.stickers[pl.id]).length} of ${places.length})</h3><div class="sticker-grid places"></div>
      <h3>👽 Alien friends</h3><div class="sticker-grid aliens"></div>
      <h3>🔧 Rocket parts (${owned} of ${G.DATA.parts.length})</h3><div class="sticker-grid parts"></div>
      <h3>🔤 Words I can spell (${Object.keys(p.words || {}).length})</h3><div class="word-list">${Object.keys(p.words || {}).map(w => `<button class="word-chip" data-w="${w}">${G.PHONICS.pic(w)} ${w}</button>`).join('') || '<span style="font-size:20px">Sound out words to fill this page!</span>'}</div>
      <h3>🏅 Stats</h3><div style="font-size:22px;line-height:1.7">⭐ ${p.stars} stars &nbsp; ✨ ${p.starBits} star bits &nbsp; 🚀 ${p.launched || 0} launches &nbsp; 📺 ${Object.keys(p.videosSeen).length} videos</div>
    </div>`;
    G.topbar(root, { title: `📒 ${G.kidName()}'s Sticker Book` });
    G.showBeep(true, true); G.music('base');
    const pg = root.querySelector('.places');
    places.forEach(pl => {
      const got = p.stickers[pl.id], seen = p.visited[pl.id];
      const el = G.html(`<button class="sticker${got ? '' : ' missing'}"><span>${pl.sticker || '⭐'}</span><small>${seen ? pl.name : '???'}</small></button>`);
      el.onclick = () => { G.sfx.tap(); if (seen) G.beep(G.pick(pl.facts)); else G.beep(pl.tier > G.rocketPower(p.rocket) ? 'This place is far away! Build a stronger engine to find it.' : 'Fly around in space to find this place!'); };
      pg.appendChild(el);
    });
    const ag = root.querySelector('.aliens');
    aliens.forEach(a => {
      const got = p.stickers['alien-' + a.id];
      ag.appendChild(G.html(`<div class="sticker${got ? '' : ' missing'}"><span>${a.e}</span><small>${got ? a.name : '???'}</small></div>`));
    });
    const partsG = root.querySelector('.parts');
    G.DATA.parts.forEach(pt => {
      const got = p.parts.includes(pt.id);
      const el = G.html(`<button class="sticker${got ? '' : ' missing'}" style="padding:12px">${got ? G.art.part(pt.id).replace('<svg ', '<svg style="width:70%;height:60%" ') : '<span>🔒</span>'}<small>${got ? pt.name : '???'}</small></button>`);
      el.onclick = () => { G.sfx.tap(); G.beep(got ? pt.name + '!' : `Earn this at ${G.whereToEarn(pt.id)}!`); };
      partsG.appendChild(el);
    });
    root.querySelectorAll('.word-chip').forEach(b => b.onclick = () => { G.sfx.tap(); const w = b.dataset.w; G.sayMix([...w.split('').map(l => ({ snd: l })), w]); });
    G.beep(`${G.kidName()}'s sticker book! Land on planets and do their missions to get more stickers.`);
  },
};

// ---------- grown-up settings ----------
G.grownups = () => {
  const s = G.save.settings;
  const kids = G.FAMILY.kids;
  const lvlSel = (k, key, max) => { const pr = G.save.profiles[k.id]; const v = pr ? pr.level[key] : (G.defaultProfile(k.id).level[key]); return `<select data-k="${k.id}" data-l="${key}">${Array.from({ length: max + 1 }, (_, i) => `<option value="${i}"${i === v ? ' selected' : ''}>${i}</option>`).join('')}</select>`; };
  const m = G.modal(`<div class="grownup"><h2>⚙️ Grown-ups</h2>
    <p>Rocket Builders reads everything out loud, so it works for kids who don't read yet. Progress saves in this browser only. Photos you add for the rocket window stay on this device.</p>
    <div class="row"><label><input type="checkbox" data-s="voice" ${s.voice ? 'checked' : ''}> Beep talks</label>
      <label><input type="checkbox" data-s="sound" ${s.sound ? 'checked' : ''}> Sound effects</label>
      <label><input type="checkbox" data-s="music" ${s.music ? 'checked' : ''}> Music</label></div>
    <label>Talking speed <input type="range" min="0.7" max="1.2" step="0.05" value="${s.rate}" data-rate></label>
    <h3>Difficulty (it adjusts itself as they play)</h3>
    <p>Math follows Beast Academy levels 1 and 2: 0 = counting to 5, 1 = counting and sums to 5, 2 = within 10 and making ten, 3 = within 20 and skip counting, 4 = tens and ones, odd and even, 5 = two-digit sums and triangle numbers, 6 = hundreds and two-digit sums.</p>
    ${kids.map(k => `<div class="row"><b style="width:70px">${k.name}</b> Math ${lvlSel(k, 'math', 6)} Spelling ${lvlSel(k, 'words', 3)} Puzzles ${lvlSel(k, 'maze', 5)} Shapes ${lvlSel(k, 'shapes', 3)}</div>`).join('')}
    <h3>Sounding out words</h3><p>Words are spelled the way they sound. Beep says each sound and she picks the letter. After 20 words she gets the whole alphabet instead of four letter choices.</p>
    <p>Letter sounds recorded by reading teacher Kathryn J. Davis, <a href="https://www.soundcityreading.net/" target="_blank">Sound City Reading</a>. Her site offers them free to parents and teachers for use with their own kids.</p>
    <p>Letter names: Lingua Libre speaker "Flame, not lame" (public domain), and W by Twocs (CC BY-SA 3.0), both from Wikimedia Commons.</p>
    ${kids.map(k => { const pr = G.save.profiles[k.id]; return `<div class="row"><b style="width:70px">${k.name}</b><label style="margin:0"><input type="checkbox" data-full="${k.id}" ${pr && pr.flags.phonicsFull ? 'checked' : ''}> Whole alphabet now</label></div>`; }).join('')}
    <div class="row"><b>Letter sounds:</b> ${'abcdefghijklmnoprstuvwyz'.split('').map(l => `<button class="big-btn small" data-snd="${l}" style="padding:6px 12px">${l}</button>`).join('')}</div>
    <h3>Birthdays</h3><p>Beep throws a party the week of each birthday. Saved on this device only.</p>
    ${kids.map(k => `<div class="row"><b style="width:70px">${k.name}</b> <input type="text" placeholder="MM-DD" maxlength="5" style="width:90px" data-bday="${k.id}" value="${(s.birthdays || {})[k.id] || ''}"></div>`).join('')}
    <h3>Progress</h3>
    ${kids.map(k => `<div class="row"><b style="width:70px">${k.name}</b>
      <button class="big-btn small blue" data-unlock="${k.id}">Unlock all parts</button>
      <button class="big-btn small" data-photo="${k.id}">Remove photo</button>
      <button class="big-btn small pink" data-reset="${k.id}">Start over</button></div>`).join('')}
  </div>`);
  m.querySelectorAll('[data-s]').forEach(c => c.onchange = () => { s[c.dataset.s] = c.checked; if (c.dataset.s === 'music') G.music(null); G.persist(); });
  m.querySelectorAll('[data-full]').forEach(c => c.onchange = () => { ensure(c.dataset.full).flags.phonicsFull = c.checked; G.persist(); });
  m.querySelectorAll('[data-snd]').forEach(b => b.onclick = () => { G.audio(); G.sayMix([{ snd: b.dataset.snd }]); });
  m.querySelectorAll('[data-bday]').forEach(inp => inp.onchange = () => { s.birthdays = s.birthdays || {}; s.birthdays[inp.dataset.bday] = /^\d\d-\d\d$/.test(inp.value) ? inp.value : ''; G.persist(); });
  m.querySelector('[data-rate]').oninput = e => { s.rate = +e.target.value; G.persist(); G.say('This is how fast I talk.'); };
  const ensure = id => { if (!G.save.profiles[id]) { const k = G.FAMILY.kid(id); const cur = G.save.current; G.usePro(id, k.name, k.little); G.save.current = cur; } return G.save.profiles[id]; };
  m.querySelectorAll('select[data-l]').forEach(sel => sel.onchange = () => { ensure(sel.dataset.k).level[sel.dataset.l] = +sel.value; G.persist(); });
  m.querySelectorAll('[data-unlock]').forEach(b => b.onclick = () => { const pr = ensure(b.dataset.unlock); pr.parts = G.DATA.parts.map(x => x.id); pr.stars = Math.max(pr.stars, 150); G.persist(); b.textContent = '✔ Unlocked'; });
  m.querySelectorAll('[data-photo]').forEach(b => b.onclick = () => { const pr = G.save.profiles[b.dataset.photo]; if (pr) { pr.face = null; if (pr.rocket.crew === 'me') pr.rocket.crew = 'kid'; G.persist(); } b.textContent = '✔ Removed'; });
  m.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => {
    if (b.dataset.sure) { delete G.save.profiles[b.dataset.reset]; G.persist(); b.textContent = '✔ Reset'; if (G.current === 'title') G.go('title'); return; }
    b.dataset.sure = 1; b.textContent = 'Tap again to erase';
  });
};
