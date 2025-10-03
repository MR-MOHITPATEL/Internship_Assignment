const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
