const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const connection = require('../../db');

const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

router.post('/:id',isAuthenticated, (req, res) => {
    connection.query('SELECT model_name FROM models WHERE model_id = ?', req.params.id, (error, result) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            log.writeToLogFile(`Database query error: ${error.message}`);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        }

        if (result.length === 0) {
            console.error('모델을 찾을 수 없습니다.');
            log.writeToLogFile('모델을 찾을 수 없습니다.');
            res.status(404).send('모델을 찾을 수 없습니다.');
            return;
        }

        const modelName = result[0].model_name;

        connection.query('DELETE FROM models WHERE model_id = ?', req.params.id, (error, model) => {
            if (error) {
                console.error('데이터베이스 쿼리 오류:', error);
                log.writeToLogFile(`Database query error: ${error.message}`);
                res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
                return;
            }

            const folderPath1 = path.join(__dirname, `../../../ai/models/${req.params.id}`);
            const folderPath2 = path.join(__dirname, `../../../frontend/admin-web/public/models/${req.params.id}`);

            const deleteFolderRecursive = function (folderPath) {
                if (fs.existsSync(folderPath)) {
                    fs.readdirSync(folderPath).forEach((file, index) => {
                        const curPath = path.join(folderPath, file);
                        if (fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(folderPath);
                }
            };

            deleteFolderRecursive(folderPath1);
            deleteFolderRecursive(folderPath2);
            res.render('modal2', { message: '삭제 완료.', message2: '뒤로가기', redirectUrl: '/ai/management/1',  layout: false });
            log.writeToLogFile(`모델 '${modelName}'이 삭제됐습니다.`);
        });
    });
});

module.exports = router;
