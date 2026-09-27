"""Builds the encrypted photo pack and the recorded voice for What's Hiding?

The family photos never go into this public repo in the clear. The source lives in
Google Drive (SRC below):

  photos/<name>.jpg   original phone photos
  puzzles.json        {"faces": {kid: {"photo", "crop"}}, "puzzles": [...]}
  key.txt             the AES key (base64url); made on first run

Each puzzle names a photo, an optional crop [x, y, w, h], and the box [x, y, w, h]
over the hidden thing, both as fractions of the original photo. This script resizes
each photo, strips its metadata, encrypts it with AES-GCM into data/, and records any
voice lines that don't have a clip yet (edge-tts, free, no account).

Usage:  python tools/build.py            (prints the unlock link at the end)
"""
import asyncio, base64, hashlib, io, json, os, re, secrets, subprocess, sys, tempfile

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
SRC = os.environ.get('WHATS_HIDING_SRC', r'G:\My Drive\kids-games-private\whats-hiding')
DATA = os.path.join(GAME, 'data')
VOICE = os.path.join(GAME, 'voice')
URL = 'https://markeichenlaub.github.io/kids-games/games/whats-hiding/'
LONG_SIDE = 1280
VOICE_NAME, RATE = 'en-US-AnaNeural', '-6%'


def b64u(b):
    return base64.urlsafe_b64encode(b).decode().rstrip('=')


def load_key():
    path = os.path.join(SRC, 'key.txt')
    if not os.path.exists(path):
        with open(path, 'w') as f:
            f.write(b64u(secrets.token_bytes(16)))
    k = open(path).read().strip()
    return k, base64.urlsafe_b64decode(k + '=' * (-len(k) % 4))


def seal(aes, data):
    iv = secrets.token_bytes(12)
    return iv + aes.encrypt(iv, data, None)


def crop_img(im, c):
    if not c:
        return im
    W, H = im.size
    return im.crop((round(c[0] * W), round(c[1] * H), round((c[0] + c[2]) * W), round((c[1] + c[3]) * H)))


def jpeg(im, long_side, q=82):
    s = min(1, long_side / max(im.size))
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    buf = io.BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=q, optimize=True, progressive=True)  # no EXIF, so no GPS
    return buf.getvalue(), im.size


def build_photos(aes, spec):
    os.makedirs(os.path.join(DATA, 'p'), exist_ok=True)
    os.makedirs(os.path.join(DATA, 'f'), exist_ok=True)
    out, keep = [], set()
    for p in spec['puzzles']:
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, 'photos', p['photo'])))
        c = p.get('crop') or [0, 0, 1, 1]
        boxes = p['box'] if isinstance(p['box'][0], list) else [p['box']]
        boxes = [[(x - c[0]) / c[2], (y - c[1]) / c[3], w / c[2], h / c[3]] for x, y, w, h in boxes]
        data, size = jpeg(crop_img(im, p.get('crop')), LONG_SIDE)
        pid = hashlib.sha1((p['photo'] + json.dumps(p['box'])).encode()).hexdigest()[:10]
        name = f'p/{pid}.bin'
        open(os.path.join(DATA, name), 'wb').write(seal(aes, data))
        keep.add(name)
        q = {k: v for k, v in p.items() if k not in ('photo', 'crop', 'box', 'note')}
        boxes = [[round(v, 4) for v in b] for b in boxes]
        q.update(id=pid, file='data/' + name, w=size[0], h=size[1], box=boxes if len(boxes) > 1 else boxes[0])
        out.append(q)
    faces = {}
    for kid, f in spec.get('faces', {}).items():
        im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, 'photos', f['photo'])))
        data, _ = jpeg(crop_img(im, f['crop']), 320, 85)
        name = f'f/{hashlib.sha1(kid.encode()).hexdigest()[:8]}.bin'
        open(os.path.join(DATA, name), 'wb').write(seal(aes, data))
        keep.add(name)
        faces[kid] = 'data/' + name
    for sub in ('p', 'f'):  # photos that were dropped from the list
        for fn in os.listdir(os.path.join(DATA, sub)):
            if f'{sub}/{fn}' not in keep:
                os.remove(os.path.join(DATA, sub, fn))
    manifest = json.dumps({'puzzles': out, 'faces': faces}).encode()
    open(os.path.join(DATA, 'm.bin'), 'wb').write(seal(aes, manifest))
    return out


# ---------- voice ----------
def norm(s):
    s = s.lower().replace('\u2019', "'").replace('\u2018', "'")
    s = re.sub(r"[^a-z0-9' ]+", ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def fnv(s):  # same as hash() in game.js
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xffffffff
    digits, out = '0123456789abcdefghijklmnopqrstuvwxyz', ''
    while True:
        h, r = divmod(h, 36)
        out = digits[r] + out
        if h == 0:
            return out


def voice_lines(puzzles):
    lines = json.load(open(os.path.join(GAME, 'lines.json'), encoding='utf-8'))
    said = []

    def walk(v):
        if isinstance(v, str):
            said.append(v)
        elif isinstance(v, list):
            for x in v:
                walk(x)
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
    walk({k: v for k, v in lines.items() if k != 'words'})
    for _, sayit in lines['words'].values():
        said += [sayit, f'or {sayit}?']
    for p in puzzles:
        sayit = p.get('say') or (('an ' if p['answer'][0] in 'aeiou' else 'a ') + p['answer'])
        said += [p.get('reveal') or f"It's {sayit}!", sayit, f'or {sayit}?']
        if p.get('q'):
            said.append(p['q'])
        said += list(p.get('near', {}).values())
    return {fnv(norm(s)): s for s in said if norm(s)}


async def record(text, dest, sem, tmp):
    import edge_tts
    async with sem:
        raw = os.path.join(tmp, os.path.basename(dest) + '.raw.mp3')
        for attempt in range(4):
            try:
                await edge_tts.Communicate(text, VOICE_NAME, rate=RATE, pitch='+4Hz').save(raw)
                break
            except Exception as e:
                if attempt == 3:
                    print('FAILED', text, e, file=sys.stderr)
                    return
                await asyncio.sleep(2 + attempt * 3)
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        proc = await asyncio.create_subprocess_exec('ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', trim, '-ac', '1', '-b:a', '48k', dest)
        await proc.wait()
        os.remove(raw)


async def build_voice(puzzles):
    clips = os.path.join(VOICE, 'c')
    os.makedirs(clips, exist_ok=True)
    want = voice_lines(puzzles)
    todo = {h: t for h, t in want.items() if not os.path.exists(os.path.join(clips, h + '.mp3'))}
    print(f'{len(want)} voice lines, {len(todo)} to record')
    sem = asyncio.Semaphore(6)
    with tempfile.TemporaryDirectory() as tmp:
        await asyncio.gather(*(record(t, os.path.join(clips, h + '.mp3'), sem, tmp) for h, t in todo.items()))
    for fn in os.listdir(clips):
        if fn[:-4] not in want:
            os.remove(os.path.join(clips, fn))
    have = sorted(h for h in want if os.path.exists(os.path.join(clips, h + '.mp3')))
    json.dump({'voice': VOICE_NAME, 'clips': have}, open(os.path.join(VOICE, 'index.json'), 'w'))


def main():
    spec = json.load(open(os.path.join(SRC, 'puzzles.json'), encoding='utf-8'))
    k, raw = load_key()
    puzzles = build_photos(AESGCM(raw), spec)
    print(f'{len(puzzles)} puzzles encrypted')
    if '--no-voice' not in sys.argv:
        asyncio.run(build_voice(puzzles))
    print('Unlock link:', URL + '#k=' + k)


if __name__ == '__main__':
    main()
