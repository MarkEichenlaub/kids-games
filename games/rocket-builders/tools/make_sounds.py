"""Makes the single letter sounds for sounding out words (voice/s/<letter>.mp3).

Neural voices won't say a bare sound like /f/ or short /a/ (they spell the
letter out, and the service rejects phoneme markup). So each sound is cut from
a real word: the word is recorded, and the clip is cut where the voice
stops before the word's final stop consonant ("bu|t" -> "buh", "a|t" -> short a).
Run with --check to have a phoneme recognizer (allosaurus) say what it hears.
"""
import asyncio, os, subprocess, sys, tempfile, wave
import numpy as np
import edge_tts

VOICE = 'en-US-AvaNeural'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'voice', 's')
# letter: (word to record, which part to keep)
CARRIERS = {
    'a': 'at', 'e': 'etch', 'i': 'it', 'o': 'odd', 'u': 'up',
    'b': 'but', 'c': 'cuff', 'd': 'duck', 'f': 'fudge', 'g': 'gut', 'h': 'hut', 'j': 'jump', 'k': 'cuff', 'l': 'luck',
    'm': 'mutt', 'n': 'nut', 'p': 'putt', 'r': 'rut', 's': 'such', 't': 'tuck', 'v': 'van', 'w': 'what', 'y': 'yup', 'z': 'zip',
    'x': 'box',
}
VOWELS = set('aeiou')
SR = 16000


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def rms(x, win=160):
    n = len(x) // win
    return np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(axis=1))


CONTINUANTS = set('fmnlrsvz')


def cut(x, letter, vowel_at=None):
    """vowel_at: seconds where the recognizer says the vowel starts (consonant words)."""
    e = rms(x)
    peak = e.max()
    on = int(np.argmax(e > peak * (0.004 if letter in 'fhsvz' else 0.012)))
    top = on + int(np.argmax(e[on:] > peak * 0.5))
    dip = top + int(np.argmax(e[top:] < peak * 0.1))
    if letter == 'x':  # the "ks" at the end of "ox"
        tail = dip + int(np.argmax(e[dip:] > peak * 0.03))
        last = len(e) - 1 - int(np.argmax(e[::-1] > peak * 0.012))
        y = x[tail * 160:last * 160]
    elif letter in VOWELS:
        y = x[on * 160:dip * 160]
    else:
        v = int((vowel_at or top * 160 / SR) * SR)
        v = max(v, on * 160 + int(0.04 * SR))
        if letter in CONTINUANTS:  # just the consonant, held: "fff", "mmm"
            y = stretch(x[on * 160:v], 0.38)
        else:  # stops need a little vowel to be heard at all: "buh"
            v = min(v, top * 160)
            y = x[on * 160:v + int(0.06 * SR)]
    y = y.copy()
    fade = min(len(y) // 3, int(0.04 * SR))
    y[-fade:] *= np.linspace(1, 0, fade)
    y[:40] *= np.linspace(0, 1, 40)
    return y


def stretch(y, target):
    """time-stretch without changing pitch (ffmpeg atempo), to about target seconds."""
    k = max(0.25, min(1.0, len(y) / SR / target))
    chain = []
    while k < 0.5:
        chain.append('atempo=0.5'); k /= 0.5
    chain.append(f'atempo={k:.3f}')
    raw = (np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()
    out = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', ','.join(chain), '-f', 's16le', '-'], input=raw, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.int16).astype(np.float32) / 32768


def save(y, path):
    tmp = path + '.wav'
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y * 0.95 / max(1e-3, abs(y).max()), -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-b:a', '64k', path])
    return tmp


async def main():
    os.makedirs(OUT, exist_ok=True)
    tmpd = tempfile.mkdtemp()
    words = sorted(set(CARRIERS.values()))
    await asyncio.gather(*(edge_tts.Communicate(w + '.', VOICE, rate='-15%').save(os.path.join(tmpd, w + '.mp3')) for w in words))
    from allosaurus.app import read_recognizer
    m = read_recognizer()
    wavs = {}
    for letter, word in CARRIERS.items():
        mp3 = os.path.join(tmpd, word + '.mp3')
        vowel_at = None
        if letter not in VOWELS and letter != 'x':
            wav = mp3 + '.wav'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ar', str(SR), '-ac', '1', wav])
            phones = [l.split() for l in m.recognize(wav, 'eng', timestamp=True).splitlines() if l.strip()]
            if len(phones) >= 2:
                vowel_at = float(phones[1][0])
        y = cut(load(mp3), letter, vowel_at)
        wavs[letter] = save(y, os.path.join(OUT, letter + '.mp3'))
        print(letter, word, f'{len(y) / SR:.2f}s')
    if '--check' in sys.argv:  # blend a few words from the sounds and see what the recognizer hears
        for w in ['fin', 'sun', 'map', 'jet', 'dig', 'hot', 'cup', 'zap', 'red', 'box', 'lamp', 'nest', 'yum', 'vat', 'kit', 'web']:
            parts = [load(os.path.join(OUT, c + '.mp3')) for c in w]
            gap = np.zeros(int(0.05 * SR), dtype=np.float32)
            y = np.concatenate([np.concatenate([p, gap]) for p in parts])
            print(w, '=>', m.recognize(save(y, os.path.join(tmpd, w + '.mp3')), 'eng'))
    for wav in wavs.values():
        os.remove(wav)


asyncio.run(main())
