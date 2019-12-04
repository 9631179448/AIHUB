const express = require('express');
const connectDB = require('./config/db');
const jwt  = require('jsonwebtoken');


const app = express();

//Init Middleware
app.use(express.json({ extended: false }));

//ConnectDB

connectDB();

app.get('/',(req,res) => res.send('Api  is running'));

app.use('/api/users',require('./routes/apis/users'));
app.use('/api/auth', require('./routes/apis/auth'));
app.use('/api/post', require('./routes/apis/post'));
app.use('/api/profile', require('./routes/apis/profile'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server is started ${PORT}`));