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

	/** 
	 * pause
	 */
	gamee.pause = function() {
		global.$gameeNative.pause();
	};

	gamee.onResume  = noop;
	gamee.onPause   = noop;
	gamee.onUnpause = noop;
	gamee.onStop    = noop;
	gamee.onRestart = noop;
	
	return gamee;
}(this);
