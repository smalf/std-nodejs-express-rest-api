
module.exports.getPosts = (req, res, next) => {
    res.set('Content-Type', 'application/json');
    res.status(200).json({
        posts: [
            { title: "Post 1st", content: "This is the first post!!!" }
        ]
    });
}

module.exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    //Create post in DB.
    //STAUTS 201 means resource was succesfully created.
    res.set('Content-Type', 'application/json');
    res.status(201).json({
        message: 'Post created successfully!',
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    });
}