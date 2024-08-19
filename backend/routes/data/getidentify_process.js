const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');
const { spawn } = require('child_process');
const csv = require('csv-parser');

router.post('/', (req, res) => {
    
    const pythonProcess = spawn('python', ['../ai/getidentify.py']);
    console.log("csv파일 생성하는 코드 실행됨");
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    const file_path = './alyak.csv';

    pythonProcess.on('exit', (code) => {
        // Python 프로세스가 종료된 후에 CSV 파일을 읽어서 데이터베이스에 삽입 또는 업데이트
        console.log("csv파일 생성하는 코드 종료됨");
        const parser = csv();
        let totalRows = 0;
        let processedRows = 0; // 추가: 데이터 처리 완료된 행의 수

        parser.on('data', (row, index) => {
            // Skip the first row (header)
            if (index === 0) return;
            totalRows++;
            const itemSeq = parseInt(row.item_seq); // Convert to integer
            const itemName = row.item_name;
            const entpName = row.entp_name;
            const chart = row.chart;
            const itemImage = row.item_image;
            const drugShape = row.drug_shape;
            const colorClass1 = row.color_class1;
            const colorClass2 = row.color_class2;
            const className = row.class_name;
            const printFront = row.print_front;
            const printBack = row.print_back;

            // Check if any required field is null
            if (itemSeq && itemName && entpName && chart && itemImage) {
                const query = `INSERT INTO pill (item_seq, item_name, entp_name, chart, item_image, drug_shape, color_class1, color_class2, class_name, print_front, print_back)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                               ON DUPLICATE KEY UPDATE
                               item_name = VALUES(item_name),
                               entp_name = VALUES(entp_name),
                               chart = VALUES(chart),
                               item_image = VALUES(item_image),
                               drug_shape = VALUES(drug_shape),
                               color_class1 = VALUES(color_class1),
                               color_class2 = VALUES(color_class2),
                               class_name = VALUES(class_name),
                               print_front = VALUES(print_front),
                               print_back = VALUES(print_back)`;            
                connection.query(query, [itemSeq, itemName, entpName, chart, itemImage, drugShape, colorClass1, colorClass2, className, printFront, printBack], (err, results) => {
                    if (err) {
                        console.error(`Error inserting data for row ${index}:`, err);
                    } else {
                        console.log(`${itemSeq} Data inserted successfully`);
                        processedRows++; // 추가: 데이터 처리 완료된 행의 수 증가
                        if (processedRows === totalRows) { // 변경: 모든 데이터 처리 완료 후 조건문 실행
                            writeFileAndUpdate();
                        }
                    }
                });
            } else {
                console.error('One or more required fields are missing for row', index);
            }
        });

        parser.on('end', () => {
            console.log('CSV 파일 처리 완료');
        });
        
        fs.createReadStream(file_path).pipe(parser);

        // 파일 쓰기 및 업데이트 함수
        function writeFileAndUpdate() {
            const currentDate = new Date().toISOString().slice(0, 19);
            const csvUpdateData = { lastUpdate: currentDate };

            fs.writeFile('./data/identifyupdate.json', JSON.stringify(csvUpdateData), (err) => {
                if (err) {
                    console.error('csvupdate.json에 쓰기 오류:', err);
                    res.status(500).send('내부 서버 오류');
                    return;
                }
                console.log('csvupdate.json에 데이터가 성공적으로 저장되었습니다.');

                // CSV 파일 삭제
                fs.unlink(file_path, (err) => {
                    if (err) {
                        console.error('CSV 파일 삭제 오류:', err);
                        res.status(500).send('내부 서버 오류');
                        return;
                    }
                });
            });
        }
    });
});

module.exports = router;
