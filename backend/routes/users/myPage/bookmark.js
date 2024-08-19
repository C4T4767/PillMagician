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

    // 북마크 정보 조회
    const query = `
    SELECT p.item_seq, p.item_name, p.entp_name, p.item_image, p.chart, p.drug_shape, p.color_class1, p.color_class2, p.class_name, p.print_front, p.print_back
    FROM bookmark b
    INNER JOIN pill p ON b.item_seq = p.item_seq
    WHERE b.user_num = ?
  `;
    connection.query(query, [userNum], (error, results) => {
      if (error) {
        console.error('북마크를 가져오는 중 오류 발생:', error);
        log.writeToLogFile('북마크 목록 가져오는 중 오류', userNum);
        return res.status(500).json({ success: false, message: '북마크를 가져오는 중 오류가 발생했습니다.' });
      }
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: '북마크를 찾을 수 없습니다.' });
      }

      const bookmarkList = results.map(result => ({
        item_seq: result.item_seq,
        item_name: result.item_name,
        item_image: result.item_image,
        entp_name: result.entp_name,
        chart: result.chart,
        drug_shape: result.drug_shape,
        color_class1: result.color_class1,
        color_class2: result.color_class2,
        class_name: result.class_name,
        print_front: result.print_front,
        print_back: result.print_back,
      }));

      log.writeToLogFile('북마크 목록 가져오기', userNum);

      res.status(200).json({
        success: true, 
        bookmarkList: bookmarkList
      });
    });
  } catch (err) {
    console.error('북마크를 가져오는 중 오류 발생:', err);
    res.status(500).json({ success: false, message: '북마크를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 북마크 설정
router.put('/', async (req, res) => { 
  try {
    const { user_num, item_seq } = req.body; // 알약 번호 가져오기
    // console.log('req.body: ', req.body);

    // 이미 해당 사용자의 북마크에 해당 알약 번호가 있는지 확인하는 SQL 쿼리
    const checkQuery = `SELECT * FROM bookmark WHERE user_num = ${user_num} AND item_seq = ${item_seq}`;

    // 해당 알약 번호가 이미 북마크에 있는지 확인
    connection.query(checkQuery, (error, results, fields) => {
      if (error) {
        console.error(error);
        log.writeToLogFile('북마크 추가 중 오류', user_num);
        res.status(500).json({ error: "Server error" });
      } else {
        // 이미 북마크가 존재하는 경우
        if (results.length > 0) {
          res.status(400).json({ error: "Bookmark already exists" });
        } else {
          // 북마크 추가를 위한 SQL 쿼리
          const addQuery = `INSERT INTO bookmark (user_num, item_seq) VALUES (${user_num}, ${item_seq})`;

          // 북마크 추가
          connection.query(addQuery, (addError, addResults, addFields) => {
            if (addError) {
              console.error(addError);
              log.writeToLogFile('북마크 추가하는 중 오류', user_num);
              res.status(500).json({ error: "Server error" });
            } else {
              // 성공 응답
              log.writeToLogFile('북마크 추가', user_num);
              res.status(200).json({ message: "Bookmark added successfully" });
            }
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 북마크 삭제
router.delete('/', async (req, res) => { // 프론트 APIService.dart에서도 수정하기
  try {
    const { userNum, itemSeq } = req.query; // 요청 URL에서 사용자, 알약 식별번호 가져오기

    if (!userNum || !itemSeq) {
      return res.status(400).json({ error: '유저 번호와 알약 식별번호를 모두 제공해야 합니다.' });
    }

    const query = `DELETE FROM bookmark WHERE user_num = ? AND item_seq = ?`;
    const values = [userNum, itemSeq];
    await connection.query(query, values);

    log.writeToLogFile('북마크 삭제', userNum);

    // 성공 응답 반환
    res.json({ message: '북마크가 삭제되었습니다.' });
  } catch (error) {
    // 오류 발생 시 오류 응답 반환
    console.error('Failed to delete bookmark:', error);
    res.status(500).json({ error: '북마크를 삭제하는 동안 오류가 발생했습니다.' });
  }
});

module.exports = router;