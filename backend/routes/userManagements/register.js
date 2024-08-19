const express = require('express');
const router = express.Router();
const connection = require('../../db');
const { hash } = require('bcrypt');
  
router.post('/', async (req, res) => {
    const { user_name, user_nickname, user_id, user_password, user_birth, user_email, user_phone } = req.body;
    
    // 비밀번호 해싱
    try {
        const saltRounds = 10;
        const hashedPassword = await hash(user_password, saltRounds);

        connection.query('INSERT INTO user (name, nickname, id, password, birth, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_name, user_nickname, user_id, hashedPassword, user_birth, user_email, user_phone], (error, results) => { // hashedPassword
                if (error) {
                    console.error('회원가입 중 오류 발생:', error);
                    return res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
                  }
                  res.status(200).json({ success: true, message: '회원가입이 완료되었습니다.' });
                }
            );
        } catch (error) {
            console.error('비밀번호 해싱 중 오류 발생:', error);
            res.status(500).json({ success: false, message: '비밀번호 해싱 중 오류가 발생했습니다.' });
        }
    });
  
module.exports = router;