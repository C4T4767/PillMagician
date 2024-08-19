const express = require('express');
const session = require('express-session');
const router = express.Router();

const imageRouter = require('./users/search/image')
const featureRouter = require('./users/search/feature')
const nameRouter = require('./users/search/name')
const detailRouter = require('./users/search/detail')
const doseHistoryRouter = require('./users/doseHistory')
const alarmRouter = require('./users/alarm')
const alarmDeleteRouter = require('./users/alarm/alarmDelete')
const itemRouter = require('./users/alarm/item')
const pageRouter = require('./users/alarm/page')
const pillDeleteRouter = require('./users/alarm/pillDelete')
const feedbackRouter = require('./users/feedback')
const bookmarkRouter = require('./users/myPage/bookmark')
const profileRouter = require('./users/myPage/profile')
// const historyRouter = require('./users/myPage/history')
const familyRouter = require('./users/myPage/family')

router.use('/search/image', imageRouter);
router.use('/search/feature', featureRouter);
router.use('/search/name', nameRouter);
router.use('/search/detail', detailRouter);
router.use('/doseHistory', doseHistoryRouter);
router.use('/alarm', alarmRouter);
router.use('/alarm/alarmDelete', alarmDeleteRouter);
router.use('/alarm/item', itemRouter);
router.use('/alarm/page', pageRouter);
router.use('/alarm/pillDelete', pillDeleteRouter);
router.use('/feedback', feedbackRouter);
router.use('/myPage/bookmark', bookmarkRouter);
router.use('/myPage/profile', profileRouter);
// router.use('/myPage/history', historyRouter);
router.use('/myPage/family', familyRouter);

module.exports = router;
// export default router;