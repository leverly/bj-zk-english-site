"""用 Edge TTS 生成站内全部朗读音频。

输出：
  audio/<slug>.mp3      每条朗读一个 mp3（单次朗读）
  src/data-audio.js     「朗读原文 -> mp3 路径」映射，供站点查表播放

音色：en-GB-SoniaNeural（英式女声，与河北站一致），rate -10%，
mono 32 kbps —— 与单词音频同一套参数，全站听感统一。

覆盖范围（共约 1900 条）：
  1. 词库 1755 条（单词 + 短语）
  2. 8 篇写作范文全文
  3. 范文亮点句 / 必备句式
  4. 句型库 19 句
  5. 结构模板示例句
  6. 16 篇阅读理解 + 4 篇完形填空的原文（「朗读全文」用）

文本清单由 tools/dump_audio_texts.mjs 导出，避免用正则解析带转义的 JS 字面量。

用法：
  node tools/dump_audio_texts.mjs > /tmp/audio-texts.json
  /tmp/ttsenv/bin/python tools/gen_audio.py            # 增量：已有文件跳过
  /tmp/ttsenv/bin/python tools/gen_audio.py --force    # 全部重新生成
"""
import asyncio, json, os, re, sys, hashlib, subprocess
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'audio')
TEXTS_JSON = '/tmp/audio-texts.json'
VOICE = 'en-GB-SoniaNeural'
RATE = '-10%'
CONCURRENCY = 6
FORCE = '--force' in sys.argv


def text_key(t):
    """朗读文本的稳定 10 位短哈希。"""
    return hashlib.md5(t.strip().encode('utf-8')).hexdigest()[:10]


def slug(t):
    base = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:36] or 'a'
    return f'{base}-{text_key(t)[:6]}'


def compress(path):
    """压成 mono 32kbps，体积能小一半以上。"""
    tmp = path + '.tmp.mp3'
    try:
        subprocess.run(
            ['ffmpeg', '-v', 'quiet', '-y', '-i', path, '-ac', '1', '-b:a', '32k', tmp],
            check=True, timeout=120,
        )
        if os.path.getsize(tmp) > 500:
            os.replace(tmp, path)
        elif os.path.exists(tmp):
            os.remove(tmp)
    except Exception:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass


async def synth(text, path, sem):
    async with sem:
        if not FORCE and os.path.exists(path) and os.path.getsize(path) > 500:
            return 'skip'
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(text, VOICE, rate=RATE)
                buf = bytearray()
                async for ch in c.stream():
                    if ch['type'] == 'audio':
                        buf += ch['data']
                if len(buf) < 500:
                    raise RuntimeError('too small')
                with open(path, 'wb') as f:
                    f.write(buf)
                compress(path)
                return 'ok'
            except Exception as e:
                if attempt == 3:
                    return 'fail:' + type(e).__name__
                await asyncio.sleep(1.5 * (attempt + 1))


def load_texts():
    with open(TEXTS_JSON, encoding='utf-8') as f:
        data = json.load(f)
    seen, out = set(), []
    for t in data:
        k = str(t).strip()
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


async def main():
    if not os.path.exists(TEXTS_JSON):
        print(f'缺少文本清单 {TEXTS_JSON}')
        print('先运行：node tools/dump_audio_texts.mjs > /tmp/audio-texts.json')
        return 2
    texts = load_texts()
    os.makedirs(OUT, exist_ok=True)
    print(f'待生成 {len(texts)} 条朗读内容', flush=True)

    targets = [(t, os.path.join(OUT, slug(t) + '.mp3')) for t in texts]
    sem = asyncio.Semaphore(CONCURRENCY)
    t0 = asyncio.get_event_loop().time()

    done = 0
    lock = asyncio.Lock()

    async def run_one(text, path):
        nonlocal done
        r = await synth(text, path, sem)
        async with lock:
            done += 1
            if done % 100 == 0 or done == len(targets):
                el = asyncio.get_event_loop().time() - t0
                print(f'  进度 {done}/{len(targets)}  {el:.0f}s', flush=True)
        return r

    results = await asyncio.gather(*[run_one(t, p) for t, p in targets])

    ok = sum(1 for r in results if r == 'ok')
    skip = sum(1 for r in results if r == 'skip')
    fail = [(tg[0][:50], r) for tg, r in zip(targets, results) if r.startswith('fail')]
    print(f'新生成 {ok} | 跳过 {skip} | 失败 {len(fail)} | 耗时 {asyncio.get_event_loop().time()-t0:.0f}s')
    for t, r in fail[:15]:
        print('  FAIL', t, r)

    mp = {}
    for t, p in targets:
        if os.path.exists(p) and os.path.getsize(p) > 500:
            mp[t.strip()] = 'audio/' + os.path.basename(p)
    with open(os.path.join(ROOT, 'src', 'data-audio.js'), 'w', encoding='utf-8') as f:
        f.write('/* 自动生成 — tools/gen_audio.py；请勿手改 */\n')
        f.write('/* Edge TTS en-GB-SoniaNeural, rate -10%, mono 32kbps */\n')
        f.write('/* key = 朗读原文（trim 后），value = mp3 路径 */\n')
        f.write('export const AUDIO = ' + json.dumps(mp, ensure_ascii=False, separators=(',', ':')) + ';\n')
    total = sum(os.path.getsize(p) for t, p in targets if os.path.exists(p))
    print(f'音频总计 {total/1024/1024:.1f}MB，条目 {len(mp)}/{len(targets)}')
    return 0 if not fail else 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
