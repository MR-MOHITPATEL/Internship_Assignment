const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth'); // Optional: protect the route

const router = express.Router();

router.get('/', auth, (req, res) => {
  const logPath = path.join(__dirname, '../logs/app.log');
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Could not read log file.' });
    }
    res.type('text/plain').send(data);
  });
});

module.exports = router;