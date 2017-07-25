import { Bullet } from "../libs/bullet.js"

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
export var BulletClass = Bullet.constructor;


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
export function Button(key, keyCode) {
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
export function Controller() {
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
export function OneButtonController() {
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
export function TwoButtonController() {
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
export function TwoActionButtonsController() {
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
export function FourButtonController() {
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
export function FiveButtonController() {
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
export function SixButtonController() {
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
export function TwoArrowsOneButtonController() {
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
export function TwoArrowsTwoButtonsController() {
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
export function FourArrowController() {
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
export function TouchController() {
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
export function JoystickController() {
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
export function JoystickButtonController() {
	var self = this;

	JoystickController.call(this);

	// * __name__: 'button' 
	// * __key__: spacebar
	this.addButton(new Button('button', 32));
}
JoystickButtonController.prototype = Object.create(JoystickController.prototype);
JoystickButtonController.prototype.constructor = JoystickButtonController;