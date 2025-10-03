const express = require('express');
const router = express.Router();

// Simple test route without dependencies
router.get('/', (req, res) => {
  res.json({ message: 'Tasks route working' });
});

router.get('/stats/overview', (req, res) => {
  res.json({ 
    message: 'Stats route working',
    totalTasks: 0,
    statusCounts: { pending: 0, 'in-progress': 0, completed: 0 }
  });
});

module.exports = router;
