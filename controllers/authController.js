const User = require('../models/user');
const bcript = require('bcryptjs');

const { validationResult } = require('express-validator');

module.exports.putSignup = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('authController', 'putSignup', 'VALIDATION_ERROR: ' + errors.array()[0].msg);

        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcript.hash(password, 12)
        .then(encryptedPwd => {
            const newUser = new User({
                name: name,
                email: email,
                password: encryptedPwd,
                posts: []
            });
            return newUser.save();
        })
        .then(result => {
            res.set('Content-Type', 'application/json');
            res.status(201).json({
                message: 'User created!', 
                userId: result._id
            });
        })
        .catch(err => {
            console.log('authController', 'putSignup', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        });



}