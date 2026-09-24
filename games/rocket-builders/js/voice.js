// Beep's voice: pre-recorded neural-voice clips (see tools/build-voice.mjs).
// A line is looked up whole, then sentence by sentence, then split around the
// parts that change (numbers, names, letters) and played piece by piece.
// Anything without a recording falls back to the browser's own voice.
(function (root) {
  const V = {};
  const ZH = { 'nǐ hǎo': '你好', 'xièxie': '谢谢' };
  V.letterNames = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee' };

  V.norm = s => s.normalize('NFC').toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').replace(/^[' ]+|[' ]+$/g, '').trim();
  V.hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };

  // turn math symbols into words before anything else
  V.words = s => s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/\s*=\s*\?/g, ' equals what?').replace(/\s\+\s/g, ' plus ').replace(/\s[−-]\s/g, ' minus ').replace(/\s=\s/g, ' equals ')
    .replace(/,\s*\?\s*$/, ', what comes next?').replace(/\s+/g, ' ').trim();

  V.sentences = s => s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);

  let varRe = null, zhMap = {};
  V.setVars = (names, zh) => {
    zhMap = Object.assign({}, ZH, zh || {});
    const all = [...new Set(names.concat(Object.keys(zhMap)).filter(Boolean))].sort((a, b) => b.length - a.length);
    const esc = all.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    varRe = new RegExp(`(\\d+s(?![\\p{L}\\d])|\\d+|\\b[A-Z](?=[,.!?]|$)|(?<![\\p{L}])(?:${esc.join('|')})(?![\\p{L}]))`, 'giu');
  };
  // pieces of one sentence: [{id, text, voice}]
  V.split = (sentence) => {
    const out = [];
    let last = 0;
    const lit = t => { const k = V.norm(t); if (/\p{L}/u.test(k)) out.push({ id: k, text: t.trim(), voice: 'en' }); };
    for (const m of sentence.matchAll(varRe)) {
      const tok = m[0];
      if (tok.length === 1 && tok !== tok.toUpperCase()) continue;
      if (m.index > last) lit(sentence.slice(last, m.index));
      if (/^\d+s$/.test(tok)) out.push({ id: 'n:' + tok, text: tok, voice: 'en', num: true });
      else if (/^\d+$/.test(tok)) out.push({ id: 'n:' + tok, text: tok, voice: 'en', num: true });
      else if (/^[A-Z]$/.test(tok)) out.push({ id: 'l:' + tok, text: tok, voice: 'en', letter: true });
      else {
        const zh = zhMap[tok.toLowerCase()] || zhMap[tok];
        if (zh) out.push({ id: 'z:' + zh, text: zh, voice: 'zh' });
        else out.push({ id: V.norm(tok), text: tok, voice: 'en' });
      }
      last = m.index + tok.length;
    }
    if (last < sentence.length) lit(sentence.slice(last));
    return out;
  };
  V.hasZh = s => Object.keys(zhMap).some(k => s.toLowerCase().includes(k.toLowerCase()));

  // ---------- browser playback ----------
  if (typeof window === 'undefined') { root.VOICE = V; return; }
  let have = null, base = 'voice/';
  const cache = new Map();
  V.ready = fetch(base + 'index.json').then(r => r.json()).then(ix => { have = new Set(ix.clips); V.setVars(ix.vars, ix.zh); }).catch(() => { have = null; });
  V.misses = [];
  const clipFor = (id) => have && have.has(V.hash(id)) ? base + 'c/' + V.hash(id) + '.mp3' : null;
  // choose the clips for a whole line, or null if some piece has no recording
  V.plan = (text, lang) => {
    if (!have) return null;
    if (lang && lang.startsWith('zh')) { const u = clipFor('z:' + text.trim()); return u ? [{ url: u, gap: 0 }] : null; }
    const w = V.words(text);
    const whole = !V.hasZh(w) && clipFor(V.norm(w));
    if (whole) return [{ url: whole, gap: 0 }];
    const plan = [];
    for (const s of V.sentences(w)) {
      const u = !V.hasZh(s) && clipFor(V.norm(s));
      if (u) { plan.push({ url: u, gap: 0.22 }); continue; }
      const parts = V.split(s);
      for (const p of parts) {
        const pu = clipFor(p.id);
        if (!pu) { V.misses.push(p.id + '  <=  ' + text); return null; }
        plan.push({ url: pu, gap: 0.04 });
      }
      if (plan.length) plan[plan.length - 1].gap = 0.22;
    }
    return plan.length ? plan : null;
  };
  const load = (ac, url) => {
    if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.arrayBuffer()).then(b => ac.decodeAudioData(b)).catch(() => null));
    if (cache.size > 400) cache.delete(cache.keys().next().value);
    return cache.get(url);
  };
  let playing = [], token = 0;
  V.stop = () => { token++; playing.forEach(s => { try { s.stop(); } catch (e) { } }); playing = []; };
  // plays a plan through the Web Audio context; resolves when done
  V.play = async (ac, dest, plan) => {
    V.stop();
    const my = token;
    const bufs = await Promise.all(plan.map(p => load(ac, p.url)));
    if (my !== token) return;
    if (bufs.some(b => !b)) throw new Error('clip failed');
    let t = ac.currentTime + 0.02;
    const srcs = bufs.map((b, i) => { const s = ac.createBufferSource(); s.buffer = b; s.connect(dest); s.start(t); t += b.duration + plan[i].gap; return s; });
    playing = srcs;
    await new Promise(res => { srcs[srcs.length - 1].onended = res; setTimeout(res, (t - ac.currentTime) * 1000 + 300); });
  };
  root.VOICE = V;
})(typeof window !== 'undefined' ? window : globalThis);
