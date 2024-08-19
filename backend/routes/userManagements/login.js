const express = require('express');
const router = express.Router();
const connection = require('../../db');
const sessionConfig = require('../../sessionConfig');
const { compare } = require('bcrypt');
const log = require('../../userlog');

router.use(sessionConfig);

router.post('/', async (req, res) => {
  const { user_id, user_password } = req.body;
  
  connection.query('SELECT * FROM user WHERE id = ?', [user_id], async (error, results) => {
    if (error) {
      console.error('로그인 중 오류 발생:', error);
      return res.status(500).json({ success: false, message: '로그인 중 오류가 발생했습니다.' });
    } else {
      if (results.length === 0) {
      // 해당 아이디가 존재하지 않는 경우
      return res.status(401).json({ success: false, message: '존재하지 않는 아이디입니다.' });
    }

    // 비밀번호 확인
    const user = results[0];
    const passwordMatch = await compare(user_password, user.password);

    if (!passwordMatch) {
      // 비밀번호가 일치하지 않는 경우
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    // 세션 설정
    req.session.user = {user_num: user.user_num, userId: user.id, user_nickname: user.nickname};

    // 세션 ID 가져오기
    const sessionId = req.sessionID;
    log.writeToLogFile('로그인',user.user_num);
    res.status(200).json({ success: true, message: '로그인 성공', user_num: user.user_num, session_id: sessionId });
    }
  });
});

  module.exports = router;
