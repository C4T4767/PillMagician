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

// Function to clean the output from escape sequences
function cleanOutput(output) {
    // 정규식을 사용하여 이스케이프 시퀀스를 제거
    const ansiEscape = new RegExp(
        [
            '[\\u001B\\u009B][[\\]()#;?]*(?:',
            '(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
            '|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
        ].join('|'),
        'g'
    );
    return output.replace(ansiEscape, '');
}

router.post('/', isAuthenticated, (req, res) => {
    const io = req.app.get('socketio');
    const { name, model, model_type, optimizer, batch_size, epoch } = req.body;
    console.log("name=", name, "model=", model, "model_type=", model_type, "optimizer=", optimizer, "batch_size=", batch_size, "epoch=", epoch);

    if (!name || !epoch) {
        res.render('modal2', { message: '이름 또는 epoch가 없습니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
        log.writeToLogFile('이름이나 epoch 입력되지 않음');
        return;
    }

    if (isNaN(epoch)) {
        res.render('modal2', { message: 'Epoch는 숫자여야 합니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
        log.writeToLogFile('epoch 입력 오류');
        return;
    }

    connection.query(`SELECT * FROM models WHERE model_name = ?`, [name], (error, result) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            log.writetologfile(`Database query error: ${error.message}`);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        }

        if (result.length > 0) {
            res.render('modal2', { message: '중복된 이름입니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
            log.writeToLogFile('모델명 중복됨');
            return;
        }

        fs.access(log.subprocessFlagFilePath, fs.constants.F_OK, (err) => {
            if (!err) {
                res.render('modal2', { message: '이미 학습이 진행 중입니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
                log.writeToLogFile('학습이 이미 진행중임');
                return;
            }

            res.render('modal2', { message: '재학습을 시작합니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
            const data_dir = path.join(__dirname, `../../../ai/aidata`);
            const model_path = path.join(__dirname, `../../../ai/models/${model}/best.pt`);

            let pythonProcess;
            if (model_type === 'YOLOv8') {
                pythonProcess = spawn('python', ['../ai/retrain-yolov8.py', optimizer, batch_size, epoch, model_path, data_dir]);
            } else if (model_type === 'ResNet101') {
                pythonProcess = spawn('python', ['../ai/retrain-resnet101.py', optimizer, batch_size, epoch, model_path, data_dir]);
            } else {
                pythonProcess = spawn('python', ['../ai/retrain-mobilenetv3.py', optimizer, batch_size, epoch, model_path, data_dir]);
            }

            fs.writeFile(log.subprocessFlagFilePath, pythonProcess.pid.toString(), (err) => {
                if (err) {
                    console.error('서브프로세스 플래그 파일을 생성하는 도중 오류가 발생했습니다:', err);
                    log.writeToLogFile(`서브프로세스 플래그 파일 생성 오류: ${err.message}`);
                }

                let latestStderrData = '';
                let currentEpoch = 0;
                let totalEpochs = 1;
                pythonProcess.stderr.on('data', (data) => {
                    const cleanData = cleanOutput(data.toString());
                    console.error(`stderr: ${cleanData}`);
                    io.emit('retrainingData', cleanData);
                    buffer.push(cleanData);
                    latestStderrData = cleanData;

                    let epochMatches = cleanData.match(/Epoch (\d+)\/(\d+)/);
                    if (epochMatches) {
                        currentEpoch = parseInt(epochMatches[1]) - 1;
                        totalEpochs = parseInt(epochMatches[2]);
                    }

                    let progressMatches = cleanData.match(/\s+(\d+)\/(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+(\d+%)/);
                    if (progressMatches) {
                        currentEpoch = parseInt(progressMatches[1]) - 1;
                        totalEpochs = parseInt(progressMatches[2]);
                    }

                    if (cleanData.includes('Training complete!')) {
                        currentEpoch = totalEpochs;
                    }

                    if (buffer.length > 4) {
                        buffer.shift();
                    }
                    fs.writeFile('./data/retrainingData.txt', `current=${currentEpoch}\ntotal=${totalEpochs}`, (err) => {
                        if (err) throw err;
                    });
                });

                pythonProcess.stdout.on('data', (data) => {
                    const cleanData = cleanOutput(data.toString());
                    console.log(`stdout: ${cleanData}`);
                    io.emit('retrainingData', cleanData);
                    buffer.push(cleanData);

                    let epochMatches = cleanData.match(/Epoch (\d+)\/(\d+)/);
                    if (epochMatches) {
                        currentEpoch = parseInt(epochMatches[1]) - 1;
                        totalEpochs = parseInt(epochMatches[2]);
                    }

                    let progressMatches = cleanData.match(/\s+(\d+)\/(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+(\d+%)/);
                    if (progressMatches) {
                        currentEpoch = parseInt(progressMatches[1]) - 1;
                        totalEpochs = parseInt(progressMatches[2]);
                    }

                    if (cleanData.includes('Training complete!')) {
                        currentEpoch = totalEpochs;
                    }

                    if (buffer.length > 4) {
                        buffer.shift();
                    }
                    fs.writeFile('./data/retrainingData.txt', `current=${currentEpoch}\ntotal=${totalEpochs}`, (err) => {
                        if (err) throw err;
                    });

                    const f1Match = cleanData.match(/F1 score: (\d+\.\d+)/);
                    const accuracyMatch = cleanData.match(/Accuracy: (\d+\.\d+)/);
                    if (f1Match && accuracyMatch) {
                        const f1score = parseFloat(f1Match[1]);
                        const accuracy = parseFloat(accuracyMatch[1]);
                        console.log('Received F1 Score:', f1score);
                        console.log('Received Accuracy:', accuracy);
                        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        const newModel = {
                            model_name: name,
                            model_type: model_type,
                            optimizer: optimizer,
                            batch_size: batch_size,
                            epoch: epoch,
                            f1score: f1score,
                            accuracy: accuracy,
                            created_time: currentTime
                        };
                        connection.query(`INSERT INTO models SET ?`, newModel, (error, result) => {
                            if (error) {
                                console.error('데이터베이스 쿼리 오류:', error);
                                log.writetologfile(`데이터베이스 쿼리 오류: ${error.message}`);
                            }
                        });
                    }
                });

                pythonProcess.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                    fs.unlink(log.subprocessFlagFilePath, (err) => {
                        if (err) {
                            console.error('서브프로세스 플래그 파일을 삭제하는 도중 오류가 발생했습니다:', err);
                            log.writeToLogFile('알 수 없는 오류 발생');
                        }
                    });
                    if (code === 1) {
                        console.log(`학습 오류 발생: ${latestStderrData}`);
                        log.writeToLogFile(`학습 오류 발생: ${latestStderrData}`);
                    }
                    if (code === 0) {
                        const folderPath1 = path.join(__dirname, `../../../ai/models/${name}`);
                        const folderPath2 = path.join(__dirname, `../../../frontend/admin-web/public/models/${name}`);

                        fs.mkdir(folderPath1, { recursive: true }, (err) => {
                            if (err) {
                                console.error('폴더를 생성하는 도중 오류가 발생했습니다:', err);
                                res.status(500).send('서버 오류: 폴더를 생성하는 도중 오류가 발생했습니다.');
                                log.writeToLogFile(`폴더 생성 오류: ${err.message}`);
                                return;
                            }

                            let sourceBestFile;
                            if (model_type === 'YOLOv8') {
                                sourceBestFile = './runs/classify/train/weights/best.pt';
                            } else {
                                sourceBestFile = './best.pt';
                            }
                            const destinationBestFile = `${folderPath1}/best.pt`;
                            fs.rename(sourceBestFile, destinationBestFile, (err) => {
                                if (err) {
                                    console.error('best.pt 파일을 이동하는 도중 오류가 발생했습니다:', err);
                                    res.status(500).send('서버 오류: best.pt 파일을 이동하는 도중 오류가 발생했습니다.');
                                    log.writeToLogFile(`best.pt 파일 이동 오류: ${err.message}`);
                                    return;
                                }
                            });
                        });

                        fs.mkdir(folderPath2, { recursive: true }, (err) => {
                            if (err) {
                                console.error('폴더를 생성하는 도중 오류가 발생했습니다:', err);
                                res.status(500).send('서버 오류: 폴더를 생성하는 도중 오류가 발생했습니다.');
                                log.writeToLogFile(`폴더 생성 오류: ${err.message}`);
                                return;
                            }

                            const sourceRocFile = './roc_curve.png';
                            const destinationRocFile = `${folderPath2}/roc_curve.png`;
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
                    fsExtra.remove('./runss', (err) => {
                        if (err) {
                            return;
                        }
                    });
                    buffer.length = 0;
                    fs.unlink('./data/retrainingData.txt', (err) => {
                        if (err && err.code !== 'ENOENT') {
                        } else {
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;
