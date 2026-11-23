/* 导出站内所有需要朗读的文本清单，供 tools/gen_audio.py 使用。
   用法：node tools/dump_audio_texts.mjs > /tmp/audio-texts.json
   这样避免用正则去解析带转义的 JS 字面量。 */
import { WORDS } from '../src/data-words.js';
import { WRITING, WRITING_PHRASES, WRITING_STRUCTURES } from '../src/data-writing.js';

const texts = [];
const add = (t) => {
  if (typeof t === 'string' && t.trim().length > 0) texts.push(t.trim());
};

/* 1) 词库：1755 条单词与短语 */
WORDS.forEach((w) => add(w.w));

/* 2-5) 写作：范文全文 / 亮点句 / 必备句式 / 句型库 / 结构模板示例句 */
WRITING.forEach((w) => {
  add(w.model);
  (w.highlights || []).forEach((h) => add(h.en));
  (w.keyPoints || []).forEach((k) => add(k.en));
});
WRITING_PHRASES.forEach((g) => (g.items || []).forEach((it) => add(it.en)));
WRITING_STRUCTURES.forEach((s) => (s.blocks || []).forEach((b) => add(b.en)));

/* 去重保序 */
const seen = new Set();
const out = [];
for (const t of texts) {
  if (!seen.has(t)) { seen.add(t); out.push(t); }
}

process.stdout.write(JSON.stringify(out));
console.error(`共 ${out.length} 条朗读文本`);
