const assert = require('assert');
const gamee = require('../dist/gamee-js.min.js');

describe('Framework integrity', () => {
    it('gamee variable defined', () => {
        assert.equal(typeof gamee === "object");
    });
});