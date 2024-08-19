const express = require('express');
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');
const router = express.Router();
const log = require('../../log');

router.get('/', isAuthenticated, (req, res) => {
    res.render('cog_account/change_password', { layout: false , user: req.session.user });
});

router.post('/', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.session.user.admin_id;
    // 현재 비밀번호를 데이터베이스에서 확인하고 일치하는 경우에만 비밀번호 변경
    connection.query('SELECT password FROM admin WHERE admin_id = ?', [adminId], (err, results) => { // 배열에 userId를 단일 요소로 포함
        if (err) {
            console.error('비밀번호 확인 중 오류 발생:', err);
            res.status(500).json({ message: '비밀번호 확인 중 오류 발생' });
        } else {
            const savedPassword = results[0].password;
            if (currentPassword === savedPassword) {
                // 일치하는 경우 새로운 비밀번호로 업데이트
                connection.query('UPDATE admin SET password = ? WHERE admin_id = ?', [newPassword, adminId], (err, results) => {
                    if (err) {
                        console.error('비밀번호 변경 중 오류 발생:', err);
                        res.status(500).json({ message: '비밀번호 변경 중 오류 발생' });
                    } else {
                        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
                        log.writeToLogFile(`비밀번호 변경됨. 유저명: ${req.session.user.name}`);
                    }
                });
            } else {
                res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
            }
        }
    });
});

module.exports = router;
