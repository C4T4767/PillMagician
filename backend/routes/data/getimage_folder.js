const fs = require('fs');
const express = require('express');
const connection = require('../../db');
const isAuthenticated = require('../isAuthenticated');
const router = express.Router();
const path = require('path');

// Define the root directory where folders will be created
const rootDir = path.join(__dirname, '../data');

// Ensure the root directory exists
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir);
}

// Add a new folder
router.post('/', isAuthenticated, (req, res) => {
  const { folderName, type } = req.body;
  const folderPath = path.join(__dirname, '..', '..', '..', 'ai', 'aidata', type, folderName);

  if (!['test', 'train', 'val'].includes(type)) {
    return res.status(400).send('Invalid folder type');
  }

  if (fs.existsSync(folderPath)) {
    return res.status(400).send('Folder already exists');
  }

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).send('Error creating folder');
    }
    res.status(200).send('Folder added successfully');
  });
});

// Delete an existing folder
router.delete('/', isAuthenticated, (req, res) => {
  const { folderName, type } = req.body;
  const folderPath = path.join(__dirname, '..', '..', '..', 'ai', 'aidata', type, folderName);

  if (!['test', 'train', 'val'].includes(type)) {
    return res.status(400).send('Invalid folder type');
  }

  if (!fs.existsSync(folderPath)) {
    return res.status(400).send('Folder not found');
  }

  fs.rmdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).send('Error deleting folder');
    }
    res.status(200).send('Folder deleted successfully');
  });
});

module.exports = router;
