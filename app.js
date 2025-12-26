/**
 * The Basic implementation of the NodeJS code!
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const { createHandler } = require('graphql-http/lib/use/express');
const { ruruHTML } = require('ruru/server'); //GraphIQL IDE
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const authMiddlleware = require('./middleware/is-auth');

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
};

const graphqlErrorFormatter = (error) => {
    if (!error.originalError) {
        return error;
    }

    const data = error.originalError.data;
    const message = error.message || 'An error occured';
    const code = error.originalError.code || 500;

    return {
        message: message,
        status: code,
        data: data
    }
};

// app.use(bodyParser.urlencoded()) -> For Data if form of x-www-urlencoded. Basically for forms
app.use(bodyParser.json()); // This for application/json
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //To fix CORS error.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(authMiddlleware);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not Authenticated!');
    } 

    if (!req.file) {
        return res.status(200).json({ message: 'No file provided!'});
    }

    if (req.body.oldPath) {
        //Remove old image for post
        clearImage(req.body.oldPath);
    }

    return res.status(201).json({ message: 'File stored!', filePath: req.file.path }); 
});

app.get('/graphql', (_req, res) => {
    res.type('html');
    res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.post('/graphql', createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    context: (request) => {
        // request.raw === Express req (with your req.isAuth set by middleware)
        const req = request.raw;
        return { req: req };
    },
    formatError: graphqlErrorFormatter,
}));

// // /feed/..
// app.use('/feed', feedRoutes);
// // /auth/..
// app.use('/auth', authRoutes);
// // /account/..
// app.use('/account', accRoutes);

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
        const apiServer = app.listen(SERVICE_PORT);
    })
    .catch(error => {
        console.log("Application", "DB Init Error", error);
    });

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

