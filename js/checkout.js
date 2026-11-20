// 결제 페이지 (토스페이먼츠 SDK v2 결제위젯). 날짜·인원은 상세에서 받아오고, 금액·orderId는 서버가 정함
(function () {
  var K = window.KOKOIKO, $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var p = K.products[q.get("product")] || K.products["jeonju-damyang"], id = p.id;
  var date = q.get("date"), qty = Math.min(K.MAX_PER_BOOKING, Math.max(1, parseInt(q.get("qty") || "1", 10) || 1));
  var widgets = null, FIELDS = ["name", "email", "tel", "line"];
  if (!date) { location.replace(p.page); return; }

  $("backLink").href = p.page; $("changeLink").href = p.page;
  $("sImg").style.backgroundImage = "url(" + K.img(p.hero[0]) + ")";
  $("sName").innerHTML = p.name.replace("<br>", " ");
  $("sDate").textContent = "参加日：" + K.jpLong(date) + "　" + p.time;
  $("sQty").textContent = "人数：" + qty + "名";
  $("sMeet").textContent = "集合：" + K.MEETING.ja;
  var total = p.priceKrw * qty; // 표시용. 실제 금액은 /api/order 가 정함
  $("unit").textContent = K.krw(p.priceKrw) + " × " + qty + "名";
  $("total").textContent = K.krw(total); $("bTotal").textContent = K.krw(total);
  K.getRate().then(function (c) { $("totalYen").textContent = K.yen(total, c.rate); $("bYen2").textContent = K.yen(total, c.rate); });

  // 실패 후 돌아왔을 때 입력값 복원
  try { var saved = JSON.parse(sessionStorage.getItem("kk_form") || "null"); if (saved) FIELDS.forEach(function (f) { if (saved[f]) $(f).value = saved[f]; }); } catch (e) {}
  function keep() { var v = {}; FIELDS.forEach(function (f) { v[f] = $(f).value; }); try { sessionStorage.setItem("kk_form", JSON.stringify(v)); } catch (e) {} }
  FIELDS.forEach(function (f) { $(f).addEventListener("input", keep); });

  // 1) /api/config → SDK 초기화 → 금액 설정 → 결제수단·약관 렌더
  fetch("/api/config").then(function (r) { return r.json(); }).then(function (cfg) {
    if (!cfg.clientKey) throw new Error(cfg.message || "config error");
    if (cfg.testMode) $("testBar").hidden = false;
    widgets = TossPayments(cfg.clientKey).widgets({ customerKey: TossPayments.ANONYMOUS });
    return widgets.setAmount({ currency: "KRW", value: total }).then(function () {
      return Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" })
      ]);
    });
  }).then(updBtn).catch(function (e) { widgets = null; updBtn(); $("err").textContent = "決済画面を表示できませんでした。時間をおいて再度お試しください。"; console.error(e); });

  // 입력 검사: 칸을 벗어날 때 인라인 에러, 모두 맞고 동의 체크 시에만 결제 버튼 활성
  var RULES = {
    name: [function (v) { return v.trim().length > 0; }, "お名前を入力してください"],
    email: [function (v) { return /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(v.trim()); }, "メールアドレスの形式を確認してください"],
    tel: [function (v) { return v.replace(/[^0-9]/g, "").length >= 9; }, "電話番号を確認してください（数字9桁以上）"],
    line: [function (v) { return /^[a-z0-9._-]{4,20}$/.test(v.trim()); }, "LINE IDを確認してください（半角英数字・. - _ 4〜20文字）"]
  };
  var touched = {};
  function okField(f) { return RULES[f][0]($(f).value); }
  function showErr(f) {
    var bad = touched[f] && !okField(f), el = $(f), box = el.parentNode.querySelector(".ferr");
    el.classList.toggle("bad", bad); el.setAttribute("aria-invalid", bad ? "true" : "false");
    if (bad && !box) { box = document.createElement("div"); box.className = "ferr"; el.insertAdjacentElement("afterend", box); }
    if (box) { box.textContent = bad ? RULES[f][1] : ""; box.hidden = !bad; }
  }
  function allOk() { return FIELDS.every(okField) && $("agree").checked; }
  function updBtn() { $("payBtn").disabled = !allOk() || !widgets; }
  FIELDS.forEach(function (f) {
    $(f).addEventListener("blur", function () { if ($(f).value) touched[f] = true; showErr(f); });
    $(f).addEventListener("input", function () { if (touched[f]) showErr(f); updBtn(); });
  });
  $("agree").addEventListener("change", updBtn);
  FIELDS.forEach(function (f) { if ($(f).value) { touched[f] = true; showErr(f); } });
  updBtn();

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = { name: $("name").value.trim(), email: $("email").value.trim(), tel: $("tel").value.replace(/[^0-9]/g, ""), line: $("line").value.trim() };
    if (!allOk()) { FIELDS.forEach(function (f) { touched[f] = true; showErr(f); }); return; }
    $("err").textContent = "";
    if (!widgets) return;
    $("payBtn").disabled = true; keep();
    fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, qty: qty }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function (order) {
        try { sessionStorage.setItem("kk_booking", JSON.stringify({ product: id, qty: qty, date: date, email: v.email })); } catch (e2) {}
        K.track("add_payment_info", { product: id, value: order.amount, currency: "KRW", quantity: qty });
        return widgets.setAmount({ currency: "KRW", value: order.amount }).then(function () {
          return widgets.requestPayment({
            orderId: order.orderId, orderName: order.orderName,
            successUrl: location.origin + "/success.html",
            failUrl: location.origin + "/fail.html?product=" + id + "&date=" + date + "&qty=" + qty,
            customerEmail: v.email, customerName: v.name, customerMobilePhone: v.tel
          });
        });
      })
      .catch(function (err) { updBtn(); console.error(err); $("err").textContent = (err && err.message) || "決済を開始できませんでした。"; });
  });
  K.track("view_checkout", { product: id, date: date, quantity: qty });
})();
