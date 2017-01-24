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
var gamee = function(global) {
	'use strict';

	/** internal state of the game score */
	var score;

	/** an empty function */
	var noop = function() {};

	/** ## gamee
	 *
	 * GameeApp interface for games. It is exposed as a `gamee` global
	 * object and games should only use its public methods and 
	 * properties to communicate with the GameeApp. 
	 *
	 * _There is also [$gameeNative](gamee_native.js.html) global object 
	 * which handles internal parts of the communication._
	 */
	var gamee = {};

	// 
	// ## Signaling game state 
	// 
	// The game should signal the GameeApp its status (playing/game-over)
	// and current score.
	//

	/** ### gamee.score
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

	/** ### gamee.gameOver
	 * 
	 * Indicate that game has ended to GameeApp. GameeApp will take the 
	 * focus and the game has to wait for `onRestart` or `onStop` 
	 * callbacks.
	 */
	gamee.gameOver = function() {
		global.$gameeNative.gameOver();
	};

	/** ### gamee.gameStart
	 *
	 * Indicate that player has started the game (even after restart).
	 */
	gamee.gameStart = function() {
		global.$gameeNative.gameStart();
	};

	/** ### gamee.gameLoaded
	 *
	 * Indicate that the game has loaded
	 */
	gamee.gameLoaded = function() {
		global.$gameeNative.gameLoaded();
	};

	// ## Controller
	//
	// To keep it light controller code is in [controller.js](controller.js.html)

	/** ### gamee.requestController
	 *
	 * See [controller.js#requestController](controller.js.html#requestcontroller)
	 */

	//
	// ## Callbacks - handling user action
	//
	// To handle signals from GameeApp you have to assinge callbacks to 
	// `gamee` object to react on user actions from GameeApp (outside the
	// game's webview/iframe).
	//
	// From the GameeApp user can
	//
	// * pause the game 
	// * resume the game after pause
	// * restart the game after game has ended with `gamee.gameOver()` call
	// * mute the game
	//
	// ```javascript
	// gamee.onPause = function() { 
	//   myGame.setState('pause'); 
	//   myGame.update();
	// }
	// ```

	/** ### gamee.onPause
	 *
	 * Will be called when user paused the game
	 */
	gamee.onPause   = noop;

	/** ### gamee.onStop
	 *
	 * Will be called when the user has closed the game
	 */
	gamee.onStop    = noop;

	/** ### gamee.onRestart
	 *
	 * Will be called when user will return the game after 
	 * `gamee.gameOver()` was called
	 */
	gamee.onRestart = noop;

	/** ### gamee.onMute
	 *
	 * Will be called when user clicks the mute button and the game should
	 * mute all game sounds.
	 */
	gamee.onMute    = noop;

	/** ### gamee.onUnmute
	 *
	 * Will be called when user clicks the unmute button and the game 
	 * should unmute all game sounds.
	 */
	gamee.onUnmute    = noop;

	/**
	 * *gamee.onUnpause*
	 *
	 * ***deprecated***
	 *
	 * for backward compatibility, use [onResume](#gamee.onresume) instead
	 */
	gamee.onUnpause = noop;

	/** ### gamee.onResume
	 * 
	 * Will be called after user resumes the game after pause or GameeApp
	 * suspension
	 */
	gamee.onResume = function() {
		gamee.onUnpause();
	};

	// 
	// ## Private methods
	//
	// These methods are only for internal use, should be avoided in games,
	// but it can be helpful for debugging.

	/** ### gamee._keydown
	 * 
	 * A helper function to listen for `keydown` events on window object.
	 * 
	 * @param {Function} fn callback to handle the event
	 */
	gamee._keydown = function(fn) {
		addDOMEvent(global, 'keydown', wrapKeyEvent(fn));
	};

	/** ### gamee._keyup
	 * 
	 * A helper function to listen for `keyup` events on window object.
	 * 
	 * @param {Function} fn callback to handle the event
	 */
	gamee._keyup = function(fn) {
		addDOMEvent(global, 'keyup', wrapKeyEvent(fn));	
	};

	// 
	// ## Private functions
	// 
	// These are internal helper functions in closed scope. Good to know
	// about them when debugging.
	
	/** ### addDOMEvent
	 * 
	 * Add an event listener for a DOM event
	 *
	 * @param {EventTarget} target an object to listen for a DOM event on
	 * @param {String} event event name
	 * @param {Function} fn callback to handle the event
	 */
	function addDOMEvent(target, event, fn) {
 		if (target.addEventListener) {
			target.addEventListener(event, fn, false);

		} else if (target.attachEvent) {
			target.attachEvent('on' + event, fn);
		}
	}

	/** ### removeDOMEvent
	 * 
	 * Remove an event listener for a DOM event
	 *
	 * @param {EventTarget} target an object to listen for a DOM event on
	 * @param {String} event event name
	 * @param {Function} fn callback to remove
	 */
	function removeDOMEvent(target, event, fn) {
		if (target.removeEventListener) {
			target.removeEventListener(event, fn, false);

		} else if (target.detachEvent) {
			target.detachEvent('on' + event, fn);
		}
	}

	/** ### wrapKeyEvent 
	 * 
	 * Handle old IE event differences for key events
	 * 
	 * @param {Function} fn callback
	 */
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


	// 
	// ## Gamee Web App
	// 
	// gamee.js handles also some specific requirements for the GameeWebApp

	if (global.$gameeNative.type === 'gamee-web') {

		// 
		// ### Key binding
		//
		// For user comfort the web app interface requires to react on 
		// certain keys within the game and the game should not override
		// them.
		//
		// * 'p' - for pause
		// * 'r' - for restart
		// 
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

		//
		// ### Interframe communication 
		// 
		// In the GameeWebApp games are inside iframe and are hosted on
		// different domains, therefor `postMessage`/ `on('message')` 
		// is used. This handles the callbacks send from the GameeApp.
		//
		// [More about *postMessage*](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
		addDOMEvent(global, 'message', function(ev) {
			switch(ev.data[0]) {
				case 'pause': 
					gamee.onPause();
					break;

				case 'resume':
					gamee.onResume();
					break;

				case 'restart':
					// after restart we have to steal the focus from parent frame
					window.focus(); 
					gamee.onRestart();
					break;

				case 'mute':
					gamee.onMute();
					break;

                case 'button_button_down':
                    gamee.controller.trigger("keydown", {button : "button"});
                    break;

                case 'button_button_up':
                    gamee.controller.trigger("keyup", {button : "button"});
                    break;

                case 'button_left_up':
                    gamee.controller.trigger("keyup", {button : "left"});
                    break;

                case 'button_left_down':
                    gamee.controller.trigger("keydown", {button : "left"});
                    break;

                case 'button_right_down':
                    gamee.controller.trigger("keydown", {button : "right"});
                    break;

                case 'button_right_up':
                    gamee.controller.trigger("keyup", {button : "right"});
                    break;

                case 'button_up_down':
                    gamee.controller.trigger("keydown", {button : "up"});
                    break;

                case 'button_up_up':
                    gamee.controller.trigger("keyup", {button : "up"});
                    break;

                case 'button_down_down':
                    gamee.controller.trigger("keydown", {button : "down"});
                    break;

                case 'button_down_up':
                    gamee.controller.trigger("keyup", {button : "down"});
                    break;

                case 'button_a_down':
                    gamee.controller.trigger("keydown", {button : "A"});
                    break;

                case 'button_a_up':
                    gamee.controller.trigger("keyup", {button : "A"});
                    break;


                case 'button_b_down':
                    gamee.controller.trigger("keydown", {button : "B"});
                    break;

                case 'button_b_up':
                    gamee.controller.trigger("keyup", {button : "B"});
                    break;

				default:
					// throw Error('Unknown message');
					
					// not sure why is this function running for unknown events
					console.error("Unknown message");
			}
		});
	}
	
	return gamee;
}(this);
