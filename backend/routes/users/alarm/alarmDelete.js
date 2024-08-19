const express = require('express');
const router = express.Router();
const connection = require('../../../db');
const sessionConfig = require('../../../sessionConfig');
const log = require('../../../userlog');

router.use(sessionConfig);

router.delete('/', (req, res) => {
    const userNum = req.headers.user_num;

    // console.log("req.headers.user_num: ", req.headers.user_num);
    // console.log("userNum: ", userNum);

    if (!userNum) {// 세션에 사용자 정보가 없는 경우
        return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
    }

    const alarm_num = req.body.alarmNum; // 삭제할 알람의 고유 번호

    try {
        connection.query('DELETE FROM alarm WHERE alarm_num = ? AND user_num = ?', [alarm_num, userNum], (error, results) => {
            if (error) {
                console.error('알람 삭제 중 오류 발생:', error);
                log.writeToLogFile('알람 삭제 중 오류 발생', userNum);
                return res.status(500).json({ success: false, message: '알람을 삭제하는 동안 오류가 발생했습니다.' });
            }

            if (results.affectedRows === 0) {
                // 삭제할 알람이 없는 경우
                return res.status(404).json({ success: false, message: '삭제할 알람이 존재하지 않습니다.' });
            }

            log.writeToLogFile('알람 삭제', userNum);
            res.status(200).json({ success: true, message: '알람이 삭제되었습니다.' });
        });
    } catch (error) {
        console.error('알람 삭제 중 오류 발생:', error);
        log.writeToLogFile('알람 삭제 중 오류 발생', userNum);
        res.status(500).json({ success: false, message: '알람을 삭제하는 동안 오류가 발생했습니다.' });
    }
});

module.exports = router;