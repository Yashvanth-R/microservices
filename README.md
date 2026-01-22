# Microservices Project

A comprehensive distributed microservices architecture built with Node.js, Express, MongoDB, RabbitMQ, and other modern technologies. This project demonstrates event-driven communication, API gateway pattern, authentication, file management, search capabilities, and task scheduling.

## 📋 Project Structure

```
microservices/
├── api-gateway/              # Central API Gateway
├── auth-service/             # Authentication & Authorization
├── user-service/             # User management service
├── task-service/             # Task management service
├── notification-service/     # Notification consumer service
├── scheduler-service/        # Task scheduling service
├── file-service/             # File management service
├── search-service/           # Search functionality service
├── frontend-service/         # Next.js frontend application
├── shared/                   # Shared utilities and middleware
├── docker-compose.yml        # Docker Compose configuration
└── README.md
```

## 🏗️ Architecture Overview

The project consists of 8 microservices with supporting infrastructure:

### **Core Services**

### 1. **API Gateway** (Port 8080)
- Central entry point for all requests
- Request routing and load balancing
- Rate limiting and request validation
- JWT token verification
- Response aggregation

**Tech Stack:**
- Express.js
- Node.js
- Redis (for caching & session management)

### 2. **Auth Service** (Port 3003)
- User authentication and JWT token generation
- Token validation and refresh
- Password hashing and security
- Role-based access control (RBAC)
- Database: MongoDB

**Tech Stack:**
- Express.js
- MongoDB
- JWT
- Redis

### 3. **User Service** (Port 3000)
- User profile management
- User creation and retrieval
- User information updates
- Database: MongoDB

**Tech Stack:**
- Express.js
- Mongoose
- MongoDB

### 4. **Task Service** (Port 3001)
- Task creation, retrieval, and management
- Task status updates
- Publishes task events to RabbitMQ
- Database: MongoDB

**Tech Stack:**
- Express.js
- Mongoose
- RabbitMQ (AMQP)
- MongoDB

### 5. **Notification Service** (Port 3002)
- Consumes task and system events from RabbitMQ
- Listens to `task_notifications` queue
- Sends notifications (email, in-app, etc.)
- Database: MongoDB

**Tech Stack:**
- Express.js
- RabbitMQ (AMQP)
- Mongoose
- MongoDB

### 6. **Scheduler Service** (Port 3004)
- Task scheduling and cron job management
- Scheduled task execution
- Background job processing
- Uses Redis for scheduling state

**Tech Stack:**
- Express.js
- Node.js
- Redis

### 7. **File Service** (Port 3005)
- File upload and download management
- File storage and retrieval
- Object storage via MinIO
- File metadata tracking

**Tech Stack:**
- Express.js
- MinIO (S3-compatible storage)
- Node.js

### 8. **Search Service** (Port 3006)
- Full-text search capabilities
- Task and user search indexing
- Advanced filtering and aggregation
- Database: Elasticsearch

**Tech Stack:**
- Express.js
- Elasticsearch
- Node.js

### **Frontend Application**

### 9. **Frontend Service** (Port 3008)
- Next.js React application
- User interface for all features
- Authentication UI (login/register)
- Task management UI
- User management UI
- File management UI
- Search UI
- Scheduler UI
- Dashboard UI

**Tech Stack:**
- Next.js
- React
- TypeScript
- Tailwind CSS
- PostCSS

### Frontend Issues

**Next.js Build Fails**
```bash
cd frontend-service
npm install
npm run build
```

**CORS Errors**
- Check API Gateway configuration
- Ensure frontend URL is whitelisted
- Verify auth headers are correctly set

**API Calls Fail from Frontend**
- Check network tab in browser DevTools
- Verify API Gateway is running on port 8080
- Check authentication tokens in localStorage
- Review console logs for detailed errors

## 🔄 CI/CD Integration

This project is ready for CI/CD integration:

1. **Build Stage**: `docker-compose build`
2. **Test Stage**: Run test suites in each service
3. **Push Stage**: Push images to container registry
4. **Deploy Stage**: Deploy to Kubernetes or Docker Swarm

### Quick Start with Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd microservices
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

   This will start all services and infrastructure:
   - MongoDB on port 27017
   - RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)
   - Redis on port 6379
   - Redis Commander on port 8081
   - MinIO on ports 9000 (API) and 9001 (WebUI)
   - Elasticsearch on port 9200
   - User Service on port 3000
   - Task Service on port 3001
   - Notification Service on port 3002
   - Auth Service on port 3003
   - Scheduler Service on port 3004
   - File Service on port 3005
   - Search Service on port 3006
   - API Gateway on port 8080
   - Frontend Service on port 3008

3. **Access the application:**
   - Frontend: http://localhost:3008
   - API Gateway: http://localhost:8080
   - RabbitMQ Dashboard: http://localhost:15672 (guest/guest)
   - Redis Commander: http://localhost:8081
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

4. **View logs:**
   ```bash
   docker-compose logs -f [service-name]
   ```
   Example: `docker-compose logs -f frontend-service`

5. **Stop services:**
   ```bash
   docker-compose down
   ```

### Running Individual Services Locally

If you need to run services locally for development:

1. **Start infrastructure services with Docker:**
   ```bash
   docker-compose up mongo rabbitmq redis elasticsearch minio
   ```

2. **In separate terminals, install dependencies and start each service:**

   **Auth Service:**
   ```bash
   cd auth-service
   npm install
   npm start
   ```

   **User Service:**
   ```bash
   cd user-service
   npm install
   npm start
   ```

   **Task Service:**
   ```bash
   cd task-service
   npm install
   npm start
   ```

   **Notification Service:**
   ```bash
   cd notification-service
   npm install
   npm start
   ```

   **Scheduler Service:**
   ```bash
   cd scheduler-service
   npm install
   npm start
   ```

   **File Service:**
   ```bash
   cd file-service
   npm install
   npm start
   ```

   **Search Service:**
   ```bash
   cd search-service
   npm install
   npm start
   ```

   **API Gateway:**
   ```bash
   cd api-gateway
   npm install
   npm start
   ```

   **Frontend Service:**
   ```bash
   cd frontend-service
   npm install
   npm run dev
   ```

## 📡 API Endpoints

### API Gateway (http://localhost:8080)
All requests should be routed through the API Gateway. The gateway handles authentication, routing, and request validation.

### Auth Service (http://localhost:3003)

**Register a new user**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Login**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Refresh Token**
```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Authorization: Bearer <refresh_token>"
```

### User Service (http://localhost:3000)

**Get all users**
```bash
curl -X GET http://localhost:8080/users \
  -H "Authorization: Bearer <access_token>"
```

**Get user by ID**
```bash
curl -X GET http://localhost:8080/users/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

**Update user profile**
```bash
curl -X PUT http://localhost:8080/users/<user_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

### Task Service (http://localhost:3001)

**Get all tasks**
```bash
curl -X GET http://localhost:8080/tasks \
  -H "Authorization: Bearer <access_token>"
```

**Create a new task**
```bash
curl -X POST http://localhost:8080/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the microservices project",
    "priority": "high",
    "status": "pending",
    "dueDate": "2025-12-31"
  }'
```

**Update task**
```bash
curl -X PUT http://localhost:8080/tasks/<task_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

**Delete task**
```bash
curl -X DELETE http://localhost:8080/tasks/<task_id> \
  -H "Authorization: Bearer <access_token>"
```

### File Service (http://localhost:3005)

**Upload file**
```bash
curl -X POST http://localhost:8080/files/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/file.pdf"
```

**Download file**
```bash
curl -X GET http://localhost:8080/files/<file_id> \
  -H "Authorization: Bearer <access_token>" \
  -o downloaded_file
```

**Delete file**
```bash
curl -X DELETE http://localhost:8080/files/<file_id> \
  -H "Authorization: Bearer <access_token>"
```

### Search Service (http://localhost:3006)

**Search tasks**
```bash
curl -X GET "http://localhost:8080/search/tasks?q=project&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

**Search users**
```bash
curl -X GET "http://localhost:8080/search/users?q=john&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### Scheduler Service (http://localhost:3004)

**Create scheduled task**
```bash
curl -X POST http://localhost:8080/scheduler/jobs \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_123",
    "cronExpression": "0 9 * * MON-FRI",
    "action": "sendReminder"
  }'
```

**Get scheduled jobs**
```bash
curl -X GET http://localhost:8080/scheduler/jobs \
  -H "Authorization: Bearer <access_token>"
```

## 🔄 Event Flow

1. User registers/logs in via Auth Service
2. User creates a task via Task Service
3. Task is saved to MongoDB
4. Task Service publishes a message to RabbitMQ `task_notifications` queue
5. Notification Service consumes the message from the queue
6. Notification Service sends notifications (email, in-app, etc.)
7. User can search tasks via Search Service (Elasticsearch)
8. User can schedule tasks via Scheduler Service (Redis-based)


## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework for microservices
- **Next.js** - React framework for frontend
- **React** - Frontend library
- **TypeScript** - Type safety for frontend
- **Tailwind CSS** - CSS framework for styling
- **MongoDB** - NoSQL database for persistent data
- **Mongoose** - MongoDB ODM for data modeling
- **RabbitMQ** - Message broker for async event communication
- **amqplib** - AMQP client library for Node.js
- **Redis** - In-memory data store for caching and scheduling
- **Elasticsearch** - Full-text search and analytics engine
- **MinIO** - S3-compatible object storage
- **JWT** - JSON Web Tokens for authentication
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container orchestration

## 🔌 Service Ports Summary

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 8080 | Central API entry point |
| User Service | 3000 | User management |
| Task Service | 3001 | Task management |
| Notification Service | 3002 | Event notifications |
| Auth Service | 3003 | Authentication & Authorization |
| Scheduler Service | 3004 | Task scheduling |
| File Service | 3005 | File management |
| Search Service | 3006 | Full-text search |
| Frontend Service | 3008 | Next.js application |
| MongoDB | 27017 | Database |
| RabbitMQ AMQP | 5672 | Message broker |
| RabbitMQ Management | 15672 | RabbitMQ Web UI |
| Redis | 6379 | Cache & session store |
| Redis Commander | 8081 | Redis Web UI |
| MinIO API | 9000 | Object storage API |
| MinIO Console | 9001 | MinIO Web UI |
| Elasticsearch | 9200 | Search engine |

## � Authentication & Security

- JWT tokens are used for authentication
- Tokens include user ID, roles, and permissions
- All protected endpoints require valid JWT in `Authorization` header
- Passwords are hashed using bcrypt
- CORS is configured for frontend access
- Rate limiting on API Gateway prevents abuse
- Shared authentication middleware across services

## 💾 Data Persistence

### MongoDB Collections
- `users` - User accounts and profiles
- `tasks` - Task data and metadata
- `files` - File metadata and references
- `notifications` - Notification records
- `schedules` - Scheduled job records

### Redis Keys
- `cache:*` - Cached data with TTL
- `session:*` - User session tokens
- `jobs:*` - Scheduled job definitions

### Elasticsearch Indices
- `tasks` - Indexed tasks for full-text search
- `users` - Indexed user profiles for search

### MinIO Buckets
- `files` - User uploaded files
- `documents` - Document storage
- `media` - Media files

## � Docker Commands Reference

**Build all images:**
```bash
docker-compose build
```

**Start all services:**
```bash
docker-compose up
```

**Start in background (detached mode):**
```bash
docker-compose up -d
```

**View logs for all services:**
```bash
docker-compose logs -f
```

**View logs for a specific service:**
```bash
docker-compose logs -f <service-name>
```

**View last 50 lines of logs:**
```bash
docker-compose logs --tail=50
```

**Stop all services:**
```bash
docker-compose stop
```

**Stop and remove containers:**
```bash
docker-compose down
```

**Remove containers, volumes, and networks:**
```bash
docker-compose down -v
```

**Rebuild and restart a service:**
```bash
docker-compose up -d --build <service-name>
```

**Execute command in running container:**
```bash
docker-compose exec <service-name> <command>
```

**View container status:**
```bash
docker-compose ps
```

## 📝 Environment Variables

Each service uses `.env` file for configuration. Key variables include:

```
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://mongo:27017/taskflow
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq
ELASTICSEARCH_URL=http://elasticsearch:9200
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
```

See individual service `.env` files for complete configuration options.

## 🔧 Development Workflow

### Working on a Specific Service

1. Navigate to the service directory:
   ```bash
   cd <service-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/update `.env` file with appropriate configuration

4. Start the service:
   ```bash
   npm run dev  # For development with hot reload
   # or
   npm start    # For production
   ```

5. Test the service:
   ```bash
   npm test
   ```
