const express = require('express');
const session = require('express-session');
const router = express.Router();
const sessionConfig = require('../../sessionConfig');

router.use(sessionConfig);

router.post('/', (req, res) => {
  const { session_id } = req.headers;

  if (!session_id) {
    return res.status(400).json({ success: false, message: '세션이 필요합니다.' });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('세션 제거 중 오류 발생:', err);
      res.status(500).json({ success: false, message: '로그아웃 중 오류가 발생했습니다.' });
    } else {
      res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
    }
  });
});

module.exports = router;