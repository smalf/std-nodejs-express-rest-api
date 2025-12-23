const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];

        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Please enter a valied email!' });
        }
        const oldUser = await User.findOne({ email: userInput.email });
        if (oldUser) {
            errors.push({ message: 'E-Mail already registered, please pick a different one!' })
        }

        const email = validator.normalizeEmail(userInput.email);
        const name = validator.trim(userInput.name);
        const password = validator.trim(userInput.password);

        if (!validator.isLength(password, { min: 5 }) || !validator.isAlphanumeric(password)) {
            errors.push({ message: 'Please enter a password with only numbers and text and at list 5 characters.' });
        }
        if (validator.isEmpty(name)) {
            errors.push({ message: 'Name should not be empty.' });
        }

        if (errors.length > 0) {
            // console.log('authController', 'putSignup', `DATA: [ email: ${email}, name: ${name}] `);
            // console.log('authController', 'putSignup', 'VALIDATION_ERROR: ' + errors.array()[0].msg);
            const error = new Error('Validation failed. Entered data is incorrect.');
            error.code = 422;
            error.data = errors;
            throw error;
        }

        const encryptedPwd = await bcrypt.hash(password, 12);

        const newUser = new User({
            name: name,
            email: email,
            password: encryptedPwd,
            posts: []
        });
        const createdUser = await newUser.save();
        return {
            ...createdUser._doc, _id: createdUser._id.toString()
        };

    }
};