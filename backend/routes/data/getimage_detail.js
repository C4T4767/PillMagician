const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const isAuthenticated = require('../isAuthenticated');

router.get('/:item_seq', isAuthenticated, (req, res) => {
    const item_seq = req.params.item_seq;
    const type = req.query.type;
    console.log(type)
    // 이미지 폴더의 경로 생성
    const folderPath = path.join(__dirname, '..', '..', '..', 'ai', 'aidata', type, item_seq);

    // 해당 경로에 있는 이미지 파일 목록 가져오기
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading image folder:', err);
            res.status(500).send('Error reading image folder');
            return;
        }

        // 이미지 파일 목록을 클라이언트에게 응답
        const imagePaths = files.map(file => `/aidata/${type}/${item_seq}/${file}`); // 이미지 파일의 전체 경로로 변환
        res.render('cog_data/getimage_detail', { layout: 'layouts/main_layout', user: req.session.user, imagePaths: imagePaths });
    });
});


// 이미지 업로드 라우터
router.post('/', (req, res) => {
    // 파일 저장을 위한 multer 설정
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // 업로드할 폴더 경로 설정
            const type = req.query.type;
            const item_seq = req.query.item_seq; // 요청 본문에서 item_seq 값을 가져옵니다.
            console.log(type, item_seq)
            const folderPath = path.join(__dirname, '..', '..', '..', 'ai', 'aidata', type, item_seq);
            cb(null, folderPath);
        },
        filename: function (req, file, cb) {
            // 업로드할 파일 이름 설정 (여기서는 파일 이름을 그대로 사용)
            cb(null, file.originalname);
        }
    });

    // multer 설정 적용
    const upload = multer({ storage: storage });

    // 파일 업로드 처리
    upload.array('files')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // multer 에러 처리
            console.error('Multer error:', err);
            return res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
        } else if (err) {
            // 기타 에러 처리
            console.error('Error:', err);
            return res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
        }

        // 업로드가 성공적으로 처리되었다는 응답을 클라이언트에게 보냅니다.
        res.json({ success: true, message: "파일이 성공적으로 업로드되었습니다." });
    });
});


router.delete('/', (req, res) => {
    console.log("a")
    const { imagePaths } = req.body;

    // 이미지 삭제 로직
    const deletedImages = [];
    imagePaths.forEach(imagePath => {
        try {
            const imagePathToDelete = path.join(__dirname, '..', '..', '..', 'ai', imagePath); // 파일 경로 생성
            fs.unlinkSync(imagePathToDelete);
            deletedImages.push(imagePathToDelete);
        } catch (error) {
            console.error('이미지 삭제 오류:', error);
        }
    });

    // 삭제된 이미지들을 응답으로 전송
    res.json({ deletedImages: deletedImages });
});


module.exports = router;
