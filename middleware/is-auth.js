const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
    console.log("is-auth", "middleware");
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        console.log("is-auth", "middleware", "NO authHeader");
        req.isAuth = false;
        console.log("is-auth", "middleware", "Req.isAuth = " + req.isAuth);
        return next();
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.log("is-auth", "middleware", "Error whe JWT verify, err= " + err);
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        console.log("is-auth", "middleware", "Error No Decoded Token!");
        req.isAuth = false;
        return next();
    }
    
    console.log("is-auth", "middleware", "All good write decoded Token. decodedToken = " + decodedToken);
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
};