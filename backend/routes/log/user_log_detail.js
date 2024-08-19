const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path'); // 파일 경로를 다루기 위한 모듈
const isAuthenticated = require('../isAuthenticated');

router.get('/:folder', isAuthenticated, (req, res) => {
    const folder = req.params.folder;
    const folderPath = path.join(__dirname, '../../log/User', folder); // 해당 폴더의 전체 경로
    console.log(folderPath)

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('폴더 읽기 오류:', err);
            res.status(500).send('폴더 읽기 오류');
            return;
        }

        // JSON 파일 찾기
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
        if (jsonFiles.length === 0) {
            res.status(404).send('JSON 파일을 찾을 수 없습니다.');
            return;
        }

        // 첫 번째 JSON 파일 읽기
        const jsonFilePath = path.join(folderPath, jsonFiles[0]);
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('JSON 파일 읽기 오류:', err);
                res.status(500).send('JSON 파일을 읽는 중 오류가 발생했습니다.');
                return;
            }

            const jsonData = JSON.parse(data);

            // 템플릿 렌더링 시에 folderPath와 JSON 데이터 전달
            res.render('cog_log/user_log_detail', { layout: 'layouts/main_layout', user: req.session.user, jsonData: jsonData, folderPath: folderPath });
        });
    });
});

module.exports = router;
