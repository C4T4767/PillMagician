// authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // 다음 미들웨어로 제어를 전달합니다.
    } else {
        // 클라이언트에게 모달을 보여줍니다.
        res.render('modal', { message: '권한이 없습니다. 로그인하고 이용해주십시오', redirectUrl: '/admin/login', layout: false });
    }
}

module.exports = isAuthenticated;
