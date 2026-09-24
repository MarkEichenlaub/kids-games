// Challenges: math (Beast Academy levels 1-2), fuel filling, spelling, mazes, dot-to-dot, jigsaws, shapes and patterns.
G.ch = (function () {
  const C = {};
  const R = G.rand, pick = G.pick, shuffle = G.shuffle;

  const THINGS = [['🚀', 'rockets'], ['⭐', 'stars'], ['🌙', 'moons'], ['👽', 'aliens'], ['🪐', 'planets'], ['🦄', 'unicorns'], ['🦉', 'owls'], ['🍊', 'oranges'], ['☄️', 'comets'], ['🛸', 'flying saucers'], ['🐵', 'monkeys'], ['🌸', 'flowers'], ['🍦', 'ice creams'], ['🤖', 'robots']];
  const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Yes!', 'Super!', 'That\'s right!', 'Rocket smart!', 'Wow, nice!', 'Perfect!', 'Beep boop, correct!'];
  const RETRY = ['Try again!', 'Hmm, not that one.', 'Almost! Try another one.', 'Oops! Try again.'];
  C.praise = () => pick(PRAISE);

  // ---------- visual helpers ----------
  C.objs = (n, e, faded = 0) => `<div class="grp">${Array.from({ length: n }, (_, i) => `<span style="${i >= n - faded ? 'opacity:.25;filter:grayscale(1)' : ''}">${e}</span>`).join('')}</div>`;
  C.tenframe = (a, b = 0, cells = 10) => { let s = ''; for (let f = 0; f < cells / 10; f++) { s += '<div class="tenframe">'; for (let i = 0; i < 10; i++) { const k = f * 10 + i; s += `<i class="${k < a ? 'on' : k < a + b ? 'on b' : ''}"></i>`; } s += '</div>'; } return `<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${s}</div>`; };
  C.bundles = (tens, ones, hundreds = 0) => `<div style="display:flex;align-items:flex-end;flex-wrap:wrap;justify-content:center;max-width:600px">${Array.from({ length: hundreds }, () => `<span class="flat">${'<i></i>'.repeat(100)}</span>`).join('')}${Array.from({ length: tens }, () => `<span class="bundle">${'<i></i>'.repeat(10)}</span>`).join('')}${'<span class="stick"></span>'.repeat(ones)}</div>`;
  const bigNum = (s) => `<div style="font-size:1.2em;font-weight:700;letter-spacing:4px">${s}</div>`;

  function numChoices(ans, count = 3, lo = 0, hi = null) {
    hi = hi == null ? ans + 6 : hi;
    const set = new Set([ans]);
    const spread = ans < 10 ? 3 : ans < 30 ? 5 : 12;
    let guard = 0;
    while (set.size < count && guard++ < 200) {
      let v = ans + R(-spread, spread);
      if (guard > 100) v = R(lo, Math.max(lo + count, hi));
      if (v >= lo && v <= Math.max(hi, ans + spread) && v !== ans) set.add(v);
    }
    return shuffle([...set]);
  }

  // ---------- math question generator ----------
  C.mathQ = (level) => {
    const nc = level <= 0 ? 3 : 4;
    if (level > 1 && Math.random() < 0.25) level = R(Math.max(1, level - 2), level - 1);
    const [e, name] = pick(THINGS);
    const gens = {
      0: [
        () => { const n = R(1, 5); return { prompt: `How many ${name}?`, visual: C.objs(n, e), choices: numChoices(n, 3, 1, 6), answer: n, hint: 'Touch each one and count!' }; },
        () => { const n = R(1, 5); return { prompt: `Find the number ${n}!`, visual: '🔎', choices: numChoices(n, 3, 1, 6), answer: n }; },
        () => { const a = R(1, 3), b = a + R(1, 3); const [e2] = pick(THINGS.filter(t => t[0] !== e)); const flip = Math.random() < .5; return { prompt: 'Which has more?', visual: flip ? C.objs(b, e) + C.objs(a, e2) : C.objs(a, e2) + C.objs(b, e), choices: shuffle([e, e2]), answer: e }; },
      ],
      1: [
        () => { const n = R(5, 10); return { prompt: `How many ${name}?`, visual: C.objs(n, e), choices: numChoices(n, nc, 1), answer: n, hint: 'Count them one at a time.' }; },
        () => { const n = R(2, 8); return { prompt: `${n} ${name}. One more comes! How many now?`, visual: C.objs(n, e) + '<span class="op">+</span>' + C.objs(1, e), choices: numChoices(n + 1, nc, 1), answer: n + 1 }; },
        () => { const a = R(1, 4), b = R(1, 5 - a > 0 ? 5 - a : 1); return { prompt: `${a} + ${b} = ?`, visual: C.objs(a, e) + '<span class="op">+</span>' + C.objs(b, e), choices: numChoices(a + b, nc, 0), answer: a + b }; },
        () => { const a = R(1, 10); let b = R(1, 10); while (b === a) b = R(1, 10); return { prompt: 'Which number is bigger?', visual: '⚖️', choices: [a, b], answer: Math.max(a, b) }; },
        () => { const n = R(3, 9); return { prompt: `${n} ${name}. One flies away! How many are left?`, visual: C.objs(n, e, 1), choices: numChoices(n - 1, nc, 0), answer: n - 1 }; },
      ],
      2: [
        () => { const a = R(2, 6), b = R(1, 10 - a); return { prompt: `${a} + ${b} = ?`, visual: C.tenframe(a, b), choices: numChoices(a + b, nc, 0), answer: a + b }; },
        () => { const a = R(4, 10), b = R(1, a - 1); return { prompt: `${a} ${name}. ${b} fly away. How many are left?`, visual: C.objs(a, e, b), choices: numChoices(a - b, nc, 0), answer: a - b, hint: 'Count the ones that are still bright.' }; },
        () => { const a = R(2, 9); return { prompt: `${a} + ? = 10`, say: `${a} plus what makes 10?`, visual: C.tenframe(a), choices: numChoices(10 - a, nc, 0, 10), answer: 10 - a, hint: 'Count the empty boxes!' }; },
        () => { const a = R(3, 10), b = R(1, a); return { prompt: `${a} − ${b} = ?`, say: `${a} minus ${b}`, visual: C.objs(a, e, b), choices: numChoices(a - b, nc, 0), answer: a - b }; },
      ],
      3: [
        () => { const a = R(6, 9), b = R(3, 9); return { prompt: `${a} + ${b} = ?`, say: `${a} plus ${b}`, visual: C.tenframe(a, b, 20), choices: numChoices(a + b, nc, 0), answer: a + b, hint: 'Fill up the first ten, then count what\'s left!' }; },
        () => { const a = R(2, 9); return { prompt: `${a} + ${a} = ?`, say: `Double ${a}! ${a} plus ${a}`, visual: C.objs(a, e) + '<span class="op">+</span>' + C.objs(a, e), choices: numChoices(2 * a, nc, 0), answer: 2 * a }; },
        () => { const a = R(3, 9), t = R(11, 18); return { prompt: `${a} + ? = ${t}`, say: `${a} plus what makes ${t}?`, visual: C.tenframe(a, 0, 20), choices: numChoices(t - a, nc, 0), answer: t - a }; },
        () => { const step = pick([2, 5, 10]), s = step * R(0, 3); const seq = [0, 1, 2, 3].map(i => s + step * i); return { prompt: `${seq.join(', ')}, ?`, say: `Skip count by ${step}s! ${seq.join(', ')}, what comes next?`, visual: '🦘', choices: numChoices(s + step * 4, nc, 0), answer: s + step * 4 }; },
      ],
      4: [
        () => { const t = R(1, 6), o = R(0, 9); return { prompt: 'How many sticks?', say: 'Each bundle has ten sticks. How many sticks in all?', visual: C.bundles(t, o), choices: shuffle([10 * t + o, 10 * o + t, 10 * t + o + (o < 9 ? 1 : -1), 10 * (t + 1) + o].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4).concat().sort(() => .5 - Math.random()), answer: 10 * t + o }; },
        () => { const a = 10 * R(1, 6), b = 10 * R(1, 3); return { prompt: `${a} + ${b} = ?`, visual: C.bundles((a + b) / 10, 0), choices: numChoices(a + b, nc, 0).map(v => Math.round(v / 10) * 10).filter((v, i, arr) => arr.indexOf(v) === i).concat([a + b]).filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4), answer: a + b }; },
        () => { const a = R(11, 18), b = R(3, 9); return { prompt: `${a} − ${b} = ?`, say: `${a} minus ${b}`, visual: C.tenframe(a, 0, 20), choices: numChoices(a - b, nc, 0), answer: a - b }; },
        () => { const n = R(2, 14); return { prompt: `Is ${n} odd or even?`, visual: C.objs(n, '🧦'), choices: ['odd', 'even'], answer: n % 2 ? 'odd' : 'even', hint: 'Can every sock find a partner?' }; },
        () => { const a = R(21, 99); let b = R(21, 99); while (b === a) b = R(21, 99); return { prompt: 'Which number is bigger?', visual: '⚖️', choices: [a, b], answer: Math.max(a, b), hint: 'Look at the tens first!' }; },
      ],
      5: [
        () => { const a = R(12, 38), b = R(3, 9); return { prompt: `${a} + ${b} = ?`, say: `${a} plus ${b}`, visual: C.bundles(Math.floor(a / 10), a % 10), choices: numChoices(a + b, nc, 0), answer: a + b }; },
        () => { const a = R(12, 59), b = 10 * R(1, 4), sub = Math.random() < .4 && a > b; return { prompt: `${a} ${sub ? '−' : '+'} ${b} = ?`, say: `${a} ${sub ? 'minus' : 'plus'} ${b}`, visual: '🧮', choices: numChoices(sub ? a - b : a + b, nc, 0), answer: sub ? a - b : a + b, hint: 'Only the tens change!' }; },
        () => { const k = R(2, 5), tri = n => n * (n + 1) / 2; const seq = [1, 2, 3, 4, 5, 6].slice(0, k + 1).map(tri); return { prompt: `${seq.join(', ')}, ?`, say: `Triangle numbers! Like stacking oranges. ${seq.join(', ')}, what comes next?`, visual: '🍊🍊🍊', choices: numChoices(tri(k + 2), nc, 0), answer: tri(k + 2), hint: `Add ${k + 2} more oranges for the next row!` }; },
        () => { const a = R(8, 16), b = R(2, a - 3); const t = pick([[`The rocket has ${a} windows. ${b} are open. How many are closed?`, a - b], [`${a} astronauts are on the station. ${b} more come. How many now?`, a + b], [`Beep has ${a} bolts. It uses ${b}. How many are left?`, a - b]]); return { prompt: t[0], visual: '🤔', choices: numChoices(t[1], nc, 0), answer: t[1] }; },
        () => { const step = pick([3, 4, 5, 10]), s = step * R(1, 4); const seq = [0, 1, 2, 3].map(i => s + step * i); return { prompt: `${seq.join(', ')}, ?`, visual: '🦘', choices: numChoices(s + step * 4, nc, 0), answer: s + step * 4 }; },
      ],
      6: [
        () => { const a = 10 * R(1, 5) + R(0, 4), b = 10 * R(1, 3) + R(0, 5); return { prompt: `${a} + ${b} = ?`, say: `${a} plus ${b}`, visual: '🧮', choices: numChoices(a + b, nc, 0), answer: a + b, hint: 'Add the tens, then add the ones.' }; },
        () => { const h = R(1, 3), t = R(0, 9), o = R(0, 9); return { prompt: 'How many blocks?', say: 'Each flat has one hundred. Each bar has ten.', visual: C.bundles(t, o, h), choices: shuffle([100 * h + 10 * t + o, 100 * h + 10 * o + t, 100 * t + 10 * h + o, 100 * h + 10 * t + o + 10].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4), answer: 100 * h + 10 * t + o }; },
        () => { const a = R(20, 89), m = pick([10, 100]); return { prompt: `What is ${m} more than ${a}?`, visual: '➕', choices: numChoices(a + m, nc, 0).concat([a + m]).filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4), answer: a + m }; },
        () => { const a = R(30, 99), b = R(11, a - 10); const ones = (a % 10) >= (b % 10); if (!ones) return C.mathQ(5); return { prompt: `${a} − ${b} = ?`, say: `${a} minus ${b}`, visual: '🧮', choices: numChoices(a - b, nc, 0), answer: a - b }; },
      ],
    };
    const lv = G.clamp(level, 0, 6);
    const q = pick(gens[lv])();
    if (!q.choices.includes(q.answer)) q.choices = shuffle(q.choices.slice(0, q.choices.length - 1).concat([q.answer]));
    return q;
  };

  // ---------- ask a multiple-choice question in a card ----------
  // q: {prompt, say, visual, choices: [value | {html, v}], answer, hint}
  C.ask = (host, q) => new Promise(resolve => {
    let mistakes = 0;
    host.innerHTML = `
      <div class="ch-prompt"><button class="say-btn">🔊</button><span>${q.prompt}</span></div>
      <div class="ch-visual">${q.visual || ''}</div>
      <div class="choices">${q.choices.map((c, i) => `<button class="choice" data-i="${i}">${typeof c === 'object' ? c.html : c}</button>`).join('')}</div>`;
    const speak = () => G.beep(q.say || q.prompt.replace('−', 'minus').replace('?', ''));
    host.querySelector('.say-btn').onclick = speak; speak();
    const val = c => typeof c === 'object' ? c.v : c;
    host.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      const c = q.choices[+b.dataset.i];
      if (val(c) === q.answer) {
        b.classList.add('right'); G.sfx.good();
        host.querySelectorAll('.choice').forEach(x => x.style.pointerEvents = 'none');
        const r = b.getBoundingClientRect();
        if (mistakes === 0) G.addStars(1, r.left + r.width / 2, r.top);
        G.beep(q.after || C.praise());
        setTimeout(() => resolve(mistakes), 1300);
      } else {
        mistakes++; b.classList.add('wrong'); G.sfx.oops();
        G.beep(mistakes >= 2 && q.hint ? q.hint : pick(RETRY));
      }
    });
  });

  // ---------- fuel filling ----------
  C.fuelTask = (level) => {
    if (level <= 0) { const n = R(1, 5); return { prompt: `Put in ${n} drops of fuel!`, cap: 10, pre: 0, target: n, count: true }; }
    if (level === 1) { const n = R(4, 10); return { prompt: `Put in ${n} drops of fuel!`, cap: 10, pre: 0, target: n, count: true }; }
    if (level === 2) { const k = R(2, 8); return { prompt: `The tank has ${k}. Fill it up to 10!`, cap: 10, pre: k, target: 10, follow: { prompt: `${k} + ? = 10`, answer: 10 - k } }; }
    if (level === 3) {
      if (Math.random() < .5) { const k = R(11, 18); return { prompt: `The tank has ${k}. Fill it up to 20!`, cap: 20, pre: k, target: 20, follow: { prompt: `${k} + ? = 20`, answer: 20 - k } }; }
      const a = R(5, 9), t = R(11, 17); return { prompt: `The tank has ${a}. Fill it to ${t}!`, cap: 20, pre: a, target: t, follow: { prompt: `${a} + ? = ${t}`, answer: t - a } };
    }
    if (level === 4) { const t = R(21, 59); return { prompt: `Fill the big tank with ${t} fuel!`, pv: true, pre: 0, target: t, follow: { prompt: `How many tens are in ${t}?`, answer: Math.floor(t / 10) } }; }
    const a = 10 * R(1, 4) + R(0, 5), t = a + R(12, 35);
    return { prompt: `The tank has ${a}. Fill it to ${t}!`, pv: true, pre: a, target: t, follow: { prompt: `${a} + ? = ${t}`, answer: t - a } };
  };
  C.fuel = (host, task) => new Promise(resolve => {
    let n = task.pre, added = 0, mistakes = 0, done = false;
    const numWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    host.innerHTML = `
      <div class="ch-prompt"><button class="say-btn">🔊</button><span>${task.prompt}</span></div>
      <div class="ch-visual" id="tankv"></div>
      <div style="font-size:30px;font-weight:700" id="tankn"></div>
      <div class="choices">
        ${task.pv ? '<button class="choice" data-a="10" style="font-size:30px">🛢️ +10</button>' : ''}
        <button class="choice" data-a="1" style="font-size:30px">💧 +1</button>
        <button class="choice" data-a="-1" style="font-size:30px">↩️</button>
      </div>`;
    const draw = () => {
      const v = G.$('#tankv', host);
      if (task.pv) {
        const preT = Math.floor(task.pre / 10), preO = task.pre % 10;
        const t = Math.floor(n / 10), o = n % 10;
        v.innerHTML = `<div style="display:flex;align-items:flex-end;flex-wrap:wrap;justify-content:center;max-width:640px">${Array.from({ length: t }, (_, i) => `<span class="bundle" style="${i < preT ? 'opacity:.55' : ''}">${'<i></i>'.repeat(10)}</span>`).join('')}${Array.from({ length: o }, () => '<span class="stick"></span>').join('')}</div>`;
      } else {
        v.innerHTML = C.tenframe(task.pre, n - task.pre, task.cap);
      }
      G.$('#tankn', host).textContent = task.pv || !task.count ? `${n}` : '';
    };
    const speak = () => G.beep(task.prompt);
    host.querySelector('.say-btn').onclick = speak; speak(); draw();
    host.querySelectorAll('.choice').forEach(b => b.onclick = () => {
      if (done) return;
      const a = +b.dataset.a;
      if (a < 0) { if (n > task.pre) { n--; added--; G.sfx.tap(); } }
      else { n += a; added += a; G.sfx.pop(); }
      if (!task.pv && n > task.cap) { n = task.cap; added = n - task.pre; }
      draw();
      if (task.count && a > 0) G.say(numWords[n] || String(n), { rate: 1.1 });
      if (n === task.target) {
        done = true; G.sfx.great();
        setTimeout(async () => {
          if (task.follow) {
            await G.wait(300);
            const q = { prompt: task.follow.prompt, visual: G.$('#tankv', host).innerHTML, choices: numChoices(task.follow.answer, 4, 0), answer: task.follow.answer };
            mistakes += await C.ask(host, q);
          } else { G.addStars(1); await G.beep(`${task.target}! The tank is ready!`); }
          resolve(mistakes);
        }, 700);
      } else if (n > task.target) {
        mistakes++; G.sfx.oops(); G.beep('Oops, that\'s too much! Tap the arrow to take some out.');
      }
    });
  });

  // ---------- spelling ----------
  const LETTER_WORD = { M: 'Moon', A: 'Alien', I: 'Ice cream', R: 'Rocket', S: 'Star', O: 'Owl', B: 'Beep', T: 'Train', E: 'Earth', C: 'Comet', U: 'Unicorn', P: 'Planet', J: 'Jupiter', N: 'Neptune', D: 'Duck', L: 'Lion', G: 'George', H: 'Heart', F: 'Fish', K: 'Kite' };
  C.letterQ = () => {
    const kidL = G.kidName()[0].toUpperCase();
    const letters = Object.keys(LETTER_WORD);
    const t = Math.random() < .3 ? kidL : pick(letters);
    const others = shuffle(letters.filter(l => l !== t)).slice(0, 2);
    return { prompt: `Find the letter ${t}!`, visual: `<div class="word-pic">${t}</div>`, choices: shuffle([t, ...others]), answer: t, after: `${t}! ${t} is for ${LETTER_WORD[t]}${t === kidL ? ' and ' + G.kidName() : ''}!` };
  };
  C.spell = (host, level) => new Promise(resolve => {
    const pool = G.DATA.words[G.clamp(level, 1, 3)];
    const [word, pic] = pick(pool);
    const extra = level >= 2 ? shuffle('ABCDEFGHIJKLMNOPRSTUVWY'.split('').filter(l => !word.includes(l))).slice(0, level >= 3 ? 2 : 1) : [];
    let tiles = shuffle(word.split('').concat(extra));
    for (let k = 0; k < 10 && tiles.join('').startsWith(word); k++) tiles = shuffle(tiles);
    let pos = 0, mistakes = 0, wrongHere = 0;
    const ghost = i => level <= 1 || (level === 2 && i === 0);
    host.innerHTML = `
      <div class="ch-prompt"><button class="say-btn">🔊</button><span>Spell it!</span></div>
      <div class="word-pic">${pic}</div>
      <div class="slots">${word.split('').map((l, i) => `<div class="slot${i === 0 ? ' next' : ''}">${ghost(i) ? l : ''}</div>`).join('')}</div>
      <div class="tiles">${tiles.map((l, i) => `<button class="tile" data-i="${i}">${l}</button>`).join('')}</div>`;
    const lw = word.toLowerCase();
    const speak = () => G.beep(`Spell ${lw}!`);
    host.querySelector('.say-btn').onclick = speak; speak();
    const slots = host.querySelectorAll('.slot');
    host.querySelectorAll('.tile').forEach(t => t.onclick = () => {
      const l = tiles[+t.dataset.i];
      if (l === word[pos]) {
        slots[pos].textContent = l; slots[pos].classList.add('filled'); slots[pos].classList.remove('next');
        t.classList.add('gone'); G.sfx.snap(); G.say(l.toLowerCase() === 'a' ? 'ay' : l, { rate: 1.05 });
        pos++; wrongHere = 0;
        host.querySelectorAll('.tile').forEach(x => x.style.boxShadow = '');
        if (pos < word.length) slots[pos].classList.add('next');
        else {
          G.sfx.great();
          if (mistakes === 0) G.addStars(1);
          setTimeout(() => { G.beep(`${word.split('').join(', ')}. That spells ${lw}!`).then(() => resolve(mistakes)); }, 400);
        }
      } else {
        mistakes++; wrongHere++; t.classList.remove('wrong'); void t.offsetWidth; t.classList.add('wrong'); G.sfx.oops();
        if (wrongHere >= 2) {
          G.beep(`We need the letter ${word[pos]}.`);
          host.querySelectorAll('.tile').forEach(x => { if (!x.classList.contains('gone') && tiles[+x.dataset.i] === word[pos]) x.style.boxShadow = '0 0 0 6px #ff4f9a, 0 0 24px #ff4f9a'; });
        } else G.beep(pick(['Not that one. Listen: ' + lw + '.', 'Hmm. What comes next in ' + lw + '?']));
      }
    });
  });

  // ---------- maze ----------
  function genMaze(w, h) {
    const cells = Array.from({ length: h }, () => Array.from({ length: w }, () => ({ n: 1, e: 1, s: 1, w: 1, v: 0 })));
    const stack = [[0, 0]]; cells[0][0].v = 1;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const nb = [[0, -1, 'n', 's'], [1, 0, 'e', 'w'], [0, 1, 's', 'n'], [-1, 0, 'w', 'e']].filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < w && ny < h && !cells[ny][nx].v; });
      if (!nb.length) { stack.pop(); continue; }
      const [dx, dy, a, b] = pick(nb);
      cells[y][x][a] = 0; cells[y + dy][x + dx][b] = 0; cells[y + dy][x + dx].v = 1; stack.push([x + dx, y + dy]);
    }
    return cells;
  }
  C.maze = (host, level) => new Promise(resolve => {
    const sizes = [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 7], [9, 8]];
    const [w, h] = sizes[G.clamp(level + (G.isLittle() ? 0 : 1), 0, 6)];
    const cells = genMaze(w, h);
    const goal = [w - 1, h - 1];
    const player = [0, 0];
    const bonus = []; for (let i = 0; i < Math.floor(w * h / 8); i++) { const b = [R(0, w - 1), R(0, h - 1)]; if ((b[0] || b[1]) && !(b[0] === goal[0] && b[1] === goal[1])) bonus.push(b); }
    const hero = pick(['🚙', '🛸', '🤖']), prize = pick(['🎁', '🔧', '⚙️']);
    host.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>Drive to the ${prize}!</span></div>
      <div class="ch-canvas-wrap"><canvas></canvas>
      <div class="dpad"><span></span><button data-d="0,-1">⬆️</button><span></span><button data-d="-1,0">⬅️</button><span></span><button data-d="1,0">➡️</button><span></span><button data-d="0,1">⬇️</button><span></span></div></div>`;
    const wrap = host.querySelector('.ch-canvas-wrap'), cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    const speak = () => G.beep(`Help the rover drive through the maze to the ${prize === '🎁' ? 'present' : 'part'}! Drag it with your finger.`);
    host.querySelector('.say-btn').onclick = speak; speak();
    let cs = 60, done = false; const dpr = window.devicePixelRatio || 1;
    const layout = () => {
      const r = wrap.getBoundingClientRect();
      cs = Math.floor(Math.min((r.width - 20) / w, (r.height - 10) / h, 100));
      cv.width = w * cs * dpr; cv.height = h * cs * dpr; cv.style.width = w * cs + 'px'; cv.style.height = h * cs + 'px';
      draw();
    };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#eaf6ff'; ctx.fillRect(0, 0, w * cs, h * cs);
      ctx.strokeStyle = '#3f78ff'; ctx.lineWidth = Math.max(4, cs / 9); ctx.lineCap = 'round';
      ctx.beginPath();
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const c = cells[y][x], X = x * cs, Y = y * cs;
        if (c.n) { ctx.moveTo(X, Y); ctx.lineTo(X + cs, Y); }
        if (c.w) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + cs); }
        if (y === h - 1 && c.s) { ctx.moveTo(X, Y + cs); ctx.lineTo(X + cs, Y + cs); }
        if (x === w - 1 && c.e) { ctx.moveTo(X + cs, Y); ctx.lineTo(X + cs, Y + cs); }
      }
      ctx.stroke();
      ctx.font = `${cs * 0.6}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      bonus.forEach(b => ctx.fillText('⭐', b[0] * cs + cs / 2, b[1] * cs + cs / 2 + 2));
      ctx.fillText(prize, goal[0] * cs + cs / 2, goal[1] * cs + cs / 2 + 2);
      ctx.font = `${cs * 0.72}px serif`;
      ctx.fillText(hero, player[0] * cs + cs / 2, player[1] * cs + cs / 2 + 2);
    };
    const canMove = (x, y, dx, dy) => { const c = cells[y][x]; if (dx === 1) return !c.e; if (dx === -1) return !c.w; if (dy === 1) return !c.s; if (dy === -1) return !c.n; return false; };
    const step = (dx, dy) => {
      if (done || !canMove(player[0], player[1], dx, dy)) return false;
      player[0] += dx; player[1] += dy; G.sfx.tap();
      const bi = bonus.findIndex(b => b[0] === player[0] && b[1] === player[1]);
      if (bi >= 0) { bonus.splice(bi, 1); G.sfx.chime(); const r = cv.getBoundingClientRect(); G.addStars(1, r.left + player[0] * cs + cs / 2, r.top + player[1] * cs); }
      draw();
      if (player[0] === goal[0] && player[1] === goal[1]) { done = true; G.sfx.great(); cleanup(); G.beep(C.praise() + ' You made it!').then(() => resolve(0)); }
      return true;
    };
    const key = e => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key]; if (m) { e.preventDefault(); step(...m); } };
    window.addEventListener('keydown', key);
    const cleanup = () => { window.removeEventListener('keydown', key); window.removeEventListener('resize', layout); };
    window.addEventListener('resize', layout);
    host.querySelectorAll('.dpad button').forEach(b => b.onclick = () => step(...b.dataset.d.split(',').map(Number)));
    let dragging = false;
    const toward = (e) => {
      const r = cv.getBoundingClientRect();
      const tx = Math.floor((e.clientX - r.left) / cs), ty = Math.floor((e.clientY - r.top) / cs);
      for (let k = 0; k < 30; k++) {
        const dx = Math.sign(tx - player[0]), dy = Math.sign(ty - player[1]);
        if (!dx && !dy) break;
        const horizFirst = Math.abs(tx - player[0]) >= Math.abs(ty - player[1]);
        if (horizFirst) { if (!(dx && step(dx, 0)) && !(dy && step(0, dy))) break; }
        else { if (!(dy && step(0, dy)) && !(dx && step(dx, 0))) break; }
      }
    };
    cv.addEventListener('pointerdown', e => { dragging = true; cv.setPointerCapture(e.pointerId); toward(e); });
    cv.addEventListener('pointermove', e => { if (dragging) toward(e); });
    cv.addEventListener('pointerup', () => dragging = false);
    C._cleanup = cleanup;
    requestAnimationFrame(layout);
  });

  // ---------- dot-to-dot ----------
  const DOTS = {
    triangle: { pts: [[50, 10], [90, 85], [10, 85]], closed: true, e: '🔺', name: 'a triangle', color: '#ffd93d' },
    square: { pts: [[20, 20], [80, 20], [80, 80], [20, 80]], closed: true, e: '🟦', name: 'a square', color: '#4d8dff' },
    house: { pts: [[20, 90], [20, 50], [50, 18], [80, 50], [80, 90]], closed: true, e: '🏡', name: 'a house, like Little Forest', color: '#a7e3ff' },
    pentastar: { pts: [[50, 8], [74, 88], [10, 38], [90, 38], [26, 88]], closed: true, e: '⭐', name: 'a star', color: '#ffd93d', noFill: true },
    kite: { pts: [[50, 8], [82, 45], [50, 92], [18, 45]], closed: true, e: '🪁', name: 'a diamond kite', color: '#ff6fb1' },
    rocket: { pts: [[50, 4], [64, 22], [66, 58], [82, 76], [82, 94], [64, 84], [36, 84], [18, 94], [18, 76], [34, 58], [36, 22]], closed: true, e: '🚀', name: 'a rocket', color: '#ff5d8f' },
    star: { pts: Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 5 * i - Math.PI / 2, r = i % 2 ? 18 : 44; return [50 + Math.cos(a) * r, 52 + Math.sin(a) * r]; }), closed: true, e: '🌟', name: 'a big star', color: '#ffd93d' },
    moon: { pts: [[60, 8], [36, 16], [20, 36], [18, 60], [30, 80], [52, 92], [74, 88], [52, 76], [40, 54], [44, 30]], closed: true, e: '🌙', name: 'the moon', color: '#fff3a8' },
    heart: { pts: [[50, 30], [62, 14], [80, 12], [92, 28], [88, 50], [50, 90], [12, 50], [8, 28], [20, 12], [38, 14]], closed: true, e: '❤️', name: 'a heart', color: '#ff4f6d' },
    dipper: { pts: [[8, 30], [24, 26], [38, 34], [52, 44], [56, 70], [86, 76], [90, 48]], closed: false, e: '✨', name: 'the Big Dipper! It\'s a group of stars shaped like a big spoon', color: '#fff', lines: true, closeTo: 3 },
    saturn: { pts: [[50, 20], [70, 28], [96, 40], [80, 56], [70, 72], [50, 80], [30, 72], [20, 56], [4, 40], [30, 28]], closed: true, e: '🪐', name: 'Saturn', color: '#e8c07a' },
  };
  C.dots = (host, level) => new Promise(resolve => {
    const little = G.isLittle();
    const shapes = little ? ['triangle', 'square', 'house', 'pentastar', 'kite'] : ['rocket', 'star', 'moon', 'heart', 'dipper', 'house', 'saturn'];
    const s = DOTS[pick(shapes)];
    const steps = little ? [1] : level >= 3 ? [1, 2, 5, 10] : level >= 2 ? [1, 2] : [1];
    const step = pick(steps), start = step === 1 ? 1 : step;
    const labels = s.pts.map((_, i) => start + i * step);
    let next = 0, done = false;
    host.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>Connect the dots${step > 1 ? ` by ${step}s` : ''}!</span></div><div class="ch-canvas-wrap"><canvas></canvas></div>`;
    const wrap = host.querySelector('.ch-canvas-wrap'), cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    const speak = () => G.beep(step > 1 ? `Connect the dots! Count by ${step}s. Start at ${labels[0]}.` : `Connect the dots! Start at number one.`);
    host.querySelector('.say-btn').onclick = speak; speak();
    let S = 300, dpr = window.devicePixelRatio || 1, t0 = performance.now(), raf;
    const P = i => [s.pts[i][0] / 100 * S, s.pts[i][1] / 100 * S];
    const layout = () => { const r = wrap.getBoundingClientRect(); S = Math.floor(Math.min(r.width - 10, r.height - 10)); cv.width = S * dpr; cv.height = S * dpr; cv.style.width = cv.style.height = S + 'px'; };
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#1d1150'; ctx.fillRect(0, 0, S, S);
      if (done && !s.noFill && s.closed) { ctx.fillStyle = s.color; ctx.globalAlpha = 0.85; ctx.beginPath(); s.pts.forEach((p, i) => { const [x, y] = P(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = Math.max(4, S / 70); ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < next; i++) { const [x, y] = P(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      if (done && s.closed) ctx.closePath();
      if (done && s.closeTo != null) { const [x, y] = P(s.closeTo); ctx.lineTo(x, y); }
      ctx.stroke();
      const dr = Math.max(14, S / 22);
      s.pts.forEach((p, i) => {
        const [x, y] = P(i);
        const isNext = i === next && !done;
        const pulse = isNext ? 1 + 0.18 * Math.sin((now - t0) / 150) : 1;
        ctx.fillStyle = i < next ? '#ffd93d' : isNext ? '#ff4f9a' : '#fff';
        ctx.beginPath(); ctx.arc(x, y, dr * pulse, 0, 7); ctx.fill();
        ctx.fillStyle = '#2d2250'; ctx.font = `700 ${dr * (labels[i] > 9 ? 0.9 : 1.1)}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], x, y + 1);
      });
      if (done) { ctx.font = `${S / 4}px serif`; ctx.fillText(s.e, S / 2, S * 0.52); }
      raf = requestAnimationFrame(draw);
    };
    layout(); raf = requestAnimationFrame(draw);
    cv.addEventListener('pointerdown', e => {
      if (done) return;
      const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      const dr = Math.max(14, S / 22) * 1.9;
      const hit = s.pts.findIndex((p, i) => Math.hypot(P(i)[0] - x, P(i)[1] - y) < dr);
      if (hit === next) {
        next++; G.sfx.count(next); G.say(String(labels[hit]), { rate: 1.2 });
        if (next === s.pts.length) {
          done = true; G.sfx.great(); G.addStars(1);
          setTimeout(() => G.beep(`You made ${s.name}!`).then(() => { cancelAnimationFrame(raf); resolve(0); }), 500);
        }
      } else if (hit >= 0) { G.sfx.oops(); G.beep(`Find ${labels[next]}!`); }
    });
    C._cleanup = () => cancelAnimationFrame(raf);
  });

  // ---------- jigsaw ----------
  function puzzlePicture(size) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size; const ctx = cv.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#1d1150'); g.addColorStop(1, '#4a2a8a'); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random()})`; ctx.beginPath(); ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 2.5, 0, 7); ctx.fill(); }
    const pl = pick(G.WORLD.places.filter(p => p.colors && !p.hidden && p.kind !== 'station' && p.kind !== 'comet'));
    const pr = size * (pl.rings ? 0.2 : 0.3);
    G.art.drawPlanet(ctx, pl, size * 0.58, size * 0.55, pr, 0);
    ctx.font = `${size * 0.22}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.translate(size * 0.2, size * 0.25); ctx.rotate(0.6); ctx.fillText('🚀', 0, 0); ctx.restore();
    ctx.font = `${size * 0.1}px serif`; ctx.fillText('⭐', size * 0.85, size * 0.15); ctx.fillText('🌙', size * 0.15, size * 0.85);
    ctx.fillStyle = '#fff'; ctx.font = `700 ${size * 0.07}px Fredoka, sans-serif`; ctx.fillText(pl.name, size * 0.5, size * 0.93);
    return { url: cv.toDataURL(), name: pl.name };
  }
  C.jigsaw = (host, level) => new Promise(resolve => {
    const n = G.isLittle() ? 2 : level >= 3 ? 4 : 3;
    host.innerHTML = `<div class="ch-prompt"><button class="say-btn">🔊</button><span>Put the picture together!</span></div><div class="jig-area"></div>`;
    const area = host.querySelector('.jig-area');
    const speak = () => G.beep('Drag the pieces into the box to finish the picture!');
    host.querySelector('.say-btn').onclick = speak; speak();
    requestAnimationFrame(() => {
      const r = area.getBoundingClientRect();
      const B = Math.floor(Math.min(r.height - 10, r.width * 0.55)), ps = B / n;
      const pic = puzzlePicture(600);
      const bx = 6, by = (r.height - B) / 2;
      const board = G.html(`<div class="jig-board" style="left:${bx}px;top:${by}px;width:${B}px;height:${B}px"></div>`); area.appendChild(board);
      let placed = 0;
      const pieces = [];
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pieces.push([i, j]);
      shuffle(pieces).forEach(([i, j], k) => {
        const el = document.createElement('div'); el.className = 'jig-piece';
        Object.assign(el.style, { width: ps + 'px', height: ps + 'px', backgroundImage: `url(${pic.url})`, backgroundSize: `${B}px ${B}px`, backgroundPosition: `${-i * ps}px ${-j * ps}px` });
        const freeL = bx + B + 16, freeW = r.width - freeL - ps;
        let x = freeW > 0 ? freeL + Math.random() * freeW : Math.random() * (r.width - ps);
        let y = Math.random() * (r.height - ps);
        el.style.left = x + 'px'; el.style.top = y + 'px';
        area.appendChild(el);
        let ox, oy;
        G.draggable(el, {
          onStart: e => { if (el.classList.contains('placed')) return false; const pr = el.getBoundingClientRect(); ox = e.clientX - pr.left; oy = e.clientY - pr.top; el.style.zIndex = 10; G.sfx.tap(); },
          onMove: e => { const ar = area.getBoundingClientRect(); x = e.clientX - ar.left - ox; y = e.clientY - ar.top - oy; el.style.left = x + 'px'; el.style.top = y + 'px'; },
          onEnd: () => {
            el.style.zIndex = 1;
            const tx = bx + i * ps, ty = by + j * ps;
            if (Math.hypot(x - tx, y - ty) < ps * 0.4) {
              el.style.left = tx + 'px'; el.style.top = ty + 'px'; el.classList.add('placed'); G.sfx.snap(); placed++;
              if (placed === n * n) { G.sfx.great(); G.addStars(1); G.beep(`You did it! It's ${pic.name}!`).then(() => resolve(0)); }
            }
          },
        });
      });
    });
  });

  // ---------- shapes & patterns ----------
  const SHAPES = {
    circle: { sides: 0, svg: c => `<circle cx="50" cy="50" r="42" fill="${c}"/>` },
    square: { sides: 4, svg: c => `<rect x="10" y="10" width="80" height="80" rx="4" fill="${c}"/>` },
    triangle: { sides: 3, svg: c => `<path d="M50 8 L92 88 L8 88 Z" fill="${c}"/>` },
    rectangle: { sides: 4, svg: c => `<rect x="4" y="26" width="92" height="48" rx="4" fill="${c}"/>` },
    star: { sides: 10, svg: c => G.art.star(50, 54, 46, c) },
    heart: { sides: 0, svg: c => `<path d="M50 88 C10 60 6 30 26 18 C38 12 48 20 50 28 C52 20 62 12 74 18 C94 30 90 60 50 88 Z" fill="${c}"/>` },
    pentagon: { sides: 5, svg: c => `<path d="${poly(5)}" fill="${c}"/>` },
    hexagon: { sides: 6, svg: c => `<path d="${poly(6)}" fill="${c}"/>` },
    octagon: { sides: 8, svg: c => `<path d="${poly(8, Math.PI / 8)}" fill="${c}"/>` },
    oval: { sides: 0, svg: c => `<ellipse cx="50" cy="50" rx="46" ry="30" fill="${c}"/>` },
    diamond: { sides: 4, svg: c => `<path d="M50 4 L90 50 L50 96 L10 50 Z" fill="${c}"/>` },
    trapezoid: { sides: 4, svg: c => `<path d="M26 22 H74 L94 80 H6 Z" fill="${c}"/>` },
  };
  function poly(n, rot = -Math.PI / 2) { let d = ''; for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; d += (i ? 'L' : 'M') + (50 + 44 * Math.cos(a)).toFixed(1) + ' ' + (50 + 44 * Math.sin(a)).toFixed(1); } return d + 'Z'; }
  const COLORS = [['red', '#ff5d5d'], ['blue', '#4d8dff'], ['yellow', '#ffd93d'], ['green', '#4cd97b'], ['purple', '#9b6bff'], ['pink', '#ff6fb1'], ['orange', '#ff9f43']];
  const shapeBtn = (name, col, size = 90) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${SHAPES[name].svg(col)}</svg>`;
  C.shapeQ = (level) => {
    const little = G.isLittle();
    const basic = ['circle', 'square', 'triangle', 'star', 'heart'];
    const all = basic.concat(['rectangle', 'pentagon', 'hexagon', 'oval', 'diamond', 'trapezoid', 'octagon']);
    const pool = little ? basic : level >= 2 ? all : basic.concat(['rectangle', 'hexagon', 'oval']);
    const kinds = little ? ['find', 'color', 'pattern', 'size'] : level >= 2 ? ['find', 'sides', 'pattern', 'pattern', 'size', 'numpattern'] : ['find', 'sides', 'pattern', 'size'];
    const kind = pick(kinds);
    if (kind === 'find') {
      const opts = shuffle(pool).slice(0, little ? 3 : 4), t = pick(opts);
      return { prompt: `Tap the ${t}!`, visual: '', choices: opts.map(o => ({ html: shapeBtn(o, pick(COLORS)[1]), v: o })), answer: t, hint: t === 'triangle' ? 'A triangle has three pointy corners, like a rocket fin!' : undefined };
    }
    if (kind === 'color') {
      const sh = pick(basic), cols = shuffle(COLORS).slice(0, 3), t = pick(cols);
      return { prompt: `Tap the ${t[0]} ${sh}!`, visual: '', choices: cols.map(c => ({ html: shapeBtn(sh, c[1]), v: c[0] })), answer: t[0] };
    }
    if (kind === 'sides') {
      const t = pick(['triangle', 'square', 'pentagon', 'hexagon', 'rectangle', 'octagon'].filter(x => pool.includes(x)));
      const ans = SHAPES[t].sides;
      return { prompt: `How many sides does a ${t} have?`, visual: shapeBtn(t, pick(COLORS)[1], 150), choices: numChoices(ans, 4, 2, 9), answer: ans, hint: 'Count the straight edges, one by one.' };
    }
    if (kind === 'pattern') {
      const em = shuffle(['🚀', '⭐', '🌙', '🪐', '👽', '🦄', '🦉', '🍦', '❤️', '🌈']);
      const patterns = little ? [[0, 1]] : level >= 2 ? [[0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 0, 1, 1], [0, 1, 2, 1]] : [[0, 1], [0, 1, 2], [0, 0, 1]];
      const p = pick(patterns);
      const len = p.length * 2 + R(0, p.length - 1);
      const seq = Array.from({ length: len }, (_, i) => em[p[i % p.length]]);
      const ans = em[p[len % p.length]];
      const choices = shuffle([...new Set(p.map(i => em[i]).concat([em[5]]))]).slice(0, little ? 3 : 4);
      if (!choices.includes(ans)) choices[0] = ans;
      return { prompt: 'What comes next?', visual: `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${seq.join('')}<span style="color:#ff4f9a">❓</span></div>`, choices: shuffle(choices), answer: ans, hint: 'Say the pattern out loud!' };
    }
    if (kind === 'size') {
      const e = pick(['🚀', '🛸', '⭐', '🌙', '🦉']);
      const sizes = shuffle([40, 70, 110]);
      const big = Math.random() < .5;
      const ans = big ? Math.max(...sizes) : Math.min(...sizes);
      const word = { '🚀': 'rocket', '🛸': 'flying saucer', '⭐': 'star', '🌙': 'moon', '🦉': 'owl' }[e];
      return { prompt: `Tap the ${big ? 'biggest' : 'smallest'} ${word}!`, visual: '', choices: sizes.map(s => ({ html: `<span style="font-size:${s}px">${e}</span>`, v: s })), answer: ans };
    }
    // number pattern (Beast Academy style)
    const step = pick([2, 3, 5, 10]), s = R(1, 10);
    const seq = [0, 1, 2, 3].map(i => s + step * i);
    const hole = R(1, 3);
    const ans = seq[hole];
    return { prompt: seq.map((v, i) => i === hole ? '?' : v).join(', '), say: 'What number is missing?', visual: '🔢', choices: numChoices(ans, 4, 0), answer: ans, hint: `Each number is ${step} more than the one before.` };
  };

  // ---------- stations: a round of challenges then a prize ----------
  C.STATIONS = {
    engine: { name: 'Engine Lab', ic: '🔥', bg: 'ch-bg-engine', lv: 'math', intro: 'Welcome to the Engine Lab! Solve number puzzles to build a stronger engine!' },
    fuel: { name: 'Fuel Depot', ic: '⛽', bg: 'ch-bg-fuel', lv: 'math', intro: 'This is the Fuel Depot! Fill the tanks just right to make a new fuel tank!' },
    words: { name: 'Mission Control', ic: '🔤', bg: 'ch-bg-words', lv: 'words', intro: 'Mission Control needs help with words! Let\'s send messages to space!' },
    puzzle: { name: 'Puzzle Lab', ic: '🧩', bg: 'ch-bg-puzzle', lv: 'maze', intro: 'Puzzle Lab! Solve mazes and puzzles to earn a new nose cone!' },
    shapes: { name: 'Shape Shop', ic: '🔷', bg: 'ch-bg-shapes', lv: 'shapes', intro: 'The Shape Shop! Rockets are made of shapes. Find them to make new fins!' },
  };
  C.roundLength = (id) => {
    const little = G.isLittle();
    if (id === 'puzzle') return little ? 2 : 3;
    if (id === 'fuel') return little ? 3 : 4;
    return little ? 3 : 5;
  };
  C.runItem = (id, host, i) => {
    const p = G.P(), lv = p.level;
    const little = G.isLittle();
    switch (id) {
      case 'engine': return C.ask(host, C.mathQ(little ? Math.min(lv.math, 1) : lv.math));
      case 'fuel': return C.fuel(host, C.fuelTask(little ? Math.min(lv.math, 1) : lv.math));
      case 'words': return little ? C.ask(host, C.letterQ()) : C.spell(host, lv.words);
      case 'puzzle': { const order = little ? ['maze', 'jigsaw', 'dots'] : ['maze', 'dots', 'jigsaw']; const k = order[(i + (p.stationRounds.puzzle || 0)) % 3]; return C[k](host, lv.maze); }
      case 'shapes': return C.ask(host, C.shapeQ(lv.shapes));
    }
  };
  function adjustLevel(id, mistakes, n) {
    const p = G.P(), key = C.STATIONS[id].lv;
    const little = G.isLittle();
    const max = little ? 1 : { math: 6, words: 3, maze: 5, shapes: 3 }[key];
    const min = little ? 0 : 1;
    p.flags['streak_' + key] = p.flags['streak_' + key] || 0;
    if (mistakes <= Math.floor(n / 4)) { p.flags['streak_' + key]++; if (p.flags['streak_' + key] >= (little ? 3 : 2)) { p.level[key] = Math.min(max, p.level[key] + 1); p.flags['streak_' + key] = 0; } }
    else if (mistakes >= n) { p.level[key] = Math.max(min, p.level[key] - 1); p.flags['streak_' + key] = 0; }
    else p.flags['streak_' + key] = 0;
  }

  // prize: first part from the pool you don't have yet
  C.nextPrize = (id) => (G.DATA.pools[id] || []).find(pid => !G.P().parts.includes(pid));
  C.givePart = (pid) => { const p = G.P(); if (pid && !p.parts.includes(pid)) { p.parts.push(pid); p.flags.newParts = (p.flags.newParts || 0) + 1; G.persist(); } };
  C.tierText = (tier) => ['', 'the Moon', 'Mars and Venus', 'Jupiter', 'Saturn and Uranus', 'Neptune, Pluto, and far, far away'][tier] || '';

  C.showReward = (root, pid, opts = {}) => new Promise(resolve => {
    const def = pid && G.DATA.partById[pid];
    const ov = G.html(`<div class="reward"><h2>${opts.title || 'You earned a present!'}</h2><div class="gift">🎁</div><p>Tap the present!</p></div>`);
    root.appendChild(ov); G.sfx.gift(); G.beep(opts.title || 'You earned a present! Tap it!');
    ov.querySelector('.gift').onclick = () => {
      G.sfx.great(); G.confetti(90);
      const catFact = def ? (G.DATA.cats.find(c => c.id === def.cat) || {}).fact : '';
      let extra = '';
      if (def && (def.cat === 'engine' || def.cat === 'booster')) {
        const r = Object.assign({}, G.P().rocket); if (def.cat === 'engine') r.engine = pid; else r.boosters = pid;
        extra = ` Put it on your rocket, and you can fly all the way to ${C.tierText(G.rocketPower(r))}!`;
      }
      const inner = def ? `<div class="prize">${G.art.part(pid)}</div><h2>${def.name}!</h2><p>${catFact}${extra}</p>` : `<div class="prize"><span class="emoji">⭐</span></div><h2>5 bonus stars!</h2><p>You already have every part from here. Wow!</p>`;
      if (!def) G.addStars(5);
      ov.innerHTML = inner + `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
        ${def ? '<button class="big-btn green" data-a="build">🏭 Put it on!</button>' : ''}
        ${opts.again === false ? '' : '<button class="big-btn blue" data-a="again">🔁 Play again</button>'}
        <button class="big-btn" data-a="${opts.doneLabel ? 'done' : 'home'}">${opts.doneLabel || '🏠 Home'}</button></div>`;
      G.beep(def ? `You got the ${def.name}! ${extra}` : 'You already have every part from here! Here are five bonus stars!');
      ov.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { G.sfx.tap(); resolve(b.dataset.a); });
    };
  });

  G.screens.challenge = {
    enter(root, id) {
      const st = C.STATIONS[id];
      root.innerHTML = `<div class="challenge ${st.bg}"><div class="progress-dots"></div><div class="ch-card"></div></div>`;
      G.topbar(root, { title: `${st.ic} ${st.name}` });
      G.showBeep(true, true); G.music('think');
      const n = C.roundLength(id);
      root.querySelector('.progress-dots').innerHTML = '<i></i>'.repeat(n);
      const card = root.querySelector('.ch-card');
      this.alive = true;
      const run = async () => {
        let mistakes = 0;
        const p = G.P();
        if (!p.flags['intro_' + id]) { p.flags['intro_' + id] = 1; card.innerHTML = `<div style="font-size:120px">${st.ic}</div><div class="ch-prompt">${st.name}</div>`; await G.beep(st.intro); }
        for (let i = 0; i < n; i++) {
          if (!this.alive) return;
          mistakes += await C.runItem(id, card, i);
          if (!this.alive) return;
          root.querySelectorAll('.progress-dots i')[i].classList.add('done');
        }
        adjustLevel(id, mistakes, n);
        p.stationRounds[id] = (p.stationRounds[id] || 0) + 1;
        const pid = C.nextPrize(id);
        C.givePart(pid); G.addStars(3); G.persist();
        const a = await C.showReward(root, pid);
        if (!this.alive) return;
        if (a === 'build') G.go('workshop', { highlight: pid });
        else if (a === 'again') G.go('challenge', id);
        else G.go('hub');
      };
      run();
    },
    leave() { this.alive = false; if (C._cleanup) { C._cleanup(); C._cleanup = null; } },
  };
  return C;
})();
