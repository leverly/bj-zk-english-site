/* ==========================================================
   中考英语领航 · 运行时 v1
   主题 / 学习档案 / 间隔重复(SRS) / 词表 / 测验 / 阅读 / 写作
   纯前端，localStorage 持久化。设计沿用 PET 备考站验证过的机制。
   ========================================================== */
(function () {
  'use strict';
  var Z = window.ZK = window.ZK || {};

  /* ---------------- 工具 ---------------- */
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  Z.esc = esc;
  var escRe = function (s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  Z.hl = function (t, q) {
    if (!q) return esc(t);
    return esc(t).replace(new RegExp('(' + escRe(q) + ')', 'gi'), '<mark>$1</mark>');
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  Z.ready = ready;

  /* ---------------- Toast ---------------- */
  var toastEl = null, toastTimer = null;
  Z.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  };

  /* ---------------- 轻音效 ---------------- */
  var sfxOn = load('zk-sfx-v1', true);
  var audioCtx = null;
  Z.sfxEnabled = function () { return !!sfxOn; };
  Z.setSfx = function (on) { sfxOn = !!on; store('zk-sfx-v1', sfxOn); };
  Z.sfx = function (kind) {
    if (!sfxOn) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      function tone(freq, start, dur, gainVal, type) {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(gainVal, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(start); o.stop(start + dur + 0.02);
      }
      if (kind === 'ok') {
        tone(587.33, now, 0.11, 0.06, 'sine');
        tone(880, now + 0.07, 0.16, 0.06, 'sine');
      } else if (kind === 'bad') {
        tone(240, now, 0.18, 0.05, 'triangle');
      } else if (kind === 'win') {
        tone(523.25, now, 0.13, 0.06, 'sine');
        tone(659.25, now + 0.09, 0.13, 0.06, 'sine');
        tone(783.99, now + 0.18, 0.24, 0.07, 'sine');
      }
    } catch (e) {}
  };

  /* ---------------- 主题：按本地时间自动切换，可手动覆盖 ---------------- */
  var THEME_KEY = 'zk-theme-manual';
  function autoThemeByTime() {
    var h = new Date().getHours();
    return (h >= 19 || h < 6) ? 'dark' : 'light';
  }
  function resolveTheme() {
    var m = load(THEME_KEY, null);
    return (m === 'light' || m === 'dark') ? m : autoThemeByTime();
  }
  function applyTheme(t, save) {
    document.documentElement.setAttribute('data-theme', t);
    if (save) store(THEME_KEY, t);
  }
  Z.theme = function () { return document.documentElement.getAttribute('data-theme') || resolveTheme(); };
  Z.toggleTheme = function () { applyTheme(Z.theme() === 'light' ? 'dark' : 'light', true); };
  Z.resetThemeAuto = function () { store(THEME_KEY, null); applyTheme(autoThemeByTime(), false); };

  /* ---------------- 学习档案 / 中考倒计时 ---------------- */
  var PROFILE_KEY = 'zk-profile-v1';
  var profile = load(PROFILE_KEY, { examDate: '', target: '115' });
  Z.profile = function () { return Object.assign({}, profile); };
  Z.saveProfile = function (patch) {
    profile = Object.assign(profile, patch || {});
    store(PROFILE_KEY, profile);
    document.dispatchEvent(new CustomEvent('zk:profile', { detail: profile }));
  };
  Z.daysLeft = function () {
    if (!profile.examDate) return null;
    var t = new Date(profile.examDate + 'T00:00:00');
    if (isNaN(t.getTime())) return null;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((t - today) / 86400000);
  };

  /* ---------------- 已掌握词 ---------------- */
  var KNOWN_KEY = 'zk-known-v1';
  var known = load(KNOWN_KEY, {});
  Z.isKnown = function (w) { return !!known[String(w).toLowerCase()]; };
  Z.setKnown = function (w, on) {
    var k = String(w).toLowerCase();
    if (on) known[k] = 1; else delete known[k];
    store(KNOWN_KEY, known);
    document.dispatchEvent(new CustomEvent('zk:known', { detail: { word: w, on: !!on } }));
  };
  Z.toggleKnown = function (w) {
    var on = !Z.isKnown(w);
    Z.setKnown(w, on);
    return on;
  };
  Z.knownCount = function () { return Object.keys(known).length; };
  Z.clearKnown = function () {
    known = {}; store(KNOWN_KEY, known);
    document.dispatchEvent(new CustomEvent('zk:known', { detail: { reset: true } }));
  };

  /* ---------------- 间隔重复（SM-2 简化版，语义对齐 PET 项目） ----------------
     评分四档：0 = 忘了，1 = 有点模糊，2 = 记住了，3 = 秒杀很熟
     字段：ease 难度因子 ｜ ivl 当前间隔（天）｜ due 下次到期时间 ｜ reps 复习次数
           lapses 遗忘次数 ｜ ans/okc 准确率计数（「模糊」不计入）
     ---------------- */
  var SRS_KEY = 'zk-srs-v1';
  var srs = load(SRS_KEY, {});
  var DAY = 86400000;
  Z.srsGet = function (w) { return srs[String(w).toLowerCase()] || null; };
  Z.srsAll = function () { return srs; };
  Z.srsDueCount = function (list) {
    var now = Date.now();
    if (!list) return Object.keys(srs).filter(function (k) { return (srs[k].due || 0) <= now; }).length;
    return list.filter(function (w) {
      var r = srs[String(w.w || w).toLowerCase()];
      return !r || (r.due || 0) <= now;
    }).length;
  };
  Z.srsStats = function () {
    var now = Date.now(), keys = Object.keys(srs);
    var due = 0, learning = 0, mature = 0, sum = 0;
    keys.forEach(function (k) {
      var r = srs[k];
      if (!r) return;
      if ((r.due || 0) <= now) due++;
      if ((r.ivl || 0) >= 21) mature++; else learning++;
      sum += (r.reps || 0);
    });
    return { total: keys.length, due: due, learning: learning, mature: mature, reviews: sum };
  };
  Z.srsRate = function (w, grade) {
    // 先记错题本：grade >= 2 才算答对
    Z.wordAttempt(w, grade >= 2);
    var k = String(w).toLowerCase();
    var r = srs[k] || { ease: 2.5, ivl: 0, due: 0, reps: 0, lapses: 0 };
    if (grade === 0) {
      r.ease = Math.max(1.3, r.ease - 0.2);
      r.ivl = 0;
      r.lapses = (r.lapses || 0) + 1;
      r.due = Date.now() + 10 * 60000;
    } else {
      if (grade === 1) r.ease = Math.max(1.3, r.ease - 0.15);
      if (grade === 3) r.ease = Math.min(3.2, r.ease + 0.15);
      if (r.reps === 0) r.ivl = grade === 1 ? 0.5 : grade === 2 ? 1 : 2;
      else if (r.reps === 1) r.ivl = grade === 1 ? 1 : grade === 2 ? 3 : 5;
      else r.ivl = Math.max(1, Math.round(r.ivl * r.ease * (grade === 1 ? 0.8 : grade === 3 ? 1.25 : 1)));
      r.due = Date.now() + r.ivl * DAY;
    }
    r.reps = (r.reps || 0) + 1;
    r.last = Date.now();
    // 准确率计数：ans 累计作答，okc 累计答对；「有点模糊」(g=1) 不计入分子分母
    if (grade !== 1) {
      r.ans = (r.ans || 0) + 1;
      if (grade >= 2) r.okc = (r.okc || 0) + 1;
    }
    srs[k] = r;
    store(SRS_KEY, srs);
    Z.bumpDay('words', 1);
    document.dispatchEvent(new CustomEvent('zk:srs', { detail: { word: w } }));
    return r;
  };
  /** 按给定词表统计背词准确率；不传则统计全部学过的词 */
  Z.wordAccStats = function (list) {
    var ans = 0, okc = 0;
    var keys = list ? list.map(function (w) { return String(w.w || w).toLowerCase(); }) : Object.keys(srs);
    keys.forEach(function (k) {
      var r = srs[k];
      if (!r) return;
      ans += r.ans || 0;
      okc += r.okc || 0;
    });
    return { answered: ans, correct: okc, rate: ans ? okc / ans : null };
  };
  Z.srsReset = function () {
    srs = {}; store(SRS_KEY, srs);
    document.dispatchEvent(new CustomEvent('zk:srs', { detail: { reset: true } }));
  };

  /* ---------------- 每日学习量与连续天数 ---------------- */
  var DAYLOG_KEY = 'zk-daylog-v1';
  var GOAL_KEY = 'zk-goal-v1';
  var daylog = load(DAYLOG_KEY, {});
  // 归一化为数字：历史数据/导入档案里可能存成字符串 "50"，
  // 若放任字符串流进 goal，todayPct 的除法与 chip 的 === 比较都会失效。
  function normGoal(v) {
    var n = parseInt(v, 10);
    if (!n || n < 5) n = 50;
    return Math.max(5, Math.min(200, n));
  }
  var goal = normGoal(load(GOAL_KEY, 50));
  function dayKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  Z.todayKey = function () { return dayKey(); };
  Z.todayWords = function () { return (daylog[dayKey()] || {}).words || 0; };
  Z.todayQuestions = function () { return (daylog[dayKey()] || {}).questions || 0; };
  Z.goal = function () { return goal; };
  Z.setGoal = function (n) {
    // 必须归一化成数字：chip 传进来的是 data-goal 字符串，
    // 直接存字符串会让 refreshDaily 里的 === 比较永远不成立（高亮全灭）。
    goal = normGoal(n);
    store(GOAL_KEY, goal);
    document.dispatchEvent(new CustomEvent('zk:goal'));
    return goal;
  };
  Z.todayPct = function () { return goal ? Math.min(100, Math.round(Z.todayWords() / goal * 100)) : 0; };
  Z.bumpDay = function (kind, n) {
    var k = dayKey();
    daylog[k] = daylog[k] || {};
    daylog[k][kind] = (daylog[k][kind] || 0) + (n == null ? 1 : n);
    store(DAYLOG_KEY, daylog);
    document.dispatchEvent(new CustomEvent('zk:day', { detail: daylog[k] }));
  };
  Z.streak = function () {
    var n = 0, d = new Date();
    while (true) {
      var rec = daylog[dayKey(d)];
      if (rec && ((rec.words || 0) + (rec.questions || 0)) > 0) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  };
  Z.last7 = function () {
    var out = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var rec = daylog[dayKey(d)] || {};
      out.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), words: rec.words || 0, questions: rec.questions || 0 });
    }
    return out;
  };

  /* ---------------- 单词错题本（语义对齐 PET：连对 2 次才移出） ---------------- */
  var WBOOK_KEY = 'zk-wordbook-v1';
  var wbook = load(WBOOK_KEY, {});
  var MASTER_STREAK = 2;
  Z.wordBook = function () { return wbook; };
  Z.wordBookCount = function () { return Object.keys(wbook).length; };
  Z.wordBookList = function () {
    return Object.keys(wbook).map(function (k) {
      var r = wbook[k];
      return { w: k, wrong: r.wrong || 1, right: r.right || 0, last: r.last || 0, at: r.at || 0 };
    }).sort(function (a, b) { return b.at - a.at; });
  };
  Z.wordAttempt = function (w, ok) {
    var k = String(w).toLowerCase();
    if (!ok) {
      var r = wbook[k] || { wrong: 0, right: 0, at: 0 };
      r.wrong = (r.wrong || 0) + 1;
      r.right = 0;              // 答错即重置连对计数
      r.at = Date.now();
      r.last = r.at;
      wbook[k] = r;
      store(WBOOK_KEY, wbook);
      document.dispatchEvent(new CustomEvent('zk:wordbook', { detail: { word: w, ok: false } }));
      return false;
    }
    // 答对：只有原本在错题本里的词才累计，连对 MASTER_STREAK 次才移出
    var e = wbook[k];
    if (!e) return false;
    e.right = (e.right || 0) + 1;
    e.last = Date.now();
    var mastered = e.right >= MASTER_STREAK;
    if (mastered) delete wbook[k];
    store(WBOOK_KEY, wbook);
    document.dispatchEvent(new CustomEvent('zk:wordbook', { detail: { word: w, ok: true, mastered: mastered } }));
    return mastered;
  };
  Z.wordMaster = function (w) {
    var k = String(w).toLowerCase();
    if (!wbook[k]) return false;
    delete wbook[k];
    store(WBOOK_KEY, wbook);
    document.dispatchEvent(new CustomEvent('zk:wordbook', { detail: { word: w, ok: true, mastered: true } }));
    return true;
  };
  Z.wordBookReset = function () { wbook = {}; store(WBOOK_KEY, wbook); };
  Z.MASTER_STREAK = MASTER_STREAK;

  /* ---------------- 语法题记录（含遗忘曲线排期） ---------------- */
  var QLOG_KEY = 'zk-qlog-v1';
  var qlog = load(QLOG_KEY, { topicStats: {}, wrongIds: {}, qdue: {} });
  if (!qlog.topicStats) qlog.topicStats = {};
  if (!qlog.wrongIds) qlog.wrongIds = {};
  if (!qlog.qdue) qlog.qdue = {};
  Z.qLog = function () { return qlog; };
  Z.qDue = function (id) { return qlog.qdue[id] || null; };
  Z.qRecord = function (topic, ok, id) {
    var t = qlog.topicStats[topic] || { right: 0, wrong: 0 };
    if (ok) t.right++; else t.wrong++;
    qlog.topicStats[topic] = t;
    if (ok) {
      delete qlog.wrongIds[id];
      // 答对：按 0.5/1/3/7/21/60 天递增排下次复习
      var prev = qlog.qdue[id] || { n: 0 };
      var steps = [0.5, 1, 3, 7, 21, 60];
      var n = Math.min((prev.n || 0) + 1, steps.length);
      qlog.qdue[id] = { n: n, due: Date.now() + steps[n - 1] * DAY };
    } else {
      qlog.wrongIds[id] = 1;
      qlog.qdue[id] = { n: 0, due: 0 };
    }
    store(QLOG_KEY, qlog);
  };
  Z.qTopicStats = function () { return qlog.topicStats; };
  Z.wrongIds = function () { return Object.keys(qlog.wrongIds || {}); };
  Z.qClearWrong = function (id) { delete qlog.wrongIds[id]; store(QLOG_KEY, qlog); };
  Z.qReset = function () {
    qlog = { topicStats: {}, wrongIds: {}, qdue: {} };
    store(QLOG_KEY, qlog);
  };
  /** 各考点正确率，按薄弱排序 */
  Z.topicRates = function () {
    return Object.keys(qlog.topicStats).map(function (id) {
      var t = qlog.topicStats[id];
      var n = t.right + t.wrong;
      return { id: id, right: t.right, wrong: t.wrong, total: n, rate: n ? t.right / n : 0 };
    }).filter(function (x) { return x.total > 0; })
      .sort(function (a, b) { return a.rate - b.rate; });
  };

  /* ---------------- 学习等级 ---------------- */
  Z.levelInfo = function () {
    var xp = Z.knownCount() * 2 + Object.keys(qlog.topicStats).reduce(function (s, k) {
      var t = qlog.topicStats[k]; return s + t.right * 3 + t.wrong;
    }, 0) + Z.streak() * 5;
    var lv = Math.floor(Math.sqrt(xp / 50)) + 1;
    var names = ['中考萌新', '词汇学徒', '语法过关', '阅读能手', '写作达人', '中考冲刺', '英语高手', '满分选手'];
    var name = names[Math.min(lv - 1, names.length - 1)];
    var next = Math.pow(lv, 2) * 50;
    return { xp: xp, level: lv, name: name, next: next };
  };

  /* ---------------- 档案备份 ---------------- */
  Z.exportBackup = function () {
    var data = {
      _site: 'zhongkao-english',
      _v: 1,
      _at: new Date().toISOString(),
      known: load(KNOWN_KEY, {}), srs: load(SRS_KEY, {}), daylog: load(DAYLOG_KEY, {}),
      goal: load(GOAL_KEY, 50), wbook: load(WBOOK_KEY, {}), qlog: load(QLOG_KEY, {}),
      profile: load(PROFILE_KEY, {}), theme: load(THEME_KEY, null),
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '中考英语学习档案-' + dayKey() + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };
  Z.importBackup = function (raw) {
    var d;
    try { d = JSON.parse(raw); } catch (e) { return { ok: false, msg: '文件不是有效的 JSON' }; }
    if (!d || d._site !== 'zhongkao-english') return { ok: false, msg: '这不是本网站的备份文件' };
    if (d.known) store(KNOWN_KEY, d.known);
    if (d.srs) store(SRS_KEY, d.srs);
    if (d.daylog) store(DAYLOG_KEY, d.daylog);
    if (d.goal) store(GOAL_KEY, d.goal);
    if (d.wbook) store(WBOOK_KEY, d.wbook);
    if (d.qlog) store(QLOG_KEY, d.qlog);
    if (d.profile) store(PROFILE_KEY, d.profile);
    return { ok: true, msg: '已导入，正在刷新…' };
  };

  /* ---------------- 全局：主题按钮 / 菜单 / 进度条 / 计数动画 ---------------- */
  ready(function () {
    document.body.classList.add('js-ready');

    var tb = document.querySelector('.theme-btn');
    if (tb) tb.addEventListener('click', P_toggle);
    function P_toggle() {
      Z.toggleTheme();
      Z.toast(Z.theme() === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
    }
    applyTheme(resolveTheme(), false);

    var mb = document.querySelector('.menu-btn');
    var nav = document.querySelector('.hdr-nav');
    if (mb && nav) {
      mb.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', nav.classList.contains('open'));
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && e.target !== mb) nav.classList.remove('open');
      });
    }

    /* 当前页高亮 */
    var path = location.pathname.split('/').pop() || 'index.html';
    var dir = location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).pop() || '';
    document.querySelectorAll('.hdr-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var parts = href.split('/');
      var file = parts.pop();
      var folder = parts.filter(function (p) { return p && p !== '..'; }).pop() || '';
      var match = file === 'index.html'
        ? (folder ? folder === dir : (path === 'index.html' || path === ''))
        : (file === path);
      if (match) {
        document.querySelectorAll('.hdr-nav a').forEach(function (x) { x.classList.remove('on'); });
        a.classList.add('on');
      }
    });

    /* 阅读进度条 */
    var sp = document.querySelector('.scroll-progress');
    if (sp) {
      var onScroll = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        sp.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* 数字滚动 */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      var runCount = function (el) {
        if (el.__done) return;
        el.__done = 1;
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        if (reduceMotion) { el.textContent = target.toLocaleString('en-US'); return; }
        var t0 = performance.now(), dur = 850;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          var v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = Math.round(v).toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
        }, { threshold: .3 });
        counters.forEach(function (c) { io.observe(c); });
        setTimeout(function () { counters.forEach(runCount); }, 1500);
      } else counters.forEach(runCount);
    }

    /* 滚动揭示
       注意：这里不能用 IntersectionObserver 单打独斗。实测在部分环境下
       （后台标签页、无滚动容器的滚动模拟）回调不触发，会让 .reveal 区块
       永久停在 opacity:0，整页出现大片空白。改为「滚动时按 rect 判定」，
       并加一个兜底定时器：无论发生什么，2 秒后全部显示。 */
    if (!reduceMotion) {
      var revealNodes = [].slice.call(document.querySelectorAll('.reveal'));
      var revealAll = function () {
        revealNodes.forEach(function (n) { n.classList.remove('out'); });
      };
      var checkReveal = function () {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        for (var i = revealNodes.length - 1; i >= 0; i--) {
          var n = revealNodes[i];
          if (!n.classList.contains('out')) { revealNodes.splice(i, 1); continue; }
          var r = n.getBoundingClientRect();
          // 进入视口下方 40px 以内就显示
          if (r.top < vh - 40 && r.bottom > 0) {
            n.classList.remove('out');
            revealNodes.splice(i, 1);
          }
        }
      };
      // 初始：只隐藏确实在首屏之外的区块
      revealNodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top > (window.innerHeight || 0)) n.classList.add('out');
      });
      document.addEventListener('scroll', checkReveal, { passive: true });
      window.addEventListener('resize', checkReveal);
      checkReveal();
      // 兜底：2 秒后无条件全部显示，保证内容绝不会因动画失效而消失
      setTimeout(revealAll, 2000);
    }
  });

  /* ---------------- 发音：优先预合成音频，否则退回 SpeechSynthesis ---------------- */
  function audioMap() {
    return (window.ZK_DATA && window.ZK_DATA.ZK_AUDIO) || {};
  }
  Z.hasAudio = function (w) { return !!audioMap()[w]; };
  Z.audioSrc = function (w) {
    var rel = audioMap()[w];
    if (!rel) return '';
    var base = (document.body && document.body.getAttribute('data-base')) || '';
    return base + rel;
  };
  var currentAudio = null, playTimer = null, playToken = 0;
  Z.playWord = function (w, opts) {
    var o = opts || {};
    var src = Z.audioSrc(w);
    if (!src) {
      // 没有预生成音频时用浏览器语音合成兜底
      try {
        if (!window.speechSynthesis) return false;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(w).replace(/-/g, ' '));
        u.lang = 'en-GB'; u.rate = 0.92;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) { return false; }
    }
    var times = o.times || 1;
    var gap = o.gap == null ? 260 : o.gap;
    try {
      var token = ++playToken;
      if (playTimer) { clearTimeout(playTimer); playTimer = null; }
      var a = currentAudio || (currentAudio = new Audio());
      a.onended = null;
      try { a.pause(); } catch (e) {}
      a.src = src;
      a.volume = o.volume == null ? 1 : o.volume;
      var played = 0;
      a.onended = function () {
        if (token !== playToken) return;
        played++;
        if (played < times) {
          playTimer = setTimeout(function () {
            if (token !== playToken) return;
            try { a.currentTime = 0; a.play().catch(function () {}); } catch (e) {}
          }, gap);
        } else if (o.onend) o.onend();
      };
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      return true;
    } catch (e) { return false; }
  };
  Z.stopAudio = function () {
    playToken++;
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    if (currentAudio) { try { currentAudio.onended = null; currentAudio.pause(); } catch (e) {} }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  };

  /* ---------------- 词表渲染（词库页 / 主题页共用） ---------------- */
  Z.renderWordList = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var all = (opts.words || []).slice();
    var pageSize = opts.pageSize || 40;
    var page = 0, query = '';
    var filter = opts.initialFilter || 'all';

    function match(w) {
      if (filter === 'core' && w.tag !== 'core') return false;
      if (filter === 'mid' && w.tag !== 'mid') return false;
      if (filter === 'ext' && w.tag !== 'ext') return false;
      if (filter === 'phrase' && w.t !== 'phrase') return false;
      if (filter === 'known' && !Z.isKnown(w.w)) return false;
      if (filter === 'new' && Z.isKnown(w.w)) return false;
      if (!query) return true;
      var q = query.toLowerCase();
      if (w.w.toLowerCase().indexOf(q) >= 0) return true;
      if ((w.zh || '').indexOf(query) >= 0) return true;
      return false;
    }

    function rowHtml(w) {
      var tagCls = w.tag === 'core' ? 'tag-b1' : w.tag === 'mid' ? 'tag-b2' : 'tag-b3';
      var tagTxt = w.tag === 'core' ? '核心高频' : w.tag === 'mid' ? '中频主力' : '拓展词';
      if (w.t === 'phrase') tagTxt = '短语';
      var isK = Z.isKnown(w.w);
      var h = '<div class="wrow' + (isK ? ' known' : '') + '" data-w="' + esc(w.w) + '">';
      h += '<span class="w-cell">' +
        '<button class="w-say" data-say="' + esc(w.w) + '" title="朗读" aria-label="朗读 ' + esc(w.w) + '">🔊</button>' +
        '<span class="w">' + Z.hl(w.w, query) + (w.ph ? '<span class="ph">/' + esc(w.ph) + '/</span>' : '') + '</span>' +
        '</span>';
      h += '<span class="pos">' + esc(w.posZh || '') + '</span>';
      h += '<span class="zh">' + Z.hl(w.zh, query) + '</span>';
      h += '<span class="w-right">' +
        '<span class="flag ' + tagCls + '">' + tagTxt + '</span>' +
        '<button class="known-pill" data-kbtn="' + esc(w.w) + '">' + (isK ? '✓ 已掌握' : '标掌握') + '</button>' +
        '</span>';
      if (w.ex) h += '<span class="ex">' + esc(w.ex) + '</span>';
      h += '</div>';
      return h;
    }

    function draw() {
      var list = all.filter(match);
      var total = Math.ceil(list.length / pageSize) || 1;
      if (page >= total) page = total - 1;
      if (page < 0) page = 0;
      var slice = list.slice(page * pageSize, (page + 1) * pageSize);
      var html = '<div class="wordlist">' + slice.map(rowHtml).join('') + '</div>';
      if (!list.length) html = '<div class="empty"><b>没有找到匹配的词条</b>换个中英文关键词或筛选条件试试</div>';
      var pager = '';
      if (list.length > pageSize) {
        pager = '<div class="pager">';
        pager += '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
        var pages = [];
        if (total <= 9) { for (var i = 0; i < total; i++) pages.push(i); }
        else {
          pages = [0];
          if (page > 2) pages.push('…');
          for (var j = Math.max(1, page - 1); j <= Math.min(total - 2, page + 1); j++) pages.push(j);
          if (page < total - 3) pages.push('…');
          pages.push(total - 1);
        }
        pages.forEach(function (p) {
          if (p === '…') pager += '<span class="pager dots">…</span>';
          else pager += '<button data-pg="' + p + '"' + (p === page ? ' class="on"' : '') + '>' + (p + 1) + '</button>';
        });
        pager += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
        pager += '</div>';
      }
      var count = '<div class="note" style="margin-top:14px">共 <b>' + list.length + '</b> 条' +
        (list.length !== all.length ? '（已筛选，总计 ' + all.length + '）' : '') +
        ' · 第 ' + (page + 1) + ' / ' + total + ' 页</div>';
      host.innerHTML = html + pager + count;

      host.querySelectorAll('[data-say]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          Z.playWord(b.getAttribute('data-say'), { times: 1 });
        });
      });
      host.querySelectorAll('[data-kbtn]').forEach(function (el) {
        el.addEventListener('click', function () {
          var row = el.closest('.wrow');
          var w = row.getAttribute('data-w');
          var on = Z.toggleKnown(w);
          row.classList.toggle('known', on);
          el.textContent = on ? '✓ 已掌握' : '标掌握';
          if (filter === 'new' || filter === 'known') {
            row.style.transition = 'opacity .25s';
            row.style.opacity = '.35';
            setTimeout(draw, 320);
          }
        });
      });
      host.querySelectorAll('[data-pg]').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = parseInt(b.getAttribute('data-pg'), 10);
          if (!isNaN(p)) { page = p; draw(); window.scrollTo({ top: 180, behavior: 'smooth' }); }
        });
      });
    }

    var tb = document.querySelector(opts.search || '#wq');
    if (tb) {
      var t;
      tb.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { query = tb.value.trim(); page = 0; draw(); }, 140);
      });
    }
    document.querySelectorAll('[data-filter]').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-filter') === filter);
      c.addEventListener('click', function () {
        document.querySelectorAll('[data-filter]').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        filter = c.getAttribute('data-filter');
        page = 0; draw();
      });
    });
    document.addEventListener('zk:known', function () { draw(); });
    draw();
    return { redraw: draw };
  };

  /* ---------------- 测验引擎（语法练题） ---------------- */
  Z.quiz = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var pool = (opts.questions || []).slice();
    if (opts.shuffle !== false) pool = shuffle(pool);
    if (opts.limit) pool = pool.slice(0, opts.limit);
    var i = 0, correct = 0, streak = 0, best = 0, answered = false;
    var total = pool.length;
    var autoNextTimer = null, AUTO_NEXT_MS = 780;

    host.innerHTML =
      '<div class="quiz-shell">' +
        '<div class="quiz-top">' +
          '<div class="quiz-progress"><i id="qp"></i></div>' +
          '<span class="quiz-count" id="qc">1 / ' + total + '</span>' +
          '<span class="combo-pill" id="qs">🔥 连击 0</span>' +
        '</div>' +
        '<div id="qbody"></div>' +
      '</div>';

    var body = host.querySelector('#qbody');
    var TYPE_NAME = {
      choice: '单项填空',
      correct: '写作改错 · 挑出正确句',
      fill: '语法填空',
    };

    function draw() {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      answered = false;
      var q = pool[i];
      if (!q) return done();
      var stem = esc(q.stem).replace(/___/g, '<span class="blank">　</span>');
      var h = '<div class="qcard">';
      h += '<div class="qmeta"><span class="qtype">' + (TYPE_NAME[q.type] || '单项填空') + '</span></div>';
      h += '<div class="qstem">' + stem + '</div>';

      if (q.type === 'fill') {
        h += '<div class="qfill"><input id="qin" type="text" autocomplete="off" spellcheck="false" placeholder="输入英文答案后按 Enter 提交…">' +
             '<button class="btn primary" id="qsub">提交检查</button></div>';
      } else {
        h += '<div class="qopts">';
        q.options.forEach(function (o, k) {
          h += '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
        });
        h += '</div>';
      }
      h += '<div id="qfb"></div>';
      h += '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="qnext" disabled>下一题 →</button></div>';
      h += '</div>';
      body.innerHTML = h;

      host.querySelector('#qp').style.width = (i / total * 100) + '%';
      host.querySelector('#qc').textContent = (i + 1) + ' / ' + total;
      host.querySelector('#qs').textContent = '🔥 连击 ' + streak;

      if (q.type === 'fill') {
        var inp = host.querySelector('#qin');
        inp.focus();
        var submit = function () { judgeFill(q, inp.value); };
        host.querySelector('#qsub').addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      } else {
        host.querySelectorAll('.qopt').forEach(function (b) {
          b.addEventListener('click', function () { judgeChoice(q, parseInt(b.getAttribute('data-k'), 10)); });
        });
      }
      host.querySelector('#qnext').addEventListener('click', function () { i++; draw(); });
      if (opts.onQuestion) opts.onQuestion(q);
    }

    if (!host.__keys) {
      host.__keys = 1;
      document.addEventListener('keydown', function (e) {
        if (!document.body.contains(host)) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        var q = pool[i];
        if (!q) return;
        if (/^[1-4]$/.test(e.key) && q.type !== 'fill' && !answered) {
          var btn = host.querySelector('.qopt[data-k="' + (parseInt(e.key, 10) - 1) + '"]');
          if (btn) { e.preventDefault(); btn.click(); }
        } else if (e.key === 'Enter' && answered) {
          if (autoNextTimer) { e.preventDefault(); return; }
          var nx = host.querySelector('#qnext');
          if (nx && !nx.disabled) { e.preventDefault(); nx.click(); }
        }
      });
    }

    function judgeChoice(q, k) {
      if (answered) return;
      answered = true;
      var ok = k === q.answer;
      host.querySelectorAll('.qopt').forEach(function (b) {
        var bi = parseInt(b.getAttribute('data-k'), 10);
        b.classList.add('locked');
        if (bi === q.answer) b.classList.add('right');
        else if (bi === k) b.classList.add('wrong');
      });
      finish(ok, q);
    }

    function judgeFill(q, val) {
      if (answered) return;
      answered = true;
      var norm = function (s) {
        return String(s).toLowerCase().trim()
          .replace(/[’‘]/g, "'")
          .replace(/[.,!?;:]+$/, '')
          .replace(/\s+/g, ' ');
      };
      var ok = (q.accept || [q.answer]).some(function (a) { return norm(a) === norm(val); });
      var inp = host.querySelector('#qin');
      inp.classList.add(ok ? 'right' : 'wrong');
      inp.readOnly = true;
      host.querySelector('#qsub').disabled = true;
      finish(ok, q, ok ? '' : q.answer);
    }

    function finish(ok, q, refAnswer) {
      if (ok) { correct++; streak++; if (streak > best) best = streak; Z.sfx('ok'); }
      else { streak = 0; Z.sfx('bad'); }
      host.querySelector('#qs').textContent = '🔥 连击 ' + streak;
      var fb = host.querySelector('#qfb');
      var ref = refAnswer
        ? '<div style="margin-bottom:6px"><b style="display:inline">参考答案：</b><span style="color:var(--ok);font-family:var(--en);font-weight:700">' + esc(refAnswer) + '</span></div>'
        : '';
      if (ok) {
        fb.innerHTML = '<div class="feedback auto-next"><b>✓ 回答正确！' +
          (streak >= 3 ? ' 已连击 ' + streak + ' 题！' : '') +
          '</b><span class="auto-next-hint">即将进入下一题…</span></div>';
      } else {
        fb.innerHTML = '<div class="feedback bad"><b>✕ 这题进了错题本，看看解析：</b>' +
          ref + esc(q.why) + '</div>';
        var nx = host.querySelector('#qnext');
        nx.disabled = false;
        nx.focus();
      }
      Z.qRecord(q.topic, ok, q.id);
      Z.bumpDay('questions', 1);
      if (opts.onAnswer) opts.onAnswer(q, ok);
      if (ok) {
        clearTimeout(autoNextTimer);
        autoNextTimer = setTimeout(function () {
          if (!document.body.contains(host)) return;
          i++; draw();
        }, AUTO_NEXT_MS);
      }
    }

    function done() {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      Z.sfx('win');
      var rate = total ? Math.round(correct / total * 100) : 0;
      var badge = rate >= 90 ? '🏆 卓越表现！' : rate >= 75 ? '🌟 稳步提升！' : '💪 发现薄弱点就是进步！';
      host.querySelector('#qp').style.width = '100%';
      body.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div class="kicker">本轮练习完成</div>' +
        '<div style="font-size:1.15rem;font-weight:700;margin-bottom:6px">' + badge + '</div>' +
        '<div style="font-family:var(--display);font-size:3.2rem;font-weight:800;color:var(--accent);margin:6px 0">' + rate + '<span style="font-size:1.3rem">%</span></div>' +
        '<div style="color:var(--text-2)">答对 <b>' + correct + ' / ' + total + '</b> 题 · 最高连击 <b>' + best + '</b></div>' +
        '<div style="margin-top:26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn primary" id="qagain">再来一轮</button>' +
          '<a class="btn soft" href="wrong.html">去清错题本</a>' +
          (opts.reviewHref ? '<a class="btn ghost" href="' + opts.reviewHref + '">' + (opts.reviewLabel || '返回') + '</a>' : '') +
        '</div></div>';
      var b = host.querySelector('#qagain');
      if (b) b.addEventListener('click', function () {
        if (opts.onRestart) { opts.onRestart(); return; }
        i = 0; correct = 0; streak = 0; best = 0;
        pool = shuffle(pool.slice());
        host.querySelector('#qbody').innerHTML = '';
        draw();
      });
      if (opts.onFinish) opts.onFinish({ correct: correct, total: total, rate: rate, best: best });
    }

    draw();
  };

  /* ---------------- 干扰项挑选（同主题 + 同词性优先，排除释义重叠） ---------------- */
  function glossSegments(t) {
    return String(t || '').split(/[；;,，、]/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function tooSimilar(a, b) {
    if (!a || !b) return false;
    var sa = glossSegments(a), sb = glossSegments(b);
    for (var i = 0; i < sa.length; i++) {
      for (var j = 0; j < sb.length; j++) {
        if (sa[i].length >= 2 && sa[i] === sb[j]) return true;
      }
    }
    return false;
  }
  function pickDistractors(pool, target, n) {
    var sameTheme = [], samePos = [], others = [];
    var taken = [target.zh];
    pool.forEach(function (w) {
      if (w.w === target.w || !w.zh) return;
      if (tooSimilar(w.zh, target.zh)) return;
      var share = (w.tp || []).some(function (t) { return (target.tp || []).indexOf(t) >= 0; });
      if (share && w.pos === target.pos) sameTheme.push(w);
      else if (w.pos === target.pos) samePos.push(w);
      else others.push(w);
    });
    var out = [];
    [sameTheme, samePos, others].forEach(function (arr) {
      var a = shuffle(arr.slice());
      for (var k = 0; k < a.length && out.length < n; k++) {
        if (taken.some(function (t) { return tooSimilar(t, a[k].zh); })) continue;
        taken.push(a[k].zh);
        out.push(a[k]);
      }
    });
    return out;
  }
  Z.pickDistractors = pickDistractors;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  Z.shuffle = shuffle;

  /* ==========================================================
     背单词引擎（逐行对齐 PET 项目 P.wordStudy）
     两种模式：choice 四选一 · recall 闪卡主动回忆
     三种内容：mix 智能混合 · due 只复习到期 · new 只学新词
     四档评分：0 忘了 / 1 有点模糊 / 2 记住了 / 3 秒杀很熟
     ========================================================== */
  Z.wordStudy = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var pool = (opts.words || []).filter(function (w) { return w.w; });
    if (!pool.length) { host.innerHTML = '<div class="empty"><b>没有可学的词</b></div>'; return; }
    var mode = opts.mode || 'due';
    var card = opts.card || 'choice';
    var autoSayOn = opts.autoSay !== false;
    var queue = [], idx = 0, revealed = false;
    var sessionN = 0, sessionOk = 0, streak = 0, best = 0;
    var answered = false, finished = false;
    var autoNextTimer = null;
    var pendingAdvance = false;
    var AUTO_NEXT_MS = 780;

    function advance() {
      if (!pendingAdvance) return;
      pendingAdvance = false;
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      idx++;
      draw();
    }

    function sampleByFrequency(list, n) {
      if (n <= 0 || !list.length) return [];
      var sorted = list.slice().sort(function (a, b) {
        var fa = a.w.frq == null ? 1e9 : a.w.frq;
        var fb = b.w.frq == null ? 1e9 : b.w.frq;
        return fa - fb;
      });
      // 在词频最高的窗口内随机取，避免每次都同一批
      var win = Math.max(n * 4, 80);
      var sub = sorted.slice(0, win);
      shuffle(sub);
      return sub.slice(0, n);
    }

    function build() {
      clearTimeout(autoNextTimer);
      var now = Date.now();
      var scored = pool.map(function (w) {
        var r = Z.srsGet(w.w);
        return { w: w, due: r ? r.due : 0, has: !!r, ivl: r ? (r.ivl || 0) : 0 };
      });
      if (mode === 'due') scored = scored.filter(function (s) { return !s.has || (s.due || 0) <= now; });
      else if (mode === 'new') scored = scored.filter(function (s) { return !s.has; });

      var limit = opts.limit || 20;
      var dueList = scored.filter(function (s) { return s.has && (s.due || 0) <= now; })
        .sort(function (a, b) { return (a.due || 0) - (b.due || 0); });
      var newList = scored.filter(function (s) { return !s.has; });
      var picked = [];

      if (mode === 'due') {
        picked = dueList.slice(0, limit);
      } else if (mode === 'new') {
        picked = sampleByFrequency(newList, limit);
      } else {
        // 智能混合：先排到期复习，不够再补新词
        picked = dueList.slice(0, limit);
        if (picked.length < limit) {
          var room = limit - picked.length;
          var takenKeys = {};
          picked.forEach(function (s) { takenKeys[s.w.w] = 1; });
          var extra = sampleByFrequency(newList.filter(function (s) { return !takenKeys[s.w.w]; }), room);
          picked = picked.concat(extra);
        }
      }

      queue = picked.map(function (s) { return s.w; });
      shuffle(queue);
      idx = 0; sessionN = 0; sessionOk = 0; streak = 0; best = 0; finished = false;
      draw();
    }

    function header() {
      return '<div class="quiz-top">' +
        '<div class="quiz-progress"><i style="width:' + (queue.length ? idx / queue.length * 100 : 0) + '%"></i></div>' +
        '<span class="quiz-count">' + Math.min(idx + 1, queue.length) + ' / ' + queue.length + '</span>' +
        '<span class="combo-pill" id="qs">🔥 连击 ' + streak + '</span></div>';
    }

    function draw() {
      if (!queue.length) return emptyState();
      if (idx >= queue.length) return done();
      revealed = false; answered = false; pendingAdvance = false;
      var w = queue[idx];
      host.innerHTML = card === 'choice' ? choiceView(w) : recallView(w);
      bindKeys();
    }

    function emptyState() {
      host.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div style="font-size:1.35rem;font-weight:700;margin-bottom:10px">🎉 今天到期的词全部复习完啦！</div>' +
        '<div style="color:var(--text-2);font-size:.93rem;line-height:1.7">按艾宾浩斯遗忘曲线，今天已经达标。<br>如果想继续抢跑，可以切到「智能混合」学习一批新词。</div>' +
        '<div style="margin-top:24px"><button class="btn primary" id="wsMix">切到混合模式学新词</button></div></div>';
      var b = host.querySelector('#wsMix');
      if (b) b.addEventListener('click', function () { mode = 'mix'; build(); });
    }

    /* ---- 闪卡模式：先回想，再翻卡自评 ---- */
    function recallView(w) {
      var canPlay = Z.hasAudio(w.w);
      var h = '<div class="flash-shell">' + header();
      h += '<div class="fcard">';
      h += '<div class="fword">' + esc(w.w) +
           (canPlay ? '<button class="say-btn" id="sayBtn" title="朗读" aria-label="朗读单词">🔊</button>' : '') +
           '</div>';
      if (w.ph) h += '<div class="fph">/' + esc(w.ph) + '/</div>';
      if (w.posZh) h += '<div class="fpos">' + esc(w.posZh) + (w.t === 'phrase' ? ' · 短语' : '') + '</div>';
      h += '<div id="frev"></div>';
      h += '<div class="fhint">先在脑海里回想中文含义，再点击「查看释义」或按空格</div>';
      h += '</div>';
      h += '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="fshow">查看释义 (空格)</button></div>';
      h += '</div>';
      setTimeout(function () {
        var say = host.querySelector('#sayBtn');
        if (say) say.addEventListener('click', function (e) { e.stopPropagation(); Z.playWord(w.w); });
        if (canPlay && autoSayOn) Z.playWord(w.w);
        var b = host.querySelector('#fshow');
        if (b) b.addEventListener('click', revealRecall);
      }, 0);
      return h;
    }

    function revealRecall() {
      if (revealed) return;
      revealed = true;
      var w = queue[idx];
      var h = '<div class="fzh">' + esc(w.zh || '（无释义）') + '</div>';
      if (w.ex) h += '<div class="fex">' + esc(w.ex) + '</div>';
      host.querySelector('#frev').innerHTML = h;
      var hint = host.querySelector('.fhint');
      if (hint) hint.style.display = 'none';
      var act = host.querySelector('.quiz-actions');
      act.innerHTML = '<div class="rate-row" style="width:100%">' +
        '<button class="rate again" data-g="0"><b>忘了</b><small>10 分钟后再来</small></button>' +
        '<button class="rate hard" data-g="1"><b>有点模糊</b><small>约半天后</small></button>' +
        '<button class="rate good" data-g="2"><b>记住了</b><small>按遗忘曲线</small></button>' +
        '<button class="rate easy" data-g="3"><b>秒杀很熟</b><small>拉长间隔</small></button></div>';
      act.querySelectorAll('[data-g]').forEach(function (b) {
        b.addEventListener('click', function () { rate(parseInt(b.getAttribute('data-g'), 10)); });
      });
    }

    /* ---- 四选一模式：看英选义 ---- */
    function choiceView(w) {
      var ds = pickDistractors(pool, w, 3);
      if (ds.length < 3) return recallView(w);
      var choices = [w].concat(ds);
      shuffle(choices);
      var ans = choices.indexOf(w);
      var h = '<div class="flash-shell">' + header();
      var canPlay = Z.hasAudio(w.w);
      h += '<div class="fcard" style="justify-content:flex-start;padding-top:32px;min-height:0">';
      h += '<div class="fword" style="font-size:clamp(1.6rem,5vw,2.2rem)">' + esc(w.w) +
           (canPlay ? '<button class="say-btn" id="sayBtn" title="朗读" aria-label="朗读单词">🔊</button>' : '') +
           '</div>';
      if (w.ph) h += '<div class="fph">/' + esc(w.ph) + '/</div>';
      if (w.posZh) h += '<div class="fpos">' + esc(w.posZh) + '</div>';
      h += '<div style="font-size:.84rem;color:var(--text-3);margin-top:14px">' +
           (canPlay ? '听发音，选出最准确的中文释义' : '选出最准确的中文释义') + '</div></div>';
      h += '<div class="qopts" style="margin-top:16px">';
      choices.forEach(function (o, k) {
        h += '<button class="qopt" data-k="' + k + '">' +
             '<span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o.zh || '') + '</span></button>';
      });
      h += '</div><div id="wfb"></div></div>';
      setTimeout(function () {
        var say = host.querySelector('#sayBtn');
        if (say) say.addEventListener('click', function (e) { e.stopPropagation(); Z.playWord(w.w); });
        if (canPlay && autoSayOn) Z.playWord(w.w);
        host.querySelectorAll('.qopt').forEach(function (b) {
          b.addEventListener('click', function () {
            judgeChoice(w, parseInt(b.getAttribute('data-k'), 10), ans);
          });
        });
      }, 0);
      return h;
    }

    function judgeChoice(w, k, ans) {
      if (answered) return;
      answered = true;
      var ok = k === ans;
      host.querySelectorAll('.qopt').forEach(function (b) {
        var bi = parseInt(b.getAttribute('data-k'), 10);
        b.classList.add('locked');
        if (bi === ans) b.classList.add('right');
        else if (bi === k) b.classList.add('wrong');
      });
      if (ok) { streak++; if (streak > best) best = streak; Z.sfx('ok'); }
      else { streak = 0; Z.sfx('bad'); }
      var fb = host.querySelector('#wfb');
      if (ok) {
        fb.innerHTML = '<div class="feedback auto-next"><b>✓ 答对了！' +
          (streak >= 3 ? ' 🔥 连击 ' + streak : '') + '</b>' +
          esc(w.zh) + (w.posZh ? ' · ' + esc(w.posZh) : '') +
          '<span class="auto-next-hint">自动进入下一词…</span></div>';
      } else {
        fb.innerHTML = '<div class="feedback bad"><b>✕ 正确释义：' + esc(w.zh) + '</b>' +
          esc(w.w) + (w.ph ? ' /' + esc(w.ph) + '/' : '') + (w.posZh ? ' · ' + esc(w.posZh) : '') +
          (w.ex ? '<div style="margin-top:6px;font-style:italic;font-size:.85rem">' + esc(w.ex) + '</div>' : '') +
          '</div>' +
          '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="wnext">记住了，下一词 →</button></div>';
        var nx = fb.querySelector('#wnext');
        nx.addEventListener('click', function () { idx++; draw(); });
        nx.focus();
      }
      recordAndRate(w, ok ? 2 : 0, ok);
      if (ok) {
        pendingAdvance = true;
        clearTimeout(autoNextTimer);
        autoNextTimer = setTimeout(advance, AUTO_NEXT_MS);
      }
    }

    function recordAndRate(w, g, countedOk) {
      Z.srsRate(w.w, g);
      // 背单词结果同步到词库「已掌握」：四选一按对错，闪卡按自评
      // 闪卡的「有点模糊」(g=1) 不算掌握也不算答错，保持原状态
      if (countedOk) Z.setKnown(w.w, true);
      else if (g === 0) Z.setKnown(w.w, false);
      sessionN++;
      if (countedOk) sessionOk++;
      if (opts.onRate) opts.onRate(w, g);
      var st = host.querySelector('#qs');
      if (st) st.textContent = '🔥 连击 ' + streak;
    }

    function rate(g) {
      var w = queue[idx];
      if (g >= 2) { streak++; if (streak > best) best = streak; Z.sfx('ok'); }
      else { streak = 0; Z.sfx('bad'); }
      recordAndRate(w, g, g >= 2);
      if (g === 0) queue.push(w);   // 忘了的词本轮末尾再出现一次
      idx++;
      draw();
    }

    function bindKeys() {
      if (host.__keys) return;
      host.__keys = 1;
      document.addEventListener('keydown', function (e) {
        if (!document.body.contains(host) || finished) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (card === 'choice') {
          if (/^[1-4]$/.test(e.key) && !answered) {
            var b = host.querySelector('.qopt[data-k="' + (parseInt(e.key, 10) - 1) + '"]');
            if (b) { e.preventDefault(); b.click(); }
          } else if (e.key === 'Enter' && answered) {
            if (pendingAdvance) { e.preventDefault(); advance(); }
            else {
              var nx = host.querySelector('#wnext');
              if (nx) { e.preventDefault(); nx.click(); }
            }
          }
          return;
        }
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!revealed) revealRecall(); else rate(2);
        } else if (revealed && /^[1-4]$/.test(e.key)) {
          rate(parseInt(e.key, 10) - 1);
        }
      });
    }

    function done() {
      finished = true;
      pendingAdvance = false;
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      Z.sfx('win');
      var st = Z.srsStats();
      var pct = sessionN ? Math.round(sessionOk / sessionN * 100) : 100;
      host.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div class="kicker">本轮闯关完成</div>' +
        '<div style="font-size:1.2rem;font-weight:700;margin-bottom:4px">' + (pct >= 85 ? '🎉 太棒了，词感超稳！' : '💪 坚持复习，越背越牢！') + '</div>' +
        '<div style="font-family:var(--display);font-size:2.9rem;font-weight:800;color:var(--accent);margin:8px 0">' + sessionOk +
          '<span style="font-size:1.3rem;color:var(--text-3)"> / ' + sessionN + '</span></div>' +
        '<div style="color:var(--text-2)">个词已记住 · 最高连击 <b>' + best + '</b><br>' +
          '词库累计已学 ' + st.total + ' 词，今日还剩 ' + st.due + ' 个待复习</div>' +
        '<div style="margin-top:26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn primary" id="wagain">再来一轮</button>' +
          '<a class="btn soft" href="review.html">顺手练一组语法</a>' +
          '<a class="btn ghost" href="' + (opts.backHref || 'index.html') + '">返回</a>' +
        '</div></div>';
      host.querySelector('#wagain').addEventListener('click', build);
      if (opts.onFinish) opts.onFinish({ ok: sessionOk, total: sessionN, best: best });
    }

    build();
    return { rebuild: build };
  };
})();
