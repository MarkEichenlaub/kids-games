// Space: fly your own rocket around a big solar system.
G.screens.space = {
  enter(root, arg = {}) {
    const p = G.P(), r = p.rocket, W = G.WORLD;
    const little = G.isLittle();
    root.innerHTML = `<canvas id="space-canvas"></canvas><div class="labels"></div><canvas class="minimap" width="340" height="340"></canvas>`;
    const bar = G.topbar(root, {
      onBack: () => G.go('hub'),
      extra: `<div class="pill">✨ <span id="bits">${p.starBits}</span></div><button class="round-btn" id="sp-map" title="Map">🗺️</button><button class="round-btn" id="sp-home" title="Fly home to Earth">🌍</button>`,
    });
    bar.classList.add('space-hud');
    G.showBeep(true, true); G.music('space');
    const cv = root.querySelector('#space-canvas'), ctx = cv.getContext('2d');
    const mm = root.querySelector('.minimap'), mctx = mm.getContext('2d');
    const S = this; S.alive = true;
    let Wd = 0, Hd = 0, dpr = Math.min(2, window.devicePixelRatio || 1), zoom = 1;
    const resize = () => { Wd = innerWidth; Hd = innerHeight; cv.width = Wd * dpr; cv.height = Hd * dpr; zoom = G.clamp(Math.min(Wd, Hd) / 820, 0.5, 1.05); };
    resize(); window.addEventListener('resize', resize); S.resize = resize;

    // ---------- state ----------
    const power = Math.max(1, G.rocketPower(r));
    const maxR = W.tiers[power];
    const earth = W.byId.earth;
    const ship = { x: earth.x + 220, y: earth.y - 200, vx: 0, vy: 0, a: 0, thrust: 0 };
    if (arg.at && W.byId[arg.at]) { const pl = W.byId[arg.at]; W.update(performance.now() / 1000); const ang = Math.atan2(pl.y - earth.y, pl.x - earth.x) + Math.PI; ship.x = pl.x + Math.cos(ang) * (pl.r + 200); ship.y = pl.y + Math.sin(ang) * (pl.r + 200); ship.a = ang + Math.PI / 2; }
    if (arg.warpTo) { const pl = W.byId[arg.warpTo]; W.update(performance.now() / 1000); ship.x = pl.x - pl.r - 220; ship.y = pl.y; }
    const cam = { x: ship.x, y: ship.y };
    S.ship = ship;
    const maxSpeed = [0, 420, 560, 720, 900, 1150][power];
    let boostT = 0, boostCd = 0;
    let shipImg = null;
    G.art.toImage(G.art.rocket(r).svg).then(img => shipImg = img);
    const shipInfo = G.art.rocket(r);
    const shipH = 110, shipW = shipH * shipInfo.w / shipInfo.h;
    const flameColor = r.engine === 'eng-4' ? 'rainbow' : 'fire';

    // star bits: clusters inside what this rocket can reach
    const bits = [];
    const rng = mulberry(42 + p.launched);
    W.places.forEach(pl => {
      if (pl.hidden || pl.tier > power) return;
      const n = pl.id === 'earth' ? 14 : 8;
      for (let i = 0; i < n; i++) {
        const t = (i + 1) / (n + 1);
        const x = earth.x + (pl.x - earth.x) * t + (rng() - .5) * 260, y = earth.y + (pl.y - earth.y) * t + (rng() - .5) * 260;
        bits.push({ x, y, got: false, ph: rng() * 6 });
      }
    });
    // asteroid belt
    const rocks = [];
    for (let i = 0; i < 170; i++) { const ang = rng() * Math.PI * 2, d = 5000 + rng() * 900; rocks.push({ ang, d, r: 14 + rng() * 34, spin: rng() * 6, sp: 0.004 + rng() * 0.004, shape: Array.from({ length: 8 }, () => 0.75 + rng() * 0.35) }); }
    // background stars (deterministic tiles)
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    const tileStars = {};
    const starsFor = (tx, ty, layer) => { const k = tx + ',' + ty + ',' + layer; if (!tileStars[k]) { const rr = mulberry((tx * 73856093) ^ (ty * 19349663) ^ (layer * 83492791)); tileStars[k] = Array.from({ length: 18 }, () => [rr() * 512, rr() * 512, rr() * 1.6 + 0.4, rr()]); } return tileStars[k]; };
    const exhaust = [];

    // ---------- input ----------
    const keys = {};
    let pointer = null, autopilot = null, tapStart = null;
    const kd = e => { keys[e.key.toLowerCase()] = true; if (e.key === ' ') { e.preventDefault(); doBoost(); } if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const ku = e => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    S.keys = [kd, ku];
    const toWorld = (sx, sy) => ({ x: cam.x + (sx - Wd / 2) / zoom, y: cam.y + (sy - Hd / 2) / zoom });
    const toScreen = (x, y) => ({ x: (x - cam.x) * zoom + Wd / 2, y: (y - cam.y) * zoom + Hd / 2 });
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pointer = { x: e.clientX, y: e.clientY }; tapStart = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    cv.addEventListener('pointermove', e => { if (pointer) { pointer.x = e.clientX; pointer.y = e.clientY; } });
    const up = e => {
      if (tapStart && performance.now() - tapStart.t < 300 && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < 12) {
        const w = toWorld(e.clientX, e.clientY);
        const hit = W.places.find(pl => !pl.hidden && Math.hypot(pl.x - w.x, pl.y - w.y) < Math.max(pl.r * 1.2, 60 / zoom));
        if (hit) { setAutopilot(hit); }
      }
      pointer = null; tapStart = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const setAutopilot = (pl) => {
      if (pl.tier > power) { G.beep(`${pl.name} is too far for our engine! Build a stronger engine at the Engine Lab.`); G.sfx.oops(); return; }
      autopilot = pl; G.sfx.boop(); G.beep(`Autopilot on! Flying to ${pl.name}!`);
    };
    const doBoost = () => { if (power >= 3 && boostCd <= 0) { boostT = 1.2; boostCd = 3; G.sfx.whoosh(); } };
    root.querySelector('#sp-map').onclick = () => { G.sfx.tap(); openMap(); };
    mm.onclick = () => { G.sfx.tap(); openMap(); };
    root.querySelector('#sp-home').onclick = () => { G.sfx.tap(); setAutopilot(earth); };
    if (power >= 3) {
      const bb = G.html('<button class="round-btn boost-btn" title="Boost" style="width:76px;height:76px;font-size:36px">⚡</button>');
      bb.onclick = doBoost; root.appendChild(bb);
    }

    // ---------- landing button ----------
    let landBtn = null, near = null;
    const showLand = (pl) => {
      if (near === pl) return;
      near = pl;
      if (landBtn) { landBtn.remove(); landBtn = null; }
      if (!pl) return;
      const verb = pl.kind === 'star' || pl.kind === 'blackhole' || pl.kind === 'galaxy' ? 'Visit' : pl.kind === 'station' || pl.kind === 'thing' || pl.kind === 'probe' ? 'Check out' : pl.kind === 'nebula' || pl.kind === 'comet' ? 'Explore' : 'Land on';
      landBtn = G.html(`<button class="big-btn green land-btn">${pl.icon || '🛬'} ${verb} ${pl.name}!</button>`);
      landBtn.onclick = () => { G.sfx.great(); G.go('visit', pl.id); };
      root.appendChild(landBtn);
    };

    // ---------- the map ----------
    const mapPos = (pl, R) => { const d = Math.hypot(pl.x, pl.y), a = Math.atan2(pl.y, pl.x); const k = Math.sqrt(d) / Math.sqrt(W.mapMax) * R; return [Math.cos(a) * k, Math.sin(a) * k]; };
    const openMap = () => {
      const m = G.modal(`<h2>🗺️ Space Map</h2><div class="map-wrap"></div><p style="font-size:18px;margin:8px">Tap a place you've visited to zoom there. Tap a new place and autopilot flies you there!</p>`);
      const wrap = m.querySelector('.map-wrap');
      requestAnimationFrame(() => {
        const rct = wrap.getBoundingClientRect(), R = Math.min(rct.width, rct.height) * 0.47;
        const cx = rct.width / 2, cy = rct.height / 2;
        W.places.forEach(pl => {
          if (pl.hidden || pl.decor) return;
          const [mx, my] = mapPos(pl, R);
          const locked = pl.tier > power, seen = p.visited[pl.id];
          const size = G.clamp(pl.r / 12, 8, 30);
          const b = G.html(`<button class="map-dot${locked ? ' locked' : ''}" style="left:${cx + mx}px;top:${cy + my}px"><span class="d" style="width:${size}px;height:${size}px;background:${pl.mapColor || (pl.colors ? pl.colors[1] : '#fff')};display:flex;align-items:center;justify-content:center;font-size:${size * 0.8}px">${pl.colors ? '' : (pl.emoji || pl.sticker)}</span>${seen ? '✅' : ''}${locked ? '🔒' : ''}<span>${pl.name}</span></button>`);
          b.onclick = () => {
            if (locked) { G.beep(`${pl.name} is too far! We need a stronger engine.`); return; }
            m.close();
            if (seen && pl.id !== 'earth') { warpTo(pl); } else setAutopilot(pl);
          };
          wrap.appendChild(b);
        });
        const [sx, sy] = mapPos(ship, R);
        wrap.appendChild(G.html(`<div class="map-dot" style="left:${cx + sx}px;top:${cy + sy}px;font-size:24px">🚀</div>`));
      });
    };
    let flash = 0;
    const warpTo = (pl) => {
      G.sfx.warp(); flash = 1;
      setTimeout(() => { ship.x = pl.x - pl.r - 200; ship.y = pl.y + 40; ship.vx = ship.vy = 0; cam.x = ship.x; cam.y = ship.y; G.beep(`Zoom! We warped to ${pl.name}!`); }, 250);
    };

    // ---------- greetings ----------
    const greeted = S.greeted || (S.greeted = {});
    let lastEdgeMsg = 0, lastSunMsg = 0, bitsInRow = 0;
    if (arg.from === 'launch') {
      const first = !p.flags.firstSpace;
      p.flags.firstSpace = 1; G.persist();
      setTimeout(() => G.beep(first
        ? (little ? 'We\'re in space! Touch the screen and the rocket flies to your finger! Tap a planet to fly there!' : 'We made it to space! Hold your finger on the screen, and the rocket flies toward it. Or use the arrow keys! Tap any planet to fly there by autopilot.')
        : G.pick(['We\'re in space! Where should we go?', 'Space! Let\'s explore!', 'Look at all the stars!'])), 400);
    }

    // aliens
    const aliens = G.FAMILY.aliens.map(a => Object.assign({}, a, { asked: false, bob: Math.random() * 6 }));

    // ---------- loop ----------
    let last = performance.now();
    const frame = (now) => {
      if (!S.alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = now / 1000;
      W.update(t);
      if (G.$('.modal-back')) { S.raf = requestAnimationFrame(frame); draw(t); return; }

      // steering
      let ax = 0, ay = 0;
      if (keys['arrowleft'] || keys['a']) ax -= 1; if (keys['arrowright'] || keys['d']) ax += 1;
      if (keys['arrowup'] || keys['w']) ay -= 1; if (keys['arrowdown'] || keys['s']) ay += 1;
      if (ax || ay) autopilot = null;
      if (pointer) {
        const w = toWorld(pointer.x, pointer.y), dx = w.x - ship.x, dy = w.y - ship.y, d = Math.hypot(dx, dy);
        if (d * zoom > 30) { ax = dx / d; ay = dy / d; autopilot = null; }
      }
      if (autopilot) {
        const dx = autopilot.x - ship.x, dy = autopilot.y - ship.y, d = Math.hypot(dx, dy);
        if (d < autopilot.r + 150) { autopilot = null; ship.vx *= 0.3; ship.vy *= 0.3; }
        else { ax = dx / d; ay = dy / d; if (d < autopilot.r + 700) { const slow = (d - autopilot.r) / 700; ship.vx *= 0.96 + 0.03 * slow; ship.vy *= 0.96 + 0.03 * slow; } }
      }
      const al = Math.hypot(ax, ay);
      boostT -= dt; boostCd -= dt;
      const top = maxSpeed * (boostT > 0 ? 2 : 1);
      if (al > 0) {
        ax /= al; ay /= al;
        const acc = 1400 * (boostT > 0 ? 2.5 : 1);
        ship.vx += ax * acc * dt; ship.vy += ay * acc * dt;
        ship.thrust = Math.min(1, ship.thrust + dt * 5);
      } else { ship.thrust = Math.max(0, ship.thrust - dt * 4); ship.vx *= Math.pow(0.35, dt); ship.vy *= Math.pow(0.35, dt); }
      const sp = Math.hypot(ship.vx, ship.vy);
      if (sp > top) { ship.vx *= top / sp; ship.vy *= top / sp; }
      if (sp > 20) { const target = Math.atan2(ship.vx, -ship.vy); let da = target - ship.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; ship.a += da * Math.min(1, dt * 8); }
      ship.x += ship.vx * dt; ship.y += ship.vy * dt;

      // edge of range
      const de = Math.hypot(ship.x - earth.x, ship.y - earth.y);
      if (de > maxR) {
        const nx = (ship.x - earth.x) / de, ny = (ship.y - earth.y) / de;
        ship.x = earth.x + nx * maxR; ship.y = earth.y + ny * maxR;
        const vn = ship.vx * nx + ship.vy * ny; if (vn > 0) { ship.vx -= 1.6 * vn * nx; ship.vy -= 1.6 * vn * ny; }
        if (t - lastEdgeMsg > 8) { lastEdgeMsg = t; G.sfx.bonk(); G.beep(power >= 5 ? 'This is the edge of our map! Let\'s turn around.' : 'Our engine isn\'t strong enough to go farther! Build a bigger engine at the Engine Lab, and we can go all the way!'); }
      }
      // the Sun is too hot to touch
      const sun = W.byId.sun, ds = Math.hypot(ship.x - sun.x, ship.y - sun.y);
      if (ds < sun.r + 90) {
        const nx = (ship.x - sun.x) / ds, ny = (ship.y - sun.y) / ds;
        ship.x = sun.x + nx * (sun.r + 90); ship.y = sun.y + ny * (sun.r + 90);
        ship.vx = nx * 300; ship.vy = ny * 300;
        if (t - lastSunMsg > 6) { lastSunMsg = t; G.sfx.bonk(); G.beep('Too hot! The Sun would melt our rocket! Let\'s stay back.'); }
      }
      // the black hole whooshes you home
      const bh = W.byId.blackhole;
      if (bh && power >= bh.tier) {
        const db = Math.hypot(ship.x - bh.x, ship.y - bh.y);
        if (db < 1400) { const f = 90000 / Math.max(db, 200); ship.vx += (bh.x - ship.x) / db * f * dt; ship.vy += (bh.y - ship.y) / db * f * dt; }
        if (db < bh.r * 0.5) {
          G.sfx.warp(); flash = 1; p.visited.blackhole = p.visited.blackhole || 1; p.stickers.blackhole = 1; G.persist();
          ship.x = earth.x + 250; ship.y = earth.y - 250; ship.vx = ship.vy = 0; cam.x = ship.x; cam.y = ship.y;
          G.beep('Wheee! The black hole spun us around and a wormhole sent us all the way home to Earth!');
        }
      }
      // rocks
      rocks.forEach(k => {
        k.ang += k.sp * dt; const x = Math.cos(k.ang) * k.d, y = Math.sin(k.ang) * k.d; k.x = x; k.y = y;
        const dd = Math.hypot(ship.x - x, ship.y - y);
        if (dd < k.r + 26) { const nx = (ship.x - x) / dd, ny = (ship.y - y) / dd; ship.x = x + nx * (k.r + 27); ship.y = y + ny * (k.r + 27); const vn = ship.vx * nx + ship.vy * ny; if (vn < 0) { ship.vx -= 1.8 * vn * nx; ship.vy -= 1.8 * vn * ny; G.sfx.bonk(); } }
      });
      // star bits
      bits.forEach(b => {
        if (b.got) return;
        if (Math.hypot(b.x - ship.x, b.y - ship.y) < 50) {
          b.got = true; p.starBits++; bitsInRow++; G.sfx.chime();
          G.$('#bits').textContent = p.starBits;
          if (p.starBits % 10 === 0) {
            G.addStars(1);
            const tens = p.starBits / 10;
            if (!little && tens <= 12 && tens % 3 === 1) G.beep(`${p.starBits} star bits! That's ${tens} ${tens > 1 ? 'tens' : 'ten'}!`);
            else G.toast(`✨ ${p.starBits} star bits! +1 ⭐`);
          }
          G.persist();
        }
      });
      // exhaust
      if (ship.thrust > 0.1) {
        const bx = ship.x - Math.sin(ship.a) * shipH * 0.45, by = ship.y + Math.cos(ship.a) * shipH * 0.45;
        for (let i = 0; i < (boostT > 0 ? 5 : 2); i++) exhaust.push({ x: bx + (Math.random() - .5) * 10, y: by + (Math.random() - .5) * 10, vx: -Math.sin(ship.a) * 220 + (Math.random() - .5) * 60 + ship.vx * 0.3, vy: Math.cos(ship.a) * 220 + (Math.random() - .5) * 60 + ship.vy * 0.3, life: 1, hue: flameColor === 'rainbow' ? Math.random() * 360 : 20 + Math.random() * 35 });
      }
      exhaust.forEach(e => { e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt * 2.2; });
      while (exhaust.length && exhaust[0].life <= 0) exhaust.shift();

      // nearby places
      let closest = null, cd = 1e9;
      W.places.forEach(pl => {
        if (pl.hidden || pl.decor) return;
        const d = Math.hypot(pl.x - ship.x, pl.y - ship.y) - pl.r;
        if (d < 700 && !greeted[pl.id] && pl.tier <= power) { greeted[pl.id] = 1; G.beep(p.visited[pl.id] ? `We're back at ${pl.name}!` : (pl.hello || `That's ${pl.name}!`)); }
        if (d < cd) { cd = d; closest = pl; }
      });
      showLand(closest && cd < 190 && closest.tier <= power ? closest : null);
      // aliens
      aliens.forEach(a => {
        if (a.asked || a.tier > power) return;
        if (Math.hypot(a.x - ship.x, a.y - ship.y) < 170) { a.asked = true; ship.vx = ship.vy = 0; autopilot = null; alienQuestion(a); }
      });

      // camera
      cam.x += (ship.x + ship.vx * 0.35 - cam.x) * Math.min(1, dt * 3);
      cam.y += (ship.y + ship.vy * 0.35 - cam.y) * Math.min(1, dt * 3);
      draw(t);
      S.raf = requestAnimationFrame(frame);
    };

    // ---------- alien questions ----------
    const alienQuestion = (a) => {
      const m = G.modal(`<div style="display:flex;align-items:center;gap:14px"><div style="font-size:90px;animation:bob 1.5s infinite">${a.e}</div><h2 style="margin:0">${a.name} the alien</h2></div><div class="ch-card" style="min-height:360px;box-shadow:none"></div>`, { noClose: true });
      const card = m.querySelector('.ch-card');
      const lvl = p.level;
      let q;
      if (a.id === 'nini') {
        const w = G.pick(G.FAMILY.chinese), others = G.shuffle(G.FAMILY.chinese.filter(x => x !== w)).slice(0, 2);
        q = { prompt: `${w.zh} (${w.py}) means...?`, say: `Nǐ hǎo! I'm Nini! In Chinese, ${w.py} means... which one?`, visual: `<div style="font-size:70px">${w.zh}</div>`, choices: G.shuffle([w, ...others]).map(x => ({ html: x.e, v: x.en })), answer: w.en, after: `Yes! ${w.py} means ${w.en}! Xièxie!` };
      } else {
        const kinds = little ? ['math', 'shape', 'letter'] : ['math', 'math', 'shape'];
        const k = G.pick(kinds);
        q = k === 'math' ? G.ch.mathQ(little ? Math.min(lvl.math, 1) : lvl.math) : k === 'shape' ? G.ch.shapeQ(lvl.shapes) : G.ch.letterQ();
        q.say = `Hi! I'm ${a.name}! Can you help me? ${q.say || q.prompt}`;
      }
      G.sfx.boop();
      const spellName = !little && G.PHONICS.alienNames.includes(a.name) && Math.random() < 0.6;
      const asking = spellName
        ? (m.close(), G.PHONICS.run({ word: a.name.toLowerCase(), pic: a.e, intro: `Spell ${a.name}'s name!`, lines: [`Hi! I'm ${a.name}! Can you spell my name?`, a.name] }).then(() => { G.modal(`<div style="display:flex;align-items:center;gap:14px"><div style="font-size:90px">${a.e}</div><h2 style="margin:0">${a.name} the alien</h2></div><div class="ch-card" style="min-height:200px;box-shadow:none"></div>`, { noClose: true }); card2 = G.$('.modal .ch-card'); mm = G.$('.modal-back'); }))
        : G.ch.ask(card, q);
      let card2 = card, mm = m;
      asking.then(() => {
        const card = card2, m = mm;
        G.addStars(2); p.stickers['alien-' + a.id] = 1; G.persist();
        card.innerHTML = `<div style="font-size:30px;font-weight:700;text-align:center">${a.e} ${a.name} says thank you!<br>+2 ⭐</div><button class="big-btn green">🚀 Keep flying</button>`;
        G.beep(G.pick([`Thank you! You're a great space friend! Bye bye!`, `Yay! ${a.name} is so happy!`, `Thanks, space friend! Beep boop!`]));
        card.querySelector('button').onclick = () => { G.sfx.tap(); m.close(); };
      });
    };

    // ---------- drawing ----------
    const drawBg = (t) => {
      const g = ctx.createLinearGradient(0, 0, 0, Hd); g.addColorStop(0, '#080420'); g.addColorStop(1, '#150a3a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, Wd, Hd);
      // soft colored clouds at fixed world spots
      W.nebulae.forEach(n => {
        const s = toScreen(n.x, n.y), rr = n.r * zoom;
        if (s.x < -rr || s.x > Wd + rr || s.y < -rr || s.y > Hd + rr) return;
        const gg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rr); gg.addColorStop(0, n.c); gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, 7); ctx.fill();
      });
      [[0.15, 0.5], [0.35, 0.8], [0.6, 1.2]].forEach(([par, sz], layer) => {
        const ox = cam.x * par, oy = cam.y * par, T = 512;
        const x0 = Math.floor((ox - Wd / 2) / T), x1 = Math.floor((ox + Wd / 2) / T), y0 = Math.floor((oy - Hd / 2) / T), y1 = Math.floor((oy + Hd / 2) / T);
        for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) {
          starsFor(tx, ty, layer).forEach(([sx, sy, s2, tw]) => {
            const X = tx * T + sx - ox + Wd / 2, Y = ty * T + sy - oy + Hd / 2;
            ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + tw) + tw * 10));
            ctx.fillStyle = tw > 0.85 ? '#ffe9a8' : tw > 0.7 ? '#bcd4ff' : '#fff';
            ctx.fillRect(X, Y, s2 * sz, s2 * sz);
          });
        }
      });
      ctx.globalAlpha = 1;
    };
    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBg(t);
      // range ring
      const es = toScreen(earth.x, earth.y);
      const deR = Math.hypot(ship.x - earth.x, ship.y - earth.y);
      if (maxR - deR < 900) {
        ctx.save(); ctx.strokeStyle = `rgba(120,220,255,${0.25 + 0.2 * Math.sin(t * 3)})`; ctx.lineWidth = 10 * zoom; ctx.setLineDash([30 * zoom, 20 * zoom]); ctx.lineDashOffset = t * 40;
        ctx.beginPath(); ctx.arc(es.x, es.y, maxR * zoom, 0, 7); ctx.stroke(); ctx.restore();
      }
      // orbit paths (faint)
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 2;
      const ss = toScreen(0, 0);
      W.places.forEach(pl => { if (pl.orbitLine) { ctx.beginPath(); ctx.arc(ss.x, ss.y, Math.hypot(pl.x, pl.y) * zoom, 0, 7); ctx.stroke(); } });
      ctx.restore();
      // rocks
      ctx.fillStyle = '#8a7a6a'; ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 2;
      rocks.forEach(k => {
        if (k.x === undefined) return;
        const s = toScreen(k.x, k.y), rr = k.r * zoom;
        if (s.x < -rr || s.x > Wd + rr || s.y < -rr || s.y > Hd + rr) return;
        ctx.beginPath(); k.shape.forEach((f, i) => { const a = i / 8 * Math.PI * 2 + k.spin + t * 0.2; const X = s.x + Math.cos(a) * rr * f, Y = s.y + Math.sin(a) * rr * f; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      // places
      const labels = [];
      W.places.forEach(pl => {
        if (pl.hidden) return;
        const s = toScreen(pl.x, pl.y), rr = pl.r * zoom;
        const pad = pl.kind === 'galaxy' || pl.kind === 'nebula' ? 3 : 2.4;
        if (s.x < -rr * pad || s.x > Wd + rr * pad || s.y < -rr * pad || s.y > Hd + rr * pad) return;
        if (pl.draw) pl.draw(ctx, s.x, s.y, rr, t); else G.art.drawPlanet(ctx, pl, s.x, s.y, rr, t);
        if (!pl.decor) labels.push([pl, s.x, s.y + rr * (pl.rings ? 0.9 : 1) + 14]);
      });
      labels.forEach(([pl, x, y]) => {
        ctx.font = `700 ${Math.max(14, 18 * zoom)}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const txt = pl.name + (p.visited[pl.id] ? ' ✅' : pl.tier > power ? ' 🔒' : '');
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(txt, x, y); ctx.fillStyle = '#fff'; ctx.fillText(txt, x, y);
      });
      // aliens
      aliens.forEach(a => {
        const s = toScreen(a.x, a.y + Math.sin(t * 2 + a.bob) * 20);
        if (s.x < -80 || s.x > Wd + 80 || s.y < -80 || s.y > Hd + 80) return;
        ctx.fillStyle = a.color + '55'; ctx.beginPath(); ctx.arc(s.x, s.y, 48 * zoom, 0, 7); ctx.fill();
        ctx.font = `${64 * zoom}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(a.e, s.x, s.y);
        if (!a.asked && a.tier <= power) { ctx.font = `${30 * zoom}px serif`; ctx.fillText('💬', s.x + 40 * zoom, s.y - 40 * zoom); }
      });
      // star bits
      bits.forEach(b => {
        if (b.got) return;
        const s = toScreen(b.x, b.y);
        if (s.x < -20 || s.x > Wd + 20 || s.y < -20 || s.y > Hd + 20) return;
        const k = 1 + 0.25 * Math.sin(t * 4 + b.ph);
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(t + b.ph); ctx.scale(k * zoom, k * zoom);
        ctx.fillStyle = '#ffe066'; ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 12;
        ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? 5 : 13; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      // exhaust
      exhaust.forEach(e => {
        const s = toScreen(e.x, e.y);
        ctx.fillStyle = `hsla(${e.hue},100%,${55 + 30 * e.life}%,${e.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, (4 + 10 * (1 - e.life)) * zoom, 0, 7); ctx.fill();
      });
      // ship
      const s = toScreen(ship.x, ship.y);
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(ship.a);
      const sh = shipH * zoom, sw = shipW * zoom;
      if (boostT > 0) { ctx.shadowColor = '#6ff0ff'; ctx.shadowBlur = 30; }
      if (shipImg) ctx.drawImage(shipImg, -sw / 2, -sh / 2, sw, sh);
      else { ctx.fillStyle = r.color || '#ff5d8f'; ctx.beginPath(); ctx.moveTo(0, -sh / 2); ctx.lineTo(sw / 4, sh / 2); ctx.lineTo(-sw / 4, sh / 2); ctx.fill(); }
      ctx.restore();
      // pointer to suggested place
      const sug = W.suggest(ship, power, p);
      if (sug) {
        const ps = toScreen(sug.x, sug.y);
        if (ps.x < 0 || ps.x > Wd || ps.y < 0 || ps.y > Hd) {
          const ang = Math.atan2(ps.y - Hd / 2, ps.x - Wd / 2);
          const ex = Wd / 2 + Math.cos(ang) * (Math.min(Wd, Hd) / 2 - 70), ey = Hd / 2 + Math.sin(ang) * (Math.min(Wd, Hd) / 2 - 70);
          ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
          ctx.fillStyle = `rgba(255,217,61,${0.6 + 0.3 * Math.sin(t * 5)})`; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-10, -16); ctx.lineTo(-10, 16); ctx.fill(); ctx.restore();
          ctx.font = '14px Fredoka, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(sug.name, ex - Math.cos(ang) * 34, ey - Math.sin(ang) * 34);
        }
      }
      if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, Wd, Hd); flash = Math.max(0, flash - 0.03); }
      drawMini(t);
    };
    const drawMini = (t) => {
      const R = 160;
      mctx.clearRect(0, 0, 340, 340);
      mctx.save(); mctx.translate(170, 170);
      mctx.strokeStyle = 'rgba(120,220,255,.35)'; mctx.lineWidth = 3;
      mctx.beginPath(); const rr = Math.sqrt(Math.hypot(earth.x, earth.y) + maxR) / Math.sqrt(W.mapMax) * R; mctx.arc(0, 0, Math.min(rr, 165), 0, 7); mctx.stroke();
      W.places.forEach(pl => {
        if (pl.hidden || pl.decor) return;
        const [x, y] = mapPos(pl, R);
        mctx.fillStyle = pl.mapColor || (pl.colors ? pl.colors[1] : '#fff');
        mctx.globalAlpha = pl.tier > power ? 0.3 : 1;
        mctx.beginPath(); mctx.arc(x, y, G.clamp(pl.r / 40, 3, 14), 0, 7); mctx.fill();
      });
      mctx.globalAlpha = 1;
      const [x, y] = mapPos(ship, R);
      mctx.fillStyle = '#ff4f9a'; mctx.beginPath(); mctx.arc(x, y, 8 + 2 * Math.sin(t * 6), 0, 7); mctx.fill();
      mctx.restore();
    };
    S.raf = requestAnimationFrame(frame);
  },
  leave() {
    this.alive = false; cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    if (this.keys) { window.removeEventListener('keydown', this.keys[0]); window.removeEventListener('keyup', this.keys[1]); }
    G.persist();
  },
};
