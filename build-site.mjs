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
   规则顺序有讲究：先判主旨/观点，再判词义猜测，最后判推理，剩余归细节。 */
function inferSkill(stem) {
  const s = String(stem || '');
  // 主旨 / 观点 / 标题 / 写作目的
  if (/best title|main idea|mainly about|writer'?s (own )?(opinion|view|conclusion|purpose)|what is the writer'?s (opinion|view|conclusion)|purpose of (this|the) (passage|poster|notice|letter|text|email)/i.test(s)) return 'mainidea';
  // 划线词但问「说明作者态度」→ 推理；纯问词义 → 词义猜测
  if (/the underlined (word|sentence|phrase)/i.test(s) && /(shows? that|suggests? that|tells? us)/i.test(s)) return 'inference';
  if (/the underlined (word|sentence|phrase)|the sentence ["“].{0,120}means|what does ["“].{0,60}["”] mean/i.test(s)) return 'context';
  if (/^the sentence ["“]/i.test(s)) return 'context';
  // 推理判断
  if (/in order to|mean by|what did .{0,50}(learn|realize|understand)|we can infer|can be inferred|implies?|probably|writer (mentions|says|uses)|why (did|do|does|are|is|must|should|can|would)|how did .{0,40}feel|what (can|could) we learn/i.test(s)) return 'inference';
  // 其余为细节定位
  return 'detail';
}

/* 给每道阅读题挂上 skill，完形统一归「上下文逻辑」 */
PASSAGES.forEach((p) => {
  p.questions.forEach((q) => { q.skill = inferSkill(q.q); });
});
CLOZE.forEach((c) => {
  c.blanks.forEach((b) => { b.skill = 'context'; });
});
const SKILL_TALLY = {};
[...PASSAGES.flatMap((p) => p.questions), ...CLOZE.flatMap((c) => c.blanks)]
  .forEach((q) => { SKILL_TALLY[q.skill] = (SKILL_TALLY[q.skill] || 0) + 1; });
const SKILL_LABEL = { detail: '细节定位', inference: '推理判断', mainidea: '主旨与观点', context: '上下文逻辑' };

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
  { href: 'writing.html', label: '写作', key: 'writing' },
  { href: 'words.html', label: '词库', key: 'words' },
  { href: 'grammar.html', label: '语法', key: 'grammar' },
  { href: 'wrong.html', label: '错题本', key: 'wrong' },
  { href: 'plan.html', label: '备考计划', key: 'plan' },
  { href: 'stats.html', label: '学习数据', key: 'stats' },
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
      <a href="${base}plan.html">备考计划</a>
    </div>
    <div class="col">
      <h4>知识体系</h4>
      <a href="${base}words.html">${STATS.total} 条词表</a>
      <a href="${base}themes/index.html">主题词库</a>
      <a href="${base}grammar.html">${GRAMMAR_STATS.families} 大语法族</a>
    </div>
    <div class="col">
      <h4>数据与说明</h4>
      <a href="${base}stats.html">学习数据</a>
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
function inlineData(keys, extra) {
  const ALL = { WORDS, THEMES, STATS, GRAMMAR, GRAMMAR_STATS, QUESTIONS: ALL_Q, QUESTIONS_2, PASSAGES, CLOZE, WRITING };
  const extraKeys = Object.keys(extra || {});
  const id = keys.join(',') + '|' + extraKeys.join(',');
  if (__inlineCache.has(id)) return __inlineCache.get(id);
  const body = keys.map((k) => {
    if (!(k in ALL)) throw new Error('inlineData: unknown key ' + k);
    return `window.ZK_DATA.${k}=${JSON.stringify(ALL[k])};`;
  }).concat(extraKeys.map((k) => `window.ZK_DATA.${k}=${JSON.stringify(extra[k])};`)).join('\n');
  const out = `<script>window.ZK_DATA=window.ZK_DATA||{};\n${body}</scr` + `ipt>`;
  __inlineCache.set(id, out);
  return out;
}

/* ---------------- 页面骨架 ---------------- */
function page({ base = '', active = '', title, desc = '', body, script = '', dataKeys = [], dataExtra = null }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
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
${script ? `${inlineData(dataKeys, dataExtra)}<script>${script}</script>` : ''}
</body>
</html>`;
}

/* ==========================================================
   1. 首页
   ========================================================== */
function buildHome() {
  const themeCards = THEME_SORTED.slice(0, 6).map((t) => `<a class="card" href="themes/${t.id}.html">
    <div class="card-ico">${t.icon}</div>
    <h3>${esc(t.name)}</h3>
    <div class="meta">${t.n} 个词条 · ${esc(t.group)}</div>
  </a>`).join('');

  const grammarCards = GRAMMAR.slice(0, 6).map((g) => `<a class="card" href="grammar/${g.id}.html">
    <div class="card-ico purple">${g.icon}</div>
    <h3>${esc(g.name)}</h3>
    <div class="meta">${g.topics.length} 个考点 · ${g.topics.reduce((s, t) => s + t.traps.length, 0)} 条易错对比</div>
  </a>`).join('');

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>对齐《义务教育英语课程标准（2022 年版）》与北京中考英语考试说明</div>
      <h1>北京中考英语，<br><span class="accent-word">从词汇到写作</span>一轮走完</h1>
      <p class="lede">
 不只背单词。本站按北京卷笔试结构铺成 <b>词汇 · 语法 · 篇章 · 写作</b> 四条主线：
 <b>${STATS.total} 条课标词条</b>打底，<b>${GRAMMAR_STATS.topics} 个语法考点</b>配 <b>${Q_STATS.total} 道精练</b>，
 再用<b>${PASSAGE_N} 篇完形与阅读</b>（${READING_ITEM_N} 题，含阅读表达）和<b>写作的方法、模板与句型库</b>把卷面走完。
 笔试 <b>60 分每一块都有对应练习</b>，每题都讲清「为什么对、错项错在哪」。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="quiz.html">开始背单词 <span aria-hidden="true">→</span></a>
        <a class="btn" href="reading.html">学阅读</a>
        <a class="btn" href="writing.html">学书面表达</a>
        <a class="btn ghost" href="plan.html">看备考计划</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 笔试 60 分题型全覆盖</span>
        <span><b>✓</b> 阅读写作逐题给依据</span>
        <span><b>✓</b> 离线可用 · 支持档案备份</span>
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
            <a href="stats.html" style="font-weight:600">查看学习数据 →</a>
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

<!-- ========== 卷面覆盖地图：一次讲清 60 分怎么分、每一块在哪练、哪块本站不含 ========== -->
<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">卷面覆盖地图</span>
      <h2>北京卷 100 分，本站覆盖笔试 60 分</h2>
      <span class="sub">每一块都标出对应分值、练什么、练多少；不含的部分也写清楚原因，不制造「全都包了」的错觉</span>
    </div>
  </div>
  <div class="coverage-list">
    <a class="coverage-row on" href="review.html">
      <span class="cv-score">12</span>
      <span class="cv-part">单项填空</span>
      <span class="cv-note">卷面 12 小题 × 1 分 · 考语法规则与词汇辨析<span class="cv-own">本站：${Q_STATS.total} 道精练，覆盖全部 ${GRAMMAR_STATS.topics} 个考点</span></span>
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
      <span class="cv-note">卷面 13 小题 × 2 分 · 单题分值最高<span class="cv-own">本站：${PASSAGES.length} 篇 ${READ_Q} 题，应用文/记叙文/说明文/议论文分读法</span></span>
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
      <span class="cv-note">卷面 1 题 10 分 · 要求 80–100 词<span class="cv-own">本站：三条提分线 + 五步法 + ${WRITING_STRUCTURES.length} 类模板 + ${WRITING_PHRASE_N} 句句型库</span></span>
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
</section>

<!-- ========== 四条主线：词汇 → 语法 → 篇章 → 写作，每条对应卷面上的真实分值 ========== -->
<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">四条主线</span>
      <h2>先打地基，再练语篇，最后能写</h2>
      <span class="sub">顺序不是随便排的：词不认识读不懂句，语法不过关写不对句，篇章不练拿不到 38 分，写作不练丢满 10 分</span>
    </div>
  </div>
  <div class="grid c2 track-grid">
    <a class="card track-card" href="quiz.html">
      <div class="track-head">
        <span class="track-ico blue">📚</span>
        <div>
          <span class="track-step">主线一 · 词汇</span>
          <h3>先把词认熟，卷面才读得动</h3>
        </div>
      </div>
      <p class="desc">${STATS.total} 条课标词条（含 ${STATS.phrases} 条高频短语），按语料词频分三档。遗忘曲线自动排期，答错 10 分钟复现，先拿下卷面最常出现的 ${STATS.core} 个核心高频词。</p>
      <div class="track-meta">
        <span>核心 ${STATS.core}</span><span>中频 ${STATS.mid}</span><span>拓展 ${STATS.ext}</span><span>${THEME_SORTED.length} 个主题语境</span>
      </div>
      <span class="track-go">背单词 · 全量词表 →</span>
    </a>
    <a class="card track-card" href="grammar.html">
      <div class="track-head">
        <span class="track-ico purple">📐</span>
        <div>
          <span class="track-step">主线二 · 语法</span>
          <h3>把规则用对，单选和写作都不丢</h3>
        </div>
      </div>
      <p class="desc">${GRAMMAR_STATS.families} 大语法族、${GRAMMAR_STATS.topics} 个考点，从名词冠词、九种时态、被动语态、非谓语到三大从句与情景交际。每考点配规则表 + ${GRAMMAR_STATS.traps} 组 ✕ 错句 / ✓ 对句对比。</p>
      <div class="track-meta">
        <span>${GRAMMAR_STATS.topics} 考点</span><span>${GRAMMAR_STATS.traps} 条易错对比</span><span>${GRAMMAR_STATS.examples} 个例句</span><span>${Q_STATS.total} 道精练</span>
      </div>
      <span class="track-go">语法体系 · 考点刷题 →</span>
    </a>
    <a class="card track-card" href="reading.html">
      <div class="track-head">
        <span class="track-ico ok">📖</span>
        <div>
          <span class="track-step">主线三 · 篇章</span>
          <h3>在语篇里判断，拿下 38 分</h3>
        </div>
      </div>
      <p class="desc">阅读 ${PASSAGES.length} 篇 ${READ_Q} 题（A/B/C/D 四类各配读法卡）+ 阅读表达 ${EXPRESS_Q} 题，另设<b>完形填空独立模块</b>（${CLOZE.length} 篇 ${CLOZE_N} 空）。每题给<b>原文定位句</b>、<b>为什么对</b>、<b>错项为什么错</b>三层解析。</p>
      <div class="track-meta">
        <span>${PASSAGE_N} 篇</span><span>${READING_ITEM_N} 题</span><span>A–D 四类</span><span>完形独立</span><span>对应 38 分</span>
      </div>
      <span class="track-go">学阅读 · 三级分页 →</span>
    </a>
    <a class="card track-card" href="writing.html">
      <div class="track-head">
        <span class="track-ico gold">✒️</span>
        <div>
          <span class="track-step">主线四 · 写作</span>
          <h3>把想法写出来，10 分稳拿</h3>
        </div>
      </div>
      <p class="desc">唯一能完全由自己控制得分的题型。先讲<b>五步写作法</b>（审题 → 定时态人称 → 搭框架 → 套句式 → 查三样），再给 ${WRITING_STRUCTURES.length} 类文体模板、${WRITING_PHRASE_N} 句句型库与 ${WRITING_TRAPS.length} 个高频失分点，每个环节都落到能直接照做的一步。</p>
      <div class="track-meta">
        <span>${WRITING_STRUCTURES.length} 类模板</span><span>${WRITING_PHRASE_N} 句句型</span><span>${WRITING_TRAPS.length} 个失分点</span><span>对应 10 分</span>
      </div>
      <span class="track-go">书面表达 · 方法与练习 →</span>
    </a>
  </div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">高频场景词库</span>
      <h2>按 ${THEME_SORTED.length} 个主题语境成组记词</h2>
      <span class="sub">北京卷阅读与写作总是围绕同一主题出词，按主题记效率翻倍</span>
    </div>
    <a class="btn sm soft" href="themes/index.html">查看全部 ${THEME_SORTED.length} 个主题 →</a>
  </div>
  <div class="grid c3">${themeCards}</div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">语法避坑图谱</span>
      <h2>按 ${GRAMMAR_STATS.families} 大语法族逐个击破</h2>
      <span class="sub">直击单项填空与书面表达的丢分重灾区</span>
    </div>
    <a class="btn sm soft" href="grammar.html">进入完整语法体系 →</a>
  </div>
  <div class="grid c3">${grammarCards}</div>
</section>

<!-- ========== 支撑工具：不产生新知识，但决定每天能不能坚持 ========== -->
<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">支撑工具</span>
      <h2>练完之后，靠这三样把进度管住</h2>
      <span class="sub">错题不清就会一直错，计划不排就会一直拖，数据不看就不知道差在哪</span>
    </div>
  </div>
  <div class="grid c3">
    <a class="card tool-card" href="wrong.html">
      <div class="card-ico rose">🎯</div>
      <h3>错题本</h3>
      <p class="desc">单词、语法、阅读、完形、阅读表达的错题自动收纳。单词需连对 2 次才移出，其余答对一次即出册，并按遗忘曲线排期重做。</p>
      <div class="meta" style="margin-top:12px">五类错题一处管理 · 可重做</div>
    </a>
    <a class="card tool-card" href="plan.html">
      <div class="card-ico">🗓</div>
      <h3>8 周备考计划</h3>
      <p class="desc">按「词汇地基 → 时态 → 非谓语情态 → 从句 → 篇章入门 → 阅读主攻 → 写作成文 → 全真模拟」推进，每周一个主攻方向，可勾选打卡。</p>
      <div class="meta" style="margin-top:12px">每天 20–30 分钟 · 8 周一轮</div>
    </a>
    <a class="card tool-card" href="stats.html">
      <div class="card-ico ok">📊</div>
      <h3>学习数据</h3>
      <p class="desc">已掌握词条、记忆库规模、7 日学习量、各考点正确率诊断一目了然。学习记录存本地，支持一键导出档案换设备恢复。</p>
      <div class="meta" style="margin-top:12px">7 日趋势 · 考点诊断 · 档案备份</div>
    </a>
  </div>
</section>

<section class="section reveal" id="faq">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">常见问题</span>
      <h2>关于北京中考领航，你可能想了解</h2>
    </div>
  </div>
  <div class="faq-list">
    <details class="faq-item" open>
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
      <p>不会只给答案。<b>阅读理解</b>每题给三层：<b>原文定位句</b>（能回原文逐字核对）、<b>为什么对</b>（引用定位句的关键信息）、<b>错项为什么错</b>（逐个说明是无中生有、偷换概念还是过度推断）。<b>完形填空</b>每空给上下文依据（前文线索 / 后文呼应 / 固定搭配），并附全文中文译文。<b>阅读表达</b>给参考答案与得分关键词。<b>书面表达</b>不提供现成范文，而是给题目要求、逐段提纲、必备句式与评分要点，讲清「怎么写才能得分」，范文留给你自己写。</p>
    </details>
    <details class="faq-item">
      <summary>写作部分能练吗？为什么不给范文？</summary>
      <p>能练，而且练习的重点就是「自己写」。写作是<b>唯一能完全由自己控制得分</b>的题型，所以本站把可操作的部分全给出来：<b>五步写作法</b>（审题划要点 → 定时态人称 → 搭三段框架 → 套句式写正文 → 查三样东西）、<b>${WRITING_STRUCTURES.length} 类文体的结构模板</b>（通知 / 书信 / 议论文 / 申请信，每类 5 个写作块）、<b>句型库</b>（按功能分 ${WRITING_PHRASES.length} 类共 ${WRITING_PHRASE_N} 句）、<b>${WRITING_TRAPS.length} 个高频失分点</b>，。<b>范文故意不给</b>：一旦有现成范文，多数人会先看再抄，动笔这一步就废了。写完对照评分要点和六个失分点逐条自查，效果比抄十篇范文好。</p>
    </details>
    <details class="faq-item">
      <summary>孩子平时作业多，每天需要花多长时间？</summary>
      <p>建议每天 15–20 分钟：10 分钟背 20 个单词（系统自动安排到期复习 + 新词），5–10 分钟刷 10 道语法题。周末再花 20 分钟练一篇阅读或写一段短文，并按 8 周计划走完一轮完整体系。</p>
    </details>
    <details class="faq-item">
      <summary>手机、iPad 和电脑都能用吗？需要下载 App 吗？</summary>
      <p>全端自适应，手机、iPad 平板和电脑浏览器打开就能直接学，无需下载安装 App，也没有弹窗广告。所有词条均可点击朗读，离线也能使用。</p>
    </details>
    <details class="faq-item">
      <summary>孩子的背词进度和错题本会丢失吗？换设备怎么办？</summary>
      <p>学习记录实时保存在当前浏览器中，离线也能用。如果需要在电脑和 iPad 之间切换，或担心清缓存丢失，可以随时在「学习数据」页点击<b>一键导出学习档案</b>，在新设备上导入即可无缝恢复。</p>
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
    title: '北京中考英语备考系统',
    desc: `覆盖北京中考英语笔试 60 分全部题型：${STATS.total} 条课标词条、${GRAMMAR_STATS.topics} 个语法考点与 ${Q_STATS.total} 道精练，${PASSAGE_N} 篇完形与阅读（${READING_ITEM_N} 题含阅读表达），以及写作的方法与句型库。`,
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
        <p class="setup-hint" id="sayHint">每题出现自动朗读，耳朵眼睛一起记</p>
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
    setHint('sayHint', autoSay ? '每题出现自动朗读，耳朵眼睛一起记' : '静音模式；想听发音时点单词旁的 🔊');
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
   ========================================================== */
/* ==========================================================
   书面表达页（北京卷第五部分，10 分）
   排版要点：
   - 表格改为「卡片式定义列表」，避免三列挤在一起
   - 练习卡给题目、提纲、句式与评分要点，不附范文（范文让学生自己写）
   - 方法论（五步法 / 结构模板 / 句型库 / 失分点）放在最前
   ========================================================== */
function buildWriting() {
  /* ==========================================================
     书面表达：总览 + 4 个方法独立页（对齐河北的索引→内容两级组织）
       writing.html             总览：三条提分线 + 4 个入口 + 交卷检查
       writing/steps.html       写作五步法
       writing/structures.html  四类文体的结构模板
       writing/phrases.html     句型库（按功能分 5 类）
       writing/traps.html       六个高频失分点
     产品决定：不附范文，范文留给学生自己写。
     ========================================================== */

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
      name: '结构模板', title: '四类文体的结构模板',
      desc: '通知、书信 / 回信、议论文 / 观点、申请信——每类给出固定的写作块与顺序。换什么题目，骨架都是这个：先背结构，再填内容。',
      meta: `${WRITING_STRUCTURES.length} 类文体`,
    },
    {
      slug: 'phrases', icon: '💬', kicker: '方法 · 第三步',
      name: '句型库', title: '句型库：按功能直接取用',
      desc: '按开头点题 / 分层连接 / 举例支撑 / 提建议 / 结尾收束分成 5 组，共 19 句。不要临场造句子，从这些背熟的句式里挑。',
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
    <a class="btn sm soft" href="../writing.html">返回书面表达总览</a>
    ${next ? `<a class="btn sm" href="${next.slug}.html">${esc(next.name)} →</a>` : '<span></span>'}
  </div>
</section>`;
  };

  /* 子页通用骨架：面包屑 + 标题 + 正文 + 翻页 */
  const subPage = (idx, bodyHtml, opts = {}) => {
    const m = MODULES[idx];
    return page({
      base: '../',
      title: `${m.name} · 书面表达`,
      desc: opts.desc || `${m.name}：${m.desc}`,
      active: 'writing',
      dataKeys: [],
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../writing.html">书面表达</a> / ${esc(m.name)}</div>
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
    title: '书面表达 · 10 分',
    desc: `北京中考英语书面表达专项：三条提分线、写作五步法、${WRITING_STRUCTURES.length} 类结构模板、${WRITING_PHRASE_N} 句句型库、${WRITING_TRAPS.length} 个高频失分点。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 书面表达</div>
  <h1>书面表达</h1>
  <p class="lede">北京卷第五部分 <b>10 分</b>，通常要求 80–100 词。这是<b>唯一能完全由自己控制得分</b>的题型——只要要点写全、语言不出错，稳拿 8 分以上。下面先讲清 10 分怎么来，再分四块把方法拆开。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b>10</b><span>对应分值</span></div>
    <div class="k"><b>80–100</b><span>要求词数</span></div>
    <div class="k"><b>${WRITING_STEPS.length}</b><span>写作步骤</span></div>
    <div class="k"><b>${WRITING_STRUCTURES.length}</b><span>结构模板</span></div>
    <div class="k"><b>${WRITING_PHRASE_N}</b><span>可套用句式</span></div>
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
          <span class="pb-en">${esc(it.en)}</span>
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
`));

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
      skill: 'context',
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
      <div class="express-q" data-id="${p.id}-e${ei + 1}" data-qi="${p.questions.length + ei}">
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
      P.qRecord('reading-' + card.id, ok, card.id + '-e' + (eidx + 1));
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

  /* 能力诊断面板脚本（只在一级页用） */
  const skillPanelScript = `
ZK.ready(function(){
  var P = window.ZK;
  function draw(){
    var panel = document.getElementById('skillPanel');
    var host = document.getElementById('skillBars');
    if (!panel || !host || !P.pSkillStats) return;
    var sk = P.pSkillStats();
    if (!sk.length) { panel.style.display = 'none'; return; }
    panel.style.display = '';
    host.innerHTML = '<div class="skill-bars">' + sk.map(function(x){
      var pct = Math.round(x.rate * 100);
      var cls = pct < 60 ? 'rose' : pct < 80 ? 'warn' : 'ok';
      return '<div class="skill-row">' +
        '<span class="sk-name">' + P.esc(x.name) + '</span>' +
        '<span class="sk-bar ' + cls + '"><i style="width:' + pct + '%"></i></span>' +
        '<span class="sk-num">' + x.ok + ' / ' + x.n + '</span>' +
        '<span class="sk-pct ' + cls + '">' + pct + '%</span>' +
      '</div>';
    }).join('') + '</div>';
  }
  draw();
  document.addEventListener('zk:qlog', draw);
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

  /* 完形填空：4 篇直接铺在首页，每篇一张卡，不必再点一层 */
  const czMethod = READING_METHODS.CZ;
  const homeCzCards = CLOZE.map((c, i) => {
    const tag = c.level === '基础' ? '基础' : c.level === '重点' ? '重点' : '难点';
    return `<a class="card passage-card" href="reading/${c.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <h3>${esc(c.title)}</h3>
      <p class="desc">${esc(c.intro)}</p>
      <div class="meta">${c.blanks.length} 空 · ${esc(c.level)}</div>
      <span class="level-go">开始练习 →</span>
    </a>`;
  }).join('');

  /* 完形模块的整体入口卡（放在篇目列表上方，供想先看读法的人） */
  const czCard = `<a class="card level-card" href="reading/cz.html">
    <div class="level-badge" style="background:linear-gradient(135deg,#2563eb,#4f46e5)">CZ</div>
    <h3>${czMethod.icon} ${esc(czMethod.name)}</h3>
    <p class="desc">${esc(czMethod.tagline)}</p>
    <div class="meta">${CLOZE.length} 篇 · ${CLOZE_N} 空 · 8 分</div>
    <span class="level-go">先看读法 →</span>
  </a>`;

  write('reading.html', page({
    title: '学阅读 · 完形 + 阅读理解 + 阅读表达 · 38 分',
    desc: `北京中考英语学阅读：${CLOZE.length} 篇完形（${CLOZE_N} 空）、${PASSAGES.length} 篇阅读理解（${READ_Q} 题）、${EXPRESS_Q} 道阅读表达，共 38 分。完形与四类阅读各有读法，每题给原文定位与错项分析。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head reader-head">
  <div class="crumb"><a href="index.html">首页</a> / 学阅读</div>
  <h1>学阅读</h1>
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

<section class="section" id="skillPanel" style="display:none">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">我的阅读能力</span>
      <h2>四类题型正确率</h2>
      <span class="sub">按你的作答记录实时统计，正确率低的项就是下一步该专攻的方向</span>
    </div>
  </div>
  <div class="card"><div id="skillBars"></div></div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">完形填空 · 独立题型</span>
      <h2>完形填空：考上下文，不考单句</h2>
      <span class="sub">北京卷第二部分 8 分，每篇 8 空，考的是前后呼应、词汇复现与情感线索，和阅读理解是两种不同的读法</span>
    </div>
    <a class="btn sm soft" href="reading/cz.html">进入完形填空 →</a>
  </div>
  <div class="grid c2">${czCard}</div>
  <div class="section-head" style="margin-top:26px">
    <div class="section-head-left">
      <span class="kicker">篇目 · 共 ${CLOZE.length} 篇 ${CLOZE_N} 空</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">每篇 8 空，先通读全文再逐空选择，每空给上下文依据并附全文译文</span>
    </div>
  </div>
  <div class="grid c4 passage-cards">${homeCzCards}</div>
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
      <span class="kicker">题型分值</span>
      <h2>四类题型的备考优先级</h2>
      <span class="sub">阅读理解 26 分是单块最大分值，先把它练稳，再补阅读表达</span>
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
      <div class="card-ico purple">🧠</div>
      <h3>推理判断 · ${SKILL_TALLY.inference || 0} 题</h3>
      <p class="desc">答案不在字面上，要从原文推一步。B 记叙文问「为什么、学到了什么」，D 议论文问「作者为什么提这个」都属此类。</p>
      <div class="meta" style="margin-top:12px">重点：B / D 篇 · 依据必须在原文</div>
    </div>
    <div class="card">
      <div class="card-ico gold">📌</div>
      <h3>主旨与观点 · ${SKILL_TALLY.mainidea || 0} 题</h3>
      <p class="desc">问标题、中心思想、作者立场。C 说明文看每段首句，D 议论文要分清「支持者说、反对者说、作者说」三种声音。</p>
      <div class="meta" style="margin-top:12px">重点：C / D 篇 · 看首末段</div>
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
    script: skillPanelScript,
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
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">学阅读</a> / ${lv} 篇</div>
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
    <a class="btn sm soft" href="../reading.html">← 返回学阅读</a>
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
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">学阅读</a> / <a href="${slug}.html">${lv} ${esc(m.name)}</a> / 第 ${idx + 1} 篇</div>
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
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">学阅读</a> / 完形填空</div>
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
    <a class="btn sm soft" href="../reading.html">← 返回学阅读</a>
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
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">学阅读</a> / <a href="cz.html">完形填空</a> / 第 ${idx + 1} 篇</div>
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
  <div class="crumb"><a href="index.html">首页</a> / 错题本</div>
  <h1>错题本</h1>
  <p class="lede">单词、语法、阅读、完形的错题都自动收纳在这里。单词需连对 2 次才移出；其他题目答对一次即出册，并按遗忘曲线排期复习。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b id="kWn" style="color:var(--rose)">0</b><span>单词错题</span></div>
    <div class="k"><b id="kGn" style="color:var(--rose)">0</b><span>题目错题</span></div>
    <div class="k"><b id="kAll">0</b><span>合计</span></div>
  </div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">单词错题</h2>
      <span class="sub">点「重做」进入背单词模式，答对即移出</span>
    </div>
    <button class="btn ghost sm" id="clearW">清空单词错题</button>
  </div>
  <div id="wlist"></div>
</section>

<section class="section" style="margin-top:28px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">题目错题</h2>
      <span class="sub">点「重做这题」立即重练，答对即移出</span>
    </div>
    <button class="btn ghost sm" id="clearG">清空语法错题</button>
  </div>
  <div id="glist"></div>
</section>

<section class="section" style="margin-top:28px">
  <div id="redoMount"></div>
</section>
`;
  const script = `
ZK.ready(function(){
  var WORDS = ZK_DATA.WORDS;
  var Q = ZK_DATA.QUESTIONS;
  var byWord = {};
  WORDS.forEach(function(w){ byWord[w.w.toLowerCase()] = w; });
  var byQ = {};
  Q.forEach(function(q){ byQ[q.id] = q; });
  // 阅读与完形的错题也要能在错题本里显示——
  // 它们的 id 形如 s1-a-3 / s1-a-e2 / cloze-1-2，需要单独建索引。
  (ZK_DATA.PASSAGES || []).forEach(function(p){
    p.questions.forEach(function(q, i){
      byQ[p.id + '-' + (i + 1)] = {
        id: p.id + '-' + (i + 1), kind: 'reading', src: p.title,
        stem: q.q, options: q.options, answer: q.answer,
        why: q.why, locate: q.locate, trap: q.trap,
      };
    });
    (p.express || []).forEach(function(e, i){
      byQ[p.id + '-e' + (i + 1)] = {
        id: p.id + '-e' + (i + 1), kind: 'express', src: p.title,
        stem: e.q, answer: e.answer, why: e.why,
      };
    });
  });
  (ZK_DATA.CLOZE || []).forEach(function(c){
    c.blanks.forEach(function(b){
      byQ[c.id + '-' + b.n] = {
        id: c.id + '-' + b.n, kind: 'cloze', src: c.title,
        stem: '第 (' + b.n + ') 空', options: b.options, answer: b.answer, why: b.why,
      };
    });
  });

  function drawWords(){
    var wb = ZK.wordBook();
    var keys = Object.keys(wb);
    document.getElementById('kWn').textContent = keys.length;
    document.getElementById('kAll').textContent = keys.length + ZK.wrongIds().length;
    var host = document.getElementById('wlist');
    if (!keys.length) { host.innerHTML = '<div class="empty"><b>暂无单词错题</b>去<a href="quiz.html">背单词</a>，答错的词会自动收进来</div>'; return; }
    host.innerHTML = '<div class="wordlist">' + keys.map(function(k){
      var w = byWord[k];
      if (!w) return '';
      var r = wb[k];
      return '<div class="wrow"><span class="w-cell"><button class="w-say" data-say="'+ZK.esc(w.w)+'">🔊</button>' +
        '<span class="w">'+ZK.esc(w.w)+(w.ph?'<span class="ph">/'+ZK.esc(w.ph)+'/</span>':'')+'</span></span>' +
        '<span class="pos">'+ZK.esc(w.posZh||'')+'</span>' +
        '<span class="zh">'+ZK.esc(w.zh)+'</span>' +
        '<span class="w-right"><span class="flag tag-b3">错 '+r.wrong+' 次</span></span></div>';
    }).join('') + '</div>';
    host.querySelectorAll('[data-say]').forEach(function(b){
      b.addEventListener('click', function(){ ZK.playWord(b.getAttribute('data-say'), { times:1 }); });
    });
  }

  function drawGrammar(){
    var ids = ZK.wrongIds();
    document.getElementById('kGn').textContent = ids.length;
    var host = document.getElementById('glist');
    if (!ids.length) { host.innerHTML = '<div class="empty"><b>暂无语法错题</b>去<a href="review.html">练语法</a>，答错的题会自动收进来</div>'; return; }
    host.innerHTML = ids.map(function(id){
      var q = byQ[id];
      if (!q) return '';
      var gt = null;
      return '<div class="card" style="margin-bottom:12px;padding:18px 20px">' +
        '<div class="qstem" style="font-size:.95rem">'+ZK.esc(q.stem).replace(/___/g,'<span class="blank">　</span>')+'</div>' +
        (q.options ? '<div class="note" style="margin-top:8px">选项：'+q.options.map(function(o,k){return 'ABCD'[k]+'. '+ZK.esc(o);}).join(' · ')+'</div>' : '') +
        '<div class="note" style="margin-top:6px;color:var(--ok)">参考答案：'+ZK.esc(q.type==='fill'?q.answer:q.options[q.answer])+'</div>' +
        '<div class="note" style="margin-top:6px">'+ZK.esc(q.why)+'</div>' +
        '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn primary sm" data-redo="'+ZK.esc(q.id)+'">重做这题</button>' +
        '<button class="btn ghost sm" data-drop="'+ZK.esc(q.id)+'">移出错题本</button>' +
        '</div></div>';
    }).join('');

    host.querySelectorAll('[data-redo]').forEach(function(b){
      b.addEventListener('click', function(){
        var q = byQ[b.getAttribute('data-redo')];
        if (!q) return;
        var mount = document.getElementById('redoMount');
        mount.innerHTML = '<div class="section-head" style="margin-top:0"><div class="section-head-left"><span class="kicker">重做</span><h2 style="font-size:1.15rem">立即重练这一题</h2></div></div><div id="redoBox"></div>';
        ZK.quiz({ mount:'#redoBox', questions:[q], shuffle:false,
          onAnswer: function(){ drawGrammar(); drawWords(); },
          onFinish: function(){ setTimeout(function(){ drawGrammar(); drawWords(); }, 300); },
        });
        mount.scrollIntoView({behavior:'smooth'});
      });
    });
    host.querySelectorAll('[data-drop]').forEach(function(b){
      b.addEventListener('click', function(){
        ZK.qClearWrong(b.getAttribute('data-drop'));
        drawGrammar(); drawWords();
        ZK.toast('已移出错题本');
      });
    });
  }

  document.getElementById('clearW').addEventListener('click', function(){
    if (!window.confirm('确定清空全部单词错题？')) return;
    ZK.wordBookReset(); drawWords(); ZK.toast('已清空单词错题');
  });
  document.getElementById('clearG').addEventListener('click', function(){
    if (!window.confirm('确定清空全部语法错题？')) return;
    ZK.qReset(); drawGrammar(); drawWords(); ZK.toast('已清空语法错题');
  });

  drawWords(); drawGrammar();
});
`;
  write('wrong.html', page({
    title: '错题本',
    desc: '北京中考英语单词错题与语法错题本，支持重做与自动移出。',
    active: 'wrong', body, script, dataKeys: ['WORDS', 'QUESTIONS', 'PASSAGES', 'CLOZE'],
  }));
}

/* ==========================================================
   8. 备考计划
   ========================================================== */
const PLAN = [
  {
    week: 1, title: '摸清底细，打牢基础词',
    goal: '完成一次诊断练习，明确薄弱考点；背完核心高频词的前 150 个。',
    tasks: [
      '去「练语法」用「全部考点 · 混合题型 · 40 题」做一次诊断，看正确率分布。',
      '「背单词」范围选「核心高频」，每天 20 词，共 7 天。',
      '读完语法族「名词」「代词」「冠词」三页，重点看易错对比。',
    ],
    focus: ['noun', 'pronoun', 'article'],
  },
  {
    week: 2, title: '时态主线，串起动词体系',
    goal: '掌握七种时态的构成与标志词，尤其区分一般过去与现在完成。',
    tasks: [
      '读「动词时态」全族 7 个考点，把每个时态的标志词抄一遍。',
      '「练语法」指定考点逐个练：一般现在 → 一般过去 → 现在进行 → 现在完成。',
      '背单词继续每天 20 词，范围切到「中频主力」。',
    ],
    focus: ['tense', 'passive'],
  },
  {
    week: 3, title: '非谓语与情态，攻克高频错点',
    goal: '记牢 to do / doing 的固定搭配，掌握 must 提问的否定回答。',
    tasks: [
      '读「非谓语动词」「情态动词」两族，重点看 enjoy doing / look forward to doing。',
      '「练语法」只练「写作改错」题型 10 题，专治固定搭配错误。',
      '把错题本里的语法错题全部重做一遍。',
    ],
    focus: ['nonfinite', 'modal'],
  },
  {
    week: 4, title: '从句攻坚 + 阅读起步',
    goal: '宾语从句语序、定语从句关系词、状语从句主将从现全部拿下；同时开始练阅读 A 篇。',
    tasks: [
      '读「从句」族 4 个考点，宾语从句的「陈述句语序」要默写一遍。',
      '「练语法」范围选「专攻最弱考点」，做 20 题。',
      '「阅读理解」做第 1 套的 A、B 两篇，重点看解析里的「原文定位」怎么找。',
    ],
    focus: ['clause', 'reading'],
  },
  {
    week: 5, title: '形容词副词介词 + 完形入门',
    goal: '比较等级与时间介词全部正确；掌握完形「先通读再回填」的方法。',
    tasks: [
      '读「形容词与副词」「介词」「数词」三族。',
      '「练语法」练「语法填空」题型 15 题。',
      '「学阅读」→ 完形填空，做第 1 篇，做完先别对答案，回读全文检查逻辑，再看解析。',
    ],
    focus: ['adjadv', 'prep', 'cloze'],
  },
  {
    week: 6, title: '阅读主攻，拿下 38 分',
    goal: '四类文章的读法成型，阅读错题控制在 2 个以内；阅读表达会用完整句作答。',
    tasks: [
      '「阅读理解」做第 1 套的 C、D 两篇，D 篇注意区分「作者观点」与「他人观点」。',
      '做第 1 套的 4 道阅读表达，必须写完整英文句子。',
      '「练语法」范围选「专攻最弱考点」，做 20 题保持手感。',
    ],
    focus: ['reading'],
  },
  {
    week: 7, title: '写作成文 + 完形提速',
    goal: '四类文体各写一篇，字数达标、要点齐全；完形错不超过 2 个。',
    tasks: [
      '读「书面表达」的结构模板与句型库，把通知、书信两类的写作块各抄一遍。',
      '按「书面表达」的结构模板，自己限时 20 分钟写一篇通知或书信，再对照评分要点与失分点逐条自查。',
      '「学阅读」→ 完形填空，做第 2 篇，限时 10 分钟，做完回读全文查逻辑。',
    ],
    focus: ['writing', 'cloze'],
  },
  {
    week: 8, title: '全真模拟，回归错题',
    goal: '按真实时间做一套完整笔试（60 分），错题本清零。',
    tasks: [
      '限时 90 分钟完整一套：单选 12 题 + 完形 8 空 + 阅读 13 题 + 阅读表达 4 题 + 写一篇作文。',
      '把错题本里剩下的错题全部重做，直到清零。',
      '背单词范围选「核心高频」，快速过一遍，把标「已掌握」的再确认一次。',
    ],
    focus: ['mock'],
  },
];

function buildPlan() {
  const cards = PLAN.map((p) => `<div class="card plan-card">
    <div class="plan-head">
      <span class="plan-week">第 ${p.week} 周</span>
      <label class="plan-check"><input type="checkbox" data-week="${p.week}"><span>已完成</span></label>
    </div>
    <h3>${esc(p.title)}</h3>
    <p class="desc">${esc(p.goal)}</p>
    <ul class="plan-tasks">${p.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="plan-links">${p.focus.map((f) => {
      const g = GRAMMAR.find((x) => x.id === f);
      if (g) return `<a class="chip" href="grammar/${g.id}.html">${esc(g.name)}</a>`;
      const map = {
        mock: ['review.html', '全真练习'],
        reading: ['reading.html', '阅读理解'],
        cloze: ['reading/cz.html', '完形填空'],
        writing: ['writing.html', '书面表达'],
      };
      const m = map[f];
      return m ? `<a class="chip" href="${m[0]}">${m[1]}</a>` : '';
    }).join('')}</div>
  </div>`).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 备考计划</div>
  <h1>8 周中考英语备考计划</h1>
  <p class="lede">按「词汇地基 → 时态 → 非谓语情态 → 从句 → 篇章入门 → 阅读主攻 → 写作成文 → 全真模拟」推进，四条主线依次接上，每周一个主攻方向，每天 20–30 分钟。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card" style="padding:20px 24px">
    <div class="today-goal-row">
      <span>计划完成进度 <b id="pDone">0</b> / 8 周</span>
      <span class="today-pct" id="pPct">0%</span>
    </div>
    <div class="bar"><i id="pBar" style="width:0%"></i></div>
  </div>
</section>

<section class="section" style="margin-top:24px">
  <div class="grid c2">${cards}</div>
</section>

<section class="section">
  <div class="card">
    <h3>⏱ 每天 20 分钟怎么分配</h3>
    <table class="tbl" style="margin-top:12px">
      <thead><tr><th>时段</th><th>内容</th><th>时长</th></tr></thead>
      <tbody>
        <tr><td>第 1 段</td><td>背单词（到期复习 + 新词）</td><td>10 分钟</td></tr>
        <tr><td>第 2 段</td><td>练语法（10 题左右）</td><td>10 分钟</td></tr>
        <tr><td>周中加练</td><td>读一篇完形或阅读，做完看原文定位解析</td><td>15 分钟</td></tr>
        <tr><td>周末加练</td><td>清错题本 + 专攻最弱考点 + 按写作模板写一篇短文并自查</td><td>30–40 分钟</td></tr>
      </tbody>
    </table>
    <p class="note" style="margin-top:10px">关键是每天不断，而不是某天学很久。连续打卡天数会记录在首页与背单词页。四条主线的顺序是按卷面依赖关系排的：词不认识就读不懂篇章，篇章不练就写不出句子。</p>
  </div>
</section>
`;
  const script = `
ZK.ready(function(){
  var KEY = 'zk-plan-v1';
  var done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ done = {}; }
  function draw(){
    var n = 0;
    document.querySelectorAll('[data-week]').forEach(function(cb){
      var w = cb.getAttribute('data-week');
      cb.checked = !!done[w];
      if (done[w]) n++;
    });
    document.getElementById('pDone').textContent = n;
    var pct = Math.round(n/8*100);
    document.getElementById('pPct').textContent = pct + '%';
    document.getElementById('pBar').style.width = pct + '%';
  }
  document.querySelectorAll('[data-week]').forEach(function(cb){
    cb.addEventListener('change', function(){
      var w = cb.getAttribute('data-week');
      if (cb.checked) { done[w] = 1; ZK.sfx('ok'); } else delete done[w];
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch(e){}
      draw();
    });
  });
  draw();
});
`;
  write('plan.html', page({
    title: '8 周备考计划',
    desc: '北京中考英语 8 周备考计划，每周一个主攻方向，每天 20–30 分钟。',
    active: 'plan', body, script, dataKeys: [],
  }));
}

/* ==========================================================
   9. 学习数据
   ========================================================== */
function buildStats() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 学习数据</div>
  <h1>学习数据与档案备份</h1>
  <p class="lede">所有学习记录保存在当前浏览器本地，不上传服务器。换设备或清缓存前，建议先导出备份。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b id="sKnown">0</b><span>已掌握词条</span></div>
    <div class="k"><b id="sSrs">0</b><span>记忆库词条</span></div>
    <div class="k"><b id="sMature">0</b><span>牢固掌握（≥21 天）</span></div>
    <div class="k"><b id="sQn">0</b><span>累计练题</span></div>
    <div class="k"><b id="sRate" style="color:var(--accent)">—</b><span>语法正确率</span></div>
    <div class="k"><b id="sStreak">0</b><span>连续打卡天数</span></div>
  </div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">最近 7 天学习量</h2>
      <span class="sub">柱高表示当日背词数，括号内为练题数</span>
    </div>
  </div>
  <div class="card"><div id="chart" class="chart"></div></div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">各考点掌握诊断</h2>
      <span class="sub">按正确率从低到高排序，正确率低于 70% 的建议重点复习</span>
    </div>
  </div>
  <div id="diag"></div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <h2 style="font-size:1.15rem">学习档案备份</h2>
      <span class="sub">导出为 JSON 文件，可在另一台设备导入恢复</span>
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
  function refresh(){
    document.getElementById('sKnown').textContent = ZK.knownCount();
    var st = ZK.srsStats();
    document.getElementById('sSrs').textContent = st.total;
    document.getElementById('sMature').textContent = st.mature;
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

    // 考点诊断
    var rates = ZK.topicRates();
    var host = document.getElementById('diag');
    if (!rates.length) {
      host.innerHTML = '<div class="empty"><b>还没有练习记录</b>去<a href="review.html">练语法</a>，这里会显示各考点的掌握情况</div>';
      return;
    }
    var gt = {};
    ZK_DATA.GRAMMAR.forEach(function(g){ g.topics.forEach(function(t){ gt[t.id] = { name:t.name, family:g.name }; }); });
    host.innerHTML = '<div class="card"><table class="tbl"><thead><tr><th>考点</th><th>所属语法族</th><th>答对/总数</th><th>正确率</th></tr></thead><tbody>' +
      rates.map(function(r){
        var info = gt[r.id] || { name: r.id, family: '—' };
        var pct = Math.round(r.rate*100);
        var color = pct >= 80 ? 'var(--ok)' : pct >= 60 ? 'var(--gold)' : 'var(--rose)';
        return '<tr><td><b>' + ZK.esc(info.name) + '</b></td><td>' + ZK.esc(info.family) + '</td>' +
          '<td>' + r.right + ' / ' + r.total + '</td>' +
          '<td style="color:' + color + ';font-weight:700">' + pct + '%</td></tr>';
      }).join('') + '</tbody></table></div>';
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
    title: '学习数据与档案备份',
    desc: '北京中考英语学习数据统计、各考点掌握诊断与学习档案备份。',
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
        <tr><td>书面表达</td><td>方法体系</td><td>三条提分线 · ${WRITING_STEPS.length} 步写作法 · ${WRITING_STRUCTURES.length} 类结构模板 · ${WRITING_PHRASE_N} 句句型库 · ${WRITING_TRAPS.length} 个失分点；不附范文，范文由学生自己写</td></tr>
        <tr><td>阅读能力维度</td><td>${SKILL_TALLY.detail || 0} / ${SKILL_TALLY.inference || 0} / ${SKILL_TALLY.mainidea || 0} / ${SKILL_TALLY.context || 0}</td><td>按题干规则把每道选择题归入「细节定位 / 推理判断 / 主旨与观点 / 上下文逻辑」，用于统计各维度正确率。归类是关键词规则的启发式判断，个别题可能与教学口径略有出入</td></tr>
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
      <li>语法考点、练习题、完形与阅读篇章，以及写作的方法与范文要点，均为按北京卷题型编写的<b>原创内容</b>，不是官方真题或官方出版材料。</li>
      <li>学阅读为 <b>${PASSAGES.length} 篇阅读 + ${CLOZE.length} 篇完形</b>，阅读表达 <b>${EXPRESS_Q} 题</b>；篇目数量少于真实卷面套数，用于按类型反复练读法，不是完整套卷。</li>
      <li>阅读能力维度（细节 / 推理 / 主旨 / 上下文）是按<b>题干关键词规则</b>自动归类的，不是人工逐题标注；个别题可能被归到相邻类别，用于看大致薄弱方向即可。</li>
      <li>阅读表达的判分按<b>关键词组匹配</b>，只检查信息点是否答到，不评判语法与拼写细节——真实阅卷会看语言质量，请以自己写完整句为准。</li>
      <li>写作部分提供方法与练习，<b>不附范文、也不做自动批改</b>：写完请对照评分要点与六个失分点自查。</li>
      <li>听说机考 40 分需要专用音频与录音评测，<b>不在本站范围</b>，请配合北京教育考试院官方体验系统或真题练习。</li>
      <li>词频分档是启发式推断，不要当作官方难度等级使用。</li>
      <li>学习记录保存在浏览器 localStorage，换浏览器或清缓存会丢失，请用「学习数据」页的导出备份。</li>
      <li>词条发音优先使用预生成音频；若某词没有音频，会退回浏览器自带的语音合成，音色因设备而异。</li>
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
buildPlan();
buildStats();
buildContent();

/* ---------------- 自检 ---------------- */
console.log('=== 构建完成 ===');
console.log(`词条 ${STATS.total}（单词 ${STATS.words} · 短语 ${STATS.phrases}）`);
console.log(`主题 ${THEME_SORTED.length} 个`);
console.log(`语法 ${GRAMMAR_STATS.families} 族 ${GRAMMAR_STATS.topics} 考点 ${GRAMMAR_STATS.traps} 易错`);
console.log(`语法题 ${Q_STATS.total}（选择 ${Q_STATS.choice} · 改错 ${Q_STATS.correct} · 填空 ${Q_STATS.fill}）`);
console.log(`阅读能力维度：细节 ${SKILL_TALLY.detail || 0} · 推理 ${SKILL_TALLY.inference || 0} · 主旨 ${SKILL_TALLY.mainidea || 0} · 上下文 ${SKILL_TALLY.context || 0}`);

if (Q_MISS.length) {
  console.error('✕ 以下考点没有对应题目：', Q_MISS.join(', '));
  process.exitCode = 1;
} else {
  console.log('✓ 全部语法考点都有对应题目');
}
