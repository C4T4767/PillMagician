const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const connection = require('../../db');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

router.post('/', isAuthenticated, (req, res) => {
    console.log(req.body);

    fs.readFile("./data/selectedModel.json", "utf8", (err, data) => {
        if (err) {
            console.error("Error reading model file:", err);
            res.status(500).send("Error reading model file");
            log.writeToLogFile('지정된 모델 파일이 없습니다.');
            return;
        }

        const selected_model_data = JSON.parse(data);
        const model_name = selected_model_data["model_name"];
        const model_type = selected_model_data["model_type"];
        console.log("model_name=", model_name, "model_type=", model_type);

        const model_path = path.join(__dirname, `../../../ai/models/${model_name}/best.pt`);
        const image_path = path.join(__dirname, `../../../frontend/admin-web/public/asset/img/${req.body.imageFileName}`);
        console.log("model_path=", model_path);
        console.log("image_path=", image_path);

        let pythonProcess;
        if (model_type === 'YOLOv8') {
            pythonProcess = spawn('python', ['../ai/classify-yolov8.py', model_path, image_path]);
        } else if(model_type ==='ResNet101') {
            pythonProcess = spawn('python', ['../ai/classify-resnet101.py', model_path, image_path]);
        } else if(model_type ==="MobileNetV3") {
            pythonProcess = spawn('python', ['../ai/classify-mobilenetv3.py', model_path, image_path]);
        } else{
            res.render('modal2', { message: '지정된 모델 파일이 없습니다.', message2: '뒤로가기', redirectUrl: '/ai/getimg',  layout: false });
            log.writeToLogFile('지정된 모델 파일이 없습니다.');
            return;
        }

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            log.writeToLogFile(`이미지 분류 오류 발생: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            log.writeToLogFile(`이미지 분류 오류 발생: ${data}`);
        });

        pythonProcess.on('exit', (code) => {
            fs.readFile("./data/results.json", "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading results file:", err);
                    res.render('modal2', { message: '이미지 분류에 실패했습니다.', message2: '뒤로가기', redirectUrl: '/ai/getimg',  layout: false });
                    log.writeToLogFile('이미지 분류에 실패했습니다.');
                    return;
                }
        
                try {
                    const results = JSON.parse(data);
                    var items = [];
                    var completedQueries = 0;
        
                    for (let index = 0; index < 5; index++) {
                        const className = results[`class_name${index + 1}`];
                        const sql = 'SELECT * FROM pill WHERE item_seq = ?';
        
                        connection.query(sql, className, (error, queryResults) => {
                            if (error) {
                                console.error('Error executing SQL query:', error);
                                log.writeToLogFile('SQL을 불러오는 데 실패했습니다.');
                                return res.status(500).send("Error executing SQL query");
                            }
        
                            if (queryResults.length > 0) {
                                const item = {
                                    item_name: queryResults[0].item_name,
                                    item_image: queryResults[0].item_image,
                                    probability: results[`probability${index + 1}`]
                                };
                                items.push(item);
                            }
        
                            completedQueries++;
                            if (completedQueries === 5) {
                                // 렌더링 성공 시 결과 파일 삭제
                                fs.unlink("./data/results.json", (err) => {
                                    if (err) {
                                        console.error("Error deleting results file:", err);
                                        log.writeToLogFile('결과 파일을 삭제하는데 실패했습니다.');
                                    } else {
                                        console.log("Results file deleted successfully.");
                                    }
                                });
                                res.render('cog_AI/results', { layout: 'layouts/main_layout', items: items, user: req.session.user });
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.render('modal2', { message: '현재 사용중인 모델을 찾을 수 없습니다.', message2: '뒤로가기', redirectUrl: '/ai/getimg',  layout: false });
                    log.writeToLogFile('현재 사용중인 모델을 찾을 수 없습니다.');
                }
            });
        });        
    });
});

module.exports = router;
