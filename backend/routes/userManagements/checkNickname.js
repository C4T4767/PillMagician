const express = require('express');
const router = express.Router();
const connection = require('../../db');

router.post('/', async (req, res) => {
    const { user_nickname } = req.body;

    connection.query('SELECT COUNT(*) AS user_count FROM user WHERE nickname = ?', [user_nickname], async (error, results) => {
        if (error) {
            console.error('닉네임 중복 체크 중 오류 발생:', error);
            return res.status(500).json({ success: false, message: '닉네임 중복 체크 중 오류가 발생했습니다.' });
          } else {
            if (results[0].user_count > 0) {
                res.status(400).json({ success: true, message: '이미 사용 중인 닉네임입니다.' });
            } else {
                res.status(200).json({ success: true, message: '사용 가능한 닉네임입니다.' });
            }
          }
        });
});

module.exports = router;