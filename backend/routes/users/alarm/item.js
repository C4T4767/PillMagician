const express = require('express');
const router = express.Router();
const connection = require('../../../db');
const sessionConfig = require('../../../sessionConfig');

router.use(sessionConfig);

// router.get('/', (req, res) => {
//     res.render(''); //알람 약 추가 화면
//   });
  
router.post('/', (req, res) => {
    const { userNum } = req.session.user;
    const { itemSeq, alarmTime, alarmDate } = req.body;

    if (!userNum) {// 세션에 사용자 정보가 없는 경우
        return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
    }

    try {
        connection.query('INSERT INTO alarm (user_num, item_seq, alarm_time, alarm_date) VALUES (?, ?, ?, ?)', 
            [userNum, itemSeq, alarmTime, alarmDate], 
            (error, results) => {
                if (error) {
                    console.error('알람에 알약 추가 중 오류 발생:', error);
                    return res.status(500).json({ success: false, message: '알람에 알약을 추가하는 동안 오류가 발생했습니다.' });
                }

                res.status(200).json({ success: true, message: '알람에 알약이 추가되었습니다.' });
            });
    } catch (error) {
        console.error('알람에 알약 추가 중 오류 발생:', error);
        res.status(500).json({ success: false, message: '알람에 알약을 추가하는 동안 오류가 발생했습니다.' });
    }
});
  
module.exports = router;