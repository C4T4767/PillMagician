const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');


router.post('/', (req, res) => {
    const query = 'SELECT * FROM pill';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 오류:', err);
            res.status(500).send('내부 서버 오류');
            return;
        }
        const pill = results
        // 데이터를 JSON 형식으로 반환
        
        res.json({ pills:pill });
    })
});




module.exports = router;
