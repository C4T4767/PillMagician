const express = require('express');
const router = express.Router();
const connection = require('../../db');
const path = require('path');
const multer = require('multer');
const log = require('../../userlog');

const publicDirectoryPath = path.resolve(__dirname, '../../../frontend/admin-web/public/asset/feedback');

// Multer 설정
const storage = multer.diskStorage({
    destination: async (req, file, cb) => { 
        cb(null, publicDirectoryPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => { 
    try {
        const { user_num, item_seq, feedback_rating, feedback_title, feedback_contents } = req.body;
        const imagePath = req.file ? `/asset/feedback/${req.file.filename}` : null;
        // console.log('req.file: ', req.file);
        // 데이터베이스에 피드백 저장
        const result = connection.query(
        'INSERT INTO feedback (user_num, item_seq, title, contents, rating, image_path) VALUES (?, ?, ?, ?, ?, ?)',
         [user_num, item_seq, feedback_title, feedback_contents, feedback_rating, imagePath] );
        
         log.writeToLogFile('피드백 작성', user_num);
        res.status(200).json({ success: true, message: '피드백이 정상적으로 저장되었습니다.' });
    } catch (error) {
      console.error('피드백 작성 중 오류 발생:', error);
      res.status(500).json({ success: false, message: '피드백 작성 중 오류가 발생했습니다.' });
    }
  });

module.exports = router;