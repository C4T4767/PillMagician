const express = require('express');
const fs = require('fs');
const fsExtra = require('fs-extra');
const { spawn } = require('child_process');
const router = express.Router();
const moment = require('moment');
const connection = require('../../db');
const path = require('path');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

const buffer = [];

// Now use socket.io in your routes file
router.post('/', isAuthenticated, (req, res) => {
    const io = req.app.get('socketio');
    console.log(log.subprocessFlagFilePath);
    const { name, model_type, optimizer, batch_size, epoch } = req.body;
    console.log(name, model_type, optimizer, batch_size, epoch);

    // 이름이나 epoch가 null이면 오류 메시지를 표시하고 이전 페이지로 리디렉션
    if (!name || !epoch) {
        res.render('modal2', { message: '이름 또는 epoch가 없습니다.', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
        // 로그를 파일에 기록
        log.writeToLogFile('이름 또는 epoch가 없습니다.');
        return;
    }

    if (isNaN(epoch)) {
        res.render('modal2', { message: 'Epoch는 숫자여야 합니다.', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
        // 로그를 파일에 기록
        log.writeToLogFile('Epoch가 숫자가 아닙니다.');
        return;
    }

    connection.query(`SELECT * FROM models WHERE model_name = ?`, [name], (error, result) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            // 로그를 파일에 기록
            log.writeToLogFile(`Database query error: ${error.message}`);
            res.render('modal2', { message: '서버 오류: 데이터베이스 쿼리 오류', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
            return;
        }

        if (result.length > 0) {
            res.render('modal2', { message: '중복된 이름입니다.', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
            log.writeToLogFile(`모델명 중복됨`);
            return;
        }

        // 서브프로세스 플래그 파일이 이미 존재하는지 확인
        fs.access(log.subprocessFlagFilePath, fs.constants.F_OK, (err) => {
            if (!err) {
                // 플래그 파일이 이미 존재하는 경우 경고 메시지를 표시하고 이전 페이지로 리디렉션
                res.render('modal2', { message: '이미 학습이 진행 중입니다.', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
                // 로그를 파일에 기록
                log.writeToLogFile('이미 학습이 진행 중입니다.');
                return;
            }

            const data_dir = path.join(__dirname, `../../../ai/aidata`);

            // Python 파일 실행
            let pythonProcess;
            if (model_type === 'YOLOv8') {
                pythonProcess = spawn('python', ['../ai/train-yolov8.py', optimizer, batch_size, epoch, data_dir]);
            } else if (model_type === 'ResNet101') {
                pythonProcess = spawn('python', ['../ai/train-resnet101.py', optimizer, batch_size, epoch, data_dir]);
            } else {
                pythonProcess = spawn('python', ['../ai/train-mobilenetv3.py', optimizer, batch_size, epoch, data_dir]);
            }

            // 서브프로세스 플래그 파일 생성
            fs.writeFile(log.subprocessFlagFilePath, pythonProcess.pid.toString(), (err) => {
                if (err) {
                    console.error('서브프로세스 플래그 파일을 생성하는 도중 오류가 발생했습니다:', err);
                    log.writeToLogFile(`서브프로세스 플래그 파일 생성 오류: ${err.message}`);
                }

                res.render('modal2', { message: '학습을 시작합니다.', message2: '뒤로가기', redirectUrl: '/ai/training', layout: false });
                log.writeToLogFile(`학습을 시작합니다. name: ${name}, model_type: ${model_type}, optimizer: ${optimizer}, batch_size: ${batch_size}, epoch: ${epoch}`);

                // 로그를 파일에 기록
                log.writeToLogFile(`학습을 시작합니다. name:${name}, model_type:${model_type}, optimizer:${optimizer}, batch_size:${batch_size}, epoch:${epoch}`);

                let latestStderrData = '';
                let currentEpoch = 0;
                let totalEpochs = 1;
                pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                    io.emit('trainingData', data.toString());
                    // 새 데이터를 버퍼에 추가
                    buffer.push(data.toString());
                    latestStderrData = data.toString();
                    let epochMatches = data.toString().match(/Epoch (\d+)\/(\d+)/);
                    if (epochMatches) {
                        currentEpoch = parseInt(epochMatches[1]) - 1;
                        totalEpochs = parseInt(epochMatches[2]);
                    }

                    // 학습 진행 상황 출력 라인인 경우
                    let progressMatches = data.toString().match(/\s+(\d+)\/(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+(\d+%)/);
                    if (progressMatches) {
                        currentEpoch = parseInt(progressMatches[1]) - 1;
                        totalEpochs = parseInt(progressMatches[2]);
                    }

                    // Training complete!가 출력되면 currentEpoch를 totalEpochs의 값으로 설정
                    if (data.toString().includes('Training complete!')) {
                        currentEpoch = totalEpochs;
                    }
                    // 버퍼의 길이가 4 이상이 되면 첫 번째 데이터 삭제
                    if (buffer.length > 4) {
                        buffer.shift(); // 첫 번째 요소 삭제
                    }
                    fs.writeFile('./data/trainingData.txt', `current=${currentEpoch}\ntotal=${totalEpochs}`, (err) => {
                        if (err) throw err;
                    });                    
                });

                pythonProcess.stdout.on('data', (data) => {
                    // Python 프로세스의 출력을 콘솔에 표시
                    // 새 데이터를 버퍼에 추가
                    buffer.push(data.toString());
                    let epochMatches = data.toString().match(/Epoch (\d+)\/(\d+)/);
                    if (epochMatches) {
                        currentEpoch = parseInt(epochMatches[1]) - 1;
                        totalEpochs = parseInt(epochMatches[2]);
                    }

                    // 학습 진행 상황 출력 라인인 경우
                    let progressMatches = data.toString().match(/\s+(\d+)\/(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+(\d+%)/);
                    if (progressMatches) {
                        currentEpoch = parseInt(progressMatches[1]) - 1;
                        totalEpochs = parseInt(progressMatches[2]);
                    }

                    // Training complete!가 출력되면 currentEpoch를 totalEpochs의 값으로 설정
                    if (data.toString().includes('Training complete!')) {
                        currentEpoch = totalEpochs;
                    }
                    // 버퍼의 길이가 4 이상이 되면 첫 번째 데이터 삭제
                    if (buffer.length > 4) {
                        buffer.shift(); // 첫 번째 요소 삭제
                    }
                    fs.writeFile('./data/trainingData.txt', `current=${currentEpoch}\ntotal=${totalEpochs}`, (err) => {
                        if (err) throw err;
                    });
                    
                    
                    // 클라이언트로 stdout 데이터를 전송
                    io.emit('trainingData', data.toString());

                    // F1 점수 추출
                    const f1Match = data.toString().match(/F1 score: (\d+\.\d+)/);
                    const accuracyMatch = data.toString().match(/Accuracy: (\d+\.\d+)/); // 정확도를 추출하기 위한 정규식
                    if (f1Match && accuracyMatch) {
                        const f1score = parseFloat(f1Match[1]);
                        const accuracy = parseFloat(accuracyMatch[1]); // 정확도 추출
                        console.log('Received F1 Score:', f1score);
                        console.log('Received Accuracy:', accuracy); // 정확도 출력
                        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        const newModel = {
                            model_name: name,
                            model_type: model_type,
                            optimizer: optimizer,
                            batch_size: batch_size,
                            epoch: epoch,
                            f1score: f1score,
                            accuracy: accuracy, // 정확도 추가
                            created_time: currentTime
                        };
                        connection.query(`INSERT INTO models SET ?`, newModel, (error, result) => {
                            if (error) {
                                console.error('데이터베이스 쿼리 오류:', error);
                                // 에러 처리
                                // 로그를 파일에 기록
                                log.writeToLogFile(`데이터베이스 쿼리 오류: ${error.message}`);
                            }
                        });
                    }
                });

                pythonProcess.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                    fs.unlink(log.subprocessFlagFilePath, (err) => {
                        if (err) {
                            console.error('서브프로세스 플래그 파일을 삭제하는 도중 오류가 발생했습니다:', err);
                            // 에러 처리
                            // 로그를 파일에 기록
                            log.writeToLogFile(`서브프로세스 플래그 파일 삭제 오류: ${err.message}`);
                        }
                    });
                    if (code === 1) {
                        console.log(`학습 오류 발생: ${latestStderrData}`);
                        log.writeToLogFile(`학습 오류 발생: ${latestStderrData}`);
                    }
                    if (code === 0) {
                        // 클라이언트에게 알림을 포함한 페이지를 전송
                        log.writeToLogFile(`학습이 완료되었습니다. 모델명: ${name}`);
                        const folderPath1 = path.join(__dirname, `../../../ai/models/${name}`);
                        const folderPath2 = path.join(__dirname, `../../../frontend/admin-web/public/models/${name}`);

                        // 폴더1 생성 및 best.pt 파일 이동
                        fs.mkdir(folderPath1, { recursive: true }, (err) => {
                            if (err) {
                                console.error('폴더를 생성하는 도중 오류가 발생했습니다:', err);
                                res.status(500).send('서버 오류: 폴더를 생성하는 도중 오류가 발생했습니다.');
                                log.writeToLogFile(`폴더 생성 오류: ${err.message}`);
                                return;
                            }

                            // best.pt 파일 이동
                            let sourceBestFile;
                            if (model_type === 'YOLOv8') {
                                sourceBestFile = './runs/classify/train/weights/best.pt'; // best.pt 이동할 파일 경로
                            } else {
                                sourceBestFile = './best.pt'; // best.pt 이동할 파일 경로
                            }
                            const destinationBestFile = `${folderPath1}/best.pt`; // 이동한 후 best.pt 파일 경로
                            fs.rename(sourceBestFile, destinationBestFile, (err) => {
                                if (err) {
                                    console.error('best.pt 파일을 이동하는 도중 오류가 발생했습니다:', err);
                                    res.status(500).send('서버 오류: best.pt 파일을 이동하는 도중 오류가 발생했습니다.');
                                    log.writeToLogFile(`best.pt 파일 이동 오류: ${err.message}`);
                                    return;
                                }
                            });
                        });

                        // 폴더2 생성 및 roc_curve.png 파일 이동
                        fs.mkdir(folderPath2, { recursive: true }, (err) => {
                            if (err) {
                                console.error('폴더를 생성하는 도중 오류가 발생했습니다:', err);
                                res.status(500).send('서버 오류: 폴더를 생성하는 도중 오류가 발생했습니다.');
                                log.writeToLogFile(`폴더 생성 오류: ${err.message}`);
                                return;
                            }

                            // roc_curve.png 파일 이동
                            const sourceRocFile = './roc_curve.png';
                            const destinationRocFile = `${folderPath2}/roc_curve.png`; // 이동한 후 roc_curve.png 파일 경로
                            fs.rename(sourceRocFile, destinationRocFile, (err) => {
                                if (err) {
                                    console.error('roc_curve.png 파일을 이동하는 도중 오류가 발생했습니다:', err);
                                    res.status(500).send('서버 오류: roc_curve.png 파일을 이동하는 도중 오류가 발생했습니다.');
                                    log.writeToLogFile(`roc_curve.png 파일 이동 오류: ${err.message}`);
                                    return;
                                }
                            });
                        });
                    }
                    fsExtra.remove('./runs', (err) => {
                        if (err) {
                            console.error('runs 폴더를 삭제하는 도중 오류가 발생했습니다:', err);
                            // 에러 처리
                            // 로그를 파일에 기록
                            log.writeToLogFile(`runs 폴더 삭제 오류: ${err.message}`);
                            return;
                        }
                        // 로그를 파일에 기록
                    });
                    buffer.length = 0;
                    fs.unlink('./data/trainingData.txt', (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error('trainingData.txt 파일을 삭제하는 도중 오류가 발생했습니다:', err);
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;
