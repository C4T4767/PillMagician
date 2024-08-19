const express = require('express');
const router = express.Router();
const connection = require('../../db');
const log = require('../../log');


router.get('/', (req, res) => {
    res.render('cog_account/login', { layout: false });
});

router.post('/', (req, res) => {
    const { email, password } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // 클라이언트 IP 주소 가져오기
    // 사용자 확인
    connection.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error('로그인 중 오류 발생:', err);
            res.status(500).json({ message: '로그인 중 오류 발생' });
            log.writeToLogFile(`로그인 중 오류 발생. IP: ${clientIP}`);
        } else {
            if (results.length > 0) {
                const user = results[0];
                req.session.user = user; // 세션에 사용자 정보 저장
                // 사용자가 존재하면 성공 응답 반환
                res.status(200).json({ message: '로그인 성공', user });
                log.writeToLogFile(`로그인 성공. 유저명: ${user.name}, IP: ${clientIP}`);
            } else {
                // 사용자가 존재하지 않으면 실패 응답 반환
                res.status(401).json({ message: '유효하지 않은 사용자 이름 또는 비밀번호' });
                log.writeToLogFile(`로그인 실패. 유효하지 않은 사용자 이름 또는 비밀번호. IP: ${clientIP}`);
            }
        }
    });
});


module.exports = router;
