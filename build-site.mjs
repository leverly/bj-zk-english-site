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
      <p style="line-height:1.7;margin:0;color:var(--text-2)">面向北京中考英语的系统备考站。${STATS.total} 条大纲词条、${GRAMMAR_STATS.topics} 个语法考点、${Q_STATS.total} 道语法精练。</p>
    </div>
    <div class="col">
      <h4>每日备考</h4>
      <a href="${base}quiz.html">背单词</a>
      <a href="${base}review.html">练语法</a>
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
  const ALL = { WORDS, THEMES, STATS, GRAMMAR, GRAMMAR_STATS, QUESTIONS: ALL_Q, QUESTIONS_2 };
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
      <div class="hero-badge"><span class="dot-live"></span>对齐北京中考英语考试说明 · 100 分制</div>
      <h1>北京中考英语，<br><span class="accent-word">词汇 · 语法</span>一站通关</h1>
      <p class="lede">
 专为北京初中生打造的中考英语备考系统：<b>${STATS.total} 条大纲词条</b>（含 ${STATS.phrases} 条高频短语），
 <b>${GRAMMAR_STATS.topics} 个语法考点配中式易错避坑</b>，<b>${Q_STATS.total} 道语法精练</b>，
 每天 20 分钟跟着遗忘曲线闯关，进步看得见。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="quiz.html">开始背单词 <span aria-hidden="true">→</span></a>
        <a class="btn" href="review.html">练语法</a>
        <a class="btn ghost" href="plan.html">看备考计划</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 对齐北京卷题型结构</span>
        <span><b>✓</b> 词表按中考大纲整理</span>
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
          <span class="mi-main"><b>第一步：按遗忘曲线背单词</b><small>先过高频核心词，答错 10 分钟后再现</small></span>
          <span class="mi-go">开始 →</span>
        </a>
        <a class="mission-item" href="review.html">
          <span class="mi-ico purple">⚡</span>
          <span class="mi-main"><b>第二步：考点专项练语法</b><small>每天 10–20 题，专攻正确率低的薄弱考点</small></span>
          <span class="mi-go">去练 →</span>
        </a>
        <a class="mission-item" href="wrong.html">
          <span class="mi-ico rose">🎯</span>
          <span class="mi-main"><b>第三步：清空今日错题本</b><small>自动收纳错词错题，答对即移出</small></span>
          <span class="mi-go">查看 →</span>
        </a>
      </div>
    </div>
  </div>

  <div class="stats reveal">
    <div class="stat"><b data-count="${STATS.words}">${STATS.words}</b><span>大纲单词</span><small>含音标与中文释义</small></div>
    <div class="stat"><b data-count="${STATS.phrases}">${STATS.phrases}</b><span>高频短语</span><small>单选与完形的高频搭配</small></div>
    <div class="stat"><b data-count="${GRAMMAR_STATS.topics}">${GRAMMAR_STATS.topics}</b><span>语法考点</span><small>覆盖 ${GRAMMAR_STATS.families} 大语法族</small></div>
    <div class="stat"><b data-count="${GRAMMAR_STATS.traps}">${GRAMMAR_STATS.traps}</b><span>易错对比</span><small>✕ 错句 vs ✓ 对句</small></div>
    <div class="stat"><b data-count="${Q_STATS.total}">${Q_STATS.total}</b><span>语法精练</span><small>单选 · 改错 · 填空</small></div>
  </div>
</section>

      <span class="kicker">提分闭环</span>
      <h2>为什么每天 20 分钟就能稳住分数？</h2>
      <span class="sub">把备考拆成能坚持、看得见效果的 4 步</span>
    </div>
  </div>
  <div class="grid c4">
    <div class="card step-card">
      <span class="step-num">STEP 01</span>
      <h3>按词频分级 + 抗遗忘</h3>
      <p class="desc">先拿下 ${STATS.core} 个核心高频词，再攻中频。SM-2 遗忘曲线自动排期，答错 10 分钟复现，告别「背了又忘」。</p>
    </div>
    <div class="card step-card">
      <span class="step-num">STEP 02</span>
      <h3>直击中式语法坑</h3>
      <p class="desc">不照搬枯燥语法书，把 ${GRAMMAR_STATS.topics} 个考点提炼成规则 + 构成 + ${GRAMMAR_STATS.traps} 组红绿对比错句。</p>
    </div>
    <div class="card step-card">
      <span class="step-num">STEP 03</span>
      <h3>对齐北京卷题型</h3>
      <p class="desc">单选、改错、语法填空混编，每题即时给解析，自动定位正确率最低的考点。</p>
    </div>
    <div class="card step-card">
      <span class="step-num">STEP 04</span>
      <h3>错题闭环 + 备份</h3>
      <p class="desc">错题连对 2 次才移出错题本；所有学习记录本地保存，支持随时导出备份换设备。</p>
    </div>
  </div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">核心模块</span>
      <h2>词汇与语法双线联动</h2>
      <span class="sub">两项都对齐北京中考英语的考查范围</span>
    </div>
  </div>
  <div class="grid c3">
    <a class="card" href="words.html">
      <div class="card-ico">📚</div>
      <h3>大纲词表 · ${STATS.total} 条</h3>
      <p class="desc">按义务教育英语课程标准三级词汇整理，含音标、词性、中文释义，并单独收录 ${STATS.phrases} 条高频短语。</p>
      <div class="meta" style="margin-top:12px">核心 ${STATS.core} · 中频 ${STATS.mid} · 拓展 ${STATS.ext}</div>
    </a>
    <a class="card" href="grammar.html">
      <div class="card-ico purple">📐</div>
      <h3>语法体系 · ${GRAMMAR_STATS.families} 族 ${GRAMMAR_STATS.topics} 考点</h3>
      <p class="desc">从名词冠词到三大从句与情景交际，按中考考查权重排序，每个考点都能一键跳转专项练习。</p>
      <div class="meta" style="margin-top:12px">${GRAMMAR_STATS.traps} 条易错对比 · ${GRAMMAR_STATS.examples} 个精选例句</div>
    </a>
    <a class="card" href="review.html">
      <div class="card-ico ok">✍️</div>
      <h3>考点专项练 · ${Q_STATS.total} 题</h3>
      <p class="desc">覆盖全部 ${GRAMMAR_STATS.topics} 个考点，自动统计各考点正确率，支持「专攻最弱考点」与「只练错题本」。</p>
      <div class="meta" style="margin-top:12px">单选 ${Q_STATS.choice} · 改错 ${Q_STATS.correct} · 填空 ${Q_STATS.fill}</div>
    </a>
  </div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">主题词库</span>
      <h2>按三大主题语境成组记词</h2>
      <span class="sub">阅读和写作总围绕同一主题出词，成组记忆效率翻倍</span>
    </div>
    <a class="btn sm soft" href="themes/index.html">查看全部 ${THEME_SORTED.length} 个主题 →</a>
  </div>
  <div class="grid c3">${themeCards}</div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">语法图谱</span>
      <h2>按 ${GRAMMAR_STATS.families} 大语法族逐个击破</h2>
      <span class="sub">直击单项填空与写作的丢分重灾区</span>
    </div>
    <a class="btn sm soft" href="grammar.html">进入完整语法体系 →</a>
  </div>
  <div class="grid c3">${grammarCards}</div>
</section>

<section class="section reveal" id="faq">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">常见问题</span>
      <h2>关于北京中考英语备考，你可能想了解</h2>
    </div>
  </div>
  <div class="faq-list">
    <details class="faq-item" open>
      <summary>这套系统适合哪个年级的学生？</summary>
      <p>适合北京初中 7–9 年级正在准备中考英语的学生。初一初二可以按主题循序推进，初三建议直接从「核心高频 ${STATS.core} 词」和标注为「难点」的语法考点切入，配合每周一次「专攻最弱考点」专项练习。</p>
    </details>
    <details class="faq-item">
      <summary>每天需要花多长时间？</summary>
      <p>建议每天 20–30 分钟：10 分钟背 20 个单词（系统自动安排到期复习 + 新词），10 分钟练 10 道语法题，周末再花 15 分钟做一篇完形或阅读并清一次错题本。</p>
    </details>
    <details class="faq-item">
      <summary>手机和平板能用吗？需要下载 App 吗？</summary>
      <p>全端自适应，手机、平板和电脑浏览器打开就能学，无需安装 App、无弹窗广告。所有词条支持点击朗读，读音为英式发音。</p>
    </details>
    <details class="faq-item">
      <summary>学习记录会丢吗？换设备怎么办？</summary>
      <p>记录实时保存在当前浏览器中，离线也能用。换设备或担心清缓存时，可在「学习数据」页一键导出档案，在新设备导入即可无缝恢复。</p>
    </details>
    <details class="faq-item">
      <summary>词表和语法点是官方发布的吗？</summary>
      <p>词表基于义务教育英语课程标准三级词汇，并参考公开词典的中考标签整理；语法考点与题目是按北京中考英语考试说明与北京卷真题题型编写的原创内容，不是官方出版材料。频档为按语料词频的启发式分档，详见<a href="content.html">内容说明</a>。</p>
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
    desc: `对齐北京中考英语考试说明的备考站：${STATS.total} 条大纲词条、${GRAMMAR_STATS.topics} 个语法考点、${Q_STATS.total} 道语法精练。`,
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
      <span>今日已背 <b id="kToday">0</b> / <b id="kGoal">20</b> 词 · 🔥 连续打卡 <b id="kStreak">0</b> 天</span>
      <span class="today-pct" id="kPct">0%</span>
    </div>
    <div class="bar"><i id="kBar" style="width:0%"></i></div>
    <div class="chips" style="margin-top:14px" id="goalChips">
      <span class="goal-label" style="margin-right:6px">每日目标</span>
      <button class="chip" data-goal="10">10 词</button>
      <button class="chip on" data-goal="20">20 词</button>
      <button class="chip" data-goal="30">30 词</button>
      <button class="chip" data-goal="50">50 词</button>
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
        <p class="setup-hint" style="margin-top:0">每轮出 <b id="lenEcho">20</b> 词，与上方「每日目标」保持一致</p>
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
  document.querySelectorAll('#goalChips .chip').forEach(c => {
    c.classList.toggle('on', parseInt(c.getAttribute('data-goal'), 10) === Z.goal());
  });
  set('#lenEcho', Z.goal());
}
refreshDaily();
document.addEventListener('zk:day', refreshDaily);
document.querySelectorAll('#goalChips .chip').forEach(c => {
  c.addEventListener('click', () => { Z.setGoal(c.getAttribute('data-goal')); refreshDaily(); });
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

      return `<details class="gcard"${i === 0 ? ' open' : ''}>
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
function buildReview() {
  const topicOpts = GRAMMAR.map((g) => `<optgroup label="${esc(g.name)}">
    ${g.topics.map((t) => `<option value="${t.id}">${esc(t.name)}（${(Q_BY_TOPIC.get(t.id) || []).length} 题）</option>`).join('')}
  </optgroup>`).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 练语法</div>
  <h1>考点专项练语法</h1>
  <p class="lede">${Q_STATS.total} 道精练题覆盖 <b>${GRAMMAR_STATS.topics} 个中考核心考点</b>。系统实时追踪各考点正确率，答错的题自动进错题本，答对后按遗忘曲线排期复习。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b id="kQn">0</b><span>累计练习题数</span></div>
    <div class="k"><b id="kRate" style="color:var(--accent)">—</b><span>综合正确率</span></div>
    <div class="k"><b id="kWrong" style="color:var(--rose)">0</b><span>语法错题本</span></div>
    <div class="k"><b id="kDue">—</b><span>到期复习题</span></div>
  </div>
</section>

<section class="section" style="margin-top:24px" id="setup">
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
        <div class="kicker">题型</div>
        <div class="chips" id="typeChips">
          <button class="chip on" data-t="all">混合题型</button>
          <button class="chip" data-t="choice">单项填空</button>
          <button class="chip" data-t="correct">写作改错</button>
          <button class="chip" data-t="fill">语法填空</button>
        </div>
        <p class="setup-hint">混合模式最贴近真实卷面顺序</p>
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

      <div class="setup-group">
        <div class="kicker">指定考点（可选）</div>
        <select id="topicSel" class="select">
          <option value="">全部考点</option>
          ${topicOpts}
        </select>
        <p class="setup-hint">从语法页点进来时会自动选中对应考点</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="margin-top:20px">
  <div id="quizMount">
    <div class="empty"><b>点上方「开始刷题」进入练习</b>先配置范围、题型和题量</div>
  </div>
</section>
`;
  const script = `
ZK.ready(function(){
  var Q = ZK_DATA.QUESTIONS;
  var scope='all', type='all', len=20, topic='';

  function refreshKv(){
    var ql = ZK.qLog();
    var n=0, right=0;
    Object.keys(ql.topicStats).forEach(function(k){ var t=ql.topicStats[k]; n+=t.right+t.wrong; right+=t.right; });
    document.getElementById('kQn').textContent = n;
    document.getElementById('kRate').textContent = n ? Math.round(right/n*100)+'%' : '—';
    var wn = ZK.wrongIds().length;
    document.getElementById('kWrong').textContent = wn;
    document.getElementById('wrongN').textContent = wn;
    var now = Date.now(), due=0;
    Q.forEach(function(q){ var d=ZK.qDue(q.id); if(!d || !d.due || d.due<=now) due++; });
    document.getElementById('kDue').textContent = due;
    document.getElementById('dueN').textContent = due;
  }

  function buildPool(){
    var list = Q.slice();
    if (topic) list = list.filter(function(q){ return q.topic===topic; });
    if (type !== 'all') list = list.filter(function(q){ return q.type===type; });
    if (scope === 'wrong') {
      var ids = ZK.wrongIds();
      list = list.filter(function(q){ return ids.indexOf(q.id)>=0; });
    } else if (scope === 'weak') {
      var rates = ZK.topicRates();
      var weakIds = rates.slice(0,3).map(function(r){ return r.id; });
      var weak = list.filter(function(q){ return weakIds.indexOf(q.topic)>=0; });
      if (weak.length) list = weak;
    }
    // 未到期的题不重复出（错题本与最弱考点范围不过滤，保证能针对性练）
    if (scope === 'all') {
      var now = Date.now();
      var fresh = list.filter(function(q){ var d=ZK.qDue(q.id); return !d || !d.due || d.due<=now; });
      if (fresh.length >= 5) list = fresh;
    }
    return list;
  }

  function start(){
    var pool = ZK.shuffle(buildPool()).slice(0, len);
    if (!pool.length) {
      document.getElementById('quizMount').innerHTML = '<div class="empty"><b>当前条件下没有可练的题</b>换个范围或题型试试</div>';
      return;
    }
    ZK.quiz({
      mount:'#quizMount', questions: pool, shuffle:false,
      onAnswer: function(){ refreshKv(); },
      onFinish: function(){ refreshKv(); },
      onRestart: function(){ start(); },
    });
  }

  document.querySelectorAll('#scopeChips .chip').forEach(function(c){
    c.addEventListener('click', function(){
      document.querySelectorAll('#scopeChips .chip').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on'); scope = c.getAttribute('data-scope');
    });
  });
  document.querySelectorAll('#typeChips .chip').forEach(function(c){
    c.addEventListener('click', function(){
      document.querySelectorAll('#typeChips .chip').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on'); type = c.getAttribute('data-t');
    });
  });
  document.querySelectorAll('#lenChips .chip').forEach(function(c){
    c.addEventListener('click', function(){
      document.querySelectorAll('#lenChips .chip').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on'); len = parseInt(c.getAttribute('data-l'),10);
    });
  });
  document.getElementById('topicSel').addEventListener('change', function(e){
    topic = e.target.value;
  });
  document.getElementById('startBtn').addEventListener('click', function(){
    start();
    document.getElementById('quizMount').scrollIntoView({behavior:'smooth', block:'start'});
  });
  document.getElementById('resetBtn').addEventListener('click', function(){
    if (!window.confirm('确定清空所有语法练习记录与错题本？此操作不可撤销。')) return;
    ZK.qReset(); refreshKv(); ZK.toast('已清空练习记录');
  });

  // 从语法页带 topic 参数进来
  var m = location.search.match(/[?&]topic=([^&]+)/);
  if (m) {
    topic = decodeURIComponent(m[1]);
    var sel = document.getElementById('topicSel');
    if (sel) { sel.value = topic; }
    setTimeout(function(){ start(); document.getElementById('quizMount').scrollIntoView({behavior:'smooth'}); }, 120);
  }

  refreshKv();
});
`;
  write('review.html', page({
    title: '练语法 · 考点专项',
    desc: `${Q_STATS.total} 道北京中考英语语法精练题，覆盖 ${GRAMMAR_STATS.topics} 个考点，自动定位薄弱项。`,
    active: 'grammar-drill', body, script, dataKeys: ['QUESTIONS'],
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
  <p class="lede">单词错题与语法错题自动收纳在这里。单词答对一次即移出，语法题答对后按遗忘曲线排期复习。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b id="kWn" style="color:var(--rose)">0</b><span>单词错题</span></div>
    <div class="k"><b id="kGn" style="color:var(--rose)">0</b><span>语法错题</span></div>
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
      <h2 style="font-size:1.15rem">语法错题</h2>
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
    active: 'wrong', body, script, dataKeys: ['WORDS', 'QUESTIONS'],
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
    week: 4, title: '从句攻坚，理清三大从句',
    goal: '宾语从句的语序、定语从句的关系代词、状语从句的主将从现全部拿下。',
    tasks: [
      '读「从句」族 4 个考点，宾语从句的「陈述句语序」要默写一遍。',
      '「练语法」范围选「专攻最弱考点」，做 20 题。',
      '把「从句」族的 4 个考点各练 5 题，直到正确率上到 80%。',
    ],
    focus: ['clause', 'conjunction'],
  },
  {
    week: 5, title: '形容词副词与介词，补齐细节分',
    goal: '比较等级、as…as、the more…the more 与 in/on/at 时间介词全部正确。',
    tasks: [
      '读「形容词与副词」「介词」「数词」三族。',
      '「练语法」练「语法填空」题型 15 题。',
      '练「易混点」类题目：since/for、few/little、used to/be used to 各 3 题。',
    ],
    focus: ['adjadv', 'prep', 'numeral'],
  },
  {
    week: 6, title: '综合强化，扫清剩余薄弱点',
    goal: '全部 57 个考点的正确率都上到 80% 以上，错题本清零一轮。',
    tasks: [
      '「练语法」范围选「专攻最弱考点」，连续做 3 组、每组 20 题。',
      '背单词范围切到「只背短语」，155 条短语过一遍。',
      '把错题本里的语法错题全部重做，直到清零。',
    ],
    focus: ['agreement', 'sentence'],
  },
  {
    week: 7, title: '题型专攻，三种题型各打一轮',
    goal: '单选、改错、语法填空三种题型各做一轮，掌握各自的解题节奏。',
    tasks: [
      '「练语法」只练「单项填空」题型，做 20 题，控制在 8 分钟内。',
      '只练「写作改错」题型 15 题，专治固定搭配与中式表达。',
      '只练「语法填空」题型 15 题，注意词形变化与时态。',
    ],
    focus: ['nonfinite', 'modal'],
  },
  {
    week: 8, title: '全真模拟，回归错题',
    goal: '按真实时间做一套完整笔试，错题本清零。',
    tasks: [
      '限时 12 分钟：单选 12 题（按真实卷面节奏做）。',
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
      const map = { mock: ['review.html', '全真练习'] };
      const m = map[f];
      return m ? `<a class="chip" href="${m[0]}">${m[1]}</a>` : '';
    }).join('')}</div>
  </div>`).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 备考计划</div>
  <h1>8 周中考英语备考计划</h1>
  <p class="lede">按「基础 → 时态 → 非谓语情态 → 从句 → 细节 → 综合 → 题型 → 模拟」的顺序推进，每周一个主攻方向，每天 20–30 分钟。</p>
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
        <tr><td>周末加练</td><td>清错题本 + 专攻最弱考点</td><td>20–30 分钟</td></tr>
      </tbody>
    </table>
    <p class="note" style="margin-top:10px">关键是每天不断，而不是某天学很久。连续打卡天数会记录在首页与背单词页。</p>
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
    <p class="desc" style="margin-top:8px">北京中考英语总分 <b>100 分</b>，其中笔试 <b>60 分</b>、听说机考 <b>40 分</b>。本站聚焦笔试中的语法与词汇部分。笔试 90 分钟、共 38 小题、五道大题：</p>
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
      <li>语法考点、练习题、完形、阅读与写作范文均为按北京卷题型编写的<b>原创内容</b>，不是官方真题或官方出版材料。</li>
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
    <p class="desc" style="margin-top:8px">语法与题目数据是手写源文件（src/data-grammar.js、data-quiz.js、data-quiz2.js），直接编辑后重跑构建即可。</p>
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

if (Q_MISS.length) {
  console.error('✕ 以下考点没有对应题目：', Q_MISS.join(', '));
  process.exitCode = 1;
} else {
  console.log('✓ 全部语法考点都有对应题目');
}
