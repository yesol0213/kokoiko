# ここいこ KOKOIKO — 일본인 대상 서울 출발 당일치기 투어 랜딩

- 페이지: index(메인) / jeonju-damyang · gangneung · danyang(상세 3) / checkout(결제) / success(완료) / fail(실패)
- 결제: 토스페이먼츠 결제위젯 SDK v2 (테스트 키), 서버 함수 /api/config · /api/order · /api/confirm
- 금액은 서버(api/_prices.js)가 정하고, 승인 전에 서버 가격표로 다시 검증 (금액 조작 방지)

## Vercel 환경변수 (Settings → Environment Variables)
- TOSS_CLIENT_KEY = test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
- TOSS_SECRET_KEY = test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6
※ 키는 GitHub·HTML에 넣지 않는다. 입력 후 Redeploy.

## 운영 설정 (js/data.js)
- SHEET_CSV_URL: 판매일·매진 구글 시트(웹에 게시한 CSV). 형식 product,date,status
- LINE_ADD_URL / INSTAGRAM_URL / GA4_ID: 전달받으면 입력
- 가격 변경 시 js/data.js 와 api/_prices.js 함께 수정
