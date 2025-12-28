const assert = require('chai').assert;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

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

    it('should yield a userId if JWT token can be verified.', function() {
        const req = {
            get: function (header) {
                return "Bearer xasdfasdfyzasdfasdfAasdfkjh";
            }
        };

        //Manually overrides external dependency!
        const jwtStub = sinon.stub(jwt, 'verify').returns({
            userId: 'abc'
        });
        
        authMiddlleware(req, {}, () => { });


        assert.isTrue(jwtStub.calledOnce);
        assert.property(req, 'userId');
        assert.equal(req.userId, 'abc');

        jwtStub.restore();
        // jwt.verify.restore();
    });
});
