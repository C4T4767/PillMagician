const express = require('express');
const fs = require('fs');
const path = require('path');
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');
const router = express.Router();

router.post('/', isAuthenticated, (req, res) => {
  const logFilesPath = path.join(__dirname, '..', '..', 'log/Admin');

  // 디렉터리에서 HTML 파일 목록 읽어오기
  fs.readdir(logFilesPath, (err, folders) => {
    if (err) {
      console.error('폴더 목록을 읽어오는 중 오류 발생:', err);
      res.status(500).json({ error: '서버 오류: 폴더 목록을 읽어오지 못했습니다.' });
      return;
    }

    // 폴더 목록이 없는 경우 처리
    if (!folders || folders.length === 0) {
      console.error('디렉터리에서 폴더를 찾을 수 없습니다.');
      res.status(404).json({ error: '폴더가 없습니다.' });
      return;
    }

    // 모든 폴더에 대해 하위 폴더 및 파일 탐색
    const promises = folders.map(folder => {
      const folderPath = path.join(logFilesPath, folder);
      return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ folder, files });
        });
      });
    });

    // 모든 쿼리 실행 및 결과 응답
    Promise.all(promises)
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        console.error('오류 발생:', error);
        res.status(500).json({ error: '서버 오류: 오류가 발생했습니다.' });
      });
  });
});

module.exports = router;
