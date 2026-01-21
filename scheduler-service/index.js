const express = require('express');
const cron = require('node-cron');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

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
    console.log('⚠️  Scheduler service will work without Redis (tasks won\'t persist)');
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'scheduler-service' });
});

// Schedule a task
app.post('/schedule', async (req, res) => {
  try {
    console.log('Schedule request received:', req.body);
    
    const { taskId, cronExpression, action } = req.body;
    
    if (!taskId || !cronExpression || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: taskId, cronExpression, action' 
      });
    }
    
    const scheduleData = {
      taskId,
      cronExpression,
      action,
      createdAt: new Date().toISOString()
    };
    
    if (redisConnected) {
      try {
        await redisClient.hSet('scheduled_tasks', taskId, JSON.stringify(scheduleData));
        console.log('Task scheduled in Redis:', taskId);
      } catch (redisError) {
        console.error('Redis operation failed:', redisError);
        return res.status(500).json({ error: 'Failed to store task in Redis' });
      }
    } else {
      console.log('Redis not connected, task not persisted:', taskId);
      return res.status(503).json({ 
        error: 'Redis not available, task cannot be persisted' 
      });
    }
    
    res.json({
      success: true,
      message: 'Task scheduled successfully',
      taskId
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get scheduled tasks
app.get('/tasks', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.status(503).json({ 
        error: 'Redis not available',
        tasks: []
      });
    }
    
    const tasks = await redisClient.hGetAll('scheduled_tasks');
    const parsedTasks = Object.entries(tasks).map(([id, data]) => ({
      id,
      ...JSON.parse(data)
    }));
    
    res.json(parsedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete scheduled task
app.delete('/tasks/:taskId', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.status(503).json({ 
        error: 'Redis not available' 
      });
    }
    
    await redisClient.hDel('scheduled_tasks', req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Example cron job - runs every minute
cron.schedule('* * * * *', async () => {
  console.log('Scheduler heartbeat:', new Date().toISOString());
});

app.listen(PORT, () => {
  console.log(`Scheduler service running on port ${PORT}`);
});