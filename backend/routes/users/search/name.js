const express = require('express');
const router = express.Router();
const connection = require('../../../db');
const log = require('../../../userlog');

router.post('/', (req, res) => {// 이름으로 찾기

  const { item_name, user_num } = req.body; // 클라이언트로부터 전달된 이름
  
  // 데이터베이스에서 이름으로 검색
  const query = `SELECT * FROM pill WHERE item_name LIKE ?`;
  connection.query(query, [`%${item_name}%`], (error, results) => {
    if (error) {
      console.error('이름으로 알약 찾기 중 오류 발생:', error);
      return res.status(500).json({ error: '이름으로 알약 찾기 중 오류가 발생했습니다.' });
    }

    const itemList = results.map(result => ({
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

    // 사용자 번호가 있는 경우에만 히스토리에 추가
    if (user_num) {
      const checkQuery = `
      INSERT INTO history (user_num, keyword) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE keyword = keyword`;
      connection.query(checkQuery, [user_num, item_name], (checkError, checkResults) => {
        if (checkError) {
          console.error('히스토리 추가 중 오류 발생:', checkError);
          return res.status(500).json({ error: '히스토리 추가 중 오류가 발생했습니다.' });
        }

        if (checkResults.length === 0) { // 중복되는 키워드가 없는 경우에만 추가
          const insertQuery = 'INSERT INTO history (user_num, keyword) VALUES (?, ?)';
          connection.query(insertQuery, [user_num, item_name], (insertError, insertResults) => {
            if (insertError) {
              console.error('히스토리 추가 중 오류 발생:', insertError);
              return res.status(500).json({ error: '히스토리 추가 중 오류가 발생했습니다.' });
            }
            console.log('히스토리가 성공적으로 추가되었습니다.');
            log.writeToLogFile('이름으로 알약 검색', user_num);
            return res.status(200).json({ 
              success: true, 
              message: '알약 검색이 완료되었습니다.', 
              itemList: itemList 
            });
          });
        } else {
          // 중복된 값이 이미 히스토리에 존재하는 경우
          log.writeToLogFile('이름으로 알약 검색', user_num);

          return res.status(200).json({ 
            success: true, 
            message: '알약 검색이 완료되었습니다.', 
            itemList: itemList 
          });
        }
      });
    } else {
      // 사용자 번호가 없는 경우에는 히스토리 추가 없이 검색 결과만 반환
      return res.status(200).json({ 
        success: true, 
        message: '알약 검색이 완료되었습니다.', 
        itemList: itemList 
      });
    }
  });
});

module.exports = router;