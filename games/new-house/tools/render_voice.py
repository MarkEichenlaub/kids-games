"""Records Beep's voice with Microsoft's neural voices (edge-tts, free, no account).

Reads tools/voice-items.json (made by build-voice.mjs), records any sentence that
isn't in voice/c/ yet, trims the silence, deletes clips for sentences the game no
longer says, and writes voice/index.json. Same voice as Beep in Rocket Builders.
"""
import asyncio, json, os, subprocess, sys, tempfile

import edge_tts

VOICE, RATE = 'en-US-AvaNeural', '-4%'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'voice')
CLIPS = os.path.join(OUT, 'c')


async def record(item, sem, tmp):
    dest = os.path.join(CLIPS, item['hash'] + '.mp3')
    if os.path.exists(dest):
        return True
    async with sem:
        raw = os.path.join(tmp, item['hash'] + '.raw.mp3')
        for attempt in range(4):
            try:
                await edge_tts.Communicate(item['say'], VOICE, rate=RATE).save(raw)
                break
            except Exception as e:  # the service drops a request now and then
                if attempt == 3:
                    print('FAILED', item['say'], e, file=sys.stderr)
                    return False
                await asyncio.sleep(2 + attempt * 3)
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        # ffmpeg runs in a thread: the selector loop edge-tts needs on Windows can't start processes itself
        proc = await asyncio.to_thread(subprocess.run, ['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', trim, '-ac', '1', '-b:a', '48k', dest])
        os.remove(raw)
        return proc.returncode == 0


async def main():
    items = json.load(open(os.path.join(HERE, 'voice-items.json'), encoding='utf-8'))
    os.makedirs(CLIPS, exist_ok=True)
    todo = [i for i in items if not os.path.exists(os.path.join(CLIPS, i['hash'] + '.mp3'))]
    print(f'{len(items)} clips, {len(todo)} to record', flush=True)
    sem = asyncio.Semaphore(8)
    with tempfile.TemporaryDirectory() as tmp:
        for chunk in range(0, len(todo), 100):
            await asyncio.gather(*(record(i, sem, tmp) for i in todo[chunk:chunk + 100]))
            print(f'  {min(len(todo), chunk + 100)}/{len(todo)}', flush=True)
    wanted = {i['hash'] for i in items}
    for f in os.listdir(CLIPS):
        if f[:-4] not in wanted:
            os.remove(os.path.join(CLIPS, f))
    have = [i['hash'] for i in items if os.path.exists(os.path.join(CLIPS, i['hash'] + '.mp3'))]
    json.dump({'voice': VOICE, 'clips': have}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'))
    print(f'{len(have)} of {len(items)} clips ready')


if sys.platform == 'win32':  # aiodns (used by edge-tts) needs the selector loop on Windows
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(main())
