const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// app.use(bodyParser.urlencoded()) -> For Data if form of x-www-urlencoded. Basically for forms
app.use(bodyParser.json()); // This for application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //To fix CORS error.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
});
//GET /feed/posts
app.use('/feed', feedRoutes);

app.listen(8080);