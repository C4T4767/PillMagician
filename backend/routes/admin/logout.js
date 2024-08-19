const express = require('express');
const router = express.Router();
const log = require('../../log');

router.get('/', (req, res) => {
    log.writeToLogFile(`로그아웃 했습니다. 유저명: ${req.session.user.name}`);
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 오류 발생:', err);
            res.status(500).send('로그아웃에 실패했습니다.');
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
