const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Test with minimal routes
const testTaskRoutes = require('./routes/test-tasks');
app.use('/api/tasks', testTaskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
});
