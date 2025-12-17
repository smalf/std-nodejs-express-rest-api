/**
 * The Basic implementation of the NodeJS code!
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const { MONGODB_URI, SERVICE_PORT } = process.env;

const app = express();

// app.use(bodyParser.urlencoded()) -> For Data if form of x-www-urlencoded. Basically for forms
app.use(bodyParser.json()); // This for application/json
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //To fix CORS error.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
});
//GET /feed/posts
app.use('/feed', feedRoutes);

/**
 * The Middleware for handling global errors!
 */
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode;
    const message = error.message;

    res.status(status).json({
        message: message
    });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        console.log("Application", "DB Connected");
        app.listen(SERVICE_PORT);
    })
    .catch(error => {
        console.log("Application", "DB Init Error", error);
    });

