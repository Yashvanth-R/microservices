const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

// Elasticsearch client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await esClient.cluster.health();
    res.json({ 
      status: 'OK', 
      service: 'search-service',
      elasticsearch: health.body.status 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'search-service',
      error: error.message 
    });
  }
});

// Initialize indices
async function initializeIndices() {
  try {
    // Create tasks index
    const tasksIndexExists = await esClient.indices.exists({ index: 'tasks' });
    if (!tasksIndexExists.body) {
      await esClient.indices.create({
        index: 'tasks',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text', analyzer: 'standard' },
              description: { type: 'text', analyzer: 'standard' },
              status: { type: 'keyword' },
              priority: { type: 'keyword' },
              userId: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
      console.log('Tasks index created');
    }

    // Create users index
    const usersIndexExists = await esClient.indices.exists({ index: 'users' });
    if (!usersIndexExists.body) {
      await esClient.indices.create({
        index: 'users',
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text', analyzer: 'standard' },
              email: { type: 'keyword' },
              role: { type: 'keyword' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
      console.log('Users index created');
    }
  } catch (error) {
    console.error('Error initializing indices:', error);
  }
}

// Search tasks
app.get('/search/tasks', authenticateToken, async (req, res) => {
  try {
    const { q, status, userId, priority, limit = 10, offset = 0 } = req.query;

    const searchQuery = {
      bool: {
        must: [],
        filter: []
      }
    };

    // Add text search if query provided
    if (q) {
      searchQuery.bool.must.push({
        multi_match: {
          query: q,
          fields: ['title^2', 'description'], // Boost title matches
          fuzziness: 'AUTO' // Handle typos
        }
      });
    } else {
      searchQuery.bool.must.push({ match_all: {} });
    }

    // Add filters
    if (status) searchQuery.bool.filter.push({ term: { status } });
    if (userId) searchQuery.bool.filter.push({ term: { userId } });
    if (priority) searchQuery.bool.filter.push({ term: { priority } });

    const result = await esClient.search({
      index: 'tasks',
      body: {
        query: searchQuery,
        sort: [{ createdAt: { order: 'desc' } }],
        from: parseInt(offset),
        size: parseInt(limit)
      }
    });

    const tasks = result.body.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));

    res.json({
      tasks,
      total: result.body.hits.total.value,
      took: result.body.took
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search users
app.get('/search/users', authenticateToken, async (req, res) => {
  try {
    const { q, role, limit = 10, offset = 0 } = req.query;

    const searchQuery = {
      bool: {
        must: [],
        filter: []
      }
    };

    if (q) {
      searchQuery.bool.must.push({
        multi_match: {
          query: q,
          fields: ['name^2', 'email'],
          fuzziness: 'AUTO'
        }
      });
    } else {
      searchQuery.bool.must.push({ match_all: {} });
    }

    if (role) searchQuery.bool.filter.push({ term: { role } });

    const result = await esClient.search({
      index: 'users',
      body: {
        query: searchQuery,
        sort: [{ createdAt: { order: 'desc' } }],
        from: parseInt(offset),
        size: parseInt(limit)
      }
    });

    const users = result.body.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source
    }));

    res.json({
      users,
      total: result.body.hits.total.value,
      took: result.body.took
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-complete suggestions
app.get('/suggest/tasks', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ suggestions: [] });
    }

    const result = await esClient.search({
      index: 'tasks',
      body: {
        suggest: {
          task_suggest: {
            prefix: q,
            completion: {
              field: 'title.suggest',
              size: 5
            }
          }
        }
      }
    });

    const suggestions = result.body.suggest.task_suggest[0].options.map(
      option => option.text
    );

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Index a task (called by task service)
app.post('/index/task', async (req, res) => {
  try {
    const { id, title, description, status, priority, userId, createdAt, updatedAt } = req.body;

    await esClient.index({
      index: 'tasks',
      id: id,
      body: {
        id,
        title,
        description,
        status,
        priority,
        userId,
        createdAt,
        updatedAt
      }
    });

    res.json({ success: true, message: 'Task indexed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Index a user (called by user service)
app.post('/index/user', async (req, res) => {
  try {
    const { id, name, email, role, createdAt } = req.body;

    await esClient.index({
      index: 'users',
      id: id,
      body: {
        id,
        name,
        email,
        role,
        createdAt
      }
    });

    res.json({ success: true, message: 'User indexed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete from index
app.delete('/index/task/:id', async (req, res) => {
  try {
    await esClient.delete({
      index: 'tasks',
      id: req.params.id
    });

    res.json({ success: true, message: 'Task removed from index' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint
app.get('/analytics/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await esClient.search({
      index: 'tasks',
      body: {
        size: 0,
        aggs: {
          status_distribution: {
            terms: { field: 'status' }
          },
          priority_distribution: {
            terms: { field: 'priority' }
          },
          tasks_over_time: {
            date_histogram: {
              field: 'createdAt',
              calendar_interval: 'day'
            }
          }
        }
      }
    });

    res.json({
      analytics: {
        statusDistribution: result.body.aggregations.status_distribution.buckets,
        priorityDistribution: result.body.aggregations.priority_distribution.buckets,
        tasksOverTime: result.body.aggregations.tasks_over_time.buckets
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Search service running on port ${PORT}`);
  await initializeIndices();
});