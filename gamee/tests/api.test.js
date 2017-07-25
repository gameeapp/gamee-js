const assert = require('assert');

import { gamee } from '../dist/gamee-js.min.js'

describe('Framework API', () => {

    it('gamee.getPlatform returns platform', () => {
        assert.equal(gamee.getPlatform(), "web" || "ios" || "android" || "fb");
    });
});