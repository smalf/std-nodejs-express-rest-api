
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

module.exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.set('Content-Type', 'application/json');
        res.status(200).json({
            message: 'Fetchede posts succesfully',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        console.log('feedController', 'getPosts', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}

module.exports.createPost = async (req, res, next) => {
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

    try {
        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId,
        });


        const result = await post.save();
        console.log('feedController', 'createPost', 'RESULT: ' + result);

        const creator = await User.findById(userId);
        creator.posts.push(post);

        await creator.save();
        //Create post in DB.
        //STAUTS 201 means resource was succesfully created.
        res.set('Content-Type', 'application/json');
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: creator._id, name: creator.name }
        });
    } catch (err) {
        console.log('feedController', 'createPost', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}

module.exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    console.log('feedController', 'getPost', 'postId ' + postId);

    try {
        const post = await Post.findById(postId);
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
    } catch (err) {
        console.log('feedController', 'getPost', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}

module.exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({ message: 'Validation failed. ', errors: errors.array() });
    }

    try {
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

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Post with such an Id doe not esists.');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;

        const result = await post.save();

        res.set('Content-Type', 'application/json');
        res.status(200).json({
            message: 'Post Updated',
            post: result
        });

    } catch (err) {
        console.log('feedController', 'putPost', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}

module.exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Post with such an Id doe not esists.');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        await post.deleteOne();

        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        res.set('Content-Type', 'application/json');
        res.status(200).json({
            message: `Post ${postId} is succesfully Deleted.`
        });
    } catch (err) {
        console.log('feedController', 'deletePost', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}