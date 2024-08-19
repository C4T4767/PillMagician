const express = require('express');
const router = express.Router();
const connection = require('../../../db');

router.post('/', (req, res) => {
    const { item_name, entp_name, drug_shape, color_class1, color_class2, print_front, print_back } = req.body; // 요청에서 특징 정보 가져오기

  try {
      let queryString = 'SELECT * FROM pill WHERE 1=1';
      let queryParams = [];

      if (item_name) { 
          queryString += ` AND ITEM_NAME LIKE ?`;
          queryParams.push(`%${item_name}%`);
      }
      if (entp_name) { 
          queryString += ` AND ENTP_NAME LIKE ?`;
          queryParams.push(`%${entp_name}%`);
      }
      if (drug_shape) { 
          queryString += ` AND DRUG_SHAPE LIKE ?`;
          queryParams.push(`%${drug_shape}%`);
      }
      if (color_class1) { 
          queryString += ` AND COLOR_CLASS1 LIKE ?`;
          queryParams.push(`%${color_class1}%`);
      }
      if (color_class2) { 
          queryString += ` AND COLOR_CLASS2 LIKE ?`;
          queryParams.push(`%${color_class2}%`);
      }
      if (print_front || print_front === '') { 
          queryString += ` AND PRINT_FRONT LIKE ?`;
          queryParams.push(`%${print_front}%`);
      }
      if (print_back || print_back === '') { 
          queryString += ` AND PRINT_BACK LIKE ?`;
          queryParams.push(`%${print_back}%`);
      }

      connection.query(queryString, queryParams, (error, results) => {
          if (error) {
              console.error('특징으로 알약 검색 중 오류 발생:', error);
              return res.status(500).json({ success: false, message: '특징으로 알약을 검색하는 동안 오류가 발생했습니다.' });
          }else {
            const itemList = results.map(result => ({//알약 정보
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
            // console.log(itemList);
            // res.status(200).json(Future.value(itemList)); // FutureOr<Map<String, dynamic>>로 변경
            // res.status(200).json(itemList); // 검색 결과 응답
            res.status(200).json({ 
              success: true, 
              message: '알약 검색이 완료되었습니다.', 
              itemList: itemList 
            });
          }      });
  } catch (error) {
      console.error('특징으로 알약 검색 중 오류 발생:', error);
      res.status(500).json({ success: false, message: '특징으로 알약을 검색하는 동안 오류가 발생했습니다.' });
  }
});

module.exports = router;