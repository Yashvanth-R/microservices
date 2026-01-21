const axios = require('axios');

class ServiceClient {
  constructor() {
    this.services = {
      auth: 'http://auth-service:3003',
      user: 'http://user-service:3000', 
      task: 'http://task-service:3001',
      notification: 'http://notification-service:3002',
      scheduler: 'http://scheduler-service:3004',
      file: 'http://file-service:3005'
    };
  }

  // Generic HTTP client with retry logic
  async request(service, endpoint, options = {}) {
    const baseURL = this.services[service];
    if (!baseURL) {
      throw new Error(`Unknown service: ${service}`);
    }

    const config = {
      baseURL,
      timeout: options.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await axios(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`Service call failed: ${service}${endpoint}`, error.message);
      throw error;
    }
  }

  // Auth Service calls
  async verifyToken(token) {
    return this.request('auth', '/verify', {
      method: 'POST',
      data: { token }
    });
  }

  // User Service calls
  async getUser(userId, token) {
    return this.request('user', `/users/${userId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async getUserTasks(userId, token) {
    return this.request('task', `/tasks/user/${userId}`, {
      method: 'GET', 
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Task Service calls
  async createTask(taskData, token) {
    return this.request('task', '/tasks', {
      method: 'POST',
      data: taskData,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async updateTask(taskId, updateData, token) {
    return this.request('task', `/tasks/${taskId}`, {
      method: 'PUT',
      data: updateData,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // File Service calls
  async linkFileToTask(fileId, taskId, token) {
    return this.request('file', `/link`, {
      method: 'POST',
      data: { fileId, taskId },
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Scheduler Service calls
  async scheduleTask(taskId, cronExpression, token) {
    return this.request('scheduler', '/schedule', {
      method: 'POST',
      data: { taskId, cronExpression, action: 'execute' },
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Health checks
  async healthCheck(service) {
    try {
      return await this.request(service, '/health', { method: 'GET' });
    } catch (error) {
      return { status: 'DOWN', error: error.message };
    }
  }
}

module.exports = new ServiceClient();