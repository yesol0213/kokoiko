// 메인: 첫 화면 스케일, 대표 상품 슬라이드, 공유, 클릭 이벤트
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  // 390px 기준 첫 화면을 화면 폭에 맞게 확대/축소
  // 지도 전체(아래 고정 바 위까지)가 첫 화면에 들어오도록 폭·높이 중 작은 쪽에 맞춤 (카톡·LINE 인앱 브라우저 대응)
  var lastW = 0;
  function fit() {
    var wrap = $("stageWrap"), w = wrap.clientWidth;
    // 인앱 브라우저(카톡·LINE)는 innerHeight가 실제 보이는 높이보다 크게 잡힐 때가 있어 가장 작은 값을 사용
    var vh = Math.min(window.innerHeight, document.documentElement.clientHeight || 9999, window.visualViewport ? window.visualViewport.height : 9999);
    // 스크롤로 주소창이 숨고 나타날 때 높이가 바뀌어도 다시 계산하지 않음 (지도가 늘었다 줄었다 하는 효과 방지). 폭이 바뀔 때(회전 등)만 다시 계산
    var key = "" + w; if (key === lastW) return; lastW = key;
    var bar = document.querySelector(".bar"), bh = bar ? bar.getBoundingClientRect().height + 10 : 100;
    var s = w / 390, avail = (vh - bh) / s;
    // 하늘색 박스는 항상 화면 폭. 짧은 화면: ① 박스 아래를 제주도 절반까지만 보이게 자르고(430) ② 그래도 모자라면 지도를 비율 그대로 축소
    // 제목과 박스 사이 간격은 8의 배수(28px)로 넉넉하게
    var compact = avail < 700, top = compact ? 172 : 196;
    var full = 344 / 366, vis = compact ? 462 : 481; // vis: 박스에 보일 지도 높이(제주도 절반 = 462)
    var mh = Math.min(vis * full + 12, Math.max(320, avail - top - 4)), k = mh / vis;
    $("stage").classList.toggle("compact", compact);
    var mb = document.querySelector(".mapbox"); mb.style.top = top + "px"; mb.style.height = mh + "px"; mb.style.transform = "";
    var kk = Math.min(k, full); $("mapin").style.transform = "scale(" + kk + ")";
    var H = top + mh + 12;
    $("stage").style.transform = "scale(" + s + ")"; $("stage").style.height = H + "px";
    wrap.style.height = (H * s) + "px";
  }
  fit(); window.addEventListener("resize", fit); if (window.visualViewport) window.visualViewport.addEventListener("resize", fit); window.addEventListener("load", function () { lastW = 0; fit(); }); window.addEventListener("orientationchange", function () { lastW = 0; setTimeout(fit, 200); });

  // 슬라이드: 상세페이지 대표사진 5장과 동일 (첫 장만 메인용 세로 크롭)
  var JD = K.products["jeonju-damyang"], cmap = {}; JD.gallery.forEach(function (g) { cmap[g[0]] = g[1]; });
  var imgs = JD.hero.map(function (k, i) { return i === 0 ? "jd_main1" : k; }).concat(["jd_pnb", "jd_bg"]);
  var caps = (JD.heroCaps || JD.hero.map(function (k, i) { return i === 0 ? "冬の韓服でおさんぽ（全州）" : (cmap[k] || ""); })).concat(["PNB 手作りチョコパイ（全州）", "バゲットバーガー（全州）"]);
  var sl = $("slides"), n = imgs.length, cur = -1;
  sl.innerHTML = imgs.map(function (k) { return '<div style="background-image:url(' + K.img(k) + ')"></div>'; }).join("");
  $("dots").innerHTML = imgs.map(function () { return "<i></i>"; }).join("");
  $("th").innerHTML = JD.hero.map(function (k, i) { return '<button style="background-image:url(' + K.img(i === 0 ? JD.thumb0 : k) + ')" aria-label="写真' + (i + 1) + '"></button>'; }).join("");
  K.dragScroll(sl);
  function go(i) { sl.scrollTo({ left: sl.clientWidth * i, behavior: "smooth" }); }
  // 손가락을 따라 움직이다가, 놓을 때 30px 이상 밀었으면 다음/이전 장으로 (절반 넘기지 않아도 넘어감)
  var tx = 0, ty = 0, tb = 0;
  sl.addEventListener("touchstart", function (e) { var t = e.touches[0]; tx = t.clientX; ty = t.clientY; tb = Math.round(sl.scrollLeft / sl.clientWidth); }, { passive: true });
  sl.addEventListener("touchend", function (e) { var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return; go(Math.max(0, Math.min(n - 1, tb + (dx < 0 ? 1 : -1)))); }, { passive: true });
  function upd(force) {
    var i = Math.round(sl.scrollLeft / sl.clientWidth); if (i === cur && !force) return; cur = i;
    if ($("cnt")) $("cnt").textContent = (i + 1) + "/" + n; if ($("cap")) $("cap").textContent = caps[i];
    [].forEach.call($("dots").children, function (d, k) { d.classList.toggle("on", k === i); });
    [].forEach.call($("th").children, function (d, k) { d.classList.toggle("on", k === i); });
    if ($("arr")) $("arr").style.display = i === n - 1 ? "none" : "flex";
    if (!force) K.track("main_slide", { index: i + 1 });
  }
  upd(true);
  sl.addEventListener("scroll", function () { clearTimeout(sl._t); sl._t = setTimeout(upd, 80); });
  [].forEach.call($("th").children, function (b, k) { b.onclick = function () { go(k); }; });
  if ($("arr")) $("arr").onclick = function () { go(Math.min(cur + 1, n - 1)); };
  // 자동 슬라이드: 3.5초마다 다음 장, 마지막 장 다음은 처음으로. 손으로 넘기면 멈춤. '동작 줄이기' 기기는 자동 넘김 없음
  var auto = null, AUTO_MS = 3500;
  function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
  if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    auto = setInterval(function () { if (document.hidden) return; go((cur + 1) % n); }, AUTO_MS);
    ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { sl.addEventListener(ev, stopAuto, { passive: true }); });
  }
  // 큰 카드 사진 전체: 탭하면 상세로 (스와이프·썸네일·화살표는 그대로)
  var sx = 0, sy = 0;
  sl.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
  sl.addEventListener("click", function (e) {
    if (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10) return;
    K.track("select_item", { product: "jeonju-damyang", place: "main_photo" });
    location.href = "jeonju-damyang.html";
  });

  // 강릉 영상: 자동재생 시도 → 막히면(저전력 모드·인앱 브라우저) 탭해서 재생
  var gv = $("gnVid"), vbox = gv.parentNode;
  gv.muted = true; gv.setAttribute("muted", ""); gv.playsInline = true;
  function tryPlay() { var pr = gv.play(); if (pr && pr.catch) pr.catch(function () { vbox.classList.remove("playing"); }); }
  gv.addEventListener("playing", function () { vbox.classList.add("playing"); });
  gv.addEventListener("pause", function () { vbox.classList.remove("playing"); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) tryPlay(); else gv.pause(); }); }, { threshold: 0.3 }).observe(gv); else tryPlay();
  vbox.addEventListener("touchstart", function () { if (gv.paused) tryPlay(); }, { passive: true });

  // 지도 지역 태그: 누르면 아래 「≒ 日本でいうと」 박스와 하단 버튼만 바뀜 (스크롤 이동 없음)
  // 지역별: 지도 위 일본 지명 태그 위치 + 하단 박스의 비유 이유
  var JP = {
    "jeonju-damyang": { x: 160, y: 281, why: "嵐山のような竹林と、三年坂のような韓屋の路地。" },
    "gangneung": { x: 252, y: 92, why: "ソウルから2時間、海のある軽井沢へ。" },
    "danyang": { x: 252, y: 207, why: "秋吉台と同じカルストを、空から見下ろす。" }
  };
  function clearRegion() {
    var lb = $("likeBox"), c = $("mainCta");
    lb.classList.add("empty"); $("jpTag").hidden = true; $("mcard").hidden = true; $("mapin").removeAttribute("data-sel"); document.querySelectorAll(".mtag .q").forEach(function (q) { q.textContent = "≒ ？"; });
    c.classList.add("off"); c.setAttribute("aria-disabled", "true"); c.href = "#"; c.removeAttribute("data-go");
    $("ctaMain").textContent = "タップしてチェック！"; $("ctaSub").textContent = "";
  }
  function setRegion(id) {
    var p = K.products[id], lb = $("likeBox"), c = $("mainCta"), j = JP[id], t = $("jpTag");
    
    lb.classList.remove("empty"); $("lbWhy").innerHTML = j.why;
    var mc = $("mcard"); $("mName").textContent = p.short; $("mLike").textContent = p.like; $("mSeason").classList.toggle("gw", !!p.season.tone); $("mSeason").innerHTML = K.icon(p.season.icon, "currentColor", p.season.icon === "flower" ? 19 : 14) + p.season.label; $("mWhy").textContent = j.why;
    mc.hidden = false; mc.onclick = null; mc.style.cursor = "default"; $("mapin").setAttribute("data-sel", id); document.querySelectorAll(".mtag .q").forEach(function (q) { q.textContent = q.getAttribute("data-q") === id ? "≒ " + p.like : "≒ ？"; }); mc.classList.remove("pop"); void mc.offsetWidth; mc.classList.add("pop");
    c.classList.remove("off"); c.removeAttribute("aria-disabled"); c.href = p.page; c.setAttribute("data-go", id);
    $("ctaMain").textContent = "ここ、見てみる？"; $("ctaSub").textContent = p.short + "・" + K.yen(p.priceKrw, K.rate || K.FALLBACK_JPY_PER_KRW);
    $("mPrice").innerHTML = "<b>" + K.yen(p.priceKrw, K.rate || K.FALLBACK_JPY_PER_KRW) + (document.body.classList.contains("tilde") ? "〜" : "") + "</b><span>₩" + p.priceKrw.toLocaleString() + "・1名</span>";
    lb.classList.remove("pop"); void lb.offsetWidth; lb.classList.add("pop");
  }
  var tt = $("totop"); window.addEventListener("scroll", function () { tt.classList.toggle("on", window.scrollY > 900); }, { passive: true }); tt.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); K.track("to_top", { product: "main" }); };
  $("mainCta").addEventListener("click", function (e) { if (this.classList.contains("off")) { e.preventDefault(); K.toast("タップしてチェック！"); } else K.track("select_item", { product: this.getAttribute("data-go"), place: "main_bar" }); });
  document.querySelectorAll("[data-region]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault(); var id = a.getAttribute("data-region"), off = a.classList.contains("on");
      document.querySelectorAll("[data-region]").forEach(function (b) { b.classList.toggle("on", !off && b === a); });
      if (off) clearRegion(); else setRegion(id);
      K.track("map_region_click", { region: id, selected: !off });
    });
  });
  document.querySelectorAll("[data-go]").forEach(function (a) {
    a.addEventListener("click", function () { K.track("select_item", { product: a.getAttribute("data-go") }); });
  });
  // 지도 눈: 위에서 아래로 내리는 애니메이션
  var FL = '<svg viewBox="-12 -12 24 24"><g fill="none" stroke-linecap="round"><g stroke="#8FB3D4" stroke-width="4.2">' + [0, 60, 120].map(function (r) { return '<line x1="0" y1="-9" x2="0" y2="9" transform="rotate(' + r + ')"/>'; }).join("") + '</g><g stroke="#fff" stroke-width="2.4">' + [0, 60, 120].map(function (r) { return '<line x1="0" y1="-9" x2="0" y2="9" transform="rotate(' + r + ')"/>'; }).join("") + '</g></g></svg>';
  var sn = $("snow"), h = "";
  for (var i = 0; i < 16; i++) {
    var sz = 9 + Math.random() * 10, dur = 7 + Math.random() * 7;
    h += '<i style="left:' + (Math.random() * 96).toFixed(1) + '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;animation-duration:' + dur.toFixed(1) + 's,' + (2.5 + Math.random() * 2).toFixed(1) + 's;animation-delay:-' + (Math.random() * dur).toFixed(1) + 's,0s">' + FL + '</i>';
  }
  sn.innerHTML = h;

  if ($("share")) $("share").onclick = function () { K.share({ title: "ここいこ｜ソウル発 日帰り韓国旅", text: "ソウルの外へ、本当の韓国を感じる旅。", medium: "main", content: "main" }); };
  if ($("lineTop")) $("lineTop").onclick = function (e) { e.preventDefault(); K.track("line_click", { place: "main_header" }); if (K.LINE_ADD_URL) location.href = K.LINE_ADD_URL; else K.toast("ただいま準備中です"); };

  // 하단 바: 첫 화면에서는 항상 보임. 지나면 상세 상단 바와 같은 규칙(내리면 숨고, 올리면 나타남)
  var lastY2 = window.scrollY;
  function barScroll() {
    var y = window.scrollY, wrap = $("stageWrap"), past = y > wrap.offsetTop + wrap.offsetHeight - 120, d = y - lastY2;
    if (!past) { document.body.classList.remove("bhide"); lastY2 = y; }
    else if (d > 8) { document.body.classList.add("bhide"); lastY2 = y; }
    else if (d < -8) { document.body.classList.remove("bhide"); lastY2 = y; }
  }
  window.addEventListener("scroll", barScroll, { passive: true });

  // 큰 카드가 화면 밖으로 나가면 슬라이드를 1장째로 되돌림 (돌아왔을 때 처음부터)
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting && sl.scrollLeft > 0) sl.scrollTo({ left: 0 }); });
  }, { threshold: 0 }).observe(sl);
})();
