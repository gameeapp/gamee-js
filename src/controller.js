// var gamee = require('./gamee.js');
// var $gameeNative = require('./gamee_native.js');

var gamee = gamee || {};

(function(global, gamee) {
	'use strict';

	var BulletClass = Bullet.constructor,
		mainController, // global gamee controller 
		controllerTypes,
		additionalController;

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
	additionalController = getController;

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
