// 결제 승인 (서버 전용). 시크릿 키는 환경변수 TOSS_SECRET_KEY 에서만 읽는다.
const { PRICES, MAX_QTY, byCode } = require("./_prices");
const { readOrderId, signKey } = require("./_order-sign");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "METHOD_NOT_ALLOWED", message: "POST only" });
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) return res.status(500).json({ code: "NO_SECRET_KEY", message: "サーバー設定エラー" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const { paymentKey, orderId, amount } = body || {};
  if (!paymentKey || !orderId) return res.status(400).json({ code: "INVALID_REQUEST", message: "決済情報が不足しています" });

  // 1) orderId 서명 확인 → 서버가 발급한 주문인지
  const order = readOrderId(orderId, signKey());
  const productId = order && byCode(order.code);
  if (!order || !productId || order.qty < 1 || order.qty > MAX_QTY) {
    return res.status(400).json({ code: "INVALID_ORDER", message: "注文情報が正しくありません" });
  }

  // 2) 서버 가격표로 금액 계산 → 결제창에서 넘어온 금액과 비교
  const serverAmount = PRICES[productId].krw * order.qty;
  if (Number(amount) !== serverAmount) {
    return res.status(400).json({ code: "AMOUNT_MISMATCH", message: "金額が異なるため、決済を承認できませんでした" });
  }

  // 3) 토스에 승인 요청. amount는 서버 가격표 금액을 보낸다.
  try {
    const r = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(secret + ":").toString("base64"), // 콜론 필수
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ paymentKey, orderId, amount: serverAmount })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ code: data.code, message: data.message });
    return res.status(200).json({
      orderId: data.orderId,
      orderName: data.orderName,
      totalAmount: data.totalAmount,
      method: data.method,
      approvedAt: data.approvedAt,
      productId,
      qty: order.qty,
      date: order.date
    });
  } catch (e) {
    return res.status(502).json({ code: "CONFIRM_FAILED", message: "決済の確認に失敗しました" });
  }
};
