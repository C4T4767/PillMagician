const express = require('express');
const fs = require('fs');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');


router.get('/', isAuthenticated,(req, res) => {

    // selectedmodel.json 파일을 읽어와서 데이터를 불러옵니다.
    fs.readFile('./data/selectedModel.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading selectedmodel.json:", err);
            log.writeToLogFile(`json 파일을 불러오는데 실패했습니다.`);
            res.render('modal2', { message: '선택된 모델이 없습니다 ', message2: '뒤로가기', redirectUrl: '/ai/management', layout: false });
        } else {
            // JSON 형식의 데이터를 JavaScript 객체로 변환합니다.
            const selectedModel = JSON.parse(data);

            res.render('cog_AI/test', { layout: 'layouts/main_layout', selectedModel: selectedModel, user: req.session.user });
        }
    });
});


module.exports = router;
