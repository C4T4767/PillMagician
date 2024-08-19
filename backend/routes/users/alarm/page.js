const express = require('express');
const router = express.Router();
const connection = require('../../../db');
const sessionConfig = require('../../../sessionConfig');

router.use(sessionConfig);

router.get('/', (req, res) => {
    const { userNum } = req.session.user;

    if (!userNum) {// 세션에 사용자 정보가 없는 경우
        return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
    }

    try {
        connection.query('SELECT * FROM alarm WHERE user_num = ?', [userNum], (error, results) => {
            if (error) {
                console.error('알람 정보 가져오기 중 오류 발생:', error);
                return res.status(500).json({ success: false, message: '알람 정보를 가져오는 동안 오류가 발생했습니다.' });
            }

            if (results.length === 0) {
                // 알람이 없는 경우
                return res.status(404).json({ success: false, message: '알람이 존재하지 않습니다.' });
            }

            res.status(200).json({ success: true, data: results });
        });
    } catch (error) {
        console.error('알람 정보 가져오기 중 오류 발생:', error);
        res.status(500).json({ success: false, message: '알람 정보를 가져오는 동안 오류가 발생했습니다.' });
    }
});

module.exports = router;