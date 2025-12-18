/**
 * The Basic implementation of the NodeJS code!
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const { MONGODB_URI, SERVICE_PORT } = process.env;

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

// app.use(bodyParser.urlencoded()) -> For Data if form of x-www-urlencoded. Basically for forms
app.use(bodyParser.json()); // This for application/json
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //To fix CORS error.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
});
// /feed/..
app.use('/feed', feedRoutes);
// /auth/..
app.use('/auth', authRoutes);

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

