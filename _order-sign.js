// DB 없이 "서버가 정한 주문 금액"을 기억하는 방법:
// orderId 안에 상품·인원을 넣고, 시크릿 키로 만든 서명(HMAC)을 붙인다.
// 브라우저가 orderId나 금액을 바꾸면 서명이 맞지 않아 승인 단계에서 거절된다.
const crypto = require("crypto");

function sign(body, secret) {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url").slice(0, 16);
}

// 형식: KK_<상품코드>_<인원>_<시간+난수>_<서명>  (영문·숫자·_·- 만 사용, 6~64자)
function makeOrderId(code, qty, secret) {
  const nonce = Date.now().toString(36) + crypto.randomBytes(4).toString("hex");
  const body = `KK_${code}_${qty}_${nonce}`;
  return `${body}_${sign(body, secret)}`;
}

function readOrderId(orderId, secret) {
  if (typeof orderId !== "string" || !/^[A-Za-z0-9_\-=]{6,64}$/.test(orderId)) return null;
  const m = orderId.match(/^(KK_([a-z]{2})_(\d{1,2})_[a-z0-9]+)_([A-Za-z0-9_-]{16})$/);
  if (!m) return null;
  const expected = sign(m[1], secret);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(m[4]))) return null;
  return { code: m[2], qty: Number(m[3]) };
}

module.exports = { makeOrderId, readOrderId };
