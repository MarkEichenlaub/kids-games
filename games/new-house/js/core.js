// Core: saved state, sound, Beep's voice, pop-ups, effects.
window.G = (function () {
  const G = {};
  const SAVE_KEY = 'newHouse.v1';

  // ---------- utils ----------
  G.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  G.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  G.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  G.$ = (sel, root) => (root || document).querySelector(sel);
  G.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  G.html = (str) => { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; };
  G.wait = ms => new Promise(r => setTimeout(r, ms));

  // ---------- who plays ----------
  G.KIDS = {
    mira: { id: 'mira', name: 'Mira', sis: 'maia', little: false, color: '#9b6bff' },
    maia: { id: 'maia', name: 'Maia', sis: 'mira', little: true, color: '#ff6fb1' },
  };

  // ---------- saved state ----------
  // One house shared by both kids; each kid keeps her own costume, stamps and stars.
  G.defaultProfile = id => ({ id, costume: id === 'mira' ? 'owl' : 'unicorn', stamps: {}, stars: 0, glims: {}, done: {}, intro: false });
  G.defaultHouse = () => ({ items: {}, paint: {}, unlocked: [], flowers: {}, roomNames: { bedA: 'star', bedB: 'moon' }, pet: null, garageOpen: false, nextPkg: 0 });
  G.save = { profiles: {}, current: null, house: G.defaultHouse(), settings: { sound: true, voice: true, music: true } };
  G.load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && s.profiles) { G.save = Object.assign(G.save, s); G.save.house = Object.assign(G.defaultHouse(), s.house || {}); }
    } catch (e) { }
    G.save.settings = Object.assign({ sound: true, voice: true, music: true }, G.save.settings || {});
  };
  let persistT = null;
  G.persist = () => { clearTimeout(persistT); persistT = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) { } }, 200); };
  G.P = () => G.save.profiles[G.save.current];
  G.kid = () => G.KIDS[G.save.current] || G.KIDS.mira;
  G.isLittle = () => G.kid().little;
  G.usePro = id => {
    if (!G.save.profiles[id]) G.save.profiles[id] = G.defaultProfile(id);
    const p = G.save.profiles[id], d = G.defaultProfile(id);
    for (const k in d) if (p[k] === undefined) p[k] = d[k];
    G.save.current = id; G.persist();
  };
  G.addStars = (n, sx, sy) => {
    const p = G.P(); if (!p) return;
    p.stars += n; G.persist();
    if (sx != null) G.floatText('+' + n + ' ⭐', sx, sy);
    G.$$('.star-count').forEach(e => e.textContent = p.stars);
  };

  // ---------- audio ----------
  let ac = null, master = null, musicGain = null;
  G.audio = () => {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
      } catch (e) { return null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  function tone(freq, dur, type = 'sine', vol = 0.3, when = 0, slide = null, dest = null) {
    if (!G.save.settings.sound && !dest) return;
    const a = G.audio(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.3, when = 0, filterFreq = 1200, sweepTo = null, type = 'lowpass') {
    if (!G.save.settings.sound) return;
    const a = G.audio(); if (!a) return;
    const t = a.currentTime + when;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(filterFreq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  G.tone = tone; G.noise = noise;
  const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];
  G.sfx = {
    tap: () => tone(660, 0.08, 'triangle', 0.2),
    pop: () => tone(500, 0.1, 'sine', 0.3, 0, 900),
    snap: () => { tone(300, 0.06, 'square', 0.15); tone(900, 0.12, 'triangle', 0.25, 0.05); },
    good: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.25, i * 0.08)),
    great: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', 0.25, i * 0.09)),
    oops: () => tone(300, 0.18, 'sine', 0.25, 0, 200),
    chime: () => { tone(1320, 0.3, 'sine', 0.18); tone(1760, 0.4, 'sine', 0.12, 0.06); },
    sparkle: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, 0.18, 'sine', 0.12, i * 0.05)),
    boop: () => { tone(880, 0.07, 'square', 0.1); tone(1175, 0.09, 'square', 0.1, 0.08); },
    gift: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'sine', 0.2, i * 0.06)),
    step: n => tone(SCALE[((n % SCALE.length) + SCALE.length) % SCALE.length], 0.22, 'triangle', 0.22),
    note: n => { tone(SCALE[n % SCALE.length], 0.5, 'triangle', 0.25); tone(SCALE[n % SCALE.length] / 2, 0.5, 'sine', 0.12); },
    doorbell: () => { tone(988, 0.5, 'sine', 0.3); tone(784, 0.8, 'sine', 0.3, 0.35); },
    flush: () => { noise(1.6, 0.35, 0, 2500, 200); tone(180, 1.2, 'sine', 0.1, 0.1, 60); },
    water: () => noise(0.9, 0.2, 0, 3500, 1800, 'bandpass'),
    splash: () => { noise(0.5, 0.35, 0, 800, 3500); tone(300, 0.25, 'sine', 0.2, 0, 120); },
    whoosh: () => noise(0.5, 0.22, 0, 300, 3000),
    boing: () => tone(180, 0.35, 'sine', 0.35, 0, 520),
    thump: () => { tone(120, 0.15, 'sine', 0.4, 0, 60); noise(0.08, 0.15, 0, 500); },
    stamp: () => { tone(110, 0.12, 'sine', 0.45, 0, 70); noise(0.06, 0.2, 0, 700); tone(1320, 0.3, 'sine', 0.16, 0.12); tone(1760, 0.4, 'sine', 0.12, 0.2); },
    motor: (d = 1.6) => { noise(d, 0.18, 0, 260, 320); tone(70, d, 'sawtooth', 0.06, 0, 90); },
    honk: () => { tone(392, 0.25, 'square', 0.14); tone(494, 0.25, 'square', 0.14); },
    crackle: () => { for (let i = 0; i < 7; i++) noise(0.04, 0.25, i * 0.09 + Math.random() * 0.05, 3000 + Math.random() * 2000, null, 'highpass'); },
    spin: () => { noise(1.4, 0.16, 0, 400, 900); for (let i = 0; i < 6; i++) tone(140, 0.08, 'sine', 0.18, i * 0.22); },
    open: () => { tone(220, 0.08, 'triangle', 0.2); tone(330, 0.12, 'triangle', 0.2, 0.07); },
    close: () => { tone(330, 0.08, 'triangle', 0.2); tone(200, 0.1, 'triangle', 0.22, 0.07); },
    click: () => tone(1400, 0.03, 'square', 0.12),
    hoot: () => { tone(392, 0.25, 'sine', 0.3, 0, 350); tone(350, 0.4, 'sine', 0.3, 0.32, 300); },
    squeak: () => tone(1200, 0.12, 'sine', 0.2, 0, 1900),
    meow: () => tone(700, 0.4, 'triangle', 0.2, 0, 480),
    woof: () => { tone(260, 0.12, 'sawtooth', 0.2, 0, 160); tone(240, 0.14, 'sawtooth', 0.2, 0.18, 150); },
    brush: () => { for (let i = 0; i < 4; i++) noise(0.1, 0.14, i * 0.14, 4000, null, 'highpass'); },
    sizzle: () => noise(1.2, 0.12, 0, 5000, null, 'highpass'),
    bubble: () => tone(G.rand(500, 1100), 0.09, 'sine', 0.2, 0, G.rand(1300, 1900)),
    rain: () => noise(1.5, 0.14, 0, 5000, 3000, 'highpass'),
  };

  // a soft music-box tune that wanders around a pentatonic scale
  let musicTimer = null, musicStep = 0;
  const TUNE = [0, 2, 4, 2, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 4, 0, 5, 7, 9, 7, 5, 4, 2, 4, 0, 2, 4, 5, 4, 2, 0, -1];
  const PENT = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880];
  G.music = on => {
    clearInterval(musicTimer); musicTimer = null;
    if (!on || !G.save.settings.music) return;
    musicTimer = setInterval(() => {
      if (document.hidden || !G.save.settings.music) return;
      const a = G.audio(); if (!a || a.state !== 'running') return;
      const n = TUNE[musicStep % TUNE.length]; musicStep++;
      if (n < 0) return;
      const f = PENT[n];
      tone(f, 0.9, 'sine', 0.5, 0, null, musicGain);
      if (musicStep % 4 === 1) tone(f / 2, 1.6, 'triangle', 0.3, 0, null, musicGain);
    }, 520);
  };

  // ---------- Beep's voice ----------
  // Every sentence Beep says has a recorded clip in voice/c (see tools/build-voice.mjs);
  // a sentence without one falls back to the browser's own voice.
  const V = G.voice = {};
  V.norm = s => s.normalize('NFC').toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').replace(/^[' ]+|[' ]+$/g, '').trim();
  V.hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
  V.clean = s => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim();
  V.sentences = s => V.clean(s).split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => /\p{L}|\p{N}/u.test(x));
  let have = null;
  const bufs = new Map();
  V.ready = (typeof fetch === 'undefined' ? Promise.resolve() : fetch('voice/index.json').then(r => r.json()).then(ix => { have = new Set(ix.clips); }).catch(() => { have = null; }));
  V.misses = new Set();
  const loadClip = (a, url) => {
    if (!bufs.has(url)) bufs.set(url, fetch(url).then(r => r.arrayBuffer()).then(b => a.decodeAudioData(b)).catch(() => null));
    if (bufs.size > 300) bufs.delete(bufs.keys().next().value);
    return bufs.get(url);
  };
  let playing = [], token = 0, sysVoice = null, voiceGain = null;
  function pickVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const prefs = [/Ava.*Online/i, /Jenny.*Online/i, /Aria.*Online/i, /Google US English/i, /Samantha/i, /Zira/i, /en-US/i, /^en/i];
    for (const p of prefs) { const v = vs.find(v => p.test(v.name) || p.test(v.lang)); if (v) { sysVoice = v; return; } }
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  G.hush = () => { token++; playing.forEach(s => { try { s.stop(); } catch (e) { } }); playing = []; if (window.speechSynthesis) speechSynthesis.cancel(); };
  let lastSaid = '', curTalk = Promise.resolve();
  G.whenQuiet = (max = 9000) => Promise.race([curTalk, G.wait(max)]);
  G.say = text => {
    lastSaid = text;
    G.hush();
    const my = token;
    return curTalk = (async () => {
      const est = Math.min(6000, 500 + text.length * 55);
      if (!G.save.settings.voice) { await G.wait(est); return; }
      await Promise.race([V.ready, G.wait(1500)]);
      if (my !== token) return;
      const parts = V.sentences(text);
      const a = G.audio();
      const urls = parts.map(p => { const h = V.hash(V.norm(p)); if (have && have.has(h)) return 'voice/c/' + h + '.mp3'; V.misses.add(p); return null; });
      if (a && urls.length && urls.every(Boolean)) {
        const bs = await Promise.all(urls.map(u => loadClip(a, u)));
        if (my !== token) return;
        if (bs.every(Boolean)) {
          if (!voiceGain) { voiceGain = a.createGain(); voiceGain.gain.value = 1; voiceGain.connect(a.destination); }
          let t = a.currentTime + 0.03;
          playing = bs.map(b => { const s = a.createBufferSource(); s.buffer = b; s.connect(voiceGain); s.start(t); t += b.duration + 0.2; return s; });
          const total = (t - a.currentTime) * 1000;
          await new Promise(res => { playing[playing.length - 1].onended = res; setTimeout(res, total + 300); });
          return;
        }
      }
      if (!window.speechSynthesis) { await G.wait(est); return; }
      await new Promise(res => {
        const u = new SpeechSynthesisUtterance(V.clean(text).replace(/\bMira\b/g, 'Meera').replace(/\bMaia\b/g, 'Maya'));
        if (sysVoice) u.voice = sysVoice;
        u.rate = 0.95; u.pitch = 1.15;
        let done = false; const fin = () => { if (!done) { done = true; res(); } };
        u.onend = fin; u.onerror = fin; setTimeout(fin, 1500 + text.length * 90);
        speechSynthesis.speak(u);
      });
    })();
  };

  // ---------- Beep ----------
  let beepHideT = null;
  G.beepSvg = () => `
  <svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
    <line x1="50" y1="14" x2="50" y2="2" stroke="#8a93b8" stroke-width="4"/>
    <circle cx="50" cy="4" r="6" fill="#ff4f9a"><animate attributeName="fill" values="#ff4f9a;#ffe066;#ff4f9a" dur="1.2s" repeatCount="indefinite"/></circle>
    <rect x="12" y="14" width="76" height="56" rx="24" fill="#e8ecff" stroke="#8a93b8" stroke-width="3"/>
    <rect x="22" y="24" width="56" height="36" rx="16" fill="#1d2150"/>
    <g fill="#6ff0ff"><ellipse cx="38" cy="40" rx="6" ry="8"><animate attributeName="ry" values="8;8;1;8" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="62" cy="40" rx="6" ry="8"><animate attributeName="ry" values="8;8;1;8" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite"/></ellipse></g>
    <path d="M40 50 Q50 58 60 50" stroke="#6ff0ff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="27" cy="52" r="4" fill="#ff9fce" opacity=".8"/><circle cx="73" cy="52" r="4" fill="#ff9fce" opacity=".8"/>
    <rect x="28" y="72" width="44" height="30" rx="12" fill="#c9d1f5" stroke="#8a93b8" stroke-width="3"/>
    <circle cx="50" cy="86" r="6" fill="#ffd93d"/>
    <rect x="6" y="76" width="16" height="10" rx="5" fill="#c9d1f5" stroke="#8a93b8" stroke-width="2"/>
    <rect x="78" y="76" width="16" height="10" rx="5" fill="#c9d1f5" stroke="#8a93b8" stroke-width="2"/>
    <path d="M36 104 L32 111 L44 111 Z M64 104 L68 111 L56 111 Z" fill="#ff9f43"/>
  </svg>`;
  G.onBeepTap = null; // the world sets this to give a hint
  G.initBeep = () => {
    const bot = G.$('#beep-bot'); bot.innerHTML = G.beepSvg();
    bot.addEventListener('pointerdown', e => {
      e.stopPropagation(); G.sfx.boop();
      if (G.onBeepTap && G.onBeepTap()) return;
      if (lastSaid) G.beep(lastSaid);
    });
    G.$('#beep-bubble').addEventListener('pointerdown', e => { e.stopPropagation(); if (lastSaid) G.beep(lastSaid); });
  };
  G.showBeep = (on = true) => G.$('#beep').classList.toggle('hidden', !on);
  // Beep says a line (the newest line wins; pass {queue:true} to wait for the current one)
  G.beep = (text, opts = {}) => {
    if (!text) return Promise.resolve();
    if (opts.queue) { const my = token; return G.whenQuiet(12000).then(() => my === token ? G.beep(text) : null); }
    const bub = G.$('#beep-bubble');
    bub.textContent = text; bub.classList.add('show');
    clearTimeout(beepHideT);
    const p = G.say(text);
    p.then(() => { if (bub.textContent === text) beepHideT = setTimeout(() => bub.classList.remove('show'), opts.linger || 3000); });
    return p;
  };
  G.beepQuiet = () => G.$('#beep-bubble').classList.remove('show');
  G.lastSaid = () => lastSaid;

  // ---------- screens ----------
  G.screens = {};
  let cur = null;
  G.go = (name, arg) => {
    G.hush(); G.closeModal();
    if (cur && cur.leave) try { cur.leave(); } catch (e) { console.error(e); }
    const root = G.$('#screen'); root.innerHTML = ''; root.className = '';
    G.$('#fx-layer').innerHTML = '';
    G.beepQuiet();
    cur = G.screens[name]; G.current = name;
    cur.enter(root, arg);
  };

  // ---------- pop-ups ----------
  G.modal = (content, opts = {}) => {
    G.closeModal();
    const m = G.html(`<div class="modal-back ${opts.cls || ''}"><div class="modal"></div></div>`);
    const box = m.firstElementChild;
    if (typeof content === 'string') box.innerHTML = content; else box.appendChild(content);
    if (opts.close !== false) {
      const x = G.html('<button class="round-btn modal-x" title="Close">✖</button>');
      x.onclick = () => { G.sfx.tap(); G.closeModal(); };
      box.appendChild(x);
      m.addEventListener('pointerdown', e => { if (e.target === m) G.closeModal(); });
    }
    m._onClose = opts.onClose;
    G.$('#modal-root').appendChild(m);
    return box;
  };
  G.closeModal = () => {
    const r = G.$('#modal-root'); if (!r) return;
    const ms = Array.from(r.children); r.innerHTML = '';
    ms.forEach(m => { if (m._onClose) try { m._onClose(); } catch (e) { console.error(e); } });
  };
  G.modalOpen = () => !!G.$('#modal-root').firstElementChild;

  // ---------- effects ----------
  G.confetti = (n = 60) => {
    const layer = G.$('#fx-layer');
    const cols = ['#ff6fb1', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff', '#ff9f43', '#37c9d6'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%'; c.style.background = G.pick(cols);
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; c.style.animationDelay = (Math.random() * 0.5) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(c); setTimeout(() => c.remove(), 3800);
    }
  };
  G.floatText = (txt, x, y, cls = '') => {
    const e = G.html(`<div class="float-text ${cls}">${txt}</div>`);
    e.style.left = x + 'px'; e.style.top = y + 'px';
    G.$('#fx-layer').appendChild(e); setTimeout(() => e.remove(), 1400);
  };
  G.burst = (x, y, emoji = '✨', n = 8) => {
    const layer = G.$('#fx-layer');
    for (let i = 0; i < n; i++) {
      const e = document.createElement('span'); e.className = 'burst'; e.textContent = emoji;
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.5, d = 50 + Math.random() * 70;
      e.style.left = x + 'px'; e.style.top = y + 'px';
      e.style.setProperty('--dx', Math.cos(ang) * d + 'px'); e.style.setProperty('--dy', Math.sin(ang) * d + 'px');
      layer.appendChild(e); setTimeout(() => e.remove(), 900);
    }
  };

  // ---------- family key for the real photos (shared with What's Hiding?) ----------
  const KEY_KEY = 'whatsHiding.key';
  const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
  G.keyFromText = t => { const m = String(t).match(/(?:#|&|^)k=([A-Za-z0-9_-]{16,})/) || String(t).trim().match(/^([A-Za-z0-9_-]{20,})$/); return m ? m[1] : null; };
  G.setKey = k => { try { localStorage.setItem(KEY_KEY, k); } catch (e) { } cryptoKey = null; photoUrls.clear(); return G.photosReady(); };
  let cryptoKey = null, photoIndex = null;
  const photoUrls = new Map();
  G.photosReady = async () => {
    try {
      if (typeof location !== 'undefined') { const k = G.keyFromText(location.hash); if (k) { localStorage.setItem(KEY_KEY, k); history.replaceState(null, '', location.pathname + location.search); } }
      const k = localStorage.getItem(KEY_KEY);
      if (!k || !window.crypto || !crypto.subtle) return false;
      cryptoKey = await crypto.subtle.importKey('raw', b64u(k), 'AES-GCM', false, ['decrypt']);
      if (!photoIndex) photoIndex = await fetch('data/index.json').then(r => r.json());
      const probe = await G.photo(photoIndex.probe);
      return !!probe;
    } catch (e) { cryptoKey = null; return false; }
  };
  G.hasPhotos = () => !!(cryptoKey && photoIndex);
  G.photosFor = room => (G.hasPhotos() && photoIndex.rooms[room]) || [];
  G.photo = async id => {
    if (!cryptoKey || !id) return null;
    if (photoUrls.has(id)) return photoUrls.get(id);
    try {
      const buf = await fetch('data/p/' + id + '.bin').then(r => r.arrayBuffer());
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, cryptoKey, buf.slice(12));
      const url = URL.createObjectURL(new Blob([plain], { type: 'image/jpeg' }));
      photoUrls.set(id, url); return url;
    } catch (e) { return null; }
  };

  return G;
})();
