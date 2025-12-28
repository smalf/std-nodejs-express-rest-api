const assert = require('chai').assert;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/authController');
const User = require('../models/user');
const { expect } = require('chai');
const { default: isEmail } = require('validator/lib/isEmail');

describe('Auth Controller - Login', function () {

    //done - is a parameter that allows to test the aync code.
    it('should throw a 500 error if accessing the database fails.', function(done) {
        const userStub = sinon.stub(User, 'findOne');
        userStub.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'testPassword'
            }
        };
        
        authController.login(req, {}, () => {}).then(result => {
            console.log('authControllerTest', result);
            assert.equal(result.statusCode, 500);
            done();
        })

        //test async function.
        // expect(authController.login);
        userStub.restore();
    });

});