const express = require('express');
const router = express.Router();

const getidentify = require('./getidentify');
const getidentify_detail = require('./getidentify_detail');
const getidentify_process = require('./getidentify_process');
const getidentify_data_set = require('./getidentify_data_set');

router.use('/getidentify', getidentify);
router.use('/getidentify_detail/', getidentify_detail);
router.use('/getidentify_process', getidentify_process);
router.use('/getidentify_data_set', getidentify_data_set);

const getinformation = require('./getinformation');
const getinformation_detail = require('./getinformation_detail');
const getinformation_process = require('./getinformation_process');
const getinformation_data_set = require('./getinformation_data_set');

router.use('/getinformation', getinformation);
router.use('/getinformation_detail/', getinformation_detail);
router.use('/getinformation_process', getinformation_process);
router.use('/getinformation_data_set', getinformation_data_set);

const getimage = require('./getimage');
const getimage_detail = require('./getimage_detail');
const getimage_data_set = require('./getimage_data_set');
const getimage_folder = require('./getimage_folder');

router.use('/getimage', getimage);
router.use('/getimage_detail/', getimage_detail);
router.use('/getimage_data_set', getimage_data_set);
router.use('/getimage_folder', getimage_folder);

module.exports = router;


