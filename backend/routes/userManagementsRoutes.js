const express = require('express');
const session = require('express-session');
const router = express.Router();

const registerRouter = require('./userManagements/register')
const loginRouter = require('./userManagements/login')
const logoutRouter = require('./userManagements/logout')
const checkIdRouter = require('./userManagements/checkId')
const checkNicknameRouter = require('./userManagements/checkNickname')
const checkSessionRouter = require('./userManagements/checkSession')
const findIdRouter = require('./userManagements/findId')
const resetPasswordRouter = require('./userManagements/resetPassword')
const userInfoRouter = require('./userManagements/userInfo')
const userEditRouter = require('./userManagements/userEdit')
const userDeleteRouter = require('./userManagements/userDelete')

router.use('/register', registerRouter);
router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/checkId', checkIdRouter);
router.use('/checkNickname', checkNicknameRouter);
router.use('/checkSession', checkSessionRouter);
router.use('/findId', findIdRouter);
router.use('/resetPassword', resetPasswordRouter);
router.use('/userInfo', userInfoRouter);
router.use('/userEdit', userEditRouter);
router.use('/userDelete', userDeleteRouter);

module.exports = router;