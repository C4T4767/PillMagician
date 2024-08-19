const express = require('express');
const router = express.Router();
const connection = require('../../db'); // 데이터베이스 모듈을 불러옵니다.
const isAuthenticated = require('../isAuthenticated');

router.get('/:user_num', isAuthenticated, (req, res) => {
    const user_num = req.params.user_num;
    connection.query('SELECT * FROM user WHERE user_num = ?', user_num, (error, model) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        } else {
            // 조회된 모델 정보를 user_detail.ejs 템플릿에 전달하여 렌더링
            res.render('cog_service/user_detail', { layout: 'layouts/main_layout', model: model, user: req.session.user });
        }
    });
});


// 고객 정보 삭제 라우터
router.delete('/:user_num', (req, res) => {
    const user_num = req.params.user_num;
    connection.query('SELECT * FROM user', (error, results) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            return;
        } else {
            connection.query('DELETE FROM user WHERE user_num = ?', [user_num], (error, results, fields) => {
                if (error) throw error;
                // 삭제된 고객 정보를 클라이언트에게 반환합니다.
                res.json({ message: 'User deleted successfully', affectedRows: results.affectedRows });
            });
        }
    });
});

module.exports = router;
