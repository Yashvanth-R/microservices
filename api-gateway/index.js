const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Debug middleware for API Gateway
app.use((req, res, next) => {
  console.log(`API Gateway: ${req.method} ${req.path}`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway' });
});

// Service routes
const services = {
  '/api/auth': 'http://auth-service:3003',
  '/api/users': 'http://user-service:3000',
  '/api/tasks': 'http://task-service:3001',
  '/api/notifications': 'http://notification-service:3002',
  '/api/scheduler': 'http://scheduler-service:3004',
  '/api/files': 'http://file-service:3005',
  '/api/search': 'http://search-service:3006'
};

// Create proxy middleware for each service
Object.entries(services).forEach(([path, target]) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Handle different services differently
      if (path.startsWith('/api/auth')) {
        // Auth service: /api/auth/register -> /register
        const newPath = path.replace(/^\/api\/auth/, '');
        console.log(`Path rewrite: ${path} -> ${newPath}`);
        return newPath;
      } else if (path.startsWith('/api/users')) {
        // User service: /api/users -> /users
        const newPath = path.replace(/^\/api/, '');
        console.log(`Path rewrite: ${path} -> ${newPath}`);
        return newPath;
      } else if (path.startsWith('/api/files')) {
        // File service: /api/files/upload -> /upload
        const newPath = path.replace(/^\/api\/files/, '');
        console.log(`Path rewrite: ${path} -> ${newPath}`);
        return newPath;
      } else if (path.startsWith('/api/scheduler')) {
        // Scheduler service: /api/scheduler/schedule -> /schedule
        const newPath = path.replace(/^\/api\/scheduler/, '');
        console.log(`Path rewrite: ${path} -> ${newPath}`);
        return newPath;
      } else {
        // Other services: remove /api prefix but keep service path
        const newPath = path.replace(/^\/api/, '');
        console.log(`Path rewrite: ${path} -> ${newPath}`);
        return newPath;
      }
    },
    // Log proxy requests
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.originalUrl} to ${target}${proxyReq.path}`);
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${path}:`, err.message);
      res.status(503).json({
        error: 'Service unavailable',
        service: path,
        message: err.message
      });
    }
  }));
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'TaskFlow API Gateway',
    version: '1.0.0',
    services: Object.keys(services)
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available routes:', Object.keys(services));
});