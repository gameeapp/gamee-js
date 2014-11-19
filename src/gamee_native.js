/**
 * Shim for $gameeNative object
 */
(function(global) {
	'use strict';
	
	var simulator,
		gameeNative = {
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
	} else if (
		window.parent && window.parent.gameeSimulator
	) {
		simulator = window.parent.gameeSimulator;

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
	}

	global.$gameeNative = gameeNative;
}(this));
