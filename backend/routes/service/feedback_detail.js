const express = require('express');
const router = express.Router();
const connection = require('../../db'); // 데이터베이스 모듈을 불러옵니다.
const isAuthenticated = require('../isAuthenticated');

router.get('/:feedback_num', isAuthenticated, (req, res) => {
    const feedback_num = req.params.feedback_num;
    connection.query('SELECT * FROM feedback WHERE feedback_num = ?', feedback_num, (error, model) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        } else {
            // 조회된 모델 정보를 user_detail.ejs 템플릿에 전달하여 렌더링
            res.render('cog_service/feedback_detail', { layout: 'layouts/main_layout', model: model, user: req.session.user });
        }
    });
});


// 고객 정보 삭제 라우터
router.delete('/:feedback_num', (req, res) => {
    const feedback_num = req.params.feedback_num;
    console.log(feedback_num)
    connection.query('DELETE FROM feedback WHERE feedback_num = ?', [feedback_num], (error, results) => {
        if (error) {
            console.error('피드백 삭제 오류:', error);
            res.status(500).send('서버 오류: 피드백 삭제 오류');
            return;
        }

        // 삭제된 피드백 정보 및 영향 받은 행 수를 클라이언트에게 반환합니다.
        res.json({ message: '피드백이 성공적으로 삭제되었습니다.', affectedRows: results.affectedRows });
    });
});

module.exports = router;


