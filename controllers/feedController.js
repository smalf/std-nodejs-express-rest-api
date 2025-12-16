
module.exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            { title: "Post 1st" }, 
            { title: "Post 2nd" }, 
            { title: "Post 3rd" }
        ]
    });
}