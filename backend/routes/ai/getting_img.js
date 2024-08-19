const express = require('express');
const router = express.Router();
const fs = require('fs');
const connection = require('../../db');
const path = require('path');
const multer = require('multer');
const log = require('../../log');
const isAuthenticated = require('../isAuthenticated');

const uploadimg = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../../../frontend/admin-web/public/asset/img'));
        },
        filename: function (req, file, cb) {
            var currentTime = new Date().getTime();
            var ext = file.originalname.split('.').pop();
            var newFileName = currentTime + '.' + ext;
            cb(null, newFileName);
        }
    })
});

router.get('/', isAuthenticated, (req, res) => {
    fs.readFile('./data/selectedModel.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading selectedmodel.json:", err);
            log.writeToLogFile(`Error reading selectedmodel.json: ${err.message}`);
            return res.render('modal2', { message: '선택된 모델이 없습니다.', message2: '모델 관리', redirectUrl: '/ai/management', layout: false });
        }
        const selectedModel = JSON.parse(data);
        res.render('cog_AI/test', { layout: 'layouts/main_layout', selectedModel: selectedModel, user: req.session.user });
    });
});

router.post('/', uploadimg.single('uploadFile'), (req, res) => {
    let file = '/asset/img/' + req.file.filename;
    console.log(file)
    res.send({ imagePath: file });
});

module.exports = router;
