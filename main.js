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
    var key = w + "x" + Math.round(vh / 20); if (key === lastW) return; lastW = key;
    var bar = document.querySelector(".bar"), bh = bar ? bar.getBoundingClientRect().height + 24 : 100;
    var s = w / 390, avail = (vh - bh) / s;
    // 하늘색 박스는 항상 화면 폭. 짧은 화면: ① 박스 아래를 제주도 절반까지만 보이게 자르고(430) ② 그래도 모자라면 지도를 비율 그대로 축소
    // 제목과 박스 사이 간격은 8의 배수(28px)로 넉넉하게
    var compact = avail < 700, top = compact ? 156 : 186;
    var full = 344 / 366, vis = compact ? 462 : 481; // vis: 박스에 보일 지도 높이(제주도 절반 = 462)
    var mh = Math.min(vis * full, Math.max(320, avail - top - 14)), k = mh / vis;
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
  var imgs = JD.hero.map(function (k, i) { return i === 0 ? "jd_main1" : k; });
  var caps = JD.hero.map(function (k, i) { return i === 0 ? "冬の韓服でおさんぽ（全州）" : (cmap[k] || ""); });
  var sl = $("slides"), n = imgs.length, cur = -1;
  sl.innerHTML = imgs.map(function (k) { return '<div style="background-image:url(' + K.img(k) + ')"></div>'; }).join("");
  $("dots").innerHTML = imgs.map(function () { return "<i></i>"; }).join("");
  $("th").innerHTML = JD.hero.map(function (k, i) { return '<button style="background-image:url(' + K.img(i === 0 ? JD.thumb0 : k) + ')" aria-label="写真' + (i + 1) + '"></button>'; }).join("");
  K.dragScroll(sl);
  function go(i) { sl.scrollTo({ left: sl.clientWidth * i, behavior: "smooth" }); }
  function upd(force) {
    var i = Math.round(sl.scrollLeft / sl.clientWidth); if (i === cur && !force) return; cur = i;
    $("cnt").textContent = (i + 1) + "/" + n; $("cap").textContent = caps[i];
    [].forEach.call($("dots").children, function (d, k) { d.classList.toggle("on", k === i); });
    [].forEach.call($("th").children, function (d, k) { d.classList.toggle("on", k === i); });
    $("arr").style.display = i === n - 1 ? "none" : "flex";
    if (!force) K.track("main_slide", { index: i + 1 });
  }
  upd(true);
  sl.addEventListener("scroll", function () { clearTimeout(sl._t); sl._t = setTimeout(upd, 80); });
  [].forEach.call($("th").children, function (b, k) { b.onclick = function () { go(k); }; });
  $("arr").onclick = function () { go(Math.min(cur + 1, n - 1)); };

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
    "jeonju-damyang": { x: 160, y: 281, why: "竹林の小道と韓屋の町並みが、嵯峨野や祇園のような“古都の風景”そのもの。" },
    "gangneung": { x: 252, y: 92, why: "雪の高原牧場と、海辺のおしゃれなカフェ通り。軽井沢のような“高原リゾート”の一日。" },
    "danyang": { x: 252, y: 207, why: "石灰岩がつくる奇岩と絶景。秋吉台と同じ“カルスト地形”の町です。" }
  };
  function clearRegion() {
    var lb = $("likeBox"), c = $("mainCta");
    lb.classList.add("empty"); $("jpTag").hidden = true; $("mcard").hidden = true; document.querySelector(".mapbox .season").hidden = false;
    c.classList.add("off"); c.setAttribute("aria-disabled", "true"); c.href = "#"; c.removeAttribute("data-go");
    $("ctaMain").textContent = "エリアを選んでください"; $("ctaSub").textContent = "地図のエリアをタップ";
  }
  function setRegion(id) {
    var p = K.products[id], lb = $("likeBox"), c = $("mainCta"), j = JP[id], t = $("jpTag");
    
    lb.classList.remove("empty"); $("lbWhy").innerHTML = j.why;
    var mc = $("mcard"); $("mName").textContent = p.short; $("mLike").textContent = p.like; $("mSeason").textContent = p.season.label; $("mWhy").textContent = j.why;
    mc.hidden = false; document.querySelector(".mapbox .season").hidden = true; mc.classList.remove("pop"); void mc.offsetWidth; mc.classList.add("pop");
    c.classList.remove("off"); c.removeAttribute("aria-disabled"); c.href = p.page; c.setAttribute("data-go", id);
    $("ctaMain").textContent = p.short + "ツアーを見る";
    $("ctaSub").textContent = K.yen(p.priceKrw, K.rate || K.FALLBACK_JPY_PER_KRW) + " ／ 1名・ソウル発 日帰り";
    lb.classList.remove("pop"); void lb.offsetWidth; lb.classList.add("pop");
  }
  $("mainCta").addEventListener("click", function (e) { if (this.classList.contains("off")) { e.preventDefault(); K.toast("地図からエリアを選んでください"); } else K.track("select_item", { product: this.getAttribute("data-go"), place: "main_bar" }); });
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

  $("share").onclick = function () { K.share({ title: "ここいこ｜ソウル発 日帰り韓国旅", text: "ソウルの外へ、本当の韓国を感じる旅。", medium: "main", content: "main" }); };
  $("lineTop").onclick = function (e) { e.preventDefault(); K.track("line_click", { place: "main_header" }); if (K.LINE_ADD_URL) location.href = K.LINE_ADD_URL; else K.toast("LINE公式アカウントは準備中です"); };
})();
