const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    
    // csvupdate.json 파일 읽어오기
    fs.readFile('./data/informationupdate.json', 'utf8', (err, data) => {
        if (err) {
            console.error('csvupdate.json 읽기 오류:', err);
            res.status(500).send('내부 서버 오류');
            return;
        }

        const parsedData = JSON.parse(data);
        const lastUpdate = parsedData.lastUpdate;
       
        res.render('cog_data/getinformation', { layout: 'layouts/main_layout', user: req.session.user, lastUpdate: lastUpdate });
        // home을 렌더링하고 결과를 전송
      
    });
});

module.exports = router;
