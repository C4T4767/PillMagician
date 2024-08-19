const express = require('express');
const router = express.Router();
const connection = require('../../../db');
const sessionConfig = require('../../../sessionConfig');
const log = require('../../../userlog');

router.use(sessionConfig);

router.get('/', async (req, res) => { 
  try {
      // user_num 가져오기
      const userNum = req.query.userNum;
      // console.log('userNum: ', userNum);
      if (!userNum) {
        return res.status(401).json({ success: false, message: '사용자 인증이 필요합니다.' });
      }
  
      // 사용자 정보 조회
      const query = 'SELECT name, nickname, email, phone, DATE_FORMAT(birth, "%Y-%m-%d") AS birth, id FROM user WHERE user_num = ?';
      connection.query(query, [userNum], (error, results, fields) => {
        if (error) {
          console.error('Error retrieving user information:', error);
          log.writeToLogFile('사용자 정보 가져오는 중 오류', userNum);
          return res.status(500).json({ success: false, message: '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
        }
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: '해당 사용자를 찾을 수 없습니다.' });
        }
  
        const user = results[0];
        // console.log('user:', user);
        log.writeToLogFile('사용자 정보 가져오기', userNum);

        // 사용자 정보 응답
        res.status(200).json({
          success: true,
          user: {
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            phone: user.phone,
            birth: user.birth,
            id: user.id
          }
        });
      });
    } catch (err) {
      console.error('Error handling request:', err);
      res.status(500).json({ success: false, message: '요청 처리 중 오류가 발생했습니다.' });
    }
  });
  
module.exports = router;