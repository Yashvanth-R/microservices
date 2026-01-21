const jwt = require('jsonwebtoken');
const axios = require('axios');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with Auth Service
    try {
      const response = await axios.post('http://auth-service:3003/verify', { token });
      
      if (response.data.success) {
        req.user = response.data.user;
        next();
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (authError) {
      // Fallback: verify locally if auth service is down
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
      next();
    }
  } catch (error) {
    return res.status(403).json({ error: 'Token verification failed' });
  }
};

// Optional authentication (for public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const response = await axios.post('http://auth-service:3003/verify', { token });
        if (response.data.success) {
          req.user = response.data.user;
        }
      } catch (error) {
        // Ignore auth errors for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticateToken, optionalAuth };