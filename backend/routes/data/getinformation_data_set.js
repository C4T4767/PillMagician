const express = require('express');
const fs = require('fs');
const path = require('path');
const connection = require('../../db');

const router = express.Router();

router.post('/', (req, res) => {
  const htmlFilesPath = path.join(__dirname, '..', '..', '..', 'frontend', 'pill_magician', 'assets', 'html');

  // 디렉터리에서 HTML 파일 목록 읽어오기
  fs.readdir(htmlFilesPath, (err, files) => {
    if (err) {
      console.error('HTML 파일 목록을 읽어오는 중 오류 발생:', err);
      res.status(500).json({ error: '서버 오류: HTML 파일 목록을 읽어오지 못했습니다.' });
      return;
    }

    // 파일 목록이 없는 경우 처리
    if (!files || files.length === 0) {
      console.error('디렉터리에서 HTML 파일을 찾을 수 없습니다.');
      res.status(404).json({ error: 'HTML 파일이 없습니다.' });
      return;
    }

    // 파일 이름과 pill 테이블의 name 열 비교하여 해당하는 데이터 가져오기
    const queries = files.map((file) => {
      const fileName = path.parse(file).name; // 파일 이름 추출
      const query = `SELECT * FROM pill WHERE item_seq = '${fileName}'`;
      return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          // 해당 파일의 경로와 함께 결과 반환
          resolve({ fileName, filePath: path.join(htmlFilesPath, file), results });
        });
      });
    });

    // 모든 쿼리 실행 및 결과 응답
    Promise.all(queries)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        console.error('쿼리 실행 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류: 쿼리 실행 중 오류가 발생했습니다.' });
      });
  });
});

module.exports = router;
