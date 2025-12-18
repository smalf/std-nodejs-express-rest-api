
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

module.exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            //Pagination!
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.set('Content-Type', 'application/json');
            res.status(200).json({
                message: 'Fetchede posts succesfully',
                posts: posts,
                totalItems: totalItems
            });
        })
        .catch(err => {
            console.log('feedController', 'getPosts', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        });
}

module.exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({ message: 'Validation failed. ', errors: errors.array() });
    }

    if (!req.file) {
        const error = new Error('No Image provided.');
        error.statusCode = 422;
        throw error;
    }

    const userId = req.userId;

    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    post.save()
        .then(result => {
            console.log('feedController', 'createPost', 'RESULT: ' + result);
            return User.findById(userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {

            //Create post in DB.
            //STAUTS 201 means resource was succesfully created.
            res.set('Content-Type', 'application/json');
            res.status(201).json({
                message: 'Post created successfully!',
                post: post,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            console.log('feedController', 'createPost', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        })

}

module.exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    console.log('feedController', 'getPost', 'postId ' + postId);

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post with such an Id doe not esists.');
                error.statusCode = 404;
                throw error;
            }
            res.set('Content-Type', 'application/json');
            res.status(200).json({
                message: 'Post Fetched',
                post: post
            });
        })
        .catch(err => {
            console.log('feedController', 'getPost', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        })
}

module.exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({ message: 'Validation failed. ', errors: errors.array() });
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;

    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }

    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post with such an Id doe not esists.');
                error.statusCode = 404;
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.set('Content-Type', 'application/json');
            res.status(200).json({
                message: 'Post Updated',
                post: result
            });
        })
        .catch(err => {
            console.log('feedController', 'putPost', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        })
}

module.exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post with such an Id doe not esists.');
                error.statusCode = 404;
                throw error;
            }

            clearImage(post.imageUrl);
            return post.deleteOne();
        })
        .then(result => {
            res.set('Content-Type', 'application/json');
            res.status(200).json({
                message: `Post ${postId} is succesfully Deleted.`
            });
        })
        .catch(err => {
            console.log('feedController', 'deletePost', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        })
}