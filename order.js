// 상품ID와 인원만 받고, 금액과 orderId는 서버가 정한다.
const { PRICES, MAX_QTY } = require("./_prices");
const { makeOrderId } = require("./_order-sign");

module.exports = function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "METHOD_NOT_ALLOWED", message: "POST only" });
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) return res.status(500).json({ code: "NO_SECRET_KEY", message: "サーバー設定エラー" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const product = PRICES[(body || {}).productId];
  const qty = Number((body || {}).qty || 1);
  if (!product) return res.status(400).json({ code: "INVALID_PRODUCT", message: "商品が見つかりません" });
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return res.status(400).json({ code: "INVALID_QTY", message: "人数を確認してください" });

  return res.status(200).json({
    orderId: makeOrderId(product.code, qty, secret),
    orderName: `${product.name} × ${qty}名`,
    amount: product.krw * qty,
    currency: "KRW"
  });
};
