/* 勇者之路：學測倒數冒險（紀錄只存在這支手機） */
(function () {
  "use strict";
  var KEY = "yongzhe-v1";
  var WD = window.QUEST_WEEKS || {};
  var WEEKS = [
    [1, "2026-11-22", "2026-11-28"], [2, "2026-11-29", "2026-12-05"], [3, "2026-12-06", "2026-12-12"],
    [4, "2026-12-13", "2026-12-19"], [5, "2026-12-20", "2026-12-26"], [6, "2026-12-27", "2027-01-02"],
    [7, "2027-01-03", "2027-01-09"], [8, "2027-01-10", "2027-01-16"], [9, "2027-01-17", "2027-01-21"]
  ];
  var START = "2026-11-22", EXAM = ["2027-01-22", "2027-01-23", "2027-01-24"];
  var TARGET = 600; // 10 分鐘
  var TIERS = [
    { name: "見習生", rar: "N", line: "冒險從拿起筆的那一刻開始。", gem: "#8c96a1" },
    { name: "冒險者", rar: "N+", line: "地圖還很大，但你已經踏出村子了。", gem: "#3fa34d" },
    { name: "劍士", rar: "R", line: "每天十分鐘的揮劍，手會記得。", gem: "#1f6fd1" },
    { name: "騎士", rar: "R+", line: "不是天生強，是每天都上場。", gem: "#13a2ae" },
    { name: "隊長", rar: "SR", line: "你已經能帶著自己往前走了。", gem: "#7b4fd1" },
    { name: "守護者", rar: "SR+", line: "跨年夜也守住了自己的陣地。", gem: "#b8c4d0" },
    { name: "英雄", rar: "SSR", line: "最難的關卡，你沒有逃。", gem: "#f5b100" },
    { name: "傳說", rar: "UR", line: "訂正本裡的每一題，都是打倒過的敵人。", gem: "#ff5ea8" },
    { name: "勇者・出征", rar: "LR", line: "裝備齊了，該你上場了。", gem: "#ffd84d" }
  ];
  var LINES = [
    "今天也來打一關吧！", "十分鐘就好，先開始再說。", "錯題是寶箱，打開才拿得到經驗值。",
    "昨天的你很努力，今天換今天的你上場。", "不用一次打倒魔王，先打倒今天這幾隻。",
    "背包裡多一個單字，考場上多一分底氣。", "累了就休息，但記得回來存檔。", "慢一點沒關係，不要停就好。",
    "訂正過的題目，考場上就不會再錯。", "專心十分鐘，比發呆一小時強。", "勇者不是不怕，是怕了還是出發。",
    "今天的經驗值，明天會變成實力。", "地圖上的路，是一格一格走出來的。", "先做最小的一步，剩下的會跟上來。",
    "錯了不丟臉，錯了不改才可惜。", "今天打完，晚上睡得比較香。", "你比你以為的更能撐。",
    "一個勾，一格經驗值。", "先顧好三顆核心，其他都是加分。", "柯基說：今天也一起加油！"
  ];
  var CHEERS = ["+1 經驗值！", "漂亮！", "又一隻魔物倒下！", "存檔成功！", "穩穩的！", "柯基搖尾巴了！"];
  var SUBJ = ["國文", "英文", "數學", "社會", "自然"];
  var CORE = { cn: { n: "國文 10 分鐘", ch: "國", hint: "字音字形" }, en: { n: "英文 10 分鐘", ch: "英", hint: "讀英文雜誌" } };
  var ACH = [
    { id: "first", n: "第一個勾", d: "完成第一項任務", ic: "b_star", ok: function (t) { return t.items >= 1; } },
    { id: "all1", n: "全勾日", lv: "Lv.1", d: "一天的核心和自排任務全部完成", ic: "b_crown", ok: function (t) { return t.allDays >= 1; } },
    { id: "all2", n: "全勾日", lv: "Lv.2", d: "全勾日累積 7 天", ic: "b_crown", ok: function (t) { return t.allDays >= 7; } },
    { id: "all3", n: "全勾日", lv: "Lv.3", d: "全勾日累積 21 天", ic: "b_crown", ok: function (t) { return t.allDays >= 21; } },
    { id: "both1", n: "國英雙修", lv: "Lv.1", d: "國文英文都做到，累積 10 天", ic: "b_book", ok: function (t) { return t.both >= 10; } },
    { id: "both2", n: "國英雙修", lv: "Lv.2", d: "國文英文都做到，累積 30 天", ic: "b_book", ok: function (t) { return t.both >= 30; } },
    { id: "both3", n: "國英雙修", lv: "Lv.3", d: "國文英文都做到，累積 55 天", ic: "b_book", ok: function (t) { return t.both >= 55; } },
    { id: "kill1", n: "討伐魔物", lv: "Lv.1", d: "錯題訂正累積 50 題", ic: "b_chest", ok: function (t) { return t.errN >= 50; } },
    { id: "kill2", n: "討伐魔物", lv: "Lv.2", d: "錯題訂正累積 100 題", ic: "b_chest", ok: function (t) { return t.errN >= 100; } },
    { id: "kill3", n: "討伐魔物", lv: "Lv.3", d: "錯題訂正累積 200 題", ic: "b_chest", ok: function (t) { return t.errN >= 200; } },
    { id: "old", n: "舊題翻新", d: "重做舊錯題累積 10 題", ic: "clock", ok: function (t) { return t.old >= 10; } },
    { id: "err5", n: "五科錯題", d: "五科都有錯題訂正紀錄", ic: "trophy", ok: function (t) { return t.errSubj >= 5; } },
    { id: "five", n: "五科都碰到", d: "同一週裡五科都有完成的任務或訂正", ic: "m_chart", ok: function (t) { return t.fiveWeek; } },
    { id: "back", n: "把它追回來", d: "完成 5 項從前一天移過來的任務", ic: "b_shoe", ok: function (t) { return t.movedDone >= 5; } },
    { id: "ny", n: "跨年也在讀", d: "拿到第 6 週（12/27–1/2）的證書", ic: "b_star", ok: function () { return !!S.certs[6]; } },
    { id: "i100", n: "百項里程碑", d: "累積完成 100 項（核心＋自排）", ic: "b_watch", ok: function (t) { return t.items >= 100; } },
    { id: "go", n: "出征", d: "拿到最後衝刺的出征證書", ic: "b_crown", ok: function () { return !!S.certs[9]; } }
  ];

  /* ---------- 儲存 ---------- */
  function blank() { return { v: 1, days: {}, timers: {}, certs: {}, ach: {} }; }
  function load() { try { var v = localStorage.getItem(KEY); if (v) { var o = JSON.parse(v); if (o && o.days) return o; } } catch (e) {} return blank(); }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("儲存失敗，手機空間可能不足"); } }
  function lget(k) { try { return localStorage.getItem(KEY + "-" + k); } catch (e) { return null; } }
  function lset(k, v) { try { if (v == null) localStorage.removeItem(KEY + "-" + k); else localStorage.setItem(KEY + "-" + k, v); } catch (e) {} }

  /* ---------- 日期 ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dk(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pd(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function add(k, n) { var d = pd(k); d.setDate(d.getDate() + n); return dk(d); }
  function diff(a, b) { return Math.round((pd(b) - pd(a)) / 864e5); }
  function md(k) { var p = k.split("-"); return (+p[1]) + "/" + (+p[2]); }
  var WDN = ["日", "一", "二", "三", "四", "五", "六"];
  function wdn(k) { return WDN[pd(k).getDay()]; }
  function pvDate() { return lget("pvdate"); }
  // 凌晨 3 點前算前一天（熬夜讀書不會跑到隔天）
  function today() { return pvDate() || dk(new Date(Date.now() - 3 * 3600e3)); }
  function weekOf(k) { for (var i = 0; i < WEEKS.length; i++) if (k >= WEEKS[i][1] && k <= WEEKS[i][2]) return WEEKS[i]; return null; }
  function eachDay(s, e, f) { for (var k = s; k <= e; k = add(k, 1)) f(k); }

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function pick(a, seed) { return a[Math.abs(seed) % a.length]; }
  function seedOf(k) { return diff("2026-01-01", k); }
  function day(k) { return S.days[k] || (S.days[k] = {}); }
  function subjOf(t) {
    t = String(t || "");
    var m = t.match(/^\s*([^｜|:：\s]+)/); var h = m ? m[1] : "";
    if (/^(國文|國語|國|文言|作文|字音|字形|成語|默寫)/.test(h)) return "國文";
    if (/^(英文|英|單字|English)/i.test(h)) return "英文";
    if (/^(數學|數A|數B|數甲|數乙|數)/.test(h)) return "數學";
    if (/^(社會|社|歷史|地理|公民|歷|地|公)/.test(h)) return "社會";
    if (/^(自然|自|物理|化學|生物|地科|理化|物|化|生)/.test(h)) return "自然";
    return "";
  }
  function splitTask(t) {
    var s = subjOf(t); var m = String(t).match(/^\s*[^｜|]+[｜|]\s*(.*)$/);
    return { s: s, label: m ? String(t).split(/[｜|]/)[0].trim() : "", text: m ? m[1] : t };
  }

  /* ---------- 任務資料 ---------- */
  function itemText(it) { return typeof it === "string" ? it : ((it.s ? it.s + "｜" : "") + (it.x || "")); }
  var ESSAY = { at: "", s: "國文", x: "作文練習：國寫一篇，限時 80 分鐘（每週日例行）", routine: "essay" };
  function planOf(k) {
    var w = weekOf(k), p = ((w && WD[w[0]] && WD[w[0]].days && WD[w[0]].days[k]) || []).slice();
    // 每週日：作文練習（例行公事）
    if (w && pd(k).getDay() === 0 && !p.some(function (it) { return it && it.routine === "essay"; })) p.push(ESSAY);
    return p;
  }
  function tasksOf(k) {
    var out = [];
    planOf(k).forEach(function (t, i) { if (typeof t === "string" || !t.kind || t.kind === "task") out.push({ id: "p" + i, text: itemText(t), t: t.t, at: t.at }); });
    ((S.days[k] && S.days[k].extra) || []).forEach(function (x) { out.push({ id: x.id, text: x.text, from: x.from, added: x.added }); });
    var ts = (S.days[k] && S.days[k].ts) || {};
    out.forEach(function (t) { t.st = ts[t.id] || ""; });
    return out;
  }
  function timeline(k, interactive) {
    var plan = planOf(k), ts = (S.days[k] && S.days[k].ts) || {}, d = S.days[k] || {}, h = "";
    plan.forEach(function (it, i) {
      if (typeof it === "string") it = { x: it, kind: "task" };
      var kind = it.kind || "task", where = '<span class="when">' + esc(it.t || "") + (it.at ? "　📍" + esc(it.at) : "") + "</span>";
      if (kind === "fixed") h += '<div class="fixed">' + where + '<span class="ftxt">' + esc(it.x) + "</span></div>";
      else if (kind === "core") {
        var ok = it.core === "all" ? (d.cn && d.en && d.err) : it.core === "cnen" ? (d.cn && d.en) : !!d[it.core];
        h += '<div class="fixed corei' + (ok ? " ok" : "") + '">' + where + '<span class="ftxt">⭐ ' + esc(it.x) + (ok ? "　✓" : "") + "</span></div>";
      } else h += taskRow({ id: "p" + i, text: itemText(it), t: it.t, at: it.at, st: ts["p" + i] || "" }, k, interactive);
    });
    ((d.extra) || []).forEach(function (x) { h += taskRow({ id: x.id, text: x.text, from: x.from, added: x.added, st: ts[x.id] || "" }, k, interactive); });
    return h;
  }
  function errN(d) { return d && d.err ? (d.err.nw || 0) + (d.err.old || 0) : 0; }
  function eventOf(k) { var w = weekOf(k); return (w && WD[w[0]] && WD[w[0]].events && WD[w[0]].events[k]) || ""; }

  /* ---------- 週統計、證書 ---------- */
  function wstats(w) {
    var r = { cn: 0, en: 0, err: 0, errN: 0, nw: 0, old: 0, by: {}, tDone: 0, tTot: 0, days: 0, sofar: 0, five: {} };
    var t = today();
    eachDay(w[1], w[2], function (k) {
      r.days++; if (k <= t) r.sofar++;
      var d = S.days[k] || {};
      if (d.cn) r.cn++; if (d.en) r.en++;
      if (d.cn) r.five["國文"] = 1; if (d.en) r.five["英文"] = 1;
      if (d.err) { r.err++; r.nw += d.err.nw || 0; r.old += d.err.old || 0; (d.err.subj || []).forEach(function (s) { r.by[s] = (r.by[s] || 0) + 1; r.five[s] = 1; }); }
      tasksOf(k).forEach(function (x) { if (x.st !== "moved") { r.tTot++; if (x.st === "done") { r.tDone++; var s = subjOf(x.text); if (s) r.five[s] = 1; } } });
    });
    r.errN = r.nw + r.old;
    return r;
  }
  function need(w) { return w[0] === 9 ? { cn: 4, en: 4, err: 4 } : { cn: 6, en: 6, err: 5 }; } // 最後衝刺 5 天，各留一天彈性
  function meets(w, r) { var n = need(w); return r.cn >= n.cn && r.en >= n.en && r.err >= n.err; }
  function rankTier() { var m = 0; for (var n in S.certs) m = Math.max(m, S.certs[n].tier); return m; }
  function checkCerts() {
    var got = [], t = today();
    WEEKS.forEach(function (w) {
      if (S.certs[w[0]] || t < w[1]) return;
      if (!meets(w, wstats(w))) return;
      var tier;
      if (w[0] === 9) tier = 9;
      else { tier = 1; for (var n in S.certs) if (+n <= 8) tier++; }
      S.certs[w[0]] = { tier: tier, at: t };
      got.push(w[0]);
    });
    return got;
  }

  /* ---------- 成就 ---------- */
  function totals() {
    var r = { items: 0, allDays: 0, both: 0, errN: 0, old: 0, errSubj: 0, movedDone: 0, fiveWeek: false }, es = {};
    Object.keys(S.days).forEach(function (k) {
      var d = S.days[k];
      if (d.cn) r.items++; if (d.en) r.items++; if (d.err) r.items++;
      if (d.cn && d.en) r.both++;
      if (d.err) { r.errN += errN(d); r.old += d.err.old || 0; (d.err.subj || []).forEach(function (s) { es[s] = 1; }); }
      var ts = tasksOf(k), allT = true;
      ts.forEach(function (x) { if (x.st === "done") { r.items++; if (x.from) r.movedDone++; } if (x.st !== "done" && x.st !== "moved") allT = false; });
      if (d.cn && d.en && d.err && allT) r.allDays++;
    });
    r.errSubj = Object.keys(es).length;
    WEEKS.forEach(function (w) { if (Object.keys(wstats(w).five).length >= 5) r.fiveWeek = true; });
    return r;
  }
  function checkAch() {
    var t = totals(), got = [];
    ACH.forEach(function (a) { if (!S.ach[a.id] && a.ok(t)) { S.ach[a.id] = today(); got.push(a); } });
    return got;
  }

  /* 每次動作後：存檔、檢查證書與成就 */
  var pending = [];
  function after() {
    var c = checkCerts(), a = checkAch();
    save();
    a.forEach(function (x) { pending.push({ type: "ach", a: x }); });
    c.forEach(function (n) { pending.push({ type: "cert", n: n }); });
    render();
    flush();
  }
  function flush() {
    if (!$("modal").hidden || !pending.length) return;
    var p = pending.shift();
    if (p.type === "cert") showCert(p.n, true);
    else if (p.type === "allcore") showAllCore();
    else { toast("解鎖成就：" + p.a.n + (p.a.lv ? " " + p.a.lv : "")); setTimeout(flush, 1600); }
  }

  /* ---------- 計時器 ---------- */
  function tget(k) { var t = S.timers[k]; if (!t || t.day !== today()) return { day: today(), acc: 0, run: null }; return t; }
  function tel(t) { return Math.min(TARGET, t.acc + (t.run ? (Date.now() - t.run) / 1000 : 0)); }
  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60); }
  var ticker = null;
  function tick() {
    var any = false;
    ["cn", "en"].forEach(function (k) {
      var t = tget(k); if (!t.run) return; any = true;
      var e = tel(t), el = $("t-" + k), bar = $("b-" + k);
      if (el) el.textContent = fmt(TARGET - e);
      if (bar) bar.style.width = (e / TARGET * 100) + "%";
      if (e >= TARGET) { t.acc = TARGET; t.run = null; S.timers[k] = t; save(); render(); toast("時間到！按「打勾」收下經驗值"); }
    });
    if (!any && ticker) { clearInterval(ticker); ticker = null; }
  }
  function ensureTicker() { if (!ticker) ticker = setInterval(tick, 1000); }

  /* ---------- 畫面 ---------- */
  var view = "today", viewWeek = null, achTab = "cert";
  function render() {
    var pv = pvDate(); $("pvbar").hidden = !pv; document.body.classList.toggle("pv", !!pv); if (pv) $("pvbar").textContent = "預覽模式：日期設定為 " + pv + "（設定裡可以取消）";
    var h = "";
    if (view === "today") h = vToday(); else if (view === "week") h = vWeek(); else if (view === "map") h = vMap(); else h = vAch();
    $("app").innerHTML = h;
    $("nav").innerHTML = [["today", "m_task", "今日"], ["week", "m_chart", "本週"], ["map", "castle", "地圖"], ["ach", "m_chest", "成就"]].map(function (b) {
      return '<button data-act="nav" data-v="' + b[0] + '" class="' + (view === b[0] ? "on" : "") + '"><img src="img/' + b[1] + (b[1] === "castle" ? ".jpg" : ".png") + '" alt="">' + b[2] + "</button>";
    }).join("");
    if (tget("cn").run || tget("en").run) ensureTicker();
  }

  function topBar() {
    var t = today(), w = weekOf(t), rk = rankTier(), pct = 0, lab = "";
    if (w) {
      var r = wstats(w), n = need(w), got = Math.min(r.cn, n.cn) + Math.min(r.en, n.en) + Math.min(r.err, n.err), tot = n.cn + n.en + n.err;
      pct = got / tot * 100; lab = (S.certs[w[0]] ? "本週證書已到手 ✓" : "本週證書 " + got + " / " + tot);
    } else lab = t < START ? "11/22 正式出發" : "冒險完成";
    return '<div class="top"><img class="crown" src="img/crownS.png" alt=""><div class="rk"><b>段位：' + (rk ? TIERS[rk - 1].name : "新手勇者") + '</b>' +
      '<div class="xp"><i style="width:' + pct + '%"></i><span>' + lab + '</span></div></div>' +
      '<button class="gear" data-act="settings" aria-label="設定">⚙</button></div>';
  }

  function vToday() {
    var t = today(), h = topBar();
    var left = diff(t, EXAM[0]);
    if (EXAM.indexOf(t) >= 0) return h + examView(EXAM.indexOf(t) + 1);
    if (t > EXAM[2]) return h + '<div class="exam-hero"><img src="img/back.jpg" alt=""></div><div class="panel"><div class="big-msg">冒險完成！</div><p class="empty">這 60 天的每一個勾都算數。去「成就」看看你的證書牆。</p></div>';
    h += '<div class="sign" data-act="pvtap"><img class="castle" src="img/castle.jpg" alt=""><small>學測倒數</small><span class="num">' + left + '</span><small>天</small></div>';
    var line = pick(LINES, seedOf(t));
    h += '<div class="scene"><img src="img/hero.jpg" alt=""><div class="bubble"><img src="img/avatar.jpg" alt=""><p><b>加油！</b><br>' + esc(line) + "</p></div></div>";
    var w = weekOf(t);
    if (!w) h += '<div class="note">冒險從 11/22 正式開始。</div>';
    else if (w[0] === 9) h += '<div class="note">🔥 最後衝刺！這 5 天三顆核心各做到 4 天以上，就拿「勇者・出征」證書。</div>';
    // 三顆核心
    var d = S.days[t] || {};
    h += '<section class="panel"><h2 class="ribbon">每天必做</h2>' + coreRow("cn", d) + coreRow("en", d) + errRow(d) + "</section>";
    // 自排任務
    var ts = tasksOf(t);
    h += '<section class="panel"><h2 class="ribbon">今天的行程<button class="btn sm add" data-act="addtask" aria-label="加一項">＋</button></h2>';
    if (!planOf(t).length && !ts.length) {
      var hasWeek = w && WD[w[0]] && WD[w[0]].days && Object.keys(WD[w[0]].days).length;
      h += '<p class="empty">' + (hasWeek ? "今天沒有排任務，顧好三顆核心就好。" : "這週的任務還沒上傳。<br>先把三顆核心完成！也可以按 ＋ 自己加一項。") + "</p>";
    } else h += timeline(t, true);
    var ev = eventOf(t); if (ev) h += '<div class="note">📌 今天：' + esc(ev) + "</div>";
    h += "</section>";
    return h;
  }
  function examView(n) {
    var lines = ["第一天，照平常的節奏寫就好。", "第二天，昨天的都放下，專心眼前這一科。", "最後一天，把練過的全部帶上場。"];
    return '<div class="sign"><small>學測第</small><span class="num">' + n + '</span><small>天</small></div>' +
      '<div class="exam-hero"><img src="img/back.jpg" alt=""></div><div class="panel"><div class="big-msg">勇者，出征！</div><p class="empty">' + lines[n - 1] +
      '<br>准考證、文具、手錶、水，出門前再看一眼。<br>今天沒有任務，只有上場。</p></div>';
  }
  function coreRow(k, d) {
    var c = CORE[k], t = tget(k), e = tel(t), done = !!d[k], act;
    if (done) act = '<div class="stamp' + (lastStamp === k ? " pop" : "") + '">達成<small>' + md(today()) + "</small></div>";
    else if (e >= TARGET) act = '<button class="btn green pulse" data-act="corecheck" data-k="' + k + '">打勾！</button>';
    else if (t.run) act = '<button class="btn gray" data-act="pause" data-k="' + k + '">暫停</button>';
    else if (t.acc > 0) act = '<button class="btn blue" data-act="start" data-k="' + k + '">繼續 ▶</button>';
    else act = '<button class="btn" data-act="start" data-k="' + k + '">開始挑戰 ▶</button>';
    var clock = done ? "" : '<div class="clock"><img src="img/clock.png" alt=""><span id="t-' + k + '">' + fmt(TARGET - e) + '</span></div><div class="tbar"><i id="b-' + k + '" style="width:' + (e / TARGET * 100) + '%"></i></div>';
    return '<div class="core' + (done ? " done" : "") + '"><div class="cico ' + k + '">' + c.ch + '</div><div class="cmain"><b>' + c.n + "</b><small>" + (done ? "今天的 10 分鐘完成了！" : c.hint) + "</small>" + clock + '</div><div class="cact">' + act + "</div></div>";
  }
  function errRow(d) {
    var act, sub;
    if (d.err) {
      act = '<div class="stamp' + (lastStamp === "err" ? " pop" : "") + '">達成<small>' + errN(d) + " 題</small></div>" + '<button class="linkbtn" data-act="err">修改</button>';
      sub = "新錯題 " + (d.err.nw || 0) + "、舊題重做 " + (d.err.old || 0) + (d.err.subj && d.err.subj.length ? "｜" + d.err.subj.join("、") : "");
    } else { act = '<button class="btn" data-act="err">記錄訂正</button>'; sub = "今天的錯題當天訂正；沒有新錯題就重做一題舊的"; }
    return '<div class="core' + (d.err ? " done" : "") + '"><div class="cico err">訂</div><div class="cmain"><b>錯題訂正</b><small>' + esc(sub) + '</small></div><div class="cact">' + act + "</div></div>";
  }
  function taskRow(x, k, interactive) {
    var p = splitTask(x.text), tag = "";
    if (x.st === "part") tag = '<span class="tag">部分</span>';
    else if (x.st === "moved") tag = '<span class="tag">已移到明天</span>';
    else if (x.from) tag = '<span class="tag from">' + md(x.from) + " 移來</span>";
    var sj = p.s || p.label;
    var when = (x.t || x.at) ? '<span class="when">' + esc(x.t || "") + (x.at ? "　📍" + esc(x.at) : "") + "</span>" : "";
    return '<div class="task st-' + (x.st || "none") + '"' + (interactive === false ? "" : ' data-act="task"') + ' data-id="' + esc(x.id) + '" data-k="' + k + '"><span class="box">' + (x.st === "done" ? "✓" : "") + "</span>" +
      '<span class="tbody">' + when + '<span class="tline">' + (sj ? '<span class="subj s' + esc(p.s) + '">' + esc(p.label || p.s) + "</span>" : "") + '<span class="ttxt">' + esc(p.text) + "</span></span></span>" + tag + "</div>";
  }
  var lastStamp = null;

  function vWeek() {
    var t = today(), w = viewWeek ? WEEKS[viewWeek - 1] : (weekOf(t) || (t < START ? WEEKS[0] : WEEKS[8]));
    viewWeek = w[0];
    var r = wstats(w), n = need(w), cert = S.certs[w[0]];
    var h = '<div class="title"><img src="img/m_chart.png" alt="">' + (w[0] === 9 ? "最後衝刺" : "第 " + w[0] + " 週") + "</div>";
    h += '<div class="wknav"><button class="btn sm" data-act="wk" data-d="-1"' + (w[0] === 1 ? " disabled style=\"opacity:.4\"" : "") + '>◀</button><b>' + md(w[1]) + "（" + wdn(w[1]) + "）– " + md(w[2]) + "（" + wdn(w[2]) + "）</b>" +
      '<button class="btn sm" data-act="wk" data-d="1"' + (w[0] === 9 ? " disabled style=\"opacity:.4\"" : "") + ">▶</button></div>";
    h += '<section class="panel"><h2 class="ribbon">證書進度</h2><div class="prog">' + bar("國文", r.cn, n.cn, "#e0483e") + bar("英文", r.en, n.en, "#1f6fd1") + bar("錯題訂正", r.err, n.err, "#7b4fd1") + "</div>";
    if (cert) h += '<div class="status ok">已取得「' + TIERS[cert.tier - 1].name + "」證書 🎉<br><button class=\"btn sm\" data-act=\"cert\" data-n=\"" + w[0] + '" style="margin-top:6px">看證書</button></div>';
    else {
      var lack = [];
      if (r.cn < n.cn) lack.push("國文 " + (n.cn - r.cn) + " 天"); if (r.en < n.en) lack.push("英文 " + (n.en - r.en) + " 天"); if (r.err < n.err) lack.push("錯題訂正 " + (n.err - r.err) + " 天");
      var remain = t < w[1] ? r.days : Math.max(0, diff(t, w[2]) + 1);
      h += '<div class="status wait">還差：' + lack.join("、") + (t <= w[2] ? "<br><small>這週還剩 " + remain + " 天</small>" : "<br><small>這週已結束，下一週繼續累積，段位不會倒退。</small>") + "</div>";
    }
    h += "</section>";
    h += '<section class="panel"><h2 class="ribbon">這週每一天</h2>';
    eachDay(w[1], w[2], function (k) {
      var d = S.days[k] || {}, ts = tasksOf(k), tot = 0, dn = 0;
      ts.forEach(function (x) { if (x.st !== "moved") { tot++; if (x.st === "done") dn++; } });
      h += '<div class="dayrow' + (k === t ? " today" : "") + '" data-act="day" data-k="' + k + '"><span class="d">' + wdn(k) + " " + md(k) + '</span><span class="pills"><i class="pill cn' + (d.cn ? " on" : "") + '">國</i><i class="pill en' + (d.en ? " on" : "") + '">英</i><i class="pill err' + (d.err ? " on" : "") + '">訂</i></span>' +
        '<span class="ev">' + esc(eventOf(k)) + '</span><span class="tcount">' + (tot ? "任務 " + dn + "/" + tot : "") + "</span></div>";
    });
    h += "</section>";
    h += '<button class="btn big" data-act="share" data-n="' + w[0] + '">📤 傳給媽媽（這週摘要）</button>';
    return h;
  }
  function bar(l, v, n, c) { return '<div class="row"><span class="lab">' + l + '</span><span class="bar"><i style="width:' + Math.min(100, v / n * 100) + "%;background:" + c + '"></i></span><span class="val">' + v + "/" + n + "</span></div>"; }

  function vMap() {
    var t = today(), h = '<div class="title"><img src="img/castle.jpg" alt="" style="border-radius:6px">冒險地圖</div><div class="sub">11/22 出發 → 1/22 學測</div>';
    h += '<section class="panel" style="margin-top:22px"><div class="cal">';
    ["日", "一", "二", "三", "四", "五", "六"].forEach(function (x) { h += '<div class="h">' + x + "</div>"; }); h += '<div class="h">證書</div>';
    for (var r = 0; r < 9; r++) {
      var s = add(START, r * 7);
      for (var i = 0; i < 7; i++) {
        var k = add(s, i), d = S.days[k] || {}, ex = EXAM.indexOf(k) >= 0, ev = eventOf(k);
        var lab = (k === START || pd(k).getDate() === 1) ? md(k) : String(pd(k).getDate());
        h += '<div class="cell' + (k === t ? " today" : "") + (ex ? " exam" : "") + '" data-act="day" data-k="' + k + '"><span class="n">' + lab + "</span>" +
          (ex ? '<span class="e">學測</span>' : '<span class="dots"><i class="' + (d.cn ? "cn" : "") + '"></i><i class="' + (d.en ? "en" : "") + '"></i><i class="' + (d.err ? "err" : "") + '"></i></span>' + (ev ? '<span class="e">' + esc(ev.slice(0, 4)) + "</span>" : "")) + "</div>";
      }
      var c = S.certs[r + 1];
      h += c ? '<div class="wkb t' + c.tier + '" data-act="cert" data-n="' + (r + 1) + '" style="background:linear-gradient(var(--c1),var(--c2));border:2px solid var(--c2);color:#fff;text-shadow:0 1px 0 #000">' + TIERS[c.tier - 1].rar + "</div>"
        : '<div class="wkb" style="color:#a99f86;border:2px dashed #d4c8aa">' + (r === 8 ? "衝" : r + 1) + "</div>";
    }
    h += '</div><div class="legend"><span><i style="background:#e0483e"></i>國文</span><span><i style="background:#1f6fd1"></i>英文</span><span><i style="background:#7b4fd1"></i>錯題訂正</span></div></section>';
    return h;
  }

  function vAch() {
    var h = '<div class="title"><img src="img/trophy.png" alt="">成就圖鑑</div>';
    h += '<div class="tabs"><button data-act="atab" data-v="cert" class="' + (achTab === "cert" ? "on" : "") + '">證書牆</button><button data-act="atab" data-v="ach" class="' + (achTab === "ach" ? "on" : "") + '">小成就</button></div>';
    h += '<section class="panel">';
    if (achTab === "cert") {
      var byTier = {}; for (var n in S.certs) byTier[S.certs[n].tier] = +n;
      h += '<div class="wall">';
      TIERS.forEach(function (T, i) {
        var tn = i + 1, wn = byTier[tn];
        if (wn) h += '<div class="slot got t' + tn + '" data-act="cert" data-n="' + wn + '"><span class="rr">' + T.rar + '</span><img src="img/' + (tn === 9 ? "back.jpg" : "avatar.jpg") + '" alt=""><b>' + T.name + "</b><small>" + (wn === 9 ? "最後衝刺" : "第 " + wn + " 週") + "</small></div>";
        else h += '<div class="slot lock"><span class="q">?</span><b>第 ' + tn + " 階</b><small>" + (tn === 9 ? "最後衝刺" : "") + "</small></div>";
      });
      h += '</div><p class="empty" style="font-size:13px">每週國文、英文各 6 天，錯題訂正 5 天，就拿到下一階證書。<br>漏掉一週不會退階，下一週拿到的就是下一階。</p>';
    } else {
      h += '<div class="achs">';
      ACH.forEach(function (a) {
        var got = S.ach[a.id];
        h += '<div class="ach' + (got ? "" : " lock") + '"><img src="img/' + a.ic + '.png" alt=""><b>' + a.n + "</b><small>" + (a.lv ? a.lv + "<br>" : "") + (got ? md(got) + " 解鎖" : esc(a.d)) + "</small></div>";
      });
      h += "</div>";
    }
    return h + "</section>";
  }

  /* ---------- 證書 ---------- */
  function certHTML(n, tier, mock) {
    var w = WEEKS[n - 1], T = TIERS[tier - 1], r = mock ? { cn: 7, en: 7, err: 6, errN: 24 } : wstats(w);
    var words = (WD[n] && WD[n].words) || "";
    var count = 0; for (var x in S.certs) count++;
    var gems = ""; for (var i = 1; i <= 9; i++) { var on = mock ? i <= tier : (function () { for (var m in S.certs) if (S.certs[m].tier === i) return true; return false; })(); gems += '<i class="' + (on ? "on" : "") + '" style="--gc:' + TIERS[i - 1].gem + '"></i>'; }
    return '<div class="cert t' + tier + '"><div class="cert-in"><span class="rar">' + T.rar + '</span><div class="head">勇者之路・段位證書</div><div class="tn">' + T.name + '</div>' +
      '<div class="wk">' + (n === 9 ? "最後衝刺" : "第 " + n + " 週") + "　" + md(w[1]) + "–" + md(w[2]) + "</div>" +
      '<img class="pic" src="img/' + (tier === 9 ? "back.jpg" : "hero.jpg") + '" alt="">' +
      '<div class="line">「' + T.line + "」</div>" + (words ? '<div class="words">' + esc(words) + "</div>" : "") +
      '<div class="stats">國文 ' + r.cn + " 天・英文 " + r.en + " 天<br>錯題訂正 " + r.err + " 天，共 " + r.errN + " 題</div>" +
      '<div class="gems">' + gems + '</div><div class="foot">學測 2027・1・22 ／ 第 ' + (mock ? tier : count) + " 張證書</div></div></div>";
  }
  function showCert(n, isNew) {
    var c = S.certs[n]; if (!c) return;
    modal((isNew ? '<div class="levelup">LEVEL UP!</div>' : "") + certHTML(n, c.tier) + '<button class="btn big" data-act="close">' + (isNew ? "收下證書！" : "關閉") + "</button>", true);
  }
  function showAllCore() {
    modal('<h3>今天的三顆核心全部達成！</h3><img class="hero-c" src="img/hero.jpg" alt=""><p style="text-align:center">' + esc(pick(LINES, seedOf(today()) + 7)) + '</p><button class="btn big" data-act="close">讚！</button>');
  }

  /* ---------- 互動 ---------- */
  function modal(html, bare) {
    var m = $("modal"); m.innerHTML = '<div class="sheet"' + (bare ? ' style="background:transparent;border:0;box-shadow:none;padding:0"' : "") + ">" + (bare ? "" : '<button class="x" data-act="close" aria-label="關閉">×</button>') + html + "</div>"; m.hidden = false;
  }
  function closeModal() { $("modal").hidden = true; $("modal").innerHTML = ""; setTimeout(flush, 200); }
  var toastT = null;
  function toast(s) { var t = $("toast"); t.textContent = s; t.hidden = false; t.classList.remove("show"); void t.offsetWidth; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 1800); }
  function burst(el) {
    try { var r = el.getBoundingClientRect(), b = document.createElement("div"); b.className = "burst"; b.textContent = "+1 EXP"; b.style.left = (r.left + r.width / 2 - 40) + "px"; b.style.top = (r.top - 10) + "px"; document.body.appendChild(b); setTimeout(function () { b.remove(); }, 1000); } catch (e) {}
  }
  function coreAllDone(k0) { var d = S.days[today()] || {}; return d.cn && d.en && d.err; }

  var errDraft = null;
  function openErr() {
    var d = S.days[today()] || {};
    errDraft = d.err ? JSON.parse(JSON.stringify(d.err)) : { nw: 0, old: 0, subj: [] };
    drawErr();
  }
  function drawErr() {
    var e = errDraft;
    modal('<h3>錯題訂正</h3><p style="font-size:14px;margin-top:0">訂正寫在紙本訂正本，這裡記題數就好。想留證據可以拍一頁存在相簿。</p>' +
      '<div class="counter"><span class="lb">今天的新錯題<small>寫進訂正本</small></span><span class="ct"><button data-act="ec" data-f="nw" data-d="-1">−</button><b>' + e.nw + '</b><button data-act="ec" data-f="nw" data-d="1">＋</button></span></div>' +
      '<div class="counter"><span class="lb">舊題重做<small>從訂正本挑舊題再寫一次</small></span><span class="ct"><button data-act="ec" data-f="old" data-d="-1">−</button><b>' + e.old + '</b><button data-act="ec" data-f="old" data-d="1">＋</button></span></div>' +
      '<p style="margin:12px 0 0;font-size:15px">哪幾科？（可複選）</p><div class="chips">' + SUBJ.map(function (s) { return '<button class="chip' + (e.subj.indexOf(s) >= 0 ? " on" : "") + '" data-act="es" data-s="' + s + '">' + s + "</button>"; }).join("") + "</div>" +
      '<button class="btn big green" data-act="errsave"' + (e.nw + e.old > 0 ? "" : ' disabled style="opacity:.45"') + ">打勾！</button>" +
      (e.nw + e.old > 0 ? "" : '<p style="text-align:center;font-size:13px;margin:6px 0 0">至少訂正 1 題才能打勾</p>'));
  }

  function openTask(id, k) {
    var x = tasksOf(k).filter(function (y) { return y.id === id; })[0]; if (!x) return;
    var isToday = k === today();
    if (!isToday) { toast("只能改今天的任務"); return; }
    var p = splitTask(x.text);
    modal("<h3>" + esc((p.label ? p.label + "｜" : "") + p.text) + '</h3><div class="choices">' +
      '<button class="btn green" data-act="tset" data-st="done" data-id="' + esc(id) + '">✓ 完成</button>' +
      '<button class="btn" data-act="tset" data-st="part" data-id="' + esc(id) + '">◐ 做了一部分</button>' +
      (x.st === "moved" ? "" : '<button class="btn blue" data-act="tset" data-st="moved" data-id="' + esc(id) + '">➜ 移到明天</button>') +
      (x.st ? '<button class="btn gray" data-act="tset" data-st="" data-id="' + esc(id) + '">↺ 改回還沒做</button>' : "") +
      (x.added ? '<button class="btn gray" data-act="tdel" data-id="' + esc(id) + '">刪掉這一項</button>' : "") + "</div>");
  }
  function setTask(id, st) {
    var k = today(), d = day(k); d.ts = d.ts || {};
    var x = tasksOf(k).filter(function (y) { return y.id === id; })[0]; if (!x) return;
    var prev = d.ts[id] || "";
    if (prev === "moved" && st !== "moved") {
      var nk = add(k, 1), nd = S.days[nk]; if (nd && nd.extra) nd.extra = nd.extra.filter(function (y) { return y.mv !== k + ":" + id; });
    }
    if (st === "moved" && prev !== "moved") {
      var nk2 = add(k, 1), n2 = day(nk2); n2.extra = n2.extra || [];
      n2.extra.push({ id: "m" + Date.now(), text: x.text, from: x.from || k, mv: k + ":" + id });
    }
    if (st) d.ts[id] = st; else delete d.ts[id];
    closeModal();
    if (st === "done") toast(pick(CHEERS, Date.now()));
    if (st === "moved") toast("已移到明天，明天再打倒它");
    after();
  }

  function shareText(n) {
    var w = WEEKS[n - 1], r = wstats(w), c = S.certs[n], dd = Math.min(r.sofar, r.days) || r.days;
    var by = Object.keys(r.by).map(function (s) { return s + " " + r.by[s] + " 天"; }).join("、");
    var s = "【勇者之路】" + (n === 9 ? "最後衝刺" : "第 " + n + " 週") + " " + md(w[1]) + "–" + md(w[2]) + "\n" +
      "國文 " + r.cn + "/" + dd + " 天、英文 " + r.en + "/" + dd + " 天\n" +
      "錯題訂正 " + r.err + "/" + dd + " 天，共 " + r.errN + " 題（新錯題 " + r.nw + "、舊題重做 " + r.old + "）" + (by ? "\n訂正科目：" + by : "") + "\n" +
      "自排任務 " + r.tDone + "/" + r.tTot + " 項完成\n" +
      (c ? "本週證書：已取得「" + TIERS[c.tier - 1].name + "」（" + TIERS[c.tier - 1].rar + "）" : "本週證書：還在努力中") + "\n" +
      "目前段位：" + (rankTier() ? TIERS[rankTier() - 1].name : "新手勇者");
    return s;
  }
  function share(text) {
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
    modal('<h3>複製後貼到 LINE</h3><textarea class="inp" readonly>' + esc(text) + "</textarea>");
  }

  function settings() {
    var pv = lget("pv") === "1";
    var h = '<h3>設定</h3><div class="settings">' +
      '<button class="btn" data-act="share" data-n="' + (weekOf(today()) || WEEKS[0])[0] + '">📤 傳給媽媽（這週摘要）</button>' +
      '<button class="btn blue" data-act="export">💾 備份紀錄</button>' +
      '<button class="btn gray" data-act="import">還原備份</button>' +
      '<p style="font-size:13px;line-height:1.6">紀錄只存在這支手機。換手機或清除 Safari 網站資料前，先按「備份紀錄」，把備份傳給自己。</p>';
    if (pv) {
      h += '<hr><p style="font-weight:900;margin:6px 0">預覽（測試用）</p><input class="inp" type="date" id="pvd" value="' + (pvDate() || today()) + '">' +
        '<button class="btn" data-act="pvset">把日期設成上面這天</button><button class="btn gray" data-act="pvclear">回到真正的今天</button>' +
        '<button class="btn" data-act="pvcerts">看九種證書樣式</button><button class="btn" data-act="pvcore">直接完成今天三顆核心</button>' +
        '<button class="btn gray" data-act="pvwipe">清除全部紀錄</button>';
    }
    modal(h + "</div>");
  }

  var pvTaps = 0, pvTimer = null;
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-act]");
    if (!el) { if (ev.target === $("modal")) closeModal(); return; }
    var a = el.getAttribute("data-act"), k = el.getAttribute("data-k"), t = today();
    if (a === "nav") { view = el.getAttribute("data-v"); viewWeek = null; window.scrollTo(0, 0); render(); return; }
    if (a === "close") { closeModal(); return; }
    if (a === "start") { var tm = tget(k); tm.run = Date.now(); S.timers[k] = tm; save(); render(); ensureTicker(); return; }
    if (a === "pause") { var tp = tget(k); tp.acc = tel(tp); tp.run = null; S.timers[k] = tp; save(); render(); return; }
    if (a === "corecheck") {
      if (tel(tget(k)) < TARGET) return;
      var was = coreAllDone(); day(t)[k] = true; lastStamp = k; burst(el); toast(pick(CHEERS, Date.now()));
      if (!was && coreAllDone()) pending.push({ type: "allcore" });
      after(); lastStamp = null; return;
    }
    if (a === "err") { openErr(); return; }
    if (a === "ec") { var f = el.getAttribute("data-f"); errDraft[f] = Math.max(0, Math.min(99, errDraft[f] + +el.getAttribute("data-d"))); drawErr(); return; }
    if (a === "es") { var s = el.getAttribute("data-s"), i = errDraft.subj.indexOf(s); if (i >= 0) errDraft.subj.splice(i, 1); else errDraft.subj.push(s); drawErr(); return; }
    if (a === "errsave") {
      if (errDraft.nw + errDraft.old < 1) return;
      var was2 = coreAllDone(), first = !(S.days[t] && S.days[t].err);
      day(t).err = errDraft; lastStamp = first ? "err" : null; closeModal();
      if (first) toast("又一隻魔物倒下！");
      if (!was2 && coreAllDone()) pending.push({ type: "allcore" });
      after(); lastStamp = null; return;
    }
    if (a === "task") { openTask(el.getAttribute("data-id"), k); return; }
    if (a === "tset") { setTask(el.getAttribute("data-id"), el.getAttribute("data-st")); return; }
    if (a === "tdel") { var dd = day(t); dd.extra = (dd.extra || []).filter(function (y) { return y.id !== el.getAttribute("data-id"); }); if (dd.ts) delete dd.ts[el.getAttribute("data-id")]; closeModal(); after(); return; }
    if (a === "addtask") {
      addSubj = "";
      modal('<h3>加一項今天的任務</h3><div class="chips">' + SUBJ.map(function (s) { return '<button class="chip" data-act="as" data-s="' + s + '">' + s + "</button>"; }).join("") + '</div><input class="inp" id="newt" placeholder="例如：講義 Ch4 p.10-15" maxlength="60"><button class="btn big" data-act="addsave">加進今天</button>');
      return;
    }
    if (a === "as") { addSubj = addSubj === el.getAttribute("data-s") ? "" : el.getAttribute("data-s"); Array.prototype.forEach.call(document.querySelectorAll('[data-act="as"]'), function (c) { c.classList.toggle("on", c.getAttribute("data-s") === addSubj); }); return; }
    if (a === "addsave") {
      var v = ($("newt").value || "").trim(); if (!v) { toast("先寫要做什麼"); return; }
      var d2 = day(t); d2.extra = d2.extra || []; d2.extra.push({ id: "a" + Date.now(), text: (addSubj ? addSubj + "｜" : "") + v, added: true });
      closeModal(); after(); return;
    }
    if (a === "wk") { viewWeek = Math.max(1, Math.min(9, viewWeek + +el.getAttribute("data-d"))); render(); return; }
    if (a === "day") { dayDetail(k); return; }
    if (a === "cert") { showCert(+el.getAttribute("data-n"), false); return; }
    if (a === "atab") { achTab = el.getAttribute("data-v"); render(); return; }
    if (a === "share") { share(shareText(+el.getAttribute("data-n"))); return; }
    if (a === "settings") { settings(); return; }
    if (a === "export") {
      var data = JSON.stringify(S);
      if (navigator.share) navigator.share({ title: "勇者之路備份 " + t, text: data }).catch(function () {});
      else modal('<h3>備份內容（全部複製保存）</h3><textarea class="inp" readonly>' + esc(data) + "</textarea>");
      return;
    }
    if (a === "import") { modal('<h3>還原備份</h3><p style="font-size:14px">把備份的整段文字貼進來。會取代這支手機上現在的紀錄。</p><textarea class="inp" id="imp"></textarea><button class="btn big" data-act="impgo">還原</button>'); return; }
    if (a === "impgo") { try { var o = JSON.parse($("imp").value); if (!o || !o.days) throw 0; S = o; S.timers = S.timers || {}; S.certs = S.certs || {}; S.ach = S.ach || {}; save(); closeModal(); render(); toast("還原完成"); } catch (e) { toast("這段文字不是正確的備份"); } return; }
    if (a === "pvtap") {
      pvTaps++; clearTimeout(pvTimer); pvTimer = setTimeout(function () { pvTaps = 0; }, 1500);
      if (pvTaps >= 5) { pvTaps = 0; var on = lget("pv") === "1"; lset("pv", on ? null : "1"); toast(on ? "預覽工具已關閉" : "預覽工具已打開（在設定裡）"); if (on) lset("pvdate", null); render(); }
      return;
    }
    if (a === "pvset") { var pvd = $("pvd").value; if (pvd) lset("pvdate", pvd); closeModal(); after(); return; }
    if (a === "pvclear") { lset("pvdate", null); closeModal(); after(); return; }
    if (a === "pvcore") { ["cn", "en"].forEach(function (x) { day(t)[x] = true; }); day(t).err = day(t).err || { nw: 2, old: 1, subj: ["數學"] }; closeModal(); after(); return; }
    if (a === "pvwipe") { modal('<h3>確定清除全部紀錄？</h3><p>所有打勾、證書、成就都會消失，不能復原。</p><button class="btn big gray" data-act="pvwipego">確定清除</button><button class="btn big" data-act="close">取消</button>'); return; }
    if (a === "pvwipego") { S = blank(); save(); closeModal(); render(); toast("已清除"); return; }
    if (a === "pvcerts") {
      var all = ""; for (var q = 1; q <= 9; q++) all += '<div style="margin-bottom:16px">' + certHTML(q, q, true) + "</div>";
      modal(all + '<button class="btn big" data-act="close">關閉</button>', true); return;
    }
  });
  var addSubj = "";

  function dayDetail(k) {
    if (k === today()) { view = "today"; closeModal(); render(); window.scrollTo(0, 0); return; }
    var d = S.days[k] || {}, ts = tasksOf(k), ex = EXAM.indexOf(k) >= 0;
    var h = "<h3>" + md(k) + "（" + wdn(k) + "）" + (ex ? "學測" : "") + "</h3>";
    if (eventOf(k)) h += '<div class="note">📌 ' + esc(eventOf(k)) + "</div>";
    if (!ex) {
      h += '<div class="pills" style="justify-content:center;margin:10px 0"><i class="pill cn' + (d.cn ? " on" : "") + '">國</i><i class="pill en' + (d.en ? " on" : "") + '">英</i><i class="pill err' + (d.err ? " on" : "") + '">訂</i></div>';
      if (d.err) h += '<p style="text-align:center;font-size:14px">錯題訂正 ' + errN(d) + " 題</p>";
      if (planOf(k).length || ts.length) h += timeline(k, false);
      else h += '<p class="empty">' + (k > today() ? "這天的任務還沒排" : "這天沒有自排任務") + "</p>";
    }
    modal(h);
  }

  document.addEventListener("visibilitychange", function () { if (!document.hidden) { after(); } });
  setInterval(function () { var t = today(); if (t !== lastDay) { lastDay = t; after(); } }, 60000);
  var lastDay = today();
  after();
})();
