// 브라우저에 "클라이언트 키"만 내려준다. 시크릿 키는 절대 내려주지 않는다.
module.exports = function handler(req, res) {
  const clientKey = process.env.TOSS_CLIENT_KEY;
  if (!clientKey) return res.status(500).json({ code: "NO_CLIENT_KEY", message: "TOSS_CLIENT_KEY が未設定です" });
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ clientKey, testMode: clientKey.startsWith("test_") });
};
