const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose'); // 1. Added mongoose for ID validation

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    // 2. Added check for valid ObjectId to prevent CastError
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid user identification in token' });
    }

    // 3. Keep your real-time database check
    const user = await User.findById(userId).select('is_active role');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (user.is_active === false) {
      // Logic for blocking inactive users
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact support.',
        isInactive: true 
      });
    }

    // Pass the actual database user role to req.user for security
    // (Don't trust the role inside the token, as it might be outdated)
    req.user = { 
      ...decoded, 
      id: userId, 
      role: user.role 
    };
    
    next();

  } catch (err) {
    // 4. Handle specific JWT errors separately for better debugging
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};