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

exports.updateStatus = (req, res, next) => {
    const errors = validationResult(req);
    const status = req.body.status;
    const userId = req.userId;

    console.log('statusController', 'updateStatus', 'status: ' + status);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect. Error: ' + errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }

    let loggedUser;

    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }

            loggedUser = user;
            loggedUser.status = status;
            return loggedUser.save();

        })
        .then(result => {
            res.status(200).json({
                message: 'Status succefully updated',
                status: loggedUser.status
            });
        })
        .catch(err => {
            console.log('statusController', 'updateStatus', 'ERROR: ' + err);

            if (!err.statusCode) {
                err.statusCode = 500;
            }
            //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
            next(err);
        });
}