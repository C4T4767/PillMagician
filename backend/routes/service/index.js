const express = require('express');
const router = express.Router();



const user_management = require('./user_management');
const user_detail = require('./user_detail');
const feedback_management = require('./feedback_management');
const feedback_detail = require('./feedback_detail');
const popup_management = require('./popup_management');

router.use('/user', user_management);
router.use('/detail/', user_detail);

router.use('/feedback', feedback_management);
router.use('/feedback_detail', feedback_detail);
router.use('/popup', popup_management);

module.exports = router;
