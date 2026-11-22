// DB 없이 "서버가 정한 주문 금액"을 기억하는 방법:
// orderId 안에 상품·인원을 넣고, 시크릿 키로 만든 서명(HMAC)을 붙인다.
// 브라우저가 orderId나 금액을 바꾸면 서명이 맞지 않아 승인 단계에서 거절된다.
const crypto = require("crypto");

function sign(body, secret) {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url").slice(0, 16);
}

// 형식: KK_<상품코드>_<인원>_<참가일YYYYMMDD>_<시간+난수>_<서명>  (영문·숫자·_·- 만 사용, 6~64자)
function makeOrderId(code, qty, ymd, secret) {
  const nonce = Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
  const body = `KK_${code}_${qty}_${ymd}_${nonce}`;
  return `${body}_${sign(body, secret)}`;
}

function readOrderId(orderId, secret) {
  if (typeof orderId !== "string" || !/^[A-Za-z0-9_\-=]{6,64}$/.test(orderId)) return null;
  const m = orderId.match(/^(KK_([a-z]{2})_(\d{1,2})_(\d{8})_[a-z0-9]+)_([A-Za-z0-9_-]{16})$/);
  if (!m) return null;
  const expected = sign(m[1], secret);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(m[5]))) return null;
  const d = m[4];
  return { code: m[2], qty: Number(m[3]), date: d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6, 8) };
}

// 서명 키: ORDER_SIGN_KEY 가 있으면 그것을, 없으면 토스 시크릿 키를 사용 (기존 배포가 깨지지 않게)
function signKey() { return process.env.ORDER_SIGN_KEY || process.env.TOSS_SECRET_KEY; }

// 참가일 확인: YYYY-MM-DD 형식, 오늘 기준 마감일(출발 3일 전) 이후 ~ 1년 이내
const CLOSE_DAYS_BEFORE = 3;
function checkDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number), t = Date.UTC(y, m - 1, d);
  const u = new Date(t); if (u.getUTCFullYear() !== y || u.getUTCMonth() !== m - 1 || u.getUTCDate() !== d) return null; // 2/31 같은 없는 날짜
  const k = new Date(Date.now() + 9 * 3600e3), today = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); // 한국 날짜 기준 오늘
  const days = Math.round((t - today) / 86400e3);
  if (days < CLOSE_DAYS_BEFORE || days > 366) return null;
  return s.replace(/-/g, "");
}

module.exports = { makeOrderId, readOrderId, signKey, checkDate };
