/* ==========================================================
   北京中考领航 · 静态站点生成器
   用法：node build-site.mjs
   输出：根目录 index.html 及各页面、themes/ grammar/ 子目录
   ========================================================== */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WORDS, THEMES, STATS } from './src/data-words.js';
import { GRAMMAR, GRAMMAR_STATS } from './src/data-grammar.js';
import { QUESTIONS } from './src/data-quiz.js';
import { QUESTIONS_2 } from './src/data-quiz2.js';
import { PASSAGES } from './src/data-reading.js';
import { CLOZE } from './src/data-cloze.js';
import { WRITING, WRITING_STEPS, WRITING_STRUCTURES, WRITING_PHRASES, WRITING_TRAPS } from './src/data-writing.js';

/* 预生成的 Edge TTS 音频映射（tools/gen_audio.py 产出）。
   没有这个文件时站点仍能构建，只是发音退回浏览器语音合成。 */
let AUDIO = {};
try {
  ({ AUDIO } = await import('./src/data-audio.js'));
} catch (e) {
  AUDIO = {};
}

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = __dir;

const assetHash = (rel) => createHash('sha256').update(readFileSync(join(__dir, rel))).digest('hex').slice(0, 8);
const CSS_VER = assetHash('assets/style.css');
const JS_VER = assetHash('assets/app.js');

/* ---------------- 派生数据 ---------------- */
const WORD_BY_THEME = new Map();
THEMES.forEach((t) => WORD_BY_THEME.set(t.id, []));
WORDS.forEach((w) => (w.tp || []).forEach((id) => {
  if (WORD_BY_THEME.has(id)) WORD_BY_THEME.get(id).push(w);
}));
const THEME_SORTED = THEMES
  .map((t) => ({ ...t, n: (WORD_BY_THEME.get(t.id) || []).length }))
  .filter((t) => t.n > 0)
  .sort((a, b) => b.n - a.n);

const GT = new Map();
GRAMMAR.forEach((g) => g.topics.forEach((t) => GT.set(t.id, { ...t, family: g.name, familyId: g.id })));

const Q_BY_TOPIC = new Map();
/* 两批题库合并：第一批 160 题覆盖 57 考点，第二批 133 题补齐低频考点、
   语境化变式、语法填空改错与易混点对比。 */
const ALL_Q = [...QUESTIONS, ...QUESTIONS_2];

ALL_Q.forEach((q) => {
  if (!Q_BY_TOPIC.has(q.topic)) Q_BY_TOPIC.set(q.topic, []);
  Q_BY_TOPIC.get(q.topic).push(q);
});
const Q_MISS = [...GT.keys()].filter((id) => !Q_BY_TOPIC.has(id));

const READ_Q = PASSAGES.reduce((a, p) => a + p.questions.length, 0);
const EXPRESS_Q = PASSAGES.reduce((a, p) => a + (p.express || []).length, 0);
const CLOZE_N = CLOZE.reduce((a, c) => a + c.blanks.length, 0);
const WRITING_N = WRITING.length;
/* 学阅读板块整体规模：完形 N 篇 + 阅读 N 篇，题目数含阅读表达 */
const PASSAGE_N = PASSAGES.length + CLOZE.length;
const READING_ITEM_N = READ_Q + EXPRESS_Q + CLOZE_N;
const WRITING_PHRASE_N = WRITING_PHRASES.reduce((a, g) => a + g.items.length, 0);

/* ---------------- 阅读能力维度：构建期按题干规则推断 ----------------
   与 assets/app.js 的 SKILL_NAME 对应。推断在构建期做（而非运行时），
   好处是分类结果固定、可 grep 核对、可在校验脚本里统计分布。
   规则顺序有讲究：先判主旨/观点，再判词义猜测，最后判推理，剩余归细节。
   阅读选择题本身很少考「固定搭配 / 语法与词形」，这两类主要来自完形，
   所以此处只在题干明确问「词形 / 搭配」时才归过去，避免误判。 */
function inferSkill(stem) {
  const s = String(stem || '');
  // 主旨 / 观点 / 标题 / 写作目的
  if (/best title|main idea|mainly about|writer'?s (own )?(opinion|view|conclusion|purpose)|what is the writer'?s (opinion|view|conclusion)|purpose of (this|the) (passage|poster|notice|letter|text|email)/i.test(s)) return 'mainidea';
  // 划线词但问「说明作者态度」→ 推理；纯问词义 → 词义猜测
  if (/the underlined (word|sentence|phrase)/i.test(s) && /(shows? that|suggests? that|tells? us)/i.test(s)) return 'inference';
  if (/the underlined (word|sentence|phrase)|the sentence ["“].{0,120}means|what does ["“].{0,60}["”] mean/i.test(s)) return 'context';
  if (/^the sentence ["“]/i.test(s)) return 'context';
  // 明确考词形 / 搭配（如 "which word can replace…"、"the phrase … can be replaced by"）
  if (/which (word|phrase) (can|could) (best )?replace|can be replaced by|has the same meaning as/i.test(s)) return 'collocation';
  // 推理判断
  if (/in order to|mean by|what did .{0,50}(learn|realize|understand)|we can infer|can be inferred|implies?|probably|writer (mentions|says|uses)|why (did|do|does|are|is|must|should|can|would)|how did .{0,40}feel|what (can|could) we learn/i.test(s)) return 'inference';
  // 其余为细节定位
  return 'detail';
}

/* 给每道阅读题挂上 skill；完形用数据里逐空标注的 skill（缺失时兜底 context）。
   六项能力与河北一致：细节定位 / 推理判断 / 主旨与观点 / 上下文逻辑 / 固定搭配 / 语法与词形。 */
PASSAGES.forEach((p) => {
  p.questions.forEach((q) => { q.skill = inferSkill(q.q); });
});
CLOZE.forEach((c) => {
  c.blanks.forEach((b) => { if (!b.skill) b.skill = 'context'; });
});
const SKILL_TALLY = {};
[...PASSAGES.flatMap((p) => p.questions), ...CLOZE.flatMap((c) => c.blanks)]
  .forEach((q) => { SKILL_TALLY[q.skill] = (SKILL_TALLY[q.skill] || 0) + 1; });
const SKILL_LABEL = {
  detail: '细节定位', inference: '推理判断', mainidea: '主旨与观点',
  context: '上下文逻辑', collocation: '固定搭配', grammar: '语法与词形',
};
/* 诊断面板固定展示这 6 项（未作答的显示 0 / 0 与 0%），顺序按「读懂 → 判断 → 语言」 */
const SKILL_ORDER = ['detail', 'mainidea', 'inference', 'context', 'collocation', 'grammar'];

const Q_STATS = {
  total: ALL_Q.length,
  choice: ALL_Q.filter((q) => q.type === 'choice').length,
  correct: ALL_Q.filter((q) => q.type === 'correct').length,
  fill: ALL_Q.filter((q) => q.type === 'fill').length,
  batch1: QUESTIONS.length,
  batch2: QUESTIONS_2.length,
};

/* ---------------- 工具 ---------------- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function rich(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function write(rel, content) {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

/* ---------------- 站点标识 ---------------- */
const SITE_NAME = '北京中考领航';
const SITE_SHORT = '北京中考领航';

const NAV = [
  { href: 'index.html', label: '首页', key: 'home' },
  { href: 'quiz.html', label: '背单词', key: 'words-study' },
  { href: 'review.html', label: '练语法', key: 'grammar-drill' },
  { href: 'reading.html', label: '学阅读', key: 'reading' },
  { href: 'words.html', label: '词库', key: 'words' },
  { href: 'grammar.html', label: '语法', key: 'grammar' },
  { href: 'writing.html', label: '写作', key: 'writing' },
  { href: 'wrong.html', label: '错题本', key: 'wrong' },
  { href: 'stats.html', label: '学情档案', key: 'stats' },
];

const LOGO_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;

const LOGO_HTML = (base) => `<a class="logo" href="${base}index.html">
  <span class="logo-mark">${LOGO_SVG}</span>
  <span>${SITE_SHORT}</span>
  <span class="logo-badge">英语</span>
</a>`;

const HEADER = (base, active) => `<div class="scroll-progress"></div>
<header class="hdr">
  <div class="hdr-in">
    ${LOGO_HTML(base)}
    <nav class="hdr-nav">
      ${NAV.map((n) => `<a href="${base}${n.href}"${n.key === active ? ' class="on"' : ''}>${n.label}</a>`).join('')}
    </nav>
    <div class="hdr-tools">
      <button class="theme-btn" aria-label="切换主题">☾</button>
      <button class="menu-btn" aria-label="菜单" aria-expanded="false">☰</button>
    </div>
  </div>
</header>`;

const FOOTER = (base) => `<footer class="foot">
  <div class="foot-in">
    <div class="col">
      <div class="logo" style="margin-bottom:10px">
        <span class="logo-mark">${LOGO_SVG}</span>
        <span>${SITE_SHORT}</span>
        <span class="logo-badge">英语</span>
      </div>
      <p style="line-height:1.7;margin:0;color:var(--text-2)">面向北京中考英语的系统备考站：${STATS.total} 条课标词条、${GRAMMAR_STATS.topics} 个语法考点、${Q_STATS.total} 道语法精练，加上 ${PASSAGE_N} 篇完形与阅读，以及写作的方法与句型库。</p>
    </div>
    <div class="col">
      <h4>每日备考</h4>
      <a href="${base}quiz.html">背单词</a>
      <a href="${base}review.html">练语法</a>
      <a href="${base}reading.html">学阅读</a>
      <a href="${base}reading/cz.html">完形填空</a>
      <a href="${base}writing.html">书面表达</a>
      <a href="${base}wrong.html">错题本</a>
    </div>
    <div class="col">
      <h4>知识体系</h4>
      <a href="${base}words.html">${STATS.total} 条词表</a>
      <a href="${base}themes/index.html">主题词库</a>
      <a href="${base}grammar.html">${GRAMMAR_STATS.families} 大语法族</a>
    </div>
    <div class="col">
      <h4>数据与说明</h4>
      <a href="${base}stats.html">学情档案</a>
      <a href="${base}content.html">内容说明</a>
      <a href="${base}index.html#faq">常见问题</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>${SITE_NAME} · 对齐北京中考英语考试说明</span>
    <span>词表基于义务教育英语课程标准三级词汇 · 离线与在线均可使用</span>
  </div>
</footer>`;

/* ---------------- 数据内联 ---------------- */
const __inlineCache = new Map();
function inlineData(keys, extra, audio) {
  const ALL = { WORDS, THEMES, STATS, GRAMMAR, GRAMMAR_STATS, QUESTIONS: ALL_Q, QUESTIONS_2, PASSAGES, CLOZE, WRITING, ZK_AUDIO: AUDIO };
  const extraKeys = Object.keys(extra || {});
  /* 音频子集的缓存键必须带上内容指纹：只比条数会让「都是 1 条」的不同页面互相串数据 */
  const audioSig = audio
    ? createHash('sha1').update(JSON.stringify(audio)).digest('hex').slice(0, 12)
    : 'all';
  const id = keys.join(',') + '|' + extraKeys.join(',') + '|' + audioSig;
  if (__inlineCache.has(id)) return __inlineCache.get(id);
  const body = keys.map((k) => {
    if (!(k in ALL)) throw new Error('inlineData: unknown key ' + k);
    const val = k === 'ZK_AUDIO' && audio ? audio : ALL[k];
    return `window.ZK_DATA.${k}=${JSON.stringify(val)};`;
  }).concat(extraKeys.map((k) => `window.ZK_DATA.${k}=${JSON.stringify(extra[k])};`)).join('\n');
  const out = `<script>window.ZK_DATA=window.ZK_DATA||{};\n${body}</scr` + `ipt>`;
  __inlineCache.set(id, out);
  return out;
}

/* 只挑出这些文本对应的音频条目，避免每页都背上全量 160KB 映射 */
function audioSubset(texts) {
  const out = {};
  texts.forEach((t) => {
    const k = String(t || '').trim();
    if (k && AUDIO[k]) out[k] = AUDIO[k];
  });
  return out;
}

/* ---------------- 页面骨架 ---------------- */
function page({ base = '', active = '', title, desc = '', body, script = '', dataKeys = [], dataExtra = null, audioTexts = null }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  /* 需要发音的页面：把 ZK_AUDIO 加进内联数据；audioTexts 给了就只带这部分条目 */
  const needAudio = audioTexts !== null && Object.keys(AUDIO).length > 0;
  const keys = needAudio && !dataKeys.includes('ZK_AUDIO') ? [...dataKeys, 'ZK_AUDIO'] : dataKeys;
  const audio = needAudio ? audioSubset(audioTexts) : null;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%232563eb'/%3E%3Cstop offset='1' stop-color='%234f46e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='9' fill='url(%23g)'/%3E%3Ctext x='16' y='22' font-family='system-ui,sans-serif' font-size='14' font-weight='800' fill='%23fff' text-anchor='middle'%3E%E4%B8%AD%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/style.css?v=${CSS_VER}">
<script>try{var m=JSON.parse(localStorage.getItem('zk-theme-manual')||'null');var h=new Date().getHours();var t=(m==='light'||m==='dark')?m:((h>=19||h<6)?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){var h2=new Date().getHours();document.documentElement.setAttribute('data-theme',(h2>=19||h2<6)?'dark':'light');}</script>
</head>
<body data-base="${base}">
${HEADER(base, active)}
<main class="main">
<div class="wrap">
${body}
</div>
</main>
${FOOTER(base)}
<script src="${base}assets/app.js?v=${JS_VER}"></script>
${script ? `${inlineData(keys, dataExtra, audio)}<script>${script}</script>` : ''}
</body>
</html>`;
}

/* ==========================================================
   1. 首页
   ========================================================== */
function buildHome() {
  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>对齐《义务教育英语课程标准（2022 年版）》与北京中考英语考试说明</div>
      <h1>单词背了一轮，<br><span class="accent-word">卷面还是提不上去</span></h1>
      <p class="lede">
 问题通常不在词汇量，而在<b>词认识、句子还是读不通；句子读懂了，题还是选不对</b>。
 本站把笔试 60 分拆成<b>词汇 · 语法 · 篇章 · 写作</b>四条主线，每一块都配<b>可练的题 + 逐题解析</b>：
 阅读每题给<b>原文定位句</b>和<b>错项为什么错</b>，写作给 <b>${WRITING_N} 篇完整范文</b>逐句拆，
 练完还能按<b>六项阅读能力</b>看出自己到底弱在哪。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="quiz.html">免费开始背单词 <span aria-hidden="true">→</span></a>
        <a class="btn" href="reading.html">先看阅读解析示例</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 无需注册</span>
        <span><b>✓</b> 离线可用</span>
        <span><b>✓</b> 记录只存本地</span>
        <span><b>✓</b> 无广告</span>
      </div>
    </div>

    <div class="cockpit-card" id="today">
      <div class="cockpit-top">
        <span class="level-pill" id="cLevel">🏅 Lv.1 中考萌新 · 0 XP</span>
        <button class="countdown-pill" data-open-exam="1" id="cCountdown">📅 <span>设置中考倒计时</span></button>
      </div>
      <div class="cockpit-metrics">
        <div class="streak-box">
          <b id="tStreak">0</b>
          <span>天连学</span>
        </div>
        <div class="today-goal">
          <div class="today-goal-row">
            <span>今日词汇闯关 <b id="tWords">0</b> / <b id="tGoal">20</b> 词</span>
            <span class="today-pct" id="tPct">0%</span>
          </div>
          <div class="bar"><i id="tBar" style="width:0%"></i></div>
          <div class="cockpit-sub">
            <span id="cTarget">目标：115 分以上</span>
            <a href="stats.html" style="font-weight:600">查看学情档案 →</a>
          </div>
        </div>
      </div>
      <div class="mission-list">
        <a class="mission-item" href="quiz.html">
          <span class="mi-ico blue">🎧</span>
          <span class="mi-main"><b>词汇：按遗忘曲线背单词</b><small>先过高频核心词，答错 10 分钟后再现</small></span>
          <span class="mi-go">开始 →</span>
        </a>
        <a class="mission-item" href="review.html">
          <span class="mi-ico purple">⚡</span>
          <span class="mi-main"><b>语法：考点专项练</b><small>每天 10–20 题，专攻正确率低的薄弱考点</small></span>
          <span class="mi-go">去练 →</span>
        </a>
        <a class="mission-item" href="reading.html">
          <span class="mi-ico ok">📖</span>
          <span class="mi-main"><b>篇章：阅读 + 表达 + 完形</b><small>阅读四类分读法，完形独立成模块</small></span>
          <span class="mi-go">去读 →</span>
        </a>
        <a class="mission-item" href="wrong.html">
          <span class="mi-ico rose">🎯</span>
          <span class="mi-main"><b>复盘：清空今日错题本</b><small>错词错题自动收纳，答对即移出</small></span>
          <span class="mi-go">查看 →</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ========== 为什么背了单词还是提不上去：三个问题 → 三个机制 + 与普通题库的区别 ========== -->
<section class="section reveal" id="why">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">为什么背了单词还是提不上去</span>
      <h2>三个问题，对应三个机制</h2>
      <span class="sub">这三个问题的根源都不是「练得少」，而是练完之后只得到「对 / 错」，不知道下一步该补什么</span>
    </div>
  </div>
  <div class="sell-rows">
    <div class="sell-row">
      <div class="sell-pain">
        <span class="sell-no">01</span>
        <b>单词表过了三轮，阅读还是读得磕磕绊绊</b>
        <span class="sell-pain-sub">认识孤立的词，不等于读得懂连起来的句子</span>
      </div>
      <div class="sell-fix">
        <span class="sell-tag">按词频分档 + 遗忘曲线</span>
        <p>${STATS.total} 条词条按语料词频分<b>核心 / 中频 / 拓展</b>三档，先拿下卷面最常出现的 ${STATS.core} 个核心词。答错 10 分钟后再现，答稳了按 1 → 3 → 7 → 21 天拉长间隔，<b>不做无效重复</b>。</p>
        <a class="sell-link" href="quiz.html">开始背单词 →</a>
      </div>
    </div>
    <div class="sell-row">
      <div class="sell-pain">
        <span class="sell-no">02</span>
        <b>答案看得懂，自己再做还是选错</b>
        <span class="sell-pain-sub">「看懂了」和「会做」之间差着三层信息</span>
      </div>
      <div class="sell-fix">
        <span class="sell-tag">三层解析，不只是一个答案</span>
        <p>阅读每题给三层：<b>原文定位句</b>（能回原文逐字核对）、<b>为什么对</b>（引用定位句的关键信息）、<b>错项为什么错</b>（逐个说明是无中生有、偷换概念还是过度推断）。完形每空给<b>上下文依据</b>并附全文译文。</p>
        <a class="sell-link" href="reading.html">看一道题的完整解析 →</a>
      </div>
    </div>
    <div class="sell-row">
      <div class="sell-pain">
        <span class="sell-no">03</span>
        <b>错题记了一堆，不知道从哪补起</b>
        <span class="sell-pain-sub">「阅读差」这种结论没法执行</span>
      </div>
      <div class="sell-fix">
        <span class="sell-tag">六项能力诊断</span>
        <p>按<b>细节定位 / 主旨与观点 / 推理判断 / 上下文逻辑 / 固定搭配 / 语法与词形</b>六项统计正确率，正确率低的项自动排到最前，<b>红色项就是下一步该专攻的方向</b>。不是给结论，是给下一步动作。</p>
        <a class="sell-link" href="reading.html">看我的能力诊断 →</a>
      </div>
    </div>
  </div>

  <div class="tbl-wrap" style="margin-top:32px">
    <table class="gtable diff-table">
      <thead><tr><th style="width:20%"></th><th style="width:36%">普通题库</th><th style="width:44%">本站</th></tr></thead>
      <tbody>
        <tr><td class="diff-k">解析深度</td><td class="diff-old">给正确答案，最多一句「因为原文说了」</td><td class="diff-new"><b>三层解析：定位句 + 为什么对 + 错项为什么错</b></td></tr>
        <tr><td class="diff-k">错题</td><td class="diff-old">收集起来，自己去翻</td><td class="diff-new"><b>自动收纳 + 按遗忘曲线排期重做</b></td></tr>
        <tr><td class="diff-k">能力诊断</td><td class="diff-old">只有一个总分</td><td class="diff-new"><b>六项能力分维度正确率，指出最弱项</b></td></tr>
        <tr><td class="diff-k">写作</td><td class="diff-old">给范文让你背</td><td class="diff-new"><b>方法 + 模板 + 句型库 + ${WRITING_N} 篇范文逐句拆</b></td></tr>
        <tr><td class="diff-k">内容口径</td><td class="diff-old">通用中考题</td><td class="diff-new"><b>对齐北京卷笔试 60 分五道大题结构</b></td></tr>
      </tbody>
    </table>
  </div>
</section>

<!-- ========== 解析示例：拿一道真题讲清「三层解析」长什么样 ========== -->
<section class="section reveal" id="sample">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">解析示例 · 来自 A 篇应用文</span>
      <h2>一道题的三层解析长什么样</h2>
      <span class="sub">不是「选 A 因为原文说了」，而是能让你下次自己找到依据</span>
    </div>
    <a class="btn sm soft" href="reading/s1-a.html">进这一篇练 →</a>
  </div>
  <div class="card sample-card">
    <div class="sample-stem">To take part in the Reading Challenge, a reader must ___.</div>
    <div class="sample-layers">
      <div class="sample-layer locate">
        <span class="sample-tag">原文定位</span>
        <p>Read 6 books between July 1 and August 31. Write a short review (about 50 words) for each book.</p>
      </div>
      <div class="sample-layer why">
        <span class="sample-tag">为什么对</span>
        <p>定位句明确要求「读 6 本书」并且「每本写一篇短评」，<b>两个条件缺一不可</b>，正确项完整概括了这两个要求。</p>
      </div>
      <div class="sample-layer trap">
        <span class="sample-tag">错项分析</span>
        <p>B 把「奖品是 50 元代金券」说成「要付 50 元」，<b>方向反了</b>；C 把「6 月 30 日前报名」错成「8 月 31 日」（那是活动结束日）；D 原文从未要求必须在馆内阅读。</p>
      </div>
    </div>
  </div>
</section>

<!-- ========== 60 分地图：卷面分值 → 四条主线 → 提分优先级，三合一 ========== -->
<section class="section reveal" id="map">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">卷面地图</span>
      <h2>北京卷 100 分，本站覆盖笔试 60 分</h2>
      <span class="sub">每一块都标出对应分值、练什么、练多少；不含的部分也写清楚原因，不制造「全都包了」的错觉</span>
    </div>
  </div>
  <div class="coverage-list">
    <a class="coverage-row on" href="quiz.html">
      <span class="cv-score cv-unit-word">${STATS.total}</span>
      <span class="cv-part">词汇地基</span>
      <span class="cv-note">四条主线的第一环 · 词不认识，后面全卡住<span class="cv-own">本站：${STATS.total} 条课标词条（核心 ${STATS.core} / 中频 ${STATS.mid} / 拓展 ${STATS.ext}）+ ${STATS.phrases} 条高频短语，${THEME_SORTED.length} 个主题语境</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <a class="coverage-row on" href="review.html">
      <span class="cv-score">12</span>
      <span class="cv-part">单项填空</span>
      <span class="cv-note">卷面 12 小题 × 1 分 · 考语法规则与词汇辨析<span class="cv-own">本站：${Q_STATS.total} 道精练，覆盖全部 ${GRAMMAR_STATS.topics} 个考点 · ${GRAMMAR_STATS.families} 大语法族 ${GRAMMAR_STATS.traps} 组易错对比</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <a class="coverage-row on" href="reading/cz.html">
      <span class="cv-score">8</span>
      <span class="cv-part">完形填空</span>
      <span class="cv-note">卷面 8 小题 × 1 分 · 考语境还原与前后呼应<span class="cv-own">本站：${CLOZE.length} 篇 ${CLOZE_N} 空，每空给上下文依据 + 全文译文</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <a class="coverage-row on" href="reading/a.html">
      <span class="cv-score">26</span>
      <span class="cv-part">阅读理解</span>
      <span class="cv-note">卷面 13 小题 × 2 分 · 单题分值最高<span class="cv-own">本站：${PASSAGES.length} 篇 ${READ_Q} 题，应用文/记叙文/说明文/议论文分读法，每题三层解析</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <a class="coverage-row on" href="reading.html">
      <span class="cv-score">4</span>
      <span class="cv-part">阅读表达</span>
      <span class="cv-note">卷面 4 小题 × 1 分 · 用英文完整句作答<span class="cv-own">本站：${EXPRESS_Q} 题，按关键词组判分，容忍语序差异</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <a class="coverage-row on" href="writing.html">
      <span class="cv-score">10</span>
      <span class="cv-part">书面表达</span>
      <span class="cv-note">卷面 1 题 10 分 · 要求 80–100 词<span class="cv-own">本站：五步法 + ${WRITING_STRUCTURES.length} 类模板 + ${WRITING_PHRASE_N} 句句型库 + ${WRITING_TRAPS.length} 个失分点 + ${WRITING_N} 篇范文</span></span>
      <span class="cv-flag">✓ 已覆盖</span>
    </a>
    <div class="coverage-row off">
      <span class="cv-score">40</span>
      <span class="cv-part">听说机考</span>
      <span class="cv-note">听后选择 / 听后回答 / 听后记录并转述 / 朗读短文<span class="cv-own">需专用音频与录音评测，本站不含，建议用北京教育考试院官方体验系统练习</span></span>
      <span class="cv-flag">建议配合真题</span>
    </div>
  </div>
  <div class="coverage-total">
    <span>本站覆盖 <b>60</b> / 100 分</span>
    <span class="cv-bar"><i style="width:60%"></i></span>
    <span>60%</span>
  </div>

  <div class="section-head" style="margin-top:44px">
    <div class="section-head-left">
      <span class="kicker">提分路径</span>
      <h2>60 分不是均匀分布的</h2>
      <span class="sub">三块的性价比完全不同：送分区靠词汇，中档区靠语法与读法，高分区分在阅读推断与写作亮点上</span>
    </div>
  </div>
  <div class="tier-minis">
    <div class="tier-mini send">
      <div class="tier-mini-score">26<span>分</span></div>
      <div class="tier-mini-name">送分区 · 单词与语法基础</div>
      <div class="tier-mini-desc">单项填空 12 分 + 完形的基础空。考的是词认不认识、规则记不记得，是投入产出比最高的一块。</div>
      <div class="tier-mini-goal">目标：这一块最多丢 2 分</div>
      <div class="tier-mini-count">${STATS.total} 词条 · ${Q_STATS.total} 道语法精练</div>
    </div>
    <div class="tier-mini mid">
      <div class="tier-mini-score">24<span>分</span></div>
      <div class="tier-mini-name">中档区 · 语篇理解</div>
      <div class="tier-mini-desc">阅读理解 26 分里的细节题与词义猜测，加上阅读表达。答案都在原文里，考的是「找得快、看得准」。</div>
      <div class="tier-mini-goal">目标：细节题一题不丢</div>
      <div class="tier-mini-count">${PASSAGES.length} 篇 ${READ_Q} 题 · ${EXPRESS_Q} 道阅读表达</div>
    </div>
    <div class="tier-mini dist">
      <div class="tier-mini-score">10<span>分</span></div>
      <div class="tier-mini-name">区分区 · 写作与推断</div>
      <div class="tier-mini-desc">书面表达 10 分 + 阅读里的推理判断与主旨题。这是拉开差距的地方，也是唯一能完全由自己控制的 10 分。</div>
      <div class="tier-mini-goal">目标：写作稳在 8 分以上</div>
      <div class="tier-mini-count">${WRITING_N} 篇范文 · ${WRITING_PHRASE_N} 句句型库</div>
    </div>
  </div>
</section>

<!-- ========== 从这里开始：三步上手 + 底部 CTA ========== -->
<section class="section reveal" id="start">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">三步上手</span>
      <h2>10 分钟知道该补什么</h2>
      <span class="sub">不用先看教程，做题的过程就在采集诊断数据</span>
    </div>
  </div>
  <div class="step-minis">
    <div class="step-mini">
      <span class="step-mini-no">1</span>
      <div>
        <b>先做一组题</b>
        <p>背 20 个词，或刷 10 道语法题。不用注册，答完就有记录。</p>
        <a class="sell-link" href="quiz.html">开始背单词 →</a>
      </div>
    </div>
    <div class="step-mini">
      <span class="step-mini-no">2</span>
      <div>
        <b>看诊断说补什么</b>
        <p>六项阅读能力正确率、各语法考点正确率，最弱项自动排在最前。</p>
        <a class="sell-link" href="reading.html">看能力诊断 →</a>
      </div>
    </div>
    <div class="step-mini">
      <span class="step-mini-no">3</span>
      <div>
        <b>进专项练</b>
        <p>点最弱的考点直接出题，练完回来看正确率有没有上去。</p>
        <a class="sell-link" href="review.html">专攻最弱考点 →</a>
      </div>
    </div>
  </div>
  <div class="final-cta">
    <div>
      <b>现在就开始，第一组题不用注册</b>
      <span>记录只存你自己的浏览器，随时可导出备份</span>
    </div>
    <a class="btn primary lg" href="quiz.html">免费开始 →</a>
  </div>
</section>

<!-- ========== 边界与常见问题：边界并入 FAQ 上方，FAQ 默认全部折叠 ========== -->
<section class="section reveal" id="faq">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">边界与常见问题</span>
      <h2>本站不做什么，以及你可能想了解的</h2>
      <span class="sub">把做不到的部分写清楚，比含糊说「全都覆盖」更值得信任</span>
    </div>
  </div>
  <div class="honest-list" style="margin-bottom:26px">
    <div><b>不含听说机考 40 分</b><span>需要专用音频素材与录音评测，纯静态站做不了，建议用北京教育考试院官方体验系统。</span></div>
    <div><b>不做作文自动批改</b><span>AI 判作文一旦判错，信任就崩了。给方法、模板与范文，写完对照评分要点自查。</span></div>
    <div><b>不做视频课</b><span>只做「练」这一环，不做「讲」。想听课请配合学校老师或网课。</span></div>
    <div><b>题目为原创</b><span>按北京卷题型结构编写，不是真题搬运，避免版权问题与网络流传版本的错误。</span></div>
  </div>
  <div class="faq-list cols2">
    <details class="faq-item">
      <summary>这套系统适合几年级？北京中考英语有什么特点？</summary>
      <p>适合初中 7–9 年级、准备参加北京市初中学业水平考试（中考）的学生。北京卷最鲜明的特点是<b>「笔试 + 听说机考」两考分离</b>，英语总分 100 分里听说机考单独占 40 分，且通常有两次机会取高分——这意味着<b>笔试部分的每一分都更值钱</b>。本站把笔试 60 分的五类题型全部做成可练的题目：词汇与语法打底，完形、阅读、阅读表达、写作按题型专项突破。</p>
    </details>
    <details class="faq-item">
      <summary>听说机考 40 分为什么不包含？怎么补？</summary>
      <p>听说机考考的是<b>听音频 → 开口说</b>：听后选择、听后回答、听后记录并转述、朗读短文四节，需要专用音频素材与录音评分，本站是纯静态的文字练习站，做不了这一块，所以如实标注「不含」而不是含糊带过。补法建议两条：一是用<b>北京教育考试院官方的听说机考在线体验系统</b>熟悉机考流程与麦克风操作；二是拿近三年真题的听力材料做「听一句、跟一句」的跟读，重点练转述（听完 30 秒内把要点说全）。笔试这边把词汇与语法练扎实，听说机考的朗读和转述会明显更顺。</p>
    </details>
    <details class="faq-item">
      <summary>词表是怎么确定的？和北京用的教材对得上吗？</summary>
      <p>本站词表以《义务教育英语课程标准（2022 年版）》<b>三级词汇表</b>为基座（对应初中 7–9 年级），并单列了 ${STATS.phrases} 条中考高频短语与固定搭配。北京各区教材版本不尽相同（人教版、北师大版等均有使用），但中考词汇范围统一以课标为准，因此本站词表与任何版本教材都能对上。</p>
    </details>
    <details class="faq-item">
      <summary>阅读和写作部分的解析够细吗？会不会只给个答案？</summary>
      <p>不会只给答案。<b>阅读理解</b>每题给三层：<b>原文定位句</b>（能回原文逐字核对）、<b>为什么对</b>（引用定位句的关键信息）、<b>错项为什么错</b>（逐个说明是无中生有、偷换概念还是过度推断）。<b>完形填空</b>每空给上下文依据（前文线索 / 后文呼应 / 固定搭配），并附全文中文译文。<b>阅读表达</b>给参考答案与得分关键词。<b>书面表达</b>给 ${WRITING_N} 篇完整范文，每篇拆成四块：题目要求与已给开头、逐段写作思路、完整范文（可整篇朗读）、亮点句型逐句讲解——不是只贴一篇作文让你自己悟。</p>
    </details>
    <details class="faq-item">
      <summary>写作部分能练吗？范文该怎么用？</summary>
      <p>能练。写作是<b>唯一能完全由自己控制得分</b>的题型，所以本站把可操作的部分全给出来：<b>五步写作法</b>（审题划要点 → 定时态人称 → 搭三段框架 → 套句式写正文 → 查三样东西）、<b>${WRITING_STRUCTURES.length} 类文体的结构模板</b>（每类 5 个写作块）、<b>句型库</b>（按功能分 ${WRITING_PHRASES.length} 类共 ${WRITING_PHRASE_N} 句）、<b>${WRITING_TRAPS.length} 个高频失分点</b>，以及 <b>${WRITING_N} 篇完整高分范文</b>。<b>范文的正确用法是「先写后看」</b>：先按提纲自己写一遍，再对照范文找出自己漏了哪个要点、哪句写得比范文啰嗦，最后把范文里的亮点句跟读三遍。直接抄范文记不住任何东西，抄十篇不如自己改一篇。</p>
    </details>
    <details class="faq-item">
      <summary>孩子平时作业多，每天需要花多长时间？</summary>
      <p>建议每天 15–20 分钟：10 分钟背 20 个单词（系统自动安排到期复习 + 新词），5–10 分钟刷 10 道语法题。周末再花 20 分钟练一篇阅读或写一段短文，按自己的节奏走完一轮完整体系。</p>
    </details>
    <details class="faq-item">
      <summary>手机、iPad 和电脑都能用吗？需要下载 App 吗？</summary>
      <p>全端自适应，手机、iPad 平板和电脑浏览器打开就能直接学，无需下载安装 App，也没有弹窗广告。所有词条均可点击朗读，离线也能使用。</p>
    </details>
    <details class="faq-item">
      <summary>孩子的背词进度和错题本会丢失吗？换设备怎么办？</summary>
      <p>学习记录实时保存在当前浏览器中，离线也能用。如果需要在电脑和 iPad 之间切换，或担心清缓存丢失，可以随时在「学情档案」页点击<b>一键导出学习档案</b>，在新设备上导入即可无缝恢复。</p>
    </details>
    <details class="faq-item">
      <summary>词表和语法点是官方发布的吗？</summary>
      <p>词表基于义务教育英语课程标准三级词汇，并参考公开词典的中考标签整理；语法考点、练习题、完形与阅读篇章，以及写作方法，是按北京中考英语考试说明与北京卷真题题型编写的原创内容，不是官方出版材料。词频分档为按语料词频的启发式推断，详见<a href="content.html">内容说明</a>。</p>
    </details>
  </div>
</section>
`;

  const script = `
(function(){
  function refresh(){
    var li = ZK.levelInfo();
    var lv = document.getElementById('cLevel');
    if (lv) lv.textContent = '🏅 Lv.' + li.level + ' ' + li.name + ' · ' + li.xp + ' XP';
    var ts = document.getElementById('tStreak'); if (ts) ts.textContent = ZK.streak();
    var tw = document.getElementById('tWords'); if (tw) tw.textContent = ZK.todayWords();
    var tg = document.getElementById('tGoal'); if (tg) tg.textContent = ZK.goal();
    var tp = document.getElementById('tPct'); if (tp) tp.textContent = ZK.todayPct() + '%';
    var tb = document.getElementById('tBar'); if (tb) tb.style.width = ZK.todayPct() + '%';
    var cd = document.getElementById('cCountdown');
    var d = ZK.daysLeft();
    if (cd) {
      cd.innerHTML = d == null ? '📅 <span>设置中考倒计时</span>'
        : (d >= 0 ? '📅 距中考 <b>' + d + '</b> 天' : '📅 中考已过 <b>' + (-d) + '</b> 天');
    }
    var pf = ZK.profile();
    var ct = document.getElementById('cTarget');
    if (ct) ct.textContent = '目标：' + (pf.target || '115') + ' 分以上';
  }
  ZK.ready(refresh);
  document.addEventListener('zk:day', refresh);
  document.addEventListener('zk:known', refresh);
  document.addEventListener('zk:profile', refresh);
  document.addEventListener('zk:goal', refresh);

  // 倒计时设置弹窗
  document.querySelectorAll('[data-open-exam]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var pf = ZK.profile();
      var d = window.prompt('请输入中考日期（格式 2027-06-24）', pf.examDate || '');
      if (d === null) return;
      var t = window.prompt('目标总分（如 115）', pf.target || '115');
      if (t === null) return;
      ZK.saveProfile({ examDate: d.trim(), target: t.trim() });
      ZK.toast('已保存中考倒计时');
      refresh();
    });
  });
})();
`;
  write('index.html', page({
    title: '北京中考英语备考系统 · 笔试 60 分逐题解析',
    desc: `北京中考英语笔试 60 分全覆盖：${STATS.total} 条课标词条、${GRAMMAR_STATS.topics} 个语法考点与 ${Q_STATS.total} 道精练，${PASSAGE_N} 篇完形与阅读（${READING_ITEM_N} 题，每题给原文定位 + 为什么对 + 错项为什么错），${WRITING_N} 篇写作范文，以及六项阅读能力诊断。`,
    active: 'home',
    body, script, dataKeys: [],
  }));
}

/* ==========================================================
   2. 词库页
   ========================================================== */
function buildWords() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 词库</div>
  <h1>中考英语大纲词表</h1>
  <p class="lede">共 <b>${STATS.total}</b> 条：${STATS.words} 个单词 + ${STATS.phrases} 条高频短语。含音标、词性、中文释义，点击 🔊 听发音，右侧按钮标记掌握状态。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b data-count="${STATS.total}">${STATS.total}</b><span>词条总数</span></div>
    <div class="k"><b data-count="${STATS.core}">${STATS.core}</b><span>核心高频</span></div>
    <div class="k"><b data-count="${STATS.mid}">${STATS.mid}</b><span>中频主力</span></div>
    <div class="k"><b data-count="${STATS.phrases}">${STATS.phrases}</b><span>高频短语</span></div>
    <div class="k"><b id="kKnown">0</b><span>已掌握</span></div>
  </div>
</section>

<section class="section" style="margin-top:18px">
  <div class="word-tools">
    <input id="wq" class="field" type="search" placeholder="搜索英文单词或中文释义…" autocomplete="off">
    <div class="chips" id="wFilters">
      <button class="chip on" data-filter="all">全部</button>
      <button class="chip" data-filter="core">核心高频</button>
      <button class="chip" data-filter="mid">中频主力</button>
      <button class="chip" data-filter="ext">拓展词</button>
      <button class="chip" data-filter="phrase">短语</button>
      <button class="chip" data-filter="new">未掌握</button>
      <button class="chip" data-filter="known">已掌握</button>
    </div>
  </div>
  <div id="wlist"></div>
</section>
`;
  const script = `
ZK.ready(function(){
  ZK.renderWordList({ mount:'#wlist', words: ZK_DATA.WORDS, pageSize: 40, search:'#wq', initialFilter:'all' });
  function upd(){ var el=document.getElementById('kKnown'); if(el) el.textContent = ZK.knownCount(); }
  upd(); document.addEventListener('zk:known', upd);
});
`;
  write('words.html', page({
    title: `大纲词表 · ${STATS.total} 条`,
    desc: `北京中考英语大纲词表 ${STATS.total} 条，含音标、词性、中文释义与高频短语。`,
    active: 'words', body, script, dataKeys: ['WORDS'],
    audioTexts: WORDS.map((w) => w.w),
  }));
}

/* ==========================================================
   3. 主题索引 + 主题详情
   ========================================================== */
function buildThemes() {
  const groups = {};
  THEME_SORTED.forEach((t) => {
    groups[t.group] = groups[t.group] || [];
    groups[t.group].push(t);
  });
  const sections = Object.keys(groups).map((g) => `
  <div class="section-head" style="margin-top:34px">
    <div class="section-head-left">
      <span class="kicker">${esc(g)}</span>
      <h2>${esc(g)} 相关主题</h2>
    </div>
  </div>
  <div class="grid c3">${groups[g].map((t) => `<a class="card" href="${t.id}.html">
    <div class="card-ico">${t.icon}</div>
    <h3>${esc(t.name)}</h3>
    <div class="meta">${t.n} 个词条</div>
    <p class="desc">${esc(t.desc)}</p>
  </a>`).join('')}</div>`).join('');

  write('themes/index.html', page({
    base: '../',
    title: `${THEME_SORTED.length} 个主题词库`,
    desc: '按义务教育英语课程标准三大主题语境整理的北京中考英语主题词库。',
    active: 'words',
    body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../words.html">词库</a> / 主题</div>
  <h1>按主题语境记词 · ${THEME_SORTED.length} 个场景</h1>
  <p class="lede">新课标把词汇组织在「人与自我、人与社会、人与自然」三大主题语境下。同主题的单词常在同一篇阅读或同一道写作题里成组出现，成组记忆更容易整块联想。</p>
</div>
${sections}
<div class="note" style="margin-top:28px">注：功能词与跨场景通用词归在<a href="../words.html">全部词表</a>的「通用高频」中；部分多义词会同时出现在多个主题里。主题归类为按词义规则参考整理。</div>`,
  }));

  THEME_SORTED.forEach((t) => {
    const list = WORD_BY_THEME.get(t.id) || [];
    write(`themes/${t.id}.html`, page({
      base: '../',
      dataKeys: ['WORDS'],
      dataExtra: { THEME_WORDS: list },
      audioTexts: list.map((w) => w.w),
      title: `${t.name} · ${list.length} 个词条`,
      desc: `${t.group}主题下的北京中考英语词汇与短语。`,
      active: 'words',
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../words.html">词库</a> / <a href="index.html">主题</a> / ${esc(t.name)}</div>
  <h1>${t.icon} ${esc(t.name)}</h1>
  <p class="lede">${esc(t.desc)} 共 ${list.length} 个词条，点击 🔊 听发音。</p>
</div>
<section class="section" style="margin-top:20px">
  <div class="word-tools">
    <input id="wq" class="field" type="search" placeholder="搜索本主题内的词…" autocomplete="off">
  </div>
  <div id="wlist"></div>
</section>`,
      script: `ZK.ready(function(){ ZK.renderWordList({ mount:'#wlist', words: ZK_DATA.THEME_WORDS, pageSize: 40, search:'#wq', initialFilter:'all' }); });`,
    }));
  });
}

/* ==========================================================
   4. 背单词（SRS 闯关）
   ========================================================== */
function buildQuiz() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 背单词</div>
  <h1>听音闯关背单词</h1>
  <p class="lede">按 <b>艾宾浩斯遗忘曲线</b> 科学排期：答错 10 分钟后再现，答稳了自动拉长间隔（0.5 天 → 1 天 → 3 天 → 7 天 → 21 天+）。支持四选一与闪卡两种模式，每题自动朗读。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv" id="srsKv">
    <div class="k"><b id="kLeft">—</b><span>尚未学习</span></div>
    <div class="k"><b id="kTotal">—</b><span>已学词数（牢固 <b id="kMature" style="display:inline;font-size:1em;color:var(--ok)">0</b>）</span></div>
    <div class="k"><b id="kDue" style="color:var(--accent)">—</b><span>今日待复习</span></div>
    <div class="k"><b id="kAcc">—</b><span id="kAccSub">背词准确率</span></div>
    <div class="k"><b id="kScope">—</b><span>本范围总词量</span></div>
  </div>
</section>

<section class="section" style="margin-top:16px">
  <div class="card" style="padding:20px 24px">
    <div class="today-goal-row">
      <span>今日已背 <b id="kToday">0</b> / <b id="kGoal">50</b> 词 · 🔥 连续打卡 <b id="kStreak">0</b> 天</span>
      <span class="today-pct" id="kPct">0%</span>
    </div>
    <div class="bar"><i id="kBar" style="width:0%"></i></div>
    <div class="chips" style="margin-top:14px" id="goalChips">
      <span class="goal-label" style="margin-right:6px">每日目标</span>
      <button class="chip" data-goal="10">10 词</button>
      <button class="chip" data-goal="20">20 词</button>
      <button class="chip" data-goal="30">30 词</button>
      <button class="chip on" data-goal="50">50 词</button>
    </div>
  </div>
</section>

<section class="section" style="margin-top:26px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>开始本轮闯关</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始背单词 →</button>
        <button class="btn ghost sm" id="resetBtn">重置进度</button>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-group wide">
        <div class="kicker">词库范围</div>
        <div class="chips" id="scopeBar">
          <button class="chip on" data-s="all">全部词条 <b>${STATS.total}</b></button>
          <button class="chip" data-s="core">核心高频 <b>${STATS.core}</b></button>
          <button class="chip" data-s="mid">中频主力 <b>${STATS.mid}</b></button>
          <button class="chip" data-s="ext">拓展词 <b>${STATS.ext}</b></button>
          <button class="chip" data-s="phrase">只背短语 <b>${STATS.phrases}</b></button>
        </div>
        <p class="setup-hint" id="scopeHint">全部 ${STATS.total} 条词表与短语，覆盖最全</p>
      </div>

      <div class="setup-group">
        <div class="kicker">学习模式</div>
        <div class="chips" id="cardChips">
          <button class="chip on" data-c="choice">四选一 · 看英选义</button>
          <button class="chip" data-c="recall">闪卡 · 主动回忆</button>
        </div>
        <p class="setup-hint" id="cardHint">听音看词选中文，系统自动判分，最易上手</p>
      </div>

      <div class="setup-group">
        <div class="kicker">学习内容</div>
        <div class="chips" id="modeChips">
          <button class="chip on" data-m="mix">智能混合</button>
          <button class="chip" data-m="due">只复习到期</button>
          <button class="chip" data-m="new">只学新词</button>
        </div>
        <p class="setup-hint" id="modeHint">到期复习 + 适量新词，兼顾巩固与推进</p>
      </div>

      <div class="setup-group">
        <div class="kicker">朗读与音效</div>
        <div class="chips" id="sayChips">
          <button class="chip on" data-say="on">自动朗读</button>
          <button class="chip" data-say="off">静音（手动点 🔊）</button>
          <button class="chip on" id="sfxToggle">提示音：开</button>
        </div>
        <p class="setup-hint" id="sayHint">每题出现自动朗读两遍，耳朵眼睛一起记</p>
      </div>

      <div class="setup-group">
        <div class="kicker">本轮词数</div>
        <p class="setup-hint" style="margin-top:0">每轮出 <b id="lenEcho">50</b> 词，与上方「每日目标」保持一致</p>
      </div>
    </div>

    <div class="note setup-note">
      电脑快捷键：<b>1–4</b> 选答案、<b>空格</b>翻卡、<b>Enter</b> 下一词。答错的词会自动收进<a href="wrong.html">错题本</a>。
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none"><div id="fc"></div></section>
`;
  const script = `
const { WORDS } = window.ZK_DATA;
const Z = window.ZK;
let mode = 'mix', src = 'all', card = 'choice';
let autoSay = (function () {
  try { var v = localStorage.getItem('zk-autosay'); return v === null ? true : v === '1'; } catch (e) { return true; }
})();

function poolOf() {
  return src === 'phrase' ? WORDS.filter(w => w.t === 'phrase')
       : src === 'all' ? WORDS
       : WORDS.filter(w => w.tag === src);
}

function refreshKv() {
  const pool = poolOf();
  const all = Z.srsAll ? Z.srsAll() : {};
  const now = Date.now();
  let learned = 0, due = 0, mature = 0, left = 0;
  pool.forEach(w => {
    const r = all[w.w.toLowerCase()];
    if (!r) { left++; return; }
    learned++;
    if ((r.due || 0) <= now) due++;
    if ((r.ivl || 0) >= 21) mature++;
  });
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kScope', pool.length);
  set('#kLeft', left);
  set('#kTotal', learned);
  set('#kMature', mature);
  set('#kDue', due);

  const acc = Z.wordAccStats ? Z.wordAccStats(pool) : { answered: 0, rate: null };
  set('#kAcc', acc.rate === null ? '—' : Math.round(acc.rate * 100) + '%');
  const accSub = document.querySelector('#kAccSub');
  if (accSub) accSub.textContent = acc.answered ? '背词准确率（' + acc.answered + ' 次作答）' : '背词准确率';
  const accEl = document.querySelector('#kAcc');
  if (accEl) {
    accEl.style.color = acc.rate === null ? '' : acc.rate >= 0.8 ? 'var(--ok)' : acc.rate >= 0.6 ? 'var(--gold)' : 'var(--rose)';
  }
}
refreshKv();
document.addEventListener('zk:srs', refreshKv);

function refreshDaily() {
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kToday', Z.todayWords());
  set('#kGoal', Z.goal());
  set('#kStreak', Z.streak());
  const pct = Z.todayPct();
  set('#kPct', pct + '%');
  const bar = document.querySelector('#kBar');
  if (bar) bar.style.width = pct + '%';
  // 两侧都归一化成数字再比较，避免 goal 是字符串时高亮全灭
  const curGoal = parseInt(Z.goal(), 10);
  document.querySelectorAll('#goalChips .chip').forEach(c => {
    c.classList.toggle('on', parseInt(c.getAttribute('data-goal'), 10) === curGoal);
  });
  set('#lenEcho', Z.goal());
}
refreshDaily();
document.addEventListener('zk:day', refreshDaily);
document.addEventListener('zk:goal', refreshDaily);
document.querySelectorAll('#goalChips .chip').forEach(c => {
  c.addEventListener('click', () => {
    Z.setGoal(parseInt(c.getAttribute('data-goal'), 10));
    refreshDaily();
  });
});

function pick(sel, attr, cb) {
  document.querySelectorAll(sel + ' .chip[' + attr + ']').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll(sel + ' .chip[' + attr + ']').forEach(x => x.classList.remove('on'));
    c.classList.add('on'); cb(c.getAttribute(attr));
  }));
}
const HINTS = {
  card: {
    choice: '听音看词选中文，系统自动判分，最易上手',
    recall: '先看英文独立回想，再翻卡自评掌握程度，记忆更深刻'
  },
  mode: {
    mix: '到期复习 + 适量新词，兼顾巩固与推进',
    due: '只复习今天到期的词，专心把旧词钉牢',
    new: '只学还没背过的新词，适合周末集中抢进度'
  },
  src: {
    core: '先拿下卷面最高频的核心词，性价比最高',
    mid: '阅读与写作的核心主力词，稳步提分',
    ext: '低频拓展词，考前冲刺时再补齐',
    all: '全部词表与短语，覆盖最全',
    phrase: '高频固定搭配与短语，专攻单选与完形'
  }
};
function setHint(id, text) { const el = document.querySelector('#' + id); if (el) el.textContent = text; }

pick('#cardChips', 'data-c', v => { card = v; setHint('cardHint', HINTS.card[v]); });
pick('#modeChips', 'data-m', v => { mode = v; setHint('modeHint', HINTS.mode[v]); refreshKv(); });

document.querySelectorAll('#sayChips .chip[data-say]').forEach(c => {
  if ((c.getAttribute('data-say') === 'on') !== autoSay) c.classList.remove('on');
  else c.classList.add('on');
  c.addEventListener('click', () => {
    document.querySelectorAll('#sayChips .chip[data-say]').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    autoSay = c.getAttribute('data-say') === 'on';
    try { localStorage.setItem('zk-autosay', autoSay ? '1' : '0'); } catch (e) {}
    setHint('sayHint', autoSay ? '每题出现自动朗读两遍，耳朵眼睛一起记' : '静音模式；想听发音时点单词旁的 🔊');
  });
});

const sfxBtn = document.querySelector('#sfxToggle');
function syncSfx() {
  if (!sfxBtn) return;
  const on = Z.sfxEnabled();
  sfxBtn.classList.toggle('on', on);
  sfxBtn.textContent = on ? '提示音：开' : '提示音：关';
}
syncSfx();
if (sfxBtn) sfxBtn.addEventListener('click', () => { Z.setSfx(!Z.sfxEnabled()); syncSfx(); });

(function initScope() {
  document.querySelectorAll('#scopeBar .chip').forEach(c => {
    c.classList.toggle('on', c.getAttribute('data-s') === src);
    c.addEventListener('click', () => {
      document.querySelectorAll('#scopeBar .chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      src = c.getAttribute('data-s');
      setHint('scopeHint', HINTS.src[src]);
      refreshKv();
    });
  });
  setHint('scopeHint', HINTS.src[src]);
})();

document.querySelector('#startBtn').addEventListener('click', () => {
  document.querySelector('#setup').style.display = 'none';
  document.querySelector('#zone').style.display = '';
  Z.wordStudy({ mount: '#fc', words: poolOf(), mode, card, limit: Z.goal(), backHref: 'quiz.html', autoSay });
  const zone = document.querySelector('#zone');
  window.scrollTo({ top: Math.max(0, zone.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (confirm('确定清空所有背单词进度？此操作无法撤销。')) { Z.srsReset(); Z.clearKnown(); refreshKv(); Z.toast('已重置背单词进度'); }
});
`;
  write('quiz.html', page({
    title: '背单词 · 遗忘曲线闯关',
    desc: `用艾宾浩斯遗忘曲线背 ${STATS.total} 条北京中考英语词条，支持四选一与闪卡双模式、自动朗读。`,
    active: 'words-study', body, script, dataKeys: ['WORDS'],
    audioTexts: WORDS.map((w) => w.w),
  }));
}

/* ==========================================================
   5. 语法索引 + 语法族详情
   ========================================================== */
function buildGrammar() {
  // grammar.html 位于根目录，而语法族页面在 grammar/ 子目录下
  const cards = GRAMMAR.map((g) => `<a class="card" href="grammar/${g.id}.html">
    <div class="card-ico purple">${g.icon}</div>
    <h3>${esc(g.name)}</h3>
    <div class="meta">${g.topics.length} 个考点 · ${g.topics.reduce((s, t) => s + t.traps.length, 0)} 条易错对比</div>
    <p class="desc">${esc(g.hook)}</p>
  </a>`).join('');

  write('grammar.html', page({
    title: `语法体系 · ${GRAMMAR_STATS.families} 族 ${GRAMMAR_STATS.topics} 考点`,
    desc: `北京中考英语语法体系：${GRAMMAR_STATS.families} 大语法族、${GRAMMAR_STATS.topics} 个考点、${GRAMMAR_STATS.traps} 条中式易错对比。`,
    active: 'grammar',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 语法</div>
  <h1>中考英语语法体系</h1>
  <p class="lede">${GRAMMAR_STATS.families} 大语法族 · ${GRAMMAR_STATS.topics} 个考点 · ${GRAMMAR_STATS.traps} 条易错对比 · ${GRAMMAR_STATS.examples} 个例句。按中考考查权重排序，每个考点都可跳转专项练习。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b data-count="${GRAMMAR_STATS.families}">${GRAMMAR_STATS.families}</b><span>语法族</span></div>
    <div class="k"><b data-count="${GRAMMAR_STATS.topics}">${GRAMMAR_STATS.topics}</b><span>考点</span></div>
    <div class="k"><b data-count="${GRAMMAR_STATS.traps}">${GRAMMAR_STATS.traps}</b><span>易错对比</span></div>
    <div class="k"><b data-count="${GRAMMAR_STATS.examples}">${GRAMMAR_STATS.examples}</b><span>精选例句</span></div>
  </div>
</section>

<section class="section" style="margin-top:26px">
  <div class="grid c3">${cards}</div>
</section>

<section class="section">
  <div class="note">难度分级：<b>基础</b> 必拿分 · <b>重点</b> 高频考点 · <b>难点</b> 拉开差距。建议先扫一遍「难点」，再回头巩固「基础」，最后用<a href="review.html">考点专项练习</a>检验。</div>
</section>`,
  }));

  GRAMMAR.forEach((g) => {
    const topicsHtml = g.topics.map((t, i) => {
      const qn = (Q_BY_TOPIC.get(t.id) || []).length;
      const lvCls = t.level === '难点' ? 'lv-b2' : t.level === '重点' ? 'lv-b1' : 'lv-a2';
      const tableHtml = t.table ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr>${t.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${t.table.rows.map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>` : '';
      const exHtml = t.examples.map((e) => `<div class="ex-item">
        <div class="ex-en">${esc(e.en)}</div>
        <div class="ex-zh">${esc(e.zh)}</div>
      </div>`).join('');
      const trapHtml = t.traps.map((tr) => `<div class="trap">
        <div class="trap-t">${esc(tr.t)}</div>
        <div class="trap-row bad"><span class="mark">✕</span><span>${esc(tr.bad)}</span></div>
        <div class="trap-row good"><span class="mark">✓</span><span>${esc(tr.good)}</span></div>
        <div class="trap-why">${rich(tr.why)}</div>
      </div>`).join('');

      // 语法族页面默认全部收起，由用户自行展开要看的考点
      return `<details class="gcard">
        <summary>
          <span class="gcard-name">${esc(t.name)}</span>
          <span class="lv ${lvCls}">${esc(t.level)}</span>
          <span class="gcard-meta">${qn} 题</span>
        </summary>
        <div class="gcard-body">
          <div class="gsec">
            <div class="gsec-t">规则</div>
            <p>${rich(t.rule)}</p>
          </div>
          <div class="gsec">
            <div class="gsec-t">构成 / 形式</div>
            <div class="formula">${rich(t.form)}</div>
          </div>
          ${tableHtml}
          <div class="gsec">
            <div class="gsec-t">例句</div>
            ${exHtml}
          </div>
          <div class="gsec">
            <div class="gsec-t">中式易错避坑</div>
            ${trapHtml}
          </div>
          ${qn ? `<a class="btn primary sm" href="../review.html?topic=${t.id}">练这个考点的 ${qn} 道题 →</a>` : ''}
        </div>
      </details>`;
    }).join('');

    write(`grammar/${g.id}.html`, page({
      base: '../',
      title: `${g.name} · ${g.topics.length} 个考点`,
      desc: `${g.name}：${g.hook}`,
      active: 'grammar',
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../grammar.html">语法</a> / ${esc(g.name)}</div>
  <h1>${g.icon} ${esc(g.name)}</h1>
  <p class="lede">${esc(g.desc)}</p>
</div>
<section class="section" style="margin-top:20px">
  ${topicsHtml}
</section>
<div class="note" style="margin-top:24px">建议做法：先读规则和构成，再看例句体会用法，最后对照 ✕/✓ 错句自查。全部看完后去<a href="../review.html">练语法</a>用题目检验。</div>`,
    }));
  });
}

/* ==========================================================
   6. 练语法
   ========================================================== */
/* ==========================================================
   阅读理解页（北京卷第三、四部分，共 30 分）
   设计要点：
   - 逐题即时判分，答后展开三层解析：原文定位 → 为什么对 → 错项为什么错
   - 阅读表达用关键词组判分，避免语序差异误判
   - 每篇按 A/B/C/D 标注题型与阅读策略
   ========================================================== */
/* ==========================================================
   完形填空页（北京卷第二部分，8 分）
   ========================================================== */
/* ==========================================================
   书面表达页（北京卷第五部分，10 分）
   排版要点：
   - 表格改为「卡片式定义列表」，避免三列挤在一起
   - 方法论（五步法 / 结构模板 / 句型库 / 失分点）放在最前
   - 方法之后接 8 篇范文，每篇独立成页，拆题目 / 思路 / 范文 / 亮点 / 骨架
   ========================================================== */
function buildWriting() {
  /* ==========================================================
     书面表达：总览 + 4 个方法页 + 8 个范文页（对齐河北的索引→内容两级组织）
       writing.html             总览：三条提分线 + 4 个方法入口 + 8 篇范文 + 交卷检查
       writing/steps.html       写作五步法
       writing/structures.html  六类文体的结构模板
       writing/phrases.html     句型库（按功能分 5 类）
       writing/traps.html       六个高频失分点
       writing/w1..w8.html      8 篇完整高分范文
     ========================================================== */

  /* 范文正文词数：扣掉题目已给出的开头结尾（given 里非下划线的行），
     总览卡与单篇页都用同一个数，避免两处口径不一致。 */
  const bodyWordCount = (w) => {
    let body = w.model;
    if (w.given) {
      w.given.split(/\n/).forEach((l) => {
        const t = l.trim();
        if (t && t !== '______________________') body = body.replace(t, '');
      });
    }
    return body.split(/\s+/).filter(Boolean).length;
  };

  /* 三条提分线：对齐河北「格式 6 / 语言 6 / 亮点 3」的分值拆解思路，
     北京 10 分按同样逻辑讲——结构、语言、亮点各占一块。 */
  const WRITING_LINES = [
    {
      icon: '🏗', title: '结构先立住', share: '4 分',
      d: '三段式：第一段点题（一句话说清写什么），第二段展开（按要点或时间），第三段收束（期待 / 呼吁 / 祝愿）。有分段、有开头结尾，格式分就不会丢。',
      tip: '北京卷书面表达明确按「内容要点」给分，要点漏一条就直接降档。',
    },
    {
      icon: '✍️', title: '语言求准确', share: '4 分',
      d: '时态统一（记事用过去时，建议用现在时或 should），主谓一致，单复数正确。宁可用简单句写对，也不要用复杂句写错。',
      tip: '时态混用是最大的失分点，比单词拼错扣得更多。',
    },
    {
      icon: '✨', title: '亮点要留痕', share: '2 分',
      d: '每篇至少放 1–2 个亮点：一个定语从句或宾语从句，一个分词短语或对偶句。阅卷老师找的就是这个。',
      tip: '亮点不用多，但必须对——写错的高级句不如写对的简单句。',
    },
  ];

  /* 四个方法模块的元信息，总览页的入口卡与各子页的互相跳转都用它 */
  const MODULES = [
    {
      slug: 'steps', icon: '🪜', kicker: '方法 · 第一步',
      name: '写作五步法', title: '写作五步法：从审题到交卷',
      desc: '审题划要点 → 定时态人称 → 搭三段框架 → 套句式写正文 → 查三样东西。按这个顺序走，20 分钟能写完一篇 8 分以上的短文。',
      meta: `${WRITING_STEPS.length} 个步骤`,
    },
    {
      slug: 'structures', icon: '🏛', kicker: '方法 · 第二步',
      name: '结构模板', title: '六类文体的结构模板',
      desc: '通知、书信 / 回信、议论文 / 观点、申请信、倡议书、日记——每类给出固定的写作块与顺序。换什么题目，骨架都是这个：先背结构，再填内容。',
      meta: `${WRITING_STRUCTURES.length} 类文体`,
    },
    {
      slug: 'phrases', icon: '💬', kicker: '方法 · 第三步',
      name: '句型库', title: '句型库：按功能直接取用',
      desc: `按开头点题 / 分层连接 / 举例支撑 / 提建议 / 结尾收束分成 ${WRITING_PHRASES.length} 组，共 ${WRITING_PHRASE_N} 句。不要临场造句子，从这些背熟的句式里挑。`,
      meta: `${WRITING_PHRASES.length} 组 · ${WRITING_PHRASE_N} 句`,
    },
    {
      slug: 'traps', icon: '⚠️', kicker: '避坑',
      name: '高频失分点', title: '六个最高频的失分点',
      desc: '时态混用、第三人称单数漏 -s、可数名词忘复数、字数不足、要点漏写、全文无连接词。写完对照这张表自查，能救回 1–2 分。',
      meta: `${WRITING_TRAPS.length} 个失分点`,
    },
  ];

  const FINAL_CHECK = `<section class="section">
  <div class="card">
    <h3>📝 交卷前的最后检查</h3>
    <ol class="final-check">
      <li>题目给的 <b>3 条要点</b>，是否每条都有对应句子？</li>
      <li>全文时态是否统一？</li>
      <li>第三人称单数的动词都加 <b>-s</b> 了吗？</li>
      <li>many / some / two 后面的名词加 <b>-s</b> 了吗？</li>
      <li>每个理由前有 <b>First / Second / Besides</b> 这类连接词吗？</li>
      <li>字数够 <b>80 词</b> 了吗？</li>
    </ol>
  </div>
</section>`;

  /* 子页通用的上一页 / 下一页导航（在四个方法页之间串起来） */
  const modulePager = (idx) => {
    const prev = MODULES[idx - 1];
    const next = MODULES[idx + 1];
    return `<section class="section">
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.slug}.html">← ${esc(prev.name)}</a>` : '<span></span>'}
    <a class="btn sm soft" href="../writing.html">返回写作书面表达总览</a>
    ${next ? `<a class="btn sm" href="${next.slug}.html">${esc(next.name)} →</a>` : '<span></span>'}
  </div>
</section>`;
  };

  /* 子页通用骨架：面包屑 + 标题 + 正文 + 翻页 */
  const subPage = (idx, bodyHtml, opts = {}) => {
    const m = MODULES[idx];
    return page({
      base: '../',
      title: `${m.name} · 写作书面表达`,
      desc: opts.desc || `${m.name}：${m.desc}`,
      active: 'writing',
      dataKeys: [],
      audioTexts: opts.audioTexts || null,
      script: opts.script || '',
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../writing.html">写作书面表达</a> / ${esc(m.name)}</div>
  <h1>${m.icon} ${esc(m.title)}</h1>
  <p class="lede">${opts.lede || esc(m.desc)}</p>
</div>

${bodyHtml}

${modulePager(idx)}
`,
    });
  };

  /* ==========================================================
     总览：writing.html
     ========================================================== */
  write('writing.html', page({
    title: '写作书面表达 · 10 分',
    desc: `北京中考英语写作书面表达专项：三条提分线、写作五步法、${WRITING_STRUCTURES.length} 类结构模板、${WRITING_PHRASE_N} 句句型库、${WRITING_TRAPS.length} 个高频失分点，以及 ${WRITING_N} 篇完整高分范文。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 写作书面表达</div>
  <h1>写作书面表达</h1>
  <p class="lede">北京卷第五部分 <b>10 分</b>，通常要求 80–100 词。这是<b>唯一能完全由自己控制得分</b>的题型——只要要点写全、语言不出错，稳拿 8 分以上。下面先讲清 10 分怎么来，再用四块方法把写作拆开，最后拿 ${WRITING_N} 篇范文逐句对照。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b>10</b><span>对应分值</span></div>
    <div class="k"><b>80–100</b><span>要求词数</span></div>
    <div class="k"><b>${WRITING_STEPS.length}</b><span>写作步骤</span></div>
    <div class="k"><b>${WRITING_STRUCTURES.length}</b><span>结构模板</span></div>
    <div class="k"><b>${WRITING_PHRASE_N}</b><span>可套用句式</span></div>
    <div class="k"><b>${WRITING_N}</b><span>篇高分范文</span></div>
  </div>
</section>

<!-- ========== 三条提分线 ========== -->
<section class="section">
  <div class="card method-card">
    <div class="method-title">✍️ 书面表达的三条提分线</div>
    <p class="method-tagline">10 分里，结构与内容占 4 分，语言准确占 4 分，亮点占 2 分</p>
    <ol class="method-steps">
      ${WRITING_LINES.map((l) => `<li><b>${l.icon} ${esc(l.title)}（${esc(l.share)}）</b><span>${esc(l.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ 最常见的三类失分：① 漏掉要点（题目给的 3 点只写了 2 点，直接降档）；② 时态混乱（同一篇里过去时和现在时混用）；③ 字数不足（低于 80 词扣分，但超太多也扣，控制在 80–100 词）。</div>
  </div>
</section>

<!-- ========== 四个方法模块入口 ========== -->
<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">方法 · 共 4 块</span>
      <h2>从审题到交卷，四块方法</h2>
      <span class="sub">建议按顺序看：先学步骤，再背结构，然后攒句式，最后对照失分点自查</span>
    </div>
  </div>
  <div class="grid c2 module-cards">
    ${MODULES.map((m, i) => `<a class="card module-card" href="writing/${m.slug}.html">
      <span class="module-no">${i + 1}</span>
      <div class="module-head">
        <span class="module-ico">${m.icon}</span>
        <div>
          <span class="module-kicker">${esc(m.kicker)}</span>
          <h3>${esc(m.name)}</h3>
        </div>
      </div>
      <p class="desc">${esc(m.desc)}</p>
      <div class="module-foot"><span>${esc(m.meta)}</span><span class="module-go">进入 →</span></div>
    </a>`).join('')}
  </div>
</section>

<!-- ========== 8 篇完整范文 ========== -->
<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">再看范文</span>
      <h2>${WRITING_N} 篇完整高分范文</h2>
      <span class="sub">${WRITING.map((w) => w.type.replace('应用文·', '').replace('议论文·', '').replace('记叙文·', '')).join(' · ')} —— 每篇拆解题目要求、写作思路、完整范文、亮点句型与评分要点</span>
    </div>
  </div>
  <div class="grid c2 writing-cards">
    ${WRITING.map((w, i) => `<a class="card writing-card" href="writing/${w.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <div class="pc-top">
        <span class="card-ico gold">✎</span>
        <span class="pc-type">${esc(w.type.replace('应用文·', '').replace('议论文·', '').replace('记叙文·', ''))}</span>
        <span class="lv ${w.level === '基础' ? 'lv-base' : w.level === '难点' ? 'lv-hard' : 'lv-mid'}">${esc(w.level)}</span>
      </div>
      <h3>${esc(w.title)}</h3>
      <p class="pc-intro">${esc(w.scene)}</p>
      <div class="pc-foot"><span>正文 ${bodyWordCount(w)} 词 · ${w.highlights.length} 个句型</span><span class="pc-go">看范文 →</span></div>
    </a>`).join('')}
  </div>
  <div class="note" style="margin-top:16px">先自己按提纲写一遍，再对照范文看差距——直接抄范文记不住任何东西。范文里的每个亮点句都能朗读，跟读三遍比默读十遍有用。</div>
</section>

${FINAL_CHECK}
`,
  }));

  /* ==========================================================
     子页 1：写作五步法
     ========================================================== */
  write('writing/steps.html', subPage(0, `
<section class="section">
  <div class="step-flow">
    ${WRITING_STEPS.map((s) => `<div class="flow-item">
      <div class="flow-no">${s.n}</div>
      <div class="flow-body">
        <h4>${esc(s.t)}</h4>
        <p>${esc(s.d)}</p>
        <div class="flow-tip">💡 ${esc(s.tip)}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>⏱ 时间怎么分配（20 分钟写完一篇）</h3>
    <table class="tbl" style="margin-top:12px;table-layout:fixed;width:100%">
      <colgroup><col style="width:22%"><col><col style="width:16%"></colgroup>
      <thead><tr><th>阶段</th><th>做什么</th><th>用时</th></tr></thead>
      <tbody>
        <tr><td>审题 + 列要点</td><td>圈出题目给的 3 条要点，每条写一个中文关键词</td><td>3 分钟</td></tr>
        <tr><td>搭框架</td><td>定三段各写什么，标出时态与人称</td><td>2 分钟</td></tr>
        <tr><td>写正文</td><td>套句型库的句式，一个要点写一到两句</td><td>10 分钟</td></tr>
        <tr><td>检查</td><td>查要点齐不齐、动词形式对不对、名词单复数</td><td>5 分钟</td></tr>
      </tbody>
    </table>
    <p class="note" style="margin-top:10px">最容易犯的错是把时间全花在写正文上，最后没时间检查——而检查这 5 分钟通常能救回 1–2 分。</p>
  </div>
</section>
`));

  /* ==========================================================
     子页 2：结构模板
     ========================================================== */
  write('writing/structures.html', subPage(1, `
<section class="section">
  <div class="struct-grid">
    ${WRITING_STRUCTURES.map((s) => `<div class="card struct-card">
      <div class="struct-head">
        <span class="struct-icon">${s.icon}</span>
        <div>
          <h3>${esc(s.name)}</h3>
          <div class="struct-use">用于：${esc(s.use)}</div>
        </div>
      </div>
      <div class="struct-blocks">
        ${s.blocks.map((b, i) => `<div class="struct-block">
          <span class="sb-no">${i + 1}</span>
          <div>
            <div class="sb-label">${esc(b.label)}</div>
            <div class="sb-en">${esc(b.en)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>🧭 怎么选模板</h3>
    <p class="desc" style="margin-top:8px">看题目最后一句的<b>文体提示</b>：</p>
    <ul class="tips" style="margin-top:10px">
      <li>出现 <code>notice</code> / <code>通知</code> / 要求「告知全体同学」→ 用<b>通知</b>模板（有称呼、提示语、落款）</li>
      <li>出现 <code>letter</code> / <code>回信</code> / 有「Dear …」开头 → 用<b>书信</b>模板</li>
      <li>出现 <code>discuss</code> / <code>opinion</code> / 「谈谈你的看法」→ 用<b>议论文</b>模板</li>
      <li>出现 <code>apply</code> / <code>volunteer</code> / 「申请」→ 用<b>申请信</b>模板</li>
    </ul>
    <p class="note" style="margin-top:10px">判断错了文体，格式分先丢一半。审题时先定文体，再动笔。</p>
  </div>
</section>
`));

  /* ==========================================================
     子页 3：句型库
     ========================================================== */
  write('writing/phrases.html', subPage(2, `
<section class="section">
  <div class="phrase-bank">
    ${WRITING_PHRASES.map((g) => `<div class="card pb-card">
      <div class="pb-head">${g.icon} ${esc(g.fn)}</div>
      <div class="pb-items">
        ${g.items.map((it) => `<div class="pb-item">
          <span class="pb-en">${esc(it.en)}<button class="btn xs ghost pb-say" data-say="${esc(it.en)}" title="朗读这句">🔊</button></span>
          <span class="pb-zh">${esc(it.zh)}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>💡 怎么用这 19 句</h3>
    <ul class="tips" style="margin-top:10px">
      <li><b>不要整篇背。</b>按功能记：开头两句、连接三句、举例两句、建议两句、结尾三句，够应付所有题型。</li>
      <li><b>一句只用一个。</b>同一组里挑一句用，不要堆两句意思相同的，会显得啰嗦。</li>
      <li><b>先求对，再求高级。</b>没把握的从句不要写，用简单句把要点写全，得分反而更高。</li>
      <li><b>写作前先扫一眼。</b>动笔前花 30 秒看这页，写的时候就知道该套哪句。</li>
    </ul>
  </div>
</section>
`, {
    audioTexts: WRITING_PHRASES.flatMap((g) => g.items.map((it) => it.en)),
    script: `
document.querySelectorAll('.pb-say').forEach(function(b){
  b.addEventListener('click', function(e){
    e.stopPropagation();
    ZK.speak(b.getAttribute('data-say'));
  });
});
`,
  }));

  /* ==========================================================
     子页 4：高频失分点
     ========================================================== */
  write('writing/traps.html', subPage(3, `
<section class="section">
  <div class="trap-grid">
    ${WRITING_TRAPS.map((t) => `<div class="card wt-card">
      <div class="wt-name">✕ ${esc(t.t)}</div>
      <div class="wt-desc">${esc(t.d)}</div>
      <div class="wt-fix">✓ ${esc(t.fix)}</div>
    </div>`).join('')}
  </div>
</section>

${FINAL_CHECK}
`));

  /* ==========================================================
     8 篇范文的单篇页：writing/w1..w8.html
     左栏：题目要求 / 写作思路 / 评分要点
     右栏：完整范文（可朗读）/ 亮点句型 / 对应体裁骨架
     ========================================================== */
  WRITING.forEach((w, idx) => {
    const prev = WRITING[idx - 1];
    const next = WRITING[idx + 1];
    const genre = w.type.replace('应用文·', '').replace('议论文·', '').replace('记叙文·', '');
    const lvCls = w.level === '基础' ? 'lv-base' : w.level === '难点' ? 'lv-hard' : 'lv-mid';
    const struct = WRITING_STRUCTURES.find((s) => s.id === w.structId);
    write(`writing/${w.id}.html`, page({
      base: '../',
      title: `${w.title} · ${genre}范文`,
      desc: `${w.title}（${genre} · ${w.words}）：完整高分范文、写作思路、${w.highlights.length} 个可套用句型与评分要点。`,
      active: 'writing',
      dataKeys: [],
      audioTexts: [w.model, ...w.highlights.map((h) => h.en), ...w.keyPoints.map((k) => k.en)],
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../writing.html">写作书面表达</a> / ${esc(genre)} / 第 ${idx + 1} 篇</div>
  <h1>${esc(w.title)}</h1>
  <p class="lede">${esc(w.scene)}</p>
  <div class="chips" style="margin-top:14px">
    <span class="chip on" style="cursor:default">${esc(genre)}</span>
    <span class="chip" style="cursor:default">要求 80–100 词</span>
    <span class="chip" style="cursor:default">范文正文 ${bodyWordCount(w)} 词</span>
    <span class="lv ${lvCls}" style="margin-left:4px">${esc(w.level)}</span>
  </div>
</div>

<section class="section" style="margin-top:24px">
  <div class="wd-grid">
    <div class="wd-col">
      <div class="card" style="padding:20px 22px">
        <div class="kicker">题目要求</div>
        <p style="white-space:pre-line;margin:8px 0 0;line-height:1.9">${esc(w.prompt)}</p>
        ${w.given ? `<div class="wd-given"><span class="wd-given-label">已给出的开头 / 结尾（不计入词数）</span>${esc(w.given)}</div>` : ''}
      </div>
      <div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">写作思路</div>
        <ol class="wd-outline">${w.outline.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
      </div>
      <div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">评分要点</div>
        <ul class="wd-tips">${w.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="wd-col">
      <div class="card wd-model" style="padding:20px 22px">
        <div class="kicker" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>高分范文</span>
          <button class="btn xs soft" id="sayModel" title="朗读范文">🔊 朗读全文</button>
        </div>
        <pre class="wd-text">${esc(w.model)}</pre>
      </div>
      <div class="card wd-hl-card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">亮点句型（背下来直接用）</div>
        <div class="wd-hl">
          ${w.highlights.map((h, hi) => `<div class="wd-hl-item">
            <div class="wd-hl-en">${esc(h.en)} <button class="btn xs ghost wd-say" data-hl="${hi}" title="朗读这句">🔊</button></div>
            <div class="wd-hl-zh">${esc(h.zh)}</div>
          </div>`).join('')}
        </div>
      </div>
      ${(() => {
        /* 必备句式里去掉与亮点句型重复的条目，避免同一句出现两次 */
        const hlSet = new Set(w.highlights.map((h) => h.en.toLowerCase().trim()));
        const kp = w.keyPoints.filter((k) => !hlSet.has(k.en.toLowerCase().trim()));
        if (!kp.length) return '';
        return `<div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">必备句式（可替换进自己的作文）</div>
        <div class="wd-hl">
          ${kp.map((k) => `<div class="wd-hl-item">
            <div class="wd-hl-en">${esc(k.en)}</div>
            <div class="wd-hl-zh">${esc(k.zh)}</div>
          </div>`).join('')}
        </div>
      </div>`;
      })()}
      ${struct ? `<div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">这个体裁的三段式骨架</div>
        <div class="wd-frame">
          <div class="wd-frame-head">${struct.icon} ${esc(struct.name)}</div>
          ${struct.blocks.map((b) => `<div class="wd-frame-row"><span>${esc(b.label)}</span><span>${esc(b.en)}</span></div>`).join('')}
        </div>
        <div style="margin-top:12px"><a class="btn sm soft" href="structures.html">看完整结构模板 →</a></div>
      </div>` : ''}
    </div>
  </div>
</section>

<section class="section">
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.id}.html">← 第 ${idx} 篇</a>` : '<span></span>'}
    <a class="btn sm soft" href="../writing.html">全部 ${WRITING_N} 篇</a>
    ${next ? `<a class="btn sm" href="${next.id}.html">第 ${idx + 2} 篇 →</a>` : '<span></span>'}
  </div>
</section>
`,
      dataExtra: { WRITING_ONE: w },
      script: `
const W = window.ZK_DATA.WRITING_ONE;
const sayModel = document.getElementById('sayModel');
if (sayModel) sayModel.addEventListener('click', function () {
  ZK.speak(W.model, { rate: 0.9 });
  if (ZK.toast) ZK.toast('正在朗读范文');
});
document.querySelectorAll('.wd-say').forEach(function (b) {
  b.addEventListener('click', function () {
    var h = W.highlights[parseInt(b.getAttribute('data-hl'), 10)];
    if (h) ZK.speak(h.en);
  });
});
`,
    }));
  });
}

/* 四类文章的解题方法（每类独立成卡，放在该类型篇目之前） */
const READING_METHODS = {
  CZ: {
    name: '完形填空',
    icon: '🧩',
    tagline: '语境还原型 —— 考的是「前后呼应、词义辨析、情感线索」',
    steps: [
      { t: '先通读，不看选项', d: '花 1 分钟读完，抓住「谁、做了什么、结果如何」这条主线。不看选项时反而更容易读懂。' },
      { t: '逐空找依据', d: '每个空都要在上下文找到线索：前文交代、后文呼应、固定搭配、或情感色彩一致。找不到依据就先空着。' },
      { t: '回读查逻辑', d: '填完把全文再读一遍，检查时态、人称、褒贬是否一致。这步最容易被跳过，也最容易丢分。' },
    ],
    trap: '完形 8 个空通常覆盖动词 2–3、名词 1–2、形容词/副词 1–2、连词或介词 1、固定搭配 1。选项看着都通顺时，回原文找「谁和谁呼应」。',
  },
  A: {
    name: '应用文',
    icon: '📋',
    tagline: '信息查找型 —— 答案就在原文里，考的是「找得快、看得准」',
    steps: [
      { t: '先看题干，划出关键词', d: '不要从第一句读起。先扫题干里问的是「谁 / 什么时间 / 什么条件」，圈出关键词。' },
      { t: '带着关键词扫读原文', d: '眼睛只找那个词或它的同义表达，找到就停下来精读那一两句。' },
      { t: '警惕四类陷阱', d: '① 时间张冠李戴（把集合时间当发车时间）；② 条件互换（把 A 社团的要求安到 B）；③ 范围扩大（原文说「一种」选项说「所有」）；④ 方向反了（把「免费」说成「要付费」）。' },
    ],
    trap: 'A 篇每题 2 分，错 1 题等于丢一道写作的 1/5。信息题最忌「凭印象选」，必须回原文核对。',
  },
  B: {
    name: '记叙文',
    icon: '📖',
    tagline: '故事型 —— 考的是「谁做了什么、态度怎么变」',
    steps: [
      { t: '先抓时间线', d: '把「起初 → 后来 → 最后」三个节点找出来。记叙文的题目几乎都挂在这条线上。' },
      { t: '盯住转折词', d: 'but / however / then / suddenly 后面往往是关键：人物态度变了、事情转向了。' },
      { t: '分清「事实」与「感受」', d: '细节题问事实（几点、多少、做了什么）；主旨题问感受与收获。别把「他哭了」当成「他很生气」。' },
    ],
    trap: '主旨题的答案常常不是「表面结果」。比如「输了比赛」但主旨是「学会了跌倒后怎么做」——这类题要看结尾句。',
  },
  C: {
    name: '说明文',
    icon: '🔬',
    tagline: '科普型 —— 考的是「原因、数据、结论」',
    steps: [
      { t: '找每段的主旨句', d: '说明文段落通常第一句就是主旨。先读每段第一句，串起来就是全文框架。' },
      { t: '因果题回原文找 because', d: '问「为什么」的题，答案一定在 because / this is why / the reason is 后面。' },
      { t: '数字题直接定位', d: '百分比、年份、数量这类题，扫数字比读句子快得多。' },
      { t: '注意「旧说法 vs 新研究」', d: '科普文常先摆一个「人们以为」，再推翻它。问「以下哪个说法是错的」时，被推翻的那个就是答案。' },
    ],
    trap: '「以下哪项 NOT」这类题要看清 not / except。很多失分不是不懂，是漏看了否定词。',
  },
  D: {
    name: '议论文',
    icon: '💬',
    tagline: '观点型 —— 考的是「谁说的、作者站哪边」',
    steps: [
      { t: '先分清三种声音', d: '① 支持者的观点（Supporters say…）；② 反对者的观点（Critics say…）；③ 作者自己的观点（In my opinion / I think…）。这三者常被混考。' },
      { t: '作者观点常在让步之后', d: 'Although… / Of course… / These are serious points, but… 这些之后才是作者真正想说的。' },
      { t: '警惕绝对化选项', d: 'all / never / only / always / must 这类词几乎都是错的——议论文很少有绝对结论。' },
      { t: '注意类比句的作用', d: '作者打比方（如「不必人人学小提琴」）是为了说明道理，题目会问「为什么要提这个」。' },
    ],
    trap: 'D 篇最容易错的是「把作者观点当成他人观点」。看到 In my view / My own view 就标记下来，那是作者。',
  },
};

function buildReading() {
  /* ==========================================================
     学阅读（对齐河北项目的组织方式）：三层独立 URL
       一级 reading.html              类型索引 + 能力诊断
       二级 reading/<lv>.html         该类读法卡 + 篇目列表
       三级 reading/<篇id>.html       单篇：折叠读法 + 原文 + 一题一屏
     每篇独立成页，链接可分享、可直接打开、前进后退正常。
     ========================================================== */

  /* 把完形填空转成与阅读理解同构的数据，判分与渲染逻辑复用一套。
     完形的「空」在渲染时用 ___（n）___ 占位，题干取「第 n 空」。 */
  const CLOZE_AS_PASSAGES = CLOZE.map((c) => ({
    id: c.id,
    level: 'CZ',
    type: '完形填空',
    title: c.title,
    intro: c.intro,
    passage: c.passage,
    translation: c.translation,
    questions: c.blanks.map((b) => ({
      q: '第 (' + b.n + ') 空',
      options: b.options,
      answer: b.answer,
      why: b.why,
      locate: '',
      trap: '',
      isCloze: true,
      blankNo: b.n,
      skill: b.skill || 'context',
    })),
    express: [],
  }));

  const ALL_PASSAGES = CLOZE_AS_PASSAGES.concat(PASSAGES);
  /* 完形填空与阅读理解是两种独立题型（河北项目也是分开成两个模块），
     所以这里拆成两组：READ_LEVELS 只放阅读理解的 ABCD 四类，
     完形单独走 cloze.html 一条线。 */
  const LEVELS = ['CZ', 'A', 'B', 'C', 'D'];
  const READ_LEVELS = ['A', 'B', 'C', 'D'];
  const totalQ = ALL_PASSAGES.reduce((s, p) => s + p.questions.length, 0);
  const totalE = ALL_PASSAGES.reduce((s, p) => s + (p.express || []).length, 0);
  const totalCz = CLOZE_AS_PASSAGES.length;
  const lvList = (lv) => ALL_PASSAGES.filter((p) => p.level === lv);
  const lvQn = (lv) => lvList(lv).reduce((s, p) => s + p.questions.length + (p.express || []).length, 0);

  /* 单篇答题区：原文 + 一题一屏舞台 */
  const passageHtml = (p) => {
    const isCloze = p.level === 'CZ';
    const paras = p.passage.split('\n\n').map((x) => {
      let t = esc(x);
      if (isCloze) t = t.replace(/___\((\d+)\)___/g, '<span class="cz-blank" data-b="$1">$1</span>');
      return `<p class="passage-p">${t}</p>`;
    }).join('');

    const qCards = p.questions.map((q, qi) => {
      const opts = q.options.map((o, k) =>
        `<button class="qopt" data-k="${k}"><span class="key">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`
      ).join('');
      return `<div class="read-q" data-ans="${q.answer}" data-skill="${q.skill || 'detail'}" data-id="${p.id}-${qi + 1}" data-qi="${qi}">
        <div class="read-q-stem"><b>${isCloze ? '(' + q.blankNo + ')' : (qi + 1) + '.'}</b> ${isCloze ? '选出最合适的一项填入空位' : esc(q.q)}</div>
        <div class="qopts">${opts}</div>
        <div class="read-fb"></div>
      </div>`;
    }).join('');

    const expressCards = (p.express || []).map((e, ei) => `
      <div class="express-q" data-id="${p.id}-e${ei + 1}" data-qi="${p.questions.length + ei}" data-skill="detail">
        <div class="read-q-stem"><b>表达 ${ei + 1}.</b> ${esc(e.q)}</div>
        <div class="qfill">
          <input class="field express-in" type="text" placeholder="用英文作答，按 Enter 提交" autocomplete="off" spellcheck="false">
          <button class="btn primary sm express-sub">提交</button>
        </div>
        <div class="read-fb"></div>
      </div>`).join('');

    const totalItems = p.questions.length + (p.express || []).length;
    const m = READING_METHODS[p.level];

    return `<div class="card article-card reading-stage" id="${p.id}">
      <div class="article-head">
        <div>
          <h3>${esc(p.title)}</h3>
          <div class="meta">${p.level} 篇 · ${m.name} · ${totalItems} 题</div>
        </div>
        <button class="btn xs ghost fold-btn" type="button">收起原文</button>
      </div>

      <div class="note strategy">${esc(p.intro)}</div>

      <div class="passage-wrap">
        <div class="passage">${paras}</div>
        ${p.translation ? `<div class="cz-trans-wrap">
          <button class="btn soft sm" type="button" data-toggle-trans>显示中文译文</button>
          <div class="trans" hidden>${p.translation.split('\n\n').map((x) => `<p>${esc(x)}</p>`).join('')}</div>
        </div>` : ''}
      </div>

      <div class="quiz-stage">
        <div class="stage-bar">
          <span class="stage-progress-text">第 <b class="stage-cur">1</b> / ${totalItems} 题</span>
          <div class="stage-dots">${Array.from({ length: totalItems }, (_, i) => `<i data-dot="${i}"></i>`).join('')}</div>
          <span class="stage-score">得分 <b>0</b> / ${totalItems}</span>
        </div>

        <div class="stage-body">
          ${qCards}
          ${expressCards}
        </div>

        <div class="stage-nav">
          <button class="btn ghost sm stage-prev" type="button">← 上一题</button>
          <button class="btn primary sm stage-next" type="button">下一题 →</button>
        </div>
      </div>
    </div>`;
  };

  /* 单篇答题脚本：判分 + 能力维度记录 + 译文/折叠 */
  const readingScript = `
ZK.ready(function(){
  var P = window.ZK;

  /* 一题一屏的舞台控制 */
  document.querySelectorAll('.reading-stage').forEach(function(card){
    var items = [].slice.call(card.querySelectorAll('.read-q, .express-q'));
    var cur = 0;
    var curEl = card.querySelector('.stage-cur');
    var dots = [].slice.call(card.querySelectorAll('.stage-dots i'));
    var scoreEl = card.querySelector('.stage-score b');
    var prevBtn = card.querySelector('.stage-prev');
    var nextBtn = card.querySelector('.stage-next');

    function show(i){
      cur = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function(el, k){ el.style.display = (k === cur) ? '' : 'none'; });
      if (curEl) curEl.textContent = cur + 1;
      dots.forEach(function(d, k){ d.classList.toggle('on', k === cur); d.classList.toggle('done', !!items[k].__done); });
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === items.length - 1;
      nextBtn.textContent = cur === items.length - 1 ? '已是最后一题' : '下一题 →';
    }
    function updateScore(){
      var ok = 0;
      items.forEach(function(el){
        if (!el.__done) return;
        if (el.classList.contains('express-q')) {
          if (el.querySelector('.express-in.right')) ok++;
        } else if (!el.querySelector('.qopt.wrong')) ok++;
      });
      if (scoreEl) scoreEl.textContent = ok;
      dots.forEach(function(d, k){ d.classList.toggle('done', !!items[k].__done); });
    }
    prevBtn.addEventListener('click', function(){ show(cur - 1); });
    nextBtn.addEventListener('click', function(){ show(cur + 1); });
    card.__show = show;
    card.__updateScore = updateScore;
    show(0);
  });

  /* 选择题判分：记录到能力维度（skill），不再记到语法考点 */
  document.querySelectorAll('.read-q').forEach(function(item){
    var ans = parseInt(item.getAttribute('data-ans'), 10);
    var skill = item.getAttribute('data-skill') || 'detail';
    var card = item.closest('.reading-stage');
    item.querySelectorAll('.qopt').forEach(function(b){
      b.addEventListener('click', function(){
        if (item.__done) return;
        item.__done = true;
        var k = parseInt(b.getAttribute('data-k'), 10);
        var ok = k === ans;
        item.querySelectorAll('.qopt').forEach(function(x){
          var xi = parseInt(x.getAttribute('data-k'), 10);
          x.classList.add('locked');
          if (xi === ans) x.classList.add('right');
          else if (xi === k) x.classList.add('wrong');
        });
        var pid = card.id, qidx = parseInt(item.getAttribute('data-id').split('-').pop(), 10) - 1;
        var passage = (window.ZK_DATA.READ_ALL || window.ZK_DATA.PASSAGES || []).find(function(p){ return p.id === pid; });
        var q = passage && passage.questions[qidx];
        var fb = item.querySelector('.read-fb');
        var html = '<div class="feedback ' + (ok ? 'auto-next' : 'bad') + '">';
        html += '<b>' + (ok ? '✓ 正确' : '✕ 正确答案是 ' + 'ABCD'[ans]) + '</b>';
        if (q) {
          html += '<div class="explain">';
          if (q.locate) html += '<div class="exp-row exp-locate"><span class="exp-tag">原文定位</span><span>' + P.esc(q.locate) + '</span></div>';
          html += '<div class="exp-row exp-why"><span class="exp-tag">' + (q.isCloze ? '上下文依据' : '为什么对') + '</span><span>' + P.esc(q.why) + '</span></div>';
          if (q.trap) html += '<div class="exp-row exp-trap"><span class="exp-tag">错项分析</span><span>' + P.esc(q.trap) + '</span></div>';
          html += '</div>';
        }
        html += '</div>';
        fb.innerHTML = html;
        P.sfx(ok ? 'ok' : 'bad');
        P.bumpDay('questions', 1);
        P.pRecord(skill, ok, pid + '-' + (qidx + 1));
        if (card && card.__updateScore) card.__updateScore();
      });
    });
  });

  /* 阅读表达判分 */
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[.,!?;:"]/g, '')
      .replace(/\\s+/g, ' ')
      .trim();
  }
  function checkExpress(val, accept) {
    var v = norm(val);
    if (!v) return false;
    return accept.some(function(a){
      var na = norm(a);
      if (!na) return false;
      return v === na || v.indexOf(na) >= 0 || (na.indexOf(v) >= 0 && v.length >= na.length * 0.6);
    });
  }
  document.querySelectorAll('.express-q').forEach(function(item){
    var card = item.closest('.reading-stage');
    var eidx0 = parseInt(item.getAttribute('data-id').split('-e').pop(), 10) - 1;
    var pass0 = (window.ZK_DATA.READ_ALL || window.ZK_DATA.PASSAGES || []).find(function(p){ return p.id === card.id; });
    var accept = (pass0 && pass0.express && pass0.express[eidx0] && pass0.express[eidx0].accept) || [];
    var inp = item.querySelector('.express-in');
    var submit = function(){
      if (item.__done) return;
      item.__done = true;
      var ok = checkExpress(inp.value, accept);
      inp.classList.add(ok ? 'right' : 'wrong');
      inp.readOnly = true;
      item.querySelector('.express-sub').disabled = true;
      var fb = item.querySelector('.read-fb');
      var eidx = eidx0;
      var e = pass0 && pass0.express && pass0.express[eidx];
      var html = '<div class="feedback ' + (ok ? 'auto-next' : 'bad') + '">';
      html += '<b>' + (ok ? '✓ 正确' : '✕ 参考答案') + '</b>';
      if (e) {
        if (!ok) html += '<div class="ref-answer">' + P.esc(e.answer) + '</div>';
        html += '<div class="explain"><div class="exp-row exp-why"><span class="exp-tag">依据</span><span>' + P.esc(e.why) + '</span></div></div>';
      }
      html += '</div>';
      fb.innerHTML = html;
      P.sfx(ok ? 'ok' : 'bad');
      P.bumpDay('questions', 1);
      /* 阅读表达只计能力维度，不写错题本——脱离原文没法单独复习。
         考的是「定位原文 + 转述」，归细节定位。 */
      P.pRecord(item.getAttribute('data-skill') || 'detail', ok, card.id + '-e' + (eidx + 1));
      if (card && card.__updateScore) card.__updateScore();
    };
    item.querySelector('.express-sub').addEventListener('click', submit);
    inp.addEventListener('keydown', function(ev){ if (ev.key === 'Enter') submit(); });
  });

  /* 完形译文切换 */
  document.querySelectorAll('[data-toggle-trans]').forEach(function(b){
    b.addEventListener('click', function(){
      var box = b.parentElement.querySelector('.trans');
      if (!box) return;
      box.hidden = !box.hidden;
      b.textContent = box.hidden ? '显示中文译文' : '隐藏中文译文';
    });
  });

  /* 折叠原文（二刷用） */
  document.querySelectorAll('.reading-stage').forEach(function(card){
    var btn = card.querySelector('.fold-btn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      var pw = card.querySelector('.passage-wrap');
      var hidden = pw.style.display === 'none';
      pw.style.display = hidden ? '' : 'none';
      btn.textContent = hidden ? '收起原文' : '展开原文';
    });
  });
});
`;

  /* ==========================================================
     一级：reading.html —— 类型索引 + 能力诊断
     ========================================================== */
  /* 阅读理解：ABCD 四类（不含完形） */
  const levelCards = READ_LEVELS.map((lv) => {
    const m = READING_METHODS[lv];
    const list = lvList(lv);
    const qn = lvQn(lv);
    return `<a class="card level-card" href="reading/${lv.toLowerCase()}.html">
      <div class="level-badge">${lv}</div>
      <h3>${m.icon} ${esc(m.name)}</h3>
      <p class="desc">${esc(m.tagline)}</p>
      <div class="meta">${list.length} 篇 · ${qn} 题</div>
      <span class="level-go">进入 →</span>
    </a>`;
  }).join('');

  write('reading.html', page({
    title: '整篇理解学阅读 · 完形 + 阅读理解 + 阅读表达 · 38 分',
    desc: `北京中考英语整篇理解学阅读：${CLOZE.length} 篇完形（${CLOZE_N} 空）、${PASSAGES.length} 篇阅读理解（${READ_Q} 题）、${EXPRESS_Q} 道阅读表达，共 38 分。完形与四类阅读各有读法，每题给原文定位与错项分析。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head reader-head">
  <div class="crumb"><a href="index.html">首页</a> / 整篇理解学阅读</div>
  <h1>整篇理解学阅读</h1>
  <p class="lede">北京卷阅读板块合计 <b>38 分</b>：完形填空 <b>8 分</b>（第二部分）、阅读理解 <b>26 分</b>（第三部分）、阅读表达 <b>4 分</b>（第四部分）。<b>完形填空与阅读理解是两种不同的读法</b>——完形考上下文还原，阅读考信息查找与观点判断，所以分开放、各有策略卡。<br><span style="color:var(--text-3);font-size:.92em">建议顺序：先练完形（8 空 8 分，单空分值低但最容易连错），再攻阅读理解（26 分，单块最大）。</span></p>
</div>

<section class="section reader-stats" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b>${CLOZE.length}</b><span>完形填空（${CLOZE_N} 空）</span></div>
    <div class="k"><b>${PASSAGES.length}</b><span>阅读理解（${READ_Q} 题）</span></div>
    <div class="k"><b>${EXPRESS_Q}</b><span>阅读表达</span></div>
    <div class="k"><b>38</b><span>对应分值</span></div>
  </div>
</section>

<section class="section">
  <a class="cz-entry" href="reading/cz.html">
    <span class="cz-entry-ico">🧩</span>
    <span class="cz-entry-body">
      <span class="kicker">完形填空 · 独立题型 · 北京卷第二部分 8 分</span>
      <span class="cz-entry-title">完形填空：考上下文，不考单句</span>
      <span class="cz-entry-desc">${CLOZE.length} 篇 ${CLOZE_N} 空。每篇 8 空，先通读全文再逐空选择，每空给上下文依据并附全文译文——和阅读理解是两种不同的读法。</span>
    </span>
    <span class="cz-entry-go">进入完形填空 <span aria-hidden="true">→</span></span>
  </a>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">阅读理解 · 四类文章</span>
      <h2>四类文章，四种读法</h2>
      <span class="sub">共 ${PASSAGES.length} 篇 ${READ_Q} 题，每类 ${PASSAGES.length / 4} 篇。先看读法，再练篇章</span>
    </div>
  </div>
  <div class="grid c4 level-cards">${levelCards}</div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">能力维度</span>
      <h2>六项能力，各有练法</h2>
      <span class="sub">前三项靠阅读理解练，后三项靠完形填空练。你的六项正确率见<a href="stats.html" style="font-weight:600">学情档案</a></span>
    </div>
  </div>
  <div class="grid c3">
    <div class="card">
      <div class="card-ico">🎯</div>
      <h3>细节定位 · ${SKILL_TALLY.detail || 0} 题</h3>
      <p class="desc">答案就在原文里，考「找得快、看得准」。A 篇应用文基本全是这类题，做错多半是没回原文核对。</p>
      <div class="meta" style="margin-top:12px">重点：A 篇 · 圈关键词后扫读</div>
    </div>
    <div class="card">
      <div class="card-ico gold">📌</div>
      <h3>主旨与观点 · ${SKILL_TALLY.mainidea || 0} 题</h3>
      <p class="desc">问标题、中心思想、作者立场。C 说明文看每段首句，D 议论文要分清「支持者说、反对者说、作者说」三种声音。</p>
      <div class="meta" style="margin-top:12px">重点：C / D 篇 · 看首末段</div>
    </div>
    <div class="card">
      <div class="card-ico purple">🧠</div>
      <h3>推理判断 · ${SKILL_TALLY.inference || 0} 题</h3>
      <p class="desc">答案不在字面上，要从原文推一步。B 记叙文问「为什么、学到了什么」，D 议论文问「作者为什么提这个」都属此类。</p>
      <div class="meta" style="margin-top:12px">重点：B / D 篇 · 依据必须在原文</div>
    </div>
    <div class="card">
      <div class="card-ico ok">🔗</div>
      <h3>上下文逻辑 · ${SKILL_TALLY.context || 0} 题</h3>
      <p class="desc">完形填空的主力：靠前文线索、后文呼应、情感色彩一致来还原。空与空之间常互相提示，必须通读全文再回填。</p>
      <div class="meta" style="margin-top:12px">重点：完形 · 先通读抓主线</div>
    </div>
    <div class="card">
      <div class="card-ico rose">🧩</div>
      <h3>固定搭配 · ${SKILL_TALLY.collocation || 0} 题</h3>
      <p class="desc">考动词短语、介词搭配、习语固定用法（如 pass on / spend time doing）。只能靠积累，选项往往四项语法都对，只差搭配。</p>
      <div class="meta" style="margin-top:12px">重点：完形 · 记整块短语</div>
    </div>
    <div class="card">
      <div class="card-ico">📐</div>
      <h3>语法与词形 · ${SKILL_TALLY.grammar || 0} 题</h3>
      <p class="desc">代词指代、反身代词、冠词、限定词等词形选择（如 his / themselves / no）。规则清楚，但要结合句子成分判断。</p>
      <div class="meta" style="margin-top:12px">重点：完形 · 回看语法族</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>⏱ 应试提醒</h3>
    <p class="desc" style="margin-top:8px">阅读理解每题 2 分，是笔试单题分值最高的题型。做完必须回到原文核对：<b>细节题</b>找到定位句再选；<b>推理题</b>确认依据在原文（不能凭常识）；<b>主旨题</b>看首末段与每段首句；<b>词义猜测题</b>看上下文同义或反义线索。阅读表达必须用<b>完整英文句子</b>作答，只写关键词会扣分。</p>
  </div>
</section>
`,
  }));

  /* ==========================================================
     二级：reading/<lv>.html —— 该类读法 + 篇目列表
     ========================================================== */
  READ_LEVELS.forEach((lv) => {
    const m = READING_METHODS[lv];
    const list = lvList(lv);
    const slug = lv.toLowerCase();
    const otherLevels = READ_LEVELS.filter((x) => x !== lv);

    const cards = list.map((p, i) => {
      const total = p.questions.length + (p.express || []).length;
      return `<a class="card passage-card" href="${p.id}.html">
        <span class="passage-no">第 ${i + 1} 篇</span>
        <h3>${esc(p.title)}</h3>
        <p class="desc">${esc(p.intro)}</p>
        <div class="meta">${p.questions.length} 题${(p.express || []).length ? ' + 阅读表达 ' + p.express.length : ''} · 共 ${total} 题</div>
        <span class="level-go">开始练习 →</span>
      </a>`;
    }).join('');

    write(`reading/${slug}.html`, page({
      base: '../',
      title: `${lv} 篇 · ${m.name} · 学阅读`,
      desc: `${m.name}专项：${m.tagline}。共 ${list.length} 篇 ${lvQn(lv)} 题，含三步读法与陷阱提示。`,
      active: 'reading',
      dataKeys: [],
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / ${lv} 篇</div>
  <h1>${m.icon} ${esc(m.name)}</h1>
  <p class="lede">${esc(m.tagline)}</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card method-card">
    <div class="method-title">${m.icon} ${esc(m.name)}的读法</div>
    <p class="method-tagline">${esc(m.tagline)}</p>
    <ol class="method-steps">
      ${m.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(m.trap)}</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">${lv} 篇 · 共 ${list.length} 篇 ${lvQn(lv)} 题</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">每篇先读原文再答题，每题给原文定位 + 为什么对 + 错项分析</span>
    </div>
  </div>
  <div class="grid c2 passage-cards">${cards}</div>
</section>

<section class="section">
  <div class="gfam-pager">
    <a class="btn sm soft" href="../reading.html">← 返回整篇理解学阅读</a>
    <span>${otherLevels.map((x) => `<a class="btn sm" href="${x.toLowerCase()}.html">${x} ${esc(READING_METHODS[x].name)}</a>`).join(' ')}<a class="btn sm" href="cz.html">完形填空</a></span>
  </div>
</section>
`,
    }));
  });

  /* ==========================================================
     三级：reading/<篇id>.html —— 单篇练习（独立 URL）
     ========================================================== */
  READ_LEVELS.forEach((lv) => {
    const m = READING_METHODS[lv];
    const list = lvList(lv);
    const slug = lv.toLowerCase();

    list.forEach((p, idx) => {
      const prev = list[idx - 1];
      const next = list[idx + 1];
      const total = p.questions.length + (p.express || []).length;

      write(`reading/${p.id}.html`, page({
        base: '../',
        title: `${p.title} · ${lv} ${m.name}`,
        desc: `${p.title}（${m.name} · ${total} 题）：先读原文再逐题作答，每题给原文定位、为什么对与错项分析。`,
        active: 'reading',
        dataKeys: ['PASSAGES'],
        dataExtra: { READ_ALL: ALL_PASSAGES },
        body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / <a href="${slug}.html">${lv} ${esc(m.name)}</a> / 第 ${idx + 1} 篇</div>
  <h1>${esc(p.title)}</h1>
  <p class="lede">${esc(p.intro)}</p>
</div>

<section class="section" style="margin-top:18px">
  <details class="method-fold">
    <summary>${m.icon} ${esc(m.name)}的读法（点开复习）</summary>
    <ol class="method-steps">
      ${m.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(m.trap)}</div>
  </details>
</section>

<section class="section">
  ${passageHtml(p)}
</section>

<section class="section">
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.id}.html">← 上一篇</a>` : '<span></span>'}
    <a class="btn sm soft" href="${slug}.html">全部 ${list.length} 篇</a>
    ${next ? `<a class="btn sm" href="${next.id}.html">下一篇 →</a>` : '<span></span>'}
  </div>
</section>
`,
        script: readingScript,
      }));
    });
  });

  /* ==========================================================
     完形填空：独立模块（不与 ABCD 混排）
       二级 reading/cz.html        读法卡 + 篇目列表
       三级 reading/cloze-N.html   单篇练习
     ========================================================== */
  const czm = READING_METHODS.CZ;
  const czList = lvList('CZ');

  const czCards = czList.map((p, i) => `
    <a class="card passage-card" href="${p.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <h3>${esc(p.title)}</h3>
      <p class="desc">${esc(p.intro)}</p>
      <div class="meta">${p.questions.length} 空 · ${esc(p.type || '完形填空')}</div>
      <span class="level-go">开始练习 →</span>
    </a>`).join('');

  write('reading/cz.html', page({
    base: '../',
    title: '完形填空 · 8 分 · 学阅读',
    desc: `北京中考英语完形填空专项：${CLOZE.length} 篇 ${CLOZE_N} 空。先通读全文再逐空选择，考上下文逻辑，每空给依据并附全文译文。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / 完形填空</div>
  <h1>🧩 完形填空</h1>
  <p class="lede">北京卷第二部分 <b>8 空 8 分</b>。考的不是单句语法，而是<b>上下文逻辑</b>——前后呼应、词汇复现、情感线索。它和阅读理解是两种不同的读法：阅读是「找信息、辨观点」，完形是「还原一篇被挖空的文章」。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b>${CLOZE.length}</b><span>篇目</span></div>
    <div class="k"><b>${CLOZE_N}</b><span>空格总数</span></div>
    <div class="k"><b>8</b><span>对应分值</span></div>
    <div class="k"><b>1</b><span>每空分值</span></div>
  </div>
</section>

<section class="section">
  <div class="card method-card">
    <div class="method-title">🧩 完形填空的读法</div>
    <p class="method-tagline">${esc(czm.tagline)}</p>
    <ol class="method-steps">
      ${czm.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(czm.trap)}</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">共 ${czList.length} 篇 ${CLOZE_N} 空</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">答题时原文里的空位编号可回看，每空给上下文依据，附全文中文译文</span>
    </div>
  </div>
  <div class="grid c2 passage-cards">${czCards}</div>
</section>

<section class="section">
  <div class="gfam-pager">
    <a class="btn sm soft" href="../reading.html">← 返回整篇理解学阅读</a>
    <span><a class="btn sm" href="a.html">A 应用文</a><a class="btn sm" href="b.html">B 记叙文</a><a class="btn sm" href="c.html">C 说明文</a><a class="btn sm" href="d.html">D 议论文</a></span>
  </div>
</section>
`,
  }));

  /* 完形单篇页 */
  czList.forEach((p, idx) => {
    const prev = czList[idx - 1];
    const next = czList[idx + 1];

    write(`reading/${p.id}.html`, page({
      base: '../',
      title: `${p.title} · 完形填空`,
      desc: `${p.title}（完形填空 · ${p.questions.length} 空）：先通读全文再逐空选择，每空给上下文依据，附全文中文译文。`,
      active: 'reading',
      dataKeys: ['PASSAGES'],
      dataExtra: { READ_ALL: ALL_PASSAGES },
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / <a href="cz.html">完形填空</a> / 第 ${idx + 1} 篇</div>
  <h1>${esc(p.title)}</h1>
  <p class="lede">${esc(p.intro)}</p>
</div>

<section class="section" style="margin-top:18px">
  <details class="method-fold">
    <summary>🧩 完形填空的读法（点开复习）</summary>
    <ol class="method-steps">
      ${czm.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(czm.trap)}</div>
  </details>
</section>

<section class="section">
  ${passageHtml(p)}
</section>

<section class="section">
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.id}.html">← 上一篇</a>` : '<span></span>'}
    <a class="btn sm soft" href="cz.html">全部 ${czList.length} 篇</a>
    ${next ? `<a class="btn sm" href="${next.id}.html">下一篇 →</a>` : '<span></span>'}
  </div>
</section>
`,
      script: readingScript,
    }));
  });
}


function buildReview() {
  // 按语法族汇总题量，用于「按语法族筛选」的 chip 标签
  const groupChips = GRAMMAR.map((g) => {
    const n = g.topics.reduce((a, t) => a + (Q_BY_TOPIC.get(t.id) || []).length, 0);
    return `<button class="chip" data-g="${g.id}">${esc(g.name)} · ${n}</button>`;
  }).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 题型练语法</div>
  <h1>中考题型练语法</h1>
  <p class="lede">${Q_STATS.total} 道精练题完整覆盖 <b>${GRAMMAR_STATS.topics} 个中考核心考点</b>，题型对齐北京卷面：单项填空、写作改错、语法填空。系统实时追踪各考点正确率，自动把薄弱项浮到最前，答错的题一键收进错题本。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="kv">
    <div class="k"><b id="kQn">0</b><span>累计精练题数</span></div>
    <div class="k"><b id="kRate" style="color:var(--accent)">—</b><span>综合正确率</span></div>
    <div class="k"><b id="kWrong" style="color:var(--rose)">0</b><span>语法错题本</span></div>
  </div>
</section>

<section class="section" style="margin-top:28px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>配置本组练习</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始刷题 →</button>
        <button class="btn ghost sm" id="resetBtn">清空记录</button>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">练习范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-scope="all">全部考点</button>
          <button class="chip" data-scope="wrong">只练错题本 <span id="wrongN">0</span></button>
          <button class="chip" data-scope="weak">专攻最弱考点</button>
        </div>
        <p class="setup-hint">选「专攻最弱考点」会自动挑出正确率最低的薄弱项集中突破 · <b id="dueN">—</b> 题待复习</p>
      </div>

      <div class="setup-group">
        <div class="kicker">中考题型</div>
        <div class="chips" id="typeChips">
          <button class="chip on" data-t="all">混合题型</button>
          <button class="chip" data-t="choice">单项填空 · ${Q_STATS.choice}</button>
          <button class="chip" data-t="correct">写作改错 · ${Q_STATS.correct}</button>
          <button class="chip" data-t="fill">语法填空 · ${Q_STATS.fill}</button>
        </div>
        <p class="setup-hint">混合题型最贴近真实卷面顺序；改错题专治写作常见语法失分</p>
      </div>

      <div class="setup-group">
        <div class="kicker">本组题量</div>
        <div class="chips" id="lenChips">
          <button class="chip" data-l="10">10 题</button>
          <button class="chip on" data-l="20">20 题</button>
          <button class="chip" data-l="40">40 题</button>
        </div>
        <p class="setup-hint">20 题约 8–10 分钟，适合日常打卡</p>
      </div>

      <div class="setup-group wide">
        <div class="kicker">按语法族筛选 <span style="text-transform:none;letter-spacing:0;font-weight:500">· 仅在「全部考点」时生效</span></div>
        <div class="chips" id="groupChips">
          <button class="chip on" data-g="all">不限语法族</button>
          ${groupChips}
        </div>
      </div>
    </div>

    <div class="note setup-note">
      快捷键：<b>1–4</b> 选答案、<b>Enter</b> 下一题；填空题按 <b>Enter</b> 提交。答错自动进入<a href="wrong.html">错题本</a>。
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none"><div id="qz"></div></section>
`;
  const script = `
const { QUESTIONS, GRAMMAR } = window.ZK_DATA;
const Z = window.ZK;
const ALL = QUESTIONS;
const BY_TOPIC = new Map();
ALL.forEach(q => { if (!BY_TOPIC.has(q.topic)) BY_TOPIC.set(q.topic, []); BY_TOPIC.get(q.topic).push(q); });
const GT = new Map();      // topic -> family id
const TNAME = new Map();   // topic -> 考点中文名
GRAMMAR.forEach(g => g.topics.forEach(t => { GT.set(t.id, g.id); TNAME.set(t.id, t.name); }));

let scope = 'all', grp = 'all', type = 'all', len = 20, topic = null;

function pick(sel, attr, cb) {
  document.querySelectorAll(sel + ' .chip').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll(sel + ' .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on'); cb(c.getAttribute(attr));
  }));
}
pick('#scopeChips', 'data-scope', v => scope = v);
pick('#groupChips', 'data-g', v => grp = v);
pick('#typeChips', 'data-t', v => type = v);
pick('#lenChips', 'data-l', v => len = parseInt(v, 10));

/** 最弱考点：至少练过 3 题、正确率最低。
    只认真正有题目的考点 id——历史数据或异常写入可能留下族 id，
    若不校验会静默出一组空题。 */
function weakestTopic() {
  const st = Z.qTopicStats()
    .filter(x => x.n >= 3 && BY_TOPIC.has(x.topic))
    .sort((a, b) => a.rate - b.rate);
  return st.length ? st[0].topic : null;
}

function refreshStats() {
  const st = Z.qTopicStats();
  const n = st.reduce((a, x) => a + x.n, 0);
  const ok = st.reduce((a, x) => a + x.ok, 0);
  const wrong = Z.wrongIds().length;
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kQn', n);
  set('#kRate', n ? Math.round(ok / n * 100) + '%' : '—');
  set('#kWrong', wrong);
  const wn = document.querySelector('#wrongN'); if (wn) wn.textContent = wrong;
  const dueEl = document.querySelector('#dueN');
  if (dueEl) {
    const dm = Z.qDueMap();
    const t = Date.now();
    dueEl.textContent = ALL.filter(q => { const d = dm[q.id]; return !d || (d.due || 0) <= t; }).length;
  }
}
refreshStats();
document.addEventListener('zk:qlog', refreshStats);

// 从语法族页带 ?topic= 进来时，锁定该考点专项
const tp = new URLSearchParams(location.search).get('topic');
if (tp && TNAME.has(tp)) {
  topic = tp;
  const scopeChips = document.querySelector('#scopeChips');
  if (scopeChips) scopeChips.style.display = 'none';
  const banner = document.createElement('div');
  banner.className = 'note';
  banner.style.cssText = 'margin-top:18px;border-left-color:var(--accent)';
  banner.innerHTML = '当前专项考点：<b>' + Z.esc(TNAME.get(tp)) + '</b> · 共 ' +
    (BY_TOPIC.get(tp) || []).length + ' 题 · <a href="review.html">切回全部自由练习 →</a>';
  const setup = document.querySelector('#setup');
  if (setup) setup.parentNode.insertBefore(banner, setup);
}

document.querySelector('#startBtn').addEventListener('click', () => {
  let pool = ALL.slice();
  if (topic) {
    pool = pool.filter(q => q.topic === topic);
  } else if (scope === 'wrong') {
    const ids = new Set(Z.wrongIds());
    pool = pool.filter(q => ids.has(q.id));
    if (!pool.length) { Z.toast('错题本目前是空的，先练一组吧！'); return; }
  } else if (scope === 'weak') {
    const w = weakestTopic();
    if (!w) { Z.toast('先练满几题（同一考点至少 3 题），系统就能自动识别最弱考点'); return; }
    pool = pool.filter(q => q.topic === w);
  } else {
    if (grp !== 'all') pool = pool.filter(q => GT.get(q.topic) === grp);
  }
  if (type !== 'all') pool = pool.filter(q => (q.type || 'choice') === type);
  if (!pool.length) { Z.toast('当前筛选组合下没有题目，换个条件试试'); return; }

  // 遗忘曲线排期：未练过或已到期的题优先；未到复习时间的答对题不再重复塞进本轮。
  // 「只练错题本」「专攻最弱考点」是用户点名的范围，按原样出，不做排期过滤。
  let finalPool = pool;
  if (scope !== 'wrong' && scope !== 'weak' && !topic) {
    const now = Date.now();
    const dueMap = Z.qDueMap();
    const isDue = q => { const d = dueMap[q.id]; return !d || (d.due || 0) <= now; };
    const duePool = pool.filter(isDue);
    if (duePool.length) {
      finalPool = duePool;
    } else {
      // 全部都在复习周期内：挑最早到期的凑一组，避免「没题可练」
      finalPool = pool.slice().sort((a, b) =>
        (dueMap[a.id] ? dueMap[a.id].due : 0) - (dueMap[b.id] ? dueMap[b.id].due : 0));
      Z.toast('当前范围的题都在复习周期内，本轮复习最早到期的题');
    }
  }

  document.querySelector('#setup').style.display = 'none';
  document.querySelector('#zone').style.display = '';
  Z.quiz({ mount: '#qz', questions: finalPool, limit: len, shuffle: true,
    reviewHref: 'grammar.html', reviewLabel: '回顾语法考点',
    onRestart: () => location.reload(),
    onFinish: refreshStats });
  const zone = document.querySelector('#zone');
  window.scrollTo({ top: Math.max(0, zone.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (confirm('确定清空全部语法练习记录与错题本？')) { Z.qReset(); refreshStats(); Z.toast('已清空语法记录'); }
});
`;
  write('review.html', page({
    title: '题型练语法 · 考点专项精练',
    desc: `${Q_STATS.total} 道北京中考英语题型精练题，覆盖全部 ${GRAMMAR_STATS.topics} 个考点，自动定位最弱考点并收集错题。`,
    active: 'grammar-drill', body, script, dataKeys: ['QUESTIONS', 'GRAMMAR'],
  }));
}

/* ==========================================================
   7. 错题本
   ========================================================== */
function buildWrong() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 智能错题本</div>
  <h1>智能错题本</h1>
  <p class="lede">做错的<b>单词和语法题</b>都会自动收录。单词需<b>连续答对 2 次</b>才移出，语法题答对一次即出册。可以搜索、按每页 10 / 20 / 50 条翻页、整页重做，也能一键打印 A4 错题纸做纸质复盘。<br><span style="color:var(--text-3);font-size:.92em">阅读、完形、阅读表达的错题不收录——这些题脱离原文没法单独复习，回对应篇章页重做。</span></p>
</div>

<section class="section" style="margin-top:22px">
  <div class="chips" id="tabs">
    <button class="chip" data-tab="word">单词错题 <span id="nWord">0</span></button>
    <button class="chip" data-tab="gram">语法错题 <span id="nGram">0</span></button>
  </div>
  <div class="toolbar" style="margin-top:16px">
    <input class="field" id="wq" type="search" placeholder="在错题本里搜索单词、释义或题干…" autocomplete="off">
    <select class="field" id="psize" style="max-width:130px;padding:8px 10px;font-size:.84rem">
      <option value="10">每页 10 条</option>
      <option value="20">每页 20 条</option>
      <option value="50">每页 50 条</option>
    </select>
    <button class="btn primary sm" id="redoBtn">重做本页</button>
    <button class="btn soft sm" id="printBtn">🖨️ 打印错题纸</button>
    <button class="btn ghost sm" id="clearBtn">清空本类</button>
  </div>
  <div class="note" id="wbHint" style="margin-bottom:16px">共 <b>0</b> 条</div>
  <div id="wbList"></div>
  <div class="pager" id="wbPager"></div>
  <div class="empty" id="wbEmpty" style="display:none">
    <b>🎉 错题本是空的</b>去<a href="quiz.html">背单词</a>或<a href="review.html">练语法</a>，做错的会自动收进来方便复盘
  </div>
</section>

<section class="section" id="redoZone" style="display:none">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">重做</span>
      <h2 style="font-size:1.15rem">本页错题重做</h2>
      <span class="sub" id="redoInfo"></span>
    </div>
  </div>
  <div id="redoHost"></div>
</section>

<section class="section" id="printZone">
  <div id="printList" class="print-list"></div>
</section>
`;
  const script = `
ZK.ready(function(){
  var WORDS = ZK_DATA.WORDS;
  var Q = ZK_DATA.QUESTIONS;
  var GRAMMAR = ZK_DATA.GRAMMAR;

  var WBYW = new Map(WORDS.map(function(w){ return [w.w.toLowerCase(), w]; }));
  var QBYID = new Map(Q.map(function(q){ return [q.id, q]; }));
  var TNAME = new Map();
  GRAMMAR.forEach(function(g){ g.topics.forEach(function(t){ TNAME.set(t.id, t.name); }); });

  /* 旧版本把阅读、完形、阅读表达也收进了错题本（id 形如 s1-a-3 / cloze-1-2）。
     这些题脱离原文没法复习，加载时一次性剪掉，之后只收语法题。 */
  var validQ = {};
  Q.forEach(function(q){ validQ[q.id] = 1; });
  ZK.pruneWrongBook(Object.keys(validQ));

  var PSIZE_KEY = 'zk-wb-psize';
  var PAGE_SIZE = parseInt(localStorage.getItem(PSIZE_KEY) || '10', 10);
  if ([10, 20, 50].indexOf(PAGE_SIZE) < 0) PAGE_SIZE = 10;

  /* ?tab=gram 可直接打开语法错题，便于从「练语法」页的错题入口跳进来 */
  var tabParam = new URLSearchParams(location.search).get('tab');
  var tab = (tabParam === 'gram' || tabParam === 'word') ? tabParam : 'word';
  var page = 0, query = '';

  /* ---------- 数据收集 ---------- */
  function wordItems(){
    return ZK.wordBookList().map(function(x){
      return { kind:'word', key:x.w, rec:x, meta: WBYW.get(x.w) || {} };
    });
  }
  function gramItems(){
    return ZK.wrongIds().map(function(id){
      var q = QBYID.get(id);
      if (!q) return null;
      return { kind:'gram', key:id, at: ZK.wrongAt(id), q:q, topicName: TNAME.get(q.topic) || '' };
    }).filter(Boolean);
  }
  function currentItems(){
    var arr = tab === 'word' ? wordItems() : gramItems();
    if (query) {
      var t = query.toLowerCase();
      arr = arr.filter(function(it){
        var hay = it.kind === 'word'
          ? (it.key + ' ' + (it.meta.zh||'') + ' ' + (it.meta.posZh||''))
          : (it.q.stem + ' ' + (it.q.why||'') + ' ' + it.topicName);
        return hay.toLowerCase().indexOf(t) >= 0;
      });
    }
    return arr;
  }

  /* ---------- 行渲染 ---------- */
  function wordRow(it){
    var m = it.meta;
    var origWord = m.w || it.key;
    var right = it.rec.right || 0;
    return '<div class="wrow wb-row" data-key="'+ZK.esc(it.key)+'">' +
      '<span class="w-cell">' +
        '<button class="w-say" data-say="'+ZK.esc(origWord)+'" title="听英音">🔊</button>' +
        '<span class="w">'+ZK.esc(origWord)+(m.ph?'<span class="ph">/'+ZK.esc(m.ph)+'/</span>':'')+'</span>' +
      '</span>' +
      '<span class="pos">'+ZK.esc(m.posZh||'')+'</span>' +
      '<span class="zh">'+ZK.esc(m.zh||'（无释义）')+'</span>' +
      '<span class="flag">错 '+(it.rec.wrong||1)+' 次 · 连对 '+right+'/'+ZK.MASTER_STREAK+'</span>' +
      '<span class="wb-actions"><button class="btn xs" data-master="'+ZK.esc(it.key)+'">✓ 已掌握</button></span>' +
    '</div>';
  }

  function gramRow(it){
    var q = it.q;
    var typeName = q.type === 'correct' ? '改错' : q.type === 'fill' ? '语法填空' : '单项填空';
    var ans = q.type === 'fill' ? q.answer : (q.options ? q.options[q.answer] : '');
    return '<div class="wb-gram" data-key="'+ZK.esc(it.key)+'">' +
      '<div class="qmeta">' +
        '<span class="qtype">'+typeName+'</span>' +
        '<span class="flag">'+ZK.esc(it.topicName)+'</span>' +
      '</div>' +
      '<div class="wb-stem">'+ZK.esc(q.stem).replace(/___/g,'<span class="blank">　</span>')+'</div>' +
      '<div class="wb-actions"><button class="btn xs" data-master="'+ZK.esc(it.key)+'">✓ 已掌握</button></div>' +
      (q.options ? '<div class="wb-opts">'+q.options.map(function(o,k){ return '<span class="wb-opt">'+'ABCD'[k]+'. '+ZK.esc(o)+'</span>'; }).join('')+'</div>' : '') +
      '<div class="wb-ans"><b>正确答案：</b><span>'+ZK.esc(ans)+'</span></div>' +
      '<div class="wb-why">'+ZK.esc(q.why)+'</div>' +
    '</div>';
  }

  /* ---------- 打印区（全部条目，不受分页限制） ---------- */
  function drawPrint(){
    var items = currentItems();
    var host = document.getElementById('printList');
    if (!items.length) { host.innerHTML = '<div class="empty"><b>当前标签页没有错题</b>没有可打印的内容</div>'; return; }
    var title = tab === 'word' ? '单词错题' : '语法错题';
    host.innerHTML = '<div class="print-head"><b>北京中考领航 · 智能错题本</b>' +
      '<span>'+title+' · 共 '+items.length+' 条 · '+new Date().toLocaleDateString('zh-CN')+'</span></div>' +
      (tab === 'word'
        ? '<div class="wordlist">'+items.map(wordRow).join('')+'</div>'
        : items.map(gramRow).join(''));
  }

  /* ---------- 主渲染 ---------- */
  function draw(){
    var items = currentItems();
    var all = tab === 'word' ? wordItems() : gramItems();
    var total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (page >= total) page = total - 1;
    if (page < 0) page = 0;
    var slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    document.getElementById('nWord').textContent = ZK.wordBookCount();
    document.getElementById('nGram').textContent = gramItems().length;

    var host = document.getElementById('wbList');
    var empty = document.getElementById('wbEmpty');
    var pager = document.getElementById('wbPager');
    var redoBtn = document.getElementById('redoBtn');
    var clearBtn = document.getElementById('clearBtn');
    var printBtn = document.getElementById('printBtn');
    var hint = document.getElementById('wbHint');

    if (!items.length) {
      host.innerHTML = ''; pager.innerHTML = '';
      empty.style.display = '';
      redoBtn.disabled = true; clearBtn.disabled = true; printBtn.disabled = true;
      hint.innerHTML = all.length
        ? '共 <b>0</b> 条匹配（已筛选，本类总计 ' + all.length + ' 条）'
        : '共 <b>0</b> 条';
      drawPrint();
      return;
    }
    empty.style.display = 'none';
    redoBtn.disabled = false; clearBtn.disabled = false; printBtn.disabled = false;
    hint.innerHTML = '共 <b>' + items.length + '</b> 条' +
      (items.length !== all.length ? '（已筛选，本类总计 ' + all.length + ' 条）' : '') +
      ' · 第 ' + (page + 1) + ' / ' + total + ' 页';

    host.innerHTML = tab === 'word'
      ? '<div class="wordlist">' + slice.map(wordRow).join('') + '</div>'
      : slice.map(gramRow).join('');

    var html = '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
    for (var i = 0; i < total; i++) {
      if (total > 9 && i > 1 && i < total - 2 && Math.abs(i - page) > 1) {
        if (i === 2 || i === total - 3) html += '<span class="pager dots">…</span>';
        continue;
      }
      html += '<button data-pg="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
    }
    html += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
    pager.innerHTML = html;

    pager.querySelectorAll('[data-pg]').forEach(function(b){
      b.addEventListener('click', function(){
        var p = parseInt(b.getAttribute('data-pg'), 10);
        if (!isNaN(p)) { page = p; draw(); window.scrollTo({ top: 180, behavior: 'smooth' }); }
      });
    });
    host.querySelectorAll('[data-say]').forEach(function(b){
      b.addEventListener('click', function(e){
        e.stopPropagation();
        ZK.playWord(b.getAttribute('data-say'), { times: 1 });
      });
    });
    host.querySelectorAll('[data-master]').forEach(function(b){
      b.addEventListener('click', function(){
        var key = b.getAttribute('data-master');
        if (tab === 'word') ZK.wordMaster(key); else ZK.qClearWrong(key);
        ZK.toast('已移出错题本');
        draw();
      });
    });
    drawPrint();
  }

  /* ---------- 标签页 / 搜索 / 每页条数 ---------- */
  /* 高亮与 tab 对齐（含 ?tab=gram 直接进入的情况） */
  document.querySelectorAll('#tabs .chip').forEach(function(c){
    c.classList.toggle('on', c.getAttribute('data-tab') === tab);
    c.addEventListener('click', function(){
      document.querySelectorAll('#tabs .chip').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      tab = c.getAttribute('data-tab');
      page = 0;
      document.getElementById('redoZone').style.display = 'none';
      draw();
    });
  });

  document.getElementById('wq').addEventListener('input', function(e){
    query = e.target.value.trim();
    page = 0;
    draw();
  });

  var psizeSel = document.getElementById('psize');
  psizeSel.value = String(PAGE_SIZE);
  psizeSel.addEventListener('change', function(){
    PAGE_SIZE = parseInt(psizeSel.value, 10);
    try { localStorage.setItem(PSIZE_KEY, String(PAGE_SIZE)); } catch (e) {}
    page = 0;
    draw();
  });

  /* ---------- 打印 ---------- */
  document.getElementById('printBtn').addEventListener('click', function(){
    drawPrint();
    window.print();
  });

  /* ---------- 清空 ---------- */
  document.getElementById('clearBtn').addEventListener('click', function(){
    var label = tab === 'word' ? '单词错题' : '语法错题';
    if (!window.confirm('确定清空全部' + label + '？此操作不可撤销。')) return;
    if (tab === 'word') ZK.wordBookReset(); else ZK.qClearAllWrong();
    page = 0;
    draw();
    ZK.toast('已清空' + label);
  });

  /* ---------- 重做本页 ---------- */
  document.getElementById('redoBtn').addEventListener('click', function(){
    var items = currentItems();
    var slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (!slice.length) return;
    var zone = document.getElementById('redoZone');
    zone.style.display = '';
    document.getElementById('redoInfo').textContent = '本页 ' + slice.length + ' 题 · 答对即推进掌握进度';
    if (tab === 'word') redoWords(slice); else redoGram(slice);
    zone.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  function redoWords(slice){
    var host = document.getElementById('redoHost');
    var i = 0, done = 0, released = 0;
    var autoNextTimer = null;
    var AUTO_NEXT_MS = 780;

    function finish(){
      ZK.sfx('win');
      host.innerHTML = '<div class="qcard" style="text-align:center">' +
        '<div style="font-size:1.45rem;font-weight:700">🎉 本页错词重做完成</div>' +
        '<div style="color:var(--text-2);margin-top:8px">答对 ' + done + ' / ' + slice.length +
        ' · 其中 ' + released + ' 个已移出错题本</div>' +
        '<div style="margin-top:20px"><button class="btn primary" id="rdAgain">返回错题本</button></div></div>';
      host.querySelector('#rdAgain').addEventListener('click', function(){
        document.getElementById('redoZone').style.display = 'none';
        draw();
      });
    }

    function step(){
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      if (i >= slice.length) { finish(); return; }

      var w = slice[i].meta;
      if (!w || !w.w) { i++; step(); return; }
      var ds = ZK.pickDistractors(WORDS, w, 3);
      if (ds.length < 3) { i++; step(); return; }
      var opts = [w].concat(ds);
      ZK.shuffle(opts);
      var ans = opts.indexOf(w);

      host.innerHTML = '<div class="flash-shell">' +
        '<div class="quiz-top"><div class="quiz-progress"><i style="width:' + (i / slice.length * 100) + '%"></i></div>' +
        '<span class="quiz-count">' + (i + 1) + ' / ' + slice.length + '</span></div>' +
        '<div class="fcard" style="justify-content:flex-start;padding-top:30px;min-height:0">' +
          '<div class="fword" style="font-size:clamp(1.6rem,5vw,2.1rem)">' + ZK.esc(w.w) + '</div>' +
          '<div style="font-size:.84rem;color:var(--text-3);margin-top:10px">选出正确的中文释义</div></div>' +
        '<div class="qopts" style="margin-top:14px">' +
          opts.map(function(o, k){
            return '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' +
              ZK.esc(o.zh || '') + '</span></button>';
          }).join('') +
        '</div><div id="rfb"></div></div>';

      var answered = false;
      host.querySelectorAll('.qopt').forEach(function(b){
        b.addEventListener('click', function(){
          if (answered) return;
          answered = true;
          var k = parseInt(b.getAttribute('data-k'), 10);
          var ok = k === ans;
          ZK.sfx(ok ? 'ok' : 'bad');
          host.querySelectorAll('.qopt').forEach(function(x){
            var xi = parseInt(x.getAttribute('data-k'), 10);
            x.classList.add('locked');
            if (xi === ans) x.classList.add('right');
            else if (xi === k) x.classList.add('wrong');
          });
          var mastered = ZK.wordAttempt(w.w, ok);
          if (ok) { done++; if (mastered) released++; }
          var fb = host.querySelector('#rfb');
          if (ok) {
            var cur = (ZK.wordBook()[w.w.toLowerCase()] || {});
            var need = ZK.MASTER_STREAK - (cur.right || 0);
            fb.innerHTML = '<div class="feedback auto-next"><b>✓ 对了！' +
              (mastered ? '已移出错题本' : '再对 ' + need + ' 次即移出') + '</b>' +
              ZK.esc(w.w) + ' · ' + ZK.esc(w.posZh || '') +
              '<span class="auto-next-hint">即将进入下一题…</span></div>';
            clearTimeout(autoNextTimer);
            autoNextTimer = setTimeout(function(){
              if (!document.body.contains(host)) return;
              i++; step();
            }, AUTO_NEXT_MS);
          } else {
            fb.innerHTML = '<div class="feedback bad"><b>✕ 正确答案：' + ZK.esc(w.zh) + '</b>' +
              ZK.esc(w.w) + ' · ' + ZK.esc(w.posZh || '') + '</div>' +
              '<div class="quiz-actions"><span class="spacer"></span>' +
              '<button class="btn primary" id="rn">下一题 →</button></div>';
            fb.querySelector('#rn').addEventListener('click', function(){ i++; step(); });
          }
        });
      });
    }
    step();
  }

  function redoGram(slice){
    ZK.quiz({
      mount: '#redoHost',
      questions: slice.map(function(it){ return it.q; }),
      shuffle: true,
      reviewHref: '',
      onRestart: function(){
        document.getElementById('redoZone').style.display = 'none';
        draw();
      },
    });
  }

  draw();
});
`;
  write('wrong.html', page({
    title: '智能错题本 · 重做与打印复习纸',
    desc: '自动收纳单词与语法错题，支持搜索、分页、整页重做、英音朗读与 A4 错题纸打印。',
    active: 'wrong', body, script, dataKeys: ['WORDS', 'QUESTIONS', 'GRAMMAR'],
    audioTexts: WORDS.map((w) => w.w),
  }));
}

/* ==========================================================
   9. 学情档案
   ========================================================== */
function buildStats() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 学情档案</div>
  <h1>学情档案</h1>
  <p class="lede">不看总分，看<b>弱在哪</b>。这里按遗忘曲线排出<b>今天该练什么</b>，再把语法考点与六项阅读能力的正确率摊开——正确率越低越靠前，<b>照着从上往下练，就是当前最省时间的复习路径</b>。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b id="sKnown">0</b><span>已掌握词条</span></div>
    <div class="k"><b id="sSrs">0</b><span>记忆库词条</span></div>
    <div class="k"><b id="sQn">0</b><span>累计练题</span></div>
    <div class="k"><b id="sRate" style="color:var(--accent)">—</b><span>总体正确率</span></div>
    <div class="k"><b id="sStreak">0</b><span>连续打卡天数</span></div>
  </div>
</section>

<!-- ========== 今日复习：按遗忘曲线算出来今天该做什么 ========== -->
<section class="section" style="margin-top:26px" id="todayPlan">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">高效复习</span>
      <h2>今天该练什么</h2>
      <span class="sub">按遗忘曲线算出的到期内容，做完这一轮再看新题，比盲目刷题省一半时间</span>
    </div>
  </div>
  <div class="review-cards" id="planCards"></div>
</section>

<!-- ========== 薄弱项诊断：语法考点按正确率排序 ========== -->
<section class="section" style="margin-top:26px" id="weakZone">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">语法薄弱项</span>
      <h2>按正确率排出该补的顺序</h2>
      <span class="sub">练过的考点按正确率升序排列，低于 80% 的标红并给出序号。点进去直接锁定该考点出题</span>
    </div>
  </div>
  <div id="weakList"></div>
</section>

<!-- ========== 六项阅读能力：从阅读页移过来的诊断面板 ========== -->
<section class="section" style="margin-top:26px" id="skillZone">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">我的阅读能力</span>
      <h2>六项能力正确率</h2>
      <span class="sub">按你的作答记录实时统计，红色项就是下一步该专攻的方向</span>
    </div>
    <a class="btn sm soft" href="reading.html">去练阅读 →</a>
  </div>
  <div class="card"><div id="skillBars"></div></div>
</section>

<section class="section" style="margin-top:26px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">最近 7 天学习量</h2>
      <span class="sub">柱高表示当日背词数，括号内为练题数</span>
    </div>
  </div>
  <div class="card"><div id="chart" class="chart"></div></div>
</section>

<section class="section" style="margin-top:26px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">档案备份</h2>
      <span class="sub">记录只存当前浏览器，换设备或清缓存前先导出</span>
    </div>
  </div>
  <div class="card">
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="btn primary" id="exportBtn">导出学习档案</button>
      <label class="btn soft" style="cursor:pointer">导入档案<input type="file" id="importFile" accept=".json" hidden></label>
      <button class="btn ghost" id="resetAll">清空全部记录</button>
    </div>
    <p class="note" style="margin-top:12px">备份包含：已掌握词、记忆库排期、每日学习量、错题本、语法练习记录、中考倒计时设置。不含任何个人身份信息。</p>
  </div>
</section>
`;
  const script = `
ZK.ready(function(){
  var GRAMMAR = ZK_DATA.GRAMMAR;
  var gt = {};
  GRAMMAR.forEach(function(g){
    g.topics.forEach(function(t){ gt[t.id] = { name: t.name, family: g.name }; });
  });

  /* ---------------- 今日复习：到期单词 / 到期错题 / 到期语法题 ---------------- */
  function drawPlan(){
    var srs = ZK.srsStats();
    var wbN = ZK.wordBookCount();
    var wrongIds = ZK.wrongIds();
    var wrongN = wrongIds.length;
    var dueMap = ZK.qDueMap();
    var now = Date.now();
    var wrongSet = {};
    wrongIds.forEach(function(id){ wrongSet[id] = 1; });
    /* 「待复习」只算真正到期的：已答对排了下次复习时间的题，没到期不该催。
       错题（wrongIds）本来 due 就是 0，单独归到「错题待清」，这里排除掉，免得重复计数。 */
    var dueQ = 0;
    Object.keys(dueMap).forEach(function(id){
      if (wrongSet[id]) return;
      var d = dueMap[id];
      if (d && (d.due || 0) > 0 && d.due <= now) dueQ++;
    });

    var cards = [
      { key:'word', icon:'🎧', cls:'blue', title:'到期单词', n: srs.due,
        desc: srs.due ? '记忆库里到期该复习的词，按遗忘曲线排的' : '今天没有到期单词，可以背新词',
        href:'quiz.html', go: srs.due ? '去复习 →' : '去背新词 →', hot: srs.due > 0 },
      { key:'wrong', icon:'🎯', cls:'rose', title:'错题待清', n: wbN + wrongN,
        desc: wbN + wrongN ? '单词错题 ' + wbN + ' 条 · 语法错题 ' + wrongN + ' 条' : '错题本是空的，保持住',
        href:'wrong.html', go: wbN + wrongN ? '去清错题 →' : '看看错题本 →', hot: (wbN + wrongN) > 0 },
      { key:'gram', icon:'⚡', cls:'purple', title:'语法待复习', n: dueQ,
        desc: dueQ ? '按 0.5 / 1 / 3 / 7 / 21 天排期，到期的题该重做一遍' : '没有到期的语法题',
        href:'review.html', go: dueQ ? '去重做 →' : '去练新题 →', hot: dueQ > 0 },
    ];

    document.getElementById('planCards').innerHTML = cards.map(function(c){
      return '<a class="review-card' + (c.hot ? ' hot' : '') + '" href="' + c.href + '">' +
        '<span class="rc-ico ' + c.cls + '">' + c.icon + '</span>' +
        '<span class="rc-body">' +
          '<span class="rc-top"><b>' + c.title + '</b><span class="rc-n">' + c.n + '</span></span>' +
          '<span class="rc-desc">' + c.desc + '</span>' +
          '<span class="rc-go">' + c.go + '</span>' +
        '</span></a>';
    }).join('');
  }

  /* ---------------- 语法薄弱项诊断 ---------------- */
  function collectWeak(){
    var rows = [];

    ZK.topicRates().forEach(function(r){
      var info = gt[r.id];
      if (!info) return;
      rows.push({
        kind:'grammar', name: info.name, group: '语法 · ' + info.family,
        n: r.total, ok: r.right, rate: r.rate,
        href: 'review.html?topic=' + encodeURIComponent(r.id), go: '练这个考点 →',
      });
    });

    // 正确率低的在前；样本太少的（<3 题）排在同正确率的后面，避免 1 题错就排第一
    rows.sort(function(a, b){
      if (Math.abs(a.rate - b.rate) > 0.001) return a.rate - b.rate;
      return (b.n >= 3 ? 1 : 0) - (a.n >= 3 ? 1 : 0);
    });
    return rows;
  }

  /* ---------------- 六项阅读能力（从阅读页移过来） ----------------
     六项固定展示：未作答的项显示 0 / 0 题与 —，不让面板忽隐忽现。
     排序：有作答记录且正确率低的排前面，未作答的按固定顺序排最后。 */
  var SKILL_ORDER = ${JSON.stringify(SKILL_ORDER)};
  var SKILL_LABEL = ${JSON.stringify(SKILL_LABEL)};

  function drawSkill(){
    var host = document.getElementById('skillBars');
    if (!host) return;
    var stats = ZK.pSkillStats();
    var byKey = {};
    stats.forEach(function(x){ byKey[x.skill] = x; });
    var rows = SKILL_ORDER.map(function(k){
      var x = byKey[k] || { n: 0, ok: 0, rate: 0 };
      return { skill: k, name: SKILL_LABEL[k] || k, n: x.n || 0, ok: x.ok || 0, rate: x.rate || 0 };
    });
    rows.sort(function(a, b){
      if (a.n === 0 && b.n !== 0) return 1;
      if (b.n === 0 && a.n !== 0) return -1;
      if (a.n === 0 && b.n === 0) return SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill);
      return a.rate - b.rate;
    });
    var total = rows.reduce(function(s, x){ return s + x.n; }, 0);
    host.innerHTML = '<div class="skill-bars">' + rows.map(function(x){
      var pct = Math.round(x.rate * 100);
      var cls = x.n === 0 ? 'none' : pct < 60 ? 'rose' : pct < 80 ? 'warn' : 'ok';
      return '<div class="skill-row' + (x.n === 0 ? ' is-empty' : '') + '">' +
        '<span class="sk-name">' + ZK.esc(x.name) + '</span>' +
        '<span class="sk-bar ' + cls + '"><i style="width:' + pct + '%"></i></span>' +
        '<span class="sk-num">' + x.ok + ' / ' + x.n + ' 题</span>' +
        '<span class="sk-pct ' + cls + '">' + (x.n === 0 ? '—' : pct + '%') + '</span>' +
      '</div>';
    }).join('') + '</div>' +
    '<p class="skill-hint">' + (total === 0
      ? '还没有作答记录。做几篇完形或阅读后，这里会按六项能力统计正确率。'
      : '共作答 ' + total + ' 题，红色项是下一步该专攻的方向。') + '</p>';
  }

  function drawWeak(){
    var rows = collectWeak();
    var host = document.getElementById('weakList');

    if (!rows.length) {
      host.innerHTML = '<div class="empty"><b>还没有语法练习记录</b>' +
        '去<a href="review.html">练语法</a>做几题，这里会按正确率排出你该补的考点顺序</div>';
      return;
    }

    var weak = rows.filter(function(x){ return x.rate < 0.8 && x.n >= 3; });
    var head = '';
    if (weak.length) {
      head = '<div class="weak-summary">' +
        '<b>' + weak.length + ' 项待补</b>' +
        '<span>按顺序练完，正确率整体能上一个台阶。先攻第一项，别同时开五个。</span></div>';
    } else {
      head = '<div class="weak-summary ok"><b>暂无明显薄弱项</b>' +
        '<span>已练过的项目正确率都在 80% 以上。继续扩大练习面，让诊断更准。</span></div>';
    }

    /* 序号只给真正待补的项（正确率 <80% 且样本 >=3），从 1 连续编号。
       注意不能用 map 的索引自增——那会改写索引、把后面的编号也带偏。 */
    var rankNo = 0;
    host.innerHTML = head + '<div class="weak-list">' + rows.map(function(x){
      var pct = Math.round(x.rate * 100);
      var cls = pct < 60 ? 'rose' : pct < 80 ? 'warn' : 'ok';
      var thin = x.n < 3;
      var needFix = x.rate < 0.8 && !thin;
      var rank = needFix
        ? '<span class="weak-rank">' + (++rankNo) + '</span>'
        : '<span class="weak-rank ghost">·</span>';
      return '<div class="weak-row' + (thin ? ' is-thin' : '') + '">' +
        rank +
        '<span class="weak-name">' +
          '<b>' + ZK.esc(x.name) + '</b>' +
          '<span class="weak-group">' + ZK.esc(x.group) + (thin ? ' · 样本少，仅供参考' : '') + '</span>' +
        '</span>' +
        '<span class="weak-bar ' + cls + '"><i style="width:' + pct + '%"></i></span>' +
        '<span class="weak-num">' + x.ok + ' / ' + x.n + ' 题</span>' +
        '<span class="weak-pct ' + cls + '">' + pct + '%</span>' +
        '<a class="btn xs soft weak-go" href="' + x.href + '">' + x.go + '</a>' +
      '</div>';
    }).join('') + '</div>';
  }

  /* ---------------- 概览 + 7 日图 ---------------- */
  function refresh(){
    document.getElementById('sKnown').textContent = ZK.knownCount();
    var st = ZK.srsStats();
    document.getElementById('sSrs').textContent = st.total;
    var ql = ZK.qLog(), n = 0, right = 0;
    Object.keys(ql.topicStats).forEach(function(k){ var t = ql.topicStats[k]; n += t.right + t.wrong; right += t.right; });
    document.getElementById('sQn').textContent = n;
    document.getElementById('sRate').textContent = n ? Math.round(right/n*100) + '%' : '—';
    document.getElementById('sStreak').textContent = ZK.streak();

    // 7 日柱状图：结构需与 .chart-bars / .chart-col / .chart-bar-wrap / .chart-bar 对齐，
    // 少一层 .chart-bar-wrap 会让柱高百分比失效、变成横贯整行的粗线。
    var data = ZK.last7();
    var max = Math.max.apply(null, data.map(function(d){ return d.words; }).concat([1]));
    document.getElementById('chart').innerHTML = '<div class="chart-bars">' + data.map(function(d){
      var h = Math.round(d.words / max * 100);
      return '<div class="chart-col">' +
        '<div class="chart-val">' + d.words + '</div>' +
        '<div class="chart-bar-wrap"><div class="chart-bar" style="height:' + Math.max(h, 3) + '%"></div></div>' +
        '<div class="chart-day">' + d.label + '</div>' +
        '</div>';
    }).join('') + '</div>';

    drawPlan();
    drawWeak();
    drawSkill();
  }

  document.getElementById('exportBtn').addEventListener('click', function(){ ZK.exportBackup(); });
  document.getElementById('importFile').addEventListener('change', function(e){
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function(){
      var res = ZK.importBackup(String(r.result));
      ZK.toast(res.msg);
      if (res.ok) setTimeout(function(){ location.reload(); }, 900);
    };
    r.readAsText(f);
  });
  document.getElementById('resetAll').addEventListener('click', function(){
    if (!window.confirm('确定清空全部学习记录？此操作不可撤销，建议先导出备份。')) return;
    ZK.clearKnown(); ZK.srsReset(); ZK.wordBookReset(); ZK.qReset();
    try {
      localStorage.removeItem('zk-daylog-v1'); localStorage.removeItem('zk-plan-v1');
    } catch(e){}
    ZK.toast('已清空全部记录');
    setTimeout(function(){ location.reload(); }, 700);
  });

  refresh();
});
`;
  write('stats.html', page({
    title: '学情档案 · 薄弱项诊断与复习计划',
    desc: '北京中考英语学情档案：按遗忘曲线给出今日复习计划，把语法考点与六项阅读能力按正确率排成待补清单，让复习只花在薄弱项上。',
    active: 'stats', body, script, dataKeys: ['GRAMMAR'],
  }));
}

/* ==========================================================
   10. 内容说明
   ========================================================== */
function buildContent() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 内容说明</div>
  <h1>内容与数据说明</h1>
  <p class="lede">这个站点做了哪些内容、数据从哪来、口径是什么，都写在这里，方便你判断哪些可以信、哪些需要自己再核对。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card">
    <h3>一、考试结构（北京中考英语）</h3>
    <p class="desc" style="margin-top:8px">北京中考英语总分 <b>100 分</b>，其中笔试 <b>60 分</b>、听说机考 <b>40 分</b>。<b>本站覆盖笔试 60 分的全部五道大题</b>；听说机考 40 分需专用音频与录音评测，不在本站范围内。笔试 90 分钟、共 38 小题、五道大题：</p>
    <table class="tbl" style="margin-top:10px">
      <thead><tr><th>题型</th><th>题量</th><th>分值</th></tr></thead>
      <tbody>
        <tr><td>一、单项填空</td><td>12 小题</td><td>12 分</td></tr>
        <tr><td>二、完形填空</td><td>8 小题</td><td>8 分</td></tr>
        <tr><td>三、阅读理解</td><td>13 小题</td><td>26 分</td></tr>
        <tr><td>四、阅读表达</td><td>4 小题</td><td>4 分</td></tr>
        <tr><td>五、书面表达</td><td>1 题</td><td>10 分</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>二、内容规模</h3>
    <table class="tbl" style="margin-top:10px">
      <thead><tr><th>项目</th><th>数量</th><th>来源与口径</th></tr></thead>
      <tbody>
        <tr><td>单词</td><td>${STATS.words}</td><td>ECDICT 词典中带「中考」标签（zk）的词条，按义务教育英语课程标准三级词汇范围整理</td></tr>
        <tr><td>高频短语</td><td>${STATS.phrases}</td><td>人工整理的中考高频动词短语、介词短语、be 结构与连词短语</td></tr>
        <tr><td>主题语境</td><td>${THEME_SORTED.length}</td><td>按新课标「人与自我 / 人与社会 / 人与自然」三大主题语境做词义规则归类</td></tr>
        <tr><td>语法族</td><td>${GRAMMAR_STATS.families}</td><td>按中考考查范围划分</td></tr>
        <tr><td>语法考点</td><td>${GRAMMAR_STATS.topics}</td><td>每个含规则、构成、例句、易错对比</td></tr>
        <tr><td>易错对比</td><td>${GRAMMAR_STATS.traps}</td><td>✕ 错句 / ✓ 对句 / 一句错因</td></tr>
        <tr><td>语法精练</td><td>${Q_STATS.total}</td><td>单选 ${Q_STATS.choice} · 改错 ${Q_STATS.correct} · 填空 ${Q_STATS.fill}，覆盖全部 ${GRAMMAR_STATS.topics} 个考点</td></tr>
        <tr><td>完形填空</td><td>${CLOZE.length} 篇 / ${CLOZE_N} 空</td><td>每空给上下文依据（前文线索 / 后文呼应 / 固定搭配），附全文中文译文</td></tr>
        <tr><td>阅读理解</td><td>${PASSAGES.length} 篇 / ${READ_Q} 题</td><td>A 应用文 · B 记叙文 · C 说明文 · D 议论文各 ${PASSAGES.length / 4} 篇，每题给原文定位句 + 为什么对 + 错项为什么错</td></tr>
        <tr><td>阅读表达</td><td>${EXPRESS_Q} 题</td><td>英文完整句作答，按关键词组判分，容忍语序差异；每题的参考答案与得分关键词均给出</td></tr>
        <tr><td>书面表达</td><td>方法体系 + ${WRITING_N} 篇范文</td><td>三条提分线 · ${WRITING_STEPS.length} 步写作法 · ${WRITING_STRUCTURES.length} 类结构模板 · ${WRITING_PHRASE_N} 句句型库 · ${WRITING_TRAPS.length} 个失分点；${WRITING_N} 篇原创高分范文，每篇含题目、思路、范文、亮点句与评分要点</td></tr>
        <tr><td>阅读能力维度</td><td>${SKILL_ORDER.map((k) => SKILL_TALLY[k] || 0).join(' / ')}</td><td>共 ${Object.values(SKILL_TALLY).reduce((a, b) => a + b, 0)} 道篇章题，按「${SKILL_ORDER.map((k) => SKILL_LABEL[k]).join(' / ')}」六项归类，用于统计各维度正确率。阅读选择题按题干关键词规则自动归类；完形填空的 32 空为人工逐空标注（其中固定搭配与语法词形两类只有完形才有），个别题可能与教学口径略有出入</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>三、词表口径说明</h3>
    <p class="desc" style="margin-top:8px"><b>词条来源。</b>单词取自开源英汉词典 ECDICT 中带 <code>zk</code>（中考）标签的词条，共 1600 余条，这是公开资源里最接近义务教育英语课程标准三级词汇表的可复现来源。短语由本项目人工整理。</p>
    <p class="desc" style="margin-top:8px"><b>中文释义。</b>按词性优先取义、剔除领域标注（如 [计]/[化]）、过滤生僻第二义，并对高频多义词走人工覆盖表，避免出现「go → 打赌」这类误导性释义。</p>
    <p class="desc" style="margin-top:8px"><b>词性。</b>以词典释义中的词性标注为主，并对 the / go / three 这类高频功能词与不规则词做人工校正——它们的词典主词性常与教学口径不一致。</p>
    <p class="desc" style="margin-top:8px"><b>分档。</b>按语料词频分三档：<b>核心高频</b>（词频前 1000，卷面最常遇到）、<b>中频主力</b>（1000–5000，阅读写作主力）、<b>拓展词</b>（其余）。这是启发式分档，不是官方等级标注。</p>
    <p class="desc" style="margin-top:8px"><b>主题归类。</b>按关键词规则匹配英文词形与中文释义，一个词可归入多个主题，未命中归「通用高频」。这是按词义规则的参考归类，不是官方话题划分。</p>
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>四、已知限制</h3>
    <ul class="tips" style="margin-top:10px">
      <li>词表为公开词典标签 + 人工校正，<b>不等于官方发布的考试词汇表</b>；个别词可能超出或低于本地中考范围，请以学校老师与官方文件为准。</li>
      <li>语法考点、练习题、完形与阅读篇章，以及写作的方法与 ${WRITING_N} 篇范文，均为按北京卷题型编写的<b>原创内容</b>，不是官方真题或官方出版材料。</li>
      <li>学阅读为 <b>${PASSAGES.length} 篇阅读 + ${CLOZE.length} 篇完形</b>，阅读表达 <b>${EXPRESS_Q} 题</b>；篇目数量少于真实卷面套数，用于按类型反复练读法，不是完整套卷。</li>
      <li>阅读能力维度（${SKILL_ORDER.map((k) => SKILL_LABEL[k]).join(' / ')}）中，<b>阅读选择题</b>按题干关键词规则自动归类，<b>完形填空的 32 空</b>是人工逐空标注；自动归类部分个别题可能被归到相邻类别，用于看大致薄弱方向即可。</li>
      <li>阅读表达的判分按<b>关键词组匹配</b>，只检查信息点是否答到，不评判语法与拼写细节——真实阅卷会看语言质量，请以自己写完整句为准。</li>
      <li>写作部分提供方法体系与 <b>${WRITING_N} 篇原创高分范文</b>，<b>不做自动批改</b>：写完请对照范文的评分要点与 ${WRITING_TRAPS.length} 个失分点自查。范文是原创仿写，不是官方发布的满分作文。</li>
      <li>听说机考 40 分需要专用音频与录音评测，<b>不在本站范围</b>，请配合北京教育考试院官方体验系统或真题练习。</li>
      <li>词频分档是启发式推断，不要当作官方难度等级使用。</li>
      <li>学习记录保存在浏览器 localStorage，换浏览器或清缓存会丢失，请用「学情档案」页的导出备份。</li>
      <li>单词与写作部分（范文、句型）的朗读音频由 <b>Edge TTS（en-GB-SoniaNeural，英式女声）预生成</b>，共 ${Object.keys(AUDIO).length} 条、约 17MB，音色全站统一；仅在新增文本尚未生成音频时，才退回浏览器自带语音合成。阅读与完形的原文不提供朗读，专注读法训练。</li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="card">
    <h3>五、怎么重建数据</h3>
    <p class="desc" style="margin-top:8px">词表由脚本从词典生成，改完重跑即可：</p>
    <pre class="given">python3 reference/build_words.py   # 生成 src/data-words.js
node build-site.mjs                # 重新生成全部页面</pre>
    <p class="desc" style="margin-top:8px">语法、题目、篇章与写作数据是手写源文件（src/data-grammar.js、data-quiz.js、data-quiz2.js、data-reading.js、data-cloze.js、data-writing.js），直接编辑后重跑构建即可。</p>
  </div>
</section>
`;
  write('content.html', page({
    title: '内容与数据说明',
    desc: '北京中考英语备考站的内容规模、数据来源、口径说明与已知限制。',
    active: 'content', body, dataKeys: [],
  }));
}

/* ==========================================================
   构建
   ========================================================== */
buildHome();
buildWords();
buildThemes();
buildQuiz();
buildGrammar();
buildReading();
buildWriting();
buildReview();
buildWrong();
buildStats();
buildContent();

/* ---------------- 自检 ---------------- */
console.log('=== 构建完成 ===');
console.log(`词条 ${STATS.total}（单词 ${STATS.words} · 短语 ${STATS.phrases}）`);
console.log(`主题 ${THEME_SORTED.length} 个`);
console.log(`语法 ${GRAMMAR_STATS.families} 族 ${GRAMMAR_STATS.topics} 考点 ${GRAMMAR_STATS.traps} 易错`);
console.log(`语法题 ${Q_STATS.total}（选择 ${Q_STATS.choice} · 改错 ${Q_STATS.correct} · 填空 ${Q_STATS.fill}）`);
console.log(`阅读能力维度：${SKILL_ORDER.map((k) => `${SKILL_LABEL[k]} ${SKILL_TALLY[k] || 0}`).join(' · ')}`);

if (Q_MISS.length) {
  console.error('✕ 以下考点没有对应题目：', Q_MISS.join(', '));
  process.exitCode = 1;
} else {
  console.log('✓ 全部语法考点都有对应题目');
}
