import * as controllers from "./game_controllers.js"
import { wrapKeyEvent } from "../libs/shims.js"

// unlock audio
// overrides native AudioContext & webkitAudioContext
(function () {
    // this works as a constructor
    var overloadedAudioContext = function (type) {
        var ctx = new type();

        // add audio resume to function on touchstart
        if (ctx.state === 'suspended') {

            var resume = function () {

                // Check if hack is necessary. Only occurs in iOS6+ devices
                // and only when you first boot the iPhone, or play a audio/video
                // with a different sample rate
                if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
                    var buffer = ctx.createBuffer(1, 1, 44100);
                    var dummy = ctx.createBufferSource();
                    dummy.buffer = buffer;
                    dummy.connect(ctx.destination);
                    dummy.start(0);
                    dummy.disconnect();
                }

                ctx.resume();
                setTimeout(function () {
                    if (ctx.state === 'running') {
                        document.body.removeEventListener([
                            'touchcancel',
                            'touchend',
                            'touchenter',
                            'touchleave',
                            'touchmove',
                            'touchstart',
                            'mouseenter',
                            'mouseover',
                            'mousemove',
                            'mousedown',
                            'mouseup'
                        ].join(" "), resume, false);
                    }
                }, 0);
            };

            // only touchend will work, but hey, we tried...
            // https://github.com/WebAudio/web-audio-api/issues/836
            // https://www.chromestatus.com/feature/6406908126691328
            document.body.addEventListener([
                'touchcancel',
                'touchend',
                'touchenter',
                'touchleave',
                'touchmove',
                'touchstart',
                'mouseenter',
                'mouseover',
                'mousemove',
                'mousedown',
                'mouseup'
            ].join(" "),
                resume, false);
        }
        // allowed in JS to return different type of the object in the constructor
        return ctx
    };

    try {
        if (typeof window.AudioContext !== 'undefined') {
            window.AudioContext = overloadedAudioContext.bind(null, window.AudioContext);
        } else if (typeof webkitAudioContext !== 'undefined') {
            window.webkitAudioContext = overloadedAudioContext.bind(null, window.webkitAudioContext);
        }
    } catch (e) { // throw error in async part
        setTimeout(() => {
            throw e;
        }, 0)
    }
})();


/**
 * @class core
 */
export var core = (function () {

    // # Gamee.js
    //
    // This file defines and expose a public API for games to communicate
    // with Gamee*.
    //
    // Also it handles some requirements when Gamee is run in an desktop
    // environment.
    //
    // \* _later in the document Gamee will be referred as GameeApp to not
    // be mistaken for word game_
    //
    // ** _GameeWebApp will refer to Gamee which is running in a desktop
    // browser_

    /** an empty function */
    var noop = function () { };

    var cache = {};

    /** internal variables/constants (uppercase) coupled inside separate object for potential easy referencing */
    var internals = {
        VERSION: "2.3.0", // version of the gamee library
        CAPABILITIES: ["ghostMode", "saveState", "replay", "socialData","rewardedAds","coins","logEvents","playerData","share", "gems"], // supported capabilities
        variant: 0, // for automating communication with server
        soundUnlocked: false,
        onReady: noop, // for intercepting real onReady because of behind the scenes variant handling
        onGameStart: noop // for intercepting real onGameStart because of unlocking sound
    };

    /** ## gamee
     *
     * GameeApp interface for games. It is exposed as a `gamee` global
     * object and games should only use its public methods and
     * properties to communicate with the GameeApp.
     *
     * _There is also [$gameeNative](gamee_native.js.html) global object
     * which handles internal parts of the communication._
     */
    var core = {};

    //
    // ## Signaling game state
    //
    // The game should signal the GameeApp its status (playing/game-over)
    // and current score.
    //

    /** ### gamee.gameeInit
     *
     * Must be called first before any other gamee calls
     * returns controller object the same way requestController did previously
     * ctrlType/ctrlOpts - requested control type + options
     * capabilities -> array of strings representing supported features:
     * after the initialization onReady is invoked and after that game can use the api
     */
    core.gameeInit = function (ctrlType, ctrlOpts, capabilities, cb, silentMode = false) {
        // let's validate the array here, so that all backends can benefit from it
        var allOk = true, cap = {};
        if ((capabilities !== undefined) && (Array.isArray(capabilities))) {
            for (var i = 0; i < capabilities.length; i++) {
                if ((typeof capabilities[i] !== "string") ||
                    (internals.CAPABILITIES.indexOf(capabilities[i]) === -1)) allOk = false;
                cap[capabilities[i]] = true;
            }
        } else allOk = false;

        if (!allOk)
            throw "Capabilities array passed to gameeInit is void, malformed or unsupported capabilites requested.";
        // TODO remove
        // gameeNative.gameeInit(core, internals.VERSION, ctrlType, allOk ? capabilities : []);

        this.native.createRequest("init", {
            version: internals.VERSION,
            controller: ctrlType,
            capabilities: cap
        }, function (responseData) {
            // remember capabilities of the game
            cache.capabilities = cap;
            //
            // // Mute gamee-js console output
            // cache.silentMode = silentMode;

            // might fail if controller of this type doesnt exist
            var error = null;
            try {
                if (this.native.platform === "web") {
                    responseData.controller = core.controller.requestController(ctrlType, { enableKeyboard: true });
                    this._bindKeyboardTriggers(responseData.controller);
                } else {
                    responseData.controller = core.controller.requestController(ctrlType, {});
                }
            } catch (err) {
                error = err;
            }

            cb(error, responseData);
        }.bind(this));
        // TODO remove
        // return core.controller.requestController(ctrlType, ctrlOpts);
    };

    core._bindKeyboardTriggers = function (controller) {
        global.addEventListener('message', function (ev) {
            switch (ev.data[0]) {
                case 'button_button_down':
                    controller.trigger("keydown", { button: "button" });
                    break;

                case 'button_button_up':
                    controller.trigger("keyup", { button: "button" });
                    break;

                case 'button_left_up':
                    controller.trigger("keyup", { button: "left" });
                    break;

                case 'button_left_down':
                    controller.trigger("keydown", { button: "left" });
                    break;

                case 'button_right_down':
                    controller.trigger("keydown", { button: "right" });
                    break;

                case 'button_right_up':
                    controller.trigger("keyup", { button: "right" });
                    break;

                case 'button_up_down':
                    controller.trigger("keydown", { button: "up" });
                    break;

                case 'button_up_up':
                    controller.trigger("keyup", { button: "up" });
                    break;

                case 'button_down_down':
                    controller.trigger("keydown", { button: "down" });
                    break;

                case 'button_down_up':
                    controller.trigger("keyup", { button: "down" });
                    break;

                case 'button_a_down':
                    controller.trigger("keydown", { button: "A" });
                    break;

                case 'button_a_up':
                    controller.trigger("keyup", { button: "A" });
                    break;

                case 'button_b_down':
                    controller.trigger("keydown", { button: "B" });
                    break;

                case 'button_b_up':
                    controller.trigger("keyup", { button: "B" });
                    break;
            }
        });
    };

    /** ### gamee.gameLoadingProgress
     *
     * Indicates how much content is already loaded in %.
     */
    core.gameLoadingProgress = (function () {
        var percentageSoFar = 0;

        return function (percentage) {
            if ((typeof percentage !== "number") || (percentage < 0) || (percentage > 100))
                throw "Percentage passed to gameLoadingProgress out of bounds or not a number.";
            else if (percentage > percentageSoFar) {
                percentageSoFar = percentage;
                this.native.createRequest("gameLoadingProgress", { percentage: percentage });
            }
        };
    })();


    /** ### gamee.gameReady
     *
     * Notifies platform game can accept start command.
     */
    core.gameReady = function () {
        this.native.createRequest("gameReady");
    };

    /** ### gamee.gameStart
     *
     * Indicates that game is ready to be started (even after restart).
     */
    // core.gameStart = function () {
    //     gameeNative.gameLoadingProgress(100); // FB requires this
    //     gameeNative.gameStart(gamee);
    // };

    /** ### gamee.updateScore
     *
     * sends score to UI
     */
    core.updateScore = function (score, opt_ghostSign) {
        if (typeof score !== "number")
            throw "Score passed to updateScore is not a number.";
        var data = {
            score: parseInt(score, 10)
        };
        if (opt_ghostSign) {
            data.ghostSign = true;
        }
        this.native.createRequest("updateScore", data);
        // core.native.createRequest(method, requestData, callback);
    };

    /** ### gamee.gameOver
     *
     * Indicates the game has ended, the game is waiting for subsequent onGameStart.
     * Data has the same format as data received in onReady callback.
     * Data must be string = responsibility for turning data structure into string is left to the game!
     */
    core.gameOver = function (opt_replayData, opt_saveState, opt_hideOverlay) {
        opt_hideOverlay = opt_hideOverlay !== undefined ? opt_hideOverlay : false;
        // var allOk = ((data !== undefined) && (typeof data === "string")) || (data === undefined);
        // if (!allOk) console.error("Data provided to gameOver function must be string.");
        // gameeNative.gameOver(gamee, internals.variant, allOk ? data : "");
        var requestData = {};
        if (opt_replayData) {
            if (!opt_replayData.hasOwnProperty("variant")) {
                opt_replayData.variant = "";
            }
            if (!opt_replayData.hasOwnProperty("data")) {
                throw "Replay data must have `data` property";
            }
            requestData.replayData = opt_replayData;
        }
        requestData.hideOverlay = opt_hideOverlay;

        if (opt_saveState) {
            requestData.state = opt_saveState;
        }

        core.native.createRequest("gameOver", requestData);
    };

    /** ### gamee.gameSave
     *
     * Player has requested saving current game's state
     * data must be string = responsibility for turning data structure into string is left to game!
     * share must be expression evaluating to either true or false; it indicates, whether the game progress should be shared on feed
     */
    core.gameSave = function (data, share) {

        if(!cache.capabilities.saveState)
            throw "Save State not supported, you must add the capability on gamee.Init";

        core.native.createRequest("saveState", { state: data, share: share });
    };

    core.requestSocial = function (cb,numberOfPlayers) {

        if(!cache.capabilities.socialData)
            throw "Social Data not supported, you must add the capability on gamee.Init";

        this.native.createRequest("requestSocial", numberOfPlayers, function (responseData) {
            cb(null, responseData);
        });
    };

    core.logEvent = function (eventName, eventValue) {

        if(!cache.capabilities.logEvents)
            throw "Log Events not supported, you must add the capability on gamee.Init";

        //var valuesToLogString = JSON.stringify(eventValue)

        this.native.createRequest("logEvent", {eventName,eventValue}, function (error){
            if(error){
                throw error
            }
        });

    };

    core.requestBattleData = function (cb) {
        this.native.createRequest("requestBattleData", undefined, function (responseData) {
            cb(null, responseData);
        });
    };

    core.requestPlayerReplay = function (userID, cb) {

        if(!cache.capabilities.replay)
            throw "Replays not supported, you must add the capability on gamee.Init";

        this.native.createRequest("requestPlayerReplay", {userID}, function (responseData) {
            cb(null, responseData);
        });
    };

    core.requestPlayerSaveState = function (userID, cb) {
        this.native.createRequest("requestPlayerSaveState", {userID}, function (responseData) {
            cb(null, responseData);
        });
    };

    core.purchaseItem = function (options, cb) {

        if(!cache.capabilities.coins)
            throw "Coins purchases not supported, you must add the capability on gamee.Init";

        if (options) {
            var propertiesList = ["coinsCost","itemName"];
            propertiesList.forEach(function (property){
                if(!options.hasOwnProperty(property))
                    throw "Purchase Options must have `"+property+"` property"
            })
        }

        if (!this.isSilentModeEnabled()) {
            console.log(options);
        }

        this.native.createRequest("purchaseItem", options, function (responseData) {
            cb(null, responseData);
        });
    };

    core.purchaseItemWithGems = function (options, cb) {

        if(!cache.capabilities.gems)
            throw "Gems purchases not supported, you must add the capability on gamee.Init";

        if (options) {
            var propertiesList = ["gemsCost","itemName"];
            propertiesList.forEach(function (property){
                if(!options.hasOwnProperty(property))
                    throw "Purchase options must have `"+property+"` property"
            })
        }

        if (!this.isSilentModeEnabled()) {
            console.log(options);
        }

        this.native.createRequest("purchaseItemWithGems", options, function (responseData) {
            cb(null, responseData);
        });
    };

    core.share = function (options, cb) {

        if(!cache.capabilities.share)
            throw "Share option not supported, you must add the capability on gamee.Init";

        if (options) {
            var propertiesList = ["destination"];
            propertiesList.forEach(function (property){
                if(!options.hasOwnProperty(property))
                    throw "Share Options must have `"+property+"` property";
            })
        }

        if (!this.isSilentModeEnabled()) {
            console.log(options);
        }

        this.native.createRequest("share",options, function (responseData) {
            cb(null, responseData);
        });
    };

    core.loadRewardedVideo = function (cb) {

        if(!cache.capabilities.rewardedAds)
            throw "Rewarded Ads not supported, you must add the capability on gamee.Init";

        this.native.createRequest("loadRewardedVideo", function (responseData) {
            cb(null, responseData);
        });
    };

    core.showRewardedVideo = function (cb) {

        if(!cache.capabilities.rewardedAds)
            throw "Rewarded Ads not supported, you must add the capability on gamee.Init";

        this.native.createRequest("showRewardedVideo", function (responseData) {
            cb(null, responseData);
        });
    };

    core.requestPlayerData = function (cb, userID) {

        if(!cache.capabilities.playerData)
            throw "Player Data not supported, you must add the capability on gamee.Init";

        let options = undefined;
        if (userID) {
            options = {userID};
        }

        this.native.createRequest("requestPlayerData", options, function (responseData) {
            cb(null, responseData);
        });
    };

    core.startSignal = function (data) {
        var error;

        if (data.replay && !cache.capabilities.replay)
            error = "Game doesn't support replay. ";

        if (data.ghostMode && !cache.capabilities.ghostMode)
            error = "Game doesn't support ghost Mode. ";

        return error;
    };
    //
    // ## Private objects and methods
    // These are internal objects in closed scope. Good to know about them
    // when debugging.

    //
    // ## gamee.controller
    //
    // Namespace where the methods for controller are published.
    //

    /**
     * TODO transform this into instance of gamee class
     */
    core.controller = {
        /** ### mainController
         *
         * Current controller.
         */
        mainController: null,

        /** ### requestController
         *
         * Factory method to create a controller. It creates the controller
         * and signals to GameeApp which type the game requires
         *
         * You should called this method once before calling
         * `gamee.gameStart()`.
         *
         * @param {String} type type of controller (see [controllerTypes](#controllertypes))
         * @param {Object} [opts] optional controller options
         * {'enableKeyboard': .., 'buttons': ...}
         * @param {boolean} [opts.enableKeyboard] enable the keyboard
         * @param {Object} [opts.buttons] remap buttons {'oldKey': 'newKey',
         * 'left': 'break' ..}
         */
        requestController: function (type, opts) {
            if (type === "FullScreen")
                return null;

            var controller = createController(type, opts);

            this.mainController = controller;

            return controller;
        },

        /** ### additionalController
         *
         * Construct an additional controller. Sometimes games require a
         * different controller depending on platform (eg. touch on mobile,
         e but Four Buttons on desktop)
         *
         * **This is currently supported only for GameeWebApp** as a way to
         * have alternate keybinding. The game should request a type used
         * for mobile platform and then some other as *additionalController*
         * if alternate keybinding is needed;
         */
        // TODO remove this function
        additionalController: function (type, opts) {
            var controller = createController(type, opts);
            gameeNative.additionalController(type);

            return controller;
        },

        /** ### trigger
         *
         * Triggers and event for the controller
         *
         * This is called by GameeApp to trigger the *keydown*, *keyup*
         * events. For more info see [Controller](#controller)
         *
         * @param {String} eventName name of the event
         * @param {*} [data,...] data to pass for the event
         *
         */
        trigger: function () {
            var i;

            if (this.mainController) {
                this.mainController.trigger.apply(this.mainController, arguments);
            } else {
                throw new Error('No controller present');
            }
        }
    };

    /** ### core._keydown
     *
     * A helper function to listen for `keydown` events on window object.
     *
     * @param {Function} fn callback to handle the event
     */
    core._keydown = function (fn) {
        global.addEventListener('keydown', wrapKeyEvent(fn));
    };

    /** ### core._keyup
     *
     * A helper function to listen for `keyup` events on window object.
     *
     * @param {Function} fn callback to handle the event
     */
    core._keyup = function (fn) {
        global.addEventListener('keyup', wrapKeyEvent(fn));
    };

    /** ### createController
     *
     * Function to create a controller.
     *
     * *see [requestController](#requestcontroller)
     *
     * @param {String} type
     * @param {Object} [opts]
     * @returns {Controller} controller
     */
    function createController(type, opts) {
        var btn, controller;

        if (!controllerTypes[type]) {
            throw new Error('Unsupported controller type, ' + type);
        }

        opts = opts || {};

        controller = new controllerTypes[type]();

        if (opts.enableKeyboard) {
            controller.enableKeyboard(core);
        }

        if (opts.buttons) {
            for (btn in opts.buttons) {
                controller.remapButton(btn, opts.buttons[btn]);
            }
        }

        return controller;
    }



    /** ### controllerTypes
     *
     * List of controller types and their coresponding classes.
     *
     * *see [Controllers](#controllers) for more info*
     * @requires Controller
     */
    var controllerTypes = {
        'OneButton': controllers.OneButtonController,
        'TwoButtons': controllers.TwoButtonController,
        'FourButtons': controllers.FourButtonController,
        'FiveButtons': controllers.FiveButtonController,
        'SixButtons': controllers.SixButtonController,
        'FourArrows': controllers.FourArrowController,
        'Touch': controllers.TouchController,
        'Joystick': controllers.JoystickController,
        'JoystickWithButton': controllers.JoystickButtonController,
        'TwoArrowsTwoButtons': controllers.TwoArrowsTwoButtonsController,
        'TwoArrowsOneButton': controllers.TwoArrowsOneButtonController,
        'TwoActionButtons': controllers.TwoActionButtonsController
    };


    core.registerPlatform = function (platformAPI) {
        // platformAPI.addEventListener()
        // TODO ?
    };

    /**
     * Is true mute all console outputs
     * @return {boolean}
     */
    core.isSilentModeEnabled = function () {
        return cache.silentMode;
    };

    return core;
})();

export var DataTypeException = function (expected, present, argument, method) {
    this.expected = expected;
    this.present = present;
    this.method = method;
    this.argument = argument;
    this.message = `Invalid data type in method ${this.method}, argument ${this.argument} is expected to be ${this.expected}, but found ${this.present}`;
};

export var validateDataType = function (testedInput, expectedType, argument, originMethod) {
    switch (expectedType) {

        case "array":
            if (!Array.isArray(testedInput))
                throw new DataTypeException(expectedType, typeof testedInput, argument, originMethod);
            break;

        default:
            if (typeof testedInput !== expectedType)
                throw new DataTypeException(expectedType, typeof testedInput, argument, originMethod);
    }
};
