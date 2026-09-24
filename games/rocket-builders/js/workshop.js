// The Rocket Factory: drag parts onto the rocket, paint it, add stickers and crew.
G.rocketPower = (r) => {
  const e = r.engine && G.DATA.partById[r.engine];
  if (!e) return 0;
  return Math.min(5, e.tier + (r.boosters ? 1 : 0));
};
G.rocketMissing = (r) => {
  const need = [];
  if (!r.engine) need.push('engine');
  if (!r.bodies || !r.bodies.length) need.push('body');
  if (!r.fins) need.push('fins');
  if (!r.capsule) need.push('capsule');
  if (!r.nose) need.push('nose');
  return need;
};
G.whereToEarn = (pid) => {
  for (const k in G.DATA.pools) if (G.DATA.pools[k].includes(pid)) return G.ch.STATIONS[k].name;
  const place = G.FAMILY.places.find(p => p.prize && p.prize.includes(pid));
  if (place) return 'a secret place in space';
  if (pid === 'fins-wing') return 'the Space Station';
  return 'somewhere in space';
};

G.screens.workshop = {
  enter(root, arg = {}) {
    const p = G.P(), r = p.rocket;
    const D = G.DATA;
    let cat = arg.cat || (arg.highlight ? D.partById[arg.highlight].cat : null);
    const missing = G.rocketMissing(r);
    if (!cat) cat = missing[0] || 'paint';
    root.innerHTML = `<div class="workshop">
      <div class="ws-left">${D.cats.map(c => `<button class="cat-btn" data-c="${c.id}"><span class="ic">${c.ic}</span>${c.name}</button>`).join('')}</div>
      <div class="ws-tray"></div>
      <div class="ws-stage"><div class="gantry"></div><div id="rocket-holder"></div></div>
      <div class="ws-right">
        <div class="power-meter">Rocket Power<div class="bars">${'<i></i>'.repeat(5)}</div><div class="reach" style="font-size:14px;font-weight:500;margin-top:4px"></div></div>
        <button class="big-btn pink" id="go-launch">🚀 Launch!</button>
      </div></div>`;
    G.topbar(root, { title: '🏭 Rocket Factory' });
    G.showBeep(true, true); G.music('base');
    const tray = root.querySelector('.ws-tray'), holder = root.querySelector('#rocket-holder'), stage = root.querySelector('.ws-stage');
    const catName = { nose: 'nose', capsule: 'capsule', body: 'body', fins: 'fins', engine: 'engine', booster: 'boosters' };

    const renderRocket = (pop) => {
      holder.innerHTML = G.art.rocket(r, { hints: true }).svg;
      if (pop) { holder.style.animation = 'none'; void holder.offsetWidth; holder.style.animation = 'pop .35s'; }
      const pw = G.rocketPower(r);
      root.querySelectorAll('.power-meter .bars i').forEach((b, i) => b.classList.toggle('on', i < pw));
      root.querySelector('.reach').textContent = pw ? 'Can fly to ' + G.ch.tierText(pw) : 'Needs an engine!';
      const miss = G.rocketMissing(r);
      root.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('need', miss[0] === b.dataset.c));
      G.persist();
    };

    const sayCat = (c) => {
      const def = D.cats.find(x => x.id === c);
      if (!p.flags['cat_' + c]) { p.flags['cat_' + c] = 1; G.beep(def.fact); }
      else G.beep(def.name + '!');
    };

    const equip = (pid) => {
      const def = D.partById[pid];
      switch (def.cat) {
        case 'nose': r.nose = pid; break;
        case 'capsule': r.capsule = pid; break;
        case 'fins': r.fins = pid; break;
        case 'engine': r.engine = pid; break;
        case 'booster': r.boosters = pid; break;
        case 'body': if (r.bodies.length >= 3) r.bodies[r.bodies.length - 1] = pid; else r.bodies.push(pid); break;
      }
      G.sfx.snap(); renderRocket(true); renderTray();
      const miss = G.rocketMissing(r);
      if (def.cat === 'engine' || def.cat === 'booster') G.beep(`Rocket power ${G.rocketPower(r)}! Now you can fly to ${G.ch.tierText(G.rocketPower(r))}.`);
      else if (def.cat === 'body' && r.bodies.length > 1) G.beep(r.bodies.length === 3 ? 'Three tanks! That\'s a tall rocket! Tap a tank again to swap the top one.' : 'Two tanks! More fuel!');
      else if (miss.length) { const next = D.cats.find(c => c.id === miss[0]); G.beep(`${def.name}! Now add the ${next.name.toLowerCase()}.`); }
      else if (!p.flags.builtOnce) { p.flags.builtOnce = 1; G.sfx.great(); G.confetti(60); G.beep('Your rocket is ready! Tap Launch when you want to blast off!'); root.querySelector('#go-launch').classList.add('glow'); }
      else G.beep(def.name + '!');
      p.flags.newParts = 0;
    };

    const addSticker = (e, x, y) => {
      r.stickers = r.stickers || [];
      if (r.stickers.length >= 12) r.stickers.shift();
      r.stickers.push({ e, x: Math.round(x), y: Math.round(y), s: 30 });
      G.sfx.pop(); renderRocket(); G.persist();
    };

    // drag from tray
    const startDrag = (card, payload) => {
      let ghost = null, moved = false, sx, sy;
      G.draggable(card, {
        onStart: e => { sx = e.clientX; sy = e.clientY; },
        onMove: e => {
          if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
          if (!ghost) { moved = true; ghost = G.html(`<div class="drag-ghost">${payload.html}</div>`); document.body.appendChild(ghost); G.sfx.tap(); }
          ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
          const sr = stage.getBoundingClientRect();
          stage.classList.toggle('drop-hot', e.clientX > sr.left && e.clientX < sr.right && e.clientY > sr.top && e.clientY < sr.bottom);
        },
        onEnd: e => {
          stage.classList.remove('drop-hot');
          if (ghost) ghost.remove();
          const sr = stage.getBoundingClientRect();
          const over = e.clientX > sr.left && e.clientX < sr.right && e.clientY > sr.top && e.clientY < sr.bottom;
          if (!moved) { payload.tap(); return; }
          if (over) payload.drop(e);
        },
      });
    };

    const renderTray = () => {
      root.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('on', b.dataset.c === cat));
      tray.innerHTML = '';
      if (cat === 'paint') {
        tray.innerHTML = `<div style="color:#fff;font-weight:700;width:100%">Main color</div><div class="color-row" style="justify-content:flex-start">${D.colors.map(c => `<button class="color-dot${r.color === c ? ' on' : ''}" data-m="${c}" style="background:${c}"></button>`).join('')}</div>
          <div style="color:#fff;font-weight:700;width:100%;margin-top:10px">Stripe color</div><div class="color-row" style="justify-content:flex-start">${D.accents.map(c => `<button class="color-dot${r.accent === c ? ' on' : ''}" data-a="${c}" style="background:${c}"></button>`).join('')}</div>`;
        tray.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { r.color = b.dataset.m; G.sfx.pop(); renderRocket(true); renderTray(); });
        tray.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { r.accent = b.dataset.a; G.sfx.pop(); renderRocket(true); renderTray(); });
        return;
      }
      if (cat === 'sticker') {
        D.stickerEmoji.forEach(s => {
          const locked = p.stars < s.at;
          const card = G.html(`<div class="part-card${locked ? ' locked' : ''}"><span class="emoji" style="${locked ? 'opacity:.15' : ''}">${s.e}</span></div>`);
          tray.appendChild(card);
          if (locked) { card.onclick = () => G.beep(`Collect ${s.at} stars to get this sticker! You have ${p.stars}.`); return; }
          startDrag(card, {
            html: `<span class="emoji">${s.e}</span>`,
            tap: () => { const a = G.art.rocket(r); addSticker(s.e, 50 + G.rand(-25, 25), a.bodyBottom - 45 + G.rand(-20, 20)); },
            drop: e => { const svg = holder.querySelector('svg'); const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); addSticker(s.e, q.x, q.y); },
          });
        });
        const clr = G.html('<button class="big-btn small" style="width:100%">🧽 Clean off</button>');
        clr.onclick = () => { r.stickers = []; G.sfx.whoosh(); renderRocket(); };
        tray.appendChild(clr);
        return;
      }
      if (cat === 'crew') {
        D.crew.forEach(c => {
          const isMe = c.id === 'me';
          const label = c.id === 'kid' ? G.kidName() : c.id === 'sis' ? G.FAMILY.kid(p.id)?.sis || 'Sister' : c.name;
          const face = isMe && p.face ? `<img src="${p.face}" style="width:70%;height:70%;border-radius:50%;object-fit:cover">` : `<span class="emoji" style="font-size:40px">${c.e}</span>`;
          const card = G.html(`<div class="part-card${(r.crew || 'kid') === c.id ? ' used' : ''}" style="flex-direction:column">${face}<small style="font-weight:600;font-size:13px">${label}</small></div>`);
          card.onclick = () => {
            if (isMe && !p.face) { G.pickPhoto(() => { r.crew = 'me'; renderRocket(true); renderTray(); }); return; }
            if (r.crew !== c.id) { r.crew2 = r.crew || 'kid'; r.crew = c.id; }
            G.sfx.pop(); renderRocket(true); renderTray();
            G.beep(c.id === 'george' ? 'A monkey astronaut! Real monkeys flew to space before people did!' : c.id === 'owl' ? 'A snowy owl astronaut! Hoo hoo!' : c.id === 'beep' ? 'Me? Beep boop! I\'d love to fly!' : `${label} is riding in the rocket!`);
          };
          tray.appendChild(card);
        });
        return;
      }
      const list = D.parts.filter(pt => pt.cat === cat);
      if (cat === 'booster') {
        const none = G.html(`<div class="part-card${!r.boosters ? ' used' : ''}"><span class="emoji">🚫</span></div>`);
        none.onclick = () => { r.boosters = null; G.sfx.tap(); renderRocket(true); renderTray(); };
        tray.appendChild(none);
      }
      if (cat === 'body' && r.bodies.length) {
        const rm = G.html(`<div class="part-card"><span class="emoji">➖</span></div>`);
        rm.onclick = () => { r.bodies.pop(); G.sfx.tap(); renderRocket(true); renderTray(); };
        tray.appendChild(rm);
      }
      list.forEach(pt => {
        const owned = p.parts.includes(pt.id);
        const inUse = [r.nose, r.capsule, r.fins, r.engine, r.boosters].includes(pt.id) || r.bodies.includes(pt.id);
        const card = G.html(`<div class="part-card${owned ? '' : ' locked'}${inUse ? ' used' : ''}" title="${pt.name}">${G.art.part(pt.id, r)}</div>`);
        if (arg.highlight === pt.id) { card.style.boxShadow = '0 0 0 5px #ffd93d, 0 0 30px #ffd93d'; }
        tray.appendChild(card);
        if (!owned) { card.onclick = () => { G.sfx.tap(); G.beep(`Earn the ${pt.name} at ${G.whereToEarn(pt.id)}!`); }; return; }
        startDrag(card, { html: G.art.part(pt.id, r), tap: () => equip(pt.id), drop: () => equip(pt.id) });
      });
    };

    root.querySelectorAll('.cat-btn').forEach(b => b.onclick = () => { cat = b.dataset.c; G.sfx.tap(); arg = {}; renderTray(); sayCat(cat); });
    root.querySelector('#go-launch').onclick = () => {
      const miss = G.rocketMissing(r);
      if (miss.length) {
        const names = miss.map(m => ({ engine: 'an engine', body: 'a fuel tank', fins: 'fins', capsule: 'a capsule', nose: 'a nose cone' })[m]);
        G.sfx.oops(); cat = miss[0]; renderTray();
        G.beep(`Wait! Your rocket still needs ${names.join(' and ')}.`);
        return;
      }
      G.sfx.great(); G.go('launch');
    };
    renderRocket(); renderTray();
    if (!p.flags.workshopIntro) { p.flags.workshopIntro = 1; G.beep('This is the Rocket Factory! Drag a part onto the rocket, or just tap it. Let\'s start with the engine at the bottom!'); }
    else if (arg.highlight) G.beep(`Tap your new ${D.partById[arg.highlight].name} to put it on!`);
    else if (missing.length) sayCat(cat);
  },
};

// take or choose a photo for the capsule window (kept only on this device)
G.pickPhoto = (done) => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'user';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height), cv = document.createElement('canvas'); cv.width = cv.height = 220;
      cv.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 220, 220);
      G.P().face = cv.toDataURL('image/jpeg', 0.8); G.persist();
      G.beep('Now you\'re in the rocket window!'); done && done();
    };
    img.src = URL.createObjectURL(f);
  };
  inp.click();
};
