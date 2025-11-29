const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const amqp = require('amqplib')

const app = express()
const port = 3001

app.use(bodyParser.json())

mongoose.connect('mongodb://mongo:27017/tasks')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err))

// Task Schema
const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: String
});

const Task = mongoose.model('Task', TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
    while (retries) {
        try {
            connection = await amqp.connect('amqp://rabbitmq');
            channel = await connection.createChannel();
            await channel.assertQueue('task_notifications');
            console.log('Connected to RabbitMQ');
            return;
        } catch (error) {
            console.error('RabbitMQ connection failed, retrying...', error.message);
            retries--;
            console.error('Retrying connection again', retries);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.status(200).send(tasks);
});

app.post('/tasks', async (req, res) => {
    const { title, description, userId, status } = req.body;

    try {
        const task = new Task({ title, description, userId, status });
        await task.save();

        const message = {
            taskId: task._id,
            userId: task.userId ,
            title: task.title,
            status: task.status
        };

        if (!channel) {
            return res.status(503).json({error: 'RabbitMQ channel not available'});
        }

        channel.sendToQueue('task_notifications', Buffer.from(
            JSON.stringify(message)
        ));

        res.status(200).send(task);
    } catch (error) {
        console.error('Error saving:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.listen(port, () => {
    console.log(`Task service listening on port ${port}`)
    connectRabbitMQWithRetry();
})

