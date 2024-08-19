const express = require('express');
const router = express.Router();
const connection = require('../../db');
const sessionConfig = require('../../sessionConfig');
const log = require('../../userlog');

router.use(sessionConfig);

router.delete('/', (req, res) => {
    const { user_num } = req.body;

    if (!user_num) {// 세션에 사용자 정보가 없는 경우
        return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
    }

    try {
        connection.query('DELETE FROM user WHERE user_num = ?', [user_num], (error, results) => {
            if (error) {
                console.error('회원 탈퇴 중 오류 발생:', error);
                log.writeToLogFile('회원 탈퇴 중 오류', user_num);
                return res.status(500).json({ success: false, message: '회원 탈퇴하는 동안 오류가 발생했습니다.' });
            }
            // 세션 제거
            req.session.destroy();

            log.writeToLogFile('회원 탈퇴', user_num);
            res.status(200).json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
        });
    } catch (error) {
        console.error('회원 탈퇴 중 오류 발생:', error);
        log.writeToLogFile('회원 탈퇴 중 오류', user_num);
        res.status(500).json({ success: false, message: '회원 탈퇴하는 동안 오류가 발생했습니다.' });
    }
});

module.exports = router;