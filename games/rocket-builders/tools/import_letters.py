"""Letter names (voice/l/<LETTER>.mp3), spoken by real people, from Wikimedia Commons.

A-V and X-Z: Lingua Libre recordings by "Flame, not lame", CC0 (public domain),
  File:LL-Q1860 (eng)-Flame, not lame-<L>.wav
W: File:En-us-w.ogg by Twocs, CC BY-SA 3.0 (Wiktionary US English).
Pass the folder holding the downloaded files (A.wav ... Z.wav, W.ogg).
"""
import glob, os, subprocess, sys
import numpy as np

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voice', 'l')
SR = 24000
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(os.path.join(SRC, '*'))):
    letter = os.path.basename(f)[0].upper()
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    win = SR // 100
    e = np.sqrt((x[:len(x) // win * win].reshape(-1, win) ** 2).mean(axis=1))
    loud = np.where(e > e.max() * 0.05)[0]
    y = x[max(0, loud[0] - 4) * win:min(len(x), (loud[-1] + 8) * win)].copy()
    fd = min(len(y) // 4, int(0.02 * SR)); y[:fd] *= np.linspace(0, 1, fd); y[-fd:] *= np.linspace(1, 0, fd)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-18:TP=-2:LRA=7',
                    '-ar', str(SR), '-b:a', '64k', os.path.join(OUT, letter + '.mp3')], input=(np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    print(letter, f'{len(y) / SR:.2f}s', end='  ')
