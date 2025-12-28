const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
    console.log("is-auth", "middleware");
    const authHeader = req.get('Authorization');

    // 1. Header missing
    if (!authHeader) {
        console.log("is-auth", "middleware", "No Authorization Header!");
        req.isAuth = false;
        return next();
    }
    // 2. Header must be a string
    if (typeof authHeader !== 'string') {
        req.isAuth = false;
        return next();
    }

    // 3. Header must be "Bearer <token>"
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        req.isAuth = false;
        return next();
    }

    // const token = authHeader.split(' ')[1];
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