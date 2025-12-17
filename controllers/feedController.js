
const Post = require('../models/post')
const { validationResult } = require('express-validator');

module.exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            res.set('Content-Type', 'application/json');
            res.status(200).json({
                message: 'Fetchede posts succesfully',
                posts: posts
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

    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/fav.png',
        creator: {
            name: 'Serhii M.'
        },
    });
    post.save()
        .then(result => {
            console.log('feedController', 'createPost', 'RESULT: ' + result);

            //Create post in DB.
            //STAUTS 201 means resource was succesfully created.
            res.set('Content-Type', 'application/json');
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
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