const amqp = require('amqplib')

async function start() {
    try {
        connection = await amqp.connect('amqp://rabbitmq');
        channel = await connection.createChannel();

        await channel.assertQueue('task_notifications');
        console.log('Notification service connected to RabbitMQ');

        channel.consume('task_notifications', (msg) => {
            const taskData = JSON.parse(msg.content.toString());
            console.log('Received notification:', taskData.title);
            console.log('Notification: NEW TASK:', taskData)
            channel.ack(msg);
        });
            
    } catch (error) {
        console.error('RabbitMQ connection failed, retrying...', error.message);
    }
}
start();