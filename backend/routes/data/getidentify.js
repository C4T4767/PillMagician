const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    
    // csvupdate.json 파일 읽어오기
    fs.readFile('./data/identifyupdate.json', 'utf8', (err, data) => {
        if (err) {
            console.error('csvupdate.json 읽기 오류:', err);
            res.status(500).send('내부 서버 오류');
            return;
        }

        const parsedData = JSON.parse(data);
        const lastUpdate = parsedData.lastUpdate;
       
        const query = 'SELECT * FROM pill ';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('데이터베이스 조회 오류:', err);
                res.status(500).send('내부 서버 오류');
                return;
            }

             const pills = results.slice(1, 10)

             res.render('cog_data/getidentify', { 
                layout: 'layouts/main_layout', 
                user: req.session.user, 
                lastUpdate: lastUpdate, 
                pills: pills
            });

        });
    });

});


module.exports = router;
