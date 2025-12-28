const User = require('../models/user');
const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const { JWT_SECRET, JWT_EXPIRATION_TYME } = process.env;

module.exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loggedUser = await User.findOne({ email: email });
        if (!loggedUser) {
            const error = new Error('User with such an email doesn\'t exists.');
            error.statusCode = 401;
            throw error;
        }

        const doMatch = await bcript.compare(password, loggedUser.password);
        if (!doMatch) {
            const error = new Error('Wrong password or email!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loggedUser.email,
                userId: loggedUser._id.toString()
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
            userId: loggedUser._id
        })
        return;
    } catch (err) {
        console.log('authController', 'login', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
        return err;
    }
}

module.exports.putSignup = async (req, res, next) => {
    const errors = validationResult(req);
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!errors.isEmpty()) {
        console.log('authController', 'putSignup', `DATA: [ email: ${email}, name: ${name}] `);
        console.log('authController', 'putSignup', 'VALIDATION_ERROR: ' + errors.array()[0].msg);

        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    try {
        const encryptedPwd = await bcript.hash(password, 12);

        const newUser = new User({
            name: name,
            email: email,
            password: encryptedPwd,
            posts: []
        });
        const result = await newUser.save();
        res.set('Content-Type', 'application/json');
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        });

    } catch (err) {
        console.log('authController', 'putSignup', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}