const express = require('express');
const fs = require('fs');
const router = express.Router();
const connection = require('../../db');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

router.post('/:page/:id', isAuthenticated, (req, res) => {
    connection.query('SELECT * FROM models WHERE model_id = ?', req.params.id, (error, model) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            // 로그를 파일에 기록
            log.writeToLogFile(`Database query error: ${error.message}`);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        }

        // 선택된 모델의 정보를 JSON 형식으로 저장
        const selectedModel = {
            model_name: model[0].model_name,
            model_type: model[0].model_type
        };

        // JSON 파일에 저장
        fs.writeFile('./data/selectedModel.json', JSON.stringify(selectedModel), (err) => {
            if (err) {
                console.error('파일 저장 오류:', err);
                // 로그를 파일에 기록
                writeToLogFile(`File saving error: ${err.message}`);
                res.status(500).send('서버 오류: 파일 저장 오류');
                return;
            }
            console.log('이미지 분류 모델이 변경되었습니다.');
            log.writeToLogFile('이미지 분류 모델이 변경되었습니다.');
            res.render('modal2', { message: '이미지 분류 모델이 변경되었습니다.', message2: '뒤로가기', redirectUrl: `/ai/detail/${req.params.page}/${req.params.id}`,  layout: false });

        });
    });
});

module.exports = router;