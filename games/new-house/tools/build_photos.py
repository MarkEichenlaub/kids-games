"""Builds the encrypted pack of real photos of the house for Our New House.

The photos never go into this public repo in the clear. The originals live in Google
Drive (SRC below) as photos/NN.jpg, numbered as in the listing. This script resizes
each one, strips its metadata, and encrypts it with AES-GCM into data/p/, using the
same family key as What's Hiding? (so a device unlocked for that game shows these too).
data/index.json only says which encrypted files belong to which room.

Usage:  python tools/build_photos.py        (prints the unlock link at the end)
"""
import base64, hashlib, io, json, os, secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
PRIVATE = os.environ.get('KIDS_GAMES_PRIVATE', r'G:\My Drive\kids-games-private')
SRC = os.path.join(PRIVATE, 'new-house', 'photos')
KEY = os.path.join(PRIVATE, 'whats-hiding', 'key.txt')
OUT = os.path.join(GAME, 'data')
URL = 'https://markeichenlaub.github.io/kids-games/games/new-house/'
LONG_SIDE, QUALITY = 1100, 74

# room id (js/map.js, plus the three neighborhood places and the two floor plans) -> listing photo numbers
ROOMS = {
    'yard': [4, 7, 5, 6], 'porch': [8], 'living': [3, 12, 9, 10, 11], 'dining': [13, 15, 14, 17], 'kitchen': [1, 2, 16, 18, 19, 20],
    'powder': [43], 'garage': [44, 45], 'courtyard': [46, 47, 48], 'alley': [49, 50], 'landing': [35], 'bedA': [36, 37], 'bedB': [38, 39, 40],
    'kidsbath': [41], 'laundry': [42], 'bigcloset': [34], 'bigbath': [31, 32, 33], 'sunhall': [21], 'primary': [22, 24, 23, 26],
    'den': [27, 29, 28, 30, 25], 'pool': [56, 55], 'play': [58, 51, 53, 57], 'park': [54, 59, 60, 52], 'plans': [61, 62],
}


def main():
    k = open(KEY).read().strip()
    aes = AESGCM(base64.urlsafe_b64decode(k + '=' * (-len(k) % 4)))
    os.makedirs(os.path.join(OUT, 'p'), exist_ok=True)
    salt = hashlib.sha256(('new-house' + k).encode()).hexdigest()
    index, made, total = {}, set(), 0
    for room, nums in ROOMS.items():
        index[room] = []
        for n in nums:
            pid = hashlib.sha256(f'{salt}:{n}'.encode()).hexdigest()[:10]
            index[room].append(pid)
            if pid in made:
                continue
            made.add(pid)
            im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f'{n:02d}.jpg'))).convert('RGB')
            s = min(1, LONG_SIDE / max(im.size))
            if s < 1:
                im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, 'JPEG', quality=QUALITY, optimize=True)  # a fresh save carries no metadata
            iv = secrets.token_bytes(12)
            blob = iv + aes.encrypt(iv, buf.getvalue(), None)
            total += len(blob)
            with open(os.path.join(OUT, 'p', pid + '.bin'), 'wb') as f:
                f.write(blob)
    for f in os.listdir(os.path.join(OUT, 'p')):
        if f[:-4] not in made:
            os.remove(os.path.join(OUT, 'p', f))
    json.dump({'probe': index['living'][0], 'rooms': index}, open(os.path.join(OUT, 'index.json'), 'w'))
    print(f'{len(made)} photos, {total / 1e6:.1f} MB encrypted')
    print('Unlock link (keep private):', URL + '#k=' + k)


main()
