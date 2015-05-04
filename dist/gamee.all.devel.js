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
/**
 * Wrappers for $gameeNative object in diferent envitorments
 */
(function(global) {
	'use strict';
	
	var gameeNative = {
			/**
			 * Update score 
			 *
			 * @param {String} score
			 */ 
			updateScore: function(score) {},

			/**
			 * Request controller
			 *
			 * @param {String} score
			 */
			requestController: function(type) {},

			/**
			 * Request additional controller (for desktop)
			 *
			 * @param {String} type type of controller
			 */
			additionalController: function(type) {},

			/**
			 * Game over
			 */
			gameOver: function() {},

			/**
			 * Game start
			 */ 
			gameStart: function() {},

			type: 'no-gamee'
		},
		userAgent = navigator.userAgent.toLowerCase();
		
		/**
		 * Gamee Mobile App 
		 */
		function gameeMobile(gameeNative) {
			gameeNative.updateScore = function(score) {
				window.location.href = "gamee://score/" + score;
			};

			gameeNative.requestController = function(type) {
				window.location.href = "gamee://request-controller/" + type;
			};

			gameeNative.gameOver = function() {
				window.location.href = "gamee://game-over";
			};

			gameeNative.gameStart = function() {
				window.location.href = "gamee://game-start";
			};

			gameeNative.type = 'gamee-mobile';
		}

		/**
		 * Gamee simulator and validator
		 */
		function gameeSimulator(gameeNative) {
			var simulator = window.parent.gameeSimulator;

			gameeNative.updateScore = function(score) {
				simulator.updateScore(score);
			};

			gameeNative.requestController = function(type) {
				simulator.requestController(type);
			};

			gameeNative.gameOver = function() {
				simulator.gameOver();
			};

			gameeNative.gameStart = function() {
				simulator.gameStart();
			};

			gameeNative.type = 'gamee-simulator';
		}

		/**
		 * Gamee desktop web view
		 */
		function gameeWeb(gameeNative) {
			var gamee = window.parent;

			gameeNative.updateScore = function(score) {
				gamee.postMessage(["score", score], '*');
			};

			gameeNative.requestController = function(type) {
				gamee.postMessage(['request-controller', type], '*');
			};

			gameeNative.additionalController = function(type) {
				gamee.postMessage(['additional-controller', type], '*');
			};

			gameeNative.gameOver = function() {
				gamee.postMessage(['game-over'], '*');
			};

			gameeNative.gameStart = function() {
				gamee.postMessage(['game-start'], '*');
			};

			gameeNative.gamePaused = function() {
				gamee.postMessage(['game-paused'], '*');
			};

			gameeNative.type = 'gamee-web';
		}


	if (
		/gamee\/[0-9\.]+$/.test(userAgent) || // test for android webview
		/iphone|ipod|ipad/.test(userAgent)    // test for iOS webview
	) {
		gameeMobile(gameeNative);

	} else if (window.parent) {
		gameeWeb(gameeNative);

	} else if (window.parent && window.parent.gameeSimulator) {
		gameeSimulator(gameeNative);

	} else {
		console.error('No gamee enviroment matched');
	}

	global.$gameeNative = gameeNative;
}(this));

// var $gameeNative = require('./gamee_native.js');

var gamee = function(global) {
	'use strict';

	var gamee = {}, 
		score, 
		noop = function() {};
	
	function addDOMEvent(obj, event, fn) {
 		if (obj.addEventListener) {
			obj.addEventListener(event, fn, false);

		} else if (obj.attachEvent) {
			obj.attachEvent('on' + event, fn);
		}
	}

	function removeDOMEvent(obj, event, fn) {
		if (obj.removeEventListener) {
			obj.removeEventListener(event, fn, false);

		} else if (obj.detachEvent) {
			obj.detachEvent('on' + event, fn);
		}
	}

	function wrapKeyEvent(fn) {
		return function(ev) {
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

	gamee._keydown = function(fn) {
		addDOMEvent(global, 'keydown', wrapKeyEvent(fn));
	};

	gamee._keyup = function(fn) {
		addDOMEvent(global, 'keyup', wrapKeyEvent(fn));	
	};

	/**
	 * Score
	 */
	Object.defineProperty(gamee, 'score', {
		get: function() {
			return score;
		},

		set: function(newScore) {
			score = newScore;

			global.$gameeNative.updateScore(score);
		}
	});

	/**
	 * game over
	 */
	gamee.gameOver = function() {
		global.$gameeNative.gameOver();
	};

	/**
	 * game start
	 */
	gamee.gameStart = function() {
		global.$gameeNative.gameStart();
	};

	gamee.onPause   = noop;
	gamee.onStop    = noop;
	gamee.onRestart = noop;
	gamee.onMute    = noop;

	// *deprecated* for backward compatibility
	gamee.onUnpause = noop;
	// use onResume instead
	gamee.onResume = function() {
		gamee.onUnpause();
	};

	// gamee-web keyboard hooks
	if (global.$gameeNative.type === 'gamee-web') {
		gamee._keydown(function(ev) {
			switch(ev.keyCode) {
				case 80:  // p for pause
					gamee.onPause();
					$gameeNative.gamePaused();
					break;

				case 82: // r for restart
					gamee.onRestart();
					break;
			}
		});

		addDOMEvent(global, 'message', function(ev) {
			switch(ev.data[0]) {
				case 'pause': 
					gamee.onPause();
					break;

				case 'resume':
					gamee.onResume();
					break;

				case 'restart':
					window.focus();
					gamee.onRestart();
					break;

				case 'mute':
					gamee.onMute();
					break;

				default:
					throw Error('Unknown message');
			}
		});
	}
	
	return gamee;
}(this);

// var gamee = require('./gamee.js');
// var $gameeNative = require('./gamee_native.js');

var gamee = gamee || {};

(function(global, gamee) {
	'use strict';

	var BulletClass = Bullet.constructor,
		mainController, // global gamee controller 
		controllerTypes;

	controllerTypes = {
		'OneButton': OneButtonController,
		'TwoButtons': TwoButtonController,
		'FourButtons': FourButtonController,
		'FiveButtons': FiveButtonController,
		'SixButtons': SixButtonController,
		'Touch': TouchController
	};

	function Button(key, keyCode) {
		var self = this;

		BulletClass.call(this);

		this._pressed = true;

		this.key = key;
		this.keyCode = keyCode;

		this.on('keydown', function() {
			self._pressed = true;
		});

		this.on('keyup', function() {
			self._pressed = false;
		});
	}

	Button.prototype = Object.create(BulletClass.constructor.prototype);
	Button.constructor = Button;

	Button.prototype.isDown = function() {
		return this._pressed;
	};

	function Controller() {
		var self = this;

		BulletClass.call(this);

		this.buttons = {};
		this.buttonAlias = {};

		this.on('$keydown', function(data) {
			if (data.button && self.buttonAlias[data.button]) {
				data.button = self.buttonAlias[data.button];
			}

			self.trigger('keydown', data);
		});

		this.on('$keyup', function(data) {
			if (data.button && self.buttonAlias[data.button]) {
				data.button = self.buttonAlias[data.button];
			}

			self.trigger('keyup', data);
		});

		this.on('keydown', function(data) {
			if (!data.button || !self.buttons[data.button]) {
				return;
			}

			self.buttons[data.button].trigger('keydown');
		});

		this.on('keyup', function(data) {
			if (!data.button || !self.buttons[data.button]) {
				return;
			}

			self.buttons[data.button].trigger('keyup');
		});
	}

	Controller.prototype = Object.create(BulletClass.constructor.prototype);
	Controller.constructor = Controller;

	Controller.prototype.addButton = function(button) {
		this.buttons[button.key] = button;
	};

	Controller.prototype.enableKeyboard = function() {
		var key, button, keyCodes = {}, self = this;

		for (key in this.buttons) {
			button = this.buttons[key];

			if (button.keyCode) {
				keyCodes[button.keyCode] = button;
			}
		}

		gamee._keydown(function(ev) {
			var button = keyCodes[ev.keyCode];

			if (!button) {
				return;
			}

			ev.preventDefault();
			self.trigger('keydown', {button: button.key});
		});
		
		gamee._keyup(function(ev) {
			var button = keyCodes[ev.keyCode];

			if (!button) {
				return;
			}

			ev.preventDefault();
			self.trigger('keyup', {button: button.key});
		});
	};

	Controller.prototype.remapButton = function(oldName, newProp) {
		if (this.buttons[oldName]) {
			this.buttonAlias[oldName] = newProp.name;
			
			this.buttons[newProp.name] = this.buttons[oldName];

			delete this.buttons[oldName];
		}
	};

	function OneButtonController() {
		Controller.call(this);

		this.addButton(new Button('button', 32)); // spacebar 
	}
	OneButtonController.prototype = Object.create(Controller.prototype);
	OneButtonController.prototype.constructor = OneButtonController;

	function TwoButtonController() {
		Controller.call(this);

		this.addButton(new Button('left', 37));  // left arrow
		this.addButton(new Button('right', 39)); // right arrow
	}
	TwoButtonController.prototype = Object.create(Controller.prototype);
	TwoButtonController.prototype.constructor = TwoButtonController;


	function FourButtonController() {
		Controller.call(this);

		this.addButton(new Button('up', 38));   // up arrow
		this.addButton(new Button('left', 37));  // left arrow
		this.addButton(new Button('right', 39)); // right arrow
		this.addButton(new Button('A', 32));     // spacebar
	}
	FourButtonController.prototype = Object.create(Controller.prototype);
	FourButtonController.prototype.constructor = FourButtonController;

	function FiveButtonController() {
		Controller.call(this);

		this.addButton(new Button('up', 38));   // up arrow
		this.addButton(new Button('left', 37));  // left arrow
		this.addButton(new Button('right', 39)); // right arrow
		this.addButton(new Button('down', 40));  // down arrow
		this.addButton(new Button('A', 32));     // spacebar
	}
	FiveButtonController.prototype = Object.create(Controller.prototype);
	FiveButtonController.prototype.constructor = FiveButtonController;

	function SixButtonController() {
		Controller.call(this);

		this.addButton(new Button('up', 38));   // up arrow
		this.addButton(new Button('left', 37));  // left arrow
		this.addButton(new Button('right', 39)); // right arrow
		this.addButton(new Button('down', 40));  // down arrow
		this.addButton(new Button('A', 32));     // spacebar
		this.addButton(new Button('B', 17));     // ctrl
	}
	SixButtonController.prototype = Object.create(Controller.prototype);
	SixButtonController.prototype.constructor = SixButtonController;

	function TouchController() {
		var self = this;

		Controller.call(this);

		this.on("$touchstart", function(data) {
			self.trigger('touchstart', data);
		});

		this.on("$touchend", function(data) {
			self.trigger('touchend', data);
		});

		this.on("$touchmove", function(data) {
			self.trigger('touchmove', data);
		});

		this.on("$touchleave", function(data) {
			self.trigger('touchleave', data);
		});

		this.on("$touchcancel", function(data) {
			self.trigger('touchcancel', data);
		});
	}
	TouchController.prototype = Object.create(TouchController.prototype);
	TouchController.prototype.constructor = TouchController;

	function getController(type, opts) {
		var btn, controller;

		if (!controllerTypes[type]) {
			throw new Error('Unsupported controller type, ' + type);
		}

		opts = opts || {};

		controller = new controllerTypes[type]();

		if (opts.enableKeyboard) {
			controller.enableKeyboard();
		}

		if (opts.buttons) {
			for (btn in opts.buttons) {
				controller.remapButton(btn, opts.buttons[btn]);
			}
		}

		return controller;

/*		return {
			on: controller.on.bind(controller),
			off: controller.off.bind(controller),
			once: controller.once.bind(controller),
			trigger: controller.trigger.bind(controller)
		} */
	}


	function requestController(type, opts) {
		var controller = getController(type, opts);

		global.$gameeNative.requestController(type);
		mainController = controller;
		
		return controller;
	}

	// currently only for keyboard alternate bindings
	function additionalController(type, opts) {
		var controller = getController(type, opts);
		global.$gameeNative.additionalController(type);

		return controller;
	}

	// public API
	gamee.controller = {
		requestController: requestController,
		additionalController: additionalController,
		trigger: function() {
			var i;

			if (mainController) {
				mainController.trigger.apply(mainController, arguments); 
			} else {
				throw new Error('No controller present');
			}
		}
	};
}(this, gamee));
