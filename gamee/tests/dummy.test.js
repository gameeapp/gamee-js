const assert = require('assert');


const gamee = require('../dist/gamee-js.min.js');

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

describe('Framework integrity', () => {
    it('gamee variable defined', () => {
        assert.equal(typeof gamee, "object");
    });
});