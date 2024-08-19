const express = require('express');
const router = express.Router();
const sessionConfig = require('../../sessionConfig');

router.use(sessionConfig);

router.get('/', (req, res) => {
  // 세션에서 사용자 정보를 확인하여 유효성 검사 수행
  if (req.session && req.session.user) {
    res.status(200).json({ valid: true, message: 'Session is valid' });
  } else {
    res.status(401).json({ valid: false, message: 'Session is invalid' });
  }
});

module.exports = router;