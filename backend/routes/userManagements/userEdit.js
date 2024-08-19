const express = require('express');
const router = express.Router();
const connection = require('../../db');
const { hash, compare } = require('bcrypt');
const sessionConfig = require('../../sessionConfig');
const log = require('../../userlog');

router.use(sessionConfig);

router.put('/', async (req, res) => {
    const { user_num, user_name, user_nickname, user_birth,
        current_password, new_password, user_email, user_phone } = req.body;

    // console.log('req.body: ', req.body);

    try {
        // 사용자 정보 업데이트를 위한 필드와 값을 저장할 배열
        const updateFields = [];
        const updateValues = [];

        // 입력된 필드가 있는 경우에만 해당 필드와 값을 배열에 추가
        if (user_name) {
            updateFields.push('name = ?');
            updateValues.push(user_name);
        }
        if (user_nickname) {
            updateFields.push('nickname = ?');
            updateValues.push(user_nickname);
        }
        if (user_birth) {
            updateFields.push('birth = ?');
            updateValues.push(user_birth);
        }
        if (user_email) {
            updateFields.push('email = ?');
            updateValues.push(user_email);
        }
        if (user_phone) {
            updateFields.push('phone = ?');
            updateValues.push(user_phone);
        }

        // 비밀번호 변경이 요청된 경우
        if (current_password && new_password) {
            // 현재 비밀번호와 저장된 해시된 비밀번호 비교
            connection.query('SELECT password FROM user WHERE user_num = ?', [user_num], async (error, results) => {
                if (error) {
                    console.error('비밀번호 확인 중 오류 발생:', error);
                    return res.status(500).json({ success: false, message: '비밀번호 확인 중 오류가 발생했습니다.' });
                }
                if (results.length === 0) {
                    return res.status(405).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
                }
                const hashedPassword = results[0].password;
                const passwordMatch = await compare(current_password, hashedPassword);
                if (!passwordMatch) {
                    return res.status(401).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
                }
                // 현재 비밀번호가 일치하는 경우 새로운 비밀번호를 해싱하여 업데이트
                const saltRounds = 10;
                const newHashedPassword = await hash(new_password, saltRounds);
                updateFields.push('password = ?');
                updateValues.push(newHashedPassword);

                // 사용자 정보 업데이트
                updateUser();
            });
        } else {
            // 비밀번호 변경이 요청되지 않은 경우 바로 사용자 정보 업데이트
            updateUser();
        }

        // 사용자 정보 업데이트 함수
        function updateUser() {
            // 사용자 정보 업데이트
            if (updateFields.length > 0) {
                updateValues.push(user_num);
                const updateQuery = `UPDATE user SET ${updateFields.join(', ')} WHERE user_num = ?`;

                connection.query(updateQuery, updateValues, (error, results) => {
                    if (error) {
                        console.error('개인정보 수정 중 오류 발생:', error);
                        log.writeToLogFile('개인정보 수정 중 오류', user_num);
                        return res.status(500).json({ success: false, message: '개인정보 수정 중 오류가 발생했습니다.' });
                    }
                    if (results.affectedRows > 0) {
                        log.writeToLogFile('개인정보 수정', user_num);
                        res.status(200).json({ success: true, message: '개인정보가 성공적으로 수정되었습니다.' });
                    } else {
                        res.status(400).json({ success: false, message: '수정된 데이터가 없습니다.' });
                    }
                });
            } else {
                res.status(400).json({ success: false, message: '수정할 필드가 제공되지 않았습니다.' });
            }
        }
    } catch (error) {
        console.error('오류 발생:', error);
        log.writeToLogFile('개인정보 수정 중 오류', user_num);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
