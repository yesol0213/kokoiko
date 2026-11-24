// 결제 페이지 (토스페이먼츠 SDK v2 결제위젯). 날짜·인원은 상세에서 받아오고, 금액·orderId는 서버가 정함
// 키: 결제위젯 연동 키(gck/gsk). 카드만 노출은 계약 후 상점관리자 위젯 설정에서 (PRD 오픈 이슈)
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var p = K.products[q.get("product")] || K.products["jeonju-damyang"], id = p.id;
  var date = q.get("date"), qty = Math.min(K.MAX_PER_BOOKING, Math.max(1, parseInt(q.get("qty") || "1", 10) || 1));
  var widgets = null, pmW = null, pmOk = false, pmSel = "", tossAgree = true, FIELDS = ["name", "email", "line"];
  if (!date) { location.replace(p.page); return; }

  // 뒤로가기(헤더 ‹)·「日程・人数を変更する」 모두 상세 페이지로 돌아갈 때 선택했던 날짜·인원을 유지(상세 페이지가 ?date=&qty=를 읽어 그대로 복원함)
  $("backLink").href = p.page + "?date=" + date + "&qty=" + qty;
  $("sImg").style.backgroundImage = "url(" + K.img(p.hero[0]) + ")";
  $("sName").innerHTML = p.name.replace("<br>", " ");
  $("sDate").textContent = "参加日：" + K.jpLong(date);
  $("sTime").textContent = "時間：" + p.time;
  $("sQty").textContent = "人数：" + qty + "名";
  $("sMeet").textContent = "集合：" + K.MEETING.ja;
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
    name: [function (v) { return v.trim().length > 0; }, "お名前を入力してください"],
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
    $("err").textContent = "";
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
        busy = false; updBtn(); console.error(err);
        if (err && err.code === "USER_CANCEL") return;
        var msg = (err && err.message) || "決済を開始できませんでした。"; $("err").textContent = msg; K.toast(msg);
      });
  }
  K.track("view_checkout", { product: id, date: date, quantity: qty });
})();
