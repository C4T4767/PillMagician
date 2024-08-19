const express = require('express');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {

        res.render('cog_service/feedback_management', { layout: 'layouts/main_layout', user: req.session.user });
    
});

router.post('/', (req, res) => {
    const query = 'SELECT * FROM feedback';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 오류:', err);
            res.status(500).send('내부 서버 오류');
            return;
        }
        const feedback = results
        // 데이터를 JSON 형식으로 반환
        
        res.json({ feedbacks:feedback });
    })
});





module.exports = router;
