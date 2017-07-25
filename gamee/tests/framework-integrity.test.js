const assert = require('assert');

import { gamee } from '../dist/gamee-js.min.js'

describe('Framework API', () => {
    it('gamee variable is an object', () => {
        assert.equal(typeof gamee, "object");
    });
    console.log(gamee);
    console.log(gamee.gamee);
    console.log(gamee.emitter);
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