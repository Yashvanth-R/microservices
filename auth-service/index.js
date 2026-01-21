const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw body type:', typeof req.body);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/taskflow_auth')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Redis client with proper configuration
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

let redisConnected = false;

redisClient.connect()
  .then(() => {
    console.log('✅ Redis connected successfully');
    redisConnected = true;
  })
  .catch((err) => {
    console.error('❌ Redis connection error:', err);
    console.log('⚠️  Auth service will work without Redis (sessions won\'t persist)');
    redisConnected = false;
  });

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
  redisConnected = false;
});

redisClient.on('connect', () => {
  console.log('Redis reconnected');
  redisConnected = true;
});

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Register
app.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }
    
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    console.log('Checking if user exists:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }
    
    console.log('Creating new user:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    console.log('User created successfully:', email);
    res.json({ success: true, message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    
    // Store session in Redis (if connected)
    if (redisConnected) {
      try {
        await redisClient.setEx(`session:${user._id}`, 86400, token);
        console.log('Session stored in Redis');
      } catch (redisError) {
        console.error('Redis session storage failed:', redisError);
        // Continue without Redis session storage
      }
    } else {
      console.log('Redis not connected, session not stored');
    }
    
    console.log('Login successful for:', email);
    res.json({ success: true, token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify token
app.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check Redis session if connected
    if (redisConnected) {
      try {
        const sessionToken = await redisClient.get(`session:${decoded.userId}`);
        if (sessionToken !== token) {
          return res.status(401).json({ error: 'Invalid session' });
        }
      } catch (redisError) {
        console.error('Redis session check failed:', redisError);
        // Continue with JWT verification only
      }
    }
    
    res.json({ success: true, user: decoded });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Remove session from Redis if connected
    if (redisConnected) {
      try {
        await redisClient.del(`session:${decoded.userId}`);
        console.log('Session removed from Redis');
      } catch (redisError) {
        console.error('Redis session removal failed:', redisError);
        // Continue anyway
      }
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});