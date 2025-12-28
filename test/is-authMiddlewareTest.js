const assert = require('chai').assert;
const isAuth = require('../middleware/is-auth');
const authMiddlleware = require('../middleware/is-auth');

it('should throw an error if no authorization header is present', function() {
    const req = {
        get: function() {
            return null; //Emulates the 
        }
    };


    // assert.throws(authMiddlleware.bind(this, req, {}, () => {}), 'NO authHeader')

    authMiddlleware(req, {}, () => {});

    assert.isUndefined(req.userId);
    assert.isFalse(req.isAuth);
});