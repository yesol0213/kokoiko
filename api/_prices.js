// 서버 전용 가격표 (테스트용). 브라우저로는 내려가지 않는다.
// Vercel은 api/ 안의 "_"로 시작하는 파일을 URL로 공개하지 않는다.
const PRICES = {
  "gangneung":      { code: "gn", name: "江陵 日帰りツアー",        krw: 90000 },
  "jeonju-damyang": { code: "jd", name: "全州・潭陽 日帰りツアー",  krw: 100000 },
  "danyang":        { code: "dy", name: "丹陽 日帰りツアー",        krw: 90000 }
};
const MAX_QTY = 19; // 21인승 프리미엄 버스 기준 − 가이드·내부 직원 2명. 오픈 이슈: 실제 운행 버스 차종 확인 필요

function byCode(code) {
  return Object.keys(PRICES).find(id => PRICES[id].code === code) || null;
}

module.exports = { PRICES, MAX_QTY, byCode };
