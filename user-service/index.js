const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// Middleware
app.use(bodyParser.json())

mongoose.connect('mongodb://mongo:27017/users')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err))

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = mongoose.model('User', userSchema)

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.status(200).send(users);
});

// Routes
app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({error:'Internal Server Error'});
    }
})

app.listen(port, () => {
    console.log(`User service listening on port ${port}`)
})
