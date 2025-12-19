const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const User = require('../models/user');

const router = express.Router();

// PUT: /auth/signup
router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valied email!')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(oldUser => {
                        if (oldUser) {
                            return Promise.reject('E-Mail already registered, please pick a different one!');
                        }
                    })
            })
            .normalizeEmail(),
        body('password',
            'Please enter a password with only numbers and text and at list 5 characters.'
        )
            .trim()
            .isLength({ min: 5 })
            .isAlphanumeric(),
        body('name',
            'Name should not be empty.')
            .trim()
            .not()
            .isEmpty(),
    ],
    authController.putSignup);

// POST: /auth/login
router.post('/login', authController.login);

module.exports = router;