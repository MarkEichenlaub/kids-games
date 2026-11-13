// Core: state, sound, speech, Beep the robot, screens, modals, effects.
window.G = (function () {
  const G = {};
  const SAVE_KEY = 'rocketBuilders.v1';

  // ---------- utils ----------
  G.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  G.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  G.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  G.$ = (sel, root) => (root || document).querySelector(sel);
  G.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  G.html = (str) => { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; };
  G.wait = ms => new Promise(r => setTimeout(r, ms));
  G.starBg = (n = 80) => { let s = '<div class="star-bg">'; for (let i = 0; i < n; i++) s += `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s;transform:scale(${0.5 + Math.random()})"></i>`; return s + '</div>'; };

  // ---------- save state ----------
  G.defaultProfile = (id) => ({
    id, stars: 0, starBits: 0,
    parts: ['nose-cone', 'cap-basic', 'body-plain', 'fins-tri', 'eng-1'],
    rocket: { nose: null, capsule: null, bodies: [], fins: null, engine: null, boosters: null, color: '#ff5d8f', accent: '#ffffff', stickers: [], crew: null },
    visited: {}, stickers: {}, videosSeen: {}, stationRounds: {}, launched: 0,
    level: { math: id === 'maia' ? 0 : 2, words: id === 'maia' ? 0 : 1, maze: id === 'maia' ? 0 : 1, shapes: id === 'maia' ? 0 : 1 },
    flags: {}, face: null,
  });
  G.save = { profiles: {}, current: null, settings: { sound: true, music: true, voice: true, rate: 0.95 } };
  G.load = () => {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.profiles) G.save = Object.assign(G.save, s); } catch (e) { }
    G.save.settings = Object.assign({ sound: true, music: true, voice: true, rate: 0.95 }, G.save.settings || {});
  };
  G.persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.save)); } catch (e) { } };
  G.P = () => G.save.profiles[G.save.current];
  G.isLittle = () => (G.P() && G.P().little) || false;
  G.kidName = () => (G.P() && G.P().name) || 'Astronaut';
  G.usePro = (id, name, little) => {
    if (!G.save.profiles[id]) G.save.profiles[id] = G.defaultProfile(id);
    const p = G.save.profiles[id];
    const d = G.defaultProfile(id);
    for (const k in d) if (p[k] === undefined) p[k] = d[k];
    p.level = Object.assign(d.level, p.level);
    p.name = name; p.little = !!little;
    G.save.current = id; G.persist();
  };
  G.addStars = (n, x, y) => {
    const p = G.P(); p.stars += n; G.persist();
    if (x != null) G.floatText('+' + n + ' ⭐', x, y);
    G.$$('.star-count').forEach(e => e.textContent = p.stars);
  };

  // ---------- audio ----------
  let ac = null, master = null, musicGain = null;
  G.audio = () => {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.0; musicGain.connect(master);
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
  function noise(dur, vol = 0.3, when = 0, filterFreq = 1200, sweepTo = null) {
    if (!G.save.settings.sound) return;
    const a = G.audio(); if (!a) return;
    const t = a.currentTime + when;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(filterFreq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  G.sfx = {
    tap: () => tone(660, 0.08, 'triangle', 0.2),
    pop: () => { tone(500, 0.1, 'sine', 0.3, 0, 900); },
    snap: () => { tone(300, 0.06, 'square', 0.15); tone(900, 0.12, 'triangle', 0.25, 0.05); },
    good: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.25, i * 0.08)); },
    great: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', 0.25, i * 0.09)); },
    oops: () => { tone(300, 0.18, 'sine', 0.25, 0, 200); },
    chime: () => { tone(1320, 0.3, 'sine', 0.18); tone(1760, 0.4, 'sine', 0.12, 0.06); },
    bonk: () => { tone(140, 0.2, 'sine', 0.35, 0, 70); noise(0.1, 0.15, 0, 600); },
    whoosh: () => noise(0.6, 0.25, 0, 300, 3000),
    rumble: (d = 3) => noise(d, 0.5, 0, 200, 900),
    boop: () => { tone(880, 0.07, 'square', 0.1); tone(1175, 0.09, 'square', 0.1, 0.08); },
    gift: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'sine', 0.2, i * 0.06)); },
    count: (n) => tone(440 + n * 20, 0.15, 'square', 0.12),
    warp: () => { tone(200, 1.0, 'sawtooth', 0.12, 0, 2000); noise(1.0, 0.2, 0, 400, 5000); },
  };

  // gentle generative music
  let musicTimer = null, musicMood = null;
  const MOODS = {
    base: { scale: [0, 2, 4, 7, 9, 12, 14, 16], root: 60, tempo: 360, type: 'triangle', vol: 0.05 },
    space: { scale: [0, 3, 5, 7, 10, 12, 15], root: 55, tempo: 520, type: 'sine', vol: 0.06 },
    think: { scale: [0, 2, 4, 5, 7, 9, 11, 12], root: 64, tempo: 440, type: 'sine', vol: 0.04 },
  };
  G.music = (mood) => {
    if (musicMood === mood) return;
    musicMood = mood;
    clearInterval(musicTimer); musicTimer = null;
    if (!mood || !G.save.settings.music) return;
    const a = G.audio(); if (!a) return;
    const m = MOODS[mood]; let step = 0;
    musicGain.gain.value = 1;
    musicTimer = setInterval(() => {
      if (!G.save.settings.music || document.hidden) return;
      const note = m.root + m.scale[(step * 3 + (step >> 2)) % m.scale.length] + (step % 16 < 8 ? 0 : -5);
      const f = 440 * Math.pow(2, (note - 69) / 12);
      tone(f, m.tempo / 1000 * 1.8, m.type, m.vol, 0, null, musicGain);
      if (step % 4 === 0) tone(f / 2, m.tempo / 1000 * 3.5, 'sine', m.vol * 0.8, 0, null, musicGain);
      step++;
    }, m.tempo);
  };

  // ---------- speech ----------
  let voice = null;
  function pickVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const prefs = [/Jenny.*Online/i, /Aria.*Online/i, /Ana.*Online/i, /Google US English/i, /Samantha/i, /Zira/i, /en-US/i, /^en/i];
    for (const p of prefs) { const v = vs.find(v => p.test(v.name) || p.test(v.lang)); if (v) { voice = v; return; } }
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  let lastSaid = '', curTalk = Promise.resolve(), talkGen = 0;
  // resolves when whatever Beep is saying now is finished (or after max ms)
  G.whenQuiet = (max = 8000) => Promise.race([curTalk, G.wait(max)]);
  G.say = (text, opts = {}) => {
    lastSaid = text;
    return curTalk = new Promise(async resolve => {
      if (!G.save.settings.voice) { setTimeout(resolve, Math.min(4000, 400 + text.length * 45)); return; }
      // recorded neural voice first
      const V = window.VOICE;
      if (V) {
        await Promise.race([V.ready, G.wait(1500)]);
        const plan = V.plan(text, opts.lang);
        const a = plan && G.audio();
        if (a) { try { if (window.speechSynthesis) speechSynthesis.cancel(); await V.play(a, voiceOut(), plan); resolve(); return; } catch (e) { } }
      }
      if (!window.speechSynthesis) { setTimeout(resolve, Math.min(4000, 400 + text.length * 45)); return; }
      speechSynthesis.cancel();
      let spoken = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\bMira\b/g, 'Meera');
      if (V && /^[A-Z]$/.test(spoken.trim())) spoken = V.letterNames[spoken.trim()];
      const u = new SpeechSynthesisUtterance(spoken);
      if (voice) u.voice = voice;
      u.rate = opts.rate || G.save.settings.rate; u.pitch = opts.pitch || 1.15;
      if (opts.lang) { u.lang = opts.lang; const zv = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_', '-').startsWith(opts.lang)); if (zv) u.voice = zv; }
      let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1500 + text.length * 90);
      speechSynthesis.speak(u);
    });
  };
  // words and single letter sounds in one breath: G.sayMix(['Listen:', {snd: 'f'}, 'fin'])
  const soundUrl = l => 'voice/s/' + l + '.mp3';
  G.sayMix = (items) => curTalk = sayMix(items);
  const sayMix = async (items) => {
    items = items.filter(x => x && (typeof x !== 'string' || x.trim()));
    if (!G.save.settings.voice) { await G.wait(500 * items.length); return; }
    const V = window.VOICE, a = V && G.audio();
    if (a) {
      await Promise.race([V.ready, G.wait(1500)]);
      const plan = []; let ok = true;
      for (const it of items) {
        if (typeof it === 'string') { const pl = V.plan(it); if (!pl) { ok = false; break; } pl[pl.length - 1].gap = 0.2; plan.push(...pl); }
        else plan.push({ url: soundUrl(it.snd), gap: 0.35 });
      }
      if (ok && plan.length) { lastSaid = items.filter(x => typeof x === 'string').join(' '); if (window.speechSynthesis) speechSynthesis.cancel(); try { await V.play(a, voiceOut(), plan); return; } catch (e) { } }
    }
    for (const it of items) {
      if (typeof it === 'string') await G.say(it);
      else await new Promise(res => { const au = new Audio(soundUrl(it.snd)); au.onended = res; au.onerror = res; au.play().catch(res); });
    }
  };
  let voiceGain = null;
  const voiceOut = () => { if (!voiceGain) { voiceGain = ac.createGain(); voiceGain.gain.value = 1; voiceGain.connect(ac.destination); } return voiceGain; };
  G.hush = () => { talkGen++; if (window.speechSynthesis) speechSynthesis.cancel(); if (window.VOICE && window.VOICE.stop) window.VOICE.stop(); };

  // ---------- Beep ----------
  let beepHideT = null, beepTaps = 0, beepTapT = null;
  G.beepSvg = (mood = 'happy') => `
  <svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
    <line x1="50" y1="14" x2="50" y2="2" stroke="#8a93b8" stroke-width="4"/>
    <circle cx="50" cy="4" r="6" fill="#ff4f9a"><animate attributeName="fill" values="#ff4f9a;#ffe066;#ff4f9a" dur="1.2s" repeatCount="indefinite"/></circle>
    <rect x="12" y="14" width="76" height="56" rx="24" fill="#e8ecff" stroke="#8a93b8" stroke-width="3"/>
    <rect x="22" y="24" width="56" height="36" rx="16" fill="#1d2150"/>
    <g fill="#6ff0ff"><ellipse cx="38" cy="40" rx="6" ry="8"><animate attributeName="ry" values="8;8;1;8" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="62" cy="40" rx="6" ry="8"><animate attributeName="ry" values="8;8;1;8" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite"/></ellipse></g>
    <path d="${mood === 'wow' ? 'M44 51 Q50 58 56 51 Q50 47 44 51' : 'M40 50 Q50 58 60 50'}" stroke="#6ff0ff" stroke-width="3" fill="${mood === 'wow' ? '#6ff0ff' : 'none'}" stroke-linecap="round"/>
    <circle cx="27" cy="52" r="4" fill="#ff9fce" opacity=".8"/><circle cx="73" cy="52" r="4" fill="#ff9fce" opacity=".8"/>
    <rect x="28" y="72" width="44" height="30" rx="12" fill="#c9d1f5" stroke="#8a93b8" stroke-width="3"/>
    <circle cx="50" cy="86" r="6" fill="#ffd93d"/>
    <rect x="6" y="76" width="16" height="10" rx="5" fill="#c9d1f5" stroke="#8a93b8" stroke-width="2"/>
    <rect x="78" y="76" width="16" height="10" rx="5" fill="#c9d1f5" stroke="#8a93b8" stroke-width="2"/>
    <path d="M36 104 L32 111 L44 111 Z M64 104 L68 111 L56 111 Z" fill="#ff9f43"/>
  </svg>`;
  G.initBeep = () => {
    const bot = G.$('#beep-bot'); bot.innerHTML = G.beepSvg();
    bot.addEventListener('pointerdown', () => {
      G.sfx.boop();
      beepTaps++; clearTimeout(beepTapT); beepTapT = setTimeout(() => beepTaps = 0, 1500);
      if (beepTaps >= 7) { beepTaps = 0; G.beepDance(); return; }
      if (lastSaid) G.beep(lastSaid);
    });
    G.$('#beep-bubble').addEventListener('pointerdown', () => { if (lastSaid) G.say(lastSaid); });
  };
  G.beepDance = () => {
    const b = G.$('#beep'); b.classList.add('dance'); G.confetti(40);
    [523, 659, 784, 659, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'square', 0.12, i * 0.18));
    G.beep(G.pick(['Beep boop! Dance party!', 'I love dancing in space!', 'Wiggle wiggle beep!']));
    setTimeout(() => b.classList.remove('dance'), 3500);
  };
  G.showBeep = (on = true, mini = false) => { const b = G.$('#beep'); b.classList.toggle('hidden', !on); b.classList.toggle('mini', mini); };
  G.beep = (text, opts = {}) => {
    // queue: wait for the current line to finish instead of cutting it off
    if (opts.queue) { const gen = talkGen; return G.whenQuiet(12000).then(() => gen === talkGen ? G.beep(text, Object.assign({}, opts, { queue: false })) : null); }
    const bub = G.$('#beep-bubble');
    bub.textContent = text; bub.classList.add('show');
    clearTimeout(beepHideT);
    const p = G.say(text, opts);
    p.then(() => { beepHideT = setTimeout(() => bub.classList.remove('show'), opts.linger || 3500); });
    return p;
  };
  G.beepQuiet = () => { G.$('#beep-bubble').classList.remove('show'); };

  // ---------- screens ----------
  G.screens = {};
  let cur = null;
  G.go = (name, arg) => {
    G.hush(); G.closeModal();
    if (cur && cur.leave) try { cur.leave(); } catch (e) { console.error(e); }
    const root = G.$('#screen'); root.innerHTML = ''; root.className = '';
    G.$('#fx-layer').innerHTML = '';
    G.beepQuiet();
    cur = G.screens[name];
    G.current = name;
    cur.enter(root, arg);
  };

  // standard top bar: home + star counter + extras
  G.topbar = (root, opts = {}) => {
    const bar = G.html(`<div class="topbar">
      ${opts.back === false ? '' : `<button class="round-btn" data-act="back" title="Back">${opts.backIcon || '🏠'}</button>`}
      ${opts.title ? `<div class="pill">${opts.title}</div>` : ''}
      <div class="spacer"></div>
      ${opts.extra || ''}
      <div class="pill">⭐ <span class="star-count">${G.P() ? G.P().stars : 0}</span></div>
    </div>`);
    const b = bar.querySelector('[data-act=back]');
    if (b) b.onclick = () => { G.sfx.tap(); opts.onBack ? opts.onBack() : G.go('hub'); };
    root.appendChild(bar);
    return bar;
  };

  // ---------- modal ----------
  G.modal = (inner, opts = {}) => {
    G.closeModal();
    const back = G.html(`<div class="modal-back"><div class="modal">${opts.noClose ? '' : '<button class="x">✕</button>'}${inner}</div></div>`);
    G.$('#modal-root').appendChild(back);
    const close = () => { back.remove(); if (opts.onClose) opts.onClose(); };
    const x = back.querySelector('.x'); if (x) x.onclick = () => { G.sfx.tap(); close(); };
    back.addEventListener('pointerdown', e => { if (e.target === back && !opts.noClose) close(); });
    back.close = close;
    return back;
  };
  G.closeModal = () => { G.$$('.modal-back').forEach(m => m.remove()); };

  G.playVideo = (vid, onClose) => {
    const v = typeof vid === 'string' ? G.DATA.videos.find(x => x.id === vid) : vid;
    if (!v) return;
    G.hush(); const wasMusic = musicMood; G.music(null);
    const p = G.P(); if (p) { if (!p.videosSeen[v.id]) { p.videosSeen[v.id] = 1; G.persist(); setTimeout(() => G.addStars(1), 500); } }
    G.modal(`<h2>📺 ${v.title}</h2>
      <div class="video-box"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1&autoplay=1${v.start ? '&start=' + v.start : ''}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      <div class="video-caption">${v.desc || ''}</div>`, { onClose: () => { G.music(wasMusic); if (onClose) onClose(); } });
  };

  // ---------- effects ----------
  G.confetti = (n = 80) => {
    const layer = G.$('#fx-layer');
    const colors = ['#ff4f9a', '#ffd93d', '#4cd97b', '#4d8dff', '#9b6bff', '#ff9f43'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.top = -20 - Math.random() * 100 + 'px';
      c.style.background = G.pick(colors); c.style.animationDuration = 1.8 + Math.random() * 2 + 's';
      layer.appendChild(c); setTimeout(() => c.remove(), 4200);
    }
  };
  G.floatText = (text, x, y) => {
    const e = document.createElement('div'); e.className = 'float-text'; e.textContent = text;
    e.style.left = (x != null ? x : innerWidth / 2) + 'px'; e.style.top = (y != null ? y : innerHeight / 2) + 'px';
    G.$('#fx-layer').appendChild(e); setTimeout(() => e.remove(), 1300);
  };
  G.toast = (text) => {
    const e = document.createElement('div'); e.className = 'toast'; e.textContent = text;
    G.$('#fx-layer').appendChild(e); setTimeout(() => e.remove(), 2700);
  };

  // simple pointer-drag helper: onStart returns false to cancel
  G.draggable = (el, { onStart, onMove, onEnd }) => {
    el.addEventListener('pointerdown', e => {
      if (onStart && onStart(e) === false) return;
      e.preventDefault();
      const move = ev => onMove && onMove(ev);
      const up = ev => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); onEnd && onEnd(ev); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  };

  G.start = () => {
    G.load();
    G.initBeep();
    document.addEventListener('pointerdown', () => G.audio(), { once: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.hush(); });
    G.go('title');
  };
  return G;
})();
