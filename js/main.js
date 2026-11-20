// 메인: 첫 화면 스케일, 대표 상품 슬라이드, 공유, 클릭 이벤트
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  // 390px 기준 첫 화면을 화면 폭에 맞게 확대/축소
  function fit() { var w = $("stageWrap").clientWidth, s = w / 390; $("stage").style.transform = "scale(" + s + ")"; $("stageWrap").style.height = (752 * s) + "px"; }
  fit(); window.addEventListener("resize", fit);

  // 슬라이드
  var caps = ["冬の韓服でおさんぽ（全州）", "雪の韓屋村を見下ろして（全州）", "雪の竹林・竹緑苑（潭陽）"];
  var sl = $("slides"), n = 3, cur = 0;
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
      var t = document.querySelector(a.getAttribute("href")); if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  document.querySelectorAll("[data-go]").forEach(function (a) {
    a.addEventListener("click", function () { var g = a.querySelector(".gbtn"); if (g) g.classList.add("on"); K.track("select_item", { product: a.getAttribute("data-go") }); });
  });
  $("share").onclick = function () { K.share({ title: "ここいこ｜ソウル発 日帰り韓国旅", text: "ソウルの外へ、本当の韓国を感じる旅。", medium: "main", content: "main" }); };
  $("lineTop").onclick = function (e) { e.preventDefault(); K.track("line_click", { place: "main_header" }); if (K.LINE_ADD_URL) location.href = K.LINE_ADD_URL; else K.toast("LINE公式アカウントは準備中です"); };
})();
