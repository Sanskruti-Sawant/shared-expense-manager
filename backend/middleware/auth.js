const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Auth check - Token present:', !!token);
    
    if (!token) {
      console.warn('Auth check - No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Verifying token with JWT_SECRET length:', JWT_SECRET.length);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const generateToken = (userId, email, name) => {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authMiddleware,
  generateToken,
  JWT_SECRET
};
