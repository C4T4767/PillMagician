const express = require('express');
const router = express.Router();
const connection = require('../../../db');

router.post('/', (req, res) => {// 상세보기(item_seq로 찾기)

  const { item_seq } = req.body; // 클라이언트로부터 전달된 이름
  // console.log(user_num);
  
  // 데이터베이스에서 식별번호로 검색
  const query = `SELECT * FROM pill WHERE item_seq = ?`;
  connection.query(query, [item_seq], (error, results) => {
    if (error) {
      console.error('알약 상세보기 중 오류 발생:', error);
      return res.status(500).json({ error: '알약 상세보기 중 오류가 발생했습니다.' });
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

      // 사용자 번호가 없는 경우에는 히스토리 추가 없이 검색 결과만 반환
      return res.status(200).json({ 
        success: true, 
        message: '알약 검색이 완료되었습니다.', 
        itemList: itemList 
      });
    });
});

module.exports = router;