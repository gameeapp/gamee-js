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

/**
 * Gamee interface for games (clients). It creates a `gamee` global
 * object to access comunicate with Gamee* platform.
 *
 * \* _later in the document Gamee will be referred as GameeApp to not
 * be mistaken for game_
 */
var gamee = function(global) {
	'use strict';

	var gamee = {}, 
		score, 
		noop = function() {};

	/**
	 * ## gamee.score
	 *
	 * Set or get the game score and update the score in the GameeApp.
	 *
	 * ```javascript
	 * gamee.score = gamee.score + 1;
	 * ```
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
	 * ## gamee.gameOver()
	 * 
	 * Indicate that game has ended to GameeApp. GameeApp will take the 
	 * focus and the game has to wait for `onRestart` or `onStop` 
	 * callbacks.
	 */
	gamee.gameOver = function() {
		global.$gameeNative.gameOver();
	};

	/**
	 * ## gamee.gameStart()
	 * 
	 * Indicate that game has been initalized and started.
	 */
	gamee.gameStart = function() {
		global.$gameeNative.gameStart();
	};

	// ## callbacks 
	// to handle signals from GameeApp
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

/** 
 * Controller object for gamee
 */
(function(global, gamee) {
	'use strict';

	var BulletClass = Bullet.constructor;

	// global gamee controller 
	var mainController; 

	var controllerTypes = {
		'OneButton': OneButtonController,
		'TwoButtons': TwoButtonController,
		'FourButtons': FourButtonController,
		'FiveButtons': FiveButtonController,
		'SixButtons': SixButtonController,
		'Touch': TouchController
	};


	/**
	 * Represenation of a controller button
	 */
	function Button(key, keyCode) {
		var self = this;

		BulletClass.call(this);

		this._pressed = true;

		// name of the controller 
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
