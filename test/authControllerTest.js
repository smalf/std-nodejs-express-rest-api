require('dotenv').config();

const assert = require('chai').assert;
const sinon = require('sinon');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const authController = require('../controllers/authController');
const accController = require('../controllers/accController');
const User = require('../models/user');
const { default: isEmail } = require('validator/lib/isEmail');

const { MONGODB_URI } = process.env;

const testUserId = '69517500970beb407993d2b5';

describe('Auth Controller - Login', function () {
    before(function (done) {
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
            .then(() => {
                done();
            })
    });

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
        // const next = sinon.spy();

        console.log('1) console.log visible');
        console.error('2) console.error visible');
        process.stdout.write('3) stdout.write visible\n');

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
                this.userStatus = data.status;
                return this;
            }
        };

        try {
            accController
                .getStatus(req, res, (err) => { })
                .then(() => {
                    console.log('accController', 'getStatus', 'start assertion');

                    try {
                        assert.equal(res.statusCode, 200);
                        assert.equal(res.userStatus, 'I am New!');
                        done();
                    } catch (err) {
                        done(err);
                    }
                    
                    // 
                })
                .catch(err => {
                    assert.equal(err.statusCode, 200);
                    done();
                });
        } catch (err) {
            console.log('1) console.log visible: ', err);
            console.error('2) console.error visible', err);
            process.stdout.write('3) stdout.write visible', err);


        }
    });

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});