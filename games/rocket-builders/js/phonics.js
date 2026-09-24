// Sounding out words: Beep says a word, then helps her hear each sound and find its letter.
// Words are all spelled the way they sound (short vowels, one letter per sound).
G.PHONICS = (function () {
  const P = {};
  P.words = {
    1: [['fin', '🪶'], ['jet', '✈️'], ['pod', '🫛'], ['tip', '🔺'], ['cap', '🧢'], ['nut', '🔩'], ['pin', '📌'], ['hub', '⚙️'], ['lid', '🥫'], ['sun', '☀️'],
      ['hot', '🔥'], ['dig', '⛏️'], ['cup', '🥤'], ['zap', '⚡'], ['zip', '🤐'], ['hop', '🐸'], ['run', '🏃'], ['big', '🐘'], ['pit', '🕳️'], ['hum', '🎵'],
      ['yum', '😋'], ['red', '🔴'], ['mud', '🟤'], ['bug', '🐞'], ['web', '🕸️'], ['van', '🚐'], ['wet', '💧'], ['map', '🗺️'], ['gas', '⛽'], ['gum', '🍬'],
      ['bed', '🛏️'], ['pig', '🐷'], ['top', '🔝'], ['pup', '🐶'], ['net', '🥅'], ['up', '⬆️'], ['cat', '🐱'], ['hat', '👒']],
    2: [['flag', '🚩'], ['dust', '💨'], ['lamp', '💡'], ['nest', '🪺'], ['gift', '🎁'], ['spin', '🌀'], ['flip', '🤸'], ['bump', '💥'], ['snap', '📸'], ['trip', '🧳'],
      ['sand', '🏖️'], ['pond', '🦆'], ['tent', '⛺'], ['drum', '🥁'], ['frog', '🐸'], ['crab', '🦀'], ['belt', '🥋'], ['hand', '✋'], ['jump', '🦘'], ['grab', '🤏'],
      ['plan', '📝'], ['skip', '⏭️'], ['step', '👣'], ['stop', '🛑'], ['spot', '🔴'], ['swim', '🏊'], ['twin', '👯'], ['wind', '🌬️'], ['tilt', '↪️'], ['milk', '🥛'],
      ['rust', '🟫'], ['glow', null], ['sled', '🛷'], ['slid', '🛝'], ['fast', '💨']].filter(w => w[1]),
    3: [['blast', '🚀'], ['frost', '❄️'], ['crust', '🍞'], ['plant', '🌱'], ['stamp', '📮'], ['twist', '🌪️'], ['clamp', '🗜️'], ['drift', '🍃'], ['print', '🖨️'], ['spend', '💰'],
      ['trust', '🤝'], ['strap', '🎒'], ['split', '✂️'], ['scrub', '🧽'], ['sprint', '🏃']],
  };
  P.all = Object.values(P.words).flat();
  P.pic = w => (P.all.find(x => x[0] === w) || [w, '⭐'])[1];
  // a label for each kind of rocket part, and tools Beep uses to fix new parts on
  P.labels = { engine: 'jet', body: 'gas', fins: 'fin', capsule: 'pod', nose: 'tip', booster: 'blast' };
  P.tools = ['nut', 'pin', 'hub', 'lid', 'cap', 'clamp', 'belt', 'strap'];
  P.launchWords = ['up', 'zip', 'zap', 'jet', 'hop', 'run', 'blast'];
  P.placeWords = {
    sun: 'hot', mercury: 'pit', venus: 'hot', earth: 'pond', moon: 'flag', iss: 'flip', jwst: 'snap', mars: 'dig', ceres: 'bump', jupiter: 'big',
    saturn: 'spin', uranus: 'tilt', neptune: 'wind', pluto: 'frost', voyager: 'hum', blackhole: 'spin', galaxy: 'fast',
    'owl-nebula': 'nest', 'unicorn-comet': 'zip', lunchbox: 'yum', icecream: 'cup', lightcity: 'lamp', 'orange-moon': 'plant', cake: 'gift', 'star-train': 'trip',
  };
  P.alienNames = ['Zib', 'Pip', 'Glim'];
  P.levelOf = w => +Object.keys(P.words).find(k => P.words[k].some(x => x[0] === w)) || 1;
  const lvl = () => G.isLittle() ? 1 : ((G.P() && G.P().level.words) || 1);
  P.labelFor = cat => cat === 'booster' && lvl() < 3 ? 'zap' : P.labels[cat];
  P.toolFor = () => G.pick(P.tools.filter(w => P.levelOf(w) <= lvl()));
  P.launchWord = () => G.pick(P.launchWords.filter(w => P.levelOf(w) <= lvl()));

  const CONFUSE = { b: 'dp', d: 'bp', p: 'bd', m: 'nw', n: 'mh', e: 'ia', i: 'ea', a: 'eu', o: 'au', u: 'oa', f: 'vt', v: 'fw', s: 'zc', z: 'sx', t: 'df', g: 'jk', j: 'gy', c: 'ks', k: 'cg', l: 'it', r: 'wl', w: 'vr', h: 'nk', y: 'jw', x: 'ks' };
  const ABC = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const snd = l => ({ snd: l });

  // play words and letter sounds together: G.PHONICS.speak(['Listen:', {snd:'f'}, 'fin'])
  P.speak = (items) => G.sayMix(items);

  P.chooseKeys = (target, full) => {
    if (full) return ABC;
    const little = G.isLittle(), n = little ? 3 : 4;
    const set = new Set([target]);
    if (!little) for (const c of (CONFUSE[target] || '')) if (set.size < n) set.add(c);
    while (set.size < n) set.add(G.pick(ABC.filter(c => c !== 'q' && c !== 'x' && !(CONFUSE[target] || '').includes(c) || !little)));
    return G.shuffle([...set]);
  };

  // the modal: returns a promise of how many wrong taps there were
  P.run = (opts) => new Promise(resolve => {
    const p = G.P();
    const little = G.isLittle();
    const word = opts.word.toLowerCase(), letters = word.split('');
    const pic = opts.pic || P.pic(word);
    const full = !little && (p.flags.phonicsFull || (p.flags.phonicsDone || 0) >= 20);
    let pos = 0, mistakes = 0, wrongHere = 0, busy = false;
    const m = G.modal(`<div class="phonics">
      <div class="ph-top"><div class="ph-pic">${pic}</div><div class="ph-intro">${opts.intro || 'Sound it out!'}</div></div>
      <div class="ph-btns"><button class="big-btn small blue" data-a="hear">🔊 Hear the word</button><button class="big-btn small" data-a="slow">🐢 Sound it out</button></div>
      <div class="slots ph-slots">${letters.map((l, i) => `<button class="slot ph-slot${i === 0 ? ' next' : ''}" data-i="${i}">${little && i > 0 ? l : ''}</button>`).join('')}</div>
      <div class="ph-keys${full ? ' full' : ''}"></div></div>`, { noClose: !opts.canClose, onClose: () => resolve(mistakes) });
    const slots = m.querySelectorAll('.ph-slot'), keysEl = m.querySelector('.ph-keys');
    if (little) slots.forEach((s, i) => { if (i > 0) s.classList.add('ghost'); });

    const L = l => l.toUpperCase();
    const renderKeys = () => {
      const keys = P.chooseKeys(letters[pos], full);
      keysEl.innerHTML = keys.map(k => `<button class="tile ph-key" data-k="${k}">${little ? k.toUpperCase() : k}</button>`).join('');
      keysEl.querySelectorAll('.ph-key').forEach(b => b.onclick = () => press(b.dataset.k, b));
    };
    const glowRight = () => keysEl.querySelectorAll('.ph-key').forEach(b => b.classList.toggle('hint', b.dataset.k === letters[pos]));

    const askSound = () => P.speak(little
      ? [`What sound does ${word} start with?`, snd(letters[0]), `Which letter says`, snd(letters[0])]
      : [pos === 0 ? `What's the first sound in ${word}?` : pos === letters.length - 1 ? "What's the last sound?" : "What's the next sound?", snd(letters[pos])]);
    const slow = async () => { for (let i = 0; i < letters.length; i++) { slots[i].classList.add('sounding'); await P.speak([snd(letters[i])]); await G.wait(150); slots[i].classList.remove('sounding'); } await P.speak([word]); };

    m.querySelector('[data-a=hear]').onclick = () => { G.sfx.tap(); P.speak([word]); };
    m.querySelector('[data-a=slow]').onclick = () => { G.sfx.tap(); slow(); };
    slots.forEach((s, i) => s.onclick = () => { G.sfx.tap(); if (i <= pos || little) P.speak([snd(letters[i])]); });

    const finish = async () => {
      keysEl.innerHTML = '';
      G.sfx.great(); G.confetti(50);
      await G.wait(300);
      if (little) await P.speak([`Yes!`, `${word} starts with`, snd(letters[0]), word]);
      else {
        for (let i = 0; i < letters.length; i++) { slots[i].classList.add('sounding'); await P.speak([snd(letters[i])]); slots[i].classList.remove('sounding'); }
        await P.speak([word, G.pick([`You spelled ${word}!`, `${word}! You did it!`, `You sounded it out!`])]);
      }
      p.words = p.words || {}; p.words[word] = (p.words[word] || 0) + 1;
      p.flags.phonicsDone = (p.flags.phonicsDone || 0) + 1;
      if (mistakes === 0) G.addStars(1);
      G.persist();
      m.close();
    };

    const press = async (k, btn) => {
      if (busy) return;
      busy = true;
      const want = letters[pos];
      if (k === want) {
        slots[pos].textContent = little ? L(k) : k; slots[pos].classList.add('filled'); slots[pos].classList.remove('next', 'ghost');
        G.sfx.snap();
        pos++; wrongHere = 0;
        if (little || pos >= letters.length) { await P.speak([snd(k)]); busy = false; finish(); return; }
        slots[pos].classList.add('next');
        renderKeys();
        await P.speak([snd(k), `Yes! That's ${L(k)}.`]);
        busy = false;
        askSound();
      } else {
        mistakes++; wrongHere++;
        if (btn) { btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong'); }
        G.sfx.oops();
        const sameSound = (k === 'c' && want === 'k') || (k === 'k' && want === 'c');
        if (sameSound) await P.speak([`${L(k)} makes that sound too! But ${word} uses ${L(want)}.`]);
        else await P.speak([`That's ${L(k)}. It says`, snd(k), `We need`, snd(want)]);
        if (wrongHere >= 2) { glowRight(); P.speak(['Look for the glowing letter!']); }
        busy = false;
      }
    };
    const onKey = e => { if (!m.isConnected) { window.removeEventListener('keydown', onKey); return; } const k = e.key && e.key.toLowerCase(); if (/^[a-z]$/.test(k) && (full || keysEl.querySelector(`[data-k="${k}"]`))) press(k, keysEl.querySelector(`[data-k="${k}"]`)); };
    window.addEventListener('keydown', onKey);
    renderKeys();
    (async () => {
      await P.speak(opts.lines || [opts.intro || '', word]);
      if (!little && !p.flags.phonicsIntro) { p.flags.phonicsIntro = 1; await P.speak(['Listen to each sound, and tap the letter that makes it. Tap the turtle to hear the word slowly.']); }
      askSound();
    })();
  });

  // words for the spelling station, by level
  P.forLevel = (lv) => G.pick(P.words[G.clamp(lv, 1, 3)]);
  return P;
})();
