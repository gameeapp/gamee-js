/**
 * Shim for $gameeNative object
 */
(function(global) {
	'use strict';
	
	var gameeNative = {
			/**
			 * Update score 
			 *
			 * {String} score
			 */ 
			updateScore: function(score) {},

			/**
			 * Request controller
			 *
			 * {String} score
			 */
			requestController: function(type) {},

			/**
			 * Game over
			 */
			gameOver: function() {},

			/**
			 * Game start
			 */ 
			gameStart: function() {}
		},

		userAgent = navigator.userAgent.toLowerCase();

	if (
		/gamee\/[0-9\.]+$/.test(userAgent) || // test for android webview
		/iphone|ipod|ipad/.test(userAgent)    // test for iOS webview
	) {
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
	}

	global.$gameeNative = gameeNative;
}(this));

// var $gameeNative = require('./gamee_native.js');

var gamee = function(global) {
	'use strict';

	var gamee = {}, 
		score, 
		noop = function() {};

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
	 * pause
	 */
	gamee.pause = function() {
		global.$gameeNative.pause();
	};

	gamee.onResume = noop;
	gamee.onPause = noop;
	gamee.onStop = noop;
	
	return gamee;
}(this);

// var gamee = require('./gamee.js');
// var $gameeNative = require('./gamee_native.js');

var gamee = gamee || {};

(function(global, gamee) {
	'use strict';

	var BulletClass = Bullet.constructor,
		controller, // global controller
		controllerTypes;

	controllerTypes = {
		'OneButton': OneButtonController,
		'TwoButtons': TwoButtonController,
		'FourButtons': FourButtonController,
		'FiveButtons': FiveButtonController,
		'SixButtons': SixButtonController
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

		// TODO odstranit zavislost na jQuery/Zepto
		$(window).on('keydown', function(ev) {
			var button = keyCodes[ev.keyCode];

			if (!button) {
				return;
			}

			ev.preventDefault();
			self.trigger('keydown', {button: button.key});

		}).on('keyup', function(ev) {
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

	function requestController(type, opts) {
		var btn;

		if (!controllerTypes[type]) {
			console.error('Unsupported controller type, ' + type);
			return;
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

		global.$gameeNative.requestController(type);

		return controller;

/*		return {
			on: controller.on.bind(controller),
			off: controller.off.bind(controller),
			once: controller.once.bind(controller),
			trigger: controller.trigger.bind(controller)
		} */
	}

	// public API
	gamee.controller = {
		requestController: requestController,
		trigger: function() {
			if (controller) {
				controller.trigger.apply(controller, arguments); 
			} else {
				console.error('No controller present');
			}
		}
	};
}(this, gamee));
