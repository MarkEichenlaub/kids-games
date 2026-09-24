// Lists every clip Beep might need and writes tools/voice-items.json.
// Then run render_voice.py to record the missing clips.
//   node tools/build-voice.mjs && python tools/render_voice.py
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const game = path.join(here, '..');
const js = f => fs.readFileSync(path.join(game, 'js', f), 'utf8');

// the voice module, loaded the node way
const vctx = {}; vm.createContext(vctx); vm.runInContext(js('voice.js'), vctx);

// the whole game, with just enough browser around it to load
const noop = () => {};
const el = new Proxy(function () {}, { get: () => el, apply: () => el });
const ctx = { console, setTimeout, clearTimeout, setInterval, clearInterval, Math, JSON, Promise, Date, performance: { now: () => 0 },
  localStorage: { getItem: () => null, setItem: noop }, document: el, navigator: {}, innerWidth: 1200, innerHeight: 800 };
ctx.window = ctx; vm.createContext(ctx);
const order = ['core.js', 'data.js', 'family.js', 'art.js', 'challenges.js', 'phonics.js', 'workshop.js', 'launch.js', 'space.js', 'planets.js', 'screens.js'];
for (const f of order) vm.runInContext(js(f), ctx, { filename: f });
const G = ctx.G;

// ---------- the parts of lines that change ----------
const kids = G.FAMILY.kids;
const vars = new Set();
const add = (...xs) => xs.flat().forEach(x => x && vars.add(String(x)));
add(kids.map(k => k.name), kids.map(k => k.name + "'s"));
const VO = G.ch.VOCAB;
add(VO.things, VO.letterWords, VO.dots, VO.shapes, VO.colors);
add(G.WORLD.places.filter(p => p.name).map(p => p.name));
add(G.DATA.parts.map(p => p.name), G.DATA.cats.map(c => c.name), G.DATA.cats.map(c => c.name.toLowerCase()));
add(Object.values(G.ch.STATIONS).map(s => s.name), G.DATA.crew.map(c => c.name), G.FAMILY.aliens.map(a => a.name));
add(Object.values(G.DATA.words).flat().map(w => w[0].toLowerCase()));
add([1, 2, 3, 4, 5].map(t => G.ch.tierText(t)));
add(G.FAMILY.chinese.map(c => c.en));
add(G.PHONICS.all.map(w => w[0]));
add(['an engine', 'a fuel tank', 'fins', 'a capsule', 'a nose cone', 'odd', 'even', 'biggest', 'smallest', 'rocket', 'flying saucer', 'star', 'moon', 'owl', 'present', 'part', 'minus', 'plus', 'somewhere in space', 'a secret place in space', 'the Space Station', 'ten', 'tens']);
// short phrases that end up next to a name that starts with "the"
const forced = ['You got', 'Earn the', 'Welcome to'];
const zh = {};
G.FAMILY.chinese.forEach(c => { zh[c.py.toLowerCase()] = c.zh; zh[c.zh] = c.zh; });
vctx.VOICE.setVars([...vars], zh);

// ---------- collect ----------
const items = new Map();
const put = (id, text, voice = 'en') => { if (!id || items.has(id)) return; items.set(id, { id, hash: vctx.VOICE.hash(id), text, voice }); };
const addPieces = s => { for (const p of vctx.VOICE.split(s)) put(p.id, p.text, p.voice); };
const addWhole = (raw, pieces) => {
  const w = vctx.VOICE.words(raw);
  if (!/\p{L}/u.test(w)) return;
  if (!vctx.VOICE.hasZh(w)) put(vctx.VOICE.norm(w), w);
  for (const s of vctx.VOICE.sentences(w)) {
    if (!vctx.VOICE.hasZh(s)) put(vctx.VOICE.norm(s), s);
    if (pieces || vctx.VOICE.hasZh(s)) addPieces(s);
  }
};
const addDynamic = raw => { const w = vctx.VOICE.words(raw); for (const s of vctx.VOICE.sentences(w)) addPieces(s); };

// 1. every string in the source that reads like speech
const looksSpoken = s => /\p{L}{2}/u.test(s) && !/[<>{};=#\\/]|px\b|\bvar\(|rgba|^\s*[\w.-]+\s*$/.test(s) && !/^[a-z]+(-[a-z]+)+$/.test(s) && !/\b(flex|solid|none|absolute|translate|scale|rotate|linear|ease|inherit)\b/.test(s);
for (const f of order) {
  const ast = acorn.parse(js(f), { ecmaVersion: 'latest' });
  walk.full(ast, n => {
    if (n.type === 'Literal' && typeof n.value === 'string' && looksSpoken(n.value)) addWhole(n.value, false);
    if (n.type === 'TemplateLiteral') {
      const qs = n.quasis.map(q => q.value.cooked || '');
      const joined = qs.join(' ');
      if (!looksSpoken(joined)) return;
      if (n.expressions.length === 0) addWhole(qs[0], false);
      else qs.forEach(q => { if (/\p{L}/u.test(q)) addDynamic(q); });
    }
  });
}
// single-word lines that the source spells as plain words
forced.forEach(f => put(vctx.VOICE.norm(f), f));
['Beep boop!', 'Liftoff!', 'Choo choo!', 'Yes!', 'Super!', 'Perfect!'].forEach(s => addWhole(s, false));

// 2. question generators, sampled many times
const collectQ = q => { if (!q) return; [q.say, q.prompt && q.prompt.replace('−', 'minus').replace('?', ''), q.after, q.hint, q.follow && q.follow.prompt, q.follow && `${q.follow.prompt}`].forEach(t => t && addDynamic(String(t))); };
for (const k of kids) {
  G.usePro(k.id, k.name, k.little);
  for (let lv = 0; lv <= 6; lv++) for (let i = 0; i < 1500; i++) { collectQ(G.ch.mathQ(lv)); collectQ(G.ch.fuelTask(lv)); }
  for (let lv = 0; lv <= 3; lv++) for (let i = 0; i < 800; i++) collectQ(G.ch.shapeQ(lv));
  for (let i = 0; i < 400; i++) collectQ(G.ch.letterQ());
}

// 3. the changing parts themselves
for (const v of vars) put(vctx.VOICE.norm(v), v);
for (let n = 0; n <= 1000; n++) put('n:' + n, String(n));
for (const n of [2, 3, 4, 5, 10, 100]) put('n:' + n + 's', n + 's');
for (const l of Object.keys(vctx.VOICE.letterNames)) put('l:' + l, l);
Object.values(zh).concat(['你好', '谢谢']).forEach(z => put('z:' + z, z, 'zh'));

// what the voice actually reads
const plural = { '2s': 'twos', '3s': 'threes', '4s': 'fours', '5s': 'fives', '10s': 'tens', '100s': 'hundreds' };
for (const it of items.values()) {
  if (it.voice === 'zh') continue;
  if (it.id.startsWith('l:')) it.say = vctx.VOICE.letterNames[it.text] + '.';
  else if (it.id.startsWith('n:')) it.say = plural[it.text] || it.text;
  else it.say = it.text.replace(/^[^\p{L}\p{N}]+/u, '').replace(/\bMira\b/g, 'Meera').replace(/\bMIRA\b/g, 'Meera');
}
for (const it of items.values()) if (it.voice === 'zh') it.say = it.text;
// the practice words get their own slow, careful recording
const practice = new Set(G.PHONICS.all.map(w => w[0]).concat(G.PHONICS.alienNames.map(n => n.toLowerCase())));
for (const it of items.values()) if (practice.has(it.id)) { it.say = it.text.replace(/^./, c => c.toUpperCase()) + '.'; it.rate = '-25%'; }

fs.writeFileSync(path.join(here, 'voice-items.json'), JSON.stringify([...items.values()], null, 0));
fs.mkdirSync(path.join(game, 'voice', 'c'), { recursive: true });
fs.writeFileSync(path.join(here, 'voice-vars.json'), JSON.stringify({ vars: [...vars], zh }));
console.log(items.size, 'clips listed,', [...items.values()].reduce((a, b) => a + b.say.length, 0), 'characters');
