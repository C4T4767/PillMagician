const express = require('express');
const router = express.Router();
const connection = require('../../db');
const nodemailer = require('nodemailer');

// router.get('/', (req, res) => {
//     res.render(''); //비밀번호 찾기 화면
//   });

  router.post('/', async (req, res) => { // 아이디 이메일 인증 비번 재설정
    const { id, email } = req.body;
  
    // 아이디와 이메일이 일치하는지 확인
    connection.query('SELECT * FROM user WHERE id = ? AND email = ?', [id, email], async (error, results) => {
      if (error) {
          console.error('비밀번호 찾기 중 오류 발생:', error);
          return res.status(500).json({ success: false, message: '비밀번호 찾기 중 오류가 발생했습니다.' });
      } else {
          if (results.length === 0) {
              return res.status(404).json({ success: false, message: '일치하는 사용자가 없습니다.' });
          } else {
            // 임시 비밀번호 생성 (8자리)
            const temporaryPassword = Math.random().toString(36).slice(-8); 

            // 임시 비밀번호를 데이터베이스에 업데이트
            connection.query('UPDATE user SET password = ? WHERE id = ?', [temporaryPassword, id], async (error, updateResult) => {
              if (error) {
                  console.error('비밀번호 업데이트 중 오류 발생:', error);
                  return res.status(500).json({ success: false, message: '비밀번호 업데이트 중 오류가 발생했습니다.' });
              }

              // 이메일 전송을 위한 설정
              const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                      user: 'pillMagician@gmail.com', // Gmail 주소와 암호 입력
                      pass: 'fhrt ybac uzej yczf'
                  }
              });

              // 이메일 전송 옵션 설정
              const mailOptions = {
                  from: 'pillmagician@gmail.com', // 발신자 이메일 주소
                  to: email, // 수신자 이메일 주소
                  subject: '비밀번호 재설정 요청', // 이메일 제목
                  text: `임시 비밀번호: ${temporaryPassword}` // 이메일 본문
              };

              try {
                  // 이메일 전송
                  await transporter.sendMail(mailOptions);

                  // 비밀번호 재설정 화면? 로그인 화면
                //   res.redirect('/');
                } catch (error) {
                    console.error('이메일 전송 중 오류 발생:', error);
                    return res.status(500).json({ success: false, message: '이메일 전송 중 오류가 발생했습니다.' });
                }
            });
        }
    }
});
});

module.exports = router;
// export default findPassword;