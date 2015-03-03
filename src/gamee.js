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
	 * game start
	 */
	gamee.gameStart = function() {
		global.$gameeNative.gameStart();
	};

	gamee.onResume  = noop;
	gamee.onPause   = noop;
	gamee.onStop    = noop;
	gamee.onRestart = noop;
	gamee.onMute    = noop;

	// *deprecated* for backward compatibility
	gamee.onUnpause = function() {
		gamee.onResume();
	};
	
	return gamee;
}(this);
