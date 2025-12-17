
const { validationResult } = require('express-validator');

module.exports.getPosts = (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.status(200).json({
        posts: [
            {
                _id: 'record_1',
                title: 'Post 1st',
                content: 'This is the first post!!!',
                imageUrl: 'images/fav.png',
                creator: {
                    name: 'Serhii M.'
                },
                createdAt: new Date()
            }
        ]
    });
}

module.exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation failed. ', errors: errors.array() });
    }

    //Create post in DB.
    //STAUTS 201 means resource was succesfully created.
    res.set('Content-Type', 'application/json');
    res.status(201).json({
        message: 'Post created successfully!',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content,
            creator: {
                name: 'Serhii M.'
            },
            createdAt: new Date()
        }
    });
}