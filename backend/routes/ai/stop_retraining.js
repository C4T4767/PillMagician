const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const router = express.Router();
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

router.post('/', isAuthenticated, (req, res) => {
    // 학습이 진행 중인지 확인하기 위해 플래그 파일이 있는지 확인합니다.
    fs.access(log.subprocessFlagFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 플래그 파일이 없으면 학습이 진행 중이지 않음을 의미합니다.
            return res.render('modal2', { message: '현재 실행중인 학습이 없습니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
        }

        // 플래그 파일에서 PID를 읽습니다.
        fs.readFile(log.subprocessFlagFilePath, 'utf8', (err, pid) => {
            if (err) {
                console.error('플래그 파일을 읽는 도중 오류가 발생했습니다:', err);
                return res.status(500).json({ message: '서버 오류: 플래그 파일을 읽을 수 없습니다.' });
            }

            // PID를 사용하여 서브프로세스를 종료합니다.
            exec(`kill ${pid}`, (err) => {
                if (err) {
                    console.error('학습 프로세스를 중지하는 도중 오류가 발생했습니다:', err);
                    return res.status(500).json({ message: '서버 오류: 학습 프로세스를 중지할 수 없습니다.' });
                }


                    // 학습 프로세스가 중지되었음을 클라이언트에 알립니다.
                    log.writeToLogFile('학습 프로세스가 중지되었습니다.');
                    res.render('modal2', { message: '학습이 중지되었습니다.', message2: '뒤로가기', redirectUrl: '/ai/retraining', layout: false });
                });
            });
        });
    });

module.exports = router;
