const bcrypt = require('bcryptjs');
const validator = require('validator');

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION_TYME } = process.env;

const User = require('../models/user');
const Post = require('../models/post');

const { clearImage } = require('../middleware/fileUtils');

module.exports = {
    createUser: async function ({ userInput }, context) {
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

    },
    login: async function ({ email, password }, context) {
        const loggedUser = await User.findOne({ email: email });
        if (!loggedUser) {
            const error = new Error('User with such an email doesn\'t exist.');
            error.code = 401;
            throw error;
        }

        try {
            const doMatch = await bcrypt.compare(password, loggedUser.password);
            if (!doMatch) {
                const error = new Error('Wrong password or email!');
                error.code = 401;
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
            return {
                token: token,
                userId: loggedUser._id.toString()
            }
        } catch (err) {
            console.log('login', 'ERROR: ' + err);

            if (!err.code) {
                err.code = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            throw err;
        }
    },
    createPost: async function ({ postInput }, context) {
        if (!context.req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const errors = [];

        const title = validator.trim(postInput.title);
        const content = validator.trim(postInput.content);
        const imageUrl = postInput.imageUrl;

        if (!validator.isLength(title, { min: 5 })) {
            errors.push({ message: 'Title should include at list 5 characters.' });
        }

        if (!validator.isLength(content, { min: 5 })) {
            errors.push({ message: 'Content should include at list 5 characters.' });
        }

        if (errors.length > 0) {
            const error = new Error('New Post Validation failed. Entered data is incorrect.');
            error.code = 422;
            error.data = errors;
            throw error;
        }

        const user = await User.findById(context.req.userId);
        if (!user) {
            const error = new Error('Invalid User.');
            error.code = 401;
            throw error;
        }

        try {

            const post = new Post({
                title: title,
                content: content,
                imageUrl: imageUrl,
                creator: user,
            });


            const createdPost = await post.save();
            console.log('createPost', 'RESULT: ' + createdPost);

            // const creator = await User.findById(userId);
            user.posts.push(post);

            await user.save();
            //Create post in DB.
            //STAUTS 201 means resource was succesfully created.

            return {
                ...createdPost._doc,
                _id: createdPost._id.toString(),
                createdAt: createdPost.createdAt.toISOString(),
                updatedAt: createdPost.updatedAt.toISOString(),
            }
        } catch (err) {
            console.log('createPost', 'ERROR: ' + err);

            if (!err.code) {
                err.code = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            throw err;
        }
    },
    getPosts: async function ({ currentPage, pageSize }, context) {
        // const perPage = 5;
        try {
            const totalItems = await Post.find().countDocuments();
            const posts = await Post.find()
                .populate('creator')
                .skip((currentPage - 1) * pageSize)
                .limit(pageSize);


            return {
                totalItems: totalItems,
                posts: posts.map(post => {
                    return {
                        ...post._doc,
                        _id: post._id.toString(),
                        createdAt: post.createdAt.toISOString(),
                        updatedAt: post.updatedAt.toISOString(),
                    };
                })
            };


        } catch (err) {
            console.log('getPosts', 'ERROR: ' + err);

            if (!err.code) {
                err.code = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            throw err;
        }
    },
    getPost: async function ({ postId }, context) {
        if (!context.req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        try {

            const post = await Post.findById(postId).populate('creator');

            if (!post) {
                const error = new Error('Post with such an Id doe not esists.');
                error.statusCode = 404;
                throw error;
            }

            return {
                ...post._doc,
                _id: post._id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
            }

        } catch (err) {
            console.log('getPosts', 'ERROR: ' + err);

            if (!err.code) {
                err.code = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            throw err;
        }

    },
    deletePost: async function ({ postId }, context) {
        if (!context.req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        try {
            const post = await Post.findById(postId);
            if (!post) {
                const error = new Error('Post with such an Id doe not esists.');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== context.req.userId) {
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }

            clearImage(post.imageUrl);
            await post.deleteOne();

            const user = await User.findById(context.req.userId);
            user.posts.pull(postId);
            await user.save();

            return {
                deletedPost: post._id.toString()
            };
        } catch (err) {
            console.log('getPosts', 'ERROR: ' + err);

            if (!err.code) {
                err.code = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            throw err;
        }
    }
};