const { Result } = require('express-validator');

const assert = require('chai').assert;

it('Should add numbers correctly (Hello workd)', function() {
    const a = 100;
    const b = 4;

    const result = a + b;
    assert.equal(result, 104);
})