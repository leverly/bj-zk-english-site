#!/usr/bin/env node
/* ==========================================================
   题库校验器
   用法：node tools/validate.mjs

   为什么需要它：
   阅读/完形/写作题最容易出的错不是「选项写错」，而是
     ① locate（原文定位句）与原文有细微出入，学生回原文找不到
     ② 同一题有两个选项都能在原文找到依据（歧义题）
     ③ 解析只说「符合文意」，没有解释错项为什么错
   这些错在页面上看不出来，只有逐条比对才能发现。
   ========================================================== */
import { PASSAGES } from '../src/data-reading.js';
import { CLOZE } from '../src/data-cloze.js';
import { WRITING } from '../src/data-writing.js';
import { QUESTIONS } from '../src/data-quiz.js';
import { QUESTIONS_2 } from '../src/data-quiz2.js';
import { GRAMMAR } from '../src/data-grammar.js';

let errors = [];
let warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

/* ---------------- 1. 阅读理解 ---------------- */
let readQ = 0, expressQ = 0;
PASSAGES.forEach((p) => {
  if (!p.passage || p.passage.length < 300) err(`${p.id}: 原文过短`);
  if (!p.intro) warn(`${p.id}: 缺 intro（学习提示）`);

  p.questions.forEach((q, i) => {
    const tag = `${p.id} 第 ${i + 1} 题`;
    readQ++;

    if (!q.options || q.options.length !== 4) err(`${tag}: 选项数不是 4`);
    if (new Set(q.options).size !== q.options.length) err(`${tag}: 选项有重复`);
    if (q.answer == null || q.answer < 0 || q.answer >= (q.options || []).length) {
      err(`${tag}: answer 越界`);
    }
    if (!q.why) err(`${tag}: 缺 why（为什么对）`);
    if (!q.trap) err(`${tag}: 缺 trap（错项分析）`);
    if (!q.locate) err(`${tag}: 缺 locate（原文定位）`);

    // locate 的每一句都必须能在原文中逐字找到
    if (q.locate && p.passage) {
      const sents = q.locate.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
      if (!sents.length) {
        // 短定位句也至少整体出现
        if (!p.passage.includes(q.locate)) err(`${tag}: locate 不在原文中`);
      }
      sents.forEach((s) => {
        if (!p.passage.includes(s)) {
          err(`${tag}: locate 片段与原文不符 → ${JSON.stringify(s.slice(0, 50))}`);
        }
      });
    }

    // 解析不能是空话
    if (q.why && q.why.length < 15) err(`${tag}: why 过于简略`);
    if (q.trap && q.trap.length < 20) err(`${tag}: trap 过于简略`);
  });

  (p.express || []).forEach((e, i) => {
    const tag = `${p.id} 阅读表达 第 ${i + 1} 题`;
    expressQ++;
    if (!e.answer) err(`${tag}: 缺 answer`);
    if (!e.accept || !e.accept.length) err(`${tag}: 缺 accept（可接受答案）`);
    if (!e.why) err(`${tag}: 缺 why`);
    if (e.accept && e.answer) {
      const norm = (s) => String(s).toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
      if (!e.accept.some((a) => norm(a) === norm(e.answer))) {
        warn(`${tag}: accept 未包含标准答案本身（判分会漏掉正确答案）`);
      }
    }
  });
});

/* ---------------- 2. 完形填空 ---------------- */
let clozeBlanks = 0;
CLOZE.forEach((c) => {
  if (!c.passage) err(`${c.id}: 缺原文`);
  if (!c.blanks || !c.blanks.length) err(`${c.id}: 缺空格`);

  const blankNums = (c.passage.match(/___\((\d+)\)___/g) || []).map((m) => Number(m.match(/\d+/)[0]));
  const definedNums = (c.blanks || []).map((b) => b.n);
  if (blankNums.length !== definedNums.length) {
    err(`${c.id}: 原文空位数(${blankNums.length}) 与 blanks 定义数(${definedNums.length}) 不一致`);
  }
  blankNums.forEach((n, i) => {
    if (n !== definedNums[i]) err(`${c.id}: 第 ${i + 1} 个空编号不连续（原文 ${n} vs 定义 ${definedNums[i]}）`);
  });

  (c.blanks || []).forEach((b) => {
    const tag = `${c.id} 第 ${b.n} 空`;
    clozeBlanks++;
    if (!b.options || b.options.length !== 4) err(`${tag}: 选项数不是 4`);
    if (new Set(b.options).size !== b.options.length) err(`${tag}: 选项重复`);
    if (b.answer == null || b.answer < 0 || b.answer >= (b.options || []).length) err(`${tag}: answer 越界`);
    if (!b.why) err(`${tag}: 缺 why`);
    if (b.why && b.why.length < 15) err(`${tag}: why 过于简略`);
  });

  if (!c.translation) warn(`${c.id}: 缺中文译文`);
});

/* ---------------- 3. 书面表达 ---------------- */
/* 页面不再展示范文（范文留给学生自己写），所以 model 字段是可选的：
   保留它是为了日后需要时能恢复，只在存在时校验词数。 */
WRITING.forEach((w) => {
  if (!w.prompt) err(`${w.id}: 缺题目要求`);
  if (!w.keyPoints || !w.keyPoints.length) err(`${w.id}: 缺必备句式`);
  if (!w.tips || !w.tips.length) err(`${w.id}: 缺评分要点`);
  if (!w.outline || !w.outline.length) warn(`${w.id}: 缺写作提纲`);

  // 范文正文词数必须落在北京卷要求区间（80–100 词，允许 5 词余量）。
  // 注意要扣掉题目已给出的开头结尾——那部分不计入学生词数。
  if (w.model) {
    let body = w.model;
    if (w.given) {
      w.given.split('\n').filter((l) => l.trim() && !l.includes('___'))
        .forEach((l) => { body = body.replace(l.trim(), ''); });
    }
    const words = body.trim().split(/\s+/).filter((x) => /[A-Za-z']/.test(x)).length;
    if (words < 75) err(`${w.id}: 范文正文仅 ${words} 词，低于 80 词要求`);
    if (words > 105) err(`${w.id}: 范文正文 ${words} 词，超出 100 词要求`);
  }
  (w.keyPoints || []).forEach((k, i) => {
    if (!k.en || !k.zh) err(`${w.id} 句式 ${i + 1}: 缺 en 或 zh`);
  });

  // 亮点句型：单篇页的「🔊 朗读」依赖它，缺了右栏就空了
  if (!w.highlights || !w.highlights.length) err(`${w.id}: 缺亮点句型`);
  (w.highlights || []).forEach((h, i) => {
    if (!h.en) err(`${w.id} 亮点句 ${i + 1}: 缺英文句子`);
    if (!h.zh) warn(`${w.id} 亮点句 ${i + 1}: 缺中文说明（朗读可用，但学生看不出为什么加分）`);
  });
  if (!w.scene) warn(`${w.id}: 缺场景说明（索引卡会退回显示题目首句）`);
});

/* ---------------- 4. 语法题 ---------------- */
const ALLQ = [...QUESTIONS, ...QUESTIONS_2];
const topicIds = new Set(GRAMMAR.flatMap((g) => g.topics.map((t) => t.id)));
const ids = new Set();
ALLQ.forEach((q) => {
  if (ids.has(q.id)) err(`语法题 id 重复: ${q.id}`);
  ids.add(q.id);
  if (!topicIds.has(q.topic)) err(`${q.id}: topic 无效 (${q.topic})`);
  if (q.type !== 'fill' && (q.answer == null || q.answer >= (q.options || []).length)) {
    err(`${q.id}: answer 越界`);
  }
  if (q.type === 'fill' && (!q.answer || !q.accept)) err(`${q.id}: 填空题缺 answer/accept`);
  if (!q.why) err(`${q.id}: 缺 why`);
});
const uncovered = [...topicIds].filter((id) => !ALLQ.some((q) => q.topic === id));
if (uncovered.length) err(`考点无题: ${uncovered.join(', ')}`);

/* ---------------- 汇总 ---------------- */
console.log('═'.repeat(60));
console.log(`阅读理解 ${PASSAGES.length} 篇 · ${readQ} 题`);
console.log(`阅读表达 ${expressQ} 题`);
console.log(`完形填空 ${CLOZE.length} 篇 · ${clozeBlanks} 空`);
console.log(`书面表达 ${WRITING.length} 题`);
console.log(`语法精练 ${ALLQ.length} 题 · ${topicIds.size} 个考点`);
console.log('═'.repeat(60));

if (warns.length) {
  console.log(`\n⚠ 提醒 ${warns.length} 条：`);
  warns.forEach((w) => console.log('  ' + w));
}
if (errors.length) {
  console.log(`\n✗ 错误 ${errors.length} 条：`);
  errors.forEach((e) => console.log('  ' + e));
  process.exitCode = 1;
} else {
  console.log('\n✓ 全部校验通过');
}
