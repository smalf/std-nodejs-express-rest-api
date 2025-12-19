const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getStatus = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }

            res.status(200).json({
                    message: 'Status succesfully retrieved.',
                    status: user.status
            });
        })
        .catch(err => {
            console.log('statusController', 'getStatus', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        });
}