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

  /* ---------------- 间隔重复（SM-2 简化版） ---------------- */
  var SRS_KEY = 'zk-srs-v1';
  var srs = load(SRS_KEY, {});
  var DAY = 86400000;
  Z.srsGet = function (w) { return srs[String(w).toLowerCase()] || null; };
  Z.srsAll = function () { return srs; };
  Z.srsDueCount = function (list) {
    var now = Date.now(), n = 0;
    (list || []).forEach(function (w) {
      var r = srs[String(w.w || w).toLowerCase()];
      if (!r || !r.due || r.due <= now) n++;
    });
    return n;
  };
  Z.srsStats = function () {
    var now = Date.now(), total = 0, mature = 0, due = 0;
    Object.keys(srs).forEach(function (k) {
      var r = srs[k];
      total++;
      if ((r.interval || 0) >= 21) mature++;
      if (!r.due || r.due <= now) due++;
    });
    return { total: total, mature: mature, due: due };
  };
  /**
   * 评分：0 = 忘了，1 = 模糊，2 = 会了
   * 忘了 → 10 分钟后再现；模糊 → 间隔不变；会了 → 按 ease 拉长
   */
  Z.srsRate = function (w, grade) {
    var k = String(w).toLowerCase();
    var r = srs[k] || { ease: 2.5, interval: 0, reps: 0 };
    if (grade === 0) {
      r.interval = 0; r.reps = 0; r.ease = Math.max(1.3, (r.ease || 2.5) - 0.2);
      r.due = Date.now() + 10 * 60 * 1000;
    } else if (grade === 1) {
      r.reps = (r.reps || 0) + 1;
      r.interval = r.interval || 1;
      r.due = Date.now() + r.interval * DAY;
    } else {
      r.reps = (r.reps || 0) + 1;
      r.ease = Math.min(3.0, (r.ease || 2.5) + 0.1);
      r.interval = r.reps <= 1 ? 1 : r.reps === 2 ? 3 : r.reps === 3 ? 7 : Math.round((r.interval || 7) * r.ease);
      r.due = Date.now() + r.interval * DAY;
    }
    srs[k] = r;
    store(SRS_KEY, srs);
    return r;
  };
  Z.srsReset = function () {
    srs = {}; store(SRS_KEY, srs);
    document.dispatchEvent(new CustomEvent('zk:srs', { detail: { reset: true } }));
  };

  /* ---------------- 每日学习量与连续天数 ---------------- */
  var DAYLOG_KEY = 'zk-daylog-v1';
  var GOAL_KEY = 'zk-goal-v1';
  var daylog = load(DAYLOG_KEY, {});
  var goal = load(GOAL_KEY, 20);
  function dayKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  Z.todayKey = function () { return dayKey(); };
  Z.todayWords = function () { return (daylog[dayKey()] || {}).words || 0; };
  Z.todayQuestions = function () { return (daylog[dayKey()] || {}).questions || 0; };
  Z.goal = function () { return goal; };
  Z.setGoal = function (n) { goal = n; store(GOAL_KEY, goal); document.dispatchEvent(new CustomEvent('zk:goal')); };
  Z.todayPct = function () { return Math.min(100, Math.round(Z.todayWords() / goal * 100)); };
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

  /* ---------------- 单词错题本 ---------------- */
  var WBOOK_KEY = 'zk-wordbook-v1';
  var wbook = load(WBOOK_KEY, {});
  Z.wordBook = function () { return wbook; };
  Z.wordBookCount = function () { return Object.keys(wbook).length; };
  Z.wordAttempt = function (w, ok) {
    var k = String(w).toLowerCase();
    var r = wbook[k];
    if (ok) {
      // 只有「曾经答错」的词才进错题本；答对一次即移出
      if (r) {
        r.right = (r.right || 0) + 1;
        r.ts = Date.now();
        delete wbook[k];
      }
    } else {
      r = r || { wrong: 0, right: 0 };
      r.wrong = (r.wrong || 0) + 1;
      r.ts = Date.now();
      wbook[k] = r;
    }
    store(WBOOK_KEY, wbook);
  };
  Z.wordBookReset = function () { wbook = {}; store(WBOOK_KEY, wbook); };

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
      goal: load(GOAL_KEY, 20), wbook: load(WBOOK_KEY, {}), qlog: load(QLOG_KEY, {}),
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

    /* 滚动揭示 */
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.remove('out'); io2.unobserve(e.target); }
        });
      }, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
      document.querySelectorAll('.reveal').forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top > window.innerHeight) { n.classList.add('out'); io2.observe(n); }
      });
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
})();
