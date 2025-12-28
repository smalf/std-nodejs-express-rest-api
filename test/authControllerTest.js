require('dotenv').config();

const assert = require('chai').assert;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authController = require('../controllers/authController');
const accController = require('../controllers/accController');
const User = require('../models/user');
const { expect } = require('chai');
const { default: isEmail } = require('validator/lib/isEmail');

const { MONGODB_URI } = process.env;

describe('Auth Controller - Login', function () {

    //done - is a parameter that allows to test the aync code.
    it('should throw a 500 error if accessing the database fails.', function (done) {
        const userStub = sinon.stub(User, 'findOne');
        userStub.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'testPassword'
            }
        };

        authController.login(req, {}, () => { }).then(result => {
            console.log('authControllerTest', result);
            assert.equal(result.statusCode, 500);
            done();
        })

        //test async function.
        // expect(authController.login);
        userStub.restore();
    });

    it('should send a responce with valid user status for an existing user', function (done) {
        const testUserId = '69517500970beb407993d2b5';
        const req = {
            userId: testUserId
        };
        const res = {
            statusCode: 500,
            userStatus: null,

            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data;
                return this;
            }
        };

        //Connect to the DB.
        mongoose.connect(MONGODB_URI)
            .then(result => {
                const user = new User({
                    name: "Test",
                    email: "test@test.com",
                    password: "tester",
                    posts: [],
                    _id: testUserId
                });

                return user.save();
            })
            .then(result => {
                accController.getStatus(req, res, () => { }).then(() => {
                    assert.equal(res.statusCode, 401);
                    // assert.equal(res.userStatus, 'I am New.');
                    User.deleteMany({})
                        .then(() => {
                            mongoose.disconnect();
                        })
                        .then(() => {
                            done();
                        });
                });
            })
            .catch(error => {
                console.log(error);
                User.deleteMany({}).then(() => {
                    mongoose.disconnect();
                }).then(() => {
                    done();
                })
            });
    });

});