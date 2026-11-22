// 상품 상세: 데이터로 화면 생성 + 날짜 → 시간·집합장소 → 인원 순서 선택
(function () {
  var K = window.KOKOIKO, id = document.body.getAttribute("data-product"), p = K.products[id];
  var app = document.getElementById("app"), img = K.img;
  var BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A2230" stroke-width="2.6" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>';
  var SHARE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A2230" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var CAL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A2230" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var it = p.intro;
  var PIN = '<svg width="30" height="40" viewBox="0 0 30 40"><path d="M15 39C15 39 2 23 2 14a13 13 0 0 1 26 0c0 9-13 25-13 25z" fill="#C82158" stroke="#fff" stroke-width="2.5"/><circle cx="15" cy="14" r="5" fill="#fff"/></svg>';
  var EXP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A2230" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg>';

  var st = { date: null, time: false, qty: 0 }, dates = {};
  var sp = { date: null, time: false, qty: 0 }; // 캘린더 시트 안 선택
  var rate = function () { return K.rate || K.FALLBACK_JPY_PER_KRW; };
  var so = p.solo;
  var NEED = function (k, cls) { return '<div class="need ' + (cls || '') + '">사진 필요: ' + k.slice(5) + '</div>'; };
  var media = function (k) { return k.indexOf("video:") === 0 ? { v: "assets/" + k.slice(6) + ".mp4", p: img(k.slice(6)) } : { i: img(k) }; };
  // 선택은 기억하지 않음 (뒤로 와도 초기화). 결제 실패 페이지에서 온 경우만 주소의 날짜·인원으로 복원
  (function () { var q = new URLSearchParams(location.search), d = q.get("date"), n = parseInt(q.get("qty"), 10); if (/^\d{4}-\d{2}-\d{2}$/.test(d || "") && n > 0 && n < 100) st = { date: d, time: true, qty: n }; })();
  try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf("kk_sel_") === 0) sessionStorage.removeItem(k); }); } catch (e) {}
  window.addEventListener("pageshow", function (e) { if (e.persisted) location.reload(); });


  // 가격 비교 엔화: 페이지 맨 위 가격과 같은 '오늘 환율'로 채움 (K.fillYen). 구간은 10円 단위, 합계는 맨 위와 같은 100円 단위
  var fy = function (w) { return '<b data-krw10="' + w + '">' + K.yen(w, rate()).replace("約", "") + '</b>'; };
  var fullImg = function (k, cls) { if (k.indexOf("need:") === 0) return NEED(k, "fimg"); var m = media(k); return m.v ? '<div class="fimg ' + (cls || "") + '"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video></div>' : '<img class="fimg ' + (cls || "") + '" src="' + m.i + '" alt="" loading="lazy">'; };
  var lab = function (t) { return t ? '<span class="plab">' + t + '</span>' : ""; };

  // ① 도시 소개 (일본과 비교하며 지역 소개)
  function cityHtml() {
    var h = '<div class="city">' + (it.kicker ? '<p class="ckk">' + it.kicker + '</p>' : "") + '<h2 class="ch">' + it.lead + '</h2><p class="cd">' + it.desc + '</p>' + fullImg(it.img);
    if (it.foodImgs) {
      var f = it.foodImgs;
      h += '<p class="cf">' + it.foodTitle + '<small>' + it.foodSub + '</small></p>' +
        '<div class="fbig"><img src="' + img(f[0][0]) + '" alt="" loading="lazy">' + lab(f[0][1]) + '</div>' +
        '<div class="ftwo">' + f.slice(1).map(function (x) { return '<div><img src="' + img(x[0]) + '" alt="" loading="lazy">' + lab(x[1]) + '</div>'; }).join("") + '</div>' +
        (it.foodNote ? '<p class="cnote">' + it.foodNote + '</p>' : '');
    }
    if (it.cityTitle) h += '<p class="cf">' + it.cityTitle + '<small>' + it.cityDesc + '</small></p>' + fullImg(it.cityImg);
    return h + '</div>';
  }
  // こんな人におすすめ (제목 가운데, 목록은 시작선 맞춰 가운데 배치)
  function recHtml() { return '<div class="rec"><b>こんな人におすすめ</b><div class="recl">' + it.rec.map(function (r) { return '<div><i>✓</i>' + r + '</div>'; }).join("") + '</div></div>'; }
  // 혼자 vs KOKOIKO 가격 비교 (구간별)
  function priceHtml() {
    var legs = p.legs || [["ソウル（蚕室）"], ["bus", "交通費＋入場料", so.total], ["ソウル"]]; // 구간표 없으면 금액 1개로
    var tot = legs.reduce(function (t, l) { return t + (l[2] || 0); }, 0) || so.total;
    var per = Math.round((tot - p.priceKrw) / tot * 100);
    var rows = '<div class="pc-st pre"><span>計画</span></div><div class="pc-a"></div><div class="pc-k"></div>' +
      '<div class="pc-mv">' + K.icon("memo") + '下調べ・予約</div><div class="pc-a"><span class="g">自分で</span></div><div class="pc-k"><i class="ck"></i></div>';
    legs.forEach(function (l, i) {
      if (l.length === 1) rows += '<div class="pc-st"><span>' + l[0] + '</span></div><div class="pc-a"></div><div class="pc-k">' + (i === legs.length - 1 ? '<b class="inc">すべて込み</b>' : "") + '</div>';
      else rows += '<div class="pc-mv' + (l[3] ? ' t' : '') + '">' + K.icon(l[0]) + '<span><em>' + l[1] + '</em>' + (l[3] ? '<small class="tm">' + l[3] + '</small>' : '') + '</span></div><div class="pc-a"><span>' + fy(l[2]) + '</span><small>' + K.krw(l[2]) + '</small></div><div class="pc-k"><i class="ck"></i></div>';
    });
    return '<div class="pcmp"><h2 class="ph">' + (p.pcHead ? p.pcHead.replace('{diff}', '<span data-krw="' + (p.priceKrw - tot) + '">' + K.yen(p.priceKrw - tot, rate()) + '</span>') : per >= 10 ? 'ひとりで行くより<br><span class="mk">約' + per + '%安く</span>、ラクに。' : 'ひとりで行くより<br><span class="mk">ずっとラクに</span>。') + '</h2><p class="psub">' + (p.pcSub || 'ソウルの外へ、本当の韓国を感じる旅を') + '</p>' +
      '<div class="pc"><div class="pc-h0"></div><div class="pc-h a">ひとりで</div><div class="pc-h k">KOKOIKO</div><div class="pc-gap"></div><div class="pc-a pc-gap"></div><div class="pc-k pc-gap"></div>' + rows + '<div class="pc-gap"></div><div class="pc-a pc-gap"></div><div class="pc-k pc-gap"></div>' +
      (p.rides ? '<div class="pc-rd"><b>乗り換え</b></div><div class="pc-a rd"><span>' + p.rides + '回</span></div><div class="pc-k rd"><span>なし</span></div>' : '') +
      '<div class="pc-sum"><b>合計</b><small>※円は本日のレートによる目安</small>' + (legs.some(function (l) { return /<sup>※/.test(l[1] || ""); }) ? '<small>※公共交通がない区間</small>' : '') + (legs.some(function (l) { return /<sup>＊/.test(l[1] || ""); }) ? '<small>＊バスが1日数本しかない区間</small>' : '') + '</div><div class="pc-a sum"><span data-krw="' + tot + '">' + K.yen(tot, rate()) + '</span><small>' + K.krw(tot) + '</small></div>' +
      '<div class="pc-k sum"><span class="mk" data-krw="' + p.priceKrw + '">' + K.yen(p.priceKrw, rate()) + '</span><small>' + K.krw(p.priceKrw) + '</small></div></div></div>';
  }
  function routeHtml() {
    if (!p.route) return "";
    var names = (it.spots || it.blocks).map(function (b) { return b.t.replace(/（.*?）/, ""); });
    return '<div class="iroute"><h2 class="rh">' + (it.routeTitle || "ソウルから、<br>乗り換えなしで") + '</h2><p class="rs">' + (it.routeSub || "蚕室駅を出発して、" + names.join("・") + "をめぐる一日") + '</p>' +
      '<button class="rmap" id="rmap" style="aspect-ratio:' + p.route.ratio + ';background-image:url(assets/img/' + p.route.img + ')" aria-label="コースマップを拡大"></button></div>';
  }
  // 장소 소개: 이름·설명 → 둥근 사각형 사진 슬라이드 (왼쪽 위 번호 = 코스맵 번호)
  function spotsHtml() {
    var sp = it.spots || it.blocks.map(function (b, i) { return { n: b.n || i + 2, t: b.t, p: b.p, imgs: [b.img] }; });
    return '<div class="spots">' + sp.map(function (s) {
      return '<div class="spot"><h3>' + s.t + '</h3><p>' + s.p + '</p><div class="sph"><div class="spsl">' +
        s.imgs.map(function (k, j) { var m = k.indexOf("need:") === 0 ? null : media(k); return '<div class="spi">' + (!m ? NEED(k) : m.v ? '<video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video>' : '<img src="' + m.i + '" alt="' + s.t + '" loading="lazy">') + (s.labels && s.labels[j] ? '<span class="plab r">' + s.labels[j] + '</span>' : "") + '</div>'; }).join("") +
        '</div><span class="spn">' + s.n + '</span>' + (s.imgs.length > 1 ? '<div class="dots">' + s.imgs.map(function (x, j) { return '<i' + (j ? '' : ' class="on"') + '></i>'; }).join("") + '</div><span class="spc">1/' + s.imgs.length + '</span><button class="arr spa" aria-label="次の写真"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' : '') + '</div></div>';
    }).join("") + '</div>';
  }
  // K-スイーツ / K-カフェ (세 페이지 고정 섹션)
  function sweetsHtml() {
    var w = it.sweets || { title: it.food.kTitle || "K-スイーツ", sub: "昼・夕食は自由時間。ローカルの味を楽しもう。", imgs: it.food.imgs, p: it.food.p };
    return '<div class="food"><h3>' + w.title + '</h3><div class="s">' + w.sub + '</div><div class="fg">' +
      w.imgs.map(function (f) { return f[0].indexOf("need:") === 0 ? '<div class="need">사진 필요: ' + f[0].slice(5) + '</div>' : '<div style="background-image:url(' + img(f[0]) + ')"><span>' + f[1] + '</span></div>'; }).join("") + '</div><div class="fl">' + w.p + '</div></div>';
  }
  function galHtml() {
    var G = p.gallery, more = G.length - 5;
    return '<div class="sec"><h2>' + (p.galleryTitle || "フォトギャラリー") + '</h2><div class="gal">' + G.slice(0, 5).map(function (g, i) { if (g[0].indexOf("need:") === 0) return '<button class="need" data-i="' + i + '">사진 필요:<br>' + g[0].slice(5) + '</button>'; var m = media(g[0]); return '<button data-i="' + i + '"' + (m.i ? ' style="background-image:url(' + m.i + ')"' : "") + '>' + (m.v ? '<video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay sm"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i>' : "") + '<span>' + g[1] + '</span>' + (i === 4 && more > 0 ? '<i class="gmore">＋' + more + '</i>' : "") + '</button>'; }).join("") + '</div><div class="note crd">' + p.credit + '</div></div>';
  }

  app.innerHTML =
    '<div class="dtop" id="dtop"><a class="ib" href="index.html" id="back" aria-label="戻る">' + BACK + '</a><span class="ttl">' + p.title + '</span><button class="ib" id="shareTop" aria-label="シェア">' + SHARE + '</button></div>' +
    '<div class="dhero" id="dhero"><div class="slides" id="hs">' + p.hero.map(function (k) { var m = media(k); return m.v ? '<div class="hv"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i></div>' : '<div style="background-image:url(' + img(k) + ')"></div>'; }).join("") + '</div><div class="cnt" id="hcnt">1 / ' + p.hero.length + '</div>' +
      '<div class="th" id="hth">' + p.hero.map(function (k, i) { var m = media(k); return '<button' + (i ? "" : ' class="on"') + ' style="background-image:url(' + (i === 0 && p.thumb0 ? img(p.thumb0) : m.p || img(k)) + ')" aria-label="' + (m.v ? "動画" : "写真") + (i + 1) + '">' + (m.v ? '<i class="tplay"></i>' : '') + '</button>'; }).join("") + '</div></div>' +
    '<div class="sec"><div class="chips">' + (p.ichioshi ? '<span class="c-ichi">イチオシ</span>' : '') + '<span class="c-season' + (p.season.tone ? ' ' + p.season.tone : '') + '">' + K.icon(p.season.icon, "currentColor", 14) + p.season.label + '</span></div>' +
      '<h1>' + p.name + '</h1><div class="sub">ソウル発 日帰り ・ ' + p.timeShort + ' ・ 送迎バス付き</div>' +
      '<div class="price"><b data-krw="' + p.priceKrw + '"></b><small>' + K.krw(p.priceKrw) + ' ／ 1名（税込）</small></div>' +
      '<div class="note">円は目安です。お支払いは韓国ウォン（₩）建てです。</div></div>' +
    '<div class="sec" id="pick"><div class="h2row"><h2>いつ参加しますか？</h2><button class="calk" id="calOpen">' + CAL + 'カレンダーで見る ›</button></div>' +
      '<div class="lbl">参加日</div><div id="dateChips"></div><div id="timeBox"></div><div id="qtyBox"></div>' +
      '<div class="info"><div class="ir nw">' + K.icon("ppl") + '<span><b>' + K.MIN_PEOPLE + '名様以上で催行確定</b><small>（未満は全額返金）</small></span></div><div class="ir">' + K.icon("clk") + '予約締切：出発' + K.CLOSE_DAYS_BEFORE + '日前</div><div class="ir nw">' + K.icon("kid") + '大人・子ども同料金／2歳未満は無料</div></div></div>' +
    '<div class="sec intro2"><div class="intro clip" id="intro">' + cityHtml() + '<hr class="hl">' + recHtml() + '<hr class="hl">' + priceHtml() + '<hr class="hl">' + routeHtml() + spotsHtml() + sweetsHtml() + '</div><button class="more" id="more">詳細情報をもっと見る ⌄</button></div>' +
    galHtml() +
    '<div class="sec"><h2 style="margin-bottom:4px">スケジュール</h2><div class="note" style="margin:0 0 12px">当日の交通状況により変わる場合があります。</div><div class="sl">' +
      p.schedule.map(function (s) { return '<div class="si"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join("") + '</div></div>' +
    (p.reviews && p.reviews.length ? '<div class="sec"><h2>体験レビュー</h2><div class="rv">' + p.reviews.map(function (r) { return '<div style="background-image:url(' + img(r) + ')"></div>'; }).join("") + '</div></div>' : '') + // 후기 사진이 생기면 data.js 에 reviews: ["파일명", ...] 추가
    '<div class="sec warnsec"><div class="warn"><div class="wt">' + K.icon("warn", "#C82158", 19) + 'ご予約前に必ずご確認ください</div>' + K.warn.map(function (w, i) { return '<div class="wc"><b><i class="wn">' + (i + 1) + '</i>' + w[0] + '</b><p>' + w[1] + '</p></div>'; }).join("") + '</div></div>' +
    '<div class="sec"><h2 style="margin-bottom:4px">集合場所</h2><div class="note" style="margin:0 0 12px">出発の10分前までにお集まりください。</div>' +
      '<div class="mpc"><div class="mpm"><iframe loading="lazy" tabindex="-1" aria-hidden="true" title="集合場所の地図" src="https://maps.google.com/maps?q=%EC%9E%A0%EC%8B%A4%EC%97%AD&z=15&hl=ja&output=embed"></iframe>' +
        '<a class="mlink" href="' + K.MEETING.map + '" target="_blank" rel="noopener" id="gmap" aria-label="Googleマップで開く"></a><i class="mpin">' + PIN + '</i>' +
        '<span class="gbadge"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></span><span class="mexp">' + EXP + '</span></div>' +
        '<a class="mrow" href="' + K.MEETING.map + '" target="_blank" rel="noopener" id="gmap2"><b>' + K.MEETING.ja + '</b><i>›</i></a>' +
        '<div class="mad"><span>' + K.MEETING.ko + '</span><button class="cpy" id="copyAddr">コピー</button></div></div>' +
      '<div class="note" style="margin-top:8px">※ タクシーでは韓国語住所を運転手に見せてください。</div></div>' +
    '<div class="sec" style="border-bottom:none">' +
      '<details class="acc" open><summary>含まれるもの／含まれないもの</summary><div class="accb"><div class="ir">' + K.icon("ok", "#C82158") + K.includes + '</div><div class="ir">' + K.icon("no") + K.excludes + '</div></div></details>' +
      '<details class="acc"><summary>注意事項</summary><div class="accb">・' + K.notes.join("<br>・") + '</div></details>' +
      '<details class="acc"><summary>キャンセル・返金規定</summary><div class="accb"><p class="accl">キャンセルは、LINEで注文番号をお知らせください。</p>・' + K.cancel.join("<br>・") + '</div></details>' +
      '<details class="acc"><summary>お問い合わせ（LINE・Instagram）</summary><div class="accb"><p class="accl">催行確定・日程のご案内・キャンセルや返金のご相談は、LINEでお気軽にどうぞ。</p>' + K.contactLinks() + '</div></details></div>' +
    '<footer id="footer"></footer><button class="totop" id="totop" aria-label="ページの先頭へ"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A2230" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg></button>' +
    '<div class="bar solid"><div class="bprice"><span id="bLabel"></span><div><b id="bYen"></b><small id="bKrw"></small></div></div><button class="cta w" id="reserve">予約に進む</button></div>' +
    '<div class="sheet" id="sheet"><div class="dim" data-x></div><div class="body"><div class="grab"></div><div class="sh-hd"><b>参加日を選ぶ</b><button data-x aria-label="閉じる">✕</button></div>' +
      '<div class="sbody"><div class="mo"><button id="mPrev" aria-label="前の月">‹</button><span id="mTitle"></span><button id="mNext" aria-label="次の月">›</button></div>' +
      '<div class="cal" id="cal"></div><div class="legend"><span><i style="background:#C82158"></i>選択中</span><span><i style="background:#C9C3C7"></i>予約不可</span><span style="color:#C9C3C7;font-weight:900">満席</span></div>' +
      '<div class="note">※ 祝日・悪天候の日は催行しません。予約締切は出発' + K.CLOSE_DAYS_BEFORE + '日前です。</div>' +
      '<div id="sSel"></div><a class="wait" id="wait" hidden href="#">LINEでキャンセル待ちする ›</a></div>' +
      '<div class="sbar"><div class="bprice"><span id="sLabel"></span><div><b id="sYen"></b><small id="sKrw"></small></div></div><button class="cta w" id="sGo" disabled>予約に進む</button></div></div></div>' +
    '<div class="lb" id="lb"><button class="x" aria-label="閉じる">✕</button><div class="lbm" id="lbm"></div><div class="lbn"><button id="lbP" aria-label="前へ">‹</button><span id="lbC"></span><button id="lbN" aria-label="次へ">›</button></div></div>';

  var $ = function (x) { return document.getElementById(x); };

  // 상단 바: 사진을 지나면 흰 바
  function onScroll() { $("dtop").classList.toggle("solid", window.scrollY > $("dhero").offsetHeight - 60); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("shareTop").onclick = function () { K.share({ title: p.title + "｜ここいこ", text: "ソウル発 日帰り ≒ " + p.like, medium: "detail", content: id }); };

  // 대표 사진 슬라이드 카운터
  var hs = $("hs"), hth = $("hth").children;
  hs.addEventListener("scroll", function () { var i = Math.round(hs.scrollLeft / hs.clientWidth); $("hcnt").textContent = (i + 1) + " / " + p.hero.length; [].forEach.call(hth, function (b, k) { b.classList.toggle("on", k === i); }); });
  [].forEach.call(hth, function (b, k) { b.onclick = function () { hs.scrollTo({ left: hs.clientWidth * k, behavior: "smooth" }); }; });
  K.dragScroll(hs);

  // 상품 소개 펼치기·접기 (접힌 상태 = 도시 소개 첫 사진까지)
  function clipH() {
    var box = $("intro"); if (!box || box.classList.contains("open")) return;
    var f = box.querySelector(".city .fimg");
    box.style.maxHeight = (f ? f.offsetTop + f.offsetHeight : 330) + "px";
  }
  clipH();
  $("intro").querySelectorAll(".city .fimg").forEach(function (m) { m.addEventListener("load", clipH); m.addEventListener("loadedmetadata", clipH); });
  window.addEventListener("load", clipH); window.addEventListener("resize", clipH);
  $("more").onclick = function () {
    var box = $("intro"), open = box.classList.toggle("open");
    box.style.maxHeight = open ? "none" : "";
    if (!open) clipH();
    this.textContent = open ? "閉じる ⌃" : "詳細情報をもっと見る ⌄";
    if (!open) box.scrollIntoView({ block: "start" });
    K.track("intro_toggle", { product: id, open: open });
  };

  // 장소 사진 슬라이드: 오른쪽 > 버튼 + 오른쪽 위 장수 (메인 슬라이드와 같은 방식)
  document.querySelectorAll(".sph").forEach(function (ph) {
    var sl = ph.querySelector(".spsl"), c = ph.querySelector(".spc"), a = ph.querySelector(".spa"); if (!c) return;
    var n = sl.children.length, cur = function () { return Math.round(sl.scrollLeft / sl.clientWidth); };
    var ds = ph.querySelectorAll(".dots i");
    sl.addEventListener("scroll", function () { var i = cur(); c.textContent = (i + 1) + "/" + n; [].forEach.call(ds, function (d, k) { d.classList.toggle("on", k === i); }); }, { passive: true });
    a.onclick = function () { sl.scrollTo({ left: sl.clientWidth * ((cur() + 1) % n), behavior: "smooth" }); };
    [].forEach.call(ds, function (d, k) { d.onclick = function () { sl.scrollTo({ left: sl.clientWidth * k, behavior: "smooth" }); }; }); // 점을 눌러도 이동
    K.dragScroll(sl); // PC에서는 마우스로 끌어서 넘기기
  });

  // 위로 가기 버튼: 스크롤 내렸을 때만
  var tt = $("totop"); window.addEventListener("scroll", function () { tt.classList.toggle("on", window.scrollY > 900); }, { passive: true });
  tt.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); K.track("to_top", { product: id }); };

  // 갤러리 확대
  var li = 0, G = p.gallery;
  if (p.route) $("rmap").onclick = function () { $("lbm").innerHTML = '<img alt="コースマップ" src="assets/img/' + p.route.img + '">'; $("lbC").textContent = ""; $("lb").classList.add("on", "single"); K.track("route_map_open", { product: id }); };
  function lbShow(i) {
    $("lb").classList.remove("single");
    li = (i + G.length) % G.length; var m = media(G[li][0]);
    $("lbm").innerHTML = m.v ? '<video src="' + m.v + '" poster="' + m.p + '" controls autoplay playsinline></video>' : '<img alt="' + G[li][1] + '" src="' + m.i + '">';
    $("lbC").textContent = (li + 1) + " / " + G.length; $("lb").classList.add("on");
  }
  document.querySelectorAll(".gal button").forEach(function (b) { b.onclick = function () { lbShow(+b.getAttribute("data-i")); K.track("gallery_open", { product: id, index: +b.getAttribute("data-i") + 1 }); }; });
  $("lbP").onclick = function (e) { e.stopPropagation(); lbShow(li - 1); };
  $("lbN").onclick = function (e) { e.stopPropagation(); lbShow(li + 1); };
  $("lb").onclick = function (e) { if (e.target === this || e.target.closest(".x")) { this.classList.remove("on", "single"); $("lbm").innerHTML = ""; } };
  var tx = null; $("lb").addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  $("lb").addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) lbShow(li + (dx < 0 ? 1 : -1)); });

  // 집합장소
  $("copyAddr").onclick = function () {
    var t = K.MEETING.ko, ok = function () { K.toast("住所をコピーしました"); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, ok); else ok();
    K.track("copy_address", { product: id });
  };
  ["gmap", "gmap2"].forEach(function (g) { $(g).addEventListener("click", function () { K.track("open_map", { product: id, place: g }); }); });

  // ---------- 예약 선택 (상세·캘린더 시트 공통: 날짜 → 시간·집합장소 → 인원) ----------
  function save() {}
  function openDates() { return Object.keys(dates).filter(function (d) { return dates[d] !== "full" && K.bookable(d); }).sort(); }
  // 시간·인원 영역 html (o = 선택 상태, pre = id 접두어)
  function selHtml(o, pre) {
    var h = "";
    if (o.date) h += '<div class="lbl">時間</div><button class="c' + (o.time ? " sel" : "") + '" id="' + pre + 'time">' + p.time + '</button><div class="meet">📍 集合場所：' + K.MEETING.ja + '</div>';
    if (o.date && o.time) h += '<div class="lbl">人数</div><div class="qrow"><div><div style="font-size:13px">参加費（1名）</div><b>' + K.yen(p.priceKrw, rate()) + '</b><small>' + K.krw(p.priceKrw) + '</small></div>' +
      '<div class="pill"><button id="' + pre + 'minus" aria-label="減らす"' + (o.qty ? "" : " disabled") + '>−</button><output>' + o.qty + '</output><button id="' + pre + 'plus" aria-label="増やす">＋</button></div></div><div class="note">2歳未満のお子さまは人数に含めないでください。</div>';
    return h;
  }
  function selBind(o, pre, done) {
    if (o.date) $(pre + "time").onclick = function () { o.time = !o.time; o.qty = 0; done(); K.track("select_time", { product: id }); };
    if (o.date && o.time) {
      $(pre + "minus").onclick = function () { o.qty = Math.max(0, o.qty - 1); done(); };
      $(pre + "plus").onclick = function () { if (o.qty >= K.MAX_PER_BOOKING) { K.toast("1回のご予約は" + K.MAX_PER_BOOKING + "名までです"); return; } o.qty++; done(); K.track("select_quantity", { product: id, quantity: o.qty }); };
    }
  }
  // 하단 바 가격: 인원 선택 전 = 할인율 + 혼자 갈 때 비용(취소선), 선택 후 = n名選択 + 합계
  function barPrice(o, L, Y, W, btn) {
    var ready = !!(o.date && o.time && o.qty), total = p.priceKrw * (ready ? o.qty : 1);
    $(L).innerHTML = ready ? o.qty + "名選択" : "1名あたり";
    $(Y).textContent = K.yen(total, rate()); $(W).textContent = K.krw(total);
    if (btn !== "reserve") $(btn).disabled = !ready; else $(btn).classList.toggle("need", !ready);
  }
  function render() {
    var sug = openDates().slice(0, 2);
    if (st.date && sug.indexOf(st.date) < 0) sug = [st.date].concat(sug.slice(0, 1));
    $("dateChips").innerHTML = sug.length ? sug.map(function (d) { return '<button class="c' + (st.date === d ? " sel" : "") + '" data-d="' + d + '">' + K.jpShort(d) + '</button>'; }).join("")
      : '<span class="note">現在予約できる日程がありません。LINEでお問い合わせください。</span>';
    $("dateChips").querySelectorAll("[data-d]").forEach(function (b) { b.onclick = function () { st.date = b.getAttribute("data-d"); st.time = false; st.qty = 0; save(); render(); K.track("select_date", { product: id, date: st.date }); }; });
    $("timeBox").innerHTML = selHtml(st, "p_");
    selBind(st, "p_", function () { save(); render(); });
    barPrice(st, "bLabel", "bYen", "bKrw", "reserve");
  }
  function goCheckout(o) {
    st = { date: o.date, time: true, qty: o.qty }; save();
    K.track("begin_checkout", { product: id, date: o.date, quantity: o.qty, value: p.priceKrw * o.qty, currency: "KRW" });
    location.href = "checkout.html?product=" + id + "&date=" + o.date + "&qty=" + o.qty;
  }
  $("reserve").onclick = function () {
    if (!(st.date && st.time && st.qty)) {
      K.toast("日程とオプションを選択してください。");
      window.scrollTo({ top: $("pick").getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
      K.track("reserve_need_select", { product: id }); return;
    }
    goCheckout(st);
  };

  // ---------- 캘린더 바텀 시트 ----------
  var view = null;
  function months() { var m = {}; Object.keys(dates).forEach(function (d) { m[d.slice(0, 7)] = 1; }); return Object.keys(m).sort(); }
  function drawCal() {
    var ms = months(); if (!ms.length) { $("cal").innerHTML = '<p class="note">日程は準備中です。</p>'; return; }
    if (!view || ms.indexOf(view) < 0) view = (sp.date || openDates()[0] || Object.keys(dates).sort()[0]).slice(0, 7);
    var y = +view.slice(0, 4), m = +view.slice(5, 7) - 1, first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();
    $("mTitle").textContent = y + "年" + (m + 1) + "月";
    $("mPrev").disabled = ms.indexOf(view) <= 0; $("mNext").disabled = ms.indexOf(view) >= ms.length - 1;
    var h = "日月火水木金土".split("").map(function (w, i) { return '<div class="w"' + (i === 0 ? ' style="color:#D9534F"' : i === 6 ? ' style="color:#3D7CC9"' : "") + '>' + w + '</div>'; }).join("");
    for (var i = 0; i < first; i++) h += "<div></div>";
    for (var d = 1; d <= last; d++) {
      var s = K.ymd(new Date(y, m, d)), wd = new Date(y, m, d).getDay(), stt = dates[s], ok = stt && K.bookable(s);
      var cls = "d" + (wd === 0 ? " sun" : wd === 6 ? " sat" : "") + (ok && stt === "full" ? " full" : "") + (sp.date === s ? " pick" : "");
      h += '<button class="' + cls + '" data-s="' + s + '"' + (ok ? "" : " disabled") + '><b>' + d + '</b><small>' + (ok && stt === "full" ? "満席" : "") + '</small></button>';
    }
    $("cal").innerHTML = h;
    $("cal").querySelectorAll("[data-s]:not([disabled])").forEach(function (b) { b.onclick = function () { sp = { date: b.getAttribute("data-s"), time: false, qty: 0 }; drawCal(); sheetSel(); K.track("select_date", { product: id, date: sp.date, place: "calendar" }); }; });
  }
  function sheetSel() {
    var full = sp.date && dates[sp.date] === "full";
    $("wait").hidden = !full;
    if (!sp.date) $("sSel").innerHTML = '<div class="pickhint">日程を選択してください</div>';
    else if (full) $("sSel").innerHTML = '<div class="pickhint">' + K.jpLong(sp.date) + 'は満席です</div>';
    else { $("sSel").innerHTML = '<div class="pickd">' + K.jpLong(sp.date) + '</div>' + selHtml(sp, "s_"); selBind(sp, "s_", sheetSel); }
    barPrice(full ? { date: null } : sp, "sLabel", "sYen", "sKrw", "sGo");
  }
  $("calOpen").onclick = function () { sp = { date: null, time: false, qty: 0 }; view = null; drawCal(); sheetSel(); $("sheet").classList.add("on"); K.track("calendar_open", { product: id }); };
  $("sheet").addEventListener("click", function (e) { if (e.target.closest("[data-x]")) $("sheet").classList.remove("on"); });
  $("mPrev").onclick = function () { var ms = months(); view = ms[ms.indexOf(view) - 1]; drawCal(); };
  $("mNext").onclick = function () { var ms = months(); view = ms[ms.indexOf(view) + 1]; drawCal(); };
  $("sGo").onclick = function () { goCheckout(sp); };
  $("wait").onclick = function (e) {
    e.preventDefault(); K.track("waitlist_click", { product: id, date: sp.date });
    if (K.LINE_ADD_URL) location.href = K.LINE_ADD_URL; else K.toast("LINE公式アカウントは準備中です");
  };

  K.getDates(p).then(function (d) {
    dates = d;
    if (st.date && (!dates[st.date] || dates[st.date] === "full" || !K.bookable(st.date))) st = { date: null, time: false, qty: 0 };
    render();
  });
  K.fillYen().then(render);
  K.track("view_item", { product: id, value: p.priceKrw, currency: "KRW" });
})();
