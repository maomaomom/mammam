(function () {
  "use strict";
  var D = window.APP_DATA;
  var KEY = "xiaobu-v1";
  // 拼圖片數：前 3 張 9 片（3×3，回饋快），之後每張 12 片（3×4，大約一週一張）
  function piecesOf(page) { return page < 3 ? 9 : 12; }
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
  var SEAL_COLORS = ["#2B5FB4", "#23593F", "#C9533A", "#6A4FA3", "#B5761F", "#1F7A82"];
  function sealSVG(dateStr, big, color) {
    uid += 1;
    var id = "s" + uid, d = parse(dateStr), C = color || SEAL_COLORS[0];
    var label = (d.getMonth() + 1) + "." + pad(d.getDate());
    var star = function (x, y) { var p = []; for (var i = 0; i < 10; i++) { var r = i % 2 ? 3.4 : 8, a = -Math.PI / 2 + i * Math.PI / 5; p.push((x + r * Math.cos(a)).toFixed(1) + "," + (y + r * Math.sin(a)).toFixed(1)); } return '<polygon points="' + p.join(" ") + '"/>'; };
    return '<svg viewBox="0 0 200 200" class="' + (big ? "seal" : "") + '" role="img" aria-label="做到了的印章">' +
      '<defs><filter id="f' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="' + (uid % 9) + '"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter>' +
      '<filter id="c' + id + '"><feFlood flood-color="' + C + '"/><feComposite in2="SourceAlpha" operator="in"/></filter>' +
      '<path id="t' + id + '" d="M27,100 A73,73 0 0,1 173,100"/><path id="b' + id + '" d="M16,100 A84,84 0 0,0 184,100"/></defs>' +
      '<circle cx="100" cy="100" r="96" fill="#FBF8F1"/>' +
      '<g filter="url(#f' + id + ')" fill="none" stroke="' + C + '"><circle cx="100" cy="100" r="93" stroke-width="10"/><circle cx="100" cy="100" r="60" stroke-width="3.2"/></g>' +
      '<g filter="url(#f' + id + ')" fill="' + C + '" font-weight="900">' +
        '<text font-size="15" letter-spacing="2" text-anchor="middle"><textPath href="#t' + id + '" startOffset="50%">一次一小步 · 慢慢日記</textPath></text>' +
        '<text font-size="15" letter-spacing="2" text-anchor="middle"><textPath href="#b' + id + '" startOffset="50%">認真寫願望 · 每一天</textPath></text>' +
        star(21, 100) + star(179, 100) +
        '<text x="100" y="128" text-anchor="middle" font-size="27">做到了</text>' +
        '<path d="M68 135 Q100 131 132 134" fill="none" stroke="' + C + '" stroke-width="2.4" stroke-linecap="round"/>' +
        '<text x="100" y="151" text-anchor="middle" font-size="14" letter-spacing="1">' + label + "</text></g>" +
      '<image href="img/badge-fill.png" x="46" y="45" width="108" height="55"/>' +
      '<image href="img/badge-ink.png" x="46" y="45" width="108" height="55" filter="url(#c' + id + ')"/></svg>';
  }
  function miniSeal(color) {
    return '<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="19" fill="' + color + '"/><circle cx="19" cy="19" r="13" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/><path d="M13 19.5l4 4 8-9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var WIN = '<svg class="win" width="120" height="104" viewBox="0 0 120 104" aria-hidden="true"><circle cx="72" cy="40" r="22" fill="#F2C14E"/><rect x="26" y="8" width="86" height="86" rx="8" fill="none" stroke="#8FB8E8" stroke-width="4"/><line x1="69" y1="8" x2="69" y2="94" stroke="#8FB8E8" stroke-width="4"/><line x1="26" y1="51" x2="112" y2="51" stroke="#8FB8E8" stroke-width="4"/><path d="M26 8 Q44 52 30 94" stroke="#E86A4F" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
  var ART = '<svg class="art" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="375" fill="#FAEEDA"/><rect x="50" y="40" width="200" height="230" rx="6" fill="#B5D4F4"/><circle cx="190" cy="110" r="38" fill="#EF9F27"/><rect x="50" y="40" width="200" height="230" rx="6" fill="none" stroke="#854F0B" stroke-width="8"/><line x1="150" y1="40" x2="150" y2="270" stroke="#854F0B" stroke-width="6"/><line x1="50" y1="155" x2="250" y2="155" stroke="#854F0B" stroke-width="6"/><path d="M50 40 Q85 150 58 270" fill="#D85A30"/><path d="M250 40 Q215 150 242 270" fill="#D85A30"/><polygon points="150,270 70,375 230,375" fill="#FAC775" opacity=".7"/><ellipse cx="150" cy="330" rx="40" ry="18" fill="#5F5E5A"/><circle cx="182" cy="318" r="14" fill="#5F5E5A"/></svg>';

  /* ---------- 拼圖 ---------- */
  var ORDERS = { 9: [4, 0, 8, 2, 6, 1, 7, 3, 5], 12: [5, 0, 11, 2, 9, 7, 3, 10, 1, 6, 8, 4] };
  function usedBefore(page) { var t = 0; for (var i = 0; i < page; i++) t += piecesOf(i); return t; }
  function revealed() { var P = piecesOf(S.page); return Math.max(0, Math.min(P, S.stamps.length - usedBefore(S.page))); }
  function puzzleHTML(flipIndex) {
    var n = revealed(), open = {};
    var P = piecesOf(S.page), ORDER = ORDERS[P];
    for (var i = 0; i < n; i++) open[ORDER[i]] = i;
    var cells = "";
    for (var c = 0; c < P; c++) {
      var cls = "pc";
      if (open[c] !== undefined) cls += (open[c] === flipIndex ? " flip" : " open");
      cells += '<div class="' + cls + '"></div>';
    }
    var pic = S.img ? '<img src="' + S.img + '" alt="你的畫">' : ART;
    return '<div class="puzzle">' + pic + '<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(' + (P / 3) + ',1fr)">' + cells + "</div></div>";
  }

  /* ---------- 科目 ---------- */
  function hasMine() { return !!(S.my && S.my.length); }
  function courses() {
    if (!hasMine()) return D.courses;
    return S.my.map(function (c, i) {
      return { id: c.id, name: c.name, kind: c.kind, date: c.date, tier: c.tier, color: D.palette[i % D.palette.length], steps: D.templates[c.kind] || D.templates["其他"] };
    });
  }
  function courseById(id) { return courses().filter(function (x) { return x.id === id; })[0]; }

  /* ---------- 今天的一步 ---------- */
  function firstCourse() {
    var list = courses().filter(function (c) { return c.tier === "first" && (S.course[c.id] || 0) < c.steps.length; });
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
    if (!hasMine()) return { line: "學業 · 第一步", cls: "t-green", t: "打開學校系統，把科目填進期中地圖", small: "只填一科", why: "知道每一科什麼時候考。一科一行就好。", min: 10, setup: true };
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
    S.stamps.push({ d: today(), k: kind, c: SEAL_COLORS[Math.floor(Math.random() * SEAL_COLORS.length)] });
    var n = revealed();
    var pageDone = n >= piecesOf(S.page);
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
    var html = '<div class="sheet" role="dialog" aria-label="完成">' + (o.noStamp ? "" : sealSVG(today(), true, (S.stamps[S.stamps.length - 1] || {}).c)) +
      "<h2>" + esc(o.title) + "</h2><p>" + esc(o.text) + "</p>" +
      (o.noStamp ? "" : '<div class="mini-pz">' + puzzleHTML(o.flip) + "</div>" +
      "<p><b>揭開了第 " + n + " 片 / " + piecesOf(S.page) + "</b></p>");
    if (o.pageDone) html += '<p class="toast">這一張拼圖完成了！到「我的畫冊」看看完整的畫。</p>';
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
  /* 心靈雞湯：先用快取或內建句子，再從媽媽的試算表更新 */
  function quoteList() {
    try { var c = JSON.parse(localStorage.getItem(KEY + "-quotes") || "null"); if (c && c.length) return c; } catch (e) {}
    return D.quotes;
  }
  function quoteOfDay() { var q = quoteList(), d = parse(today()); var n = Math.round(d / 86400000) + (S.qShift || 0); return q[((n % q.length) + q.length) % q.length]; }
  function parseCSV(text) {
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += ch;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function fetchCSV(url) {
    return fetch(url + (url.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now()).then(function (r) { return r.text(); }).then(parseCSV);
  }
  var OK = /^(v|V|✓|✔|是|放入|好|TRUE|true|1)$/;
  function loadQuotes() {
    var jobs = [];
    // 媽媽的試算表：A 句子、B 署名、C 放入（空白或打勾＝放入）
    if (D.quotesCSV) jobs.push(fetchCSV(D.quotesCSV).then(function (rows) {
      return rows.slice(1).filter(function (r) { return r[0] && r[0].trim() && (!r[2] || !r[2].trim() || OK.test(r[2].trim())); })
        .map(function (r) { return { text: r[0].trim(), from: (r[1] || "").trim() || "一個關心你的人" }; });
    }).catch(function () { return []; }));
    // 親友投稿（Google 表單回應）：依標題找欄位；一定要媽媽在「放入」欄打勾才會出現
    if (D.wishesCSV) jobs.push(fetchCSV(D.wishesCSV).then(function (rows) {
      var h = rows[0] || [], ti = -1, fi = -1, oi = -1;
      h.forEach(function (x, i) { x = x || ""; if (ti < 0 && /(一句|句子|想說|話)/.test(x)) ti = i; else if (fi < 0 && /(署名|名字|稱呼)/.test(x)) fi = i; else if (oi < 0 && /放入/.test(x)) oi = i; });
      if (ti < 0 || oi < 0) return [];
      return rows.slice(1).filter(function (r) { return r[ti] && r[ti].trim() && r[oi] && OK.test(r[oi].trim()); })
        .map(function (r) { return { text: r[ti].trim(), from: (fi >= 0 && r[fi] && r[fi].trim()) || "一個關心你的人" }; });
    }).catch(function () { return []; }));
    if (!jobs.length) return;
    Promise.all(jobs).then(function (lists) {
      var list = [].concat.apply([], lists);
      if (!list.length) return;
      var old = null; try { old = localStorage.getItem(KEY + "-quotes"); localStorage.setItem(KEY + "-quotes", JSON.stringify(list)); } catch (e) {}
      if (old !== JSON.stringify(list)) render();
    });
  }

  /* 分享這週給媽媽：只有數字，不含任何私密內容 */
  function weekSummary() {
    var days = {}, cnt = { all: 0, morning: 0, step: 0, night: 0 };
    for (var j = 0; j < 7; j++) { var dd = new Date(); dd.setDate(dd.getDate() - j); days[dkey(dd)] = true; }
    S.stamps.forEach(function (s) { if (!days[s.d] || s.k === "demo") return; cnt.all++; if (cnt[s.k] !== undefined) cnt[s.k]++; });
    var steps = 0, total = 0; courses().forEach(function (c) { if (c.tier === "first") { steps += Math.min(S.course[c.id] || 0, c.steps.length); total += c.steps.length; } });
    var wakes = Object.keys(days).map(function (k) { return S.wake[k]; }).filter(Boolean);
    return "慢慢日記 · 這一週\n" +
      "蓋了 " + cnt.all + " 個章\n" +
      "早晨三件事：做到 " + cnt.morning + " 天\n" +
      "今天的一步：做到 " + cnt.step + " 次\n" +
      "晚安章：" + cnt.night + " 天\n" +
      (total ? "期中「先顧」的科目：走了 " + steps + " / " + total + " 步\n" : "") +
      (wakes.length ? "早上開始的時間：" + wakes.join("、") + "\n" : "");
  }
  function header(title, backTo, sub) {
    var t = new Date();
    if (!backTo) {
      return '<header class="hero home"><div class="toprow"><span>' + (t.getMonth() + 1) + " 月 " + t.getDate() + " 日 · 星期" + WD[t.getDay()] + '</span><span>慢慢日記</span></div>' +
        '<img class="illus" src="img/day.jpg" alt="">' + (sub || "") + "</header>";
    }
    return '<header class="hero"><a class="back" href="#' + backTo + '">← 回到' + (backTo === "home" ? "今天" : "上一頁") + "</a>" +
      "<h1>" + title + "</h1>" + (sub || "") + "</header>";
  }
  function isNight() { var h = new Date().getHours(); return S.night || h >= 22 || h < 4; }

  function viewHome(force) {
    if (!force && isNight()) return viewNight();
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
        (st.setup ? '<a class="btn" href="#setup">現在去填</a>' : '<button class="btn" data-act-home="done">做到了，蓋章</button>') +
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
      '<a class="tile pz" href="#gallery"><div class="thumb">' + puzzleHTML(-1) + '</div><div class="lbl"><b>我的畫冊</b><span> ' + revealed() + "/" + piecesOf(S.page) + " 片</span></div></a>" +
      '<a class="tile ln" href="#lines"><b>三條線</b><span>看我走到哪</span></a>' +
      '<a class="tile th" href="#thought"><b>腦袋很吵</b><span>3 分鐘整理</span></a></div>';

    var hr = new Date().getHours();
    var bed = hr >= 20 ? '<section class="sec"><div class="card" style="background:#12322D;color:#F1E4BE"><div style="font-size:19px;font-weight:900;color:#F2B33D;font-family:var(--serif)">準備收工了嗎？</div><p style="margin:6px 0 0;font-size:14px;color:#F1E4BE;line-height:1.6">睡前三件事：手機放書桌、煩惱放進盒子、吃 GABA。<br>晚上 10 點後會自動換成收工畫面。</p><a class="btn" href="#night" style="background:transparent;color:#B9D86A;border:2.5px solid #B9D86A">開始收工</a></div></section>' : "";
    return '<div class="wrap">' + h + morning + step + bed + week + tiles + "</div>";
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
  var NB = { open: false, text: "" };
  function viewNight() {
    var t = today(), n = S.stamps.filter(function (s) { return s.d === t; }).length;
    var nd = (S.nightDone && S.nightDone[t]) || [false, false, false];
    var CK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E2033" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
    var rows = D.night.map(function (txt, i) {
      var row = '<button class="nrow' + (nd[i] ? " done" : "") + '" data-nt="' + i + '"><span class="box">' + (nd[i] ? CK : "") + '</span><span class="t">' + esc(txt) + "</span></button>";
      if (i === 1 && NB.open && !nd[1]) {
        row += '<div class="nbox"><p class="soft" style="margin:0 0 8px;font-size:14px;line-height:1.6">今天腦中一直重播的畫面、想好要怎麼回的話，寫一兩句放進來。明天再說，今晚不用想完。</p>' +
          '<textarea id="nbt" rows="3" placeholder="例如：中午那句話，她是不是覺得我很怪……"></textarea>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn small" data-nb="put">放進盒子</button><button class="btn small ghost-n" data-nb="none">今天沒有</button></div></div>';
      }
      return row;
    }).join("");
    var allDone = nd[0] && nd[1] && nd[2];
    return '<div class="night"><div class="wrap" style="padding:calc(env(safe-area-inset-top) + 24px) 20px 90px">' +
      '<div class="toprow"><span>' + new Date().getHours() + ":" + pad(new Date().getMinutes()) + '</span><span>慢慢日記</span></div>' +
      '<h1 class="ntitle">今天收工了。</h1><img class="illus" src="img/night.jpg" alt=""><p class="soft" style="margin:0 0 20px">今天蓋了 ' + n + " 個章。" + (n ? "夠了。" : "明天再來就好。") + "</p>" +
      '<div class="card" style="margin-bottom:12px"><div style="font-size:15px;color:#F2B33D;margin-bottom:10px">睡前三件事' + (allDone ? " · 晚安章蓋好了" : " · 做完蓋晚安章") + '</div><div class="morning">' + rows + "</div></div>" +
      '<div class="card"><div style="font-size:15px;color:#F2B33D">明天醒來的第一步</div><div style="font-size:18px;margin:8px 0 4px">拉開窗簾，再帶狗狗出門</div><div class="soft" style="font-size:14px">已經幫你選好，明天不用想。</div></div>' +
      '<p style="text-align:center;margin-top:36px;line-height:1.7">夜裡的你，也是你。<br>但明天的你會感謝現在去睡的你。</p>' +
      '<p style="text-align:center"><a href="#day" class="soft" style="font-size:14px">看白天的畫面</a></p></div></div>';
  }
  function onNight(e) {
    var t = today();
    S.nightDone = S.nightDone || {};
    var nd = S.nightDone[t] || [false, false, false];
    var r = e.target.closest("[data-nt]");
    if (r) {
      var i = +r.getAttribute("data-nt");
      if (i === 1 && !nd[1]) { NB.open = !NB.open; render(); return; }
      nd[i] = !nd[i]; S.nightDone[t] = nd; save(); checkNight(nd); return;
    }
    var b = e.target.closest("[data-nb]");
    if (b) {
      var el = document.getElementById("nbt"), txt = el ? el.value.trim() : "";
      if (b.getAttribute("data-nb") === "put" && txt) S.thoughts.push({ d: t, fact: "", thought: txt, box: true, b1: 0, b2: 0, friend: "" });
      nd[1] = true; S.nightDone[t] = nd; NB.open = false; save(); checkNight(nd); return;
    }
  }
  function checkNight(nd) {
    var t = today();
    if (nd[0] && nd[1] && nd[2] && !S.stamps.some(function (s) { return s.d === t && s.k === "night"; })) {
      var r = addStamp("night");
      showDone({ title: "晚安。", text: "手機放好了，煩惱收進盒子了。今天到這裡就好，明天見。", flip: r.flip, pageDone: r.pageDone });
      return;
    }
    render();
  }

  /* ---------- 期中地圖 ---------- */
  function viewMap() {
    var cs = courses().slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var first = parse(cs[0].date); var mon = new Date(first); mon.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    var last = parse(cs[cs.length - 1].date); var weeks = Math.min(4, Math.max(2, Math.floor((last - mon) / 604800000) + 1));
    var WN = ["一", "二", "三", "四"];
    var byDate = {}; cs.forEach(function (c) { (byDate[c.date] = byDate[c.date] || []).push(c); });
    var cal = '<div class="cal"><span></span>' + ["一", "二", "三", "四", "五"].map(function (w) { return '<span class="h">' + w + "</span>"; }).join("");
    for (var w = 0; w < weeks; w++) {
      cal += '<span class="wk">第' + WN[w] + "週</span>";
      for (var i = 0; i < 5; i++) {
        var d = new Date(mon); d.setDate(mon.getDate() + w * 7 + i); var k = dkey(d);
        cal += '<div class="cell' + (k === today() ? " today" : "") + '">' + md(k) + (byDate[k] || []).map(function (c) { return '<span class="ev" style="background:' + c.color + '33;color:#22223B">' + esc(c.name.slice(0, 4)) + "</span>"; }).join("") + "</div>";
      }
    }
    cal += "</div>";
    var tierName = { first: ["先顧", "p-first"], keep: ["跟上", "p-keep"], later: ["再談", "p-later"] };
    var rows = cs.map(function (c) {
      var done = S.course[c.id] || 0, info = c.kind + " " + md(c.date) + " · 還有 " + daysUntil(c.date) + " 天";
      if (c.steps.length) info += " · 小步 " + Math.min(done, c.steps.length) + "/" + c.steps.length;
      if (c.tier === "later") info = c.kind + " " + md(c.date) + " · 先交給大人和老師談";
      var inner = '<span class="bar" style="background:' + c.color + '"></span><span class="mid"><b>' + esc(c.name) + "</b><span>" + info + '</span></span><span class="pill ' + tierName[c.tier][1] + '">' + tierName[c.tier][0] + "</span>";
      return c.steps.length ? '<a class="row" href="#course/' + c.id + '">' + inner + "</a>" : '<div class="row">' + inner + "</div>";
    }).join("");
    var fc = firstCourse();
    var banner = hasMine() ? '<section class="sec"><a class="btn ghost" href="#setup">修改我的科目</a></section>'
      : '<section class="sec"><div class="hint"><b>下面是範例</b>按下面的按鈕，換成你自己的科目和日期。一科一行就好，只存在這支手機。</div><a class="btn" href="#setup">填我的科目</a></section>';
    return '<div class="wrap">' + header("期中地圖", "home", '<div class="date">不用一次準備全部，一天只走一步。</div>') + banner +
      '<section class="sec"><div class="sec-h"><span class="n">1</span><b>時間軸</b><span class="r">' + (hasMine() ? "" : "範例") + '</span></div>' + cal + "</section>" +
      '<section class="sec"><div class="sec-h"><span class="n">2</span><b>每一科</b><span class="r">點科目看小步</span></div><div class="list">' + rows + "</div></section>" +
      (fc ? '<section class="sec"><div class="hint" style="background:var(--green-l)"><b style="color:var(--green-d)">今天的一步從這裡來</b>' + esc(fc.name) + " · " + esc(fc.steps[S.course[fc.id] || 0].t) + "</div></section>" : "") + "</div>";
  }

  /* ---------- 單一科目 ---------- */
  function viewCourse(id) {
    var c = courseById(id);
    if (!c) return viewMap();
    var done = S.course[id] || 0;
    var bars = c.steps.map(function (_, i) { return '<i style="background:' + (i < done ? "#1F5A3A" : "#CDEBD9") + '"></i>'; }).join("");
    var list = c.steps.map(function (s, i) {
      if (i < done) return '<div class="st done"><span class="num">✓</span><div class="tx">' + esc(s.t) + "</div></div>";
      if (i === done) return '<div class="st cur"><span class="num">' + (i + 1) + '</span><div style="flex:1"><div class="tx"><b>' + esc(s.t) + '</b></div><div class="sub">現在這一步 · 約 ' + s.min + ' 分鐘</div><button class="btn small" data-course-done="' + id + '">做到了，蓋章</button></div></div>';
      return '<div class="st lock"><span class="num">' + (i + 1) + '</span><div class="tx">' + esc(s.t) + "</div></div>";
    }).join("");
    return '<div class="wrap">' + header(esc(c.name), "map", '<div class="date">' + c.kind + " " + md(c.date) + " · 還有 " + daysUntil(c.date) + " 天 · 已走 " + done + " / " + c.steps.length + ' 步</div><div class="prog" style="grid-template-columns:repeat(' + c.steps.length + ',1fr);margin-top:10px">' + bars + "</div>") +
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
    var studyDone = 0; courses().forEach(function (c) { studyDone += Math.min(S.course[c.id] || 0, c.steps.length); });
    return '<div class="wrap">' + header("我的三條線", "home", '<div class="date">不用三條一起衝，每天走一步就好。</div>') + '<section class="sec">' +
      lineCard("作息線", "t-blue", "#24476B", "#CFE3F7", L.routine.end, L.routine.stages.length, L.routine.at, L.routine.stages[L.routine.at] + "完成早晨三件事", '<div style="font-size:13px;color:var(--soft);margin-top:4px">這週做到 ' + wk + " 天 · 穩定一週後，可以試試 " + L.routine.stages[L.routine.at + 1] + "</div>") +
      lineCard("人際線", "t-coral", "#7A2E1C", "#FAD4C8", L.social.end, L.social.steps.length, L.social.at, L.social.steps[L.social.at], '<div style="font-size:12px;color:var(--mute);margin-top:4px">第 5 步以後，等作息線走進教室才會打開</div>') +
      lineCard("學業線", "t-green", "#1F5A3A", "#CDEBD9", L.study.end, L.study.steps.length, L.study.at, "期中衝刺 · 每天一個課程小步", '<div style="font-size:13px;color:var(--soft);margin-top:4px">課程小步已完成 ' + studyDone + ' 步</div><a class="link" href="#map">看期中地圖 →</a>') +
      '<div class="hint"><b>今天的一步從哪一條來？</b>系統會幫你選。期中前多半是學業線，每週也會有兩次人際線。</div>' +
      '<div class="card" style="margin-top:12px"><div style="font-size:16px;font-weight:900">分享這週給媽媽</div><p style="margin:6px 0 0;font-size:14px;color:var(--soft);line-height:1.6">只會傳出蓋章的次數和起床時間。想法偵探、煩惱盒的內容不會傳出去。要不要分享，由你決定。</p><button class="btn dark" data-share="1">分享這週</button></div></section></div>';
  }

  /* ---------- 畫冊 ---------- */
  function viewGallery() {
    var n = revealed();
    return '<div class="wrap">' + header("我的畫冊", "home", '<div class="date">第 ' + (S.page + 1) + " 張 · 已揭開 " + n + " / " + piecesOf(S.page) + " 片</div>") +
      '<section class="sec"><div class="card">' + puzzleHTML(-1) +
      '<p style="font-size:13px;color:var(--soft);line-height:1.6;margin:12px 0 0">每蓋一個章，就揭開一片。拼完一張有小獎勵，拼完 4 張可以兌換一個往外走的大獎勵。</p>' +
      '<label class="btn ghost" style="cursor:pointer">' + (S.img ? "換一張畫" : "從相簿選一張你的畫") + '<input type="file" accept="image/*" id="pick" style="display:none"></label>' +
      '<p style="font-size:12px;color:var(--mute);margin:8px 0 0;text-align:center">照片只存在這支手機，不會上傳到任何地方</p>' +
      (n >= piecesOf(S.page) ? '<p style="font-size:14px;line-height:1.6;margin:10px 0 0">這一張拼完了！可以兌換一個小獎勵。' + ((S.page + 1) % 4 === 0 ? "這是第 " + (S.page + 1) + " 張，可以兌換一個往外走的大獎勵。" : "再拼 " + (4 - (S.page + 1) % 4) + " 張，可以兌換一個往外走的大獎勵。") + '</p><button class="btn" data-gal="next">開始下一張</button>' : "") +
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

  /* ---------- 填我的科目 ---------- */
  var SF = { kind: "筆試", tier: "first", msg: "" };
  var SV = {};
  var TIERS = [
    { k: "first", n: "先顧", d: "一定要過。每天會從這科排小步。" },
    { k: "keep", n: "跟上", d: "做到及格就好。" },
    { k: "later", n: "再談", d: "先不排小步，交給大人和老師談，或討論停修。" }
  ];
  function viewSetup() {
    var mine = S.my || [];
    var list = mine.length ? mine.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (c) {
      var tn = TIERS.filter(function (x) { return x.k === c.tier; })[0].n;
      return '<div class="row"><span class="mid"><b>' + esc(c.name) + "</b><span>" + esc(c.kind) + " " + md(c.date) + " · " + tn + '</span></span><button class="chip" data-del="' + c.id + '">刪除</button></div>';
    }).join("") : '<p class="fhint">還沒有科目。從下面開始填第一科。</p>';
    var kinds = ["筆試", "報告", "作業", "其他"].map(function (k) { return '<button class="chip' + (SF.kind === k ? " on" : "") + '" data-kind="' + k + '">' + k + "</button>"; }).join("");
    var tiers = TIERS.map(function (x) { return '<button class="trow' + (SF.tier === x.k ? " on" : "") + '" data-tier="' + x.k + '"><span class="say">' + x.n + '</span><span class="nm">' + x.d + "</span></button>"; }).join("");
    return '<div class="wrap">' + header("填我的科目", "home", '<div class="date">打開學校系統的課表，對照著填。<br>一科一行就好，只存在這支手機。</div>') +
      '<section class="sec"><div class="sec-h"><b>我的科目</b><span class="r">' + mine.length + ' 科</span></div><div class="list">' + list + "</div></section>" +
      '<section class="sec"><div class="card tcard">' +
      '<div><label class="f" for="cname">科目名稱</label><input type="text" id="cname" placeholder="例如：經濟學"></div>' +
      '<div><span class="f">期中要交什麼？</span><div class="chips">' + kinds + "</div></div>" +
      '<div><label class="f" for="cdate">考試或截止日期</label><input type="date" id="cdate"></div>' +
      '<div><span class="f">這科要怎麼顧？</span><p class="fhint">不知道怎麼選，可以先選「先顧」，之後再改。</p><div class="tlist">' + tiers + "</div></div>" +
      '<button class="btn dark" data-setup="add">加入這一科</button>' + (SF.msg ? '<p class="toast">' + esc(SF.msg) + "</p>" : "") + "</div></section>" +
      (mine.length ? '<section class="sec"><button class="btn" data-setup="finish">填好了，蓋章</button></section>' : "") + "</div>";
  }
  function keepSetup() { ["cname", "cdate"].forEach(function (id) { var el = document.getElementById(id); if (el) SV[id] = el.value; }); }
  function restoreSetup() { ["cname", "cdate"].forEach(function (id) { var el = document.getElementById(id); if (el && SV[id]) el.value = SV[id]; }); }
  function onSetup(e) {
    var k = e.target.closest("[data-kind]"); if (k) { keepSetup(); SF.kind = k.getAttribute("data-kind"); render(); return; }
    var t = e.target.closest("[data-tier]"); if (t) { keepSetup(); SF.tier = t.getAttribute("data-tier"); render(); return; }
    var del = e.target.closest("[data-del]");
    if (del) { keepSetup(); var id = del.getAttribute("data-del"); S.my = (S.my || []).filter(function (c) { return c.id !== id; }); save(); render(); return; }
    var b = e.target.closest("[data-setup]"); if (!b) return;
    var a = b.getAttribute("data-setup");
    if (a === "add") {
      keepSetup();
      var name = (SV.cname || "").trim(), date = SV.cdate || "";
      if (!name) { SF.msg = "請先寫科目名稱。"; render(); return; }
      if (!date) { SF.msg = "請選擇日期。"; render(); return; }
      S.my = S.my || [];
      S.my.push({ id: "c" + Date.now(), name: name, kind: SF.kind, date: date, tier: SF.tier });
      SF = { kind: "筆試", tier: "first", msg: "加好了「" + name + "」。可以繼續填下一科。" }; SV = {};
      save(); render(); return;
    }
    if (a === "finish") {
      SF.msg = "";
      var first = !S.stamps.some(function (s) { return s.k === "setup"; });
      location.hash = "#map";
      if (first) {
        var r = addStamp("setup");
        showDone({ title: "期中地圖完成了。", text: "每一科都有位置了。之後每天，只會從裡面拿出一小步。", flip: r.flip, pageDone: r.pageDone });
      }
    }
  }

  /* ---------- 路由與事件 ---------- */
  function render() {
    var h = (location.hash || "#home").slice(1), html;
    if (h === "map") html = viewMap();
    else if (h.indexOf("course/") === 0) html = viewCourse(h.split("/")[1]);
    else if (h === "lines") html = viewLines();
    else if (h === "gallery") html = viewGallery();
    else if (h === "thought") html = viewThought();
    else if (h === "setup") html = viewSetup();
    else if (h === "night") html = viewNight();
    else if (h === "day") html = viewHome(true);
    else html = viewHome();
    app.innerHTML = html;
    if (h === "thought") restoreFields();
    if (h === "setup") restoreSetup();
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  app.addEventListener("click", function (e) {
    var h = (location.hash || "#home").slice(1);
    var cd = e.target.closest("[data-course-done]");
    if (cd) {
      var id = cd.getAttribute("data-course-done"), c = courseById(id);
      completeStep({ t: c.steps[S.course[id] || 0].t, course: c, idx: S.course[id] || 0 }); return;
    }
    if (e.target.closest("[data-nt],[data-nb]")) { onNight(e); return; }
    var g = e.target.closest("[data-gal]");
    if (g) { S.page += 1; S.img = null; save(); render(); return; }
    if (h === "thought") { onThought(e); return; }
    if (h === "setup") { onSetup(e); return; }
    if (e.target.closest("[data-share]")) {
      var txt = weekSummary();
      if (navigator.share) navigator.share({ text: txt }).catch(function () {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(txt); alertMsg("已複製，可以貼到 LINE 傳給媽媽。"); }
      return;
    }
    if (h === "home" || h === "" || h === "day") onHomeClick(e);
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
      '<p style="text-align:center;margin:0 0 12px;font-size:13px">' + (function () { var c = null; try { c = localStorage.getItem(KEY + "-quotes"); } catch (e) {} return c ? "心靈雞湯：已讀到試算表，共 " + JSON.parse(c).length + " 句" : "心靈雞湯：還沒讀到試算表，目前用內建句子"; })() + '</p>' +
      '<button class="pv" data-pv="nextq">換下一句心靈雞湯看看<small>只是預覽用，確認試算表的句子有進來</small></button>' +
      '<a href="#home">主畫面<small>今日一句、早晨三件事、今天的一步、這週</small></a>' +
      '<a href="#map">期中地圖<small>兩週時間軸、每一科分類</small></a>' +
      '<a href="#setup">填我的科目<small>她自己填科目和考試日期</small></a>' +
      '<a href="#course/' + (courses()[0] ? courses()[0].id : "A") + '">單一科目小步路徑<small>以第一科為例</small></a>' +
      '<a href="#lines">我的三條線</a>' +
      '<a href="#gallery">我的畫冊（拼圖）<small>可以從相簿選一張畫試試</small></a>' +
      '<a href="#thought">腦袋很吵（想法偵探）</a>' +
      '<a href="#night">晚上收工畫面<small>睡前三件事；晚上 8 點後主畫面會出現入口，10 點後自動切換</small></a>' +
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
    if (k === "nextq") { S.qShift = (S.qShift || 0) + 1; save(); location.hash = "#home"; }
    if (k === "reset") { S = seed(); save(); location.hash = "#home"; }
    pv.hidden = true; render();
  });

  render();
  loadQuotes();
})();
