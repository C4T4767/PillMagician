const fs = require('fs');
const path = require('path');
let userlogBuffer = [];
function saveLogsToFile() {
    const today = new Date();
    const logDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const logFileName = `${logDate}.json`;
    const logFilePath = path.join('log/User', logDate, logFileName);

    if (!fs.existsSync(path.join('log/User', logDate))) {
        fs.mkdirSync(path.join('log/User', logDate), { recursive: true });
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

        logArray.push(...userlogBuffer);
        userlogBuffer = [];

        fs.writeFile(logFilePath, JSON.stringify(logArray, null, 2), (err) => {
            if (err) {
                console.error('로그 파일에 쓰는 중 오류 발생:', err);
            } else {
            }
        });
    });
}

function addToLogBuffer(data, logUserId) {
    const now = new Date();
    const koreanOffset = 18 * 60; // 한국은 UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // 현재 시간을 UTC로 변환
    const koreanTime = new Date(utc + (60000 * koreanOffset)); // 한국 시간으로 변환
    const logEntry = { timestamp: koreanTime.toISOString().replace(/T|Z/g, ' ').trim(), userId: logUserId, data: data };

    if (typeof data !== 'string') {
        logEntry.data = JSON.stringify(data);
    }

    userlogBuffer.push(logEntry);
}

setInterval(saveLogsToFile, 30000);

function writeToLogFile(data, logUserId) {
    addToLogBuffer(data, logUserId);
}

module.exports = {
    writeToLogFile,
    saveLogsToFile,
    addToLogBuffer,
};
