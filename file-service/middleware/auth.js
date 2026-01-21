const jwt = require('jsonwebtoken');
const axios = require('axios');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('File service auth middleware called for:', req.method, req.path);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('Token found, verifying...');
    // Verify token with Auth Service
    try {
      const response = await axios.post('http://auth-service:3003/verify', { token });
      
      if (response.data.success) {
        console.log('Token verified successfully, user:', response.data.user);
        req.user = response.data.user;
        next();
      } else {
        console.log('Token verification failed');
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (authError) {
      console.log('Auth service error, trying local verification:', authError.message);
      // Fallback: verify locally if auth service is down
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('Local token verification successful:', decoded);
        req.user = decoded;
        next();
      } catch (jwtError) {
        console.log('Local token verification failed:', jwtError.message);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
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