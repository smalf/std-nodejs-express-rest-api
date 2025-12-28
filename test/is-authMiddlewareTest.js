const assert = require('chai').assert;
const isAuth = require('../middleware/is-auth');
const authMiddlleware = require('../middleware/is-auth');

describe('Auth Middleware Tests', function () {
    it('should throw an error if no authorization header is present', function () {
        const req = {
            get: function () {
                return null; //Emulates the 
            }
        };


        // assert.throws(authMiddlleware.bind(this, req, {}, () => {}), 'NO authHeader')

        authMiddlleware(req, {}, () => { });

        assert.isUndefined(req.userId);
        assert.isFalse(req.isAuth);
    });

    it('should throw an error if the auth header is only 1 string (not Brearer token)', function () {
        const req = {
            get: function (header) {
                return "testTokenBrearToken"; //Emulates the 
            }
        };

        authMiddlleware(req, {}, () => { });

        assert.isUndefined(req.userId);
        assert.isFalse(req.isAuth);

        // assert.throws(authMiddlleware.bind(this, req, {}, () => {}), 'Cannot read properties of testTokenBrearToken (reading \'split\')');
        // assert.throws(authMiddlleware.bind(this, req, {}, () => { }), TypeError);
    });

});
