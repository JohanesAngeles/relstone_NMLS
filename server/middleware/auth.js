const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both 'id' or '_id' depending on how your JWT was signed
    const userId = decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid user identification in token' });
    }

    /**
     * FIX 1: Add 'name' to the .select() call. 
     * Previously, 'name' was being excluded from the database results.
     */
    const user = await User.findById(userId).select('name is_active role');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Block inactive users
    if (user.is_active === false) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact support.',
        isInactive: true 
      });
    }

    /**
     * FIX 2: Explicitly map the database fields to req.user.
     * This ensures that when your InstructorLog.create() calls req.user.name, 
     * the data actually exists.
     */
    req.user = { 
      ...decoded, // Keep existing token data
      _id: user._id,
      id: user._id, 
      name: user.name, // Now available for your logs!
      role: user.role  // Use DB role for security
    };
    
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};