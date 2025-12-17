const express = require('express');
//check - checks value in any place request body, header, coockie etc. See documentaion.
//body - checks value in the request body only. See documentaion. 
const { body } = require('express-validator');

const feedController = require('../controllers/feedController');

const router = express.Router();

router.get('/posts', feedController.getPosts);
router.post(
    '/post', [
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

module.exports = router;