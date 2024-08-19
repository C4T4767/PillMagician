const express = require('express');
const router = express.Router();

const loginRouter = require('./login');
const logoutRouter = require('./logout');
const forgotPasswordRouter = require('./forgot_pw');
const resetPasswordRouter = require('./reset_pw');
const changePasswordRouter = require('./change_pw');

router.use('/login', loginRouter);
router.use('/logout', logoutRouter);
router.use('/forgotPassword', forgotPasswordRouter);
router.use('/resetPassword', resetPasswordRouter);
router.use('/changePassword', changePasswordRouter);

module.exports = router;
