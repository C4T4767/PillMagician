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
      // console.log('user_num: ', user_num);
      if (!user_num) {
        return res.status(401).json({ success: false, message: '사용자 인증이 필요합니다.' });
      }
  
      // 알람 정보 조회
      const query = `SELECT * FROM alarm WHERE user_num = ?`;
      connection.query(query, [user_num], (error, results) => {
        if (error) {
          console.error('복용기록을 가져오는 중 오류 발생:', error);
          log.writeToLogFile('복용 이력을 가져오는 중 오류', user_num);
          return res.status(500).json({ success: false, message: '복용기록을 가져오는 중 오류가 발생했습니다.' });
        }
        if (results.length === 0) {
          return res.status(400).json({ success: false, message: '복용기록을 찾을 수 없습니다.' });
        }
  
        const doseHistoryList = results.map(result => ({
          alarm_num: result.alarm_num,
          alarm_name: result.alarm_name,
          user_num: result.user_num,
          times: [result.time],
          start_date: result.start_date,
          end_date: result.end_date,
        }));

        // console.log('doseHistoryList: ', doseHistoryList);
  
        log.writeToLogFile('복용 이력 가져오기', user_num);

        res.status(200).json({
          success: true, 
          doseHistoryList: doseHistoryList
        });
      });
    } catch (err) {
      console.error('복용 이력을 가져오는 중 오류 발생:', err);
      res.status(500).json({ success: false, message: '복용 이력을 가져오는 중 오류가 발생했습니다.' });
    }
  });

module.exports = router;