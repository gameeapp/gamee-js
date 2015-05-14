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
