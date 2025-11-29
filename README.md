# microservices

# Microservices Project

A distributed microservices architecture built with Node.js, Express, MongoDB, and RabbitMQ. This project demonstrates event-driven communication between multiple services.

## 📋 Project Structure

```
microservices/
├── user-service/          # User management service
├── task-service/          # Task management service
├── notification-service/  # Notification consumer service
├── docker-compose.yml     # Docker Compose configuration
└── README.md
```

## 🏗️ Architecture Overview

The project consists of three microservices:

### 1. **User Service** (Port 3000)
- Manages user creation and retrieval
- Database: MongoDB (`users` collection)
- REST API endpoints:
  - `GET /users` - Get all users
  - `POST /users` - Create a new user

**Dependencies:**
- Express.js
- Mongoose
- Body Parser

### 2. **Task Service** (Port 3001)
- Manages task creation and retrieval
- Publishes task events to RabbitMQ
- Database: MongoDB (`tasks` collection)
- REST API endpoints:
  - `GET /tasks` - Get all tasks
  - `POST /tasks` - Create a new task (publishes event)

**Dependencies:**
- Express.js
- Mongoose
- Body Parser
- AMQP (amqplib)

### 3. **Notification Service** (Port 3002)
- Consumes task events from RabbitMQ
- Listens to `task_notifications` queue
- Logs received notifications

**Dependencies:**
- Express.js
- Mongoose
- Body Parser
- AMQP (amqplib)

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js v18+ (if running locally)
- MongoDB running
- RabbitMQ running

### Option 1: Using Docker Compose (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - MongoDB on port 27017
   - RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)
   - User Service on port 3000
   - Task Service on port 3001
   - Notification Service on port 3002

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### Option 2: Running Locally

1. **Start MongoDB:**
   ```bash
   mongod
   ```

2. **Start RabbitMQ:**
   ```bash
   rabbitmq-server
   ```
   Or with Docker:
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

3. **Install dependencies and start each service:**
   
   **User Service:**
   ```bash
   cd user-service
   npm install
   node index.js
   ```

   **Task Service (new terminal):**
   ```bash
   cd task-service
   npm install
   node index.js
   ```

   **Notification Service (new terminal):**
   ```bash
   cd notification-service
   npm install
   node index.js
   ```

## 📡 API Endpoints

### User Service (http://localhost:3000)

**Get all users**
```bash
curl -X GET http://localhost:3000/users
```

**Create a new user**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Task Service (http://localhost:3001)

**Get all tasks**
```bash
curl -X GET http://localhost:3001/tasks
```

**Create a new task** (automatically publishes to RabbitMQ)
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the microservices project",
    "userId": "user123",
    "status": "pending"
  }'
```

## 🔄 Event Flow

1. User creates a task via `POST /tasks` on Task Service
2. Task is saved to MongoDB
3. Task Service publishes a message to RabbitMQ `task_notifications` queue
4. Notification Service consumes the message from the queue
5. Notification Service logs the task details to console


## 📚 Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **RabbitMQ** - Message broker for async communication
- **amqplib** - AMQP client library
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🔌 RabbitMQ Management UI

Access the RabbitMQ Management Dashboard:
- URL: http://localhost:15672
- Default Username: `guest`
- Default Password: `guest`

Monitor queues, messages, and connections in real-time.

## 📝 Troubleshooting

### RabbitMQ Connection Refused
- Ensure RabbitMQ is running and accessible
- Check if port 5672 is not blocked
- Verify connection string: `amqp://rabbitmq` (Docker) or `amqp://localhost` (Local)

### MongoDB Connection Error
- Ensure MongoDB is running
- Verify connection string: `mongodb://mongo:27017/...` (Docker) or `mongodb://localhost:27017/...` (Local)
- Check if port 27017 is not blocked

### Services Not Starting
- Check Docker Compose logs: `docker-compose logs`
- Verify all ports are available
- Ensure all dependencies are installed: `npm install` in each service directory

## 🐳 Docker Commands

**Build images:**
```bash
docker-compose build
```

**Start services:**
```bash
docker-compose up
```

**Start in background:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f [service-name]
```

**Stop services:**
```bash
docker-compose down
```

**Remove volumes:**
```bash
docker-compose down -v
```
