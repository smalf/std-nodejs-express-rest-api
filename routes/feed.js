const express = require('express');
//check - checks value in any place request body, header, coockie etc. See documentaion.
//body - checks value in the request body only. See documentaion. 
const { body } = require('express-validator');

const feedController = require('../controllers/feedController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post(
    '/post',
    [
        body('title',
            'Title should include at list 5 characters.')
            .trim()
            .isLength({ min: 5 })
        ,
        body('content',
            'Content should include at list 5 characters.')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.createPost);

// GET /feed/post
router.get('/post/:postId', feedController.getPost);

// PUT /feed/post
router.put(
    '/post/:postId',
    [
        body('title',
            'Title should include at list 5 characters.')
            .trim()
            .isLength({ min: 5 })
        ,
        body('content',
            'Content should include at list 5 characters.')
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.updatePost);

// DELETE /feed/post
router.delete('/post/:postId', feedController.deletePost);

module.exports = router;