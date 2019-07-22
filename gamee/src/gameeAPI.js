import { core } from "./core.js"
import { CustomEmitter } from "../libs/shims.js"
import { validateDataType } from "./core.js"

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
         * @param {string[]} capabilities
         * @param {gameInitCallback} cb
         * @param {boolean} silentMode
         */
        gameInit: function (controllType, controllOpts, capabilities, cb, silentMode = false) {
            validateDataType(controllType, "string", "controllType", "gamee.updateScore");
            validateDataType(controllOpts, "object", "controllOpts", "gamee.gameInit");
            validateDataType(capabilities, "array", "capabilities", "gamee.gameInit");
            validateDataType(cb, "function", "cb", "gamee.gameInit");
            validateDataType(silentMode, "boolean", "silentMode", "gamee.gameInit");
            var result = core.gameeInit(controllType, controllOpts, capabilities, cb, silentMode);
            // cb(null, result);
        },

        /**
         * gameLoadingProgress
         *
         *     gamee.gameLoadingProgress()
         *
         * @memberof Gamee
         * @param {number} percentage current loading progress
         * @param {Gamee~voidCallback} [opt_cb]
         *
         */
        gameLoadingProgress: function (percentage, opt_cb) {
            validateDataType(percentage, "number", "percentage", "gamee.gameLoadingProgress");
            opt_cb = opt_cb || cbError;
            validateDataType(opt_cb, "function", "opt_cb", "gamee.gameLoadingProgress");
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
            validateDataType(opt_cb, "function", "opt_cb", "gamee.gameReady");
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
         * @param {String} data current ingame progress
         * @param {Boolean} [opt_share=false]
         * @param {Gamee~voidCallback} [opt_cb]
         *
         */
        gameSave: function (data, opt_share, opt_cb) {
            var share = false, cb;
            validateDataType(data, "string", "data", "gamee.gameSave");
            if (typeof opt_share === 'function')
                opt_cb = opt_share;
            else if (typeof opt_share !== "undefined")
                validateDataType(opt_share, "boolean", "opt_share", "gamee.gameSave");

            opt_cb = opt_cb || cbError;
            validateDataType(opt_cb, "function", "opt_cb", "gamee.gameSave");
            core.gameSave(data, share);
            opt_cb(null);
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
            validateDataType(score, "number", "score", "gamee.updateScore");
            if (typeof opt_ghostSign === "function")
                opt_cb = opt_ghostSign;
            else if (typeof opt_ghostSign !== "undefined")
                validateDataType(opt_ghostSign, "boolean", "opt_ghostSign", "gamee.updateScore");

            opt_cb = opt_cb || cbError;
            validateDataType(opt_cb, "function", "opt_cb", "gamee.updateScore");
            core.updateScore(score, opt_ghostSign);
            opt_cb(null);
        },

        /**
         * gameOver
         *
         * @memberof Gamee
         * @param {Gamee~ReplayData} [opt_replayData]
         * @param {Gamee~voidCallback} [opt_cb]
         * @param {Gamee~object} [opt_saveState]
         * @param {Gamee~boolean} [opt_hideOverlay]
         */
        gameOver: function (opt_replayData, opt_cb, opt_saveState, opt_hideOverlay) {
            if (typeof opt_replayData === "function")
                opt_cb = opt_replayData;
            else if (typeof opt_replayData !== "undefined")
                validateDataType(opt_replayData, "object", "opt_replayData", "gamee.gameOver");

            if (typeof opt_hideOverlay !== 'undefined') {
                validateDataType(opt_hideOverlay, "boolean", "opt_hideOverlay", "gamee.gameOver");
            }

            opt_cb = opt_cb || cbError;
            validateDataType(opt_cb, "function", "opt_cb", "gamee.gameOver");
            core.gameOver(opt_replayData, opt_saveState, opt_hideOverlay);
            opt_cb(null);
        },

        /**
         * requestSocialData
         *
         * @memberof Gamee
         * @param {Gamee~requestSocialDataCallback} cb
         * @param {number} numberOfPlayers
         */
        requestSocial: function (cb, numberOfPlayers) {
            validateDataType(cb, "function", "cb", "gamee.requestSocial");

            // functionality supposed to be removed once we do update for iOS
            var data = core.requestSocial(function (error, responseData) {
                var modifiedResponse = !responseData.hasOwnProperty("socialData") ? { socialData: responseData } : responseData;
                cb(null, modifiedResponse);
            }, numberOfPlayers);

            // var data = core.requestSocial(cb);
            //cb(null, data);
        },

         /**
         * logEvent
         *
         * @memberof Gamee
         * @param {string} eventName
         * @param {string} eventValue
         */
        logEvent: function (eventName, eventValue) {

            validateDataType(eventName,"string","eventName","gamee.logEvent");

            if(!eventName || eventName.length > 24){
                console.error("eventName parameter cant be null and can only contain up to 24 characters");
                return
            }

            validateDataType(eventValue,"string","eventValue","gamee.logEvent");

            if(!eventValue || eventValue.length > 160){
                console.error("eventValue parameter cant be null and can only contain up to 160 characters");
                return
            }

            core.logEvent(eventName,eventValue);
        },

        /**
         * requestBattleData
         *
         * @memberof Gamee
         * @param {Gamee~requestBattleDataDataCallback} cb
         */
        requestBattleData: function (cb) {
            validateDataType(cb, "function", "cb", "gamee.requestBattleData");

            core.requestBattleData(cb);
        },

        /**
         * requestPlayerReplay
         *
         * @memberof Gamee
         * @param {number} userID
         * @param {Gamee~requestPlayerReplayDataCallback} cb
         */
        requestPlayerReplay: function (userID, cb) {

            validateDataType(userID, "number", "userID", "gamee.requestPlayerReplay");
            validateDataType(cb, "function", "cb", "gamee.requestPlayerReplay");

            core.requestPlayerReplay(userID, cb);
        },

        /**
         * requestPlayerSaveState
         *
         * @memberof Gamee
         * @param {number} userID
         * @param {Gamee~requestPlayerSaveStateDataCallback} cb
         */
        requestPlayerSaveState: function (userID, cb) {

            validateDataType(userID, "number", "userID", "gamee.requestPlayerSaveState");
            validateDataType(cb, "function", "cb", "gamee.requestPlayerSaveState");

            core.requestPlayerSaveState(userID, cb);
        },

        /*
        *puchaseitem
        *@member of Gamee
        *@param {object} purchaseDetails
        *@param {Gamee~purchaseItemDataCallback} cb
        */
        purchaseItem: function (purchaseDetails,cb){

            validateDataType(purchaseDetails,"object","purchaseDetails","gamee.purchaseItem");
            validateDataType(cb,"function","cb","gamee.purchaseItem");

            core.purchaseItem(purchaseDetails,cb)
        },

        /*
        *puchaseitemwithgems
        *@member of Gamee
        *@param {object} purchaseDetails
        *@param {Gamee~purchaseItemDataCallback} cb
        */
        purchaseItemWithGems: function (purchaseDetails,cb) {

            validateDataType(purchaseDetails,"object","purchaseDetails","gamee.purchaseItemWithGems");
            validateDataType(cb,"function","cb","gamee.purchaseItemWithGems");

            core.purchaseItemWithGems(purchaseDetails,cb)
        },

        /*share
        *@member of Gamee
        *@param {object} shareDetails
        *@param {Gamee~shareDataCallback} cb
        */
        share: function (shareDetails,cb){
            validateDataType(shareDetails,"object","shareDetails","gamee.share");
            validateDataType(cb,"function","cb","gamee.share");

            core.share(shareDetails,cb)
        },

        /*
        *loadRewardedVideo
        *@member of Gamee
        *@param {Gamee~loadRewardedVideo} cb
        */
        loadRewardedVideo: function (cb){

            validateDataType(cb,"function","cb","gamee.loadRewardedVideo");
            core.loadRewardedVideo(cb)
        },

        /*
        *showRewardedVideo
        *@member of Gamee
        *@param{Gamee~showRewardedVideo} cb
        */
        showRewardedVideo: function (cb){

            validateDataType(cb,"function","cb","gamee.showRewardedVideo");
            core.showRewardedVideo(cb)
        },

        /**
        *requestPlayerData
        *@member of Gamee
        *@param{Gamee~requestPlayerData} cb
        * @param {number} userID
        */
        requestPlayerData: function (cb, userID){

            validateDataType(cb,"function","cb","gamee.requestPlayerData");
            if (userID !== undefined) {
                validateDataType(userID,"number","userId","gamee.requestPlayerData");
            }
            core.requestPlayerData(cb, userID)
        },
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
