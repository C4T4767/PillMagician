const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');

router.get('/:item_seq', isAuthenticated, (req, res) => {
    const item_seq = req.params.item_seq;

    // DB에서 해당 ITEM_SEQ에 해당하는 데이터 조회
    const query = `SELECT * FROM pill WHERE item_seq = ?`;
    connection.query(query, [item_seq], (error, results) => {
        if (error) {
            console.error('Error retrieving data from database:', error);
            res.status(500).send('Error retrieving data from database');
        } else {
            // 결과가 있으면 해당 결과를 뷰로 전달
            const data = results[0]; // 결과가 하나의 레코드일 것으로 가정
            res.render('cog_data/getidentify_detail', { layout: 'layouts/main_layout', user: req.session.user, data: data });
        }
    });
});

router.delete('/:item_seq', (req, res) => {
    const itemSeq = req.params.item_seq;
    const sql = 'DELETE FROM pill WHERE item_seq = ?';
    connection.query(sql, [itemSeq], (error, results, fields) => {
        if (error) {
            console.error('데이터 삭제 오류:', error);
            res.status(500).json({ message: '아이템 삭제 중 오류가 발생했습니다.' });
        } else {
            console.log('아이템이 성공적으로 삭제되었습니다.');
            res.status(200).json({ message: '아이템이 성공적으로 삭제되었습니다.' });
        }
    });
});

module.exports = router;
