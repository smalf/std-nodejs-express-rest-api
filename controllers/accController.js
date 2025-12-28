const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getStatus = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({
            message: 'Status succesfully retrieved.',
            status: user.status
        });
    } catch (err) {
        console.log('statusController', 'getStatus', 'ERROR: ' + err);

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        throw err;
        // next(err);
    }

}

exports.updateStatus = async (req, res, next) => {
    const errors = validationResult(req);
    const status = req.body.status;
    const userId = req.userId;

    console.log('statusController', 'updateStatus', 'status: ' + status);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect. Error: ' + errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }

    try {
        const loggedUser = await User.findById(userId);
        if (!loggedUser) {
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }

        loggedUser.status = status;
        await loggedUser.save();

        res.status(200).json({
            message: 'Status succefully updated',
            status: loggedUser.status
        });

    } catch (err) {

        console.log('statusController', 'updateStatus', 'ERROR: ' + err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        //next will redirect an error to the top level promise. In our case it will be the root one in the app.js.
        next(err);
    }
}