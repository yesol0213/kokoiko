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
  var so = p.solo, pct = Math.round((so.total - p.priceKrw) / so.total * 100);
  var media = function (k) { return k.indexOf("video:") === 0 ? { v: "assets/" + k.slice(6) + ".mp4", p: img(k.slice(6)) } : { i: img(k) }; };
  try { var sv = JSON.parse(sessionStorage.getItem("kk_sel_" + id) || "null"); if (sv) st = sv; } catch (e) {}

  // 선 아이콘 (이모지 대신)
  var SV = function (d, c, w) { return '<svg class="li" viewBox="0 0 24 24" width="' + (w || 16) + '" height="' + (w || 16) + '" fill="none" stroke="' + (c || "#9A92A0") + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    ppl: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.5 0 4 1.5 4.5 4.3"/>',
    clk: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    kid: '<circle cx="8" cy="6.5" r="2.6"/><path d="M3.8 19.5c.4-3.6 2-5.6 4.2-5.6s3.8 2 4.2 5.6"/><circle cx="16.5" cy="10.5" r="1.9"/><path d="M13.6 19.5c.3-2.5 1.4-3.9 2.9-3.9s2.6 1.4 2.9 3.9"/>',
    warn: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    ok: '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.3 2.5 2.5 4.9-5"/>',
    no: '<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
    memo: '<path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M8.5 12h7M8.5 15.5h7"/>',
    bus: '<rect x="4.5" y="3.5" width="15" height="14" rx="3"/><path d="M4.5 11h15M8 17.5v2.5M16 17.5v2.5"/><circle cx="8" cy="14.3" r=".6"/><circle cx="16" cy="14.3" r=".6"/>',
    taxi: '<path d="M3.5 15v-2l2-4.5h13l2 4.5v2a1.3 1.3 0 0 1-1.3 1.3H4.8A1.3 1.3 0 0 1 3.5 15z"/><path d="M9.5 8.5l.7-2.5h3.6l.7 2.5M3.5 13h17"/><circle cx="7.5" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
    train: '<rect x="5.5" y="3" width="13" height="14" rx="4"/><path d="M5.5 10.5h13M8.5 20.5l1.5-3M15.5 20.5l-1.5-3"/><circle cx="9" cy="13.8" r=".6"/><circle cx="15" cy="13.8" r=".6"/>'
  };
  K.icon = function (k, c, w) { return SV(IC[k], c, w); };
  // 가격 비교용 고정 환율 (2026년 11월 우리은행 매매기준율 평균 100円=852.04원)
  var FIXR = 8.5204, fy = function (w) { return "¥" + (Math.round(w / FIXR / 10) * 10).toLocaleString("en-US"); };
  var fullImg = function (k, cls) { var m = media(k); return m.v ? '<div class="fimg ' + (cls || "") + '"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video></div>' : '<img class="fimg ' + (cls || "") + '" src="' + m.i + '" alt="" loading="lazy">'; };
  var lab = function (t) { return t ? '<span class="plab">' + t + '</span>' : ""; };

  // ① 도시 소개 (일본과 비교하며 지역 소개)
  function cityHtml() {
    var h = '<div class="city">' + (it.kicker ? '<p class="ckk">' + it.kicker + '</p>' : "") + '<h2 class="ch">' + it.lead + '</h2><p class="cd">' + it.desc + '</p>' + fullImg(it.img);
    if (it.foodImgs) {
      var f = it.foodImgs;
      h += '<p class="cf">' + it.foodTitle + '<small>' + it.foodSub + '</small></p>' +
        '<div class="fbig"><img src="' + img(f[0][0]) + '" alt="" loading="lazy">' + lab(f[0][1]) + '</div>' +
        '<div class="ftwo">' + f.slice(1).map(function (x) { return '<div><img src="' + img(x[0]) + '" alt="" loading="lazy">' + lab(x[1]) + '</div>'; }).join("") + '</div>' +
        '<p class="cnote">' + it.foodNote + '</p>';
    }
    if (it.cityTitle) h += '<p class="cf">' + it.cityTitle + '<small>' + it.cityDesc + '</small></p>' + fullImg(it.cityImg);
    return h + '</div>';
  }
  // こんな人におすすめ (제목 가운데, 목록은 시작선 맞춰 가운데 배치)
  function recHtml() { return '<div class="rec"><b>こんな人におすすめ</b><div class="recl">' + it.rec.map(function (r) { return '<div><i>✓</i>' + r + '</div>'; }).join("") + '</div></div>'; }
  // 혼자 vs KOKOIKO 가격 비교 (구간별)
  function priceHtml() {
    var legs = p.legs || [["ソウル（蚕室）"], ["bus", "交通費", so.trans], ["memo", "入場料", so.entry], ["ソウル"]];
    var tot = legs.reduce(function (t, l) { return t + (l[2] || 0); }, 0) || so.total;
    var per = Math.round((tot - p.priceKrw) / tot * 100);
    var rows = '<div class="pc-st pre"><span>計画</span></div><div class="pc-a"></div><div class="pc-k"></div>' +
      '<div class="pc-mv">' + K.icon("memo") + '下調べ・予約</div><div class="pc-a"><span class="g">自分で</span></div><div class="pc-k"><i class="ck"></i></div>';
    legs.forEach(function (l, i) {
      if (l.length === 1) rows += '<div class="pc-st"><span>' + l[0] + '</span></div><div class="pc-a"></div><div class="pc-k">' + (i === legs.length - 1 ? '<b class="inc">すべて込み</b>' : "") + '</div>';
      else rows += '<div class="pc-mv">' + K.icon(l[0]) + l[1] + '</div><div class="pc-a"><span>' + fy(l[2]) + '</span><small>' + K.krw(l[2]) + '</small></div><div class="pc-k"><i class="ck"></i></div>';
    });
    return '<div class="pcmp"><h2 class="ph">ひとりで行くより<br><span class="mk">約' + per + '%安く</span>、ラクに。</h2><p class="psub">ソウルの外へ、本当の韓国を感じる旅を</p>' +
      '<div class="pc"><div class="pc-h0"></div><div class="pc-h a">ひとりで</div><div class="pc-h k">KOKOIKO</div>' + rows +
      '<div class="pc-sum"><b>合計</b><small>※2026年11月の為替レートで換算</small></div><div class="pc-a sum"><span><em>約</em>' + fy(tot) + '</span><small>' + K.krw(tot) + '</small></div>' +
      '<div class="pc-k sum"><span class="mk"><em>約</em>' + fy(p.priceKrw) + '</span><small>' + K.krw(p.priceKrw) + '</small></div></div></div>';
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
        s.imgs.map(function (k, j) { return '<div class="spi"><img src="' + img(k) + '" alt="' + s.t + '" loading="lazy">' + (s.labels && s.labels[j] ? '<span class="plab r">' + s.labels[j] + '</span>' : "") + '</div>'; }).join("") +
        '</div><span class="spn">' + s.n + '</span></div></div>';
    }).join("") + '</div>';
  }
  // K-スイーツ / K-カフェ (세 페이지 고정 섹션)
  function sweetsHtml() {
    var w = it.sweets || { title: it.food.kTitle || "K-スイーツ", sub: "昼・夕食は自由時間。ローカルの味を楽しもう。", imgs: it.food.imgs, p: it.food.p };
    return '<div class="food"><h3>' + w.title + '</h3><div class="s">' + w.sub + '</div><div class="fg">' +
      w.imgs.map(function (f) { return '<div style="background-image:url(' + img(f[0]) + ')"><span>' + f[1] + '</span></div>'; }).join("") + '</div><div class="fl">' + w.p + '</div></div>';
  }
  function galHtml() {
    var G = p.gallery, more = G.length - 5;
    return '<div class="sec"><h2>' + (p.galleryTitle || "フォトギャラリー") + '</h2><div class="gal">' + G.slice(0, 5).map(function (g, i) { var m = media(g[0]); return '<button data-i="' + i + '"' + (m.i ? ' style="background-image:url(' + m.i + ')"' : "") + '>' + (m.v ? '<video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay sm"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i>' : "") + '<span>' + g[1] + '</span>' + (i === 4 && more > 0 ? '<i class="gmore">＋' + more + '</i>' : "") + '</button>'; }).join("") + '</div><div class="note crd">' + p.credit + '</div></div>';
  }

  app.innerHTML =
    '<div class="dtop" id="dtop"><a class="ib" href="index.html" id="back" aria-label="戻る">' + BACK + '</a><span class="ttl">' + p.title + '</span><button class="ib" id="shareTop" aria-label="シェア">' + SHARE + '</button></div>' +
    '<div class="dhero" id="dhero"><div class="slides" id="hs">' + p.hero.map(function (k) { var m = media(k); return m.v ? '<div class="hv"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i></div>' : '<div style="background-image:url(' + img(k) + ')"></div>'; }).join("") + '</div><div class="cnt" id="hcnt">1 / ' + p.hero.length + '</div>' +
      '<div class="th" id="hth">' + p.hero.map(function (k, i) { var m = media(k); return '<button' + (i ? "" : ' class="on"') + ' style="background-image:url(' + (i === 0 && p.thumb0 ? img(p.thumb0) : m.p || img(k)) + ')" aria-label="' + (m.v ? "動画" : "写真") + (i + 1) + '">' + (m.v ? '<i class="tplay"></i>' : '') + '</button>'; }).join("") + '</div></div>' +
    '<div class="sec"><div class="chips">' + (p.ichioshi ? '<span class="c-ichi">イチオシ</span>' : '') + '<span class="c-season">' + K.icon(p.season.icon, "currentColor", 14) + p.season.label + '</span><span class="c-like">≒ ' + p.like + '</span></div>' +
      '<h1>' + p.name + '</h1><div class="sub">ソウル発 日帰り ・ ' + p.timeShort + ' ・ 送迎バス付き</div>' +
      '<div class="price"><b data-krw="' + p.priceKrw + '"></b><small>' + K.krw(p.priceKrw) + ' ／ 1名（税込）</small></div>' +
      '<div class="note">円は目安です。お支払いは韓国ウォン（₩）建てです。</div></div>' +
    '<div class="sec" id="pick"><div class="h2row"><h2>いつ参加しますか？</h2><button class="calk" id="calOpen">' + CAL + 'カレンダーで見る ›</button></div>' +
      '<div class="lbl">日付</div><div id="dateChips"></div><div id="timeBox"></div><div id="qtyBox"></div>' +
      '<div class="info"><div class="ir nw">' + K.icon("ppl") + '<span><b>' + K.MIN_PEOPLE + '名様以上で催行確定</b><small>（未満は全額返金）</small></span></div><div class="ir">' + K.icon("clk") + '予約締切：出発' + K.CLOSE_DAYS_BEFORE + '日前</div><div class="ir nw">' + K.icon("kid") + '大人・子ども同料金／2歳未満は無料</div></div></div>' +
    '<div class="sec intro2" id="intro">' + cityHtml() + '<hr class="hl">' + recHtml() + '<hr class="hl">' + priceHtml() + '<hr class="hl">' + routeHtml() + spotsHtml() + sweetsHtml() + '</div>' +
    galHtml() +
    '<div class="sec"><h2 style="margin-bottom:4px">スケジュール</h2><div class="note" style="margin:0 0 12px">当日の交通状況により変わる場合があります。</div><div class="sl">' +
      p.schedule.map(function (s) { return '<div class="si"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join("") + '</div></div>' +
    '<div class="sec"><h2>体験レビュー</h2><div class="rv"><div>インフルエンサー<br>体験写真（準備中）</div><div>インフルエンサー<br>体験写真（準備中）</div></div></div>' +
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
      '<details class="acc"><summary>キャンセル・返金規定</summary><div class="accb">・' + K.cancel.join("<br>・") + '</div></details>' +
      '<details class="acc"><summary>お問い合わせ（LINE・Instagram）</summary><div class="accb">' + K.contactLinks() + '</div></details></div>' +
    '<footer id="footer"></footer><button class="totop" id="totop" aria-label="ページの先頭へ"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A2230" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg></button>' +
    '<div class="bar solid"><div class="bprice"><span id="bLabel"></span><div><b id="bYen"></b><small id="bKrw"></small></div></div><button class="cta w" id="reserve">予約に進む</button></div>' +
    '<div class="sheet" id="sheet"><div class="dim" data-x></div><div class="body"><div class="grab"></div><div class="sh-hd"><b>日付を選ぶ</b><button data-x aria-label="閉じる">✕</button></div>' +
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
  function save() { try { sessionStorage.setItem("kk_sel_" + id, JSON.stringify(st)); } catch (e) {} }
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
