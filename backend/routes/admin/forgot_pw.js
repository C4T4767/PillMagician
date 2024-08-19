const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('cog_account/forgot_password', { layout: false });
});

router.post('/', (req, res) => {
    // 클라이언트로부터 이메일 주소 가져오기
    const email = req.body.email;

    // 이메일 전송 처리
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'woojin6286@gmail.com', // 보내는 사람 이메일 주소
            pass: 'ekpp lrbj vsff ytzm' // 보내는 사람 이메일 비밀번호
        }
    });

    const mailOptions = {
        from: 'woojin6286@gmail.com',
        to: email,
        subject: '비밀번호 재설정 요청',
        text: '비밀번호를 재설정하려면 다음 링크를 클릭하세요: http://ceprj.gachon.ac.kr:60003/admin/resetPassword'
    };

    //세션에 이메일 잠깐 저장
    req.session.email = email;

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('이메일 전송 오류:', error);
            res.status(500).send('이메일 전송 오류가 발생했습니다.');
        } else {
            console.log('이메일 전송 성공:', info.response);
            res.status(200).send('이메일이 성공적으로 전송되었습니다.');
        }
    });
});

module.exports = router;
