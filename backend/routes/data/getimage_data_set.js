const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const connection = require('../../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const htmlFilesPath = path.join(__dirname, '..', '..', '..', 'ai', 'aidata');
  const testFolder = path.join(htmlFilesPath, 'test');
  const trainFolder = path.join(htmlFilesPath, 'train');
  const valFolder = path.join(htmlFilesPath, 'val'); // 추가된 부분

  try {
    // Get folder names and subfolder counts for test, train, and val folders
    const [testFolders, testSubfolderCounts] = await getFolderInfo(testFolder);
    const [trainFolders, trainSubfolderCounts] = await getFolderInfo(trainFolder);
    const [valFolders, valSubfolderCounts] = await getFolderInfo(valFolder); // 추가된 부분

    // Merge folder names with subfolder counts
    const testFolderData = testFolders.map((folder, index) => ({
      name: folder,
      subfolderCount: testSubfolderCounts[index]
    }));
    const trainFolderData = trainFolders.map((folder, index) => ({
      name: folder,
      subfolderCount: trainSubfolderCounts[index]
    }));
    const valFolderData = valFolders.map((folder, index) => ({ // 추가된 부분
      name: folder,
      subfolderCount: valSubfolderCounts[index]
    }));

    // Query pill data for test, train, and val folders
    const testData = await queryPillData(testFolderData);
    const trainData = await queryPillData(trainFolderData);
    const valData = await queryPillData(valFolderData); // 추가된 부분

    // Send the response
    res.json({ test: testData, train: trainData, val: valData }); // 수정된 부분
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: Failed to retrieve data.' });
  }
});

// Function to get folder names and subfolder counts
async function getFolderInfo(folderPath) {
  const folders = await fs.readdir(folderPath);
  const subfolderCounts = await Promise.all(folders.map(async folder => {
    const stats = await fs.stat(path.join(folderPath, folder));
    return stats.isDirectory() ? (await fs.readdir(path.join(folderPath, folder))).length : 0;
  }));
  return [folders, subfolderCounts];
}

// Function to query pill data for folders
async function queryPillData(folderData) {
  const queries = folderData.map(folder => {
    const query = `SELECT * FROM pill WHERE item_seq IN (${folder.name})`;
    return new Promise((resolve, reject) => {
      connection.query(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ folderName: folder.name, data: results, subfolderCount: folder.subfolderCount });
      });
    });
  });
  return Promise.all(queries);
}

module.exports = router;
