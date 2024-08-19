const fs = require('fs');
const path = require('path');

const subprocessFlagFilePath = './subprocess.flag';

fs.unlink(subprocessFlagFilePath, (err) => {
    if (err && err.code !== 'ENOENT') {
        console.error('서버 시작 시 플래그 파일을 제거하는 도중 오류가 발생했습니다:', err);
    } else {
        console.log('서버 시작 시 플래그 파일을 제거했습니다.');
    }
});

fs.unlink('./data/trainingData.txt', (err) => {
    if (err && err.code !== 'ENOENT') {
        console.error('서버 시작 시 텍스트 파일을 제거하는 도중 오류가 발생했습니다:', err);
    } 
});
fs.unlink('./data/retrainingData.txt', (err) => {
    if (err && err.code !== 'ENOENT') {
        console.error('서버 시작 시 텍스트 파일을 제거하는 도중 오류가 발생했습니다:', err);
    } 
});
let logBuffer = [];
writeToLogFile('서버가 시작되었습니다.')

function saveLogsToFile() {
    const today = new Date();
    const logDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const logFileName = `${logDate}.json`;
    const logFilePath = path.join('log/Admin', logDate, logFileName);

    if (!fs.existsSync(path.join('log/Admin', logDate))) {
        fs.mkdirSync(path.join('log/Admin', logDate), { recursive: true });
    }

    fs.readFile(logFilePath, 'utf8', (err, fileData) => {
        let logArray = [];

        if (!err) {
            try {
                logArray = JSON.parse(fileData);
            } catch (parseError) {
                console.error('로그 파일 파싱 중 오류 발생:', parseError);
            }
        }

        logArray.push(...logBuffer);
        logBuffer = [];

        fs.writeFile(logFilePath, JSON.stringify(logArray, null, 2), (err) => {
            if (err) {
                console.error('로그 파일에 쓰는 중 오류 발생:', err);
            } else {
            }
        });
    });
}

function addToLogBuffer(data) {
    const now = new Date();
    const koreanOffset = 18 * 60; // 한국은 UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // 현재 시간을 UTC로 변환
    const koreanTime = new Date(utc + (60000 * koreanOffset)); // 한국 시간으로 변환
    const logEntry = { timestamp: koreanTime.toISOString().replace(/T|Z/g, ' ').trim(), data: data };

    if (typeof data !== 'string') {
        logEntry.data = JSON.stringify(data);
    }

    logBuffer.push(logEntry);
}

setInterval(saveLogsToFile, 30000);

function writeToLogFile(data) {
    addToLogBuffer(data);
}

module.exports = {
    writeToLogFile,
    saveLogsToFile,
    addToLogBuffer,
    subprocessFlagFilePath
};
