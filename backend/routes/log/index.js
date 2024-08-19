const express = require('express');
const router = express.Router();

const adminLog = require('./admin_log');
const admin_log_data_set = require('./admin_log_data_set');
const admin_log_detail = require('./admin_log_detail');

const userLog = require('./user_log');
const user_log_data_set = require('./user_log_data_set');
const user_log_detail = require('./user_log_detail');




router.use('/admin_log', adminLog);
router.use('/admin_log_data_set', admin_log_data_set);
router.use('/admin_log_detail/', admin_log_detail);




router.use('/user_log', userLog);
router.use('/user_log_data_set', user_log_data_set);
router.use('/user_log_detail/', user_log_detail);

module.exports = router;


