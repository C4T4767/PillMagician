const express = require('express');
const router = express.Router();
const connection = require('../../db');
const sessionConfig = require('../../sessionConfig');
const log = require('../../userlog');

router.use(sessionConfig);

router.get('/', async (req, res) => { 
    try {
      // user_num 가져오기
      const user_num = req.headers.user_num;

      if (!user_num) {
        return res.status(401).json({ success: false, message: '사용자 인증이 필요합니다.' });
      }
  
      // 알람 정보 조회
      const query = `SELECT * FROM alarm WHERE user_num = ?`;
      connection.query(query, [user_num], (error, results) => {
        if (error) {
          console.error('알람을 가져오는 중 오류 발생:', error);
          log.writeToLogFile('알람 목록 가져오는 중 오류', user_num);
          return res.status(500).json({ success: false, message: '알람을 가져오는 중 오류가 발생했습니다.' });
        }
        if (results.length === 0) {
          return res.status(400).json({ success: false, message: '알람을 찾을 수 없습니다.' });
        }
  
        const alarmList = results.map(result => ({
          alarm_num: result.alarm_num,
          alarm_name: result.alarm_name,
          user_num: result.user_num,
          times: [result.time],
          start_date: result.start_date,
          end_date: result.end_date,
        }));

        // console.log('alarmList: ', alarmList);
  
        log.writeToLogFile('알람 목록 가져오기', user_num);
        res.status(200).json({
          success: true, 
          alarmList: alarmList
        });
      });
    } catch (err) {
      console.error('알람을 가져오는 중 오류 발생:', err);
      res.status(500).json({ success: false, message: '알람을 가져오는 중 오류가 발생했습니다.' });
    }
  });

router.post('/', (req, res) => {
    const user_num = req.headers.user_num;
    const { name, times, startDate, endDate } = req.body;

    if (!user_num) {// 세션에 사용자 정보가 없는 경우
        return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
    }

    try {
        // 알람 추가
        connection.query('INSERT INTO alarm (alarm_name, user_num, time, start_date, end_date) VALUES (?, ?, ?, ?, ?)', 
            [name, user_num, times, startDate, endDate], 
            (error, results) => {
                if (error) {
                    console.error('알람 추가 중 오류 발생:', error);
                    log.writeToLogFile('알람 추가하는 중 오류', user_num);
                    return res.status(500).json({ success: false, message: '알람을 추가하는 동안 오류가 발생했습니다.' });
                }
                log.writeToLogFile('알람 추가', user_num);
                res.status(200).json({ success: true, message: '알람이 추가되었습니다.' });
            }
        );
    } catch (error) {
        console.error('알람 추가 중 오류 발생:', error);
        log.writeToLogFile('알람 추가하는 중 오류', user_num);
        res.status(500).json({ success: false, message: '알람을 추가하는 동안 오류가 발생했습니다.' });
    }
});

router.put('/', async (req, res) => {
  try {
    const user_num = req.headers.user_num;
    if (!user_num) {
      return res.status(401).json({ success: false, message: '사용자 인증이 필요합니다.' });
    }

    const { name, times, startDate, endDate, alarmNum } = req.body;

    // 알람 수정 
    connection.query('UPDATE alarm SET alarm_name = ?, time = ?, start_date = ?, end_date = ? WHERE alarm_num = ?', 
            [name, times, startDate, endDate, alarmNum], 
            (error, results) => {
                if (error) {
                    console.error('알람 수정 중 오류 발생:', error);
                    log.writeToLogFile('알람 수정 중 오류', user_num);
                    return res.status(500).json({ success: false, message: '알람을 수정하는 동안 오류가 발생했습니다.' });
                }
                log.writeToLogFile('알람 수정', user_num);
                res.status(200).json({ success: true, message: '알람이 수정되었습니다.' });
            }
        );
  } catch (err) {
    console.error('알람 수정 중 오류 발생:', err);
    res.status(500).json({ success: false, message: '알람을 수정하는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;