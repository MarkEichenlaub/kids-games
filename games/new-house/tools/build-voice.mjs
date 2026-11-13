// Lists every sentence Beep might say and writes tools/voice-items.json.
// Then render_voice.py records the ones that have no clip yet.
//   node tools/build-voice.mjs && python tools/render_voice.py
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const js = f => fs.readFileSync(path.join(here, '..', 'js', f), 'utf8');

// just enough of the game to load lines.js
const KIDS = { mira: { id: 'mira', name: 'Mira', sis: 'maia' }, maia: { id: 'maia', name: 'Maia', sis: 'mira' } };
const G = { KIDS, pick: a => a[0], kid: () => KIDS.mira, save: { house: { roomNames: {} } } };
G.COSTUMES = [...js('people.js').matchAll(/say: '((?:[^'\\]|\\.)*)'/g)].map(m => ({ say: m[1].replace(/\\'/g, "'") }));
const ctx = { G, console }; vm.createContext(ctx); vm.runInContext(js('lines.js'), ctx, { filename: 'lines.js' });

// the same text handling as G.voice in core.js
const norm = s => s.normalize('NFC').toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').replace(/^[' ]+|[' ]+$/g, '').trim();
const hash = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
const clean = s => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, '').replace(/\s+/g, ' ').trim();
const sentences = s => clean(s).split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => /\p{L}|\p{N}/u.test(x));

const items = new Map();
for (const line of G.voiceLines()) for (const s of sentences(line)) {
  const h = hash(norm(s));
  if (!items.has(h)) items.set(h, { hash: h, text: s, say: s.replace(/\bMira\b/g, 'Meera') });
}
fs.writeFileSync(path.join(here, 'voice-items.json'), JSON.stringify([...items.values()], null, 1));
console.log(items.size, 'sentences,', [...items.values()].reduce((a, b) => a + b.say.length, 0), 'characters');
