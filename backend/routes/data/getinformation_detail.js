const fs = require('fs');

const fss = require('fs').promises; // 비동기 파일 시스템 모듈 사용

const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../../db'); // DB 연결을 위한 모듈
const isAuthenticated = require('../isAuthenticated');

router.get('/:item_seq', isAuthenticated, (req, res) => {
    // 요청된 ITEM_SEQ 가져오기
    const itemSeq = req.params.item_seq;
    // 해당 ITEM_SEQ를 기반으로 폴더 경로 생성
    const folderPath = path.join(__dirname, '..', '..', '..', 'frontend', 'pill_magician', 'assets', 'html', itemSeq); // 폴더의 상대 경로를 적절히 수정해주세요
    console.log(folderPath)
    // DB에서 ITEM_SEQ와 ITEM_NAME 가져오기
    connection.query('SELECT item_seq, item_name FROM pill WHERE item_seq = ?', [itemSeq], (error, results) => {
        if (error) {
            console.error('DB 쿼리 오류:', error);
            res.status(500).json({ error: '서버 오류: DB에서 데이터를 가져올 수 없습니다.' });
            return;
        }

        if (results.length === 0) {
            console.error('해당 ITEM_SEQ를 가진 데이터를 찾을 수 없습니다.');
            res.status(404).json({ error: '해당 ITEM_SEQ를 가진 데이터를 찾을 수 없습니다.' });
            return;
        }

        const itemData = results[0]; // 결과에서 첫 번째 데이터만 사용
        const itemName = itemData.item_name;
        const itemSeqFromDB = itemData.item_seq;

        // 폴더 내의 HTML 파일 목록 읽기
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('폴더 읽기 오류:', err);
                res.status(500).json({ error: '서버 오류: 폴더를 읽어올 수 없습니다.' });
                return;
            }

            // HTML 파일이 없는 경우 처리
            if (!files || files.length === 0) {
                console.error('폴더 내에 HTML 파일이 없습니다.');
                res.status(404).json({ error: 'HTML 파일이 없습니다.' });
                return;
            }

            // 모든 HTML 파일 가져오기
            const htmlFiles = [];
            files.forEach((fileName) => {
                const htmlFilePath = path.join(folderPath, fileName);
                const htmlFileContent = fs.readFileSync(htmlFilePath, 'utf8');
                htmlFiles.push(htmlFileContent);
            });

            res.render('cog_data/getinformation_detail', { layout: 'layouts/main_layout', user: req.session.user, htmlFiles: htmlFiles, itemName: itemName, itemSeq: itemSeqFromDB });
        });
    });
});


// DELETE 요청 처리
router.delete('/:item_seq', async (req, res) => {
    // 클라이언트로부터 전달된 아이템의 ID를 가져옵니다.
    const itemSeq = req.params.item_seq;
    
    // 해당 아이템의 HTML 파일이 들어있는 폴더의 경로
    const folderPath = path.join(__dirname, '..', '..', '..', 'frontend', 'pill_magician', 'assets', 'html', itemSeq);

    try {
        // 폴더 내의 파일 및 폴더 목록 가져오기
        const files = await fss.readdir(folderPath);

        // 폴더 내의 모든 파일 및 폴더 삭제
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            await fss.unlink(filePath); // 파일 삭제
        }

        // 폴더 삭제
        await fss.rmdir(folderPath);

        // 삭제 완료 후에 /data/getinformation 경로로 redirect
        // 삭제 완료 후에 클라이언트에게 성공 응답을 보냅니다.
        res.status(200).json({ message: '삭제되었습니다.' });
    } catch (err) {
        console.error('폴더 삭제 오류:', err);
        res.status(500).json({ error: '서버 오류: 폴더를 삭제할 수 없습니다.' });
    }
});


module.exports = router;
