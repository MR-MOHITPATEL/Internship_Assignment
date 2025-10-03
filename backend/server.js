const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/react-auth-dashboard';
console.log('🔗 Connecting to MongoDB:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 MongoDB not available - some features may not work');
  console.log('💡 To install MongoDB locally: https://docs.mongodb.com/manual/installation/');
  // Continue running the server even if MongoDB fails
});

// Log every request with status code
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${req.ip} (${duration}ms)`
    );
  });
  next();
});

// Log errors
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;

// Example: Log user registration/login in your auth routes
// In your auth route handlers, add:
// logger.info(`User registered: ${user.email}`); // after successful registration
// logger.info(`User login: ${user.email}`); // after successful login

// Log errors globally
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

// Serve logs via API
app.get('/api/logs', (req, res) => {
  const logPath = path.join(__dirname, 'logs/app.log');
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      logger.error(`Failed to read log file: ${err.message}`);
      return res.status(500).json({ message: 'Could not read log file.' });
    }
    res.type('text/plain').send(data);
  });
});


