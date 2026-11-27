// 가격 확인: 화면용 가격(js/data.js)과 결제용 가격(api/_prices.js)이 같은지 검사
// 실행: node scripts/check-prices.js   (가격을 바꾼 뒤, 배포 전에 한 번)
global.window = {};
require("../js/data.js");
const { PRICES } = require("../api/_prices.js");
const screen = window.KOKOIKO.products;
let ok = true;
for (const id of new Set([...Object.keys(screen), ...Object.keys(PRICES)])) {
  const a = screen[id] && screen[id].priceKrw, b = PRICES[id] && PRICES[id].krw;
  const same = a === b;
  if (!same) ok = false;
  console.log((same ? "OK  " : "다름") + "  " + id + "  화면 ₩" + a + "  /  결제 ₩" + b);
}
console.log(ok ? "\n모두 같아요." : "\n가격이 다른 상품이 있어요. 두 파일을 같이 고쳐 주세요.");
process.exit(ok ? 0 : 1);
