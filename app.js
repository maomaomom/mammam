(function () {
  "use strict";
  var D = window.APP_DATA;
  var KEY = "xiaobu-v1";
  var PIECES = 20;
  var app = document.getElementById("app");
  var modal = document.getElementById("modal");

  /* ---------- 日期工具 ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dkey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return dkey(new Date()); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysUntil(s) { var a = parse(today()), b = parse(s); return Math.round((b - a) / 86400000); }
  function md(s) { var d = parse(s); return (d.getMonth() + 1) + "/" + d.getDate(); }
  var WD = ["日", "一", "二", "三", "四", "五", "六"];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- 儲存 ---------- */
  function seed() {
    var s = { stamps: [], morning: {}, wake: {}, course: { A: 1, B: 0 }, smaller: {}, rest: {}, extra: {}, img: null, page: 0, thoughts: [], night: false, socialDone: {} };
    // 範例：過去幾天的印章，讓預覽看起來有內容
    var offs = [6, 4, 4, 3, 1];
    offs.forEach(function (o) { var d = new Date(); d.setDate(d.getDate() - o); s.stamps.push({ d: dkey(d), k: "demo" }); });
    return s;
  }
  var mem = null;
  function load() {
    try { var v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch (e) {}
    return mem || seed();
  }
  var S = load();
  function save() {
    mem = S;
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
  }

  /* ---------- 印章圖 ---------- */
  var uid = 0;
  function sealSVG(dateStr, big) {
    uid += 1;
    var id = "s" + uid, d = parse(dateStr);
    var label = (d.getMonth() + 1) + "." + d.getDate();
    return '<svg viewBox="0 0 200 200" class="' + (big ? "seal" : "") + '" role="img" aria-label="做到了的印章">' +
      '<defs><filter id="f' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="' + (uid % 9) + '"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>' +
      '<path id="p' + id + '" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0"/></defs>' +
      '<g filter="url(#f' + id + ')" fill="none" stroke="#C84B31"><circle cx="100" cy="100" r="92" stroke-width="7"/><circle cx="100" cy="100" r="56" stroke-width="3"/></g>' +
      '<g filter="url(#f' + id + ')" fill="#C84B31"><text font-size="16" font-weight="700" letter-spacing="3"><textPath href="#p' + id + '">一次一小步 · 小步日記 · 一次一小步 · 小步日記 ·</textPath></text>' +
      '<text x="100" y="98" text-anchor="middle" font-size="30" font-weight="900">做到了</text>' +
      '<text x="100" y="128" text-anchor="middle" font-size="19" font-weight="700" letter-spacing="1">' + label + '</text></g></svg>';
  }
  function miniSeal(color) {
    return '<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="19" fill="' + color + '"/><circle cx="19" cy="19" r="13" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/><path d="M13 19.5l4 4 8-9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var WIN = '<svg class="win" width="120" height="104" viewBox="0 0 120 104" aria-hidden="true"><circle cx="72" cy="40" r="22" fill="#F2C14E"/><rect x="26" y="8" width="86" height="86" rx="8" fill="none" stroke="#8FB8E8" stroke-width="4"/><line x1="69" y1="8" x2="69" y2="94" stroke="#8FB8E8" stroke-width="4"/><line x1="26" y1="51" x2="112" y2="51" stroke="#8FB8E8" stroke-width="4"/><path d="M26 8 Q44 52 30 94" stroke="#E86A4F" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
  var ART = '<svg class="art" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="375" fill="#FAEEDA"/><rect x="50" y="40" width="200" height="230" rx="6" fill="#B5D4F4"/><circle cx="190" cy="110" r="38" fill="#EF9F27"/><rect x="50" y="40" width="200" height="230" rx="6" fill="none" stroke="#854F0B" stroke-width="8"/><line x1="150" y1="40" x2="150" y2="270" stroke="#854F0B" stroke-width="6"/><line x1="50" y1="155" x2="250" y2="155" stroke="#854F0B" stroke-width="6"/><path d="M50 40 Q85 150 58 270" fill="#D85A30"/><path d="M250 40 Q215 150 242 270" fill="#D85A30"/><polygon points="150,270 70,375 230,375" fill="#FAC775" opacity=".7"/><ellipse cx="150" cy="330" rx="40" ry="18" fill="#5F5E5A"/><circle cx="182" cy="318" r="14" fill="#5F5E5A"/></svg>';

  /* ---------- 拼圖 ---------- */
  var ORDER = [7, 12, 2, 17, 9, 0, 14, 5, 19, 3, 10, 16, 1, 8, 18, 6, 13, 4, 15, 11];
  function revealed() { return Math.max(0, Math.min(PIECES, S.stamps.length - S.page * PIECES)); }
  function puzzleHTML(flipIndex) {
    var n = revealed(), open = {};
    for (var i = 0; i < n; i++) open[ORDER[i]] = i;
    var cells = "";
    for (var c = 0; c < PIECES; c++) {
      var cls = "pc";
      if (open[c] !== undefined) cls += (open[c] === flipIndex ? " flip" : " open");
      cells += '<div class="' + cls + '"></div>';
    }
    var pic = S.img ? '<img src="' + S.img + '" alt="你的畫">' : ART;
    return '<div class="puzzle">' + pic + '<div class="grid">' + cells + "</div></div>";
  }

  /* ---------- 今天的一步 ---------- */
  function firstCourse() {
    var list = D.courses.filter(function (c) { return c.tier === "first" && (S.course[c.id] || 0) < c.steps.length; });
    list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return list[0] || null;
  }
  function pickStep() {
    var t = today();
    var stepsToday = S.stamps.filter(function (s) { return s.d === t && s.k === "step"; }).length;
    // 期中前學業線優先；若今天是星期二或五，先給人際線（每週兩次）
    var dow = new Date().getDay();
    if ((dow === 2 || dow === 5) && !S.socialDone[t] && stepsToday === 0) {
      return { line: "人際", cls: "t-coral", t: D.social.t, small: D.social.small, why: D.social.why, min: D.social.min, social: true };
    }
    var c = firstCourse();
    if (!c) return { line: "人際", cls: "t-coral", t: D.social.t, small: D.social.small, why: D.social.why, min: D.social.min, social: true };
    var i = S.course[c.id] || 0, st = c.steps[i];
    return { line: "學業 · " + c.name, cls: "t-green", t: st.t, small: st.small, why: st.why, min: st.min, course: c, idx: i };
  }
  function doneStepToday() {
    var t = today();
    return S.stamps.filter(function (s) { return s.d === t && s.k === "step"; }).length;
  }

  /* ---------- 蓋章 ---------- */
  function addStamp(kind) {
    S.stamps.push({ d: today(), k: kind });
    var n = revealed();
    var pageDone = n >= PIECES;
    save();
    return { flip: n - 1, pageDone: pageDone };
  }
  function completeStep(step) {
    var t = today();
    if (step.social) S.socialDone[t] = true;
    else S.course[step.course.id] = (S.course[step.course.id] || 0) + 1;
    delete S.smaller[t];
    var r = addStamp("step");
    showDone({ title: "做到了。", text: step.t, flip: r.flip, pageDone: r.pageDone, choice: true });
  }
  function showDone(o) {
    var n = revealed();
    var html = '<div class="sheet" role="dialog" aria-label="完成">' + (o.noStamp ? "" : sealSVG(today(), true)) +
      "<h2>" + esc(o.title) + "</h2><p>" + esc(o.text) + "</p>" +
      (o.noStamp ? "" : '<div class="mini-pz">' + puzzleHTML(o.flip) + "</div>" +
      "<p><b>揭開了第 " + n + " 片 / " + PIECES + "</b></p>");
    if (o.pageDone) html += '<p class="toast">這一張拼圖完成了！可以兌換一個往外走的獎勵。</p>';
    if (o.choice) {
      html += '<div class="choice"><button class="btn dark" data-act="rest">今天到這裡就好</button><small>明天會出現下一步</small>' +
        '<button class="btn ghost" data-act="more">我想再走一步</button><small>多走的步也會蓋章，明天的目標仍然只有一步</small></div>';
    } else {
      html += '<button class="btn dark" data-act="close">好</button>';
    }
    html += "</div>";
    modal.innerHTML = html;
    modal.hidden = false;
  }
  modal.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) { if (e.target === modal) closeModal(); return; }
    var a = b.getAttribute("data-act"), t = today();
    if (a === "rest") { S.rest[t] = true; save(); }
    if (a === "more") { S.rest[t] = false; S.extra[t] = true; save(); }
    closeModal();
  });
  function closeModal() { modal.hidden = true; modal.innerHTML = ""; render(); }

  /* ---------- 畫面：主畫面 ---------- */
  function quoteOfDay() { var d = parse(today()); return D.quotes[(d.getDate() + d.getMonth()) % D.quotes.length]; }
  function header(title, backTo, sub) {
    var t = new Date();
    return '<header class="hero">' + (backTo ? "" : WIN) +
      (backTo ? '<a class="back" href="#' + backTo + '">← 回到今天</a>' : '<div class="date">' + (t.getMonth() + 1) + " 月 " + t.getDate() + " 日 · 星期" + WD[t.getDay()] + "</div>") +
      "<h1>" + title + "</h1>" + (sub || "") + "</header>";
  }
  function isNight() { var h = new Date().getHours(); return S.night || h >= 22 || h < 4; }

  function viewHome() {
    if (isNight()) return viewNight();
    var q = quoteOfDay(), t = today();
    var h = header("早安", null, '<div class="quote"><small>今天的心靈雞湯</small><p>' + esc(q.text) + "</p><em>— " + esc(q.from) + "</em></div>");

    // 早晨三件事
    var m = S.morning[t] || [false, false, false];
    var rows = D.morning.map(function (txt, i) {
      return '<button class="mrow' + (m[i] ? " done" : "") + '" data-m="' + i + '"><span class="box">' + (m[i] ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>' : "") + '</span><span class="t">' + esc(txt) + "</span></button>";
    }).join("");
    var allM = m[0] && m[1] && m[2];
    var wakeNote = S.wake[t] ? "今天 " + S.wake[t] + " 開始 · 目標：12 點前" : "目標：12 點前開始";
    var morning = '<section class="sec"><div class="sec-h"><span class="n">1</span><b>早晨三件事</b><span class="r">' + (allM ? "基本章已蓋好" : "做完蓋基本章") + '</span></div><div class="card morning">' + rows + '<div class="mnote">' + wakeNote + "</div></div></section>";

    // 今天的一步
    var stepCard;
    var did = doneStepToday();
    if (did > 0 && !S.extra[t]) {
      stepCard = '<div class="card"><div class="tags"><span class="tag t-green">今天的一步完成了</span></div><div class="step-title">今天的份做到了。</div><p class="why">休息也是計畫的一部分。明天會出現下一步。</p><button class="link" data-act-home="more">我想再走一步 →</button></div>';
    } else {
      var st = pickStep(), small = !!S.smaller[t];
      stepCard = '<div class="card"><div class="tags"><span class="tag ' + st.cls + '">' + esc(st.line) + "</span>" +
        (st.course ? '<span class="tag t-coral">期中還有 ' + daysUntil(st.course.date) + " 天</span>" : "") +
        '<span class="tag t-gray">約 ' + (small ? 2 : st.min) + " 分鐘</span>" + (small ? '<span class="tag t-mus">小一點的版本</span>' : "") + "</div>" +
        '<div class="step-title">' + esc(small ? st.small : st.t) + "</div>" +
        '<div class="why">目的：' + esc(st.why) + "</div>" +
        '<button class="btn" data-act-home="done">做到了，蓋章</button>' +
        (small ? '<button class="btn ghost" data-act-home="normal">回到原本的版本</button>' : '<button class="btn ghost" data-act-home="smaller">太難了，換小一點的</button>') +
        (st.course ? '<a class="link" href="#map">看整個期中地圖 →</a>' : "") + "</div>";
    }
    var step = '<section class="sec"><div class="sec-h"><span class="n">2</span><b>今天的一步</b>' + (did > 0 ? '<span class="r">今天已蓋 ' + did + " 章</span>" : "") + "</div>" + stepCard + "</section>";

    // 這週
    var days = "", hasStamp = {};
    S.stamps.forEach(function (s) { hasStamp[s.d] = true; });
    var colors = ["#E86A4F", "#8FB8E8", "#F2C14E", "#7BC4A0", "#B7AEDB", "#E86A4F", "#8FB8E8"];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i); var k = dkey(d), on = hasStamp[k];
      days += '<div class="d' + (i === 0 ? " today" : "") + '"><span class="c' + (on ? " on" : "") + '">' + (on ? miniSeal(colors[d.getDay()]) : "") + "</span>" + (i === 0 ? "今天" : WD[d.getDay()]) + "</div>";
    }
    var weekCount = 0; for (var j = 0; j < 7; j++) { var dd = new Date(); dd.setDate(dd.getDate() - j); if (hasStamp[dkey(dd)]) weekCount++; }
    var week = '<section class="sec"><div class="sec-h"><span class="n">3</span><b>這週</b><span class="r">有 ' + weekCount + " 天蓋了章 · 沒蓋的日子不扣分</span></div><div class=\"week\">" + days + "</div></section>";

    var tiles = '<div class="tiles">' +
      '<a class="tile pz" href="#gallery"><div class="thumb">' + puzzleHTML(-1) + '</div><div class="lbl"><b>我的畫冊</b><span> ' + revealed() + "/" + PIECES + " 片</span></div></a>" +
      '<a class="tile ln" href="#lines"><b>三條線</b><span>看我走到哪</span></a>' +
      '<a class="tile th" href="#thought"><b>腦袋很吵</b><span>3 分鐘整理</span></a></div>';

    return '<div class="wrap">' + h + morning + step + week + tiles + "</div>";
  }

  function onHomeClick(e) {
    var mb = e.target.closest("[data-m]");
    var t = today();
    if (mb) {
      var i = +mb.getAttribute("data-m");
      var m = S.morning[t] || [false, false, false];
      var before = m[0] && m[1] && m[2];
      m[i] = !m[i]; S.morning[t] = m;
      if (!S.wake[t]) { var n = new Date(); S.wake[t] = n.getHours() + ":" + pad(n.getMinutes()); }
      var after = m[0] && m[1] && m[2];
      save();
      if (after && !before && !S.stamps.some(function (s) { return s.d === t && s.k === "morning"; })) {
        var r = addStamp("morning");
        showDone({ title: "早晨三件事完成了。", text: "窗簾拉開了，狗狗出門了，牛奶也喝完了。", flip: r.flip, pageDone: r.pageDone });
        return;
      }
      render(); return;
    }
    var b = e.target.closest("[data-act-home]");
    if (!b) return;
    var a = b.getAttribute("data-act-home");
    if (a === "done") { completeStep(pickStep()); return; }
    if (a === "smaller") S.smaller[t] = true;
    if (a === "normal") delete S.smaller[t];
    if (a === "more") S.extra[t] = true;
    save(); render();
  }

  /* ---------- 晚上 ---------- */
  function viewNight() {
    var t = today(), n = S.stamps.filter(function (s) { return s.d === t; }).length;
    var phone = S.stamps.some(function (s) { return s.d === t && s.k === "night"; });
    return '<div class="night"><div class="wrap" style="padding:calc(env(safe-area-inset-top) + 40px) 20px 90px">' +
      '<div class="soft" style="font-size:14px">' + new Date().getHours() + ":" + pad(new Date().getMinutes()) + "</div>" +
      '<h1 style="font-size:30px;margin:6px 0">今天收工了。</h1><p class="soft" style="margin:0 0 20px">今天蓋了 ' + n + " 個章。" + (n ? "夠了。" : "明天再來就好。") + "</p>" +
      '<div class="card" style="margin-bottom:12px"><div style="font-size:13px;font-weight:700;color:#C9D0F5">睡前一小步</div><div style="font-size:19px;margin:8px 0">把手機放到書桌上充電</div>' +
      (phone ? '<p class="soft" style="margin:0">放好了。晚安。</p>' : '<button class="btn" data-night="phone">放好了，晚安</button>') + "</div>" +
      '<div class="card"><div style="font-size:13px;font-weight:700;color:#C9D0F5">明天醒來的第一步</div><div style="font-size:17px;margin:8px 0 4px">拉開窗簾，再帶狗狗出門</div><div class="soft" style="font-size:13px">已經幫你選好，明天不用想。</div></div>' +
      '<p style="text-align:center;margin-top:40px;line-height:1.7">夜裡的你，也是你。<br>但明天的你會感謝現在去睡的你。</p></div></div>';
  }

  /* ---------- 期中地圖 ---------- */
  function viewMap() {
    var cs = D.courses.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var first = parse(cs[0].date); var mon = new Date(first); mon.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    var byDate = {}; cs.forEach(function (c) { (byDate[c.date] = byDate[c.date] || []).push(c); });
    var cal = '<div class="cal"><span></span>' + ["一", "二", "三", "四", "五"].map(function (w) { return '<span class="h">' + w + "</span>"; }).join("");
    for (var w = 0; w < 2; w++) {
      cal += '<span class="wk">第' + (w ? "二" : "一") + "週</span>";
      for (var i = 0; i < 5; i++) {
        var d = new Date(mon); d.setDate(mon.getDate() + w * 7 + i); var k = dkey(d);
        cal += '<div class="cell' + (k === today() ? " today" : "") + '">' + md(k) + (byDate[k] || []).map(function (c) { return '<span class="ev" style="background:' + c.color + '33;color:#22223B">' + c.id + " " + c.kind + "</span>"; }).join("") + "</div>";
      }
    }
    cal += "</div>";
    var tierName = { first: ["先顧", "p-first"], keep: ["跟上", "p-keep"], later: ["再談", "p-later"] };
    var rows = cs.map(function (c) {
      var done = S.course[c.id] || 0, info = c.kind + " " + md(c.date) + " · 還有 " + daysUntil(c.date) + " 天";
      if (c.steps.length) info += " · 小步 " + Math.min(done, c.steps.length) + "/" + c.steps.length;
      if (c.tier === "later") info = c.kind + " " + md(c.date) + " · 先交給大人和老師談";
      var inner = '<span class="bar" style="background:' + c.color + '"></span><span class="mid"><b>' + c.name + "</b><span>" + info + '</span></span><span class="pill ' + tierName[c.tier][1] + '">' + tierName[c.tier][0] + "</span>";
      return c.steps.length ? '<a class="row" href="#course/' + c.id + '">' + inner + "</a>" : '<div class="row">' + inner + "</div>";
    }).join("");
    var fc = firstCourse();
    return '<div class="wrap">' + header("期中地圖", "home", '<div class="date">不用一次準備全部，一天只走一步。</div>') +
      '<section class="sec"><div class="sec-h"><span class="n">1</span><b>兩週時間軸</b><span class="r">日期為示意</span></div>' + cal + "</section>" +
      '<section class="sec"><div class="sec-h"><span class="n">2</span><b>每一科</b><span class="r">點科目看小步</span></div><div class="list">' + rows + "</div></section>" +
      (fc ? '<section class="sec"><div class="hint" style="background:var(--green-l)"><b style="color:var(--green-d)">今天的一步從這裡來</b>' + fc.name + " · " + esc(fc.steps[S.course[fc.id] || 0].t) + "</div></section>" : "") + "</div>";
  }

  /* ---------- 單一科目 ---------- */
  function viewCourse(id) {
    var c = D.courses.filter(function (x) { return x.id === id; })[0];
    if (!c) return viewMap();
    var done = S.course[id] || 0;
    var bars = c.steps.map(function (_, i) { return '<i style="background:' + (i < done ? "#1F5A3A" : "#CDEBD9") + '"></i>'; }).join("");
    var list = c.steps.map(function (s, i) {
      if (i < done) return '<div class="st done"><span class="num">✓</span><div class="tx">' + esc(s.t) + "</div></div>";
      if (i === done) return '<div class="st cur"><span class="num">' + (i + 1) + '</span><div style="flex:1"><div class="tx"><b>' + esc(s.t) + '</b></div><div class="sub">現在這一步 · 約 ' + s.min + ' 分鐘</div><button class="btn small" data-course-done="' + id + '">做到了，蓋章</button></div></div>';
      return '<div class="st lock"><span class="num">' + (i + 1) + '</span><div class="tx">' + esc(s.t) + "</div></div>";
    }).join("");
    return '<div class="wrap">' + header(c.name, "map", '<div class="date">' + c.kind + " " + md(c.date) + " · 還有 " + daysUntil(c.date) + " 天 · 已走 " + done + " / " + c.steps.length + ' 步</div><div class="prog" style="grid-template-columns:repeat(' + c.steps.length + ',1fr);margin-top:10px">' + bars + "</div>") +
      '<section class="sec steps">' + list + '<p style="text-align:center;font-size:12px;color:var(--mute)">後面的步驟看得到，但每次只開放一步</p></section></div>';
  }

  /* ---------- 三條線 ---------- */
  function lineCard(title, cls, color, light, end, total, at, now, extra) {
    var bars = ""; for (var i = 0; i < total; i++) bars += '<i style="background:' + (i <= at ? color : light) + '"></i>';
    return '<div class="card" style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px"><span class="tag ' + cls + '">' + title + '</span><span style="margin-left:auto;font-size:12px;color:var(--soft)">終點：' + end + '</span></div><div class="prog" style="grid-template-columns:repeat(' + total + ',1fr);margin-top:10px">' + bars + '</div><div style="font-size:15px;font-weight:700">現在：' + now + "</div>" + (extra || "") + "</div>";
  }
  function viewLines() {
    var L = D.lines, t = today();
    var wk = 0; for (var j = 0; j < 7; j++) { var dd = new Date(); dd.setDate(dd.getDate() - j); var mm = S.morning[dkey(dd)]; if (mm && mm[0] && mm[1] && mm[2]) wk++; }
    var studyDone = 0; D.courses.forEach(function (c) { studyDone += Math.min(S.course[c.id] || 0, c.steps.length); });
    return '<div class="wrap">' + header("我的三條線", "home", '<div class="date">不用三條一起衝，每天走一步就好。</div>') + '<section class="sec">' +
      lineCard("作息線", "t-blue", "#24476B", "#CFE3F7", L.routine.end, L.routine.stages.length, L.routine.at, L.routine.stages[L.routine.at] + "完成早晨三件事", '<div style="font-size:13px;color:var(--soft);margin-top:4px">這週做到 ' + wk + " 天 · 穩定一週後，可以試試 " + L.routine.stages[L.routine.at + 1] + "</div>") +
      lineCard("人際線", "t-coral", "#7A2E1C", "#FAD4C8", L.social.end, L.social.steps.length, L.social.at, L.social.steps[L.social.at], '<div style="font-size:12px;color:var(--mute);margin-top:4px">第 5 步以後，等作息線走進教室才會打開</div>') +
      lineCard("學業線", "t-green", "#1F5A3A", "#CDEBD9", L.study.end, L.study.steps.length, L.study.at, "期中衝刺 · 每天一個課程小步", '<div style="font-size:13px;color:var(--soft);margin-top:4px">課程小步已完成 ' + studyDone + ' 步</div><a class="link" href="#map">看期中地圖 →</a>') +
      '<div class="hint"><b>今天的一步從哪一條來？</b>系統會幫你選。期中前多半是學業線，每週也會有兩次人際線。</div></section></div>';
  }

  /* ---------- 畫冊 ---------- */
  function viewGallery() {
    var n = revealed();
    return '<div class="wrap">' + header("我的畫冊", "home", '<div class="date">第 ' + (S.page + 1) + " 張 · 已揭開 " + n + " / " + PIECES + " 片</div>") +
      '<section class="sec"><div class="card">' + puzzleHTML(-1) +
      '<p style="font-size:13px;color:var(--soft);line-height:1.6;margin:12px 0 0">每蓋一個章，就揭開一片。拼完這一張，可以兌換一個往外走的獎勵。</p>' +
      '<label class="btn ghost" style="cursor:pointer">' + (S.img ? "換一張畫" : "從相簿選一張你的畫") + '<input type="file" accept="image/*" id="pick" style="display:none"></label>' +
      '<p style="font-size:12px;color:var(--mute);margin:8px 0 0;text-align:center">照片只存在這支手機，不會上傳到任何地方</p>' +
      (n >= PIECES ? '<button class="btn" data-gal="next">開始下一張</button>' : "") +
      '<p class="toast" id="galmsg"></p></div></section></div>';
  }
  function pickImage(file) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900, w = img.width, h = img.height, s = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement("canvas"); cv.width = Math.round(w * s); cv.height = Math.round(h * s);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        var old = S.img; S.img = cv.toDataURL("image/jpeg", 0.82);
        if (!save()) { S.img = old; var m = document.getElementById("galmsg"); if (m) m.textContent = "這張圖太大，存不下。換一張小一點的試試。"; return; }
        render();
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }

  /* ---------- 想法偵探 ---------- */
  var TD = { types: {}, feel: {}, b1: 70, b2: 40 };
  var FIELDS = {};
  var TF = ["fact", "th", "yes", "no", "fr"];
  function chipRow(list, sel, attr) {
    return list.map(function (x, i) { return '<button class="chip' + (sel[i] ? " on" : "") + '" ' + attr + '="' + i + '">' + esc(x) + "</button>"; }).join("");
  }
  function viewThought() {
    var types = D.thinkingTypes.map(function (x, i) {
      var on = !!TD.types[i];
      return '<button class="trow' + (on ? " on" : "") + '" data-type="' + i + '"><span class="say">' + esc(x.say) + '</span><span class="nm">' + esc(x.name) + "</span>" + (on ? '<span class="tp">' + esc(x.tip) + "</span>" : "") + "</button>";
    }).join("");
    var past = S.thoughts.length ? '<section class="sec"><div class="sec-h"><b>已結案的紀錄</b><span class="r">' + S.thoughts.length + ' 件</span></div><div class="list">' + S.thoughts.slice().reverse().slice(0, 5).map(function (x) { return '<div class="row"><span class="mid"><b>' + esc(x.fact || "（沒寫）") + "</b><span>" + esc(x.d) + " · 相信程度 " + x.b1 + "% → " + x.b2 + "%</span></span></div>"; }).join("") + '</div><button class="btn ghost" data-th="export">匯出我的紀錄</button></section>' : "";
    return '<div class="wrap">' + header("想法偵探", "home", '<div class="date">腦袋停不下來的時候，花 3 分鐘查一下案。<br>寫的內容只存在這支手機，誰都看不到。</div>') +
      '<section class="sec"><div class="card tcard">' +
      '<div><label class="f" for="fact">1 · 發生了什麼？</label><p class="fhint">只寫看得到、聽得到的事，像監視器拍到的那樣。</p><textarea id="fact" rows="2" placeholder="例如：我跟同學說話時，她沒有笑。"></textarea></div>' +
      '<div><label class="f" for="th">2 · 那時候，腦中冒出什麼話？</label><textarea id="th" rows="2" placeholder="例如：她一定覺得我很奇怪。"></textarea>' +
      '<span class="f" style="margin-top:10px">心情是</span><div class="chips">' + chipRow(D.feelings, TD.feel, "data-feel") + "</div>" +
      '<label class="f" for="b1" style="margin-top:10px">這句話，我有多相信：<span class="pct" id="b1v">' + TD.b1 + '%</span></label><input type="range" id="b1" min="0" max="100" step="10" value="' + TD.b1 + '"></div>' +
      '<div><span class="f">3 · 這句話，像下面哪一種？</span><p class="fhint">可以選不只一個。點一下會出現說明。</p><div class="tlist">' + types + "</div></div>" +
      '<div><span class="f">4 · 找證據</span><label class="fsub" for="yes">支持這句話的事實</label><textarea id="yes" rows="2" placeholder="例如：她那時候沒有看我。"></textarea>' +
      '<label class="fsub" for="no">不支持這句話的事實</label><textarea id="no" rows="2" placeholder="例如：她後來還是有回我訊息。她那天看起來很累。"></textarea></div>' +
      '<div><label class="f" for="fr">5 · 如果是好朋友遇到這件事，我會跟她說</label><textarea id="fr" rows="2" placeholder="例如：她可能只是累了，或在想自己的事，不一定跟你有關。"></textarea></div>' +
      '<div><label class="f" for="b2">6 · 現在，還相信那句話多少？<span class="pct" id="b2v">' + TD.b2 + '%</span></label><input type="range" id="b2" min="0" max="100" step="10" value="' + TD.b2 + '"><p class="fhint">有降一點就很好了。沒降也沒關係，寫下來本身就有幫助。</p></div>' +
      '<button class="btn" data-th="save">結案，蓋章</button><button class="btn ghost" data-th="box">現在不想寫，先放進煩惱盒</button></div></section>' + past + "</div>";
  }
  function onThought(e) {
    var c = e.target.closest("[data-type]");
    if (c) { keepFields(); var i = +c.getAttribute("data-type"); TD.types[i] = !TD.types[i]; render(); restoreFields(); return; }
    var f = e.target.closest("[data-feel]");
    if (f) { keepFields(); var j = +f.getAttribute("data-feel"); TD.feel[j] = !TD.feel[j]; render(); restoreFields(); return; }
    var b = e.target.closest("[data-th]"); if (!b) return;
    var a = b.getAttribute("data-th");
    if (a === "save" || a === "box") {
      keepFields();
      var types = D.thinkingTypes.filter(function (_, i) { return TD.types[i]; }).map(function (x) { return x.name; });
      var feels = D.feelings.filter(function (_, i) { return TD.feel[i]; });
      var rec = { d: today(), fact: FIELDS.fact || "", thought: FIELDS.th || "", feel: feels.join("、"), types: types.join("、"), yes: FIELDS.yes || "", no: FIELDS.no || "", friend: FIELDS.fr || "", b1: TD.b1, b2: TD.b2, box: a === "box" };
      S.thoughts.push(rec); TD = { types: {}, feel: {}, b1: 70, b2: 40 }; FIELDS = {};
      if (a === "box") { save(); showDone({ title: "先放著。", text: "煩惱放進盒子裡了。想處理的時候再打開，現在可以先做別的事。", flip: -1, pageDone: false, noStamp: true }); return; }
      var r = addStamp("thought");
      showDone({ title: "結案了。", text: "把想法寫下來，它就沒那麼大聲了。", flip: r.flip, pageDone: r.pageDone });
    }
    if (a === "export") {
      var txt = S.thoughts.map(function (x) { return x.d + (x.box ? "（煩惱盒）" : "") + "\n發生了什麼：" + x.fact + "\n腦中的話：" + x.thought + "（相信 " + x.b1 + "%）\n心情：" + (x.feel || "") + "\n像哪一種：" + (x.types || x.type || "") + "\n支持的事實：" + (x.yes || "") + "\n不支持的事實：" + (x.no || "") + "\n好朋友會說：" + x.friend + "\n現在相信：" + x.b2 + "%\n"; }).join("\n");
      if (navigator.share) { navigator.share({ title: "想法偵探紀錄", text: txt }).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(txt); alertMsg("已複製，可以貼到備忘錄保存。"); }
    }
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function keepFields() { TF.forEach(function (id) { var v = val(id); if (document.getElementById(id)) FIELDS[id] = v; }); }
  function restoreFields() { TF.forEach(function (id) { var el = document.getElementById(id); if (el && FIELDS[id]) el.value = FIELDS[id]; }); }
  function alertMsg(m) { var p = document.createElement("p"); p.className = "toast"; p.textContent = m; app.querySelector(".wrap").appendChild(p); }

  /* ---------- 路由與事件 ---------- */
  function render() {
    var h = (location.hash || "#home").slice(1), html;
    if (h === "map") html = viewMap();
    else if (h.indexOf("course/") === 0) html = viewCourse(h.split("/")[1]);
    else if (h === "lines") html = viewLines();
    else if (h === "gallery") html = viewGallery();
    else if (h === "thought") html = viewThought();
    else if (h === "night") html = viewNight();
    else html = viewHome();
    app.innerHTML = html;
    if (h === "thought") restoreFields();
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  app.addEventListener("click", function (e) {
    var h = (location.hash || "#home").slice(1);
    var cd = e.target.closest("[data-course-done]");
    if (cd) {
      var id = cd.getAttribute("data-course-done"), c = D.courses.filter(function (x) { return x.id === id; })[0];
      completeStep({ t: c.steps[S.course[id] || 0].t, course: c, idx: S.course[id] || 0 }); return;
    }
    var nb = e.target.closest("[data-night]");
    if (nb) { var r = addStamp("night"); showDone({ title: "晚安。", text: "手機放好了，明天見。", flip: r.flip, pageDone: r.pageDone }); return; }
    var g = e.target.closest("[data-gal]");
    if (g) { S.page += 1; S.img = null; save(); render(); return; }
    if (h === "thought") { onThought(e); return; }
    if (h === "home" || h === "") onHomeClick(e);
  });
  app.addEventListener("input", function (e) {
    if (e.target.id === "b1" || e.target.id === "b2") {
      TD[e.target.id] = +e.target.value;
      var o = document.getElementById(e.target.id + "v"); if (o) o.textContent = e.target.value + "%";
    }
  });
  app.addEventListener("change", function (e) { if (e.target.id === "pick" && e.target.files[0]) pickImage(e.target.files[0]); });

  /* ---------- 預覽（只給媽媽測試用） ---------- */
  var pv = document.getElementById("preview");
  document.getElementById("previewBtn").addEventListener("click", function () {
    pv.innerHTML = '<div class="sheet"><h2 style="text-align:center">預覽所有畫面</h2><p style="text-align:center;margin-bottom:14px">測試版才有這個按鈕，正式版會拿掉</p>' +
      '<a href="#home">主畫面<small>今日一句、早晨三件事、今天的一步、這週</small></a>' +
      '<a href="#map">期中地圖<small>兩週時間軸、每一科分類</small></a>' +
      '<a href="#course/A">單一科目小步路徑<small>以課程A 為例</small></a>' +
      '<a href="#lines">我的三條線</a>' +
      '<a href="#gallery">我的畫冊（拼圖）<small>可以從相簿選一張畫試試</small></a>' +
      '<a href="#thought">腦袋很吵（想法偵探）</a>' +
      '<button class="pv" data-pv="night">' + (S.night ? "關閉" : "打開") + '晚上畫面<small>晚上 10 點後會自動出現</small></button>' +
      '<button class="pv" data-pv="reset">清除所有紀錄，重新開始</button>' +
      '<button class="btn dark" data-pv="close">關閉</button></div>';
    pv.hidden = false;
  });
  pv.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (a) { pv.hidden = true; return; }
    var b = e.target.closest("[data-pv]");
    if (!b) { if (e.target === pv) pv.hidden = true; return; }
    var k = b.getAttribute("data-pv");
    if (k === "night") { S.night = !S.night; save(); location.hash = "#home"; }
    if (k === "reset") { S = seed(); save(); location.hash = "#home"; }
    pv.hidden = true; render();
  });

  render();
})();
