import { core } from "./core.js"
import { CustomEmitter } from "../libs/shims.js"

/**
 * gameeAPI module desc
 * @module gameeAPI
 */

/**
 * Emit events
 * @class GameeEmitter
 * @extends CustomEmitter
 */
export var GameeEmitter = function () {
    CustomEmitter.call(this);
};


/**
 * @class Gamee
 * @requires core
 * 
 */
export var Gamee = function (platform) {
    /**
     * @instance
     * 
     * @fires gameeAPI:GameeEmitter~start
     * @fires gameeAPI:GameeEmitter~mute
     * @fires gameeAPI:GameeEmitter~unmute
     * @fires gameeAPI:GameeEmitter~pause
     * @fires gameeAPI:GameeEmitter~unpause
     * @fires gameeAPI:GameeEmitter~ghostHide
     * @fires gameeAPI:GameeEmitter~ghostShow
     */
    this.emitter = new GameeEmitter();
    this._platform = platform;
};

Gamee.prototype = (function () {

    var cbError = function (err) {
        if (err) {
            throw "Error " + err.toString();
        }
    };

    return {
        _controller: core.controller,
        /**
         * gameInit
         * @memberof Gamee
         * @param {string} controllType
         * @param {object} controllOpts
         * @param {string[]} capabilites
         * @param {gameInitCallback} cb 
         */
        gameInit: function (controllType, controllOpts, capabilities, cb) {
            var result = core.gameeInit(controllType, controllOpts, capabilities, cb);
            // cb(null, result);
        },

        /**
         * gameLoadingProgress
         * 
         * NOTE: There are 2 signatures for this function
         * 
         *     gamee.gameLoadingProgress()
         * 
         * @memberof Gamee
         * @param {number} percentage current loading progress
         * @param {Gamee~voidCallback} [opt_cb] 
         * 
         */
        gameLoadingProgress: function (percentage, opt_cb) {
            opt_cb = opt_cb || cbError;
            core.gameLoadingProgress(percentage);
            opt_cb(null);
        },

        /**
         * gameReady
         * 
         * @memberof Gamee
         * @param {Gamee~voidCallback} [opt_cb] 
         */
        gameReady: function (opt_cb) {
            opt_cb = opt_cb || cbError;
            core.gameReady();
            opt_cb(null);
        },

        /**
         * gameSave
         * 
         * NOTE: There are 2 signatures for this function
         * 
         *     gamee.gameSave(data, opt_cb)
         *     gamee.gameSave(data, opt_share, opt_cb)
         * 
         * @memberof Gamee
         * @param {object} data current loading progress
         * @param {boolean} [opt_share=false] 
         * @param {Gamee~voidCallback} [opt_cb] 
         * 
         */
        gameSave: function (data, opt_share, opt_cb) {
            var share = false, cb;
            if (typeof opt_share === 'undefined')
                cb = cbError;
            else if (typeof opt_share === 'function')
                cb = opt_share;
            else if (typeof opt_share === 'boolean') {
                share = opt_share;
                cb = opt_cb || cbError;
            }
            core.gameSave(data, share);
            cb(null);
        },

        /**
         * getPlatform
         * 
         * @memberof Gamee
         * @returns {string} platform type can be android | ios | web | fb
         */
        getPlatform: function () {
            return this._platform;
        },

        /**
         * updateScore
         * 
         * @memberof Gamee
         * @param {number} score
         * @param {boolean} [opt_ghostSign=false] If true, score will be updated for ghost instead. 
         * @param {Gamee~voidCallback} [opt_cb] 
         */
        updateScore: function (score, opt_ghostSign, opt_cb) {
            if (typeof opt_ghostSign === "function") {
                opt_cb = opt_ghostSign;
                opt_ghostSign = undefined;
            }
            opt_cb = opt_cb || cbError;
            core.updateScore(score, opt_ghostSign);
            opt_cb(null);
        },

        /**
         * gameOver
         * 
         * @memberof Gamee
         * @param {Gamee~ReplayData} [opt_replayData]
         * @param {Gamee~voidCallback} [opt_cb] 
         */
        gameOver: function (opt_replayData, opt_cb) {
            if (typeof opt_replayData === "function") {
                opt_cb = opt_replayData;
                opt_replayData = undefined;
            }
            opt_cb = opt_cb || cbError;
            core.gameOver(opt_replayData);
            opt_cb(null);
        },

        /**
         * requestSocialData
         * 
         * @memberof Gamee
         * @param {Gamee~requestSocialDataCallback} cb 
         */
        requestSocial: function (cb) {
            // functionality supposed to be removed once we do update for iOS
            if (this._platform === "ios") {
                var data = core.requestSocial(function (error, responseData) {
                    var modifiedResponse = {};
                    modifiedResponse.socialData = responseData;
                    cb(null, modifiedResponse);
                });
            } else {
                var data = core.requestSocial(cb);
            }
            //cb(null, data);
        }
    };

    /**
     * 
     * @typedef ReplayData
     * @param {string} variant
     * @param {string} data
     */

    /**
     * This callback is displayed as part of the Requester class.
     * @callback Gamee~voidCallback
     * @param {string} responseCode
     */

    /**
     * This callback is displayed as part of the Requester class.
     * @callback Gamee~gameInitCallback
     * @param {object} data
     * @param {string} responseCode
     */

    /**
     * This callback is displayed as part of the Requester class.
     * @callback Gamee~requestSocialDataCallback
     * @param {object} data
     * @param {string} responseCode
     */

})();

/**
 * Signals that game should start as normal|replay|ghost game. 
 * Signal means there is no overlay over the game. 
 * This signal is also being used for game restart. If previous 
 * instance of the game was running, it should be terminated without
 * any additional calls and current progress should be tossed. 
 * @event gameeAPI:GameeEmitter~start
 * @type {object}
 * @property {EventDetailStart} detail - Common property of events
 */

/**
 * Data carried with start event. 
 * @typedef EventDetailStart
 * @property {Gamee~voidCallback} callback - called after finishing task
 * @property {boolean} [opt_resetState=false] - if true, game must delete current progress and saved progress
 * @property {boolean} [opt_replay] - if true, game must run in replay mode
 * @property {boolean} [opt_ghostMode] - if true, game must run in ghost mode
 */

/**
 * After that signal, game must silent all sounds immediately. 
 * Game must remain silent until unmute signal occures. 
 * @event gameeAPI:GameeEmitter~mute
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * After unmute signal, game can play sounds again. 
 * @event gameeAPI:GameeEmitter~unmute
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * Pause signal means there appeared overlay over the game. Player
 * is unable to reach the context of the game anymore. So game should
 * pause all its acctions immediately. 
 * @event gameeAPI:GameeEmitter~pause
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * Unpause signal means there is no overlay over the game anymore. 
 * Game should continue with all previous actions. 
 * @event gameeAPI:GameeEmitter~unpause
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * Signal ghostHide can appear only if game is running in ghost mode.
 * Game should hide ghost behavior and look like exactly as game without 
 * the ghost (if this is possible). 
 * @event gameeAPI:GameeEmitter~ghostHide
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * Signal ghostShow can appear only if game is running in ghost mode. 
 * Game should show ghost again if it was hidden. If ghost died or ended
 * while it was hidden, game should point that out, so the player can understand
 * why the ghost is not visible anymore.  
 * @event gameeAPI:GameeEmitter~ghostShow
 * @type {object}
 * @property {EventDetailVoid} detail - Common property of events
 */

/**
 * Data carried with various events. Contains only callback method. 
 * @typedef {object} EventDetailVoid
 * @property {Gamee~voidCallback} callback - call after finishing task
 */

/**
 * @type {function}
 * @param {MyEvent} e - The observable event.
 * @listens gameeAPI:GameeEmitter~event:snowball
 */