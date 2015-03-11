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
