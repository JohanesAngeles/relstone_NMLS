const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── FIX: guard against a token that decoded but has no id
    if (!decoded?.id && !decoded?._id) {
      return res.status(401).json({ message: 'Token payload missing user id' });
    }

    // ── FIX: normalize to always use decoded.id regardless of how token was signed
    req.user = { ...decoded, id: decoded.id || decoded._id };
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};