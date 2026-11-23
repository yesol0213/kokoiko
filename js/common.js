// 공통: GA4 이벤트, 체류 시간, 환율, 공유, 판매일(구글 시트), 푸터·약관
(function () {
  var K = window.KOKOIKO;

  // ---------- GA4 ----------
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  if (K.GA4_ID) {
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + K.GA4_ID;
    document.head.appendChild(s); gtag("js", new Date()); gtag("config", K.GA4_ID);
  }
  K.track = function (name, params) {
    params = params || {}; gtag("event", name, params);
    if (window.console) console.log("[GA4 event]", name, params);
  };
  var start = Date.now(), sent = false;
  function sendDwell() { if (sent) return; sent = true; K.track("page_dwell", { page: location.pathname, seconds: Math.round((Date.now() - start) / 1000) }); }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") sendDwell(); });
  window.addEventListener("pagehide", sendDwell);

  // ---------- 선 아이콘 (이모지 대신, 메인·상세 공통) ----------
  var SV = function (d, c, w) { return '<svg class="li" viewBox="0 0 24 24" width="' + (w || 16) + '" height="' + (w || 16) + '" fill="none" stroke="' + (c || "#9A929E") + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var IC = {
    ppl: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.5 0 4 1.5 4.5 4.3"/>',
    clk: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    kid: '<circle cx="8" cy="6.5" r="2.6"/><path d="M3.8 19.5c.4-3.6 2-5.6 4.2-5.6s3.8 2 4.2 5.6"/><circle cx="16.5" cy="10.5" r="1.9"/><path d="M13.6 19.5c.3-2.5 1.4-3.9 2.9-3.9s2.6 1.4 2.9 3.9"/>',
    warn: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    ok: '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.3 2.5 2.5 4.9-5"/>',
    no: '<circle cx="12" cy="12" r="8.5"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    star: '<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8-5.3-2.9-5.3 2.9 1.1-5.8L3.5 9.6l5.9-.8z" fill="currentColor" stroke="none"/>',
    snow: '<path d="M12 2.8v18.4M9.4 5.2 12 7.8l2.6-2.6M9.4 18.8l2.6-2.6 2.6 2.6"/><g transform="rotate(60 12 12)"><path d="M12 2.8v18.4M9.4 5.2 12 7.8l2.6-2.6M9.4 18.8l2.6-2.6 2.6 2.6"/></g><g transform="rotate(120 12 12)"><path d="M12 2.8v18.4M9.4 5.2 12 7.8l2.6-2.6M9.4 18.8l2.6-2.6 2.6 2.6"/></g>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
    flower: '<path d=\"M10.00 9.25A2.9 2.9 0 1 1 14.00 9.25A2.9 2.9 0 1 1 15.23 13.05A2.9 2.9 0 1 1 12.00 15.40A2.9 2.9 0 1 1 8.77 13.05A2.9 2.9 0 1 1 10.00 9.25Z\" stroke-width=\"1.3\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\" stroke-width=\"1.3\"/>',
    memo: '<path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M8.5 12h7M8.5 15.5h7"/>',
    bus: '<rect x="4.5" y="3.5" width="15" height="14" rx="3"/><path d="M4.5 11h15M8 17.5v2.5M16 17.5v2.5"/><circle cx="8" cy="14.3" r=".6"/><circle cx="16" cy="14.3" r=".6"/>',
    taxi: '<path d="M3.5 15v-2l2-4.5h13l2 4.5v2a1.3 1.3 0 0 1-1.3 1.3H4.8A1.3 1.3 0 0 1 3.5 15z"/><path d="M9.5 8.5l.7-2.5h3.6l.7 2.5M3.5 13h17"/><circle cx="7.5" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
    train: '<rect x="5.5" y="3" width="13" height="14" rx="4"/><path d="M5.5 10.5h13M8.5 20.5l1.5-3M15.5 20.5l-1.5-3"/><circle cx="9" cy="13.8" r=".6"/><circle cx="15" cy="13.8" r=".6"/>'
  };
  K.icon = function (k, c, w) { return SV(IC[k], c, w); };
  // HTML에 <i data-ic="이름"> 으로 적은 자리를 아이콘으로 바꿈 (메인 페이지용)
  document.querySelectorAll("[data-ic]").forEach(function (el) { el.outerHTML = K.icon(el.getAttribute("data-ic"), el.getAttribute("data-ic-c"), el.getAttribute("data-ic-w")); });

  // ---------- 환율 ----------
  K.getRate = function () {
    try { var c = JSON.parse(sessionStorage.getItem("kk_rate") || "null"); if (c && c.date === new Date().toDateString()) return Promise.resolve(c); } catch (e) {}
    return fetch("https://open.er-api.com/v6/latest/KRW").then(function (r) { return r.json(); }).then(function (d) {
      var rate = d && d.rates && d.rates.JPY; if (!rate) throw 0;
      var c = { rate: rate, date: new Date().toDateString(), live: true };
      try { sessionStorage.setItem("kk_rate", JSON.stringify(c)); } catch (e) {}
      return c;
    }).catch(function () { return { rate: K.FALLBACK_JPY_PER_KRW, live: false }; });
  };
  K.yen = function (krw, rate) { return "約¥" + (Math.round(krw * rate / 100) * 100).toLocaleString("ja-JP"); };
  K.krw = function (krw) { return "₩" + krw.toLocaleString("ko-KR"); };
  K.fillYen = function () {
    return K.getRate().then(function (c) {
      K.rate = c.rate;
      document.querySelectorAll("[data-krw]").forEach(function (el) { el.textContent = K.yen(Number(el.getAttribute("data-krw")), c.rate); });
      document.querySelectorAll("[data-krw10]").forEach(function (el) { el.textContent = "¥" + (Math.round(Number(el.getAttribute("data-krw10")) * c.rate / 10) * 10).toLocaleString("ja-JP"); });
      return c;
    });
  };
  K.img = function (k) { return "assets/img/" + k + ".jpg"; };

  // ---------- 날짜 ----------
  var WD = "日月火水木金土";
  K.ymd = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  K.parse = function (s) { var a = s.split("-"); return new Date(+a[0], a[1] - 1, +a[2]); };
  K.jpShort = function (s) { var d = K.parse(s); return (d.getMonth() + 1) + "/" + d.getDate() + "(" + WD[d.getDay()] + ")"; };
  K.jpLong = function (s) { var d = K.parse(s); return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日(" + WD[d.getDay()] + ")"; };

  // 판매일: 구글 시트 CSV(product,date,status) → 실패 시 fallback(시즌 토요일 + 예시 매진 1일)
  K.getDates = function (p) {
    function fallback() {
      var out = {}, today = new Date(); today.setHours(0, 0, 0, 0);
      if (p.gwDates) { p.gwDates.forEach(function (d) { out[d] = "open"; }); }
      else {
        for (var i = 0; i < 200; i++) {
          var d = new Date(today); d.setDate(d.getDate() + i);
          if (p.sellDays.indexOf(d.getDay()) > -1 && p.season.months.indexOf(d.getMonth() + 1) > -1) out[K.ymd(d)] = "open";
        }
      }
      var keys = Object.keys(out).sort(); if (keys[2]) out[keys[2]] = "full"; // 예시: 3번째 날짜 매진
      return out;
    }
    if (!K.SHEET_CSV_URL) return Promise.resolve(fallback());
    return fetch(K.SHEET_CSV_URL).then(function (r) { return r.text(); }).then(function (t) {
      var out = {};
      t.trim().split(/\r?\n/).slice(1).forEach(function (line) {
        var c = line.split(","); if (c[0] === p.id && c[1]) out[c[1].trim()] = (c[2] || "open").trim();
      });
      return Object.keys(out).length ? out : fallback();
    }).catch(fallback);
  };
  K.bookable = function (s) { var lim = new Date(); lim.setHours(0, 0, 0, 0); lim.setDate(lim.getDate() + K.CLOSE_DAYS_BEFORE); return K.parse(s) >= lim; };

  // ---------- 공유 ----------
  K.toast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 2200);
  };
  K.share = function (o) {
    var url = new URL(o.url || location.href, location.href);
    url.searchParams.set("utm_source", "share"); url.searchParams.set("utm_medium", o.medium || "web");
    K.track("share", { method: navigator.share ? "web_share" : "copy", content: o.content || location.pathname });
    var data = { title: o.title || document.title, text: o.text || "", url: url.toString() };
    if (navigator.share) return navigator.share(data).catch(function () {});
    var done = function () { K.toast("リンクをコピーしました"); };
    if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(done, done); else done();
  };

  // ---------- 푸터·약관 ----------
  // 빈 값은 회색 괄호 안 항목 이름 (확정되면 값으로 교체)
  var TBD = function (t) { return '<span class="tbd">(' + t + ')</span>'; };
  var LEGAL = {
    legal: '<h3>特定商取引法に基づく表記</h3><dl><dt>販売業者</dt><dd>코코이코</dd><dt>運営責任者</dt><dd>SUN IL/ROH</dd><dt>事業者登録番号</dt><dd>' + TBD("사업자등록번호") + '</dd><dt>通信販売業申告番号</dt><dd>' + TBD("통신판매업 신고번호") + '</dd><dt>旅行業登録番号</dt><dd>' + TBD("여행업 등록번호") + '</dd><dt>所在地</dt><dd>' + TBD("주소") + '</dd><dt>電話番号</dt><dd>' + TBD("유선 전화번호") + '</dd><dt>メール</dt><dd>' + (K.CONTACT_EMAIL || TBD("문의 이메일")) + '</dd><dt>販売価格</dt><dd>各商品ページに記載（韓国ウォン・税込・1名あたり）</dd><dt>支払方法・時期</dt><dd>クレジットカード／ご予約時</dd><dt>提供時期</dt><dd>ご予約のツアー当日</dd><dt>キャンセル</dt><dd>出発3日前まで全額返金。それ以降は返金不可（天災等を除く）</dd></dl>',
    terms: '<h3>利用規約</h3><p>本サービスは、韓国の日帰りツアーの予約受付を行います。ツアーは10名以上のお申し込みで催行が確定します。集合時間に遅れた場合、ご参加いただけないことがあります。</p><p>' + TBD("이용약관 전문") + '</p>',
    privacy: '<h3>プライバシーポリシー</h3><p>ご予約時にいただく情報（お名前・メールアドレス・電話番号・LINE ID）は、ツアーのご案内・催行連絡・お問い合わせ対応のみに使用し、第三者に提供しません。決済情報は決済代行会社（トスペイメンツ）が管理し、当社は保存しません。</p><dl><dt>保管期間</dt><dd>' + TBD("개인정보 보관 기간") + '</dd><dt>責任者</dt><dd>' + TBD("개인정보 보호책임자") + '</dd></dl><p>' + TBD("개인정보처리방침 전문") + '</p>',
    cancel: '<h3>キャンセル・返金規定</h3><ul><li>' + K.cancel.join("</li><li>") + '</li></ul><p>例外：' + TBD("천재지변 등 예외 기준") + '</p><p>キャンセルはLINEで注文番号をお知らせください。</p>',
    // PG 심사용 사업자정보 (국문, 결제 페이지에서 엶)
    biz: '<h3>사업자정보</h3><dl><dt>상호</dt><dd>코코이코</dd><dt>대표자</dt><dd>SUN IL/ROH</dd><dt>사업자등록번호</dt><dd>' + TBD("사업자등록번호") + '</dd><dt>통신판매업 신고번호</dt><dd>' + TBD("통신판매업 신고번호") + '</dd><dt>사업장 주소</dt><dd>' + TBD("주소") + '</dd><dt>유선번호</dt><dd>' + TBD("유선 전화번호") + '</dd><dt>이메일</dt><dd>' + (K.CONTACT_EMAIL || TBD("문의 이메일")) + '</dd></dl>'
  };
  K.openLegal = function (k) {
    var m = document.getElementById("modal");
    if (!m) { m = document.createElement("div"); m.id = "modal"; m.className = "modal"; document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-close]")) m.hidden = true; }); }
    m.innerHTML = '<div class="modal-box"' + (k === "biz" ? ' lang="ko"' : '') + '>' + LEGAL[k] + '<button type="button" class="btn-sub" data-close>' + (k === "biz" ? "닫기" : "閉じる") + '</button></div>';
    m.hidden = false;
  };
  // 문의 링크: 계정이 아직 없으면 눌렀을 때 '준비 중' 안내
  K.contactLinks = function () {
    var ln = function (url, label, ch) { return '<a class="cl" href="' + (url || "#") + '"' + (url ? ' target="_blank" rel="noopener"' : ' data-soon="' + label + '"') + ' data-ch="' + ch + '">' + label + '</a>'; };
    return ln(K.LINE_ADD_URL, "LINE", "line") + '<span class="sep">|</span>' + ln(K.INSTAGRAM_URL, "Instagram DM", "instagram");
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-ch]"); if (!a) return;
    K.track("contact_click", { channel: a.getAttribute("data-ch") });
    if (a.hasAttribute("data-soon")) { e.preventDefault(); K.toast("お問い合わせ窓口は準備中です"); }
  });

  // 마우스로도 가로 사진 슬라이드 끌어서 넘기기 (PC)
  K.dragScroll = function (el) {
    var down = false, x0 = 0, s0 = 0, moved = false;
    el.addEventListener("mousedown", function (e) { down = true; moved = false; x0 = e.pageX; s0 = el.scrollLeft; el.style.scrollSnapType = "none"; e.preventDefault(); });
    window.addEventListener("mousemove", function (e) { if (!down) return; var dx = e.pageX - x0; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = s0 - dx; });
    window.addEventListener("mouseup", function (e) {
      if (!down) return; down = false; var w = el.clientWidth, dx = e.pageX - x0, i = Math.round(s0 / w) + (dx < -40 ? 1 : dx > 40 ? -1 : 0);
      el.style.scrollSnapType = ""; el.scrollTo({ left: Math.max(0, i) * w, behavior: "smooth" });
    });
    el.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  };

  // 스크롤 시 섹션 페이드업 (캘린더 시트 제외)
  K.fadeUp = function (sel) {
    var els = document.querySelectorAll(sel);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) return; el.classList.add("fu"); io.observe(el); });
  };
  document.addEventListener("DOMContentLoaded", function () {
    var f = document.getElementById("footer");
    if (f) f.innerHTML = '<div class="footer-links"><button data-legal="terms">利用規約</button><button data-legal="privacy">プライバシーポリシー</button><button data-legal="legal">特定商取引法に基づく表記</button><button data-legal="cancel">キャンセル規定</button></div>' +
      (document.body.hasAttribute("data-product") ? '' : '<p><span class="ctc">お問い合わせ</span>' + K.contactLinks() + '</p>') + '<p>© KOKOIKO ここいこ</p>'; // 상세 페이지는 FAQ에 문의가 있어 푸터 문의 생략
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-legal]"); if (b) K.openLegal(b.getAttribute("data-legal")); });
    K.fillYen();
    K.fadeUp(".psec,.big,.sm,.src,#app>.sec,.res>*,.rbox,.steps,.shbox,footer");
  });
})();
