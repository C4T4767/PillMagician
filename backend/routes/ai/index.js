
const express = require('express');
const router = express.Router();
const model_training_process = require('./model_training_process');
const model_training = require('./model_training');

const model_retraining_process = require('./model_retraining_process');
const model_retraining = require('./model_retraining');


const model_management = require('./model_management');
const model_detail = require('./model_detail');


const model_test = require('./model_test');
const model_select = require('./model_select')
const getting_img = require('./getting_img');
const classify = require('./classify');
const model_delete = require('./model_delete');
const stop_training = require('./stop_training');
const stop_retraining = require('./stop_retraining');

router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
  });
router.use('/training_process', model_training_process);
router.use('/training', model_training);
router.use('/retraining_process', model_retraining_process);
router.use('/retraining', model_retraining);


router.use('/management', model_management);
router.use('/detail/', model_detail);

router.use('/select/', model_select);
router.use('/test', model_test);
router.use('/getimg', getting_img);
router.use('/classify', classify);
router.use('/model_delete', model_delete);
router.use('/stop_training', stop_training);
router.use('/stop_retraining', stop_retraining);
module.exports = router;
