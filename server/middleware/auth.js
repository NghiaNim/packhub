const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate user requests with JWT
 */
const auth = async (req, res, next) => {
  try {
    // Check for token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Add user information to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Authentication invalid' });
  }
};

module.exports = { auth }; 