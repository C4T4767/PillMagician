const express = require('express');
const router = express.Router();
const connection = require('../../db');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');
const fs = require('fs');

// 페이지 및 모델 ID를 동시에 처리하는 라우트
router.get('/:pageNum/:model_id', isAuthenticated, (req, res) => {
    const pageNum = req.params.pageNum;
    const modelId = req.params.model_id;

    const perPage = 5; // 한 페이지에 보여줄 데이터 개수
    const offset = (pageNum - 1) * perPage;

    // 검색어와 검색 대상이 모두 없는 경우에 "target" 변수를 null로 설정합니다.
    const target = req.query.target || null;
    const keyword = req.query.keyword || null;

    let query = 'SELECT * FROM models ORDER BY created_time DESC, model_id LIMIT ?, ?';
    let countQuery = 'SELECT COUNT(*) AS count FROM models';
    let queryParams = [offset, perPage];

    if (target && keyword) {
        // 검색 대상과 검색어가 주어진 경우
        query = `SELECT * FROM models WHERE ${target} LIKE ? ORDER BY created_time DESC, model_id LIMIT ?, ?`;
        countQuery = `SELECT COUNT(*) AS count FROM models WHERE ${target} LIKE ?`;
        queryParams = [`%${keyword}%`, offset, perPage];
    }

    connection.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('데이터베이스 쿼리 오류:', error);
            res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
            log.writeToLogFile('서버 오류: 데이터베이스 쿼리 오류');
            return;
        } else {
            connection.query(countQuery, queryParams[0] ? queryParams[0] : null, (err, countResult) => {
                if (err) {
                    console.error('데이터베이스 쿼리 오류:', err);
                    res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
                    log.writeToLogFile('서버 오류: 데이터베이스 쿼리 오류');
                    return;
                }
                const totalModels = countResult[0].count;
                const totalPages = Math.ceil(totalModels / perPage);

                // 모델 ID에 해당하는 모델 정보 가져오기
                connection.query('SELECT * FROM models WHERE model_id = ?', [modelId], (err, model) => {
                    if (err) {
                        console.error('데이터베이스 쿼리 오류:', err);
                        res.status(500).send('서버 오류: 데이터베이스 쿼리 오류');
                        log.writeToLogFile('서버 오류: 데이터베이스 쿼리 오류');
                        return;
                    } else {
                        fs.readFile('./data/selectedModel.json', 'utf8', (err, data) => {
                            if (err) {
                                console.error("Error reading selectedModel.json:", err);
                                log.writeToLogFile('json 파일을 불러오는 데 실패했습니다.');
                                res.render('cog_AI/detail', {
                                    layout: 'layouts/main_layout',
                                    models: results,
                                    model: model[0],
                                    user: req.session.user,
                                    currentPage: pageNum,
                                    totalPages,
                                    modelId,
                                    target,
                                    keyword,
                                    selectedModel: "none"
                                });
                            } else {
                                // JSON 형식의 데이터를 JavaScript 객체로 변환합니다.
                                const selected_model_data = JSON.parse(data);
                                const model_name = selected_model_data["model_name"];
                                console.log("model_name:",model_name)
                                // 조회된 모델 정보를 models.ejs 템플릿에 전달하여 렌더링
                                res.render('cog_AI/detail', {
                                    layout: 'layouts/main_layout',
                                    models: results,
                                    model: model[0],
                                    user: req.session.user,
                                    currentPage: pageNum,
                                    totalPages,
                                    modelId,
                                    target,
                                    keyword,
                                    selectedModel: model_name
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});

module.exports = router;
