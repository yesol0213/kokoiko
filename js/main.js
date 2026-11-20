// 메인: 첫 화면 스케일, 대표 상품 슬라이드, 공유, 클릭 이벤트
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  // 390px 기준 첫 화면을 화면 폭에 맞게 확대/축소
  function fit() { var w = $("stageWrap").clientWidth, s = w / 390; $("stage").style.transform = "scale(" + s + ")"; $("stageWrap").style.height = (752 * s) + "px"; }
  fit(); window.addEventListener("resize", fit);

  // 슬라이드
  var caps = ["冬の韓服でおさんぽ（全州）", "雪の竹林・竹緑苑（潭陽）"];
  var sl = $("slides"), n = 2, cur = 0;
  K.dragScroll(sl);
  function go(i) { sl.scrollTo({ left: sl.clientWidth * i, behavior: "smooth" }); }
  function upd() {
    var i = Math.round(sl.scrollLeft / sl.clientWidth); if (i === cur) return; cur = i;
    $("cnt").textContent = (i + 1) + "/" + n; $("cap").textContent = caps[i];
    [].forEach.call($("dots").children, function (d, k) { d.classList.toggle("on", k === i); });
    [].forEach.call($("th").children, function (d, k) { d.classList.toggle("on", k === i); });
    $("arr").style.display = i === n - 1 ? "none" : "flex";
    K.track("main_slide", { index: i + 1 });
  }
  sl.addEventListener("scroll", function () { clearTimeout(sl._t); sl._t = setTimeout(upd, 80); });
  [].forEach.call($("th").children, function (b, k) { b.onclick = function () { go(k); }; });
  $("arr").onclick = function () { go(Math.min(cur + 1, n - 1)); };

  // 지도 지역 태그 → 해당 카드로 스크롤
  document.querySelectorAll("[data-region]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault(); K.track("map_region_click", { region: a.getAttribute("data-region") });
      document.querySelectorAll("[data-region]").forEach(function (b) { b.classList.toggle("on", b === a); });
      var t = document.querySelector(a.getAttribute("href")); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  document.querySelectorAll("[data-go]").forEach(function (a) {
    a.addEventListener("click", function () { var g = a.querySelector(".gbtn"); if (g) g.classList.add("on"); K.track("select_item", { product: a.getAttribute("data-go") }); });
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
