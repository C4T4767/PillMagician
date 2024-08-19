const express = require('express');
const router = express.Router();
const connection = require('../../db');

router.post('/', async (req, res) => { //'SELECT COUNT(*) AS user_count FROM user WHERE id = ?'
    const { user_id } = req.body;

    connection.query('SELECT * FROM user WHERE id = ?', [user_id], async (error, results) => {
        if (error) {
            console.error('아이디 중복 체크 중 오류 발생:', error);
            return res.status(500).json({ success: false, message: '아이디 중복 체크 중 오류가 발생했습니다.' });
        } else {
            if (results.length > 0) { //results[0].user_count
                res.status(400).json({ success: false, message: '이미 사용 중인 아이디입니다.' });
            } else {
                res.status(200).json({ success: true, message: '사용 가능한 아이디입니다.' });
            }
        }
    });
});

module.exports = router;