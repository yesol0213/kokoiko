// 결제 페이지 (토스페이먼츠 SDK v2 결제위젯). 날짜·인원은 상세에서 받아오고, 금액·orderId는 서버가 정함
// 키: 결제위젯 연동 키(gck/gsk). 카드만 노출은 계약 후 상점관리자 위젯 설정에서 (PRD 오픈 이슈)
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var p = K.products[q.get("product")] || K.products["jeonju-damyang"], id = p.id;
  var date = q.get("date"), qty = Math.min(K.MAX_PER_BOOKING, Math.max(1, parseInt(q.get("qty") || "1", 10) || 1));
  var widgets = null, pmW = null, pmOk = false, pmSel = "", tossAgree = true, FIELDS = ["name", "email", "line"];
  // 결제 시작 실패 토스트 — api/order.js 의 코드에 맞춘다. 여기 없는 코드(INVALID_PRODUCT·NO_SECRET_KEY·
  // 네트워크 끊김 등)는 공통 문구로 간다. (임시 문구 — 네이티브 검수 전)
  var ERR_MSG = {
    INVALID_DATE: "申込締切を過ぎています",   // 신청 마감이 지났습니다
    INVALID_QTY: "人数をご確認ください"       // 인원을 확인해 주세요
  };
  if (!date) { location.replace(p.page); return; }

  // 뒤로가기(헤더 ‹)·「日程・人数を変更する」 모두 상세 페이지로 돌아갈 때 선택했던 날짜·인원을 유지(상세 페이지가 ?date=&qty=를 읽어 그대로 복원함)
  $("backLink").href = p.page + "?date=" + date + "&qty=" + qty;
  $("sImg").style.backgroundImage = "url(" + K.img(p.hero[0]) + ")";
  $("sName").innerHTML = p.name; // 상품명에 지명 읽는 법 <span class="pn">이 들어 있어 HTML로 넣는다(N23)
  // 라벨은 마크업의 <span>이 맡는다. 결제완료 페이지와 같은 양식(N13·N17)
  $("sDate").textContent = K.jpLong(date) + " " + p.timeShort;
  $("sQty").textContent = qty + "名";
  $("sMeet").textContent = K.MEETING.ja;
  $("addrCopy").onclick = function () {
    var t = K.MEETING.ko, ok = function () { K.toast("住所をコピーしました"); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, ok); else ok();
    K.track("copy_address", { product: id });
  };
  var total = p.priceKrw * qty; // 표시용. 실제 금액은 /api/order 가 정함
  $("unit").textContent = K.krw(p.priceKrw) + " × " + qty + "名";
  $("total").textContent = K.krw(total);
  $("totalYen").textContent = K.yen(total, K.FALLBACK_JPY_PER_KRW);
  K.getRate().then(function (c) { $("totalYen").textContent = K.yen(total, c.rate); });

  // 실패 후 돌아왔을 때 입력값 복원
  try { var saved = JSON.parse(sessionStorage.getItem("kk_form") || "null"); if (saved) FIELDS.forEach(function (f) { if (saved[f]) $(f).value = saved[f]; }); } catch (e) {}
  function keep() { var v = {}; FIELDS.forEach(function (f) { v[f] = $(f).value; }); try { sessionStorage.setItem("kk_form", JSON.stringify(v)); } catch (e) {} }

  // 토스 결제창에서 ‹ 뒤로 돌아오면 브라우저가 bfcache(뒤로가기 캐시)에서 페이지를 통째로 되살린다.
  // 이때 스크립트가 다시 돌지 않아 토스 위젯이 멈춘 상태로 복원되고, 결제수단을 다시 고를 수 없다.
  // 그래서 캐시 복원이면 페이지를 새로 읽는다. 입력값은 sessionStorage(kk_form), 참가일·인원은 URL 에
  // 있으므로 새로 읽어도 그대로 남는다. (1127-7)
  window.addEventListener("pageshow", function (e) { if (e.persisted) location.reload(); });
  FIELDS.forEach(function (f) { $(f).addEventListener("input", keep); });

  // /api/config → SDK 초기화 → 금액 설정 → 결제수단·약관 위젯 렌더 (클라이언트 키만 받음)
  fetch("/api/config").then(function (r) { return r.json(); }).then(function (cfg) {
    if (!cfg.clientKey) throw new Error(cfg.message || "config error");
    widgets = TossPayments(cfg.clientKey).widgets({ customerKey: TossPayments.ANONYMOUS });
    return widgets.setAmount({ currency: "KRW", value: total }).then(function () {
      return Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" })
      ]);
    }).then(function (w) {
      var pm = w[0], ag = w[1]; pmW = pm;
      try { if (pm && pm.getSelectedPaymentMethod) Promise.resolve(pm.getSelectedPaymentMethod()).then(function (m) { pmOk = !!m; pmSel = (m && (m.code || m.type)) || pmSel; }, function () {}); } catch (e2) {}
      if (pm && pm.on) pm.on("paymentMethodSelect", function (m) { pmOk = !!m; pmSel = (m && (m.code || m.type)) || ""; if (pmOk) $("payment-method").classList.remove("need"); K.track("select_payment_method", { method: m && (m.code || m.type) }); });
      if (ag && ag.on) ag.on("agreementStatusChange", function (s) { tossAgree = !!(s && s.agreedRequiredTerms); });
      updBtn();
    });
  }).catch(function (e) { widgets = null; updBtn(); console.error(e); });

  // 입력 검사: 칸을 벗어날 때 인라인 에러. 빠진 칸이 있으면 버튼은 비활성 모양, 누르면 첫 빠진 칸으로 이동
  var RULES = {
    // 임시 문구(W10): 이름은 姓・名 2단어 이상, 반각 영문(ローマ字)만. 예) HANAKO YAMADA
    name: [function (v) { return /^[A-Za-z]+(?:[ .'\-]+[A-Za-z]+)+$/.test(v.trim().replace(/\s+/g, " ")); }, "姓と名をローマ字（半角）で入力してください"],
    email: [function (v) { return /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(v.trim()); }, "メールアドレスの形式を確認してください"],
    line: [function (v) { return /^[a-z0-9._-]{4,20}$/.test(v.trim()); }, "LINE IDを確認してください（半角英数字・. - _ 4〜20文字）"]
  };
  var touched = {};
  function okField(f) { return RULES[f][0]($(f).value); }
  function showErr(f) {
    var bad = touched[f] && !okField(f), el = $(f), field = el.closest(".field"), box = field.querySelector(".ferr");
    el.classList.toggle("bad", bad); el.setAttribute("aria-invalid", bad ? "true" : "false");
    if (bad && !box) { box = document.createElement("div"); box.className = "ferr"; el.closest(".inwrap").insertAdjacentElement("afterend", box); }
    if (box) { box.textContent = bad ? RULES[f][1] : ""; box.hidden = !bad; }
    // 체크마크는 필수 항목에서만(전화번호는 任意라 굳이 로즈로 안 바뀌어도 됨)
    field.classList.toggle("good", !!el.value.trim() && okField(f));
  }
  function allOk() { return FIELDS.every(okField); }
  function updBtn() {
    var ok = allOk(); $("payBtn").setAttribute("aria-disabled", ok && widgets ? "false" : "true");
    var a = $("agreet"); a.textContent = ok ? "上記の内容を確認し、お支払いに同意します。" : "必須項目を入力してください。"; a.classList.toggle("miss", !ok);
  }
  FIELDS.forEach(function (f) {
    $(f).addEventListener("blur", function () { if ($(f).value) touched[f] = true; showErr(f); });
    $(f).addEventListener("input", function () { if (touched[f]) showErr(f); updBtn(); });
  });
  FIELDS.forEach(function (f) { if ($(f).value) { touched[f] = true; showErr(f); } });
  updBtn();

  var busy = false;
  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    if (!allOk()) {
      FIELDS.forEach(function (f) { touched[f] = true; showErr(f); });
      var first = FIELDS.filter(function (f) { return !okField(f); })[0];
      window.scrollTo({ top: $(first).getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      setTimeout(function () { $(first).focus({ preventScroll: true }); }, 350);
      return;
    }
    if (!widgets) return;
    // 토스 위젯에서 결제수단을 골랐는지 확인 → 안 골랐으면 안내 후 위젯으로 이동
    var v = { name: $("name").value.trim(), email: $("email").value.trim() };
    var chk = pmW && pmW.getSelectedPaymentMethod ? Promise.resolve().then(function () { return pmW.getSelectedPaymentMethod(); }).catch(function () { return null; }) : Promise.resolve(true);
    chk.then(function (m) {
      if (!m && !pmOk) {
        var box = $("payment-method"); box.classList.add("need");
        window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
        K.toast("お支払い方法を選択してください"); return;
      }
      if (!tossAgree) { K.toast("決済サービスの規約に同意してください"); $("agreement").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      pay(v);
    });
  });

  function pay(v) {
    busy = true; $("payBtn").setAttribute("aria-disabled", "true"); keep();
    fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, qty: qty, date: date }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function (order) {
        try { sessionStorage.setItem("kk_booking", JSON.stringify({ product: id, qty: qty, date: date, email: v.email })); } catch (e2) {}
        K.track("add_payment_info", { product: id, value: order.amount, currency: "KRW", quantity: qty });
        // 전화번호는 토스에 넘기지 않음 (일본 번호 형식 오류 방지)
        return widgets.setAmount({ currency: "KRW", value: order.amount }).then(function () {
          return widgets.requestPayment({
            orderId: order.orderId, orderName: order.orderName,
            successUrl: location.origin + "/success.html",
            failUrl: location.origin + "/fail.html?product=" + id + "&date=" + date + "&qty=" + qty + (pmSel ? "&pm=" + encodeURIComponent(pmSel) : ""),
            customerEmail: v.email, customerName: v.name
          });
        });
      })
      .catch(function (err) {
        busy = false; updBtn();
        var code = (err && err.code) || "";
        console.error("[payment]", code, err);  // 카드사 미선택 오류 코드 확인용 — 실기기에서 이 줄을 본다
        if (code === "USER_CANCEL") return;
        // 토스가 돌려주는 message 는 한국어라 화면에 그대로 쓰지 않는다. 우리 일본어 문구로 바꾼다.
        // 카드사 미선택은 코드가 아직 미확인이라 한국어 메시지로도 가려낸다(코드가 확인되면 정규식을 지운다).
        var cardDetail = code === "NEED_CARD_PAYMENT_DETAIL" || /카드 결제 정보|카드사/.test(String((err && err.message) || ""));
        if (cardDetail) {
          // 테두리·스크롤 없이 토스트만. 토스 위젯이 이미 카드사 격자 바로 위에
          // 자기 경고 배너를 띄우고, 그 안쪽은 iframe이라 우리가 칠할 수 없다 (1127-7 ⓑ)
          K.toast("カード会社を選択してください");
          return;
        }
        // 서버(api/order.js)가 주는 코드별 일본어 문구. 없는 코드는 공통 문구 (1127-7)
        K.toast(ERR_MSG[code] || "しばらくしてからもう一度お試しください");
      });
  }
  K.hideOnScroll(document.querySelector(".phd2"));  // 상단 바 공통 규칙 — 내리면 숨김, 올리면 다시
  K.track("view_checkout", { product: id, date: date, quantity: qty });
})();
