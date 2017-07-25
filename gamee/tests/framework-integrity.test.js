const assert = require('assert');

import { gamee } from '../dist/gamee-js.min.js'

describe('Test of properties of the gamee object', () => {
    // gamee object
    it('gamee variable is an object', () => {
        assert.equal(typeof gamee, "object");
    });

    // basic properties
    it('gamee.gameInit is a function', () => {
        assert.equal(typeof gamee.gameInit, "function");
    });
    it('gamee.gameReady is a function', () => {
        assert.equal(typeof gamee.gameReady, "function");
    });
    it('gamee.updateScore is a function', () => {
        assert.equal(typeof gamee.updateScore, "function");
    });
    it('gamee.gameOver is a function', () => {
        assert.equal(typeof gamee.gameOver, "function");
    });
    it('gamee.emitter is an object', () => {
        assert.equal(typeof gamee.emitter, "object");
    });

    // advanced properties
    it('gamee.getPlatform is a function', () => {
        assert.equal(typeof gamee.getPlatform, "function");
    });
    it('gamee.gameLoadingProgress is a function', () => {
        assert.equal(typeof gamee.gameLoadingProgress, "function");
    });
    it('gamee.gameSave is a function', () => {
        assert.equal(typeof gamee.gameSave, "function");
    });
    it('gamee.requestSocial is a function', () => {
        assert.equal(typeof gamee.requestSocial, "function");
    });
});