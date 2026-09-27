// What's Hiding? A family photo with one thing hidden under a cloud. Guess what it is.
// Mira (5) types her guess; Maia (3) taps one of three pictures. Family photos are
// AES-encrypted in data/ and unlocked by the key in Dad's link (#k=...), which the
// device remembers. Grown-ups can also add puzzles from their own photos; those stay
// on the device in IndexedDB.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app'), fx = $('#fx');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const finePointer = matchMedia('(pointer: fine)').matches;

  const KIDS = {
    mira: { name: 'Mira', c: '#9b6bff', c2: '#6a3fd6', emoji: '👧', little: false },
    maia: { name: 'Maia', c: '#ff6fb1', c2: '#d63f86', emoji: '👧', little: true },
  };

  // ---------- saved progress ----------
  const SAVE_KEY = 'whatsHiding.save', KEY_KEY = 'whatsHiding.key';
  const save = Object.assign({ stars: { mira: 0, maia: 0 }, stickers: { mira: {}, maia: {} }, seen: {}, rounds: 6 },
    JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
  const store = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

  // ---------- sound effects ----------
  let ac = null, master = null;
  function audio() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  document.addEventListener('pointerdown', audio, true);
  document.addEventListener('keydown', audio, true);
  function tone(f, at, dur, type = 'sine', vol = 0.18, f2) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  const SFX = {
    ding() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle', 0.2)); },
    boing() { tone(300, 0, 0.35, 'sine', 0.25, 120); },
    pop() { tone(900, 0, 0.12, 'square', 0.08, 200); tone(500, 0.02, 0.2, 'sine', 0.2, 1400); },
    whoosh() { tone(200, 0, 0.4, 'sawtooth', 0.05, 1200); },
    tick(i = 0) { tone(1200 + i * 120, 0, 0.12, 'triangle', 0.15); },
    tada() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.5, 'triangle', 0.16)); },
    giggle() { [700, 900, 760, 980].forEach((f, i) => tone(f, i * 0.07, 0.08, 'sine', 0.15, f * 1.2)); },
  };

  // ---------- voice: recorded clips (voice/), else the browser's own voice ----------
  const normText = s => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const hash = s => { let x = 0x811c9dc5; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(36); };
  let clips = null;
  const clipsReady = fetch('voice/index.json').then(r => r.json()).then(j => { clips = new Set(j.clips); }).catch(() => { });
  const bufs = new Map();
  function clipBuf(text) {
    const k = hash(normText(text));
    if (!clips || !clips.has(k) || !audio()) return Promise.resolve(null);
    if (!bufs.has(k)) bufs.set(k, fetch('voice/c/' + k + '.mp3').then(r => r.arrayBuffer())
      .then(b => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).catch(() => null));
    return bufs.get(k);
  }
  let sayTok = 0, srcs = [];
  function hush() {
    sayTok++;
    srcs.forEach(s => { try { s.stop(); } catch (e) { } }); srcs = [];
    if (window.speechSynthesis) speechSynthesis.cancel();
  }
  async function sayOne(text, my) {
    await clipsReady;
    const b = await clipBuf(text);
    if (my !== sayTok) return;
    if (b) {
      const s = ac.createBufferSource(); s.buffer = b; s.connect(master); s.start(); srcs.push(s);
      await new Promise(r => { s.onended = r; setTimeout(r, b.duration * 1000 + 400); });
    } else if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.15;
      await new Promise(r => { u.onend = r; u.onerror = r; speechSynthesis.speak(u); setTimeout(r, 900 + text.length * 90); });
    }
  }
  async function say(parts, opt = {}) {
    hush(); const my = sayTok;
    parts = [].concat(parts).filter(Boolean);
    const btn = $('.speak'); if (btn) btn.classList.add('on');
    for (let i = 0; i < parts.length; i++) {
      if (my !== sayTok) return;
      if (opt.onPart) opt.onPart(i);
      await sayOne(parts[i], my);
      await wait(opt.gap == null ? 140 : opt.gap);
    }
    if (my === sayTok) { if (opt.onPart) opt.onPart(-1); const b = $('.speak'); if (b) b.classList.remove('on'); }
  }

  // ---------- family photos: encrypted, unlocked by the link's key ----------
  let LINES = null, builtIn = [], local = [], faces = {}, dataState = 'loading';
  const b64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - s.length % 4) % 4); return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
  function keyFromText(t) { const m = String(t).match(/(?:#|&|^)k=([A-Za-z0-9_-]{16,})/) || String(t).trim().match(/^([A-Za-z0-9_-]{20,})$/); return m ? m[1] : null; }
  (function takeKeyFromLink() {
    const k = keyFromText(location.hash);
    if (k) { localStorage.setItem(KEY_KEY, k); history.replaceState(null, '', location.pathname + location.search); }
  })();
  let cryptoKey = null;
  async function decrypt(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('missing ' + url);
    const buf = await r.arrayBuffer();
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, cryptoKey, buf.slice(12));
  }
  async function loadFamily() {
    const k = localStorage.getItem(KEY_KEY);
    if (!k) { dataState = 'nokey'; return; }
    if (!window.crypto || !crypto.subtle) { dataState = 'insecure'; return; }
    try {
      cryptoKey = await crypto.subtle.importKey('raw', b64u(k), 'AES-GCM', false, ['decrypt']);
      const m = JSON.parse(new TextDecoder().decode(await decrypt('data/m.bin')));
      builtIn = m.puzzles;
      dataState = 'ok';
      for (const [id, file] of Object.entries(m.faces || {})) {
        decrypt(file).then(b => { faces[id] = URL.createObjectURL(new Blob([b], { type: 'image/jpeg' })); $$(`[data-face="${id}"]`).forEach(paintFace); }).catch(() => { });
      }
    } catch (e) {
      console.warn(e);
      dataState = 'badkey';
    }
  }
  function paintFace(el) {
    const id = el.dataset.face;
    if (faces[id]) { el.style.backgroundImage = `url(${faces[id]})`; el.textContent = ''; }
  }
  const photoCache = new Map();
  function photoURL(p) {
    if (!photoCache.has(p.id)) {
      photoCache.set(p.id, p.local
        ? Promise.resolve(URL.createObjectURL(p.blob))
        : decrypt(p.file).then(b => URL.createObjectURL(new Blob([b], { type: 'image/jpeg' }))));
    }
    return photoCache.get(p.id);
  }
  async function loadImage(p) {
    const url = await photoURL(p);
    const img = new Image(); img.src = url;
    await img.decode();
    return img;
  }

  // ---------- puzzles made on this device ----------
  const DB = {
    db: null,
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((res, rej) => {
        const r = indexedDB.open('whats-hiding', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('puzzles', { keyPath: 'id' });
        r.onsuccess = () => { this.db = r.result; res(this.db); };
        r.onerror = () => rej(r.error);
      });
    },
    async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('puzzles', mode); const out = fn(t.objectStore('puzzles')); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }); },
    all() { return this.tx('readonly', s => s.getAll()); },
    put(o) { return this.tx('readwrite', s => s.put(o)); },
    del(id) { return this.tx('readwrite', s => s.delete(id)); },
  };
  async function loadLocal() { try { local = (await DB.all()) || []; } catch (e) { local = []; } }
  const allPuzzles = () => builtIn.concat(local);
  const article = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

  // ---------- judging a typed guess ----------
  const clean = s => normText(s).replace(/^(it'?s |its |it is |is it |a |an |the |my |some |her |his )+/, '').replace(/'/g, '').trim();
  const sing = w => w.replace(/ies$/, 'y').replace(/(ss|sh|ch|x)es$/, '$1').replace(/([^s])s$/, '$1');
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // how a word sounds, roughly, so "bol" matches "ball" and "kat" matches "cat"
  const soundKey = w => w.replace(/\s+/g, '').replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/c(?=[eiy])/g, 's').replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks').replace(/wh/g, 'w').replace(/gh/g, '').replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/z/g, 's')
    .replace(/(.)(?=.)/, '$1|').split('|').map((p, i) => i ? p.replace(/[aeiouy]/g, '') : p).join('').replace(/(.)\1+/g, '$1');
  function judge(guess, p) {
    const g = clean(guess);
    if (!g) return { kind: 'empty' };
    const acc = [p.answer].concat(p.accept || []).map(clean).filter(Boolean);
    const squash = s => sing(s.replace(/\s+/g, ''));
    for (const a of acc) {
      if (g === a || sing(g) === sing(a) || squash(g) === squash(a)) return { kind: 'right' };
      if (a.length >= 3 && (' ' + g + ' ').includes(' ' + a + ' ')) return { kind: 'right' };
    }
    for (const [k, line] of Object.entries(p.near || {})) {
      const kk = clean(k);
      if (g === kk || sing(g) === sing(kk)) return { kind: 'near', line };
    }
    for (const a of acc) {
      const tol = a.length >= 7 ? 2 : a.length >= 4 ? 1 : 0;
      if (lev(squash(g), squash(a)) <= tol) return { kind: 'close' };
    }
    for (const a of acc) {
      if (g.length >= 2 && soundKey(g).length >= 2 && soundKey(g) === soundKey(a)) return { kind: 'sounded' };
    }
    return { kind: 'wrong' };
  }

  // ---------- little pieces of art ----------
  let jarN = 0;
  function jarSVG(frac) {
    const id = 'jc' + (++jarN), top = 68 - Math.max(0, Math.min(1, frac)) * 54;
    const body = 'M14 14 h32 v4 q10 4 10 14 v26 q0 10 -10 10 h-32 q-10 0 -10 -10 v-26 q0 -10 10 -14z';
    return `<svg viewBox="0 0 60 70"><defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
      <rect class="jfill" x="0" y="${top}" width="60" height="70" fill="#ffd23f" clip-path="url(#${id})" style="transition:y .5s"/>
      <g clip-path="url(#${id})" fill="#fff6b0" font-size="9" text-anchor="middle">${frac > 0.15 ? '<text x="20" y="64">★</text>' : ''}${frac > 0.4 ? '<text x="38" y="56">★</text>' : ''}${frac > 0.7 ? '<text x="24" y="42">★</text>' : ''}</g>
      <path d="${body}" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="3"/>
      <rect x="15" y="5" width="30" height="10" rx="3" fill="#b98cff" stroke="#fff" stroke-width="2"/></svg>`;
  }
  const CLOUD_PUFFS = [[14, 14, 14], [86, 14, 14], [14, 86, 14], [86, 86, 14], [50, 7, 15], [8, 50, 13], [92, 50, 13], [50, 93, 15],
    [31, 6, 12], [69, 6, 12], [31, 94, 12], [69, 94, 12], [6, 31, 11], [6, 69, 11], [94, 31, 11], [94, 69, 11]];
  const cloudSVG = () => `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="cg" gradientUnits="userSpaceOnUse" cx="50" cy="30" r="80">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f3f6ff"/><stop offset="1" stop-color="#d9e4ff"/></radialGradient></defs>
    <g fill="url(#cg)"><rect x="8" y="8" width="84" height="84" rx="20"/>${CLOUD_PUFFS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g></svg>`;

  function confetti(emojis = [], n = 44) {
    const colors = ['#ff6fb1', '#9b6bff', '#ffd23f', '#7ed957', '#5ab8ff', '#ff8a3d'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      const em = emojis.length && Math.random() < 0.35;
      if (em) { el.textContent = pick(emojis); el.style.fontSize = (22 + Math.random() * 18) + 'px'; }
      else { el.style.width = (8 + Math.random() * 8) + 'px'; el.style.height = (10 + Math.random() * 10) + 'px'; el.style.background = pick(colors); el.style.borderRadius = Math.random() < 0.4 ? '50%' : '3px'; }
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      el.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
      el.style.animationDuration = (2 + Math.random() * 1.8) + 's';
      el.style.animationDelay = (Math.random() * 0.4) + 's';
      fx.appendChild(el);
      setTimeout(() => el.remove(), 4500);
    }
  }

  // ---------- screens ----------
  let G = null, R = null, ro = null;
  function screen(html, fixed) {
    hush(); if (ro) { ro.disconnect(); ro = null; }
    app.classList.toggle('fixed', !!fixed);
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  const faceHTML = (id, cls = 'face') => `<div class="${cls}" data-face="${id}">${KIDS[id].emoji}</div>`;
  const kidStyle = id => `--c:${KIDS[id].c};--c2:${KIDS[id].c2}`;

  function home() {
    const ready = allPuzzles().length > 0;
    let lock = '';
    if (!ready) {
      const msg = {
        loading: 'Loading the photos…',
        nokey: 'This game uses our family photos, so they\'re locked. Open Dad\'s special link once on this device and it will remember.',
        badkey: 'That link didn\'t unlock the photos. Ask Dad for the special link again.',
        insecure: 'The photos can only be unlocked over https.',
      }[dataState] || 'Loading…';
      lock = `<div class="locked">🔒 ${msg}${dataState === 'loading' ? '' : '<input id="keyin" placeholder="Grown-ups: paste the link here" autocomplete="off">'}</div>`;
    }
    screen(`<div class="home">
      <div class="topline"><a class="pill" href="../../index.html">⬅ All games</a>
        <button class="gear" id="gear" aria-label="Grown-ups: press and hold">⚙️<span class="fill"></span></button></div>
      <div class="title"><div class="logo">☁️</div><h1>What's Hiding?</h1><p>Something's hiding behind the cloud. Can you guess what it is?</p></div>
      ${ready ? `<div class="players">
        ${['mira', 'maia'].map(id => `<button class="player" data-go="${id}" style="${kidStyle(id)}">${faceHTML(id)}
          <div class="name">${KIDS[id].name}</div><div class="stars">⭐ ${save.stars[id] || 0}</div></button>`).join('')}
      </div>
      <button class="together" data-go="both">👭 Play together</button>` : lock}
      <div class="row"><button class="soft" id="bookbtn">📒 Sticker book</button></div>
    </div>`);
    $$('[data-face]').forEach(paintFace);
    $$('[data-go]').forEach(b => b.onclick = () => startGame(b.dataset.go));
    $('#bookbtn').onclick = book;
    const ki = $('#keyin');
    if (ki) ki.oninput = async () => {
      const k = keyFromText(ki.value);
      if (!k) return;
      localStorage.setItem(KEY_KEY, k); dataState = 'loading'; home();
      await loadFamily(); home();
    };
    // grown-ups hold the gear for a second and a half
    const gear = $('#gear'), fill = $('.fill', gear);
    let t0 = 0, raf = 0;
    const stop = () => { cancelAnimationFrame(raf); fill.style.height = '0'; };
    gear.onpointerdown = e => {
      e.preventDefault(); t0 = performance.now();
      const step = () => { const f = (performance.now() - t0) / 1500; fill.style.height = Math.min(100, f * 100) + '%'; if (f >= 1) { stop(); adult(); } else raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    gear.onpointerup = gear.onpointerleave = gear.onpointercancel = stop;
    gear.oncontextmenu = e => e.preventDefault();
  }

  function choosePuzzles(n) {
    const pool = allPuzzles().map(p => ({ p, s: (save.seen[p.id] || 0) + Math.random() * 1000 }));
    pool.sort((a, b) => a.s - b.s);
    return shuffle(pool.slice(0, n).map(x => x.p));
  }

  function startGame(mode) {
    audio();
    const list = choosePuzzles(Math.min(save.rounds, allPuzzles().length));
    G = { mode, order: mode === 'both' ? shuffle(['mira', 'maia']) : [mode], list, i: 0, total: 0, shown: 0, max: list.length * 3, got: { mira: 0, maia: 0 }, results: [] };
    G.greet = pick(LINES.hello[mode]);
    round();
  }

  function round() {
    const p = G.list[G.i], kid = G.order[G.i % G.order.length], little = KIDS[kid].little;
    const boxes = Array.isArray(p.box[0]) ? p.box : [p.box];
    const ar = p.w && p.h ? p.w / p.h : 0.75;
    R = { p, kid, little, boxes, cover: boxes.map(b => cloudBox(b, ar)), peek: 0, wrong: 0, done: false, img: null, tickles: 0 };
    const askText = p.q || LINES.ask[p.who] || LINES.ask.none;
    screen(`<div class="play wide">
      <div class="bar"><button class="back" aria-label="Home">🏠</button>
        <div class="chip" style="${kidStyle(kid)}">${faceHTML(kid, 'mini')}${KIDS[kid].name}</div>
        <div class="dots">${G.list.map((_, i) => `<span class="dot ${i < G.i ? (G.results[i].stars ? 'done' : 'miss') : i === G.i ? 'now' : ''}"></span>`).join('')}</div>
        <div class="jar" id="jar">${jarSVG((G.shown = G.total) / G.max)}<span class="count">${G.total}</span></div></div>
      <div class="stagewrap"><div class="stage"><canvas></canvas>
        ${boxes.map(() => `<div class="cloud"><div class="inner">${cloudSVG()}<div class="q">?</div></div></div>`).join('')}</div></div>
      <div class="side">
        <div class="ask"><div class="text">${esc(askText)}</div><button class="speak" aria-label="Say it again">🔊</button></div>
        <div class="controls">${little ? `
          <div class="choices"></div>` : `
          <div class="blanks"></div>
          <form class="typer" autocomplete="off"><input id="guess" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="go" placeholder="Type it here…" aria-label="Your guess"><button class="go" type="submit" aria-label="Check">✓</button></form>`}
          <div class="feedback"></div>
          <button class="peekbtn">👀 Peek</button>
        </div>
      </div></div>`, true);
    $$('[data-face]').forEach(paintFace);
    $('.back').onclick = home;
    $('.peekbtn').onclick = () => peek();
    $$('.cloud').forEach(c => c.onclick = () => tickle(c));

    let choices = null;
    if (little) {
      choices = makeChoices(p);
      $('.choices').innerHTML = choices.map((c, i) => `<button class="choice" data-i="${i}"><span class="em">${c.emoji}</span><span class="w">${esc(c.word)}</span></button>`).join('');
      $$('.choice').forEach(b => b.onclick = () => choose(choices[+b.dataset.i], b));
    } else {
      $('.typer').onsubmit = e => { e.preventDefault(); submit(); };
      if (finePointer) setTimeout(() => { const g = $('#guess'); if (g) g.focus(); }, 300);
    }
    const intro = [];
    if (G.i === 0 && G.greet) { intro.push(G.greet); G.greet = null; }
    else if (G.order.length > 1) intro.push(LINES.turn[kid]);
    intro.push(askText);
    const speakAll = () => {
      if (!little) return say(intro.concat(G.i === 0 && !save.typedBefore ? [LINES.typeIt] : []));
      const opts = choices.map((c, i) => i === choices.length - 1 ? 'or ' + c.say + '?' : c.say);
      const off = intro.length + 1;
      return say(intro.concat([LINES.isIt], opts), { onPart: i => $$('.choice').forEach((b, j) => b.classList.toggle('hl', i - off === j)) });
    };
    $('.speak').onclick = () => { intro.splice(0, intro.length - 1); speakAll(); };

    loadImage(p).then(img => {
      if (R.p !== p) return;
      R.img = img;
      const wrap = $('.stagewrap');
      ro = new ResizeObserver(fit); ro.observe(wrap);
      fit();
      speakAll();
      const nx = G.list[G.i + 1]; if (nx) photoURL(nx).catch(() => { });
    }).catch(e => { console.warn(e); $('.feedback').textContent = 'That photo didn\'t load. Tap 🏠 and try again.'; });
  }

  // widen a tall thin box (or heighten a flat one) so the cloud over it looks like a cloud
  function cloudBox([x, y, w, h], ar) {
    const r = (w * ar) / h;
    if (r < 0.7) { const nw = 0.7 * h / ar; x -= (nw - w) / 2; w = nw; }
    else if (r > 1.8) { const nh = w * ar / 1.8; y -= (nh - h) / 2; h = nh; }
    return [x, y, w, h];
  }

  function makeChoices(p) {
    const acc = new Set([p.answer].concat(p.accept || []).map(clean));
    const pool = Object.entries(LINES.words).filter(([w, [e]]) => !acc.has(w) && e !== p.emoji && !(p.avoid || []).includes(w));
    const two = shuffle(pool).slice(0, 2).map(([w, [e, s]]) => ({ word: w, emoji: e, say: s }));
    return shuffle([{ word: p.label || p.answer, emoji: p.emoji || '🎁', say: p.say || article(p.answer), right: true }].concat(two));
  }

  function fit() {
    const wrap = $('.stagewrap'), stage = $('.stage'), cv = $('canvas', stage);
    if (!wrap || !R || !R.img) return;
    const W = wrap.clientWidth - 12, H = wrap.clientHeight - 12, ar = R.img.naturalWidth / R.img.naturalHeight;
    let w = W, h = w / ar;
    if (h > H) { h = H; w = h * ar; }
    w = Math.max(80, Math.floor(w)); h = Math.max(60, Math.floor(w / ar));
    stage.style.width = (w + 12) + 'px'; stage.style.height = (h + 12) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const pad = 0.14;
    $$('.cloud', stage).forEach((cl, i) => {
      const [bx, by, bw, bh] = R.cover[i];
      Object.assign(cl.style, { left: (bx - bw * pad) * 100 + '%', top: (by - bh * pad) * 100 + '%', width: bw * (1 + 2 * pad) * 100 + '%', height: bh * (1 + 2 * pad) * 100 + '%' });
      $('.q', cl).style.fontSize = Math.max(26, Math.min(bw * w, bh * h) * 0.7) + 'px';
    });
    draw();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function draw() {
    const cv = $('.stage canvas'); if (!cv || !R.img) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, img = R.img;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, W, H);
    if (R.done) return;
    // under the cloud, the thing is smeared out so a peek shows colors but not what it is
    const pad = 0.1, sx = img.naturalWidth / W, sy = img.naturalHeight / H;
    for (const [bx, by, bw, bh] of R.cover) {
      const x = (bx - bw * pad) * W, y = (by - bh * pad) * H, w = bw * (1 + 2 * pad) * W, h = bh * (1 + 2 * pad) * H;
      const across = R.peek >= 2 ? 11 : 4;
      const sw = across, sh = Math.max(2, Math.round(across * h / w));
      const t = document.createElement('canvas'); t.width = sw; t.height = sh;
      const tx = t.getContext('2d'); tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high';
      tx.drawImage(img, x * sx, y * sy, w * sx, h * sy, 0, 0, sw, sh);
      ctx.save(); roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.25); ctx.clip();
      ctx.drawImage(t, 0, 0, sw, sh, x, y, w, h);
      ctx.restore();
    }
  }

  function tickle(cl) {
    if (R.done) return;
    cl.classList.remove('wiggle'); void cl.offsetWidth; cl.classList.add('wiggle');
    SFX.giggle();
    if (++R.tickles % 2 === 1) say(pick(LINES.tickle));
  }

  function peek(quiet) {
    if (R.done || R.peek >= 2) return;
    R.peek++;
    SFX.whoosh();
    $$('.cloud').forEach(cl => {
      cl.classList.toggle('peek1', R.peek === 1);
      cl.classList.toggle('gone', R.peek >= 2);
    });
    draw();
    const pb = $('.peekbtn'); pb.classList.remove('glow');
    if (R.peek >= 2) pb.disabled = true;
    if (!R.little && R.peek >= 2) {
      $('.blanks').textContent = clean(R.p.answer).split(' ').map(w => w[0] + ' _'.repeat(w.length - 1)).join('   ');
    }
    if (!quiet) say(LINES.peek[R.peek - 1]);
  }

  function submit() {
    if (R.done) return;
    const inp = $('#guess'), fb = $('.feedback');
    const r = judge(inp.value, R.p);
    if (r.kind === 'empty') { inp.focus(); return; }
    save.typedBefore = true; store();
    if (r.kind === 'right' || r.kind === 'close' || r.kind === 'sounded') return win(r.kind, inp.value);
    if (r.kind === 'near') { fb.textContent = r.line; SFX.tick(2); say(r.line); inp.select(); return; }
    R.wrong++;
    SFX.boing();
    inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
    const said = clean(inp.value);
    if (R.wrong >= 4) return giveUp();
    fb.textContent = `Not ${article(said)}…`;
    if (R.wrong === 1) { say(pick(LINES.wrong)); if (R.peek < 2) $('.peekbtn').classList.add('glow'); }
    else { say(LINES.wrong[0]); if (R.peek < R.wrong - 1) peek(true); }
    inp.select();
  }

  function choose(c, btn) {
    if (R.done) return;
    if (c.right) { btn.classList.add('win'); return win('right'); }
    R.wrong++;
    SFX.boing();
    btn.classList.add('shake'); setTimeout(() => btn.classList.add('out'), 400);
    say(pick(LINES.wrongLittle));
    if (R.peek < 2) peek(true);
  }

  function reveal() {
    R.done = true;
    const stage = $('.stage'), sb = stage.getBoundingClientRect();
    SFX.pop();
    $$('.cloud').forEach(cl => {
    cl.classList.remove('peek1', 'gone', 'wiggle'); cl.classList.add('poof');
    // little puffs fly off the cloud
    const box = cl.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const pf = document.createElement('div'), s = 20 + Math.random() * 30, a = i / 10 * Math.PI * 2;
      pf.className = 'puff';
      Object.assign(pf.style, { width: s + 'px', height: s + 'px', left: (box.left - sb.left + box.width / 2 - s / 2) + 'px', top: (box.top - sb.top + box.height / 2 - s / 2) + 'px' });
      pf.style.setProperty('--dx', Math.cos(a) * box.width * 0.8 + 'px'); pf.style.setProperty('--dy', Math.sin(a) * box.height * 0.8 + 'px');
      stage.appendChild(pf); setTimeout(() => pf.remove(), 800);
    }
    });
    draw();
    for (const [bx, by, bw, bh] of R.boxes) {
      const ring = document.createElement('div');
      ring.className = 'ring';
      Object.assign(ring.style, { left: (bx - bw * 0.06) * 100 + '%', top: (by - bh * 0.06) * 100 + '%', width: bw * 1.12 * 100 + '%', height: bh * 1.12 * 100 + '%' });
      setTimeout(() => stage.appendChild(ring), 350);
    }
  }

  function revealPanel(stars, msg) {
    const p = R.p, colors = ['#ff6fb1', '#9b6bff', '#5ab8ff', '#7ed957', '#ff8a3d', '#ffc233'];
    const word = (p.label || p.answer);
    let li = 0;
    const letters = [...word].map(ch => ch === ' ' ? '<span class="sp"></span>'
      : `<span class="l" style="--lc:${colors[li % colors.length]};animation-delay:${0.25 + (li++) * 0.08}s">${esc(ch)}</span>`).join('');
    $('.controls').innerHTML = `<div class="reveal">
      <div class="bigword"><span class="em">${p.emoji || '🎁'}</span>${letters}</div>
      ${msg ? `<div class="feedback">${esc(msg)}</div>` : ''}
      <div class="earned">${stars ? Array.from({ length: stars }, (_, i) => `<span class="s" style="animation-delay:${0.6 + i * 0.25}s">⭐</span>`).join('') : ''}</div>
      <button class="next">${G.i + 1 >= G.list.length ? 'Finish 🎉' : 'Next ➜'}</button></div>`;
    $('.peekbtn') && $('.peekbtn').remove();
    const nx = $('.next'); nx.onclick = next;
    if (finePointer) nx.focus();
  }

  function flyStars(n) {
    const jar = $('#jar'), stage = $('.stage');
    if (!jar || !stage) return;
    const from = stage.getBoundingClientRect(), to = jar.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const s = document.createElement('div');
        s.className = 'flystar'; s.textContent = '⭐';
        s.style.left = (from.left + from.width / 2 - 16) + 'px'; s.style.top = (from.top + from.height / 2 - 16) + 'px';
        document.body.appendChild(s);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          s.style.transform = `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px) scale(.6)`;
        }));
        setTimeout(() => {
          s.remove(); SFX.tick(i);
          const j = $('#jar'); if (!j || G.shown >= G.total) return;
          G.shown++;
          j.innerHTML = jarSVG(G.shown / G.max) + `<span class="count">${G.shown}</span>`;
          j.classList.remove('bump'); void j.offsetWidth; j.classList.add('bump');
        }, 850);
      }, 700 + i * 300);
    }
  }

  function finishRound(stars) {
    G.results[G.i] = { p: R.p, kid: R.kid, stars };
    G.got[R.kid] += stars;
    G.total += stars;
    save.stars[R.kid] = (save.stars[R.kid] || 0) + stars;
    save.seen[R.p.id] = Date.now();
    store();
  }
  const revealLine = p => p.reveal || `It's ${p.say || article(p.answer)}!`;

  function win(kind) {
    const stars = R.little ? Math.max(1, 3 - R.wrong) : Math.max(1, 3 - R.peek);
    reveal();
    SFX.ding();
    confetti([R.p.emoji || '⭐', '⭐']);
    finishRound(stars);
    const praise = kind === 'sounded' ? LINES.sounded : kind === 'close' ? LINES.closeSpell : pick(LINES.right);
    revealPanel(stars, kind === 'sounded' || kind === 'close' ? `${praise} It's spelled ${(R.p.label || R.p.answer).toUpperCase()}.` : '');
    flyStars(stars);
    say([praise, revealLine(R.p)]);
  }

  function giveUp() {
    reveal();
    SFX.tada();
    finishRound(0);
    revealPanel(0, 'Now you know!');
    say([LINES.giveUp, revealLine(R.p)]);
  }

  function next() {
    G.i++;
    if (G.i >= G.list.length) end(); else round();
  }

  function end() {
    const kids = G.order.slice().sort();
    const won = {};
    for (const k of kids) {
      const mine = G.results.filter(r => r.kid === k);
      const best = mine.filter(r => r.stars === 3).concat(mine.filter(r => r.stars > 0), mine);
      const em = best.length ? (best[0].p.emoji || '⭐') : '⭐';
      won[k] = em;
      save.stickers[k] = save.stickers[k] || {};
      save.stickers[k][em] = (save.stickers[k][em] || 0) + 1;
    }
    store();
    const title = G.order.length > 1 ? 'Great teamwork!' : `Great job, ${KIDS[G.order[0]].name}!`;
    screen(`<div class="end">
      <h2>${title}</h2>
      <div class="bigjar">${jarSVG(G.total / G.max)}</div>
      <div class="tally">⭐ ${G.total} stars${G.order.length > 1 ? ` <br><small>${kids.map(k => `${KIDS[k].name}: ${G.got[k]}`).join(' · ')}</small>` : ''}</div>
      <div>New sticker${kids.length > 1 ? 's' : ''}!</div>
      <div class="row">${kids.map(k => `<div style="${kidStyle(k)}"><div class="newsticker">${won[k]}</div><b style="color:var(--c2)">${KIDS[k].name}</b></div>`).join('')}</div>
      <div class="row"><button class="next" id="again">Play again</button><button class="soft" id="bk">📒 Stickers</button><button class="soft" id="hm">🏠 Home</button></div>
    </div>`);
    SFX.tada();
    confetti(Object.values(won).concat(['⭐']), 80);
    say([G.total >= G.max * 0.5 ? LINES.jar : null, LINES.sticker, LINES.again]);
    $('#again').onclick = () => startGame(G.mode);
    $('#bk').onclick = book;
    $('#hm').onclick = home;
  }

  function book() {
    screen(`<div class="book">
      <div class="topline"><button class="pill" id="hm">⬅ Back</button></div>
      <h2>📒 Sticker Book</h2>
      ${['mira', 'maia'].map(k => {
        const st = Object.entries(save.stickers[k] || {});
        return `<div class="page" style="${kidStyle(k)}"><h3>${KIDS[k].name}'s stickers · ⭐ ${save.stars[k] || 0}</h3>
          ${st.length ? `<div class="stk">${st.map(([e, n]) => `<div>${e}${n > 1 ? `<b>×${n}</b>` : ''}</div>`).join('')}</div>` : '<div class="empty">Play a game to win your first sticker!</div>'}</div>`;
      }).join('')}
    </div>`);
    $('#hm').onclick = home;
  }

  // ---------- grown-ups ----------
  async function adult() {
    await loadLocal();
    const emojiRow = [...new Set(Object.values(LINES.words).map(v => v[0]).concat(['🎁', '🫧', '🧃', '🪀', '🎨', '🧩', '🪇', '🎸', '🍭', '🌻']))];
    screen(`<div class="adult">
      <div class="topline"><button class="pill" id="hm">⬅ Back to the game</button></div>
      <h2>Grown-ups</h2>
      <div class="card"><b>Family photos</b>
        <div>${dataState === 'ok' ? `✅ Unlocked on this device: ${builtIn.length} family photo puzzles.` : '🔒 Not unlocked on this device. Open Dad\'s special link here, or paste it below.'}</div>
        ${dataState === 'ok' ? '<button class="btn gray" id="forget">Lock the photos on this device</button>' : '<input type="text" id="keyin2" placeholder="Paste the special link">'}
      </div>
      <div class="card"><label>Puzzles per game
        <select id="rounds">${[4, 6, 8, 10].map(n => `<option ${n === save.rounds ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <div class="card"><b>Make a puzzle from your own photo</b>
        <div class="hint">Pick a photo, then drag a box over the thing to hide. It stays on this device only.</div>
        <input type="file" id="file" accept="image/*">
        <div class="editor" id="ed" hidden><canvas></canvas><div class="sel" hidden></div></div>
        <div id="form" hidden style="display:flex;flex-direction:column;gap:10px">
          <label>What is it? <input type="text" id="ans" placeholder="ball"></label>
          <label>Other answers that count (commas) <input type="text" id="acc" placeholder="soccer ball, football"></label>
          <label>Who's in the photo?
            <select id="who"><option value="mira">Mira</option><option value="maia">Maia</option><option value="both">Both</option><option value="none">Nobody / someone else</option></select></label>
          <div><b>Picture for Maia's buttons</b><div class="emojis">${emojiRow.map(e => `<button type="button" data-e="${e}">${e}</button>`).join('')}</div></div>
          <button class="btn" id="savep">Save puzzle</button>
        </div>
      </div>
      <div class="card"><b>Puzzles made on this device</b>
        <div class="mine">${local.length ? local.map(p => `<div class="it"><img data-id="${p.id}"><div>${p.emoji || ''} ${esc(p.answer)}</div><button class="x" data-del="${p.id}">✕</button></div>`).join('') : '<span class="hint">None yet.</span>'}</div></div>
      <div class="card"><b>Start over</b><button class="btn red" id="reset">Clear stars and stickers</button></div>
    </div>`);
    $('#hm').onclick = home;
    $('#rounds').onchange = e => { save.rounds = +e.target.value; store(); };
    const fg = $('#forget'); if (fg) fg.onclick = () => { localStorage.removeItem(KEY_KEY); builtIn = []; dataState = 'nokey'; adult(); };
    const k2 = $('#keyin2'); if (k2) k2.oninput = async () => { const k = keyFromText(k2.value); if (!k) return; localStorage.setItem(KEY_KEY, k); await loadFamily(); adult(); };
    $('#reset').onclick = () => { if (!confirm('Clear all stars and stickers?')) return; save.stars = { mira: 0, maia: 0 }; save.stickers = { mira: {}, maia: {} }; store(); adult(); };
    $$('.mine img').forEach(im => { const p = local.find(x => x.id === im.dataset.id); if (p) im.src = URL.createObjectURL(p.blob); });
    $$('[data-del]').forEach(b => b.onclick = async () => { await DB.del(b.dataset.del); await loadLocal(); adult(); });

    let img = null, box = null, emoji = '🎁';
    const ed = $('#ed'), cv = $('canvas', ed), sel = $('.sel', ed), form = $('#form');
    form.style.display = 'none';
    $$('.emojis button').forEach(b => b.onclick = () => { emoji = b.dataset.e; $$('.emojis button').forEach(x => x.classList.toggle('on', x === b)); });
    $('#ans').oninput = e => {
      const w = LINES.words[clean(e.target.value)];
      if (w) { emoji = w[0]; $$('.emojis button').forEach(x => x.classList.toggle('on', x.dataset.e === emoji)); }
    };
    $('#file').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
      const s = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
      cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
      img = true; box = null; sel.hidden = true; ed.hidden = false; form.style.display = 'flex';
    };
    let start = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
    const show = () => {
      const r = cv.getBoundingClientRect(), er = ed.getBoundingClientRect();
      Object.assign(sel.style, { left: (r.left - er.left + box[0] * r.width) + 'px', top: (r.top - er.top + box[1] * r.height) + 'px', width: box[2] * r.width + 'px', height: box[3] * r.height + 'px' });
      sel.hidden = false;
    };
    cv.onpointerdown = e => { if (!img) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); start = pt(e); };
    cv.onpointermove = e => {
      if (!start) return;
      const q = pt(e);
      box = [Math.min(start[0], q[0]), Math.min(start[1], q[1]), Math.abs(q[0] - start[0]), Math.abs(q[1] - start[1])];
      show();
    };
    cv.onpointerup = () => { start = null; };
    $('#savep').onclick = async () => {
      const ans = $('#ans').value.trim();
      if (!img) return alert('Pick a photo first.');
      if (!box || box[2] < 0.03 || box[3] < 0.03) return alert('Drag a box over the thing to hide.');
      if (!ans) return alert('Type what the hidden thing is.');
      const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.85));
      await DB.put({
        id: 'L' + Date.now(), local: true, blob, w: cv.width, h: cv.height, answer: ans.toLowerCase(),
        accept: $('#acc').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        who: $('#who').value, emoji, box,
      });
      await loadLocal();
      adult();
    };
  }

  // ---------- go ----------
  (async () => {
    LINES = await fetch('lines.json').then(r => r.json());
    await loadLocal();
    home();
    await loadFamily();
    if (!G) home();
  })();
})();
