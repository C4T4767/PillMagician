const express = require('express');
const connection = require('../../db');
const router = express.Router();
const log = require('../../log');

router.get('/', (req, res) => {
    // 라우터에서 이미 이메일을 받았으므로 그대로 뷰로 전달
    const email = req.session.email;
    console.log(email)
    res.render('cog_account/reset_password', { email: email, layout: false });
});

router.post('/', (req, res) => {
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    // MySQL 데이터베이스를 사용하여 사용자의 비밀번호를 변경합니다.
    const query = "UPDATE admin SET password = ? WHERE email = ?";
    connection.query(query, [newPassword, email], (err, result) => {
        if (err) {
            console.error('비밀번호 변경 오류:', err);
            res.status(500).json({ message: '비밀번호 설정에 실패했습니다. 다시 시도해주십시오.' });
        } else {
            console.log('비밀번호가 성공적으로 변경되었습니다.');
            res.status(200).json({ message: '성공적으로 비밀번호를 재설정했습니다.' });
            log.writeToLogFile(`비밀번호 재설정됨. 유저명: ${req.session.user.name}`);
        }
    });
});

module.exports = router;
