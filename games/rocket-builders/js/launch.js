// Launch pad: countdown, liftoff, boosters falling away, into space.
G.screens.launch = {
  enter(root) {
    const p = G.P(), r = p.rocket;
    const little = G.isLittle();
    root.innerHTML = `<div class="launch" style="position:absolute;inset:0;overflow:hidden">
      <div class="l-sky" style="position:absolute;inset:0;background:linear-gradient(180deg,#5fb4ff,#bfe6ff)"></div>
      <div class="l-stars" style="position:absolute;inset:0;opacity:0">${G.starBg(120)}</div>
      <div class="l-world" style="position:absolute;inset:0">
        ${Array.from({ length: 7 }, (_, i) => `<div class="cloud" style="width:${120 + i * 20}px;height:${40 + i * 4}px;left:${(i * 37) % 90}%;top:${-40 + i * 60}%;animation:none"></div>`).join('')}
        <div style="position:absolute;left:0;right:0;bottom:0;height:18%;background:linear-gradient(180deg,#7ccf6b,#4f9e46)"></div>
        <div style="position:absolute;left:50%;bottom:17%;width:260px;height:22px;transform:translateX(-50%);background:#8a93b8;border-radius:6px;border:3px solid #2d2250"></div>
        <svg class="l-tower" viewBox="0 0 60 400" style="position:absolute;bottom:18%;left:calc(50% + 80px);height:62%;"><rect x="10" y="0" width="40" height="400" fill="none" stroke="#e05050" stroke-width="6"/>${Array.from({ length: 10 }, (_, i) => `<path d="M10 ${i * 40} L50 ${i * 40 + 40} M50 ${i * 40} L10 ${i * 40 + 40}" stroke="#e05050" stroke-width="4"/>`).join('')}<rect x="-40" y="60" width="50" height="10" fill="#e05050"/></svg>
      </div>
      <div class="l-rocket" style="position:absolute;left:50%;bottom:19%;height:55%;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center"></div>
      <canvas class="l-smoke" style="position:absolute;inset:0;pointer-events:none"></canvas>
      <div class="l-count" style="position:absolute;inset:0;pointer-events:none"></div>
      <div class="l-big" style="position:absolute;top:18%;left:0;right:0;text-align:center;font-size:clamp(80px,18vw,200px);font-weight:700;color:#fff;text-shadow:0 6px 20px rgba(0,0,0,.4);pointer-events:none"></div>
    </div>`;
    G.topbar(root, { onBack: () => G.go('workshop'), backIcon: '🏭', extra: '<button class="round-btn" id="l-tv" title="Watch a real launch">📺</button>' });
    G.showBeep(true, true); G.music(null);
    const rocketBox = root.querySelector('.l-rocket');
    const setRocket = (spec, flame) => { rocketBox.innerHTML = G.art.rocket(spec, { flame }).svg; const s = rocketBox.querySelector('svg'); s.style.height = '100%'; s.style.width = 'auto'; s.style.overflow = 'visible'; };
    setRocket(r, false);
    root.querySelector('#l-tv').onclick = () => G.playVideo(G.pick(['mYTvg2abusc', 'A0FZIwabctw', 'NOQLSH4KyBs']));
    this.alive = true;

    // countdown bubbles
    const N = little ? 5 : 10;
    const layer = root.querySelector('.l-count');
    const nums = Array.from({ length: N }, (_, i) => N - i);
    let next = 0;
    const spots = G.shuffle(Array.from({ length: N }, (_, i) => i));
    nums.forEach((n, i) => {
      const k = spots[i];
      const side = k % 2, row = Math.floor(k / 2);
      const left = side ? 70 + (row % 2) * 13 : 4 + (row % 2) * 13;
      const top = 10 + row * (side ? (little ? 16 : 15) : (little ? 14 : 10.5));
      const b = G.html(`<button class="choice" style="position:absolute;left:${left}%;top:${Math.min(top, 80)}%;pointer-events:auto;min-width:0;width:clamp(64px,min(10vw,13vh),100px);height:clamp(64px,min(10vw,13vh),100px);border-radius:50%">${n}</button>`);
      b.onclick = () => {
        if (n !== nums[next]) { G.sfx.oops(); b.classList.remove('wrong'); void b.offsetWidth; b.style.animation = 'shake .4s'; setTimeout(() => b.style.animation = '', 400); G.beep(`Find ${nums[next]}!`); return; }
        b.remove(); next++; G.sfx.count(N - n); G.say(String(n), { rate: 1.1 });
        root.querySelector('.l-big').textContent = n;
        if (next === N) liftoff();
      };
      layer.appendChild(b);
    });
    G.beep(p.launched ? `Count down from ${N}! Tap ${N} first.` : `Time to launch! Let's count down. Tap the numbers from ${N} down to 1. Find ${N}!`);

    const liftoff = async () => {
      if (!this.alive) return;
      root.querySelector('.l-big').textContent = '';
      G.hush(); await G.wait(250);
      G.say('Liftoff!', { rate: 1 });
      p.launched = (p.launched || 0) + 1; G.persist();
      setRocket(r, true);
      G.sfx.rumble(6);
      const smoke = root.querySelector('.l-smoke'), sc = smoke.getContext('2d');
      smoke.width = innerWidth; smoke.height = innerHeight;
      const parts = [];
      const world = root.querySelector('.l-world'), sky = root.querySelector('.l-sky'), stars = root.querySelector('.l-stars');
      const t0 = performance.now();
      let sep = false;
      const H = innerHeight;
      const facts = [
        'The engines push hot gas down. That pushes the rocket up!',
        'Look how fast we\'re going!',
        'The sky is getting darker. We\'re almost in space!',
      ];
      let fi = 0;
      const frame = (now) => {
        if (!this.alive) return;
        const t = (now - t0) / 1000;
        const alt = t < 1 ? 0 : 60 * Math.pow(t - 1, 2.1);
        const rise = Math.min(alt, H * 0.1);
        const scroll = Math.max(0, alt - H * 0.1);
        rocketBox.style.transform = `translate(calc(-50% + ${(Math.random() - .5) * (t < 3 ? 4 : 1)}px), ${-rise}px)`;
        world.style.transform = `translateY(${scroll}px)`;
        const k = G.clamp(scroll / (H * 4), 0, 1);
        sky.style.background = `linear-gradient(180deg, rgb(${95 - 80 * k},${180 - 170 * k},${255 - 205 * k}), rgb(${191 - 170 * k},${230 - 215 * k},${255 - 200 * k}))`;
        stars.style.opacity = k;
        // smoke at the pad
        const rb = rocketBox.getBoundingClientRect();
        if (t < 5) for (let i = 0; i < 6; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 60, y: H * 0.81 + scroll, vx: (Math.random() - .5) * 9, vy: -Math.random() * 1.5, r: 20 + Math.random() * 20, a: 0.8 });
        sc.clearRect(0, 0, smoke.width, smoke.height);
        parts.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.r += 0.8; pt.a *= 0.985; if (t > 1) pt.y += 0; sc.fillStyle = `rgba(240,240,250,${pt.a})`; sc.beginPath(); sc.arc(pt.x, pt.y + scroll * 0.0, pt.r, 0, 7); sc.fill(); });
        while (parts.length > 400) parts.shift();
        // separation
        if (!sep && t > 4.2 && r.boosters) {
          sep = true;
          const noB = Object.assign({}, r, { boosters: null });
          setRocket(noB, true);
          const bh = rb.height * 0.4;
          [-1, 1].forEach(side => {
            const b = G.html(`<div style="position:absolute;left:${rb.left + rb.width / 2 + side * rb.width * 0.36}px;top:${rb.top + rb.height * 0.35}px;height:${bh}px;transition:transform 3s ease-in, opacity 3s;z-index:3">${G.art.part(r.boosters).replace('viewBox="-6 -40 82 150"', 'viewBox="-6 -40 40 150"')}</div>`);
            b.querySelector('svg').style.height = '100%';
            root.appendChild(b);
            requestAnimationFrame(() => { b.style.transform = `translate(${side * 120}px, ${H}px) rotate(${side * 70}deg)`; b.style.opacity = '0.2'; });
          });
          G.sfx.whoosh();
          G.beep('The boosters ran out of fuel, so they fall away! Bye bye, boosters!');
        } else if (t > 1.6 + fi * 2.2 && fi < facts.length && !(r.boosters && t > 3.8 && t < 6.5)) {
          if (fi > 0 || !p.flags.launchFact) { G.beep(facts[fi]); }
          p.flags.launchFact = 1; fi++;
        }
        if (t > 8.5) { G.go('space', { from: 'launch' }); return; }
        this.raf = requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
    };
  },
  leave() { this.alive = false; cancelAnimationFrame(this.raf); },
};
