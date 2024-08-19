const express = require('express');
const router = express.Router();
const connection = require('../../db');
const fs = require('fs');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    let currentEpoch = 0;
    let totalEpochs = 1;
    // 모델 목록을 데이터베이스에서 가져오는 쿼리
    connection.query(`SELECT model_name, model_type FROM models`, (error, results) => {
        if (error) {
            // 에러 처리
            console.error('Error fetching models:', error);
            // 로그를 파일에 기록
            log.writeToLogFile(`Error fetching models: ${error.message}`);
            return res.status(500).send('Error fetching models');
        }

        // 모델 목록을 가져옴
        const models = results.map(result => ({
            name: result.model_name,
            type: result.model_type
        }));

        // 모델이 없는 경우 처리
        if (models.length === 0) {
            // 학습된 모델이 없음을 알리는 경고창 표시
            // 로그를 파일에 기록
            log.writeToLogFile('학습된 모델이 없습니다.');
            return res.render('modal2', { message: '학습된 모델이 없습니다!.', message2: '뒤로가기', redirectUrl: '/ai/training',  layout: false });
        }

        fs.readFile('./data/retrainingData.txt', 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // 텍스트 파일이 없는 경우
                    const retrainingData = "No retraining updates yet.";
                    res.render('cog_AI/retraining', { layout: 'layouts/main_layout', user: req.session.user,models: models, retraining: retrainingData, currentEpoch, totalEpochs });
                } else {
                    // 다른 오류인 경우
                    console.error('Error reading training data text file:', err);
                    res.status(500).send('Error reading training data');
                }
                return;
            }
            try {
                const lines = data.split('\n');
    
                lines.forEach(line => {
                    if (line.startsWith('current=')) {
                        currentEpoch = parseInt(line.split('=')[1], 10);
                    } else if (line.startsWith('total=')) {
                        totalEpochs = parseInt(line.split('=')[1], 10);
                    }
                });
                const retrainingDataString = epochDatas.join('\n');   
                // 렌더링
                res.render('cog_AI/retraining', { layout: 'layouts/main_layout', user: req.session.user,models:models, retraining: retrainingDataString, currentEpoch, totalEpochs  });
            } catch (parseError) {
                console.error('Error parsing retraining data text file:', parseError);
                const retrainingData = "No retraining updates yet.";
                res.render('cog_AI/retraining', { layout: 'layouts/main_layout', user: req.session.user, models:models, retraining: retrainingData, currentEpoch, totalEpochs  });
            }
        });
    });
});

module.exports = router;
