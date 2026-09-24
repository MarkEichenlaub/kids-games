"""Records Beep's voice clips with Microsoft's neural voices (edge-tts, free, no account).

Reads tools/voice-items.json (made by build-voice.mjs), records any clip that
isn't in voice/c/ yet, trims the silence, and writes voice/index.json.
Change VOICE_EN and delete voice/c/ to re-record everything in another voice.
"""
import asyncio, json, os, subprocess, sys, tempfile

import edge_tts

VOICE_EN = 'en-US-AvaNeural'
VOICE_ZH = 'zh-CN-XiaoxiaoNeural'
RATE_EN, RATE_ZH = '-4%', '-15%'

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'voice')
CLIPS = os.path.join(OUT, 'c')


async def record(item, sem, tmp):
    dest = os.path.join(CLIPS, item['hash'] + '.mp3')
    if os.path.exists(dest):
        return True
    async with sem:
        raw = os.path.join(tmp, item['hash'] + '.raw.mp3')
        zh = item['voice'] == 'zh'
        for attempt in range(4):
            try:
                await edge_tts.Communicate(item['say'], VOICE_ZH if zh else VOICE_EN, rate=item.get('rate') or (RATE_ZH if zh else RATE_EN)).save(raw)
                break
            except Exception as e:  # the service drops a request now and then
                if attempt == 3:
                    print('FAILED', item['say'], e, file=sys.stderr)
                    return False
                await asyncio.sleep(2 + attempt * 3)
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        proc = await asyncio.create_subprocess_exec('ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', trim, '-ac', '1', '-b:a', '48k', dest)
        await proc.wait()
        os.remove(raw)
        return proc.returncode == 0


async def main():
    items = json.load(open(os.path.join(HERE, 'voice-items.json'), encoding='utf-8'))
    os.makedirs(CLIPS, exist_ok=True)
    todo = [i for i in items if not os.path.exists(os.path.join(CLIPS, i['hash'] + '.mp3'))]
    print(f'{len(items)} clips, {len(todo)} to record', flush=True)
    sem = asyncio.Semaphore(8)
    with tempfile.TemporaryDirectory() as tmp:
        done = 0
        for chunk in range(0, len(todo), 100):
            await asyncio.gather(*(record(i, sem, tmp) for i in todo[chunk:chunk + 100]))
            done += len(todo[chunk:chunk + 100])
            print(f'  {done}/{len(todo)}', flush=True)
    have = [i['hash'] for i in items if os.path.exists(os.path.join(CLIPS, i['hash'] + '.mp3'))]
    wanted = {i['hash'] for i in items}
    for f in os.listdir(CLIPS):  # clips for lines the game no longer says
        if f[:-4] not in wanted:
            os.remove(os.path.join(CLIPS, f))
    vars_ = json.load(open(os.path.join(HERE, 'voice-vars.json'), encoding='utf-8'))
    json.dump({'voice': VOICE_EN, 'clips': have, 'vars': vars_['vars'], 'zh': vars_['zh']},
              open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'{len(have)} clips ready')


asyncio.run(main())
