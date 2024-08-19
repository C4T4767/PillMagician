const express = require('express');
const router = express.Router();
const connection = require('../../db');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');
const fs = require('fs');

router.get('/:pageNum', isAuthenticated, (req, res) => {
    const pageNum = req.params.pageNum;
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
    
    fs.readFile('./data/selectedModel.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading selectedModel.json:", err);
            log.writeToLogFile('json 파일을 불러오는 데 실패했습니다.');
            model_name="none"
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
                        res.render('cog_AI/management', { layout: 'layouts/main_layout', models: results, user: req.session.user, currentPage: pageNum, totalPages, target, keyword, selectedModel: model_name });
                    });
                }
            });
        } else {
            // JSON 형식의 데이터를 JavaScript 객체로 변환합니다.
            const selected_model_data = JSON.parse(data);
            const model_name = selected_model_data["model_name"];
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
                        res.render('cog_AI/management', { layout: 'layouts/main_layout', models: results, user: req.session.user, currentPage: pageNum, totalPages, target, keyword, selectedModel: model_name });
                    });
                }
            });
        }
    });
});

router.post('/', (req, res) => {
    const { email, password } = req.body;
    // 사용자 확인
    connection.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error('로그인 중 오류 발생:', err);
            res.status(500).json({ message: '로그인 중 오류 발생' });
            log.writeToLogFile('로그인 중 오류 발생');
        } else {
            if (results.length > 0) {
                const user = results[0];
                req.session.user = user; // 세션에 사용자 정보 저장
                // 사용자가 존재하면 성공 응답 반환
                res.status(200).json({ message: '로그인 성공', user });
            } else {
                // 사용자가 존재하지 않으면 실패 응답 반환
                res.status(401).json({ message: '유효하지 않은 사용자 이름 또는 비밀번호' });
                log.writeToLogFile('유효하지 않은 사용자 이름 또는 비밀번호');
            }
        }
    });
});

module.exports = router;
