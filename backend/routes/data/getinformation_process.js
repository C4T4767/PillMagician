const fs = require('fs');
const express = require('express');
const router = express.Router();
const connection = require('../../db');
const { spawn } = require('child_process');
const path = require('path');
router.post('/', (req, res) => {
  const io = req.app.get('socketio');
  connection.query('SELECT item_seq FROM pill', function (error, results, fields) {
    if (error) {
      console.error('Database query error:', error);
      res.status(500).send('Internal server error');
      return;
    }

    const totalItems = results.length;
    let processedItems = 0;

    results.forEach(result => {
      const item_seq = result.item_seq;
      const file_path = path.join(__dirname, '../../../frontend/pill_magician/assets/html/');
      const pythonProcess = spawn('python', ['../ai/getinformation.py', item_seq, file_path]);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        processedItems++;
        console.log(`Processed ${processedItems}/${totalItems} items`); // 여기서 진행 상황을 콘솔에 출력
        io.emit('trainingUpdate', { processedItems, totalItems });
        if (processedItems === totalItems) {
          writeFileAndUpdate(res);
        }
      });
    });
  });
});

function writeFileAndUpdate(res) {
  const currentDate = new Date().toISOString().slice(0, 19);
  const csvUpdateData = { lastUpdate: currentDate };

  fs.writeFile('./data/informationupdate.json', JSON.stringify(csvUpdateData), (err) => {
    if (err) {
      console.error('Error writing to informationupdate.json:', err);
      res.status(500).send('Internal server error');
      return;
    }
    res.json({ success: true, message: 'Data successfully saved' });
    console.log('Data successfully saved to informationupdate.json.');
  });
}

module.exports = router;
