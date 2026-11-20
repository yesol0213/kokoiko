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

  function ihero() {
    var m = media(it.img);
    return m.v ? '<div class="ihero hv"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video></div>' : '<div class="ihero" style="background-image:url(' + m.i + ')"></div>';
  }
  function cmpHtml() {
    return '<div class="icmp"><h3>自分で行く場合と比べると？</h3>' +
      '<div class="cmph"><div class="s">ひとりで行くより</div><div class="b"><span class="hl" data-krw="' + (so.total - p.priceKrw) + '"></span> おトク！</div><div class="k">' + K.krw(so.total - p.priceKrw) + '<span class="offb">' + pct + '%OFF</span></div></div>' +
      '<table class="cmpt"><tr><th></th><th>自分で行く</th><th class="t">このツアー</th></tr>' +
      '<tr><td>交通費</td><td>' + K.krw(so.trans) + '</td><td class="t">込み</td></tr>' +
      '<tr><td>入場料</td><td>' + K.krw(so.entry) + '</td><td class="t">込み</td></tr>' +
      '<tr><td>バスだと</td><td>' + so.bus + '</td><td class="t">往復バス<br>乗り換え0回</td></tr>' +
      '<tr class="sum"><td>合計</td><td>' + K.krw(so.total) + '<small data-krw="' + so.total + '"></small></td><td class="t">' + K.krw(p.priceKrw) + '<small data-krw="' + p.priceKrw + '"></small></td></tr></table>' +
      '<div class="note">※高速バス・現地タクシー（1人利用）の目安。2026年11月時点・本日のレートで円換算。</div></div>';
  }
  function routeHtml() {
    return p.route ? '<div class="iroute"><h3>コースマップ</h3><button class="rmap" id="rmap" style="aspect-ratio:' + p.route.ratio + ';background-image:url(assets/img/' + p.route.img + ')" aria-label="コースマップを拡大"></button></div>' : '';
  }

  app.innerHTML =
    '<div class="dtop" id="dtop"><a class="ib" href="index.html" id="back" aria-label="戻る">' + BACK + '</a><span class="ttl">' + p.title + '</span><button class="ib" id="shareTop" aria-label="シェア">' + SHARE + '</button></div>' +
    '<div class="dhero" id="dhero"><div class="slides" id="hs">' + p.hero.map(function (k) { var m = media(k); return m.v ? '<div class="hv"><video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i></div>' : '<div style="background-image:url(' + img(k) + ')"></div>'; }).join("") + '</div><div class="cnt" id="hcnt">1 / ' + p.hero.length + '</div>' +
      '<div class="th" id="hth">' + p.hero.map(function (k, i) { var m = media(k); return '<button' + (i ? "" : ' class="on"') + ' style="background-image:url(' + (i === 0 && p.thumb0 ? img(p.thumb0) : m.p || img(k)) + ')" aria-label="' + (m.v ? "動画" : "写真") + (i + 1) + '">' + (m.v ? '<i class="tplay"></i>' : '') + '</button>'; }).join("") + '</div></div>' +
    '<div class="sec"><div class="chips">' + (p.ichioshi ? '<span class="c-ichi">イチオシ</span>' : '') + '<span class="c-season">' + p.season.label + '</span><span class="c-like">≒ ' + p.like + '</span></div>' +
      '<h1>' + p.name + '</h1><div class="sub">ソウル発 日帰り ・ ' + p.timeShort + ' ・ 送迎バス付き</div>' +
      '<div class="price"><b data-krw="' + p.priceKrw + '"></b><small>' + K.krw(p.priceKrw) + ' ／ 1名（税込）</small></div>' +
      '<div class="note">大人・子ども同料金 ／ 2歳未満は無料<br>円は本日のレートによる目安です。お支払いは韓国ウォンで行われ、実際の請求額はカード会社のレートにより異なる場合があります。</div></div>' +
    '<div class="sec" id="pick"><div class="h2row"><h2>いつ参加しますか？</h2><button class="calk" id="calOpen">' + CAL + 'カレンダーで見る ›</button></div>' +
      '<div class="lbl">日付</div><div id="dateChips"></div><div id="timeBox"></div><div id="qtyBox"></div>' +
      '<div class="info">👥 <b>' + K.MIN_PEOPLE + '名で出発確定</b>（集まらない場合は全額返金）<br>⏰ 予約締切：出発' + K.CLOSE_DAYS_BEFORE + '日前</div></div>' +
    '<div class="sec"><div class="intro" id="intro">' +
      '<div class="lead">' + it.lead + '</div><div class="desc">' + it.desc + '</div>' + ihero() + cmpHtml() + routeHtml() +
      it.blocks.map(function (b, i) { return '<div class="blk"><div class="bi" style="background-image:url(' + img(b.img) + ')"><span class="no">' + (i + 1) + '</span></div><div class="bt"><b>' + b.t + '</b><span class="cmp">' + b.c + '</span></div><p>' + b.p + '</p></div>'; }).join("") +
      '<div class="food"><h3>🍽 名物グルメも楽しみ</h3><div class="s">昼・夕食は自由時間。ローカルの味を食べ歩き！</div><div class="fg">' +
        it.food.imgs.map(function (f) { return '<div style="background-image:url(' + img(f[0]) + ')"><span>' + f[1] + '</span></div>'; }).join("") + '</div><div class="fl">' + it.food.p + '</div></div>' +
      '<div class="rec"><b>こんな人におすすめ</b>' + it.rec.map(function (r) { return '<div><i>✓</i>' + r + '</div>'; }).join("") + '</div>' +
      '<div class="fade"></div></div><button class="more" id="more">詳細情報をもっと見る ⌄</button></div>' +
    '<div class="sec"><h2>フォトギャラリー</h2><div class="gal">' + p.gallery.map(function (g, i) { var m = media(g[0]); return '<button data-i="' + i + '"' + (m.i ? ' style="background-image:url(' + m.i + ')"' : "") + '>' + (m.v ? '<video src="' + m.v + '" poster="' + m.p + '" autoplay muted loop playsinline preload="metadata"></video><i class="vplay sm"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></i>' : "") + '<span>' + g[1] + '</span></button>'; }).join("") + '</div><div class="note" style="margin-top:8px">' + p.credit + '</div></div>' +
    '<div class="sec"><h2 style="margin-bottom:4px">スケジュール</h2><div class="note" style="margin:0 0 12px">当日の交通状況により変わる場合があります。</div><div class="sl">' +
      p.schedule.map(function (s) { return '<div class="si"><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join("") + '</div></div>' +
    '<div class="sec"><h2>体験レビュー</h2><div class="rv"><div>インフルエンサー<br>体験写真（準備中）</div><div>インフルエンサー<br>体験写真（準備中）</div></div></div>' +
    '<div class="sec warnsec"><div class="warn"><div class="wt">⚠ ご予約前に必ずご確認ください</div>' + K.warn.map(function (w, i) { return '<div class="wc"><b>' + (i + 1) + '. ' + w[0] + '</b><p>' + w[1] + '</p></div>'; }).join("") + '</div></div>' +
    '<div class="sec"><h2 style="margin-bottom:4px">集合場所</h2><div class="note" style="margin:0 0 12px">出発の10分前までにお集まりください。</div>' +
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="kkwarm" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.7843 0.7843 0.7843 0.7843 0.7843 0.7843 0.7843 0.7843 0.7843 0.7843 0.8021 0.82 0.8378 0.8556 0.8734 0.8913 0.9091 0.9269 0.9447 0.9626 0.9804"/><feFuncG type="table" tableValues="0.7569 0.7569 0.7569 0.7569 0.7569 0.7569 0.7569 0.7569 0.7569 0.7569 0.7765 0.7961 0.8157 0.8353 0.8549 0.8745 0.8941 0.9137 0.9333 0.9529 0.9725"/><feFuncB type="table" tableValues="0.7333 0.7333 0.7333 0.7333 0.7333 0.7333 0.7333 0.7333 0.7333 0.7333 0.7544 0.7754 0.7964 0.8175 0.8385 0.8595 0.8806 0.9016 0.9226 0.9437 0.9647"/></feComponentTransfer></filter></svg><div class="mpc"><div class="mpm"><iframe loading="lazy" tabindex="-1" aria-hidden="true" title="集合場所の地図" src="https://maps.google.com/maps?q=%EC%9E%A0%EC%8B%A4%EC%97%AD&z=15&hl=ja&output=embed"></iframe>' +
        '<a class="mlink" href="' + K.MEETING.map + '" target="_blank" rel="noopener" id="gmap" aria-label="Googleマップで開く"></a><i class="mpin">' + PIN + '</i>' +
        '<span class="gbadge"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></span><span class="mexp">' + EXP + '</span></div>' +
        '<a class="mrow" href="' + K.MEETING.map + '" target="_blank" rel="noopener" id="gmap2"><b>' + K.MEETING.ja + '</b><i>›</i></a>' +
        '<div class="mad"><span>' + K.MEETING.ko + '</span><button class="cpy" id="copyAddr">コピー</button></div></div>' +
      '<div class="note" style="margin-top:8px">※ タクシーでは韓国語住所を運転手に見せてください。</div></div>' +
    '<div class="sec" style="border-bottom:none">' +
      '<details class="acc" open><summary>含まれるもの／含まれないもの</summary><div class="accb">✅ ' + K.includes + '<br>❌ ' + K.excludes + '</div></details>' +
      '<details class="acc"><summary>注意事項</summary><div class="accb">・' + K.notes.join("<br>・") + '</div></details>' +
      '<details class="acc"><summary>キャンセル・返金規定</summary><div class="accb">・' + K.cancel.join("<br>・") + '</div></details>' +
      '<details class="acc"><summary>お問い合わせ（LINE・Instagram・メール）</summary><div class="accb">' + K.contactLinks() + '</div></details></div>' +
    '<footer id="footer"></footer>' +
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

  // 상품 소개 펼치기
  $("more").onclick = function () {
    var open = $("intro").classList.toggle("open");
    this.textContent = open ? "閉じる ⌃" : "詳細情報をもっと見る ⌄";
    if (!open) $("intro").scrollIntoView({ block: "start" });
    K.track("intro_toggle", { product: id, open: open });
  };

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
    $(L).innerHTML = ready ? o.qty + "名選択" : '<em>' + pct + '%</em><s>' + K.yen(so.total, rate()).replace("約", "") + '</s>';
    $(Y).textContent = K.yen(total, rate()); $(W).textContent = K.krw(total);
    if (btn !== "reserve") $(btn).disabled = !ready;
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
