const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const async = require('async');
const connection = require('../../../db');
const path = require('path');
const multer = require('multer');
const log = require('../../../userlog');

// Multer 설정
const storage = multer.diskStorage({
    destination: async (req, file, cb) => { 
        cb(null, path.join(__dirname, '../../../../frontend/admin-web/public/asset/img/'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
    try {
        // req.body에 이미지 파일명이 있음
        let user_num = req.body.user_num;
        const image = req.file;

        if (!user_num) {
            // user_num이 null인 경우 랜덤한 숫자 생성
            user_num = Math.floor(Math.random() * 1000) + 1; // 1부터 1000 사이의 랜덤한 숫자 생성
        }

        // 선택된 모델 로드
        const selectedModelData = JSON.parse(fs.readFileSync("./data/selectedModel.json", "utf8"));
        const { model_name, model_type } = selectedModelData;

        console.log("model_name=", model_name, "model_type=", model_type);
        
        const modelPath = path.join(__dirname, `../../../../ai/models/${model_name}/best.pt`);
        const imagePath = path.join(__dirname, `../../../../frontend/admin-web/public/asset/img/${image.originalname}`);
        
        console.log("model_path=", modelPath);
        console.log("image_path=", imagePath);
        console.log("user_num=", user_num);
        log.writeToLogFile('알약 판별 진행',user_num);
        
        let pythonProcess;
        if (model_type === 'YOLOv8') {
            pythonProcess = spawn('python', ['../ai/app-classify-yolov8.py', modelPath, imagePath, user_num]);
        } else if(model_type ==='ResNet101') {
            pythonProcess = spawn('python', ['../ai/app-classify-resnet101.py', modelPath, imagePath, user_num]);
        } else{
            pythonProcess = spawn('python', ['../ai/app-classify-mobilenetv3.py', modelPath, imagePath, user_num]);
        }

        // Python 프로세스 이벤트 처리
        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            log.writeToLogFile(`이미지 분류 오류 발생: ${data}`,user_num);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            log.writeToLogFile(`이미지 분류 오류 발생: ${data}`,user_num);
        });

        // Python 프로세스 완료 시
        pythonProcess.on('exit', (code) => {
            // 결과 파일 읽기
            fs.readFile(`./data/${user_num}.json`, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading results file:", err);
                    res.status(500).send("Error reading results file");
                    log.writeToLogFile(`이미지 분류에 실패했습니다.`,user_num);
                    return;
                }

                try {
                    const results = JSON.parse(data);
                    const items = [];
                    async.times(5, (index, next) => {
                        const className = results[`class_name${index + 1}`];
                        const sql = 'SELECT * FROM pill WHERE item_seq = ?';
                        connection.query(sql, className, (error, queryResults) => {
                            if (error) {
                                console.error('Error executing SQL query:', error);
                                log.writeToLogFile(`SQL을 불러오는데 실패했습니다.`,user_num);
                                return next(error);
                            }
                            if (queryResults.length > 0) {
                                const item = {
                                    item_seq: queryResults[0].item_seq,
                                    item_name: queryResults[0].item_name,
                                    item_image: queryResults[0].item_image,
                                    entp_name: queryResults[0].entp_name,
                                    chart: queryResults[0].chart,
                                    drug_shape: queryResults[0].drug_shape,
                                    color_class1: queryResults[0].color_class1,
                                    color_class2: queryResults[0].color_class2,
                                    class_name: queryResults[0].class_name,
                                    print_front: queryResults[0].print_front,
                                    print_back: queryResults[0].print_back,
                                    probability: results[`probability${index + 1}`]
                                };
                                items.push(item);
                            }
                            next(null);
                        });
                    }, (err) => {
                        if (err) {
                            console.error('Error:', err);
                            return res.status(500).send("Error fetching data");
                        } else {
                            res.status(200).json({ 
                                success: true, 
                                message: '알약 검색이 완료되었습니다.', 
                                itemList: items
                              });

                            // 파일 삭제
                            fs.unlink(`./data/${user_num}.json`, (err) => {
                                if (err) {
                                    console.error(`Error deleting file: ${err}`);
                                    log.writeToLogFile(`파일 삭제 실패: ${err.message}`, user_num);
                                } else {
                                    log.writeToLogFile('분류 결과 파일 삭제 완료', user_num);
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    res.status(500).send("Error parsing JSON");
                    log.writeToLogFile(`현재 사용중인 모델을 찾을 수 없습니다.`,user_num);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
