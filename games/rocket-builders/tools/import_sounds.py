"""Letter sounds for sounding out words (voice/s/<letter>.mp3).

Recorded by a reading teacher: Kathryn J. Davis, Sound City Reading
(https://www.soundcityreading.net/individual-alphabet-sounds---abc-order.html).
Her site allows parents and teachers to download the audio for use with their
own students, not for profit. Each clip is trimmed to the sound itself and
leveled to match Beep's voice.
"""
import os, subprocess, urllib.request
import numpy as np

BASE = 'https://www.soundcityreading.net/uploads/3/7/6/1/37611941/'
FILES = {l: f'alphasounds-{l}.mp3' for l in 'abcdefghijklmnqrsvwxyz'}
FILES.update({'o': 'alphasounds-o-sh.mp3', 'u': 'alphasounds-u-sh.mp3', 'p': 'alphasounds-p-2.mp3', 't': 'alphasounds-t.mp3'})
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voice', 's')
SR = 24000


def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = os.path.join(OUT, '_src.mp3')
    for letter, name in FILES.items():
        urllib.request.urlretrieve(BASE + name, tmp)
        x = pcm(tmp)
        win = SR // 100
        e = np.sqrt((x[:len(x) // win * win].reshape(-1, win) ** 2).mean(axis=1))
        # the main burst of sound: frames above 8% of the peak, around the loudest frame
        on = e > e.max() * 0.08
        pk = int(e.argmax()); lo = hi = pk
        while lo > 0 and (on[lo - 1] or (lo > 2 and on[lo - 3])): lo -= 1
        while hi < len(on) - 1 and (on[hi + 1] or (hi < len(on) - 3 and on[hi + 3])): hi += 1
        a, b = max(0, lo - 5) * win, min(len(x), (hi + 10) * win)
        y = x[a:b].copy()
        f = min(len(y) // 4, int(0.02 * SR)); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
        raw = (np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()
        dest = os.path.join(OUT, letter + '.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                        '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-ar', str(SR), '-b:a', '64k', dest], input=raw)
        print(letter, f'{len(y) / SR:.2f}s')
    os.remove(tmp)


main()
