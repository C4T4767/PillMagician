const express = require('express');
const router = express.Router();
const fs = require('fs');
const isAuthenticated = require('../isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    let currentEpoch = 0;
    let totalEpochs = 1;
    fs.readFile('./data/trainingData.txt', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                const trainingData = "No training updates yet.";
                res.render('cog_AI/training', { layout: 'layouts/main_layout', user: req.session.user, training: trainingData, currentEpoch, totalEpochs });
            } else {
                console.error('Error reading training data text file:', err);
                res.status(500).send('Error reading training data');
            }
            return;
        }

        try {
            const lines = data.split('\n');

            lines.forEach(line => {
                if (line.startsWith('current=')) {
                    currentEpoch = parseInt(line.split('=')[1], 10);
                } else if (line.startsWith('total=')) {
                    totalEpochs = parseInt(line.split('=')[1], 10);
                }
            });

            // 로그를 통해 각 값이 제대로 파싱되었는지 확인
            console.log(`Parsed currentEpoch: ${currentEpoch}, totalEpochs: ${totalEpochs}`);

            const trainingDataString = lines.join('\n');
            res.render('cog_AI/training', { layout: 'layouts/main_layout', user: req.session.user, training: trainingDataString, currentEpoch, totalEpochs });
        } catch (parseError) {
            console.error('Error parsing training data text file:', parseError);
            const trainingData = "No training updates yet.";
            res.render('cog_AI/training', { layout: 'layouts/main_layout', user: req.session.user, training: trainingData, currentEpoch, totalEpochs });
        }
    });
});

module.exports = router;
