const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🔧 Starting server test...');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test each route file individually
try {
  console.log('📁 Testing auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded successfully');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  console.log('📁 Testing user routes...');
  const userRoutes = require('./routes/users');
  console.log('✅ User routes loaded successfully');
  app.use('/api/users', userRoutes);
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
}

try {
  console.log('📁 Testing task routes...');
  const taskRoutes = require('./routes/tasks');
  console.log('✅ Task routes loaded successfully');
  app.use('/api/tasks', taskRoutes);
} catch (error) {
  console.error('❌ Error loading task routes:', error.message);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/react-auth-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
