const express = require('express');
const router = express.Router();
const connection = require('../../db');

router.post('/', (req, res) => {// 이름, 이메일로 찾기
    const { user_name, user_email } = req.body;
  
    connection.query('SELECT id FROM user WHERE name = ? AND email = ?', [user_name, user_email], async (error, results) => {
      if (error) {
          console.error('아이디 찾기 중 오류 발생:', error);
          return res.status(500).json({ success: false, message: '아이디 찾기 중 오류가 발생했습니다.' });
      } else {
          if (results.length === 0) {
              res.status(404).json({ success: false, message: '일치하는 사용자가 없습니다.' });
          } else {
            const user_id = results[0].id;
              res.status(200).json({ success: true, user_id});
          }
      }
    });
  });
  
  module.exports = router;