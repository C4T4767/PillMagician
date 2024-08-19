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

    const query = `
    SELECT u.user_num, u.name, u.nickname, u.email, u.phone 
    FROM family f
    JOIN user u ON (f.family_user_num = u.user_num OR f.user_num = u.user_num)
    WHERE (f.user_num = ? OR f.family_user_num = ?) AND u.user_num != ?
    `;
    connection.query(query, [userNum, userNum, userNum], (error, results) => {
      if (error) {
        console.error('가족 목록을 가져오는 중 오류 발생:', error);
        log.writeToLogFile('가족 목록을 가져오는 중 오류', userNum);
        return res.status(500).json({ success: false, message: '가족 목록을 가져오는 중 오류가 발생했습니다.' });
      }
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: '가족 목록을 찾을 수 없습니다.' });
      }

      const familyList = results.map(result => ({
        user_num: result.user_num.toString(),
        name: result.name,
        nickname: result.nickname,
        email: result.email,
        phone: result.phone
      }));

      // console.log('familyList: ', familyList);
      log.writeToLogFile('가족 목록 불러오기', userNum);

      res.status(200).json({
        success: true, 
        familyList: familyList
      });
    });
  } catch (err) {
    console.error('가족 목록을 가져오는 중 오류 발생:', err);
    res.status(500).json({ success: false, message: '가족 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', async (req, res) => {
  const userNum = req.headers.usernum;

  const { name, email } = req.body;

  connection.query(
    'SELECT user_num FROM user WHERE name = ? AND email = ?',
    [name, email],
    (error, familyUserResults) => {
      if (error) {
        console.error('Failed to fetch user:', error);
        log.writeToLogFile('가족 추가하는 중 오류', userNum);
        return res.status(500).json({ success: false, message: 'Failed to fetch user' });
      }

      if (familyUserResults.length === 0) {
        return res.status(404).json({ success: false, message: '해당 가족을 찾을 수 없습니다.' });
      }

      const familyUserNum = familyUserResults[0].user_num;

      // 기존 관계가 존재하는지 확인
      connection.query(
        'SELECT * FROM family WHERE (user_num = ? AND family_user_num = ?) OR (user_num = ? AND family_user_num = ?)',
        [userNum, familyUserNum, familyUserNum, userNum],
        (error, existingRelations) => {
          if (error) {
            console.error('Failed to check existing relationships:', error);
            return res.status(500).json({ success: false, message: 'Failed to check existing relationships' });
          }

          if (existingRelations.length > 0) {
            return res.status(400).json({ success: false, message: 'family relationship already exists' });
          }

          // 관계 삽입
          connection.query(
            'INSERT INTO family (user_num, family_user_num) VALUES (?, ?)',
            [userNum, familyUserNum],
            (error, insertResult) => {
              if (error) {
                console.error('Failed to add family:', error);
                return res.status(500).json({ success: false, message: 'Failed to add family' });
              }

              log.writeToLogFile('가족 추가', userNum);
              res.status(201).json({ success: true, message: 'family added successfully' });
            }
          );
        }
      );
    }
  );
});

router.delete('/', (req, res) => {
  const userNum = req.headers.user_num;

  if (!userNum) {// 세션에 사용자 정보가 없는 경우
      return res.status(401).json({ success: false, message: '세션에 사용자 정보가 없습니다.' });
  }

  const friendUserNum = req.body.friendUserNum; // 삭제할 가족 식별 번호

  try { //반대의 경우도 쿼리에 추가해야 함
      connection.query('DELETE FROM family WHERE (user_num = ? AND family_user_num = ?) OR (user_num = ? AND family_user_num = ?)', [userNum, friendUserNum, friendUserNum, userNum], (error, results) => {
          if (error) {
              console.error('가족 삭제 중 오류 발생:', error);
              log.writeToLogFile('가족 삭제 중 오류', userNum);
              return res.status(500).json({ success: false, message: '가족을 삭제하는 동안 오류가 발생했습니다.' });
          }

          if (results.affectedRows === 0) {
              // 삭제할 가족이 없는 경우
              return res.status(404).json({ success: false, message: '삭제할 가족이 존재하지 않습니다.' });
          }

          log.writeToLogFile('가족 삭제', userNum);
          res.status(200).json({ success: true, message: '가족이 삭제되었습니다.' });
      });
  } catch (error) {
      console.error('가족 삭제 중 오류 발생:', error);
      log.writeToLogFile('가족 삭제 중 오류', userNum);
      res.status(500).json({ success: false, message: '가족을 삭제하는 동안 오류가 발생했습니다.' });
  }
});

module.exports = router;