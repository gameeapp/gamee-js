//#### bower_components/bullet/dist/bullet.js
(function () {
	var BulletClass = function ()
	{
		var _self = this,
			_events = {};

		_self.on = function (event, fn, once)
		{
			if (arguments.length < 2 ||
				typeof event !== "string" ||
				typeof fn !== "function") return;

			var fnString = fn.toString();

			// if the named event object already exists in the dictionary...
			if (typeof _events[event] !== "undefined")
			{
				// add a callback object to the named event object if one doesn't already exist.
				if (typeof _events[event].callbacks[fnString] === "undefined")
				{
					_events[event].callbacks[fnString] = {
						cb : fn,
						once : !!once
					};
				}
				else if (typeof once === "boolean")
				{
					// the function already exists, so update it's 'once' value.
					_events[event].callbacks[fnString].once = once;
				}
			}
			else
			{
				// create a new event object in the dictionary with the specified name and callback.
				_events[event] = {
					callbacks : {}
				};

				_events[event].callbacks[fnString] = {cb : fn, once : !!once};
			}
		};

		_self.once = function (event, fn)
		{
			_self.on(event, fn, true);
		};

		_self.off = function (event, fn)
		{
			if (typeof event !== "string" ||
				typeof _events[event] === "undefined") return;

			// remove just the function, if passed as a parameter and in the dictionary.
			if (typeof fn === "function")
			{
				var fnString = fn.toString(),
					fnToRemove = _events[event].callbacks[fnString];

				if (typeof fnToRemove !== "undefined")
				{
					// delete the callback object from the dictionary.
					delete _events[event].callbacks[fnString];
				}
			}
			else
			{
				// delete all functions in the dictionary that are
				// registered to this event by deleting the named event object.
				delete _events[event];
			}
		};

		_self.trigger = function (event, data)
		{
			if (typeof event !== "string" ||
				typeof _events[event] === "undefined") return;

			for (var fnString in _events[event].callbacks)
			{
				var callbackObject = _events[event].callbacks[fnString];

				if (typeof callbackObject.cb === "function") callbackObject.cb(data);
				if (typeof callbackObject.once === "boolean" && callbackObject.once === true) _self.off(event, callbackObject.cb);
			}
		};

	};

	// check for AMD/Module support, otherwise define Bullet as a global variable.
	if (typeof define !== "undefined" && define.amd)
	{
		// AMD. Register as an anonymous module.
		define (function()
		{
			"use strict";
			return new BulletClass();
		});

	}
	else if (typeof module !== "undefined" && module.exports)
	{
		module.exports = new BulletClass();
	}
	else
	{
		window.Bullet = new BulletClass();
	}
	
})();

//#### gamee/libs/shims.js
/**
 * @class CustomEvent
 */
(function shimCustomEvent() {
	try {
		var ce = new window.CustomEvent('test');
		ce.preventDefault();
		if (ce.defaultPrevented !== true) {
			// IE has problems with .preventDefault() on custom events
			// http://stackoverflow.com/questions/23349191
			throw new Error('Could not prevent default');
		}
	} catch (e) {
		var CustomEvent = function (event, params) {
			var evt, origPrevent;
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};

			evt = document.createEvent("CustomEvent");
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			origPrevent = evt.preventDefault;
			evt.preventDefault = function () {
				origPrevent.call(this);
				try {
					Object.defineProperty(this, 'defaultPrevented', {
						get: function () {
							return true;
						}
					});
				} catch (e) {
					this.defaultPrevented = true;
				}
			};
			return evt;
		};

		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent; // expose definition to window
	}
})();

//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function (win, doc) {
	if (win.addEventListener) return;		//No need to polyfill

	function docHijack(p) { var old = doc[p]; doc[p] = function (v) { return addListen(old(v)); }; }
	function addEvent(on, fn, self) {
		return (self = this).attachEvent('on' + on, function (e) {
			e = e || win.event;
			e.preventDefault = e.preventDefault || function () { e.returnValue = false; };
			e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true; };
			fn.call(self, e);
		});
	}
	function addListen(obj, i) {
		i = obj.length;
		if (i) {
			while (i--)
				obj[i].addEventListener = addEvent;
		} else {
			obj.addEventListener = addEvent;
		}
		return obj;
	}

	addListen([doc, win]);
	if ('Element' in win) win.Element.prototype.addEventListener = addEvent;			//IE8
	else {		//IE < 8
		doc.attachEvent('onreadystatechange', function () { addListen(doc.all); });		//Make sure we also init at domReady
		docHijack('getElementsByTagName');
		docHijack('getElementById');
		docHijack('createElement');
		addListen(doc.all);
	}
})(window, document);

// naomik event emiter http://stackoverflow.com/a/24216547/1866147
// usage:
// function Example() {
// 	CustomEmitter.call(this);
// }

// // run it
// var e = new Example();

// e.addEventListener("something", function (event) {
// 	console.log(event)
// });

// e.dispatchEvent(new Event("something"));
function CustomEmitter() {
	var eventTarget = document.createDocumentFragment();

	function delegate(method) {
		this[method] = eventTarget[method].bind(eventTarget);
	}

	[
		"addEventListener",
		"dispatchEvent",
		"removeEventListener"
	].forEach(delegate, this);
}

/** ### wrapKeyEvent 
 * 
 * Handle old IE event differences for key events
 * 
 * @param {Function} fn callback
 */
function wrapKeyEvent(fn) {
	return function (ev) {
		if (!ev || !ev.keyCode) {
			if (!ev) {
				ev = window.event;
			}

			if (ev.which) {
				ev.keyCode = ev.which;
			}
		}

		return fn(ev);
	};
}

//#### gamee/src/game_controllers.js
/**
 * @module game_controllers
 */

/** ## Bullet 
 *
 * [Bullet.js](https://github.com/munkychop/bullet) is used as pub/sub
 * library. 
 * 
 * The controller and its buttons are instance of Bullet.
 */
var BulletClass = Bullet.constructor;


/** ## Button
 *
 * Represenation of a controller button. It is a child of 
 * [Bullet](https://github.com/munkychop/bullet), so you can
 * subscribe for events triggered on it. 
 * 
 * @class Button
 * @param {String} key name of the button
 * @param {Number} keyCode keycode for the key to represent the button
 * on keyboard
 */
function Button(key, keyCode) {
	var self = this;

	BulletClass.call(this);

	this._pressed = true;

	this.key = key;
	this.keyCode = keyCode;

	this.on('keydown', function () {
		self._pressed = true;
	});

	this.on('keyup', function () {
		self._pressed = false;
	});
}

Button.prototype = Object.create(BulletClass.constructor.prototype);
Button.constructor = Button;

/** ### isDown
 * 
 * Ask if the button is currently pressed.
 *
 * @return {Boolean} true if the button is currently pressed
 */
Button.prototype.isDown = function () {
	return this._pressed;
};

/** ## Controller
 * 
 * Controller has a collection of [buttons](#buttons).
 * It is a child of 
 * [Bullet](https://github.com/munkychop/bullet), so you can 
 * subscribe for events triggered on it. 
 *
 * Controllers will get all the events for its buttons so you can
 * listen for them globaly from controller or individualy on every
 * button.
 *
 * ```javascript
 * controller.on('keydown', function(data) {
 *   console.log('button ' + data.button + ' is pressed');
 * });
 *
 * controller.buttons.left.on('keydown', function() {
 *   console.log('button left is pressed');
 * });
 * ```
 * 
 * @class Controller
 */
function Controller() {
	var self = this;

	BulletClass.call(this);

	// ### buttons
	//
	// Map of controller's [buttons](#button) by their name.
	//
	// ```javascript
	// controller.buttons.left // Button('left', ..)
	// ```
	this.buttons = {};

	// ### buttonAlias
	//
	// Map of remapped buttons.
	//
	// *see [remapButton](#remapbutton) for more info*
	//
	this.buttonAlias = {};

	// Events prefixed with *$* are private, sent from GameeApp ment
	// to be handled before resended as *public (non-prefixed)* 
	// event.
	//
	// They should be not used in games as they can change in the future.
	this.on('$keydown', function (data) {
		if (data.button && self.buttonAlias[data.button]) {
			data.button = self.buttonAlias[data.button];
		}

		self.trigger('keydown', data);
	});

	this.on('$keyup', function (data) {
		if (data.button && self.buttonAlias[data.button]) {
			data.button = self.buttonAlias[data.button];
		}

		self.trigger('keyup', data);
	});

	// By default GameeApp will trigger *keydown* and *keyup* events for
	// the controller for every button presses/released.
	// 
	// The controller then handles the event and triggers the event for
	// the coresponding button.
	// 
	// It expexts a `data` argument which should have a property `button`
	// with the name of button.
	this.on('keydown', function (data) {
		if (!data.button || !self.buttons[data.button]) {
			return;
		}

		self.buttons[data.button].trigger('keydown');
	});

	this.on('keyup', function (data) {
		if (!data.button || !self.buttons[data.button]) {
			return;
		}

		self.buttons[data.button].trigger('keyup');
	});
}

Controller.prototype = Object.create(BulletClass.constructor.prototype);
Controller.constructor = Controller;

/** ### addButton
 *
 * Add button to the controller.
 * 
 * @param {Button} button a [Button](#button) instance
 */
Controller.prototype.addButton = function (button) {
	this.buttons[button.key] = button;
};

/** ### enableKeyboard
 * 
 * Enable keyboard controlls. It will attach event listeners to the 
 * *window* object for every button and trigger their *keydown* /
 * *keyup* event for the controller.
 */
Controller.prototype.enableKeyboard = function (gamee) {
	var key, button, keyCodes = {}, self = this;

	for (key in this.buttons) {
		button = this.buttons[key];

		if (button.keyCode) {
			keyCodes[button.keyCode] = button;
		}
	}

	gamee._keydown(function (ev) {
		var button = keyCodes[ev.keyCode];

		if (!button) {
			return;
		}

		ev.preventDefault();
		self.trigger('keydown', { button: button.key });
	});

	gamee._keyup(function (ev) {
		var button = keyCodes[ev.keyCode];

		if (!button) {
			return;
		}

		ev.preventDefault();
		self.trigger('keyup', { button: button.key });
	});
};

/** ### remapButton
 * 
 * Remap the names of the controller's buttons. Controllers have their
 * button names set (left, right, A, B), but sometimes in context of 
 * the game a different names are desired.
 *
 * ```javascript
 * var controller = gamee.controller.requestController('TwoButtons');
 * controller.remapButton('left', 'throttle');
 * controller.remapButton('right', 'break');
 * 
 * controller.buttons.throttle.on('keydown', ..);
 * ```
 *
 * @param {String} oldName button name we want to change
 * @param {String} newName new button name
 */
Controller.prototype.remapButton = function (oldName, newName) {

	// handle old code
	if (newName.name) {
		newName = newName.name;
	}

	if (this.buttons[oldName]) {
		this.buttonAlias[oldName] = newName.name;

		this.buttons[newName.name] = this.buttons[oldName];

		delete this.buttons[oldName];
	} else {
		throw Error('Button ' + oldName + ' was not found in controller');
	}
};

// ## Controllers 

/** ### OneButtonController
 *
 * Controller with only one button.
 * @class OneButtonController
 */
function OneButtonController() {
	Controller.call(this);

	// * __name__: 'button' 
	// * __key__: spacebar
	this.addButton(new Button('button', 32));
}
OneButtonController.prototype = Object.create(Controller.prototype);
OneButtonController.prototype.constructor = OneButtonController;


/** ### TwoButtonController
 *
 * Controller with two buttons
 * @class TwoButtonController
 */
function TwoButtonController() {
	Controller.call(this);

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));

	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));
}
TwoButtonController.prototype = Object.create(Controller.prototype);
TwoButtonController.prototype.constructor = TwoButtonController;


/** ### TwoActionButtonsController
 *
 * Controller with two action buttons (A,B)
 * @class TwoActionButtonsController
 */
function TwoActionButtonsController() {
	Controller.call(this);

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('A', 32));

	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('B', 17));
}
TwoActionButtonsController.prototype = Object.create(Controller.prototype);
TwoActionButtonsController.prototype.constructor = TwoActionButtonsController;


/** ### FourButtonController
 *
 * Controller with four buttons
 * @class FourButtonController
 */
function FourButtonController() {
	Controller.call(this);

	// * __name__: 'up'
	// * __key__: left arrow
	this.addButton(new Button('up', 38));

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));

	// * __name__: 'A'
	// * __key__: spacebar
	this.addButton(new Button('A', 32));
}
FourButtonController.prototype = Object.create(Controller.prototype);
FourButtonController.prototype.constructor = FourButtonController;

/** ### FiveButtonController
 *
 * Controller with five buttons
 * @class FiveButtonController
 */
function FiveButtonController() {
	Controller.call(this);

	// * __name__: 'up'
	// * __key__: left arrow
	this.addButton(new Button('up', 38));

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));

	// * __name__: 'down'
	// * __key__: down arrow
	this.addButton(new Button('down', 40));

	// * __name__: 'A'
	// * __key__: spacebar
	this.addButton(new Button('A', 32));
}
FiveButtonController.prototype = Object.create(Controller.prototype);
FiveButtonController.prototype.constructor = FiveButtonController;

/** ### SixButtonController
 *
 * Controller with six buttons
 * @class SixButtonController
 */
function SixButtonController() {
	Controller.call(this);

	// * __name__: 'up'
	// * __key__: left arrow
	this.addButton(new Button('up', 38));

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));

	// * __name__: 'down'
	// * __key__: down arrow
	this.addButton(new Button('down', 40));

	// * __name__: 'A'
	// * __key__: spacebar
	this.addButton(new Button('A', 32));

	// * __name__: 'B'
	// * __key__: ctrl
	this.addButton(new Button('B', 17));
}
SixButtonController.prototype = Object.create(Controller.prototype);
SixButtonController.prototype.constructor = SixButtonController;

/** ### TwoArrowsOneButtonController
 *
 * Controller with two arrows and one action button
 * @class TwoArrowsOneButtonController
 */
function TwoArrowsOneButtonController() {
	Controller.call(this);


	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));


	// * __name__: 'A'
	// * __key__: spacebar
	this.addButton(new Button('A', 32));

}
TwoArrowsOneButtonController.prototype = Object.create(Controller.prototype);
TwoArrowsOneButtonController.prototype.constructor = TwoArrowsOneButtonController;

/** ### TwoArrowsTwoButtonsController
 *
 * Controller with two arrows and two action buttons
 * @class TwoArrowsTwoButtonsController
 */
function TwoArrowsTwoButtonsController() {
	Controller.call(this);


	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));


	// * __name__: 'A'
	// * __key__: spacebar
	this.addButton(new Button('A', 32));

	// * __name__: 'B'
	// * __key__: ctrl
	this.addButton(new Button('B', 17));

}
TwoArrowsTwoButtonsController.prototype = Object.create(Controller.prototype);
TwoArrowsTwoButtonsController.prototype.constructor = TwoArrowsTwoButtonsController;

/** ### FourArrowController 
 *
 * Controller with four arrow buttons
 * @class FourArrowController
 */
function FourArrowController() {
	Controller.call(this);

	// * __name__: 'up'
	// * __key__: left arrow
	this.addButton(new Button('up', 38));

	// * __name__: 'left'
	// * __key__: left arrow
	this.addButton(new Button('left', 37));


	// * __name__: 'right'
	// * __key__: righ arrow
	this.addButton(new Button('right', 39));

	// * __name__: 'down'
	// * __key__: down arrow
	this.addButton(new Button('down', 40));
}
FourArrowController.prototype = Object.create(Controller.prototype);
FourArrowController.prototype.constructor = FourArrowController;

/** ### TouchController 
 *
 * This controller has no buttons. Instead it has a touchpad which
 * triggers *touchstart*, *touchend*, *touchmove*, *touchcancel*,
 * *touchend* events (similar to 
 * [Touch event types](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent#Touch_event_types))
 *
 * The position of the touch is in the `data.position` argument as a 
 * *x* and *y* with the values between [0, 0] for the left top corner
 * and [1, 1] for the bottom right corner ([0.5, 0.5] is the center).
 *
 * ```javascript
 * controller = gamee.controller.requestController('Touch');
 *
 * controller.on('touchstart', function(data) {
 *	if (data.position.x < 0.5 && data.position.y < 0.5) {
 *    console.log('touch in the top left quadrant');
 *  }
 * })
 * ```
 * @class TouchController
 */
function TouchController() {
	var self = this;

	Controller.call(this);

	this.on("$touchstart", function (data) {
		self.trigger('touchstart', data);
	});

	this.on("$touchend", function (data) {
		self.trigger('touchend', data);
	});

	this.on("$touchmove", function (data) {
		self.trigger('touchmove', data);
	});

	this.on("$touchleave", function (data) {
		self.trigger('touchleave', data);
	});

	this.on("$touchcancel", function (data) {
		self.trigger('touchcancel', data);
	});
}
TouchController.prototype = Object.create(TouchController.prototype);
TouchController.prototype.constructor = TouchController;

/** ### JoystickController 
 *
 * JoystickController emits `change` event, after the position of the 
 * joystick is changed. 
 *
 * The position of the joystick is in the property `x` and `y`. The 
 * position on axis is between <-1, 1> (for x -1 is max left 
 * position, 1 max right position). [0.0, 0.0] is the center.
 *
 * ```javascript
 * joystick = gamee.controller.requestController('Joystick');
 *
 * joystick.on('change', function() {
 *   new_x = joystick.x;
 *   nex_y = joystick.y;
 * })
 * ```
 * @class JoystickController
 */
function JoystickController() {
	var self = this;

	Controller.call(this);

	// x axis
	this.x = 0;
	// y axis
	this.y = 0;

	this.on("$change", function (data) {
		self.x = data.position.x;
		self.y = data.position.y;

		self.trigger("change", data);
	});
}
JoystickController.prototype = Object.create(Controller.prototype);
JoystickController.prototype.constructor = JoystickController;

/** ### JoystickButtonController 
 *
 * JoystickButtonController is a `JoystickController` with one button.
 *
 * ```javascript
 * joystick = gamee.controller.requestController('JoystickWithButton');
 *
 * joystick.on('change', function() {
 *   new_x = joystick.x;
 *   nex_y = joystick.y;
 * })
 *
 * joystick.buttons.button.on('keydown', callback)
 * // or simply
 * joystick.on('keydown', callback)
 * ```
 * @class JoystickButtonController
 */
function JoystickButtonController() {
	var self = this;

	JoystickController.call(this);

	// * __name__: 'button' 
	// * __key__: spacebar
	this.addButton(new Button('button', 32));
}
JoystickButtonController.prototype = Object.create(JoystickController.prototype);
JoystickButtonController.prototype.constructor = JoystickButtonController;

//#### gamee/src/core.js
/**
 * @class core
 */
var core = (function () {

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
        VERSION: "2.0", // version of the gamee library
        CAPABILITIES: ["ghostMode", "saveState", "replay", "socialData"], // supported capabilities
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
    core.gameeInit = function (ctrlType, ctrlOpts, capabilities, cb) {
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

            if (this.native.platform === "web" || this.native.platform === "fb") {
                responseData.controller = core.controller.requestController(ctrlType, { enableKeyboard: true });
                this._bindKeyboardTriggers(responseData.controller);
            } else {
                responseData.controller = core.controller.requestController(ctrlType, {});
            }
            cb(responseData);
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
    core.gameOver = function (opt_replayData) {
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
        core.native.createRequest("gameOver", requestData);
    };

    /** ### gamee.gameSave
     *
     * Player has requested saving current game's state
     * data must be string = responsibility for turning data structure into string is left to game!
     * share must be expression evaluating to either true or false; it indicates, whether the game progress should be shared on feed
     */
    core.gameSave = function (data, share) {
        var state;
        if (typeof data === "object") {
            // gameeNative.gameSave(internals.variant, data, share ? 1 : 0);
            try {
                state = JSON.stringify(data);
            } catch (err) {
                throw "data provided to gameSave function must be valid JSON: " + err;
            }
            core.native.createRequest("saveState", { state: state, share: share });
        } else {
            throw "data provided to gameSave function must be object";
        }
    };

    core.requestSocial = function (cb) {
        this.native.createRequest("requestSocial", function (responseData) {
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
        'OneButton': OneButtonController,
        'TwoButtons': TwoButtonController,
        'FourButtons': FourButtonController,
        'FiveButtons': FiveButtonController,
        'SixButtons': SixButtonController,
        'FourArrows': FourArrowController,
        'Touch': TouchController,
        'Joystick': JoystickController,
        'JoystickWithButton': JoystickButtonController,
        'TwoArrowsTwoButtons': TwoArrowsTwoButtonsController,
        'TwoArrowsOneButton': TwoArrowsOneButtonController,
        'TwoActionButtons': TwoActionButtonsController
    };


    core.registerPlatform = function (platformAPI) {
        // platformAPI.addEventListener()
        // TODO ?
    };

    return core;
})();

//#### gamee/src/gameeAPI.js
/**
 * gameeAPI module desc
 * @module gameeAPI
 */

/**
 * Emit events
 * @class GameeEmitter
 * @extends CustomEmitter
 */
var GameeEmitter = function () {
    CustomEmitter.call(this);
};

/**
 * @class Gamee
 * @requires core
 * 
 */
var Gamee = function () {
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
            var data = core.requestSocial(cb);
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

//#### gamee/src/platform_bridge.js
/**
 * 
 * @requires core
 * 
 * @typedef PlatformAPI
 * @param {EventTarget} emitter
 * @param {function} _pause
 * @param {function} _resume
 * @param {function} _ghostShow
 * @param {function} _ghostHide
 * @param {function} _mute
 * @param {function} _unmute
 * @param {function} _start
 */
var PlatformAPI = {
	emitter: null,
	pause: function (cb) {
		var event = new CustomEvent('pause', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	resume: function (cb) {
		var event = new CustomEvent('resume', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	ghostShow: function (cb) {
		var event = new CustomEvent('ghostShow', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	ghostHide: function (cb) {
		var event = new CustomEvent('ghostHide', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	mute: function (cb) {
		var event = new CustomEvent('mute', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	unmute: function (cb) {
		var event = new CustomEvent('unmute', {
			detail: {
				callback: cb
			}
		});
		this.emitter.dispatchEvent(event);
	},
	start: function (data, cb) {
		var event = new CustomEvent('start', {
			detail: {
				callback: cb
			}
		});

		var error = core.startSignal(data);
		if (error) {
			cb(error);
			return;
		}

		if (data.replay)
			event.detail.opt_replay = true;
		if (data.ghostMode)
			event.detail.opt_ghostMode = true;
		if (data.resetState)
			event.detail.opt_resetState = true;

		this.emitter.dispatchEvent(event);
	}
};


/**
 * @class PlatformBridge
 * 
 */
function PlatformBridge() {
	this.requests = {};
	this.platform = "";
	this._init();
}

PlatformBridge.prototype = {
	instCount: 0,
	_init: function () {
	},
	createRequest: function (method, opt_requestData, opt_callback) {
		if (typeof opt_requestData === 'function') {
			opt_callback = opt_requestData;
			opt_requestData = undefined;
		}

		var messId = this.instCount++;

		if (typeof opt_callback !== 'undefined') {
			this.requests[messId] = opt_callback;
		}

		var preparedObject = {
			request: {
				method: method,
				messageId: messId,
				data: null
			}
		};

		this.doCall(preparedObject, opt_requestData);
	},
	/**
	 * @abstract
	 */
	doCall: function (preparedObject, requestData) {
		throw "Not implemented";
	},
	_callback: function (id, responseData) {
		var cb = this.requests[id];
		delete this.requests[id];
		if (cb)
			cb(responseData);
	},
	/**
	 * @abstract
	 */
	doResponse: function (preparedObject, responseData) {
		throw "Not implemented";
	},
};


/**
 * @class PostMessageBridge
 * @requires PlatformBridge
 */
function PostMessageBridge(endpoint) {
	this._gameeWin = endpoint;
	PlatformBridge.call(this);
	this.platform = "web";
}

PostMessageBridge.prototype = Object.create(PlatformBridge.prototype);
PostMessageBridge.prototype.constructor = PostMessageBridge;

PostMessageBridge.prototype._init = function () {

	window.addEventListener('message', function (ev) {
		// if(ev.origin === "source we want")
		// console.log("_triggerMessage detail: " + ev.detail);
		// console.log("_triggerMessage data: " + ev.data);
		var data;
		if (typeof ev.detail === "object" && typeof ev.detail !== null) {
			data = ev.detail;
		} else if (typeof ev.data === "object") {
			data = ev.data;
		} else {
			// message is not from native platform
			return;
		}
		// this is request
		if (data.request && data.request.method && typeof data.request.messageId !== "undefined") {
			this._resolveAPICall(data.request.method, data.request.messageId, data.request.data);
		}
		// this is reponse
		else if (data.response && typeof data.response.messageId !== "undefined") {
			if (data.error)
				throw data.error;
			this._callback(data.response.messageId, data.response.data);
		}
		// else this message target is not this framework
	}.bind(this), false);
};


PostMessageBridge.prototype.doCall = function (preparedObject, requestData) {
	if (typeof requestData === "object") {
		preparedObject.request.data = requestData || {};
	}
	this._gameeWin.postMessage(preparedObject, "*");
};

PostMessageBridge.prototype.doResponse = function (messageId, responseData) {
	var preparedObject = {
		version: this.version,
		response: {
			messageId: messageId
		}
	};

	if (responseData)
		preparedObject.data = responseData;

	this._gameeWin.postMessage(preparedObject, "*");
};

PostMessageBridge.prototype._resolveAPICall = function (method, messageId, opt_data) {
	var cb = this.doResponse.bind(this, messageId);

	switch (method) {
		case "pause":
			PlatformAPI.pause(cb);
			break;
		case "resume":
			PlatformAPI.resume(cb);
			break;
		case "mute":
			PlatformAPI.mute(cb);
			break;
		case "unmute":
			PlatformAPI.unmute(cb);
			break;
		case "ghostShow":
			PlatformAPI.ghostShow(cb);
			break;
		case "ghostHide":
			PlatformAPI.ghostHide(cb);
			break;
		case "start":
			if (!opt_data) {
				throw "Method _start missing params";
			}
			PlatformAPI.start(opt_data, cb);
			break;
		default:
			console.error("Unknown method call");
	}
};


/**
 * @class MobileBridge
 * @requires PlatformBridge
 * 
 */
function MobileBridge(device) {
	this.device = device;
	PostMessageBridge.call(this);
	this.platform = "mobile";
}

MobileBridge.prototype = Object.create(PostMessageBridge.prototype);
MobileBridge.prototype.constructor = MobileBridge;

MobileBridge.prototype._init = function () {
	PostMessageBridge.prototype._init.call(this);
	if (this.device === "ios") {
		this._gameeWin = webkit.messageHandlers.callbackHandler;
	} else if (this.device === "android") {
		this._gameeWin = _toDevice;
	} else {
		throw "Unknown device used in webkit bridge";
	}

	window._triggerMessage = function (data) {
		try {
			data = JSON.parse(data); // message is custom message from IOS/android platform
		} catch (err) {
			throw "Couldn't parse message from native app: \n" + data + "\n" + err;
		}
		this.dispatchEvent(new CustomEvent("message", { detail: data }));
	};

};

MobileBridge.prototype.doCall = function (preparedObject, requestData) {
	if (typeof requestData === "object") {
		preparedObject.request.data = requestData || {};
	}

	if (this.device === "android") // stringify data for android devices, but not for ios
		preparedObject = JSON.stringify(preparedObject);

	this._gameeWin.postMessage(preparedObject, "*");
};

/**
 * @class FacebookBridge
 * @requires PlatformBridge
 */
function FacebookBridge() {
	PlatformBridge.call(this);
	this.platform = "fb";
}

FacebookBridge.prototype = Object.create(PlatformBridge.prototype);
FacebookBridge.prototype.constructor = FacebookBridge;

FacebookBridge.prototype._init = function () {
};

FacebookBridge.prototype.createRequest = function (method, opt_requestData, opt_callback) {
	if (typeof opt_requestData === 'function') {
		opt_callback = opt_requestData;
		opt_requestData = undefined;
	}

	try {
		this._methods[method](opt_callback, opt_requestData);
	} catch (err) {
		throw err;
	}
};

FacebookBridge.prototype._methods = {
	init: function (cb, data) {
		var scripts = "https://connect.facebook.net/en_US/fbinstant.2.1.js"; // TODO?
		loadScript(scripts, function () {
			FBInstant.initializeAsync().then(function (v) {
				FBInstant.player.getDataAsync(['gamee']).then(function (data) {
					var saveState = data.gamee || null;
					cb({
						saveState: saveState,
						replayData: null,
						sound: true
					});
				});

			}, function (e) {
				throw e;
			});
		});
	},
	gameLoadingProgress: function (cb, data) {
		FBInstant.setLoadingProgress(data.percentage);
	},
	gameReady: function () {
		FBInstant.setLoadingProgress(100);
		FBInstant.startGameAsync().then(function () {
			PlatformAPI.start({}, function () { });
		});
	},
	updateScore: function (cb, data) {
		FBInstant.setScore(data.score);
	},
	gameOver: function () {
		FBInstant.endGameAsync().then(function () {
			PlatformAPI.start({}, function () { });
		});
	},
	saveState: function (cb, data) {
		FBInstant.player.setDataAsync({
			"gamee": data.state
		}).then(function () {
			console.log('FB: data is saved');
		});
	}
};

//#### gamee/src/main.js
exports = (function () {

    /**
     * Instance of gamee object with API for developers. 
     * Internal functions becomes private this way
     * 
     * @requires Gamee
     */
    var gamee = new Gamee();

    /**
     * Resolves what platform is being used and make instance of platform API. 
     * 
     * @requires PlatformBridge
     */
    var platformBridge = (function () {

        var platformBridge, platformType = "web";

        // Reslove Gamee enviroment
        /* current user agent */
        userAgent = navigator.userAgent.toLowerCase();

        if ((window.parent !== window) && (/facebook/.test(document.referrer))) { // FB
            // TODO fb platform
            platformType = "fb";
        } else if (/iphone|ipod|ipad/.test(userAgent)) { // test ios device
            // user agent is use to determine current enviroment

            // Test if window with game have a parent (loading in iframe)
            if (window.self !== window.top) {
                platformType = "web";
            } else {
                platformType = "ios";
            }
        } else if (/gamee\/[0-9\.]+$/.test(userAgent)) { // test android app
            // TODO do you really test android like that?
            platformType = "android";
        } else if (window.parent) { // TODO doesnt make sence, parent always exists!!
            platformType = "web";
        } else if (window.parent && window.parent.gameeSimulator) { // TODO doesnt make sence, parent always exist?
            platformType = "web";
        }

        switch (platformType) {
            case "web":
                if (window.parent === window) {
                    console.error("Gamee must run in iframe on web platform");
                }
                platformBridge = new PostMessageBridge(window.parent);
                break;
            case "ios":
                platformBridge = new MobileBridge("ios");
                break;
            case "android":
                platformBridge = new MobileBridge("android");
                break;
            case "fb":
                platformBridge = new FacebookBridge("fb");
                break;
            default:
                throw "Can't identify the platform";
        }
        return platformBridge;
    })();

    core.PlatformAPI = PlatformAPI;
    core.native = platformBridge;

    PlatformAPI.emitter = gamee.emitter;

    return gamee;
})();

function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}