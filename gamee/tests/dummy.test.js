const assert = require('assert');

describe('Dummy test pass', () => {
    it('should add correctly', () => {
        assert.equal(2, 2);
    });
});

describe('Dummy test fail', () => {
    it('should add correctly', () => {
        assert.equal(3, 2);
    });
});